---
title: Do you need a dynamic website?
description: |
    Have you ever wondered whether setting up and running Wordpress, Drupal or Joomla is really worth it? I'll run through
    some of the benefits to be had with building a static website.

date: 2013-10-17T09:20:12Z
permalinkPattern: :year/:month/:day/:slug/
tags:
    - web
categories:
    - web

# cspell:ignore Livefyre, Joomla, mywebsite
---

# Do you need a dynamic website?
Static websites are synonymous with the dawn of the internet, before database servers became mainstream, before the advent of the CMS and long before the
dawn of the web application. Over the years we've seen the advent of web development frameworks like Ruby on Rails, Express.js and MVC to name but a few.
These frameworks include support for advanced templating engines, database backed page generation and custom routing, but is it really necessary to use
such a framework when a static website might address all the same problems at a fraction of the cost.

<!-- more -->

## Dynamic Websites
Before we start looking at how a modern static website can be effectively managed, I'd like to discuss the advantages and use cases for dynamic
websites - as well as possible optimization scenarios which can help make them more attractive. Obviously, the biggest advantage of dynamic websites is
the ability to perform server side operations based on user input, this can include publishing articles from a web UI, rendering content based on remote
sources like databases or other web services and authenticating your users with a custom login page.

With the advent of document stores like MongoDB, scaling dynamic web applications - and reducing their response times - has become easier than ever before,
and the ability to reduce server load using tools like Memcached or micro-caching has meant that generally slow web applications are now able to respond
to te majority of their requests in times rivalling that of static content.

So, with all of these advantages, why would you consider hosting a static website instead? The very simple answer is performance. More specifically,
using a modern webserver like NGINX you can reliably expect to quadruple your possible throughput when compared to an optimized web application,
against an unoptimized web application it isn't even a contest - with over a 400x increase in possible throughput single digit millisecond server response times.

## Static Website Performance
As I've mentioned, the performance of a static website far eclipses that of its dynamic brethren. The reason is quite simple, where a dynamic website
generally requires database queries to be completed, results processed and templates rendered before a request can be served - a static website simply
requires the request to be processed by your web server (generally in the millisecond range), at which point the request can be immediately served.
This allows a static site to respond faster to requests, serve more requests in parallel, and put less strain on your server while doing so. These
advantages are well known, and the reason that many dynamic websites make use of internal caching systems which allow them to serve requests without
needing to hit the database and page renderer - effectively acting as static websites for requests which are cacheable.

The problem is that implementing an effective caching solution is challenging, especially for dynamic websites where the webserver is unable to
determine whether or not the content has changed except by rendering the latest content. A common alternative is to make use of what has been
termed "micro-caching", the process of caching your website's pages for a very small duration (1 - 15 seconds), which allows relatively recent
content to be served from the cache while reducing the number of requests that need to be rendered against the database.

## Static Website Creation
One of the major reasons that people have shied away from static websites is the common misconception that such websites require their pages to be
manually generated - denying access to many powerful templating tools. The fact is, with tools like [DocPad][docpad] and [SiteForge](/siteforge)
it is possible to generate a static website just as easily (if not more so) than the equivalent dynamic website - with the resulting output
being a fully functional static website.

Not only that, but using a site generator allows you to automatically convert your [Less][less] stylesheets into minified CSS, your
[CoffeeScript][coffeescript] files into minified JavaScript and even compress your site's images before deploying them - all helping to
save bandwidth and improve load times.

## When You Should Use Static Websites
The simple fact of the matter is that most small websites are actually static for much of their lives - changing content slowly. Whether
it's your blog, or your corporate website you will likely find that it gets updated at most once per day - usually far less frequently.
What might surprise you is that this kind of website is actually the perfect candidate for a static website generator, as it is possible
to serve these pages statically, updating them only when new content becomes available.

Another major advantage is the ability to update your website's code without needing to restart your web server - resulting in zero-downtime
even under the most aggressive continuous deployment scenarios. And even better than that, if you need some dynamic behaviour you can easily
offload those requests to a web application capable of handling them.

Here's a quick example of how such a setup could be achieved using NGINX.

```
upstream webapp {
  server 127.0.0.1:3000;
}

server {
  listen 80 default;
  name mywebsite.com
  
  location / {
    try_files $uri $uri/index.html @offload;
  }

  location @offload {
    proxy_pass http://webapp;
  }
}
```

## Dynamic Content on Static Websites
Okay, I realise that having a purely static website is generally not going to give you the functionality you require - but there are ways to have the
best of both worlds. Do you need the ability for your users to comment on your pages? Why not look at something like [Livefyre][livefyre], a drop in
JavaScript based comments framework which we are using on our website (you can see it in work below).

You can also create web applications to perform such tasks, allowing you to keep them simple and maintainable while still permitting you to serve
your high performance static web content.

## Conclusion
For the past 6 years we've relied on Drupal to host our corporate website, it's an exceptional CMS framework which I have no issue at all
recommending to someone in the market for a prebuilt website. Our major issue with hosting a website using Drupal is the barrier to customization,
requiring a large amount of work from the outset to add a small amount of additional functionality or to modify a small aspect of the website.
While it undoubtedly performs very well once it has been configured, we are advocates of continuous iteration and deployment - something which a
framework like Drupal makes difficult.

To solve this issue we developed [SiteForge](/siteforge), a website generator which borrows many aspects from frameworks like Express.js, making
it exceptionally easy to adopt and deploy for anyone with Node.js experience. We've used it to develop our new website in record time
(just over 3 days of development from start to finish, where our previous Drupal website took over a month) and have managed to reduce our
website's response times from around 4 seconds to less than a second - making for an extremely fast and responsive experience.

[docpad]: http://docpad.org
[less]: http://lesscss.org
[coffeescript]: http://coffeescript.org
[livefyre]: http://web.livefyre.com
