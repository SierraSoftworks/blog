---
title: Optimizing Data Algorithms
description: |
    Advent of Code 2023 has just kicked off, and I'm going to try something a bit
    different this year, I'm going to try and share useful concepts and patterns
    that play a role in solving each day's puzzle.

    Today, I'm going to talk about some how I go about optimizing algorithms for
    practical performance on data-intensive problems in Rust.

date: 2023-12-14T00:00:00.000Z
permalinkPattern: :year/:month/:day/:slug/
categories:
  - development
  - advent-of-code
tags:
  - rust
  - advent-of-code
  - development
---

# Optimizing Data Algorithms
Advent of Code 2023 has just kicked off, and I'm going to try something a bit
different this year, I'm going to try and share useful concepts and patterns
that play a role in solving each day's puzzle.

Today, I'm going to talk about some how I go about optimizing algorithms for
practical performance on data-intensive problems in Rust. I find that knowing
how to optimize algorithms for practical performance is one of those skills that
many overlook because it's rarely talked about, and yet it can have significant
implications on performance for your applications.

<!-- more -->

## Reasoning About Performance
When it comes to optimization, it's important to recognize that the theoretical
performance characteristics of an algorithm do not necessarily translate directly
to practical performance. When talking about theoretical performance, the primary
tool that we use is [Big-O notation](https://en.wikipedia.org/wiki/Big_O_notation),
which allows us to describe the scaling characteristics of an algorithm as a function
of its input size.

We commonly see Big-O notation representations like the following:

| Big-O | Description |
| ----- | ----------- |
| $$O(1)$$  | As the input size increases, the execution time remains constant. |
| $$O(log n)$$ | As the input size increases, the execution time increases logarithmically (i.e. slower than the input size increases). |
| $$O(n)$$ | As the input size increases, the execution time increases linearly (i.e at the same rate as the input size increases). |
| $$O(n^2)$$ | As the input size increases, the execution time increases quadratically (i.e. faster than the input size increases). |
| ... | And a range of other variants which generally represent even worse scaling performance. |

One of the interesting properties of Big-O notation is that we generally divide out
any constants, so whether an algorithm is $O(5n)$ or $O(2000n)$, we represent
it as $O(n)$, because the constant factor is not relevant to the theoretical scaling
(more specifically, the constant divides out when you compare two different input sizes).

Of course, when it comes to practical performance, this constant factor can make the
difference between something which is "fast enough" and something which is far too slow
to be practical. I still recall my 4th year embedded systems lecturer highlighting the
incredible difference between execution time on $a + b$ and $a / b$ on a small micro-controller,
and how this informs algorithmic design there - so why not in larger systems as well?

## Practical Performance
When it comes to practical performance, there are really two things that I find myself
focusing on: what those constant factors are, and as well as any hidden scaling factors
involved in the implementation itself.

### Slow Operations
As fancy as our computers are, they are effectively calculators at the end of the day, and
calculators are really just a cursed [Abacus](https://en.wikipedia.org/wiki/Abacus). When
it comes to performance of different operations, it's important to note that some operations
are intrinsically far harder to implement efficiently in hardware than others. For example,
simple integer addition is about $3\times$ faster than floating point addition because
it can be implemented with a rudimentary adder circuit, while floating point addition requires
a complex state machine. Similarly, integer division is about $10\times$ slower than integer
addition for the same reason.

While these differences are fundamentally tiny on modern hardware and modern compilers are
often pretty good at optimizing the code you write to take advantage of these differences,
it can still be useful to be aware of them when doing extremely large numbers of iterations
(e.g. when Advent of Code asks you to run the same thing $10^9$ times).

Some cool tricks in this space include:

 - Dividing by powers of two is equivalent to a bit-shift, which is **much** faster than division.
   This lets you replace `x / 16` with `x >> 4` and `x / 1024` with `x >> 10` for some nice performance
   advantages (your compiler may take care of this for you, in which case maybe just write the human readable code).
 - Multiplying by powers of two is equivalent to a bit-shift, which is also faster than multiplication.
   This lets you replace `x * 16` with `x << 4` and `x * 1024` with `x << 10` in the same manner as the division
   approach.
 - Taking the remainder of a division by a power of two is equivalent to a bitwise AND, which is also faster
   than normal remainder division. This lets you replace `x % 16` with `x & (16 - 1)` and `x % 1024` with `x & (1024 - 1)`,
   the trick being that it only works for powers of two (and you need to be careful about negative numbers).

### Memory Allocation
One of the most common examples of how the code we write can include hidden scaling factors
is anywhere that memory is allocated on the heap. In most languages, this is not something
we think about and can be almost invisible. Indeed, even in languages like Rust which strive
to make this more obvious, unless you're looking for it you're unlikely to notice. Let's take
the following example which generates [Pascal's Triangle](https://en.wikipedia.org/wiki/Pascal%27s_triangle):

```ascii
Pascal's Triangle

        1
      1   1
    1   2   1
  1   3   3   1
1   4   6   4   1

And in Array Form:

1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
```

The simplest way to implement this involves creating a staggered array of arrays, represented
as a `Vec<Vec<u32>>` in Rust. This is a fairly compact memory representation, but has a tendency
to result in poor performance if you're not careful. Let's take the following example, which
takes somewhere in the range of 1.5ms to run, exhibiting $O(n^2)$ scaling (i.e. calculating
this for 1000 rows takes ~1.5ms while 10000 rows takes ~150ms - a $100\times$ increase).

```rust
fn main() {
    let height = 1000;
    let mut triangle = vec![vec![1u64], vec![1u64, 1u64]];

    for height in 2..=height {
        let mut row = vec![1u64];
        for i in 1..height {
            row.push(triangle[height-1][i - 1] + triangle[height-1][i]);
        }
        row.push(1u64);

        triangle.push(row);
    }
}
```

We know that this algorithm is going to be $O(n^2)$ because of the manner in which the inner
loop depends on the outer loop's index, however if we take a careful look at the code we can
see that we're allocating memory on the heap in multiple places (and in many cases, we're needing
to re-allocate as our `row` and `triangle` vectors grow). Indeed, we're potentially allocating
new memory on every one of the following highlighted lines!

```rust{3,6,8,10,12}
fn main() {
    let height = 1000;
    let mut triangle = vec![vec![1u64], vec![1u64, 1u64]];

    for height in 2..=height {
        let mut row = vec![1u64];
        for i in 1..height {
            row.push(triangle[height-1][i - 1] + triangle[height-1][i]);
        }
        row.push(1u64);

        triangle.push(row);
    }
}
```

What if I told you that simply telling the array how large it was going to be when you first
created it would cut about 30% off of the execution time on this algorithm (taking it from
about 1.5ms to about 1ms for 1000 rows)? Rust's `Vec::with_capacity(...)` method ensures
that the vector pre-allocates enough space to hold the number of elements specified, and
this means that as it grows, we don't need to regularly `realloc` the memory to add additional
space.

```rust{3,8}
fn main() {
    let height = 1000;
    let mut triangle = Vec::with_capacity(height + 1);
    triangle.push(vec![1u64]);
    triangle.push(vec![1u64, 1u64]);

    for height in 2..=height {
        let mut row = Vec::with_capacity(height+1);
        row.push(1u64);
        for i in 1..height {
            row.push(triangle[height-1][i - 1] + triangle[height-1][i]);
        }
        row.push(1u64);

        triangle.push(row);
    }
}
```

Okay, that's cool, and we've moved from 5 places where allocations may happen to only 2, but we're
still needing to allocate memory $O(n)$ times in the outer loop. So what happens if we avoid doing
that allocation as well? By trading off a bit of memory efficiency for performance (by allocating
a square array instead of a triangular one), we can drop the execution time in half again (to about 0.5ms).

::: tip
A good trick here is to treat any collections which grow as being a performance risk, and be ready
to pre-allocate their memory if you can. Interestingly, for certain classes of collection, this can
also significantly reduce the need for locking in multi-threaded/concurrent code.
:::

```rust{3}
fn main() {
    let height = 10000;
    let mut triangle = vec![vec![0; height+1]; height+1];
    triangle[0][0] = 1;

    for height in 1..=height {
        triangle[height][0] = 1;

        for i in 1..height {
            triangle[height][i] = triangle[height-1][i - 1] + triangle[height-1][i];
        }

        triangle[height][height] = 1;
    }
}
```

In this case, we've gone from an implementation which allocates memory $O(n^2)$ times to one which
only allocates memory $O(1)$ times and seen a 66% reduction in execution time as a result. Another
way to think about this is that by not paying attention to the performance cost of allocating memory
on the heap, our algorithm was $3\times$ slower than it needed to be!

### Reducing Work
Advent of Code 2023 Day 14 Part 2 is a fun one, it asks you to apply variations of the same transformation
to your input data, where the transforms are related to one another by the following invariant:

$$W(x) = S(R(x)) = E(R(R(x))) = N(R(R(R(x))))$$

Where $W(x)$ is the west transform, $S(x)$ is the south transform, $E(x)$ is the east transform, $N(x)$ is the north
transform function. This encourages you to implement only the $N(x)$ and $R(x)$ functions, and then
combine them to implement the other transforms, reducing the amount of code one needs to write significantly.
Of course, the problem here is that the $R(x)$ function is $O(n)$, and needing to apply it multiple times
to compute $W(S(E(N(x))))$ is a quick way to significantly increase the execution time of your solution.

In this case, implementing the transforms without the use of a $R(x)$ function allowed me to cut the execution
time of my solution from several seconds to about 400ms, even though it required more complex code to be written.

### Branch Prediction
Another fun aspect of performance is the role that branch prediction plays in how your code performs. If you
think of your computer's CPU as a factory in which requests to perform some work are queued and then need
to proceed through several steps before being completed, then you might imagine that if you can only start
working on a request once the result of a previous request is known, then you might end up with a lot of
workers standing around idle. `if` statements and other "branches" in your code are situations where your CPU
needs to know the result of a previous calculation before deciding which path to take, and without some indication,
you can end up with a "pipeline stall" where the factory sits around waiting.

The branch predictor is a piece of ~dark magic~ hardware which attempts to predict which branch will be taken
so that the factory can get a head start on the work needed to complete the request. If the branch predictor
is right, your code executes as if there was no branch at all and you can see significant performance benefits,
while if the branch predictor is wrong, you end up with a pipeline stall and your code runs slower than it
otherwise would have.

With this in mind, any code which introduces a condition onto the hot path has the potential to cause pipeline
stalls, so if you're able to move those conditions outside the hot path instead, there's the potential for
some degree of performance improvement.

::: tip
Branch predictors continue to improve with each CPU generation, so it's always worth benchmarking your code
on the hardware it'll be running on to see if there are any unexpected performance gains (or losses).
:::

### Concurrency
The last aspect of practical performance that I'll get into is concurrency: being able to run multiple
tasks at the same time. The trick here is that while concurrency has the potential to improve performance,
it also has the potential to make things significantly worse if you're not careful. The reason for this
comes down to the [Universal Scalability Law](http://www.perfdynamics.com/Manifesto/USLscalability.html)
which states that the performance ($C(n)$) of a system is governed by both the contention ($\alpha$) and
coherency ($\beta$) costs associated with the algorithm.

$$C(n) = \frac{n}{1 + \alpha (n-1) + \beta n (n-1)}$$

In practice, this means that systems which have $\beta > 0$ will get slower as you scale them beyond a
critical limit, and systems which have $\alpha > 0$ will eventually reach a point of diminishing returns.
The cool part about this is that both $\alpha$ and $\beta$ map directly to common patterns in our systems
and as a result we can build an intuition for both how they are likely to behave and how to avoid them.

When we talk about contention ($\alpha$) we're generally thinking about situations where multiple concurrent
actors (threads, processes, nodes, etc) are competing for a shared resource. This might be a common lock,
a queue, an external system, or anything which itself has limits on how many concurrent actors can interact
with.

::: tip
When we consider only the contention cost ($\alpha$), and assume that the coherency cost ($\beta$) is zero,
the equation simplifies to $C(n) = \frac{n}{1 + \alpha (n-1)}$ which is the same as Amdahl's Law. The empirical
description of Amadahl's Law is that the maximum speedup you can achieve by parallelizing a system is limited
by the proportion of the system which is inherently serial (i.e. the proportion of the system which cannot be
parallelized) - in other words, the point at which the system's performance is entirely limited by contention
on shared resources.
:::

Coherency ($\beta$) is where things start to get even more fun, because it relates to any situation where the
system needs to be able to agree on a common state (i.e. consistency). In other words, systems which require
higher degrees of consistency are intrinsically less scalable than systems which require lower degrees of
consistency. This is why we see systems like [Paxos](https://en.wikipedia.org/wiki/Paxos_(computer_science))
and [Raft](https://en.wikipedia.org/wiki/Raft_(computer_science)) which are designed to be highly consistent
have substantially lower throughput than systems like [DynamoDB](https://en.wikipedia.org/wiki/Amazon_DynamoDB)
which are inherently designed to shard their datasets and do not provide strong consistency guarantees across
these partitions.

In practice, this means that before we add concurrency to a system we need to understand both where contention
exists, and where there's a need for coherency (ordering of events). In the case of Day 14's problem, I found
that it could be modelled as two actors $A$ and $B$ in which $A$ is responsible for generating state snapshots
and $B$ is responsible for processing these to determine whether we had encountered a cycle. Each of these actors
is responsible for its own computational work, and there is a point of contention where $A$ needs to pass its
state to $B$ for processing.

In this case, the work that $A$ performs has $\alpha = 1, \beta = 1$ because it depends on the previous state
to generate the next state, making it inherently serial and impossible to parallelize effectively. Similarly,
$B$ needs to conditionally persist state, meaning that it also has $\alpha = 1, \beta = 1$ and cannot be safely
parallelized; however $A$ and $B$ do not depend on common resources and the order of executions between them are
not important (i.e. $\alpha = 0, \beta = 0$) making this a good candidate for parallelization. Indeed, by separating
these two actors and running them on parallel threads, I was able to halve the execution time of my solution.

## Conclusion
Much of our industry's talk about performance focuses on Big-O Notation and the theoretical performance of
algorithms to the exclusion of practical performance. This is a shame, because there's often so much performance
to be gained by considering the hidden factors which contribute towards our practical system performance. Hopefully
this post gives you some ideas about how you can approach optimizing your own practical code performance,
but keep in mind that performance really comes down to understanding the characteristics of your system and
what it is required to do.
