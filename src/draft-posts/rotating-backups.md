---
title: Rotating Backups
date: 2017-12-24 17:05:38
tags:
    - operations
    - business
    - theory
draft: true
sitemap: false
---

Recently I wrote a blog post on how to execute scheduled backups using
[Kubernetes][] [CronJobs][CronJob]. In that post I showed how easily one
could dump backup files to an S3 bucket on a schedule using some trivially
simple containers, but the astute among you will have noticed that I didn't
touch on the topic of backup rotation...

Backup rotation is the process of removing old or extraneous backups to make
the best of your available storage space and before I write a post on how we
do that, I'd like to discuss what backup rotation implies and how it should
be done to maximize business value and minimize risk.

<!--more-->

## Backup Storage Windows
Regardless of how you're creating backups or where you're storing them,
they are going to live for a period. For some organizations and systems
that may be decades or centuries, while for others the backup retention
window may be measured in minutes.

<Figure src="https://cdn.sierrasoftworks.com/blog/rotating_backups_intervals.svg">

**Figure 1** Backup Storage Intervals
</Figure>

You can usually classify a backup into one of a few types based on its age,
however. Long term backups, or archival backups, are primarily used for
auditing purposes or to enable static data to be removed from your high
performance, costly, infrastructure as it becomes irrelevant for the day
to day running of your system.

As we move into the realm of weeks or months, you start seeing short-term
backups. These backups are maintained for the purpose of restoring the
system from a catastrophic failure (the loss of a datacenter, destructive
security breach etc). These are often stored in multiple locations and
are your insurance against losing your company to an incident which renders
all of your production data unavailable.

Finally, you have nightly backups. These backups are often stored on-site
and are intended as a means to quickly recover from a bad release or hardware
failure while minimizing impact on your customers.

In an ideal world, all of these would be the same thing, but there are some
very good reasons why that is often not the case...

## The Cost of Backups
While the value of having backups cannot be overstated, one must also remain
cognizant of the cost that maintaining them imposes on your organization.

If you think of backups as insurance, then the idea becomes easier to
grasp. In the world of insurance: higher monthly premiums reduce your
cost of excess (the amount you pay when you place a claim), so there is a
trade-off between how much you pay every month and how much you need to pay
when something goes wrong.

This exact trade-off applies to backups as well. With an unlimited amount
of money, you would be able to afford to maintain an almost unlimited number
of backups and the cost of recovery (lost data) would be minimal in every
case.

In practice, however, you are not going to be able to afford to maintain an
unlimited number of backups and will need to instead balance the cost of storing
backups against the cost of any lost data as a result of you not having a backup
that covers that data loss.

### Types of Data Loss
This brings us neatly to the question of "what is data loss?". Put quite
simply, it is anything which results in you no longer having access to data
that you want to have access to.

