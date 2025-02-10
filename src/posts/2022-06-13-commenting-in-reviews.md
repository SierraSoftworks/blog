---
title: Commenting in Reviews
description: |
    Reviewing documents and code is something engineers and managers are commonly
    called upon to do. It's a great way to socialize knowledge, improve clarity,
    and support the production of high quality artifacts. How we write comments can
    make a significant difference in our ability to influence those positive outcomes.

date: 2022-06-13T00:00:00Z
permalinkPattern: /:year/:month/:day/:slug/
categories:
    - processes
    - culture
tags:
    - processes
    - culture
---

# Commenting in Reviews
As engineers, managers, friends, or family members we are often called upon to review
the work of others. Reviews are a critical part of our professional social contract and
give us the opportunity to build cohesion, socialize knowledge, improve clarity, and
support the production of high quality artifacts.

How we comment in a review determines whether we are able to foster those positive
outcomes, or end up in a confrontation over the validity of our distinct perspectives.
In this blog post I'll talk about how you can approach reviews in a manner which is
more likely to succeed in more situations.

<!-- more -->

## Adding value as a reviewer
I'm a firm believer that without a goal it is impossible to develop a useful strategy or
evaluate the merit of a proposed one. So, before we dive into how to review the work of
others, let's first try to articulate why a review may be valuable and what we're trying
to accomplish as a reviewer.

::: tip Thought
There is a common trope that reviews ensure that work meets a quality bar, but all of us
have seen situations where reviewers let things slide. This can happen due to deadlines,
priorities, power differentials, social dynamics, or simply trust in the author.

*If that's true, then surely quality isn't the single reason why we conduct reviews, or we
wouldn't conduct them in these situations.*
:::

In my experience, the most enduring value gained from reviews is the social cohesion and
alignment that they are able to foster within a group of people. This alignment is the result
of shared understanding, goals, and the ability to effectively communicate intent within the
group. In these environments, reviews are used as an opportunity to discuss and refine an
idea until the author(s) and reviewer(s) have agreed upon a common representation of their
common understanding.

For this to happen, the interaction between an author and reviewer should be a conversation
with the mutual goal of shared understanding and a robust artifact of that understanding which may
be consumed by others to derive the same. As a reviewer, it is your job to create the space
for this conversation and you are singularly positioned to ruin any chance of that if you so wish.

## Cognitive Traps
When we look at a piece of work as a reviewer, we need to be aware of how our minds work and
the resulting cognitive traps we're likely to run into. We can mitigate some of this by being
aware of it and knowing what to look out for, but above all you should try to remember what
it is you're trying to accomplish.

