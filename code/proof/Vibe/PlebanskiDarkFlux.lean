module

public import Mathlib.Analysis.SpecialFunctions.Log.Deriv
public import Vibe.StandardModelMathlib

import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.NormNum

/-!
# Vibe Theory: Plebanski 24-Cell Geometry, Dark-Sector Stability, Flux Uniqueness & NEC Bounds

Mathlib `v4.35.0` formalization building directly on `Vibe.StandardModelMathlib` (`mlD4Fprim`,
`mlD4Triality`, `mlD4Root`, `mlDot4`, `mlOmegaC`, `mlChar2T`, `mlCharInner2T`, `mlChiV1`,
`mlChiV2`) for four Tier-A theorems:

Headline theorems (`0 sorry`, `0 axiom`, `0 native_decide`, `#print axioms` clean):
1. `thm_untwisted_anomaly_uniqueness`: Derives `orbPfaffian n = 6 n^2` from
   `(n • mlD4Fprim).det = (6 n^2)^2` and `orbLefschetz = -((mlD4Triality - 1).det / 3) = -3`
   from the 9 fixed points `det(M_{D_4} - I) = 9`, constructs the `Z_3` Lefschetz character
   projections `orbIndUntwisted n = (orbPfaffian n + 2 * orbLefschetz) / 3 = 2 n^2 - 2` and
   `orbIndTwisted n = (orbPfaffian n - orbLefschetz) / 3 = 2 n^2 + 1`, and proves exact
   uniqueness `orbIndUntwisted n = 0 ↔ n = ±1`, forcing `N_gen = 3` and total chirality `6`.
2. `thm_vq2_dark_sector_stability`: Exact `Z_3^{DM}` charge conservation `q - F (mod 3)`
   forbidding `ΔF = 0` decay `V_2 → V_1 + V_1 + V_1_bar`, combined with `mlChar2T` / `mlChiV1` /
   `mlChiV2` (`2T_R = SL(2, 3)`) proving zero Dirac mixing, zero Majorana mixing, exact 3-body
   `ΔF = -2` stability of the `1'` dark singlet, allowed `2 → 2` thermal-relic annihilation
   portal (multiplicity `7`), and allowed Dirac dark self-mass (multiplicity `2`).
3. `thm_plebanski_24cell_simplicity_and_closure`: Exact 24-cell (`D_4` root polytope via
   `mlD4Root`) Plebanski BF geometry over `ℤ`: exact `f`-vector (`96` equilateral triangles,
   `24` octahedral facets with `6` vertices and `8` triangles each, `672` intra-facet pairs),
   exact diagonal simplicity (`96/96` triangles & `192/192` oriented facet-triangles), exact
   cross-simplicity (`672` intra-facet pairs), exact octahedral Gauss closure (`24/24` facets),
   the universal 4-simplex 6-face exterior opposite-face wedge-pairing identity over `ℤ^4`
   (anisotropically invariant), exact per-simplex & integrated 192-simplex Plebanski tensors
   (`plebTensorPP = +4·192 I_3`, `plebTensorMM = -4·192 I_3`, `plebTensorPM = 0`, 4-volume
   `V_24 = 8`), and an unconstrained BF negative control (`5:4` deformation) that preserves
   exact Gauss closure on all `24` facets while strictly breaking both diagonal simplicity and
   traceless Plebanski symmetry.
4. `thm_nec_monotone_velocity_bound`: Exact continuous real-calculus `HasDerivAt`
   differentiation of the near-horizon metric function
   `f(z) = 1 - z^2 + a₀ z^2 log z + a₁ (z^3 - z^2)`, exact NEC identity
   `z f''(z) - f'(z) = 2 a₀ z + 3 a₁ z^2 ≥ 0`, exact quotient derivative
   `(f'(z) / z)' = (z f''(z) - f'(z)) / z^2`, monotonicity of `q(z) = f'(z) / z` on `(0, ∞)`,
   horizon values `f(1) = 0`, `f'(1) = -2 + a₀ + a₁`, exterior sub-BTZ blackening bound
   `f(z) ≤ 1 - z^2` on `(0, 1]`, and interior `z ≥ 1` Hartman-Maldacena causal entanglement
   velocity bound `1 - z^2 ≤ f(z)` and `v_E^2(z) = -f(z) / z^2 ≤ 1 - 1 / z^2 < 1`.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

open Matrix

/-! ### 1. Exact Untwisted Orbifold Anomaly Uniqueness -/

/-- Total chiral Pfaffian index `Pf(n F_prim) = 6 n^2` on `T^4_{D_4}` for integer flux quantum `n`,
    linked to `(n • mlD4Fprim).det = (orbPfaffian n)^2`. -/
def orbPfaffian (n : ℤ) : ℤ := 6 * n ^ 2

/-- Fixed-point Lefschetz trace `L(q_3) = -((M_{D_4} - I).det / 3) = -3` from the 9 isolated
    `q_3`-fixed points of `mlD4Triality` on `T^4_{D_4}`. -/
def orbLefschetz : ℤ := -((mlD4Triality - 1).det / 3)

/-- Chiral index in the untwisted orbifold sector `V_{q=0}` via `Z_3` Lefschetz character
    projection `(Pf(n F_prim) + 2 L(q_3)) / 3`. -/
def orbIndUntwisted (n : ℤ) : ℤ := (orbPfaffian n + 2 * orbLefschetz) / 3

/-- Chiral index in each twisted orbifold sector `V_{q=1}`, `V_{q=2}` via `Z_3` Lefschetz
    character projection `(Pf(n F_prim) - L(q_3)) / 3`. -/
def orbIndTwisted (n : ℤ) : ℤ := (orbPfaffian n - orbLefschetz) / 3

/-- Headline 1: Exact Untwisted Orbifold Anomaly Uniqueness Theorem.
    Derives the Pfaffian scaling `(n • mlD4Fprim).det = (orbPfaffian n)^2` and Lefschetz fixed-point
    trace `orbLefschetz = -3` directly from `mlD4Fprim` and `mlD4Triality`, proves the `Z_3`
    character-projected indices equal `2 n^2 - 2` and `2 n^2 + 1`, and proves that untwisted
    anomaly cancellation (`orbIndUntwisted n = 0`) uniquely selects `n = ±1`, forcing `N_gen = 3`
    and total Pfaffian chirality `6`. -/
theorem thm_untwisted_anomaly_uniqueness :
    (∀ n : ℤ, (n • mlD4Fprim).det = (orbPfaffian n) ^ 2) ∧
    ((mlD4Triality - 1).det = 9 ∧ orbLefschetz = -3 ∧ -(mlD4Triality - 1).det / 3 = -3) ∧
    (∀ n : ℤ, orbIndUntwisted n = 2 * n ^ 2 - 2 ∧ orbIndTwisted n = 2 * n ^ 2 + 1) ∧
    (∀ n : ℤ, orbIndUntwisted n + 2 * orbIndTwisted n = orbPfaffian n) ∧
    (∀ n : ℤ, orbIndUntwisted n = 0 ↔ n = 1 ∨ n = -1) ∧
    (∀ n : ℤ, orbIndUntwisted n = 0 →
      orbIndTwisted n = 3 ∧ orbIndUntwisted n + 2 * orbIndTwisted n = 6) ∧
    ((orbIndUntwisted 0, orbIndTwisted 0) = (-2, 1) ∧
      (orbIndUntwisted 1, orbIndTwisted 1) = (0, 3) ∧
      (orbIndUntwisted 2, orbIndTwisted 2) = (6, 9) ∧
      (orbIndUntwisted 3, orbIndTwisted 3) = (16, 19)) := by
  have hTri9 : (mlD4Triality - 1).det = 9 := thm_ml_d4_outer_triality_fprim_det.2.2.1
  have hFprim36 : mlD4Fprim.det = 36 := thm_ml_d4_outer_triality_fprim_det.2.2.2.2.2.2
  have hDetScale : ∀ n : ℤ, (n • mlD4Fprim).det = (orbPfaffian n) ^ 2 := by
    intro n
    rw [Matrix.det_smul, Fintype.card_fin, hFprim36, orbPfaffian]
    ring
  have hLefVal : orbLefschetz = -3 := by
    rw [orbLefschetz, hTri9]
    norm_num
  have hLefDiv : -(mlD4Triality - 1).det / 3 = -3 := by
    rw [hTri9]
    norm_num
  have hFormulas : ∀ n : ℤ, orbIndUntwisted n = 2 * n ^ 2 - 2 ∧ orbIndTwisted n = 2 * n ^ 2 + 1 := by
    intro n
    constructor
    · rw [orbIndUntwisted, orbPfaffian, hLefVal]
      have hNum : 6 * n ^ 2 + 2 * -3 = 3 * (2 * n ^ 2 - 2) := by ring
      rw [hNum, Int.mul_ediv_cancel_left _ (by decide : (3 : ℤ) ≠ 0)]
    · rw [orbIndTwisted, orbPfaffian, hLefVal]
      have hNum : 6 * n ^ 2 - -3 = 3 * (2 * n ^ 2 + 1) := by ring
      rw [hNum, Int.mul_ediv_cancel_left _ (by decide : (3 : ℤ) ≠ 0)]
  refine ⟨hDetScale, ⟨hTri9, hLefVal, hLefDiv⟩, hFormulas, ?_, ?_, ?_, ?_⟩
  · intro n
    rcases hFormulas n with ⟨hU, hT⟩
    rw [hU, hT, orbPfaffian]
    ring
  · intro n
    rw [(hFormulas n).1]
    constructor
    · intro h
      have hFac : (n - 1) * (n + 1) = 0 := by nlinarith
      rcases mul_eq_zero.mp hFac with h1 | h2
      · left; linarith
      · right; linarith
    · rintro (rfl | rfl) <;> norm_num
  · intro n h
    rcases hFormulas n with ⟨hU, hT⟩
    rw [hU] at h
    rw [hU, hT]
    constructor <;> linarith
  · simp only [hFormulas]
    norm_num

/-! ### 2. Exact `Z_3^{DM} × 2T_R` Dark-Sector Stability -/

/-- Exact `Z_3^{DM}` dark-matter charge `Q_{DM}(q, F) = q - F (mod 3)`. -/
def darkChargeZ3 (q F : ZMod 3) : ZMod 3 := q - F

private def darkChar2TCoeff (i : Fin 7) : Fin 7 → ℤ × ℤ :=
  match i.val with
  | 0 => ![(1, 0), (1, 0),  (1, 0),  (1, 0),   (1, 0),   (1, 0),   (1, 0)]
  | 1 => ![(1, 0), (1, 0),  (1, 0),  (0, 1),   (-1, -1), (-1, -1), (0, 1)]
  | 2 => ![(1, 0), (1, 0),  (1, 0),  (-1, -1), (0, 1),   (0, 1),   (-1, -1)]
  | 3 => ![(3, 0), (3, 0),  (-1, 0), (0, 0),   (0, 0),   (0, 0),   (0, 0)]
  | 4 => ![(2, 0), (-2, 0), (0, 0),  (-1, 0),  (-1, 0),  (1, 0),   (1, 0)]
  | 5 => ![(2, 0), (-2, 0), (0, 0),  (0, -1),  (1, 1),   (-1, -1), (0, 1)]
  | _ => ![(2, 0), (-2, 0), (0, 0),  (1, 1),   (0, -1),  (0, 1),   (-1, -1)]

