import Vibe.Algebra
import Vibe.Geometry

/-!
# Vibe Theory: Exact `O^+(4,1; ℤ[√2])` Coxeter Transport Algebra & Palindromic `T / CP / CPT`

Zero-dependency Lean 4 formalization of the exact `5 × 5` Coxeter group geometry of the
infinite `{3,4,3,4}` hyperbolic honeycomb over `ℤ[√2]` (`code/substrate/coxeter/exact-3434.ts`,
`code/substrate/coxeter/exact-cusp.ts`, roadmap `vibe-roadmap-board-0053`):

1. **Exact Ring `ℤ[√2]` & `5 × 5` Matrix Algebra:** Full ring laws for `ZSqrt2` (`a + b √2`),
   `Mat5` associativity, transpose anti-homomorphism, and exact 80-multiplication Laplace `det`.
2. **Exact `{3,4,3,4}` Lorentzian Form `2 B` & Cell Symmetry:**
   - `twiceGram` (`2` diagonal, `-1` for label `3`, `-√2` for label `4`) with `det(2 B) = -2`,
   - `baseCenter` `c_0 = (2, 4, 3√2, 2√2, 1)` with `2 B(c_0, c_0) = -2`,
   - `cuspVertex` `v = (0, 1, √2, √2, 1)` with `2 B(v, v) = 0`, `2 B(c_0, v) = -2`,
   - `centralInversion` `Z` (`Z x = -x + 2 x_4 c_0`) with `Z^2 = I_5`, `Z^T (2 B) Z = 2 B`,
     `det(Z) = +1`, `Z c_0 = c_0`, commuting with all four base-cell mirrors `s_0..s_3`.
3. **All 24 Facet Normals & Transports `k_a = F_a Z` (in exact `rootsD4()` order):**
   - Exact Gram isomorphism: `2 B(n_a - c_0, n_b - c_0) = 2 (r_a · r_b)` across all `24 × 24 = 576` pairs.
   - **Lorentzian Preservation:** `k_a^T (2 B) k_a = 2 B` for all 24 slots (and EVERY finite word `w`!).
   - **Orthochronous Sheet:** `2 B(k_a c_0, c_0) = -6 < 0` for all 24 slots (`k_a ∈ O^+(4,1; ℤ[√2])`).
   - **Improper Isometry:** `det(k_a) = -1` for all 24 slots (`k_a ∈ O^+(4,1; ℤ[√2]) \ SO^+(4,1)`).
   - **Exact Antipodal Inverse:** `k_a * k_{opp(a)} = I_5` for all 24 slots (and EVERY finite word `w`!).
   - **Infinite-Honeycomb Stream Reversal:** Exact `S R S = R` unconditionally on the ENTIRE
     infinite `{3,4,3,4}` honeycomb (`∀ ψ g a, honeycombStream (slotReverse (honeycombStream ψ)) g a = slotReverse ψ g a`).
   - **Cusp Dock-0 Split:** Exact `[0, 6, 18]` up/lateral/down split (`6` at `-2`, `12` at `-6`, `6` at `-10`),
     matching `F_1(1, 0, 0, 0) = 7/15` in `Vibe.SchurGap`.
4. **Palindromic Algebraic `T`, `CP`, and `CPT` Symmetry Theorem:**
   For ANY palindromic beat `U = S ∘ L_1 ∘ L_2 ∘ M ∘ L_2 ∘ L_1` whose stream obeys `S R S = R`,
   defining `T = S ∘ τ` yields `T^2 = I`, `T U T = U†`, `CP U = U CP`, and `(CP ∘ T) U (CP ∘ T) = U†`.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 1: Exact Quadratic Integer Ring `ℤ[√2]` -/

/-- Exact quadratic integer `a + b √2 ∈ ℤ[√2]`. -/
structure ZSqrt2 where
  a : Int
  b : Int
  deriving DecidableEq, Repr

namespace ZSqrt2

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

