module

public import Vibe.Algebra
import Mathlib.Tactic.Ring

/-!
# Vibe Theory: Exact `ℤ[ζ_9][1/6]` Fock Ring & Gate-Coefficient Algebra

Submodule 1 of 4 of `Vibe.FockBeat` (re-exported unchanged by `Vibe.FockBeat`):
- Full `StarCommRing Ninth` star-commutative ring laws for `ℤ[ζ_9]` (bridged directly to Mathlib
  `CommRing Ninth` and `StarRing Ninth` from `Vibe.Algebra`),
- Exact dyadic-triadic localization `NinthLoc6 = ℤ[ζ_9][1/6]` with `StarCommRing NinthLoc6`,
  `CommRing NinthLoc6`, and `StarRing NinthLoc6`,
- Exact algebraic unitarity and `D^2 = C` certificates for every microscopic gate coefficient
  (`D = C_{1/2}`, `K`, `M_pair(ζ_18)`, `M_meet`, and `Φ_odd` powers `ζ_6^n`).
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

-- [helper]
theorem ite_bool_true {α : Type} (t e : α) : (if true = true then t else e) = t := rfl
-- [helper]
theorem ite_bool_false {α : Type} (t e : α) : (if false = true then t else e) = e := rfl

/-! ## Section 1: Exact `StarCommRing Ninth` & Localization `NinthLoc6 = ℤ[ζ_9][1/6]` -/

instance : StarCommRing Ninth where
  zero := Ninth.zero
  one := Ninth.one
  add := Ninth.add
  neg := Ninth.neg
  mul := Ninth.mul
  conj := Ninth.conj
  add_zero := _root_.add_zero
  zero_add := _root_.zero_add
  add_comm := _root_.add_comm
  add_assoc := _root_.add_assoc
  add_neg a := by change a + -a = 0; ring
  mul_one := _root_.mul_one
  one_mul := _root_.one_mul
  mul_zero a := by change a * 0 = 0; ring
  zero_mul a := by change 0 * a = 0; ring
  mul_comm := _root_.mul_comm
  mul_assoc := _root_.mul_assoc
  mul_add := _root_.left_distrib
  add_mul := _root_.right_distrib
  conj_conj := star_star
  conj_add := star_add
  conj_mul a b := by change star (a * b) = star a * star b; rw [star_mul, _root_.mul_comm]
  conj_one := star_one Ninth

private theorem ninth_scale_eq_mul (k : Int) (x : Ninth) :
    Ninth.scale k x = Ninth.ofInt k * x := by
  change Ninth.scale k x = Ninth.mul (Ninth.ofInt k) x
  cases x; ext <;> dsimp [Ninth.scale, Ninth.ofInt, Ninth.mul] <;> ring

private theorem ninth_ofInt_mul (a b : Int) :
    Ninth.ofInt (a * b) = Ninth.ofInt a * Ninth.ofInt b := by
  change Ninth.ofInt (a * b) = Ninth.mul (Ninth.ofInt a) (Ninth.ofInt b)
  ext <;> dsimp [Ninth.ofInt, Ninth.mul] <;> ring

private theorem ninth_conj_ofInt (k : Int) :
    star (Ninth.ofInt k) = Ninth.ofInt k := by
  change Ninth.conj (Ninth.ofInt k) = Ninth.ofInt k
  ext <;> simp [Ninth.ofInt, Ninth.conj]

/-- Exact integer powers of `6`: `pow6 n = 6^n`. -/
def pow6 : Nat → Int
  | 0 => 1
  | n + 1 => 6 * pow6 n

private theorem pow6_add (a b : Nat) : pow6 (a + b) = pow6 a * pow6 b := by
  induction a with
  | zero => simp [pow6]
  | succ k ih =>
    have h1 : (k + 1) + b = (k + b) + 1 := by omega
    rw [h1]; simp only [pow6, ih]; ring

private theorem pow6_cancel_zero (k : Nat) (z : Int) (h : pow6 k * z = 0) : z = 0 := by
  induction k with
  | zero => simpa [pow6] using h
  | succ m ih =>
    simp only [pow6, mul_assoc] at h
    exact ih (by omega)

private theorem ninth_scale_pow6_zero (k : Nat) (x : Ninth)
    (h : Ninth.scale (pow6 k) x = Ninth.zero) : x = Ninth.zero := by
  cases x
  simp only [Ninth.scale, Ninth.zero, Ninth.mk.injEq] at h ⊢
  exact ⟨pow6_cancel_zero k _ h.1, pow6_cancel_zero k _ h.2.1, pow6_cancel_zero k _ h.2.2.1,
    pow6_cancel_zero k _ h.2.2.2.1, pow6_cancel_zero k _ h.2.2.2.2.1,
    pow6_cancel_zero k _ h.2.2.2.2.2⟩

