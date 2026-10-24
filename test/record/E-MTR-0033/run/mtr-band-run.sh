#!/bin/sh
# E-MTR-0033's record runner: sh mtr-band-run.sh predict|verdict|stage2-predict|final  (writes mtr-band-<what>.log
# beside the records, refusing to overwrite one; verdict was the first stage, final runs once the second stage's reads
# exist)
R=$(cd "$(dirname "$0")/.." && pwd)
W=$(cd "$R/../../.." && pwd)
case "$1" in
  predict) S="$R/run/mtr-band-predict.ts" ;;
  verdict) S="$R/run/mtr-band-combine.ts" ;;
  final) S="$R/run/mtr-band-combine.ts" ;;
  stage2-predict) S="$R/run/mtr-band-stage2-predict.ts" ;;
  *) echo "usage: mtr-band-run.sh predict|verdict|stage2-predict|final"; exit 2 ;;
esac
L="$R/mtr-band-$1.log"
if [ -e "$L" ]; then echo "refusing to overwrite $L"; exit 3; fi
cd "$W/test" || exit 2
node "$W/node_modules/tsx/dist/cli.mjs" --tsconfig "$W/tsconfig.json" --no-warnings=ExperimentalWarning "$S" > "$L" 2>&1
echo "exit=$?" >> "$L"
