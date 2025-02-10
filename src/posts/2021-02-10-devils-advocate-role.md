---
title: Devil's Advocate in Operations
description: |
    Escaping from group think when solving complex problems as a group can be challenging
    and having a dedicated role within the group whose job it is to look for counter arguments
    and challenge assumptions can help, if done right.
date: 2021-02-10T18:37:07Z
permalinkPattern: :year/:month/:day/:slug/
categories:
    - operations
tags:
    - sre
    - processes
    - incidents
comments: true
---

# Devil's Advocate in Operations
Around the world, Israeli intelligence agencies have a reputation for punching well above their weight.
For a country of less than 10 million people, they compete with nations orders of magnitude larger and
have routinely demonstrated an ability to achieve far more than their larger cousins.

There are many factors which play a role in this, but today I'd like to focus on a small keynote in that
story which has, on numerous occasions, been the primary factor in advancing the reliability of the
services I support. That factor is the role of the "Devil's Advocate".

<!-- more -->

## History of the Devil's Advocate Unit
Following the Yom Kippur War and the failings which led to Israel being unprepared for the simultaneous
attack by Egypt and Syria, an [investigative commission][agranat] undertook the task of identifying improvements
which would allow the Israeli Defence Forces to be better prepared for a future conflict.

Their recommendations included the creation of a [special unit][devils-advocate-unit], tied to the Israeli Military Intelligence
directorate, but not reporting to them. This unit's job is to (in a professional and critical fashion)
examine unlikely scenarios and question the assumptions made by Israeli Military Intelligence and, where
appropriate, present counter-proposals.

### Important Takeaways
There are a few key points I want to call out here before we continue, because they distinguish this formal
role from the often seen "Devil's advocate to disrupt progress" persona which we often run into.

1. This is a formal role assigned to a group or individual.
2. There is the expectation of professional, critical, evaluation of the counter proposals generated.
3. The focus is on examining unlikely scenarios and the assumptions made by the broader group.
4. The goal is to deliver the same end result as the broader group by assisting them in seeing things they may have missed.

With that in mind, let's talk operations...

## Investigating a Problem
When you're working in any sufficiently complex environment, you are going to run into problems for which
there is no clear answer and no clear path one can follow to derive the answer. Ideally, these situations
happen rarely, but they do happen. If you're lucky, you're dealing with a communication issue and looping
more people in will highlight the missing piece of information which unlocks the puzzle, if you're unlucky
this will simply leave you with a larger group of people who are confused about how to proceed.

There is a critical point in this process where the group of investigators grows large enough that the available
bandwidth outstrips the amount of information which can be analyzed under the current investigative directions
and it is this point which I am most interested in today.

Coincidentally, it is this point that I found myself in 2 weeks ago, 2 weeks into an extremely complex
investigation. With ~10 people actively engaged in trying to narrow down the cause of the particular issue
we faced and several strong candidates with supporting statistical data, we still weren't making forward
progress. As a group, we had plans for what questions we needed to answer next, what information we needed
to gather to answer them and what we thought we could test to refine our theories, but we fundamentally
lacked a coherent story about what was going wrong. Attempts to fabricate one led to the familiar
**Step 1?... Step 2??... Something we don't understand... Step 5!** pattern.

### Breaking the Cycle
In these situations, one of the most powerful roles you can introduce into the group is a person tasked
with playing Devil's advocate. This person's job is not to dispute the information provided by other members
of the group, but rather to examine the assumptions made, look for alternative theories which explain
the data and pursue lines of inquiry which diverge from the established narrative.

The person tasked with this role should ideally be someone with solid systems thinking experience and
the penchant to be creative. They should be able to rapidly identify supporting and disputing evidence
and use this to quickly filter theories which are impossible while highlighting those which may be unlikely,
but which have supporting data.

3 weeks into our investigation and it was this approach which delivered a coherent story, something we
could start to reason about. We didn't know what Step 1 and Step 2 were, but we could now see a clear
progression of **Step 3... Step 4... Step 5!** and the solution space had been compressed greatly for
the areas we were confident about.