private theorem add_zero (x : ZSqrt2) : add x zero = x := by
  cases x; simp only [add, zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem zero_add (x : ZSqrt2) : add zero x = x := by
  cases x; simp only [add, zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem add_comm (x y : ZSqrt2) : add x y = add y x := by
  cases x; cases y; simp only [add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem add_assoc (x y z : ZSqrt2) : add (add x y) z = add x (add y z) := by
  cases x; cases y; cases z; simp only [add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem sub_add_cancel (x y : ZSqrt2) : add (sub x y) y = x := by
  cases x; cases y; simp only [add, sub, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem sub_self (x : ZSqrt2) : sub x x = zero := by
  cases x; simp only [sub, zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem sub_zero (x : ZSqrt2) : sub x zero = x := by
  cases x; simp only [sub, zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem zero_sub (x : ZSqrt2) : sub zero x = neg x := by
  cases x; simp only [sub, zero, neg, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem add_sub_assoc (x y z : ZSqrt2) : sub (add x y) z = add x (sub y z) := by
  cases x; cases y; cases z; simp only [add, sub, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem sub_sub (x y z : ZSqrt2) : sub (sub x y) z = sub x (add y z) := by
  cases x; cases y; cases z; simp only [add, sub, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem add_sub_sub_add (a b c d : ZSqrt2) :
    add (sub a b) (sub c d) = sub (add a c) (add b d) := by
  cases a; cases b; cases c; cases d; simp only [add, sub, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem mul_zero (x : ZSqrt2) : mul x zero = zero := by
  cases x; simp only [mul, zero, ZSqrt2.mk.injEq, Int.mul_zero]; exact ⟨by omega, by omega⟩

private theorem zero_mul (x : ZSqrt2) : mul zero x = zero := by
  cases x; simp only [mul, zero, ZSqrt2.mk.injEq, Int.zero_mul, Int.mul_zero]; exact ⟨by omega, by omega⟩

private theorem mul_one (x : ZSqrt2) : mul x one = x := by
  cases x; simp only [mul, one, ZSqrt2.mk.injEq, Int.mul_one, Int.mul_zero]; exact ⟨by omega, by omega⟩

private theorem one_mul (x : ZSqrt2) : mul one x = x := by
  cases x; simp only [mul, one, ZSqrt2.mk.injEq, Int.one_mul, Int.zero_mul, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem mul_two (x : ZSqrt2) : mul x two = add x x := by
  cases x; simp only [mul, two, add, ZSqrt2.mk.injEq, Int.mul_zero]; exact ⟨by omega, by omega⟩

private theorem mul_comm (x y : ZSqrt2) : mul x y = mul y x := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [mul, ZSqrt2.mk.injEq]
  rw [Int.mul_comm xa ya, Int.mul_comm xa yb, Int.mul_comm xb ya,
      Int.mul_assoc 2 xb yb, Int.mul_comm xb yb, ← Int.mul_assoc 2 yb xb]
  exact ⟨by omega, by omega⟩

private theorem mul_add (x y z : ZSqrt2) : mul x (add y z) = add (mul x y) (mul x z) := by
  cases x; cases y; cases z
  simp only [mul, add, ZSqrt2.mk.injEq, Int.mul_add]
  exact ⟨by omega, by omega⟩

private theorem add_mul (x y z : ZSqrt2) : mul (add x y) z = add (mul x z) (mul y z) := by
  cases x; cases y; cases z
  simp only [mul, add, ZSqrt2.mk.injEq, Int.add_mul, Int.mul_add]
  exact ⟨by omega, by omega⟩

private theorem mul_sub (x y z : ZSqrt2) : mul x (sub y z) = sub (mul x y) (mul x z) := by
  cases x; cases y; cases z
  simp only [mul, sub, ZSqrt2.mk.injEq, Int.mul_sub]
  exact ⟨by omega, by omega⟩

private theorem sub_mul (x y z : ZSqrt2) : mul (sub x y) z = sub (mul x z) (mul y z) := by
  cases x; cases y; cases z
  simp only [mul, sub, ZSqrt2.mk.injEq, Int.sub_mul, Int.mul_sub]
  exact ⟨by omega, by omega⟩

private theorem mul_assoc (x y z : ZSqrt2) : mul (mul x y) z = mul x (mul y z) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  cases z with | mk za zb =>
  simp only [mul, ZSqrt2.mk.injEq, Int.add_mul, Int.mul_add, Int.mul_assoc]
  have h1 : xa * (2 * (yb * zb)) = 2 * (xa * (yb * zb)) := by
    rw [← Int.mul_assoc xa 2 (yb * zb), Int.mul_comm xa 2, Int.mul_assoc 2 xa (yb * zb)]
  have h2 : xb * (2 * (yb * zb)) = 2 * (xb * (yb * zb)) := by
    rw [← Int.mul_assoc xb 2 (yb * zb), Int.mul_comm xb 2, Int.mul_assoc 2 xb (yb * zb)]
  rw [h1, h2]
  exact ⟨by omega, by omega⟩

private theorem sub_two_add_two (a b : ZSqrt2) :
    add (sub (sub a b) b) (add b b) = a := by
  cases a; cases b; simp only [add, sub, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem sub_sub_rearrange (p q r s : ZSqrt2) :
    sub (sub p q) (sub r s) = add (sub (sub p q) r) s := by
  cases p; cases q; cases r; cases s
  simp only [add, sub, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem mul_neg (x y : ZSqrt2) : mul x (neg y) = neg (mul x y) := by
  cases x; cases y
  simp only [mul, neg, ZSqrt2.mk.injEq, Int.mul_neg]
  exact ⟨by omega, by omega⟩

private theorem neg_sub (x y : ZSqrt2) : neg (sub x y) = sub y x := by
  cases x; cases y
  simp only [neg, sub, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem scale2_eq_mul_two (x : ZSqrt2) : scale 2 x = mul two x := by
  cases x
  simp only [scale, mul, two, ZSqrt2.mk.injEq, Int.zero_mul, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem sub_mul_neg2 (c n : ZSqrt2) :
    sub c (mul n (ofInt (-2))) = add c (scale 2 n) := by
  cases c; cases n with | mk na nb =>
  simp only [sub, add, mul, ofInt, scale, ZSqrt2.mk.injEq, Int.mul_zero, Int.mul_neg]
  rw [Int.mul_comm na 2, Int.mul_comm nb 2]
  exact ⟨by omega, by omega⟩

private theorem sub_sub_swap_add (a b c d : ZSqrt2) :
    sub (sub a b) (sub c d) = sub (add a (sub d c)) b := by
  cases a; cases b; cases c; cases d
  simp only [add, sub, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem transport_col4_rearrange (c n r4 id4 : ZSqrt2) :
    sub (sub (scale 2 c) id4) (sub (mul n (ofInt (-4))) (mul n r4)) =
      sub (add (scale 2 c) (mul n (add ⟨4, 0⟩ r4))) id4 := by
  have hDiff : sub (mul n r4) (mul n (ofInt (-4))) = mul n (add ⟨4, 0⟩ r4) := by
    rw [← mul_sub]
    apply congrArg (mul n)
    cases r4
    simp only [sub, add, ofInt, ZSqrt2.mk.injEq]
    exact ⟨by omega, by omega⟩
  rw [sub_sub_swap_add, hDiff]

private theorem add_negOne_scale2 (x : ZSqrt2) :
    add negOne (scale 2 x) = sub (scale 2 x) one := by
  cases x
  simp only [add, sub, scale, negOne, one, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem add_zero_scale2 (x : ZSqrt2) :
    add zero (scale 2 x) = sub (scale 2 x) zero := by
  cases x
  simp only [add, sub, scale, zero, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem mul_sub_neg_rearrange (a b c : ZSqrt2) :
    mul (sub a b) (neg c) = sub (mul b c) (mul a c) := by
  rw [mul_neg, sub_mul, neg_sub]

end ZSqrt2


/-! ## Section 2: `5 × 5` Matrices & Vectors over `ℤ[√2]` -/

/-- Exact 5-vector over `ℤ[√2]`. -/
abbrev Vec5 := Fin 5 → ZSqrt2

/-- Exact `5 × 5` matrix over `ℤ[√2]`. -/
abbrev Mat5 := Fin 5 → Fin 5 → ZSqrt2

/-- Flat 5-term sum over `Fin 5` in `ℤ[√2]`. -/
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

private theorem vec5_ext (u v : Vec5) (h : ∀ i : Fin 5, u i = v i) : u = v :=
  funext h

private theorem mat5_ext (A B : Mat5) (h : ∀ i j : Fin 5, A i j = B i j) : A = B :=
  funext (fun i => funext (fun j => h i j))

private theorem sum5_add_aux (f0 f1 f2 f3 f4 g0 g1 g2 g3 g4 : ZSqrt2) :
    ZSqrt2.add
      (ZSqrt2.add
        (ZSqrt2.add
          (ZSqrt2.add (ZSqrt2.add f0 g0) (ZSqrt2.add f1 g1))
          (ZSqrt2.add f2 g2))
        (ZSqrt2.add f3 g3))
      (ZSqrt2.add f4 g4) =
    ZSqrt2.add
      (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add f0 f1) f2) f3) f4)
      (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add g0 g1) g2) g3) g4) := by
  have swap4 : ∀ a b c d : ZSqrt2,
      ZSqrt2.add (ZSqrt2.add a b) (ZSqrt2.add c d) = ZSqrt2.add (ZSqrt2.add a c) (ZSqrt2.add b d) := by
    intro a b c d
    rw [ZSqrt2.add_assoc a b (ZSqrt2.add c d), ← ZSqrt2.add_assoc b c d, ZSqrt2.add_comm b c,
        ZSqrt2.add_assoc c b d, ← ZSqrt2.add_assoc a c (ZSqrt2.add b d)]
  rw [swap4 f0 g0 f1 g1,
      swap4 (ZSqrt2.add f0 f1) (ZSqrt2.add g0 g1) f2 g2,
      swap4 (ZSqrt2.add (ZSqrt2.add f0 f1) f2) (ZSqrt2.add (ZSqrt2.add g0 g1) g2) f3 g3,
      swap4 (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add f0 f1) f2) f3)
            (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add g0 g1) g2) g3) f4 g4]

private theorem sum5_add (f g : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.add (f k) (g k)) = ZSqrt2.add (sum5 f) (sum5 g) :=
  sum5_add_aux
    (f ⟨0, by decide⟩) (f ⟨1, by decide⟩) (f ⟨2, by decide⟩) (f ⟨3, by decide⟩) (f ⟨4, by decide⟩)
    (g ⟨0, by decide⟩) (g ⟨1, by decide⟩) (g ⟨2, by decide⟩) (g ⟨3, by decide⟩) (g ⟨4, by decide⟩)

private theorem sum5_sub (f g : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.sub (f k) (g k)) = ZSqrt2.sub (sum5 f) (sum5 g) := by
  unfold sum5
  rw [ZSqrt2.add_sub_sub_add, ZSqrt2.add_sub_sub_add, ZSqrt2.add_sub_sub_add, ZSqrt2.add_sub_sub_add]

private theorem sum5_mul_left (c : ZSqrt2) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul c (f k)) = ZSqrt2.mul c (sum5 f) := by
  unfold sum5
  rw [ZSqrt2.mul_add, ZSqrt2.mul_add, ZSqrt2.mul_add, ZSqrt2.mul_add]

private theorem sum5_mul_right (f : Fin 5 → ZSqrt2) (c : ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (f k) c) = ZSqrt2.mul (sum5 f) c := by
  unfold sum5
  rw [ZSqrt2.add_mul, ZSqrt2.add_mul, ZSqrt2.add_mul, ZSqrt2.add_mul]

private theorem sum5_comm (f : Fin 5 → Fin 5 → ZSqrt2) :
    sum5 (fun i => sum5 (fun j => f i j)) = sum5 (fun j => sum5 (fun i => f i j)) := by
  change sum5 (fun i => sum5 (fun j => f i j)) =
    ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add
      (sum5 (fun i => f i ⟨0, by decide⟩))
      (sum5 (fun i => f i ⟨1, by decide⟩)))
      (sum5 (fun i => f i ⟨2, by decide⟩)))
      (sum5 (fun i => f i ⟨3, by decide⟩)))
      (sum5 (fun i => f i ⟨4, by decide⟩))
  rw [← sum5_add, ← sum5_add, ← sum5_add, ← sum5_add]
  rfl

private theorem sum5_kron_left (i : Fin 5) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (mat5Id i k) (f k)) = f i := by
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp [sum5, mat5Id, ZSqrt2.one_mul, ZSqrt2.zero_mul, ZSqrt2.add_zero, ZSqrt2.zero_add]

private theorem sum5_kron_right (j : Fin 5) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (f k) (mat5Id k j)) = f j := by
  match j with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp [sum5, mat5Id, ZSqrt2.mul_one, ZSqrt2.mul_zero, ZSqrt2.add_zero, ZSqrt2.zero_add]

private theorem mat5Mul_id_left (A : Mat5) : mat5Mul mat5Id A = A := by
  apply mat5_ext
  intro i j
  exact sum5_kron_left i (fun k => A k j)

private theorem mat5Mul_id_right (A : Mat5) : mat5Mul A mat5Id = A := by
  apply mat5_ext
  intro i j
  exact sum5_kron_right j (fun k => A i k)

private theorem mat5Mul_assoc (A B C : Mat5) : mat5Mul (mat5Mul A B) C = mat5Mul A (mat5Mul B C) := by
  apply mat5_ext
  intro i j
  unfold mat5Mul
  have hL : sum5 (fun k => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (A i m) (B m k))) (C k j)) =
      sum5 (fun k => sum5 (fun m => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (C k j)))) := by
    apply congrArg sum5
    funext k
    rw [← sum5_mul_right]
    apply congrArg sum5
    funext m
    exact ZSqrt2.mul_assoc (A i m) (B m k) (C k j)
  have hR : sum5 (fun m => ZSqrt2.mul (A i m) (sum5 (fun k => ZSqrt2.mul (B m k) (C k j)))) =
      sum5 (fun m => sum5 (fun k => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (C k j)))) := by
    apply congrArg sum5
    funext m
    rw [← sum5_mul_left]
  rw [hL, sum5_comm, hR]

