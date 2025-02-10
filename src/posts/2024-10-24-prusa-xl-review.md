---
title: Prusa XL Review
description: |
    I recently had the pleasure of building and using a Prusa XL 3D printer alongside my
    trusty Voron 2.4R2. It's a very different experience, with a very different set of
    trade-offs, for a very different price-point. Since I haven't found many reviews
    which dive into the technical details of the Prusa XL, I thought I'd share my thoughts
    and experiences here.

date: 2024-10-24 12:00:00
permalinkPattern: :year/:month/:day/:slug/
categories:
    - 3d-printing
tags:
    - prusa-xl
    - review

# cspell:ignore Nextruders, firstlayer, layerlines, buildplate, qrqGMcbqetU
---

# Prusa XL Review
The Prusa XL is a high-end Core-XY 3D printer from Prusa Research, the technical specifications of
which you can find on their [product page](https://www.prusa3d.com/original-prusa-xl/). I was recently
looking add another printer to my home lab, alongside my trusty Voron 2.4R2, and the Prusa XL was one
of several printers I considered - it is also ultimately the one I chose to purchase based on its unique
set of trade-offs.

<img src="//cdn.sierrasoftworks.com/blog/2024-10-24-prusa-xl-dark.jpg" width="500" alt="An image of the Prusa XL." />

The biggest challenge I faced making this decision was the lack of any deep technical reviews of the Prusa
XL, so I'm going to try and close that gap here by sharing my thoughts and experiences through the lens of
someone who has spent the last couple of years diving into the guts of what makes for a reliable 3D printer.

<!-- more -->

## My Background
I mentioned that I've got a Voron 2.4R2, which I've been using for the last couple of years. As with most
Voron printers, there are many like it but this one is mine. Over the last few years it has evolved from
a relatively stock Formbot kit into a machine where very little of the original printer remains. I've run
everything from CANBUS, to Tap, to Cartographer, to Xol, DragonBurner, Cartographer Touch (and back again)
and moved from a DragonHF hotend to a Slice Mosquito Magnum, I've swapped out motors and drivers, switched to
Sensorless, and designed a wide range of improvements to address pain points.

<Figure src="//cdn.sierrasoftworks.com/blog/2024-10-24-voron-24.jpg" :width="50">
My Voron 2.4R2 in its current configuration, with its Xol toolhead, carbon filters, and Beefy Front Idlers visible.
</Figure>

It's fair to say that I've spent well over a thousand hours tinkering and tuning my printer, and that has
resulted in a machine which, for the most part, I can trust to just print whatever I need, whenever I need it,
quickly and at a quality level I'm happy with. Much of that has been tuning Klipper and my various macros to
ensure that the printer is as reliable as possible.

The result is that when I look at a printer, I'm looking at it through the lens of someone who has spent years
changing a printer to suit their exact needs: I see it for the issues I know I'll face as I live with it...which
brings me to the Prusa XL.

## First Impressions

The Prusa XL is unmistakably engineered by people who use 3D printers in anger. Every aspect of it has clearly
been thought out to ensure that it will just work, and work consistently, for a long time. It's also clear that,
unlike some of the more mainstream consumer printers which have made their way into the market, the Prusa XL is
designed to facilitate easy and open maintenance: it reminds me of an old tractor in that respect. There's no
sign that you'll need to purchase a replacement gantry assembly if things fail - instead almost everything is either
metal, 3D printable, or relatively easy to source (modulo the electronics).

<Figure src="//cdn.sierrasoftworks.com/blog/2024-10-24-prusa-xl-buildplate.jpg" :width="50">
The Prusa XL is exquisitely designed and built, bringing a smile to my face every time I see it (especially in the dark).
</Figure>

In some respects, it's a bit like a cross-over between the best parts of a Voron (it's yours, you're not just leasing it)
and the best parts of an iPhone (it just works, out of the box, with no fuss). The former is why I dismissed BambuLab and
Creality's printers, and the latter is why I dismissed options like the Siboor Trident or the RatRig V-Core 4.

Prusa's software ecosystem follows a similar pattern: PrusaSlicer forms the backbone upon which most of our slicers
are derived (BambuSlicer/OrcaSlicer) and Prusa Research has consistently contributed open source improvements which
have elevated the quality of 3D printing for everyone - however when comparing PrusaLink (the software running on the
printer) and PrusaConnect (their cloud management service) against something like Klipper and Mainsail; I can't help
but feel like the experience is a long way from the cutting edge (especially when it comes to things like remote camera
monitoring, or the integration of additional I/O devices). If Klipper is a Linux server, then PrusaLink is an iPhone -
it works well but it's intrinsically limited in terms of what you can do. For most people that's not a bad thing.

### The Official Enclosure
Another impression also resonates: this is a printer designed for PLA and PETG. Out of the (substantial) box,
it has no enclosure. When assembled, you'll also quickly find that there is extensive ventilation (including room
for what could be 5x80mm fans on the back of the printer).