## Reproducing the Success
Fundamentally, success in this domain is a product of two key realizations:

1. You have multiple people with tons of experience looking at the problem and attempting to optimize a solution.
2. Local-minima will naturally draw the search party unless we intentionally cast our gaze further afield.

With that in mind, the role of Devil's Advocate is to act as a scouting party for other nearby search opportunities
and to rapidly determine whether directing the main search party's attention to these opportunities is a good or
bad investment. If they determine that it is a good investment, they need to be able to efficiently and accurately
provide context about the new search domain.

### Identifying Search Domains
Identifying areas to search can be done in two ways: randomly casting out in a direction, or more procedurally evaluating
useful avenues based on the findings of the main search party. Random can be useful, but it is very domain
specific and I don't think I can add much value here. Procedural on the other hand, is much more structured
and can enable engineers to more effectively build off one-another's progress.

I usually start off by working with the broader group to understand what their observations are and their current
theories. You cannot possibly play Devil's advocate without understanding the mainstream position, so you need to get
good at listening and asking questions.

#### Explain how `$x` starts to fail?
A good first question is to ask the group to explain not just what they believe the failure is, but what sequence
of events leads to that failure. Have them walk you through the full dependency graph and highlight any supporting
(or refuting) information they have which justifies their theory.

In my experience, the places with the most value are those where the search party cannot justify a portion of this
dependency graph. That may be the result of them fixating on symptoms, mistaking a symptom for a cause or simply
because they lack the information or experience to pursue the necessary avenue.

Take notes of all of the areas where you feel the justifications are vague, lack supporting data or are non-existent.

#### If it wasn't `$x`, what would it be instead?
When we're dealing with complex systems, there are often numerous possible dependencies which may impact a given
node in our graph. In situations where you feel like a portion of the graph is "cloudy", start asking the engineers
you're working with questions about what else could be contributing.

Perhaps it isn't dependency `$x` which is failing, but rather `$a`. Asking them to actively assume that a given
dependency is in fact healthy (in situations where you do not have adequate confidence in either direction) can
yield very interesting results. If possible, try removing this dependency intentionally and observing the system's
behaviour, or looking to see whether `$x` and `$a` are both contributing to the failure.

You'll want to take notes of these options as well, because they're the things the search team is likely not directly
looking at and are potentially a treasure trove of useful information. In my experience, most teams tend to land close
to the core issue on their first guess and it is subtle shifts in the landscape caused by one or two assumptions
which makes the difference between identifying the cause of a failure and fixing something related, but sub-critical.

#### If it was `$x`, why would we see `$y`?
With an idea of your dependency graph and its potential variables, your next step should be to start testing hypotheses.
Look for metrics and logs which support, or refute, each assumption. Does the team believe that `$x` is failing? If so,
what would confidently confirm that/confidently refute that? Look for this information and use to to aggressively prune
the tree of theories which cannot be substantiated.

### Sharing Context
It is crucial to remember that although you are playing Devil's advocate, you are still a fundamental part of the
investigative team and you should remain in constant communication with them throughout this process. That means
keeping abreast of new developments on their side, as well as sharing any information you find. Any success is going
to be the result of a team effort and while playing the role of "scout" might help you deliver a key which unlocks
further progress, attempting to develop the full potential of that key on your own is likely to delay the team's
success.

Of course, sharing too much information and failing to curate stuff can also distract other engineers from the
critical investigative work they are doing, so finding a good balance is the aim of the game. Where that balance
lies will depend a lot on your team and the situation you find yourself in, but as a general rule, I will share
information under these conditions:

1. This is a new piece of information which nobody has seen before and it clearly relates to the issue at hand.
2. I can now clearly tie this piece of information to a candidate narrative about the failure and it forms a crucial piece of that narrative.

[agranat]: https://en.wikipedia.org/wiki/Agranat_Commission
[devils-advocate-unit]: https://en.wikipedia.org/wiki/Devil%27s_Advocate_Unit
