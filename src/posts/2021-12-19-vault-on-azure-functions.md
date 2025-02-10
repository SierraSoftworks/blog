---
title: Hashicorp Vault on Azure Functions
description: |
    Hashicorp Vault is an awesome platform to use for managing secrets
    across your environment, and being free and open source, it should have
    a pretty low barrier to entry. Unfortunately, setting up Vault can be
    a bit of a mission and running a cluster can be quite costly.

    Let's put an end to that by using Azure Functions to run a Vault server
    for a fraction of a dollar per month.
date: 2021-12-19T19:32:00Z

permalinkPattern: :year/:month/:day/:slug/
categories:
    - security
    - azure
tags:
    - hashicorp-vault
    - azure-functions
---

# Hashicorp Vault on Azure Functions
I've long been a fan of Hashicorp's [Vault](https://www.vaultproject.io/) for
its ability to go far beyond the traditional "key/value" secrets management solution.
Even "advanced" offerings like Azure's KeyVault tend to barely scratch the surface
of what is possible with Hashicorp Vault.

Unfortunately, for all that Vault is phenomenally powerful, it is also a fair bit more
difficult to setup and run than its cloud-native counterparts. Where deploying an
Azure KeyVault only takes a few clicks and runs almost for free, Hashicorp Vault's
suggested configuration relies on you building and maintaining a cluster of virtual
machines, which is a lot of additional work and cost.

While I'm not averse to putting in effort and paying a bit of money for a good service,
I'm also not going to do so if there is an easier solution at hand. This blob post
is a (not so quick) run through of how to run Vault without the overhead of managing
your own cluster, and without needing to spend a small fortune on virtual machines.

<!-- more -->

> Before I dive into the rest of this post, I want to say a BIG thank you to Kelsey
> Hightower for sharing his work on getting Vault running on Google's Cloud Run FaaS
> platform. There were definitely points where, were it not for having seen someone
> do this before, I would have considered throwing in the towel and abandoning this
> project.
>
> If you'd like to read something written by someone with far more experience and
> eloquence than myself, go check out [his repo](https://github.com/kelseyhightower/serverless-vault-with-cloud-run).

## Functions as a Service
Before we dive into Vault, I want to give a brief overview of what modern FaaS offerings
provide. The original "promise" of FaaS was that you would write small pieces of code that
solve specific problems within your broader service, deploy them separately and glue them
together to build the whole. They were the perfect platform on which to build your microservice
horror story, and for teams able to solve their problems in that space, they worked really well.

Modern FaaS offerings have grown up substantially since then, and most of them provide
first class support for running native applications as your "function". Today we're looking
at Azure Functions and it's support for
[custom handlers](https://docs.microsoft.com/en-us/azure/azure-functions/functions-custom-handlers).
At their core, custom handlers are a way to allow any programming language to be used within
the Azure Functions environment by relying on TCP connections as the glue between the Functions
runtime and your code. It also makes for a great way to lift-and-shift complex applications
onto Azure Functions.

Pair this with the ability to use standard HTTP as the interface between the Azure Functions runtime
and your application, and you've got a very low barrier to entry for migrating your application
to Azure Functions.

Now all this sounds great, but why would you be interested in doing the effort required to
setup and run Vault this way? Well, I've run a cluster of VMs to host Vault for several months
(including Consul for storage, and an NGINX reverse proxy for load balancing and fail-over) at
a cost of about $90/month and about 2 days/month worth of maintenance, updates, troubleshooting etc.
Hashicorp's own managed HCP Vault offering is available in a "developer" flavour for some $20/month,
which is cheaper but doesn't offer fail-over or backups (yeesh). If you want backups and fail-over,
you'll need to step up to their "Starter" plan at ~$340/month (YEESH!) which is a fair bit more than
I'm willing to spend to support my ~~addiction~~ hobby.

Contrast that with the $0.65 I've spent running Vault on Azure Functions for the last month, with
none of the maintenance overhead and native support for backups (not to mention the amazing durability
guarantees offered by Azure Storage). To me, that's a no-brainer for anyone who doesn't need the
performance and scalability of a cluster.

## Running Vault on Azure

::: tip
If you want to skip the reading and get straight to the juicy bits, you can head over to the
[GitHub Repo](https://github.com/SierraSoftworks/vault-azfn) and deploy the Terraform template
found there, it should get you up and running in no time.
:::

### Storage
When running Vault, there are a few things you need to take care of. The first, and most important,
is your storage layer, and the second is how you unseal Vault on startup. There are several options
for storage, some of which are supported by Hashicorp themselves, while others are "only" community
supported. If we're running on Azure, the one we're going to be interested in is the Azure
storage backend, which relies on Azure Blob Storage.

While it's now shown in the documentation, it is worth calling out that the Azure storage backend
can be configured using environment variables, which we'll be using to simplify our configuration
later.

```hcl
storage "azure" {
    accountName = "my-storage-account"  # $AZURE_ACCOUNT_NAME
    accountKey  = "abcd1234"            # $AZURE_ACCOUNT_KEY
    container   = "container-efgh5678"  # $AZURE_BLOB_CONTAINER
}
```

### Unsealing
Whenever Vault is started, it needs to be unsealed. This process is usually conducted by an
operator entering several unseal keys either through the web UI or through the Vault CLI. This
works well if your Vault server remains online for extended periods of time, but if you're
running in an environment where your application is restarted frequently (like Azure Functions)
then you'll need a better solution.

The solution comes in the form of Vault's automated unseal functionality, which integrates
with several managed KMS providers. In our case, we'll be using Azure KeyVault to provide this
functionality, and this allows Vault to unseal on startup without operator involvement (assuming
you have granted it access to the KeyVault).

As with the Azure storage backend, you can configure most of these options using environment
variables, which makes it much easier to manage in an Azure Functions environment. The backend
also supports the use of Managed Service Identities (MSI) to access the KeyVault, which helps
reduce the number of credentials we need to maintain and configure for our deployment.

```hcl
seal "azurekeyvault" {
    # $AZURE_TENANT_ID
    tenant_id  = "46646709-b63e-4747-be42-516edeaf1e14"

    # $VAULT_AZUREKEYVAULT_VAULT_NAME
    vault_name = "hc-vault"

    # $VAULT_AZUREKEYVAULT_KEY_NAME
    key_name   = "vault_key"
}
```

## Basic Design
So, knowing what is on offer from Azure Functions and Vault, let's start with a simple design
showing how it would (ideally) be configured and deployed. The main gist of it is that we're
going to have Azure Functions launch Vault, and Vault will use a Managed Service Identity (MSI)
to retrieve its unseal keys from Azure KeyVault. Data storage will be provided by an Azure Storage
account.

```mermaid
# A diagram showing how vault connects to Azure Storage and Key Vault.

graph LR
    User([User]) --> Fn
    Fn[Azure Function] --> App[Vault]
    MSI((MSI)) -.-> App
    Fn -.- MSI -.-> KV
    App -- Data --> DB[(Azure Storage)]
    App -- Unseal Key --> KV[(Azure KeyVault)]
```

### Configuration

#### Vault

```hcl
ui = true

listener "tcp" {
  address     = "[::]:$FUNCTIONS_CUSTOMHANDLER_PORT"

  # We disable TLS mode because Azure Functions
  # takes care of it for us automatically.
  tls_disable = "true"
}

seal "azurekeyvault" {
    tenant_id = "$AZURE_TENANT_ID"
    key_name = "vault-unseal"
}

storage "azure" {
    accountName = "$AZURE_ACCOUNT_NAME"
    accountKey  = "$AZURE_STORAGE_KEY"
    container   = "$AZURE_BLOB_CONTAINER"
}
```

#### Azure Functions

```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": ""
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[2.*, 3.0.0)"
  },
  "customHandler": {
    "enableForwardingHttpRequest": true,
    "description": {
      "defaultExecutablePath": "vault",
      "arguments": [
        "server",
        "-config",
        "./vault.hcl"
      ]
    }
  }
}
```

## A Workable Design
In practice, though, there are a few little things that will get in the way of running
what we've described above, so let's run through them quickly and refine what we've got.

### Dynamic Listening Port
The first hurdle one has to overcome is the fact that Vault does not allow you to use
environment variables in its listener configuration. This means that it is not possible,
without relying on the `-dev` mode (which you **should not** be using in production),
to dynamically set the port that Vault will listen on. This instantly becomes a problem,
since Azure Functions requires your app to listen on the one they provide.

Looking through the Vault source code, it doesn't look like this is something that would
be trivial to work around in the app without making code changes to Vault itself, so
we'll need to find an alternate solution.

In my case, I opted to build a small wrapper application that updates our Vault configuration
file with the correct port number and then launches Vault. If you're interested, you
can take a look at the [code here](https://github.com/SierraSoftworks/vault-azfn).

Anyway, introducing that wrapper means that our new configuration should look something
like the following (using Go's templating language to inject environment variables into the config):

:::: code-group
::: code-group-item vault.hcl.tpl

```hcl{4,9,14-16}
ui = true

listener "tcp" {
  address     = "[::]:{{ env "FUNCTIONS_CUSTOMHANDLER_PORT" }}"
  tls_disable = "true"
}

seal "azurekeyvault" {
    tenant_id = "{{ env "AZURE_TENANT_ID" }}"
    key_name  = "vault-unseal"
}

storage "azure" {
    accountName = "{{ env "AZURE_ACCOUNT_NAME" }}"
    accountKey  = "{{ env "AZURE_STORAGE_KEY" }}"
    container   = "{{ env "AZURE_BLOB_CONTAINER" }}"
}
```

:::

::: code-group-item host.json

```json{15,17}
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": ""
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[2.*, 3.0.0)"
  },
  "customHandler": {
    "enableForwardingHttpRequest": true,
    "description": {
      "defaultExecutablePath": "vault-wrapper",
      "arguments": [
        "./vault",
        "server",
        "-config",
        "./vault.hcl.tpl"
      ]
    }
  }
}
```

:::
::::

### Limiting Concurrency
The next problem you'll run into is that the Azure Storage backend for Vault doesn't
support "high availability". What this broadly means is that you can't have more than
one Vault server running at a time. This would be a major problem were it not for the
fact that Azure Functions gives you the ability to limit concurrency.

Follow the [documentation](https://docs.microsoft.com/en-us/azure/azure-functions/event-driven-scaling#limit-scale-out)
for controlling scale out and you won't need to worry about that specific gremlin.

In this case, I'm using Terraform to deploy the function and enforcing this concurrency
limit involves adding the following to my Azure Function resource.

```hcl{4-6}
resource "azurerm_function_app" "vault" {
    # ...

    site_config {
        app_scale_limit = 1
    }
}
```

With us limiting Vault to a single running instance at any point in time, we need to
tell it to not worry about looking for peers. We do this by disabling clustering in
the `vault.hcl` file.

```hcl
disable_clustering = true
```

### Optimizing for Azure Functions
There are a few last little things we need to configure as well to ensure that Vault
works optimally within our Functions environment, the first of which is disabling `mlock`
support, since it doesn't play particularly nicely with the functions environment. The
second is increasing our request timeout to allow for slow-starts when the function
comes up.

Both of these can be done through the `vault.hcl` configuration file.

```hcl
default_max_request_duration = "90s"
disable_mlock                = true
```

Next, since Azure Functions runs a reverse proxy in front of our function, we
need to tell Vault to trust the `x-forwarded-for` header for any requests which
originate from `127.0.0.1`. This is done in our listener directive within the
`vault.hcl.tpl` file we're using.

```hcl{4}
listener "tcp" {
  address         = "[::]:{{ env "FUNCTIONS_CUSTOMHANDLER_PORT" }}"
  tls_disable = "true"
  x_forwarded_for_authorized_addrs = ["127.0.0.1"]
}
```

Speaking of reverse proxies, each Azure Function has its own domain name at
which it will serve incoming requests. This is usually of the form
`https://myfunctionapp.azurewebsites.net` and we need to tell Vault to report
this as its API server by setting the `VAULT_API_ADDR` environment variable.
If you're using Terraform to provision your function app, this can be done with
the following:

```hcl{6}
resource "azurerm_function_app" "vault" {
    # ...

    app_settings = {
        # ...
        "VAULT_API_ADDR": "https://${azurerm_function_app.vault.default_hostname}",
    }
}
```

## Polishing

### Startup Time
At this point, you should have a functional Vault server running within Azure Functions,
however it can take a bit of time for the function to start when the first request arrives.
To offset this, we ideally want our function app to be running (almost) constantly and while
that is an option if we upgrade from the Consumption plan to a Premium function, that involves
the running cost of a VM which we'd prefer to avoid.

Another cool trick is to use App Insights to run availability checks against your function's
endpoint from several placed worldwide once every few minutes. This will ensure that your
function is regularly started and, thanks to the way Azure Functions works, will usually be
running already when a request comes in.

When setting this up, you'll want to use the following as your Health URL:
`https://vault.sierrasoftworks.com/v1/sys/health?standbycode=200&sealedcode=401&uninitcode=502&drsecondarycode=200&performancestandbycode=200`

This will ensure that you get a good signal whenever there's an issue with your function and
it doesn't require any special configuration for authentication/status codes etc.

### Authentication
If you're using Azure, you might also be interested in being able to authenticate to
Vault using your Azure Active Directory (AD) account. This is extremely helpful for
avoiding the need to maintain tokens or manage separate accounts. Fortunately for me,
the Hashicorp team has some great documentation on
[how to set this up](https://www.vaultproject.io/docs/auth/jwt/oidc_providers#azure-active-directory-aad).

### Integration
Now, clearly Vault is useful, but without integrating it into your workflows it really
is just a fancy way to burn money (at a slower rate thanks to Azure Functions). If
you're interested in seeing how you can use Vault with GitHub Actions to provide limited
access to secrets, have a look at my next blog post on
[Using Vault with GitHub Actions](./2021-12-20-vault-github-actions.md).
