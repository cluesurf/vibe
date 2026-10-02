# experiment/keystones

Exact checks and keystone runs from the routes map, a burst-droplet runner, and a cross-platform determinism instrument. Branched from `make` at b1afd5f3 after `experiment/next-pieces` merged.

## Experiments (13 registered)

| code | file | verdict | what it settles |
| --- | --- | --- | --- |
| E-FRC-0277 | gauge/frame-higgs | fail as derived | the slot frame is not the Higgs on the present rule: SU(2)+'s center moves no slot, 0 of 1,152 W(F4) elements act that way |
| E-FRC-0278 | gauge/fear-beat-color-closure | pass | links plus every one-role image of the fear beat generate exactly Σ(648), not a dense SU(3) |
| E-CMP-0020 | computation/fear-beat-infinite-order | pass | (X ⊗ 1)·U has infinite order, exact over Z[ω][1/6]: the gate set's closure is infinite |
| E-QTM-0164 | quantum/leggett-garg-exact | partial | the role reaches K3 = 1 + √6/4 = 1.6124 > 3/2 on arranged schedules, the lone vibe never passes 1. Ledger A Leggett-Garg: stand-in to partial |
| E-QTM-0165 | quantum/middle-rung-jordan | pass | the middle rung's exact CHSH maximum is (8 + 2√21 + 2√35 − 2√15)/9 = 2.36126. Ledger A: open to held |
| E-CSM-0060 | cosmology/horosphere-expansion | fail as derived | horosphere layer counts grow as a volume (t^2.05), so one horosphere a beat gives a coasting universe, not constant H |
| E-RLT-0110 | relativity/one-speed-bounds | pass | one light speed as a register-size limit survives the published Lorentz bounds, at a register of at least 1.22e11 |
| E-RLT-0111 | relativity/laue-pair-stress | fail as predicted | the light pair's excess inertia is not stress (the binding stress is 58 and 36 times too small) |
| E-GRV-0149 | gravity/lapse-fall | fail on H1 as predicted | a body at rest falls at exactly 1/R of the universal rate (to 3e-4), so the equivalence principle at rest is R = 1 |
| E-HLG-0037 | holography/sea-entanglement | partial | the rule's own sea has zero entanglement; a Floquet band sea has an area law, η = 0.5744 ± 0.0016 |
| E-FND-0171 | foundations/pair-conserved-search | partial | at support two the rule keeps only the love and fear counts, no momentum density. The vacuum family did not certify (single-prime lift bound), rerun with the multi-prime solver in progress |
| E-SPN-0185 | spin/icosian-prethermal-krylov | pending | registered with gates fixed, gate run in progress on the work droplet |
| E-SPN-0186 | spin/icosian-strip-string | pending | registered with gates fixed, gate run in progress on the work droplet |

Also: E-SPN-0154 records a correction (its perimeter-4 loop is 0.8114, not 0.798), and `register-coulomb-track.ts` memoizes its K reads (no gate or result moves). A registry row that had lost its line break (E-FND-0169 and E-FND-0170 on one line) is split.

## Code

- `code/algebra/cyclotomic.ts`, `ninth-field.ts`: exact cyclotomic and Q(ζ9) arithmetic.
- `code/algebra/linear/peeled-null-space.ts`, `multi-modular-null-space.ts`: exact null spaces, the second with CRT across primes and every vector verified in BigInt.
- `code/measure/`: `character-split`, `jordan-chsh`, `leggett-garg-exact`, `pair-density`, `sea-entanglement`.
- `task/burst/`: temporary DigitalOcean CPU droplets for long runs, with a cost cap (hours and dollars), an independent watchdog, an on-droplet idle guard, per-job fetch as each finishes, and sync or add one job into a running batch. Docs: `note/research/vibe/compute.md` in the cluesurf repo.
- `task/determinism/`: V8's fdlibm restated in fused (arm64) and plain (x86-64) forms for 20 functions, verified on 200,000 inputs each, plus the exposure sweep and compare step.
- `task/kernel/droplet-run.ts`, `droplet-shell.ts`: shared droplet plumbing used by burst.

## Checks

- `tsc -p tsconfig.check.json`: exit 0.
- `check:labels`: pass, 0 registry rows not in the barrel. The 1 contradicted label (gravity/cubic-slide-speed) and 20 held for review predate this branch.
- The full `pnpm test` suite was not run.

## Still running when this merges

Their outputs land in this worktree's gitignored `tmp/`, and their write-ups follow in the next branch:

- the tracked R scan (OPEN-MOT-01), parts a_B 10 to 16, on a burst droplet. `register-coulomb-track.ts` still carries the placeholder code E-SPN-0000 and is not in the barrel. It registers as E-SPN-0187 when the parts land.
- E-SPN-0185 and E-SPN-0186 on the work droplet.
- E-FND-0171's vacuum rerun with the multi-prime solver.
- the x86 side of the determinism sweep.

Keep this worktree until those land: the next branch copies their `tmp/` outputs from here.

## Not in this branch

The pain, peace, pleasure rename of the package's code and files (phase 2) waits until the runs above finish, so it does not rename modules under them.
