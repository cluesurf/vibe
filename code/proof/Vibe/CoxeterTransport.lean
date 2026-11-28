module

public import Vibe.Algebra
public import Vibe.Geometry
public import Mathlib.NumberTheory.Zsqrtd.Basic
public import Mathlib.Data.Matrix.Basic
public import Mathlib.Data.Matrix.Mul
public import Mathlib.LinearAlgebra.Matrix.Determinant.Basic
import Mathlib.Tactic.Ring

/-!
# Vibe Theory: Exact `O^+(4,1; ℤ[√2])` Coxeter Transport Algebra & Palindromic `T / CP / CPT`

Formalization over Mathlib `Zsqrtd 2` (`ℤ[√2]`) and `Matrix (Fin 5) (Fin 5) (Zsqrtd 2)` of the
exact `5 × 5` Coxeter group geometry of the infinite `{3,4,3,4}` hyperbolic honeycomb
(`code/substrate/coxeter/exact-3434.ts`, `code/substrate/coxeter/exact-cusp.ts`):

1. **Exact Ring `ℤ[√2]` (`Zsqrtd 2`) & `5 × 5` Matrix Algebra (`Matrix (Fin 5) (Fin 5) ZSqrt2`):**
   Bridged directly to Mathlib's `CommRing`, `Matrix` multiplication/transpose/`mulVec`, `dotProduct`,
   and `Matrix.det` (`mat5Det_eq_det`).
2. **Exact `{3,4,3,4}` Lorentzian Form `2 B` & Cell Symmetry:**
   `twiceGram` (`det(2 B) = -2`), `baseCenter` (`2 B(c_0, c_0) = -2`), `cuspVertex` (`2 B(v, v) = 0`),
   and `centralInversion` `Z` (`Z^2 = I_5`, `Zᵀ (2 B) Z = 2 B`, `det(Z) = +1`, `Z c_0 = c_0`).
3. **All 24 Facet Normals & Transports `k_a = F_a Z` (in exact `rootsD4()` order):**
   Exact Gram isomorphism to `D_4`, Lorentzian preservation `k_aᵀ (2 B) k_a = 2 B`, orthochronous
   sheet `2 B(k_a c_0, c_0) = -6 < 0`, `det(k_a) = -1`, antipodal inverse `k_a k_{-a} = I_5`,
   all-word closure, infinite-honeycomb `S R S = R`, and `[0, 6, 18]` cusp dock-0 split.
4. **Palindromic Algebraic `T`, `CP`, and `CPT` Symmetry Theorem.**
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

open Matrix

/-! ## Section 1: Exact Quadratic Integer Ring `ℤ[√2]` (`Zsqrtd 2`) -/

/-- Exact quadratic integer `a + b √2 ∈ ℤ[√2]` backed by Mathlib `Zsqrtd 2`. -/
abbrev ZSqrt2 := Zsqrtd 2

namespace ZSqrt2

abbrev a (x : ZSqrt2) : Int := x.re
abbrev b (x : ZSqrt2) : Int := x.im

def zero : ZSqrt2 := ⟨0, 0⟩
def one : ZSqrt2 := ⟨1, 0⟩
def two : ZSqrt2 := ⟨2, 0⟩
def negOne : ZSqrt2 := ⟨-1, 0⟩
def sqrt2 : ZSqrt2 := ⟨0, 1⟩
def ofInt (k : Int) : ZSqrt2 := ⟨k, 0⟩

def add (x y : ZSqrt2) : ZSqrt2 := ⟨x.re + y.re, x.im + y.im⟩
def neg (x : ZSqrt2) : ZSqrt2 := ⟨-x.re, -x.im⟩
def sub (x y : ZSqrt2) : ZSqrt2 := ⟨x.re - y.re, x.im - y.im⟩
def scale (k : Int) (x : ZSqrt2) : ZSqrt2 := ⟨k * x.re, k * x.im⟩

/-- `(a + b √2)(c + d √2) = (a c + 2 b d) + (a d + b c) √2`. -/
def mul (x y : ZSqrt2) : ZSqrt2 :=
  ⟨x.re * y.re + 2 * x.im * y.im, x.re * y.im + x.im * y.re⟩

-- [helper]
theorem mk.injEq (a₁ b₁ a₂ b₂ : Int) :
    (⟨a₁, b₁⟩ : ZSqrt2) = ⟨a₂, b₂⟩ ↔ a₁ = a₂ ∧ b₁ = b₂ :=
  Zsqrtd.mk.injEq a₁ b₁ a₂ b₂

end ZSqrt2


/-! ## Section 2: `5 × 5` Matrices & Vectors over `ℤ[√2]` (`Matrix (Fin 5) (Fin 5) ZSqrt2`) -/

/-- Exact 5-vector over `ℤ[√2]`. -/
abbrev Vec5 := Fin 5 → ZSqrt2

/-- Exact `5 × 5` matrix over `ℤ[√2]` backed by Mathlib `Matrix`. -/
abbrev Mat5 := Matrix (Fin 5) (Fin 5) ZSqrt2

/-- Flat 5-term sum over `Fin 5` in `ℤ[√2]` (definitionally equal to `∑ k : Fin 5, f k`). -/
def sum5 (f : Fin 5 → ZSqrt2) : ZSqrt2 :=
  ZSqrt2.add
    (ZSqrt2.add
      (ZSqrt2.add
        (ZSqrt2.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩))
        (f ⟨2, by decide⟩))
      (f ⟨3, by decide⟩))
    (f ⟨4, by decide⟩)

def dot5 (u v : Vec5) : ZSqrt2 := sum5 (fun k => ZSqrt2.mul (u k) (v k))

def mat5Id : Mat5 := fun i j => if i = j then ZSqrt2.one else ZSqrt2.zero

def mat5Transpose (A : Mat5) : Mat5 := fun i j => A j i

def mat5Vec (A : Mat5) (v : Vec5) : Vec5 := fun i => sum5 (fun k => ZSqrt2.mul (A i k) (v k))

def mat5Mul (A B : Mat5) : Mat5 := fun i j => sum5 (fun k => ZSqrt2.mul (A i k) (B k j))

private theorem sum5_eq_sum (f : Fin 5 → ZSqrt2) : sum5 f = ∑ k : Fin 5, f k := by
  rw [Fin.sum_univ_five]
  ext <;> dsimp [sum5, ZSqrt2.add] <;> ring

private theorem dot5_eq_dot (u v : Vec5) : dot5 u v = dotProduct u v := by
  rw [dot5, dotProduct, sum5_eq_sum]; rfl

private theorem mat5Id_eq_one : mat5Id = (1 : Mat5) := by
  ext i j; simp only [mat5Id, Matrix.one_apply]; split_ifs <;> rfl

private theorem mat5Transpose_eq (A : Mat5) : mat5Transpose A = Aᵀ := rfl

private theorem mat5Vec_eq_mulVec (A : Mat5) (v : Vec5) : mat5Vec A v = A.mulVec v := by
  ext i; simp only [mat5Vec, Matrix.mulVec, dotProduct, sum5_eq_sum]; rfl

private theorem mat5Mul_eq_mul (A B : Mat5) : mat5Mul A B = A * B := by
  ext i j; simp only [mat5Mul, Matrix.mul_apply, sum5_eq_sum]; rfl

/-- Exact `2 × 2` determinant helper over `ℤ[√2]`. -/
def det2Z2 (a b c d : ZSqrt2) : ZSqrt2 :=
  ZSqrt2.sub (ZSqrt2.mul a d) (ZSqrt2.mul b c)

