#!/bin/sh
# E-SPN-0219's record runner:
#   sh spn219.sh verdict 1   stage 1's verdict from E-SPN-0217's saved solves (log spn219-verdict.log)
#   sh spn219.sh verdict 2   stage 2's verdict from the 6,800-lag reads (log spn219-stage2-verdict.log), once
#                            test/record/E-MTR-0034/run/mtr034.sh fetch has brought all nine reads back
#   sh spn219.sh rerun <1|2> the same verdict printed to the terminal, nothing written
# a verdict log is never overwritten
R=$(cd "$(dirname "$0")/.." && pwd)
W=$(cd "$R/../../.." && pwd)
S="$R/run/spn219-combine.ts"
run() { node "$W/node_modules/tsx/dist/cli.mjs" --tsconfig "$W/tsconfig.json" --no-warnings=ExperimentalWarning "$S" "$1"; }
case "$1" in
  verdict)
    case "$2" in
      1) L="$R/spn219-verdict.log" ;;
      2) L="$R/spn219-stage2-verdict.log" ;;
      *) echo "usage: spn219.sh verdict 1|2"; exit 2 ;;
    esac
    if [ -e "$L" ]; then echo "refusing to overwrite $L"; exit 3; fi
    cd "$W/test" || exit 2
    run "$2" > "$L" 2>&1
    echo "exit=$?" >> "$L"
    head -2 "$L" ;;
  rerun) cd "$W/test" || exit 2; run "$2" ;;
  *) echo "usage: spn219.sh verdict 1|2 | rerun 1|2"; exit 2 ;;
esac