The first trap that we'll often find ourselves in is the idea that we need to comment as a
reviewer. After all, you've been asked to review something, surely that means there must be
something that can only be improved by your input. There's a great story about
[A Duck](https://blog.codinghorror.com/new-programming-jargon/) which captures this crazy problem
in an amusing story, but the reality is that it is okay to review something and say "this looks
good to me". Used well, it'll save everyone a lot of time and emotional effort.

The second trap that I struggle with daily is anchored in the notion of cognitive dissonance.
When your brain is confronted by something that doesn't match its expectations, it perceives a
threat (in extreme cases, this can be a physiological response). When you see something done in
a way that doesn't match your expectations, your brain's first response is "this has to be wrong"
and "I don't feel good about this". Pause and ask your self whether you're responding because
you'd have done it differently, or because there's something fundamentally wrong with the approach.

## What to write
When we're reviewing a piece of work, we're going to end up spotting things that we want to
comment on. I find that these often fall into three distinct categories which each warrant
their own response.

### Objectively Incorrect
The simplest class of issue to deal with are those which are objectively incorrect. This may
be something that is clearly broken, information which is clearly missing or incorrect, or
simply something that you and the author automatically agree should be changed.

These issues are the easiest to deal with because they're not up for interpretation, and often
are an opportunity to share knowledge and improve our understanding. Being respectful and objective
in your comments here tends to work best.

#### Example Comment
> Based on what I can see in our config (link) this should read "a timeout of 2000ms" instead of the "500ms" you have here.
>
> &nbsp;&nbsp;&mdash; Example Commenter

### Subjectively Incorrect
In most cases, we aren't blessed with the benefit of objectively incorrect statements since
authors tend to do a good job of preparing their work before review. This leaves us with the
much more difficult task of dealing with statements which are subjectively incorrect. These are
things that, when read by you, appear to be incorrect but which may, when read by others, be correct.

These are the `${currentLocale.stapleFood}` of a reviewer's diet and they're an exquisite
opportunity to improve your understanding of a problem space, as well as a great chance for
the author to improve their ability to communicate ideas effectively to diverse audiences.

The first thing to keep in mind when commenting on something in this category is that there's
a good chance neither you or the author are wrong, but that you instead have different perspectives
and experiences which are worth sharing to improve your shared understanding. In my experience,
the best way to broach this topic is by sharing your interpretation and asking clarifying questions,
asking the author to roll the resulting conversation back into the document to help others understand
in future.

::: tip
It can sometimes be hard to distinguish between subjectively incorrect and objectively incorrect
items, after all, they both appear to be incorrect to you. I've found that when in doubt articulating
your understanding is the best way to create room for a conversation in which both you and the author
are open to learning from one another.
:::

#### Example Comment

> When I read this, it makes me think that we're looking to switch to this approach for
> all existing systems as part of the MVP, which I'm guessing isn't your intention. If
> you're planning on targeting a smaller subset, would you mind calling that out explicitly
> here so that there isn't the risk of others misinterpreting the intent?
>
> &mdash; Example Commenter

### Dissonance
If we're talking numerous, this is going to be the comment you want to leave most frequently. Every
time your brain sees something that doesn't quite feel right, a sentence which doesn't read quite
the way you'd have written it, there's a little voice in the back of your brain that will shout
"let's fix that!". As a reviewer you will need to be able to separate things that are truly incorrect
and those which just feel wrong to you but are perfectly valid.

I find that the best way to do this is to re-visit the question of why we're reviewing in the first
place and ask myself whether I'm contributing value by asking for a change, or not. Remember that
interpretation is not absolute and even the best aligned of people will still produce different work
for the same brief. As such, you should be aiming to find a good balance between things that aren't
as you wish and things that risk common misunderstanding in their current form.

In general, the right way to approach commenting on these issues is to simply avoid doing so altogether.
What may be a value adding change to you may have the opposite effect for another reviewer or author,
and focusing on these takes time away from the portions of the work where true value can be gained.

## Safe spaces
You'll notice that at no point in this post have I talked about expectations for authors. This is not
an accident, as reviewers we are in the position of being able to look upon the work of another and
provide our opinions. That is a position of immense privilege and power, regardless of the power dynamics
between those individuals outside this context, and it's something that can easily become toxic if abused.

If you've ever been unfortunate enough to be on the receiving end of a spiteful/vengeful review, then
you'll know how disheartening and difficult it can be to invest in the process afterwards. Conversely,
while it may be frustrating as a reviewer to deal with an author who is uncooperative, the power dynamics
of the roles often insulate the reviewer from the same impact.

In many cases, we also see that reviewers have a tendency to be the more senior member in the conversation,
or hold a position of power (hence the request for a review). This places them in a position to help guide
and mentor the author, while when these roles are reversed they have the opportunity to mentor the reviewer
by answering their questions empathetically.

As such, I firmly believe that it is the responsibility of the reviewer to take the initiative in
creating and maintaining a constructive space for these conversations to happen. I'm also a firm believer
in developing processes which optimize for the healthy case and deal with exceptions through a separate
exception handling process. Building provision into your review process to deal with uncooperative authors
is like placing police officers in schools - they're going to find a reason to use the process and it's going
to do actual harm to those who are just doing their best.

## Closing thoughts
To wrap this up, reviews are an opportunity for us to socialize ideas and reach a shared
understanding with our peers. They're an incredibly powerful tool to shape your culture,
but they require us to perform them from a position of empathy and understanding.

As we navigate the spectrum from "things we can all agree are wrong" to "things I don't like"
we need to work harder to leave space for everyone's subjective interpretation and individual
creativity. That means shifting from a "this is wrong and needs to be changed" approach to a
"I don't think I understood this the way you intended, could we phrase it differently to avoid
others making that same mistake?" and even knowing when not to comment at all.

At the end of the day, the best reviews are those which we finish, with a better artifact, a
common understanding of the idea, and everyone being a little bit happier to have collaborated
with each other. Hopefully this guidance helps you take part in more of these reviews in future.