/-- Exact `5 × 5` determinant over `ℤ[√2]` via shared-minor `(2 × 2) × (3 × 3)` Laplace expansion
    along rows `(0, 1)` and `(2, 3, 4)` (proved identical to Mathlib's `Matrix.det` below). -/
def mat5Det (M : Mat5) : ZSqrt2 :=
  let i0 : Fin 5 := ⟨0, by decide⟩
  let i1 : Fin 5 := ⟨1, by decide⟩
  let i2 : Fin 5 := ⟨2, by decide⟩
  let i3 : Fin 5 := ⟨3, by decide⟩
  let i4 : Fin 5 := ⟨4, by decide⟩
  let b01 := det2Z2 (M i3 i0) (M i3 i1) (M i4 i0) (M i4 i1)
  let b02 := det2Z2 (M i3 i0) (M i3 i2) (M i4 i0) (M i4 i2)
  let b03 := det2Z2 (M i3 i0) (M i3 i3) (M i4 i0) (M i4 i3)
  let b04 := det2Z2 (M i3 i0) (M i3 i4) (M i4 i0) (M i4 i4)
  let b12 := det2Z2 (M i3 i1) (M i3 i2) (M i4 i1) (M i4 i2)
  let b13 := det2Z2 (M i3 i1) (M i3 i3) (M i4 i1) (M i4 i3)
  let b14 := det2Z2 (M i3 i1) (M i3 i4) (M i4 i1) (M i4 i4)
  let b23 := det2Z2 (M i3 i2) (M i3 i3) (M i4 i2) (M i4 i3)
  let b24 := det2Z2 (M i3 i2) (M i3 i4) (M i4 i2) (M i4 i4)
  let b34 := det2Z2 (M i3 i3) (M i3 i4) (M i4 i3) (M i4 i4)
  let d234 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i2) b34) (ZSqrt2.mul (M i2 i3) b24)) (ZSqrt2.mul (M i2 i4) b23)
  let d134 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i1) b34) (ZSqrt2.mul (M i2 i3) b14)) (ZSqrt2.mul (M i2 i4) b13)
  let d124 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i1) b24) (ZSqrt2.mul (M i2 i2) b14)) (ZSqrt2.mul (M i2 i4) b12)
  let d123 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i1) b23) (ZSqrt2.mul (M i2 i2) b13)) (ZSqrt2.mul (M i2 i3) b12)
  let d034 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i0) b34) (ZSqrt2.mul (M i2 i3) b04)) (ZSqrt2.mul (M i2 i4) b03)
  let d024 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i0) b24) (ZSqrt2.mul (M i2 i2) b04)) (ZSqrt2.mul (M i2 i4) b02)
  let d023 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i0) b23) (ZSqrt2.mul (M i2 i2) b03)) (ZSqrt2.mul (M i2 i3) b02)
  let d014 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i0) b14) (ZSqrt2.mul (M i2 i1) b04)) (ZSqrt2.mul (M i2 i4) b01)
  let d013 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i0) b13) (ZSqrt2.mul (M i2 i1) b03)) (ZSqrt2.mul (M i2 i3) b01)
  let d012 := ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul (M i2 i0) b12) (ZSqrt2.mul (M i2 i1) b02)) (ZSqrt2.mul (M i2 i2) b01)
  let a01 := det2Z2 (M i0 i0) (M i0 i1) (M i1 i0) (M i1 i1)
  let a02 := det2Z2 (M i0 i0) (M i0 i2) (M i1 i0) (M i1 i2)
  let a03 := det2Z2 (M i0 i0) (M i0 i3) (M i1 i0) (M i1 i3)
  let a04 := det2Z2 (M i0 i0) (M i0 i4) (M i1 i0) (M i1 i4)
  let a12 := det2Z2 (M i0 i1) (M i0 i2) (M i1 i1) (M i1 i2)
  let a13 := det2Z2 (M i0 i1) (M i0 i3) (M i1 i1) (M i1 i3)
  let a14 := det2Z2 (M i0 i1) (M i0 i4) (M i1 i1) (M i1 i4)
  let a23 := det2Z2 (M i0 i2) (M i0 i3) (M i1 i2) (M i1 i3)
  let a24 := det2Z2 (M i0 i2) (M i0 i4) (M i1 i2) (M i1 i4)
  let a34 := det2Z2 (M i0 i3) (M i0 i4) (M i1 i3) (M i1 i4)
  let t0 := ZSqrt2.mul a01 d234
  let t1 := ZSqrt2.sub t0 (ZSqrt2.mul a02 d134)
  let t2 := ZSqrt2.add t1 (ZSqrt2.mul a03 d124)
  let t3 := ZSqrt2.sub t2 (ZSqrt2.mul a04 d123)
  let t4 := ZSqrt2.add t3 (ZSqrt2.mul a12 d034)
  let t5 := ZSqrt2.sub t4 (ZSqrt2.mul a13 d024)
  let t6 := ZSqrt2.add t5 (ZSqrt2.mul a14 d023)
  let t7 := ZSqrt2.add t6 (ZSqrt2.mul a23 d014)
  let t8 := ZSqrt2.sub t7 (ZSqrt2.mul a24 d013)
  ZSqrt2.add t8 (ZSqrt2.mul a34 d012)

-- [helper]
theorem mat5Det_eq_det (M : Mat5) : mat5Det M = M.det := by
  simp only [mat5Det, det2Z2, Matrix.det_succ_row_zero, Fin.sum_univ_succ, Fin.sum_univ_zero,
    Matrix.submatrix_apply, Fin.succ_zero_eq_one, Fin.succ_one_eq_two, Matrix.det_isEmpty,
    Fin.succAbove_zero, Fin.succAbove_succ_self, Fin.succAbove_ne_zero_zero,
    Fin.val_zero, Fin.val_one, Fin.val_two, Fin.val_succ, pow_zero, pow_one,
    Fin.isValue, Nat.reduceAdd, add_zero, mul_one, neg_mul, one_mul, zero_add]
  change _ = _
  simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul]
  change _ = _
  ext <;> dsimp <;> ring


/-! ## Section 3: Exact `{3,4,3,4}` Coxeter Form `2 B`, Base Center `c_0`, Cusp `v` & Inversion `Z` -/

/-- Exact doubled Coxeter Gram matrix `2 B` for `[3,4,3,4]` (`det(2 B) = -2`). -/
def twiceGram : Mat5
  | ⟨0, _⟩, ⟨0, _⟩ => ⟨2, 0⟩
  | ⟨0, _⟩, ⟨1, _⟩ => ⟨-1, 0⟩
  | ⟨1, _⟩, ⟨0, _⟩ => ⟨-1, 0⟩
  | ⟨1, _⟩, ⟨1, _⟩ => ⟨2, 0⟩
  | ⟨1, _⟩, ⟨2, _⟩ => ⟨0, -1⟩
  | ⟨2, _⟩, ⟨1, _⟩ => ⟨0, -1⟩
  | ⟨2, _⟩, ⟨2, _⟩ => ⟨2, 0⟩
  | ⟨2, _⟩, ⟨3, _⟩ => ⟨-1, 0⟩
  | ⟨3, _⟩, ⟨2, _⟩ => ⟨-1, 0⟩
  | ⟨3, _⟩, ⟨3, _⟩ => ⟨2, 0⟩
  | ⟨3, _⟩, ⟨4, _⟩ => ⟨0, -1⟩
  | ⟨4, _⟩, ⟨3, _⟩ => ⟨0, -1⟩
  | ⟨4, _⟩, ⟨4, _⟩ => ⟨2, 0⟩
  | _, _ => ⟨0, 0⟩