/-- Raw fraction `num / 6^exp` in the dyadic-triadic localization `ℤ[ζ_9][1/6]`. -/
structure NinthRaw6 where
  num : Ninth
  exp : Nat
  deriving DecidableEq, Repr

/-- Exact fraction equivalence `x.num / 6^{x.exp} = y.num / 6^{y.exp}` inside `ℤ[ζ_9][1/6]`. -/
def NinthRaw6.equiv (x y : NinthRaw6) : Prop :=
  Ninth.scale (pow6 y.exp) x.num = Ninth.scale (pow6 x.exp) y.num

instance (x y : NinthRaw6) : Decidable (NinthRaw6.equiv x y) :=
  inferInstanceAs (Decidable (Ninth.scale (pow6 y.exp) x.num = Ninth.scale (pow6 x.exp) y.num))

private theorem ninthRaw6_equiv_iff (x y : NinthRaw6) :
    NinthRaw6.equiv x y ↔ Ninth.ofInt (pow6 y.exp) * x.num = Ninth.ofInt (pow6 x.exp) * y.num := by
  simp only [NinthRaw6.equiv, ninth_scale_eq_mul]

/-- Exact dyadic-triadic ninth cyclotomic ring `ℤ[ζ_9][1/6]` (zero floats, exact unitarity). -/
def NinthLoc6 : Type := Quot NinthRaw6.equiv

namespace NinthLoc6

def mk (num : Ninth) (exp : Nat) : NinthLoc6 := Quot.mk NinthRaw6.equiv ⟨num, exp⟩
def ofNinth (x : Ninth) : NinthLoc6 := mk x 0
def ofInt (k : Int) : NinthLoc6 := ofNinth (Ninth.ofInt k)
def zero : NinthLoc6 := ofNinth Ninth.zero
def one : NinthLoc6 := ofNinth Ninth.one
def inv2 : NinthLoc6 := mk (Ninth.ofInt 3) 1
def inv3 : NinthLoc6 := mk (Ninth.ofInt 2) 1
def inv6 : NinthLoc6 := mk Ninth.one 1
def inv12 : NinthLoc6 := mk (Ninth.ofInt 3) 2

def rawAdd (x y : NinthRaw6) : NinthRaw6 :=
  ⟨Ninth.add (Ninth.scale (pow6 y.exp) x.num) (Ninth.scale (pow6 x.exp) y.num), x.exp + y.exp⟩

def rawNeg (x : NinthRaw6) : NinthRaw6 := ⟨Ninth.neg x.num, x.exp⟩

def rawMul (x y : NinthRaw6) : NinthRaw6 := ⟨Ninth.mul x.num y.num, x.exp + y.exp⟩

def rawConj (x : NinthRaw6) : NinthRaw6 := ⟨Ninth.conj x.num, x.exp⟩

-- [helper]
theorem rawAdd_resp (a₁ a₂ b₁ b₂ : NinthRaw6)
    (ha : NinthRaw6.equiv a₁ a₂) (hb : NinthRaw6.equiv b₁ b₂) :
    Quot.mk NinthRaw6.equiv (rawAdd a₁ b₁) = Quot.mk NinthRaw6.equiv (rawAdd a₂ b₂) := by
  apply Quot.sound
  rw [ninthRaw6_equiv_iff] at ha hb ⊢
  change Ninth.ofInt (pow6 (a₂.exp + b₂.exp)) *
      (Ninth.scale (pow6 b₁.exp) a₁.num + Ninth.scale (pow6 a₁.exp) b₁.num) =
    Ninth.ofInt (pow6 (a₁.exp + b₁.exp)) *
      (Ninth.scale (pow6 b₂.exp) a₂.num + Ninth.scale (pow6 a₂.exp) b₂.num)
  simp only [ninth_scale_eq_mul, pow6_add, ninth_ofInt_mul]
  calc Ninth.ofInt (pow6 a₂.exp) * Ninth.ofInt (pow6 b₂.exp) *
        (Ninth.ofInt (pow6 b₁.exp) * a₁.num + Ninth.ofInt (pow6 a₁.exp) * b₁.num)
      = Ninth.ofInt (pow6 b₂.exp) * Ninth.ofInt (pow6 b₁.exp) * (Ninth.ofInt (pow6 a₂.exp) * a₁.num) +
        Ninth.ofInt (pow6 a₂.exp) * Ninth.ofInt (pow6 a₁.exp) * (Ninth.ofInt (pow6 b₂.exp) * b₁.num) := by ring
    _ = Ninth.ofInt (pow6 b₂.exp) * Ninth.ofInt (pow6 b₁.exp) * (Ninth.ofInt (pow6 a₁.exp) * a₂.num) +
        Ninth.ofInt (pow6 a₂.exp) * Ninth.ofInt (pow6 a₁.exp) * (Ninth.ofInt (pow6 b₁.exp) * b₂.num) := by
          rw [ha, hb]
    _ = Ninth.ofInt (pow6 a₁.exp) * Ninth.ofInt (pow6 b₁.exp) *
        (Ninth.ofInt (pow6 b₂.exp) * a₂.num + Ninth.ofInt (pow6 a₂.exp) * b₂.num) := by ring

