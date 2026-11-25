import Vibe.Rule
import Vibe.Gauge

/-!
# Vibe Theory: Transfer-Matrix Gap, Modular PQ Quality, `ℤ[ω]` Word Unitarity & Gram Positivity

- Theorem 14: Exact `3 × 3` `Z_3` transfer-matrix eigenmodes (`a + 2b`, `a - b`) and all-time
  strict spectral-gap decay for all `a > b > 0` and all `t ≥ 1`.
- Theorem 15: Modular divisibility lower bound `d ≥ N / gcd(N, q)` for `Z_N`-invariant
  Peccei-Quinn operators (with `Z_36` corollaries `d ≥ 18`, `d ≥ 36`), plus arbitrary-word
  zero-decimal `Mat2Eis` unitarity closure over `{M, M2, M†, M2†}`.
- Theorem 16: Explicit `B^T B` Gram reflection positivity `v^T (B^T B) v = ∑_i (B_i · v)^2 ≥ 0`
  and weighted Gram positivity for arbitrary integer matrices `B` and vectors `v`.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Theorem 14: Concrete `3 × 3` `Z_3` Transfer-Matrix Spectral Gap (`a > b > 0`, `∀ t ≥ 1`) -/

/-- Exact `3 × 3` `Z_3` single-plaquette transfer matrix `T_{ij} = a` if `i = j`, else `b`. -/
def z3TransferMat (a b : Int) (i j : Fin 3) : Int :=
  if i = j then a else b

/-- Matrix-vector action `(T v)_i = ∑_{j : Fin 3} T_{ij} v_j`. -/
def z3MatVec (a b : Int) (v : Fin 3 → Int) (i : Fin 3) : Int :=
  z3TransferMat a b i 0 * v 0 + z3TransferMat a b i 1 * v 1 + z3TransferMat a b i 2 * v 2

/-- Uniform vacuum eigenvector `v_0 = (1, 1, 1)`. -/
def z3VacVec : Fin 3 → Int := fun _ => 1

/-- Charged excited eigenvector `v_1 = (1, -1, 0)` orthogonal to `v_0`. -/
def z3ExcVec : Fin 3 → Int
  | ⟨0, _⟩ => 1
  | ⟨1, _⟩ => -1
  | ⟨2, _⟩ => 0

/-- Theorem 14a: `v_0 = (1, 1, 1)` is an exact eigenvector of the `3 × 3` `Z_3` transfer matrix
    with eigenvalue `λ_0 = a + 2 b` for ALL `a, b : Int`. -/
theorem thm14_z3_transfer_vacuum_eigenmode (a b : Int) (i : Fin 3) :
    z3MatVec a b z3VacVec i = (a + 2 * b) * z3VacVec i := by
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ =>
    simp [z3MatVec, z3TransferMat, z3VacVec]
    omega

/-- Theorem 14b: `v_1 = (1, -1, 0)` is an exact eigenvector of the `3 × 3` `Z_3` transfer matrix
    with eigenvalue `λ_1 = a - b` for ALL `a, b : Int` (and is orthogonal to `v_0`). -/
theorem thm14_z3_transfer_excited_eigenmode (a b : Int) (i : Fin 3) :
    z3MatVec a b z3ExcVec i = (a - b) * z3ExcVec i := by
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ =>
    simp [z3MatVec, z3TransferMat, z3ExcVec]
    omega

private theorem nat_pow_lt_of_lt (l0 l1 : Nat) (hGap : l1 < l0) :
    ∀ t : Nat, t ≥ 1 → l1 ^ t < l0 ^ t := by
  intro t ht
  cases t with
  | zero => omega
  | succ k =>
    induction k with
    | zero =>
      change l1 ^ 1 < l0 ^ 1
      rw [Nat.pow_one, Nat.pow_one]
      exact hGap
    | succ m ih =>
      have hPrev : l1 ^ (m + 1) < l0 ^ (m + 1) := ih (by omega)
      have hPos0 : 0 < l0 := by omega
      have h1 : l1 ^ (m + 1) * l1 ≤ l1 ^ (m + 1) * l0 :=
        Nat.mul_le_mul_left (l1 ^ (m + 1)) (Nat.le_of_lt hGap)
      have h2 : l1 ^ (m + 1) * l0 < l0 ^ (m + 1) * l0 :=
        Nat.mul_lt_mul_of_pos_right hPrev hPos0
      change l1 ^ (m + 2) < l0 ^ (m + 2)
      rw [Nat.pow_succ l1 (m + 1), Nat.pow_succ l0 (m + 1)]
      exact Nat.lt_of_le_of_lt h1 h2

