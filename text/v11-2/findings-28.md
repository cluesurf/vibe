# Findings 28, Quantum Foundations and the Interpretation of Measurement

How a LOCAL, DETERMINISTIC, DISCRETE base produces genuine quantum mechanics, where the complex amplitude and its `i`
come from, what a measurement is when nothing collapses, and how a local rule reaches the Bell ceiling that local
theories are supposed to be barred from. The honest obstructions (contextuality, the Wallstrom phase, spatial
reflection positivity) are named. Companion to `findings.md`, extends `findings-5.md` and `findings-17.md` (Born and
CHSH) and `findings-26.md` (reversibility gives unitarity). Cite `\cite{pollard2026vibetest}`.

## What is reproduced

The base carries no probability and no complex numbers, yet the quantum results come out measured.

| quantum fact | base result | control |
| --- | --- | --- |
| the Born rule | `|c|^2` matched to under 0.01, the exponent forced to 2 by quadrature additivity | `p = 1` and `p = 3` both fail additivity |
| interference | a unitary quantum walk shows 14 fringes with genuine near-nodes (destructive cancellation) | the classical stochastic shadow is one smooth hump |
| unitarity | total `|psi|^2` stays 1 to machine precision (norm error under `1e-9`) | a dissipative rule leaks |
| the Bell value | CHSH reaches `2 sqrt 2` (about 2.83), the Tsirelson bound | a separable product control stays at 2 |
| ballistic spread | quantum walk spreads as `v ~ t` (ratio 4.5) | the classical walk spreads as `sqrt t` (1.9) |

Why it matters, interference and the Born rule are SHOWN, not inferred, so the dynamics is a genuine quantum field, and
its classical stochastic shadow has neither, which is the sharp difference between the two. (`findings-5.md`,
`findings-17.md`, `quantization-status.md`.)

## Where the wavefunction and the `i` come from

The wavefunction is NOT a fundamental object on configuration space, it is the coherent-state representation of the
Hermitian spin-1 exchange Hamiltonian that the knit becomes in the continuum. The route is Madelung and Nelson, a
quantum particle is described by two real velocities, a current velocity `v = grad S` (which is exactly the continuity
the conserved knit already enforces, `S` the shared beat-phase) and an osmotic velocity `u = D grad ln rho` (the drift
down the density gradient, which the arrow plus diffusive spreading supplies). The complex combination `v - i u` packs
into `psi`, and the Schrodinger equation follows at the frictionless, time-reversible point. The `i` itself is the
spin Berry phase of the spin-1 site, the ninety-degree relation between the conserved current and the entropic drift,
which is the precise derived answer to the old question of where the quantum `i` comes from. Why it matters, the
complex amplitude is not posited, it is geometry, two of the base's own ingredients (the conserved current from the
knit and the entropic drift from the arrow) are exactly Nelson's two velocities, and their ninety-degree relation is
the `i`. (`bridge-theories-vibe-to-field.md`, `doi-peliti-transcription.md`.)

## Why the field theory is quantum, not dissipative

The exact field theory of the knit is given by the Doi-Peliti construction straight from the conserved exchange, with
no guessing of the effective theory. A Doi-Peliti generator is generically NON-Hermitian, which would give a
Euclidean, dissipative field theory, not a unitary quantum one. What saves it is the reversibility. The dynamics
satisfies local detailed balance (the create move and its annihilation are the forward and reverse of one balanced
reaction) and global reversibility (no persistent circulation), and detailed balance is EXACTLY the condition that
turns the dissipative Doi-Peliti generator into a genuine Hermitian quantum Hamiltonian. Reflection positivity, the
test that a Euclidean theory Wick-rotates to a real quantum one, passes in the time direction. Why it matters, the
quantum-ness is earned, the measured reversibility is the precise property that promotes a statistical field theory to
a quantum one. (`quantization-status.md`, `doi-peliti-transcription.md`.)

## Measurement, settling not collapse

There is no wavefunction collapse and no observer postulate. A definite outcome is the deterministic dynamics SETTLING
into a definite state, a relaxation of the internal attractor. A coherent body does not flip instantly when new
neighbor influences arrive, its internal tones must re-reach consensus before it emits a new collective tone, and the
number of beats that takes is the settling time. From the inside that interval is experienced as weighing options,
from the outside it is a deterministic relaxation, both true at their scale. The appearance of a definite classical
record is decoherence read as coarse-graining, the fine phase information leaks into the unwatched bath and the
Markov-blanket boundary of a self screens its interior from its exterior, so the coarse description sees a single
outcome. Why it matters, the measurement problem is dissolved rather than postulated, a measurement is the body
relaxing to a definite state and the phase information going into the bath, no special collapse law.
(`10-choice-determinism-relaxation.md`, `bridge-theories-vibe-to-field.md`, `findings-3.md`.)

