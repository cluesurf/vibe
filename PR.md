# Audit the experiment suite: honest depths, no typed verdicts, the rule has no amplitudes

## Summary

An adversarial audit of all 92 L3 experiments and structural sweeps over
the whole registry (817 files, 825 registrations). The suite's headline
tier had drifted from the methodology's own definition: 40 L3s never
touched a substrate, rule or coin algebra, 24 typed constants fed
verdicts, 166 experiments claimed `['3434']` with nothing 3434-related
in them, four registered experiments never ran, and `tsc` failed with
11 errors the `tsx` runner never saw. The central finding is that the
committed lattice-gas rule is a classical permutation with no
amplitudes, so the "coin's own Dirac walk" the quantum arena is built
on is a separate hand-written model, and the rule's vacuum is a global
period-three flash. That is now an experiment (E-FND-0080).

## What changed

- 24 typed constants removed from 20 files' verdicts, each with an
  `AUDIT 2026-08-31` comment. Two typed controls replaced by computed
  ones (`holography/area-law`, `gauge/proton-lifetime`), two removed.
- 43 substrate-free L3 experiments regraded to L1 or L2 with
  `substrates: 'any'`, an audit note in the file and the verdict, and
  prior art named for the walk results.
- 129 false `['3434']` labels rewritten to `'any'` after a hand sample
  of fourteen; 20 octonion-algebra files held for review.
- Four unimported experiments added to the barrel (all pass).
- 11 `tsc` errors fixed. `pnpm test` typechecks (`tsconfig.check.json`,
  code and test) before running.
- `code/dynamics/coined-dirac-walk.ts`: the walk defined once. Six
  modules rewritten on it. Every importing experiment (27 ids, 35
  registrations) is identical before and after in status, metrics and
  control, verified by diff.
- `code/measure/dominant-frequency.ts`: the DFT peak finder two modules
  each carried.
- `test/experiment/foundations/rule-has-no-amplitudes.ts` (E-FND-0080,
  L2, paper): the negative, with the walk as control.
- Four permanent checks: `pnpm check:labels` (labels, plus registry
  rows missing from the barrel), `pnpm check:constants`,
  `pnpm check:coverage`, `pnpm check:perturbation`.
- Notes: `readme.md` opens with the goal and credits Margenstern,
  `note/audit/2026-08-31-experiment-audit.md`,
  `note/experiment/quantum-coverage.md` (the QM and QFT map),
  `note/experiment/readme.md` counts, tables and tier definitions,
  audit prefaces in the quantum, spin and gauge arena readmes.

## How it was tested

```
npx tsc --noEmit -p tsconfig.check.json      # 0 errors
pnpm check:constants                          # 0 typed constants reaching a verdict (was 24)
pnpm check:labels                             # 0 contradicted, 20 review, 0 registry rows missing from the barrel
pnpm check:coverage                           # 105 code mentions, 0 unknown, 0 depth mismatches
npx tsx test/catalog.ts                       # 825 rows: L0 14, L1 207, L2 559, L3 45 (39 paper)
```

Second sitting (same branch): the DRY pass. `code/algebra/linear/complex-pair.ts`
replaces seven per-module copies of the tuple-complex helpers,
`code/measure/koide.ts` three `koideQ`s, `makeHashRng` four `detStream`s,
and five ten-line `beat` wrappers are inlined to the sweep they wrapped.
The 115 experiments importing any touched module were run in a detached
worktree at the previous commit and in the edited tree: identical in
status, metrics and control. The five geometry-only holography L3s
(`rt-geodesic-3434`, `holographic-3434`, `bulk-to-cusp-rt`,
`p91-holography`, `ryu-takayanagi-73`) are regraded to L2 with honest
titles (they measure hyperbolic geometry with a flat control, no
dynamics, no entanglement), `black-hole` loses its Bekenstein-Hawking
title, the 14 L3s with pseudo-random fills carry an ensemble note, and
`holographic-memory`'s `conserved` flag compares against the anchors
actually placed (it was false at every size for a bookkeeping reason).
Registry titles were synced from the catalog (58 rows).