private def darkEisAdd (x y : ℤ × ℤ) : ℤ × ℤ := (x.1 + y.1, x.2 + y.2)
private def darkEisConj (z : ℤ × ℤ) : ℤ × ℤ := (z.1 - z.2, -z.2)
private def darkEisMul (x y : ℤ × ℤ) : ℤ × ℤ :=
  (x.1 * y.1 - x.2 * y.2, x.1 * y.2 + x.2 * y.1 - x.2 * y.2)
private def darkEisScale (n : ℕ) (z : ℤ × ℤ) : ℤ × ℤ := ((n : ℤ) * z.1, (n : ℤ) * z.2)
private def darkEisSum7 (f : Fin 7 → ℤ × ℤ) : ℤ × ℤ :=
  (∑ k : Fin 7, (f k).1, ∑ k : Fin 7, (f k).2)

private def darkChiV1Coeff (c : Fin 7) : ℤ × ℤ := darkEisAdd (darkChar2TCoeff 0 c) (darkChar2TCoeff 6 c)
private def darkChiV2Coeff (c : Fin 7) : ℤ × ℤ := darkEisAdd (darkChar2TCoeff 1 c) (darkChar2TCoeff 4 c)

/-- Headline 2: Exact `Z_3^{DM} × 2T_R` Dark-Sector Stability Theorem.
    Reuses `mlChar2T`, `mlCharInner2T`, `mlChiV1`, and `mlChiV2` directly from
    `Vibe.StandardModelMathlib`:
    (a) Exact `Z_3^{DM}` conservation assigns zero dark charge to SM fermions `(1, 1)`,
        antifermions `(2, -1)`, bosons `(0, 0)`, and baryons `(0, 3)`, while assigning nonzero
        charge `1 ∈ ZMod 3` to `V_{q=2}` fermions `(2, 1)`, strictly forbidding any `ΔF = 0`
        decay `V_2 → V_1 + V_1 + V_1_bar`.
    (b) Exact `2T_R = SL(2, 3)` character inner products over `ℂ` prove:
        (1) zero Dirac mixing `⟨V_1* ⊗ V_2, 1⟩ = 0`,
        (2) zero Majorana mixing `⟨V_1 ⊗ V_2, 1⟩ = 0`,
        (3) exact 3-body `ΔF = -2` stability of the `1'` dark singlet
            `⟨(1')* ⊗ V_1* ⊗ V_1* ⊗ V_1, 1⟩ = 0`,
        (4) allowed `2 → 2` thermal-relic annihilation portal
            `⟨V_2* ⊗ V_2 ⊗ V_1* ⊗ V_1, 1⟩ = 7`,
        (5) allowed Dirac dark self-mass `⟨V_2* ⊗ V_2, 1⟩ = 2`. -/
theorem thm_vq2_dark_sector_stability :
    (darkChargeZ3 1 1 = 0 ∧
      darkChargeZ3 2 (-1) = 0 ∧
      darkChargeZ3 0 0 = 0 ∧
      darkChargeZ3 0 3 = 0 ∧
      darkChargeZ3 2 1 = 1 ∧ (1 : ZMod 3) ≠ 0 ∧
      darkChargeZ3 2 1 ≠
        darkChargeZ3 1 1 + darkChargeZ3 1 1 + darkChargeZ3 2 (-1)) ∧
    (mlCharInner2T (fun c => star (mlChiV1 c) * mlChiV2 c) (mlChar2T 0) = 0 ∧
      mlCharInner2T (fun c => mlChiV1 c * mlChiV2 c) (mlChar2T 0) = 0 ∧
      mlCharInner2T
        (fun c => star (mlChar2T 1 c) * star (mlChiV1 c) * star (mlChiV1 c) * mlChiV1 c)
        (mlChar2T 0) = 0 ∧
      mlCharInner2T
        (fun c => star (mlChiV2 c) * mlChiV2 c * star (mlChiV1 c) * mlChiV1 c)
        (mlChar2T 0) = 7 ∧
      mlCharInner2T (fun c => star (mlChiV2 c) * mlChiV2 c) (mlChar2T 0) = 2) := by
  have h2T := thm_ml_2tr_character_table_and_rank1_origin
  have hW2 : mlOmegaC ^ 2 = mlOmegaC2 := h2T.2.1.2.1
  have hWSum : mlOmegaC + mlOmegaC2 + 1 = 0 := h2T.2.1.2.2
  have hV1Decomp : ∀ c : Fin 7, mlChiV1 c = mlChar2T 0 c + mlChar2T 6 c := h2T.2.2.2.2.1.2.1
  have hV2Decomp : ∀ c : Fin 7, mlChiV2 c = mlChar2T 1 c + mlChar2T 4 c := h2T.2.2.2.2.1.2.2.1
  have hW2Eq : mlOmegaC2 = -1 - mlOmegaC := by linear_combination hWSum
  have hWSqLin : mlOmegaC ^ 2 = -1 - mlOmegaC := by rw [hW2, hW2Eq]
  have hConjW : starRingEnd ℂ mlOmegaC = -1 - mlOmegaC := by
    apply Complex.ext
    · simp [mlOmegaC]; norm_num
    · simp [mlOmegaC]
  let eisC : ℤ × ℤ → ℂ := fun z => (z.1 : ℂ) + (z.2 : ℂ) * mlOmegaC
  have hEisAdd : ∀ x y : ℤ × ℤ, eisC x + eisC y = eisC (darkEisAdd x y) := by
    intro ⟨a, b⟩ ⟨c, d⟩
    simp only [eisC, darkEisAdd, Int.cast_add]
    ring
  have hEisConj : ∀ z : ℤ × ℤ, star (eisC z) = eisC (darkEisConj z) := by
    intro ⟨a, b⟩
    simp only [eisC, darkEisConj, star_add, star_mul', Complex.star_def,
      map_intCast, hConjW, Int.cast_sub, Int.cast_neg]
    ring
  have hEisMul : ∀ x y : ℤ × ℤ, eisC x * eisC y = eisC (darkEisMul x y) := by
    intro ⟨a, b⟩ ⟨c, d⟩
    simp only [eisC, darkEisMul, Int.cast_sub, Int.cast_add, Int.cast_mul]
    linear_combination (b : ℂ) * (d : ℂ) * hWSqLin
  have hEisScale : ∀ (n : ℕ) (z : ℤ × ℤ), (n : ℂ) * eisC z = eisC (darkEisScale n z) := by
    intro n ⟨a, b⟩
    simp only [eisC, darkEisScale, Int.cast_mul, Int.cast_natCast]
    ring
  have hEisSum : ∀ f : Fin 7 → ℤ × ℤ, (∑ k : Fin 7, eisC (f k)) = eisC (darkEisSum7 f) := by
    intro f
    simp only [eisC, darkEisSum7, Finset.sum_add_distrib, ← Finset.sum_mul, Int.cast_sum]
  have hCharCoeff : ∀ i c : Fin 7, mlChar2T i c = eisC (darkChar2TCoeff i c) := by
    intro i c
    fin_cases i <;> fin_cases c <;>
      simp [mlChar2T, darkChar2TCoeff, eisC, hW2Eq] <;> ring
  have hV1Coeff : ∀ c : Fin 7, mlChiV1 c = eisC (darkChiV1Coeff c) := by
    intro c
    rw [hV1Decomp c]
    simp only [darkChiV1Coeff, hCharCoeff, hEisAdd]
  have hV2Coeff : ∀ c : Fin 7, mlChiV2 c = eisC (darkChiV2Coeff c) := by
    intro c
    rw [hV2Decomp c]
    simp only [darkChiV2Coeff, hCharCoeff, hEisAdd]
  have hDiracInt :
      darkEisSum7 (fun c =>
        darkEisMul (darkEisScale (mlClassSize2T c)
          (darkEisConj (darkEisMul (darkEisConj (darkChiV1Coeff c)) (darkChiV2Coeff c))))
          (darkChar2TCoeff 0 c)) = (0, 0) := by
    decide
  have hMajInt :
      darkEisSum7 (fun c =>
        darkEisMul (darkEisScale (mlClassSize2T c)
          (darkEisConj (darkEisMul (darkChiV1Coeff c) (darkChiV2Coeff c))))
          (darkChar2TCoeff 0 c)) = (0, 0) := by
    decide
  have hDecay3Int :
      darkEisSum7 (fun c =>
        darkEisMul (darkEisScale (mlClassSize2T c)
          (darkEisConj (darkEisMul
            (darkEisMul (darkEisMul (darkEisConj (darkChar2TCoeff 1 c)) (darkEisConj (darkChiV1Coeff c)))
              (darkEisConj (darkChiV1Coeff c)))
            (darkChiV1Coeff c))))
          (darkChar2TCoeff 0 c)) = (0, 0) := by
    decide
  have hPortalInt :
      darkEisSum7 (fun c =>
        darkEisMul (darkEisScale (mlClassSize2T c)
          (darkEisConj (darkEisMul
            (darkEisMul (darkEisMul (darkEisConj (darkChiV2Coeff c)) (darkChiV2Coeff c))
              (darkEisConj (darkChiV1Coeff c)))
            (darkChiV1Coeff c))))
          (darkChar2TCoeff 0 c)) = (168, 0) := by
    decide
  have hSelfInt :
      darkEisSum7 (fun c =>
        darkEisMul (darkEisScale (mlClassSize2T c)
          (darkEisConj (darkEisMul (darkEisConj (darkChiV2Coeff c)) (darkChiV2Coeff c))))
          (darkChar2TCoeff 0 c)) = (48, 0) := by
    decide
  refine ⟨by decide, ?_, ?_, ?_, ?_, ?_⟩
  · simp only [mlCharInner2T, hV1Coeff, hV2Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hDiracInt]
    simp [eisC]
  · simp only [mlCharInner2T, hV1Coeff, hV2Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hMajInt]
    simp [eisC]
  · simp only [mlCharInner2T, hV1Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hDecay3Int]
    simp [eisC]
  · simp only [mlCharInner2T, hV1Coeff, hV2Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hPortalInt]
    simp [eisC]
    norm_num
  · simp only [mlCharInner2T, hV2Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hSelfInt]
    simp [eisC]
    norm_num

/-! ### 3. Exact 24-Cell Plebanski BF Simplicity, Closure & True 192-Simplex Wedge Pairing -/

