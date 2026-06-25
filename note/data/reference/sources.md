# Sources

Full citations for every value in this folder. Each data row carries a **source tag** (the `source` column in the CSVs); this file expands each tag into a complete citation with a link. Every empirical value was **fetched from and reconciled against the primary source on 2026-06-24** (the `verified` column in the CSVs records that date). Corrections from that pass are noted inline in the data files.

## Empirical sources

### PDG-2024 (and PDG-2022)
**Particle Data Group**, Review of Particle Physics. S. Navas et al. (Particle Data Group), *Phys. Rev. D* **110**, 030001 (2024). Prior edition: R. L. Workman et al. (Particle Data Group), *Prog. Theor. Exp. Phys.* **2022**, 083C01 (2022). Online: https://pdg.lbl.gov. Covers particle masses, charges, lifetimes, the gauge couplings, sin^2(theta_W), and the CKM matrix.

### CODATA-2022
**CODATA Task Group on Fundamental Constants.** P. J. Mohr, D. B. Newell, B. N. Taylor, E. Tiesinga, "CODATA recommended values of the fundamental physical constants: 2022," published 2024-2025; arXiv:2409.03787. NIST reference (live values used here): https://physics.nist.gov/cuu/Constants/. The current release, superseding CODATA 2018. Covers G, the fine-structure constant, the Rydberg constant, the Bohr radius, and the lepton magnetic-moment anomalies. The 2026-06-24 verification updated alpha, 1/alpha, mu_0, R_inf, a_0, a_e, and a_mu from their 2018 values to the 2022 ones.

### SI-2019
**BIPM**, The International System of Units (SI Brochure), 9th edition (2019). https://www.bipm.org/en/publications/si-brochure. Source for the constants that are now **exact by definition**: c, h, e, the Boltzmann constant, and the Avogadro number.

### NuFIT-6.0
**NuFIT collaboration.** I. Esteban, M. C. Gonzalez-Garcia, M. Maltoni, T. Schwetz, et al., "NuFIT 6.0: updated global analysis of three-flavor neutrino oscillations," *JHEP* **12** (2024) 216; arXiv:2410.05380. http://www.nu-fit.org. The current release (October 2024), superseding NuFIT 5.2 (2022). Covers the PMNS angles, the CP phase, and the neutrino mass-squared splittings. Values here are the standard reference column **without** Super-Kamiokande atmospheric data, normal ordering. The 2026-06-24 verification updated all PMNS values from NuFIT 5.2 to 6.0. (The nu-fit.org site returned a TLS error during the check, so values were cross-read from the arXiv paper.)

### Planck-2018
**Planck Collaboration.** N. Aghanim et al., "Planck 2018 results. VI. Cosmological parameters," *Astron. Astrophys.* **641**, A6 (2020); erratum *A&A* **652**, C4 (2021). Covers the Hubble constant, the dark-energy and matter density fractions, and (with COBE/FIRAS for T_CMB: Fixsen, *ApJ* **707**, 916, 2009) the cosmological numbers. The competing local Hubble value is SH0ES: A. G. Riess et al., *ApJ Lett.* **934**, L7 (2022).

## Mathematical sources (for the derived structure)

### math:Hurwitz
A. Hurwitz, "Uber die Composition der quadratischen Formen von beliebig vielen Variabeln," *Nachr. Ges. Wiss. Gottingen* (1898). The theorem that normed division algebras exist only in dimensions **1, 2, 4, 8**. Topological proof: R. Bott, J. Milnor, *Bull. AMS* **64** (1958); M. Kervaire (1958).

### math:polytopes
H. S. M. Coxeter, *Regular Polytopes*, 3rd ed., Dover (1973). The 24-cell, its census (24 vertices, 96 edges, 96 faces, 24 cells), self-duality, the regular 4-polytopes, and the 600-cell containing 5 inscribed 24-cells.

### math:quaternions-octonions
J. H. Conway, D. A. Smith, *On Quaternions and Octonions*, A K Peters (2003). The Hurwitz unit quaternions, the binary tetrahedral group (order 24), the icosian/octonion lattices. Also J. C. Baez, "The Octonions," *Bull. AMS* **39** (2002) 145, for triality, F4, E8, and the exceptional Jordan algebra J3(O).

### math:lie-groups
The root counts and group orders (D4: 24 roots; F4: 48 roots, order 1152; E8: 240 roots; SO(10): dimension 45) are standard Lie theory, e.g. J. E. Humphreys, *Introduction to Lie Algebras and Representation Theory*, Springer (1972).

