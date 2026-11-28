module

public import Vibe.Algebra
public import Vibe.Rule
public import Vibe.SchurGap
public import Vibe.CuspGrowth
public import Vibe.SpectralSharp
public import Vibe.BallisticDoublon
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
# Vibe Theory: Exact `ℤ[ω][1/7]` Composite Trion, Hyperbolic Spectral-Gap Excision & Depressed-Cubic Holographic Rate

Lean 4.35.0 + Mathlib formalization of Wave-3 Tracks W9 & W10 (Milestone P8-D):

1. **Exact `ℤ[ω][1/7]` `k = 3` Composite Trion Eigenvalue, Decay Ratio & `k = 4` Tetron Numerical BIC Candidate (`thm_ct_trion_eigenvalue_and_ratio`):**
   - Exact unit-modulus eigenvalue `λ_3 = -(8 + 3 ω) / 7 = (-13 - 3 i √3) / 14` (`|-(8 + 3 ω)|^2 = 49 = 7^2`),
   - Exact spatial/spin decay ratio `r = (-3 - 2 ω) / 7` (`|-3 - 2 ω|^2 = 7`, `|r|^2 = 1/7 < 1`) with
     conjugate `r̄ = (-1 + 2 ω) / 7` satisfying `r * r̄ = 1/7`,
   - Exact `k = 4` `Sym^4` tetron numerical BIC candidate `λ_4 = (16 - 39 ω) / 49 = conj(λ_3)^2`
     (`|16 - 39 ω|^2 = 49^2 = 2401`, `λ_4 * λ_3^2 = 1` in `ℤ[ω][1/7]`; Lean verifies unit modulus and
     `conj(λ_3)^2`, not a `k = 4` operator).
2. **Microscopic `D ∘ M_meet ∘ D` Collision Modes, Infinite-Line Shift Pullback & Exact `Sym^3` Eigenstate
   (`thm_ct_trion_gate_and_collision_modes`, `thm_ct_trion_shift_pullback_exact`, `thm_ct_trion_infinite_line_eigenstate`):**
   - Derived directly from `Vibe.Rule.halfCoin2` (`2 D`), `Vibe.Rule.coin2` (`2 C = 2 D^2`), and `M_meet`:
     proves `det(2 D) = 4 ζ_6`, unitarity of `M_meet`, exact `Sym^3` contact eigenvalue `ζ_6 * ω * ζ_6 = ω^2`
     versus `Alt^3` contact eigenvalue `ζ_6 * 1 * ζ_6 = ω`, and exact `8 × 8` 3-vibe coin unitarity.
   - Proves the exact forward-shift-to-pullback bijection for the geodesic sublattice shift `S : (m, t) ↦ (m - t, t)`
     for ALL valid relative separations `d1, d2 : Nat` (`d1 + d2 ≥ 1`).
   - Proves the literal cleared infinite-line `P = 0` relative-coordinate fiber eigenvalue equation
     `7 * (8 U_trion ψ)(d1, d2, t1, t2, t3) = 8 * (7 λ_3) * ψ(d1, d2, t1, t2, t3)`
     for EVERY truncation depth `M ≥ 2`, EVERY `d1, d2 : Nat` with `1 ≤ d1 + d2 ≤ M`, and EVERY valid spin triple.
3. **Exact Finite-Box Geometric Series, Contact Probability `6/7` & Spin-Resolved `IPR = 9/32` (`thm_ct_trion_norm_contact_and_ipr`):**
   - Exact finite partial sums for `r = 7`, `r = 49`, and `r = 2401` (`∀ N : Nat`),
   - Exact 1D pair-contact and 2D separated box sums tied directly to `Eis.normSq (trionState (2 * N) ...)`
     and `(Eis.normSq (trionState (2 * N) ...))^2` for ALL `N : Nat`, certifying `N_pair = 7/3`, `N_sep = 7/18`,
     `N_tot = 49/18`, **`p_pair = 6/7`**, canonical top-cluster weight **`p((0,+)(0,-)(2,+)) = 18/49`**
     (even-sublattice index `d2 = 1`, `x = 2 d2`) and mirror weight, and spin-resolved configuration-basis
     **`IPR = 9/32`**.
4. **Exact `P = 0` Spectral-Gap Separation (`thm_ct_trion_gap_separation`):**
   - Exact 1-body dispersion `det(2 C) = 4 ω`, `tr(2 C) = 2 ζ_6`; exact `3-free` `P = 0` threshold
     `cos(-π/2 - 3 arcsin(1/4)) = -11/16` (with 1D cubic monotonicity of `sin(3 θ)` on `0 ≤ sin θ ≤ 1/4`);
     exact `doublon(0) + free(0)` threshold `ω λ_2 = (-15 - 8 ω) / 13` from `Vibe.BallisticDoublon.doublonLam13`
     (`Re = -11/13`, `|λ_3 - ω λ_2|^2 = 3/91`, `|λ_3 + 1|^2 = 1/7`); and exact Taylor cosine separation at
     conservative buffer `-2.5813 < arg(ω λ_2(0)) ≈ -2.579523`:
     `-1 < Re(λ_3) = -13/14 < -17/20 < -11/13 < -11/16`.
5. **Hyperbolic Spectral-Gap Excision Algebra (`thm_ct_mpair_gap_margin`, `thm_ct_hyperbolic_excision_pocket`):**
   - Exact `cotSqZeta18 = 4 g^2 - 24 g + 35 ∈ ℤ[ζ_9]` from `Vibe.Algebra.Ninth.gapSqZeta18` satisfying
     `g * (cotSqZeta18 + 1) = 4` and `v^3 - 33 v^2 + 27 v - 3 = 0`, exact triple-angle identities,
     strict monotonicity & root brackets `0 < tan^2(π/18) < 1/32 < 1/25` (`tan(π/18) < 1/5`) and
     `32 < 32163/1000 < cot^2(π/18) < 32164/1000 < 33`, certifying `1/3 < 25 < 32 < cot^2(π/18)` (`> 8.6×` and
     `> 9.79×` margins against the external analytic Parseval supremum `sup |t_hat| = 1 / √3`).
   - Imports `Vibe.SpectralSharp.thm_ss_normalized_gap_gt_half` (`ρ / 24 ≤ 335 / 672 < 1 / 2`) and
     `Vibe.BallisticDoublon.doublonLam13`, proves `cos(P_*(E_meet(0))) = 4 Re(ω^2 λ_2) - 3 = 7/13 > 1/2 > 335/672`,
     exact flat-`D_4` pocket boundary bounds using the upward upper bound `q_c = 0.24413393... π < (2442/10000) π < π/4`
     (`cos(q_c) > 7/10 > 7/13 > 1/2 > 335/672`), and the abstract rational ceiling-vs-floor excision contradiction.
6. **Exact Depressed-Cubic Holographic Asymptotic Rate (`thm_ct_holographic_rate_depressed_cubic`):**
   - Exact integer and homogeneous rational polynomial transformations linking `Vibe.CuspGrowth`'s Steinberg cubic
     `λ^3 - 21 λ^2 + 51 λ - 23` directly to W10's depressed cubic `u^3 - 12 u + 12` (`u = 24 r_∞`) and
     `1152 r_∞^3 - 24 r_∞ + 1`, strict decreasing monotonicity on `[1, 2]` (uniqueness of the root in `[1, 2]`),
     and exact sign-change brackets `1115749/1000000 < u < 1115750/1000000` and
     `464895/10000000 < r_∞ < 464896/10000000`.

## Honest Scope Boundary

This file machine-checks the exact finite/algebraic/symbolic statements above in Lean 4 + Mathlib.
The following analytic and full-Fock bridge steps lie **outside** this Lean module and remain external
results of the companion derivations (`test/verify/multibody-mpair-and-chiral-clusters.ts` and
`test/verify/happy-code-3434-holography.ts`):

- **4D-to-1D Fock-beat reduction**: Reduction of the full 8-layer 4D `{3,4,3,4}` Fock beat `U` (`Vibe.FockBeat`)
  to the 1D geodesic-line `P = 0` relative-coordinate transfer operator `trionStep8` with zero cross-line
  leakage (and the nonzero-`P` composite-particle Bloch dispersion `E_trion(P)`).
- **Analytic Parseval & Birman-Schwinger criterion**: The Fourier/Parseval bound `sup |t_hat| = 1 / √3`
  for the `M_pair(ζ_18)` pole equation in `(0, π/3)` and `(-π, -2π/3)` (Lean proves `cot^2(π/18) > 32.163 > 32 > 1/3`
  and the exact minimal/triple-angle cubics).
- **Global 2D `3-free` minimization**: Minimizing `∑_{i=1}^3 arcsin((1/2) cos p_i)` over the 2D plane
  `p_1 + p_2 + p_3 = 0` (Lean certifies the exact 1D cubic monotonicity `sin(3 θ) ≤ 11/16` on `0 ≤ sin θ ≤ 1/4`).
- **Infinite-graph Rayleigh-Ritz operator bridge & flat-`D_4` bisection input**: Lifting the finite
  Depth-1 Schur row-sum ceiling `335/672` (`Vibe.SpectralSharp`) to the infinite-graph `{3,4,3,4}` two-body
  continuum, the external bisection value `q_c = 0.24413393... π < (2442/10000) π`, and the unexcised lower
  overlap window `[π/3, 1.58824)` (at `335/672`) / `[π/3, 1.57737)` (at `0.477170`) (W9-M1 boundary).
- **Bipartite shell-counting formula**: Derivation of `r_∞ = (λ + 1) / (24 (λ - 1))` connecting the Steinberg
  Perron root `λ` (`Vibe.CuspGrowth`) to the W10 holographic asymptotic encoding rate `r_∞`.
- **`k = 4` tetron operator**: `tetronLam49` is checked algebraically for unit modulus and `conj(λ_3)^2`;
  no `k = 4` `Sym^4` transfer operator is formalized here.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 0: Exact Power, Geometric-Series & `Eis` Scaling Helpers -/

/-- Exact integer exponentiation `b ^ n` (self-contained in `Vibe.CompositeTrion`). -/
def ctPowInt (b : Int) : Nat → Int
  | 0 => 1
  | n + 1 => b * ctPowInt b n

/-- Exact `r^(N - 1)`-scaled geometric partial sum `∑_{k = 0}^{N - 1} c r^{N - 1 - k}`. -/
def ctGeomScaled (r c : Int) : Nat → Int
  | 0 => 0
  | N + 1 => r * ctGeomScaled r c N + c

private theorem ct_powInt_add (b : Int) (m n : Nat) :
    ctPowInt b (m + n) = ctPowInt b m * ctPowInt b n := by
  induction m with
  | zero => simp [ctPowInt]
  | succ k ih =>
    rw [show (k + 1) + n = (k + n) + 1 by omega]
    change b * ctPowInt b (k + n) = (b * ctPowInt b k) * ctPowInt b n
    rw [ih]; ring

private theorem ct_powInt_sq (b : Int) (k : Nat) :
    ctPowInt b k * ctPowInt b k = ctPowInt (b * b) k := by
  induction k with
  | zero => simp [ctPowInt]
  | succ m ih =>
    change (b * ctPowInt b m) * (b * ctPowInt b m) = (b * b) * ctPowInt (b * b) m
    calc (b * ctPowInt b m) * (b * ctPowInt b m)
        = (b * b) * (ctPowInt b m * ctPowInt b m) := by ring
      _ = (b * b) * ctPowInt (b * b) m := by rw [ih]

private theorem ct_geom_series_closed (r c : Int) (N : Nat) :
    (r - 1) * ctGeomScaled r c N = c * (ctPowInt r N - 1) := by
  induction N with
  | zero => simp [ctGeomScaled, ctPowInt]
  | succ k ih =>
    change (r - 1) * (r * ctGeomScaled r c k + c) = c * (r * ctPowInt r k - 1)
    calc (r - 1) * (r * ctGeomScaled r c k + c)
        = r * ((r - 1) * ctGeomScaled r c k) + (r - 1) * c := by ring
      _ = r * (c * (ctPowInt r k - 1)) + (r - 1) * c := by rw [ih]
      _ = c * (r * ctPowInt r k - 1) := by ring

private theorem ct_geom_scale (r c : Int) (N : Nat) :
    ctGeomScaled r c N = c * ctGeomScaled r 1 N := by
  induction N with
  | zero => simp [ctGeomScaled]
  | succ k ih =>
    change r * ctGeomScaled r c k + c = c * (r * ctGeomScaled r 1 k + 1)
    rw [ih]; ring

private theorem ct_eis_scale_add (k : Int) (x y : Eis) :
    Eis.add (Eis.scale k x) (Eis.scale k y) = Eis.scale k (Eis.add x y) := by
  cases x; cases y; ext <;> simp [Eis.add, Eis.scale] <;> ring

private theorem ct_eis_scale_scale (c d : Int) (x : Eis) :
    Eis.scale c (Eis.scale d x) = Eis.scale (c * d) x := by
  cases x; ext <;> simp [Eis.scale] <;> ring

private theorem ct_eis_scale_comm (c d : Int) (x : Eis) :
    Eis.scale c (Eis.scale d x) = Eis.scale d (Eis.scale c x) := by
  rw [ct_eis_scale_scale, ct_eis_scale_scale, mul_comm]

private theorem ct_eis_mul_scale_right (k : Int) (x y : Eis) :
    Eis.mul x (Eis.scale k y) = Eis.scale k (Eis.mul x y) := by
  cases x; cases y; ext <;> simp [Eis.mul, Eis.scale] <;> ring

private theorem ct_eis_normSq_scale (c : Int) (x : Eis) :
    Eis.normSq (Eis.scale c x) = (c * c) * Eis.normSq x := by
  cases x; simp only [Eis.normSq, Eis.scale]; ring


/-! ## Section 1: Exact `ℤ[ω][1/7]` Composite Trion Eigenvalue, Decay Ratio & `k = 4` Tetron Numerical BIC Candidate -/

/-- Exact `k = 3` `M_meet` `Sym^3` trion eigenvalue numerator `7 λ_3 = -(8 + 3 ω) ∈ ℤ[ω]`. -/
def trionLam7 : Eis := ⟨-8, -3⟩

/-- Exact `k = 3` trion decay numerator `7 r = -3 - 2 ω ∈ ℤ[ω]` (`|r|^2 = 7/49 = 1/7`). -/
def trionR7 : Eis := ⟨-3, -2⟩

/-- Exact conjugate decay numerator `7 r̄ = conj(7 r) = -1 + 2 ω ∈ ℤ[ω]`. -/
def trionRBar7 : Eis := Eis.conj trionR7

/-- Exact `k = 4` `Sym^4` tetron numerical BIC candidate numerator `49 λ_4 = 16 - 39 ω ∈ ℤ[ω]`
    (Lean checks exact unit modulus and `conj(λ_3)^2`, not a `k = 4` transfer operator). -/
def tetronLam49 : Eis := ⟨16, -39⟩

