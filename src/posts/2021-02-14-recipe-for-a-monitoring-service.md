---
title: Blueprint for a Monitoring Stack
description: |
    Lessons learnt and thoughts on how to design a full monitoring stack which supports
    your company's success and prioritizes the happiness of your customers.
date: 2021-02-14T01:53:00Z
permalinkPattern: :year/:month/:day/:slug/
categories:
    - development
    - operations
    - theory
tags:
    - development
    - operations
    - theory

# cspell:ignore Moogsoft, Loggly, Sensu, Kubeless
---

# Blueprint for a Monitoring Stack

At one point in my career, I spent over two years building a monitoring stack. It started out
the way many do; with people staring at dashboards, hoping to divine the secrets of production
from ripples in gravitational waves before an outage occurred. The most experienced engineers
could sometimes spot the high energy particles as they were about to flip bits, but I never
got that good.

Over these two years we was able to transform not just the technology used, but the entire
way the organization viewed monitoring, eventually removing the need for a NOC altogether.
To achieve this, we spent a lot of time focusing on what is important and, more importantly,
what is irrelevant in a monitoring system.

What I'm going to describe here isn't that stack specifically, but rather the key design
decisions and crucial pieces which allowed us to build something successful and which have
left me wishing for something equivalent in everywhere I've worked since. If you're planning
to build a monitoring stack from the ground up, this might be a good place to start.

<!-- more -->

## Standardizing Terms
Before we get started talking about how to build a monitoring stack, I want to clear up a few
terms that will be used throughout the rest of this post. You might find that different people
and organizations choose to interpret these differently, I've decided to go with the following
definitions as they allow me and the teams I work with to succinctly describe what we mean in
this domain.

### Logging
Logging refers to the stream of data, usually in a text-based format, which is emitted by applications
to provide information about their current runtime state and any changes to that state. In some cases
free-text logging may be replaced with structured logging to enhance discoverability and in extreme
cases this may cross the line into the world of "events".

### Metrics
Metrics are measurements which describe the current state of the system numerically. In most cases
multiple metrics may be emitted by each host/application and in many cases these metrics will include
metadata describing the properties of the environment they relate to. Almost universally, metrics
are designed to be aggregated such that compound views into your fleet can be quickly and cheaply
generated.

### Events
An event is a structured piece of data emitted whenever something of interest occurs within a
system. They usually contain as much context as possible about the nature of the interesting
occurrence and are usually emitted more rarely than logs or metrics. A good example of an event
is [Sentry](https://sentry.io)'s exception reports.

### Monitoring
Monitoring is the automation responsible for doing the job of looking at your logs, metrics and
events to identify issues and report on them. At its most basic, it replaces humans staring at
dashboards with automation that does much the same.

Monitors themselves may then proceed to emit events or directly trigger alerts, depending on
your monitoring system's architecture.

### Alerting
Alerting is the process of informing a human operator that something has occurred which may
require their attention. Alerting may take many forms, from a new record being added to a list
of active "alerts" shown on a dashboard, to posting a notification in a Slack channel or
paging an engineer directly.

### Paging
Paging is a specific form of alerting which is intentionally designed to ensure an immediate
human response. It usually involves multiple independent communication paths, such as push
notifications, phone calls, SMSes and fallbacks to other humans if others are unavailable.

## Evaluating a Monitoring Stack

### Defining Success
An area where I immediately see a number of monitoring offerings failing is in how they
define (and deliver) success. As a company, your primary concern should be ensuring that
your engineers are able to mitigate issues as quickly as possible and with as little customer impact
as possible. If you can satisfy that requirement, while retaining talent, ensuring adequate capacity
for innovation and keeping costs low, you likely don't care how the rest of your monitoring
system works.

This is a simplistic view, but it draws focus to the fact that when evaluating a monitoring
stack, we need to first focus on how it supports engineers in rapidly and safely triaging
problems. A stack which provides engineers with exceptional guidance on how to resolve an
issue will fundamentally be limited by how quickly it can determine that there is an issue.
That same stack, if it is able to quickly determine when there is an issue, will be constrained
by how quickly the data it needs to make that decision becomes available.

Monitoring stacks which focus on the bottom of this hierarchy first and ignore the top will
often be cheap to operate, but may be catastrophically costly from a customer experience
perspective.

### Key Requirements

 - It should provide engineers with the context necessary to rapidly classify and triage a given issue.
 - It should alert the engineers best positioned to remediate a given issue.
 - It should effectively classify impact and use this to determine how and when a human operator should alerted.
 - It should provide teams with self-service control over their monitoring configuration.
 - It should be able to detect issues quickly.
 - It should be able to detect issues reliably.
 - It should have a high signal to noise ratio (real issues vs non-issues).

### Doing your Research
When evaluating a monitoring stack, there are a few things I look for. It must be **sensitive** to changes in the expected state of the
things it is monitoring - it is always better to have more information than less. It must have a **high signal to noise ratio** because
you really don't want to have to try and clean up a noisy event stream as a human (that leads to alert fatigue and defeats the point of the endeavour).

The monitoring stack should **provide added value** over and above what is available from a basic check system like [Nagios][].
This might mean that it attaches **additional, useful, context** to the events it presents, is able to route
**problems to the people who can fix them** and allows **configuration by customers**.

With that in mind, you're looking to build a stack which takes what you probably have already (a stream of events indicating
that things have broken) and intelligently presents those events, at the right time, to the right people with all of the
information they need to be able to triage the problem as quickly as possible. Phrased another way: you want the right engineer
to be presented with all of the information they need to triage the problem safely and expediently,
with as little delay as possible, while avoiding false positives.

