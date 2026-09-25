# {{PRODUCT}}

A Konneal publisher deployment. Your publications become a
question-answering service: answers cited to the clause, served under
your brand on your domain.

**Authored in Metanorma. Modelled in Primmel. Served by Konneal.**

## What is yours, what is the engine's

Everything of yours lives in `profile/*.yaml` — identity, datasets,
corpora, prompts, thresholds. The worker is a ten-line entry that
injects your profile into `@konneal/engine`; retrieval, the answer
contract, quotas, caching and auth all ship with the engine.

## The path to serving

1. **Declare the corpus** — `profile/corpora.yaml` names your corpus
   repo; run `npm run gen:profile` after every profile edit (the
   generated module is committed; a drift test keeps both sides
   honest).
2. **Ingest** — the engine's ingest CLI (Python) parses your corpus,
   embeds it and upserts the index:
   `pip install git+https://github.com/konneal/engine.git` then
   `python -m ingest.cli parse && python -m ingest.cli embed &&
   python -m ingest.cli upsert`.
3. **Bootstrap the infrastructure** — create the Vectorize index, KV
   namespace and D1 database (`wrangler` will print the ids; fill them
   into `wrangler.toml`).
4. **Serve** — `npm run deploy`.

The reference deployment is [OIML SMART AI](https://ai.oimlsmart.org);
the engine, the site contract package and this scaffolder live in the
[konneal org](https://github.com/konneal) (BSD-3-Clause).

## Sign-in (optional)

The engine ships the complete relying party of the estate identity
service: PKCE authorization-code sign-in, its own session cookie, and —
since engine 0.2.23 — session renewal through the OP's refresh grant
(`offline_access`), which re-judges live standing on every renewal: a
deactivated account loses access at the next page load, and profile or
role changes propagate without a re-login. Nothing for you to build:
declare the three `OIDC_*` variables in `wrangler.toml` (uncomment the
block) and register your redirect URI (`https://<host>/auth/callback`)
with the identity service. The full posture and its rationale:
`oimlsmart/req-identity-adoption.md` in the estate workspace.
