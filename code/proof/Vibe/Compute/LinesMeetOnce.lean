import Mathlib.NumberTheory.Zsqrtd.Basic
import Mathlib.Data.Matrix.Mul
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Tactic.LinearCombination
import Vibe.UniversalityObstructions
import Vibe.HolographicCode
import Vibe.Generated.BeatSlots

/-!
# Vibe Computation Lab: Two Lines of the Mesh Meet at Most Once

Claim A13 (Q3c point 1). A line of the bare beat is the
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

private theorem lmoForm_left (B : Matrix (Fin 5) (Fin 5) LmoR) (G D Z : Fin 5 → LmoR) (a b : Int) :
    lmoForm B (a • G + b • D) Z = a • lmoForm B G Z + b • lmoForm B D Z := by
  simp only [lmoForm, add_dotProduct, smul_dotProduct]

private theorem lmoForm_smul (B : Matrix (Fin 5) (Fin 5) LmoR) (u : Fin 5 → LmoR) (q : Int) :
    lmoForm B (q • u) (q • u) = (q * q) • lmoForm B u u := by
  simp only [lmoForm, Matrix.mulVec_smul, dotProduct_smul, smul_dotProduct, smul_smul]

/-! ## The coordinates `(3 + 2√2)^m` of a line -/

/-- `3 + 2√2`: one transport along a line multiplies the plane coordinates by it. -/
def lmoW : LmoR := ⟨3, 2⟩

/-- `3 - 2√2 = (3 + 2√2)⁻¹`. -/
def lmoW' : LmoR := ⟨3, -2⟩

