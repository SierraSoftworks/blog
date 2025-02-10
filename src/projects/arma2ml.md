---
title: ArmA 2 Mod Launcher
date: 2014-01-07 14:01:00
permalinkPattern: /projects/:slug/
group: Legacy
tags:
    - gaming
    - arma
layout: GitHubProject
repo: sierrasoftworks/arma2ml
download: https://cdn.sierrasoftworks.com/arma2ml/arma2ml.exe
---

# ArmA 2 Mod Launcher
ArmA 2 Mod Launcher is a command-line based application which enables you to quickly start
ArmA 2 with a custom selection of mods. Its lightweight nature and easy to use command
line syntax makes creating shortcuts for your favourite mod configurations dead easy.

<!-- more -->

 - **Load Your Favourite Mods And Join Your Favourite Server From A Single Shortcut**

    ArmA 2 Mod Launcher allows you to easily construct shortcuts which launch ArmA 2 with
    a predefined mod set, or to join a specific server. This allows you to get into the game
    faster than ever before, or publish server specific startup packages for your players.

 - **Easily select groups of mods using ArmA2ML's [regular expression](http://en.wikipedia.org/wiki/regular_expressions) selection engine.**

    By adopting [regular expressions](http://en.wikipedia.org/wiki/regular_expressions) you are able to select groups of
    similarly named mods using a single selection expression. You can also use exclusion expressions to use negative selection matching
    in cases where wish to select all of your mods except for a few.

 - **Less than 300KB Standalone Executable**

    ArmA 2 Mod Launcher is designed to be as lightweight as possible to ensure minimal disk usage
    and ultra-fast startup times, because we all know how ArmA 2 loves to hog both of those.

::: tip
[Download ArmA 2 Mod Launcher](https://cdn.sierrasoftworks.com/arma2ml/arma2ml.exe)

[View on GitHub](https://github.com/SierraSoftworks/arma2ml)
:::

## Usage

```bash
ArmA2ML.exe -co -beta -mod=@ACE
```

### Command Line Parameters

#### Operation Arrowhead
The **-oa** option will launch ArmA 2: Operation Arrowhead instead of the Standard ArmA 2 executable.

#### Combined Operations
The **-co** option will launch Combined Operations instead of the stock ArmA 2: Operation Arrowhead game. It will not allow
you to launch if you do not have ArmA 2 and Operation Arrowhead installed. If you have problems launching CO with this
launcher (it will say that it cannot find ArmA 2/OA) then please check that all the ArmA 2 and OA registry
keys are present and accounted for.

#### Server
The **-server** parameter will allow you specify a server to join. The value can either be in the form of an IP address
for the server or in the form of IP:Port.
For example `-server="127.0.0.1:1001"` will join a server running on the current machine on port *1001*

*As of version **1.8.2.0** using the -server parameter will cause the application to check what mods are running on the
server and attempt to add them to the list of mods that it loads.*

#### Password
The **-password** parameter will allow you to specify the password for a server you are joining. You can either specify
a value ( `-password="pass"` ) or leave it blank ( `-password` ) which will cause the application to prompt you to enter
the password when you launch the game.

#### Engine
The **-engine** parameter will allow you to select the search engine that the application uses for locating mods.
There are currently 3 available, these are RegEx, Normal and Explicit. RegEx is the default but to specify a different
engine simply add -engine=normal or -engine=explicit to your launch parameters.

In normal mode the application will not make use of RegEx search operators.
This means that a search is carried out using exact names.
Wild cards can be used to select items which match multiple criteria.
For example, while `-mod=@ACE` would select *@ACE, @ACEX, @ACEX_PLA* and *@ACEX_SM* in *RegEx mode* it
will ONLY select *@ACE* in *Normal mode*. In order to select all of them in normal mode you would have
to add `-mod=@ACE\*` instead. Note the wildcard (\*) that is added.

Similarly you can select all mods that end in E using `-mod=\*E`.

It is recommended that you use Normal mode unless you are experienced at using RegEx.
Also, note that Normal mode can also use the `!` operator to exclude certain mods.
For example `-mod=@` -mod=!@ACE** will launch all mods except those which begin with *@ACE*.

A similar result can be achieved using RegEx by entering `-mod=@ -mod=!@ACE`.

Normal mode may provide a small performance increase over RegEx in some cases where there are a large number of mod folders.

Explicit mode will search for only folders who's names exactly match the mod folder name. No Search operators will be processed by the application.

#### Beta
The `-beta` option will automatically launch ArmA 2 in beta mode, provided you have installed the latest beta patch.

#### Debug
The `-debug` option allows you to view a more detailed display of what the application is doing, aiding you in debugging any problems you may have.

#### Yes
The `-y` option will suppress any "Press any key to..." prompts, this is ideal if you are starting from a shortcut as it will not prompt you to check anything.

#### About
The `-about` option will show a message which can guide you through the usage of the application.

#### Silent
The `-silent` option will force the application to not show any information about the selected mods and will also replicate the -y option.

#### Mod
The `-mod` parameter will take a single mod search. These searches are formatted using Regular Expressions.
Some of the things you will want to know when using RegEx are:

 - RegEx will match text in any part of the mod name. So if you enter "C" it will match @ACE; Campaigns etc.
 - If you enter @ACE the application will also match @ACEX; @ACEX_PLA and @ACEX_SM.
   If you would like to only match @ACE then either use Explicit mode or enter ^@ACE$ as your RegEx search argument.
 - The application adds the following functionality to the standard RegEx features.
   If you prefix a mod name with ! it will exclude any mods that match that expression.

So for example, if I want to launch all of my mods except for ones with the word ACE in their names you would run:

```bash
arma2ml -mod=^@ -mod=!ACE
```

#### Option
The `-option` parameter will allow you to pass a parameter to ArmA 2 directly. For example if I want to pass the noSplash parameter I would enter: `-option=noSplash`.
Something to note, parameters which are to be passed to ArmA 2 which include anything but standard text in them
(A-Z a-z 0-9) or spaces should use the following: -option="noSplash". This will allow the application to still accept the parameter.

#### Show Server Details
The `-showserverdetails` switch, when used in conjunction with the `-server` parameter this switch will cause the application
to display information about the server that was specified in the `-server` parameter.
This includes the name of the server, the number of players on the server and the maximum number of players allowed on at any one time.
The application will tell you if the server has a password, whether or not it is a dedicated server and if it is running BattlEye.

#### Wait For Empty Slot
The `-waitforemptyslot` option allows you to tell the application to wait for the server to have an empty player slot
before it attempts to join the server. This is useful on servers which are routinely busy.
You may also specify the amount of time that the application waits between consecutive requests to the server for updated
player numbers by using `-waitforemptyslot=time_to_wait` where the time to wait is measured in milliseconds.
For example: `-waitforemptyslot=10000` will wait for 10 seconds between each check.

The default value is 5 seconds which should work well for most systems.

#### Update
The `-update` option allows you to tell the application to check for updates, and if any are available it can download them for you.
Please note that you are required to have an active internet connection for this to work. Quite simply,
if you can access this website then you should be able to update your application.
The -update option can be used with the -debug option to view advanced debug information for the application's update process.
Note that the application will prompt you to press any key to continue the update process in the second stage.
The third stage cannot continue until you do this.
Also note that in the -help screen the -update option allows a value. This value is used within the application during the
update process and when attempting to update the application you should NOT provide a value here. Doing so will cause the application to ignore the -update option.

#### Web
The `-web` option will take you to this web page, this is useful if you would like to take a look at the most recent changes.

#### No Colour
The `-nocolour` option will disable coloured text in the console for people who prefer the default colours.

**NOTE** This does not disable the colours in the header, those are hard coded into the console rendering code I am using.

#### Copy
The `-copy` option will copy the parameters that are generated for ArmA 2 by the ArmA 2 Mod Launcher to the clipboard.
This allows you to use ArmA 2 Mod Launcher to generate the parameters for Shortcuts.

#### Open Folder
The `-openfolder` option will open the ArmA 2 directory. This is useful for Steam users who may otherwise have to navigate to something
like `C:\Program Files (x86)\Steam\steamapps\common\arma 2\`.

#### Google Analytics
The `-ga` parameter allows you to opt out of Google Analytics tracking. By setting this to off you can prevent the application from letting us know when it crashes.
This information helps us get a better understanding of which applications are working better than others and thus make them more stable and user friendly.
It is also possible to send extra information to us through the use of the -ga=full command; available in 1.7.7 and onwards.
If you to know more about what information Google Analytics collects then please read Google's Analytics Privacy Policy.
Note that while this application will not make use of options from the Google Analytics Browser Opt-out addin you can disable it completely by using the above options.

#### File
The `-file` option allows you to specify a list of mods to launch. Unlike the Parameters File method this will not accept command line arguments.
For example, if you had a file with the following contents:

```
@ACE
@CBA
@CSM
```

Then you would run `ArmA2ML.exe -y -newest -file="path/to/file"` which would use the options that appeared in the file in the place of -mod command line options.
In effect it would be the same as running `ArmA2ML.exe -y -newest -mod @ACE -mod @CBA -mod @CSM`. This makes editing large mod lists a bit easier.

#### Parameters File
This option has no identifier and should be used alone in versions prior to **1.8.1.0**. It allows you to execute all of the command options that appear in a file.
For example, if you had a file with the following contents:

```
-newest
-y
-engine normal
-mod=@ACE*
-mod @CBA
-copy
```

Then you would run `ArmA2ML.exe path/to/file` which would use the options that appeared in the file in the place of command line options.
This allows you to easily transfer presets between multiple different computers easily. It also makes editing mod lists a bit easier.

::: tip
As of version **1.8.1.0** you can now use a parameters file with command line options.
This allows you to run `ArmA2ML.exe <path to file> -debug -ga=off` without any issues.
:::

#### Newest
The `-newest` option will check which version of ArmA 2 is the newest (Beta or Stable) and launch that.

::: tip
If both versions are the same then the Stable version will be launched.
:::

## Other Features
Can detect missing mods which have been added to the search list, the application will show them to the user.
This makes it ideal for mod developers who would like to bundle a shortcut with their mod to launch it as well as its required modules.