-- [helper]
theorem rawNeg_resp (a₁ a₂ : NinthRaw6) (ha : NinthRaw6.equiv a₁ a₂) :
    Quot.mk NinthRaw6.equiv (rawNeg a₁) = Quot.mk NinthRaw6.equiv (rawNeg a₂) := by
  apply Quot.sound
  rw [ninthRaw6_equiv_iff] at ha ⊢
  change Ninth.ofInt (pow6 a₂.exp) * -a₁.num = Ninth.ofInt (pow6 a₁.exp) * -a₂.num
  calc Ninth.ofInt (pow6 a₂.exp) * -a₁.num = -(Ninth.ofInt (pow6 a₂.exp) * a₁.num) := by ring
    _ = -(Ninth.ofInt (pow6 a₁.exp) * a₂.num) := by rw [ha]
    _ = Ninth.ofInt (pow6 a₁.exp) * -a₂.num := by ring

-- [helper]
theorem rawMul_resp (a₁ a₂ b₁ b₂ : NinthRaw6)
    (ha : NinthRaw6.equiv a₁ a₂) (hb : NinthRaw6.equiv b₁ b₂) :
    Quot.mk NinthRaw6.equiv (rawMul a₁ b₁) = Quot.mk NinthRaw6.equiv (rawMul a₂ b₂) := by
  apply Quot.sound
  rw [ninthRaw6_equiv_iff] at ha hb ⊢
  change Ninth.ofInt (pow6 (a₂.exp + b₂.exp)) * (a₁.num * b₁.num) =
    Ninth.ofInt (pow6 (a₁.exp + b₁.exp)) * (a₂.num * b₂.num)
  simp only [pow6_add, ninth_ofInt_mul]
  calc Ninth.ofInt (pow6 a₂.exp) * Ninth.ofInt (pow6 b₂.exp) * (a₁.num * b₁.num)
      = (Ninth.ofInt (pow6 a₂.exp) * a₁.num) * (Ninth.ofInt (pow6 b₂.exp) * b₁.num) := by ring
    _ = (Ninth.ofInt (pow6 a₁.exp) * a₂.num) * (Ninth.ofInt (pow6 b₁.exp) * b₂.num) := by rw [ha, hb]
    _ = Ninth.ofInt (pow6 a₁.exp) * Ninth.ofInt (pow6 b₁.exp) * (a₂.num * b₂.num) := by ring

-- [helper]
theorem rawConj_resp (a₁ a₂ : NinthRaw6) (ha : NinthRaw6.equiv a₁ a₂) :
    Quot.mk NinthRaw6.equiv (rawConj a₁) = Quot.mk NinthRaw6.equiv (rawConj a₂) := by
  apply Quot.sound
  rw [ninthRaw6_equiv_iff] at ha ⊢
  change Ninth.ofInt (pow6 a₂.exp) * star a₁.num = Ninth.ofInt (pow6 a₁.exp) * star a₂.num
  have h := congrArg star ha
  simp only [star_mul, ninth_conj_ofInt] at h
  simpa only [_root_.mul_comm] using h

