---
title: Blog Posts
description: Here are some recent blog posts I've written.
sidebar: false
editLink: false
sitemap:
    changefreq: daily
    priority: 0.7
---

<script>
import {defineComponent, onMounted, reactive} from 'vue'
import {useRouter} from "vue-router"

export default {
    setup() {
        const router = useRouter()

        onMounted(() => {
            router.replace({ path: "/archive/" })
        })
    }
}
</script>
