# The Timeless Dynamics bridge, tested on the substrate

*The result to send back to the Timeless Dynamics author. Two experiments were run on the vibe substrate to test the resonance he named, the ternary tone and the recordability condition. Both pass, and they say the resonance is real.*

## What was asked

TD makes time emergent as the accumulated Fisher-Rao arc length along record-preserving paths. The author asked whether vibe's ternary tone under its reversible rule is the same record-preserving condition, and whether vibe's emergent beat is the same accumulated-distinguishability clock.

## What was run

Two experiments in `deck/vibe`, both deterministic, both with a lossy control.

- `foundations/emergent-time-distinguishability` (E-FND-0048)
- `foundations/record-preserving-paths` (E-FND-0049)

New library code: `code/measure/fisher-rao.ts` (the spatial activity distribution, the Fisher-Rao geodesic distance, the cumulative arc length), and a small addition to `code/check/reversibility.ts` (the roundtrip now returns the recovered state).

## What the substrate did

**Emergent time is accumulated distinguishability.** Along the reversible trajectory the Fisher-Rao arc length grows exactly linearly in the beat count, a constant tick of pi per beat (arc length 188.5 over 60 beats, early slope and late slope both pi). So counting beats and counting accumulated distinguishability are one clock. Under the lossy record-destroying rule the arc length saturates almost at once and stays flat (late slope zero, total 3.14 versus 188.5, a ratio of 0.017). The clock stops when the record is gone. So vibe's emergent beat is TD's accumulated Fisher-Rao arc length, and it is the record-preservation that keeps it running.

**Record-preservation is reversibility.** Run the reversible knit forward thirty beats then its inverse thirty beats, and the initial state returns bit for bit, zero of the ninety-eight thousand slots changed, every distinction recoverable. The lossy erasing rule loses a definite fraction, 4096 slots, about four percent, gone for good. So TD's record-preserving path and vibe's reversible rule are one property under two names.

## The reading

The tone-and-recordability resonance he asked about is real and now measured. Vibe's reversibility IS TD's record-preservation, exactly, and vibe's emergent beat IS TD's accumulated-distinguishability time, on this substrate. The bridge grade stays parallel-divergent, a B, because the backbone is shared while the substrate forks, continuous Fisher-Rao distinguishability geometry against the discrete ternary tone on the 24-cell.

## The candor

- The per-beat distinguishability here is maximal, because the ternary parity flips the activity support each beat, so the clock ticks the whole simplex diameter per beat. The load-bearing claims are the linearity of the reversible arc length (a uniform clock) and its saturation under loss (the clock stops), both of which hold, not the size of the tick.
- The other question, the 24-cell against the 5D manifold, was not tested. It stays a weak coincidence, a dimension count, not a structural match, and the 5D claim itself is unconfirmed in the sources found (see `07-epistemic-status.md`).
- These are graded L2, known information geometry read on the substrate through TD, with the lossy control. They are a shared-backbone confirmation, not a derivation of TD from vibe or the reverse.
