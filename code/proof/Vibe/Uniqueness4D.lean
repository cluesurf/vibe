import Vibe.Algebra
import Vibe.Geometry

/-!
# Vibe Theory: Complete 4D Regular Hyperbolic Honeycomb Uniqueness Theorem (`{3,4,3,4}`)

Zero-dependency Lean 4 formalization of the complete Coxeter (1956) classification of
regular 4D hyperbolic honeycombs `{p, q, r, s}` (`p, q, r, s ≥ 3`) and the unconditional
structural uniqueness theorem selecting `{3,4,3,4}` (`vibe-roadmap-board-0054`):

1. **Exact `ℤ[√5]` Schläfli Principal Minors:** Encodes `8 cos^2(π/m)` exactly in `ℤ[√5]` for
   `m ∈ {3, 4, 5, 6}` (with sharp lower bound `6 = 8 cos^2(π/6)` for all `m ≥ 6`) and evaluates
   all leading principal minors `schlafliMinor2..5` of the `5 × 5` Coxeter Gram matrix
   `B_{ij} = -cos(π / m_{ij})` with exact integer-signed `ℤ[√5]` positivity tests.
2. **Unconditional First-Principles Classification (`∀ p q r s : Nat`):**
   - Rank 3 (`{p, q}` spherical): exactly the 5 Platonic solids `{3,3}`, `{4,3}`, `{3,4}`, `{5,3}`, `{3,5}`.
   - Rank 4 (`{a, b, c}` spherical): exactly the 6 regular 4-polytopes `{3,3,3}`, `{4,3,3}`,
     `{3,3,4}`, `{3,4,3}`, `{5,3,3}`, `{3,3,5}`.
   - Rank 4 (`{a, b, c}` Euclidean): uniquely `{4,3,4}` (the unique regular 3D Euclidean honeycomb).
   - Rank 5 (`{p, q, r, s}` spherical): exactly the 3 regular 5-polytopes `{3,3,3,3}`, `{4,3,3,3}`, `{3,3,3,4}`.
   - Rank 5 (`{p, q, r, s}` Euclidean): exactly the 3 regular 4D Euclidean honeycombs
     `{4,3,3,4}`, `{3,3,4,3}`, `{3,4,3,3}` (`det B_5 = 0`, zero curvature).
   - Rank 5 (`{p, q, r, s}` compact hyperbolic in `ℍ^4`): exactly the 5 Coxeter (1956) compact
     honeycombs `{3,3,3,5}`, `{5,3,3,3}`, `{4,3,3,5}`, `{5,3,3,4}`, `{5,3,3,5}`.
   - Rank 5 (`{p, q, r, s}` paracompact hyperbolic in `ℍ^4`): exactly the 2 Coxeter (1956)
     paracompact honeycombs `{3,4,3,4}` (ideal `{4,3,4}` vertex figure, finite `{3,4,3}` cell)
     and its dual `{4,3,4,3}` (ideal `{4,3,4}` cell, finite `{3,4,3}` vertex figure).
   - Any symbol with `max(p, q, r, s) ≥ 6` (such as `{3,3,3,6}`, `{6,3,3,3}`, `{6,3,3,4}`,
     `{4,3,3,6}`, `{6,3,3,5}`, `{5,3,3,6}`, `{6,3,3,6}`) has a hyperbolic 3D cell or vertex figure
     (noncompact / ultra-ideal infinite covolume in `ℍ^4`, NOT paracompact).
3. **Uniqueness Theorems for `{3,4,3,4}`:**
   - Over all 7 finite-covolume regular 4D hyperbolic honeycombs (5 compact + 2 paracompact),
     `{3,4,3,4}` is ALREADY unique under Predicate (1) `hasFlat3DEuclideanCusp` alone!
   - Over ALL `p, q, r, s : Nat` (including every noncompact / hyperideal honeycomb),
     `{3,4,3,4}` is the UNIQUE 4D Schläfli symbol satisfying (1) `hasFlat3DEuclideanCusp` AND
     (2) `hasSelfDualFiniteCell` (and also unique under (1) + finite spherical cell, and under
     all four invariants including `D_4` rank-4 `SO(4)` isotropy and zero straddling triangles
     bridged directly to `Vibe.Geometry`).
   - Explicit negative controls certifying that hypercubic `{4,3,3}` (`z4Roots`) AND 16-cell
     `{3,3,4}` (`(±1, ±1, ±1, ±1)` facet normals) both violate rank-4 `SO(4)` isotropy.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Tiny Constructive Bool Helpers -/

private theorem bool_and_left {a b : Bool} (h : (a && b) = true) : a = true := by
  cases a <;> cases b <;> first | rfl | exact absurd h (by decide)

private theorem bool_and_right {a b : Bool} (h : (a && b) = true) : b = true := by
  cases a <;> cases b <;> first | rfl | exact absurd h (by decide)

private theorem bool_or_elim {a b : Bool} (h : (a || b) = true) : a = true ∨ b = true := by
  cases a
  · cases b
    · exact absurd h (by decide)
    · exact Or.inr rfl
  · exact Or.inl rfl

private theorem decide_true_mp {P : Prop} [Decidable P] (h : decide P = true) : P := by
  if hp : P then
    exact hp
  else
    have hf : decide P = false := decide_eq_false hp
    rw [hf] at h
    exact absurd h (by decide)


/-! ## Section 1: Exact Quadratic Ring `ℤ[√5]` & Sign Decisions -/

/-- Exact element `a + b √5 ∈ ℤ[√5]`. -/
structure ZSqrt5 where
  a : Int
  b : Int
  deriving DecidableEq, Repr

namespace ZSqrt5

def zero : ZSqrt5 := ⟨0, 0⟩
def ofInt (k : Int) : ZSqrt5 := ⟨k, 0⟩
def add (x y : ZSqrt5) : ZSqrt5 := ⟨x.a + y.a, x.b + y.b⟩
def sub (x y : ZSqrt5) : ZSqrt5 := ⟨x.a - y.a, x.b - y.b⟩
def scale (k : Int) (x : ZSqrt5) : ZSqrt5 := ⟨k * x.a, k * x.b⟩
def mul (x y : ZSqrt5) : ZSqrt5 := ⟨x.a * y.a + 5 * x.b * y.b, x.a * y.b + x.b * y.a⟩

