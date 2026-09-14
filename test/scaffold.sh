#!/usr/bin/env bash
# The scaffold smoke: non-interactive create → install → codegen →
# typecheck. If the engine's public surface drifts such that a fresh
# publisher cannot stand up, this fails.
set -euo pipefail
cd "$(mktemp -d)"
node "$OLDPWD/index.js" atlas \
  --id atlas --name Atlas \
  --full-name "The Atlas Standards Institute" \
  --dataset spec < /dev/null > /dev/null
cd atlas
test -f profile/publisher.yaml
test -f workers/worker_public/src/index.ts
grep -q '^id: atlas' profile/publisher.yaml
npm install --silent
node scripts/gen_profile.mjs > /dev/null
grep -q '"id": "atlas"' workers/worker_public/src/profile.gen.ts
npx tsc -p workers/worker_public
echo "scaffold smoke: OK"
