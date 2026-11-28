module

public import Mathlib.Analysis.SpecialFunctions.Log.Deriv
public import Mathlib.Analysis.SpecialFunctions.Trigonometric.Basic
public import Mathlib.Data.Matrix.Basic
public import Mathlib.Data.ZMod.Basic
public import Mathlib.Tactic.Ring
public import Mathlib.Tactic.Linarith
public import Mathlib.Tactic.NormNum

/-!
# Vibe Theory: Wave-6 Mathlib Canonical Proofs (`v4.35.0`)

Self-contained Mathlib `v4.35.0` formalization of the four Wave-6 Tier-A theorems covering
orbifold flux selection, `Z_3^{DM} × 2T_R` dark-sector stability, exact 24-cell Plebanski
BF geometry (simplicity, Gauss closure, integrated 4-cell Plebanski constraint, 4-volume `V_24 = 8`,
and unconstrained BF negative control), and continuous real-calculus NEC monotonicity & causal
entanglement velocity bounds.

Headline theorems (`0 sorry`, `0 axiom`, `0 native_decide`, `#print axioms` clean):
1. `thm_w6_untwisted_anomaly_uniqueness`: Exact orbifold index splitting
   `w6IndUntwisted n = 2 n^2 - 2`, `w6IndTwisted n = 2 n^2 + 1`, total Pfaffian
   `Ind_0 + 2 Ind_1 = 6 n^2`, exact uniqueness `Ind_0 = 0 ↔ n = ±1`, forced generation count
   `N_gen = 3`, total chirality `6`, and explicit small-`n` table (`n = 0, 1, 2, 3`).
2. `thm_w6_vq2_dark_sector_stability`: Exact `Z_3^{DM}` charge conservation `q - F (mod 3)`
   forbidding `ΔF = 0` decay `V_2 → V_1 + V_1 + V_1_bar`, combined with the exact 7-irrep
   `2T_R = SL(2, 3)` character table over `ℂ` proving zero Dirac mixing, zero Majorana mixing,
   exact 3-body `ΔF = -2` stability of the `1'` dark singlet, allowed `2 → 2` thermal-relic
   annihilation portal (multiplicity `7`), and allowed Dirac dark self-mass (multiplicity `2`).
3. `thm_w6_plebanski_24cell_simplicity_and_closure`: Exact 24-cell (`D_4` root polytope)
   Plebanski BF geometry over `ℤ`: exact `f`-vector (`96` equilateral triangles, `24` octahedral
   facets with `6` vertices and `8` triangles each, `672` intra-facet triangle pairs), exact
   diagonal simplicity (`96/96` triangles & `192/192` oriented facet-triangles), exact
   cross-simplicity (`672` intra-facet pairs), exact octahedral Gauss closure (`24/24` facets),
   exact integrated 4-cell Plebanski tensors (`P^{+,IJ} = +4·48 δ^{IJ}`,
   `P^{-,IJ} = -4·48 δ^{IJ}`, `P^{+-,IJ} = 0`, 4-volume `V_24 = 8`), and an unconstrained BF
   negative control (`5:4` deformation) that preserves exact Gauss closure on all `24` facets
   while strictly breaking diagonal simplicity.
4. `thm_w6_nec_monotone_velocity_bound`: Exact continuous real-calculus `HasDerivAt`
   differentiation of the near-horizon metric function
   `f(z) = 1 - z^2 + a₀ z^2 log z + a₁ (z^3 - z^2)`, exact NEC identity
   `z f''(z) - f'(z) = 2 a₀ z + 3 a₁ z^2 ≥ 0`, exact quotient derivative
   `(f'(z) / z)' = (z f''(z) - f'(z)) / z^2`, monotonicity of `q(z) = f'(z) / z` on `(0, ∞)`,
   horizon values `f(1) = 0`, `f'(1) = -2 + a₀ + a₁`, and causal entanglement velocity bound
   `f(z) ≤ 1 - z^2` for all `z ∈ (0, 1]` under `a₀ ≥ 0, a₁ ≥ 0`.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

open Matrix

/-! ### 1. Exact Untwisted Orbifold Anomaly Uniqueness (`W6-R2`) -/

/-- Chiral index in the untwisted orbifold sector `V_{q=0}` at integer flux quantum `n : ℤ`. -/
def w6IndUntwisted (n : ℤ) : ℤ := 2 * n ^ 2 - 2

/-- Chiral index in each twisted orbifold sector `V_{q=1}`, `V_{q=2}` at flux quantum `n : ℤ`. -/
def w6IndTwisted (n : ℤ) : ℤ := 2 * n ^ 2 + 1

/-- Headline 1: Exact Untwisted Orbifold Anomaly Uniqueness Theorem.
    Anomaly cancellation (vector-like untwisted sector `w6IndUntwisted n = 0`) uniquely selects
    primitive flux `n = ±1`, automatically forcing `N_gen = w6IndTwisted n = 3` chiral generations
    and total Pfaffian chirality `6`. -/
theorem thm_w6_untwisted_anomaly_uniqueness :
    (∀ n : ℤ, w6IndUntwisted n + 2 * w6IndTwisted n = 6 * n ^ 2) ∧
    (∀ n : ℤ, w6IndUntwisted n = 0 ↔ n = 1 ∨ n = -1) ∧
    (∀ n : ℤ, w6IndUntwisted n = 0 → w6IndTwisted n = 3) ∧
    (∀ n : ℤ, w6IndUntwisted n = 0 → w6IndUntwisted n + 2 * w6IndTwisted n = 6) ∧
    ((w6IndUntwisted 0, w6IndTwisted 0) = (-2, 1) ∧
      (w6IndUntwisted 1, w6IndTwisted 1) = (0, 3) ∧
      (w6IndUntwisted 2, w6IndTwisted 2) = (6, 9) ∧
      (w6IndUntwisted 3, w6IndTwisted 3) = (16, 19)) := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · intro n
    simp only [w6IndUntwisted, w6IndTwisted]
    ring
  · intro n
    constructor
    · intro h
      have hFac : (n - 1) * (n + 1) = 0 := by
        simp only [w6IndUntwisted] at h
        nlinarith
      rcases mul_eq_zero.mp hFac with h1 | h2
      · left; linarith
      · right; linarith
    · rintro (rfl | rfl) <;> norm_num [w6IndUntwisted]
  · intro n h
    simp only [w6IndUntwisted, w6IndTwisted] at h ⊢
    linarith
  · intro n h
    simp only [w6IndUntwisted, w6IndTwisted] at h ⊢
    linarith
  · norm_num [w6IndUntwisted, w6IndTwisted]

/-! ### 2. Exact `Z_3^{DM} × 2T_R` Dark-Sector Stability (`W6-R2`) -/

/-- Exact `Z_3^{DM}` dark-matter charge `Q_{DM}(q, F) = q - F (mod 3)`. -/
def w6DarkCharge (q F : ZMod 3) : ZMod 3 := q - F

