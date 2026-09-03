# The dispersion programme

Branch experiment/dispersion, opened 2026-09-02 after the coarse
bridge merged (PR 56). The goal: turn the speed spectrum
(E-FND-0129) and the rest spectra (E-FND-0130) into a genuine
omega-against-k account of the adopted rule, the effective-field-
theory reading of the model.

## Done on this branch

- E-FND-0131 (spectral-function), PASSING: the spectral function
  A(k, omega) measured for three species with a comb-seeded spatial
  mode and temporal Fourier analysis. The massless species is a PURE
  POLE (one hundred percent share in a single line at exactly omega
  equals k times light speed, every wavevector, the instrument
  control). The heavy species is a narrow quasiparticle peak. The
  dressed species is POLE PLUS CONTINUUM, a central peak with a
  radiation branch at omega near k times light speed at all three
  gated wavevectors, the standard interacting-field-theory spectral
  shape, from the one rule.

## The measured limitation, recorded

The mass-from-curvature extraction (peak position against k at
resolution one over ninety-six) reads both interacting species'
central bands as FLAT within resolution (phase velocity below one
percent of light speed), even though their transport centroids drift
at fifteen to twenty-seven percent (E-FND-0129). The A_k projection
weighs every difference slot equally, so the slow dressing cloud
dominates the band while the drifting core is a subdominant
component. The naive projection therefore measures the CLOUD band,
and band curvature (the dressed mass proper) sits below its floor.

## Done, continued: mass is zitterbewegung (E-FND-0132)

The core-weighted projection (next step one) immediately paid off,
PASSING as E-FND-0132: projecting A_k on the seeded slot only, the
dressed species' bare band rides within twenty percent of light
speed at every wavevector while its composite transport drifts at
twenty-seven percent of it (E-FND-0129), with the massless control
exact at share one point zero zero. The bare quantum always moves on
the cone, and effective mass is the dressing cloud continually
redirecting it: Dirac's zitterbewegung account of mass, measured
with both speeds from one rule. The heavy species shows no single
clean core band at this resolution, reported as the honest scope.

## The naive churn formula, measured false (recorded)

The first candidate mass formula (composite velocity equals the
occupancy-weighted mean of the cone velocities of the difference
content, task/churn-formula-probe.ts) FAILS honestly: the massless
control is exact (one point zero zero zero both ways), but the
interacting species drift two to three point six times FASTER than
the formula predicts. The static cloud content dilutes the
occupancy average while the actual front advances. So the true
formula must separate the moving core from the sessile cloud before
averaging, which is the same core-versus-cloud decomposition the
band measurements needed. The zitterbewegung mechanism stands
(E-FND-0132), its quantitative formula does not yet.

## SOLVED: the general instrument, and the first numerical masses

The step back the cloud problem demanded produced the general
solution in two measured stages:

- E-FND-0133 (zitterbewegung-cycle, PASSING): the front NEVER moves
  at any speed except exactly plus or minus light speed, eighteen of
  eighteen interacting beats and nine of nine massless beats, with
  only the direction flipping at species-specific schedule beats.
  Velocity is a TELEGRAPH PROCESS.
- E-FND-0134 (kac-telegraph-mass, PASSING): Kac's classical result
  (a plus-minus-c telegraph walk with flip rate gamma obeys the
  relativistic wave equation with m equals hbar gamma over c
  squared) turns mass into flip COUNTING. Measured: the massless
  control's only flips are wrap-seam dips spaced in exact lattice
  laps (true rate zero), the middleweight's Kac mass is 0.102
  lattice units, the heavy's 0.137, the ordering right, and the
  telegraph sign fraction reproduces both measured composite speeds
  within fifteen percent of light speed.

The general lesson, worth stating as method: when a slow background
drowns a spectral band, convert the curvature question into counting
statistics of an exact kinematic law. Band curvature needed windows
of hundreds of beats the cloud contaminates; flip counting needed
forty-seven.

## The mass table (E-FND-0135, PASSING)

The full-spectrum table landed with three structural findings:

- DEGENERACY BY RESIDUAL SYMMETRY (label corrected after a geometry
  check): the exact pair (twenty-one, twenty-two) is a LINE, the
  charge-conjugate opposites, identical records to the integer,
  which is the particle-antiparticle mass equality CPT requires. The
  near pairs (eight-nine, five-seven, ten-eleven) are MIRROR
  partners, one flipped coordinate. Mass respects the schedule's
  residual reflection symmetry, exactly on lines, approximately on
  mirrors.

## The lattice calibration, first pass (honest)

