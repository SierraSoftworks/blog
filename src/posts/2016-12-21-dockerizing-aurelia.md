---
title: Dockerizing Aurelia
date: 2016-12-21T07:40:00Z
permalinkPattern: :year/:month/:day/:slug/
tags:
- docker
- web
- aurelia
categories:
- web

# cspell:ignore aurelia, Traefik
---

# Dockerizing Aurelia

<Figure src="https://cdn.sierrasoftworks.com/blog/aurelia_logo.png" alt="Aurelia's logo">
Aurelia's Logo
</Figure>

[Aurelia](http://aurelia.io) is a modern web application framework in the spirit of [Angular](https://angularjs.org),
with an exceptionally concise and accessible developer experience and
standards compliant implementation. It is hands down my favourite web
framework right now and one I'd strongly recommend for most projects.

One of Aurelia's greatest claims to fame is the incredible productivity
you can achieve, enabling you to build a full web application in just
days, if not hours.

When building the application becomes that fast, spending a day putting
together your deployment pipelines to roll out your application becomes
incredibly wasteful, so how can we avoid that?

Well, [Docker](https://www.docker.com) offers us a great way to deploy and manage the life-cycle
of production applications. It enables us to deploy almost anywhere, with
minimal additional effort and in a highly reproducible fashion.

In this post I'll go over the process of Dockerizing an existing Aurelia
web application built with [WebPack](https://webpack.github.io/), however the same process applies to
those built using [SystemJS](https://github.com/systemjs/systemjs).

<!-- more -->

## How Aurelia is Built

Before we dive into the process of Dockerizing Aurelia, let's go over how
the build process for an Aurelia web application generally works so that
we're all on the same page.

To build Aurelia we'll use a bundling tool like [WebPack](https://webpack.github.io/) or [SystemJS](https://github.com/systemjs/systemjs)
to aggregate, minify and compress the various resources used by our application.
This process is really well covered by the [Aurelia Skeleton](https://github.com/aurelia/skeleton-navigation) project's
default configurations.

Once we've run the bundler, we'll end up with a `dist` folder containing the
ready to go files. In the case of WebPack, you can simply deploy this folder
to your web server and be done with it, in the SystemJS case you need to include
your `jspm_packages` folder, `index.html` and `config.js` files.

## Why use Docker?

Now that we know what we're working with, why would we use Docker to manage
deploying our web application? After all, it's generally just a matter of copying
files onto a web server and you're done with it...

Docker has a number of excellent advantages over manually managing your deployment
files and web server configuration. These primarily revolve around the tooling available
and the fact that you abstract your deployment "contract" behind Docker's API.

What this really means is that you can change the nature of your application, switch
to server-side rendering or even replace the entire thing with a custom [Go](https://golang.org/)
server, all without making a single change to your infrastructure or host machine.

This may not sound like much, but when you've got someone responsible for maintaining
that infrastructure, giving them only one system to manage can immediately simplify
their lives and enable them to deliver a higher quality and more reliable service.

## Building the Docker Image

Our Docker image is going to need to run a small file-server to serve the Aurelia
application files. To do this, we're going to use [Nginx](https://hub.docker.com/_/nginx/), it's [Alpine](https://alpinelinux.org/) Linux
variant in particular which clocks in at a total of some 20MB.

Keeping your images small makes deployments quick and painless, as well as reducing
the storage requirements on your hosts.

```dockerfile
FROM nginx:1.11-alpine
MAINTAINER Benjamin Pannell [contact@sierrasoftworks.com](mailto:contact@sierrasoftworks.com)

ADD dist/ /usr/share/nginx/html/
```

With that as our `Dockerfile`, we should now be able to build the image by using
the `docker build` command.

```sh
docker build -t sierrasoftworks/aurelia-demo:latest .
```

## Deploying your Docker Image

Now that you've built your Docker image, you'll want to actually deploy it somewhere
useful. To do so you'll need to make use of a Docker registry, there are a large number
available including the [GCR](https://cloud.google.com/container-registry/) and [ECR](https://aws.amazon.com/ecr/), but the easiest by far is the [Docker Hub](https://hub.docker.com/).

To push your image to the Docker Hub, just run `docker push` and provide the name of your
built image\[^1\].

```sh
docker push sierrasoftworks/aurelia-demo:latest
```

Assuming that all completes successfully, you'll now be able to deploy your application to
any Docker host which can access that registry.

To deploy your container, let's quickly run the following...

```sh
docker run -d --rm -p 80:80 --name aurelia-demo sierrasoftworks/aurelia-demo:latest
```

If you visit [http://localhost:80/](http://localhost:80/) you should now see your web application. Great stuff right?

## Deploying in a Production Environment

Of course, deploying to production is a slightly different beast, you'll probably
want to ensure there's HTTPS support on the server, simplify updating from one version
of your app to another and automatically recover from the container crashing.

To do this, I suggest you take a look at my article on setting up [Traefik on Docker Swarm](/2016/12/11/traefik-on-swarm/)
for pointers on how to get things configured to provide all that. It's a quick, simple and
(best of all) free way to get all that going in a couple of minutes.

## Closing Words

To finish off here, it should now be pretty clear that containerizing your Aurelia web
app is incredibly straightforward. Whether you decide to adopt Docker as your primary
deployment strategy is up to you, but there's a number of great reasons why you should
consider it from an operations perspective.

I'll also be doing a post on how one automates the building of your Aurelia applications
into Docker images for a CI/CD pipeline built on [Drone](https://github.com/drone/drone). By combining these tools you
can quickly and effectively build a deployment pipeline for any Aurelia project in just
a couple of minutes.

\*[GCR](https://cloud.google.com/container-registry/): Google Container Registry
\*[ECR](https://aws.amazon.com/ecr/): Amazon EC2 Container Registry
\*\[CI\]: Continuous Integration
\*\[CD\]: Continuous Deployment

\[^1\]: You'll need to have signed up for a Docker Hub account and logged into the registry
on your machine by using `docker login` first.