def add : NinthLoc6 → NinthLoc6 → NinthLoc6 :=
  Quot.lift
    (fun a => Quot.lift (fun b => Quot.mk NinthRaw6.equiv (rawAdd a b)) (fun _ _ hb => rawAdd_resp a a _ _ rfl hb))
    (fun a₁ a₂ ha => funext fun q =>
      Quot.ind (β := fun q =>
        Quot.lift (fun b => Quot.mk NinthRaw6.equiv (rawAdd a₁ b)) (fun _ _ hb => rawAdd_resp a₁ a₁ _ _ rfl hb) q =
        Quot.lift (fun b => Quot.mk NinthRaw6.equiv (rawAdd a₂ b)) (fun _ _ hb => rawAdd_resp a₂ a₂ _ _ rfl hb) q)
        (fun b => rawAdd_resp a₁ a₂ b b ha rfl) q)

def neg : NinthLoc6 → NinthLoc6 :=
  Quot.lift (fun x => Quot.mk NinthRaw6.equiv (rawNeg x)) rawNeg_resp

def sub (x y : NinthLoc6) : NinthLoc6 := add x (neg y)

def mul : NinthLoc6 → NinthLoc6 → NinthLoc6 :=
  Quot.lift
    (fun a => Quot.lift (fun b => Quot.mk NinthRaw6.equiv (rawMul a b)) (fun _ _ hb => rawMul_resp a a _ _ rfl hb))
    (fun a₁ a₂ ha => funext fun q =>
      Quot.ind (β := fun q =>
        Quot.lift (fun b => Quot.mk NinthRaw6.equiv (rawMul a₁ b)) (fun _ _ hb => rawMul_resp a₁ a₁ _ _ rfl hb) q =
        Quot.lift (fun b => Quot.mk NinthRaw6.equiv (rawMul a₂ b)) (fun _ _ hb => rawMul_resp a₂ a₂ _ _ rfl hb) q)
        (fun b => rawMul_resp a₁ a₂ b b ha rfl) q)

def conj : NinthLoc6 → NinthLoc6 :=
  Quot.lift (fun x => Quot.mk NinthRaw6.equiv (rawConj x)) rawConj_resp

-- [helper]
theorem add_zero (x : NinthLoc6) : add x zero = x := by
  induction x using Quot.ind with
  | _ a =>
    apply Quot.sound
    rw [ninthRaw6_equiv_iff]
    change Ninth.ofInt (pow6 a.exp) * (Ninth.scale (pow6 0) a.num + Ninth.scale (pow6 a.exp) 0) =
      Ninth.ofInt (pow6 (a.exp + 0)) * a.num
    simp only [ninth_scale_eq_mul, pow6, Nat.add_zero]
    change Ninth.ofInt (pow6 a.exp) * (1 * a.num + Ninth.ofInt (pow6 a.exp) * 0) =
      Ninth.ofInt (pow6 a.exp) * a.num
    ring

-- [helper]
theorem zero_add (x : NinthLoc6) : add zero x = x := by
  induction x using Quot.ind with
  | _ a =>
    apply Quot.sound
    rw [ninthRaw6_equiv_iff]
    change Ninth.ofInt (pow6 a.exp) * (Ninth.scale (pow6 a.exp) 0 + Ninth.scale (pow6 0) a.num) =
      Ninth.ofInt (pow6 (0 + a.exp)) * a.num
    simp only [ninth_scale_eq_mul, pow6, Nat.zero_add]
    change Ninth.ofInt (pow6 a.exp) * (Ninth.ofInt (pow6 a.exp) * 0 + 1 * a.num) =
      Ninth.ofInt (pow6 a.exp) * a.num
    ring

-- [helper]
theorem add_comm (x y : NinthLoc6) : add x y = add y x := by
  induction x using Quot.ind with
  | _ a =>
    induction y using Quot.ind with
    | _ b =>
      apply Quot.sound
      rw [ninthRaw6_equiv_iff]
      change Ninth.ofInt (pow6 (b.exp + a.exp)) *
          (Ninth.scale (pow6 b.exp) a.num + Ninth.scale (pow6 a.exp) b.num) =
        Ninth.ofInt (pow6 (a.exp + b.exp)) *
          (Ninth.scale (pow6 a.exp) b.num + Ninth.scale (pow6 b.exp) a.num)
      simp only [ninth_scale_eq_mul, pow6_add, ninth_ofInt_mul]
      ring

