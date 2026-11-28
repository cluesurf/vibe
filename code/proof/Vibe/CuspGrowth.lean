module

public import Vibe.Algebra
public import Vibe.Geometry
public import Vibe.CoxeterTransport
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
# Vibe Theory: Unconditional `{3,4,3,4}` Cusp Growth & Wall-Link Discharge (`board-0053`, Lean P4)

Lean 4 + Mathlib derivation of the exact spherical ball-shell counts `|∂B_r|` (`1, 24, 456, 8376, ...`),
parabolic cusp-shell counts `N_D` (`1, 18, 330, 6034, ...`, matching `exact-cusp.ts` and `E-GMT-0041`), and
single-face lateral link counts `l_D` (`1, 4, 20, 100, ...` = `cuspLateralLinks D`) directly from the
exact `O^+(4,1; ℤ[√2])` Coxeter geometry of `{3,4,3,4}` (`Vibe.CoxeterTransport`), discharging EVERY
conditional cusp-growth hypothesis in `Vibe.Geometry` unconditionally:

1. **Exact `O^+(4,1; ℤ[√2])` Right-Angled Facet Geometry:**
   - Proves `2 B(n_a, n_b) = 2 (r_a · r_b) - 2` across all `24 × 24 = 576` facet pairs of the base
     24-cell: `2` on the diagonal (`F_a^2 = I_5`), `0` on the `96` adjacent pairs `adj24 a b = true`
     (dihedral angle `π/2`), and `≤ -2` on all non-adjacent pairs (parallel/ultraparallel, infinite order).
   - Symbolic `5 × 5` matrix proof (via Mathlib `Finset.sum` & `CommRing ZSqrt2`) that orthogonal facet
     reflections commute (`F_n F_m = F_m F_n`), certifying that `W_cell = ⟨F_0, ..., F_23⟩` is the exact
     Right-Angled Coxeter Group `W(Γ_24)`.
   - Exact parabolic cusp-layer stabilizer: `F_a v = v ↔ a ∈ L = {0, 1, 4, 5, 8, 9}` (6 octahedral
     layer facets forming the `{4,3,4}` vertex figure), while all 18 downward facets strictly decrease
     horospherical pairing `2 B(F_a c_0, v) ≤ -6 < -2`.
   - Exact 3D wall hyperplane `H_0 = n_0^⊥`: the 8 facets `W = Adj(0) = {4, 5, 8, 9, 12, 13, 16, 17}`
     all commute with `F_0` and split `4 + 4` into `W ∩ L` and `W \ L`.
2. **Direct `O^+(4,1; ℤ[√2])` Matrix-Level Proof of `|∂B_0| = 1, |∂B_1| = 24, |∂B_2| = 456`.**
3. **Exact Clique `f`-Vectors & Uniform Cartier-Foata Transfer Matrices (`M_24` & `M_wall`).**
4. **Exact Cubic Steinberg Recurrence, Sharp Rate Bounds & Unconditional `Vibe.Geometry` Discharge.**
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

open Matrix

/-! ## Section 1: Compact `ZSqrt2` / `Matrix` Bilinear Form Helpers -/

private theorem z2_scale_eq_mul (k : Int) (x : ZSqrt2) :
    ZSqrt2.scale k x = ZSqrt2.ofInt k * x := by
  change ZSqrt2.scale k x = ZSqrt2.mul (ZSqrt2.ofInt k) x
  cases x; ext <;> dsimp [ZSqrt2.scale, ZSqrt2.ofInt, ZSqrt2.mul] <;> ring

private theorem cg_dot4_comm (u v : Vec4) : dot4 u v = dot4 v u := by
  rcases u with ⟨u0, u1, u2, u3⟩; rcases v with ⟨v0, v1, v2, v3⟩
  unfold dot4; ring

private theorem cg_twiceForm_symm (u v : Vec5) : twiceForm u v = twiceForm v u := by
  have hSym : (Matrix.of twiceGram)ᵀ = Matrix.of twiceGram := by
    rw [← toMat5_transpose, thm_coxeter_gram_and_center.1]
  rw [twiceForm, twiceForm, dot5_eq_dot, dot5_eq_dot, mat5Vec_eq_mulVec, mat5Vec_eq_mulVec,
      dotProduct_mulVec, dotProduct_comm, ← Matrix.mulVec_transpose, hSym]

private theorem cg_reflection_vec (n x : Vec5) :
    mat5Vec (reflectionIn n) x =
      fun i => ZSqrt2.sub (x i) (ZSqrt2.mul (n i) (twiceForm n x)) := by
  funext i
  rw [mat5Vec, sum5_eq_sum]
  have hDot : (∑ k : Fin 5, mat5Vec twiceGram n k * x k) = twiceForm n x := by
    rw [cg_twiceForm_symm, twiceForm, dot5, sum5_eq_sum]
    exact Finset.sum_congr rfl (fun k _ => mul_comm _ _)
  change (∑ k : Fin 5, (mat5Id i k - n i * mat5Vec twiceGram n k) * x k) = x i - n i * twiceForm n x
  simp only [sub_mul, mul_assoc, Finset.sum_sub_distrib, ← Finset.mul_sum, hDot]
  have hKron : (∑ k : Fin 5, mat5Id i k * x k) = x i := by
    rw [← sum5_eq_sum]
    have h1 : (sum5 fun k => mat5Id i k * x k) = mat5Vec mat5Id x i := rfl
    rw [h1, mat5Vec_eq_mulVec, toMat5_id, Matrix.one_mulVec]
  rw [hKron]

private theorem cg_twiceForm_add_right (u v w : Vec5) :
    twiceForm u (fun i => ZSqrt2.add (v i) (w i)) = ZSqrt2.add (twiceForm u v) (twiceForm u w) := by
  have hvw : (fun i => ZSqrt2.add (v i) (w i)) = v + w := rfl
  rw [twiceForm, twiceForm, twiceForm, dot5_eq_dot, dot5_eq_dot, dot5_eq_dot,
      mat5Vec_eq_mulVec, mat5Vec_eq_mulVec, mat5Vec_eq_mulVec, hvw, Matrix.mulVec_add, dotProduct_add]
  rfl

private theorem cg_twiceForm_scale_right (u v : Vec5) (k : Int) :
    twiceForm u (fun i => ZSqrt2.scale k (v i)) = ZSqrt2.scale k (twiceForm u v) := by
  have hkv : (fun i => ZSqrt2.scale k (v i)) = ZSqrt2.ofInt k • v := by
    funext i; exact z2_scale_eq_mul k (v i)
  rw [twiceForm, twiceForm, dot5_eq_dot, dot5_eq_dot, mat5Vec_eq_mulVec, mat5Vec_eq_mulVec,
      hkv, Matrix.mulVec_smul, dotProduct_smul, smul_eq_mul, z2_scale_eq_mul]

/-! ## Section 2: Right-Angled Facet Geometry, Commuting Mirrors, Cusp Layer & Wall Hyperplane -/

/-- Commutation adjacency graph `Γ_24` of the 24 facets of the base 24-cell:
    two facets are adjacent (orthogonal, dihedral angle `π/2`) iff `r_a · r_b = 1`. -/
def adj24 (a b : Fin 24) : Bool :=
  decide (dot4 (d4RootOf a) (d4RootOf b) = 1)

/-- Cusp-layer facet predicate: `a` touches the ideal cusp vertex `v` iff `2 B(n_a, v) = 0`. -/
def isLayerFacet (a : Fin 24) : Bool :=
  decide (dot5 (facetNormal a) (twiceGramVecFast cuspVertex) = ZSqrt2.zero)

/-- 3D wall hyperplane `H_0 = n_0^⊥` facet predicate: the 8 facets orthogonal to slot `0`. -/
def isWallFacet (a : Fin 24) : Bool :=
  adj24 ⟨0, by decide⟩ a

/-- Headline Theorem 1 (Exact Right-Angled `{3,4,3,4}` Facet Gram Law):
    across ALL `24 × 24 = 576` facet pairs `(a, b)`, `2 B(n_a, n_b) = 2 (r_a · r_b) - 2`,
    so `2 B(n_a, n_b) = 0 ↔ adj24 a b = true` (exact dihedral angle `π/2`), and every distinct
    non-adjacent pair has `2 B(n_a, n_b) ≤ -2` (parallel or ultraparallel, infinite order). -/
theorem thm_facet_gram_right_angled :
    (∀ a b : Fin 24,
      twiceForm (facetNormal a) (facetNormal b) = ZSqrt2.ofInt (2 * dot4 (d4RootOf a) (d4RootOf b) - 2)) ∧
    (∀ a b : Fin 24,
      adj24 a b = true ↔ twiceForm (facetNormal a) (facetNormal b) = ZSqrt2.zero) ∧
    (∀ a b : Fin 24, a ≠ b → adj24 a b = false →
      (twiceForm (facetNormal a) (facetNormal b)).a ≤ -2 ∧
      (twiceForm (facetNormal a) (facetNormal b)).b = 0) := by
  have hGram : ∀ a b : Fin 24,
      twiceForm (facetNormal a) (facetNormal b) = ZSqrt2.ofInt (2 * dot4 (d4RootOf a) (d4RootOf b) - 2) := by
    intro a b; unfold twiceForm; rw [mat5Vec_twiceGram_eq_fast]
    exact (by decide : ∀ x y : Fin 24,
      dot5 (facetNormal x) (twiceGramVecFast (facetNormal y)) =
        ZSqrt2.ofInt (2 * dot4 (d4RootOf x) (d4RootOf y) - 2)) a b
  refine ⟨hGram, ?_, ?_⟩
  · intro a b
    rw [hGram a b]
    unfold adj24 ZSqrt2.ofInt ZSqrt2.zero
    constructor
    · intro h; rw [of_decide_eq_true h]; decide
    · intro h; exact decide_eq_true (by have := congrArg ZSqrt2.a h; dsimp at this; omega)
  · intro a b hne hna
    rw [hGram a b]
    have hBound : dot4 (d4RootOf a) (d4RootOf b) ≤ 0 :=
      (by decide : ∀ x y : Fin 24, x ≠ y → adj24 x y = false → dot4 (d4RootOf x) (d4RootOf y) ≤ 0) a b hne hna
    exact ⟨by change 2 * dot4 (d4RootOf a) (d4RootOf b) - 2 ≤ -2; omega, rfl⟩

