# The field content of the committed rule, and the turning weave candidate

## Summary

Answers "what is missing from the model as a quantum field theory" by
measurement. Four new experiments pin the committed rule's particle content and
its interaction structure exactly, a fifth mechanism (Sakharov baryogenesis on
the substrate) is demonstrated with its own null control, and the one
architectural gap found (gauge universality across decoupled sectors) gets a
searched, battery-tested candidate solution, the turning weave, held for
discussion rather than adopted.

## What changed

- `test/experiment/foundations/weave-species-spectrum.ts` (E-FND-0113): the
  exhaustive 24-direction census. Three bands: 10 ballistic matter directions
  (speed exactly root 2), 10 clock-wire breathers (exact period 6, massive
  particles at rest), the swap couple interacting band (2 clean, 2 chirally
  placed radiating directions, zero leakage into other couples). PASSES.
- `test/experiment/foundations/weave-interaction-map.ts` (E-FND-0114): exact
  additivity tests. Clock-couple matter exactly free through a true head-on,
  swap-couple matter genuinely scatters, cross-couple exactly decoupled, the
  matter-wire contact vertex interacts from beat one. PASSES.
- `test/experiment/foundations/weave-antiparticle-conjugation.ts` (E-FND-0115):
  tone minus one is the exact antiparticle in the free sector (slotwise
  negation, conjugate phases at plus and minus 150 degrees), C violation is
  localized to the interacting radiating mode (54 slots), and the
  particle-antiparticle pair sums to exactly 3 at 180 degrees. PASSES.
- `test/experiment/foundations/weave-sakharov-asymmetry.ts` (E-FND-0116): a
  growth quench charges the matter sector from the exactly C-symmetric empty
  state. Charge lands only in the interacting couple, total tone sum exactly
  conserved (the B minus L analog), samples quantized in whole hypersheets,
  and the commensurate quench is an exact null at every beat. PASSES.
- `note/open/field-content-and-gaps.md`: the full gap analysis against the
  ledger's open rows, the one-in-six dark-sector counting observation, and the
  turning weave candidate with its battery results.
- `test/experiment/all.ts`: the four new experiments wired.

## How it was tested

From this worktree (node_modules symlinked from the main tree):

- `npx tsc --noEmit -p tsconfig.check.json`: clean.
- `npx tsx tmp/verdicts.ts foundations/weave-species-spectrum`: pass
  (ballistic 10, breathers 10 all exact period 6, cleanSwap 2, radiating 2,
  leakage 0).
- `npx tsx tmp/verdicts.ts foundations/weave-interaction-map`: pass (free rows
  exactly zero, swap head-on 0 before crossing then 15, contact vertex 2 at
  beat one then 59).
- `npx tsx tmp/verdicts.ts foundations/weave-antiparticle-conjugation`: pass
  (free mismatches 0 and 0, radiating mismatch 54).
- `npx tsx tmp/verdicts.ts foundations/weave-sakharov-asymmetry`: pass
  (settled averages 6084 and 12168, commensurate null exact, conservation
  exact, quantization exact).
- The full suite was NOT run on this branch (the fast-iteration rule). The
  main tree's definitive run on the same base commit finished green today:
  860 pass, 0 fail, 0 crash, 9 partial, 15 open, conformance 110 pass 0 fail.

## Honest status

- The four experiments are deterministic, window-rule safe, and their controls
  read exactly zero. Depth graded L2 throughout.
- The turning weave is a CANDIDATE, not an adoption. Measured for it: exact
  echo, exact charge conservation, vacuum clock period 12 exact, exact
  separated superposition, 22 of 24 species interacting, dressed support
  saturating window-safe, quantized quench charges. Measured against it: the
  commensurate-quench null does not carry. Not yet measured: CPT under
  schedule reversal, the wall sector, interference, the coupling constant
  story. Probes live in tmp/ on this branch.
- The Sakharov experiment's asymmetry oscillates with the vacuum clock rather
  than freezing, and the gate is a settled-window average, stated in the file.

## Follow-ups

- The acceptance battery is COMPLETE and CLEARED. E-FND-0117: CPT exact
  under pure charge conjugation with time reversal (the cyclic schedule
  failing everywhere in the whole group as the control), connected
  universality, echo, superposition, vacuum periodicity. E-FND-0118: the
  vacuum exactly periodic from birth (quantum 24 beats), the three-regime
  unit-kick law (blind, exactly-one-unit, absorbing), exact two-path
  interference (additivity 2e-12, eleven aligned and six crossed beats),
  wall content sheet-quantized at exact period 24, and bounded dressing past
  a full schedule period. Adoption is now a decision, not a measurement.
- The phase-protected free modes under the turning schedule (a possible
  neutrino-flavored species class) need a mechanism statement.
- The dark-sector reading forks with the candidate choice and is recorded in
  the note.