/-- Exact Lorentzian pairing `2 B(u, v) = u^T (2 B) v` in `ℤ[√2]`. -/
def twiceForm (u v : Vec5) : ZSqrt2 := dot5 u (mat5Vec twiceGram v)

/-- Fast tridiagonal evaluation of `(2 B) v` (proven identical to `mat5Vec twiceGram v`). -/
def twiceGramVecFast (v : Vec5) : Vec5
  | ⟨0, _⟩ => ZSqrt2.sub (ZSqrt2.scale 2 (v ⟨0, by decide⟩)) (v ⟨1, by decide⟩)
  | ⟨1, _⟩ => ZSqrt2.sub (ZSqrt2.sub (ZSqrt2.scale 2 (v ⟨1, by decide⟩)) (v ⟨0, by decide⟩))
                (ZSqrt2.mul ZSqrt2.sqrt2 (v ⟨2, by decide⟩))
  | ⟨2, _⟩ => ZSqrt2.sub (ZSqrt2.sub (ZSqrt2.scale 2 (v ⟨2, by decide⟩))
                (ZSqrt2.mul ZSqrt2.sqrt2 (v ⟨1, by decide⟩))) (v ⟨3, by decide⟩)
  | ⟨3, _⟩ => ZSqrt2.sub (ZSqrt2.sub (ZSqrt2.scale 2 (v ⟨3, by decide⟩)) (v ⟨2, by decide⟩))
                (ZSqrt2.mul ZSqrt2.sqrt2 (v ⟨4, by decide⟩))
  | ⟨4, _⟩ => ZSqrt2.sub (ZSqrt2.scale 2 (v ⟨4, by decide⟩))
                (ZSqrt2.mul ZSqrt2.sqrt2 (v ⟨3, by decide⟩))

private theorem mat5Vec_twiceGram_eq_fast (v : Vec5) : mat5Vec twiceGram v = twiceGramVecFast v := by
  ext i
  · fin_cases i <;>
      dsimp [mat5Vec, twiceGramVecFast, sum5, twiceGram, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2] <;>
      ring
  · fin_cases i <;>
      dsimp [mat5Vec, twiceGramVecFast, sum5, twiceGram, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2] <;>
      ring

/-- Exact base 24-cell center `c_0 = (2, 4, 3√2, 2√2, 1)` (`2 B(c_0, c_0) = -2`). -/
def baseCenter : Vec5
  | ⟨0, _⟩ => ⟨2, 0⟩
  | ⟨1, _⟩ => ⟨4, 0⟩
  | ⟨2, _⟩ => ⟨0, 3⟩
  | ⟨3, _⟩ => ⟨0, 2⟩
  | ⟨4, _⟩ => ⟨1, 0⟩

/-- Exact ideal cusp null vertex `v = (0, 1, √2, √2, 1)` (`2 B(v, v) = 0`, `2 B(c_0, v) = -2`). -/
def cuspVertex : Vec5
  | ⟨0, _⟩ => ⟨0, 0⟩
  | ⟨1, _⟩ => ⟨1, 0⟩
  | ⟨2, _⟩ => ⟨0, 1⟩
  | ⟨3, _⟩ => ⟨0, 1⟩
  | ⟨4, _⟩ => ⟨1, 0⟩

/-- Simple root basis vector `e_k` (`k = 0..4`). -/
def unitVec5 (k : Fin 5) : Vec5 := fun i => if i = k then ZSqrt2.one else ZSqrt2.zero

/-- Reflection in root `n`: `F_n x = x - (n^T (2 B) x) n`, i.e., `F_n = I_5 - n (2 B n)^T`. -/
def reflectionIn (n : Vec5) : Mat5 :=
  fun i j => ZSqrt2.sub (mat5Id i j) (ZSqrt2.mul (n i) (mat5Vec twiceGram n j))

/-- The five Coxeter simple reflections `s_0..s_4` of `[3,4,3,4]`. -/
def simpleRefl (k : Fin 5) : Mat5 := reflectionIn (unitVec5 k)

/-- Exact point inversion `Z` of the base 24-cell (`Z x = -x + 2 x_4 c_0`). -/
def centralInversion : Mat5 :=
  fun i j =>
    let diag := if i = j then ZSqrt2.negOne else ZSqrt2.zero
    let col4 := if j = ⟨4, by decide⟩ then ZSqrt2.scale 2 (baseCenter i) else ZSqrt2.zero
    ZSqrt2.add diag col4

/-- Exact Lorentzian Gram determinant and center/cusp pairing certificate. -/
theorem thm_coxeter_gram_and_center :
    mat5Transpose twiceGram = twiceGram ∧
    mat5Det twiceGram = ZSqrt2.ofInt (-2) ∧
    twiceForm baseCenter baseCenter = ZSqrt2.ofInt (-2) ∧
    twiceForm cuspVertex cuspVertex = ZSqrt2.zero ∧
    twiceForm baseCenter cuspVertex = ZSqrt2.ofInt (-2) := by
  refine ⟨by ext i j; fin_cases i <;> fin_cases j <;> decide,
    by decide, by decide, by decide, by decide⟩

/-- Exact central-inversion `Z` certificate:
    `Z^2 = I_5`, `Z^T (2 B) Z = 2 B`, `det(Z) = +1`, `Z c_0 = c_0`, and `Z` commutes with `s_0..s_3`. -/
theorem thm_central_inversion_properties :
    mat5Mul centralInversion centralInversion = mat5Id ∧
    mat5Mul (mat5Transpose centralInversion) (mat5Mul twiceGram centralInversion) = twiceGram ∧
    mat5Det centralInversion = ZSqrt2.one ∧
    mat5Vec centralInversion baseCenter = baseCenter ∧
    (∀ k : Fin 4,
      mat5Mul (simpleRefl ⟨k.val, Nat.lt_trans k.isLt (by decide)⟩) centralInversion =
        mat5Mul centralInversion (simpleRefl ⟨k.val, Nat.lt_trans k.isLt (by decide)⟩)) := by
  refine ⟨by ext i j; exact (by decide : ∀ i j : Fin 5, mat5Mul centralInversion centralInversion i j = mat5Id i j) i j,
    by ext i j; exact (by decide : ∀ i j : Fin 5, mat5Mul (mat5Transpose centralInversion) (mat5Mul twiceGram centralInversion) i j = twiceGram i j) i j,
    by decide,
    funext (by decide),
    fun k => by ext i j; exact (by decide : ∀ (x : Fin 4) (i j : Fin 5),
      mat5Mul (simpleRefl ⟨x.val, Nat.lt_trans x.isLt (by decide)⟩) centralInversion i j =
        mat5Mul centralInversion (simpleRefl ⟨x.val, Nat.lt_trans x.isLt (by decide)⟩) i j) k i j⟩


/-! ## Section 4: General Symbolic `O(4,1; ℤ[√2])` Reflection & Conjugation Algebra -/