-- [helper]
theorem add_assoc (x y z : NinthLoc6) : add (add x y) z = add x (add y z) := by
  induction x using Quot.ind with
  | _ a =>
    induction y using Quot.ind with
    | _ b =>
      induction z using Quot.ind with
      | _ c =>
        apply Quot.sound
        rw [ninthRaw6_equiv_iff]
        change Ninth.ofInt (pow6 (a.exp + (b.exp + c.exp))) *
            (Ninth.scale (pow6 c.exp) (Ninth.scale (pow6 b.exp) a.num + Ninth.scale (pow6 a.exp) b.num) +
              Ninth.scale (pow6 (a.exp + b.exp)) c.num) =
          Ninth.ofInt (pow6 (a.exp + b.exp + c.exp)) *
            (Ninth.scale (pow6 (b.exp + c.exp)) a.num +
              Ninth.scale (pow6 a.exp) (Ninth.scale (pow6 c.exp) b.num + Ninth.scale (pow6 b.exp) c.num))
        simp only [ninth_scale_eq_mul, pow6_add, ninth_ofInt_mul]
        ring

private theorem add_neg (x : NinthLoc6) : add x (neg x) = zero := by
  induction x using Quot.ind with
  | _ a =>
    apply Quot.sound
    rw [ninthRaw6_equiv_iff]
    change Ninth.ofInt (pow6 0) *
        (Ninth.scale (pow6 a.exp) a.num + Ninth.scale (pow6 a.exp) (-a.num)) =
      Ninth.ofInt (pow6 (a.exp + a.exp)) * 0
    simp only [ninth_scale_eq_mul]
    ring

-- [helper]
theorem mul_one (x : NinthLoc6) : mul x one = x := by
  induction x using Quot.ind with
  | _ a =>
    apply Quot.sound
    rw [ninthRaw6_equiv_iff]
    change Ninth.ofInt (pow6 a.exp) * (a.num * 1) = Ninth.ofInt (pow6 (a.exp + 0)) * a.num
    simp only [Nat.add_zero]
    ring

-- [helper]
theorem one_mul (x : NinthLoc6) : mul one x = x := by
  induction x using Quot.ind with
  | _ a =>
    apply Quot.sound
    rw [ninthRaw6_equiv_iff]
    change Ninth.ofInt (pow6 a.exp) * (1 * a.num) = Ninth.ofInt (pow6 (0 + a.exp)) * a.num
    simp only [Nat.zero_add]
    ring

-- [helper]
theorem mul_zero (x : NinthLoc6) : mul x zero = zero := by
  induction x using Quot.ind with
  | _ a =>
    apply Quot.sound
    rw [ninthRaw6_equiv_iff]
    change Ninth.ofInt (pow6 0) * (a.num * 0) = Ninth.ofInt (pow6 (a.exp + 0)) * 0
    ring

private theorem zero_mul (x : NinthLoc6) : mul zero x = zero := by
  induction x using Quot.ind with
  | _ a =>
    apply Quot.sound
    rw [ninthRaw6_equiv_iff]
    change Ninth.ofInt (pow6 0) * (0 * a.num) = Ninth.ofInt (pow6 (0 + a.exp)) * 0
    ring

-- [helper]
theorem mul_comm (x y : NinthLoc6) : mul x y = mul y x := by
  induction x using Quot.ind with
  | _ a =>
    induction y using Quot.ind with
    | _ b =>
      apply Quot.sound
      rw [ninthRaw6_equiv_iff]
      change Ninth.ofInt (pow6 (b.exp + a.exp)) * (a.num * b.num) =
        Ninth.ofInt (pow6 (a.exp + b.exp)) * (b.num * a.num)
      simp only [pow6_add, ninth_ofInt_mul]
      ring

-- [helper]
theorem mul_assoc (x y z : NinthLoc6) : mul (mul x y) z = mul x (mul y z) := by
  induction x using Quot.ind with
  | _ a =>
    induction y using Quot.ind with
    | _ b =>
      induction z using Quot.ind with
      | _ c =>
        apply Quot.sound
        rw [ninthRaw6_equiv_iff]
        change Ninth.ofInt (pow6 (a.exp + (b.exp + c.exp))) * (a.num * b.num * c.num) =
          Ninth.ofInt (pow6 (a.exp + b.exp + c.exp)) * (a.num * (b.num * c.num))
        simp only [pow6_add, ninth_ofInt_mul]
        ring

-- [helper]
theorem mul_add (x y z : NinthLoc6) : mul x (add y z) = add (mul x y) (mul x z) := by
  induction x using Quot.ind with
  | _ a =>
    induction y using Quot.ind with
    | _ b =>
      induction z using Quot.ind with
      | _ c =>
        apply Quot.sound
        rw [ninthRaw6_equiv_iff]
        change Ninth.ofInt (pow6 (a.exp + b.exp + (a.exp + c.exp))) *
            (a.num * (Ninth.scale (pow6 c.exp) b.num + Ninth.scale (pow6 b.exp) c.num)) =
          Ninth.ofInt (pow6 (a.exp + (b.exp + c.exp))) *
            (Ninth.scale (pow6 (a.exp + c.exp)) (a.num * b.num) +
              Ninth.scale (pow6 (a.exp + b.exp)) (a.num * c.num))
        simp only [ninth_scale_eq_mul, pow6_add, ninth_ofInt_mul]
        ring

