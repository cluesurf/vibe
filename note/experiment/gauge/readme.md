# Gauge Arena

**71 experiments.** Codes **[`E-FRC-0001`](../../../test/experiment/gauge/actual-rule-soliton.ts)** through **[`E-FRC-0071`](../../../test/experiment/gauge/family-symmetry-group.ts)**.

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
- **[`E-FRC-0062`](../../../test/experiment/gauge/koide-assignment-from-sectors.ts)** - the assignment is grounded in the triality-sector geometry (nearest-neighbour long root, between-sector short root), the alternative pairings giving wrong Q.
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

## What this arena establishes

- **Electromagnetism is emergent.** The bare rule's local charge conservation is a U(1) Gauss law, so a massless gauge-invariant photon, the Lorentz force, and a measured g = 2 come out without being put in.
- **The Standard Model gauge group has a geometric home.** It does not fit the coin's D4, but coin plus tone reaches so(10), which contains it and breaks down correctly, one generation being the 16-spinor.
- **A few numbers are pinned by geometry.** The weak mixing angle 3/8, the quantized charges from anomaly cancellation, and the Koide relation Q = 2/3 are fixed by the discrete content, each with a control that breaks it.
- **The mass hierarchy is a mechanism, not a fit.** Exponential localization on the hyperbolic crystal turns even spacing into a multi-decade mass spread, verified on the actual bound state, with the flat lattice giving no hierarchy.
- **Three generations are forced.** A preferred octonion direction selects exactly three quaternionic subalgebras with full S3 family symmetry.
- **The limits are stated plainly.** The fine-structure constant runs and is not geometric, the mixing angles and absolute masses are free inputs, the Koide phase is empirical, and the soliton stabilizing sign is an open gate.

## License

MIT

## ClueSurf

Part of the ClueSurf project.