private theorem mat5Transpose_mul (A B : Mat5) :
    mat5Transpose (mat5Mul A B) = mat5Mul (mat5Transpose B) (mat5Transpose A) := by
  apply mat5_ext
  intro i j
  unfold mat5Transpose mat5Mul
  apply congrArg sum5
  funext k
  exact ZSqrt2.mul_comm (A j k) (B k i)

private theorem mat5Vec_mul (A B : Mat5) (v : Vec5) :
    mat5Vec (mat5Mul A B) v = mat5Vec A (mat5Vec B v) := by
  apply vec5_ext
  intro i
  unfold mat5Vec mat5Mul
  have hL : sum5 (fun k => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (A i m) (B m k))) (v k)) =
      sum5 (fun k => sum5 (fun m => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (v k)))) := by
    apply congrArg sum5
    funext k
    rw [← sum5_mul_right]
    apply congrArg sum5
    funext m
    exact ZSqrt2.mul_assoc (A i m) (B m k) (v k)
  have hR : sum5 (fun m => ZSqrt2.mul (A i m) (sum5 (fun k => ZSqrt2.mul (B m k) (v k)))) =
      sum5 (fun m => sum5 (fun k => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (v k)))) := by
    apply congrArg sum5
    funext m
    rw [← sum5_mul_left]
  rw [hL, sum5_comm, hR]

/-- Exact `5 × 5` determinant over `ℤ[√2]` via shared-minor `(2 × 2) × (3 × 3)` Laplace expansion
    along rows `(0, 1)` and `(2, 3, 4)` (80 `ZSqrt2.mul` operations, algebraically identical to
    the 120-term Leibniz determinant). -/
def det2Z2 (a b c d : ZSqrt2) : ZSqrt2 :=
  ZSqrt2.sub (ZSqrt2.mul a d) (ZSqrt2.mul b c)

def mat5Det (M : Mat5) : ZSqrt2 :=
  let i0 : Fin 5 := ⟨0, by decide⟩
  let i1 : Fin 5 := ⟨1, by decide⟩
  let i2 : Fin 5 := ⟨2, by decide⟩
  let i3 : Fin 5 := ⟨3, by decide⟩
  let i4 : Fin 5 := ⟨4, by decide⟩
  -- 10 shared 2x2 minors of rows (3, 4)
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
  -- 10 complementary 3x3 minors of rows (2, 3, 4)
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
  -- 10 2x2 minors of rows (0, 1)
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
  -- Signed Laplace sum: (-1)^(c1 + c2 + 1)
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


/-! ## Section 3: Exact `{3,4,3,4}` Coxeter Form `2 B`, Base Center `c_0`, Cusp `v` & Inversion `Z` -/

/-- Exact doubled Coxeter Gram matrix `2 B` for `[3,4,3,4]` (`0 -3- 1 -4- 2 -3- 3 -4- 4`):
    `2` on the diagonal, `-1` for label `3`, `-√2` for label `4`, `0` elsewhere (`det(2 B) = -2`). -/
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
  apply vec5_ext
  intro i
  cases h0 : v ⟨0, by decide⟩ with | mk a0 b0 =>
  cases h1 : v ⟨1, by decide⟩ with | mk a1 b1 =>
  cases h2 : v ⟨2, by decide⟩ with | mk a2 b2 =>
  cases h3 : v ⟨3, by decide⟩ with | mk a3 b3 =>
  cases h4 : v ⟨4, by decide⟩ with | mk a4 b4 =>
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp only [mat5Vec, twiceGramVecFast, sum5, twiceGram, h0, h1, h2, h3, h4,
      ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2, ZSqrt2.mk.injEq,
      Int.zero_mul, Int.one_mul, Int.mul_zero, Int.mul_one, Int.neg_mul, Int.mul_neg]
    exact ⟨by omega, by omega⟩

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

/-- Exact point inversion `Z` of the base 24-cell (longest central element of `W(F_4) = ⟨s_0..s_3⟩`):
    `Z x = -x + 2 x_4 c_0`. -/
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
  refine ⟨mat5_ext _ _ (by decide), by decide, by decide, by decide, by decide⟩

/-- Exact central-inversion `Z` certificate:
    `Z^2 = I_5`, `Z^T (2 B) Z = 2 B`, `det(Z) = +1`, `Z c_0 = c_0`, and `Z` commutes with all 4
    base-cell mirrors `s_0..s_3` of `W(F_4)`. -/
theorem thm_central_inversion_properties :
    mat5Mul centralInversion centralInversion = mat5Id ∧
    mat5Mul (mat5Transpose centralInversion) (mat5Mul twiceGram centralInversion) = twiceGram ∧
    mat5Det centralInversion = ZSqrt2.one ∧
    mat5Vec centralInversion baseCenter = baseCenter ∧
    (∀ k : Fin 4,
      mat5Mul (simpleRefl ⟨k.val, Nat.lt_trans k.isLt (by decide)⟩) centralInversion =
        mat5Mul centralInversion (simpleRefl ⟨k.val, Nat.lt_trans k.isLt (by decide)⟩)) := by
  refine ⟨mat5_ext _ _ (by decide), mat5_ext _ _ (by decide), by decide,
    vec5_ext _ _ (by decide), ?_⟩
  intro k
  exact mat5_ext _ _ ((by decide : ∀ (x : Fin 4) (i j : Fin 5),
    mat5Mul (simpleRefl ⟨x.val, Nat.lt_trans x.isLt (by decide)⟩) centralInversion i j =
      mat5Mul centralInversion (simpleRefl ⟨x.val, Nat.lt_trans x.isLt (by decide)⟩) i j) k)


