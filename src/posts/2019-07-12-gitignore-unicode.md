---
title: ".gitignore unicode"
date: 2019-07-12 16:35:00
permalinkPattern: :year/:month/:day/:slug/
categories:
    - development
    - operations
tags:
    - git
comments: true

# cspell:ignore libgit2
---

# .gitignore </3 Unicode

Have you ever run into a situation where Git just refused to obey your commands? No, I'm
not talking about that time you "typo-ed" `git commit` and ended up `git reset --hard`-ing
your repository back to the dawn of the universe, I'm talking about it really, truly,
ignoring you.

I have, so let me tell you a story about what happened and how I fixed it so that you can
avoid future hair-loss and avoid questioning the nature of your reality.

::: tip
*(For those who want to skip right to the punchline)*

Make sure your `.gitignore` file is saved in UTF-8 format, or you'll have a bad time.
:::

<!-- more -->

I like to think of myself as a pretty adept Git user. Sure, I use the odd user interface
from time to time, I play around with Git's porcelain commands and I know that there are
plumbing commands which I can use if I really need to automate things through the CLI. I've
also played around with [libgit2] (which you totally should at some point).

None of this prepared me for staring at my editor, wondering why on earth my `.gitignore` file
didn't seem to be working. I've been around the block, I've written `.gitignore` files. Hell,
I've even written [an app for that][git-tool].

 - ✓ It is named `.gitignore`
 - ✓ It has the correct file name in it
 - ✓ The file name isn't quoted out
 - ✓ There isn't another `.gitignore` overriding my ignore policy
 - ✓ The `.gitignore` is in a parent directory of the file I want to ignore
 - ✓ The ignored files aren't currently tracked by Git (nor have they ever been)
 - ✗ My sanity is dwindling

## Background
I'd just created a new project and added a quick `.gitignore` file. This was essentially
dumped out using `curl https://gitignore.io/api/go > .gitignore` to bootstrap the project
and I had no reason to doubt that it would work perfectly.

I then added a new entry to the `.gitignore` file manually, leaving it looking like this:

<!-- cspell:disable -->
```gitignore
# Created by https://www.gitignore.io/api/go
# Edit at https://www.gitignore.io/?templates=go

### Go ###
# Binaries for programs and plugins
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary, built with `go test -c`
*.test

# Output of the go coverage tool, specifically when used with LiteIDE
*.out

### Go Patch ###
/vendor/
/Godeps/

# End of https://www.gitignore.io/api/go

# New addition
junit.xml
```
<!-- cspell:enable -->

And yet, Git would dutifully offer to add all of my `junit.xml` files to my repository
whenever I ran `git status`...

## Figuring out the Problem
This part is easy, turns out if you Google ".gitignore is ignored by Git" you'll find
[this StackOverflow question](https://stackoverflow.com/questions/11451535/gitignore-is-ignored-by-git/22520528)
and the accepted answer will point you at the file encoding being a potential problem.

That's pretty quick to check, so I opened up my `.gitignore` in [VS Code][] and turned my
gaze to the status bar. `UTF-16` it bellowed back at me, not quite what I was hoping to see.

A quick change to `UTF-8` and suddenly my `.gitignore` was working again. What a relief!

## The Problem
Let's quickly dive into what is going on here because it turns out there's more to the story.

For starters, I didn't actually use `curl ... > .gitignore` to get the file. Instead I used
PowerShell on Windows and did a `Invoke-WebRequest ... | Set-Content .gitignore`. That is
pretty important because as it turns out, PowerShell on Windows will default to `UTF-16` encoding.
If I'd known this, I'd have used `Set-Content -Encoding UTF8 .gitignore` and saved myself the
headache.

The next issue is that `git` doesn't actually handle Unicode all that well. In fact, until
relatively [recently](https://github.com/git/git-scm.com/issues/663), it didn't know what
a [BOM] was and even today, it only accepts well formatted `ANSI` or `UTF-8` text. The motivation
here is that the filesystems it deals with are `UTF-8` compatible and so it should work with
the same.

## Closing
I hope that this comes in helpful the next time you're faced with the same, or if you're simply
looking for ways to drive your co-workers crazy.

[git-tool]: https://github.com/SierraSoftworks/git-tool
[libgit2]: https://github.com/libgit2
[VS Code]: https://code.visualstudio.com/
[BOM]: https://en.wikipedia.org/wiki/Byte_order_mark
