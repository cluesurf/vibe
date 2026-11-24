import Vibe.Tone

/-!
# Vibe Theory: Exact Algebraic Rings & Iteration Helpers

Zero-dependency Lean 4 algebraic foundation for Vibe Theory:
exact Eisenstein integers `ℤ[ω]`, cyclotomic integers `ℤ[ζ_9]`,
`2 × 2` matrices over `ℤ[ω]`, generic involutive commutative rings `StarCommRing`,
and iteration/summation helpers.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Iteration and Exact Algebraic Rings -/

/-- Discrete-time evolution iterator: `iter U t ψ = U^t ψ`. -/
def iter {α : Type} (f : α → α) : Nat → α → α
  | 0, x => x
  | t + 1, x => f (iter f t x)

theorem iter_zero {α : Type} (f : α → α) (x : α) : iter f 0 x = x := rfl

theorem iter_succ {α : Type} (f : α → α) (t : Nat) (x : α) :
    iter f (t + 1) x = f (iter f t x) := rfl

theorem iter_comm {α : Type} (f : α → α) (t : Nat) (x : α) :
    iter f t (f x) = f (iter f t x) := by
  induction t with
  | zero => rfl
  | succ t ih =>
    rw [iter_succ, iter_succ, ih]

/-- Natural-number finite sum `∑_{D = 0}^{n - 1} f D`. -/
def sumNat : Nat → (Nat → Nat) → Nat
  | 0, _ => 0
  | n + 1, f => sumNat n f + f n

theorem sumNat_pos (F : Nat) (f : Nat → Nat) (hF : F ≥ 1)
    (hpos : ∀ D : Nat, D < F → f D > 0) : sumNat F f > 0 := by
  cases F with
  | zero => omega
  | succ k =>
    have hk : f k > 0 := hpos k (by omega)
    simp only [sumNat]
    omega

theorem sumNat_le (F : Nat) (f g : Nat → Nat)
    (hle : ∀ D : Nat, D < F → f D ≤ g D) : sumNat F f ≤ sumNat F g := by
  induction F with
  | zero => simp only [sumNat]; omega
  | succ k ih =>
    have h1 : sumNat k f ≤ sumNat k g := ih (fun D hD => hle D (by omega))
    have h2 : f k ≤ g k := hle k (by omega)
    simp only [sumNat]
    omega

theorem sumNat_lt_of_step (F : Nat) (f g : Nat → Nat) (hF : F ≥ 2)
    (hle : ∀ D : Nat, D < F → f D ≤ g D) (h1 : f 1 < g 1) :
    sumNat F f < sumNat F g := by
  induction F with
  | zero => omega
  | succ k ih =>
    cases k with
    | zero => omega
    | succ m =>
      cases m with
      | zero =>
        have h0 : f 0 ≤ g 0 := hle 0 (by omega)
        change (0 + f 0) + f 1 < (0 + g 0) + g 1
        omega
      | succ r =>
        have hprev : sumNat (r + 2) f < sumNat (r + 2) g :=
          ih (by omega) (fun D hD => hle D (by omega))
        have htop : f (r + 2) ≤ g (r + 2) := hle (r + 2) (by omega)
        change sumNat (r + 2) f + f (r + 2) < sumNat (r + 2) g + g (r + 2)
        omega

/-- Eisenstein integer `a + b * w` with `w^2 + w + 1 = 0`. -/
structure Eis where
  a : Int
  b : Int
  deriving DecidableEq, Repr

namespace Eis

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

/-- `(a + b w)(c + d w) = (a c - b d) + (a d + b c - b d) w`. -/
def mul (x y : Eis) : Eis :=
  ⟨x.a * y.a - x.b * y.b, x.a * y.b + x.b * y.a - x.b * y.b⟩

/-- Complex conjugation `conj(a + b w) = a + b w^2 = (a - b) - b w`. -/
def conj (x : Eis) : Eis := ⟨x.a - x.b, -x.b⟩

/-- Exact integer squared norm `|a + b w|^2 = a^2 - a b + b^2`. -/
def normSq (x : Eis) : Int := x.a * x.a - x.a * x.b + x.b * x.b