/-- Primitive cube root of unity `ω = -1/2 + i √3 / 2 ∈ ℂ`. -/
noncomputable def w6Omega : ℂ := ⟨-(1 / 2 : ℝ), Real.sqrt 3 / 2⟩

/-- Conjugate primitive cube root of unity `ω^2 = -1/2 - i √3 / 2 ∈ ℂ`. -/
noncomputable def w6Omega2 : ℂ := ⟨-(1 / 2 : ℝ), -(Real.sqrt 3 / 2)⟩

/-- Conjugacy-class sizes `(1, 1, 6, 4, 4, 4, 4)` of `2T_R = SL(2, 3)`. -/
def w6ClassSize2T : Fin 7 → ℕ := ![1, 1, 6, 4, 4, 4, 4]

/-- Exact 7-irrep character table of `2T_R = SL(2, 3)` (`1, 1', 1'', 3, 2, 2', 2''`). -/
noncomputable def w6Char2T : Fin 7 → Fin 7 → ℂ
  | ⟨0, _⟩ => ![1,  1,  1,  1,         1,          1,         1]
  | ⟨1, _⟩ => ![1,  1,  1,  w6Omega,   w6Omega2,   w6Omega2,  w6Omega]
  | ⟨2, _⟩ => ![1,  1,  1,  w6Omega2,  w6Omega,    w6Omega,   w6Omega2]
  | ⟨3, _⟩ => ![3,  3, -1,  0,         0,          0,         0]
  | ⟨4, _⟩ => ![2, -2,  0, -1,        -1,          1,         1]
  | ⟨5, _⟩ => ![2, -2,  0, -w6Omega,  -w6Omega2,   w6Omega2,  w6Omega]
  | ⟨6, _⟩ => ![2, -2,  0, -w6Omega2, -w6Omega,    w6Omega,   w6Omega2]

/-- Standard `2T_R` class-function Hermitian inner product `⟨χ, ψ⟩ = (1/24) ∑_c |C_c| conj(χ_c) ψ_c`. -/
noncomputable def w6CharInner2T (χ ψ : Fin 7 → ℂ) : ℂ :=
  (1 / 24 : ℂ) * ∑ c : Fin 7, (w6ClassSize2T c : ℂ) * star (χ c) * ψ c

/-- Chiral zero-mode `2T_R` character in the visible sector `V_{q=1} = 1 ⊕ 2''`. -/
noncomputable def w6ChiV1 : Fin 7 → ℂ := fun c => w6Char2T 0 c + w6Char2T 6 c

/-- Chiral zero-mode `2T_R` character in the dark sector `V_{q=2} = 1' ⊕ 2`. -/
noncomputable def w6ChiV2 : Fin 7 → ℂ := fun c => w6Char2T 1 c + w6Char2T 4 c

private def w6Char2TCoeff (i : Fin 7) : Fin 7 → ℤ × ℤ :=
  match i.val with
  | 0 => ![(1, 0), (1, 0),  (1, 0),  (1, 0),   (1, 0),   (1, 0),   (1, 0)]
  | 1 => ![(1, 0), (1, 0),  (1, 0),  (0, 1),   (-1, -1), (-1, -1), (0, 1)]
  | 2 => ![(1, 0), (1, 0),  (1, 0),  (-1, -1), (0, 1),   (0, 1),   (-1, -1)]
  | 3 => ![(3, 0), (3, 0),  (-1, 0), (0, 0),   (0, 0),   (0, 0),   (0, 0)]
  | 4 => ![(2, 0), (-2, 0), (0, 0),  (-1, 0),  (-1, 0),  (1, 0),   (1, 0)]
  | 5 => ![(2, 0), (-2, 0), (0, 0),  (0, -1),  (1, 1),   (-1, -1), (0, 1)]
  | _ => ![(2, 0), (-2, 0), (0, 0),  (1, 1),   (0, -1),  (0, 1),   (-1, -1)]

private def w6EisAdd (x y : ℤ × ℤ) : ℤ × ℤ := (x.1 + y.1, x.2 + y.2)
private def w6EisConj (z : ℤ × ℤ) : ℤ × ℤ := (z.1 - z.2, -z.2)
private def w6EisMul (x y : ℤ × ℤ) : ℤ × ℤ :=
  (x.1 * y.1 - x.2 * y.2, x.1 * y.2 + x.2 * y.1 - x.2 * y.2)
private def w6EisScale (n : ℕ) (z : ℤ × ℤ) : ℤ × ℤ := ((n : ℤ) * z.1, (n : ℤ) * z.2)
private def w6EisSum7 (f : Fin 7 → ℤ × ℤ) : ℤ × ℤ :=
  (∑ k : Fin 7, (f k).1, ∑ k : Fin 7, (f k).2)

private def w6ChiV1Coeff (c : Fin 7) : ℤ × ℤ := w6EisAdd (w6Char2TCoeff 0 c) (w6Char2TCoeff 6 c)
private def w6ChiV2Coeff (c : Fin 7) : ℤ × ℤ := w6EisAdd (w6Char2TCoeff 1 c) (w6Char2TCoeff 4 c)

