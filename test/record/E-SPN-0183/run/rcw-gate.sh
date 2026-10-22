#!/bin/sh
# rcw gate: read one part of register-coulomb-weak's gate plan in its own process (witness, or a point's name), writing
# test/record/E-SPN-0183/rcw-part-<name>.json and rcw-gate-<name>.log beside this folder. Refuses to overwrite either.
# usage: sh test/record/E-SPN-0183/run/rcw-gate.sh <name>
R="$(cd "$(dirname "$0")/.." && pwd)"
V="$(cd "$R/../../.." && pwd)"
N="$1"
if [ -e "$R/rcw-part-$N.json" ] || [ -e "$R/rcw-gate-$N.log" ]; then
  echo "rcw-part-$N.json or rcw-gate-$N.log exists in $R, refusing to overwrite" >&2
  exit 2
fi
cd "$V" || exit 2
NODE_OPTIONS=--max-old-space-size=24000 node_modules/.bin/tsx --no-warnings=ExperimentalWarning "$R/run/rcw-part.ts" "$N" "$R/rcw-part-$N.json" > "$R/rcw-gate-$N.log" 2>&1
echo "exit=$?" >> "$R/rcw-gate-$N.log"
