---
title: Patterns for APIs
date: 2018-03-28 20:00:00
permalinkPattern: :year/:month/:day/:slug/
tags:
    - development
    - api
---

# Patterns for APIs

If you've built a production API before, you'll know that they tend to
evolve over time. This evolution is not only unavoidable, it is a natural
state that any active system will exist in until it is deprecated.

Realizing and designing to support this kind of evolution in a proactive
way is one of the aspects that differentiates a mature API from the thousands
that litter the Wall of Shame.

At the same time, it is important that your API remains easy to use and
intuitive, maximizing the productivity of developers who will make use of it.

<!-- more -->

## Elementary Patterns
The following are what I consider to be "base" patterns which should always be
considered when building an API. While by no means comprehensive, they represent
a good basis on which to form your design and will help add a degree of consistency

### Versioning
Without a doubt, versioning is the single most valuable tool in the arsenal of someone
designing an API which can evolve as requirements change. There are a number of approaches
one can take, including the use of HTTP Headers, version specific domains or even URL query
parameters. My personal favourite is to simply include the API version in the URL's path.

:::: code-group
::: code-group-item path

```http
GET /api/v1/users HTTP/1.1
Host: api.mycompany.com
```

:::

::: code-group-item query

```http
GET /api/users?api-version=1.x HTTP/1.1
Host: api.mycompany.com
```

:::

::: code-group-item host

```http
GET /api/users HTTP/1.1
Host: api-v1.mycompany.com
```

:::

::: code-group-item headers

```http
GET /api/users HTTP/1.1
API-Version: 1.x
Host: api.mycompany.com
```

:::
::::

### Identify API Routes
Unsurprisingly, APIs tend to form part of a larger system. Depending on your use case,
it can often be helpful to present both the API and a user interface on the same domain.
Not only does this cut down on the complexity of configuring [CORS][], it enables your users
to more easily identify related resources.

To ensure that it is possible to provide a user interface on the same domain, it is often
particularly helpful to prefix your various API methods with the `/api/` path component.

:::: code-group
::: code-group-item api

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com


HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "id": 1,
        "name": "Bob"
    }
]
```

:::

::: code-group-item ui

```http
GET /users HTTP/1.1
Host: app.mycompany.com


HTTP/1.1 200 OK
Content-Type: text/html

<html>
    ...
</html>
```

:::
::::

### Correct Verbs
Put quite simply: use the right HTTP verb for your purpose. This makes it easy for someone
who is unfamiliar with your API to identify what something does or what they can expect to
provide it without needing to dive through your docs.

Remember that the more time someone spends writing their own code, the happier they
are likely to be with your API. **Don't make your users' lives difficult.**

:::: code-group
::: code-group-item list

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com
```

:::

::: code-group-item create

```http
POST /api/v1/users HTTP/1.1
Host: app.mycompany.com
Content-Type: application/json

{
    "name": "Bob",
    "pet": "Charlie"
}
```

:::

::: code-group-item replace

```http
PUT /api/v1/user/1 HTTP/1.1
Host: app.mycompany.com
Content-Type: application/json

{
    "name": "Bob",
    "pet": "Doglet"
}
```

:::

::: code-group-item modify

```http
PATCH /api/v1/user/1 HTTP/1.1
Host: app.mycompany.com
Content-Type: application/json

{
    "pet": "Doglet"
}
```

:::

::: code-group-item remove

```http
DELETE /api/v1/user/1 HTTP/1.1
Host: app.mycompany.com
```

:::
::::

### Correct Status Codes
As with the verbs you make use of, the status codes returned by your API should be standards
compliant and as descriptive as possible. Providing the correct response code will allow clients
to quickly and safely respond to problems with a minimum amount of confusion.

At a minimum, you should be familiar with the following [HTTP Status Codes][] and know when
to use them.

