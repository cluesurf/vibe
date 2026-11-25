import Vibe.Algebra

/-!
# Vibe Theory: Exact `ℤ[ζ_9][1/6]` Fock Ring & Gate-Coefficient Algebra

Submodule 1 of 4 of `Vibe.FockBeat` (re-exported unchanged by `Vibe.FockBeat`):
- Full `StarCommRing Ninth` star-commutative ring laws for `ℤ[ζ_9]`,
- Exact dyadic-triadic localization `NinthLoc6 = ℤ[ζ_9][1/6]` with `StarCommRing NinthLoc6`,
- Exact algebraic unitarity and `D^2 = C` certificates for every microscopic gate coefficient
  (`D = C_{1/2}`, `K`, `M_pair(ζ_18)`, `M_meet`, and `Φ_odd` powers `ζ_6^n`).
-/

set_option autoImplicit false

namespace Vibe

-- [helper]
theorem ite_bool_true {α : Type} (t e : α) : (if true = true then t else e) = t := rfl
-- [helper]
theorem ite_bool_false {α : Type} (t e : α) : (if false = true then t else e) = e := rfl

/-! ## Section 1: Exact `StarCommRing Ninth` & Localization `NinthLoc6 = ℤ[ζ_9][1/6]` -/

private def ninthBasis : Fin 6 → Ninth
  | ⟨0, _⟩ => ⟨1, 0, 0, 0, 0, 0⟩
  | ⟨1, _⟩ => ⟨0, 1, 0, 0, 0, 0⟩
  | ⟨2, _⟩ => ⟨0, 0, 1, 0, 0, 0⟩
  | ⟨3, _⟩ => ⟨0, 0, 0, 1, 0, 0⟩
  | ⟨4, _⟩ => ⟨0, 0, 0, 0, 1, 0⟩
  | ⟨5, _⟩ => ⟨0, 0, 0, 0, 0, 1⟩

private def ninthCoord (x : Ninth) : Fin 6 → Int
  | ⟨0, _⟩ => x.c0
  | ⟨1, _⟩ => x.c1
  | ⟨2, _⟩ => x.c2
  | ⟨3, _⟩ => x.c3
  | ⟨4, _⟩ => x.c4
  | ⟨5, _⟩ => x.c5

private def sum6Ninth (f : Fin 6 → Ninth) : Ninth :=
  Ninth.add
    (Ninth.add
      (Ninth.add
        (Ninth.add
          (Ninth.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩))
          (f ⟨2, by decide⟩))
        (f ⟨3, by decide⟩))
      (f ⟨4, by decide⟩))
    (f ⟨5, by decide⟩)

