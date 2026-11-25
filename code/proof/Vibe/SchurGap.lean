import Vibe.Algebra
import Vibe.Geometry

/-!
# Vibe Theory: Global Busemann Schur Spectral Gap (`ρ({3,4,3,4}) ≤ 13/21`) & Column Resistance Bridge

Zero-dependency Lean 4 formalization of the unconditional global Busemann Schur-test
upper bound on the normalized adjacency operator `S_full` of the infinite 24-regular
`{3,4,3,4}` hyperbolic honeycomb (E-FND-0190 Section 1, roadmap `vibe-roadmap-board-0053`):

- **Theorem A (Cubic Hermite Majorant):** Exact cleared-denominator identity
  `(49 q^3 + 36 p q^2 - 48 p^2 q + 64 p^3)(9 q - 4 p) - 441 q^4 = 64 p (2 q - p)(2 p - q)^2 ≥ 0`
  for all `0 ≤ p ≤ 2 q`, certifying `1 / (9 - 4 t) ≤ P_3(t)` on `[0, 2]`.
- **Theorem B (Exact `D_4` Root Moments):** For the 12 antipodal root lines `{r_k}_{k=1}^{12}`
  of `D_4` and ANY `x = (x_0, x_1, x_2, x_3) ∈ ℤ^4` with `y_i = x_i^2`, `S = ∑ y_i`, `t_k = (r_k · x)^2`:
  `∑ t_k = 6 S`, `∑ t_k^2 = 6 S^2` (rank-4 isotropy), and `∑ t_k^3 = 6 S^3 + 12 S e_2(y) - 72 e_3(y)`.
- **Theorem C (4-Variable Simplex Lower Bound):** For ALL `y_0, y_1, y_2, y_3 ≥ 0`,
  `S^3 - 4 S e_2(y) + 24 e_3(y) ≥ 0`, proved via exact minimum-shift reduction to the
  3-variable Schur inequality `(a + b + c)^3 - 4(a + b + c)(ab + bc + ca) + 9 abc ≥ 0`.
- **Theorem D (Global Busemann Schur Spectral Gap `ρ ≤ 13/21`, `λ_gap ≥ 8/21`):**
  Combines Theorems A, B, and C to prove unconditionally for ALL `x ∈ ℤ^4 \ {0}` both the
  cleared-denominator majorant bound `21 * ∑ P_3^{hom}(t_k, S) ≤ 13 * (4 * 441 * S^3)` AND the
  exact rational bound `F_1(x) = (1/4) ∑_{k=1}^{12} S / (9 S - 4 t_k) ≤ 13/21`, with exact
  sharpness `F_1(1, 1, 0, 0) = 13/21` and cusp value `F_1(1, 0, 0, 0) = 7/15`.
- **Column Resistance Bridge (`E-GRV-0156/0157` ↔ `Vibe.Geometry`):**
  Exact identity `18 R_code(F) = R_tilde(F + 2) - 1` for all `F : Nat` whenever `N 0 = 1`.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Elementary Integer & Positive-Denominator Rational Infrastructure -/

private theorem int_mul_left_comm (a b c : Int) : a * (b * c) = b * (a * c) := by
  rw [← Int.mul_assoc, Int.mul_comm a b, Int.mul_assoc]

private theorem int_mul_right_comm (a b c : Int) : (a * b) * c = (a * c) * b := by
  rw [Int.mul_assoc, Int.mul_comm b c, ← Int.mul_assoc]

private theorem int_mul_pos (a b : Int) (ha : 0 < a) (hb : 0 < b) : 0 < a * b := by
  have h : 0 ≤ (a - 1) * (b - 1) := Int.mul_nonneg (by omega) (by omega)
  rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.one_mul, Int.mul_one] at h
  omega

private theorem int_mul_le_mul_of_nonneg_right (a b c : Int) (hab : a ≤ b) (hc : 0 ≤ c) :
    a * c ≤ b * c := by
  have h : 0 ≤ (b - a) * c := Int.mul_nonneg (by omega) hc
  rw [Int.sub_mul] at h
  omega

private theorem int_le_of_mul_le_mul_right (x y d : Int) (hd : 0 < d) (h : x * d ≤ y * d) :
    x ≤ y := by
  if hxy : x ≤ y then
    exact hxy
  else
    have hpos : 0 < (x - y) * d := int_mul_pos (x - y) d (by omega) hd
    rw [Int.sub_mul] at hpos
    omega

private theorem int_add_sq (a b : Int) :
    (a + b) * (a + b) = a * a + 2 * (a * b) + b * b := by
  rw [Int.add_mul, Int.mul_add, Int.mul_add, Int.mul_comm b a]
  omega

private theorem int_sub_sq (a b : Int) :
    (a - b) * (a - b) = a * a - 2 * (a * b) + b * b := by
  rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.mul_comm b a]
  omega

private theorem int_two_sq_add_le (x y : Int) :
    (x + y) * (x + y) ≤ 2 * (x * x + y * y) := by
  have h0 : 0 ≤ (x - y) * (x - y) := int_sq_nonneg (x - y)
  rw [int_sub_sq] at h0
  rw [int_add_sq]
  omega

private theorem int_two_sq_sub_le (x y : Int) :
    (x - y) * (x - y) ≤ 2 * (x * x + y * y) := by
  have h0 : 0 ≤ (x + y) * (x + y) := int_sq_nonneg (x + y)
  rw [int_add_sq] at h0
  rw [int_sub_sq]
  omega

private theorem int_sq_mul_sq (x y : Int) :
    (x * y) * (x * y) = (x * x) * (y * y) := by
  calc
    (x * y) * (x * y) = x * (y * (x * y)) := Int.mul_assoc x y (x * y)
    _ = x * ((y * x) * y) := by rw [← Int.mul_assoc y x y]
    _ = x * ((x * y) * y) := by rw [Int.mul_comm y x]
    _ = x * (x * (y * y)) := by rw [Int.mul_assoc x y y]
    _ = (x * x) * (y * y) := (Int.mul_assoc x x (y * y)).symm

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
  ⟨a.num * b.den + b.num * a.den, a.den * b.den, int_mul_pos a.den b.den a.denPos b.denPos⟩

/-- Exact division by a positive integer `k > 0`. -/
def divPos (a : QPos) (k : Int) (hk : 0 < k) : QPos :=
  ⟨a.num, k * a.den, int_mul_pos k a.den hk a.denPos⟩

private theorem le_trans {a b c : QPos} (hab : le a b) (hbc : le b c) : le a c := by
  unfold le at hab hbc ⊢
  have h1 : (a.num * b.den) * c.den ≤ (b.num * a.den) * c.den :=
    int_mul_le_mul_of_nonneg_right _ _ c.den hab (by have := c.denPos; omega)
  have h2 : (b.num * c.den) * a.den ≤ (c.num * b.den) * a.den :=
    int_mul_le_mul_of_nonneg_right _ _ a.den hbc (by have := a.denPos; omega)
  have hL : (a.num * b.den) * c.den = (a.num * c.den) * b.den := int_mul_right_comm a.num b.den c.den
  have hM : (b.num * a.den) * c.den = (b.num * c.den) * a.den := int_mul_right_comm b.num a.den c.den
  have hR : (c.num * b.den) * a.den = (c.num * a.den) * b.den := int_mul_right_comm c.num b.den a.den
  rw [hL, hM] at h1
  rw [hR] at h2
  exact int_le_of_mul_le_mul_right (a.num * c.den) (c.num * a.den) b.den b.denPos (by omega)

private theorem le_of_eq {a b : QPos} (h : eq a b) : le a b := by
  unfold eq at h
  unfold le
  omega

private theorem add_le_add {a b c d : QPos} (hab : le a b) (hcd : le c d) :
    le (add a c) (add b d) := by
  unfold le at hab hcd ⊢
  unfold add
  have hcdPos : 0 ≤ c.den * d.den := Int.mul_nonneg (by have := c.denPos; omega) (by have := d.denPos; omega)
  have habPos : 0 ≤ a.den * b.den := Int.mul_nonneg (by have := a.denPos; omega) (by have := b.denPos; omega)
  have h1 : (a.num * b.den) * (c.den * d.den) ≤ (b.num * a.den) * (c.den * d.den) :=
    int_mul_le_mul_of_nonneg_right _ _ _ hab hcdPos
  have h2 : (c.num * d.den) * (a.den * b.den) ≤ (d.num * c.den) * (a.den * b.den) :=
    int_mul_le_mul_of_nonneg_right _ _ _ hcd habPos
  have hA : (a.num * c.den) * (b.den * d.den) = (a.num * b.den) * (c.den * d.den) := by
    rw [Int.mul_assoc a.num c.den (b.den * d.den), ← Int.mul_assoc c.den b.den d.den,
        Int.mul_comm c.den b.den, Int.mul_assoc b.den c.den d.den, ← Int.mul_assoc a.num b.den (c.den * d.den)]
  have hB : (c.num * a.den) * (b.den * d.den) = (c.num * d.den) * (a.den * b.den) := by
    rw [Int.mul_assoc c.num a.den (b.den * d.den), Int.mul_comm b.den d.den,
        ← Int.mul_assoc a.den d.den b.den, Int.mul_comm a.den d.den,
        Int.mul_assoc d.den a.den b.den, ← Int.mul_assoc c.num d.den (a.den * b.den)]
  have hC : (b.num * d.den) * (a.den * c.den) = (b.num * a.den) * (c.den * d.den) := by
    rw [Int.mul_assoc b.num d.den (a.den * c.den), ← Int.mul_assoc d.den a.den c.den,
        Int.mul_comm d.den a.den, Int.mul_assoc a.den d.den c.den, Int.mul_comm d.den c.den,
        ← Int.mul_assoc b.num a.den (c.den * d.den)]
  have hD : (d.num * b.den) * (a.den * c.den) = (d.num * c.den) * (a.den * b.den) := by
    rw [Int.mul_assoc d.num b.den (a.den * c.den), Int.mul_comm a.den c.den,
        ← Int.mul_assoc b.den c.den a.den, Int.mul_comm b.den c.den,
        Int.mul_assoc c.den b.den a.den, Int.mul_comm b.den a.den,
        ← Int.mul_assoc d.num c.den (a.den * b.den)]
  rw [Int.add_mul, Int.add_mul, hA, hB, hC, hD]
  omega

private theorem add_same_den_eq (x y d : Int) (hd : 0 < d) :
    eq (add ⟨x, d, hd⟩ ⟨y, d, hd⟩) ⟨x + y, d, hd⟩ := by
  unfold eq add
  rw [← Int.add_mul, Int.mul_assoc]

private theorem add_same_den_le_right {a b : QPos} {x y d : Int} (hd : 0 < d)
    (ha : le a ⟨x, d, hd⟩) (hb : le b ⟨y, d, hd⟩) :
    le (add a b) ⟨x + y, d, hd⟩ :=
  le_trans (add_le_add ha hb) (le_of_eq (add_same_den_eq x y d hd))

