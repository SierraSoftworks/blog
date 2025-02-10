---
title: Archive
permalink: /archive/
sidebar: false
editLink: false
sitemap:
    changefreq: daily
    priority: 0.7
---

<input class="search-box" type="text" v-model="search" placeholder="Search...">

<div v-for="year in years">

<h3 class="year-title">{{ year.year }}</h3>

<PostList :posts="year.posts" />

</div>

<script lang="ts">
import {onMounted, ref, reactive, computed} from 'vue'
import {posts} from '@temp/posts'

export default {
    setup() {
        const search = ref(null)

        const years = computed(() => {
            const foundPosts = posts.filter(post => !search.value
                || post.frontmatter.title.toLowerCase().includes(search.value.toLowerCase())
                || (post.frontmatter.categories || []).some(category => category.includes(search.value.toLowerCase()))
                || (post.frontmatter.tags || []).some(tag => tag.includes(search.value.toLowerCase())))

            const yearsLookup = foundPosts.reduce((years, post) => {
                const year = new Date(post.frontmatter.date).getFullYear()

                years[year] = years[year] || []
                years[year].push(post)

                return years
            }, {})

            const yearsList = Object.keys(yearsLookup).map(year => ({
                year,
                posts: yearsLookup[year]
            }))

            yearsList.sort((a, b) => b.year - a.year)

            return yearsList
        })

        return {
            search,
            years
        }
    }
}
</script>

<style>
    input.search-box {
        width: 100%;
        border: none;
        border-bottom: 2px solid rgba(180, 180, 180, 0.3);
        padding: 1rem;
        font-size: 1.5rem;

        transition: border-bottom 0.2s ease-in-out;
        color: var(--c-text);
        background-color: transparent;
    }

    input.search-box:hover {
        border-bottom: 2px solid rgba(180, 180, 180, 0.5);
    }

    input.search-box:focus {
        border-bottom: 2px solid var(--c-brand);
        outline: none;
    }

    .year-title {
        font-weight: lighter;
        margin-top: 3rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(180, 180, 180, 0.3);
        color: var(--c-brand-light);
    }
</style>
