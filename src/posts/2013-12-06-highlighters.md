---
title: Code Highlighters
date: 2013-12-06T09:25:02Z
permalinkPattern: :year/:month/:day/:slug/
tags:
    - web
categories:
    - web

# cspell:ignore Pygments, Sagalaev
---

# Code Highlighters

Code Highlighting is one of those things which doesn't seem like a big deal, until you see what a difference it can make. The issue is that source
code is inherently difficult to read due to the vast number of keywords and punctuation used by compilers to understand what we are trying to tell
them to do. In an effort to combat this difficulty, we rely on two different tools.

The first, formatting, is probably the most important; it is the process of making code easier to read through added whitespace, often this
whitespace makes no difference for a compiler but by adding newlines and tabs, humans are able to read it considerably more easily.

The second, highlighting, is the automated (or manual, if you're a masochist) process of colouring different parts of the source code to make
it easier for humans to read. This involves colouring specific keywords in certain colours, maybe colouring variable names another etc.

<!-- more -->

## Methods of Syntax Highlighting
There are two major means of embedding syntax highlighting, the first is to use some kind of server side processor to embed style information
into your HTML markup which, when rendered in a user's browser, gives colour to the code. The second is to run a script in the user's browser
which will inject the markup necessary after a page has been loaded. Both methods have their advantages and disadvantages, and it is something
you will need to take into account when selecting the right system for your website.

### Server Side Highlighting
Server side highlighting is provided by libraries such as the ever popular [GeSHi][geshi] and [Pygments][pygments]. One of the big advantages
of using server side highlighting is that such highlighters often give the option to embed highlighting as HTML Style attributes, which are
propagated through RSS feeds. This means that your highlighting will survive being displayed in someone's Google Reader feed, and it also has
the added benefit of ensuring that the highlighting appears the moment the document is loaded. There are two mutually exclusive downsides to
using this solution, the first - if you don't cache pages on your server - is that each request for a page requires your server to highlight
the code again. I'm going to assume that you are using some kind of caching (because who isn't...seriously?), but that introduces another issue,
if you decide to change the styles for your code, or want to switch highlighters, you will need to regenerate your entire cache of pages with
highlighted code on them.

### Client Side Highlighting
The alternative is to highlight code in your client's web browser through the use of scripts. This means you will have to include a javascript
library like [Highlight.js][highlight_js] or [Google Code Prettify][prettify] in your site's `<head>` section, and probably call a method in
your `onload` event handler. The biggest issue with all this is that it doesn't survive syndication, so you won't have your glamorously
highlighted code appearing in someone's RSS reader of choice. This means it probably isn't a good idea for blogs (unless you have no way
of adding a server side highlighter to your server, or your server runs on a very limited system). It also means that for a short time
after your page loads, your source code will be un-highlighted.

## Reviewing Them
I'm only going to review [GeSHi][geshi], [Highlight.js][highlight_js] and [Prettify][prettify] here since I haven't tried using
[Pygments][pygments] (and have no reason to do so given my current server setup). I'll also touch on how easy each of them was to
integrate with [Drupal][drupal], since that is the platform I'm currently running on.

### [GeSHi][geshi]
GeSHi was the first highlighter I tried on our website, mainly because it was the most comprehensively supported on Drupal. Overall, the
installation and configuration was painless, requiring you to add the GeSHi library to your `sites/all/libraries` folder and then enable
the module. One of the complaints I have about GeSHi on Drupal however is the lack of customizability in terms of styling that is provided
by the Drupal module, and the lack of integration with Markdown. One of the nice things about GeSHi though, is the ability to select which
languages you wish to support from within the Drupal module, and even configure their shortcuts. If you're looking for a highlighter which
integrates easily with Drupal, supports a frankly ludicrous number of languages, and will work well with RSS feeds, then I would definitely
recommend GeSHi, however its lack of customizability (as well as how it was written, something which will irk me forever after reading the source code)
is a deal breaker for me.

### [Google Code Prettify][prettify]
Prettify was written by Mike Samuel for [Google Code][googlecode] and has been adopted by the popular site [StackOverflow][stackoverflow] as
their highlighter of choice. After having worked with it, I can definitely see why. Prettify is very well written, easily customizable and
supports a large variety of languages out of the box. It is also very, very fast thanks to the work Mike has done on optimizing the matching engine.
Prettify attempts to take a one-size-fits-all approach to most languages, with the option of manually specifying which language to use by adding a
class to your code elements, and it requires you to add the *prettify* class to anything you wish to have highlighted. This method works quite well,
and means that Prettify doesn't have to make multiple passes on code for which the language is not specified (resulting in a very fast highlighter).
The downside of this approach is that the highlighters for most of the core languages are very limited in what they are capable of when compared to
those written specifically for a single language.

