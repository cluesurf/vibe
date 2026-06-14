# Findings 22, The Discrete Gravity Model, Complete

Everything about gravity in the model, the honest negatives that frame it, the discrete attraction field that
completes the self, the emergent general relativity it recovers, and the dark sector. All discrete, with the exact
numbers and the open gap stated plainly. Companion to `findings.md`. Cite `\cite{pollard2026vibetest}`, with Jacobson
for the equation-of-state derivation and Ryu-Takayanagi for holography.

## The honest negatives first, gravity is not free

Two results frame everything, and both are negatives that had to be cleared.

The bare five elements have NO long-range attraction. Two lumps of matter placed 120 docks apart on the flat cusp
stay 120 docks apart over 120 beats (the separation wanders 119.5 to 120.8, pure noise), they do not approach. So
gravity is a genuine missing ingredient, not a free consequence of the base.

And the BULK route to gravity FAILS. The tempting idea is to let the hyperbolic bulk supply the force for free, but
the bulk has no real notion of far. In a 40,000-dock crystal the maximum distance between any two docks is only
about 5 hops, the tiny-diameter field-beneath, so the bulk connects every pair of boundary points at nearly the same
short distance regardless of how far apart they are on the surface.

| surface distance | mean bulk distance (hops) |
| --- | --- |
| 12.0 | 5.2 |
| 17.75 | 5.2 |
| 21.5 | 5.8 |

The surface distance nearly doubles while the bulk distance barely moves, so a coupling through the bulk cannot fall
off with distance, it pulls everything together at once (collapse, not a graded force). Why it matters, gravity must
act on the FLAT cusp where distance is real, not in the bulk, and it must be ADDED, the most elegant free routes are
ruled out by experiment.

## The discrete gravity field, the attraction that completes the self

The attraction is a per-dock INTEGER potential, fully discrete, no real numbers. The architecture is exact enough to
reimplement.

- THE SOURCE. Mass is a rest charge (a tone in the zero-speed home slot), at most one per dock (excluded volume), so
  the mass field is a 0-or-1 occupancy. Only the BULK of a body is a source, a dock sources the field only if it is
  occupied AND has at least 3 occupied neighbours among its 24 directions. This removes the SELF-FORCE, a lone or
  displaced mass is not a source, so it does not sit in its own well, it is a test particle feeling only the body's
  well (the discrete analogue of a particle not self-gravitating).
- THE FIELD, bounded to a few bits. A per-dock integer potential `phi` bounded to `[-cap, cap]`, NOT an arbitrary
  integer (an unbounded integer would be a real number in disguise), a small bounded count, `cap = 6` is thirteen
  levels, about four bits. It relaxes by a discrete Poisson sweep, for every dock,
  `phi_next = clamp( round(average of phi over the 24 neighbours) - strength * source, -cap, +cap )`, iterated a few
  sweeps. The source term digs a well at each mass, the neighbour-average diffuses it into a smooth bowl, the clamp
  keeps it in a few bits. It is warm-started each beat (the body barely moves, so the field tracks it like
  instantaneous Newtonian gravity).
- THE FORCE. Each beat, every non-bulk mass (a surface or displaced piece) hops to the empty neighbour with the
  lowest `phi`, if that neighbour is lower. That down-gradient hop IS the attraction. Bulk masses do not move.
- THE REPULSION. Excluded volume (one mass per dock) is the short-range hard core that stops collapse, attraction
  plus excluded volume gives a body a stable size.

How few bits, measured. Pure ternary (`cap = 1`) is too coarse, range about one dock, it repairs only a contact
displacement. `cap = 6` (about four bits) repairs a piece broken off three docks away. The well is coarse, its
GRADIENT (which neighbour is lower) is all the dynamics needs.

What it does, measured (`gravity-bound-self`, PASS). IDENTITY, the body persists and does not collapse (89 occupied,
extent 4, unchanged). SELF-REPAIR, a piece broken off three docks away returns (displaced extent 6 falls back to 4).
RADIATION, a disturbance still sheds to the bath (difference to 0 open, 8 on the closed torus). Why it matters, this
proves the one missing ingredient is an attraction and that a fully discrete one suffices to complete the self.

## The honest caveat, this field is not reversible

The base is reversible, this gravity field is not. The relaxation forgets initial conditions (diffusive,
irreversible) and the down-gradient hop is dissipative (many configurations map to one). So it is an EFFECTIVE,
instantaneous-Newtonian attraction, a working demonstration, not a clean reversible base field. A reversible discrete
gravity would need the potential to be a genuine propagating field with its own conserved degrees of freedom that the
mass sources and that back-reacts, and the naive second-order integer wave field for that is UNSTABLE (the same
discrete Klein-Gordon instability that shatters the discrete kink). So a stable, reversible, discrete, propagating
gravity is OPEN. Why it matters, the attraction is identified and demonstrated discretely, but a reversible base form
is the narrow remaining gap, stated honestly rather than hidden.

## The reversible resolution, shadow pressure

The reversible discrete attraction does exist as a mechanism, the radiation-pressure shadow of the active vacuum
(see the binding findings). A body excludes the vacuum and casts a shadow, the pressure imbalance pulls a piece back,
all integer, with the bulk reversible and the only irreversibility the radiation reaching the bath. The open gravity
question is whether that shadow has a long-range `1/r` tail (Newtonian gravity) when coarse-grained, which is a
named target. Why it matters, the effective gravity field above is the Newtonian stand-in, and shadow pressure is its
reversible discrete cousin, with the long-range tail the remaining gravity-specific question.

## The emergent general relativity it recovers

On the flat cusp the model recovers gravity's structure, measured.

