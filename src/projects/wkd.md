---
title: Web Comic Downloader
group: Legacy
permalinkPattern: /projects/:slug/
date: 2014-01-03 14:01:00
tags:
    - wkd
    - web comics
layout: GitHubProject
repo: sierrasoftworks/web-comic-downloader
download: https://cdn.sierrasoftworks.com/wkd/WKDSetup.exe
---

# Web Comic Downloader
WKD is a web comic downloader which allows you to easily download a large number of comics automatically.
It makes use of XPath queries to locate images, similarly to the way your web browser does. This allows
it to download images which are not named sequentially (1, 2, 3...) without any problems.

<!-- more -->

::: tip
[Download WKD](https://cdn.sierrasoftworks.com/wkd/WKDSetup.exe)

[View on GitHub](https://github.com/SierraSoftworks/web-comic-downloader)
:::

## Why make WKD?
I am one of many people who routinely reads web comics, alas I get to the stage where I am not willing to
click through each of the 700 strips in a comic. It is just so much easier to browse it on your hard drive,
where it loads immediately and can be traversed quickly using thumbnails.
Previously there was an application which performed a similar purpose, called Woofy. It's development ceased
a few years ago and it was never able to run on a 64-bit OS. This was a major drawback for me since I only use 64-bit OSes.
I had previously made a very simple application who's aim was also to download web comics. However it used
a sequential download method and was unable to download a web comic who's images were not named 001 -> xxx.
That excluded a good number of good web comics.
Recently I was browsing through Google Chrome's Extension repository and noticed a plugin that allowed you
to use your keyboard to navigate through a web comic. It use a manually configured XPath expression to select
the next button and previous button. That got me thinking and within a few hours I had a working application
which did exactly that, except instead of loading the next page it would download the image.
This became WKD.

## Why should I choose WKD?
If you are someone who regularly reads web comics, especially new ones you may find that you spend more time loading
the next strip than reading it. In this case WKD may just be the right tool for you.
It will allow you to download all your favorite web comics* to your hard drive for later reading.

## What comics are supported by WKD?
Technically almost any web comic that provides an image and a next button is supported. However currently only
a limited number of definition files have been created for web comics out there.

 - [Chainsaw Suit](http://chainsawsuit.com)
 - [Ctrl + Alt + Del](http://www.cad-comic.com/cad/)
 - [Cyanide and Happiness](http://www.explosm.net/comics)
 - [Garfield minus Garfield](http://garfieldminusgarfield.net/)
 - [General Protection Fault](http://www.gpf-comics.com/)
 - [Girl Genius](http://www.girlgeniusonline.com/comic.php)
 - [Head Trip](http://headtrip.keenspot.com/)
 - [Looking for Group](http://www.lfgcomic.com/)
 - [Pon and Zi](http://www.ponandzi.com/)
 - [Real Life Comics](http://www.reallifecomics.com/)
 - [Sequential Art](http://www.collectedcurios.com/sequentialart.php)
 - [VG Cats](http://www.vgcats.com/comics/)
 - [XKCD](http://www.xkcd.com)

The biggest thing you can do to help this project is to create definitions for your favourite web comics and add
them in a [Pull Request](https://github.com/SierraSoftworks/web-comic-downloader/pullrequests). I will bundle them
with the next release and before you know it anyone will be able to download their favourite web comics with no
hassles whatsoever.
If you do encounter a problem with a specific web site (and you are sure that your definition is correct) then
send me your definition and a link to the site and I'll see what I can do to fix it.

## How can I make a definition?
You will need a little bit of knowledge of XPath which you can find [here](http://www.w3schools.com/xpath/default.asp).
You will also need a web browser with a built in website developer suite, Google Chrome has a very nice one. Then
simply open the page in that developer suite (In Chrome, right click on the image or the next button and choose Inspect Element)
and work out an XPath expression that will select it.
Then simply create a copy of one of the original settings files (inside the Comic Definitions folder) and edit it to suit your needs.
If you want to be able to check that the definition file you have created will work (or if it doesn't and you want to find out why)
then get yourself an XML editor which supports XML Schemas and use the *WebComicDefinition.xsd* file contained in the download to check it.
A decent free XML editor is Notepad++ which can be upgraded with the XML plugin to allow validation against an XSD file.
You can download it from [here](http://notepad-plus-plus.org/)

If you want to test an XPath expression to make sure it will work in the application then take a look at XPath.exe
(located in the XML folder of the download) which is an extremely lightweight implementation of the HTML system used in WKD,
it allows you to load a web page and then test your own XPath expressions in the same way WKD will run them.

## Current Limitations
The largest limitation of this application is caused how it works, with web comics which make use of very large images
(100KB or more) you are likely to see about a 10% waste in bandwidth (caused by loading the web page's HTML) however with
web comics who's images are vastly smaller (10KB) you will see  as much as 75% waste. Unfortunately this cannot be avoided,
so just keep that in mind. (The biggest culprit so far is Chainsaw Suit)

There is also a problem with certain pages in some comics, this results in the HTML library not replacing "&gt;" with ">"
as it should. A temporary fix for this is to add an additional XPath query to your current one ( use "|" to seperate queries)
which has "&amp;gt;" in the place of "&gt;". This should fix the problems for the time being.
