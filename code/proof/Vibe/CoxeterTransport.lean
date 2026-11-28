module

public import Vibe.Algebra
public import Vibe.Geometry
import Mathlib.NumberTheory.Zsqrtd.Basic
import Mathlib.Data.Matrix.Basic
import Mathlib.Data.Matrix.Mul
import Mathlib.LinearAlgebra.Matrix.Determinant.Basic
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

/-! ## Section 1: Exact Quadratic Integer Ring `ℤ[√2]` (`CommRing` Bridged to `Zsqrtd 2`) -/

/-- Exact quadratic integer `a + b √2 ∈ ℤ[√2]`. -/
structure ZSqrt2 where
  a : Int
  b : Int
  deriving DecidableEq, Repr

namespace ZSqrt2

@[ext] private theorem ext {x y : ZSqrt2} (ha : x.a = y.a) (hb : x.b = y.b) : x = y := by
  cases x; cases y; simp_all

def zero : ZSqrt2 := ⟨0, 0⟩
def one : ZSqrt2 := ⟨1, 0⟩
def two : ZSqrt2 := ⟨2, 0⟩
def negOne : ZSqrt2 := ⟨-1, 0⟩
def sqrt2 : ZSqrt2 := ⟨0, 1⟩
def ofInt (k : Int) : ZSqrt2 := ⟨k, 0⟩

def add (x y : ZSqrt2) : ZSqrt2 := ⟨x.a + y.a, x.b + y.b⟩
def neg (x : ZSqrt2) : ZSqrt2 := ⟨-x.a, -x.b⟩
def sub (x y : ZSqrt2) : ZSqrt2 := ⟨x.a - y.a, x.b - y.b⟩
def scale (k : Int) (x : ZSqrt2) : ZSqrt2 := ⟨k * x.a, k * x.b⟩

/-- `(a + b √2)(c + d √2) = (a c + 2 b d) + (a d + b c) √2`. -/
def mul (x y : ZSqrt2) : ZSqrt2 :=
  ⟨x.a * y.a + 2 * x.b * y.b, x.a * y.b + x.b * y.a⟩

private instance : Zero ZSqrt2 := ⟨ZSqrt2.zero⟩
private instance : One ZSqrt2 := ⟨ZSqrt2.one⟩
private instance : Add ZSqrt2 := ⟨ZSqrt2.add⟩
private instance : Neg ZSqrt2 := ⟨ZSqrt2.neg⟩
private instance : Sub ZSqrt2 := ⟨ZSqrt2.sub⟩
private instance : Mul ZSqrt2 := ⟨ZSqrt2.mul⟩

@[simp] private theorem a_zero : (0 : ZSqrt2).a = 0 := rfl
@[simp] private theorem b_zero : (0 : ZSqrt2).b = 0 := rfl
@[simp] private theorem a_one : (1 : ZSqrt2).a = 1 := rfl
@[simp] private theorem b_one : (1 : ZSqrt2).b = 0 := rfl
@[simp] private theorem a_add (x y : ZSqrt2) : (x + y).a = x.a + y.a := rfl
@[simp] private theorem b_add (x y : ZSqrt2) : (x + y).b = x.b + y.b := rfl
@[simp] private theorem a_neg (x : ZSqrt2) : (-x).a = -x.a := rfl
@[simp] private theorem b_neg (x : ZSqrt2) : (-x).b = -x.b := rfl
@[simp] private theorem a_sub (x y : ZSqrt2) : (x - y).a = x.a - y.a := rfl
@[simp] private theorem b_sub (x y : ZSqrt2) : (x - y).b = x.b - y.b := rfl
@[simp] private theorem a_mul (x y : ZSqrt2) : (x * y).a = x.a * y.a + 2 * x.b * y.b := rfl
@[simp] private theorem b_mul (x y : ZSqrt2) : (x * y).b = x.a * y.b + x.b * y.a := rfl

private instance : CommRing ZSqrt2 where
  add_assoc _ _ _ := by ext <;> simp <;> ring
  zero_add _ := by ext <;> simp
  add_zero _ := by ext <;> simp
  nsmul := nsmulRec
  zsmul := zsmulRec
  neg_add_cancel _ := by ext <;> simp
  add_comm _ _ := by ext <;> simp <;> ring
  sub_eq_add_neg _ _ := by ext <;> simp <;> ring
  left_distrib _ _ _ := by ext <;> simp <;> ring
  right_distrib _ _ _ := by ext <;> simp <;> ring
  zero_mul _ := by ext <;> simp
  mul_zero _ := by ext <;> simp
  mul_assoc _ _ _ := by ext <;> simp <;> ring
  one_mul _ := by ext <;> simp
  mul_one _ := by ext <;> simp
  mul_comm _ _ := by ext <;> simp <;> ring
  npow := npowRec
  natCast n := ZSqrt2.ofInt n
  natCast_zero := rfl
  natCast_succ n := by ext <;> simp [ZSqrt2.ofInt]
  intCast k := ZSqrt2.ofInt k
  intCast_ofNat _ := rfl
  intCast_negSucc n := by
    change ZSqrt2.ofInt (Int.negSucc n) = -(ZSqrt2.ofInt (n + 1))
    ext <;> simp [ZSqrt2.ofInt, Int.negSucc_eq]