private theorem add_mul (x y z : NinthLoc6) : mul (add x y) z = add (mul x z) (mul y z) := by
  rw [mul_comm, mul_add, mul_comm z x, mul_comm z y]

-- [helper]
theorem conj_conj (x : NinthLoc6) : conj (conj x) = x := by
  induction x using Quot.ind with
  | _ a =>
    apply Quot.sound
    rw [ninthRaw6_equiv_iff]
    change Ninth.ofInt (pow6 a.exp) * star (star a.num) = Ninth.ofInt (pow6 a.exp) * a.num
    rw [star_star]

-- [helper]
theorem conj_add (x y : NinthLoc6) : conj (add x y) = add (conj x) (conj y) := by
  induction x using Quot.ind with
  | _ a =>
    induction y using Quot.ind with
    | _ b =>
      apply Quot.sound
      rw [ninthRaw6_equiv_iff]
      change Ninth.ofInt (pow6 (a.exp + b.exp)) *
          star (Ninth.scale (pow6 b.exp) a.num + Ninth.scale (pow6 a.exp) b.num) =
        Ninth.ofInt (pow6 (a.exp + b.exp)) *
          (Ninth.scale (pow6 b.exp) (star a.num) + Ninth.scale (pow6 a.exp) (star b.num))
      simp only [ninth_scale_eq_mul, star_add, star_mul, ninth_conj_ofInt]
      ring

-- [helper]
theorem conj_mul (x y : NinthLoc6) : conj (mul x y) = mul (conj x) (conj y) := by
  induction x using Quot.ind with
  | _ a =>
    induction y using Quot.ind with
    | _ b =>
      apply Quot.sound
      rw [ninthRaw6_equiv_iff]
      change Ninth.ofInt (pow6 (a.exp + b.exp)) * star (a.num * b.num) =
        Ninth.ofInt (pow6 (a.exp + b.exp)) * (star a.num * star b.num)
      rw [star_mul, _root_.mul_comm (star b.num)]

-- [helper]
theorem conj_one : conj one = one := Quot.sound (by decide)

-- [helper]
theorem isZero_resp (a₁ a₂ : NinthRaw6) (ha : NinthRaw6.equiv a₁ a₂) :
    (a₁.num = Ninth.zero) = (a₂.num = Ninth.zero) := by
  apply propext
  constructor
  · intro h1
    unfold NinthRaw6.equiv at ha
    rw [h1, ninth_scale_eq_mul] at ha
    have h0 : Ninth.ofInt (pow6 a₂.exp) * (0 : Ninth) = Ninth.zero := by change _ * 0 = 0; ring
    rw [h0] at ha
    exact ninth_scale_pow6_zero a₁.exp a₂.num ha.symm
  · intro h2
    unfold NinthRaw6.equiv at ha
    rw [h2, ninth_scale_eq_mul] at ha
    have h0 : Ninth.ofInt (pow6 a₁.exp) * (0 : Ninth) = Ninth.zero := by change _ * 0 = 0; ring
    rw [h0] at ha
    exact ninth_scale_pow6_zero a₂.exp a₁.num ha

/-- Exact zero-test predicate lifted to `NinthLoc6` (certifies non-collapse of `ℤ[ζ_9][1/6]`). -/
def isZero : NinthLoc6 → Prop :=
  Quot.lift (fun a => a.num = Ninth.zero) isZero_resp

-- [helper]
theorem ne_of_raw_ne (x y : Ninth) (h : Ninth.sub x y ≠ Ninth.zero) :
    ofNinth x ≠ ofNinth y := by
  intro heq
  have hsub : sub (ofNinth x) (ofNinth y) = zero := by rw [heq]; exact add_neg (ofNinth y)
  have hz : isZero (sub (ofNinth x) (ofNinth y)) := by rw [hsub]; rfl
  change Ninth.add (Ninth.scale 1 x) (Ninth.scale 1 (Ninth.neg y)) = Ninth.zero at hz
  have hEqSub : Ninth.add (Ninth.scale 1 x) (Ninth.scale 1 (Ninth.neg y)) = Ninth.sub x y := by
    cases x; cases y; ext <;> dsimp [Ninth.add, Ninth.scale, Ninth.neg, Ninth.sub] <;> ring
  rw [hEqSub] at hz
  exact h hz

