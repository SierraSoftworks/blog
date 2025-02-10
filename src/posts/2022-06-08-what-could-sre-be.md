---
title: What could SRE be?
description: |
    Thoughts on the role of Site Reliability Engineering in the modern software
    development environment.
date: 2022-06-08T00:00:00.000Z

permalinkPattern: :year/:month/:day/:slug/
categories:
    - sre
    - theory
tags:
    - sre
    - theory

# cspell:ignore: PACELC
---

# What is Site Reliability Engineering?
Site Reliability Engineering is an incredibly interesting field, one which has straddled
the interesting line of both being relatively clearly defined and being hugely open to
interpretation. For many familiar with it, the idea of SRE brings thoughts of SLI/SLO/SLAs,
incident response, on-call, and an obsession with system architecture and failure modes. For
others, the line between concepts like DevOps and SRE is hard to make out, and to add yet
another perspective to the pile - it can simply mean "we want to hire an ops team, but nobody
wants to work for us unless we call it something else".

Recently, Niall Murphy (one of the original authors of the (in)famous Google SRE Book) wrote
[a thought provoking piece](https://blog.relyabilit.ie/what-sre-could-be/) about the future of
SRE and the assumptions that underpin it. It does a great job of articulating some of the
problems that have consistently worn a blister in my experience of SRE - especially when it comes
to articulating what it is we do to leadership.

I'd like to present what Site Reliability Engineering means to me and a hypothesis for what
SRE may be when we take a step back from some of the implementation details.

<!-- more -->

## The Evolution of Software Engineering
Over the decades our industry has progressively divested itself of many specialist roles within
the Software Engineering space. QA teams are in many cases a thing of the past, Operations teams
are being phased out in favour of developers being on-call, and there is a not uncommon thought
that SRE will follow the same path as a specific discipline in the future.

The trouble here, as it has been with every prior discipline, is that generalization inherently
reduces the emphasis placed on any specific aspect of the field. This certainly can work, as proven
by the large number of successful companies employing this strategy, but the lack of specific
incentives places a heavy burden on the supporting system to ensure adequate investment in all
critical domains. It is not uncommon to see a service built and operated by developers who are
drowning under the burden of on-call and have an insurmountable backlog of security debt to work
through.

On the flip side, the local optima of high resource utilization (i.e. our engineers are constantly
working hard) is easily met with the above approach, even if the global optima may well be missed.
This is the problem highlighted in books like [The Goal](https://www.amazon.co.uk/Goal-Process-Ongoing-Improvement/dp/0884271951),
where efforts to maximize the efficiency of each stage of the production pipeline result in catastrophic
inefficiencies in the end output.

The solution is not simply to hire experts in these fields - there is after all, a reason why we've
started to shift how we approach these problem spaces - but instead to embrace the need for structures
which better support our end to end success as an industry.

With that in mind, let's talk about the role that I see SRE as an approach filling in the future
and how I see it filling this role in organizations today.

## Modelling Success
When we talk about the role of SRE within organizations, we are often subject to three distinct
visions of what it represents. Development teams unfamiliar with SRE will often see the role as
"Ops Re-branded". Business leadership will often look to SRE to take the organization to "Google
Scale" and solve all of their reliability woes. When it comes to the SREs themselves, they often
envisage their role as the only team capable of fixing the systemic problems with the services they
support.

All of these visions are self serving and based on the value that the observer wishes to bring to
the table. After all, the dev team wants to own the code they work on, business leadership wants
to be the head of a global monopoly, and SREs want to feel that they are indispensable and are the
source of all reliability in the system.

In reality, I've found that SRE's greatest ability to drive positive outcomes is when they act as
a repository of knowledge and are able to effectively convey this knowledge to the people who require
it at the time they need it. In this capacity, SRE is an inherently horizontal facility within the
organization and tightly coupled with the organization's ability to learn and apply those lessons.

### Complexity in Large Systems
Anyone who has been cursed, or privileged, to work on large systems will recognize the central role
that complexity plays in everything we do. We strive to reduce complexity, and are constantly dealing
with the emergent behaviours that result from its inescapable presence in our systems.

This complexity can be most harmful when it obscures the behaviour of these systems, or the impact
that a proposed change will have on the system's behaviour. In any sufficiently complex system, it
becomes impossible to fully reason through the impact of every change and this leads to well intentioned
changes surprising us with unintended negative outcomes.

This problem is most profoundly felt by new hires and early-career engineers, but impacts the ability
of everyone to safely contribute towards the system's development. It also represents a crossroads in
how your teams approach the problem: are they proud of the complexity they can wrangle, or do they
aggressively attempt to strip it away? Too many teams take pride in their ability to operate in a
complex environment, and their on-boarding is a hazing into this exclusive club.

### Simplicity as a Role
I believe that the role of SRE is to strip away complexity in all its forms, exposing the truth of
the systems we work on in a manner which democratizes the ability to make changes safely. We have
several tools at our disposal to accomplish this, but without an ability to reason about the systems
we operate on it is impossible for us to achieve the long-term outcomes we seek.

In this space, an SRE team attempts to decompose a complex system into its simplest possible model(s)
and then validates these models against the behaviour of the system. We then maintain the corpus of
behaviours and risks associated with these models, and use them to predict the possible outcomes of
change.

::: tip Example
A service team is attempting to optimize the performance of a specific workload, and notices that
their system is reading data from a separate geographic location. Reducing this latency by reading
from the local region has the potential to reduce the workload's end-to-end runtime by up to 10%.

By simplifying this to the [PACELC](https://en.wikipedia.org/wiki/PACELC_theorem) model, we can theorize
that reducing latency will reduce consistency - even if we do not know anything else about the system in
question.

And indeed, the change would have resulted in consistency problems by reading from an asynchronously
replicated read replica instead of the primary write location.
:::

This approach of applying simplified models to the complex systems we deal with, and using this to inform
our approach to reviewing changes has repeatedly proven its ability to predict problems and inform design
improvements without the need for perfect familiarity with the system in question.

## Da Vinci
In many ways, I think the perfect exemplar of what SRE may represent in the modern world
is found by looking to the ancient world. Leonardo Da Vinci was as quoted from Wikipedia..

> A painter, draughtsman, engineer, scientist, theorist, sculptor, and architect.

He helped inspire and guide generations in every one of these fields and did so as a consequence of
his pursuit of learning and efforts to share his knowledge with others. His ideas, theories, and
approaches have lived on even as our technical capabilities to implement them have far outstripped
anything he dreamt of. It is in his example that I find a vision for where we may end up, if we so
choose.