Remember that there is a distinct difference between a monitoring stack and a metrics/logging stack. Metrics and logging are
exceptionally good at supporting humans in tracking down the cause of an issue, providing long-term behavioural insights and
exposing detailed runtime data. Conversely, monitoring is responsible for precisely and reliably identifying when things break.
Where an engineer during their normal work week might use logs and metrics to track down why something broke so that they can fix
the underlying issue, an engineer being paged at 03:00 on a Sunday is looking for the quickest way to restore service. Two very
different use cases and two very different stacks to support them.

## Designing your Stack
Let's start with the bad news: if all you do is build a monitoring stack, you're probably not going to
solve the problems which led you down this path to start with (unless this is your own personal project and
you are the only user). The only way to get this right is by changing the way that your organization
approaches monitoring and setting solid expectations around it. The technology you use and the stack you build
will play a huge role in enabling that transformation, but without the support of your people, you'll just have
a very fancy NOC dashboard.

The good news is that once you've got the kind of stack we built, it's very easy to convince people to
make those organizational changes and much harder for troublemakers to argue against the progress you're
trying to drive.

### Customer Driven
Remember how I said that people are what makes or breaks this transformation? Giving those people the tools they need to tailor
behaviour to suit their use cases is a critical feature for building that initial engagement and supporting teams through that evolution.

#### "Bring your own checks"
It is important to realize that most of your customers will not be coming from a green-field environment, rather they will bring
along years or even decades of existing check infrastructure and asking them to flush it all to make the switch to your stack is going
to be a tricky conversation to have. Instead, making support for arbitrary datasources a core feature of your service will enable you to
onboard teams with legacy monitoring infrastructure quickly, begin delivering value and then drive modernization on the backbone of you
 more advanced functionality rather than through a barrier to entry.

An extremely good approach to this is to provide tooling that allows customers to plug their own data-transformation engines into your pipeline
to manipulate the data they generate into a form which is compatible with your API.

#### An API
I can't stress this enough: **having a standardized and documented API will make your life a hundred times easier**. If you're
considering having your stack integrate with your customers' existing infrastructure, you're doing things wrong. Your stack is trying
to solve tomorrow's problems and designing it based on the tools of yester-decade will only serve to slow your progress,
detract from the simplicity of your stack and reduce its agility.

