---
title: Building Dashboards
description: |
    Building good dashboards for the services you operate can seem like a
    daunting prospect, let's see if we can make it a bit easier to reason
    about.
date: 2021-03-30T22:14:00Z
permalinkPattern: :year/:month/:day/:slug/
categories:
    - sre
    - observability
tags:
    - sre
    - observability
---

# Building Dashboards
Dashboards are one of those things which sound easy to get right on the surface,
but often fall short of expectations. In the majority of cases, my experience has
been that they, at best, do not support an investigation and at worst can actively
hinder it.

That is a huge pity, because when they are done well, dashboards can be one of your
most powerful tools for showcasing the current state of your system and enabling
engineers to rapidly track down failures.

<!-- more -->

Since I've spent so much time complaining about dashboards in the wild and building
my own to replace them, I figure it's probably time for me to distil my approach
into something that others can adopt. Consider this my first pass at explaining
how I build dashboards and realize that it is a living document which will, no doubt,
grow and evolve as I find better ways to articulate the process.

## The Fundamentals
Before we dive into building dashboards, I want to first talk about some of the
fundamental building blocks which have informed by approach. Without these, you
will likely end up with dashboards which, while informative, don't truly help
engineers understand the system or how to resolve problems with it.

### Service Level Indicators
SLIs are the numeric, measurable, representations of your service's delivery on
stakeholder asks. Put another way, they provide you with a means to quantify how
well your service is completing its fundamental mission.

If that doesn't make sense, then ask yourself this: "Why did `$stakeholder` ask me
to build this service?". The answer to that question, when you find a measurable
numeric representation of it, is your SLI.

Your service might have more than one SLI, but fundamentally they should be
representations of how satisfied your stakeholders are with the service. Many
teams get distracted by what others have used: measurements like
latency, availability, and bounce rate. These measurements might be valuable for
you too, but you should decide that based on what your stakeholders have told you,
rather than because someone else used them.

When considering whether something will make a good SLI, ask yourself whether
your stakeholders would move to a different system if you failed to deliver on it.
If the answer is "no", it's not a good SLI. Conversely, just because you have
something which correlates with customers leaving, it doesn't mean you've found
and SLI - **correlation is not causation**.

::: warning
> We should use CPU utilization as an SLI because when it goes above 80% our customers get unhappy.

**NO!** Your customers do not care what your CPU utilization is, they care about
something which might be influenced by your CPU utilization and you should measure
that instead. That might be slow responses, increase failure rates or greater
variance in execution times, but *you need to understand what your customers care about
before you can define an SLI*.
:::

Assuming that you've spoken with your stakeholders, identified the critical things
they care about and have managed to find numeric measurements for them (or good proxies),
you now have the start of a good dashboard. Unfortunately, just identifying that there
is something wrong usually isn't enough - we need to know what is wrong and how
to fix it.

