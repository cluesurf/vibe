# The Engine and the Screen

**The picture: science studies the screen, vibe guesses the engine.** The engine is the committed
turning weave running on the cells. The screen is what a coarse observer can see of it. Four lines of
that picture were argued. These four experiments measure them. No random number enters any rule or
start: every start is a fixed hash of the slot index, and every run is exact.

## The answer in four lines

1. **The screen is almost all hidden, and it has its own law only statistically.** The block
   populations keep 0.00003 bits per slot of a whole side-15 mesh and hide 1.58, of log2 3 = 1.585.
   Two microstates with the same screen disagree later by a block distance falling as **b^-2.1**
   (L = 15) and **b^-2.0** (L = 9), the law of large numbers, and no worse than two independent
   draws of the macrostate (`E-SCL-0016`).
2. **The screen has a law nobody typed in, and it is kinetic, not diffusive.** The conserved charge
   moves at exactly one cell per beat and relaxes at **0.0015 per beat at every wavelength**, exponent
   **-0.08 +- 0.03** against k, where diffusion would give 2 (`E-FLD-0020`).
3. **Along a cusp the engine gets no bulk shortcut.** On a label-consistent {3,4,3,4} ball the
   cell-graph distance between cells of one cusp equals their flat skin distance at **90 of 90**
   sampled cells out to skin 8, while the continuum distance grows only from 1.76 to 5.18
   (`E-NVG-0014`).
4. **A phase on the colour swap changes who holds which colour, and nothing else.** On three
   excitations the rule preserves exactly, U(phi) at their 15 encounters makes "A ends red" run
   1, 0.11, 0.86, 0.22, 0 at phi = 0, pi/4, pi/2, 3pi/4, pi, where the matched classical swap gives
   1, 0.46, 0.33, 0.30, 0 (`E-FRC-0105`).

## The measurements

| experiment | measured | grade |
| --- | --- | --- |
| [`E-SCL-0016`](../../../test/experiment/renormalization/screen-renderer.ts) | hidden bits per slot two schedule periods in: **1.32** (b = 1), **1.575** (3), **1.580** (5), **1.581** (15), against visible **0.348** and **0.00003**. Same-screen disagreement D_b: **0.159, 0.0173, 0.0063, 0.00052** at b = 1, 3, 5, 15, independent draws **0.159, 0.0177, 0.0066, 0.0013**, another macrostate **0.017** at b = 15. Exponent **-2.11 +- 0.06** (L = 15), **-2.03 +- 0.01** (L = 9). Streaming: D_L = **0** exactly. A gated rule that reads a hidden slot: exponent **-0.13**, D **0.157** at b = 9. Hidden line correlations under the committed rule: D_L **0.032** at the first beat against **0.0019** for a typical start, erased to **0.0026** in 48 beats | L3 |
| [`E-FLD-0020`](../../../test/experiment/fluids/charge-mode-law.ts) | total charge conserved at every beat of every run, tone count and x momentum not (drifts **878** and **830**). Relaxation rate **0.00165, 0.00160, 0.00141, 0.00151, 0.00145** per beat at k = 0.57, 0.70, 1.40, 2.09, 2.79 (sides 11 and 9), mean **0.00152 +- 0.00010**, mean free time about **656** beats. The oscillating half moves at omega = k within **0.13 percent**. Streaming relaxes nothing: rate **4e-20** | L3 |
| [`E-NVG-0014`](../../../test/experiment/addressing/cusp-routing-is-flat.ts) | the antipodal labels close on all **162,049** cells of the radius-4 ball, frame mismatch **4e-13**, shells **1, 24, 456, 8376, 153192**. The translation-like labels fail on **4,224** steps of the radius-3 ball. The cusp layer is the cubic lattice (degree **6**, shells 1, 6, 18, 38, 66, ...). Bulk distance equals skin distance at **90 of 90** samples. The committed rule reaches **24, 23, 19, 19** cells of shells 1 to 4 (of 153,192 at shell 4), never early. Streaming: the **24** rays exactly. Flat D4: **14** of 1,056 at shell 4, never early | L2 |
| [`E-FRC-0105`](../../../test/experiment/gauge/colour-shader.ts) | **6** of 48 lone starts are preserved exactly (one slot away from the vacuum at every beat), three superpose with **0** defects through **15** encounters. P(A ends red) is **1** and **0** at the classical points, fractional between, A's purity **0.745** at pi/2, largest gap to the classical swap **0.52**. Casimir drift **2e-14**, singlet weight **1/6** throughout | L2 |