/-- Exact 24 octahedral facet outward normals `n_c` (`‖n_c‖^2 = 4`): `±2 e_k` and `(±1, ±1, ±1, ±1)`. -/
def plebFacetNormal (c : Fin 24) : Fin 4 → ℤ :=
  match c.val with
  | 0  => ![ 2,  0,  0,  0]
  | 1  => ![-2,  0,  0,  0]
  | 2  => ![ 0,  2,  0,  0]
  | 3  => ![ 0, -2,  0,  0]
  | 4  => ![ 0,  0,  2,  0]
  | 5  => ![ 0,  0, -2,  0]
  | 6  => ![ 0,  0,  0,  2]
  | 7  => ![ 0,  0,  0, -2]
  | 8  => ![ 1,  1,  1,  1]
  | 9  => ![ 1,  1,  1, -1]
  | 10 => ![ 1,  1, -1,  1]
  | 11 => ![ 1,  1, -1, -1]
  | 12 => ![ 1, -1,  1,  1]
  | 13 => ![ 1, -1,  1, -1]
  | 14 => ![ 1, -1, -1,  1]
  | 15 => ![ 1, -1, -1, -1]
  | 16 => ![-1,  1,  1,  1]
  | 17 => ![-1,  1,  1, -1]
  | 18 => ![-1,  1, -1,  1]
  | 19 => ![-1,  1, -1, -1]
  | 20 => ![-1, -1,  1,  1]
  | 21 => ![-1, -1,  1, -1]
  | 22 => ![-1, -1, -1,  1]
  | _  => ![-1, -1, -1, -1]

/-- Euclidean inner product on `ℤ^3`. -/
def plebDot3 (u v : Fin 3 → ℤ) : ℤ :=
  u 0 * v 0 + u 1 * v 1 + u 2 * v 2

/-- Exact `4 × 4` integer determinant of rows `(r0, r1, r2, r3)`. -/
def plebDet4 (r0 r1 r2 r3 : Fin 4 → ℤ) : ℤ :=
  let det3 (a b c : Fin 4 → ℤ) (i j k : Fin 4) : ℤ :=
    a i * (b j * c k - b k * c j) -
    a j * (b i * c k - b k * c i) +
    a k * (b i * c j - b j * c i)
  r0 0 * det3 r1 r2 r3 1 2 3 -
  r0 1 * det3 r1 r2 r3 0 2 3 +
  r0 2 * det3 r1 r2 r3 0 1 3 -
  r0 3 * det3 r1 r2 r3 0 1 2

/-- Self-dual 't Hooft bivector split `2 (b_{0a} + b_{bc}) = (u_0 v_a - u_a v_0) + (u_b v_c - u_c v_b)`
    of any two vectors `u, v ∈ ℤ^4` (exact integer normalization matching `bivectorSplit(u, v, 1/2)`). -/
def plebPairBivP (u v : Fin 4 → ℤ) (I : Fin 3) : ℤ :=
  match I.val with
  | 0 => (u 0 * v 1 - u 1 * v 0) + (u 2 * v 3 - u 3 * v 2)
  | 1 => (u 0 * v 2 - u 2 * v 0) - (u 1 * v 3 - u 3 * v 1)
  | _ => (u 0 * v 3 - u 3 * v 0) + (u 1 * v 2 - u 2 * v 1)

/-- Anti-self-dual 't Hooft bivector split `2 (b_{0a} - b_{bc}) = (u_0 v_a - u_a v_0) - (u_b v_c - u_c v_b)`
    of any two vectors `u, v ∈ ℤ^4`. -/
def plebPairBivM (u v : Fin 4 → ℤ) (I : Fin 3) : ℤ :=
  match I.val with
  | 0 => (u 0 * v 1 - u 1 * v 0) - (u 2 * v 3 - u 3 * v 2)
  | 1 => (u 0 * v 2 - u 2 * v 0) + (u 1 * v 3 - u 3 * v 1)
  | _ => (u 0 * v 3 - u 3 * v 0) - (u 1 * v 2 - u 2 * v 1)

/-- Generator of all ordered equilateral `D_4` root triples `(i, j, k)` (`i < j < k`, pairwise
    `mlDot4 = 1`) within a vertex list `vs`. -/
def plebTriListFrom (vs : List (Fin 24)) : List (Fin 24 × Fin 24 × Fin 24) :=
  vs.flatMap fun i =>
    (vs.filter fun j => i < j ∧ mlDot4 (mlD4Root i) (mlD4Root j) = 1).flatMap fun j =>
      (vs.filter fun k =>
        j < k ∧ mlDot4 (mlD4Root i) (mlD4Root k) = 1 ∧
          mlDot4 (mlD4Root j) (mlD4Root k) = 1).map fun k => (i, j, k)

/-- Ordered list of all `96` equilateral triangular 2-faces of the regular 24-cell. -/
def plebTriList : List (Fin 24 × Fin 24 × Fin 24) :=
  plebTriListFrom (List.finRange 24)

/-- `Finset` of all `96` equilateral triangular 2-faces of the regular 24-cell. -/
def plebD4Tris : Finset (Fin 24 × Fin 24 × Fin 24) :=
  plebTriList.toFinset

/-- Ordered list of the `6` vertices of octahedral facet `c` (`v · n_c = 2`). -/
def plebFacetVertList (c : Fin 24) : List (Fin 24) :=
  (List.finRange 24).filter fun v => mlDot4 (mlD4Root v) (plebFacetNormal c) = 2

/-- `Finset` of the `6` vertices of octahedral facet `c`. -/
def plebFacetVerts (c : Fin 24) : Finset (Fin 24) :=
  (plebFacetVertList c).toFinset

/-- Ordered list of the `8` equilateral triangles of octahedral facet `c`. -/
def plebFacetTriList (c : Fin 24) : List (Fin 24 × Fin 24 × Fin 24) :=
  plebTriListFrom (plebFacetVertList c)

/-- `Finset` of the `8` equilateral triangles of octahedral facet `c`. -/
def plebFacetTris (c : Fin 24) : Finset (Fin 24 × Fin 24 × Fin 24) :=
  (plebFacetTriList c).toFinset

/-- Positively oriented second vertex `vv` of triangle `t = (i, j, k)` in facet `c`, chosen so
    that the radial 4-simplex `(0, n_c, u, vv, ww)` satisfies `det(n_c, u, vv, ww) > 0`. -/
