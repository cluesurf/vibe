#!/bin/sh
# The laptop smoke test of E-RLT-0120's whole path at the tiny pair (a_B 1, ball 5, 1,023 lags): the droplet step
# itself (droplet-step.sh with SMOKE=1), then the combine on the smoke parts with run/smoke-gates.json, then the pack
# the launcher would send (launch.sh without --commit). Everything goes to the package's tmp/ (tmp/rlt120-smoke/ and
# tmp/rlt120-smoke.log); a smoke run already on disk is refused, so a fresh smoke test needs that folder gone.
W=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$W" || exit 2
OUT="$W/tmp/rlt120-smoke.log"
if [ -d "$W/tmp/rlt120-smoke" ]; then
  echo "refusing: $W/tmp/rlt120-smoke exists" >"$OUT"
  exit 2
fi
mkdir -p "$W/tmp"
{
  echo "== step"
  SMOKE=1 THREADS=3 TSX="$W/node_modules/.bin/tsx" bash "$W/test/record/E-RLT-0120/run/droplet-step.sh"
  echo "step exit=$?"
  echo "== combine"
  "$W/node_modules/.bin/tsx" "$W/test/record/E-RLT-0120/run/combine.ts" --smoke
  echo "combine exit=$?"
  echo "== pack"
  sh "$W/test/record/E-RLT-0120/run/launch.sh"
  echo "pack exit=$?"
} >"$OUT" 2>&1
echo "smoke done, log $OUT"
