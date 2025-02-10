---
title: Iterators in Rust
description: |
    Advent of Code 2023 has just kicked off, and I'm going to try something a bit
    different this year, I'm going to try and share useful concepts and patterns
    that play a role in solving each day's puzzle.

    Today, we're looking at iterators (in Rust) and how they can be used to
    simplify your code by abstracting away the complex details of incremental
    computation.

date: 2023-12-01T00:00:00.000Z
permalinkPattern: :year/:month/:day/:slug/
categories:
  - development
  - advent-of-code
tags:
  - rust
  - development
  - advent-of-code

# cspell:ignore functools
---

# Iterators in Rust
Advent of Code 2023 has just kicked off, and I'm going to try something a bit
different this year, I'm going to try and share useful concepts and patterns
that play a role in solving each day's puzzle.

Today, we're looking at iterators (in Rust) and how they can be used to
simplify your code by abstracting away the complex details of incremental
computation.

<!-- more -->

## What are Iterators?
Iterators are a general concept in computer science which allow you to take
advantage of re-entrant functions to iteratively generate a sequence of values.
They are an extremely powerful tool for computing across large data sets because
they (usually) operate in bounded memory, avoiding the cost of allocating large
temporary data structures to hold intermediate results.

In Rust, and many other languages, iterators are a first-class feature which can
be consumed through `for` loops, or combined with higher-order functions
to describe computational pipelines.

At their core, iterators expose a method called `next` which returns the next
item in a sequence. There is usually a form of end marker (either a separate `has_next`
function or a special value returned by `next`) which indicates when the sequence
has been exhausted.

Let's start with a simple iterator which returns an infinite sequence of the number
`0`. As you can see, there's really not a huge amount to it - simply returning `Some(0)`
every time `next` is called.

```rust{7}
struct ZeroIterator;

impl Iterator for ZeroIterator {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        Some(0)
    }
}
```

If we wanted to abuse our terminal emulator, we could write a program which prints
these values to the screen forever, which highlights how easy it is to use iterators
in Rust.

```rust{2-4}
fn main() {
    for value in ZeroIterator {
        println!("{}", value);
    }
}
```

## Using Iterators for Parsing
One of the really powerful uses of iterators is doing repeatable parsing of a sequence
of input data. This is especially useful when you have enough data that you don't want
to `alloc` memory for it all at once.

::: tip
Even in situations where you are going to be allocating memory for a substantial portion
of the input data, you may still find that iterators allows you to more easily split your
code into functional units for testing and reuse.
:::

Let's take the example of extracting a sequence of numbers from a string. We'll start by
defining our iterator type which takes a reference to our input string. We're hoping to
be efficient about our memory usage here, so rather than taking a copy of the string data
(using `String`) we'll instead use a reference to the input data (using `&str`).

Of course, this means that our iterator's lifetime is intrinsically tied to the lifetime of
the input string, so we'll express that with the `'a` lifetime parameter on our iterator
type and the `&'a str` pointer.

```rust
struct NumberIterator<'a> {
    input: &'a str,
}
```

Next, we'll need to implement the `Iterator` trait for our type. We'll start out with an
empty iterator implementation and take a bit of a TDD approach to solving this. Let's
start out by having our iterator return `None` every time `next` is called (indicating
an empty sequence).

```rust
impl<'a> Iterator for NumberIterator<'a> {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        None
    }
}
```

We'll then add some tests to confirm that this works as we expect it to. While
the first two tests pass, the last one doesn't (which makes sense, since we
haven't actually done anything useful yet).

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // ✅ Passes
    #[test]
    fn empty() {
        let mut iter = NumberIterator { input: "" };
        assert_eq!(iter.next(), None);
    }

    // ✅ Passes
    #[test]
    fn no_numbers() {
        let mut iter = NumberIterator { input: "abc" };
        assert_eq!(iter.next(), None);
    }

    // ⚠️ Fails
    #[test]
    fn one_number() {
        let mut iter = NumberIterator { input: "123" };
        assert_eq!(iter.next(), Some(123));
        assert_eq!(iter.next(), None);
    }
}
```

So let's re-visit our iterator implementation and see if we can get this test to pass.
We're going to scan through the input string until we find a digit character, then consume
digits until we reach either the end of the string or a non-digit character, and finally
return the parsed number.

```rust
impl<'a> Iterator for NumberIterator<'a> {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // If we've reached the end of the input, we're done
        // and shouldn't return any more values.
        if self.input.is_empty() {
            return None;
        }

        // Let's create a new string to hold our digits
        // as we read them from the input. We could use
        // a pre-allocated buffer tied to `self` here
        // if we wanted to be very performance conscious.
        let mut digits = String::new();

        // Then move through our input string one character
        // at a time.
        while let Some(c) = self.input.chars().next() {
            // Make sure we move the string forward one
            // position (past the character we just consumed).
            self.input = &self.input[1..];

            // If the character is a digit, then we'll add it to
            // our scratch-pad
            if c.is_digit(10) {
                digits.push(c);

            // If the character isn't a digit, and we have some
            // digits in our scratch-pad, then we've clearly hit
            // the end of a number and can proceed to parsing.
            } else if !digits.is_empty() {
                break;
            }
        }

        // If we couldn't find any digits before the end of the
        // string, then return None to indicate that we're done.
        if digits.is_empty() {
            None
        } else {
            // Otherwise, parse the digits we found and return them.
            // And yeah, I know, we should be returning the result
            // instead of using `unwrap` (which could panic), but
            // this is just a toy example.
            Some(digits.parse().unwrap())
        }
    }
}
```

Now if we run our tests, we will find that they all pass, and we can expand them a
bit with the following new additions to the family.

```rust
#[test]
fn two_numbers() {
    let mut iter = NumberIterator { input: "123 456" };
    assert_eq!(iter.next(), Some(123));
    assert_eq!(iter.next(), Some(456));
    assert_eq!(iter.next(), None);
}

