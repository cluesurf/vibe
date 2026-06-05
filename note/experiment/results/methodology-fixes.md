# Methodology Fixes

Measurement bugs found and fixed while iterating on the first runs, recorded so
the results are trustworthy. A measure that is silently wrong is worse than no
measure, so each of these was caught by a known-answer test or an experiment that
gave a physically impossible number.

## 1. Myrheim-Meyer dimension coefficient

**Symptom.** A 2D Minkowski sprinkling recovered dimension 3.0 instead of 2.0.

**Cause.** The ordering-fraction formula used the constant 3/2, which gives
f(2) = 1.5, an impossible value for a probability. The dimension estimator was
calibrated against a wrong curve.

**Fix.** The correct constant is 1/2. Check: f(1) = 1 (every pair on a line is
causally related) and f(2) = 0.5 (two points in a causal diamond are comparable
with probability one half, derivable directly in light-cone coordinates). With
the corrected curve, a 2D sprinkle recovers 2.0 and a 3D sprinkle recovers 3.0.

## 2. Sprinkling was not uniform-by-volume

**Symptom.** Even after fixing the constant, the recovered dimension was biased,
because the causal order was too dense.

**Cause.** The sprinkler sampled the time coordinate uniformly, then sampled space
inside the diamond at that time. Uniform-in-time is not uniform-by-volume: it
over-weights the thin tips of the diamond and distorts the causal order, so the
process is not Poisson and not Lorentz invariant.

**Fix.** Rejection sampling. Draw a candidate uniformly in the bounding box and
accept it only if it lies inside the diamond. This is a true uniform-by-volume
(Poisson) sprinkle. Dimension recovery became sharp (P5: 3.02 plus or minus 0.05).

## 3. Lorentz anisotropy statistic

**Symptom.** A regular lattice read as isotropic (anisotropy 0.000), the opposite
of the truth.

**Cause.** The statistic was the mean resultant length of nearest-link
directions. For a lattice the directions point symmetrically along the axes (plus
and minus x, plus and minus y), so they cancel and the mean is zero, even though
the distribution is maximally concentrated at a few discrete angles. Mean
resultant length measures net drift, not axis concentration. Also, the test used
2D substrates, which have only one spatial axis, where no preferred direction can
exist at all.

**Fix.** Use angular Fourier order parameters: the magnitude of the average of
e^{i m theta} for m in {2,3,4,6} over the first two spatial axes. A square lattice
has a strong 4-fold component (anisotropy 1.0), a sprinkling has none (about
0.06). The measure now requires at least two spatial axes (3D Minkowski or 2D
Euclidean), and the experiments use 3D substrates.

## 4. Exponential-reach detection

**Symptom.** A 2D lattice was reported as having exponential reach (false
positive) and a `{5,4}` tiling as not (false negative).

**Cause.** The detector used the late-radius log-slope of ball growth. On a finite
substrate the ball saturates (it cannot exceed the total size), driving every
late slope toward zero, which masks true exponential growth and confuses
polynomial growth.

**Fix.** Use successive ball-count ratios in the unsaturated regime only (counts
below 60 percent of the final size). Exponential growth keeps the ratio
multiplicative and roughly flat, polynomial growth has ratios that decay toward 1.
The tiling and the well-connected hyperbolic graph now read as exponential, the
lattice and sprinkling as not.

## 5. Dirac zero modes are in the middle of the spectrum

**Symptom.** P4 reported zero near-zero modes, with the lowest eigenvalues all
around -2.7.

**Cause.** The Dirac operator is indefinite, with a spectrum symmetric about zero,
so its zero modes sit in the MIDDLE of the spectrum. The Lanczos solver returns
the extreme (most negative) eigenvalues, which are the bottom of the spectrum, not
the zero modes.

**Fix.** Square the operator. The smallest eigenvalues of D squared are the
smallest values of |eigenvalue of D|, the near-zero modes. P4 now finds exactly
one zero mode on the 2D mesh.

## 6. The CHSH model locked the two wings together

**Symptom.** P7 gave S near 0 for every setting correlation, so the
superdeterminism climb never appeared.

**Cause.** The setting-bias used the same function of the hidden state (sign of
sin(2 lambda)) for both wings, so the A and B settings were perfectly correlated.
Only two of the four setting pairs were ever sampled, and the other two
correlators were always zero.

**Fix.** Bias each wing with a different function of the hidden state (sin for A,
cos for B), so all four setting pairs are reachable. With a constructed
superdeterministic outcome model, S now climbs cleanly from about 1 at
independence to 4 at full correlation, crossing the classical bound near
correlation 0.5.

## The lesson

Every one of these produced a wrong but plausible-looking number that only a
known-answer check caught (recover the dimension of a sprinkle, lattice must beat
a sprinkle on anisotropy, CHSH must respect the bound at independence). The test
suite is the reason the results above can be trusted. Keep adding known-answer
tests before trusting any new measure.