/-- Group closure of Lorentzian form preservation under matrix multiplication. -/
theorem thm_orth_group_mul (A B : Mat5)
    (hA : mat5Mul (mat5Transpose A) (mat5Mul twiceGram A) = twiceGram)
    (hB : mat5Mul (mat5Transpose B) (mat5Mul twiceGram B) = twiceGram) :
    mat5Mul (mat5Transpose (mat5Mul A B)) (mat5Mul twiceGram (mat5Mul A B)) = twiceGram := by
  simp only [mat5Mul_eq_mul, mat5Transpose_eq] at hA hB ⊢
  rw [Matrix.transpose_mul]
  calc Bᵀ * Aᵀ * (twiceGram * (A * B))
      = Bᵀ * ((Aᵀ * (twiceGram * A)) * B) := by simp only [mul_assoc]
    _ = Bᵀ * (twiceGram * B) := by rw [hA]
    _ = twiceGram := hB

private theorem reflectionIn_eq (n : Vec5) :
    reflectionIn n = 1 - Matrix.vecMulVec n (twiceGram.mulVec n) := by
  ext i j
  simp only [reflectionIn, mat5Id_eq_one, mat5Vec_eq_mulVec, Matrix.sub_apply, Matrix.vecMulVec_apply]
  rfl

/-- Symbolic reflection involution theorem: for EVERY root `n : Vec5` with `2 B(n, n) = 2`,
    `F_n * F_n = I_5`. -/
