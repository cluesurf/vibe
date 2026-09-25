# Gauge Arena

**123 experiments.** Codes **[`E-FRC-0001`](../../../test/experiment/gauge/actual-rule-soliton.ts)** through **[`E-FRC-0123`](../../../test/experiment/gauge/vibe-weave.ts)**.

## What this arena tests

The Standard Model has a gauge group **U(1) x SU(2) x SU(3)**, a fixed set of charges, three forces, and three fermion generations. In ordinary physics all of that is put in by hand.

Vibe theory tries to grow it instead. The whole model is five base things: a discrete **{3,4,3,4}** crystal (the 24-direction D4 coin), a ternary tone, a reversible charge-conserving rule, reflection and growth, and the arrow. This arena asks whether the gauge structure of nature falls out of that substrate as an **emergent, measured consequence**, not an input.

The tests cover the emergence of electromagnetism from local charge conservation, non-abelian gauge fields and confinement, the algebra path from the coin to the **so(10)** grand-unified group, anomaly cancellation and charge quantization, the coupling constants and the weak mixing angle, the fermion mass hierarchy, the Koide lepton-mass relation, the three-generation and flavor structure, and topological solitons as matter.

Each experiment carries a depth tier. **L1** confirms known math on the substrate. **L2** reproduces a known physics construction. **L3** is the genuine target: a base rule producing the result with a control that could have failed. Negatives are reported as results, not hidden. Many titles below name their own limit or open gate.

## Audit, 2026-08-31

Two results in this arena were regraded. `proton-lifetime` (E-FRC-0043)
is textbook one-loop running of the measured couplings, its "no
leptoquark" control was the typed constant `false`, and the
"substrate MSSM-like content" is an assumption, so it is L2 with the
computed bare-SM run as its control. `mass-hierarchy` (E-FRC-0031)
compares two ansatzes both written by hand (an exponential and a power
law) with the inter-shell distance as the one measured input, so
"beats a power law" is a comparison between two typed formulas. It
stays L3 pending the robustness pass because it does measure the
hyperbolic shell spacing, but the paper should say "consistent with",
not "derived". Three files here (`reversible-universality-3434` in
computation aside) had cross-references typed as `true` inside their
verdicts, now removed. The audit is
`../../audit/2026-08-31-experiment-audit.md`.

## Sub-themes

### 1. Emergent U(1) and the photon

The bare rule conserves charge locally. That local law is a **Gauss law**, and a Gauss law is the signature of a **U(1) gauge field**. So electromagnetism comes for free, and the arena measures its photon, its force, and its spinor response.

- **[`E-FRC-0014`](../../../test/experiment/gauge/emergent-gauge.ts)** - the bare rule locally conserves charge (a U(1) Gauss law) but not a generic internal current.
- **[`E-FRC-0016`](../../../test/experiment/gauge/emergent-u1-gauge.ts)** - a U(1) Wilson loop equals the enclosed flux and is gauge invariant, the Aharonov-Bohm phase.
- **[`E-FRC-0042`](../../../test/experiment/gauge/photon.ts)** - the free U(1) gauge field is massless and gauge-invariant with about a third gauge zero modes.
- **[`E-FRC-0024`](../../../test/experiment/gauge/gauge-from-action.ts)** - the Maxwell operator is derived from the Wilson gauge action in the small-field limit, not put in by hand.
- **[`E-FRC-0041`](../../../test/experiment/gauge/ph-photon-3434.ts)** - the 8v sector is a gauge-invariant massless photon with a linear gapless dispersion.
- **[`E-FRC-0040`](../../../test/experiment/gauge/ph-magnetism-3434.ts)** - a charged wavepacket deflects in a magnetic field, the lattice Lorentz force, with a B = 0 control.
- **[`E-FRC-0021`](../../../test/experiment/gauge/g-factor-3434.ts)** - the spinor g-factor reads back as 2 from the Dirac Landau spectrum, measured not assumed, scalar particle the control.
- **[`E-FRC-0009`](../../../test/experiment/gauge/coupling-not-fixed-3434.ts)** - the bare rule treats the gauge coupling as a free multiplicative constant and fixes no value for it.
- **[`E-FRC-0011`](../../../test/experiment/gauge/dynamic-dispersion.ts)** - the conserved charge has a gapless hydrodynamic mode, but it is diffusive not relativistic.
- **[`E-FRC-0050`](../../../test/experiment/gauge/unified-wave.ts)** - one charge-conserving reversible ballistic isotropic wave rule on the {5,3,4} substrate.

