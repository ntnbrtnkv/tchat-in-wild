<script lang="ts">
import { defineComponent } from "vue";
import { useEmotesStore } from "@/stores/emotes";
import FavoriteChannels from "@/components/FavoriteChannels.vue";
import star from "@/assets/icons/star.svg";
import star_filled from "@/assets/icons/star_filled.svg";
import { useFavorite } from "@/stores/favorite";

export default defineComponent({
  components: { FavoriteChannels },
  data() {
    return {
      loading: true,
      channel: "",
    };
  },
  setup() {
    const favs = useFavorite();
    return {
      favs,
    };
  },
  watch: {
    "$route.params.channel"() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    toggleFav() {
      if (this.isFav) {
        this.favs.remove(this.channel);
      } else {
        this.favs.add(this.channel);
      }
    },
    init() {
      this.loading = true;
      const { fetchEmotes } = useEmotesStore();

      const { channel } = this.$route.params;

      if (typeof channel === "string") {
        this.channel = channel;
        fetchEmotes(channel).then(() => (this.loading = false));
      }
    },
  },
  computed: {
    isFav() {
      return this.favs.has(this.channel);
    },
    iconPath() {
      return this.isFav ? star_filled : star;
    },
  },
  created: function () {
    document.title = `${this.$route.params.channel} - TChat in wild`;
  },
});
</script>

<template>
  <FavoriteChannels />
  <nav class="breadcrumb">
    <router-link :to="{ name: 'home' }">Home</router-link>
    <span> / </span>
    <router-link
      active-class="active-link"
      :to="{
        name: 'emotes',
        params: { channel: $route.params.channel },
      }"
    >
      {{ $route.params.channel }}
    </router-link>
    <template v-if="$route.params.emote">
      <span> / </span>
      <span class="current">{{ $route.params.emote }}</span>
    </template>
  </nav>
  <div class="fav-row" v-if="!$route.params.emote">
    <button @click="toggleFav" class="fav-btn">
      <img alt="favorite" :src="iconPath" />
      {{ isFav ? 'Remove channel from favorites' : 'Add channel to favorites' }}
    </button>
  </div>
  <div v-if="loading" class="status">
    <p class="loading-text">Loading emotes for <strong>{{ channel }}</strong>...</p>
  </div>
  <RouterView v-else />
</template>

<style scoped>
.breadcrumb {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.1rem;
}
.breadcrumb a {
  text-decoration: none;
}
.breadcrumb a:hover {
  text-decoration: underline;
}
.breadcrumb span {
  opacity: 0.4;
  margin: 0 4px;
}
.breadcrumb .current {
  opacity: 1;
}
.fav-row {
  text-align: center;
  margin-bottom: 20px;
}
.fav-btn {
  background-color: transparent;
  border: 1px solid var(--color-border-hover);
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  color: var(--color-text);
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.fav-btn:hover {
  background: var(--color-background-soft);
}
.fav-btn img {
  width: 16px;
  height: 16px;
}
.status {
  text-align: center;
  margin-top: 48px;
}
.loading-text {
  opacity: 0.6;
  font-size: 1.1rem;
}
</style>