/-! ## Section 4: General Symbolic `O(4,1; ℤ[√2])` Reflection & Conjugation Algebra -/

/-- Group closure of Lorentzian form preservation under matrix multiplication. -/
theorem thm_orth_group_mul (A B : Mat5)
    (hA : mat5Mul (mat5Transpose A) (mat5Mul twiceGram A) = twiceGram)
    (hB : mat5Mul (mat5Transpose B) (mat5Mul twiceGram B) = twiceGram) :
    mat5Mul (mat5Transpose (mat5Mul A B)) (mat5Mul twiceGram (mat5Mul A B)) = twiceGram := by
  rw [mat5Transpose_mul, ← mat5Mul_assoc, mat5Mul_assoc (mat5Transpose B) (mat5Transpose A) twiceGram]
  rw [mat5Mul_assoc (mat5Transpose B) (mat5Mul (mat5Transpose A) twiceGram) (mat5Mul A B)]
  rw [← mat5Mul_assoc (mat5Mul (mat5Transpose A) twiceGram) A B]
  rw [mat5Mul_assoc (mat5Transpose A) twiceGram A, hA, hB]

/-- Symbolic reflection involution theorem: for EVERY root `n : Vec5` with `2 B(n, n) = 2`,
    `F_n * F_n = I_5`. -/
theorem thm_reflection_involution (n : Vec5) (hn : twiceForm n n = ZSqrt2.two) :
    mat5Mul (reflectionIn n) (reflectionIn n) = mat5Id := by
  apply mat5_ext
  intro i j
  let r := mat5Vec twiceGram n
  have hDot : sum5 (fun k => ZSqrt2.mul (r k) (n k)) = ZSqrt2.two := by
    have hc : sum5 (fun k => ZSqrt2.mul (r k) (n k)) = sum5 (fun k => ZSqrt2.mul (n k) (r k)) := by
      apply congrArg sum5; funext k; exact ZSqrt2.mul_comm (r k) (n k)
    rw [hc]
    exact hn
  unfold mat5Mul reflectionIn
  have hExpand : ∀ k : Fin 5,
      ZSqrt2.mul (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (n i) (r k)))
                 (ZSqrt2.sub (mat5Id k j) (ZSqrt2.mul (n k) (r j))) =
      ZSqrt2.add
        (ZSqrt2.sub
          (ZSqrt2.sub (ZSqrt2.mul (mat5Id i k) (mat5Id k j))
                      (ZSqrt2.mul (mat5Id i k) (ZSqrt2.mul (n k) (r j))))
          (ZSqrt2.mul (ZSqrt2.mul (n i) (r k)) (mat5Id k j)))
        (ZSqrt2.mul (ZSqrt2.mul (n i) (ZSqrt2.mul (r k) (n k))) (r j)) := by
    intro k
    rw [ZSqrt2.sub_mul, ZSqrt2.mul_sub, ZSqrt2.mul_sub]
    have hQuad : ZSqrt2.mul (ZSqrt2.mul (n i) (r k)) (ZSqrt2.mul (n k) (r j)) =
        ZSqrt2.mul (ZSqrt2.mul (n i) (ZSqrt2.mul (r k) (n k))) (r j) := by
      rw [ZSqrt2.mul_assoc (n i) (r k) (ZSqrt2.mul (n k) (r j)),
          ← ZSqrt2.mul_assoc (r k) (n k) (r j),
          ← ZSqrt2.mul_assoc (n i) (ZSqrt2.mul (r k) (n k)) (r j)]
    rw [hQuad]
    exact ZSqrt2.sub_sub_rearrange _ _ _ _
  have hFun :
      (fun k => ZSqrt2.mul (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (n i) (r k)))
                           (ZSqrt2.sub (mat5Id k j) (ZSqrt2.mul (n k) (r j)))) =
      (fun k => ZSqrt2.add
        (ZSqrt2.sub
          (ZSqrt2.sub (ZSqrt2.mul (mat5Id i k) (mat5Id k j))
                      (ZSqrt2.mul (mat5Id i k) (ZSqrt2.mul (n k) (r j))))
          (ZSqrt2.mul (ZSqrt2.mul (n i) (r k)) (mat5Id k j)))
        (ZSqrt2.mul (ZSqrt2.mul (n i) (ZSqrt2.mul (r k) (n k))) (r j))) :=
    funext hExpand
  change sum5 (fun k => ZSqrt2.mul (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (n i) (r k)))
                                   (ZSqrt2.sub (mat5Id k j) (ZSqrt2.mul (n k) (r j)))) = mat5Id i j
  rw [hFun, sum5_add, sum5_sub, sum5_sub]
  rw [sum5_kron_left i (fun k => mat5Id k j),
      sum5_kron_left i (fun k => ZSqrt2.mul (n k) (r j)),
      sum5_kron_right j (fun k => ZSqrt2.mul (n i) (r k)),
      sum5_mul_right, sum5_mul_left, hDot, ZSqrt2.mul_two, ZSqrt2.add_mul]
  exact ZSqrt2.sub_two_add_two (mat5Id i j) (ZSqrt2.mul (n i) (r j))

/-- Symbolic reflection Lorentz-isometry theorem: for EVERY root `n : Vec5` with `2 B(n, n) = 2`,
    `F_n^T (2 B) F_n = 2 B`. -/
