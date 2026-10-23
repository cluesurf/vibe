#!/bin/sh
# Rebuild E-RLT-0119's verdict from its recorded parts (args: --write [name] to save the verdict log as
# test/record/E-RLT-0119/<name>, default rlt119-verdict.log, never overwritten). The printout goes to the package's
# tmp/combine-rlt119.log. The package is found from this script's own place, so it runs in any checkout.
#
#   sh test/record/E-RLT-0119/run/combine.sh --write rlt119-verdict-generic.log
W=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$W" || exit 2
mkdir -p "$W/tmp"
node "$W/node_modules/tsx/dist/cli.mjs" --tsconfig "$W/tsconfig.json" --no-warnings=ExperimentalWarning "$W/test/record/E-RLT-0119/run/combine.ts" "$@" > "$W/tmp/combine-rlt119.log" 2>&1
echo "exit=$?" >> "$W/tmp/combine-rlt119.log"
