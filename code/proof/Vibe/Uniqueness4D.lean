module

public import Vibe.Algebra
public import Vibe.Geometry
public import Mathlib.NumberTheory.Zsqrtd.Basic
import Mathlib.Tactic.Linarith

/-!
# Vibe Theory: Complete 4D Regular Hyperbolic Honeycomb Uniqueness Theorem (`{3,4,3,4}`)

Formalization over Mathlib `Zsqrtd 5` (`ℤ[√5]`) of the complete Coxeter (1956) classification of
regular 4D hyperbolic honeycombs `{p, q, r, s}` (`p, q, r, s ≥ 3`) and the unconditional
structural uniqueness theorem selecting `{3,4,3,4}` (`vibe-roadmap-board-0054`):

1. **Exact `ℤ[√5]` (`Zsqrtd 5`) Schläfli Principal Minors:** Encodes `8 cos^2(π/m)` in `Zsqrtd 5`
   for `m ∈ {3, 4, 5, 6}` (with monotone lower bound `6` for all `m ≥ 6`) and evaluates all leading
   principal minors `schlafliMinor2..5` with exact sign decisions.
2. **Unconditional First-Principles Classification (`∀ p q r s : Nat`):**
   - Rank 3 spherical (5 Platonic solids), Rank 4 spherical (6 regular 4-polytopes),
     Rank 4 Euclidean (uniquely `{4,3,4}`), Rank 5 spherical (3 regular 5-polytopes),
     Rank 5 Euclidean (3 honeycombs), Rank 5 compact hyperbolic (5 honeycombs),
     Rank 5 paracompact hyperbolic (2 honeycombs: `{3,4,3,4}` and `{4,3,4,3}`).
3. **Uniqueness Theorems & Negative Controls for `{3,4,3,4}`:**
   Bridged directly to `Vibe.Geometry` (`D_4` rank-4 `SO(4)` isotropy and zero straddling triangles),
   with explicit `16`-cell (`{3,3,4}`), hyperideal `m ≥ 6`, flat `𝔼^4`, dual `{4,3,4,3}`, and compact controls.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 1: Exact Quadratic Ring `ℤ[√5]` (`Zsqrtd 5`) & Sign Decisions -/

/-- Exact quadratic integer `a + b √5 ∈ ℤ[√5]` backed by Mathlib `Zsqrtd 5`. -/
abbrev ZSqrt5 := Zsqrtd 5

namespace ZSqrt5

def zero : ZSqrt5 := 0
def ofInt (k : Int) : ZSqrt5 := Zsqrtd.ofInt k
def add (x y : ZSqrt5) : ZSqrt5 := x + y
def sub (x y : ZSqrt5) : ZSqrt5 := x - y
def scale (k : Int) (x : ZSqrt5) : ZSqrt5 := ⟨k * x.re, k * x.im⟩
def mul (x y : ZSqrt5) : ZSqrt5 := x * y

/-- Exact decidable positivity predicate `a + b √5 > 0` over integers (zero floats). -/
def isPos (x : ZSqrt5) : Bool :=
  if x.re ≥ 0 ∧ x.im ≥ 0 then
    decide (x.re > 0 ∨ x.im > 0)
  else if x.re ≤ 0 ∧ x.im ≤ 0 then
    false
  else if x.re > 0 then
    decide (x.re * x.re > 5 * x.im * x.im)
  else
    decide (5 * x.im * x.im > x.re * x.re)

/-- Exact decidable negativity predicate `a + b √5 < 0` over integers. -/
def isNeg (x : ZSqrt5) : Bool := isPos (-x)

/-- Exact decidable zero predicate `a + b √5 = 0` (since `√5` is irrational, iff `a = 0 ∧ b = 0`). -/
def isZero (x : ZSqrt5) : Bool := decide (x.re = 0 ∧ x.im = 0)