def pow (x : Eis) : Nat → Eis
  | 0 => one
  | n + 1 => mul (pow x n) x

theorem omega_cube : mul (mul omega omega) omega = one := by decide
theorem omega_minimal : add (add omega2 omega) one = zero := by decide
theorem zeta6_sq : mul zeta6 zeta6 = omega := by decide
theorem zeta6_unit : mul (conj zeta6) zeta6 = one := by decide

theorem add_zero (x : Eis) : add x zero = x := by
  cases x
  simp only [add, zero, Eis.mk.injEq]
  exact ⟨by omega, by omega⟩

theorem zero_add (x : Eis) : add zero x = x := by
  cases x
  simp only [add, zero, Eis.mk.injEq]
  exact ⟨by omega, by omega⟩

theorem add_comm (x y : Eis) : add x y = add y x := by
  cases x; cases y
  simp only [add, Eis.mk.injEq]
  exact ⟨by omega, by omega⟩

theorem add_assoc (x y z : Eis) : add (add x y) z = add x (add y z) := by
  cases x; cases y; cases z
  simp only [add, Eis.mk.injEq]
  exact ⟨by omega, by omega⟩

theorem add_neg (x : Eis) : add x (neg x) = zero := by
  cases x
  simp only [add, neg, zero, Eis.mk.injEq]
  exact ⟨by omega, by omega⟩

theorem mul_one (x : Eis) : mul x one = x := by
  cases x
  simp only [mul, one, Eis.mk.injEq, Int.mul_one, Int.mul_zero]
  exact ⟨by omega, by omega⟩

theorem one_mul (x : Eis) : mul one x = x := by
  cases x
  simp only [mul, one, Eis.mk.injEq, Int.one_mul, Int.zero_mul]
  exact ⟨by omega, by omega⟩

theorem mul_zero (x : Eis) : mul x zero = zero := by
  cases x
  simp only [mul, zero, Eis.mk.injEq, Int.mul_zero]
  exact ⟨by omega, by omega⟩

theorem zero_mul (x : Eis) : mul zero x = zero := by
  cases x
  simp only [mul, zero, Eis.mk.injEq, Int.zero_mul]
  exact ⟨by omega, by omega⟩

theorem mul_comm (x y : Eis) : mul x y = mul y x := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [mul, Eis.mk.injEq]
  rw [Int.mul_comm xa ya, Int.mul_comm xb yb, Int.mul_comm xa yb, Int.mul_comm xb ya]
  exact ⟨by omega, by omega⟩

theorem mul_assoc (x y z : Eis) : mul (mul x y) z = mul x (mul y z) := by
  cases x; cases y; cases z
  simp only [mul, Eis.mk.injEq, Int.mul_add, Int.add_mul, Int.mul_sub, Int.sub_mul, Int.mul_assoc]
  exact ⟨by omega, by omega⟩

theorem mul_add (x y z : Eis) : mul x (add y z) = add (mul x y) (mul x z) := by
  cases x; cases y; cases z
  simp only [mul, add, Eis.mk.injEq, Int.mul_add]
  exact ⟨by omega, by omega⟩

theorem add_mul (x y z : Eis) : mul (add x y) z = add (mul x z) (mul y z) := by
  cases x; cases y; cases z
  simp only [mul, add, Eis.mk.injEq, Int.add_mul]
  exact ⟨by omega, by omega⟩

theorem mul_sub (x y z : Eis) : mul x (sub y z) = sub (mul x y) (mul x z) := by
  cases x; cases y; cases z
  simp only [mul, sub, Eis.mk.injEq, Int.mul_sub]
  exact ⟨by omega, by omega⟩