theorem thm_reflection_involution (n : Vec5) (hn : twiceForm n n = ZSqrt2.two) :
    mat5Mul (reflectionIn n) (reflectionIn n) = mat5Id := by
  rw [mat5Mul_eq_mul, mat5Id_eq_one, reflectionIn_eq]
  have hDot : dotProduct (twiceGram.mulVec n) n = 2 := by
    rw [dotProduct_comm, ← mat5Vec_eq_mulVec, ← dot5_eq_dot]
    exact hn
  ext i j
  simp only [Matrix.mul_apply, Matrix.sub_apply, Matrix.one_apply, Matrix.vecMulVec_apply]
  simp only [sub_mul, mul_sub, Finset.sum_sub_distrib, ite_mul, one_mul, zero_mul,
    mul_ite, mul_one, mul_zero, Finset.sum_ite_eq, Finset.sum_ite_eq', Finset.mem_univ, ↓reduceIte]
  have hSum : ∑ x : Fin 5, n i * twiceGram.mulVec n x * (n x * twiceGram.mulVec n j) =
      n i * dotProduct (twiceGram.mulVec n) n * twiceGram.mulVec n j := by
    rw [dotProduct, Finset.mul_sum, Finset.sum_mul]
    exact Finset.sum_congr rfl fun x _ => by ring
  rw [hSum, hDot]
  ring

/-- Symbolic reflection Lorentz-isometry theorem: for EVERY root `n : Vec5` with `2 B(n, n) = 2`,
    `F_n^T (2 B) F_n = 2 B`. -/
theorem thm_reflection_preserves_twiceGram (n : Vec5) (hn : twiceForm n n = ZSqrt2.two) :
    mat5Mul (mat5Transpose (reflectionIn n)) (mat5Mul twiceGram (reflectionIn n)) = twiceGram := by
  rw [mat5Mul_eq_mul, mat5Mul_eq_mul, mat5Transpose_eq, reflectionIn_eq]
  have hSym : twiceGramᵀ = twiceGram := thm_coxeter_gram_and_center.1
  have hDot : dotProduct n (twiceGram.mulVec n) = 2 := by
    rw [← mat5Vec_eq_mulVec, ← dot5_eq_dot]; exact hn
  have hGF : twiceGram * (1 - Matrix.vecMulVec n (twiceGram.mulVec n)) =
      twiceGram - Matrix.vecMulVec (twiceGram.mulVec n) (twiceGram.mulVec n) := by
    ext p j
    simp only [Matrix.mul_sub, mul_one, Matrix.sub_apply, Matrix.mul_apply,
      Matrix.vecMulVec_apply, Matrix.mulVec, dotProduct, Finset.sum_mul]
    congr 1; exact Finset.sum_congr rfl fun k _ => by ring
  rw [hGF]
  ext i j
  simp only [Matrix.mul_apply, Matrix.transpose_apply, Matrix.sub_apply, Matrix.one_apply,
    Matrix.vecMulVec_apply, sub_mul, mul_sub, Finset.sum_sub_distrib, ite_mul, one_mul, zero_mul,
    Finset.sum_ite_eq', Finset.mem_univ, ↓reduceIte]
  have hRow : ∑ x : Fin 5, n x * twiceGram.mulVec n i * twiceGram x j =
      twiceGram.mulVec n i * twiceGram.mulVec n j := by
    rw [Matrix.mulVec, dotProduct, Finset.mul_sum]
    refine Finset.sum_congr rfl fun x _ => ?_
    have hT : twiceGram x j = twiceGram j x := congrFun (congrFun hSym j) x
    rw [hT]; ring
  have hQuad : ∑ x : Fin 5, n x * twiceGram.mulVec n i * (twiceGram.mulVec n x * twiceGram.mulVec n j) =
      dotProduct n (twiceGram.mulVec n) * (twiceGram.mulVec n i * twiceGram.mulVec n j) := by
    rw [dotProduct, Finset.sum_mul]
    exact Finset.sum_congr rfl fun x _ => by ring
  rw [hRow, hQuad, hDot]
  ring

/-- Symbolic conjugation law for orthogonal involutions:
    if `Z^2 = I_5` and `Z^T (2 B) Z = 2 B`, then `Z F_n Z = F_{Z n}` for EVERY vector `n : Vec5`. -/
theorem thm_conj_reflection (Z : Mat5) (hZ2 : mat5Mul Z Z = mat5Id)
    (hZG : mat5Mul (mat5Transpose Z) (mat5Mul twiceGram Z) = twiceGram) (n : Vec5) :
    mat5Mul (mat5Mul Z (reflectionIn n)) Z = reflectionIn (mat5Vec Z n) := by
  simp only [mat5Mul_eq_mul, mat5Id_eq_one, mat5Transpose_eq, mat5Vec_eq_mulVec, reflectionIn_eq] at hZ2 hZG ⊢
  have hZTG : Zᵀ * twiceGram = twiceGram * Z := by
    calc Zᵀ * twiceGram = Zᵀ * twiceGram * (Z * Z) := by rw [hZ2, mul_one]
      _ = (Zᵀ * (twiceGram * Z)) * Z := by simp only [mul_assoc]
      _ = twiceGram * Z := by rw [hZG]
  rw [Matrix.mul_sub, mul_one, Matrix.sub_mul, hZ2]
  congr 1
  ext i j
  simp only [Matrix.mul_apply, Matrix.vecMulVec_apply]
  have hL : ∑ x : Fin 5, (∑ k : Fin 5, Z i k * (n k * twiceGram.mulVec n x)) * Z x j =
      (Z.mulVec n i) * ((Zᵀ * twiceGram).mulVec n j) := by
    simp only [Matrix.mulVec, dotProduct, Matrix.mul_apply, Matrix.transpose_apply,
      Finset.sum_mul, Finset.mul_sum]
    rw [Finset.sum_comm]
    refine Finset.sum_congr rfl fun k _ => ?_
    rw [Finset.sum_comm]
    refine Finset.sum_congr rfl fun p _ => ?_
    refine Finset.sum_congr rfl fun x _ => by ring
  rw [hL, hZTG, Matrix.mulVec_mulVec]


/-! ## Section 5: All 24 Exact Facet Normals & Transports `k_a = F_a Z` in `rootsD4()` Order -/

/-- Helper constructing a `Vec5` from 5 explicit `ZSqrt2` entries. -/
def mkVec5 (x0 x1 x2 x3 x4 : ZSqrt2) : Vec5
  | ⟨0, _⟩ => x0
  | ⟨1, _⟩ => x1
  | ⟨2, _⟩ => x2
  | ⟨3, _⟩ => x3
  | ⟨4, _⟩ => x4

/-- Exact 24 facet normals `n_a` (`a : Fin 24`) of the base 24-cell in `{3,4,3,4}`
    in exact `rootsD4()` slot order (`code/substrate/coxeter/exact-3434.ts`). -/
def facetNormal : Fin 24 → Vec5
  | ⟨0, _⟩  => mkVec5 ⟨0, 0⟩ ⟨0, 0⟩ ⟨0, 0⟩ ⟨0, 0⟩ ⟨1, 0⟩
  | ⟨1, _⟩  => mkVec5 ⟨0, 0⟩ ⟨2, 0⟩ ⟨0, 2⟩ ⟨0, 2⟩ ⟨1, 0⟩
  | ⟨2, _⟩  => mkVec5 ⟨4, 0⟩ ⟨6, 0⟩ ⟨0, 4⟩ ⟨0, 2⟩ ⟨1, 0⟩
  | ⟨3, _⟩  => mkVec5 ⟨4, 0⟩ ⟨8, 0⟩ ⟨0, 6⟩ ⟨0, 4⟩ ⟨1, 0⟩
  | ⟨4, _⟩  => mkVec5 ⟨0, 0⟩ ⟨0, 0⟩ ⟨0, 0⟩ ⟨0, 1⟩ ⟨1, 0⟩
  | ⟨5, _⟩  => mkVec5 ⟨0, 0⟩ ⟨2, 0⟩ ⟨0, 2⟩ ⟨0, 1⟩ ⟨1, 0⟩
  | ⟨6, _⟩  => mkVec5 ⟨4, 0⟩ ⟨6, 0⟩ ⟨0, 4⟩ ⟨0, 3⟩ ⟨1, 0⟩
  | ⟨7, _⟩  => mkVec5 ⟨4, 0⟩ ⟨8, 0⟩ ⟨0, 6⟩ ⟨0, 3⟩ ⟨1, 0⟩
  | ⟨8, _⟩  => mkVec5 ⟨0, 0⟩ ⟨0, 0⟩ ⟨0, 1⟩ ⟨0, 1⟩ ⟨1, 0⟩
  | ⟨9, _⟩  => mkVec5 ⟨0, 0⟩ ⟨2, 0⟩ ⟨0, 1⟩ ⟨0, 1⟩ ⟨1, 0⟩
  | ⟨10, _⟩ => mkVec5 ⟨4, 0⟩ ⟨6, 0⟩ ⟨0, 5⟩ ⟨0, 3⟩ ⟨1, 0⟩
  | ⟨11, _⟩ => mkVec5 ⟨4, 0⟩ ⟨8, 0⟩ ⟨0, 5⟩ ⟨0, 3⟩ ⟨1, 0⟩
  | ⟨12, _⟩ => mkVec5 ⟨2, 0⟩ ⟨2, 0⟩ ⟨0, 1⟩ ⟨0, 1⟩ ⟨1, 0⟩
  | ⟨13, _⟩ => mkVec5 ⟨2, 0⟩ ⟨4, 0⟩ ⟨0, 3⟩ ⟨0, 1⟩ ⟨1, 0⟩
  | ⟨14, _⟩ => mkVec5 ⟨2, 0⟩ ⟨4, 0⟩ ⟨0, 3⟩ ⟨0, 3⟩ ⟨1, 0⟩
  | ⟨15, _⟩ => mkVec5 ⟨2, 0⟩ ⟨6, 0⟩ ⟨0, 5⟩ ⟨0, 3⟩ ⟨1, 0⟩
  | ⟨16, _⟩ => mkVec5 ⟨2, 0⟩ ⟨2, 0⟩ ⟨0, 2⟩ ⟨0, 1⟩ ⟨1, 0⟩
  | ⟨17, _⟩ => mkVec5 ⟨2, 0⟩ ⟨4, 0⟩ ⟨0, 2⟩ ⟨0, 1⟩ ⟨1, 0⟩
  | ⟨18, _⟩ => mkVec5 ⟨2, 0⟩ ⟨4, 0⟩ ⟨0, 4⟩ ⟨0, 3⟩ ⟨1, 0⟩
  | ⟨19, _⟩ => mkVec5 ⟨2, 0⟩ ⟨6, 0⟩ ⟨0, 4⟩ ⟨0, 3⟩ ⟨1, 0⟩
  | ⟨20, _⟩ => mkVec5 ⟨2, 0⟩ ⟨2, 0⟩ ⟨0, 2⟩ ⟨0, 2⟩ ⟨1, 0⟩
  | ⟨21, _⟩ => mkVec5 ⟨2, 0⟩ ⟨4, 0⟩ ⟨0, 2⟩ ⟨0, 2⟩ ⟨1, 0⟩
  | ⟨22, _⟩ => mkVec5 ⟨2, 0⟩ ⟨4, 0⟩ ⟨0, 4⟩ ⟨0, 2⟩ ⟨1, 0⟩
  | ⟨23, _⟩ => mkVec5 ⟨2, 0⟩ ⟨6, 0⟩ ⟨0, 4⟩ ⟨0, 2⟩ ⟨1, 0⟩
  | ⟨n + 24, h⟩ => absurd h (by omega)

/-- Exact `rootsD4()` vector indexed by `Fin 24`, matching `Vibe.Geometry.d4Roots`. -/
def d4RootOf : Fin 24 → Vec4
  | ⟨0, _⟩  => ( 1,  1,  0,  0)
  | ⟨1, _⟩  => ( 1, -1,  0,  0)
  | ⟨2, _⟩  => (-1,  1,  0,  0)
  | ⟨3, _⟩  => (-1, -1,  0,  0)
  | ⟨4, _⟩  => ( 1,  0,  1,  0)
  | ⟨5, _⟩  => ( 1,  0, -1,  0)
  | ⟨6, _⟩  => (-1,  0,  1,  0)
  | ⟨7, _⟩  => (-1,  0, -1,  0)
  | ⟨8, _⟩  => ( 1,  0,  0,  1)
  | ⟨9, _⟩  => ( 1,  0,  0, -1)
  | ⟨10, _⟩ => (-1,  0,  0,  1)
  | ⟨11, _⟩ => (-1,  0,  0, -1)
  | ⟨12, _⟩ => ( 0,  1,  1,  0)
  | ⟨13, _⟩ => ( 0,  1, -1,  0)
  | ⟨14, _⟩ => ( 0, -1,  1,  0)
  | ⟨15, _⟩ => ( 0, -1, -1,  0)
  | ⟨16, _⟩ => ( 0,  1,  0,  1)
  | ⟨17, _⟩ => ( 0,  1,  0, -1)
  | ⟨18, _⟩ => ( 0, -1,  0,  1)
  | ⟨19, _⟩ => ( 0, -1,  0, -1)
  | ⟨20, _⟩ => ( 0,  0,  1,  1)
  | ⟨21, _⟩ => ( 0,  0,  1, -1)
  | ⟨22, _⟩ => ( 0,  0, -1,  1)
  | ⟨23, _⟩ => ( 0,  0, -1, -1)
  | ⟨n + 24, h⟩ => absurd h (by omega)

/-- Exact antipodal slot involution (`4q + r ↦ 4q + (3 - r)`). -/
def oppSlot (a : Fin 24) : Fin 24 :=
  ⟨(a.val / 4) * 4 + (3 - a.val % 4), by have := a.isLt; omega⟩

/-- Facet direction `d_a = n_a - c_0` tangent to the base 24-cell (`B(d_a, c_0) = 0`). -/
def facetDir (a : Fin 24) : Vec5 :=
  fun i => ZSqrt2.sub (facetNormal a i) (baseCenter i)

/-- Exact facet reflection `F_a = reflectionIn (facetNormal a)`. -/
def faceReflection (a : Fin 24) : Mat5 :=
  reflectionIn (facetNormal a)

/-- Exact Coxeter cell-to-neighbor transport matrix `k_a = F_a Z` (`a : Fin 24`). -/
def transport (a : Fin 24) : Mat5 :=
  mat5Mul (faceReflection a) centralInversion

/-- Closed-form expression for `k_a = F_a Z` used for fast kernel `det`. -/
def transportFast (a : Fin 24) : Mat5 :=
  let n := facetNormal a
  let r := twiceGramVecFast n
  fun i j =>
    if j = ⟨4, by decide⟩ then
      ZSqrt2.sub
        (ZSqrt2.add (ZSqrt2.scale 2 (baseCenter i))
                    (ZSqrt2.mul (n i) (ZSqrt2.add ⟨4, 0⟩ (r ⟨4, by decide⟩))))
        (mat5Id i ⟨4, by decide⟩)
    else
      ZSqrt2.sub (ZSqrt2.mul (n i) (r j)) (mat5Id i j)

/-- Certificate of all 24 facet normal invariants, antipodal pairing `Z n_a = n_{opp(a)}`,
    and exact `d4Roots` alignment. -/
theorem thm_24_facets_geometry :
    ((List.finRange 24).map d4RootOf = d4Roots) ∧
    (∀ a : Fin 24, oppSlot (oppSlot a) = a ∧ oppSlot a ≠ a) ∧
    (∀ a : Fin 24, twiceForm (facetNormal a) (facetNormal a) = ZSqrt2.two) ∧
    (∀ a : Fin 24, twiceForm (facetNormal a) baseCenter = ZSqrt2.ofInt (-2)) ∧
    (∀ a : Fin 24, mat5Vec centralInversion (facetNormal a) = facetNormal (oppSlot a)) := by
  refine ⟨by decide, by decide, by decide, by decide, fun a => funext ((by decide :
    ∀ (x : Fin 24) (i : Fin 5), mat5Vec centralInversion (facetNormal x) i = facetNormal (oppSlot x) i) a)⟩

/-- Exact `24 × 24 = 576`-entry Gram isomorphism `2 B(d_a, d_b) = 2 (r_a · r_b)`. -/
theorem thm_24_facet_dirs_isomorphic_to_d4 :
    ∀ a b : Fin 24,
      twiceForm (facetDir a) (facetDir b) = ZSqrt2.ofInt (2 * dot4 (d4RootOf a) (d4RootOf b)) := by
  intro a b
  unfold twiceForm
  rw [mat5Vec_twiceGram_eq_fast]
  exact (by decide : ∀ x y : Fin 24,
    dot5 (facetDir x) (twiceGramVecFast (facetDir y)) =
      ZSqrt2.ofInt (2 * dot4 (d4RootOf x) (d4RootOf y))) a b

private theorem dot_r_baseCenter (a : Fin 24) :
    dotProduct (twiceGram.mulVec (facetNormal a)) baseCenter = ZSqrt2.ofInt (-2) := by
  have hSym : twiceGramᵀ = twiceGram := thm_coxeter_gram_and_center.1
  calc dotProduct (twiceGram.mulVec (facetNormal a)) baseCenter
      = dotProduct (facetNormal a) (twiceGramᵀ.mulVec baseCenter) := by
          rw [Matrix.dotProduct_mulVec, ← Matrix.vecMul_transpose, Matrix.dotProduct_mulVec]
          simp [Matrix.mulVec, dotProduct, Matrix.transpose_apply, Finset.sum_mul, Finset.mul_sum]
          rw [Finset.sum_comm]
          exact Finset.sum_congr rfl fun i _ => Finset.sum_congr rfl fun j _ => by ring
    _ = twiceForm (facetNormal a) baseCenter := by
          rw [hSym, twiceForm, dot5_eq_dot, mat5Vec_eq_mulVec]
    _ = ZSqrt2.ofInt (-2) := thm_24_facets_geometry.2.2.2.1 a

/-- Headline Theorem 1 (`O^+(4,1; ℤ[√2])` Lorentzian Form Preservation):
    ALL 24 transport matrices `k_a = F_a Z` preserve `2 B` and the future timelike sheet. -/
theorem thm_coxeter_transport_preserves_lorentz :
    (∀ a : Fin 24,
      mat5Mul (mat5Transpose (transport a)) (mat5Mul twiceGram (transport a)) = twiceGram) ∧
    (∀ a : Fin 24,
      twiceForm (mat5Vec (transport a) baseCenter) baseCenter = ZSqrt2.ofInt (-6)) := by
  refine ⟨fun a => thm_orth_group_mul (reflectionIn (facetNormal a)) centralInversion
      (thm_reflection_preserves_twiceGram (facetNormal a) (thm_24_facets_geometry.2.2.1 a))
      thm_central_inversion_properties.2.1, ?_⟩
  intro a
  have hStep : mat5Vec (transport a) baseCenter =
      fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i)) := by
    unfold transport
    rw [mat5Vec_eq_mulVec, mat5Mul_eq_mul, ← Matrix.mulVec_mulVec, ← mat5Vec_eq_mulVec,
        thm_central_inversion_properties.2.2.2.1, faceReflection, reflectionIn_eq]
    ext i
    simp only [Matrix.sub_mulVec, Matrix.one_mulVec, Matrix.mulVec, dotProduct, Matrix.vecMulVec_apply]
    have hMul : ∑ j : Fin 5, facetNormal a i * twiceGram.mulVec (facetNormal a) j * baseCenter j =
        facetNormal a i * dotProduct (twiceGram.mulVec (facetNormal a)) baseCenter := by
      rw [dotProduct, Finset.mul_sum]
      exact Finset.sum_congr rfl fun j _ => by ring
    rw [hMul, dot_r_baseCenter a]
    ext <;> dsimp [ZSqrt2.add, ZSqrt2.scale, ZSqrt2.ofInt] <;> ring
  rw [hStep, twiceForm, mat5Vec_twiceGram_eq_fast]
  exact (by decide : ∀ x : Fin 24,
    dot5 (fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal x i)))
         (twiceGramVecFast baseCenter) = ZSqrt2.ofInt (-6)) a

