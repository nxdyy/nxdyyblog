<template>
  <div class="back-to-top-wrapper" :class="{ visible }">
    <md-fab aria-label="回到顶部" @click="scrollToTop">
      <md-icon slot="icon">
        <span class="material-symbols-outlined">keyboard_arrow_up</span>
      </md-icon>
    </md-fab>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const visible = ref(false);
let ticking = false;

function update() {
  visible.value = window.scrollY > 300;
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
    ticking = true;
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>