Should you opt to buy the (very expensive) Official XL Enclosure, you'll find that although beautifully engineered
and visually striking for all the same reasons that the XL itself is, does little to address the ventilation issue,
leaving enough gaps that it likely approximates me leaving one of my Voron's doors open.

Again, for many this won't be an issue - the enclosure will do a great job of preventing drafts and for filaments like
ASA or PC-CF, you're likely to be fine. However, for someone like me who has made made a point of ensuring that I can
print ABS with minimal VOC emissions, it's a sizeable gap in capabilities.

Another let-down is the lack of software temperature control for the enclosure. The XL's logic board includes ports for
additional thermal sensors and the Official Enclosure seems like the perfect place to leverage that capability for
filaments which benefit from a certain ambient temperature (on my Voron a chamber thermistor allows me to automate pre-heating
and ensure that ABS prints only start when the chamber reaches 45&deg;C). Instead, you're provided with a
simple humidity and temperature sensor which provides visual indication of the current conditions but no ability for
the printer itself to measure or report on them.

<YouTube id="yj6-X8MQKOo" :width="640" :height="400" />

There are of course other enclosures for the Prusa XL, some of which attempt to mitigate these issues - though in my
case I opted to go with the Official XL Enclosure because I frankly think it looks better than the alternatives, and I
appreciate the tight integration with the printer's firmware. If the XL was based on Klipper and I had the freedom to
build my own integrations, I'm sure the story would be very different.

### The Nextruder(s)
Depending on your configuration, you'll find yourself with one or more Nextruders (a beautifully integrated toolhead
for the XL which includes a custom planetary extruder, a filament sensor, LED nozzle and status lights, and a load cell
for contact bed levelling - all in a single, well integrated, package). My immediate impression upon installing these
was how well engineered they are. I've run CANBUS on my Voron 2.4 for a while now, and even with a CNLINKO connector
and multiple pre-prepared toolheads, the process of adding or removing a toolhead takes at least 15 minutes and requires
a lot of careful validation to ensure that everything is working correctly. With the Nextruder, the physical installation
takes a handful of intuitive steps, calibration is easy and robust, and I can see how replacing a toolhead in anger would
be a quick and painless process. Again, it's clear that this is a printer designed by people who use 3D printers in anger.

Another less obvious, but equally appreciated, aspect of the Nextruder is that the fans are extremely silent and all have
tachometers to report RPM. It's a small thing, but fan failures do happen and while a part cooling fan failure is likely
to only impact your print, a hotend fan failure can quickly turn into a disaster. Having the printer monitor the RPM of
every fan means it can detect fan failures and stalls proactively, and prevent the situation from getting any worse.

This level of care extends to the automated crash detection, which leverages the force sensor and motor-driver StallGuard
to automatically detect nozzle and toolhead crashes, something which I have wished for in Klipper for years. It's these
little things which make me far more comfortable leaving the printer running without supervision - letting me focus on
other things while the printer does its job.

### The Firmware Experience
While we're on the topic of things the printer does to keep itself safe, I think it's worth talking about the firmware
and design decisions taken by the Prusa team. I've spent years tweaking and tuning my Voron configurations
(with over 400 commits to my configuration management repository), and watching the Prusa XL do its thing highlights
some brilliant ideas which place an emphasis on safety and reliability over speed and benchmarking.

The first thing you'll notice is the way in which the gantry performs its homing operation. The Prusa XL uses Sensorless
Homing which relies on the motor driver's StallGuard functionality to detect when the gantry has reached the end of its
travel. This is something many Voron users use, but the Prusa XL takes the process a step further to alleviate a range
of failure modes which are all too familiar to Voron users:

 - If the print head doesn't move a significant distance during the initial homing operation, the printer will attempt
   to home on the opposite side of the axis, ensuring that false-positives caused by stiction don't cause the printer
   to home incorrectly.
 - Once the printer has established a baseline zero, it will then perform a series of rapid validation movements testing
   the X and Y zero stops to ensure that they are correctly zeroed. On a Voron this isn't hugely necessary from a precision
   perspective - so long as you're broadly in the right area nobody cares if you are 0.1mm off - but with a tool-changer
   like the XL, this adds a level of accuracy and reliability.

