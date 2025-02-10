---
title: Rotating Backups with Kubernetes
date: 2017-12-24 19:25:10
draft: true
sitemap: false
tags:
    - kubernetes
    - operations
    - cdn
    - s3
---

Recently I wrote a blog post on how to execute scheduled backups using
[Kubernetes][] [CronJobs][CronJob]. In that post I showed how easily one
could dump backup files to an S3 bucket on a schedule using some trivially
simple containers, but the astute among you will have noticed that I didn't
touch on the topic of backup rotation...

Backup rotation is the process of removing old or extraneous backups to make
the best of your available storage space and in this post I'll go over the
approach I use to keep track of the backups that are important to us.

<!--more-->

[CronJob]: https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
[Kubernetes]: https://kubernetes.io/
