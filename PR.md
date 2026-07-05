# Fisher-Rao time: the Timeless Dynamics bridge, measured

Adds two experiments that test a bridge raised by an external researcher (Timeless
Dynamics, now a related-theories census entry). TD makes time emergent as accumulated
Fisher-Rao arc length along record-preserving paths, and asked whether vibe's ternary
tone under its reversible rule is the same record-preservation, and whether vibe's beat
is the same accumulated-distinguishability clock. Both experiments say yes.

## What changed

Two experiments (681 total, up from 679), both foundations, both L2, both passing, each
with a lossy control.

| code | experiment | result |
| --- | --- | --- |
| E-FND-0048 | `foundations/emergent-time-distinguishability` | pass |
| E-FND-0049 | `foundations/record-preserving-paths` | pass |

New library code:

- `code/measure/fisher-rao.ts` — the spatial and block activity distributions, the
  Fisher-Rao geodesic distance (2 arccos of the Bhattacharyya overlap), the cumulative
  arc length, and a window slope.
- `code/check/reversibility.ts` — `roundtrip` now also returns the recovered state
  (a non-breaking addition, existing callers destructure `evolved` and `roundtripHamming`).

## Results (measured, deterministic)

- **Emergent time is accumulated distinguishability.** Along the reversible knit the
  Fisher-Rao arc length grows exactly linearly in the beat count, a constant tick of pi
  per beat (188.5 over 60 beats, early slope and late slope both pi). Under the lossy
  erasing rule it saturates at once (late slope zero, total 3.14, a ratio of 0.017 to
  the reversible arc). The emergent beat is a distinguishability clock, and the
  record-preservation is what keeps it running.
- **Record-preservation is reversibility.** Forward thirty beats then inverse thirty
  recovers the start bit for bit (Hamming 0 of 98304 slots). The lossy rule loses 4096
  slots, about four percent, for good. TD's record-preserving path and vibe's reversible
  rule are one property under two names.

## Candor

- The per-beat distinguishability here is maximal (the ternary parity flips the activity
  support each beat), so the clock ticks the simplex diameter per beat. The load-bearing
  claims are the LINEARITY of the reversible arc (a uniform clock) and its SATURATION
  under loss (the clock stops), both of which hold, not the size of the tick.
- Graded L2, known information geometry read on the substrate through TD, with the lossy
  control. A shared-backbone confirmation, not a derivation either way.
- The 24-cell versus 5D manifold question is not addressed here.

## How tested

Each experiment run individually (deterministic, seed 1): both pass. Lint clean on all
four new/changed files. The catalog regenerates cleanly (`npx tsx test/catalog.ts` wrote
681), which confirms the barrel loads every experiment with no duplicate-id collision. The
full gate was not re-run end to end here; the additions are L2 with controls (no L3, so no
partial downgrade) and do not crash, so they do not gate the build.

## Follow-ups

- Send the result to the TD author (writeup at
  `land/text/papers/timeless-dynamics/notes/08-bridge-experiments-tested.md`).
- Optional: a coarser or slower observable to read a sub-maximal per-beat tick, so the
  linearity is shown with a non-degenerate step size.
- The 24-cell / 5D effective-dimension question, if the author's 5D claim is confirmed.
