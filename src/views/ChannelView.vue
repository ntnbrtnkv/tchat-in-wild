<script lang="ts">
import { defineComponent } from "vue";
import ChatBox from "@/components/ChatBox.vue";
import { useEmotesStore } from "@/stores/emotes";
import EmotesBox from "@/components/EmotesBox.vue";

export default defineComponent({
  mounted() {
    const { fetchEmotes } = useEmotesStore();

    const { id } = this.$route.params;

    if (typeof id === "string") {
      fetchEmotes(id);
    }
  },
  created: function () {
    document.title = `${this.$route.params.id} - TChat in wild`;
  },
  components: {
    EmotesBox,
    ChatBox,
  },
});
</script>

<template>
  {{ $route.params.id }}
  <ChatBox />
  <EmotesBox />
</template>
