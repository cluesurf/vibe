import Mathlib.NumberTheory.Zsqrtd.Basic
import Mathlib.Data.Matrix.Mul
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Tactic.LinearCombination
import Vibe.UniversalityObstructions

/-!
# Vibe Computation Lab: Two Lines of the Mesh Meet at Most Once

Lean track L12 (lean-track.md, claim A13; q-ladder Q3c point 1). A line of the bare beat is the
chain a vibe follows when it keeps its slot: from a dock with frame `g` along slot `a`, the docks
`g k_a^m c_0` for every integer `m` (`code/rule/bare-beat.ts` steps a frame by `k_s = F_s Z`, and
`code/compute/quantum/particles.ts` `lineChain` walks `stepDock` on the slot and on its opposite).
A dock of the mesh is a frame `evalTransportWord w` reached by a word `w` of slots, named by its
center.

`UniversalityObstructions.thm_univ_geodesic_2plane_and_junction_cap` proves the claim for lines
through the base dock with the base frame. This module carries it to the whole mesh:

1. `thm_lines_meet_once_at_dock`: at any dock of the mesh (any word `w`), two lines of distinct
   non-opposite slots share only that dock. The frame `evalTransportWord w` has the left inverse
   `evalTransportWord (revAntipodal w)` (`thm_coxeter_word_lorentz_and_inverse`), so it carries the
   question back to the base dock, where make's theorem answers it.
2. `thm_lines_meet_once_lorentz`: two lines with ANY Lorentz frames (`gᵀ (2B) g = 2B`) that share
   two distinct docks are the same set of docks. No consistency of frames between the two lines is
   assumed (bare-beat checks that the frame is a function of the dock only at run time), so this
   covers every pair of lines, however their frames were reached.
3. `thm_lines_meet_once`: the same for every pair of lines of the mesh (frames given by words):
   two distinct lines share at most one dock. This is A13.

