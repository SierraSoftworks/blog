---
title: "Designing Human Systems"
description: |
  Working in Site Reliability Engineering is something akin to driving. You're part of a system
  which is attempting to travel from point A to point B as rapidly as possible without having
  a serious accident. Here, I talk about how balancing investments in our observability and velocity
  help us achieve this goal.
date: 2020-05-15T08:00:52Z
permalinkPattern: :year/:month/:day/:slug/
categories:
  - sre
  - balance
tags:
  - development
  - sre
  - balance
comments: true

# cspell:ignore Nickolas, Analytica, Stenning, Petoff
---
# Designing Human Systems

Recently I was having a conversation with a colleague who asserted that we (SREs) are broadly the
types of engineer who, if given the choice, try to focus on perfecting the fundamentals. This
surprised me, because if you were to ask me about my views on engineering, I'd probably lean
in a slightly different direction.

My personal view on SRE is that its a game of balance. We're not Software Engineers, we're
not Operations Engineers and we're also not Security Engineers. We tread a fine line in the
middle, pushing on aspects of the broader (humans included) system to help it find a stable
equilibrium in which it delivers maximum value for all stakeholders. That kind of balancing
requires a very pragmatic, flexible approach and often depends more on the subtleties of the
system at hand than a rigidly theoretical approach can offer.

With that in mind, I think that as engineers, we need to focus on building systems that support
that healthy equilibrium. Doing so means balancing a wide range of requirements from different,
often competing, stakeholders while attempting to divine what the future may bring. In my
experience, however, all of this becomes much easier to deal with if you can solve two key
problems: velocity and observability.

Before I dive into that, let's quickly talk about that experience.

<!-- more -->

## My Background
I've been a Site Reliability Engineer by title for almost four years now, having unintentionally
wandered into the role after years of software engineering with a gratuitous sprinkling of operations.
To me, operations was always a hard prerequisite for being able to do the software engineering I loved,
but it wasn't the reason I was excited to go to work.

My first professional foray into SRE came about as a direct result of me being fed up with spending
80%+ of my work day fixing production issues in a service I had built. A month of infrastructure
refactoring using tools like Consul, Ansible, InfluxDB, Grafana and GitLab CI resulted in me
being able to return to spend most of my time building software again.

For some strange reason, I then decided to take an official SRE role and resumed the cycle.
Throughout this, I've never lost sight of the fact that what I do is to enable me (and others)
to spend time building cool software. That outlook shapes much of my approach towards SRE.

## Core Beliefs
At the core of my belief is the idea that, almost without exception, the engineers on our teams want
to do the best possible job they can. That means writing the best code, shipping the most reliable
service and meeting all of your customers needs in the process. If you don't believe this, you need
to re-evaluate how you hire people.

> Almost without exception, the engineers on our teams want to do the best possible job they can

The engineers around you are the smartest, most motivated and best versed people in the world on
the exact problem you're solving. If you think about it that way, the best thing you can do is help
them spend time improving your solution. Indeed, the best teams in the world seem to heavily bias
towards doing exactly this.

There's a lot we can learn from looking at these successful teams and emulating them. The naive
approach is to assume that an exceptional team begets high velocity, stable systems. This is a
narrative I've heard a lot: "We can't do that, because we don't have a team of 10x engineers.".
However, if you ask engineers on those teams what allows them to succeed - they'll often tell you
that it comes down to their very ability to move quickly.

There's an excellent talk by Nickolas Means on Lockheed Martin's Skunk Works team and how they
were formed. Without a doubt, they're an example of an exceptional team of engineers delivering
some of the most amazing engineering achievements of the past 50 years. Go and watch it, I'll wait.

<!-- cspell:disable-next-line -->
<YouTube id="pL3Yzjk5R4M" :width="560" :height="315" />

I'm also a strong believer that the vast majority of people want to love their work.
Sometimes that means working in a field you're passionate about, for a cause you support, with
colleagues who represent a cross-section of your friend group. More often, though, it means enjoying
the joy that comes from solving a challenging problem, making life a little bit better for someone
or just seeing an idea come to fruition.

> People want to love their work.

