module

public import Vibe.Rule
public import Vibe.Gauge
public import Mathlib.Data.Matrix.Basic
public import Mathlib.Data.Matrix.Mul
public import Mathlib.Data.Nat.GCD.Basic
import Mathlib.Algebra.Order.BigOperators.Group.Finset
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Positivity

/-!
# Vibe Theory: Transfer-Matrix Gap, Modular PQ Quality, `ℤ[ω]` Word Unitarity & Gram Positivity

- Theorem 14: Exact `3 × 3` `Z_3` transfer-matrix (`Matrix (Fin 3) (Fin 3) ℤ`) eigenmodes
  (`a + 2b`, `a - b`) via `Matrix.mulVec` and all-time strict spectral-gap decay for `a > b > 0`.
- Theorem 15: Modular divisibility lower bound `d ≥ N / gcd(N, q)` for `Z_N`-invariant
  Peccei-Quinn operators (with `Z_36` corollaries `d ≥ 18`, `d ≥ 36`), plus arbitrary-word
  zero-decimal `Mat2Eis` unitarity closure over `{M, M2, M†, M2†}`.
- Theorem 16: Canonical `Matrix (Fin m) (Fin n) ℤ` `Bᵀ * B` Gram reflection positivity
  `v ⬝ᵥ (Bᵀ * B) *ᵥ v = ∑ i, (B *ᵥ v i)^2 ≥ 0` and weighted `Bᵀ * diagonal w * B` positivity.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

open Matrix

/-! ## Theorem 14: Concrete `3 × 3` `Z_3` Transfer-Matrix Spectral Gap (`a > b > 0`, `∀ t ≥ 1`) -/

/-- Exact `3 × 3` `Z_3` single-plaquette transfer matrix `T_{ij} = a` if `i = j`, else `b`. -/
def z3TransferMat (a b : Int) : Matrix (Fin 3) (Fin 3) ℤ :=
  Matrix.of fun i j => if i = j then a else b

/-- Matrix-vector action `(T v)_i = ∑_{j : Fin 3} T_{ij} v_j` via `Matrix.mulVec`. -/
abbrev z3MatVec (a b : Int) (v : Fin 3 → ℤ) : Fin 3 → ℤ :=
  (z3TransferMat a b).mulVec v

/-- Uniform vacuum eigenvector `v_0 = (1, 1, 1)`. -/
def z3VacVec : Fin 3 → ℤ := ![1, 1, 1]

/-- Charged excited eigenvector `v_1 = (1, -1, 0)` orthogonal to `v_0`. -/
def z3ExcVec : Fin 3 → ℤ := ![1, -1, 0]

/-- Theorem 14a: `v_0 = (1, 1, 1)` is an exact eigenvector of the `3 × 3` `Z_3` transfer matrix
    with eigenvalue `λ_0 = a + 2 b` for ALL `a, b : Int`. -/
theorem thm14_z3_transfer_vacuum_eigenmode (a b : Int) (i : Fin 3) :
    z3MatVec a b z3VacVec i = (a + 2 * b) * z3VacVec i := by
  fin_cases i <;>
    simp [z3MatVec, z3TransferMat, z3VacVec, Matrix.mulVec, dotProduct, Fin.sum_univ_three] <;>
    ring

/-- Theorem 14b: `v_1 = (1, -1, 0)` is an exact eigenvector of the `3 × 3` `Z_3` transfer matrix
    with eigenvalue `λ_1 = a - b` for ALL `a, b : Int`. -/
theorem thm14_z3_transfer_excited_eigenmode (a b : Int) (i : Fin 3) :
    z3MatVec a b z3ExcVec i = (a - b) * z3ExcVec i := by
  fin_cases i <;>
    simp [z3MatVec, z3TransferMat, z3ExcVec, Matrix.mulVec, dotProduct, Fin.sum_univ_three] <;>
    ring

/-- Theorem 14c: Exact strict spectral gap for EVERY `a > b > 0` in the `3 × 3` `Z_3` transfer matrix:
    `0 < λ_1 = a - b < a + 2 b = λ_0` implies `(a - b)^t < (a + 2 b)^t` for ALL `t ≥ 1`. -/
theorem thm14_z3_transfer_mass_gap_all_time (a b : Nat) (hb : b > 0) (hab : a > b) :
    0 < a - b ∧ ∀ t : Nat, t ≥ 1 → (a - b) ^ t < (a + 2 * b) ^ t :=
  ⟨by omega, fun t ht => Nat.pow_lt_pow_left (by omega) (by omega)⟩

/-- Theorem 14d: Exponential factor-`2^t` suppression of the `Z_3` excited mode whenever `b < a ≤ 4 b`
    (`2 (a - b) ≤ a + 2 b`, mass gap `≥ ln 2`): `2^t (a - b)^t ≤ (a + 2 b)^t` for ALL `t : Nat`. -/
