<script setup lang="ts">
// The starter chat: the whole contract surface comes from
// @konneal/client — the SSE ask client, the markdown renderer, the
// citation linkifier, the source chips and typed blocks. This file is
// the publisher's OWN state and layout: replace freely.
import { nextTick, ref } from "vue";
import { askStreamed, renderMarkdown, linkifyCitations, type Citation } from "@konneal/client";
import { SourceChips, UnitBlocks } from "@konneal/client/vue";

const props = defineProps<{ publisherName: string; suggestions: string[] }>();

interface Turn {
  q: string;
  answer: string;
  citations: Citation[];
  blocks: { unit_id: string; type: string; docidentifier: string; payload: Record<string, unknown> }[];
}

const turns = ref<Turn[]>([]);
const busy = ref(false);
const input = ref("");
const openIdx = ref<number | null>(null);
const log = ref<HTMLElement | null>(null);

async function ask(q: string) {
  if (!q.trim() || busy.value) return;
  busy.value = true;
  input.value = "";
  const turn = ref<Turn>({ q, answer: "", citations: [], blocks: [] });
  turns.value.push(turn.value);
  await nextTick();
  log.value?.scrollTo({ top: log.value.scrollHeight });
  const res = await askStreamed(q, {}, {
    onCitations: (c) => { turn.value.citations = c; },
    onToken: (t) => {
      turn.value.answer += t;
      log.value?.scrollTo({ top: log.value.scrollHeight });
    },
    onDone: (_h, _f, blocks) => { turn.value.blocks = (blocks ?? []) as Turn["blocks"]; },
  });
  if (!res.ok && res.errorMessage) turn.value.answer = renderMarkdown(res.errorMessage);
  busy.value = false;
}

const html = (t: Turn) => linkifyCitations(renderMarkdown(t.answer), t.citations, props.publisherName);
</script>

<template>
  <div class="chat">
    <div ref="log" class="log">
      <div v-if="!turns.length" class="empty">
        <p>Ask about {{ publisherName }} publications — every answer cites the clause it comes from.</p>
        <div class="sugs">
          <button v-for="s in props.suggestions" :key="s" type="button" @click="ask(s)">{{ s }}</button>
        </div>
      </div>
      <div v-for="t in turns" :key="t.q" class="turn">
        <p class="q">{{ t.q }}</p>
        <div class="a">
          <div v-if="t.answer" class="assistant-body" v-html="html(t)"></div>
          <p v-else class="thinking">searching the corpus…</p>
          <UnitBlocks v-if="t.blocks.length" :blocks="t.blocks" />
          <SourceChips
            v-if="t.citations.length"
            :cites="t.citations"
            :open-idx="openIdx"
            @toggle="(i: number) => (openIdx = openIdx === i ? null : i)"
          />
        </div>
      </div>
    </div>
    <form class="composer" @submit.prevent="ask(input)">
      <input v-model="input" :placeholder="busy ? 'answering…' : `Ask about ${publisherName} publications`" :disabled="busy" />
      <button type="submit" :disabled="busy || !input.trim()">Ask</button>
    </form>
  </div>
</template>

<style scoped src="../styles/chat.css"></style>