### 2. Non-abelian gauge, confinement, and lattice matter

Beyond U(1), the coin's frame freedom is a **non-abelian** symmetry. These tests build lattice gauge theory on the substrate: Wilson loops that keep order-dependence, a real string tension, chiral condensates, and the coupling of gauge fields to fermions.

- **[`E-FRC-0007`](../../../test/experiment/gauge/confinement.ts)** - 3D SU(2) lattice gauge theory confines, a positive string tension that weakens with the coupling.
- **[`E-FRC-0039`](../../../test/experiment/gauge/nonabelian-gauge.ts)** - a non-abelian SO(3) Wilson loop is gauge invariant, curved, and order-dependent.
- **[`E-FRC-0038`](../../../test/experiment/gauge/non-abelian-3434.ts)** - the {3,4,3,4} vector sector can carry a non-abelian gauge field, the self-interaction vertex.
- **[`E-FRC-0048`](../../../test/experiment/gauge/su2-condensate.ts)** - a chiral condensate forms in a dynamical non-abelian SU(2) gauge field, near zero in the free theory.
- **[`E-FRC-0045`](../../../test/experiment/gauge/schwinger.ts)** - the Schwinger chiral condensate is near zero free and grows with gauge disorder.
- **[`E-FRC-0049`](../../../test/experiment/gauge/two-charge-binding.ts)** - the 1D gauge force confines two opposite charges (bound at any energy), zero coupling lets them escape.
- **[`E-FRC-0008`](../../../test/experiment/gauge/coupled-qed-3434.ts)** - one coupled rule conserves charge, stays gauge invariant, and back-reacts, lattice QED.
- **[`E-FRC-0023`](../../../test/experiment/gauge/gauge-fermion.ts)** - a covariant Kahler-Dirac fermion in a relaxed U(1) gauge background has a clean spectrum.
- **[`E-FRC-0028`](../../../test/experiment/gauge/index.ts)** - the overlap fermion zero-mode count equals the gauge topological charge, the lattice index theorem.
- **[`E-FRC-0004`](../../../test/experiment/gauge/chiral-gauge.ts)** - naive lattice fermions double to 2^d species whose chiralities cancel, and a Wilson term leaves one.

### 3. The algebra spine: from the coin to so(10)

The path from the discrete coin to the grand-unified group. The Standard Model does not fit in the coin's own D4 symmetry, but adding the tone as one more axis reaches **D5 = so(10)**, which contains it. The 16-spinor is one generation, and it breaks down to the Standard Model.

- **[`E-FRC-0022`](../../../test/experiment/gauge/gauge-embedding.ts)** - the Standard Model algebra does not fit in D4 = so(8) but does fit in D5 = so(10).
- **[`E-FRC-0010`](../../../test/experiment/gauge/d5-coin-search.ts)** - no regular honeycomb coin carries D5 = so(10), the geometry tops out at D4.
- **[`E-FRC-0025`](../../../test/experiment/gauge/gauge-from-coin-tone.ts)** - the coin D4 plus the tone as a fifth axis builds D5 = so(10) and embeds the Standard Model.
- **[`E-FRC-0018`](../../../test/experiment/gauge/exceptional-ladder.ts)** - the 24-cell D4 sits at the bottom of the forced exceptional ladder D4 < D5 < E6 < E7 < E8.
- **[`E-FRC-0026`](../../../test/experiment/gauge/gut-breaking.ts)** - so(10) breaks to su(5) to the Standard Model with the 16-spinor carrying a singlet.
- **[`E-FRC-0051`](../../../test/experiment/gauge/vacuum-selection.ts)** - every one of the 16 spinor weights leaves 20 unbroken roots, so any self-condensate breaks so(10) to su(5).
- **[`E-FRC-0015`](../../../test/experiment/gauge/emergent-symmetry.ts)** - triality kills the degree-4 anisotropy, so the F4 coin symmetry is continuous to order 6.
- **[`E-FRC-0006`](../../../test/experiment/gauge/coemergence-structural-3434.ts)** - the rotation subgroup forces the photon 8v and fermion 8s, 8c sectors as invariant subspaces.
- **[`E-FRC-0005`](../../../test/experiment/gauge/coemergence-dynamical-3434.ts)** - one coupled rule binds the photon and fermion sectors both ways, and decoupling kills both together.