| result | finding | why it matters |
| --- | --- | --- |
| Newton's law by dimension | `1/r^2` force in 3D (exponent -2 +/- 0.05), 3D free-space Green's function EXACTLY `1/(4 pi r)`, `log r` in 2D, `1/r^3` in the 4D bulk with a crossover at the extra-dimension size | the correct gravitational potential, dimension by dimension, on a discrete crystal |
| the graviton | the linearized Einstein operator with 2 massless polarizations, gauge residual under 1e-9, the Benincasa-Dowker discrete d'Alembertian positive and recovering the wave operator | gravity's quantum as a mode of the mesh |
| Friedmann / nonlinear Einstein | integrated forward, radiation slope 0.5, matter 2/3, a deceleration-to-acceleration transition (integrated, not plugged in) | the expanding-universe equation emerges, not assumed |
| Einstein as equation of state | the field equation arises from horizon thermodynamics (the Jacobson derivation) | gravity as thermodynamics, the deep modern reading |
| black-hole thermodynamics | surface gravity `kappa_ray = kappa_metric` to under 3 percent, Unruh detector thermal `F(E)/F(-E) = exp(-E/T)`, temperature `T ~ 1/M`, the Page curve turns over | Hawking radiation and black-hole thermodynamics on the substrate |
| gravitational waves | a binary inspiral chirp, the graviton as a discrete massless field with 2 polarizations | the radiation that LIGO sees, as a mesh mode |
| `Lambda = 3 H^2` | the de Sitter relation | accelerating expansion from growth |

Why it matters, the structure of general relativity, its force law, its quantum, its field equation, its black-hole
thermodynamics, and its waves, is reproduced from the one law, with the honest mark that the fully nonlinear
curved-bulk Einstein equation is still partial.

## Holography, gravity as entanglement

The entanglement-area law holds, `S = (c/6) ln(l)` with `c` about 1, and on the hyperbolic `{7,3}` the entropy
follows the geodesic LOG law (Ryu-Takayanagi) where the flat `{6,3}` control gives a linear law that fails.
Black-hole entropy scales as AREA (`l^2`) not volume (`l^3`), the Bekenstein-Hawking law. The bulk-to-boundary map is
a quantum error-correcting code (HaPPY), the `[[5,1,3]]` code recovers from any 2 erasures, code distance grows as
`3^depth`, a damaged bulk reconstructs. Why it matters, the entanglement law of quantum gravity and the holographic
dictionary hold on the discrete crystal, with the control geometry that fails being the strong form of the test.

## The dark sector, gravity's two-thirds

Both dark components map to the substrate's gravity and growth. DARK MATTER may be a geometric effect of the same
nonlocal gravity channel, the tiny-diameter bulk that connects far surface points, which can mimic extra unseen mass
in galaxy dynamics without a new particle. DARK ENERGY is the wake, the mesh grows, net-positive birth gives an
emergent accelerating de Sitter expansion (`Lambda = 3 H^2`), so the energy of empty space is the energy of new
docks at the frontier. Why it matters, the 95 percent of the universe that is dark may be the geometry and growth of
the mesh itself, gravity's nonlocal channel and the wake, rather than two new substances.

## The status, in one line

Gravity is NOT in the bare five (proven), the bulk route FAILS (proven), an effective discrete attraction field
completes the self (demonstrated, `gravity-bound-self`), its reversible cousin is shadow pressure (demonstrated),
the structure of general relativity is recovered on the flat cusp (Newton, graviton, Friedmann, Hawking, holography,
all measured), the dark sector maps to the bulk's nonlocal gravity and the wake, and the one open gap is a stable,
reversible, propagating discrete gravity (the fully nonlinear curved-bulk Einstein equation). Why it matters, the
gravity story is complete in structure and honest about its one remaining dynamical gap.

## Where to look (docs, code, experiments)

- The key spec: `theory-v0.7.0/paper/the-discrete-gravity-field.md` (the effective field, exact algorithm and the
  reversibility caveat). The negatives: `no-gravity-hole.md`, `the-bulk-route-to-gravity-fails.md`. The dimension and
  curvature picture: `gravity-through-the-bulk-tree.md`, `one-model-for-all-curvatures.md`. The dark sector:
  `theory-v0.7.0/notes/research-targets/dark-matter.md`, `dark-energy.md`, `emergent-gravity.md`. Holography:
  `holography-on-73.md`, `the-holographic-boundary-explained.md`.
- Code: `code/dynamics/gravity-field.ts` (`bulkMass`, `relaxPotential`, `gravityMoves`), `code/dynamics/shadow-pressure.ts`
  (the reversible cousin), `code/operator/linearized-einstein.ts`, `code/operator/graviton.ts`,
  `code/operator/laplacian.ts`, `code/measure/gravity-potential.ts`, `gravity-exponent.ts`, `greens-function.ts`,
  `lattice-green-kspace.ts`, `screened-greens-function.ts`, `gravitational-wave.ts`, `code/dynamics/friedmann.ts`.
- Experiments: `selves/gravity-bound-self` (the effective field completes the self), `gravity/newtonian`,
  `gravity/gravity-freespace` (the exact `1/(4 pi r)`), `gravity/braneworld` (the by-dimension falloff),
  `gravity/discrete-graviton`, `gravity/graviton-from-action`, `gravity/nonlinear-einstein`,
  `gravity/einstein-equations`, `gravity/analog-hawking`, `gravity/hawking`, `gravity/gr-black-hole-thermo`,
  `gravity/gr-gravitational-waves`, `gravity/dark-matter`, `gravity/effective-metric`, `gravity/gravity-tree`,
  and holography `holography/area-law`, `holography/ryu-takayanagi-73`, `holography/bethe-gravity`,
  `holography/black-hole`, `holography/happy-code-534`.