## Locality, determinism, and the Bell ceiling at once

The base is local (the knit touches only a dock and its neighbors) and deterministic (a reversible bijection), yet
CHSH reaches `2 sqrt 2`, above the local-hidden-variable cap of 2. The mechanism is a SHARED PAST, a common cause in
the hyperbolic bulk. An aligned shared past buys the violation (`S > 3.5`) at the SAME mutual information as a
misaligned past gives no violation (`S < 1.5`), so what carries the quantum correlation is the structure of the
correlations, not extra information. This is not many-worlds (no branching is posited), not collapse (nothing
collapses), and not superdeterminism (there is no measurement-dependence or future-conditioning). It is closest to a
deterministic, common-cause, relational reading, locality holds at the fine tone scale while the effective field
correlations look non-local because of the holographic bulk-boundary map. Why it matters, the model occupies a corner
Bell's theorem is usually read to forbid, a local deterministic base that still reaches the exact quantum ceiling, by
putting the correlations in a shared bulk past rather than in hidden local variables. (`findings-17.md`,
`quantization-status.md`, `findings.md`.)

## The path integral and the double slit

The path integral is the spin coherent-state action of the spin-1 Hamiltonian, `S = integral dt [ i (Berry phase, the
area swept on the spin sphere) - H ]`, equivalently the Janssen-De Dominicis response-field action whose Wick
rotation to the unitary form is licensed by reflection positivity. It is a sum over spin-sphere trajectories with
Berry-phase weighting, not a sum over classical position paths. The double slit is implicit in the wave spreading, a
localized lump is a superposition of many momenta so it disperses as a quantum wavepacket, and the measured
interference (14 fringes versus one classical hump) is genuine amplitude addition with cancellation. Why it matters,
interference and the path-integral structure are present in the right field-theoretic form, so the quantum phenomena
are not mimicked classically. (`doi-peliti-transcription.md`, `the-unified-wave.md`, `quantization-status.md`.)

## The honest obstructions

Three things are genuinely not yet settled, and the model says so.

- CONTEXTUALITY. The Kochen-Specker and PBR theorems and complementarity are not yet addressed. The ternary tone
  carries a definite value at each site, which looks like a non-contextual value assignment, so the precise way the
  model evades the contextuality no-go (via the relational, effective-field reading rather than fixed underlying
  values) needs to be worked out explicitly.
- THE WALLSTROM PHASE. Any stochastic-mechanics route to the Schrodinger equation needs the phase to be
  single-valued, the circulation quantized in units of `2 pi`. This is the standard Wallstrom obstruction, and whether
  the `{3,4,3,4}` topology and the discrete beat-phase enforce quantized circulation is flagged but not yet proven.
- SPATIAL REFLECTION POSITIVITY. The quantum-compatibility test passes in the time direction, the full spatial
  reflection positivity at criticality is the crux and is unrun.
- THE SECOND CONSERVATION LAW. The conserved knit gives one conserved charge (`U(1)`), but a truly relativistic
  massless mode needs a second conservation (momentum, inertia) on top, the same `z = 1` hinge noted for the photon
  (`findings-23.md`).

Why it matters, the quantum derivation is far along (Born, interference, unitarity, CHSH, the `i` from geometry) and
honest about the remaining proof obligations, contextuality, the Wallstrom phase, spatial reflection positivity, and
the second conserved current.

## The one-line reading

A local deterministic reversible knit becomes, through Doi-Peliti and Madelung-Nelson, a genuine Hermitian quantum
field whose `i` is the spin Berry phase and whose probabilities are the Born rule, measurement is the body settling to
a definite state while the phase leaks into the bath (no collapse), and the Bell ceiling `2 sqrt 2` is reached through
a shared bulk past rather than hidden local variables, with contextuality, the Wallstrom phase, and spatial reflection
positivity named as the open obligations.

## Where to look (notes)

- The quantization pipeline and reversibility-gives-unitarity: `quantization-status.md`, `doi-peliti-transcription.md`,
  `bridge-theories-vibe-to-field.md`.
- Born, interference, the unified relativistic wave: `the-unified-wave.md`, `findings-5.md`, `findings-17.md`.
- Measurement as settling, decoherence as coarse-graining: `10-choice-determinism-relaxation.md`, `findings-3.md`,
  `findings-26.md`.
- The Bell mechanism (shared past): `findings-17.md`, `findings.md` (the quantum section).