private theorem transport_eq_fast (a : Fin 24) : transport a = transportFast a := by
  have hDotC := dot_r_baseCenter a
  have hCent : centralInversion =
      Matrix.vecMulVec (fun i => ZSqrt2.scale 2 (baseCenter i)) (unitVec5 ⟨4, by decide⟩) - 1 := by
    ext i j
    simp only [centralInversion, Matrix.sub_apply, Matrix.vecMulVec_apply, unitVec5, Matrix.one_apply]
    split_ifs <;> ext <;> dsimp [ZSqrt2.add, ZSqrt2.negOne, ZSqrt2.one, ZSqrt2.zero, ZSqrt2.scale] <;> ring
  rw [transport, mat5Mul_eq_mul, faceReflection, reflectionIn_eq, hCent]
  ext i j
  simp only [Matrix.mul_apply, Matrix.sub_apply, Matrix.one_apply, Matrix.vecMulVec_apply, unitVec5,
    sub_mul, mul_sub, Finset.sum_sub_distrib, ite_mul, one_mul, zero_mul, mul_ite, mul_one, mul_zero,
    Finset.sum_ite_eq, Finset.sum_ite_eq', Finset.mem_univ, ↓reduceIte, transportFast,
    ← mat5Vec_twiceGram_eq_fast, mat5Vec_eq_mulVec, mat5Id_eq_one]
  have hDot2 : ∑ x : Fin 5, facetNormal a i * twiceGram.mulVec (facetNormal a) x *
      (ZSqrt2.scale 2 (baseCenter x) * if j = ⟨4, by decide⟩ then ZSqrt2.one else ZSqrt2.zero) =
      if j = ⟨4, by decide⟩ then facetNormal a i * (-4) else 0 := by
    split_ifs with hj
    · have h2 : ∀ x, ZSqrt2.scale 2 (baseCenter x) * ZSqrt2.one = 2 * baseCenter x := fun x => by
        ext <;> dsimp [ZSqrt2.scale, ZSqrt2.one] <;> ring
      simp only [h2]
      calc ∑ x : Fin 5, facetNormal a i * twiceGram.mulVec (facetNormal a) x * (2 * baseCenter x)
          = facetNormal a i * 2 * dotProduct (twiceGram.mulVec (facetNormal a)) baseCenter := by
              rw [dotProduct, Finset.mul_sum]
              exact Finset.sum_congr rfl fun x _ => by ring
        _ = facetNormal a i * (-4) := by
              rw [hDotC]; ext <;> dsimp [ZSqrt2.ofInt] <;> ring
    · simp only [ZSqrt2.zero]; simp [show (⟨0, 0⟩ : ZSqrt2) = 0 from rfl]
  rw [hDot2]
  split_ifs with hj
  · subst hj
    ext <;> dsimp [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.one, Matrix.one_apply] <;>
      split_ifs <;> dsimp <;> ring
  · ext <;> dsimp [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.zero, Matrix.one_apply] <;>
      split_ifs <;> dsimp <;> ring