### 4. Anomaly cancellation and charge quantization

The substrate cannot host a gauge theory inconsistent under its own transformations. Requiring the **anomalies to cancel** forces the Standard Model hypercharges and quantizes electric charge in thirds, so atoms come out neutral.

- **[`E-FRC-0003`](../../../test/experiment/gauge/anomaly-charge-quantization.ts)** - anomaly cancellation forces the Standard Model hypercharges and quantized electric charges.
- **[`E-FRC-0002`](../../../test/experiment/gauge/anomaly-cancellation-octonion.ts)** - the octonion construction delivers a complete anomaly-free generation, all six anomalies cancel with no exotic extras.

### 5. Coupling constants and electroweak unification

The one place the geometry pins a coupling. The weak mixing angle comes out **sin squared = 3/8** at unification from the so(10) charge content. Running it down reaches the measured low-energy value, the W and Z masses follow, and the Higgs makes the photon massive.

- **[`E-FRC-0013`](../../../test/experiment/gauge/electroweak-prediction.ts)** - sin squared of the weak mixing angle is 3/8 at unification from the so(10) charges.
- **[`E-FRC-0055`](../../../test/experiment/gauge/weinberg-angle-geometric.ts)** - sin^2(theta_W) = 3/8 is pinned by the discrete charge content, and an altered charge breaks it.
- **[`E-FRC-0054`](../../../test/experiment/gauge/weak-angle-prediction.ts)** - the weak angle at M_Z runs from 3/8 to near 0.231, with the MSSM-like beta choice a one-bit fit.
- **[`E-FRC-0044`](../../../test/experiment/gauge/rg-unification.ts)** - running the measured couplings up unifies in the MSSM but misses in the bare Standard Model.
- **[`E-FRC-0019`](../../../test/experiment/gauge/fine-structure-not-geometric.ts)** - the fine-structure constant is not geometric (it runs), the geometry fixes the weak angle and the GUT normalization, leaving one free coupling.
- **[`E-FRC-0012`](../../../test/experiment/gauge/electroweak-boson-masses.ts)** - the W and Z masses give M_W/M_Z = cos(theta_W) and custodial rho = 1 from the Higgs doublet, a triplet the control.
- **[`E-FRC-0027`](../../../test/experiment/gauge/higgs.ts)** - symmetry breaking gives a nonzero vacuum value and a massive photon, while the symmetric phase stays massless.
- **[`E-FRC-0043`](../../../test/experiment/gauge/proton-lifetime.ts)** - the proton lifetime is fixed by the GUT scale at about 1e36 years, above the bound and falsifiable.

### 6. The fermion mass hierarchy

Why fermion masses span more than a factor of a hundred thousand. On the exponentially-growing hyperbolic crystal, a mode placed one shell deeper has its Higgs overlap suppressed by a power of the growth rate **lambda**. Even spacing turns into an exponential mass spread. The flat lattice is the control and gives no hierarchy.

- **[`E-FRC-0031`](../../../test/experiment/gauge/mass-hierarchy.ts)** - unfitted geometric spacing gives a multi-decade exponential mass hierarchy, beating a power law.
- **[`E-FRC-0033`](../../../test/experiment/gauge/mass-hierarchy-localization.ts)** - the mass-hierarchy scale is the {3,4,3,4} growth rate, inter-generation ratios are powers of lambda about 18.4, the flat lattice the control.
- **[`E-FRC-0030`](../../../test/experiment/gauge/localization-mechanism.ts)** - the actual bound state decays as a power of lambda per shell, the marginal floor lambda^(-1/2), verifying the mechanism, the flat D4 lattice the control.
- **[`E-FRC-0032`](../../../test/experiment/gauge/mass-hierarchy-floor.ts)** - the marginal floor lambda^(1/2) about 4.3 is the parameter-free minimum inter-generation ratio, the neutrinos closest.
- **[`E-FRC-0052`](../../../test/experiment/gauge/warp-dictionary.ts)** - the mass suppression per warp shell is the overlap floor lambda^(1/2), distinct from the volume growth and the metric warp.
- **[`E-FRC-0053`](../../../test/experiment/gauge/warped-cusp-hierarchy.ts)** - the mass hierarchy is the warped-cusp (Randall-Sundrum) mechanism, Yukawas suppressed by powers of the warp factor per depth.
- **[`E-FRC-0067`](../../../test/experiment/gauge/absolute-yukawa-not-a-ladder.ts)** - the absolute lepton Yukawas do not sit on a clean geometric ladder, so the exact masses are free inputs.
- **[`E-FRC-0068`](../../../test/experiment/gauge/hierarchy-from-warp-shells.ts)** - the electroweak-Planck hierarchy and inflation scale are modest shell counts, a reformulation not a generation, lambda does no work here.
- **[`E-FRC-0034`](../../../test/experiment/gauge/mass-relations.ts)** - the hypercharge is traceless over the 16, giving the GUT determinant mass relation.
- **[`E-FRC-0056`](../../../test/experiment/gauge/yukawa-rg.ts)** - running b-tau unification down gives the observed mass ratio and the determinant relation.