private theorem nat_pow_mul_le (l0 l1 : Nat) (hGap : 2 * l1 ≤ l0) :
    ∀ t : Nat, 2 ^ t * l1 ^ t ≤ l0 ^ t := by
  intro t
  induction t with
  | zero =>
    simp only [Nat.pow_zero]
    decide
  | succ k ih =>
    have hLhs : 2 ^ (k + 1) * l1 ^ (k + 1) = (2 ^ k * l1 ^ k) * (2 * l1) := by
      rw [Nat.pow_succ 2 k, Nat.pow_succ l1 k]
      calc
        2 ^ k * 2 * (l1 ^ k * l1) = 2 ^ k * (2 * (l1 ^ k * l1)) := by rw [Nat.mul_assoc]
        _ = 2 ^ k * (l1 ^ k * (2 * l1)) := by
          rw [← Nat.mul_assoc 2 (l1 ^ k) l1, Nat.mul_comm 2 (l1 ^ k), Nat.mul_assoc (l1 ^ k) 2 l1]
        _ = (2 ^ k * l1 ^ k) * (2 * l1) := by rw [← Nat.mul_assoc]
    have hRhs : l0 ^ (k + 1) = l0 ^ k * l0 := Nat.pow_succ l0 k
    rw [hLhs, hRhs]
    exact Nat.mul_le_mul ih hGap

/-- Theorem 14c: Exact strict spectral gap for EVERY `a > b > 0` in the `3 × 3` `Z_3` transfer matrix:
    `0 < λ_1 = a - b < a + 2 b = λ_0` implies `(a - b)^t < (a + 2 b)^t` for ALL `t ≥ 1`. -/
theorem thm14_z3_transfer_mass_gap_all_time (a b : Nat) (hb : b > 0) (hab : a > b) :
    0 < a - b ∧ ∀ t : Nat, t ≥ 1 → (a - b) ^ t < (a + 2 * b) ^ t := by
  refine ⟨by omega, ?_⟩
  exact nat_pow_lt_of_lt (a + 2 * b) (a - b) (by omega)

/-- Theorem 14d: Exponential factor-`2^t` suppression of the `Z_3` excited mode whenever `b < a ≤ 4 b`
    (`2 (a - b) ≤ a + 2 b`, mass gap `≥ ln 2`): `2^t (a - b)^t ≤ (a + 2 b)^t` for ALL `t : Nat`. -/
theorem thm14_z3_transfer_exp_suppression (a b : Nat) (hab : a > b) (hStrong : a ≤ 4 * b) :
    ∀ t : Nat, 2 ^ t * (a - b) ^ t ≤ (a + 2 * b) ^ t :=
  nat_pow_mul_le (a + 2 * b) (a - b) (by omega)


/-! ## Theorem 15: Modular `Z_N` PQ Operator-Dimension Bound & Arbitrary-Word `Mat2Eis` Unitarity -/

/-- Theorem 15a: Exact modular divisibility theorem for discrete `Z_N` gauge protection of a
    Peccei-Quinn scalar of charge `q`: ANY `Z_N`-invariant singlet operator `Φ^d` (`d ≥ 1`,
    `(d * q) % N = 0`) must have operator dimension `d ≥ N / gcd(N, q)`. -/
