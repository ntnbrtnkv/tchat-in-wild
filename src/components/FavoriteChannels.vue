<script lang="ts">
import { defineComponent } from "vue";
import { useFavorite } from "@/stores/favorite";
import EmoteButton from "@/components/EmoteButton.vue";

export default defineComponent({
  name: "FavoriteChannels",
  components: { EmoteButton },
  data() {
    return {
      open: false,
      mode: 0,
    };
  },
  methods: {
    toggle(mode: number) {
      if (!this.open || mode === this.mode) {
        this.open = !this.open;
      }
      this.mode = mode;
    },
  },
  setup() {
    return {
      favs: useFavorite(),
    };
  },
});
</script>

<template>
  <section>
    <button :class="{ hidden: favs.list.length === 0 }" @click="toggle(0)">
      {{ open && mode === 0 ? "Hide" : "Show" }} favorite channels
    </button>
    <button
      :class="{ hidden: favs.emote_list.length === 0 }"
      @click="toggle(1)"
    >
      {{ open && mode === 1 ? "Hide" : "Show" }} favorite emotes
    </button>
  </section>
  <Transition name="slide-up" mode="out-in">
    <ul v-if="open && mode === 0">
      <li v-for="fav in favs.list" :key="fav">
        <router-link
          @click="toggle(0)"
          :to="{ name: 'emotes', params: { channel: fav } }"
        >
          {{ fav }}
        </router-link>
      </li>
    </ul>
  </Transition>
  <Transition name="slide-up" mode="out-in">
    <ul v-if="open && mode === 1">
      <EmoteButton
        v-for="emote in favs.emote_list"
        @click="toggle(1)"
        :key="emote.name"
        :emote="emote"
      />
    </ul>
  </Transition>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.hidden {
  visibility: hidden;
}

ul {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 24px;
  overflow-x: auto;
  z-index: 1;
  padding: 24px;
  border: 1px solid var(--color-text);
  border-radius: 4px;
  background-color: var(--color-background);
}

button {
  background-color: transparent;
  border: 0;
  color: var(--color-text);
  cursor: pointer;
  text-decoration: underline;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