def plebSimplexV1 (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 4 → ℤ :=
  if 0 < plebDet4 (plebFacetNormal c) (mlD4Root t.1) (mlD4Root t.2.1) (mlD4Root t.2.2)
  then mlD4Root t.2.1
  else mlD4Root t.2.2

/-- Positively oriented third vertex `ww` of triangle `t = (i, j, k)` in facet `c`. -/
def plebSimplexV2 (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 4 → ℤ :=
  if 0 < plebDet4 (plebFacetNormal c) (mlD4Root t.1) (mlD4Root t.2.1) (mlD4Root t.2.2)
  then mlD4Root t.2.2
  else mlD4Root t.2.1

/-- Unoriented self-dual area bivector of triangle `t = (i, j, k)`. -/
def plebTriBivP (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  plebPairBivP (fun μ => mlD4Root t.2.1 μ - mlD4Root t.1 μ)
    (fun μ => mlD4Root t.2.2 μ - mlD4Root t.1 μ)

/-- Unoriented anti-self-dual area bivector of triangle `t = (i, j, k)`. -/
def plebTriBivM (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  plebPairBivM (fun μ => mlD4Root t.2.1 μ - mlD4Root t.1 μ)
    (fun μ => mlD4Root t.2.2 μ - mlD4Root t.1 μ)

/-- Outward-oriented self-dual area bivector `B_{c,t}^+` of triangle `t` on octahedral facet `c`. -/
def plebBivP (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  plebPairBivP (fun μ => plebSimplexV1 c t μ - mlD4Root t.1 μ)
    (fun μ => plebSimplexV2 c t μ - mlD4Root t.1 μ)

/-- Outward-oriented anti-self-dual area bivector `B_{c,t}^-` of triangle `t` on octahedral facet `c`. -/
def plebBivM (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  plebPairBivM (fun μ => plebSimplexV1 c t μ - mlD4Root t.1 μ)
    (fun μ => plebSimplexV2 c t μ - mlD4Root t.1 μ)

/-- The 6 origin-incident self-dual triangle bivectors of any 4-simplex `(0, e0, e1, e2, e3)`:
    `[e0∧e1, e0∧e2, e0∧e3, e1∧e2, e1∧e3, e2∧e3]`. -/
def plebSimplex6P (e0 e1 e2 e3 : Fin 4 → ℤ) (k : Fin 6) : Fin 3 → ℤ :=
  match k.val with
  | 0 => plebPairBivP e0 e1
  | 1 => plebPairBivP e0 e2
  | 2 => plebPairBivP e0 e3
  | 3 => plebPairBivP e1 e2
  | 4 => plebPairBivP e1 e3
  | _ => plebPairBivP e2 e3

/-- The 6 origin-incident anti-self-dual triangle bivectors of any 4-simplex `(0, e0, e1, e2, e3)`. -/
def plebSimplex6M (e0 e1 e2 e3 : Fin 4 → ℤ) (k : Fin 6) : Fin 3 → ℤ :=
  match k.val with
  | 0 => plebPairBivM e0 e1
  | 1 => plebPairBivM e0 e2
  | 2 => plebPairBivM e0 e3
  | 3 => plebPairBivM e1 e2
  | 4 => plebPairBivM e1 e3
  | _ => plebPairBivM e2 e3

/-- True exterior opposite-face wedge pairing `(f_0 ⊙ g_5 - f_1 ⊙ g_4 + f_2 ⊙ g_3)_{IJ}` of two
    6-face bivector tuples on a 4-simplex. -/
def plebWedgePair (f g : Fin 6 → Fin 3 → ℤ) (I J : Fin 3) : ℤ :=
  (f 0 I * g 5 J + f 5 I * g 0 J) -
  (f 1 I * g 4 J + f 4 I * g 1 J) +
  (f 2 I * g 3 J + f 3 I * g 2 J)

/-- Per-simplex self-dual Plebanski 6-face wedge pairing on the positively oriented 4-simplex
    `(0, n_c, u, vv, ww)` (scaled by `192 = 2 · 96` relative to unit-center `c_4 = n_c / 2`). -/
def plebSimplexPP (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) (I J : Fin 3) : ℤ :=
  let sP := plebSimplex6P (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t)
  plebWedgePair sP sP I J

/-- Per-simplex anti-self-dual Plebanski 6-face wedge pairing on `(0, n_c, u, vv, ww)`. -/
def plebSimplexMM (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) (I J : Fin 3) : ℤ :=
  let sM := plebSimplex6M (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t)
  plebWedgePair sM sM I J

/-- Per-simplex mixed self-dual / anti-self-dual Plebanski 6-face wedge pairing on
    `(0, n_c, u, vv, ww)` (vanishes identically on every simplex, even under anisotropic stretch). -/
def plebSimplexPM (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) (I J : Fin 3) : ℤ :=
  let sP := plebSimplex6P (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t)
  let sM := plebSimplex6M (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t)
  plebWedgePair sP sM I J

/-- True 192-simplex integrated 4-cell self-dual Plebanski tensor (`scale = 192`):
    `plebTensorPP = +4 · 192 · I_3 = +768 I_3`. -/
def plebTensorPP : Matrix (Fin 3) (Fin 3) ℤ :=
  Matrix.of fun I J => ∑ c : Fin 24, ∑ t ∈ plebFacetTris c, plebSimplexPP c t I J

/-- True 192-simplex integrated 4-cell anti-self-dual Plebanski tensor (`scale = 192`):
    `plebTensorMM = -4 · 192 · I_3 = -768 I_3`. -/
def plebTensorMM : Matrix (Fin 3) (Fin 3) ℤ :=
  Matrix.of fun I J => ∑ c : Fin 24, ∑ t ∈ plebFacetTris c, plebSimplexMM c t I J

/-- True 192-simplex integrated 4-cell mixed Plebanski tensor (`scale = 192`):
    `plebTensorPM = 0`. -/
def plebTensorPM : Matrix (Fin 3) (Fin 3) ℤ :=
  Matrix.of fun I J => ∑ c : Fin 24, ∑ t ∈ plebFacetTris c, plebSimplexPM c t I J

/-- Unconstrained BF `5:4` deformation scaling `B^{+,0}` by `5` and `B^{+,1}, B^{+,2}` by `4`
    (equivalent to scaling `B^{+,0}` by `5/4`). -/
def plebDeformP (v : Fin 3 → ℤ) : Fin 3 → ℤ :=
  fun I => if I = 0 then 5 * v 0 else 4 * v I

/-- Deformed self-dual triangle bivector for the unconstrained BF negative control. -/
def plebBivPDef (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  plebDeformP (plebBivP c t)

/-- Matching `4×`-scaled anti-self-dual triangle bivector for the unconstrained BF negative control. -/
def plebBivMDef (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  fun I => 4 * plebBivM c t I

/-- Deformed 192-simplex integrated self-dual Plebanski tensor under the `5:4` unconstrained BF
    deformation, demonstrating strict breakdown of traceless Plebanski symmetry (`P^+ ∦ I_3`). -/
def plebTensorPPDef : Matrix (Fin 3) (Fin 3) ℤ :=
  Matrix.of fun I J =>
    ∑ c : Fin 24, ∑ t ∈ plebFacetTris c,
      let sP := plebSimplex6P (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t)
      plebWedgePair (fun k => plebDeformP (sP k)) (fun k => plebDeformP (sP k)) I J

/-- Elementary 2-plane exterior pairing of the 6 origin-incident faces of a 4-simplex
    `(0, e0, e1, e2, e3)` along coordinate planes `(α, β)` and `(γ, δ)`: discrete counterpart
    of `(dx^α ∧ dx^β) ∧ (dx^γ ∧ dx^δ)`. -/
private def plebPlanePair (e0 e1 e2 e3 : Fin 4 → ℤ) (α β γ δ : Fin 4) : ℤ :=
  let w (u v : Fin 4 → ℤ) (μ ν : Fin 4) : ℤ := u μ * v ν - u ν * v μ
  (w e0 e1 α β * w e2 e3 γ δ + w e2 e3 α β * w e0 e1 γ δ) -
  (w e0 e2 α β * w e1 e3 γ δ + w e1 e3 α β * w e0 e2 γ δ) +
  (w e0 e3 α β * w e1 e2 γ δ + w e1 e2 α β * w e0 e3 γ δ)

private theorem plebPlanePair_symm (e0 e1 e2 e3 : Fin 4 → ℤ) (α β γ δ : Fin 4) :
    plebPlanePair e0 e1 e2 e3 α β γ δ = plebPlanePair e0 e1 e2 e3 γ δ α β := by
  dsimp only [plebPlanePair]
  ring

private theorem plebPlanePair_swap_left (e0 e1 e2 e3 : Fin 4 → ℤ) (α β γ δ : Fin 4) :
    plebPlanePair e0 e1 e2 e3 β α γ δ = -plebPlanePair e0 e1 e2 e3 α β γ δ := by
  dsimp only [plebPlanePair]
  ring

private theorem plebPlanePair_swap_right (e0 e1 e2 e3 : Fin 4 → ℤ) (α β γ δ : Fin 4) :
    plebPlanePair e0 e1 e2 e3 α β δ γ = -plebPlanePair e0 e1 e2 e3 α β γ δ := by
  dsimp only [plebPlanePair]
  ring

private theorem plebPlanePair_share_first (e0 e1 e2 e3 : Fin 4 → ℤ) (α β δ : Fin 4) :
    plebPlanePair e0 e1 e2 e3 α β α δ = 0 := by
  dsimp only [plebPlanePair]
  ring

private theorem plebPlanePair_0123 (e0 e1 e2 e3 : Fin 4 → ℤ) :
    plebPlanePair e0 e1 e2 e3 0 1 2 3 = plebDet4 e0 e1 e2 e3 := by
  dsimp only [plebPlanePair, plebDet4]
  ring

private theorem plebPlanePair_0231 (e0 e1 e2 e3 : Fin 4 → ℤ) :
    plebPlanePair e0 e1 e2 e3 0 2 3 1 = plebDet4 e0 e1 e2 e3 := by
  dsimp only [plebPlanePair, plebDet4]
  ring

private theorem plebPlanePair_0312 (e0 e1 e2 e3 : Fin 4 → ℤ) :
    plebPlanePair e0 e1 e2 e3 0 3 1 2 = plebDet4 e0 e1 e2 e3 := by
  dsimp only [plebPlanePair, plebDet4]
  ring

private theorem plebWedgePair_split (e0 e1 e2 e3 : Fin 4 → ℤ)
    (α₁ β₁ α₂ β₂ γ₁ δ₁ γ₂ δ₂ : Fin 4) (s₁ s₂ : ℤ) :
    let w (u v : Fin 4 → ℤ) (μ ν : Fin 4) : ℤ := u μ * v ν - u ν * v μ
    let f (u v : Fin 4 → ℤ) : ℤ := w u v α₁ β₁ + s₁ * w u v α₂ β₂
    let g (u v : Fin 4 → ℤ) : ℤ := w u v γ₁ δ₁ + s₂ * w u v γ₂ δ₂
    (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
    (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
    (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) =
    plebPlanePair e0 e1 e2 e3 α₁ β₁ γ₁ δ₁ +
    s₂ * plebPlanePair e0 e1 e2 e3 α₁ β₁ γ₂ δ₂ +
    s₁ * plebPlanePair e0 e1 e2 e3 α₂ β₂ γ₁ δ₁ +
    s₁ * s₂ * plebPlanePair e0 e1 e2 e3 α₂ β₂ γ₂ δ₂ := by
  dsimp only [plebPlanePair]
  ring

/-- Universal algebraic Plebanski 6-face exterior wedge identity for ANY 4-simplex
    `(0, e0, e1, e2, e3)` in `ℤ^4` (including arbitrary anisotropic flat stretches
    `x ↦ (λ_0 x^0, λ_1 x^1, λ_2 x^2, λ_3 x^3)`):
    - `P^{+,IJ} = +2 det(e0, e1, e2, e3) δ^{IJ}`,
    - `P^{-,IJ} = -2 det(e0, e1, e2, e3) δ^{IJ}`,
    - `P^{+-,IJ} = 0` identically. -/
theorem pleb_simplex_wedge_identities (e0 e1 e2 e3 : Fin 4 → ℤ) (I J : Fin 3) :
    plebWedgePair (plebSimplex6P e0 e1 e2 e3) (plebSimplex6P e0 e1 e2 e3) I J =
      (if I = J then 2 * plebDet4 e0 e1 e2 e3 else 0) ∧
    plebWedgePair (plebSimplex6M e0 e1 e2 e3) (plebSimplex6M e0 e1 e2 e3) I J =
      (if I = J then -(2 * plebDet4 e0 e1 e2 e3) else 0) ∧
    plebWedgePair (plebSimplex6P e0 e1 e2 e3) (plebSimplex6M e0 e1 e2 e3) I J = 0 := by
  have hP0 : plebSimplex6P e0 e1 e2 e3 0 = plebPairBivP e0 e1 := rfl
  have hP1 : plebSimplex6P e0 e1 e2 e3 1 = plebPairBivP e0 e2 := rfl
  have hP2 : plebSimplex6P e0 e1 e2 e3 2 = plebPairBivP e0 e3 := rfl
  have hP3 : plebSimplex6P e0 e1 e2 e3 3 = plebPairBivP e1 e2 := rfl
  have hP4 : plebSimplex6P e0 e1 e2 e3 4 = plebPairBivP e1 e3 := rfl
  have hP5 : plebSimplex6P e0 e1 e2 e3 5 = plebPairBivP e2 e3 := rfl
  have hM0 : plebSimplex6M e0 e1 e2 e3 0 = plebPairBivM e0 e1 := rfl
  have hM1 : plebSimplex6M e0 e1 e2 e3 1 = plebPairBivM e0 e2 := rfl
  have hM2 : plebSimplex6M e0 e1 e2 e3 2 = plebPairBivM e0 e3 := rfl
  have hM3 : plebSimplex6M e0 e1 e2 e3 3 = plebPairBivM e1 e2 := rfl
  have hM4 : plebSimplex6M e0 e1 e2 e3 4 = plebPairBivM e1 e3 := rfl
  have hM5 : plebSimplex6M e0 e1 e2 e3 5 = plebPairBivM e2 e3 := rfl
  have hZero : ∀ α β γ δ : Fin 4,
      (α = γ ∨ α = δ ∨ β = γ ∨ β = δ) → plebPlanePair e0 e1 e2 e3 α β γ δ = 0 := by
    intro α β γ δ h
    rcases h with rfl | rfl | rfl | rfl
    · exact plebPlanePair_share_first e0 e1 e2 e3 α β δ
    · rw [plebPlanePair_swap_right, plebPlanePair_share_first, neg_zero]
    · rw [plebPlanePair_swap_left, plebPlanePair_share_first, neg_zero]
    · rw [plebPlanePair_swap_left, plebPlanePair_swap_right, plebPlanePair_share_first,
        neg_zero, neg_zero]
  have h0123 := plebPlanePair_0123 e0 e1 e2 e3
  have h2301 : plebPlanePair e0 e1 e2 e3 2 3 0 1 = plebDet4 e0 e1 e2 e3 := by
    rw [plebPlanePair_symm, h0123]
  have h0213 : plebPlanePair e0 e1 e2 e3 0 2 1 3 = -plebDet4 e0 e1 e2 e3 := by
    rw [plebPlanePair_swap_right, plebPlanePair_0231]
  have h1302 : plebPlanePair e0 e1 e2 e3 1 3 0 2 = -plebDet4 e0 e1 e2 e3 := by
    rw [plebPlanePair_symm, h0213]
  have h0312 := plebPlanePair_0312 e0 e1 e2 e3
  have h1203 : plebPlanePair e0 e1 e2 e3 1 2 0 3 = plebDet4 e0 e1 e2 e3 := by
    rw [plebPlanePair_symm, h0312]
  have h00 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 1 - u 1 * v 0) + s₁ * (u 2 * v 3 - u 3 * v 2)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 1 - u 1 * v 0) + s₂ * (u 2 * v 3 - u 3 * v 2)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = (s₁ + s₂) * plebDet4 e0 e1 e2 e3 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 1 2 3 0 1 2 3 s₁ s₂).trans ?_
    rw [hZero 0 1 0 1 (Or.inl rfl), hZero 2 3 2 3 (Or.inl rfl), h0123, h2301]
    ring
  have h11 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 2 - u 2 * v 0) + s₁ * (u 1 * v 3 - u 3 * v 1)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 2 - u 2 * v 0) + s₂ * (u 1 * v 3 - u 3 * v 1)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = -(s₁ + s₂) * plebDet4 e0 e1 e2 e3 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 2 1 3 0 2 1 3 s₁ s₂).trans ?_
    rw [hZero 0 2 0 2 (Or.inl rfl), hZero 1 3 1 3 (Or.inl rfl), h0213, h1302]
    ring
  have h22 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 3 - u 3 * v 0) + s₁ * (u 1 * v 2 - u 2 * v 1)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 3 - u 3 * v 0) + s₂ * (u 1 * v 2 - u 2 * v 1)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = (s₁ + s₂) * plebDet4 e0 e1 e2 e3 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 3 1 2 0 3 1 2 s₁ s₂).trans ?_
    rw [hZero 0 3 0 3 (Or.inl rfl), hZero 1 2 1 2 (Or.inl rfl), h0312, h1203]
    ring
  have h01 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 1 - u 1 * v 0) + s₁ * (u 2 * v 3 - u 3 * v 2)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 2 - u 2 * v 0) + s₂ * (u 1 * v 3 - u 3 * v 1)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = 0 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 1 2 3 0 2 1 3 s₁ s₂).trans ?_
    rw [hZero 0 1 0 2 (Or.inl rfl), hZero 0 1 1 3 (Or.inr (Or.inr (Or.inl rfl))),
      hZero 2 3 0 2 (Or.inr (Or.inl rfl)), hZero 2 3 1 3 (Or.inr (Or.inr (Or.inr rfl)))]
    ring
  have h02 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 1 - u 1 * v 0) + s₁ * (u 2 * v 3 - u 3 * v 2)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 3 - u 3 * v 0) + s₂ * (u 1 * v 2 - u 2 * v 1)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = 0 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 1 2 3 0 3 1 2 s₁ s₂).trans ?_
    rw [hZero 0 1 0 3 (Or.inl rfl), hZero 0 1 1 2 (Or.inr (Or.inr (Or.inl rfl))),
      hZero 2 3 0 3 (Or.inr (Or.inr (Or.inr rfl))), hZero 2 3 1 2 (Or.inr (Or.inl rfl))]
    ring
  have h12 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 2 - u 2 * v 0) + s₁ * (u 1 * v 3 - u 3 * v 1)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 3 - u 3 * v 0) + s₂ * (u 1 * v 2 - u 2 * v 1)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = 0 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 2 1 3 0 3 1 2 s₁ s₂).trans ?_
    rw [hZero 0 2 0 3 (Or.inl rfl), hZero 0 2 1 2 (Or.inr (Or.inr (Or.inr rfl))),
      hZero 1 3 0 3 (Or.inr (Or.inr (Or.inr rfl))), hZero 1 3 1 2 (Or.inl rfl)]
    ring
  have h10 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 2 - u 2 * v 0) + s₁ * (u 1 * v 3 - u 3 * v 1)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 1 - u 1 * v 0) + s₂ * (u 2 * v 3 - u 3 * v 2)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = 0 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 2 1 3 0 1 2 3 s₁ s₂).trans ?_
    rw [hZero 0 2 0 1 (Or.inl rfl), hZero 0 2 2 3 (Or.inr (Or.inr (Or.inl rfl))),
      hZero 1 3 0 1 (Or.inr (Or.inl rfl)), hZero 1 3 2 3 (Or.inr (Or.inr (Or.inr rfl)))]
    ring
  have h20 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 3 - u 3 * v 0) + s₁ * (u 1 * v 2 - u 2 * v 1)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 1 - u 1 * v 0) + s₂ * (u 2 * v 3 - u 3 * v 2)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = 0 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 3 1 2 0 1 2 3 s₁ s₂).trans ?_
    rw [hZero 0 3 0 1 (Or.inl rfl), hZero 0 3 2 3 (Or.inr (Or.inr (Or.inr rfl))),
      hZero 1 2 0 1 (Or.inr (Or.inl rfl)), hZero 1 2 2 3 (Or.inr (Or.inr (Or.inl rfl)))]
    ring
  have h21 : ∀ s₁ s₂ : ℤ,
      let f (u v : Fin 4 → ℤ) := (u 0 * v 3 - u 3 * v 0) + s₁ * (u 1 * v 2 - u 2 * v 1)
      let g (u v : Fin 4 → ℤ) := (u 0 * v 2 - u 2 * v 0) + s₂ * (u 1 * v 3 - u 3 * v 1)
      (f e0 e1 * g e2 e3 + f e2 e3 * g e0 e1) -
      (f e0 e2 * g e1 e3 + f e1 e3 * g e0 e2) +
      (f e0 e3 * g e1 e2 + f e1 e2 * g e0 e3) = 0 := by
    intro s₁ s₂
    refine (plebWedgePair_split e0 e1 e2 e3 0 3 1 2 0 2 1 3 s₁ s₂).trans ?_
    rw [hZero 0 3 0 2 (Or.inl rfl), hZero 0 3 1 3 (Or.inr (Or.inr (Or.inr rfl))),
      hZero 1 2 0 2 (Or.inr (Or.inr (Or.inr rfl))), hZero 1 2 1 3 (Or.inl rfl)]
    ring
  simp only [plebWedgePair, hP0, hP1, hP2, hP3, hP4, hP5, hM0, hM1, hM2, hM3, hM4, hM5]
  fin_cases I <;> fin_cases J <;>
    dsimp only [plebPairBivP, plebPairBivM]
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h00 1 1
    · simpa [sub_eq_add_neg] using h00 (-1) (-1)
    · simpa [sub_eq_add_neg] using h00 1 (-1)
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h01 1 (-1)
    · simpa [sub_eq_add_neg] using h01 (-1) 1
    · simpa [sub_eq_add_neg] using h01 1 1
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h02 1 1
    · simpa [sub_eq_add_neg] using h02 (-1) (-1)
    · simpa [sub_eq_add_neg] using h02 1 (-1)
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h10 (-1) 1
    · simpa [sub_eq_add_neg] using h10 1 (-1)
    · simpa [sub_eq_add_neg] using h10 (-1) (-1)
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h11 (-1) (-1)
    · simpa [sub_eq_add_neg] using h11 1 1
    · simpa [sub_eq_add_neg] using h11 (-1) 1
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h12 (-1) 1
    · simpa [sub_eq_add_neg] using h12 1 (-1)
    · simpa [sub_eq_add_neg] using h12 (-1) (-1)
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h20 1 1
    · simpa [sub_eq_add_neg] using h20 (-1) (-1)
    · simpa [sub_eq_add_neg] using h20 1 (-1)
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h21 1 (-1)
    · simpa [sub_eq_add_neg] using h21 (-1) 1
    · simpa [sub_eq_add_neg] using h21 1 1
  · refine ⟨?_, ?_, ?_⟩
    · simpa [sub_eq_add_neg] using h22 1 1
    · simpa [sub_eq_add_neg] using h22 (-1) (-1)
    · simpa [sub_eq_add_neg] using h22 1 (-1)

