# Findings 25, The Bulk, the Cusp, and the Beginning

The finite-and-growing mesh versus the idealized infinite limit, the flat cusp and how much of it is real, whether
there was a seed, how long ago, and what is left open. The whole picture of the model's relationship to infinity and
to the beginning of time, distilled from the notes and stated in the final terminology. Companion to `findings.md`,
extends `findings-5.md` (cosmology), `findings-7.md` (the nothing-bootstrap), and `findings-10.md` (scales). Cite
`\cite{pollard2026vibetest}`.

## The headline, in one breath

The bulk is finite at every beat and grows forever, so it is never complete, and that incompleteness is not a flaw,
it IS the expansion of space, the open future, and the arrow of time. The flat 3D cusp we live in is EXACTLY flat at
every finite distance (a theorem about horospheres), so flatness needs no infinity. What needs infinity is only the
PERFECT periodic cusp crystal, which is an idealization in the exact sense that an infinite crystal is an idealization
in solid-state physics, the finite chunk is locally identical to it and the physics converges long before any edge.
The gap between the finite real mesh and the idealized infinite limit is small, measurable, and is precisely where the
theory becomes falsifiable. Whether there was a first beat (a seed) or no beginning at all is left HONESTLY OPEN, the
forward fate (grow forever) is committed, the backward origin is not.

## Two different infinities, keep them apart

The single word infinity hides two very different things, and most confusion comes from mixing them.

| the infinity | what it is | is it real in the model |
| --- | --- | --- |
| the boundary at infinity | the ideal 3-sphere that an infinite H4 bulk would approach, where the cusp's ideal vertex sits | NO, a limit, never attained |
| the growth frontier (the wake) | the current outermost shell of docks, the ones just born, finite and moving outward each beat | YES, this is the boundary the mesh actually has |

Static holography (AdS/CFT) uses the first. The vibe mesh has only the second. The wake is a finite shell of docks
that expands every beat and never arrives at the ideal boundary. Why it matters, every statement about the cusp being
at infinity is a statement about a LIMIT the growing mesh approaches, never a place the mesh reaches, and the real
boundary is the finite, moving wake. (`the-holographic-boundary-explained.md`.)

## The bulk is finite and growing, never perfect, and that is the point

At every beat the mesh is a finite chunk with a finite dock count and a finite radius. It grows one shell per beat at
the wake, at rate about 18.28 per radius for `{3,4,3,4}` (the Perron eigenvalue, `findings-1.md`), so it explodes
outward but is finite at every instant. The COMPLETE cusp, the infinite `{4,3,4}` cubic honeycomb wrapped around an
ideal vertex, is never reached, and it does not need to be.

The reframing is the key move. The never-reaching IS the physics. A finished, completed cusp would be a static,
finished, time-less universe. The incompleteness is what makes the cosmos living, expanding, and time-having. More
cusp chunk each beat is the expansion of space, the unending growth is the openness of the future, and the single
growth direction is the arrow of time. So three things physicists usually treat separately, the time STEP, time's
ARROW, and the EXPANSION of the universe, are one fact here, the mesh growing. Why it matters, the model does not bolt
on cosmic expansion or an arrow, they are the same act as the ticking of the clock.
(`theory-v0.6.0/physical-space-finiteness-and-growth.md`, `expanding-from-nothing.md`,
`theory-v0.6.0/finite-vs-infinite-comparison.md`.)

## The cusp is flat at every FINITE distance, not only at infinity

This is the crucial correction to the worry that space is only flat at infinity. A horosphere in H4 is intrinsically
isometric to Euclidean E3 EXACTLY, at every finite level, this is a standard theorem, not a hope. Two pictures of why,
a horosphere is a sphere whose center has run off to the boundary (an infinite-radius sphere, flat like the Earth
looks flat because it is huge), and it is a cylinder kind of surface, extrinsically curved through the bulk but
intrinsically flat (you could unroll it with no stretching). The measurement confirms it, the extracted horosphere
band grows POLYNOMIALLY (intrinsic growth ratio about 1.52, shells 1, 10, 19, 37, 53, ...), the signature of a flat
space, while the bulk around it grows about 9x per shell (exponential). So flatness is real, finite, and exact, it is
NOT the thing that needs infinity. (`flat-at-the-edge-explained.md`, `cusped-hyperbolic-manifolds.md`,
`theory-v0.6.0/physical-space-finiteness-and-growth.md`, Q1.)