theorem mul_scale (k : Int) (x y : Eis) : mul x (scale k y) = scale k (mul x y) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [mul, scale, Eis.mk.injEq, Int.mul_add, Int.mul_sub]
  have h1 : xa * (k * ya) = k * (xa * ya) := by
    rw [← Int.mul_assoc, Int.mul_comm xa k, Int.mul_assoc]
  have h2 : xb * (k * yb) = k * (xb * yb) := by
    rw [← Int.mul_assoc, Int.mul_comm xb k, Int.mul_assoc]
  have h3 : xa * (k * yb) = k * (xa * yb) := by
    rw [← Int.mul_assoc, Int.mul_comm xa k, Int.mul_assoc]
  have h4 : xb * (k * ya) = k * (xb * ya) := by
    rw [← Int.mul_assoc, Int.mul_comm xb k, Int.mul_assoc]
  rw [h1, h2, h3, h4]
  exact ⟨rfl, rfl⟩

theorem conj_mul (x y : Eis) : conj (mul x y) = mul (conj x) (conj y) := by
  cases x; cases y
  simp only [conj, mul, Eis.mk.injEq, Int.mul_sub, Int.sub_mul, Int.neg_mul, Int.mul_neg, Int.neg_neg]
  exact ⟨by omega, by omega⟩

theorem pow_unit (u : Eis) (hu : mul (conj u) u = one) :
    ∀ n : Nat, mul (conj (pow u n)) (pow u n) = one := by
  intro n
  induction n with
  | zero =>
    simp only [pow]
    decide
  | succ n ih =>
    simp only [pow]
    rw [conj_mul, mul_assoc]
    have hmid : mul (conj u) (mul (pow u n) u) = pow u n := by
      rw [mul_comm (pow u n) u, ← mul_assoc, hu, one_mul]
    rw [hmid, ih]

end Eis

/-- 2x2 matrices over `Z[w]`. -/
structure Mat2Eis where
  m00 : Eis
  m01 : Eis
  m10 : Eis
  m11 : Eis
  deriving DecidableEq, Repr

namespace Mat2Eis

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

theorem mul_id (A : Mat2Eis) : mul A id = A := by
  cases A
  simp only [mul, id, Eis.mul_one, Eis.mul_zero, Eis.add_zero, Eis.zero_add]

theorem mul_assoc (A B C : Mat2Eis) : mul (mul A B) C = mul A (mul B C) := by
  cases A; cases B; cases C
  simp only [mul, Eis.add_mul, Eis.mul_add, Eis.mul_assoc, Mat2Eis.mk.injEq]
  have swap4 : ∀ a b c d : Eis,
      Eis.add (Eis.add a b) (Eis.add c d) = Eis.add (Eis.add a c) (Eis.add b d) := by
    intro a b c d
    rw [Eis.add_assoc a b (Eis.add c d), ← Eis.add_assoc b c d, Eis.add_comm b c,
        Eis.add_assoc c b d, ← Eis.add_assoc a c (Eis.add b d)]
  exact ⟨swap4 _ _ _ _, swap4 _ _ _ _, swap4 _ _ _ _, swap4 _ _ _ _⟩

theorem mul_sub (A B C : Mat2Eis) : mul A (sub B C) = sub (mul A B) (mul A C) := by
  cases A; cases B; cases C
  simp only [mul, sub, Eis.mul_sub, Mat2Eis.mk.injEq]
  have subHelper : ∀ u v w t : Eis,
      Eis.add (Eis.sub u v) (Eis.sub w t) = Eis.sub (Eis.add u w) (Eis.add v t) := by
    intro u v w t
    cases u; cases v; cases w; cases t
    simp only [Eis.add, Eis.sub, Eis.mk.injEq]
    exact ⟨by omega, by omega⟩
  exact ⟨subHelper _ _ _ _, subHelper _ _ _ _, subHelper _ _ _ _, subHelper _ _ _ _⟩

theorem mul_scale (k : Int) (A B : Mat2Eis) : mul A (scale k B) = scale k (mul A B) := by
  cases A; cases B
  simp only [mul, scale, Eis.mul_scale, Mat2Eis.mk.injEq]
  have scAdd : ∀ u v : Eis, Eis.add (Eis.scale k u) (Eis.scale k v) = Eis.scale k (Eis.add u v) := by
    intro u v
    cases u; cases v
    simp only [Eis.add, Eis.scale, Int.mul_add]
  exact ⟨scAdd _ _, scAdd _ _, scAdd _ _, scAdd _ _⟩

