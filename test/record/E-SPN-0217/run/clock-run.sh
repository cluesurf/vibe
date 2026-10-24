#!/bin/sh
# E-SPN-0217's record runner:
#   sh clock-run.sh part <K> <n> <threads>   one K read of the new point (log clock-c7.5-K<K>.log)
#   sh clock-run.sh verdict                  the verdict from the saved reads (log clock-verdict.log)
# refuses to overwrite a log
R=$(cd "$(dirname "$0")/.." && pwd)
W=$(cd "$R/../../.." && pwd)
case "$1" in
  part) S="$R/run/clock-part.ts"; L="$R/clock-c7.5-K$2.log" ;;
  verdict) S="$R/run/clock-combine.ts"; L="$R/clock-verdict.log" ;;
  *) echo "usage: clock-run.sh part K n threads | verdict"; exit 2 ;;
esac
shift
if [ -e "$L" ]; then echo "refusing to overwrite $L"; exit 3; fi
cd "$W/test" || exit 2
node "$W/node_modules/tsx/dist/cli.mjs" --tsconfig "$W/tsconfig.json" --no-warnings=ExperimentalWarning "$S" "$@" > "$L" 2>&1
echo "exit=$?" >> "$L"
