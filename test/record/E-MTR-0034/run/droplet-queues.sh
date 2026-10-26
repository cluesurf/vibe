#!/bin/bash
# The droplet step shared by E-MTR-0034 (the a_B 16 pair) and E-SPN-0219's stage 2 (the clock's K reads at 6,800 lags):
# task/kernel/droplet-job.sh runs it in the copied package with TSX set. Three queues of one thread each, balanced by
# representatives times lags (1.6e9 to 1.8e9 each), run side by side; each part is a JSON written as it lands, and each
# queue's log is written as it goes. Verdicts never run here: the parts are fetched to the laptop
# (test/record/E-MTR-0034/run/mtr034.sh fetch).
P=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$P" || exit 2
L=tmp/droplet-logs
mkdir -p "$L"
echo "three queues of 1 thread on $(nproc) cpus"
M=test/record/E-MTR-0034/run/mtr034-part.ts
S=test/record/E-SPN-0219/run/spn219-part.ts
# loads in 1e9 representative-lags: q1 0.29 + 0.90 + 3 x 0.15, q2 2 x 0.90, q3 3 x 0.59
q1() {
  for K in 0.2 0.35 0.5; do "$TSX" $S m0427a7.5 $K 6800 1 probe; done
  "$TSX" $M zero 1
  "$TSX" $M 1 1 probe
}
q2() {
  "$TSX" $M 0.5 1 probe
  "$TSX" $M 0.35 1
}
q3() {
  for K in 0.2 0.35 0.5; do "$TSX" $S m0284a12 $K 6800 1 probe; done
}
q1 > "$L/queue1.log" 2>&1 &
a=$!
q2 > "$L/queue2.log" 2>&1 &
b=$!
q3 > "$L/queue3.log" 2>&1 &
c=$!
wait $a $b $c
cat "$L/queue1.log" "$L/queue2.log" "$L/queue3.log"
ls -la test/record/E-MTR-0034 test/record/E-SPN-0219
