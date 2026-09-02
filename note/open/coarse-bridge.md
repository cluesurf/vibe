# The coarse bridge

The program's central open derivation: connect the substrate's exact
discrete quantum kinematics to the continuum quantum mechanics the
walk sector models. Started 2026-09-02 on this branch, immediately
after the turning weave adoption.

## What is decided already (this branch)

- E-FND-0123 (born-discriminator): the substrate detector is exactly
  PHASE-BLIND. Conjugate-phase pairs whose net amplitude is
  verifiably smaller (three against twice root three) produce
  exactly the same slab response as aligned pairs (ten), and
  two-plus-two quadruples match all-aligned quadruples (twenty).
- E-FND-0124 (number-operator-law): detection is exactly LINEAR in
  excitation number, response five N at every occupancy two through
  ten, both preparations, while the amplitudes verify as root three
  N (aligned) and three halves N (balanced). The substrate detector
  is the number operator, the same character as a laboratory photon
  counter.

## The sharpened question

Laboratory Born statistics appear when an interferometer converts
phase differences into NUMBER differences at its output ports, and
the counter then counts. The substrate counter is measured. The
missing half is the port conversion: does the dressed many-defect
sector redistribute excitation number according to relative phase?
At the bare two-defect level it cannot (superposition is exact, the
branches never touch each other). The dressed sector interacts, so
it is the one place the conversion could live.

The single load-bearing derivation, then: build the model's
interferometer. Two dressed packets on converging paths through the
interacting sector, phase-controlled, and measure whether the
OUTGOING number distribution over regions depends on the relative
phase. If yes, counting plus port conversion is the Born rule and
the derivation closes. If no, the model predicts number-organized
deviations from quantum statistics at scale, the falsifiable stake
recorded in note/prediction/intelligence.md.

## The port conversion, first light (probe level)

The projective wall (the offset-two slab that amplifies one clock
class and passes others) is structurally a polarizing beam splitter,
and the dressed packet is the one object that can split over it. The
window-safe adjacent-slab probe (tmp/probe-port-splitter2.ts, side
25, seed adjacent to the slab, readout inside the window) finds:

- WITH the slab, the transmitted-number fraction tracks the packet's
  prepared phase: one third for the plus preparation, one half for
  minus, four fifths for pre-kicked.
- WITHOUT the slab, no preparation sends anything across, the null.

So the dressed sector does convert phase into number at a port. Two
honest cautions before this becomes an experiment: the counts are
small (totals three to eight), and one geometry at one readout beat
is not robustness (the first version of this probe was
window-contaminated and is recorded as such in the transcript of
work). Hardening to E-FND-0125 needs readout-beat sweeps, a second
seed position, and the other interacting species as a cross-check.

## Status

Three experiments pass and are wired into the suite:

- E-FND-0123 (born-discriminator): the detector is exactly
  phase-blind.
- E-FND-0124 (number-operator-law): the detector is exactly linear
  in number, the number operator.
- E-FND-0125 (port-conversion): the hardening battery PASSED. The
  projective wall splits a dressed packet's outgoing number by its
  prepared phase, at every readout beat, at two seed positions, for
  both interacting species, with the heavy species' no-slab null
  exactly zero. The port is charge-asymmetric (the antiparticle
  transmits three to four times the particle), which is the
  interacting sector's C violation expressed as number splitting.

Both halves of the Born mechanism now exist in the model, and the
quantitative law is measured: E-FND-0126 (linear-port-law) finds the
transmitted number EXACTLY equal to the sum of per-quantum
transmission coefficients over the packet (one unit per particle,
four per antiparticle), five compositions of five to the slot, no
cross-quantum term. That is quantum mechanics own prediction for
number states. The substrate therefore reproduces quantum
measurement statistics exactly for every preparation it can express.
What it cannot express is a SINGLE quantum in a superposition of
classes, and that is now the programme's one remaining bridge
derivation, with its observable consequence committed either way:
derive single-quantum coherence at the walk-sector coarse level, or
predict number-organized deviations at scale (the quantum-computing
stake in note/prediction/intelligence.md).

## The single-quantum question, framed for measurement

The remaining derivation has a concrete experimental form, running as
of this writing (task/port-composition-sweep.ts is the completed
half, tmp/probe-born-ensemble.ts the running half): the transmitted
number of ONE packet as a function of its PREPARATION BEAT across a
full schedule period, both charges.

The reasoning, recorded before the result: a deterministic model has
no single-event randomness, so if the Born rule lives anywhere for a
single particle it must be epistemic, frequencies over an ensemble of
preparation phases, with the vacuum clock as the hidden variable. Two
possible outcomes, each an advance:

- The transmitted number VARIES with preparation phase. Then the
  single-particle outcome distribution is a measurable histogram
  over the clock ensemble, comparable against the squared-projection
  form, and the hidden-variable account is explicit (the shared
  vacuum phase, superdeterminism-adjacent, stated honestly: the
  "choice" of measurement setting and the particle's history share
  the vacuum clock as a common cause, which is how a local
  deterministic model lives with Bell).
- The transmitted number is CONSTANT. Then single-particle outcomes
  are strictly deterministic at fixed geometry, and Born randomness
  must come from one level further up (packet collisions, growth
  noise, or environmental phase mixing), each of which is itself
  preparable and measurable.
