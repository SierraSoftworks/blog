---
title: Arguments with the Windows Command Line (and JSON)
description: |
    Passing JSON data between applications can be a pretty powerful way to move rich
    data structures around, but it can also be an outright nightmare on Windows machines.
    In this post, I'll show you some of the nightmares you might encounter and how to
    work around them.
date: 2022-01-25T00:00:00.000Z
sitemap: false

permalinkPattern: :year/:month/:day/:slug/
categories:
    - development
    - powershell
    - windows
tags:
    - json
    - powershell
---

# Arguments with the Windows Command Line (and JSON)
Let's frame the problem here, you've got an application which accepts JSON input in its command line
arguments. It doesn't matter what this application does (but let's for argument's sake say that it's
sending this as a web request payload).

You might think that calling said application like this would work, and you'd be right (if you're running
on a Unix-like system):

```bash
http post https://example.com/api/v1/endpoint {"foo": "bar"}
```

Unfortunately, you're running on a Windows system and you're greeted with a response from your web service
telling you that `{foo: bar}` is not valid JSON. What the hell?

So you try this instead, because surely it will work:

```bash
http post https://example.com/api/v1/endpoint '{"foo": "bar"}'
```

But again, you're greeted with the same `{foo: bar}` error. Let's try again...

```bash
http post https://example.com/api/v1/endpoint "{""foo"": ""bar""}"
```

Nope, still not valid JSON (and still giving us `{foo: bar}`). I'm getting tired of this. One last try

```bash
http post https://example.com/api/v1/endpoint "{\"foo\": \"bar\"}"
```

Finally! It works, but good lord at what cost? That's so painful to type out! Unfortunately, it also
doesn't entirely solve the issue, because you're running under `cmd.exe` (the trusty old Windows command prompt)
and when you decide to send `{"foo": "bar & baz"}` as your payload, you're greeted with a
`The system cannot find the file specified` error. And let's not even get started with the
`{"path": "%PATH%"}` payload where suddenly your system path is being sent to the remote server.

## One Parser to Rule Them All
Well, it turns out that Windows doesn't parse command line arguments the same way that Unix does. Specifically,
the Windows API provides the wonderfully standard
[CommandLineToArgvW](https://docs.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-commandlinetoargvw)
method to parse command line arguments. This method provides support for quoting command line arguments and handling
escape sequences (which, given that Windows uses `\` as a path separator and as the escape sequence for quotes, is
pretty damn complex).

The downside is that this method doesn't know, or care, about things like interpolations or the need to use different
quote characters to convey meaning around escape sequences. In fact, it doesn't recognize that `'` is a quote character
at all.

<!-- more -->