### 7. The Koide relation

A sharp charged-lepton coincidence: the square-root-mass vector sits at exactly **45 degrees** to the democratic axis, giving **Q = 2/3** to one part in a hundred thousand. The campaign decomposes the 45 degrees into a geometric amplitude sqrt(2) plus a free phase, grounds it in the triality-sector and octonion chirality, and maps its scope.

- **[`E-FRC-0057`](../../../test/experiment/gauge/koide-lepton-relation.ts)** - the charged leptons satisfy Koide Q = 2/3 to one part in a hundred thousand, the square-root-mass vector at 45 degrees.
- **[`E-FRC-0058`](../../../test/experiment/gauge/koide-sqrt2-decomposition.ts)** - the 45 degrees decomposes into b/a = sqrt(2) (the 24-cell / D4 ratio) plus a free phase delta = 2/9 radian.
- **[`E-FRC-0059`](../../../test/experiment/gauge/koide-coupling-f4-angle.ts)** - b/a = sqrt(2) reduces to a Z3 coupling cos(45 degrees), the long-short root angle of two-length root families, F4 the instance, B2 the cross control.
- **[`E-FRC-0060`](../../../test/experiment/gauge/koide-chirality-octonion.ts)** - a symmetric overlap gives only a degenerate doublet, so Koide forces a chiral Z3 coupling, and octonion multiplication is the natural source of that chirality.
- **[`E-FRC-0061`](../../../test/experiment/gauge/koide-relation-from-short-long.ts)** - a chiral octonion Z3 mass operator at the F4 short/long ratio gives Q = 2/3 phase-independently, realizing the relation while the individual masses stay free.
- **[`E-FRC-0062`](../../../test/experiment/gauge/koide-assignment-from-sectors.ts)** - the assignment is grounded in the triality-sector geometry (nearest-neighbor long root, between-sector short root), the alternative pairings giving wrong Q.
- **[`E-FRC-0063`](../../../test/experiment/gauge/koide-scope-quarks.ts)** - the mechanism is lepton-specific, up quarks give 0.85 and down quarks 0.73, the scope limit.
- **[`E-FRC-0064`](../../../test/experiment/gauge/koide-tau-prediction.ts)** - Q = 2/3 predicts the tau mass 1776.97 MeV from the electron and muon alone, matching to one part in ten thousand.
- **[`E-FRC-0065`](../../../test/experiment/gauge/koide-scope-neutrinos.ts)** - the relation does not extend to the neutrinos, Q maxes below 2/3, so the mechanism is charged-lepton specific.
- **[`E-FRC-0066`](../../../test/experiment/gauge/koide-phase-not-geometric.ts)** - the Koide phase 2/9, which sets the individual masses, is not geometric, an empirical input while the amplitude sqrt(2) is geometric.

### 8. Three generations and flavor

Why three families, and the structure of their mixing. A preferred octonion direction forces exactly three quaternionic subalgebras, and their symmetry is the full **S3**. Flavor mixing and the neutrino sector are then mapped, with several negatives on what the geometry does and does not fix.