private theorem pleb_mem_triListFrom {vs : List (Fin 24)} {p : Fin 24 × Fin 24 × Fin 24} :
    p ∈ plebTriListFrom vs ↔
      p.1 ∈ vs ∧ p.2.1 ∈ vs ∧ p.2.2 ∈ vs ∧
      p.1 < p.2.1 ∧ p.2.1 < p.2.2 ∧
      mlDot4 (mlD4Root p.1) (mlD4Root p.2.1) = 1 ∧
      mlDot4 (mlD4Root p.1) (mlD4Root p.2.2) = 1 ∧
      mlDot4 (mlD4Root p.2.1) (mlD4Root p.2.2) = 1 := by
  rcases p with ⟨i, j, k⟩
  simp only [plebTriListFrom, List.mem_flatMap, List.mem_filter, List.mem_map, decide_eq_true_eq]
  constructor
  · rintro ⟨a, ha, b, ⟨hb, hab, hdotab⟩, c, ⟨hc, hbc, hdotac, hdotbc⟩, hEq⟩
    cases hEq
    exact ⟨ha, hb, hc, hab, hbc, hdotab, hdotac, hdotbc⟩
  · rintro ⟨hi, hj, hk, hij, hjk, hdij, hdik, hdjk⟩
    exact ⟨i, hi, j, ⟨hj, hij, hdij⟩, k, ⟨hk, hjk, hdik, hdjk⟩, rfl⟩

private theorem pleb_nodup_triListFrom {vs : List (Fin 24)} (hvs : vs.Nodup) :
    (plebTriListFrom vs).Nodup := by
  unfold plebTriListFrom
  refine List.nodup_flatMap.mpr ⟨?_, ?_⟩
  · intro i _
    refine List.nodup_flatMap.mpr ⟨?_, ?_⟩
    · intro j _
      exact (hvs.filter _).map fun k₁ k₂ h => by injection h with _ h'; injection h'
    · refine (hvs.filter _).pairwise_of_forall_ne fun j₁ _ j₂ _ hne => ?_
      intro x hx₁ hx₂
      simp only [List.mem_map] at hx₁ hx₂
      rcases hx₁ with ⟨_, _, rfl⟩
      rcases hx₂ with ⟨_, _, hEq⟩
      injection hEq with _ hEq'
      injection hEq' with hJ _
      exact hne hJ.symm
  · refine hvs.pairwise_of_forall_ne fun i₁ _ i₂ _ hne => ?_
    intro x hx₁ hx₂
    simp only [List.mem_flatMap, List.mem_map] at hx₁ hx₂
    rcases hx₁ with ⟨_, _, _, _, rfl⟩
    rcases hx₂ with ⟨_, _, _, _, hEq⟩
    injection hEq with hI _
    exact hne hI.symm