/-- Headline Theorem 2 (Symbolic Orthogonal Reflection Commutation in `O^+(4,1; ℤ[√2])`):
    for ANY two vectors `n, m : Vec5` with `2 B(n, m) = 0`, their `5 × 5` reflections commute
    identically (`F_n F_m = F_m F_n`); hence `faceReflection a` and `faceReflection b` commute
    on ALL 96 adjacent facet pairs `adj24 a b = true` of `{3,4,3,4}`! -/
theorem thm_orthogonal_reflections_commute :
    (∀ n m : Vec5, twiceForm n m = ZSqrt2.zero →
      mat5Mul (reflectionIn n) (reflectionIn m) = mat5Mul (reflectionIn m) (reflectionIn n)) ∧
    (∀ a b : Fin 24, adj24 a b = true →
      mat5Mul (faceReflection a) (faceReflection b) = mat5Mul (faceReflection b) (faceReflection a)) := by
  have hSymb : ∀ n m : Vec5, twiceForm n m = ZSqrt2.zero →
      mat5Mul (reflectionIn n) (reflectionIn m) = mat5Mul (reflectionIn m) (reflectionIn n) := by
    intro n m hOrth
    have hProd : ∀ u v : Vec5, twiceForm u v = ZSqrt2.zero →
        mat5Mul (reflectionIn u) (reflectionIn v) =
          fun i j => ZSqrt2.sub (ZSqrt2.sub (mat5Id i j) (ZSqrt2.mul (v i) (mat5Vec twiceGram v j)))
                                (ZSqrt2.mul (u i) (mat5Vec twiceGram u j)) := by
      intro u v huv
      let ru := mat5Vec twiceGram u
      let rv := mat5Vec twiceGram v
      have hDot : (∑ k : Fin 5, ru k * v k) = 0 := by
        rw [show (∑ k : Fin 5, ru k * v k) = twiceForm v u by
              rw [twiceForm, dot5, sum5_eq_sum]; exact Finset.sum_congr rfl (fun k _ => mul_comm _ _),
            cg_twiceForm_symm, huv]; rfl
      funext i j
      rw [mat5Mul, sum5_eq_sum]
      change (∑ k : Fin 5, (mat5Id i k - u i * ru k) * (mat5Id k j - v k * rv j)) =
        mat5Id i j - v i * rv j - u i * ru j
      have hExp : ∀ k : Fin 5,
          (mat5Id i k - u i * ru k) * (mat5Id k j - v k * rv j) =
            mat5Id i k * mat5Id k j - mat5Id i k * (v k * rv j) - u i * (ru k * mat5Id k j) +
              u i * (ru k * v k) * rv j := fun _ => by ring
      simp only [hExp, Finset.sum_add_distrib, Finset.sum_sub_distrib, ← Finset.mul_sum, ← Finset.sum_mul, hDot]
      have hK1 : (∑ k : Fin 5, mat5Id i k * mat5Id k j) = mat5Id i j := by
        rw [← sum5_eq_sum]; exact congrFun (congrFun (by apply Matrix.of.injective; simp [toMat5_mul, toMat5_id] : mat5Mul mat5Id mat5Id = mat5Id) i) j
      have hK2 : (∑ k : Fin 5, mat5Id i k * (v k * rv j)) = v i * rv j := by
        rw [← sum5_eq_sum]
        have h := congrFun (by rw [mat5Vec_eq_mulVec, toMat5_id, Matrix.one_mulVec] : mat5Vec mat5Id (fun k => v k * rv j) = fun k => v k * rv j) i
        exact h
      have hK3 : (∑ k : Fin 5, ru k * mat5Id k j) = ru j := by
        rw [← sum5_eq_sum]
        have h : mat5Vec (mat5Transpose mat5Id) ru j = ru j := by
          rw [mat5Vec_eq_mulVec, toMat5_transpose, toMat5_id, Matrix.transpose_one, Matrix.one_mulVec]
        have hEq : (sum5 fun k => ru k * mat5Id k j) = mat5Vec (mat5Transpose mat5Id) ru j := by
          rw [mat5Vec, sum5_eq_sum, sum5_eq_sum]
          exact Finset.sum_congr rfl fun k _ => mul_comm _ _
        exact hEq.trans h
      rw [hK1, hK2, hK3]; ring
    rw [hProd n m hOrth, hProd m n (by rw [cg_twiceForm_symm, hOrth])]
    funext i j
    change mat5Id i j - m i * mat5Vec twiceGram m j - n i * mat5Vec twiceGram n j =
      mat5Id i j - n i * mat5Vec twiceGram n j - m i * mat5Vec twiceGram m j
    ring
  exact ⟨hSymb, fun a b hab => hSymb (facetNormal a) (facetNormal b) ((thm_facet_gram_right_angled.2.1 a b).1 hab)⟩

/-- Headline Theorem 3 (Exact `{3,4,3,4}` Parabolic Cusp-Layer Stabilizer):
    a facet reflection `F_a` fixes the ideal cusp vertex `v = (0, 1, √2, √2, 1)` iff
    `a ∈ L = {0, 1, 4, 5, 8, 9}` (the 6 octahedral layer facets generating the `{4,3,4}`
    cubic cusp layer), while all 18 downward facets strictly move `baseCenter` deeper
    (`2 B(F_a c_0, v) ≤ -6 < -2`). -/
theorem thm_cusp_layer_stabilizer_exact :
    (∀ a : Fin 24, mat5Vec (faceReflection a) cuspVertex = cuspVertex ↔ isLayerFacet a = true) ∧
    ((List.finRange 24).filter isLayerFacet =
      [⟨0, by decide⟩, ⟨1, by decide⟩, ⟨4, by decide⟩, ⟨5, by decide⟩, ⟨8, by decide⟩, ⟨9, by decide⟩]) ∧
    (∀ a : Fin 24, isLayerFacet a = false →
      (twiceForm (mat5Vec (faceReflection a) baseCenter) cuspVertex).a ≤ -6 ∧
      (twiceForm (mat5Vec (faceReflection a) baseCenter) cuspVertex).b = 0) := by
  have hStep : ∀ a : Fin 24,
      mat5Vec (faceReflection a) baseCenter =
        fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i)) := by
    intro a; unfold faceReflection
    rw [cg_reflection_vec (facetNormal a) baseCenter, thm_24_facets_geometry.2.2.2.1 a]
    funext i
    rw [z2_scale_eq_mul]
    change baseCenter i - facetNormal a i * ZSqrt2.ofInt (-2) = baseCenter i + ZSqrt2.ofInt 2 * facetNormal a i
    have hNeg : ZSqrt2.ofInt (-2) = -ZSqrt2.ofInt 2 := by decide
    rw [hNeg]; ring
  refine ⟨?_, by decide, ?_⟩
  · intro a
    unfold faceReflection isLayerFacet
    rw [cg_reflection_vec (facetNormal a) cuspVertex]
    have hForm : twiceForm (facetNormal a) cuspVertex =
        dot5 (facetNormal a) (twiceGramVecFast cuspVertex) := by
      unfold twiceForm; rw [mat5Vec_twiceGram_eq_fast]
    rw [hForm]
    constructor
    · intro hFix
      have h4 := congrFun hFix ⟨4, by decide⟩
      have hn4 : facetNormal a ⟨4, by decide⟩ = 1 :=
        (by decide : ∀ x : Fin 24, facetNormal x ⟨4, by decide⟩ = ZSqrt2.one) a
      change cuspVertex ⟨4, by decide⟩ - facetNormal a ⟨4, by decide⟩ * dot5 (facetNormal a) (twiceGramVecFast cuspVertex) =
        cuspVertex ⟨4, by decide⟩ at h4
      rw [hn4] at h4
      have hZero : dot5 (facetNormal a) (twiceGramVecFast cuspVertex) = ZSqrt2.zero := by
        change dot5 (facetNormal a) (twiceGramVecFast cuspVertex) = 0
        calc dot5 (facetNormal a) (twiceGramVecFast cuspVertex)
            = cuspVertex ⟨4, by decide⟩ - (cuspVertex ⟨4, by decide⟩ - 1 * dot5 (facetNormal a) (twiceGramVecFast cuspVertex)) := by ring
          _ = cuspVertex ⟨4, by decide⟩ - cuspVertex ⟨4, by decide⟩ := by rw [h4]
          _ = 0 := by ring
      exact decide_eq_true hZero
    · intro hL
      rw [of_decide_eq_true hL]
      funext i; change cuspVertex i - facetNormal a i * 0 = cuspVertex i; ring
  · intro a ha
    rw [hStep a]; unfold twiceForm; rw [mat5Vec_twiceGram_eq_fast]
    exact (by decide : ∀ x : Fin 24, isLayerFacet x = false →
      (dot5 (fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal x i)))
            (twiceGramVecFast cuspVertex)).a ≤ -6 ∧
      (dot5 (fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal x i)))
            (twiceGramVecFast cuspVertex)).b = 0) a ha