/-- Headline Theorem 2 (Exact Determinant `-1` Across All 24 Transports):
    `det(k_a) = -1` for ALL 24 slots `a : Fin 24`. -/
theorem thm_coxeter_transport_det_neg_one :
    ∀ a : Fin 24, mat5Det (transport a) = ZSqrt2.ofInt (-1) := by
  intro a
  rw [transport_eq_fast a]
  exact (by decide : ∀ x : Fin 24, mat5Det (transportFast x) = ZSqrt2.ofInt (-1)) a

/-- Headline Theorem 3 (Exact Antipodal Inverse Across All 24 Transports):
    `k_a * k_{opp(a)} = I_5` and `Z F_a Z = F_{opp(a)}` for ALL 24 slots `a : Fin 24`. -/
theorem thm_coxeter_transport_antipodal_inverse :
    (∀ a : Fin 24, mat5Mul (mat5Mul centralInversion (faceReflection a)) centralInversion =
      faceReflection (oppSlot a)) ∧
    (∀ a : Fin 24, mat5Mul (transport a) (transport (oppSlot a)) = mat5Id) := by
  have hConj : ∀ a : Fin 24,
      mat5Mul (mat5Mul centralInversion (faceReflection a)) centralInversion =
        faceReflection (oppSlot a) := fun a => by
    unfold faceReflection
    rw [thm_conj_reflection centralInversion thm_central_inversion_properties.1
          thm_central_inversion_properties.2.1 (facetNormal a),
        thm_24_facets_geometry.2.2.2.2 a]
  refine ⟨hConj, fun a => ?_⟩
  unfold transport
  have hInv := thm_reflection_involution (facetNormal a) (thm_24_facets_geometry.2.2.1 a)
  have hC := hConj (oppSlot a)
  rw [(thm_24_facets_geometry.2.1 a).1] at hC
  simp only [mat5Mul_eq_mul, mat5Id_eq_one] at hInv hC ⊢
  calc faceReflection a * centralInversion * (faceReflection (oppSlot a) * centralInversion)
      = faceReflection a * (centralInversion * faceReflection (oppSlot a) * centralInversion) := by
          simp only [mul_assoc]
    _ = faceReflection a * faceReflection a := by rw [hC]
    _ = 1 := hInv


/-! ## Section 6: All-Word Closure, Infinite-Honeycomb `S R S = R`, Cusp Split & Palindromic `T / CP / CPT` -/

/-- Evaluate any finite path `w : List (Fin 24)` across infinite `{3,4,3,4}` as a frame in `O^+(4,1; ℤ[√2])`. -/
def evalTransportWord : List (Fin 24) → Mat5
  | []      => mat5Id
  | a :: ws => mat5Mul (transport a) (evalTransportWord ws)

/-- Antipodal reverse path: reverses slot order and maps each slot `a ↦ oppSlot a`. -/
def revAntipodal : List (Fin 24) → List (Fin 24)
  | []      => []
  | a :: ws => revAntipodal ws ++ [oppSlot a]

private theorem evalTransportWord_append (w1 w2 : List (Fin 24)) :
    evalTransportWord (w1 ++ w2) = mat5Mul (evalTransportWord w1) (evalTransportWord w2) := by
  induction w1 with
  | nil => simp [evalTransportWord, mat5Mul_eq_mul, mat5Id_eq_one]
  | cons a rest ih => simp [evalTransportWord, ih, mat5Mul_eq_mul, mul_assoc]

/-- All-word `O^+(4,1; ℤ[√2])` closure and exact antipodal path reversal for EVERY finite walk `w`. -/
theorem thm_coxeter_word_lorentz_and_inverse (w : List (Fin 24)) :
    mat5Mul (mat5Transpose (evalTransportWord w)) (mat5Mul twiceGram (evalTransportWord w)) = twiceGram ∧
    mat5Mul (evalTransportWord w) (evalTransportWord (revAntipodal w)) = mat5Id ∧
    mat5Mul (evalTransportWord (revAntipodal w)) (evalTransportWord w) = mat5Id := by
  induction w with
  | nil =>
    simp [evalTransportWord, revAntipodal, mat5Mul_eq_mul, mat5Id_eq_one, mat5Transpose_eq]
  | cons a rest ih =>
    simp only [evalTransportWord, revAntipodal, evalTransportWord_append]
    have hSingle : evalTransportWord [oppSlot a] = transport (oppSlot a) := by
      simp [evalTransportWord, mat5Mul_eq_mul, mat5Id_eq_one]
    rw [hSingle]
    have hOrth := thm_orth_group_mul (transport a) (evalTransportWord rest)
      (thm_coxeter_transport_preserves_lorentz.1 a) ih.1
    have hK := thm_coxeter_transport_antipodal_inverse.2 a
    have hKOpp : mat5Mul (transport (oppSlot a)) (transport a) = mat5Id := by
      simpa only [(thm_24_facets_geometry.2.1 a).1] using
        thm_coxeter_transport_antipodal_inverse.2 (oppSlot a)
    rcases ih with ⟨_, hR, hL⟩
    simp only [mat5Mul_eq_mul, mat5Id_eq_one] at hK hKOpp hR hL ⊢
    refine ⟨hOrth, ?_, ?_⟩
    · calc transport a * evalTransportWord rest * (evalTransportWord (revAntipodal rest) * transport (oppSlot a))
          = transport a * (evalTransportWord rest * evalTransportWord (revAntipodal rest)) * transport (oppSlot a) := by
              simp only [mul_assoc]
        _ = transport a * transport (oppSlot a) := by rw [hR, mul_one]
        _ = 1 := hK
    · calc evalTransportWord (revAntipodal rest) * transport (oppSlot a) * (transport a * evalTransportWord rest)
          = evalTransportWord (revAntipodal rest) * (transport (oppSlot a) * transport a) * evalTransportWord rest := by
              simp only [mul_assoc]
        _ = evalTransportWord (revAntipodal rest) * evalTransportWord rest := by rw [hKOpp, mul_one]
        _ = 1 := hL

