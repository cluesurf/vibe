#!/bin/sh
# Launch E-RLT-0120 on the work droplet, through mesh/work only. It packs the package the way task/kernel/droplet-run.ts
# does (droplet-shell.ts PACKAGE_PATHS: never node_modules, kernel/host or tmp; of test/record only this experiment's
# folder and index.csv, since no other record is read, which takes the pack from 115 MB to a few) with a one-line
# job-steps.tsv, and with
# --commit it copies the pack to /root/vibe-runs/rlt120/pkg (refusing if that run folder exists) and starts
# task/kernel/droplet-job.sh there DETACHED through task/kernel/droplet-launch.sh: nice 19, the idle I/O class, no cpu
# pinning (the droplet is shared with one other run, so the scheduler places both), THREADS=3, bounded on the machine
# by `timeout` at CAP_HOURS (default 120). The job installs nothing it finds (system node 24 and cargo), builds the
# native kernel with cargo in the copied package, then runs test/record/E-RLT-0120/run/droplet-step.sh.
# Without --commit it only packs (the smoke test runs it that way).
#
#   sh test/record/E-RLT-0120/run/launch.sh [--commit]
W=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
cd "$W" || exit 2
WORK=/Users/lancepollard/base/crew/cluesurf/mesh/work
RUN=/root/vibe-runs/rlt120
STAGE="$W/tmp/rlt120-stage"
CAP=$(( ${CAP_HOURS:-120} * 3600 ))
mkdir -p "$STAGE"
printf 'rlt120\t0\tbash test/record/E-RLT-0120/run/droplet-step.sh\n' >"$STAGE/job-steps.tsv"
COPYFILE_DISABLE=1 tar -czf "$STAGE/pkg.tgz" --exclude node_modules --exclude .DS_Store \
  --exclude 'test/record/E-RLT-0120/rlt120-axes.*' --exclude 'test/record/E-RLT-0120/rlt120-plane.*' \
  --exclude 'test/record/E-RLT-0120/rlt120-generic.*' \
  package.json tsconfig.json tsconfig.check.json kernel/Cargo.toml kernel/Cargo.lock kernel/build.rs kernel/src \
  code task research test/catalog.csv test/catalog.ts test/code test/codes.csv test/experiment test/registry.csv \
  test/rerun.ts test/result.ts test/run.ts test/scaffold test/site test/suite test/test.ts \
  test/record/index.csv test/record/E-RLT-0120 -C "$STAGE" job-steps.tsv || exit 2
echo "packed $(ls -l "$STAGE/pkg.tgz" | awk '{print $5}') bytes; files $(tar -tzf "$STAGE/pkg.tgz" | wc -l)"
tar -tzf "$STAGE/pkg.tgz" | grep -c 'test/record/E-RLT-0120/run/' | sed 's/^/E-RLT-0120 run files: /'
[ "$1" = --commit ] || { echo "pack only (pass --commit to launch)"; exit 0; }
made=$("$WORK" "if [ -e $RUN ]; then echo exists; else mkdir -p $RUN/pkg && touch $RUN/.vibe-run && echo made; fi")
[ "$made" = made ] || { echo "refusing: $RUN on the droplet: $made"; exit 2; }
"$WORK" "tar -xzf - -C $RUN/pkg && echo unpacked" <"$STAGE/pkg.tgz" || exit 2
"$WORK" "cd $RUN/pkg && THREADS=3 bash task/kernel/droplet-launch.sh $RUN $CAP - $RUN/pkg/task/kernel/droplet-job.sh"
echo "launched in $RUN (cap $CAP s); progress: sh test/record/E-RLT-0120/run/status.sh"
