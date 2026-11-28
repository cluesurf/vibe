module

public import Mathlib.Algebra.Ring.Defs
public import Mathlib.Algebra.Star.Basic
import Mathlib.Algebra.BigOperators.Group.Finset.Basic
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Data.Matrix.Basic
import Mathlib.Logic.Function.Iterate
import Mathlib.Algebra.Order.BigOperators.Group.Finset
import Mathlib.Tactic.Ring

/-!
# Vibe Theory: Exact Algebraic Rings & Iteration Infrastructure

Lean 4 + Mathlib algebraic foundation for Vibe Theory:
exact Eisenstein integers `ℤ[ω]` (`CommRing`, `StarRing`), cyclotomic integers `ℤ[ζ_9]`
(`CommRing`, `StarRing`), `2 × 2` matrices over `ℤ[ω]` (bridged to `Matrix (Fin 2) (Fin 2) Eis`),
involutive commutative `StarCommRing`, and iteration/summation helpers bridged to
`Function.iterate` and `Finset.sum`.

Headline formal certificates in this module: exact cyclotomic `ℤ[ζ_9]` unit,
order-18, and irreducible cubic spectral-gap certificates for `ζ_18`.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

open Matrix

/-! ## Section 0: Iteration, Summation & Integer Helpers -/

/-- Discrete-time evolution iterator: `iter U t ψ = U^t ψ`. -/
def iter {α : Type} (f : α → α) : Nat → α → α
  | 0, x => x
  | t + 1, x => f (iter f t x)