This kind of robust, well thought out, and well integrated experience extends to every aspect of using the printer.
Changing filament is a breeze, common maintenance and print tuning options are easily at hand and work well, the initial
calibration process is intuitive and works perfectly.

Ultimately, the best thing I can say about the firmware is that it's good enough that I don't think about it (and in many
ways it works better than KlipperScreen, which is saying something). Perhaps the most amusing shift in expectations I've
faced centers on power management: as someone who has traditionally used a Raspberry Pi to manage my printer, and who has
had to be careful about how they restart or power cycle it; I spent a good 5 minutes hunting through menus trying to find
how to restart the XL before I realized that the big, red, Reset button takes care of all of that for you. Similarly, the
power switch is a perfectly valid way to turn it off. Again, simple, effective, and reliable.

## Printing with the Prusa XL

<div style="display: flex; flex-direction: row; justify-content: space-between;">
<Figure src="//cdn.sierrasoftworks.com/blog/2024-10-24-prusa-xl-print-firstlayer.jpg" :width="50">
The first layers laid down by the Prusa XL are flawless, with consistent height, good squish, and no adhesion issues
right out of the "box".
</Figure>

<Figure src="//cdn.sierrasoftworks.com/blog/2024-10-24-prusa-xl-print-layerlines.jpg" :width="50">
The layer stacking shown on my Prusa XL is also excellent, with 0.2mm layer lines disappearing in this Prusament Galaxy Black PLA.
</Figure>
</div>

Arguably the most impressive aspect of my time with the Prusa XL so far has been the quality of the prints it produces,
with no tuning, input, or other work required. I've tossed everything from Prusa's own Prusament PLA to bargain basement
PLA and PETG at it with no fine tuning or calibration, and it has produced flawless prints every time. No stringing, no
artifacts, perfect first and top layers, just perfect prints.

This contrasts with my Voron, which required careful tuning before I got anything approaching this level of quality, and
which can be fussy enough that I generally just stick to known good profiles and filaments.

That said, the printing experience is not perfect. The Prusa XL is loud. Not just loud relative to a quiet printer (the
Voron 2.4R2 when fully enclosed and running StealthBurner is fairly quiet when running in another room), but loud enough
that it is disturbing on the other side of the house. For all the work done to ensure the fans are quiet, the XY gantry
movements, even on "Stealth" mode, are loud enough to raise eyebrows.

I had hoped the enclosure would help cut down on this noise, however that has not been the case in its stock
configuration. Part of this likely stems from the significant ventilation provided in the base configuration, and part of
it likely stems from the XY motors being exposed rather than enclosed as is the case for the Voron 2.4R2.

If you're looking for a printer which is quiet enough to run in a shared space, or to run overnight in a room adjacent to
your bedroom, the Prusa XL might not be the right choice. It's also worth noting that this is most noticeable on travel
moves, so tuning maximum acceleration and speed settings for your profile might get the printer to a more suitable level
at the cost of print times.

### Print Speeds
It's worth noting that the Prusa XL is not intrinsically designed to be a fast printer. The Nextruders, for all of their
wonderful engineering, are heavy toolheads whose center of mass resides a long way from the X-rail. Said X-rail is an
MGN-12H attached to a relatively small support structure and moved with 6mm Gates GT2 belts - all very familiar for a
Voron user. Those 6mm belts are longer than you'd find on your typical 350x350mm build volume to accommodate the
tool-changer, and all of that leads to a printer whose maximum acceleration tops out at $5000mm/s^2$ for travel moves
and a pedestrian $4000mm/s^2$ for infill moves in the default "Speed" profiles.

<Figure src="//cdn.sierrasoftworks.com/blog/2024-10-24-prusa-xl-nextruder-top.jpg" :width="50">
A top-down view of the Nextruder, showing the degree to which it extends beyond the X-rail.
</Figure>

Contrast this with the work the Voron community has done to push the limits of the 2.4 and Trident platforms, with
accelerations in the $10,000mm/s^2$ range being easily achievable for travel moves, and AWD configurations being able
to push $20,000mm/s^2$ for infill moves. The net result is that in a basic speed race, the Prusa XL isn't going to win
any prizes - and this is further exacerbated by its careful and ponderous pre-print setup process (which clocks in at
well over 5 minutes before laying down the first layer - in contrast to the mere 1m20s for my Voron to do the same thing).