| Code | Usage |
| --- | --- |
| `200 OK` | Used to indicate that a request completed successfully and that the response includes the requested content. |
| `201 Created` | Used to indicate that a request completed successfully and that an entity has been created as a result. |
| `204 No Content` | Used to indicate that a request completed successfully but that no content will be returned by the server. |
| `301 Moved Permanently` | Indicates that the entity you are requesting has been permanently moved to a different URL specified in the `Location` header. |
| `302 Found` | Indicates that the entity you are requesting can be found at the location specified in the `Location` header. |
| `400 Bad Request` | Indicates that the server could not process the request due to an error the client has made. |
| `401 Unauthorized` | Used when a client has not provided (valid) credentials to access the current resource. |
| `403 Forbidden` | Used when a client tries to access a resource for which their credentials do not have access. |
| `404 Not Found` | Indicates that the server could not find the entity requested by the client at the given URL. |
| `405 Method Not Allowed` | Is the correct response code when using an unsupported HTTP verb on an entity (don't use `404 Not Found` for this). |
| `409 Conflict` | Indicates that the request could not be performed because there is a conflicting change, like an existing entity with the same ID. |
| `429 Too Many Requests` | Used to indicate that the client has exceeded its rate limit. |
| `500 Internal Server Error` | The general error message when your server fails to process a request for an unexpected reason that is no fault of the client. |
| `501 Not Implemented` | The equivalent of C#'s `NotImplementedException`, indicates that a method will eventually be present but is not yet. |
| `503 Service Unavailable` | Indicates that your service is down due to a problem or maintenance. |

### Pluralize Collections
Again, in the vein of making your API easy and intuitive to use, it is a good idea to
ensure that anything which returns a list of items has a pluralized entity name.

For example, if you are returning a list of users then you would make use of `/api/v1/users`
while to fetch a single user you would use the `/api/v1/user/{id}` route.

:::: code-group
::: code-group-item plural

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com


HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "id": 1,
        "name": "Bob"
    }
]
```

:::

::: code-group-item singular

```http
GET /api/v1/user/1 HTTP/1.1
Host: app.mycompany.com


HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 1,
    "name": "Bob"
}
```

:::
::::

### Specify Content Types
While something that sounds pretty obvious on the surface, it is incredible how many
APIs fail at this simple task. To put it simply: ensure that you always provide the
correct [MIME Type][mime-types] for the data you are sending to a client. This will
enable them to intelligently process the data correctly and will reduce the amount of
work that consumers need to perform when interacting with your service.

:::: code-group
::: code-group-item json

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com


HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "id": 1,
        "name": "Bob"
    }
]
```

:::

::: code-group-item html

```http
GET /users HTTP/1.1
Host: app.mycompany.com


HTTP/1.1 200 OK
Content-Type: text/html

<html>
    ...
</html>
```

:::
::::

#### `Accept` Bonus Points
If possible, you should also support the `Accept` header in your API - allowing clients
to specify the response type they are interested in. This can be incredibly useful for
operations engineers who need to quickly verify the state of your service in their browser
or in situations where your clients are able to leverage advanced (or horrible) encoding
schemes like ProtoBuf, MsgPack, XML+SOAP[^1] etc.

:::: code-group
::: code-group-item json

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "id": 1,
        "name": "Bob"
    }
]
```

:::

::: code-group-item html

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com
Accept: text/html


HTTP/1.1 200 OK
Content-Type: text/html

<html>
    ...
</html>
```

:::
::::

### Support Compression
[Compression][HTTP Compression] has been a commonly available part of the HTTP specification since `HTTP/1.1`
was introduced. Today there are a wide range of supported compression standards which are
widely implemented, but at the minimum you should consider supporting `gzip`.

In practice, we have seen significant improvements to usability for customers once compression
has been enabled, especially in regions where high speed internet is not generally available.
Formats like JSON also tend to compress rather well, with us sometimes seeing as much as 40x
compression rates.

While you're at it, take a look at Google's [zopfli][] which offers a gzip compatible format
with even better compression ratios for standard web content and is widely supported by most
common webservers.

:::: code-group
::: code-group-item gzip

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com
Accept-Encoding: gzip, deflate


HTTP/1.1 200 OK
Content-Type: application/json
Content-Encoding: gzip

...
```

:::
::::

## Complex Patterns
At times, there are edge cases that the elementary patterns simply do not cover satisfactorily.
This section tries to cover those edge cases and explain why one may opt to make certain design
decisions, where precedents have been set and what gotchas you should be aware of before starting.

### Searching a Collection
Searching is something that quickly becomes necessary as your dataset grows in size. Most customers
will only be interested in a small subset of that data and giving them the tools to select that
subset saves on bandwidth and computation time.

In most cases, searching can be accomplished by providing filters as part of your query parameters.
This approach enables you to continue using the `GET` verb safely, matches the approach taken by
most websites (with `?q=my search query`) and is simple to support with any HTTP client.

Unfortunately, implementations tend to limit the maximum number of characters in a URL, which places
a constraint on how long/complex your query can be and can realistically cause problems for your
users. More information can be found in this excellent [StackOverflow answer][url-length-answer],
but **as a rule of thumb you should avoid using URL strings over 2048 characters in length.**

To work around this limitation, you can make use of the body of your request to embed much larger
queries. This does, however, introduce the problem that some HTTP clients and servers do not support
`GET` requests with a body. As a result, it is generally a good idea to support the `POST` verb as
well.

My personal preference is to have a specific `/search` endpoint for the `POST` verb to differentiate
it from the creation pattern.

:::: code-group
::: code-group-item query

```http
GET /api/v1/users?name=Bob HTTP/1.1
Host: app.mycompany.com
```

:::

::: code-group-item get body

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com
Content-Type: application/json

{
    "name": "Bob"
}
```

