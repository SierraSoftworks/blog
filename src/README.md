---
title: Sierra Softworks Blog
description: |
    The official Sierra Softworks blog, written by Benjamin Pannell.
editLink: false
home: true

heroText: "Welcome"
tagline: "Follow us in building better services and stronger teams at scale."

actions:
    - text: Get Git-Tool
      link: https://git-tool.sierrasoftworks.com
    - text: Read Something
      link: /archive/
      type: secondary

footer: Copyright © Sierra Softworks 2023
sitemap:
    changefreq: daily
    priority: 1.0
---


<div v-if="latestPosts">

## Latest Posts

<PostList :posts="latestPosts" />
</div>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import { posts } from '@temp/posts'

export default defineComponent({
    setup() {
        const latestPosts = ref(posts.slice(0, 3))

        return {
            latestPosts
        }
    }
})
</script>