Also in the second sitting: `gauge/ward-identity-maxwell` (E-FRC-0072)
and `quantum/toric-code-from-the-mesh` (E-QTM-0093, the toric code
built from the D4 complex of `d4Mesh`, k = 4 logical qubits per
four-torus by GF(2) rank, open patch k = 0). Both corrected their own
first prediction by measurement: the Maxwell operator has sites + 2
zero modes (the three torus Wilson lines), and an even-sided `d4Mesh`
is two disconnected lattices (b_0 = 2, so k = 8 at side 4). The parity
fact is documented on `d4Mesh` and tracked as roadmap item 0017, since
at least sixteen experiments use an even side. A codes-and-automata
section was added to `note/experiment/quantum-coverage.md`. Seven more
duplicated helpers were hoisted (shuffle, window mean, vector
membership, mesh opposites, ring neighbours), identical over their
twelve importers.

Pre-fix full run (main tree, 2026-08-31): 793 pass, 3 fail, 9 partial,
15 open, 0 crash, conformance 110 pass 0 fail, 34 minutes.

Post-fix full run (this worktree, 2026-08-31): 798 pass, 3 fail, 9
partial, 15 open, 0 crash, conformance 110 pass 0 fail. The non-pass
set (fail, partial, open, by id) is identical to the baseline, so
removing the typed constants flipped nothing, and the five added
registrations pass.

Consolidation identity: `diff` of the 35 before and after result lines
(timings stripped) is empty.

Second-sitting full run (this worktree, 2026-08-31, started at 826
registrations): 799 pass, 3 fail, 9 partial, 15 open, 0 crash,
conformance 110 pass 0 fail, the same non-pass set. The four experiments
registered after it started pass individually.

Third addition, the base-model experiments (all on the committed mesh
and rule, all exact):

- `foundations/momentum-rule-single-particle` (E-FND-0081, L2): under
  the momentum-conserving knit the vacuum is quiet and a lone tone is
  an exact ballistic particle, one slot, one cell per beat, straight
  line; parallel and crossing pairs are exact unions; opposite-sign
  head-on tones pass through without annihilating. The substrate has a
  sharp classical massless particle, and no superposition.
- `foundations/permutation-rule-cannot-interfere` (E-FND-0082, L1): the
  rule lifted to superpositions of configurations is a permutation
  matrix (49 phased branches, 49 images, cross term 0, norm conserved),
  so no phase on configurations can ever interfere; the irreversible
  sorting control merges 49 branches into 3 and breaks the norm.
- `foundations/pair-coarse-map-is-permutation` (E-FND-0083, L1): the
  induced map on all 1104 two-tone states at a cell is a permutation
  too. So the middle layer, if it exists, is a variable coarser than a
  pair, with a many-to-one induced dynamics. The ideas note records
  which candidates survive.

## The model, and where the theory stands after this branch

**The base model is unchanged.** Five things: the {3,4,3,4} hyperbolic
honeycomb of 24-cells (the flat cusp model is `d4Mesh`, Z^4 with D4
adjacency), a ternary tone per direction per cell, one local reversible
conserving collision plus streaming (the knit, in two committed forms:
the charge-only pair table and the momentum-conserving head-on
rotation), reflection and growth, and the arrow. Nothing was added.

**What the suite now establishes about that base, honestly graded.**

- *Geometry and substrate (L1, exact).* The 24 directions are the
  binary tetrahedral group; {3,4,3,4} carries spinors where {5,3,4} and
  {7,3} do not; the shell growth ratio is 18.28; the forced chain from
  the ternary alphabet to the knit (tone, arrow, eight, 24-cell, one
  rule out of 10395) holds by enumeration with relaxation controls.
- *The rule's own dynamics (L2 and L3, measured on the mesh).* Charge
  and momentum are conserved exactly and the rule is reversible. The
  momentum rule carries a sharp massless mode at speed one
  (E-RLT-0030) and its single tone is an exact ballistic classical
  particle with a quiet vacuum (E-FND-0081). The charge rule's vacuum is
  a global period-three flash and its lone tone is a pinned two-slot
  defect (E-FND-0080). Genesis on the growing mesh, the curvature arrow,
  the genesis basin, growth-expansion, the mass-hierarchy localization
  on the shell ladder, the horosphere flatness, the associative and
  self-maintenance results, and four holographic dynamics results are
  the 45 L3s: each builds the substrate, runs a dynamics, and beats a
  computed control. Seventeen of them hold at half and one and a half
  times their size; the rest are being made scale-aware on this branch.