/-- Exact decidable positivity predicate `a + b √5 > 0` over integers (zero floats). -/
def isPos (x : ZSqrt5) : Bool :=
  if x.a ≥ 0 ∧ x.b ≥ 0 then
    decide (x.a > 0 ∨ x.b > 0)
  else if x.a ≤ 0 ∧ x.b ≤ 0 then
    false
  else if x.a > 0 then
    decide (x.a * x.a > 5 * x.b * x.b)
  else
    decide (5 * x.b * x.b > x.a * x.a)

/-- Exact decidable negativity predicate `a + b √5 < 0` over integers. -/
def isNeg (x : ZSqrt5) : Bool := isPos ⟨-x.a, -x.b⟩

/-- Exact decidable zero predicate `a + b √5 = 0` (since `√5` is irrational, iff `a = 0 ∧ b = 0`). -/
def isZero (x : ZSqrt5) : Bool := decide (x.a = 0 ∧ x.b = 0)

private theorem int_neg_sq (x : Int) : (-x) * (-x) = x * x := by
  rw [Int.neg_mul, Int.mul_neg, Int.neg_neg]

private theorem int_five_neg_sq (x : Int) : 5 * (-x) * (-x) = 5 * x * x := by
  rw [Int.mul_assoc 5 (-x) (-x), int_neg_sq, ← Int.mul_assoc]

/-- Exact sign mutual exclusion on `ℤ[√5]`: no element can be simultaneously positive and negative. -/
theorem isPos_neg_exclusive (x : ZSqrt5) : ¬ (isPos x = true ∧ isNeg x = true) := by
  cases x with
  | mk a b =>
    intro hBoth
    have hp := hBoth.1
    have hn := hBoth.2
    unfold isPos at hp
    unfold isNeg isPos at hn
    if h1 : a ≥ 0 ∧ b ≥ 0 then
      rw [ite_eq_left h1] at hp
      have hPosOr : a > 0 ∨ b > 0 := decide_true_mp hp
      if h2 : -a ≥ 0 ∧ -b ≥ 0 then
        omega
      else
        rw [ite_eq_right h2] at hn
        have h3 : -a ≤ 0 ∧ -b ≤ 0 := by omega
        rw [ite_eq_left h3] at hn
        exact absurd hn (by decide)
    else if h2 : a ≤ 0 ∧ b ≤ 0 then
      rw [ite_eq_right h1, ite_eq_left h2] at hp
      exact absurd hp (by decide)
    else
      rw [ite_eq_right h1, ite_eq_right h2] at hp
      have hn1 : ¬ (-a ≥ 0 ∧ -b ≥ 0) := by omega
      have hn2 : ¬ (-a ≤ 0 ∧ -b ≤ 0) := by omega
      rw [ite_eq_right hn1, ite_eq_right hn2] at hn
      if ha : a > 0 then
        have hna : ¬ (-a > 0) := by omega
        rw [ite_eq_left ha] at hp
        rw [ite_eq_right hna] at hn
        have hA : a * a > 5 * b * b := decide_true_mp hp
        have hB : 5 * (-b) * (-b) > (-a) * (-a) := decide_true_mp hn
        rw [int_five_neg_sq, int_neg_sq] at hB
        omega
      else
        have hna : -a > 0 := by omega
        rw [ite_eq_right ha] at hp
        rw [ite_eq_left hna] at hn
        have hA : 5 * b * b > a * a := decide_true_mp hp
        have hB : (-a) * (-a) > 5 * (-b) * (-b) := decide_true_mp hn
        rw [int_five_neg_sq, int_neg_sq] at hB
        omega

end ZSqrt5


/-! ## Section 2: Exact Schläfli Principal Minors & First-Principles Coxeter (1956) Classification -/

/-- Exact `8 cos^2(π/m)` in `ℤ[√5]` for `m ∈ {3, 4, 5, 6}`, and the sharp monotone lower bound
    `6 = 8 cos^2(π/6) ≤ 8 cos^2(π/m)` for all `m ≥ 6` (excluding every `m ≥ 6` from
    spherical rank-3 subdiagrams unconditionally for all `m : Nat`). -/
def cosSq8Lower (m : Nat) : ZSqrt5 :=
  match m with
  | 3 => ⟨2, 0⟩
  | 4 => ⟨4, 0⟩
  | 5 => ⟨3, 1⟩
  | _ => ⟨6, 0⟩

/-- Scaled 2×2 Schläfli minor `8 d_2(p) = 8 (1 - cos^2(π/p))`. -/
def schlafliMinor2 (p : Nat) : ZSqrt5 :=
  ZSqrt5.sub ⟨8, 0⟩ (cosSq8Lower p)

/-- Scaled 3×3 Schläfli minor `8 d_3(p, q) = 8 (1 - cos^2(π/p) - cos^2(π/q))`. -/
def schlafliMinor3 (p q : Nat) : ZSqrt5 :=
  ZSqrt5.sub (schlafliMinor2 p) (cosSq8Lower q)

/-- Scaled 4×4 Schläfli minor `64 d_4(a, b, c) = 8 (8 d_3(a, b)) - c_2 (8 d_2(a))`. -/
def schlafliMinor4 (a b c : Nat) : ZSqrt5 :=
  ZSqrt5.sub (ZSqrt5.scale 8 (schlafliMinor3 a b)) (ZSqrt5.mul (cosSq8Lower c) (schlafliMinor2 a))

/-- Scaled 5×5 Schläfli minor `512 d_5(p, q, r, s) = 8 (64 d_4(p, q, r)) - 8 c_3 (8 d_3(p, q))`. -/
def schlafliMinor5 (p q r s : Nat) : ZSqrt5 :=
  ZSqrt5.sub
    (ZSqrt5.scale 8 (schlafliMinor4 p q r))
    (ZSqrt5.mul (cosSq8Lower s) (ZSqrt5.scale 8 (schlafliMinor3 p q)))

