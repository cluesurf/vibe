# Experimental Methodology and Standards

The north star for how we write, think about, implement, and run the vibe experiments. This is both an
internal standard and a public statement, and it doubles as the methodology section for the papers. The core
commitment is simple. We would rather report an honest negative than a dressed-up positive. A wall of green
checkmarks is worth less than three honest results with two failures.

## 0. The double-and-triple-check rule (the first commitment)

Every single test and experiment MUST be double and triple checked for hacks, cheating, circularity,
tautology, and surface-level shortcuts, and confirmed to be ACCURATE, CORRECT, VALID, and USEFUL. We do this
as we write each test, again before we call it PASSED, and again in the standing audit. We grade our OWN tests
as harshly as a stranger's, because the easiest person to fool is ourselves.

Concretely, for every test, three passes.

1. **As written.** Trace every boolean back to its source. Ask, is this measured from real dynamics, or is it
   the input restated. Is a constant set by hand that then appears in the conclusion.
2. **Before PASSED.** Is there a control that could have failed. Is the threshold a knife edge. Does the
   printed claim match what was actually shown. Is the result useful, or a tautology dressed as proof.
3. **In the audit.** Re-run under perturbation (a different seed, size, parameter), and assign the honest
   depth level. A test passes only by surviving the attack.

If any check fails, the test is RELABELED honestly (a circular check becomes a consistency note, not evidence)
or removed. This is not a one-time cleanup, it is a permanent standard. Nothing is called a result until it has
survived all three passes.

## 1. What we are testing

The model is exactly FIVE base things, nothing else.

1. A growing crystal (the {3,4,3,4} or {5,3,4} honeycomb, a fixed discrete graph of cells).
2. A ternary or directional tone on the cells (the state).
3. A deterministic, reversible, conserving local rule (the dynamics).
4. Reflection and growth (how the crystal extends).
5. The arrow (the value direction).

Everything physical must EMERGE from these five. We never add a sixth ingredient (cohesion, planning,
willpower, a stabilizer, a gravity term) and call the result emergent. If a phenomenon does not come from the
five, we report the honest negative, we do not impose it.

The raw substrate is NOT physics directly. It passes through one to three emergent middle layers. Raw tones
are not particles, raw clustering is not gravity. We never name a coarse pattern after a physical thing it has
not earned.

## 2. The depth rubric (the central standard)

Every test is graded by what it actually establishes, not by whether it prints PASSED. Four levels.

| level | what it establishes | example |
| ----- | ------------------- | ------- |
| L0 circular | the answer is put in by hand, proves nothing | integrating dS/dt = g S x B then reporting g, hardcoding a formula then verifying it |
| L1 known math | correctly confirms an established mathematical fact | the 24-cell is the binary tetrahedral group, D4 is a flat 4D lattice |
| L2 known physics | reproduces a known construction on this substrate | the Dirac quantum walk, lattice gauge theory, ballistic transport |
| L3 emergent and novel | a single base rule produces the result as a measured consequence, with a control, ideally a quantitative prediction that could be wrong | the genuine target |

The grade is stated with the result. PASSED at L1 means correct and established, not a discovery. We never let
an L1 or L2 result masquerade as L3. Most honest results in a young program are L1 and L2, and that is fine,
as long as they are LABELED as such.

## 3. The principles we hold

- **Determinism.** The base is deterministic, there is no fundamental randomness. We do not test random
  structures as foundational, randomness only appears as an emergent, coarse-grained effect.
- **Exactness.** The rule is a reversible permutation, so it is integer arithmetic, not floating point. We
  assert EQUALITY, not tolerance, wherever the quantity should be exact. A loose epsilon hiding a bug is a
  failure of method.
- **Measured, not assumed.** A dispersion, a coupling, a charge, must be READ OUT of the actual dynamics, not
  written in as a formula and confirmed. If we compute a thing and then verify the thing, that is a
  consistency check, and we label it as such, it is not evidence of emergence.
- **Controls.** Every positive claim needs a NEGATIVE control, a substrate, rule, or parameter where the
  answer should be NO, and the test must give NO there. A test that cannot fail proves nothing. The {5,3,4}
  no-spinor result is the model, it is what makes the {3,4,3,4} spinor result mean something.