theorem thm_reflection_preserves_twiceGram (n : Vec5) (hn : twiceForm n n = ZSqrt2.two) :
    mat5Mul (mat5Transpose (reflectionIn n)) (mat5Mul twiceGram (reflectionIn n)) = twiceGram := by
  let r := mat5Vec twiceGram n
  have hSym := thm_coxeter_gram_and_center.1
  have hGF : mat5Mul twiceGram (reflectionIn n) =
      fun p j => ZSqrt2.sub (twiceGram p j) (ZSqrt2.mul (r p) (r j)) := by
    apply mat5_ext
    intro p j
    unfold mat5Mul reflectionIn
    have hF : (fun k => ZSqrt2.mul (twiceGram p k) (ZSqrt2.sub (mat5Id k j) (ZSqrt2.mul (n k) (r j)))) =
        (fun k => ZSqrt2.sub (ZSqrt2.mul (twiceGram p k) (mat5Id k j))
                             (ZSqrt2.mul (ZSqrt2.mul (twiceGram p k) (n k)) (r j))) := by
      funext k
      rw [ZSqrt2.mul_sub, ← ZSqrt2.mul_assoc]
    change sum5 (fun k => ZSqrt2.mul (twiceGram p k) (ZSqrt2.sub (mat5Id k j) (ZSqrt2.mul (n k) (r j)))) = _
    rw [hF, sum5_sub, sum5_kron_right j (fun k => twiceGram p k), sum5_mul_right]
    rfl
  rw [hGF]
  apply mat5_ext
  intro i j
  have hRowSym : sum5 (fun p => ZSqrt2.mul (n p) (twiceGram p j)) = r j := by
    have hEq : (fun p => ZSqrt2.mul (n p) (twiceGram p j)) =
        (fun p => ZSqrt2.mul (twiceGram j p) (n p)) := by
      funext p
      have hT : twiceGram p j = twiceGram j p := congrFun (congrFun hSym j) p
      rw [hT, ZSqrt2.mul_comm]
    rw [hEq]
    rfl
  unfold mat5Mul mat5Transpose reflectionIn
  have hExpand : ∀ p : Fin 5,
      ZSqrt2.mul (ZSqrt2.sub (mat5Id p i) (ZSqrt2.mul (n p) (r i)))
                 (ZSqrt2.sub (twiceGram p j) (ZSqrt2.mul (r p) (r j))) =
      ZSqrt2.add
        (ZSqrt2.sub
          (ZSqrt2.sub (ZSqrt2.mul (mat5Id i p) (twiceGram p j))
                      (ZSqrt2.mul (mat5Id i p) (ZSqrt2.mul (r p) (r j))))
          (ZSqrt2.mul (r i) (ZSqrt2.mul (n p) (twiceGram p j))))
        (ZSqrt2.mul (ZSqrt2.mul (r i) (ZSqrt2.mul (n p) (r p))) (r j)) := by
    intro p
    have hid : mat5Id p i = mat5Id i p := by
      unfold mat5Id
      if heq : p = i then rw [heq] else
        have hne : i ≠ p := fun h => heq h.symm
        rw [ite_eq_right heq, ite_eq_right hne]
    rw [hid, ZSqrt2.sub_mul, ZSqrt2.mul_sub, ZSqrt2.mul_sub]
    have hA : ZSqrt2.mul (ZSqrt2.mul (n p) (r i)) (twiceGram p j) =
        ZSqrt2.mul (r i) (ZSqrt2.mul (n p) (twiceGram p j)) := by
      rw [ZSqrt2.mul_comm (n p) (r i), ZSqrt2.mul_assoc]
    have hB : ZSqrt2.mul (ZSqrt2.mul (n p) (r i)) (ZSqrt2.mul (r p) (r j)) =
        ZSqrt2.mul (ZSqrt2.mul (r i) (ZSqrt2.mul (n p) (r p))) (r j) := by
      rw [ZSqrt2.mul_comm (n p) (r i), ZSqrt2.mul_assoc (r i) (n p) (ZSqrt2.mul (r p) (r j)),
          ← ZSqrt2.mul_assoc (n p) (r p) (r j), ← ZSqrt2.mul_assoc (r i) (ZSqrt2.mul (n p) (r p)) (r j)]
    rw [hA, hB]
    exact ZSqrt2.sub_sub_rearrange _ _ _ _
  have hFun := funext hExpand
  change sum5 (fun p => ZSqrt2.mul (ZSqrt2.sub (mat5Id p i) (ZSqrt2.mul (n p) (r i)))
                                   (ZSqrt2.sub (twiceGram p j) (ZSqrt2.mul (r p) (r j)))) = twiceGram i j
  rw [hFun, sum5_add, sum5_sub, sum5_sub]
  rw [sum5_kron_left i (fun p => twiceGram p j),
      sum5_kron_left i (fun p => ZSqrt2.mul (r p) (r j)),
      sum5_mul_left, hRowSym,
      sum5_mul_right, sum5_mul_left]
  have hDot : sum5 (fun p => ZSqrt2.mul (n p) (r p)) = ZSqrt2.two := hn
  rw [hDot, ZSqrt2.mul_two, ZSqrt2.add_mul]
  exact ZSqrt2.sub_two_add_two (twiceGram i j) (ZSqrt2.mul (r i) (r j))

/-- Symbolic conjugation law for orthogonal involutions:
    if `Z^2 = I_5` and `Z^T (2 B) Z = 2 B`, then `Z F_n Z = F_{Z n}` for EVERY vector `n : Vec5`. -/
theorem thm_conj_reflection (Z : Mat5) (hZ2 : mat5Mul Z Z = mat5Id)
    (hZG : mat5Mul (mat5Transpose Z) (mat5Mul twiceGram Z) = twiceGram) (n : Vec5) :
    mat5Mul (mat5Mul Z (reflectionIn n)) Z = reflectionIn (mat5Vec Z n) := by
  have hZTG : mat5Mul (mat5Transpose Z) twiceGram = mat5Mul twiceGram Z := by
    calc mat5Mul (mat5Transpose Z) twiceGram
        = mat5Mul (mat5Mul (mat5Transpose Z) twiceGram) mat5Id := (mat5Mul_id_right _).symm
      _ = mat5Mul (mat5Mul (mat5Transpose Z) twiceGram) (mat5Mul Z Z) := by rw [hZ2]
      _ = mat5Mul (mat5Mul (mat5Transpose Z) (mat5Mul twiceGram Z)) Z := by
          rw [← mat5Mul_assoc (mat5Mul (mat5Transpose Z) twiceGram) Z Z,
              mat5Mul_assoc (mat5Transpose Z) twiceGram Z]
      _ = mat5Mul twiceGram Z := by rw [hZG]
  let r := mat5Vec twiceGram n
  have hRowZ : ∀ j : Fin 5,
      sum5 (fun m => ZSqrt2.mul (r m) (Z m j)) = mat5Vec twiceGram (mat5Vec Z n) j := by
    intro j
    have h1 : sum5 (fun m => ZSqrt2.mul (r m) (Z m j)) =
        mat5Vec (mat5Mul (mat5Transpose Z) twiceGram) n j := by
      unfold mat5Vec mat5Mul mat5Transpose
      have hL : sum5 (fun m => ZSqrt2.mul (sum5 (fun p => ZSqrt2.mul (twiceGram m p) (n p))) (Z m j)) =
          sum5 (fun m => sum5 (fun p => ZSqrt2.mul (ZSqrt2.mul (Z m j) (twiceGram m p)) (n p))) := by
        apply congrArg sum5; funext m
        rw [← sum5_mul_right]
        apply congrArg sum5; funext p
        rw [ZSqrt2.mul_comm (ZSqrt2.mul (twiceGram m p) (n p)) (Z m j),
            ← ZSqrt2.mul_assoc (Z m j) (twiceGram m p) (n p)]
      have hR : sum5 (fun p => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (Z m j) (twiceGram m p))) (n p)) =
          sum5 (fun p => sum5 (fun m => ZSqrt2.mul (ZSqrt2.mul (Z m j) (twiceGram m p)) (n p))) := by
        apply congrArg sum5; funext p
        rw [← sum5_mul_right]
      change sum5 (fun m => ZSqrt2.mul (sum5 (fun p => ZSqrt2.mul (twiceGram m p) (n p))) (Z m j)) =
             sum5 (fun p => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (Z m j) (twiceGram m p))) (n p))
      rw [hL, sum5_comm, hR]
    rw [h1, hZTG, mat5Vec_mul]
  have hFZ : mat5Mul (reflectionIn n) Z =
      fun k j => ZSqrt2.sub (Z k j) (ZSqrt2.mul (n k) (mat5Vec twiceGram (mat5Vec Z n) j)) := by
    apply mat5_ext
    intro k j
    unfold mat5Mul reflectionIn
    have hF : (fun m => ZSqrt2.mul (ZSqrt2.sub (mat5Id k m) (ZSqrt2.mul (n k) (r m))) (Z m j)) =
        (fun m => ZSqrt2.sub (ZSqrt2.mul (mat5Id k m) (Z m j))
                             (ZSqrt2.mul (n k) (ZSqrt2.mul (r m) (Z m j)))) := by
      funext m
      rw [ZSqrt2.sub_mul, ZSqrt2.mul_assoc]
    change sum5 (fun m => ZSqrt2.mul (ZSqrt2.sub (mat5Id k m) (ZSqrt2.mul (n k) (r m))) (Z m j)) = _
    rw [hF, sum5_sub, sum5_kron_left k (fun m => Z m j), sum5_mul_left, hRowZ j]
  rw [mat5Mul_assoc, hFZ]
  apply mat5_ext
  intro i j
  unfold mat5Mul reflectionIn
  have hF : (fun k => ZSqrt2.mul (Z i k)
        (ZSqrt2.sub (Z k j) (ZSqrt2.mul (n k) (mat5Vec twiceGram (mat5Vec Z n) j)))) =
      (fun k => ZSqrt2.sub (ZSqrt2.mul (Z i k) (Z k j))
                           (ZSqrt2.mul (ZSqrt2.mul (Z i k) (n k)) (mat5Vec twiceGram (mat5Vec Z n) j))) := by
    funext k
    rw [ZSqrt2.mul_sub, ← ZSqrt2.mul_assoc]
  change sum5 (fun k => ZSqrt2.mul (Z i k)
      (ZSqrt2.sub (Z k j) (ZSqrt2.mul (n k) (mat5Vec twiceGram (mat5Vec Z n) j)))) = _
  rw [hF, sum5_sub, sum5_mul_right]
  have hZij : sum5 (fun k => ZSqrt2.mul (Z i k) (Z k j)) = mat5Id i j :=
    congrFun (congrFun hZ2 i) j
  rw [hZij]
  rfl


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