/-- Headline Theorem 1 (Exact `ℤ[ω][1/7]` `k = 3` Trion Eigenvalue, Decay Ratio & `k = 4` Tetron Numerical BIC Candidate):
    1. `λ_3 = -(8 + 3 ω) / 7 = (-13 - 3 i √3) / 14` lies identically on the unit circle:
       `normSq (-(8 + 3 ω)) = 49 = 7^2`, `conj(7 λ_3) * (7 λ_3) = 49`, `(-13)^2 + 3(-3)^2 = 14^2`.
    2. Decay ratio `r = (-3 - 2 ω) / 7` satisfies `normSq (-3 - 2 ω) = 7` (`|r|^2 = 7/49 = 1/7 < 1`),
       `conj(7 r) = -1 + 2 ω`, and `(7 r̄)(7 r) = 7`.
    3. `k = 4` `Sym^4` tetron numerical BIC candidate `λ_4 = (16 - 39 ω) / 49 = conj(λ_3)^2` satisfies
       exact unit modulus `normSq (16 - 39 ω) = 2401 = 49^2`, `conj(7 λ_3)^2 = 49 λ_4`, and
       `(7 λ_3)^2 * (49 λ_4) = 2401` (exact `λ_4 * λ_3^2 = 1` in `ℤ[ω][1/7]`; algebraic check only,
       not a `k = 4` operator proof). -/
theorem thm_ct_trion_eigenvalue_and_ratio :
    (Eis.normSq trionLam7 = 49 ∧
     Eis.mul (Eis.conj trionLam7) trionLam7 = Eis.ofInt 49 ∧
     2 * trionLam7.a - trionLam7.b = -13 ∧
     (-13 : Int) * (-13) + 3 * trionLam7.b * trionLam7.b = 14 * 14) ∧
    (Eis.normSq trionR7 = 7 ∧
     Eis.normSq trionR7 < 49 ∧
     trionRBar7 = ⟨-1, 2⟩ ∧
     Eis.normSq trionRBar7 = 7 ∧
     Eis.mul trionRBar7 trionR7 = Eis.ofInt 7) ∧
    (Eis.normSq tetronLam49 = 2401 ∧
     Eis.mul (Eis.conj tetronLam49) tetronLam49 = Eis.ofInt 2401 ∧
     Eis.mul (Eis.conj trionLam7) (Eis.conj trionLam7) = tetronLam49 ∧
     Eis.mul (Eis.mul trionLam7 trionLam7) tetronLam49 = Eis.ofInt 2401 ∧
     2 * tetronLam49.a - tetronLam49.b = 71 ∧
     (71 : Int) * 71 + 3 * tetronLam49.b * tetronLam49.b = 98 * 98) := by
  decide


/-! ## Section 2: Microscopic `D ∘ M_meet ∘ D` Collision Modes & Infinite-Line `Sym^3` Eigenstate -/

/-- Exact `2 × 2` role-exchange collision matrix `2 M_meet = [[1 + ω, ω - 1], [ω - 1, 1 + ω]]`
    on two distinct-role, same-tone vibes meeting in opposite slots `(+, -)` at one dock. -/
def trionMeet2 : Mat2Eis :=
  ⟨⟨1, 1⟩, ⟨-1, 1⟩, ⟨-1, 1⟩, ⟨1, 1⟩⟩

/-- Exact `2 × 2` composite contact block `2 (D ∘ M_meet ∘ D)` on `{|r_a, r_b⟩, |r_b, r_a⟩}`:
    each `D` acts on an occupied antipodal pair by its scalar determinant `det(D) = ζ_6`,
    so `D ∘ M_meet ∘ D = ζ_6^2 M_meet = ω M_meet`. -/
def trionContactBlock2 : Mat2Eis :=
  Mat2Eis.scaleEis (Eis.mul Eis.zeta6 Eis.zeta6) trionMeet2

/-- Exact `Sym^3` pair-contact scalar phase `ζ_6 * ω * ζ_6 = ω^2` derived from `D ∘ M_meet ∘ D`. -/
def trionContactSymPhase : Eis := Eis.mul (Eis.mul Eis.zeta6 Eis.omega) Eis.zeta6

/-- Exact `Alt^3` pair-contact scalar phase `ζ_6 * 1 * ζ_6 = ω` derived from `D ∘ M_meet ∘ D`. -/
def trionContactAltPhase : Eis := Eis.mul (Eis.mul Eis.zeta6 Eis.one) Eis.zeta6

/-- Entry `(i, j)` of the single-vibe bare coin `2 C = 2 D^2` (`Vibe.Rule.coin2`). -/
def ctCoin2At (i j : Fin 2) : Eis :=
  if i = j then coin2.m00 else coin2.m01

/-- Entry of the 3-vibe tensor coin `8 (C ⊗ C ⊗ C) = (2 C)^{⊗3}` on `Fin 2 × Fin 2 × Fin 2`. -/
def ctTensorCoin8Entry (t1 t2 t3 s1 s2 s3 : Fin 2) : Eis :=
  Eis.mul (ctCoin2At t1 s1) (Eis.mul (ctCoin2At t2 s2) (ctCoin2At t3 s3))

/-- Exact `8 (C ⊗ C ⊗ C)` action on a 3-spinor `v : Fin 2 → Fin 2 → Fin 2 → Eis`. -/
def ctTensorCoin8Vec (v : Fin 2 → Fin 2 → Fin 2 → Eis) (t1 t2 t3 : Fin 2) : Eis :=
  let sum3 (s1 s2 : Fin 2) : Eis :=
    Eis.add (Eis.mul (ctTensorCoin8Entry t1 t2 t3 s1 s2 ⟨0, by decide⟩) (v s1 s2 ⟨0, by decide⟩))
            (Eis.mul (ctTensorCoin8Entry t1 t2 t3 s1 s2 ⟨1, by decide⟩) (v s1 s2 ⟨1, by decide⟩))
  let sum2 (s1 : Fin 2) : Eis := Eis.add (sum3 s1 ⟨0, by decide⟩) (sum3 s1 ⟨1, by decide⟩)
  Eis.add (sum2 ⟨0, by decide⟩) (sum2 ⟨1, by decide⟩)

/-- Gram entry `(C^{⊗3}† C^{⊗3})_{(a1,a2,a3),(b1,b2,b3)}` scaled by `64`. -/
def ctTensorCoin8Gram (a1 a2 a3 b1 b2 b3 : Fin 2) : Eis :=
  let term (t1 t2 t3 : Fin 2) : Eis :=
    Eis.mul (Eis.conj (ctTensorCoin8Entry t1 t2 t3 a1 a2 a3))
            (ctTensorCoin8Entry t1 t2 t3 b1 b2 b3)
  let sum3 (t1 t2 : Fin 2) : Eis := Eis.add (term t1 t2 ⟨0, by decide⟩) (term t1 t2 ⟨1, by decide⟩)
  let sum2 (t1 : Fin 2) : Eis := Eis.add (sum3 t1 ⟨0, by decide⟩) (sum3 t1 ⟨1, by decide⟩)
  Eis.add (sum2 ⟨0, by decide⟩) (sum2 ⟨1, by decide⟩)

/-- Headline Theorem 2 (Microscopic `D ∘ M_meet ∘ D` Collision Modes & `8 × 8` 3-Vibe Coin Unitarity):
    directly from `Vibe.Rule.halfCoin2` (`2 D`), `Vibe.Rule.coin2` (`2 C = 2 D^2`), and `trionMeet2`:
    1. `det(2 D) = 4 ζ_6`, `(2 D)^2 = 2 (2 C)`, and `M_meet` + `D ∘ M_meet ∘ D` are exact unitaries (`M† M = 4 I`).
    2. On the symmetric role state `|r_a r_b⟩ + |r_b r_a⟩` (`Sym^3`), `2 M_meet` has eigenvalue `2 ω` and
       `2 (D ∘ M_meet ∘ D)` has eigenvalue `2 ω^2 = 2 trionContactSymPhase`; on the antisymmetric state (`Alt^3`),
       `2 M_meet` has eigenvalue `2` and `2 (D ∘ M_meet ∘ D)` has eigenvalue `2 ω = 2 trionContactAltPhase`.
    3. The `8 × 8` 3-vibe lone-particle coin `(2 C)^{⊗3}` satisfies exact unitarity `((2 C)^{⊗3})† (2 C)^{⊗3} = 64 I_8`
       across all `8 × 8 = 64` spin-triple pairs! -/
theorem thm_ct_trion_gate_and_collision_modes :
    (Mat2Eis.det halfCoin2 = Eis.scale 4 Eis.zeta6 ∧
     Mat2Eis.mul halfCoin2 halfCoin2 = Mat2Eis.scale 2 coin2 ∧
     Mat2Eis.mul (Mat2Eis.dag trionMeet2) trionMeet2 = Mat2Eis.scale 4 Mat2Eis.id ∧
     Mat2Eis.mul (Mat2Eis.dag trionContactBlock2) trionContactBlock2 = Mat2Eis.scale 4 Mat2Eis.id) ∧
    (Eis.add trionMeet2.m00 trionMeet2.m01 = Eis.scale 2 Eis.omega ∧
     Eis.sub trionMeet2.m00 trionMeet2.m01 = Eis.scale 2 Eis.one ∧
     Eis.add trionContactBlock2.m00 trionContactBlock2.m01 = Eis.scale 2 trionContactSymPhase ∧
     Eis.sub trionContactBlock2.m00 trionContactBlock2.m01 = Eis.scale 2 trionContactAltPhase ∧
     trionContactSymPhase = Eis.omega2 ∧
     trionContactAltPhase = Eis.omega) ∧
    (∀ a1 a2 a3 b1 b2 b3 : Fin 2,
      ctTensorCoin8Gram a1 a2 a3 b1 b2 b3 =
        if a1 = b1 ∧ a2 = b2 ∧ a3 = b3 then Eis.ofInt 64 else Eis.zero) := by
  refine ⟨⟨by decide, thm2_halfCoin_sq_eq_coin, by decide, by decide⟩, by decide, by decide⟩

/-- Validity predicate for a `P = 0` relative `k = 3` geodesic-line configuration `(d1, d2, s1, s2, s3)`:
    `d1 + d2 ≥ 1` (at most 2 vibes at a dock), `d1 = 0 → (s1, s2) = (+, -)`, `d2 = 0 → (s2, s3) = (+, -)`. -/
def ValidTrionCfg (d1 d2 : Nat) (s1 s2 s3 : Fin 2) : Prop :=
  d1 + d2 ≥ 1 ∧
  (d1 = 0 → s1 = ⟨0, by decide⟩ ∧ s2 = ⟨1, by decide⟩) ∧
  (d2 = 0 → s2 = ⟨0, by decide⟩ ∧ s3 = ⟨1, by decide⟩)

/-- Pre-shift relative separations `(e1, e2)` pulled back across the geodesic even-sublattice shift
    `S : (m, t) ↦ (m - t, t)` from target `(0, t1), (d1, t2), (d1 + d2, t3)`. -/
def trionPullE1 (d1 : Nat) (t1 t2 : Fin 2) : Nat := d1 + t2.val - t1.val
def trionPullE2 (d2 : Nat) (t2 t3 : Fin 2) : Nat := d2 + t3.val - t2.val

-- [helper]
def ctLePt (a b : Int × Fin 2) : Bool :=
  decide (a.1 < b.1 ∨ (a.1 = b.1 ∧ a.2.val ≤ b.2.val))

/-- Forward geodesic even-sublattice shift `S : (m, t) ↦ (m - t, t)` on three ordered particles
    `(0, t1), (e1, t2), (e1 + e2, t3)`, returning sorted relative coordinates `(d1', d2', s1', s2', s3')`
    (with `Int` dock positions normalized by subtracting the leftmost shifted dock). -/
def trionForwardShift (e1 e2 : Nat) (t1 t2 t3 : Fin 2) :
    Nat × Nat × Fin 2 × Fin 2 × Fin 2 :=
  let p1 : Int × Fin 2 := ((0 : Int) - (t1.val : Int), t1)
  let p2 : Int × Fin 2 := ((e1 : Int) - (t2.val : Int), t2)
  let p3 : Int × Fin 2 := (((e1 + e2 : Nat) : Int) - (t3.val : Int), t3)
  let (q1, q2) := if ctLePt p1 p2 then (p1, p2) else (p2, p1)
  let (r2, r3) := if ctLePt q2 p3 then (q2, p3) else (p3, q2)
  let (s1, s2) := if ctLePt q1 r2 then (q1, r2) else (r2, q1)
  ((s2.1 - s1.1).toNat, (r3.1 - s2.1).toNat, s1.2, s2.2, r3.2)

private theorem ct_forwardShift_ordered (e1 e2 : Nat) (t1 t2 t3 : Fin 2)
    (h12 : (0 : Int) - (t1.val : Int) < (e1 : Int) - (t2.val : Int) ∨
           ((0 : Int) - (t1.val : Int) = (e1 : Int) - (t2.val : Int) ∧ t1.val ≤ t2.val))
    (h23 : (e1 : Int) - (t2.val : Int) < ((e1 + e2 : Nat) : Int) - (t3.val : Int) ∨
           ((e1 : Int) - (t2.val : Int) = ((e1 + e2 : Nat) : Int) - (t3.val : Int) ∧ t2.val ≤ t3.val)) :
    trionForwardShift e1 e2 t1 t2 t3 =
      ((((e1 : Int) - (t2.val : Int)) - ((0 : Int) - (t1.val : Int))).toNat,
       ((((e1 + e2 : Nat) : Int) - (t3.val : Int)) - ((e1 : Int) - (t2.val : Int))).toNat,
       t1, t2, t3) := by
  unfold trionForwardShift
  have b12 : ctLePt ((0 : Int) - (t1.val : Int), t1) ((e1 : Int) - (t2.val : Int), t2) = true :=
    decide_eq_true h12
  have b23 : ctLePt ((e1 : Int) - (t2.val : Int), t2) (((e1 + e2 : Nat) : Int) - (t3.val : Int), t3) = true :=
    decide_eq_true h23
  dsimp only; rw [b12]; simp only [↓reduceIte]; rw [b23]; simp only [↓reduceIte]; rw [b12]; simp

