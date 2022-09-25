<script lang="ts">
import { defineComponent } from "vue";
import { useEmotesStore } from "@/stores/emotes";

export default defineComponent({
  data() {
    return {
      loading: true,
    };
  },
  mounted() {
    const { fetchEmotes } = useEmotesStore();

    const { channel } = this.$route.params;

    if (typeof channel === "string") {
      fetchEmotes(channel).then(() => (this.loading = false));
    }
  },
  created: function () {
    document.title = `${this.$route.params.channel} - TChat in wild`;
  },
});
</script>

<template>
  <router-link
    active-class="active-link"
    :to="{
      name: 'emotes',
      params: {
        channel: $route.params.channel,
      },
    }"
    ><h1>{{ $route.params.channel }}</h1></router-link
  >
  <!--  <ChatBox />-->
  <h1 v-if="loading">Loading</h1>
  <RouterView v-else />
</template>

<style scoped>
h1 {
  margin-bottom: 24px;
  text-align: center;
}
</style>