/-- Exact antipodal slot involution (`a ↦ opp(a)` in `rootsD4()` blocks of 4: `4q + r ↦ 4q + (3 - r)`). -/
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

/-- Closed-form single-multiplication expression for `k_a = F_a Z` used for fast kernel `det`
    (proved entrywise identical to `transport a` below). -/
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
  refine ⟨by decide, by decide, by decide, by decide, ?_⟩
  intro a
  exact vec5_ext _ _ ((by decide : ∀ (x : Fin 24) (i : Fin 5),
    mat5Vec centralInversion (facetNormal x) i = facetNormal (oppSlot x) i) a)

/-- Exact `24 × 24 = 576`-entry Gram isomorphism:
    the 24 facet directions `d_a = n_a - c_0` satisfy `2 B(d_a, d_b) = 2 (r_a · r_b)` identically,
    embedding the 4D `D_4` root system isometrically into the tangent space `c_0^⊥ ⊂ ℝ^{4,1}`. -/
theorem thm_24_facet_dirs_isomorphic_to_d4 :
    ∀ a b : Fin 24,
      twiceForm (facetDir a) (facetDir b) = ZSqrt2.ofInt (2 * dot4 (d4RootOf a) (d4RootOf b)) := by
  intro a b
  unfold twiceForm
  rw [mat5Vec_twiceGram_eq_fast]
  exact (by decide : ∀ x y : Fin 24,
    dot5 (facetDir x) (twiceGramVecFast (facetDir y)) =
      ZSqrt2.ofInt (2 * dot4 (d4RootOf x) (d4RootOf y))) a b

/-- Headline Theorem 1 (`O^+(4,1; ℤ[√2])` Lorentzian Form Preservation):
    ALL 24 transport matrices `k_a = F_a Z` preserve the exact Lorentzian `(4, 1)` form `2 B`
    (`k_a^T (2 B) k_a = 2 B`) AND preserve the future timelike sheet (`2 B(k_a c_0, c_0) = -6 < 0`). -/
theorem thm_coxeter_transport_preserves_lorentz :
    (∀ a : Fin 24,
      mat5Mul (mat5Transpose (transport a)) (mat5Mul twiceGram (transport a)) = twiceGram) ∧
    (∀ a : Fin 24,
      twiceForm (mat5Vec (transport a) baseCenter) baseCenter = ZSqrt2.ofInt (-6)) := by
  refine ⟨?_, ?_⟩
  · intro a
    unfold transport faceReflection
    have hNorm : twiceForm (facetNormal a) (facetNormal a) = ZSqrt2.two :=
      thm_24_facets_geometry.2.2.1 a
    exact thm_orth_group_mul
      (reflectionIn (facetNormal a)) centralInversion
      (thm_reflection_preserves_twiceGram (facetNormal a) hNorm)
      thm_central_inversion_properties.2.1
  · intro a
    have hStep : mat5Vec (transport a) baseCenter =
        fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i)) := by
      unfold transport
      rw [mat5Vec_mul, thm_central_inversion_properties.2.2.2.1]
      apply vec5_ext
      intro i
      have hDot : sum5 (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (baseCenter k)) =
          ZSqrt2.ofInt (-2) := by
        have hSym := thm_coxeter_gram_and_center.1
        have hEq : sum5 (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (baseCenter k)) =
            twiceForm (facetNormal a) baseCenter := by
          unfold twiceForm dot5 mat5Vec
          have h1 : sum5 (fun k => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (twiceGram k m) (facetNormal a m))) (baseCenter k)) =
              sum5 (fun k => sum5 (fun m => ZSqrt2.mul (facetNormal a m) (ZSqrt2.mul (twiceGram m k) (baseCenter k)))) := by
            apply congrArg sum5; funext k
            rw [← sum5_mul_right]
            apply congrArg sum5; funext m
            have hT : twiceGram k m = twiceGram m k := congrFun (congrFun hSym m) k
            rw [hT, ZSqrt2.mul_comm (twiceGram m k) (facetNormal a m), ZSqrt2.mul_assoc]
          have h2 : sum5 (fun m => ZSqrt2.mul (facetNormal a m) (sum5 (fun k => ZSqrt2.mul (twiceGram m k) (baseCenter k)))) =
              sum5 (fun m => sum5 (fun k => ZSqrt2.mul (facetNormal a m) (ZSqrt2.mul (twiceGram m k) (baseCenter k)))) := by
            apply congrArg sum5; funext m
            rw [← sum5_mul_left]
          rw [h1, sum5_comm, h2]
        rw [hEq]
        exact thm_24_facets_geometry.2.2.2.1 a
      have hFun : (fun k => ZSqrt2.mul
            (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (facetNormal a i) (mat5Vec twiceGram (facetNormal a) k)))
            (baseCenter k)) =
          (fun k => ZSqrt2.sub (ZSqrt2.mul (mat5Id i k) (baseCenter k))
                               (ZSqrt2.mul (facetNormal a i) (ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (baseCenter k)))) := by
        funext k; rw [ZSqrt2.sub_mul, ZSqrt2.mul_assoc]
      change sum5 (fun k => ZSqrt2.mul
            (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (facetNormal a i) (mat5Vec twiceGram (facetNormal a) k)))
            (baseCenter k)) = ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i))
      rw [hFun, sum5_sub, sum5_kron_left i baseCenter, sum5_mul_left, hDot]
      exact ZSqrt2.sub_mul_neg2 (baseCenter i) (facetNormal a i)
    rw [hStep]
    unfold twiceForm
    rw [mat5Vec_twiceGram_eq_fast]
    exact (by decide : ∀ x : Fin 24,
      dot5 (fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal x i)))
           (twiceGramVecFast baseCenter) = ZSqrt2.ofInt (-6)) a