private theorem ct_forwardShift_swap12 (e1 e2 : Nat) (t1 t2 t3 : Fin 2)
    (h12 : ¬ ((0 : Int) - (t1.val : Int) < (e1 : Int) - (t2.val : Int) ∨
              ((0 : Int) - (t1.val : Int) = (e1 : Int) - (t2.val : Int) ∧ t1.val ≤ t2.val)))
    (h13 : (0 : Int) - (t1.val : Int) < ((e1 + e2 : Nat) : Int) - (t3.val : Int) ∨
           ((0 : Int) - (t1.val : Int) = ((e1 + e2 : Nat) : Int) - (t3.val : Int) ∧ t1.val ≤ t3.val))
    (h21 : (e1 : Int) - (t2.val : Int) < (0 : Int) - (t1.val : Int) ∨
           ((e1 : Int) - (t2.val : Int) = (0 : Int) - (t1.val : Int) ∧ t2.val ≤ t1.val)) :
    trionForwardShift e1 e2 t1 t2 t3 =
      ((((0 : Int) - (t1.val : Int)) - ((e1 : Int) - (t2.val : Int))).toNat,
       ((((e1 + e2 : Nat) : Int) - (t3.val : Int)) - ((0 : Int) - (t1.val : Int))).toNat,
       t2, t1, t3) := by
  unfold trionForwardShift
  have b12 : ctLePt ((0 : Int) - (t1.val : Int), t1) ((e1 : Int) - (t2.val : Int), t2) = false :=
    decide_eq_false h12
  have b13 : ctLePt ((0 : Int) - (t1.val : Int), t1) (((e1 + e2 : Nat) : Int) - (t3.val : Int), t3) = true :=
    decide_eq_true h13
  have b21 : ctLePt ((e1 : Int) - (t2.val : Int), t2) ((0 : Int) - (t1.val : Int), t1) = true :=
    decide_eq_true h21
  dsimp only; rw [b12]; simp only [Bool.false_eq_true, ↓reduceIte]; rw [b13]; simp only [↓reduceIte]; rw [b21]; simp

private theorem ct_forwardShift_swap23 (e1 e2 : Nat) (t1 t2 t3 : Fin 2)
    (h12 : (0 : Int) - (t1.val : Int) < (e1 : Int) - (t2.val : Int) ∨
           ((0 : Int) - (t1.val : Int) = (e1 : Int) - (t2.val : Int) ∧ t1.val ≤ t2.val))
    (h23 : ¬ ((e1 : Int) - (t2.val : Int) < ((e1 + e2 : Nat) : Int) - (t3.val : Int) ∨
              ((e1 : Int) - (t2.val : Int) = ((e1 + e2 : Nat) : Int) - (t3.val : Int) ∧ t2.val ≤ t3.val)))
    (h13 : (0 : Int) - (t1.val : Int) < ((e1 + e2 : Nat) : Int) - (t3.val : Int) ∨
           ((0 : Int) - (t1.val : Int) = ((e1 + e2 : Nat) : Int) - (t3.val : Int) ∧ t1.val ≤ t3.val)) :
    trionForwardShift e1 e2 t1 t2 t3 =
      (((((e1 + e2 : Nat) : Int) - (t3.val : Int)) - ((0 : Int) - (t1.val : Int))).toNat,
       (((e1 : Int) - (t2.val : Int)) - (((e1 + e2 : Nat) : Int) - (t3.val : Int))).toNat,
       t1, t3, t2) := by
  unfold trionForwardShift
  have b12 : ctLePt ((0 : Int) - (t1.val : Int), t1) ((e1 : Int) - (t2.val : Int), t2) = true :=
    decide_eq_true h12
  have b23 : ctLePt ((e1 : Int) - (t2.val : Int), t2) (((e1 + e2 : Nat) : Int) - (t3.val : Int), t3) = false :=
    decide_eq_false h23
  have b13 : ctLePt ((0 : Int) - (t1.val : Int), t1) (((e1 + e2 : Nat) : Int) - (t3.val : Int), t3) = true :=
    decide_eq_true h13
  dsimp only; rw [b12]; simp only [↓reduceIte]; rw [b23]; simp only [Bool.false_eq_true, ↓reduceIte]; rw [b13]; simp

private theorem ct_fin2_cases (x : Fin 2) : x = ⟨0, by decide⟩ ∨ x = ⟨1, by decide⟩ := by
  rcases x with ⟨v, hv⟩; cases v with | zero => exact Or.inl rfl | succ k => cases k with | zero => exact Or.inr rfl | succ _ => omega

private theorem ct_beq_zero_false (n : Nat) (hn : n ≠ 0) : (n == 0) = false := by
  cases n with | zero => exact absurd rfl hn | succ _ => rfl

/-- Headline Theorem 3 (Exact Infinite-Line Geodesic Shift Pullback & Forward Roundtrip):
    for EVERY valid `k = 3` configuration `(d1, d2, t1, t2, t3)` across ALL `d1, d2 : Nat`:
    1. `e1 = d1 + t2 - t1` and `e2 = d2 + t3 - t2` satisfy `e1 + e2 = d1 + d2 + t3 - t1 ≥ 1`,
       never collide simultaneously (`¬ (e1 = 0 ∧ e2 = 0)`), and `e1 + e2 ≤ d1 + d2 + 1`.
    2. Applying the literal forward shift + lexicographic sort `trionForwardShift` to the pre-shift
       configuration `(e1, e2, t1', t2', t3')` (where a `0`-separation contact pair sits as `(+, -)`)
       recovers `(d1, d2, t1, t2, t3)` IDENTICALLY for ALL `d1, d2 : Nat`! -/
theorem thm_ct_trion_shift_pullback_exact (d1 d2 : Nat) (t1 t2 t3 : Fin 2)
    (hV : ValidTrionCfg d1 d2 t1 t2 t3) :
    let e1 := trionPullE1 d1 t1 t2
    let e2 := trionPullE2 d2 t2 t3
    let u1 : Fin 2 := if e1 = 0 then ⟨0, by decide⟩ else t1
    let u2 : Fin 2 := if e1 = 0 then ⟨1, by decide⟩ else if e2 = 0 then ⟨0, by decide⟩ else t2
    let u3 : Fin 2 := if e2 = 0 then ⟨1, by decide⟩ else t3
    (e1 + e2 ≥ 1 ∧ ¬ (e1 = 0 ∧ e2 = 0) ∧
     e1 + e2 + t1.val = d1 + d2 + t3.val ∧
     ValidTrionCfg e1 e2 u1 u2 u3 ∧
     trionForwardShift e1 e2 u1 u2 u3 = (d1, d2, t1, t2, t3)) := by
  dsimp only
  unfold trionPullE1 trionPullE2
  obtain ⟨hSum, hZ1, hZ2⟩ := hV
  rcases ct_fin2_cases t1 with rfl | rfl <;>
    rcases ct_fin2_cases t2 with rfl | rfl <;>
    rcases ct_fin2_cases t3 with rfl | rfl
  · -- (0, 0, 0)
    have hd1 : d1 ≥ 1 := by cases d1 with | zero => exact absurd (hZ1 rfl).2 (by decide) | succ _ => omega
    have hd2 : d2 ≥ 1 := by cases d2 with | zero => exact absurd (hZ2 rfl).2 (by decide) | succ _ => omega
    dsimp only
    rw [show d1 + 0 - 0 = d1 by omega, show d2 + 0 - 0 = d2 by omega]
    have hne1 : ¬ (d1 = 0) := by omega
    have hne2 : ¬ (d2 = 0) := by omega
    rw [ite_eq_right hne1, ite_eq_right hne1, ite_eq_right hne2, ite_eq_right hne2]
    refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun h => absurd h hne2⟩, ?_⟩
    rw [ct_forwardShift_ordered d1 d2 _ _ _ (Or.inl (by omega)) (Or.inl (by omega))]
    exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
  · -- (0, 0, 1)
    have hd1 : d1 ≥ 1 := by cases d1 with | zero => exact absurd (hZ1 rfl).2 (by decide) | succ _ => omega
    dsimp only
    rw [show d1 + 0 - 0 = d1 by omega, show d2 + 1 - 0 = d2 + 1 by omega]
    have hne1 : ¬ (d1 = 0) := by omega
    have hne2 : ¬ (d2 + 1 = 0) := by omega
    rw [ite_eq_right hne1, ite_eq_right hne1, ite_eq_right hne2, ite_eq_right hne2]
    refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun h => absurd h hne2⟩, ?_⟩
    have h23 : (d1 : Int) - (0 : Int) < ((d1 + (d2 + 1) : Nat) : Int) - (1 : Int) ∨
        ((d1 : Int) - (0 : Int) = ((d1 + (d2 + 1) : Nat) : Int) - (1 : Int) ∧ (0 : Nat) ≤ 1) := by
      cases d2 with | zero => exact Or.inr ⟨by omega, by omega⟩ | succ _ => exact Or.inl (by omega)
    rw [ct_forwardShift_ordered d1 (d2 + 1) _ _ _ (Or.inl (by omega)) h23]
    exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
  · -- (0, 1, 0)
    have hd2 : d2 ≥ 1 := by cases d2 with | zero => exact absurd (hZ2 rfl).1 (by decide) | succ _ => omega
    dsimp only
    rw [show d1 + 1 - 0 = d1 + 1 by omega, show d2 + 0 - 1 = d2 - 1 by omega]
    have hne1 : ¬ (d1 + 1 = 0) := by omega
    rw [ite_eq_right hne1, ite_eq_right hne1]
    cases d2 with
    | zero => omega
    | succ k =>
      cases k with
      | zero =>
        rw [show (1 : Nat) - 1 = 0 from rfl, ite_eq_left rfl, ite_eq_left rfl]
        refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun _ => ⟨rfl, rfl⟩⟩, ?_⟩
        have h13 : (0 : Int) - (0 : Int) < ((d1 + 1 + 0 : Nat) : Int) - (1 : Int) ∨
            ((0 : Int) - (0 : Int) = ((d1 + 1 + 0 : Nat) : Int) - (1 : Int) ∧ (0 : Nat) ≤ 1) := by
          cases d1 with | zero => exact Or.inr ⟨by omega, by omega⟩ | succ _ => exact Or.inl (by omega)
        rw [ct_forwardShift_swap23 (d1 + 1) 0 _ _ _ (Or.inl (by omega)) (by dsimp only; omega) h13]
        exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
      | succ j =>
        have hne2 : ¬ (j + 2 - 1 = 0) := by omega
        rw [ite_eq_right hne2, ite_eq_right hne2]
        refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun h => absurd h hne2⟩, ?_⟩
        have h12 : (0 : Int) - (0 : Int) < ((d1 + 1 : Nat) : Int) - (1 : Int) ∨
            ((0 : Int) - (0 : Int) = ((d1 + 1 : Nat) : Int) - (1 : Int) ∧ (0 : Nat) ≤ 1) := by
          cases d1 with | zero => exact Or.inr ⟨by omega, by omega⟩ | succ _ => exact Or.inl (by omega)
        rw [ct_forwardShift_ordered (d1 + 1) (j + 2 - 1) _ _ _ h12 (Or.inl (by dsimp only; omega))]
        exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
  · -- (0, 1, 1)
    have hd2 : d2 ≥ 1 := by cases d2 with | zero => exact absurd (hZ2 rfl).1 (by decide) | succ _ => omega
    dsimp only
    rw [show d1 + 1 - 0 = d1 + 1 by omega, show d2 + 1 - 1 = d2 by omega]
    have hne1 : ¬ (d1 + 1 = 0) := by omega
    have hne2 : ¬ (d2 = 0) := by omega
    rw [ite_eq_right hne1, ite_eq_right hne1, ite_eq_right hne2, ite_eq_right hne2]
    refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun h => absurd h hne2⟩, ?_⟩
    have h12 : (0 : Int) - (0 : Int) < ((d1 + 1 : Nat) : Int) - (1 : Int) ∨
        ((0 : Int) - (0 : Int) = ((d1 + 1 : Nat) : Int) - (1 : Int) ∧ (0 : Nat) ≤ 1) := by
      cases d1 with | zero => exact Or.inr ⟨by omega, by omega⟩ | succ _ => exact Or.inl (by omega)
    rw [ct_forwardShift_ordered (d1 + 1) d2 _ _ _ h12 (Or.inl (by dsimp only; omega))]
    exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
  · -- (1, 0, 0)
    have hd1 : d1 ≥ 1 := by cases d1 with | zero => exact absurd (hZ1 rfl).1 (by decide) | succ _ => omega
    have hd2 : d2 ≥ 1 := by cases d2 with | zero => exact absurd (hZ2 rfl).2 (by decide) | succ _ => omega
    dsimp only
    rw [show d1 + 0 - 1 = d1 - 1 by omega, show d2 + 0 - 0 = d2 by omega]
    have hne2 : ¬ (d2 = 0) := by omega
    rw [ite_eq_right hne2]
    cases d1 with
    | zero => omega
    | succ k =>
      cases k with
      | zero =>
        rw [show (1 : Nat) - 1 = 0 from rfl, ite_eq_left rfl, ite_eq_left rfl, ite_eq_right hne2]
        refine ⟨by omega, by omega, by omega, ⟨by omega, fun _ => ⟨rfl, rfl⟩, fun h => absurd h hne2⟩, ?_⟩
        rw [ct_forwardShift_swap12 0 d2 _ _ _ (by dsimp only; omega) (Or.inl (by dsimp only; omega)) (Or.inl (by dsimp only; omega))]
        exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
      | succ j =>
        have hne1 : ¬ (j + 2 - 1 = 0) := by omega
        rw [ite_eq_right hne1, ite_eq_right hne1, ite_eq_right hne2]
        refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun h => absurd h hne2⟩, ?_⟩
        rw [ct_forwardShift_ordered (j + 2 - 1) d2 _ _ _ (Or.inl (by dsimp only; omega)) (Or.inl (by dsimp only; omega))]
        exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
  · -- (1, 0, 1)
    have hd1 : d1 ≥ 1 := by cases d1 with | zero => exact absurd (hZ1 rfl).1 (by decide) | succ _ => omega
    dsimp only
    rw [show d1 + 0 - 1 = d1 - 1 by omega, show d2 + 1 - 0 = d2 + 1 by omega]
    have hne2 : ¬ (d2 + 1 = 0) := by omega
    rw [ite_eq_right hne2]
    cases d1 with
    | zero => omega
    | succ k =>
      cases k with
      | zero =>
        rw [show (1 : Nat) - 1 = 0 from rfl, ite_eq_left rfl, ite_eq_left rfl, ite_eq_right hne2]
        refine ⟨by omega, by omega, by omega, ⟨by omega, fun _ => ⟨rfl, rfl⟩, fun h => absurd h hne2⟩, ?_⟩
        have h13 : (0 : Int) - (0 : Int) < ((0 + (d2 + 1) : Nat) : Int) - (1 : Int) ∨
            ((0 : Int) - (0 : Int) = ((0 + (d2 + 1) : Nat) : Int) - (1 : Int) ∧ (0 : Nat) ≤ 1) := by
          cases d2 with | zero => exact Or.inr ⟨by omega, by omega⟩ | succ _ => exact Or.inl (by omega)
        rw [ct_forwardShift_swap12 0 (d2 + 1) _ _ _ (by dsimp only; omega) h13 (Or.inl (by dsimp only; omega))]
        exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
      | succ j =>
        have hne1 : ¬ (j + 2 - 1 = 0) := by omega
        rw [ite_eq_right hne1, ite_eq_right hne1, ite_eq_right hne2]
        refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun h => absurd h hne2⟩, ?_⟩
        have h23 : ((j + 2 - 1 : Nat) : Int) - (0 : Int) < ((j + 2 - 1 + (d2 + 1) : Nat) : Int) - (1 : Int) ∨
            (((j + 2 - 1 : Nat) : Int) - (0 : Int) = ((j + 2 - 1 + (d2 + 1) : Nat) : Int) - (1 : Int) ∧ (0 : Nat) ≤ 1) := by
          cases d2 with | zero => exact Or.inr ⟨by omega, by omega⟩ | succ _ => exact Or.inl (by omega)
        rw [ct_forwardShift_ordered (j + 2 - 1) (d2 + 1) _ _ _ (Or.inl (by dsimp only; omega)) h23]
        exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
  · -- (1, 1, 0)
    have hd1 : d1 ≥ 1 := by cases d1 with | zero => exact absurd (hZ1 rfl).1 (by decide) | succ _ => omega
    have hd2 : d2 ≥ 1 := by cases d2 with | zero => exact absurd (hZ2 rfl).1 (by decide) | succ _ => omega
    dsimp only
    rw [show d1 + 1 - 1 = d1 by omega, show d2 + 0 - 1 = d2 - 1 by omega]
    have hne1 : ¬ (d1 = 0) := by omega
    rw [ite_eq_right hne1, ite_eq_right hne1]
    cases d2 with
    | zero => omega
    | succ k =>
      cases k with
      | zero =>
        rw [show (1 : Nat) - 1 = 0 from rfl, ite_eq_left rfl, ite_eq_left rfl]
        refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun _ => ⟨rfl, rfl⟩⟩, ?_⟩
        rw [ct_forwardShift_swap23 d1 0 _ _ _ (Or.inl (by dsimp only; omega)) (by dsimp only; omega) (Or.inl (by dsimp only; omega))]
        exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
      | succ j =>
        have hne2 : ¬ (j + 2 - 1 = 0) := by omega
        rw [ite_eq_right hne2, ite_eq_right hne2]
        refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun h => absurd h hne2⟩, ?_⟩
        rw [ct_forwardShift_ordered d1 (j + 2 - 1) _ _ _ (Or.inl (by dsimp only; omega)) (Or.inl (by dsimp only; omega))]
        exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)
  · -- (1, 1, 1)
    have hd1 : d1 ≥ 1 := by cases d1 with | zero => exact absurd (hZ1 rfl).1 (by decide) | succ _ => omega
    have hd2 : d2 ≥ 1 := by cases d2 with | zero => exact absurd (hZ2 rfl).1 (by decide) | succ _ => omega
    dsimp only
    rw [show d1 + 1 - 1 = d1 by omega, show d2 + 1 - 1 = d2 by omega]
    have hne1 : ¬ (d1 = 0) := by omega
    have hne2 : ¬ (d2 = 0) := by omega
    rw [ite_eq_right hne1, ite_eq_right hne1, ite_eq_right hne2, ite_eq_right hne2]
    refine ⟨by omega, by omega, by omega, ⟨by omega, fun h => absurd h hne1, fun h => absurd h hne2⟩, ?_⟩
    rw [ct_forwardShift_ordered d1 d2 _ _ _ (Or.inl (by dsimp only; omega)) (Or.inl (by dsimp only; omega))]
    exact Prod.ext (by dsimp only; omega) (Prod.ext (by dsimp only; omega) rfl)