/-- Exact decidable predicate: `{p, q}` is a spherical regular 3-polytope (Platonic solid). -/
def isSpherical3 (p q : Nat) : Bool :=
  decide (p ≥ 3) && decide (q ≥ 3) && ZSqrt5.isPos (schlafliMinor3 p q)

/-- Exact decidable predicate: `{a, b, c}` is a spherical regular 4-polytope. -/
def isSpherical4 (a b c : Nat) : Bool :=
  isSpherical3 a b && isSpherical3 b c && ZSqrt5.isPos (schlafliMinor4 a b c)

/-- Exact decidable predicate: `{a, b, c}` is a regular 3D Euclidean honeycomb. -/
def isEuclidean4 (a b c : Nat) : Bool :=
  isSpherical3 a b && isSpherical3 b c && ZSqrt5.isZero (schlafliMinor4 a b c)

/-- Complete 4D regular honeycomb / polytope Schläfli symbol `{p, q, r, s}`. -/
structure Schlafli4D where
  p : Nat
  q : Nat
  r : Nat
  s : Nat
  deriving DecidableEq, Repr

/-- The 4D regular hyperbolic 24-cell honeycomb `{3,4,3,4}` of Vibe Theory. -/
def honeycomb3434 : Schlafli4D := ⟨3, 4, 3, 4⟩

/-- Exact decidable predicate: `{p, q, r, s}` is a spherical regular 5-polytope (`det B_5 > 0`). -/
def isSpherical5 (h : Schlafli4D) : Bool :=
  isSpherical4 h.p h.q h.r && isSpherical4 h.q h.r h.s &&
    ZSqrt5.isPos (schlafliMinor5 h.p h.q h.r h.s)

/-- Exact decidable predicate: `{p, q, r, s}` is a regular 4D Euclidean honeycomb (`det B_5 = 0`). -/
def isEuclidean4D (h : Schlafli4D) : Bool :=
  isSpherical4 h.p h.q h.r && isSpherical4 h.q h.r h.s &&
    ZSqrt5.isZero (schlafliMinor5 h.p h.q h.r h.s)

/-- Exact decidable predicate: `{p, q, r, s}` is a COMPACT regular 4D hyperbolic honeycomb in `ℍ^4`
    (both cell `{p, q, r}` and vertex figure `{q, r, s}` are finite regular 4-polytopes, `det B_5 < 0`). -/
def isCompactHyp4D (h : Schlafli4D) : Bool :=
  isSpherical4 h.p h.q h.r && isSpherical4 h.q h.r h.s &&
    ZSqrt5.isNeg (schlafliMinor5 h.p h.q h.r h.s)

/-- Exact decidable predicate: `{p, q, r, s}` is a PARACOMPACT regular 4D hyperbolic honeycomb in `ℍ^4`
    (finite covolume: cell and vertex figure are spherical or 3D Euclidean, at least one Euclidean, `det B_5 < 0`). -/
def isParacompactHyp4D (h : Schlafli4D) : Bool :=
  ((isSpherical4 h.p h.q h.r && isEuclidean4 h.q h.r h.s) ||
   (isEuclidean4 h.p h.q h.r && isSpherical4 h.q h.r h.s) ||
   (isEuclidean4 h.p h.q h.r && isEuclidean4 h.q h.r h.s)) &&
  ZSqrt5.isNeg (schlafliMinor5 h.p h.q h.r h.s)

/-- Exact decidable predicate: `{p, q, r, s}` is ANY finite-covolume regular 4D hyperbolic honeycomb
    (compact OR paracompact, Coxeter 1956 complete classification). -/
def isFiniteCovolumeHyp4D (h : Schlafli4D) : Bool :=
  isCompactHyp4D h || isParacompactHyp4D h

/-- The 5 Platonic solids `{p, q}`. -/
def spherical3List : List (Nat × Nat) :=
  [ (3, 3), (4, 3), (3, 4), (5, 3), (3, 5) ]

/-- The 6 regular 4-polytopes `{a, b, c}`. -/
def spherical4List : List (Nat × Nat × Nat) :=
  [ (3, 3, 3), (4, 3, 3), (3, 3, 4), (3, 4, 3), (5, 3, 3), (3, 3, 5) ]

/-- The 5 compact regular 4D hyperbolic honeycombs (Coxeter 1956, Table II). -/
def compactHyp4DList : List Schlafli4D :=
  [ ⟨3, 3, 3, 5⟩, ⟨5, 3, 3, 3⟩, ⟨4, 3, 3, 5⟩, ⟨5, 3, 3, 4⟩, ⟨5, 3, 3, 5⟩ ]

/-- The 2 paracompact regular 4D hyperbolic honeycombs (Coxeter 1956, Table II). -/
def paracompactHyp4DList : List Schlafli4D :=
  [ ⟨3, 4, 3, 4⟩, ⟨4, 3, 4, 3⟩ ]

/-- Complete Coxeter (1956) list of all 7 finite-covolume regular 4D hyperbolic honeycombs. -/
def allFiniteCovolumeHyp4DList : List Schlafli4D :=
  compactHyp4DList ++ paracompactHyp4DList

/-- The 3 regular 4D Euclidean honeycombs (`det B_5 = 0`, zero curvature). -/
def euclidean4DList : List Schlafli4D :=
  [ ⟨4, 3, 3, 4⟩, ⟨3, 3, 4, 3⟩, ⟨3, 4, 3, 3⟩ ]

/-- The 3 regular 5-polytopes (`det B_5 > 0`, spherical). -/
def spherical5List : List Schlafli4D :=
  [ ⟨3, 3, 3, 3⟩, ⟨4, 3, 3, 3⟩, ⟨3, 3, 3, 4⟩ ]

private theorem cosSq8Lower_ge6 (m : Nat) (hm : m ≥ 6) : cosSq8Lower m = ⟨6, 0⟩ := by
  unfold cosSq8Lower
  match m with
  | 0 | 1 | 2 | 3 | 4 | 5 => omega
  | _ + 6 => rfl

