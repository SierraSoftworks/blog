---
# cspell:ignore ynab

title: YNAB Automation
description: |
    I've been using GitHub Actions to automate our household budgeting and investment tracking
    for the past few years, so I wanted to share not only how I've done it, but also how you can
    set it up yourself.

date: 2023-11-26T00:00:00.000Z
permalinkPattern: :year/:month/:day/:slug/
categories:
  - finance
  - home-automation
tags:
  - github
  - ynab
---

# YNAB Automation
Over the years I have tried several different budgeting tools, from spreadsheets, to desktop applications,
to one-person-startups, and finally to [YNAB](https://www.ynab.com). They've all had their quirks and limitations,
but in the end YNAB is the one I've hated the least, and with some creative automation, I've been able to
close the deal-breaking gaps in its functionality and happily use it for several years now.

In this post, I'll share how I've set built and hosted my own YNAB automation system, and how you can
easily (literally a few minutes) set up your own.

<!-- more -->

## Why bother with automation?
YNAB is great for budgeting your daily spending and even tracking your lines of credit, but where it really
struggles is with investment accounts, multi-currency support, and the ability to share a subset of your
transactions with a partner for household budgeting purposes. All of these are things that, as someone living
in Europe, with a partner and international investments, I really can't live without.

In an ideal world, this would let me do things like:

 - Specify the number of shares of a given stock I hold, and have YNAB automatically reflect daily changes in
   the value of those shares under a "Tracked" account.
 - Automatically convert transactions in a foreign currency to my local currency, and have YNAB reflect the
   local currency amount (as well as an indication of what the foreign currency amount was) in my budget.
 - Allow me to share specific budget categories with my partner, so that we can budget together for household
   expenses, but keep our personal spending separate.

Since YNAB doesn't support these features, and has indicated that for several of them they have no plans to do
so, I figured I'd take matters into my own hands, dust off their API documentation, and see what I could build.

## Why use GitHub Actions?
Of course, building something is only half the battle, I also need somewhere to host it - ideally somewhere that
is low cost (or free), doesn't require me to manage infrastructure, is easy to setup and maintain, and has great
deployment options. Fortunately, GitHub Actions brings us several nice features which make it a compelling choice
over alternatives like Azure Functions.

1. **Low Cost**

   For personal repositories, GitHub Actions is (mostly) free, and unless you're abusing the platform, you're
   unlikely to hit the limits of that free tier.

1. **No Infrastructure Management**

   Since GitHub Actions is an entirely managed service, you don't need to worry about provisioning, updating, or
   otherwise maintaining the hosting infrastructure for your code.

1. **Native GitOps Workflow**

   Okay, this is definitely cheating, but the easiest GitOps workflow is the one you don't need to build in the
   first place. GitHub Actions are configured and managed entirely through your repository, making for the perfect
   deployment pipeline.

1. **Scheduled Execution**

   And lastly, you can set up cron-like schedules within GitHub Actions to automatically run a task on a regular
   basis without needing to resort to hacky workarounds.

## Simplifying configuration
Another aspect of setting this up is that I didn't want to need to leave YNAB to configure things, so I decided
to use the Account **Notes** field to specify the automation configuration for each account. This lets me easily
configure things like the amount of shares I hold in a given stock, or the categories I'd like to replicate transactions
from, without needing to leave the YNAB website.

For example, if I wanted to configure my "Tracked" account to track 10 shares of a stock, I'd add the following
to the account's **Notes** field. This'll automatically calculate the current value of those shares and convert it
to my local currency, creating a transaction to update the account's balance to match the value of the shares.

```bash
/automate:stocks AAPL=10
```

I could also configure my daily spending account to replicate transactions from the "Groceries" and "Rent" categories
to our household budget by adding the following to its **Notes** field.

```bash
/automate:replicate from_category="Rent" to_category="Ben: Rent" to_budget="Household" to_account="Ben"
/automate:replicate from_category="Groceries" to_category="Ben: Food" to_budget="Household" to_account="Ben"
```

## Setting it up yourself
If you'd like to set this up yourself, all you'll need is a GitHub account, a YNAB account, and a few minutes to
configure the workflow.

First, create a new repository in GitHub. You can call it whatever you like, but I'd recommend something like
`ynab-automation`. You might need to sign up for a GitHub account if you don't already have one.

Next, get your YNAB API token. You can find instructions for doing so [here](https://api.youneedabudget.com/#personal-access-tokens).
You'll want to add this token to your GitHub repository as a build secret called `YNAB_API_KEY`.

::: tip
To add a secret to a GitHub repository, you'll want to go to the repository's **Settings** tab and find the
**Secrets and variables** section on the left-hand menu. Select the **Actions** category and click on the
**New repository secret** button. Enter the name of the secret (in this case `YNAB_API_KEY`) and paste in
the value of your API token.
:::

Then create your GitHub Action by adding a new file called `.github/workflows/automate.yaml` and pasting the following
into it.

```yaml{6,18}
name: YNAB

on:
  schedule:
     # Run the automation every 12 hours
    - cron: '0 */12 * * *'
  workflow_dispatch: {}
  pull_request:
    branches:
      - main

jobs:
  automate-ynab:
    runs-on: ubuntu-latest
    steps:
      - uses: SierraSoftworks/ynab-automation@v2.1
        with:
          budget-id: "00000000-0000-0000-0000-000000000000" # Enter your budget ID here
          api-key: ${{ secrets.YNAB_API_KEY }}
          cache: true
```

You'll need to edit the `budget-id` field to match the ID of your YNAB budget. You can find your budget ID by visiting
[YNAB](https://app.ynab.com) and looking for a UUID in the page URL, it should look something like `a1b2c3d4-5e6f-273a-78fc-836bc6f27250`.

::: tip
You can create a new file from the GitHub web interface by clicking on the **Add file** button in the repository's
file browser, then entering the name of the file you want to create.
:::

Once you've done that and committed your changes, you should see a new **Actions** tab in your repository. If you
click on that, you should see a new workflow called **YNAB** which you can run run manually by clicking on the
**Run workflow** button. It'll also automatically run every 12 hours, but you can change that by editing the
`cron` expression in the workflow file.

### Setting up automatic updates
I regularly make updates to the automation scripts and fix issues as they appear, so you'll want to make sure
that you're using the latest version of the automation script. To do that, you'll need to update the version
number in your workflow file when I release new updates.

Fortunately GitHub has support for automatically taking care of this for you through something called dependabot.
To set it up, you'll want to create a new `.github/dependabot.yml` file and paste the following into it.

```yaml
version: 2
updates:
  - directory: /
    package-ecosystem: github-actions
    schedule:
      interval: weekly
```

This will automatically create a pull request for you whenever I release a new version of the automation script,
and all you'll need to do is merge it to get the latest version.
