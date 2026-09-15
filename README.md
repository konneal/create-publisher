# @konneal/create-publisher

    npm create @konneal/publisher my-sdo

Scaffolds a Konneal publisher deployment: an interview asks for the
publisher's facts (id, name, domains, identity issuer, first dataset),
then writes the whole skeleton. With `--with-site`, it also writes the
frontend. Every generated file is ordinary, reviewable code — the
scaffolder never runs again.

```
npm create @konneal/publisher my-sdo -- --with-site
cd my-sdo
npm install
node scripts/gen_profile.mjs     # YAML → the committed profile module
cd site && npm install && npm run build && cd ..   # the frontend
```

## What gets written

| Path | What it is |
|---|---|
| `profile/*.yaml` | **The publisher's single edit surface** — identity, datasets, corpora, prompts, evals |
| `workers/worker_public/src/index.ts` | The ten-line entry: `setProfile(PROFILE)` then re-export `@konneal/engine` |
| `workers/worker_public/wrangler.toml` | Cloudflare bindings (Vectorize, D1, KV, Workers AI) |
| `scripts/gen_profile.mjs` | The codegen: YAML → `profile.gen.ts` (committed; a drift test keeps both sides honest) |
| `site/` (with `--with-site`) | An Astro+Vue chat over `@konneal/client` — theme tokens, page chrome, conversation state are yours |

## The path to serving

1. **Declare the corpus** in `profile/corpora.yaml`
2. **Ingest**: `pip install git+https://github.com/konneal/engine.git`
   then `python -m ingest.cli parse && …embed && …upsert`
3. **Bootstrap** the Cloudflare resources (wrangler prints the ids)
4. **Deploy**: `npm run deploy`

The README the scaffolder writes states this path in full.

## Non-interactive mode

    npm create @konneal/publisher atlas -- \
      --id atlas --name Atlas \
      --full-name "The Atlas Standards Institute" \
      --domain answers.atlas.example \
      --dataset spec --with-site

All flags: `--id`, `--name`, `--full-name`, `--product`,
`--domain`, `--origin-suffix`, `--issuer`, `--dataset`,
`--with-site`.

## The Konneal packages

| Package | What it is |
|---|---|
| `@konneal/engine` | The serving Worker + the ingest CLI |
| `@konneal/client` | The publisher-site contract: wire types, SSE client, citation chips, typed blocks |
| `@konneal/create-publisher` | This scaffolder |

The reference deployment is [OIML SMART AI](https://ai.oimlsmart.org).
BSD-3-Clause. Part of the Konneal engine ecosystem
([github.com/konneal](https://github.com/konneal)).
