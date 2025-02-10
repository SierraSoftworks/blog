---
title: Docker Swarm
date: 2016-12-11T09:26:53Z
permalinkPattern: :year/:month/:day/:slug/
tags:
    - docker
    - docker-swarm
    - ops
categories:
    - operations

# cspell:ignore Traefik, Mesos
---

# Docker Swarm

Docker Swarm is one of those interesting new technologies which has succeeded in shaking up
people's preconceptions around what it means to run a scaleable cluster. In an environment
where everyone seems to be building a cluster orchestrator, including some big names like
Google's [Kubernetes][kubernetes], HashiCorp's [Nomad][nomad] and Mesosphere's [Marathon][marathon];
Swarm has managed to burst through as one of the most attractive orchestration frameworks out
there.

As a result of all this hype, it can be difficult to make a decision around whether Swarm is
the right tool to use. As someone who has had extensive experience with running [Swarm][swarm],
[Kubernetes][kubernetes], DC/OS ([Marathon][marathon]) and [Rancher][rancher] in production
environments, I'll try to give you an unbiased view on the reasons you'd choose Swarm
and some of the gotchas to be aware of.

<!-- more -->

## The Docker Question
Before we start diving into the question of orchestrating Docker at scale, one must confront the
question of whether containers are the right solution to the problems you face.

It is incredibly important that you keep in mind the concept of "Don't fix what isn't broken"
when considering the adoption of new technologies, Docker is no different. If you've got a
system in place which suits your business requirements and doesn't place undue stress on
your employees then it is my opinion that you leave it be. Adopting Docker for the sake
of appearances will likely not yield any tangible benefits and will probably cost you in the
long run.

On the other side of the coin, there are classes of problems which are elegantly solved by
Docker, most of them revolving around the concepts of CI
and CD. If you're considering applying Docker to
solve the problem of deploying services in a consistent, accessible and standardized manner
then I'd say go for it.

Not only does Docker offer a great API for building your deployables, it offers a great
ecosystem of tooling and building blocks on which to fabricate your services. This, combined
with the wealth of knowledge and great community should be the reasons you choose Docker over
something like bare metal with [Ansible][ansible] orchestration.

## Docker in Production
Docker in production is an entirely different beast to your development environment. While there's
a lot of literature which implies production deployments are just a `docker run` away, the truth
is somewhat more complex.

The fact is, production deployments of any service require certain guarantees around availability
and failure tolerance which the core Docker runtime isn't intended to provide. This is the role that
orchestrators are intended to fill, offering the ability to recover from infrastructure failures,
handling application crashes and monitoring the health of your services.

### Production Requirements

1. Manage the lifecycle of applications, including restarting them following crashes.
1. Provide application-level health-checks to monitor service availability.
1. Enable easy horizontal scaling of your applications behind a service abstraction.
1. Expose tools to update your services with minimal, or no, downtime.
1. Handle and recover from infrastructure failures automatically.
1. Ship logs to a centralized logging service for analysis and persistence.

Docker Swarm attempts to fulfil these requirements while remaining true to its simple, lightweight
and accessible roots. To that end, it offers perhaps the most elegant user experience of all the
orchestrators I've listed. User experience, however, shouldn't be your primary reason for selecting
a production-level tool.

## Swarm's Advantages
Swarm's biggest advantage is that it comes bundled with Docker and requires almost no setup.
I'm not kidding when I say that you can setup Swarm by running the following command on a Docker
host.

```sh
docker swarm init
```

This simplicity extends far beyond the initial setup, encompassing everything from creating isolated networks
on which your services can communicate to performing rolling updates of those services as versions change.
If anything, this simplicity and ease of use - not to mention the ability to run an identical environment
on your laptop with no extra work - is the primary reason one would choose Swarm over any of its competitors.

Proceeding beyond the interface, Swarm's built in service discovery, IP-per-container, and native health-check
integration put it on-par with most other services for basic functionality needed in a production environment.

## Swarm's Disadvantages
Although Swarm covers all the basic requirements of a production deployment, there are other aspects which
it unfortunately hasn't integrated yet. The most glaringly obvious of these is the lack of any native volume and
secrets management functionality. For a tool which comes "batteries included" for everything else, these are
problems which really stand out - because they require actual effort to address.

Swarm also lacks any kind of automated load-balancer, something which Kubernetes and Rancher both provide
and which greatly simplifies exposing your services. This is a problem easily solved using something like
[Traefik][traefik], something I have covered doing [here](/2016/12/11/traefik-on-swarm), but like the volume
problem - it's something which is glaring in its absence from Swarm itself.

## Where Swarm Works Well
Swarm, as it stands right now, lacks some of the more complex features which make a solution like Kubernetes
so attractive, however it more than makes up for this in its target demographic - people who want to deploy
Docker in production, on a small cluster, with minimal effort.