- **[`E-FRC-0069`](../../../test/experiment/gauge/quaternionic-family-count.ts)** - a preferred octonion direction forces exactly three quaternionic subalgebras (three families) with an order-three symmetry.
- **[`E-FRC-0071`](../../../test/experiment/gauge/family-symmetry-group.ts)** - the family symmetry is the full S3, all six permutations from the order-24 stabilizer inside the order-168 automorphism group, refining the order-three result.
- **[`E-FRC-0017`](../../../test/experiment/gauge/exceptional-jordan-generations.ts)** - the rank-3 Albert algebra is forced with an S3 slot symmetry, but its three 8-dim pieces are not three 16-fermion generations.
- **[`E-FRC-0070`](../../../test/experiment/gauge/mixing-angles-not-geometric.ts)** - the generation mixing angles are degenerate at 0 and 90 degrees (no geometric Cabibbo angle) while the order-three family symmetry is geometric.
- **[`E-FRC-0020`](../../../test/experiment/gauge/flavor-mixing-pattern.ts)** - flavor mixing tracks the mass hierarchy, the Cabibbo angle from sqrt(m_d/m_s), small quark versus large lepton mixing, anarchy the control.
- **[`E-FRC-0035`](../../../test/experiment/gauge/neutrino-mass-ladder.ts)** - the neutrinos are the mildest sector on the shell ladder, the geometric origin of the large PMNS mixing, the steep-neutrino case the control.
- **[`E-FRC-0036`](../../../test/experiment/gauge/neutrino-oscillation-tm2.ts)** - the A4 to TM2 prediction gives trimaximal PMNS oscillations, |U_i2|^2 = 1/3 and sin^2 theta12 = 0.341, versus anarchic mixing.
- **[`E-FRC-0037`](../../../test/experiment/gauge/neutrino-seesaw.ts)** - the seesaw uses the so(10) 16-spinor right-handed neutrino to give the observed 0.05 eV scale, the su(5) 15 (no singlet) the control.

### 9. Solitons as matter

Whether the rule stabilizes topological solitons, the route to matter as knots in the field. The Derrick scaling is measured on real direction fields, but whether the base rule supplies the stabilizing sign stays an open gate.

- **[`E-FRC-0046`](../../../test/experiment/gauge/skyrme-sign.ts)** - on a real 3D texture the exchange energy grows with size and the Skyrme energy falls, the Derrick scaling.
- **[`E-FRC-0047`](../../../test/experiment/gauge/soliton-matter.ts)** - two solitons bind in the attractive channel at a finite separation, and the rest mass is additive in topological charge.
- **[`E-FRC-0029`](../../../test/experiment/gauge/kpm-sea-energy.ts)** - the 3D Dirac sea energy of a texture soliton, probed for an interior minimum, the Skyrme sign.
- **[`E-FRC-0001`](../../../test/experiment/gauge/actual-rule-soliton.ts)** - a 1D fermion sea does not settle the 3D Skyrme stabilizing sign, an open gate.


## Added or first run by the 2026-08-31 audit

- **[`E-FRC-0072`](../../../test/experiment/gauge/ward-identity-maxwell.ts)** (L2) - the Ward identity of the lattice Maxwell operator measured exactly: a pure-gauge gradient field is annihilated to machine precision and the zero-mode count equals sites plus two (the gradients plus the three torus Wilson lines) at two lattice sizes, while a Proca mass returns the gradient times m squared and empties the zero-mode space, and a transverse field is not annihilated

## Added by the 2026-09-01 amplitude branch

- **[`E-FRC-0073`](../../../test/experiment/gauge/fills-gate-transport.ts)** - (L2, paper) the fills are the magnitude half of a gauge connection: exact per-edge continuity, reach truncated at exactly an insulating fill over every placement, the Hebbian vacuum insulating, and no phase carried

## The strong force, added 2026-09-25

SU(3) gauge theory and quenched QCD, simulated. The map, the numbers, the caveats and what is still
open are in [`strong-force.md`](strong-force.md).