private theorem transport_eq_fast (a : Fin 24) : transport a = transportFast a := by
  apply mat5_ext
  intro i j
  have hCent : twiceForm (facetNormal a) baseCenter = ZSqrt2.ofInt (-2) :=
    thm_24_facets_geometry.2.2.2.1 a
  have hSym := thm_coxeter_gram_and_center.1
  have hDotC : sum5 (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (baseCenter k)) =
      ZSqrt2.ofInt (-2) := by
    have hEq : sum5 (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (baseCenter k)) =
        twiceForm (facetNormal a) baseCenter := by
      unfold twiceForm dot5 mat5Vec
      have h1 : sum5 (fun k => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (twiceGram k m) (facetNormal a m))) (baseCenter k)) =
          sum5 (fun k => sum5 (fun m => ZSqrt2.mul (facetNormal a m) (ZSqrt2.mul (twiceGram m k) (baseCenter k)))) := by
        apply congrArg sum5; funext k
        rw [← sum5_mul_right]
        apply congrArg sum5; funext m
        have hT : twiceGram k m = twiceGram m k := congrFun (congrFun hSym m) k
        rw [hT, ZSqrt2.mul_comm (twiceGram m k) (facetNormal a m), ZSqrt2.mul_assoc]
      have h2 : sum5 (fun m => ZSqrt2.mul (facetNormal a m) (sum5 (fun k => ZSqrt2.mul (twiceGram m k) (baseCenter k)))) =
          sum5 (fun m => sum5 (fun k => ZSqrt2.mul (facetNormal a m) (ZSqrt2.mul (twiceGram m k) (baseCenter k)))) := by
        apply congrArg sum5; funext m
        rw [← sum5_mul_left]
      rw [h1, sum5_comm, h2]
    rw [hEq, hCent]
  have hDot2C : sum5 (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (ZSqrt2.scale 2 (baseCenter k))) =
      ZSqrt2.ofInt (-4) := by
    have hSc : (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (ZSqrt2.scale 2 (baseCenter k))) =
        (fun k => ZSqrt2.mul ZSqrt2.two (ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (baseCenter k))) := by
      funext k
      rw [ZSqrt2.scale2_eq_mul_two, ← ZSqrt2.mul_assoc,
          ZSqrt2.mul_comm (mat5Vec twiceGram (facetNormal a) k) ZSqrt2.two, ZSqrt2.mul_assoc]
    rw [hSc, sum5_mul_left, hDotC]
    decide
  unfold transport faceReflection reflectionIn transportFast mat5Mul
  rw [mat5Vec_twiceGram_eq_fast] at hDot2C ⊢
  if hj : j = ⟨4, by decide⟩ then
    rw [ite_eq_left hj]
    have hZcol : ∀ k : Fin 5,
        centralInversion k j =
        ZSqrt2.sub (ZSqrt2.scale 2 (baseCenter k)) (mat5Id k ⟨4, by decide⟩) := by
      intro k
      unfold centralInversion
      rw [hj, ite_eq_left rfl]
      unfold mat5Id
      if hk : k = ⟨4, by decide⟩ then
        rw [ite_eq_left hk, ite_eq_left hk]
        exact ZSqrt2.add_negOne_scale2 (baseCenter k)
      else
        rw [ite_eq_right hk, ite_eq_right hk]
        exact ZSqrt2.add_zero_scale2 (baseCenter k)
    have hFun : (fun k => ZSqrt2.mul
          (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (facetNormal a i) (twiceGramVecFast (facetNormal a) k)))
          (centralInversion k j)) =
        (fun k => ZSqrt2.sub
          (ZSqrt2.sub (ZSqrt2.mul (mat5Id i k) (ZSqrt2.scale 2 (baseCenter k)))
                      (ZSqrt2.mul (mat5Id i k) (mat5Id k ⟨4, by decide⟩)))
          (ZSqrt2.sub (ZSqrt2.mul (facetNormal a i) (ZSqrt2.mul (twiceGramVecFast (facetNormal a) k) (ZSqrt2.scale 2 (baseCenter k))))
                      (ZSqrt2.mul (facetNormal a i) (ZSqrt2.mul (twiceGramVecFast (facetNormal a) k) (mat5Id k ⟨4, by decide⟩))))) := by
      funext k
      rw [hZcol k, ZSqrt2.sub_mul, ZSqrt2.mul_sub, ZSqrt2.mul_sub, ZSqrt2.mul_assoc, ZSqrt2.mul_assoc]
    rw [hFun, sum5_sub, sum5_sub, sum5_sub,
        sum5_kron_left i (fun k => ZSqrt2.scale 2 (baseCenter k)),
        sum5_kron_left i (fun k => mat5Id k ⟨4, by decide⟩),
        sum5_mul_left, sum5_mul_left, hDot2C,
        sum5_kron_right ⟨4, by decide⟩ (fun k => twiceGramVecFast (facetNormal a) k)]
    exact ZSqrt2.transport_col4_rearrange (baseCenter i) (facetNormal a i)
      (twiceGramVecFast (facetNormal a) ⟨4, by decide⟩) (mat5Id i ⟨4, by decide⟩)
  else
    rw [ite_eq_right hj]
    have hZcol : ∀ k : Fin 5, centralInversion k j = ZSqrt2.neg (mat5Id k j) := by
      intro k
      unfold centralInversion
      rw [ite_eq_right hj, ZSqrt2.add_zero]
      unfold mat5Id
      if hk : k = j then rw [ite_eq_left hk, ite_eq_left hk]; decide
      else rw [ite_eq_right hk, ite_eq_right hk]; decide
    have hFun : (fun k => ZSqrt2.mul
          (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (facetNormal a i) (twiceGramVecFast (facetNormal a) k)))
          (centralInversion k j)) =
        (fun k => ZSqrt2.sub
          (ZSqrt2.mul (ZSqrt2.mul (facetNormal a i) (twiceGramVecFast (facetNormal a) k)) (mat5Id k j))
          (ZSqrt2.mul (mat5Id i k) (mat5Id k j))) := by
      funext k
      rw [hZcol k]
      exact ZSqrt2.mul_sub_neg_rearrange (mat5Id i k)
        (ZSqrt2.mul (facetNormal a i) (twiceGramVecFast (facetNormal a) k)) (mat5Id k j)
    rw [hFun, sum5_sub,
        sum5_kron_right j (fun k => ZSqrt2.mul (facetNormal a i) (twiceGramVecFast (facetNormal a) k)),
        sum5_kron_left i (fun k => mat5Id k j)]

/-- Headline Theorem 2 (Exact Determinant `-1` Across All 24 Transports):
    `det(k_a) = -1` for ALL 24 slots `a : Fin 24`, proving `k_a ∈ O^+(4,1; ℤ[√2]) \ SO^+(4,1)`
    (every step across a 24-cell facet reverses cell orientation / swaps bipartite parity class). -/
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
        faceReflection (oppSlot a) := by
    intro a
    unfold faceReflection
    rw [thm_conj_reflection centralInversion
          thm_central_inversion_properties.1
          thm_central_inversion_properties.2.1
          (facetNormal a),
        thm_24_facets_geometry.2.2.2.2 a]
  refine ⟨hConj, ?_⟩
  intro a
  unfold transport
  rw [mat5Mul_assoc (faceReflection a) centralInversion (mat5Mul (faceReflection (oppSlot a)) centralInversion)]
  rw [← mat5Mul_assoc centralInversion (faceReflection (oppSlot a)) centralInversion]
  rw [hConj (oppSlot a), (thm_24_facets_geometry.2.1 a).1]
  exact thm_reflection_involution (facetNormal a) (thm_24_facets_geometry.2.2.1 a)


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
  | nil =>
    simp only [List.nil_append, evalTransportWord]
    exact (mat5Mul_id_left _).symm
  | cons a rest ih =>
    simp only [List.cons_append, evalTransportWord]
    rw [ih, mat5Mul_assoc]

/-- All-word `O^+(4,1; ℤ[√2])` closure and exact antipodal path reversal for EVERY finite walk `w`
    on the infinite `{3,4,3,4}` honeycomb. -/
theorem thm_coxeter_word_lorentz_and_inverse (w : List (Fin 24)) :
    mat5Mul (mat5Transpose (evalTransportWord w)) (mat5Mul twiceGram (evalTransportWord w)) = twiceGram ∧
    mat5Mul (evalTransportWord w) (evalTransportWord (revAntipodal w)) = mat5Id ∧
    mat5Mul (evalTransportWord (revAntipodal w)) (evalTransportWord w) = mat5Id := by
  induction w with
  | nil =>
    simp only [evalTransportWord, revAntipodal]
    refine ⟨mat5_ext _ _ (by decide), mat5Mul_id_left mat5Id, mat5Mul_id_left mat5Id⟩
  | cons a rest ih =>
    simp only [evalTransportWord, revAntipodal]
    rw [evalTransportWord_append]
    have hSingle : evalTransportWord [oppSlot a] = transport (oppSlot a) := by
      simp only [evalTransportWord]
      exact mat5Mul_id_right _
    rw [hSingle]
    have hOrth : mat5Mul (mat5Transpose (mat5Mul (transport a) (evalTransportWord rest)))
        (mat5Mul twiceGram (mat5Mul (transport a) (evalTransportWord rest))) = twiceGram :=
      thm_orth_group_mul (transport a) (evalTransportWord rest)
        (thm_coxeter_transport_preserves_lorentz.1 a) ih.1
    have hRight : mat5Mul (mat5Mul (transport a) (evalTransportWord rest))
        (mat5Mul (evalTransportWord (revAntipodal rest)) (transport (oppSlot a))) = mat5Id := by
      rw [mat5Mul_assoc (transport a) (evalTransportWord rest),
          ← mat5Mul_assoc (evalTransportWord rest) (evalTransportWord (revAntipodal rest)) (transport (oppSlot a)),
          ih.2.1, mat5Mul_id_left, thm_coxeter_transport_antipodal_inverse.2 a]
    have hLeft : mat5Mul (mat5Mul (evalTransportWord (revAntipodal rest)) (transport (oppSlot a)))
        (mat5Mul (transport a) (evalTransportWord rest)) = mat5Id := by
      have hInvOpp : mat5Mul (transport (oppSlot a)) (transport a) = mat5Id := by
        have h := thm_coxeter_transport_antipodal_inverse.2 (oppSlot a)
        rw [(thm_24_facets_geometry.2.1 a).1] at h
        exact h
      rw [mat5Mul_assoc (evalTransportWord (revAntipodal rest)) (transport (oppSlot a)),
          ← mat5Mul_assoc (transport (oppSlot a)) (transport a) (evalTransportWord rest),
          hInvOpp, mat5Mul_id_left, ih.2.2]
    exact ⟨hOrth, hRight, hLeft⟩