/-- Headline 2: Exact `Z_3^{DM} × 2T_R` Dark-Sector Stability Theorem.
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
theorem thm_w6_vq2_dark_sector_stability :
    (w6DarkCharge 1 1 = 0 ∧
      w6DarkCharge 2 (-1) = 0 ∧
      w6DarkCharge 0 0 = 0 ∧
      w6DarkCharge 0 3 = 0 ∧
      w6DarkCharge 2 1 = 1 ∧ (1 : ZMod 3) ≠ 0 ∧
      w6DarkCharge 2 1 ≠
        w6DarkCharge 1 1 + w6DarkCharge 1 1 + w6DarkCharge 2 (-1)) ∧
    (w6CharInner2T (fun c => star (w6ChiV1 c) * w6ChiV2 c) (w6Char2T 0) = 0 ∧
      w6CharInner2T (fun c => w6ChiV1 c * w6ChiV2 c) (w6Char2T 0) = 0 ∧
      w6CharInner2T
        (fun c => star (w6Char2T 1 c) * star (w6ChiV1 c) * star (w6ChiV1 c) * w6ChiV1 c)
        (w6Char2T 0) = 0 ∧
      w6CharInner2T
        (fun c => star (w6ChiV2 c) * w6ChiV2 c * star (w6ChiV1 c) * w6ChiV1 c)
        (w6Char2T 0) = 7 ∧
      w6CharInner2T (fun c => star (w6ChiV2 c) * w6ChiV2 c) (w6Char2T 0) = 2) := by
  have hSq3 : Real.sqrt 3 * Real.sqrt 3 = 3 := Real.mul_self_sqrt (by norm_num)
  have hW2 : w6Omega ^ 2 = w6Omega2 := by
    apply Complex.ext <;> simp [w6Omega, w6Omega2, pow_two] <;> nlinarith [hSq3]
  have hWSum : w6Omega + w6Omega2 + 1 = 0 := by
    apply Complex.ext
    · simp [w6Omega, w6Omega2]; norm_num
    · simp [w6Omega, w6Omega2]
  have hW2Eq : w6Omega2 = -1 - w6Omega := by linear_combination hWSum
  have hWSqLin : w6Omega ^ 2 = -1 - w6Omega := by rw [hW2, hW2Eq]
  have hConjW : starRingEnd ℂ w6Omega = -1 - w6Omega := by
    apply Complex.ext
    · simp [w6Omega]; norm_num
    · simp [w6Omega]
  let eisC : ℤ × ℤ → ℂ := fun z => (z.1 : ℂ) + (z.2 : ℂ) * w6Omega
  have hEisAdd : ∀ x y : ℤ × ℤ, eisC x + eisC y = eisC (w6EisAdd x y) := by
    intro ⟨a, b⟩ ⟨c, d⟩
    simp only [eisC, w6EisAdd, Int.cast_add]
    ring
  have hEisConj : ∀ z : ℤ × ℤ, star (eisC z) = eisC (w6EisConj z) := by
    intro ⟨a, b⟩
    simp only [eisC, w6EisConj, star_add, star_mul', Complex.star_def,
      map_intCast, hConjW, Int.cast_sub, Int.cast_neg]
    ring
  have hEisMul : ∀ x y : ℤ × ℤ, eisC x * eisC y = eisC (w6EisMul x y) := by
    intro ⟨a, b⟩ ⟨c, d⟩
    simp only [eisC, w6EisMul, Int.cast_sub, Int.cast_add, Int.cast_mul]
    linear_combination (b : ℂ) * (d : ℂ) * hWSqLin
  have hEisScale : ∀ (n : ℕ) (z : ℤ × ℤ), (n : ℂ) * eisC z = eisC (w6EisScale n z) := by
    intro n ⟨a, b⟩
    simp only [eisC, w6EisScale, Int.cast_mul, Int.cast_natCast]
    ring
  have hEisSum : ∀ f : Fin 7 → ℤ × ℤ, (∑ k : Fin 7, eisC (f k)) = eisC (w6EisSum7 f) := by
    intro f
    simp only [eisC, w6EisSum7, Finset.sum_add_distrib, ← Finset.sum_mul, Int.cast_sum]
  have hCharCoeff : ∀ i c : Fin 7, w6Char2T i c = eisC (w6Char2TCoeff i c) := by
    intro i c
    fin_cases i <;> fin_cases c <;>
      simp [w6Char2T, w6Char2TCoeff, eisC, hW2Eq] <;> ring
  have hV1Coeff : ∀ c : Fin 7, w6ChiV1 c = eisC (w6ChiV1Coeff c) := by
    intro c
    simp only [w6ChiV1, w6ChiV1Coeff, hCharCoeff, hEisAdd]
  have hV2Coeff : ∀ c : Fin 7, w6ChiV2 c = eisC (w6ChiV2Coeff c) := by
    intro c
    simp only [w6ChiV2, w6ChiV2Coeff, hCharCoeff, hEisAdd]
  have hDiracInt :
      w6EisSum7 (fun c =>
        w6EisMul (w6EisScale (w6ClassSize2T c)
          (w6EisConj (w6EisMul (w6EisConj (w6ChiV1Coeff c)) (w6ChiV2Coeff c))))
          (w6Char2TCoeff 0 c)) = (0, 0) := by
    decide
  have hMajInt :
      w6EisSum7 (fun c =>
        w6EisMul (w6EisScale (w6ClassSize2T c)
          (w6EisConj (w6EisMul (w6ChiV1Coeff c) (w6ChiV2Coeff c))))
          (w6Char2TCoeff 0 c)) = (0, 0) := by
    decide
  have hDecay3Int :
      w6EisSum7 (fun c =>
        w6EisMul (w6EisScale (w6ClassSize2T c)
          (w6EisConj (w6EisMul
            (w6EisMul (w6EisMul (w6EisConj (w6Char2TCoeff 1 c)) (w6EisConj (w6ChiV1Coeff c)))
              (w6EisConj (w6ChiV1Coeff c)))
            (w6ChiV1Coeff c))))
          (w6Char2TCoeff 0 c)) = (0, 0) := by
    decide
  have hPortalInt :
      w6EisSum7 (fun c =>
        w6EisMul (w6EisScale (w6ClassSize2T c)
          (w6EisConj (w6EisMul
            (w6EisMul (w6EisMul (w6EisConj (w6ChiV2Coeff c)) (w6ChiV2Coeff c))
              (w6EisConj (w6ChiV1Coeff c)))
            (w6ChiV1Coeff c))))
          (w6Char2TCoeff 0 c)) = (168, 0) := by
    decide
  have hSelfInt :
      w6EisSum7 (fun c =>
        w6EisMul (w6EisScale (w6ClassSize2T c)
          (w6EisConj (w6EisMul (w6EisConj (w6ChiV2Coeff c)) (w6ChiV2Coeff c))))
          (w6Char2TCoeff 0 c)) = (48, 0) := by
    decide
  refine ⟨by decide, ?_, ?_, ?_, ?_, ?_⟩
  · simp only [w6CharInner2T, hV1Coeff, hV2Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hDiracInt]
    simp [eisC]
  · simp only [w6CharInner2T, hV1Coeff, hV2Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hMajInt]
    simp [eisC]
  · simp only [w6CharInner2T, hV1Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hDecay3Int]
    simp [eisC]
  · simp only [w6CharInner2T, hV1Coeff, hV2Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hPortalInt]
    simp [eisC]
    norm_num
  · simp only [w6CharInner2T, hV2Coeff, hCharCoeff, hEisConj, hEisMul, hEisScale,
      hEisSum, hSelfInt]
    simp [eisC]
    norm_num

/-! ### 3. Exact 24-Cell Plebanski BF Simplicity, Closure & 4-Volume (`W6-R1`) -/

/-- Exact 24 `D_4` root vectors `(±1, ±1, 0, 0)` (all permutations), vertices of the regular 24-cell. -/
def w6D4Root (i : Fin 24) : Fin 4 → ℤ :=
  match i.val with
  | 0  => ![ 1,  1,  0,  0]
  | 1  => ![ 1, -1,  0,  0]
  | 2  => ![-1,  1,  0,  0]
  | 3  => ![-1, -1,  0,  0]
  | 4  => ![ 1,  0,  1,  0]
  | 5  => ![ 1,  0, -1,  0]
  | 6  => ![-1,  0,  1,  0]
  | 7  => ![-1,  0, -1,  0]
  | 8  => ![ 1,  0,  0,  1]
  | 9  => ![ 1,  0,  0, -1]
  | 10 => ![-1,  0,  0,  1]
  | 11 => ![-1,  0,  0, -1]
  | 12 => ![ 0,  1,  1,  0]
  | 13 => ![ 0,  1, -1,  0]
  | 14 => ![ 0, -1,  1,  0]
  | 15 => ![ 0, -1, -1,  0]
  | 16 => ![ 0,  1,  0,  1]
  | 17 => ![ 0,  1,  0, -1]
  | 18 => ![ 0, -1,  0,  1]
  | 19 => ![ 0, -1,  0, -1]
  | 20 => ![ 0,  0,  1,  1]
  | 21 => ![ 0,  0,  1, -1]
  | 22 => ![ 0,  0, -1,  1]
  | _  => ![ 0,  0, -1, -1]