That said, the Prusa XL isn't designed to compete on raw speed. It's designed to be run in a 5-toolhead configuration,
producing complex engineering parts with a combination of different materials, colours, and low cost supports. The moment
you start to play that game, the Prusa XL really dusts off its gloves and gets to work. There are some great comparative
reviews of print times and defect rate for multi-material prints - comparing the BambuLab AMS to the Prusa XL and
demonstrating that the XL is at least twice as fast, and with a failure rate orders of magnitude lower than the AMS.

<YouTube id="qrqGMcbqetU" :width="640" :height="400" />

By opting to use a tool-changer, the Prusa XL avoids an entire class of potential failure modes which plague other
multi-material configurations, and doesn't require slow or wasteful workarounds to mitigate them. Of course, it does
introduce a new class of failure mode: a failure to correctly align each of the tool-heads with one another can result
in imperfections where the materials meet. Fortunately, the Prusa XL uses a reference pin and a comprehensive automated
calibration routine to address this for you. In practice, the results I got after completing the calibration routine
were perfect, with no visible imperfections or differences in output quality between the different materials.

<Figure src="//cdn.sierrasoftworks.com/blog/2024-10-24-prusa-xl-print-multicolour.jpg" :width="50">
Combining multiple materials in a single print is a breeze, and the resulting prints show no signs of boundary
imperfections or colour artifacts.
</Figure>

I can attest to the fact that on the XL, printing in multiple materials is quick and easy enough that I don't consider it as
a factor in my print planning, instead focusing on what I'd like to design rather than on whether it's worth the extra
time and effort to print it in multiple materials. In practice, the amount of waste material is also significantly
lower than filament changer setups like ERCF/MMU/AMS, with the XL only performing a quick priming purge after each
change (and even this can be skipped if you're using compatible filaments and are willing to purge into the infill),
but given the cost of the printer it's unlikely you're going to be saving money any time soon by doing so.

### Practical Accuracy
The model I generally use for accuracy testing is the [Vector3D Calilantern](https://vector3d.shop/products/calilantern-calibration)
which provides both an accurate assessment of linear errors (scaling) but also skew (rotational transforms)
generated by physical imperfections in the printer's assembly. The Calilantern reports a score in the range $[0..1000]$
with $1000$ representing absolute perfection and $0$ representing $\ge0.25\degree$ of skew and $\ge0.6\%$ scaling error
on all axes. In practice, I've found that scores $\ge500$ are more than good enough for most practical engineering
purposes.

In my case, the Prusa XL spits out a score of $741$ without any tuning or calibration, with an average skew of
$0.09\degree$ and a uniform scaling error of $0.2\%$ which can easily be corrected in the slicer for this filament.
I would consider this an exceptional result. To put that into perspective, it's good enough to hit 0.2mm tolerances
on a 100mm part - as I said, exceptional.

## Is the Prusa XL worth the cost?
Subjectively, yes. The Prusa XL is a beautifully engineered printer which serves the purpose I bought it for perfectly:
a printer which gets out of the way and lets me focus on what I want to design rather than on how the printer works,
while allowing me to add a capability to my home lab which I didn't have before (namely multi-material and multi-colour
printing). That said, a 5-toolhead Prusa XL with the Official Enclosure comes in at roughly the same cost as 6 BambuLab
P1S printers with the AMS combo, all of which are able to print multi-material and multi-colour prints and include an
enclosure with far better sealing and thermal management than the Prusa XL.

As a first printer for a hobbyist, I think the Prusa XL is a poor choice. It's expensive, niche, and for most users it's
unlikely to offer a compelling argument over something far cheaper. For a professional who needs a reliable tool capable
of mixing materials (especially things like PVA supports), I think you'll be hard pressed to find a better option at the
price point. And finally, for the hobbyist who is looking for Adult Lego, I think options like the
[Siboor Trident AWD](https://www.siboor.com/product/siboor-voron-trident/) or
[RatRig V-Core 4](https://v-core4.ratrig.com/) offer a more compelling framework to build and tinker, while still
offering incredible capabilities, at half the price or less.

The Prusa XL fills a very specific niche, but for the right user, I can't think of a reason you won't be very happy with
it sitting in your workshop - I know I am.
