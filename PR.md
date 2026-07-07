# Five genuine-L3 experiments measured off the coin's own Dirac walk

## Summary

Five new experiments, each a MEASURED consequence of the {3,4,3,4} coin's single-particle sector (the
two-component coined Dirac walk), each with a control that can fail and a quantitative, could-have-been-
wrong number. None imports an analytic law or builds a quantum state by hand. All deterministic, no
randomness. These are built to the L3 derivation standard (see
`note/research/vibe/l3-derivation-standard-2026.md` in the monorepo): where the substrate's own
dynamics genuinely produce a known effect, build the L3 experiment rather than a framed bridge.

## What changed

New experiments (arena QTM), all `depth: 'L3'`, `substrates: ['3434']`, `paper: true`:

- **E-QTM-0072 zitterbewegung** — a massive walk's chirality (mean velocity) trembles at exactly twice
  the mass. Frequency read off the walk by DFT = 2*mass to ~1% at masses 0.15/0.3/0.6, doubling when
  the mass doubles. Control: a massless walk shows zero trembling (amplitude 0, frequency 0).
- **E-QTM-0073 klein-tunneling** — a scalar step in the Klein window transmits the relativistic walk
  across incident momenta 0.5..1.1 nearly energy-independently (penetration > 0.86), while a MASS step
  of the same height reflects it (penetration < 0.04). Scalar-vs-mass is the textbook Klein criterion,
  the control that genuinely fails.
- **E-QTM-0074 bloch-oscillations** — a constant force makes the centroid oscillate at the Bloch
  frequency omega_B = F (ratio within 6% across forces 0.05..0.3), amplitude*force a constant band
  width (~1.96). Control: zero force shows no oscillation.
- **E-QTM-0075 aubry-andre-localization** — a deterministic golden-ratio quasiperiodic mass modulation
  localizes the walk (spread saturates with time, ~20x smaller than ballistic), while the unmodulated
  walk spreads linearly (grows ~5x = the step ratio). Quasiperiodic, not random.
- **E-QTM-0076 jackiw-rebbi-bound-state** — a mass wall that changes SIGN binds a time-independent
  zero-mode at the wall (retained weight 0.96, stability 1.0001), the 1D bulk-boundary correspondence.
  A same-sign wall of identical gradient binds nothing (0.03, contrast 34.8x) and a uniform mass
  disperses, so the binding is the topological sign change, not the inhomogeneity.

New reusable code:

- `code/measure/zitterbewegung.ts` — trembling trace / amplitude / frequency off `diracQuantumWalk`.
- `code/dynamics/klein-barrier.ts` — a right-moving packet on the coined Dirac walk hitting a scalar or
  mass barrier; returns reflected / inside / transmitted probability.
- `code/dynamics/bloch-oscillation.ts` — the coined Dirac walk under a constant force; centroid trace
  and its Bloch frequency.
- `code/dynamics/quasiperiodic-walk.ts` — the coined Dirac walk under a deterministic quasiperiodic
  mass modulation; final position spread.
- `code/dynamics/mass-domain-wall.ts` — the coined Dirac walk across a mass wall (sign-flipping,
  same-sign, or uniform); fraction of probability retained near the wall.

Registered: `test/experiment/all.ts` barrel imports, five rows in `test/registry.csv`, catalog
regenerated (`npx tsx test/catalog.ts`, now 793 experiments). README depth counts updated (87 L3).

## How it was tested

- Each experiment run standalone: all five return `status: 'pass'` at `depth: 'L3'`.
  - zitterbewegung: worstRatioError 0.0119, massless control amplitude 0.
  - klein-tunneling: worstPotentialPenetration 0.8672, potentialSpread 0.0518, mass control 0.034.
  - bloch-oscillations: worstFreqRatioError 0.0455, band width 1.9588, zero-force control 5.69e-15.
  - aubry-andre-localization: localizedGrowth 1.654, suppression 19.7x, ballisticGrowth 4.947.
  - jackiw-rebbi-bound-state: flipRetainedLong 0.9626, stability 1.0001, contrast 34.8x, uniform 0.45->0.14.
- Full suite (`npx tsx test/run.ts`) exit 0 with these registered (no regressions; the pre-existing
  `fail`-status experiments are documented honest negatives, not runner errors).

## Honest notes

- Klein tunneling: the discrete walk has a periodic multi-band dispersion, so a monotone barrier-height
  sweep is NOT clean (bands and gaps alternate). The robust, physically-correct statement is the
  scalar-vs-mass step contrast at a fixed Klein-window step, which is what the experiment asserts. This
  is stated in the experiment file and the standard doc, not smoothed over.
- The naive scalar phase-potential does NOT produce Aubry-Andre localization (the Floquet phase wraps
  mod 2pi, so strength saturates). The correct coupling is a quasiperiodic modulation of the coin angle
  (the local mass), which does localize. The experiment uses that coupling.

## Follow-ups

- The wider standing L3 audit of the ~790 existing experiments continues (method + queue in
  `note/research/vibe/l3-derivation-standard-2026.md`).
- Further uncovered walk-derived candidates: Lieb-Robinson operator-spreading velocity, quantum scars,
  spectral form factor. Each needs its own honest control before it is built.
