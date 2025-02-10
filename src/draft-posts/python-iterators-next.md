---
title: Python Iterators, Next
date: 2018-12-07 21:36:15
categories:
  - development
tags: 
  - development
comments: true
sitemap: false
draft: true

# cspell:ignore mylist
---


**How iterators work in Python, details about the `next` function and a lesson from production**

Recently we had an outage. It was a small one, by all accounts and as a result of the way our system is designed, it didn't impact any users,
lose any data and wasn't in any way noticeable to anybody except us. It did happen though and that's a problem.

The cause of this outage was pretty simple, engineer A designed a nice new feature in library X; engineer B liked this feature and decided
to use it in service Y. This is a daily occurrence and is generally a very good thing, new, cleaner solutions help you constantly refactor
away technical debt and improve the readability and all important maintainability of your code.

This time, however, it went wrong and caused an outage so let's talk about how that happened and take a detour through the land of Python
iterators at the same time.

<!--more-->

## What is an iterator?

Put quite simply, an iterator is an object which allows you to iterate over it. "Really, Sherlock?" I hear you saying, but give me a second.
Iterators are common in a number of languages and in general the contract you'll see them adhere to is that there's a method to get an
iterator and a method to retrieve the next value from the iterator.

Let's hop straight to a code example and show you what that looks like...

```python
mylist = [1, 2, 3]
iterator = iter(mylist)
one = next(iterator)
two = next(iterator)
three = next(iterator)
```

Obviously you also need a way to stop the iterator once it reaches its end, which is where the Python `StopIteration` exception comes in.
Many languages have different ways of implementing this - whether it's a `boolean` return value or a method on the iterator itself to
determine whether it is exhausted.

Sure, that's cool, but "What about a `for` loop?" I hear you asking. Well, the beauty of an iterator is that it is able to iterate over
infinite sequences without needing to (necessarily) hold them in memory. This is an incredibly powerful feature and you'll see it applied
everywhere from database clients to realtime newsfeeds and more.

Let's show you what an example of that might look like...

```python
def counter():
  i = 0
  while True:
    i += 1
    yield i
    
iterator = iter(counter())
one = next(iterator)
two = next(iterator)
three = next(iterator)
# ...
```
