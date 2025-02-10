---
title: "Scaling for Latency with Async I/O"
date: 2018-09-15T17:41:49+00:00
categories: ["development", "patterns"]
tags: ["development", "patterns"]
draft: true
sitemap: false
comments: false
---

I've just spent the last month rewriting the core component in a monitoring stack which is responsible for protecting the availability
of a billion dollar per year franchise. The purpose of this rewrite was to improve the ability of our engineers to implement new features
in a safe, quick and easy way - what we delivered ended up offering a four order of magnitude performance and efficiency improvement
over our previous system.

Let's talk about how that happened, why it was possible and how we achieved that without it being a focal point of the redesign.
I'm going to discuss evented input-output, often referred to as `async`.

Hopefully, by the time you've finished reading this article you should have a good grasp of what evented IO is, how it works and
some of the situations in which it has a lot to offer - as well as some of the significant advantages it has over alternative
approaches when we start talking about large scale production systems.

<!--more-->

## What is Async I/O?

> **TODO**: Talk about how async io uses a combination of coroutines, event loops and tasks
>
> **TODO**: Talk about how

## Effects on Scalability

> **TODO**: Talk about how blocking I/O requires you to scale your compute resources to meet the needs of increased latency.
> Show maths that demonstrates this for a given pipeline.

### How a simple application behaves

> **TODO**: Talk about how a basic application performing a single task works and how it needs to be scaled as your request rate and latency increase.

### How to scale a simple application

> **TODO**: Show how one could scale  the simple application by adding more processes or threads.

### How performance changes when latency increases
