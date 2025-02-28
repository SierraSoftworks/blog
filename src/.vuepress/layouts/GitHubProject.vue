<template>
  <BaseLayout>
    <template #sidebar-bottom>
      <section class="vp-sidebar-group">
        <ul class="vp-sidebar-items vp-sidebar-items-extra">
          <p class="vp-sidebar-item vp-sidebar-heading">Extra Links</p>
          <li v-if="frontmatter.download">
            <a :href="frontmatter.download as string" class="nav-link vp-sidebar-item">
              Download
            </a>
          </li>

          <li v-if="frontmatter.docs">
            <a :href="frontmatter.docs as string" class="nav-link vp-sidebar-item">
              Documentation
            </a>
          </li>

          <li v-if="frontmatter.repo && frontmatter.releases">
            <a :href="releasesUrl as string" class="nav-link vp-sidebar-item">
              View Releases
            </a>
          </li>

          <li v-if="frontmatter.repo">
            <a :href="repoUrl as string" class="nav-link vp-sidebar-item">
              View on GitHub
            </a>
          </li>

          <li v-if="frontmatter.repo">
            <a :href="issuesUrl as string" class="nav-link vp-sidebar-item">
              Report an Issue
            </a>
          </li>
        </ul>
      </section>
    </template>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { usePageFrontmatter } from '@vuepress/client'
import BaseLayout from "@vuepress/theme-default/layouts/Layout.vue"

export default defineComponent({
  name: "GitHubProject",
  components: {
    BaseLayout,
  },
  setup() {
    const frontmatter = usePageFrontmatter()
    const repoUrl = computed(() => `https://github.com/${frontmatter.value.repo}`)
    const releasesUrl = computed(() => `https://github.com/${frontmatter.value.repo}/releases`)
    const issuesUrl = computed(() => `https://github.com/${frontmatter.value.repo}/issues/new`)

    return {
      frontmatter,
      repoUrl,
      releasesUrl,
      issuesUrl
    }
  }
});
</script>

<style>
.vp-sidebar-items-extra>li {
  margin: 0 !important;
}
</style>