## "It does not need infinity, just a finite chunk", done correctly

The intuition that the idealized cusp does not need literal infinity, only a finite piece, is RIGHT, but with one
honest correction about how to get it.

What is exactly true at finite size. The local `{4,3,4}` cubic structure is exact at every finite dock of the cusp
region. Physical law (waves, particles, gravity) only ever sees the LOCAL lattice, which is present at every finite
point. This is exactly the finite-crystal situation in ordinary physics, no real crystal is infinite, yet solid-state
physics uses the infinite-lattice idealization (Bloch bands, phonons) because a large finite crystal is locally
identical to the infinite one and bulk properties converge long before any edge. The infinite cubic cusp is that
idealization, the finite mesh holds an ever-growing chunk of it, and you never need the completed cusp, only the local
lattice. The convergence is fast and measured, the cusp's spectral dimension reaches a clean 3 (2.97 to 2.99) at a
modest side length, and the emergent gravity exponent converges toward `1/r` by side about 17.

| cusp side L (docks) | dock count | spectral dimension (target 3) | gravity exponent (converging) |
| --- | --- | --- | --- |
| 5 | 125 | 2.58 (rough) | 2.06 |
| 7 | 343 | 2.88 | 1.61 |
| 11 | 1331 | 2.99 (clean 3D) | 1.34 |

The honest correction about HOW. A finite patch of "a few reflection rings" grown by breadth-first search will NOT
show the cubic cusp on its own, because a BFS reflection shell is COMBINATORIAL distance (how many mirror steps from
the seed), not a horosphere (geometric equidistance toward an ideal point). To see or run physics on the cusp you must
explicitly extract a horospherical section and normalize the tangential metric, or build the cubic E3 lattice directly
as the cusp. Once you do, finiteness is plenty, the clean 3D behavior is there at the modest sizes in the table above.
So the slogan is precise, flat space is the tangential horosphere limit and it is exact at finite distance, the radial
bulk stays hyperbolic, and a finite reflection patch APPROXIMATES the cusp while a properly extracted finite
horosphere chunk already IS clean 3D. Why it matters, the cusp is buildable and testable at finite size, infinity is a
convenience for the perfect crystal, not a requirement for the physics. (`asymptotic-euclidean-on-horospheres.md`,
`theory-v0.6.0/cusp-problems-and-sufficiency.md`, `theory-v0.6.0/physical-space-finiteness-and-growth.md`.)

## What "never perfect" means, the anomaly ledger

Because the real mesh is finite and discrete rather than the infinite ideal, there are exact edges to the
idealization. Each edge is a small, definite departure from perfect continuum physics, and in this framework these
departures are FEATURES, they are predictions.

| edge of the idealization | what it is | the effect |
| --- | --- | --- |
| discreteness (a shortest length, the dock size) | a UV cutoff | tiny deviations from exact Lorentz symmetry at the smallest scales |
| finite size (a finite count of beats and shells) | an IR cutoff | a largest scale, a cosmological horizon, a finite age |
| cubic anisotropy of the `{4,3,4}` cusp | order-4 anisotropy of the cubic lattice | a small `(k a)^2 = (E / E_cutoff)^2` Lorentz-violation that vanishes in the IR |
| aperiodicity of a generic horosphere | a generic slice is not aligned with a parabolic ideal vertex | small statistical fluctuations in the local geometry (a degree spread) |