theorem thm15_zn_pq_min_operator_dim (N q d : Nat) (hN : N ≥ 1) (hd : d ≥ 1)
    (hInv : (d * q) % N = 0) : d ≥ N / Nat.gcd N q := by
  let g := Nat.gcd N q
  let n' := N / g
  let q' := q / g
  have hgPos : 0 < g := Nat.gcd_pos_of_pos_left q hN
  have hN_eq : g * n' = N := Nat.mul_div_cancel' (Nat.gcd_dvd_left N q)
  have hq_eq : g * q' = q := Nat.mul_div_cancel' (Nat.gcd_dvd_right N q)
  have hCoprime : Nat.gcd n' q' = 1 := by
    have hMul : g * Nat.gcd n' q' = g * 1 := by
      calc g * Nat.gcd n' q'
          = Nat.gcd (g * n') (g * q') := (Nat.gcd_mul_left g n' q').symm
        _ = Nat.gcd N q := by rw [hN_eq, hq_eq]
        _ = g * 1 := (Nat.mul_one g).symm
    exact Nat.eq_of_mul_eq_mul_left hgPos hMul
  have hNdvd : N ∣ d * q := Nat.dvd_of_mod_eq_zero hInv
  cases hNdvd with
  | intro k hk =>
  have hn'dvd_dq' : n' ∣ d * q' := by
    refine ⟨k, ?_⟩
    have hMul : g * (d * q') = g * (n' * k) := by
      calc g * (d * q')
          = d * (g * q') := Nat.mul_left_comm g d q'
        _ = d * q := by rw [hq_eq]
        _ = N * k := hk
        _ = (g * n') * k := by rw [hN_eq]
        _ = g * (n' * k) := Nat.mul_assoc g n' k
    exact Nat.eq_of_mul_eq_mul_left hgPos hMul
  have hn'dvd_dn' : n' ∣ d * n' := ⟨d, Nat.mul_comm d n'⟩
  have hn'dvd_gcd : n' ∣ Nat.gcd (d * n') (d * q') := Nat.dvd_gcd hn'dvd_dn' hn'dvd_dq'
  have hGcdEq : Nat.gcd (d * n') (d * q') = d := by
    rw [Nat.gcd_mul_left, hCoprime, Nat.mul_one]
  rw [hGcdEq] at hn'dvd_gcd
  exact Nat.le_of_dvd hd hn'dvd_gcd

/-- Corollary 15b: Under `Z_36` with PQ scalar charge `q = 2`, every invariant `Φ^d` has `d ≥ 18`. -/
theorem thm15_z36_pq_dim_ge_18 (d : Nat) (hd : d ≥ 1) (hInv : (d * 2) % 36 = 0) : d ≥ 18 :=
  thm15_zn_pq_min_operator_dim 36 2 d (by decide) hd hInv

/-- Corollary 15c: Under `Z_36` with fundamental charge `q = 1`, every invariant `Φ^d` has `d ≥ 36`. -/
theorem thm15_z36_pq_dim_ge_36 (d : Nat) (hd : d ≥ 1) (hInv : (d * 1) % 36 = 0) : d ≥ 36 :=
  thm15_zn_pq_min_operator_dim 36 1 d (by decide) hd hInv

/-- Exact anti-homomorphism `(A B)† = B† A†` on `Mat_2(ℤ[ω])` using `StarCommRing Eis`. -/
theorem thm15_mat2eis_dag_mul (A B : Mat2Eis) :
    Mat2Eis.dag (Mat2Eis.mul A B) = Mat2Eis.mul (Mat2Eis.dag B) (Mat2Eis.dag A) := by
  have hAdd : ∀ x y : Eis, Eis.conj (Eis.add x y) = Eis.add (Eis.conj x) (Eis.conj y) :=
    StarCommRing.conj_add
  have hMul : ∀ x y : Eis, Eis.conj (Eis.mul x y) = Eis.mul (Eis.conj y) (Eis.conj x) := by
    intro x y
    exact Eq.trans (StarCommRing.conj_mul (R := Eis) x y)
      (StarCommRing.mul_comm (R := Eis) (Eis.conj x) (Eis.conj y))
  cases A; cases B
  simp only [Mat2Eis.dag, Mat2Eis.mul, Mat2Eis.mk.injEq]
  refine ⟨?_, ?_, ?_, ?_⟩ <;> rw [hAdd, hMul, hMul]

/-- Exact `ℤ[ω][1/2]` unitary composition closure:
    if `A† A = sA I` and `B† B = sB I`, then `(A B)† (A B) = (sA sB) I` with zero rounding error. -/
theorem thm15_mat2eis_unitary_comp (A B : Mat2Eis) (sA sB : Int)
    (hA : Mat2Eis.mul (Mat2Eis.dag A) A = Mat2Eis.scale sA Mat2Eis.id)
    (hB : Mat2Eis.mul (Mat2Eis.dag B) B = Mat2Eis.scale sB Mat2Eis.id) :
    Mat2Eis.mul (Mat2Eis.dag (Mat2Eis.mul A B)) (Mat2Eis.mul A B)
      = Mat2Eis.scale (sA * sB) Mat2Eis.id := by
  rw [thm15_mat2eis_dag_mul, Mat2Eis.mul_assoc, ← Mat2Eis.mul_assoc (Mat2Eis.dag A) A B, hA]
  have hScaleL : ∀ (s : Int) (M : Mat2Eis),
      Mat2Eis.mul (Mat2Eis.scale s Mat2Eis.id) M = Mat2Eis.scale s M := by
    intro s M
    cases M with
    | mk m00 m01 m10 m11 =>
      cases m00; cases m01; cases m10; cases m11
      simp only [Mat2Eis.mul, Mat2Eis.scale, Mat2Eis.id, Eis.scale, Eis.one, Eis.zero, Eis.add, Eis.mul,
        Int.mul_one, Int.mul_zero, Int.zero_mul, Int.add_zero, Int.zero_add, Int.sub_zero]
  have hScaleScale : ∀ (s1 s2 : Int) (M : Mat2Eis),
      Mat2Eis.scale s1 (Mat2Eis.scale s2 M) = Mat2Eis.scale (s1 * s2) M := by
    intro s1 s2 M
    cases M with
    | mk m00 m01 m10 m11 =>
      cases m00; cases m01; cases m10; cases m11
      simp only [Mat2Eis.scale, Eis.scale, Mat2Eis.mk.injEq, Eis.mk.injEq]
      refine ⟨⟨?_, ?_⟩, ⟨?_, ?_⟩, ⟨?_, ?_⟩, ⟨?_, ?_⟩⟩ <;>
        rw [Int.mul_assoc]
  rw [hScaleL sA B, Mat2Eis.mul_scale, hB, hScaleScale]

/-- Exact integer powers of 4: `pow4Int n = 4^n`. -/
def pow4Int : Nat → Int
  | 0 => 1
  | n + 1 => 4 * pow4Int n

theorem thm15_gateM_pow_unitary_all_lengths :
    ∀ n : Nat,
      Mat2Eis.mul (Mat2Eis.dag (Mat2Eis.pow gateM n)) (Mat2Eis.pow gateM n)
        = Mat2Eis.scale (pow4Int n) Mat2Eis.id := by
  intro n
  induction n with
  | zero => decide
  | succ k ih =>
    have hStep : Mat2Eis.pow gateM (k + 1) = Mat2Eis.mul (Mat2Eis.pow gateM k) gateM := rfl
    rw [hStep]
    have hComp := thm15_mat2eis_unitary_comp (Mat2Eis.pow gateM k) gateM (pow4Int k) 4 ih thm3_M_unitary_left
    rw [hComp]
    have hComm : pow4Int k * 4 = pow4Int (k + 1) := by
      change pow4Int k * 4 = 4 * pow4Int k
      exact Int.mul_comm (pow4Int k) 4
    rw [hComm]

theorem thm15_gateM2_unitary_left :
    Mat2Eis.mul (Mat2Eis.dag gateM2) gateM2 = Mat2Eis.scale 4 Mat2Eis.id := by
  decide

theorem thm15_gateM2_pow_unitary_all_lengths :
    ∀ n : Nat,
      Mat2Eis.mul (Mat2Eis.dag (Mat2Eis.pow gateM2 n)) (Mat2Eis.pow gateM2 n)
        = Mat2Eis.scale (pow4Int n) Mat2Eis.id := by
  intro n
  induction n with
  | zero => decide
  | succ k ih =>
    have hStep : Mat2Eis.pow gateM2 (k + 1) = Mat2Eis.mul (Mat2Eis.pow gateM2 k) gateM2 := rfl
    rw [hStep]
    have hComp := thm15_mat2eis_unitary_comp (Mat2Eis.pow gateM2 k) gateM2 (pow4Int k) 4 ih thm15_gateM2_unitary_left
    rw [hComp]
    have hComm : pow4Int k * 4 = pow4Int (k + 1) := by
      change pow4Int k * 4 = 4 * pow4Int k
      exact Int.mul_comm (pow4Int k) 4
    rw [hComm]

/-- Four-generator dense `SU(2)` gate alphabet `{M, M2, M†, M2†}` inside `Mat_2(ℤ[ω])`. -/
inductive EisGen where
  | m1
  | m2
  | m1Dag
  | m2Dag
  deriving DecidableEq, Repr

/-- Interpret a single alphabet letter as a `Mat2Eis` gate. -/
def evalEisGen : EisGen → Mat2Eis
  | .m1    => gateM
  | .m2    => gateM2
  | .m1Dag => Mat2Eis.dag gateM
  | .m2Dag => Mat2Eis.dag gateM2

/-- Evaluate any arbitrary finite word `w : List EisGen` as the exact matrix product in `Mat_2(ℤ[ω])`. -/
def evalEisWord : List EisGen → Mat2Eis
  | []      => Mat2Eis.id
  | g :: gs => Mat2Eis.mul (evalEisGen g) (evalEisWord gs)

private theorem evalEisGen_unitary_left (g : EisGen) :
    Mat2Eis.mul (Mat2Eis.dag (evalEisGen g)) (evalEisGen g) = Mat2Eis.scale 4 Mat2Eis.id := by
  cases g <;> decide

/-- Theorem 15d: Arbitrary-word zero-decimal unitarity closure in `ℤ[ω][1/2]`:
    for EVERY finite word `w : List EisGen` over `{M, M2, M†, M2†}`,
    `(evalEisWord w)† (evalEisWord w) = 4^(w.length) I` identically. -/
theorem thm15_eisWord_unitary_all_words (w : List EisGen) :
    Mat2Eis.mul (Mat2Eis.dag (evalEisWord w)) (evalEisWord w)
      = Mat2Eis.scale (pow4Int w.length) Mat2Eis.id := by
  induction w with
  | nil => decide
  | cons g gs ih =>
    simp only [evalEisWord, List.length_cons, pow4Int]
    exact thm15_mat2eis_unitary_comp (evalEisGen g) (evalEisWord gs) 4 (pow4Int gs.length)
      (evalEisGen_unitary_left g) ih


/-! ## Theorem 16: Explicit `B^T B` Gram Reflection Positivity (`v^T (B^T B) v ≥ 0`) -/

/-- Exact integer inner product `u · v = ∑_j u_j v_j`. -/
def dotInt : List Int → List Int → Int
  | [], _ => 0
  | _, [] => 0
  | x :: xs, y :: ys => x * y + dotInt xs ys

/-- Matrix-vector product `B v` for an arbitrary integer matrix `B` represented as a list of rows. -/
def matVecInt (B : List (List Int)) (v : List Int) : List Int :=
  B.map (fun row => dotInt row v)

/-- Sum of squares `∑_i y_i^2` of an integer vector. -/
def sumSqInt : List Int → Int
  | [] => 0
  | x :: xs => x * x + sumSqInt xs

private theorem sumSqInt_nonneg (xs : List Int) : 0 ≤ sumSqInt xs := by
  induction xs with
  | nil => decide
  | cons x rest ih =>
    simp only [sumSqInt]
    have hx := int_sq_nonneg x
    omega

/-- Inner bilinear sum `∑_j (v_j r_j) (r_k v_k)` for one fixed `k`-term. -/
def rowGramInner (rk vk : Int) : List Int → List Int → Int
  | [], _ => 0
  | _, [] => 0
  | rj :: rs, vj :: vs => (rj * vj) * (rk * vk) + rowGramInner rk vk rs vs

/-- Outer bilinear sum `∑_k ∑_j (r_j v_j) (r_k v_k) = v^T (r^T r) v`. -/
def rowGramOuter (r v : List Int) : List Int → List Int → Int
  | [], _ => 0
  | _, [] => 0
  | rk :: rs, vk :: vs => rowGramInner rk vk r v + rowGramOuter r v rs vs

/-- Full explicit `B^T B` Gram quadratic form `v^T (B^T B) v = ∑_{row ∈ B} ∑_k ∑_j B_{ij} v_j B_{ik} v_k`. -/
def gramQuadForm (B : List (List Int)) (v : List Int) : Int :=
  match B with
  | [] => 0
  | row :: rest => rowGramOuter row v row v + gramQuadForm rest v

private theorem rowGramInner_eq (rk vk : Int) (xs ys : List Int) :
    rowGramInner rk vk xs ys = dotInt xs ys * (rk * vk) := by
  induction xs generalizing ys with
  | nil =>
    simp only [rowGramInner, dotInt, Int.zero_mul]
  | cons x rest ih =>
    cases ys with
    | nil =>
      simp only [rowGramInner, dotInt, Int.zero_mul]
    | cons y resty =>
      simp only [rowGramInner, dotInt]
      rw [ih resty, Int.add_mul]

private theorem rowGramOuter_eq (r v xs ys : List Int) :
    rowGramOuter r v xs ys = dotInt r v * dotInt xs ys := by
  induction xs generalizing ys with
  | nil =>
    simp only [rowGramOuter, dotInt, Int.mul_zero]
  | cons x rest ih =>
    cases ys with
    | nil =>
      simp only [rowGramOuter, dotInt, Int.mul_zero]
    | cons y resty =>
      simp only [rowGramOuter, dotInt]
      rw [rowGramInner_eq, ih resty, Int.mul_add]

/-- Theorem 16a: Exact `B^T B` Gram reflection positivity for EVERY integer matrix `B`
    and EVERY integer vector `v`:
    `v^T (B^T B) v = ∑_i (∑_j B_{ij} v_j)^2 ≥ 0`. -/
theorem thm16_gram_btb_positivity (B : List (List Int)) (v : List Int) :
    gramQuadForm B v = sumSqInt (matVecInt B v) ∧ 0 ≤ gramQuadForm B v := by
  have hEq : gramQuadForm B v = sumSqInt (matVecInt B v) := by
    induction B with
    | nil => rfl
    | cons row rest ih =>
      simp only [gramQuadForm, matVecInt, List.map_cons, sumSqInt]
      rw [rowGramOuter_eq, ih]
      rfl
  exact ⟨hEq, hEq ▸ sumSqInt_nonneg (matVecInt B v)⟩

/-- Weighted Gram quadratic form `∑_i w_i (v^T (r_i^T r_i) v)` with per-row weights `w_i`. -/
def weightedGramQuadForm (weightedRows : List (Int × List Int)) (v : List Int) : Int :=
  match weightedRows with
  | [] => 0
  | (w, row) :: rest => w * rowGramOuter row v row v + weightedGramQuadForm rest v

/-- Theorem 16b: Weighted `B^T W B` Gram reflection positivity: whenever all transfer weights
    satisfy `w_i ≥ 0`, `v^T (B^T W B) v = ∑_i w_i (B_i · v)^2 ≥ 0` for EVERY vector `v`. -/
theorem thm16_weighted_gram_positivity (weightedRows : List (Int × List Int)) (v : List Int)
    (hPos : ∀ p ∈ weightedRows, 0 ≤ p.1) : 0 ≤ weightedGramQuadForm weightedRows v := by
  induction weightedRows with
  | nil =>
    simp only [weightedGramQuadForm]
    decide
  | cons p rest ih =>
    cases p with
    | mk w row =>
      simp only [weightedGramQuadForm]
      rw [rowGramOuter_eq]
      have hw : 0 ≤ w := hPos (w, row) (List.Mem.head rest)
      have hx : 0 ≤ dotInt row v * dotInt row v := int_sq_nonneg (dotInt row v)
      have hTerm : 0 ≤ w * (dotInt row v * dotInt row v) := Int.mul_nonneg hw hx
      have hRest : 0 ≤ weightedGramQuadForm rest v := ih (fun q hq => hPos q (List.Mem.tail _ hq))
      omega

end Vibe
