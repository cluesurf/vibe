#!/bin/sh
# Bring E-RLT-0120's finished parts and logs back from the work droplet into test/record/E-RLT-0120/, through
# the $WORK command. It refuses while the job has no job.exit, and never overwrites a file already in the record (a part
# fetched once is the record). The job's own log comes back as rlt120-droplet.log.
#
#   sh test/record/E-RLT-0120/run/fetch.sh
W=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
WORK="${WORK:?set WORK to the command that runs a shell line on the work droplet}"
RUN=/root/vibe-runs/rlt120
D="$W/test/record/E-RLT-0120"
done_code=$("$WORK" "cat $RUN/job.exit 2>/dev/null || echo running")
[ "$done_code" != running ] || { echo "the droplet job is still running: sh $D/run/status.sh"; exit 3; }
echo "droplet job exit $done_code"
for f in rlt120-axes.json rlt120-axes.log rlt120-plane.json rlt120-plane.log rlt120-generic.json rlt120-generic.log; do
  if [ -e "$D/$f" ]; then
    echo "kept $f (already in the record)"
    continue
  fi
  "$WORK" "cat $RUN/pkg/test/record/E-RLT-0120/$f" >"$D/$f" || { echo "could not fetch $f"; exit 2; }
  echo "fetched $f ($(wc -c <"$D/$f") bytes)"
done
[ -e "$D/rlt120-droplet.log" ] || "$WORK" "cat $RUN/job.log" >"$D/rlt120-droplet.log"
# the fetched files are committed: the droplet's package folder reads ".", and no machine is named
node "$W/node_modules/tsx/dist/cli.mjs" --tsconfig "$W/tsconfig.json" --no-warnings=ExperimentalWarning "$W/task/scrub-log.ts" \
  --root "$RUN/pkg" --root "$RUN" "$D"/rlt120-*.json "$D"/rlt120-*.log