private theorem divPos_le {a b : QPos} (k : Int) (hk : 0 < k) (h : le a b) :
    le (divPos a k hk) (divPos b k hk) := by
  unfold le at h
  change a.num * (k * b.den) ≤ b.num * (k * a.den)
  rw [int_mul_left_comm a.num k b.den, int_mul_left_comm b.num k a.den]
  rw [Int.mul_comm k (a.num * b.den), Int.mul_comm k (b.num * a.den)]
  exact int_mul_le_mul_of_nonneg_right _ _ k h (by omega)

end QPos


/-! ## Section 1 (Theorem A): Exact Cubic Hermite Majorant Identity & Non-Negativity -/

/-- Homogeneous cubic Hermite majorant numerator `P_3^{hom}(p, q) = 49 q^3 + 36 p q^2 - 48 p^2 q + 64 p^3`. -/
def hermiteP3Hom (p q : Int) : Int :=
  49 * (q * (q * q)) + 36 * (p * (q * q)) - 48 * (p * (p * q)) + 64 * (p * (p * p))

/-- Theorem A1 (Exact Cubic Hermite Identity):
    for ALL integers `p, q : Int`,
    `(49 q^3 + 36 p q^2 - 48 p^2 q + 64 p^3)(9 q - 4 p) - 441 q^4 = 64 p (2 q - p)(2 p - q)^2`. -/
theorem thm_schur_hermite_identity (p q : Int) :
    hermiteP3Hom p q * (9 * q - 4 * p) - 441 * (q * (q * (q * q))) =
      64 * p * (2 * q - p) * ((2 * p - q) * (2 * p - q)) := by
  unfold hermiteP3Hom
  let q2 := q * q
  let q3 := q * q2
  let q4 := q * q3
  let pq := p * q
  let p2 := p * p
  let pq2 := p * q2
  let p2q := p * pq
  let p3 := p * p2
  let pq3 := p * q3
  let p2q2 := p * pq2
  let p3q := p * p2q
  let p4 := p * p3
  have h1 : q3 * (9 * q) = 9 * q4 := by
    rw [int_mul_left_comm, Int.mul_comm q3 q]
  have h2 : q3 * (4 * p) = 4 * pq3 := by
    rw [int_mul_left_comm, Int.mul_comm q3 p]
  have h3 : pq2 * (9 * q) = 9 * pq3 := by
    rw [int_mul_left_comm]
    apply congrArg (fun z => 9 * z)
    change (p * (q * q)) * q = p * (q * (q * q))
    rw [Int.mul_assoc, Int.mul_comm (q * q) q]
  have h4 : pq2 * (4 * p) = 4 * p2q2 := by
    rw [int_mul_left_comm, Int.mul_comm pq2 p]
  have h5 : p2q * (9 * q) = 9 * p2q2 := by
    rw [int_mul_left_comm]
    apply congrArg (fun z => 9 * z)
    change (p * (p * q)) * q = p * (p * (q * q))
    rw [Int.mul_assoc, Int.mul_assoc]
  have h6 : p2q * (4 * p) = 4 * p3q := by
    rw [int_mul_left_comm, Int.mul_comm p2q p]
  have h7 : p3 * (9 * q) = 9 * p3q := by
    rw [int_mul_left_comm]
    apply congrArg (fun z => 9 * z)
    change (p * (p * p)) * q = p * (p * (p * q))
    rw [Int.mul_assoc, Int.mul_assoc]
  have h8 : p3 * (4 * p) = 4 * p4 := by
    rw [int_mul_left_comm, Int.mul_comm p3 p]
  have hLHS :
      (49 * q3 + 36 * pq2 - 48 * p2q + 64 * p3) * (9 * q - 4 * p) - 441 * q4 =
        128 * pq3 - 576 * p2q2 + 768 * p3q - 256 * p4 := by
    simp only [Int.mul_sub, Int.add_mul, Int.sub_mul]
    rw [Int.mul_assoc 49 q3 (9 * q), h1, ← Int.mul_assoc 49 9 q4,
        Int.mul_assoc 36 pq2 (9 * q), h3, ← Int.mul_assoc 36 9 pq3,
        Int.mul_assoc 48 p2q (9 * q), h5, ← Int.mul_assoc 48 9 p2q2,
        Int.mul_assoc 64 p3 (9 * q), h7, ← Int.mul_assoc 64 9 p3q,
        Int.mul_assoc 49 q3 (4 * p), h2, ← Int.mul_assoc 49 4 pq3,
        Int.mul_assoc 36 pq2 (4 * p), h4, ← Int.mul_assoc 36 4 p2q2,
        Int.mul_assoc 48 p2q (4 * p), h6, ← Int.mul_assoc 48 4 p3q,
        Int.mul_assoc 64 p3 (4 * p), h8, ← Int.mul_assoc 64 4 p4]
    omega
  have hSq : (2 * p - q) * (2 * p - q) = 4 * p2 - 4 * pq + q2 := by
    simp only [Int.sub_mul, Int.mul_sub]
    have ha : (2 * p) * (2 * p) = 4 * p2 := by
      rw [Int.mul_assoc 2 p (2 * p), int_mul_left_comm p 2 p, ← Int.mul_assoc 2 2 p2]
      rfl
    have hb : (2 * p) * q = 2 * pq := Int.mul_assoc 2 p q
    have hc : q * (2 * p) = 2 * pq := by
      rw [int_mul_left_comm q 2 p, Int.mul_comm q p]
    have hd : q * q = q2 := rfl
    rw [ha, hb, hc, hd]
    omega
  have hLin : 64 * p * (2 * q - p) = 128 * pq - 64 * p2 := by
    rw [Int.mul_sub]
    have ha : 64 * p * (2 * q) = 128 * pq := by
      rw [Int.mul_assoc 64 p (2 * q), int_mul_left_comm p 2 q, ← Int.mul_assoc 64 2 pq]
      rfl
    have hb : 64 * p * p = 64 * p2 := Int.mul_assoc 64 p p
    rw [ha, hb]
  have r1 : pq * p2 = p3q := by
    change (p * q) * (p * p) = p * (p * (p * q))
    rw [Int.mul_comm (p * q) (p * p), Int.mul_assoc]
  have r2 : pq * pq = p2q2 := by
    change (p * q) * (p * q) = p * (p * (q * q))
    rw [Int.mul_assoc, int_mul_left_comm q p q]
  have r3 : pq * q2 = pq3 := Int.mul_assoc p q q2
  have r4 : p2 * p2 = p4 := Int.mul_assoc p p p2
  have r5 : p2 * pq = p3q := Int.mul_assoc p p pq
  have r6 : p2 * q2 = p2q2 := Int.mul_assoc p p q2
  have hRHS :
      64 * p * (2 * q - p) * ((2 * p - q) * (2 * p - q)) =
        128 * pq3 - 576 * p2q2 + 768 * p3q - 256 * p4 := by
    rw [hLin, hSq]
    simp only [Int.sub_mul, Int.mul_add, Int.mul_sub]
    rw [Int.mul_assoc 128 pq (4 * p2), int_mul_left_comm pq 4 p2, r1, ← Int.mul_assoc 128 4 p3q,
        Int.mul_assoc 128 pq (4 * pq), int_mul_left_comm pq 4 pq, r2, ← Int.mul_assoc 128 4 p2q2,
        Int.mul_assoc 128 pq q2, r3,
        Int.mul_assoc 64 p2 (4 * p2), int_mul_left_comm p2 4 p2, r4, ← Int.mul_assoc 64 4 p4,
        Int.mul_assoc 64 p2 (4 * pq), int_mul_left_comm p2 4 pq, r5, ← Int.mul_assoc 64 4 p3q,
        Int.mul_assoc 64 p2 q2, r6]
    omega
  change (49 * q3 + 36 * pq2 - 48 * p2q + 64 * p3) * (9 * q - 4 * p) - 441 * q4 = _
  rw [hLHS, hRHS]

/-- Theorem A2 (Hermite Majorant Non-Negativity on `0 ≤ p ≤ 2 q`):
    `441 q^4 ≤ P_3^{hom}(p, q) * (9 q - 4 p)` for ALL integers `0 ≤ p ≤ 2 q`. -/
theorem thm_schur_hermite_nonneg (p q : Int) (hp0 : 0 ≤ p) (hp2 : p ≤ 2 * q) :
    441 * (q * (q * (q * q))) ≤ hermiteP3Hom p q * (9 * q - 4 * p) := by
  have hId := thm_schur_hermite_identity p q
  have hSq : 0 ≤ (2 * p - q) * (2 * p - q) := int_sq_nonneg (2 * p - q)
  have hA : 0 ≤ 64 * p := Int.mul_nonneg (by decide) hp0
  have hB : 0 ≤ 2 * q - p := by omega
  have hProd : 0 ≤ 64 * p * (2 * q - p) * ((2 * p - q) * (2 * p - q)) :=
    Int.mul_nonneg (Int.mul_nonneg hA hB) hSq
  omega

/-- Exact rational form of Theorem A:
    for all `q > 0` and `0 ≤ p ≤ 2 q`, `q / (9 q - 4 p) ≤ P_3^{hom}(p, q) / (441 q^3)`. -/
theorem thm_schur_hermite_qpos (p q : Int) (hq : 0 < q) (hp0 : 0 ≤ p) (hp2 : p ≤ 2 * q) :
    QPos.le
      ⟨q, 9 * q - 4 * p, by omega⟩
      ⟨hermiteP3Hom p q, 441 * (q * (q * q)),
        int_mul_pos 441 (q * (q * q)) (by decide) (int_mul_pos q (q * q) hq (int_mul_pos q q hq hq))⟩ := by
  unfold QPos.le
  have hMaj := thm_schur_hermite_nonneg p q hp0 hp2
  have hL : q * (441 * (q * (q * q))) = 441 * (q * (q * (q * q))) := by
    rw [int_mul_left_comm]
  rw [hL]
  exact hMaj

/-- Exact antipodal pairing identity for the Busemann ratio:
    `(3 q - 2 d) + (3 q + 2 d) = 6 q` and `(3 q - 2 d)(3 q + 2 d) = 9 q^2 - 4 d^2`. -/
theorem thm_schur_antipodal_pair_identity (q d : Int) :
    (3 * q - 2 * d) + (3 * q + 2 * d) = 6 * q ∧
    (3 * q - 2 * d) * (3 * q + 2 * d) = 9 * (q * q) - 4 * (d * d) := by
  refine ⟨by omega, ?_⟩
  rw [Int.sub_mul, Int.mul_add, Int.mul_add]
  have h1 : (3 * q) * (3 * q) = 9 * (q * q) := by
    rw [Int.mul_assoc 3 q (3 * q), int_mul_left_comm q 3 q]; omega
  have h2 : (3 * q) * (2 * d) = 6 * (q * d) := by
    rw [Int.mul_assoc 3 q (2 * d), int_mul_left_comm q 2 d]; omega
  have h3 : (2 * d) * (3 * q) = 6 * (q * d) := by
    rw [Int.mul_assoc 2 d (3 * q), int_mul_left_comm d 3 q, Int.mul_comm d q]; omega
  have h4 : (2 * d) * (2 * d) = 4 * (d * d) := by
    rw [Int.mul_assoc 2 d (2 * d), int_mul_left_comm d 2 d]; omega
  rw [h1, h2, h3, h4]
  omega


