---
title: Fight COVID with F@H
description: |
    Support efforts to combat COVID-19 by contributing to the Folding@Home project using this Azure template.
date: 2020-03-21
permalinkPattern: :year/:month/:day/:slug/
layout: GitHubProject
repo: notheotherben/arm-covid-folding
download: https://raw.githubusercontent.com/notheotherben/arm-covid-folding/main/template.json
tags:
    - operations
    - azure
    - charity
---

# Folding@Home against COVID-19
**Deploy an Azure VM to help Folding@Home**

This is an Azure VM template which deploys a GPU-enabled VM of your choice to help the
[Folding@Home](https://foldingathome.org/) project find ways to combat COVID-19. It is
expected that the default VM (`Standard_NC6_Promo`) will cost about $350 per month to run
(depending on your choice of region etc) which means that on the stock Azure trial benefit
you should be able to get about 2 weeks of runtime before running out of free credits.

::: tip
You can view the Azure template [here](https://raw.githubusercontent.com/notheotherben/arm-covid-folding/main/template.json).
:::

## Instructions
To deploy this template, you'll need to first create a Resource Group and then deploy this template to it.
You'll find instructions for how to do so over here:

 - [Create a Resource Group](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-portal#create-a-resource-group)
 - [Deploy a Template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-portal#deploy-resources-from-custom-template)
    
    **IMPORTANT** When asked which template you wish to deploy, select **Build your own template in the editor** and paste the template below.

::: tip
Once your VM has been deployed, it will install the F@H client and start folding. You can monitor its progress by running `ssh folding@<your VM's IP> tail -f /var/lib/fahclient/log.txt`.
:::

### Parameters
##### Name (`default: covid19folding`)
This is the name of the virtual machine which will be deployed. Feel free to customize this if you want to.

##### Location (`default: [resourceGroup().location]`)
This is the location in which the virtual machine will be deployed. Some locations are cheaper than others, so feel free to change this if it makes sense for you. By default, it will use the location that your resource group is created in.

##### Sku (`default: Standard_NC6_Promo`)
The type of virtual machine which will be provisioned. The `Standard_NC6_Promo` SKU includes an NVIDIA Tesla K80 accelerator card which will greatly speed up your contributions to the F@H project. Other options may have more modern, or a greater number, of accelerator cards. You can find out more [here](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-gpu).

##### Fah_team (`default: 240722`)
The Folding@Home team you wish to contribute towards. By default this is the Azure SRE team (since we're using this template on our personal subscriptions to help out) but feel free to change this to your own if you prefer.

##### Ssh_key
This should be your SSH public key and is used to allow you to SSH into your machine to check on its status at any time. You can get it by running `cat ~/.ssh/id_rsa.pub` on your machine, or using `ssh-keygen` to create a key-pair if you haven't already.

**IMPORTANT** if you want to SSH into your instance, you can do so with the username `folding`.

## Credits
Thank you to [@lupino3](https://github.com/lupino3) and [@nickstenning](https://github.com/nickstenning) for their contributions to building this template.