---
title: Solving Hard Problems
description: |
    Advent of Code 2023 has just kicked off, and I'm going to try something a bit
    different this year, I'm going to try and share useful concepts and patterns
    that play a role in solving each day's puzzle.

    Today, I wanted to share a little bit of how I approach solving hard problems,
    and specifically how I set things up to make it easier to remain engaged in the
    face of ongoing challenges.

date: 2023-12-06T00:00:00.000Z
permalinkPattern: :year/:month/:day/:slug/
categories:
  - development
  - advent-of-code
tags:
  - rust
  - advent-of-code
  - development
---

# Solving Hard Problems
Advent of Code 2023 has just kicked off, and I'm going to try something a bit
different this year, I'm going to try and share useful concepts and patterns
that play a role in solving each day's puzzle.

Today, I wanted to share a little bit of how I approach solving hard problems,
and specifically how I set things up to make it easier to remain engaged in the
face of ongoing challenges.

I think this is particularly relevant to Advent of Code, because the puzzles
continue to get harder each day and at some point all of us will struggle with
a problem that we just can't seem to get a solution for. I find that having a
process for remaining engaged in the face of a challenge is a superpower that
will help you grow beyond what you thought you were capable of.

<!-- more -->

## What makes a problem hard?
I think it's important for us to start out by talking a little bit about what
makes a problem difficult in the first place, because without understanding
this, it's going to be find ways to overcome them.

In my experience, hard problems are rarely hard for a single reason, but rather
they consist introduce several challenges, the combination of which leaves us
more likely to fail to solve the problem. These can be technical complexity,
external constraints, ambiguity, or a lack of motivation.

Each of these factors on their own can transform a simple problem into one that
requires special effort to solve, but when combined they can quickly lead to
us giving up on a problem entirely.

### Technical Complexity
The first, and easiest to understand, is technical complexity of a problem. These
are problems where you have a clear understanding of what you need to do, but
the specific steps required to do it are complex and difficult to complete.

Whether this requires skills that you are in the process of developing, or
knowledge that you don't yet have, the beauty of technically complex problems
is that they represent an opportunity for growth and in the absence of any
other challenges, are often what we actively look for in our work.

That said, a technically complex problem can quickly become overwhelming if
you add other challenges to the mix - and that same opportunity for growth can
instead become a source of frustration and anxiety.

> If only I knew this already then I could finish it and move onto the other
> things I need to do...

I find that when I'm faced with technical complexity, the best thing I can do
is identify which aspects of the complexity are elective and which are required
by the problem at hand. I'm guilty of often feature creeping my solutions, with
the inevitable result being that there is more complexity involved in solving
the problem than the base problem requires.

Advent of Code is great for highlighting this, because the best possible solution
to a problem is often not the most straightforward one and the puzzle writers have
a tendency to add several orders of magnitude to the computational complexity of
problems in Part 2. Deciding when it's worth spending an extra 30 minutes refactoring
your solution to make it optimal for the type of problem vs. just letting your CPU
churn away for a few minutes is the perfect example of this.

Just like in Advent of Code, being able to spot when elective complexity is going
to pay off vs. when it's going to slow you down is part skill and part luck. We can
improve our odds by gathering additional information, and there are few ways better
than incremental delivery. So, when you've got the option, delivering small pieces
of the solution at a time is almost always going to be better than trying to deliver
the whole thing at once.

### External Constraints
The next challenge is external constraints. These can be in the form of the
time available to solve a problem, the tools/approaches you have available to you,
the laws of physics, and sometimes even the problem specification itself.

These are the challenges that we often have the least control over, and often
intersect with the problem of what we'd like to do vs. what we must do. Truthfully,
I've had several years of Advent of Code where I've not finished because of this.

For me, solving this really comes down to prioritization and communication. If
I know that I've got several difficult problems to solve, knowing which ones
can be skipped and which ones must be solved lets me create enough space to
focus on what's critical.

Similarly, if I know that we have constraints around
how we approach solving problems (tools, processes, policies, etc) then
understanding how important each of those constraints is and how it trades off
against the problem at hand (both in the short and long term) allows me to
make informed decisions about which corners to cut and which ones not to.

I've recently been talking about how one of the key skills of an engineer is
understanding how to make trade-offs. There's a great quote which goes something
to the effect of:

> Anyone can build a bridge, it takes an engineer to build a bridge that just barely
> stands.

That need to find the right balance of trade-offs to deliver a solution that
moves you forward while not compromising on the things that are important is
a skill that takes time to develop, but it is also one that you can practice
in your day to day.

It's also, crucially, something that you should almost never do alone. Communicating
what you're doing, why, and what you're trading off against is every bit as
critical as the decision itself. It lets you ask for more time on a project
(with solid justification), or get help from others, or enable others to understand
if you decide not to do something you promised them.

Of course, the hardest stakeholder to break the news to is often yourself, and
learning to be okay with telling yourself *"I'm not going to get to this one,
and that's okay"* is something I'm still working on.

### Ambiguity
Ambiguity is another one of those challenges that can be frustrating to deal with,
most notably because in the presence of ambiguity all of the other challenges
are not only more likely to arise, but are also harder to deal with.

> If I don't even know what I'm supposed to do, how can I possibly give an estimate
> for when it'll be done?!
>
> &nbsp;&nbsp;&mdash; Every engineer during sprint planning

In many cases the solution to ambiguity is gathering more information, usually by
talking with people, but knowing how much information you need to gather before
setting off on a course of action is another one of those part skill, part luck,
part hard won experience things.

I've personally found that diving straight into a problem without giving it some
thought regularly results in suboptimal solutions, but I've also found myself
stuck in analysis paralysis and unable to make progress because I'm waiting for
a piece of information that is never going to arrive.

