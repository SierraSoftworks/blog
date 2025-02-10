---
title: ExpressGate
date: 2010-07-23 14:01:00
permalinkPattern: /projects/:slug/
group: Legacy
tags:
    - development
    - linux
    - splashtop

# cspell:ignore postcount
---

# ExpressGate
Since there seems to be quite a bit of confusion surrounding the process of hacking the Asus ExpressGate system to change
resolutions I am gonna try my best to clarify some of it for you.
I recently purchased an Asus P6X58D Premium which comes with ExpressGate (SplashTop) embedded on it. However since the maximum
resolution is limited to 1280x1024 I decided to do a bit of work and fix that.

I have since created a bash script and numerous applications to aid anyone looking to do their own bit of modding on ExpressGate.

<!-- more -->

## Preparation

::: danger
Please read the [Terms and Conditions](/licences/MIT) before attempting any of the instructions presented herein.

I accept no liability for any damage caused by any means nor through the action, or inaction of those involved.

Should any of the following instructions cause your computer, your SplashTop/ExpressGate installation to either cease functioning,
start giving random errors or tearing up toilet paper in your living room; you are on your own.

Right, now that we have dispensed with the legalities of everything (and covering my arse) lets get started.
:::

### Getting the DFI File

Needless to say it isn't the easiest job in the world, firstly you have to get hold of the correct update, the one on
the Asus support website for my motherboard is unfortunately not the correct one.
You can find the correct ones by browsing the Asus FTP servers [here](ftp://ftp.asus.com.tw/pub/ASUS/misc/utils/), you
will want to look for the "ExpressGateSSD_****.zip" files and download the latest one (you can check the date that it was uploaded).
At the time of writing the latest one was [ExpressGateSSD_V14108.zip](ftp://ftp.asus.com.tw/pub/ASUS/misc/utils/ExpressGateSSD_V14108.zip)

Download the file and inside it you will find a DFI file, this is the image that is used by the ExpressGate updater for
flashing the new version to your motherboard's SSD. In order to modify ExpressGate you will need to edit this file.

### Getting a Linux Distro

If you are at this stage you most probably know that ExpressGate (SplashTop) is in fact a cut down version of Linux,
this means that in order to modify it you are almost certainly going to need Linux, so I recommend getting one.
Ubuntu is probably one of the most easy to use distros and can be downloaded from [here](http://www.ubuntu.com).

### Getting the Required Packages

Some packages are required before you can start working with the DFI file you just downloaded.

#### zlib
ZLib is required to compile the squashfs-tools files, without it the build will fail.
Be sure the get the dev version, it has the `zlib.h` file that `squashfs-tools` needs.

```bash
sudo apt-get install zlib1g-dev
```

#### squashfs-tools
SquashFS is a tool used to create "squashed" file systems. Essentially they are like compressed images of certain files and folders.
All the SQX files that are used by SplashTop are created using SquashFS (and opened using it too)

Go to [http://squashfs.sourceforge.net](http://squashfs.sourceforge.net) and grab the 3.4 download.
Open it up and drop the contained folder (**squashfs3.4**) onto your desktop.
Open a terminal window up and type (It may ask you for your password)

```bash
cd Desktop/
cd squashfs3.4/
cd squashfs-tools/
make
sudo cp ./mksquashfs /bin/mksquashfs
sudo cp ./unsquashfs /bin/unsquashfs
```

When that is done you should be able to make and decompress the SQX files which comprise the SplashTop system.

::: warning
Note that version 3.4 of squashfs-tools is required for compatibility with the SplashTop kernel.
:::

### Extracting the DFI

Next up comes the hard part, extracting the DFI image and getting to the SQX files.
I have made a script which makes the process a LOT easier, just download this file and save it to your desktop.
Then extract the contained files to your desktop

 - DFI.sh
 - DVM-Version.exe
 - DVM-Header.exe

When that file is created copy the DFI file that you downloaded from the Asus website onto your desktop and name it Original.DFI
Open up a new terminal window and type the following:

```bash
cd Desktop/
sudo bash DFI.sh Original.DFI
```

The first thing that the script will do is ask you if you want to decompress any of the original SQX files. Just press "n"
since doing so will require you to update the version file.
Next the script will ask you if you want to keep a copy of the image. This will allow anyone looking to make a bootable USB
stick using SplashTop to use the image that the script creates before it is compressed into a DFI.
Unless you are looking to make a bootable USB stick I recommend you press "**n**".

The script will go about mounting the DFI file, it will eventually say:

> Current Directory: /home/Splashtop/extracted-image

This means that it has finished extracting the DFI and you can start editing it. **Start off slow**, you don't want to
mess anything up on your first time round.

We'll start with applying the resolution patch, click on Places &rarr; Computer at the top of the screen.
Double click on **Filesystem** and then on **home**
This should bring you to a folder which has your username and Splashtop, double click on **Splashtop**
Inside the next folder you should see two other folders, *image* and *extracted-image*
You are going to want to work with the **extracted-image** folder as it is much easier

Now I'm going to assume you have an Asus motherboard for this next part, since only Asus boards ship with the SSD required for the install process.
You are going to need to work out the model name that SplashTop uses to find settings for your motherboard. Its quite a simple process, here is how it goes:
Take your motherboard's name (In my case a P6X58D Premium)
Replace all the spaces in the name with '`_`'s (`P6X58D_Premium`)
What you end up with is (most likely) the name that SplashTop has for your motherboard.
If you aren't sure then it might be best to create an image with the [va-term.sqx][va-term.sqx] file and run SplashTop, start the terminal
and type "**dmidecode -s system-product-name**" which will give you the name it uses (remember to replace all spaces with underscores '`_`').

### Dynamic Editing of SSD Contents

On the Phoronix Forums, **idone** claims to have had success with editing files on the onboard SSD without having to reflash the DFI image.
He has done so by closing the ExpressGateUpdater tool (using the `taskkill /f` command in Windows) after it has completed backing up user data.
This results in it activating, but not deactivating, the SSD and therefore leaving it mountable by other tools. This appears to work perfectly,
and I can confirm that the method works successfully.

The demonstration script he provided is as follows:

```dos
START "C:\Program Files (x86)\Express Gate\Express Gate Updater\ExpressGateUpdater.exe"
ping 127.0.0.1 -n 5 > nul
taskkill /im ExpressGateUpdater.exe /f
```

## Enabling your Resolution

### Method 1 - va-customres

There are two main ways to go about doing this. The first is to create a file that tells ExpressGate that your computer supports
more resolutions than it initially was set to allow.
This method usually meets with mixed results. It appears that it works better on ExpressGate Lite installations (HDD ones).

Open the `extracted-image` folder and create a new folder in there called `va-customres`
Inside that folder you will need to create another folder called `etc`
Inside `etc` create another folder called `models.d`
Inside `models.d` create a folder with the name of your motherboard (`P6X58D_Premium` in my case)
Now inside that folder create a file called `99-custom` and open it with *gedit* (Or just double click it)
Put the following inside the *99-custom* file and then save it:

```bash
export DI_HAVE_RES_DDC='yes'
export DI_HAVE_RES_LIST='640x480x24x60,800x600x24x60,1024x768x24x60,
1280x800x24x60,1280x1024x24x60,1366x768x24x60,1440x900x24x60,1440x1050x24x60,
1600x1200x24x60,1680x1050x24x60,1920x1080x24x60,1920x1200x24x60'
```

::: tip
The `DI_HAVE_RES_LIST` value is all on a single line and is made up of the following:
[horizontal resolution] **x** [vertical resolution] **x** [colour depth] **x** [refresh rate].  So for a `1024x768` screen the entry would be `1024x768x24x60`.
:::

::: warning
Note that all entries are separated by commas and there should be no newlines between any of the resolutions.
:::

That's only half the work though, you also need to create the files that let SplashTop know what to do with your patch.
This is relatively easy as the files are present in all of the other folders in the `extracted-image` folder.
If you go back to the `**`extracted-image` folder and open `va-customres` you will see that it is missing two files: `vactl` and `va-version`.

The `va-version` file should have the following in it:

> customres-dvm-0.0.0.0001

The **vactl** file should have the following in it:

```bash
#! /bin/sh

case "$1" in
    init|mount)
        echo "Custom Resolution Patch Initialising..."
        mount -o remount,append:$(pwd)/etc=ro /etc
        ;;
    start)
        echo "Created by Sierra Softworks"
        ;;
esac
```

There is also a 3rd file which you need to add, it is within the `etc` folder under another folder called `dvm-vafiles`

The file's name should be `va-customres-dvm-0.0.0.0001` and its contents should be:

> customres-dvm-0.0.0.0001

Once all of that is done you should be able to go back to the terminal which you ran the script in and type `exit`

After hitting enter you should see it start to run a whole bunch of stuff, that is re-compressing all of the required files and adding them to the image.
The script will then ask you if you want to update the version file, if you have made any changes to the original DFI files or would like
to make sure that your image has not been corrupted, I recommend pressing "`y`".

::: tip
The old method for bypassing the MD5 check was to remove all of the file information from the version file. This would then prevent SplashTop
from checking to see if any of the files were modified. The method that this script uses (thanks to `DVM-Version.exe`) is to generate a new version
file which has updated checksums and file information, this not only allows the modified files to pass the MD5 check but also allows SplashTop to
check your modified files for consistency. This is a considerable bonus with regards to stability and system security as instead of disabling this
security feature it just updates the files to support it.
:::

Once "`Complete`" appears you should have a shiny new `UpdatedDFI.DFI` file on your desktop. Seriously, if this thing isn't sparkling
then there is something wrong (jokes).

As a double check, make sure that the DFI file is about **303MB** in size, any drastic difference (400MB) may be an indication that the
version of `squashfs-tools` you are using is incorrect.
The checksum check may also fail if your version of `squashfs-tools` is too old or too new and you haven't modified any original files
(You can still add your own).
Also remember, although the DFI may pass checksum validation on the updater it might still fail to boot due to any number of problems,
keep fiddling around and hopefully you will eventually figure it out.

Copy the new DFI to a memory stick or onto your windows computer which has the ExpressGate SSD on it.
You will then need to run the ExpressGate updater which you should have got with the DFI image.
If you didn't then you can download it [here][updater]
Run the updater and select the UpdatedDFI.DFI that you have just made, it may warn you that the version you are using is
the same as the version on your motherboard, just click `Yes`
Once the update process is finished you should have a lovely new ExpressGate running at a resolution of your choice.

You may find that the Express Gate Updater fails with your new image saying "`md5 check failed!`" if that does happen you can try
using [my patch][patch] for the ExpressGate Update tool.
This patch will prevent the Express Gate updater from failing if the MD5 Checksum is incorrect.
Simply place the downloaded [Patch.exe][patch] file in your ExpressGate Updater's install directory
( `C:\Program Files\Express Gate\ Express Gate Updater\` ) and run [Patch.exe][patch]
and click on Launch. Once the Express Gate Updater starts press `Ctrl+D` to disable the MD5 check. The application should
now allow you to flash your DFI image without any problems.

### Method 2 - Terminal Commands

::: warning
It appears that some EeePC laptops do not have the selection screen for resolutions. In this case you can try Method 3 however it is
(as yet) untested and may be likely to fail.
:::

This method requires that you have added the [va-term.sqx][va-term.sqx] file to your extracted image, and then updated and flashed your new image.
Start ExpressGate and click on the Term icon in your launch bar.
A terminal should appear; this is where we are going to do all the modifications that are necessary to change your resolution.

In the terminal type the following commands:

```bash
export DI_HAVE_RES_DDC='yes'
export DI_HAVE_RES_LIST='1024x768x24x60,1280x1024x24x60,<your res>x24x60'
python /usr/lib/dvm-config/runRes.py
```

Once you have run the last command a window should appear with a box for selecting your resolution. Select the resolution you would like to use and then click OK.
ExpressGate should warn you that it needs to restart, click OK and when it is done you should see your updated resolution.

If something goes wrong and ExpressGate fails to start after this change simply re-flash the DFI you created earlier.

### Method 3 - Certain EeePCs
Some EeePCs (The 1001P for example) do not have a resolution setting page. This seems to be a problem with older versions of ExpressGate
which were distributed with these netbooks.
If possible you should upgrade your ExpressGate (anything below version 1.4 is likely not to work). However it seems that when you perform
an upgrade the ExpressGate that you have updated to will result in a corrupt display on boot.
This is due to missing configuration files in the `/etc/models.d` folder for your netbook. In order to solve this problem you should do the following:

First, while still using the version that came with your EeePC add [va-term.sqx][va-term.sqx] to the installation folder (ASUS.SYS).
Then boot up into ExpressGate and launch a terminal. It will probably be a good idea to plug in a memory stick to copy the files that you will need off of your harddrive.
Once the terminal is launched type in the following:

```bash
cp -r /etc/models.d /media/<your memory stick name>/models.d/
```

Wait for it to complete and then exit ExpressGate.

Now you will have to look through the `models.d` directory which has appeared on your memory stick and find the folder that corresponds to your EeePC.
That folder will need to be added to an SQX file, the same way that it is done in [Method 1](#method-1---va-customres) except without using the script.
So create the same folders and files (and add the folder that you copied) and then run this from your terminal:

```bash
mksquashfs va-customres va-customres.sqx
```

The resulting va-customres.sqx file will need to be added to your upgraded ExpressGate **BEFORE** you start it for the first time.
With any luck this will work and your ExpressGate will boot up correctly with the latest version. You can then use [Method 2](#method-2---terminal-commands)
to set your resolution to whatever you desire.

::: warning
This method has not been tested by myself as I do not have an ExpressGate Lite machine. You may also find that your EeePC is
unable to run at the resolution you are attempting to use. Remember that although you may be able to select a higher resolution
in Windows it is usually a trick which scrolls the screen around when you move the mouse. This **CAN NOT** be replicated in SplashTop
and as such the only resolutions that will work are the actual resolutions supported by your screen.
:::

## Additional Information

### General Pointers

 - [0x00F1A6BB, 0x062A79B2](http://xkcd.com/138/)
 - Whenever possible try to avoid modifying original files, rather create a new package which does what you want
 - If you have not modified any of the original files then remove the **version** patch, this will not only make the process work more reliably
   but also keep some of the safeguards against corruption in place
 - If possible do all of the modifications to the image on a) a copy and b) in a virtual machine. I recommend [VMWare Player](www.vmware.com) as it is
   by far the best one out there but feel free to use whichever one you like.
 - The script will allow you to either fabricate new SQX files by creating directories within the *extracted-image* folder or alternatively just drop an
   existing SQX file into the *extracted-image* folder and it will be automatically added to the image.
 - Any SQX files you make should have the "**va-**" prefix, this lets SplashTop know that it should load it once the kernel has finished loading.
   This also means that any folders you add to be converted into SQX files should also have the "**va-**" prefix.
 - You may find that the Express Gate updater fails the MD5SUM check on any image you make, if this does happen to you then just download
   [this patch][patch] which will prevent that from happening.

### Useful Files

 - [DFI Extraction Script][dfi.sh]
 - [ExpressGate Update Tool][updater]
 - [XTerm SQX (Terminal, drop into the extracted-image directory)][va-term.sqx]
 - [ExpressGate Updater Patch][patch]
 - [DeviceVM Version File Update Tool][dvmversion]
 - [DeviceVM Header File Update Tool][dvmheader]
 - [Gervais' DeviceVM IOFS Driver][dvmiofs] - From the Asus ExpressGate tarball. Should allow access to the ExpressGate SSD's file system **to be tested**
 - Weisshund's SplashTop Files (Mirrored from: [http://weisshund.net16.net/splashtop](http://weisshund.net16.net/splashtop) | Last Updated *23/07/2010*)
   - [va-ar-tools.sqx][va-ar-tools.sqx] - The ARchiver, allows you to work with .DEB files from within SplashTop
   - [va-storage.sqx][va-storage.sqx] - An SQX file that provides functions for mounding a windows HDD into the /media folder.
     (**Requires Modifications for your System**)
   - [va-bitchx.sqx][va-bitchx.sqx] - The BitchX IRC Client compiled for SplashTop
   - [va-term.sqx][va-term.sqx_old] - Black background version, recommended for use with BitchX
   - [va-pico.sqx][va-pico.sqx] - The E3 text editor, emulating Pico for SplashTop. Very useful for editing files and scripts during Run-Time.

### Useful Reading Material

 - [www.phoronix.com/forums/showpost.php?p=41262&postcount=1](www.phoronix.com/forums/showpost.php?p=41262&postcount=1)
 - [phoronix.com/forums/showthread.php?t=11610&page=18](phoronix.com/forums/showthread.php?t=11610&page=18)

### What can I do if it didn't work?

Unfortunately there isn't any official support for this kind of stuff. Asus and DeviceVM do not explicitly condone this work and as
such will not provide you with any technical support in the aim of trying to achieve this.
There are however forums that discuss the topic and there are plenty of helpful people there who will be willing to give you a
hand if you have any trouble.
One of the most active ones lies on the [Phoronix Forums](http://phoronix.com/forums/showthread.php?t=11610) where the original
resolution hacking took place.
Feel free to post any problems you have over there and we'll see if we can help you solve them.

### DeviceVM Tools

DVM-Header and DVM-Version are two applications designed to generate the required files used by SplashTop for file consistency
checking and identification.
They allow you to easily change version numbers and md5sums to support modified files.
DVM-Version is designed to generate new version files which can allow SplashTop to either check new files for consistency or allow modified
files to pass the md5 check.
Note that both executables are compiled with Mono, this means that they are capable of running under Linux (With Mono installed)
or on Windows or Mac (I don't know why you'd have a Mac but anyway...)

#### Usage

```
DVM-Header IMAGE OUTPUT [VERSION]
IMAGE    - The IMG file which requires a header prior to being compressed into a DFI
OUTPUT   - The file which the application will generate
VERSION  - [Optional] The version which will be inserted into the generated Header file,
           if not provided the application will prompt the user for one.
```

```
DVM-Version FOLDER OUTPUT [VERSION]
FOLDER   - The folder which contains the files which will be contained in the SplashTop image.
OUTPUT   - The file which the application will generate
VERSION  - [Optional] The version which will be inserted into the generated version file,
           if not provided the application will prompt the user for one.
```

## Change Log

### Version 1.0

 - Created DFI.sh to simplify the process of modifying DFI files.

### Version 1.1

 - Added DVM-Header and DVM-Version applications as well as modifying DFI.sh to support them.
 - Added checking for DVM-Header and DVM-Version files in the root script directory

### Version 1.2

 - Added a second method for changing your resolution for people who have problems with the va-customres method.
 - Added instructions for changing your resolution on specific EeePCs which do not allow it. This is very BETA stuff and has
   not been tested so we'd appreciate any input on the matter.

### Version 1.3

 - DVM-Version updated to v1.1 (Fixes problems with non-booting SplashTops)

### Version 1.4

 - Added some new info surrounding dynamic editing of SSD files

## Credits

I would like to thank the people over at the [Phoronix](http://www.phoronix.com) forums, namely **Kano** and **Drosky**
for their extensive work on hacking ExpressGate, without them sharing their work I would not have been able to perform this hack,
never mind create this guide.
I would also like to thank **SynchronE**, also from the [Phoronix](http://www.phoronix.com) forums for the original
[va-term.sqx][va-term.sqx] which has been modified for this tutorial.

**If I left anyone out please send me an e-mail and I'll gladly put your name up here.**

Best of luck,
**Benjamin Pannell**

[va-term.sqx]: https://cdn.sierrasoftworks.com/expressgate/va-term.sqx "Download va-term.sqx file"
[updater]: https://cdn.sierrasoftworks.com/expressgate/ExpressGateUpdater_Setup_v1.1.1.2.exe "Download ExpressGate Updater setup file"
[patch]: https://cdn.sierrasoftworks.com/expressgate/Patch.7z "Download ExpressGate Updater Patch executable"
[dfi.sh]: https://cdn.sierrasoftworks.com/expressgate/DFI.sh "Download ExpressGate DFI decompiler script"
[dvmversion]: https://cdn.sierrasoftworks.com/expressgate/DVM-Version.exe "Download ExpressGate version file generator"
[dvmheader]: https://cdn.sierrasoftworks.com/expressgate/DVM-Header.exe "Download ExpressGate header file generator"
[dvmiofs]: https://cdn.sierrasoftworks.com/expressgate/Gervais/dvmiofs-asus.sqx "Download the DeviceVM IOFS driver"
[va-ar-tools.sqx]: https://cdn.sierrasoftworks.com/expressgate/weisshund/va-ar-tools.sqx "Download Archive Tools"
[va-storage.sqx]: https://cdn.sierrasoftworks.com/expressgate/weisshund/va-storage.sqx "Download the NTFS storage driver"
[va-bitchx.sqx]: https://cdn.sierrasoftworks.com/expressgate/weisshund/va-BitchX.sqx "Download the BitchX IRC client"
[va-term.sqx_old]: https://cdn.sierrasoftworks.com/expressgate/weisshund/va-term.sqx "Download the original va-term.sqx file"
[va-pico.sqx]: https://cdn.sierrasoftworks.com/expressgate/weisshund/va-pico.sqx "Download Pico, a text editor"
