<template>
  <div class="search-page">
    <div class="search-input-area">
      <md-outlined-text-field
        ref="inputRef"
        :label="'输入关键词搜索文章...'"
        v-model="query"
        @keydown="onKeydown"
      ></md-outlined-text-field>
      <md-filled-button @click="doSearch">
        <span class="material-symbols-outlined" slot="icon">search</span>
        搜索
      </md-filled-button>
    </div>

    <div v-if="searched" class="search-result-count">
      共找到 <strong>{{ results.length }}</strong> 篇相关文章
    </div>

    <div v-if="pageResults.length === 0 && searched" class="search-empty">
      <span class="material-symbols-outlined">search_off</span>
      <p>未找到与"{{ lastQuery }}"相关的结果</p>
    </div>

    <div v-for="item in pageResults" :key="item.url" class="search-result-item">
      <div class="search-result-cover">
        <a :href="item.url">
          <img :src="item.preview" :alt="item.title" loading="lazy" />
        </a>
      </div>
      <div class="search-result-body">
        <h2 class="search-result-title">
          <a :href="item.url">{{ item.title }}</a>
        </h2>
        <div class="search-result-meta">
          <span>
            <span class="material-symbols-outlined">calendar_today</span>
            {{ item.date }}
          </span>
          <span v-if="item.tags && item.tags.length">
            <span class="material-symbols-outlined">label</span>
            {{ item.tags.join(', ') }}
          </span>
        </div>
        <div class="search-result-excerpt" v-html="item.snippet"></div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="search-pagination">
      <button v-if="currentPage > 1" class="pagination-btn" @click="goPage(currentPage - 1)">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <template v-for="i in totalPages" :key="i">
        <button
          v-if="Math.abs(i - currentPage) <= 2 || i === 1 || i === totalPages"
          class="pagination-btn"
          :class="{ active: i === currentPage }"
          @click="goPage(i)"
        >
          {{ i }}
        </button>
        <span
          v-else-if="Math.abs(i - currentPage) === 3"
          style="padding: 0 4px; color: var(--md-sys-color-outline)"
          >…</span
        >
      </template>
      <button v-if="currentPage < totalPages" class="pagination-btn" @click="goPage(currentPage + 1)">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const PAGE_SIZE = 10;

const query = ref('');
const lastQuery = ref('');
const results = ref([]);
const searched = ref(false);
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(results.value.length / PAGE_SIZE));
const pageResults = computed(() =>
  results.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
);

let searchData = null;

function esc(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
}

function highlight(text, q) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) {
    return esc(text.slice(0, 120)) + (text.length > 120 ? '...' : '');
  }
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + q.length + 60);
  return (
    (start > 0 ? '...' : '') +
    esc(text.slice(start, idx)) +
    '<em>' + esc(text.slice(idx, idx + q.length)) + '</em>' +
    esc(text.slice(idx + q.length, end)) +
    (end < text.length ? '...' : '')
  );
}

function pickPreview(title, previews) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
  return '/imgs/preview/' + previews[Math.abs(hash) % previews.length];
}

async function loadSearchData() {
  if (searchData) return searchData;
  const res = await fetch('/search.json');
  searchData = await res.json();
  return searchData;
}

async function doSearch() {
  const q = query.value.trim();
  if (!q) return;
  lastQuery.value = q;
  currentPage.value = 1;

  const newUrl = window.location.pathname + '?s=' + encodeURIComponent(q);
  history.replaceState(null, '', newUrl);

  const data = await loadSearchData();
  const lower = q.toLowerCase();
  results.value = data
    .filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.text.toLowerCase().includes(lower) ||
        (item.tags || []).join(',').toLowerCase().includes(lower)
    )
    .map((item) => ({
      ...item,
      preview: pickPreview(item.title, ['preview1.webp', 'preview2.webp', 'preview3.webp', 'preview4.webp']),
      snippet: highlight(item.text, q),
    }));
  searched.value = true;
}

function goPage(i) {
  currentPage.value = i;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function onKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    doSearch();
  }
}

onMounted(() => {
  const init = new URLSearchParams(window.location.search).get('s') || '';
  if (init) {
    query.value = init;
    doSearch();
  }
});
</script>