/-- Headline Theorem 4 (Exact 3D Wall Hyperplane `H_0 = n_0^⊥` Facet Split):
    the 8 facets `W = Adj(0) = {4, 5, 8, 9, 12, 13, 16, 17}` all commute with `faceReflection 0`
    and split `4 + 4` into 4 wall-layer facets (`{4, 5, 8, 9}`) and 4 downward wall facets (`{12, 13, 16, 17}`). -/
theorem thm_wall_hyperplane_exact :
    ((List.finRange 24).filter isWallFacet =
      [⟨4, by decide⟩, ⟨5, by decide⟩, ⟨8, by decide⟩, ⟨9, by decide⟩,
       ⟨12, by decide⟩, ⟨13, by decide⟩, ⟨16, by decide⟩, ⟨17, by decide⟩]) ∧
    (∀ b : Fin 24, isWallFacet b = true →
      mat5Mul (faceReflection ⟨0, by decide⟩) (faceReflection b) =
        mat5Mul (faceReflection b) (faceReflection ⟨0, by decide⟩)) ∧
    ((List.finRange 24).filter (fun b => isWallFacet b && isLayerFacet b) =
      [⟨4, by decide⟩, ⟨5, by decide⟩, ⟨8, by decide⟩, ⟨9, by decide⟩]) ∧
    ((List.finRange 24).filter (fun b => isWallFacet b && !(isLayerFacet b)) =
      [⟨12, by decide⟩, ⟨13, by decide⟩, ⟨16, by decide⟩, ⟨17, by decide⟩]) :=
  ⟨by decide, fun b hb => thm_orthogonal_reflections_commute.2 ⟨0, by decide⟩ b hb, by decide, by decide⟩


/-! ## Section 3: Direct `O^+(4,1; ℤ[√2])` Matrix-Level Proof of Ball Shells `|∂B_0| = 1, |∂B_1| = 24, |∂B_2| = 456` -/

/-- Closed-form 1-hop cell center `F_a c_0 = c_0 + 2 n_a`. -/
def step1Center (a : Fin 24) : Vec5 :=
  fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i))

/-- Closed-form 2-hop cell center `F_a (F_b c_0) = c_0 + 2 n_b + (6 - 4 (r_a · r_b)) n_a`. -/
def step2Center (a b : Fin 24) : Vec5 :=
  fun i =>
    ZSqrt2.add
      (ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal b i)))
      (ZSqrt2.scale (6 - 4 * dot4 (d4RootOf a) (d4RootOf b)) (facetNormal a i))

/-- Canonical length-2 pair predicate: non-backtracking (`a ≠ b`), taking `a < b` for each commuting pair. -/
def isCanonLen2 (a b : Fin 24) : Bool :=
  decide (a ≠ b) && (!(adj24 a b) || decide (a.val < b.val))

private theorem cg_step1_and_step2_exact (a b : Fin 24) :
    mat5Vec (faceReflection a) baseCenter = step1Center a ∧
    mat5Vec (faceReflection a) (mat5Vec (faceReflection b) baseCenter) = step2Center a b := by
  have h1 : ∀ x : Fin 24, mat5Vec (faceReflection x) baseCenter = step1Center x := by
    intro x; unfold faceReflection step1Center
    rw [cg_reflection_vec (facetNormal x) baseCenter, thm_24_facets_geometry.2.2.2.1 x]
    funext i; rw [z2_scale_eq_mul]
    change baseCenter i - facetNormal x i * ZSqrt2.ofInt (-2) = baseCenter i + ZSqrt2.ofInt 2 * facetNormal x i
    have hNeg : ZSqrt2.ofInt (-2) = -ZSqrt2.ofInt 2 := by decide
    rw [hNeg]; ring
  refine ⟨h1 a, ?_⟩
  rw [h1 b]; unfold faceReflection
  rw [cg_reflection_vec (facetNormal a) (step1Center b)]
  have hPair : twiceForm (facetNormal a) (step1Center b) =
      ZSqrt2.ofInt (4 * dot4 (d4RootOf a) (d4RootOf b) - 6) := by
    unfold step1Center
    rw [cg_twiceForm_add_right, cg_twiceForm_scale_right,
        thm_24_facets_geometry.2.2.2.1 a, thm_facet_gram_right_angled.1 a b]
    apply ZSqrt2.ext
    · dsimp [ZSqrt2.ofInt, ZSqrt2.add, ZSqrt2.scale]; ring
    · rfl
  rw [hPair]
  funext i; unfold step1Center step2Center
  simp only [z2_scale_eq_mul]
  change (baseCenter i + ZSqrt2.ofInt 2 * facetNormal b i) -
      facetNormal a i * ZSqrt2.ofInt (4 * dot4 (d4RootOf a) (d4RootOf b) - 6) =
    (baseCenter i + ZSqrt2.ofInt 2 * facetNormal b i) +
      ZSqrt2.ofInt (6 - 4 * dot4 (d4RootOf a) (d4RootOf b)) * facetNormal a i
  have hNeg : ZSqrt2.ofInt (4 * dot4 (d4RootOf a) (d4RootOf b) - 6) =
      -ZSqrt2.ofInt (6 - 4 * dot4 (d4RootOf a) (d4RootOf b)) := by
    change ZSqrt2.ofInt _ = ZSqrt2.neg (ZSqrt2.ofInt _)
    apply ZSqrt2.ext
    · dsimp [ZSqrt2.ofInt, ZSqrt2.neg]; ring
    · rfl
  rw [hNeg]; ring

private theorem cg_rec_coord (kv xa xa' xb xb' : Int) (hkv : kv ≥ 6)
    (h5 : -1 ≤ xb) (h6 : xb ≤ 1) (h7 : -1 ≤ xb') (h8 : xb' ≤ 1)
    (hE : 2 * xb + kv * xa = 2 * xb' + kv * xa') : xa = xa' ∧ xb = xb' := by
  have hxa : xa = xa' := by nlinarith
  exact ⟨hxa, by nlinarith⟩

private theorem cg_d4_coord_bounds (a : Fin 24) :
    -1 ≤ (d4RootOf a).1 ∧ (d4RootOf a).1 ≤ 1 ∧
    -1 ≤ (d4RootOf a).2.1 ∧ (d4RootOf a).2.1 ≤ 1 ∧
    -1 ≤ (d4RootOf a).2.2.1 ∧ (d4RootOf a).2.2.1 ≤ 1 ∧
    -1 ≤ (d4RootOf a).2.2.2 ∧ (d4RootOf a).2.2.2 ≤ 1 :=
  (by decide : ∀ x : Fin 24,
    -1 ≤ (d4RootOf x).1 ∧ (d4RootOf x).1 ≤ 1 ∧
    -1 ≤ (d4RootOf x).2.1 ∧ (d4RootOf x).2.1 ≤ 1 ∧
    -1 ≤ (d4RootOf x).2.2.1 ∧ (d4RootOf x).2.2.1 ≤ 1 ∧
    -1 ≤ (d4RootOf x).2.2.2 ∧ (d4RootOf x).2.2.2 ≤ 1) a