### Deletion
At its most innocuous, data loss can simply be someone accidentally deleting
the wrong file. This happens a lot more frequently than you'd imagine and there
have been a number of high profile instances like [GitLab's][gitlab-database-loss].

<Figure src="https://cdn.sierrasoftworks.com/blog/rolling_backups_deletion.jpg">

**Figure 2** Data Deletion
</Figure>

A lot of the time, you'll find short term or even nightly backups being used to
restore user data that has been accidentally removed by someone who was a bit too
over-zealous with the `Delete` button.

#### Corruption
Unfortunately, the reality of the physical domain is that things tend to decay. While
long term storage decay is a common source of corruption, it isn't the only thing that
can leave data in a form that prevents you from accessing the information you are looking
for.

<Figure src="https://cdn.sierrasoftworks.com/blog/rolling_backups_corruption.jpeg">

**Figure 3** Data Corruption
</Figure>

In practice, everything from hardware failures to bad software updates can result in
your data being damaged (and making you thankful for your backups when it comes time
to repair it).

#### Destruction
Finally, data destruction involves the actual loss of your data. This could
be the result of a fire in your datacenter, a natural disaster or even a
faulty HDD in systems that don't have redundancy on the hardware level.

<Figure src="https://cdn.sierrasoftworks.com/blog/rolling_backups_destruction.jpg">

**Figure 4** Data Destruction
</Figure>

While complete data destruction is rare in most production-grade systems
as a result of application level, and even disk level, data replication;
it does pose a significant risk to the business' value simply due to the
impact it can have.

### Recovery
Now that we know how data can be lost, let's talk about how we recover it...

> If you don't have a backup, there's nothing in this section that will help you

In practice, the process you take to restore data following a loss will entirely
depend on which data was lost and what data you have available to you in backups.

It is important to remember that your goal isn't simply to put data back. Simply
adding more information to a broken system will often make the problem worse,
so instead you should attempt to return the system to the correct state. Your
objective should be to return the system to a state that is as close as possible
to the state it would have been in had the data loss not occurred.

> Your objective is to **return the system to** a state that is as close as
> possible to **the state it should be in had the data loss not occurred**.

Operating with this objective in mind, you will often be left with the task
of reconciling conflicting data from the live system (which may not necessarily
be accurate) with data from the backups.

#### Clean Restore
The easiest restore to perform is a clean restore. This is usually your only option
in situations where the original data has been destroyed and is unrecoverable.

The process is relatively straightforward, you start with a clean system and full
backup, which you will apply to the system with the objective of returning it to the
same state that the original system was in at the time the backup was taken.

The benefits of a clean restore are that it will, assuming your backup tooling works
correctly, always result in a system which is in the same state as the original
system at the time of the backup. This allows you to easily reason about the state
and can avoid the potential for data corruption present in other restore processes.

#### Additive Restore
An additive restore is one where new information is added to an existing system without
overwriting any of the old information. Depending on the system you are backing up, this
may or may not be possible - in which case you may be forced to perform a
Conflict Reconciliation restore instead.

Systems which are suited to this type of restore are those which leverage immutable,
append-only, storage structures. Their design means that one can safely restore a
partial backup over the existing state to resolve differences between them - an
incredibly useful property if you wish to build a service which is robust against
hardware failure and data loss.

#### Conflict Reconciliation
In most situations, restoring a backup on a system with existing data will result in
the need for conflict reconciliation. Most tools allow you to perform some level of
basic reconciliation (overwrite existing or don't overwrite existing entries), however
there will be times when this blunt approach causes more problems than it solves.

Before restoring data in a way that will require conflict reconciliation - ensure that
you have an excellent understanding of the business logic responsible for, and dependent upon,
the data you are restoring. Document your reconciliation algorithm and verify that it
behaves correctly on sample datasets and by consulting with your subject matter experts.

Once you are confident that you have a reconciliation algorithm that safely recombinates
your data, you can go about restoring your partial backups onto the existing state.

##### A note on incremental backups
Many database servers provide the ability to take incremental backups which, in conjunction
with a full "root" backup, can restore a database to a point-in-time state. These incremental
backups are intended to be applied to an offline database in a specific order and from a
predetermined initial state (the "root" backup). When applied in this manner, the conflict
reconciliation algorithm can be trusted to be well defined and tested, however attempts to
apply these backups on live systems or to systems whose initial state is not predetermined
will usually fail.

#### Data Recovery
Your final option when it comes to restoring data is physical data recovery. This
usually involves specialized labs who will attempt to read the data off of damaged
storage devices and reconstitute it for you - however it is often extremely expensive
and the probability of recovery can vary wildly.

If you're in this boat, all I can do is wish you the best of luck and suggest you
look at investing in a good backup solution if you survive the process.

[CronJob]: https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
[Kubernetes]: https://kubernetes.io/
[gitlab-database-loss]: https://about.gitlab.com/2017/02/01/gitlab-dot-com-database-incident/
