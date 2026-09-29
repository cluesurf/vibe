# Open pieces: a spinor register binds light matter, and all three Sakharov conditions

Continues experiment/moving-binding. This branch started with four open pieces, closed three, and reduced the fourth, bound matter moving in 3d, to one question: the inertia of a light pair held by the model's own light. It also starts 15 ledger rows nobody had begun.

Everything in the register sections runs on the candidate rule (the love sea, the dock mixer and the swap coin) plus the register. Neither is adopted, and every claim below says which rule it ran on.

## Closed earlier on this branch

- **A composite at relativistic speed** (E-SPN-0115): the meson stays one particle out to momentum equal to its rest energy, a resonance of width 1e-7 of its mass.
- **Spin 2, derived rather than chosen**: linearized Einstein–Hilbert (E-GRV-0138), lapse and shift as multipliers with DeWitt's kinetic term (E-GRV-0139), speed exactly c and λ = 1 at cubic order (E-GRV-0141).
- **Randall–Sundrum's short-range number** in the flat-bulk limit: 3/4 from a scalar (E-GRV-0137), 0.971 from the spin-2 tower (E-GRV-0142), the 4/3 from a bulk slide (E-GRV-0143).

## Motion in 3d

- **Every vibe on the working rule is a lineon** (E-SPN-0116 to 0120), which observation excludes by about 17 orders of magnitude (E-SPN-0126).
- **The candidate change solves one-body motion**: a hole moves isotropically with R = tan m/m, one top speed shared by every excitation, in the exact many-body rule (E-SPN-0140, 0143, 0145, E-GRV-0144).

## Binding

- **Every first attempt fails on the swap coin's flat bands**:
  - a phase string leaks (E-SPN-0146)
  - a mass string needs heavy members (E-SPN-0147, 0148)
  - Z3, 2T and 2I strings fail (E-SPN-0150 to 0154), and no gauge string of any group reaches the flats (E-SPN-0161)
  - two beats leave three transverse partners pinned in any schedule, 314 of 314 open (E-SPN-0159)
  - a Coulomb pull binds heavy members only (E-SPN-0155)
- **The register.** An 8-value Cl⁺(4) register, the least one exact in the ring, gives the singlet a Clifford partner with nothing transverse. The census closes for a light member for the first time, B* = 2M for every mass below π/6 (E-SPN-0160). The price is one speed at c/4 in bulk units, √2/4 husk docks a beat on the husk (E-SPN-0167). The graviton shares it (E-GRV-0145), and the many-body register rule is exact, with the sea one branch and one hole exactly the member (E-SPN-0163).
- **A light pair binds and holds exactly** on a string of sector projectors, with R = 34.65 (E-SPN-0162), falling to 13.47 and 1.43 as the string weakens. A static binder crosses R = 1 only at one tuned coupling (E-SPN-0174).
- **The model's light gives the missing inertia.** Its transverse exchange is exactly the Darwin term, and in linear response it takes a light member's R to 1.012 against tan m/m 1.012 (E-SPN-0169).
- **Held by the light's own pull**, a light register pair binds like hydrogen and holds with no leak, but with R = 8.5 to 16 at the couplings the engine reaches. The argued cause is strong coupling across one link (E-SPN-0173). A symmetry-reduced engine reaching Bohr radii of 8 to 20 is running now.

## One speed

Matter and the graviton share √2/4 on the husk (E-GRV-0145, E-SPN-0167), inside the husk light's stable cap. The loop light meets it exactly at the split ρ = 3 (E-FRC-0260). The split is fixed by equal filling, so at a balanced split exact equality holds only as a limit of the register's size (E-FRC-0261). The balance is 3/8 on the bulk's registers and 0.4614 on the husk's weighted columns (E-FRC-0262). No depth gives α = 1/137 under the frozen null.

## Chirality, CP and the asymmetry

- **Chirality**: the register's two halves give exact chirality. A chiral mass breaks P and CP, with CPT exact (E-FRC-0258).
- **Flavors**: three flavors keep every invariant, and the trimaximal mixing is removable at one body (E-FRC-0259).
- **C and CP together**: a two-body register exchange makes the phase physical (E-SPN-0163), and C and CP break together inside one sea, with the love-fear mirror exact (E-SPN-0164).
- **Member number**: no gauge winding moves it (E-SPN-0165). The husk as a Wilson domain wall gives mass from depth alone, a 940-fold hierarchy (E-SPN-0166, a fail on one tolerance). Parity breaks only on its oriented face, and member number flows +4 and −4 per E·B loop across the two faces (E-SPN-0168).
- **Sakharov**: all three conditions are in the rule. The flow is an index blind to CP, so a net asymmetry needs a dynamical light biased by CP-odd currents (E-SPN-0171). The far-side resonance on the wall closes (E-SPN-0172, a fail on one tolerance).

## Ledger rows started

- **Quantum**: the path integral (E-QTM-0158), delayed choice (0159), weak values (0160), POVMs (0161), Wigner's friend (0162).
- **Relativity**: length contraction and collisions (E-RLT-0108, 0109).
- **Information**: Landauer and a line code (E-CMP-0018, 0019).
- **Cosmology and heat**: horizon and flatness, and the husk not inflating (E-CSM-0058, 0059), the coarse end state (E-FND-0155), fluctuation-dissipation, held on 17 of 17 starts (E-FND-0156).
- **Light and matter**: Compton and Thomson (E-FRC-0263), the photoelectric threshold (E-FRC-0264, a fail: the gate missed the bound lines below E_b).
- **Positions in superposition**: held on the working rule (E-QTM-0157).

The physics ledger now reads 38 held, 67 partial, 45 stand-in, 24 open and 17 none, of 191.

## Checks

Commands, from this worktree:

```
pnpm call test/catalog.ts
pnpm check:labels
pnpm check:coverage
pnpm result check
node_modules/.bin/tsc --noEmit -p tsconfig.check.json
```

- **Last reported results**, from the E-SPN-0173 and E-SPN-0174 registrations on 2026-09-29: the catalog regenerates at 1,516 experiments, and coverage, the result check and tsc exit 0.
- **check:labels** exits 0 with one contradicted label (gravity/cubic-slide-speed, older than this work) and 20 held for review.
- **Gates**: every experiment's gates were fixed before its gate run and none moved after it. Where a tolerance proved tighter than its instrument, the fail stands and is recorded (E-SPN-0166, E-SPN-0172, E-SPN-0155's I5, E-FRC-0264). Failures are recorded as failures.
- **Not in the counts**: the symmetry-reduced Coulomb engine is still running and is not registered.

The full record is in the ClueSurf notes: note/research/vibe/roadmap/remaining-pieces.md, and the ledger is note/research/vibe/roadmap/everything.md.