As a test of the how well the highlighter was written, I attempted to write my own implementation of the Bash highlighter with support for a few extra
features (like function names and escape sequences within strings). I can honestly say that doing so was an absolute pleasure, a testament to how well
written the API for Prettify is. Something which I would have liked to see is a document detailing the exposed methods, and what each of their parameters is,
thankfully I was able to figure this out by looking at the code and some of the other highlighters. In fact, from a developer perspective, the only issue
I had with Prettify was that the build script did not work correctly on my Ubuntu box, a pity since I would have loved to contribute my changes to the project.

Integration of Prettify with Drupal was also somewhat painless, however not nearly as much so as GeSHi, particularly due to the way Prettify and
Markdown on Drupal interact. The issue is that Markdown wraps code in *pre* tags, but doesn't provide any way to set CSS classes on these tags.
While this works fine for the generic highlighting functionality in Prettify, any attempts to use custom formatters requires you to add a special class like

```html
<pre><code class="prettify language-js">your javascript code here</code></pre>
```

to tell Prettify what type of code you are using. In the end, I ended up modifying the Markdown PHP library I used to support doing so, but it
definitely could have been neater. With any luck, functionality like that will be added in a new version of Markdown or Markdown Extra.

### [Highlight.js][highlight_js]
Last, but certainly not least, is Highlight.js. Highlight.js is written and maintained by Ivan Sagalaev and development takes place on
[GitHub][highlight_js_github]. One of the first things that you will notice is missing in Highlight.js is the ability to generate line numbers,
Ivan wrote a good post detailing his reasons for avoiding doing so [here](http://highlightjs.readthedocs.org/en/latest/line-numbers.html), but if you require
that functionality then you are probably better off sticking with one of the above highlighters. Of the three highlighters I am reviewing here however,
Highlight.js certainly presents the most professional image. It also supports more languages out of the box than Prettify
(though nowhere near as many as GeSHi does) and has a vast number of themes available for it. Unlike Prettify, Highlight.js will attempt to detect
which language is being used (if one is not specified) by running the code through each of your parsers and calculating a score; language with
the highest score wins and gets to highlight your code. This works well in theory, but tends to fall over for very small code snippets (1 to 5 lines)
and can result in a lot of unnecessary processing for long snippets. Ideally, you wouldn't settle for this method unless absolutely necessary,
but it does have the advantage of making it possible to use Highlight.js out of the box with Markdown.

This brings me to another issue that I encountered, unfortunately there is no Drupal module providing integration with Highlight.js available
on the official [Drupal][drupal] website, and the only alternative I could find was somewhat out of date. Luckily, the process of updating the
version I found (on GitHub) was very straightforward and within 10 minutes I had Highlight.js working on our website.

I decided to perform the same test as I did for Prettify, rewriting the Bash highlighter, and found it to be considerably more difficult
than it was in Prettify. This was partially due to the considerably more complex (and powerful) way in which Highlight.js defines languages,
allowing for certain patterns to start others, and other such things; and partially due to the way in which the highlighter was designed.
In the end, I did manage to get the highlighter implemented and functioning correctly, however it took me about 4 attempts and a great deal
of times longer than implementing Prettify's one.

## Conclusion
To be honest, I can't easily say that any one of these highlighters is the best. I am currently using Highlight.js after finishing my updates
to its core code, however I may well end up switching back to Prettify and writing a few new language definitions for it in the process.
One thing that I am absolutely certain about is that I won't use GeSHi due to its lack of customizability (but that if I were looking to publish
mainly RSS feeds that it would be my first choice). I also feel that the fact that Highlight.js is under active development (the last commit
to their development repository was a day ago) while Prettify hasn't had any new releases since June 2011 will tip the scales in Highlight.js' favour.

Something to also keep in mind is that client side libraries need to prioritize size and performance over anything else, failure to do so can
easily result in massive penalties to a website which uses the libraries. GeSHi and Pygments on the other hand have no such restrictions,
they should prioritize performance but since most sites will end up caching their output, it is not a massive concern. As such, server side
highlighters generally have far superior highlighting implementations than their client side cousins.

[geshi]: http://qbnz.com/highlighter/
[pygments]: http://pygments.org/
[highlight_js]: http://softwaremaniacs.org/soft/highlight/en/
[prettify]: http://code.google.com/p/google-code-prettify/
[drupal]: http://drupal.org
[googlecode]: http://code.google.com
[stackoverflow]: http://stackoverflow.com
[highlight_js_github]: https://github.com/isagalaev/highlight.js