- **[`E-FRC-0080`](../../../test/experiment/gauge/su3-area-law.ts)** (L2) - 4D SU(3) confines: the Creutz ratio levels off at beta 5.7 (chi(3,3) / chi(2,2) = 0.76), while the U(1) photon (0.32) and weakly coupled SU(3) in the same box (0.36) fall off like a Coulomb force.
- **[`E-FRC-0081`](../../../test/experiment/gauge/gluon-count.ts)** (L2) - the dynamics count 8.02 gauge fields for SU(3) (3.02 for SU(2), 1.01 for U(1)), N = 3.00 colors, and the cubic invariant 0.2500 that lets three quarks form a singlet (0 for SU(2) and U(1)).
- **[`E-FRC-0082`](../../../test/experiment/gauge/su3-deconfinement.ts)** (L2) - SU(3) deconfines on 8^3 x 2 in a bisection bracket [5.100, 5.163] around the published 5.09, with a Polyakov loop that is zero below (1 / sqrt(V) scaling) and three degenerate center sectors above.
- **[`E-FRC-0083`](../../../test/experiment/gauge/asymptotic-freedom.ts)** (L2) - the coupling grows with distance, with the same anti-screening per unit C_A from SU(2) and SU(3) (0.028 each) on top of the color-blind U(1) artifact. Excludes a group-blind rise, not a C_F-proportional one.
- **[`E-FRC-0084`](../../../test/experiment/gauge/quenched-hadrons.ts)** (L2) - the quenched pion is a Goldstone boson: m_pi goes as m_q to the power 0.44, against 0.97 with the gluons off.
- **[`E-FRC-0085`](../../../test/experiment/gauge/quenched-hadrons.ts)** (L2) - the nucleon mass is made by the gluons: several times three free quarks, stopped falling by t = 7, and heavy at zero quark mass while the pion becomes light.
- **[`E-FRC-0086`](../../../test/experiment/gauge/chiral-condensate.ts)** (L2) - chiral symmetry is broken below T_c (Sigma(0) = 0.286 +- 0.028) and restored above it at the same coupling (0.00014), with a noise-free estimator exact on free quarks.
- **[`E-FRC-0087`](../../../test/experiment/gauge/static-quarks.ts)** (L2) - the static potential: sigma a^2 = 0.125 +- 0.021, Coulomb coefficient 0.34 +- 0.05 against pi / 12, and no string tension for the photon.
- **[`E-FRC-0088`](../../../test/experiment/gauge/static-quarks.ts)** (L2) - r0 / a at beta 5.7 and 5.9 against Necco-Sommer, and two-loop running in the plaquette (E-scheme) coupling reproduces the published spacing ratio to 4 percent where the bare coupling misses by 18.
- **[`E-FRC-0089`](../../../test/experiment/gauge/static-quarks.ts)** (L2) - the scalar glueball from a variational basis, m r0 = 4.05 +- 0.50 against the continuum 4.21.
- **[`E-FRC-0090`](../../../test/experiment/gauge/dynamical-quarks.ts)** (L2) - dynamical quarks (HMC) screen the static quark: Re P independent of volume, a center rotation costs ln det = -60, the determinant checked against the hopping expansion.
- **[`E-FRC-0091`](../../../test/experiment/gauge/quenched-hadrons.ts)** (L2) - the rho in a 2 fm box, and m_N / m_rho and the J parameter against their published values.
- **[`E-FRC-0092`](../../../test/experiment/gauge/deterministic-thermalization.ts)** (L2) - deterministic reversible SU(3) dynamics with no random numbers reproduces the heatbath ensemble, plaquette and area law, at the coupling its own temperature predicts.
- **[`E-FRC-0093`](../../../test/experiment/gauge/rule-tone-symmetry.ts)** (L3) to **[`E-FRC-0097`](../../../test/experiment/gauge/rule-triangle-coupling.ts)** - SU(3) is not in the committed rule: 2 of 9 u(3) generators, no order-three coin symmetry, no triangle vertex at one beat or several, and no symmetry restored under coarse-graining. See [`su3-from-the-rule.md`](su3-from-the-rule.md).
- **[`E-FRC-0098`](../../../test/experiment/gauge/su3-deconfinement.ts)** (L2) - the N_t = 4 transition on two volumes, carried to infinite volume, and T_c r0 against its published value.
- **[`E-FRC-0099`](../../../test/experiment/gauge/center-automaton.ts)** (L2) - the Z3 center under a deterministic reversible automaton: confinement at high energy, first-order coexistence, and a frozen ordered phase.
- **[`E-FRC-0100`](../../../test/experiment/gauge/color-needs-amplitudes.ts)** (L1) to **[`E-FRC-0104`](../../../test/experiment/gauge/classical-color-group.ts)** - what the base would need for color: a phase on the pair swap to turn color (0100), pairwise exchange binds the baryon with no three-body vertex (0101), a streaming kinetic demon unfreezes the Z3 center (0102), the classical color group Sigma(648) matches SU(3) Creutz ratios at the N_t = 4 spacing (0103), and its links are three tones and a coin direction, the coin directions forming SL(2, 3) (0104). See [`what-the-base-needs.md`](what-the-base-needs.md).
- **[`E-FRC-0105`](../../../test/experiment/gauge/color-shader.ts)** (L2) - the shader: a phase on the color swap at each encounter of three preserved excitations of the committed rule makes which one ends red a continuous, interfering function of the phase, while no tone observable changes.
- **[`E-FRC-0106`](../../../test/experiment/gauge/color-plane-selection.ts)** (L2) - what selects a color plane in the coin: the 32 triality rotations of W(F4) each fix exactly one A2 and cycle the three triplet copies, and the previous knit keeps one such rotation where the committed turning weave keeps none.
- **[`E-FRC-0107`](../../../test/experiment/gauge/triality-against-universality.ts)** (L2) - that selection cannot live in the committed rule's design family: triality fixes the three color-plane lines, no coupling of all twelve lines is invariant (0 of 10,395), CPT then forces invariance beat by beat, and universality fails. Joining them symmetrically needs a four-line block.
- **[`E-FRC-0108`](../../../test/experiment/gauge/d4-box-triality.ts)** (L2) - a periodic box with D4-shaped periods admits all 1,152 elements of W(F4), against 384 on the integer torus. On it the previous knit commutes with exactly the 2 color-selecting trialities and the committed turning weave with none.
- **[`E-FRC-0109`](../../../test/experiment/gauge/triality-weave.ts)** (L2) - the four-line block built: one charge on a color line exchanged for three across a triality orbit, with triality-symmetric swaps. It reverses exactly, conserves charge, commutes with the triality, is CPT exact, and connects all 12 lines on the vacuum and on a dense background. The committed turning weave splits into 3 sectors on the vacuum.
- **[`E-FRC-0110`](../../../test/experiment/gauge/finite-color-automaton.ts)** (L2) - Sigma(648) under a deterministic reversible rule: an integer plaquette action makes the kinetic demon bookkeeping exact, the run reverses to the bit, and it matches the heatbath where ordered and disordered starts agree and stays inside their envelope where they split.
- **[`E-FRC-0111`](../../../test/experiment/gauge/triality-weave-acceptance.ts)** (L2) - the triality weave on the rest of the acceptance battery: vacuum period 3 from birth, exact superposition, sheet-quantized walls, and dressing growth 4.6 against the committed rule's 13. Neither rule's wall is periodic. Its lone tones do not travel (0 of 24 directions at half the free speed, against 12 in the committed rule).
- **[`E-FRC-0112`](../../../test/experiment/gauge/one-for-three-is-forced.ts)** (L1) - any reversible rule that respects a color triality on every beat can move tones between a color line and its orbit only in threes, whatever it reads: all 531,441 triality-fixed cell states checked through every beat of the triality weave. Also closes two guesses: the orbits do not sum to zero, and the pair clock is no affine map of a qutrit phase space.
- **[`E-FRC-0113`](../../../test/experiment/gauge/hidden-rule-symmetries.ts)** (L2) - every coin symmetry times every tone relabelling times every time shift: the committed rule keeps only the identity, the triality weave only its two trialities.
- **[`E-FRC-0114`](../../../test/experiment/gauge/glide-weave.ts)** (L2) - the glide weave: a pair rule that keeps the triality as a glide in time, moves single tones across, and connects every line, with no CPT and no free traveller.
- **[`E-FRC-0115`](../../../test/experiment/gauge/color-frame.ts)** (L2) - rotating the color of half the box is invisible in the triality and glide vacua and a wall in the committed one, and visible for every rule on a dense background: color read from the coin has one global frame.
- **[`E-FRC-0116`](../../../test/experiment/gauge/vibe-and-flow.ts)** (L1) - the vibe cannot be an axis of the color grid: a line cannot hold (vibe, flow), a charge-conserving rule can respect only 18 of the 216 color maps and none of the 24 turns, and a flow obeying flow <- flow + vibe adds only its own 3 shifts. Vibe and flow are a conjugate pair, and color is a second one.
- **[`E-FRC-0117`](../../../test/experiment/gauge/vibe-role-tilt.ts)** (L2) - the three-trit slot (vibe, role, tilt) as one rule: roles carried along links holding grid moves and swapped where vibes meet. Charge exact, reversal exact, and exactly invariant under an independent change of role frame in every cell, which roles without links or turned by a fixed move per direction are not.
- **[`E-FRC-0118`](../../../test/experiment/gauge/whole-is-a-line.ts)** (L1) - a whole without amplitudes: role points whose vibe-signed sum is zero stay whole under every change of frame exactly when love minus fear is a multiple of 3, the pattern of the quantum singlets of SU(3) and Sigma(648) in all 27 mixes up to six. Three loves are whole exactly on a line of the role grid, the rule of SET.
- **[`E-FRC-0119`](../../../test/experiment/gauge/role-survives-a-loop.ts)** (L2) - a role point carried round a loop survives exactly as often as the adjoint Wilson loop says (grid points fixed = |Tr U|^2 on all 648 elements), on deterministic fields in both phases: a classical role sees the gluon string, and the quark string needs a signed weight.
- **[`E-FRC-0120`](../../../test/experiment/gauge/fear-is-negativity.ts)** (L1) - the singlet is written exactly by whole numbers of loves and fears on the grid of three roles (72 loves, 18 fears) and needs fear, while the all-same whole and a classical state need none: the signed weight is the vibe, fear as negativity.
- **[`E-FRC-0121`](../../../test/experiment/gauge/fear-carries-a-step.ts)** (L1) - a non-classical step moves loves and fears by an exact signed kernel that conserves weight. The swap phase at the cube-root angle has a kernel in quarters, carried exactly by whole loves and fears (growth 2.5 per step). The swap phase at pi / 2 and T need irrational weights.
- **[`E-FRC-0122`](../../../test/experiment/gauge/fear-resolution.ts)** (L1) - carrying quantum steps with whole loves and fears costs grain, not fear: over 8 rounds the units grow 9 to 2,304 while the share of fear settles near 0.3 and the negativity stays under its bound. Love minus fear is exactly one whole every round: the charge is conserved and only the grain shrinks.
- **[`E-FRC-0123`](../../../test/experiment/gauge/vibe-weave.ts)** (L2) - the vibe weave as one rule, with a flow on every link: charge exact, reversal exact with the flows, Gauss's law exact at every cell on every beat, and a change of role frame in every cell commuting with it. The seam, measured: 3,550 of 3,888 pair creations make color from nothing.
- **[`E-FRC-0007`](../../../test/experiment/gauge/confinement.ts)** (L2, rebuilt) - 3D SU(2) carried to the continuum, sqrt(sigma) / g^2 = 0.325 +- 0.047 against 0.3353.

