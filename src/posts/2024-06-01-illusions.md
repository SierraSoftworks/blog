---
title: Illusions as a Service
description: |
    The typical tech sales pitch you'll see today, especially in the age of AI,
    reads more like a magician's prelude than the matter-of-fact boxes your
    grandfather's (or granmother's) drill came in. Let's talk a bit about
    reality, business decisions, and understanding what you're buying in a world
    where sellers control the narrative.

date: 2024-06-01 03:00:00
permalinkPattern: :year/:month/:day/:slug/
categories:
    - business
    - technology
tags:
    - meta-commentary
---

# Illusions as a Service
The world today strikes a particularly jarring contrast with the one I grew up
in. Buzz-words and gimicks have taken center stage in an environment where a
"cheap" alternative can be found for thruppence on the quart (or however that
monetary system worked).

To compete in a sea of identical products, companies pitch differentiating
features, many of which seem to have been crafted through a haphazard "Cards
against Humanity" approach where every second card is the word "AI". Before that
it was "Blockchain", and before that "The Cloud".

Thing is, for all that these products will try to convince you that they have
the singular ability to magically solve whatever problem you face; the simple
reality is that the laws of physics cannot be negotiated with.

There is no magic, you cannot beat the Shannon compression limit, you can't
move information faster than the speed of light, and you must choose between
consistency or availability.

<!-- more -->

Okay, that's a pretty heavy way to start things, but there is a bright side:
knowing this allows us to much more accurately evaluate options and make
(reasonably) informed decisions.

::: warning
This post takes an intentionally excessive position on the topics it covers,
it's probably not going to give you a good idea about what technology to choose,
but hopefully it gives you some ideas about how to think about the technology
you choose.
:::

## The illusion of choice
Humans are gullible (and liable to get irritated if you point this out...woops).
Marketing and sales departments know this all too well, and one of the fun
wrenches they like to use to percussively encourage you to part with your money
involves giving you the choice of anything you could possibly want, so long as
its one of the things they're selling.

> Any colour the customer wants, as long as it's black &mdash; Henry Ford

A great example is that in all likelihood you've never been asked if you'd like
a smartphone; you were just asked if you wanted Android or iOS. You're not asked
if you'd like a managed database that costs multiples of the cost to run it
yourself, you're just asked if you'd like Dynamo DB, Cosmos DB, Azure PosgreSQL,
CloudSpanner, RDS, or a wide range of other options that all promise to be the
most cost effective way to spend lots of money.

## Pick a card, any card
Everyone and their dog is offering to sell you their own take on foundational services.
You've got the hyperscalers who could probably solve your problem, but they could also
offer you at least three different ways to solve your problem, all of which compete with
one another, and all of which claim to be the right solution (except for the one with the
best margins, which probably has a bunch of research papers explaining how it defies the
laws of physics and beats CAP theorem - all so that the sales team can impress your executives).

Silicon Valley, not be outdone by "The Big Cos" (as the kids are calling them these days)
are tripping over their shoelaces (and tripping over their shoelaces trying to sell you their products).
In most cases, they'll be offering some smart ways to run Open Source software with a specific
pain point that a founder has been hurt by polished into profitability (or at the very least,
the illusion of it).

And then there's Open Source, the good old "free" option that has had teams asking themselves
"how hard can it be?" for decades (to which the answer is obviously "Ah sure, it'll be grand!").
You will, of course, want to hire a full team to run this for you - and don't make the mistake
of hiring the wrong team (I'll let you figure out whether that is SRE, DevOps, DBA, or a
Software team running their own DBs - good luck, I'm sure you'll figure it out).

## Letting truth get in the way of a good story
As I said at the start, there is no such thing as magic, and anything that sounds too good to
be true probably is. Everything has trade-offs, the laws of physics mean that as you move things
further apart you will invariably introduce performance constraints, and the Universal Scaling Law
means that if you care about ordering you're going to see retrograde scaling beyond a certain size.

There is some amazing software out there, and many of the options in the wild will work for many
of the problems you're likely to face - but don't let the sales team spin you a merry yarn, instead
get your hamster running and do some thinking.

When it comes to databases, you'll be amazed how much you can do with an in-memory implementation
and some snapshotting logic. Care a bit more about consistency and data quality? SQLite will gladly
let you solve most problems you can solve on a single node without skipping a beat. Take a copy of
the `db` once in a while for backup purposes and you're probably going to be set.

God forbid you might need to have multiple clients accessing the database at the same time; grab PostgreSQL.
It is rock solid, can solve most problems you need a database for, is incredibly fast, and if you run it on
a single node with backups (and maybe a log streaming replica for point in time recovery) you'll be just
fine for everything most products will ever need.

## Struggle-snuggling with dragons
Of course, if you know anything about how you're *meant* to run reliable systems, everything I've just told
you sounds like I'm an idiot. "This clown thinks that running SQLite is better than CloudSpanner for my use case?! Hah!
What do they know?". So okay, let's play it out: you've read the recipe books; you must have a replication factor of
at least N+2 to support planned downtime and unplanned outages without impacting availability. You must distribute
that capacity across multiple failure domains (AZs, regions, maybe both) so that a major outage doesn't impact your
blog which gets 10 views by `User-Agent: *Bot` per month, 150 from your home IP, and nothing else. You must shard your
data across multiple smaller instances because "horizontal scaling" and you'll need infrastructure to manage automated
fail-over and leader-election (so grab yourself a Raft or some Zookeepers to wrangle this mess).

Before you know it, you're managing a fleet of systems, fighting with the laws of physics, and have so many
interdependent systems with different failure modes that even though a single machine only has an estimated 99.95%
uptime per year, you're probably getting 99.5% reliability (or about 4 hours of downtime a month) because of unexpected
issues which cascade and require manual intervention.

At which point, your local hyperscaler leans over and says "Hey there kid, want to try some serverless? I've got the
good stuff!" and you reckon "Why not? They probably know how to do this better than me and they have a 99.999% SLA.".
And so you live happily ever after...

Well except for the major outage last month, or the fact that there are these weird timeouts you get from time to time,
or the crazy cloud bill, and the network egress fees! Meanwhile, your little home lab machine has been running SQLite
happily for the last 536 days without downtime, happily doing its job without a word of complaint.

## Wrapping up
There's no small amount of snark in this post, but there is a very serious core consideration that led to it. When we
think about reliability we immediately jump to thoughts of system design patterns which can allow us to reduce blast
radius, layer redundancy, and give ourselves the best shot of weathering a bad day.

But complexity is its own form of reliability challenge and ignoring it is a really bad idea :tm:
(especially at the kind of scale where the compounding probabilities of failure introduced by additional nodes
required for scaling are far outweighed by the additional risk introduced by adding more components).

Conceptually, we can think of this in terms of a reliability cost from architectural complexity (which has a negative
scaling factor associated with it but a large constant cost) and the reliability cost of scaling (which has a low
up-front cost but a positive scaling factor).

$$ risk = risk_{architecture} + N (risk_{scale} - benefit_{architecture}) $$

At small scale (where $N$ is small), keeping your $risk_{architecture}$ low matters a lot more than when $N$ is large,
where the $benefit_{architecture}$ plays a much larger role. So be honest with yourself: are you really large enough to
warrant a complex system, or would you be better served by working on automating that backup system you've been meaning
to get to?
