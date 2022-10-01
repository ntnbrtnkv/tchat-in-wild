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
  <h1>
    <router-link
      active-class="active-link"
      :to="{
        name: 'emotes',
        params: {
          channel: $route.params.channel,
        },
      }"
    >
      {{ $route.params.channel }}
    </router-link>
    <button @click="toggleFav" class="fav">
      <img alt="favorite" :src="iconPath" />
    </button>
  </h1>
  <!--  <ChatBox />-->
  <h1 v-if="loading">Loading</h1>
  <RouterView v-else />
</template>

<style scoped>
h1 {
  margin-bottom: 24px;
  text-align: center;
}
.fav {
  background-color: transparent;
  border: 0;
  cursor: pointer;
  position: fixed;
}
</style>