private theorem iter_eq_iterate {α : Type} (f : α → α) (t : Nat) (x : α) :
    iter f t x = f^[t] x := by
  induction t with
  | zero => rfl
  | succ t ih => simp [iter, ih, Function.iterate_succ_apply']

-- [helper]
theorem iter_comm {α : Type} (f : α → α) (t : Nat) (x : α) :
    iter f t (f x) = f (iter f t x) := by
  rw [iter_eq_iterate, iter_eq_iterate, ← Function.iterate_succ_apply, Function.iterate_succ_apply']

/-- Natural-number finite sum `∑_{D = 0}^{n - 1} f D`. -/
def sumNat : Nat → (Nat → Nat) → Nat
  | 0, _ => 0
  | n + 1, f => sumNat n f + f n

private theorem sumNat_eq_sum (n : Nat) (f : Nat → Nat) :
    sumNat n f = ∑ i ∈ Finset.range n, f i := by
  induction n with
  | zero => simp [sumNat]
  | succ n ih => simp [sumNat, Finset.sum_range_succ, ih]

-- [helper]
theorem sumNat_pos (F : Nat) (f : Nat → Nat) (hF : F ≥ 1)
    (hpos : ∀ D : Nat, D < F → f D > 0) : sumNat F f > 0 := by
  rw [sumNat_eq_sum]
  exact Finset.sum_pos (fun D hD => hpos D (Finset.mem_range.mp hD))
    (Finset.nonempty_range_iff.mpr (by omega))

-- [helper]
theorem sumNat_lt_of_step (F : Nat) (f g : Nat → Nat) (hF : F ≥ 2)
    (hle : ∀ D : Nat, D < F → f D ≤ g D) (h1 : f 1 < g 1) :
    sumNat F f < sumNat F g := by
  rw [sumNat_eq_sum, sumNat_eq_sum]
  exact Finset.sum_lt_sum (fun D hD => hle D (Finset.mem_range.mp hD))
    ⟨1, Finset.mem_range.mpr (by omega), h1⟩

-- [helper]
theorem int_sq_nonneg (x : Int) : 0 ≤ x * x :=
  mul_self_nonneg x


/-! ## Section 1: Exact Eisenstein Integers `ℤ[ω]` -/

/-- Eisenstein integer `a + b * ω` with `ω^2 + ω + 1 = 0`. -/
structure Eis where
  a : Int
  b : Int
  deriving DecidableEq, Repr

namespace Eis

-- [helper]
@[ext] theorem ext {x y : Eis} (ha : x.a = y.a) (hb : x.b = y.b) : x = y := by
  cases x; cases y; simp_all

def zero : Eis := ⟨0, 0⟩
def one : Eis := ⟨1, 0⟩
def omega : Eis := ⟨0, 1⟩
def omega2 : Eis := ⟨-1, -1⟩
def zeta6 : Eis := ⟨1, 1⟩
def ofInt (k : Int) : Eis := ⟨k, 0⟩

def add (x y : Eis) : Eis := ⟨x.a + y.a, x.b + y.b⟩
def neg (x : Eis) : Eis := ⟨-x.a, -x.b⟩
def sub (x y : Eis) : Eis := ⟨x.a - y.a, x.b - y.b⟩
def scale (k : Int) (x : Eis) : Eis := ⟨k * x.a, k * x.b⟩

/-- `(a + b ω)(c + d ω) = (a c - b d) + (a d + b c - b d) ω`. -/
def mul (x y : Eis) : Eis :=
  ⟨x.a * y.a - x.b * y.b, x.a * y.b + x.b * y.a - x.b * y.b⟩

/-- Complex conjugation `conj(a + b ω) = a + b ω^2 = (a - b) - b ω`. -/
def conj (x : Eis) : Eis := ⟨x.a - x.b, -x.b⟩

/-- Exact integer squared norm `|a + b ω|^2 = a^2 - a b + b^2`. -/
def normSq (x : Eis) : Int := x.a * x.a - x.a * x.b + x.b * x.b

def pow (x : Eis) : Nat → Eis
  | 0 => one
  | n + 1 => mul (pow x n) x

instance : Zero Eis := ⟨Eis.zero⟩
instance : One Eis := ⟨Eis.one⟩
instance : Add Eis := ⟨Eis.add⟩
instance : Neg Eis := ⟨Eis.neg⟩
instance : Sub Eis := ⟨Eis.sub⟩
instance : Mul Eis := ⟨Eis.mul⟩
instance : Star Eis := ⟨Eis.conj⟩

@[simp] private theorem a_zero : (0 : Eis).a = 0 := rfl
@[simp] private theorem b_zero : (0 : Eis).b = 0 := rfl
@[simp] private theorem a_one : (1 : Eis).a = 1 := rfl
@[simp] private theorem b_one : (1 : Eis).b = 0 := rfl
@[simp] private theorem a_add (x y : Eis) : (x + y).a = x.a + y.a := rfl
@[simp] private theorem b_add (x y : Eis) : (x + y).b = x.b + y.b := rfl
@[simp] private theorem a_neg (x : Eis) : (-x).a = -x.a := rfl
@[simp] private theorem b_neg (x : Eis) : (-x).b = -x.b := rfl
@[simp] private theorem a_sub (x y : Eis) : (x - y).a = x.a - y.a := rfl
@[simp] private theorem b_sub (x y : Eis) : (x - y).b = x.b - y.b := rfl
@[simp] private theorem a_mul (x y : Eis) : (x * y).a = x.a * y.a - x.b * y.b := rfl
@[simp] private theorem b_mul (x y : Eis) : (x * y).b = x.a * y.b + x.b * y.a - x.b * y.b := rfl
@[simp] private theorem a_star (x : Eis) : (star x).a = x.a - x.b := rfl
@[simp] private theorem b_star (x : Eis) : (star x).b = -x.b := rfl

instance : CommRing Eis where
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
  natCast n := Eis.ofInt n
  natCast_zero := rfl
  natCast_succ n := by ext <;> simp [Eis.ofInt]
  intCast k := Eis.ofInt k
  intCast_ofNat _ := rfl
  intCast_negSucc n := by
    change Eis.ofInt (Int.negSucc n) = -(Eis.ofInt (n + 1))
    ext <;> simp [Eis.ofInt, Int.negSucc_eq]

instance : StarRing Eis where
  star_involutive _ := by ext <;> simp
  star_mul _ _ := by ext <;> simp <;> ring
  star_add _ _ := by ext <;> simp <;> ring

-- [helper]
theorem zeta6_unit : mul (conj zeta6) zeta6 = one := by decide

-- [helper]
theorem pow_unit (u : Eis) (hu : mul (conj u) u = one) :
    ∀ n : Nat, mul (conj (pow u n)) (pow u n) = one := by
  have hu' : star u * u = 1 := hu
  intro n
  induction n with
  | zero => exact (by decide : mul (conj one) one = one)
  | succ n ih =>
    have ih' : star (pow u n) * pow u n = 1 := ih
    change star (pow u n * u) * (pow u n * u) = 1
    rw [star_mul]
    calc star u * star (pow u n) * (pow u n * u)
        = (star u * u) * (star (pow u n) * pow u n) := by ring
      _ = 1 * 1 := by rw [hu', ih']
      _ = 1 := _root_.one_mul 1

end Eis


/-! ## Section 2: `2 × 2` Matrices over `ℤ[ω]` -/

/-- `2 × 2` matrices over `ℤ[ω]`. -/
structure Mat2Eis where
  m00 : Eis
  m01 : Eis
  m10 : Eis
  m11 : Eis
  deriving DecidableEq, Repr

namespace Mat2Eis

@[ext] private theorem ext {A B : Mat2Eis} (h00 : A.m00 = B.m00) (h01 : A.m01 = B.m01)
    (h10 : A.m10 = B.m10) (h11 : A.m11 = B.m11) : A = B := by
  cases A; cases B; simp_all

def zero : Mat2Eis := ⟨Eis.zero, Eis.zero, Eis.zero, Eis.zero⟩
def id : Mat2Eis := ⟨Eis.one, Eis.zero, Eis.zero, Eis.one⟩

def add (A B : Mat2Eis) : Mat2Eis :=
  ⟨Eis.add A.m00 B.m00, Eis.add A.m01 B.m01, Eis.add A.m10 B.m10, Eis.add A.m11 B.m11⟩

def sub (A B : Mat2Eis) : Mat2Eis :=
  ⟨Eis.sub A.m00 B.m00, Eis.sub A.m01 B.m01, Eis.sub A.m10 B.m10, Eis.sub A.m11 B.m11⟩

def scale (k : Int) (A : Mat2Eis) : Mat2Eis :=
  ⟨Eis.scale k A.m00, Eis.scale k A.m01, Eis.scale k A.m10, Eis.scale k A.m11⟩

def scaleEis (s : Eis) (A : Mat2Eis) : Mat2Eis :=
  ⟨Eis.mul s A.m00, Eis.mul s A.m01, Eis.mul s A.m10, Eis.mul s A.m11⟩

def mul (A B : Mat2Eis) : Mat2Eis :=
  ⟨ Eis.add (Eis.mul A.m00 B.m00) (Eis.mul A.m01 B.m10),
    Eis.add (Eis.mul A.m00 B.m01) (Eis.mul A.m01 B.m11),
    Eis.add (Eis.mul A.m10 B.m00) (Eis.mul A.m11 B.m10),
    Eis.add (Eis.mul A.m10 B.m01) (Eis.mul A.m11 B.m11) ⟩

def dag (A : Mat2Eis) : Mat2Eis :=
  ⟨Eis.conj A.m00, Eis.conj A.m10, Eis.conj A.m01, Eis.conj A.m11⟩

def trace (A : Mat2Eis) : Eis := Eis.add A.m00 A.m11

def det (A : Mat2Eis) : Eis := Eis.sub (Eis.mul A.m00 A.m11) (Eis.mul A.m01 A.m10)

def frobNormSq (A : Mat2Eis) : Int :=
  Eis.normSq A.m00 + Eis.normSq A.m01 + Eis.normSq A.m10 + Eis.normSq A.m11

def pow (A : Mat2Eis) : Nat → Mat2Eis
  | 0 => id
  | n + 1 => mul (pow A n) A

/-- Canonical embedding into Mathlib `Matrix (Fin 2) (Fin 2) Eis`. -/
private def toMatrix (A : Mat2Eis) : Matrix (Fin 2) (Fin 2) Eis :=
  Matrix.of ![![A.m00, A.m01], ![A.m10, A.m11]]

-- [helper]
theorem mul_id (A : Mat2Eis) : mul A id = A := by
  ext <;> dsimp [mul, id, Eis.add, Eis.mul, Eis.one, Eis.zero] <;> ring

-- [helper]
theorem mul_assoc (A B C : Mat2Eis) : mul (mul A B) C = mul A (mul B C) := by
  ext <;> dsimp [mul, Eis.add, Eis.mul] <;> ring

-- [helper]
theorem mul_sub (A B C : Mat2Eis) : mul A (sub B C) = sub (mul A B) (mul A C) := by
  ext <;> dsimp [mul, sub, Eis.add, Eis.sub, Eis.mul] <;> ring

-- [helper]
theorem mul_scale (k : Int) (A B : Mat2Eis) : mul A (scale k B) = scale k (mul A B) := by
  ext <;> dsimp [mul, scale, Eis.add, Eis.mul, Eis.scale] <;> ring

-- [helper]
theorem trace_sub (A B : Mat2Eis) : trace (sub A B) = Eis.sub (trace A) (trace B) := by
  ext <;> dsimp [trace, sub, Eis.add, Eis.sub] <;> ring

-- [helper]
theorem trace_scale (k : Int) (A : Mat2Eis) : trace (scale k A) = Eis.scale k (trace A) := by
  ext <;> dsimp [trace, scale, Eis.add, Eis.scale] <;> ring

-- [helper]
theorem trace_scale_id (k : Int) : trace (scale k id) = Eis.ofInt (2 * k) := by
  ext <;> dsimp [trace, scale, id, Eis.ofInt, Eis.one, Eis.add, Eis.scale] <;> ring

end Mat2Eis


/-! ## Section 3: Exact Ninth Cyclotomic Ring `ℤ[ζ_9]` -/

/-- Ninth cyclotomic integer `c0 + c1 z + c2 z^2 + c3 z^3 + c4 z^4 + c5 z^5`
    modulo `z^6 + z^3 + 1 = 0` (`z = ζ_9 = exp(2πi / 9)`).
    Note `ζ_18 = exp(iπ / 9) = -ζ_9^5` lies inside `ℤ[ζ_9]` identically. -/
structure Ninth where
  c0 : Int
  c1 : Int
  c2 : Int
  c3 : Int
  c4 : Int
  c5 : Int
  deriving DecidableEq, Repr

namespace Ninth

-- [helper]
@[ext] theorem ext {x y : Ninth} (h0 : x.c0 = y.c0) (h1 : x.c1 = y.c1)
    (h2 : x.c2 = y.c2) (h3 : x.c3 = y.c3) (h4 : x.c4 = y.c4) (h5 : x.c5 = y.c5) : x = y := by
  cases x; cases y; simp_all

def zero : Ninth := ⟨0, 0, 0, 0, 0, 0⟩
def one : Ninth := ⟨1, 0, 0, 0, 0, 0⟩
def zeta9 : Ninth := ⟨0, 1, 0, 0, 0, 0⟩
def omega : Ninth := ⟨0, 0, 0, 1, 0, 0⟩
def zeta18 : Ninth := ⟨0, 0, 0, 0, 0, -1⟩
def ofInt (k : Int) : Ninth := ⟨k, 0, 0, 0, 0, 0⟩

def add (x y : Ninth) : Ninth :=
  ⟨x.c0 + y.c0, x.c1 + y.c1, x.c2 + y.c2, x.c3 + y.c3, x.c4 + y.c4, x.c5 + y.c5⟩

def neg (x : Ninth) : Ninth :=
  ⟨-x.c0, -x.c1, -x.c2, -x.c3, -x.c4, -x.c5⟩

def sub (x y : Ninth) : Ninth :=
  ⟨x.c0 - y.c0, x.c1 - y.c1, x.c2 - y.c2, x.c3 - y.c3, x.c4 - y.c4, x.c5 - y.c5⟩

def scale (k : Int) (x : Ninth) : Ninth :=
  ⟨k * x.c0, k * x.c1, k * x.c2, k * x.c3, k * x.c4, k * x.c5⟩

def mul (x y : Ninth) : Ninth :=
  let p0  := x.c0 * y.c0
  let p1  := x.c0 * y.c1 + x.c1 * y.c0
  let p2  := x.c0 * y.c2 + x.c1 * y.c1 + x.c2 * y.c0
  let p3  := x.c0 * y.c3 + x.c1 * y.c2 + x.c2 * y.c1 + x.c3 * y.c0
  let p4  := x.c0 * y.c4 + x.c1 * y.c3 + x.c2 * y.c2 + x.c3 * y.c1 + x.c4 * y.c0
  let p5  := x.c0 * y.c5 + x.c1 * y.c4 + x.c2 * y.c3 + x.c3 * y.c2 + x.c4 * y.c1 + x.c5 * y.c0
  let p6  := x.c1 * y.c5 + x.c2 * y.c4 + x.c3 * y.c3 + x.c4 * y.c2 + x.c5 * y.c1
  let p7  := x.c2 * y.c5 + x.c3 * y.c4 + x.c4 * y.c3 + x.c5 * y.c2
  let p8  := x.c3 * y.c5 + x.c4 * y.c4 + x.c5 * y.c3
  let p9  := x.c4 * y.c5 + x.c5 * y.c4
  let p10 := x.c5 * y.c5
  ⟨p0 - p6 + p9, p1 - p7 + p10, p2 - p8, p3 - p6, p4 - p7, p5 - p8⟩

/-- Complex conjugation `ζ_9^k ↦ ζ_9^(9 - k)` reduced mod `z^6 + z^3 + 1`. -/
def conj (x : Ninth) : Ninth :=
  ⟨x.c0 - x.c3, -x.c2, -x.c1, -x.c3, x.c5 - x.c2, x.c4 - x.c1⟩

def pow (x : Ninth) : Nat → Ninth
  | 0 => one
  | n + 1 => mul (pow x n) x

instance : Zero Ninth := ⟨Ninth.zero⟩
instance : One Ninth := ⟨Ninth.one⟩
instance : Add Ninth := ⟨Ninth.add⟩
instance : Neg Ninth := ⟨Ninth.neg⟩
instance : Sub Ninth := ⟨Ninth.sub⟩
instance : Mul Ninth := ⟨Ninth.mul⟩
instance : Star Ninth := ⟨Ninth.conj⟩

private theorem zero_def : (0 : Ninth) = ⟨0, 0, 0, 0, 0, 0⟩ := rfl
private theorem one_def : (1 : Ninth) = ⟨1, 0, 0, 0, 0, 0⟩ := rfl
private theorem add_def (x y : Ninth) : x + y = Ninth.add x y := rfl
private theorem neg_def (x : Ninth) : -x = Ninth.neg x := rfl
private theorem sub_def (x y : Ninth) : x - y = Ninth.sub x y := rfl
private theorem mul_def (x y : Ninth) : x * y = Ninth.mul x y := rfl
private theorem star_def (x : Ninth) : star x = Ninth.conj x := rfl

instance : CommRing Ninth where
  add_assoc _ _ _ := by ext <;> simp only [add_def, Ninth.add] <;> ring
  zero_add _ := by ext <;> simp only [add_def, zero_def, Ninth.add] <;> ring
  add_zero _ := by ext <;> simp only [add_def, zero_def, Ninth.add] <;> ring
  nsmul := nsmulRec
  zsmul := zsmulRec
  neg_add_cancel _ := by ext <;> simp only [add_def, neg_def, zero_def, Ninth.add, Ninth.neg] <;> ring
  add_comm _ _ := by ext <;> simp only [add_def, Ninth.add] <;> ring
  sub_eq_add_neg _ _ := by ext <;> simp only [sub_def, add_def, neg_def, Ninth.sub, Ninth.add, Ninth.neg] <;> ring
  left_distrib _ _ _ := by ext <;> simp only [mul_def, add_def, Ninth.mul, Ninth.add] <;> ring
  right_distrib _ _ _ := by ext <;> simp only [mul_def, add_def, Ninth.mul, Ninth.add] <;> ring
  zero_mul _ := by ext <;> simp only [mul_def, zero_def, Ninth.mul] <;> ring
  mul_zero _ := by ext <;> simp only [mul_def, zero_def, Ninth.mul] <;> ring
  mul_assoc _ _ _ := by ext <;> simp only [mul_def, Ninth.mul] <;> ring
  one_mul _ := by ext <;> simp only [mul_def, one_def, Ninth.mul] <;> ring
  mul_one _ := by ext <;> simp only [mul_def, one_def, Ninth.mul] <;> ring
  mul_comm _ _ := by ext <;> simp only [mul_def, Ninth.mul] <;> ring
  npow := npowRec
  natCast n := Ninth.ofInt n
  natCast_zero := rfl
  natCast_succ n := by
    change Ninth.ofInt (n + 1 : Nat) = Ninth.add (Ninth.ofInt n) Ninth.one
    ext <;> simp [Ninth.ofInt, Ninth.add, Ninth.one]
  intCast k := Ninth.ofInt k
  intCast_ofNat _ := rfl
  intCast_negSucc n := by
    change Ninth.ofInt (Int.negSucc n) = Ninth.neg (Ninth.ofInt (n + 1))
    ext <;> simp [Ninth.ofInt, Ninth.neg, Int.negSucc_eq]

instance : StarRing Ninth where
  star_involutive _ := by ext <;> simp only [star_def, Ninth.conj] <;> ring
  star_mul _ _ := by ext <;> simp only [star_def, mul_def, Ninth.conj, Ninth.mul] <;> ring
  star_add _ _ := by ext <;> simp only [star_def, add_def, Ninth.conj, Ninth.add] <;> ring

/-- Exact order-18 certificate inside `ℤ[ζ_9]`: `ζ_18^18 = 1` (with `ζ_18^9 = -1`). -/
theorem zeta18_pow18_eq_one : pow zeta18 18 = one := by
  have h9 : pow zeta18 9 = ofInt (-1) := by decide
  change mul (mul (mul (mul (mul (mul (mul (mul (mul (pow zeta18 9) zeta18) zeta18) zeta18) zeta18) zeta18) zeta18) zeta18) zeta18) zeta18 = one
  rw [h9]
  decide

/-- Exact cyclotomic unit certificate `conj(ζ_18) * ζ_18 = 1` inside `ℤ[ζ_9]`. -/
theorem zeta18_unit_left : mul (conj zeta18) zeta18 = one := by decide

/-- Exact squared spectral gap `g = |ζ_18 - 1|^2 = (ζ_18 - 1)(conj(ζ_18) - 1)` in `ℤ[ζ_9]`. -/
def gapSqZeta18 : Ninth := mul (sub zeta18 one) (sub (conj zeta18) one)

/-- `g = |ζ_18 - 1|^2 ≠ 0` inside `ℤ[ζ_9]`. -/
theorem gapSqZeta18_ne_zero : gapSqZeta18 ≠ zero := by decide

/-- Exact irreducible cubic minimal polynomial certificate `g^3 - 6 g^2 + 9 g - 1 = 0` inside `ℤ[ζ_9]`. -/
theorem gapSqZeta18_minpoly :
    sub (add (sub (pow gapSqZeta18 3) (scale 6 (pow gapSqZeta18 2))) (scale 9 gapSqZeta18)) one
      = zero := by
  decide

end Ninth


/-! ## Section 4: Involutive Commutative *-Ring `StarCommRing` -/

/-- Commutative *-ring interface with full involution axioms for symbolic operator proofs. -/
class StarCommRing (R : Type) where
  zero : R
  one : R
  add : R → R → R
  neg : R → R
  mul : R → R → R
  conj : R → R
  add_zero : ∀ a : R, add a zero = a
  zero_add : ∀ a : R, add zero a = a
  add_comm : ∀ a b : R, add a b = add b a
  add_assoc : ∀ a b c : R, add (add a b) c = add a (add b c)
  add_neg : ∀ a : R, add a (neg a) = zero
  mul_one : ∀ a : R, mul a one = a
  one_mul : ∀ a : R, mul one a = a
  mul_zero : ∀ a : R, mul a zero = zero
  zero_mul : ∀ a : R, mul zero a = zero
  mul_comm : ∀ a b : R, mul a b = mul b a
  mul_assoc : ∀ a b c : R, mul (mul a b) c = mul a (mul b c)
  mul_add : ∀ a b c : R, mul a (add b c) = add (mul a b) (mul a c)
  add_mul : ∀ a b c : R, mul (add a b) c = add (mul a c) (mul b c)
  conj_conj : ∀ a : R, conj (conj a) = a
  conj_add : ∀ a b : R, conj (add a b) = add (conj a) (conj b)
  conj_mul : ∀ a b : R, conj (mul a b) = mul (conj a) (conj b)
  conj_one : conj one = one

namespace StarCommRing

/-- Non-instance `CommRing` bridge unlocking Mathlib's `ring` tactic on any `StarCommRing R`. -/
@[instance_reducible]
def toCommRing (R : Type) [StarCommRing R] : CommRing R where
  zero := zero
  one := one
  add := add
  neg := neg
  mul := mul
  add_assoc := add_assoc
  zero_add := zero_add
  add_zero := add_zero
  nsmul := @nsmulRec R ⟨zero⟩ ⟨add⟩
  zsmul := @zsmulRec R ⟨zero⟩ ⟨add⟩ ⟨neg⟩ (@nsmulRec R ⟨zero⟩ ⟨add⟩)
  neg_add_cancel a := by change add (neg a) a = zero; rw [add_comm, add_neg]
  add_comm := add_comm
  left_distrib := mul_add
  right_distrib := add_mul
  zero_mul := zero_mul
  mul_zero := mul_zero
  mul_assoc := mul_assoc
  one_mul := one_mul
  mul_one := mul_one
  mul_comm := mul_comm
  npow := @npowRec R ⟨one⟩ ⟨mul⟩

def sub {R : Type} [StarCommRing R] (a b : R) : R := add a (neg b)

def powR {R : Type} [StarCommRing R] (a : R) : Nat → R
  | 0 => one
  | n + 1 => mul (powR a n) a

def ofNatR {R : Type} [StarCommRing R] : Nat → R
  | 0 => zero
  | n + 1 => add (ofNatR n) one

def sumN {R : Type} [StarCommRing R] : Nat → (Nat → R) → R
  | 0, _ => zero
  | n + 1, f => add (sumN n f) (f n)

-- [helper]
theorem sub_self {R : Type} [StarCommRing R] (a : R) : sub a a = zero :=
  add_neg a

-- [helper]
theorem add_sub_cancel {R : Type} [StarCommRing R] (a b : R) :
    add b (sub a b) = a := by
  let _ : CommRing R := toCommRing R
  change b + (a + -b) = a
  ring

-- [helper]
theorem unit_compose_identity {R : Type} [StarCommRing R] (u v : R) :
    add (sub u one) (mul (sub v one) u) = sub (mul v u) one := by
  let _ : CommRing R := toCommRing R
  change (u + -1) + (v + -1) * u = v * u + -1
  ring

-- [helper]
theorem sumN_const {R : Type} [StarCommRing R] (n : Nat) (c : R) :
    sumN n (fun _ => c) = mul (ofNatR n) c := by
  let _ : CommRing R := toCommRing R
  induction n with
  | zero => exact (zero_mul c).symm
  | succ n ih =>
    have ih' : sumN n (fun _ => c) = ofNatR n * c := ih
    change sumN n (fun _ => c) + c = (ofNatR n + 1) * c
    rw [ih']; ring

-- [helper]
theorem sumN_scale {R : Type} [StarCommRing R] (n : Nat) (c : R) (f : Nat → R) :
    sumN n (fun i => mul c (f i)) = mul c (sumN n f) := by
  let _ : CommRing R := toCommRing R
  induction n with
  | zero => exact (mul_zero c).symm
  | succ n ih =>
    have ih' : sumN n (fun i => mul c (f i)) = c * sumN n f := ih
    change sumN n (fun i => mul c (f i)) + c * f n = c * (sumN n f + f n)
    rw [ih']; ring

-- [helper]
theorem sumN_add {R : Type} [StarCommRing R] (n : Nat) (f g : Nat → R) :
    sumN n (fun i => add (f i) (g i)) = add (sumN n f) (sumN n g) := by
  let _ : CommRing R := toCommRing R
  induction n with
  | zero => exact (add_zero zero).symm
  | succ n ih =>
    have ih' : sumN n (fun i => add (f i) (g i)) = sumN n f + sumN n g := ih
    change sumN n (fun i => add (f i) (g i)) + (f n + g n) = (sumN n f + f n) + (sumN n g + g n)
    rw [ih']; ring

end StarCommRing

instance : StarCommRing Eis where
  zero := Eis.zero
  one := Eis.one
  add := Eis.add
  neg := Eis.neg
  mul := Eis.mul
  conj := Eis.conj
  add_zero a := by cases a; simp [Eis.add, Eis.zero]
  zero_add a := by cases a; simp [Eis.add, Eis.zero]
  add_comm a b := by cases a; cases b; simp only [Eis.add, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  add_assoc a b c := by cases a; cases b; cases c; simp only [Eis.add, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  add_neg a := by cases a; simp only [Eis.add, Eis.neg, Eis.zero, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  mul_one a := by cases a; simp only [Eis.mul, Eis.one, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  one_mul a := by cases a; simp only [Eis.mul, Eis.one, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  mul_zero a := by cases a; simp only [Eis.mul, Eis.zero, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  zero_mul a := by cases a; simp only [Eis.mul, Eis.zero, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  mul_comm a b := by cases a; cases b; simp only [Eis.mul, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  mul_assoc a b c := by cases a; cases b; cases c; simp only [Eis.mul, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  mul_add a b c := by cases a; cases b; cases c; simp only [Eis.mul, Eis.add, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  add_mul a b c := by cases a; cases b; cases c; simp only [Eis.mul, Eis.add, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  conj_conj a := by cases a; simp only [Eis.conj, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  conj_add a b := by cases a; cases b; simp only [Eis.conj, Eis.add, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  conj_mul a b := by cases a; cases b; simp only [Eis.conj, Eis.mul, Eis.mk.injEq]; exact ⟨by ring, by ring⟩
  conj_one := rfl

end Vibe

end