/-- Exact 24 octahedral facet outward normals `n_c` (`‖n_c‖^2 = 4`): `±2 e_k` and `(±1, ±1, ±1, ±1)`. -/
def w6FacetNormal (c : Fin 24) : Fin 4 → ℤ :=
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

/-- Euclidean inner product on `ℤ^4`. -/
def w6Dot4 (u v : Fin 4 → ℤ) : ℤ :=
  u 0 * v 0 + u 1 * v 1 + u 2 * v 2 + u 3 * v 3

/-- Euclidean inner product on `ℤ^3`. -/
def w6Dot3 (u v : Fin 3 → ℤ) : ℤ :=
  u 0 * v 0 + u 1 * v 1 + u 2 * v 2

/-- Exact `4 × 4` integer determinant of rows `(r0, r1, r2, r3)`. -/
def w6Det4 (r0 r1 r2 r3 : Fin 4 → ℤ) : ℤ :=
  let det3 (a b c : Fin 4 → ℤ) (i j k : Fin 4) : ℤ :=
    a i * (b j * c k - b k * c j) -
    a j * (b i * c k - b k * c i) +
    a k * (b i * c j - b j * c i)
  r0 0 * det3 r1 r2 r3 1 2 3 -
  r0 1 * det3 r1 r2 r3 0 2 3 +
  r0 2 * det3 r1 r2 r3 0 1 3 -
  r0 3 * det3 r1 r2 r3 0 1 2

/-- Generator of all ordered equilateral root triples `(i, j, k)` (`i < j < k`, pairwise dot `1`)
    within a vertex list `vs`. -/
def w6TriListFrom (vs : List (Fin 24)) : List (Fin 24 × Fin 24 × Fin 24) :=
  vs.flatMap fun i =>
    (vs.filter fun j => i < j ∧ w6Dot4 (w6D4Root i) (w6D4Root j) = 1).flatMap fun j =>
      (vs.filter fun k =>
        j < k ∧ w6Dot4 (w6D4Root i) (w6D4Root k) = 1 ∧
          w6Dot4 (w6D4Root j) (w6D4Root k) = 1).map fun k => (i, j, k)

/-- Ordered list of all `96` equilateral triangular 2-faces of the regular 24-cell. -/
def w6TriList : List (Fin 24 × Fin 24 × Fin 24) :=
  w6TriListFrom (List.finRange 24)

/-- `Finset` of all `96` equilateral triangular 2-faces of the regular 24-cell. -/
def w6D4Tris : Finset (Fin 24 × Fin 24 × Fin 24) :=
  w6TriList.toFinset

/-- Ordered list of the `6` vertices of octahedral facet `c` (`v · n_c = 2`). -/
def w6FacetVertList (c : Fin 24) : List (Fin 24) :=
  (List.finRange 24).filter fun v => w6Dot4 (w6D4Root v) (w6FacetNormal c) = 2

/-- `Finset` of the `6` vertices of octahedral facet `c`. -/
def w6FacetVerts (c : Fin 24) : Finset (Fin 24) :=
  (w6FacetVertList c).toFinset

/-- Ordered list of the `8` equilateral triangles of octahedral facet `c`. -/
def w6FacetTriList (c : Fin 24) : List (Fin 24 × Fin 24 × Fin 24) :=
  w6TriListFrom (w6FacetVertList c)

/-- `Finset` of the `8` equilateral triangles of octahedral facet `c`. -/
def w6FacetTris (c : Fin 24) : Finset (Fin 24 × Fin 24 × Fin 24) :=
  (w6FacetTriList c).toFinset