private theorem lmoW_mul_W' : lmoW * lmoW' = 1 := by
  ext <;> simp [lmoW, lmoW']

private theorem lmoW_re : lmoW.re = 3 := rfl

private theorem lmoW_im : lmoW.im = 2 := rfl

/-- Componentwise vector identities over `ℤ√2`. -/
local macro "lmo_vec" : tactic =>
  `(tactic| (
    funext i
    try simp only [Pi.add_apply, Pi.sub_apply, Pi.smul_apply, Pi.neg_apply]
    try simp only [zsmul_eq_mul, Zsqrtd.re_mul, Zsqrtd.im_mul, lmoW_re, lmoW_im]
    push_cast
    ring))

private theorem lmoW'_mul_W : lmoW' * lmoW = 1 := by
  rw [mul_comm]; exact lmoW_mul_W'

private theorem lmo_star_W : star lmoW = lmoW' := by
  ext <;> simp [lmoW, lmoW']

/-- `(3 + 2√2)^m` for every integer `m`, following `univGeodesicPow`'s cases. -/
def lmoE : Int → LmoR
  | Int.ofNat n => lmoW ^ n
  | Int.negSucc n => lmoW' ^ (n + 1)

/-- The `c_0` coordinate of the dock at line coordinate `m`. -/
def lmoP (m : Int) : Int := (lmoE m).re

/-- The `d_a` coordinate of the dock at line coordinate `m`. -/
def lmoQ (m : Int) : Int := (lmoE m).im

private theorem lmoE_zero : lmoE 0 = 1 := pow_zero _

private theorem lmoE_succ (m : Int) : lmoE (m + 1) = lmoE m * lmoW := by
  cases m with
  | ofNat n => exact pow_succ lmoW n
  | negSucc n =>
    cases n with
    | zero =>
      show lmoE 0 = lmoW' ^ (0 + 1) * lmoW
      rw [lmoE_zero, zero_add, pow_one, lmoW'_mul_W]
    | succ k =>
      show lmoW' ^ (k + 1) = lmoW' ^ (k + 1 + 1) * lmoW
      rw [pow_succ lmoW' (k + 1), mul_assoc, lmoW'_mul_W, mul_one]

private theorem lmoE_pred (m : Int) : lmoE (m - 1) = lmoE m * lmoW' := by
  have h := lmoE_succ (m - 1)
  rw [sub_add_cancel] at h
  rw [h, mul_assoc, lmoW_mul_W', mul_one]

private theorem lmoE_add (m j : Int) : lmoE (m + j) = lmoE m * lmoE j := by
  refine Int.induction_on j ?_ ?_ ?_
  · rw [add_zero, lmoE_zero, mul_one]
  · intro k ih
    rw [← add_assoc, lmoE_succ, ih, lmoE_succ, mul_assoc]
  · intro k ih
    rw [show m + (-(k : Int) - 1) = (m + -(k : Int)) - 1 by ring, lmoE_pred, ih, lmoE_pred, mul_assoc]

private theorem lmoE_neg (m : Int) : lmoE (-m) = star (lmoE m) := by
  cases m with
  | ofNat n =>
    cases n with
    | zero =>
      show lmoE 0 = star (lmoW ^ 0)
      rw [lmoE_zero, pow_zero, star_one]
    | succ k =>
      show lmoW' ^ (k + 1) = star (lmoW ^ (k + 1))
      rw [star_pow, lmo_star_W]
  | negSucc n =>
    show lmoW ^ (n + 1) = star (lmoW' ^ (n + 1))
    rw [star_pow, ← lmo_star_W, star_star]

private theorem lmoP_zero : lmoP 0 = 1 := by
  simp [lmoP, lmoE_zero]

private theorem lmoQ_zero : lmoQ 0 = 0 := by
  simp [lmoQ, lmoE_zero]

private theorem lmoP_neg (m : Int) : lmoP (-m) = lmoP m := by
  simp [lmoP, lmoE_neg]

private theorem lmoQ_neg (m : Int) : lmoQ (-m) = -lmoQ m := by
  simp [lmoQ, lmoE_neg]

private theorem lmoP_add (m j : Int) :
    lmoP (m + j) = lmoP m * lmoP j + 2 * lmoQ m * lmoQ j := by
  simp [lmoP, lmoQ, lmoE_add]

private theorem lmoQ_add (m j : Int) : lmoQ (m + j) = lmoP m * lmoQ j + lmoQ m * lmoP j := by
  simp [lmoP, lmoQ, lmoE_add]

/-- Every dock of a line lies on the hyperboloid: `P² - 2 Q² = 1`. -/
private theorem lmo_pell (m : Int) : lmoP m * lmoP m - 2 * lmoQ m * lmoQ m = 1 := by
  have h := congrArg Zsqrtd.re (lmoE_add m (-m))
  rw [add_neg_cancel, lmoE_zero, lmoE_neg] at h
  simp only [Zsqrtd.re_one, Zsqrtd.re_mul, Zsqrtd.re_star, Zsqrtd.im_star] at h
  simp only [lmoP, lmoQ]
  linarith

private theorem lmoW_pow_pos (n : Nat) : 1 ≤ (lmoW ^ n).re ∧ 0 ≤ (lmoW ^ n).im := by
  induction n with
  | zero => simp
  | succ k ih =>
    rw [pow_succ]
    simp only [Zsqrtd.re_mul, Zsqrtd.im_mul, lmoW_re, lmoW_im]
    omega

private theorem lmoQ_ne_zero {m : Int} (hm : m ≠ 0) : lmoQ m ≠ 0 := by
  have hpos : ∀ n : Nat, 2 ≤ lmoQ (Int.ofNat (n + 1)) := by
    intro n
    show 2 ≤ (lmoW ^ (n + 1)).im
    have := lmoW_pow_pos n
    rw [pow_succ]
    simp only [Zsqrtd.im_mul, lmoW_re, lmoW_im]
    omega
  cases m with
  | ofNat n =>
    cases n with
    | zero => exact absurd rfl hm
    | succ k => have := hpos k; omega
  | negSucc n =>
    have := hpos n
    rw [show Int.negSucc n = -(Int.ofNat (n + 1)) from rfl, lmoQ_neg]
    omega

/-! ## A line's docks in the plane of `c_0` and `d_a` -/

/-- The point `P m • G + Q m • D` of the line with base dock `G` and direction `D`. -/
def lmoPt (G D : Fin 5 → LmoR) (m : Int) : Fin 5 → LmoR := lmoP m • G + lmoQ m • D

/-- `G` is a dock center and `D` a unit direction tangent at it: `2B(G, G) = -2`,
    `2B(G, D) = 2B(D, G) = 0`, `2B(D, D) = 4`. -/
def LmoFrame (G D : Fin 5 → LmoR) : Prop :=
  lmoForm lmoB G G = -2 ∧ lmoForm lmoB G D = 0 ∧ lmoForm lmoB D G = 0 ∧ lmoForm lmoB D D = 4

private theorem lmoV_facetDir (a : Fin 24) :
    lmoV (facetDir a) = lmoV (facetNormal a) - lmoV baseCenter := by
  funext i; simp only [lmoV, facetDir, lmoZ_sub, Pi.sub_apply]

private theorem lmo_transport_c (a : Fin 24) :
    Matrix.mulVec (lmoM (transport a)) (lmoV baseCenter) =
      (3 : Int) • lmoV baseCenter + (2 : Int) • lmoV (facetDir a) := by
  have h := congrArg lmoV (thm_univ_geodesic_2plane_and_junction_cap.1 a).1
  rw [lmoV_mulVec, lmoV_add, lmoV_scale] at h
  rw [h, lmoV_facetDir]
  lmo_vec

private theorem lmo_transport_d (a : Fin 24) :
    Matrix.mulVec (lmoM (transport a)) (lmoV (facetDir a)) =
      (4 : Int) • lmoV baseCenter + (3 : Int) • lmoV (facetDir a) := by
  have hc := congrArg lmoV (thm_univ_geodesic_2plane_and_junction_cap.1 a).1
  have hn := congrArg lmoV (thm_univ_geodesic_2plane_and_junction_cap.1 a).2
  rw [lmoV_mulVec, lmoV_add, lmoV_scale] at hc
  rw [lmoV_mulVec, lmoV_add, lmoV_scale, lmoV_scale] at hn
  rw [lmoV_facetDir, Matrix.mulVec_sub, hc, hn]
  lmo_vec

private theorem lmo_pow_nat (a : Fin 24) (n : Nat) :
    Matrix.mulVec (lmoM (univMat5Pow (transport a) n)) (lmoV baseCenter) =
      (lmoW ^ n).re • lmoV baseCenter + (lmoW ^ n).im • lmoV (facetDir a) := by
  induction n with
  | zero =>
    simp only [univMat5Pow, lmoM_id, Matrix.one_mulVec, pow_zero]
    funext i
    simp
  | succ k ih =>
    simp only [univMat5Pow]
    rw [lmoM_mul, ← Matrix.mulVec_mulVec, ih, Matrix.mulVec_add, Matrix.mulVec_smul,
      Matrix.mulVec_smul, lmo_transport_c, lmo_transport_d, pow_succ]
    lmo_vec

private theorem lmoV_facetDir_opp (a : Fin 24) :
    lmoV (facetDir (oppSlot a)) = -lmoV (facetDir a) := by
  have h : ∀ (x : Fin 24) (i : Fin 5), facetDir (oppSlot x) i = ZSqrt2.neg (facetDir x i) := by
    decide +kernel
  funext i
  rw [lmoV, h a i]
  simp only [Pi.neg_apply, lmoV]
  cases facetDir a i
  ext <;> simp [lmoZ, ZSqrt2.neg]

/-- make's powers `univGeodesicPow a m` move `c_0` to `P m • c_0 + Q m • d_a`. -/
private theorem lmo_geodesic (a : Fin 24) (m : Int) :
    Matrix.mulVec (lmoM (univGeodesicPow a m)) (lmoV baseCenter) =
      lmoPt (lmoV baseCenter) (lmoV (facetDir a)) m := by
  cases m with
  | ofNat n => exact lmo_pow_nat a n
  | negSucc n =>
    show Matrix.mulVec (lmoM (univMat5Pow (transport (oppSlot a)) (n + 1))) (lmoV baseCenter) = _
    rw [lmo_pow_nat, lmoV_facetDir_opp]
    have hE : lmoE (Int.negSucc n) = star (lmoW ^ (n + 1)) := by
      show lmoW' ^ (n + 1) = _
      rw [star_pow, lmo_star_W]
    simp only [lmoPt, lmoP, lmoQ, hE, Zsqrtd.re_star, Zsqrtd.im_star]
    lmo_vec

/-- The dock at coordinate `m` of the line through the dock with frame `g` along slot `a`: the
    center `g k_a^m c_0` (bare-beat's `stepDock` multiplies a frame by `k_s`; `lineChain` walks
    slot `s` forward and its opposite back). -/
def lineDock (g : Mat5) (a : Fin 24) (m : Int) : Vec5 :=
  mat5Vec (mat5Mul g (univGeodesicPow a m)) baseCenter

private theorem lmoV_lineDock_raw (g : Mat5) (a : Fin 24) (m : Int) :
    lmoV (lineDock g a m) =
      Matrix.mulVec (lmoM g) (lmoV (mat5Vec (univGeodesicPow a m) baseCenter)) := by
  rw [lineDock, lmoV_mulVec, lmoM_mul, ← Matrix.mulVec_mulVec, ← lmoV_mulVec]

private theorem lmoV_lineDock (g : Mat5) (a : Fin 24) (m : Int) :
    lmoV (lineDock g a m) =
      lmoPt (Matrix.mulVec (lmoM g) (lmoV baseCenter))
        (Matrix.mulVec (lmoM g) (lmoV (facetDir a))) m := by
  rw [lmoV_lineDock_raw, lmoV_mulVec, lmo_geodesic]
  simp only [lmoPt, Matrix.mulVec_add, Matrix.mulVec_smul]

private theorem lmo_base_frame (a : Fin 24) : LmoFrame (lmoV baseCenter) (lmoV (facetDir a)) := by
  have hcd : ∀ x : Fin 24, twiceForm baseCenter (facetDir x) = ZSqrt2.zero := by decide +kernel
  have hdc : ∀ x : Fin 24, twiceForm (facetDir x) baseCenter = ZSqrt2.zero := by decide +kernel
  have hdd : ∀ x : Fin 24, twiceForm (facetDir x) (facetDir x) = ZSqrt2.ofInt 4 := by decide +kernel
  refine ⟨?_, ?_, ?_, ?_⟩
  · rw [← lmoZ_twiceForm, thm_coxeter_gram_and_center.2.2.1, lmoZ_ofInt]; norm_num
  · rw [← lmoZ_twiceForm, hcd a, lmoZ_zero]
  · rw [← lmoZ_twiceForm, hdc a, lmoZ_zero]
  · rw [← lmoZ_twiceForm, hdd a, lmoZ_ofInt]; norm_num

private theorem lmo_lorentz_frame (g : Mat5)
    (hg : mat5Mul (mat5Transpose g) (mat5Mul twiceGram g) = twiceGram) (a : Fin 24) :
    LmoFrame (Matrix.mulVec (lmoM g) (lmoV baseCenter))
      (Matrix.mulVec (lmoM g) (lmoV (facetDir a))) := by
  have hM : Matrix.transpose (lmoM g) * (lmoB * lmoM g) = lmoB := by
    have := congrArg lmoM hg
    rwa [lmoM_mul, lmoM_mul, lmoM_transpose] at this
  obtain ⟨h1, h2, h3, h4⟩ := lmo_base_frame a
  exact ⟨by rw [lmoForm_lorentz _ _ hM]; exact h1, by rw [lmoForm_lorentz _ _ hM]; exact h2,
    by rw [lmoForm_lorentz _ _ hM]; exact h3, by rw [lmoForm_lorentz _ _ hM]; exact h4⟩

/-! ## Rebasing a line at one of its docks, and two lines through one dock -/

private theorem lmo_rebase {G D : Fin 5 → LmoR} (h : LmoFrame G D) (m1 : Int) :
    LmoFrame (lmoPt G D m1) ((2 * lmoQ m1) • G + lmoP m1 • D) ∧
    ∀ j, lmoPt G D (m1 + j) = lmoPt (lmoPt G D m1) ((2 * lmoQ m1) • G + lmoP m1 • D) j := by
  obtain ⟨hGG, hGD, hDG, hDD⟩ := h
  have hn : ((lmoP m1 : Int) : LmoR) * lmoP m1 - 2 * lmoQ m1 * lmoQ m1 = 1 := by
    exact_mod_cast lmo_pell m1
  refine ⟨⟨?_, ?_, ?_, ?_⟩, ?_⟩
  · rw [lmoPt, lmoForm_lin, hGG, hGD, hDG, hDD]
    simp only [zsmul_eq_mul]; push_cast
    linear_combination (-2 : LmoR) * hn
  · rw [lmoPt, lmoForm_lin, hGG, hGD, hDG, hDD]
    simp only [zsmul_eq_mul]; push_cast
    ring
  · rw [lmoPt, lmoForm_lin, hGG, hGD, hDG, hDD]
    simp only [zsmul_eq_mul]; push_cast
    ring
  · rw [lmoForm_lin, hGG, hGD, hDG, hDD]
    simp only [zsmul_eq_mul]; push_cast
    linear_combination (4 : LmoR) * hn
  · intro j
    simp only [lmoPt, lmoP_add, lmoQ_add]
    lmo_vec

private theorem lmo_cancel (q : Int) (u v : Fin 5 → LmoR) (hq : q ≠ 0) (h : q • u = q • v) :
    u = v := by
  funext i
  have e := congrFun h i
  simp only [Pi.smul_apply, zsmul_eq_mul] at e
  exact Zsqrtd.eq_of_smul_eq_smul_left hq e

private theorem lmo_meet {X T1 T2 : Fin 5 → LmoR} (h1 : LmoFrame X T1) (h2 : LmoFrame X T2)
    {j j' : Int} (hY : lmoPt X T1 j = lmoPt X T2 j') (hne : lmoPt X T1 j ≠ X) :
    ∀ x, (∃ k, x = lmoPt X T1 k) ↔ (∃ k, x = lmoPt X T2 k) := by
  obtain ⟨hXX, _, hT1X, hT1T1⟩ := h1
  obtain ⟨_, _, hT2X, hT2T2⟩ := h2
  have hj : j ≠ 0 := by
    rintro rfl
    apply hne
    funext i
    simp [lmoPt, lmoP_zero, lmoQ_zero]
  have hP : lmoP j = lmoP j' := by
    have e := congrArg (fun v => lmoForm lmoB v X) hY
    simp only [lmoPt] at e
    rw [lmoForm_left, lmoForm_left, hXX, hT1X, hT2X] at e
    have e' := congrArg Zsqrtd.re e
    simp only [zsmul_eq_mul, Zsqrtd.re_add, Zsqrtd.re_mul, Zsqrtd.re_intCast, Zsqrtd.im_intCast,
      Zsqrtd.re_neg, Zsqrtd.im_neg, Zsqrtd.re_zero, Zsqrtd.im_zero, Zsqrtd.re_ofNat,
      Zsqrtd.im_ofNat] at e'
    omega
  have hQT : lmoQ j • T1 = lmoQ j' • T2 := by
    unfold lmoPt at hY
    rw [hP] at hY
    exact add_left_cancel hY
  have hq : lmoQ j ≠ 0 := lmoQ_ne_zero hj
  have hsq : lmoQ j' = lmoQ j ∨ lmoQ j' = -lmoQ j := by
    have e := congrArg (fun v => lmoForm lmoB v v) hQT
    simp only [lmoForm_smul] at e
    rw [hT1T1, hT2T2] at e
    have e' := congrArg Zsqrtd.re e
    simp only [zsmul_eq_mul, Zsqrtd.re_mul, Zsqrtd.re_intCast, Zsqrtd.im_intCast,
      Zsqrtd.re_ofNat, Zsqrtd.im_ofNat, Nat.cast_ofNat] at e'
    have h' : lmoQ j' * lmoQ j' = lmoQ j * lmoQ j := by linarith
    exact mul_self_eq_mul_self_iff.mp h'
  rcases hsq with hs | hs
  · rw [hs] at hQT
    have hT := lmo_cancel _ _ _ hq hQT
    subst hT
    exact fun _ => Iff.rfl
  · rw [hs, neg_smul, ← smul_neg] at hQT
    have hT := lmo_cancel _ _ _ hq hQT
    subst hT
    intro x
    constructor
    · rintro ⟨k, rfl⟩
      refine ⟨-k, ?_⟩
      funext i
      simp only [lmoPt, lmoP_neg, lmoQ_neg, Pi.add_apply, Pi.smul_apply, Pi.neg_apply, neg_smul,
        smul_neg]
    · rintro ⟨k, rfl⟩
      refine ⟨-k, ?_⟩
      funext i
      simp only [lmoPt, lmoP_neg, lmoQ_neg, Pi.add_apply, Pi.smul_apply, neg_smul,
        smul_neg, neg_neg]

private theorem lmo_plane {G D G' D' : Fin 5 → LmoR} (h : LmoFrame G D) (h' : LmoFrame G' D')
    {m1 m2 n1 n2 : Int} (e1 : lmoPt G D m1 = lmoPt G' D' n1)
    (e2 : lmoPt G D m2 = lmoPt G' D' n2) (hne : lmoPt G D m1 ≠ lmoPt G D m2) :
    ∀ x, (∃ m, x = lmoPt G D m) ↔ (∃ n, x = lmoPt G' D' n) := by
  obtain ⟨hF1, hR1⟩ := lmo_rebase h m1
  obtain ⟨hF2, hR2⟩ := lmo_rebase h' n1
  rw [← e1] at hF2 hR2
  have hY1 : lmoPt G D m2 =
      lmoPt (lmoPt G D m1) ((2 * lmoQ m1) • G + lmoP m1 • D) (m2 - m1) := by
    rw [← hR1, add_sub_cancel]
  have hY2 : lmoPt G' D' n2 =
      lmoPt (lmoPt G D m1) ((2 * lmoQ n1) • G' + lmoP n1 • D') (n2 - n1) := by
    rw [← hR2, add_sub_cancel]
  have hmeet := lmo_meet hF1 hF2 (by rw [← hY1, ← hY2, e2]) (by rw [← hY1]; exact fun e => hne e.symm)
  intro x
  have s1 : (∃ m, x = lmoPt G D m) ↔
      (∃ k, x = lmoPt (lmoPt G D m1) ((2 * lmoQ m1) • G + lmoP m1 • D) k) :=
    ⟨fun ⟨m, hm⟩ => ⟨m - m1, by rw [hm, ← hR1, add_sub_cancel]⟩,
     fun ⟨k, hk⟩ => ⟨m1 + k, by rw [hk, hR1]⟩⟩
  have s2 : (∃ n, x = lmoPt G' D' n) ↔
      (∃ k, x = lmoPt (lmoPt G D m1) ((2 * lmoQ n1) • G' + lmoP n1 • D') k) :=
    ⟨fun ⟨n, hn⟩ => ⟨n - n1, by rw [hn, ← hR2, add_sub_cancel]⟩,
     fun ⟨k, hk⟩ => ⟨n1 + k, by rw [hk, hR2]⟩⟩
  rw [s1, s2]
  exact hmeet x

/-! ## Headline theorems -/

/-- Lines meet once at any dock (make's theorem carried to the whole mesh by transitivity): at the
    dock with frame `evalTransportWord w`, for ANY word `w`, two lines of slots `a1 ≠ a2`,
    `a1 ≠ oppSlot a2` share only that dock. The frame has the left inverse
    `evalTransportWord (revAntipodal w)`, which carries the shared dock back to the base dock, where
    `thm_univ_geodesic_2plane_and_junction_cap` (part 2) gives `m = n = 0`. -/
theorem thm_lines_meet_once_at_dock (w : List (Fin 24)) (a1 a2 : Fin 24)
    (hne1 : a1 ≠ a2) (hne2 : a1 ≠ oppSlot a2) (m n : Int)
    (h : lineDock (evalTransportWord w) a1 m = lineDock (evalTransportWord w) a2 n) :
    m = 0 ∧ n = 0 := by
  have hInv := (thm_coxeter_word_lorentz_and_inverse w).2.2
  have hBase : mat5Vec (univGeodesicPow a1 m) baseCenter = mat5Vec (univGeodesicPow a2 n) baseCenter := by
    apply lmoV_inj
    have hv := congrArg (fun v => Matrix.mulVec (lmoM (evalTransportWord (revAntipodal w))) (lmoV v)) h
    simp only [lmoV_lineDock_raw, Matrix.mulVec_mulVec] at hv
    rwa [← lmoM_mul, hInv, lmoM_id, Matrix.one_mulVec, Matrix.one_mulVec] at hv
  exact thm_univ_geodesic_2plane_and_junction_cap.2.1 a1 a2 hne1 hne2 m n hBase

/-- Two lines with ANY Lorentz frames (`gᵀ (2B) g = 2B`, no consistency between the two frames
    assumed) that share two distinct docks are the same set of docks. -/
theorem thm_lines_meet_once_lorentz (g1 g2 : Mat5)
    (hg1 : mat5Mul (mat5Transpose g1) (mat5Mul twiceGram g1) = twiceGram)
    (hg2 : mat5Mul (mat5Transpose g2) (mat5Mul twiceGram g2) = twiceGram)
    (a1 a2 : Fin 24) (m1 m2 n1 n2 : Int)
    (e1 : lineDock g1 a1 m1 = lineDock g2 a2 n1) (e2 : lineDock g1 a1 m2 = lineDock g2 a2 n2)
    (hne : lineDock g1 a1 m1 ≠ lineDock g1 a1 m2) :
    ∀ x : Vec5, (∃ m : Int, x = lineDock g1 a1 m) ↔ (∃ n : Int, x = lineDock g2 a2 n) := by
  have e1' := congrArg lmoV e1
  have e2' := congrArg lmoV e2
  rw [lmoV_lineDock, lmoV_lineDock] at e1' e2'
  have hne' : lmoPt (Matrix.mulVec (lmoM g1) (lmoV baseCenter))
      (Matrix.mulVec (lmoM g1) (lmoV (facetDir a1))) m1 ≠
      lmoPt (Matrix.mulVec (lmoM g1) (lmoV baseCenter))
      (Matrix.mulVec (lmoM g1) (lmoV (facetDir a1))) m2 := by
    rw [← lmoV_lineDock, ← lmoV_lineDock]
    exact fun e => hne (lmoV_inj e)
  have hP := lmo_plane (lmo_lorentz_frame g1 hg1 a1) (lmo_lorentz_frame g2 hg2 a2) e1' e2' hne'
  intro x
  have t1 : (∃ m : Int, x = lineDock g1 a1 m) ↔
      (∃ m, lmoV x = lmoPt (Matrix.mulVec (lmoM g1) (lmoV baseCenter))
        (Matrix.mulVec (lmoM g1) (lmoV (facetDir a1))) m) :=
    ⟨fun ⟨m, hm⟩ => ⟨m, by rw [hm, lmoV_lineDock]⟩,
     fun ⟨m, hm⟩ => ⟨m, lmoV_inj (by rw [hm, lmoV_lineDock])⟩⟩
  have t2 : (∃ n : Int, x = lineDock g2 a2 n) ↔
      (∃ n, lmoV x = lmoPt (Matrix.mulVec (lmoM g2) (lmoV baseCenter))
        (Matrix.mulVec (lmoM g2) (lmoV (facetDir a2))) n) :=
    ⟨fun ⟨n, hn⟩ => ⟨n, by rw [hn, lmoV_lineDock]⟩,
     fun ⟨n, hn⟩ => ⟨n, lmoV_inj (by rw [hn, lmoV_lineDock])⟩⟩
  rw [t1, t2]
  exact hP (lmoV x)

/-- A13, Q3c point 1 on the whole mesh: two lines of the mesh (frames reached by any
    words `w1`, `w2`, any slots) that share two distinct docks are the same set of docks. So two
    distinct lines share at most one dock. -/
theorem thm_lines_meet_once (w1 w2 : List (Fin 24)) (a1 a2 : Fin 24) (m1 m2 n1 n2 : Int)
    (e1 : lineDock (evalTransportWord w1) a1 m1 = lineDock (evalTransportWord w2) a2 n1)
    (e2 : lineDock (evalTransportWord w1) a1 m2 = lineDock (evalTransportWord w2) a2 n2)
    (hne : lineDock (evalTransportWord w1) a1 m1 ≠ lineDock (evalTransportWord w1) a1 m2) :
    ∀ x : Vec5, (∃ m : Int, x = lineDock (evalTransportWord w1) a1 m) ↔
      (∃ n : Int, x = lineDock (evalTransportWord w2) a2 n) :=
  thm_lines_meet_once_lorentz _ _ (thm_coxeter_word_lorentz_and_inverse w1).1
    (thm_coxeter_word_lorentz_and_inverse w2).1 a1 a2 m1 m2 n1 n2 e1 e2 hne

/-! ## Bridges to bare-beat.ts and particles.ts (`Vibe.Generated.BeatSlots`) -/

/-- A `Vec5` as the five `(a, b)` pairs the exporter writes for a dock center. -/
def lmoPairs (v : Vec5) : List (Int × Int) := (List.finRange 5).map fun i => ((v i).a, (v i).b)

/-- bare-beat.ts `ROOTS` is `CoxeterTransport.d4RootOf`, slot for slot. -/
theorem gen_beat_roots_eq : Generated.beatRoots = (List.finRange 24).map d4RootOf := by
  decide +kernel

/-- bare-beat.ts `OPPOSITE_SLOT` is `CoxeterTransport.oppSlot`. -/
theorem gen_beat_opposite_eq :
    Generated.beatOppositeSlot = (List.finRange 24).map fun a => (oppSlot a).val := by
  decide +kernel

/-- bare-beat.ts `LINES` and `LINE_OF_SLOT` are `HolographicCode`'s `hcLineRep`, `hcOppRep` and
    `hcLineOf`. -/
theorem gen_beat_lines_eq :
    Generated.beatLines = (List.finRange 12).map (fun l => ((hcLineRep l).val, (hcOppRep l).val)) ∧
    Generated.beatLineOfSlot = (List.finRange 24).map fun a => (hcLineOf a).val := by
  decide +kernel

/-- The docks bare-beat's `lineChain(0, s, 2)` visits from dock 0 (the empty word) at coordinates
    `-2 .. 2` have exactly the centers `lineDock (evalTransportWord []) s m` that the theorems above
    quantify over, for all 24 slots. -/
theorem gen_beat_line_centers_eq :
    Generated.beatLineCenters = (List.finRange 24).map fun s =>
      [-2, -1, 0, 1, 2].map fun m => lmoPairs (lineDock (evalTransportWord []) s m) := by
  decide +kernel

end Compute
end Vibe