Setting the lightest well-measured charged species (mass 0.086
lattice units) equal to the electron gives a lattice mass unit near
six MeV, which puts every species in the table between about half
an MeV and one MeV: the bare Kac spectrum spans only a factor of
two, NOWHERE NEAR the observed fermion hierarchy of five orders.
Stated plainly: the flip-counting mass is the MECHANISM of inertia,
not the origin of the hierarchy. That is consistent with the
standing ledger position (the hierarchy SHAPE comes from warp
localization, E-FRC-0067, with absolute Yukawas free), and it
sharpens where each piece lives: zitterbewegung makes mass exist,
localization makes it hierarchical. The calibration that matters
will pair the Kac mechanism with the localization factor, the named
joint continuation.
- THE MASSLESS FLOOR EXACT: both trackable massless directions show
  exactly three isolated lap dips (the wrap seam of a speed-one
  walker on a side-seventeen torus) and nothing else.
- THE HIERARCHY: well-measured species span about 0.09 to 0.18
  lattice units, sixteen of twenty-four species well measured.

## The joint factorization (E-FND-0136, PASSING): the summit reached

The Kac band and the warp ladder together account for the
charged-lepton hierarchy PATTERN. With species prefactors required
to lie in the measured Kac band (spread 2.07), the integer warp
depths nine, five, three fit the three lepton Yukawas (required
spread 1.76), every single-step deviation is excluded (2.65 to
7.51), and uniform shifts are exactly scale-degenerate, so the
relative pattern of four then two steps is uniquely selected. The
E-FRC-0067 negative (non-integer depths under a uniform prefactor)
was the shadow of the missing Kac factor. Stated as consistency and
uniqueness of pattern, not derivation: the species-to-lepton
assignment, the origin of the four-two pattern, and the overall
scale remain open, and a future Kac-band narrowing below 1.76 would
falsify the joint account, the number to watch.

## The assignment scan, with the look-elsewhere verdict (recorded, not gated)

Scanning all ordered triples of well-measured Kac masses against the
required prefactor ratios (1.088, 1.757), exactly ONE triple fits at
one percent tolerance: tau on direction twenty-three, muon on ten,
electron on eighteen, worst ratio error 0.88 percent. The honest
referee is the tolerance curve: one triple at one percent, six at
two, ten at three, which puts the chance expectation at one percent
near ONE. So the assignment exists and is unique at tight tolerance
but is statistically consistent with coincidence, and it is recorded
here rather than gated as an experiment, per the house discipline.
What would promote it: an independent property check of the assigned
species (the scan is permanent at task/lepton-assignment-scan.ts,
and the assigned electron species, direction eighteen, is the
heaviest and noisiest row of the table, which is itself a reason for
caution). 

## The depth-origin options, worked through (D, B, C, A)

- D (Koide): CIRCULAR, documented. Every ratio-fitting triple lands
  within 0.22 percent of two thirds, so Koide is implied by the
  ratio fit and checks nothing new (task/koide-circularity-check.ts).
  The genuinely independent structural observation: the unique
  one-percent triple picks exactly one direction from each of the
  three w-containing planes (chance near four percent).
- B (schedule arithmetic): the pre-registered candidate (depth
  proportional to swap-carry) FAILS, recorded.
- C (symmetry classes): the swap-carry count partitions the 24
  species into exactly THREE OCTETS (carries two, four, six), the
  generation-count structure from pure schedule counting. The
  partition crosses the mass bands (the three massless species land
  in three different tiers), so it is a FLAVOR-like label
  independent of mass, the same relation generation labels have to
  mass eigenstates (task/swap-carry-tiers.ts).
- A (dynamical localization): WORKS, formalized as E-FND-0137
  (warp-localization, PASSING). A growth-written birth-time gradient
  is the model own clock-rate warp, and settling in it is species
  specific: direction eighteen is the UNIQUE deep locker (minus
  seven, zero spread), four species pin at exactly zero, the
  massless control never localizes. The assigned lepton triple
  orders monotonically in assigned depth with both extremes
  dynamically locked, the independent property check the assignment
  scan asked for. The assignment now stands on four independent
  legs, still short of established pending the sharpened Kac band.

## Named next steps

1. The precision Kac table (running in background) re-judges the
   band and the 1.76 falsifier; early rows show large size shifts,
   so the side-seventeen values were not converged, exactly why the
   program exists.
2. Make settling depth QUANTITATIVE (steeper or deeper gradients,
   longer settling, larger meshes): if measured settling depths
   reproduce nine, five, three, the depth pattern becomes dynamics
   and the lepton hierarchy closes with no fitted integers at all.
3. Option E (coarse-graining lifetime) was probed and is
   UNINFORMATIVE at the single-excitation level: sparse clouds (one
   or two slots per cell) die in one smoothing round for every
   species, no discrimination (task/coarse-survival-probe.ts). The
   informative version needs dense condensate states, a real arc,
   deferred with the reason stated.
2. The heavy species' core structure at finer resolution.
3. Z three closure via the algebraic route (the charge-signed
   generator of E-FND-0128 acting on the three-class orbit).
