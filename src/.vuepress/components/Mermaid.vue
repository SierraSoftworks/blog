<template>
  <figure>
    <div class="mermaid-diagram" v-html="rendered"></div>
    <figcaption>{{ caption }}</figcaption>
  </figure>
</template>

<script lang="ts">
import { defineComponent, ref, toRef, watch } from 'vue'
import mermaid from "mermaid"

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  flowchart: {
    useMaxWidth: true
  },
  sequence: {
    showSequenceNumbers: true
  }
})

export default defineComponent({
  props: {
    value: String,
    caption: String
  },
  setup(props) {
    const id = Math.floor(Math.random() * 1e6)
    const value = toRef(props, "value")
    const caption = toRef(props, "caption")
    const rendered = ref("")
    watch(value, newValue => {
      if (!newValue) {
        return
      }

      mermaid.render(`mermaid-${id}`, newValue).then(svg => {
        rendered.value = svg.svg
      }).catch(err => {
        console.error(err)
        throw new Error("Mermaid cannot be used in SSR mode, ensure that it is wrapped in <ClientOnly> tags.")
      })
    }, {
      immediate: true
    })

    return {
      caption,
      rendered,
    }
  },
})
</script>

<style scoped>
.mermaid-diagram {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

figcaption {
  text-align: center;
  font-size: 0.9rem;
  font-style: italic;
}
</style>
