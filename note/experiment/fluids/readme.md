# Fluids

The **fluids** arena is lattice-gas hydrodynamics. The base knit is a lattice gas, collide then stream, so a smooth momentum profile is the natural thing to push on. The question is whether the discrete rule **coarse-grains to fluid behavior**, a viscosity, a sound speed, a channel profile, conservation laws, and the exotic phases (superfluid, turbulence).

The central finding is a dichotomy. The **reversible bulk carries no dissipation**. A shear or a charge wave recurs on the closed mesh (Poincare recurrence) and never decays, so genuine viscous transport is **bath-driven**, set by the boundary, the same arrow-from-the-wake principle that governs all dissipation in the model. On top of that sits a sharper distinction, a collision can **damp** a shear yet still be **ballistic** (decay time scaling as wavelength, not wavelength squared), which only looks like viscosity. The decisive test is always the k-scaling. Real Navier-Stokes viscosity is the k squared law with one constant nu.

The suite then finds where genuine hydrodynamics does emerge (the momentum-conserving gas), pins the exact conservation laws, and reaches for the superfluid and turbulent limits. Every result runs deterministically against a control (a lossy rule, a pinning pair table, an impoverished coin).

13 experiments, grouped below into five sub-themes. Every code appears once.

## The reversible bulk is inviscid

No dissipation without a bath. The conserved modes recur rather than decay, so viscosity comes from the boundary.

- **E-FLD-0006** - a shear recurs on the reversible closed bulk but dissipates on the open mesh, so viscous momentum diffusion is bath-driven, not a bulk property.
- **E-FLD-0004** - the committed collision has no finite bulk shear viscosity, the shear envelope oscillates without decay (an inviscid, near-conserved sound mode), and the open mesh sets all the dissipation.
- **E-FLD-0002** - the conserved charge wave also recurs in the reversible bulk rather than diffusing, so both currents, charge and momentum, are non-dissipative in the bulk and real charge diffusion needs the bath.

## When a collision fakes viscosity

A richer collision can damp a shear, but the scaling exposes it as ballistic, not diffusive. Geometry (coin richness) is what decides whether a working fluid appears.

- **E-FLD-0005** - a richer momentum-mixing collision damps a shear but ballistically, the decay time scales as wavelength not wavelength squared and the apparent nu grows with scale, so it is not a genuine viscosity.
- **E-FLD-0001** - a configuration-controlled (chaotic, Fredkin-gated) reversible collision is still ballistic with a decay exponent near one, so deterministic chaos does not give viscosity.
- **E-FLD-0003** - a shear dissipates substantially on the rich 24-direction D4 coin but barely on the impoverished 6-direction cubic coin, the four-dimensional FHP-not-HPP lesson, coin richness makes the fluid.

## Genuine emergent hydrodynamics

Where real fluid transport does appear, the momentum-conserving gas, with a true k squared viscosity, a sound speed, and a channel profile.

- **E-FLD-0011** - the momentum-conserving gas has a finite shear viscosity, the shear-mode decay rate scales as k squared with one nu across wavenumbers and sizes, while the pinning pair table has no shear mode at all.
- **E-FLD-0013** - a density bump radiates a ballistic pulse with one well-defined sound speed near 1/sqrt(2), while the pinning pair table leaves the bump frozen.
- **E-FLD-0012** - a decaying plug in a bounce-back channel develops a parabola-like Poiseuille profile under the momentum-conserving bulk, and stays flat (ohmic) under the momentum-losing pair table.

## Conservation laws and the Navier-Stokes bound

Exact quadratic invariants the reversible rule keeps, and the truncation that makes a coarse field appear to run away.

- **E-FLD-0009** - an enstrophy-like quadratic (the count of nonzero sites) is conserved exactly by the reversible knit because the rule only permutes the tone multiset, the lattice bound Navier-Stokes forgets, while a lossy rule lets it collapse (the control).
- **E-FLD-0010** - the coarse velocity-gradient energy rises above its start (a transient apparent steepening, recurrent not divergent) while the fine enstrophy quadratic stays integer-exact, the truncation half of the Navier-Stokes blow-up story.

## The exotic fluid phases

The hardest fluid limits, superfluidity and the turbulent cascade.

- **E-FLD-0007** - the substrate is a superfluid, a finite Landau critical velocity (the sound speed) and quantized circulation, against the zero-critical-velocity normal fluid as the control.
- **E-FLD-0008** - the Kolmogorov turbulent cascade, the energy spectrum E(k) proportional to k to the minus five-thirds in the GOY shell model, with the linear no-cascade model as the control.

## What it establishes

The discrete rule **coarse-grains to a fluid**, but with a sharp caveat. The reversible bulk is **inviscid**, its conserved modes recur, so all dissipation is **bath-driven** from the boundary. A collision that merely damps is not enough, only the **k squared scaling** certifies a real viscosity, and only the rich 24-direction coin supplies one. Where it does, the **momentum-conserving gas** shows a genuine shear viscosity, a sound speed near 1/sqrt(2), and a parabolic Poiseuille channel profile. The reversible knit keeps an **exact enstrophy-like bound** that the coarse description forgets, matching Herbert's continuity-closure reading of Navier-Stokes, and the substrate reaches the two hardest limits, a **superfluid** signature and the **Kolmogorov cascade**.