/-- Exact 1-hop stream `S` on the ENTIRE infinite `{3,4,3,4}` honeycomb frame group. -/
def honeycombStream {α : Type} (ψ : Mat5 → Fin 24 → α) : Mat5 → Fin 24 → α :=
  fun g a => ψ (mat5Mul g (transport (oppSlot a))) a

/-- Exact slot-antipodal reversal `R` on every dock: `(R ψ)(g, a) = ψ(g, opp(a))`. -/
def slotReverse {α : Type} (ψ : Mat5 → Fin 24 → α) : Mat5 → Fin 24 → α :=
  fun g a => ψ g (oppSlot a)

/-- Headline Theorem 4 (Exact Antipodal Stream Reversal `S R S = R` on Infinite `{3,4,3,4}`). -/
theorem thm_honeycomb_stream_antipodal_reversal {α : Type} (ψ : Mat5 → Fin 24 → α) :
    slotReverse (slotReverse ψ) = ψ ∧
    honeycombStream (slotReverse (honeycombStream ψ)) = slotReverse ψ := by
  refine ⟨funext fun g a => by simp [slotReverse, (thm_24_facets_geometry.2.1 a).1], ?_⟩
  funext g a
  simp only [honeycombStream, slotReverse, (thm_24_facets_geometry.2.1 a).1]
  have hInv : mat5Mul (transport (oppSlot a)) (transport a) = mat5Id := by
    simpa only [(thm_24_facets_geometry.2.1 a).1] using
      thm_coxeter_transport_antipodal_inverse.2 (oppSlot a)
  simp only [mat5Mul_eq_mul, mat5Id_eq_one] at hInv ⊢
  rw [mul_assoc, hInv, mul_one]

/-- Exact dock-0 cusp neighbor split certificate relative to `cuspVertex = (0, 1, √2, √2, 1)`. -/
theorem thm_cusp_dock0_split_and_ratio :
    let lvls := (List.finRange 24).map (fun a =>
      dot5 (fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i)))
           (twiceGramVecFast cuspVertex))
    (lvls.filter (fun v => v == ZSqrt2.ofInt (-2))).length = 6 ∧
    (lvls.filter (fun v => v == ZSqrt2.ofInt (-6))).length = 12 ∧
    (lvls.filter (fun v => v == ZSqrt2.ofInt (-10))).length = 6 ∧
    (6 * 15 + 12 * 5 + 6 * 3) * 15 = 7 * (24 * 15) := by
  decide

/-- Palindromic Algebraic `T`, `CP`, and `CPT` Symmetry Theorem. -/
theorem thm_palindromic_beat_T_CP_CPT {H : Type}
    (S S_dag L1 L1_dag L2 L2_dag M M_dag τ CP : H → H)
    (hS_lr : ∀ ψ, S (S_dag ψ) = ψ)
    (hTau2 : ∀ ψ, τ (τ ψ) = ψ)
    (hTauS : ∀ ψ, τ (S (τ ψ)) = S_dag ψ)
    (hTauL1 : ∀ ψ, τ (L1 (τ ψ)) = L1_dag ψ)
    (hTauL2 : ∀ ψ, τ (L2 (τ ψ)) = L2_dag ψ)
    (hTauM : ∀ ψ, τ (M (τ ψ)) = M_dag ψ)
    (hCP2 : ∀ ψ, CP (CP ψ) = ψ)
    (hCPS : ∀ ψ, CP (S ψ) = S (CP ψ))
    (hCPL1 : ∀ ψ, CP (L1 ψ) = L1 (CP ψ))
    (hCPL2 : ∀ ψ, CP (L2 ψ) = L2 (CP ψ))
    (hCPM : ∀ ψ, CP (M ψ) = M (CP ψ))
    (hCPTau : ∀ ψ, CP (τ ψ) = τ (CP ψ)) :
    let U : H → H := fun ψ => S (L1 (L2 (M (L2 (L1 ψ)))))
    let U_dag : H → H := fun ψ => L1_dag (L2_dag (M_dag (L2_dag (L1_dag (S_dag ψ)))))
    let T : H → H := fun ψ => S (τ ψ)
    let CPT : H → H := fun ψ => CP (T ψ)
    (∀ ψ, T (T ψ) = ψ) ∧
    (∀ ψ, T (U (T ψ)) = U_dag ψ) ∧
    (∀ ψ, CP (U ψ) = U (CP ψ)) ∧
    (∀ ψ, CPT (CPT ψ) = ψ) ∧
    (∀ ψ, CPT (U (CPT ψ)) = U_dag ψ) := by
  intro U U_dag T CPT
  have hT2 : ∀ ψ, T (T ψ) = ψ := fun ψ => by change S (τ (S (τ ψ))) = ψ; rw [hTauS, hS_lr]
  have hTUT : ∀ ψ, T (U (T ψ)) = U_dag ψ := fun ψ => by
    have h1 : ∀ x, τ (S x) = S_dag (τ x) := fun x => by simpa [hTau2] using hTauS (τ x)
    have hL1 : ∀ x, τ (L1 x) = L1_dag (τ x) := fun x => by simpa [hTau2] using hTauL1 (τ x)
    have hL2 : ∀ x, τ (L2 x) = L2_dag (τ x) := fun x => by simpa [hTau2] using hTauL2 (τ x)
    have hM : ∀ x, τ (M x) = M_dag (τ x) := fun x => by simpa [hTau2] using hTauM (τ x)
    change S (τ (S (L1 (L2 (M (L2 (L1 (S (τ ψ))))))))) = _
    rw [h1, hS_lr, hL1, hL2, hM, hL2, hL1, hTauS]
  have hCPU : ∀ ψ, CP (U ψ) = U (CP ψ) := fun ψ => by
    change CP (S (L1 (L2 (M (L2 (L1 ψ)))))) = _
    rw [hCPS, hCPL1, hCPL2, hCPM, hCPL2, hCPL1]
  have hCPT_comm : ∀ ψ, CP (T ψ) = T (CP ψ) := fun ψ => by
    change CP (S (τ ψ)) = S (τ (CP ψ)); rw [hCPS, hCPTau]
  exact ⟨hT2, hTUT, hCPU,
    fun ψ => by change CP (T (CP (T ψ))) = ψ; rw [← hCPT_comm, hCP2, hT2],
    fun ψ => by change CP (T (U (CP (T ψ)))) = _; rw [← hCPU, ← hCPT_comm, hCP2, hTUT]⟩

end Vibe

end