private def toZsqrtd (x : ZSqrt2) : Zsqrtd 2 := ⟨x.a, x.b⟩

end ZSqrt2


/-! ## Section 2: `5 × 5` Matrices & Vectors over `ℤ[√2]` (Bridged to Mathlib `Matrix`) -/

/-- Exact 5-vector over `ℤ[√2]`. -/
abbrev Vec5 := Fin 5 → ZSqrt2

/-- Exact `5 × 5` matrix over `ℤ[√2]`. -/
abbrev Mat5 := Fin 5 → Fin 5 → ZSqrt2

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
  rw [Fin.sum_univ_five]; rfl

private theorem dot5_eq_dot (u v : Vec5) : dot5 u v = dotProduct u v := by
  rw [dot5, dotProduct, sum5_eq_sum]; rfl

private theorem toMat5_id : Matrix.of mat5Id = (1 : Matrix (Fin 5) (Fin 5) ZSqrt2) := by
  apply Matrix.ext; intro i j
  simp only [Matrix.of_apply, mat5Id, Matrix.one_apply]
  split_ifs <;> rfl

private theorem toMat5_transpose (A : Mat5) : Matrix.of (mat5Transpose A) = (Matrix.of A)ᵀ := rfl

private theorem mat5Vec_eq_mulVec (A : Mat5) (v : Vec5) : mat5Vec A v = (Matrix.of A).mulVec v := by
  funext i; simp only [mat5Vec, Matrix.mulVec, dotProduct, sum5_eq_sum, Matrix.of_apply]; rfl

private theorem toMat5_mul (A B : Mat5) : Matrix.of (mat5Mul A B) = Matrix.of A * Matrix.of B := by
  apply Matrix.ext; intro i j
  simp only [Matrix.of_apply, mat5Mul, Matrix.mul_apply, sum5_eq_sum]; rfl

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

private theorem det4_eq_cofactors (A : Matrix (Fin 4) (Fin 4) ZSqrt2) :
    A.det =
      A 0 0 * (A 1 1 * (A 2 2 * A 3 3 - A 2 3 * A 3 2) - A 1 2 * (A 2 1 * A 3 3 - A 2 3 * A 3 1) + A 1 3 * (A 2 1 * A 3 2 - A 2 2 * A 3 1)) -
      A 0 1 * (A 1 0 * (A 2 2 * A 3 3 - A 2 3 * A 3 2) - A 1 2 * (A 2 0 * A 3 3 - A 2 3 * A 3 0) + A 1 3 * (A 2 0 * A 3 2 - A 2 2 * A 3 0)) +
      A 0 2 * (A 1 0 * (A 2 1 * A 3 3 - A 2 3 * A 3 1) - A 1 1 * (A 2 0 * A 3 3 - A 2 3 * A 3 0) + A 1 3 * (A 2 0 * A 3 1 - A 2 1 * A 3 0)) -
      A 0 3 * (A 1 0 * (A 2 1 * A 3 2 - A 2 2 * A 3 1) - A 1 1 * (A 2 0 * A 3 2 - A 2 2 * A 3 0) + A 1 2 * (A 2 0 * A 3 1 - A 2 1 * A 3 0)) := by
  rw [Matrix.det_succ_row_zero, Fin.sum_univ_four]
  simp only [Matrix.det_fin_three, Matrix.submatrix_apply, Fin.isValue]
  have s00 : Fin.succAbove (0 : Fin 4) 0 = 1 := by decide
  have s01 : Fin.succAbove (0 : Fin 4) 1 = 2 := by decide
  have s02 : Fin.succAbove (0 : Fin 4) 2 = 3 := by decide
  have s10 : Fin.succAbove (1 : Fin 4) 0 = 0 := by decide
  have s11 : Fin.succAbove (1 : Fin 4) 1 = 2 := by decide
  have s12 : Fin.succAbove (1 : Fin 4) 2 = 3 := by decide
  have s20 : Fin.succAbove (2 : Fin 4) 0 = 0 := by decide
  have s21 : Fin.succAbove (2 : Fin 4) 1 = 1 := by decide
  have s22 : Fin.succAbove (2 : Fin 4) 2 = 3 := by decide
  have s30 : Fin.succAbove (3 : Fin 4) 0 = 0 := by decide
  have s31 : Fin.succAbove (3 : Fin 4) 1 = 1 := by decide
  have s32 : Fin.succAbove (3 : Fin 4) 2 = 2 := by decide
  simp only [s00, s01, s02, s10, s11, s12, s20, s21, s22, s30, s31, s32,
    show (Fin.succ (0 : Fin 3) : Fin 4) = 1 from rfl,
    show (Fin.succ (1 : Fin 3) : Fin 4) = 2 from rfl,
    show (Fin.succ (2 : Fin 3) : Fin 4) = 3 from rfl,
    show (0 : Fin 4).val = 0 from rfl, show (1 : Fin 4).val = 1 from rfl,
    show (2 : Fin 4).val = 2 from rfl, show (3 : Fin 4).val = 3 from rfl,
    show ((-1 : ZSqrt2) ^ 0) = 1 by decide, show ((-1 : ZSqrt2) ^ 1) = -1 by decide,
    show ((-1 : ZSqrt2) ^ 2) = 1 by decide, show ((-1 : ZSqrt2) ^ 3) = -1 by decide]
  ring