- *Codes on the mesh (L2).* The mesh's own cell complex carries the
  toric code with exactly four logical qubits per four-torus
  (E-QTM-0093), and the rule's conserved charge acts as a classical
  stabilizer (E-QTM-0055). Codes exist on the geometry; error
  correction by the dynamics is classical.
- *Known physics reproduced on stated models (L2).* The coined Dirac
  walk family (Dirac dispersion, zitterbewegung, Klein, Bloch,
  tunneling, topological phases), lattice gauge theory (Gauss law,
  Wilson loops, confinement, the exact Ward identity E-FRC-0072),
  free-fermion entanglement, the hydrogen and shell spectra. All correct,
  all on models the rule has not yet produced.

**The negatives, which are the sharpest results on the branch.**

- The rule has no amplitudes: a reversible classical rule lifted to
  superpositions of its configurations is a permutation matrix
  (E-FND-0082), so no phase assigned to configurations or to two-tone
  pairs (E-FND-0083) can ever interfere, and the tone's sign is not a
  phase (opposite signs pass through, E-FND-0081). Every quantum result
  in the suite is therefore about a model, not the base, and the papers'
  "Derived" labels for the Born rule, the Tsirelson bound, and
  spin-statistics were overclaims.
- An even-sided `d4Mesh` is two disconnected lattices (parity of the
  coordinate sum), which forty call sites had not accounted for.
- The three-generation identification stays the deepest open
  conjecture, as the papers say; the Koide and mixing results are
  consistency checks on measured masses, not derivations.

**Where the theory stands.** The base is well defined, exactly
reversible, and produces a light cone, conserved charges, hyperbolic
geometry with a flat cusp, a growing mesh with a genesis attractor, and
a complex that carries codes. It does not yet produce amplitudes, and
the branch proves that no phase on its configurations can. The single
open construction everything quantum waits on is a coarse variable
(a count or density over many cells or beats) whose induced dynamics
under the permutation is many-to-one and unitary on the coarse space
(roadmap quantum-coverage-0006, candidates in
`note/research/vibe/next-paper/ideas.md`). Until it exists, the honest
sentence for the next paper is: a deterministic discrete base with
relativity, gauge structure, geometry, and codes, and a classical
particle where the quantum should be.

## Honest status

- The 45 remaining L3s build a substrate and measure against a computed
  control. The 17 whose main function takes a size hold every verdict
  boolean at half, default and one and a half times that size
  (`pnpm check:perturbation`, no crashes). The other 33 hardcode their
  sizes and are not yet perturbed (roadmap item 0012), so the paper
  should not call those robust until they are. (`holographic-memory`'s
  `conserved = 0` was a bookkeeping comparison against the anchor
  budget rather than the anchors placed; fixed in the second sitting.)
- 184 experiments use a pseudo-random fill or seed, 14 of them L3. The
  14 now say so in their notes; replacing the fills is roadmap item 0013.
- The five geometry-only holography results are regraded to L2 (item
  0014 closed). The four holography L3s that remain run a dynamics.
- New in the second sitting: `gauge/ward-identity-maxwell`
  (E-FRC-0072), the Ward identity measured exactly on the lattice
  Maxwell operator. Its first draft predicted sites - 1 zero modes and
  measured sites + 2; the three extra are the torus Wilson lines, and
  the corrected prediction is what the file now tests.
- 20 octonion-algebra experiments keep `['3434']` pending a decision on
  whether the coin's algebra without a mesh earns the label.
- `spin/three-generations-breaking-search` reports `partial`, its own
  honest status, unchanged.
- One stray file at the repo root, `tmp-deps.ts`, was created by the
  audit's scratch tooling and should be deleted.

## Follow-ups

Tracked in `note/research/vibe/roadmap/project/experiment-audit.json`
(items 0010, 0012 to 0016) and `quantum-coverage.json` (items 0003 to
0005). The next-paper notes are in `note/research/vibe/next-paper/`.
