#!/bin/sh
# Run one part of E-RLT-0119 (arg: axes, plane or generic; resumable, a finished part is never overwritten). The record
# and its log go to test/record/E-RLT-0119/; stderr goes to the package's tmp/rlt119-<part>.err. The package is found
# from this script's own place (test/record/E-RLT-0119/run/), so it runs in any checkout.
#
#   sh test/record/E-RLT-0119/run/run.sh generic
W=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$W" || exit 2
mkdir -p "$W/tmp"
node "$W/node_modules/tsx/dist/cli.mjs" --tsconfig "$W/tsconfig.json" --no-warnings=ExperimentalWarning "$W/test/record/E-RLT-0119/run/run.ts" "$1" > "$W/tmp/rlt119-$1.err" 2>&1
echo "exit=$?" >> "$W/tmp/rlt119-$1.err"