private theorem isSpherical3_bounds (p q : Nat) (h : isSpherical3 p q = true) :
    (3 ≤ p ∧ p ≤ 5) ∧ (3 ≤ q ∧ q ≤ 5) := by
  unfold isSpherical3 at h
  have h12 := bool_and_left h
  have hpos := bool_and_right h
  have hp3 : p ≥ 3 := decide_true_mp (bool_and_left h12)
  have hq3 : q ≥ 3 := decide_true_mp (bool_and_right h12)
  have hp5 : p ≤ 5 := by
    if hp : p ≤ 5 then
      exact hp
    else
      unfold schlafliMinor3 schlafliMinor2 at hpos
      rw [cosSq8Lower_ge6 p (by omega)] at hpos
      if hq6 : q ≥ 6 then
        rw [cosSq8Lower_ge6 q hq6] at hpos
        exact absurd hpos (by decide)
      else
        match q with
        | 0 | 1 | 2 => omega
        | 3 => exact absurd hpos (by decide)
        | 4 => exact absurd hpos (by decide)
        | 5 => exact absurd hpos (by decide)
        | _ + 6 => omega
  have hq5 : q ≤ 5 := by
    if hq : q ≤ 5 then
      exact hq
    else
      unfold schlafliMinor3 schlafliMinor2 at hpos
      rw [cosSq8Lower_ge6 q (by omega)] at hpos
      match p with
      | 0 | 1 | 2 => omega
      | 3 => exact absurd hpos (by decide)
      | 4 => exact absurd hpos (by decide)
      | 5 => exact absurd hpos (by decide)
      | _ + 6 => omega
  exact ⟨⟨hp3, hp5⟩, ⟨hq3, hq5⟩⟩

private theorem isSpherical4_bounds (a b c : Nat) (h : isSpherical4 a b c = true) :
    (3 ≤ a ∧ a ≤ 5) ∧ (3 ≤ b ∧ b ≤ 5) ∧ (3 ≤ c ∧ c ≤ 5) := by
  unfold isSpherical4 at h
  have h12 := bool_and_left h
  have hab := isSpherical3_bounds a b (bool_and_left h12)
  have hbc := isSpherical3_bounds b c (bool_and_right h12)
  exact ⟨hab.1, hab.2, hbc.2⟩

private theorem isEuclidean4_bounds (a b c : Nat) (h : isEuclidean4 a b c = true) :
    (3 ≤ a ∧ a ≤ 5) ∧ (3 ≤ b ∧ b ≤ 5) ∧ (3 ≤ c ∧ c ≤ 5) := by
  unfold isEuclidean4 at h
  have h12 := bool_and_left h
  have hab := isSpherical3_bounds a b (bool_and_left h12)
  have hbc := isSpherical3_bounds b c (bool_and_right h12)
  exact ⟨hab.1, hab.2, hbc.2⟩

