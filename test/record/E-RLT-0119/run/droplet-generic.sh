#!/bin/bash
# The droplet step for E-RLT-0119's generic part: task/kernel/droplet-run.ts runs it in the copied package with TSX
# set (--step 'rlt119_generic=bash test/record/E-RLT-0119/run/droplet-generic.sh'). It runs the part, then copies its
# record and log into tmp/droplet-logs/, the one directory the run's log fetch brings back to the laptop.
P=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$P" || exit 2
echo "threads $THREADS of $(nproc) cores"
"$TSX" test/record/E-RLT-0119/run/run.ts generic
code=$?
mkdir -p tmp/droplet-logs
cp test/record/E-RLT-0119/rlt119-generic.json test/record/E-RLT-0119/rlt119-generic.log tmp/droplet-logs/
exit $code