/-- Exact sign mutual exclusion on `ℤ[√5]`: no element can be simultaneously positive and negative. -/
theorem isPos_neg_exclusive (x : ZSqrt5) : ¬ (isPos x = true ∧ isNeg x = true) := by
  rcases x with ⟨a, b⟩
  rintro ⟨hp, hn⟩
  simp only [isPos, isNeg, Zsqrtd.re_neg, Zsqrtd.im_neg] at hp hn
  split_ifs at hp hn
  all_goals
    first
    | exact Bool.false_ne_true hp
    | exact Bool.false_ne_true hn
    | (have := of_decide_eq_true hp; omega)
    | (have := of_decide_eq_true hp; have := of_decide_eq_true hn; nlinarith)

end ZSqrt5


/-! ## Section 2: Exact Schläfli Principal Minors & First-Principles Coxeter (1956) Classification -/

/-- Exact `8 cos^2(π/m)` in `ℤ[√5]` for `m ∈ {3, 4, 5, 6}`, and the sharp monotone lower bound
    `6 = 8 cos^2(π/6) ≤ 8 cos^2(π/m)` for all `m ≥ 6`. -/
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

/-- Exact decidable predicate: `{p, q, r, s}` is a COMPACT regular 4D hyperbolic honeycomb in `ℍ^4`. -/
def isCompactHyp4D (h : Schlafli4D) : Bool :=
  isSpherical4 h.p h.q h.r && isSpherical4 h.q h.r h.s &&
    ZSqrt5.isNeg (schlafliMinor5 h.p h.q h.r h.s)

/-- Exact decidable predicate: `{p, q, r, s}` is a PARACOMPACT regular 4D hyperbolic honeycomb in `ℍ^4`. -/
def isParacompactHyp4D (h : Schlafli4D) : Bool :=
  ((isSpherical4 h.p h.q h.r && isEuclidean4 h.q h.r h.s) ||
   (isEuclidean4 h.p h.q h.r && isSpherical4 h.q h.r h.s) ||
   (isEuclidean4 h.p h.q h.r && isEuclidean4 h.q h.r h.s)) &&
  ZSqrt5.isNeg (schlafliMinor5 h.p h.q h.r h.s)

/-- Exact decidable predicate: `{p, q, r, s}` is ANY finite-covolume regular 4D hyperbolic honeycomb. -/
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
  simp only [isSpherical3, Bool.and_eq_true, decide_eq_true_eq] at h
  rcases h with ⟨⟨hp3, hq3⟩, hpos⟩
  have hp5 : p ≤ 5 := by
    by_contra hp
    unfold schlafliMinor3 schlafliMinor2 at hpos
    rw [cosSq8Lower_ge6 p (by omega)] at hpos
    by_cases hq6 : q ≥ 6
    · rw [cosSq8Lower_ge6 q hq6] at hpos; exact Bool.false_ne_true hpos
    · match q with
      | 0 | 1 | 2 | _ + 6 => omega
      | 3 | 4 | 5 => exact Bool.false_ne_true hpos
  have hq5 : q ≤ 5 := by
    by_contra hq
    unfold schlafliMinor3 schlafliMinor2 at hpos
    rw [cosSq8Lower_ge6 q (by omega)] at hpos
    match p with
    | 0 | 1 | 2 | _ + 6 => omega
    | 3 | 4 | 5 => exact Bool.false_ne_true hpos
  exact ⟨⟨hp3, hp5⟩, ⟨hq3, hq5⟩⟩

private theorem isSpherical4_bounds (a b c : Nat) (h : isSpherical4 a b c = true) :
    (3 ≤ a ∧ a ≤ 5) ∧ (3 ≤ b ∧ b ≤ 5) ∧ (3 ≤ c ∧ c ≤ 5) := by
  simp only [isSpherical4, Bool.and_eq_true] at h
  exact ⟨(isSpherical3_bounds a b h.1.1).1, (isSpherical3_bounds a b h.1.1).2,
         (isSpherical3_bounds b c h.1.2).2⟩