/-- First-principles classification of all 5 Platonic solids `{p, q}` over ALL `p, q : Nat`. -/
theorem thm_classify_spherical3 (p q : Nat) :
    isSpherical3 p q = true ↔ (p, q) ∈ spherical3List := by
  constructor
  · intro h
    have hb := isSpherical3_bounds p q h
    have hAll : ∀ a b : Fin 3,
        isSpherical3 (a.val + 3) (b.val + 3) = true → (a.val + 3, b.val + 3) ∈ spherical3List := by
      decide
    have hInst := hAll ⟨p - 3, by omega⟩ ⟨q - 3, by omega⟩
    have ep : p - 3 + 3 = p := by omega
    have eq' : q - 3 + 3 = q := by omega
    change isSpherical3 (p - 3 + 3) (q - 3 + 3) = true → (p - 3 + 3, q - 3 + 3) ∈ spherical3List at hInst
    rw [ep, eq'] at hInst
    exact hInst h
  · intro hmem
    have hAll : ∀ x ∈ spherical3List, isSpherical3 x.1 x.2 = true := by decide
    exact hAll (p, q) hmem

/-- First-principles classification of all 6 regular 4-polytopes `{a, b, c}` over ALL `a, b, c : Nat`. -/
theorem thm_classify_spherical4 (a b c : Nat) :
    isSpherical4 a b c = true ↔ (a, b, c) ∈ spherical4List := by
  constructor
  · intro h
    have hb := isSpherical4_bounds a b c h
    have hAll : ∀ i j k : Fin 3,
        isSpherical4 (i.val + 3) (j.val + 3) (k.val + 3) = true →
        (i.val + 3, j.val + 3, k.val + 3) ∈ spherical4List := by
      decide
    have hInst := hAll ⟨a - 3, by omega⟩ ⟨b - 3, by omega⟩ ⟨c - 3, by omega⟩
    have ea : a - 3 + 3 = a := by omega
    have eb : b - 3 + 3 = b := by omega
    have ec : c - 3 + 3 = c := by omega
    change isSpherical4 (a - 3 + 3) (b - 3 + 3) (c - 3 + 3) = true →
      (a - 3 + 3, b - 3 + 3, c - 3 + 3) ∈ spherical4List at hInst
    rw [ea, eb, ec] at hInst
    exact hInst h
  · intro hmem
    have hAll : ∀ x ∈ spherical4List, isSpherical4 x.1 x.2.1 x.2.2 = true := by decide
    exact hAll (a, b, c) hmem

/-- First-principles uniqueness of the 3D regular Euclidean cubic honeycomb `{4,3,4}` over ALL `a, b, c : Nat`. -/
theorem thm_classify_euclidean4_unique (a b c : Nat) :
    isEuclidean4 a b c = true ↔ (a, b, c) = (4, 3, 4) := by
  constructor
  · intro h
    have hb := isEuclidean4_bounds a b c h
    have hAll : ∀ i j k : Fin 3,
        isEuclidean4 (i.val + 3) (j.val + 3) (k.val + 3) = true →
        (i.val + 3, j.val + 3, k.val + 3) = (4, 3, 4) := by
      decide
    have hInst := hAll ⟨a - 3, by omega⟩ ⟨b - 3, by omega⟩ ⟨c - 3, by omega⟩
    have ea : a - 3 + 3 = a := by omega
    have eb : b - 3 + 3 = b := by omega
    have ec : c - 3 + 3 = c := by omega
    change isEuclidean4 (a - 3 + 3) (b - 3 + 3) (c - 3 + 3) = true →
      (a - 3 + 3, b - 3 + 3, c - 3 + 3) = (4, 3, 4) at hInst
    rw [ea, eb, ec] at hInst
    exact hInst h
  · intro heq
    cases heq
    decide

private theorem schlafli4D_bounds_of_compact (h : Schlafli4D) (hc : isCompactHyp4D h = true) :
    (3 ≤ h.p ∧ h.p ≤ 5) ∧ (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5) ∧ (3 ≤ h.s ∧ h.s ≤ 5) := by
  unfold isCompactHyp4D at hc
  have h12 := bool_and_left hc
  have hCell := isSpherical4_bounds h.p h.q h.r (bool_and_left h12)
  have hVf := isSpherical4_bounds h.q h.r h.s (bool_and_right h12)
  exact ⟨hCell.1, hCell.2.1, hCell.2.2, hVf.2.2⟩

private theorem schlafli4D_bounds_of_paracompact (h : Schlafli4D) (hp : isParacompactHyp4D h = true) :
    (3 ≤ h.p ∧ h.p ≤ 5) ∧ (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5) ∧ (3 ≤ h.s ∧ h.s ≤ 5) := by
  unfold isParacompactHyp4D at hp
  have hDisj := bool_and_left hp
  cases bool_or_elim hDisj with
  | inl h12 =>
    cases bool_or_elim h12 with
    | inl hSE =>
      have hCell := isSpherical4_bounds h.p h.q h.r (bool_and_left hSE)
      have hVf := isEuclidean4_bounds h.q h.r h.s (bool_and_right hSE)
      exact ⟨hCell.1, hCell.2.1, hCell.2.2, hVf.2.2⟩
    | inr hES =>
      have hCell := isEuclidean4_bounds h.p h.q h.r (bool_and_left hES)
      have hVf := isSpherical4_bounds h.q h.r h.s (bool_and_right hES)
      exact ⟨hCell.1, hCell.2.1, hCell.2.2, hVf.2.2⟩
  | inr hEE =>
    have hCell := isEuclidean4_bounds h.p h.q h.r (bool_and_left hEE)
    have hVf := isEuclidean4_bounds h.q h.r h.s (bool_and_right hEE)
    exact ⟨hCell.1, hCell.2.1, hCell.2.2, hVf.2.2⟩

private theorem schlafli4D_bounds_of_euclidean (h : Schlafli4D) (he : isEuclidean4D h = true) :
    (3 ≤ h.p ∧ h.p ≤ 5) ∧ (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5) ∧ (3 ≤ h.s ∧ h.s ≤ 5) := by
  unfold isEuclidean4D at he
  have h12 := bool_and_left he
  have hCell := isSpherical4_bounds h.p h.q h.r (bool_and_left h12)
  have hVf := isSpherical4_bounds h.q h.r h.s (bool_and_right h12)
  exact ⟨hCell.1, hCell.2.1, hCell.2.2, hVf.2.2⟩

private theorem schlafli4D_bounds_of_spherical5 (h : Schlafli4D) (hs : isSpherical5 h = true) :
    (3 ≤ h.p ∧ h.p ≤ 5) ∧ (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5) ∧ (3 ≤ h.s ∧ h.s ≤ 5) := by
  unfold isSpherical5 at hs
  have h12 := bool_and_left hs
  have hCell := isSpherical4_bounds h.p h.q h.r (bool_and_left h12)
  have hVf := isSpherical4_bounds h.q h.r h.s (bool_and_right h12)
  exact ⟨hCell.1, hCell.2.1, hCell.2.2, hVf.2.2⟩

/-- Complete Coxeter (1956) classification of all 5 compact regular 4D hyperbolic honeycombs
    over ALL `h : Schlafli4D` (unconditional over all `p, q, r, s : Nat`). -/
theorem thm_coxeter_classify_compact_4d (h : Schlafli4D) :
    isCompactHyp4D h = true ↔ h ∈ compactHyp4DList := by
  constructor
  · intro hc
    cases h with
    | mk p q r s =>
      have hb : (3 ≤ p ∧ p ≤ 5) ∧ (3 ≤ q ∧ q ≤ 5) ∧ (3 ≤ r ∧ r ≤ 5) ∧ (3 ≤ s ∧ s ≤ 5) :=
        schlafli4D_bounds_of_compact ⟨p, q, r, s⟩ hc
      have hAll : ∀ a b c d : Fin 3,
          isCompactHyp4D ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ = true →
          ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ ∈ compactHyp4DList := by
        decide
      have hInst := hAll ⟨p - 3, by omega⟩ ⟨q - 3, by omega⟩ ⟨r - 3, by omega⟩ ⟨s - 3, by omega⟩
      have ep : p - 3 + 3 = p := by omega
      have eq' : q - 3 + 3 = q := by omega
      have er : r - 3 + 3 = r := by omega
      have es : s - 3 + 3 = s := by omega
      change isCompactHyp4D ⟨p - 3 + 3, q - 3 + 3, r - 3 + 3, s - 3 + 3⟩ = true →
        ⟨p - 3 + 3, q - 3 + 3, r - 3 + 3, s - 3 + 3⟩ ∈ compactHyp4DList at hInst
      rw [ep, eq', er, es] at hInst
      exact hInst hc
  · intro hmem
    have hAll : ∀ x ∈ compactHyp4DList, isCompactHyp4D x = true := by decide
    exact hAll h hmem

/-- Complete Coxeter (1956) classification of all 2 paracompact regular 4D hyperbolic honeycombs
    (`{3,4,3,4}` and `{4,3,4,3}`) over ALL `h : Schlafli4D` (unconditional over all `p, q, r, s : Nat`). -/
theorem thm_coxeter_classify_paracompact_4d (h : Schlafli4D) :
    isParacompactHyp4D h = true ↔ h ∈ paracompactHyp4DList := by
  constructor
  · intro hp
    cases h with
    | mk p q r s =>
      have hb : (3 ≤ p ∧ p ≤ 5) ∧ (3 ≤ q ∧ q ≤ 5) ∧ (3 ≤ r ∧ r ≤ 5) ∧ (3 ≤ s ∧ s ≤ 5) :=
        schlafli4D_bounds_of_paracompact ⟨p, q, r, s⟩ hp
      have hAll : ∀ a b c d : Fin 3,
          isParacompactHyp4D ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ = true →
          ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ ∈ paracompactHyp4DList := by
        decide
      have hInst := hAll ⟨p - 3, by omega⟩ ⟨q - 3, by omega⟩ ⟨r - 3, by omega⟩ ⟨s - 3, by omega⟩
      have ep : p - 3 + 3 = p := by omega
      have eq' : q - 3 + 3 = q := by omega
      have er : r - 3 + 3 = r := by omega
      have es : s - 3 + 3 = s := by omega
      change isParacompactHyp4D ⟨p - 3 + 3, q - 3 + 3, r - 3 + 3, s - 3 + 3⟩ = true →
        ⟨p - 3 + 3, q - 3 + 3, r - 3 + 3, s - 3 + 3⟩ ∈ paracompactHyp4DList at hInst
      rw [ep, eq', er, es] at hInst
      exact hInst hp
  · intro hmem
    have hAll : ∀ x ∈ paracompactHyp4DList, isParacompactHyp4D x = true := by decide
    exact hAll h hmem

/-- Complete classification of all 3 regular 4D Euclidean honeycombs (`{4,3,3,4}`, `{3,3,4,3}`, `{3,4,3,3}`). -/
theorem thm_coxeter_classify_euclidean_4d (h : Schlafli4D) :
    isEuclidean4D h = true ↔ h ∈ euclidean4DList := by
  constructor
  · intro he
    cases h with
    | mk p q r s =>
      have hb : (3 ≤ p ∧ p ≤ 5) ∧ (3 ≤ q ∧ q ≤ 5) ∧ (3 ≤ r ∧ r ≤ 5) ∧ (3 ≤ s ∧ s ≤ 5) :=
        schlafli4D_bounds_of_euclidean ⟨p, q, r, s⟩ he
      have hAll : ∀ a b c d : Fin 3,
          isEuclidean4D ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ = true →
          ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ ∈ euclidean4DList := by
        decide
      have hInst := hAll ⟨p - 3, by omega⟩ ⟨q - 3, by omega⟩ ⟨r - 3, by omega⟩ ⟨s - 3, by omega⟩
      have ep : p - 3 + 3 = p := by omega
      have eq' : q - 3 + 3 = q := by omega
      have er : r - 3 + 3 = r := by omega
      have es : s - 3 + 3 = s := by omega
      change isEuclidean4D ⟨p - 3 + 3, q - 3 + 3, r - 3 + 3, s - 3 + 3⟩ = true →
        ⟨p - 3 + 3, q - 3 + 3, r - 3 + 3, s - 3 + 3⟩ ∈ euclidean4DList at hInst
      rw [ep, eq', er, es] at hInst
      exact hInst he
  · intro hmem
    have hAll : ∀ x ∈ euclidean4DList, isEuclidean4D x = true := by decide
    exact hAll h hmem

/-- Complete classification of all 3 regular 5-polytopes (`{3,3,3,3}`, `{4,3,3,3}`, `{3,3,3,4}`). -/
theorem thm_coxeter_classify_spherical5 (h : Schlafli4D) :
    isSpherical5 h = true ↔ h ∈ spherical5List := by
  constructor
  · intro hs
    cases h with
    | mk p q r s =>
      have hb : (3 ≤ p ∧ p ≤ 5) ∧ (3 ≤ q ∧ q ≤ 5) ∧ (3 ≤ r ∧ r ≤ 5) ∧ (3 ≤ s ∧ s ≤ 5) :=
        schlafli4D_bounds_of_spherical5 ⟨p, q, r, s⟩ hs
      have hAll : ∀ a b c d : Fin 3,
          isSpherical5 ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ = true →
          ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ ∈ spherical5List := by
        decide
      have hInst := hAll ⟨p - 3, by omega⟩ ⟨q - 3, by omega⟩ ⟨r - 3, by omega⟩ ⟨s - 3, by omega⟩
      have ep : p - 3 + 3 = p := by omega
      have eq' : q - 3 + 3 = q := by omega
      have er : r - 3 + 3 = r := by omega
      have es : s - 3 + 3 = s := by omega
      change isSpherical5 ⟨p - 3 + 3, q - 3 + 3, r - 3 + 3, s - 3 + 3⟩ = true →
        ⟨p - 3 + 3, q - 3 + 3, r - 3 + 3, s - 3 + 3⟩ ∈ spherical5List at hInst
      rw [ep, eq', er, es] at hInst
      exact hInst hs
  · intro hmem
    have hAll : ∀ x ∈ spherical5List, isSpherical5 x = true := by decide
    exact hAll h hmem

/-- Complete Coxeter (1956) classification theorem:
    there are EXACTLY 7 finite-covolume regular 4D hyperbolic honeycombs (5 compact + 2 paracompact),
    and NO other `{p, q, r, s}` with `p, q, r, s : Nat` exists. -/
theorem thm_coxeter_complete_finite_covolume_4d (h : Schlafli4D) :
    isFiniteCovolumeHyp4D h = true ↔ h ∈ allFiniteCovolumeHyp4DList := by
  constructor
  · intro hfin
    unfold isFiniteCovolumeHyp4D at hfin
    cases bool_or_elim hfin with
    | inl hc =>
      have hm := (thm_coxeter_classify_compact_4d h).mp hc
      have hSub : ∀ x ∈ compactHyp4DList, x ∈ allFiniteCovolumeHyp4DList := by decide
      exact hSub h hm
    | inr hp =>
      have hm := (thm_coxeter_classify_paracompact_4d h).mp hp
      have hSub : ∀ x ∈ paracompactHyp4DList, x ∈ allFiniteCovolumeHyp4DList := by decide
      exact hSub h hm
  · intro hmem
    have hAll : ∀ x ∈ allFiniteCovolumeHyp4DList, isFiniteCovolumeHyp4D x = true := by decide
    exact hAll h hmem

/-- Exact counts certificate: 5 compact + 2 paracompact = 7 finite-covolume regular `ℍ^4` honeycombs,
    all distinct, disjoint from the 3 Euclidean `𝔼^4` honeycombs and 3 spherical 5-polytopes. -/
theorem thm_coxeter_4d_counts :
    compactHyp4DList.length = 5 ∧
    paracompactHyp4DList.length = 2 ∧
    allFiniteCovolumeHyp4DList.length = 7 ∧
    allFiniteCovolumeHyp4DList.Nodup ∧
    euclidean4DList.length = 3 ∧
    spherical5List.length = 3 := by
  decide


/-! ## Section 3: Four Structural Invariants & Unconditional `{3,4,3,4}` Uniqueness Theorems -/

/-- Predicate (1): Flat 3D Euclidean ideal-cusp horosphere (vertex figure `{q, r, s}` is `{4,3,4}`). -/
def hasFlat3DEuclideanCusp (h : Schlafli4D) : Bool :=
  isEuclidean4 h.q h.r h.s

/-- Predicate (2): Finite self-dual regular 4-polytope cell (`{p, q, r}` spherical with `p = r`,
    i.e., `{3,3,3}` 5-cell or `{3,4,3}` 24-cell). -/
def hasSelfDualFiniteCell (h : Schlafli4D) : Bool :=
  isSpherical4 h.p h.q h.r && decide (h.p = h.r)

/-- Exact facet-normal vector set of the 16-cell `{3,3,4}` (16 half-integer normals doubled to `(±1,±1,±1,±1)`). -/
def cell16Normals : List Vec4 :=
  [ ( 1,  1,  1,  1), ( 1,  1,  1, -1), ( 1,  1, -1,  1), ( 1,  1, -1, -1),
    ( 1, -1,  1,  1), ( 1, -1,  1, -1), ( 1, -1, -1,  1), ( 1, -1, -1, -1),
    (-1,  1,  1,  1), (-1,  1,  1, -1), (-1,  1, -1,  1), (-1,  1, -1, -1),
    (-1, -1,  1,  1), (-1, -1,  1, -1), (-1, -1, -1,  1), (-1, -1, -1, -1) ]

/-- Negative control: the 16-cell `{3,3,4}` facet normals violate Celmaster rank-4 `SO(4)` isotropy
    on every coordinate pair `i ≠ j` (`∑ r_i^4 = 16 ≠ 48 = 3 ∑ r_i^2 r_j^2`). -/
theorem thm_cell16_fails_rank4_isotropy :
    ∀ i j : Fin 4, i ≠ j →
      moment4 cell16Normals i i i i ≠ 3 * moment4 cell16Normals i i j j := by
  decide

/-- Predicate (3): Cell is the 24-cell `{3,4,3}`, whose 24 facet directions form the `D_4` root
    system obeying exact rank-4 `SO(4)` isotropy across all 256 tensor components (`Vibe.Geometry`). -/
def cellHasD4Rank4Isotropy (h : Schlafli4D) : Prop :=
  (h.p, h.q, h.r) = (3, 4, 3) ∧
  ∀ i j k l : Fin 4,
    moment4 d4Roots i j k l =
      4 * (kron4 i j * kron4 k l + kron4 i k * kron4 j l + kron4 i l * kron4 j k)

/-- Predicate (4): Zero straddling triangular plaquettes across the `x_0 = 0` site-reflection
    hyperplane on the cell's `D_4` lattice (`Vibe.Geometry.thm_d4_triangle_halfspace_decomposition`). -/
def zeroStraddlingTriangularPlaquettes (h : Schlafli4D) : Prop :=
  (h.p, h.q, h.r) = (3, 4, 3) ∧
  ∀ v0 v1 v2 : Vec4,
    sub4 v1 v0 ∈ d4Roots → sub4 v2 v0 ∈ d4Roots → sub4 v2 v1 ∈ d4Roots →
      (v0.1 ≥ 0 ∧ v1.1 ≥ 0 ∧ v2.1 ≥ 0) ∨ (v0.1 ≤ 0 ∧ v1.1 ≤ 0 ∧ v2.1 ≤ 0)

/-- Exact classification of the self-dual finite regular 4-polytope cells: ONLY `{3,3,3}` and `{3,4,3}`. -/
theorem thm_self_dual_regular_4polytopes (a b c : Nat) :
    (isSpherical4 a b c = true ∧ a = c) ↔ ((a, b, c) = (3, 3, 3) ∨ (a, b, c) = (3, 4, 3)) := by
  constructor
  · intro h
    have hmem := (thm_classify_spherical4 a b c).mp h.1
    have hCheck : ∀ x ∈ spherical4List, x.1 = x.2.2 → x = (3, 3, 3) ∨ x = (3, 4, 3) := by decide
    exact hCheck (a, b, c) hmem h.2
  · intro h
    cases h with
    | inl h1 => cases h1; exact ⟨by decide, rfl⟩
    | inr h2 => cases h2; exact ⟨by decide, rfl⟩

/-- Uniqueness Theorem 1 (Minimal Finite-Covolume Form):
    Among ALL finite-covolume regular 4D hyperbolic honeycombs (all 5 compact + 2 paracompact),
    `{3,4,3,4}` is ALREADY UNIQUE from Predicate (1) `hasFlat3DEuclideanCusp` alone! -/
theorem thm_uniqueness_4d_flat_cusp_finite_covolume (h : Schlafli4D) :
    (isFiniteCovolumeHyp4D h = true ∧ hasFlat3DEuclideanCusp h = true) ↔ h = honeycomb3434 := by
  constructor
  · intro hBoth
    have hmem := (thm_coxeter_complete_finite_covolume_4d h).mp hBoth.1
    have hUniq : ∀ x ∈ allFiniteCovolumeHyp4DList, hasFlat3DEuclideanCusp x = true → x = honeycomb3434 := by
      decide
    exact hUniq h hmem hBoth.2
  · intro heq
    rw [heq]
    exact ⟨by decide, by decide⟩

/-- Uniqueness Theorem 2 (Universal Over ALL `p, q, r, s : Nat`, Including Noncompact/Hyperideal):
    Even WITHOUT restricting to finite-covolume honeycombs, `{3,4,3,4}` is the UNIQUE 4D Schläfli
    symbol `{p, q, r, s}` having a flat 3D Euclidean cusp vertex figure `{q, r, s} = {4,3,4}` AND
    a finite self-dual regular 4-polytope cell `{p, q, r}` (Predicates (1) + (2)). -/
theorem thm_uniqueness_4d_flat_cusp_and_self_dual_all_nat (h : Schlafli4D) :
    (hasFlat3DEuclideanCusp h = true ∧ hasSelfDualFiniteCell h = true) ↔ h = honeycomb3434 := by
  cases h with
  | mk p q r s =>
    constructor
    · intro hBoth
      have hVf : (q, r, s) = (4, 3, 4) := (thm_classify_euclidean4_unique q r s).mp hBoth.1
      cases hVf
      have hpr : p = 3 := decide_true_mp (bool_and_right hBoth.2)
      rw [hpr]
      rfl
    · intro heq
      cases heq
      exact ⟨by decide, by decide⟩

/-- Uniqueness Theorem 2b (Universal Over ALL `p, q, r, s : Nat`, Dropping Even Self-Duality):
    ANY 4D Schläfli symbol `{p, q, r, s}` with a flat 3D Euclidean cusp `{4,3,4}` AND ANY finite
    spherical regular 4-polytope cell `{p, q, r}` is FORCED to be `{3,4,3,4}`! -/
theorem thm_uniqueness_4d_flat_cusp_and_finite_cell_all_nat (h : Schlafli4D) :
    (hasFlat3DEuclideanCusp h = true ∧ isSpherical4 h.p h.q h.r = true) ↔ h = honeycomb3434 := by
  cases h with
  | mk p q r s =>
    constructor
    · intro hBoth
      have hVf : (q, r, s) = (4, 3, 4) := (thm_classify_euclidean4_unique q r s).mp hBoth.1
      cases hVf
      have hmem := (thm_classify_spherical4 p 4 3).mp hBoth.2
      have hCheck : ∀ x ∈ spherical4List, x.2.1 = 4 → x.2.2 = 3 → x.1 = 3 := by decide
      have hp : p = 3 := hCheck (p, 4, 3) hmem rfl rfl
      rw [hp]
      rfl
    · intro heq
      cases heq
      exact ⟨by decide, by decide⟩

/-- Uniqueness Theorem 3 (Complete 4-Invariant Selection Theorem for `{3,4,3,4}`):
    `{3,4,3,4}` is the UNIQUE regular 4D hyperbolic honeycomb satisfying ALL FOUR structural invariants:
    (1) flat 3D Euclidean cusp `{4,3,4}`,
    (2) self-dual finite regular 4-polytope cell (`{3,4,3}` 24-cell),
    (3) exact `D_4` rank-4 `SO(4)` rotational isotropy (`thm_d4_rank4_so4_isotropy`), and
    (4) zero-straddling-triangle site-reflection positivity (`thm_d4_triangle_halfspace_decomposition`). -/
theorem thm_uniqueness_4d_all_four_invariants (h : Schlafli4D) :
    (isFiniteCovolumeHyp4D h = true ∧
     hasFlat3DEuclideanCusp h = true ∧
     hasSelfDualFiniteCell h = true ∧
     cellHasD4Rank4Isotropy h ∧
     zeroStraddlingTriangularPlaquettes h) ↔ h = honeycomb3434 := by
  constructor
  · intro hAll
    exact (thm_uniqueness_4d_flat_cusp_finite_covolume h).mp ⟨hAll.1, hAll.2.1⟩
  · intro heq
    rw [heq]
    exact ⟨by decide, by decide, by decide,
      ⟨rfl, thm_d4_rank4_so4_isotropy⟩,
      ⟨rfl, thm_d4_triangle_halfspace_decomposition⟩⟩

/-- Negative-Control Theorem (Hyperideal / Ultra-Ideal `m ≥ 6` & Flat `𝔼^4` Exclusion):
    1. Every 4D symbol with ANY label `≥ 6` fails `isFiniteCovolumeHyp4D` (its 3D cell or vertex
       figure is already non-spherical/hyperbolic, giving ultra-ideal infinite covolume in `ℍ^4`).
    2. Every 4D Euclidean honeycomb `{4,3,3,4}`, `{3,3,4,3}`, `{3,4,3,3}` has `minor5 = 0` and
       fails both `isFiniteCovolumeHyp4D` and `hasFlat3DEuclideanCusp`.
    3. The dual paracompact `{4,3,4,3}` has ideal `{4,3,4}` cells and finite `{3,4,3}` vertex
       figure, failing both `hasFlat3DEuclideanCusp` and `hasSelfDualFiniteCell`.
    4. All 5 compact regular `ℍ^4` honeycombs fail `hasFlat3DEuclideanCusp`. -/
theorem thm_uniqueness_4d_negative_controls :
    (∀ h : Schlafli4D, (h.p ≥ 6 ∨ h.q ≥ 6 ∨ h.r ≥ 6 ∨ h.s ≥ 6) → isFiniteCovolumeHyp4D h = false) ∧
    (euclidean4DList.all (fun h => !isFiniteCovolumeHyp4D h && !hasFlat3DEuclideanCusp h) = true) ∧
    (hasFlat3DEuclideanCusp ⟨4, 3, 4, 3⟩ = false ∧ hasSelfDualFiniteCell ⟨4, 3, 4, 3⟩ = false) ∧
    (compactHyp4DList.all (fun h => !hasFlat3DEuclideanCusp h) = true) := by
  refine ⟨?_, by decide, by decide, by decide⟩
  intro h hge
  cases hfin : isFiniteCovolumeHyp4D h with
  | false => rfl
  | true =>
    have hmem := (thm_coxeter_complete_finite_covolume_4d h).mp hfin
    have hBound : ∀ x ∈ allFiniteCovolumeHyp4DList, x.p ≤ 5 ∧ x.q ≤ 5 ∧ x.r ≤ 5 ∧ x.s ≤ 5 := by
      decide
    have hb := hBound h hmem
    omega

end Vibe