/-! ## Section 2 (Theorem B): Exact `D_4` Root-Line Moments (`∑ t_k`, `∑ t_k^2`, `∑ t_k^3`) -/

/-- Exact vector negation on `ℤ^4`. -/
def neg4 (v : Vec4) : Vec4 := (-v.1, -v.2.1, -v.2.2.1, -v.2.2.2)

/-- Indexed lookup of the 12 unoriented (antipodal-pair) root lines of `D_4`
    (first nonzero coordinate positive). -/
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

/-- Certificate that `d4RootLines` is an exact 12-line antipodal partition of `d4Roots` from `Vibe.Geometry`. -/
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

/-- Sum of an integer function over all 12 `D_4` root lines. -/
def sum12Int (f : Fin 12 → Int) : Int :=
  f ⟨0, by decide⟩ + f ⟨1, by decide⟩ + f ⟨2, by decide⟩ + f ⟨3, by decide⟩ +
  f ⟨4, by decide⟩ + f ⟨5, by decide⟩ + f ⟨6, by decide⟩ + f ⟨7, by decide⟩ +
  f ⟨8, by decide⟩ + f ⟨9, by decide⟩ + f ⟨10, by decide⟩ + f ⟨11, by decide⟩

/-- Exact 1st, 2nd, and 3rd moments of `t_k = (r_k · x)^2` over the 12 `D_4` root lines. -/
def d4Moment1 (x : Vec4) : Int :=
  sum12Int (fun k => d4LineSq k x)

def d4Moment2 (x : Vec4) : Int :=
  sum12Int (fun k => d4LineSq k x * d4LineSq k x)

def d4Moment3 (x : Vec4) : Int :=
  sum12Int (fun k => d4LineSq k x * (d4LineSq k x * d4LineSq k x))

/-- Sum of homogeneous cubic Hermite majorants over all 12 `D_4` root lines. -/
def d4HermiteSum (x : Vec4) : Int :=
  let S := dot4 x x
  sum12Int (fun k => hermiteP3Hom (d4LineSq k x) S)

private theorem pair_pow1 (x y : Int) :
    (x + y) * (x + y) + (x - y) * (x - y) = 2 * (x * x) + 2 * (y * y) := by
  rw [int_add_sq, int_sub_sq]
  omega

private theorem pair_pow2 (x y : Int) :
    let t1 := (x + y) * (x + y)
    let t2 := (x - y) * (x - y)
    let u := x * x
    let v := y * y
    t1 * t1 + t2 * t2 = 2 * (u * u) + 2 * (v * v) + 12 * (u * v) := by
  intro t1 t2 u v
  let a := u + v
  let b := 2 * (x * y)
  have ht1 : t1 = a + b := by
    change (x + y) * (x + y) = (x * x + y * y) + 2 * (x * y)
    rw [int_add_sq]; omega
  have ht2 : t2 = a - b := by
    change (x - y) * (x - y) = (x * x + y * y) - 2 * (x * y)
    rw [int_sub_sq]; omega
  have hb2 : b * b = 4 * (u * v) := by
    change (2 * (x * y)) * (2 * (x * y)) = 4 * ((x * x) * (y * y))
    rw [Int.mul_assoc 2 (x * y) (2 * (x * y)), int_mul_left_comm (x * y) 2 (x * y), int_sq_mul_sq]
    omega
  have ha2 : a * a = u * u + 2 * (u * v) + v * v := int_add_sq u v
  rw [ht1, ht2, int_add_sq a b, int_sub_sq a b, ha2, hb2]
  omega

private theorem pair_pow3 (x y : Int) :
    let t1 := (x + y) * (x + y)
    let t2 := (x - y) * (x - y)
    let u := x * x
    let v := y * y
    t1 * (t1 * t1) + t2 * (t2 * t2) =
      2 * (u * (u * u)) + 2 * (v * (v * v)) + 30 * (u * (u * v)) + 30 * (u * (v * v)) := by
  intro t1 t2 u v
  let a := u + v
  let b := 2 * (x * y)
  have ht1 : t1 = a + b := by
    change (x + y) * (x + y) = (x * x + y * y) + 2 * (x * y)
    rw [int_add_sq]; omega
  have ht2 : t2 = a - b := by
    change (x - y) * (x - y) = (x * x + y * y) - 2 * (x * y)
    rw [int_sub_sq]; omega
  have hCubePair :
      (a + b) * ((a + b) * (a + b)) + (a - b) * ((a - b) * (a - b)) =
        2 * (a * (a * a)) + 6 * (a * (b * b)) := by
    rw [int_add_sq a b, int_sub_sq a b]
    simp only [Int.add_mul, Int.sub_mul, Int.mul_add, Int.mul_sub]
    have h1 : a * (2 * (a * b)) = 2 * (b * (a * a)) := by
      rw [int_mul_left_comm a 2 (a * b), ← Int.mul_assoc a a b, Int.mul_comm (a * a) b]
    have h2 : b * (2 * (a * b)) = 2 * (a * (b * b)) := by
      rw [int_mul_left_comm b 2 (a * b), int_mul_left_comm b a b]
    rw [h1, h2]
    omega
  have hb2 : b * b = 4 * (u * v) := by
    change (2 * (x * y)) * (2 * (x * y)) = 4 * ((x * x) * (y * y))
    rw [Int.mul_assoc 2 (x * y) (2 * (x * y)), int_mul_left_comm (x * y) 2 (x * y),
        ← Int.mul_assoc 2 2 ((x * y) * (x * y)), int_sq_mul_sq]
    rfl
  have ha3 : a * (a * a) = u * (u * u) + 3 * (u * (u * v)) + 3 * (u * (v * v)) + v * (v * v) := by
    change (u + v) * ((u + v) * (u + v)) = _
    rw [int_add_sq u v]
    simp only [Int.add_mul, Int.mul_add]
    have c1 : u * (2 * (u * v)) = 2 * (u * (u * v)) := int_mul_left_comm u 2 (u * v)
    have c2 : v * (u * u) = u * (u * v) := by
      rw [Int.mul_comm v (u * u), Int.mul_assoc]
    have c3 : v * (2 * (u * v)) = 2 * (u * (v * v)) := by
      rw [int_mul_left_comm v 2 (u * v), int_mul_left_comm v u v]
    rw [c1, c2, c3]
    omega
  have hab2 : a * (b * b) = 4 * (u * (u * v)) + 4 * (u * (v * v)) := by
    rw [hb2]
    change (u + v) * (4 * (u * v)) = _
    rw [Int.add_mul, int_mul_left_comm u 4 (u * v), int_mul_left_comm v 4 (u * v),
        int_mul_left_comm v u v]
  rw [ht1, ht2, hCubePair, ha3, hab2]
  omega

private theorem symS4_sq (y0 y1 y2 y3 : Int) :
    symS4 y0 y1 y2 y3 * symS4 y0 y1 y2 y3 =
      y0 * y0 + y1 * y1 + y2 * y2 + y3 * y3 + 2 * symE2 y0 y1 y2 y3 := by
  unfold symS4 symE2
  have hSplit : y0 + y1 + y2 + y3 = (y0 + y1) + (y2 + y3) := by omega
  rw [hSplit, int_add_sq (y0 + y1) (y2 + y3), int_add_sq y0 y1, int_add_sq y2 y3]
  simp only [Int.add_mul, Int.mul_add]
  omega

private theorem symS4_mul_e2 (y0 y1 y2 y3 : Int) :
    symS4 y0 y1 y2 y3 * symE2 y0 y1 y2 y3 =
      (y0 * (y0 * y1) + y0 * (y1 * y1)) +
      (y0 * (y0 * y2) + y0 * (y2 * y2)) +
      (y0 * (y0 * y3) + y0 * (y3 * y3)) +
      (y1 * (y1 * y2) + y1 * (y2 * y2)) +
      (y1 * (y1 * y3) + y1 * (y3 * y3)) +
      (y2 * (y2 * y3) + y2 * (y3 * y3)) +
      3 * symE3 y0 y1 y2 y3 := by
  unfold symS4 symE2 symE3
  have pairMul : ∀ a b c d : Int,
      (a + b + c + d) * (a * b) =
        a * (a * b) + a * (b * b) + a * b * c + a * b * d := by
    intro a b c d
    rw [Int.add_mul, Int.add_mul, Int.add_mul]
    have h1 : b * (a * b) = a * (b * b) := int_mul_left_comm b a b
    have h2 : c * (a * b) = a * b * c := Int.mul_comm c (a * b)
    have h3 : d * (a * b) = a * b * d := Int.mul_comm d (a * b)
    rw [h1, h2, h3]
  have s01 : (y0 + y1 + y2 + y3) * (y0 * y1) =
      y0 * (y0 * y1) + y0 * (y1 * y1) + y0 * y1 * y2 + y0 * y1 * y3 :=
    pairMul y0 y1 y2 y3
  have s02 : (y0 + y1 + y2 + y3) * (y0 * y2) =
      y0 * (y0 * y2) + y0 * (y2 * y2) + y0 * y1 * y2 + y0 * y2 * y3 := by
    have hr : y0 + y1 + y2 + y3 = y0 + y2 + y1 + y3 := by omega
    rw [hr, pairMul y0 y2 y1 y3, int_mul_right_comm y0 y2 y1]
  have s03 : (y0 + y1 + y2 + y3) * (y0 * y3) =
      y0 * (y0 * y3) + y0 * (y3 * y3) + y0 * y1 * y3 + y0 * y2 * y3 := by
    have hr : y0 + y1 + y2 + y3 = y0 + y3 + y1 + y2 := by omega
    rw [hr, pairMul y0 y3 y1 y2, int_mul_right_comm y0 y3 y1, int_mul_right_comm y0 y3 y2]
  have s12 : (y0 + y1 + y2 + y3) * (y1 * y2) =
      y1 * (y1 * y2) + y1 * (y2 * y2) + y0 * y1 * y2 + y1 * y2 * y3 := by
    have hr : y0 + y1 + y2 + y3 = y1 + y2 + y0 + y3 := by omega
    rw [hr, pairMul y1 y2 y0 y3]
    have hc : y1 * y2 * y0 = y0 * y1 * y2 := by
      rw [Int.mul_comm (y1 * y2) y0, Int.mul_assoc]
    rw [hc]
  have s13 : (y0 + y1 + y2 + y3) * (y1 * y3) =
      y1 * (y1 * y3) + y1 * (y3 * y3) + y0 * y1 * y3 + y1 * y2 * y3 := by
    have hr : y0 + y1 + y2 + y3 = y1 + y3 + y0 + y2 := by omega
    rw [hr, pairMul y1 y3 y0 y2]
    have hc1 : y1 * y3 * y0 = y0 * y1 * y3 := by
      rw [Int.mul_comm (y1 * y3) y0, Int.mul_assoc]
    have hc2 : y1 * y3 * y2 = y1 * y2 * y3 := int_mul_right_comm y1 y3 y2
    rw [hc1, hc2]
  have s23 : (y0 + y1 + y2 + y3) * (y2 * y3) =
      y2 * (y2 * y3) + y2 * (y3 * y3) + y0 * y2 * y3 + y1 * y2 * y3 := by
    have hr : y0 + y1 + y2 + y3 = y2 + y3 + y0 + y1 := by omega
    rw [hr, pairMul y2 y3 y0 y1]
    have hc1 : y2 * y3 * y0 = y0 * y2 * y3 := by
      rw [Int.mul_comm (y2 * y3) y0, Int.mul_assoc]
    have hc2 : y2 * y3 * y1 = y1 * y2 * y3 := by
      rw [Int.mul_comm (y2 * y3) y1, Int.mul_assoc]
    rw [hc1, hc2]
  rw [Int.mul_add, Int.mul_add, Int.mul_add, Int.mul_add, Int.mul_add]
  rw [s01, s02, s03, s12, s13, s23]
  omega