The fact is, systems like Kubernetes and DC/OS are designed and intended for use at enterprise scale, where
you've got machines with 512GB of RAM and 256 threads hosting thousands of containers, running services with
millions of requests per minute across your cluster. While they can certainly be employed at lower scales,
their home territory, and that of the people who build them, is Google-scale.

Docker Swarm, on the other hand, is built for the developer working on his new startup, the guy who wants
to host his own [GitLab](https://gitlab.com) instance, maybe [Drone](http://readme.drone.io) for builds and
a couple of small websites and backend services he's been working on in his free time. Docker Swarm is the
little guy's cluster framework and you can appreciate it in every small detail of the way it's put together.

The **TL;DR** of this is that Docker Swarm works really well for
the guy who is spending $20-$100 per month on cloud services, who wants to deploy Docker but doesn't want to
fork out the $60 overhead on master nodes to run DC/OS, or the $40 on a MySQL DB and master node for Rancher.
The guy who wants to be able to run his containers on the same machines that are orchestrating them, while still
ensuring High Availability (if he wants it), and allowing him to transition into something more "production ready"
at a moment's notice if he needs it.

It's great for someone who doesn't want to learn a brand new tool, who wants to be able to test everything out on his
laptop without having to give up Chrome to free up enough RAM for it.

## Where You Could Do Better
If you're one of those lucky enough to have access to thousands of dollars worth of hardware, for whom 12GB of
RAM and a handful of cores spent on master nodes is a rounding error, then Swarm probably isn't for you. I don't
doubt that you could use it, or even that it's capable of being stable at that scale - but I wouldn't stake my
reputation on it and neither should you.

When you're working at that kind of scale, it's best to use tools built for the purpose and that's where
products like [Kubernetes][kubernetes] really start to make a lot of sense. Features like built-in secrets
management, automatic ingress configurations (setting up your load-balancers) and comprehensive access control
tools make them far better suited to those tasks than Swarm currently is.

In addition to that, Swarm truly is a relatively new and unproven technology. If your job requires that the
orchestration tool you use is stable to more than a couple of 9's, bite the bullet and pay your overhead costs
to run something which provides those guarantees (implicit or explicit).

## General Swarm Criticisms
Docker Swarm has had some interesting criticisms levelled at it since its announcement, some are the
common FUD associated with new technologies, while
others are grounded in valid concerns. Some feel that it is too young or that it doesn't have enough
experience backing it, particularly the proponents of Mesos/[Marathon][marathon] and
[Kubernetes][kubernetes]. Others complain about its dependency on recent kernels, or the rate at which
Docker has historically deprecated technologies.

Frankly, the former is a non-issue if you're considering using Docker at all, a piece of software which
hasn't yet hit its first major release version (see [SemVer][semver]). While there are those who would
argue that Docker is stable "enough", what exactly constitutes "enough" is something you will need to
decide based on your use case.

The latter point is a valid concern, APIs which can change under you are something which should make
any developer or ops guy wary. That being said, instability is something the development community
is intimately familiar with and the application of processes like Agile and the structuring of
your tooling to accommodate that instability should mean that, even significant, changes don't interrupt
you for an extended period of time.

On the other side of the coin, events like [Swarm3k](http://sematext.com/swarm3k/) have showcased
Swarm's ability to handle incredibly large workloads, while its lightweight nature and brilliantly
simple interface make it easily accessible to anybody with Docker experience.

## Conclusion
After running Swarm in production for a number of months, as well as Kubernetes, DC/OS (Mesos+Marathon)
and Rancher - I've finally settled on Kubernetes. Don't let that dissuade you from using Swarm though,
especially if you're looking for something lightweight and easy to learn.

Swarm's biggest strength is its simple user experience, one which will be familiar to anybody who has
worked with Docker before. It follows this up with a solid feature set and maintains its momentum by
being super-light on resources. If you're running Docker without a orchestrator then switch to Swarm
right now, but if you're looking for something that can reliably scale to [PokemonGo scale][pokego-scale]...

[swarm]: https://www.docker.com/products/docker-swarm
[kubernetes]: http://kubernetes.io
[nomad]: https://nomadproject.io
[rancher]: http://rancher.com/
[marathon]: https://mesosphere.github.io/marathon/
[ansible]: https://www.ansible.com
[semver]: http://semver.org
[traefik]: https://traefik.io

[pokego-scale]: https://cloudplatform.googleblog.com/2016/09/bringing-Pokemon-GO-to-life-on-Google-Cloud.html

*[CI]: Continuous integration
*[CD]: Continuous Deployment
*[FUD]: Fear, Uncertainty and Doubt
*[TL;DR]: Too Long; Didn't Read
