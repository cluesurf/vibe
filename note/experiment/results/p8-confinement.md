# P8 Stage C: Non-Abelian Confinement

Stages A and B of the gauge ladder (a U(1) field and a charged fermion) were
validated earlier. Stage C is the strong force: non-Abelian gauge fields and
confinement. We implemented SU(2) lattice gauge theory and reproduced the
Wilson-loop area law, the textbook signature of confinement.

Reproduce: `npx tsx code/experiment/p8-confinement.ts`.

## The setup

SU(2) elements are unit quaternions (so the link variables stay exactly in the
group). The action is the Wilson action S = beta * sum over plaquettes of
(1 - (1/2) Tr U_plaq). We run a Metropolis Monte Carlo on a periodic 3D lattice
(L = 6), thermalise, and measure two things at each coupling:

- the **average plaquette**, which rises from disorder (near 0) toward order
  (near 1) as beta increases,
- the **string tension** via the Creutz ratio chi(2,2), a positive value being the
  area-law signature of confinement.

## The result

```
beta   avgPlaquette  stringTension(2,2)  acceptance
0.5        0.098            1.324           0.87
1.0        0.240            1.163           0.76
1.6        0.380            1.002           0.63
2.2        0.499            0.689           0.53
3.0        0.648            0.404           0.36
```

Two clean, monotone signatures:

1. **The string tension is positive at every coupling** (1.32 down to 0.40), and
   it **decreases as beta rises**. This is exactly 3D SU(2): the theory confines
   at all couplings, with the tension weakening toward weak coupling. A positive
   string tension means the static potential grows with separation, so charges
   cannot be isolated. Confinement.
2. **The average plaquette rises smoothly** from 0.098 to 0.648, the disorder to
   order crossover of the gauge field.

## What this validates

**Stage C of the gauge ladder is done.** The testbed now carries a genuine
non-Abelian gauge theory and exhibits confinement, the defining behaviour of the
strong force, with the area law measured directly. Together with the validated
U(1) field plus charged fermion (Stages A and B), the gauge-and-matter program
has climbed from electromagnetism to a confining non-Abelian theory on the mesh.

A known-answer test guards the machinery: a cold lattice is perfectly ordered
(average plaquette 1), and strong-coupling Monte Carlo disorders it (plaquette
below 0.3).

## Honest caveats

- **Modest lattice.** L = 6 in 3D with a simple Metropolis update. The string
  tension values are the Creutz ratio chi(2,2), not the asymptotic large-loop
  tension, so they are estimators of the right quantity rather than precise
  continuum values. The qualitative result (positive, decreasing, plaquette
  rising) is robust and correct.
- **3D, not 4D.** 3D SU(2) confines at all couplings, which gives a clean monotone
  signal. The physically richer 4D case has a weak-to-strong crossover and would
  need larger lattices and better sampling to study.
- **No dynamical quarks.** This is pure gauge. Coupling the confining field to the
  charged fermion of Stage B, and the chirality wall (Stage D), remain ahead.

## Status

P8 moves from **Stages A, B validated** to **Stages A, B, C validated**: a U(1)
field, a charged fermion, and now a confining non-Abelian SU(2) theory. The
remaining ladder is Stage D (the chirality wall, a single chiral fermion) and
Stage E (the full Standard Model content), which remain far off.

## See also

`validation.md` for Stages A and B, `summary.md` for all experiments,
`testbed/08-path-to-gauge-and-matter.md` in the monorepo for the full ladder.