private theorem ninth_add_zero (x : Ninth) : Ninth.add x Ninth.zero = x := by
  cases x
  simp only [Ninth.add, Ninth.zero, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_zero_add (x : Ninth) : Ninth.add Ninth.zero x = x := by
  cases x
  simp only [Ninth.add, Ninth.zero, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_add_comm (x y : Ninth) : Ninth.add x y = Ninth.add y x := by
  cases x; cases y
  simp only [Ninth.add, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_add_assoc (x y z : Ninth) :
    Ninth.add (Ninth.add x y) z = Ninth.add x (Ninth.add y z) := by
  cases x; cases y; cases z
  simp only [Ninth.add, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_add_neg (x : Ninth) : Ninth.add x (Ninth.neg x) = Ninth.zero := by
  cases x
  simp only [Ninth.add, Ninth.neg, Ninth.zero, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_mul_one (x : Ninth) : Ninth.mul x Ninth.one = x := by
  cases x
  simp only [Ninth.mul, Ninth.one, Ninth.mk.injEq, Int.mul_one, Int.mul_zero]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_one_mul (x : Ninth) : Ninth.mul Ninth.one x = x := by
  cases x
  simp only [Ninth.mul, Ninth.one, Ninth.mk.injEq, Int.one_mul, Int.zero_mul]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_mul_zero (x : Ninth) : Ninth.mul x Ninth.zero = Ninth.zero := by
  cases x
  simp only [Ninth.mul, Ninth.zero, Ninth.mk.injEq, Int.mul_zero]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_zero_mul (x : Ninth) : Ninth.mul Ninth.zero x = Ninth.zero := by
  cases x
  simp only [Ninth.mul, Ninth.zero, Ninth.mk.injEq, Int.zero_mul]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_mul_add (x y z : Ninth) :
    Ninth.mul x (Ninth.add y z) = Ninth.add (Ninth.mul x y) (Ninth.mul x z) := by
  cases x; cases y; cases z
  simp only [Ninth.mul, Ninth.add, Ninth.mk.injEq, Int.mul_add]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_add_mul (x y z : Ninth) :
    Ninth.mul (Ninth.add x y) z = Ninth.add (Ninth.mul x z) (Ninth.mul y z) := by
  cases x; cases y; cases z
  simp only [Ninth.mul, Ninth.add, Ninth.mk.injEq, Int.add_mul]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_scale_one (x : Ninth) : Ninth.scale 1 x = x := by
  cases x
  simp only [Ninth.scale, Int.one_mul]

private theorem ninth_scale_zero (k : Int) : Ninth.scale k Ninth.zero = Ninth.zero := by
  simp only [Ninth.scale, Ninth.zero, Int.mul_zero]

private theorem ninth_scale_add (k : Int) (x y : Ninth) :
    Ninth.scale k (Ninth.add x y) = Ninth.add (Ninth.scale k x) (Ninth.scale k y) := by
  cases x; cases y
  simp only [Ninth.scale, Ninth.add, Int.mul_add]

private theorem ninth_scale_neg (k : Int) (x : Ninth) :
    Ninth.scale k (Ninth.neg x) = Ninth.neg (Ninth.scale k x) := by
  cases x
  simp only [Ninth.scale, Ninth.neg, Int.mul_neg]

private theorem ninth_scale_scale (k m : Int) (x : Ninth) :
    Ninth.scale k (Ninth.scale m x) = Ninth.scale (k * m) x := by
  cases x
  simp only [Ninth.scale, Int.mul_assoc]

private theorem ninth_mul_scale_left (k : Int) (x y : Ninth) :
    Ninth.mul (Ninth.scale k x) y = Ninth.scale k (Ninth.mul x y) := by
  cases x; cases y
  simp only [Ninth.mul, Ninth.scale, Int.mul_add, Int.mul_sub, Int.mul_assoc]

private theorem ninth_conj_conj (x : Ninth) : Ninth.conj (Ninth.conj x) = x := by
  cases x
  simp only [Ninth.conj, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_conj_add (x y : Ninth) :
    Ninth.conj (Ninth.add x y) = Ninth.add (Ninth.conj x) (Ninth.conj y) := by
  cases x; cases y
  simp only [Ninth.conj, Ninth.add, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_conj_scale (k : Int) (x : Ninth) :
    Ninth.conj (Ninth.scale k x) = Ninth.scale k (Ninth.conj x) := by
  cases x
  simp only [Ninth.conj, Ninth.scale, Int.mul_sub, Int.mul_neg]

private theorem ninth_conj_one : Ninth.conj Ninth.one = Ninth.one := by decide

private theorem ninth_basis_decomp (x : Ninth) :
    x = sum6Ninth (fun i => Ninth.scale (ninthCoord x i) (ninthBasis i)) := by
  cases x
  simp only [sum6Ninth, ninthCoord, ninthBasis, Ninth.scale, Ninth.add, Ninth.mk.injEq,
    Int.mul_one, Int.mul_zero]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_mul_sum6_left (f : Fin 6 → Ninth) (y : Ninth) :
    Ninth.mul (sum6Ninth f) y = sum6Ninth (fun i => Ninth.mul (f i) y) := by
  unfold sum6Ninth
  rw [ninth_add_mul, ninth_add_mul, ninth_add_mul, ninth_add_mul, ninth_add_mul]

private theorem ninth_mul_sum6_right (x : Ninth) (g : Fin 6 → Ninth) :
    Ninth.mul x (sum6Ninth g) = sum6Ninth (fun j => Ninth.mul x (g j)) := by
  unfold sum6Ninth
  rw [ninth_mul_add, ninth_mul_add, ninth_mul_add, ninth_mul_add, ninth_mul_add]

private theorem ninth_scale_sum6 (k : Int) (f : Fin 6 → Ninth) :
    Ninth.scale k (sum6Ninth f) = sum6Ninth (fun i => Ninth.scale k (f i)) := by
  unfold sum6Ninth
  rw [ninth_scale_add, ninth_scale_add, ninth_scale_add, ninth_scale_add, ninth_scale_add]

private theorem ninth_conj_sum6 (f : Fin 6 → Ninth) :
    Ninth.conj (sum6Ninth f) = sum6Ninth (fun i => Ninth.conj (f i)) := by
  unfold sum6Ninth
  rw [ninth_conj_add, ninth_conj_add, ninth_conj_add, ninth_conj_add, ninth_conj_add]

private theorem ninth_sum6_swap (f : Fin 6 → Fin 6 → Ninth) :
    sum6Ninth (fun i => sum6Ninth (fun j => f i j)) =
      sum6Ninth (fun j => sum6Ninth (fun i => f i j)) := by
  have sum6_add_aux : ∀ u0 u1 u2 u3 u4 u5 v0 v1 v2 v3 v4 v5 : Ninth,
      Ninth.add
        (Ninth.add
          (Ninth.add
            (Ninth.add
              (Ninth.add (Ninth.add u0 v0) (Ninth.add u1 v1))
              (Ninth.add u2 v2))
            (Ninth.add u3 v3))
          (Ninth.add u4 v4))
        (Ninth.add u5 v5) =
      Ninth.add
        (Ninth.add (Ninth.add (Ninth.add (Ninth.add (Ninth.add u0 u1) u2) u3) u4) u5)
        (Ninth.add (Ninth.add (Ninth.add (Ninth.add (Ninth.add v0 v1) v2) v3) v4) v5) := by
    intro u0 u1 u2 u3 u4 u5 v0 v1 v2 v3 v4 v5
    have swap4 : ∀ a b c d : Ninth,
        Ninth.add (Ninth.add a b) (Ninth.add c d) =
          Ninth.add (Ninth.add a c) (Ninth.add b d) := by
      intro a b c d
      rw [ninth_add_assoc a b (Ninth.add c d), ← ninth_add_assoc b c d, ninth_add_comm b c,
          ninth_add_assoc c b d, ← ninth_add_assoc a c (Ninth.add b d)]
    rw [swap4 u0 v0 u1 v1,
        swap4 (Ninth.add u0 u1) (Ninth.add v0 v1) u2 v2,
        swap4 (Ninth.add (Ninth.add u0 u1) u2) (Ninth.add (Ninth.add v0 v1) v2) u3 v3,
        swap4 (Ninth.add (Ninth.add (Ninth.add u0 u1) u2) u3)
              (Ninth.add (Ninth.add (Ninth.add v0 v1) v2) v3) u4 v4,
        swap4 (Ninth.add (Ninth.add (Ninth.add (Ninth.add u0 u1) u2) u3) u4)
              (Ninth.add (Ninth.add (Ninth.add (Ninth.add v0 v1) v2) v3) v4) u5 v5]
  have sum6_add : ∀ u v : Fin 6 → Ninth,
      sum6Ninth (fun k => Ninth.add (u k) (v k)) = Ninth.add (sum6Ninth u) (sum6Ninth v) :=
    fun u v => sum6_add_aux
      (u ⟨0, by decide⟩) (u ⟨1, by decide⟩) (u ⟨2, by decide⟩)
      (u ⟨3, by decide⟩) (u ⟨4, by decide⟩) (u ⟨5, by decide⟩)
      (v ⟨0, by decide⟩) (v ⟨1, by decide⟩) (v ⟨2, by decide⟩)
      (v ⟨3, by decide⟩) (v ⟨4, by decide⟩) (v ⟨5, by decide⟩)
  change sum6Ninth (fun i => sum6Ninth (fun j => f i j)) =
    Ninth.add (Ninth.add (Ninth.add (Ninth.add (Ninth.add
      (sum6Ninth (fun i => f i ⟨0, by decide⟩))
      (sum6Ninth (fun i => f i ⟨1, by decide⟩)))
      (sum6Ninth (fun i => f i ⟨2, by decide⟩)))
      (sum6Ninth (fun i => f i ⟨3, by decide⟩)))
      (sum6Ninth (fun i => f i ⟨4, by decide⟩)))
      (sum6Ninth (fun i => f i ⟨5, by decide⟩))
  rw [← sum6_add, ← sum6_add, ← sum6_add, ← sum6_add, ← sum6_add]
  rfl

private theorem ninth_mul_scale_right (k : Int) (x y : Ninth) :
    Ninth.mul x (Ninth.scale k y) = Ninth.scale k (Ninth.mul x y) := by
  cases x; cases y
  have hkm : ∀ a b : Int, a * (k * b) = k * (a * b) := fun a b => by
    rw [← Int.mul_assoc, Int.mul_comm a k, Int.mul_assoc]
  simp only [Ninth.mul, Ninth.scale, hkm, Int.mul_add, Int.mul_sub]

private theorem ninth_mul_expand (x y : Ninth) :
    Ninth.mul x y =
      sum6Ninth (fun i => sum6Ninth (fun j =>
        Ninth.scale (ninthCoord x i * ninthCoord y j)
          (Ninth.mul (ninthBasis i) (ninthBasis j)))) := by
  have hxy : Ninth.mul x y =
      Ninth.mul (sum6Ninth (fun i => Ninth.scale (ninthCoord x i) (ninthBasis i)))
                (sum6Ninth (fun j => Ninth.scale (ninthCoord y j) (ninthBasis j))) := by
    rw [← ninth_basis_decomp x, ← ninth_basis_decomp y]
  rw [hxy, ninth_mul_sum6_left]
  apply congrArg sum6Ninth; funext i
  rw [ninth_mul_sum6_right]
  apply congrArg sum6Ninth; funext j
  rw [ninth_mul_scale_left, ninth_mul_scale_right, ninth_scale_scale]

private theorem ninth_mul_comm (x y : Ninth) : Ninth.mul x y = Ninth.mul y x := by
  have hB : ∀ i j : Fin 6, Ninth.mul (ninthBasis i) (ninthBasis j) =
      Ninth.mul (ninthBasis j) (ninthBasis i) := by decide
  rw [ninth_mul_expand x y, ninth_mul_expand y x, ninth_sum6_swap]
  apply congrArg sum6Ninth; funext j
  apply congrArg sum6Ninth; funext i
  rw [Int.mul_comm (ninthCoord x i) (ninthCoord y j), hB i j]

private theorem ninth_mul_assoc (x y z : Ninth) :
    Ninth.mul (Ninth.mul x y) z = Ninth.mul x (Ninth.mul y z) := by
  have hB : ∀ i j k : Fin 6,
      Ninth.mul (Ninth.mul (ninthBasis i) (ninthBasis j)) (ninthBasis k) =
        Ninth.mul (ninthBasis i) (Ninth.mul (ninthBasis j) (ninthBasis k)) := by decide
  have hL : Ninth.mul (Ninth.mul x y) z =
      sum6Ninth (fun i => sum6Ninth (fun j => sum6Ninth (fun k =>
        Ninth.scale ((ninthCoord x i * ninthCoord y j) * ninthCoord z k)
          (Ninth.mul (Ninth.mul (ninthBasis i) (ninthBasis j)) (ninthBasis k))))) := by
    have hxyz : Ninth.mul (Ninth.mul x y) z =
        Ninth.mul (Ninth.mul (sum6Ninth (fun i => Ninth.scale (ninthCoord x i) (ninthBasis i)))
                             (sum6Ninth (fun j => Ninth.scale (ninthCoord y j) (ninthBasis j))))
                  (sum6Ninth (fun k => Ninth.scale (ninthCoord z k) (ninthBasis k))) := by
      rw [← ninth_basis_decomp x, ← ninth_basis_decomp y, ← ninth_basis_decomp z]
    rw [hxyz, ninth_mul_sum6_left (fun i => Ninth.scale (ninthCoord x i) (ninthBasis i)),
        ninth_mul_sum6_left]
    apply congrArg sum6Ninth; funext i
    rw [ninth_mul_sum6_right (Ninth.scale (ninthCoord x i) (ninthBasis i)),
        ninth_mul_sum6_left]
    apply congrArg sum6Ninth; funext j
    rw [ninth_mul_sum6_right]
    apply congrArg sum6Ninth; funext k
    rw [ninth_mul_scale_left (ninthCoord x i), ninth_mul_scale_right (ninthCoord y j),
        ninth_scale_scale, ninth_mul_scale_left (ninthCoord x i * ninthCoord y j),
        ninth_mul_scale_right (ninthCoord z k), ninth_scale_scale]
  have hR : Ninth.mul x (Ninth.mul y z) =
      sum6Ninth (fun i => sum6Ninth (fun j => sum6Ninth (fun k =>
        Ninth.scale (ninthCoord x i * (ninthCoord y j * ninthCoord z k))
          (Ninth.mul (ninthBasis i) (Ninth.mul (ninthBasis j) (ninthBasis k)))))) := by
    have hxyz : Ninth.mul x (Ninth.mul y z) =
        Ninth.mul (sum6Ninth (fun i => Ninth.scale (ninthCoord x i) (ninthBasis i)))
                  (Ninth.mul (sum6Ninth (fun j => Ninth.scale (ninthCoord y j) (ninthBasis j)))
                             (sum6Ninth (fun k => Ninth.scale (ninthCoord z k) (ninthBasis k)))) := by
      rw [← ninth_basis_decomp x, ← ninth_basis_decomp y, ← ninth_basis_decomp z]
    rw [hxyz, ninth_mul_sum6_left]
    apply congrArg sum6Ninth; funext i
    rw [ninth_mul_sum6_left, ninth_mul_sum6_right]
    apply congrArg sum6Ninth; funext j
    rw [ninth_mul_sum6_right (Ninth.scale (ninthCoord y j) (ninthBasis j)),
        ninth_mul_sum6_right]
    apply congrArg sum6Ninth; funext k
    rw [ninth_mul_scale_left (ninthCoord y j), ninth_mul_scale_right (ninthCoord z k),
        ninth_scale_scale, ninth_mul_scale_left (ninthCoord x i),
        ninth_mul_scale_right (ninthCoord y j * ninthCoord z k), ninth_scale_scale]
  rw [hL, hR]
  apply congrArg sum6Ninth; funext i
  apply congrArg sum6Ninth; funext j
  apply congrArg sum6Ninth; funext k
  rw [Int.mul_assoc, hB i j k]

private theorem ninth_conj_mul (x y : Ninth) :
    Ninth.conj (Ninth.mul x y) = Ninth.mul (Ninth.conj x) (Ninth.conj y) := by
  have hB : ∀ i j : Fin 6,
      Ninth.conj (Ninth.mul (ninthBasis i) (ninthBasis j)) =
        Ninth.mul (Ninth.conj (ninthBasis i)) (Ninth.conj (ninthBasis j)) := by decide
  have hL : Ninth.conj (Ninth.mul x y) =
      sum6Ninth (fun i => sum6Ninth (fun j =>
        Ninth.scale (ninthCoord x i * ninthCoord y j)
          (Ninth.conj (Ninth.mul (ninthBasis i) (ninthBasis j))))) := by
    rw [ninth_mul_expand x y, ninth_conj_sum6]
    apply congrArg sum6Ninth; funext i
    rw [ninth_conj_sum6]
    apply congrArg sum6Ninth; funext j
    rw [ninth_conj_scale]
  have hR : Ninth.mul (Ninth.conj x) (Ninth.conj y) =
      sum6Ninth (fun i => sum6Ninth (fun j =>
        Ninth.scale (ninthCoord x i * ninthCoord y j)
          (Ninth.mul (Ninth.conj (ninthBasis i)) (Ninth.conj (ninthBasis j))))) := by
    have hxy : Ninth.mul (Ninth.conj x) (Ninth.conj y) =
        Ninth.mul (Ninth.conj (sum6Ninth (fun i => Ninth.scale (ninthCoord x i) (ninthBasis i))))
                  (Ninth.conj (sum6Ninth (fun j => Ninth.scale (ninthCoord y j) (ninthBasis j)))) := by
      rw [← ninth_basis_decomp x, ← ninth_basis_decomp y]
    rw [hxy, ninth_conj_sum6, ninth_conj_sum6, ninth_mul_sum6_left]
    apply congrArg sum6Ninth; funext i
    rw [ninth_mul_sum6_right]
    apply congrArg sum6Ninth; funext j
    rw [ninth_conj_scale, ninth_conj_scale, ninth_mul_scale_left, ninth_mul_scale_right,
        ninth_scale_scale]
  rw [hL, hR]
  apply congrArg sum6Ninth; funext i
  apply congrArg sum6Ninth; funext j
  rw [hB i j]

instance : StarCommRing Ninth where
  zero := Ninth.zero
  one := Ninth.one
  add := Ninth.add
  neg := Ninth.neg
  mul := Ninth.mul
  conj := Ninth.conj
  add_zero := ninth_add_zero
  zero_add := ninth_zero_add
  add_comm := ninth_add_comm
  add_assoc := ninth_add_assoc
  add_neg := ninth_add_neg
  mul_one := ninth_mul_one
  one_mul := ninth_one_mul
  mul_zero := ninth_mul_zero
  zero_mul := ninth_zero_mul
  mul_comm := ninth_mul_comm
  mul_assoc := ninth_mul_assoc
  mul_add := ninth_mul_add
  add_mul := ninth_add_mul
  conj_conj := ninth_conj_conj
  conj_add := ninth_conj_add
  conj_mul := ninth_conj_mul
  conj_one := ninth_conj_one

/-- Exact integer powers of `6`: `pow6 n = 6^n`. -/
def pow6 : Nat → Int
  | 0 => 1
  | n + 1 => 6 * pow6 n

private theorem pow6_add (a b : Nat) : pow6 (a + b) = pow6 a * pow6 b := by
  induction a with
  | zero =>
    simp only [Nat.zero_add, pow6, Int.one_mul]
  | succ k ih =>
    have h1 : (k + 1) + b = (k + b) + 1 := by omega
    rw [h1]
    simp only [pow6]
    rw [ih, Int.mul_assoc]

private theorem pow6_cancel_zero (k : Nat) (z : Int) (h : pow6 k * z = 0) : z = 0 := by
  induction k with
  | zero =>
    simp only [pow6, Int.one_mul] at h
    exact h
  | succ m ih =>
    simp only [pow6] at h
    rw [Int.mul_assoc] at h
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

private theorem ninthRaw6_equiv_refl (x : NinthRaw6) : NinthRaw6.equiv x x := rfl

private theorem quot_ind_prop {α : Type} {r : α → α → Prop} {P : Quot r → Prop}
    (h : ∀ a, P (Quot.mk r a)) (q : Quot r) : P q :=
  Quot.ind h q

private def quotLift2 {α γ : Type} {r : α → α → Prop}
    (hrRefl : ∀ a, r a a)
    (f : α → α → γ)
    (hf : ∀ a₁ a₂ b₁ b₂, r a₁ a₂ → r b₁ b₂ → f a₁ b₁ = f a₂ b₂) :
    Quot r → Quot r → γ :=
  Quot.lift
    (fun a => Quot.lift (fun b => f a b) (fun b₁ b₂ hb => hf a a b₁ b₂ (hrRefl a) hb))
    (fun a₁ a₂ ha =>
      funext (fun q =>
        quot_ind_prop (P := fun q =>
          Quot.lift (fun b => f a₁ b) (fun b₁ b₂ hb => hf a₁ a₁ b₁ b₂ (hrRefl a₁) hb) q =
          Quot.lift (fun b => f a₂ b) (fun b₁ b₂ hb => hf a₂ a₂ b₁ b₂ (hrRefl a₂) hb) q)
          (fun b => hf a₁ a₂ b b ha (hrRefl b)) q))

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

private theorem rawAdd_resp (a₁ a₂ b₁ b₂ : NinthRaw6)
    (ha : NinthRaw6.equiv a₁ a₂) (hb : NinthRaw6.equiv b₁ b₂) :
    Quot.mk NinthRaw6.equiv (rawAdd a₁ b₁) = Quot.mk NinthRaw6.equiv (rawAdd a₂ b₂) := by
  apply Quot.sound
  unfold NinthRaw6.equiv at ha hb ⊢
  unfold rawAdd
  dsimp only
  rw [ninth_scale_add, ninth_scale_add, ninth_scale_scale, ninth_scale_scale,
      ninth_scale_scale, ninth_scale_scale, pow6_add, pow6_add]
  have h1 : Ninth.scale (pow6 a₂.exp * pow6 b₂.exp * pow6 b₁.exp) a₁.num =
      Ninth.scale (pow6 a₁.exp * pow6 b₁.exp * pow6 b₂.exp) a₂.num := by
    have hs1 : pow6 a₂.exp * pow6 b₂.exp * pow6 b₁.exp =
        (pow6 b₁.exp * pow6 b₂.exp) * pow6 a₂.exp := by
      rw [Int.mul_assoc, Int.mul_comm (pow6 b₂.exp) (pow6 b₁.exp),
          Int.mul_comm (pow6 a₂.exp) (pow6 b₁.exp * pow6 b₂.exp)]
    have hs2 : pow6 a₁.exp * pow6 b₁.exp * pow6 b₂.exp =
        (pow6 b₁.exp * pow6 b₂.exp) * pow6 a₁.exp := by
      rw [Int.mul_assoc, Int.mul_comm (pow6 a₁.exp) (pow6 b₁.exp * pow6 b₂.exp)]
    rw [hs1, hs2, ← ninth_scale_scale (pow6 b₁.exp * pow6 b₂.exp),
        ← ninth_scale_scale (pow6 b₁.exp * pow6 b₂.exp), ha]
  have h2 : Ninth.scale (pow6 a₂.exp * pow6 b₂.exp * pow6 a₁.exp) b₁.num =
      Ninth.scale (pow6 a₁.exp * pow6 b₁.exp * pow6 a₂.exp) b₂.num := by
    have hs1 : pow6 a₂.exp * pow6 b₂.exp * pow6 a₁.exp =
        (pow6 a₁.exp * pow6 a₂.exp) * pow6 b₂.exp := by
      rw [Int.mul_comm (pow6 a₂.exp) (pow6 b₂.exp), Int.mul_assoc,
          Int.mul_comm (pow6 a₂.exp) (pow6 a₁.exp),
          Int.mul_comm (pow6 b₂.exp) (pow6 a₁.exp * pow6 a₂.exp)]
    have hs2 : pow6 a₁.exp * pow6 b₁.exp * pow6 a₂.exp =
        (pow6 a₁.exp * pow6 a₂.exp) * pow6 b₁.exp := by
      rw [Int.mul_comm (pow6 a₁.exp) (pow6 b₁.exp), Int.mul_assoc,
          Int.mul_comm (pow6 b₁.exp) (pow6 a₁.exp * pow6 a₂.exp)]
    rw [hs1, hs2, ← ninth_scale_scale (pow6 a₁.exp * pow6 a₂.exp),
        ← ninth_scale_scale (pow6 a₁.exp * pow6 a₂.exp), hb]
  rw [h1, h2]

private theorem rawNeg_resp (a₁ a₂ : NinthRaw6) (ha : NinthRaw6.equiv a₁ a₂) :
    Quot.mk NinthRaw6.equiv (rawNeg a₁) = Quot.mk NinthRaw6.equiv (rawNeg a₂) := by
  apply Quot.sound
  unfold NinthRaw6.equiv at ha ⊢
  unfold rawNeg
  dsimp only
  rw [ninth_scale_neg, ninth_scale_neg, ha]

private theorem rawMul_resp (a₁ a₂ b₁ b₂ : NinthRaw6)
    (ha : NinthRaw6.equiv a₁ a₂) (hb : NinthRaw6.equiv b₁ b₂) :
    Quot.mk NinthRaw6.equiv (rawMul a₁ b₁) = Quot.mk NinthRaw6.equiv (rawMul a₂ b₂) := by
  apply Quot.sound
  unfold NinthRaw6.equiv at ha hb ⊢
  unfold rawMul
  dsimp only
  rw [pow6_add, pow6_add,
      ← ninth_scale_scale (pow6 a₂.exp) (pow6 b₂.exp),
      ← ninth_scale_scale (pow6 a₁.exp) (pow6 b₁.exp),
      ← ninth_mul_scale_right (pow6 b₂.exp),
      ← ninth_mul_scale_left (pow6 a₂.exp),
      ha, hb,
      ninth_mul_scale_left (pow6 a₁.exp),
      ninth_mul_scale_right (pow6 b₁.exp)]

private theorem rawConj_resp (a₁ a₂ : NinthRaw6) (ha : NinthRaw6.equiv a₁ a₂) :
    Quot.mk NinthRaw6.equiv (rawConj a₁) = Quot.mk NinthRaw6.equiv (rawConj a₂) := by
  apply Quot.sound
  unfold NinthRaw6.equiv at ha ⊢
  unfold rawConj
  dsimp only
  rw [← ninth_conj_scale, ← ninth_conj_scale, ha]

def add : NinthLoc6 → NinthLoc6 → NinthLoc6 :=
  quotLift2 ninthRaw6_equiv_refl (fun x y => Quot.mk NinthRaw6.equiv (rawAdd x y)) rawAdd_resp

def neg : NinthLoc6 → NinthLoc6 :=
  Quot.lift (fun x => Quot.mk NinthRaw6.equiv (rawNeg x)) rawNeg_resp

def sub (x y : NinthLoc6) : NinthLoc6 := add x (neg y)

def mul : NinthLoc6 → NinthLoc6 → NinthLoc6 :=
  quotLift2 ninthRaw6_equiv_refl (fun x y => Quot.mk NinthRaw6.equiv (rawMul x y)) rawMul_resp

def conj : NinthLoc6 → NinthLoc6 :=
  Quot.lift (fun x => Quot.mk NinthRaw6.equiv (rawConj x)) rawConj_resp

private theorem ind1 (P : NinthLoc6 → Prop)
    (h : ∀ a : NinthRaw6, P (Quot.mk NinthRaw6.equiv a)) (x : NinthLoc6) : P x :=
  Quot.ind h x

private theorem ind2 (P : NinthLoc6 → NinthLoc6 → Prop)
    (h : ∀ a b : NinthRaw6, P (Quot.mk NinthRaw6.equiv a) (Quot.mk NinthRaw6.equiv b))
    (x y : NinthLoc6) : P x y :=
  @Quot.ind _ _ (fun a => P a y)
    (fun a => @Quot.ind _ _ (fun b => P (Quot.mk NinthRaw6.equiv a) b) (h a) y) x

private theorem ind3 (P : NinthLoc6 → NinthLoc6 → NinthLoc6 → Prop)
    (h : ∀ a b c : NinthRaw6,
      P (Quot.mk NinthRaw6.equiv a) (Quot.mk NinthRaw6.equiv b) (Quot.mk NinthRaw6.equiv c))
    (x y z : NinthLoc6) : P x y z :=
  @Quot.ind _ _ (fun a => P a y z) (fun a =>
    @Quot.ind _ _ (fun b => P (Quot.mk NinthRaw6.equiv a) b z) (fun b =>
      @Quot.ind _ _ (fun c => P (Quot.mk NinthRaw6.equiv a) (Quot.mk NinthRaw6.equiv b) c) (h a b) z) y) x

-- [helper]
theorem add_zero (x : NinthLoc6) : add x zero = x := by
  refine ind1 (fun x => add x zero = x) (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd
  dsimp only
  simp only [Nat.add_zero, pow6, ninth_scale_one, ninth_scale_zero, ninth_add_zero]

-- [helper]
theorem zero_add (x : NinthLoc6) : add zero x = x := by
  refine ind1 (fun x => add zero x = x) (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd
  dsimp only
  simp only [Nat.zero_add, pow6, ninth_scale_one, ninth_scale_zero, ninth_zero_add]

-- [helper]
theorem add_comm (x y : NinthLoc6) : add x y = add y x := by
  refine ind2 (fun x y => add x y = add y x) (fun a b => ?_) x y
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd
  dsimp only
  rw [Nat.add_comm b.exp a.exp, ninth_add_comm]

-- [helper]
theorem add_assoc (x y z : NinthLoc6) : add (add x y) z = add x (add y z) := by
  refine ind3 (fun x y z => add (add x y) z = add x (add y z)) (fun a b c => ?_) x y z
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd
  dsimp only
  rw [Nat.add_assoc a.exp b.exp c.exp]
  apply congrArg (Ninth.scale (pow6 (a.exp + (b.exp + c.exp))))
  rw [ninth_scale_add, ninth_scale_add, ninth_scale_scale, ninth_scale_scale,
      ninth_scale_scale, ninth_scale_scale, pow6_add, pow6_add, ninth_add_assoc]
  have h1 : pow6 c.exp * pow6 b.exp = pow6 b.exp * pow6 c.exp := Int.mul_comm _ _
  have h2 : pow6 c.exp * pow6 a.exp = pow6 a.exp * pow6 c.exp := Int.mul_comm _ _
  rw [h1, h2]

private theorem add_neg (x : NinthLoc6) : add x (neg x) = zero := by
  refine ind1 (fun x => add x (neg x) = zero) (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd rawNeg
  dsimp only
  simp only [pow6, ninth_scale_zero, ninth_scale_neg, ninth_add_neg]

-- [helper]
theorem mul_one (x : NinthLoc6) : mul x one = x := by
  refine ind1 (fun x => mul x one = x) (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  dsimp only
  simp only [Nat.add_zero, ninth_mul_one]

-- [helper]
theorem one_mul (x : NinthLoc6) : mul one x = x := by
  refine ind1 (fun x => mul one x = x) (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  dsimp only
  simp only [Nat.zero_add, ninth_one_mul]

-- [helper]
theorem mul_zero (x : NinthLoc6) : mul x zero = zero := by
  refine ind1 (fun x => mul x zero = zero) (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  dsimp only
  simp only [ninth_mul_zero, ninth_scale_zero]

private theorem zero_mul (x : NinthLoc6) : mul zero x = zero := by
  refine ind1 (fun x => mul zero x = zero) (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  dsimp only
  simp only [ninth_zero_mul, ninth_scale_zero]

-- [helper]
theorem mul_comm (x y : NinthLoc6) : mul x y = mul y x := by
  refine ind2 (fun x y => mul x y = mul y x) (fun a b => ?_) x y
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  dsimp only
  rw [Nat.add_comm b.exp a.exp, ninth_mul_comm]

-- [helper]
theorem mul_assoc (x y z : NinthLoc6) : mul (mul x y) z = mul x (mul y z) := by
  refine ind3 (fun x y z => mul (mul x y) z = mul x (mul y z)) (fun a b c => ?_) x y z
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  dsimp only
  rw [Nat.add_assoc a.exp b.exp c.exp, ninth_mul_assoc]

-- [helper]
theorem mul_add (x y z : NinthLoc6) : mul x (add y z) = add (mul x y) (mul x z) := by
  refine ind3 (fun x y z => mul x (add y z) = add (mul x y) (mul x z)) (fun a b c => ?_) x y z
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul rawAdd
  dsimp only
  have hexp : a.exp + b.exp + (a.exp + c.exp) = (a.exp + (b.exp + c.exp)) + a.exp := by omega
  rw [hexp, pow6_add (a.exp + (b.exp + c.exp)) a.exp, ← ninth_scale_scale]
  apply congrArg (Ninth.scale (pow6 (a.exp + (b.exp + c.exp))))
  rw [ninth_mul_add, ninth_mul_scale_right, ninth_mul_scale_right, ninth_scale_add,
      ninth_scale_scale, ninth_scale_scale, ← pow6_add, ← pow6_add]

private theorem add_mul (x y z : NinthLoc6) : mul (add x y) z = add (mul x z) (mul y z) := by
  rw [mul_comm, mul_add, mul_comm z x, mul_comm z y]

-- [helper]
theorem conj_conj (x : NinthLoc6) : conj (conj x) = x := by
  refine ind1 (fun x => conj (conj x) = x) (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawConj
  dsimp only
  rw [ninth_conj_conj]

-- [helper]
theorem conj_add (x y : NinthLoc6) : conj (add x y) = add (conj x) (conj y) := by
  refine ind2 (fun x y => conj (add x y) = add (conj x) (conj y)) (fun a b => ?_) x y
  apply Quot.sound
  unfold NinthRaw6.equiv rawConj rawAdd
  dsimp only
  rw [ninth_conj_add, ninth_conj_scale, ninth_conj_scale]

-- [helper]
theorem conj_mul (x y : NinthLoc6) : conj (mul x y) = mul (conj x) (conj y) := by
  refine ind2 (fun x y => conj (mul x y) = mul (conj x) (conj y)) (fun a b => ?_) x y
  apply Quot.sound
  unfold NinthRaw6.equiv rawConj rawMul
  dsimp only
  rw [ninth_conj_mul]

-- [helper]
theorem conj_one : conj one = one := by
  apply Quot.sound
  unfold NinthRaw6.equiv rawConj
  decide

private theorem isZero_resp (a₁ a₂ : NinthRaw6) (ha : NinthRaw6.equiv a₁ a₂) :
    (a₁.num = Ninth.zero) = (a₂.num = Ninth.zero) := by
  apply propext
  constructor
  · intro h1
    unfold NinthRaw6.equiv at ha
    rw [h1, ninth_scale_zero] at ha
    exact ninth_scale_pow6_zero a₁.exp a₂.num ha.symm
  · intro h2
    unfold NinthRaw6.equiv at ha
    rw [h2, ninth_scale_zero] at ha
    exact ninth_scale_pow6_zero a₂.exp a₁.num ha

/-- Exact zero-test predicate lifted to `NinthLoc6` (certifies non-collapse of `ℤ[ζ_9][1/6]`). -/
def isZero : NinthLoc6 → Prop :=
  Quot.lift (fun a => a.num = Ninth.zero) isZero_resp

-- [helper]
theorem ne_of_raw_ne (x y : Ninth) (h : Ninth.sub x y ≠ Ninth.zero) :
    ofNinth x ≠ ofNinth y := by
  intro heq
  have hsub : sub (ofNinth x) (ofNinth y) = zero := by
    rw [heq]
    exact add_neg (ofNinth y)
  have hz : isZero (sub (ofNinth x) (ofNinth y)) := by
    rw [hsub]
    rfl
  change Ninth.add (Ninth.scale 1 x) (Ninth.scale 1 (Ninth.neg y)) = Ninth.zero at hz
  have hEqSub : Ninth.add (Ninth.scale 1 x) (Ninth.scale 1 (Ninth.neg y)) = Ninth.sub x y := by
    cases x; cases y
    simp only [Ninth.add, Ninth.scale, Ninth.neg, Ninth.sub, Ninth.mk.injEq, Int.one_mul]
    exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩
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
  have hmod : n % 6 = 0 ∨ n % 6 = 1 ∨ n % 6 = 2 ∨ n % 6 = 3 ∨ n % 6 = 4 ∨ n % 6 = 5 := by
    omega
  rcases hmod with h | h | h | h | h | h
  · have hneg : (-n) % 6 = 0 := by omega
    unfold zeta6Pow; rw [h, hneg]
    exact ⟨Quot.sound (by decide), Quot.sound (by decide)⟩
  · have hneg : (-n) % 6 = 5 := by omega
    unfold zeta6Pow; rw [h, hneg]
    exact ⟨Quot.sound (by decide), Quot.sound (by decide)⟩
  · have hneg : (-n) % 6 = 4 := by omega
    unfold zeta6Pow; rw [h, hneg]
    exact ⟨Quot.sound (by decide), Quot.sound (by decide)⟩
  · have hneg : (-n) % 6 = 3 := by omega
    unfold zeta6Pow; rw [h, hneg]
    exact ⟨Quot.sound (by decide), Quot.sound (by decide)⟩
  · have hneg : (-n) % 6 = 2 := by omega
    unfold zeta6Pow; rw [h, hneg]
    exact ⟨Quot.sound (by decide), Quot.sound (by decide)⟩
  · have hneg : (-n) % 6 = 1 := by omega
    unfold zeta6Pow; rw [h, hneg]
    exact ⟨Quot.sound (by decide), Quot.sound (by decide)⟩

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
  add_neg := NinthLoc6.add_neg
  mul_one := NinthLoc6.mul_one
  one_mul := NinthLoc6.one_mul
  mul_zero := NinthLoc6.mul_zero
  zero_mul := NinthLoc6.zero_mul
  mul_comm := NinthLoc6.mul_comm
  mul_assoc := NinthLoc6.mul_assoc
  mul_add := NinthLoc6.mul_add
  add_mul := NinthLoc6.add_mul
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