private theorem symS4_cube (y0 y1 y2 y3 : Int) :
    symS4 y0 y1 y2 y3 * (symS4 y0 y1 y2 y3 * symS4 y0 y1 y2 y3) =
      y0 * (y0 * y0) + y1 * (y1 * y1) + y2 * (y2 * y2) + y3 * (y3 * y3) +
      3 * ((y0 * (y0 * y1) + y0 * (y1 * y1)) +
           (y0 * (y0 * y2) + y0 * (y2 * y2)) +
           (y0 * (y0 * y3) + y0 * (y3 * y3)) +
           (y1 * (y1 * y2) + y1 * (y2 * y2)) +
           (y1 * (y1 * y3) + y1 * (y3 * y3)) +
           (y2 * (y2 * y3) + y2 * (y3 * y3))) +
      6 * symE3 y0 y1 y2 y3 := by
  rw [symS4_sq y0 y1 y2 y3, Int.mul_add]
  have h2 : symS4 y0 y1 y2 y3 * (2 * symE2 y0 y1 y2 y3) =
      2 * (symS4 y0 y1 y2 y3 * symE2 y0 y1 y2 y3) := int_mul_left_comm _ 2 _
  rw [h2, symS4_mul_e2 y0 y1 y2 y3]
  have hSqPart :
      symS4 y0 y1 y2 y3 * (y0 * y0 + y1 * y1 + y2 * y2 + y3 * y3) =
        y0 * (y0 * y0) + y1 * (y1 * y1) + y2 * (y2 * y2) + y3 * (y3 * y3) +
        ((y0 * (y0 * y1) + y0 * (y1 * y1)) +
         (y0 * (y0 * y2) + y0 * (y2 * y2)) +
         (y0 * (y0 * y3) + y0 * (y3 * y3)) +
         (y1 * (y1 * y2) + y1 * (y2 * y2)) +
         (y1 * (y1 * y3) + y1 * (y3 * y3)) +
         (y2 * (y2 * y3) + y2 * (y3 * y3))) := by
    unfold symS4
    rw [Int.mul_add, Int.mul_add, Int.mul_add,
        Int.add_mul, Int.add_mul, Int.add_mul,
        Int.add_mul, Int.add_mul, Int.add_mul,
        Int.add_mul, Int.add_mul, Int.add_mul,
        Int.add_mul, Int.add_mul, Int.add_mul]
    have r10 : y1 * (y0 * y0) = y0 * (y0 * y1) := by rw [Int.mul_comm y1 (y0 * y0), Int.mul_assoc]
    have r20 : y2 * (y0 * y0) = y0 * (y0 * y2) := by rw [Int.mul_comm y2 (y0 * y0), Int.mul_assoc]
    have r30 : y3 * (y0 * y0) = y0 * (y0 * y3) := by rw [Int.mul_comm y3 (y0 * y0), Int.mul_assoc]
    have r21 : y2 * (y1 * y1) = y1 * (y1 * y2) := by rw [Int.mul_comm y2 (y1 * y1), Int.mul_assoc]
    have r31 : y3 * (y1 * y1) = y1 * (y1 * y3) := by rw [Int.mul_comm y3 (y1 * y1), Int.mul_assoc]
    have r32 : y3 * (y2 * y2) = y2 * (y2 * y3) := by rw [Int.mul_comm y3 (y2 * y2), Int.mul_assoc]
    rw [r10, r20, r30, r21, r31, r32]
    omega
  rw [hSqPart]
  omega

/-- Theorem B (Exact `D_4` Root-Line Moments):
    for EVERY integer 4-vector `x = (x_0, x_1, x_2, x_3) ∈ ℤ^4`, setting `y_i = x_i^2` and
    `S = x · x = y_0 + y_1 + y_2 + y_3`:
    1. `∑_{k=1}^{12} t_k = 6 S`
    2. `∑_{k=1}^{12} t_k^2 = 6 S^2` (exact `D_4` rank-4 isotropy)
    3. `∑_{k=1}^{12} t_k^3 = 6 S^3 + 12 S e_2(y) - 72 e_3(y)`. -/
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
  intro x y0 y1 y2 y3 S
  have d0 : dot4 (d4RootLine ⟨0, by decide⟩) x = x0 + x1 := by
    change 1 * x0 + 1 * x1 + 0 * x2 + 0 * x3 = x0 + x1; omega
  have d1 : dot4 (d4RootLine ⟨1, by decide⟩) x = x0 - x1 := by
    change 1 * x0 + (-1) * x1 + 0 * x2 + 0 * x3 = x0 - x1; omega
  have d2 : dot4 (d4RootLine ⟨2, by decide⟩) x = x0 + x2 := by
    change 1 * x0 + 0 * x1 + 1 * x2 + 0 * x3 = x0 + x2; omega
  have d3 : dot4 (d4RootLine ⟨3, by decide⟩) x = x0 - x2 := by
    change 1 * x0 + 0 * x1 + (-1) * x2 + 0 * x3 = x0 - x2; omega
  have d4 : dot4 (d4RootLine ⟨4, by decide⟩) x = x0 + x3 := by
    change 1 * x0 + 0 * x1 + 0 * x2 + 1 * x3 = x0 + x3; omega
  have d5 : dot4 (d4RootLine ⟨5, by decide⟩) x = x0 - x3 := by
    change 1 * x0 + 0 * x1 + 0 * x2 + (-1) * x3 = x0 - x3; omega
  have d6 : dot4 (d4RootLine ⟨6, by decide⟩) x = x1 + x2 := by
    change 0 * x0 + 1 * x1 + 1 * x2 + 0 * x3 = x1 + x2; omega
  have d7 : dot4 (d4RootLine ⟨7, by decide⟩) x = x1 - x2 := by
    change 0 * x0 + 1 * x1 + (-1) * x2 + 0 * x3 = x1 - x2; omega
  have d8 : dot4 (d4RootLine ⟨8, by decide⟩) x = x1 + x3 := by
    change 0 * x0 + 1 * x1 + 0 * x2 + 1 * x3 = x1 + x3; omega
  have d9 : dot4 (d4RootLine ⟨9, by decide⟩) x = x1 - x3 := by
    change 0 * x0 + 1 * x1 + 0 * x2 + (-1) * x3 = x1 - x3; omega
  have d10 : dot4 (d4RootLine ⟨10, by decide⟩) x = x2 + x3 := by
    change 0 * x0 + 0 * x1 + 1 * x2 + 1 * x3 = x2 + x3; omega
  have d11 : dot4 (d4RootLine ⟨11, by decide⟩) x = x2 - x3 := by
    change 0 * x0 + 0 * x1 + 1 * x2 + (-1) * x3 = x2 - x3; omega
  have hM1 : d4Moment1 x = 6 * S := by
    simp only [d4Moment1, sum12Int, d4LineSq, d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11]
    have p01 := pair_pow1 x0 x1
    have p02 := pair_pow1 x0 x2
    have p03 := pair_pow1 x0 x3
    have p12 := pair_pow1 x1 x2
    have p13 := pair_pow1 x1 x3
    have p23 := pair_pow1 x2 x3
    change _ = 6 * symS4 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3)
    unfold symS4
    omega
  have hM2 : d4Moment2 x = 6 * (S * S) := by
    simp only [d4Moment2, sum12Int, d4LineSq, d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11]
    have p01 := pair_pow2 x0 x1
    have p02 := pair_pow2 x0 x2
    have p03 := pair_pow2 x0 x3
    have p12 := pair_pow2 x1 x2
    have p13 := pair_pow2 x1 x3
    have p23 := pair_pow2 x2 x3
    have hS2 := symS4_sq (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3)
    unfold symE2 at hS2
    change _ = 6 * (symS4 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3) *
      symS4 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3))
    rw [hS2]
    omega
  have hM3 : d4Moment3 x = 6 * (S * (S * S)) + 12 * (S * symE2 y0 y1 y2 y3) - 72 * symE3 y0 y1 y2 y3 := by
    simp only [d4Moment3, sum12Int, d4LineSq, d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11]
    have p01 := pair_pow3 x0 x1
    have p02 := pair_pow3 x0 x2
    have p03 := pair_pow3 x0 x3
    have p12 := pair_pow3 x1 x2
    have p13 := pair_pow3 x1 x3
    have p23 := pair_pow3 x2 x3
    have hS3 := symS4_cube (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3)
    have hSe2 := symS4_mul_e2 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3)
    change _ = 6 * (symS4 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3) *
        (symS4 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3) *
         symS4 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3))) +
      12 * (symS4 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3) *
        symE2 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3)) -
      72 * symE3 (x0 * x0) (x1 * x1) (x2 * x2) (x3 * x3)
    rw [hS3, hSe2]
    omega
  exact ⟨hM1, hM2, hM3⟩


/-! ## Section 3 (Theorem C): Unconditional 4-Variable Simplex Lower Bound `S^3 - 4 S e_2 + 24 e_3 ≥ 0` -/

/-- The 3-variable Schur polynomial `T(a, b, c) = (a + b + c)^3 - 4(a + b + c)(ab + bc + ca) + 9 abc`. -/
def schurPoly3 (a b c : Int) : Int :=
  let s := a + b + c
  s * (s * s) - 4 * (s * (a * b + b * c + c * a)) + 9 * (a * b * c)

/-- The 4-variable simplex polynomial `P_4(y_0, y_1, y_2, y_3) = S^3 - 4 S e_2(y) + 24 e_3(y)`. -/
def schurPoly4 (y0 y1 y2 y3 : Int) : Int :=
  let S := symS4 y0 y1 y2 y3
  S * (S * S) - 4 * (S * symE2 y0 y1 y2 y3) + 24 * symE3 y0 y1 y2 y3