## What this arena establishes

- **Electromagnetism is emergent.** The bare rule's local charge conservation is a U(1) Gauss law, so a massless gauge-invariant photon, the Lorentz force, and a measured g = 2 come out without being put in.
- **The Standard Model gauge group has a geometric home.** It does not fit the coin's D4, but coin plus tone reaches so(10), which contains it and breaks down correctly, one generation being the 16-spinor.
- **A few numbers are pinned by geometry.** The weak mixing angle 3/8, the quantized charges from anomaly cancellation, and the Koide relation Q = 2/3 are fixed by the discrete content, each with a control that breaks it.
- **The mass hierarchy is a mechanism, not a fit.** Exponential localization on the hyperbolic crystal turns even spacing into a multi-decade mass spread, verified on the actual bound state, with the flat lattice giving no hierarchy.
- **Three generations are forced.** A preferred octonion direction selects exactly three quaternionic subalgebras with full S3 family symmetry.
- **The strong force is reproduced, not derived.** SU(3) confinement, deconfinement, the gluon and color counts, anti-screening proportional to C_A, chiral symmetry breaking, the Goldstone pion, the gluon-made nucleon mass and string breaking by dynamical quarks all come out of a Wilson action and staggered quarks at L2, each mapped to a published value. Deterministic reversible dynamics reproduces the same ensemble with no randomness. SU(3) itself is measured absent from the committed {3,4,3,4} rule (L3), and what it would take is named.
- **The limits are stated plainly.** The fine-structure constant runs and is not geometric, the mixing angles and absolute masses are free inputs, the Koide phase is empirical, and the soliton stabilizing sign is an open gate.

## License

MIT

## ClueSurf

Part of the ClueSurf project.
