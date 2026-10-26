#!/bin/sh
# The record runner of the shared droplet run of E-MTR-0034 and E-SPN-0219's stage 2 (the droplet only through
# mesh/work, never a raw ssh):
#   sh mtr034.sh smoke     both part runners' paths at a tiny size on this machine (tmp/mtr034-smoke/, tmp/spn219-smoke/;
#                          the clock's runner also checks its first 31 lags against the saved read)
#   sh mtr034.sh ship      copy the package to the work droplet's /root/vibe-runs/spn219-mtr034/pkg and start the job
#                          there detached (task/kernel/droplet-launch.sh: setsid, nice 19, idle I/O, pinned to cpus 5-7,
#                          three queues of one thread, test/record/E-MTR-0034/run/droplet-queues.sh, bounded at 6 days);
#                          refuses if the run directory exists
#   sh mtr034.sh status    the job's log, the three queues' logs and the parts landed, from the droplet
#   sh mtr034.sh fetch     copy the landed parts of both experiments into their record folders (refuses to overwrite)
#   sh mtr034.sh verdict   E-MTR-0034's verdict from the saved parts (log mtr034-verdict.log; refuses to overwrite it)
R=$(cd "$(dirname "$0")/.." && pwd)
W=$(cd "$R/../../.." && pwd)
ROOT=$(cd "$W/../../../.." && pwd)
WORK="$ROOT/mesh/work"
S="$W/test/record/E-SPN-0219"
D=/root/vibe-runs/spn219-mtr034
TSX="node $W/node_modules/tsx/dist/cli.mjs --tsconfig $W/tsconfig.json --no-warnings=ExperimentalWarning"
case "$1" in
  smoke)
    cd "$W/test" || exit 2
    $TSX "$R/run/mtr034-part.ts" all 2 smoke || exit 1
    $TSX "$S/run/spn219-part.ts" m0427a7.5 0.2 30 2 smoke ;;
  ship)
    if "$WORK" "test -e $D/job.pid"; then echo "refusing: a job was already started in $D"; exit 3; fi
    "$WORK" "mkdir -p $D/pkg" || exit 2
    # only what the parts import and run: code/ and the two run folders, never the 250 MB of saved records (the home
    # upload is slow, and the first full-package copy broke at 50 MB)
    COPYFILE_DISABLE=1 tar -C "$W" --exclude='tmp' --exclude='node_modules' -cf - package.json tsconfig.json tsconfig.check.json kernel/Cargo.toml kernel/Cargo.lock kernel/build.rs kernel/src code task test/record/E-MTR-0034/run test/record/E-MTR-0034/gates.json test/record/E-SPN-0219/run test/record/E-SPN-0219/gates.json test/record/E-SPN-0219/gates-stage2.json | "$WORK" "tar -xf - -C $D/pkg" || exit 2
    "$WORK" "printf 'queues\t0\tbash test/record/E-MTR-0034/run/droplet-queues.sh\n' > $D/pkg/job-steps.tsv" || exit 2
    "$WORK" "THREADS=1 bash $D/pkg/task/kernel/droplet-launch.sh $D 518400 5-7 $D/pkg/task/kernel/droplet-job.sh" ;;
  status)
    "$WORK" "uptime; echo pid \$(cat $D/job.pid) exit \$(cat $D/job.exit 2>/dev/null); tail -n 12 $D/job.log; for q in 1 2 3; do echo --- queue \$q; tail -n 4 $D/pkg/tmp/droplet-logs/queue\$q.log; done; ls -la $D/pkg/test/record/E-MTR-0034/ $D/pkg/test/record/E-SPN-0219/" ;;
  fetch)
    # a part is written whole on the droplet (one writeFileSync after the read), so a present file is complete
    for f in E-MTR-0034/mtr034-zero.json E-MTR-0034/mtr034-K1.json E-MTR-0034/mtr034-K0.5.json E-MTR-0034/mtr034-K0.35.json \
      E-SPN-0219/spn219-m0284a12-K0.2.json E-SPN-0219/spn219-m0284a12-K0.35.json E-SPN-0219/spn219-m0284a12-K0.5.json \
      E-SPN-0219/spn219-m0427a7.5-K0.2.json E-SPN-0219/spn219-m0427a7.5-K0.35.json E-SPN-0219/spn219-m0427a7.5-K0.5.json; do
      if [ -e "$W/test/record/$f" ]; then echo "have $f"; continue; fi
      if "$WORK" "test -s $D/pkg/test/record/$f"; then
        "$WORK" "cat $D/pkg/test/record/$f" > "$W/test/record/$f" || { echo "FAILED fetching $f: check it by hand"; exit 2; }
        echo "fetched $f"
      else
        echo "not yet: $f"
      fi
    done
    for q in 1 2 3; do "$WORK" "cat $D/pkg/tmp/droplet-logs/queue$q.log" > "$R/droplet-queue$q.log"; done
    "$WORK" "cat $D/job.log" > "$R/droplet-job.log"
    echo "logs refreshed: $R/droplet-queue1.log .. 3, $R/droplet-job.log" ;;
  verdict)
    L="$R/mtr034-verdict.log"
    if [ -e "$L" ]; then echo "refusing to overwrite $L"; exit 3; fi
    cd "$W/test" || exit 2
    $TSX "$R/run/mtr034-combine.ts" > "$L" 2>&1
    echo "exit=$?" >> "$L"
    head -2 "$L" ;;
  *) echo "usage: mtr034.sh smoke | ship | status | fetch | verdict"; exit 2 ;;
esac