private theorem mat5Det_eq_det (M : Mat5) : mat5Det M = (Matrix.of M).det := by
  rw [Matrix.det_succ_row_zero, Fin.sum_univ_five]
  simp only [det4_eq_cofactors, Matrix.submatrix_apply, Matrix.of_apply, Fin.isValue]
  have s00 : Fin.succAbove (0 : Fin 5) 0 = 1 := by decide
  have s01 : Fin.succAbove (0 : Fin 5) 1 = 2 := by decide
  have s02 : Fin.succAbove (0 : Fin 5) 2 = 3 := by decide
  have s03 : Fin.succAbove (0 : Fin 5) 3 = 4 := by decide
  have s10 : Fin.succAbove (1 : Fin 5) 0 = 0 := by decide
  have s11 : Fin.succAbove (1 : Fin 5) 1 = 2 := by decide
  have s12 : Fin.succAbove (1 : Fin 5) 2 = 3 := by decide
  have s13 : Fin.succAbove (1 : Fin 5) 3 = 4 := by decide
  have s20 : Fin.succAbove (2 : Fin 5) 0 = 0 := by decide
  have s21 : Fin.succAbove (2 : Fin 5) 1 = 1 := by decide
  have s22 : Fin.succAbove (2 : Fin 5) 2 = 3 := by decide
  have s23 : Fin.succAbove (2 : Fin 5) 3 = 4 := by decide
  have s30 : Fin.succAbove (3 : Fin 5) 0 = 0 := by decide
  have s31 : Fin.succAbove (3 : Fin 5) 1 = 1 := by decide
  have s32 : Fin.succAbove (3 : Fin 5) 2 = 2 := by decide
  have s33 : Fin.succAbove (3 : Fin 5) 3 = 4 := by decide
  have s40 : Fin.succAbove (4 : Fin 5) 0 = 0 := by decide
  have s41 : Fin.succAbove (4 : Fin 5) 1 = 1 := by decide
  have s42 : Fin.succAbove (4 : Fin 5) 2 = 2 := by decide
  have s43 : Fin.succAbove (4 : Fin 5) 3 = 3 := by decide
  simp only [s00, s01, s02, s03, s10, s11, s12, s13, s20, s21, s22, s23, s30, s31, s32, s33, s40, s41, s42, s43,
    show (Fin.succ (0 : Fin 4) : Fin 5) = 1 from rfl,
    show (Fin.succ (1 : Fin 4) : Fin 5) = 2 from rfl,
    show (Fin.succ (2 : Fin 4) : Fin 5) = 3 from rfl,
    show (Fin.succ (3 : Fin 4) : Fin 5) = 4 from rfl,
    show (0 : Fin 5).val = 0 from rfl, show (1 : Fin 5).val = 1 from rfl,
    show (2 : Fin 5).val = 2 from rfl, show (3 : Fin 5).val = 3 from rfl,
    show (4 : Fin 5).val = 4 from rfl,
    show ((-1 : ZSqrt2) ^ 0) = 1 by decide, show ((-1 : ZSqrt2) ^ 1) = -1 by decide,
    show ((-1 : ZSqrt2) ^ 2) = 1 by decide, show ((-1 : ZSqrt2) ^ 3) = -1 by decide,
    show ((-1 : ZSqrt2) ^ 4) = 1 by decide]
  unfold mat5Det det2Z2
  dsimp only
  have hadd : ∀ x y : ZSqrt2, ZSqrt2.add x y = x + y := fun _ _ => rfl
  have hsub : ∀ x y : ZSqrt2, ZSqrt2.sub x y = x - y := fun _ _ => rfl
  have hmul : ∀ x y : ZSqrt2, ZSqrt2.mul x y = x * y := fun _ _ => rfl
  have h0 : ∀ h, (⟨0, h⟩ : Fin 5) = 0 := fun _ => rfl
  have h1 : ∀ h, (⟨1, h⟩ : Fin 5) = 1 := fun _ => rfl
  have h2 : ∀ h, (⟨2, h⟩ : Fin 5) = 2 := fun _ => rfl
  have h3 : ∀ h, (⟨3, h⟩ : Fin 5) = 3 := fun _ => rfl
  have h4 : ∀ h, (⟨4, h⟩ : Fin 5) = 4 := fun _ => rfl
  simp only [hadd, hsub, hmul, h0, h1, h2, h3, h4]
  ring


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
  funext i
  fin_cases i
  · change ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.mul ⟨2, 0⟩ (v 0)) (ZSqrt2.mul ⟨-1, 0⟩ (v 1))) (ZSqrt2.mul ⟨0, 0⟩ (v 2))) (ZSqrt2.mul ⟨0, 0⟩ (v 3))) (ZSqrt2.mul ⟨0, 0⟩ (v 4)) = twiceGramVecFast v 0
    ext <;> dsimp [twiceGramVecFast, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2] <;> ring
  · change ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.mul ⟨-1, 0⟩ (v 0)) (ZSqrt2.mul ⟨2, 0⟩ (v 1))) (ZSqrt2.mul ⟨0, -1⟩ (v 2))) (ZSqrt2.mul ⟨0, 0⟩ (v 3))) (ZSqrt2.mul ⟨0, 0⟩ (v 4)) = twiceGramVecFast v 1
    ext <;> dsimp [twiceGramVecFast, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2] <;> ring
  · change ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.mul ⟨0, 0⟩ (v 0)) (ZSqrt2.mul ⟨0, -1⟩ (v 1))) (ZSqrt2.mul ⟨2, 0⟩ (v 2))) (ZSqrt2.mul ⟨-1, 0⟩ (v 3))) (ZSqrt2.mul ⟨0, 0⟩ (v 4)) = twiceGramVecFast v 2
    ext <;> dsimp [twiceGramVecFast, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2] <;> ring
  · change ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.mul ⟨0, 0⟩ (v 0)) (ZSqrt2.mul ⟨0, 0⟩ (v 1))) (ZSqrt2.mul ⟨-1, 0⟩ (v 2))) (ZSqrt2.mul ⟨2, 0⟩ (v 3))) (ZSqrt2.mul ⟨0, -1⟩ (v 4)) = twiceGramVecFast v 3
    ext <;> dsimp [twiceGramVecFast, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2] <;> ring
  · change ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.mul ⟨0, 0⟩ (v 0)) (ZSqrt2.mul ⟨0, 0⟩ (v 1))) (ZSqrt2.mul ⟨0, 0⟩ (v 2))) (ZSqrt2.mul ⟨0, -1⟩ (v 3))) (ZSqrt2.mul ⟨2, 0⟩ (v 4)) = twiceGramVecFast v 4
    ext <;> dsimp [twiceGramVecFast, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2] <;> ring

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
  refine ⟨by funext i j; fin_cases i <;> fin_cases j <;> decide,
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
  refine ⟨by funext i j; fin_cases i <;> fin_cases j <;> decide,
    by funext i j; fin_cases i <;> fin_cases j <;> decide,
    by decide,
    funext (by decide),
    fun k => by funext i j; fin_cases k <;> fin_cases i <;> fin_cases j <;> decide⟩


