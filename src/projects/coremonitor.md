---
title: CoreMonitor
date: 2014-01-05 14:01:00
permalinkPattern: /projects/:slug/
group: Legacy
tags:
    - logitech
    - lcd
    - g19
    - g15
    - keyboard
layout: GitHubProject
repo: sierrasoftworks/coremonitor
download: https://cdn.sierrasoftworks.com/coremonitor/CoreMonitorSetup.exe
---

# CoreMonitor
Easily monitor your system's resource usage using our powerful replacement for the default Logitech G15/G19 resource monitor widget.

<!-- more -->

::: tip
[Download CoreMonitor](https://cdn.sierrasoftworks.com/coremonitor/CoreMonitorSetup.exe)

[View on GitHub](https://github.com/SierraSoftworks/coremonitor)
:::

## Features

### Graphed CPU Usage

CoreMonitor keeps track of each of your processor's cores, logging
their individual load at set intervals. It then generates up to the
second graphs showing usage over the past few seconds - allowing you
to keep track of what your CPU is really doing.

### View Volume Level

Adjusting your system volume can be a pain, especially when you're not
sure whether it's the current song or your volume level that's causing
the problem. CoreMonitor displays a handy volume bar whenever you adjust
your volume, allowing you the get the right volume first time, every time.

### Tweak Options

Everybody likes their information a little different, whether you'd prefer to get
slower updates but see more historical load information, or want the very latest
processor load info - CoreMonitor allows you to choose.

### Notification API

CoreMonitor allows applications without their own Logitech G19 integration
to easily display notifications using either a basic HTTP API, or by sending
structured XML.

## API Documentation

### Get System Information

#### `GET /system/version`
This returns the current CoreMonitor version running on the local system.

```http
GET /system/version HTTP/1.1
Host: localhost:56302
```

::: tip
[Click here to Test](http://localhost:56302/system/version)

**NOTE**: This requires CoreMonitor to be running on your machine to work
:::

#### `GET /system/version/show`
This will display a notification on your G15/G19 showing the current version of CoreMonitor.

```http
GET /system/version/show HTTP/1.1
Host: localhost:56302
```

::: tip
[Click here to Test](http://localhost:56302/system/version/show)

**NOTE**: This requires CoreMonitor to be running on your machine to work
:::

### Show Notifications

#### `GET /notifications/show{?title,text,displayperiod}`
This will show a notification on your G15/G19 display with the provided `title` and `text` for the given display period.

 - `title` - Specifies the title to be displayed on the notification. Should be less than 20 characters long to prevent clipping.
 - `text` - Specifies the text to be displayed on the notification. Should be less than 200 characters long to prevent clipping.
 - `displayperiod` - Specifies the amount of time in milliseconds for which the notification should be displayed.
   If the value `0` is used, then the notification will remain on the display until the user closes it by pressing the *OK* button.

```http
GET /notifications/show?title=Test&text=This%20is%20a%20test&displayperiod=10000 HTTP/1.1
Host: localhost:56302
```

::: tip
[Click here to Test](http://localhost:56302/notifications/show?title=Test&text=This%20is%20a%20test&displayperiod=10000)

This will show a notification for 10 seconds, after which time the notification will disappear.
If you would like to hide it prematurely, you can press either the *Back* or *OK* button.

**NOTE**: This requires CoreMonitor to be running on your machine to work
:::

#### `POST /notifications/show`
This method allows you to show a notification with a custom icon. To trigger the notification you submit a `POST`
request to the `http://localhost:56302/notifications/show` endpoint with an XML `Message` payload.

```http
POST /notifications/show HTTP/1.1
Host: localhost:56302
Content-Type: text/xml

<?xml version="1.0" encoding="utf-8" ?>
<Message>
    <type>Notification</type>
    <title>Title</title>
    <text>Text</text>
    <image>Base64 Image</image>
    <displayperiod>1000</displayperiod>
</Message>
<!--EOM-->
```

If you are providing a custom icon, you should serialize a `JPG` or `PNG` format image using Base64 encoding. The image
itself should be 48x48 pixels in size for best results and using an image will reduce the amount of screen space available
for text.

::: tip
The `<!--EOM-->` component is used to allow multiple notifications to be pushed through the same socket
very quickly without the risk of malformed XML being received by the client. It is not strictly necessary,
especially on newer versions of CoreMonitor, however it is recommended that you keep it to support legacy versions
which may encounter problems otherwise.
:::

### Responses
CoreMonitor will respond with either *success* or *failed* depending on whether or not the given parameters were valid.
If you attempt to access an unknown path (which would usually result in a 404 error) you will be shown an embedded
webpage which details how to use the API.