Fortunately, there's "one simple trick" that I've found helps me get unstuck,
and that is identifying the smallest unit of delivery that I can make progress
on to get additional information. On ambiguous projects, that usually means
finding the area I'm least confident about and tossing together a proof of
concept solution to see if it's even possible and learn where it fails.

The second part of this is talking to others: never underestimate the value of
an alternate perspective in helping you spot a path you've missed. I've regularly
been caught waxing lyrical about how the best skill an engineer can have is the
ability to talk with people and communicate their ideas effectively, this is
one of the reasons why.

### Lack of Motivation
This brings us to the absolute worst challenge of them all: lack of motivation.
As people, we have a tendency to blame ourselves or others for lacking motivation,
but in my experience this ignores the fact that motivation is a by-product of our
environment and our interpretation of that environment.

In other words, if you take anybody and place them in an environment where they
don't believe they'll be able to achieve their desired outcome, they're going
to eventually become demotivated. Conversely, if you take someone who is struggling
with motivation and give them the ability to make progress towards a goal of theirs,
they'll often find that being motivated is easy.

The wonderful part about this is that creating environments which are conducive
to motivation is something that we've got a surprising amount of control over,
because visible progress towards your goals isn't simply a matter of how much
progress, but also how visible that is. Surfacing incremental progress, no matter
how small, is a great way to keep yourself motivated.

This brings me to the start of today's post: using (kinda) Test Driven Development
to highlight your progress towards solving a problem.

## Test Driven Development
[Test Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
(commonly abbreviated to TDD) is a development pattern which originated out of
the '90s-era Extreme Programming movement and if you go looking for books on how
to do it you'll invariably find the prescriptive approach of "don't write any code
without a failing test to justify it" being toted around.

I personally am not going to advocate for using TDD to justify every line of code
you write, but rather to create an environment where you can see yourself making
progress, iterate quickly, learn from your (intentional) mistakes, and ultimately
solve hard problems more easily.

With that in mind, I'm going to suggest that there are a few key things you're
going to want to setup for your development workflow.

1. **A test framework for your language of choice**

   Ideally, this should be something that is easy to use and has solid support
   for explaining what failed within a test (i.e. a good assertion library).
   It should also be something that can, ideally, be run extremely quickly
   (from the command line or within your IDE).

1. **A way to run your tests automatically when files change**

   This is the key to making this work, because it lets you see your progress
   as you make it. Depending on your language of choice, there are a few ways
   to do this, but some of the common ones I rely on are:

   - [`cargo watch -x test`](https://crates.io/crates/cargo-watch) for Rust projects.
   - [`dotnet watch test`](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-watch) for .NET projects.
   - [`python -m pytest-watch`](https://pypi.org/project/pytest-watch/) for Python projects using `pytest`.
   - [`npx jest --watch`](https://jestjs.io/docs/cli#--watch) for JavaScript projects using `jest`.

With these in place, your development loop should roughly look something like this:

```mermaid
# A circular diagram showing how one writes a piece of code, runs into a problem,
# writes a test to reproduce the problem, fixes the problem, and then repeats the process.

graph LR;
    A[Write some code] --> B[Run into a problem];
    A --> E[Identify expected behaviour];
    B --> C[Write a test to show it];
    E --> C;
    C --> D[Modify code until test passes];
    D --> A;
```

How much code you write before writing your first test is entirely up to you, I often find myself
writing a first attempt at a solution and then writing tests for a few of the behaviour and edge
cases I can think of.

One of the cool pieces of insight that I've gained from this is that the most value I get from test
suites isn't proving that code works, but rather helping me debug why it doesn't work. Being able to
quickly reproduce a problem in the test suite and then iterate on a solution, getting feedback about
when I've fixed it within a few seconds, makes solving bugs an absolute joy.

The reason this works so well is that we're taking an abstract, often time sensitive, technically complex
problem that we're often not particularly motivated to solve and breaking it into a series of small,
incremental, visible victories that we can work our way through.

1. **Write a test that shows how the bug happens**

   This is usually a pretty quick process if we have a stack trace or error message to work with,
   since we can write test cases to validate each of our hypotheses about why the code might be
   failing and immediately see when we've found the right one.

1. **Make changes to the code to fix the bug**

   This is where the magic happens, because we can make changes to the code and immediately see
   if we've fixed the problem or not. If we haven't, we can make more changes and try again.

1. **Confirm that everything else still works**
   This is also where we can start to see the added value of the test suite, because we can make changes
   to the code and immediately see if we've broken something else. It also means that if we do
   break something else, we've got an automated debug helper pointing out what broke and why.
   The more granular your tests, the easier it is to understand the cause of the problem and how
   to fix it (hence the benefit of unit testing over end-to-end testing for this scenario).

Contrast this with the original problem: "there's something wrong with the code and I need you to fix it"
and tell me which sounds like more fun to you? This same pattern applies to solving any problem, including
Advent of Code puzzles.

The last nugget I'll leave you with is that if you're finding yourself stuck, see if you can break
the problem into smaller chunks (ideally with their own tests to prove that each chunk works correctly)
and you'll not only find that it's more fun, but also that you're far more likely to make progress towards
a solution.

## Wrapping Up
Solving hard problems is both the best and worst part of being an engineer. Taking care of your mental
health and setting up your environment to create the necessary conditions for success is something that
we should all do consistently. While TDD isn't going to magically make all of your problems easy, the
pattern of breaking problems down into smaller chunks and iterating on them quickly is one that scales
far beyond writing code and I hope you'll find it useful.

A final closing thought from my side: good things take time, and that's okay. As engineers, we're playing
an infinite game, and continuing to play is far more important than any single victory along the way, so
be gentle with yourself and everyone else on this journey with us.