/-- Exact unit-cell trion amplitude `7^(d1 + d2) * ψ(d1, d2, s1, s2, s3) ∈ ℤ[ω]`,
    depending only on boundary contact flags `(d1 == 0, d2 == 0)` and outer spins `(s1, s3)`. -/
def trionCell (z1 z2 : Bool) (s1 s3 : Fin 2) : Eis :=
  match z1, z2 with
  | true, _ => if s3 = ⟨0, by decide⟩ then Eis.ofInt 7 else trionR7
  | false, true => if s1 = ⟨1, by decide⟩ then Eis.ofInt 7 else trionR7
  | false, false =>
      match s1, s3 with
      | ⟨0, _⟩, ⟨0, _⟩ => Eis.ofInt 7
      | ⟨1, _⟩, ⟨1, _⟩ => Eis.ofInt 7
      | ⟨0, _⟩, ⟨1, _⟩ => trionR7
      | ⟨1, _⟩, ⟨0, _⟩ => Eis.scale 7 trionRBar7

/-- Exact common-denominator (`7^(M + 1)`-scaled) infinite-line `k = 3` `Sym^3` trion wavefunction
    `7^(M + 1) * ψ(d1, d2, s1, s2, s3) = 7^(M + 1 - (d1 + d2)) * trionCell (d1 == 0) (d2 == 0) s1 s3`. -/
def trionState (M d1 d2 : Nat) (s1 _s2 s3 : Fin 2) : Eis :=
  Eis.scale (ctPowInt 7 (M + 1 - (d1 + d2))) (trionCell (d1 == 0) (d2 == 0) s1 s3)

/-- Literal infinite-line `P = 0` `k = 3` `Sym^3` transfer operator `8 U_trion = 8 S ∘ (D ∘ M_meet ∘ D)`
    acting on any relative wavefunction `ψ : Nat → Nat → Fin 2 → Fin 2 → Fin 2 → Eis`. -/
def trionStep8 (ψ : Nat → Nat → Fin 2 → Fin 2 → Fin 2 → Eis)
    (d1 d2 : Nat) (t1 t2 t3 : Fin 2) : Eis :=
  let e1 := trionPullE1 d1 t1 t2
  let e2 := trionPullE2 d2 t2 t3
  if e1 = 0 then
    Eis.scale 4
      (Eis.mul trionContactSymPhase
        (Eis.add
          (Eis.mul (ctCoin2At t3 ⟨0, by decide⟩) (ψ 0 e2 ⟨0, by decide⟩ ⟨1, by decide⟩ ⟨0, by decide⟩))
          (Eis.mul (ctCoin2At t3 ⟨1, by decide⟩) (ψ 0 e2 ⟨0, by decide⟩ ⟨1, by decide⟩ ⟨1, by decide⟩))))
  else if e2 = 0 then
    Eis.scale 4
      (Eis.mul trionContactSymPhase
        (Eis.add
          (Eis.mul (ctCoin2At t1 ⟨0, by decide⟩) (ψ e1 0 ⟨0, by decide⟩ ⟨0, by decide⟩ ⟨1, by decide⟩))
          (Eis.mul (ctCoin2At t1 ⟨1, by decide⟩) (ψ e1 0 ⟨1, by decide⟩ ⟨0, by decide⟩ ⟨1, by decide⟩))))
  else
    ctTensorCoin8Vec (fun s1 s2 s3 => ψ e1 e2 s1 s2 s3) t1 t2 t3

private def ct_cellStep8 (e1z e2z : Bool) (t1 t2 t3 : Fin 2) : Eis :=
  if e1z = true then
    Eis.scale 4
      (Eis.mul trionContactSymPhase
        (Eis.add
          (Eis.mul (ctCoin2At t3 ⟨0, by decide⟩) (trionCell true false ⟨0, by decide⟩ ⟨0, by decide⟩))
          (Eis.mul (ctCoin2At t3 ⟨1, by decide⟩) (trionCell true false ⟨0, by decide⟩ ⟨1, by decide⟩))))
  else if e2z = true then
    Eis.scale 4
      (Eis.mul trionContactSymPhase
        (Eis.add
          (Eis.mul (ctCoin2At t1 ⟨0, by decide⟩) (trionCell false true ⟨0, by decide⟩ ⟨1, by decide⟩))
          (Eis.mul (ctCoin2At t1 ⟨1, by decide⟩) (trionCell false true ⟨1, by decide⟩ ⟨1, by decide⟩))))
  else
    ctTensorCoin8Vec (fun s1 _s2 s3 => trionCell false false s1 s3) t1 t2 t3

private theorem ct_tensorCoin8Vec_scale (c : Int) (v : Fin 2 → Fin 2 → Fin 2 → Eis)
    (t1 t2 t3 : Fin 2) :
    ctTensorCoin8Vec (fun s1 s2 s3 => Eis.scale c (v s1 s2 s3)) t1 t2 t3 =
      Eis.scale c (ctTensorCoin8Vec v t1 t2 t3) := by
  unfold ctTensorCoin8Vec
  simp only [ct_eis_mul_scale_right, ct_eis_scale_add]

private theorem ct_cellStep8_all_stencils :
    ∀ (r1 r2 : Fin 3) (t1 t2 t3 : Fin 2),
      r1.val + r2.val ≥ 1 →
      (r1.val = 0 → t1 = ⟨0, by decide⟩ ∧ t2 = ⟨1, by decide⟩) →
      (r2.val = 0 → t2 = ⟨0, by decide⟩ ∧ t3 = ⟨1, by decide⟩) →
      let e1z := (trionPullE1 r1.val t1 t2 == 0)
      let e2z := (trionPullE2 r2.val t2 t3 == 0)
      let lhsFactor : Int :=
        if t1.val = t3.val then 7 else if t1.val = 0 then 1 else 49
      Eis.scale lhsFactor (ct_cellStep8 e1z e2z t1 t2 t3) =
        Eis.scale 8 (Eis.mul trionLam7 (trionCell (r1.val == 0) (r2.val == 0) t1 t3)) := by
  decide

private theorem ct_trionStep8_factor (M d1 d2 : Nat) (t1 t2 t3 : Fin 2)
    (hV : ValidTrionCfg d1 d2 t1 t2 t3) :
    let e1 := trionPullE1 d1 t1 t2
    let e2 := trionPullE2 d2 t2 t3
    trionStep8 (trionState M) d1 d2 t1 t2 t3 =
      Eis.scale (ctPowInt 7 (M + 1 - (e1 + e2))) (ct_cellStep8 (e1 == 0) (e2 == 0) t1 t2 t3) := by
  dsimp only
  have hNotBoth := (thm_ct_trion_shift_pullback_exact d1 d2 t1 t2 t3 hV).2.1
  unfold trionStep8 ct_cellStep8
  by_cases h1 : trionPullE1 d1 t1 t2 = 0
  · have h2 : trionPullE2 d2 t2 t3 ≠ 0 := fun hz => hNotBoth ⟨h1, hz⟩
    have hb1 : (trionPullE1 d1 t1 t2 == 0) = true := by rw [h1]; rfl
    have hb2 : (trionPullE2 d2 t2 t3 == 0) = false := ct_beq_zero_false _ h2
    rw [ite_eq_left h1, hb1, ite_eq_left rfl, h1]
    unfold trionState
    simp only [Nat.zero_add, beq_self_eq_true, hb2, ct_eis_mul_scale_right, ct_eis_scale_add]
    rw [ct_eis_scale_comm 4]
  · have hb1 : (trionPullE1 d1 t1 t2 == 0) = false := ct_beq_zero_false _ h1
    by_cases h2 : trionPullE2 d2 t2 t3 = 0
    · have hb2 : (trionPullE2 d2 t2 t3 == 0) = true := by rw [h2]; rfl
      rw [ite_eq_right h1, ite_eq_left h2, hb1, hb2]
      simp only [Bool.false_eq_true, ↓reduceIte, h2]
      unfold trionState
      simp only [Nat.add_zero, beq_self_eq_true, hb1, ct_eis_mul_scale_right, ct_eis_scale_add]
      rw [ct_eis_scale_comm 4]
    · have hb2 : (trionPullE2 d2 t2 t3 == 0) = false := ct_beq_zero_false _ h2
      rw [ite_eq_right h1, ite_eq_right h2, hb1, hb2]
      simp only [Bool.false_eq_true, ↓reduceIte]
      unfold trionState
      simp only [hb1, hb2]
      exact ct_tensorCoin8Vec_scale (ctPowInt 7 (M + 1 - (trionPullE1 d1 t1 t2 + trionPullE2 d2 t2 t3)))
        (fun s1 _s2 s3 => trionCell false false s1 s3) t1 t2 t3

/-- Headline Theorem 4 (Exact Infinite-Line `P = 0` Fiber `k = 3` `Sym^3` Composite Trion Eigenstate):
    `trionState` is a **relative-coordinate `l^2` bound eigenstate of the fixed center-of-mass momentum
    `P = 0` fiber** (a dispersing 1D composite-particle Bloch band `E_trion(P)` along a single geodesic
    line embedded in 4D `{3,4,3,4}`), NOT an isolated point-spectrum eigenvalue in `l^2(V^3)`.
    For EVERY truncation depth `M ≥ 2`, EVERY pair of relative separations `d1, d2 : Nat`
    satisfying `1 ≤ d1 + d2 ≤ M`, and EVERY valid spin triple `(t1, t2, t3) : Fin 2`
    (covering ALL contact boundaries `d1 = 0`, `d2 = 0`, `d1 = 1`, `d2 = 1`, and ALL bulk
    separations `d1 ≥ 2, d2 ≥ 2` across the infinite 1D geodesic line of `{3,4,3,4}`):
    `7 * (8 U_trion ψ)(d1, d2, t1, t2, t3) = 8 * (7 λ_3) * ψ(d1, d2, t1, t2, t3)` identically in `ℤ[ω]`! -/
