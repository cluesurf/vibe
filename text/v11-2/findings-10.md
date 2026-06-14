# Findings 10, Scales, the Rarity Ladder, and Why Coarse-Graining Is Mandatory

The base is the right LAW, but it is the wrong LEVEL to compute anything large. You cannot run the whole universe
from the elements with today's technology, not remotely, so the theory reads physics at the right rung by
coarse-graining, the way you read a magnet from its effective field, not from every atomic spin. This file gives the
scale picture and why levels of detail are a necessity, not a convenience. Companion to `findings.md`. Cite
`\cite{pollard2026vibetest}`.

## The cosmic budget, almost all of it is dark and diffuse

The universe is mostly not ordinary matter. The energy budget is about 68 percent dark energy, 27 percent dark
matter, and 5 percent ordinary (baryonic) matter, the stuff atoms are made of. And the visible 5 percent is itself
mostly thin gas, only a sliver is in stars and planets.

| layer | share of the whole universe |
| --- | --- |
| dark energy | 68 percent |
| dark matter | 27 percent |
| ordinary matter | 5 percent |
| of which gas (intergalactic, halos, in-galaxy) | about 4.6 percent |
| of which stars | about 0.3 percent |
| of which planets and heavy objects | about 0.005 percent |
| all life (biomass, generous) | about `8.5e-15`, one part in 100 trillion |
| humans and civilization | far thinner still |

Read top to bottom, the universe is 95 percent dark, the visible part is mostly gas, stars are a third of a percent,
planets five-thousandths of a percent, and all life together is roughly one part in 100 trillion by mass. Each rung
is a rounding error on the one above. Why it matters, the things we care about, matter, life, mind, are vanishingly
thin films on a vast dark, diffuse, near-empty cosmos.

## The rarity ladder nests, and the theory predicts it

Each level is rarer than the one below by many orders of magnitude, and the rarity is the PRICE of organization, a
more organized pattern is more constrained, more expensive, so it occupies a thinner sliver. In the model this
ladder IS the coarse-graining tower (cosmos, matter, stars, planets, chemistry, life, mind), and it is tested, not
imported. The rarity cascade compounds multiplicatively, the fraction of charge reaching each rung (structure, then
an integrated self, then a persistent self) multiplies down to a tiny alive fraction, and the measured per-rung
factor over a cosmic number of rungs reproduces the one-in-100-trillion order, so the cosmic rarity is a PREDICTION.
Three independent measures agree, the integration spectrum is mostly low-organization churn with a roughly 2 percent
high-integration alive tail, the alive set is a thin lower-dimensional film (box dimension about 0.9 versus matter's
about 1.7), and condensation is gated by a critical charge density (almost nothing forms below it). Why it matters,
the steep nesting of rarity, long known observationally, falls out of the model's cascade as a measured prediction.

## The vibe reading of the dark budget

The three components map onto the base. DARK ENERGY is the wake, the mesh grows, net-positive birth gives an emergent
accelerating de Sitter expansion, so the energy of empty space is the energy of new docks appearing at the frontier.
DARK MATTER may be a geometric effect, gravity has a nonlocal channel through the tiny-diameter bulk that can mimic
unseen mass in galaxy dynamics without a new particle. ORDINARY MATTER is the rare, highly organized corner, the
bound excitations of the emergent field (the field-to-particle-to-atom tower). Why it matters, the standard budget
and the substrate line up, most of the universe is the growing near-empty mesh, the visible part is a thin organized
crust.

## The inversion, mass is the wrong yardstick

By MASS, life is one part in many trillions, negligible. But that is the wrong axis. By ORGANIZATION, information
processing, integration, self-awareness, life may be among the rarest and most intricate things the universe does, a
single biosphere holds more structured computation than vast regions of empty space. The two rankings are INVERTED,
what is a rounding error on the mass axis can be dominant on the organization axis. The theory takes the organization
axis as the one that matters, because the base thing is the vibe (experience), and mass is just a coarse derived
readout of bound organized energy, while integration and self-modeling and felt experience live on the organization
axis. Why it matters, the universe being almost all massless vacuum is exactly expected and irrelevant to value, by
the measure the theory cares about, integrated experience, life and mind are the richest thing the substrate does.

## Why coarse-graining and levels of detail are mandatory

A single self is about `3^(24 billion)` states, a number with ten billion digits, and the universe is astronomically
beyond that. The base law is exact and simple, but simulating any macroscopic thing dock by dock, beat by beat, is
impossible now and for any foreseeable technology. So the only way to do physics is to read at the RIGHT RUNG, coarse
grain the fine churn into an effective description (the charge field, then particles, then selves, then fields), and
use levels of detail, the fine law where it matters and the blurred effective law elsewhere. This is not a shortcut,
it is the only available method, the same way no one computes a magnet from every atomic spin but reads its smooth
magnetization, or computes a gas from every molecule but reads its temperature and pressure. What makes it VALID is
the renormalization fixed point, the rule is consistent across scales (block-spin coarse-graining flows to a fixed
point, charge exact at every level, the wave speed invariant), so the effective description at a coarse rung faithfully
captures the fine one. The honest caution, coarse-graining must be done correctly, a naive radial coarse-graining does
NOT spontaneously give a persistence tower (that claim was tested and retracted), so the right effective variables
matter. Why it matters, the theory is a LAW, not a full simulation of everything, and its predictions come from the
correct effective rung, so coarse-graining is the load-bearing method by which a discrete base touches observable
physics at all.

## The two-layer principle restated for scale

The base is discrete and exact. Everything observable is emergent and effectively continuous, the coarse-grained
average of enormous numbers of discrete grains. You do not see the trits, you see the field they average to, you do
not see the beats, you see the smooth time they sum to, you do not see the docks, you see the space they tile. The
self's living dynamics, the fields of physics, spacetime, gravity, all live at the effective layer, which is why they
look continuous though the base is not. Why it matters, the apparent continuity of the world is the signature of
coarse-graining over a discrete law, which is both the theory's claim and the reason it must be computed by levels of
detail.

## Where to look (code and experiments)

- The cosmic budget and the rarity cascade: `cosmology/rarity-measures`, and the rarity-cascade and integration-
  spectrum results (P181, P183), with the dark-energy expansion in `cosmology/growth-expansion` and the dark-matter
  nonlocal-gravity channel in the gravity experiments.
- Why coarse-graining is valid (the fixed point): `renormalization/coarse-graining-fixed-point`,
  `renormalization/coarse-graining-chain`, `renormalization/emergent-macro-rule`, and the honest retraction
  `selves/selves-tower-3434` (naive radial coarse-graining gives no tower).
- The scale picture in prose: `theory-v0.7.0/notes/.../cosmic-composition.md`, `the-coarse-graining-chain.md`.