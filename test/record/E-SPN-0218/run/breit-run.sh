#!/bin/sh
# E-SPN-0218's verdict log, $1 (a file name under test/record/E-SPN-0218/, default breit-verdict.log); refuses to overwrite.
D=$(cd "$(dirname "$0")/.." && pwd)
W=$(cd "$D/../../.." && pwd)
OUT="$D/${1:-breit-verdict.log}"
if [ -e "$OUT" ]; then echo "refusing to overwrite $OUT"; exit 1; fi
cd "$W" || exit 2
node "$W/node_modules/tsx/dist/cli.mjs" --tsconfig "$W/tsconfig.json" --no-warnings=ExperimentalWarning "$D/run/breit-run.ts" "$OUT"