theorem thm_ct_trion_infinite_line_eigenstate (M : Nat) (_hM : M ≥ 2)
    (d1 d2 : Nat) (hLe : d1 + d2 ≤ M) (t1 t2 t3 : Fin 2)
    (hV : ValidTrionCfg d1 d2 t1 t2 t3) :
    Eis.scale 7 (trionStep8 (trionState M) d1 d2 t1 t2 t3) =
      Eis.scale 8 (Eis.mul trionLam7 (trionState M d1 d2 t1 t2 t3)) := by
  have hFac := ct_trionStep8_factor M d1 d2 t1 t2 t3 hV
  have hSumEq := (thm_ct_trion_shift_pullback_exact d1 d2 t1 t2 t3 hV).2.2.1
  let r1 : Fin 3 := if d1 = 0 then ⟨0, by decide⟩ else if d1 = 1 then ⟨1, by decide⟩ else ⟨2, by decide⟩
  let r2 : Fin 3 := if d2 = 0 then ⟨0, by decide⟩ else if d2 = 1 then ⟨1, by decide⟩ else ⟨2, by decide⟩
  have hD1Z : (d1 == 0) = (r1.val == 0) := by cases d1 with | zero => rfl | succ k => cases k <;> rfl
  have hD2Z : (d2 == 0) = (r2.val == 0) := by cases d2 with | zero => rfl | succ k => cases k <;> rfl
  have hE1Z : (trionPullE1 d1 t1 t2 == 0) = (trionPullE1 r1.val t1 t2 == 0) := by
    unfold trionPullE1
    cases d1 with
    | zero => rfl
    | succ k =>
      cases k with
      | zero => rfl
      | succ j =>
        have hv1 := t1.isLt; have hv2 := t2.isLt
        rw [ct_beq_zero_false _ (by omega), ct_beq_zero_false _ (by change 2 + t2.val - t1.val ≠ 0; omega)]
  have hE2Z : (trionPullE2 d2 t2 t3 == 0) = (trionPullE2 r2.val t2 t3 == 0) := by
    unfold trionPullE2
    cases d2 with
    | zero => rfl
    | succ k =>
      cases k with
      | zero => rfl
      | succ j =>
        have hv2 := t2.isLt; have hv3 := t3.isLt
        rw [ct_beq_zero_false _ (by omega), ct_beq_zero_false _ (by change 2 + t3.val - t2.val ≠ 0; omega)]
  have hRepSum : r1.val + r2.val ≥ 1 := by
    have hS := hV.1
    cases d1 with
    | zero => cases d2 with | zero => omega | succ k => cases k <;> simp [r1, r2]
    | succ k => cases k <;> cases d2 with | zero => simp [r1, r2] | succ j => cases j <;> simp [r1, r2]
  have hRepZ1 : r1.val = 0 → t1 = ⟨0, by decide⟩ ∧ t2 = ⟨1, by decide⟩ := fun hr =>
    hV.2.1 (by cases d1 with | zero => rfl | succ k => cases k <;> simp [r1] at hr)
  have hRepZ2 : r2.val = 0 → t2 = ⟨0, by decide⟩ ∧ t3 = ⟨1, by decide⟩ := fun hr =>
    hV.2.2 (by cases d2 with | zero => rfl | succ k => cases k <;> simp [r2] at hr)
  have hStencil := ct_cellStep8_all_stencils r1 r2 t1 t2 t3 hRepSum hRepZ1 hRepZ2
  dsimp only at hStencil
  rw [← hE1Z, ← hE2Z, ← hD1Z, ← hD2Z] at hStencil
  rw [hFac]
  unfold trionState
  rw [ct_eis_mul_scale_right, ct_eis_scale_comm 8]
  have hv1 := t1.isLt; have hv3 := t3.isLt
  by_cases hEqT : t1.val = t3.val
  · rw [ite_eq_left hEqT] at hStencil
    rw [show M + 1 - (trionPullE1 d1 t1 t2 + trionPullE2 d2 t2 t3) = M + 1 - (d1 + d2) by omega,
        ct_eis_scale_comm 7]
    exact congrArg (Eis.scale (ctPowInt 7 (M + 1 - (d1 + d2)))) hStencil
  · by_cases hT10 : t1.val = 0
    · rw [ite_eq_right hEqT, ite_eq_left hT10] at hStencil
      have hExpStep : (M + 1 - (trionPullE1 d1 t1 t2 + trionPullE2 d2 t2 t3)) + 1 = M + 1 - (d1 + d2) := by omega
      rw [ct_eis_scale_scale 7]
      have hPow : 7 * ctPowInt 7 (M + 1 - (trionPullE1 d1 t1 t2 + trionPullE2 d2 t2 t3)) =
          ctPowInt 7 (M + 1 - (d1 + d2)) := by
        change ctPowInt 7 ((M + 1 - (trionPullE1 d1 t1 t2 + trionPullE2 d2 t2 t3)) + 1) = _
        rw [hExpStep]
      rw [hPow]
      have hOne : ∀ x : Eis, Eis.scale 1 x = x := fun x => by cases x; simp [Eis.scale]
      rw [hOne] at hStencil
      exact congrArg (Eis.scale (ctPowInt 7 (M + 1 - (d1 + d2)))) hStencil
    · rw [ite_eq_right hEqT, ite_eq_right hT10] at hStencil
      have hd1Ge : d1 ≥ 1 := by
        cases d1 with
        | zero => have h0 : t1.val = 0 := congrArg Fin.val (hV.2.1 rfl).1; omega
        | succ _ => omega
      have hd2Ge : d2 ≥ 1 := by
        cases d2 with
        | zero => have h0 : t3.val = 1 := congrArg Fin.val (hV.2.2 rfl).2; omega
        | succ _ => omega
      rw [show M + 1 - (trionPullE1 d1 t1 t2 + trionPullE2 d2 t2 t3) = (M + 1 - (d1 + d2)) + 1 by omega]
      change Eis.scale 7 (Eis.scale (7 * ctPowInt 7 (M + 1 - (d1 + d2))) _) = _
      rw [ct_eis_scale_scale 7,
          show 7 * (7 * ctPowInt 7 (M + 1 - (d1 + d2))) = ctPowInt 7 (M + 1 - (d1 + d2)) * 49 by ring,
          ← ct_eis_scale_scale (ctPowInt 7 (M + 1 - (d1 + d2))) 49]
      exact congrArg (Eis.scale (ctPowInt 7 (M + 1 - (d1 + d2)))) hStencil


/-! ## Section 3: Exact Finite-Box Geometric Normalization, Contact Probability `6/7` & `IPR = 9/32` -/

/-- Exact squared norm of the left pair-contact shell `(0, d2)` (`s1 = +, s2 = -, s3 ∈ {+, -}`). -/
def trionLeftPairNormSq (M d2 : Nat) : Int :=
  Eis.normSq (trionState M 0 d2 ⟨0, by decide⟩ ⟨1, by decide⟩ ⟨0, by decide⟩) +
  Eis.normSq (trionState M 0 d2 ⟨0, by decide⟩ ⟨1, by decide⟩ ⟨1, by decide⟩)

/-- Exact squared norm of the right pair-contact shell `(d1, 0)` (`s1 ∈ {+, -}, s2 = +, s3 = -`). -/
def trionRightPairNormSq (M d1 : Nat) : Int :=
  Eis.normSq (trionState M d1 0 ⟨0, by decide⟩ ⟨0, by decide⟩ ⟨1, by decide⟩) +
  Eis.normSq (trionState M d1 0 ⟨1, by decide⟩ ⟨0, by decide⟩ ⟨1, by decide⟩)

/-- Exact squared norm of the 8-spin separated cell `(d1, d2)` (`d1 ≥ 1, d2 ≥ 1`). -/
def trionSepNormSq (M d1 d2 : Nat) : Int :=
  let sum3 (s1 s2 : Fin 2) : Int :=
    Eis.normSq (trionState M d1 d2 s1 s2 ⟨0, by decide⟩) +
    Eis.normSq (trionState M d1 d2 s1 s2 ⟨1, by decide⟩)
  let sum2 (s1 : Fin 2) : Int := sum3 s1 ⟨0, by decide⟩ + sum3 s1 ⟨1, by decide⟩
  sum2 ⟨0, by decide⟩ + sum2 ⟨1, by decide⟩

/-- Exact fourth-power IPR sum of the left pair-contact shell `(0, d2)`. -/
def trionLeftPairNorm4 (M d2 : Nat) : Int :=
  let n0 := Eis.normSq (trionState M 0 d2 ⟨0, by decide⟩ ⟨1, by decide⟩ ⟨0, by decide⟩)
  let n1 := Eis.normSq (trionState M 0 d2 ⟨0, by decide⟩ ⟨1, by decide⟩ ⟨1, by decide⟩)
  n0 * n0 + n1 * n1

/-- Exact fourth-power IPR sum of the right pair-contact shell `(d1, 0)`. -/
def trionRightPairNorm4 (M d1 : Nat) : Int :=
  let n0 := Eis.normSq (trionState M d1 0 ⟨0, by decide⟩ ⟨0, by decide⟩ ⟨1, by decide⟩)
  let n1 := Eis.normSq (trionState M d1 0 ⟨1, by decide⟩ ⟨0, by decide⟩ ⟨1, by decide⟩)
  n0 * n0 + n1 * n1

/-- Exact fourth-power IPR sum of the 8-spin separated cell `(d1, d2)`. -/
def trionSepNorm4 (M d1 d2 : Nat) : Int :=
  let sqAt (s1 s2 s3 : Fin 2) : Int :=
    let n := Eis.normSq (trionState M d1 d2 s1 s2 s3)
    n * n
  let sum3 (s1 s2 : Fin 2) : Int := sqAt s1 s2 ⟨0, by decide⟩ + sqAt s1 s2 ⟨1, by decide⟩
  let sum2 (s1 : Fin 2) : Int := sum3 s1 ⟨0, by decide⟩ + sum3 s1 ⟨1, by decide⟩
  sum2 ⟨0, by decide⟩ + sum2 ⟨1, by decide⟩

/-- Finite 1D sum `∑_{d = 1}^N f d`. -/
def ctSum1To (f : Nat → Int) : Nat → Int
  | 0 => 0
  | k + 1 => ctSum1To f k + f (k + 1)

/-- Finite 2D square-box sum `∑_{d1 = 1}^N ∑_{d2 = 1}^N f d1 d2`. -/
def ctSumBox1To (f : Nat → Nat → Int) (N : Nat) : Int :=
  ctSum1To (fun d1 => ctSum1To (fun d2 => f d1 d2) N) N

private theorem ct_sum1To_congr (f g : Nat → Int) (N : Nat)
    (h : ∀ d : Nat, 1 ≤ d → d ≤ N → f d = g d) : ctSum1To f N = ctSum1To g N := by
  induction N with
  | zero => rfl
  | succ k ih =>
    unfold ctSum1To
    rw [ih (fun d h1 hk => h d h1 (by omega)), h (k + 1) (by omega) (Nat.le_refl _)]

private theorem ct_sum1To_geom (r c : Int) (M N : Nat) (hNM : N ≤ M) :
    ctSum1To (fun d => ctPowInt r (M - d) * c) N = ctPowInt r (M - N) * ctGeomScaled r c N := by
  induction N with
  | zero => simp [ctSum1To, ctGeomScaled]
  | succ k ih =>
    unfold ctSum1To
    rw [ih (by omega), show M - k = (M - (k + 1)) + 1 by omega, ct_powInt_add]
    change ctPowInt r (M - (k + 1)) * (r * 1) * ctGeomScaled r c k + ctPowInt r (M - (k + 1)) * c =
      ctPowInt r (M - (k + 1)) * (r * ctGeomScaled r c k + c)
    ring

private theorem ct_sumBox1To_geom (r c : Int) (M N : Nat) (hNM : 2 * N ≤ M) :
    ctSumBox1To (fun d1 d2 => ctPowInt r (M - (d1 + d2)) * c) N =
      c * ctPowInt r (M - 2 * N) * ctGeomScaled r 1 N * ctGeomScaled r 1 N := by
  unfold ctSumBox1To
  have hInner : ∀ d1 : Nat, 1 ≤ d1 → d1 ≤ N →
      ctSum1To (fun d2 => ctPowInt r (M - (d1 + d2)) * c) N =
        ctPowInt r (M - d1 - N) * ctGeomScaled r c N := fun d1 _ hd1 => by
    rw [ct_sum1To_congr _ (fun d2 => ctPowInt r ((M - d1) - d2) * c) N
          (fun d2 _ _ => by rw [show M - (d1 + d2) = (M - d1) - d2 by omega]),
        ct_sum1To_geom r c (M - d1) N (by omega)]
  rw [ct_sum1To_congr _ _ N hInner,
      ct_sum1To_congr _ (fun d1 => ctPowInt r ((M - N) - d1) * ctGeomScaled r c N) N
        (fun d1 _ _ => by rw [show M - d1 - N = (M - N) - d1 by omega]),
      ct_sum1To_geom r (ctGeomScaled r c N) (M - N) N (by omega),
      show (M - N) - N = M - 2 * N by omega,
      ct_geom_scale r (ctGeomScaled r c N) N, ct_geom_scale r c N]
  ring

private theorem ct_leftPairNormSq_eq (M d : Nat) (hd : d ≥ 1) :
    trionLeftPairNormSq M d = ctPowInt 49 (M + 1 - d) * 56 := by
  unfold trionLeftPairNormSq trionState
  have hne : (d == 0) = false := by cases d with | zero => omega | succ _ => rfl
  simp only [Nat.zero_add, beq_self_eq_true, hne, ct_eis_normSq_scale, ct_powInt_sq]
  rw [show Eis.normSq (trionCell true false ⟨0, by decide⟩ ⟨0, by decide⟩) = 49 by decide,
      show Eis.normSq (trionCell true false ⟨0, by decide⟩ ⟨1, by decide⟩) = 7 by decide,
      show (7 : Int) * 7 = 49 from rfl]
  ring

private theorem ct_rightPairNormSq_eq (M d : Nat) (hd : d ≥ 1) :
    trionRightPairNormSq M d = ctPowInt 49 (M + 1 - d) * 56 := by
  unfold trionRightPairNormSq trionState
  have hne : (d == 0) = false := by cases d with | zero => omega | succ _ => rfl
  simp only [Nat.add_zero, beq_self_eq_true, hne, ct_eis_normSq_scale, ct_powInt_sq]
  rw [show Eis.normSq (trionCell false true ⟨0, by decide⟩ ⟨1, by decide⟩) = 7 by decide,
      show Eis.normSq (trionCell false true ⟨1, by decide⟩ ⟨1, by decide⟩) = 49 by decide,
      show (7 : Int) * 7 = 49 from rfl]
  ring

private theorem ct_sepNormSq_eq (M d1 d2 : Nat) (h1 : d1 ≥ 1) (h2 : d2 ≥ 1) :
    trionSepNormSq M d1 d2 = ctPowInt 49 (M + 1 - (d1 + d2)) * 896 := by
  unfold trionSepNormSq trionState
  have hne1 : (d1 == 0) = false := by cases d1 with | zero => omega | succ _ => rfl
  have hne2 : (d2 == 0) = false := by cases d2 with | zero => omega | succ _ => rfl
  simp only [hne1, hne2, ct_eis_normSq_scale, ct_powInt_sq]
  rw [show Eis.normSq (trionCell false false ⟨0, by decide⟩ ⟨0, by decide⟩) = 49 by decide,
      show Eis.normSq (trionCell false false ⟨0, by decide⟩ ⟨1, by decide⟩) = 7 by decide,
      show Eis.normSq (trionCell false false ⟨1, by decide⟩ ⟨0, by decide⟩) = 343 by decide,
      show Eis.normSq (trionCell false false ⟨1, by decide⟩ ⟨1, by decide⟩) = 49 by decide,
      show (7 : Int) * 7 = 49 from rfl]
  ring

private theorem ct_leftPairNorm4_eq (M d : Nat) (hd : d ≥ 1) :
    trionLeftPairNorm4 M d = ctPowInt 2401 (M + 1 - d) * 2450 := by
  unfold trionLeftPairNorm4 trionState
  have hne : (d == 0) = false := by cases d with | zero => omega | succ _ => rfl
  simp only [Nat.zero_add, beq_self_eq_true, hne, ct_eis_normSq_scale, ct_powInt_sq]
  rw [show Eis.normSq (trionCell true false ⟨0, by decide⟩ ⟨0, by decide⟩) = 49 by decide,
      show Eis.normSq (trionCell true false ⟨0, by decide⟩ ⟨1, by decide⟩) = 7 by decide,
      show (7 : Int) * 7 = 49 from rfl,
      show ctPowInt 2401 (M + 1 - d) = ctPowInt 49 (M + 1 - d) * ctPowInt 49 (M + 1 - d) from (ct_powInt_sq 49 _).symm]
  ring