## What each one means for the picture

### The screen hides nearly everything, and that is why it can have a law

At the whole-mesh scale the screen shows one population vector for 1.2 million slots, 0.00003 bits
per slot, and hides the rest. That many-to-one ratio is not an obstacle to a screen law, it is its
source: the law of large numbers makes two microstates behind one screen look the same later, to
b^-2. Knowing the microstate buys nothing over knowing the macrostate at any block smaller than the
mesh. So "science studies the screen" is well posed. The screen does evolve by its own law, to a
precision set by how much it hides.

It holds on typical starts only. A rule that reads a hidden variable has no screen law at any scale
(the gated control), and the committed rule itself reads one: its population changes are pair
creation and annihilation, which depend on the state of whole lines. A start whose lines hide a
correlation breaks the screen law by seventeen times the fluctuation level at first, and the rule
erases the correlation within two schedule periods. That is local equilibrium seen from the screen.

### The screen law is one the engine never states

Nothing in the turning weave says "relax at 0.0015 per beat" or "move at one cell per beat". Both are
read off. And the law is not the one hydrodynamics expects: a conserved density usually diffuses, with
a rate growing as k^2. Here the rate does not depend on k at all, over a factor of five in k at two
sizes. That is what a gas does when its particles fly farther between collisions than the wavelength.
A two-state reading puts diffusion at wavelengths of thousands of cells, beyond any mesh run here.
So the committed rule's screen, at every scale reached, is a nearly collisionless kinetic gas. This is
the dispersion relation `E-FND-0129` named as the coarse-bridge deliverable, for the conserved density.

### The engine routes by its cells, and along a cusp its cells are flat

Running the rule on {3,4,3,4} needed something the cell graph alone does not give: labels on every
cell's 24 facets that agree across every shared facet. The antipodal transport supplies them exactly
(sending the outer Coxeter generator to the point inversion is a homomorphism because the last label
is even), and the translation-like one cannot, because four cells meet around a ridge where the flat
honeycomb has three. The antipodal frames reverse orientation at each step. That is stated in the
experiment, not hidden.

On that substrate the picture's claim fails in a precise way. The cells touching one ideal vertex are
chimneys that reach all the way to it, so a path through the horoball crosses as many cells as a path
along the horosphere. The cell graph embeds the cusp's flat skin isometrically. The continuum offers
a logarithmic shortcut (2 asinh of half the horospherical separation) that no rule moving across
facets can take. Where the bulk does win is volume: 162,049 cells within 4 steps against 129 on the
cusp within skin 4. So if recall uses the bulk, it uses it to reach many cells quickly, not to cross
one cusp faster.

The committed rule adds a second limit. In a dense background it does not fill its light cone: a
perturbation travels along rays, about twenty cells per shell on the hyperbolic ball and the flat
mesh alike. Its routing is ray tracing on the cell graph.

### The missing amplitude acts on who, not on how much

The base has no amplitudes (`E-FND-0080`), and a colour-symmetric rule can only leave or swap
(`E-FRC-0100`). Put the phase on the swap, on world lines the rule does preserve, and a screen
observable becomes continuous in phi: which excitation ends holding which colour. It is 0 or 1 at the
classical points and fractional between, and it differs from a classical random swap with the same
one-encounter probability by up to 0.52, because amplitudes for different orders of encounters
interfere. What the phase cannot touch is equally sharp: no tone observable, no colour content, no
su(3) invariant. A shader changes the colours on the screen and not the geometry.

## Caveats

- `E-SCL-0016` tests one screen (block populations). A screen of line states or currents would need
  its own test. A start with a gradient inside a block adds a disagreement that does not fall with b,
  because the within-block shift changes the hidden gradient, so the gated runs use uniform
  macrostates.
- `E-FLD-0020` gates one background density, a third of each tone. The spread of the five rates is
  about ten percent and systematic. It does not show diffusion and does not rule it out beyond the
  meshes reached.
- `E-NVG-0014` samples 90 cusp cells from one source, exact out to skin 7 and bounded at skin 8. The
  flat skin result is geometric and holds for any facet-streaming rule. The reflecting frontier of the
  ball is the growing-mesh machinery (`growingBeat`), not a periodic hyperbolic manifold.
- `E-FRC-0105` puts U(phi) in by hand. The rule supplies only the carriers and the order of
  encounters, and an encounter is a shared cell, where the tones do not scatter.
