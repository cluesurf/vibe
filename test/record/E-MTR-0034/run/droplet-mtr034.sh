#!/bin/bash
# The droplet step for E-MTR-0034 (task/kernel/droplet-job.sh runs it in the copied package with TSX and THREADS set):
# the a_B 16 parts in turn (zero, then K 1, 0.5, 0.35, 0.2), each JSON written as it lands, then copied with the log
# into tmp/droplet-logs/, where test/record/E-MTR-0034/run/mtr034.sh fetch finds them.
P=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$P" || exit 2
echo "threads $THREADS of $(nproc) cores"
mkdir -p tmp/droplet-logs
"$TSX" test/record/E-MTR-0034/run/mtr034-part.ts all "$THREADS" 2>&1 | tee test/record/E-MTR-0034/mtr034-part.log
code=${PIPESTATUS[0]}
cp test/record/E-MTR-0034/mtr034-*.json test/record/E-MTR-0034/mtr034-part.log tmp/droplet-logs/
exit $code
