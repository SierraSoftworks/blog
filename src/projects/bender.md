---
title: Bender
group: Services
description: |
    A small web-service serving your daily dose of Futurama quotes.
permalinkPattern: /projects/:slug/
date: 2021-02-12
layout: GitHubProject
repo: sierrasoftworks/bender
---

# Bender
**Bender quotes as a web service.**

Bender is a small API which allows you to run a BaaS stack (Bender as a Service)
for those times you really wish you could tell a web app to bite your shiny metal
ass.

<!-- more -->

::: tip
You can go directly to [Bender](https://bender.sierrasoftworks.com/api/v1/quote)
and get your dose of Futurama if you're more interested in that than the API docs.
:::

## Background

It is primarily designed to be a simple, straightforward to implement, API service
with limited external dependencies to be used as a technology evaluation platform
for micro-service technologies. Over the course of its existence, it has provided
me with a means to evaluate some of the following practices and technologies (and
many others I'm sure I've forgotten).

 - ASP.NET Core
 - Serving multiple content types based on `Accept` headers
 - CI/CD to Google Kubernetes Service with Helm and Azure DevOps
 - Google AppEngine
 - Google Firebase
 - Golang + [girder](https://github.com/SierraSoftworks/girder)
 - Azure CosmosDB
 - Azure Table Storage
 - CI/CD to Azure Kubernetes Service with GitHub Actions
 - Rust + Rocket
 - Rust + actix-web
 - Azure Blob Storage in Rust

## Running your own
We publish a Docker image for Bender on the DockerHub. The fastest way to get Bender
running on your own laptop or cluster is to do the following.

```bash
docker run --rm -it -p 8000:8000 sierrasoftworks/bender:latest
```

If you're using Kubernetes, you can also deploy Bender and a `Service` representing it
by running the following. Doing so will expose a `http://bender-server` service within
your cluster.

```bash
kubectl apply --namespace bender -f https://raw.githubusercontent.com/SierraSoftworks/bender/main/.deploy/deployment.yml
kubectl apply --namespace bender -f https://raw.githubusercontent.com/SierraSoftworks/bender/main/.deploy/service.yml
```

## API

### Quotes

#### `GET /api/v1/quote/{who?}`
This endpoint allows you to fetch a random Futurama quote. The quote will be returned
in the best content type we can negotiate based on your provided `Accept` header,
defaulting to JSON if you do not provide an `Accept` header (I see you, lazy API
client developers).

```http
GET /api/v1/quote HTTP/1.1
Host: bender.sierrasoftworks.com
Accept: application/json
```

The following content types are supported:

 - `application/json`
 - `text/html`
 - `text/plain`

If you provide a `{who}` component (which is optional) you can specify which Futurama
character's quotes you'd like to receive.

```http
GET /api/v1/quote/bender HTTP/1.1
Host: bender.sierrasoftworks.com
Accept: application/json
```

##### 200 OK
Usually, you'll be greeted with a 200 OK response from this endpoint (unless we've misconfigured
things and don't have any quotes available for you, or you've specified a `{who}` which we don't have
quotes for). Depending on the `Accept` header you have provided, you may receive one of the following responses.

###### application/json

```json
{ "who": "Bender", "quote": "Bite my shiny metal ass." }
```

###### text/plain

```
Bite my shiny metal ass. – Bender
```

###### text/html

```html
<html>
    <head>
        <style>
            body {
                font-family: Sans-serif;
            }

            figure {
                margin: 20px;
            }

            blockquote {
                margin-left: 1em;
            }

            figcaption {
                margin-left: 2em;
                font-size: 0.8em;
                font-weight: bold;
            }

            figcaption::before {
                display: inline;
                content: "–";
                padding-right: 0.5em;
            }
        </style>
    </head>
    <body>
        <figure>
            <blockquote>Bite my shiny metal ass.</blockquote>
            <figcaption>Bender</figcaption>
        </figure>
    </body>
</html>
```

##### 404 Not Found
If you specify a `{who}` which we don't have quotes for, then we'll respond with a 404 Not Found
status code. In this case, the response will always be `application/json` encoded, regardless of
your `Accept` headers.

```json
{
    "code": 404,
    "error": "Not Found",
    "message": "There are no quotes available right now, please add one and try again."
}
```

##### 500 Internal Server Error
If things really do go sideways for us, then you might find a coveted 500 Internal Server Error.
Bender, for the most part, is pretty simple so this should (hopefully) be rare, but it's also
more of a research project than a full-blown production service, so not that rare. In any case,
these get reported to us automatically and we'll set our interns to fixing the issue ASAP.

```json
{
    "code": 500,
    "error": "Internal Server Error",
    "message": "We ran into a problem, this has been reported and will be looked at."
}
```

### Health and Telemetry

#### `GET /api/v1/health`
This endpoint is designed to provide a low-cost query surface for automated health probes
and lifecycle checks. If you're familiar with Kubernetes `livenessProbe`s, this is the
endpoint you would point those at for Bender.

```http
GET /api/v1/health HTTP/1.1
Host: bender.sierrasoftworks.com
```

##### 200 OK
This endpoint should always return a 200 OK status code, unless the service is down, in which
case the frontend proxy may return a response to the caller (if present).

```json
{ "ok": true }
```
