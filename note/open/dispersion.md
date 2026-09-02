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

## Named next steps

1. Calibrate the Kac masses against a physical species (the
   lightest charged dressed species as the electron) to set the
   lattice scale, the effective-theory step.
2. The full 17-species Kac mass table (the interior of the speed
   spectrum), which would be the model's mass spectrum proper.
2. The heavy species' core structure at finer resolution.
3. Z three closure via the algebraic route (the charge-signed
   generator of E-FND-0128 acting on the three-class orbit).