### Decision Trees
That brings us neatly to [decision trees](https://en.wikipedia.org/wiki/Decision_tree).
For those who haven't encountered them before, they are a tool to represent an sequence
of decisions in a hierarchical structure. For those with a computer science/engineering
background - this is something akin to binary searching for a solution instead of linear
searching.

While you are more than welcome to put together a full decision tree for your service,
I'm not advocating for that. Instead, I'd like you to consider what an engineer is looking
to achieve when they open your dashboard. In most cases, their thought process will look
something like this:

<FileTree>

 - **START**
   - Everything looks okay
     - &rarr; **Relax** :heart:
   - Something looks broken
     - Segment 1 looks broken
       - &rarr; **Investigate Segment 1** :+1:
     - Segment 2 looks broken
       - &rarr; **Investigate Segment 2** :+1:
     - Segment 3 looks broken
       - &rarr; **Investigate Segment 3** :+1:
     - I can't see a broken segment
       - &rarr; **Randomly look for more info** :-1:
</FileTree>

In this world, our best case scenario is that there is nothing untoward happening. But
failing that, we want the engineer to immediately have a good idea of what the state
of the system is and what their next steps to mitigate the problem should be. What we
definitely don't want is a situation where they are left knowing that there is something
wrong, but with no indication of what or why.

#### Coverage vs Granularity
That final state (*something is wrong, but I can't see what*) is usually a side effect
of missing information. Realistically, there is only so much information we can cram onto
a single dashboard before it becomes unusable and so there always needs to be a trade off
here. To be explicit about it, the trade off is between granularity and breadth of coverage.

To mitigate this, we can focus on measuring the inputs and outputs of the portion of the
system that the dashboard is representing. By focusing on these top-level inputs and outputs,
we avoid falling into the trap of trading coverage for granularity.

::: tip
It is uniformly better to know where the problem is and need to go to another dashboard
or data source to narrow that down further than it is to not know that there is a problem there.
:::

Many modern dashboard tools support variables/templates/filters and these can enable you to
rapidly create a large number of (virtual) dashboards to provide increased granularity at a
given layer. But be careful about how you use these features, as relying too heavily on them
can greatly reduce the value provided by each dashboard.

### Human Psychology
One thing humans are great at is spotting patterns and anomalies. Your dashboards
should take advantage of this by presenting information such that anybody can quickly
point to the "weird" part.

::: tip
When the system is operating normally, your dashboards should look boring. **When things
are broken, your dashboards should look interesting.**
:::

It is also important to recognize the implicit associations that many humans have adopted.
Carefully choosing your colours to highlight good and bad on your dashboards can greatly
reduce the time taken to interpret information. If you find that your data doesn't benefit
from an existing association, at the very least try to be consistent with your use and
support the building of those associations. Choose colours, icons, graph modes and placement
deliberately.

::: warning
Remember that about 5% of the population has some degree of colour vision deficiency and,
given various systemic issues in our industry, that figure rises to about 8% within computer
engineering professions. That means you, statistically, have a co-worker or friend who
you should consider (and consult) when choosing colour palettes.

**Some modern web browsers include colour vision deficiency emulation modes in their developer
tools and this can be an extremely useful way to test your dashboards before releasing them.**
:::

## The Process
Now that we've covered the fundamentals, let's talk about how you should apply them
to create your dashboard(s). The four areas I call out here aren't sequential, but
rather the key things you should invest in for each dashboard you build.

::: tip
Remember that you are not building dashboards for you today, but rather for your intern, new-hire
and 3am on a Sunday when the world is on fire. If someone from a different team can't quickly
understand what's going on with your service, they aren't yet "good".
:::

### Show your SLIs
The first thing you want to know when looking at a dashboard is "Does this show me that my
customers are happy?". If you can't answer that question within the first 5 seconds of looking
at a dashboard then how are you going to know that you should look more closely at it?

> Does this show me that my customers are happy?

From reading the [fundamentals of SLIs](#service-level-indicators) above, you know that
these represent your system's delivery on stakeholder expectations. Presumably, your goal
is to ensure that you continue to deliver on them, so placing your key SLI(s) front and
center can immediately set the context for an engineer.

::: tip
Showing your key SLI(s) on your dashboards also means that they immediately become something
that stakeholders can consumer directly - freeing up time you would otherwise need to spend
explaining the state of your service to people.
:::

Of course, the SLIs on their own only tell you that your customers are (assuming the worst)
unhappy with your service. The goal is to find out what to do about it.

### Show your progress
The best way I've found to rapidly transition from high-level customer impact to concrete
next steps is to break the delivery of an SLI into a sequence of checkpoints. Measuring our
service's delivery at each of those checkpoints allows us to visualize where in this process
things start to diverge from our expected behaviour.

This checkpoint process will be familiar to anyone who has used milestones to keep track
of a project's progress to delivery and they operate almost identically here. Good places to
insert them are on functional or system boundaries, as these are places where instrumentation
can often be found or easily added.

::: tip
In systems which are natural pipelines (A &rarr; B &rarr; C), measuring the flow rate between
each stage is a powerful way to detect anomalies. This applies to pipelines which fork as well.

We can often represent more complex systems as pipelines and doing so can provide us
with a clear vision of where to measure progress as well as where to look when things go wrong.
:::

In larger and more complex systems, the delivery of an SLI may involve numerous distinct
sequences, however we are not (at this level) particularly interested in each unique sequence
but rather in the aggregate ability of the service to deliver on an SLI. If you need to show
checkpoints which are only hit for a subset of your sequences, do so and *call explicit attention
to this fact*.

The goal of these checkpoints is to provide an engineer with the context they need to quickly
identify which stage is failing to deliver towards the SLI. Often, this is indicated by a
given stage's successful outputs being lower in count than is expected. The beauty of this
approach is that any "lost" events are clearly visible in their absence, allowing us to measure
things for which we have no counters.

::: warning
I have seen many systems fall into the trap of assuming that their telemetry is omniscient. If
you've ever seen your request rate drop as a result of an outage, you know how big of a lie this
is.

Accurately measuring end-to-end stakeholder asks and deliverables is (almost) impossible, but
by pushing our "input" and "output" measurements as close to the stakeholder as possible we
can alleviate some of this "lost" visibility, but capitalizing on it means acknowledging that
your systems can and will lie to you.
:::

In order to select good checkpoints, you will need to fundamentally understand how your
system is expected to operate and the process it follows to achieve that. The earlier into
the design process this is considered, the easier the problem becomes to solve. The engineers
responsible for designing the system should ideally be the same engineers designing how it is
instrumented and what behavioural constraints define normal operation.

If you have constructed this portion of your dashboard well, then an engineer who sees that
there is a customer impacting problem will rapidly be able to identify which segment of your
process is failing to deliver on your SLI(s). But simply knowing that there is something
wrong in a portion of the service doesn't immediately help solve the problem.

### Show me what to look for
To convert an understanding about (broadly) where a problem is occurring into an idea about
what is failing and why, we need to add more context. This is where it is critical to remember
that you are not building dashboards for yourself on a good day, you're building them for
someone's worst day.

::: warning
I often see dashboards which lump a dozen graphs onto a single page without any context
or documentation. These are the dashboards I (almost) never go back to because they do
not give me a useful idea about what is happening within the system or what I can do about
it.

When this approach becomes pervasive, you will see teams shift to using other tools to
troubleshoot problems - sometimes avoiding dashboards altogether and relying on log searches
or hand-written metric queries. **This is a major red flag as it means that individual experience
is the key factor in responding effectively to an incident.**
:::

Most modern dashboard systems allow you to add text to your dashboards and I find it hard
to overstate the value in doing so. This text allows you to, among other things, tell someone
looking at the dashboard what each graph represents, why it is there and what information
they can hope to glean from it. You can explain how interactions between system components
behave and what is implied by a some common shifts.

::: tip
If you have them: links to your architecture, source code, accounts and other dashboards
can greatly reduce the time taken to understand a failure. Place these on your dashboards
and adopt a standard layout for them so that engineers can quickly find what they need.
:::

The goal with this is to allow someone who sees an anomaly in your graphs to read about
what that means (without leaving the dashboard, ideally) and build an understanding
of what the current system state is and what that implies about its behaviour. Your
more experienced engineers might already know what to do about this, but remember that
we're not building these dashboards for them - we're building them for your new hires
and interns too.

### Show me what to do about it
When your engineers understand what the system is doing and how that is resulting in
a failure, the final step is supporting them in mitigating the issue as quickly as
possible. I'm a firm believer that anything which can be written in a TSG should
really be automated and that humans should only be involved when insightful decisions
need to be taken, but unfortunately we don't live in that reality. So, in deference
to practicality, the final thing your dashboards should include is information about
how to approach solving the failure modes you have highlighted.

This information can be inline documentation, links to TSGs, buttons to trigger automation
or the details of the team/engineer to contact to assistance. The key thing to keep
in mind is that it should enable the engineer in question to move the incident towards
mitigation as quickly and safely as possible.

## Conclusion
So, in summary, here is how to build a good dashboard:

1. Understand what your stakeholders care about, figure out how to measure it and put
   that on your dashboard. If you do this well, you get SLIs for free.

2. Understand how your system progresses from a stakeholder ask to the final expected
   delivery and identify key, measurable, checkpoints in this process. Show your services
   delivery of each checkpoint on your dashboard.

   > When things are broken, they should look broken. When they are normal, they should look normal.

3. Explain what you are showing and how it relates to the system's current state and
   behaviour. Provide context by linking designs, diagrams and source code.

4. Explain how an engineer should respond to failures to deliver on each checkpoint
   and how they can go about mitigating, or further understanding, the problem.

If you've followed these steps, you've probably got some pretty great dashboards. More
importantly, however, you've probably got a solid understanding of the role your service
plays, how it behaves and how to reconcile its current state. You've also got a live,
interactive, set of documentation for all of the above which can be shown to new hires
to help them gain context.

Finally, you've also got all of the building blocks required to start automating the
process of "staring at graphs" by introducing SLOs, monitors and alerting. If you think
about monitors as the process of automating watching graphs, you'll probably not go
too far wrong, just remember to build your graphs following this process.

*[SLI]: Service Level Indicator
*[TSG]: Troubleshooting Guide
*[TSGs]: Troubleshooting Guides