/-- Exact microscopic gate constants in `ℤ[ζ_9][1/6]`. -/
def omega : NinthLoc6 := ofNinth Ninth.omega
def zeta6 : NinthLoc6 := ofNinth ⟨1, 0, 0, 1, 0, 0⟩
def zeta18 : NinthLoc6 := ofNinth Ninth.zeta18
def coinDiag : NinthLoc6 := mul (ofNinth ⟨2, 0, 0, 1, 0, 0⟩) inv2
def coinOff : NinthLoc6 := mul (ofNinth ⟨0, 0, 0, -1, 0, 0⟩) inv2
def fullCoinDiag : NinthLoc6 := mul (ofNinth ⟨1, 0, 0, 1, 0, 0⟩) inv2
def fullCoinOff : NinthLoc6 := mul (ofNinth ⟨1, 0, 0, -1, 0, 0⟩) inv2
def meetKeep : NinthLoc6 := mul zeta6 inv2
def meetSwap : NinthLoc6 := mul (ofNinth ⟨-1, 0, 0, 1, 0, 0⟩) inv2
def pairHop : NinthLoc6 := mul (sub zeta18 one) inv12

/-- Exact `ℤ`-indexed sixth root of unity `ζ_6^n` in `ℤ[ζ_9][1/6]` (used by `Φ_odd`). -/
def zeta6Pow (n : Int) : NinthLoc6 :=
  match (n % 6).toNat with
  | 0 => one
  | 1 => zeta6
  | 2 => omega
  | 3 => neg one
  | 4 => neg zeta6
  | _ => neg omega

private theorem zeta6Pow_unit_and_neg (n : Int) :
    mul (conj (zeta6Pow n)) (zeta6Pow n) = one ∧ conj (zeta6Pow n) = zeta6Pow (-n) := by
  have hmod : n % 6 = 0 ∨ n % 6 = 1 ∨ n % 6 = 2 ∨ n % 6 = 3 ∨ n % 6 = 4 ∨ n % 6 = 5 := by omega
  rcases hmod with h | h | h | h | h | h <;>
    (have hneg : (-n) % 6 = (6 - n % 6) % 6 := by omega;
     rw [h] at hneg; unfold zeta6Pow; rw [h, hneg];
     exact ⟨Quot.sound (by decide), Quot.sound (by decide)⟩)

instance : Zero NinthLoc6 := ⟨zero⟩
instance : One NinthLoc6 := ⟨one⟩
instance : Add NinthLoc6 := ⟨add⟩
instance : Neg NinthLoc6 := ⟨neg⟩
instance : Sub NinthLoc6 := ⟨sub⟩
instance : Mul NinthLoc6 := ⟨mul⟩
instance : Star NinthLoc6 := ⟨conj⟩

instance : CommRing NinthLoc6 where
  add_assoc := add_assoc
  zero_add := zero_add
  add_zero := add_zero
  nsmul := nsmulRec
  zsmul := zsmulRec
  neg_add_cancel a := by change add (neg a) a = zero; rw [add_comm, add_neg]
  add_comm := add_comm
  sub_eq_add_neg _ _ := rfl
  left_distrib := mul_add
  right_distrib := add_mul
  zero_mul := zero_mul
  mul_zero := mul_zero
  mul_assoc := mul_assoc
  one_mul := one_mul
  mul_one := mul_one
  mul_comm := mul_comm
  npow := npowRec

instance : StarRing NinthLoc6 where
  star_involutive := conj_conj
  star_mul a b := by change conj (mul a b) = mul (conj b) (conj a); rw [conj_mul, mul_comm]
  star_add := conj_add

end NinthLoc6

instance : StarCommRing NinthLoc6 where
  zero := NinthLoc6.zero
  one := NinthLoc6.one
  add := NinthLoc6.add
  neg := NinthLoc6.neg
  mul := NinthLoc6.mul
  conj := NinthLoc6.conj
  add_zero := NinthLoc6.add_zero
  zero_add := NinthLoc6.zero_add
  add_comm := NinthLoc6.add_comm
  add_assoc := NinthLoc6.add_assoc
  add_neg := fun a => by change a + -a = 0; ring
  mul_one := NinthLoc6.mul_one
  one_mul := NinthLoc6.one_mul
  mul_zero := NinthLoc6.mul_zero
  zero_mul := fun a => by change 0 * a = 0; ring
  mul_comm := NinthLoc6.mul_comm
  mul_assoc := NinthLoc6.mul_assoc
  mul_add := NinthLoc6.mul_add
  add_mul := fun a b c => by change (a + b) * c = a * c + b * c; ring
  conj_conj := NinthLoc6.conj_conj
  conj_add := NinthLoc6.conj_add
  conj_mul := NinthLoc6.conj_mul
  conj_one := NinthLoc6.conj_one