private theorem isEuclidean4_bounds (a b c : Nat) (h : isEuclidean4 a b c = true) :
    (3 ≤ a ∧ a ≤ 5) ∧ (3 ≤ b ∧ b ≤ 5) ∧ (3 ≤ c ∧ c ≤ 5) := by
  simp only [isEuclidean4, Bool.and_eq_true] at h
  exact ⟨(isSpherical3_bounds a b h.1.1).1, (isSpherical3_bounds a b h.1.1).2,
         (isSpherical3_bounds b c h.1.2).2⟩

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
    simpa only [ep, eq'] using hInst (by simpa only [ep, eq'] using h)
  · intro hmem
    exact (by decide : ∀ x ∈ spherical3List, isSpherical3 x.1 x.2 = true) (p, q) hmem

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
    simpa only [ea, eb, ec] using hInst (by simpa only [ea, eb, ec] using h)
  · intro hmem
    exact (by decide : ∀ x ∈ spherical4List, isSpherical4 x.1 x.2.1 x.2.2 = true) (a, b, c) hmem

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
    simpa only [ea, eb, ec] using hInst (by simpa only [ea, eb, ec] using h)
  · rintro ⟨⟩; decide

private theorem schlafli4D_mem_of_fin3 (pred : Schlafli4D → Bool) (xs : List Schlafli4D)
    (h : Schlafli4D) (hp : pred h = true)
    (hb : (3 ≤ h.p ∧ h.p ≤ 5) ∧ (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5) ∧ (3 ≤ h.s ∧ h.s ≤ 5))
    (hAll : ∀ a b c d : Fin 3,
      pred ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ = true →
      ⟨a.val + 3, b.val + 3, c.val + 3, d.val + 3⟩ ∈ xs) : h ∈ xs := by
  rcases h with ⟨p, q, r, s⟩
  dsimp only at hb
  have hInst := hAll ⟨p - 3, by omega⟩ ⟨q - 3, by omega⟩ ⟨r - 3, by omega⟩ ⟨s - 3, by omega⟩
  have ep : p - 3 + 3 = p := by omega
  have eq' : q - 3 + 3 = q := by omega
  have er : r - 3 + 3 = r := by omega
  have es : s - 3 + 3 = s := by omega
  simpa only [ep, eq', er, es] using hInst (by simpa only [ep, eq', er, es] using hp)

private theorem schlafli4D_bounds_of_pair {h : Schlafli4D}
    (h1 : (3 ≤ h.p ∧ h.p ≤ 5) ∧ (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5))
    (h2 : (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5) ∧ (3 ≤ h.s ∧ h.s ≤ 5)) :
    (3 ≤ h.p ∧ h.p ≤ 5) ∧ (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5) ∧ (3 ≤ h.s ∧ h.s ≤ 5) :=
  ⟨h1.1, h1.2.1, h1.2.2, h2.2.2⟩

/-- Complete Coxeter (1956) classification of all 5 compact regular 4D hyperbolic honeycombs. -/
theorem thm_coxeter_classify_compact_4d (h : Schlafli4D) :
    isCompactHyp4D h = true ↔ h ∈ compactHyp4DList := by
  constructor
  · intro hc
    have h1 := hc
    simp only [isCompactHyp4D, Bool.and_eq_true] at h1
    exact schlafli4D_mem_of_fin3 isCompactHyp4D compactHyp4DList h hc
      (schlafli4D_bounds_of_pair (isSpherical4_bounds _ _ _ h1.1.1) (isSpherical4_bounds _ _ _ h1.1.2))
      (by decide)
  · exact (by decide : ∀ x ∈ compactHyp4DList, isCompactHyp4D x = true) h

