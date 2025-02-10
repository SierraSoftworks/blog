---
title: Creating a Task in .NET
description: |
  Today I found something surprising - a piece of code in C# which awaited a `new Task(...)`
  and which achieved its goal, but did the opposite of what I expected. Indeed, instead
  of the task running to completion, it instead never completed. In this post I'll share
  some interesting empirical observations about how this works and talk about how this
  differs from asynchronous execution systems in other languages.

date: 2024-11-26 20:00:00
permalinkPattern: :year/:month/:day/:slug/
categories:
    - programming
tags:
    - csharp
    - programming
    - async
---

# Creating a Task in .NET
Today I found something surprising - a piece of code in C# which awaited a `new Task(...)`
and which achieved its goal, but did the opposite of what I expected. Indeed, instead
of the task running to completion, it instead never completed. In this post I'll share
some interesting empirical observations about how this works and talk about how this
differs from asynchronous execution systems in other languages.

<!-- more -->

## Where this Started
A colleague of mine was working on adding test coverage for some interesting edge conditions
in a workload scheduling system, and while we had an existing mock for cases where the workload
was completed immediately, we didn't have one for cases where the workload was indefinitely incomplete.

```csharp
// This is the mock we had for workloads which complete immediately
class ImmediatelyCompletedWorkloadMock : IWorkload
{
  public async Task RunAsync()
  {
    return Task.CompletedTask;
  }
}
```

Their implementation did something I hadn't seen before, it constructed a `new Task(...)`.

```csharp
// This is the mock they wrote for workloads which never complete
class NeverCompletedWorkloadMock : IWorkload
{
  public async Task RunAsync()
  {
    return new Task(() => { });
  }
}
```

My thought process reviewing this code went something like this:

 - "This is not something I see often, it seems like they're constructing a no-op task, isn't `Task.CompletedTask` the idiomatic way to do that?"
 - "They're trying to ensure that the `Task` never completes, so how would that work at all if the associated action returns immediately?"
 - "The tests are passing, so this clearly does work, that means I am missing an understanding of how this works under the hood."
 - "I think the idiomatic approach here would be to use `Task.Delay(...)`, and now let's go learn something..."

## Reproducing the Behaviour
My first step when I am faced with behaviour I don't understand, like this, is to create a minimal reproduction of that
behaviour which I can then use to confirm that my understanding of the cause is correct. In this case, my approach
involved building a small C# console application using `dotnet new console` and the following code:

```csharp
Console.WriteLine("Before Task.CompletedTask");
await Task.CompletedTask;
Console.WriteLine("After Task.CompletedTask");

Console.WriteLine("Before new Task(...)");
await new Task(() => { });
Console.WriteLine("After new Task(...)"); // Never executed
```

When I ran this code, I saw the following output, with the process hanging indefinitely after the "Before new Task(...)" line.

```
Before Task.CompletedTask
After Task.CompletedTask
Before new Task(...)
```

Okay, so that confirms that the behaviour I observed in the original code was not a fluke, and that there is something
preventing our `new Task(...)` from completing.

I happen to know that the common way to dispatch an action onto the `Task` queue is to use `Task.Run(...)`, and indeed, if
we update our code to use that instead of `new Task(...)`, we see the expected behaviour.

```csharp
// This code snippet works correctly and runs to completion, printing both lines
Console.WriteLine("Before Task.Run(...)");
await Task.Run(() => { });
Console.WriteLine("After Task.Run(...)");
```

So what makes `Task.Run` special? Well, if we look at the documentation for `Task.Run`, we see the following:

> The [`Task.Run`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.run?view=net-9.0) method
> provides a set of overloads that make it easy to start a task by using default values. It is a lightweight
> alternative to the [`Task.StartNew`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskfactory.startnew?view=net-9.0) overloads.

Digging into `Task.StartNew`, we see (amongst other important notes) the following:

> Use the `Task.StartNew` method [...] in scenarios where you want to control the following:
>
>  - [...]
>  - The task scheduler. The overloads of the `Task.Run` method use the default task scheduler. To control the task scheduler,
>    call a `Task.StartNew` overload with a scheduler parameter. For more information, see
>    [`TaskScheduler`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskscheduler?view=net-9.0).

Okay, that's interesting - so there's logic involved in both `Task.Run` and `Task.StartNew` which leverages the
`TaskScheduler`, and it would likely be fair to assume that failing to schedule a task would prevent it from
being executed - that might explain why the task isn't completing.

To confirm this, let's see if we can manually schedule our `new Task(...)`. Looking at the internals of
the [`TaskScheduler`](https://github.com/dotnet/runtime/blob/5535e31a712343a63f5d7d796cd874e563e5ac14/src/libraries/System.Private.CoreLib/src/System/Threading/Tasks/TaskScheduler.cs)
which are mercifully available on GitHub, we can see that there's a `TaskScheduler.InternalQueueTask`
method which appears to be used for task scheduling itself. Since this is an `internal` method, we're
going to need to use reflection to access it (so this is absolutely not the way to do this, but for an
educational experiment there's no harm).

Let's update our code to try scheduling our task and see what happens:

```csharp
var taskSchedulerType = typeof(TaskScheduler);
var internalQueueTaskMethod = taskSchedulerType.GetMethod("InternalQueueTask", BindingFlags.NonPublic | BindingFlags.Instance);

Console.WriteLine("Before new Task(...)");
var task = new Task(() => { });
internalQueueTaskMethod.Invoke(TaskScheduler.Current, new object[] { task });
await task;
Console.WriteLine("After new Task(...)");
```

And indeed, running this code results in the task completing and the "After new Task(...)" line being printed. That
confirms our hypothesis that the `new Task(...)` fails to complete because it has not been scheduled, and that it
is necessary to schedule the task (using the `Task.Run(...)` method in practice).

## Simplified Mental Model
The easiest way to think about a `Task` in .NET is that it represents the state of something which may be executed
by a `TaskScheduler`, rather than the execution itself.

```mermaid A diagram showing how your code reads the state of a Task while the TaskScheduler updates the state.
flowchart LR
    code[[Your Code]] --Reads State Of--> Task[/Task/]
    Task -.Is Scheduled On.->TaskScheduler(TaskScheduler)
    TaskScheduler --Updates State Of-->Task
```

As such, if we neglect to schedule the `Task`, we're simply left with the following:

```mermaid A diagram showing how your code reads the state of a Task which has not been scheduled, with no means of updating the state.
flowchart LR
    code[[Your Code]] --Reads State Of--> Task[/Task/]
```

## How this differs to other languages
Of course, if you come from a different language, this might surprise you. Certainly, many languages don't discriminate
between the action of creating a `Task` (or equivalent) and scheduling it for execution.

In JavaScript, for example, you may construct a `Promise` and then immediately `await` it - with the construction of
the promise ensuring that the provided callback is invoked. As a matter of fact, you don't even need to `await` the
`Promise` for it to be executed (although if there are any exceptions thrown, they will be unhandled and will trigger
the global `unhandledrejection` event, which is generally not what you want).

```javascript
await new Promise((resolve) => resolve(null));
```

Similarly, in Rust we simply await a `Future` and the scheduling happens by virtue of the `.await` keyword, however here
the `Future` itself is polled by the parent `Future` through the `.await`, and will not execute unless awaited (indeed,
recursive cancellation of `Future` subtrees in Rust is handled by simple ceasing polling of the parent node).

```rust
let future = async { };
future.await;
```

I find each of these approaches, with their distinct approaches to asynchronous scheduling and execution, and the associated
trade-offs to be fascinating - and being aware of these differences can help you reason about hidden execution quirks in your
code.
