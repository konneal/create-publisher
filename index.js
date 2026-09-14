#!/usr/bin/env node
// @konneal/create-publisher — scaffold a Konneal publisher deployment.
//
//   npm create @konneal/publisher my-sdo
//
// Asks for the publisher's facts, then writes the whole deployment
// skeleton: profile/*.yaml (the publisher's single edit surface), the
// ~10-line worker entry that injects the profile into the engine, the
// Cloudflare wrangler template, the profile codegen, and a README that
// states the path from here to a serving deployment. Every generated
// file is ordinary, reviewable code — the scaffolder never runs again.
import { createInterface } from "node:readline/promises";
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// ── inputs ────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { dir: null, flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out.flags[key] = next;
        i++;
      } else out.flags[key] = true;
    } else out.dir = a;
  }
  return out;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

const interactive = process.stdin.isTTY === true;

async function ask(rl, flags, key, question, { fallback, transform } = {}) {
  if (flags[key] != null && flags[key] !== true) return transform ? transform(String(flags[key])) : String(flags[key]);
  if (!interactive) {
    if (fallback != null) return transform ? transform(String(fallback)) : String(fallback);
    console.error(`error: --${key} is required when stdin is not a terminal`);
    process.exit(1);
  }
  for (;;) {
    const suffix = fallback != null ? ` (${fallback})` : "";
    const a = (await rl.question(`${question}${suffix}: `)).trim();
    const v = a || (fallback != null ? String(fallback) : "");
    if (v) return transform ? transform(v) : v;
    if (fallback == null) console.log("  a value is required");
  }
}

// ── the interview ────────────────────────────────────────────────────

const { dir, flags } = parseArgs(process.argv.slice(2));
if (!dir) {
  console.log("usage: npm create @konneal/publisher <directory> [--id <id> --name <Name> ...]");
  process.exit(1);
}
if (existsSync(dir) && readdirSync(dir).length) {
  console.error(`error: ${dir} exists and is not empty`);
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: interactive });
const p = {};
p.id = await ask(rl, flags, "id", "Publisher id (lowercase, used in corpora and keys)", { transform: slug });
p.name = await ask(rl, flags, "name", "Publisher short name (as citations read it)", { fallback: p.id.toUpperCase() });
p.full_name = await ask(rl, flags, "full-name", "Publisher full name");
p.product_name = await ask(rl, flags, "product", "Deployment product name", { fallback: `${p.name} Answers` });
p.domain = await ask(rl, flags, "domain", "Public domain the service serves", { fallback: `${p.id}.example.org` });
p.origin_suffix = await ask(rl, flags, "origin-suffix", "Domain family for cross-origin panels", { fallback: p.domain.replace(/^[^.]+\./, "") });
p.issuer = await ask(rl, flags, "issuer", "OIDC identity issuer (blank: no auth yet)", { fallback: `https://id.${p.origin_suffix}` });
p.dataset = await ask(rl, flags, "dataset", "First dataset id (the public corpus)", { fallback: "publications", transform: slug });
rl.close();

const vars = {
  ID: p.id,
  NAME: p.name,
  FULL_NAME: p.full_name,
  PRODUCT: p.product_name,
  DOMAIN: p.domain,
  ORIGIN_SUFFIX: p.origin_suffix,
  ISSUER: p.issuer,
  DATASET: p.dataset,
  REFUSAL: `I don't have information on this in the indexed ${p.name} publications.`,
  IDENTITY: `the ${p.product_name} assistant at ${p.domain} — a public service answering questions about ${p.name} publications`,
};

// ── the scaffold ─────────────────────────────────────────────────────

const render = (tplFile) =>
  readFileSync(join(here, "templates", tplFile), "utf8").replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`template var ${k} missing`);
    return vars[k];
  });

const files = {
  "profile/publisher.yaml": "profile/publisher.yaml",
  "profile/datasets.yaml": "profile/datasets.yaml",
  "profile/corpora.yaml": "profile/corpora.yaml",
  "profile/sources.yaml": "profile/sources.yaml",
  "profile/ui.yaml": "profile/ui.yaml",
  "profile/retrieval.yaml": "profile/retrieval.yaml",
  "profile/prompts.yaml": "profile/prompts.yaml",
  "workers/worker_public/src/index.ts": "worker-index.ts",
  "workers/worker_public/wrangler.toml": "wrangler.toml",
  "workers/worker_public/src/prompts.d.ts": "prompts.d.ts",
  "workers/worker_public/tsconfig.json": "tsconfig.json",
  "scripts/gen_profile.mjs": "gen_profile.mjs",
  ".gitignore": "gitignore",
  "README.md": "README.md",
  "package.json": "package.json",
};
for (const [out, tpl] of Object.entries(files)) {
  const path = join(dir, out);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, render(tpl));
}
console.log(`\nscaffolded ${dir} — the publisher profile is profile/*.yaml; everything else is wiring.`);
console.log(`next: cd ${dir} && npm install && node scripts/gen_profile.mjs`);
console.log("then read README.md — the path runs profile → ingest → deploy.\n");