/-- Complete Coxeter (1956) classification of all 2 paracompact regular 4D hyperbolic honeycombs. -/
theorem thm_coxeter_classify_paracompact_4d (h : Schlafli4D) :
    isParacompactHyp4D h = true ↔ h ∈ paracompactHyp4DList := by
  constructor
  · intro hp
    have h1 := hp
    simp only [isParacompactHyp4D, Bool.and_eq_true, Bool.or_eq_true] at h1
    have hb : (3 ≤ h.p ∧ h.p ≤ 5) ∧ (3 ≤ h.q ∧ h.q ≤ 5) ∧ (3 ≤ h.r ∧ h.r ≤ 5) ∧ (3 ≤ h.s ∧ h.s ≤ 5) := by
      rcases h1.1 with (⟨hc, hv⟩ | ⟨hc, hv⟩) | ⟨hc, hv⟩
      · exact schlafli4D_bounds_of_pair (isSpherical4_bounds _ _ _ hc) (isEuclidean4_bounds _ _ _ hv)
      · exact schlafli4D_bounds_of_pair (isEuclidean4_bounds _ _ _ hc) (isSpherical4_bounds _ _ _ hv)
      · exact schlafli4D_bounds_of_pair (isEuclidean4_bounds _ _ _ hc) (isEuclidean4_bounds _ _ _ hv)
    exact schlafli4D_mem_of_fin3 isParacompactHyp4D paracompactHyp4DList h hp hb (by decide)
  · exact (by decide : ∀ x ∈ paracompactHyp4DList, isParacompactHyp4D x = true) h

/-- Complete classification of all 3 regular 4D Euclidean honeycombs (`{4,3,3,4}`, `{3,3,4,3}`, `{3,4,3,3}`). -/
theorem thm_coxeter_classify_euclidean_4d (h : Schlafli4D) :
    isEuclidean4D h = true ↔ h ∈ euclidean4DList := by
  constructor
  · intro he
    have h1 := he
    simp only [isEuclidean4D, Bool.and_eq_true] at h1
    exact schlafli4D_mem_of_fin3 isEuclidean4D euclidean4DList h he
      (schlafli4D_bounds_of_pair (isSpherical4_bounds _ _ _ h1.1.1) (isSpherical4_bounds _ _ _ h1.1.2))
      (by decide)
  · exact (by decide : ∀ x ∈ euclidean4DList, isEuclidean4D x = true) h

/-- Complete classification of all 3 regular 5-polytopes (`{3,3,3,3}`, `{4,3,3,3}`, `{3,3,3,4}`). -/
theorem thm_coxeter_classify_spherical5 (h : Schlafli4D) :
    isSpherical5 h = true ↔ h ∈ spherical5List := by
  constructor
  · intro hs
    have h1 := hs
    simp only [isSpherical5, Bool.and_eq_true] at h1
    exact schlafli4D_mem_of_fin3 isSpherical5 spherical5List h hs
      (schlafli4D_bounds_of_pair (isSpherical4_bounds _ _ _ h1.1.1) (isSpherical4_bounds _ _ _ h1.1.2))
      (by decide)
  · exact (by decide : ∀ x ∈ spherical5List, isSpherical5 x = true) h

/-- Complete Coxeter (1956) classification theorem:
    EXACTLY 7 finite-covolume regular 4D hyperbolic honeycombs (5 compact + 2 paracompact). -/
theorem thm_coxeter_complete_finite_covolume_4d (h : Schlafli4D) :
    isFiniteCovolumeHyp4D h = true ↔ h ∈ allFiniteCovolumeHyp4DList := by
  constructor
  · intro hfin
    simp only [isFiniteCovolumeHyp4D, Bool.or_eq_true] at hfin
    rcases hfin with hc | hp
    · exact (by decide : ∀ x ∈ compactHyp4DList, x ∈ allFiniteCovolumeHyp4DList) h
        ((thm_coxeter_classify_compact_4d h).mp hc)
    · exact (by decide : ∀ x ∈ paracompactHyp4DList, x ∈ allFiniteCovolumeHyp4DList) h
        ((thm_coxeter_classify_paracompact_4d h).mp hp)
  · exact (by decide : ∀ x ∈ allFiniteCovolumeHyp4DList, isFiniteCovolumeHyp4D x = true) h

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

