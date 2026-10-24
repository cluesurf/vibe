#!/bin/sh
# THE ONE COMMAND for E-RLT-0120's verdict once the droplet run is done: fetch the parts (fetch.sh, refusing while the
# job runs), then rebuild the verdict with the frozen gates and write test/record/E-RLT-0120/rlt120-verdict.log (never
# overwritten). The printout also goes to the package's tmp/combine-rlt120.log.
#
#   sh test/record/E-RLT-0120/run/verdict.sh
W=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$W" || exit 2
sh "$W/test/record/E-RLT-0120/run/fetch.sh" || exit $?
mkdir -p "$W/tmp"
node "$W/node_modules/tsx/dist/cli.mjs" --tsconfig "$W/tsconfig.json" --no-warnings=ExperimentalWarning \
  "$W/test/record/E-RLT-0120/run/combine.ts" --write rlt120-verdict.log >"$W/tmp/combine-rlt120.log" 2>&1
code=$?
echo "exit=$code" >>"$W/tmp/combine-rlt120.log"
head -c 1500 "$W/tmp/combine-rlt120.log"
echo
echo "combine exit $code; verdict log $W/test/record/E-RLT-0120/rlt120-verdict.log"
