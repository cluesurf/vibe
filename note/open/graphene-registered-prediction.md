# The graphene channel prediction, registered

The model's viscous electron-fluid sector, asked for a number a
laboratory can check. Registered 2026-09-02, before any comparison
against published profile measurements, so the prediction cannot be
tuned to fit.

## The measurement

The Poiseuille channel of E-FLD-0018's machinery (the saturated
viscous bulk, bounce-back walls, a decaying plug), swept over channel
widths 10, 14, and 18 cells, profile read at the mid-decay beat
(task-scripted at task/poiseuille-width-sweep.ts):

| bulk width | center-to-mean ratio | parabola fit R squared |
| --- | --- | --- |
| 10 | 1.611 | 0.816 |
| 14 | 1.554 | 0.996 |
| 18 | 1.570 | 0.994 |

## The prediction

For a viscous channel flow imaged at comparable effective Knudsen
number (channel width around ten to twenty mean free paths):

1. the velocity profile is parabola-like with fit quality above 0.99
   once the width passes about fourteen mean free paths, and
   measurably imperfect below that,
2. the center-to-mean ratio sits in the band 1.55 to 1.61, ABOVE the
   ideal no-slip Poiseuille value of 1.50 by three to seven percent,
   not below it (slip corrections push the ratio down, discreteness
   and near-ballistic corrections push it up, and the model says the
   second effect wins in this regime),
3. the excess over 1.50 does not vanish monotonically with width in
   this range (the measured band wobbles: 1.611, 1.554, 1.570).

Graphene experiments image exactly these profiles (Kelvin-probe and
single-electron-transistor imaging of channel flow). The comparison
requires matching the width-to-mean-free-path ratio, which the
experimental papers report. A measured center-to-mean ratio BELOW
1.50 in this regime contradicts the model's channel sector.

## Status

Registered, uncompared. The next step is the literature comparison
against the published profile images, which anyone can do with this
page and a ruler.

## First literature comparison (2026-09-02, same day, after registration)

The primary imaging experiment is Sulpizio et al., "Visualizing
Poiseuille flow of hydrodynamic electrons", Nature 576, 75 (2019),
which images Hall-field profiles across graphene channels and
quantifies them with a normalized curvature kappa (zero for a flat
profile, one for the ideal Poiseuille parabola reaching zero at the
walls), fit over the bulk of the channel. Their measured facts:

- kappa rises monotonically with temperature and falling density,
  APPROACHING the ideal value one at their hydrodynamic end (their
  best-fit Knudsen number there is 0.16).
- their central unexplained observation, quoted: at the highest
  temperatures the Boltzmann calculations "consistently
  underestimate the curvature of the Hall field profiles". The
  measured curvature exceeds standard kinetic theory.

Converting our registered band with kappa equals three times (one
minus one over the center-to-mean ratio): our 1.554 to 1.611 band is
kappa 1.07 to 1.14, ABOVE the ideal one, at an effective Knudsen
number near 0.1 (mean free path about one cell over widths ten to
eighteen), genuinely comparable to their regime.

The comparison outcome, stated carefully: the model natively
produces super-ideal curvature in exactly the regime where the
experiment's measured curvature exceeds standard theory, the one
directional anomaly the imaging paper reports. This is directional
agreement with an unexplained measured excess, not a quantitative
match: their published figure tops out near one while our band sits
seven to fourteen percent above it, our profiles are read over the
full width while theirs are fit over the central sixty percent, and
a like-for-like reanalysis (fitting our profiles over the central
sixty percent only) is the named next refinement before any claim
beyond direction.

Source: https://www.nature.com/articles/s41586-019-1788-9 (author
manuscript at the University of Manchester repository).

## The like-for-like refit (same day, the named refinement, done)

Refitting our mid-decay profiles over the central sixty percent of
the channel only, the Sulpizio protocol, with kappa defined exactly
as theirs (task/poiseuille-width-sweep.ts holds the machinery, the
refit is tmp-scripted and reproducible from the sweep):

| bulk width | kappa, central sixty percent fit |
| --- | --- |
| 10 | 0.574 (six fit points, under-resolved, the width-ten profile also had the poor parabola fit) |
| 14 | 1.165 |
| 18 | 1.155 |

The protocol-matched prediction, sharpened: deep in the Poiseuille
regime at Knudsen number near 0.1, the imaged curvature kappa
EXCEEDS the ideal value one by roughly fifteen percent, stable
across widths once the channel is resolved. Their published data
approaches one from below with the measured curvature already
exceeding their Boltzmann theory. If refined imaging or reanalysis
shows kappa saturating strictly at or below one in that regime, the
model's channel sector is falsified. If kappa crosses above one as
resolution improves, the model called it first, from a lattice gas
with nothing tuned.
