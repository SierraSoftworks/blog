---
title: Out of the Box Docker
date: 2017-01-05T21:39:45Z
permalinkPattern: :year/:month/:day/:slug/
tags:
- docker
- ops
- patterns
categories:
- operations

---
# Out of the Box Docker

<Figure src="https://cdn.sierrasoftworks.com/blog/docker_logo.png">
Docker's Logo
</Figure>

[Docker](https://www.docker.com/) is become an incredibly prevalent tool in the development and
operations realms in recent months. Its combination of developer friendly
configuration and simple operational management make it a very attractive
prospect for companies and teams looking to adopt CI and CD practices.

In most cases, you'll see [Docker](https://www.docker.com/) used to deploy applications in much the
same way as a zip file or virtual machine image. This is certainly the
most common use case for [Docker](https://www.docker.com/), but by no means the extent of its
functionality.

In this post I'm going to discuss some of the more interesting problems
we've used [Docker](https://www.docker.com/) to solve and why it serves as a great solution to them.

<!-- more -->

## Cross Platform Commandline Tools

While frameworks like [Python](https://www.python.org/), [Node.js](https://nodejs.org/) and even [Go](https://golang.org/) have made the task of
developing cross platform compatible command line tools rather straightforward,
the simple fact is that in most cases it is necessary to either install the
tool and its dependencies, or at worst, install the framework the tool depends
on as well. All of this can quickly clutter your machine and introduce version
incompatibilities.

On the other hand, Dockerizing your command line tools enables them to be executed
on any Docker machine at a moment's notice, with no installation and an excellent
security model.

We've used this to provide tools which depend on Linux specific functionality
to our Windows developer-base, but it has the added advantage of normalizing the
process of starting any of our tools - simply run a Docker container. This saves
time and mental context in situations where they are at a premium.

To accomplish this effectively, we use a Dockerfile which sets the command line
tool as the entrypoint and run it with the `--rm` and `-it` flags.

```dockerfile
FROM alpine:3.4
ADD app /bin/app

ENTRYPOINT ["/bin/app"]
CMD ["--help"]
```

You can then easily convert any command that you'd run normally by replacing `app`
with your Docker run command...

```sh
docker run --rm -it sierrasoftworks/app say "Hello World!"
```

## Encapsulating Tasks

While certainly not a common use-case, the concept of task encapsulation is
one that Docker is perfectly suited to. Specifically, keeping everything necessary
to run a task organized and accessible.

One of the best uses for this approach has been the encapsulation of automation
workflows in Docker containers.

We primarily use [Ansible](https://www.ansible.com/) as our outomation orchestrator of choice, so packaging
[Ansible](https://www.ansible.com/) and the relevant playbooks into a Docker container presents an elegantly
simple, accessible and reliable way to execute our playbooks from anywhere.

In our particular case, we've wrapped our playbooks using files like the following.

:::: code-group
::: code-group-item Dockerfile

```dockerfile
FROM sierrasoftworks/docker-ansible
ENV ANSIBLE_HOST_KEY_CHECKING=False
ADD ./ /ansible

ENTRYPOINT ["/ansible/run"]
CMD []
```

:::

::: code-group-item bash

```bash
#!/bin/sh
HOST_SPEC="$*"

USER_SPEC="${HOST_SPEC%%"@"_}"
HOST_SPEC="${HOST_SPEC#_"@"}"
HOST="${HOST_SPEC%%" "*}"

ARGS_SPEC="${HOST_SPEC#*" "}"
if [[ "$ARGS_SPEC" == "$HOST_SPEC" ]]; then
ARGS_SPEC=""
fi

USER="${USER_SPEC%%":"_}"
PASS="${USER_SPEC#_":"}"
if [[ "$PASS" == "$USER_SPEC" ]]; then
PASS=""
fi

if [ -z "$USER" ]; then
>&2 echo "Host specification didn't include a user component"
exit 3
fi

if [ -z "$HOST" ]; then
>&2 echo "Host specification didn't include a host component"
exit 3
fi

echo "Running Remediation"
echo "User: $USER"
echo "Host: $HOST"

set -e
if [[ -z "$PASS" ]]; then
ansible-playbook -u $USER -i "$HOST," -k $ARGS_SPEC fix.yml
else
ansible-playbook -i "$HOST," \
    -u "$USER" \
    -e ansible_user="$USER" \
    -e ansible_pass="$PASS" \ 
    $ARGS_SPEC \
    playbook.yml
fi
```

:::
::::

This enables us to execute a remediation against a specific host by executing
the following command on either Windows, Mac or Linux.

```bash
docker run --rm -it sierrasoftworks/remediate/app "$(whoami)@host"
```

### How to pass data to your tasks

There are two primary means of passing data to your tasks through Docker. The
one shown above takes advantage of command line arguments and a wrapper script
which parses those. This approach works very well where humans are concerned, as
most developers are used to interacting with command lines in this manner.

If you're building tasks which will primarily be triggered by a machine, then it
may make more sense to use [environment variables](https://en.wikipedia.org/wiki/Environment_variable) like [Drone](http://readme.drone.io/) does for its
plugins. Environment variables have the added advantage of giving you more explicit
control over the values passed into your tasks.

## As a Tasks API

While one of Docker's main selling points is its simple and easy to understand
interface, one domain I've not seen it applied to is treating Docker containers
themselves as operations, using Docker as a kind of RPC framework.

I'd like to start by saying that this is by no means a recommendation that you
replace every API and RPC tool you're using with Docker containers, there are
a number of reasons why you would be better of not doing so. That being said,
when the topic of pluggable logic is raised, the option of implementing that
logic on any framework, in any language, with any libraries and as much (or
as little) fluff as possible is one of the reasons to consider it.

Let's take the process of making a change to your infrastructure based on a
Slack message. There are a number of different approaches we can take to solving
this problem, so let's investigate each. We'll assume that in every case you
have a chat bot like [HuBot](https://hubot.github.com/) present.

### 1. Have your bot action the changes

This is the simplest solution from an architectural perspective, your bot's
codebase includes the functions it needs to action any changes you request.
The downside (and it is a big one) is that your bot's codebase starts to
include your infrastructure's configuration - violating the principle of
least responsibility.

A better option would be to separate the logic that makes the changes to your
infrastructure from the bot, tying them together using configuration. It'd
also be great if we could use things written in a different language to our
bot (because [CoffeeScript](http://coffeescript.org/) is dead).

### 2. Have your bot run scripts to make changes

By separating your change operations into a set of scripts, developed and
deployed separately to your bot, you immediately reduce the complexity of
your bot's codebase. You also ensure that changes to the way you manage your
infrastructure don't need to change your bot's code, helping to keep things
a bit less fragile.

The problem you face now is that you are required to deploy all the tools
used by your scripts onto the same machine. While orchestrators like [Ansible](https://www.ansible.com/)
can do this reliably, it does lead to a rather messy setup - with lots of
potential for breakage whenever things are updated.

Ideally we'd like to isolate each script and its dependencies from its peers.
Doing so would enable us to update the tooling for one script without breaking
others.

### 3. Have your bot run Docker containers

Let's apply our pattern from [Encapsulating Tasks](#encapsulating-tasks) and
wrap each change operation in its own Docker container. By isolating each task
like this, we remove any technical restrictions on framework, language or
dependencies required by a task and shift the focus of a task's implementation
to solving the problem as quickly and reliably as possible.

To ensure that our implementation remains flexible and our sanity intact, we
will need to decide on a standardized API for these containers. Pick whichever
suits you best, but I think environment variables will probably be the simplest
and most reliable in the long run.

At this point, all your bot needs to do to run a command is execute Docker
like this.

```bash
docker run --rm -e TASK_ARG_1=xyz -e TASK_EXECUTED_BY=bpannell app/tasks/abc
```

## Conclusion

While Docker offers a great application packaging and deployment experience, it
is also capable of simplifying a great many other problems. By thinking of Docker
as more than just a fancy "VM" and as a framework, we can begin applying some
interesting patterns from the development world and solving some rather complex
problems in beautifully elegant ways.

I'd be very interested to hear other interesting ways you've applied Docker to
solve unusual problems in the comments below.

*[CI]: Continuous Integration
*[CD]: Continuous Deployment