## Physics-result sources (for the targets the experiments reproduce)

### phys:Tsirelson
B. S. Cirel'son (Tsirelson), "Quantum generalizations of Bell's inequality," *Lett. Math. Phys.* **4**, 93 (1980). The CHSH quantum bound 2 times sqrt 2. Original inequality: J. F. Clauser, M. A. Horne, A. Shimony, R. A. Holt, *Phys. Rev. Lett.* **23**, 880 (1969).

### phys:Born
M. Born, *Zeitschrift fur Physik* **37**, 863 (1926). The probability-as-amplitude-squared rule. Derivations used here: A. M. Gleason, *J. Math. Mech.* **6**, 885 (1957); W. H. Zurek (envariance), *Phys. Rev. A* **71**, 052105 (2005).

### phys:contextuality
N. D. Mermin, "Simple unified form for the major no-hidden-variables theorems," *Phys. Rev. Lett.* **65**, 3373 (1990); A. Peres, *Phys. Lett. A* **151**, 107 (1990). The magic-square values 6 (quantum) versus 4 (noncontextual). Roots: S. Kochen, E. P. Specker, *J. Math. Mech.* **17**, 59 (1967).

### phys:leggett-garg
A. J. Leggett, A. Garg, "Quantum mechanics versus macroscopic realism," *Phys. Rev. Lett.* **54**, 857 (1985). The temporal bound 1 (macrorealist) versus 3/2 (quantum).

### phys:dimension
J. Myrheim, CERN preprint TH-2538 (1978); D. A. Meyer, "The dimension of causal sets," PhD thesis, MIT (1988). The Myrheim-Meyer causal-set dimension estimator.

### phys:gut
H. Georgi, S. L. Glashow, *Phys. Rev. Lett.* **32**, 438 (1974) (SU(5)); H. Fritzsch, P. Minkowski, *Ann. Phys.* **93**, 193 (1975) (SO(10)). The sin^2(theta_W) = 3/8 and the 5/3 hypercharge normalization at unification, and the 16 of SO(10).

### phys:gatto
R. Gatto, G. Sartori, M. Tonin, "Weak self-masses, Cabibbo angle, and broken SU(2) x SU(2)," *Phys. Lett. B* **28**, 128 (1968). The relation tan(theta_C) = sqrt(m_d / m_s).

### phys:ryu-takayanagi
S. Ryu, T. Takayanagi, "Holographic derivation of entanglement entropy from AdS/CFT," *Phys. Rev. Lett.* **96**, 181602 (2006). The area-law / geodesic entanglement entropy.

## Derived-here sources (computed by this project)

### vibe
Derived within vibe theory. The papers: `../../../text/v13/` (especially the appendix "from nothing to the 24-cell"). The computations: the experiment suite `../../../test/experiment/` and the measure library `../../../code/measure/`. Each derived value's `source` cell names the relevant experiment or measure where possible. These results are this package's own, reproducible by running the suite (`pnpm test`).

## Verification status

On **2026-06-24** every empirical value was fetched from and reconciled against its primary source (NIST/CODATA, PDG 2024, NuFIT 6.0, Planck 2018). The `verified` column in each CSV records that date. What the pass changed:

- **Constants:** seven values were on CODATA 2018 and moved to CODATA 2022 (alpha, 1/alpha, mu_0, R_inf, a_0, a_e, a_mu). The defined-exact constants, G, and the Planck units were unchanged.
- **Particles:** PDG 2024 shifted down (4.67 to 4.70), strange (93.4 to 93.5), top (172.69 to 172.57), tau (1776.86 to 1776.93), the Higgs (125.25 to 125.20), alpha_s (0.1179 to 0.1180), sin^2(theta_W) (0.23121 to 0.23129), and the nu_e bound (1.1 to 0.8 eV).
- **Mixing:** the nine CKM magnitudes were already correct; the derived angles in degrees and the Jarlskog invariant were corrected (J: 3.08e-5 to 3.12e-5, theta_13: 0.201 to 0.214 degrees). The whole PMNS sector moved from NuFIT 5.2 to NuFIT 6.0.
- **Cosmology:** all four Planck values were already correct; a SH0ES local Hubble row was added for the tension.

Values still shift each review, and several carry genuine tension (the W-boson mass with the CDF-2022 outlier, the muon g-2, the Hubble constant). For any precision-critical claim, read the value from the cited source directly, and re-run the verification when a new PDG, CODATA, or NuFIT release lands.