/-- Headline 3: Exact 24-Cell Plebanski BF Geometry & True 192-Simplex Wedge-Pairing Theorem.
    Proves all six exact discrete-gravity invariants over `ℤ` using `mlD4Root` / `mlDot4`:
    (1) Exact `f`-vector (`96` equilateral triangles matching the full `D_4` root predicate,
        `24` octahedral facets with `6` vertices and `8` triangles each, `672` intra-facet pairs),
    (2) Exact diagonal simplicity (`96/96` triangles & `192/192` oriented facet-triangles:
        `‖B^+‖^2 = ‖B^-‖^2 > 0`),
    (3) Exact cross-simplicity (`24 × C(8, 2) = 672` unordered / `1536` ordered intra-facet pairs:
        `B_f^+ · B_{f'}^+ = B_f^- · B_{f'}^-`),
    (4) Exact octahedral Gauss closure (`24/24` facets: `∑ B^+ = 0` and `∑ B^- = 0`),
    (5) True oriented 192-simplex 6-face exterior opposite-face Plebanski wedge pairing:
        - Per-simplex exactness on ALL 192 simplices (`plebSimplexPP = +4 δ^{IJ}`,
          `plebSimplexMM = -4 δ^{IJ}`, `plebSimplexPM = 0` identically on every simplex),
        - Integrated 24-cell Plebanski tensors (`plebTensorPP = +4·192 δ^{IJ} = +768 δ^{IJ}`,
          `plebTensorMM = -4·192 δ^{IJ} = -768 δ^{IJ}`, `plebTensorPM = 0`),
        - Exact 4-volume `V_24 = 8` from `Tr(P^+) - Tr(P^-) = 8 · (3 · 192)` and from the 192
          oriented radial 4-simplex determinants `∑ det = 8 · 48`,
    (6) Unconstrained BF negative control (`5:4` deformation): preserves exact Gauss closure on
        all `24` facets while strictly breaking BOTH diagonal simplicity AND traceless Plebanski
        symmetry (`3 * plebTensorPPDef 0 0 ≠ ∑ I, plebTensorPPDef I I` and
        `plebTensorPPDef 0 0 ≠ plebTensorPPDef 1 1`). -/
