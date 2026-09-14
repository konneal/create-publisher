# @konneal/create-publisher

    npm create @konneal/publisher my-sdo

Scaffolds a Konneal publisher deployment: an interview asks for the
publisher's facts (id, name, domains, identity issuer, first dataset),
then writes the whole skeleton — `profile/*.yaml` (the publisher's
single edit surface), the ten-line worker entry that injects the
profile into `@konneal/engine`, the wrangler binding template, the
profile codegen, and a README stating the path from profile to serving.

Every generated file is ordinary, reviewable code; the scaffolder
never runs again. Non-interactive for scripting and CI:

    npm create @konneal/publisher atlas -- --id atlas --name Atlas \
      --full-name "The Atlas Standards Institute" \
      --domain answers.atlas.example --dataset spec

BSD-3-Clause. Part of the Konneal engine ecosystem
(github.com/konneal).

## The site plane

`--with-site` scaffolds `site/` — a minimal Astro+Vue frontend whose entire answer-contract surface (SSE client, markdown renderer, citation chips, typed blocks) comes from `@konneal/client`. What remains is the publisher's own: theme tokens in `src/styles/global.css`, page chrome in `src/pages/index.astro`, and conversation state in `src/components/Chat.vue`. Build with `npm run build` in `site/`; the worker serves `site/dist` as its assets.