/-- Predicate (2): Finite self-dual regular 4-polytope cell (`{p, q, r}` spherical with `p = r`). -/
def hasSelfDualFiniteCell (h : Schlafli4D) : Bool :=
  isSpherical4 h.p h.q h.r && decide (h.p = h.r)

/-- Exact facet-normal vector set of the 16-cell `{3,3,4}` doubled to `(±1,±1,±1,±1)`. -/
def cell16Normals : List Vec4 :=
  [ ( 1,  1,  1,  1), ( 1,  1,  1, -1), ( 1,  1, -1,  1), ( 1,  1, -1, -1),
    ( 1, -1,  1,  1), ( 1, -1,  1, -1), ( 1, -1, -1,  1), ( 1, -1, -1, -1),
    (-1,  1,  1,  1), (-1,  1,  1, -1), (-1,  1, -1,  1), (-1,  1, -1, -1),
    (-1, -1,  1,  1), (-1, -1,  1, -1), (-1, -1, -1,  1), (-1, -1, -1, -1) ]

/-- Negative control: the 16-cell `{3,3,4}` facet normals violate Celmaster rank-4 `SO(4)` isotropy. -/
theorem thm_cell16_fails_rank4_isotropy :
    ∀ i j : Fin 4, i ≠ j →
      moment4 cell16Normals i i i i ≠ 3 * moment4 cell16Normals i i j j := by
  decide

/-- Predicate (3): Cell is `{3,4,3}` with exact `D_4` rank-4 `SO(4)` isotropy (`Vibe.Geometry`). -/
def cellHasD4Rank4Isotropy (h : Schlafli4D) : Prop :=
  (h.p, h.q, h.r) = (3, 4, 3) ∧
  ∀ i j k l : Fin 4,
    moment4 d4Roots i j k l =
      4 * (kron4 i j * kron4 k l + kron4 i k * kron4 j l + kron4 i l * kron4 j k)

/-- Predicate (4): Zero straddling triangular plaquettes across `x_0 = 0` (`Vibe.Geometry`). -/
def zeroStraddlingTriangularPlaquettes (h : Schlafli4D) : Prop :=
  (h.p, h.q, h.r) = (3, 4, 3) ∧
  ∀ v0 v1 v2 : Vec4,
    sub4 v1 v0 ∈ d4Roots → sub4 v2 v0 ∈ d4Roots → sub4 v2 v1 ∈ d4Roots →
      (v0.1 ≥ 0 ∧ v1.1 ≥ 0 ∧ v2.1 ≥ 0) ∨ (v0.1 ≤ 0 ∧ v1.1 ≤ 0 ∧ v2.1 ≤ 0)

/-- Exact classification of the self-dual finite regular 4-polytope cells: ONLY `{3,3,3}` and `{3,4,3}`. -/
theorem thm_self_dual_regular_4polytopes (a b c : Nat) :
    (isSpherical4 a b c = true ∧ a = c) ↔ ((a, b, c) = (3, 3, 3) ∨ (a, b, c) = (3, 4, 3)) := by
  constructor
  · rintro ⟨hSph, hac⟩
    exact (by decide : ∀ x ∈ spherical4List, x.1 = x.2.2 → x = (3, 3, 3) ∨ x = (3, 4, 3))
      (a, b, c) ((thm_classify_spherical4 a b c).mp hSph) hac
  · rintro (h | h) <;> cases h <;> exact ⟨by decide, rfl⟩

/-- Uniqueness Theorem 1: Among ALL finite-covolume regular 4D hyperbolic honeycombs,
    `{3,4,3,4}` is ALREADY UNIQUE from Predicate (1) `hasFlat3DEuclideanCusp` alone. -/
theorem thm_uniqueness_4d_flat_cusp_finite_covolume (h : Schlafli4D) :
    (isFiniteCovolumeHyp4D h = true ∧ hasFlat3DEuclideanCusp h = true) ↔ h = honeycomb3434 := by
  constructor
  · rintro ⟨hFin, hCusp⟩
    exact (by decide : ∀ x ∈ allFiniteCovolumeHyp4DList, hasFlat3DEuclideanCusp x = true → x = honeycomb3434)
      h ((thm_coxeter_complete_finite_covolume_4d h).mp hFin) hCusp
  · rintro rfl; exact ⟨by decide, by decide⟩

