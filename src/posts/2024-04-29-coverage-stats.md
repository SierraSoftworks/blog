---
title: Fixing Coverage Stats
description: |
    Every now and then you'll find automated code coverage tooling getting in the way
    of you landing changes when you're pretty certain you've written tests for the code
    in question... Let's talk about how code coverage works and what you can do to unblock
    yourself.

date: 2024-04-29 12:00:00
permalinkPattern: :year/:month/:day/:slug/
categories:
    - development
tags:
    - testing
    - code-coverage
---

# Fixing Coverage Stats
Every now and then you'll find automated code coverage tooling getting in the way
of you landing changes when you're pretty certain you've written tests for the code
in question.

Let's take some time to dig into how code coverage works and then use that new knowledge
to find ways to unblock ourselves.

<!-- more -->

## How Code Coverage Works
The first thing we need to understand when approaching any problem is how the tools
we rely on work. In this case, we're relying on line coverage information to determine
whether a pull request has a suitable degree of test coverage.

The challenge we're going to face here is that while the tooling may well represent
coverage in terms of lines covered, most code coverage tools work on the compiled code itself
(and this usually doesn't care for line numbers).

Let's take two examples to illustrate the point. We'll start with an example which
uses binary operators to determine whether a person should go outside:

```csharp
public bool ShouldGoOutside(Time timeOfDay, Weather weather, Calendar schedule)
{
    return timeOfDay.IsDaylight()
        && weather.IsSunny()
        && !schedule.HasEvent();
}
```

If we write a test suite which validates that this method works correctly for for possible
values of `timeOfDay` and `weather` but misses `schedule` we'll quickly find that the line
coverage for the first example will be either 0% or 100% (depending on whether the tooling
you're using counts partial line coverage as covered or not).

The reason for this is that the compiler is transforming your code into an Abstract Syntax
Tree (AST) and it is this AST which is then annotated with coverage information by tracking
when each node is visited during test execution. In most cases, for performance reasons, the
code coverage tooling will optimize this and instead only track statement and branch coverage
(allowing it to keep track of far fewer nodes in the AST and therefore reducing the performance
impact of running your tests with coverage enabled).

For the code above, the AST would look something like this:

```mermaid A diagram showing the AST for the one-line version of the ShouldGoOutside method.
flowchart LR
    classDef covered stroke:#2a2,stroke-width:3px;
    classDef partial stroke:#aa2,stroke-width:3px;
    classDef missed stroke:#a22,stroke-width:3px;

    ShouldGoOutside --> Return
    subgraph "Line 3-5"
        Return:::covered --> And1[AND]
        And1:::covered --> IsDaylight["timeOfDay.IsDaylight()"]:::covered
        And1 --> And2[AND]
        And2:::partial --> IsSunny["weather.IsSunny()"]:::covered
        And2 --> Not[NOT]
        Not:::covered --> HasEvent["!schedule.HasEvent()"]:::covered
    end
```

From this AST, we can see that one of our AND (`&&`) operators is only being partially
covered (because one half of the expression is always `true` or always `false`). This
partial coverage of the statement is then reported as partial coverage for the lines
that the statement appears on (in this case, Lines 3, 4, and 5).

When we then attempt to calculate how much of our code is covered by tests (taking into account only
code which is executable - not things like comments, control sequences, etc.) we find that the most
effective way to do that is to calculate the percentage of *statements* which have been covered.
In this case, we have only one statement and it is partially covered, so we can either report it as
0% coverage or 100% coverage (even though we've covered 2/3rds of the branches in the statement fully).

If we instead write the same code in a much more verbose manner, we can leverage the
statement-level coverage tracking provided by our code coverage tooling to better visualize
what has been covered and what hasn't (highlighted lines have full coverage):

```csharp{3,5,8,10,18}
public bool ShouldGoOutside(Time timeOfDay, Weather weather, Calendar schedule)
{
    if (!timeOfDay.IsDaylight())
    {
        return false;
    }

    if (!weather.IsSunny())
    {
        return false;
    }

    if (schedule.HasEvent())
    {
        return false;
    }

    return true;
}
```

When the compiler generates the corresponding AST (with coverage annotations) for this code,
we find something like the following:

```mermaid A diagram showing the AST for the verbose version of the ShouldGoOutside method.
flowchart LR
    classDef covered stroke:#2a2,stroke-width:3px;
    classDef partial stroke:#aa2,stroke-width:3px;
    classDef missed stroke:#a22,stroke-width:3px;

    ShouldGoOutside --> Line3
    subgraph Line3
        If1[IF]:::covered
        If1 --> IsDaylight["timeOfDay.IsDaylight()"]:::covered
    end

    Line3 --> Return1
    subgraph Line5
        Return1[Return]:::covered
        Return1 --> Const1[false]:::covered
    end

    Line3 --> Line8
    subgraph Line8
        If2[IF]:::covered
        If2 --> IsSunny["weather.IsSunny()"]:::covered
    end

    Line8 --> Return2
    subgraph Line10
        Return2[Return]:::covered
        Return2 --> Const2[false]:::covered
    end

    Line8 --> Line13
    subgraph Line13
        If3[IF]:::partial
        If3 --> HasEvent["schedule.HasEvent()"]:::covered
    end

    Line13 --> Return3
    subgraph Line18
        Return3[Return]:::missed
        Return3 --> Const3[false]:::missed
    end

    Line3 --> Return4
    Line8 --> Return4
    Line13 --> Return4
    subgraph Line20
        Return4[Return]:::covered
        Return4 --> Const4[true]:::covered
    end
```

In this case, calculating statement coverage gives us a much more granular view of what has been
covered and what hasn't. In this case, we cover 6/7 statements (85% coverage) and 2/3 branches fully
(67% branch coverage).

## What That Means for Us
In the example above, we know that part of the problem is a lack of test coverage for a critical portion
of the `ShouldGoOutside` method (namely its `Calendar` integration). The right move here is almost certainly
to add coverage for the missing branch, however there are scenarios where this becomes cost prohibitive and
is not necessarily the right move.

Let's consider C#'s null-propagation operator (`?.`) as an example. If we have a method which uses this operator
to gracefully handle `null` values then we're very likely to find our code coverage tooling reporting this as a
branch (which it expects to be covered by tests). While this may indeed be technically correct, it also runs the
risk of massively increasing the number of test variations which need to be created to exercise all possible code
paths.

Instead, you may find that a better approach is to refactor your code to decompose compound expressions (such as
the one in the first example) into multiple statements which will have their code coverage tracked independently.
While this will not increase the test coverage of your code, it will make understanding what covered much easier.
