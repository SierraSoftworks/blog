---
title: Markdown or HTML?
date: 2014-01-22T21:52:00Z
permalinkPattern: :year/:month/:day/:slug/
tags:
    - web
categories:
    - web
---

# Markdown or HTML?
Until now, all of my work on websites has been done in HTML. Write HTML for this page,
write HTML for that project and so on. HTML is one of those languages which anyone who considers
themselves good with computers should know, but it also leaves a lot to be desired. In the latest version of our website,
I decided to move to Markdown as our primary markup language for documents. Markdown is one of those languages which
continues to grow more popular, especially on very tech-centric sites like [StackOverflow][stackoverflow] and [GitHub][github]
and yet if you talk to most people who are merely "good" with computers, they have never heard of it. Somewhat strange given
that Markdown is designed to be an easier to use, easier to read, shorthand version of HTML for writing documents; but I guess
that's just the way of things.

<!-- more -->

The biggest issue we had with our previous website, and with the use of HTML as our primary markup language actually has to
do with how powerful HTML can be. When you are attempting to simply format a document in HTML, there is a good chance that you
will end up using some kind of HTML editor, if for no reason other than to spare you the constant need to type
`<b>some bold text</b>`. The inherent problem with these kinds of editors is that sooner or later they start adding style tags
to your content, and then things start getting messy. This issue is exacerbated when you attempt to copy text from another page,
or from the ubiquitous Word document...

This then leaves you in a position, when moving content from one page to another, or changing themes, where suddenly certain
pages start breaking their styling, or not obeying your commands, and all because you decided to try and make your life easier
by using an HTML editor.

## Solutions
By this point, a large number of you are probably tearing your hair out going "Click the *Clear Formatting* button!", and
you're right. But what happens when you actually want to apply a style, but don't want to apply others? Do you need to start
diving through HTML markup looking for what you want to change? Why not rather use a markup language designed for exactly what
you need? Meet Markdown!

Markdown initially sounds like HTML's simple younger cousin, and I guess you could even go so far as to relate Markdown to Apple,
where HTML represents Microsoft and PHP...oh, you get the idea. Basically, Markdown at a glance appears to be nothing more than
a variation on BBCode with some different shortcuts. Thing is, Markdown is so much more than that, it allows you to easily add
HTML code wherever you may need it, and fall back on its beautifully readable syntax when you don't. It also keeps your
documents content quite thoroughly separate from its display code, which is always a good idea from a portability perspective.

## Verdict
At the end of the day, which language you choose to use is entirely a matter of personal preference. I was placed in a position
where some of the nasty pitfalls of HTML decided to rear their heads, and in doing so I decided to bite the proverbial bullet
and make a switch to an alternative system. Others may find that the additional effort of switching to Markdown outweighs the
benefits it may provide. One of the greatest downsides to using Markdown is often the lack of in-site editors for Markdown,
however the excellent [MarkPad][markpad] more than makes up for this.

If you are looking to switch to Markdown though, be sure to check out the plethora of excellent Markdown plugins for most common
CMS packages, they are often extremely easy to install and configure, and will have you up and running in no time whatsoever.
If possible, look for a package which supports Markdown Extra, as that adds support for Markdown declarations of anchors, which
may then be used to jump around your documents like a kid who just took up Parkour.

[stackoverflow]: http://www.stackoverflow.com
[github]: http://github.com
[markpad]: http://code52.org/DownmarkerWPF/