theorem trace_sub (A B : Mat2Eis) : trace (sub A B) = Eis.sub (trace A) (trace B) := by
  cases A; cases B
  simp only [trace, sub, Eis.add, Eis.sub, Eis.mk.injEq]
  exact ⟨by omega, by omega⟩

theorem trace_scale (k : Int) (A : Mat2Eis) : trace (scale k A) = Eis.scale k (trace A) := by
  cases A
  simp only [trace, scale, Eis.add, Eis.scale, Int.mul_add]

theorem trace_scale_id (k : Int) : trace (scale k id) = Eis.ofInt (2 * k) := by
  simp only [trace, scale, id, Eis.ofInt, Eis.one, Eis.add, Eis.scale, Eis.mk.injEq]
  exact ⟨by omega, by omega⟩

end Mat2Eis

/-- Ninth cyclotomic integer `c0 + c1 z + c2 z^2 + c3 z^3 + c4 z^4 + c5 z^5`
    modulo `z^6 + z^3 + 1 = 0` (`z = zeta_9 = exp(2 pi i / 9)`).
    Note `zeta_18 = exp(i pi / 9) = -zeta_9^5` lies inside `Z[zeta_9]` identically. -/
structure Ninth where
  c0 : Int
  c1 : Int
  c2 : Int
  c3 : Int
  c4 : Int
  c5 : Int
  deriving DecidableEq, Repr

namespace Ninth

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

/-- Complex conjugation `zeta_9^k ↦ zeta_9^(9 - k)` reduced mod `z^6 + z^3 + 1`. -/
def conj (x : Ninth) : Ninth :=
  ⟨x.c0 - x.c3, -x.c2, -x.c1, -x.c3, x.c5 - x.c2, x.c4 - x.c1⟩

def pow (x : Ninth) : Nat → Ninth
  | 0 => one
  | n + 1 => mul (pow x n) x

theorem zeta18_sq_eq_zeta9 : mul zeta18 zeta18 = zeta9 := by decide
theorem zeta18_pow6_eq_omega : pow zeta18 6 = omega := by decide
theorem zeta18_pow9_eq_neg_one : pow zeta18 9 = ofInt (-1) := by decide
theorem zeta18_pow18_eq_one : pow zeta18 18 = one := by
  have h9 : pow zeta18 9 = ofInt (-1) := zeta18_pow9_eq_neg_one
  change mul (mul (mul (mul (mul (mul (mul (mul (mul (pow zeta18 9) zeta18) zeta18) zeta18) zeta18) zeta18) zeta18) zeta18) zeta18) zeta18 = one
  rw [h9]
  decide
theorem zeta18_unit_left : mul (conj zeta18) zeta18 = one := by decide
theorem zeta18_unit_right : mul zeta18 (conj zeta18) = one := by decide
theorem zeta18_ne_one : zeta18 ≠ one := by decide

/-- Exact squared spectral gap `g = |zeta_18 - 1|^2 = (zeta_18 - 1)(conj(zeta_18) - 1)`
    satisfies the irreducible cubic `g^3 - 6 g^2 + 9 g - 1 = 0` (`g ≠ 0`). -/
def gapSqZeta18 : Ninth := mul (sub zeta18 one) (sub (conj zeta18) one)

theorem gapSqZeta18_ne_zero : gapSqZeta18 ≠ zero := by decide

theorem gapSqZeta18_minpoly :
    sub (add (sub (pow gapSqZeta18 3) (scale 6 (pow gapSqZeta18 2))) (scale 9 gapSqZeta18)) one
      = zero := by
  decide

end Ninth

/-- Minimal commutative *-ring interface for symbolic operator identities (Theorem 4). -/
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

namespace StarCommRing

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

