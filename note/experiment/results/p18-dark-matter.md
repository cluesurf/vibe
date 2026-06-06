# P18: Dark Matter from Nonlocal Gravity

**Status: mechanism demonstrated. Flat rotation curves, no dark particle.**

## The question

Galaxies rotate as if they contain far more mass than we see, the flat-rotation-curve
problem usually attributed to dark matter. Can the mesh produce flat rotation curves
without a dark particle, from gravity alone?

## The idea

The gravitational potential is the Green's function of the gravitational kinetic
operator. With the local Laplacian it is Newtonian (1/r in 3D, P16), giving a
Keplerian rotation curve (orbital speed falls with radius). A NONLOCAL gravitational
kinetic term, natural here because the discrete action is nonlocal, adds a long-range
(infrared) piece to the propagator. We model it as a 1/L^2 component, solve the
modified Poisson equation by conjugate gradient on a 3D lattice, and read off the
rotation curve v^2(r) = r times the force.

## Result

| gravity | rotation curve v^2(r) | outer/inner ratio |
| ------- | --------------------- | ----------------- |
| local (Newtonian) | falls with radius | 0.23 (declines) |
| nonlocal (1/L^2 weight 1.5) | rises then stays flat | 1.29 (flat/rising) |

- **Local gravity gives a Keplerian decline**: v^2 falls to about a quarter of its
  inner value (ratio 0.23).
- **Nonlocal gravity flattens the curve**: v^2 rises and stays flat across the
  measured range (ratio 1.29), the dark-matter signature, produced with **no dark
  particle**, purely from a long-range modification of gravity.

So flat rotation curves emerge from gravity itself when the kinetic term is nonlocal,
which the discrete action naturally is.

## Honest reading

This demonstrates the MECHANISM and the flattening cleanly. It does not yet show that
the nonlocality scale lands at galactic radii (true MOND phenomenology), which is a
separate quantitative question about the coupling. And it is one of three dark-matter
routes the framework allows. The other two:

- **A hidden tone sector.** A fermion that couples to the geometry (so it gravitates)
  but carries no visible gauge charge (so it is electromagnetically dark). Natural in
  a mesh, testable by adding a gauge-neutral fermion (P8 gives the gauge coupling to
  switch off).
- **Relics and defects from the bootstrap.** Frozen substructures left from the early
  rapid growth (P13), which persist and gravitate. Deep theory.

So dark matter has a concrete, testbed-demonstrated handle (nonlocal gravity) plus two
further natural routes.

## See also

`p16-newtonian.md` (the local Newtonian potential this modifies),
`note/questions/frontiers.md` (the dark sector), and `p18-dark-matter` (the experiment).
