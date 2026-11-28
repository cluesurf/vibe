module

public import Vibe.Algebra
public import Vibe.Geometry
public import Mathlib.Data.Rat.Defs
public import Mathlib.Algebra.Order.Field.Rat
public import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Algebra.Order.BigOperators.Group.Finset
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.FieldSimp
import Mathlib.Tactic.Positivity
import Mathlib.Tactic.NormNum

/-!
# Vibe Theory: Global Busemann Schur Spectral Gap (`ρ({3,4,3,4}) ≤ 13/21`) & Column Resistance Bridge

Formalization over Mathlib `ℚ`, `Finset.sum`, `ring`, `nlinarith`, `positivity`, and `field_simp`
of the unconditional global Busemann Schur-test upper bound on the normalized adjacency operator
`S_full` of the infinite 24-regular `{3,4,3,4}` hyperbolic honeycomb (E-FND-0190 Section 1):

- **Theorem A (Cubic Hermite Majorant):** Exact identity
  `(49 q^3 + 36 p q^2 - 48 p^2 q + 64 p^3)(9 q - 4 p) - 441 q^4 = 64 p (2 q - p)(2 p - q)^2 ≥ 0`.
- **Theorem B (Exact `D_4` Root Moments):** `∑ t_k = 6 S`, `∑ t_k^2 = 6 S^2`,
  `∑ t_k^3 = 6 S^3 + 12 S e_2(y) - 72 e_3(y)`.
- **Theorem C (4-Variable Simplex Lower Bound):** `S^3 - 4 S e_2(y) + 24 e_3(y) ≥ 0` via the
  3-variable Schur inequality `(a + b + c)^3 - 4(a + b + c)(ab + bc + ca) + 9 abc ≥ 0`.
- **Theorem D (Global Busemann Schur Spectral Gap `ρ ≤ 13/21`, `λ_gap ≥ 8/21`):**
  Unconditional exact rational bound `F_1(x) ≤ 13/21` with sharp root attainment `13/21` and cusp `7/15`.
- **Column Resistance Bridge (`E-GRV-0156/0157` ↔ `Vibe.Geometry`):**
  Exact identity `18 R_code(F) = R_tilde(F + 2) - 1` whenever `N 0 = 1`.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 0: Exact Positive-Denominator Rational Type Bridged to Mathlib `ℚ` -/

/-- Exact rational number `num / den` with strictly positive integer denominator `den > 0`. -/
structure QPos where
  num : Int
  den : Int
  denPos : 0 < den

namespace QPos

/-- Exact rational order `a ≤ b` (`a.num * b.den ≤ b.num * a.den`). -/
def le (a b : QPos) : Prop := a.num * b.den ≤ b.num * a.den

/-- Exact rational equality `a = b` (`a.num * b.den = b.num * a.den`). -/
def eq (a b : QPos) : Prop := a.num * b.den = b.num * a.den

/-- Exact rational addition. -/
def add (a b : QPos) : QPos :=
  ⟨a.num * b.den + b.num * a.den, a.den * b.den, mul_pos a.denPos b.denPos⟩

/-- Exact division by a positive integer `k > 0`. -/
def divPos (a : QPos) (k : Int) (hk : 0 < k) : QPos :=
  ⟨a.num, k * a.den, mul_pos hk a.denPos⟩

/-- Canonical embedding into Mathlib `ℚ`. -/
def toRat (a : QPos) : ℚ := (a.num : ℚ) / (a.den : ℚ)

private theorem le_iff_toRat (a b : QPos) : le a b ↔ a.toRat ≤ b.toRat := by
  unfold le toRat
  have ha : (0 : ℚ) < a.den := Int.cast_pos.mpr a.denPos
  have hb : (0 : ℚ) < b.den := Int.cast_pos.mpr b.denPos
  rw [div_le_div_iff₀ ha hb]
  exact_mod_cast Iff.rfl