:::

::: code-group-item post

```http
POST /api/v1/users/search HTTP/1.1
Host: app.mycompany.com
Content-Type: application/json

{
    "name": "Bob"
}
```

:::
::::

### Rate Limiting
If you're exposing an API to external customers, rate limiting is something you will likely find
yourself considering. At its simplest, rate limiting is used to prevent the processing of requests
from customers who are placing undue strain on your systems. Usually this is the result of the
customer not having implemented a portion of their service well, however one must be careful not
to artificially limit the growth of their largest customers in doing so.

Regardless of how you choose to implement rate limiting, it is a good idea to inform your customers
and provide suggestions on how best to handle situations in which they are rate limited. This will
allow them to react effectively and, if possible, avoid being rate limited in the first place by
restricting the load they impose on your systems in the first place.

Of the various rate limiting algorithms available, one of the more popular ones is a token bucket
which has a fixed refill rate and grants "tokens" for requests. When the bucket is emptied, the
customer is rate limited until there are enough tokens available to process a request.

In this approach, it is incredibly useful to include `API-Bucket-Remaining` and `API-Bucket-Rate`
header fields in your responses, allowing clients to predictively scale their load to ensure that
they do not exhaust the number of available request tokens available to them.

Of course, once the rate limit is hit, you should return an `429 Too Many Requests` status code.

:::: code-group
::: code-group-item normal

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com

HTTP/1.1 200 OK
API-Bucket-Remaining: 499
API-Bucket-Rate: 10

[]
```

:::

::: code-group-item limited

```http
GET /api/v1/users HTTP/1.1
Host: app.mycompany.com

