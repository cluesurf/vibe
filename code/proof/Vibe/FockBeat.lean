import Vibe.Tone
import Vibe.Algebra
import Vibe.Rule
import Vibe.CoxeterTransport

/-!
# Vibe Theory: Quantum Fock-Space Composite Beat `U` on Infinite `{3,4,3,4}` (Milestone P1)

Zero-dependency Lean 4.35.0 formalization of the full quantum Fock-space bare QCA architecture
over the exact cyclotomic localization `ℤ[ζ_9][1/6]` and the infinite `{3,4,3,4}` hyperbolic
honeycomb frame group `O^+(4,1; ℤ[√2])` (matching `test/universe.ts` and Paper 0018, Sections 1–2):

1. **Exact `StarCommRing Ninth` & Exact Localization `NinthLoc6 = ℤ[ζ_9][1/6]`:**
   Full star-commutative ring laws for `ℤ[ζ_9]` and its dyadic-triadic localization `ℤ[ζ_9][1/6]`,
   plus exact unitarity and `D^2 = C` certificates for every microscopic gate coefficient
   (`D = C_{1/2}`, `K`, `M_pair(ζ_18)`, `M_meet`, `Φ_odd` powers `ζ_6^n`).
2. **Finite-Support Quantum Fock Space over Any `StarCommRing R`:**
   Support-independent Hermitian inner product `innerOn` and squared norm `normSqOn`,
   sesquilinearity, conjugate symmetry, basis ket orthonormality, `FockUnitary` composition and
   all-time iteration (`∀ t : Nat`), plus universal unitary constructors for bijections
   (`permUnitary`), diagonal phases (`phaseUnitary`), `2 × 2` involutive blocks (`block2Unitary`),
   and `12 × 12` antipodal-line mixers (`block12Unitary`).
3. **Exact `{3,4,3,4}` Coxeter Parity `M_P = simpleRefl 0` & Canonical Infinite-Honeycomb `HoneycombConfig`:**
   Constructive `DecidableEq` for `Mat5`, `FullDock`, and canonical finite-excitation configurations
   `HoneycombConfig` on the infinite `{3,4,3,4}` honeycomb; exact Coxeter parity equivariance
   `M_P k_a M_P = k_{paritySlot a}` across all 24 slots and unconditional determinant conjugation
   invariance `det(M_P g M_P) = det(g)` for ALL `g : Mat5`.
4. **Exact Scale-2 Pairwise Commutation (`[K, M_pair] = [K, M_meet] = [M_pair, M_meet] = 0`):**
   Global infinite-honeycomb Fock operators lifted from single-site unitaries, proving exact
   pairwise commutation of `K`, `M_pair(ζ_18)`, and `M_meet` on ALL Fock states.
5. **Full Palindromic 8-Layer Beat Unitarity, Quantum `|V_1⟩` Stationarity, Exact Charge `Q`
   Conservation & True Quantum 1-Hop Lieb-Robinson Light-Cone (`∀ t : Nat`):**
   Proved for the full 8-layer beat `U = S ∘ Φ_odd ∘ D ∘ M_meet ∘ M_pair(ζ_18) ∘ K ∘ D ∘ Φ_odd`
   (as well as the symmetric doubled variant `S ∘ D ∘ M_meet ∘ M_pair ∘ K ∘ M_pair ∘ M_meet ∘ D`).
6. **Concrete Quantum Fock-Space Instantiation of `CoxeterTransport.thm_palindromic_beat_T_CP_CPT`
   & Non-Vacuous 4-Vibe Chiral Witness:**
   Exact quantum `T^2 = I`, `T U T = U†`, `CP U = U CP`, `(CP ∘ T)^2 = I`,
   `(CP ∘ T) U (CP ∘ T) = U†`, paired with an explicit 4-vibe chiral witness proving genuine
   individual `C` and `P` breaking under `Φ_odd` while `CP`, `T`, and `CPT` hold identically.
-/

set_option autoImplicit false

namespace Vibe

private theorem ite_bool_true {α : Type} (t e : α) : (if true = true then t else e) = t := rfl
private theorem ite_bool_false {α : Type} (t e : α) : (if false = true then t else e) = e := rfl

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
  simp only [Ninth.scale, Ninth.mk.injEq, Int.one_mul]
  exact ⟨rfl, rfl, rfl, rfl, rfl, rfl⟩

private theorem ninth_scale_zero (k : Int) : Ninth.scale k Ninth.zero = Ninth.zero := by
  simp only [Ninth.scale, Ninth.zero, Ninth.mk.injEq, Int.mul_zero]
  exact ⟨rfl, rfl, rfl, rfl, rfl, rfl⟩

private theorem ninth_scale_add (k : Int) (x y : Ninth) :
    Ninth.scale k (Ninth.add x y) = Ninth.add (Ninth.scale k x) (Ninth.scale k y) := by
  cases x; cases y
  simp only [Ninth.scale, Ninth.add, Ninth.mk.injEq, Int.mul_add]
  exact ⟨rfl, rfl, rfl, rfl, rfl, rfl⟩

private theorem ninth_scale_neg (k : Int) (x : Ninth) :
    Ninth.scale k (Ninth.neg x) = Ninth.neg (Ninth.scale k x) := by
  cases x
  simp only [Ninth.scale, Ninth.neg, Ninth.mk.injEq, Int.mul_neg]
  exact ⟨rfl, rfl, rfl, rfl, rfl, rfl⟩

private theorem ninth_scale_scale (k m : Int) (x : Ninth) :
    Ninth.scale k (Ninth.scale m x) = Ninth.scale (k * m) x := by
  cases x
  simp only [Ninth.scale, Ninth.mk.injEq, Int.mul_assoc]
  exact ⟨rfl, rfl, rfl, rfl, rfl, rfl⟩

private theorem ninth_mul_scale_left (k : Int) (x y : Ninth) :
    Ninth.mul (Ninth.scale k x) y = Ninth.scale k (Ninth.mul x y) := by
  cases x; cases y
  simp only [Ninth.mul, Ninth.scale, Ninth.mk.injEq, Int.mul_add, Int.mul_sub, Int.mul_assoc]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

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
  simp only [Ninth.conj, Ninth.scale, Ninth.mk.injEq, Int.mul_sub, Int.mul_neg]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

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
  have sum6_add : ∀ u v : Fin 6 → Ninth,
      sum6Ninth (fun k => Ninth.add (u k) (v k)) = Ninth.add (sum6Ninth u) (sum6Ninth v) := by
    intro u v
    unfold sum6Ninth
    have swap4 : ∀ a b c d : Ninth,
        Ninth.add (Ninth.add a b) (Ninth.add c d) =
          Ninth.add (Ninth.add a c) (Ninth.add b d) := by
      intro a b c d
      rw [ninth_add_assoc a b (Ninth.add c d), ← ninth_add_assoc b c d, ninth_add_comm b c,
          ninth_add_assoc c b d, ← ninth_add_assoc a c (Ninth.add b d)]
    rw [swap4, swap4, swap4, swap4, swap4]
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
  simp only [Ninth.mul, Ninth.scale, Ninth.mk.injEq, hkm, Int.mul_add, Int.mul_sub]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_mul_comm (x y : Ninth) : Ninth.mul x y = Ninth.mul y x := by
  have hB : ∀ i j : Fin 6, Ninth.mul (ninthBasis i) (ninthBasis j) =
      Ninth.mul (ninthBasis j) (ninthBasis i) := by decide
  have hL : Ninth.mul x y =
      sum6Ninth (fun i => sum6Ninth (fun j =>
        Ninth.scale (ninthCoord x i * ninthCoord y j)
          (Ninth.mul (ninthBasis i) (ninthBasis j)))) := by
    conv_lhs => rw [ninth_basis_decomp x, ninth_basis_decomp y]
    rw [ninth_mul_sum6_left]
    apply congrArg sum6Ninth; funext i
    rw [ninth_mul_sum6_right]
    apply congrArg sum6Ninth; funext j
    rw [ninth_mul_scale_left, ninth_mul_scale_right, ninth_scale_scale]
  have hR : Ninth.mul y x =
      sum6Ninth (fun j => sum6Ninth (fun i =>
        Ninth.scale (ninthCoord y j * ninthCoord x i)
          (Ninth.mul (ninthBasis j) (ninthBasis i)))) := by
    conv_lhs => rw [ninth_basis_decomp y, ninth_basis_decomp x]
    rw [ninth_mul_sum6_left]
    apply congrArg sum6Ninth; funext j
    rw [ninth_mul_sum6_right]
    apply congrArg sum6Ninth; funext i
    rw [ninth_mul_scale_left, ninth_mul_scale_right, ninth_scale_scale]
  rw [hL, hR, ninth_sum6_swap]
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
    conv_lhs => rw [ninth_basis_decomp x, ninth_basis_decomp y, ninth_basis_decomp z]
    rw [ninth_mul_sum6_left (fun i => Ninth.scale (ninthCoord x i) (ninthBasis i)),
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
    conv_lhs => rw [ninth_basis_decomp x, ninth_basis_decomp y, ninth_basis_decomp z]
    rw [ninth_mul_sum6_left]
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
    conv_lhs => rw [ninth_basis_decomp x, ninth_basis_decomp y]
    rw [ninth_mul_sum6_left, ninth_conj_sum6]
    apply congrArg sum6Ninth; funext i
    rw [ninth_mul_sum6_right, ninth_conj_sum6]
    apply congrArg sum6Ninth; funext j
    rw [ninth_mul_scale_left, ninth_mul_scale_right, ninth_scale_scale, ninth_conj_scale]
  have hR : Ninth.mul (Ninth.conj x) (Ninth.conj y) =
      sum6Ninth (fun i => sum6Ninth (fun j =>
        Ninth.scale (ninthCoord x i * ninthCoord y j)
          (Ninth.mul (Ninth.conj (ninthBasis i)) (Ninth.conj (ninthBasis j))))) := by
    conv_lhs => rw [ninth_basis_decomp x, ninth_basis_decomp y]
    rw [ninth_conj_sum6, ninth_conj_sum6, ninth_mul_sum6_left]
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
  unfold NinthRaw6.equiv rawAdd at ha hb ⊢
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
    rw [hs1, hs2, ← ninth_scale_scale, ← ninth_scale_scale, ha]
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
    rw [hs1, hs2, ← ninth_scale_scale, ← ninth_scale_scale, hb]
  rw [h1, h2]

private theorem rawNeg_resp (a₁ a₂ : NinthRaw6) (ha : NinthRaw6.equiv a₁ a₂) :
    Quot.mk NinthRaw6.equiv (rawNeg a₁) = Quot.mk NinthRaw6.equiv (rawNeg a₂) := by
  apply Quot.sound
  unfold NinthRaw6.equiv rawNeg at ha ⊢
  rw [ninth_scale_neg, ninth_scale_neg, ha]

private theorem rawMul_resp (a₁ a₂ b₁ b₂ : NinthRaw6)
    (ha : NinthRaw6.equiv a₁ a₂) (hb : NinthRaw6.equiv b₁ b₂) :
    Quot.mk NinthRaw6.equiv (rawMul a₁ b₁) = Quot.mk NinthRaw6.equiv (rawMul a₂ b₂) := by
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul at ha hb ⊢
  rw [pow6_add, pow6_add, ← ninth_scale_scale, ← ninth_scale_scale,
      ← ninth_mul_scale_left, ← ninth_mul_scale_right, ha, hb,
      ninth_mul_scale_left, ninth_mul_scale_right]

private theorem rawConj_resp (a₁ a₂ : NinthRaw6) (ha : NinthRaw6.equiv a₁ a₂) :
    Quot.mk NinthRaw6.equiv (rawConj a₁) = Quot.mk NinthRaw6.equiv (rawConj a₂) := by
  apply Quot.sound
  unfold NinthRaw6.equiv rawConj at ha ⊢
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

private theorem add_zero (x : NinthLoc6) : add x zero = x := by
  refine quot_ind_prop (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd
  simp only [Nat.add_zero, pow6, ninth_scale_one, ninth_scale_zero, ninth_add_zero]

private theorem zero_add (x : NinthLoc6) : add zero x = x := by
  refine quot_ind_prop (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd
  simp only [Nat.zero_add, pow6, ninth_scale_one, ninth_scale_zero, ninth_zero_add]

private theorem add_comm (x y : NinthLoc6) : add x y = add y x := by
  refine quot_ind_prop (fun a => quot_ind_prop (fun b => ?_) y) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd
  rw [Nat.add_comm b.exp a.exp, ninth_add_comm]

private theorem add_assoc (x y z : NinthLoc6) : add (add x y) z = add x (add y z) := by
  refine quot_ind_prop (fun a => quot_ind_prop (fun b => quot_ind_prop (fun c => ?_) z) y) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd
  rw [Nat.add_assoc a.exp b.exp c.exp]
  apply congrArg (Ninth.scale (pow6 (a.exp + (b.exp + c.exp))))
  rw [ninth_scale_add, ninth_scale_add, ninth_scale_scale, ninth_scale_scale,
      ninth_scale_scale, ninth_scale_scale, pow6_add, pow6_add, ninth_add_assoc]
  have h1 : pow6 c.exp * pow6 b.exp = pow6 b.exp * pow6 c.exp := Int.mul_comm _ _
  have h2 : pow6 c.exp * pow6 a.exp = pow6 a.exp * pow6 c.exp := Int.mul_comm _ _
  rw [h1, h2]

private theorem add_neg (x : NinthLoc6) : add x (neg x) = zero := by
  refine quot_ind_prop (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawAdd rawNeg
  simp only [pow6, ninth_scale_one, ninth_scale_zero, ninth_scale_neg, ← ninth_scale_add,
    ninth_add_neg]

private theorem mul_one (x : NinthLoc6) : mul x one = x := by
  refine quot_ind_prop (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  simp only [Nat.add_zero, ninth_mul_one]

private theorem one_mul (x : NinthLoc6) : mul one x = x := by
  refine quot_ind_prop (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  simp only [Nat.zero_add, ninth_one_mul]

private theorem mul_zero (x : NinthLoc6) : mul x zero = zero := by
  refine quot_ind_prop (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  simp only [ninth_mul_zero, ninth_scale_zero]

private theorem zero_mul (x : NinthLoc6) : mul zero x = zero := by
  refine quot_ind_prop (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  simp only [ninth_zero_mul, ninth_scale_zero]

private theorem mul_comm (x y : NinthLoc6) : mul x y = mul y x := by
  refine quot_ind_prop (fun a => quot_ind_prop (fun b => ?_) y) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  rw [Nat.add_comm b.exp a.exp, ninth_mul_comm]

private theorem mul_assoc (x y z : NinthLoc6) : mul (mul x y) z = mul x (mul y z) := by
  refine quot_ind_prop (fun a => quot_ind_prop (fun b => quot_ind_prop (fun c => ?_) z) y) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul
  rw [Nat.add_assoc a.exp b.exp c.exp, ninth_mul_assoc]

private theorem mul_add (x y z : NinthLoc6) : mul x (add y z) = add (mul x y) (mul x z) := by
  refine quot_ind_prop (fun a => quot_ind_prop (fun b => quot_ind_prop (fun c => ?_) z) y) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawMul rawAdd
  have hexp : a.exp + b.exp + (a.exp + c.exp) = (a.exp + (b.exp + c.exp)) + a.exp := by omega
  rw [hexp, pow6_add (a.exp + (b.exp + c.exp)) a.exp, ← ninth_scale_scale]
  apply congrArg (Ninth.scale (pow6 (a.exp + (b.exp + c.exp))))
  rw [ninth_mul_add, ninth_mul_scale_right, ninth_mul_scale_right, ninth_scale_add,
      ninth_scale_scale, ninth_scale_scale, ← pow6_add, ← pow6_add]

private theorem add_mul (x y z : NinthLoc6) : mul (add x y) z = add (mul x z) (mul y z) := by
  rw [mul_comm, mul_add, mul_comm z x, mul_comm z y]

private theorem conj_conj (x : NinthLoc6) : conj (conj x) = x := by
  refine quot_ind_prop (fun a => ?_) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawConj
  rw [ninth_conj_conj]

private theorem conj_add (x y : NinthLoc6) : conj (add x y) = add (conj x) (conj y) := by
  refine quot_ind_prop (fun a => quot_ind_prop (fun b => ?_) y) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawConj rawAdd
  rw [ninth_conj_add, ninth_conj_scale, ninth_conj_scale]

private theorem conj_mul (x y : NinthLoc6) : conj (mul x y) = mul (conj x) (conj y) := by
  refine quot_ind_prop (fun a => quot_ind_prop (fun b => ?_) y) x
  apply Quot.sound
  unfold NinthRaw6.equiv rawConj rawMul
  rw [ninth_conj_mul]

private theorem conj_one : conj one = one := by
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


/-! ## Section 2: Finite-Support Quantum Fock Space & Universal Unitary Constructors -/

/-- Constructive duplicate-free list predicate (zero external `Init.Data.List.Pairwise` dependency). -/
inductive IsNodup {α : Type} : List α → Prop where
  | nil : IsNodup []
  | cons {x : α} {xs : List α} : x ∉ xs → IsNodup xs → IsNodup (x :: xs)

/-- Constructive membership check on `List α`. -/
def memBool {α : Type} [DecidableEq α] (a : α) : List α → Bool
  | [] => false
  | x :: xs => if x = a then true else memBool a xs

private theorem memBool_eq_true_iff {α : Type} [DecidableEq α] (a : α) (xs : List α) :
    memBool a xs = true ↔ a ∈ xs := by
  induction xs with
  | nil =>
    simp only [memBool]
    exact ⟨fun h => Bool.noConfusion h, fun h => nomatch h⟩
  | cons x rest ih =>
    simp only [memBool]
    if hx : x = a then
      rw [ite_eq_left hx, hx]
      exact ⟨fun _ => List.Mem.head rest, fun _ => rfl⟩
    else
      rw [ite_eq_right hx]
      constructor
      · intro h
        exact List.Mem.tail x (ih.mp h)
      · intro h
        cases h with
        | head => exact absurd rfl hx
        | tail _ h' => exact ih.mpr h'

private def isNodupBool {α : Type} [DecidableEq α] : List α → Bool
  | [] => true
  | x :: xs => !(memBool x xs) && isNodupBool xs

private theorem isNodup_of_bool {α : Type} [DecidableEq α] (xs : List α)
    (h : isNodupBool xs = true) : IsNodup xs := by
  induction xs with
  | nil => exact IsNodup.nil
  | cons x rest ih =>
    simp only [isNodupBool, Bool.and_eq_true] at h
    refine IsNodup.cons ?_ (ih h.2)
    intro hmem
    have hm := (memBool_eq_true_iff x rest).mpr hmem
    have h1 := h.1
    rw [hm] at h1
    exact Bool.noConfusion h1

private theorem list_all_eq_true_iff {α : Type} (p : α → Bool) (xs : List α) :
    xs.all p = true ↔ ∀ x, x ∈ xs → p x = true := by
  induction xs with
  | nil =>
    simp only [List.all]
    exact ⟨fun _ _ h => nomatch h, fun _ => rfl⟩
  | cons x rest ih =>
    simp only [List.all, Bool.and_eq_true]
    constructor
    · intro ⟨hpx, hrest⟩ y hy
      cases hy with
      | head => exact hpx
      | tail _ h' => exact ih.mp hrest y h'
    · intro hall
      exact ⟨hall x (List.Mem.head rest), ih.mpr (fun y hy => hall y (List.Mem.tail x hy))⟩

private theorem mem_filter_iff {α : Type} (p : α → Bool) (xs : List α) (a : α) :
    a ∈ xs.filter p ↔ a ∈ xs ∧ p a = true := by
  induction xs with
  | nil =>
    simp only [List.filter]
    exact ⟨fun h => nomatch h, fun h => nomatch h.1⟩
  | cons x rest ih =>
    simp only [List.filter]
    cases hp : p x with
    | true =>
      constructor
      · intro h
        cases h with
        | head => exact ⟨List.Mem.head rest, hp⟩
        | tail _ h' => exact ⟨List.Mem.tail x (ih.mp h').1, (ih.mp h').2⟩
      · intro ⟨hmem, hpa⟩
        cases hmem with
        | head => exact List.Mem.head _
        | tail _ h' => exact List.Mem.tail x (ih.mpr ⟨h', hpa⟩)
    | false =>
      constructor
      · intro h
        exact ⟨List.Mem.tail x (ih.mp h).1, (ih.mp h).2⟩
      · intro ⟨hmem, hpa⟩
        cases hmem with
        | head => rw [hp] at hpa; exact Bool.noConfusion hpa
        | tail _ h' => exact ih.mpr ⟨h', hpa⟩

private theorem mem_map_iff {α β : Type} (f : α → β) (xs : List α) (b : β) :
    b ∈ xs.map f ↔ ∃ a : α, a ∈ xs ∧ f a = b := by
  induction xs with
  | nil =>
    simp only [List.map]
    exact ⟨fun h => nomatch h, fun ⟨_, ha, _⟩ => nomatch ha⟩
  | cons x rest ih =>
    simp only [List.map]
    constructor
    · intro h
      cases h with
      | head => exact ⟨x, List.Mem.head rest, rfl⟩
      | tail _ h' =>
        obtain ⟨a, ha, hfa⟩ := ih.mp h'
        exact ⟨a, List.Mem.tail x ha, hfa⟩
    · intro ⟨a, ha, hfa⟩
      cases ha with
      | head => rw [hfa]; exact List.Mem.head _
      | tail _ h' => exact List.Mem.tail (f x) (ih.mpr ⟨a, h', hfa⟩)

private theorem isNodup_filter {α : Type} (p : α → Bool) {xs : List α} (h : IsNodup xs) :
    IsNodup (xs.filter p) := by
  induction h with
  | nil => exact IsNodup.nil
  | cons hnot _ ih =>
    simp only [List.filter]
    cases hp : p _ with
    | true =>
      exact IsNodup.cons (fun hm => hnot (mem_filter_iff p _ _ |>.mp hm).1) ih
    | false =>
      exact ih

private theorem isNodup_map_inj {α β : Type} (f : α → β)
    (hinj : ∀ x y : α, f x = f y → x = y) {xs : List α} (h : IsNodup xs) :
    IsNodup (xs.map f) := by
  induction h with
  | nil => exact IsNodup.nil
  | cons hnot _ ih =>
    simp only [List.map]
    refine IsNodup.cons ?_ ih
    intro hm
    obtain ⟨a, ha, hfa⟩ := (mem_map_iff f _ _).mp hm
    rw [hinj _ _ hfa] at ha
    exact hnot ha

/-- Remove the first occurrence of `a` from a list. -/
def eraseOne {α : Type} [DecidableEq α] (a : α) : List α → List α
  | [] => []
  | x :: xs => if x = a then xs else x :: eraseOne a xs

private theorem mem_eraseOne_iff {α : Type} [DecidableEq α] (a y : α)
    {xs : List α} (hnd : IsNodup xs) :
    y ∈ eraseOne a xs ↔ y ∈ xs ∧ y ≠ a := by
  induction hnd with
  | nil =>
    simp only [eraseOne]
    exact ⟨fun h => nomatch h, fun h => nomatch h.1⟩
  | @cons x rest hnot _ ih =>
    simp only [eraseOne]
    if hxa : x = a then
      rw [ite_eq_left hxa]
      constructor
      · intro hy
        refine ⟨List.Mem.tail x hy, ?_⟩
        intro hya
        rw [hya, ← hxa] at hy
        exact hnot hy
      · intro ⟨hmem, hne⟩
        cases hmem with
        | head => exact absurd hxa hne
        | tail _ h' => exact h'
    else
      rw [ite_eq_right hxa]
      constructor
      · intro h
        cases h with
        | head => exact ⟨List.Mem.head rest, hxa⟩
        | tail _ h' =>
          have ⟨hm, hne⟩ := ih.mp h'
          exact ⟨List.Mem.tail x hm, hne⟩
      · intro ⟨hmem, hne⟩
        cases hmem with
        | head => exact List.Mem.head _
        | tail _ h' => exact List.Mem.tail x (ih.mpr ⟨h', hne⟩)

private theorem isNodup_eraseOne {α : Type} [DecidableEq α] (a : α)
    {xs : List α} (hnd : IsNodup xs) : IsNodup (eraseOne a xs) := by
  induction hnd with
  | nil => exact IsNodup.nil
  | @cons x rest hnot hndRest ih =>
    simp only [eraseOne]
    if hxa : x = a then
      rw [ite_eq_left hxa]
      exact hndRest
    else
      rw [ite_eq_right hxa]
      refine IsNodup.cons ?_ ih
      intro hm
      exact hnot ((mem_eraseOne_iff a x hndRest).mp hm).1

/-- Duplicate-free union of two lists. -/
def nodupUnion {α : Type} [DecidableEq α] (xs : List α) : List α → List α
  | [] => xs
  | y :: ys =>
    let rest := nodupUnion xs ys
    if memBool y rest then rest else y :: rest

private theorem mem_nodupUnion {α : Type} [DecidableEq α] (xs ys : List α) (a : α) :
    a ∈ nodupUnion xs ys ↔ a ∈ xs ∨ a ∈ ys := by
  induction ys with
  | nil =>
    simp only [nodupUnion]
    exact ⟨Or.inl, fun h => match h with | Or.inl h1 => h1 | Or.inr h2 => nomatch h2⟩
  | cons y rest ih =>
    simp only [nodupUnion]
    cases hm : memBool y (nodupUnion xs rest) with
    | true =>
      rw [ite_eq_left rfl]
      constructor
      · intro ha
        rcases ih.mp ha with h1 | h2
        · exact Or.inl h1
        · exact Or.inr (List.Mem.tail y h2)
      · intro h
        rcases h with h1 | h2
        · exact ih.mpr (Or.inl h1)
        · cases h2 with
          | head => exact (memBool_eq_true_iff y _).mp hm
          | tail _ h' => exact ih.mpr (Or.inr h')
    | false =>
      rw [ite_eq_right (by decide : false ≠ true)]
      constructor
      · intro ha
        cases ha with
        | head => exact Or.inr (List.Mem.head rest)
        | tail _ h' =>
          rcases ih.mp h' with h1 | h2
          · exact Or.inl h1
          · exact Or.inr (List.Mem.tail y h2)
      · intro h
        rcases h with h1 | h2
        · exact List.Mem.tail y (ih.mpr (Or.inl h1))
        · cases h2 with
          | head => exact List.Mem.head _
          | tail _ h' => exact List.Mem.tail y (ih.mpr (Or.inr h'))

private theorem isNodup_nodupUnion {α : Type} [DecidableEq α] {xs : List α} (hxs : IsNodup xs)
    (ys : List α) : IsNodup (nodupUnion xs ys) := by
  induction ys with
  | nil => exact hxs
  | cons y rest ih =>
    simp only [nodupUnion]
    cases hm : memBool y (nodupUnion xs rest) with
    | true =>
      rw [ite_eq_left rfl]
      exact ih
    | false =>
      rw [ite_eq_right (by decide : false ≠ true)]
      refine IsNodup.cons ?_ ih
      intro hmem
      have ht := (memBool_eq_true_iff y _).mpr hmem
      rw [hm] at ht
      exact Bool.noConfusion ht

/-- Deduplicate an arbitrary list while preserving exact membership. -/
def dedupList {α : Type} [DecidableEq α] (xs : List α) : List α :=
  nodupUnion [] xs

private theorem isNodup_dedupList {α : Type} [DecidableEq α] (xs : List α) :
    IsNodup (dedupList xs) :=
  isNodup_nodupUnion IsNodup.nil xs

private theorem mem_dedupList {α : Type} [DecidableEq α] (xs : List α) (a : α) :
    a ∈ dedupList xs ↔ a ∈ xs := by
  unfold dedupList
  rw [mem_nodupUnion]
  exact ⟨fun h => match h with | Or.inl h1 => nomatch h1 | Or.inr h2 => h2, Or.inr⟩

/-- Constructive flatMap over lists. -/
def flatMapList {α β : Type} (f : α → List β) : List α → List β
  | [] => []
  | x :: xs => f x ++ flatMapList f xs

private theorem mem_append_iff {α : Type} (xs ys : List α) (a : α) :
    a ∈ xs ++ ys ↔ a ∈ xs ∨ a ∈ ys := by
  induction xs with
  | nil =>
    simp only [List.nil_append]
    exact ⟨Or.inr, fun h => match h with | Or.inl h1 => nomatch h1 | Or.inr h2 => h2⟩
  | cons x rest ih =>
    simp only [List.cons_append]
    constructor
    · intro h
      cases h with
      | head => exact Or.inl (List.Mem.head rest)
      | tail _ h' =>
        rcases ih.mp h' with h1 | h2
        · exact Or.inl (List.Mem.tail x h1)
        · exact Or.inr h2
    · intro h
      rcases h with h1 | h2
      · cases h1 with
        | head => exact List.Mem.head _
        | tail _ h' => exact List.Mem.tail x (ih.mpr (Or.inl h'))
      · exact List.Mem.tail x (ih.mpr (Or.inr h2))

private theorem mem_flatMapList_iff {α β : Type} (f : α → List β) (xs : List α) (b : β) :
    b ∈ flatMapList f xs ↔ ∃ a : α, a ∈ xs ∧ b ∈ f a := by
  induction xs with
  | nil =>
    simp only [flatMapList]
    exact ⟨fun h => nomatch h, fun ⟨_, ha, _⟩ => nomatch ha⟩
  | cons x rest ih =>
    simp only [flatMapList]
    rw [mem_append_iff, ih]
    constructor
    · intro h
      rcases h with h1 | ⟨a, ha, hb⟩
      · exact ⟨x, List.Mem.head rest, h1⟩
      · exact ⟨a, List.Mem.tail x ha, hb⟩
    · intro ⟨a, ha, hb⟩
      cases ha with
      | head => exact Or.inl hb
      | tail _ h' => exact Or.inr ⟨a, h', hb⟩

/-- Quantum Fock-space wavefunction `ψ : α → R` assigning an exact amplitude in `R` to each basis configuration. -/
abbrev FockVec (R α : Type) := α → R

section FockSpace

variable {R α : Type} [StarCommRing R]

open StarCommRing

/-- Zero wavefunction. -/
def zeroVec : FockVec R α := fun _ => zero

/-- Pointwise superposition `|ψ⟩ + |φ⟩`. -/
def addVec (ψ φ : FockVec R α) : FockVec R α := fun c => add (ψ c) (φ c)

/-- Pointwise scalar multiplication `λ |ψ⟩`. -/
def scaleVec (lam : R) (ψ : FockVec R α) : FockVec R α := fun c => mul lam (ψ c)

/-- Antilinear complex conjugation `K_conj |ψ⟩` (`c ↦ conj (ψ c)`). -/
def conjVec (ψ : FockVec R α) : FockVec R α := fun c => conj (ψ c)

/-- Basis ket `|c₀⟩` with unit amplitude at `c₀` and `0` elsewhere. -/
def ket [DecidableEq α] (c₀ : α) : FockVec R α :=
  fun c => if c = c₀ then one else zero

/-- Exact finite sum `∑_{x ∈ xs} f x` in `R`. -/
def sumList : List α → (α → R) → R
  | [], _ => zero
  | x :: xs, f => add (f x) (sumList xs f)

/-- Exact Hermitian inner product `⟨ψ | φ⟩ = ∑_{c ∈ s} conj(ψ c) * φ c` evaluated over `s`. -/
def innerOn (s : List α) (ψ φ : FockVec R α) : R :=
  sumList s (fun c => mul (conj (ψ c)) (φ c))

/-- Exact squared norm `‖ψ‖² = ⟨ψ | ψ⟩` evaluated over `s`. -/
def normSqOn (s : List α) (ψ : FockVec R α) : R :=
  innerOn s ψ ψ

/-- Finite-support witness: `s` is duplicate-free and `ψ` vanishes outside `s`. -/
def SuppIn (s : List α) (ψ : FockVec R α) : Prop :=
  IsNodup s ∧ ∀ c : α, c ∉ s → ψ c = zero

private theorem star_conj_zero : conj (zero : R) = zero := by
  have h1 : add (conj (zero : R)) (conj (zero : R)) = conj (zero : R) := by
    rw [← conj_add, add_zero]
  have h2 : add (add (conj (zero : R)) (conj (zero : R))) (neg (conj (zero : R))) =
      add (conj (zero : R)) (neg (conj (zero : R))) := congrArg (fun z => add z (neg (conj (zero : R)))) h1
  rw [add_assoc, add_neg, add_zero, add_neg] at h2
  exact h2

private theorem star_neg_mul (a b : R) : mul (neg a) b = neg (mul a b) := by
  have h1 : add (mul a b) (mul (neg a) b) = zero := by
    rw [← add_mul, add_neg, zero_mul]
  have h2 : add (neg (mul a b)) (add (mul a b) (mul (neg a) b)) = neg (mul a b) := by
    rw [h1, add_zero]
  rw [← add_assoc, add_comm (neg (mul a b)) (mul a b), add_neg, zero_add] at h2
  exact h2

private theorem star_mul_neg (a b : R) : mul a (neg b) = neg (mul a b) := by
  rw [mul_comm, star_neg_mul, mul_comm]

private theorem star_neg_neg (a : R) : neg (neg a) = a := by
  have h1 : add (neg a) (neg (neg a)) = zero := add_neg (neg a)
  have h2 : add a (add (neg a) (neg (neg a))) = add a zero := congrArg (add a) h1
  rw [← add_assoc, add_neg, zero_add, add_zero] at h2
  exact h2

private theorem star_conj_neg (a : R) : conj (neg a) = neg (conj a) := by
  have h1 : add (conj a) (conj (neg a)) = zero := by
    rw [← conj_add, add_neg, star_conj_zero]
  have h2 : add (neg (conj a)) (add (conj a) (conj (neg a))) = add (neg (conj a)) zero :=
    congrArg (add (neg (conj a))) h1
  rw [← add_assoc, add_comm (neg (conj a)) (conj a), add_neg, zero_add, add_zero] at h2
  exact h2

private theorem sumList_zero_of_all_zero (xs : List α) (f : α → R)
    (h : ∀ x : α, x ∈ xs → f x = zero) : sumList xs f = zero := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [sumList]
    rw [h x (List.Mem.head rest), zero_add]
    exact ih (fun y hy => h y (List.Mem.tail x hy))

private theorem sumList_congr (xs : List α) (f g : α → R)
    (h : ∀ x : α, x ∈ xs → f x = g x) : sumList xs f = sumList xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [sumList]
    rw [h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]

private theorem sumList_add (xs : List α) (f g : α → R) :
    sumList xs (fun x => add (f x) (g x)) = add (sumList xs f) (sumList xs g) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact (add_zero zero).symm
  | cons x rest ih =>
    simp only [sumList]
    rw [ih]
    rw [add_assoc (f x) (g x) (add (sumList rest f) (sumList rest g))]
    rw [← add_assoc (g x) (sumList rest f) (sumList rest g)]
    rw [add_comm (g x) (sumList rest f)]
    rw [add_assoc (sumList rest f) (g x) (sumList rest g)]
    rw [← add_assoc (f x) (sumList rest f) (add (g x) (sumList rest g))]

private theorem sumList_mul_left (xs : List α) (c : R) (f : α → R) :
    sumList xs (fun x => mul c (f x)) = mul c (sumList xs f) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact (mul_zero c).symm
  | cons x rest ih =>
    simp only [sumList]
    rw [ih, ← mul_add]

private theorem sumList_conj (xs : List α) (f : α → R) :
    conj (sumList xs f) = sumList xs (fun x => conj (f x)) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact star_conj_zero
  | cons x rest ih =>
    simp only [sumList]
    rw [conj_add, ih]

private theorem sumList_map {β : Type} (xs : List β) (g : β → α) (f : α → R) :
    sumList (xs.map g) f = sumList xs (fun x => f (g x)) := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [List.map, sumList]
    rw [ih]

private theorem sumList_filter_add (xs : List α) (p : α → Bool) (f : α → R) :
    sumList xs f = add (sumList (xs.filter p) f) (sumList (xs.filter (fun x => !p x)) f) := by
  induction xs with
  | nil =>
    simp only [List.filter, sumList]
    exact (add_zero zero).symm
  | cons x rest ih =>
    cases hp : p x with
    | true =>
      simp only [List.filter, hp, Bool.not_true, sumList]
      rw [ih, add_assoc]
    | false =>
      simp only [List.filter, hp, Bool.not_false, sumList]
      rw [ih, ← add_assoc, add_comm (f x) (sumList (rest.filter p) f), add_assoc]

private theorem sumList_eraseOne [DecidableEq α] (a : α) (xs : List α) (f : α → R)
    (hmem : a ∈ xs) :
    sumList xs f = add (f a) (sumList (eraseOne a xs) f) := by
  induction xs with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, sumList]
    if hxa : x = a then
      rw [ite_eq_left hxa, hxa]
    else
      rw [ite_eq_right hxa]
      simp only [sumList]
      cases hmem with
      | head => exact absurd rfl hxa
      | tail _ h' =>
        rw [ih h', ← add_assoc, add_comm (f x) (f a), add_assoc]

private theorem sumList_subset_eq [DecidableEq α] (s₁ s₂ : List α) (f : α → R)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hsub : ∀ x : α, x ∈ s₁ → x ∈ s₂)
    (hvan : ∀ x : α, x ∈ s₂ → x ∉ s₁ → f x = zero) :
    sumList s₁ f = sumList s₂ f := by
  induction h1 generalizing s₂ with
  | nil =>
    simp only [sumList]
    exact (sumList_zero_of_all_zero s₂ f (fun x hx => hvan x hx (fun hm => nomatch hm))).symm
  | @cons a rest hnot _ ih =>
    have ha2 : a ∈ s₂ := hsub a (List.Mem.head rest)
    rw [sumList_eraseOne a s₂ f ha2]
    simp only [sumList]
    apply congrArg (add (f a))
    apply ih (eraseOne a s₂) (isNodup_eraseOne a h2)
    · intro x hx
      refine (mem_eraseOne_iff a x h2).mpr ⟨hsub x (List.Mem.tail a hx), ?_⟩
      intro hxa
      rw [hxa] at hx
      exact hnot hx
    · intro x hx hxnot
      have ⟨hx2, hne⟩ := (mem_eraseOne_iff a x h2).mp hx
      refine hvan x hx2 ?_
      intro hmem
      cases hmem with
      | head => exact hne rfl
      | tail _ h' => exact hxnot h'

private theorem sumList_support_indep [DecidableEq α] (s₁ s₂ : List α) (f : α → R)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hv1 : ∀ x : α, x ∉ s₁ → f x = zero)
    (hv2 : ∀ x : α, x ∉ s₂ → f x = zero) :
    sumList s₁ f = sumList s₂ f := by
  let u := nodupUnion s₁ s₂
  have hu : IsNodup u := isNodup_nodupUnion h1 s₂
  have eq1 : sumList s₁ f = sumList u f :=
    sumList_subset_eq s₁ u f h1 hu
      (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inl hx))
      (fun x _ hx1 => hv1 x hx1)
  have eq2 : sumList s₂ f = sumList u f :=
    sumList_subset_eq s₂ u f h2 hu
      (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inr hx))
      (fun x _ hx2 => hv2 x hx2)
  rw [eq1, eq2]

private theorem sumList_bijection [DecidableEq α] (u : List α) (g gInv : α → α) (f : α → R)
    (hInv1 : ∀ x : α, gInv (g x) = x) (hInv2 : ∀ x : α, g (gInv x) = x)
    (hnd : IsNodup u) (hCl : ∀ x : α, x ∈ u → g x ∈ u) (hClInv : ∀ x : α, x ∈ u → gInv x ∈ u) :
    sumList u (fun x => f (g x)) = sumList u f := by
  rw [← sumList_map u g f]
  have hMapNd : IsNodup (u.map g) :=
    isNodup_map_inj g (fun x y h => by have := congrArg gInv h; rw [hInv1, hInv1] at this; exact this) hnd
  refine sumList_subset_eq (u.map g) u f hMapNd hnd ?_ ?_
  · intro x hx
    obtain ⟨y, hy, hgy⟩ := (mem_map_iff g u x).mp hx
    rw [← hgy]
    exact hCl y hy
  · intro x hx hxnot
    have hIn : x ∈ u.map g := (mem_map_iff g u x).mpr ⟨gInv x, hClInv x hx, hInv2 x⟩
    exact absurd hIn hxnot

/-- Headline Theorem 2 (Exact Support-Independence of Fock Inner Product & Norm):
    for ANY `StarCommRing R`, any discrete configuration space `α`, and any two duplicate-free
    covering supports `s₁, s₂`, the Hermitian inner product `innerOn s ψ φ` and squared norm
    `normSqOn s ψ` are canonically independent of the chosen support list. -/
theorem thm_fock_inner_support_indep [DecidableEq α]
    (s₁ s₂ : List α) (ψ φ : FockVec R α)
    (h1 : SuppIn s₁ ψ) (h2 : SuppIn s₂ ψ) :
    innerOn s₁ ψ φ = innerOn s₂ ψ φ ∧ normSqOn s₁ ψ = normSqOn s₂ ψ := by
  have hInner : ∀ χ : FockVec R α, innerOn s₁ ψ χ = innerOn s₂ ψ χ := by
    intro χ
    refine sumList_support_indep s₁ s₂ (fun c => mul (conj (ψ c)) (χ c)) h1.1 h2.1 ?_ ?_
    · intro c hc
      rw [h1.2 c hc, star_conj_zero, zero_mul]
    · intro c hc
      rw [h2.2 c hc, star_conj_zero, zero_mul]
  exact ⟨hInner φ, hInner ψ⟩

/-- Headline Theorem 3 (Sesquilinearity, Conjugate Symmetry & Basis Ket Orthonormality):
    the exact Fock inner product over any `StarCommRing R` is linear in the second slot,
    conjugate-linear in the first slot, Hermitian conjugate-symmetric, and orthonormal on basis kets. -/
theorem thm_fock_inner_sesquilinear [DecidableEq α]
    (s : List α) (ψ ψ₁ ψ₂ φ φ₁ φ₂ : FockVec R α) (lam : R)
    (a b : α) (hnd : IsNodup s) (ha : a ∈ s) :
    innerOn s ψ (addVec φ₁ φ₂) = add (innerOn s ψ φ₁) (innerOn s ψ φ₂) ∧
    innerOn s ψ (scaleVec lam φ) = mul lam (innerOn s ψ φ) ∧
    innerOn s (addVec ψ₁ ψ₂) φ = add (innerOn s ψ₁ φ) (innerOn s ψ₂ φ) ∧
    innerOn s (scaleVec lam ψ) φ = mul (conj lam) (innerOn s ψ φ) ∧
    conj (innerOn s ψ φ) = innerOn s φ ψ ∧
    innerOn s (ket (R := R) a) (ket (R := R) b) = if a = b then one else zero := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_⟩
  · unfold innerOn addVec
    have hFun : (fun c => mul (conj (ψ c)) (add (φ₁ c) (φ₂ c))) =
        (fun c => add (mul (conj (ψ c)) (φ₁ c)) (mul (conj (ψ c)) (φ₂ c))) := by
      funext c; exact mul_add _ _ _
    rw [hFun, sumList_add]
  · unfold innerOn scaleVec
    have hFun : (fun c => mul (conj (ψ c)) (mul lam (φ c))) =
        (fun c => mul lam (mul (conj (ψ c)) (φ c))) := by
      funext c; rw [← mul_assoc, mul_comm (conj (ψ c)) lam, mul_assoc]
    rw [hFun, sumList_mul_left]
  · unfold innerOn addVec
    have hFun : (fun c => mul (conj (add (ψ₁ c) (ψ₂ c))) (φ c)) =
        (fun c => add (mul (conj (ψ₁ c)) (φ c)) (mul (conj (ψ₂ c)) (φ c))) := by
      funext c; rw [conj_add, add_mul]
    rw [hFun, sumList_add]
  · unfold innerOn scaleVec
    have hFun : (fun c => mul (conj (mul lam (ψ c))) (φ c)) =
        (fun c => mul (conj lam) (mul (conj (ψ c)) (φ c))) := by
      funext c; rw [conj_mul, mul_assoc]
    rw [hFun, sumList_mul_left]
  · unfold innerOn
    rw [sumList_conj]
    apply sumList_congr
    intro c _
    rw [conj_mul, conj_conj, mul_comm]
  · unfold innerOn ket
    rw [sumList_eraseOne a s _ ha]
    have hRest : sumList (eraseOne a s)
        (fun c => mul (conj (if c = a then (one : R) else zero)) (if c = b then one else zero)) = zero := by
      apply sumList_zero_of_all_zero
      intro c hc
      have hne := ((mem_eraseOne_iff a c hnd).mp hc).2
      rw [ite_eq_right hne, star_conj_zero, zero_mul]
    rw [hRest, add_zero, ite_eq_left rfl, conj_one, one_mul]

/-- Exact unitary operator on finite-support Fock space `FockVec R α`. -/
structure FockUnitary (R α : Type) [StarCommRing R] where
  op : FockVec R α → FockVec R α
  dag : FockVec R α → FockVec R α
  leftInv : ∀ ψ : FockVec R α, dag (op ψ) = ψ
  rightInv : ∀ ψ : FockVec R α, op (dag ψ) = ψ
  preservesSupp : ∀ (ψ : FockVec R α) (s : List α), SuppIn s ψ → ∃ s' : List α, SuppIn s' (op ψ)
  preservesDagSupp : ∀ (ψ : FockVec R α) (s : List α), SuppIn s ψ → ∃ s' : List α, SuppIn s' (dag ψ)
  preservesInner : ∀ (ψ φ : FockVec R α) (s s' : List α),
    SuppIn s ψ → SuppIn s φ → SuppIn s' (op ψ) → SuppIn s' (op φ) →
    innerOn s' (op ψ) (op φ) = innerOn s ψ φ

/-- Identity Fock unitary. -/
def FockUnitary.id [DecidableEq α] : FockUnitary R α where
  op := fun ψ => ψ
  dag := fun ψ => ψ
  leftInv := fun _ => rfl
  rightInv := fun _ => rfl
  preservesSupp := fun _ s hs => ⟨s, hs⟩
  preservesDagSupp := fun _ s hs => ⟨s, hs⟩
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => (thm_fock_inner_support_indep s' s ψ φ hs'ψ hsψ).1

/-- Composition `B ∘ A` of two Fock unitaries (with reversed adjoint `(B ∘ A)† = A† ∘ B†`). -/
def FockUnitary.comp [DecidableEq α] (B A : FockUnitary R α) : FockUnitary R α where
  op := fun ψ => B.op (A.op ψ)
  dag := fun ψ => A.dag (B.dag ψ)
  leftInv := fun ψ => by rw [B.leftInv, A.leftInv]
  rightInv := fun ψ => by rw [A.rightInv, B.rightInv]
  preservesSupp := fun ψ s hs => by
    obtain ⟨s₁, hs₁⟩ := A.preservesSupp ψ s hs
    exact B.preservesSupp (A.op ψ) s₁ hs₁
  preservesDagSupp := fun ψ s hs => by
    obtain ⟨s₁, hs₁⟩ := B.preservesDagSupp ψ s hs
    exact A.preservesDagSupp (B.dag ψ) s₁ hs₁
  preservesInner := fun ψ φ s s' hsψ hsφ hs'ψ hs'φ => by
    obtain ⟨s₁, hs₁⟩ := A.preservesSupp ψ s hsψ
    obtain ⟨s₂, hs₂⟩ := A.preservesSupp φ s hsφ
    let sm := nodupUnion s₁ s₂
    have hsmψ : SuppIn sm (A.op ψ) :=
      ⟨isNodup_nodupUnion hs₁.1 s₂, fun c hc => hs₁.2 c (fun h => hc ((mem_nodupUnion s₁ s₂ c).mpr (Or.inl h)))⟩
    have hsmφ : SuppIn sm (A.op φ) :=
      ⟨isNodup_nodupUnion hs₁.1 s₂, fun c hc => hs₂.2 c (fun h => hc ((mem_nodupUnion s₁ s₂ c).mpr (Or.inr h)))⟩
    rw [B.preservesInner (A.op ψ) (A.op φ) sm s' hsmψ hsmφ hs'ψ hs'φ]
    exact A.preservesInner ψ φ s sm hsψ hsφ hsmψ hsmφ

private theorem fockUnitary_comm_dag {A B : FockUnitary R α}
    (h : ∀ ψ, A.op (B.op ψ) = B.op (A.op ψ)) :
    ∀ ψ, A.dag (B.dag ψ) = B.dag (A.dag ψ) := by
  intro ψ
  have h1 : B.op (A.op (A.dag (B.dag ψ))) = B.op (A.op (B.dag (A.dag ψ))) := by
    rw [A.rightInv, B.rightInv, ← h, B.rightInv, A.rightInv]
  have h2 := congrArg (fun x => A.dag (B.dag x)) h1
  rw [B.leftInv, A.leftInv, B.leftInv, A.leftInv] at h2
  exact h2

/-- Pushforward permutation operator `permOp πInv ψ c = ψ (πInv c)`. -/
def permOp (πInv : α → α) (ψ : FockVec R α) : FockVec R α :=
  fun c => ψ (πInv c)

/-- Exact Fock unitarity of ANY bijection `π, πInv : α → α`. -/
def permUnitary [DecidableEq α] (π πInv : α → α)
    (h1 : ∀ c : α, πInv (π c) = c) (h2 : ∀ c : α, π (πInv c) = c) : FockUnitary R α where
  op := permOp πInv
  dag := permOp π
  leftInv := fun ψ => by funext c; unfold permOp; rw [h1]
  rightInv := fun ψ => by funext c; unfold permOp; rw [h2]
  preservesSupp := fun ψ s hs => by
    refine ⟨s.map π, isNodup_map_inj π (fun x y hxy => by
      have := congrArg πInv hxy; rw [h1, h1] at this; exact this) hs.1, ?_⟩
    intro c hc
    unfold permOp
    apply hs.2
    intro hmem
    exact hc ((mem_map_iff π s c).mpr ⟨πInv c, hmem, h2 c⟩)
  preservesDagSupp := fun ψ s hs => by
    refine ⟨s.map πInv, isNodup_map_inj πInv (fun x y hxy => by
      have := congrArg π hxy; rw [h2, h2] at this; exact this) hs.1, ?_⟩
    intro c hc
    unfold permOp
    apply hs.2
    intro hmem
    exact hc ((mem_map_iff πInv s c).mpr ⟨π c, hmem, h1 c⟩)
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    have hMapSupp : SuppIn (s.map π) (permOp πInv ψ) := by
      refine ⟨isNodup_map_inj π (fun x y hxy => by
        have := congrArg πInv hxy; rw [h1, h1] at this; exact this) hsψ.1, ?_⟩
      intro c hc
      unfold permOp
      apply hsψ.2
      intro hmem
      exact hc ((mem_map_iff π s c).mpr ⟨πInv c, hmem, h2 c⟩)
    rw [(thm_fock_inner_support_indep s' (s.map π) (permOp πInv ψ) (permOp πInv φ) hs'ψ hMapSupp).1]
    unfold innerOn permOp
    rw [sumList_map]
    apply sumList_congr
    intro c _
    rw [h1]

/-- Diagonal phase operator `phaseOp phase ψ c = phase c * ψ c`. -/
def phaseOp (phase : α → R) (ψ : FockVec R α) : FockVec R α :=
  fun c => mul (phase c) (ψ c)

/-- Exact Fock unitarity of ANY unit-modulus diagonal phase `∀ c, conj(phase c) * phase c = 1`. -/
def phaseUnitary [DecidableEq α] (phase : α → R)
    (hUnit : ∀ c : α, mul (conj (phase c)) (phase c) = one) : FockUnitary R α where
  op := phaseOp phase
  dag := phaseOp (fun c => conj (phase c))
  leftInv := fun ψ => by
    funext c; unfold phaseOp
    rw [← mul_assoc, hUnit c, one_mul]
  rightInv := fun ψ => by
    funext c; unfold phaseOp
    rw [← mul_assoc, mul_comm (phase c) (conj (phase c)), hUnit c, one_mul]
  preservesSupp := fun ψ s hs => ⟨s, hs.1, fun c hc => by unfold phaseOp; rw [hs.2 c hc, mul_zero]⟩
  preservesDagSupp := fun ψ s hs => ⟨s, hs.1, fun c hc => by unfold phaseOp; rw [hs.2 c hc, mul_zero]⟩
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    have hS : SuppIn s (phaseOp phase ψ) :=
      ⟨hsψ.1, fun c hc => by unfold phaseOp; rw [hsψ.2 c hc, mul_zero]⟩
    rw [(thm_fock_inner_support_indep s' s (phaseOp phase ψ) (phaseOp phase φ) hs'ψ hS).1]
    unfold innerOn phaseOp
    apply sumList_congr
    intro c _
    rw [conj_mul, mul_assoc (conj (phase c)) (conj (ψ c)),
        ← mul_assoc (conj (ψ c)) (phase c) (φ c),
        mul_comm (conj (ψ c)) (phase c),
        mul_assoc (phase c) (conj (ψ c)) (φ c),
        ← mul_assoc (conj (phase c)) (phase c),
        hUnit c, one_mul]

/-- Symmetric involutive `2 × 2` block operator (instantiates half-coin `D` and role-meet `M_meet`). -/
def block2Op (flip : α → α) (act : α → Bool) (a b : R) (ψ : FockVec R α) : FockVec R α :=
  fun c => if act c then add (mul a (ψ c)) (mul b (ψ (flip c))) else ψ c

private theorem block2_expand (a b u v x y : R) :
    mul (conj (add (mul a u) (mul b v))) (add (mul a x) (mul b y)) =
      add (add (mul (mul (conj a) a) (mul (conj u) x))
               (mul (mul (conj b) b) (mul (conj v) y)))
          (add (mul (mul (conj a) b) (mul (conj u) y))
               (mul (mul (conj b) a) (mul (conj v) x))) := by
  rw [conj_add, conj_mul, conj_mul, add_mul, mul_add, mul_add]
  have rearrange : ∀ p q r s : R,
      mul (mul p q) (mul r s) = mul (mul p r) (mul q s) := by
    intro p q r s
    rw [mul_assoc p q (mul r s), ← mul_assoc q r s, mul_comm q r,
        mul_assoc r q s, ← mul_assoc p r (mul q s)]
  rw [rearrange (conj a) (conj u) a x,
      rearrange (conj a) (conj u) b y,
      rearrange (conj b) (conj v) a x,
      rearrange (conj b) (conj v) b y]
  have swap4 : ∀ p q r s : R,
      add (add p q) (add r s) = add (add p s) (add q r) := by
    intro p q r s
    rw [add_assoc p q (add r s), add_comm r s, ← add_assoc q s r, add_comm q s,
        add_assoc s q r, ← add_assoc p s (add q r)]
  exact swap4 _ _ _ _

/-- Exact Fock unitarity of ANY involutive `2 × 2` symmetric block operator. -/
def block2Unitary [DecidableEq α] (flip : α → α) (act : α → Bool) (a b : R)
    (hFlip : ∀ c : α, flip (flip c) = c)
    (hAct : ∀ c : α, act (flip c) = act c)
    (hDiag : add (mul (conj a) a) (mul (conj b) b) = one)
    (hOff : add (mul (conj a) b) (mul (conj b) a) = zero) : FockUnitary R α where
  op := block2Op flip act a b
  dag := block2Op flip act (conj a) (conj b)
  leftInv := fun ψ => by
    funext c; unfold block2Op
    cases ha : act c with
    | false =>
      simp only [ite_bool_false]
    | true =>
      have hfa : act (flip c) = true := by rw [hAct c, ha]
      simp only [ite_bool_true, ite_eq_left hfa, hFlip c]
      rw [mul_add, mul_add, ← mul_assoc, ← mul_assoc, ← mul_assoc, ← mul_assoc]
      have swap4 : ∀ p q r s : R, add (add p q) (add r s) = add (add p s) (add q r) := by
        intro p q r s
        rw [add_assoc p q (add r s), add_comm r s, ← add_assoc q s r, add_comm q s,
            add_assoc s q r, ← add_assoc p s (add q r)]
      rw [swap4, ← add_mul, ← add_mul, hDiag, hOff, one_mul, zero_mul, add_zero]
  rightInv := fun ψ => by
    funext c; unfold block2Op
    cases ha : act c with
    | false =>
      simp only [ite_bool_false]
    | true =>
      have hfa : act (flip c) = true := by rw [hAct c, ha]
      simp only [ite_bool_true, ite_eq_left hfa, hFlip c]
      rw [mul_add, mul_add, ← mul_assoc, ← mul_assoc, ← mul_assoc, ← mul_assoc]
      have hDiag' : add (mul a (conj a)) (mul b (conj b)) = one := by
        rw [mul_comm a (conj a), mul_comm b (conj b), hDiag]
      have hOff' : add (mul a (conj b)) (mul b (conj a)) = zero := by
        rw [mul_comm a (conj b), mul_comm b (conj a), add_comm, hOff]
      have swap4 : ∀ p q r s : R, add (add p q) (add r s) = add (add p s) (add q r) := by
        intro p q r s
        rw [add_assoc p q (add r s), add_comm r s, ← add_assoc q s r, add_comm q s,
            add_assoc s q r, ← add_assoc p s (add q r)]
      rw [swap4, ← add_mul, ← add_mul, hDiag', hOff', one_mul, zero_mul, add_zero]
  preservesSupp := fun ψ s hs => by
    let u := nodupUnion s (s.map flip)
    refine ⟨u, isNodup_nodupUnion hs.1 (s.map flip), ?_⟩
    intro c hc
    have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
    have hc2 : flip c ∉ s := fun h =>
      hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr ((mem_map_iff flip s c).mpr ⟨flip c, h, hFlip c⟩)))
    unfold block2Op
    rw [hs.2 c hc1, hs.2 (flip c) hc2, mul_zero, mul_zero, add_zero]
    cases act c <;> rfl
  preservesDagSupp := fun ψ s hs => by
    let u := nodupUnion s (s.map flip)
    refine ⟨u, isNodup_nodupUnion hs.1 (s.map flip), ?_⟩
    intro c hc
    have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
    have hc2 : flip c ∉ s := fun h =>
      hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr ((mem_map_iff flip s c).mpr ⟨flip c, h, hFlip c⟩)))
    unfold block2Op
    rw [hs.2 c hc1, hs.2 (flip c) hc2, mul_zero, mul_zero, add_zero]
    cases act c <;> rfl
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    let u := nodupUnion s (s.map flip)
    have huNd : IsNodup u := isNodup_nodupUnion hsψ.1 (s.map flip)
    have huClosed : ∀ c : α, c ∈ u → flip c ∈ u := by
      intro c hc
      rcases (mem_nodupUnion s (s.map flip) c).mp hc with h1 | h2
      · exact (mem_nodupUnion s (s.map flip) (flip c)).mpr (Or.inr ((mem_map_iff flip s (flip c)).mpr ⟨c, h1, rfl⟩))
      · obtain ⟨x, hx, hfx⟩ := (mem_map_iff flip s c).mp h2
        rw [← hfx, hFlip x]
        exact (mem_nodupUnion s (s.map flip) x).mpr (Or.inl hx)
    have huψ : SuppIn u ψ :=
      ⟨huNd, fun c hc => hsψ.2 c (fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h)))⟩
    have huOpψ : SuppIn u (block2Op flip act a b ψ) := by
      refine ⟨huNd, fun c hc => ?_⟩
      have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
      have hc2 : flip c ∉ s := fun h =>
        hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr ((mem_map_iff flip s c).mpr ⟨flip c, h, hFlip c⟩)))
      unfold block2Op
      rw [hsψ.2 c hc1, hsψ.2 (flip c) hc2, mul_zero, mul_zero, add_zero]
      cases act c <;> rfl
    rw [(thm_fock_inner_support_indep s' u (block2Op flip act a b ψ) (block2Op flip act a b φ) hs'ψ huOpψ).1]
    rw [← (thm_fock_inner_support_indep u s ψ φ huψ hsψ).1]
    unfold innerOn
    rw [sumList_filter_add u act, sumList_filter_add u act (fun c => mul (conj (ψ c)) (φ c))]
    apply congrArg₂ add
    · let ua := u.filter act
      have huaNd : IsNodup ua := isNodup_filter act huNd
      have huaClosed : ∀ c : α, c ∈ ua → flip c ∈ ua := by
        intro c hc
        have ⟨hcu, hca⟩ := (mem_filter_iff act u c).mp hc
        exact (mem_filter_iff act u (flip c)).mpr ⟨huClosed c hcu, by rw [hAct c, hca]⟩
      have hStep : sumList ua (fun c => mul (conj (block2Op flip act a b ψ c)) (block2Op flip act a b φ c)) =
          sumList ua (fun c =>
            add (add (mul (mul (conj a) a) (mul (conj (ψ c)) (φ c)))
                     (mul (mul (conj b) b) (mul (conj (ψ (flip c))) (φ (flip c)))))
                (add (mul (mul (conj a) b) (mul (conj (ψ c)) (φ (flip c))))
                     (mul (mul (conj b) a) (mul (conj (ψ (flip c))) (φ c))))) := by
        apply sumList_congr
        intro c hc
        have hca : act c = true := ((mem_filter_iff act u c).mp hc).2
        unfold block2Op
        simp only [ite_eq_left hca]
        exact block2_expand a b (ψ c) (ψ (flip c)) (φ c) (φ (flip c))
      rw [hStep, sumList_add, sumList_add, sumList_add,
          sumList_mul_left, sumList_mul_left, sumList_mul_left, sumList_mul_left]
      have hB1 : sumList ua (fun c => mul (conj (ψ (flip c))) (φ (flip c))) =
          sumList ua (fun c => mul (conj (ψ c)) (φ c)) :=
        sumList_bijection ua flip flip (fun c => mul (conj (ψ c)) (φ c)) hFlip hFlip huaNd huaClosed huaClosed
      have hB2 : sumList ua (fun c => mul (conj (ψ (flip c))) (φ c)) =
          sumList ua (fun c => mul (conj (ψ c)) (φ (flip c))) := by
        have hEq : (fun c => mul (conj (ψ (flip c))) (φ c)) =
            (fun c => (fun x => mul (conj (ψ x)) (φ (flip x))) (flip c)) := by
          funext c; rw [hFlip c]
        rw [hEq]
        exact sumList_bijection ua flip flip (fun x => mul (conj (ψ x)) (φ (flip x))) hFlip hFlip huaNd huaClosed huaClosed
      rw [hB1, hB2, ← add_mul, ← add_mul, hDiag, hOff, one_mul, zero_mul, add_zero]
    · apply sumList_congr
      intro c hc
      have hcf : act c = false := by
        have hnot := ((mem_filter_iff (fun x => !act x) u c).mp hc).2
        cases ha : act c with
        | false => rfl
        | true => rw [ha] at hnot; exact Bool.noConfusion hnot
      unfold block2Op
      simp only [hcf, ite_bool_false]

/-- Flat 12-term sum over `Fin 12` in any `StarCommRing R`. -/
def sumFin12 (f : Fin 12 → R) : R :=
  sumList (List.finRange 12) f

private theorem sumList_const (xs : List α) (c : R) :
    sumList xs (fun _ => c) = mul (ofNatR xs.length) c := by
  induction xs with
  | nil => simp only [sumList, List.length_nil, ofNatR, zero_mul]
  | cons _ rest ih =>
    simp only [sumList, List.length_cons, ofNatR]
    rw [ih, add_mul, one_mul, add_comm]

private theorem sumFin12_const (c : R) : sumFin12 (fun _ => c) = mul (ofNatR 12) c := by
  unfold sumFin12
  rw [sumList_const]
  have hLen : (List.finRange 12).length = 12 := by decide
  rw [hLen]

private theorem sumFin12_congr (f g : Fin 12 → R) (h : ∀ m : Fin 12, f m = g m) :
    sumFin12 f = sumFin12 g :=
  sumList_congr (List.finRange 12) f g (fun m _ => h m)

private theorem sumFin12_add (f g : Fin 12 → R) :
    sumFin12 (fun m => add (f m) (g m)) = add (sumFin12 f) (sumFin12 g) :=
  sumList_add (List.finRange 12) f g

private theorem sumFin12_mul_left (c : R) (f : Fin 12 → R) :
    sumFin12 (fun m => mul c (f m)) = mul c (sumFin12 f) :=
  sumList_mul_left (List.finRange 12) c f

private theorem sumFin12_conj (f : Fin 12 → R) :
    conj (sumFin12 f) = sumFin12 (fun m => conj (f m)) :=
  sumList_conj (List.finRange 12) f

private theorem sumList_sumFin12_comm (xs : List α) (f : α → Fin 12 → R) :
    sumList xs (fun c => sumFin12 (f c)) = sumFin12 (fun m => sumList xs (fun c => f c m)) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact (sumList_zero_of_all_zero (List.finRange 12) (fun _ => zero) (fun _ _ => rfl)).symm
  | cons x rest ih =>
    simp only [sumList]
    rw [ih, ← sumFin12_add]

private theorem sumFin12_swap (f : Fin 12 → Fin 12 → R) :
    sumFin12 (fun m₁ => sumFin12 (fun m₂ => f m₁ m₂)) =
      sumFin12 (fun m₂ => sumFin12 (fun m₁ => f m₁ m₂)) :=
  sumList_sumFin12_comm (List.finRange 12) f

private theorem finRange12_nodup : IsNodup (List.finRange 12) :=
  isNodup_of_bool (List.finRange 12) (by decide)

private theorem mem_finRange12 (m : Fin 12) : m ∈ List.finRange 12 := by
  have h12 : List.finRange 12 =
      [⟨0, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨3, by decide⟩,
       ⟨4, by decide⟩, ⟨5, by decide⟩, ⟨6, by decide⟩, ⟨7, by decide⟩,
       ⟨8, by decide⟩, ⟨9, by decide⟩, ⟨10, by decide⟩, ⟨11, by decide⟩] := by decide
  rw [h12]
  match m with
  | ⟨0, _⟩ => exact List.Mem.head _
  | ⟨1, _⟩ => exact List.Mem.tail _ (List.Mem.head _)
  | ⟨2, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))
  | ⟨3, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))
  | ⟨4, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))))
  | ⟨5, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))))
  | ⟨6, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))))))
  | ⟨7, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))))))
  | ⟨8, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))))))))
  | ⟨9, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))))))))
  | ⟨10, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))))))))))
  | ⟨11, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))))))))))

private theorem sumFin12_bijection (g gInv : Fin 12 → Fin 12) (f : Fin 12 → R)
    (h1 : ∀ m, gInv (g m) = m) (h2 : ∀ m, g (gInv m) = m) :
    sumFin12 (fun m => f (g m)) = sumFin12 f :=
  sumList_bijection (List.finRange 12) g gInv f h1 h2 finRange12_nodup
    (fun m _ => mem_finRange12 (g m)) (fun m _ => mem_finRange12 (gInv m))

private def addMod12 (a b : Fin 12) : Fin 12 :=
  ⟨(a.val + b.val) % 12, Nat.mod_lt _ (by decide)⟩

private def subMod12 (a b : Fin 12) : Fin 12 :=
  ⟨(a.val + (12 - b.val)) % 12, Nat.mod_lt _ (by decide)⟩

private theorem addMod12_subMod12 : ∀ a b : Fin 12, subMod12 (addMod12 a b) b = a := by decide
private theorem subMod12_addMod12 : ∀ a b : Fin 12, addMod12 (subMod12 a b) b = a := by decide

/-- 12-state isotropic orbit-mixing operator `I + ((u - 1) / 12) J` (instantiates `M_pair(ζ_18)`). -/
def block12Op (act : α → Bool) (moveTo : Fin 12 → α → α) (u inv12 : R)
    (ψ : FockVec R α) : FockVec R α :=
  fun c =>
    if act c then
      add (ψ c) (mul (mul (sub u one) inv12) (sumFin12 (fun m => ψ (moveTo m c))))
    else ψ c

private theorem block12_comp
    (act : α → Bool) (moveTo : Fin 12 → α → α) (inv12 v₁ v₂ : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (h12 : mul (ofNatR 12) inv12 = one)
    (ψ : FockVec R α) (c : α) :
    block12Op act moveTo v₂ inv12 (block12Op act moveTo v₁ inv12 ψ) c =
      block12Op act moveTo (mul v₂ v₁) inv12 ψ c := by
  unfold block12Op
  cases ha : act c with
  | false => rw [ite_bool_false, ite_bool_false]
  | true =>
    rw [ite_bool_true, ite_bool_true]
    have hS1 : sumFin12 (fun m =>
          if act (moveTo m c) then
            add (ψ (moveTo m c)) (mul (mul (sub v₁ one) inv12) (sumFin12 (fun m' => ψ (moveTo m' (moveTo m c)))))
          else ψ (moveTo m c)) =
        mul v₁ (sumFin12 (fun m => ψ (moveTo m c))) := by
      have hEq : (fun m =>
          if act (moveTo m c) then
            add (ψ (moveTo m c)) (mul (mul (sub v₁ one) inv12) (sumFin12 (fun m' => ψ (moveTo m' (moveTo m c)))))
          else ψ (moveTo m c)) =
        (fun m => add (ψ (moveTo m c)) (mul (mul (sub v₁ one) inv12) (sumFin12 (fun m' => ψ (moveTo m' c))))) := by
        funext m
        rw [ite_eq_left (hActMove m c ha)]
        apply congrArg (add (ψ (moveTo m c)))
        apply congrArg (mul (mul (sub v₁ one) inv12))
        apply sumFin12_congr
        intro m'
        rw [hMoveMove m' m c ha]
      rw [hEq, sumFin12_add, sumFin12_const]
      let S := sumFin12 (fun m => ψ (moveTo m c))
      have h12c : mul (ofNatR 12) (mul (mul (sub v₁ one) inv12) S) = mul (sub v₁ one) S := by
        rw [← mul_assoc (ofNatR 12), ← mul_assoc (ofNatR 12),
            mul_comm (ofNatR 12) (sub v₁ one), mul_assoc (sub v₁ one), h12, mul_one]
      rw [h12c]
      calc add S (mul (sub v₁ one) S)
          = add (mul one S) (mul (sub v₁ one) S) := by rw [one_mul]
        _ = mul (add one (sub v₁ one)) S := by rw [← add_mul]
        _ = mul v₁ S := by rw [add_sub_cancel]
    rw [hS1, add_assoc]
    apply congrArg (add (ψ c))
    let S := sumFin12 (fun m => ψ (moveTo m c))
    have hCoef : add (mul (mul (sub v₁ one) inv12) S) (mul (mul (sub v₂ one) inv12) (mul v₁ S)) =
        mul (mul (sub (mul v₂ v₁) one) inv12) S := by
      rw [← mul_assoc (mul (sub v₂ one) inv12) v₁ S, ← add_mul]
      apply congrArg (fun z => mul z S)
      rw [mul_assoc (sub v₂ one) inv12 v₁, mul_comm inv12 v₁, ← mul_assoc (sub v₂ one) v₁ inv12,
          ← add_mul, unit_compose_identity]
    exact hCoef

private theorem block12_one (act : α → Bool) (moveTo : Fin 12 → α → α) (inv12 : R)
    (ψ : FockVec R α) : block12Op act moveTo one inv12 ψ = ψ := by
  funext c; unfold block12Op
  rw [sub_self, zero_mul, zero_mul, add_zero]
  cases act c <;> rfl

private theorem block12_expand_supp [DecidableEq α]
    (act : α → Bool) (curLine : α → Fin 12) (moveTo : Fin 12 → α → α) (inv12 v : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (hMoveCur : ∀ (c : α), act c = true → moveTo (curLine c) c = c)
    (ψ : FockVec R α) (s : List α) (hs : SuppIn s ψ) :
    ∃ s' : List α, SuppIn s' (block12Op act moveTo v inv12 ψ) := by
  let uL := dedupList (s ++ flatMapList (fun c => (List.finRange 12).map (fun m => if act c then moveTo m c else c)) s)
  refine ⟨uL, isNodup_dedupList _, ?_⟩
  intro c hc
  have hcNotS : c ∉ s := fun h =>
    hc ((mem_dedupList _ c).mpr ((mem_append_iff _ _ c).mpr (Or.inl h)))
  unfold block12Op
  cases ha : act c with
  | false => rw [ite_bool_false]; exact hs.2 c hcNotS
  | true =>
    rw [ite_bool_true, hs.2 c hcNotS, zero_add]
    have hS0 : sumFin12 (fun m => ψ (moveTo m c)) = zero := by
      apply sumList_zero_of_all_zero
      intro m _
      apply hs.2
      intro hmS
      have hMoveBack : moveTo (curLine c) (moveTo m c) = c := by
        rw [hMoveMove _ _ c ha, hMoveCur c ha]
      have hInFM : c ∈ flatMapList (fun x => (List.finRange 12).map (fun k => if act x then moveTo k x else x)) s := by
        refine (mem_flatMapList_iff _ s c).mpr ⟨moveTo m c, hmS, ?_⟩
        refine (mem_map_iff _ (List.finRange 12) c).mpr ⟨curLine c, mem_finRange12 (curLine c), ?_⟩
        rw [ite_eq_left (hActMove m c ha), hMoveBack]
      exact hc ((mem_dedupList _ c).mpr ((mem_append_iff _ _ c).mpr (Or.inr hInFM)))
    rw [hS0, mul_zero]

/-- Exact Fock unitarity of ANY 12-orbit mixer `block12Op` whenever `12 * inv12 = 1`, `conj inv12 = inv12`,
    and `conj u * u = 1`. -/
def block12Unitary [DecidableEq α]
    (act : α → Bool) (curLine : α → Fin 12) (moveTo : Fin 12 → α → α) (u inv12 : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (hMoveCur : ∀ (c : α), act c = true → moveTo (curLine c) c = c)
    (hCurMove : ∀ (m : Fin 12) (c : α), act c = true → curLine (moveTo m c) = m)
    (h12 : mul (ofNatR 12) inv12 = one)
    (hInvConj : conj inv12 = inv12)
    (hUnit : mul (conj u) u = one) : FockUnitary R α where
  op := block12Op act moveTo u inv12
  dag := block12Op act moveTo (conj u) inv12
  leftInv := fun ψ => by
    funext c
    rw [block12_comp act moveTo inv12 u (conj u) hActMove hMoveMove h12 ψ c, hUnit, block12_one]
  rightInv := fun ψ => by
    funext c
    rw [block12_comp act moveTo inv12 (conj u) u hActMove hMoveMove h12 ψ c,
        mul_comm u (conj u), hUnit, block12_one]
  preservesSupp := block12_expand_supp act curLine moveTo inv12 u hActMove hMoveMove hMoveCur
  preservesDagSupp := block12_expand_supp act curLine moveTo inv12 (conj u) hActMove hMoveMove hMoveCur
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    let rot : Fin 12 → α → α := fun k c => if act c then moveTo (addMod12 (curLine c) k) c else c
    let rotInv : Fin 12 → α → α := fun k c => if act c then moveTo (subMod12 (curLine c) k) c else c
    have hRotInv1 : ∀ (k : Fin 12) (c : α), rotInv k (rot k c) = c := by
      intro k c
      change (if act (if act c then moveTo (addMod12 (curLine c) k) c else c) then
        moveTo (subMod12 (curLine (if act c then moveTo (addMod12 (curLine c) k) c else c)) k)
          (if act c then moveTo (addMod12 (curLine c) k) c else c)
        else (if act c then moveTo (addMod12 (curLine c) k) c else c)) = c
      cases ha : act c with
      | false => rw [ite_bool_false, ha, ite_bool_false]
      | true =>
        have hm := hActMove (addMod12 (curLine c) k) c ha
        rw [ite_bool_true, ite_eq_left hm, hCurMove _ c ha, addMod12_subMod12, hMoveMove _ _ c ha, hMoveCur c ha]
    have hRotInv2 : ∀ (k : Fin 12) (c : α), rot k (rotInv k c) = c := by
      intro k c
      change (if act (if act c then moveTo (subMod12 (curLine c) k) c else c) then
        moveTo (addMod12 (curLine (if act c then moveTo (subMod12 (curLine c) k) c else c)) k)
          (if act c then moveTo (subMod12 (curLine c) k) c else c)
        else (if act c then moveTo (subMod12 (curLine c) k) c else c)) = c
      cases ha : act c with
      | false => rw [ite_bool_false, ha, ite_bool_false]
      | true =>
        have hm := hActMove (subMod12 (curLine c) k) c ha
        rw [ite_bool_true, ite_eq_left hm, hCurMove _ c ha, subMod12_addMod12, hMoveMove _ _ c ha, hMoveCur c ha]
    let uL := dedupList (s ++ flatMapList (fun c => (List.finRange 12).map (fun m => if act c then moveTo m c else c)) s)
    have huNd : IsNodup uL := isNodup_dedupList _
    have huClosedMove : ∀ (c : α) (m : Fin 12), c ∈ uL → act c = true → moveTo m c ∈ uL := by
      intro c m hc hca
      have hMem := (mem_append_iff _ _ c).mp ((mem_dedupList _ c).mp hc)
      refine (mem_dedupList _ _).mpr ((mem_append_iff _ _ _).mpr (Or.inr ?_))
      rcases hMem with hS | hFM
      · refine (mem_flatMapList_iff _ s _).mpr ⟨c, hS, (mem_map_iff _ _ _).mpr ⟨m, mem_finRange12 m, ?_⟩⟩
        rw [ite_eq_left hca]
      · obtain ⟨x, hxS, hmx⟩ := (mem_flatMapList_iff _ s c).mp hFM
        obtain ⟨k, _, hkx⟩ := (mem_map_iff _ _ c).mp hmx
        cases hxa : act x with
        | false =>
          rw [hxa, ite_bool_false] at hkx
          rw [← hkx, hxa] at hca
          exact Bool.noConfusion hca
        | true =>
          rw [ite_eq_left hxa] at hkx
          refine (mem_flatMapList_iff _ s _).mpr ⟨x, hxS, (mem_map_iff _ _ _).mpr ⟨m, mem_finRange12 m, ?_⟩⟩
          rw [ite_eq_left hxa, ← hkx, hMoveMove m k x hxa]
    have huψ : SuppIn uL ψ :=
      ⟨huNd, fun c hc => hsψ.2 c (fun h => hc ((mem_dedupList _ c).mpr ((mem_append_iff _ _ c).mpr (Or.inl h))))⟩
    have huOpψ : SuppIn uL (block12Op act moveTo u inv12 ψ) := by
      refine ⟨huNd, fun c hc => ?_⟩
      have hcNotS : c ∉ s := fun h => hc ((mem_dedupList _ c).mpr ((mem_append_iff _ _ c).mpr (Or.inl h)))
      unfold block12Op
      cases ha : act c with
      | false => rw [ite_bool_false]; exact hsψ.2 c hcNotS
      | true =>
        rw [ite_bool_true, hsψ.2 c hcNotS, zero_add]
        have hS0 : sumFin12 (fun m => ψ (moveTo m c)) = zero := by
          apply sumList_zero_of_all_zero
          intro m _
          apply hsψ.2
          intro hmS
          have hInU : moveTo m c ∈ uL := (mem_dedupList _ _).mpr ((mem_append_iff _ _ _).mpr (Or.inl hmS))
          have hBack : moveTo (curLine c) (moveTo m c) ∈ uL := huClosedMove _ (curLine c) hInU (hActMove m c ha)
          rw [hMoveMove _ _ c ha, hMoveCur c ha] at hBack
          exact hc hBack
        rw [hS0, mul_zero]
    rw [(thm_fock_inner_support_indep s' uL _ _ hs'ψ huOpψ).1]
    rw [← (thm_fock_inner_support_indep uL s ψ φ huψ hsψ).1]
    unfold innerOn
    rw [sumList_filter_add uL act, sumList_filter_add uL act (fun c => mul (conj (ψ c)) (φ c))]
    apply congrArg₂ add
    · let ua := uL.filter act
      have huaNd : IsNodup ua := isNodup_filter act huNd
      have huaRotCl : ∀ (k : Fin 12) (c : α), c ∈ ua → rot k c ∈ ua := by
        intro k c hc
        have ⟨hcu, hca⟩ := (mem_filter_iff act uL c).mp hc
        exact (mem_filter_iff act uL _).mpr
          ⟨by change (if act c then moveTo (addMod12 (curLine c) k) c else c) ∈ uL; rw [ite_eq_left hca]; exact huClosedMove c _ hcu hca,
           by change act (if act c then moveTo (addMod12 (curLine c) k) c else c) = true; rw [ite_eq_left hca]; exact hActMove _ c hca⟩
      have huaRotInvCl : ∀ (k : Fin 12) (c : α), c ∈ ua → rotInv k c ∈ ua := by
        intro k c hc
        have ⟨hcu, hca⟩ := (mem_filter_iff act uL c).mp hc
        exact (mem_filter_iff act uL _).mpr
          ⟨by change (if act c then moveTo (subMod12 (curLine c) k) c else c) ∈ uL; rw [ite_eq_left hca]; exact huClosedMove c _ hcu hca,
           by change act (if act c then moveTo (subMod12 (curLine c) k) c else c) = true; rw [ite_eq_left hca]; exact hActMove _ c hca⟩
      let hop := mul (sub u one) inv12
      let Sψ : α → R := fun c => sumFin12 (fun m => ψ (moveTo m c))
      let Sφ : α → R := fun c => sumFin12 (fun m => φ (moveTo m c))
      have hRotS : ∀ (χ : FockVec R α) (c : α), act c = true →
          sumFin12 (fun k => χ (rot k c)) = sumFin12 (fun m => χ (moveTo m c)) := by
        intro χ c hca
        have hEq : (fun k => χ (rot k c)) = (fun k => (fun m => χ (moveTo m c)) (addMod12 (curLine c) k)) := by
          funext k
          change χ (if act c then moveTo (addMod12 (curLine c) k) c else c) = _
          rw [ite_eq_left hca]
        rw [hEq]
        exact sumFin12_bijection (addMod12 (curLine c)) (fun m => subMod12 m (curLine c)) _
          (fun k => by
            have : ∀ a b : Fin 12, subMod12 (addMod12 a b) a = b := by decide
            exact this (curLine c) k)
          (fun m => by
            have : ∀ a b : Fin 12, addMod12 a (subMod12 b a) = b := by decide
            exact this (curLine c) m)
      have hSInv : ∀ (χ : FockVec R α) (k : Fin 12) (c : α), act c = true →
          sumFin12 (fun m => χ (moveTo m (rot k c))) = sumFin12 (fun m => χ (moveTo m c)) := by
        intro χ k c hca
        apply sumFin12_congr
        intro m
        change χ (moveTo m (if act c then moveTo (addMod12 (curLine c) k) c else c)) = _
        rw [ite_eq_left hca, hMoveMove m _ c hca]
      have hCross1 : sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)) =
          mul (ofNatR 12) (sumList ua (fun c => mul (conj (ψ c)) (Sφ c))) := by
        have h1 : sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)) =
            sumList ua (fun c => sumFin12 (fun k => mul (conj (ψ (rot k c))) (Sφ (rot k c)))) := by
          apply sumList_congr
          intro c hc
          have hca := ((mem_filter_iff act uL c).mp hc).2
          have hSψc : Sψ c = sumFin12 (fun k => ψ (rot k c)) := (hRotS ψ c hca).symm
          rw [hSψc, sumFin12_conj]
          have hMulR : mul (sumFin12 (fun k => conj (ψ (rot k c)))) (Sφ c) =
              sumFin12 (fun k => mul (conj (ψ (rot k c))) (Sφ c)) := by
            rw [mul_comm, ← sumFin12_mul_left]
            apply sumFin12_congr; intro k; exact mul_comm _ _
          rw [hMulR]
          apply sumFin12_congr; intro k
          exact congrArg (mul (conj (ψ (rot k c)))) (hSInv φ k c hca).symm
        rw [h1, sumList_sumFin12_comm]
        have h2 : sumFin12 (fun k => sumList ua (fun c => mul (conj (ψ (rot k c))) (Sφ (rot k c)))) =
            sumFin12 (fun _ => sumList ua (fun c => mul (conj (ψ c)) (Sφ c))) := by
          apply sumFin12_congr; intro k
          exact sumList_bijection ua (rot k) (rotInv k) (fun c => mul (conj (ψ c)) (Sφ c))
            (hRotInv1 k) (hRotInv2 k) huaNd (huaRotCl k) (huaRotInvCl k)
        rw [h2, sumFin12_const]
      have hCross2 : sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)) =
          mul (ofNatR 12) (sumList ua (fun c => mul (conj (Sψ c)) (φ c))) := by
        have h1 : sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)) =
            sumList ua (fun c => sumFin12 (fun k => mul (conj (Sψ (rot k c))) (φ (rot k c)))) := by
          apply sumList_congr
          intro c hc
          have hca := ((mem_filter_iff act uL c).mp hc).2
          have hSφc : Sφ c = sumFin12 (fun k => φ (rot k c)) := (hRotS φ c hca).symm
          rw [hSφc, ← sumFin12_mul_left]
          apply sumFin12_congr; intro k
          exact congrArg (fun z => mul (conj z) (φ (rot k c))) (hSInv ψ k c hca).symm
        rw [h1, sumList_sumFin12_comm]
        have h2 : sumFin12 (fun k => sumList ua (fun c => mul (conj (Sψ (rot k c))) (φ (rot k c)))) =
            sumFin12 (fun _ => sumList ua (fun c => mul (conj (Sψ c)) (φ c))) := by
          apply sumFin12_congr; intro k
          exact sumList_bijection ua (rot k) (rotInv k) (fun c => mul (conj (Sψ c)) (φ c))
            (hRotInv1 k) (hRotInv2 k) huaNd (huaRotCl k) (huaRotInvCl k)
        rw [h2, sumFin12_const]
      have hC1 : sumList ua (fun c => mul (conj (ψ c)) (Sφ c)) =
          mul inv12 (sumList ua (fun c => mul (conj (Sψ c)) (Sφ c))) := by
        rw [hCross1, ← mul_assoc, mul_comm inv12 (ofNatR 12), h12, one_mul]
      have hC2 : sumList ua (fun c => mul (conj (Sψ c)) (φ c)) =
          mul inv12 (sumList ua (fun c => mul (conj (Sψ c)) (Sφ c))) := by
        rw [hCross2, ← mul_assoc, mul_comm inv12 (ofNatR 12), h12, one_mul]
      have hExpand : sumList ua (fun c =>
          mul (conj (block12Op act moveTo u inv12 ψ c)) (block12Op act moveTo u inv12 φ c)) =
        add (sumList ua (fun c => mul (conj (ψ c)) (φ c)))
          (add (mul hop (sumList ua (fun c => mul (conj (ψ c)) (Sφ c))))
               (add (mul (conj hop) (sumList ua (fun c => mul (conj (Sψ c)) (φ c))))
                    (mul (mul (conj hop) hop) (sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)))))) := by
        have hTerm : sumList ua (fun c =>
              mul (conj (block12Op act moveTo u inv12 ψ c)) (block12Op act moveTo u inv12 φ c)) =
            sumList ua (fun c =>
              add (mul (conj (ψ c)) (φ c))
                (add (mul hop (mul (conj (ψ c)) (Sφ c)))
                     (add (mul (conj hop) (mul (conj (Sψ c)) (φ c)))
                          (mul (mul (conj hop) hop) (mul (conj (Sψ c)) (Sφ c)))))) := by
          apply sumList_congr
          intro c hc
          have hca := ((mem_filter_iff act uL c).mp hc).2
          unfold block12Op
          simp only [ite_eq_left hca]
          change mul (conj (add (ψ c) (mul hop (Sψ c)))) (add (φ c) (mul hop (Sφ c))) = _
          rw [conj_add, conj_mul, add_mul, mul_add, mul_add, add_assoc]
          apply congrArg (add (mul (conj (ψ c)) (φ c)))
          have t1 : mul (conj (ψ c)) (mul hop (Sφ c)) = mul hop (mul (conj (ψ c)) (Sφ c)) := by
            rw [← mul_assoc, mul_comm (conj (ψ c)) hop, mul_assoc]
          have t2 : mul (mul (conj hop) (conj (Sψ c))) (φ c) = mul (conj hop) (mul (conj (Sψ c)) (φ c)) :=
            mul_assoc _ _ _
          have t3 : mul (mul (conj hop) (conj (Sψ c))) (mul hop (Sφ c)) =
              mul (mul (conj hop) hop) (mul (conj (Sψ c)) (Sφ c)) := by
            rw [mul_assoc (conj hop) (conj (Sψ c)), ← mul_assoc (conj (Sψ c)) hop (Sφ c),
                mul_comm (conj (Sψ c)) hop, mul_assoc hop (conj (Sψ c)) (Sφ c),
                ← mul_assoc (conj hop) hop]
          rw [t1, t2, t3]
        rw [hTerm, sumList_add, sumList_add, sumList_add,
            sumList_mul_left, sumList_mul_left, sumList_mul_left]
      rw [hExpand, hC1, hC2, ← mul_assoc, ← mul_assoc, ← add_mul, ← add_mul]
      have hVanish : add (mul hop inv12) (add (mul (conj hop) inv12) (mul (conj hop) hop)) = zero := by
        have hConjHop : conj hop = mul (sub (conj u) one) inv12 := by
          change conj (mul (sub u one) inv12) = _
          rw [conj_mul, hInvConj]
          unfold sub
          rw [conj_add, star_conj_neg, conj_one]
        have hFactor : add (mul hop inv12) (add (mul (conj hop) inv12) (mul (conj hop) hop)) =
            mul (add (sub u one) (add (sub (conj u) one) (mul (sub (conj u) one) (sub u one))))
                (mul inv12 inv12) := by
          have a1 : mul hop inv12 = mul (sub u one) (mul inv12 inv12) := mul_assoc _ _ _
          have a2 : mul (conj hop) inv12 = mul (sub (conj u) one) (mul inv12 inv12) := by
            rw [hConjHop, mul_assoc]
          have a3 : mul (conj hop) hop = mul (mul (sub (conj u) one) (sub u one)) (mul inv12 inv12) := by
            rw [hConjHop]
            change mul (mul (sub (conj u) one) inv12) (mul (sub u one) inv12) = _
            rw [mul_assoc (sub (conj u) one) inv12, ← mul_assoc inv12 (sub u one) inv12,
                mul_comm inv12 (sub u one), mul_assoc (sub u one) inv12 inv12,
                ← mul_assoc (sub (conj u) one) (sub u one)]
          rw [a1, a2, a3, ← add_mul, ← add_mul]
        rw [hFactor]
        have hMid : add (sub u one) (add (sub (conj u) one) (mul (sub (conj u) one) (sub u one))) = zero := by
          have hSubMul : mul (sub (conj u) one) (sub u one) =
              sub (mul (sub (conj u) one) u) (sub (conj u) one) := by
            unfold sub
            rw [mul_add, star_mul_neg, mul_one]
          rw [hSubMul, add_sub_cancel, unit_compose_identity, hUnit, sub_self]
        rw [hMid, zero_mul]
      rw [hVanish, zero_mul, add_zero]
    · apply sumList_congr
      intro c hc
      have hcf : act c = false := by
        have hnot := ((mem_filter_iff (fun x => !act x) uL c).mp hc).2
        cases ha : act c with
        | false => rfl
        | true => rw [ha] at hnot; exact Bool.noConfusion hnot
      unfold block12Op
      rw [hcf, ite_bool_false]

/-- Headline Theorem 4 (Universal Fock Unitary Constructors):
    over ANY `StarCommRing R` and discrete configuration space `α`, bijections (`permUnitary`),
    unit-modulus diagonal phases (`phaseUnitary`), involutive `2 × 2` blocks (`block2Unitary`),
    and 12-orbit mixers (`block12Unitary`) are exact norm-preserving, inner-product-preserving,
    reversible Fock-space unitaries. -/
theorem thm_fock_elementary_unitaries [DecidableEq α]
    (π πInv : α → α) (hπ1 : ∀ c, πInv (π c) = c) (hπ2 : ∀ c, π (πInv c) = c)
    (phase : α → R) (hPhase : ∀ c, mul (conj (phase c)) (phase c) = one)
    (flip : α → α) (act2 : α → Bool) (a b : R)
    (hFlip : ∀ c, flip (flip c) = c) (hAct2 : ∀ c, act2 (flip c) = act2 c)
    (hDiag : add (mul (conj a) a) (mul (conj b) b) = one)
    (hOff : add (mul (conj a) b) (mul (conj b) a) = zero) :
    (∀ ψ, (permUnitary (R := R) π πInv hπ1 hπ2).dag ((permUnitary (R := R) π πInv hπ1 hπ2).op ψ) = ψ) ∧
    (∀ ψ, (phaseUnitary phase hPhase).dag ((phaseUnitary phase hPhase).op ψ) = ψ) ∧
    (∀ ψ, (block2Unitary flip act2 a b hFlip hAct2 hDiag hOff).dag
          ((block2Unitary flip act2 a b hFlip hAct2 hDiag hOff).op ψ) = ψ) :=
  ⟨(permUnitary (R := R) π πInv hπ1 hπ2).leftInv,
   (phaseUnitary phase hPhase).leftInv,
   (block2Unitary flip act2 a b hFlip hAct2 hDiag hOff).leftInv⟩

/-- Headline Theorem 5 (All-Time Iterated Fock Unitarity `∀ t : Nat`):
    for EVERY `FockUnitary U` over any `StarCommRing R`, iterating `U` for any `t : Nat` beats
    preserves exact reversibility, finite support, Hermitian inner products, and squared norms. -/
theorem thm_fock_unitary_iter_all_time [DecidableEq α] (U : FockUnitary R α) :
    ∀ t : Nat,
      (∀ ψ : FockVec R α, iter U.dag t (iter U.op t ψ) = ψ) ∧
      (∀ ψ : FockVec R α, iter U.op t (iter U.dag t ψ) = ψ) ∧
      (∀ (ψ : FockVec R α) (s : List α), SuppIn s ψ → ∃ s' : List α, SuppIn s' (iter U.op t ψ)) ∧
      (∀ (ψ φ : FockVec R α) (s s' : List α),
        SuppIn s ψ → SuppIn s φ → SuppIn s' (iter U.op t ψ) → SuppIn s' (iter U.op t φ) →
        innerOn s' (iter U.op t ψ) (iter U.op t φ) = innerOn s ψ φ ∧
        normSqOn s' (iter U.op t ψ) = normSqOn s ψ) := by
  intro t
  induction t with
  | zero =>
    refine ⟨fun _ => rfl, fun _ => rfl, fun _ s hs => ⟨s, hs⟩, ?_⟩
    intro ψ φ s s' hsψ _ hs'ψ _
    exact thm_fock_inner_support_indep s' s ψ φ hs'ψ hsψ
  | succ k ih =>
    obtain ⟨ihL, ihR, ihS, ihIn⟩ := ih
    refine ⟨?_, ?_, ?_, ?_⟩
    · intro ψ
      simp only [iter]
      rw [← iter_comm U.dag k (U.op (iter U.op k ψ)), U.leftInv, ihL ψ]
    · intro ψ
      simp only [iter]
      rw [← iter_comm U.op k (U.dag (iter U.dag k ψ)), U.rightInv, ihR ψ]
    · intro ψ s hs
      obtain ⟨sk, hsk⟩ := ihS ψ s hs
      exact U.preservesSupp (iter U.op k ψ) sk hsk
    · intro ψ φ s s' hsψ hsφ hs'ψ hs'φ
      obtain ⟨s1, hs1⟩ := ihS ψ s hsψ
      obtain ⟨s2, hs2⟩ := ihS φ s hsφ
      let sm := nodupUnion s1 s2
      have hsmψ : SuppIn sm (iter U.op k ψ) :=
        ⟨isNodup_nodupUnion hs1.1 s2, fun c hc => hs1.2 c (fun h => hc ((mem_nodupUnion s1 s2 c).mpr (Or.inl h)))⟩
      have hsmφ : SuppIn sm (iter U.op k φ) :=
        ⟨isNodup_nodupUnion hs1.1 s2, fun c hc => hs2.2 c (fun h => hc ((mem_nodupUnion s1 s2 c).mpr (Or.inr h)))⟩
      have hInner : innerOn s' (iter U.op (k + 1) ψ) (iter U.op (k + 1) φ) = innerOn s ψ φ := by
        simp only [iter]
        rw [U.preservesInner (iter U.op k ψ) (iter U.op k φ) sm s' hsmψ hsmφ hs'ψ hs'φ]
        exact (ihIn ψ φ s sm hsψ hsφ hsmψ hsmφ).1
      have hNorm : normSqOn s' (iter U.op (k + 1) ψ) = normSqOn s ψ := by
        unfold normSqOn
        simp only [iter]
        rw [U.preservesInner (iter U.op k ψ) (iter U.op k ψ) sm s' hsmψ hsmψ hs'ψ hs'ψ]
        exact (ihIn ψ ψ s sm hsψ hsψ hsmψ hsmψ).2
      exact ⟨hInner, hNorm⟩

end FockSpace


/-! ## Section 3: 24-Slot Line Geometry, Coxeter Parity `M_P = simpleRefl 0`, & Infinite `HoneycombConfig` -/

/-- Nonzero excitation sign `{-1, +1}`, embedding into `Vibe.Tone`. -/
inductive Sign where
  | neg
  | pos
  deriving DecidableEq, Repr

def Sign.dual : Sign → Sign
  | .neg => .pos
  | .pos => .neg

def Sign.toTone : Sign → Tone
  | .neg => .neg
  | .pos => .pos

def Sign.value : Sign → Int
  | .neg => -1
  | .pos => 1

/-- Full single-slot Fock occupation state: empty (neutral vacuum `0`) or `(sign, role)`. -/
inductive SlotState where
  | empty
  | occ (s : Sign) (r : Bool)
  deriving DecidableEq, Repr

def SlotState.tone : SlotState → Tone
  | .empty => .zero
  | .occ s _ => s.toTone

def SlotState.charge : SlotState → Int
  | .empty => 0
  | .occ s _ => s.value

def SlotState.dual : SlotState → SlotState
  | .empty => .empty
  | .occ s r => .occ s.dual r

private theorem slotState_dual_dual (x : SlotState) : x.dual.dual = x := by
  cases x with
  | empty => rfl
  | occ s r => cases s <;> rfl

/-- Constructive `DecidableEq (Fin n → α)` for any `[DecidableEq α]`. -/
private def decEqFinAux {α : Type} [DecidableEq α] :
    (n : Nat) → (f g : Fin n → α) → Decidable (∀ i : Fin n, f i = g i)
  | 0, _, _ => isTrue (fun i => absurd i.isLt (Nat.not_lt_zero i.val))
  | n + 1, f, g =>
    match decEqFinAux n (fun i => f ⟨i.val, Nat.lt_succ_of_lt i.isLt⟩)
                        (fun i => g ⟨i.val, Nat.lt_succ_of_lt i.isLt⟩) with
    | isFalse hne =>
      isFalse (fun hall => hne (fun i => hall ⟨i.val, Nat.lt_succ_of_lt i.isLt⟩))
    | isTrue hprev =>
      if hlast : f ⟨n, Nat.lt_succ_self n⟩ = g ⟨n, Nat.lt_succ_self n⟩ then
        isTrue (fun i => by
          if hlt : i.val < n then
            exact hprev ⟨i.val, hlt⟩
          else
            have heq : i = ⟨n, Nat.lt_succ_self n⟩ := Fin.ext (by have := i.isLt; omega)
            rw [heq]; exact hlast)
      else
        isFalse (fun hall => hlast (hall ⟨n, Nat.lt_succ_self n⟩))

private def decEqFin {n : Nat} {α : Type} [DecidableEq α] (f g : Fin n → α) : Decidable (f = g) :=
  match decEqFinAux n f g with
  | isTrue h => isTrue (funext h)
  | isFalse h => isFalse (fun heq => h (fun i => congrFun heq i))

instance : DecidableEq Vec5 := fun u v => decEqFin u v
instance : DecidableEq Mat5 := fun A B => decEqFin A B

/-- Full 24-slot quantum dock state `Fin 24 → SlotState` extending `Vibe.DockState`. -/
abbrev FullDock := Fin 24 → SlotState

instance : DecidableEq FullDock := fun d₁ d₂ => decEqFin d₁ d₂
instance : DecidableEq DockState := fun d₁ d₂ => decEqFin d₁ d₂

/-- Calm vacuum dock `v1FullDock`: all 24 slots empty. -/
def v1FullDock : FullDock := fun _ => .empty

/-- Projection from `FullDock` to `Vibe.Tone.DockState`. -/
def fullDockToDockState (d : FullDock) : DockState := fun i => (d i).tone

/-- Exact integer charge of a 24-slot `FullDock` (equals `dockCharge (fullDockToDockState d)`). -/
def fullDockCharge (d : FullDock) : Int :=
  (List.finRange 24).foldl (fun acc i => acc + (d i).charge) 0

/-- Slotwise charge conjugation `C` on a `FullDock`. -/
def conjFullDock (d : FullDock) : FullDock := fun i => (d i).dual

/-- Antipodal slot reversal `R` on a `FullDock`. -/
def revFullDock (d : FullDock) : FullDock := fun i => d (oppSlot i)

/-- Canonical first endpoint `lineA l < lineB l` of antipodal line `l : Fin 12`. -/
def lineA (l : Fin 12) : Fin 24 :=
  ⟨(l.val / 2) * 4 + (l.val % 2), by have := l.isLt; omega⟩

/-- Canonical antipodal second endpoint `lineB l = oppSlot (lineA l)` of line `l : Fin 12`. -/
def lineB (l : Fin 12) : Fin 24 := oppSlot (lineA l)

/-- Line index `0..11` containing slot `s : Fin 24`. -/
def lineOfSlot (s : Fin 24) : Fin 12 :=
  ⟨(s.val / 4) * 2 + (if s.val % 4 < 2 then s.val % 4 else 3 - s.val % 4), by have := s.isLt; omega⟩

/-- Exact improper `W(F_4)^-` spatial parity reflection `M_P = simpleRefl 0` (`det = -1`) in `O^+(4,1; ℤ[√2])`. -/
def parityMat5 : Mat5 := simpleRefl ⟨0, by decide⟩

/-- Induced slot involution `paritySlot` of `M_P = simpleRefl 0` on `Fin 24` (`1↔20, 2↔23, 5↔16, 6↔19, 9↔12, 10↔15`). -/
def paritySlot : Fin 24 → Fin 24
  | ⟨1, _⟩  => ⟨20, by decide⟩
  | ⟨2, _⟩  => ⟨23, by decide⟩
  | ⟨5, _⟩  => ⟨16, by decide⟩
  | ⟨6, _⟩  => ⟨19, by decide⟩
  | ⟨9, _⟩  => ⟨12, by decide⟩
  | ⟨10, _⟩ => ⟨15, by decide⟩
  | ⟨12, _⟩ => ⟨9, by decide⟩
  | ⟨15, _⟩ => ⟨10, by decide⟩
  | ⟨16, _⟩ => ⟨5, by decide⟩
  | ⟨19, _⟩ => ⟨6, by decide⟩
  | ⟨20, _⟩ => ⟨1, by decide⟩
  | ⟨23, _⟩ => ⟨2, by decide⟩
  | s       => s

/-- Induced antipodal-line involution `parityLine` of `M_P` on `Fin 12` (`1↔10, 3↔8, 5↔6`). -/
def parityLine : Fin 12 → Fin 12
  | ⟨1, _⟩  => ⟨10, by decide⟩
  | ⟨3, _⟩  => ⟨8, by decide⟩
  | ⟨5, _⟩  => ⟨6, by decide⟩
  | ⟨6, _⟩  => ⟨5, by decide⟩
  | ⟨8, _⟩  => ⟨3, by decide⟩
  | ⟨10, _⟩ => ⟨1, by decide⟩
  | l       => l

/-- Spatial parity `P` on a `FullDock`. -/
def parityFullDock (d : FullDock) : FullDock := fun i => d (paritySlot i)

/-- Combined `CP` action on a `FullDock`. -/
def cpFullDock (d : FullDock) : FullDock := conjFullDock (parityFullDock d)

private theorem line_geom_facts :
    (∀ l : Fin 12, oppSlot (lineA l) = lineB l ∧ oppSlot (lineB l) = lineA l ∧ lineA l ≠ lineB l) ∧
    (∀ l : Fin 12, lineOfSlot (lineA l) = l ∧ lineOfSlot (lineB l) = l) ∧
    (∀ s : Fin 24, s = lineA (lineOfSlot s) ∨ s = lineB (lineOfSlot s)) ∧
    (∀ l₁ l₂ : Fin 12, l₁ ≠ l₂ →
      lineA l₁ ≠ lineA l₂ ∧ lineA l₁ ≠ lineB l₂ ∧ lineB l₁ ≠ lineA l₂ ∧ lineB l₁ ≠ lineB l₂) ∧
    (∀ s : Fin 24, paritySlot (paritySlot s) = s ∧ paritySlot (oppSlot s) = oppSlot (paritySlot s)) ∧
    (∀ l : Fin 12, parityLine (parityLine l) = l ∧
      paritySlot (lineA l) = lineA (parityLine l) ∧ paritySlot (lineB l) = lineB (parityLine l)) := by
  decide

/-! ### Local `ZSqrt2` & `Mat5` Helpers for Unconditional `det(M_P g M_P) = det(g)` -/

private theorem z2_add_comm (x y : ZSqrt2) : ZSqrt2.add x y = ZSqrt2.add y x := by
  cases x; cases y; simp only [ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_add_assoc (x y z : ZSqrt2) :
    ZSqrt2.add (ZSqrt2.add x y) z = ZSqrt2.add x (ZSqrt2.add y z) := by
  cases x; cases y; cases z; simp only [ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_add_zero (x : ZSqrt2) : ZSqrt2.add x ZSqrt2.zero = x := by
  cases x; simp only [ZSqrt2.add, ZSqrt2.zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_zero_add (x : ZSqrt2) : ZSqrt2.add ZSqrt2.zero x = x := by
  cases x; simp only [ZSqrt2.add, ZSqrt2.zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_neg_neg (x : ZSqrt2) : ZSqrt2.neg (ZSqrt2.neg x) = x := by
  cases x; simp only [ZSqrt2.neg, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_neg_add (x y : ZSqrt2) :
    ZSqrt2.neg (ZSqrt2.add x y) = ZSqrt2.add (ZSqrt2.neg x) (ZSqrt2.neg y) := by
  cases x; cases y; simp only [ZSqrt2.neg, ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_neg_sub (x y : ZSqrt2) :
    ZSqrt2.neg (ZSqrt2.sub x y) = ZSqrt2.sub (ZSqrt2.neg x) (ZSqrt2.neg y) := by
  cases x; cases y; simp only [ZSqrt2.neg, ZSqrt2.sub, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_mul_comm (x y : ZSqrt2) : ZSqrt2.mul x y = ZSqrt2.mul y x := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [ZSqrt2.mul, ZSqrt2.mk.injEq]
  rw [Int.mul_comm xa ya, Int.mul_comm xa yb, Int.mul_comm xb ya,
      Int.mul_assoc 2 xb yb, Int.mul_comm xb yb, ← Int.mul_assoc 2 yb xb]
  exact ⟨by omega, by omega⟩

private theorem z2_mul_add (x y z : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.add y z) = ZSqrt2.add (ZSqrt2.mul x y) (ZSqrt2.mul x z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.add, ZSqrt2.mk.injEq, Int.mul_add]
  exact ⟨by omega, by omega⟩

private theorem z2_add_mul (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.add x y) z = ZSqrt2.add (ZSqrt2.mul x z) (ZSqrt2.mul y z) := by
  rw [z2_mul_comm, z2_mul_add, z2_mul_comm z x, z2_mul_comm z y]

private theorem z2_mul_sub (x y z : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.sub y z) = ZSqrt2.sub (ZSqrt2.mul x y) (ZSqrt2.mul x z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.sub, ZSqrt2.mk.injEq, Int.mul_sub]
  exact ⟨by omega, by omega⟩

private theorem z2_sub_mul (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.sub x y) z = ZSqrt2.sub (ZSqrt2.mul x z) (ZSqrt2.mul y z) := by
  rw [z2_mul_comm, z2_mul_sub, z2_mul_comm z x, z2_mul_comm z y]

private theorem z2_neg_mul (x y : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.neg x) y = ZSqrt2.neg (ZSqrt2.mul x y) := by
  cases x; cases y
  simp only [ZSqrt2.mul, ZSqrt2.neg, ZSqrt2.mk.injEq, Int.neg_mul, Int.mul_neg]
  exact ⟨by omega, by omega⟩

private theorem z2_mul_neg (x y : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.neg y) = ZSqrt2.neg (ZSqrt2.mul x y) := by
  rw [z2_mul_comm, z2_neg_mul, z2_mul_comm]

private theorem z2_mul_assoc (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.mul x y) z = ZSqrt2.mul x (ZSqrt2.mul y z) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  cases z with | mk za zb =>
  simp only [ZSqrt2.mul, ZSqrt2.mk.injEq, Int.add_mul, Int.mul_add, Int.mul_assoc]
  have h1 : xa * (2 * (yb * zb)) = 2 * (xa * (yb * zb)) := by
    rw [← Int.mul_assoc xa 2 (yb * zb), Int.mul_comm xa 2, Int.mul_assoc 2 xa (yb * zb)]
  rw [h1]
  exact ⟨by omega, by omega⟩

private theorem z2_mul_one (x : ZSqrt2) : ZSqrt2.mul x ZSqrt2.one = x := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.one, ZSqrt2.mk.injEq, Int.mul_one, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem z2_one_mul (x : ZSqrt2) : ZSqrt2.mul ZSqrt2.one x = x := by
  rw [z2_mul_comm, z2_mul_one]

private theorem z2_mul_zero (x : ZSqrt2) : ZSqrt2.mul x ZSqrt2.zero = ZSqrt2.zero := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.zero, ZSqrt2.mk.injEq, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem z2_zero_mul (x : ZSqrt2) : ZSqrt2.mul ZSqrt2.zero x = ZSqrt2.zero := by
  rw [z2_mul_comm, z2_mul_zero]

private theorem fb_sum5_add (f g : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.add (f k) (g k)) = ZSqrt2.add (sum5 f) (sum5 g) := by
  unfold sum5
  have swap4 : ∀ a b c d : ZSqrt2,
      ZSqrt2.add (ZSqrt2.add a b) (ZSqrt2.add c d) =
        ZSqrt2.add (ZSqrt2.add a c) (ZSqrt2.add b d) := by
    intro a b c d
    rw [z2_add_assoc a b (ZSqrt2.add c d), ← z2_add_assoc b c d, z2_add_comm b c,
        z2_add_assoc c b d, ← z2_add_assoc a c (ZSqrt2.add b d)]
  rw [swap4, swap4, swap4, swap4]

private theorem fb_sum5_mul_left (c : ZSqrt2) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul c (f k)) = ZSqrt2.mul c (sum5 f) := by
  unfold sum5; rw [z2_mul_add, z2_mul_add, z2_mul_add, z2_mul_add]

private theorem fb_sum5_mul_right (f : Fin 5 → ZSqrt2) (c : ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (f k) c) = ZSqrt2.mul (sum5 f) c := by
  unfold sum5; rw [z2_add_mul, z2_add_mul, z2_add_mul, z2_add_mul]

private theorem fb_sum5_comm (f : Fin 5 → Fin 5 → ZSqrt2) :
    sum5 (fun i => sum5 (fun j => f i j)) = sum5 (fun j => sum5 (fun i => f i j)) := by
  change sum5 (fun i => sum5 (fun j => f i j)) =
    ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add
      (sum5 (fun i => f i ⟨0, by decide⟩))
      (sum5 (fun i => f i ⟨1, by decide⟩)))
      (sum5 (fun i => f i ⟨2, by decide⟩)))
      (sum5 (fun i => f i ⟨3, by decide⟩)))
      (sum5 (fun i => f i ⟨4, by decide⟩))
  rw [← fb_sum5_add, ← fb_sum5_add, ← fb_sum5_add, ← fb_sum5_add]
  rfl

private theorem fb_mat5Mul_id_left (A : Mat5) : mat5Mul mat5Id A = A := by
  funext i j
  unfold mat5Mul sum5
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp only [mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

private theorem fb_mat5Mul_id_right (A : Mat5) : mat5Mul A mat5Id = A := by
  funext i j
  unfold mat5Mul sum5
  match j with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp only [mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero, z2_zero_add]

private theorem fb_mat5Mul_assoc (A B C : Mat5) :
    mat5Mul (mat5Mul A B) C = mat5Mul A (mat5Mul B C) := by
  funext i j
  unfold mat5Mul
  have hL : sum5 (fun k => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (A i m) (B m k))) (C k j)) =
      sum5 (fun k => sum5 (fun m => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (C k j)))) := by
    apply congrArg sum5; funext k
    rw [← fb_sum5_mul_right]
    apply congrArg sum5; funext m
    exact z2_mul_assoc (A i m) (B m k) (C k j)
  have hR : sum5 (fun m => ZSqrt2.mul (A i m) (sum5 (fun k => ZSqrt2.mul (B m k) (C k j)))) =
      sum5 (fun m => sum5 (fun k => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (C k j)))) := by
    apply congrArg sum5; funext m
    rw [← fb_sum5_mul_left]
  rw [hL, fb_sum5_comm, hR]

private def parityMat5Fast : Mat5
  | ⟨0, _⟩, ⟨0, _⟩ => ZSqrt2.negOne
  | ⟨0, _⟩, ⟨1, _⟩ => ZSqrt2.one
  | ⟨0, _⟩, _      => ZSqrt2.zero
  | i, j           => mat5Id i j

private theorem parityMat5_eq_fast : parityMat5 = parityMat5Fast :=
  funext (fun i => funext (fun j => (by decide : ∀ x y : Fin 5, parityMat5 x y = parityMat5Fast x y) i j))

private theorem parityMat5_mul_row0 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨0, by decide⟩ j = ZSqrt2.sub (g ⟨1, by decide⟩ j) (g ⟨0, by decide⟩ j) := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]
  cases g ⟨0, by decide⟩ j; cases g ⟨1, by decide⟩ j
  simp only [ZSqrt2.negOne, ZSqrt2.mul, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mk.injEq,
    Int.mul_zero, Int.zero_mul, Int.neg_mul, Int.one_mul]
  exact ⟨by omega, by omega⟩

private theorem parityMat5_mul_row1 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨1, by decide⟩ j = g ⟨1, by decide⟩ j := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

private theorem parityMat5_mul_row2 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨2, by decide⟩ j = g ⟨2, by decide⟩ j := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

private theorem parityMat5_mul_row3 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨3, by decide⟩ j = g ⟨3, by decide⟩ j := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

private theorem parityMat5_mul_row4 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨4, by decide⟩ j = g ⟨4, by decide⟩ j := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

private theorem mul_parityMat5_col0 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨0, by decide⟩ = ZSqrt2.neg (g i ⟨0, by decide⟩) := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_mul_zero, z2_add_zero, z2_zero_add]
  cases g i ⟨0, by decide⟩
  simp only [ZSqrt2.negOne, ZSqrt2.mul, ZSqrt2.neg, ZSqrt2.mk.injEq,
    Int.mul_zero, Int.mul_neg, Int.mul_one]
  exact ⟨by omega, by omega⟩

private theorem mul_parityMat5_col1 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨1, by decide⟩ = ZSqrt2.add (g i ⟨0, by decide⟩) (g i ⟨1, by decide⟩) := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero, z2_zero_add]

private theorem mul_parityMat5_col2 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨2, by decide⟩ = g i ⟨2, by decide⟩ := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero, z2_zero_add]

private theorem mul_parityMat5_col3 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨3, by decide⟩ = g i ⟨3, by decide⟩ := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero, z2_zero_add]

private theorem mul_parityMat5_col4 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨4, by decide⟩ = g i ⟨4, by decide⟩ := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero, z2_zero_add]

private theorem det2Z2_row0_op (a0 a1 b0 b1 : ZSqrt2) :
    det2Z2 (ZSqrt2.sub b0 a0) (ZSqrt2.sub b1 a1) b0 b1 = ZSqrt2.neg (det2Z2 a0 a1 b0 b1) := by
  unfold det2Z2
  rw [z2_sub_mul, z2_sub_mul, z2_mul_comm b1 b0]
  cases ZSqrt2.mul b0 b1; cases ZSqrt2.mul a0 b1; cases ZSqrt2.mul a1 b0
  simp only [ZSqrt2.sub, ZSqrt2.neg, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem det2Z2_col01_op (x y u v : ZSqrt2) :
    det2Z2 (ZSqrt2.neg x) (ZSqrt2.add x y) (ZSqrt2.neg u) (ZSqrt2.add u v) =
      ZSqrt2.neg (det2Z2 x y u v) := by
  unfold det2Z2
  rw [z2_neg_mul, z2_mul_add, z2_mul_neg, z2_add_mul, z2_mul_comm y u, z2_mul_comm x u]
  cases ZSqrt2.mul u x; cases ZSqrt2.mul x v; cases ZSqrt2.mul u y
  simp only [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.neg, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem det2Z2_col0q_op (x z u w : ZSqrt2) :
    det2Z2 (ZSqrt2.neg x) z (ZSqrt2.neg u) w = ZSqrt2.neg (det2Z2 x z u w) := by
  unfold det2Z2
  rw [z2_neg_mul, z2_mul_neg, z2_neg_sub]

private theorem det2Z2_col1q_op (x y z u v w : ZSqrt2) :
    det2Z2 (ZSqrt2.add x y) z (ZSqrt2.add u v) w =
      ZSqrt2.add (det2Z2 x z u w) (det2Z2 y z v w) := by
  unfold det2Z2
  rw [z2_add_mul, z2_mul_add]
  cases ZSqrt2.mul x w; cases ZSqrt2.mul y w; cases ZSqrt2.mul z u; cases ZSqrt2.mul z v
  simp only [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem mat5Det_parityMat5_mul (g : Mat5) :
    mat5Det (mat5Mul parityMat5 g) = ZSqrt2.neg (mat5Det g) := by
  unfold mat5Det
  dsimp only
  simp only [parityMat5_mul_row0, parityMat5_mul_row1, parityMat5_mul_row2,
    parityMat5_mul_row3, parityMat5_mul_row4, det2Z2_row0_op, z2_neg_mul, z2_neg_add, z2_neg_sub]

private theorem det3_col01_op (m0 m1 m2 b01 b02 b12 : ZSqrt2) :
    ZSqrt2.add
      (ZSqrt2.sub (ZSqrt2.mul (ZSqrt2.neg m0) (ZSqrt2.add b02 b12))
                  (ZSqrt2.mul (ZSqrt2.add m0 m1) (ZSqrt2.neg b02)))
      (ZSqrt2.mul m2 (ZSqrt2.neg b01)) =
    ZSqrt2.neg (ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul m0 b12) (ZSqrt2.mul m1 b02)) (ZSqrt2.mul m2 b01)) := by
  rw [z2_neg_mul, z2_mul_add, z2_mul_neg, z2_add_mul, z2_mul_neg]
  cases ZSqrt2.mul m0 b02; cases ZSqrt2.mul m0 b12; cases ZSqrt2.mul m1 b02; cases ZSqrt2.mul m2 b01
  simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.neg, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem det3_col0_op (m0 m1 m2 b12 b02 b01 : ZSqrt2) :
    ZSqrt2.add
      (ZSqrt2.sub (ZSqrt2.mul (ZSqrt2.neg m0) b12) (ZSqrt2.mul m1 (ZSqrt2.neg b02)))
      (ZSqrt2.mul m2 (ZSqrt2.neg b01)) =
    ZSqrt2.neg (ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul m0 b12) (ZSqrt2.mul m1 b02)) (ZSqrt2.mul m2 b01)) := by
  rw [z2_neg_mul, z2_mul_neg, z2_mul_neg, z2_neg_add, z2_neg_sub]

private theorem det3_col1_op (m0 m1 m2 m3 b23 b03 b13 b02 b12 : ZSqrt2) :
    ZSqrt2.add
      (ZSqrt2.sub (ZSqrt2.mul (ZSqrt2.add m0 m1) b23) (ZSqrt2.mul m2 (ZSqrt2.add b03 b13)))
      (ZSqrt2.mul m3 (ZSqrt2.add b02 b12)) =
    ZSqrt2.add
      (ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul m0 b23) (ZSqrt2.mul m2 b03)) (ZSqrt2.mul m3 b02))
      (ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul m1 b23) (ZSqrt2.mul m2 b13)) (ZSqrt2.mul m3 b12)) := by
  rw [z2_add_mul, z2_mul_add, z2_mul_add]
  cases ZSqrt2.mul m0 b23; cases ZSqrt2.mul m1 b23
  cases ZSqrt2.mul m2 b03; cases ZSqrt2.mul m2 b13
  cases ZSqrt2.mul m3 b02; cases ZSqrt2.mul m3 b12
  simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem det5_col01_sum_rearrange
    (a01 a02 a03 a04 a12 a13 a14 a23 a24 a34
     d234 d134 d124 d123 d034 d024 d023 d014 d013 d012 : ZSqrt2) :
    let t0 := ZSqrt2.mul (ZSqrt2.neg a01) d234
    let t1 := ZSqrt2.sub t0 (ZSqrt2.mul (ZSqrt2.neg a02) (ZSqrt2.add d034 d134))
    let t2 := ZSqrt2.add t1 (ZSqrt2.mul (ZSqrt2.neg a03) (ZSqrt2.add d024 d124))
    let t3 := ZSqrt2.sub t2 (ZSqrt2.mul (ZSqrt2.neg a04) (ZSqrt2.add d023 d123))
    let t4 := ZSqrt2.add t3 (ZSqrt2.mul (ZSqrt2.add a02 a12) (ZSqrt2.neg d034))
    let t5 := ZSqrt2.sub t4 (ZSqrt2.mul (ZSqrt2.add a03 a13) (ZSqrt2.neg d024))
    let t6 := ZSqrt2.add t5 (ZSqrt2.mul (ZSqrt2.add a04 a14) (ZSqrt2.neg d023))
    let t7 := ZSqrt2.add t6 (ZSqrt2.mul a23 (ZSqrt2.neg d014))
    let t8 := ZSqrt2.sub t7 (ZSqrt2.mul a24 (ZSqrt2.neg d013))
    ZSqrt2.add t8 (ZSqrt2.mul a34 (ZSqrt2.neg d012)) =
    ZSqrt2.neg (
      let s0 := ZSqrt2.mul a01 d234
      let s1 := ZSqrt2.sub s0 (ZSqrt2.mul a02 d134)
      let s2 := ZSqrt2.add s1 (ZSqrt2.mul a03 d124)
      let s3 := ZSqrt2.sub s2 (ZSqrt2.mul a04 d123)
      let s4 := ZSqrt2.add s3 (ZSqrt2.mul a12 d034)
      let s5 := ZSqrt2.sub s4 (ZSqrt2.mul a13 d024)
      let s6 := ZSqrt2.add s5 (ZSqrt2.mul a14 d023)
      let s7 := ZSqrt2.add s6 (ZSqrt2.mul a23 d014)
      let s8 := ZSqrt2.sub s7 (ZSqrt2.mul a24 d013)
      ZSqrt2.add s8 (ZSqrt2.mul a34 d012)) := by
  dsimp only
  simp only [z2_neg_mul, z2_mul_neg, z2_mul_add, z2_add_mul]
  cases ZSqrt2.mul a01 d234; cases ZSqrt2.mul a02 d034; cases ZSqrt2.mul a02 d134
  cases ZSqrt2.mul a03 d024; cases ZSqrt2.mul a03 d124; cases ZSqrt2.mul a04 d023
  cases ZSqrt2.mul a04 d123; cases ZSqrt2.mul a12 d034; cases ZSqrt2.mul a13 d024
  cases ZSqrt2.mul a14 d023; cases ZSqrt2.mul a23 d014; cases ZSqrt2.mul a24 d013
  cases ZSqrt2.mul a34 d012
  simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.neg, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem mat5Det_mul_parityMat5 (g : Mat5) :
    mat5Det (mat5Mul g parityMat5) = ZSqrt2.neg (mat5Det g) := by
  unfold mat5Det
  dsimp only
  simp only [mul_parityMat5_col0, mul_parityMat5_col1, mul_parityMat5_col2,
    mul_parityMat5_col3, mul_parityMat5_col4,
    det2Z2_col01_op, det2Z2_col0q_op, det2Z2_col1q_op,
    det3_col01_op, det3_col0_op, det3_col1_op]
  exact det5_col01_sum_rearrange _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

/-- Exact Coxeter parity conjugation on cell frames: `g ↦ M_P * g * M_P`. -/
def conjMatP (g : Mat5) : Mat5 := mat5Mul (mat5Mul parityMat5 g) parityMat5

/-- Exact canonical bipartite dock orientation `σ(g) = +1` if `det(g) = +1`, else `-1`. -/
def dockParity (g : Mat5) : Int :=
  if mat5Det g = ZSqrt2.one then 1 else -1

/-- Headline Theorem 6 (Exact `{3,4,3,4}` Coxeter Spatial Parity Equivariance & Unconditional
    Determinant Conjugation Invariance):
    `M_P = simpleRefl 0` is an improper `W(F_4)^-` reflection (`M_P^2 = I_5`, `det(M_P) = -1`)
    mapping every facet normal `n_a ↦ n_{paritySlot a}`, conjugating every Coxeter transport
    `M_P k_a M_P = k_{paritySlot a}` across all 24 slots, and preserving `mat5Det` (and hence
    `dockParity`) under conjugation `g ↦ M_P g M_P` unconditionally for ALL `g : Mat5`. -/
theorem thm_fock_coxeter_parity_equivariance :
    mat5Mul parityMat5 parityMat5 = mat5Id ∧
    mat5Det parityMat5 = ZSqrt2.ofInt (-1) ∧
    (∀ a : Fin 24, mat5Vec parityMat5 (facetNormal a) = facetNormal (paritySlot a)) ∧
    (∀ a : Fin 24, mat5Mul (mat5Mul parityMat5 (transport a)) parityMat5 = transport (paritySlot a)) ∧
    (∀ g : Mat5, mat5Det (conjMatP g) = mat5Det g ∧ dockParity (conjMatP g) = dockParity g) := by
  have hP2 : mat5Mul parityMat5 parityMat5 = mat5Id :=
    funext (fun i => funext (fun j => (by decide : ∀ x y : Fin 5, mat5Mul parityMat5 parityMat5 x y = mat5Id x y) i j))
  have hPOrth : mat5Mul (mat5Transpose parityMat5) (mat5Mul twiceGram parityMat5) = twiceGram :=
    thm_reflection_preserves_twiceGram (unitVec5 ⟨0, by decide⟩) (by decide)
  have hDet : mat5Det parityMat5 = ZSqrt2.ofInt (-1) := by decide
  have hNorm : ∀ a : Fin 24, mat5Vec parityMat5 (facetNormal a) = facetNormal (paritySlot a) := by
    intro a
    exact funext ((by decide : ∀ (x : Fin 24) (i : Fin 5),
      mat5Vec parityMat5 (facetNormal x) i = facetNormal (paritySlot x) i) a)
  have hTrans : ∀ a : Fin 24,
      mat5Mul (mat5Mul parityMat5 (transport a)) parityMat5 = transport (paritySlot a) := by
    intro a
    have hCommZ : mat5Mul parityMat5 centralInversion = mat5Mul centralInversion parityMat5 :=
      thm_central_inversion_properties.2.2.2.2 ⟨0, by decide⟩
    unfold transport faceReflection
    calc mat5Mul (mat5Mul parityMat5 (mat5Mul (reflectionIn (facetNormal a)) centralInversion)) parityMat5
        = mat5Mul (mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) centralInversion) parityMat5 := by
            rw [fb_mat5Mul_assoc]
      _ = mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) (mat5Mul centralInversion parityMat5) := by
            rw [fb_mat5Mul_assoc]
      _ = mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) (mat5Mul parityMat5 centralInversion) := by
            rw [hCommZ]
      _ = mat5Mul (mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) parityMat5) centralInversion := by
            rw [← fb_mat5Mul_assoc]
      _ = mat5Mul (reflectionIn (mat5Vec parityMat5 (facetNormal a))) centralInversion := by
            rw [thm_conj_reflection parityMat5 hP2 hPOrth (facetNormal a)]
      _ = mat5Mul (reflectionIn (facetNormal (paritySlot a))) centralInversion := by
            rw [hNorm a]
  have hConjDet : ∀ g : Mat5, mat5Det (conjMatP g) = mat5Det g ∧ dockParity (conjMatP g) = dockParity g := by
    intro g
    have hd : mat5Det (conjMatP g) = mat5Det g := by
      unfold conjMatP
      rw [mat5Det_mul_parityMat5, mat5Det_parityMat5_mul, z2_neg_neg]
    refine ⟨hd, ?_⟩
    unfold dockParity
    rw [hd]
  exact ⟨hP2, hDet, hNorm, hTrans, hConjDet⟩

private theorem conjMatP_involutive (g : Mat5) : conjMatP (conjMatP g) = g := by
  unfold conjMatP
  have hP2 := thm_fock_coxeter_parity_equivariance.1
  rw [fb_mat5Mul_assoc parityMat5 (mat5Mul (mat5Mul parityMat5 g) parityMat5) parityMat5]
  rw [fb_mat5Mul_assoc (mat5Mul parityMat5 g) parityMat5 parityMat5, hP2, fb_mat5Mul_id_right]
  rw [← fb_mat5Mul_assoc parityMat5 parityMat5 g, hP2, fb_mat5Mul_id_left]

private theorem conjMatP_mul (g₁ g₂ : Mat5) :
    conjMatP (mat5Mul g₁ g₂) = mat5Mul (conjMatP g₁) (conjMatP g₂) := by
  unfold conjMatP
  have hP2 := thm_fock_coxeter_parity_equivariance.1
  calc mat5Mul (mat5Mul parityMat5 (mat5Mul g₁ g₂)) parityMat5
      = mat5Mul (mat5Mul parityMat5 g₁) (mat5Mul g₂ parityMat5) := by
          rw [← fb_mat5Mul_assoc parityMat5 g₁ g₂, fb_mat5Mul_assoc]
    _ = mat5Mul (mat5Mul parityMat5 g₁) (mat5Mul mat5Id (mat5Mul g₂ parityMat5)) := by
          rw [fb_mat5Mul_id_left]
    _ = mat5Mul (mat5Mul parityMat5 g₁) (mat5Mul (mat5Mul parityMat5 parityMat5) (mat5Mul g₂ parityMat5)) := by
          rw [hP2]
    _ = mat5Mul (mat5Mul (mat5Mul parityMat5 g₁) parityMat5) (mat5Mul parityMat5 (mat5Mul g₂ parityMat5)) := by
          rw [fb_mat5Mul_assoc parityMat5 parityMat5 (mat5Mul g₂ parityMat5), ← fb_mat5Mul_assoc]
    _ = mat5Mul (mat5Mul (mat5Mul parityMat5 g₁) parityMat5) (mat5Mul (mat5Mul parityMat5 g₂) parityMat5) := by
          rw [fb_mat5Mul_assoc parityMat5 g₂ parityMat5]

/-! ### Canonical Total Order on `Mat5` & Infinite-Honeycomb `HoneycombConfig` -/

private def listIntLt : List Int → List Int → Bool
  | [], _ => false
  | _, [] => false
  | x :: xs, y :: ys => if x < y then true else if y < x then false else listIntLt xs ys

private theorem listIntLt_irrefl (xs : List Int) : listIntLt xs xs = false := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [listIntLt]
    have hxx : ¬ (x < x) := by omega
    simp only [ite_eq_right hxx]
    exact ih

private theorem listIntLt_trans (xs ys zs : List Int)
    (h1 : listIntLt xs ys = true) (h2 : listIntLt ys zs = true) :
    listIntLt xs zs = true := by
  induction xs generalizing ys zs with
  | nil => simp only [listIntLt] at h1; exact Bool.noConfusion h1
  | cons x xr ih =>
    cases ys with
    | nil => simp only [listIntLt] at h1; exact Bool.noConfusion h1
    | cons y yr =>
      cases zs with
      | nil => simp only [listIntLt] at h2; exact Bool.noConfusion h2
      | cons z zr =>
        simp only [listIntLt] at h1 h2 ⊢
        if hxy : x < y then
          if hyz : y < z then
            rw [ite_eq_left (by omega)]
          else if hzy : z < y then
            rw [ite_eq_right hyz, ite_eq_left hzy] at h2; exact Bool.noConfusion h2
          else
            rw [ite_eq_left (by omega)]
        else if hyx : y < x then
          rw [ite_eq_right hxy, ite_eq_left hyx] at h1; exact Bool.noConfusion h1
        else
          rw [ite_eq_right hxy, ite_eq_right hyx] at h1
          if hyz : y < z then
            rw [ite_eq_left (by omega)]
          else if hzy : z < y then
            rw [ite_eq_right hyz, ite_eq_left hzy] at h2; exact Bool.noConfusion h2
          else
            rw [ite_eq_right hyz, ite_eq_right hzy] at h2
            have hxz : ¬ (x < z) := by omega
            have hzx : ¬ (z < x) := by omega
            simp only [ite_eq_right hxz, ite_eq_right hzx]
            exact ih yr zr h1 h2

private theorem listIntLt_trichotomy (xs ys : List Int) (hlen : xs.length = ys.length) :
    listIntLt xs ys = true ∨ xs = ys ∨ listIntLt ys xs = true := by
  induction xs generalizing ys with
  | nil =>
    cases ys with
    | nil => exact Or.inr (Or.inl rfl)
    | cons _ _ => simp only [List.length_nil, List.length_cons] at hlen; omega
  | cons x xr ih =>
    cases ys with
    | nil => simp only [List.length_nil, List.length_cons] at hlen; omega
    | cons y yr =>
      simp only [List.length_cons] at hlen
      if hxy : x < y then
        exact Or.inl (by simp only [listIntLt, ite_eq_left hxy])
      else if hyx : y < x then
        exact Or.inr (Or.inr (by simp only [listIntLt, ite_eq_left hyx]))
      else
        have hEq : x = y := by omega
        rcases ih yr (by omega) with h1 | h2 | h3
        · exact Or.inl (by simp only [listIntLt, ite_eq_right hxy, ite_eq_right hyx]; exact h1)
        · exact Or.inr (Or.inl (by rw [hEq, h2]))
        · exact Or.inr (Or.inr (by simp only [listIntLt, ite_eq_right hyx, ite_eq_right hxy]; exact h3))

private def vec5Key (v : Vec5) : List Int :=
  [ (v ⟨0, by decide⟩).a, (v ⟨0, by decide⟩).b,
    (v ⟨1, by decide⟩).a, (v ⟨1, by decide⟩).b,
    (v ⟨2, by decide⟩).a, (v ⟨2, by decide⟩).b,
    (v ⟨3, by decide⟩).a, (v ⟨3, by decide⟩).b,
    (v ⟨4, by decide⟩).a, (v ⟨4, by decide⟩).b ]

private def mat5Key (g : Mat5) : List Int :=
  vec5Key (g ⟨0, by decide⟩) ++ vec5Key (g ⟨1, by decide⟩) ++
  vec5Key (g ⟨2, by decide⟩) ++ vec5Key (g ⟨3, by decide⟩) ++ vec5Key (g ⟨4, by decide⟩)

private theorem mat5Key_len (g : Mat5) : (mat5Key g).length = 50 := rfl

private theorem vec5Key_inj (u v : Vec5) (h : vec5Key u = vec5Key v) : u = v := by
  unfold vec5Key at h
  simp only [List.cons.injEq] at h
  rcases h with ⟨h0a, h0b, h1a, h1b, h2a, h2b, h3a, h3b, h4a, h4b, _⟩
  have mkEq : ∀ (x y : ZSqrt2), x.a = y.a → x.b = y.b → x = y := fun x y ha hb => by
    cases x; cases y; simp only [ZSqrt2.mk.injEq]; exact ⟨ha, hb⟩
  funext i
  match i with
  | ⟨0, _⟩ => exact mkEq _ _ h0a h0b
  | ⟨1, _⟩ => exact mkEq _ _ h1a h1b
  | ⟨2, _⟩ => exact mkEq _ _ h2a h2b
  | ⟨3, _⟩ => exact mkEq _ _ h3a h3b
  | ⟨4, _⟩ => exact mkEq _ _ h4a h4b

private theorem mat5Key_inj (g₁ g₂ : Mat5) (h : mat5Key g₁ = mat5Key g₂) : g₁ = g₂ := by
  have append_eq_of_len : ∀ (a₁ a₂ b₁ b₂ : List Int),
      a₁.length = a₂.length → a₁ ++ b₁ = a₂ ++ b₂ → a₁ = a₂ ∧ b₁ = b₂ := by
    intro a₁
    induction a₁ with
    | nil =>
      intro a₂ b₁ b₂ hlen heq
      cases a₂ with
      | nil => exact ⟨rfl, heq⟩
      | cons _ _ => simp only [List.length_nil, List.length_cons] at hlen; omega
    | cons x xs ih =>
      intro a₂ b₁ b₂ hlen heq
      cases a₂ with
      | nil => simp only [List.length_nil, List.length_cons] at hlen; omega
      | cons y ys =>
        simp only [List.length_cons, List.cons_append, List.cons.injEq] at hlen heq
        have ⟨hxs, hbs⟩ := ih ys b₁ b₂ (by omega) heq.2
        exact ⟨by rw [heq.1, hxs], hbs⟩
  unfold mat5Key at h
  have ⟨h0, h1234⟩ := append_eq_of_len _ _ _ _ rfl h
  have ⟨h1, h234⟩ := append_eq_of_len _ _ _ _ rfl h1234
  have ⟨h2, h34⟩ := append_eq_of_len _ _ _ _ rfl h234
  have ⟨h3, h4⟩ := append_eq_of_len _ _ _ _ rfl h34
  funext i
  match i with
  | ⟨0, _⟩ => exact vec5Key_inj _ _ h0
  | ⟨1, _⟩ => exact vec5Key_inj _ _ h1
  | ⟨2, _⟩ => exact vec5Key_inj _ _ h2
  | ⟨3, _⟩ => exact vec5Key_inj _ _ h3
  | ⟨4, _⟩ => exact vec5Key_inj _ _ h4

/-- Canonical strict total order on `{3,4,3,4}` Coxeter cell frames `Mat5`. -/
def mat5Lt (g₁ g₂ : Mat5) : Bool := listIntLt (mat5Key g₁) (mat5Key g₂)

private theorem mat5Lt_irrefl (g : Mat5) : mat5Lt g g = false := listIntLt_irrefl (mat5Key g)

private theorem mat5Lt_trans (g₁ g₂ g₃ : Mat5)
    (h1 : mat5Lt g₁ g₂ = true) (h2 : mat5Lt g₂ g₃ = true) : mat5Lt g₁ g₃ = true :=
  listIntLt_trans _ _ _ h1 h2

private theorem mat5Lt_trichotomy (g₁ g₂ : Mat5) :
    mat5Lt g₁ g₂ = true ∨ g₁ = g₂ ∨ mat5Lt g₂ g₁ = true := by
  rcases listIntLt_trichotomy (mat5Key g₁) (mat5Key g₂) (by rw [mat5Key_len, mat5Key_len]) with h1 | h2 | h3
  · exact Or.inl h1
  · exact Or.inr (Or.inl (mat5Key_inj g₁ g₂ h2))
  · exact Or.inr (Or.inr h3)

private theorem mat5Lt_asymm (g₁ g₂ : Mat5) (h1 : mat5Lt g₁ g₂ = true) : mat5Lt g₂ g₁ = false := by
  cases h2 : mat5Lt g₂ g₁ with
  | false => rfl
  | true =>
    have hcontra := mat5Lt_trans g₁ g₂ g₁ h1 h2
    rw [mat5Lt_irrefl] at hcontra
    exact Bool.noConfusion hcontra

/-- Strict key-order predicate for canonical finite-excitation honeycomb maps. -/
def SortedEntries : List (Mat5 × FullDock) → Prop
  | [] => True
  | (g, _) :: rest => (∀ p : Mat5 × FullDock, p ∈ rest → mat5Lt g p.1 = true) ∧ SortedEntries rest

/-- Canonical finite-excitation configuration on the ENTIRE infinite `{3,4,3,4}` honeycomb:
    stores only non-vacuum docks `d ≠ v1FullDock` in strictly sorted `Mat5` key order. -/
structure HoneycombConfig where
  entries : List (Mat5 × FullDock)
  sorted : SortedEntries entries
  nonEmpty : ∀ p : Mat5 × FullDock, p ∈ entries → p.2 ≠ v1FullDock

private theorem honeycombConfig_eq_iff (c₁ c₂ : HoneycombConfig) :
    c₁ = c₂ ↔ c₁.entries = c₂.entries := by
  cases c₁; cases c₂
  constructor
  · intro h; cases h; rfl
  · intro h; simp only [HoneycombConfig.mk.injEq]; exact h

instance : DecidableEq HoneycombConfig := fun c₁ c₂ =>
  if h : c₁.entries = c₂.entries then
    isTrue ((honeycombConfig_eq_iff c₁ c₂).mpr h)
  else
    isFalse (fun heq => h ((honeycombConfig_eq_iff c₁ c₂).mp heq))

/-- Global calm vacuum configuration `v1Config` (`|V_1⟩` basis configuration): zero excited docks. -/
def v1Config : HoneycombConfig := ⟨[], trivial, fun _ h => nomatch h⟩

/-- Lookup dock state at ANY cell `g : Mat5` of the infinite `{3,4,3,4}` honeycomb (`v1FullDock` if unlisted). -/
def lookupEntries (g : Mat5) : List (Mat5 × FullDock) → FullDock
  | [] => v1FullDock
  | (k, d) :: rest => if k = g then d else lookupEntries g rest

def HoneycombConfig.lookup (c : HoneycombConfig) (g : Mat5) : FullDock :=
  lookupEntries g c.entries

/-- Sorted list of all non-empty occupied cells of `c`. -/
def HoneycombConfig.activeDocks (c : HoneycombConfig) : List Mat5 :=
  c.entries.map Prod.fst

private theorem lookupEntries_not_lt (g : Mat5) (es : List (Mat5 × FullDock))
    (hgt : ∀ p : Mat5 × FullDock, p ∈ es → mat5Lt g p.1 = true) :
    lookupEntries g es = v1FullDock := by
  induction es with
  | nil => rfl
  | cons p rest ih =>
    cases p with | mk k d =>
    simp only [lookupEntries]
    have hlt : mat5Lt g k = true := hgt (k, d) (List.Mem.head rest)
    have hne : k ≠ g := by
      intro heq; rw [heq, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
    rw [ite_eq_right hne]
    exact ih (fun q hq => hgt q (List.Mem.tail _ hq))

private theorem sortedEntries_ext (es₁ es₂ : List (Mat5 × FullDock))
    (hs₁ : SortedEntries es₁) (hs₂ : SortedEntries es₂)
    (hne₁ : ∀ p, p ∈ es₁ → p.2 ≠ v1FullDock) (hne₂ : ∀ p, p ∈ es₂ → p.2 ≠ v1FullDock)
    (hlk : ∀ g : Mat5, lookupEntries g es₁ = lookupEntries g es₂) :
    es₁ = es₂ := by
  induction es₁ generalizing es₂ with
  | nil =>
    cases es₂ with
    | nil => rfl
    | cons p rest =>
      cases p with | mk k d =>
      have h0 := hlk k
      simp only [lookupEntries, ite_eq_left rfl] at h0
      exact absurd h0.symm (hne₂ (k, d) (List.Mem.head rest))
  | cons p₁ r₁ ih =>
    cases p₁ with | mk k₁ d₁ =>
    cases es₂ with
    | nil =>
      have h0 := hlk k₁
      simp only [lookupEntries, ite_eq_left rfl] at h0
      exact absurd h0 (hne₁ (k₁, d₁) (List.Mem.head r₁))
    | cons p₂ r₂ =>
      cases p₂ with | mk k₂ d₂ =>
      rcases mat5Lt_trichotomy k₁ k₂ with hlt | heq | hgt
      · have h0 := hlk k₁
        simp only [lookupEntries, ite_eq_left rfl] at h0
        have hne12 : k₂ ≠ k₁ := fun h => by rw [h, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        rw [ite_eq_right hne12] at h0
        have hvan : lookupEntries k₁ r₂ = v1FullDock :=
          lookupEntries_not_lt k₁ r₂ (fun q hq => mat5Lt_trans k₁ k₂ q.1 hlt (hs₂.1 q hq))
        rw [hvan] at h0
        exact absurd h0 (hne₁ (k₁, d₁) (List.Mem.head r₁))
      · have hd : d₁ = d₂ := by
          have h0 := hlk k₁
          simp only [lookupEntries, ite_eq_left rfl, heq] at h0
          exact h0
        have hr : r₁ = r₂ := by
          apply ih r₂ hs₁.2 hs₂.2
            (fun q hq => hne₁ q (List.Mem.tail _ hq))
            (fun q hq => hne₂ q (List.Mem.tail _ hq))
          intro g
          if hgk : k₁ = g then
            rw [← hgk,
                lookupEntries_not_lt k₁ r₁ hs₁.1,
                lookupEntries_not_lt k₁ r₂ (by rw [heq]; exact hs₂.1)]
          else
            have h0 := hlk g
            simp only [lookupEntries, ite_eq_right hgk, ← heq] at h0
            exact h0
        rw [heq, hd, hr]
      · have h0 := hlk k₂
        simp only [lookupEntries, ite_eq_left rfl] at h0
        have hne21 : k₁ ≠ k₂ := fun h => by rw [h, mat5Lt_irrefl] at hgt; exact Bool.noConfusion hgt
        rw [ite_eq_right hne21] at h0
        have hvan : lookupEntries k₂ r₁ = v1FullDock :=
          lookupEntries_not_lt k₂ r₁ (fun q hq => mat5Lt_trans k₂ k₁ q.1 hgt (hs₁.1 q hq))
        rw [hvan] at h0
        exact absurd h0.symm (hne₂ (k₂, d₂) (List.Mem.head r₂))

/-- Canonical extensionality for infinite-honeycomb configurations: equal lookup everywhere implies equality. -/
private theorem honeycombConfig_ext (c₁ c₂ : HoneycombConfig)
    (h : ∀ g : Mat5, c₁.lookup g = c₂.lookup g) : c₁ = c₂ :=
  (honeycombConfig_eq_iff c₁ c₂).mpr
    (sortedEntries_ext c₁.entries c₂.entries c₁.sorted c₂.sorted c₁.nonEmpty c₂.nonEmpty h)

private theorem activeDocks_nodup (c : HoneycombConfig) : IsNodup c.activeDocks := by
  unfold HoneycombConfig.activeDocks
  have hAux : ∀ es : List (Mat5 × FullDock), SortedEntries es → IsNodup (es.map Prod.fst) := by
    intro es hs
    induction es with
    | nil => exact IsNodup.nil
    | cons p rest ih =>
      cases p with | mk k d =>
      simp only [List.map]
      refine IsNodup.cons ?_ (ih hs.2)
      intro hmem
      obtain ⟨q, hq, hqk⟩ := (mem_map_iff Prod.fst rest k).mp hmem
      have hlt := hs.1 q hq
      rw [hqk, mat5Lt_irrefl] at hlt
      exact Bool.noConfusion hlt
  exact hAux c.entries c.sorted

private theorem mem_activeDocks_iff (c : HoneycombConfig) (g : Mat5) :
    g ∈ c.activeDocks ↔ c.lookup g ≠ v1FullDock := by
  unfold HoneycombConfig.activeDocks HoneycombConfig.lookup
  have hAux : ∀ es : List (Mat5 × FullDock), SortedEntries es →
      (∀ p, p ∈ es → p.2 ≠ v1FullDock) →
      (g ∈ es.map Prod.fst ↔ lookupEntries g es ≠ v1FullDock) := by
    intro es hs hne
    induction es with
    | nil =>
      simp only [List.map, lookupEntries]
      exact ⟨fun h => nomatch h, fun h => absurd rfl h⟩
    | cons p rest ih =>
      cases p with | mk k d =>
      simp only [List.map, lookupEntries]
      if hkg : k = g then
        rw [ite_eq_left hkg, hkg]
        exact ⟨fun _ => hne (g, d) (by rw [← hkg]; exact List.Mem.head rest), fun _ => List.Mem.head _⟩
      else
        rw [ite_eq_right hkg]
        have hih := ih hs.2 (fun q hq => hne q (List.Mem.tail _ hq))
        constructor
        · intro hm
          cases hm with
          | head => exact absurd rfl hkg
          | tail _ h' => exact hih.mp h'
        · intro hneL
          exact List.Mem.tail k (hih.mpr hneL)
  exact hAux c.entries c.sorted c.nonEmpty

private def setEntries (g : Mat5) (d : FullDock) : List (Mat5 × FullDock) → List (Mat5 × FullDock)
  | [] => if d = v1FullDock then [] else [(g, d)]
  | (k, dk) :: rest =>
    if mat5Lt g k then
      if d = v1FullDock then (k, dk) :: rest else (g, d) :: (k, dk) :: rest
    else if k = g then
      if d = v1FullDock then rest else (g, d) :: rest
    else
      (k, dk) :: setEntries g d rest

private theorem mem_setEntries_keys (g : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (p : Mat5 × FullDock) (hp : p ∈ setEntries g d es) :
    p.1 = g ∨ ∃ q : Mat5 × FullDock, q ∈ es ∧ q.1 = p.1 := by
  induction es with
  | nil =>
    simp only [setEntries] at hp
    if hd : d = v1FullDock then
      rw [ite_eq_left hd] at hp; cases hp
    else
      rw [ite_eq_right hd] at hp
      cases hp with
      | head => exact Or.inl rfl
      | tail _ h' => cases h'
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries] at hp
    if hlt : mat5Lt g k = true then
      rw [ite_eq_left hlt] at hp
      if hd : d = v1FullDock then
        rw [ite_eq_left hd] at hp
        exact Or.inr ⟨p, hp, rfl⟩
      else
        rw [ite_eq_right hd] at hp
        cases hp with
        | head => exact Or.inl rfl
        | tail _ h' => exact Or.inr ⟨p, h', rfl⟩
    else
      rw [ite_eq_right hlt] at hp
      if hkg : k = g then
        rw [ite_eq_left hkg] at hp
        if hd : d = v1FullDock then
          rw [ite_eq_left hd] at hp
          exact Or.inr ⟨p, List.Mem.tail _ hp, rfl⟩
        else
          rw [ite_eq_right hd] at hp
          cases hp with
          | head => exact Or.inl rfl
          | tail _ h' => exact Or.inr ⟨p, List.Mem.tail _ h', rfl⟩
      else
        rw [ite_eq_right hkg] at hp
        cases hp with
        | head => exact Or.inr ⟨(k, dk), List.Mem.head rest, rfl⟩
        | tail _ h' =>
          rcases ih h' with h1 | ⟨q', hq', hq'p⟩
          · exact Or.inl h1
          · exact Or.inr ⟨q', List.Mem.tail _ hq', hq'p⟩

private theorem setEntries_sorted (g : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hs : SortedEntries es) : SortedEntries (setEntries g d es) := by
  induction es with
  | nil =>
    simp only [setEntries]
    if hd : d = v1FullDock then
      rw [ite_eq_left hd]; trivial
    else
      rw [ite_eq_right hd]; exact ⟨fun _ h => nomatch h, trivial⟩
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries]
    if hlt : mat5Lt g k = true then
      rw [ite_eq_left hlt]
      if hd : d = v1FullDock then
        rw [ite_eq_left hd]; exact hs
      else
        rw [ite_eq_right hd]
        refine ⟨?_, hs⟩
        intro p hp
        cases hp with
        | head => exact hlt
        | tail _ h' => exact mat5Lt_trans g k p.1 hlt (hs.1 p h')
    else
      rw [ite_eq_right hlt]
      if hkg : k = g then
        rw [ite_eq_left hkg]
        if hd : d = v1FullDock then
          rw [ite_eq_left hd]; exact hs.2
        else
          rw [ite_eq_right hd]; exact ⟨fun p hp => by rw [← hkg]; exact hs.1 p hp, hs.2⟩
      else
        rw [ite_eq_right hkg]
        have hklg : mat5Lt k g = true := by
          rcases mat5Lt_trichotomy g k with h1 | h2 | h3
          · exact absurd h1 hlt
          · exact absurd h2.symm hkg
          · exact h3
        refine ⟨?_, ih hs.2⟩
        intro p hp
        rcases mem_setEntries_keys g d rest p hp with hpg | ⟨q', hq', hq'p⟩
        · rw [hpg]; exact hklg
        · rw [← hq'p]; exact hs.1 q' hq'

private theorem setEntries_nonEmpty (g : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hne : ∀ p, p ∈ es → p.2 ≠ v1FullDock) :
    ∀ p, p ∈ setEntries g d es → p.2 ≠ v1FullDock := by
  induction es with
  | nil =>
    intro p hp
    simp only [setEntries] at hp
    if hd : d = v1FullDock then
      rw [ite_eq_left hd] at hp; cases hp
    else
      rw [ite_eq_right hd] at hp
      cases hp with
      | head => exact hd
      | tail _ h' => cases h'
  | cons q rest ih =>
    cases q with | mk k dk =>
    intro p hp
    simp only [setEntries] at hp
    if hlt : mat5Lt g k = true then
      rw [ite_eq_left hlt] at hp
      if hd : d = v1FullDock then
        rw [ite_eq_left hd] at hp; exact hne p hp
      else
        rw [ite_eq_right hd] at hp
        cases hp with
        | head => exact hd
        | tail _ h' => exact hne p h'
    else
      rw [ite_eq_right hlt] at hp
      if hkg : k = g then
        rw [ite_eq_left hkg] at hp
        if hd : d = v1FullDock then
          rw [ite_eq_left hd] at hp; exact hne p (List.Mem.tail _ hp)
        else
          rw [ite_eq_right hd] at hp
          cases hp with
          | head => exact hd
          | tail _ h' => exact hne p (List.Mem.tail _ h')
      else
        rw [ite_eq_right hkg] at hp
        cases hp with
        | head => exact hne (k, dk) (List.Mem.head rest)
        | tail _ h' => exact ih (fun r hr => hne r (List.Mem.tail _ hr)) p h'

private theorem lookupEntries_setEntries (g h : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hs : SortedEntries es) :
    lookupEntries h (setEntries g d es) = if h = g then d else lookupEntries h es := by
  induction es with
  | nil =>
    simp only [setEntries]
    if hd : d = v1FullDock then
      rw [ite_eq_left hd]; simp only [lookupEntries]
      if hhg : h = g then rw [ite_eq_left hhg, hd] else rw [ite_eq_right hhg]
    else
      rw [ite_eq_right hd]; simp only [lookupEntries]
      if hhg : h = g then rw [ite_eq_left hhg, ite_eq_left hhg.symm]
      else
        have hgh : g ≠ h := fun e => hhg e.symm
        rw [ite_eq_right hhg, ite_eq_right hgh]
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries]
    if hlt : mat5Lt g k = true then
      rw [ite_eq_left hlt]
      if hd : d = v1FullDock then
        rw [ite_eq_left hd]
        if hhg : h = g then
          rw [ite_eq_left hhg, hd, hhg]
          have hkg : k ≠ g := fun e => by rw [e, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
          simp only [lookupEntries, ite_eq_right hkg]
          exact lookupEntries_not_lt g rest (fun p hp => mat5Lt_trans g k p.1 hlt (hs.1 p hp))
        else
          rw [ite_eq_right hhg]
      else
        rw [ite_eq_right hd]
        simp only [lookupEntries]
        if hhg : h = g then
          rw [ite_eq_left hhg, ite_eq_left hhg.symm]
        else
          have hgh : g ≠ h := fun e => hhg e.symm
          rw [ite_eq_right hhg, ite_eq_right hgh]
    else
      rw [ite_eq_right hlt]
      if hkg : k = g then
        rw [ite_eq_left hkg]
        if hd : d = v1FullDock then
          rw [ite_eq_left hd]
          if hhg : h = g then
            rw [ite_eq_left hhg, hd, hhg]
            exact lookupEntries_not_lt g rest (by rw [← hkg]; exact hs.1)
          else
            have hkh : k ≠ h := by rw [hkg]; exact fun e => hhg e.symm
            rw [ite_eq_right hhg]; simp only [lookupEntries, ite_eq_right hkh]
        else
          rw [ite_eq_right hd]
          simp only [lookupEntries]
          if hhg : h = g then
            rw [ite_eq_left hhg, ite_eq_left hhg.symm]
          else
            have hgh : g ≠ h := fun e => hhg e.symm
            have hkh : k ≠ h := by rw [hkg]; exact hgh
            rw [ite_eq_right hhg, ite_eq_right hgh, ite_eq_right hkh]
      else
        rw [ite_eq_right hkg]
        simp only [lookupEntries]
        if hkh : k = h then
          have hhg : h ≠ g := by rw [← hkh]; exact hkg
          rw [ite_eq_left hkh, ite_eq_right hhg]
        else
          rw [ite_eq_right hkh, ih hs.2]

/-- Update dock `g` of `c` to `d` (deleting `g` if `d = v1FullDock`). -/
def HoneycombConfig.setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock) : HoneycombConfig :=
  ⟨setEntries g d c.entries, setEntries_sorted g d c.entries c.sorted,
   setEntries_nonEmpty g d c.entries c.nonEmpty⟩

private theorem lookup_setDock (c : HoneycombConfig) (g h : Mat5) (d : FullDock) :
    (c.setDock g d).lookup h = if h = g then d else c.lookup h :=
  lookupEntries_setEntries g h d c.entries c.sorted

private theorem setDock_lookup_self (c : HoneycombConfig) (g : Mat5) :
    c.setDock g (c.lookup g) = c := by
  apply honeycombConfig_ext; intro h; rw [lookup_setDock]
  if hhg : h = g then rw [ite_eq_left hhg, hhg] else rw [ite_eq_right hhg]

private theorem setDock_setDock_same (c : HoneycombConfig) (g : Mat5) (d₁ d₂ : FullDock) :
    (c.setDock g d₁).setDock g d₂ = c.setDock g d₂ := by
  apply honeycombConfig_ext; intro h; rw [lookup_setDock, lookup_setDock, lookup_setDock]
  if hhg : h = g then rw [ite_eq_left hhg] else rw [ite_eq_right hhg]

private theorem setDock_setDock_comm (c : HoneycombConfig) (g₁ g₂ : Mat5) (d₁ d₂ : FullDock)
    (hne : g₁ ≠ g₂) :
    (c.setDock g₁ d₁).setDock g₂ d₂ = (c.setDock g₂ d₂).setDock g₁ d₁ := by
  apply honeycombConfig_ext; intro h
  rw [lookup_setDock, lookup_setDock, lookup_setDock, lookup_setDock]
  if h2 : h = g₂ then
    have h1 : h ≠ g₁ := by rw [h2]; exact fun e => hne e.symm
    simp only [ite_eq_left h2, ite_eq_right h1]
  else
    rw [ite_eq_right h2]
    if h1 : h = g₁ then simp only [ite_eq_left h1] else simp only [ite_eq_right h1, ite_eq_right h2]

private theorem sortedEntries_map_fst_eq (es₁ es₂ : List (Mat5 × FullDock))
    (hs₁ : SortedEntries es₁) (hs₂ : SortedEntries es₂)
    (hm : ∀ k : Mat5, k ∈ es₁.map Prod.fst ↔ k ∈ es₂.map Prod.fst) :
    es₁.map Prod.fst = es₂.map Prod.fst := by
  induction es₁ generalizing es₂ with
  | nil =>
    cases es₂ with
    | nil => rfl
    | cons p _ =>
      have hc := (hm p.1).mpr (List.Mem.head _)
      cases hc
  | cons p₁ r₁ ih =>
    cases es₂ with
    | nil =>
      have hc := (hm p₁.1).mp (List.Mem.head _)
      cases hc
    | cons p₂ r₂ =>
      simp only [List.map]
      have h12 : p₁.1 = p₂.1 := by
        have h1in2 : p₁.1 ∈ (p₂ :: r₂).map Prod.fst := (hm p₁.1).mp (List.Mem.head _)
        have h2in1 : p₂.1 ∈ (p₁ :: r₁).map Prod.fst := (hm p₂.1).mpr (List.Mem.head _)
        cases h1in2 with
        | head => rfl
        | tail _ h1r =>
          obtain ⟨q2, hq2, hq2k⟩ := (mem_map_iff Prod.fst r₂ p₁.1).mp h1r
          have hlt1 : mat5Lt p₂.1 p₁.1 = true := by rw [← hq2k]; exact hs₂.1 q2 hq2
          cases h2in1 with
          | head => rw [mat5Lt_irrefl] at hlt1; exact Bool.noConfusion hlt1
          | tail _ h2r =>
            obtain ⟨q1, hq1, hq1k⟩ := (mem_map_iff Prod.fst r₁ p₂.1).mp h2r
            have hlt2 : mat5Lt p₁.1 p₂.1 = true := by rw [← hq1k]; exact hs₁.1 q1 hq1
            have hcontra := mat5Lt_trans p₁.1 p₂.1 p₁.1 hlt2 hlt1
            rw [mat5Lt_irrefl] at hcontra
            exact Bool.noConfusion hcontra
      rw [h12]
      apply congrArg (List.cons p₂.1)
      apply ih r₂ hs₁.2 hs₂.2
      intro k
      constructor
      · intro hk
        have hne : k ≠ p₂.1 := by
          obtain ⟨q1, hq1, hq1k⟩ := (mem_map_iff Prod.fst r₁ k).mp hk
          intro heq; have hlt := hs₁.1 q1 hq1
          rw [hq1k, heq, h12, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        have hin := (hm k).mp (List.Mem.tail p₁.1 hk)
        cases hin with
        | head => exact absurd rfl hne
        | tail _ h' => exact h'
      · intro hk
        have hne : k ≠ p₁.1 := by
          obtain ⟨q2, hq2, hq2k⟩ := (mem_map_iff Prod.fst r₂ k).mp hk
          intro heq; have hlt := hs₂.1 q2 hq2
          rw [hq2k, heq, h12, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        have hin := (hm k).mpr (List.Mem.tail p₂.1 hk)
        cases hin with
        | head => exact absurd rfl hne
        | tail _ h' => exact h'

private theorem activeDocks_setDock_eq (c : HoneycombConfig) (g : Mat5) (d : FullDock)
    (hSame : d = v1FullDock ↔ c.lookup g = v1FullDock) :
    (c.setDock g d).activeDocks = c.activeDocks := by
  apply sortedEntries_map_fst_eq (c.setDock g d).entries c.entries (c.setDock g d).sorted c.sorted
  intro h
  change h ∈ (c.setDock g d).activeDocks ↔ h ∈ c.activeDocks
  rw [mem_activeDocks_iff, mem_activeDocks_iff, lookup_setDock]
  if hhg : h = g then
    rw [ite_eq_left hhg, hhg]
    exact ⟨fun hne h0 => hne (hSame.mpr h0), fun hne h0 => hne (hSame.mp h0)⟩
  else
    rw [ite_eq_right hhg]

/-- Build a canonical `HoneycombConfig` from a finite candidate site list `cand` and dock assignment `f`. -/
def ofSites (cand : List Mat5) (f : Mat5 → FullDock) : HoneycombConfig :=
  cand.foldl (fun acc g => acc.setDock g (f g)) v1Config

private theorem lookup_ofSites_foldl (cand : List Mat5) (f : Mat5 → FullDock)
    (init : HoneycombConfig) (g : Mat5) :
    (cand.foldl (fun acc k => acc.setDock k (f k)) init).lookup g =
      if memBool g cand then f g else init.lookup g := by
  induction cand generalizing init with
  | nil => rfl
  | cons k rest ih =>
    simp only [List.foldl, memBool]
    rw [ih (init.setDock k (f k))]
    if hkg : k = g then
      rw [ite_eq_left hkg]
      cases hm : memBool g rest with
      | true => rw [ite_eq_left rfl]
      | false =>
        rw [ite_eq_right (by decide : false ≠ true), lookup_setDock, ite_eq_left hkg.symm]
    else
      rw [ite_eq_right hkg]
      cases hm : memBool g rest with
      | true => rw [ite_eq_left rfl]
      | false =>
        have hgk : g ≠ k := fun e => hkg e.symm
        rw [ite_eq_right (by decide : false ≠ true), lookup_setDock, ite_eq_right hgk]

private theorem lookup_ofSites (cand : List Mat5) (f : Mat5 → FullDock)
    (hvan : ∀ g : Mat5, g ∉ cand → f g = v1FullDock) (g : Mat5) :
    (ofSites cand f).lookup g = f g := by
  unfold ofSites
  rw [lookup_ofSites_foldl]
  cases hm : memBool g cand with
  | true => rfl
  | false =>
    change v1FullDock = f g
    refine (hvan g ?_).symm
    intro hmem
    have ht := (memBool_eq_true_iff g cand).mpr hmem
    rw [hm] at ht
    exact Bool.noConfusion ht

/-- Exact integer sum of `f` over a list `xs`. -/
def fockSumInt {α : Type} : List α → (α → Int) → Int
  | [], _ => 0
  | x :: xs, f => f x + fockSumInt xs f

private theorem fockSumInt_zero_of_all_zero {α : Type} (xs : List α) (f : α → Int)
    (h : ∀ x, x ∈ xs → f x = 0) : fockSumInt xs f = 0 := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [fockSumInt]
    rw [h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]
    omega

private theorem fockSumInt_congr {α : Type} (xs : List α) (f g : α → Int)
    (h : ∀ x, x ∈ xs → f x = g x) : fockSumInt xs f = fockSumInt xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [fockSumInt]
    rw [h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]

private theorem fockSumInt_add {α : Type} (xs : List α) (f g : α → Int) :
    fockSumInt xs (fun x => f x + g x) = fockSumInt xs f + fockSumInt xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [fockSumInt]; rw [ih]; omega

private theorem fockSumInt_swap {α β : Type} (xs : List α) (ys : List β) (f : α → β → Int) :
    fockSumInt xs (fun x => fockSumInt ys (fun y => f x y)) =
      fockSumInt ys (fun y => fockSumInt xs (fun x => f x y)) := by
  induction xs with
  | nil =>
    simp only [fockSumInt]
    exact (fockSumInt_zero_of_all_zero ys (fun _ => 0) (fun _ _ => rfl)).symm
  | cons x rest ih =>
    simp only [fockSumInt]
    rw [ih, ← fockSumInt_add]

private theorem fockSumInt_map {α β : Type} (xs : List α) (g : α → β) (f : β → Int) :
    fockSumInt (xs.map g) f = fockSumInt xs (fun x => f (g x)) := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [List.map, fockSumInt]; rw [ih]

private theorem fockSumInt_eraseOne {α : Type} [DecidableEq α] (a : α) (xs : List α) (f : α → Int)
    (hmem : a ∈ xs) :
    fockSumInt xs f = f a + fockSumInt (eraseOne a xs) f := by
  induction xs with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, fockSumInt]
    if hxa : x = a then
      rw [ite_eq_left hxa, hxa]
    else
      rw [ite_eq_right hxa]; simp only [fockSumInt]
      cases hmem with
      | head => exact absurd rfl hxa
      | tail _ h' => rw [ih h']; omega

private theorem fockSumInt_subset_eq {α : Type} [DecidableEq α] (s₁ s₂ : List α) (f : α → Int)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hsub : ∀ x, x ∈ s₁ → x ∈ s₂) (hvan : ∀ x, x ∈ s₂ → x ∉ s₁ → f x = 0) :
    fockSumInt s₁ f = fockSumInt s₂ f := by
  induction h1 generalizing s₂ with
  | nil =>
    simp only [fockSumInt]
    exact (fockSumInt_zero_of_all_zero s₂ f (fun x hx => hvan x hx (fun hm => nomatch hm))).symm
  | @cons a rest hnot _ ih =>
    rw [fockSumInt_eraseOne a s₂ f (hsub a (List.Mem.head rest))]
    simp only [fockSumInt]
    have hRest := ih (eraseOne a s₂) (isNodup_eraseOne a h2)
      (fun x hx => (mem_eraseOne_iff a x h2).mpr ⟨hsub x (List.Mem.tail a hx), fun hxa => by rw [hxa] at hx; exact hnot hx⟩)
      (fun x hx hxnot => by
        have ⟨hx2, hne⟩ := (mem_eraseOne_iff a x h2).mp hx
        refine hvan x hx2 (fun hm => match hm with | List.Mem.head _ => hne rfl | List.Mem.tail _ h' => hxnot h'))
    rw [hRest]

private theorem fockSumInt_support_indep {α : Type} [DecidableEq α] (s₁ s₂ : List α) (f : α → Int)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hv1 : ∀ x, x ∉ s₁ → f x = 0) (hv2 : ∀ x, x ∉ s₂ → f x = 0) :
    fockSumInt s₁ f = fockSumInt s₂ f := by
  let u := nodupUnion s₁ s₂
  have hu := isNodup_nodupUnion h1 s₂
  rw [fockSumInt_subset_eq s₁ u f h1 hu (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inl hx)) (fun x _ hx1 => hv1 x hx1),
      fockSumInt_subset_eq s₂ u f h2 hu (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inr hx)) (fun x _ hx2 => hv2 x hx2)]

private theorem fullDockCharge_eq_fockSumInt (d : FullDock) :
    fullDockCharge d = fockSumInt (List.finRange 24) (fun a => (d a).charge) := by
  unfold fullDockCharge
  have hAux : ∀ (xs : List (Fin 24)) (init : Int),
      xs.foldl (fun acc a => acc + (d a).charge) init = init + fockSumInt xs (fun a => (d a).charge) := by
    intro xs
    induction xs with
    | nil => intro init; simp only [List.foldl, fockSumInt]; omega
    | cons x rest ih =>
      intro init
      simp only [List.foldl, fockSumInt]
      rw [ih (init + (d x).charge)]
      omega
  rw [hAux (List.finRange 24) 0]
  omega

private theorem fullDockCharge_v1 : fullDockCharge v1FullDock = 0 := by decide

/-- Exact total integer charge `Q(c) = ∑_{g ∈ activeDocks c} fullDockCharge (c.lookup g)`. -/
def totalCharge (c : HoneycombConfig) : Int :=
  fockSumInt c.activeDocks (fun g => fullDockCharge (c.lookup g))

private theorem totalCharge_eq_over_superset (c : HoneycombConfig) (V : List Mat5)
    (hnd : IsNodup V) (hsub : ∀ g, g ∈ c.activeDocks → g ∈ V) :
    totalCharge c = fockSumInt V (fun g => fullDockCharge (c.lookup g)) := by
  unfold totalCharge
  refine fockSumInt_subset_eq c.activeDocks V (fun g => fullDockCharge (c.lookup g))
    (activeDocks_nodup c) hnd hsub ?_
  intro g _ hgNot
  have hEmpty : c.lookup g = v1FullDock := by
    if h : c.lookup g = v1FullDock then exact h
    else exact absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  rw [hEmpty, fullDockCharge_v1]

private theorem totalCharge_setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock)
    (hSame : fullDockCharge d = fullDockCharge (c.lookup g)) :
    totalCharge (c.setDock g d) = totalCharge c := by
  let V := nodupUnion c.activeDocks (g :: (c.setDock g d).activeDocks)
  have hVnd : IsNodup V := isNodup_nodupUnion (activeDocks_nodup c) _
  rw [totalCharge_eq_over_superset (c.setDock g d) V hVnd
        (fun x hx => (mem_nodupUnion _ _ x).mpr (Or.inr (List.Mem.tail g hx))),
      totalCharge_eq_over_superset c V hVnd
        (fun x hx => (mem_nodupUnion _ _ x).mpr (Or.inl hx))]
  apply fockSumInt_congr
  intro x _
  rw [lookup_setDock]
  if hxg : x = g then rw [ite_eq_left hxg, hxg, hSame] else rw [ite_eq_right hxg]

/-! ### Exact Global Configuration Maps (`S`, `S⁻¹`, `R`, `C`, `P`, `CP`) on Infinite `{3,4,3,4}` -/

private theorem transport_inv_left (a : Fin 24) :
    mat5Mul (transport (oppSlot a)) (transport a) = mat5Id := by
  have h := thm_coxeter_transport_antipodal_inverse.2 (oppSlot a)
  rw [(thm_24_facets_geometry.2.1 a).1] at h
  exact h

private theorem transport_inv_right (a : Fin 24) :
    mat5Mul (transport a) (transport (oppSlot a)) = mat5Id :=
  thm_coxeter_transport_antipodal_inverse.2 a

/-- Exact 1-hop Coxeter stream `S` on infinite-honeycomb configurations:
    `(S c)(g, a) = c(g * k_{opp(a)}, a)` (matching `CoxeterTransport.honeycombStream`). -/
def streamConfig (c : HoneycombConfig) : HoneycombConfig :=
  let cand := flatMapList (fun g => (List.finRange 24).map (fun a => mat5Mul g (transport a))) c.activeDocks
  ofSites cand (fun g a => c.lookup (mat5Mul g (transport (oppSlot a))) a)

/-- Exact inverse 1-hop Coxeter stream `S⁻¹`: `(S⁻¹ c)(g, a) = c(g * k_a, a)`. -/
def streamConfigInv (c : HoneycombConfig) : HoneycombConfig :=
  let cand := flatMapList (fun g => (List.finRange 24).map (fun a => mat5Mul g (transport (oppSlot a)))) c.activeDocks
  ofSites cand (fun g a => c.lookup (mat5Mul g (transport a)) a)

/-- Exact antipodal slot reversal `R` on infinite-honeycomb configurations: `(R c)(g, a) = c(g, opp(a))`. -/
def revConfig (c : HoneycombConfig) : HoneycombConfig :=
  ofSites c.activeDocks (fun g => revFullDock (c.lookup g))

/-- Exact charge conjugation `C` on infinite-honeycomb configurations. -/
def conjConfig (c : HoneycombConfig) : HoneycombConfig :=
  ofSites c.activeDocks (fun g => conjFullDock (c.lookup g))

/-- Exact spatial parity `P` (`M_P = simpleRefl 0`) on infinite-honeycomb configurations. -/
def parityConfig (c : HoneycombConfig) : HoneycombConfig :=
  ofSites (c.activeDocks.map conjMatP) (fun g => parityFullDock (c.lookup (conjMatP g)))

/-- Combined `CP = C ∘ P` on infinite-honeycomb configurations. -/
def cpConfig (c : HoneycombConfig) : HoneycombConfig := conjConfig (parityConfig c)

private theorem mem_finRange24 (a : Fin 24) : a ∈ List.finRange 24 := by
  have h24 : ∀ x : Fin 24, memBool x (List.finRange 24) = true := by decide
  exact (memBool_eq_true_iff a (List.finRange 24)).mp (h24 a)

private theorem finRange24_nodup : IsNodup (List.finRange 24) :=
  isNodup_of_bool (List.finRange 24) (by decide)

private theorem exists_nonempty_of_ne_v1 (d : FullDock) (hne : d ≠ v1FullDock) :
    ∃ a : Fin 24, d a ≠ .empty := by
  have hAll : Decidable (∀ a : Fin 24, d a = .empty) := decEqFinAux 24 d v1FullDock
  cases hAll with
  | isTrue hall => exact absurd (funext hall) hne
  | isFalse hnot =>
    have findIdx : ∀ (xs : List (Fin 24)), (∃ a, a ∈ xs ∧ d a ≠ .empty) ∨ (∀ a, a ∈ xs → d a = .empty) := by
      intro xs
      induction xs with
      | nil => exact Or.inr (fun _ h => nomatch h)
      | cons x rest ih =>
        if hx : d x = .empty then
          rcases ih with ⟨a, ha, hda⟩ | hall
          · exact Or.inl ⟨a, List.Mem.tail x ha, hda⟩
          · exact Or.inr (fun a ha => match ha with | List.Mem.head _ => hx | List.Mem.tail _ h' => hall a h')
        else
          exact Or.inl ⟨x, List.Mem.head rest, hx⟩
    rcases findIdx (List.finRange 24) with ⟨a, _, hda⟩ | hall
    · exact ⟨a, hda⟩
    · exact absurd (fun a => hall a (mem_finRange24 a)) hnot

private theorem lookup_streamConfig (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (streamConfig c).lookup g a = c.lookup (mat5Mul g (transport (oppSlot a))) a := by
  unfold streamConfig
  have hvan : ∀ x : Mat5,
      x ∉ flatMapList (fun k => (List.finRange 24).map (fun b => mat5Mul k (transport b))) c.activeDocks →
      (fun b => c.lookup (mat5Mul x (transport (oppSlot b))) b) = v1FullDock := by
    intro x hx
    funext b
    if hb : c.lookup (mat5Mul x (transport (oppSlot b))) b = .empty then
      exact hb
    else
      have hneDock : c.lookup (mat5Mul x (transport (oppSlot b))) ≠ v1FullDock :=
        fun h0 => hb (congrFun h0 b)
      have hAct : mat5Mul x (transport (oppSlot b)) ∈ c.activeDocks :=
        (mem_activeDocks_iff c _).mpr hneDock
      have hBack : mat5Mul (mat5Mul x (transport (oppSlot b))) (transport b) = x := by
        rw [fb_mat5Mul_assoc, transport_inv_left b, fb_mat5Mul_id_right]
      have hIn : x ∈ flatMapList (fun k => (List.finRange 24).map (fun s => mat5Mul k (transport s))) c.activeDocks :=
        (mem_flatMapList_iff _ _ x).mpr
          ⟨mat5Mul x (transport (oppSlot b)), hAct,
           (mem_map_iff _ _ x).mpr ⟨b, mem_finRange24 b, hBack⟩⟩
      exact absurd hIn hx
  exact congrFun (lookup_ofSites _ _ hvan g) a

private theorem lookup_streamConfigInv (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (streamConfigInv c).lookup g a = c.lookup (mat5Mul g (transport a)) a := by
  unfold streamConfigInv
  have hvan : ∀ x : Mat5,
      x ∉ flatMapList (fun k => (List.finRange 24).map (fun b => mat5Mul k (transport (oppSlot b)))) c.activeDocks →
      (fun b => c.lookup (mat5Mul x (transport b)) b) = v1FullDock := by
    intro x hx
    funext b
    if hb : c.lookup (mat5Mul x (transport b)) b = .empty then
      exact hb
    else
      have hneDock : c.lookup (mat5Mul x (transport b)) ≠ v1FullDock :=
        fun h0 => hb (congrFun h0 b)
      have hAct : mat5Mul x (transport b) ∈ c.activeDocks :=
        (mem_activeDocks_iff c _).mpr hneDock
      have hBack : mat5Mul (mat5Mul x (transport b)) (transport (oppSlot b)) = x := by
        rw [fb_mat5Mul_assoc, transport_inv_right b, fb_mat5Mul_id_right]
      have hIn : x ∈ flatMapList (fun k => (List.finRange 24).map (fun s => mat5Mul k (transport (oppSlot s)))) c.activeDocks :=
        (mem_flatMapList_iff _ _ x).mpr
          ⟨mat5Mul x (transport b), hAct,
           (mem_map_iff _ _ x).mpr ⟨b, mem_finRange24 b, hBack⟩⟩
      exact absurd hIn hx
  exact congrFun (lookup_ofSites _ _ hvan g) a

private theorem lookup_revConfig (c : HoneycombConfig) (g : Mat5) :
    (revConfig c).lookup g = revFullDock (c.lookup g) := by
  unfold revConfig
  refine lookup_ofSites c.activeDocks (fun x => revFullDock (c.lookup x)) ?_ g
  intro x hx
  have h0 : c.lookup x = v1FullDock := by
    if h : c.lookup x = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c x).mpr h) hx
  rw [h0]; rfl

private theorem lookup_conjConfig (c : HoneycombConfig) (g : Mat5) :
    (conjConfig c).lookup g = conjFullDock (c.lookup g) := by
  unfold conjConfig
  refine lookup_ofSites c.activeDocks (fun x => conjFullDock (c.lookup x)) ?_ g
  intro x hx
  have h0 : c.lookup x = v1FullDock := by
    if h : c.lookup x = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c x).mpr h) hx
  rw [h0]; rfl

private theorem lookup_parityConfig (c : HoneycombConfig) (g : Mat5) :
    (parityConfig c).lookup g = parityFullDock (c.lookup (conjMatP g)) := by
  unfold parityConfig
  refine lookup_ofSites (c.activeDocks.map conjMatP) (fun x => parityFullDock (c.lookup (conjMatP x))) ?_ g
  intro x hx
  have h0 : c.lookup (conjMatP x) = v1FullDock := by
    if h : c.lookup (conjMatP x) = v1FullDock then exact h
    else
      have hIn := (mem_activeDocks_iff c (conjMatP x)).mpr h
      exact absurd ((mem_map_iff conjMatP c.activeDocks x).mpr ⟨conjMatP x, hIn, conjMatP_involutive x⟩) hx
  rw [h0]; rfl

private theorem lookup_cpConfig (c : HoneycombConfig) (g : Mat5) :
    (cpConfig c).lookup g = cpFullDock (c.lookup (conjMatP g)) := by
  unfold cpConfig cpFullDock
  rw [lookup_conjConfig, lookup_parityConfig]

private theorem activeDocks_revConfig (c : HoneycombConfig) :
    (revConfig c).activeDocks = c.activeDocks := by
  apply sortedEntries_map_fst_eq (revConfig c).entries c.entries (revConfig c).sorted c.sorted
  intro g
  change g ∈ (revConfig c).activeDocks ↔ g ∈ c.activeDocks
  rw [mem_activeDocks_iff, mem_activeDocks_iff, lookup_revConfig]
  constructor
  · intro hne h0; exact hne (by rw [h0]; rfl)
  · intro hne h0
    apply hne; funext a
    have := congrFun h0 (oppSlot a)
    unfold revFullDock at this
    rw [(thm_24_facets_geometry.2.1 a).1] at this
    exact this

/-- Headline Theorem 7 (Exact Infinite-Honeycomb Configuration Symmetries, Stream Reversal & Charge):
    on canonical finite-excitation configurations over infinite `{3,4,3,4}`:
    `S` is bijective (`S⁻¹ ∘ S = S ∘ S⁻¹ = id`), `R² = I`, `S R S = R`, `C² = P² = CP² = I`,
    `CP ∘ S = S ∘ CP`, `CP ∘ R = R ∘ CP`, `S v1Config = v1Config`, `totalCharge v1Config = 0`,
    and `totalCharge (S c) = totalCharge c` for EVERY configuration `c`. -/
theorem thm_fock_honeycomb_config_symmetries (c : HoneycombConfig) :
    streamConfigInv (streamConfig c) = c ∧
    streamConfig (streamConfigInv c) = c ∧
    revConfig (revConfig c) = c ∧
    streamConfig (revConfig (streamConfig c)) = revConfig c ∧
    conjConfig (conjConfig c) = c ∧
    parityConfig (parityConfig c) = c ∧
    cpConfig (cpConfig c) = c ∧
    cpConfig (streamConfig c) = streamConfig (cpConfig c) ∧
    cpConfig (revConfig c) = revConfig (cpConfig c) ∧
    streamConfig v1Config = v1Config ∧
    totalCharge v1Config = 0 ∧
    totalCharge (streamConfig c) = totalCharge c := by
  have hS1 : streamConfigInv (streamConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_streamConfigInv, lookup_streamConfig, fb_mat5Mul_assoc, transport_inv_right a, fb_mat5Mul_id_right]
  have hS2 : streamConfig (streamConfigInv c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_streamConfig, lookup_streamConfigInv, fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
  have hR2 : revConfig (revConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_revConfig, lookup_revConfig]; unfold revFullDock
    rw [(thm_24_facets_geometry.2.1 a).1]
  have hSRS : streamConfig (revConfig (streamConfig c)) = revConfig c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_streamConfig, lookup_revConfig, lookup_revConfig]
    unfold revFullDock
    rw [lookup_streamConfig, (thm_24_facets_geometry.2.1 a).1, fb_mat5Mul_assoc,
        transport_inv_left a, fb_mat5Mul_id_right]
  have hC2 : conjConfig (conjConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_conjConfig, lookup_conjConfig]; exact slotState_dual_dual _
  have hP2 : parityConfig (parityConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_parityConfig, lookup_parityConfig]; unfold parityFullDock
    rw [conjMatP_involutive, (line_geom_facts.2.2.2.2.1 a).1]
  have hCP2 : cpConfig (cpConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_cpConfig, lookup_cpConfig]; unfold cpFullDock conjFullDock parityFullDock
    rw [conjMatP_involutive, (line_geom_facts.2.2.2.2.1 a).1, slotState_dual_dual]
  have hCPS : cpConfig (streamConfig c) = streamConfig (cpConfig c) := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_cpConfig, lookup_streamConfig]
    unfold cpFullDock conjFullDock parityFullDock
    rw [lookup_streamConfig, lookup_cpConfig]
    unfold cpFullDock conjFullDock parityFullDock
    rw [conjMatP_mul, ← (line_geom_facts.2.2.2.2.1 a).2]
    have hT : conjMatP (transport (oppSlot a)) = transport (paritySlot (oppSlot a)) :=
      thm_fock_coxeter_parity_equivariance.2.2.2.1 (oppSlot a)
    rw [hT]
  have hCPR : cpConfig (revConfig c) = revConfig (cpConfig c) := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_cpConfig, lookup_revConfig]
    unfold cpFullDock conjFullDock parityFullDock revFullDock
    rw [lookup_cpConfig]
    unfold cpFullDock conjFullDock parityFullDock
    rw [(line_geom_facts.2.2.2.2.1 a).2]
  have hSv1 : streamConfig v1Config = v1Config := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_streamConfig]; rfl
  have hQv1 : totalCharge v1Config = 0 := rfl
  have hQS : totalCharge (streamConfig c) = totalCharge c := by
    unfold totalCharge
    have hLHS : fockSumInt (streamConfig c).activeDocks (fun g => fullDockCharge ((streamConfig c).lookup g)) =
        fockSumInt (List.finRange 24) (fun a =>
          fockSumInt (streamConfig c).activeDocks (fun g => ((streamConfig c).lookup g a).charge)) := by
      have h1 : (fun g => fullDockCharge ((streamConfig c).lookup g)) =
          (fun g => fockSumInt (List.finRange 24) (fun a => ((streamConfig c).lookup g a).charge)) :=
        funext (fun g => fullDockCharge_eq_fockSumInt _)
      rw [h1, fockSumInt_swap]
    have hRHS : fockSumInt c.activeDocks (fun g => fullDockCharge (c.lookup g)) =
        fockSumInt (List.finRange 24) (fun a =>
          fockSumInt c.activeDocks (fun g => (c.lookup g a).charge)) := by
      have h1 : (fun g => fullDockCharge (c.lookup g)) =
          (fun g => fockSumInt (List.finRange 24) (fun a => (c.lookup g a).charge)) :=
        funext (fun g => fullDockCharge_eq_fockSumInt _)
      rw [h1, fockSumInt_swap]
    rw [hLHS, hRHS]
    apply fockSumInt_congr
    intro a _
    let shifted := c.activeDocks.map (fun g => mat5Mul g (transport a))
    have hShNd : IsNodup shifted :=
      isNodup_map_inj (fun g => mat5Mul g (transport a))
        (fun x y hxy => by
          have := congrArg (fun m => mat5Mul m (transport (oppSlot a))) hxy
          rw [fb_mat5Mul_assoc, fb_mat5Mul_assoc, transport_inv_right a, fb_mat5Mul_id_right, fb_mat5Mul_id_right] at this
          exact this)
        (activeDocks_nodup c)
    have hEqS : fockSumInt (streamConfig c).activeDocks (fun g => ((streamConfig c).lookup g a).charge) =
        fockSumInt shifted (fun g => ((streamConfig c).lookup g a).charge) := by
      refine fockSumInt_support_indep (streamConfig c).activeDocks shifted _ (activeDocks_nodup _) hShNd ?_ ?_
      · intro g hg
        have h0 : (streamConfig c).lookup g = v1FullDock := by
          if h : (streamConfig c).lookup g = v1FullDock then exact h
          else exact absurd ((mem_activeDocks_iff _ g).mpr h) hg
        rw [h0]; rfl
      · intro g hg
        rw [lookup_streamConfig]
        have h0 : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock := by
          if h : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock then exact h
          else
            have hAct := (mem_activeDocks_iff c _).mpr h
            have hBack : mat5Mul (mat5Mul g (transport (oppSlot a))) (transport a) = g := by
              rw [fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
            exact absurd ((mem_map_iff _ _ g).mpr ⟨_, hAct, hBack⟩) hg
        rw [h0]; rfl
    rw [hEqS, fockSumInt_map]
    apply fockSumInt_congr
    intro g _
    rw [lookup_streamConfig, fb_mat5Mul_assoc, transport_inv_right a, fb_mat5Mul_id_right]
  exact ⟨hS1, hS2, hR2, hSRS, hC2, hP2, hCP2, hCPS, hCPR, hSv1, hQv1, hQS⟩


/-! ## Section 4: Global Infinite-Honeycomb Fock Lifting (`LocalSiteFamily`) & the 6 Concrete Operators -/

/-- A site-indexed family of Fock unitaries acting locally at each cell `g : Mat5` without
    creating or destroying active docks, fixing empty docks, and commuting across distinct cells. -/
structure LocalSiteFamily where
  unit : Mat5 → FockUnitary NinthLoc6 HoneycombConfig
  local_eq : ∀ (g : Mat5) (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig),
    (∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks →
      (∀ h : Mat5, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') →
    (unit g).op ψ₁ c = (unit g).op ψ₂ c
  local_dag_eq : ∀ (g : Mat5) (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig),
    (∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks →
      (∀ h : Mat5, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') →
    (unit g).dag ψ₁ c = (unit g).dag ψ₂ c
  op_zero : ∀ g : Mat5, (unit g).op zeroVec = zeroVec
  dag_zero : ∀ g : Mat5, (unit g).dag zeroVec = zeroVec
  idle_empty : ∀ (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig),
    c.lookup g = v1FullDock → (unit g).op ψ c = ψ c
  idle_dag_empty : ∀ (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig),
    c.lookup g = v1FullDock → (unit g).dag ψ c = ψ c
  comm_sites : ∀ (g₁ g₂ : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
    g₁ ≠ g₂ → (unit g₁).op ((unit g₂).op ψ) = (unit g₂).op ((unit g₁).op ψ)
  comm_dag_sites : ∀ (g₁ g₂ : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
    g₁ ≠ g₂ → (unit g₁).dag ((unit g₂).dag ψ) = (unit g₂).dag ((unit g₁).dag ψ)

/-- Apply a `LocalSiteFamily` over a finite list of cells `gs`. -/
def applySites (F : LocalSiteFamily) : List Mat5 →
    FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig
  | [], ψ => ψ
  | g :: gs, ψ => (F.unit g).op (applySites F gs ψ)

/-- Adjoint application of a `LocalSiteFamily` over `gs`. -/
def applySitesDag (F : LocalSiteFamily) : List Mat5 →
    FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig
  | [], ψ => ψ
  | g :: gs, ψ => applySitesDag F gs ((F.unit g).dag ψ)

/-- Finite-site `FockUnitary` product of `F` over `gs`. -/
def applySitesUnitary (F : LocalSiteFamily) : List Mat5 → FockUnitary NinthLoc6 HoneycombConfig
  | [] => FockUnitary.id
  | g :: gs => FockUnitary.comp (F.unit g) (applySitesUnitary F gs)

/-- Global infinite-honeycomb Fock operator lifted from `F : LocalSiteFamily`. -/
def globalOp (F : LocalSiteFamily) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) : NinthLoc6 :=
  applySites F c.activeDocks ψ c

/-- Global infinite-honeycomb Fock adjoint lifted from `F : LocalSiteFamily`. -/
def globalDag (F : LocalSiteFamily) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) : NinthLoc6 :=
  applySitesDag F c.activeDocks ψ c

private theorem applySitesUnitary_op (F : LocalSiteFamily) (gs : List Mat5) :
    (applySitesUnitary F gs).op = applySites F gs := by
  induction gs with
  | nil => rfl
  | cons g rest ih =>
    funext ψ; simp only [applySitesUnitary, FockUnitary.comp, applySites]; rw [ih]

private theorem applySitesUnitary_dag (F : LocalSiteFamily) (gs : List Mat5) :
    (applySitesUnitary F gs).dag = applySitesDag F gs := by
  induction gs with
  | nil => rfl
  | cons g rest ih =>
    funext ψ; simp only [applySitesUnitary, FockUnitary.comp, applySitesDag]; rw [ih]

private theorem applySites_zero (F : LocalSiteFamily) (gs : List Mat5) :
    applySites F gs zeroVec = zeroVec := by
  induction gs with
  | nil => rfl
  | cons g rest ih => simp only [applySites]; rw [ih, F.op_zero]

private theorem applySitesDag_zero (F : LocalSiteFamily) (gs : List Mat5) :
    applySitesDag F gs zeroVec = zeroVec := by
  induction gs with
  | nil => rfl
  | cons g rest ih => simp only [applySitesDag]; rw [F.dag_zero, ih]

private theorem applySites_local_eq (F : LocalSiteFamily) (gs : List Mat5)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ₁ c' = ψ₂ c') :
    applySites F gs ψ₁ c = applySites F gs ψ₂ c := by
  induction gs generalizing c with
  | nil => exact h c rfl
  | cons g rest ih =>
    simp only [applySites]
    apply F.local_eq g _ _ c
    intro c' hc' _
    exact ih c' (fun c'' hc'' => h c'' (hc''.trans hc'))

private theorem applySitesDag_local_eq (F : LocalSiteFamily) (gs : List Mat5)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ₁ c' = ψ₂ c') :
    applySitesDag F gs ψ₁ c = applySitesDag F gs ψ₂ c := by
  induction gs generalizing ψ₁ ψ₂ c with
  | nil => exact h c rfl
  | cons g rest ih =>
    simp only [applySitesDag]
    apply ih _ _ c
    intro c' hc'
    apply F.local_dag_eq g _ _ c'
    intro c'' hc'' _
    exact h c'' (hc''.trans hc')

private theorem applySites_erase (F : LocalSiteFamily) (g : Mat5) (gs : List Mat5)
    (hmem : g ∈ gs) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySites F gs ψ = (F.unit g).op (applySites F (eraseOne g gs) ψ) := by
  induction gs with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, applySites]
    if hxg : x = g then
      rw [ite_eq_left hxg, hxg]
    else
      rw [ite_eq_right hxg]
      simp only [applySites]
      cases hmem with
      | head => exact absurd rfl hxg
      | tail _ h' =>
        rw [ih h', F.comm_sites x g _ hxg]

private theorem applySitesDag_erase (F : LocalSiteFamily) (g : Mat5) (gs : List Mat5)
    (hmem : g ∈ gs) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySitesDag F gs ψ = applySitesDag F (eraseOne g gs) ((F.unit g).dag ψ) := by
  induction gs generalizing ψ with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, applySitesDag]
    if hxg : x = g then
      rw [ite_eq_left hxg, hxg]
    else
      rw [ite_eq_right hxg]
      simp only [applySitesDag]
      cases hmem with
      | head => exact absurd rfl hxg
      | tail _ h' =>
        rw [ih h' ((F.unit x).dag ψ), F.comm_dag_sites g x ψ (fun e => hxg e.symm)]

private theorem applySites_superset (F : LocalSiteFamily) (xs V : List Mat5)
    (hxs : IsNodup xs) (hV : IsNodup V)
    (hsub : ∀ g, g ∈ xs → g ∈ V)
    (c : HoneycombConfig) (hidle : ∀ g, g ∈ V → g ∉ xs → c.lookup g = v1FullDock)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySites F V ψ c = applySites F xs ψ c := by
  induction hxs generalizing V c ψ with
  | nil =>
    simp only [applySites]
    induction V with
    | nil => rfl
    | cons v rest ihV =>
      simp only [applySites]
      rw [F.idle_empty v _ c (hidle v (List.Mem.head rest) (fun h => nomatch h))]
      exact ihV (match hV with | IsNodup.cons _ hr => hr) (fun _ h => nomatch h)
        (fun g hg hnot => hidle g (List.Mem.tail v hg) hnot)
  | @cons g rest hnot _ ih =>
    rw [applySites_erase F g V (hsub g (List.Mem.head rest)) ψ]
    simp only [applySites]
    apply F.local_eq g _ _ c
    intro c' _ hOther
    apply ih (eraseOne g V) (isNodup_eraseOne g hV)
    · intro x hx
      refine (mem_eraseOne_iff g x hV).mpr ⟨hsub x (List.Mem.tail g hx), ?_⟩
      intro hxg; rw [hxg] at hx; exact hnot hx
    · intro x hx hxnot
      have ⟨hxV, hne⟩ := (mem_eraseOne_iff g x hV).mp hx
      rw [hOther x hne]
      refine hidle x hxV (fun hm => match hm with | List.Mem.head _ => hne rfl | List.Mem.tail _ h' => hxnot h')

private theorem applySitesDag_superset (F : LocalSiteFamily) (xs V : List Mat5)
    (hxs : IsNodup xs) (hV : IsNodup V)
    (hsub : ∀ g, g ∈ xs → g ∈ V)
    (c : HoneycombConfig) (hidle : ∀ g, g ∈ V → g ∉ xs → c.lookup g = v1FullDock)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySitesDag F V ψ c = applySitesDag F xs ψ c := by
  induction hxs generalizing V c ψ with
  | nil =>
    simp only [applySitesDag]
    induction V generalizing ψ with
    | nil => rfl
    | cons v rest ihV =>
      simp only [applySitesDag]
      have hStep := ihV (match hV with | IsNodup.cons _ hr => hr) (fun _ h => nomatch h)
        (fun g hg hnot => hidle g (List.Mem.tail v hg) hnot) ((F.unit v).dag ψ)
      rw [hStep, F.idle_dag_empty v ψ c (hidle v (List.Mem.head rest) (fun h => nomatch h))]
  | @cons g rest hnot _ ih =>
    rw [applySitesDag_erase F g V (hsub g (List.Mem.head rest)) ψ]
    simp only [applySitesDag]
    apply ih (eraseOne g V) (isNodup_eraseOne g hV)
    · intro x hx
      refine (mem_eraseOne_iff g x hV).mpr ⟨hsub x (List.Mem.tail g hx), ?_⟩
      intro hxg; rw [hxg] at hx; exact hnot hx
    · intro x hx hxnot
      have ⟨hxV, hne⟩ := (mem_eraseOne_iff g x hV).mp hx
      refine hidle x hxV (fun hm => match hm with | List.Mem.head _ => hne rfl | List.Mem.tail _ h' => hxnot h')

/-- Collect the duplicate-free union of all active cells across a finite configuration list `s`. -/
def collectSites (s : List HoneycombConfig) : List Mat5 :=
  dedupList (flatMapList HoneycombConfig.activeDocks s)

private theorem globalOp_eq_applySites_on_supp (F : LocalSiteFamily)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (s : List HoneycombConfig) (hs : SuppIn s ψ)
    (V : List Mat5) (hVnd : IsNodup V) (hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V) :
    globalOp F ψ = applySites F V ψ := by
  funext c
  unfold globalOp
  cases hAllB : c.activeDocks.all (fun g => memBool g V) with
  | true =>
    have hAll : ∀ g, g ∈ c.activeDocks → g ∈ V := fun g hg =>
      (memBool_eq_true_iff g V).mp ((list_all_eq_true_iff _ _).mp hAllB g hg)
    refine (applySites_superset F c.activeDocks V (activeDocks_nodup c) hVnd hAll c ?_ ψ).symm
    intro g _ hgNot
    if h : c.lookup g = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  | false =>
    have hNotAll : ¬ (∀ g, g ∈ c.activeDocks → g ∈ V) := by
      intro hAll
      have hT : c.activeDocks.all (fun g => memBool g V) = true :=
        (list_all_eq_true_iff _ _).mpr (fun g hg => (memBool_eq_true_iff g V).mpr (hAll g hg))
      rw [hAllB] at hT
      exact Bool.noConfusion hT
    have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' := by
      intro c' hc'
      apply hs.2
      intro hc's
      apply hNotAll
      intro g hg
      rw [← hc'] at hg
      exact hVcov c' hc's g hg
    rw [applySites_local_eq F c.activeDocks ψ zeroVec c hVan,
        applySites_local_eq F V ψ zeroVec c hVan,
        applySites_zero, applySites_zero]

private theorem globalDag_eq_applySitesDag_on_supp (F : LocalSiteFamily)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (s : List HoneycombConfig) (hs : SuppIn s ψ)
    (V : List Mat5) (hVnd : IsNodup V) (hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V) :
    globalDag F ψ = applySitesDag F V ψ := by
  funext c
  unfold globalDag
  cases hAllB : c.activeDocks.all (fun g => memBool g V) with
  | true =>
    have hAll : ∀ g, g ∈ c.activeDocks → g ∈ V := fun g hg =>
      (memBool_eq_true_iff g V).mp ((list_all_eq_true_iff _ _).mp hAllB g hg)
    refine (applySitesDag_superset F c.activeDocks V (activeDocks_nodup c) hVnd hAll c ?_ ψ).symm
    intro g _ hgNot
    if h : c.lookup g = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  | false =>
    have hNotAll : ¬ (∀ g, g ∈ c.activeDocks → g ∈ V) := by
      intro hAll
      have hT : c.activeDocks.all (fun g => memBool g V) = true :=
        (list_all_eq_true_iff _ _).mpr (fun g hg => (memBool_eq_true_iff g V).mpr (hAll g hg))
      rw [hAllB] at hT
      exact Bool.noConfusion hT
    have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' := by
      intro c' hc'
      apply hs.2
      intro hc's
      apply hNotAll
      intro g hg
      rw [← hc'] at hg
      exact hVcov c' hc's g hg
    rw [applySitesDag_local_eq F c.activeDocks ψ zeroVec c hVan,
        applySitesDag_local_eq F V ψ zeroVec c hVan,
        applySitesDag_zero, applySitesDag_zero]

/-- Exact global infinite-honeycomb `FockUnitary` lifted from ANY `LocalSiteFamily F`. -/
def globalUnitary (F : LocalSiteFamily) : FockUnitary NinthLoc6 HoneycombConfig where
  op := globalOp F
  dag := globalDag F
  leftInv := fun ψ => by
    funext c
    unfold globalDag
    rw [applySitesDag_local_eq F c.activeDocks (globalOp F ψ) (applySites F c.activeDocks ψ) c
          (fun c' hc' => by unfold globalOp; rw [hc'])]
    have hInv := (applySitesUnitary F c.activeDocks).leftInv ψ
    rw [applySitesUnitary_op, applySitesUnitary_dag] at hInv
    exact congrFun hInv c
  rightInv := fun ψ => by
    funext c
    unfold globalOp
    rw [applySites_local_eq F c.activeDocks (globalDag F ψ) (applySitesDag F c.activeDocks ψ) c
          (fun c' hc' => by unfold globalDag; rw [hc'])]
    have hInv := (applySitesUnitary F c.activeDocks).rightInv ψ
    rw [applySitesUnitary_op, applySitesUnitary_dag] at hInv
    exact congrFun hInv c
  preservesSupp := fun ψ s hs => by
    let V := collectSites s
    have hVnd : IsNodup V := isNodup_dedupList _
    have hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V := fun c hc g hg =>
      (mem_dedupList _ g).mpr ((mem_flatMapList_iff _ s g).mpr ⟨c, hc, hg⟩)
    rw [globalOp_eq_applySites_on_supp F ψ s hs V hVnd hVcov, ← applySitesUnitary_op F V]
    exact (applySitesUnitary F V).preservesSupp ψ s hs
  preservesDagSupp := fun ψ s hs => by
    let V := collectSites s
    have hVnd : IsNodup V := isNodup_dedupList _
    have hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V := fun c hc g hg =>
      (mem_dedupList _ g).mpr ((mem_flatMapList_iff _ s g).mpr ⟨c, hc, hg⟩)
    rw [globalDag_eq_applySitesDag_on_supp F ψ s hs V hVnd hVcov, ← applySitesUnitary_dag F V]
    exact (applySitesUnitary F V).preservesDagSupp ψ s hs
  preservesInner := fun ψ φ s s' hsψ hsφ hs'ψ hs'φ => by
    let V := collectSites s
    have hVnd : IsNodup V := isNodup_dedupList _
    have hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V := fun c hc g hg =>
      (mem_dedupList _ g).mpr ((mem_flatMapList_iff _ s g).mpr ⟨c, hc, hg⟩)
    have hEqψ : globalOp F ψ = (applySitesUnitary F V).op ψ := by
      rw [applySitesUnitary_op]; exact globalOp_eq_applySites_on_supp F ψ s hsψ V hVnd hVcov
    have hEqφ : globalOp F φ = (applySitesUnitary F V).op φ := by
      rw [applySitesUnitary_op]; exact globalOp_eq_applySites_on_supp F φ s hsφ V hVnd hVcov
    rw [hEqψ, hEqφ] at hs'ψ hs'φ ⊢
    exact (applySitesUnitary F V).preservesInner ψ φ s s' hsψ hsφ hs'ψ hs'φ

private theorem globalOp_comm_of_site_comm (F₁ F₂ : LocalSiteFamily)
    (hComm : ∀ (g₁ g₂ : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (F₁.unit g₁).op ((F₂.unit g₂).op ψ) = (F₂.unit g₂).op ((F₁.unit g₁).op ψ)) :
    ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
      globalOp F₁ (globalOp F₂ ψ) = globalOp F₂ (globalOp F₁ ψ) := by
  have hSwapOne : ∀ (g : Mat5) (gs : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (F₁.unit g).op (applySites F₂ gs ψ) = applySites F₂ gs ((F₁.unit g).op ψ) := by
    intro g gs
    induction gs with
    | nil => intro _; rfl
    | cons x rest ih =>
      intro ψ
      simp only [applySites]
      rw [hComm g x, ih]
  have hSwapList : ∀ (gs₁ gs₂ : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      applySites F₁ gs₁ (applySites F₂ gs₂ ψ) = applySites F₂ gs₂ (applySites F₁ gs₁ ψ) := by
    intro gs₁
    induction gs₁ with
    | nil => intro _ _; rfl
    | cons x rest ih =>
      intro gs₂ ψ
      simp only [applySites]
      rw [ih gs₂ ψ, hSwapOne x gs₂]
  intro ψ; funext c
  unfold globalOp
  rw [applySites_local_eq F₁ c.activeDocks (globalOp F₂ ψ) (applySites F₂ c.activeDocks ψ) c
        (fun c' hc' => by unfold globalOp; rw [hc']),
      applySites_local_eq F₂ c.activeDocks (globalOp F₁ ψ) (applySites F₁ c.activeDocks ψ) c
        (fun c' hc' => by unfold globalOp; rw [hc']),
      hSwapList c.activeDocks c.activeDocks ψ]

/-! ### Concrete Microscopic Operators (`K`, `M_pair(ζ_18)`, `M_meet`, `D = C_{1/2}`, `Φ_odd`, `S`) -/

/-- Swap the two antipodal slots `(lineA l, lineB l)` on a single dock `d`. -/
def swapLineSlotsDock (l : Fin 12) (d : FullDock) : FullDock :=
  fun s => if s = lineA l then d (lineB l) else if s = lineB l then d (lineA l) else d s

/-- Swap the roles of the two occupied slots on line `l` of dock `d` (leaving signs & other lines fixed). -/
def swapLineRolesDock (l : Fin 12) (d : FullDock) : FullDock :=
  match d (lineA l), d (lineB l) with
  | .occ sA rA, .occ sB rB =>
    fun s => if s = lineA l then .occ sA rB else if s = lineB l then .occ sB rA else d s
  | _, _ => d

def swapLineSlotsConfig (g : Mat5) (l : Fin 12) (c : HoneycombConfig) : HoneycombConfig :=
  c.setDock g (swapLineSlotsDock l (c.lookup g))

def swapLineRolesConfig (g : Mat5) (l : Fin 12) (c : HoneycombConfig) : HoneycombConfig :=
  c.setDock g (swapLineRolesDock l (c.lookup g))

private theorem swapLineSlotsDock_inv (l : Fin 12) (d : FullDock) :
    swapLineSlotsDock l (swapLineSlotsDock l d) = d := by
  have hne : lineA l ≠ lineB l := (line_geom_facts.1 l).2.2
  funext s; unfold swapLineSlotsDock
  if hA : s = lineA l then
    simp only [ite_eq_left hA, ite_eq_right hne.symm, ite_eq_left rfl, hA]
  else if hB : s = lineB l then
    simp only [ite_eq_right hA, ite_eq_left hB, ite_eq_left rfl, hB]
  else
    simp only [ite_eq_right hA, ite_eq_right hB]

private theorem swapLineRolesDock_inv (l : Fin 12) (d : FullDock) :
    swapLineRolesDock l (swapLineRolesDock l d) = d := by
  have hne : lineA l ≠ lineB l := (line_geom_facts.1 l).2.2
  unfold swapLineRolesDock
  cases hA : d (lineA l) with
  | empty => simp only [hA]
  | occ sA rA =>
    cases hB : d (lineB l) with
    | empty => simp only [hA, hB]
    | occ sB rB =>
      simp only [ite_eq_left rfl, ite_eq_right hne.symm]
      funext s
      if hsA : s = lineA l then simp only [ite_eq_left hsA, hsA, hA]
      else if hsB : s = lineB l then simp only [ite_eq_right hsA, ite_eq_left hsB, hsB, hB]
      else simp only [ite_eq_right hsA, ite_eq_right hsB]

private theorem swapLineSlotsDock_empty_iff (l : Fin 12) (d : FullDock) :
    swapLineSlotsDock l d = v1FullDock ↔ d = v1FullDock := by
  have hV1 : swapLineSlotsDock l v1FullDock = v1FullDock := by
    funext s; unfold swapLineSlotsDock
    if hA : s = lineA l then rw [ite_eq_left hA]; rfl
    else if hB : s = lineB l then rw [ite_eq_right hA, ite_eq_left hB]; rfl
    else rw [ite_eq_right hA, ite_eq_right hB]
  constructor
  · intro h; rw [← swapLineSlotsDock_inv l d, h, hV1]
  · intro h; rw [h, hV1]

private theorem swapLineRolesDock_empty_iff (l : Fin 12) (d : FullDock) :
    swapLineRolesDock l d = v1FullDock ↔ d = v1FullDock := by
  constructor
  · intro h; rw [← swapLineRolesDock_inv l d, h]; rfl
  · intro h; rw [h]; rfl

private theorem fullDockCharge_swapLineSlots (l : Fin 12) (d : FullDock) :
    fullDockCharge (swapLineSlotsDock l d) = fullDockCharge d := by
  rw [fullDockCharge_eq_fockSumInt, fullDockCharge_eq_fockSumInt]
  let swapF : Fin 24 → Fin 24 := fun s => if s = lineA l then lineB l else if s = lineB l then lineA l else s
  have hne : lineA l ≠ lineB l := (line_geom_facts.1 l).2.2
  have hInv : ∀ s : Fin 24, swapF (swapF s) = s := by
    intro s; change (if (if s = lineA l then lineB l else if s = lineB l then lineA l else s) = lineA l then lineB l
      else if (if s = lineA l then lineB l else if s = lineB l then lineA l else s) = lineB l then lineA l
      else (if s = lineA l then lineB l else if s = lineB l then lineA l else s)) = s
    if hA : s = lineA l then simp only [ite_eq_left hA, ite_eq_right hne.symm, ite_eq_left rfl, hA]
    else if hB : s = lineB l then simp only [ite_eq_right hA, ite_eq_left hB, ite_eq_left rfl, hB]
    else simp only [ite_eq_right hA, ite_eq_right hB]
  have hEq : (fun s => (swapLineSlotsDock l d s).charge) = (fun s => (d (swapF s)).charge) := by
    funext s; unfold swapLineSlotsDock
    if hA : s = lineA l then simp only [swapF, ite_eq_left hA]
    else if hB : s = lineB l then simp only [swapF, ite_eq_right hA, ite_eq_left hB]
    else simp only [swapF, ite_eq_right hA, ite_eq_right hB]
  rw [hEq]
  rw [← fockSumInt_map (List.finRange 24) swapF (fun s => (d s).charge)]
  have hMapNd : IsNodup ((List.finRange 24).map swapF) :=
    isNodup_map_inj swapF (fun x y h => by have := congrArg swapF h; rw [hInv, hInv] at this; exact this) finRange24_nodup
  exact fockSumInt_subset_eq _ (List.finRange 24) _ hMapNd finRange24_nodup
    (fun x _ => mem_finRange24 x)
    (fun x _ hxNot => absurd ((mem_map_iff swapF _ x).mpr ⟨swapF x, mem_finRange24 _, hInv x⟩) hxNot)

private theorem fullDockCharge_swapLineRoles (l : Fin 12) (d : FullDock) :
    fullDockCharge (swapLineRolesDock l d) = fullDockCharge d := by
  rw [fullDockCharge_eq_fockSumInt, fullDockCharge_eq_fockSumInt]
  apply fockSumInt_congr
  intro s _
  unfold swapLineRolesDock
  cases hA : d (lineA l) with
  | empty => rfl
  | occ sA rA =>
    cases hB : d (lineB l) with
    | empty => rfl
    | occ sB rB =>
      if hsA : s = lineA l then rw [ite_eq_left hsA, hsA, hA]
      else if hsB : s = lineB l then rw [ite_eq_right hsA, ite_eq_left hsB, hsB, hB]
      else rw [ite_eq_right hsA, ite_eq_right hsB]

/-- Line classification predicates on a 24-slot `FullDock`. -/
def isLoneLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ _ _, .empty => true
  | .empty, .occ _ _ => true
  | _, _ => false

def isFullLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ _ _, .occ _ _ => true
  | _, _ => false

def isOppSignLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ sA _, .occ sB _ => decide (sA ≠ sB)
  | _, _ => false

def isSameSignEqRoleLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA = rB)
  | _, _ => false

def isSameSignDiffRoleLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA ≠ rB)
  | _, _ => false

/-- Check whether `d` has an identical-tone, identical-role full pair on line `l` and ALL other 22 slots empty. -/
def isSoleIdentPairAt (d : FullDock) (l : Fin 12) : Bool :=
  isSameSignEqRoleLine d l &&
    (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty))

/-- Find the unique line `l : Fin 12` holding a sole identical-tone, identical-role pair, if any. -/
def findSolePairLine (d : FullDock) : Option (Fin 12) :=
  (List.finRange 12).find? (fun l => isSoleIdentPairAt d l)

def isSoleIdentPairDock (d : FullDock) : Bool :=
  (findSolePairLine d).isSome

def solePairLine (d : FullDock) : Fin 12 :=
  (findSolePairLine d).getD ⟨0, by decide⟩

/-- Move a sole identical pair on `d` to antipodal line `m : Fin 12` (identity on inactive docks). -/
def moveSolePairDock (m : Fin 12) (d : FullDock) : FullDock :=
  match findSolePairLine d with
  | none => d
  | some l =>
    let v := d (lineA l)
    fun s => if s = lineA m ∨ s = lineB m then v else .empty

def moveSolePairConfig (g : Mat5) (m : Fin 12) (c : HoneycombConfig) : HoneycombConfig :=
  c.setDock g (moveSolePairDock m (c.lookup g))

private theorem find?_eq_some_iff {α : Type} (p : α → Bool) (xs : List α) (a : α) :
    xs.find? p = some a → a ∈ xs ∧ p a = true := by
  induction xs with
  | nil => simp only [List.find?]; intro h; exact Option.noConfusion h
  | cons x rest ih =>
    simp only [List.find?]
    cases hpx : p x with
    | true =>
      intro h; cases h; exact ⟨List.Mem.head rest, hpx⟩
    | false =>
      intro h; have ⟨hm, hp⟩ := ih h; exact ⟨List.Mem.tail x hm, hp⟩

private theorem find?_isSome_of_mem {α : Type} (p : α → Bool) (xs : List α) (a : α)
    (hm : a ∈ xs) (hp : p a = true) : (xs.find? p).isSome = true := by
  induction xs with
  | nil => cases hm
  | cons x rest ih =>
    simp only [List.find?]
    cases hpx : p x with
    | true => rfl
    | false =>
      cases hm with
      | head => rw [hpx] at hp; exact Bool.noConfusion hp
      | tail _ h' => exact ih h'

private theorem soleIdentPairAt_unique (d : FullDock) (l₁ l₂ : Fin 12)
    (h1 : isSoleIdentPairAt d l₁ = true) (h2 : isSoleIdentPairAt d l₂ = true) : l₁ = l₂ := by
  if heq : l₁ = l₂ then exact heq
  else
    unfold isSoleIdentPairAt at h1 h2
    rw [Bool.and_eq_true] at h1 h2
    have hAll1 := (list_all_eq_true_iff _ _).mp h1.2 (lineA l₂) (mem_finRange24 (lineA l₂))
    have hDisj := (line_geom_facts.2.2.2.1 l₁ l₂ heq)
    have hEmpty : d (lineA l₂) = .empty := by
      have hd := of_decide_eq_true hAll1
      rcases hd with hA | hB | hE
      · exact absurd hA.symm hDisj.1
      · exact absurd hB.symm hDisj.2.2.1
      · exact hE
    have hSame := h2.1
    unfold isSameSignEqRoleLine at hSame
    rw [hEmpty] at hSame
    exact Bool.noConfusion hSame

private theorem findSolePairLine_of_at (d : FullDock) (l : Fin 12)
    (h : isSoleIdentPairAt d l = true) : findSolePairLine d = some l := by
  unfold findSolePairLine
  have hSome := find?_isSome_of_mem (fun k => isSoleIdentPairAt d k) (List.finRange 12) l (mem_finRange12 l) h
  cases hf : (List.finRange 12).find? (fun k => isSoleIdentPairAt d k) with
  | none => rw [hf] at hSome; exact Bool.noConfusion hSome
  | some k =>
    have hk := (find?_eq_some_iff _ _ _ hf).2
    rw [soleIdentPairAt_unique d k l hk h]

private theorem isSoleIdentPairAt_move (d : FullDock) (l m : Fin 12)
    (hl : isSoleIdentPairAt d l = true) :
    isSoleIdentPairAt (moveSolePairDock m d) m = true := by
  unfold moveSolePairDock
  rw [findSolePairLine_of_at d l hl]
  have hSame := (Bool.and_eq_true _ _).mp hl |>.1
  unfold isSameSignEqRoleLine at hSame
  cases hA : d (lineA l) with
  | empty => rw [hA] at hSame; exact Bool.noConfusion hSame
  | occ s r =>
    unfold isSoleIdentPairAt isSameSignEqRoleLine
    rw [Bool.and_eq_true]
    refine ⟨?_, ?_⟩
    · simp only [ite_eq_left (Or.inl rfl), ite_eq_left (Or.inr rfl)]
      decide
    · refine (list_all_eq_true_iff _ _).mpr ?_
      intro s' _
      if hs : s' = lineA m ∨ s' = lineB m then
        rcases hs with h1 | h2
        · exact decide_eq_true (Or.inl h1)
        · exact decide_eq_true (Or.inr (Or.inl h2))
      else
        exact decide_eq_true (Or.inr (Or.inr (ite_eq_right hs)))

private theorem moveSolePairDock_spec (d : FullDock) (hAct : isSoleIdentPairDock d = true) :
    (∀ m : Fin 12, isSoleIdentPairDock (moveSolePairDock m d) = true) ∧
    (∀ m : Fin 12, solePairLine (moveSolePairDock m d) = m) ∧
    (∀ m₁ m₂ : Fin 12, moveSolePairDock m₁ (moveSolePairDock m₂ d) = moveSolePairDock m₁ d) ∧
    (moveSolePairDock (solePairLine d) d = d) ∧
    (∀ m : Fin 12, moveSolePairDock m d ≠ v1FullDock) ∧
    (∀ m : Fin 12, fullDockCharge (moveSolePairDock m d) = fullDockCharge d) := by
  unfold isSoleIdentPairDock at hAct
  cases hf : findSolePairLine d with
  | none => rw [hf] at hAct; exact Bool.noConfusion hAct
  | some l =>
    have hl : isSoleIdentPairAt d l = true := (find?_eq_some_iff _ _ _ hf).2
    have hSame := (Bool.and_eq_true _ _).mp hl |>.1
    have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl).2
    have hVal : ∃ (s : Sign) (r : Bool), d (lineA l) = .occ s r ∧ d (lineB l) = .occ s r := by
      unfold isSameSignEqRoleLine at hSame
      cases hA : d (lineA l) with
      | empty => rw [hA] at hSame; exact Bool.noConfusion hSame
      | occ sA rA =>
        cases hB : d (lineB l) with
        | empty => rw [hA, hB] at hSame; exact Bool.noConfusion hSame
        | occ sB rB =>
          rw [hA, hB] at hSame
          have ⟨hs, hr⟩ := of_decide_eq_true hSame
          exact ⟨sA, rA, rfl, by rw [← hs, ← hr]⟩
    obtain ⟨s₀, r₀, hA0, hB0⟩ := hVal
    have hMoveFind : ∀ m : Fin 12, findSolePairLine (moveSolePairDock m d) = some m :=
      fun m => findSolePairLine_of_at _ m (isSoleIdentPairAt_move d l m hl)
    have hSole : solePairLine d = l := by unfold solePairLine; rw [hf]; rfl
    refine ⟨?_, ?_, ?_, ?_, ?_, ?_⟩
    · intro m; unfold isSoleIdentPairDock; rw [hMoveFind m]; rfl
    · intro m; unfold solePairLine; rw [hMoveFind m]; rfl
    · intro m₁ m₂
      funext s
      unfold moveSolePairDock
      rw [hMoveFind m₂, hf]
      simp only [ite_eq_left (Or.inl rfl)]
    · rw [hSole]
      funext s
      unfold moveSolePairDock; rw [hf]
      if hsA : s = lineA l then rw [ite_eq_left (Or.inl hsA), hsA]
      else if hsB : s = lineB l then rw [ite_eq_left (Or.inr hsB), hsB, hA0, hB0]
      else
        rw [ite_eq_right (fun h => match h with | Or.inl h1 => hsA h1 | Or.inr h2 => hsB h2)]
        have := of_decide_eq_true (hAll s (mem_finRange24 s))
        rcases this with h1 | h2 | h3
        · exact absurd h1 hsA
        · exact absurd h2 hsB
        · exact h3.symm
    · intro m heq
      have h0 := congrFun heq (lineA m)
      unfold moveSolePairDock at h0
      rw [hf, ite_eq_left (Or.inl rfl), hA0] at h0
      exact SlotState.noConfusion h0
    · intro m
      have hDockQ : ∀ (k : Fin 12) (dk : FullDock),
          dk (lineA k) = .occ s₀ r₀ → dk (lineB k) = .occ s₀ r₀ →
          (∀ s : Fin 24, s ≠ lineA k → s ≠ lineB k → dk s = .empty) →
          fullDockCharge dk = s₀.value + s₀.value := by
        intro k dk hkA hkB hkOth
        rw [fullDockCharge_eq_fockSumInt]
        have hneAB : lineA k ≠ lineB k := (line_geom_facts.1 k).2.2
        rw [fockSumInt_eraseOne (lineA k) (List.finRange 24) _ (mem_finRange24 (lineA k))]
        have hBin : lineB k ∈ eraseOne (lineA k) (List.finRange 24) :=
          (mem_eraseOne_iff (lineA k) (lineB k) finRange24_nodup).mpr ⟨mem_finRange24 (lineB k), hneAB.symm⟩
        rw [fockSumInt_eraseOne (lineB k) _ _ hBin]
        have hRest0 : fockSumInt (eraseOne (lineB k) (eraseOne (lineA k) (List.finRange 24)))
            (fun s => (dk s).charge) = 0 := by
          apply fockSumInt_zero_of_all_zero
          intro s hs
          have ⟨hs1, hneB⟩ := (mem_eraseOne_iff (lineB k) s (isNodup_eraseOne (lineA k) finRange24_nodup)).mp hs
          have ⟨_, hneA⟩ := (mem_eraseOne_iff (lineA k) s finRange24_nodup).mp hs1
          rw [hkOth s hneA hneB]; rfl
        rw [hRest0, hkA, hkB]
        simp only [SlotState.charge]; omega
      have hQ1 : fullDockCharge (moveSolePairDock m d) = s₀.value + s₀.value := by
        apply hDockQ m
        · unfold moveSolePairDock; rw [hf, ite_eq_left (Or.inl rfl), hA0]
        · unfold moveSolePairDock; rw [hf, ite_eq_left (Or.inr rfl), hA0]
        · intro s hA hB; unfold moveSolePairDock; rw [hf, ite_eq_right (fun h => match h with | Or.inl e => hA e | Or.inr e => hB e)]
      have hQ2 : fullDockCharge d = s₀.value + s₀.value := by
        apply hDockQ l d hA0 hB0
        intro s hA hB
        rcases of_decide_eq_true (hAll s (mem_finRange24 s)) with h1 | h2 | h3
        · exact absurd h1 hA
        · exact absurd h2 hB
        · exact h3
      rw [hQ1, hQ2]

/-! ### 1. Exact Opposite-Sign Bounce `K` (Self-Adjoint Involution) -/

private def lineBounceKPerm (g : Mat5) (l : Fin 12) (c : HoneycombConfig) : HoneycombConfig :=
  if isOppSignLine (c.lookup g) l then swapLineSlotsConfig g l c else c

private theorem lineBounceKPerm_inv (g : Mat5) (l : Fin 12) (c : HoneycombConfig) :
    lineBounceKPerm g l (lineBounceKPerm g l c) = c := by
  unfold lineBounceKPerm
  cases h : isOppSignLine (c.lookup g) l with
  | false => rw [ite_eq_right (by decide : false ≠ true), ite_eq_right (by rw [h]; decide)]
  | true =>
    rw [ite_eq_left rfl]
    have hSwap : isOppSignLine ((swapLineSlotsConfig g l c).lookup g) l = true := by
      unfold swapLineSlotsConfig
      rw [lookup_setDock, ite_eq_left rfl]
      unfold isOppSignLine swapLineSlotsDock at h ⊢
      have hne := (line_geom_facts.1 l).2.2
      simp only [ite_eq_left rfl, ite_eq_right hne.symm]
      cases hA : c.lookup g (lineA l) <;> cases hB : c.lookup g (lineB l) <;> rw [hA, hB] at h
      all_goals try exact Bool.noConfusion h
      exact decide_eq_true (fun e => (of_decide_eq_true h) e.symm)
    rw [ite_eq_left hSwap]
    unfold swapLineSlotsConfig
    rw [lookup_setDock, ite_eq_left rfl, setDock_setDock_same, swapLineSlotsDock_inv, setDock_lookup_self]

private def lineBounceKUnit (g : Mat5) (l : Fin 12) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp
    (phaseUnitary (R := NinthLoc6)
      (fun c => if isOppSignLine (c.lookup g) l then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one)
      (fun c => by
        cases isOppSignLine (c.lookup g) l with
        | false => exact Quot.sound (by decide)
        | true => exact Quot.sound (by decide)))
    (permUnitary (R := NinthLoc6) (lineBounceKPerm g l) (lineBounceKPerm g l)
      (lineBounceKPerm_inv g l) (lineBounceKPerm_inv g l))

private def composeLines (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig) :
    List (Fin 12) → FockUnitary NinthLoc6 HoneycombConfig
  | [] => FockUnitary.id
  | l :: ls => FockUnitary.comp (f l) (composeLines f ls)

private def siteBounceKUnit (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  composeLines (lineBounceKUnit g) (List.finRange 12)

/-! ### 2. Exact Half-Coin `D = C_{1/2}` (Per-Line Lone-Split + Full-Line `ζ_6` Phase) -/

private def lineHalfCoinUnit (g : Mat5) (l : Fin 12) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp
    (phaseUnitary (R := NinthLoc6)
      (fun c => if isFullLine (c.lookup g) l then NinthLoc6.zeta6 else NinthLoc6.one)
      (fun c => by
        cases isFullLine (c.lookup g) l with
        | false => exact Quot.sound (by decide)
        | true => exact thm_fock_ring_and_gate_identities.2.2.2.2.1))
    (block2Unitary (R := NinthLoc6)
      (swapLineSlotsConfig g l)
      (fun c => isLoneLine (c.lookup g) l)
      NinthLoc6.coinDiag NinthLoc6.coinOff
      (fun c => by
        unfold swapLineSlotsConfig
        rw [lookup_setDock, ite_eq_left rfl, setDock_setDock_same, swapLineSlotsDock_inv, setDock_lookup_self])
      (fun c => by
        unfold swapLineSlotsConfig
        rw [lookup_setDock, ite_eq_left rfl]
        unfold isLoneLine swapLineSlotsDock
        have hne := (line_geom_facts.1 l).2.2
        simp only [ite_eq_left rfl, ite_eq_right hne.symm]
        cases c.lookup g (lineA l) <;> cases c.lookup g (lineB l) <;> rfl)
      thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.2.1
      thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.2.2.1)

private def siteHalfCoinUnit (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  composeLines (lineHalfCoinUnit g) (List.finRange 12)

/-! ### 3. Exact Same-Sign Role Meeting `M_meet` (Equal-Role `ω` Phase + Unequal-Role `2 × 2` Mixer) -/

private def lineMeetUnit (g : Mat5) (l : Fin 12) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp
    (phaseUnitary (R := NinthLoc6)
      (fun c => if isSameSignEqRoleLine (c.lookup g) l then NinthLoc6.omega else NinthLoc6.one)
      (fun c => by
        cases isSameSignEqRoleLine (c.lookup g) l with
        | false => exact Quot.sound (by decide)
        | true => exact thm_fock_ring_and_gate_identities.2.2.2.2.2.1))
    (block2Unitary (R := NinthLoc6)
      (swapLineRolesConfig g l)
      (fun c => isSameSignDiffRoleLine (c.lookup g) l)
      NinthLoc6.meetKeep NinthLoc6.meetSwap
      (fun c => by
        unfold swapLineRolesConfig
        rw [lookup_setDock, ite_eq_left rfl, setDock_setDock_same, swapLineRolesDock_inv, setDock_lookup_self])
      (fun c => by
        unfold swapLineRolesConfig
        rw [lookup_setDock, ite_eq_left rfl]
        unfold isSameSignDiffRoleLine swapLineRolesDock
        have hne := (line_geom_facts.1 l).2.2
        cases hA : c.lookup g (lineA l) with
        | empty => rfl
        | occ sA rA =>
          cases hB : c.lookup g (lineB l) with
          | empty => rfl
          | occ sB rB =>
            simp only [ite_eq_left rfl, ite_eq_right hne.symm]
            cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide)
      thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.2.2.2.2.2.1
      thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.2.2.2.2.2.2.1)

private def siteMeetUnit (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  composeLines (lineMeetUnit g) (List.finRange 12)

/-! ### 4. Exact `W(F_4)`-Isotropic Pair-Line Mixer `M_pair(ζ_18)` (`12 × 12` Block) -/

private def siteMPairUnit (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  block12Unitary (R := NinthLoc6)
    (fun c => isSoleIdentPairDock (c.lookup g))
    (fun c => solePairLine (c.lookup g))
    (fun m c => moveSolePairConfig g m c)
    NinthLoc6.zeta18 NinthLoc6.inv12
    (fun m c h => by
      unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_left rfl]
      exact (moveSolePairDock_spec (c.lookup g) h).1 m)
    (fun m₁ m₂ c h => by
      unfold moveSolePairConfig
      rw [lookup_setDock, ite_eq_left rfl, setDock_setDock_same]
      rw [(moveSolePairDock_spec (c.lookup g) h).2.2.1 m₁ m₂])
    (fun c h => by
      unfold moveSolePairConfig
      rw [(moveSolePairDock_spec (c.lookup g) h).2.2.2.1, setDock_lookup_self])
    (fun m c h => by
      unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_left rfl]
      exact (moveSolePairDock_spec (c.lookup g) h).2.1 m)
    thm_fock_ring_and_gate_identities.2.2.1
    thm_fock_ring_and_gate_identities.2.2.2.1
    thm_fock_ring_and_gate_identities.2.2.2.2.2.2.1

/-! ### 5. Scale-4 Chiral Phase `Φ_odd(χ)` (Abstract `ChiralInvariant` + Concrete 4-Vibe Witness) -/

/-- Axiomatic interface for a `W(F_4)^+`-even, `R`-even, `CP`-even, vacuum-vanishing chiral dock invariant
    (satisfied both by the full `W(F_4) × Z_2^C` census in `Vibe.Chirality` and by our explicit
    4-vibe witness `witnessChiralInvariant` below). -/
structure ChiralInvariant where
  chi : FullDock → Int
  chi_v1 : chi v1FullDock = 0
  chi_rev : ∀ d : FullDock, chi (revFullDock d) = chi d
  chi_cp : ∀ d : FullDock, chi (cpFullDock d) = chi d

private def sitePhiOddUnit (χ : ChiralInvariant) (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  phaseUnitary (R := NinthLoc6)
    (fun c => NinthLoc6.zeta6Pow (dockParity g * χ.chi (c.lookup g)))
    (fun c => (thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.1 _).1)

/-! ### LocalSiteFamily Proofs for All 5 Dock-Local Operators (`K`, `D`, `M_meet`, `M_pair`, `Φ_odd`) -/

private theorem nloc_sumFin12_add (f g : Fin 12 → NinthLoc6) :
    sumFin12 (fun m => NinthLoc6.add (f m) (g m)) = NinthLoc6.add (sumFin12 f) (sumFin12 g) :=
  sumFin12_add f g

private theorem nloc_sumFin12_mul_left (c : NinthLoc6) (f : Fin 12 → NinthLoc6) :
    sumFin12 (fun m => NinthLoc6.mul c (f m)) = NinthLoc6.mul c (sumFin12 f) :=
  sumFin12_mul_left c f

private theorem nloc_sumFin12_conj (f : Fin 12 → NinthLoc6) :
    NinthLoc6.conj (sumFin12 f) = sumFin12 (fun m => NinthLoc6.conj (f m)) :=
  sumFin12_conj f

private theorem nloc_sumFin12_zero :
    sumFin12 (fun _ : Fin 12 => NinthLoc6.zero) = NinthLoc6.zero :=
  sumList_zero_of_all_zero (List.finRange 12) (fun _ => NinthLoc6.zero) (fun _ _ => rfl)

private theorem nloc_sumFin12_swap (f : Fin 12 → Fin 12 → NinthLoc6) :
    sumFin12 (fun m₁ => sumFin12 (fun m₂ => f m₁ m₂)) =
      sumFin12 (fun m₂ => sumFin12 (fun m₁ => f m₁ m₂)) :=
  sumFin12_swap f

private theorem nloc_mul_add_swap (p a b x y : NinthLoc6) :
    NinthLoc6.mul p (NinthLoc6.add (NinthLoc6.mul a x) (NinthLoc6.mul b y)) =
      NinthLoc6.add (NinthLoc6.mul a (NinthLoc6.mul p x)) (NinthLoc6.mul b (NinthLoc6.mul p y)) := by
  rw [NinthLoc6.mul_add, ← NinthLoc6.mul_assoc p a x, NinthLoc6.mul_comm p a, NinthLoc6.mul_assoc a p x,
      ← NinthLoc6.mul_assoc p b y, NinthLoc6.mul_comm p b, NinthLoc6.mul_assoc b p y]

private theorem nloc_swap4 (a b c d : NinthLoc6) :
    NinthLoc6.add (NinthLoc6.add a b) (NinthLoc6.add c d) =
      NinthLoc6.add (NinthLoc6.add a c) (NinthLoc6.add b d) := by
  rw [NinthLoc6.add_assoc a b (NinthLoc6.add c d), ← NinthLoc6.add_assoc b c d,
      NinthLoc6.add_comm b c, NinthLoc6.add_assoc c b d, ← NinthLoc6.add_assoc a c (NinthLoc6.add b d)]

private theorem nloc_phase_block2_comm (p1 p2 a b x y : NinthLoc6) :
    NinthLoc6.mul p1 (NinthLoc6.mul p2 (NinthLoc6.add (NinthLoc6.mul a x) (NinthLoc6.mul b y))) =
      NinthLoc6.mul p2 (NinthLoc6.add (NinthLoc6.mul a (NinthLoc6.mul p1 x)) (NinthLoc6.mul b (NinthLoc6.mul p1 y))) := by
  rw [← NinthLoc6.mul_assoc p1 p2, NinthLoc6.mul_comm p1 p2, NinthLoc6.mul_assoc p2 p1,
      nloc_mul_add_swap p1 a b x y]

private theorem nloc_block2_comm (p1 p2 a b x00 x01 x10 x11 : NinthLoc6) :
    NinthLoc6.mul p1 (NinthLoc6.add
      (NinthLoc6.mul a (NinthLoc6.mul p2 (NinthLoc6.add (NinthLoc6.mul a x00) (NinthLoc6.mul b x01))))
      (NinthLoc6.mul b (NinthLoc6.mul p2 (NinthLoc6.add (NinthLoc6.mul a x10) (NinthLoc6.mul b x11))))) =
    NinthLoc6.mul p2 (NinthLoc6.add
      (NinthLoc6.mul a (NinthLoc6.mul p1 (NinthLoc6.add (NinthLoc6.mul a x00) (NinthLoc6.mul b x10))))
      (NinthLoc6.mul b (NinthLoc6.mul p1 (NinthLoc6.add (NinthLoc6.mul a x01) (NinthLoc6.mul b x11))))) := by
  rw [← nloc_mul_add_swap p2 a b, ← NinthLoc6.mul_assoc p1 p2,
      ← nloc_mul_add_swap p1 a b, ← NinthLoc6.mul_assoc p2 p1, NinthLoc6.mul_comm p1 p2]
  apply congrArg (NinthLoc6.mul (NinthLoc6.mul p2 p1))
  rw [NinthLoc6.mul_add, NinthLoc6.mul_add, NinthLoc6.mul_add, NinthLoc6.mul_add,
      ← NinthLoc6.mul_assoc, ← NinthLoc6.mul_assoc, ← NinthLoc6.mul_assoc, ← NinthLoc6.mul_assoc,
      ← NinthLoc6.mul_assoc, ← NinthLoc6.mul_assoc, ← NinthLoc6.mul_assoc, ← NinthLoc6.mul_assoc,
      NinthLoc6.mul_comm b a]
  exact nloc_swap4 _ _ _ _

private theorem ket_nloc (c₀ c : HoneycombConfig) :
    ket (R := NinthLoc6) c₀ c = if c = c₀ then NinthLoc6.one else NinthLoc6.zero := rfl

private theorem zeroVec_nloc (c : HoneycombConfig) :
    zeroVec (R := NinthLoc6) c = NinthLoc6.zero := rfl

private theorem nloc_block12Op (act : HoneycombConfig → Bool)
    (moveTo : Fin 12 → HoneycombConfig → HoneycombConfig)
    (u inv12 : NinthLoc6) (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    block12Op (R := NinthLoc6) act moveTo u inv12 ψ c =
      if act c = true then
        NinthLoc6.add (ψ c)
          (NinthLoc6.mul (NinthLoc6.mul (NinthLoc6.sub u NinthLoc6.one) inv12)
            (sumFin12 (fun m => ψ (moveTo m c))))
      else ψ c := rfl

private theorem lineBounceKUnit_op (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineBounceKUnit g l).op ψ c =
      NinthLoc6.mul (if isOppSignLine (c.lookup g) l = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one)
        (ψ (lineBounceKPerm g l c)) := rfl

private theorem lineBounceKUnit_dag (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineBounceKUnit g l).dag ψ c =
      NinthLoc6.mul (NinthLoc6.conj (if isOppSignLine ((lineBounceKPerm g l c).lookup g) l = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one))
        (ψ (lineBounceKPerm g l c)) := rfl

private theorem lineHalfCoinUnit_op (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineHalfCoinUnit g l).op ψ c =
      NinthLoc6.mul (if isFullLine (c.lookup g) l = true then NinthLoc6.zeta6 else NinthLoc6.one)
        (if isLoneLine (c.lookup g) l = true then
          NinthLoc6.add (NinthLoc6.mul NinthLoc6.coinDiag (ψ c))
                        (NinthLoc6.mul NinthLoc6.coinOff (ψ (swapLineSlotsConfig g l c)))
        else ψ c) := rfl

private theorem lineHalfCoinUnit_dag (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineHalfCoinUnit g l).dag ψ c =
      if isLoneLine (c.lookup g) l = true then
        NinthLoc6.add
          (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinDiag)
            (NinthLoc6.mul (NinthLoc6.conj (if isFullLine (c.lookup g) l = true then NinthLoc6.zeta6 else NinthLoc6.one)) (ψ c)))
          (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinOff)
            (NinthLoc6.mul (NinthLoc6.conj (if isFullLine ((swapLineSlotsConfig g l c).lookup g) l = true then NinthLoc6.zeta6 else NinthLoc6.one)) (ψ (swapLineSlotsConfig g l c))))
      else
        NinthLoc6.mul (NinthLoc6.conj (if isFullLine (c.lookup g) l = true then NinthLoc6.zeta6 else NinthLoc6.one)) (ψ c) := rfl

private theorem lineMeetUnit_op (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineMeetUnit g l).op ψ c =
      NinthLoc6.mul (if isSameSignEqRoleLine (c.lookup g) l = true then NinthLoc6.omega else NinthLoc6.one)
        (if isSameSignDiffRoleLine (c.lookup g) l = true then
          NinthLoc6.add (NinthLoc6.mul NinthLoc6.meetKeep (ψ c))
                        (NinthLoc6.mul NinthLoc6.meetSwap (ψ (swapLineRolesConfig g l c)))
        else ψ c) := rfl

private theorem lineMeetUnit_dag (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineMeetUnit g l).dag ψ c =
      if isSameSignDiffRoleLine (c.lookup g) l = true then
        NinthLoc6.add
          (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.meetKeep)
            (NinthLoc6.mul (NinthLoc6.conj (if isSameSignEqRoleLine (c.lookup g) l = true then NinthLoc6.omega else NinthLoc6.one)) (ψ c)))
          (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.meetSwap)
            (NinthLoc6.mul (NinthLoc6.conj (if isSameSignEqRoleLine ((swapLineRolesConfig g l c).lookup g) l = true then NinthLoc6.omega else NinthLoc6.one)) (ψ (swapLineRolesConfig g l c))))
      else
        NinthLoc6.mul (NinthLoc6.conj (if isSameSignEqRoleLine (c.lookup g) l = true then NinthLoc6.omega else NinthLoc6.one)) (ψ c) := rfl

private theorem siteMPairUnit_op (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (siteMPairUnit g).op ψ c =
      if isSoleIdentPairDock (c.lookup g) = true then
        NinthLoc6.add (ψ c)
          (NinthLoc6.mul NinthLoc6.pairHop (sumFin12 (fun m => ψ (moveSolePairConfig g m c))))
      else ψ c := rfl

private theorem siteMPairUnit_dag (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (siteMPairUnit g).dag ψ c =
      if isSoleIdentPairDock (c.lookup g) = true then
        NinthLoc6.add (ψ c)
          (NinthLoc6.mul (NinthLoc6.mul (NinthLoc6.sub (NinthLoc6.conj NinthLoc6.zeta18) NinthLoc6.one) NinthLoc6.inv12)
            (sumFin12 (fun m => ψ (moveSolePairConfig g m c))))
      else ψ c := rfl

private theorem sitePhiOddUnit_op (χ : ChiralInvariant) (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (sitePhiOddUnit χ g).op ψ c =
      NinthLoc6.mul (NinthLoc6.zeta6Pow (dockParity g * χ.chi (c.lookup g))) (ψ c) := rfl

private theorem sitePhiOddUnit_dag (χ : ChiralInvariant) (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (sitePhiOddUnit χ g).dag ψ c =
      NinthLoc6.mul (NinthLoc6.conj (NinthLoc6.zeta6Pow (dockParity g * χ.chi (c.lookup g)))) (ψ c) := rfl

private theorem composeLines_local_eq (g : Mat5) (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l ψ₁ ψ₂ c,
      (∀ c', c'.activeDocks = c.activeDocks → (∀ h, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') →
      (f l).op ψ₁ c = (f l).op ψ₂ c)
    (ls : List (Fin 12)) (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ h, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') :
    (composeLines f ls).op ψ₁ c = (composeLines f ls).op ψ₂ c := by
  induction ls generalizing c with
  | nil => exact h c rfl (fun _ _ => rfl)
  | cons l rest ih =>
    simp only [composeLines, FockUnitary.comp]
    apply hf l _ _ c
    intro c' hc' hOth
    exact ih c' (fun c'' hc'' hOth' => h c'' (hc''.trans hc') (fun x hx => (hOth' x hx).trans (hOth x hx)))

private theorem composeLines_local_dag_eq (g : Mat5) (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l ψ₁ ψ₂ c,
      (∀ c', c'.activeDocks = c.activeDocks → (∀ h, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') →
      (f l).dag ψ₁ c = (f l).dag ψ₂ c)
    (ls : List (Fin 12)) (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ h, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') :
    (composeLines f ls).dag ψ₁ c = (composeLines f ls).dag ψ₂ c := by
  induction ls generalizing ψ₁ ψ₂ c with
  | nil => exact h c rfl (fun _ _ => rfl)
  | cons l rest ih =>
    simp only [composeLines, FockUnitary.comp]
    apply ih _ _ c
    intro c' hc' hOth
    apply hf l _ _ c'
    intro c'' hc'' hOth'
    exact h c'' (hc''.trans hc') (fun x hx => (hOth' x hx).trans (hOth x hx))

private theorem composeLines_zero (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l, (f l).op zeroVec = zeroVec) (ls : List (Fin 12)) :
    (composeLines f ls).op zeroVec = zeroVec := by
  induction ls with
  | nil => rfl
  | cons l rest ih => simp only [composeLines, FockUnitary.comp]; rw [ih, hf l]

private theorem composeLines_dag_zero (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l, (f l).dag zeroVec = zeroVec) (ls : List (Fin 12)) :
    (composeLines f ls).dag zeroVec = zeroVec := by
  induction ls with
  | nil => rfl
  | cons l rest ih => simp only [composeLines, FockUnitary.comp]; rw [hf l, ih]

private theorem composeLines_idle (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) (hf : ∀ l ψ, (f l).op ψ c = ψ c) (ls : List (Fin 12))
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (composeLines f ls).op ψ c = ψ c := by
  induction ls with
  | nil => rfl
  | cons l rest ih => simp only [composeLines, FockUnitary.comp]; rw [hf l, ih]

private theorem composeLines_dag_idle (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) (hf : ∀ l ψ, (f l).dag ψ c = ψ c) (ls : List (Fin 12))
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (composeLines f ls).dag ψ c = ψ c := by
  induction ls generalizing ψ with
  | nil => rfl
  | cons l rest ih => simp only [composeLines, FockUnitary.comp]; rw [ih, hf l]

private theorem composeLines_comm (f₁ f₂ : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (h : ∀ l₁ l₂ ψ, (f₁ l₁).op ((f₂ l₂).op ψ) = (f₂ l₂).op ((f₁ l₁).op ψ))
    (ls₁ ls₂ : List (Fin 12)) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (composeLines f₁ ls₁).op ((composeLines f₂ ls₂).op ψ) =
      (composeLines f₂ ls₂).op ((composeLines f₁ ls₁).op ψ) := by
  have hOne : ∀ l₁ ls ψ,
      (f₁ l₁).op ((composeLines f₂ ls).op ψ) = (composeLines f₂ ls).op ((f₁ l₁).op ψ) := by
    intro l₁ ls
    induction ls with
    | nil => intro _; rfl
    | cons l₂ rest ih =>
      intro ψ; simp only [composeLines, FockUnitary.comp]; rw [h l₁ l₂, ih]
  induction ls₁ with
  | nil => rfl
  | cons l₁ rest ih =>
    simp only [composeLines, FockUnitary.comp]; rw [ih, hOne l₁ ls₂]

private theorem lineBounceK_local_eq (g : Mat5) (l : Fin 12)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ x, x ≠ g → c'.lookup x = c.lookup x) → ψ₁ c' = ψ₂ c') :
    (lineBounceKUnit g l).op ψ₁ c = (lineBounceKUnit g l).op ψ₂ c := by
  rw [lineBounceKUnit_op, lineBounceKUnit_op]
  apply congrArg (NinthLoc6.mul _)
  apply h
  · unfold lineBounceKPerm
    cases isOppSignLine (c.lookup g) l with
    | false => rfl
    | true => exact activeDocks_setDock_eq c g _ (swapLineSlotsDock_empty_iff l (c.lookup g))
  · intro x hx
    unfold lineBounceKPerm
    cases isOppSignLine (c.lookup g) l with
    | false => rfl
    | true => unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_right hx]

private theorem lineBounceK_self_adj (g : Mat5) (l : Fin 12) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g l).dag ψ = (lineBounceKUnit g l).op ψ := by
  funext c
  rw [lineBounceKUnit_dag, lineBounceKUnit_op]
  cases h : isOppSignLine (c.lookup g) l with
  | false =>
    have hEq : lineBounceKPerm g l c = c := by unfold lineBounceKPerm; rw [h, ite_bool_false]
    rw [hEq, h, ite_bool_false]
    exact congrArg (fun z => NinthLoc6.mul z (ψ c)) (Quot.sound (by decide))
  | true =>
    have hSwap : isOppSignLine ((lineBounceKPerm g l c).lookup g) l = true := by
      unfold lineBounceKPerm; rw [ite_eq_left h]
      unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]
      unfold isOppSignLine swapLineSlotsDock at h ⊢
      have hne := (line_geom_facts.1 l).2.2
      simp only [ite_eq_left rfl, ite_eq_right hne.symm]
      cases hA : c.lookup g (lineA l) <;> cases hB : c.lookup g (lineB l) <;> rw [hA, hB] at h
      all_goals try exact Bool.noConfusion h
      exact decide_eq_true (fun e => (of_decide_eq_true h) e.symm)
    rw [hSwap, ite_bool_true]
    exact congrArg (fun z => NinthLoc6.mul z (ψ (lineBounceKPerm g l c))) (Quot.sound (by decide))

private theorem lineBounceK_comm_sites (g₁ g₂ : Mat5) (l₁ l₂ : Fin 12) (hne : g₁ ≠ g₂)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g₁ l₁).op ((lineBounceKUnit g₂ l₂).op ψ) =
      (lineBounceKUnit g₂ l₂).op ((lineBounceKUnit g₁ l₁).op ψ) := by
  funext c
  rw [lineBounceKUnit_op, lineBounceKUnit_op, lineBounceKUnit_op, lineBounceKUnit_op]
  have hLk1 : (lineBounceKPerm g₁ l₁ c).lookup g₂ = c.lookup g₂ := by
    unfold lineBounceKPerm; cases isOppSignLine (c.lookup g₁) l₁ with
    | false => rfl
    | true => unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_right hne.symm]
  have hLk2 : (lineBounceKPerm g₂ l₂ c).lookup g₁ = c.lookup g₁ := by
    unfold lineBounceKPerm; cases isOppSignLine (c.lookup g₂) l₂ with
    | false => rfl
    | true => unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_right hne]
  have hPerm : lineBounceKPerm g₂ l₂ (lineBounceKPerm g₁ l₁ c) =
      lineBounceKPerm g₁ l₁ (lineBounceKPerm g₂ l₂ c) := by
    unfold lineBounceKPerm
    rw [hLk1, hLk2]
    cases isOppSignLine (c.lookup g₁) l₁ <;> cases isOppSignLine (c.lookup g₂) l₂
    · rfl
    · rfl
    · rfl
    · unfold swapLineSlotsConfig
      rw [lookup_setDock, ite_eq_right hne.symm, lookup_setDock, ite_eq_right hne]
      exact (setDock_setDock_comm c g₁ g₂ _ _ hne).symm
  rw [hLk1, hLk2, hPerm, ← NinthLoc6.mul_assoc, ← NinthLoc6.mul_assoc,
      NinthLoc6.mul_comm (if isOppSignLine (c.lookup g₁) l₁ = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one)]

private def bounceKFamily : LocalSiteFamily where
  unit := siteBounceKUnit
  local_eq := fun g => composeLines_local_eq g (lineBounceKUnit g) (lineBounceK_local_eq g) (List.finRange 12)
  local_dag_eq := fun g => composeLines_local_dag_eq g (lineBounceKUnit g)
    (fun l ψ₁ ψ₂ c h => by rw [lineBounceK_self_adj, lineBounceK_self_adj]; exact lineBounceK_local_eq g l ψ₁ ψ₂ c h)
    (List.finRange 12)
  op_zero := fun g => composeLines_zero (lineBounceKUnit g) (fun l => by
    funext c; rw [lineBounceKUnit_op, zeroVec_nloc, zeroVec_nloc]; exact NinthLoc6.mul_zero _) (List.finRange 12)
  dag_zero := fun g => composeLines_dag_zero (lineBounceKUnit g) (fun l => by
    rw [lineBounceK_self_adj]; funext c
    rw [lineBounceKUnit_op, zeroVec_nloc, zeroVec_nloc]; exact NinthLoc6.mul_zero _) (List.finRange 12)
  idle_empty := fun g ψ c h0 => composeLines_idle (lineBounceKUnit g) c (fun l φ => by
    rw [lineBounceKUnit_op]
    have hF : isOppSignLine (c.lookup g) l = false := by rw [h0]; rfl
    have hP : lineBounceKPerm g l c = c := by unfold lineBounceKPerm; rw [hF, ite_bool_false]
    rw [hF, hP, ite_bool_false]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  idle_dag_empty := fun g ψ c h0 => composeLines_dag_idle (lineBounceKUnit g) c (fun l φ => by
    rw [lineBounceK_self_adj, lineBounceKUnit_op]
    have hF : isOppSignLine (c.lookup g) l = false := by rw [h0]; rfl
    have hP : lineBounceKPerm g l c = c := by unfold lineBounceKPerm; rw [hF, ite_bool_false]
    rw [hF, hP, ite_bool_false]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  comm_sites := fun g₁ g₂ ψ hne =>
    composeLines_comm (lineBounceKUnit g₁) (lineBounceKUnit g₂)
      (fun l₁ l₂ => lineBounceK_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) ψ
  comm_dag_sites := fun g₁ g₂ ψ hne =>
    fockUnitary_comm_dag (fun φ => composeLines_comm (lineBounceKUnit g₁) (lineBounceKUnit g₂)
      (fun l₁ l₂ => lineBounceK_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) φ) ψ

private theorem lineHalfCoin_local_eq (g : Mat5) (l : Fin 12)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ x, x ≠ g → c'.lookup x = c.lookup x) → ψ₁ c' = ψ₂ c') :
    (lineHalfCoinUnit g l).op ψ₁ c = (lineHalfCoinUnit g l).op ψ₂ c ∧
    (lineHalfCoinUnit g l).dag ψ₁ c = (lineHalfCoinUnit g l).dag ψ₂ c := by
  have hSwapAct : (swapLineSlotsConfig g l c).activeDocks = c.activeDocks :=
    activeDocks_setDock_eq c g _ (swapLineSlotsDock_empty_iff l (c.lookup g))
  have hSwapOth : ∀ x, x ≠ g → (swapLineSlotsConfig g l c).lookup x = c.lookup x :=
    fun x hx => by unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_right hx]
  refine ⟨?_, ?_⟩
  · rw [lineHalfCoinUnit_op, lineHalfCoinUnit_op]
    apply congrArg (NinthLoc6.mul _)
    cases isLoneLine (c.lookup g) l with
    | false => rw [ite_bool_false, ite_bool_false]; exact h c rfl (fun _ _ => rfl)
    | true =>
      rw [ite_bool_true, ite_bool_true, h c rfl (fun _ _ => rfl), h (swapLineSlotsConfig g l c) hSwapAct hSwapOth]
  · rw [lineHalfCoinUnit_dag, lineHalfCoinUnit_dag]
    cases isLoneLine (c.lookup g) l with
    | false =>
      rw [ite_bool_false, ite_bool_false, h c rfl (fun _ _ => rfl)]
    | true =>
      rw [ite_bool_true, ite_bool_true, h c rfl (fun _ _ => rfl), h (swapLineSlotsConfig g l c) hSwapAct hSwapOth]

private theorem lineHalfCoin_comm_sites (g₁ g₂ : Mat5) (l₁ l₂ : Fin 12) (hne : g₁ ≠ g₂)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineHalfCoinUnit g₁ l₁).op ((lineHalfCoinUnit g₂ l₂).op ψ) =
      (lineHalfCoinUnit g₂ l₂).op ((lineHalfCoinUnit g₁ l₁).op ψ) := by
  funext c
  simp only [lineHalfCoinUnit_op]
  have hLk1 : (swapLineSlotsConfig g₁ l₁ c).lookup g₂ = c.lookup g₂ := by
    unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_right hne.symm]
  have hLk2 : (swapLineSlotsConfig g₂ l₂ c).lookup g₁ = c.lookup g₁ := by
    unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_right hne]
  have hSw : swapLineSlotsConfig g₂ l₂ (swapLineSlotsConfig g₁ l₁ c) =
      swapLineSlotsConfig g₁ l₁ (swapLineSlotsConfig g₂ l₂ c) := by
    unfold swapLineSlotsConfig
    rw [lookup_setDock, ite_eq_right hne.symm, lookup_setDock, ite_eq_right hne]
    exact (setDock_setDock_comm c g₁ g₂ _ _ hne).symm
  rw [hLk1, hLk2, hSw]
  set p1 := if isFullLine (c.lookup g₁) l₁ = true then NinthLoc6.zeta6 else NinthLoc6.one
  set p2 := if isFullLine (c.lookup g₂) l₂ = true then NinthLoc6.zeta6 else NinthLoc6.one
  cases isLoneLine (c.lookup g₁) l₁ <;> cases isLoneLine (c.lookup g₂) l₂
  · simp only [ite_bool_false]
    rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm p1 p2, NinthLoc6.mul_assoc]
  · simp only [ite_bool_false, ite_bool_true]
    exact nloc_phase_block2_comm p1 p2 NinthLoc6.coinDiag NinthLoc6.coinOff _ _
  · simp only [ite_bool_false, ite_bool_true]
    exact (nloc_phase_block2_comm p2 p1 NinthLoc6.coinDiag NinthLoc6.coinOff _ _).symm
  · simp only [ite_bool_true]
    exact nloc_block2_comm p1 p2 NinthLoc6.coinDiag NinthLoc6.coinOff _ _ _ _

private def halfCoinFamily : LocalSiteFamily where
  unit := siteHalfCoinUnit
  local_eq := fun g => composeLines_local_eq g (lineHalfCoinUnit g)
    (fun l ψ₁ ψ₂ c h => (lineHalfCoin_local_eq g l ψ₁ ψ₂ c h).1) (List.finRange 12)
  local_dag_eq := fun g => composeLines_local_dag_eq g (lineHalfCoinUnit g)
    (fun l ψ₁ ψ₂ c h => (lineHalfCoin_local_eq g l ψ₁ ψ₂ c h).2) (List.finRange 12)
  op_zero := fun g => composeLines_zero (lineHalfCoinUnit g) (fun l => by
    funext c; rw [lineHalfCoinUnit_op, zeroVec_nloc, zeroVec_nloc]
    cases isLoneLine (c.lookup g) l
    · rw [ite_bool_false]; exact NinthLoc6.mul_zero _
    · rw [ite_bool_true, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]) (List.finRange 12)
  dag_zero := fun g => composeLines_dag_zero (lineHalfCoinUnit g) (fun l => by
    funext c; rw [lineHalfCoinUnit_dag, zeroVec_nloc, zeroVec_nloc]
    cases isLoneLine (c.lookup g) l
    · rw [ite_bool_false]; exact NinthLoc6.mul_zero _
    · rw [ite_bool_true, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero]) (List.finRange 12)
  idle_empty := fun g ψ c h0 => composeLines_idle (lineHalfCoinUnit g) c (fun l φ => by
    rw [lineHalfCoinUnit_op]
    have hF : isFullLine (c.lookup g) l = false := by rw [h0]; rfl
    have hL : isLoneLine (c.lookup g) l = false := by rw [h0]; rfl
    rw [hF, hL, ite_bool_false, ite_bool_false]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  idle_dag_empty := fun g ψ c h0 => composeLines_dag_idle (lineHalfCoinUnit g) c (fun l φ => by
    rw [lineHalfCoinUnit_dag]
    have hF : isFullLine (c.lookup g) l = false := by rw [h0]; rfl
    have hL : isLoneLine (c.lookup g) l = false := by rw [h0]; rfl
    rw [hF, hL, ite_bool_false, ite_bool_false, NinthLoc6.conj_one]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  comm_sites := fun g₁ g₂ ψ hne =>
    composeLines_comm (lineHalfCoinUnit g₁) (lineHalfCoinUnit g₂)
      (fun l₁ l₂ => lineHalfCoin_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) ψ
  comm_dag_sites := fun g₁ g₂ ψ hne =>
    fockUnitary_comm_dag (fun φ => composeLines_comm (lineHalfCoinUnit g₁) (lineHalfCoinUnit g₂)
      (fun l₁ l₂ => lineHalfCoin_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) φ) ψ

private theorem lineMeet_local_eq (g : Mat5) (l : Fin 12)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ x, x ≠ g → c'.lookup x = c.lookup x) → ψ₁ c' = ψ₂ c') :
    (lineMeetUnit g l).op ψ₁ c = (lineMeetUnit g l).op ψ₂ c ∧
    (lineMeetUnit g l).dag ψ₁ c = (lineMeetUnit g l).dag ψ₂ c := by
  have hSwapAct : (swapLineRolesConfig g l c).activeDocks = c.activeDocks :=
    activeDocks_setDock_eq c g _ (swapLineRolesDock_empty_iff l (c.lookup g))
  have hSwapOth : ∀ x, x ≠ g → (swapLineRolesConfig g l c).lookup x = c.lookup x :=
    fun x hx => by unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_right hx]
  refine ⟨?_, ?_⟩
  · rw [lineMeetUnit_op, lineMeetUnit_op]
    apply congrArg (NinthLoc6.mul _)
    cases isSameSignDiffRoleLine (c.lookup g) l with
    | false => rw [ite_bool_false, ite_bool_false]; exact h c rfl (fun _ _ => rfl)
    | true => rw [ite_bool_true, ite_bool_true, h c rfl (fun _ _ => rfl), h (swapLineRolesConfig g l c) hSwapAct hSwapOth]
  · rw [lineMeetUnit_dag, lineMeetUnit_dag]
    cases isSameSignDiffRoleLine (c.lookup g) l with
    | false => rw [ite_bool_false, ite_bool_false, h c rfl (fun _ _ => rfl)]
    | true => rw [ite_bool_true, ite_bool_true, h c rfl (fun _ _ => rfl), h (swapLineRolesConfig g l c) hSwapAct hSwapOth]

private theorem lineMeet_comm_sites (g₁ g₂ : Mat5) (l₁ l₂ : Fin 12) (hne : g₁ ≠ g₂)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineMeetUnit g₁ l₁).op ((lineMeetUnit g₂ l₂).op ψ) =
      (lineMeetUnit g₂ l₂).op ((lineMeetUnit g₁ l₁).op ψ) := by
  funext c
  simp only [lineMeetUnit_op]
  have hLk1 : (swapLineRolesConfig g₁ l₁ c).lookup g₂ = c.lookup g₂ := by
    unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_right hne.symm]
  have hLk2 : (swapLineRolesConfig g₂ l₂ c).lookup g₁ = c.lookup g₁ := by
    unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_right hne]
  have hSw : swapLineRolesConfig g₂ l₂ (swapLineRolesConfig g₁ l₁ c) =
      swapLineRolesConfig g₁ l₁ (swapLineRolesConfig g₂ l₂ c) := by
    unfold swapLineRolesConfig
    rw [lookup_setDock, ite_eq_right hne.symm, lookup_setDock, ite_eq_right hne]
    exact (setDock_setDock_comm c g₁ g₂ _ _ hne).symm
  rw [hLk1, hLk2, hSw]
  set p1 := if isSameSignEqRoleLine (c.lookup g₁) l₁ = true then NinthLoc6.omega else NinthLoc6.one
  set p2 := if isSameSignEqRoleLine (c.lookup g₂) l₂ = true then NinthLoc6.omega else NinthLoc6.one
  cases isSameSignDiffRoleLine (c.lookup g₁) l₁ <;> cases isSameSignDiffRoleLine (c.lookup g₂) l₂
  · simp only [ite_bool_false]
    rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm p1 p2, NinthLoc6.mul_assoc]
  · simp only [ite_bool_false, ite_bool_true]
    exact nloc_phase_block2_comm p1 p2 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _
  · simp only [ite_bool_false, ite_bool_true]
    exact (nloc_phase_block2_comm p2 p1 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _).symm
  · simp only [ite_bool_true]
    exact nloc_block2_comm p1 p2 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _ _ _

private def meetFamily : LocalSiteFamily where
  unit := siteMeetUnit
  local_eq := fun g => composeLines_local_eq g (lineMeetUnit g)
    (fun l ψ₁ ψ₂ c h => (lineMeet_local_eq g l ψ₁ ψ₂ c h).1) (List.finRange 12)
  local_dag_eq := fun g => composeLines_local_dag_eq g (lineMeetUnit g)
    (fun l ψ₁ ψ₂ c h => (lineMeet_local_eq g l ψ₁ ψ₂ c h).2) (List.finRange 12)
  op_zero := fun g => composeLines_zero (lineMeetUnit g) (fun l => by
    funext c; rw [lineMeetUnit_op, zeroVec_nloc, zeroVec_nloc]
    cases isSameSignDiffRoleLine (c.lookup g) l
    · rw [ite_bool_false]; exact NinthLoc6.mul_zero _
    · rw [ite_bool_true, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]) (List.finRange 12)
  dag_zero := fun g => composeLines_dag_zero (lineMeetUnit g) (fun l => by
    funext c; rw [lineMeetUnit_dag, zeroVec_nloc, zeroVec_nloc]
    cases isSameSignDiffRoleLine (c.lookup g) l
    · rw [ite_bool_false]; exact NinthLoc6.mul_zero _
    · rw [ite_bool_true, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero]) (List.finRange 12)
  idle_empty := fun g ψ c h0 => composeLines_idle (lineMeetUnit g) c (fun l φ => by
    rw [lineMeetUnit_op]
    have hE : isSameSignEqRoleLine (c.lookup g) l = false := by rw [h0]; rfl
    have hD : isSameSignDiffRoleLine (c.lookup g) l = false := by rw [h0]; rfl
    rw [hE, hD, ite_bool_false, ite_bool_false]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  idle_dag_empty := fun g ψ c h0 => composeLines_dag_idle (lineMeetUnit g) c (fun l φ => by
    rw [lineMeetUnit_dag]
    have hE : isSameSignEqRoleLine (c.lookup g) l = false := by rw [h0]; rfl
    have hD : isSameSignDiffRoleLine (c.lookup g) l = false := by rw [h0]; rfl
    rw [hE, hD, ite_bool_false, ite_bool_false, NinthLoc6.conj_one]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  comm_sites := fun g₁ g₂ ψ hne =>
    composeLines_comm (lineMeetUnit g₁) (lineMeetUnit g₂)
      (fun l₁ l₂ => lineMeet_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) ψ
  comm_dag_sites := fun g₁ g₂ ψ hne =>
    fockUnitary_comm_dag (fun φ => composeLines_comm (lineMeetUnit g₁) (lineMeetUnit g₂)
      (fun l₁ l₂ => lineMeet_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) φ) ψ

private theorem siteMPair_local_eq (g : Mat5) (u : NinthLoc6)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ x, x ≠ g → c'.lookup x = c.lookup x) → ψ₁ c' = ψ₂ c') :
    block12Op (fun x => isSoleIdentPairDock (x.lookup g)) (moveSolePairConfig g) u NinthLoc6.inv12 ψ₁ c =
      block12Op (fun x => isSoleIdentPairDock (x.lookup g)) (moveSolePairConfig g) u NinthLoc6.inv12 ψ₂ c := by
  rw [nloc_block12Op, nloc_block12Op]
  cases ha : isSoleIdentPairDock (c.lookup g) with
  | false => rw [ite_bool_false, ite_bool_false]; exact h c rfl (fun _ _ => rfl)
  | true =>
    rw [ite_bool_true, ite_bool_true, h c rfl (fun _ _ => rfl)]
    apply congrArg (NinthLoc6.add _)
    apply congrArg (NinthLoc6.mul _)
    apply sumFin12_congr
    intro m
    apply h
    · apply activeDocks_setDock_eq
      have hne1 := (moveSolePairDock_spec (c.lookup g) ha).2.2.2.2.1 m
      have hne2 : c.lookup g ≠ v1FullDock := by
        intro h0; rw [h0] at ha; exact Bool.noConfusion ha
      exact ⟨fun h1 => absurd h1 hne1, fun h2 => absurd h2 hne2⟩
    · intro x hx; unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_right hx]

private theorem siteMPair_comm_sites (g₁ g₂ : Mat5) (u₁ u₂ : NinthLoc6) (hne : g₁ ≠ g₂)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    block12Op (fun x => isSoleIdentPairDock (x.lookup g₁)) (moveSolePairConfig g₁) u₁ NinthLoc6.inv12
      (block12Op (fun x => isSoleIdentPairDock (x.lookup g₂)) (moveSolePairConfig g₂) u₂ NinthLoc6.inv12 ψ) =
    block12Op (fun x => isSoleIdentPairDock (x.lookup g₂)) (moveSolePairConfig g₂) u₂ NinthLoc6.inv12
      (block12Op (fun x => isSoleIdentPairDock (x.lookup g₁)) (moveSolePairConfig g₁) u₁ NinthLoc6.inv12 ψ) := by
  funext c
  simp only [nloc_block12Op]
  have hLk1 : ∀ m, (moveSolePairConfig g₁ m c).lookup g₂ = c.lookup g₂ :=
    fun m => by unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_right hne.symm]
  have hLk2 : ∀ m, (moveSolePairConfig g₂ m c).lookup g₁ = c.lookup g₁ :=
    fun m => by unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_right hne]
  have hSw : ∀ m₁ m₂, moveSolePairConfig g₂ m₂ (moveSolePairConfig g₁ m₁ c) =
      moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c) := by
    intro m₁ m₂; unfold moveSolePairConfig
    rw [lookup_setDock, ite_eq_right hne.symm, lookup_setDock, ite_eq_right hne]
    exact (setDock_setDock_comm c g₁ g₂ _ _ hne).symm
  cases h1 : isSoleIdentPairDock (c.lookup g₁) <;> cases h2 : isSoleIdentPairDock (c.lookup g₂)
  · simp only [ite_bool_false]
  · simp only [ite_bool_false, ite_bool_true]
    apply congrArg (NinthLoc6.add _)
    apply congrArg (NinthLoc6.mul _)
    apply sumFin12_congr; intro m₂; rw [hLk2 m₂, h1, ite_bool_false]
  · simp only [ite_bool_false, ite_bool_true]
    apply congrArg (NinthLoc6.add _)
    apply congrArg (NinthLoc6.mul _)
    apply sumFin12_congr; intro m₁; rw [hLk1 m₁, h2, ite_bool_false]
  · simp only [ite_bool_true]
    set k1 := NinthLoc6.mul (NinthLoc6.sub u₁ NinthLoc6.one) NinthLoc6.inv12
    set k2 := NinthLoc6.mul (NinthLoc6.sub u₂ NinthLoc6.one) NinthLoc6.inv12
    have hS1 : sumFin12 (fun m₁ =>
        if isSoleIdentPairDock ((moveSolePairConfig g₁ m₁ c).lookup g₂) = true then
          NinthLoc6.add (ψ (moveSolePairConfig g₁ m₁ c))
            (NinthLoc6.mul k2 (sumFin12 (fun m₂ => ψ (moveSolePairConfig g₂ m₂ (moveSolePairConfig g₁ m₁ c)))))
        else ψ (moveSolePairConfig g₁ m₁ c)) =
      NinthLoc6.add (sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ c)))
        (NinthLoc6.mul k2 (sumFin12 (fun m₁ => sumFin12 (fun m₂ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))) := by
      have hC : sumFin12 (fun m₁ =>
          if isSoleIdentPairDock ((moveSolePairConfig g₁ m₁ c).lookup g₂) = true then
            NinthLoc6.add (ψ (moveSolePairConfig g₁ m₁ c))
              (NinthLoc6.mul k2 (sumFin12 (fun m₂ => ψ (moveSolePairConfig g₂ m₂ (moveSolePairConfig g₁ m₁ c)))))
          else ψ (moveSolePairConfig g₁ m₁ c)) =
        sumFin12 (fun m₁ => NinthLoc6.add (ψ (moveSolePairConfig g₁ m₁ c))
          (NinthLoc6.mul k2 (sumFin12 (fun m₂ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))) := by
        apply sumFin12_congr; intro m₁
        rw [hLk1 m₁, h2, ite_bool_true]
        apply congrArg (NinthLoc6.add _); apply congrArg (NinthLoc6.mul k2)
        apply sumFin12_congr; intro m₂; rw [hSw m₁ m₂]
      rw [hC, nloc_sumFin12_add, nloc_sumFin12_mul_left]
    have hS2 : sumFin12 (fun m₂ =>
        if isSoleIdentPairDock ((moveSolePairConfig g₂ m₂ c).lookup g₁) = true then
          NinthLoc6.add (ψ (moveSolePairConfig g₂ m₂ c))
            (NinthLoc6.mul k1 (sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))
        else ψ (moveSolePairConfig g₂ m₂ c)) =
      NinthLoc6.add (sumFin12 (fun m₂ => ψ (moveSolePairConfig g₂ m₂ c)))
        (NinthLoc6.mul k1 (sumFin12 (fun m₂ => sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))) := by
      have hC : sumFin12 (fun m₂ =>
          if isSoleIdentPairDock ((moveSolePairConfig g₂ m₂ c).lookup g₁) = true then
            NinthLoc6.add (ψ (moveSolePairConfig g₂ m₂ c))
              (NinthLoc6.mul k1 (sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))
          else ψ (moveSolePairConfig g₂ m₂ c)) =
        sumFin12 (fun m₂ => NinthLoc6.add (ψ (moveSolePairConfig g₂ m₂ c))
          (NinthLoc6.mul k1 (sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))) := by
        apply sumFin12_congr; intro m₂
        rw [hLk2 m₂, h1, ite_bool_true]
      rw [hC, nloc_sumFin12_add, nloc_sumFin12_mul_left]
    rw [hS1, hS2, NinthLoc6.mul_add, NinthLoc6.mul_add, nloc_sumFin12_swap]
    rw [← NinthLoc6.mul_assoc k1 k2, ← NinthLoc6.mul_assoc k2 k1, NinthLoc6.mul_comm k1 k2]
    rw [NinthLoc6.add_assoc, NinthLoc6.add_assoc]
    apply congrArg (NinthLoc6.add (ψ c))
    rw [← NinthLoc6.add_assoc, NinthLoc6.add_comm (NinthLoc6.mul k2 _), NinthLoc6.add_assoc]

private def mpairFamily : LocalSiteFamily where
  unit := siteMPairUnit
  local_eq := fun g => siteMPair_local_eq g NinthLoc6.zeta18
  local_dag_eq := fun g => siteMPair_local_eq g (NinthLoc6.conj NinthLoc6.zeta18)
  op_zero := fun g => by
    funext c; rw [siteMPairUnit_op, zeroVec_nloc, zeroVec_nloc]
    cases isSoleIdentPairDock (c.lookup g)
    · rw [ite_bool_false]
    · rw [ite_bool_true, nloc_sumFin12_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero]
  dag_zero := fun g => by
    funext c; rw [siteMPairUnit_dag, zeroVec_nloc, zeroVec_nloc]
    cases isSoleIdentPairDock (c.lookup g)
    · rw [ite_bool_false]
    · rw [ite_bool_true, nloc_sumFin12_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero]
  idle_empty := fun g ψ c h0 => by
    rw [siteMPairUnit_op]
    have hF : isSoleIdentPairDock (c.lookup g) = false := by rw [h0]; decide
    rw [hF, ite_bool_false]
  idle_dag_empty := fun g ψ c h0 => by
    rw [siteMPairUnit_dag]
    have hF : isSoleIdentPairDock (c.lookup g) = false := by rw [h0]; decide
    rw [hF, ite_bool_false]
  comm_sites := fun g₁ g₂ ψ hne => siteMPair_comm_sites g₁ g₂ NinthLoc6.zeta18 NinthLoc6.zeta18 hne ψ
  comm_dag_sites := fun g₁ g₂ ψ hne =>
    siteMPair_comm_sites g₁ g₂ (NinthLoc6.conj NinthLoc6.zeta18) (NinthLoc6.conj NinthLoc6.zeta18) hne ψ

private def phiOddFamily (χ : ChiralInvariant) : LocalSiteFamily where
  unit := sitePhiOddUnit χ
  local_eq := fun g ψ₁ ψ₂ c h => by
    rw [sitePhiOddUnit_op, sitePhiOddUnit_op, h c rfl (fun _ _ => rfl)]
  local_dag_eq := fun g ψ₁ ψ₂ c h => by
    rw [sitePhiOddUnit_dag, sitePhiOddUnit_dag, h c rfl (fun _ _ => rfl)]
  op_zero := fun g => by
    funext c; rw [sitePhiOddUnit_op, zeroVec_nloc, zeroVec_nloc]; exact NinthLoc6.mul_zero _
  dag_zero := fun g => by
    funext c; rw [sitePhiOddUnit_dag, zeroVec_nloc, zeroVec_nloc]; exact NinthLoc6.mul_zero _
  idle_empty := fun g ψ c h0 => by
    rw [sitePhiOddUnit_op, h0, χ.chi_v1, Int.mul_zero]; exact NinthLoc6.one_mul _
  idle_dag_empty := fun g ψ c h0 => by
    rw [sitePhiOddUnit_dag, h0, χ.chi_v1, Int.mul_zero, NinthLoc6.conj_one]; exact NinthLoc6.one_mul _
  comm_sites := fun g₁ g₂ ψ _ => by
    funext c; rw [sitePhiOddUnit_op, sitePhiOddUnit_op, sitePhiOddUnit_op, sitePhiOddUnit_op]
    rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm (NinthLoc6.zeta6Pow _), NinthLoc6.mul_assoc]
  comm_dag_sites := fun g₁ g₂ ψ _ => by
    funext c; rw [sitePhiOddUnit_dag, sitePhiOddUnit_dag, sitePhiOddUnit_dag, sitePhiOddUnit_dag]
    rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm (NinthLoc6.conj _), NinthLoc6.mul_assoc]

/-- The 6 concrete global quantum Fock unitaries on infinite `{3,4,3,4}` over `ℤ[ζ_9][1/6]`. -/
def fockBounceKUnit : FockUnitary NinthLoc6 HoneycombConfig := globalUnitary bounceKFamily
def fockMPairUnit : FockUnitary NinthLoc6 HoneycombConfig := globalUnitary mpairFamily
def fockMeetUnit : FockUnitary NinthLoc6 HoneycombConfig := globalUnitary meetFamily
def fockHalfCoinUnit : FockUnitary NinthLoc6 HoneycombConfig := globalUnitary halfCoinFamily
def fockPhiOddUnit (χ : ChiralInvariant) : FockUnitary NinthLoc6 HoneycombConfig :=
  globalUnitary (phiOddFamily χ)
def fockStreamUnit : FockUnitary NinthLoc6 HoneycombConfig :=
  permUnitary (R := NinthLoc6) streamConfig streamConfigInv
    (fun c => (thm_fock_honeycomb_config_symmetries c).1)
    (fun c => (thm_fock_honeycomb_config_symmetries c).2.1)

abbrev fockBounceK := fockBounceKUnit.op
abbrev fockMPair := fockMPairUnit.op
abbrev fockMPairDag := fockMPairUnit.dag
abbrev fockMeet := fockMeetUnit.op
abbrev fockMeetDag := fockMeetUnit.dag
abbrev fockHalfCoin := fockHalfCoinUnit.op
abbrev fockHalfCoinDag := fockHalfCoinUnit.dag
abbrev fockPhiOdd (χ : ChiralInvariant) := (fockPhiOddUnit χ).op
abbrev fockPhiOddDag (χ : ChiralInvariant) := (fockPhiOddUnit χ).dag
abbrev fockStream := fockStreamUnit.op
abbrev fockStreamDag := fockStreamUnit.dag

private theorem fockStream_eval (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    fockStream ψ c = ψ (streamConfigInv c) := rfl

private theorem fockStreamDag_eval (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    fockStreamDag ψ c = ψ (streamConfig c) := rfl


/-! ## Section 5: Exact Global Scale-2 Pairwise Commutation (`[K, M_pair] = [K, M_meet] = [M_pair, M_meet] = 0`) -/

private theorem lineBounceK_comm_same_site (g : Mat5) (l₁ l₂ : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g l₁).op ((lineBounceKUnit g l₂).op ψ) =
      (lineBounceKUnit g l₂).op ((lineBounceKUnit g l₁).op ψ) := by
  if hl : l₁ = l₂ then rw [hl]
  else
    have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ hl
    funext c
    rw [lineBounceKUnit_op, lineBounceKUnit_op, lineBounceKUnit_op, lineBounceKUnit_op]
    have hLk1 : (lineBounceKPerm g l₁ c).lookup g (lineA l₂) = c.lookup g (lineA l₂) ∧
                (lineBounceKPerm g l₁ c).lookup g (lineB l₂) = c.lookup g (lineB l₂) := by
      unfold lineBounceKPerm; cases isOppSignLine (c.lookup g) l₁ with
      | false => exact ⟨rfl, rfl⟩
      | true =>
        unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineSlotsDock
        exact ⟨by simp only [ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm],
               by simp only [ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]⟩
    have hLk2 : (lineBounceKPerm g l₂ c).lookup g (lineA l₁) = c.lookup g (lineA l₁) ∧
                (lineBounceKPerm g l₂ c).lookup g (lineB l₁) = c.lookup g (lineB l₁) := by
      unfold lineBounceKPerm; cases isOppSignLine (c.lookup g) l₂ with
      | false => exact ⟨rfl, rfl⟩
      | true =>
        unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineSlotsDock
        exact ⟨by simp only [ite_eq_right hDisj.1, ite_eq_right hDisj.2.1],
               by simp only [ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]⟩
    have hO1 : isOppSignLine ((lineBounceKPerm g l₂ c).lookup g) l₁ = isOppSignLine (c.lookup g) l₁ := by
      unfold isOppSignLine; rw [hLk2.1, hLk2.2]
    have hO2 : isOppSignLine ((lineBounceKPerm g l₁ c).lookup g) l₂ = isOppSignLine (c.lookup g) l₂ := by
      unfold isOppSignLine; rw [hLk1.1, hLk1.2]
    have hPerm : lineBounceKPerm g l₂ (lineBounceKPerm g l₁ c) = lineBounceKPerm g l₁ (lineBounceKPerm g l₂ c) := by
      unfold lineBounceKPerm; rw [hO1, hO2]
      cases isOppSignLine (c.lookup g) l₁ <;> cases isOppSignLine (c.lookup g) l₂
      · rfl
      · rfl
      · rfl
      · unfold swapLineSlotsConfig
        simp only [lookup_setDock, ite_eq_left rfl, setDock_setDock_same]
        apply congrArg (c.setDock g); funext s; unfold swapLineSlotsDock
        if hsA1 : s = lineA l₁ then
          simp only [ite_eq_left hsA1, ite_eq_right (by rw [hsA1]; exact hDisj.1), ite_eq_right (by rw [hsA1]; exact hDisj.2.1),
            ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]
        else if hsB1 : s = lineB l₁ then
          simp only [ite_eq_right hsA1, ite_eq_left hsB1, ite_eq_right (by rw [hsB1]; exact hDisj.2.2.1),
            ite_eq_right (by rw [hsB1]; exact hDisj.2.2.2), ite_eq_right hDisj.1, ite_eq_right hDisj.2.1]
        else if hsA2 : s = lineA l₂ then
          simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_left hsA2, ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]
        else if hsB2 : s = lineB l₂ then
          simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_right hsA2, ite_eq_left hsB2, ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm]
        else
          simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_right hsA2, ite_eq_right hsB2]
    rw [hO1, hO2, hPerm, ← NinthLoc6.mul_assoc, ← NinthLoc6.mul_assoc,
        NinthLoc6.mul_comm (if isOppSignLine (c.lookup g) l₁ = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one)]

private theorem lineBounceK_comm_lineMeet_same_site (g : Mat5) (l₁ l₂ : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g l₁).op ((lineMeetUnit g l₂).op ψ) =
      (lineMeetUnit g l₂).op ((lineBounceKUnit g l₁).op ψ) := by
  funext c
  simp only [lineBounceKUnit_op, lineMeetUnit_op]
  if hl : l₁ = l₂ then
    rw [hl]
    cases hOpp : isOppSignLine (c.lookup g) l₂ with
    | true =>
      have hEqF : isSameSignEqRoleLine (c.lookup g) l₂ = false := by
        unfold isOppSignLine at hOpp; unfold isSameSignEqRoleLine
        cases hA : c.lookup g (lineA l₂) <;> cases hB : c.lookup g (lineB l₂) <;> rw [hA, hB] at hOpp ⊢
        all_goals try rfl
        exact decide_eq_false (fun ⟨hs, _⟩ => (of_decide_eq_true hOpp) hs)
      have hDiffF : isSameSignDiffRoleLine (c.lookup g) l₂ = false := by
        unfold isOppSignLine at hOpp; unfold isSameSignDiffRoleLine
        cases hA : c.lookup g (lineA l₂) <;> cases hB : c.lookup g (lineB l₂) <;> rw [hA, hB] at hOpp ⊢
        all_goals try rfl
        exact decide_eq_false (fun ⟨hs, _⟩ => (of_decide_eq_true hOpp) hs)
      have hSwapOpp : isOppSignLine ((lineBounceKPerm g l₂ c).lookup g) l₂ = true := by
        unfold lineBounceKPerm; rw [ite_eq_left hOpp]; unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]
        unfold isOppSignLine swapLineSlotsDock at hOpp ⊢
        have hne := (line_geom_facts.1 l₂).2.2
        simp only [ite_eq_left rfl, ite_eq_right hne.symm]
        cases hA : c.lookup g (lineA l₂) <;> cases hB : c.lookup g (lineB l₂) <;> rw [hA, hB] at hOpp
        all_goals try exact Bool.noConfusion hOpp
        exact decide_eq_true (fun e => (of_decide_eq_true hOpp) e.symm)
      have hSwapEqF : isSameSignEqRoleLine ((lineBounceKPerm g l₂ c).lookup g) l₂ = false := by
        unfold isOppSignLine at hSwapOpp; unfold isSameSignEqRoleLine
        cases hA : (lineBounceKPerm g l₂ c).lookup g (lineA l₂) <;>
        cases hB : (lineBounceKPerm g l₂ c).lookup g (lineB l₂) <;> rw [hA, hB] at hSwapOpp ⊢
        all_goals try rfl
        exact decide_eq_false (fun ⟨hs, _⟩ => (of_decide_eq_true hSwapOpp) hs)
      have hSwapDiffF : isSameSignDiffRoleLine ((lineBounceKPerm g l₂ c).lookup g) l₂ = false := by
        unfold isOppSignLine at hSwapOpp; unfold isSameSignDiffRoleLine
        cases hA : (lineBounceKPerm g l₂ c).lookup g (lineA l₂) <;>
        cases hB : (lineBounceKPerm g l₂ c).lookup g (lineB l₂) <;> rw [hA, hB] at hSwapOpp ⊢
        all_goals try rfl
        exact decide_eq_false (fun ⟨hs, _⟩ => (of_decide_eq_true hSwapOpp) hs)
      rw [hSwapEqF, hSwapDiffF, hEqF, hDiffF]
      simp only [ite_bool_false, ite_bool_true, NinthLoc6.one_mul]
    | false =>
      have hPermId : lineBounceKPerm g l₂ c = c := by unfold lineBounceKPerm; rw [hOpp, ite_bool_false]
      have hSwapRoleOpp : isOppSignLine ((swapLineRolesConfig g l₂ c).lookup g) l₂ = false := by
        unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]
        unfold isOppSignLine swapLineRolesDock at hOpp ⊢
        have hne := (line_geom_facts.1 l₂).2.2
        cases hA : c.lookup g (lineA l₂) <;> cases hB : c.lookup g (lineB l₂) <;> rw [hA, hB] at hOpp ⊢
        all_goals try rfl
        simp only [ite_eq_left rfl, ite_eq_right hne.symm]; exact hOpp
      have hSwapRolePerm : lineBounceKPerm g l₂ (swapLineRolesConfig g l₂ c) = swapLineRolesConfig g l₂ c := by
        unfold lineBounceKPerm; rw [hSwapRoleOpp, ite_bool_false]
      rw [hPermId, hSwapRoleOpp, hSwapRolePerm]
      simp only [ite_bool_false, NinthLoc6.one_mul]
  else
    have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ hl
    have hLkK : (lineBounceKPerm g l₁ c).lookup g (lineA l₂) = c.lookup g (lineA l₂) ∧
                (lineBounceKPerm g l₁ c).lookup g (lineB l₂) = c.lookup g (lineB l₂) := by
      unfold lineBounceKPerm
      cases isOppSignLine (c.lookup g) l₁ with
      | false => exact ⟨rfl, rfl⟩
      | true =>
        unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]
        unfold swapLineSlotsDock
        exact ⟨by simp only [ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm],
               by simp only [ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]⟩
    have hLkM : (swapLineRolesConfig g l₂ c).lookup g (lineA l₁) = c.lookup g (lineA l₁) ∧
                (swapLineRolesConfig g l₂ c).lookup g (lineB l₁) = c.lookup g (lineB l₁) := by
      unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]
      unfold swapLineRolesDock
      cases c.lookup g (lineA l₂) <;> cases c.lookup g (lineB l₂)
      all_goals try exact ⟨rfl, rfl⟩
      exact ⟨by simp only [ite_eq_right hDisj.1, ite_eq_right hDisj.2.1],
             by simp only [ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]⟩
    have hEqM : isSameSignEqRoleLine ((lineBounceKPerm g l₁ c).lookup g) l₂ = isSameSignEqRoleLine (c.lookup g) l₂ := by
      unfold isSameSignEqRoleLine; rw [hLkK.1, hLkK.2]
    have hDiffM : isSameSignDiffRoleLine ((lineBounceKPerm g l₁ c).lookup g) l₂ = isSameSignDiffRoleLine (c.lookup g) l₂ := by
      unfold isSameSignDiffRoleLine; rw [hLkK.1, hLkK.2]
    have hOppK : isOppSignLine ((swapLineRolesConfig g l₂ c).lookup g) l₁ = isOppSignLine (c.lookup g) l₁ := by
      unfold isOppSignLine; rw [hLkM.1, hLkM.2]
    have hSw : swapLineRolesConfig g l₂ (lineBounceKPerm g l₁ c) =
        lineBounceKPerm g l₁ (swapLineRolesConfig g l₂ c) := by
      unfold lineBounceKPerm; rw [hOppK]
      cases isOppSignLine (c.lookup g) l₁ with
      | false => rfl
      | true =>
        unfold swapLineRolesConfig swapLineSlotsConfig
        simp only [lookup_setDock, ite_eq_left rfl, setDock_setDock_same]
        apply congrArg (c.setDock g)
        funext s
        unfold swapLineRolesDock swapLineSlotsDock
        have hA2 : (if lineA l₂ = lineA l₁ then c.lookup g (lineB l₁) else if lineA l₂ = lineB l₁ then c.lookup g (lineA l₁) else c.lookup g (lineA l₂)) = c.lookup g (lineA l₂) := by
          simp only [ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm]
        have hB2 : (if lineB l₂ = lineA l₁ then c.lookup g (lineB l₁) else if lineB l₂ = lineB l₁ then c.lookup g (lineA l₁) else c.lookup g (lineB l₂)) = c.lookup g (lineB l₂) := by
          simp only [ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]
        rw [hA2, hB2]
        cases c.lookup g (lineA l₂) <;> cases c.lookup g (lineB l₂)
        all_goals try rfl
        if hsA1 : s = lineA l₁ then
          simp only [ite_eq_left hsA1, ite_eq_right (by rw [hsA1]; exact hDisj.1), ite_eq_right (by rw [hsA1]; exact hDisj.2.1),
            ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]
        else if hsB1 : s = lineB l₁ then
          simp only [ite_eq_right hsA1, ite_eq_left hsB1, ite_eq_right (by rw [hsB1]; exact hDisj.2.2.1),
            ite_eq_right (by rw [hsB1]; exact hDisj.2.2.2), ite_eq_right hDisj.1, ite_eq_right hDisj.2.1]
        else if hsA2 : s = lineA l₂ then
          simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_left hsA2]
        else if hsB2 : s = lineB l₂ then
          simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_right hsA2, ite_eq_left hsB2]
        else
          simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_right hsA2, ite_eq_right hsB2]
    rw [hEqM, hDiffM, hOppK, hSw]
    set pK := if isOppSignLine (c.lookup g) l₁ = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one
    set pM := if isSameSignEqRoleLine (c.lookup g) l₂ = true then NinthLoc6.omega else NinthLoc6.one
    cases isSameSignDiffRoleLine (c.lookup g) l₂
    · simp only [ite_bool_false]
      rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm pK pM, NinthLoc6.mul_assoc]
    · simp only [ite_bool_true]
      exact nloc_phase_block2_comm pK pM NinthLoc6.meetKeep NinthLoc6.meetSwap _ _

private theorem lineBounceK_comm_siteMPair (g₁ g₂ : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g₁ l).op ((siteMPairUnit g₂).op ψ) =
      (siteMPairUnit g₂).op ((lineBounceKUnit g₁ l).op ψ) := by
  funext c
  simp only [lineBounceKUnit_op, siteMPairUnit_op]
  if hg : g₁ = g₂ then
    rw [hg]
    cases hPair : isSoleIdentPairDock (c.lookup g₂) with
    | true =>
      have hOppFalse : ∀ d : FullDock, isSoleIdentPairDock d = true → isOppSignLine d l = false := by
        intro d hd
        unfold isSoleIdentPairDock at hd
        cases hf : findSolePairLine d with
        | none => rw [hf] at hd; exact Bool.noConfusion hd
        | some l0 =>
          have hl0 := (find?_eq_some_iff _ _ _ hf).2
          if hll : l = l0 then
            rw [hll]
            have hSame := (Bool.and_eq_true _ _).mp hl0 |>.1
            unfold isSameSignEqRoleLine at hSame; unfold isOppSignLine
            cases hA : d (lineA l0) <;> cases hB : d (lineB l0) <;> rw [hA, hB] at hSame ⊢
            all_goals try rfl
            exact decide_eq_false (fun hne => hne (of_decide_eq_true hSame).1)
          else
            have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
            have hDisj := line_geom_facts.2.2.2.1 l0 l (fun e => hll e.symm)
            have hEmpty : d (lineA l) = .empty := by
              rcases of_decide_eq_true hAll with h1 | h2 | h3
              · exact absurd h1.symm hDisj.1
              · exact absurd h2.symm hDisj.2.2.1
              · exact h3
            unfold isOppSignLine; rw [hEmpty]; rfl
      have hOppC := hOppFalse (c.lookup g₂) hPair
      have hPermId : lineBounceKPerm g₂ l c = c := by unfold lineBounceKPerm; rw [hOppC, ite_bool_false]
      rw [hOppC, hPermId, hPair]
      simp only [ite_bool_false, ite_bool_true, NinthLoc6.one_mul]
      apply congrArg (NinthLoc6.add _)
      apply congrArg (NinthLoc6.mul _)
      apply sumFin12_congr; intro m
      have hPairM : isSoleIdentPairDock ((moveSolePairConfig g₂ m c).lookup g₂) = true := by
        unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_left rfl]
        exact (moveSolePairDock_spec (c.lookup g₂) hPair).1 m
      have hOppM := hOppFalse _ hPairM
      have hPermM : lineBounceKPerm g₂ l (moveSolePairConfig g₂ m c) = moveSolePairConfig g₂ m c := by
        unfold lineBounceKPerm; rw [hOppM, ite_bool_false]
      rw [hOppM, hPermM, ite_bool_false, NinthLoc6.one_mul]
    | false =>
      have hPermNoPair : isSoleIdentPairDock ((lineBounceKPerm g₂ l c).lookup g₂) = false := by
        unfold lineBounceKPerm
        cases hOpp : isOppSignLine (c.lookup g₂) l with
        | false => rw [ite_bool_false]; exact hPair
        | true =>
          rw [ite_bool_true]
          unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]
          cases hP : isSoleIdentPairDock (swapLineSlotsDock l (c.lookup g₂)) with
          | false => rfl
          | true =>
            have hSwapOpp : isOppSignLine (swapLineSlotsDock l (c.lookup g₂)) l = true := by
              unfold isOppSignLine swapLineSlotsDock at hOpp ⊢
              have hne := (line_geom_facts.1 l).2.2
              simp only [ite_eq_left rfl, ite_eq_right hne.symm]
              cases hA : c.lookup g₂ (lineA l) <;> cases hB : c.lookup g₂ (lineB l) <;> rw [hA, hB] at hOpp
              all_goals try exact Bool.noConfusion hOpp
              exact decide_eq_true (fun e => (of_decide_eq_true hOpp) e.symm)
            unfold isSoleIdentPairDock at hP
            cases hf : findSolePairLine (swapLineSlotsDock l (c.lookup g₂)) with
            | none => rw [hf] at hP; exact Bool.noConfusion hP
            | some l0 =>
              have hl0 := (find?_eq_some_iff _ _ _ hf).2
              if hll : l = l0 then
                rw [hll] at hSwapOpp
                have hSame := (Bool.and_eq_true _ _).mp hl0 |>.1
                unfold isSameSignEqRoleLine at hSame; unfold isOppSignLine at hSwapOpp
                cases hA : swapLineSlotsDock l (c.lookup g₂) (lineA l0) <;>
                cases hB : swapLineSlotsDock l (c.lookup g₂) (lineB l0) <;> rw [hA, hB] at hSame hSwapOpp
                all_goals try exact Bool.noConfusion hSame
                exact absurd (of_decide_eq_true hSame).1 (of_decide_eq_true hSwapOpp)
              else
                have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
                have hDisj := line_geom_facts.2.2.2.1 l0 l (fun e => hll e.symm)
                have hEmpty : swapLineSlotsDock l (c.lookup g₂) (lineA l) = .empty := by
                  rcases of_decide_eq_true hAll with h1 | h2 | h3
                  · exact absurd h1.symm hDisj.1
                  · exact absurd h2.symm hDisj.2.2.1
                  · exact h3
                unfold isOppSignLine at hSwapOpp; rw [hEmpty] at hSwapOpp; exact Bool.noConfusion hSwapOpp
      rw [hPermNoPair]
      simp only [ite_bool_false]
  else
    have hLkK : (lineBounceKPerm g₁ l c).lookup g₂ = c.lookup g₂ := by
      unfold lineBounceKPerm
      cases isOppSignLine (c.lookup g₁) l with
      | false => rfl
      | true => unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_right (fun e => hg e.symm)]
    have hLkP : ∀ m, (moveSolePairConfig g₂ m c).lookup g₁ = c.lookup g₁ :=
      fun m => by unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_right hg]
    have hSw : ∀ m, moveSolePairConfig g₂ m (lineBounceKPerm g₁ l c) =
        lineBounceKPerm g₁ l (moveSolePairConfig g₂ m c) := by
      intro m; unfold lineBounceKPerm; rw [hLkP m]
      cases isOppSignLine (c.lookup g₁) l with
      | false => rfl
      | true =>
        unfold moveSolePairConfig swapLineSlotsConfig
        rw [lookup_setDock, ite_eq_right (fun e => hg e.symm), lookup_setDock, ite_eq_right hg]
        exact (setDock_setDock_comm c g₁ g₂ _ _ hg).symm
    rw [hLkK]
    cases isSoleIdentPairDock (c.lookup g₂) with
    | false => simp only [ite_bool_false]
    | true =>
      simp only [ite_bool_true]
      set pK := if isOppSignLine (c.lookup g₁) l = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one
      rw [NinthLoc6.mul_add, ← NinthLoc6.mul_assoc pK NinthLoc6.pairHop,
          NinthLoc6.mul_comm pK NinthLoc6.pairHop, NinthLoc6.mul_assoc NinthLoc6.pairHop pK,
          ← nloc_sumFin12_mul_left]
      apply congrArg (NinthLoc6.add _)
      apply congrArg (NinthLoc6.mul _)
      apply sumFin12_congr; intro m
      rw [hLkP m, hSw m]

private theorem siteMeet_on_soleIdentPair (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) (hPair : isSoleIdentPairDock (c.lookup g) = true) :
    (siteMeetUnit g).op ψ c = NinthLoc6.mul NinthLoc6.omega (ψ c) := by
  unfold isSoleIdentPairDock at hPair
  cases hf : findSolePairLine (c.lookup g) with
  | none => rw [hf] at hPair; exact Bool.noConfusion hPair
  | some l0 =>
    have hl0 := (find?_eq_some_iff _ _ _ hf).2
    have hEqL0 : isSameSignEqRoleLine (c.lookup g) l0 = true := ((Bool.and_eq_true _ _).mp hl0).1
    have hDiffFalse : ∀ l : Fin 12, isSameSignDiffRoleLine (c.lookup g) l = false := by
      intro l
      if hll : l = l0 then
        rw [hll]; unfold isSameSignEqRoleLine at hEqL0; unfold isSameSignDiffRoleLine
        cases hA : c.lookup g (lineA l0) <;> cases hB : c.lookup g (lineB l0) <;> rw [hA, hB] at hEqL0 ⊢
        all_goals try rfl
        exact decide_eq_false (fun ⟨_, hne⟩ => hne (of_decide_eq_true hEqL0).2)
      else
        have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
        have hDisj := line_geom_facts.2.2.2.1 l0 l (fun e => hll e.symm)
        have hE : c.lookup g (lineA l) = .empty := by
          rcases of_decide_eq_true hAll with h1 | h2 | h3
          · exact absurd h1.symm hDisj.1
          · exact absurd h2.symm hDisj.2.2.1
          · exact h3
        unfold isSameSignDiffRoleLine; rw [hE]; rfl
    have hEqOth : ∀ l : Fin 12, l ≠ l0 → isSameSignEqRoleLine (c.lookup g) l = false := by
      intro l hne
      have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
      have hDisj := line_geom_facts.2.2.2.1 l0 l hne.symm
      have hE : c.lookup g (lineA l) = .empty := by
        rcases of_decide_eq_true hAll with h1 | h2 | h3
        · exact absurd h1.symm hDisj.1
        · exact absurd h2.symm hDisj.2.2.1
        · exact h3
      unfold isSameSignEqRoleLine; rw [hE]; rfl
    have hEval : ∀ (ls : List (Fin 12)), IsNodup ls →
        (composeLines (lineMeetUnit g) ls).op ψ c =
          if memBool l0 ls then NinthLoc6.mul NinthLoc6.omega (ψ c) else ψ c := by
      intro ls hnd
      induction hnd with
      | nil => rfl
      | @cons l rest hnot _ ih =>
        simp only [composeLines, FockUnitary.comp, memBool]
        rw [lineMeetUnit_op, hDiffFalse l, ite_bool_false]
        if hll : l = l0 then
          rw [ite_eq_left hll, hll, hEqL0, ite_bool_true, ite_bool_true, ih]
          have hNotMem : memBool l0 rest = false := by
            cases hm : memBool l0 rest with
            | false => rfl
            | true => rw [← hll] at hm; exact absurd ((memBool_eq_true_iff l rest).mp hm) hnot
          rw [hNotMem, ite_bool_false]
        else
          rw [ite_eq_right hll, hEqOth l hll, ite_bool_false, NinthLoc6.one_mul, ih]
    unfold siteMeetUnit
    rw [hEval (List.finRange 12) finRange12_nodup, (memBool_eq_true_iff l0 _).mpr (mem_finRange12 l0),
        ite_bool_true]

private theorem lineMeet_preserves_not_solePair (g : Mat5) (l : Fin 12) (c : HoneycombConfig)
    (hF : isSoleIdentPairDock (c.lookup g) = false) :
    isSoleIdentPairDock ((swapLineRolesConfig g l c).lookup g) = false := by
  unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]
  cases hSw : isSoleIdentPairDock (swapLineRolesDock l (c.lookup g)) with
  | false => rfl
  | true =>
    have hId : swapLineRolesDock l (c.lookup g) = c.lookup g := by
      unfold isSoleIdentPairDock at hSw
      cases hf : findSolePairLine (swapLineRolesDock l (c.lookup g)) with
      | none => rw [hf] at hSw; exact Bool.noConfusion hSw
      | some l0 =>
        have hl0 := (find?_eq_some_iff _ _ _ hf).2
        unfold swapLineRolesDock
        cases hA : c.lookup g (lineA l) with
        | empty => rfl
        | occ sA rA =>
          cases hB : c.lookup g (lineB l) with
          | empty => rfl
          | occ sB rB =>
            if hll : l = l0 then
              have hSame := ((Bool.and_eq_true _ _).mp hl0).1
              unfold isSameSignEqRoleLine swapLineRolesDock at hSame
              have hne := (line_geom_facts.1 l).2.2
              rw [← hll, hA, hB] at hSame
              simp only [ite_eq_left rfl, ite_eq_right hne.symm] at hSame
              have ⟨_, hrEq⟩ := of_decide_eq_true hSame
              funext s
              if hsA : s = lineA l then simp only [ite_eq_left hsA, hsA, hA, hrEq]
              else if hsB : s = lineB l then simp only [ite_eq_right hsA, ite_eq_left hsB, hsB, hB, hrEq]
              else simp only [ite_eq_right hsA, ite_eq_right hsB]
            else
              have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
              have hDisj := line_geom_facts.2.2.2.1 l0 l (fun e => hll e.symm)
              have hE : swapLineRolesDock l (c.lookup g) (lineA l) = .empty := by
                rcases of_decide_eq_true hAll with h1 | h2 | h3
                · exact absurd h1.symm hDisj.1
                · exact absurd h2.symm hDisj.2.2.1
                · exact h3
              unfold swapLineRolesDock at hE; rw [hA, hB, ite_eq_left rfl] at hE
              exact SlotState.noConfusion hE
    rw [hId, hF] at hSw
    exact Bool.noConfusion hSw

private theorem siteMPair_comm_siteMeet (g₁ g₂ : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (siteMPairUnit g₁).op ((siteMeetUnit g₂).op ψ) =
      (siteMeetUnit g₂).op ((siteMPairUnit g₁).op ψ) := by
  if hg : g₁ = g₂ then
    rw [hg]
    funext c
    cases hPair : isSoleIdentPairDock (c.lookup g₂) with
    | true =>
      rw [siteMeet_on_soleIdentPair g₂ ((siteMPairUnit g₂).op ψ) c hPair]
      rw [siteMPairUnit_op, siteMPairUnit_op, hPair, ite_bool_true,
          siteMeet_on_soleIdentPair g₂ ψ c hPair,
          NinthLoc6.mul_add, ← NinthLoc6.mul_assoc NinthLoc6.omega NinthLoc6.pairHop,
          NinthLoc6.mul_comm NinthLoc6.omega NinthLoc6.pairHop,
          NinthLoc6.mul_assoc NinthLoc6.pairHop NinthLoc6.omega, ← nloc_sumFin12_mul_left]
      apply congrArg (NinthLoc6.add _)
      apply congrArg (NinthLoc6.mul _)
      apply sumFin12_congr; intro m
      have hPairM : isSoleIdentPairDock ((moveSolePairConfig g₂ m c).lookup g₂) = true := by
        unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_left rfl]
        exact (moveSolePairDock_spec (c.lookup g₂) hPair).1 m
      exact (siteMeet_on_soleIdentPair g₂ ψ _ hPairM).symm
    | false =>
      have hLeft : (siteMPairUnit g₂).op ((siteMeetUnit g₂).op ψ) c = (siteMeetUnit g₂).op ψ c := by
        rw [siteMPairUnit_op, hPair, ite_bool_false]
      rw [hLeft]
      have hLine : ∀ (ls : List (Fin 12)) (c' : HoneycombConfig),
          isSoleIdentPairDock (c'.lookup g₂) = false →
          (composeLines (lineMeetUnit g₂) ls).op ψ c' =
            (composeLines (lineMeetUnit g₂) ls).op ((siteMPairUnit g₂).op ψ) c' := by
        intro ls
        induction ls with
        | nil =>
          intro c' hc'
          change ψ c' = (siteMPairUnit g₂).op ψ c'
          rw [siteMPairUnit_op, hc', ite_bool_false]
        | cons l rest ih =>
          intro c' hc'
          simp only [composeLines, FockUnitary.comp]
          rw [lineMeetUnit_op, lineMeetUnit_op]
          apply congrArg (NinthLoc6.mul _)
          cases isSameSignDiffRoleLine (c'.lookup g₂) l with
          | false => rw [ite_bool_false, ite_bool_false]; exact ih c' hc'
          | true =>
            rw [ite_bool_true, ite_bool_true, ih c' hc',
                ih (swapLineRolesConfig g₂ l c') (lineMeet_preserves_not_solePair g₂ l c' hc')]
      exact hLine (List.finRange 12) c hPair
  else
    have hLine : ∀ (l : Fin 12) (φ : FockVec NinthLoc6 HoneycombConfig),
        (siteMPairUnit g₁).op ((lineMeetUnit g₂ l).op φ) = (lineMeetUnit g₂ l).op ((siteMPairUnit g₁).op φ) := by
      intro l φ; funext c
      simp only [siteMPairUnit_op, lineMeetUnit_op]
      have hLkM : (swapLineRolesConfig g₂ l c).lookup g₁ = c.lookup g₁ := by
        unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_right hg]
      have hLkP : ∀ m, (moveSolePairConfig g₁ m c).lookup g₂ = c.lookup g₂ :=
        fun m => by unfold moveSolePairConfig; rw [lookup_setDock, ite_eq_right (fun e => hg e.symm)]
      have hSw : ∀ m, swapLineRolesConfig g₂ l (moveSolePairConfig g₁ m c) =
          moveSolePairConfig g₁ m (swapLineRolesConfig g₂ l c) := by
        intro m; unfold swapLineRolesConfig moveSolePairConfig
        rw [lookup_setDock, ite_eq_right (fun e => hg e.symm), lookup_setDock, ite_eq_right hg]
        exact (setDock_setDock_comm c g₁ g₂ _ _ hg).symm
      rw [hLkM]
      set pM := if isSameSignEqRoleLine (c.lookup g₂) l = true then NinthLoc6.omega else NinthLoc6.one
      cases isSoleIdentPairDock (c.lookup g₁) with
      | false =>
        simp only [ite_bool_false]
      | true =>
        simp only [ite_bool_true]
        cases hDiff : isSameSignDiffRoleLine (c.lookup g₂) l with
        | false =>
          simp only [ite_bool_false]
          rw [NinthLoc6.mul_add, ← NinthLoc6.mul_assoc pM NinthLoc6.pairHop,
              NinthLoc6.mul_comm pM NinthLoc6.pairHop, NinthLoc6.mul_assoc NinthLoc6.pairHop pM,
              ← nloc_sumFin12_mul_left]
          apply congrArg (NinthLoc6.add _)
          apply congrArg (NinthLoc6.mul NinthLoc6.pairHop)
          apply sumFin12_congr; intro m
          rw [hLkP m, hDiff, ite_bool_false]
        | true =>
          simp only [ite_bool_true]
          have hSum1 : sumFin12 (fun m =>
              NinthLoc6.mul (if isSameSignEqRoleLine ((moveSolePairConfig g₁ m c).lookup g₂) l = true then NinthLoc6.omega else NinthLoc6.one)
                (if isSameSignDiffRoleLine ((moveSolePairConfig g₁ m c).lookup g₂) l = true then
                  NinthLoc6.add (NinthLoc6.mul NinthLoc6.meetKeep (φ (moveSolePairConfig g₁ m c)))
                                (NinthLoc6.mul NinthLoc6.meetSwap (φ (swapLineRolesConfig g₂ l (moveSolePairConfig g₁ m c))))
                else φ (moveSolePairConfig g₁ m c))) =
            NinthLoc6.mul pM (NinthLoc6.add
              (NinthLoc6.mul NinthLoc6.meetKeep (sumFin12 (fun m => φ (moveSolePairConfig g₁ m c))))
              (NinthLoc6.mul NinthLoc6.meetSwap (sumFin12 (fun m => φ (moveSolePairConfig g₁ m (swapLineRolesConfig g₂ l c)))))) := by
            have hC : sumFin12 (fun m =>
                NinthLoc6.mul (if isSameSignEqRoleLine ((moveSolePairConfig g₁ m c).lookup g₂) l = true then NinthLoc6.omega else NinthLoc6.one)
                  (if isSameSignDiffRoleLine ((moveSolePairConfig g₁ m c).lookup g₂) l = true then
                    NinthLoc6.add (NinthLoc6.mul NinthLoc6.meetKeep (φ (moveSolePairConfig g₁ m c)))
                                  (NinthLoc6.mul NinthLoc6.meetSwap (φ (swapLineRolesConfig g₂ l (moveSolePairConfig g₁ m c))))
                  else φ (moveSolePairConfig g₁ m c))) =
              sumFin12 (fun m => NinthLoc6.mul pM (NinthLoc6.add
                (NinthLoc6.mul NinthLoc6.meetKeep (φ (moveSolePairConfig g₁ m c)))
                (NinthLoc6.mul NinthLoc6.meetSwap (φ (moveSolePairConfig g₁ m (swapLineRolesConfig g₂ l c)))))) := by
              apply sumFin12_congr; intro m
              rw [hLkP m, hDiff, ite_bool_true, hSw m]
            rw [hC, nloc_sumFin12_mul_left, nloc_sumFin12_add, nloc_sumFin12_mul_left, nloc_sumFin12_mul_left]
          rw [hSum1, ← NinthLoc6.mul_assoc NinthLoc6.pairHop pM, NinthLoc6.mul_comm NinthLoc6.pairHop pM,
              NinthLoc6.mul_assoc pM NinthLoc6.pairHop, ← NinthLoc6.mul_add pM]
          apply congrArg (NinthLoc6.mul pM)
          rw [nloc_mul_add_swap NinthLoc6.pairHop NinthLoc6.meetKeep NinthLoc6.meetSwap,
              NinthLoc6.mul_add NinthLoc6.meetKeep, NinthLoc6.mul_add NinthLoc6.meetSwap]
          exact nloc_swap4 _ _ _ _
    have hComp : ∀ (ls : List (Fin 12)) (φ : FockVec NinthLoc6 HoneycombConfig),
        (siteMPairUnit g₁).op ((composeLines (lineMeetUnit g₂) ls).op φ) =
          (composeLines (lineMeetUnit g₂) ls).op ((siteMPairUnit g₁).op φ) := by
      intro ls
      induction ls with
      | nil => intro _; rfl
      | cons l rest ih => intro φ; simp only [composeLines, FockUnitary.comp]; rw [hLine l, ih]
    exact hComp (List.finRange 12) ψ

/-- Headline Theorem 8 (Exact Global Scale-2 Commutation `[K, M_pair(ζ_18)] = 0`):
    on ALL quantum Fock states over infinite `{3,4,3,4}`, `K` and `M_pair(ζ_18)` act on mutually
    disjoint invariant subspaces and commute identically (`K ∘ M_pair = M_pair ∘ K`). -/
theorem thm_fock_scale2_K_MPair_comm (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockBounceK (fockMPair ψ) = fockMPair (fockBounceK ψ) := by
  apply globalOp_comm_of_site_comm bounceKFamily mpairFamily
  intro g₁ g₂ φ
  have hComp : ∀ (ls : List (Fin 12)) (χ : FockVec NinthLoc6 HoneycombConfig),
      (composeLines (lineBounceKUnit g₁) ls).op ((siteMPairUnit g₂).op χ) =
        (siteMPairUnit g₂).op ((composeLines (lineBounceKUnit g₁) ls).op χ) := by
    intro ls
    induction ls with
    | nil => intro _; rfl
    | cons l rest ih =>
      intro χ; simp only [composeLines, FockUnitary.comp]
      rw [ih, lineBounceK_comm_siteMPair g₁ g₂ l]
  exact hComp (List.finRange 12) φ

/-- Headline Theorem 9 (Exact Global Scale-2 Commutation `[K, M_meet] = 0`):
    on ALL quantum Fock states over infinite `{3,4,3,4}`, `K` (opposite-sign lines) and `M_meet`
    (same-sign lines) commute identically (`K ∘ M_meet = M_meet ∘ K`). -/
theorem thm_fock_scale2_K_MMeet_comm (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockBounceK (fockMeet ψ) = fockMeet (fockBounceK ψ) := by
  apply globalOp_comm_of_site_comm bounceKFamily meetFamily
  intro g₁ g₂ φ
  apply composeLines_comm (lineBounceKUnit g₁) (lineMeetUnit g₂)
  intro l₁ l₂ χ
  if hg : g₁ = g₂ then
    rw [hg]; exact lineBounceK_comm_lineMeet_same_site g₂ l₁ l₂ χ
  else
    funext c
    simp only [lineBounceKUnit_op, lineMeetUnit_op]
    have hLkK : (lineBounceKPerm g₁ l₁ c).lookup g₂ = c.lookup g₂ := by
      unfold lineBounceKPerm; cases isOppSignLine (c.lookup g₁) l₁ with
      | false => rfl
      | true => unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_right (fun e => hg e.symm)]
    have hLkM : (swapLineRolesConfig g₂ l₂ c).lookup g₁ = c.lookup g₁ := by
      unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_right hg]
    have hSw : swapLineRolesConfig g₂ l₂ (lineBounceKPerm g₁ l₁ c) =
        lineBounceKPerm g₁ l₁ (swapLineRolesConfig g₂ l₂ c) := by
      unfold lineBounceKPerm; rw [hLkM]
      cases isOppSignLine (c.lookup g₁) l₁ with
      | false => rfl
      | true =>
        unfold swapLineRolesConfig swapLineSlotsConfig
        rw [lookup_setDock, ite_eq_right (fun e => hg e.symm), lookup_setDock, ite_eq_right hg]
        exact (setDock_setDock_comm c g₁ g₂ _ _ hg).symm
    rw [hLkK, hLkM, hSw]
    set pK := if isOppSignLine (c.lookup g₁) l₁ = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one
    set pM := if isSameSignEqRoleLine (c.lookup g₂) l₂ = true then NinthLoc6.omega else NinthLoc6.one
    cases isSameSignDiffRoleLine (c.lookup g₂) l₂
    · simp only [ite_bool_false]
      rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm pK pM, NinthLoc6.mul_assoc]
    · simp only [ite_bool_true]
      exact nloc_phase_block2_comm pK pM NinthLoc6.meetKeep NinthLoc6.meetSwap _ _

/-- Headline Theorem 10 (Exact Global Scale-2 Commutation `[M_pair(ζ_18), M_meet] = 0`):
    on ALL quantum Fock states over infinite `{3,4,3,4}`, `M_meet` acts as the uniform line-independent
    scalar `ω` on the sole-identical-pair subspace and leaves its complement invariant, hence
    `M_pair(ζ_18) ∘ M_meet = M_meet ∘ M_pair(ζ_18)` identically. -/
theorem thm_fock_scale2_MPair_MMeet_comm (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockMPair (fockMeet ψ) = fockMeet (fockMPair ψ) :=
  globalOp_comm_of_site_comm mpairFamily meetFamily siteMPair_comm_siteMeet ψ

/-- Composite Scale-2 middle core `M = M_meet ∘ M_pair(ζ_18) ∘ K`. -/
def fockScale2CoreUnit : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp fockMeetUnit (FockUnitary.comp fockMPairUnit fockBounceKUnit)

abbrev fockScale2Core := fockScale2CoreUnit.op
abbrev fockScale2CoreDag := fockScale2CoreUnit.dag

private theorem fockBounceK_self_adj (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockBounceKUnit.dag ψ = fockBounceKUnit.op ψ := by
  have hSite : ∀ g φ, (siteBounceKUnit g).dag φ = (siteBounceKUnit g).op φ := by
    intro g
    have hAux : ∀ ls χ, (composeLines (lineBounceKUnit g) ls).dag χ = (composeLines (lineBounceKUnit g) ls).op χ := by
      intro ls
      induction ls with
      | nil => intro _; rfl
      | cons l rest ih =>
        intro χ; simp only [composeLines, FockUnitary.comp]
        rw [ih, lineBounceK_self_adj]
        have hMove : ∀ (rs : List (Fin 12)) (φ : FockVec NinthLoc6 HoneycombConfig),
            (composeLines (lineBounceKUnit g) rs).op ((lineBounceKUnit g l).op φ) =
              (lineBounceKUnit g l).op ((composeLines (lineBounceKUnit g) rs).op φ) := by
          intro rs
          induction rs with
          | nil => intro _; rfl
          | cons r rr ihr =>
            intro φ; simp only [composeLines, FockUnitary.comp]; rw [ihr, lineBounceK_comm_same_site g r l]
        exact hMove rest χ
    exact hAux (List.finRange 12)
  funext c
  change applySitesDag bounceKFamily c.activeDocks ψ c = applySites bounceKFamily c.activeDocks ψ c
  have hEq : ∀ gs φ, IsNodup gs → applySitesDag bounceKFamily gs φ = applySites bounceKFamily gs φ := by
    intro gs φ hnd
    induction hnd generalizing φ with
    | nil => rfl
    | @cons g rest hnot _ ih =>
      simp only [applySitesDag, applySites]
      rw [ih, hSite g]
      have hPush : ∀ (rs : List Mat5) (χ : FockVec NinthLoc6 HoneycombConfig),
          (∀ r, r ∈ rs → r ≠ g) →
          applySites bounceKFamily rs ((bounceKFamily.unit g).op χ) =
            (bounceKFamily.unit g).op (applySites bounceKFamily rs χ) := by
        intro rs
        induction rs with
        | nil => intro _ _; rfl
        | cons r rr ihr =>
          intro χ hne; simp only [applySites]
          rw [ihr χ (fun x hx => hne x (List.Mem.tail r hx)),
              bounceKFamily.comm_sites r g _ (hne r (List.Mem.head rr))]
      exact hPush rest φ (fun r hr heq => by rw [heq] at hr; exact hnot hr)
  rw [hEq c.activeDocks ψ (activeDocks_nodup c)]

/-- Headline Theorem 11 (Scale-2 Core Unitarity & Adjoint Reversal Order-Independence):
    `fockScale2Core = M_meet ∘ M_pair(ζ_18) ∘ K` is an exact `FockUnitary`, `K† = K`, and because
    `K`, `M_pair`, `M_meet` mutually commute, its adjoint equals BOTH `K ∘ M_pair† ∘ M_meet†`
    AND `M_meet† ∘ M_pair† ∘ K`. -/
theorem thm_fock_scale2_core_unitary_and_comm (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockScale2CoreDag (fockScale2Core ψ) = ψ ∧
    fockScale2Core (fockScale2CoreDag ψ) = ψ ∧
    fockBounceKUnit.dag ψ = fockBounceK ψ ∧
    fockScale2CoreDag ψ = fockMeetDag (fockMPairDag (fockBounceK ψ)) := by
  have hCD1 := fockUnitary_comm_dag thm_fock_scale2_K_MPair_comm
  have hCD2 := fockUnitary_comm_dag thm_fock_scale2_K_MMeet_comm
  have hCD3 := fockUnitary_comm_dag thm_fock_scale2_MPair_MMeet_comm
  refine ⟨fockScale2CoreUnit.leftInv ψ, fockScale2CoreUnit.rightInv ψ, fockBounceK_self_adj ψ, ?_⟩
  change fockBounceKUnit.dag (fockMPairDag (fockMeetDag ψ)) = fockMeetDag (fockMPairDag (fockBounceK ψ))
  rw [hCD1, hCD2, hCD3, fockBounceK_self_adj]


/-! ## Section 6: Full Palindromic 8-Layer Composite Beat `U`, Vacuum `|V_1⟩`, Charge `Q`, & Light-Cone -/

/-- Full palindromic 8-layer composite beat `U = S ∘ Φ_odd ∘ D ∘ (M_meet ∘ M_pair(ζ_18) ∘ K) ∘ D ∘ Φ_odd`
    (exact match with `test/universe.ts` and `CoxeterTransport.thm_palindromic_beat_T_CP_CPT`). -/
def fockBeatUnit (χ : ChiralInvariant) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp fockStreamUnit
    (FockUnitary.comp (fockPhiOddUnit χ)
      (FockUnitary.comp fockHalfCoinUnit
        (FockUnitary.comp fockScale2CoreUnit
          (FockUnitary.comp fockHalfCoinUnit (fockPhiOddUnit χ)))))

abbrev fockBeat (χ : ChiralInvariant) := (fockBeatUnit χ).op
abbrev fockBeatDag (χ : ChiralInvariant) := (fockBeatUnit χ).dag

/-- Symmetric doubled 8-layer composite beat `U_sym = S ∘ D ∘ M_meet ∘ M_pair ∘ K ∘ M_pair ∘ M_meet ∘ D`
    and its `Φ_odd`-dressed variant `U_sym_odd`. -/
def fockSymBeatUnit : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp fockStreamUnit
    (FockUnitary.comp fockHalfCoinUnit
      (FockUnitary.comp fockMeetUnit
        (FockUnitary.comp fockMPairUnit
          (FockUnitary.comp fockBounceKUnit
            (FockUnitary.comp fockMPairUnit
              (FockUnitary.comp fockMeetUnit fockHalfCoinUnit))))))

def fockSymOddBeatUnit (χ : ChiralInvariant) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp fockStreamUnit
    (FockUnitary.comp (fockPhiOddUnit χ)
      (FockUnitary.comp fockHalfCoinUnit
        (FockUnitary.comp fockMeetUnit
          (FockUnitary.comp fockMPairUnit
            (FockUnitary.comp fockBounceKUnit
              (FockUnitary.comp fockMPairUnit
                (FockUnitary.comp fockMeetUnit
                  (FockUnitary.comp fockHalfCoinUnit (fockPhiOddUnit χ)))))))))

/-- Headline Theorem 12 (Full Palindromic 8-Layer Composite Beat `U` Exact Unitarity & Reversibility `∀ t : Nat`):
    for EVERY `ChiralInvariant χ`, EVERY finite-support quantum Fock states `ψ, φ` on infinite `{3,4,3,4}`,
    and EVERY `t : Nat`, `U^t` is exactly reversible (`(U†)^t U^t = U^t (U†)^t = id`), preserves finite support,
    and preserves exact `ℤ[ζ_9][1/6]` Hermitian inner products and squared norms. -/
theorem thm_fock_beat_unitary_all_time (χ : ChiralInvariant) :
    ∀ t : Nat,
      (∀ ψ, iter (fockBeatDag χ) t (iter (fockBeat χ) t ψ) = ψ) ∧
      (∀ ψ, iter (fockBeat χ) t (iter (fockBeatDag χ) t ψ) = ψ) ∧
      (∀ ψ s, SuppIn s ψ → ∃ s', SuppIn s' (iter (fockBeat χ) t ψ)) ∧
      (∀ ψ φ s s',
        SuppIn s ψ → SuppIn s φ → SuppIn s' (iter (fockBeat χ) t ψ) → SuppIn s' (iter (fockBeat χ) t φ) →
        innerOn s' (iter (fockBeat χ) t ψ) (iter (fockBeat χ) t φ) = innerOn s ψ φ ∧
        normSqOn s' (iter (fockBeat χ) t ψ) = normSqOn s ψ) :=
  thm_fock_unitary_iter_all_time (fockBeatUnit χ)

/-- Headline Theorem 13 (Symmetric Doubled 8-Layer Beat `U_sym` & `Φ_odd`-Dressed Variant Unitarity `∀ t : Nat`):
    exact reversibility, finite-support propagation, and inner-product/norm preservation for both
    `S ∘ D ∘ M_meet ∘ M_pair ∘ K ∘ M_pair ∘ M_meet ∘ D` and its `Φ_odd`-dressed variant. -/
theorem thm_fock_sym_beat_unitary_all_time (χ : ChiralInvariant) (t : Nat) :
    (∀ ψ, iter fockSymBeatUnit.dag t (iter fockSymBeatUnit.op t ψ) = ψ) ∧
    (∀ ψ φ s s',
      SuppIn s ψ → SuppIn s φ → SuppIn s' (iter fockSymBeatUnit.op t ψ) → SuppIn s' (iter fockSymBeatUnit.op t φ) →
      normSqOn s' (iter fockSymBeatUnit.op t ψ) = normSqOn s ψ) ∧
    (∀ ψ, iter (fockSymOddBeatUnit χ).dag t (iter (fockSymOddBeatUnit χ).op t ψ) = ψ) ∧
    (∀ ψ φ s s',
      SuppIn s ψ → SuppIn s φ → SuppIn s' (iter (fockSymOddBeatUnit χ).op t ψ) → SuppIn s' (iter (fockSymOddBeatUnit χ).op t φ) →
      normSqOn s' (iter (fockSymOddBeatUnit χ).op t ψ) = normSqOn s ψ) := by
  have h1 := thm_fock_unitary_iter_all_time fockSymBeatUnit t
  have h2 := thm_fock_unitary_iter_all_time (fockSymOddBeatUnit χ) t
  exact ⟨h1.1, fun ψ φ s s' a b c d => (h1.2.2.2 ψ φ s s' a b c d).2,
         h2.1, fun ψ φ s s' a b c d => (h2.2.2.2 ψ φ s s' a b c d).2⟩

private theorem globalOp_fixes_v1Ket (F : LocalSiteFamily) :
    globalOp F (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
  funext c
  unfold globalOp
  if hc : c = v1Config then
    rw [hc]; rfl
  else
    have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks →
        ket (R := NinthLoc6) v1Config c' = zeroVec c' := by
      intro c' hc'
      have hne' : c' ≠ v1Config := by
        intro h0; rw [h0] at hc'
        have hC0 : c = v1Config := by
          apply honeycombConfig_ext; intro g
          if h : c.lookup g = v1FullDock then exact h
          else
            have hm : g ∈ c.activeDocks := (mem_activeDocks_iff c g).mpr h
            rw [← hc'] at hm; cases hm
        exact hc hC0
      unfold ket zeroVec; rw [ite_eq_right hne']
    rw [applySites_local_eq F c.activeDocks _ zeroVec c hVan, applySites_zero]
    unfold ket zeroVec; rw [ite_eq_right hc]

/-- Headline Theorem 14 (True Quantum Fock-Space Vacuum `|V_1⟩` Eternal Stationarity `∀ t : Nat`):
    for EVERY `ChiralInvariant χ` and ALL `t : Nat`, `U |V_1⟩ = |V_1⟩`, `U^t |V_1⟩ = |V_1⟩`,
    and `‖U^t |V_1⟩‖² = 1` identically in `ℤ[ζ_9][1/6]`. -/
theorem thm_fock_v1_quantum_stationarity (χ : ChiralInvariant) :
    fockBeat χ (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config ∧
    ∀ t : Nat,
      iter (fockBeat χ) t (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config ∧
      normSqOn [v1Config] (iter (fockBeat χ) t (ket (R := NinthLoc6) v1Config)) = NinthLoc6.one := by
  have hS : fockStream (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
    funext c
    rw [fockStream_eval, ket_nloc, ket_nloc]
    if hc : c = v1Config then
      have hInvV1 : streamConfigInv v1Config = v1Config := by
        have h := (thm_fock_honeycomb_config_symmetries v1Config).1
        rw [(thm_fock_honeycomb_config_symmetries v1Config).2.2.2.2.2.2.2.2.2.1] at h
        exact h
      rw [hc, hInvV1, ite_eq_left rfl]
    else
      have hne : streamConfigInv c ≠ v1Config := by
        intro h0
        have := congrArg streamConfig h0
        rw [(thm_fock_honeycomb_config_symmetries c).2.1,
            (thm_fock_honeycomb_config_symmetries v1Config).2.2.2.2.2.2.2.2.2.1] at this
        exact hc this
      rw [ite_eq_right hne, ite_eq_right hc]
  have hOne : fockBeat χ (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
    change fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin (fockPhiOdd χ (ket v1Config)))))))) = _
    rw [globalOp_fixes_v1Ket, globalOp_fixes_v1Ket, globalOp_fixes_v1Ket, globalOp_fixes_v1Ket,
        globalOp_fixes_v1Ket, globalOp_fixes_v1Ket, globalOp_fixes_v1Ket, hS]
  have hIter : ∀ t : Nat, iter (fockBeat χ) t (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
    intro t
    induction t with
    | zero => rfl
    | succ k ih => simp only [iter]; rw [ih, hOne]
  refine ⟨hOne, fun t => ⟨hIter t, ?_⟩⟩
  rw [hIter t]
  unfold normSqOn innerOn sumList
  rw [ket_nloc, ite_eq_left rfl]
  change NinthLoc6.add (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.one) NinthLoc6.one) NinthLoc6.zero = NinthLoc6.one
  rw [NinthLoc6.conj_one, NinthLoc6.one_mul, NinthLoc6.add_zero]

/-- Exact total charge eigenspace `Q = q`: `ψ` has zero amplitude on every configuration with `totalCharge c ≠ q`. -/
def InChargeSector (q : Int) (ψ : FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ c : HoneycombConfig, totalCharge c ≠ q → ψ c = NinthLoc6.zero

private theorem globalOp_preserves_charge (F : LocalSiteFamily)
    (hSite : ∀ g q ψ, InChargeSector q ψ → InChargeSector q ((F.unit g).op ψ))
    (q : Int) (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : InChargeSector q ψ) :
    InChargeSector q (globalOp F ψ) := by
  have hList : ∀ gs φ, InChargeSector q φ → InChargeSector q (applySites F gs φ) := by
    intro gs
    induction gs with
    | nil => intro _ h; exact h
    | cons g rest ih => intro φ h; simp only [applySites]; exact hSite g q _ (ih φ h)
  intro c hc
  exact hList c.activeDocks ψ hψ c hc

/-- Headline Theorem 15 (Exact Quantum Charge `Q` Conservation `∀ q : Int, ∀ t : Nat`):
    every individual layer (`Φ_odd`, `D`, `K`, `M_pair`, `M_meet`, `S`) and every iterated power
    `U^t` strictly preserves every total-charge eigenspace `InChargeSector q`. -/
theorem thm_fock_charge_conservation_all_time (χ : ChiralInvariant) (q : Int)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : InChargeSector q ψ) :
    ∀ t : Nat, InChargeSector q (iter (fockBeat χ) t ψ) := by
  have hPhi : ∀ φ, InChargeSector q φ → InChargeSector q (fockPhiOdd χ φ) := by
    apply globalOp_preserves_charge
    intro g q' φ hφ c hc
    change (sitePhiOddUnit χ g).op φ c = NinthLoc6.zero
    rw [sitePhiOddUnit_op, hφ c hc, NinthLoc6.mul_zero]
  have hK : ∀ φ, InChargeSector q φ → InChargeSector q (fockBounceK φ) := by
    apply globalOp_preserves_charge
    intro g q' φ hφ
    have hLs : ∀ ls χ', InChargeSector q' χ' → InChargeSector q' ((composeLines (lineBounceKUnit g) ls).op χ') := by
      intro ls
      induction ls with
      | nil => intro _ h; exact h
      | cons l rest ih =>
        intro χ' h c hc
        simp only [composeLines, FockUnitary.comp]
        rw [lineBounceKUnit_op]
        have hQ : totalCharge (lineBounceKPerm g l c) = totalCharge c := by
          unfold lineBounceKPerm
          cases isOppSignLine (c.lookup g) l with
          | false => rfl
          | true => exact totalCharge_setDock c g _ (fullDockCharge_swapLineSlots l (c.lookup g))
        rw [ih χ' h (lineBounceKPerm g l c) (by rw [hQ]; exact hc), NinthLoc6.mul_zero]
    exact hLs (List.finRange 12) φ hφ
  have hD : ∀ φ, InChargeSector q φ → InChargeSector q (fockHalfCoin φ) := by
    apply globalOp_preserves_charge
    intro g q' φ hφ
    have hLs : ∀ ls χ', InChargeSector q' χ' → InChargeSector q' ((composeLines (lineHalfCoinUnit g) ls).op χ') := by
      intro ls
      induction ls with
      | nil => intro _ h; exact h
      | cons l rest ih =>
        intro χ' h c hc
        simp only [composeLines, FockUnitary.comp]
        rw [lineHalfCoinUnit_op]
        have hQ : totalCharge (swapLineSlotsConfig g l c) = totalCharge c :=
          totalCharge_setDock c g _ (fullDockCharge_swapLineSlots l (c.lookup g))
        cases isLoneLine (c.lookup g) l with
        | false => rw [ite_bool_false, ih χ' h c hc, NinthLoc6.mul_zero]
        | true =>
          rw [ite_bool_true, ih χ' h c hc, ih χ' h _ (by rw [hQ]; exact hc),
              NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]
    exact hLs (List.finRange 12) φ hφ
  have hM : ∀ φ, InChargeSector q φ → InChargeSector q (fockMeet φ) := by
    apply globalOp_preserves_charge
    intro g q' φ hφ
    have hLs : ∀ ls χ', InChargeSector q' χ' → InChargeSector q' ((composeLines (lineMeetUnit g) ls).op χ') := by
      intro ls
      induction ls with
      | nil => intro _ h; exact h
      | cons l rest ih =>
        intro χ' h c hc
        simp only [composeLines, FockUnitary.comp]
        rw [lineMeetUnit_op]
        have hQ : totalCharge (swapLineRolesConfig g l c) = totalCharge c :=
          totalCharge_setDock c g _ (fullDockCharge_swapLineRoles l (c.lookup g))
        cases isSameSignDiffRoleLine (c.lookup g) l with
        | false => rw [ite_bool_false, ih χ' h c hc, NinthLoc6.mul_zero]
        | true =>
          rw [ite_bool_true, ih χ' h c hc, ih χ' h _ (by rw [hQ]; exact hc),
              NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]
    exact hLs (List.finRange 12) φ hφ
  have hP : ∀ φ, InChargeSector q φ → InChargeSector q (fockMPair φ) := by
    apply globalOp_preserves_charge
    intro g q' φ hφ c hc
    change (siteMPairUnit g).op φ c = NinthLoc6.zero
    rw [siteMPairUnit_op]
    cases ha : isSoleIdentPairDock (c.lookup g) with
    | false => rw [ite_bool_false]; exact hφ c hc
    | true =>
      rw [ite_bool_true, hφ c hc, NinthLoc6.zero_add]
      have hS0 : sumFin12 (fun m => φ (moveSolePairConfig g m c)) = NinthLoc6.zero := by
        apply sumList_zero_of_all_zero; intro m _
        have hQ : totalCharge (moveSolePairConfig g m c) = totalCharge c :=
          totalCharge_setDock c g _ ((moveSolePairDock_spec (c.lookup g) ha).2.2.2.2.2 m)
        exact hφ _ (by rw [hQ]; exact hc)
      rw [hS0, NinthLoc6.mul_zero]
  have hS : ∀ φ, InChargeSector q φ → InChargeSector q (fockStream φ) := by
    intro φ hφ c hc
    rw [fockStream_eval]
    have hQ : totalCharge (streamConfigInv c) = totalCharge c := by
      have h := (thm_fock_honeycomb_config_symmetries (streamConfigInv c)).2.2.2.2.2.2.2.2.2.2.2
      rw [(thm_fock_honeycomb_config_symmetries c).2.1] at h
      exact h.symm
    exact hφ (streamConfigInv c) (by rw [hQ]; exact hc)
  have hStep : ∀ φ, InChargeSector q φ → InChargeSector q (fockBeat χ φ) := by
    intro φ hφ
    change InChargeSector q (fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin (fockPhiOdd χ φ))))))))
    exact hS _ (hPhi _ (hD _ (hM _ (hP _ (hK _ (hD _ (hPhi _ hφ)))))))
  intro t
  induction t with
  | zero => exact hψ
  | succ k ih => simp only [iter]; exact hStep _ ih

/-- Exact `{3,4,3,4}` Coxeter graph ball `B_r` of radius `r` around the base cell `mat5Id`. -/
inductive InBall : Nat → Mat5 → Prop where
  | base : InBall 0 mat5Id
  | mono {r : Nat} {g : Mat5} : InBall r g → InBall (r + 1) g
  | step {r : Nat} {g : Mat5} (a : Fin 24) : InBall r g → InBall (r + 1) (mat5Mul g (transport a))

/-- Every occupied cell of configuration `c` lies inside the `{3,4,3,4}` ball `B_R`. -/
def ConfigInBall (R : Nat) (c : HoneycombConfig) : Prop :=
  ∀ g : Mat5, g ∈ c.activeDocks → InBall R g

/-- Quantum Fock-space causal support predicate: `ψ` has strictly zero amplitude on every configuration
    containing ANY excitation outside the `{3,4,3,4}` ball `B_R`. -/
def QuantumInBall (R : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ c : HoneycombConfig, ¬ ConfigInBall R c → ψ c = NinthLoc6.zero

private theorem globalOp_preserves_ball (F : LocalSiteFamily) (R : Nat)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : QuantumInBall R ψ) :
    QuantumInBall R (globalOp F ψ) := by
  intro c hc
  unfold globalOp
  have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' := by
    intro c' hc'
    apply hψ c'
    intro hIn
    apply hc
    intro g hg
    rw [← hc'] at hg
    exact hIn g hg
  rw [applySites_local_eq F c.activeDocks ψ zeroVec c hVan, applySites_zero]

/-- Headline Theorem 16 (True Quantum 1-Hop Lieb-Robinson Light-Cone Theorem `∀ t : Nat`):
    for EVERY `ChiralInvariant χ`, EVERY initial radius `R₀ : Nat`, and EVERY quantum Fock state `ψ`
    supported inside `B_{R₀}` on infinite `{3,4,3,4}`:
    - every on-site layer preserves `QuantumInBall R`,
    - the exact Coxeter stream `S` expands support by at most 1 hop (`QuantumInBall R → QuantumInBall (R + 1)`),
    - `iter (fockBeat χ) t ψ` has STRICTLY ZERO quantum amplitude outside `B_{R₀ + t}` for ALL `t : Nat`. -/
theorem thm_fock_lieb_robinson_light_cone (χ : ChiralInvariant) (R₀ : Nat)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (h0 : QuantumInBall R₀ ψ) :
    ∀ t : Nat, QuantumInBall (R₀ + t) (iter (fockBeat χ) t ψ) := by
  have hStream : ∀ (R : Nat) (φ : FockVec NinthLoc6 HoneycombConfig),
      QuantumInBall R φ → QuantumInBall (R + 1) (fockStream φ) := by
    intro R φ hφ c hc
    rw [fockStream_eval]
    apply hφ (streamConfigInv c)
    intro hIn
    apply hc
    intro g hg
    have hne : c.lookup g ≠ v1FullDock := (mem_activeDocks_iff c g).mp hg
    obtain ⟨a, ha⟩ := exists_nonempty_of_ne_v1 (c.lookup g) hne
    let gSrc := mat5Mul g (transport (oppSlot a))
    have hSrcOcc : (streamConfigInv c).lookup gSrc a ≠ .empty := by
      rw [lookup_streamConfigInv, fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
      exact ha
    have hSrcNe : (streamConfigInv c).lookup gSrc ≠ v1FullDock := fun h => hSrcOcc (congrFun h a)
    have hSrcIn : InBall R gSrc := hIn gSrc ((mem_activeDocks_iff _ _).mpr hSrcNe)
    have hStep : InBall (R + 1) (mat5Mul gSrc (transport a)) := InBall.step a hSrcIn
    have hBack : mat5Mul gSrc (transport a) = g := by
      rw [fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
    rw [hBack] at hStep
    exact hStep
  intro t
  induction t with
  | zero => exact h0
  | succ k ih =>
    simp only [iter]
    change QuantumInBall (R₀ + k + 1)
      (fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin (fockPhiOdd χ (iter (fockBeat χ) k ψ)))))))))
    exact hStream (R₀ + k) _
      (globalOp_preserves_ball _ _ _
        (globalOp_preserves_ball _ _ _
          (globalOp_preserves_ball _ _ _
            (globalOp_preserves_ball _ _ _
              (globalOp_preserves_ball _ _ _
                (globalOp_preserves_ball _ _ _
                  (globalOp_preserves_ball _ _ _ ih)))))))


/-! ## Section 7: Concrete Fock Instantiation of `CoxeterTransport.thm_palindromic_beat_T_CP_CPT` & Chiral Witness -/

/-- Exact quantum Fock discrete symmetries on infinite `{3,4,3,4}`:
    `fockRev` (`R`), `fockTau` (`τ = K_conj ∘ R`), `fockChargeConj` (`C`), `fockParity` (`P`),
    `fockCP` (`C ∘ P`), `fockT` (`T = S ∘ τ`), `fockCPT` (`CP ∘ T`). -/
def fockRev (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => ψ (revConfig c)

def fockTau (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => NinthLoc6.conj (ψ (revConfig c))

def fockChargeConj (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => ψ (conjConfig c)

def fockParity (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => ψ (parityConfig c)

def fockCP (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => ψ (cpConfig c)

def fockT (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fockStream (fockTau ψ)

def fockCPT (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fockCP (fockT ψ)

private theorem fockTau_involutive (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockTau (fockTau ψ) = ψ := by
  funext c; unfold fockTau
  rw [(thm_fock_honeycomb_config_symmetries c).2.2.1, NinthLoc6.conj_conj]

private theorem fockCP_involutive (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockCP (fockCP ψ) = ψ := by
  funext c; unfold fockCP
  rw [(thm_fock_honeycomb_config_symmetries c).2.2.2.2.2.2.1]

private theorem revFullDock_swapLineSlots (l : Fin 12) (d : FullDock) :
    revFullDock (swapLineSlotsDock l d) = swapLineSlotsDock l (revFullDock d) := by
  have ⟨hAB, hBA, hne⟩ := line_geom_facts.1 l
  funext s; unfold revFullDock swapLineSlotsDock
  if hsA : s = lineA l then
    simp only [ite_eq_left hsA, hsA, hAB, ite_eq_right hne.symm, ite_eq_left rfl, hBA]
  else if hsB : s = lineB l then
    simp only [ite_eq_right hsA, ite_eq_left hsB, hsB, hBA, ite_eq_left rfl, hAB]
  else
    have hO1 : oppSlot s ≠ lineA l := fun e => hsB (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hAB])
    have hO2 : oppSlot s ≠ lineB l := fun e => hsA (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hBA])
    simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hO1, ite_eq_right hO2]

private theorem revFullDock_swapLineRoles (l : Fin 12) (d : FullDock) :
    revFullDock (swapLineRolesDock l d) = swapLineRolesDock l (revFullDock d) := by
  have ⟨hAB, hBA, hne⟩ := line_geom_facts.1 l
  funext s; unfold revFullDock swapLineRolesDock
  rw [hAB, hBA]
  cases hA : d (lineA l) with
  | empty => cases d (lineB l) <;> rfl
  | occ sA rA =>
    cases hB : d (lineB l) with
    | empty => rfl
    | occ sB rB =>
      if hsA : s = lineA l then
        simp only [ite_eq_left hsA, hsA, hAB, ite_eq_right hne.symm, ite_eq_left rfl]
      else if hsB : s = lineB l then
        simp only [ite_eq_right hsA, ite_eq_left hsB, hsB, hBA, ite_eq_left rfl]
      else
        have hO1 : oppSlot s ≠ lineA l := fun e => hsB (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hAB])
        have hO2 : oppSlot s ≠ lineB l := fun e => hsA (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hBA])
        simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hO1, ite_eq_right hO2]

private theorem revConfig_setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock) :
    revConfig (c.setDock g d) = (revConfig c).setDock g (revFullDock d) := by
  apply honeycombConfig_ext; intro h
  rw [lookup_revConfig, lookup_setDock, lookup_setDock]
  if hhg : h = g then simp only [ite_eq_left hhg] else simp only [ite_eq_right hhg, lookup_revConfig]

private theorem cpConfig_setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock) :
    cpConfig (c.setDock g d) = (cpConfig c).setDock (conjMatP g) (cpFullDock d) := by
  apply honeycombConfig_ext; intro h
  rw [lookup_cpConfig, lookup_setDock, lookup_setDock]
  if hhg : h = conjMatP g then
    simp only [ite_eq_left hhg, hhg, conjMatP_involutive, ite_eq_left rfl]
  else
    have hne : conjMatP h ≠ g := fun e => hhg (by rw [← e, conjMatP_involutive])
    simp only [ite_eq_right hhg, ite_eq_right hne, lookup_cpConfig]

private theorem globalOp_tau_of_site_tau (F : LocalSiteFamily)
    (hSite : ∀ g ψ, fockTau ((F.unit g).op (fockTau ψ)) = (F.unit g).dag ψ) :
    ∀ ψ, fockTau (globalOp F (fockTau ψ)) = globalDag F ψ := by
  have hPushNd : ∀ (gs : List Mat5), IsNodup gs → ∀ (ψ : FockVec NinthLoc6 HoneycombConfig),
      fockTau (applySites F gs (fockTau ψ)) = applySitesDag F gs ψ := by
    intro gs hnd
    induction hnd with
    | nil => intro ψ; exact fockTau_involutive ψ
    | @cons g rest hnot _ ih =>
      intro ψ
      simp only [applySites, applySitesDag]
      have h1 : fockTau ((F.unit g).op (applySites F rest (fockTau ψ))) =
          (F.unit g).dag (fockTau (applySites F rest (fockTau ψ))) := by
        have := hSite g (fockTau (applySites F rest (fockTau ψ)))
        rw [fockTau_involutive] at this
        exact this
      rw [h1, ih ψ]
      have hCommRest : ∀ (rs : List Mat5) (φ : FockVec NinthLoc6 HoneycombConfig),
          (∀ r, r ∈ rs → r ≠ g) →
          (F.unit g).dag (applySitesDag F rs φ) = applySitesDag F rs ((F.unit g).dag φ) := by
        intro rs
        induction rs with
        | nil => intro _ _; rfl
        | cons r rr ihr =>
          intro φ hne; simp only [applySitesDag]
          rw [ihr _ (fun x hx => hne x (List.Mem.tail r hx)),
              F.comm_dag_sites g r φ (fun e => hne r (List.Mem.head rr) e.symm)]
      exact hCommRest rest ψ (fun r hr heq => by rw [heq] at hr; exact hnot hr)
  intro ψ; funext c
  change NinthLoc6.conj (applySites F (revConfig c).activeDocks (fockTau ψ) (revConfig c)) =
    applySitesDag F c.activeDocks ψ c
  rw [activeDocks_revConfig]
  exact congrFun (hPushNd c.activeDocks (activeDocks_nodup c) ψ) c

private theorem globalOp_cp_of_site_cp (F : LocalSiteFamily)
    (hSite : ∀ g ψ, fockCP ((F.unit g).op ψ) = (F.unit (conjMatP g)).op (fockCP ψ)) :
    ∀ ψ, fockCP (globalOp F ψ) = globalOp F (fockCP ψ) := by
  have hMap : ∀ (gs : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      fockCP (applySites F gs ψ) = applySites F (gs.map conjMatP) (fockCP ψ) := by
    intro gs
    induction gs with
    | nil => intro _; rfl
    | cons g rest ih =>
      intro ψ; simp only [List.map, applySites]; rw [hSite g, ih]
  intro ψ; funext c
  change applySites F (cpConfig c).activeDocks ψ (cpConfig c) =
    applySites F c.activeDocks (fockCP ψ) c
  have hLeft : applySites F (cpConfig c).activeDocks ψ (cpConfig c) =
      applySites F ((cpConfig c).activeDocks.map conjMatP) (fockCP ψ) c :=
    congrFun (hMap (cpConfig c).activeDocks ψ) c
  rw [hLeft]
  have hMapNd : IsNodup ((cpConfig c).activeDocks.map conjMatP) :=
    isNodup_map_inj conjMatP (fun x y h => by have := congrArg conjMatP h; rw [conjMatP_involutive, conjMatP_involutive] at this; exact this)
      (activeDocks_nodup (cpConfig c))
  have hSameMem : ∀ g : Mat5, g ∈ c.activeDocks ↔ g ∈ (cpConfig c).activeDocks.map conjMatP := by
    intro g
    rw [mem_activeDocks_iff, mem_map_iff]
    constructor
    · intro hne
      refine ⟨conjMatP g, (mem_activeDocks_iff (cpConfig c) (conjMatP g)).mpr ?_, conjMatP_involutive g⟩
      rw [lookup_cpConfig, conjMatP_involutive]
      intro h0; apply hne; funext a
      have h1 := congrFun h0 (paritySlot a)
      unfold cpFullDock conjFullDock parityFullDock at h1
      rw [(line_geom_facts.2.2.2.2.1 a).1] at h1
      cases hda : c.lookup g a with
      | empty => rfl
      | occ s r => rw [hda] at h1; cases s <;> exact SlotState.noConfusion h1
    · intro ⟨x, hx, hxg⟩
      have hne := (mem_activeDocks_iff (cpConfig c) x).mp hx
      rw [lookup_cpConfig, hxg] at hne
      intro h0; apply hne; rw [h0]; rfl
  exact applySites_superset F c.activeDocks ((cpConfig c).activeDocks.map conjMatP)
    (activeDocks_nodup c) hMapNd (fun g hg => (hSameMem g).mp hg) c
    (fun g hg hnot => absurd ((hSameMem g).mpr hg) hnot) (fockCP ψ)

private theorem composeLines_tau {f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig}
    (hComm : ∀ l₁ l₂ ψ, (f l₁).op ((f l₂).op ψ) = (f l₂).op ((f l₁).op ψ))
    (hLine : ∀ l ψ, fockTau ((f l).op (fockTau ψ)) = (f l).dag ψ)
    (ls : List (Fin 12)) (hnd : IsNodup ls) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockTau ((composeLines f ls).op (fockTau ψ)) = (composeLines f ls).dag ψ := by
  have hCommDag : ∀ l₁ l₂ φ, (f l₁).dag ((f l₂).dag φ) = (f l₂).dag ((f l₁).dag φ) :=
    fun l₁ l₂ => fockUnitary_comm_dag (hComm l₁ l₂)
  induction hnd generalizing ψ with
  | nil => exact fockTau_involutive ψ
  | @cons l rest hnot _ ih =>
    simp only [composeLines, FockUnitary.comp]
    have h1 : fockTau ((f l).op ((composeLines f rest).op (fockTau ψ))) =
        (f l).dag (fockTau ((composeLines f rest).op (fockTau ψ))) := by
      have := hLine l (fockTau ((composeLines f rest).op (fockTau ψ)))
      rw [fockTau_involutive] at this; exact this
    rw [h1, ih ψ]
    have hPush : ∀ (rs : List (Fin 12)) (φ : FockVec NinthLoc6 HoneycombConfig),
        (f l).dag ((composeLines f rs).dag φ) = (composeLines f rs).dag ((f l).dag φ) := by
      intro rs
      induction rs with
      | nil => intro _; rfl
      | cons r rr ihr =>
        intro φ; simp only [composeLines, FockUnitary.comp]
        rw [ihr, hCommDag l r]
    exact hPush rest ψ

private theorem composeLines_cp {f₁ f₂ : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig}
    (hComm₂ : ∀ l₁ l₂ ψ, (f₂ l₁).op ((f₂ l₂).op ψ) = (f₂ l₂).op ((f₂ l₁).op ψ))
    (hLine : ∀ l ψ, fockCP ((f₁ l).op ψ) = (f₂ (parityLine l)).op (fockCP ψ))
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockCP ((composeLines f₁ (List.finRange 12)).op ψ) =
      (composeLines f₂ (List.finRange 12)).op (fockCP ψ) := by
  have hMap : ∀ ls φ, fockCP ((composeLines f₁ ls).op φ) =
      (composeLines f₂ (ls.map parityLine)).op (fockCP φ) := by
    intro ls
    induction ls with
    | nil => intro _; rfl
    | cons l rest ih => intro φ; simp only [List.map, composeLines, FockUnitary.comp]; rw [hLine l, ih]
  rw [hMap]
  have hErase : ∀ (a : Fin 12) (ls : List (Fin 12)) (φ : FockVec NinthLoc6 HoneycombConfig),
      a ∈ ls → (composeLines f₂ ls).op φ = (f₂ a).op ((composeLines f₂ (eraseOne a ls)).op φ) := by
    intro a ls
    induction ls with
    | nil => intro _ h; cases h
    | cons x rest ih =>
      intro φ hm; simp only [eraseOne, composeLines, FockUnitary.comp]
      if hxa : x = a then rw [ite_eq_left hxa, hxa]
      else
        rw [ite_eq_right hxa]; simp only [composeLines, FockUnitary.comp]
        cases hm with
        | head => exact absurd rfl hxa
        | tail _ h' => rw [ih φ h', hComm₂ x a]
  have hPermEq : ∀ (ls₁ ls₂ : List (Fin 12)), IsNodup ls₁ → IsNodup ls₂ →
      (∀ x, x ∈ ls₁ ↔ x ∈ ls₂) → ∀ φ, (composeLines f₂ ls₁).op φ = (composeLines f₂ ls₂).op φ := by
    intro ls₁
    induction ls₁ with
    | nil =>
      intro ls₂ _ _ hm φ
      cases ls₂ with | nil => rfl | cons x _ => cases (hm x).mpr (List.Mem.head _)
    | cons a rest ih =>
      intro ls₂ hnd1 hnd2 hm φ
      cases hnd1 with
      | cons hnot hndRest =>
        rw [hErase a ls₂ φ ((hm a).mp (List.Mem.head rest))]
        simp only [composeLines, FockUnitary.comp]
        apply congrArg (f₂ a).op
        apply ih (eraseOne a ls₂) hndRest (isNodup_eraseOne a hnd2)
        intro x
        rw [mem_eraseOne_iff a x hnd2]
        constructor
        · intro hx
          refine ⟨(hm x).mp (List.Mem.tail a hx), fun hxa => by rw [hxa] at hx; exact hnot hx⟩
        · intro ⟨hx2, hne⟩
          cases (hm x).mpr hx2 with
          | head => exact absurd rfl hne
          | tail _ h' => exact h'
  have hPInv : ∀ l, parityLine (parityLine l) = l := fun l => (line_geom_facts.2.2.2.2.2 l).1
  apply hPermEq ((List.finRange 12).map parityLine) (List.finRange 12)
    (isNodup_map_inj parityLine (fun x y h => by have := congrArg parityLine h; rw [hPInv, hPInv] at this; exact this) finRange12_nodup)
    finRange12_nodup
  intro l
  exact ⟨fun _ => mem_finRange12 l,
         fun _ => (mem_map_iff parityLine _ l).mpr ⟨parityLine l, mem_finRange12 _, hPInv l⟩⟩

private theorem lineHalfCoin_comm_same_site (g : Mat5) (l₁ l₂ : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineHalfCoinUnit g l₁).op ((lineHalfCoinUnit g l₂).op ψ) =
      (lineHalfCoinUnit g l₂).op ((lineHalfCoinUnit g l₁).op ψ) := by
  if hl : l₁ = l₂ then rw [hl]
  else
    have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ hl
    funext c
    simp only [lineHalfCoinUnit_op]
    have hLk1 : (swapLineSlotsConfig g l₁ c).lookup g (lineA l₂) = c.lookup g (lineA l₂) ∧
                (swapLineSlotsConfig g l₁ c).lookup g (lineB l₂) = c.lookup g (lineB l₂) := by
      unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineSlotsDock
      exact ⟨by simp only [ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm],
             by simp only [ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]⟩
    have hLk2 : (swapLineSlotsConfig g l₂ c).lookup g (lineA l₁) = c.lookup g (lineA l₁) ∧
                (swapLineSlotsConfig g l₂ c).lookup g (lineB l₁) = c.lookup g (lineB l₁) := by
      unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineSlotsDock
      exact ⟨by simp only [ite_eq_right hDisj.1, ite_eq_right hDisj.2.1],
             by simp only [ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]⟩
    have hF1 : isFullLine ((swapLineSlotsConfig g l₂ c).lookup g) l₁ = isFullLine (c.lookup g) l₁ := by
      unfold isFullLine; rw [hLk2.1, hLk2.2]
    have hF2 : isFullLine ((swapLineSlotsConfig g l₁ c).lookup g) l₂ = isFullLine (c.lookup g) l₂ := by
      unfold isFullLine; rw [hLk1.1, hLk1.2]
    have hL1 : isLoneLine ((swapLineSlotsConfig g l₂ c).lookup g) l₁ = isLoneLine (c.lookup g) l₁ := by
      unfold isLoneLine; rw [hLk2.1, hLk2.2]
    have hL2 : isLoneLine ((swapLineSlotsConfig g l₁ c).lookup g) l₂ = isLoneLine (c.lookup g) l₂ := by
      unfold isLoneLine; rw [hLk1.1, hLk1.2]
    have hSw : swapLineSlotsConfig g l₂ (swapLineSlotsConfig g l₁ c) =
        swapLineSlotsConfig g l₁ (swapLineSlotsConfig g l₂ c) := by
      unfold swapLineSlotsConfig
      simp only [lookup_setDock, ite_eq_left rfl, setDock_setDock_same]
      apply congrArg (c.setDock g); funext s; unfold swapLineSlotsDock
      if hsA1 : s = lineA l₁ then
        simp only [ite_eq_left hsA1, ite_eq_right (by rw [hsA1]; exact hDisj.1), ite_eq_right (by rw [hsA1]; exact hDisj.2.1),
          ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]
      else if hsB1 : s = lineB l₁ then
        simp only [ite_eq_right hsA1, ite_eq_left hsB1, ite_eq_right (by rw [hsB1]; exact hDisj.2.2.1),
          ite_eq_right (by rw [hsB1]; exact hDisj.2.2.2), ite_eq_right hDisj.1, ite_eq_right hDisj.2.1]
      else if hsA2 : s = lineA l₂ then
        simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_left hsA2, ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]
      else if hsB2 : s = lineB l₂ then
        simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_right hsA2, ite_eq_left hsB2, ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm]
      else
        simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_right hsA2, ite_eq_right hsB2]
    rw [hF1, hF2, hL1, hL2, hSw]
    set p1 := if isFullLine (c.lookup g) l₁ = true then NinthLoc6.zeta6 else NinthLoc6.one
    set p2 := if isFullLine (c.lookup g) l₂ = true then NinthLoc6.zeta6 else NinthLoc6.one
    cases isLoneLine (c.lookup g) l₁ <;> cases isLoneLine (c.lookup g) l₂
    · simp only [ite_bool_false]
      rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm p1 p2, NinthLoc6.mul_assoc]
    · simp only [ite_bool_false, ite_bool_true]
      exact nloc_phase_block2_comm p1 p2 NinthLoc6.coinDiag NinthLoc6.coinOff _ _
    · simp only [ite_bool_false, ite_bool_true]
      exact (nloc_phase_block2_comm p2 p1 NinthLoc6.coinDiag NinthLoc6.coinOff _ _).symm
    · simp only [ite_bool_true]
      exact nloc_block2_comm p1 p2 NinthLoc6.coinDiag NinthLoc6.coinOff _ _ _ _

private theorem lineMeet_comm_same_site (g : Mat5) (l₁ l₂ : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineMeetUnit g l₁).op ((lineMeetUnit g l₂).op ψ) =
      (lineMeetUnit g l₂).op ((lineMeetUnit g l₁).op ψ) := by
  if hl : l₁ = l₂ then rw [hl]
  else
    have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ hl
    funext c
    simp only [lineMeetUnit_op]
    have hLk1 : (swapLineRolesConfig g l₁ c).lookup g (lineA l₂) = c.lookup g (lineA l₂) ∧
                (swapLineRolesConfig g l₁ c).lookup g (lineB l₂) = c.lookup g (lineB l₂) := by
      unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineRolesDock
      cases c.lookup g (lineA l₁) <;> cases c.lookup g (lineB l₁)
      all_goals try exact ⟨rfl, rfl⟩
      exact ⟨by simp only [ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm],
             by simp only [ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]⟩
    have hLk2 : (swapLineRolesConfig g l₂ c).lookup g (lineA l₁) = c.lookup g (lineA l₁) ∧
                (swapLineRolesConfig g l₂ c).lookup g (lineB l₁) = c.lookup g (lineB l₁) := by
      unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineRolesDock
      cases c.lookup g (lineA l₂) <;> cases c.lookup g (lineB l₂)
      all_goals try exact ⟨rfl, rfl⟩
      exact ⟨by simp only [ite_eq_right hDisj.1, ite_eq_right hDisj.2.1],
             by simp only [ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]⟩
    have hE1 : isSameSignEqRoleLine ((swapLineRolesConfig g l₂ c).lookup g) l₁ = isSameSignEqRoleLine (c.lookup g) l₁ := by
      unfold isSameSignEqRoleLine; rw [hLk2.1, hLk2.2]
    have hE2 : isSameSignEqRoleLine ((swapLineRolesConfig g l₁ c).lookup g) l₂ = isSameSignEqRoleLine (c.lookup g) l₂ := by
      unfold isSameSignEqRoleLine; rw [hLk1.1, hLk1.2]
    have hD1 : isSameSignDiffRoleLine ((swapLineRolesConfig g l₂ c).lookup g) l₁ = isSameSignDiffRoleLine (c.lookup g) l₁ := by
      unfold isSameSignDiffRoleLine; rw [hLk2.1, hLk2.2]
    have hD2 : isSameSignDiffRoleLine ((swapLineRolesConfig g l₁ c).lookup g) l₂ = isSameSignDiffRoleLine (c.lookup g) l₂ := by
      unfold isSameSignDiffRoleLine; rw [hLk1.1, hLk1.2]
    have hSw : swapLineRolesConfig g l₂ (swapLineRolesConfig g l₁ c) =
        swapLineRolesConfig g l₁ (swapLineRolesConfig g l₂ c) := by
      unfold swapLineRolesConfig
      simp only [lookup_setDock, ite_eq_left rfl, setDock_setDock_same]
      apply congrArg (c.setDock g); funext s; unfold swapLineRolesDock
      have hA1 : swapLineRolesDock l₂ (c.lookup g) (lineA l₁) = c.lookup g (lineA l₁) := by
        have := hLk2.1; unfold swapLineRolesConfig at this; rw [lookup_setDock, ite_eq_left rfl] at this; exact this
      have hB1 : swapLineRolesDock l₂ (c.lookup g) (lineB l₁) = c.lookup g (lineB l₁) := by
        have := hLk2.2; unfold swapLineRolesConfig at this; rw [lookup_setDock, ite_eq_left rfl] at this; exact this
      have hA2 : swapLineRolesDock l₁ (c.lookup g) (lineA l₂) = c.lookup g (lineA l₂) := by
        have := hLk1.1; unfold swapLineRolesConfig at this; rw [lookup_setDock, ite_eq_left rfl] at this; exact this
      have hB2 : swapLineRolesDock l₁ (c.lookup g) (lineB l₂) = c.lookup g (lineB l₂) := by
        have := hLk1.2; unfold swapLineRolesConfig at this; rw [lookup_setDock, ite_eq_left rfl] at this; exact this
      change (match swapLineRolesDock l₁ (c.lookup g) (lineA l₂), swapLineRolesDock l₁ (c.lookup g) (lineB l₂) with
        | .occ sA rA, .occ sB rB => if s = lineA l₂ then .occ sA rB else if s = lineB l₂ then .occ sB rA else swapLineRolesDock l₁ (c.lookup g) s
        | _, _ => swapLineRolesDock l₁ (c.lookup g) s) =
        (match swapLineRolesDock l₂ (c.lookup g) (lineA l₁), swapLineRolesDock l₂ (c.lookup g) (lineB l₁) with
        | .occ sA rA, .occ sB rB => if s = lineA l₁ then .occ sA rB else if s = lineB l₁ then .occ sB rA else swapLineRolesDock l₂ (c.lookup g) s
        | _, _ => swapLineRolesDock l₂ (c.lookup g) s)
      rw [hA1, hB1, hA2, hB2]; unfold swapLineRolesDock
      cases c.lookup g (lineA l₁) <;> cases c.lookup g (lineB l₁) <;> cases c.lookup g (lineA l₂) <;> cases c.lookup g (lineB l₂)
      all_goals try rfl
      if hsA1 : s = lineA l₁ then
        simp only [ite_eq_left hsA1, ite_eq_right (by rw [hsA1]; exact hDisj.1), ite_eq_right (by rw [hsA1]; exact hDisj.2.1)]
      else if hsB1 : s = lineB l₁ then
        simp only [ite_eq_right hsA1, ite_eq_left hsB1, ite_eq_right (by rw [hsB1]; exact hDisj.2.2.1), ite_eq_right (by rw [hsB1]; exact hDisj.2.2.2)]
      else if hsA2 : s = lineA l₂ then
        simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_left hsA2]
      else if hsB2 : s = lineB l₂ then
        simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_right hsA2, ite_eq_left hsB2]
      else
        simp only [ite_eq_right hsA1, ite_eq_right hsB1, ite_eq_right hsA2, ite_eq_right hsB2]
    rw [hE1, hE2, hD1, hD2, hSw]
    set p1 := if isSameSignEqRoleLine (c.lookup g) l₁ = true then NinthLoc6.omega else NinthLoc6.one
    set p2 := if isSameSignEqRoleLine (c.lookup g) l₂ = true then NinthLoc6.omega else NinthLoc6.one
    cases isSameSignDiffRoleLine (c.lookup g) l₁ <;> cases isSameSignDiffRoleLine (c.lookup g) l₂
    · simp only [ite_bool_false]
      rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm p1 p2, NinthLoc6.mul_assoc]
    · simp only [ite_bool_false, ite_bool_true]
      exact nloc_phase_block2_comm p1 p2 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _
    · simp only [ite_bool_false, ite_bool_true]
      exact (nloc_phase_block2_comm p2 p1 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _).symm
    · simp only [ite_bool_true]
      exact nloc_block2_comm p1 p2 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _ _ _

private theorem rev_preserves_solePair (d : FullDock) :
    findSolePairLine (revFullDock d) = findSolePairLine d ∧
    isSoleIdentPairDock (revFullDock d) = isSoleIdentPairDock d ∧
    (∀ m : Fin 12, isSoleIdentPairDock d = true →
      revFullDock (moveSolePairDock m d) = moveSolePairDock m (revFullDock d)) := by
  have hAt : ∀ l : Fin 12, isSoleIdentPairAt (revFullDock d) l = isSoleIdentPairAt d l := by
    intro l
    have ⟨hAB, hBA, _⟩ := line_geom_facts.1 l
    unfold isSoleIdentPairAt isSameSignEqRoleLine revFullDock
    rw [hAB, hBA]
    have h1 : (match d (lineB l), d (lineA l) with
        | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA = rB)
        | _, _ => false) =
      (match d (lineA l), d (lineB l) with
        | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA = rB)
        | _, _ => false) := by
      cases d (lineA l) with
      | empty => cases d (lineB l) <;> rfl
      | occ sA rA =>
        cases d (lineB l) with
        | empty => rfl
        | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have h2 : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d (oppSlot s) = .empty)) =
        (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty)) := by
      cases hL : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d (oppSlot s) = .empty)) <;>
      cases hR : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty))
      · rfl
      · exfalso
        have hall := (list_all_eq_true_iff _ _).mp hR
        have hTrue : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d (oppSlot s) = .empty)) = true := by
          refine (list_all_eq_true_iff _ _).mpr fun s _ => ?_
          rcases of_decide_eq_true (hall (oppSlot s) (mem_finRange24 _)) with hA | hB | hE
          · exact decide_eq_true (Or.inr (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hA, hAB])))
          · exact decide_eq_true (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hB, hBA]))
          · exact decide_eq_true (Or.inr (Or.inr hE))
        rw [hL] at hTrue; exact Bool.noConfusion hTrue
      · exfalso
        have hall := (list_all_eq_true_iff _ _).mp hL
        have hTrue : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty)) = true := by
          refine (list_all_eq_true_iff _ _).mpr fun s _ => ?_
          have := hall (oppSlot s) (mem_finRange24 _)
          rw [(thm_24_facets_geometry.2.1 s).1] at this
          rcases of_decide_eq_true this with hA | hB | hE
          · exact decide_eq_true (Or.inr (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hA, hAB])))
          · exact decide_eq_true (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hB, hBA]))
          · exact decide_eq_true (Or.inr (Or.inr hE))
        rw [hR] at hTrue; exact Bool.noConfusion hTrue
      · rfl
    rw [h1, h2]
  have hFind : findSolePairLine (revFullDock d) = findSolePairLine d := by
    unfold findSolePairLine
    have hFun : (fun l => isSoleIdentPairAt (revFullDock d) l) = (fun l => isSoleIdentPairAt d l) := funext hAt
    rw [hFun]
  refine ⟨hFind, by unfold isSoleIdentPairDock; rw [hFind], ?_⟩
  intro m hAct
  unfold isSoleIdentPairDock at hAct
  cases hf : findSolePairLine d with
  | none => rw [hf] at hAct; exact Bool.noConfusion hAct
  | some l =>
    have hl := (find?_eq_some_iff _ _ _ hf).2
    have hSame := ((Bool.and_eq_true _ _).mp hl).1
    have hEqAB : d (lineB l) = d (lineA l) := by
      unfold isSameSignEqRoleLine at hSame
      cases hA : d (lineA l) <;> cases hB : d (lineB l) <;> rw [hA, hB] at hSame
      all_goals try exact Bool.noConfusion hSame
      have ⟨hs, hr⟩ := of_decide_eq_true hSame; rw [hs, hr]
    funext s
    unfold revFullDock moveSolePairDock
    rw [hFind, hf, (line_geom_facts.1 l).1, hEqAB]
    have ⟨hmAB, hmBA, _⟩ := line_geom_facts.1 m
    if hs : s = lineA m ∨ s = lineB m then
      have hO : oppSlot s = lineA m ∨ oppSlot s = lineB m := by
        rcases hs with h1 | h2
        · exact Or.inr (by rw [h1, hmAB])
        · exact Or.inl (by rw [h2, hmBA])
      simp only [ite_eq_left hO, ite_eq_left hs]
    else
      have hO : ¬ (oppSlot s = lineA m ∨ oppSlot s = lineB m) := by
        intro h; apply hs
        rcases h with h1 | h2
        · exact Or.inr (by rw [← (thm_24_facets_geometry.2.1 s).1, h1, hmAB])
        · exact Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, h2, hmBA])
      simp only [ite_eq_right hO, ite_eq_right hs]

private theorem cp_preserves_solePair (d : FullDock) :
    (∀ l : Fin 12, isSoleIdentPairAt (cpFullDock d) (parityLine l) = isSoleIdentPairAt d l) ∧
    isSoleIdentPairDock (cpFullDock d) = isSoleIdentPairDock d ∧
    (∀ m : Fin 12, isSoleIdentPairDock d = true →
      cpFullDock (moveSolePairDock m d) = moveSolePairDock (parityLine m) (cpFullDock d)) := by
  have hAt : ∀ l : Fin 12, isSoleIdentPairAt (cpFullDock d) (parityLine l) = isSoleIdentPairAt d l := by
    intro l
    have hPInv := (line_geom_facts.2.2.2.2.2 l).1
    have hPA : paritySlot (lineA (parityLine l)) = lineA l := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine l)).2.1, hPInv]
    have hPB : paritySlot (lineB (parityLine l)) = lineB l := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine l)).2.2, hPInv]
    unfold isSoleIdentPairAt isSameSignEqRoleLine cpFullDock conjFullDock parityFullDock
    rw [hPA, hPB]
    have h1 : (match (d (lineA l)).dual, (d (lineB l)).dual with
        | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA = rB)
        | _, _ => false) =
      (match d (lineA l), d (lineB l) with
        | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA = rB)
        | _, _ => false) := by
      cases d (lineA l) with
      | empty => cases d (lineB l) <;> rfl
      | occ sA rA =>
        cases d (lineB l) with
        | empty => rfl
        | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have h2 : (List.finRange 24).all (fun s => decide (s = lineA (parityLine l) ∨ s = lineB (parityLine l) ∨ (d (paritySlot s)).dual = .empty)) =
        (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty)) := by
      cases hL : (List.finRange 24).all (fun s => decide (s = lineA (parityLine l) ∨ s = lineB (parityLine l) ∨ (d (paritySlot s)).dual = .empty)) <;>
      cases hR : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty))
      · rfl
      · exfalso
        have hall := (list_all_eq_true_iff _ _).mp hR
        have hTrue : (List.finRange 24).all (fun s => decide (s = lineA (parityLine l) ∨ s = lineB (parityLine l) ∨ (d (paritySlot s)).dual = .empty)) = true := by
          refine (list_all_eq_true_iff _ _).mpr fun s _ => ?_
          rcases of_decide_eq_true (hall (paritySlot s) (mem_finRange24 _)) with hA | hB | hE
          · exact decide_eq_true (Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, hA, (line_geom_facts.2.2.2.2.2 l).2.1]))
          · exact decide_eq_true (Or.inr (Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, hB, (line_geom_facts.2.2.2.2.2 l).2.2])))
          · exact decide_eq_true (Or.inr (Or.inr (by rw [hE]; rfl)))
        rw [hL] at hTrue; exact Bool.noConfusion hTrue
      · exfalso
        have hall := (list_all_eq_true_iff _ _).mp hL
        have hTrue : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty)) = true := by
          refine (list_all_eq_true_iff _ _).mpr fun s _ => ?_
          have := hall (paritySlot s) (mem_finRange24 _)
          rw [(line_geom_facts.2.2.2.2.1 s).1] at this
          rcases of_decide_eq_true this with hA | hB | hE
          · exact decide_eq_true (Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, hA, hPA]))
          · exact decide_eq_true (Or.inr (Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, hB, hPB])))
          · exact decide_eq_true (Or.inr (Or.inr (by cases hx : d s with | empty => rfl | occ sx rx => rw [hx] at hE; cases sx <;> exact SlotState.noConfusion hE)))
        rw [hR] at hTrue; exact Bool.noConfusion hTrue
      · rfl
    rw [h1, h2]
  have hDock : isSoleIdentPairDock (cpFullDock d) = isSoleIdentPairDock d := by
    cases hd : isSoleIdentPairDock d with
    | true =>
      unfold isSoleIdentPairDock at hd ⊢
      cases hf : findSolePairLine d with
      | none => rw [hf] at hd; exact Bool.noConfusion hd
      | some l =>
        have hl := (find?_eq_some_iff _ _ _ hf).2
        have hcp := hAt l; rw [hl] at hcp
        rw [findSolePairLine_of_at (cpFullDock d) (parityLine l) hcp]; rfl
    | false =>
      cases hcp : isSoleIdentPairDock (cpFullDock d) with
      | false => rfl
      | true =>
        unfold isSoleIdentPairDock at hcp
        cases hf : findSolePairLine (cpFullDock d) with
        | none => rw [hf] at hcp; exact Bool.noConfusion hcp
        | some l =>
          have hl := (find?_eq_some_iff _ _ _ hf).2
          have hBack := hAt (parityLine l)
          rw [(line_geom_facts.2.2.2.2.2 l).1, hl] at hBack
          have hSome := findSolePairLine_of_at d (parityLine l) hBack.symm
          unfold isSoleIdentPairDock at hd; rw [hSome] at hd; exact Bool.noConfusion hd
  refine ⟨hAt, hDock, ?_⟩
  intro m hAct
  unfold isSoleIdentPairDock at hAct
  cases hf : findSolePairLine d with
  | none => rw [hf] at hAct; exact Bool.noConfusion hAct
  | some l =>
    have hl := (find?_eq_some_iff _ _ _ hf).2
    have hcpL : isSoleIdentPairAt (cpFullDock d) (parityLine l) = true := by rw [hAt l, hl]
    have hFindCP : findSolePairLine (cpFullDock d) = some (parityLine l) :=
      findSolePairLine_of_at (cpFullDock d) (parityLine l) hcpL
    have hPA : paritySlot (lineA (parityLine l)) = lineA l := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine l)).2.1, (line_geom_facts.2.2.2.2.2 l).1]
    funext s
    unfold cpFullDock conjFullDock parityFullDock moveSolePairDock
    rw [hFindCP, hf, hPA]
    have hMA : paritySlot (lineA (parityLine m)) = lineA m := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine m)).2.1, (line_geom_facts.2.2.2.2.2 m).1]
    have hMB : paritySlot (lineB (parityLine m)) = lineB m := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine m)).2.2, (line_geom_facts.2.2.2.2.2 m).1]
    if hs : s = lineA (parityLine m) ∨ s = lineB (parityLine m) then
      have hP : paritySlot s = lineA m ∨ paritySlot s = lineB m := by
        rcases hs with h1 | h2
        · exact Or.inl (by rw [h1, hMA])
        · exact Or.inr (by rw [h2, hMB])
      simp only [ite_eq_left hP, ite_eq_left hs]
    else
      have hP : ¬ (paritySlot s = lineA m ∨ paritySlot s = lineB m) := by
        intro h; apply hs
        rcases h with h1 | h2
        · exact Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, h1, (line_geom_facts.2.2.2.2.2 m).2.1])
        · exact Or.inr (by rw [← (line_geom_facts.2.2.2.2.1 s).1, h2, (line_geom_facts.2.2.2.2.2 m).2.2])
      simp only [ite_eq_right hP, ite_eq_right hs]; rfl

/-- Headline Theorem 17 (Concrete Quantum Fock-Space Instantiation of `CoxeterTransport.thm_palindromic_beat_T_CP_CPT`):
    instantiates `CoxeterTransport.thm_palindromic_beat_T_CP_CPT` directly with the concrete infinite-honeycomb
    Fock operators (`fockStream`, `fockPhiOdd χ`, `fockHalfCoin`, `fockScale2Core`, `fockTau`, `fockCP`),
    proving exact quantum `T^2 = I`, `T U T = U†`, `CP U = U CP`, `(CP ∘ T)^2 = I`, and
    `(CP ∘ T) U (CP ∘ T) = U†` on ALL Fock states over infinite `{3,4,3,4}` for EVERY `ChiralInvariant χ`. -/
theorem thm_fock_beat_T_CP_CPT (χ : ChiralInvariant) :
    (∀ ψ, fockT (fockT ψ) = ψ) ∧
    (∀ ψ, fockT (fockBeat χ (fockT ψ)) = fockBeatDag χ ψ) ∧
    (∀ ψ, fockCP (fockBeat χ ψ) = fockBeat χ (fockCP ψ)) ∧
    (∀ ψ, fockCPT (fockCPT ψ) = ψ) ∧
    (∀ ψ, fockCPT (fockBeat χ (fockCPT ψ)) = fockBeatDag χ ψ) := by
  have hTauS : ∀ ψ, fockTau (fockStream (fockTau ψ)) = fockStreamDag ψ := by
    intro ψ; funext c
    unfold fockTau
    rw [fockStream_eval, fockStreamDag_eval, NinthLoc6.conj_conj]
    have hSRS := (thm_fock_honeycomb_config_symmetries c).2.2.2.1
    have hEq : revConfig (streamConfigInv (revConfig c)) = streamConfig c := by
      have hInv : streamConfigInv (revConfig c) = revConfig (streamConfig c) := by
        have h := congrArg streamConfigInv hSRS
        rw [(thm_fock_honeycomb_config_symmetries _).1] at h
        exact h.symm
      rw [hInv, (thm_fock_honeycomb_config_symmetries _).2.2.1]
    rw [hEq]
  have hTauPhi : ∀ ψ, fockTau (fockPhiOdd χ (fockTau ψ)) = fockPhiOddDag χ ψ := by
    apply globalOp_tau_of_site_tau (phiOddFamily χ)
    intro g ψ; funext c
    unfold fockTau phiOddFamily
    rw [sitePhiOddUnit_op, sitePhiOddUnit_dag, lookup_revConfig, χ.chi_rev,
        NinthLoc6.conj_mul, NinthLoc6.conj_conj,
        (thm_fock_honeycomb_config_symmetries c).2.2.1]
  have hTauD : ∀ ψ, fockTau (fockHalfCoin (fockTau ψ)) = fockHalfCoinDag ψ := by
    apply globalOp_tau_of_site_tau halfCoinFamily
    intro g ψ
    apply composeLines_tau (lineHalfCoin_comm_same_site g) _ (List.finRange 12) finRange12_nodup ψ
    intro l φ; funext c
    unfold fockTau
    rw [lineHalfCoinUnit_op, lineHalfCoinUnit_dag]
    have ⟨hAB, hBA, _⟩ := line_geom_facts.1 l
    have hFull : isFullLine ((revConfig c).lookup g) l = isFullLine (c.lookup g) l := by
      rw [lookup_revConfig]; unfold isFullLine revFullDock; rw [hAB, hBA]
      cases c.lookup g (lineA l) <;> cases c.lookup g (lineB l) <;> rfl
    have hLone : isLoneLine ((revConfig c).lookup g) l = isLoneLine (c.lookup g) l := by
      rw [lookup_revConfig]; unfold isLoneLine revFullDock; rw [hAB, hBA]
      cases c.lookup g (lineA l) <;> cases c.lookup g (lineB l) <;> rfl
    have hFullSw : isFullLine ((swapLineSlotsConfig g l c).lookup g) l = isFullLine (c.lookup g) l := by
      unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]
      unfold isFullLine swapLineSlotsDock
      have hne := (line_geom_facts.1 l).2.2; simp only [ite_eq_left rfl, ite_eq_right hne.symm]
      cases c.lookup g (lineA l) <;> cases c.lookup g (lineB l) <;> rfl
    have hSwRev : revConfig (swapLineSlotsConfig g l (revConfig c)) = swapLineSlotsConfig g l c := by
      unfold swapLineSlotsConfig
      rw [revConfig_setDock, lookup_revConfig, revFullDock_swapLineSlots,
          (thm_fock_honeycomb_config_symmetries c).2.2.1]
      have hRR : revFullDock (revFullDock (c.lookup g)) = c.lookup g := by
        funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]
      rw [hRR]
    rw [hFull, hLone, hFullSw, NinthLoc6.conj_mul]
    cases isLoneLine (c.lookup g) l with
    | false =>
      simp only [ite_bool_false]
      rw [NinthLoc6.conj_conj, (thm_fock_honeycomb_config_symmetries c).2.2.1]
    | true =>
      simp only [ite_bool_true]
      rw [NinthLoc6.conj_add, NinthLoc6.conj_mul, NinthLoc6.conj_mul, NinthLoc6.conj_conj, NinthLoc6.conj_conj,
          (thm_fock_honeycomb_config_symmetries c).2.2.1, hSwRev]
      exact nloc_mul_add_swap _ _ _ _ _
  have hTauK : ∀ ψ, fockTau (fockBounceK (fockTau ψ)) = fockBounceK ψ := by
    intro ψ
    rw [← fockBounceK_self_adj ψ]
    apply globalOp_tau_of_site_tau bounceKFamily
    intro g φ
    apply composeLines_tau (lineBounceK_comm_same_site g) _ (List.finRange 12) finRange12_nodup φ
    intro l χ'; rw [lineBounceK_self_adj]; funext c
    unfold fockTau
    rw [lineBounceKUnit_op, lineBounceKUnit_op]
    have ⟨hAB, hBA, _⟩ := line_geom_facts.1 l
    have hOpp : isOppSignLine ((revConfig c).lookup g) l = isOppSignLine (c.lookup g) l := by
      rw [lookup_revConfig]; unfold isOppSignLine revFullDock; rw [hAB, hBA]
      cases c.lookup g (lineA l) with
      | empty => cases c.lookup g (lineB l) <;> rfl
      | occ sA _ =>
        cases c.lookup g (lineB l) with
        | empty => rfl
        | occ sB _ => cases sA <;> cases sB <;> decide
    have hPermRev : revConfig (lineBounceKPerm g l (revConfig c)) = lineBounceKPerm g l c := by
      unfold lineBounceKPerm; rw [hOpp]
      cases isOppSignLine (c.lookup g) l with
      | false => exact (thm_fock_honeycomb_config_symmetries c).2.2.1
      | true =>
        unfold swapLineSlotsConfig
        rw [revConfig_setDock, lookup_revConfig, revFullDock_swapLineSlots,
            (thm_fock_honeycomb_config_symmetries c).2.2.1]
        have hRR : revFullDock (revFullDock (c.lookup g)) = c.lookup g := by
          funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]
        rw [hRR]
    rw [hOpp, NinthLoc6.conj_mul, NinthLoc6.conj_conj, hPermRev]
    cases isOppSignLine (c.lookup g) l with
    | false =>
      simp only [ite_bool_false]
      exact congrArg (fun z => NinthLoc6.mul z _) (Quot.sound (by decide))
    | true =>
      simp only [ite_bool_true]
      exact congrArg (fun z => NinthLoc6.mul z _) (Quot.sound (by decide))
  have hTauMPair : ∀ ψ, fockTau (fockMPair (fockTau ψ)) = fockMPairDag ψ := by
    apply globalOp_tau_of_site_tau mpairFamily
    intro g ψ; funext c
    unfold fockTau mpairFamily
    rw [siteMPairUnit_op, siteMPairUnit_dag, lookup_revConfig, (rev_preserves_solePair (c.lookup g)).2.1]
    cases ha : isSoleIdentPairDock (c.lookup g) with
    | false =>
      simp only [ite_bool_false]
      rw [NinthLoc6.conj_conj, (thm_fock_honeycomb_config_symmetries c).2.2.1]
    | true =>
      simp only [ite_bool_true]
      rw [NinthLoc6.conj_add, NinthLoc6.conj_mul, NinthLoc6.conj_conj,
          (thm_fock_honeycomb_config_symmetries c).2.2.1, nloc_sumFin12_conj]
      have hConjHop : NinthLoc6.conj NinthLoc6.pairHop =
          NinthLoc6.mul (NinthLoc6.sub (NinthLoc6.conj NinthLoc6.zeta18) NinthLoc6.one) NinthLoc6.inv12 :=
        Quot.sound (by decide)
      rw [hConjHop]
      apply congrArg (NinthLoc6.add (ψ c)); apply congrArg (NinthLoc6.mul _)
      apply sumFin12_congr; intro m
      rw [NinthLoc6.conj_conj]
      apply congrArg ψ
      unfold moveSolePairConfig
      rw [revConfig_setDock, lookup_revConfig, ← (rev_preserves_solePair (c.lookup g)).2.2 m ha,
          (thm_fock_honeycomb_config_symmetries c).2.2.1]
      have hRR : ∀ d : FullDock, revFullDock (revFullDock d) = d := fun d => by
        funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]
      rw [hRR]
  have hTauMeet : ∀ ψ, fockTau (fockMeet (fockTau ψ)) = fockMeetDag ψ := by
    apply globalOp_tau_of_site_tau meetFamily
    intro g ψ
    apply composeLines_tau (lineMeet_comm_same_site g) _ (List.finRange 12) finRange12_nodup ψ
    intro l φ; funext c
    unfold fockTau
    rw [lineMeetUnit_op, lineMeetUnit_dag]
    have ⟨hAB, hBA, _⟩ := line_geom_facts.1 l
    have hEqR : isSameSignEqRoleLine ((revConfig c).lookup g) l = isSameSignEqRoleLine (c.lookup g) l := by
      rw [lookup_revConfig]; unfold isSameSignEqRoleLine revFullDock; rw [hAB, hBA]
      cases c.lookup g (lineA l) with
      | empty => cases c.lookup g (lineB l) <;> rfl
      | occ sA rA =>
        cases c.lookup g (lineB l) with
        | empty => rfl
        | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have hDiffR : isSameSignDiffRoleLine ((revConfig c).lookup g) l = isSameSignDiffRoleLine (c.lookup g) l := by
      rw [lookup_revConfig]; unfold isSameSignDiffRoleLine revFullDock; rw [hAB, hBA]
      cases c.lookup g (lineA l) with
      | empty => cases c.lookup g (lineB l) <;> rfl
      | occ sA rA =>
        cases c.lookup g (lineB l) with
        | empty => rfl
        | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have hEqSw : isSameSignEqRoleLine ((swapLineRolesConfig g l c).lookup g) l = isSameSignEqRoleLine (c.lookup g) l := by
      unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]
      unfold isSameSignEqRoleLine swapLineRolesDock
      have hne := (line_geom_facts.1 l).2.2
      cases c.lookup g (lineA l) with
      | empty => cases c.lookup g (lineB l) <;> rfl
      | occ sA rA =>
        cases c.lookup g (lineB l) with
        | empty => rfl
        | occ sB rB =>
          simp only [ite_eq_left rfl, ite_eq_right hne.symm]
          cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have hSwRev : revConfig (swapLineRolesConfig g l (revConfig c)) = swapLineRolesConfig g l c := by
      unfold swapLineRolesConfig
      rw [revConfig_setDock, lookup_revConfig, revFullDock_swapLineRoles,
          (thm_fock_honeycomb_config_symmetries c).2.2.1]
      have hRR : revFullDock (revFullDock (c.lookup g)) = c.lookup g := by
        funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]
      rw [hRR]
    rw [hEqR, hDiffR, hEqSw, NinthLoc6.conj_mul]
    cases isSameSignDiffRoleLine (c.lookup g) l with
    | false =>
      simp only [ite_bool_false]
      rw [NinthLoc6.conj_conj, (thm_fock_honeycomb_config_symmetries c).2.2.1]
    | true =>
      simp only [ite_bool_true]
      rw [NinthLoc6.conj_add, NinthLoc6.conj_mul, NinthLoc6.conj_mul, NinthLoc6.conj_conj, NinthLoc6.conj_conj,
          (thm_fock_honeycomb_config_symmetries c).2.2.1, hSwRev]
      exact nloc_mul_add_swap _ _ _ _ _
  have hTauCore : ∀ ψ, fockTau (fockScale2Core (fockTau ψ)) = fockScale2CoreDag ψ := by
    intro ψ
    change fockTau (fockMeet (fockMPair (fockBounceK (fockTau ψ)))) = fockScale2CoreDag ψ
    have h1 : fockBounceK (fockTau ψ) = fockTau (fockBounceK ψ) := by
      have := congrArg fockTau (hTauK ψ); rw [fockTau_involutive] at this; exact this
    have h2 : fockMPair (fockTau (fockBounceK ψ)) = fockTau (fockMPairDag (fockBounceK ψ)) := by
      have := congrArg fockTau (hTauMPair (fockBounceK ψ)); rw [fockTau_involutive] at this; exact this
    rw [h1, h2, hTauMeet, ← (thm_fock_scale2_core_unitary_and_comm ψ).2.2.2]
  have hCPS : ∀ ψ, fockCP (fockStream ψ) = fockStream (fockCP ψ) := by
    intro ψ; funext c
    unfold fockCP
    rw [fockStream_eval, fockStream_eval]
    have hInv : streamConfigInv (cpConfig c) = cpConfig (streamConfigInv c) := by
      have h1 : streamConfig (streamConfigInv (cpConfig c)) = streamConfig (cpConfig (streamConfigInv c)) := by
        rw [(thm_fock_honeycomb_config_symmetries _).2.1,
            ← (thm_fock_honeycomb_config_symmetries _).2.2.2.2.2.2.2.1,
            (thm_fock_honeycomb_config_symmetries _).2.1]
      have := congrArg streamConfigInv h1
      rw [(thm_fock_honeycomb_config_symmetries _).1, (thm_fock_honeycomb_config_symmetries _).1] at this
      exact this
    rw [hInv]
  have hCPPhi : ∀ ψ, fockCP (fockPhiOdd χ ψ) = fockPhiOdd χ (fockCP ψ) := by
    apply globalOp_cp_of_site_cp (phiOddFamily χ)
    intro g ψ; funext c
    unfold fockCP phiOddFamily
    rw [sitePhiOddUnit_op, sitePhiOddUnit_op, lookup_cpConfig,
        (thm_fock_coxeter_parity_equivariance.2.2.2.2 g).2, χ.chi_cp]
  have hCPD : ∀ ψ, fockCP (fockHalfCoin ψ) = fockHalfCoin (fockCP ψ) := by
    apply globalOp_cp_of_site_cp halfCoinFamily
    intro g ψ
    apply composeLines_cp (lineHalfCoin_comm_same_site (conjMatP g)) _ ψ
    intro l φ; funext c
    unfold fockCP
    rw [lineHalfCoinUnit_op, lineHalfCoinUnit_op]
    have hPA := (line_geom_facts.2.2.2.2.2 l).2.1
    have hPB := (line_geom_facts.2.2.2.2.2 l).2.2
    have hFull : isFullLine ((cpConfig c).lookup g) l = isFullLine (c.lookup (conjMatP g)) (parityLine l) := by
      rw [lookup_cpConfig]; unfold isFullLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
      cases c.lookup (conjMatP g) (lineA (parityLine l)) <;> cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
    have hLone : isLoneLine ((cpConfig c).lookup g) l = isLoneLine (c.lookup (conjMatP g)) (parityLine l) := by
      rw [lookup_cpConfig]; unfold isLoneLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
      cases c.lookup (conjMatP g) (lineA (parityLine l)) <;> cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
    have hSwCP : swapLineSlotsConfig g l (cpConfig c) = cpConfig (swapLineSlotsConfig (conjMatP g) (parityLine l) c) := by
      unfold swapLineSlotsConfig
      rw [cpConfig_setDock, conjMatP_involutive, lookup_cpConfig]
      apply congrArg ((cpConfig c).setDock g)
      funext s; unfold swapLineSlotsDock cpFullDock conjFullDock parityFullDock
      if hsA : s = lineA l then
        simp only [ite_eq_left hsA, hsA, hPA, hPB, ite_eq_left rfl]
      else if hsB : s = lineB l then
        have hne := (line_geom_facts.1 (parityLine l)).2.2
        simp only [ite_eq_right hsA, ite_eq_left hsB, hsB, hPB, hPA, ite_eq_right hne.symm, ite_eq_left rfl]
      else
        have hP1 : paritySlot s ≠ lineA (parityLine l) := fun e => hsA (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPA, (line_geom_facts.2.2.2.2.1 _).1])
        have hP2 : paritySlot s ≠ lineB (parityLine l) := fun e => hsB (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPB, (line_geom_facts.2.2.2.2.1 _).1])
        simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hP1, ite_eq_right hP2]
    rw [hFull, hLone, hSwCP]
  have hCPK : ∀ ψ, fockCP (fockBounceK ψ) = fockBounceK (fockCP ψ) := by
    apply globalOp_cp_of_site_cp bounceKFamily
    intro g ψ
    apply composeLines_cp (lineBounceK_comm_same_site (conjMatP g)) _ ψ
    intro l φ; funext c
    unfold fockCP
    rw [lineBounceKUnit_op, lineBounceKUnit_op]
    have hPA := (line_geom_facts.2.2.2.2.2 l).2.1
    have hPB := (line_geom_facts.2.2.2.2.2 l).2.2
    have hOpp : isOppSignLine ((cpConfig c).lookup g) l = isOppSignLine (c.lookup (conjMatP g)) (parityLine l) := by
      rw [lookup_cpConfig]; unfold isOppSignLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
      cases c.lookup (conjMatP g) (lineA (parityLine l)) with
      | empty => cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
      | occ sA _ =>
        cases c.lookup (conjMatP g) (lineB (parityLine l)) with
        | empty => rfl
        | occ sB _ => cases sA <;> cases sB <;> decide
    have hPermCP : lineBounceKPerm g l (cpConfig c) = cpConfig (lineBounceKPerm (conjMatP g) (parityLine l) c) := by
      unfold lineBounceKPerm; rw [hOpp]
      cases isOppSignLine (c.lookup (conjMatP g)) (parityLine l) with
      | false => rfl
      | true =>
        unfold swapLineSlotsConfig
        rw [cpConfig_setDock, conjMatP_involutive, lookup_cpConfig]
        apply congrArg ((cpConfig c).setDock g)
        funext s; unfold swapLineSlotsDock cpFullDock conjFullDock parityFullDock
        if hsA : s = lineA l then simp only [ite_eq_left hsA, hsA, hPA, hPB, ite_eq_left rfl]
        else if hsB : s = lineB l then
          have hne := (line_geom_facts.1 (parityLine l)).2.2
          simp only [ite_eq_right hsA, ite_eq_left hsB, hsB, hPB, hPA, ite_eq_right hne.symm, ite_eq_left rfl]
        else
          have hP1 : paritySlot s ≠ lineA (parityLine l) := fun e => hsA (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPA, (line_geom_facts.2.2.2.2.1 _).1])
          have hP2 : paritySlot s ≠ lineB (parityLine l) := fun e => hsB (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPB, (line_geom_facts.2.2.2.2.1 _).1])
          simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hP1, ite_eq_right hP2]
    rw [hOpp, hPermCP]
  have hCPMeet : ∀ ψ, fockCP (fockMeet ψ) = fockMeet (fockCP ψ) := by
    apply globalOp_cp_of_site_cp meetFamily
    intro g ψ
    apply composeLines_cp (lineMeet_comm_same_site (conjMatP g)) _ ψ
    intro l φ; funext c
    unfold fockCP
    rw [lineMeetUnit_op, lineMeetUnit_op]
    have hPA := (line_geom_facts.2.2.2.2.2 l).2.1
    have hPB := (line_geom_facts.2.2.2.2.2 l).2.2
    have hEqR : isSameSignEqRoleLine ((cpConfig c).lookup g) l = isSameSignEqRoleLine (c.lookup (conjMatP g)) (parityLine l) := by
      rw [lookup_cpConfig]; unfold isSameSignEqRoleLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
      cases c.lookup (conjMatP g) (lineA (parityLine l)) with
      | empty => cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
      | occ sA rA =>
        cases c.lookup (conjMatP g) (lineB (parityLine l)) with
        | empty => rfl
        | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have hDiffR : isSameSignDiffRoleLine ((cpConfig c).lookup g) l = isSameSignDiffRoleLine (c.lookup (conjMatP g)) (parityLine l) := by
      rw [lookup_cpConfig]; unfold isSameSignDiffRoleLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
      cases c.lookup (conjMatP g) (lineA (parityLine l)) with
      | empty => cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
      | occ sA rA =>
        cases c.lookup (conjMatP g) (lineB (parityLine l)) with
        | empty => rfl
        | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have hSwCP : swapLineRolesConfig g l (cpConfig c) = cpConfig (swapLineRolesConfig (conjMatP g) (parityLine l) c) := by
      unfold swapLineRolesConfig
      rw [cpConfig_setDock, conjMatP_involutive, lookup_cpConfig]
      apply congrArg ((cpConfig c).setDock g)
      funext s; unfold swapLineRolesDock cpFullDock conjFullDock parityFullDock
      rw [hPA, hPB]
      cases hA : c.lookup (conjMatP g) (lineA (parityLine l)) with
      | empty => cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
      | occ sA rA =>
        cases hB : c.lookup (conjMatP g) (lineB (parityLine l)) with
        | empty => rfl
        | occ sB rB =>
          if hsA : s = lineA l then simp only [ite_eq_left hsA, hsA, hPA, ite_eq_left rfl]
          else if hsB : s = lineB l then
            have hne := (line_geom_facts.1 (parityLine l)).2.2
            simp only [ite_eq_right hsA, ite_eq_left hsB, hsB, hPB, ite_eq_right hne.symm, ite_eq_left rfl]
          else
            have hP1 : paritySlot s ≠ lineA (parityLine l) := fun e => hsA (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPA, (line_geom_facts.2.2.2.2.1 _).1])
            have hP2 : paritySlot s ≠ lineB (parityLine l) := fun e => hsB (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPB, (line_geom_facts.2.2.2.2.1 _).1])
            simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hP1, ite_eq_right hP2]
    rw [hEqR, hDiffR, hSwCP]
  have hCPMPair : ∀ ψ, fockCP (fockMPair ψ) = fockMPair (fockCP ψ) := by
    apply globalOp_cp_of_site_cp mpairFamily
    intro g ψ; funext c
    unfold fockCP mpairFamily
    rw [siteMPairUnit_op, siteMPairUnit_op, lookup_cpConfig, (cp_preserves_solePair (c.lookup (conjMatP g))).2.1]
    cases ha : isSoleIdentPairDock (c.lookup (conjMatP g)) with
    | false => simp only [ite_bool_false]
    | true =>
      simp only [ite_bool_true]
      apply congrArg (NinthLoc6.add _); apply congrArg (NinthLoc6.mul _)
      have hPInv : ∀ m, parityLine (parityLine m) = m := fun m => (line_geom_facts.2.2.2.2.2 m).1
      rw [← sumFin12_bijection parityLine parityLine (fun m => ψ (moveSolePairConfig g m (cpConfig c))) hPInv hPInv]
      apply sumFin12_congr; intro m
      apply congrArg ψ
      unfold moveSolePairConfig
      rw [cpConfig_setDock, conjMatP_involutive, lookup_cpConfig,
          (cp_preserves_solePair (c.lookup (conjMatP g))).2.2 m ha]
  have hCPCore : ∀ ψ, fockCP (fockScale2Core ψ) = fockScale2Core (fockCP ψ) := by
    intro ψ
    change fockCP (fockMeet (fockMPair (fockBounceK ψ))) = fockMeet (fockMPair (fockBounceK (fockCP ψ)))
    rw [hCPMeet, hCPMPair, hCPK]
  have hCPTau : ∀ ψ, fockCP (fockTau ψ) = fockTau (fockCP ψ) := by
    intro ψ; funext c; unfold fockCP fockTau
    rw [(thm_fock_honeycomb_config_symmetries c).2.2.2.2.2.2.2.2.1]
  exact thm_palindromic_beat_T_CP_CPT
    fockStream fockStreamDag
    (fockPhiOdd χ) (fockPhiOddDag χ)
    fockHalfCoin fockHalfCoinDag
    fockScale2Core fockScale2CoreDag
    fockTau fockCP
    fockStreamUnit.rightInv
    fockTau_involutive
    hTauS hTauPhi hTauD hTauCore
    fockCP_involutive
    hCPS hCPPhi hCPD hCPCore hCPTau

/-! ### Non-Vacuous 4-Vibe Chiral Witness (`[(0,+), (1,-), (4,+), (10,+)]`) -/

/-- Exact 4-vibe chiral quad `w = [(0,+), (1,-), (4,+), (10,+)]` from `test/universe.ts` (role `false`). -/
def chiralWitnessDock : FullDock
  | ⟨0, _⟩  => .occ .pos false
  | ⟨1, _⟩  => .occ .neg false
  | ⟨4, _⟩  => .occ .pos false
  | ⟨10, _⟩ => .occ .pos false
  | _       => .empty

private def toneSig (d : FullDock) : DockState := fullDockToDockState d

private def revSig (s : DockState) : DockState := fun i => s (oppSlot i)
private def pSig (s : DockState) : DockState := fun i => s (paritySlot i)
private def cpSig (s : DockState) : DockState := conjDock (pSig s)

private def witnessSig : DockState := toneSig chiralWitnessDock

private def isPosWitnessOrb (s : DockState) : Bool :=
  decide (s = witnessSig ∨ s = revSig witnessSig ∨ s = cpSig witnessSig ∨ s = revSig (cpSig witnessSig))

private def isNegWitnessOrb (s : DockState) : Bool :=
  decide (s = conjDock witnessSig ∨ s = revSig (conjDock witnessSig) ∨
          s = pSig witnessSig ∨ s = revSig (pSig witnessSig))

/-- Explicit concrete `C`-odd, `P`-odd, `CP`-even, `R`-even 4-vibe chiral witness invariant. -/
def witnessChiFn (d : FullDock) : Int :=
  if isPosWitnessOrb (toneSig d) then 1
  else if isNegWitnessOrb (toneSig d) then -1
  else 0

private theorem witness_orb_disjoint :
    isPosWitnessOrb (toneSig v1FullDock) = false ∧
    isNegWitnessOrb (toneSig v1FullDock) = false ∧
    isPosWitnessOrb witnessSig = true ∧
    isNegWitnessOrb witnessSig = false ∧
    isPosWitnessOrb (conjDock witnessSig) = false ∧
    isNegWitnessOrb (conjDock witnessSig) = true ∧
    isPosWitnessOrb (pSig witnessSig) = false ∧
    isNegWitnessOrb (pSig witnessSig) = true ∧
    isPosWitnessOrb (revSig witnessSig) = true ∧
    isNegWitnessOrb (revSig witnessSig) = false ∧
    isPosWitnessOrb (cpSig witnessSig) = true ∧
    isNegWitnessOrb (cpSig witnessSig) = false ∧
    isPosWitnessOrb (revSig (cpSig witnessSig)) = true ∧
    isNegWitnessOrb (revSig (cpSig witnessSig)) = false ∧
    isPosWitnessOrb (revSig (conjDock witnessSig)) = false ∧
    isNegWitnessOrb (revSig (conjDock witnessSig)) = true ∧
    isPosWitnessOrb (revSig (pSig witnessSig)) = false ∧
    isNegWitnessOrb (revSig (pSig witnessSig)) = true := by
  decide

private theorem revSig_inv (s : DockState) : revSig (revSig s) = s := by
  funext i; unfold revSig; rw [(thm_24_facets_geometry.2.1 i).1]

private theorem cpSig_inv (s : DockState) : cpSig (cpSig s) = s := by
  funext i; unfold cpSig conjDock pSig
  rw [(line_geom_facts.2.2.2.2.1 i).1]; cases s i <;> rfl

private theorem cpSig_revSig (s : DockState) : cpSig (revSig s) = revSig (cpSig s) := by
  funext i; unfold cpSig conjDock pSig revSig
  rw [(line_geom_facts.2.2.2.2.1 i).2]

private theorem cpSig_conjDock (s : DockState) : cpSig (conjDock s) = pSig s := by
  funext i; unfold cpSig conjDock pSig; cases s (paritySlot i) <;> rfl

private theorem cpSig_pSig (s : DockState) : cpSig (pSig s) = conjDock s := by
  funext i; unfold cpSig conjDock pSig; rw [(line_geom_facts.2.2.2.2.1 i).1]

/-- Concrete non-trivial `ChiralInvariant` constructed from the 4-vibe chiral quad `[(0,+),(1,-),(4,+),(10,+)]`. -/
def witnessChiralInvariant : ChiralInvariant where
  chi := witnessChiFn
  chi_v1 := by
    unfold witnessChiFn
    rw [witness_orb_disjoint.1, witness_orb_disjoint.2.1]; rfl
  chi_rev := fun d => by
    have hT : toneSig (revFullDock d) = revSig (toneSig d) := rfl
    unfold witnessChiFn; rw [hT]
    have hPos : isPosWitnessOrb (revSig (toneSig d)) = isPosWitnessOrb (toneSig d) := by
      unfold isPosWitnessOrb
      have hIff : (revSig (toneSig d) = witnessSig ∨ revSig (toneSig d) = revSig witnessSig ∨
            revSig (toneSig d) = cpSig witnessSig ∨ revSig (toneSig d) = revSig (cpSig witnessSig)) ↔
          (toneSig d = witnessSig ∨ toneSig d = revSig witnessSig ∨
            toneSig d = cpSig witnessSig ∨ toneSig d = revSig (cpSig witnessSig)) := by
        constructor
        · intro h
          rcases h with h1 | h2 | h3 | h4
          · exact Or.inr (Or.inl (by rw [← revSig_inv (toneSig d), h1]))
          · exact Or.inl (by rw [← revSig_inv (toneSig d), h2, revSig_inv])
          · exact Or.inr (Or.inr (Or.inr (by rw [← revSig_inv (toneSig d), h3])))
          · exact Or.inr (Or.inr (Or.inl (by rw [← revSig_inv (toneSig d), h4, revSig_inv])))
        · intro h
          rcases h with h1 | h2 | h3 | h4
          · exact Or.inr (Or.inl (by rw [h1]))
          · exact Or.inl (by rw [h2, revSig_inv])
          · exact Or.inr (Or.inr (Or.inr (by rw [h3])))
          · exact Or.inr (Or.inr (Or.inl (by rw [h4, revSig_inv])))
      if hp : toneSig d = witnessSig ∨ toneSig d = revSig witnessSig ∨
          toneSig d = cpSig witnessSig ∨ toneSig d = revSig (cpSig witnessSig) then
        rw [decide_eq_true (hIff.mpr hp), decide_eq_true hp]
      else
        rw [decide_eq_false (fun h => hp (hIff.mp h)), decide_eq_false hp]
    have hNeg : isNegWitnessOrb (revSig (toneSig d)) = isNegWitnessOrb (toneSig d) := by
      unfold isNegWitnessOrb
      have hIff : (revSig (toneSig d) = conjDock witnessSig ∨ revSig (toneSig d) = revSig (conjDock witnessSig) ∨
            revSig (toneSig d) = pSig witnessSig ∨ revSig (toneSig d) = revSig (pSig witnessSig)) ↔
          (toneSig d = conjDock witnessSig ∨ toneSig d = revSig (conjDock witnessSig) ∨
            toneSig d = pSig witnessSig ∨ toneSig d = revSig (pSig witnessSig)) := by
        constructor
        · intro h
          rcases h with h1 | h2 | h3 | h4
          · exact Or.inr (Or.inl (by rw [← revSig_inv (toneSig d), h1]))
          · exact Or.inl (by rw [← revSig_inv (toneSig d), h2, revSig_inv])
          · exact Or.inr (Or.inr (Or.inr (by rw [← revSig_inv (toneSig d), h3])))
          · exact Or.inr (Or.inr (Or.inl (by rw [← revSig_inv (toneSig d), h4, revSig_inv])))
        · intro h
          rcases h with h1 | h2 | h3 | h4
          · exact Or.inr (Or.inl (by rw [h1]))
          · exact Or.inl (by rw [h2, revSig_inv])
          · exact Or.inr (Or.inr (Or.inr (by rw [h3])))
          · exact Or.inr (Or.inr (Or.inl (by rw [h4, revSig_inv])))
      if hn : toneSig d = conjDock witnessSig ∨ toneSig d = revSig (conjDock witnessSig) ∨
          toneSig d = pSig witnessSig ∨ toneSig d = revSig (pSig witnessSig) then
        rw [decide_eq_true (hIff.mpr hn), decide_eq_true hn]
      else
        rw [decide_eq_false (fun h => hn (hIff.mp h)), decide_eq_false hn]
    rw [hPos, hNeg]
  chi_cp := fun d => by
    have hT : toneSig (cpFullDock d) = cpSig (toneSig d) := by
      funext i; unfold toneSig fullDockToDockState cpFullDock conjFullDock parityFullDock cpSig conjDock pSig
      cases d (paritySlot i) with
      | empty => rfl
      | occ s _ => cases s <;> rfl
    unfold witnessChiFn; rw [hT]
    have hPos : isPosWitnessOrb (cpSig (toneSig d)) = isPosWitnessOrb (toneSig d) := by
      unfold isPosWitnessOrb
      have hIff : (cpSig (toneSig d) = witnessSig ∨ cpSig (toneSig d) = revSig witnessSig ∨
            cpSig (toneSig d) = cpSig witnessSig ∨ cpSig (toneSig d) = revSig (cpSig witnessSig)) ↔
          (toneSig d = witnessSig ∨ toneSig d = revSig witnessSig ∨
            toneSig d = cpSig witnessSig ∨ toneSig d = revSig (cpSig witnessSig)) := by
        constructor
        · intro h
          rcases h with h1 | h2 | h3 | h4
          · exact Or.inr (Or.inr (Or.inl (by rw [← cpSig_inv (toneSig d), h1])))
          · exact Or.inr (Or.inr (Or.inr (by rw [← cpSig_inv (toneSig d), h2, cpSig_revSig])))
          · exact Or.inl (by rw [← cpSig_inv (toneSig d), h3, cpSig_inv])
          · exact Or.inr (Or.inl (by rw [← cpSig_inv (toneSig d), h4, cpSig_revSig, cpSig_inv]))
        · intro h
          rcases h with h1 | h2 | h3 | h4
          · exact Or.inr (Or.inr (Or.inl (by rw [h1])))
          · exact Or.inr (Or.inr (Or.inr (by rw [h2, cpSig_revSig])))
          · exact Or.inl (by rw [h3, cpSig_inv])
          · exact Or.inr (Or.inl (by rw [h4, cpSig_revSig, cpSig_inv]))
      if hp : toneSig d = witnessSig ∨ toneSig d = revSig witnessSig ∨
          toneSig d = cpSig witnessSig ∨ toneSig d = revSig (cpSig witnessSig) then
        rw [decide_eq_true (hIff.mpr hp), decide_eq_true hp]
      else
        rw [decide_eq_false (fun h => hp (hIff.mp h)), decide_eq_false hp]
    have hNeg : isNegWitnessOrb (cpSig (toneSig d)) = isNegWitnessOrb (toneSig d) := by
      unfold isNegWitnessOrb
      have hIff : (cpSig (toneSig d) = conjDock witnessSig ∨ cpSig (toneSig d) = revSig (conjDock witnessSig) ∨
            cpSig (toneSig d) = pSig witnessSig ∨ cpSig (toneSig d) = revSig (pSig witnessSig)) ↔
          (toneSig d = conjDock witnessSig ∨ toneSig d = revSig (conjDock witnessSig) ∨
            toneSig d = pSig witnessSig ∨ toneSig d = revSig (pSig witnessSig)) := by
        constructor
        · intro h
          rcases h with h1 | h2 | h3 | h4
          · exact Or.inr (Or.inr (Or.inl (by rw [← cpSig_inv (toneSig d), h1, cpSig_conjDock])))
          · exact Or.inr (Or.inr (Or.inr (by rw [← cpSig_inv (toneSig d), h2, cpSig_revSig, cpSig_conjDock])))
          · exact Or.inl (by rw [← cpSig_inv (toneSig d), h3, cpSig_pSig])
          · exact Or.inr (Or.inl (by rw [← cpSig_inv (toneSig d), h4, cpSig_revSig, cpSig_pSig]))
        · intro h
          rcases h with h1 | h2 | h3 | h4
          · exact Or.inr (Or.inr (Or.inl (by rw [h1, cpSig_conjDock])))
          · exact Or.inr (Or.inr (Or.inr (by rw [h2, cpSig_revSig, cpSig_conjDock])))
          · exact Or.inl (by rw [h3, cpSig_pSig])
          · exact Or.inr (Or.inl (by rw [h4, cpSig_revSig, cpSig_pSig]))
      if hn : toneSig d = conjDock witnessSig ∨ toneSig d = revSig (conjDock witnessSig) ∨
          toneSig d = pSig witnessSig ∨ toneSig d = revSig (pSig witnessSig) then
        rw [decide_eq_true (hIff.mpr hn), decide_eq_true hn]
      else
        rw [decide_eq_false (fun h => hn (hIff.mp h)), decide_eq_false hn]
    rw [hPos, hNeg]

/-- Single-dock configuration placing the 4-vibe chiral quad `chiralWitnessDock` at base cell `mat5Id`. -/
def chiralWitnessConfig : HoneycombConfig :=
  v1Config.setDock mat5Id chiralWitnessDock

/-- Headline Theorem 18 (Non-Vacuity of `Φ_odd`: Genuine Individual `C` and `P` Violation with Exact `CP / T / CPT`):
    on the concrete 4-vibe chiral state `|w₀⟩` at `mat5Id`, `Φ_odd` acts non-trivially (`+1 ↦ ζ_6`,
    `-1 ↦ ζ_6⁻¹`), proving `C ∘ Φ_odd ≠ Φ_odd ∘ C` and `P ∘ Φ_odd ≠ Φ_odd ∘ P` in `ℤ[ζ_9][1/6]`
    while `CP`, `T`, and `CPT` hold identically on the full 8-layer beat `fockBeat witnessChiralInvariant`. -/
theorem thm_fock_chiral_witness_C_P_violation :
    witnessChiralInvariant.chi chiralWitnessDock = 1 ∧
    witnessChiralInvariant.chi (conjFullDock chiralWitnessDock) = -1 ∧
    witnessChiralInvariant.chi (parityFullDock chiralWitnessDock) = -1 ∧
    fockChargeConj (fockPhiOdd witnessChiralInvariant (ket (R := NinthLoc6) chiralWitnessConfig)) ≠
      fockPhiOdd witnessChiralInvariant (fockChargeConj (ket (R := NinthLoc6) chiralWitnessConfig)) ∧
    fockParity (fockPhiOdd witnessChiralInvariant (ket (R := NinthLoc6) chiralWitnessConfig)) ≠
      fockPhiOdd witnessChiralInvariant (fockParity (ket (R := NinthLoc6) chiralWitnessConfig)) := by
  have hW1 : witnessChiralInvariant.chi chiralWitnessDock = 1 := by
    change witnessChiFn chiralWitnessDock = 1
    unfold witnessChiFn; rw [witness_orb_disjoint.2.2.1]; rfl
  have hWC : witnessChiralInvariant.chi (conjFullDock chiralWitnessDock) = -1 := by
    have hT : toneSig (conjFullDock chiralWitnessDock) = conjDock witnessSig := by
      funext i; unfold toneSig fullDockToDockState conjFullDock witnessSig conjDock
      cases chiralWitnessDock i with | empty => rfl | occ s _ => cases s <;> rfl
    change witnessChiFn (conjFullDock chiralWitnessDock) = -1
    unfold witnessChiFn; rw [hT, witness_orb_disjoint.2.2.2.2.1, witness_orb_disjoint.2.2.2.2.2.1]; rfl
  have hWP : witnessChiralInvariant.chi (parityFullDock chiralWitnessDock) = -1 := by
    have hT : toneSig (parityFullDock chiralWitnessDock) = pSig witnessSig := rfl
    change witnessChiFn (parityFullDock chiralWitnessDock) = -1
    unfold witnessChiFn; rw [hT, witness_orb_disjoint.2.2.2.2.2.2.1, witness_orb_disjoint.2.2.2.2.2.2.2.1]; rfl
  have hD0 : dockParity mat5Id = 1 := by
    unfold dockParity
    have hd : mat5Det mat5Id = ZSqrt2.one := by decide
    rw [hd]; rfl
  have hWNeV1 : chiralWitnessDock ≠ v1FullDock := by
    intro h0; have := congrFun h0 ⟨0, by decide⟩; exact SlotState.noConfusion this
  have hCWNeV1 : conjFullDock chiralWitnessDock ≠ v1FullDock := by
    intro h0; have := congrFun h0 ⟨0, by decide⟩; exact SlotState.noConfusion this
  have hPWNeV1 : parityFullDock chiralWitnessDock ≠ v1FullDock := by
    intro h0; have := congrFun h0 ⟨0, by decide⟩; exact SlotState.noConfusion this
  have hActW : chiralWitnessConfig.activeDocks = [mat5Id] := by
    unfold chiralWitnessConfig HoneycombConfig.setDock HoneycombConfig.activeDocks v1Config
    simp only [setEntries, ite_eq_right hWNeV1, List.map]
  have hActCW : (conjConfig chiralWitnessConfig).activeDocks = [mat5Id] := by
    have hEq : conjConfig chiralWitnessConfig = v1Config.setDock mat5Id (conjFullDock chiralWitnessDock) := by
      apply honeycombConfig_ext; intro g
      rw [lookup_conjConfig, lookup_setDock]
      unfold chiralWitnessConfig; rw [lookup_setDock]
      if hg : g = mat5Id then simp only [ite_eq_left hg] else simp only [ite_eq_right hg]; rfl
    rw [hEq]
    unfold HoneycombConfig.setDock HoneycombConfig.activeDocks v1Config
    simp only [setEntries, ite_eq_right hCWNeV1, List.map]
  have hConjId : conjMatP mat5Id = mat5Id := by
    unfold conjMatP
    rw [fb_mat5Mul_id_right, thm_fock_coxeter_parity_equivariance.1]
  have hActPW : (parityConfig chiralWitnessConfig).activeDocks = [mat5Id] := by
    have hEq : parityConfig chiralWitnessConfig = v1Config.setDock mat5Id (parityFullDock chiralWitnessDock) := by
      apply honeycombConfig_ext; intro g
      rw [lookup_parityConfig, lookup_setDock]
      unfold chiralWitnessConfig; rw [lookup_setDock]
      if hg : g = mat5Id then simp only [ite_eq_left hg, hg, hConjId, ite_eq_left rfl]
      else
        have hne : conjMatP g ≠ mat5Id := fun e => hg (by rw [← conjMatP_involutive g, e, hConjId])
        simp only [ite_eq_right hg, ite_eq_right hne]; rfl
    rw [hEq]
    unfold HoneycombConfig.setDock HoneycombConfig.activeDocks v1Config
    simp only [setEntries, ite_eq_right hPWNeV1, List.map]
  have hZetaNe : NinthLoc6.zeta6 ≠ NinthLoc6.neg NinthLoc6.omega :=
    NinthLoc6.ne_of_raw_ne ⟨1, 0, 0, 1, 0, 0⟩ ⟨0, 0, 0, -1, 0, 0⟩ (by decide)
  have hmod1 : (1 * 1 : Int) % 6 = 1 := by decide
  have hmod2 : (1 * -1 : Int) % 6 = 5 := by decide
  have hZ1 : NinthLoc6.zeta6Pow (1 * 1) = NinthLoc6.zeta6 := by
    unfold NinthLoc6.zeta6Pow; rw [hmod1]
  have hZ2 : NinthLoc6.zeta6Pow (1 * -1) = NinthLoc6.neg NinthLoc6.omega := by
    unfold NinthLoc6.zeta6Pow; rw [hmod2]
  have hLkW : chiralWitnessConfig.lookup mat5Id = chiralWitnessDock := by
    unfold chiralWitnessConfig; rw [lookup_setDock, ite_eq_left rfl]
  have hCViol : fockChargeConj (fockPhiOdd witnessChiralInvariant (ket (R := NinthLoc6) chiralWitnessConfig)) ≠
      fockPhiOdd witnessChiralInvariant (fockChargeConj (ket (R := NinthLoc6) chiralWitnessConfig)) := by
    intro hEq
    have hAt := congrFun hEq (conjConfig chiralWitnessConfig)
    change globalOp (phiOddFamily witnessChiralInvariant) (ket (R := NinthLoc6) chiralWitnessConfig)
        (conjConfig (conjConfig chiralWitnessConfig)) =
      globalOp (phiOddFamily witnessChiralInvariant)
        (fockChargeConj (ket (R := NinthLoc6) chiralWitnessConfig)) (conjConfig chiralWitnessConfig) at hAt
    rw [(thm_fock_honeycomb_config_symmetries chiralWitnessConfig).2.2.2.2.1] at hAt
    unfold globalOp at hAt
    rw [hActW, hActCW] at hAt
    simp only [applySites, phiOddFamily] at hAt
    rw [sitePhiOddUnit_op, sitePhiOddUnit_op] at hAt
    have hKetL : ket (R := NinthLoc6) chiralWitnessConfig chiralWitnessConfig = NinthLoc6.one := by
      rw [ket_nloc, ite_eq_left rfl]
    have hKetR : fockChargeConj (ket (R := NinthLoc6) chiralWitnessConfig) (conjConfig chiralWitnessConfig) =
        NinthLoc6.one := by
      unfold fockChargeConj
      rw [(thm_fock_honeycomb_config_symmetries chiralWitnessConfig).2.2.2.2.1, ket_nloc, ite_eq_left rfl]
    have hLkCW : (conjConfig chiralWitnessConfig).lookup mat5Id = conjFullDock chiralWitnessDock := by
      rw [lookup_conjConfig, hLkW]
    rw [hKetL, hKetR, hLkW, hLkCW, hD0, hW1, hWC, NinthLoc6.mul_one, NinthLoc6.mul_one, hZ1, hZ2] at hAt
    exact hZetaNe hAt
  have hPViol : fockParity (fockPhiOdd witnessChiralInvariant (ket (R := NinthLoc6) chiralWitnessConfig)) ≠
      fockPhiOdd witnessChiralInvariant (fockParity (ket (R := NinthLoc6) chiralWitnessConfig)) := by
    intro hEq
    have hAt := congrFun hEq (parityConfig chiralWitnessConfig)
    change globalOp (phiOddFamily witnessChiralInvariant) (ket (R := NinthLoc6) chiralWitnessConfig)
        (parityConfig (parityConfig chiralWitnessConfig)) =
      globalOp (phiOddFamily witnessChiralInvariant)
        (fockParity (ket (R := NinthLoc6) chiralWitnessConfig)) (parityConfig chiralWitnessConfig) at hAt
    rw [(thm_fock_honeycomb_config_symmetries chiralWitnessConfig).2.2.2.2.2.1] at hAt
    unfold globalOp at hAt
    rw [hActW, hActPW] at hAt
    simp only [applySites, phiOddFamily] at hAt
    rw [sitePhiOddUnit_op, sitePhiOddUnit_op] at hAt
    have hKetL : ket (R := NinthLoc6) chiralWitnessConfig chiralWitnessConfig = NinthLoc6.one := by
      rw [ket_nloc, ite_eq_left rfl]
    have hKetR : fockParity (ket (R := NinthLoc6) chiralWitnessConfig) (parityConfig chiralWitnessConfig) =
        NinthLoc6.one := by
      unfold fockParity
      rw [(thm_fock_honeycomb_config_symmetries chiralWitnessConfig).2.2.2.2.2.1, ket_nloc, ite_eq_left rfl]
    have hLkPW : (parityConfig chiralWitnessConfig).lookup mat5Id = parityFullDock chiralWitnessDock := by
      rw [lookup_parityConfig, hConjId, hLkW]
    rw [hKetL, hKetR, hLkW, hLkPW, hD0, hW1, hWP, NinthLoc6.mul_one, NinthLoc6.mul_one, hZ1, hZ2] at hAt
    exact hZetaNe hAt
  exact ⟨hW1, hWC, hWP, hCViol, hPViol⟩

end Vibe