/-- Uniqueness Theorem 2 (Universal Over ALL `p, q, r, s : Nat`):
    `{3,4,3,4}` is the UNIQUE 4D Schläfli symbol with a flat 3D Euclidean cusp AND a self-dual finite cell. -/
theorem thm_uniqueness_4d_flat_cusp_and_self_dual_all_nat (h : Schlafli4D) :
    (hasFlat3DEuclideanCusp h = true ∧ hasSelfDualFiniteCell h = true) ↔ h = honeycomb3434 := by
  rcases h with ⟨p, q, r, s⟩
  constructor
  · rintro ⟨hCusp, hSD⟩
    have hVf : (q, r, s) = (4, 3, 4) := (thm_classify_euclidean4_unique q r s).mp hCusp
    cases hVf
    simp only [hasSelfDualFiniteCell, Bool.and_eq_true, decide_eq_true_eq] at hSD
    rw [hSD.2]; rfl
  · rintro ⟨⟩; exact ⟨by decide, by decide⟩

/-- Uniqueness Theorem 2b (Universal Over ALL `p, q, r, s : Nat`, Dropping Self-Duality):
    ANY 4D Schläfli symbol with a flat 3D Euclidean cusp AND ANY finite regular 4-polytope cell is `{3,4,3,4}`. -/
theorem thm_uniqueness_4d_flat_cusp_and_finite_cell_all_nat (h : Schlafli4D) :
    (hasFlat3DEuclideanCusp h = true ∧ isSpherical4 h.p h.q h.r = true) ↔ h = honeycomb3434 := by
  rcases h with ⟨p, q, r, s⟩
  constructor
  · rintro ⟨hCusp, hCell⟩
    have hVf : (q, r, s) = (4, 3, 4) := (thm_classify_euclidean4_unique q r s).mp hCusp
    cases hVf
    have hp : p = 3 := (by decide : ∀ x ∈ spherical4List, x.2.1 = 4 → x.2.2 = 3 → x.1 = 3)
      (p, 4, 3) ((thm_classify_spherical4 p 4 3).mp hCell) rfl rfl
    rw [hp]; rfl
  · rintro ⟨⟩; exact ⟨by decide, by decide⟩

/-- Uniqueness Theorem 3 (Complete 4-Invariant Selection Theorem for `{3,4,3,4}`). -/
theorem thm_uniqueness_4d_all_four_invariants (h : Schlafli4D) :
    (isFiniteCovolumeHyp4D h = true ∧
     hasFlat3DEuclideanCusp h = true ∧
     hasSelfDualFiniteCell h = true ∧
     cellHasD4Rank4Isotropy h ∧
     zeroStraddlingTriangularPlaquettes h) ↔ h = honeycomb3434 := by
  constructor
  · intro hAll
    exact (thm_uniqueness_4d_flat_cusp_finite_covolume h).mp ⟨hAll.1, hAll.2.1⟩
  · rintro rfl
    exact ⟨by decide, by decide, by decide,
      ⟨rfl, thm_d4_rank4_so4_isotropy⟩,
      ⟨rfl, thm_d4_triangle_halfspace_decomposition⟩⟩

/-- Negative-Control Theorem (Hyperideal `m ≥ 6`, flat `𝔼^4`, dual `{4,3,4,3}`, and compact exclusion). -/
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
    have hb := (by decide : ∀ x ∈ allFiniteCovolumeHyp4DList, x.p ≤ 5 ∧ x.q ≤ 5 ∧ x.r ≤ 5 ∧ x.s ≤ 5)
      h ((thm_coxeter_complete_finite_covolume_4d h).mp hfin)
    omega

end Vibe

end
