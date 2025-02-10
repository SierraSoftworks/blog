---
title: ASP.NET Lock Contention
description: |
    If you're running an API on ASP.NET (.NET Framework) there's a good chance
    that you're losing a significant amount of performance and potential concurrency
    to a default feature you don't need.

    I'll walk you through this feature, how it works, why it's a problem and how
    you can go about disabling it.

date: 2022-07-22T00:00:00Z
permalinkPattern: /:year/:month/:day/:slug/
categories:
    - development
    - sre
tags:
    - asp.net
    - production

# cspell:ignore fstat, asax, proc, procdump, syncblk, clrstack
---

# ASP.NET Lock Contention
If you're running a (large) API on ASP.NET (.NET Framework) there's a good chance that
you're significantly throughput and concurrency limited. Part of this is no doubt due to
the relative performance increases we've seen in ASP.NET Core over the years, but I'm here
to show you a one line change you can make which (depending on your use case) might unlock
a significant amount of additional performance headroom.

<!-- more -->

## Background
Microsoft's ASP.NET web framework has been around for over 20 years at this point (first released in January 2002)
and has been through several major rewrites over the course of that time. Today, most new development is conducted
on ASP.NET Core, but the original .NET Framework version of ASP.NET is still a very common sight in the industry.

ASP.NET (I'm referring to the .NET Framework version from here on out) was designed at a time where most of the web
was server-side generated HTML and limited client-side scripting. APIs were an exception rather than the rule, and
serving static files alongside your dynamic content was an expected feature. As a result, ASP.NET was designed to
optimize for some of the common failure modes one would expect to encounter in this type of environment.

The most interesting of these is the question of "is this URL pointing at a file on disk?". This is a question
that any file serving web service needs to answer, because it determines whether a *404 Not Found* should be
served, or whether the service should start up the machinery required to serve the file's contents. At its most
rudimentary, this involves an `fstat` call to check whether the file exists, but for optimization reasons you
don't necessarily want to keep running `fstat` if you have already determined that the file doesn't exist.

This brings us to the ASP.NET `RouteCollection` construct, which keeps track of every route within your application
and maintains a cache of known file paths (both those which correspond to an existing file and those which don't).
Every time a new URI is requested, the `RouteCollection` is consulted to determine whether there's an existing
route that matches the URI. This is done **before** your application's dynamic routes are evaluated and if no
existing route is identified, the relative path is checked to see if it corresponds to a file on disk. The result
of this check (the `fstat` call) is stored as a boolean in the `RouteCollection` for future reference, but because
ASP.NET is an inherently multi-threaded environment, this cache sits behind a `lock` which must be acquired before
any changes are made to it.

Enter our fun friend, the API. Most RESTful APIs include identifiers in their point-get request URIs and this
can result in a large number of unique URIs relative to the number of requests made to your service. This particular
pattern also wreaks havoc with a shared lock which must be acquired for each new unique URI that your service wishes
to process, resulting in heavy lock contention and a significant performance hit in the pathological case.

## Symptoms
This particular problem results in increased lock contention, in particular spin-locking, which drives up CPU load
and impacts response latency for callers. By virtue of how this problem occurs, you're likely to observe little
impact until your service sees a spike in traffic or other significant activity, at which point you'll see a significant
non-linear degradation which might not be recoverable under load (i.e. you'll need to restart the application and/or
remove the instance from your traffic routing to allow it to recover).

This type of non-linear response (where a small amount of extra load results in a large decrease in available capacity)
is a common symptom of resource contention and this particular case is just one of many possible sources of that.

## Fixing the issue
The good news is that the issue is very easy to work around, the bad news is that the only mention I was able
to find was written by none other than Scott Guthrie in 2008, and has long since been downgraded in relevance by
search engines the world over.

The trick is to tell the `RouteCollection` that we wish to have our application (ASP.NET) handle all requests
(even if they correspond to a file), which causes the `fstat` call to be skipped and avoids the cache lock.
This is done by setting the `RouteTable.Routes.RouteExistingFiles` property to `true` when your application starts,
as shown below.

```csharp
// Inside your Global.asax.cs file:

public class Global : HttpApplication
{
    protected void Application_Start(object sender, EventArgs e) {
        // If this is set to false (default) then every unique incoming URL will result in an `fstat` call to
        // check whether a file exists at that path and, if it does, it will not be served using the ASP.NET
        // routing layer. This `fstat` call's result is cached in-memory (increasing memory usage) and protected
        // by a mutex (increasing lock contention).
        //
        // Enabling this causes every request to be handled by ASP.NET's routing layer, which disables this `fstat`
        // call and the corresponding cache.
        RouteTable.Routes.RouteExistingFiles = true;
    }
}
```

## Investigating similar issues yourself
If you do need to investigate something similar yourself,
the trick is to grab a memory dump of your running application during the failure and use WinDbg to analyze it.

In our case, we used the brilliant [ProcDump](https://docs.microsoft.com/en-us/sysinternals/downloads/procdump)
utility to grab a memory dump of our ASP.NET application (running as `w3wp.exe`).

```sh
procdump.exe -ma $PID memory.dmp
```

You can then open up this memory dump in WinDbg and use the `!syncblk` command to look for any contested locks
within your application. In our case, we found that the `System.Web.Caching.UsageBucket` had a very high `MonitorHeld`
count and looking at one of the threads in question (using `!clrstack`) we found that this was being contested
within the [`System.Web.Caching.UsageBucket.AddCacheEntry(System.Web.Caching.CacheEntry)` method][AddCacheEntry].

Further up the stack trace, we found that this was being used within the `System.Web.Routing.RouteCollection.IsRouteToExistingFile(System.Web.HttpContextBase)`
method called [here](https://referencesource.microsoft.com/#System.Web/Routing/RouteCollection.cs,197). This is
what led us to the idea of using the `RouteExistingFiles` option to bypass this logic.

Hopefully you'll find this useful, as you can see there's a ton of valuable information to be gleaned from
memory analysis and tools like [https://referencesource.microsoft.com](https://referencesource.microsoft.com)
and I'd encourage you to try them out the next time you run into an unexplained performance problem.

[AddCacheEntry]: https://source.dot.net/#System.Runtime.Caching/System/Runtime/Caching/CacheUsage.cs,520
