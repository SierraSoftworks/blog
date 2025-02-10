---
title: Licenses
sidebar: false
comments: false
editLink: false
sitemap:
    changefreq: monthly
    priority: 0.3
---

Sierra Softworks applies a couple of difference licenses to the software we release
depending on its intended audience and use case. We strive to release much of our
software under the very permissive MIT license whenever possible.

<PostList :posts="licenses" />

<script>
import {licenses} from "@temp/licenses"

export default {
    setup() {
        return {
            licenses
        }
    }
}
</script>