private theorem schurPoly3_factored (a b c : Int) :
    schurPoly3 a b c = (a - b) * (a - b) * (a + b - c) + c * ((a - c) * (b - c)) := by
  let u := a + b
  let v := a * b
  have hs : a + b + c = u + c := rfl
  have hq : a * b + b * c + c * a = v + c * u := by
    change a * b + b * c + c * a = a * b + c * (a + b)
    rw [Int.mul_add, Int.mul_comm b c]
    omega
  have hr : a * b * c = c * v := Int.mul_comm (a * b) c
  have hCubeGen : ∀ x y : Int, (x + y) * ((x + y) * (x + y)) =
      x * (x * x) + 3 * (y * (x * x)) + 3 * (x * (y * y)) + y * (y * y) := by
    intro x y
    rw [int_add_sq x y, Int.add_mul, Int.mul_add, Int.mul_add, Int.mul_add, Int.mul_add]
    have c1 : x * (2 * (x * y)) = 2 * (y * (x * x)) := by
      rw [int_mul_left_comm x 2 (x * y), Int.mul_comm x y, ← Int.mul_assoc x y x,
          Int.mul_comm x y, Int.mul_assoc y x x]
    have c2 : y * (2 * (x * y)) = 2 * (x * (y * y)) := by
      rw [int_mul_left_comm y 2 (x * y), int_mul_left_comm y x y]
    rw [c1, c2]
    omega
  have hCube := hCubeGen u c
  have hMidGen : ∀ x w y : Int, (x + y) * (w + y * x) = x * w + y * (x * x) + y * w + x * (y * y) := by
    intro x w y
    rw [Int.add_mul, Int.mul_add, Int.mul_add]
    have m1 : x * (y * x) = y * (x * x) := int_mul_left_comm x y x
    have m2 : y * (y * x) = x * (y * y) := by
      rw [Int.mul_comm y x, int_mul_left_comm y x y]
    rw [m1, m2]
    omega
  have hMid := hMidGen u v c
  have hLHS : schurPoly3 a b c =
      u * (u * u) - 4 * (u * v) - c * (u * u) - u * (c * c) + c * (c * c) + 5 * (c * v) := by
    change (a + b + c) * ((a + b + c) * (a + b + c)) -
        4 * ((a + b + c) * (a * b + b * c + c * a)) + 9 * (a * b * c) = _
    rw [hs, hq, hr, hCube, hMid]
    omega
  have hDiffSq : (a - b) * (a - b) = u * u - 4 * v := by
    rw [int_sub_sq a b]
    change _ = (a + b) * (a + b) - 4 * (a * b)
    rw [int_add_sq a b]
    omega
  have hTail : (a - c) * (b - c) = v - c * u + c * c := by
    change (a - c) * (b - c) = a * b - c * u + c * c
    simp only [Int.sub_mul, Int.mul_sub]
    have t1 : a * c + c * b = c * u := by
      change a * c + c * b = c * (a + b)
      rw [Int.mul_add, Int.mul_comm a c]
    omega
  have hR1 : (u * u - 4 * v) * (u - c) = u * (u * u) - c * (u * u) - 4 * (u * v) + 4 * (c * v) := by
    rw [Int.sub_mul, Int.mul_sub, Int.mul_sub]
    have p1 : (u * u) * u = u * (u * u) := Int.mul_comm (u * u) u
    have p2 : (u * u) * c = c * (u * u) := Int.mul_comm (u * u) c
    have p3 : (4 * v) * u = 4 * (u * v) := by rw [Int.mul_assoc 4 v u, Int.mul_comm v u]
    have p4 : (4 * v) * c = 4 * (c * v) := by rw [Int.mul_assoc 4 v c, Int.mul_comm v c]
    rw [p1, p2, p3, p4]
    omega
  have hR2 : c * (v - c * u + c * c) = c * v - u * (c * c) + c * (c * c) := by
    rw [Int.mul_add, Int.mul_sub]
    have p1 : c * (c * u) = u * (c * c) := by rw [Int.mul_comm c u, int_mul_left_comm c u c]
    rw [p1]
  have hRHS : (a - b) * (a - b) * (a + b - c) + c * ((a - c) * (b - c)) =
      u * (u * u) - 4 * (u * v) - c * (u * u) - u * (c * c) + c * (c * c) + 5 * (c * v) := by
    change (a - b) * (a - b) * (u - c) + c * ((a - c) * (b - c)) = _
    rw [hDiffSq, hTail, hR1, hR2]
    omega
  rw [hLHS, hRHS]

private theorem schurPoly3_sorted_nonneg (a b c : Int) (hab : b ≤ a) (hbc : c ≤ b) (hc : 0 ≤ c) :
    0 ≤ schurPoly3 a b c := by
  rw [schurPoly3_factored]
  have h1 : 0 ≤ (a - b) * (a - b) * (a + b - c) :=
    Int.mul_nonneg (int_sq_nonneg (a - b)) (by omega)
  have h2 : 0 ≤ c * ((a - c) * (b - c)) :=
    Int.mul_nonneg hc (Int.mul_nonneg (by omega) (by omega))
  omega

private theorem schurPoly3_swap_bc (a b c : Int) : schurPoly3 a b c = schurPoly3 a c b := by
  unfold schurPoly3
  have hs : a + b + c = a + c + b := by omega
  have hq : a * b + b * c + c * a = a * c + c * b + b * a := by
    rw [Int.mul_comm b c, Int.mul_comm c a, Int.mul_comm b a]
    omega
  have hr : a * b * c = a * c * b := int_mul_right_comm a b c
  rw [hs, hq, hr]

private theorem schurPoly3_swap_ab (a b c : Int) : schurPoly3 a b c = schurPoly3 b a c := by
  unfold schurPoly3
  have hs : a + b + c = b + a + c := by omega
  have hq : a * b + b * c + c * a = b * a + a * c + c * b := by
    rw [Int.mul_comm a b, Int.mul_comm c a, Int.mul_comm c b]
    omega
  have hr : a * b * c = b * a * c := by rw [Int.mul_comm a b]
  rw [hs, hq, hr]

private theorem schurPoly3_max_first (a b c : Int)
    (hb : 0 ≤ b) (hc : 0 ≤ c) (hab : b ≤ a) (hac : c ≤ a) :
    0 ≤ schurPoly3 a b c := by
  if hbc : c ≤ b then
    exact schurPoly3_sorted_nonneg a b c hab hbc hc
  else
    rw [schurPoly3_swap_bc]
    exact schurPoly3_sorted_nonneg a c b hac (by omega) hb

/-- Unconditional 3-variable Schur inequality (degree 1):
    `(a + b + c)^3 - 4(a + b + c)(ab + bc + ca) + 9 abc ≥ 0` for ALL `a, b, c ≥ 0`. -/
theorem thm_schur3_nonneg (a b c : Int) (ha : 0 ≤ a) (hb : 0 ≤ b) (hc : 0 ≤ c) :
    0 ≤ schurPoly3 a b c := by
  if h1 : b ≤ a ∧ c ≤ a then
    exact schurPoly3_max_first a b c hb hc h1.1 h1.2
  else if h2 : a ≤ b ∧ c ≤ b then
    rw [schurPoly3_swap_ab]
    exact schurPoly3_max_first b a c ha hc h2.1 h2.2
  else
    have hca : a ≤ c := by omega
    have hcb : b ≤ c := by omega
    rw [schurPoly3_swap_ab, schurPoly3_swap_bc, schurPoly3_swap_ab]
    exact schurPoly3_max_first c b a hb ha hcb hca