theorem neg_mul {R : Type} [StarCommRing R] (a b : R) :
    mul (neg a) b = neg (mul a b) := by
  have h1 : add (mul a b) (mul (neg a) b) = zero := by
    rw [← add_mul, add_neg, zero_mul]
  have h2 : add (neg (mul a b)) (add (mul a b) (mul (neg a) b)) = neg (mul a b) := by
    rw [h1, add_zero]
  rw [← add_assoc, add_comm (neg (mul a b)) (mul a b), add_neg, zero_add] at h2
  exact h2

theorem mul_neg {R : Type} [StarCommRing R] (a b : R) :
    mul a (neg b) = neg (mul a b) := by
  rw [mul_comm, neg_mul, mul_comm]

theorem sub_self {R : Type} [StarCommRing R] (a : R) : sub a a = zero :=
  add_neg a

theorem add_sub_cancel {R : Type} [StarCommRing R] (a b : R) :
    add b (sub a b) = a := by
  unfold sub
  rw [add_comm a (neg b), ← add_assoc, add_neg, zero_add]

theorem mul_sub {R : Type} [StarCommRing R] (a b c : R) :
    mul a (sub b c) = sub (mul a b) (mul a c) := by
  unfold sub
  rw [mul_add, mul_neg]

theorem sub_mul {R : Type} [StarCommRing R] (a b c : R) :
    mul (sub a b) c = sub (mul a c) (mul b c) := by
  unfold sub
  rw [add_mul, neg_mul]

/-- Key algebraic identity: `(u - 1) + (v - 1) * u = v * u - 1`. -/
theorem unit_compose_identity {R : Type} [StarCommRing R] (u v : R) :
    add (sub u one) (mul (sub v one) u) = sub (mul v u) one := by
  rw [sub_mul, one_mul]
  unfold sub
  rw [add_comm u (neg one), add_assoc (neg one) u (add (mul v u) (neg u))]
  rw [add_comm (mul v u) (neg u), ← add_assoc u (neg u) (mul v u)]
  rw [add_neg, zero_add, add_comm (neg one) (mul v u)]

theorem sumN_const {R : Type} [StarCommRing R] (n : Nat) (c : R) :
    sumN n (fun _ => c) = mul (ofNatR n) c := by
  induction n with
  | zero => simp only [sumN, ofNatR, zero_mul]
  | succ n ih =>
    simp only [sumN, ofNatR]
    rw [ih, add_mul, one_mul]

theorem sumN_scale {R : Type} [StarCommRing R] (n : Nat) (c : R) (f : Nat → R) :
    sumN n (fun i => mul c (f i)) = mul c (sumN n f) := by
  induction n with
  | zero => simp only [sumN, mul_zero]
  | succ n ih =>
    simp only [sumN]
    rw [ih, mul_add]

theorem sumN_add {R : Type} [StarCommRing R] (n : Nat) (f g : Nat → R) :
    sumN n (fun i => add (f i) (g i)) = add (sumN n f) (sumN n g) := by
  induction n with
  | zero => simp only [sumN, add_zero]
  | succ n ih =>
    simp only [sumN]
    rw [ih]
    rw [add_assoc (sumN n f) (sumN n g) (add (f n) (g n))]
    rw [← add_assoc (sumN n g) (f n) (g n)]
    rw [add_comm (sumN n g) (f n)]
    rw [add_assoc (f n) (sumN n g) (g n)]
    rw [← add_assoc (sumN n f) (f n) (add (sumN n g) (g n))]

end StarCommRing

instance : StarCommRing Eis where
  zero := Eis.zero
  one := Eis.one
  add := Eis.add
  neg := Eis.neg
  mul := Eis.mul
  conj := Eis.conj
  add_zero := Eis.add_zero
  zero_add := Eis.zero_add
  add_comm := Eis.add_comm
  add_assoc := Eis.add_assoc
  add_neg := Eis.add_neg
  mul_one := Eis.mul_one
  one_mul := Eis.one_mul
  mul_zero := Eis.mul_zero
  zero_mul := Eis.zero_mul
  mul_comm := Eis.mul_comm
  mul_assoc := Eis.mul_assoc
  mul_add := Eis.mul_add
  add_mul := Eis.add_mul

end Vibe
