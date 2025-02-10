---
title: "Live Unit Testing .NET Core - Where are my tests?"
date: 2019-10-11 13:08:17
permalinkPattern: :year/:month/:day/:slug/
categories:
    - development
tags:
    - dotnet
    - testing
    - visualstudio
draft: false
comments: true
---

# Live Unit Testing .NET Core - Where are my tests?
So you're sitting in front of your computer, wondering why your unit tests won't
show up in Visual Studio's Live Test Window. They appear fine in the normal Tests
Window and they run without problems, you haven't done anything weird and all you
want is to be able to see whether your code works.

You're not alone and there is a solution!

<!-- more -->

## Background

Visual Studio has an awesome feature called "Live Unit Testing" which allows you
to see whether your code passes automated tests. It will keep track of which tests
affect each line of your code and run them when that code changes - giving you
(close to) real-time feedback on the quality of your code.

It works brilliantly, but here are certain situations in which it just fails to
pick up your tests altogether.

## Where are my tests?

### Microsoft.NET.Test.Sdk
It turns out this library is actually a hard requirement for your tests to appear
in Live Unit Testing. Without it you'll see the following error in the Live Unit Testing
output window.

> Exception filtering tests: No tests matched the filter because it contains one or
> more properties that are not valid (TestCategory, Category). Specify filter expression
> containing valid properties (DisplayName, FullyQualifiedName) and try again.

To fix this issue, simply add the following package reference to your test project.

```xml
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.3.0" />
```

Restoring your packages with `dotnet restore` should then result in your tests
appearing and running automatically.

## Closing

Why this isn't immediately obvious to the user and why the exception message is completely
opaque is beyond me, however this is a quick fix and should help get you back on track.

Have fun and go squash some bugs!
