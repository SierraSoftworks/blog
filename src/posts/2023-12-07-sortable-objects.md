---
title: Sortable Objects
description: |
    Advent of Code 2023 has just kicked off, and I'm going to try something a bit
    different this year, I'm going to try and share useful concepts and patterns
    that play a role in solving each day's puzzle.

    Today, I wanted to talk about making your objects sortable and how you can use
    this to take advantage of the built-in sort functionality in your language of
    choice.

date: 2023-12-07T00:00:00.000Z
permalinkPattern: :year/:month/:day/:slug/
categories:
  - development
  - advent-of-code
tags:
  - rust
  - advent-of-code
  - development
---

# Sortable Objects
Advent of Code 2023 has just kicked off, and I'm going to try something a bit
different this year, I'm going to try and share useful concepts and patterns
that play a role in solving each day's puzzle.

Today, I wanted to talk about making your objects sortable and how you can use
this to take advantage of the built-in sort functionality in your language of
choice. This is an incredibly useful pattern to know about, and one which I
found useful for Day 7 of Advent of Code 2023.

<!-- more -->

## How Sorting Works
When it comes to sorting things, there are two main problems we face: deciding
which order things should appear in, and then the algorithm used to perform the
actual sorting. In most languages, the algorithm is already taken care of for
us as part of the standard library (often implemented using a stable QuickSort)
so the main thing we need to worry about is how to decide which order things
should appear in.

In many cases, I find folks reaching for the ability to provide a custom sorting
callback, which is great for quick and dirty once-off sorting, but when it comes
to building reusable code, it can artificially result in a lot of code duplication.

## Natively Orderable Objects
Of course, we know that for most language primitives (numbers and strings in particular)
sorting "just works" without you needing to provide a custom sorting callback. In
an ideal world, this is how our custom objects would work too, and fortunately, most
languages provide a way to do just that.

In Rust, we can avail of the `std::cmp::Ord` and `std::cmp::PartialOrd` traits to
describe how objects should be ordered. In trivial cases, you can use `#[derive(...)]`
to implement these, but let's talk about doing so explicitly.

::: tip
Rust isn't the only language that supports this type of functionality, and you can
achieve similar results in C# by implementing the `IComparable` interface, in Python
by implementing the `__lt__` and `__gt__` methods, and in Go by implementing the
`sort.Interface` interface.
:::

### Sorting `enum`s in Rust
Let's start with a simple `enum` which we want to be able to sort. In this case,
we'll use a `Direction` enum which represents the four cardinal directions.

```rust
enum Direction {
    North,
    East,
    South,
    West,
}
```

If we wanted to sort these in clockwise order, we could do so by implementing the
`std::cmp::Ord` trait ourselves, or we could instead use `#[derive(...)]` and define
constant values for our enum variants.

```rust
#[derive(PartialEq, Eq, PartialOrd, Ord)]
enum Direction {
    North = 0,
    East = 1,
    South = 2,
    West = 3,
}
```

::: tip
In order to implement `Ord` you'll need to implement `Eq`, same goes for `PartialOrd`
and `PartialEq`. This is because `Ord` and `PartialOrd` are traits which extend `Eq`
and `PartialEq` respectively, so you'll need to implement the base traits before you
can implement the extended ones.
:::

### Sorting `struct`s in Rust
Of course, not everything in Rust is an `enum`, and we'll often want to sort `struct`s
too. Let's imagine that we've got a `Complex` number type as shown below.

```rust
#[derive(PartialEq, Eq)]
struct Complex {
    real: f64,
    imaginary: f64,
}
```

If we'd like to spiral-sort this (i.e. first by distance from the origin, then by angle),
we would need to implement our own sort function to perform the necessary transforms.
Let's do that, and take the time to implement this in a clean and reusable manner.
We'll start by implementing support for converting our `Complex` type to polar coordinates.

<!-- cspell:ignore powi -->
```rust
impl Complex {
    pub fn new(real: f64, imaginary: f64) -> Self {
        Self { real, imaginary }
    }

    pub fn to_polar(&self) -> (f64, f64) {
        // Don't you just love Rust's lovely math extensions?
        let r = (self.real.powi(2) + self.imaginary.powi(2)).sqrt();
        let theta = self.imaginary.atan2(self.real);

        (r, theta)
    }
}
```

Now that we can easily retrieve the polar coordinates for our `Complex` number, we can
implement `std::cmp::PartialOrd` for it.

```rust
impl std::cmd::PartialOrd for Complex {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        let (r1, theta1) = self.to_polar();
        let (r2, theta2) = other.to_polar();

        // First, compare the distance from the origin
        let distance = r1.partial_cmp(&r2);
        if distance != Some(std::cmp::Ordering::Equal) {
            return distance;
        }

        // If the distance is the same, compare the angle
        theta1.partial_cmp(&theta2)
    }
}
```

With this, we can now easily sort our `Complex` numbers using the built-in `sort` function.

```rust
let mut numbers = vec![
    Complex::new(1.0, 1.0),
    Complex::new(2.0, -1.5),
    Complex::new(1.0, -1.0),
    Complex::new(0.0, 0.0),
    Complex::new(-1.0, -1.0),
    Complex::new(-2.0, 1.5),
    Complex::new(-1.0, 1.0),
];

// Sort the numbers by their position in the spiral
numbers.sort();
```

## Conclusion
I find that incorporating this pattern can help significantly reduce the amount of
duplicated sort code lying around your code bases and allows you to take advantage
of built-in sort functionality for solving interesting problems (like ordering
the winning hands in a game of cards).
