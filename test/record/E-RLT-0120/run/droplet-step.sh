#!/bin/bash
# The droplet step for E-RLT-0120: task/kernel/droplet-job.sh runs it in the copied package with TSX and THREADS set
# (job-steps.tsv line 'rlt120 0 bash test/record/E-RLT-0120/run/droplet-step.sh'). It runs the parts axes, plane and
# generic in turn (each resumable, a finished one refused), and after each copies its record and log into
# tmp/droplet-logs/. With SMOKE=1 it runs the smoke parts (run.ts --smoke) instead, which is how the laptop smoke test
# runs this very file.
P=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$P" || exit 2
echo "threads ${THREADS:-unset}, nice $(nice 2>/dev/null || echo unknown), smoke ${SMOKE:-0}"
FLAG=""
DIR=test/record/E-RLT-0120
if [ "${SMOKE:-0}" = 1 ]; then
  FLAG=--smoke
  DIR=tmp/rlt120-smoke
fi
mkdir -p tmp/droplet-logs
for part in axes plane generic; do
  if [ -f "$DIR/rlt120-$part.log" ] && grep -q "part $part done" "$DIR/rlt120-$part.log"; then
    echo "$part already done"
    continue
  fi
  echo "$(date -u +%FT%TZ) part $part"
  "$TSX" test/record/E-RLT-0120/run/run.ts "$part" $FLAG
  code=$?
  cp "$DIR/rlt120-$part.json" "$DIR/rlt120-$part.log" tmp/droplet-logs/ 2>/dev/null
  echo "$(date -u +%FT%TZ) part $part exit $code"
  [ "$code" = 0 ] || exit "$code"
done
exit 0
