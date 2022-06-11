<script setup lang="ts">
import ChatMessage from "@/components/ChatMessage.vue";
</script>

<template>
  <div class="box">
    <ChatMessage text="Svin вижу чубы в чате :)" />
    <ChatMessage text="@mr_dickenss также как и dialteUA dialteRE" />
    <ChatMessage text="KEKW" />
    <ChatMessage text="qwe df fdb Keepo wef ❓" />
    <ChatMessage text="kotoriShake" />
  </div>
</template>

<style scoped>
.box {
  width: 340px;
  min-height: 30px;
  border: 1px solid var(--color-border);
  font-size: var(--size-chat-text);
}
</style>
