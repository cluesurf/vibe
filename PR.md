# The coarse bridge: the Born mechanism measured, and the frontier experiments

## Summary

Eight new experiments and two external-facing documents on the
adopted rule, opening and substantially closing the coarse-bridge
programme: the Born mechanism now exists in the model as measured
machinery (a phase-blind number-operator detector, a phase-to-number
port, an exactly linear port law), single-particle randomness is
located (deterministic per vacuum phase, distributed over the
ensemble), the kick generator is charge-signed, and the 24-species
speed spectrum is a mass hierarchy.

## What changed

- foundations/born-discriminator (E-FND-0123): the detector is
  exactly phase-blind. PASSES.
- foundations/number-operator-law (E-FND-0124): detection exactly
  linear in number at every occupancy. PASSES.
- foundations/port-conversion (E-FND-0125): the projective wall
  splits dressed-packet number by prepared phase, charge
  asymmetrically, null and translation controls exact. PASSES.
- foundations/linear-port-law (E-FND-0126): every packet composition
  transmits exactly the per-quantum linear sum. PASSES.
- foundations/born-ensemble (E-FND-0127): outcomes deterministic per
  preparation phase, distributed over the schedule ensemble, pinned
  regression values, determinism rerun exact. PASSES.
- foundations/charge-signed-kick (E-FND-0128): the same wall kicks
  particle and antiparticle by opposite units. PASSES.
- foundations/speed-spectrum (E-FND-0129): three exact massless,
  four exact at rest, seventeen interior species. PASSES.
- foundations/rest-spectra (E-FND-0130): the breather ladder
  survives the adopted rule, two of the four at-rest species exact
  E equals one half ladder states with machine-zero off-ladder
  power, two broadband as the control. PASSES.
- note/open/coarse-bridge.md: the programme note, including the
  window-artifact correction the port measurement survived.
- note/open/counting-signature-search.md: the quantum-hardware
  discriminator, prescription for outside analysts.
- note/open/graphene-registered-prediction.md: the full thread,
  registered before comparison, compared against Sulpizio et al.
  Nature 576, 75 (2019) with directional agreement on their central
  unexplained excess-curvature observation, then refit
  like-for-like under their protocol: kappa 1.16, fifteen percent
  above ideal, stable across resolved widths, with the
  falsification condition stated.
- task/: four permanent scripts (born-ensemble-sweep,
  port-conversion-probe, port-composition-sweep,
  poiseuille-width-sweep).

## How it was tested

Each experiment run individually via tmp/verdicts.ts, all passing,
typecheck clean. The full suite was NOT rerun on this branch (the
fast-iteration rule): the previous branch's suite ran fully green
(872 pass, 0 fail, 0 crash) on the same adopted rule, and these
seven experiments are additive.

## Honest status

- The Z three closure of the gauge algebra is open behind three
  MEASURED obstructions (mutual domain reshaping, configuration
  -global kick regimes, self-wake dressing of the Wilson loop),
  recorded in E-FND-0128's scope.
- The exact ensemble charge balance (32 equals 32) is measured-once
  at a marginal window and held open, not claimed.
- The speed spectrum's values are coarse effective speeds, pinned as
  regression values, not continuum masses.
- The graphene prediction is registered and uncompared.

## Follow-ups

- The dispersion relation proper (energy against momentum across
  scales) and the Z three closure, the two named continuations.
- The literature comparison for the registered graphene prediction.
- After merge: restore the pending ledger experiment codes,
  regenerate the scoreboard, run the full suite.