theorem thm_plebanski_24cell_simplicity_and_closure :
    (plebD4Tris.card = 96 ∧
      (∀ p : Fin 24 × Fin 24 × Fin 24, p ∈ plebD4Tris ↔
        p.1 < p.2.1 ∧ p.2.1 < p.2.2 ∧
        mlDot4 (mlD4Root p.1) (mlD4Root p.2.1) = 1 ∧
        mlDot4 (mlD4Root p.1) (mlD4Root p.2.2) = 1 ∧
        mlDot4 (mlD4Root p.2.1) (mlD4Root p.2.2) = 1) ∧
      (∀ c : Fin 24, (plebFacetVerts c).card = 6 ∧ (plebFacetTris c).card = 8) ∧
      (∀ c : Fin 24, ∀ t : Fin 24 × Fin 24 × Fin 24, t ∈ plebFacetTris c ↔
        t ∈ plebD4Tris ∧ t.1 ∈ plebFacetVerts c ∧ t.2.1 ∈ plebFacetVerts c ∧ t.2.2 ∈ plebFacetVerts c) ∧
      (∑ c : Fin 24, (plebFacetTris c).card * ((plebFacetTris c).card - 1) / 2) = 672) ∧
    ((∀ t ∈ plebD4Tris,
        plebDot3 (plebTriBivP t) (plebTriBivP t) = plebDot3 (plebTriBivM t) (plebTriBivM t) ∧
        0 < plebDot3 (plebTriBivP t) (plebTriBivP t)) ∧
      (∀ c : Fin 24, ∀ t ∈ plebFacetTris c,
        plebDot3 (plebBivP c t) (plebBivP c t) = plebDot3 (plebBivM c t) (plebBivM c t) ∧
        0 < plebDot3 (plebBivP c t) (plebBivP c t))) ∧
    (∀ c : Fin 24, ∀ t ∈ plebFacetTris c, ∀ t' ∈ plebFacetTris c,
      plebDot3 (plebBivP c t) (plebBivP c t') = plebDot3 (plebBivM c t) (plebBivM c t')) ∧
    (∀ c : Fin 24, ∀ I : Fin 3,
      (∑ t ∈ plebFacetTris c, plebBivP c t I) = 0 ∧
      (∑ t ∈ plebFacetTris c, plebBivM c t I) = 0) ∧
    ((∀ c : Fin 24, ∀ t ∈ plebFacetTris c, ∀ I J : Fin 3,
        plebSimplexPP c t I J = (if I = J then 4 else 0) ∧
        plebSimplexMM c t I J = (if I = J then -4 else 0) ∧
        plebSimplexPM c t I J = 0) ∧
      (∀ I J : Fin 3, plebTensorPP I J = if I = J then 4 * 192 else 0) ∧
      (∀ I J : Fin 3, plebTensorMM I J = if I = J then -(4 * 192) else 0) ∧
      (∀ I J : Fin 3, plebTensorPM I J = 0) ∧
      ((∑ I : Fin 3, plebTensorPP I I) - (∑ I : Fin 3, plebTensorMM I I) = 8 * (3 * 192)) ∧
      ((∑ c : Fin 24, ∑ t ∈ plebFacetTris c,
        plebDet4 (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t)) =
        8 * 48)) ∧
    ((∀ c : Fin 24, ∀ I : Fin 3,
        (∑ t ∈ plebFacetTris c, plebBivPDef c t I) = 0 ∧
        (∑ t ∈ plebFacetTris c, plebBivMDef c t I) = 0) ∧
      (∃ c : Fin 24, ∃ t ∈ plebFacetTris c,
        plebDot3 (plebBivPDef c t) (plebBivPDef c t) ≠ plebDot3 (plebBivMDef c t) (plebBivMDef c t)) ∧
      (plebTensorPPDef 0 0 ≠ plebTensorPPDef 1 1 ∧
        3 * plebTensorPPDef 0 0 ≠ ∑ I : Fin 3, plebTensorPPDef I I)) := by
  have hNodupTris : plebTriList.Nodup := pleb_nodup_triListFrom (List.nodup_finRange 24)
  have hNodupVerts : ∀ c : Fin 24, (plebFacetVertList c).Nodup :=
    fun c => (List.nodup_finRange 24).filter _
  have hNodupFTris : ∀ c : Fin 24, (plebFacetTriList c).Nodup :=
    fun c => pleb_nodup_triListFrom (hNodupVerts c)
  have hTriCard : plebD4Tris.card = 96 := by
    rw [plebD4Tris, List.toFinset_card_of_nodup hNodupTris]
    decide
  have hTriMem : ∀ p : Fin 24 × Fin 24 × Fin 24, p ∈ plebD4Tris ↔
      p.1 < p.2.1 ∧ p.2.1 < p.2.2 ∧
      mlDot4 (mlD4Root p.1) (mlD4Root p.2.1) = 1 ∧
      mlDot4 (mlD4Root p.1) (mlD4Root p.2.2) = 1 ∧
      mlDot4 (mlD4Root p.2.1) (mlD4Root p.2.2) = 1 := by
    intro p
    rw [plebD4Tris, List.mem_toFinset, plebTriList, pleb_mem_triListFrom]
    simp [List.mem_finRange]
  have hFacetCards : ∀ c : Fin 24, (plebFacetVerts c).card = 6 ∧ (plebFacetTris c).card = 8 := by
    have hV : ∀ c : Fin 24, (plebFacetVertList c).length = 6 := by decide
    have hT : ∀ c : Fin 24, (plebFacetTriList c).length = 8 := by decide
    intro c
    rw [plebFacetVerts, List.toFinset_card_of_nodup (hNodupVerts c),
      plebFacetTris, List.toFinset_card_of_nodup (hNodupFTris c)]
    exact ⟨hV c, hT c⟩
  have hFacetMem : ∀ c : Fin 24, ∀ t : Fin 24 × Fin 24 × Fin 24, t ∈ plebFacetTris c ↔
      t ∈ plebD4Tris ∧ t.1 ∈ plebFacetVerts c ∧ t.2.1 ∈ plebFacetVerts c ∧ t.2.2 ∈ plebFacetVerts c := by
    intro c t
    rw [plebFacetTris, List.mem_toFinset, plebFacetTriList, pleb_mem_triListFrom,
      hTriMem, plebFacetVerts, List.mem_toFinset, List.mem_toFinset, List.mem_toFinset]
    exact ⟨fun ⟨h1, h2, h3, hRest⟩ => ⟨hRest, h1, h2, h3⟩,
      fun ⟨hRest, h1, h2, h3⟩ => ⟨h1, h2, h3, hRest⟩⟩
  have hPairs672 : (∑ c : Fin 24, (plebFacetTris c).card * ((plebFacetTris c).card - 1) / 2) = 672 := by
    have hEq : ∀ c : Fin 24, (plebFacetTris c).card * ((plebFacetTris c).card - 1) / 2 = 28 := by
      intro c
      rw [(hFacetCards c).2]
    simp only [hEq, Finset.sum_const, Finset.card_univ, Fintype.card_fin, smul_eq_mul]
  have hDiagAll : ∀ t ∈ plebD4Tris,
      plebDot3 (plebTriBivP t) (plebTriBivP t) = plebDot3 (plebTriBivM t) (plebTriBivM t) ∧
      0 < plebDot3 (plebTriBivP t) (plebTriBivP t) := by
    have hCheck : plebTriList.all (fun t =>
        decide (plebDot3 (plebTriBivP t) (plebTriBivP t) = plebDot3 (plebTriBivM t) (plebTriBivM t) ∧
          0 < plebDot3 (plebTriBivP t) (plebTriBivP t))) = true := by
      decide
    intro t ht
    rw [plebD4Tris, List.mem_toFinset] at ht
    exact of_decide_eq_true (List.all_eq_true.mp hCheck t ht)
  have hDiagFacet : ∀ c : Fin 24, ∀ t ∈ plebFacetTris c,
      plebDot3 (plebBivP c t) (plebBivP c t) = plebDot3 (plebBivM c t) (plebBivM c t) ∧
      0 < plebDot3 (plebBivP c t) (plebBivP c t) := by
    have hCheck : (List.finRange 24).all (fun c =>
        (plebFacetTriList c).all (fun t =>
          decide (plebDot3 (plebBivP c t) (plebBivP c t) = plebDot3 (plebBivM c t) (plebBivM c t) ∧
            0 < plebDot3 (plebBivP c t) (plebBivP c t)))) = true := by
      decide
    intro c t ht
    rw [plebFacetTris, List.mem_toFinset] at ht
    have hc := List.all_eq_true.mp hCheck c (List.mem_finRange c)
    exact of_decide_eq_true (List.all_eq_true.mp hc t ht)
  have hCross : ∀ c : Fin 24, ∀ t ∈ plebFacetTris c, ∀ t' ∈ plebFacetTris c,
      plebDot3 (plebBivP c t) (plebBivP c t') = plebDot3 (plebBivM c t) (plebBivM c t') := by
    have hCheck : (List.finRange 24).all (fun c =>
        (plebFacetTriList c).all (fun t =>
          (plebFacetTriList c).all (fun t' =>
            decide (plebDot3 (plebBivP c t) (plebBivP c t') =
              plebDot3 (plebBivM c t) (plebBivM c t'))))) = true := by
      decide
    intro c t ht t' ht'
    rw [plebFacetTris, List.mem_toFinset] at ht ht'
    have hc := List.all_eq_true.mp hCheck c (List.mem_finRange c)
    have h1 := List.all_eq_true.mp hc t ht
    exact of_decide_eq_true (List.all_eq_true.mp h1 t' ht')
  have hClosure : ∀ c : Fin 24, ∀ I : Fin 3,
      (∑ t ∈ plebFacetTris c, plebBivP c t I) = 0 ∧
      (∑ t ∈ plebFacetTris c, plebBivM c t I) = 0 := by
    have hCheckP : ∀ c : Fin 24, ∀ I : Fin 3,
        ((plebFacetTriList c).map fun t => plebBivP c t I).sum = 0 := by
      decide
    have hCheckM : ∀ c : Fin 24, ∀ I : Fin 3,
        ((plebFacetTriList c).map fun t => plebBivM c t I).sum = 0 := by
      decide
    intro c I
    rw [plebFacetTris, List.sum_toFinset _ (hNodupFTris c), List.sum_toFinset _ (hNodupFTris c)]
    exact ⟨hCheckP c I, hCheckM c I⟩
  have hSimpDet2 : ∀ c : Fin 24, ∀ t ∈ plebFacetTris c,
      plebDet4 (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t) = 2 := by
    have hCheck : (List.finRange 24).all (fun c =>
        (plebFacetTriList c).all (fun t =>
          decide (plebDet4 (plebFacetNormal c) (mlD4Root t.1)
            (plebSimplexV1 c t) (plebSimplexV2 c t) = 2))) = true := by
      decide
    intro c t ht
    rw [plebFacetTris, List.mem_toFinset] at ht
    have hc := List.all_eq_true.mp hCheck c (List.mem_finRange c)
    exact of_decide_eq_true (List.all_eq_true.mp hc t ht)
  have hPerSimplex : ∀ c : Fin 24, ∀ t ∈ plebFacetTris c, ∀ I J : Fin 3,
      plebSimplexPP c t I J = (if I = J then 4 else 0) ∧
      plebSimplexMM c t I J = (if I = J then -4 else 0) ∧
      plebSimplexPM c t I J = 0 := by
    intro c t ht I J
    have hDet := hSimpDet2 c t ht
    have hId := pleb_simplex_wedge_identities (plebFacetNormal c) (mlD4Root t.1)
      (plebSimplexV1 c t) (plebSimplexV2 c t) I J
    rcases hId with ⟨hPP, hMM, hPM⟩
    simp only [plebSimplexPP, plebSimplexMM, plebSimplexPM, hPP, hMM, hPM, hDet]
    exact ⟨by split_ifs <;> norm_num, by split_ifs <;> norm_num, trivial⟩
  have hPlebPP : ∀ I J : Fin 3, plebTensorPP I J = if I = J then 4 * 192 else 0 := by
    intro I J
    simp only [plebTensorPP, Matrix.of_apply]
    have hFacet : ∀ c : Fin 24,
        (∑ t ∈ plebFacetTris c, plebSimplexPP c t I J) = if I = J then 32 else 0 := by
      intro c
      have hSum : (∑ t ∈ plebFacetTris c, plebSimplexPP c t I J) =
          ∑ _t ∈ plebFacetTris c, (if I = J then (4 : ℤ) else 0) :=
        Finset.sum_congr rfl fun t ht => (hPerSimplex c t ht I J).1
      rw [hSum, Finset.sum_const, (hFacetCards c).2]
      split_ifs <;> decide
    simp only [hFacet, Finset.sum_const, Finset.card_univ, Fintype.card_fin]
    split_ifs <;> decide
  have hPlebMM : ∀ I J : Fin 3, plebTensorMM I J = if I = J then -(4 * 192) else 0 := by
    intro I J
    simp only [plebTensorMM, Matrix.of_apply]
    have hFacet : ∀ c : Fin 24,
        (∑ t ∈ plebFacetTris c, plebSimplexMM c t I J) = if I = J then -32 else 0 := by
      intro c
      have hSum : (∑ t ∈ plebFacetTris c, plebSimplexMM c t I J) =
          ∑ _t ∈ plebFacetTris c, (if I = J then (-4 : ℤ) else 0) :=
        Finset.sum_congr rfl fun t ht => (hPerSimplex c t ht I J).2.1
      rw [hSum, Finset.sum_const, (hFacetCards c).2]
      split_ifs <;> decide
    simp only [hFacet, Finset.sum_const, Finset.card_univ, Fintype.card_fin]
    split_ifs <;> decide
  have hPlebPM : ∀ I J : Fin 3, plebTensorPM I J = 0 := by
    intro I J
    simp only [plebTensorPM, Matrix.of_apply]
    have hFacet : ∀ c : Fin 24, (∑ t ∈ plebFacetTris c, plebSimplexPM c t I J) = 0 := by
      intro c
      exact Finset.sum_eq_zero fun t ht => (hPerSimplex c t ht I J).2.2
    simp only [hFacet, Finset.sum_const_zero]
  have hVolTr : (∑ I : Fin 3, plebTensorPP I I) - (∑ I : Fin 3, plebTensorMM I I) = 8 * (3 * 192) := by
    simp only [Fin.sum_univ_three, hPlebPP, hPlebMM, ↓reduceIte]
    norm_num
  have hVolDet :
      (∑ c : Fin 24, ∑ t ∈ plebFacetTris c,
        plebDet4 (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t)) =
      8 * 48 := by
    have hFacet : ∀ c : Fin 24,
        (∑ t ∈ plebFacetTris c,
          plebDet4 (plebFacetNormal c) (mlD4Root t.1) (plebSimplexV1 c t) (plebSimplexV2 c t)) = 16 := by
      intro c
      have hSum := Finset.sum_congr rfl fun t ht => hSimpDet2 c t ht
      rw [hSum, Finset.sum_const, (hFacetCards c).2]
      decide
    simp only [hFacet, Finset.sum_const, Finset.card_univ, Fintype.card_fin]
    decide
  have hDefClosure : ∀ c : Fin 24, ∀ I : Fin 3,
      (∑ t ∈ plebFacetTris c, plebBivPDef c t I) = 0 ∧
      (∑ t ∈ plebFacetTris c, plebBivMDef c t I) = 0 := by
    intro c I
    rcases hClosure c I with ⟨hP, hM⟩
    constructor
    · by_cases hI : I = 0
      · subst hI
        simp only [plebBivPDef, plebDeformP, ↓reduceIte, ← Finset.mul_sum, hP, mul_zero]
      · simp only [plebBivPDef, plebDeformP, hI, ↓reduceIte, ← Finset.mul_sum, hP, mul_zero]
    · simp only [plebBivMDef, ← Finset.mul_sum, hM, mul_zero]
  have hDefBreak : ∃ c : Fin 24, ∃ t ∈ plebFacetTris c,
      plebDot3 (plebBivPDef c t) (plebBivPDef c t) ≠ plebDot3 (plebBivMDef c t) (plebBivMDef c t) := by
    refine ⟨0, (0, 4, 8), ?_, ?_⟩
    · rw [plebFacetTris, List.mem_toFinset]
      decide
    · decide
  have hDefScaleDiag : ∀ I : Fin 3,
      plebTensorPPDef I I = (if I = 0 then 25 else 16) * plebTensorPP I I := by
    intro I
    simp only [plebTensorPPDef, plebTensorPP, Matrix.of_apply, plebSimplexPP, plebWedgePair,
      plebDeformP]
    by_cases hI : I = 0
    · subst hI
      simp only [↓reduceIte, Finset.mul_sum]
      refine Finset.sum_congr rfl fun c _ => Finset.sum_congr rfl fun t _ => ?_
      ring
    · simp only [hI, ↓reduceIte, Finset.mul_sum]
      refine Finset.sum_congr rfl fun c _ => Finset.sum_congr rfl fun t _ => ?_
      ring
  have hDefTraceless : plebTensorPPDef 0 0 ≠ plebTensorPPDef 1 1 ∧
      3 * plebTensorPPDef 0 0 ≠ ∑ I : Fin 3, plebTensorPPDef I I := by
    simp only [Fin.sum_univ_three, hDefScaleDiag, hPlebPP, ↓reduceIte, Fin.reduceEq]
    norm_num
  exact ⟨⟨hTriCard, hTriMem, hFacetCards, hFacetMem, hPairs672⟩,
    ⟨hDiagAll, hDiagFacet⟩, hCross, hClosure,
    ⟨hPerSimplex, hPlebPP, hPlebMM, hPlebPM, hVolTr, hVolDet⟩,
    ⟨hDefClosure, hDefBreak, hDefTraceless⟩⟩

/-! ### 4. Exact Real-Calculus NEC Monotonicity & Causal Entanglement Velocity Bound -/

/-- Near-horizon blackening function `f(z) = 1 - z^2 + a₀ z^2 log z + a₁ (z^3 - z^2)`. -/
noncomputable def necMetricF (a₀ a₁ z : ℝ) : ℝ :=
  1 - z ^ 2 + a₀ * z ^ 2 * Real.log z + a₁ * (z ^ 3 - z ^ 2)

/-- Explicit first derivative `f'(z) = -2 z + a₀ (2 z log z + z) + a₁ (3 z^2 - 2 z)`. -/
noncomputable def necMetricFp (a₀ a₁ z : ℝ) : ℝ :=
  -2 * z + a₀ * (2 * z * Real.log z + z) + a₁ * (3 * z ^ 2 - 2 * z)

/-- Explicit second derivative `f''(z) = -2 + a₀ (2 log z + 3) + a₁ (6 z - 2)`. -/
noncomputable def necMetricFpp (a₀ a₁ z : ℝ) : ℝ :=
  -2 + a₀ * (2 * Real.log z + 3) + a₁ * (6 * z - 2)

/-- Headline 4: Exact Continuous Real-Calculus NEC Monotonicity & Causal Velocity Bound Theorem.
    For all `a₀ a₁ : ℝ`:
    (1) `HasDerivAt (necMetricF a₀ a₁) (necMetricFp a₀ a₁ z) z` for all `z > 0`,
    (2) `HasDerivAt (necMetricFp a₀ a₁) (necMetricFpp a₀ a₁ z) z` for all `z > 0`,
    (3) Exact quotient-rule NEC derivative
        `HasDerivAt (fun t => necMetricFp a₀ a₁ t / t) ((z * necMetricFpp a₀ a₁ z - necMetricFp a₀ a₁ z) / z^2) z`,
    (4) Exact NEC identity `z f''(z) - f'(z) = 2 a₀ z + 3 a₁ z^2` and NEC nonnegativity under
        `a₀ ≥ 0, a₁ ≥ 0`,
    (5) Monotonicity of `q(z) = f'(z) / z` on `(0, ∞)` under `a₀ ≥ 0, a₁ ≥ 0`,
    (6) Horizon values `f(1) = 0`, `f'(1) = -2 + a₀ + a₁`, and exterior sub-BTZ blackening bound
        `f(z) ≤ 1 - z^2` for all `z ∈ (0, 1]` under `a₀ ≥ 0, a₁ ≥ 0`,
    (7) Interior `z ≥ 1` Hartman-Maldacena causal entanglement velocity bound:
        `1 - z^2 ≤ f(z)` and `v_E^2(z) = -f(z) / z^2 ≤ 1 - 1 / z^2 < 1`. -/
theorem thm_nec_monotone_velocity_bound (a₀ a₁ : ℝ) :
    (∀ z : ℝ, 0 < z → HasDerivAt (necMetricF a₀ a₁) (necMetricFp a₀ a₁ z) z) ∧
    (∀ z : ℝ, 0 < z → HasDerivAt (necMetricFp a₀ a₁) (necMetricFpp a₀ a₁ z) z) ∧
    (∀ z : ℝ, 0 < z →
      HasDerivAt (fun t => necMetricFp a₀ a₁ t / t)
        ((z * necMetricFpp a₀ a₁ z - necMetricFp a₀ a₁ z) / z ^ 2) z) ∧
    (∀ z : ℝ, 0 < z →
      z * necMetricFpp a₀ a₁ z - necMetricFp a₀ a₁ z = 2 * a₀ * z + 3 * a₁ * z ^ 2) ∧
    (0 ≤ a₀ → 0 ≤ a₁ → ∀ z : ℝ, 0 < z →
      0 ≤ z * necMetricFpp a₀ a₁ z - necMetricFp a₀ a₁ z) ∧
    (0 ≤ a₀ → 0 ≤ a₁ → ∀ z₁ z₂ : ℝ, 0 < z₁ → z₁ ≤ z₂ →
      necMetricFp a₀ a₁ z₁ / z₁ ≤ necMetricFp a₀ a₁ z₂ / z₂) ∧
    (necMetricF a₀ a₁ 1 = 0 ∧
      necMetricFp a₀ a₁ 1 = -2 + a₀ + a₁ ∧
      (0 ≤ a₀ → 0 ≤ a₁ → ∀ z : ℝ, 0 < z → z ≤ 1 →
        necMetricF a₀ a₁ z ≤ 1 - z ^ 2)) ∧
    (0 ≤ a₀ → 0 ≤ a₁ → ∀ z : ℝ, 1 ≤ z →
      1 - z ^ 2 ≤ necMetricF a₀ a₁ z ∧
      -necMetricF a₀ a₁ z / z ^ 2 ≤ 1 - 1 / z ^ 2 ∧
      -necMetricF a₀ a₁ z / z ^ 2 < 1) := by
  have hDerivF : ∀ z : ℝ, 0 < z → HasDerivAt (necMetricF a₀ a₁) (necMetricFp a₀ a₁ z) z := by
    intro z hz
    have hzNe : z ≠ 0 := ne_of_gt hz
    have h1 : HasDerivAt (fun t : ℝ => 1 - t ^ 2) (0 - (2 : ℕ) * z ^ (2 - 1)) z :=
      (hasDerivAt_const z (1 : ℝ)).sub (hasDerivAt_pow 2 z)
    have h2 : HasDerivAt (fun t : ℝ => a₀ * t ^ 2 * Real.log t)
        ((a₀ * ((2 : ℕ) * z ^ (2 - 1))) * Real.log z + (a₀ * z ^ 2) * z⁻¹) z :=
      ((hasDerivAt_pow 2 z).const_mul a₀).mul (Real.hasDerivAt_log hzNe)
    have h3 : HasDerivAt (fun t : ℝ => a₁ * (t ^ 3 - t ^ 2))
        (a₁ * ((3 : ℕ) * z ^ (3 - 1) - (2 : ℕ) * z ^ (2 - 1))) z :=
      ((hasDerivAt_pow 3 z).sub (hasDerivAt_pow 2 z)).const_mul a₁
    have hAll := (h1.add h2).add h3
    refine hAll.congr_deriv ?_
    simp only [necMetricFp, Nat.cast_ofNat, Nat.reduceSub, pow_one]
    field_simp [hzNe]
    ring
  have hDerivFp : ∀ z : ℝ, 0 < z → HasDerivAt (necMetricFp a₀ a₁) (necMetricFpp a₀ a₁ z) z := by
    intro z hz
    have hzNe : z ≠ 0 := ne_of_gt hz
    have h1 : HasDerivAt (fun t : ℝ => -2 * t) (-2 * 1) z :=
      (hasDerivAt_id z).const_mul (-2)
    have hLogTerm : HasDerivAt (fun t : ℝ => 2 * t * Real.log t)
        ((2 * 1) * Real.log z + (2 * z) * z⁻¹) z :=
      ((hasDerivAt_id z).const_mul 2).mul (Real.hasDerivAt_log hzNe)
    have h2 : HasDerivAt (fun t : ℝ => a₀ * (2 * t * Real.log t + t))
        (a₀ * (((2 * 1) * Real.log z + (2 * z) * z⁻¹) + 1)) z :=
      (hLogTerm.add (hasDerivAt_id z)).const_mul a₀
    have h3 : HasDerivAt (fun t : ℝ => a₁ * (3 * t ^ 2 - 2 * t))
        (a₁ * (3 * ((2 : ℕ) * z ^ (2 - 1)) - 2 * 1)) z :=
      (((hasDerivAt_pow 2 z).const_mul 3).sub ((hasDerivAt_id z).const_mul 2)).const_mul a₁
    have hAll := (h1.add h2).add h3
    refine hAll.congr_deriv ?_
    simp only [necMetricFpp, Nat.cast_ofNat, Nat.reduceSub, pow_one]
    field_simp [hzNe]
    ring
  have hDerivQ : ∀ z : ℝ, 0 < z →
      HasDerivAt (fun t => necMetricFp a₀ a₁ t / t)
        ((z * necMetricFpp a₀ a₁ z - necMetricFp a₀ a₁ z) / z ^ 2) z := by
    intro z hz
    have hzNe : z ≠ 0 := ne_of_gt hz
    have hDiv := (hDerivFp z hz).div (hasDerivAt_id z) hzNe
    refine hDiv.congr_deriv ?_
    simp only [id_eq]
    ring
  have hNecEq : ∀ z : ℝ, 0 < z →
      z * necMetricFpp a₀ a₁ z - necMetricFp a₀ a₁ z = 2 * a₀ * z + 3 * a₁ * z ^ 2 := by
    intro z _
    simp only [necMetricFp, necMetricFpp]
    ring
  have hNecNonneg : 0 ≤ a₀ → 0 ≤ a₁ → ∀ z : ℝ, 0 < z →
      0 ≤ z * necMetricFpp a₀ a₁ z - necMetricFp a₀ a₁ z := by
    intro ha₀ ha₁ z hz
    rw [hNecEq z hz]
    positivity
  have hMonoQ : 0 ≤ a₀ → 0 ≤ a₁ → ∀ z₁ z₂ : ℝ, 0 < z₁ → z₁ ≤ z₂ →
      necMetricFp a₀ a₁ z₁ / z₁ ≤ necMetricFp a₀ a₁ z₂ / z₂ := by
    intro ha₀ ha₁ z₁ z₂ hz₁ hle
    have hz₂ : 0 < z₂ := lt_of_lt_of_le hz₁ hle
    have hq₁ : necMetricFp a₀ a₁ z₁ / z₁ =
        -2 + a₀ * (2 * Real.log z₁ + 1) + a₁ * (3 * z₁ - 2) := by
      simp only [necMetricFp]
      field_simp [ne_of_gt hz₁]
    have hq₂ : necMetricFp a₀ a₁ z₂ / z₂ =
        -2 + a₀ * (2 * Real.log z₂ + 1) + a₁ * (3 * z₂ - 2) := by
      simp only [necMetricFp]
      field_simp [ne_of_gt hz₂]
    have hLogLe : Real.log z₁ ≤ Real.log z₂ := Real.log_le_log hz₁ hle
    rw [hq₁, hq₂]
    nlinarith
  refine ⟨hDerivF, hDerivFp, hDerivQ, hNecEq, hNecNonneg, hMonoQ, ⟨?_, ?_, ?_⟩, ?_⟩
  · simp [necMetricF, Real.log_one]
  · simp [necMetricFp, Real.log_one]
    ring
  · intro ha₀ ha₁ z hz0 hz1
    have hLogNonpos : Real.log z ≤ 0 := Real.log_nonpos (le_of_lt hz0) hz1
    have hTerm0 : a₀ * z ^ 2 * Real.log z ≤ 0 :=
      mul_nonpos_of_nonneg_of_nonpos (by positivity) hLogNonpos
    have hCubeLe : z ^ 3 - z ^ 2 ≤ 0 := by
      have hFact : z ^ 3 - z ^ 2 = z ^ 2 * (z - 1) := by ring
      rw [hFact]
      exact mul_nonpos_of_nonneg_of_nonpos (sq_nonneg z) (by linarith)
    have hTerm1 : a₁ * (z ^ 3 - z ^ 2) ≤ 0 := mul_nonpos_of_nonneg_of_nonpos ha₁ hCubeLe
    simp only [necMetricF]
    linarith
  · intro ha₀ ha₁ z hz1
    have hz0 : 0 < z := by linarith
    have hzNe : z ≠ 0 := ne_of_gt hz0
    have hLogNonneg : 0 ≤ Real.log z := Real.log_nonneg hz1
    have hTerm0 : 0 ≤ a₀ * z ^ 2 * Real.log z := mul_nonneg (by positivity) hLogNonneg
    have hCubeGe : 0 ≤ z ^ 3 - z ^ 2 := by
      have hFact : z ^ 3 - z ^ 2 = z ^ 2 * (z - 1) := by ring
      rw [hFact]
      exact mul_nonneg (sq_nonneg z) (by linarith)
    have hTerm1 : 0 ≤ a₁ * (z ^ 3 - z ^ 2) := mul_nonneg ha₁ hCubeGe
    have hFge : 1 - z ^ 2 ≤ necMetricF a₀ a₁ z := by
      simp only [necMetricF]
      linarith
    have hDivLe : -necMetricF a₀ a₁ z / z ^ 2 ≤ 1 - 1 / z ^ 2 := by
      have h1 : -necMetricF a₀ a₁ z / z ^ 2 ≤ (z ^ 2 - 1) / z ^ 2 :=
        div_le_div_of_nonneg_right (by linarith) (sq_nonneg z)
      have h2 : (z ^ 2 - 1) / z ^ 2 = 1 - 1 / z ^ 2 := by
        field_simp [hzNe]
      linarith
    have hInvPos : 0 < 1 / z ^ 2 := by positivity
    exact ⟨hFge, hDivLe, by linarith⟩

end Vibe

end
