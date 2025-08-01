---
title: Using Vault with GitHub Actions
description: |
    GitHub Actions has recently introduced support for OIDC tokens within your
    workflows, and this can be paired with Hashicorp Vault to provide a secure
    secrets management solution for your workflow. This is especially valuable
    if you're planning on using Vault to manage short-lived secrets for your
    deployments.
date: 2021-12-20T10:18:00Z

permalinkPattern: :year/:month/:day/:slug/
categories:
    - security
    - github
    - hashicorp
tags:
    - github-actions
    - hashicorp-vault
---

# Using Vault with GitHub Actions
So, you're using GitHub Actions to deploy your project and have tossed some
service principal credentials into your GitHub Actions Secrets to let you
do so. The birds are signing, the sun is shining, an hackers are hacking your
code coverage service...

How confident are you that your service principal credentials aren't
compromised? If you're like me, that number goes to zero very, very quickly.
Rotating them for hundreds of repositories and service principals is far from
a simple task, and I hate having to do complex work - so let's look at a better
solution.

Enter [Hashicorp Vault](https://www.vaultproject.io/), a comprehensive secrets
management platform which (amongst other things) lets you issue short lived
credentials with limited permissions. If configured correctly, this can help
greatly reduce the risk surface area for compromised credentials and minimize
the operator overhead associated with managing them.

This blog post is a top-to-bottom run-through of setting up Hashicorp Vault
and GitHub Actions so that you can easily consume secrets from your GitHub
Actions workflows.

<!-- more -->

## Setting up Hashicorp Vault
The first thing you're going to need to do is set up Hashicorp Vault, there
is a bunch of great documentation on the Vault website showing how to do this,
including architectures for large scale production deployments, however if
you want to get up and running quickly and cheaply, I'd suggest taking a look
at how to run [Vault on Azure Functions](./2021-12-19-vault-on-azure-functions.md).

Once you've got Vault set up and running, you'll need to make sure that it is
accessible over the public internet so that GitHub Actions can talk to it. Make
sure that you're running Vault with TLS enabled, or a trusted TLS reverse proxy
in front of it.

You'll then want to have the Vault CLI installed on your machine and
authenticated with a token that allows you to create and manage both
authentication methods and policies (for what we're going to be doing).

## Auth Backend
GitHub Actions uses OpenID Connect (OIDC) to authenticate itself to third party
services (like Vault) and we're going to use Vault's built-in
[OIDC auth backend](https://www.vaultproject.io/docs/auth/jwt.html). We're
doing this using the command line here, but you can also do so in the Web UI.

```bash
# Enable the OIDC auth backend at the /github-actions path
vault auth enable oidc -path=github-actions

# Configure the OIDC auth backend to trust GitHub Actions tokens
vault write auth/github-actions/config \
    oidc_discovery_url="https://token.actions.githubusercontent.com" \
    bound_issuer="https://token.actions.githubusercontent.com" \
    default_role="github-actions-pr"
```

::: tip
If you're interested in what each of these options means, you can read about
them in the [Vault API documentation](https://www.vaultproject.io/api-docs/auth/jwt#configure).
:::

Okay, so now that we've created and configured the auth backend, we should
be able to validate a token issued by GitHub Actions, however we don't yet
have any roles associated with these tokens and so we won't (yet) be able
to use it within Vault.

## Roles
Roles are Vault's way of associating a given access token with one or more
policies that define what the token can do. In this case, we're going to
create three separate roles, one for Pull Request builds, another for our
official builds, and a third for deployments.

The primary thing we're relying on here is that GitHub Actions will configure
the `sub` (subject) claim based on the context that the workflow is running
in. This allows us to ensure that a role cannot be assumed in the wrong context
(i.e. you don't want someone accessing your production secrets from a PR build).

| Workflow Type | Role | Example Subject Claim |
| ------------- | ---- | --------------------- |
| Pull Request | `github-actions-pr` | `repo:SierraSoftworks/example:pull_request` |
| Build | `github-actions-build` | `repo:SierraSoftworks/example:ref:refs/heads/main` |
| Deployment | `github-actions-deploy` | `repo:SierraSoftworks/example:environment:Production` |

::: tip
You can read more about the `sub` claim that GitHub Actions uses on their
official [documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#examples).
:::

One little trick we're going to do to make life easier for workflow authors is
to allow builds to access the Pull Request role as well, which will mean that
a Pull Request workflow will run just fine on a normal branch, making testing
and re-use a fair bit easier. Since a build would generally be more privileged
than a Pull Request, this doesn't introduce any additional security risks.

Speaking of security risks, token re-use is a thing we want to watch out for
and by default the `aud` (audience) claim is set by GitHub Actions to be the
URL of the repository owner (i.e. `https://github.com/YourUsername`). If we
use this as our trusted audience, then any token issued by GitHub Actions in
the default context will suffice for authentication to Vault. Instead, we're
going to manually specify the audience and set it to the URL of our Vault
server, configuring the `bound_audiences` option to ensure that only these
specific tokens are accepted by Vault. Doing so should help minimize the risk
that a leaked token from another service is re-used to access Vault.

::: code-tabs

@tab Pull Requests

```json{13-16,29}
{
    "role_type": "jwt",
    "allowed_redirect_uris": [
        "https://token.actions.githubusercontent.com"
    ],
    "bound_audiences": [
        "https://vault.sierrasoftworks.com"
    ],
    "user_claim": "repository",
    "bound_claims_type": "glob",
    "bound_claims": {
        "sub": [
            "repo:notheotherben/*:pull_request",
            "repo:notheotherben/*:ref:*",
            "repo:SierraSoftworks/*:pull_request",
            "repo:SierraSoftworks/*:ref:*"
        ]
    },
    "claim_mappings": {
        "actor": "actor",
        "organization": "repository_owner",
        "repository": "repository",
        "workflow": "workflow"
    },
    "token_type": "batch",
    "token_ttl": 300,
    "token_max_ttl": 1800,
    "token_policies": [
        "github-actions-pr"
    ]
}
```

@tab Builds

```json{13-15,28}
{
    "role_type": "jwt",
    "allowed_redirect_uris": [
        "https://token.actions.githubusercontent.com"
    ],
    "bound_audiences": [
        "https://vault.sierrasoftworks.com"
    ],
    "user_claim": "repository",
    "bound_claims_type": "glob",
    "bound_claims": {
        "sub": [
            "repo:notheotherben/*:ref:*",
            "repo:SierraSoftworks/*:ref:refs/heads/main",
            "repo:SierraSoftworks/*:ref:refs/tags/*"
        ]
    },
    "claim_mappings": {
        "actor": "actor",
        "organization": "repository_owner",
        "repository": "repository",
        "workflow": "workflow"
    },
    "token_type": "batch",
    "token_ttl": 300,
    "token_max_ttl": 1800,
    "token_policies": [
        "github-actions-build"
    ]
}
```

@tab Deployments

```json{13-14,22,28}
{
    "role_type": "jwt",
    "allowed_redirect_uris": [
        "https://token.actions.githubusercontent.com"
    ],
    "bound_audiences": [
        "https://vault.sierrasoftworks.com"
    ],
    "user_claim": "repository",
    "bound_claims_type": "glob",
    "bound_claims": {
        "sub": [
            "repo:notheotherben/*:environment:*",
            "repo:SierraSoftworks/*:environment:*"
        ]
    },
    "claim_mappings": {
        "actor": "actor",
        "organization": "repository_owner",
        "repository": "repository",
        "workflow": "workflow",
        "environment": "environment"
    },
    "token_type": "batch",
    "token_ttl": 300,
    "token_max_ttl": 1800,
    "token_policies": [
        "github-actions-deploy"
    ]
}
```

:::

Creating these roles is done using the Vault CLI (since the Vault Web UI doesn't have a fancy wizard for this) and because we're inserting complex
JSON objects (arrays and maps), we're going to need to use `stdin` to pass
the JSON.

::: warning
Remember to modify the role definitions we've shown above to match your
repositories and Vault deployment, unless you're specifically wanting to
grant us access to your secrets ;).
:::

```bash
# Create (or update) a role for your auth method
vault write auth/github-actions/role/$ROLE_NAME -<<EOF
{
    // Your JSON here
}
EOF
```

## Policies
Now that we've got some roles in place, we need to decide what they're able to
access. This is controlled through Vault's
[policies](https://www.vaultproject.io/docs/concepts/policy.html). We are going
to create one policy for each role and use templated policies to give each
repository access to its own namespaced secrets.

Before we get started, we're going to need to figure out what the "mount point"
for our auth method is, since this will be used in our policies to retrieve
metadata.

```bash
# Get your list of auth methods
vault auth list
```

In the output, we're looking for the `Accessor` field for the `github-actions`
auth method, which should look something like `auth_oidc_012345678`. Great,
now let's toss that into some roles.

We're going to be granting access to a KV secret engine mounted at `secrets/`,
using a folder structure which looks like the following:

<FileTree>

 - repos/
   - SierraSoftworks/
     - example/
       - build_secret1 🔒
       - build_secret2 🔒
       - public/
         - pr_secret1 🔒
         - pr_secret2 🔒
       - deploy/
         - Production/
           - deploy_secret1 🔒
           - deploy_secret2 🔒
</FileTree>

Pull Request builds should only be able to access secrets within the `public/`
folder, while regular build should be able to access everything except
`deploy/` and deployments should be able to access secrets within their
corresponding environment's directory within `deploy/`.

::: code-tabs

@tab Pull Requests

```hcl
# role: github-actions-pr
# description: Allow Pull Request builds to access their repository's "public" secrets

path "secrets/data/repos/{{identity.entity.aliases.auth_oidc_012345678.name}}/public/*" {
  capabilities = ["read"]
}
```

@tab Builds

```hcl
# role: github-actions-build
# description: Allow official builds to access everything except deployment secrets

path "secrets/data/repos/{{identity.entity.aliases.auth_oidc_012345678.name}}/*" {
  capabilities = ["read"]
}

path "secrets/data/repos/{{identity.entity.aliases.auth_oidc_012345678.name}}/deploy/*" {
  capabilities = ["deny"]
}
```

@tab Deployments

```hcl
# role: github-actions-deploy
# description: Allow official builds to access everything except deployment secrets

path "secrets/data/repos/{{identity.entity.aliases.auth_oidc_012345678.name}}/*" {
  capabilities = ["read"]
}

path "secrets/data/repos/{{identity.entity.aliases.auth_oidc_012345678.name}}/deploy/*" {
  capabilities = ["deny"]
}

path "secret/data/repos/{{identity.entity.aliases.auth_oidc_012345678.name}}/deploy/{{identity.entity.aliases.auth_oidc_012345678.metadata.environment}}/*" {
  capabilities = ["read"]
}
```

:::

To create these policies, you can either use the Vault Web UI (which works really well for this), or the CLI, which we'll show here. As with roles, we're
going to use the `stdin` stream to pass in the policy definitions.

```bash
vault policy write $POLICY_NAME -<<EOF
# Your Policy definition here
EOF
```

## Consuming Secrets
Awesome, now we've got Vault configured to accept tokens from GitHub Actions,
but how do we use it? Well, let's put together a quick example workflow and
show you how it all ties together.

```yaml
name: Build
on: push

jobs:
  - name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: hashicorp/vault-action@v2.4.0
        with:
          url: https://vault.sierrasoftworks.com
          method: jwt
          role: build # Choose the Vault role you want to use
          jwtGithubAudience: https://vault.sierrasoftworks.com
          secrets: |
            secrets/data/repos/SierraSoftworks/example/build_secret1 token | BUILD_SECRET1_TOKEN

      - name: Build
        run: |
            ./build.sh $BUILD_SECRET1_TOKEN
```

And that's really it, now you're set up and ready to use Vault for basic
secrets management in GitHub Actions. In a future post I'll walk through
setting up the policies and backends needed to deploy services to Azure
using short lived credentials issued by Vault.

### Debugging Issues
If you're anything like me, you'll probably run into at least one problem when setting up the above.
At the time of writing, the `hashicorp/vault-action` doesn't do an awfully good job of explaining
why something goes wrong (short of the HTTP status code returned by Vault), which is a pity because
the response body is FAR more helpful.

Until that is fixed, you might find some success using a variation of the following in your action
to debug the issue.

```yaml
name: Build
on: push

jobs:
  - name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Debug Vault Token
        run: |
            curl -sSL -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=$VAULT_AUDIENCE" | \
            jq "{ jwt: .value, role: \"$VAULT_ROLE\" }" > ./token.json

            echo 'GitHub Actions Token Claims'
            cat ./token.json | jq -r '.jwt | split(".") | .[1] | @base64d' | jq

            echo 'Vault Login Response'
            curl -sSLf -X POST -H "Content-Type: application/json" --data @token.json $VAULT_URL/v1/auth/$VAULT_AUTH_PATH/login

            # Remove the token file when we're done (if we don't fail)
            rm ./token.json
        env:
            VAULT_URL: https://vault.sierasoftworks.com
            VAULT_AUDIENCE: https://vault.sierrasoftworks.com
            VAULT_AUTH_PATH: github-actions
            VAULT_ROLE: build
```

::: warning
The above action will output your Vault token in clear-text in the action's build logs. Depending on your security model, you may wish to avoid
running this on public repositories, or use a role which is intentionally limited within your Vault deployment.
:::
