---
title: Projects
sidebar: false
comments: false
editLink: false
sitemap:
    changefreq: daily
    priority: 0.7
---

<PostList :posts="projects" />

<script>
import {projects} from "@temp/projects"

export default {
    setup() {
        return {
            projects
        }
    }
}
</script>