The happiness generated by these moments of progress, especially when one first joins a team or
project, can set the tone for a person's tenure at an organization. If you can make your company
somewhere that people love to work, many things become much easier for you (unless, of course,
you're trying to get rid of staff). As engineers designing systems, we should keep this in mind
and strive to build environments that people love to work in.

## Primary Factors
So let's take a step back to what I said at the start of this article. In my experience, success is
determined by a combination of velocity and observability. If you've got the right people, which is
an entirely different conversation, these two factors can be the difference between incredible success and
outright failure.

### Velocity

Facebook is notorious for their quote "Move fast and break things." and for anybody following the
Cambridge Analytica scandal, I think there's a strong satirical sense of "well that worked well, didn't it..."
tied into any mention of their approach.

Google's approach, in typical Google fashion, involved a bunch more maths and was brandished about
under the phrase "Error Budgets". In practice, the core idea behind these is the same and is summed up
by another lovely quote:

> Perfect is the enemy of good.

Velocity, or the speed at which we can move in a chosen direction, is a key indicator of your ability to
drive change. Whether that be change in a global market, a shift in your technology stack or simply fixing
a spelling mistake on your login page. Our ability as engineers and organizations to rapidly move to meet
the requirements of the environment we work in is integral to our long-term success.

This same velocity contributes to team members more frequently seeing the results of their effort, leading
to increased job satisfaction and better retention (all other factors remaining equal). This retention has
the knock-on effect of improving the team's experience with the system they support and it is this experience
that enables them to make better decisions in support of its growth and reliability.

That isn't to say that velocity, in and of itself, doesn't bear risks. As anybody who has watched a road
safety advert will tell you: speed kills! Of course, the reality is far more subtle than that and this is
highlighted by the fact that the German Autobahn, famous for its high (and in some cases, unrestricted)
speed-limits has a fatality rate lower than that of Germany's rural roadways and an accident rate over
an order of magnitude lower than their urban rate [^autobahn_safety].

---

<Figure src="https://cdn.sierrasoftworks.com/blog/autobahn.jpg" :width="40" alt="A photograph of a clear motorway.">
  The Autobahn
</Figure>

What we often see in practice is that organizations and teams will attempt to curtail velocity under the
guise of reducing risk. This unequivocally works, but it works in much the same way that dropping the speed
limit on the Autobahn would.

That is to say, processes which have small impacts on velocity can help to reduce risk, but they can just
as easily have no appreciable effect on the number of accidents/failures/outages we deal with. More rigorous
processes which significantly hinder velocity may reduce the perceived risk, but as with dropping the Autobahn's
speed limit to 30 km/h; there is a significant opportunity cost involved.

---

All too often, I've seen teams attempt to control their risk profile by introducing processes which are
designed to reduce velocity. Their intent is always good, but the opportunity cost of implementing such processes
can, just as greatly dropping the speed limit on the Autobahn, be completely disproportionate to the added risk.

Instead, I'd like to propose that there's an alternate dimension which can be leveraged to regulate risk
while maintaining, or even increasing, velocity.

### Observability
Learning to ride a motorcycle, my instructor impressed upon me the importance of a single phrase:
"You don't put the bike anywhere your eyes haven't gone first". Professional rally racers, military fighter
pilots and anyone else tasked with moving quickly through an unfamiliar environment will tell you the
same. Maps, road-books and carefully instrumented approaches can help them operate in the grey area that
many of us are unprepared to tread in, but this ability comes at the hands of carefully crafted experience.

I mentioned that velocity increases risk, but your awareness of what is coming up determines whether
that translates into a crash. Unfortunately, none of us can see the future and the environment can mask
dangers, reducing our visibility. How we respond to this determines whether we make it out the other side
or not. In practice, this means reducing your velocity in times of uncertainty and increasing it when you
are confident in a safe outcome.

---

<Figure src="https://cdn.sierrasoftworks.com/blog/foggy_road.jpg" :width="40" alt="A photograph of a foggy road.">
  Foggy Road
</Figure>

Coming back to the Autobahn, the key differentiator between it and rural roads (which see more than
triple the number of accidents and 4x the fatality rate[^autobahn_safety]) is ones ability to see risks coming
from further away. Every aspect of a motorway is designed to provide drivers with advance warning - whether
it be the broad, sweeping, corners or the shallow entry angle for on-ramps.

It is this visibility which enables drivers to respond safely to new situations, even at twice the velocity
found on rural roads. The effect is that drivers on the Autobahn see far fewer accidents per year than their
colleagues on rural roads, despite the increased risk brought about by higher speeds. The same properties apply
to software engineering teams.

---

In the world of SRE, we use the term "Observability" to describe our capacity to gather information about
the environment and upcoming dangers. The rate at which we can gather and interpret this information accurately
determines the maximum safe velocity our teams can move at. In some cases, this information can proactively
help us focus effort and mitigate before problems arise, in others the mitigation happens after the fact.

Our ability to proactively identify problems and prevent them from materializing is often tied to the
experience of our team, while the ability to retroactively address issues is a matter of agility. In both cases,
however, the engineers involved must have an awareness of the environment they are operating within. This
environment includes the technical, organizational, social, legal, moral, financial and de-facto constraints
placed upon them and the system they maintain.

### Balance
My view, as with all things SRE, is that there is an important balance to be struck here. Velocity is critical
to your ability as a team and organization to not only meet market demands and remain competitive, but also to
retain talent. Engineers who have experienced the rapid reward cycle involved in high-velocity teams will
find themselves craving the opportunity to experience the same - in extreme cases, seeking it elsewhere.

On the flip side, velocity gives you less time to see problems coming and plan for how to tackle them.
This means that teams who lack the ability to respond quickly and effectively will find themselves in a
descending spiral of reduced velocity, culminating in the death of the team, product or both.

Observability is the critical second component in balancing that equation, but it is about far more than
simply improving monitoring and logging of your service. Observability is about ensuring that your team has
the ability to rapidly change direction to select the safest path through an area of risk. That means giving
them the context necessary to enable them to autonomously make good business decisions, improving your tooling
to make information sharing easier and reducing the time between something changing and the relevant people
being aware.

Of course, focusing on improving observability will not bring your system into a healthy balance if the reason
for that imbalance is a lack of velocity. Before observability becomes useful, your engineers must be able to
act on that information.

---

<Figure src="https://cdn.sierrasoftworks.com/blog/ice_floe.jpg" :width="40" alt="A photograph of an ice floe.">
  Ice Floe
</Figure>

A good example is navigating an oil tanker through an ice floe. When you first run into ice, at the edge of the
floe, working to ensure that the bridge has better visibility and can chart a course around the floe will work
wonders. But if you're already in the ice floe, focussing your effort on better visibility for the bridge isn't
going to help things one bit.

On the flip side, switching to small, nimble craft and empowering each to chart their
own course through the rapidly changing landscape (even though each will likely have less visibility than the
bridge of your oil tanker) is far more likely to succeed. Of course, the best approach would have been for someone
to call out that you were heading towards Antarctica before you got there, but hindsight is 20:20 as they say.

---

When designing these human systems, we need to work to strike a balance between velocity and observability.
We should work under the assumption that our engineers are passionate and motivated to build the best system
they can; using processes to support them in doing so rather than as a defence against them. If your team finds
that working off an A4 to-do list on your desk is the best option, then do that. Similarly, if your team is
most comfortable carefully planning out each step prior to executing on the plan, then enable that.

When we find that our teams fall short of their own expectations, we should use those situations as opportunities
to innovate. The natural inclination will be to slow your velocity, but by instead focussing on improving your
observability you can help the team spot similar risks in future and proactively mitigate them.

It is critical to keep in mind that a process is not put in place to prevent bad things from happening. In
a complex environment, surprising events will happen and the purpose of your process should be to maximize the
aggregate benefits you glean from that environment. If that means that the benefits of no-code-review velocity
outweigh the costs of customers running into the odd bug, then do that. Implementing a process to prevent
customers from running into a bug will only reduce the net benefit your team can deliver.

The unfortunate side effect of processes being used as a defence against surprises is that they end up being
a defence against your team's ability to move quickly. In extreme cases, this can mean that your team is not
empowered to fix the problems they are aware of. In that context, focussing on improving visibility into the
system - just as with the oil tanker in the ice floe - can lead to a sense of despair rather than providing
a solution.

## Being an SRE
As an SRE, our job is not to act as a re-branded development or operations team. Experience in both
is critical, but it's the table stakes for our game. If you want to excel, you'll need to bring something to
the table that neither a pure development team nor an operations team brings.

---

<Figure src="https://cdn.sierrasoftworks.com/blog/strawman.jpg" :width="40" alt="A photograph of a straw scarecrow.">
  A Straw-Man
</Figure>

The straw-man examples for a Dev team and an Ops team are that they focus purely on features and reliability
respectively. Where the Dev team is benchmarked on meeting customer deadlines, the Ops team is benchmarked on
whether the service is available. Separating these teams, in the straw-man case, leads to the Dev team shipping
feature-packed, buggy, software that the Ops team is penalized for. To prevent this, the Ops team places
limitations on the Dev team: release cycles, planned downtime, bug SLOs etc.

In practice, reality is rarely this cut-and-dry and most Dev/Ops teams try to find a comfortable balance
somewhere in the middle. How successful they are depends on a range of factors and this is where an SRE
has the chance to drive impact.

---

When we approach an engagement or project, our goal should be to work with our partner teams to design and
implement a comprehensive system architecture which supports the reliable, agile, sustainable and secure
development and operation of a product or service. It is important for us to consider that the system boundaries
do not start and end with the technical implementation, but rather extend to encompass the the people involved
in the development and operation of the service, as well as its touch points with the broader organization
and its customers.

SREs bring a number of practical tools to support this holistic view, but it is important for us to remain
cognizant of the broader picture and our role in supporting it. The greatest advantage an SRE has is their
ability to work outside the traditional Dev/Ops team cycle and, with the support of their organization,
strategically introduce velocity and observability into the projects which need it most.

> SREs work by carefully and deliberately tackling the systemic weaknesses which other teams within your
> organization are unable, or un-incentivized, to deal with.

## My Manifesto
This is a pretty long post, so let me try and sum up my views on being an SRE in a few words.

The role of SRE is to foster a sustainable balance between velocity and reliability within an organization.
They do so by carefully balancing their ability to inject additional velocity into areas which need it most,
while leveraging best practices and tools that improve observability. This deliberate pairing enables them
to magnify the impact of other teams within the organization, enabling the entire organization to more easily
build high quality products.

With that in mind and with the caveat that this may all change as I learn more, here are the ordering of my
priorities (stealing shamelessly from the Agile Manifesto's style).

 - People's happiness over technological perfection.
 - Learning and experimentation over knowledge and correctness.
 - Velocity and awareness over exhaustive planning.
 - Holistic impact over specific deliverables.

As with the Agile Manifesto, the entries on the right have value, but I consider those on the left to have
more.

## Further Material

 - **[The Field Guide to Understanding 'Human Error'][sidney_dekker] by Sidney Dekker**

   This is an excellent book which I would argue is as important, if not more so, than the Google SRE book.
   Given the role we play in our industry and the stakes involved when things go wrong, learning to not only
   empathetically manage failure, but extract the maximum potential learning from that failure is critical to
   driving our industry forward.

   If you're not one for reading, then watch these two excellent talks which will give you a good introduction
   to the topic.

   1. [Nickolas Means' talk on Three Mile Island][leaddev_three_mile_island]
   1. [Nick Stenning's talk on Learning from Incidents][srecon2019_learning_from_incidents]

 - **[The Google SRE Book][google_sre] by Betsy Beyer, Chris Jones, Jennifer Petoff & Niall Murphy**

   The de-facto standard literature for SRE. This book is a wealth of valuable ideas and lessons from which
   an engineer can build a toolbox. Keep in mind that what you are reading is a cross-section of lessons
   learnt, rather than a manual on how to implement SRE, and you'll be great.

[sidney_dekker]: https://www.amazon.com/Field-Guide-Understanding-Human-Error/dp/147243904X/ref=dp_ob_title_bk
[google_sre]: https://landing.google.com/sre/books/
[srecon2019_learning_from_incidents]: https://www.usenix.org/conference/srecon19emea/presentation/stenning
[leaddev_three_mile_island]: https://www.youtube.com/watch?v=1xQeXOz0Ncs

[^autobahn_safety]: Read more about [Autobahn Safety](https://en.wikipedia.org/wiki/Autobahn#Safety)