#[test]
fn number_in_word() {
    let mut iter = NumberIterator { input: "abc123def" };
    assert_eq!(iter.next(), Some(123));
    assert_eq!(iter.next(), None);
}
```

The cool part here is that we can now do some interesting things with this iterator
and the `Iterator` trait's higher-order functions. For example, we can quickly extract
all of the numbers in a string into their own array.

```rust
let input = "abc123def456ghi789jkl";
let numbers: Vec<_> = NumberIterator { input }.collect();
assert_eq!(numbers, vec![123, 456, 789]);
```

## Using Iterators for Computation
This brings us to where iterators really start to shine: using them to construct
computational pipelines. You'll find that this pattern can be extremely expressive
and allows you to articulate complex data transforms in a very concise and readable
way.

We're going to start out with the simplest possible example: summing a sequence of
numbers. Let's use our `NumberIterator` from above to sum the numbers in a string
(technically Rust has the `.sum()` helper for this, but we're going to use `.fold()`
instead as it is more generically useful).

::: tip
You'll find the same function in many languages, including Python's `functools.reduce()`,
JavaScript's `Array.reduce()`, and C#'s `Enumerable.Aggregate()`. As a concept, this
is the "reduce" portion of MapReduce.
:::

`fold()` works by taking an initial "state" value (`0` in our case) and a function which
transforms a previous `state` and the next value in the sequence into a new `state` value.
In our case, we're naming the previous state `sum` and the next value `n`, and then
combining these using the add (`+`) operation.

```rust
let input = "abc 1 def 2 ghi 3 jkl 4";
let sum = NumberIterator { input }.fold(0, |sum, n| sum + n);
```

Behind the scenes, this expands into code which looks something like the following:

```rust
// This is our initial state value
let mut sum = 0;
for n in NumberIterator { input } {
    // This is the body of our aggregation function |sum, n| sum + n
    sum = sum + n;
}
```

We can also use `fold()` to do more complex computations, such as finding the average
of a number in a sequence. To do this, we'll need to keep track of two values: the
sum of the numbers we've seen so far, and the count of the numbers we've seen so far.
We can use Rust's support for tuples to do this, unpacking the resulting tuple to
compute the final average.

```rust
let input = "abc 1 def 2 ghi 3 jkl 4 mno 5";


let (sum, count) = NumberIterator { input }
    .fold((0, 0), |(sum, count), n| (sum + n, count + 1));
let average = sum as f64 / count as f64;
```

We can also get a bit sillier, incrementally computing the average as we go. This
involves computing a weighted average where the weight of each number is `1 / count_so_far`
and the weight of the previous average is `1 - (1 / count_so_far)`. This involves doing
division on the hot path, which although it's still `O(N)` is a lot slower than simple
addition due to the way modern CPU hardware performs addition vs division. Still, this
is a toy example and it's a good demonstration of some more complex logic.

```rust
let input = "abc 1 def 2 ghi 3 jkl 4 mno 5";

let average = NumberIterator { input }
    .enumerate()
    .fold((0.0, 0.0), |(average, count), (i, n)| {
        let count = count + 1.0;
        let weight = 1.0 / count;
        let average = (average * (1.0 - weight)) + (n as f64 * weight);
        (average, count)
    }).0;
```

There's also a plethora of other higher-order functions which you can use to build
more complex pipelines. For example, if we were asked to find the largest number divisible
by `3` in a sequence, returning `0` if we couldn't find any, we could do that using the
following pipeline.

```rust
let input = "abc 1 def 2 ghi 3 jkl 4 mno 5 pqr 6 stu 7 vwx 8 yz 9";

let largest_divisible_by_3 = NumberIterator { input }
    .filter(|n| n % 3 == 0)
    .max()
    .unwrap_or_default();
```

I don't know about you, but I find that to be a hell of a lot easier to read than the
equivalent imperative code (especially if you don't include our lovely `NumberIterator`).

```rust
let input = "abc 1 def 2 ghi 3 jkl 4 mno 5 pqr 6 stu 7 vwx 8 yz 9";

let mut largest_divisible_by_3 = 0;

let mut digits = String::new();
for c in input.chars() {
    if c.is_digit(10) {
        digits.push(c);
    } else if !digits.is_empty() {
        let n = digits.parse().unwrap();
        if n % 3 == 0 && n > largest_divisible_by_3 {
            largest_divisible_by_3 = n;
        }
        digits.clear();
    }
}

// And we need to remember to handle boundary condition at
// the end of the string, or we'll miss the last number.
if !digits.is_empty() {
    let n = digits.parse().unwrap();
    if n % 3 == 0 && n > largest_divisible_by_3 {
        largest_divisible_by_3 = n;
    }
}
```

## Conclusion
Iterators are one of my favourite tools in any language, allowing us to construct
efficient pipelines for processing and transforming data. They're also an awesome
tool for extracting reusable logic from your code and enabling you to test it in
isolation.

While many languages have support for some form of iterator/generator for in-memory
data, you'll also find that similar patterns can be implemented on top of most language's
Stream APIs (e.g. C#'s `Stream`, Go's `io.Reader`/`io.Writer`, and Rust's `std::io::Read`/`std::io::Write`).
In fact, you'll likely find that your language of choice uses this
pattern to add TLS support to TCP connections, or to introduce compression/decompression
support for HTTP requests.

I hope you find this a useful bit of inspiration for Advent of Code 2023 Day 1, and beyond!