private theorem schurPoly4_shift_identity (d a b c : Int) :
    schurPoly4 (d + a) (d + b) (d + c) d =
      64 * (d * (d * d)) +
      48 * (d * d * (a + b + c)) +
      32 * (d * (a * b + b * c + c * a)) +
      15 * (a * b * c) +
      schurPoly3 a b c := by
  unfold schurPoly4 schurPoly3
  let p1 := a + b + c
  let q2 := a * b + b * c + c * a
  let r3 := a * b * c
  let d2 := d * d
  let d3 := d * d2
  have hS : symS4 (d + a) (d + b) (d + c) d = 4 * d + p1 := by
    unfold symS4; omega
  have hE2 : symE2 (d + a) (d + b) (d + c) d = 6 * d2 + 3 * (d * p1) + q2 := by
    change (d + a) * (d + b) + (d + a) * (d + c) + (d + a) * d +
        (d + b) * (d + c) + (d + b) * d + (d + c) * d =
      6 * (d * d) + 3 * (d * (a + b + c)) + (a * b + b * c + c * a)
    simp only [Int.add_mul, Int.mul_add]
    rw [Int.mul_comm a d, Int.mul_comm b d, Int.mul_comm c d, Int.mul_comm c a]
    omega
  have hPairShift : ∀ x y : Int,
      (d + x) * (d + y) * d = d3 + d2 * x + d2 * y + d * (x * y) := by
    intro x y
    rw [Int.add_mul, Int.mul_add, Int.mul_add, Int.add_mul, Int.add_mul, Int.add_mul]
    have r1 : d * d * d = d3 := Int.mul_comm d2 d
    have r2 : d * y * d = d2 * y := int_mul_right_comm d y d
    have r3' : x * d * d = d2 * x := by rw [Int.mul_comm x d, int_mul_right_comm d x d]
    have r4 : x * y * d = d * (x * y) := Int.mul_comm (x * y) d
    rw [r1, r2, r3', r4]
    omega
  have hTripleShift :
      (d + a) * (d + b) * (d + c) =
        d3 + d2 * p1 + d * q2 + r3 := by
    rw [Int.mul_add, hPairShift a b]
    simp only [Int.add_mul, Int.mul_add]
    have t1 : d * b * c = d * (b * c) := Int.mul_assoc d b c
    have t2 : a * d * c = d * (c * a) := by
      rw [Int.mul_comm a d, Int.mul_assoc d a c, Int.mul_comm a c]
    have t3 : d * d * c = d2 * c := rfl
    have t4 : a * b * c = r3 := rfl
    have hp : d2 * p1 = d2 * a + d2 * b + d2 * c := by
      change d2 * (a + b + c) = _
      rw [Int.mul_add, Int.mul_add]
    have hq : d * q2 = d * (a * b) + d * (b * c) + d * (c * a) := by
      change d * (a * b + b * c + c * a) = _
      rw [Int.mul_add, Int.mul_add]
    rw [t1, t2, t3, t4, hp, hq]
    omega
  have hE3 : symE3 (d + a) (d + b) (d + c) d =
      4 * d3 + 3 * (d2 * p1) + 2 * (d * q2) + r3 := by
    unfold symE3
    rw [hTripleShift, hPairShift a b, hPairShift a c, hPairShift b c]
    have hca : d * (a * c) = d * (c * a) := by rw [Int.mul_comm a c]
    have hp : d2 * p1 = d2 * a + d2 * b + d2 * c := by
      change d2 * (a + b + c) = _
      rw [Int.mul_add, Int.mul_add]
    have hq : d * q2 = d * (a * b) + d * (b * c) + d * (c * a) := by
      change d * (a * b + b * c + c * a) = _
      rw [Int.mul_add, Int.mul_add]
    rw [hca, hp, hq]
    omega
  have hS3 : (4 * d + p1) * ((4 * d + p1) * (4 * d + p1)) =
      64 * d3 + 48 * (d2 * p1) + 12 * (d * (p1 * p1)) + p1 * (p1 * p1) := by
    rw [int_add_sq (4 * d) p1]
    simp only [Int.add_mul, Int.mul_add]
    have s1 : (4 * d) * (4 * d) = 16 * d2 := by
      rw [Int.mul_assoc 4 d (4 * d), int_mul_left_comm d 4 d, ← Int.mul_assoc 4 4 d2]; rfl
    have s2 : 2 * (4 * d * p1) = 8 * (d * p1) := by
      rw [Int.mul_assoc 4 d p1, ← Int.mul_assoc 2 4 (d * p1)]; rfl
    rw [s1, s2]
    have c1 : (4 * d) * (16 * d2) = 64 * d3 := by
      rw [Int.mul_assoc 4 d (16 * d2), int_mul_left_comm d 16 d2, ← Int.mul_assoc 4 16 d3]; rfl
    have c2 : (4 * d) * (8 * (d * p1)) = 32 * (d2 * p1) := by
      rw [Int.mul_assoc 4 d (8 * (d * p1)), int_mul_left_comm d 8 (d * p1),
          ← Int.mul_assoc 4 8 (d * (d * p1)), ← Int.mul_assoc d d p1]; rfl
    have c3 : (4 * d) * (p1 * p1) = 4 * (d * (p1 * p1)) := Int.mul_assoc 4 d (p1 * p1)
    have c4 : p1 * (16 * d2) = 16 * (d2 * p1) := by
      rw [int_mul_left_comm p1 16 d2, Int.mul_comm p1 d2]
    have c5 : p1 * (8 * (d * p1)) = 8 * (d * (p1 * p1)) := by
      rw [int_mul_left_comm p1 8 (d * p1), int_mul_left_comm p1 d p1]
    rw [c1, c2, c3, c4, c5]
    omega
  have hSE2 : (4 * d + p1) * (6 * d2 + 3 * (d * p1) + q2) =
      24 * d3 + 18 * (d2 * p1) + 3 * (d * (p1 * p1)) + 4 * (d * q2) + p1 * q2 := by
    simp only [Int.add_mul, Int.mul_add]
    have m1 : (4 * d) * (6 * d2) = 24 * d3 := by
      rw [Int.mul_assoc 4 d (6 * d2), int_mul_left_comm d 6 d2, ← Int.mul_assoc 4 6 d3]; rfl
    have m2 : (4 * d) * (3 * (d * p1)) = 12 * (d2 * p1) := by
      rw [Int.mul_assoc 4 d (3 * (d * p1)), int_mul_left_comm d 3 (d * p1),
          ← Int.mul_assoc 4 3 (d * (d * p1)), ← Int.mul_assoc d d p1]; rfl
    have m3 : (4 * d) * q2 = 4 * (d * q2) := Int.mul_assoc 4 d q2
    have m4 : p1 * (6 * d2) = 6 * (d2 * p1) := by
      rw [int_mul_left_comm p1 6 d2, Int.mul_comm p1 d2]
    have m5 : p1 * (3 * (d * p1)) = 3 * (d * (p1 * p1)) := by
      rw [int_mul_left_comm p1 3 (d * p1), int_mul_left_comm p1 d p1]
    rw [m1, m2, m3, m4, m5]
    omega
  change symS4 (d + a) (d + b) (d + c) d * (symS4 (d + a) (d + b) (d + c) d * symS4 (d + a) (d + b) (d + c) d) -
    4 * (symS4 (d + a) (d + b) (d + c) d * symE2 (d + a) (d + b) (d + c) d) +
    24 * symE3 (d + a) (d + b) (d + c) d =
    64 * d3 + 48 * (d2 * p1) + 32 * (d * q2) + 15 * r3 + (p1 * (p1 * p1) - 4 * (p1 * q2) + 9 * r3)
  rw [hS, hE2, hE3, hS3, hSE2]
  omega

private theorem schurPoly4_min_last (y0 y1 y2 y3 : Int)
    (h3 : 0 ≤ y3) (h0 : y3 ≤ y0) (h1 : y3 ≤ y1) (h2 : y3 ≤ y2) :
    0 ≤ schurPoly4 y0 y1 y2 y3 := by
  let a := y0 - y3
  let b := y1 - y3
  let c := y2 - y3
  have hy0 : y0 = y3 + a := by omega
  have hy1 : y1 = y3 + b := by omega
  have hy2 : y2 = y3 + c := by omega
  rw [hy0, hy1, hy2, schurPoly4_shift_identity y3 a b c]
  have ha : 0 ≤ a := by omega
  have hb : 0 ≤ b := by omega
  have hc : 0 ≤ c := by omega
  have hd2 : 0 ≤ y3 * y3 := int_sq_nonneg y3
  have t1 : 0 ≤ 64 * (y3 * (y3 * y3)) := Int.mul_nonneg (by decide) (Int.mul_nonneg h3 hd2)
  have t2 : 0 ≤ 48 * (y3 * y3 * (a + b + c)) := Int.mul_nonneg (by decide) (Int.mul_nonneg hd2 (by omega))
  have hq : 0 ≤ a * b + b * c + c * a := by
    have p1 := Int.mul_nonneg ha hb
    have p2 := Int.mul_nonneg hb hc
    have p3 := Int.mul_nonneg hc ha
    omega
  have t3 : 0 ≤ 32 * (y3 * (a * b + b * c + c * a)) := Int.mul_nonneg (by decide) (Int.mul_nonneg h3 hq)
  have t4 : 0 ≤ 15 * (a * b * c) := Int.mul_nonneg (by decide) (Int.mul_nonneg (Int.mul_nonneg ha hb) hc)
  have t5 : 0 ≤ schurPoly3 a b c := thm_schur3_nonneg a b c ha hb hc
  omega

private theorem schurPoly4_swap03 (y0 y1 y2 y3 : Int) :
    schurPoly4 y0 y1 y2 y3 = schurPoly4 y3 y1 y2 y0 := by
  unfold schurPoly4 symS4 symE2 symE3
  have hs : y0 + y1 + y2 + y3 = y3 + y1 + y2 + y0 := by omega
  have he2 : y0 * y1 + y0 * y2 + y0 * y3 + y1 * y2 + y1 * y3 + y2 * y3 =
      y3 * y1 + y3 * y2 + y3 * y0 + y1 * y2 + y1 * y0 + y2 * y0 := by
    rw [Int.mul_comm y0 y1, Int.mul_comm y0 y2, Int.mul_comm y0 y3, Int.mul_comm y1 y3, Int.mul_comm y2 y3]
    omega
  have he3 : y0 * y1 * y2 + y0 * y1 * y3 + y0 * y2 * y3 + y1 * y2 * y3 =
      y3 * y1 * y2 + y3 * y1 * y0 + y3 * y2 * y0 + y1 * y2 * y0 := by
    have a1 : y0 * y1 * y2 = y1 * y2 * y0 := by
      rw [Int.mul_comm (y0 * y1) y2, Int.mul_comm y0 y1, ← Int.mul_assoc, Int.mul_comm y2 y1]
    have a2 : y0 * y1 * y3 = y3 * y1 * y0 := by
      rw [Int.mul_comm y0 y1, int_mul_right_comm y1 y0 y3, Int.mul_comm y1 y3]
    have a3 : y0 * y2 * y3 = y3 * y2 * y0 := by
      rw [Int.mul_comm y0 y2, int_mul_right_comm y2 y0 y3, Int.mul_comm y2 y3]
    have a4 : y1 * y2 * y3 = y3 * y1 * y2 := by
      rw [Int.mul_comm (y1 * y2) y3, ← Int.mul_assoc]
    rw [a1, a2, a3, a4]
    omega
  rw [hs, he2, he3]

private theorem schurPoly4_swap13 (y0 y1 y2 y3 : Int) :
    schurPoly4 y0 y1 y2 y3 = schurPoly4 y0 y3 y2 y1 := by
  unfold schurPoly4 symS4 symE2 symE3
  have hs : y0 + y1 + y2 + y3 = y0 + y3 + y2 + y1 := by omega
  have he2 : y0 * y1 + y0 * y2 + y0 * y3 + y1 * y2 + y1 * y3 + y2 * y3 =
      y0 * y3 + y0 * y2 + y0 * y1 + y3 * y2 + y3 * y1 + y2 * y1 := by
    rw [Int.mul_comm y1 y2, Int.mul_comm y1 y3, Int.mul_comm y2 y3]
    omega
  have he3 : y0 * y1 * y2 + y0 * y1 * y3 + y0 * y2 * y3 + y1 * y2 * y3 =
      y0 * y3 * y2 + y0 * y3 * y1 + y0 * y2 * y1 + y3 * y2 * y1 := by
    have a1 : y0 * y1 * y2 = y0 * y2 * y1 := int_mul_right_comm y0 y1 y2
    have a2 : y0 * y1 * y3 = y0 * y3 * y1 := int_mul_right_comm y0 y1 y3
    have a3 : y0 * y2 * y3 = y0 * y3 * y2 := int_mul_right_comm y0 y2 y3
    have a4 : y1 * y2 * y3 = y3 * y2 * y1 := by
      rw [Int.mul_comm y1 y2, int_mul_right_comm y2 y1 y3, Int.mul_comm y2 y3]
    rw [a1, a2, a3, a4]
    omega
  rw [hs, he2, he3]

private theorem schurPoly4_swap23 (y0 y1 y2 y3 : Int) :
    schurPoly4 y0 y1 y2 y3 = schurPoly4 y0 y1 y3 y2 := by
  unfold schurPoly4 symS4 symE2 symE3
  have hs : y0 + y1 + y2 + y3 = y0 + y1 + y3 + y2 := by omega
  have he2 : y0 * y1 + y0 * y2 + y0 * y3 + y1 * y2 + y1 * y3 + y2 * y3 =
      y0 * y1 + y0 * y3 + y0 * y2 + y1 * y3 + y1 * y2 + y3 * y2 := by
    rw [Int.mul_comm y2 y3]
    omega
  have he3 : y0 * y1 * y2 + y0 * y1 * y3 + y0 * y2 * y3 + y1 * y2 * y3 =
      y0 * y1 * y3 + y0 * y1 * y2 + y0 * y3 * y2 + y1 * y3 * y2 := by
    have a3 : y0 * y2 * y3 = y0 * y3 * y2 := int_mul_right_comm y0 y2 y3
    have a4 : y1 * y2 * y3 = y1 * y3 * y2 := int_mul_right_comm y1 y2 y3
    rw [a3, a4]
    omega
  rw [hs, he2, he3]

/-- Theorem C (Unconditional 4-Variable Simplex Lower Bound):
    for ALL non-negative integers `y_0, y_1, y_2, y_3 ≥ 0`,
    `S^3 - 4 S e_2(y) + 24 e_3(y) ≥ 0` (equivalently `∑_{k=1}^{12} t_k^3 ≤ 9 S^3`). -/
theorem thm_schur4_simplex_nonneg (y0 y1 y2 y3 : Int)
    (h0 : 0 ≤ y0) (h1 : 0 ≤ y1) (h2 : 0 ≤ y2) (h3 : 0 ≤ y3) :
    0 ≤ schurPoly4 y0 y1 y2 y3 := by
  if m3 : y3 ≤ y0 ∧ y3 ≤ y1 ∧ y3 ≤ y2 then
    exact schurPoly4_min_last y0 y1 y2 y3 h3 m3.1 m3.2.1 m3.2.2
  else if m2 : y2 ≤ y0 ∧ y2 ≤ y1 ∧ y2 ≤ y3 then
    rw [schurPoly4_swap23]
    exact schurPoly4_min_last y0 y1 y3 y2 h2 m2.1 m2.2.1 m2.2.2
  else if m1 : y1 ≤ y0 ∧ y1 ≤ y2 ∧ y1 ≤ y3 then
    rw [schurPoly4_swap13]
    exact schurPoly4_min_last y0 y3 y2 y1 h1 m1.1 m1.2.2 m1.2.1
  else
    rw [schurPoly4_swap03]
    exact schurPoly4_min_last y3 y1 y2 y0 h0 (by omega) (by omega) (by omega)

/-- Direct corollary of Theorems B and C: for EVERY `x ∈ ℤ^4`, `∑_{k=1}^{12} t_k^3 ≤ 9 S^3`. -/
theorem thm_d4_moment3_le_9_S3 (x0 x1 x2 x3 : Int) :
    let x : Vec4 := (x0, x1, x2, x3)
    let S := dot4 x x
    d4Moment3 x ≤ 9 * (S * (S * S)) := by
  intro x S
  let y0 := x0 * x0
  let y1 := x1 * x1
  let y2 := x2 * x2
  let y3 := x3 * x3
  have hMom : d4Moment3 x =
      6 * (S * (S * S)) + 12 * (S * symE2 y0 y1 y2 y3) - 72 * symE3 y0 y1 y2 y3 :=
    (thm_d4_exact_moments x0 x1 x2 x3).2.2
  have hPos : 0 ≤ S * (S * S) - 4 * (S * symE2 y0 y1 y2 y3) + 24 * symE3 y0 y1 y2 y3 :=
    thm_schur4_simplex_nonneg y0 y1 y2 y3
      (int_sq_nonneg x0) (int_sq_nonneg x1) (int_sq_nonneg x2) (int_sq_nonneg x3)
  omega


/-! ## Section 4 (Theorem D): Global Busemann Schur Spectral Gap (`ρ({3,4,3,4}) ≤ 13/21`) -/

private theorem d4HermiteSum_expand (x : Vec4) :
    let S := dot4 x x
    d4HermiteSum x =
      588 * (S * (S * S)) + 36 * (S * S * d4Moment1 x) -
        48 * (S * d4Moment2 x) + 64 * d4Moment3 x := by
  intro S
  have hTerm : ∀ k : Fin 12,
      hermiteP3Hom (d4LineSq k x) (dot4 x x) =
        49 * (S * (S * S)) + 36 * (S * S * d4LineSq k x) -
          48 * (S * (d4LineSq k x * d4LineSq k x)) +
          64 * (d4LineSq k x * (d4LineSq k x * d4LineSq k x)) := by
    intro k
    change 49 * (S * (S * S)) + 36 * (d4LineSq k x * (S * S)) -
        48 * (d4LineSq k x * (d4LineSq k x * S)) +
        64 * (d4LineSq k x * (d4LineSq k x * d4LineSq k x)) = _
    have a1 : d4LineSq k x * (S * S) = S * S * d4LineSq k x := Int.mul_comm _ _
    have a2 : d4LineSq k x * (d4LineSq k x * S) = S * (d4LineSq k x * d4LineSq k x) := by
      rw [← Int.mul_assoc, Int.mul_comm _ S]
    rw [a1, a2]
  simp only [d4HermiteSum, d4Moment1, d4Moment2, d4Moment3, sum12Int, hTerm]
  simp only [Int.mul_add]
  omega

/-- Theorem D1 (Exact Cleared-Denominator Majorant Identity & `13/21` Bound):
    for EVERY `x = (x_0, x_1, x_2, x_3) ∈ ℤ^4` with `y_i = x_i^2`, `S = x · x`:
    1. `∑_{k=1}^{12} P_3^{hom}(t_k, S) = 1092 S^3 - 192 (S^3 - 4 S e_2(y) + 24 e_3(y))`
    2. `∑_{k=1}^{12} P_3^{hom}(t_k, S) ≤ 1092 S^3`
    3. `21 * ∑_{k=1}^{12} P_3^{hom}(t_k, S) ≤ 13 * (4 * 441 * S^3)` (exact `1092 / 1764 = 13 / 21`). -/
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
        48 * (S * d4Moment2 x) + 64 * d4Moment3 x :=
    d4HermiteSum_expand x
  have hMom := thm_d4_exact_moments x0 x1 x2 x3
  have hS : S = symS4 y0 y1 y2 y3 := rfl
  have hM1 : d4Moment1 x = 6 * S := by rw [hS]; exact hMom.1
  have hM2 : d4Moment2 x = 6 * (S * S) := by rw [hS]; exact hMom.2.1
  have hM3 : d4Moment3 x = 6 * (S * (S * S)) + 12 * (S * symE2 y0 y1 y2 y3) - 72 * symE3 y0 y1 y2 y3 := by
    rw [hS]; exact hMom.2.2
  have hA1 : S * S * (6 * S) = 6 * (S * (S * S)) := by
    rw [int_mul_left_comm (S * S) 6 S, Int.mul_comm (S * S) S]
  have hA2 : S * (6 * (S * S)) = 6 * (S * (S * S)) := int_mul_left_comm S 6 (S * S)
  have hP4 : schurPoly4 y0 y1 y2 y3 =
      S * (S * S) - 4 * (S * symE2 y0 y1 y2 y3) + 24 * symE3 y0 y1 y2 y3 := rfl
  have hEq : d4HermiteSum x = 1092 * (S * (S * S)) - 192 * schurPoly4 y0 y1 y2 y3 := by
    rw [hExp, hM1, hM2, hM3, hA1, hA2, hP4]
    omega
  have hNonneg : 0 ≤ schurPoly4 y0 y1 y2 y3 :=
    thm_schur4_simplex_nonneg y0 y1 y2 y3
      (int_sq_nonneg x0) (int_sq_nonneg x1) (int_sq_nonneg x2) (int_sq_nonneg x3)
  have hConst : 13 * (4 * 441 * (S * (S * S))) = 22932 * (S * (S * S)) := by
    rw [← Int.mul_assoc 13 (4 * 441) (S * (S * S))]
    rfl
  refine ⟨hEq, by omega, ?_⟩
  rw [hConst]
  omega

private theorem d4LineSq_bounds (k : Fin 12) (x : Vec4) :
    0 ≤ d4LineSq k x ∧ d4LineSq k x ≤ 2 * dot4 x x := by
  refine ⟨int_sq_nonneg (dot4 (d4RootLine k) x), ?_⟩
  match x with
  | (x0, x1, x2, x3) =>
    have hx0 := int_sq_nonneg x0
    have hx1 := int_sq_nonneg x1
    have hx2 := int_sq_nonneg x2
    have hx3 := int_sq_nonneg x3
    match k with
    | ⟨0, _⟩ =>
      have hd : 1 * x0 + 1 * x1 + 0 * x2 + 0 * x3 = x0 + x1 := by omega
      have hb := int_two_sq_add_le x0 x1
      change (1 * x0 + 1 * x1 + 0 * x2 + 0 * x3) * (1 * x0 + 1 * x1 + 0 * x2 + 0 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨1, _⟩ =>
      have hd : 1 * x0 + (-1) * x1 + 0 * x2 + 0 * x3 = x0 - x1 := by omega
      have hb := int_two_sq_sub_le x0 x1
      change (1 * x0 + (-1) * x1 + 0 * x2 + 0 * x3) * (1 * x0 + (-1) * x1 + 0 * x2 + 0 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨2, _⟩ =>
      have hd : 1 * x0 + 0 * x1 + 1 * x2 + 0 * x3 = x0 + x2 := by omega
      have hb := int_two_sq_add_le x0 x2
      change (1 * x0 + 0 * x1 + 1 * x2 + 0 * x3) * (1 * x0 + 0 * x1 + 1 * x2 + 0 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨3, _⟩ =>
      have hd : 1 * x0 + 0 * x1 + (-1) * x2 + 0 * x3 = x0 - x2 := by omega
      have hb := int_two_sq_sub_le x0 x2
      change (1 * x0 + 0 * x1 + (-1) * x2 + 0 * x3) * (1 * x0 + 0 * x1 + (-1) * x2 + 0 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨4, _⟩ =>
      have hd : 1 * x0 + 0 * x1 + 0 * x2 + 1 * x3 = x0 + x3 := by omega
      have hb := int_two_sq_add_le x0 x3
      change (1 * x0 + 0 * x1 + 0 * x2 + 1 * x3) * (1 * x0 + 0 * x1 + 0 * x2 + 1 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨5, _⟩ =>
      have hd : 1 * x0 + 0 * x1 + 0 * x2 + (-1) * x3 = x0 - x3 := by omega
      have hb := int_two_sq_sub_le x0 x3
      change (1 * x0 + 0 * x1 + 0 * x2 + (-1) * x3) * (1 * x0 + 0 * x1 + 0 * x2 + (-1) * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨6, _⟩ =>
      have hd : 0 * x0 + 1 * x1 + 1 * x2 + 0 * x3 = x1 + x2 := by omega
      have hb := int_two_sq_add_le x1 x2
      change (0 * x0 + 1 * x1 + 1 * x2 + 0 * x3) * (0 * x0 + 1 * x1 + 1 * x2 + 0 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨7, _⟩ =>
      have hd : 0 * x0 + 1 * x1 + (-1) * x2 + 0 * x3 = x1 - x2 := by omega
      have hb := int_two_sq_sub_le x1 x2
      change (0 * x0 + 1 * x1 + (-1) * x2 + 0 * x3) * (0 * x0 + 1 * x1 + (-1) * x2 + 0 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨8, _⟩ =>
      have hd : 0 * x0 + 1 * x1 + 0 * x2 + 1 * x3 = x1 + x3 := by omega
      have hb := int_two_sq_add_le x1 x3
      change (0 * x0 + 1 * x1 + 0 * x2 + 1 * x3) * (0 * x0 + 1 * x1 + 0 * x2 + 1 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨9, _⟩ =>
      have hd : 0 * x0 + 1 * x1 + 0 * x2 + (-1) * x3 = x1 - x3 := by omega
      have hb := int_two_sq_sub_le x1 x3
      change (0 * x0 + 1 * x1 + 0 * x2 + (-1) * x3) * (0 * x0 + 1 * x1 + 0 * x2 + (-1) * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨10, _⟩ =>
      have hd : 0 * x0 + 0 * x1 + 1 * x2 + 1 * x3 = x2 + x3 := by omega
      have hb := int_two_sq_add_le x2 x3
      change (0 * x0 + 0 * x1 + 1 * x2 + 1 * x3) * (0 * x0 + 0 * x1 + 1 * x2 + 1 * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega
    | ⟨11, _⟩ =>
      have hd : 0 * x0 + 0 * x1 + 1 * x2 + (-1) * x3 = x2 - x3 := by omega
      have hb := int_two_sq_sub_le x2 x3
      change (0 * x0 + 0 * x1 + 1 * x2 + (-1) * x3) * (0 * x0 + 0 * x1 + 1 * x2 + (-1) * x3) ≤
        2 * (x0 * x0 + x1 * x1 + x2 * x2 + x3 * x3)
      rw [hd]; omega

/-- Single exact rational term `S / (9 S - 4 t_k)` in the Busemann Schur sum. -/
def busemannTerm (k : Fin 12) (x : Vec4) (hS : 0 < dot4 x x) : QPos :=
  let S := dot4 x x
  let t := d4LineSq k x
  ⟨S, 9 * S - 4 * t, by
    have hb := d4LineSq_bounds k x
    omega⟩

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

/-- Exact global Busemann Schur ratio `F_1(x) = (1/4) ∑_{k=1}^{12} S / (9 S - 4 (r_k · x)^2)`
    for any nonzero `x ∈ ℤ^4` (equals `(S_full φ_1)(v) / φ_1(v)` on the infinite `{3,4,3,4}` honeycomb). -/
def busemannF1 (x : Vec4) (hS : 0 < dot4 x x) : QPos :=
  QPos.divPos (busemannSum12 x hS) 4 (by decide)

private theorem busemannTerm_le_hermite (k : Fin 12) (x : Vec4) (hS : 0 < dot4 x x) :
    let S := dot4 x x
    let D := 441 * (S * (S * S))
    let hD : 0 < D :=
      int_mul_pos 441 (S * (S * S)) (by decide) (int_mul_pos S (S * S) hS (int_mul_pos S S hS hS))
    QPos.le (busemannTerm k x hS) ⟨hermiteP3Hom (d4LineSq k x) S, D, hD⟩ := by
  have hb := d4LineSq_bounds k x
  exact thm_schur_hermite_qpos (d4LineSq k x) (dot4 x x) hS hb.1 hb.2

/-- Theorem D2 (Unconditional Global Busemann Schur Upper Bound `F_1(x) ≤ 13/21` in Exact Rationals):
    for EVERY nonzero integer 4-vector `x = (x_0, x_1, x_2, x_3) ∈ ℤ^4 \ {0}` (hence every rational
    direction on `S^3`, dense in `S^3`), the exact Busemann Schur ratio satisfies
    `F_1(x) = (1/4) ∑_{k=1}^{12} S / (9 S - 4 (r_k · x)^2) ≤ 13 / 21`,
    certifying spectral radius `ρ({3,4,3,4}) ≤ 13/21` and spectral gap `λ_gap ≥ 1 - 13/21 = 8/21 > 0`. -/
theorem thm_busemann_schur_global_bound (x0 x1 x2 x3 : Int)
    (hS : 0 < dot4 (x0, x1, x2, x3) (x0, x1, x2, x3)) :
    QPos.le (busemannF1 (x0, x1, x2, x3) hS) ⟨13, 21, by decide⟩ := by
  let x : Vec4 := (x0, x1, x2, x3)
  let S := dot4 x x
  let D := 441 * (S * (S * S))
  have hD : 0 < D :=
    int_mul_pos 441 (S * (S * S)) (by decide) (int_mul_pos S (S * S) hS (int_mul_pos S S hS hS))
  have s01 := QPos.add_same_den_le_right hD
    (busemannTerm_le_hermite ⟨0, by decide⟩ x hS) (busemannTerm_le_hermite ⟨1, by decide⟩ x hS)
  have s02 := QPos.add_same_den_le_right hD s01 (busemannTerm_le_hermite ⟨2, by decide⟩ x hS)
  have s03 := QPos.add_same_den_le_right hD s02 (busemannTerm_le_hermite ⟨3, by decide⟩ x hS)
  have s04 := QPos.add_same_den_le_right hD s03 (busemannTerm_le_hermite ⟨4, by decide⟩ x hS)
  have s05 := QPos.add_same_den_le_right hD s04 (busemannTerm_le_hermite ⟨5, by decide⟩ x hS)
  have s06 := QPos.add_same_den_le_right hD s05 (busemannTerm_le_hermite ⟨6, by decide⟩ x hS)
  have s07 := QPos.add_same_den_le_right hD s06 (busemannTerm_le_hermite ⟨7, by decide⟩ x hS)
  have s08 := QPos.add_same_den_le_right hD s07 (busemannTerm_le_hermite ⟨8, by decide⟩ x hS)
  have s09 := QPos.add_same_den_le_right hD s08 (busemannTerm_le_hermite ⟨9, by decide⟩ x hS)
  have s10 := QPos.add_same_den_le_right hD s09 (busemannTerm_le_hermite ⟨10, by decide⟩ x hS)
  have hSumLe : QPos.le (busemannSum12 x hS) ⟨d4HermiteSum x, D, hD⟩ :=
    QPos.add_same_den_le_right hD s10 (busemannTerm_le_hermite ⟨11, by decide⟩ x hS)
  have hDivLe : QPos.le (busemannF1 x hS) (QPos.divPos ⟨d4HermiteSum x, D, hD⟩ 4 (by decide)) :=
    QPos.divPos_le 4 (by decide) hSumLe
  have hMaj := (thm_schur_majorant_bound_13_over_21 x0 x1 x2 x3).2.2
  have hEnd : QPos.le (QPos.divPos ⟨d4HermiteSum x, D, hD⟩ 4 (by decide)) ⟨13, 21, by decide⟩ := by
    unfold QPos.le QPos.divPos
    change d4HermiteSum x * 21 ≤ 13 * (4 * (441 * (S * (S * S))))
    rw [Int.mul_comm (d4HermiteSum x) 21, ← Int.mul_assoc 4 441 (S * (S * S))]
    exact hMaj
  exact QPos.le_trans hDivLe hEnd

/-- Exact attainment (sharpness) at a `D_4` root direction `x = (1, 1, 0, 0)`:
    `F_1(1, 1, 0, 0) = 13 / 21` identically, proving the `13/21` Schur bound is sharp over `S^3`. -/
theorem thm_busemann_schur_sharp_at_d4_root :
    QPos.eq (busemannF1 (1, 1, 0, 0) (by decide)) ⟨13, 21, by decide⟩ := by
  unfold QPos.eq
  decide

/-- Exact cusp-axis evaluation at `x = (1, 0, 0, 0)`:
    `F_1(1, 0, 0, 0) = 7 / 15 < 13 / 21` (matching dock 0's `[0, 6, 18]` cusp split in `CoxeterTransport`). -/
theorem thm_busemann_schur_cusp_axis_7_over_15 :
    QPos.eq (busemannF1 (1, 0, 0, 0) (by decide)) ⟨7, 15, by decide⟩ := by
  unfold QPos.eq
  decide

/-- Certified spectral gap arithmetic: `1 - 13/21 = 8/21 > 0` (`21 - 13 = 8`). -/
theorem thm_busemann_spectral_gap_8_over_21 :
    QPos.eq (QPos.add ⟨13, 21, by decide⟩ ⟨8, 21, by decide⟩) ⟨1, 1, by decide⟩ := by
  unfold QPos.eq
  decide


/-! ## Section 5: Column Resistance Bridge (`18 R_code(F) = R_tilde(F + 2) - 1`, `E-GRV-0156/0157`) -/

/-- Exact numerator `18 * R_code(F) = ∑_{d = 0}^{F} N(d + 1)` matching `pair-density-gravity-slope.ts`
    (`E-GRV-0156/0157`), where `cVert[d] = 18 / N(d + 1)` and `R_code(F) = ∑_{d = 0}^{F} 1 / cVert[d]`. -/
def colResistanceCode18 (N : Nat → Nat) (F : Nat) : Nat :=
  sumNat (F + 1) (fun d => N (d + 1))

private theorem sumNat_shift (N : Nat → Nat) :
    ∀ k : Nat, N 0 + sumNat k (fun d => N (d + 1)) = sumNat (k + 1) N := by
  intro k
  induction k with
  | zero =>
    simp only [sumNat]
    omega
  | succ m ih =>
    change N 0 + (sumNat m (fun d => N (d + 1)) + N (m + 1)) = sumNat (m + 1) N + N (m + 1)
    omega

/-- Exact column resistance bridge between `Vibe.Geometry.colResistance` (`R_tilde(M) = ∑_{d=0}^{M-1} N_d`)
    and `E-GRV-0156/0157` (`18 R_code(F) = ∑_{d=0}^{F} N_{d+1}`):
    1. `18 R_code(F) + N(0) = R_tilde(F + 2)` for ALL `N : Nat → Nat` and ALL `F : Nat`.
    2. Whenever `N(0) = 1`, `18 R_code(F) = R_tilde(F + 2) - 1` for ALL `F : Nat`.
    3. Under `N(0) = 1` and `N(D + 1) ≥ 18 N(D)`, `17 * (18 R_code(F)) + 18 ≥ 18^(F + 2)` for ALL `F : Nat`. -/
theorem thm_col_resistance_code_bridge (N : Nat → Nat) (F : Nat) :
    colResistanceCode18 N F + N 0 = colResistance N (F + 2) ∧
    (N 0 = 1 → colResistanceCode18 N F = colResistance N (F + 2) - 1) ∧
    (N 0 = 1 → (∀ D : Nat, N (D + 1) ≥ 18 * N D) →
      17 * colResistanceCode18 N F + 18 ≥ 18 ^ (F + 2)) := by
  have hShift : colResistanceCode18 N F + N 0 = colResistance N (F + 2) := by
    unfold colResistanceCode18 colResistance
    have hs : N 0 + sumNat (F + 1) (fun d => N (d + 1)) = sumNat (F + 2) N :=
      sumNat_shift N (F + 1)
    omega
  refine ⟨hShift, ?_, ?_⟩
  · intro h0
    omega
  · intro h0 hstep
    have hExp := thm5_resistance_exp_lower_bound N (by omega) hstep (F + 2)
    omega

end Vibe