private theorem ct_rightPairNorm4_eq (M d : Nat) (hd : d ≥ 1) :
    trionRightPairNorm4 M d = ctPowInt 2401 (M + 1 - d) * 2450 := by
  unfold trionRightPairNorm4 trionState
  have hne : (d == 0) = false := by cases d with | zero => omega | succ _ => rfl
  simp only [Nat.add_zero, beq_self_eq_true, hne, ct_eis_normSq_scale, ct_powInt_sq]
  rw [show Eis.normSq (trionCell false true ⟨0, by decide⟩ ⟨1, by decide⟩) = 7 by decide,
      show Eis.normSq (trionCell false true ⟨1, by decide⟩ ⟨1, by decide⟩) = 49 by decide,
      show (7 : Int) * 7 = 49 from rfl,
      show ctPowInt 2401 (M + 1 - d) = ctPowInt 49 (M + 1 - d) * ctPowInt 49 (M + 1 - d) from (ct_powInt_sq 49 _).symm]
  ring

private theorem ct_sepNorm4_eq (M d1 d2 : Nat) (h1 : d1 ≥ 1) (h2 : d2 ≥ 1) :
    trionSepNorm4 M d1 d2 = ctPowInt 2401 (M + 1 - (d1 + d2)) * 245000 := by
  unfold trionSepNorm4 trionState
  have hne1 : (d1 == 0) = false := by cases d1 with | zero => omega | succ _ => rfl
  have hne2 : (d2 == 0) = false := by cases d2 with | zero => omega | succ _ => rfl
  simp only [hne1, hne2, ct_eis_normSq_scale, ct_powInt_sq]
  rw [show Eis.normSq (trionCell false false ⟨0, by decide⟩ ⟨0, by decide⟩) = 49 by decide,
      show Eis.normSq (trionCell false false ⟨0, by decide⟩ ⟨1, by decide⟩) = 7 by decide,
      show Eis.normSq (trionCell false false ⟨1, by decide⟩ ⟨0, by decide⟩) = 343 by decide,
      show Eis.normSq (trionCell false false ⟨1, by decide⟩ ⟨1, by decide⟩) = 49 by decide,
      show (7 : Int) * 7 = 49 from rfl,
      show ctPowInt 2401 (M + 1 - (d1 + d2)) =
        ctPowInt 49 (M + 1 - (d1 + d2)) * ctPowInt 49 (M + 1 - (d1 + d2)) from (ct_powInt_sq 49 _).symm]
  ring

/-- Headline Theorem 5 (Exact Geometric-Series Normalization, Contact Probability `6/7`, Top Weight `18/49`, & Spin-Resolved `IPR = 9/32`):
    1. Exact finite geometric-series identities for ALL `N : Nat` at ratios `1/7`, `1/49`, and `1/2401`:
       `6 * S_7(N) = 7^N - 1`, `48 * S_49(N) = 49^N - 1`, `2400 * S_2401(N) = 2401^N - 1`.
    2. Exact finite-box (`1 ≤ d1, d2 ≤ N`) norm^2 and norm^4 sums tied directly to `Eis.normSq (trionState (2 * N) ...)`:
       - Left and right pair-contact `|ψ|^2` sums satisfy `48 * PairSum(N) = 56 * 49^(N + 1) * (49^N - 1)` (`→ 7/6` each),
       - Separated 2D box `|ψ|^2` sum satisfies `2304 * SepSum(N) = 896 * 49 * (49^N - 1)^2` (`→ 7/18`),
       - Left and right pair-contact `|ψ|^4` sums satisfy `2400 * PairIpr(N) = 2450 * 2401^(N + 1) * (2401^N - 1)` (`→ 49/48` each),
       - Separated 2D box `|ψ|^4` sum satisfies `5760000 * SepIpr(N) = 245000 * 2401 * (2401^N - 1)^2` (`→ 49/1152`).
    3. Exact `∀ N : Nat` canonical top-cluster & mirror amplitude ties directly on `trionState (2 * N)`:
       - Canonical cluster `(0,+)(0,-)(2,+)` (even-sublattice index `d2 = 1`, `x = 2 d2`) at
         `(d1 = 0, d2 = 1, ⟨0,_⟩, ⟨1,_⟩, ⟨0,_⟩)` and its mirror `(-2,-)(0,+)(0,-)` at
         `(d1 = 1, d2 = 0, ⟨1,_⟩, ⟨0,_⟩, ⟨1,_⟩)` both satisfy `Eis.normSq (trionState (2 * N) ...) = 49^(2*N + 1)`
         (normalizing to unnormalized weight `Eis.normSq (trionCell ...) / 49 = 1` in units of `49^(2*N + 1)`).
    4. Exact infinite-line rational observables (in `QPos` and cleared `Int`):
       - `N_pair = 7/3`, `N_sep = 7/18`, `N_tot = 49/18`,
       - Exact pair-contact probability **`p_pair = 6/7`**,
       - Exact canonical 3-body top-cluster weight **`p((0,+)(0,-)(2,+)) = (49/49) / (49/18) = 18/49`**
         (tied directly to `Eis.normSq (trionCell true false ⟨0,_⟩ ⟨0,_⟩)`),
       - Exact **spin-resolved configuration-basis** Inverse Participation Ratio
         **`IPR = (2401/1152) / (2401/324) = 9/32`**! -/
theorem thm_ct_trion_norm_contact_and_ipr :
    (∀ N : Nat,
      6 * ctGeomScaled 7 1 N = ctPowInt 7 N - 1 ∧
      48 * ctGeomScaled 49 1 N = ctPowInt 49 N - 1 ∧
      2400 * ctGeomScaled 2401 1 N = ctPowInt 2401 N - 1) ∧
    (∀ N : Nat,
      48 * ctSum1To (trionLeftPairNormSq (2 * N)) N = 56 * ctPowInt 49 (N + 1) * (ctPowInt 49 N - 1) ∧
      48 * ctSum1To (trionRightPairNormSq (2 * N)) N = 56 * ctPowInt 49 (N + 1) * (ctPowInt 49 N - 1) ∧
      2304 * ctSumBox1To (trionSepNormSq (2 * N)) N =
        896 * 49 * (ctPowInt 49 N - 1) * (ctPowInt 49 N - 1)) ∧
    (∀ N : Nat,
      2400 * ctSum1To (trionLeftPairNorm4 (2 * N)) N = 2450 * ctPowInt 2401 (N + 1) * (ctPowInt 2401 N - 1) ∧
      2400 * ctSum1To (trionRightPairNorm4 (2 * N)) N = 2450 * ctPowInt 2401 (N + 1) * (ctPowInt 2401 N - 1) ∧
      5760000 * ctSumBox1To (trionSepNorm4 (2 * N)) N =
        245000 * 2401 * (ctPowInt 2401 N - 1) * (ctPowInt 2401 N - 1)) ∧
    ((∀ N : Nat,
        Eis.normSq (trionState (2 * N) 0 1 ⟨0, by decide⟩ ⟨1, by decide⟩ ⟨0, by decide⟩) =
          ctPowInt 49 (2 * N + 1) ∧
        Eis.normSq (trionState (2 * N) 1 0 ⟨1, by decide⟩ ⟨0, by decide⟩ ⟨1, by decide⟩) =
          ctPowInt 49 (2 * N + 1)) ∧
     Eis.normSq (trionCell true false ⟨0, by decide⟩ ⟨0, by decide⟩) = 49 ∧
     Eis.normSq (trionCell false true ⟨1, by decide⟩ ⟨1, by decide⟩) = 49 ∧
     QPos.eq (QPos.add ⟨56, 48, by decide⟩ ⟨56, 48, by decide⟩) ⟨7, 3, by decide⟩ ∧
     QPos.eq ⟨896, 2304, by decide⟩ ⟨7, 18, by decide⟩ ∧
     QPos.eq (QPos.add ⟨7, 3, by decide⟩ ⟨7, 18, by decide⟩) ⟨49, 18, by decide⟩ ∧
     QPos.eq ⟨7 * 18, 3 * 49, by decide⟩ ⟨6, 7, by decide⟩ ∧
     QPos.eq ⟨Eis.normSq (trionCell true false ⟨0, by decide⟩ ⟨0, by decide⟩) * 18, 49 * 49, by decide⟩
             ⟨18, 49, by decide⟩ ∧
     QPos.eq (QPos.add (QPos.add ⟨2450, 2400, by decide⟩ ⟨2450, 2400, by decide⟩) ⟨245000, 5760000, by decide⟩)
             ⟨2401, 1152, by decide⟩ ∧
     QPos.eq ⟨2401 * 324, 1152 * 2401, by decide⟩ ⟨9, 32, by decide⟩) := by
  have hTop : ∀ N : Nat,
      Eis.normSq (trionState (2 * N) 0 1 ⟨0, by decide⟩ ⟨1, by decide⟩ ⟨0, by decide⟩) =
        ctPowInt 49 (2 * N + 1) ∧
      Eis.normSq (trionState (2 * N) 1 0 ⟨1, by decide⟩ ⟨0, by decide⟩ ⟨1, by decide⟩) =
        ctPowInt 49 (2 * N + 1) := by
    intro N
    have hne : (1 == 0) = false := rfl
    constructor
    · unfold trionState
      rw [show 2 * N + 1 - (0 + 1) = 2 * N by omega]
      simp only [beq_self_eq_true, hne, ct_eis_normSq_scale, ct_powInt_sq]
      rw [show Eis.normSq (trionCell true false ⟨0, by decide⟩ ⟨0, by decide⟩) = 49 by decide, mul_comm]; rfl
    · unfold trionState
      rw [show 2 * N + 1 - (1 + 0) = 2 * N by omega]
      simp only [beq_self_eq_true, hne, ct_eis_normSq_scale, ct_powInt_sq]
      rw [show Eis.normSq (trionCell false true ⟨1, by decide⟩ ⟨1, by decide⟩) = 49 by decide, mul_comm]; rfl
  refine ⟨fun N => ⟨by simpa using ct_geom_series_closed 7 1 N,
                     by simpa using ct_geom_series_closed 49 1 N,
                     by simpa using ct_geom_series_closed 2401 1 N⟩,
          ?_, ?_, ⟨hTop, by unfold QPos.eq QPos.add; decide⟩⟩
  · intro N
    have hL : ctSum1To (trionLeftPairNormSq (2 * N)) N = ctPowInt 49 (N + 1) * ctGeomScaled 49 56 N := by
      rw [ct_sum1To_congr _ (fun d => ctPowInt 49 ((2 * N + 1) - d) * 56) N (fun d h1 _ => ct_leftPairNormSq_eq (2 * N) d h1),
          ct_sum1To_geom 49 56 (2 * N + 1) N (by omega), show (2 * N + 1) - N = N + 1 by omega]
    have hR : ctSum1To (trionRightPairNormSq (2 * N)) N = ctPowInt 49 (N + 1) * ctGeomScaled 49 56 N := by
      rw [ct_sum1To_congr _ (fun d => ctPowInt 49 ((2 * N + 1) - d) * 56) N (fun d h1 _ => ct_rightPairNormSq_eq (2 * N) d h1),
          ct_sum1To_geom 49 56 (2 * N + 1) N (by omega), show (2 * N + 1) - N = N + 1 by omega]
    have hS : ctSumBox1To (trionSepNormSq (2 * N)) N = 896 * 49 * ctGeomScaled 49 1 N * ctGeomScaled 49 1 N := by
      unfold ctSumBox1To
      rw [ct_sum1To_congr _ _ N (fun d1 h1 _ => ct_sum1To_congr _ _ N (fun d2 h2 _ => ct_sepNormSq_eq (2 * N) d1 d2 h1 h2))]
      change ctSumBox1To (fun d1 d2 => ctPowInt 49 ((2 * N + 1) - (d1 + d2)) * 896) N = _
      rw [ct_sumBox1To_geom 49 896 (2 * N + 1) N (by omega), show (2 * N + 1) - 2 * N = 1 by omega]
      change 896 * (49 * 1) * _ * _ = _; ring
    have hG56 : 48 * ctGeomScaled 49 56 N = 56 * (ctPowInt 49 N - 1) := by simpa using ct_geom_series_closed 49 56 N
    have hG1 : 48 * ctGeomScaled 49 1 N = ctPowInt 49 N - 1 := by simpa using ct_geom_series_closed 49 1 N
    refine ⟨?_, ?_, ?_⟩
    · rw [hL]; calc 48 * (ctPowInt 49 (N + 1) * ctGeomScaled 49 56 N)
          = ctPowInt 49 (N + 1) * (48 * ctGeomScaled 49 56 N) := by ring
        _ = ctPowInt 49 (N + 1) * (56 * (ctPowInt 49 N - 1)) := by rw [hG56]
        _ = _ := by ring
    · rw [hR]; calc 48 * (ctPowInt 49 (N + 1) * ctGeomScaled 49 56 N)
          = ctPowInt 49 (N + 1) * (48 * ctGeomScaled 49 56 N) := by ring
        _ = ctPowInt 49 (N + 1) * (56 * (ctPowInt 49 N - 1)) := by rw [hG56]
        _ = _ := by ring
    · rw [hS]; calc 2304 * (896 * 49 * ctGeomScaled 49 1 N * ctGeomScaled 49 1 N)
          = 896 * 49 * (48 * ctGeomScaled 49 1 N) * (48 * ctGeomScaled 49 1 N) := by ring
        _ = _ := by rw [hG1]
  · intro N
    have hL : ctSum1To (trionLeftPairNorm4 (2 * N)) N = ctPowInt 2401 (N + 1) * ctGeomScaled 2401 2450 N := by
      rw [ct_sum1To_congr _ (fun d => ctPowInt 2401 ((2 * N + 1) - d) * 2450) N (fun d h1 _ => ct_leftPairNorm4_eq (2 * N) d h1),
          ct_sum1To_geom 2401 2450 (2 * N + 1) N (by omega), show (2 * N + 1) - N = N + 1 by omega]
    have hR : ctSum1To (trionRightPairNorm4 (2 * N)) N = ctPowInt 2401 (N + 1) * ctGeomScaled 2401 2450 N := by
      rw [ct_sum1To_congr _ (fun d => ctPowInt 2401 ((2 * N + 1) - d) * 2450) N (fun d h1 _ => ct_rightPairNorm4_eq (2 * N) d h1),
          ct_sum1To_geom 2401 2450 (2 * N + 1) N (by omega), show (2 * N + 1) - N = N + 1 by omega]
    have hS : ctSumBox1To (trionSepNorm4 (2 * N)) N = 245000 * 2401 * ctGeomScaled 2401 1 N * ctGeomScaled 2401 1 N := by
      unfold ctSumBox1To
      rw [ct_sum1To_congr _ _ N (fun d1 h1 _ => ct_sum1To_congr _ _ N (fun d2 h2 _ => ct_sepNorm4_eq (2 * N) d1 d2 h1 h2))]
      change ctSumBox1To (fun d1 d2 => ctPowInt 2401 ((2 * N + 1) - (d1 + d2)) * 245000) N = _
      rw [ct_sumBox1To_geom 2401 245000 (2 * N + 1) N (by omega), show (2 * N + 1) - 2 * N = 1 by omega]
      change 245000 * (2401 * 1) * _ * _ = _; ring
    have hG2450 : 2400 * ctGeomScaled 2401 2450 N = 2450 * (ctPowInt 2401 N - 1) := by simpa using ct_geom_series_closed 2401 2450 N
    have hG1 : 2400 * ctGeomScaled 2401 1 N = ctPowInt 2401 N - 1 := by simpa using ct_geom_series_closed 2401 1 N
    refine ⟨?_, ?_, ?_⟩
    · rw [hL]; calc 2400 * (ctPowInt 2401 (N + 1) * ctGeomScaled 2401 2450 N)
          = ctPowInt 2401 (N + 1) * (2400 * ctGeomScaled 2401 2450 N) := by ring
        _ = ctPowInt 2401 (N + 1) * (2450 * (ctPowInt 2401 N - 1)) := by rw [hG2450]
        _ = _ := by ring
    · rw [hR]; calc 2400 * (ctPowInt 2401 (N + 1) * ctGeomScaled 2401 2450 N)
          = ctPowInt 2401 (N + 1) * (2400 * ctGeomScaled 2401 2450 N) := by ring
        _ = ctPowInt 2401 (N + 1) * (2450 * (ctPowInt 2401 N - 1)) := by rw [hG2450]
        _ = _ := by ring
    · rw [hS]; calc 5760000 * (245000 * 2401 * ctGeomScaled 2401 1 N * ctGeomScaled 2401 1 N)
          = 245000 * 2401 * (2400 * ctGeomScaled 2401 1 N) * (2400 * ctGeomScaled 2401 1 N) := by ring
        _ = _ := by rw [hG1]