/-- Exact 1-hop stream `S` on the ENTIRE infinite `{3,4,3,4}` honeycomb frame group:
    `(S ψ)(g, a) = ψ(g k_{opp(a)}, a)` (signal traveling along direction `a` arrives at `g` from `g k_{-a}`). -/
def honeycombStream {α : Type} (ψ : Mat5 → Fin 24 → α) : Mat5 → Fin 24 → α :=
  fun g a => ψ (mat5Mul g (transport (oppSlot a))) a

/-- Exact slot-antipodal reversal `R` on every dock: `(R ψ)(g, a) = ψ(g, opp(a))`. -/
def slotReverse {α : Type} (ψ : Mat5 → Fin 24 → α) : Mat5 → Fin 24 → α :=
  fun g a => ψ g (oppSlot a)

/-- Headline Theorem 4 (Exact Antipodal Stream Reversal `S R S = R` on Infinite `{3,4,3,4}`):
    for EVERY field type `α`, EVERY state `ψ : Mat5 → Fin 24 → α` on the infinite `{3,4,3,4}`
    honeycomb, `R^2 = I` and `S (R (S ψ)) = R ψ` identically (derived directly from `k_{-a} k_a = I_5`). -/
theorem thm_honeycomb_stream_antipodal_reversal {α : Type} (ψ : Mat5 → Fin 24 → α) :
    slotReverse (slotReverse ψ) = ψ ∧
    honeycombStream (slotReverse (honeycombStream ψ)) = slotReverse ψ := by
  refine ⟨?_, ?_⟩
  · funext g a
    unfold slotReverse
    rw [(thm_24_facets_geometry.2.1 a).1]
  · funext g a
    unfold honeycombStream slotReverse
    dsimp only
    rw [(thm_24_facets_geometry.2.1 a).1, mat5Mul_assoc]
    have hInv : mat5Mul (transport (oppSlot a)) (transport a) = mat5Id := by
      have h := thm_coxeter_transport_antipodal_inverse.2 (oppSlot a)
      rw [(thm_24_facets_geometry.2.1 a).1] at h
      exact h
    rw [hInv, mat5Mul_id_right]

/-- Exact dock-0 cusp neighbor split certificate relative to `cuspVertex = (0, 1, √2, √2, 1)`:
    0 up (`> -2`), 6 lateral (`= -2`, slots `{0, 1, 4, 5, 8, 9}`), 12 mid-down (`= -6`),
    and 6 far-down (`= -10`), matching `F_1(1, 0, 0, 0) = (6*1 + 12*(1/3) + 6*(1/5)) / 24 = 7/15`. -/
theorem thm_cusp_dock0_split_and_ratio :
    let lvls := (List.finRange 24).map (fun a =>
      dot5 (fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i)))
           (twiceGramVecFast cuspVertex))
    (lvls.filter (fun v => v == ZSqrt2.ofInt (-2))).length = 6 ∧
    (lvls.filter (fun v => v == ZSqrt2.ofInt (-6))).length = 12 ∧
    (lvls.filter (fun v => v == ZSqrt2.ofInt (-10))).length = 6 ∧
    (6 * 15 + 12 * 5 + 6 * 3) * 15 = 7 * (24 * 15) := by
  decide

/-- Palindromic Algebraic `T`, `CP`, and `CPT` Symmetry Theorem:
    for ANY state space `H` with unitary stream `S` and local layers `L_1, L_2, M` (with adjoints
    `S_dag, L1_dag, L2_dag, M_dag`), palindromic 8-layer-style beat
    `U = S ∘ L_1 ∘ L_2 ∘ M ∘ L_2 ∘ L_1` and its adjoint `U_dag = L_1† ∘ L_2† ∘ M† ∘ L_2† ∘ L_1† ∘ S†`:
    whenever an involution `τ` (`τ^2 = I`) conjugates every layer to its adjoint (`τ X τ = X†`,
    as `τ = Θ ∘ R` does on infinite `{3,4,3,4}` via `S R S = R`), the shifted time-reversal
    operator `T = S ∘ τ` satisfies:
    1. `T^2 = I` (exact involution),
    2. `T ∘ U ∘ T = U†` (exact microscopic time-reversal symmetry `T U T^{-1} = U†`),
    3. If an involution `CP` commutes with `S, L_1, L_2, M` and `τ`, then `CP ∘ U = U ∘ CP`,
       `(CP ∘ T)^2 = I`, and `(CP ∘ T) ∘ U ∘ (CP ∘ T) = U†` (exact `CPT` invariance!). -/
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
  have hT2 : ∀ ψ, T (T ψ) = ψ := by
    intro ψ
    change S (τ (S (τ ψ))) = ψ
    rw [hTauS, hS_lr]
  have hTUT : ∀ ψ, T (U (T ψ)) = U_dag ψ := by
    intro ψ
    change S (τ (S (L1 (L2 (M (L2 (L1 (S (τ ψ))))))))) =
      L1_dag (L2_dag (M_dag (L2_dag (L1_dag (S_dag ψ)))))
    have h1 : ∀ x, τ (S x) = S_dag (τ x) := by
      intro x; have := hTauS (τ x); rw [hTau2] at this; exact this
    have hL1 : ∀ x, τ (L1 x) = L1_dag (τ x) := by
      intro x; have := hTauL1 (τ x); rw [hTau2] at this; exact this
    have hL2 : ∀ x, τ (L2 x) = L2_dag (τ x) := by
      intro x; have := hTauL2 (τ x); rw [hTau2] at this; exact this
    have hM : ∀ x, τ (M x) = M_dag (τ x) := by
      intro x; have := hTauM (τ x); rw [hTau2] at this; exact this
    rw [h1, hS_lr, hL1, hL2, hM, hL2, hL1, hTauS]
  have hCPU : ∀ ψ, CP (U ψ) = U (CP ψ) := by
    intro ψ
    change CP (S (L1 (L2 (M (L2 (L1 ψ)))))) = S (L1 (L2 (M (L2 (L1 (CP ψ))))))
    rw [hCPS, hCPL1, hCPL2, hCPM, hCPL2, hCPL1]
  have hCPT_comm : ∀ ψ, CP (T ψ) = T (CP ψ) := by
    intro ψ
    change CP (S (τ ψ)) = S (τ (CP ψ))
    rw [hCPS, hCPTau]
  have hCPT2 : ∀ ψ, CPT (CPT ψ) = ψ := by
    intro ψ
    change CP (T (CP (T ψ))) = ψ
    rw [← hCPT_comm, hCP2, hT2]
  have hCPTU : ∀ ψ, CPT (U (CPT ψ)) = U_dag ψ := by
    intro ψ
    change CP (T (U (CP (T ψ)))) = U_dag ψ
    rw [← hCPU, ← hCPT_comm, hCP2, hTUT]
  exact ⟨hT2, hTUT, hCPU, hCPT2, hCPTU⟩

end Vibe
