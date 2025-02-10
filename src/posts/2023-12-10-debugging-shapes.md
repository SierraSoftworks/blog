---
title: Debugging Shapes
description: |
    Advent of Code 2023 has just kicked off, and I'm going to try something a bit
    different this year, I'm going to try and share useful concepts and patterns
    that play a role in solving each day's puzzle.

    Today, I want to talk about some cool tricks for visualizing shapes in your
    application's debug output by taking advantage of Unicode's Box-drawing
    characters.

date: 2023-12-10T00:00:00.000Z
permalinkPattern: :year/:month/:day/:slug/
categories:
  - development
  - advent-of-code
tags:
  - rust
  - advent-of-code
  - development
---

# Debugging Shapes
Advent of Code 2023 has just kicked off, and I'm going to try something a bit
different this year, I'm going to try and share useful concepts and patterns
that play a role in solving each day's puzzle.

Today, I want to talk about some cool tricks for visualizing shapes in your
application's debug output by taking advantage of Unicode's Box-drawing
characters. Most humans are visual creatures and have an incredible ability to
spot patterns and interpret visual representations of data, so taking advantage
of some of the tricks I've previously shared in [Displaying Objects in Rust][1],
we can make our debugging output much more useful.

[1]: ./2023-12-03-rust-display.md

<!-- more -->

## Drawing Shapes with ASCII
Before we get into the Unicode box-drawing characters, this post wouldn't be complete
without the obligatory ASCII art example. ASCII art is the most common way you'll find
shapes being represented in text, and I know I'm regularly guilty of using it in my own
code because it just doesn't require any significant effort to get started.

```ascii:no-line-numbers
+--------------------------------------------------------------------------+
| Here's an example of what ASCII boxes and progress bars can look like... |
+--------------------------------------------------------------------------+

 10% [########                                                                        ] 32/324
```

As you can see, this works pretty well for simple shapes, but let's imagine we wanted to
draw a map of a set of pipes. We might decide to use the hyphen (`-`) and pipe (`|`)
characters to represent vertical and horizontal pipes, however if we wanted to represent
corners we'd need to resort to using `7`, `L`, `J`, and maybe `F` characters to represent
the four different corners. The results can be... difficult to read.

<!-- cspell:disable -->
```ascii:no-line-numbers
 F----7F7F7F7F-7    
 |F--7||||||||FJ    
 || FJ||||||||L7    
FJL7L7LJLJ||LJ L-7  
L--J L7   LJF7F-7L7 
    F-J  F7FJ|L7L7L7
    L7 F7||L7| L7L7|
     |FJLJ|FJ|F7| LJ
    FJL-7 || ||||   
    L---J LJ LJLJ   
```
<!-- cspell:enable -->

This is where Unicode box-drawing characters come in handy, because they allow us to
use appropriate characters for these corners. For example, we could use the `┌`, `┐`,
`└`, and `┘` characters to represent the four corners of our pipes, and the `─` and `│`
characters to represent the horizontal and vertical pipes.

```ascii:no-line-numbers
 ┌────┐┌┐┌┐┌┐┌─┐    
 │┌──┐││││││││┌┘    
 ││ ┌┘││││││││└┐    
┌┘└┐└┐└┘└┘││└┘ └─┐  
└──┘ └┐   └┘┌┐┌─┐└┐ 
    ┌─┘  ┌┐┌┘│└┐└┐└┐
    └┐ ┌┐││└┐│ └┐└┐│
     │┌┘└┘│┌┘│┌┐│ └┘
    ┌┘└─┐ ││ ││││   
    └───┘ └┘ └┘└┘   
```

Personally, I find the latter substantially easier to read. Not just that, but when used
for user interfaces, it can make the output look much more polished and professional (as
well as giving you tools for visualizing additional information which would otherwise
be confusing with just ASCII).

```ascii:no-line-numbers
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │ Here's an example of the unicode version, along with a nice progress bar showing          │
 │ in-progress work using a different weight block...                                        │
 └───────────────────────────────────────────────────────────────────────────────────────────┘

 10% [████████░░░░                                                                    ] 32/324
```

This pattern is used in a wide range of command line utilities, including `git log --graph`,
and the `top` command. It's also widely supported (after all, this is rendering in your
web browser) and the fact that it's text based means that it's trivially easy to output
using your existing console logging infrastructure.

## The Unicode Box-drawing Characters
In total, there are 128 different [box-drawing characters][2], and another 32 box-element
characters (used for filling/tiling boxes) which combine to give a pretty comprehensive
set of tools for generating boxes and lines. Keeping things simple, we're going to focus
on the following:

```ascii:no-line-numbers
 ┌──────── ─ ────────┐ 
 │ ↖       ↑      ↗ 
 │  NW    Top    NE  │ ← Side
 │                   │
 │  SW   Bottom  SE  │  ░░░░░░░ ← Fills → ███████
 │ ↙       ↓      ↘ 
 └──────── ─ ────────┘
```

Let's imagine we plan to represent our pipe schematic using a 2D array of pipe elements,
something along the lines of:

```rust
enum PipeElement {
    None,
    Horizontal,
    Vertical,
    TopLeftCorner,
    TopRightCorner,
    BottomLeftCorner,
    BottomRightCorner,
}

struct Schematic(Vec<Vec<PipeElement>>);
```

Implementing `std::fmt::Display` for these types and using the box-drawing characters
is done using simple pattern matching and an iteration over our schematic row-by-row,
and then column-by-column, printing out each character as we go.

```rust
impl std::fmt::Display for PipeElement {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            PipeElement::None => write!(f, " "),
            PipeElement::Horizontal => write!(f, "─"),
            PipeElement::Vertical => write!(f, "│"),
            PipeElement::TopLeftCorner => write!(f, "┌"),
            PipeElement::TopRightCorner => write!(f, "┐"),
            PipeElement::BottomLeftCorner => write!(f, "└"),
            PipeElement::BottomRightCorner => write!(f, "┘"),
            // An awesome feature of pattern matching is that it's exhaustive, so
            // if you added a new pipe element type, you'd get a compiler error
            // here until you added a new match arm.
        }
    }
}

impl std::fmt::Display for Schematic {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        // You'll notice this pattern being used extensively for rendering
        // 2D arrays, and it's the a big part of why we usually represent such arrays
        // in `[y][x]` order.
        for row in self.0.iter() {
            for element in row {
                write!(f, "{}", element)?;
            }
            writeln!(f)?;
        }
        Ok(())
    }
}
```

We could even take this a step further and parse our original schematic from its ASCII
representation using the tricks shown in [Type Converters in Rust][3] and then print it out using the box-drawing characters.

<!-- cspell:disable -->
```rust
impl FromStr for Schematic {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let mut rows = Vec::new();
        for line in s.lines() {
            if line.trim().is_empty() {
                continue;
            }

            let mut row = Vec::with_capacity(line.len());
            for c in line.chars() {
                let element = match c {
                    ' ' => PipeElement::None,
                    '-' => PipeElement::Horizontal,
                    '|' => PipeElement::Vertical,
                    'F' => PipeElement::TopLeftCorner,
                    '7' => PipeElement::TopRightCorner,
                    'L' => PipeElement::BottomLeftCorner,
                    'J' => PipeElement::BottomRightCorner,
                    _ => return Err(format!("Invalid character: {}", c)),
                };
                row.push(element);
            }
            rows.push(row);
        }
        Ok(Self(rows))
    }
}

fn main() {
    let schematic = Schematic::from_str(
        r#"
 F----7F7F7F7F-7    
 |F--7||||||||FJ    
 || FJ||||||||L7    
FJL7L7LJLJ||LJ L-7  
L--J L7   LJF7F-7L7 
    F-J  F7FJ|L7L7L7
    L7 F7||L7| L7L7|
     |FJLJ|FJ|F7| LJ
    FJL-7 || ||||   
    L---J LJ LJLJ   
        "#,
    )
    .unwrap();

    println!("{}", schematic);
}
```
<!-- cspell:enable -->

And wouldn't you know it, we get our lovely representation out the other side!

```ascii:no-line-numbers
 ┌────┐┌┐┌┐┌┐┌─┐    
 │┌──┐││││││││┌┘    
 ││ ┌┘││││││││└┐    
┌┘└┐└┐└┘└┘││└┘ └─┐  
└──┘ └┐   └┘┌┐┌─┐└┐ 
    ┌─┘  ┌┐┌┘│└┐└┐└┐
    └┐ ┌┐││└┐│ └┐└┐│
     │┌┘└┘│┌┘│┌┐│ └┘
    ┌┘└─┐ ││ ││││   
    └───┘ └┘ └┘└┘   
```

## Conclusion
I hope you find this pattern useful, in my case combining it with the ability to fill in
blocks using the Unicode block elements helped me spot several issues with the logic I
implemented for Advent of Code 2023 Day 10, and it also resulted in a gorgeous looking
map to help me track down where a cute little robot was hiding.

[2]: https://en.wikipedia.org/wiki/Box-drawing_character
[3]: ./2023-12-02-from-rust.md