/-! ## Section 4: Exact `P = 0` Trion Spectral-Gap Separation -/

/-- Exact `doublon(0) + free(0)` threshold `13 * (ω λ_2(0)) = -15 - 8 ω` from `Vibe.BallisticDoublon.doublonLam13`. -/
def doublonPlusFreeLam13 : Eis := Eis.mul Eis.omega doublonLam13

/-- Exact homogeneous triple-angle sine numerator `3 p q^2 - 4 p^3 = q^3 sin(3 θ)` for `sin θ = p / q`. -/
def ctSin3Hom (p q : Int) : Int := 3 * p * (q * q) - 4 * (p * (p * p))

/-- Headline Theorem 6 (Exact `P = 0` Trion Gap Separation Below `3-Free` and `Doublon + Free` Thresholds):
    1. Exact 1-body coin invariants `det(2 C) = 4 ω` and `tr(2 C) = 2 ζ_6` fix the 1-body dispersion
       `E_1^±(p) = π/3 ± arccos((1/2) cos p)`, placing the `P = 0` `3-free` lower threshold at
       `-π/2 - 3 arcsin(1/4)` with exact algebraic cosine `-sin(3 arcsin(1/4)) = -11/16`.
       Lean certifies the exact 1D cubic monotonicity `16 * ctSin3Hom p q ≤ 11 * q^3` for ALL
       `0 ≤ p / q ≤ 1/4` (i.e. `sin(3 θ) ≤ 11/16` on `0 ≤ sin θ ≤ 1/4`, via
       `11 q^3 - 16 (3 p q^2 - 4 p^3) = (q - 4 p)(11 q^2 - 4 p q - 16 p^2)`); the global 2D
       minimization of `∑_{i=1}^3 arcsin((1/2) cos p_i)` over `p_1 + p_2 + p_3 = 0` is external.
    2. Exact `P = 0` `doublon(0) + free(0)` edge `ω λ_2(0) = (-15 - 8 ω) / 13` (bridged directly to
       `Vibe.BallisticDoublon.doublonLam13`) has unit modulus (`normSq = 169`), lower-left quadrant
       `Im < 0`, exact `Re(ω λ_2(0)) = -11/13`, and exact chord distance squared
       `|λ_3 - ω λ_2(0)|^2 = 273 / 8281 = 3 / 91` (`|λ_3 - (-1)|^2 = 7 / 49 = 1 / 7`).
    3. Taking `-2.5813` as a conservative buffer strictly below `arg(ω λ_2(0)) ≈ -2.579523`,
       the exact polynomial Taylor cosine bound at `t = 14/25 = 0.56 < π - 2.5813 ≈ 0.56029`
       (`1 - t^2/2 + t^4/24 < 17/20`, giving `cos(-2.5813) > -17/20`) certifies the strict gap chain:
       `-1 < Re(λ_3) = -13/14 < -17/20 < Re(ω λ_2(0)) = -11/13 < cos(E_{3-free}) = -11/16 < 0`! -/
theorem thm_ct_trion_gap_separation :
    (Mat2Eis.det coin2 = Eis.scale 4 Eis.omega ∧
     Mat2Eis.trace coin2 = Eis.scale 2 Eis.zeta6 ∧
     ctSin3Hom 1 4 = 44 ∧
     (∀ p q : Int, 0 ≤ p → 4 * p ≤ q → 16 * ctSin3Hom p q ≤ 11 * (q * (q * q)))) ∧
    (doublonPlusFreeLam13 = ⟨-15, -8⟩ ∧
     Eis.normSq doublonPlusFreeLam13 = 169 ∧
     2 * doublonPlusFreeLam13.a - doublonPlusFreeLam13.b = -22 ∧
     doublonPlusFreeLam13.b < 0 ∧ trionLam7.b < 0 ∧
     Eis.normSq (Eis.sub (Eis.scale 13 trionLam7) (Eis.scale 7 doublonPlusFreeLam13)) = 273 ∧
     (273 : Int) = 3 * 91 ∧ (91 : Int) * 91 = 8281 ∧
     Eis.normSq (Eis.add trionLam7 (Eis.ofInt 7)) = 7) ∧
    (24 * (25 ^ 4 : Int) - 12 * (14 ^ 2) * (25 ^ 2) + (14 ^ 4) < (17 : Int) * 24 * (25 ^ 4) / 20 ∧
     20 * (24 * (25 ^ 4 : Int) - 12 * (14 ^ 2) * (25 ^ 2) + (14 ^ 4)) < 17 * 24 * (25 ^ 4) ∧
     (-1 : Int) * 14 < -13 ∧
     (-13 : Int) * 20 < (-17) * 14 ∧
     (-17 : Int) * 13 < (-11) * 20 ∧
     (-11 : Int) * 16 < (-11) * 13 ∧
     QPos.le ⟨-1, 1, by decide⟩ ⟨-13, 14, by decide⟩ ∧
     QPos.le ⟨-13, 14, by decide⟩ ⟨-17, 20, by decide⟩ ∧
     QPos.le ⟨-17, 20, by decide⟩ ⟨-11, 13, by decide⟩ ∧
     QPos.le ⟨-11, 13, by decide⟩ ⟨-11, 16, by decide⟩) := by
  have hCubic : ∀ p q : Int, 0 ≤ p → 4 * p ≤ q →
      16 * ctSin3Hom p q ≤ 11 * (q * (q * q)) := by
    intro p q hp hpq
    unfold ctSin3Hom
    have hId : 11 * (q * (q * q)) - 16 * (3 * p * (q * q) - 4 * (p * (p * p))) =
        (q - 4 * p) * (11 * (q * q) - 4 * (p * q) - 16 * (p * p)) := by ring
    have hQuad : 0 ≤ 11 * (q * q) - 4 * (p * q) - 16 * (p * p) := by nlinarith
    have hProd : 0 ≤ (q - 4 * p) * (11 * (q * q) - 4 * (p * q) - 16 * (p * p)) :=
      mul_nonneg (by omega) hQuad
    linarith
  refine ⟨⟨by decide, by decide, by decide, hCubic⟩, by decide, by unfold QPos.le; decide⟩


/-! ## Section 5: Hyperbolic Spectral-Gap Excision Algebra (W9 Part 1) -/

/-- Exact `cot^2(π/18) = 4 g^{-1} - 1 = 4 g^2 - 24 g + 35` inside `Vibe.Algebra.Ninth` (`ℤ[ζ_9]`),
    where `g = gapSqZeta18 = |ζ_18 - 1|^2 = 4 sin^2(π/18)` satisfies `g (g^2 - 6 g + 9) = 1`. -/
def cotSqZeta18 : Ninth :=
  let g := Ninth.gapSqZeta18
  Ninth.sub (Ninth.add (Ninth.scale 4 (Ninth.pow g 2)) (Ninth.ofInt 35)) (Ninth.scale 24 g)

/-- Homogeneous minimal cubic `Q_cotSq(p, q) = p^3 - 33 p^2 q + 27 p q^2 - 3 q^3` for `v = cot^2(π/18) = p / q`. -/
def ctCotSqCubicHom (p q : Int) : Int :=
  p * (p * p) - 33 * (p * (p * q)) + 27 * (p * (q * q)) - 3 * (q * (q * q))

/-- Homogeneous minimal cubic `P_tanSq(p, q) = 3 p^3 - 27 p^2 q + 33 p q^2 - q^3` for `u = tan^2(π/18) = p / q`. -/
def ctTanSqCubicHom (p q : Int) : Int :=
  3 * (p * (p * p)) - 27 * (p * (p * q)) + 33 * (p * (q * q)) - q * (q * q)

private theorem ct_cotSqCubic_strict_inc_ge_22 (p1 q1 p2 q2 : Int)
    (hq1 : 0 < q1) (hq2 : 0 < q2)
    (h1 : 22 * q1 ≤ p1) (hLt : p1 * q2 < p2 * q1) :
    ctCotSqCubicHom p1 q1 * (q2 * (q2 * q2)) < ctCotSqCubicHom p2 q2 * (q1 * (q1 * q1)) := by
  let x := p1 * q2; let y := p2 * q1; let d := q1 * q2
  have hd : 0 < d := by nlinarith
  have hx : 22 * d ≤ x := by nlinarith
  have hy : 22 * d ≤ y := by omega
  have hDiff : ctCotSqCubicHom p2 q2 * (q1 * (q1 * q1)) - ctCotSqCubicHom p1 q1 * (q2 * (q2 * q2)) =
      (y - x) * (y * y + y * x + x * x - 33 * ((y + x) * d) + 27 * (d * d)) := by
    unfold ctCotSqCubicHom; dsimp only [x, y, d]; ring
  have hQuad : 0 < y * y + y * x + x * x - 33 * ((y + x) * d) + 27 * (d * d) := by nlinarith
  have hPos : 0 < (y - x) * (y * y + y * x + x * x - 33 * ((y + x) * d) + 27 * (d * d)) :=
    mul_pos (by omega) hQuad
  linarith

private theorem ct_tanSqCubic_strict_inc_unit (p1 q1 p2 q2 : Int)
    (hq1 : 0 < q1) (hq2 : 0 < q2)
    (h1Lo : 0 ≤ p1) (h2Hi : 2 * p2 ≤ q2) (hLt : p1 * q2 < p2 * q1) :
    ctTanSqCubicHom p1 q1 * (q2 * (q2 * q2)) < ctTanSqCubicHom p2 q2 * (q1 * (q1 * q1)) := by
  let x := p1 * q2; let y := p2 * q1; let d := q1 * q2
  have hd : 0 < d := by nlinarith
  have hx0 : 0 ≤ x := by nlinarith
  have hyHi : 2 * y ≤ d := by nlinarith
  have hDiff : ctTanSqCubicHom p2 q2 * (q1 * (q1 * q1)) - ctTanSqCubicHom p1 q1 * (q2 * (q2 * q2)) =
      (y - x) * (3 * (y * y + y * x + x * x) - 27 * ((y + x) * d) + 33 * (d * d)) := by
    unfold ctTanSqCubicHom; dsimp only [x, y, d]; ring
  have hQuad : 0 < 3 * (y * y + y * x + x * x) - 27 * ((y + x) * d) + 33 * (d * d) := by nlinarith
  have hPos : 0 < (y - x) * (3 * (y * y + y * x + x * x) - 27 * ((y + x) * d) + 33 * (d * d)) :=
    mul_pos (by omega) hQuad
  linarith

/-- Headline Theorem 7 (Exact `M_pair(ζ_18)` True-Gap Parseval Margin `1 / √3 << cot(π/18)`):
    1. Inside `Vibe.Algebra.Ninth` (`ℤ[ζ_9]`), `cotSqZeta18 = 4 g^2 - 24 g + 35` (`g = |ζ_18 - 1|^2 = 4 sin^2(π/18)`)
       satisfies `g * (cotSqZeta18 + 1) = 4` AND exact minimal cubic `cotSqZeta18^3 - 33 cotSqZeta18^2 + 27 cotSqZeta18 - 3 = 0`.
    2. Exact polynomial identities linking `gapSqZeta18_minpoly` (`g^3 - 6 g^2 + 9 g - 1`) and the triple-angle
       equations `c^3 - 3 √3 c^2 - 3 c + √3 = 0` (`c = cot(π/18)`) and `√3 t^3 - 3 t^2 - 3 √3 t + 1 = 0` (`t = tan(π/18)`):
       - `(v + 1)^3 - 36 (v + 1)^2 + 96 (v + 1) - 64 = v^3 - 33 v^2 + 27 v - 3` (`∀ v : Int`),
       - `(c^3 - 3 c)^2 - 3 (3 c^2 - 1)^2 = Q_cotSq(c^2, 1)` (`∀ c : Int`),
       - `3 (t^3 - 3 t)^2 - (3 t^2 - 1)^2 = P_tanSq(t^2, 1)` (`∀ t : Int`).
    3. Strict monotonicity + exact root brackets:
       - Unique root `u = tan^2(π/18)` of `P_tanSq` on `[0, 1/2]` satisfies `0 < u < 1/32 < 1/25` (`tan(π/18) < 1/5`),
       - Unique root `v = cot^2(π/18)` of `Q_cotSq` on `[22, ∞)` satisfies `32 < 32163/1000 < v < 32164/1000 < 33`,
       - Hence `1/3 < 25 < 32 < cot^2(π/18)` (`3 * 25 = 75 > (86/10)^2` and `3 * 32 = 96 > (979/100)^2`).
         Combined with the external analytic Parseval bound `sup |t_hat| = 1 / √3`, this yields a
         `> 8.6×` (sharp `> 9.79×`) gap margin ruling out bound poles in `(0, π/3)` and `(-π, -2π/3)`! -/