A subtlety worth keeping. The BULK directions are the 24-cell (D4, isotropic to order 4, the good geometry), but the
CUSP where matter actually propagates is the cubic `{4,3,4}` (anisotropic at order 4), so the residual anisotropy is
the cusp's and is NOT protected by the bulk F4 symmetry. It is measured at about 8 percent axis-versus-diagonal at
wavevector `k a` about 1.2, and it dies as `(k a)^2` toward long wavelength, so physics is isotropic 3D in the IR with
a small testable UV residual (roughly `1e-40` at GeV energies, comfortably inside current Lorentz bounds). Why it
matters, our own universe is observationally only approximately flat (to about 0.4 percent) with a finite age, so an
exactly-flat-only-in-the-limit, finite, discrete space is a MATCH, not a contradiction, and the small misses are
exactly the falsifiable content. (`theory-v0.6.0/physical-space-finiteness-and-growth.md`,
`theory-v0.6.0/cusp-problems-and-sufficiency.md`.)

## What the finite-versus-ideal tension PREDICTS

Reading the ledger forward gives concrete, falsifiable predictions.

- A tiny UV Lorentz violation scaling as `(E / E_cutoff)^2`, from the cusp's cubic anisotropy plus discreteness, the
  sharpest near-term handle, constrained by gamma-ray-burst timing and other Lorentz bounds.
- Large-scale isotropy in the IR with a small preferred-frame residual, the question of whether physical space sits on
  a clean parabolic cusp (cubic, faintly anisotropic) or a generic horosphere (aperiodic, isotropic) is observationally
  meaningful and currently open.
- A finite age and a horizon for free, a finite mesh has grown a finite amount from its origin, so there is a largest
  observable scale.
- An expanding, de Sitter-like cosmos, the flat spatial slice grows per beat as `a(t)` about `e^(H t)` with `H` about
  `0.80` per beat (`H = ln(R) / 3`), giving `Lambda = 3 H^2`, so dark energy is the energy of new docks appearing at
  the wake (`findings-5.md`, `findings-10.md`).
- No Big-Bang singularity, discreteness caps the curvature, so there is no infinite-density first instant even if
  there was a first beat (`findings-5.md`).

Why it matters, the very feature that looks like a weakness, that the mesh is never the perfect infinite ideal, is the
source of the model's testable predictions, the theory lives in the gap.

## The seed and the beginning, a genuine open question

Did time begin? The model holds two pictures side by side and does NOT force a choice. This is one of its few truly
open structural questions, and the honest position is to present both.

The finite-beginning picture (the bootstrap from nothing). True nothing is not empty space, it is the absence of every
distinction, and it cannot hold, it is a hilltop, not a floor. Naming it as one whole already draws a line, and a
whole that can only relate to itself splits in two, the first distinction, the first two vibes, the first note, the
first tone, the first beat. There is no road back, since erasing a distinction is itself a distinction, so
distinctions only pile up, and that piling up is time. On this reading reality starts from a SEED (one dock at peace,
the central cell) and grows beat by beat, finite at every step, with a first moment, a built-in arrow, and a reason
for there being something rather than nothing. (`findings-7.md`, `expanding-from-nothing.md`, `the-foundational-model.md`.)

The beginningless-eternal picture. Reality always was, the knit has always been running on an already-unbounded but
locally-finite mesh, no first moment, no creation event, no privileged origin. This is consistent because the knit is
REVERSIBLE, every state has a unique past, so the dynamics never NEEDS a first state. Our observed big bang is then not
the beginning of everything but a local spark, a chapter, in an eternal whole. (`theory-v0.6.0/finite-vs-infinite-comparison.md`.)

| consideration | finite-beginning (seed) | beginningless-eternal |
| --- | --- | --- |
| a first moment | yes, the first distinction | no, always running |
| arrow of time | explained, growth direction is the arrow | needs a separate past hypothesis (the rule is reversible) |
| why is there something | derived, nothing cannot hold | brute eternal default, no derivation |
| assumptions | needs a special low-entropy seed | needs no seed, takes structure as a brute fact |
| symmetry | a privileged origin (a here, a then) | no privileged origin, maximally symmetric |
| the observed big bang | THE first morning of everything | a local spark in an eternal flame |