Instead, focus on defining a fully featured and well structured API through which any potential datasource may submit events for processing and
tune their behaviour. Once you have that, build microservices or plugins which are responsible for doing elementary data transformation and ingestion on behalf
of your legacy systems and have them consume that API directly. This approach allows you to add support for new data sources without needing to touch your core
service, enables you to create bespoke integrations for each of your customers with minimal effort and even allows you to offload particularly costly operations
to a fleet of stateless data transformation agents before events even reach your stack.

A particularly nice option for these integrations is to leverage a Functions as a Service platform like [AWS Lambda](https://aws.amazon.com/lambda/),
[OpenFaaS](https://github.com/openfaas/faas) or [Kubeless](https://kubeless.io/).

::: warning
Many legacy monitoring tools do not provide you with an elegant way to observe state changes. A particularly bad idea
is to pipe their full-fidelity state feed into your system and try to reconcile state changes there, you will quickly
overload your core service and turn this into a scalability problem (which it doesn't need to be).

Instead, do state change calculations at the edge and only pass interesting events to your core service for
evaluation.
:::

### Fall Into Success
The hallmark of any good framework is that it's easier to do things the right way than it is to do it the wrong way. In most cases, this is
the result of the engineers who build the framework being aware of the internal biases and fallacies that people make on a daily basis,
designing their system to either leverage or avoid them.

When you're designing your stack and its API, try to keep this in mind. Keep the number of decisions that a customer has to make to a
minimum, guide them down the well-paved-road to success and present them with easy to select forks rather than complex intersections
with a number of potentially correct routes to their destination.

#### Simple Options
Wherever your customers need to make a decision, keep the list of options to a minimum. Humans are really, really bad at making decisions
when faced with a large number of options - so help them along and ask "sushi or pizza for lunch?" to keep it quick. **Drive the conversation**.

##### Service Status

 - `healthy`
 - `unhealthy`

 Giving intermediary options like "warning" or "unknown" simply leads to confusion about what is actionable and what isn't. Either your
 service is healthy or it isn't. If a check can't determine which it is, the check isn't checking the right thing.

##### Priority

 - `high` or "wake me up at 0300 on a Sunday if this breaks"
 - `low` or "I'll look at this on Tuesday when I'm back from my long weekend"

Nobody knows what a "medium" priority alert means: does that mean I can finish my mug of coffee, or do I need to sprint to my desk? Is this
impacting customers, or is the system just feeling cranky after getting no attention from ops for 3.217 femtoseconds? Keep things simple and
actionable, but also encourage your customers to design systems to fail in one of two ways: it's actually down and needs someone on the double
vs the system can limp along but needs some help to get back on its feet when you can spare the time.

Having a database server fail on you should fall into the latter category, losing a datacenter will probably fall into the former
(unless you collect DCs like I collect Lego).

### Events as a unit of work
Remember that API I mentioned? It works really well if the things it receives are "events". An event can hold whatever information you deem
necessary, but it should represent the change in state of a particular service or component. By working with a stream of events, you can
design your stack to operate as a series of simple, stateless, actors which are responsible for processing a certain type of event and
(in some cases) generating others.

If your organization already has a message queue system in place, use it. Build libraries and templates which enable your customers to quickly
plug into it and start generating events. Try and design a schema which enables the caller to provide configuration for everything your core
service offers, you want your customers to be in as much control as possible (and no more).

```yaml
alert:
    monitor: InstanceHealth
    status: unhealthy
    since: 2021-02-14T01:13:01Z
    message: |
        This instance is no longer responding to health probes successfully.

        Received: 503 Service Unavailable
        Expected: 200 OK

context:
    region: eu-west-1a
    service: bender
    instance: i-a0172ba72f5

# You should have some sensible defaults for these
filters:
    - type: ignore-flap
      params:
        min-age: 5m
    - type: alert-suppression

# You should have some sensible defaults for these
grouping:
    keys:
        # Basic template support can make generating these events much easier for your customers
        - '${alert.monitor}'
        - '${context.service}'
        - '${context.region}'

alerting:
    priority: low
    channel: '#bender-on-call'
    ticket-queue: BENDER

plugins:
    - type: markdown
      params:
        content: |
            ## Description
            This instance's health-check has failed, which indicates that it is no longer
            able to serve traffic. **It will be automatically removed from the load balancer**
            and traffic will be routed to other instances automatically.

            Please investigate why this instance failed so that we can prevent the issue
            from occurring again in future.

    - type: logs
      params:
        query: SELECT * FROM logs WHERE service = '${context.service}' AND region = '${context.region}' AND instance = '${context.instance}'

    - type: cluster-health
      params:
        region: '${context.region}'
        service: '${context.service}'

    - type: runbook
      params:
        id: TSG-BENDER-12
```

### Data Collection
Data collection might sound like the most difficult part of your stack, but in practice this part tends to be pretty easy. Not only will most of
your customers already have some kind of data collection system in place (whether it be [Zabbix](https://www.zabbix.com/), [Nagios](https://www.nagios.com),
[Sensu](https://sensu.io/) or any one of the hundreds of other options out there).

What you want to focus in this arena is how the collected data is surfaced to your monitoring stack, how to simplify the job of adding more visibility
and how to identify and improve low quality data collectors/checks. What has worked very well for us is allowing the same check definitions used to
control how data is collected to determine what configuration we send to our API. This allows the way a check is handled to be defined alongside
the check itself and can greatly improve the accessibility and long term maintainability of your solution.

When designing your data ingestion system, keep in mind that some of your customers may make use of Monitoring as a Service products
like [DataDog](https://www.datadoghq.com/) and [Loggly](https://www.loggly.com). These external systems will usually want to report data
to you via WebHooks, in which case your platform should support that in a safe and frictionless fashion.

### Static Pre-filtering
No matter what you do, you're almost certainly going to end up with an overwhelming number of events hitting your system. In our case, we're
talking thousands of events per second and this number roughly doubles every 6 months. You might be able to build a full stack that can handle that,
but in practice you almost certainly don't need to. Instead, design some simple filters which can be deployed at the edge of your stack to reduce
the event load to something manageable (our pre-filtering drops the event rate to about an event every 5 seconds).

Pre-filtering may consist of something looking for a change in the state of an alert (easy to do if you include a counter of the number of times
that the alert has been run and remained in that state), ignoring alerts which are on retired machines etc. To help increase your SNR and reduce
the number of events passing through to the next stage, you may also implement a debounce filter - however you should take note of the impact this
has on your response time and the potential for permanently flapping alerts to be missed.

### Dynamic Pre-filtering
This is where your core service really starts. Dynamic pre-filtering is the process of deciding whether an event is worthy of requesting a human's
attention based on data that is collected once the event arrives. This data may include things like correlatory metrics, whether there is active maintenance
being performed on the service, if the service is customer facing or not and a plethora of other business-specific datapoints.

Effectively, you should try and cover every decision a human would have to make to determine whether this event is actionable or not. If after checking
all of that, you determine that it is indeed actionable, then you'll proceed to the next stage. Of course, you might determine that it is actionable,
but not at the priority which was specified (perhaps because the service is under active maintenance, or because the service is still in testing and not
yet available to customers). In these cases, your pre-filtering may do some data manipulation on the event before passing it through to the rest of the
pipeline for processing.

### Grouping
Grouping is usually the next step you want to cover. While grouping things "correctly" can sometimes be more of an art than a science, there is no
disputing that it demonstrates its value when you're being flooded by events from thousands of machines encountering the same issue (like when DNS
fails in one of your datacenters and all of the services there start to bemoan their lost dependencies).

It is critically important that whatever algorithm you select for grouping, it operates online (i.e. doesn't need to buffer events), is capable of
enough concurrency to support your use case and does not suffer from race conditions which lead to undefined behaviour in your stack.

You should also be careful about how you select your grouping keys, ideally allowing customers to override or disable them if they have special use
cases. Ensure that you can close a group once the incident is resolved and that you set a time-window on grouping to prevent temporally unrelated events
from being matched with one another (and potentially hiding a more recent problem behind an older one).

The purpose of grouping isn't to ensure that you catch everything under the banner of a single incident, but rather to help reduce the human workload of
managing incidents by aggregating a large number of events into a small number of incident entries.

### Context Collection
While filtering and grouping of alerts will get you most of the way towards a functional stack and will certainly provide you with a much more
manageable NOC dashboard, if you really want to provide an offering that drives organizational value, you're going to want to differentiate
yourself from everything else out there that does "AI powered alerting"... Yes [Moogsoft](https://www.moogsoft.com/), I'm looking at you!

The best way to provide this value add is to expose contextual information that an engineer would need to seek out in their process of identifying
and triaging the problem. This might mean collecting related logs and injecting them into your alert, or showing the system metrics that preceded
a rise in application latency. You might gather information from your runbooks for the service, find recent occurrences of the same or similar
problems to draw useful information from and provide a list of recent changes made. All of these things can help an engineer quickly and accurately
track down why a service is encountering problems before they have even clicked the **Acknowledge** button on their pager.

One of the lessons we've learnt the hard way is that humans are terrible at executing runbooks. Either the runbook is missing information necessary
for the human to do their job, or the human misses the important parts because there's too much information, or they simply get really good at
remembering `v$PREVIOUS` of the runbook and doing all the right steps for the service we replaced 3 months ago. You can try and fix the people,
but that rarely scales. Fixing the systems that support those people has yielded much better and more consistent results, enabling engineers to
triage problems faster, more consistently and more reliably than they were ever able to do before.

### Alerting
Until this point, we've built a really good data acquisition system and not really involved humans in handling the failures it detects. The
purpose of a monitoring stack is generally to get a human involved, so let's talk about how to do that.

In our experience, there are really three categories of alert. Alerts which need to **page a human**, alerts which need **follow-up by a human**
and advisory alerts which are **nice for a human to know about**.

#### Paging
The first category, pages, generally requires you to leverage a tool which is designed to wake people up at 0300 on a Sunday. There are a number
of options on the market including [PagerDuty](https://www.pagerduty.com) and [xMatters](https://www.xmatters.com/), which one you chose is up to
you but make sure that your company has a solid on-call policy in place, engineers have it configured correctly and that your service integrates
correctly with it. You definitely don't want to discover during a major outage that any of those things were overlooked...

Perhaps it goes without saying, but if you're paging someone, you're paying a pretty high human cost for a system failure. While it might not be
feasible to do an RCA for every page you generate initially, your organization should be of the mindset that "being paged is not okay" and work
hard towards ensuring that it only happens in extreme situations. An engineer shouldn't be paged more than a couple of times a year ideally and
only in situations where it is absolutely critical that they step in to triage a major incident, if it happens more often than that, your systems
need a lot of time and effort invested into improving their reliability.

#### Ticketing
Regardless of whether you decide to page someone or not, you should have a ticket to track the work being performed to fix a problem. It doesn't
much matter whether this ticket is being cut in [Jira](https://www.atlassian.com/software/jira), [GitHub](https://www.github.com) or your own
in-house issue tracker. The point is that when someone starts working to triage an issue, they should have somewhere to document what they are
doing and keep a record of whatever follow-up needs to take place.

If you have decided that an event doesn't warrant a page, but should be looked at by a team, then placing a ticket in their work backlog is a
great way to ensure that it gets processed without the cost of interrupting their daily workflow.

In our case, these tickets include all of the supporting context that we were able to collect and are intended to provide an engineer with
everything they need to answer the following questions:

 - What failed?
 - What is the impact of this failure?
 - How urgent is it that this failure be fixed?
 - What should I do to fix this failure?
 - Where should I start looking for the root cause of the failure?

This is accomplished by providing detailed information from the check, information about the infrastructure it is running on, links to other
related alerts, metrics and logs for the impacted service and the details of any recent changes made to the service.

#### Notifications
Generally you'll want to notify people that an event has been processed and show them some type of visual indication of what the current
state of it is. If done well, this can kickstart the response and help recruit engineers to repair a problem quickly after it occurs rather
than waiting for their PM to review the ticket backlog and assign the work.

In our case, we leverage [Slack](https://slack.com/) for this and use its attachments to present rich information about the failure and its state.

### Suppression
I almost cannot describe how important having a good alert suppression system is. If you implement nothing else in your
entire system, getting this part right is likely to reduce your overall volume of alerts by orders of magnitude.

If you are at all familiar with operating services in a production environment, you likely know that alert volume
is directly correlated with the amount of change being made in your environment. Sometimes these alerts are indicative
of real customer pain, while other times they are artifacts of monitors which cannot accurately distinguish between
a web server going offline unexpectedly and one going offline for maintenance (or insert any other example here).

In most modern organizations, changes are often conducted using automation. Providing your customers with the ability
to suppress alerts from within that automation means that you can both reduce alert fatigue and enable engineers
to declare, up front, the expected impact of their changes - providing substantially higher signal to noise ratios
when things go wrong.

Of course, many other changes are also ad-hoc or unique enough that it is important to provide your customers with
an easy to use interface through which they can manually suppress alerts. Making this quick and simple to use will
both drive adoption, as well as provide your customers with a highly effective tool to use during alert floods.

A particularly effective design for this kind of service is one which allows suppressions to be defined with metadata
approximating the following:

```yaml
description: Updating to Windows Server 2019 for Bender in eu-west-1a
startTime: 2021-02-14T00:00:00Z
endTime: 2021-02-14T07:00:00Z
metadata:
    team: bender
    engineer: bpannell
    channel: "#bender-on-call"
    ticket: BENDER-42
targets:
    - region: eu-west-1a
      service: bender
      monitor: InstanceHealth
    - region: eu-west-1a
      service: bender-db
      monitor: LeaderElectionUnderway
```

#### Key Points

1. Suppressions have a well defined start and end time. This allows them to be scheduled ahead of time and ensures
   that the suppression is removed automatically once the end time elapses. You can enforce business policies around
   maximum duration if you wish, but you should also allow the end (and start) times to be updated as circumstances change.
2. Metadata is used to provide information about which team is responsible for this work, who the points of contact are
   and other information describing the work that is ongoing. If you've got a ticketing system, linking tickets to
   suppressions can be a great way to give context.
3. Suppression targets describe a set of dimensions against which a match is evaluated. A set-intersection here is usually
   good enough for most use cases, however RegEx can be useful especially if you use consistent naming schemes for
   hosts and instances in your company.

Some additional things you probably want to do include:

 - Ensure that any alerts which are suppressed get logged somewhere that makes them easy to find. Also, make them visible
   in your suppression tooling so that engineers can visually inspect the results of their suppressions.
 - If you support RegEx/wildcard matching, make sure that engineers can't suppress the world (same goes for empty `target`s).

## Final Thoughts
Building a monitoring stack which supports your company's long term success is by no means a trivial challenge. The
tools and technologies available today are leagues ahead of what we had a decade ago, but many of them still focus
on being metrics/monitoring tools first and foremost.

In building a monitoring stack, your role is to take a step back from the coal face and look at the holistic problem
space. In many organizations, the primary focus is on reducing alerting noise, but without a fundamental shift in
the nature of how we measure success, this is a losing battle. Work with your organization's leadership to define
metrics of success which incentivize the right investments (SLOs, if used correctly, can be a powerful instrument
for change here).

With that done, the problem rapidly turns into your typical software engineering problem of "talk to your customers,
develop user stories, extract requirements, implement, test, iterate, repeat". Hopefully some of the specific ideas
and decisions outlined in this post will help fast-track portions of that process for you, but I'm sure you'll find
many other challenges along the way.

Best of luck, may your pagers remain quiet and your customers happy.

*[NOC]: Network Operations Center

[Nagios]: https://www.nagios.org/