theorem thm14_z3_transfer_exp_suppression (a b : Nat) (hab : a > b) (hStrong : a ≤ 4 * b) :
    ∀ t : Nat, 2 ^ t * (a - b) ^ t ≤ (a + 2 * b) ^ t := by
  intro t
  rw [← mul_pow]
  exact Nat.pow_le_pow_left (by omega) t


/-! ## Theorem 15: Modular `Z_N` PQ Operator-Dimension Bound & Arbitrary-Word `Mat2Eis` Unitarity -/

/-- Theorem 15a: Exact modular divisibility theorem for discrete `Z_N` gauge protection of a
    Peccei-Quinn scalar of charge `q`: ANY `Z_N`-invariant singlet operator `Φ^d` (`d ≥ 1`,
    `(d * q) % N = 0`) must have operator dimension `d ≥ N / gcd(N, q)`. -/
theorem thm15_zn_pq_min_operator_dim (N q d : Nat) (hN : N ≥ 1) (hd : d ≥ 1)
    (hInv : (d * q) % N = 0) : d ≥ N / Nat.gcd N q := by
  let g := Nat.gcd N q
  have hgPos : 0 < g := Nat.gcd_pos_of_pos_left q hN
  have hCop : Nat.Coprime (N / g) (q / g) := Nat.coprime_div_gcd_div_gcd hgPos
  have hNdvd : N ∣ d * q := Nat.dvd_of_mod_eq_zero hInv
  have hDvd' : N / g ∣ d * (q / g) := by
    rcases hNdvd with ⟨k, hk⟩
    refine ⟨k, Nat.eq_of_mul_eq_mul_left hgPos ?_⟩
    calc g * (d * (q / g)) = d * (g * (q / g)) := by ring
      _ = d * q := by rw [Nat.mul_div_cancel' (Nat.gcd_dvd_right N q)]
      _ = N * k := hk
      _ = g * (N / g) * k := by rw [Nat.mul_div_cancel' (Nat.gcd_dvd_left N q)]
      _ = g * (N / g * k) := by ring
  exact Nat.le_of_dvd hd (hCop.dvd_of_dvd_mul_right hDvd')

/-- Corollary 15b: Under `Z_36` with PQ scalar charge `q = 2`, every invariant `Φ^d` has `d ≥ 18`. -/
theorem thm15_z36_pq_dim_ge_18 (d : Nat) (hd : d ≥ 1) (hInv : (d * 2) % 36 = 0) : d ≥ 18 :=
  thm15_zn_pq_min_operator_dim 36 2 d (by decide) hd hInv

/-- Corollary 15c: Under `Z_36` with fundamental charge `q = 1`, every invariant `Φ^d` has `d ≥ 36`. -/
theorem thm15_z36_pq_dim_ge_36 (d : Nat) (hd : d ≥ 1) (hInv : (d * 1) % 36 = 0) : d ≥ 36 :=
  thm15_zn_pq_min_operator_dim 36 1 d (by decide) hd hInv

/-- Exact anti-homomorphism `(A B)† = B† A†` on `Mat_2(ℤ[ω])`. -/
theorem thm15_mat2eis_dag_mul (A B : Mat2Eis) :
    Mat2Eis.dag (Mat2Eis.mul A B) = Mat2Eis.mul (Mat2Eis.dag B) (Mat2Eis.dag A) := by
  ext <;> dsimp [Mat2Eis.dag, Mat2Eis.mul, Eis.conj, Eis.add, Eis.mul] <;> ring

/-- Exact `ℤ[ω][1/2]` unitary composition closure:
    if `A† A = sA I` and `B† B = sB I`, then `(A B)† (A B) = (sA sB) I` with zero rounding error. -/
theorem thm15_mat2eis_unitary_comp (A B : Mat2Eis) (sA sB : Int)
    (hA : Mat2Eis.mul (Mat2Eis.dag A) A = Mat2Eis.scale sA Mat2Eis.id)
    (hB : Mat2Eis.mul (Mat2Eis.dag B) B = Mat2Eis.scale sB Mat2Eis.id) :
    Mat2Eis.mul (Mat2Eis.dag (Mat2Eis.mul A B)) (Mat2Eis.mul A B)
      = Mat2Eis.scale (sA * sB) Mat2Eis.id := by
  rw [thm15_mat2eis_dag_mul, Mat2Eis.mul_assoc, ← Mat2Eis.mul_assoc (Mat2Eis.dag A) A B, hA]
  have hScaleL : ∀ (s : Int) (M : Mat2Eis),
      Mat2Eis.mul (Mat2Eis.scale s Mat2Eis.id) M = Mat2Eis.scale s M := fun s M => by
    ext <;> dsimp [Mat2Eis.mul, Mat2Eis.scale, Mat2Eis.id, Eis.scale, Eis.one, Eis.zero, Eis.add, Eis.mul] <;> ring
  have hScaleScale : ∀ (s1 s2 : Int) (M : Mat2Eis),
      Mat2Eis.scale s1 (Mat2Eis.scale s2 M) = Mat2Eis.scale (s1 * s2) M := fun s1 s2 M => by
    ext <;> dsimp [Mat2Eis.scale, Eis.scale] <;> ring
  rw [hScaleL sA B, Mat2Eis.mul_scale, hB, hScaleScale]

/-- Exact integer powers of 4: `pow4Int n = 4^n`. -/
def pow4Int : Nat → Int
  | 0 => 1
  | n + 1 => 4 * pow4Int n

theorem thm15_gateM_pow_unitary_all_lengths :
    ∀ n : Nat,
      Mat2Eis.mul (Mat2Eis.dag (Mat2Eis.pow gateM n)) (Mat2Eis.pow gateM n)
        = Mat2Eis.scale (pow4Int n) Mat2Eis.id := by
  intro n; induction n with
  | zero => decide
  | succ k ih =>
    have hComp := thm15_mat2eis_unitary_comp (Mat2Eis.pow gateM k) gateM (pow4Int k) 4 ih thm3_M_unitary_left
    simpa only [Mat2Eis.pow, pow4Int, mul_comm (pow4Int k) 4] using hComp

theorem thm15_gateM2_unitary_left :
    Mat2Eis.mul (Mat2Eis.dag gateM2) gateM2 = Mat2Eis.scale 4 Mat2Eis.id := by
  decide

theorem thm15_gateM2_pow_unitary_all_lengths :
    ∀ n : Nat,
      Mat2Eis.mul (Mat2Eis.dag (Mat2Eis.pow gateM2 n)) (Mat2Eis.pow gateM2 n)
        = Mat2Eis.scale (pow4Int n) Mat2Eis.id := by
  intro n; induction n with
  | zero => decide
  | succ k ih =>
    have hComp := thm15_mat2eis_unitary_comp (Mat2Eis.pow gateM2 k) gateM2 (pow4Int k) 4 ih thm15_gateM2_unitary_left
    simpa only [Mat2Eis.pow, pow4Int, mul_comm (pow4Int k) 4] using hComp

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


/-! ## Theorem 16: Canonical `Bᵀ B` & Weighted `Bᵀ W B` Gram Reflection Positivity -/

/-- Theorem 16a: Exact `Bᵀ B` Gram reflection positivity for EVERY integer matrix
    `B : Matrix (Fin m) (Fin n) ℤ` and EVERY integer vector `v : Fin n → ℤ`:
    `v ⬝ᵥ (Bᵀ * B) *ᵥ v = ∑ i, (B *ᵥ v i)^2 ≥ 0`. -/
theorem thm16_gram_btb_positivity {m n : ℕ} (B : Matrix (Fin m) (Fin n) ℤ) (v : Fin n → ℤ) :
    dotProduct v ((Bᵀ * B).mulVec v) = ∑ i : Fin m, (B.mulVec v i) ^ 2 ∧
    0 ≤ dotProduct v ((Bᵀ * B).mulVec v) := by
  have hEq : dotProduct v ((Bᵀ * B).mulVec v) = ∑ i : Fin m, (B.mulVec v i) ^ 2 := by
    rw [← Matrix.mulVec_mulVec, Matrix.dotProduct_mulVec, Matrix.vecMul_transpose]
    simp [dotProduct, sq]
  exact ⟨hEq, hEq ▸ Finset.sum_nonneg fun i _ => sq_nonneg _⟩

/-- Theorem 16b: Weighted `Bᵀ W B` Gram reflection positivity: whenever all transfer weights
    satisfy `w i ≥ 0`, `v ⬝ᵥ (Bᵀ * diagonal w * B) *ᵥ v = ∑ i, w i * (B *ᵥ v i)^2 ≥ 0`. -/
theorem thm16_weighted_gram_positivity {m n : ℕ} (B : Matrix (Fin m) (Fin n) ℤ)
    (w : Fin m → ℤ) (v : Fin n → ℤ) (hPos : ∀ i : Fin m, 0 ≤ w i) :
    0 ≤ dotProduct v ((Bᵀ * Matrix.diagonal w * B).mulVec v) := by
  have hEq : dotProduct v ((Bᵀ * Matrix.diagonal w * B).mulVec v) =
      ∑ i : Fin m, w i * (B.mulVec v i) ^ 2 := by
    rw [Matrix.mul_assoc, ← Matrix.mulVec_mulVec, Matrix.dotProduct_mulVec,
      Matrix.vecMul_transpose, Matrix.mulVec_diagonal]
    simp only [dotProduct, sq]
    exact Finset.sum_congr rfl fun i _ => by ring
  rw [hEq]
  exact Finset.sum_nonneg fun i _ => mul_nonneg (hPos i) (sq_nonneg _)

end Vibe

end