/-- Headline Theorem 1 (Exact `ℤ[ζ_9][1/6]` Star-Ring & Microscopic Gate-Unitarity Certificate):
    certifies inside `NinthLoc6 = ℤ[ζ_9][1/6]` that `2, 3, 12` are self-adjoint units,
    `ζ_6, ω, ζ_18, ζ_6^n` are exact norm-1 units (`conj(ζ_6^n) = ζ_6^{-n}`),
    half-coin `D = C_{1/2}` is exact unitary with `D^2 = C`, `M_meet` is exact unitary,
    and `M_pair(ζ_18)` obeys its exact `12 × 12` unitarity identity with zero floating-point error. -/
theorem thm_fock_ring_and_gate_identities :
    (NinthLoc6.mul (StarCommRing.ofNatR 2) NinthLoc6.inv2 = NinthLoc6.one) ∧
    (NinthLoc6.mul (StarCommRing.ofNatR 3) NinthLoc6.inv3 = NinthLoc6.one) ∧
    (NinthLoc6.mul (StarCommRing.ofNatR 12) NinthLoc6.inv12 = NinthLoc6.one) ∧
    (NinthLoc6.conj NinthLoc6.inv12 = NinthLoc6.inv12) ∧
    (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.zeta6) NinthLoc6.zeta6 = NinthLoc6.one) ∧
    (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.omega) NinthLoc6.omega = NinthLoc6.one) ∧
    (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.zeta18) NinthLoc6.zeta18 = NinthLoc6.one) ∧
    (∀ n : Int,
      NinthLoc6.mul (NinthLoc6.conj (NinthLoc6.zeta6Pow n)) (NinthLoc6.zeta6Pow n) = NinthLoc6.one ∧
      NinthLoc6.conj (NinthLoc6.zeta6Pow n) = NinthLoc6.zeta6Pow (-n)) ∧
    (NinthLoc6.add (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinDiag) NinthLoc6.coinDiag)
                   (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinOff) NinthLoc6.coinOff) = NinthLoc6.one) ∧
    (NinthLoc6.add (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinDiag) NinthLoc6.coinOff)
                   (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinOff) NinthLoc6.coinDiag) = NinthLoc6.zero) ∧
    (NinthLoc6.add (NinthLoc6.mul NinthLoc6.coinDiag NinthLoc6.coinDiag)
                   (NinthLoc6.mul NinthLoc6.coinOff NinthLoc6.coinOff) = NinthLoc6.fullCoinDiag) ∧
    (NinthLoc6.add (NinthLoc6.mul NinthLoc6.coinDiag NinthLoc6.coinOff)
                   (NinthLoc6.mul NinthLoc6.coinOff NinthLoc6.coinDiag) = NinthLoc6.fullCoinOff) ∧
    (NinthLoc6.add (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.meetKeep) NinthLoc6.meetKeep)
                   (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.meetSwap) NinthLoc6.meetSwap) = NinthLoc6.one) ∧
    (NinthLoc6.add (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.meetKeep) NinthLoc6.meetSwap)
                   (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.meetSwap) NinthLoc6.meetKeep) = NinthLoc6.zero) ∧
    (NinthLoc6.add
      (NinthLoc6.add (NinthLoc6.mul NinthLoc6.pairHop NinthLoc6.inv12)
                     (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.pairHop) NinthLoc6.inv12))
      (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.pairHop) NinthLoc6.pairHop) = NinthLoc6.zero) := by
  exact ⟨Quot.sound (by decide), Quot.sound (by decide), Quot.sound (by decide),
    Quot.sound (by decide), Quot.sound (by decide), Quot.sound (by decide),
    Quot.sound (by decide), NinthLoc6.zeta6Pow_unit_and_neg,
    Quot.sound (by decide), Quot.sound (by decide), Quot.sound (by decide),
    Quot.sound (by decide), Quot.sound (by decide), Quot.sound (by decide),
    Quot.sound (by decide)⟩

end Vibe

end