/-! ## Section 4: General Symbolic `O(4,1; ℤ[√2])` Reflection & Conjugation Algebra -/

/-- Group closure of Lorentzian form preservation under matrix multiplication. -/
theorem thm_orth_group_mul (A B : Mat5)
    (hA : mat5Mul (mat5Transpose A) (mat5Mul twiceGram A) = twiceGram)
    (hB : mat5Mul (mat5Transpose B) (mat5Mul twiceGram B) = twiceGram) :
    mat5Mul (mat5Transpose (mat5Mul A B)) (mat5Mul twiceGram (mat5Mul A B)) = twiceGram := by
  have hA' := congrArg Matrix.of hA
  have hB' := congrArg Matrix.of hB
  apply Matrix.of.injective
  simp only [toMat5_mul, toMat5_transpose] at hA' hB' ⊢
  rw [Matrix.transpose_mul]
  calc (Matrix.of B)ᵀ * (Matrix.of A)ᵀ * (Matrix.of twiceGram * (Matrix.of A * Matrix.of B))
      = (Matrix.of B)ᵀ * (((Matrix.of A)ᵀ * (Matrix.of twiceGram * Matrix.of A)) * Matrix.of B) := by
          simp only [mul_assoc]
    _ = (Matrix.of B)ᵀ * (Matrix.of twiceGram * Matrix.of B) := by rw [hA']
    _ = Matrix.of twiceGram := hB'

private theorem toMat5_reflectionIn (n : Vec5) :
    Matrix.of (reflectionIn n) = 1 - Matrix.vecMulVec n ((Matrix.of twiceGram).mulVec n) := by
  apply Matrix.ext; intro i j
  simp only [Matrix.of_apply, reflectionIn, mat5Vec_eq_mulVec, Matrix.sub_apply, Matrix.vecMulVec_apply,
    Matrix.one_apply, mat5Id]
  split_ifs <;> rfl

/-- Symbolic reflection involution theorem: for EVERY root `n : Vec5` with `2 B(n, n) = 2`,
    `F_n * F_n = I_5`. -/
theorem thm_reflection_involution (n : Vec5) (hn : twiceForm n n = ZSqrt2.two) :
    mat5Mul (reflectionIn n) (reflectionIn n) = mat5Id := by
  apply Matrix.of.injective
  rw [toMat5_mul, toMat5_id, toMat5_reflectionIn]
  set G : Matrix (Fin 5) (Fin 5) ZSqrt2 := Matrix.of twiceGram
  have hDot : dotProduct (G.mulVec n) n = 2 := by
    rw [dotProduct_comm]
    change dotProduct n ((Matrix.of twiceGram).mulVec n) = 2
    rw [← mat5Vec_eq_mulVec, ← dot5_eq_dot]
    exact hn
  apply Matrix.ext; intro i j
  simp only [Matrix.mul_apply, Matrix.sub_apply, Matrix.one_apply, Matrix.vecMulVec_apply,
    sub_mul, mul_sub, Finset.sum_sub_distrib, ite_mul, one_mul, zero_mul,
    mul_ite, mul_one, mul_zero, Finset.sum_ite_eq, Finset.sum_ite_eq', Finset.mem_univ, ↓reduceIte]
  have hSum : ∑ x : Fin 5, n i * G.mulVec n x * (n x * G.mulVec n j) =
      n i * dotProduct (G.mulVec n) n * G.mulVec n j := by
    rw [dotProduct, Finset.mul_sum, Finset.sum_mul]
    exact Finset.sum_congr rfl fun x _ => by ring
  rw [hSum, hDot]
  ring

/-- Symbolic reflection Lorentz-isometry theorem: for EVERY root `n : Vec5` with `2 B(n, n) = 2`,
    `F_n^T (2 B) F_n = 2 B`. -/
theorem thm_reflection_preserves_twiceGram (n : Vec5) (hn : twiceForm n n = ZSqrt2.two) :
    mat5Mul (mat5Transpose (reflectionIn n)) (mat5Mul twiceGram (reflectionIn n)) = twiceGram := by
  apply Matrix.of.injective
  rw [toMat5_mul, toMat5_mul, toMat5_transpose, toMat5_reflectionIn]
  set G : Matrix (Fin 5) (Fin 5) ZSqrt2 := Matrix.of twiceGram
  set r : Vec5 := G.mulVec n
  have hSym : Gᵀ = G := by
    rw [← toMat5_transpose]; exact congrArg Matrix.of thm_coxeter_gram_and_center.1
  have hDot : dotProduct n r = 2 := by
    change dotProduct n ((Matrix.of twiceGram).mulVec n) = 2
    rw [← mat5Vec_eq_mulVec, ← dot5_eq_dot]; exact hn
  have hGF : G * (1 - Matrix.vecMulVec n r) = G - Matrix.vecMulVec r r := by
    rw [Matrix.mul_sub, mul_one]
    congr 1
    apply Matrix.ext; intro p j
    simp only [Matrix.mul_apply, Matrix.vecMulVec_apply, r, Matrix.mulVec, dotProduct, Finset.sum_mul]
    exact Finset.sum_congr rfl fun k _ => by ring
  rw [hGF]
  apply Matrix.ext; intro i j
  simp only [Matrix.mul_apply, Matrix.transpose_apply, Matrix.sub_apply, Matrix.one_apply,
    Matrix.vecMulVec_apply, sub_mul, mul_sub, Finset.sum_sub_distrib, ite_mul, one_mul, zero_mul,
    Finset.sum_ite_eq', Finset.mem_univ, ↓reduceIte]
  have hRow : ∑ x : Fin 5, n x * r i * G x j = r i * r j := by
    have hrj : r j = ∑ x : Fin 5, G j x * n x := rfl
    rw [hrj, Finset.mul_sum]
    refine Finset.sum_congr rfl fun x _ => ?_
    have hT : G x j = G j x := congrFun (congrFun hSym j) x
    rw [hT]; ring
  have hQuad : ∑ x : Fin 5, n x * r i * (r x * r j) = dotProduct n r * (r i * r j) := by
    rw [dotProduct, Finset.sum_mul]
    exact Finset.sum_congr rfl fun x _ => by ring
  rw [hRow, hQuad, hDot]
  ring

/-- Symbolic conjugation law for orthogonal involutions:
    if `Z^2 = I_5` and `Z^T (2 B) Z = 2 B`, then `Z F_n Z = F_{Z n}` for EVERY vector `n : Vec5`. -/
theorem thm_conj_reflection (Z : Mat5) (hZ2 : mat5Mul Z Z = mat5Id)
    (hZG : mat5Mul (mat5Transpose Z) (mat5Mul twiceGram Z) = twiceGram) (n : Vec5) :
    mat5Mul (mat5Mul Z (reflectionIn n)) Z = reflectionIn (mat5Vec Z n) := by
  have hZ2' := congrArg Matrix.of hZ2
  have hZG' := congrArg Matrix.of hZG
  apply Matrix.of.injective
  simp only [toMat5_mul, toMat5_id, toMat5_transpose, mat5Vec_eq_mulVec, toMat5_reflectionIn] at hZ2' hZG' ⊢
  set ZM : Matrix (Fin 5) (Fin 5) ZSqrt2 := Matrix.of Z
  set G : Matrix (Fin 5) (Fin 5) ZSqrt2 := Matrix.of twiceGram
  have hZTG : ZMᵀ * G = G * ZM := by
    calc ZMᵀ * G = ZMᵀ * G * (ZM * ZM) := by rw [hZ2', mul_one]
      _ = (ZMᵀ * (G * ZM)) * ZM := by simp only [mul_assoc]
      _ = G * ZM := by rw [hZG']
  rw [Matrix.mul_sub, mul_one, Matrix.sub_mul, hZ2']
  congr 1
  apply Matrix.ext; intro i j
  simp only [Matrix.mul_apply, Matrix.vecMulVec_apply]
  set r : Vec5 := G.mulVec n
  have hL : ∑ x : Fin 5, (∑ k : Fin 5, ZM i k * (n k * r x)) * ZM x j =
      (ZM.mulVec n i) * (ZMᵀ.mulVec r j) := by
    have h1 : ∀ x : Fin 5, (∑ k : Fin 5, ZM i k * (n k * r x)) * ZM x j =
        (ZM.mulVec n i) * (ZM x j * r x) := fun x => by
      simp only [Matrix.mulVec, dotProduct, Finset.sum_mul]
      exact Finset.sum_congr rfl fun k _ => by ring
    simp only [h1, ← Finset.mul_sum]
    rfl
  rw [hL, Matrix.mulVec_mulVec, hZTG, Matrix.mulVec_mulVec]


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
    dotProduct ((Matrix.of twiceGram).mulVec (facetNormal a)) baseCenter = ZSqrt2.ofInt (-2) := by
  have hSym : (Matrix.of twiceGram)ᵀ = Matrix.of twiceGram := by
    rw [← toMat5_transpose]; exact congrArg Matrix.of thm_coxeter_gram_and_center.1
  calc dotProduct ((Matrix.of twiceGram).mulVec (facetNormal a)) baseCenter
      = dotProduct (facetNormal a) ((Matrix.of twiceGram)ᵀ.mulVec baseCenter) := by
          rw [dotProduct_comm, Matrix.dotProduct_mulVec, ← Matrix.mulVec_transpose, dotProduct_comm]
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
    rw [mat5Vec_eq_mulVec, toMat5_mul, ← Matrix.mulVec_mulVec]
    have hZ : (Matrix.of centralInversion).mulVec baseCenter = baseCenter := by
      rw [← mat5Vec_eq_mulVec]; exact thm_central_inversion_properties.2.2.2.1
    rw [hZ, faceReflection, toMat5_reflectionIn, Matrix.sub_mulVec, Matrix.one_mulVec]
    funext i
    set r : Vec5 := (Matrix.of twiceGram).mulVec (facetNormal a)
    simp only [Pi.sub_apply, Matrix.mulVec, dotProduct, Matrix.vecMulVec_apply]
    have hMul : ∑ j : Fin 5, facetNormal a i * r j * baseCenter j =
        facetNormal a i * dotProduct r baseCenter := by
      rw [dotProduct, Finset.mul_sum]
      exact Finset.sum_congr rfl fun j _ => by ring
    rw [hMul, show dotProduct r baseCenter = ZSqrt2.ofInt (-2) from dot_r_baseCenter a]
    ext <;> dsimp [ZSqrt2.add, ZSqrt2.scale, ZSqrt2.ofInt] <;> ring
  rw [hStep, twiceForm, mat5Vec_twiceGram_eq_fast]
  exact (by decide : ∀ x : Fin 24,
    dot5 (fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal x i)))
         (twiceGramVecFast baseCenter) = ZSqrt2.ofInt (-6)) a

private theorem transport_eq_fast (a : Fin 24) : transport a = transportFast a := by
  have hDotC := dot_r_baseCenter a
  have hCent : Matrix.of centralInversion =
      Matrix.vecMulVec (fun i => ZSqrt2.scale 2 (baseCenter i)) (unitVec5 ⟨4, by decide⟩) - 1 := by
    apply Matrix.ext; intro i j
    simp only [Matrix.of_apply, centralInversion, Matrix.sub_apply, Matrix.vecMulVec_apply, unitVec5, Matrix.one_apply]
    split_ifs <;> ext <;> dsimp [ZSqrt2.add, ZSqrt2.negOne, ZSqrt2.one, ZSqrt2.zero, ZSqrt2.scale] <;> ring
  apply Matrix.of.injective
  rw [transport, toMat5_mul, faceReflection, toMat5_reflectionIn, hCent,
    Matrix.sub_mul, one_mul, Matrix.mul_sub, mul_one]
  apply Matrix.ext; intro i j
  simp only [Matrix.of_apply, transportFast, ← mat5Vec_twiceGram_eq_fast, mat5Vec_eq_mulVec,
    Matrix.sub_apply, Matrix.one_apply, Matrix.mul_apply, Matrix.vecMulVec_apply, unitVec5, mat5Id]
  have hProd : ∑ x : Fin 5,
      facetNormal a i * (Matrix.of twiceGram).mulVec (facetNormal a) x *
        (ZSqrt2.scale 2 (baseCenter x) * (if j = ⟨4, by decide⟩ then ZSqrt2.one else ZSqrt2.zero)) =
      facetNormal a i * ZSqrt2.ofInt (-4) * (if j = ⟨4, by decide⟩ then (1 : ZSqrt2) else 0) := by
    calc ∑ x : Fin 5,
          facetNormal a i * (Matrix.of twiceGram).mulVec (facetNormal a) x *
            (ZSqrt2.scale 2 (baseCenter x) * (if j = ⟨4, by decide⟩ then ZSqrt2.one else ZSqrt2.zero))
        = facetNormal a i * (ZSqrt2.ofInt 2 * dotProduct ((Matrix.of twiceGram).mulVec (facetNormal a)) baseCenter) *
            (if j = ⟨4, by decide⟩ then (1 : ZSqrt2) else 0) := by
            rw [dotProduct, Finset.mul_sum, Finset.mul_sum, Finset.sum_mul]
            refine Finset.sum_congr rfl fun x _ => ?_
            split_ifs <;> ext <;> dsimp [ZSqrt2.scale, ZSqrt2.one, ZSqrt2.zero, ZSqrt2.ofInt] <;> ring
      _ = facetNormal a i * ZSqrt2.ofInt (-4) * (if j = ⟨4, by decide⟩ then (1 : ZSqrt2) else 0) := by
            rw [hDotC, show ZSqrt2.ofInt 2 * ZSqrt2.ofInt (-2) = ZSqrt2.ofInt (-4) by decide]
  rw [hProd]
  by_cases hj : j = ⟨4, by decide⟩
  · subst hj
    simp only [↓reduceIte]
    split_ifs <;> ext <;> dsimp [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.one, ZSqrt2.zero, ZSqrt2.ofInt] <;> ring
  · simp only [hj, ↓reduceIte]
    split_ifs <;> ext <;> dsimp [ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.one, ZSqrt2.zero, ZSqrt2.ofInt] <;> ring

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
  have hInv := congrArg Matrix.of (thm_reflection_involution (facetNormal a) (thm_24_facets_geometry.2.2.1 a))
  have hC := congrArg Matrix.of (hConj (oppSlot a))
  rw [(thm_24_facets_geometry.2.1 a).1] at hC
  apply Matrix.of.injective
  simp only [toMat5_mul, toMat5_id] at hInv hC ⊢
  calc Matrix.of (faceReflection a) * Matrix.of centralInversion *
        (Matrix.of (faceReflection (oppSlot a)) * Matrix.of centralInversion)
      = Matrix.of (faceReflection a) *
          (Matrix.of centralInversion * Matrix.of (faceReflection (oppSlot a)) * Matrix.of centralInversion) := by
          simp only [mul_assoc]
    _ = Matrix.of (faceReflection a) * Matrix.of (faceReflection a) := by rw [hC]
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
  | nil => apply Matrix.of.injective; simp [evalTransportWord, toMat5_mul, toMat5_id]
  | cons a rest ih =>
    apply Matrix.of.injective
    simp [evalTransportWord, ih, toMat5_mul, mul_assoc]

/-- All-word `O^+(4,1; ℤ[√2])` closure and exact antipodal path reversal for EVERY finite walk `w`. -/
theorem thm_coxeter_word_lorentz_and_inverse (w : List (Fin 24)) :
    mat5Mul (mat5Transpose (evalTransportWord w)) (mat5Mul twiceGram (evalTransportWord w)) = twiceGram ∧
    mat5Mul (evalTransportWord w) (evalTransportWord (revAntipodal w)) = mat5Id ∧
    mat5Mul (evalTransportWord (revAntipodal w)) (evalTransportWord w) = mat5Id := by
  induction w with
  | nil =>
    refine ⟨by apply Matrix.of.injective; simp [evalTransportWord, toMat5_mul, toMat5_id, toMat5_transpose],
      by apply Matrix.of.injective; simp [evalTransportWord, revAntipodal, toMat5_mul, toMat5_id],
      by apply Matrix.of.injective; simp [evalTransportWord, revAntipodal, toMat5_mul, toMat5_id]⟩
  | cons a rest ih =>
    simp only [revAntipodal, evalTransportWord_append]
    have hSingle : evalTransportWord [oppSlot a] = transport (oppSlot a) := by
      apply Matrix.of.injective; simp [evalTransportWord, toMat5_mul, toMat5_id]
    rw [hSingle]
    simp only [evalTransportWord]
    have hOrth := thm_orth_group_mul (transport a) (evalTransportWord rest)
      (thm_coxeter_transport_preserves_lorentz.1 a) ih.1
    have hK := congrArg Matrix.of (thm_coxeter_transport_antipodal_inverse.2 a)
    have hKOpp : Matrix.of (mat5Mul (transport (oppSlot a)) (transport a)) = Matrix.of mat5Id := by
      simpa only [(thm_24_facets_geometry.2.1 a).1] using
        congrArg Matrix.of (thm_coxeter_transport_antipodal_inverse.2 (oppSlot a))
    rcases ih with ⟨_, hR0, hL0⟩
    have hR := congrArg Matrix.of hR0
    have hL := congrArg Matrix.of hL0
    refine ⟨hOrth, ?_, ?_⟩
    · apply Matrix.of.injective
      simp only [toMat5_mul, toMat5_id] at hK hR ⊢
      calc Matrix.of (transport a) * Matrix.of (evalTransportWord rest) *
            (Matrix.of (evalTransportWord (revAntipodal rest)) * Matrix.of (transport (oppSlot a)))
          = Matrix.of (transport a) *
              (Matrix.of (evalTransportWord rest) * Matrix.of (evalTransportWord (revAntipodal rest))) *
              Matrix.of (transport (oppSlot a)) := by simp only [mul_assoc]
        _ = Matrix.of (transport a) * Matrix.of (transport (oppSlot a)) := by rw [hR, mul_one]
        _ = 1 := hK
    · apply Matrix.of.injective
      simp only [toMat5_mul, toMat5_id] at hKOpp hL ⊢
      calc Matrix.of (evalTransportWord (revAntipodal rest)) * Matrix.of (transport (oppSlot a)) *
            (Matrix.of (transport a) * Matrix.of (evalTransportWord rest))
          = Matrix.of (evalTransportWord (revAntipodal rest)) *
              (Matrix.of (transport (oppSlot a)) * Matrix.of (transport a)) *
              Matrix.of (evalTransportWord rest) := by simp only [mul_assoc]
        _ = Matrix.of (evalTransportWord (revAntipodal rest)) * Matrix.of (evalTransportWord rest) := by
              rw [hKOpp, mul_one]
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
  refine ⟨by funext g a; simp [slotReverse, (thm_24_facets_geometry.2.1 a).1], ?_⟩
  funext g a
  simp only [honeycombStream, slotReverse, (thm_24_facets_geometry.2.1 a).1]
  have hInv : mat5Mul (mat5Mul g (transport (oppSlot a))) (transport a) = g := by
    have hK := congrArg Matrix.of (thm_coxeter_transport_antipodal_inverse.2 (oppSlot a))
    rw [(thm_24_facets_geometry.2.1 a).1] at hK
    apply Matrix.of.injective
    simp only [toMat5_mul, toMat5_id] at hK ⊢
    rw [mul_assoc, hK, mul_one]
  rw [hInv]

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