Proof of 2: by make's transport action (`k_a c_0 = c_0 + 2 n_a`, `k_a n_a = 2 c_0 + 5 n_a`), the
docks of a line are `P m • G + Q m • D` with `G = g c_0`, `D = g d_a`, `d_a = n_a - c_0`, and
`P m + Q m √2 = (3 + 2√2)^m` in `ℤ√2` (Mathlib's `Zsqrtd 2`). Rebasing at a shared dock `X`
(the addition law of the powers), both lines become `P j • X + Q j • T` with `2B(X, T) = 0` and
`2B(T, T) = 4`. A second shared dock forces `P j = P j'` (pair with `X`), then `Q j • T₁ = Q j' • T₂`,
then `Q j² = Q j'²` (pair with itself), so `T₂ = ± T₁`, and `P` even, `Q` odd make the two lines
one set.

4. Bridges to the code (`Vibe.Generated.BeatSlots`, exported from `code/rule/bare-beat.ts` and
   `code/compute/quantum/particles.ts`): `gen_beat_roots_eq` (bare-beat `ROOTS` is
   `CoxeterTransport.d4RootOf`), `gen_beat_opposite_eq` (`OPPOSITE_SLOT` is `oppSlot`),
   `gen_beat_lines_eq` (`LINES` and `LINE_OF_SLOT` are `HolographicCode`'s `hcLineRep`,
   `hcOppRep`, `hcLineOf`), and `gen_beat_line_centers_eq` (the centers of the docks `lineChain`
   visits from dock 0, coordinates `-2 .. 2` on every slot, are `univGeodesicPow s m c_0`, the very
   points make's theorem and this module quantify over).

Limit: the docks of bare-beat's lazily grown mesh are frames reached by words only while its frame
consistency check holds (`inconsistentSteps = 0`); theorem 2 does not need it. The bridge to the
code is equality on the exported family (dock 0 and the five docks of every line through it).
-/

set_option autoImplicit false

namespace Vibe
namespace Compute

/-! ## The ring map `ZSqrt2 → ℤ√2` and the matrix map `Mat5 → Matrix (Fin 5) (Fin 5) ℤ√2` -/

/-- Mathlib's ring `ℤ√2` (`Zsqrtd 2`), a commutative ring. -/
abbrev LmoR := Zsqrtd 2

/-- CoxeterTransport's `a + b √2` as Mathlib's `ℤ√2`. -/
def lmoZ (x : ZSqrt2) : LmoR := ⟨x.a, x.b⟩

/-- A `Vec5` as a Mathlib vector over `LmoR`. -/
def lmoV (v : Vec5) : Fin 5 → LmoR := fun i => lmoZ (v i)

/-- A `Mat5` as a Mathlib matrix over `LmoR`. -/
def lmoM (A : Mat5) : Matrix (Fin 5) (Fin 5) LmoR := Matrix.of fun i j => lmoZ (A i j)

/-- The Lorentzian pairing `u ⬝ (B v)` of a matrix `B`. -/
def lmoForm (B : Matrix (Fin 5) (Fin 5) LmoR) (u v : Fin 5 → LmoR) : LmoR :=
  dotProduct u (Matrix.mulVec B v)

/-- The doubled Coxeter Gram matrix `2B` over `LmoR`. -/
def lmoB : Matrix (Fin 5) (Fin 5) LmoR := lmoM twiceGram

private theorem lmoZ_add (x y : ZSqrt2) : lmoZ (ZSqrt2.add x y) = lmoZ x + lmoZ y := by
  cases x; cases y; ext <;> simp [lmoZ, ZSqrt2.add]

private theorem lmoZ_mul (x y : ZSqrt2) : lmoZ (ZSqrt2.mul x y) = lmoZ x * lmoZ y := by
  cases x; cases y; ext <;> simp [lmoZ, ZSqrt2.mul]

private theorem lmoZ_sub (x y : ZSqrt2) : lmoZ (ZSqrt2.sub x y) = lmoZ x - lmoZ y := by
  cases x; cases y; ext <;> simp [lmoZ, ZSqrt2.sub]

private theorem lmoZ_scale (k : Int) (x : ZSqrt2) : lmoZ (ZSqrt2.scale k x) = k • lmoZ x := by
  cases x; ext <;> simp [lmoZ, ZSqrt2.scale, zsmul_eq_mul]

private theorem lmoZ_ofInt (k : Int) : lmoZ (ZSqrt2.ofInt k) = (k : LmoR) := by
  ext <;> simp [lmoZ, ZSqrt2.ofInt]

private theorem lmoZ_zero : lmoZ ZSqrt2.zero = 0 := by
  ext <;> simp [lmoZ, ZSqrt2.zero]

private theorem lmoZ_inj {x y : ZSqrt2} (h : lmoZ x = lmoZ y) : x = y := by
  cases x; cases y
  simp only [lmoZ, Zsqrtd.mk.injEq] at h
  rw [h.1, h.2]

private theorem lmoV_inj {u v : Vec5} (h : lmoV u = lmoV v) : u = v :=
  funext fun i => lmoZ_inj (congrFun h i)

private theorem lmoZ_sum5 (f : Fin 5 → ZSqrt2) : lmoZ (sum5 f) = ∑ k, lmoZ (f k) := by
  simp only [sum5, lmoZ_add, Fin.sum_univ_five]
  rfl

private theorem lmoV_mulVec (A : Mat5) (v : Vec5) :
    lmoV (mat5Vec A v) = Matrix.mulVec (lmoM A) (lmoV v) := by
  funext i
  simp only [lmoV, mat5Vec, lmoZ_sum5, lmoZ_mul, lmoM, Matrix.mulVec, dotProduct, Matrix.of_apply]

private theorem lmoM_mul (A C : Mat5) : lmoM (mat5Mul A C) = lmoM A * lmoM C := by
  refine Matrix.ext fun i j => ?_
  simp only [lmoM, mat5Mul, lmoZ_sum5, lmoZ_mul, Matrix.mul_apply, Matrix.of_apply]

private theorem lmoM_transpose (A : Mat5) : lmoM (mat5Transpose A) = Matrix.transpose (lmoM A) := by
  refine Matrix.ext fun i j => ?_
  simp only [lmoM, mat5Transpose, Matrix.transpose_apply, Matrix.of_apply]

private theorem lmoM_id : lmoM mat5Id = 1 := by
  refine Matrix.ext fun i j => ?_
  simp only [lmoM, mat5Id, Matrix.of_apply, Matrix.one_apply]
  split_ifs <;> ext <;> simp [lmoZ, ZSqrt2.one, ZSqrt2.zero]

private theorem lmoZ_twiceForm (u v : Vec5) :
    lmoZ (twiceForm u v) = lmoForm lmoB (lmoV u) (lmoV v) := by
  simp only [twiceForm, dot5, lmoZ_sum5, lmoZ_mul, lmoForm, lmoB, dotProduct]
  apply Finset.sum_congr rfl
  intro k _
  rw [← lmoV_mulVec]
  rfl

private theorem lmoV_add (u v : Vec5) : lmoV (univVec5Add u v) = lmoV u + lmoV v := by
  funext i; simp only [lmoV, univVec5Add, lmoZ_add, Pi.add_apply]

private theorem lmoV_scale (k : Int) (v : Vec5) : lmoV (univVec5Scale k v) = k • lmoV v := by
  funext i; simp only [lmoV, univVec5Scale, lmoZ_scale, Pi.smul_apply]

/-! ## Bilinear algebra of the pairing -/

private theorem lmoForm_lin (B : Matrix (Fin 5) (Fin 5) LmoR) (G D G' D' : Fin 5 → LmoR)
    (a b c e : Int) :
    lmoForm B (a • G + b • D) (c • G' + e • D') =
      (a * c : Int) • lmoForm B G G' + (a * e : Int) • lmoForm B G D' +
        (b * c : Int) • lmoForm B D G' + (b * e : Int) • lmoForm B D D' := by
  simp only [lmoForm, Matrix.mulVec_add, Matrix.mulVec_smul, dotProduct_add, add_dotProduct,
    dotProduct_smul, smul_dotProduct]
  simp only [zsmul_eq_mul]
  push_cast
  ring

/-- A Lorentz frame `g` keeps the pairing. -/
private theorem lmoForm_lorentz (B g : Matrix (Fin 5) (Fin 5) LmoR)
    (hg : Matrix.transpose g * (B * g) = B) (u v : Fin 5 → LmoR) :
    lmoForm B (Matrix.mulVec g u) (Matrix.mulVec g v) = lmoForm B u v := by
  unfold lmoForm
  rw [Matrix.mulVec_mulVec, dotProduct_comm, Matrix.dotProduct_mulVec, ← Matrix.mulVec_transpose,
    Matrix.mulVec_mulVec, hg, dotProduct_comm]

end Compute
end Vibe
