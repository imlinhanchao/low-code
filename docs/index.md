<script setup>
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  if (typeof window !== 'undefined') {
    // If the path already includes /zh/ or /en/, don't redirect (respect manual selection)
    const path = window.location.pathname
    if (path.startsWith('/zh/') || path.startsWith('/en/')) {
      return
    }

    const lang = window.navigator.language.toLowerCase()
    if (lang.includes('zh')) {
      window.location.replace('/zh/')
    } else {
      window.location.replace('/en/')
    }
  }
})
</script>
