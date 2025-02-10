---
title: Scheduled Backups with Kubernetes
date: 2017-11-01 20:32:07
permalinkPattern: :year/:month/:day/:slug/
tags:
    - kubernetes
    - operations
    - cdn
    - s3

# cspell:ignore pipefail, DCOS
---

# Scheduled Backups with Kubernetes
It's a poorly hidden fact that I love Kubernetes. After spending months running everything from
Marathon DCOS and CoreOS to Rancher and Docker Swarm in production, Kubernetes is the only
container orchestration platform that has truly struck me as truly "production ready" and I
have been running it for the past year as a result.

While functionality when I first started using it (v1.4) was somewhat patchy and uninteresting,
some of the more recent updates have been making sizeable strides towards addressing the operations
challenges we face on a daily basis.

With v1.8, Kubernetes has introduced the [CronJob][] controller to `batch/v1beta1`, making it
generally available for people to play with. Sounds like the perfect time to show you how we
use [CronJobs][CronJob] to manage automated, scheduled, backups within our environments.

<!-- more -->

## Introduction to CronJob
The Kubernetes [CronJob][] controller is responsible for creating [Jobs][Job] on a schedule.
No, really, it is exactly that simple. Kubernetes [Jobs][Job] take care of ensuring that the
job runs correctly, managing crashes and completion time restrictions etc.

This allows you to ensure that a container is run every `H 0 * * *` - or every day, around midnight, for those who don't speak `cron`.

Let's take a simple example that shows how one would convert a [Job][] to a [CronJob][] script.

:::: code-group
::: code-group-item Job

```yaml
apiVersion: batch/v1
  kind: Job
  metadata:
    name: say-hi
  spec:
    template:
      spec:
        containers:
          - name: hello-world
            image: hello-world
```

:::

::: code-group-item CronJob

```yaml
apiVersion: batch/v1beta1
  kind: CronJob
  metadata:
    name: say-hi
  spec:
    schedule: "H 0 * * *"
    jobTemplate:
      spec:
        template:
          spec:
            containers:
              - name: hello-world
                image: hello-world
```

:::
::::

As you can see from this example, it is actually pretty trivial to convert an existing Kubernetes
[Job][] to a [CronJob][], making migrations quick and simple. You'll also notice that defining a
job is no more complex than defining your [Deployments][Deployment].

## Building a Backup Container
Now that you're familiar with how to define a Kubernetes [CronJob][], you probably want to know how
to build the container that is going to run your backups for you. Because of the transient nature of
a Kubernetes [Job][], you don't need to worry about problems like keeping the container running,
internal scheduling etc.

This means that your backup container can really just run `$YOUR_BACKUP_EXECUTABLE` and exit when it
is done. This removes a huge amount of the complexity that was previously involved with building
backup containers and lets you focus on exactly the task you want to perform.

But let's not make this too easy, I personally want my backups to end up somewhere safe - otherwise what's the point?
To achieve that, let's toss them over to S3 when we're done, giving us a [pretty reliable][s3-durability] place to keep track of them.

:::: code-group
::: code-group-item Dockerfile

```dockerfile
# Fetch the mc command line client
FROM alpine:latest
RUN apk update && apk add ca-certificates wget && update-ca-certificates
RUN wget -O /tmp/mc https://dl.cdn.io/client/mc/release/linux-amd64/mc
RUN chmod +x /tmp/mc

# Then build our backup image
FROM postgres:9.6
LABEL maintainer="Benjamin Pannell <admin@sierrasoftworks.com>"

COPY --from=0 /tmp/mc /usr/bin/mc

ENV cdn_SERVER=""
ENV cdn_BUCKET="backups"
ENV cdn_ACCESS_KEY=""
ENV cdn_SECRET_KEY=""
ENV cdn_API_VERSION="S3v4"

ENV DATE_FORMAT="+%Y-%m-%d"

ADD entrypoint.sh /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
```

:::

::: code-group-item Entrypoint

```bash
#! /bin/bash
set -e -o pipefail

DB="$1"
ARGS="${@:2}"

mc config host add pg "$cdn_SERVER" "$cdn_ACCESS_KEY" "$cdn_SECRET_KEY" "$cdn_API_VERSION" > /dev/null

ARCHIVE="${cdn_BUCKET}/${DB}-$(date $DATE_FORMAT).archive"

echo "Dumping $DB to $ARCHIVE"
echo "> pg_dump ${ARGS} -Fc $DB"

pg_dump $ARGS -Fc "$DB" | mc pipe "pg/$ARCHIVE" || {
    echo "Backup failed"
    mc rm "pg/$ARCHIVE"
    exit 1
}

echo "Backup complete"
```

:::
::::

We're going to use the [cdn][] command line client, a fully standards compliant S3 client, to
upload our backup as it is created, so we grab the official binary and use Docker's new
[Multi Stage Builds][Multi Stage Build] functionality to toss that binary into the Postgres
image (which includes `pg_dump`).

All that is left to do is put together an entrypoint which will run `pg_dump` and pipe the result to S3.

## Defining our Backup Job
In the real world, you're going to want to draw things like your `ACCESS_KEY` and `SECRET_KEY`
from the Kubernetes Secrets API and provide some additional metadata for tracking and organization,
but the result isn't much more complicated than what we started with.

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: my-backup
  labels:
    app: my-app
spec:
  schedule: "H 0 * * *"
  jobTemplate:
    spec:
      template:
        metadata:
          labels:
            app: my-app
          name: my-backup
        spec:
          containers:
          - image: minback/mongo:latest
            name: backup
            args:
              - my_db
              - -h
              - mongodb
            env:
              - name: cdn_SERVER
                value: http://cdn:9000/
              - name: cdn_BUCKET
                value: backups
              - name: cdn_ACCESS_KEY
                valueFrom:
                  secretKeyRef:
                    key: access-key
                    name: cdn-secrets
              - name: cdn_SECRET_KEY
                valueFrom:
                  secretKeyRef:
                    key: secret-key
                    name: cdn-secrets
```

## Existing Backup Containers
In the interest of speeding up adoption, we have open sourced some of the backup containers
we use in our infrastructure. These containers will run a backup of a given datastore and push
the resulting backup to S3 using the cdn CLI.

 - [MongoDB](https://github.com/SierraSoftworks/minback-mongo) - `minback/mongo:latest`
 - [PostgreSQL](https://github.com/SierraSoftworks/minback-postgres) - `minback/postgres:latest`

[CronJob]: https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
[Deployment]: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
[Job]: https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/
[cdn]: https://www.cdn.io/
[Multi Stage Build]: https://docs.docker.com/engine/userguide/eng-image/multistage-build/
[s3-durability]: https://aws.amazon.com/s3/faqs/#data-protection