What IS committed is the forward fate, the mesh grows forever and never completes the cusp (eternal expansion). What
is OPEN is the backward origin, seed-bootstrap or beginningless. Neither computability, nor the dynamics, nor any
current observation breaks the tie, the same finite-age visible universe fits both (it is either the whole, or one
chapter of it). Why it matters, the model is honest about its deepest unsettled point and gains rather than loses by
it, the bootstrap is the more explanatory story (it gives the arrow and a reason for structure), the eternal is the
more economical and symmetric one, and the choice is left to the reader and to future work.

## How long ago, the age question

If there was a seed, the age is finite and exactly the number of beats since the first distinction, the universe is
then a finite chunk grown from one dock. But the model does NOT yet pin an absolute number, because the conversion
from one beat to one second is uncalibrated, there is no derived bridge from the discrete clock to laboratory time.
What the model gives is the SHAPE of the history, exponential bulk growth (about 18.28 per radius), a polynomial flat
slice (about 1.52), and a de Sitter slice expansion (`H` about 0.80 per beat), which is a radiation-then-matter-then-
acceleration history integrated forward rather than plugged in (`findings-5.md`). On the beginningless reading the
question dissolves, there is no finite age to the whole, only to our visible chapter. Why it matters, the theory fixes
the form of cosmic time and its eras while being honest that the absolute age in seconds awaits a calibration of the
beat, and that on the eternal reading there is no global age at all.

## What remains to explore

- The closed-form growth recurrence for `{3,4,3,4}`, the rate is measured cleanly (about 18.28) but not yet derived
  (`findings-1.md`, `findings-7.md`).
- Whether the growing mesh DYNAMICALLY settles matter into clean parabolic cusp chunks (clean cubic 3D) rather than
  generic aperiodic horospheres, the mechanism is plausible (solitons seek the regular, lowest-energy cusp sites) but
  needs a direct run (`theory-v0.6.0/cusp-problems-and-sufficiency.md`).
- The precise expansion law, mapping discrete shell growth to a Friedmann scale factor and checking it yields a
  realistic matter-radiation-dark-energy cosmology (`theory-v0.6.0/physical-space-finiteness-and-growth.md`).
- Quantifying the cusp's cubic-anisotropy UV Lorentz violation against the observational bounds, the concrete
  falsifiability frontier (`theory-v0.6.0/cusp-problems-and-sufficiency.md`).
- Calibrating the beat to physical time, needed before any absolute age or absolute energy-scale claim.
- Settling, or sharpening, the finite-beginning versus beginningless question, an arrow-of-time analysis (does the
  theory NEED a low-entropy past that only the seed supplies), a rigorous least-assumption argument, or any observable
  that distinguishes a true beginning from a local chapter (`theory-v0.6.0/finite-vs-infinite-comparison.md`).

## Where to look (notes)

- The finite-growing cusp and the never-reaching reframing: `theory-v0.6.0/physical-space-finiteness-and-growth.md`,
  `expanding-from-nothing.md`, `origin-data.md`.
- Flatness at finite distance and the horosphere model: `flat-at-the-edge-explained.md`,
  `cusped-hyperbolic-manifolds.md`, `asymptotic-euclidean-on-horospheres.md`.
- The two boundaries (ideal versus wake): `the-holographic-boundary-explained.md`.
- Anisotropy, sufficiency, and the convergence numbers: `theory-v0.6.0/cusp-problems-and-sufficiency.md`.
- The bootstrap from nothing and the foundational seed: `findings-7.md`, `the-foundational-model.md`,
  `expanding-from-nothing.md`.
- The beginning question, both pictures: `theory-v0.6.0/finite-vs-infinite-comparison.md`,
  `eternal-universe-explained.md`, `the-beginningless-universe-story.md`.
- Cosmology numbers (de Sitter, inflation, no singularity, dark energy as the wake): `findings-5.md`, `findings-10.md`.