theorem thm_ct_mpair_gap_margin :
    (Ninth.mul Ninth.gapSqZeta18 (Ninth.add cotSqZeta18 Ninth.one) = Ninth.ofInt 4 ∧
     Ninth.sub (Ninth.add (Ninth.sub (Ninth.pow cotSqZeta18 3) (Ninth.scale 33 (Ninth.pow cotSqZeta18 2)))
                          (Ninth.scale 27 cotSqZeta18))
               (Ninth.ofInt 3) = Ninth.zero) ∧
    (∀ v : Int,
      (v + 1) * ((v + 1) * (v + 1)) - 36 * ((v + 1) * (v + 1)) + 96 * (v + 1) - 64 =
        ctCotSqCubicHom v 1) ∧
    (∀ c : Int,
      let c2 := c * c
      let a := c * c2 - 3 * c
      let b := 3 * c2 - 1
      a * a - 3 * (b * b) = ctCotSqCubicHom c2 1) ∧
    (∀ t : Int,
      let t2 := t * t
      let a := t * t2 - 3 * t
      let b := 3 * t2 - 1
      3 * (a * a) - b * b = ctTanSqCubicHom t2 1) ∧
    (ctTanSqCubicHom 0 1 < 0 ∧ ctTanSqCubicHom 1 32 > 0 ∧ ctTanSqCubicHom 1 25 > 0 ∧
     (∀ p1 q1 p2 q2 : Int, 0 < q1 → 0 < q2 → 0 ≤ p1 → 2 * p2 ≤ q2 → p1 * q2 < p2 * q1 →
       ctTanSqCubicHom p1 q1 * (q2 * (q2 * q2)) < ctTanSqCubicHom p2 q2 * (q1 * (q1 * q1)))) ∧
    (ctCotSqCubicHom 32 1 < 0 ∧ ctCotSqCubicHom 32163 1000 < 0 ∧
     ctCotSqCubicHom 32164 1000 > 0 ∧ ctCotSqCubicHom 33 1 > 0 ∧
     (∀ p1 q1 p2 q2 : Int, 0 < q1 → 0 < q2 → 22 * q1 ≤ p1 → p1 * q2 < p2 * q1 →
       ctCotSqCubicHom p1 q1 * (q2 * (q2 * q2)) < ctCotSqCubicHom p2 q2 * (q1 * (q1 * q1)))) ∧
    ((1 : Int) < 3 * 25 ∧ (25 : Int) < 32 ∧
     (86 : Int) * 86 < 3 * 25 * 100 ∧
     (979 : Int) * 979 < 3 * 32 * 10000) := by
  refine ⟨by decide,
          fun v => by unfold ctCotSqCubicHom; ring,
          fun c => by unfold ctCotSqCubicHom; dsimp only; ring,
          fun t => by unfold ctTanSqCubicHom; dsimp only; ring,
          ⟨by decide, by decide, by decide, ct_tanSqCubic_strict_inc_unit⟩,
          ⟨by decide, by decide, by decide, by decide, ct_cotSqCubic_strict_inc_ge_22⟩,
          by decide⟩

/-- Exact `E_meet(0) - 2π/3` phase numerator `13 * (ω^2 λ_2(0)) = 8 - 7 ω` from `Vibe.BallisticDoublon.doublonLam13`. -/
def doublonShift2Pi3Lam13 : Eis := Eis.mul Eis.omega2 doublonLam13

/-- Headline Theorem 8 (Hyperbolic Spectral-Gap Excision of the Flat `D_4` `M_pair(ζ_18)` Bound Pocket):
    directly bridged to `Vibe.SpectralSharp.thm_ss_normalized_gap_gt_half` (`ρ / 24 ≤ 335 / 672 < 1 / 2`)
    and `Vibe.BallisticDoublon.doublonLam13` (`λ_2(0) = (7 + 15 ω) / 13`):
    1. Every Depth-1 Schur row sum obeys `S_k / 24 ≤ 335 / 672 < 1 / 2`, widening the continuum edge
       `cos(δ) = (3 + cos P_*) / 4` below `7/8` (`2351 / 2688 < 7 / 8`).
    2. At the exact 1D `M_meet` doublon band edge `E_meet(0) = arg((7 + 15 ω) / 13)`,
       `ω^2 λ_2(0) = (8 - 7 ω) / 13` has exact cosine `cos(E_meet(0) - 2π/3) = 23 / 26 > 7 / 8 > 2351 / 2688`,
       so the 1D `(+, -)` continuum threshold satisfies `cos(P_*(E_meet(0))) = 4 * (23/26) - 3 = 7 / 13 > 1 / 2 > 335 / 672`!
    3. Using the external numerical bisection value `q_c = 0.24413393... π` for the flat 4D `D_4` pole
       dissolution boundary and rounding **upward** to `2442 / 10000`:
       - `q_c < (2442/10000) π < π/4` ALREADY yields `cos(q_c) > cos(π/4) = 1/√2 > 7/10` directly via
         `(7/10)^2 = 49/100 < 1/2`,
       - Independently, `q_c < (2442/10000) * (31416/10000) < 768/1000` with Taylor lower bound
         `1 - (768/1000)^2 / 2 = 0.705088 > 7/10`,
       - Giving the strict excision chain `335 / 672 < 1 / 2 < 7 / 13 < 7 / 10` (`< cos(q_c)`).
    4. Abstract rational ceiling-vs-floor contradiction: NO rational Rayleigh quotient `rayNum / rayDen`
       obeying the ceiling `≤ 335 / 672` can satisfy `≥ 7 / 13` or `≥ 7 / 10`. (Lifting this rational
       contradiction to infinite-graph `l^2` vectors uses the external Rayleigh-Ritz bridge. Honest W9-M1
       boundary: the lower continuum-overlap window `[π/3, 1.58824)` at `335/672`, or `[π/3, 1.57737)` at
       `0.477170`, remains unexcised by this spectral-gap argument alone.) -/
theorem thm_ct_hyperbolic_excision_pocket :
    ((∀ k : Fin 4, QPos.le (QPos.divPos (ssSimpleRowSum k) 24 (by decide)) ⟨335, 672, by decide⟩) ∧
     QPos.le ⟨335, 672, by decide⟩ ⟨1, 2, by decide⟩ ∧ (335 * 2 < 1 * 672) ∧
     (4 * 2351 - 3 * 2688) * 672 = 335 * 2688 ∧ 2351 * 8 < 7 * 2688) ∧
    (doublonShift2Pi3Lam13 = ⟨8, -7⟩ ∧
     Eis.normSq doublonShift2Pi3Lam13 = 169 ∧
     2 * doublonShift2Pi3Lam13.a - doublonShift2Pi3Lam13.b = 23 ∧
     4 * 23 - 3 * 26 = 14 ∧ 14 * 13 = 7 * 26 ∧
     23 * 8 > 7 * 26 ∧ 7 * 2 > 13 ∧ 7 * 672 > 335 * 13) ∧
    (2442 * 4 < 10000 ∧
     2442 * 31416 < 768 * 100000 ∧
     (49 : Int) * 2 < 100 ∧
     10 * (2 * (1000 ^ 2 : Int) - 768 ^ 2) > 7 * (2 * (1000 ^ 2 : Int)) ∧
     (335 : Int) * 2 < 672 ∧ 1 * 13 < 7 * 2 ∧ 7 * 10 < 7 * 13 ∧
     QPos.le ⟨335, 672, by decide⟩ ⟨7, 13, by decide⟩ ∧
     QPos.le ⟨7, 13, by decide⟩ ⟨7, 10, by decide⟩) ∧
    (∀ (rayNum rayDen : Int) (hDen : 0 < rayDen),
      QPos.le ⟨rayNum, rayDen, hDen⟩ ⟨335, 672, by decide⟩ →
      ¬ QPos.le ⟨7, 13, by decide⟩ ⟨rayNum, rayDen, hDen⟩ ∧
      ¬ QPos.le ⟨7, 10, by decide⟩ ⟨rayNum, rayDen, hDen⟩) := by
  have hHyp := thm_ss_normalized_gap_gt_half
  refine ⟨⟨hHyp.1, hHyp.2.2.1, hHyp.2.2.2.1, by decide, by decide⟩,
          by decide,
          by unfold QPos.le; decide,
          ?_⟩
  intro rayNum rayDen hDen hUp
  unfold QPos.le at hUp
  constructor <;> (intro hLo; unfold QPos.le at hLo; nlinarith)


/-! ## Section 6: Exact Depressed-Cubic Holographic Asymptotic Rate (`u^3 - 12 u + 12 = 0`) -/

/-- Homogeneous Steinberg characteristic cubic `P_St(a, b) = a^3 - 21 a^2 b + 51 a b^2 - 23 b^3`
    of `{3,4,3,4}` (`Vibe.CuspGrowth.thm_foata_cubic_recurrence`). -/
def ctSteinbergHom (a b : Int) : Int :=
  a * (a * a) - 21 * (a * (a * b)) + 51 * (a * (b * b)) - 23 * (b * (b * b))

/-- Homogeneous W10 depressed cubic `D_u(p, q) = p^3 - 12 p q^2 + 12 q^3` for `u = 24 r_∞ = p / q`. -/
def ctDepressedHom (p q : Int) : Int :=
  p * (p * p) - 12 * (p * (q * q)) + 12 * (q * (q * q))

/-- Homogeneous direct cubic `R_hom(a, b) = 1152 a^3 - 24 a b^2 + b^3` for `r_∞ = a / b`. -/
def ctRateCubicHom (a b : Int) : Int :=
  1152 * (a * (a * a)) - 24 * (a * (b * b)) + b * (b * b)

private theorem ct_steinberg_to_depressed_hom (p q : Int) :
    ctSteinbergHom (p + q) (p - q) = 8 * ctDepressedHom p q := by
  unfold ctSteinbergHom ctDepressedHom; ring

private theorem ct_depressed_strict_dec_on_1_2 (p1 q1 p2 q2 : Int)
    (hq1 : 0 < q1) (hq2 : 0 < q2)
    (h1Lo : q1 ≤ p1) (h2Hi : p2 ≤ 2 * q2) (hLt : p1 * q2 < p2 * q1) :
    ctDepressedHom p2 q2 * (q1 * (q1 * q1)) < ctDepressedHom p1 q1 * (q2 * (q2 * q2)) := by
  let x := p1 * q2; let y := p2 * q1; let d := q1 * q2
  have hd : 0 < d := by nlinarith
  have hx0 : 0 ≤ x := by nlinarith
  have hyHi : y ≤ 2 * d := by nlinarith
  have hxLt : x < 2 * d := by omega
  have hDiff : ctDepressedHom p1 q1 * (q2 * (q2 * q2)) - ctDepressedHom p2 q2 * (q1 * (q1 * q1)) =
      (y - x) * (12 * (d * d) - (y * y + y * x + x * x)) := by
    unfold ctDepressedHom; dsimp only [x, y, d]; ring
  have hQuad : 0 < 12 * (d * d) - (y * y + y * x + x * x) := by nlinarith
  have hPos : 0 < (y - x) * (12 * (d * d) - (y * y + y * x + x * x)) :=
    mul_pos (by omega) hQuad
  linarith

/-- Headline Theorem 9 (Exact Depressed-Cubic Holographic Asymptotic Rate Identity, Bracket & Uniqueness):
    1. Exact polynomial transformation linking `Vibe.CuspGrowth`'s Steinberg cubic
       `P_St(λ) = λ^3 - 21 λ^2 + 51 λ - 23` directly to W10's depressed cubic `u^3 - 12 u + 12`:
       - Integer form (`∀ u : Int`):
         `(u + 1)^3 - 21 (u + 1)^2 (u - 1) + 51 (u + 1)(u - 1)^2 - 23 (u - 1)^3 = 8 (u^3 - 12 u + 12)`,
       - Scaled rational form (`∀ p q : Int`, `u = p / q`):
         `ctSteinbergHom (p + q) (p - q) = 8 * ctDepressedHom p q`,
       - Direct asymptotic encoding-rate cubic (`∀ a b : Int`, `r_∞ = u / 24 = a / b`):
         `ctSteinbergHom (24 a + b) (24 a - b) = 96 * (1152 a^3 - 24 a b^2 + b^3)`.
    2. Strict decreasing monotonicity of `u^3 - 12 u + 12` over ALL rationals `1 ≤ p1/q1 < p2/q2 ≤ 2`
       (proving uniqueness of the root in `[1, 2]`, with `D_u(1, 1) = 1 > 0 > -4 = D_u(2, 1)`).
    3. Exact sign-change root brackets:
       - `1115749 / 1000000 < u < 1115750 / 1000000` (`D_u(1115749, 10^6) > 0 > D_u(1115750, 10^6)`),
       - `464895 / 10000000 < r_∞ < 464896 / 10000000` (`R_hom(464895, 10^7) > 0 > R_hom(464896, 10^7)`),
       directly consistent with `Vibe.CuspGrowth.thm_cusp_and_ball_growth_rate_bounds` (`182787/10000 < λ_{3434} < 182788/10000`)! -/
theorem thm_ct_holographic_rate_depressed_cubic :
    (∀ u : Int,
      (u + 1) * ((u + 1) * (u + 1)) - 21 * ((u + 1) * ((u + 1) * (u - 1))) +
        51 * ((u + 1) * ((u - 1) * (u - 1))) - 23 * ((u - 1) * ((u - 1) * (u - 1))) =
        8 * (u * (u * u) - 12 * u + 12)) ∧
    (∀ p q : Int, ctSteinbergHom (p + q) (p - q) = 8 * ctDepressedHom p q) ∧
    (∀ a b : Int, ctSteinbergHom (24 * a + b) (24 * a - b) = 96 * ctRateCubicHom a b) ∧
    (∀ p1 q1 p2 q2 : Int, 0 < q1 → 0 < q2 → q1 ≤ p1 → p2 ≤ 2 * q2 → p1 * q2 < p2 * q1 →
      ctDepressedHom p2 q2 * (q1 * (q1 * q1)) < ctDepressedHom p1 q1 * (q2 * (q2 * q2))) ∧
    (ctDepressedHom 1 1 = 1 ∧ ctDepressedHom 2 1 = -4 ∧
     ctDepressedHom 1115749 1000000 > 0 ∧ ctDepressedHom 1115750 1000000 < 0 ∧
     ctRateCubicHom 464895 10000000 > 0 ∧ ctRateCubicHom 464896 10000000 < 0 ∧
     ctSteinbergHom 182787 10000 < 0 ∧ ctSteinbergHom 182788 10000 > 0 ∧
     ctDepressedHom 192787 172787 < 0 ∧ ctDepressedHom 192788 172788 > 0) := by
  have hCG := thm_cusp_and_ball_growth_rate_bounds.2.2
  refine ⟨fun u => by ring,
          ct_steinberg_to_depressed_hom,
          fun a b => by unfold ctSteinbergHom ctRateCubicHom; ring,
          ct_depressed_strict_dec_on_1_2,
          ⟨by decide, by decide, by decide, by decide, by decide, by decide, ?_, ?_, by decide, by decide⟩⟩
  · have hEq : ctSteinbergHom 182787 10000 =
        (182787 : Int) * 182787 * 182787 - 21 * 10000 * 182787 * 182787 +
        51 * 10000 * 10000 * 182787 - 23 * 10000 * 10000 * 10000 := by decide
    rw [hEq]; exact hCG.1
  · have hEq : ctSteinbergHom 182788 10000 =
        (182788 : Int) * 182788 * 182788 - 21 * 10000 * 182788 * 182788 +
        51 * 10000 * 10000 * 182788 - 23 * 10000 * 10000 * 10000 := by decide
    rw [hEq]; exact hCG.2

end Vibe

end