/-- Unoriented integer-scaled (`4×`) self-dual area bivector `4 Σ_t^+ ∈ ℤ^3` of triangle `t`. -/
def w6TriBivP (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  let u := w6D4Root t.1
  let v := w6D4Root t.2.1
  let w := w6D4Root t.2.2
  let w2 (μ ν : Fin 4) : ℤ := (v μ - u μ) * (w ν - u ν) - (v ν - u ν) * (w μ - u μ)
  ![w2 0 1 + w2 2 3, w2 0 2 - w2 1 3, w2 0 3 + w2 1 2]

/-- Unoriented integer-scaled (`4×`) anti-self-dual area bivector `4 Σ_t^- ∈ ℤ^3` of triangle `t`. -/
def w6TriBivM (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  let u := w6D4Root t.1
  let v := w6D4Root t.2.1
  let w := w6D4Root t.2.2
  let w2 (μ ν : Fin 4) : ℤ := (v μ - u μ) * (w ν - u ν) - (v ν - u ν) * (w μ - u μ)
  ![w2 0 1 - w2 2 3, w2 0 2 + w2 1 3, w2 0 3 - w2 1 2]

/-- Outward orientation sign `σ(c; u, v, w) = sign(det(n_c, u, v, w)) ∈ {+1, -1}` of triangle `t`
    as a boundary 2-face of octahedral facet `c`. -/
def w6FacetOrient (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : ℤ :=
  if 0 < w6Det4 (w6FacetNormal c) (w6D4Root t.1) (w6D4Root t.2.1) (w6D4Root t.2.2) then 1 else -1

/-- Outward integer-scaled (`4×`) self-dual Plebanski bivector `4 B_{c,t}^+ = 4 (*Σ_{c,t})^+ ∈ ℤ^3`. -/
def w6BivP (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  fun I => w6FacetOrient c t * w6TriBivP t I

/-- Outward integer-scaled (`4×`) anti-self-dual Plebanski bivector `4 B_{c,t}^- = 4 (*Σ_{c,t})^- ∈ ℤ^3`. -/
def w6BivM (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  fun I => -(w6FacetOrient c t * w6TriBivM t I)

/-- Outward integer-scaled (`4×`) self-dual area 2-form integral `4 ∫_t b^+ = 4 B_{c,t}^+`. -/
def w6SigP (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  w6BivP c t

/-- Outward integer-scaled (`4×`) anti-self-dual area 2-form integral `4 ∫_t b^- = -4 B_{c,t}^-`. -/
def w6SigM (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  fun I => -(w6BivM c t I)

/-- Exact integer-scaled (`scale = 48 = 3 · 16`) integrated 4-cell self-dual Plebanski tensor
    `P^{+,IJ} = 48 ∫_{24-cell} b^{+,I} ∧ b^{+,J} = ∑_c ∑_{t ∈ c} (4 B_{c,t}^{+,I}) (4 ∫_t b^{+,J})`. -/
def w6PlebPP : Matrix (Fin 3) (Fin 3) ℤ :=
  Matrix.of fun I J =>
    ∑ c : Fin 24, ∑ t ∈ w6FacetTris c, w6BivP c t I * w6SigP c t J

/-- Exact integer-scaled (`scale = 48`) integrated 4-cell anti-self-dual Plebanski tensor
    `P^{-,IJ} = 48 ∫_{24-cell} b^{-,I} ∧ b^{-,J} = ∑_c ∑_{t ∈ c} (4 B_{c,t}^{-,I}) (4 ∫_t b^{-,J})`. -/
def w6PlebMM : Matrix (Fin 3) (Fin 3) ℤ :=
  Matrix.of fun I J =>
    ∑ c : Fin 24, ∑ t ∈ w6FacetTris c, w6BivM c t I * w6SigM c t J

/-- Exact integer-scaled (`scale = 48`) integrated 4-cell mixed Plebanski tensor
    `P^{+-,IJ} = 48 ∫_{24-cell} b^{+,I} ∧ b^{-,J} = ∑_c ∑_{t ∈ c} (4 B_{c,t}^{+,I}) (4 ∫_t b^{-,J})`. -/
def w6PlebPM : Matrix (Fin 3) (Fin 3) ℤ :=
  Matrix.of fun I J =>
    ∑ c : Fin 24, ∑ t ∈ w6FacetTris c, w6BivP c t I * w6SigM c t J

/-- Unconstrained BF negative control: scales `B^{+,0}` by `5/4` (exact integer `5` vs `4`),
    preserving Gauss closure across all `24` facets while breaking diagonal simplicity. -/
def w6BivPDef (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  fun I => if I = 0 then 5 * w6BivP c t 0 else 4 * w6BivP c t I

/-- Matching `4×`-scaled anti-self-dual bivector for the unconstrained BF negative control. -/
def w6BivMDef (c : Fin 24) (t : Fin 24 × Fin 24 × Fin 24) : Fin 3 → ℤ :=
  fun I => 4 * w6BivM c t I

private theorem w6_mem_triListFrom {vs : List (Fin 24)} {p : Fin 24 × Fin 24 × Fin 24} :
    p ∈ w6TriListFrom vs ↔
      p.1 ∈ vs ∧ p.2.1 ∈ vs ∧ p.2.2 ∈ vs ∧
      p.1 < p.2.1 ∧ p.2.1 < p.2.2 ∧
      w6Dot4 (w6D4Root p.1) (w6D4Root p.2.1) = 1 ∧
      w6Dot4 (w6D4Root p.1) (w6D4Root p.2.2) = 1 ∧
      w6Dot4 (w6D4Root p.2.1) (w6D4Root p.2.2) = 1 := by
  rcases p with ⟨i, j, k⟩
  simp only [w6TriListFrom, List.mem_flatMap, List.mem_filter, List.mem_map, decide_eq_true_eq]
  constructor
  · rintro ⟨a, ha, b, ⟨hb, hab, hdotab⟩, c, ⟨hc, hbc, hdotac, hdotbc⟩, hEq⟩
    cases hEq
    exact ⟨ha, hb, hc, hab, hbc, hdotab, hdotac, hdotbc⟩
  · rintro ⟨hi, hj, hk, hij, hjk, hdij, hdik, hdjk⟩
    exact ⟨i, hi, j, ⟨hj, hij, hdij⟩, k, ⟨hk, hjk, hdik, hdjk⟩, rfl⟩

private theorem w6_nodup_triListFrom {vs : List (Fin 24)} (hvs : vs.Nodup) :
    (w6TriListFrom vs).Nodup := by
  unfold w6TriListFrom
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

/-- Headline 3: Exact 24-Cell Plebanski BF Geometry Theorem (`W6-R1`).
    Proves all six exact discrete-gravity invariants over `ℤ` with zero floating-point error:
    (1) Exact `f`-vector (`96` equilateral triangles matching the full `D_4` root predicate,
        `24` octahedral facets with `6` vertices and `8` triangles each, `672` intra-facet pairs),
    (2) Exact diagonal simplicity (`96/96` triangles and `192/192` oriented facet-triangles:
        `‖B^+‖^2 = ‖B^-‖^2 > 0`),
    (3) Exact cross-simplicity (`24 × C(8, 2) = 672` unordered / `1536` ordered intra-facet pairs:
        `B_f^+ · B_{f'}^+ = B_f^- · B_{f'}^-`),
    (4) Exact octahedral Gauss closure (`24/24` facets: `∑ B^+ = 0` and `∑ B^- = 0`),
    (5) Exact integrated 4-cell Plebanski constraint (`P^{+,IJ} = +4·48 δ^{IJ}`,
        `P^{-,IJ} = -4·48 δ^{IJ}`, `P^{+-,IJ} = 0`) and exact 4-volume `V_24 = 8` (both from
        `Tr(P^+) - Tr(P^-)` and from the 192 radial 4-simplices `(0, C_c, u, v, w)`),
    (6) Unconstrained BF negative control (`5:4` scaling of `B^{+,0}`): preserves exact Gauss
        closure on all `24` facets while strictly breaking diagonal simplicity. -/
theorem thm_w6_plebanski_24cell_simplicity_and_closure :
    (w6D4Tris.card = 96 ∧
      (∀ p : Fin 24 × Fin 24 × Fin 24, p ∈ w6D4Tris ↔
        p.1 < p.2.1 ∧ p.2.1 < p.2.2 ∧
        w6Dot4 (w6D4Root p.1) (w6D4Root p.2.1) = 1 ∧
        w6Dot4 (w6D4Root p.1) (w6D4Root p.2.2) = 1 ∧
        w6Dot4 (w6D4Root p.2.1) (w6D4Root p.2.2) = 1) ∧
      (∀ c : Fin 24, (w6FacetVerts c).card = 6 ∧ (w6FacetTris c).card = 8) ∧
      (∀ c : Fin 24, ∀ t : Fin 24 × Fin 24 × Fin 24, t ∈ w6FacetTris c ↔
        t ∈ w6D4Tris ∧ t.1 ∈ w6FacetVerts c ∧ t.2.1 ∈ w6FacetVerts c ∧ t.2.2 ∈ w6FacetVerts c) ∧
      (∑ c : Fin 24, (w6FacetTris c).card * ((w6FacetTris c).card - 1) / 2) = 672) ∧
    ((∀ t ∈ w6D4Tris,
        w6Dot3 (w6TriBivP t) (w6TriBivP t) = w6Dot3 (w6TriBivM t) (w6TriBivM t) ∧
        0 < w6Dot3 (w6TriBivP t) (w6TriBivP t)) ∧
      (∀ c : Fin 24, ∀ t ∈ w6FacetTris c,
        w6Dot3 (w6BivP c t) (w6BivP c t) = w6Dot3 (w6BivM c t) (w6BivM c t) ∧
        0 < w6Dot3 (w6BivP c t) (w6BivP c t))) ∧
    (∀ c : Fin 24, ∀ t ∈ w6FacetTris c, ∀ t' ∈ w6FacetTris c,
      w6Dot3 (w6BivP c t) (w6BivP c t') = w6Dot3 (w6BivM c t) (w6BivM c t')) ∧
    (∀ c : Fin 24, ∀ I : Fin 3,
      (∑ t ∈ w6FacetTris c, w6BivP c t I) = 0 ∧
      (∑ t ∈ w6FacetTris c, w6BivM c t I) = 0) ∧
    ((∀ I J : Fin 3, w6PlebPP I J = if I = J then 4 * 48 else 0) ∧
      (∀ I J : Fin 3, w6PlebMM I J = if I = J then -(4 * 48) else 0) ∧
      (∀ I J : Fin 3, w6PlebPM I J = 0) ∧
      ((∑ I : Fin 3, w6PlebPP I I) - (∑ I : Fin 3, w6PlebMM I I) = 8 * (3 * 48)) ∧
      ((∑ c : Fin 24, ∑ t ∈ w6FacetTris c,
        |w6Det4 (w6FacetNormal c) (w6D4Root t.1) (w6D4Root t.2.1) (w6D4Root t.2.2)|) =
        8 * 48)) ∧
    ((∀ c : Fin 24, ∀ I : Fin 3,
        (∑ t ∈ w6FacetTris c, w6BivPDef c t I) = 0 ∧
        (∑ t ∈ w6FacetTris c, w6BivMDef c t I) = 0) ∧
      (∃ c : Fin 24, ∃ t ∈ w6FacetTris c,
        w6Dot3 (w6BivPDef c t) (w6BivPDef c t) ≠ w6Dot3 (w6BivMDef c t) (w6BivMDef c t))) := by
  have hNodupTris : w6TriList.Nodup := w6_nodup_triListFrom (List.nodup_finRange 24)
  have hNodupVerts : ∀ c : Fin 24, (w6FacetVertList c).Nodup :=
    fun c => (List.nodup_finRange 24).filter _
  have hNodupFTris : ∀ c : Fin 24, (w6FacetTriList c).Nodup :=
    fun c => w6_nodup_triListFrom (hNodupVerts c)
  have hTriCard : w6D4Tris.card = 96 := by
    rw [w6D4Tris, List.toFinset_card_of_nodup hNodupTris]
    decide
  have hTriMem : ∀ p : Fin 24 × Fin 24 × Fin 24, p ∈ w6D4Tris ↔
      p.1 < p.2.1 ∧ p.2.1 < p.2.2 ∧
      w6Dot4 (w6D4Root p.1) (w6D4Root p.2.1) = 1 ∧
      w6Dot4 (w6D4Root p.1) (w6D4Root p.2.2) = 1 ∧
      w6Dot4 (w6D4Root p.2.1) (w6D4Root p.2.2) = 1 := by
    intro p
    rw [w6D4Tris, List.mem_toFinset, w6TriList, w6_mem_triListFrom]
    simp [List.mem_finRange]
  have hFacetCards : ∀ c : Fin 24, (w6FacetVerts c).card = 6 ∧ (w6FacetTris c).card = 8 := by
    have hV : ∀ c : Fin 24, (w6FacetVertList c).length = 6 := by decide
    have hT : ∀ c : Fin 24, (w6FacetTriList c).length = 8 := by decide
    intro c
    rw [w6FacetVerts, List.toFinset_card_of_nodup (hNodupVerts c),
      w6FacetTris, List.toFinset_card_of_nodup (hNodupFTris c)]
    exact ⟨hV c, hT c⟩
  have hFacetMem : ∀ c : Fin 24, ∀ t : Fin 24 × Fin 24 × Fin 24, t ∈ w6FacetTris c ↔
      t ∈ w6D4Tris ∧ t.1 ∈ w6FacetVerts c ∧ t.2.1 ∈ w6FacetVerts c ∧ t.2.2 ∈ w6FacetVerts c := by
    intro c t
    rw [w6FacetTris, List.mem_toFinset, w6FacetTriList, w6_mem_triListFrom,
      hTriMem, w6FacetVerts, List.mem_toFinset, List.mem_toFinset, List.mem_toFinset]
    exact ⟨fun ⟨h1, h2, h3, hRest⟩ => ⟨hRest, h1, h2, h3⟩,
      fun ⟨hRest, h1, h2, h3⟩ => ⟨h1, h2, h3, hRest⟩⟩
  have hPairs672 : (∑ c : Fin 24, (w6FacetTris c).card * ((w6FacetTris c).card - 1) / 2) = 672 := by
    have hEq : ∀ c : Fin 24, (w6FacetTris c).card * ((w6FacetTris c).card - 1) / 2 = 28 := by
      intro c
      rw [(hFacetCards c).2]
    simp only [hEq, Finset.sum_const, Finset.card_univ, Fintype.card_fin, smul_eq_mul]
  have hDiagAll : ∀ t ∈ w6D4Tris,
      w6Dot3 (w6TriBivP t) (w6TriBivP t) = w6Dot3 (w6TriBivM t) (w6TriBivM t) ∧
      0 < w6Dot3 (w6TriBivP t) (w6TriBivP t) := by
    have hCheck : w6TriList.all (fun t =>
        decide (w6Dot3 (w6TriBivP t) (w6TriBivP t) = w6Dot3 (w6TriBivM t) (w6TriBivM t) ∧
          0 < w6Dot3 (w6TriBivP t) (w6TriBivP t))) = true := by
      decide
    intro t ht
    rw [w6D4Tris, List.mem_toFinset] at ht
    exact of_decide_eq_true (List.all_eq_true.mp hCheck t ht)
  have hDiagFacet : ∀ c : Fin 24, ∀ t ∈ w6FacetTris c,
      w6Dot3 (w6BivP c t) (w6BivP c t) = w6Dot3 (w6BivM c t) (w6BivM c t) ∧
      0 < w6Dot3 (w6BivP c t) (w6BivP c t) := by
    have hCheck : (List.finRange 24).all (fun c =>
        (w6FacetTriList c).all (fun t =>
          decide (w6Dot3 (w6BivP c t) (w6BivP c t) = w6Dot3 (w6BivM c t) (w6BivM c t) ∧
            0 < w6Dot3 (w6BivP c t) (w6BivP c t)))) = true := by
      decide
    intro c t ht
    rw [w6FacetTris, List.mem_toFinset] at ht
    have hc := List.all_eq_true.mp hCheck c (List.mem_finRange c)
    exact of_decide_eq_true (List.all_eq_true.mp hc t ht)
  have hCross : ∀ c : Fin 24, ∀ t ∈ w6FacetTris c, ∀ t' ∈ w6FacetTris c,
      w6Dot3 (w6BivP c t) (w6BivP c t') = w6Dot3 (w6BivM c t) (w6BivM c t') := by
    have hCheck : (List.finRange 24).all (fun c =>
        (w6FacetTriList c).all (fun t =>
          (w6FacetTriList c).all (fun t' =>
            decide (w6Dot3 (w6BivP c t) (w6BivP c t') =
              w6Dot3 (w6BivM c t) (w6BivM c t'))))) = true := by
      decide
    intro c t ht t' ht'
    rw [w6FacetTris, List.mem_toFinset] at ht ht'
    have hc := List.all_eq_true.mp hCheck c (List.mem_finRange c)
    have h1 := List.all_eq_true.mp hc t ht
    exact of_decide_eq_true (List.all_eq_true.mp h1 t' ht')
  have hClosure : ∀ c : Fin 24, ∀ I : Fin 3,
      (∑ t ∈ w6FacetTris c, w6BivP c t I) = 0 ∧
      (∑ t ∈ w6FacetTris c, w6BivM c t I) = 0 := by
    have hCheckP : ∀ c : Fin 24, ∀ I : Fin 3,
        ((w6FacetTriList c).map fun t => w6BivP c t I).sum = 0 := by
      decide
    have hCheckM : ∀ c : Fin 24, ∀ I : Fin 3,
        ((w6FacetTriList c).map fun t => w6BivM c t I).sum = 0 := by
      decide
    intro c I
    rw [w6FacetTris, List.sum_toFinset _ (hNodupFTris c), List.sum_toFinset _ (hNodupFTris c)]
    exact ⟨hCheckP c I, hCheckM c I⟩
  have hPlebPP : ∀ I J : Fin 3, w6PlebPP I J = if I = J then 4 * 48 else 0 := by
    have hCheck : ∀ I J : Fin 3,
        (∑ c : Fin 24, ((w6FacetTriList c).map fun t => w6BivP c t I * w6SigP c t J).sum) =
          if I = J then 4 * 48 else 0 := by
      decide
    intro I J
    simp only [w6PlebPP, Matrix.of_apply, w6FacetTris]
    have hRw : ∀ c : Fin 24,
        (∑ t ∈ (w6FacetTriList c).toFinset, w6BivP c t I * w6SigP c t J) =
          ((w6FacetTriList c).map fun t => w6BivP c t I * w6SigP c t J).sum :=
      fun c => List.sum_toFinset _ (hNodupFTris c)
    simp only [hRw]
    exact hCheck I J
  have hPlebMM : ∀ I J : Fin 3, w6PlebMM I J = if I = J then -(4 * 48) else 0 := by
    have hCheck : ∀ I J : Fin 3,
        (∑ c : Fin 24, ((w6FacetTriList c).map fun t => w6BivM c t I * w6SigM c t J).sum) =
          if I = J then -(4 * 48) else 0 := by
      decide
    intro I J
    simp only [w6PlebMM, Matrix.of_apply, w6FacetTris]
    have hRw : ∀ c : Fin 24,
        (∑ t ∈ (w6FacetTriList c).toFinset, w6BivM c t I * w6SigM c t J) =
          ((w6FacetTriList c).map fun t => w6BivM c t I * w6SigM c t J).sum :=
      fun c => List.sum_toFinset _ (hNodupFTris c)
    simp only [hRw]
    exact hCheck I J
  have hPlebPM : ∀ I J : Fin 3, w6PlebPM I J = 0 := by
    have hCheck : ∀ I J : Fin 3,
        (∑ c : Fin 24, ((w6FacetTriList c).map fun t => w6BivP c t I * w6SigM c t J).sum) = 0 := by
      decide
    intro I J
    simp only [w6PlebPM, Matrix.of_apply, w6FacetTris]
    have hRw : ∀ c : Fin 24,
        (∑ t ∈ (w6FacetTriList c).toFinset, w6BivP c t I * w6SigM c t J) =
          ((w6FacetTriList c).map fun t => w6BivP c t I * w6SigM c t J).sum :=
      fun c => List.sum_toFinset _ (hNodupFTris c)
    simp only [hRw]
    exact hCheck I J
  have hVolTr : (∑ I : Fin 3, w6PlebPP I I) - (∑ I : Fin 3, w6PlebMM I I) = 8 * (3 * 48) := by
    simp only [Fin.sum_univ_three, hPlebPP, hPlebMM, ↓reduceIte]
    norm_num
  have hVolDet :
      (∑ c : Fin 24, ∑ t ∈ w6FacetTris c,
        |w6Det4 (w6FacetNormal c) (w6D4Root t.1) (w6D4Root t.2.1) (w6D4Root t.2.2)|) =
      8 * 48 := by
    have hCheck :
        (∑ c : Fin 24, ((w6FacetTriList c).map fun t =>
          |w6Det4 (w6FacetNormal c) (w6D4Root t.1) (w6D4Root t.2.1) (w6D4Root t.2.2)|).sum) =
        8 * 48 := by
      decide
    have hRw : ∀ c : Fin 24,
        (∑ t ∈ w6FacetTris c,
          |w6Det4 (w6FacetNormal c) (w6D4Root t.1) (w6D4Root t.2.1) (w6D4Root t.2.2)|) =
        ((w6FacetTriList c).map fun t =>
          |w6Det4 (w6FacetNormal c) (w6D4Root t.1) (w6D4Root t.2.1) (w6D4Root t.2.2)|).sum :=
      fun c => List.sum_toFinset _ (hNodupFTris c)
    simp only [hRw]
    exact hCheck
  have hDefClosure : ∀ c : Fin 24, ∀ I : Fin 3,
      (∑ t ∈ w6FacetTris c, w6BivPDef c t I) = 0 ∧
      (∑ t ∈ w6FacetTris c, w6BivMDef c t I) = 0 := by
    intro c I
    rcases hClosure c I with ⟨hP, hM⟩
    constructor
    · by_cases hI : I = 0
      · subst hI
        simp only [w6BivPDef, ↓reduceIte, ← Finset.mul_sum, hP, mul_zero]
      · simp only [w6BivPDef, hI, ↓reduceIte, ← Finset.mul_sum, hP, mul_zero]
    · simp only [w6BivMDef, ← Finset.mul_sum, hM, mul_zero]
  have hDefBreak : ∃ c : Fin 24, ∃ t ∈ w6FacetTris c,
      w6Dot3 (w6BivPDef c t) (w6BivPDef c t) ≠ w6Dot3 (w6BivMDef c t) (w6BivMDef c t) := by
    refine ⟨0, (0, 4, 8), ?_, ?_⟩
    · rw [w6FacetTris, List.mem_toFinset]
      decide
    · decide
  exact ⟨⟨hTriCard, hTriMem, hFacetCards, hFacetMem, hPairs672⟩,
    ⟨hDiagAll, hDiagFacet⟩, hCross, hClosure,
    ⟨hPlebPP, hPlebMM, hPlebPM, hVolTr, hVolDet⟩,
    ⟨hDefClosure, hDefBreak⟩⟩

/-! ### 4. Exact Real-Calculus NEC Monotonicity & Causal Velocity Bound (`W6-R1` Gate G5) -/

/-- Near-horizon blackening function `f(z) = 1 - z^2 + a₀ z^2 log z + a₁ (z^3 - z^2)`. -/
noncomputable def w6MetricF (a₀ a₁ z : ℝ) : ℝ :=
  1 - z ^ 2 + a₀ * z ^ 2 * Real.log z + a₁ * (z ^ 3 - z ^ 2)

/-- Explicit first derivative `f'(z) = -2 z + a₀ (2 z log z + z) + a₁ (3 z^2 - 2 z)`. -/
noncomputable def w6MetricFp (a₀ a₁ z : ℝ) : ℝ :=
  -2 * z + a₀ * (2 * z * Real.log z + z) + a₁ * (3 * z ^ 2 - 2 * z)

/-- Explicit second derivative `f''(z) = -2 + a₀ (2 log z + 3) + a₁ (6 z - 2)`. -/
noncomputable def w6MetricFpp (a₀ a₁ z : ℝ) : ℝ :=
  -2 + a₀ * (2 * Real.log z + 3) + a₁ * (6 * z - 2)

/-- Headline 4: Exact Continuous Real-Calculus NEC Monotonicity & Causal Velocity Bound Theorem.
    For all `a₀ a₁ : ℝ`:
    (1) `HasDerivAt (w6MetricF a₀ a₁) (w6MetricFp a₀ a₁ z) z` for all `z > 0`,
    (2) `HasDerivAt (w6MetricFp a₀ a₁) (w6MetricFpp a₀ a₁ z) z` for all `z > 0`,
    (3) Exact quotient-rule NEC derivative
        `HasDerivAt (fun t => w6MetricFp a₀ a₁ t / t) ((z * w6MetricFpp a₀ a₁ z - w6MetricFp a₀ a₁ z) / z^2) z`,
    (4) Exact NEC identity `z f''(z) - f'(z) = 2 a₀ z + 3 a₁ z^2` and NEC nonnegativity under
        `a₀ ≥ 0, a₁ ≥ 0`,
    (5) Monotonicity of `q(z) = f'(z) / z` on `(0, ∞)` under `a₀ ≥ 0, a₁ ≥ 0`,
    (6) Horizon values `f(1) = 0`, `f'(1) = -2 + a₀ + a₁`, and exact causal entanglement
        velocity bound `f(z) ≤ 1 - z^2` for all `z ∈ (0, 1]` under `a₀ ≥ 0, a₁ ≥ 0`. -/
theorem thm_w6_nec_monotone_velocity_bound (a₀ a₁ : ℝ) :
    (∀ z : ℝ, 0 < z → HasDerivAt (w6MetricF a₀ a₁) (w6MetricFp a₀ a₁ z) z) ∧
    (∀ z : ℝ, 0 < z → HasDerivAt (w6MetricFp a₀ a₁) (w6MetricFpp a₀ a₁ z) z) ∧
    (∀ z : ℝ, 0 < z →
      HasDerivAt (fun t => w6MetricFp a₀ a₁ t / t)
        ((z * w6MetricFpp a₀ a₁ z - w6MetricFp a₀ a₁ z) / z ^ 2) z) ∧
    (∀ z : ℝ, 0 < z →
      z * w6MetricFpp a₀ a₁ z - w6MetricFp a₀ a₁ z = 2 * a₀ * z + 3 * a₁ * z ^ 2) ∧
    (0 ≤ a₀ → 0 ≤ a₁ → ∀ z : ℝ, 0 < z →
      0 ≤ z * w6MetricFpp a₀ a₁ z - w6MetricFp a₀ a₁ z) ∧
    (0 ≤ a₀ → 0 ≤ a₁ → ∀ z₁ z₂ : ℝ, 0 < z₁ → z₁ ≤ z₂ →
      w6MetricFp a₀ a₁ z₁ / z₁ ≤ w6MetricFp a₀ a₁ z₂ / z₂) ∧
    (w6MetricF a₀ a₁ 1 = 0 ∧
      w6MetricFp a₀ a₁ 1 = -2 + a₀ + a₁ ∧
      (0 ≤ a₀ → 0 ≤ a₁ → ∀ z : ℝ, 0 < z → z ≤ 1 →
        w6MetricF a₀ a₁ z ≤ 1 - z ^ 2)) := by
  have hDerivF : ∀ z : ℝ, 0 < z → HasDerivAt (w6MetricF a₀ a₁) (w6MetricFp a₀ a₁ z) z := by
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
    simp only [w6MetricFp, Nat.cast_ofNat, Nat.reduceSub, pow_one]
    field_simp [hzNe]
    ring
  have hDerivFp : ∀ z : ℝ, 0 < z → HasDerivAt (w6MetricFp a₀ a₁) (w6MetricFpp a₀ a₁ z) z := by
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
    simp only [w6MetricFpp, Nat.cast_ofNat, Nat.reduceSub, pow_one]
    field_simp [hzNe]
    ring
  have hDerivQ : ∀ z : ℝ, 0 < z →
      HasDerivAt (fun t => w6MetricFp a₀ a₁ t / t)
        ((z * w6MetricFpp a₀ a₁ z - w6MetricFp a₀ a₁ z) / z ^ 2) z := by
    intro z hz
    have hzNe : z ≠ 0 := ne_of_gt hz
    have hDiv := (hDerivFp z hz).div (hasDerivAt_id z) hzNe
    refine hDiv.congr_deriv ?_
    simp only [id_eq]
    ring
  have hNecEq : ∀ z : ℝ, 0 < z →
      z * w6MetricFpp a₀ a₁ z - w6MetricFp a₀ a₁ z = 2 * a₀ * z + 3 * a₁ * z ^ 2 := by
    intro z _
    simp only [w6MetricFp, w6MetricFpp]
    ring
  have hNecNonneg : 0 ≤ a₀ → 0 ≤ a₁ → ∀ z : ℝ, 0 < z →
      0 ≤ z * w6MetricFpp a₀ a₁ z - w6MetricFp a₀ a₁ z := by
    intro ha₀ ha₁ z hz
    rw [hNecEq z hz]
    positivity
  have hMonoQ : 0 ≤ a₀ → 0 ≤ a₁ → ∀ z₁ z₂ : ℝ, 0 < z₁ → z₁ ≤ z₂ →
      w6MetricFp a₀ a₁ z₁ / z₁ ≤ w6MetricFp a₀ a₁ z₂ / z₂ := by
    intro ha₀ ha₁ z₁ z₂ hz₁ hle
    have hz₂ : 0 < z₂ := lt_of_lt_of_le hz₁ hle
    have hq₁ : w6MetricFp a₀ a₁ z₁ / z₁ =
        -2 + a₀ * (2 * Real.log z₁ + 1) + a₁ * (3 * z₁ - 2) := by
      simp only [w6MetricFp]
      field_simp [ne_of_gt hz₁]
    have hq₂ : w6MetricFp a₀ a₁ z₂ / z₂ =
        -2 + a₀ * (2 * Real.log z₂ + 1) + a₁ * (3 * z₂ - 2) := by
      simp only [w6MetricFp]
      field_simp [ne_of_gt hz₂]
    have hLogLe : Real.log z₁ ≤ Real.log z₂ := Real.log_le_log hz₁ hle
    rw [hq₁, hq₂]
    nlinarith
  refine ⟨hDerivF, hDerivFp, hDerivQ, hNecEq, hNecNonneg, hMonoQ, ?_, ?_, ?_⟩
  · simp [w6MetricF, Real.log_one]
  · simp [w6MetricFp, Real.log_one]
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
    simp only [w6MetricF]
    linarith

end Vibe

end