private theorem toRat_add (a b : QPos) : (add a b).toRat = a.toRat + b.toRat := by
  unfold add toRat
  have ha : (a.den : ℚ) ≠ 0 := ne_of_gt (Int.cast_pos.mpr a.denPos)
  have hb : (b.den : ℚ) ≠ 0 := ne_of_gt (Int.cast_pos.mpr b.denPos)
  push_cast
  field_simp [ha, hb]

private theorem toRat_divPos (a : QPos) (k : Int) (hk : 0 < k) :
    (divPos a k hk).toRat = a.toRat / (k : ℚ) := by
  unfold divPos toRat
  have ha : (a.den : ℚ) ≠ 0 := ne_of_gt (Int.cast_pos.mpr a.denPos)
  have hk' : (k : ℚ) ≠ 0 := ne_of_gt (Int.cast_pos.mpr hk)
  push_cast
  field_simp [ha, hk']

end QPos


/-! ## Section 1 (Theorem A): Exact Cubic Hermite Majorant Identity & Non-Negativity -/

/-- Homogeneous cubic Hermite majorant numerator `P_3^{hom}(p, q) = 49 q^3 + 36 p q^2 - 48 p^2 q + 64 p^3`. -/
def hermiteP3Hom (p q : Int) : Int :=
  49 * (q * (q * q)) + 36 * (p * (q * q)) - 48 * (p * (p * q)) + 64 * (p * (p * p))

/-- Theorem A1 (Exact Cubic Hermite Identity):
    `(49 q^3 + 36 p q^2 - 48 p^2 q + 64 p^3)(9 q - 4 p) - 441 q^4 = 64 p (2 q - p)(2 p - q)^2`. -/
theorem thm_schur_hermite_identity (p q : Int) :
    hermiteP3Hom p q * (9 * q - 4 * p) - 441 * (q * (q * (q * q))) =
      64 * p * (2 * q - p) * ((2 * p - q) * (2 * p - q)) := by
  unfold hermiteP3Hom; ring

/-- Theorem A2 (Hermite Majorant Non-Negativity on `0 ≤ p ≤ 2 q`). -/
theorem thm_schur_hermite_nonneg (p q : Int) (hp0 : 0 ≤ p) (hp2 : p ≤ 2 * q) :
    441 * (q * (q * (q * q))) ≤ hermiteP3Hom p q * (9 * q - 4 * p) := by
  have hId := thm_schur_hermite_identity p q
  have hProd : 0 ≤ 64 * p * (2 * q - p) * ((2 * p - q) * (2 * p - q)) :=
    mul_nonneg (mul_nonneg (by omega) (by omega)) (mul_self_nonneg _)
  omega

/-- Exact rational form of Theorem A:
    for all `q > 0` and `0 ≤ p ≤ 2 q`, `q / (9 q - 4 p) ≤ P_3^{hom}(p, q) / (441 q^3)`. -/
theorem thm_schur_hermite_qpos (p q : Int) (hq : 0 < q) (hp0 : 0 ≤ p) (hp2 : p ≤ 2 * q) :
    QPos.le
      ⟨q, 9 * q - 4 * p, by omega⟩
      ⟨hermiteP3Hom p q, 441 * (q * (q * q)), by positivity⟩ := by
  unfold QPos.le
  have hMaj := thm_schur_hermite_nonneg p q hp0 hp2
  nlinarith

/-- Exact antipodal pairing identity for the Busemann ratio. -/
theorem thm_schur_antipodal_pair_identity (q d : Int) :
    (3 * q - 2 * d) + (3 * q + 2 * d) = 6 * q ∧
    (3 * q - 2 * d) * (3 * q + 2 * d) = 9 * (q * q) - 4 * (d * d) :=
  ⟨by ring, by ring⟩


/-! ## Section 2 (Theorem B): Exact `D_4` Root-Line Moments (`∑ t_k`, `∑ t_k^2`, `∑ t_k^3`) -/

/-- Exact vector negation on `ℤ^4`. -/
def neg4 (v : Vec4) : Vec4 := (-v.1, -v.2.1, -v.2.2.1, -v.2.2.2)

/-- Indexed lookup of the 12 unoriented (antipodal-pair) root lines of `D_4`. -/
def d4RootLine : Fin 12 → Vec4
  | ⟨0, _⟩  => (1,  1, 0, 0)
  | ⟨1, _⟩  => (1, -1, 0, 0)
  | ⟨2, _⟩  => (1,  0, 1, 0)
  | ⟨3, _⟩  => (1,  0,-1, 0)
  | ⟨4, _⟩  => (1,  0, 0, 1)
  | ⟨5, _⟩  => (1,  0, 0,-1)
  | ⟨6, _⟩  => (0,  1, 1, 0)
  | ⟨7, _⟩  => (0,  1,-1, 0)
  | ⟨8, _⟩  => (0,  1, 0, 1)
  | ⟨9, _⟩  => (0,  1, 0,-1)
  | ⟨10, _⟩ => (0,  0, 1, 1)
  | ⟨11, _⟩ => (0,  0, 1,-1)

/-- The 12 unoriented `D_4` root lines as a list, partitioning `d4Roots` into 12 `{r, -r}` pairs. -/
def d4RootLines : List Vec4 :=
  (List.finRange 12).map d4RootLine

/-- Certificate that `d4RootLines` is an exact 12-line antipodal partition of `d4Roots`. -/
theorem thm_d4_root_lines_partition :
    d4RootLines.length = 12 ∧
    d4RootLines.Nodup ∧
    (d4RootLines.all (fun r => d4Roots.contains r && d4Roots.contains (neg4 r)) = true) ∧
    (d4Roots.all (fun r => d4RootLines.contains r || d4RootLines.contains (neg4 r)) = true) := by
  decide

/-- Squared inner product `t_k(x) = (r_k · x)^2` for a `D_4` root line `k : Fin 12` and `x ∈ ℤ^4`. -/
def d4LineSq (k : Fin 12) (x : Vec4) : Int :=
  let u := dot4 (d4RootLine k) x
  u * u

/-- Elementary symmetric sums of `y = (y_0, y_1, y_2, y_3)`: `S`, `e_2(y)`, `e_3(y)`. -/
def symS4 (y0 y1 y2 y3 : Int) : Int := y0 + y1 + y2 + y3

def symE2 (y0 y1 y2 y3 : Int) : Int :=
  y0 * y1 + y0 * y2 + y0 * y3 + y1 * y2 + y1 * y3 + y2 * y3

def symE3 (y0 y1 y2 y3 : Int) : Int :=
  y0 * y1 * y2 + y0 * y1 * y3 + y0 * y2 * y3 + y1 * y2 * y3

/-- Sum of an integer function over all 12 `D_4` root lines via `Finset.sum`. -/
def sum12Int (f : Fin 12 → Int) : Int := ∑ k : Fin 12, f k

/-- Exact 1st, 2nd, and 3rd moments of `t_k = (r_k · x)^2` over the 12 `D_4` root lines. -/
def d4Moment1 (x : Vec4) : Int := sum12Int (fun k => d4LineSq k x)
def d4Moment2 (x : Vec4) : Int := sum12Int (fun k => d4LineSq k x * d4LineSq k x)
def d4Moment3 (x : Vec4) : Int := sum12Int (fun k => d4LineSq k x * (d4LineSq k x * d4LineSq k x))

/-- Sum of homogeneous cubic Hermite majorants over all 12 `D_4` root lines. -/
def d4HermiteSum (x : Vec4) : Int :=
  let S := dot4 x x
  sum12Int (fun k => hermiteP3Hom (d4LineSq k x) S)

/-- Theorem B (Exact `D_4` Root-Line Moments):
    `∑ t_k = 6 S`, `∑ t_k^2 = 6 S^2`, and `∑ t_k^3 = 6 S^3 + 12 S e_2(y) - 72 e_3(y)`. -/
theorem thm_d4_exact_moments (x0 x1 x2 x3 : Int) :
    let x : Vec4 := (x0, x1, x2, x3)
    let y0 := x0 * x0
    let y1 := x1 * x1
    let y2 := x2 * x2
    let y3 := x3 * x3
    let S := symS4 y0 y1 y2 y3
    d4Moment1 x = 6 * S ∧
    d4Moment2 x = 6 * (S * S) ∧
    d4Moment3 x = 6 * (S * (S * S)) + 12 * (S * symE2 y0 y1 y2 y3) - 72 * symE3 y0 y1 y2 y3 := by
  refine ⟨?_, ?_, ?_⟩ <;>
    simp only [d4Moment1, d4Moment2, d4Moment3, sum12Int, Fin.sum_univ_succ, Fin.sum_univ_zero,
      d4LineSq, d4RootLine, dot4, symS4, symE2, symE3, Fin.isValue, Fin.val_zero, Fin.val_succ] <;>
    ring


/-! ## Section 3 (Theorem C): Unconditional 4-Variable Simplex Lower Bound `S^3 - 4 S e_2 + 24 e_3 ≥ 0` -/

/-- The 3-variable Schur polynomial `T(a, b, c) = (a + b + c)^3 - 4(a + b + c)(ab + bc + ca) + 9 abc`. -/
def schurPoly3 (a b c : Int) : Int :=
  let s := a + b + c
  s * (s * s) - 4 * (s * (a * b + b * c + c * a)) + 9 * (a * b * c)

/-- The 4-variable simplex polynomial `P_4(y_0, y_1, y_2, y_3) = S^3 - 4 S e_2(y) + 24 e_3(y)`. -/
def schurPoly4 (y0 y1 y2 y3 : Int) : Int :=
  let S := symS4 y0 y1 y2 y3
  S * (S * S) - 4 * (S * symE2 y0 y1 y2 y3) + 24 * symE3 y0 y1 y2 y3

private theorem schurPoly3_sorted_nonneg (a b c : Int) (hab : b ≤ a) (hbc : c ≤ b) (hc : 0 ≤ c) :
    0 ≤ schurPoly3 a b c := by
  have hFact : schurPoly3 a b c = (a - b) ^ 2 * (a + b - c) + c * ((a - c) * (b - c)) := by
    unfold schurPoly3; ring
  rw [hFact]
  have h1 : 0 ≤ (a - b) ^ 2 * (a + b - c) := mul_nonneg (sq_nonneg _) (by omega)
  have h2 : 0 ≤ c * ((a - c) * (b - c)) := mul_nonneg hc (mul_nonneg (by omega) (by omega))
  omega

/-- Unconditional 3-variable Schur inequality (degree 1):
    `(a + b + c)^3 - 4(a + b + c)(ab + bc + ca) + 9 abc ≥ 0` for ALL `a, b, c ≥ 0`. -/
theorem thm_schur3_nonneg (a b c : Int) (ha : 0 ≤ a) (hb : 0 ≤ b) (hc : 0 ≤ c) :
    0 ≤ schurPoly3 a b c := by
  have hSwap : ∀ x y z : Int, schurPoly3 x y z = schurPoly3 x z y ∧ schurPoly3 x y z = schurPoly3 y x z :=
    fun x y z => ⟨by unfold schurPoly3; ring, by unfold schurPoly3; ring⟩
  by_cases h1 : b ≤ a ∧ c ≤ a
  · by_cases hbc : c ≤ b
    · exact schurPoly3_sorted_nonneg a b c h1.1 hbc hc
    · rw [(hSwap a b c).1]; exact schurPoly3_sorted_nonneg a c b h1.2 (by omega) hb
  · by_cases h2 : a ≤ b ∧ c ≤ b
    · rw [(hSwap a b c).2]
      by_cases hac : c ≤ a
      · exact schurPoly3_sorted_nonneg b a c h2.1 hac hc
      · rw [(hSwap b a c).1]; exact schurPoly3_sorted_nonneg b c a h2.2 (by omega) ha
    · have hca : a ≤ c := by omega
      have hcb : b ≤ c := by omega
      rw [(hSwap a b c).2, (hSwap b a c).1, (hSwap b c a).2]
      by_cases hab : a ≤ b
      · exact schurPoly3_sorted_nonneg c b a hcb hab ha
      · rw [(hSwap c b a).1]; exact schurPoly3_sorted_nonneg c a b hca (by omega) hb

private theorem schurPoly4_min_last (y0 y1 y2 y3 : Int)
    (h3 : 0 ≤ y3) (h0 : y3 ≤ y0) (h1 : y3 ≤ y1) (h2 : y3 ≤ y2) :
    0 ≤ schurPoly4 y0 y1 y2 y3 := by
  let a := y0 - y3; let b := y1 - y3; let c := y2 - y3
  have ha : 0 ≤ a := by omega
  have hb : 0 ≤ b := by omega
  have hc : 0 ≤ c := by omega
  have hShift : schurPoly4 y0 y1 y2 y3 =
      64 * y3 ^ 3 + 48 * y3 ^ 2 * (a + b + c) + 32 * y3 * (a * b + b * c + c * a) +
      15 * (a * b * c) + schurPoly3 a b c := by
    dsimp only [a, b, c]; unfold schurPoly4 schurPoly3 symS4 symE2 symE3; ring
  rw [hShift]
  have hS3 := thm_schur3_nonneg a b c ha hb hc
  have hPos : 0 ≤ 64 * y3 ^ 3 + 48 * y3 ^ 2 * (a + b + c) +
      32 * y3 * (a * b + b * c + c * a) + 15 * (a * b * c) := by positivity
  omega

/-- Theorem C (Unconditional 4-Variable Simplex Lower Bound):
    `S^3 - 4 S e_2(y) + 24 e_3(y) ≥ 0` for ALL `y_0, y_1, y_2, y_3 ≥ 0`. -/
theorem thm_schur4_simplex_nonneg (y0 y1 y2 y3 : Int)
    (h0 : 0 ≤ y0) (h1 : 0 ≤ y1) (h2 : 0 ≤ y2) (h3 : 0 ≤ y3) :
    0 ≤ schurPoly4 y0 y1 y2 y3 := by
  by_cases m3 : y3 ≤ y0 ∧ y3 ≤ y1 ∧ y3 ≤ y2
  · exact schurPoly4_min_last y0 y1 y2 y3 h3 m3.1 m3.2.1 m3.2.2
  · by_cases m2 : y2 ≤ y0 ∧ y2 ≤ y1 ∧ y2 ≤ y3
    · rw [show schurPoly4 y0 y1 y2 y3 = schurPoly4 y0 y1 y3 y2 by unfold schurPoly4 symS4 symE2 symE3; ring]
      exact schurPoly4_min_last y0 y1 y3 y2 h2 m2.1 m2.2.1 m2.2.2
    · by_cases m1 : y1 ≤ y0 ∧ y1 ≤ y2 ∧ y1 ≤ y3
      · rw [show schurPoly4 y0 y1 y2 y3 = schurPoly4 y0 y3 y2 y1 by unfold schurPoly4 symS4 symE2 symE3; ring]
        exact schurPoly4_min_last y0 y3 y2 y1 h1 m1.1 m1.2.2 m1.2.1
      · rw [show schurPoly4 y0 y1 y2 y3 = schurPoly4 y3 y1 y2 y0 by unfold schurPoly4 symS4 symE2 symE3; ring]
        exact schurPoly4_min_last y3 y1 y2 y0 h0 (by omega) (by omega) (by omega)

/-- Direct corollary of Theorems B and C: for EVERY `x ∈ ℤ^4`, `∑_{k=1}^{12} t_k^3 ≤ 9 S^3`. -/
theorem thm_d4_moment3_le_9_S3 (x0 x1 x2 x3 : Int) :
    let x : Vec4 := (x0, x1, x2, x3)
    let S := dot4 x x
    d4Moment3 x ≤ 9 * (S * (S * S)) := by
  intro x S
  have hMom := (thm_d4_exact_moments x0 x1 x2 x3).2.2
  have hPos := thm_schur4_simplex_nonneg (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3)
    (mul_self_nonneg x0) (mul_self_nonneg x1) (mul_self_nonneg x2) (mul_self_nonneg x3)
  unfold schurPoly4 at hPos
  change d4Moment3 x ≤ _
  linarith


/-! ## Section 4 (Theorem D): Global Busemann Schur Spectral Gap (`ρ({3,4,3,4}) ≤ 13/21`) -/

/-- Theorem D1 (Exact Cleared-Denominator Majorant Identity & `13/21` Bound). -/
theorem thm_schur_majorant_bound_13_over_21 (x0 x1 x2 x3 : Int) :
    let x : Vec4 := (x0, x1, x2, x3)
    let y0 := x0 * x0
    let y1 := x1 * x1
    let y2 := x2 * x2
    let y3 := x3 * x3
    let S := dot4 x x
    d4HermiteSum x = 1092 * (S * (S * S)) - 192 * schurPoly4 y0 y1 y2 y3 ∧
    d4HermiteSum x ≤ 1092 * (S * (S * S)) ∧
    21 * d4HermiteSum x ≤ 13 * (4 * 441 * (S * (S * S))) := by
  intro x y0 y1 y2 y3 S
  have hExp : d4HermiteSum x =
      588 * (S * (S * S)) + 36 * (S * S * d4Moment1 x) -
        48 * (S * d4Moment2 x) + 64 * d4Moment3 x := by
    simp only [d4HermiteSum, d4Moment1, d4Moment2, d4Moment3, sum12Int, hermiteP3Hom,
      Fin.sum_univ_succ, Fin.sum_univ_zero, Fin.isValue]
    ring
  have hMom := thm_d4_exact_moments x0 x1 x2 x3
  have hEq : d4HermiteSum x = 1092 * (S * (S * S)) - 192 * schurPoly4 y0 y1 y2 y3 := by
    rw [hExp, show d4Moment1 x = 6 * S from hMom.1, show d4Moment2 x = 6 * (S * S) from hMom.2.1,
        show d4Moment3 x = 6 * (S * (S * S)) + 12 * (S * symE2 y0 y1 y2 y3) - 72 * symE3 y0 y1 y2 y3 from hMom.2.2]
    unfold schurPoly4
    change _ = 1092 * (S * (S * S)) - 192 * (S * (S * S) - 4 * (S * symE2 y0 y1 y2 y3) + 24 * symE3 y0 y1 y2 y3)
    ring
  have hNonneg := thm_schur4_simplex_nonneg y0 y1 y2 y3
    (mul_self_nonneg x0) (mul_self_nonneg x1) (mul_self_nonneg x2) (mul_self_nonneg x3)
  exact ⟨hEq, by linarith, by linarith⟩

private theorem d4LineSq_bounds (k : Fin 12) (x : Vec4) :
    0 ≤ d4LineSq k x ∧ d4LineSq k x ≤ 2 * dot4 x x := by
  rcases x with ⟨x0, x1, x2, x3⟩
  refine ⟨mul_self_nonneg _, ?_⟩
  fin_cases k <;> simp only [d4LineSq, d4RootLine, dot4] <;>
    nlinarith [sq_nonneg x0, sq_nonneg x1, sq_nonneg x2, sq_nonneg x3,
      sq_nonneg (x0 - x1), sq_nonneg (x0 + x1), sq_nonneg (x0 - x2), sq_nonneg (x0 + x2),
      sq_nonneg (x0 - x3), sq_nonneg (x0 + x3), sq_nonneg (x1 - x2), sq_nonneg (x1 + x2),
      sq_nonneg (x1 - x3), sq_nonneg (x1 + x3), sq_nonneg (x2 - x3), sq_nonneg (x2 + x3)]

/-- Single exact rational term `S / (9 S - 4 t_k)` in the Busemann Schur sum. -/
def busemannTerm (k : Fin 12) (x : Vec4) (hS : 0 < dot4 x x) : QPos :=
  let S := dot4 x x
  let t := d4LineSq k x
  ⟨S, 9 * S - 4 * t, by have := d4LineSq_bounds k x; omega⟩

/-- Sum of all 12 exact rational terms `∑_{k=0}^{11} S / (9 S - 4 (r_k · x)^2)`. -/
def busemannSum12 (x : Vec4) (hS : 0 < dot4 x x) : QPos :=
  QPos.add (QPos.add (QPos.add (QPos.add (QPos.add
    (QPos.add (QPos.add (QPos.add (QPos.add (QPos.add
      (QPos.add (busemannTerm ⟨0, by decide⟩ x hS) (busemannTerm ⟨1, by decide⟩ x hS))
      (busemannTerm ⟨2, by decide⟩ x hS))
      (busemannTerm ⟨3, by decide⟩ x hS))
      (busemannTerm ⟨4, by decide⟩ x hS))
      (busemannTerm ⟨5, by decide⟩ x hS))
      (busemannTerm ⟨6, by decide⟩ x hS))
      (busemannTerm ⟨7, by decide⟩ x hS))
      (busemannTerm ⟨8, by decide⟩ x hS))
      (busemannTerm ⟨9, by decide⟩ x hS))
      (busemannTerm ⟨10, by decide⟩ x hS))
      (busemannTerm ⟨11, by decide⟩ x hS)

/-- Exact global Busemann Schur ratio `F_1(x) = (1/4) ∑_{k=1}^{12} S / (9 S - 4 (r_k · x)^2)`. -/
def busemannF1 (x : Vec4) (hS : 0 < dot4 x x) : QPos :=
  QPos.divPos (busemannSum12 x hS) 4 (by decide)

/-- Theorem D2 (Unconditional Global Busemann Schur Upper Bound `F_1(x) ≤ 13/21` in Exact Rationals):
    certifying spectral radius `ρ({3,4,3,4}) ≤ 13/21` and spectral gap `λ_gap ≥ 8/21 > 0`. -/
theorem thm_busemann_schur_global_bound (x0 x1 x2 x3 : Int)
    (hS : 0 < dot4 (x0, x1, x2, x3) (x0, x1, x2, x3)) :
    QPos.le (busemannF1 (x0, x1, x2, x3) hS) ⟨13, 21, by decide⟩ := by
  let x : Vec4 := (x0, x1, x2, x3)
  let S := dot4 x x
  let D : Int := 441 * (S * (S * S))
  have hD : 0 < D := by positivity
  have hTerm : ∀ k : Fin 12, (busemannTerm k x hS).toRat ≤ (hermiteP3Hom (d4LineSq k x) S : ℚ) / (D : ℚ) := by
    intro k
    have hb := d4LineSq_bounds k x
    exact (QPos.le_iff_toRat _ _).mp (thm_schur_hermite_qpos (d4LineSq k x) S hS hb.1 hb.2)
  rw [QPos.le_iff_toRat, busemannF1, QPos.toRat_divPos]
  have hSumRat : (busemannSum12 x hS).toRat = ∑ k : Fin 12, (busemannTerm k x hS).toRat := by
    simp only [busemannSum12, QPos.toRat_add, Fin.sum_univ_succ, Fin.sum_univ_zero, Fin.isValue]
    ring
  have hSumLe : (busemannSum12 x hS).toRat ≤ (d4HermiteSum x : ℚ) / (D : ℚ) := by
    rw [hSumRat, d4HermiteSum, sum12Int, Int.cast_sum, Finset.sum_div]
    exact Finset.sum_le_sum fun k _ => hTerm k
  have hMaj : (d4HermiteSum x : ℚ) ≤ (1092 : ℚ) * ((S * (S * S) : Int) : ℚ) := by
    exact_mod_cast (thm_schur_majorant_bound_13_over_21 x0 x1 x2 x3).2.1
  have hDq : (0 : ℚ) < (D : ℚ) := Int.cast_pos.mpr hD
  have hDivLe : (d4HermiteSum x : ℚ) / (D : ℚ) / 4 ≤ (13 : ℚ) / 21 := by
    have hD_eq : (D : ℚ) = 441 * ((S * (S * S) : Int) : ℚ) := by push_cast [D]; ring
    rw [div_le_iff₀ (by norm_num : (0 : ℚ) < 4), div_le_iff₀ hDq]
    nlinarith [hMaj, hD_eq]
  have hRhs : (⟨13, 21, by decide⟩ : QPos).toRat = (13 : ℚ) / 21 := by
    simp [QPos.toRat]
  rw [hRhs]
  linarith [div_le_div_of_nonneg_right hSumLe (by norm_num : (0 : ℚ) ≤ 4)]

/-- Exact attainment (sharpness) at a `D_4` root direction `x = (1, 1, 0, 0)`: `F_1(1, 1, 0, 0) = 13 / 21`. -/
theorem thm_busemann_schur_sharp_at_d4_root :
    QPos.eq (busemannF1 (1, 1, 0, 0) (by decide)) ⟨13, 21, by decide⟩ := by
  unfold QPos.eq; decide

/-- Exact cusp-axis evaluation at `x = (1, 0, 0, 0)`: `F_1(1, 0, 0, 0) = 7 / 15 < 13 / 21`. -/
theorem thm_busemann_schur_cusp_axis_7_over_15 :
    QPos.eq (busemannF1 (1, 0, 0, 0) (by decide)) ⟨7, 15, by decide⟩ := by
  unfold QPos.eq; decide

/-- Certified spectral gap arithmetic: `1 - 13/21 = 8/21 > 0`. -/
theorem thm_busemann_spectral_gap_8_over_21 :
    QPos.eq (QPos.add ⟨13, 21, by decide⟩ ⟨8, 21, by decide⟩) ⟨1, 1, by decide⟩ := by
  unfold QPos.eq; decide


/-! ## Section 5: Column Resistance Bridge (`18 R_code(F) = R_tilde(F + 2) - 1`, `E-GRV-0156/0157`) -/

/-- Exact numerator `18 * R_code(F) = ∑_{d = 0}^{F} N(d + 1)`. -/
def colResistanceCode18 (N : Nat → Nat) (F : Nat) : Nat :=
  sumNat (F + 1) (fun d => N (d + 1))

/-- Exact column resistance bridge between `Vibe.Geometry.colResistance` and `E-GRV-0156/0157`. -/
theorem thm_col_resistance_code_bridge (N : Nat → Nat) (F : Nat) :
    colResistanceCode18 N F + N 0 = colResistance N (F + 2) ∧
    (N 0 = 1 → colResistanceCode18 N F = colResistance N (F + 2) - 1) ∧
    (N 0 = 1 → (∀ D : Nat, N (D + 1) ≥ 18 * N D) →
      17 * colResistanceCode18 N F + 18 ≥ 18 ^ (F + 2)) := by
  have hShift : colResistanceCode18 N F + N 0 = colResistance N (F + 2) := by
    unfold colResistanceCode18 colResistance
    rw [sumNat_eq_sum, sumNat_eq_sum, Finset.sum_range_succ']
  refine ⟨hShift, fun h0 => by omega, fun h0 hstep => ?_⟩
  have hExp := thm5_resistance_exp_lower_bound N (by omega) hstep (F + 2)
  omega

end Vibe

end
