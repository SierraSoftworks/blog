---
title: Be Right, Nicely
description: |
    Being right is something that, as an industry, we tend to place a lot of
    value on. Some companies go as far as to make it one of their guiding
    values. Whether you subscribe to the merits of that or not, one common
    virtue we should all be able to agree on is that when we do happen to
    get things right, it is important to do so in a constructive manner.

    Today I'm going to spend a bit of time talking about how important
    your reaction to being right is when building a team culture.

date: 2024-01-26T00:00:00.000Z
permalinkPattern: :year/:month/:day/:slug/
categories:
    - development
    - leadership
tags:
    - culture
    - leadership
    - management
    - team

# cspell:ignore Cantrill
---

# Be Right, Nicely
In the software and computer industry, we have a tendency to assume that the
world, its inhabitants, and most of all ourselves are deterministically
rational beings. At the risk of inciting the ire of the orange site, this is
patently inaccurate and allows us to justify a diverse array of logical
fallacies.

<!-- more -->

One of these fallacies is that it is possible to train to be correct in
all situations. Amusingly, some companies even go so far as to encode this
assumption in their guiding values. I'll let the ever eloquent
[Bryan Cantrill](https://en.wikipedia.org/wiki/Bryan_Cantrill) entertain
you with his thoughts on the matter:

<YouTube id="9QMGAtxUlAc" :width="800" :height="480" />

Of course, the goal of this post isn't (only) to point you at a fun talk,
but rather to consider how to build a constructive team culture in the face
of inevitable mistakes and the chance encounter with being right.

## Correctness is a tool, not a goal
One of the messiest things we deal with as leaders is the manner in which
incentives drive behaviour, and more specifically, how actors will optimize
for the lowest cost means of achieving the incentivized goals. If we reward
people for being right and punish them for being wrong, then we will quickly
find that they will optimize for being right at all costs.

On the face of it, this might not seem like a terrible outcome for a
company, after all, doesn't being right mean being the best, and doesn't
being the best mean that you'll win? The reality is that most companies are
not playing in a finite game where win conditions are clearly defined and
the game ends at some deterministic point. Instead, companies play an infinite
game where there are no winners or loses, only players who are still in the
game and those who have dropped out.

In this context, being right may be a useful tool for continuing to play
the game, but only if it allows you to continue playing the game. If being
right comes at the cost of ending the game for all participants, then it
is by definition the worst possible outcome for a company.

> Well okay, sure, but what company is going to intentionally work towards
> destroying the very game they're playing?
>
> ...Have you seen the current state of AI research?

Stepping back from the macro-economic view of the world, we can apply the
same conditions to the micro-economics of a team. If we incentivize being
right, we will quickly find that our team members will do anything to avoid
being wrong. Those incentives may take the form of formal rewards, or be as
simple as the social and emotional rewards associated with doing so.

Part of the trouble here is that in general we're not particularly good at
being perfectly correct. We're not even particularly good at being mostly
correct. In fact, most of the best engineers I've worked with have been
mostly incorrect most of the time, but they've been able to recognize when
they're wrong and adjust their course accordingly. They also solicit feedback
from others and use that to continuously improve their understanding of the
problem space.

## Acknowledging the role of luck
The first thing that we need to recognize is that our own individual skill
is only one part of the equation when it comes to successful outcomes. As
[Daniel Kahneman](https://en.wikipedia.org/wiki/Daniel_Kahneman) points out
in his excellent book [Thinking, Fast and Slow](https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow),
the outcome of any situation is a combination of the base chance of success
and any individual adjustments to that chance. In most cases, the base chance
of success dominates the outcome, with individual skill only playing a minor
role.

```mermaid: A diagram showing that the final outcome of a situation is a combination of the base chance of success and individual skill.
graph LR
    BaseRates[Base Chance of Success] --> Add((+)) --> Outcome
    Skill[Individual Skill] --> Add  
```

This flies in the face of our industry's obsession with individual skill and
the idea of the "10x engineer". It's also terrible for our egos, because it
means accepting that much of our success is likely to be reproducible by
others and we're almost certainly nowhere near as irreplaceable as we'd like
to imagine.

If we do acknowledge that our own individual skill is only a minor factor in
the outcome of any situation, then by and large we need to accept that being
right happens for one of two reasons:

1. The problem space was trivial enough that almost anybody would have been able
   to reach the right outcome (i.e. the base rate of success was very high to start with).
2. We got lucky enough on the base chance of success that our individual skill
   was able to push us over the line (i.e. our own individual skill helped nudge the
   base rate of success over the line, but likely still played a minor role).

With that in mind, it's fair to say that "being right often" is more about
creating an environment where the base rate of success is high than it is
about individuals developing a preternatural ability to be correct.

Of course, anyone who has worked on an effective team knows that the chances
of success go up greatly when you're working with a group of engaged, intelligent,
and motivated individuals. So perhaps the better way to represent the probability
of success on a team is by aggregating the individual skill of each team member
into the team's skill.

```mermaid: A diagram showing that the final outcome of a situation is a combination of the base chance of success and individual skill.
graph LR
    BaseRates[Base Chance of Success] --> Add((+)) --> Outcome
    TeamSkill[Team Skill] --> Add
    Person1[Person 1] --> TeamSkill
    Person2[Person 2] --> TeamSkill
    Person3[Person 3] --> TeamSkill
```

The beauty of this model is that it highlights the value of building effective teams,
as you're able to capitalize on the skills of each individual to create a team which
has a higher probability of success on any given task (assuming they are able to
work together effectively and leverage one another's skills).

## Being right is a team sport
If we accept that we're participants in an infinite game and the goal is to keep
playing, as well as the fact that our chances of success are inherently improved when
we work together, then it rapidly becomes clear that the best approach is to
build strong, collaborative, teams.

While there are many factors which are all critical to doing so, the one I'm going
to focus on is the way in which we incentivize being right. We'll consider two examples
and play them out to their logical conclusions.

### Winning the game of "being right"
We've all seen this game play out, whether it be an argument over whose idea is the
best, or nit-picking an irrelevant detail in a code review. The goal of the game is
to prove that you are right about something, whether the other party argues against
it or not. It is so common an occurrence that many of us have come to accept it as
an unpleasant, but unavoidable, part of our industry.

It is also the source of an inordinate amount of toxicity and contributes to pushing
out those who are unwilling and/or unable to regularly put up with the aggressive
and often confrontational behaviour it encourages.

There's also a more subtle version of this game which, while less common, is in
many ways even more harmful to a team's success. It's the variant where the goal
is to prove that someone else is, or was, wrong and that you are, or were, right.
It plays out in situations where a member of the team learns something new and
attempts to share it with the team, only to have someone point out that they already
knew this, or mock them for not knowing it sooner.

The common thread of all of these behaviours is that they inherently assume that
there is a finite game involved: one in which we win by being right and if the
other person leaves, you have won by default. But if everyone refuses to work with
you because you're an asshole, then I guarantee that you're the one who has lost
the game.

### Celebrating growth
If our teams instead take the view that this is an infinite game where the goal
is to keep playing, then clearly our focus should be on continuing to play and
bringing as many players into the game as possible. This means growing the team
and its individual members.

In this world, an individual being right is not, in and of itself, a victory
for the team - but rather an opportunity for others to learn and grow, and for
the team to incentivize the growth that led to that success. It results in
celebrating both ideas and rewarding the team's ability to reach consensus
on one of them, rather than celebrating the individual who came up with the
chosen one. It means using code reviews to teach without stifling progress
or enforcing one person's "right" way of doing things.

It also means that when someone shares something they've learned, we celebrate
it even if we already knew it, even if we've known it for years, and even if
we've previously tried to explain it to them unsuccessfully. The fact that they
have gained a new skill benefits the whole team and contributes towards everyone's
success.

Given the choice between the two, I know very much which team I'd rather build.
So, as a leader, forget about proving that you're right and instead focus on
building a nice team, they'll be far more likely to "be right, a lot".