- **Robustness.** A result must survive perturbation, a different seed, a different lattice size, a nearby
  parameter. A number that clears a threshold by a hair, or holds only at one hardcoded setting, is a knife
  edge, and we say so.
- **Prior art.** Much of what we reproduce is established (the QCA to Dirac and Maxwell program, lattice gauge
  theory, classical group theory). We cite it. Reproducing known work is fine and valuable, dressing it as new
  is not.

## 4. The standards each experiment must meet

Before any test is called PASSED, it must satisfy all of these.

1. **Correctness.** It computes what it claims. At least one number is re-derived by a second method or by
   hand. Tolerances are tight where the quantity is exact.
2. **No circularity.** Every boolean is traced back to its source. If a constant is set by hand and then
   appears in the conclusion, the test is circular and is relabeled or deleted.
3. **A control.** There is a case where the test gives NO. If there is none, the result is marked weak.
4. **Quantitative where possible.** A number that could have come out wrong is stronger than a boolean. We
   prefer a measured coefficient with a tolerance over a yes.
5. **Honest claim.** The printed conclusion matches what was shown. No overclaim, no PASSED resting on a
   built-in answer or a loose threshold.
6. **Reproducible.** Deterministic, runnable from one command, the seed and the parameters recorded.

## 5. The anti-patterns we forbid

These are the ways a test lies, and we hunt for them in our OWN work as hard as in anyone else's.

- **Circular or put-in-by-hand.** The conclusion is the input restated. The worst and most common.
- **Tautology.** Verifying a definition or a thing we just constructed (cumsum a charge then check the
  difference is the charge, set g equals 2 then integrate it).
- **Knife-edge threshold.** The result barely clears a bound, or holds only at one size or seed.
- **No control.** A yes with nothing that could give a no.
- **Qualitative dressed as proof.** It has a Dirac dispersion, with no measured coefficient.
- **Loose tolerance hiding a bug.** A 1e-2 epsilon where the quantity should be exact.
- **Overclaim.** PASSED or novel for an L1 known fact or an L2 reproduction.

## 6. How we implement

- **The engine.** A reversible, conserving local rule on the cell graph, run with exact integer or fixed-point
  state, verified bit-identical across implementations. Reversibility is tested by running forward then
  backward and recovering the start exactly.
- **The substrate.** Built explicitly with its correct adjacency and directions, the structure verified
  (neighbour counts, closure, the representation decomposition) before any dynamics is questioned.
- **The algebra layer.** Quaternions, Clifford algebra, and discrete exterior calculus, each with unit tests
  on its own identities (a 2pi rotation gives minus one, d composed with d is zero) so the spinor and field
  machinery is correct independent of the dynamics.
- **The experiment.** One file per question, self-contained, with a single command to run, a clear set of
  booleans, and a final line that states the result and its honest level.

## 7. How we verify and report

- **Self-audit as we write.** Every test is double and triple checked for circularity and surface-level
  cheating AT THE TIME it is written, not only later. We grade our own tests as harshly as a stranger's.
- **The adversarial audit.** A standing protocol re-runs each test under perturbation, traces every boolean,
  checks for a control, and assigns the depth level. A test passes only by surviving the attack.
- **The catalog.** Every test is recorded with its purpose, finding, depth, status, and validity. Circular and
  invalid tests are quarantined, they never appear in a results list as evidence.
- **The honest scoreboard.** Results are reported in tiers, the genuinely emergent, the confirmations of known
  physics, the honest negatives, and the open frontiers. The negatives are published, they are the integrity.

## 8. What we are striving for

The goal is not to accumulate green checkmarks. It is to find out, honestly, whether a single deterministic
reversible rule on a discrete crystal can produce the physics we see, and to know exactly where it does, where
it only reproduces what is already known, and where it fails or remains open. Every honest negative narrows
the search. Every confirmation earns the right to the next claim. The one thing we never do is fool ourselves.

A result is worth reporting when it could have come out the other way and did not, when there is a control that
could have failed and did not, and when an independent reader, running the same command, gets the same number.
Until then it is a consistency check or a work in progress, and we say so.

## See also

The experiment code in `code/experiment/`, the engine in `code/gpu/` and `code/rule/`, and the substrate
builders in `code/substrate/`. Each experiment file states its own purpose, method, and honest level in its
header.