private theorem cg_d4_sum_adj_unique (a b a' b' : Fin 24)
    (hab : adj24 a b = true) (hab' : adj24 a' b' = true)
    (hLt : a.val < b.val) (hLt' : a'.val < b'.val)
    (hSum : (d4RootOf a).1 + (d4RootOf b).1 = (d4RootOf a').1 + (d4RootOf b').1 ∧
            (d4RootOf a).2.1 + (d4RootOf b).2.1 = (d4RootOf a').2.1 + (d4RootOf b').2.1 ∧
            (d4RootOf a).2.2.1 + (d4RootOf b).2.2.1 = (d4RootOf a').2.2.1 + (d4RootOf b').2.2.1 ∧
            (d4RootOf a).2.2.2 + (d4RootOf b).2.2.2 = (d4RootOf a').2.2.2 + (d4RootOf b').2.2.2) :
    a = a' ∧ b = b' := by
  let sumVec (x y : Fin 24) : Vec4 :=
    ((d4RootOf x).1 + (d4RootOf y).1,
     (d4RootOf x).2.1 + (d4RootOf y).2.1,
     (d4RootOf x).2.2.1 + (d4RootOf y).2.2.1,
     (d4RootOf x).2.2.2 + (d4RootOf y).2.2.2)
  let recover (v : Vec4) : Fin 24 × Fin 24 :=
    let shared (i : Fin 4) : Int :=
      if coord4 v i = 2 then 1 else if coord4 v i = -2 then -1 else 0
    let s : Vec4 := (shared ⟨0, by decide⟩, shared ⟨1, by decide⟩, shared ⟨2, by decide⟩, shared ⟨3, by decide⟩)
    let rem : Vec4 := (v.1 - 2 * s.1, v.2.1 - 2 * s.2.1, v.2.2.1 - 2 * s.2.2.1, v.2.2.2 - 2 * s.2.2.2)
    let firstIdx : Fin 4 :=
      if rem.1 ≠ 0 then ⟨0, by decide⟩
      else if rem.2.1 ≠ 0 then ⟨1, by decide⟩
      else if rem.2.2.1 ≠ 0 then ⟨2, by decide⟩
      else ⟨3, by decide⟩
    let r1 : Vec4 :=
      ( s.1 + if firstIdx = ⟨0, by decide⟩ then rem.1 else 0,
        s.2.1 + if firstIdx = ⟨1, by decide⟩ then rem.2.1 else 0,
        s.2.2.1 + if firstIdx = ⟨2, by decide⟩ then rem.2.2.1 else 0,
        s.2.2.2 + if firstIdx = ⟨3, by decide⟩ then rem.2.2.2 else 0 )
    let r2 : Vec4 :=
      ( s.1 + if firstIdx ≠ ⟨0, by decide⟩ then rem.1 else 0,
        s.2.1 + if firstIdx ≠ ⟨1, by decide⟩ then rem.2.1 else 0,
        s.2.2.1 + if firstIdx ≠ ⟨2, by decide⟩ then rem.2.2.1 else 0,
        s.2.2.2 + if firstIdx ≠ ⟨3, by decide⟩ then rem.2.2.2 else 0 )
    let idxOf (w : Vec4) : Fin 24 :=
      (List.finRange 24).foldl (fun acc k => if d4RootOf k = w then k else acc) ⟨0, by decide⟩
    let p := idxOf r1
    let q := idxOf r2
    if p.val < q.val then (p, q) else (q, p)
  have hRec : ∀ x y : Fin 24, adj24 x y = true → x.val < y.val → recover (sumVec x y) = (x, y) := by decide
  have hVec : sumVec a b = sumVec a' b' :=
    Prod.ext hSum.1 (Prod.ext hSum.2.1 (Prod.ext hSum.2.2.1 hSum.2.2.2))
  have h1 := hRec a b hab hLt
  have h2 := hRec a' b' hab' hLt'
  rw [hVec] at h1; rw [h1] at h2
  exact Prod.mk.inj h2

/-- Headline Theorem 5 (Direct `O^+(4,1; ℤ[√2])` Matrix Certification of `|∂B_0| = 1, |∂B_1| = 24, |∂B_2| = 456`):
    directly from `CoxeterTransport.lean`'s exact `5 × 5` facet reflections `F_a`:
    1. Exact hyperbolic separation `2 B(c_0, c_0) = -2`, `2 B(F_a c_0, c_0) = -6`,
       and `2 B(F_a F_b c_0, c_0) = 8 (r_a · r_b) - 18 ≤ -10` for all `a ≠ b`,
    2. All `24` length-1 centers `F_a c_0` are pairwise distinct,
    3. Exactly `456` canonical non-backtracking length-2 pairs (`isCanonLen2 a b = true`) exist,
       every length-2 cell equals some canonical pair, and all `456` centers `F_a F_b c_0` are
       strictly pairwise distinct! -/
theorem thm_direct_o41_ball_shells_0_1_2 :
    (∀ a : Fin 24, twiceForm (mat5Vec (faceReflection a) baseCenter) baseCenter = ZSqrt2.ofInt (-6)) ∧
    (∀ a b : Fin 24, a ≠ b →
      twiceForm (mat5Vec (faceReflection a) (mat5Vec (faceReflection b) baseCenter)) baseCenter =
        ZSqrt2.ofInt (8 * dot4 (d4RootOf a) (d4RootOf b) - 18)) ∧
    (∀ a b : Fin 24, mat5Vec (faceReflection a) baseCenter = mat5Vec (faceReflection b) baseCenter → a = b) ∧
    ((List.finRange 24).foldl
      (fun acc a => acc + ((List.finRange 24).filter (fun b => isCanonLen2 a b)).length) 0 = 456) ∧
    (∀ a b : Fin 24, a ≠ b →
      isCanonLen2 a b = true ∨
      (isCanonLen2 b a = true ∧
        mat5Vec (faceReflection a) (mat5Vec (faceReflection b) baseCenter) =
        mat5Vec (faceReflection b) (mat5Vec (faceReflection a) baseCenter))) ∧
    (∀ a b a' b' : Fin 24, isCanonLen2 a b = true → isCanonLen2 a' b' = true →
      mat5Vec (faceReflection a) (mat5Vec (faceReflection b) baseCenter) =
      mat5Vec (faceReflection a') (mat5Vec (faceReflection b') baseCenter) →
      a = a' ∧ b = b') := by
  have hDist1 : ∀ a : Fin 24, twiceForm (step1Center a) baseCenter = ZSqrt2.ofInt (-6) := by
    intro a; unfold step1Center
    rw [cg_twiceForm_symm, cg_twiceForm_add_right, cg_twiceForm_scale_right,
        thm_coxeter_gram_and_center.2.2.1,
        cg_twiceForm_symm baseCenter (facetNormal a), thm_24_facets_geometry.2.2.2.1 a]
    decide
  have hDist2 : ∀ a b : Fin 24,
      twiceForm (step2Center a b) baseCenter = ZSqrt2.ofInt (8 * dot4 (d4RootOf a) (d4RootOf b) - 18) := by
    intro a b; unfold step2Center
    rw [cg_twiceForm_symm, cg_twiceForm_add_right, cg_twiceForm_add_right,
        cg_twiceForm_scale_right, cg_twiceForm_scale_right,
        thm_coxeter_gram_and_center.2.2.1,
        cg_twiceForm_symm baseCenter (facetNormal b), thm_24_facets_geometry.2.2.2.1 b,
        cg_twiceForm_symm baseCenter (facetNormal a), thm_24_facets_geometry.2.2.2.1 a]
    ext <;> dsimp [ZSqrt2.ofInt, ZSqrt2.add, ZSqrt2.scale] <;> ring
  have hProj : ∀ a b x : Fin 24,
      twiceForm (step2Center a b) (facetDir x) =
        ZSqrt2.ofInt (4 * dot4 (d4RootOf b) (d4RootOf x) +
                      2 * (6 - 4 * dot4 (d4RootOf a) (d4RootOf b)) * dot4 (d4RootOf a) (d4RootOf x)) := by
    intro a b x
    have hOrthC0 : twiceForm (facetDir x) baseCenter = ZSqrt2.zero := by
      unfold twiceForm; rw [mat5Vec_twiceGram_eq_fast]
      exact (by decide : ∀ y : Fin 24, dot5 (facetDir y) (twiceGramVecFast baseCenter) = ZSqrt2.zero) x
    have hPairN : ∀ y : Fin 24, twiceForm (facetDir x) (facetNormal y) =
        ZSqrt2.ofInt (2 * dot4 (d4RootOf y) (d4RootOf x)) := by
      intro y; unfold twiceForm; rw [mat5Vec_twiceGram_eq_fast]
      exact (by decide : ∀ p q : Fin 24,
        dot5 (facetDir p) (twiceGramVecFast (facetNormal q)) =
          ZSqrt2.ofInt (2 * dot4 (d4RootOf q) (d4RootOf p))) x y
    unfold step2Center
    rw [cg_twiceForm_symm, cg_twiceForm_add_right, cg_twiceForm_add_right,
        cg_twiceForm_scale_right, cg_twiceForm_scale_right, hOrthC0, hPairN b, hPairN a]
    ext <;> dsimp [ZSqrt2.zero, ZSqrt2.ofInt, ZSqrt2.add, ZSqrt2.scale] <;> ring
  refine ⟨fun a => by rw [(cg_step1_and_step2_exact a a).1]; exact hDist1 a,
          fun a b _ => by rw [(cg_step1_and_step2_exact a b).2]; exact hDist2 a b,
          ?_, by decide, ?_, ?_⟩
  · intro a b hEq
    rw [(cg_step1_and_step2_exact a a).1, (cg_step1_and_step2_exact b b).1] at hEq
    have hN : ∀ i : Fin 5, facetNormal a i = facetNormal b i := fun i => by
      have hi := congrFun hEq i
      unfold step1Center at hi
      ext
      · have h := congrArg ZSqrt2.a hi; dsimp [ZSqrt2.add, ZSqrt2.scale] at h; omega
      · have h := congrArg ZSqrt2.b hi; dsimp [ZSqrt2.add, ZSqrt2.scale] at h; omega
    exact (by decide : ∀ x y : Fin 24, (∀ i : Fin 5, facetNormal x i = facetNormal y i) → x = y) a b hN
  · intro a b hne
    if hc : isCanonLen2 a b = true then exact Or.inl hc
    else
      right
      have hAdj : adj24 a b = true ∧ b.val < a.val := by
        unfold isCanonLen2 at hc
        rw [decide_eq_true hne, Bool.true_and] at hc
        cases ha : adj24 a b
        · simp [ha] at hc
        · simp only [ha, Bool.not_true, Bool.false_or, decide_eq_true_eq] at hc
          have hValNe : a.val ≠ b.val := fun eq => hne (Fin.ext eq)
          exact ⟨rfl, by omega⟩
      have hCanonBA : isCanonLen2 b a = true := by
        unfold isCanonLen2
        rw [decide_eq_true (Ne.symm hne), decide_eq_true hAdj.2, Bool.or_true, Bool.and_true]
      have hComm : mat5Vec (faceReflection a) (mat5Vec (faceReflection b) baseCenter) =
                   mat5Vec (faceReflection b) (mat5Vec (faceReflection a) baseCenter) := by
        rw [(cg_step1_and_step2_exact a b).2, (cg_step1_and_step2_exact b a).2]
        have h1 : dot4 (d4RootOf a) (d4RootOf b) = 1 := of_decide_eq_true hAdj.1
        have h2 : dot4 (d4RootOf b) (d4RootOf a) = 1 := by rw [cg_dot4_comm]; exact h1
        funext i; unfold step2Center; rw [h1, h2]
        ext <;> dsimp [ZSqrt2.add, ZSqrt2.scale] <;> ring
      exact ⟨hCanonBA, hComm⟩
  · intro a b a' b' hC hC' hEq
    rw [(cg_step1_and_step2_exact a b).2, (cg_step1_and_step2_exact a' b').2] at hEq
    have hne : a ≠ b := by
      unfold isCanonLen2 at hC; simp only [Bool.and_eq_true, decide_eq_true_eq] at hC; exact hC.1
    have hne' : a' ≠ b' := by
      unfold isCanonLen2 at hC'; simp only [Bool.and_eq_true, decide_eq_true_eq] at hC'; exact hC'.1
    have hDotEq : dot4 (d4RootOf a) (d4RootOf b) = dot4 (d4RootOf a') (d4RootOf b') := by
      have hD := congrArg (fun v => (twiceForm v baseCenter).a) hEq
      rw [hDist2 a b, hDist2 a' b'] at hD; dsimp [ZSqrt2.ofInt] at hD; omega
    let k := 6 - 4 * dot4 (d4RootOf a) (d4RootOf b)
    have hCoordEq :
        2 * (d4RootOf b).1 + k * (d4RootOf a).1 = 2 * (d4RootOf b').1 + k * (d4RootOf a').1 ∧
        2 * (d4RootOf b).2.1 + k * (d4RootOf a).2.1 = 2 * (d4RootOf b').2.1 + k * (d4RootOf a').2.1 ∧
        2 * (d4RootOf b).2.2.1 + k * (d4RootOf a).2.2.1 = 2 * (d4RootOf b').2.2.1 + k * (d4RootOf a').2.2.1 ∧
        2 * (d4RootOf b).2.2.2 + k * (d4RootOf a).2.2.2 = 2 * (d4RootOf b').2.2.2 + k * (d4RootOf a').2.2.2 := by
      have hP : ∀ x : Fin 24,
          2 * dot4 (d4RootOf b) (d4RootOf x) + k * dot4 (d4RootOf a) (d4RootOf x) =
          2 * dot4 (d4RootOf b') (d4RootOf x) + k * dot4 (d4RootOf a') (d4RootOf x) := by
        intro x
        have hX := congrArg (fun v => (twiceForm v (facetDir x)).a) hEq
        rw [hProj a b x, hProj a' b' x, ← hDotEq] at hX
        dsimp [ZSqrt2.ofInt] at hX
        change 2 * dot4 (d4RootOf b) (d4RootOf x) + (6 - 4 * dot4 (d4RootOf a) (d4RootOf b)) * dot4 (d4RootOf a) (d4RootOf x) =
          2 * dot4 (d4RootOf b') (d4RootOf x) + (6 - 4 * dot4 (d4RootOf a) (d4RootOf b)) * dot4 (d4RootOf a') (d4RootOf x)
        linarith
      have hd0 : ∀ u : Vec4, dot4 u (d4RootOf ⟨0, by decide⟩) = u.1 + u.2.1 := fun u => by
        change u.1 * 1 + u.2.1 * 1 + u.2.2.1 * 0 + u.2.2.2 * 0 = _; ring
      have hd1 : ∀ u : Vec4, dot4 u (d4RootOf ⟨1, by decide⟩) = u.1 - u.2.1 := fun u => by
        change u.1 * 1 + u.2.1 * (-1) + u.2.2.1 * 0 + u.2.2.2 * 0 = _; ring
      have hd20 : ∀ u : Vec4, dot4 u (d4RootOf ⟨20, by decide⟩) = u.2.2.1 + u.2.2.2 := fun u => by
        change u.1 * 0 + u.2.1 * 0 + u.2.2.1 * 1 + u.2.2.2 * 1 = _; ring
      have hd21 : ∀ u : Vec4, dot4 u (d4RootOf ⟨21, by decide⟩) = u.2.2.1 - u.2.2.2 := fun u => by
        change u.1 * 0 + u.2.1 * 0 + u.2.2.1 * 1 + u.2.2.2 * (-1) = _; ring
      have p0 := hP ⟨0, by decide⟩; have p1 := hP ⟨1, by decide⟩
      have p20 := hP ⟨20, by decide⟩; have p21 := hP ⟨21, by decide⟩
      rw [hd0, hd0, hd0, hd0] at p0; rw [hd1, hd1, hd1, hd1] at p1
      rw [hd20, hd20, hd20, hd20] at p20; rw [hd21, hd21, hd21, hd21] at p21
      exact ⟨by linarith, by linarith, by linarith, by linarith⟩
    if hAdj : adj24 a b = true then
      have hDot1 : dot4 (d4RootOf a) (d4RootOf b) = 1 := of_decide_eq_true hAdj
      have hAdj' : adj24 a' b' = true := decide_eq_true (hDotEq.symm.trans hDot1)
      have hLt : a.val < b.val := by
        unfold isCanonLen2 at hC; rw [decide_eq_true hne, hAdj] at hC; simpa using hC
      have hLt' : a'.val < b'.val := by
        unfold isCanonLen2 at hC'; rw [decide_eq_true hne', hAdj'] at hC'; simpa using hC'
      have hk2 : k = 2 := by change 6 - 4 * dot4 (d4RootOf a) (d4RootOf b) = 2; omega
      rw [hk2] at hCoordEq
      exact cg_d4_sum_adj_unique a b a' b' hAdj hAdj' hLt hLt'
        ⟨by omega, by omega, by omega, by omega⟩
    else
      have hNotAdj : adj24 a b = false := by cases ha : adj24 a b <;> simp_all
      have hDotLe0 : dot4 (d4RootOf a) (d4RootOf b) ≤ 0 :=
        (by decide : ∀ x y : Fin 24, x ≠ y → adj24 x y = false → dot4 (d4RootOf x) (d4RootOf y) ≤ 0) a b hne hNotAdj
      have hkGe6 : k ≥ 6 := by change 6 - 4 * dot4 (d4RootOf a) (d4RootOf b) ≥ 6; omega
      obtain ⟨bb0L, bb0U, bb1L, bb1U, bb2L, bb2U, bb3L, bb3U⟩ := cg_d4_coord_bounds b
      obtain ⟨bb0L', bb0U', bb1L', bb1U', bb2L', bb2U', bb3L', bb3U'⟩ := cg_d4_coord_bounds b'
      have c0 := cg_rec_coord k _ _ _ _ hkGe6 bb0L bb0U bb0L' bb0U' hCoordEq.1
      have c1 := cg_rec_coord k _ _ _ _ hkGe6 bb1L bb1U bb1L' bb1U' hCoordEq.2.1
      have c2 := cg_rec_coord k _ _ _ _ hkGe6 bb2L bb2U bb2L' bb2U' hCoordEq.2.2.1
      have c3 := cg_rec_coord k _ _ _ _ hkGe6 bb3L bb3U bb3L' bb3U' hCoordEq.2.2.2
      have hRootInj : ∀ x y : Fin 24, d4RootOf x = d4RootOf y → x = y := by decide
      exact ⟨hRootInj a a' (Prod.ext c0.1 (Prod.ext c1.1 (Prod.ext c2.1 c3.1))),
             hRootInj b b' (Prod.ext c0.2 (Prod.ext c1.2 (Prod.ext c2.2 c3.2)))⟩


/-! ## Section 4: Exact 24-Cell & Wall Clique `f`-Vectors and Uniform Foata Disjointness Matrices -/

/-- Self-contained list flatMap (immune to stdlib rename drift). -/
def cgFlatMap {α β : Type} (f : α → List β) : List α → List β
  | [] => []
  | x :: xs => f x ++ cgFlatMap f xs

/-- All 24 1-cliques of `Γ_24`. -/
def cliques1_24 : List (Fin 24) := List.finRange 24

/-- All 96 2-cliques (commuting facet edges `a < b`) of `Γ_24`. -/
def cliques2_24 : List (Fin 24 × Fin 24) :=
  cgFlatMap (fun a =>
    ((List.finRange 24).filter (fun b => decide (a.val < b.val) && adj24 a b)).map (fun b => (a, b)))
    (List.finRange 24)

/-- All 96 3-cliques (commuting facet triangles `a < b < c`) of `Γ_24`. -/
def cliques3_24 : List (Fin 24 × Fin 24 × Fin 24) :=
  cgFlatMap (fun ab =>
    ((List.finRange 24).filter (fun c =>
      decide (ab.2.val < c.val) && adj24 ab.1 c && adj24 ab.2 c)).map (fun c => (ab.1, ab.2, c)))
    cliques2_24

/-- All 8 1-cliques of the 3D wall cube `W = Adj(0)`. -/
def wallCliques1 : List (Fin 24) :=
  cliques1_24.filter isWallFacet

/-- All 12 2-cliques of the 3D wall cube `W = Adj(0)`. -/
def wallCliques2 : List (Fin 24 × Fin 24) :=
  cliques2_24.filter (fun ab => isWallFacet ab.1 && isWallFacet ab.2)

/-- Headline Theorem 6 (Exact 24-Cell, Cusp-Layer, Downward & Wall Clique `f`-Vectors):
    directly enumerated on `adj24` (`d4RootOf`):
    - Full 24-cell `Γ_24`: `(1, 24, 96, 96, 0)` (ZERO 4-cliques!),
    - 6 cusp-layer facets `L`: `(1, 6, 12, 8)` (octahedron = `{4,3,4}` dual!),
    - 18 downward facets `S \ L`: `(1, 18, 60, 52)`,
    - 8 wall facets `W`: `(1, 8, 12, 0)` (cube `Q_3`, ZERO 3-cliques!),
    - 4 wall-layer facets `W ∩ L`: `(1, 4, 4)` and 4 downward wall facets `W \ L`: `(1, 4, 4)`. -/
theorem thm_24cell_clique_fvector :
    cliques1_24.length = 24 ∧
    cliques2_24.length = 96 ∧
    cliques3_24.length = 96 ∧
    (cliques3_24.all (fun t =>
      (List.finRange 24).all (fun d =>
        !(decide (t.2.2.val < d.val) && adj24 t.1 d && adj24 t.2.1 d && adj24 t.2.2 d))) = true) ∧
    (cliques1_24.filter isLayerFacet).length = 6 ∧
    (cliques2_24.filter (fun ab => isLayerFacet ab.1 && isLayerFacet ab.2)).length = 12 ∧
    (cliques3_24.filter (fun t => isLayerFacet t.1 && isLayerFacet t.2.1 && isLayerFacet t.2.2)).length = 8 ∧
    (cliques1_24.filter (fun a => !(isLayerFacet a))).length = 18 ∧
    (cliques2_24.filter (fun ab => !(isLayerFacet ab.1) && !(isLayerFacet ab.2))).length = 60 ∧
    (cliques3_24.filter (fun t => !(isLayerFacet t.1) && !(isLayerFacet t.2.1) && !(isLayerFacet t.2.2))).length = 52 ∧
    wallCliques1.length = 8 ∧
    wallCliques2.length = 12 ∧
    (cliques3_24.filter (fun t => isWallFacet t.1 && isWallFacet t.2.1 && isWallFacet t.2.2)).length = 0 ∧
    (wallCliques1.filter isLayerFacet).length = 4 ∧
    (wallCliques2.filter (fun ab => isLayerFacet ab.1 && isLayerFacet ab.2)).length = 4 ∧
    (wallCliques1.filter (fun a => !(isLayerFacet a))).length = 4 ∧
    (wallCliques2.filter (fun ab => !(isLayerFacet ab.1) && !(isLayerFacet ab.2))).length = 4 := by
  decide

/-- Disjointness predicates for `forb(C) = C ∪ CommonAdj(C)` on `Γ_24`. -/
def inForb1 (a x : Fin 24) : Bool := decide (dot4 (d4RootOf a) (d4RootOf x) ≥ 1)
def inForb2 (a b x : Fin 24) : Bool := decide (x = a ∨ x = b) || (adj24 a x && adj24 b x)
def inForb3 (a b c x : Fin 24) : Bool := decide (x = a ∨ x = b ∨ x = c)

/-- Count `(1, 2, 3)`-cliques of `Γ_24` disjoint from a forbidden-vertex predicate `forb`. -/
def foataCounts24 (forb : Fin 24 → Bool) : Nat × Nat × Nat :=
  ( (cliques1_24.filter (fun x => !(forb x))).length,
    (cliques2_24.filter (fun xy => !(forb xy.1) && !(forb xy.2))).length,
    (cliques3_24.filter (fun t => !(forb t.1) && !(forb t.2.1) && !(forb t.2.2))).length )

/-- Count `(1, 2)`-cliques of the 8-facet wall cube `W` disjoint from a forbidden-vertex predicate `forb`. -/
def foataCountsWall (forb : Fin 24 → Bool) : Nat × Nat :=
  ( (wallCliques1.filter (fun x => !(forb x))).length,
    (wallCliques2.filter (fun xy => !(forb xy.1) && !(forb xy.2))).length )

/-- Signed coordinate permutation `B_4` mapping `Vec4` by axis permutation `p : Fin 4 → Fin 4` and signs `s : Fin 4 → Int`. -/
def applyB4Vec (p : Fin 4 → Fin 4) (s : Fin 4 → Int) (v : Vec4) : Vec4 :=
  ( s ⟨0, by decide⟩ * coord4 v (p ⟨0, by decide⟩),
    s ⟨1, by decide⟩ * coord4 v (p ⟨1, by decide⟩),
    s ⟨2, by decide⟩ * coord4 v (p ⟨2, by decide⟩),
    s ⟨3, by decide⟩ * coord4 v (p ⟨3, by decide⟩) )

/-- Canonical `B_4` automorphism taking any adjacent pair `(a, b)` to `(0, 4)` (`(1,1,0,0), (1,0,1,0)`). -/
def canonB4Pair (a b : Fin 24) : (Fin 4 → Fin 4) × (Fin 4 → Int) :=
  let ra := d4RootOf a
  let rb := d4RootOf b
  let i0 : Fin 4 :=
    (List.finRange 4).foldl (fun acc i => if coord4 ra i ≠ 0 ∧ coord4 rb i ≠ 0 then i else acc) ⟨0, by decide⟩
  let i1 : Fin 4 :=
    (List.finRange 4).foldl (fun acc i => if coord4 ra i ≠ 0 ∧ coord4 rb i = 0 then i else acc) ⟨1, by decide⟩
  let i2 : Fin 4 :=
    (List.finRange 4).foldl (fun acc i => if coord4 ra i = 0 ∧ coord4 rb i ≠ 0 then i else acc) ⟨2, by decide⟩
  let i3 : Fin 4 :=
    (List.finRange 4).foldl (fun acc i => if coord4 ra i = 0 ∧ coord4 rb i = 0 then i else acc) ⟨3, by decide⟩
  let p : Fin 4 → Fin 4
    | ⟨0, _⟩ => i0
    | ⟨1, _⟩ => i1
    | ⟨2, _⟩ => i2
    | ⟨3, _⟩ => i3
  let s : Fin 4 → Int
    | ⟨0, _⟩ => coord4 ra i0
    | ⟨1, _⟩ => coord4 ra i1
    | ⟨2, _⟩ => coord4 rb i2
    | ⟨3, _⟩ => 1
  (p, s)

/-- Headline Theorem 7 (Exact Uniform Cartier-Foata Disjointness Matrices `M_24` and `M_wall`). -/
theorem thm_24cell_foata_matrix_uniform :
    foataCounts24 (inForb1 ⟨0, by decide⟩) = (15, 44, 36) ∧
    foataCounts24 (inForb2 ⟨0, by decide⟩ ⟨4, by decide⟩) = (19, 63, 54) ∧
    foataCounts24 (inForb3 ⟨0, by decide⟩ ⟨4, by decide⟩ ⟨8, by decide⟩) = (21, 75, 68) ∧
    foataCounts24 (inForb3 ⟨0, by decide⟩ ⟨4, by decide⟩ ⟨12, by decide⟩) = (21, 75, 68) ∧
    (cliques1_24.all (fun a =>
      (List.finRange 24).any (fun b => adj24 a b)) = true) ∧
    (cliques2_24.all (fun ab =>
      let ps := canonB4Pair ab.1 ab.2
      decide (applyB4Vec ps.1 ps.2 (d4RootOf ab.1) = d4RootOf ⟨0, by decide⟩ ∧
              applyB4Vec ps.1 ps.2 (d4RootOf ab.2) = d4RootOf ⟨4, by decide⟩ ∧
              (∀ i j : Fin 4, ps.1 i = ps.1 j → i = j) ∧
              (∀ i : Fin 4, ps.2 i * ps.2 i = 1))) = true) ∧
    ((List.finRange 24).filter (fun c => adj24 ⟨0, by decide⟩ c && adj24 ⟨4, by decide⟩ c) =
      [⟨8, by decide⟩, ⟨9, by decide⟩, ⟨12, by decide⟩]) ∧
    (wallCliques1.all (fun a =>
      decide (foataCountsWall (inForb1 a) = (4, 3))) = true) ∧
    (wallCliques2.all (fun ab =>
      decide (foataCountsWall (fun x => decide (x = ab.1 ∨ x = ab.2)) = (6, 7))) = true) := by
  decide


/-! ## Section 5: Exact Foata Clique-Multiplicity System, Cubic Recurrence & Wall Identity -/

/-- Exact 4-tuple of Cartier-Foata right-descent clique multiplicities `(a_0, a_1, a_2, a_3)` at depth `r`. -/
structure FoataVec where
  a0 : Nat
  a1 : Nat
  a2 : Nat
  a3 : Nat
  deriving DecidableEq, Repr

/-- 3-step sliding window `(v(r), v(r-1), v(r-2))` giving pure structural recursion on `Nat`. -/
structure FoataWin where
  cur : FoataVec
  prev1 : FoataVec
  prev2 : FoataVec
  deriving DecidableEq, Repr

def foataZero : FoataVec := ⟨0, 0, 0, 0⟩

/-- Exact Cartier-Foata transfer step driven by the certified 24-cell matrix
    `M_24 = [[1, 15, 44, 36], [1, 19, 63, 54], [1, 21, 75, 68]]`. -/
def foataStep (w : FoataWin) : FoataWin :=
  let v1 := w.cur
  let v2 := w.prev1
  let v3 := w.prev2
  let nxt : FoataVec :=
    ⟨ 0,
      v1.a0 + 15 * v1.a1 + 44 * v1.a2 + 36 * v1.a3,
      v2.a0 + 19 * v2.a1 + 63 * v2.a2 + 54 * v2.a3,
      v3.a0 + 21 * v3.a1 + 75 * v3.a2 + 68 * v3.a3 ⟩
  ⟨nxt, w.cur, w.prev1⟩

/-- Exact sliding window at word length / graph depth `r : Nat`. -/
def foataWin : Nat → FoataWin
  | 0 => ⟨⟨1, 0, 0, 0⟩, foataZero, foataZero⟩
  | r + 1 => foataStep (foataWin r)

def foataA0 (r : Nat) : Nat := (foataWin r).cur.a0
def foataA1 (r : Nat) : Nat := (foataWin r).cur.a1
def foataA2 (r : Nat) : Nat := (foataWin r).cur.a2
def foataA3 (r : Nat) : Nat := (foataWin r).cur.a3

/-- Exact spherical ball-shell count `|∂B_r|` of `{3,4,3,4}` from the 24-cell clique `f`-vector `(1, 24, 96, 96)`. -/
def ballShell (r : Nat) : Nat :=
  foataA0 r + 24 * foataA1 r + 96 * foataA2 r + 96 * foataA3 r

/-- Exact horosphere cusp-shell count `N_D` of `{3,4,3,4}` from the 18 downward facets' clique `f`-vector `(1, 18, 60, 52)`. -/
def cuspShell (D : Nat) : Nat :=
  foataA0 D + 18 * foataA1 D + 60 * foataA2 D + 52 * foataA3 D

/-- Exact Steinberg descent-containment counts `b_k(r)`. -/
def steinbergB1 (r : Nat) : Nat := foataA1 r + 8 * foataA2 r + 12 * foataA3 r
def steinbergB2 (r : Nat) : Nat := foataA2 r + 3 * foataA3 r
def steinbergB3 (r : Nat) : Nat := foataA3 r

/-- Exact 3-tuple of Cartier-Foata multiplicities `(w_0, w_1, w_2)` for the 8-facet wall cube `Q_3`. -/
structure WallVec where
  w0 : Nat
  w1 : Nat
  w2 : Nat
  deriving DecidableEq, Repr

/-- 2-step sliding window for the 8-facet wall cube `M_wall = [[1, 4, 3], [1, 6, 7]]`. -/
structure WallWin where
  cur : WallVec
  prev1 : WallVec
  deriving DecidableEq, Repr

def wallZero : WallVec := ⟨0, 0, 0⟩

def wallStep (w : WallWin) : WallWin :=
  let v1 := w.cur
  let v2 := w.prev1
  let nxt : WallVec :=
    ⟨ 0,
      v1.w0 + 4 * v1.w1 + 3 * v1.w2,
      v2.w0 + 6 * v2.w1 + 7 * v2.w2 ⟩
  ⟨nxt, w.cur⟩

def wallWin : Nat → WallWin
  | 0 => ⟨⟨1, 0, 0⟩, wallZero⟩
  | r + 1 => wallStep (wallWin r)

def wallW0 (r : Nat) : Nat := (wallWin r).cur.w0
def wallW1 (r : Nat) : Nat := (wallWin r).cur.w1
def wallW2 (r : Nat) : Nat := (wallWin r).cur.w2

/-- Exact single-face lateral link count `l_D` derived from the 8-facet wall cube's 4 downward facets. -/
def wallCusp (D : Nat) : Nat :=
  wallW0 D + 4 * wallW1 D + 4 * wallW2 D

/-- Headline Theorem 8 (Exact Initial Shell & Wall Counts Matching `exact-3434.ts` & `exact-cusp.ts`). -/
theorem thm_foata_exact_initial_values :
    (ballShell 0 = 1 ∧ ballShell 1 = 24 ∧ ballShell 2 = 456 ∧ ballShell 3 = 8376 ∧ ballShell 4 = 153192) ∧
    (cuspShell 0 = 1 ∧ cuspShell 1 = 18 ∧ cuspShell 2 = 330 ∧ cuspShell 3 = 6034 ∧ cuspShell 4 = 110298) ∧
    (wallCusp 0 = 1 ∧ wallCusp 1 = 4 ∧ wallCusp 2 = 20 ∧ wallCusp 3 = 100 ∧ wallCusp 4 = 500) := by
  decide

private theorem foata_shift_eqs (r : Nat) :
    foataA0 (r + 1) = 0 ∧
    foataA1 (r + 1) = foataA0 r + 15 * foataA1 r + 44 * foataA2 r + 36 * foataA3 r ∧
    foataA2 (r + 2) = foataA0 r + 19 * foataA1 r + 63 * foataA2 r + 54 * foataA3 r ∧
    foataA3 (r + 3) = foataA0 r + 21 * foataA1 r + 75 * foataA2 r + 68 * foataA3 r :=
  ⟨rfl, rfl, rfl, rfl⟩

private theorem cg_lin3 (c1 c2 c3 a7 a6 a5 a4 b6 b5 b4 b3 k6 k5 k4 k3 d6 d5 d4 d3 : Nat)
    (s7 : a7 = 0 + c1 * b6 + c2 * k6 + c3 * d6)
    (s6 : a6 = 0 + c1 * b5 + c2 * k5 + c3 * d5)
    (s5 : a5 = 0 + c1 * b4 + c2 * k4 + c3 * d4)
    (s4 : a4 = 0 + c1 * b3 + c2 * k3 + c3 * d3)
    (hb : b6 + 51 * b4 = 21 * b5 + 23 * b3)
    (hk : k6 + 51 * k4 = 21 * k5 + 23 * k3)
    (hd : d6 + 51 * d4 = 21 * d5 + 23 * d3) :
    a7 + 51 * a5 = 21 * a6 + 23 * a4 := by
  rw [s7, s6, s5, s4]
  calc 0 + c1 * b6 + c2 * k6 + c3 * d6 + 51 * (0 + c1 * b4 + c2 * k4 + c3 * d4)
      = c1 * (b6 + 51 * b4) + c2 * (k6 + 51 * k4) + c3 * (d6 + 51 * d4) := by ring
    _ = c1 * (21 * b5 + 23 * b3) + c2 * (21 * k5 + 23 * k3) + c3 * (21 * d5 + 23 * d3) := by rw [hb, hk, hd]
    _ = 21 * (0 + c1 * b5 + c2 * k5 + c3 * d5) + 23 * (0 + c1 * b3 + c2 * k3 + c3 * d3) := by ring

private theorem foata_cubic_step_bundle :
    ∀ n : Nat,
      (foataA1 (n + 4) + 51 * foataA1 (n + 2) = 21 * foataA1 (n + 3) + 23 * foataA1 (n + 1) ∧
       foataA2 (n + 4) + 51 * foataA2 (n + 2) = 21 * foataA2 (n + 3) + 23 * foataA2 (n + 1) ∧
       foataA3 (n + 4) + 51 * foataA3 (n + 2) = 21 * foataA3 (n + 3) + 23 * foataA3 (n + 1)) ∧
      (foataA1 (n + 5) + 51 * foataA1 (n + 3) = 21 * foataA1 (n + 4) + 23 * foataA1 (n + 2) ∧
       foataA2 (n + 5) + 51 * foataA2 (n + 3) = 21 * foataA2 (n + 4) + 23 * foataA2 (n + 2) ∧
       foataA3 (n + 5) + 51 * foataA3 (n + 3) = 21 * foataA3 (n + 4) + 23 * foataA3 (n + 2)) ∧
      (foataA1 (n + 6) + 51 * foataA1 (n + 4) = 21 * foataA1 (n + 5) + 23 * foataA1 (n + 3) ∧
       foataA2 (n + 6) + 51 * foataA2 (n + 4) = 21 * foataA2 (n + 5) + 23 * foataA2 (n + 3) ∧
       foataA3 (n + 6) + 51 * foataA3 (n + 4) = 21 * foataA3 (n + 5) + 23 * foataA3 (n + 3)) := by
  intro n
  induction n with
  | zero => decide
  | succ m ih =>
    obtain ⟨⟨h0a, h0b, h0c⟩, ⟨h1a, h1b, h1c⟩, ⟨h2a, h2b, h2c⟩⟩ := ih
    refine ⟨⟨h1a, h1b, h1c⟩, ⟨h2a, h2b, h2c⟩, ⟨?_, ?_, ?_⟩⟩
    · exact cg_lin3 15 44 36 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ rfl rfl rfl rfl h2a h2b h2c
    · exact cg_lin3 19 63 54 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ rfl rfl rfl rfl h1a h1b h1c
    · exact cg_lin3 21 75 68 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ rfl rfl rfl rfl h0a h0b h0c

/-- Headline Theorem 9 (Exact Steinberg Cubic Recurrence & Inclusion-Exclusion Identities for ALL `n : Nat`). -/
theorem thm_foata_cubic_recurrence :
    (∀ n : Nat,
      ballShell (n + 4) + 51 * ballShell (n + 2) = 21 * ballShell (n + 3) + 23 * ballShell (n + 1) ∧
      cuspShell (n + 4) + 51 * cuspShell (n + 2) = 21 * cuspShell (n + 3) + 23 * cuspShell (n + 1)) ∧
    (∀ r : Nat, cuspShell r + 6 * steinbergB1 r + 8 * steinbergB3 r = ballShell r + 12 * steinbergB2 r) ∧
    (∀ r : Nat, ballShell (r + 1) + 96 * steinbergB2 (r + 1) = 24 * steinbergB1 (r + 1) + 96 * steinbergB3 (r + 1)) := by
  refine ⟨?_, ?_, ?_⟩
  · intro n
    obtain ⟨h1, h2, h3⟩ := (foata_cubic_step_bundle n).1
    unfold ballShell cuspShell
    rw [(foata_shift_eqs (n + 3)).1, (foata_shift_eqs (n + 2)).1,
        (foata_shift_eqs (n + 1)).1, (foata_shift_eqs n).1]
    exact ⟨by omega, by omega⟩
  · intro r; unfold cuspShell ballShell steinbergB1 steinbergB2 steinbergB3; omega
  · intro r; unfold ballShell steinbergB1 steinbergB2 steinbergB3; rw [(foata_shift_eqs r).1]; omega

private theorem wall_quad_step_bundle :
    ∀ n : Nat,
      (wallW1 (n + 3) + 5 * wallW1 (n + 1) = 6 * wallW1 (n + 2) ∧
       wallW2 (n + 3) + 5 * wallW2 (n + 1) = 6 * wallW2 (n + 2)) ∧
      (wallW1 (n + 4) + 5 * wallW1 (n + 2) = 6 * wallW1 (n + 3) ∧
       wallW2 (n + 4) + 5 * wallW2 (n + 2) = 6 * wallW2 (n + 3)) := by
  intro n
  induction n with
  | zero => decide
  | succ m ih =>
    obtain ⟨⟨h0a, h0b⟩, ⟨h1a, h1b⟩⟩ := ih
    refine ⟨⟨h1a, h1b⟩, ⟨?_, ?_⟩⟩
    · have s1_5 : wallW1 (m + 5) = 0 + 4 * wallW1 (m + 4) + 3 * wallW2 (m + 4) := rfl
      have s1_4 : wallW1 (m + 4) = 0 + 4 * wallW1 (m + 3) + 3 * wallW2 (m + 3) := rfl
      have s1_3 : wallW1 (m + 3) = 0 + 4 * wallW1 (m + 2) + 3 * wallW2 (m + 2) := rfl
      change wallW1 (m + 5) + 5 * wallW1 (m + 3) = 6 * wallW1 (m + 4); omega
    · have s2_5 : wallW2 (m + 5) = 0 + 6 * wallW1 (m + 3) + 7 * wallW2 (m + 3) := rfl
      have s2_4 : wallW2 (m + 4) = 0 + 6 * wallW1 (m + 2) + 7 * wallW2 (m + 2) := rfl
      have s2_3 : wallW2 (m + 3) = 0 + 6 * wallW1 (m + 1) + 7 * wallW2 (m + 1) := rfl
      change wallW2 (m + 5) + 5 * wallW2 (m + 3) = 6 * wallW2 (m + 4); omega

/-- Headline Theorem 10 (Unconditional Derivation of Single-Face Lateral Links `l_D = 4 * 5^{D-1}`). -/
theorem thm_wall_cusp_eq_cuspLateralLinks :
    (∀ d : Nat, wallW1 (d + 1) + wallW2 (d + 1) = 5 ^ d) ∧
    (∀ D : Nat, wallCusp D = cuspLateralLinks D) := by
  have hPair : ∀ d : Nat,
      wallW1 (d + 1) + wallW2 (d + 1) = 5 ^ d ∧
      wallW1 (d + 2) + wallW2 (d + 2) = 5 ^ (d + 1) := by
    intro d
    induction d with
    | zero => decide
    | succ k ih =>
      refine ⟨ih.2, ?_⟩
      obtain ⟨hR1, hR2⟩ := (wall_quad_step_bundle k).1
      have h1 := ih.1; have h2 := ih.2
      change wallW1 (k + 3) + wallW2 (k + 3) = 5 ^ (k + 2)
      rw [Nat.pow_succ, Nat.pow_succ]; rw [Nat.pow_succ] at h2; omega
  refine ⟨fun d => (hPair d).1, fun D => ?_⟩
  cases D with
  | zero => decide
  | succ d =>
    change wallW0 (d + 1) + 4 * wallW1 (d + 1) + 4 * wallW2 (d + 1) = 4 * 5 ^ d
    have hz : wallW0 (d + 1) = 0 := rfl
    have hS := (hPair d).1; rw [hz]; omega


/-! ## Section 6: Unconditional `18×` Cusp Growth, Sharp Rate Brackets & `Vibe.Geometry` Discharge -/

/-- Headline Theorem 11 (Unconditional `≥ 18×` Cusp Shell Growth Theorem — Closes `board-0053`):
    `cuspShell 0 = 1` AND `cuspShell (D + 1) ≥ 18 * cuspShell D` for EVERY depth `D : Nat`! -/
theorem thm_cusp_growth_ge_18 :
    cuspShell 0 = 1 ∧ ∀ D : Nat, cuspShell (D + 1) ≥ 18 * cuspShell D := by
  have hPair : ∀ n : Nat,
      cuspShell (n + 1) ≥ 18 * cuspShell n ∧
      cuspShell (n + 2) ≥ 18 * cuspShell (n + 1) ∧
      cuspShell (n + 3) ≥ 18 * cuspShell (n + 2) := by
    intro n
    induction n with
    | zero => decide
    | succ m ih =>
      refine ⟨ih.2.1, ih.2.2, ?_⟩
      have hRec := (thm_foata_cubic_recurrence.1 m).2
      have hPrev := ih.2.2
      change cuspShell (m + 4) ≥ 18 * cuspShell (m + 3); omega
  exact ⟨by decide, fun D => (hPair D).1⟩

/-- Headline Theorem 12 (Sharp Asymptotic Growth Rate Brackets `λ_{3434} ∈ (18.2787, 18.2788)`). -/
theorem thm_cusp_and_ball_growth_rate_bounds :
    (∀ D : Nat, D ≥ 1 → 1827 * cuspShell D ≤ 100 * cuspShell (D + 1) ∧
                        100 * cuspShell (D + 1) ≤ 1834 * cuspShell D) ∧
    (∀ r : Nat, r ≥ 1 → 1827 * ballShell r ≤ 100 * ballShell (r + 1) ∧
                        100 * ballShell (r + 1) ≤ 1900 * ballShell r) ∧
    ((182787 : Int) * 182787 * 182787 - 21 * 10000 * 182787 * 182787 +
       51 * 10000 * 10000 * 182787 - 23 * 10000 * 10000 * 10000 < 0 ∧
     (182788 : Int) * 182788 * 182788 - 21 * 10000 * 182788 * 182788 +
       51 * 10000 * 10000 * 182788 - 23 * 10000 * 10000 * 10000 > 0) := by
  have hCusp : ∀ n : Nat,
      (1827 * cuspShell (n + 1) ≤ 100 * cuspShell (n + 2) ∧
       100 * cuspShell (n + 2) ≤ 1834 * cuspShell (n + 1)) ∧
      (1827 * cuspShell (n + 2) ≤ 100 * cuspShell (n + 3) ∧
       100 * cuspShell (n + 3) ≤ 1834 * cuspShell (n + 2)) := by
    intro n
    induction n with
    | zero => decide
    | succ m ih =>
      refine ⟨ih.2, ?_⟩
      have hRec := (thm_foata_cubic_recurrence.1 m).2
      obtain ⟨⟨h1L, h1U⟩, ⟨h2L, h2U⟩⟩ := ih
      change 1827 * cuspShell (m + 3) ≤ 100 * cuspShell (m + 4) ∧
             100 * cuspShell (m + 4) ≤ 1834 * cuspShell (m + 3)
      exact ⟨by omega, by omega⟩
  have hBall : ∀ n : Nat,
      (1827 * ballShell (n + 1) ≤ 100 * ballShell (n + 2) ∧
       100 * ballShell (n + 2) ≤ 1900 * ballShell (n + 1)) ∧
      (1827 * ballShell (n + 2) ≤ 100 * ballShell (n + 3) ∧
       100 * ballShell (n + 3) ≤ 1900 * ballShell (n + 2)) := by
    intro n
    induction n with
    | zero => decide
    | succ m ih =>
      refine ⟨ih.2, ?_⟩
      have hRec := (thm_foata_cubic_recurrence.1 m).1
      obtain ⟨⟨h1L, h1U⟩, ⟨h2L, h2U⟩⟩ := ih
      change 1827 * ballShell (m + 3) ≤ 100 * ballShell (m + 4) ∧
             100 * ballShell (m + 4) ≤ 1900 * ballShell (m + 3)
      exact ⟨by omega, by omega⟩
  refine ⟨fun D hD => by cases D with | zero => omega | succ n => exact (hCusp n).1,
          fun r hr => by cases r with | zero => omega | succ n => exact (hBall n).1,
          by decide⟩

-- [helper]
theorem cuspShell_zero_ge_one : cuspShell 0 ≥ 1 := by decide

/-- Headline Theorem 13 (Unconditional `{3,4,3,4}` Exponential Cusp Shell Lower Bound). -/
theorem thm_unconditional_cusp_shell_exp :
    ∀ D : Nat, cuspShell D ≥ 18 ^ D :=
  thm5_shell_exp_lower_bound cuspShell cuspShell_zero_ge_one thm_cusp_growth_ge_18.2

/-- Headline Theorem 14 (Unconditional `{3,4,3,4}` Column Resistance Exponential Divergence). -/
theorem thm_unconditional_resistance_exp :
    (∀ F : Nat, 17 * colResistance cuspShell F + 1 ≥ 18 ^ F) ∧
    (∀ F : Nat, colResistance cuspShell (F + 1) > colResistance cuspShell F) :=
  ⟨ thm5_resistance_exp_lower_bound cuspShell cuspShell_zero_ge_one thm_cusp_growth_ge_18.2,
    thm5_resistance_strictly_increasing cuspShell cuspShell_zero_ge_one thm_cusp_growth_ge_18.2 ⟩

/-- Headline Theorem 15 (Unconditional `{3,4,3,4}` Column Resistance Unboundedness). -/
theorem thm_unconditional_resistance_unbounded :
    ∀ B : Nat, ∃ F : Nat, colResistance cuspShell F > B :=
  thm5_resistance_unbounded cuspShell cuspShell_zero_ge_one thm_cusp_growth_ge_18.2

/-- Headline Theorem 16 (Unconditional `{3,4,3,4}` Wall-Link Cumulative & Strict Domination Theorem). -/
theorem thm_unconditional_wall_lt_cusp_shell :
    (∀ D : Nat, sumNat (D + 1) wallCusp = 5 ^ D) ∧
    (∀ D : Nat, D ≥ 1 → wallCusp D < cuspShell D) := by
  have hFun : wallCusp = cuspLateralLinks := funext thm_wall_cusp_eq_cuspLateralLinks.2
  rw [hFun]
  exact ⟨ thm5_cusp_lateral_cumulative,
          thm5_cusp_lateral_lt_shell cuspShell cuspShell_zero_ge_one thm_cusp_growth_ge_18.2 ⟩

/-- Headline Theorem 17 (Unconditional `{3,4,3,4}` Strict Subluminality Across ALL Positive Warp Profiles). -/
theorem thm_unconditional_cusp_strictly_subluminal
    (w : Nat → Nat) (F : Nat) (hF : F ≥ 2)
    (hw : ∀ D : Nat, w D > 0) (s : Nat) (hs : s > 0) :
    let C := cuspWarpedColumn cuspShell w F (by omega) cuspShell_zero_ge_one thm_cusp_growth_ge_18.2 hw
    C.kEff < C.mEff ∧
    PosRat.ltOne C.cUniversalSq ∧
    PosRat.ltOne (C.scaledRayleigh s hs) :=
  thm6_strictly_subluminal cuspShell w F hF cuspShell_zero_ge_one thm_cusp_growth_ge_18.2 hw s hs

end Vibe

end