HTTP/1.1 429 Too Many Requests
API-Bucket-Remaining: 0
API-Bucket-Rate: 10
```

:::
::::

## Bad Actors and Defensive API Design
Not all of your API's consumers are going to be friendly neighbourhood developers looking to
build your platform and eager to do the right thing&trade;. The real world, especially at scale,
is filled with parties who will be all to eager to divest you and your customers of valuable
personal information and business data.

Building a perfectly secure system that is accessible to the public internet is almost impossible,
however as an API designer you have a number of tools at your disposal to help minimize the risk
to your customers and business through intelligent API design.

### Defence in Depth
[Defence in depth][] is a military strategy in which one builds defences with the understanding
that they will fail, leveraging that property to create layers upon which attackers waste manpower
gaining ground before hitting your next defensive boundary.

This design approach translates exceptionally well to online systems where it can be assumed that
no single component is flawless. By leveraging layered protections which serve to limit an attacker's
freedom of access you can build significantly more robust systems and minimize risk at much lower total
cost than the alternative.

#### DDoS Attack Mitigation
An example of defence in depth for an API is how one may go about protecting against DDoS attacks
on your site. As a first tier of defence, you may take advantage of a protection solution like Akamai's
Prolexic offering, or CloudFare. This provider will attempt to classify malicious traffic and black-hole
it before it reaches your network, however an intelligent attacker may be able to disguise their requests
as legitimate traffic (or even piggyback on legitimate traffic, as happened to GitHub[^2]).

Rate limiting traffic entering your service is another good solution, however it is critical that the
rate limiting itself doesn't impose a notable performance cost on your service. Ideally, your rate
limiting would be multi-tiered, with basic IP level rate limiting being put in place at your service
boundary through a tool like [Fail2Ban][] and more complex rate limiting which requires your application
stack being heavily optimized to minimize its execution cost.

Your next layer of defence may involve caching edge-proxies which are able to limit the amount of traffic
hitting your core application. This may not necessarily be suitable for your normal workflow, but being
able to rapidly direct traffic for specific endpoints onto this infrastructure can allow you to quickly
reduce the load on your backend services and continue serving your other customers effectively. Reverse
proxies like NGINX can often be easily configured to provide this service[^3].

Finally, when it comes to building any high performance system, the value of simplicity cannot be overstated.
In general, simpler systems are easier to reason about, easier to scale and easier to replace or mock. All
of these properties go a long way towards enabling a quick, effective, response to an attack and are factors
you directly influence in the design of your API.

#### Access Control
When building a complex service you will often find that portions of that service must be protected against
unauthorized access. Defence in depth is an excellent solution to protecting these services as well. In this
case one may opt to expose those services only within your VPC and access them through secured services which
restrict an attacker's ability to interact with those sensitive services directly.

If this sounds like microservices to you that's because, in many ways, this is the exact design paradigm they
leverage to great effect. Consider the following examples from the perspective of an attacker wishing to gain
access to sensitive user information.

##### Example 1
You have a monolithic application which leverages user credentials and an RBAC permissions system to grant access
to specific data within your API. It interacts directly with your database and (probably) has no obvious query
injection opportunities. The API itself is defined by the DB models within your ORM and the mutations that your
API handlers perform between a request being received and it becoming a DB model.

##### Example 2
Your application stack is accessed through an API gateway which is responsible for user authentication and access
control. Access is granted through OAuth access tokens which must be renewed relatively frequently and are rate
limited by your incoming load balancers - setting an upper limit on the maximum number of requests a single
OAuth access token may make. Requests for access tokens are rate limited on a per account basis to prevent a user
from generating more than a reasonable number of access tokens within a given time period as well and requests
to this endpoint are rate limited by request token to prevent abuse. The rate limits for these authentication
services are not returned to the client and the actual rate limits are configured to both exponentially decrease
and work in conjunction with your credential hashing scheme and password requirements to provide a certain level
of security to your users.

The API gateway is capable of being reconfigured on the fly with new rules which allow you to route requests
based on a number of different request parameters to different backends. This allows you to redirect requests
for specific content, from a specific IP or with specific headers to specific servers. You also leverage a
deployment platform which allows you to rapidly deploy new services and have a number of preconfigured microcaching
services ready for deployment to provide load-mitigation for specific types of content.

Once tha API gateway has determined that a requestor is authorized to make a specific request, it passes that
request to one of a number of API providers which are responsible for converting a versioned API request into
RPC calls to your internal services which actually perform the tasks and access the data. These API providers
are responsible for request validation against well defined API schemas which are automatically built from your
API documentation, ensuring that your API implementations match your API deliverables (the documentation).

Finally, your backend RPC servers utilize a structured transport protocol like ProtoBuf and have been extensively
tested to ensure that they perform correctly within their very limited individual feature domains, including under
malformed and malicious data.

### Secure Information Exposure
Depending on the API you are designing, you may need to consider the risks of exposing sensitive information
to an attacker. It is important to consider the risks of side-channel attacks and review the methods used by
attackers to compromise these services. Looking at [Capture the Flags](https://capturetheflag.withgoogle.com/)
is a great way to build an understanding of what attacks are possible and I'd strongly suggest watching
[LiveOverflow](https://www.youtube.com/channel/UClcE-kVhqyiHCcjYwcpfj9w)'s content on YouTube.

The following are some common examples of information exposure which can make an attacker's life easier
and which should be avoided.

 - *Returning non-success status codes for password reset requests* can give an attacker information on valid email
   addresses or usernames within your service. They can then leverage this information in conjunction with public
   credential dumps to lookup potential passwords (because users are terrible and usually use the same password everywhere).
 - *Returning different messages for invalid username and password* can allow an attacker to identify valid usernames
   and apply the same lookup approach to find potential passwords.
 - *Returning rate limit quotas for auth endpoints* can give an attacker the ability to safely circumvent any rate
   limiting on these methods (and thereby avoid raising any alarms).

[CORS]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[Defence in depth]: https://en.wikipedia.org/wiki/Defence_in_depth
[Fail2Ban]: https://www.fail2ban.org/wiki/index.php/Main_Page
[HTTP Compression]: https://en.wikipedia.org/wiki/HTTP_compression
[HTTP Status Codes]: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
[mime-types]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
[url-length-answer]: https://stackoverflow.com/questions/812925/what-is-the-maximum-possible-length-of-a-query-string
[zopfli]: https://github.com/google/zopfli

*[CORS]: Cross-Origin Resource Sharing
*[VPC]: Virtual Private Cloud

[^1]: Figuring out which of these is an advanced encoding scheme and which is a horrible one is left as an exercise for the reader.
[^2]: [Learn more about Man-on-the-Side attacks](http://www.netresec.com/?page=Blog&month=2015-03&post=China%27s-Man-on-the-Side-Attack-on-GitHub)
[^3]: [Learn more about micro-caching](https://www.nginx.com/blog/benefits-of-microcaching-nginx/)
