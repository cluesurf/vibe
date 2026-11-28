module

public import Vibe.Geometry
public import Vibe.CoxeterTransport
public import Vibe.Chirality
import Mathlib.Data.Finset.Basic
import Mathlib.Data.Finset.Card
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Tactic.Ring

/-!
# Vibe Theory: Chiral `W(F_4)^+` Universality, 5-Symbol & 15-Symbol Homogeneous Reversible CA on `{3,4,3,4}`

Lean `4.35.0` + Mathlib `v4.35.0` formalization of homogeneous chiral universality on the infinite
four-dimensional hyperbolic honeycomb `{3,4,3,4}`:

1. **Theorem 1 (`thm_chiral_k1_single_line_obstruction`):**
   For every facet `a : Fin 24` and every orthogonal pair `(p, q)` perpendicular to `a`, there exists
   an explicit proper rotation `g ∈ W(F_4)^+` (`wf4Det g = 1`) fixing `a` pointwise while swapping
   `p ↔ q` (reversing 2D orientation in the `(p, q)` plane), paired directly with
   `Vibe.thm_k3_pointwise_improper_stabilizer` to establish the exact sharp chirality hierarchy:
   `k = 1` fails even under `W(F_4)^+`, ordered orthogonal `k = 2` anchors succeed under `W(F_4)^+`,
   while full `W(F_4)` requires `k* = 4`.
2. **Theorem 2 (`thm_wf4plus_orth_pair_orbit_and_c4_stabilizer`):**
   Exact cardinality `144` of ordered orthogonal facet pairs `(a, b)`, transitivity of `W(F_4)^+` on
   all `144` pairs, exact order-`4` cyclic stabilizer `C_4` of the canonical pair `(0, 1)`, and exact
   sizes `|Q(a, b)| = 4`, `|P(a, b)| = 4` with pairwise disjointness of `{a, b}`, `Q(a, b)`, `P(a, b)`.
3. **Theorem 3 (`thm_chiral_rot90_order4_and_equivariant`):**
   Determinant-defined order-4 rotations `rotQ` (`det4 = 2` on `Q`), `rotP` (`det4 = 4` on `P`),
   canonical north port `qNorth` and perpendicular axis predicate `isPerpQ`, exact order-4 cyclicity,
   swap-invariant involution `rotQ^2`, perpendicular preservation under `(rotP, rotQ)`, and
   unconditional global `W(F_4)^+`-equivariance across all `576` proper rotations.
4. **Theorem 4 (`thm_univ5_bijective_equivariant_conservative`):**
   The `5`-symbol homogeneous `W(F_4)^+`-equivariant partitioned CA local rule `localUniv5`
   (`{empty, pulse, ancA, ancB, rotR}`) unifying horosphere straight wire + crossover (`0-R`),
   `90°` corner turner (`4-R`), Morita Reversible Rotary Element (`1-R`), and period-2 catalyst bounce
   in bulk space, proved universally bijective (`∀ cell : Fin 24 → Sym5`), globally `W(F_4)^+`-equivariant,
   per-species conservative, and quiescent-stationary.
5. **Theorem 5 (`thm_strong15_launcher_and_unified_bijection`):**
   The `15`-symbol homogeneous strong-universality local rule `localStrong15` unifying the exact
   `S_exch`-conjugated Table-6 constant-particle ray counter `lineRev12_exch`, the `3-R`
   horosphere-to-bulk `11`-state (`3 + 3 + 3 + 2`) reversible launcher `launch5`, and all horosphere
   gate sectors (`0-R`, `1-R`, `4-R`), proved universally bijective, `W(F_4)^+`-equivariant,
   occupation-conservative, and quiescent-stationary, with exact `INC`/`DEC`/`ZERO_TEST` ray kinematics.
6. **Theorem 6 (`thm_horosphere_flat_z2_and_global_bijection`):**
   Exact `5 × 5` `ℤ[√2]` Coxeter reflection geometry (`facetRefl := faceReflection`) of the `6`
   cusp-layer facets fixing `cuspVertex`, exact `ℤ^2` commutation of the `4` horosphere plane
   reflections `{E+, E-, N+, N-} = Q(0, 1)` and their translations, involutivity `F_a^2 = I_5`, and
   universal global partitioned CA bijectivity `U = S_exch ∘ L` (`U_inv = L_inv ∘ S_exch`) instantiated
   to the infinite `{3,4,3,4}` Coxeter honeycomb for both `localUniv5` and `localStrong15`.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 0: Shared Aliases & Fast `W(F_4)` Group-Action Helpers -/

/-- Exact `4 × 4` determinant of four `Vec4` rows (alias for `Vibe.det4Vecs`). -/
abbrev det4 := det4Vecs

/-- Exact `5 × 5` Coxeter facet reflection over `ℤ[√2]` (alias for `Vibe.faceReflection`). -/
abbrev facetRefl := faceReflection

private theorem cu_vec4_cancel_scale2 (u v : Vec4) (h : scaleVec4 2 u = scaleVec4 2 v) : u = v := by
  rcases u with ⟨u0, u1, u2, u3⟩; rcases v with ⟨v0, v1, v2, v3⟩
  simp only [scaleVec4, Prod.mk.injEq] at h
  rcases h with ⟨h0, h1, h2, h3⟩
  have e0 : u0 = v0 := by omega
  have e1 : u1 = v1 := by omega
  have e2 : u2 = v2 := by omega
  have e3 : u3 = v3 := by omega
  subst e0; subst e1; subst e2; subst e3; rfl

private theorem cu_mat4Vec_scale2 (M : Mat4) (v : Vec4) :
    mat4Vec M (scaleVec4 2 v) = scaleVec4 2 (mat4Vec M v) := by
  rcases v with ⟨v0, v1, v2, v3⟩
  simp only [mat4Vec, scaleVec4, sum4, coord4, Prod.mk.injEq]
  refine ⟨?_, ?_, ?_, ?_⟩ <;> ring

private theorem cu_mat4Vec_scale_mat (s : Int) (M : Mat4) (v : Vec4) :
    mat4Vec (fun i j => s * M i j) v = scaleVec4 s (mat4Vec M v) := by
  rcases v with ⟨v0, v1, v2, v3⟩
  simp only [mat4Vec, scaleVec4, sum4, coord4, Prod.mk.injEq]
  refine ⟨?_, ?_, ?_, ?_⟩ <;> ring

private theorem cu_mat4Vec_mul (A B : Mat4) (v : Vec4) :
    mat4Vec (mat4Mul A B) v = mat4Vec A (mat4Vec B v) := by
  rcases v with ⟨v0, v1, v2, v3⟩
  simp only [mat4Vec, mat4Mul, sum4, coord4, Prod.mk.injEq]
  refine ⟨?_, ?_, ?_, ?_⟩ <;> ring

private theorem d4RootOf_inj : ∀ x y : Fin 24, d4RootOf x = d4RootOf y → x = y := by
  decide

private theorem cu_wf4Perm_mul (g1 g2 : WF4Elem) (a : Fin 24) :
    wf4Perm (wf4Mul g1 g2) a = wf4Perm g1 (wf4Perm g2 a) := by
  have hV : mat4Vec (mat4Mul (wf4Mat2 g1) (wf4Mat2 g2)) (d4RootOf a) =
      scaleVec4 2 (mat4Vec (wf4Mat2 (wf4Mul g1 g2)) (d4RootOf a)) := by
    rw [thm_wf4_semidirect_order_1152.1 g1 g2, cu_mat4Vec_scale_mat]
  rw [cu_mat4Vec_mul,
      (thm_wf4_action_orthogonal_and_bijective g2).2.2.2.1 a,
      cu_mat4Vec_scale2,
      (thm_wf4_action_orthogonal_and_bijective g1).2.2.2.1 _,
      (thm_wf4_action_orthogonal_and_bijective (wf4Mul g1 g2)).2.2.2.1 a] at hV
  exact d4RootOf_inj _ _ (cu_vec4_cancel_scale2 _ _ (cu_vec4_cancel_scale2 _ _ hV.symm))

private theorem cu_wf4Perm_id : ∀ a : Fin 24, wf4Perm wf4Id a = a := by
  decide

private theorem cu_wf4Det_pm_one (g : WF4Elem) : wf4Det g = 1 ∨ wf4Det g = -1 := by
  unfold wf4Det perm4Det s3Det; split_ifs <;> decide

private theorem cu_wf4Perm_wf4Inv (g : WF4Elem) (a : Fin 24) :
    wf4Perm (wf4Inv g) a = wf4PermInv g a := by
  have hInvMat : wf4Mat2 (wf4Inv g) = mat4Transpose (wf4Mat2 g) := by
    -- Verify via orthogonality: `M * M^T = 4 I` and `wf4PermInv` is right-inverse of `wf4Perm`
    have hV : ∀ x : Fin 24,
        mat4Vec (mat4Transpose (wf4Mat2 g)) (d4RootOf x) =
          scaleVec4 2 (d4RootOf (wf4PermInv g x)) := by
      intro x
      have hAct := (thm_wf4_action_orthogonal_and_bijective g).2.2.2.1 (wf4PermInv g x)
      rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 x).2] at hAct
      have hMul := congrArg (mat4Vec (mat4Transpose (wf4Mat2 g))) hAct
      rw [← cu_mat4Vec_mul, (thm_wf4_action_orthogonal_and_bijective g).1, cu_mat4Vec_scale2] at hMul
      have h4I : ∀ v : Vec4, mat4Vec (fun i j : Fin 4 => if i = j then (4 : Int) else 0) v = scaleVec4 2 (scaleVec4 2 v) := by
        intro ⟨v0, v1, v2, v3⟩
        simp only [mat4Vec, sum4, coord4, scaleVec4, Prod.mk.injEq]
        refine ⟨?_, ?_, ?_, ?_⟩ <;> omega
      rw [h4I] at hMul
      exact cu_vec4_cancel_scale2 _ _ hMul.symm
    -- Now compare `wf4Mat2 (wf4Inv g)` directly on `wf4Inv` using `wf4Mat2` orthogonality
    have hMulInv : mat4Mul (wf4Mat2 (wf4Inv g)) (wf4Mat2 g) = fun i j => if i = j then 4 else 0 := by
      have hEvenInv : ∀ x : WF4Elem, ∀ i j : Fin 4,
          2 * wf4Mat2 x i j = mat4Mul (wd4Mat2 (x.1, x.2.1)) (s3Mat2 x.2.2) i j := by
        intro x i j
        have hW : wd4Mat2 (x.1, x.2.1) i ⟨0, by decide⟩ % 2 = 0 ∧
                  wd4Mat2 (x.1, x.2.1) i ⟨1, by decide⟩ % 2 = 0 ∧
                  wd4Mat2 (x.1, x.2.1) i ⟨2, by decide⟩ % 2 = 0 ∧
                  wd4Mat2 (x.1, x.2.1) i ⟨3, by decide⟩ % 2 = 0 :=
          (by decide : ∀ (p : Fin 24) (e : Fin 8) (r : Fin 4),
            wd4Mat2 (p, e) r ⟨0, by decide⟩ % 2 = 0 ∧
            wd4Mat2 (p, e) r ⟨1, by decide⟩ % 2 = 0 ∧
            wd4Mat2 (p, e) r ⟨2, by decide⟩ % 2 = 0 ∧
            wd4Mat2 (p, e) r ⟨3, by decide⟩ % 2 = 0) x.1 x.2.1 i
        simp only [wf4Mat2, mat4MulHalf, mat4Mul, sum4]
        rcases hW with ⟨h0, h1, h2, h3⟩
        have he : ∀ u v : Int, u % 2 = 0 → (u * v) % 2 = 0 := fun u v hu => by
          rw [show u = 2 * (u / 2) by omega, Int.mul_assoc]; omega
        have m0 := he _ (s3Mat2 x.2.2 ⟨0, by decide⟩ j) h0
        have m1 := he _ (s3Mat2 x.2.2 ⟨1, by decide⟩ j) h1
        have m2 := he _ (s3Mat2 x.2.2 ⟨2, by decide⟩ j) h2
        have m3 := he _ (s3Mat2 x.2.2 ⟨3, by decide⟩ j) h3
        omega
      -- Use `thm_wf4_semidirect_order_1152.1` + `wf4Mul (wf4Inv g) g = wf4Id`!
      -- Instead of re-proving matrix transpose formula, compute `wf4Perm (wf4Inv g)` directly!
      have hPermInv : ∀ x : Fin 24, wf4Perm (wf4Inv g) (wf4Perm g x) = x := by
        intro x
        have hS3 : ∀ c : Fin 6, ∀ y : Fin 24, s3Slot (s3Inv c) (s3Slot c y) = y := by decide
        have hWInv : ∀ (p : Fin 24) (e : Fin 8) (y : Fin 24),
            evenSignSlot (wd4Inv (p, e)).2 (perm4Slot (wd4Inv (p, e)).1 (evenSignSlot e (perm4Slot p y))) = y := by decide
        have hConjPerm : ∀ (c : Fin 6) (p : Fin 24) (e : Fin 8) (y : Fin 24),
            evenSignSlot (conjS3WD4 c (p, e)).2 (perm4Slot (conjS3WD4 c (p, e)).1 (s3Slot c y)) =
              s3Slot c (evenSignSlot e (perm4Slot p y)) := by
          intro c p e y
          have hStep : ∀ (c : Fin 6) (d : WD4Elem) (z : Fin 24),
              wf4Perm (wf4Mul (⟨0, by decide⟩, ⟨0, by decide⟩, c) (d.1, d.2, ⟨0, by decide⟩)) z =
                wf4Perm (⟨0, by decide⟩, ⟨0, by decide⟩, c) (wf4Perm (d.1, d.2, ⟨0, by decide⟩) z) :=
            fun c d z => cu_wf4Perm_mul _ _ z
          have h0 := hStep c (p, e) y
          have hIdP : ∀ z : Fin 24, perm4Slot ⟨0, by decide⟩ z = z := by decide
          have hIdE : ∀ z : Fin 24, evenSignSlot ⟨0, by decide⟩ z = z := by decide
          have hIdS : ∀ z : Fin 24, s3Slot ⟨0, by decide⟩ z = z := by decide
          have hWdId : ∀ d : WD4Elem, wd4Mul (⟨0, by decide⟩, ⟨0, by decide⟩) d = d := by
            intro ⟨p0, e0⟩
            exact (by decide : ∀ (p0 : Fin 24) (e0 : Fin 8), wd4Mul (⟨0, by decide⟩, ⟨0, by decide⟩) (p0, e0) = (p0, e0)) p0 e0
          have hS3Id : ∀ c0 : Fin 6, s3Mul c0 ⟨0, by decide⟩ = c0 := by decide
          simp only [wf4Perm, wf4Mul, hWdId, hS3Id, hIdP, hIdE, hIdS] at h0
          exact h0
        unfold wf4Perm wf4Inv
        dsimp only
        rw [hConjPerm (s3Inv g.2.2) (wd4Inv (g.1, g.2.1)).1 (wd4Inv (g.1, g.2.1)).2,
            hWInv g.1 g.2.1, hS3 g.2.2 x]
      have hEqId : wf4Mul (wf4Inv g) g = wf4Id := by
        apply thm_wf4_semidirect_order_1152.2.2.2.1
        intro x; rw [cu_wf4Perm_mul, hPermInv, cu_wf4Perm_id]
      rw [thm_wf4_semidirect_order_1152.1, hEqId]
      funext i j
      exact (by decide : ∀ r c : Fin 4, 2 * wf4Mat2 wf4Id r c = if r = c then 4 else 0) i j
    -- Not even needed to finish hInvMat; we already have `wf4Perm (wf4Inv g) (wf4Perm g x) = x`!
    funext i j
    have hA := congrFun (congrFun hMulInv i) j
    have hR := (thm_wf4_action_orthogonal_and_bijective g).2.1
    have hProd : mat4Mul (mat4Mul (wf4Mat2 (wf4Inv g)) (wf4Mat2 g)) (mat4Transpose (wf4Mat2 g)) =
        mat4Mul (wf4Mat2 (wf4Inv g)) (mat4Mul (wf4Mat2 g) (mat4Transpose (wf4Mat2 g))) := by
      funext r c; simp only [mat4Mul, sum4]; ring
    rw [hMulInv, hR] at hProd
    have h4L : ∀ M : Mat4, ∀ r c : Fin 4, mat4Mul (fun a b => if a = b then (4 : Int) else 0) M r c = 4 * M r c := by
      intro M r c; fin_cases r <;> simp [mat4Mul, sum4] <;> omega
    have h4R : ∀ M : Mat4, ∀ r c : Fin 4, mat4Mul M (fun a b => if a = b then (4 : Int) else 0) r c = 4 * M r c := by
      intro M r c; fin_cases c <;> simp [mat4Mul, sum4] <;> omega
    have hij := congrFun (congrFun hProd i) j
    rw [h4L, h4R] at hij; omega
  have hAct := (thm_wf4_action_orthogonal_and_bijective (wf4Inv g)).2.2.2.1 a
  rw [hInvMat] at hAct
  have hActG := (thm_wf4_action_orthogonal_and_bijective g).2.2.2.1 (wf4PermInv g a)
  rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 a).2] at hActG
  have hMul := congrArg (mat4Vec (mat4Transpose (wf4Mat2 g))) hActG
  rw [← cu_mat4Vec_mul, (thm_wf4_action_orthogonal_and_bijective g).1, cu_mat4Vec_scale2, hAct] at hMul
  have h4I : ∀ v : Vec4, mat4Vec (fun i j : Fin 4 => if i = j then (4 : Int) else 0) v = scaleVec4 2 (scaleVec4 2 v) := by
    intro ⟨v0, v1, v2, v3⟩; simp only [mat4Vec, sum4, coord4, scaleVec4, Prod.mk.injEq]; refine ⟨?_, ?_, ?_, ?_⟩ <;> omega
  rw [h4I] at hMul
  exact d4RootOf_inj _ _ (cu_vec4_cancel_scale2 _ _ (cu_vec4_cancel_scale2 _ _ hMul.symm))

private theorem cu_wf4Mul_inv_left (g : WF4Elem) : wf4Mul (wf4Inv g) g = wf4Id := by
  apply thm_wf4_semidirect_order_1152.2.2.2.1
  intro a
  rw [cu_wf4Perm_mul, cu_wf4Perm_wf4Inv, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 a).1, cu_wf4Perm_id]

private theorem cu_wf4Det_inv (g : WF4Elem) : wf4Det (wf4Inv g) = wf4Det g := by
  have h : wf4Det (wf4Mul (wf4Inv g) g) = 1 := by rw [cu_wf4Mul_inv_left]; decide
  rw [thm_wf4_semidirect_order_1152.2.1] at h
  rcases cu_wf4Det_pm_one (wf4Inv g) with h1 | h1 <;> rcases cu_wf4Det_pm_one g with h2 | h2 <;>
    rw [h1, h2] at h ⊢ <;> omega

private theorem cu_wf4PermInv_opp (g : WF4Elem) (a : Fin 24) :
    wf4PermInv g (oppSlot a) = oppSlot (wf4PermInv g a) := by
  have h := (thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.2 (wf4PermInv g a)
  rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 a).2] at h
  have h2 := congrArg (wf4PermInv g) h
  rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).1] at h2
  exact h2.symm

private theorem cu_wf4PermInv_dot4 (g : WF4Elem) (a b : Fin 24) :
    dot4 (d4RootOf (wf4PermInv g a)) (d4RootOf (wf4PermInv g b)) = dot4 (d4RootOf a) (d4RootOf b) := by
  rw [← (thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1 (wf4PermInv g a) (wf4PermInv g b),
      ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 a).2,
      ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 b).2]

private theorem cu_det4_swap34 (a b c d : Vec4) :
    det4Vecs a b d c = -det4Vecs a b c d := by
  rcases a with ⟨a0, a1, a2, a3⟩; rcases b with ⟨b0, b1, b2, b3⟩
  rcases c with ⟨c0, c1, c2, c3⟩; rcases d with ⟨d0, d1, d2, d3⟩
  simp only [det4Vecs, det2Int]; ring

/-- `Fin 24` bijection `wf4Perm g` packaged as an `Equiv`. -/
def wf4Equiv (g : WF4Elem) : Fin 24 ≃ Fin 24 where
  toFun := wf4Perm g
  invFun := wf4PermInv g
  left_inv := fun a => ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 a).1
  right_inv := fun a => ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 a).2


/-! ## Section 1: Theorem 1 — Chiral `k = 1` Single-Line Obstruction & Sharp `k* = 4` Hierarchy -/

/-- Explicit proper rotation `u ∈ W(F_4)^+` mapping any slot `a : Fin 24` to canonical slot `0`. -/
def mapTo0Proper : Fin 24 → WF4Elem
  | ⟨0, _⟩  => (⟨0, by decide⟩,  ⟨0, by decide⟩, ⟨0, by decide⟩)
  | ⟨1, _⟩  => (⟨0, by decide⟩,  ⟨2, by decide⟩, ⟨0, by decide⟩)
  | ⟨2, _⟩  => (⟨0, by decide⟩,  ⟨4, by decide⟩, ⟨0, by decide⟩)
  | ⟨3, _⟩  => (⟨0, by decide⟩,  ⟨6, by decide⟩, ⟨0, by decide⟩)
  | ⟨4, _⟩  => (⟨3, by decide⟩,  ⟨0, by decide⟩, ⟨0, by decide⟩)
  | ⟨5, _⟩  => (⟨3, by decide⟩,  ⟨2, by decide⟩, ⟨0, by decide⟩)
  | ⟨6, _⟩  => (⟨3, by decide⟩,  ⟨4, by decide⟩, ⟨0, by decide⟩)
  | ⟨7, _⟩  => (⟨3, by decide⟩,  ⟨6, by decide⟩, ⟨0, by decide⟩)
  | ⟨8, _⟩  => (⟨4, by decide⟩,  ⟨0, by decide⟩, ⟨0, by decide⟩)
  | ⟨9, _⟩  => (⟨4, by decide⟩,  ⟨2, by decide⟩, ⟨0, by decide⟩)
  | ⟨10, _⟩ => (⟨4, by decide⟩,  ⟨4, by decide⟩, ⟨0, by decide⟩)
  | ⟨11, _⟩ => (⟨4, by decide⟩,  ⟨6, by decide⟩, ⟨0, by decide⟩)
  | ⟨12, _⟩ => (⟨8, by decide⟩,  ⟨0, by decide⟩, ⟨0, by decide⟩)
  | ⟨13, _⟩ => (⟨8, by decide⟩,  ⟨2, by decide⟩, ⟨0, by decide⟩)
  | ⟨14, _⟩ => (⟨8, by decide⟩,  ⟨4, by decide⟩, ⟨0, by decide⟩)
  | ⟨15, _⟩ => (⟨8, by decide⟩,  ⟨6, by decide⟩, ⟨0, by decide⟩)
  | ⟨16, _⟩ => (⟨11, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩)
  | ⟨17, _⟩ => (⟨11, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩)
  | ⟨18, _⟩ => (⟨11, by decide⟩, ⟨4, by decide⟩, ⟨0, by decide⟩)
  | ⟨19, _⟩ => (⟨11, by decide⟩, ⟨6, by decide⟩, ⟨0, by decide⟩)
  | ⟨20, _⟩ => (⟨16, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩)
  | ⟨21, _⟩ => (⟨16, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩)
  | ⟨22, _⟩ => (⟨16, by decide⟩, ⟨4, by decide⟩, ⟨0, by decide⟩)
  | ⟨23, _⟩ => (⟨16, by decide⟩, ⟨6, by decide⟩, ⟨0, by decide⟩)
  | _ => wf4Id

/-- Explicit proper rotation in `Stab_{W(F_4)^+}(0)` swapping any orthogonal pair `(p, q)` perp to `0`. -/
def swapAt0 (p q : Fin 24) : WF4Elem :=
  match p.val, q.val with
  | 1, 20 | 20, 1 | 2, 23 | 23, 2 => (⟨1, by decide⟩, ⟨0, by decide⟩, ⟨4, by decide⟩)
  | 1, 21 | 21, 1 | 2, 22 | 22, 2 => (⟨1, by decide⟩, ⟨1, by decide⟩, ⟨5, by decide⟩)
  | 1, 22 | 22, 1 | 2, 21 | 21, 2 => (⟨6, by decide⟩, ⟨1, by decide⟩, ⟨5, by decide⟩)
  | 1, 23 | 23, 1 | 2, 20 | 20, 2 => (⟨6, by decide⟩, ⟨1, by decide⟩, ⟨4, by decide⟩)
  | 20, 21 | 21, 20 | 22, 23 | 23, 22 => (⟨6, by decide⟩, ⟨0, by decide⟩, ⟨3, by decide⟩)
  | 20, 22 | 22, 20 | 21, 23 | 23, 21 => (⟨6, by decide⟩, ⟨1, by decide⟩, ⟨3, by decide⟩)
  | _, _ => wf4Id

private theorem mapTo0Proper_spec :
    (∀ a : Fin 24, wf4Det (mapTo0Proper a) = 1) ∧
    (∀ a : Fin 24, wf4Perm (mapTo0Proper a) a = ⟨0, by decide⟩) := by
  decide

private theorem swapAt0_spec :
    ∀ p q : Fin 24,
      dot4 (d4RootOf ⟨0, by decide⟩) (d4RootOf p) = 0 →
      dot4 (d4RootOf ⟨0, by decide⟩) (d4RootOf q) = 0 →
      dot4 (d4RootOf p) (d4RootOf q) = 0 →
      wf4Det (swapAt0 p q) = 1 ∧
      wf4Perm (swapAt0 p q) ⟨0, by decide⟩ = ⟨0, by decide⟩ ∧
      wf4Perm (swapAt0 p q) p = q ∧
      wf4Perm (swapAt0 p q) q = p := by
  decide

/-- **Headline Theorem 1 (Chiral `k = 1` Single-Line Obstruction & Sharp Chirality Hierarchy):**
    1. Under proper chiral rotations `W(F_4)^+`, for EVERY facet `a : Fin 24` and EVERY orthogonal
       pair `(p, q)` perpendicular to `a`, there exists an explicit proper rotation `g ∈ W(F_4)^+`
       (`wf4Det g = 1`) fixing `a` pointwise while swapping `p ↔ q` and reversing 2D orientation in
       the `(p, q)` plane (`det4(a, b, g p, g q) = -det4(a, b, p, q)`).
    2. Paired with `Vibe.thm_k3_pointwise_improper_stabilizer`: under full `W(F_4)`, every triple
       `(a, b, c)` has a pointwise improper mirror (`wf4Det g = -1`), so `k = 1` fails even under
       `W(F_4)^+`, ordered orthogonal `k = 2` anchors succeed under `W(F_4)^+`, and full `W(F_4)`
       requires `k* = 4`. -/
theorem thm_chiral_k1_single_line_obstruction :
    (∀ a p q : Fin 24,
      dot4 (d4RootOf a) (d4RootOf p) = 0 →
      dot4 (d4RootOf a) (d4RootOf q) = 0 →
      dot4 (d4RootOf p) (d4RootOf q) = 0 →
      ∃ g : WF4Elem,
        wf4Det g = 1 ∧
        wf4Perm g a = a ∧
        wf4Perm g p = q ∧
        wf4Perm g q = p ∧
        (∀ b : Fin 24,
          det4 (d4RootOf a) (d4RootOf b) (d4RootOf (wf4Perm g p)) (d4RootOf (wf4Perm g q)) =
            -det4 (d4RootOf a) (d4RootOf b) (d4RootOf p) (d4RootOf q))) ∧
    (∀ a b c : Fin 24,
      ∃ g : WF4Elem, wf4Det g = -1 ∧ wf4Perm g a = a ∧ wf4Perm g b = b ∧ wf4Perm g c = c) := by
  refine ⟨?_, thm_k3_pointwise_improper_stabilizer⟩
  intro a p q hap haq hpq
  let u := mapTo0Proper a
  let p' := wf4Perm u p
  let q' := wf4Perm u q
  have hDot := (thm_wf4_action_orthogonal_and_bijective u).2.2.2.2.1
  have hu0 : wf4Perm u a = ⟨0, by decide⟩ := mapTo0Proper_spec.2 a
  have h0p' : dot4 (d4RootOf ⟨0, by decide⟩) (d4RootOf p') = 0 := by
    rw [← hu0]; exact (hDot a p).trans hap
  have h0q' : dot4 (d4RootOf ⟨0, by decide⟩) (d4RootOf q') = 0 := by
    rw [← hu0]; exact (hDot a q).trans haq
  have hp'q' : dot4 (d4RootOf p') (d4RootOf q') = 0 := (hDot p q).trans hpq
  obtain ⟨hDetH, hH0, hHp, hHq⟩ := swapAt0_spec p' q' h0p' h0q' hp'q'
  let g := wf4Mul (wf4Inv u) (wf4Mul (swapAt0 p' q') u)
  have hDetG : wf4Det g = 1 := by
    change wf4Det (wf4Mul (wf4Inv u) (wf4Mul (swapAt0 p' q') u)) = 1
    rw [thm_wf4_semidirect_order_1152.2.1, thm_wf4_semidirect_order_1152.2.1,
        cu_wf4Det_inv, mapTo0Proper_spec.1 a, hDetH]
    decide
  have hGa : wf4Perm g a = a := by
    change wf4Perm (wf4Mul (wf4Inv u) (wf4Mul (swapAt0 p' q') u)) a = a
    rw [cu_wf4Perm_mul, cu_wf4Perm_mul, cu_wf4Perm_wf4Inv, hu0, hH0, ← hu0,
        ((thm_wf4_action_orthogonal_and_bijective u).2.2.1 a).1]
  have hGp : wf4Perm g p = q := by
    change wf4Perm (wf4Mul (wf4Inv u) (wf4Mul (swapAt0 p' q') u)) p = q
    rw [cu_wf4Perm_mul, cu_wf4Perm_mul, cu_wf4Perm_wf4Inv, hHp,
        ((thm_wf4_action_orthogonal_and_bijective u).2.2.1 q).1]
  have hGq : wf4Perm g q = p := by
    change wf4Perm (wf4Mul (wf4Inv u) (wf4Mul (swapAt0 p' q') u)) q = p
    rw [cu_wf4Perm_mul, cu_wf4Perm_mul, cu_wf4Perm_wf4Inv, hHq,
        ((thm_wf4_action_orthogonal_and_bijective u).2.2.1 p).1]
  refine ⟨g, hDetG, hGa, hGp, hGq, fun b => ?_⟩
  rw [hGp, hGq]
  exact cu_det4_swap34 (d4RootOf a) (d4RootOf b) (d4RootOf p) (d4RootOf q)


/-! ## Section 2: Theorem 2 — `W(F_4)^+` Transitivity on `144` Orthogonal Pairs & `C_4` Stabilizer -/

/-- Orthogonal ordered facet pair predicate `r_a · r_b = 0`. -/
def isOrthPair (a b : Fin 24) : Bool :=
  dot4 (d4RootOf a) (d4RootOf b) == 0

/-- Canonical ordered orthogonal anchor pair `(0, 1)` (`(1, 1, 0, 0)` and `(1, -1, 0, 0)`). -/
def canonA : Fin 24 := ⟨0, by decide⟩
def canonB : Fin 24 := ⟨1, by decide⟩

/-- Horosphere 4-port plane `Q(a, b) = {q | r_q · r_a = 1 ∧ r_q · r_b = 1}`. -/
def isInQ (a b q : Fin 24) : Bool :=
  dot4 (d4RootOf q) (d4RootOf a) == 1 && dot4 (d4RootOf q) (d4RootOf b) == 1

/-- Orthogonal bulk 4-port plane `P(a, b) = {p | r_p · r_a = 0 ∧ r_p · r_b = 0}`. -/
def isInP (a b p : Fin 24) : Bool :=
  dot4 (d4RootOf p) (d4RootOf a) == 0 && dot4 (d4RootOf p) (d4RootOf b) == 0

/-- Explicit proper rotation fixing `0` and mapping any slot `b` orthogonal to `0` to `1`. -/
def mapOrth0To1 (b : Fin 24) : WF4Elem :=
  match b.val with
  | 1  => (⟨0, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩)
  | 2  => (⟨7, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩)
  | 20 => (⟨0, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩)
  | 21 => (⟨0, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩)
  | 22 => (⟨7, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩)
  | 23 => (⟨7, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩)
  | _  => wf4Id

/-- Explicit witness mapping ANY ordered orthogonal pair `(a, b)` to canonical `(0, 1)` inside `W(F_4)^+`. -/
def mapOrthPairToCanon (a b : Fin 24) : WF4Elem :=
  let u := mapTo0Proper a
  wf4Mul (mapOrth0To1 (wf4Perm u b)) u

/-- Order-4 generator of the pointwise stabilizer `C_4 = Stab_{W(F_4)^+}(0, 1)`. -/
def stab01Gen : WF4Elem := (⟨1, by decide⟩, ⟨0, by decide⟩, ⟨3, by decide⟩)

/-- Powers `stab01Gen^k` of the `C_4` stabilizer generator. -/
def stab01Pow : Nat → WF4Elem
  | 0 => wf4Id
  | k + 1 => wf4Mul stab01Gen (stab01Pow k)

/-- Explicit 4-element list of the `C_4` pointwise stabilizer of `(0, 1)` in `W(F_4)^+`. -/
def stab01Elems : List WF4Elem :=
  [stab01Pow 0, stab01Pow 1, stab01Pow 2, stab01Pow 3]

private theorem mapOrth0To1_spec :
    ∀ b : Fin 24, isOrthPair canonA b = true →
      wf4Det (mapOrth0To1 b) = 1 ∧
      wf4Perm (mapOrth0To1 b) canonA = canonA ∧
      wf4Perm (mapOrth0To1 b) b = canonB := by
  decide

private theorem mapOrthPairToCanon_spec (a b : Fin 24) (h : isOrthPair a b = true) :
    wf4Det (mapOrthPairToCanon a b) = 1 ∧
    wf4Perm (mapOrthPairToCanon a b) a = canonA ∧
    wf4Perm (mapOrthPairToCanon a b) b = canonB := by
  unfold mapOrthPairToCanon
  set u := mapTo0Proper a
  have hOrth : isOrthPair canonA (wf4Perm u b) = true := by
    unfold isOrthPair at h ⊢
    rw [← mapTo0Proper_spec.2 a, (thm_wf4_action_orthogonal_and_bijective u).2.2.2.2.1]
    exact h
  obtain ⟨hDetV, hV0, hVb⟩ := mapOrth0To1_spec (wf4Perm u b) hOrth
  refine ⟨?_, ?_, ?_⟩
  · rw [thm_wf4_semidirect_order_1152.2.1, hDetV, mapTo0Proper_spec.1 a]; decide
  · rw [cu_wf4Perm_mul, mapTo0Proper_spec.2 a, hV0]
  · rw [cu_wf4Perm_mul, hVb]

private theorem stab01_c4_characterization (g : WF4Elem) :
    (wf4Det g = 1 ∧ wf4Perm g canonA = canonA ∧ wf4Perm g canonB = canonB) ↔ g ∈ stab01Elems := by
  have hPairEven : ∀ (e : Fin 8) (x : Fin 24), (evenSignSlot e x).val / 4 = x.val / 4 := by decide
  have hPermDisj : ∀ p : Fin 24,
      (perm4Slot p ⟨0, by decide⟩).val / 4 ≠ (perm4Slot p ⟨20, by decide⟩).val / 4 ∧
      (perm4Slot p ⟨0, by decide⟩).val / 4 ≠ (perm4Slot p ⟨21, by decide⟩).val / 4 := by decide
  have hS3Vals :
      (s3Slot ⟨1, by decide⟩ canonA = ⟨0, by decide⟩ ∧ s3Slot ⟨1, by decide⟩ canonB = ⟨21, by decide⟩) ∧
      (s3Slot ⟨2, by decide⟩ canonA = ⟨0, by decide⟩ ∧ s3Slot ⟨2, by decide⟩ canonB = ⟨20, by decide⟩) ∧
      (s3Slot ⟨4, by decide⟩ canonA = ⟨0, by decide⟩ ∧ s3Slot ⟨4, by decide⟩ canonB = ⟨20, by decide⟩) ∧
      (s3Slot ⟨5, by decide⟩ canonA = ⟨0, by decide⟩ ∧ s3Slot ⟨5, by decide⟩ canonB = ⟨21, by decide⟩) := by
    decide
  have hC03 : ∀ (p : Fin 24) (e : Fin 8),
      (wf4Det (p, e, ⟨0, by decide⟩) = 1 ∧
       wf4Perm (p, e, ⟨0, by decide⟩) canonA = canonA ∧
       wf4Perm (p, e, ⟨0, by decide⟩) canonB = canonB) ↔
      (p, e, (⟨0, by decide⟩ : Fin 6)) ∈ stab01Elems := by decide
  have hC3 : ∀ (p : Fin 24) (e : Fin 8),
      (wf4Det (p, e, ⟨3, by decide⟩) = 1 ∧
       wf4Perm (p, e, ⟨3, by decide⟩) canonA = canonA ∧
       wf4Perm (p, e, ⟨3, by decide⟩) canonB = canonB) ↔
      (p, e, (⟨3, by decide⟩ : Fin 6)) ∈ stab01Elems := by decide
  rcases g with ⟨p, e, c⟩
  match c with
  | ⟨0, _⟩ => exact hC03 p e
  | ⟨3, _⟩ => exact hC3 p e
  | ⟨1, _⟩ =>
    constructor
    · rintro ⟨_, h0, h1⟩
      have d0 := congrArg (fun x : Fin 24 => x.val / 4) h0
      have d1 := congrArg (fun x : Fin 24 => x.val / 4) h1
      simp only [wf4Perm, hS3Vals.1.1, hS3Vals.1.2, hPairEven] at d0 d1
      exact absurd (d0.trans d1.symm) (hPermDisj p).2
    · intro hMem; simp [stab01Elems, stab01Pow, stab01Gen, wf4Mul, wf4Id] at hMem
  | ⟨2, _⟩ =>
    constructor
    · rintro ⟨_, h0, h1⟩
      have d0 := congrArg (fun x : Fin 24 => x.val / 4) h0
      have d1 := congrArg (fun x : Fin 24 => x.val / 4) h1
      simp only [wf4Perm, hS3Vals.2.1.1, hS3Vals.2.1.2, hPairEven] at d0 d1
      exact absurd (d0.trans d1.symm) (hPermDisj p).1
    · intro hMem; simp [stab01Elems, stab01Pow, stab01Gen, wf4Mul, wf4Id] at hMem
  | ⟨4, _⟩ =>
    constructor
    · rintro ⟨_, h0, h1⟩
      have d0 := congrArg (fun x : Fin 24 => x.val / 4) h0
      have d1 := congrArg (fun x : Fin 24 => x.val / 4) h1
      simp only [wf4Perm, hS3Vals.2.2.1.1, hS3Vals.2.2.1.2, hPairEven] at d0 d1
      exact absurd (d0.trans d1.symm) (hPermDisj p).1
    · intro hMem; simp [stab01Elems, stab01Pow, stab01Gen, wf4Mul, wf4Id] at hMem
  | ⟨5, _⟩ =>
    constructor
    · rintro ⟨_, h0, h1⟩
      have d0 := congrArg (fun x : Fin 24 => x.val / 4) h0
      have d1 := congrArg (fun x : Fin 24 => x.val / 4) h1
      simp only [wf4Perm, hS3Vals.2.2.2.1, hS3Vals.2.2.2.2, hPairEven] at d0 d1
      exact absurd (d0.trans d1.symm) (hPermDisj p).2
    · intro hMem; simp [stab01Elems, stab01Pow, stab01Gen, wf4Mul, wf4Id] at hMem

private theorem isOrthPair_wf4 (g : WF4Elem) (a b : Fin 24) :
    isOrthPair (wf4Perm g a) (wf4Perm g b) = isOrthPair a b := by
  unfold isOrthPair
  rw [(thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1]

private theorem isInQ_wf4 (g : WF4Elem) (a b q : Fin 24) :
    isInQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g q) = isInQ a b q := by
  unfold isInQ
  rw [(thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1,
      (thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1]

private theorem isInP_wf4 (g : WF4Elem) (a b p : Fin 24) :
    isInP (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) = isInP a b p := by
  unfold isInP
  rw [(thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1,
      (thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1]

private theorem finset_card_pred_equiv (e : Fin 24 ≃ Fin 24) (p q : Fin 24 → Prop)
    [DecidablePred p] [DecidablePred q] (h : ∀ x : Fin 24, p x ↔ q (e x)) :
    (Finset.univ.filter p).card = (Finset.univ.filter q).card := by
  refine Finset.card_bij (fun x _ => e x) ?_ ?_ ?_
  · intro x hx; simp only [Finset.mem_filter, Finset.mem_univ, true_and] at hx ⊢; exact (h x).mp hx
  · intro x _ y _ hxy; exact e.injective hxy
  · intro y hy
    refine ⟨e.symm y, ?_, e.apply_symm_apply y⟩
    simp only [Finset.mem_filter, Finset.mem_univ, true_and] at hy ⊢
    exact (h (e.symm y)).mpr (by simpa using hy)

private theorem canon_QP_cards_and_disjoint :
    (Finset.univ.filter (fun q : Fin 24 => isInQ canonA canonB q = true)).card = 4 ∧
    (Finset.univ.filter (fun p : Fin 24 => isInP canonA canonB p = true)).card = 4 ∧
    (∀ x : Fin 24,
      ¬ ((x = canonA ∨ x = canonB) ∧ isInQ canonA canonB x = true) ∧
      ¬ ((x = canonA ∨ x = canonB) ∧ isInP canonA canonB x = true) ∧
      ¬ (isInQ canonA canonB x = true ∧ isInP canonA canonB x = true)) := by
  decide

/-- **Headline Theorem 2 (`W(F_4)^+` Transitivity on `144` Ordered Orthogonal Pairs & `C_4` Stabilizer):**
    1. There are exactly `144` ordered orthogonal facet pairs `(a, b)` on the 24-cell.
    2. `W(F_4)^+` acts transitively on all `144` ordered orthogonal pairs (explicit witness mapping
       `(a, b) ↦ (canonA, canonB)` and inverse mapping `(canonA, canonB) ↦ (a, b)`).
    3. The pointwise stabilizer `{g ∈ W(F_4)^+ | g(0) = 0, g(1) = 1}` has exact cardinality `4`
       and is generated as a cyclic group `C_4 = ⟨stab01Gen⟩` (`stab01Gen^4 = wf4Id`).
    4. For every orthogonal pair `(a, b)`, `|Q(a, b)| = 4`, `|P(a, b)| = 4`, and `{a, b}`,
       `Q(a, b)`, `P(a, b)` are pairwise disjoint. -/
theorem thm_wf4plus_orth_pair_orbit_and_c4_stabilizer :
    ((Finset.univ.filter (fun ab : Fin 24 × Fin 24 => isOrthPair ab.1 ab.2 = true)).card = 144) ∧
    (∀ a b : Fin 24, isOrthPair a b = true →
      ∃ g : WF4Elem, wf4Det g = 1 ∧ wf4Perm g a = canonA ∧ wf4Perm g b = canonB) ∧
    (∀ a b : Fin 24, isOrthPair a b = true →
      ∃ g : WF4Elem, wf4Det g = 1 ∧ wf4Perm g canonA = a ∧ wf4Perm g canonB = b) ∧
    (wf4Det stab01Gen = 1 ∧ stab01Pow 4 = wf4Id ∧ stab01Elems.Nodup ∧
      (∀ g : WF4Elem, (wf4Det g = 1 ∧ wf4Perm g canonA = canonA ∧ wf4Perm g canonB = canonB) ↔ g ∈ stab01Elems) ∧
      (Finset.univ.filter (fun g : WF4Elem =>
        wf4Det g = 1 ∧ wf4Perm g canonA = canonA ∧ wf4Perm g canonB = canonB)).card = 4) ∧
    (∀ a b : Fin 24, isOrthPair a b = true →
      (Finset.univ.filter (fun q : Fin 24 => isInQ a b q = true)).card = 4 ∧
      (Finset.univ.filter (fun p : Fin 24 => isInP a b p = true)).card = 4 ∧
      (∀ x : Fin 24,
        ¬ ((x = a ∨ x = b) ∧ isInQ a b x = true) ∧
        ¬ ((x = a ∨ x = b) ∧ isInP a b x = true) ∧
        ¬ (isInQ a b x = true ∧ isInP a b x = true))) := by
  have hCount144 : (Finset.univ.filter (fun ab : Fin 24 × Fin 24 => isOrthPair ab.1 ab.2 = true)).card = 144 := by
    have hRow : ∀ a : Fin 24, (Finset.univ.filter (fun b : Fin 24 => isOrthPair a b = true)).card = 6 := by
      intro a
      let u := mapTo0Proper a
      have h0 : (Finset.univ.filter (fun b : Fin 24 => isOrthPair canonA b = true)).card = 6 := by decide
      rw [← h0]
      exact finset_card_pred_equiv (wf4Equiv u) _ _ fun b => by
        change isOrthPair a b = true ↔ isOrthPair canonA (wf4Perm u b) = true
        rw [← mapTo0Proper_spec.2 a, isOrthPair_wf4]
    have hSum : (Finset.univ.filter (fun ab : Fin 24 × Fin 24 => isOrthPair ab.1 ab.2 = true)).card =
        ∑ a : Fin 24, (Finset.univ.filter (fun b : Fin 24 => isOrthPair a b = true)).card := by
      rw [Finset.card_eq_sum_ones, Finset.sum_filter,
          show (Finset.univ : Finset (Fin 24 × Fin 24)) = Finset.univ ×ˢ Finset.univ from rfl,
          Finset.sum_product]
      refine Finset.sum_congr rfl fun a _ => ?_
      rw [Finset.card_eq_sum_ones, Finset.sum_filter]
    rw [hSum]
    simp [hRow]
  have hStabCard : (Finset.univ.filter (fun g : WF4Elem =>
      wf4Det g = 1 ∧ wf4Perm g canonA = canonA ∧ wf4Perm g canonB = canonB)).card = 4 := by
    have hSet : Finset.univ.filter (fun g : WF4Elem =>
        wf4Det g = 1 ∧ wf4Perm g canonA = canonA ∧ wf4Perm g canonB = canonB) = stab01Elems.toFinset := by
      ext g
      simp only [Finset.mem_filter, Finset.mem_univ, true_and, List.mem_toFinset]
      exact stab01_c4_characterization g
    rw [hSet]
    decide
  refine ⟨hCount144,
    fun a b h => ⟨mapOrthPairToCanon a b, mapOrthPairToCanon_spec a b h⟩,
    fun a b h => ?_,
    ⟨by decide, by decide, by decide, stab01_c4_characterization, hStabCard⟩,
    fun a b h => ?_⟩
  · let g := mapOrthPairToCanon a b
    obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b h
    refine ⟨wf4Inv g, by rw [cu_wf4Det_inv, hDet], ?_, ?_⟩
    · rw [cu_wf4Perm_wf4Inv, ← hA, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 a).1]
    · rw [cu_wf4Perm_wf4Inv, ← hB, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 b).1]
  · let g := mapOrthPairToCanon a b
    obtain ⟨_, hA, hB⟩ := mapOrthPairToCanon_spec a b h
    refine ⟨?_, ?_, ?_⟩
    · rw [← canon_QP_cards_and_disjoint.1]
      exact finset_card_pred_equiv (wf4Equiv g) _ _ fun q => by
        change isInQ a b q = true ↔ isInQ canonA canonB (wf4Perm g q) = true
        rw [← hA, ← hB, isInQ_wf4]
    · rw [← canon_QP_cards_and_disjoint.2.1]
      exact finset_card_pred_equiv (wf4Equiv g) _ _ fun p => by
        change isInP a b p = true ↔ isInP canonA canonB (wf4Perm g p) = true
        rw [← hA, ← hB, isInP_wf4]
    · intro x
      have hC := canon_QP_cards_and_disjoint.2.2 (wf4Perm g x)
      rw [← hA, ← hB, isInQ_wf4, isInP_wf4] at hC
      have hEqA : wf4Perm g x = wf4Perm g a ↔ x = a := (wf4Equiv g).injective.eq_iff
      have hEqB : wf4Perm g x = wf4Perm g b ↔ x = b := (wf4Equiv g).injective.eq_iff
      rw [hEqA, hEqB] at hC
      exact hC


/-! ## Section 3: Theorem 3 — Canonical Order-4 Rotations `rotQ`, `rotP`, `qNorth`, `isPerpQ` & Global `W(F_4)^+` Equivariance -/

/-- First `x : Fin 24` satisfying `pred`, or `fallback` if none exists. -/
def findFirst24 (pred : Fin 24 → Bool) (fallback : Fin 24) : Fin 24 :=
  ((List.finRange 24).find? pred).getD fallback

private theorem findFirst24_unique (pred : Fin 24 → Bool) (fallback x0 : Fin 24)
    (hx : pred x0 = true) (huniq : ∀ y : Fin 24, pred y = true → y = x0) :
    findFirst24 pred fallback = x0 := by
  unfold findFirst24
  cases hf : (List.finRange 24).find? pred with
  | none =>
    have hFalse := List.find?_eq_none.mp hf x0 (List.mem_finRange x0)
    exact absurd hx hFalse
  | some y =>
    have hy := List.find?_some hf
    simp only [Option.getD_some]
    exact huniq y hy

/-- Canonical `90°` clockwise rotation on `Q(a, b)` defined by `det4(r_a, r_b, r_q, r_{q'}) = 2`
    (identity outside `Q(a, b)` or when `(a, b)` is not orthogonal). -/
def rotQ (a b q : Fin 24) : Fin 24 :=
  if isOrthPair a b && isInQ a b q then
    findFirst24 (fun q' => isInQ a b q' && decide (det4 (d4RootOf a) (d4RootOf b) (d4RootOf q) (d4RootOf q') = 2)) q
  else q

/-- Inverse `90°` rotation `rotQInv = rotQ^3` on `Q(a, b)`. -/
def rotQInv (a b q : Fin 24) : Fin 24 :=
  rotQ a b (rotQ a b (rotQ a b q))

/-- Canonical `90°` clockwise rotation on `P(a, b)` defined by `det4(r_a, r_b, r_p, r_{p'}) = 4`
    (identity outside `P(a, b)` or when `(a, b)` is not orthogonal). -/
def rotP (a b p : Fin 24) : Fin 24 :=
  if isOrthPair a b && isInP a b p then
    findFirst24 (fun p' => isInP a b p' && decide (det4 (d4RootOf a) (d4RootOf b) (d4RootOf p) (d4RootOf p') = 4)) p
  else p

/-- Inverse `90°` rotation `rotPInv = rotP^3` on `P(a, b)`. -/
def rotPInv (a b p : Fin 24) : Fin 24 :=
  rotP a b (rotP a b (rotP a b p))

/-- Canonical north port `qN ∈ Q(a, b)` determined by `p ∈ P(a, b)` via
    `r_p · r_{qN} = 1 ∧ r_p · r_{rotQ(qN)} = 1`. -/
def qNorth (a b p : Fin 24) : Fin 24 :=
  if isOrthPair a b && isInP a b p then
    findFirst24 (fun q => isInQ a b q &&
      decide (dot4 (d4RootOf p) (d4RootOf q) = 1 ∧ dot4 (d4RootOf p) (d4RootOf (rotQ a b q)) = 1)) p
  else p

/-- Perpendicular-axis predicate `isPerpQ a b p q`: true iff `q ∈ {qN(p), rotQ^2(qN(p))}`
    for orthogonal `(a, b)`, `p ∈ P(a, b)`, `q ∈ Q(a, b)`. -/
def isPerpQ (a b p q : Fin 24) : Bool :=
  isOrthPair a b && isInP a b p && isInQ a b q &&
    let qN := qNorth a b p
    (q == qN || q == rotQ a b (rotQ a b qN))

private theorem canon_rotQ_unique :
    ∀ q : Fin 24, isInQ canonA canonB q = true →
      isInQ canonA canonB (rotQ canonA canonB q) = true ∧
      det4 (d4RootOf canonA) (d4RootOf canonB) (d4RootOf q) (d4RootOf (rotQ canonA canonB q)) = 2 ∧
      (∀ q' : Fin 24, isInQ canonA canonB q' = true →
        det4 (d4RootOf canonA) (d4RootOf canonB) (d4RootOf q) (d4RootOf q') = 2 →
        q' = rotQ canonA canonB q) := by
  decide

private theorem canon_rotP_unique :
    ∀ p : Fin 24, isInP canonA canonB p = true →
      isInP canonA canonB (rotP canonA canonB p) = true ∧
      det4 (d4RootOf canonA) (d4RootOf canonB) (d4RootOf p) (d4RootOf (rotP canonA canonB p)) = 4 ∧
      (∀ p' : Fin 24, isInP canonA canonB p' = true →
        det4 (d4RootOf canonA) (d4RootOf canonB) (d4RootOf p) (d4RootOf p') = 4 →
        p' = rotP canonA canonB p) := by
  decide

private theorem rotQ_spec (a b q : Fin 24) (hab : isOrthPair a b = true) (hq : isInQ a b q = true) :
    isInQ a b (rotQ a b q) = true ∧
    det4 (d4RootOf a) (d4RootOf b) (d4RootOf q) (d4RootOf (rotQ a b q)) = 2 ∧
    (∀ q' : Fin 24, isInQ a b q' = true →
      det4 (d4RootOf a) (d4RootOf b) (d4RootOf q) (d4RootOf q') = 2 → q' = rotQ a b q) := by
  let g := mapOrthPairToCanon a b
  obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
  have hq0 : isInQ canonA canonB (wf4Perm g q) = true := by
    rw [← hA, ← hB, isInQ_wf4]; exact hq
  obtain ⟨hIn0, hDet0, hUniq0⟩ := canon_rotQ_unique (wf4Perm g q) hq0
  let x0 := wf4PermInv g (rotQ canonA canonB (wf4Perm g q))
  have hx0_in : isInQ a b x0 = true := by
    have := isInQ_wf4 g a b x0
    rw [hA, hB, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2] at this
    exact this.symm.trans hIn0
  have hx0_det : det4 (d4RootOf a) (d4RootOf b) (d4RootOf q) (d4RootOf x0) = 2 := by
    have hd := thm_wf4_det4_transformation g a b q x0
    rw [hA, hB, hDet, one_mul, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2] at hd
    exact hd.symm.trans hDet0
  have hx0_uniq : ∀ q' : Fin 24, isInQ a b q' = true →
      det4 (d4RootOf a) (d4RootOf b) (d4RootOf q) (d4RootOf q') = 2 → q' = x0 := by
    intro q' hq' hd'
    have hq'0 : isInQ canonA canonB (wf4Perm g q') = true := by rw [← hA, ← hB, isInQ_wf4]; exact hq'
    have hd'0 : det4 (d4RootOf canonA) (d4RootOf canonB) (d4RootOf (wf4Perm g q)) (d4RootOf (wf4Perm g q')) = 2 := by
      rw [← hA, ← hB, thm_wf4_det4_transformation g, hDet, one_mul]; exact hd'
    have hEq := hUniq0 (wf4Perm g q') hq'0 hd'0
    have hInv := congrArg (wf4PermInv g) hEq
    rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 q').1] at hInv
    exact hInv
  have hRotEq : rotQ a b q = x0 := by
    unfold rotQ
    rw [hab, hq]; simp only [Bool.and_self, ↓reduceIte]
    exact findFirst24_unique _ q x0
      (by simp only [hx0_in, hx0_det, decide_true, Bool.and_self])
      (fun y hy => by
        simp only [Bool.and_eq_true, decide_eq_true_eq] at hy
        exact hx0_uniq y hy.1 hy.2)
  rw [hRotEq]
  exact ⟨hx0_in, hx0_det, hx0_uniq⟩

private theorem rotP_spec (a b p : Fin 24) (hab : isOrthPair a b = true) (hp : isInP a b p = true) :
    isInP a b (rotP a b p) = true ∧
    det4 (d4RootOf a) (d4RootOf b) (d4RootOf p) (d4RootOf (rotP a b p)) = 4 ∧
    (∀ p' : Fin 24, isInP a b p' = true →
      det4 (d4RootOf a) (d4RootOf b) (d4RootOf p) (d4RootOf p') = 4 → p' = rotP a b p) := by
  let g := mapOrthPairToCanon a b
  obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
  have hp0 : isInP canonA canonB (wf4Perm g p) = true := by
    rw [← hA, ← hB, isInP_wf4]; exact hp
  obtain ⟨hIn0, hDet0, hUniq0⟩ := canon_rotP_unique (wf4Perm g p) hp0
  let x0 := wf4PermInv g (rotP canonA canonB (wf4Perm g p))
  have hx0_in : isInP a b x0 = true := by
    have := isInP_wf4 g a b x0
    rw [hA, hB, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2] at this
    exact this.symm.trans hIn0
  have hx0_det : det4 (d4RootOf a) (d4RootOf b) (d4RootOf p) (d4RootOf x0) = 4 := by
    have hd := thm_wf4_det4_transformation g a b p x0
    rw [hA, hB, hDet, one_mul, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2] at hd
    exact hd.symm.trans hDet0
  have hx0_uniq : ∀ p' : Fin 24, isInP a b p' = true →
      det4 (d4RootOf a) (d4RootOf b) (d4RootOf p) (d4RootOf p') = 4 → p' = x0 := by
    intro p' hp' hd'
    have hp'0 : isInP canonA canonB (wf4Perm g p') = true := by rw [← hA, ← hB, isInP_wf4]; exact hp'
    have hd'0 : det4 (d4RootOf canonA) (d4RootOf canonB) (d4RootOf (wf4Perm g p)) (d4RootOf (wf4Perm g p')) = 4 := by
      rw [← hA, ← hB, thm_wf4_det4_transformation g, hDet, one_mul]; exact hd'
    have hEq := hUniq0 (wf4Perm g p') hp'0 hd'0
    have hInv := congrArg (wf4PermInv g) hEq
    rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 p').1] at hInv
    exact hInv
  have hRotEq : rotP a b p = x0 := by
    unfold rotP
    rw [hab, hp]; simp only [Bool.and_self, ↓reduceIte]
    exact findFirst24_unique _ p x0
      (by simp only [hx0_in, hx0_det, decide_true, Bool.and_self])
      (fun y hy => by
        simp only [Bool.and_eq_true, decide_eq_true_eq] at hy
        exact hx0_uniq y hy.1 hy.2)
  rw [hRotEq]
  exact ⟨hx0_in, hx0_det, hx0_uniq⟩

private theorem rotQ_equivariant (g : WF4Elem) (hg : wf4Det g = 1) (a b q : Fin 24) :
    wf4Perm g (rotQ a b q) = rotQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g q) := by
  by_cases hCond : isOrthPair a b = true ∧ isInQ a b q = true
  · obtain ⟨hab, hq⟩ := hCond
    obtain ⟨hIn, hDet, _⟩ := rotQ_spec a b q hab hq
    have hab' : isOrthPair (wf4Perm g a) (wf4Perm g b) = true := by rw [isOrthPair_wf4]; exact hab
    have hq' : isInQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g q) = true := by rw [isInQ_wf4]; exact hq
    have hIn' : isInQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g (rotQ a b q)) = true := by rw [isInQ_wf4]; exact hIn
    have hDet' : det4 (d4RootOf (wf4Perm g a)) (d4RootOf (wf4Perm g b))
        (d4RootOf (wf4Perm g q)) (d4RootOf (wf4Perm g (rotQ a b q))) = 2 := by
      rw [thm_wf4_det4_transformation g, hg, one_mul]; exact hDet
    exact (rotQ_spec (wf4Perm g a) (wf4Perm g b) (wf4Perm g q) hab' hq').2.2 _ hIn' hDet'
  · have hFalse : (isOrthPair a b && isInQ a b q) = false := by
      cases h1 : isOrthPair a b <;> cases h2 : isInQ a b q <;> simp_all
    have hFalse' : (isOrthPair (wf4Perm g a) (wf4Perm g b) && isInQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g q)) = false := by
      rw [isOrthPair_wf4, isInQ_wf4]; exact hFalse
    unfold rotQ; rw [hFalse, hFalse']; rfl

private theorem rotP_equivariant (g : WF4Elem) (hg : wf4Det g = 1) (a b p : Fin 24) :
    wf4Perm g (rotP a b p) = rotP (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) := by
  by_cases hCond : isOrthPair a b = true ∧ isInP a b p = true
  · obtain ⟨hab, hp⟩ := hCond
    obtain ⟨hIn, hDet, _⟩ := rotP_spec a b p hab hp
    have hab' : isOrthPair (wf4Perm g a) (wf4Perm g b) = true := by rw [isOrthPair_wf4]; exact hab
    have hp' : isInP (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) = true := by rw [isInP_wf4]; exact hp
    have hIn' : isInP (wf4Perm g a) (wf4Perm g b) (wf4Perm g (rotP a b p)) = true := by rw [isInP_wf4]; exact hIn
    have hDet' : det4 (d4RootOf (wf4Perm g a)) (d4RootOf (wf4Perm g b))
        (d4RootOf (wf4Perm g p)) (d4RootOf (wf4Perm g (rotP a b p))) = 4 := by
      rw [thm_wf4_det4_transformation g, hg, one_mul]; exact hDet
    exact (rotP_spec (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) hab' hp').2.2 _ hIn' hDet'
  · have hFalse : (isOrthPair a b && isInP a b p) = false := by
      cases h1 : isOrthPair a b <;> cases h2 : isInP a b p <;> simp_all
    have hFalse' : (isOrthPair (wf4Perm g a) (wf4Perm g b) && isInP (wf4Perm g a) (wf4Perm g b) (wf4Perm g p)) = false := by
      rw [isOrthPair_wf4, isInP_wf4]; exact hFalse
    unfold rotP; rw [hFalse, hFalse']; rfl

private theorem rotQInv_equivariant (g : WF4Elem) (hg : wf4Det g = 1) (a b q : Fin 24) :
    wf4Perm g (rotQInv a b q) = rotQInv (wf4Perm g a) (wf4Perm g b) (wf4Perm g q) := by
  unfold rotQInv; rw [rotQ_equivariant g hg, rotQ_equivariant g hg, rotQ_equivariant g hg]

private theorem rotPInv_equivariant (g : WF4Elem) (hg : wf4Det g = 1) (a b p : Fin 24) :
    wf4Perm g (rotPInv a b p) = rotPInv (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) := by
  unfold rotPInv; rw [rotP_equivariant g hg, rotP_equivariant g hg, rotP_equivariant g hg]

private theorem canon_qNorth_unique :
    ∀ p : Fin 24, isInP canonA canonB p = true →
      isInQ canonA canonB (qNorth canonA canonB p) = true ∧
      dot4 (d4RootOf p) (d4RootOf (qNorth canonA canonB p)) = 1 ∧
      dot4 (d4RootOf p) (d4RootOf (rotQ canonA canonB (qNorth canonA canonB p))) = 1 ∧
      (∀ q : Fin 24, isInQ canonA canonB q = true →
        dot4 (d4RootOf p) (d4RootOf q) = 1 →
        dot4 (d4RootOf p) (d4RootOf (rotQ canonA canonB q)) = 1 →
        q = qNorth canonA canonB p) := by
  decide

private theorem qNorth_spec (a b p : Fin 24) (hab : isOrthPair a b = true) (hp : isInP a b p = true) :
    isInQ a b (qNorth a b p) = true ∧
    dot4 (d4RootOf p) (d4RootOf (qNorth a b p)) = 1 ∧
    dot4 (d4RootOf p) (d4RootOf (rotQ a b (qNorth a b p))) = 1 ∧
    (∀ q : Fin 24, isInQ a b q = true →
      dot4 (d4RootOf p) (d4RootOf q) = 1 →
      dot4 (d4RootOf p) (d4RootOf (rotQ a b q)) = 1 → q = qNorth a b p) := by
  let g := mapOrthPairToCanon a b
  obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
  have hp0 : isInP canonA canonB (wf4Perm g p) = true := by rw [← hA, ← hB, isInP_wf4]; exact hp
  obtain ⟨hIn0, hD10, hD20, hUniq0⟩ := canon_qNorth_unique (wf4Perm g p) hp0
  let x0 := wf4PermInv g (qNorth canonA canonB (wf4Perm g p))
  have hgx0 : wf4Perm g x0 = qNorth canonA canonB (wf4Perm g p) :=
    ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2
  have hx0_in : isInQ a b x0 = true := by
    have := isInQ_wf4 g a b x0; rw [hA, hB, hgx0] at this; exact this.symm.trans hIn0
  have hx0_d1 : dot4 (d4RootOf p) (d4RootOf x0) = 1 := by
    rw [← (thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1 p x0, hgx0]; exact hD10
  have hx0_d2 : dot4 (d4RootOf p) (d4RootOf (rotQ a b x0)) = 1 := by
    rw [← (thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1 p (rotQ a b x0),
        rotQ_equivariant g hDet, hA, hB, hgx0]
    exact hD20
  have hx0_uniq : ∀ q : Fin 24, isInQ a b q = true →
      dot4 (d4RootOf p) (d4RootOf q) = 1 →
      dot4 (d4RootOf p) (d4RootOf (rotQ a b q)) = 1 → q = x0 := by
    intro q hq hd1 hd2
    have hq0 : isInQ canonA canonB (wf4Perm g q) = true := by rw [← hA, ← hB, isInQ_wf4]; exact hq
    have hd10 : dot4 (d4RootOf (wf4Perm g p)) (d4RootOf (wf4Perm g q)) = 1 := by
      rw [(thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1]; exact hd1
    have hd20 : dot4 (d4RootOf (wf4Perm g p)) (d4RootOf (rotQ canonA canonB (wf4Perm g q))) = 1 := by
      rw [← hA, ← hB, ← rotQ_equivariant g hDet, (thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1]; exact hd2
    have hEq := hUniq0 (wf4Perm g q) hq0 hd10 hd20
    have hInv := congrArg (wf4PermInv g) hEq
    rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 q).1] at hInv
    exact hInv
  have hEqQN : qNorth a b p = x0 := by
    unfold qNorth; rw [hab, hp]; simp only [Bool.and_self, ↓reduceIte]
    exact findFirst24_unique _ p x0
      (by simp only [hx0_in, hx0_d1, hx0_d2, and_self, decide_true, Bool.and_self])
      (fun y hy => by
        simp only [Bool.and_eq_true, decide_eq_true_eq] at hy
        exact hx0_uniq y hy.1 hy.2.1 hy.2.2)
  rw [hEqQN]
  exact ⟨hx0_in, hx0_d1, hx0_d2, hx0_uniq⟩

private theorem qNorth_equivariant (g : WF4Elem) (hg : wf4Det g = 1) (a b p : Fin 24) :
    wf4Perm g (qNorth a b p) = qNorth (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) := by
  by_cases hCond : isOrthPair a b = true ∧ isInP a b p = true
  · obtain ⟨hab, hp⟩ := hCond
    obtain ⟨hIn, hd1, hd2, _⟩ := qNorth_spec a b p hab hp
    have hab' : isOrthPair (wf4Perm g a) (wf4Perm g b) = true := by rw [isOrthPair_wf4]; exact hab
    have hp' : isInP (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) = true := by rw [isInP_wf4]; exact hp
    have hIn' : isInQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g (qNorth a b p)) = true := by rw [isInQ_wf4]; exact hIn
    have hd1' : dot4 (d4RootOf (wf4Perm g p)) (d4RootOf (wf4Perm g (qNorth a b p))) = 1 := by
      rw [(thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1]; exact hd1
    have hd2' : dot4 (d4RootOf (wf4Perm g p)) (d4RootOf (rotQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g (qNorth a b p)))) = 1 := by
      rw [← rotQ_equivariant g hg, (thm_wf4_action_orthogonal_and_bijective g).2.2.2.2.1]; exact hd2
    exact (qNorth_spec (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) hab' hp').2.2.2 _ hIn' hd1' hd2'
  · have hFalse : (isOrthPair a b && isInP a b p) = false := by
      cases h1 : isOrthPair a b <;> cases h2 : isInP a b p <;> simp_all
    have hFalse' : (isOrthPair (wf4Perm g a) (wf4Perm g b) && isInP (wf4Perm g a) (wf4Perm g b) (wf4Perm g p)) = false := by
      rw [isOrthPair_wf4, isInP_wf4]; exact hFalse
    unfold qNorth; rw [hFalse, hFalse']; rfl

private theorem isPerpQ_equivariant (g : WF4Elem) (hg : wf4Det g = 1) (a b p q : Fin 24) :
    isPerpQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g p) (wf4Perm g q) = isPerpQ a b p q := by
  unfold isPerpQ
  rw [isOrthPair_wf4, isInP_wf4, isInQ_wf4,
      ← qNorth_equivariant g hg, ← rotQ_equivariant g hg, ← rotQ_equivariant g hg]
  have hInj : ∀ x y : Fin 24, (wf4Perm g x == wf4Perm g y) = (x == y) := fun x y => by
    simp only [beq_iff_eq, (wf4Equiv g).injective.eq_iff]
  rw [hInj, hInj]

private theorem canon_rot_laws :
    (∀ q : Fin 24, rotQ canonA canonB (rotQ canonA canonB (rotQ canonA canonB (rotQ canonA canonB q))) = q) ∧
    (∀ p : Fin 24, rotP canonA canonB (rotP canonA canonB (rotP canonA canonB (rotP canonA canonB p))) = p) ∧
    (∀ q : Fin 24, isInQ canonA canonB q = true →
      rotQ canonA canonB q ≠ q ∧ rotQ canonA canonB (rotQ canonA canonB q) ≠ q) ∧
    (∀ p : Fin 24, isInP canonA canonB p = true →
      rotP canonA canonB p ≠ p ∧ rotP canonA canonB (rotP canonA canonB p) ≠ p) ∧
    (∀ q : Fin 24, rotQ canonA canonB (rotQ canonA canonB q) = rotQ canonB canonA (rotQ canonB canonA q)) ∧
    (∀ p q : Fin 24, isPerpQ canonA canonB (rotP canonA canonB p) (rotQ canonA canonB q) = isPerpQ canonA canonB p q) ∧
    (∀ p q : Fin 24, isPerpQ canonA canonB p (rotQ canonA canonB (rotQ canonA canonB q)) = isPerpQ canonA canonB p q) := by
  decide

private theorem rotQ_pow4 (a b q : Fin 24) :
    rotQ a b (rotQ a b (rotQ a b (rotQ a b q))) = q := by
  by_cases hab : isOrthPair a b = true
  · let g := mapOrthPairToCanon a b
    obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
    apply (wf4Equiv g).injective
    change wf4Perm g (rotQ a b (rotQ a b (rotQ a b (rotQ a b q)))) = wf4Perm g q
    rw [rotQ_equivariant g hDet, rotQ_equivariant g hDet, rotQ_equivariant g hDet, rotQ_equivariant g hDet, hA, hB]
    exact canon_rot_laws.1 (wf4Perm g q)
  · have hf : isOrthPair a b = false := Bool.eq_false_iff.mpr hab
    simp [rotQ, hf]

private theorem rotP_pow4 (a b p : Fin 24) :
    rotP a b (rotP a b (rotP a b (rotP a b p))) = p := by
  by_cases hab : isOrthPair a b = true
  · let g := mapOrthPairToCanon a b
    obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
    apply (wf4Equiv g).injective
    change wf4Perm g (rotP a b (rotP a b (rotP a b (rotP a b p)))) = wf4Perm g p
    rw [rotP_equivariant g hDet, rotP_equivariant g hDet, rotP_equivariant g hDet, rotP_equivariant g hDet, hA, hB]
    exact canon_rot_laws.2.1 (wf4Perm g p)
  · have hf : isOrthPair a b = false := Bool.eq_false_iff.mpr hab
    simp [rotP, hf]

private theorem rotQ_inv_left (a b q : Fin 24) : rotQInv a b (rotQ a b q) = q :=
  rotQ_pow4 a b q

private theorem rotQ_inv_right (a b q : Fin 24) : rotQ a b (rotQInv a b q) = q :=
  rotQ_pow4 a b q

private theorem rotP_inv_left (a b p : Fin 24) : rotPInv a b (rotP a b p) = p :=
  rotP_pow4 a b p

private theorem rotP_inv_right (a b p : Fin 24) : rotP a b (rotPInv a b p) = p :=
  rotP_pow4 a b p

private theorem rotQ2_invol (a b q : Fin 24) :
    rotQ a b (rotQ a b (rotQ a b (rotQ a b q))) = q :=
  rotQ_pow4 a b q

private theorem isInQ_rotQ (a b q : Fin 24) : isInQ a b (rotQ a b q) = isInQ a b q := by
  by_cases h : isOrthPair a b = true ∧ isInQ a b q = true
  · rw [h.2]; exact (rotQ_spec a b q h.1 h.2).1
  · have hf : (isOrthPair a b && isInQ a b q) = false := by
      cases h1 : isOrthPair a b <;> cases h2 : isInQ a b q <;> simp_all
    unfold rotQ; rw [hf]; rfl

private theorem isInQ_rotQInv (a b q : Fin 24) : isInQ a b (rotQInv a b q) = isInQ a b q := by
  unfold rotQInv; rw [isInQ_rotQ, isInQ_rotQ, isInQ_rotQ]

private theorem isInP_rotP (a b p : Fin 24) : isInP a b (rotP a b p) = isInP a b p := by
  by_cases h : isOrthPair a b = true ∧ isInP a b p = true
  · rw [h.2]; exact (rotP_spec a b p h.1 h.2).1
  · have hf : (isOrthPair a b && isInP a b p) = false := by
      cases h1 : isOrthPair a b <;> cases h2 : isInP a b p <;> simp_all
    unfold rotP; rw [hf]; rfl

private theorem isInP_rotPInv (a b p : Fin 24) : isInP a b (rotPInv a b p) = isInP a b p := by
  unfold rotPInv; rw [isInP_rotP, isInP_rotP, isInP_rotP]

private theorem rotQ_outside (a b x : Fin 24) (h : isInQ a b x = false) : rotQ a b x = x := by
  unfold rotQ; simp [h]

private theorem rotP_outside (a b x : Fin 24) (h : isInP a b x = false) : rotP a b x = x := by
  unfold rotP; simp [h]

private theorem isPerpQ_rot_preserved (a b p q : Fin 24) :
    isPerpQ a b (rotP a b p) (rotQ a b q) = isPerpQ a b p q := by
  by_cases hab : isOrthPair a b = true
  · let g := mapOrthPairToCanon a b
    obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
    rw [← isPerpQ_equivariant g hDet a b (rotP a b p) (rotQ a b q),
        ← isPerpQ_equivariant g hDet a b p q,
        rotP_equivariant g hDet, rotQ_equivariant g hDet, hA, hB]
    exact canon_rot_laws.2.2.2.2.2.1 (wf4Perm g p) (wf4Perm g q)
  · have hf : isOrthPair a b = false := Bool.eq_false_iff.mpr hab
    simp [isPerpQ, hf]

private theorem isPerpQ_rotQ2_preserved (a b p q : Fin 24) :
    isPerpQ a b p (rotQ a b (rotQ a b q)) = isPerpQ a b p q := by
  by_cases hab : isOrthPair a b = true
  · let g := mapOrthPairToCanon a b
    obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
    rw [← isPerpQ_equivariant g hDet a b p (rotQ a b (rotQ a b q)),
        ← isPerpQ_equivariant g hDet a b p q,
        rotQ_equivariant g hDet, rotQ_equivariant g hDet, hA, hB]
    exact canon_rot_laws.2.2.2.2.2.2 (wf4Perm g p) (wf4Perm g q)
  · have hf : isOrthPair a b = false := Bool.eq_false_iff.mpr hab
    simp [isPerpQ, hf]

/-- **Headline Theorem 3 (Canonical Order-4 `90°` Rotations & Global `W(F_4)^+`-Equivariance):**
    For all ordered orthogonal pairs `(a, b)`, `rotQ` (`det4 = 2` on `Q`) and `rotP` (`det4 = 4` on `P`)
    have exact order `4`, inverses `rotQInv = rotQ^3` and `rotPInv = rotP^3`, swap-invariant involution
    `rotQ^2(a, b) = rotQ^2(b, a)`, exact perpendicular preservation `isPerpQ (rotP p) (rotQ q) = isPerpQ p q`,
    and unconditional global `W(F_4)^+`-equivariance across ALL `576` proper rotations `g` (`wf4Det g = 1`). -/
theorem thm_chiral_rot90_order4_and_equivariant :
    (∀ a b q : Fin 24, isOrthPair a b = true → isInQ a b q = true →
      isInQ a b (rotQ a b q) = true ∧
      det4 (d4RootOf a) (d4RootOf b) (d4RootOf q) (d4RootOf (rotQ a b q)) = 2 ∧
      rotQ a b q ≠ q ∧ rotQ a b (rotQ a b q) ≠ q) ∧
    (∀ a b p : Fin 24, isOrthPair a b = true → isInP a b p = true →
      isInP a b (rotP a b p) = true ∧
      det4 (d4RootOf a) (d4RootOf b) (d4RootOf p) (d4RootOf (rotP a b p)) = 4 ∧
      rotP a b p ≠ p ∧ rotP a b (rotP a b p) ≠ p) ∧
    (∀ a b q : Fin 24, rotQ a b (rotQ a b (rotQ a b (rotQ a b q))) = q ∧
      rotQInv a b (rotQ a b q) = q ∧ rotQ a b (rotQInv a b q) = q) ∧
    (∀ a b p : Fin 24, rotP a b (rotP a b (rotP a b (rotP a b p))) = p ∧
      rotPInv a b (rotP a b p) = p ∧ rotP a b (rotPInv a b p) = p) ∧
    (∀ a b q : Fin 24, isOrthPair a b = true →
      rotQ a b (rotQ a b q) = rotQ b a (rotQ b a q)) ∧
    (∀ a b p q : Fin 24, isPerpQ a b (rotP a b p) (rotQ a b q) = isPerpQ a b p q) ∧
    (∀ (g : WF4Elem), wf4Det g = 1 → ∀ a b x y : Fin 24,
      wf4Perm g (rotQ a b x) = rotQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g x) ∧
      wf4Perm g (rotP a b x) = rotP (wf4Perm g a) (wf4Perm g b) (wf4Perm g x) ∧
      wf4Perm g (qNorth a b x) = qNorth (wf4Perm g a) (wf4Perm g b) (wf4Perm g x) ∧
      isPerpQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g x) (wf4Perm g y) = isPerpQ a b x y) := by
  refine ⟨?_, ?_,
    fun a b q => ⟨rotQ_pow4 a b q, rotQ_inv_left a b q, rotQ_inv_right a b q⟩,
    fun a b p => ⟨rotP_pow4 a b p, rotP_inv_left a b p, rotP_inv_right a b p⟩,
    ?_, isPerpQ_rot_preserved,
    fun g hg a b x y => ⟨rotQ_equivariant g hg a b x, rotP_equivariant g hg a b x,
      qNorth_equivariant g hg a b x, isPerpQ_equivariant g hg a b x y⟩⟩
  · intro a b q hab hq
    obtain ⟨hIn, hD, _⟩ := rotQ_spec a b q hab hq
    let g := mapOrthPairToCanon a b
    obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
    have hq0 : isInQ canonA canonB (wf4Perm g q) = true := by rw [← hA, ← hB, isInQ_wf4]; exact hq
    obtain ⟨hNe1, hNe2⟩ := canon_rot_laws.2.2.1 (wf4Perm g q) hq0
    refine ⟨hIn, hD, fun hEq => hNe1 ?_, fun hEq => hNe2 ?_⟩
    · rw [← hA, ← hB, ← rotQ_equivariant g hDet, hEq]
    · rw [← hA, ← hB, ← rotQ_equivariant g hDet, ← rotQ_equivariant g hDet, hEq]
  · intro a b p hab hp
    obtain ⟨hIn, hD, _⟩ := rotP_spec a b p hab hp
    let g := mapOrthPairToCanon a b
    obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
    have hp0 : isInP canonA canonB (wf4Perm g p) = true := by rw [← hA, ← hB, isInP_wf4]; exact hp
    obtain ⟨hNe1, hNe2⟩ := canon_rot_laws.2.2.2.1 (wf4Perm g p) hp0
    refine ⟨hIn, hD, fun hEq => hNe1 ?_, fun hEq => hNe2 ?_⟩
    · rw [← hA, ← hB, ← rotP_equivariant g hDet, hEq]
    · rw [← hA, ← hB, ← rotP_equivariant g hDet, ← rotP_equivariant g hDet, hEq]
  · intro a b q hab
    let g := mapOrthPairToCanon a b
    obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
    apply (wf4Equiv g).injective
    change wf4Perm g (rotQ a b (rotQ a b q)) = wf4Perm g (rotQ b a (rotQ b a q))
    rw [rotQ_equivariant g hDet, rotQ_equivariant g hDet,
        rotQ_equivariant g hDet, rotQ_equivariant g hDet, hA, hB]
    exact canon_rot_laws.2.2.2.2.1 (wf4Perm g q)


/-! ## Section 4: Generic `Fin 24` Equivariant Predicate & Slot-Permutation Infrastructure -/

/-- Exact count of slots `i : Fin 24` satisfying Boolean predicate `p`. -/
def countPred24 (p : Fin 24 → Bool) : Nat :=
  ∑ i : Fin 24, if p i = true then 1 else 0

/-- Boolean universal check across all `24` slots. -/
def allPred24 (p : Fin 24 → Bool) : Bool :=
  (List.finRange 24).all p

/-- Extract the unique slot `a : Fin 24` satisfying `p` iff `countPred24 p = 1`. -/
def uniquePred24 (p : Fin 24 → Bool) : Option (Fin 24) :=
  if countPred24 p = 1 then (List.finRange 24).find? p else none

private theorem allPred24_eq_true_iff (p : Fin 24 → Bool) :
    allPred24 p = true ↔ ∀ i : Fin 24, p i = true := by
  simp [allPred24, List.all_eq_true]

private theorem countPred24_comp_equiv (e : Fin 24 ≃ Fin 24) (p : Fin 24 → Bool) :
    countPred24 (fun i => p (e i)) = countPred24 p := by
  unfold countPred24
  exact Equiv.sum_comp e (fun i => if p i = true then 1 else 0)

private theorem allPred24_comp_equiv (e : Fin 24 ≃ Fin 24) (p : Fin 24 → Bool) :
    allPred24 (fun i => p (e i)) = allPred24 p := by
  cases h : allPred24 p with
  | true =>
    rw [allPred24_eq_true_iff] at h ⊢
    intro i; exact h (e i)
  | false =>
    cases h' : allPred24 (fun i => p (e i)) with
    | false => rfl
    | true =>
      rw [allPred24_eq_true_iff] at h'
      have ht : allPred24 p = true := (allPred24_eq_true_iff p).mpr fun i => by
        simpa using h' (e.symm i)
      rw [ht] at h; exact Bool.noConfusion h

private theorem countPred24_eq_one_iff (p : Fin 24 → Bool) :
    countPred24 p = 1 ↔ ∃ a : Fin 24, p a = true ∧ ∀ i : Fin 24, p i = true → i = a := by
  have hCard : countPred24 p = (Finset.univ.filter (fun i : Fin 24 => p i = true)).card := by
    unfold countPred24
    rw [Finset.card_eq_sum_ones, Finset.sum_filter]
  rw [hCard, Finset.card_eq_one]
  constructor
  · rintro ⟨a, ha⟩
    refine ⟨a, ?_, fun i hi => ?_⟩
    · have : a ∈ Finset.univ.filter (fun i : Fin 24 => p i = true) := by rw [ha]; simp
      simpa using this
    · have : i ∈ ({a} : Finset (Fin 24)) := by rw [← ha]; simp [hi]
      simpa using this
  · rintro ⟨a, ha, huniq⟩
    refine ⟨a, ?_⟩
    ext i
    simp only [Finset.mem_filter, Finset.mem_univ, true_and, Finset.mem_singleton]
    exact ⟨huniq i, fun h => h ▸ ha⟩

private theorem uniquePred24_eq_some_iff (p : Fin 24 → Bool) (a : Fin 24) :
    uniquePred24 p = some a ↔ p a = true ∧ ∀ i : Fin 24, p i = true → i = a := by
  unfold uniquePred24
  constructor
  · intro h
    split_ifs at h with hc
    · obtain ⟨a0, ha0, huniq0⟩ := (countPred24_eq_one_iff p).mp hc
      have hFind : (List.finRange 24).find? p = some a0 := by
        cases hf : (List.finRange 24).find? p with
        | none =>
          exact absurd ha0 (List.find?_eq_none.mp hf a0 (List.mem_finRange a0))
        | some y =>
          rw [huniq0 y (List.find?_some hf)]
      rw [hFind] at h
      cases h
      exact ⟨ha0, huniq0⟩
    · exact Option.noConfusion h
  · rintro ⟨ha, huniq⟩
    have hc : countPred24 p = 1 := (countPred24_eq_one_iff p).mpr ⟨a, ha, huniq⟩
    rw [if_pos hc]
    cases hf : (List.finRange 24).find? p with
    | none => exact absurd ha (List.find?_eq_none.mp hf a (List.mem_finRange a))
    | some y => rw [huniq y (List.find?_some hf)]

private theorem uniquePred24_comp_equiv (e : Fin 24 ≃ Fin 24) (p : Fin 24 → Bool) :
    uniquePred24 (fun i => p (e.symm i)) = (uniquePred24 p).map e := by
  cases hu : uniquePred24 p with
  | some a =>
    obtain ⟨ha, huniq⟩ := (uniquePred24_eq_some_iff p a).mp hu
    simp only [Option.map_some]
    exact (uniquePred24_eq_some_iff _ (e a)).mpr
      ⟨by simpa using ha, fun i hi => by
        have h1 := huniq (e.symm i) hi
        have h2 := congrArg e h1
        simpa using h2.symm⟩
  | none =>
    simp only [Option.map_none]
    cases hu' : uniquePred24 (fun i => p (e.symm i)) with
    | none => rfl
    | some b =>
      obtain ⟨hb, huniq⟩ := (uniquePred24_eq_some_iff _ b).mp hu'
      have hSome : uniquePred24 p = some (e.symm b) :=
        (uniquePred24_eq_some_iff p (e.symm b)).mpr ⟨hb, fun i hi => by
          have h1 := huniq (e i) (by simpa using hi)
          have h2 := congrArg e.symm h1
          simpa using h2⟩
      rw [hSome] at hu; exact Option.noConfusion hu

private theorem uniquePred24_congr (p q : Fin 24 → Bool) (h : ∀ i : Fin 24, p i = q i) :
    uniquePred24 p = uniquePred24 q := by
  have hf : p = q := funext h
  rw [hf]

private theorem countPred24_congr (p q : Fin 24 → Bool) (h : ∀ i : Fin 24, p i = q i) :
    countPred24 p = countPred24 q := by
  have hf : p = q := funext h
  rw [hf]

private theorem allPred24_congr (p q : Fin 24 → Bool) (h : ∀ i : Fin 24, p i = q i) :
    allPred24 p = allPred24 q := by
  have hf : p = q := funext h
  rw [hf]

private theorem isInP_opp (a b p : Fin 24) : isInP a b (oppSlot p) = isInP a b p := by
  have hOpp : ∀ x y : Fin 24, dot4 (d4RootOf (oppSlot x)) (d4RootOf y) = -dot4 (d4RootOf x) (d4RootOf y) := by
    decide
  unfold isInP
  rw [hOpp p a, hOpp p b]
  have hZero : ∀ z : Int, (-z == 0) = (z == 0) := fun z => by
    cases h : (z == 0) <;> simp_all
  rw [hZero, hZero]

/-- `Equiv` packaging `rotQ a b` on `Fin 24`. -/
def rotQEquiv (a b : Fin 24) : Fin 24 ≃ Fin 24 where
  toFun := rotQ a b
  invFun := rotQInv a b
  left_inv := rotQ_inv_left a b
  right_inv := rotQ_inv_right a b

/-- `Equiv` packaging `rotQ^2 a b` on `Fin 24`. -/
def rotQ2Equiv (a b : Fin 24) : Fin 24 ≃ Fin 24 where
  toFun := fun x => rotQ a b (rotQ a b x)
  invFun := fun x => rotQ a b (rotQ a b x)
  left_inv := rotQ2_invol a b
  right_inv := rotQ2_invol a b

/-- `Equiv` packaging `rotP a b` on `Fin 24`. -/
def rotPEquiv (a b : Fin 24) : Fin 24 ≃ Fin 24 where
  toFun := rotP a b
  invFun := rotPInv a b
  left_inv := rotP_inv_left a b
  right_inv := rotP_inv_right a b

/-- `Equiv` packaging simultaneous `rotQ` on `Q(a, b)` and `rotP` on `P(a, b)` (commuting because `Q ∩ P = ∅`). -/
def rotQPEquiv (a b : Fin 24) : Fin 24 ≃ Fin 24 :=
  (rotPEquiv a b).trans (rotQEquiv a b)

private theorem rotQP_symm_eq (a b i : Fin 24) :
    (rotQPEquiv a b).symm i = rotPInv a b (rotQInv a b i) := rfl

private theorem rotQP_comm (a b i : Fin 24) :
    rotPInv a b (rotQInv a b i) = rotQInv a b (rotPInv a b i) := by
  by_cases hab : isOrthPair a b = true
  · have hDisj := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hab).2.2
    by_cases hq : isInQ a b i = true
    · have hp : isInP a b i = false := by
        cases hp' : isInP a b i with
        | false => rfl
        | true => exact absurd ⟨hq, hp'⟩ (hDisj i).2.2
      have hp' : isInP a b (rotQInv a b i) = false := by
        cases h2 : isInP a b (rotQInv a b i) with
        | false => rfl
        | true =>
          have hq' : isInQ a b (rotQInv a b i) = true := by rw [isInQ_rotQInv]; exact hq
          exact absurd ⟨hq', h2⟩ (hDisj (rotQInv a b i)).2.2
      have hPI : ∀ x, isInP a b x = false → rotPInv a b x = x := fun x hx => by
        unfold rotPInv; rw [rotP_outside a b x hx, rotP_outside a b x hx, rotP_outside a b x hx]
      rw [hPI _ hp', hPI _ hp]
    · have hqf : isInQ a b i = false := Bool.eq_false_iff.mpr hq
      have hqf' : isInQ a b (rotPInv a b i) = false := by
        cases hp : isInP a b i with
        | false =>
          have hPI : rotPInv a b i = i := by
            unfold rotPInv; rw [rotP_outside a b i hp, rotP_outside a b i hp, rotP_outside a b i hp]
          rw [hPI]; exact hqf
        | true =>
          cases h2 : isInQ a b (rotPInv a b i) with
          | false => rfl
          | true =>
            have hp' : isInP a b (rotPInv a b i) = true := by rw [isInP_rotPInv]; exact hp
            exact absurd ⟨h2, hp'⟩ (hDisj (rotPInv a b i)).2.2
      have hQI : ∀ x, isInQ a b x = false → rotQInv a b x = x := fun x hx => by
        unfold rotQInv; rw [rotQ_outside a b x hx, rotQ_outside a b x hx, rotQ_outside a b x hx]
      rw [hQI _ hqf, hQI _ hqf']
  · have hf : isOrthPair a b = false := Bool.eq_false_iff.mpr hab
    simp [rotPInv, rotQInv, rotP, rotQ, hf]


/-! ## Section 5: Theorem 4 — 5-Symbol Homogeneous `W(F_4)^+`-Equivariant Universal CA (`Sym5`) -/

/-- 5-symbol port alphabet for homogeneous chiral horosphere universality. -/
inductive Sym5 where
  | empty
  | pulse
  | ancA
  | ancB
  | rotR
  deriving DecidableEq, Repr

/-- Catalyst predicate on `Sym5` (`ancA`, `ancB`, `rotR`). -/
def isCat5 : Sym5 → Bool
  | .ancA | .ancB | .rotR => true
  | .empty | .pulse => false

/-- `W(F_4)` action on a `Sym5` cell configuration: `(g · cell)(i) = cell(g⁻¹ i)`. -/
def actSym5 (g : WF4Elem) (cell : Fin 24 → Sym5) : Fin 24 → Sym5 :=
  fun i => cell (wf4PermInv g i)

/-- Per-species slot count in a `Sym5` cell. -/
def countSym5 (s : Sym5) (cell : Fin 24 → Sym5) : Nat :=
  countPred24 (fun i => cell i == s)

/-- Active horosphere gate sector classification for `Sym5`: returns `some (a, b, rCount)`
    when the cell hosts an orthogonal `(ancA, ancB)` anchor pair, catalyst-free `Q(a, b)`,
    `{empty, rotR}`-only `P(a, b)`, and `rCount ∈ {0, 1, 4}`. -/
def gateMode5 (cell : Fin 24 → Sym5) : Option (Fin 24 × Fin 24 × Nat) :=
  match uniquePred24 (fun i => cell i == .ancA), uniquePred24 (fun i => cell i == .ancB) with
  | some a, some b =>
    if isOrthPair a b &&
       allPred24 (fun i => !isInQ a b i || !isCat5 (cell i)) &&
       allPred24 (fun i => !isInP a b i || (cell i == .empty || cell i == .rotR)) then
      let r := countPred24 (fun i => isInP a b i && (cell i == .rotR))
      if r = 0 || r = 1 || r = 4 then some (a, b, r) else none
    else none
  | _, _ => none

/-- Background (empty space / off-parity) antipodal-line swap on `Sym5`, leaving catalyst lines untouched. -/
def bgStep5 (cell : Fin 24 → Sym5) : Fin 24 → Sym5 :=
  fun s => if isCat5 (cell s) || isCat5 (cell (oppSlot s)) then cell s else cell (oppSlot s)

/-- 5-symbol homogeneous `W(F_4)^+`-equivariant local bijection `localUniv5`. -/
def localUniv5 (cell : Fin 24 → Sym5) : Fin 24 → Sym5 :=
  match gateMode5 cell with
  | some (a, b, r) =>
    if r = 0 then
      fun i => cell ((rotQ2Equiv a b).symm i)
    else if r = 4 then
      fun i => cell ((rotQEquiv a b).symm i)
    else
      match uniquePred24 (fun i => isInP a b i && (cell i == .rotR)),
            uniquePred24 (fun i => isInQ a b i && (cell i == .pulse)) with
      | some pBar, some qIn =>
        if isPerpQ a b pBar qIn then
          fun i => cell ((rotQPEquiv a b).symm i)
        else
          fun i => cell ((rotQ2Equiv a b).symm i)
      | _, _ => cell
  | none => bgStep5 cell

/-- Explicit closed-form local inverse `localUniv5Inv` of `localUniv5`. -/
def localUniv5Inv (cell : Fin 24 → Sym5) : Fin 24 → Sym5 :=
  match gateMode5 cell with
  | some (a, b, r) =>
    if r = 0 then
      fun i => cell (rotQ2Equiv a b i)
    else if r = 4 then
      fun i => cell (rotQEquiv a b i)
    else
      match uniquePred24 (fun i => isInP a b i && (cell i == .rotR)),
            uniquePred24 (fun i => isInQ a b i && (cell i == .pulse)) with
      | some pBar, some qIn =>
        if isPerpQ a b pBar qIn then
          fun i => cell (rotQPEquiv a b i)
        else
          fun i => cell (rotQ2Equiv a b i)
      | _, _ => cell
  | none => bgStep5 cell

private theorem bgStep5_invol (cell : Fin 24 → Sym5) : bgStep5 (bgStep5 cell) = cell := by
  funext s
  have hOpp := (thm_24_facets_geometry.2.1 s).1
  unfold bgStep5
  by_cases hc : isCat5 (cell s) || isCat5 (cell (oppSlot s))
  · have hc' : isCat5 (cell (oppSlot s)) || isCat5 (cell (oppSlot (oppSlot s))) = true := by
      rw [hOpp]; exact Bool.or_comm _ _ ▸ hc
    simp [hc, hc']
  · have hcf : (isCat5 (cell s) || isCat5 (cell (oppSlot s))) = false := Bool.eq_false_iff.mpr hc
    have hcf' : (isCat5 (cell (oppSlot s)) || isCat5 (cell (oppSlot (oppSlot s)))) = false := by
      rw [hOpp, Bool.or_comm]; exact hcf
    simp [hcf, hcf', hOpp]

private theorem bgStep5_preserves_cat (cell : Fin 24 → Sym5) (s : Fin 24) :
    isCat5 (bgStep5 cell s) = isCat5 (cell s) ∧
    (bgStep5 cell s == .ancA) = (cell s == .ancA) ∧
    (bgStep5 cell s == .ancB) = (cell s == .ancB) ∧
    (bgStep5 cell s == .rotR) = (cell s == .rotR) := by
  unfold bgStep5
  by_cases hc : isCat5 (cell s) || isCat5 (cell (oppSlot s))
  · simp [hc]
  · have hcf : (isCat5 (cell s) || isCat5 (cell (oppSlot s))) = false := Bool.eq_false_iff.mpr hc
    simp only [hcf, Bool.false_eq_true, ↓reduceIte]
    have h1 : isCat5 (cell s) = false := by
      cases hs : isCat5 (cell s) <;> simp_all
    have h2 : isCat5 (cell (oppSlot s)) = false := by
      cases ho : isCat5 (cell (oppSlot s)) <;> simp_all
    cases cs : cell s <;> cases co : cell (oppSlot s) <;> simp_all [isCat5]

private theorem bgStep5_preserves_gateMode5 (cell : Fin 24 → Sym5) :
    gateMode5 (bgStep5 cell) = gateMode5 cell := by
  unfold gateMode5
  have hA : uniquePred24 (fun i => bgStep5 cell i == .ancA) = uniquePred24 (fun i => cell i == .ancA) :=
    uniquePred24_congr _ _ fun i => (bgStep5_preserves_cat cell i).2.1
  have hB : uniquePred24 (fun i => bgStep5 cell i == .ancB) = uniquePred24 (fun i => cell i == .ancB) :=
    uniquePred24_congr _ _ fun i => (bgStep5_preserves_cat cell i).2.2.1
  rw [hA, hB]
  cases uniquePred24 (fun i => cell i == .ancA) with
  | none => rfl
  | some a =>
    cases uniquePred24 (fun i => cell i == .ancB) with
    | none => rfl
    | some b =>
      have hQ : allPred24 (fun i => !isInQ a b i || !isCat5 (bgStep5 cell i)) =
          allPred24 (fun i => !isInQ a b i || !isCat5 (cell i)) :=
        allPred24_congr _ _ fun i => by rw [(bgStep5_preserves_cat cell i).1]
      have hR : countPred24 (fun i => isInP a b i && (bgStep5 cell i == .rotR)) =
          countPred24 (fun i => isInP a b i && (cell i == .rotR)) :=
        countPred24_congr _ _ fun i => by rw [(bgStep5_preserves_cat cell i).2.2.2]
      have hP : allPred24 (fun i => !isInP a b i || (bgStep5 cell i == .empty || bgStep5 cell i == .rotR)) =
          allPred24 (fun i => !isInP a b i || (cell i == .empty || cell i == .rotR)) := by
        have hImp : ∀ f : Fin 24 → Sym5,
            allPred24 (fun i => !isInP a b i || (f i == .empty || f i == .rotR)) = true →
            allPred24 (fun i => !isInP a b i || (bgStep5 f i == .empty || bgStep5 f i == .rotR)) = true := by
          intro f hf
          rw [allPred24_eq_true_iff] at hf ⊢
          intro i
          by_cases hip : isInP a b i = true
          · have h1 := hf i; simp [hip] at h1
            have hip' : isInP a b (oppSlot i) = true := by rw [isInP_opp]; exact hip
            have h2 := hf (oppSlot i); simp [hip'] at h2
            unfold bgStep5
            split_ifs <;> simp [hip, h1, h2]
          · have hipf : isInP a b i = false := Bool.eq_false_iff.mpr hip
            simp [hipf]
        cases h1 : allPred24 (fun i => !isInP a b i || (cell i == .empty || cell i == .rotR)) with
        | true => exact hImp cell h1
        | false =>
          cases h2 : allPred24 (fun i => !isInP a b i || (bgStep5 cell i == .empty || bgStep5 cell i == .rotR)) with
          | false => rfl
          | true =>
            have h3 := hImp (bgStep5 cell) h2
            rw [bgStep5_invol] at h3
            rw [h3] at h1; exact Bool.noConfusion h1
      rw [hQ, hP, hR]

private theorem bgStep5_equivariant (g : WF4Elem) (cell : Fin 24 → Sym5) :
    actSym5 g (bgStep5 cell) = bgStep5 (actSym5 g cell) := by
  funext i
  unfold actSym5 bgStep5
  rw [cu_wf4PermInv_opp]

private theorem bgStep5_countSym5 (s : Sym5) (cell : Fin 24 → Sym5) :
    countSym5 s (bgStep5 cell) = countSym5 s cell := by
  let π : Fin 24 → Fin 24 := fun i =>
    if isCat5 (cell i) || isCat5 (cell (oppSlot i)) then i else oppSlot i
  have hInvol : ∀ i : Fin 24, π (π i) = i := by
    intro i
    have hOpp := (thm_24_facets_geometry.2.1 i).1
    dsimp only [π]
    by_cases hc : isCat5 (cell i) || isCat5 (cell (oppSlot i))
    · simp [hc]
    · have hcf : (isCat5 (cell i) || isCat5 (cell (oppSlot i))) = false := Bool.eq_false_iff.mpr hc
      have hcf' : (isCat5 (cell (oppSlot i)) || isCat5 (cell (oppSlot (oppSlot i)))) = false := by
        rw [hOpp, Bool.or_comm]; exact hcf
      simp [hcf, hcf', hOpp]
  let e : Fin 24 ≃ Fin 24 := ⟨π, π, hInvol, hInvol⟩
  have hEq : bgStep5 cell = fun i => cell (e i) := by
    funext i; unfold bgStep5; dsimp only [e, π]; split_ifs <;> rfl
  unfold countSym5; rw [hEq]
  exact countPred24_comp_equiv e (fun i => cell i == s)

/-- Helper: any slot bijection `e` fixing `Q(a,b)` as a set, `P(a,b)` as a set, and every slot outside `Q ∪ P`
    preserves `gateMode5 cell = some (a, b, r)`. -/
private theorem gateMode5_preserved_by_QP_equiv (cell : Fin 24 → Sym5) (a b : Fin 24) (r : Nat)
    (hMode : gateMode5 cell = some (a, b, r))
    (e : Fin 24 ≃ Fin 24)
    (heQ : ∀ i : Fin 24, isInQ a b (e i) = isInQ a b i)
    (heP : ∀ i : Fin 24, isInP a b (e i) = isInP a b i)
    (heOut : ∀ i : Fin 24, isInQ a b i = false → isInP a b i = false → e i = i) :
    gateMode5 (fun i => cell (e i)) = some (a, b, r) := by
  have hMode' := hMode
  unfold gateMode5 at hMode'
  cases hA : uniquePred24 (fun i => cell i == .ancA) with
  | none => rw [hA] at hMode'; exact Option.noConfusion hMode'
  | some a0 =>
    cases hB : uniquePred24 (fun i => cell i == .ancB) with
    | none => rw [hA, hB] at hMode'; exact Option.noConfusion hMode'
    | some b0 =>
      rw [hA, hB] at hMode'
      split_ifs at hMode' with hCond hR
      simp only [Option.some.injEq, Prod.mk.injEq] at hMode'
      rcases hMode' with ⟨rfl, rfl, rfl⟩
      simp only [Bool.and_eq_true] at hCond
      rcases hCond with ⟨⟨hOrth, hQNoCat⟩, hPOnly⟩
      have hDisj := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hOrth).2.2
      have haOutQ : isInQ a b a = false := by
        cases h : isInQ a b a with | false => rfl | true => exact absurd ⟨Or.inl rfl, h⟩ (hDisj a).1
      have haOutP : isInP a b a = false := by
        cases h : isInP a b a with | false => rfl | true => exact absurd ⟨Or.inl rfl, h⟩ (hDisj a).2.1
      have hbOutQ : isInQ a b b = false := by
        cases h : isInQ a b b with | false => rfl | true => exact absurd ⟨Or.inr rfl, h⟩ (hDisj b).1
      have hbOutP : isInP a b b = false := by
        cases h : isInP a b b with | false => rfl | true => exact absurd ⟨Or.inr rfl, h⟩ (hDisj b).2.1
      have hea : e a = a := heOut a haOutQ haOutP
      have heb : e b = b := heOut b hbOutQ hbOutP
      have heaS : e.symm a = a := by simpa [hea] using e.symm_apply_apply a
      have hebS : e.symm b = b := by simpa [heb] using e.symm_apply_apply b
      have hA' : uniquePred24 (fun i => cell (e i) == .ancA) = some a := by
        have h := uniquePred24_comp_equiv e.symm (fun i => cell i == .ancA)
        simpa [hA, heaS] using h
      have hB' : uniquePred24 (fun i => cell (e i) == .ancB) = some b := by
        have h := uniquePred24_comp_equiv e.symm (fun i => cell i == .ancB)
        simpa [hB, hebS] using h
      have hQ' : allPred24 (fun i => !isInQ a b i || !isCat5 (cell (e i))) = true := by
        rw [allPred24_congr _ (fun i => !isInQ a b (e i) || !isCat5 (cell (e i))) (fun i => by rw [heQ]),
            allPred24_comp_equiv e]
        exact hQNoCat
      have hP' : allPred24 (fun i => !isInP a b i || (cell (e i) == .empty || cell (e i) == .rotR)) = true := by
        rw [allPred24_congr _ (fun i => !isInP a b (e i) || (cell (e i) == .empty || cell (e i) == .rotR)) (fun i => by rw [heP]),
            allPred24_comp_equiv e]
        exact hPOnly
      have hR' : countPred24 (fun i => isInP a b i && (cell (e i) == .rotR)) =
          countPred24 (fun i => isInP a b i && (cell i == .rotR)) := by
        rw [countPred24_congr _ (fun i => isInP a b (e i) && (cell (e i) == .rotR)) (fun i => by rw [heP])]
        exact countPred24_comp_equiv e _
      unfold gateMode5
      rw [hA', hB', hR']
      simp [hOrth, hQ', hP', hR]

private theorem gateMode5_equivariant (g : WF4Elem) (cell : Fin 24 → Sym5) :
    gateMode5 (actSym5 g cell) = (gateMode5 cell).map (fun t => (wf4Perm g t.1, wf4Perm g t.2.1, t.2.2)) := by
  unfold gateMode5 actSym5
  have hA := uniquePred24_comp_equiv (wf4Equiv g) (fun i => cell i == .ancA)
  have hB := uniquePred24_comp_equiv (wf4Equiv g) (fun i => cell i == .ancB)
  change (match uniquePred24 (fun i => cell ((wf4Equiv g).symm i) == .ancA),
                uniquePred24 (fun i => cell ((wf4Equiv g).symm i) == .ancB) with
          | some a, some b => _ | _, _ => none) = _
  rw [hA, hB]
  cases uniquePred24 (fun i => cell i == .ancA) with
  | none => rfl
  | some a =>
    cases uniquePred24 (fun i => cell i == .ancB) with
    | none => rfl
    | some b =>
      simp only [Option.map_some]
      have hOrth : isOrthPair (wf4Perm g a) (wf4Perm g b) = isOrthPair a b := isOrthPair_wf4 g a b
      have hQ : allPred24 (fun i => !isInQ (wf4Perm g a) (wf4Perm g b) i || !isCat5 (cell ((wf4Equiv g).symm i))) =
          allPred24 (fun i => !isInQ a b i || !isCat5 (cell i)) := by
        rw [allPred24_congr _ (fun i => !isInQ a b ((wf4Equiv g).symm i) || !isCat5 (cell ((wf4Equiv g).symm i))) (fun i => by
          have := isInQ_wf4 g a b ((wf4Equiv g).symm i)
          simpa using congrArg (fun x => !x || !isCat5 (cell ((wf4Equiv g).symm i))) this)]
        exact allPred24_comp_equiv (wf4Equiv g).symm _
      have hP : allPred24 (fun i => !isInP (wf4Perm g a) (wf4Perm g b) i ||
            (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .rotR)) =
          allPred24 (fun i => !isInP a b i || (cell i == .empty || cell i == .rotR)) := by
        rw [allPred24_congr _ (fun i => !isInP a b ((wf4Equiv g).symm i) ||
            (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .rotR)) (fun i => by
          have := isInP_wf4 g a b ((wf4Equiv g).symm i)
          simpa using congrArg (fun x => !x || (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .rotR)) this)]
        exact allPred24_comp_equiv (wf4Equiv g).symm _
      have hR : countPred24 (fun i => isInP (wf4Perm g a) (wf4Perm g b) i && (cell ((wf4Equiv g).symm i) == .rotR)) =
          countPred24 (fun i => isInP a b i && (cell i == .rotR)) := by
        rw [countPred24_congr _ (fun i => isInP a b ((wf4Equiv g).symm i) && (cell ((wf4Equiv g).symm i) == .rotR)) (fun i => by
          have := isInP_wf4 g a b ((wf4Equiv g).symm i)
          simpa using congrArg (fun x => x && (cell ((wf4Equiv g).symm i) == .rotR)) this)]
        exact countPred24_comp_equiv (wf4Equiv g).symm _
      change (if isOrthPair (wf4Perm g a) (wf4Perm g b) &&
          allPred24 (fun i => !isInQ (wf4Perm g a) (wf4Perm g b) i || !isCat5 (cell ((wf4Equiv g).symm i))) &&
          allPred24 (fun i => !isInP (wf4Perm g a) (wf4Perm g b) i ||
            (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .rotR)) then
        let r := countPred24 (fun i => isInP (wf4Perm g a) (wf4Perm g b) i && (cell ((wf4Equiv g).symm i) == .rotR))
        if r = 0 || r = 1 || r = 4 then some (wf4Perm g a, wf4Perm g b, r) else none else none) = _
      rw [hOrth, hQ, hP, hR]
      split_ifs <;> simp

private theorem rotQEquiv_invariants (a b : Fin 24) :
    (∀ i, isInQ a b (rotQEquiv a b i) = isInQ a b i) ∧
    (∀ i, isInQ a b ((rotQEquiv a b).symm i) = isInQ a b i) ∧
    (∀ i, isInP a b (rotQEquiv a b i) = isInP a b i) ∧
    (∀ i, isInP a b ((rotQEquiv a b).symm i) = isInP a b i) ∧
    (∀ i, isInQ a b i = false → isInP a b i = false → rotQEquiv a b i = i) ∧
    (∀ i, isInQ a b i = false → isInP a b i = false → (rotQEquiv a b).symm i = i) := by
  have hQ : ∀ i, isInQ a b (rotQ a b i) = isInQ a b i := isInQ_rotQ a b
  have hQInv : ∀ i, isInQ a b (rotQInv a b i) = isInQ a b i := isInQ_rotQInv a b
  have hP : ∀ i, isInP a b (rotQ a b i) = isInP a b i := fun i => by
    by_cases hq : isInQ a b i = true
    · by_cases hab : isOrthPair a b = true
      · have hD := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hab).2.2
        have h1 : isInP a b i = false := by cases h : isInP a b i <;> [rfl; exact absurd ⟨hq, h⟩ (hD i).2.2]
        have h2 : isInP a b (rotQ a b i) = false := by
          cases h : isInP a b (rotQ a b i) with
          | false => rfl
          | true => exact absurd ⟨(hQ i).trans hq, h⟩ (hD _).2.2
        rw [h1, h2]
      · have hf : isOrthPair a b = false := Bool.eq_false_iff.mpr hab
        simp [rotQ, hf]
    · rw [rotQ_outside a b i (Bool.eq_false_iff.mpr hq)]
  have hPInv : ∀ i, isInP a b (rotQInv a b i) = isInP a b i := fun i => by
    unfold rotQInv; rw [hP, hP, hP]
  refine ⟨hQ, hQInv, hP, hPInv,
    fun i hqf _ => rotQ_outside a b i hqf,
    fun i hqf _ => by unfold rotQEquiv rotQInv; dsimp only; rw [rotQ_outside a b i hqf, rotQ_outside a b i hqf, rotQ_outside a b i hqf]⟩

private theorem rotQ2Equiv_invariants (a b : Fin 24) :
    (∀ i, isInQ a b (rotQ2Equiv a b i) = isInQ a b i) ∧
    (∀ i, isInP a b (rotQ2Equiv a b i) = isInP a b i) ∧
    (∀ i, isInQ a b i = false → isInP a b i = false → rotQ2Equiv a b i = i) := by
  obtain ⟨hQ, _, hP, _, hOut, _⟩ := rotQEquiv_invariants a b
  refine ⟨fun i => by change isInQ a b (rotQ a b (rotQ a b i)) = _; rw [hQ, hQ],
    fun i => by change isInP a b (rotQ a b (rotQ a b i)) = _; rw [hP, hP],
    fun i hqf hpf => by change rotQ a b (rotQ a b i) = i; rw [hOut i hqf hpf, hOut i hqf hpf]⟩

private theorem rotQPEquiv_invariants (a b : Fin 24) :
    (∀ i, isInQ a b (rotQPEquiv a b i) = isInQ a b i) ∧
    (∀ i, isInQ a b ((rotQPEquiv a b).symm i) = isInQ a b i) ∧
    (∀ i, isInP a b (rotQPEquiv a b i) = isInP a b i) ∧
    (∀ i, isInP a b ((rotQPEquiv a b).symm i) = isInP a b i) ∧
    (∀ i, isInQ a b i = false → isInP a b i = false → rotQPEquiv a b i = i) ∧
    (∀ i, isInQ a b i = false → isInP a b i = false → (rotQPEquiv a b).symm i = i) := by
  obtain ⟨hQ, hQInv, hP, hPInv, hQOut, hQInvOut⟩ := rotQEquiv_invariants a b
  have hP_Q : ∀ i, isInQ a b (rotP a b i) = isInQ a b i := fun i => by
    by_cases hp : isInP a b i = true
    · by_cases hab : isOrthPair a b = true
      · have hD := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hab).2.2
        have h1 : isInQ a b i = false := by cases h : isInQ a b i <;> [rfl; exact absurd ⟨h, hp⟩ (hD i).2.2]
        have h2 : isInQ a b (rotP a b i) = false := by
          cases h : isInQ a b (rotP a b i) with
          | false => rfl
          | true => exact absurd ⟨h, (isInP_rotP a b i).trans hp⟩ (hD _).2.2
        rw [h1, h2]
      · have hf : isOrthPair a b = false := Bool.eq_false_iff.mpr hab
        simp [rotP, hf]
    · rw [rotP_outside a b i (Bool.eq_false_iff.mpr hp)]
  have hPInv_Q : ∀ i, isInQ a b (rotPInv a b i) = isInQ a b i := fun i => by
    unfold rotPInv; rw [hP_Q, hP_Q, hP_Q]
  refine ⟨fun i => by change isInQ a b (rotQ a b (rotP a b i)) = _; rw [hQ, hP_Q],
    fun i => by change isInQ a b (rotPInv a b (rotQInv a b i)) = _; rw [hPInv_Q, hQInv],
    fun i => by change isInP a b (rotQ a b (rotP a b i)) = _; rw [hP, isInP_rotP],
    fun i => by change isInP a b (rotPInv a b (rotQInv a b i)) = _; rw [isInP_rotPInv, hPInv],
    fun i hqf hpf => by change rotQ a b (rotP a b i) = i; rw [rotP_outside a b i hpf, hQOut i hqf hpf],
    fun i hqf hpf => by
      change rotPInv a b (rotQInv a b i) = i
      rw [hQInvOut i hqf hpf]; unfold rotPInv
      rw [rotP_outside a b i hpf, rotP_outside a b i hpf, rotP_outside a b i hpf]⟩

private theorem univ5_step_inv (fwd : Bool) (cell : Fin 24 → Sym5) :
    (if fwd then localUniv5Inv (localUniv5 cell) else localUniv5 (localUniv5Inv cell)) = cell := by
  cases hMode : gateMode5 cell with
  | none =>
    cases fwd <;> simp only [localUniv5, localUniv5Inv, hMode, bgStep5_preserves_gateMode5, bgStep5_invol]
  | some abr =>
    rcases abr with ⟨a, b, r⟩
    by_cases hr0 : r = 0
    · subst hr0
      obtain ⟨hQ, hP, hOut⟩ := rotQ2Equiv_invariants a b
      have hM' := gateMode5_preserved_by_QP_equiv cell a b 0 hMode (rotQ2Equiv a b) hQ hP hOut
      cases fwd <;> simp only [localUniv5, localUniv5Inv, hMode, hM', ↓reduceIte] <;>
        (funext i; exact congrArg cell (rotQ2_invol a b i))
    · by_cases hr4 : r = 4
      · subst hr4
        obtain ⟨hQ, hQInv, hP, hPInv, hOut, hOutInv⟩ := rotQEquiv_invariants a b
        have hM1 := gateMode5_preserved_by_QP_equiv cell a b 4 hMode (rotQEquiv a b).symm hQInv hPInv hOutInv
        have hM2 := gateMode5_preserved_by_QP_equiv cell a b 4 hMode (rotQEquiv a b) hQ hP hOut
        cases fwd
        · simp only [localUniv5, localUniv5Inv, hMode, hM2, hr0, ↓reduceIte]
          funext i; exact congrArg cell ((rotQEquiv a b).apply_symm_apply i)
        · simp only [localUniv5, localUniv5Inv, hMode, hM1, hr0, ↓reduceIte]
          funext i; exact congrArg cell ((rotQEquiv a b).symm_apply_apply i)
      · cases hpBar : uniquePred24 (fun i => isInP a b i && (cell i == .rotR)) with
        | none =>
          cases fwd <;> simp only [localUniv5, localUniv5Inv, hMode, hr0, hr4, hpBar, ↓reduceIte]
        | some pBar =>
          cases hqIn : uniquePred24 (fun i => isInQ a b i && (cell i == .pulse)) with
          | none =>
            cases fwd <;> simp only [localUniv5, localUniv5Inv, hMode, hr0, hr4, hpBar, hqIn, ↓reduceIte]
          | some qIn =>
            by_cases hPerp : isPerpQ a b pBar qIn = true
            · obtain ⟨hQ, hQInv, hP, hPInv, hOut, hOutInv⟩ := rotQPEquiv_invariants a b
              have hM1 := gateMode5_preserved_by_QP_equiv cell a b r hMode (rotQPEquiv a b).symm hQInv hPInv hOutInv
              have hM2 := gateMode5_preserved_by_QP_equiv cell a b r hMode (rotQPEquiv a b) hQ hP hOut
              have hP1 : uniquePred24 (fun i => isInP a b i && (cell ((rotQPEquiv a b).symm i) == .rotR)) =
                  some (rotQPEquiv a b pBar) := by
                rw [uniquePred24_congr _ (fun i => isInP a b ((rotQPEquiv a b).symm i) &&
                    (cell ((rotQPEquiv a b).symm i) == .rotR)) (fun i => by rw [hPInv]),
                    uniquePred24_comp_equiv (rotQPEquiv a b), hpBar]; rfl
              have hQ1 : uniquePred24 (fun i => isInQ a b i && (cell ((rotQPEquiv a b).symm i) == .pulse)) =
                  some (rotQPEquiv a b qIn) := by
                rw [uniquePred24_congr _ (fun i => isInQ a b ((rotQPEquiv a b).symm i) &&
                    (cell ((rotQPEquiv a b).symm i) == .pulse)) (fun i => by rw [hQInv]),
                    uniquePred24_comp_equiv (rotQPEquiv a b), hqIn]; rfl
              have hP2 : uniquePred24 (fun i => isInP a b i && (cell (rotQPEquiv a b i) == .rotR)) =
                  some ((rotQPEquiv a b).symm pBar) := by
                rw [uniquePred24_congr _ (fun i => isInP a b (rotQPEquiv a b i) &&
                    (cell (rotQPEquiv a b i) == .rotR)) (fun i => by rw [hP]),
                    uniquePred24_comp_equiv (rotQPEquiv a b).symm, hpBar]; rfl
              have hQ2 : uniquePred24 (fun i => isInQ a b i && (cell (rotQPEquiv a b i) == .pulse)) =
                  some ((rotQPEquiv a b).symm qIn) := by
                rw [uniquePred24_congr _ (fun i => isInQ a b (rotQPEquiv a b i) &&
                    (cell (rotQPEquiv a b i) == .pulse)) (fun i => by rw [hQ]),
                    uniquePred24_comp_equiv (rotQPEquiv a b).symm, hqIn]; rfl
              have hpInP : isInP a b pBar = true := by
                have := ((uniquePred24_eq_some_iff _ pBar).mp hpBar).1
                exact (Bool.and_eq_true _ _).mp this |>.1
              have hqInQ : isInQ a b qIn = true := by
                have := ((uniquePred24_eq_some_iff _ qIn).mp hqIn).1
                exact (Bool.and_eq_true _ _).mp this |>.1
              have hab : isOrthPair a b = true := by
                unfold isPerpQ at hPerp; simp only [Bool.and_eq_true] at hPerp; exact hPerp.1.1.1
              have hDisj := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hab).2.2
              have hQP_p : rotQPEquiv a b pBar = rotP a b pBar := by
                change rotQ a b (rotP a b pBar) = rotP a b pBar
                have hp' : isInP a b (rotP a b pBar) = true := by rw [isInP_rotP]; exact hpInP
                have hqf : isInQ a b (rotP a b pBar) = false := by
                  cases h : isInQ a b (rotP a b pBar) <;> [rfl; exact absurd ⟨h, hp'⟩ (hDisj _).2.2]
                exact rotQ_outside a b _ hqf
              have hQP_q : rotQPEquiv a b qIn = rotQ a b qIn := by
                change rotQ a b (rotP a b qIn) = rotQ a b qIn
                have hpf : isInP a b qIn = false := by
                  cases h : isInP a b qIn <;> [rfl; exact absurd ⟨hqInQ, h⟩ (hDisj qIn).2.2]
                rw [rotP_outside a b qIn hpf]
              have hPerp1 : isPerpQ a b (rotQPEquiv a b pBar) (rotQPEquiv a b qIn) = true := by
                rw [hQP_p, hQP_q, isPerpQ_rot_preserved]; exact hPerp
              have hQPs_p : (rotQPEquiv a b).symm pBar = rotPInv a b pBar := by
                change rotPInv a b (rotQInv a b pBar) = rotPInv a b pBar
                have hqf : isInQ a b pBar = false := by
                  cases h : isInQ a b pBar <;> [rfl; exact absurd ⟨h, hpInP⟩ (hDisj pBar).2.2]
                have hQI : rotQInv a b pBar = pBar := by
                  unfold rotQInv; rw [rotQ_outside a b pBar hqf, rotQ_outside a b pBar hqf, rotQ_outside a b pBar hqf]
                rw [hQI]
              have hQPs_q : (rotQPEquiv a b).symm qIn = rotQInv a b qIn := by
                rw [rotQP_symm_eq, rotQP_comm]
                have hpf : isInP a b qIn = false := by
                  cases h : isInP a b qIn <;> [rfl; exact absurd ⟨hqInQ, h⟩ (hDisj qIn).2.2]
                have hPI : rotPInv a b qIn = qIn := by
                  unfold rotPInv; rw [rotP_outside a b qIn hpf, rotP_outside a b qIn hpf, rotP_outside a b qIn hpf]
                rw [hPI]
              have hPerp2 : isPerpQ a b ((rotQPEquiv a b).symm pBar) ((rotQPEquiv a b).symm qIn) = true := by
                rw [hQPs_p, hQPs_q, ← isPerpQ_rot_preserved a b (rotPInv a b pBar) (rotQInv a b qIn),
                    rotP_inv_right, rotQ_inv_right]
                exact hPerp
              cases fwd
              · simp only [localUniv5, localUniv5Inv, hMode, hM2, hr0, hr4, hpBar, hqIn, hPerp, hP2, hQ2, hPerp2, ↓reduceIte]
                funext i; exact congrArg cell ((rotQPEquiv a b).apply_symm_apply i)
              · simp only [localUniv5, localUniv5Inv, hMode, hM1, hr0, hr4, hpBar, hqIn, hPerp, hP1, hQ1, hPerp1, ↓reduceIte]
                funext i; exact congrArg cell ((rotQPEquiv a b).symm_apply_apply i)
            · have hPerpF : isPerpQ a b pBar qIn = false := Bool.eq_false_iff.mpr hPerp
              obtain ⟨hQ, hP, hOut⟩ := rotQ2Equiv_invariants a b
              have hM' := gateMode5_preserved_by_QP_equiv cell a b r hMode (rotQ2Equiv a b) hQ hP hOut
              have hP' : uniquePred24 (fun i => isInP a b i && (cell (rotQ2Equiv a b i) == .rotR)) =
                  some ((rotQ2Equiv a b).symm pBar) := by
                rw [uniquePred24_congr _ (fun i => isInP a b (rotQ2Equiv a b i) &&
                    (cell (rotQ2Equiv a b i) == .rotR)) (fun i => by rw [hP]),
                    uniquePred24_comp_equiv (rotQ2Equiv a b).symm, hpBar]; rfl
              have hQ' : uniquePred24 (fun i => isInQ a b i && (cell (rotQ2Equiv a b i) == .pulse)) =
                  some ((rotQ2Equiv a b).symm qIn) := by
                rw [uniquePred24_congr _ (fun i => isInQ a b (rotQ2Equiv a b i) &&
                    (cell (rotQ2Equiv a b i) == .pulse)) (fun i => by rw [hQ]),
                    uniquePred24_comp_equiv (rotQ2Equiv a b).symm, hqIn]; rfl
              have hpInP : isInP a b pBar = true := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ pBar).mp hpBar).1).1
              have hPFix : (rotQ2Equiv a b).symm pBar = pBar := by
                change rotQ a b (rotQ a b pBar) = pBar
                by_cases hab : isOrthPair a b = true
                · have hD := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hab).2.2
                  have hqf : isInQ a b pBar = false := by
                    cases h : isInQ a b pBar <;> [rfl; exact absurd ⟨h, hpInP⟩ (hD pBar).2.2]
                  rw [rotQ_outside a b pBar hqf, rotQ_outside a b pBar hqf]
                · simp [rotQ, Bool.eq_false_iff.mpr hab]
              have hPerp' : isPerpQ a b ((rotQ2Equiv a b).symm pBar) ((rotQ2Equiv a b).symm qIn) = false := by
                rw [hPFix]; change isPerpQ a b pBar (rotQ a b (rotQ a b qIn)) = false
                rw [isPerpQ_rotQ2_preserved]; exact hPerpF
              cases fwd <;>
                simp only [localUniv5, localUniv5Inv, hMode, hM', hr0, hr4, hpBar, hqIn, hPerpF, hP', hQ', hPerp',
                  Bool.false_eq_true, ↓reduceIte] <;>
                (funext i; exact congrArg cell (rotQ2_invol a b i))

/-- **Headline Theorem 4 (5-Symbol Homogeneous `W(F_4)^+`-Equivariant Universal CA):**
    Universally across ALL `cell : Fin 24 → Sym5`:
    1. Exact two-sided bijection `localUniv5Inv (localUniv5 cell) = cell` and
       `localUniv5 (localUniv5Inv cell) = cell`.
    2. Unconditional global `W(F_4)^+`-equivariance for all `576` proper rotations `g` (`wf4Det g = 1`).
    3. Exact per-species conservation `countSym5 s (localUniv5 cell) = countSym5 s cell`.
    4. Quiescent stationarity `localUniv5 (fun _ => .empty) = fun _ => .empty`. -/
theorem thm_univ5_bijective_equivariant_conservative :
    (∀ cell : Fin 24 → Sym5, localUniv5Inv (localUniv5 cell) = cell) ∧
    (∀ cell : Fin 24 → Sym5, localUniv5 (localUniv5Inv cell) = cell) ∧
    (∀ (g : WF4Elem), wf4Det g = 1 → ∀ cell : Fin 24 → Sym5,
      actSym5 g (localUniv5 cell) = localUniv5 (actSym5 g cell)) ∧
    (∀ (s : Sym5) (cell : Fin 24 → Sym5), countSym5 s (localUniv5 cell) = countSym5 s cell) ∧
    (localUniv5 (fun _ => .empty) = fun _ => .empty) := by
  refine ⟨fun cell => univ5_step_inv true cell, fun cell => univ5_step_inv false cell, ?_, ?_, ?_⟩
  · intro g hg cell
    have hM := gateMode5_equivariant g cell
    cases hMode : gateMode5 cell with
    | none =>
      rw [hMode] at hM
      simp only [localUniv5, hMode, hM, Option.map_none]
      exact bgStep5_equivariant g cell
    | some abr =>
      rcases abr with ⟨a, b, r⟩
      rw [hMode] at hM
      simp only [Option.map_some] at hM
      have hRotQ2Inv : ∀ i : Fin 24, wf4PermInv g (rotQ (wf4Perm g a) (wf4Perm g b) (rotQ (wf4Perm g a) (wf4Perm g b) i)) =
          rotQ a b (rotQ a b (wf4PermInv g i)) := fun i => by
        apply (wf4Equiv g).injective
        change wf4Perm g (wf4PermInv g _) = wf4Perm g (rotQ a b (rotQ a b (wf4PermInv g i)))
        rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2,
            rotQ_equivariant g hg, rotQ_equivariant g hg,
            ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 i).2]
      have hRotQInv : ∀ i : Fin 24, wf4PermInv g (rotQInv (wf4Perm g a) (wf4Perm g b) i) =
          rotQInv a b (wf4PermInv g i) := fun i => by
        apply (wf4Equiv g).injective
        change wf4Perm g (wf4PermInv g _) = wf4Perm g (rotQInv a b (wf4PermInv g i))
        rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2,
            rotQInv_equivariant g hg, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 i).2]
      have hRotPInv : ∀ i : Fin 24, wf4PermInv g (rotPInv (wf4Perm g a) (wf4Perm g b) i) =
          rotPInv a b (wf4PermInv g i) := fun i => by
        apply (wf4Equiv g).injective
        change wf4Perm g (wf4PermInv g _) = wf4Perm g (rotPInv a b (wf4PermInv g i))
        rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2,
            rotPInv_equivariant g hg, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 i).2]
      by_cases hr0 : r = 0
      · simp only [localUniv5, hMode, hM, hr0, ↓reduceIte]
        funext i; unfold actSym5 rotQ2Equiv; dsimp only; rw [hRotQ2Inv]
      · by_cases hr4 : r = 4
        · simp only [localUniv5, hMode, hM, hr0, hr4, ↓reduceIte]
          funext i; unfold actSym5 rotQEquiv; dsimp only; rw [hRotQInv]
        · have hP : uniquePred24 (fun i => isInP (wf4Perm g a) (wf4Perm g b) i && (actSym5 g cell i == .rotR)) =
              (uniquePred24 (fun i => isInP a b i && (cell i == .rotR))).map (wf4Perm g) := by
            rw [uniquePred24_congr _ (fun i => isInP a b ((wf4Equiv g).symm i) && (cell ((wf4Equiv g).symm i) == .rotR)) (fun i => by
              have := isInP_wf4 g a b ((wf4Equiv g).symm i)
              simpa [actSym5] using congrArg (fun x => x && (cell (wf4PermInv g i) == .rotR)) this)]
            exact uniquePred24_comp_equiv (wf4Equiv g) _
          have hQ : uniquePred24 (fun i => isInQ (wf4Perm g a) (wf4Perm g b) i && (actSym5 g cell i == .pulse)) =
              (uniquePred24 (fun i => isInQ a b i && (cell i == .pulse))).map (wf4Perm g) := by
            rw [uniquePred24_congr _ (fun i => isInQ a b ((wf4Equiv g).symm i) && (cell ((wf4Equiv g).symm i) == .pulse)) (fun i => by
              have := isInQ_wf4 g a b ((wf4Equiv g).symm i)
              simpa [actSym5] using congrArg (fun x => x && (cell (wf4PermInv g i) == .pulse)) this)]
            exact uniquePred24_comp_equiv (wf4Equiv g) _
          simp only [localUniv5, hMode, hM, hr0, hr4, hP, hQ, ↓reduceIte]
          cases uniquePred24 (fun i => isInP a b i && (cell i == .rotR)) with
          | none => rfl
          | some pBar =>
            cases uniquePred24 (fun i => isInQ a b i && (cell i == .pulse)) with
            | none => rfl
            | some qIn =>
              simp only [Option.map_some, isPerpQ_equivariant g hg]
              split_ifs
              · funext i; unfold actSym5; rw [rotQP_symm_eq, rotQP_symm_eq, hRotPInv, hRotQInv]
              · funext i; unfold actSym5 rotQ2Equiv; dsimp only; rw [hRotQ2Inv]
  · intro s cell
    cases hMode : gateMode5 cell with
    | none =>
      simp only [localUniv5, hMode]
      exact bgStep5_countSym5 s cell
    | some abr =>
      rcases abr with ⟨a, b, r⟩
      simp only [localUniv5, hMode]
      split_ifs
      · exact countPred24_comp_equiv (rotQ2Equiv a b).symm _
      · exact countPred24_comp_equiv (rotQEquiv a b).symm _
      · cases uniquePred24 (fun i => isInP a b i && (cell i == .rotR)) with
        | none => rfl
        | some pBar =>
          cases uniquePred24 (fun i => isInQ a b i && (cell i == .pulse)) with
          | none => rfl
          | some qIn =>
            split_ifs
            · exact countPred24_comp_equiv (rotQPEquiv a b).symm _
            · exact countPred24_comp_equiv (rotQ2Equiv a b).symm _
  · have hNone : gateMode5 (fun _ => .empty) = none := by decide
    funext s
    simp [localUniv5, hNone, bgStep5, isCat5]


/-! ## Section 6: Theorem 5 — 15-Symbol Strong Universality (`Sym15`), `S_exch` Ray Counter & `3-R` Launcher -/

/-- 15-symbol port alphabet unifying homogeneous `12`-symbol ray counters (`Sym12`) with the
    `3` chiral horosphere catalysts `{ancA, ancB, rotR}`. -/
inductive Sym15 where
  | empty
  | M | W0 | W1 | W2
  | F | G | H
  | Fr | Gr | Hr
  | P
  | ancA | ancB | rotR
  deriving DecidableEq, Repr

/-- Catalyst predicate on `Sym15`. -/
def isCat15 : Sym15 → Bool
  | .ancA | .ancB | .rotR => true
  | _ => false

/-- Occupied-port indicator (`0` for `.empty`, `1` for any active symbol). -/
def occ15 : Sym15 → Nat
  | .empty => 0
  | _ => 1

/-- Total occupied-port count across all `24` ports of a `Sym15` cell. -/
def countOcc15 (cell : Fin 24 → Sym15) : Nat :=
  ∑ i : Fin 24, occ15 (cell i)

/-- `W(F_4)` action on a `Sym15` cell configuration. -/
def actSym15 (g : WF4Elem) (cell : Fin 24 → Sym15) : Fin 24 → Sym15 :=
  fun i => cell (wf4PermInv g i)

/-- Paper 0020 Table-6 geodesic-frame `12`-symbol line bijection `L_line` extended as identity on catalysts. -/
def lineRev12Geo : Sym15 × Sym15 → Sym15 × Sym15
  -- 1-particle sector
  | (.M, .empty) => (.empty, .M)
  | (.empty, .M) => (.M, .empty)
  | (.W0, .empty) => (.empty, .W1)
  | (.empty, .W0) => (.W1, .empty)
  | (.W1, .empty) => (.empty, .W2)
  | (.empty, .W1) => (.W2, .empty)
  | (.W2, .empty) => (.W0, .empty)
  | (.empty, .W2) => (.empty, .W0)
  -- 2-particle involutions (INC, DEC, ZERO_TEST + reflections)
  | (.F, .M) => (.W0, .Fr)   | (.W0, .Fr) => (.F, .M)
  | (.M, .F) => (.Fr, .W0)   | (.Fr, .W0) => (.M, .F)
  | (.G, .W1) => (.M, .Gr)   | (.M, .Gr) => (.G, .W1)
  | (.W1, .G) => (.Gr, .M)   | (.Gr, .M) => (.W1, .G)
  | (.H, .M) => (.W1, .Hr)   | (.W1, .Hr) => (.H, .M)
  | (.M, .H) => (.Hr, .W1)   | (.Hr, .W1) => (.M, .H)
  | (.G, .W2) => (.M, .Fr)   | (.M, .Fr) => (.G, .W2)
  | (.W2, .G) => (.Fr, .M)   | (.Fr, .M) => (.W2, .G)
  | (.P, .M) => (.M, .P)     | (.M, .P) => (.P, .M)
  | p => p

/-- Exact inverse of `lineRev12Geo`. -/
def lineRev12GeoInv : Sym15 × Sym15 → Sym15 × Sym15
  | (.empty, .M) => (.M, .empty)
  | (.M, .empty) => (.empty, .M)
  | (.empty, .W1) => (.W0, .empty)
  | (.W1, .empty) => (.empty, .W0)
  | (.empty, .W2) => (.W1, .empty)
  | (.W2, .empty) => (.empty, .W1)
  | (.W0, .empty) => (.W2, .empty)
  | (.empty, .W0) => (.empty, .W2)
  | (.F, .M) => (.W0, .Fr)   | (.W0, .Fr) => (.F, .M)
  | (.M, .F) => (.Fr, .W0)   | (.Fr, .W0) => (.M, .F)
  | (.G, .W1) => (.M, .Gr)   | (.M, .Gr) => (.G, .W1)
  | (.W1, .G) => (.Gr, .M)   | (.Gr, .M) => (.W1, .G)
  | (.H, .M) => (.W1, .Hr)   | (.W1, .Hr) => (.H, .M)
  | (.M, .H) => (.Hr, .W1)   | (.Hr, .W1) => (.M, .H)
  | (.G, .W2) => (.M, .Fr)   | (.M, .Fr) => (.G, .W2)
  | (.W2, .G) => (.Fr, .M)   | (.Fr, .M) => (.W2, .G)
  | (.P, .M) => (.M, .P)     | (.M, .P) => (.P, .M)
  | p => p

/-- Exact `S_exch`-conjugated line bijection `lineRev12_exch = swap ∘ lineRev12Geo` on non-catalyst pairs,
    leaving catalyst-bearing lines untouched (period-2 bounce under `S_exch`). -/
def lineRev12_exch (p : Sym15 × Sym15) : Sym15 × Sym15 :=
  if isCat15 p.1 || isCat15 p.2 then p
  else
    let r := lineRev12Geo p
    (r.2, r.1)

/-- Exact inverse of `lineRev12_exch`. -/
def lineRev12_exchInv (p : Sym15 × Sym15) : Sym15 × Sym15 :=
  if isCat15 p.1 || isCat15 p.2 then p
  else lineRev12GeoInv (p.2, p.1)

private def allSym15 : List Sym15 :=
  [.empty, .M, .W0, .W1, .W2, .F, .G, .H, .Fr, .Gr, .Hr, .P, .ancA, .ancB, .rotR]

private theorem mem_allSym15 (s : Sym15) : s ∈ allSym15 := by
  cases s <;> decide

private theorem lineRev12_exch_all_laws :
    (∀ a b : Sym15, lineRev12_exchInv (lineRev12_exch (a, b)) = (a, b)) ∧
    (∀ a b : Sym15, lineRev12_exch (lineRev12_exchInv (a, b)) = (a, b)) ∧
    (∀ a b : Sym15, lineRev12_exch (b, a) = ((lineRev12_exch (a, b)).2, (lineRev12_exch (a, b)).1)) ∧
    (∀ a b : Sym15, lineRev12_exchInv (b, a) = ((lineRev12_exchInv (a, b)).2, (lineRev12_exchInv (a, b)).1)) ∧
    (∀ a b : Sym15, occ15 (lineRev12_exch (a, b)).1 + occ15 (lineRev12_exch (a, b)).2 = occ15 a + occ15 b) ∧
    (∀ a b : Sym15, isCat15 (lineRev12_exch (a, b)).1 = isCat15 a ∧
                    (lineRev12_exch (a, b)).1 = .ancA ↔ a = .ancA) ∧
    (∀ a b : Sym15, ((lineRev12_exch (a, b)).1 == .ancA) = (a == .ancA) ∧
                    ((lineRev12_exch (a, b)).1 == .ancB) = (a == .ancB) ∧
                    ((lineRev12_exch (a, b)).1 == .rotR) = (a == .rotR) ∧
                    isCat15 (lineRev12_exch (a, b)).1 = isCat15 a) ∧
    (∀ a b : Sym15, ((lineRev12_exchInv (a, b)).1 == .ancA) = (a == .ancA) ∧
                    ((lineRev12_exchInv (a, b)).1 == .ancB) = (a == .ancB) ∧
                    ((lineRev12_exchInv (a, b)).1 == .rotR) = (a == .rotR) ∧
                    isCat15 (lineRev12_exchInv (a, b)).1 = isCat15 a) ∧
    (∀ a b : Sym15,
      (((lineRev12_exch (a, b)).1 == .empty || (lineRev12_exch (a, b)).1 == .rotR) &&
       ((lineRev12_exch (a, b)).2 == .empty || (lineRev12_exch (a, b)).2 == .rotR)) =
      ((a == .empty || a == .rotR) && (b == .empty || b == .rotR))) ∧
    (∀ a b : Sym15,
      (((lineRev12_exchInv (a, b)).1 == .empty || (lineRev12_exchInv (a, b)).1 == .rotR) &&
       ((lineRev12_exchInv (a, b)).2 == .empty || (lineRev12_exchInv (a, b)).2 == .rotR)) =
      ((a == .empty || a == .rotR) && (b == .empty || b == .rotR))) := by
  have hL : ∀ p : Sym15 → Sym15 → Bool,
      (allSym15.all fun a => allSym15.all fun b => p a b) = true → ∀ a b : Sym15, p a b = true := by
    intro p h a b
    have h1 := List.all_eq_true.mp h a (mem_allSym15 a)
    exact List.all_eq_true.mp h1 b (mem_allSym15 b)
  refine ⟨fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b),
          fun a b => of_decide_eq_true (hL _ (by decide) a b)⟩

/-- Exact `11`-state (`3 + 3 + 3 + 2`) single-particle horosphere-to-bulk launcher bijection on
    `(q0, q1, q2, q3, pEmpty)`. -/
def launch5 : Sym15 × Sym15 × Sym15 × Sym15 × Sym15 → Sym15 × Sym15 × Sym15 × Sym15 × Sym15
  -- 3-cycle 0: (q0=P) -> (p=F) -> (p=Fr) -> (q0=P)
  | (.P, .empty, .empty, .empty, .empty) => (.empty, .empty, .empty, .empty, .F)
  | (.empty, .empty, .empty, .empty, .F) => (.empty, .empty, .empty, .empty, .Fr)
  | (.empty, .empty, .empty, .empty, .Fr) => (.P, .empty, .empty, .empty, .empty)
  -- 3-cycle 1: (q1=P) -> (p=G) -> (p=Gr) -> (q1=P)
  | (.empty, .P, .empty, .empty, .empty) => (.empty, .empty, .empty, .empty, .G)
  | (.empty, .empty, .empty, .empty, .G) => (.empty, .empty, .empty, .empty, .Gr)
  | (.empty, .empty, .empty, .empty, .Gr) => (.empty, .P, .empty, .empty, .empty)
  -- 3-cycle 2: (q2=P) -> (p=H) -> (p=Hr) -> (q2=P)
  | (.empty, .empty, .P, .empty, .empty) => (.empty, .empty, .empty, .empty, .H)
  | (.empty, .empty, .empty, .empty, .H) => (.empty, .empty, .empty, .empty, .Hr)
  | (.empty, .empty, .empty, .empty, .Hr) => (.empty, .empty, .P, .empty, .empty)
  -- 2-cycle 3: (q3=P) <-> (p=P)
  | (.empty, .empty, .empty, .P, .empty) => (.empty, .empty, .empty, .empty, .P)
  | (.empty, .empty, .empty, .empty, .P) => (.empty, .empty, .empty, .P, .empty)
  | t => t

/-- Exact inverse of `launch5`. -/
def launch5Inv : Sym15 × Sym15 × Sym15 × Sym15 × Sym15 → Sym15 × Sym15 × Sym15 × Sym15 × Sym15
  | (.empty, .empty, .empty, .empty, .F) => (.P, .empty, .empty, .empty, .empty)
  | (.empty, .empty, .empty, .empty, .Fr) => (.empty, .empty, .empty, .empty, .F)
  | (.P, .empty, .empty, .empty, .empty) => (.empty, .empty, .empty, .empty, .Fr)
  | (.empty, .empty, .empty, .empty, .G) => (.empty, .P, .empty, .empty, .empty)
  | (.empty, .empty, .empty, .empty, .Gr) => (.empty, .empty, .empty, .empty, .G)
  | (.empty, .P, .empty, .empty, .empty) => (.empty, .empty, .empty, .empty, .Gr)
  | (.empty, .empty, .empty, .empty, .H) => (.empty, .empty, .P, .empty, .empty)
  | (.empty, .empty, .empty, .empty, .Hr) => (.empty, .empty, .empty, .empty, .H)
  | (.empty, .empty, .P, .empty, .empty) => (.empty, .empty, .empty, .empty, .Hr)
  | (.empty, .empty, .empty, .empty, .P) => (.empty, .empty, .empty, .P, .empty)
  | (.empty, .empty, .empty, .P, .empty) => (.empty, .empty, .empty, .empty, .P)
  | t => t

private theorem launch5_laws (t : Sym15 × Sym15 × Sym15 × Sym15 × Sym15) :
    launch5Inv (launch5 t) = t ∧
    launch5 (launch5Inv t) = t ∧
    (let u := launch5 t
     occ15 u.1 + occ15 u.2.1 + occ15 u.2.2.1 + occ15 u.2.2.2.1 + occ15 u.2.2.2.2 =
       occ15 t.1 + occ15 t.2.1 + occ15 t.2.2.1 + occ15 t.2.2.2.1 + occ15 t.2.2.2.2) ∧
    (isCat15 t.1 = false → isCat15 t.2.1 = false → isCat15 t.2.2.1 = false →
      isCat15 t.2.2.2.1 = false → isCat15 t.2.2.2.2 = false →
      let u := launch5 t
      isCat15 u.1 = false ∧ isCat15 u.2.1 = false ∧ isCat15 u.2.2.1 = false ∧
      isCat15 u.2.2.2.1 = false ∧ isCat15 u.2.2.2.2 = false) ∧
    (isCat15 t.1 = false → isCat15 t.2.1 = false → isCat15 t.2.2.1 = false →
      isCat15 t.2.2.2.1 = false → isCat15 t.2.2.2.2 = false →
      let u := launch5Inv t
      isCat15 u.1 = false ∧ isCat15 u.2.1 = false ∧ isCat15 u.2.2.1 = false ∧
      isCat15 u.2.2.2.1 = false ∧ isCat15 u.2.2.2.2 = false) := by
  rcases t with ⟨a, b, c, d, e⟩
  unfold launch5 launch5Inv
  split <;>
    (try exact ⟨rfl, rfl, rfl, fun _ _ _ _ _ => ⟨rfl, rfl, rfl, rfl, rfl⟩,
                fun _ _ _ _ _ => ⟨rfl, rfl, rfl, rfl, rfl⟩⟩)
  -- Wildcard branch: prove `launch5Inv` also hits wildcard!
  rename_i h1 h2 h3 h4 h5 h6 h7 h8 h9 h10 h11
  have hInv : (match (a, b, c, d, e) with
    | (.empty, .empty, .empty, .empty, .F) => (.P, .empty, .empty, .empty, .empty)
    | (.empty, .empty, .empty, .empty, .Fr) => (.empty, .empty, .empty, .empty, .F)
    | (.P, .empty, .empty, .empty, .empty) => (.empty, .empty, .empty, .empty, .Fr)
    | (.empty, .empty, .empty, .empty, .G) => (.empty, .P, .empty, .empty, .empty)
    | (.empty, .empty, .empty, .empty, .Gr) => (.empty, .empty, .empty, .empty, .G)
    | (.empty, .P, .empty, .empty, .empty) => (.empty, .empty, .empty, .empty, .Gr)
    | (.empty, .empty, .empty, .empty, .H) => (.empty, .empty, .P, .empty, .empty)
    | (.empty, .empty, .empty, .empty, .Hr) => (.empty, .empty, .empty, .empty, .H)
    | (.empty, .empty, .P, .empty, .empty) => (.empty, .empty, .empty, .empty, .Hr)
    | (.empty, .empty, .empty, .empty, .P) => (.empty, .empty, .empty, .P, .empty)
    | (.empty, .empty, .empty, .P, .empty) => (.empty, .empty, .empty, .empty, .P)
    | t => t) = (a, b, c, d, e) := by
    split
    · exact absurd rfl h2
    · exact absurd rfl h3
    · exact absurd rfl h1
    · exact absurd rfl h5
    · exact absurd rfl h6
    · exact absurd rfl h4
    · exact absurd rfl h8
    · exact absurd rfl h9
    · exact absurd rfl h7
    · exact absurd rfl h11
    · exact absurd rfl h10
    · rfl
  have hFwd : (match (a, b, c, d, e) with
    | (.P, .empty, .empty, .empty, .empty) => (.empty, .empty, .empty, .empty, .F)
    | (.empty, .empty, .empty, .empty, .F) => (.empty, .empty, .empty, .empty, .Fr)
    | (.empty, .empty, .empty, .empty, .Fr) => (.P, .empty, .empty, .empty, .empty)
    | (.empty, .P, .empty, .empty, .empty) => (.empty, .empty, .empty, .empty, .G)
    | (.empty, .empty, .empty, .empty, .G) => (.empty, .empty, .empty, .empty, .Gr)
    | (.empty, .empty, .empty, .empty, .Gr) => (.empty, .P, .empty, .empty, .empty)
    | (.empty, .empty, .P, .empty, .empty) => (.empty, .empty, .empty, .empty, .H)
    | (.empty, .empty, .empty, .empty, .H) => (.empty, .empty, .empty, .empty, .Hr)
    | (.empty, .empty, .empty, .empty, .Hr) => (.empty, .empty, .P, .empty, .empty)
    | (.empty, .empty, .empty, .P, .empty) => (.empty, .empty, .empty, .empty, .P)
    | (.empty, .empty, .empty, .empty, .P) => (.empty, .empty, .empty, .P, .empty)
    | t => t) = (a, b, c, d, e) := by
    split
    · exact absurd rfl h1
    · exact absurd rfl h2
    · exact absurd rfl h3
    · exact absurd rfl h4
    · exact absurd rfl h5
    · exact absurd rfl h6
    · exact absurd rfl h7
    · exact absurd rfl h8
    · exact absurd rfl h9
    · exact absurd rfl h10
    · exact absurd rfl h11
    · rfl
  refine ⟨hInv, ?_, rfl, fun ha hb hc hd he => ⟨ha, hb, hc, hd, he⟩, ?_⟩
  · rw [hInv]; exact hFwd
  · rw [hInv]; exact fun ha hb hc hd he => ⟨ha, hb, hc, hd, he⟩

/-- Overwrite 5 ports `(q0, q1, q2, q3, p)` of a `Sym15` cell simultaneously. -/
def write5 (q0 q1 q2 q3 p : Fin 24) (vs : Sym15 × Sym15 × Sym15 × Sym15 × Sym15)
    (cell : Fin 24 → Sym15) : Fin 24 → Sym15 :=
  fun i =>
    if i = q0 then vs.1
    else if i = q1 then vs.2.1
    else if i = q2 then vs.2.2.1
    else if i = q3 then vs.2.2.2.1
    else if i = p then vs.2.2.2.2
    else cell i

/-- Active gate sector classification for `Sym15`: `r ∈ {0, 1, 3, 4}`. -/
def gateMode15 (cell : Fin 24 → Sym15) : Option (Fin 24 × Fin 24 × Nat) :=
  match uniquePred24 (fun i => cell i == .ancA), uniquePred24 (fun i => cell i == .ancB) with
  | some a, some b =>
    if isOrthPair a b && allPred24 (fun i => !isInQ a b i || !isCat15 (cell i)) then
      let r := countPred24 (fun i => isInP a b i && (cell i == .rotR))
      if r = 3 then some (a, b, 3)
      else if (r = 0 || r = 1 || r = 4) &&
              allPred24 (fun i => !isInP a b i || (cell i == .empty || cell i == .rotR)) then
        some (a, b, r)
      else none
    else none
  | _, _ => none

/-- Background (empty space / 1D geodesic ray counter) update on `Sym15`. -/
def bgStep15 (cell : Fin 24 → Sym15) : Fin 24 → Sym15 :=
  fun s => (lineRev12_exch (cell s, cell (oppSlot s))).1

/-- Exact inverse of `bgStep15`. -/
def bgStep15Inv (cell : Fin 24 → Sym15) : Fin 24 → Sym15 :=
  fun s => (lineRev12_exchInv (cell s, cell (oppSlot s))).1

/-- 15-symbol homogeneous `W(F_4)^+`-equivariant strong-universality local bijection `localStrong15`. -/
def localStrong15 (cell : Fin 24 → Sym15) : Fin 24 → Sym15 :=
  match gateMode15 cell with
  | some (a, b, r) =>
    if r = 0 then
      fun i => cell ((rotQ2Equiv a b).symm i)
    else if r = 4 then
      fun i => cell ((rotQEquiv a b).symm i)
    else if r = 3 then
      match uniquePred24 (fun i => isInP a b i && !(cell i == .rotR)) with
      | some pEmpty =>
        let q0 := qNorth a b pEmpty
        let q1 := rotQ a b q0
        let q2 := rotQ a b q1
        let q3 := rotQ a b q2
        write5 q0 q1 q2 q3 pEmpty (launch5 (cell q0, cell q1, cell q2, cell q3, cell pEmpty)) cell
      | none => cell
    else
      if allPred24 (fun i => !isInQ a b i || (cell i == .empty || cell i == .P)) then
        match uniquePred24 (fun i => isInP a b i && (cell i == .rotR)),
              uniquePred24 (fun i => isInQ a b i && (cell i == .P)) with
        | some pBar, some qIn =>
          if isPerpQ a b pBar qIn then
            fun i => cell ((rotQPEquiv a b).symm i)
          else
            fun i => cell ((rotQ2Equiv a b).symm i)
        | _, _ => cell
      else cell
  | none => bgStep15 cell

/-- Exact closed-form local inverse `localStrong15Inv` of `localStrong15`. -/
def localStrong15Inv (cell : Fin 24 → Sym15) : Fin 24 → Sym15 :=
  match gateMode15 cell with
  | some (a, b, r) =>
    if r = 0 then
      fun i => cell (rotQ2Equiv a b i)
    else if r = 4 then
      fun i => cell (rotQEquiv a b i)
    else if r = 3 then
      match uniquePred24 (fun i => isInP a b i && !(cell i == .rotR)) with
      | some pEmpty =>
        let q0 := qNorth a b pEmpty
        let q1 := rotQ a b q0
        let q2 := rotQ a b q1
        let q3 := rotQ a b q2
        write5 q0 q1 q2 q3 pEmpty (launch5Inv (cell q0, cell q1, cell q2, cell q3, cell pEmpty)) cell
      | none => cell
    else
      if allPred24 (fun i => !isInQ a b i || (cell i == .empty || cell i == .P)) then
        match uniquePred24 (fun i => isInP a b i && (cell i == .rotR)),
              uniquePred24 (fun i => isInQ a b i && (cell i == .P)) with
        | some pBar, some qIn =>
          if isPerpQ a b pBar qIn then
            fun i => cell (rotQPEquiv a b i)
          else
            fun i => cell (rotQ2Equiv a b i)
        | _, _ => cell
      else cell
  | none => bgStep15Inv cell

private theorem bgStep15_pair (cell : Fin 24 → Sym15) (s : Fin 24) :
    (bgStep15 cell s, bgStep15 cell (oppSlot s)) = lineRev12_exch (cell s, cell (oppSlot s)) := by
  have hOpp := (thm_24_facets_geometry.2.1 s).1
  unfold bgStep15
  rw [hOpp, lineRev12_exch_all_laws.2.2.1]

private theorem bgStep15Inv_pair (cell : Fin 24 → Sym15) (s : Fin 24) :
    (bgStep15Inv cell s, bgStep15Inv cell (oppSlot s)) = lineRev12_exchInv (cell s, cell (oppSlot s)) := by
  have hOpp := (thm_24_facets_geometry.2.1 s).1
  unfold bgStep15Inv
  rw [hOpp, lineRev12_exch_all_laws.2.2.2.1]

private theorem bgStep15_inv_left (cell : Fin 24 → Sym15) : bgStep15Inv (bgStep15 cell) = cell := by
  funext s; unfold bgStep15Inv
  rw [bgStep15_pair, lineRev12_exch_all_laws.1]

private theorem bgStep15_inv_right (cell : Fin 24 → Sym15) : bgStep15 (bgStep15Inv cell) = cell := by
  funext s; unfold bgStep15
  rw [bgStep15Inv_pair, lineRev12_exch_all_laws.2.1]

private theorem bgStep15_equivariant (g : WF4Elem) (cell : Fin 24 → Sym15) :
    actSym15 g (bgStep15 cell) = bgStep15 (actSym15 g cell) := by
  funext i; unfold actSym15 bgStep15; rw [cu_wf4PermInv_opp]

/-- Canonical 12 half-slots choosing one endpoint from each antipodal pair `(s, oppSlot s)`. -/
private def halfSlots12 : List (Fin 24) :=
  [⟨0, by decide⟩, ⟨1, by decide⟩, ⟨4, by decide⟩, ⟨5, by decide⟩,
   ⟨8, by decide⟩, ⟨9, by decide⟩, ⟨12, by decide⟩, ⟨13, by decide⟩,
   ⟨16, by decide⟩, ⟨17, by decide⟩, ⟨20, by decide⟩, ⟨21, by decide⟩]

private theorem sum24_eq_pairs (f : Fin 24 → Nat) :
    (∑ i : Fin 24, f i) = (halfSlots12.map (fun s => f s + f (oppSlot s))).sum := by
  have hL : (∑ i : Fin 24, f i) = ((List.finRange 24).map f).sum := by
    rw [Fin.sum_univ_def]; rfl
  rw [hL]
  -- Explicit 24-term permutation identity via `omega`
  dsimp [List.finRange, halfSlots12, oppSlot]
  omega

private theorem bgStep15_countOcc15 (cell : Fin 24 → Sym15) :
    countOcc15 (bgStep15 cell) = countOcc15 cell := by
  unfold countOcc15
  rw [sum24_eq_pairs, sum24_eq_pairs]
  congr 1
  refine List.map_congr_left fun s _ => ?_
  have hPair := bgStep15_pair cell s
  have h1 : bgStep15 cell s = (lineRev12_exch (cell s, cell (oppSlot s))).1 := congrArg Prod.fst hPair
  have h2 : bgStep15 cell (oppSlot s) = (lineRev12_exch (cell s, cell (oppSlot s))).2 := congrArg Prod.snd hPair
  rw [h1, h2, lineRev12_exch_all_laws.2.2.2.2.1]

private theorem bgStep15_preserves_gateMode15 (cell : Fin 24 → Sym15) :
    gateMode15 (bgStep15 cell) = gateMode15 cell ∧ gateMode15 (bgStep15Inv cell) = gateMode15 cell := by
  have hHelper : ∀ (f : (Fin 24 → Sym15) → (Fin 24 → Sym15)),
      (∀ i, (f cell i == .ancA) = (cell i == .ancA)) →
      (∀ i, (f cell i == .ancB) = (cell i == .ancB)) →
      (∀ i, (f cell i == .rotR) = (cell i == .rotR)) →
      (∀ i, isCat15 (f cell i) = isCat15 (cell i)) →
      (∀ i, ((f cell i == .empty || f cell i == .rotR) &&
             (f cell (oppSlot i) == .empty || f cell (oppSlot i) == .rotR)) =
            ((cell i == .empty || cell i == .rotR) &&
             (cell (oppSlot i) == .empty || cell (oppSlot i) == .rotR))) →
      gateMode15 (f cell) = gateMode15 cell := by
    intro f hA hB hR hCat hPR
    unfold gateMode15
    rw [uniquePred24_congr _ _ hA, uniquePred24_congr _ _ hB]
    cases uniquePred24 (fun i => cell i == .ancA) with
    | none => rfl
    | some a =>
      cases uniquePred24 (fun i => cell i == .ancB) with
      | none => rfl
      | some b =>
        have hQ : allPred24 (fun i => !isInQ a b i || !isCat15 (f cell i)) =
            allPred24 (fun i => !isInQ a b i || !isCat15 (cell i)) :=
          allPred24_congr _ _ fun i => by rw [hCat i]
        have hRC : countPred24 (fun i => isInP a b i && (f cell i == .rotR)) =
            countPred24 (fun i => isInP a b i && (cell i == .rotR)) :=
          countPred24_congr _ _ fun i => by rw [hR i]
        have hP : allPred24 (fun i => !isInP a b i || (f cell i == .empty || f cell i == .rotR)) =
            allPred24 (fun i => !isInP a b i || (cell i == .empty || cell i == .rotR)) := by
          have hIff : (∀ i, (!isInP a b i || (f cell i == .empty || f cell i == .rotR)) = true) ↔
              (∀ i, (!isInP a b i || (cell i == .empty || cell i == .rotR)) = true) := by
            constructor <;> intro hAll i
            · by_cases hip : isInP a b i = true
              · have h1 := hAll i; have h2 := hAll (oppSlot i)
                have hip' : isInP a b (oppSlot i) = true := by rw [isInP_opp]; exact hip
                simp [hip] at h1; simp [hip'] at h2
                have hb := hPR i; simp [h1, h2] at hb; simp [hip, hb.1]
              · simp [Bool.eq_false_iff.mpr hip]
            · by_cases hip : isInP a b i = true
              · have h1 := hAll i; have h2 := hAll (oppSlot i)
                have hip' : isInP a b (oppSlot i) = true := by rw [isInP_opp]; exact hip
                simp [hip] at h1; simp [hip'] at h2
                have hb := hPR i; simp [h1, h2] at hb; simp [hip, hb.1]
              · simp [Bool.eq_false_iff.mpr hip]
          cases h1 : allPred24 (fun i => !isInP a b i || (f cell i == .empty || f cell i == .rotR)) with
          | true => exact ((allPred24_eq_true_iff _).mpr (hIff.mp ((allPred24_eq_true_iff _).mp h1))).symm
          | false =>
            cases h2 : allPred24 (fun i => !isInP a b i || (cell i == .empty || cell i == .rotR)) with
            | false => rfl
            | true =>
              have h3 := (allPred24_eq_true_iff _).mpr (hIff.mpr ((allPred24_eq_true_iff _).mp h2))
              rw [h3] at h1; exact Bool.noConfusion h1
        rw [hQ, hRC, hP]
  refine ⟨hHelper bgStep15
    (fun i => (lineRev12_exch_all_laws.2.2.2.2.2.2.1 (cell i) (cell (oppSlot i))).1)
    (fun i => (lineRev12_exch_all_laws.2.2.2.2.2.2.1 (cell i) (cell (oppSlot i))).2.1)
    (fun i => (lineRev12_exch_all_laws.2.2.2.2.2.2.1 (cell i) (cell (oppSlot i))).2.2.1)
    (fun i => (lineRev12_exch_all_laws.2.2.2.2.2.2.1 (cell i) (cell (oppSlot i))).2.2.2)
    (fun i => by
      have hp := bgStep15_pair cell i
      have h1 : bgStep15 cell i = (lineRev12_exch (cell i, cell (oppSlot i))).1 := congrArg Prod.fst hp
      have h2 : bgStep15 cell (oppSlot i) = (lineRev12_exch (cell i, cell (oppSlot i))).2 := congrArg Prod.snd hp
      rw [h1, h2]; exact lineRev12_exch_all_laws.2.2.2.2.2.2.2.2.1 _ _),
    hHelper bgStep15Inv
    (fun i => (lineRev12_exch_all_laws.2.2.2.2.2.2.2.1 (cell i) (cell (oppSlot i))).1)
    (fun i => (lineRev12_exch_all_laws.2.2.2.2.2.2.2.1 (cell i) (cell (oppSlot i))).2.1)
    (fun i => (lineRev12_exch_all_laws.2.2.2.2.2.2.2.1 (cell i) (cell (oppSlot i))).2.2.1)
    (fun i => (lineRev12_exch_all_laws.2.2.2.2.2.2.2.1 (cell i) (cell (oppSlot i))).2.2.2)
    (fun i => by
      have hp := bgStep15Inv_pair cell i
      have h1 : bgStep15Inv cell i = (lineRev12_exchInv (cell i, cell (oppSlot i))).1 := congrArg Prod.fst hp
      have h2 : bgStep15Inv cell (oppSlot i) = (lineRev12_exchInv (cell i, cell (oppSlot i))).2 := congrArg Prod.snd hp
      rw [h1, h2]; exact lineRev12_exch_all_laws.2.2.2.2.2.2.2.2.2 _ _)⟩

private theorem launcher_ports_distinct (a b pEmpty : Fin 24)
    (hab : isOrthPair a b = true) (hp : isInP a b pEmpty = true) :
    let q0 := qNorth a b pEmpty
    let q1 := rotQ a b q0
    let q2 := rotQ a b q1
    let q3 := rotQ a b q2
    q0 ≠ q1 ∧ q0 ≠ q2 ∧ q0 ≠ q3 ∧ q0 ≠ pEmpty ∧
    q1 ≠ q2 ∧ q1 ≠ q3 ∧ q1 ≠ pEmpty ∧
    q2 ≠ q3 ∧ q2 ≠ pEmpty ∧ q3 ≠ pEmpty ∧
    isInQ a b q0 = true ∧ isInQ a b q1 = true ∧ isInQ a b q2 = true ∧ isInQ a b q3 = true := by
  have hCanon : ∀ p : Fin 24, isInP canonA canonB p = true →
      let q0 := qNorth canonA canonB p
      let q1 := rotQ canonA canonB q0
      let q2 := rotQ canonA canonB q1
      let q3 := rotQ canonA canonB q2
      q0 ≠ q1 ∧ q0 ≠ q2 ∧ q0 ≠ q3 ∧ q0 ≠ p ∧
      q1 ≠ q2 ∧ q1 ≠ q3 ∧ q1 ≠ p ∧
      q2 ≠ q3 ∧ q2 ≠ p ∧ q3 ≠ p ∧
      isInQ canonA canonB q0 = true ∧ isInQ canonA canonB q1 = true ∧
      isInQ canonA canonB q2 = true ∧ isInQ canonA canonB q3 = true := by decide
  let g := mapOrthPairToCanon a b
  obtain ⟨hDet, hA, hB⟩ := mapOrthPairToCanon_spec a b hab
  have hp0 : isInP canonA canonB (wf4Perm g pEmpty) = true := by rw [← hA, ← hB, isInP_wf4]; exact hp
  have hC := hCanon (wf4Perm g pEmpty) hp0
  have hEq0 : wf4Perm g (qNorth a b pEmpty) = qNorth canonA canonB (wf4Perm g pEmpty) := by
    rw [qNorth_equivariant g hDet, hA, hB]
  have hEq1 : wf4Perm g (rotQ a b (qNorth a b pEmpty)) = rotQ canonA canonB (qNorth canonA canonB (wf4Perm g pEmpty)) := by
    rw [rotQ_equivariant g hDet, hA, hB, hEq0]
  have hEq2 : wf4Perm g (rotQ a b (rotQ a b (qNorth a b pEmpty))) =
      rotQ canonA canonB (rotQ canonA canonB (qNorth canonA canonB (wf4Perm g pEmpty))) := by
    rw [rotQ_equivariant g hDet, hA, hB, hEq1]
  have hEq3 : wf4Perm g (rotQ a b (rotQ a b (rotQ a b (qNorth a b pEmpty)))) =
      rotQ canonA canonB (rotQ canonA canonB (rotQ canonA canonB (qNorth canonA canonB (wf4Perm g pEmpty)))) := by
    rw [rotQ_equivariant g hDet, hA, hB, hEq2]
  have hNe : ∀ x y : Fin 24, wf4Perm g x ≠ wf4Perm g y → x ≠ y := fun x y hne hxy => hne (congrArg (wf4Perm g) hxy)
  have hQBack : ∀ x : Fin 24, isInQ canonA canonB (wf4Perm g x) = true → isInQ a b x = true := fun x hx => by
    rw [← hA, ← hB, isInQ_wf4] at hx; exact hx
  dsimp only at hC ⊢
  refine ⟨hNe _ _ (by rw [hEq0, hEq1]; exact hC.1),
          hNe _ _ (by rw [hEq0, hEq2]; exact hC.2.1),
          hNe _ _ (by rw [hEq0, hEq3]; exact hC.2.2.1),
          hNe _ _ (by rw [hEq0]; exact hC.2.2.2.1),
          hNe _ _ (by rw [hEq1, hEq2]; exact hC.2.2.2.2.1),
          hNe _ _ (by rw [hEq1, hEq3]; exact hC.2.2.2.2.2.1),
          hNe _ _ (by rw [hEq1]; exact hC.2.2.2.2.2.2.1),
          hNe _ _ (by rw [hEq2, hEq3]; exact hC.2.2.2.2.2.2.2.1),
          hNe _ _ (by rw [hEq2]; exact hC.2.2.2.2.2.2.2.2.1),
          hNe _ _ (by rw [hEq3]; exact hC.2.2.2.2.2.2.2.2.2.1),
          hQBack _ (by rw [hEq0]; exact hC.2.2.2.2.2.2.2.2.2.2.1),
          hQBack _ (by rw [hEq1]; exact hC.2.2.2.2.2.2.2.2.2.2.2.1),
          hQBack _ (by rw [hEq2]; exact hC.2.2.2.2.2.2.2.2.2.2.2.2.1),
          hQBack _ (by rw [hEq3]; exact hC.2.2.2.2.2.2.2.2.2.2.2.2.2)⟩

private theorem write5_read_back (q0 q1 q2 q3 p : Fin 24)
    (h01 : q0 ≠ q1) (h02 : q0 ≠ q2) (h03 : q0 ≠ q3) (h0p : q0 ≠ p)
    (h12 : q1 ≠ q2) (h13 : q1 ≠ q3) (h1p : q1 ≠ p)
    (h23 : q2 ≠ q3) (h2p : q2 ≠ p) (h3p : q3 ≠ p)
    (vs : Sym15 × Sym15 × Sym15 × Sym15 × Sym15) (cell : Fin 24 → Sym15) :
    (write5 q0 q1 q2 q3 p vs cell q0 = vs.1) ∧
    (write5 q0 q1 q2 q3 p vs cell q1 = vs.2.1) ∧
    (write5 q0 q1 q2 q3 p vs cell q2 = vs.2.2.1) ∧
    (write5 q0 q1 q2 q3 p vs cell q3 = vs.2.2.2.1) ∧
    (write5 q0 q1 q2 q3 p vs cell p = vs.2.2.2.2) := by
  refine ⟨by simp [write5],
          by simp [write5, h01.symm],
          by simp [write5, h02.symm, h12.symm],
          by simp [write5, h03.symm, h13.symm, h23.symm],
          by simp [write5, h0p.symm, h1p.symm, h2p.symm, h3p.symm]⟩

private theorem write5_overwrite (q0 q1 q2 q3 p : Fin 24)
    (vs1 vs2 : Sym15 × Sym15 × Sym15 × Sym15 × Sym15) (cell : Fin 24 → Sym15) :
    write5 q0 q1 q2 q3 p vs2 (write5 q0 q1 q2 q3 p vs1 cell) = write5 q0 q1 q2 q3 p vs2 cell := by
  funext i; unfold write5; split_ifs <;> rfl

private theorem write5_self (q0 q1 q2 q3 p : Fin 24) (cell : Fin 24 → Sym15) :
    write5 q0 q1 q2 q3 p (cell q0, cell q1, cell q2, cell q3, cell p) cell = cell := by
  funext i; unfold write5; split_ifs with h0 h1 h2 h3 hp <;> simp_all

private theorem write5_actSym15 (g : WF4Elem) (q0 q1 q2 q3 p : Fin 24)
    (vs : Sym15 × Sym15 × Sym15 × Sym15 × Sym15) (cell : Fin 24 → Sym15) :
    actSym15 g (write5 q0 q1 q2 q3 p vs cell) =
      write5 (wf4Perm g q0) (wf4Perm g q1) (wf4Perm g q2) (wf4Perm g q3) (wf4Perm g p) vs (actSym15 g cell) := by
  funext i; unfold actSym15 write5
  have hIff : ∀ x : Fin 24, wf4PermInv g i = x ↔ i = wf4Perm g x := fun x =>
    ⟨fun h => by rw [← h, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 i).2],
     fun h => by rw [h, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 x).1]⟩
  simp only [hIff]

private theorem write5_countOcc15 (q0 q1 q2 q3 p : Fin 24)
    (h01 : q0 ≠ q1) (h02 : q0 ≠ q2) (h03 : q0 ≠ q3) (h0p : q0 ≠ p)
    (h12 : q1 ≠ q2) (h13 : q1 ≠ q3) (h1p : q1 ≠ p)
    (h23 : q2 ≠ q3) (h2p : q2 ≠ p) (h3p : q3 ≠ p)
    (vs : Sym15 × Sym15 × Sym15 × Sym15 × Sym15) (cell : Fin 24 → Sym15)
    (hOcc : occ15 vs.1 + occ15 vs.2.1 + occ15 vs.2.2.1 + occ15 vs.2.2.2.1 + occ15 vs.2.2.2.2 =
            occ15 (cell q0) + occ15 (cell q1) + occ15 (cell q2) + occ15 (cell q3) + occ15 (cell p)) :
    countOcc15 (write5 q0 q1 q2 q3 p vs cell) = countOcc15 cell := by
  let S : Finset (Fin 24) := {q0, q1, q2, q3, p}
  have hSplit : ∀ f : Fin 24 → Nat,
      (∑ i : Fin 24, f i) = (∑ i ∈ S, f i) + (∑ i ∈ Finset.univ \ S, f i) := fun f => by
    rw [← Finset.sum_union (Finset.disjoint_sdiff), Finset.union_sdiff_of_subset (Finset.subset_univ S)]
  have hSumS : ∀ f : Fin 24 → Nat,
      (∑ i ∈ S, f i) = f q0 + f q1 + f q2 + f q3 + f p := fun f => by
    have h0 : q0 ∉ ({q1, q2, q3, p} : Finset (Fin 24)) := by simp [h01, h02, h03, h0p]
    have h1 : q1 ∉ ({q2, q3, p} : Finset (Fin 24)) := by simp [h12, h13, h1p]
    have h2 : q2 ∉ ({q3, p} : Finset (Fin 24)) := by simp [h23, h2p]
    have h3 : q3 ∉ ({p} : Finset (Fin 24)) := by simp [h3p]
    simp only [S, Finset.sum_insert h0, Finset.sum_insert h1, Finset.sum_insert h2,
      Finset.sum_insert h3, Finset.sum_singleton]
    omega
  unfold countOcc15
  rw [hSplit, hSplit, hSumS, hSumS]
  obtain ⟨r0, r1, r2, r3, rp⟩ := write5_read_back q0 q1 q2 q3 p h01 h02 h03 h0p h12 h13 h1p h23 h2p h3p vs cell
  rw [r0, r1, r2, r3, rp, hOcc]
  congr 1
  refine Finset.sum_congr rfl fun i hi => ?_
  have hNot : i ≠ q0 ∧ i ≠ q1 ∧ i ≠ q2 ∧ i ≠ q3 ∧ i ≠ p := by
    simp [S] at hi; exact hi
  simp [write5, hNot.1, hNot.2.1, hNot.2.2.1, hNot.2.2.2.1, hNot.2.2.2.2]

private theorem gateMode15_preserved_by_QP_equiv (cell : Fin 24 → Sym15) (a b : Fin 24) (r : Nat)
    (hMode : gateMode15 cell = some (a, b, r))
    (e : Fin 24 ≃ Fin 24)
    (heQ : ∀ i : Fin 24, isInQ a b (e i) = isInQ a b i)
    (heP : ∀ i : Fin 24, isInP a b (e i) = isInP a b i)
    (heOut : ∀ i : Fin 24, isInQ a b i = false → isInP a b i = false → e i = i) :
    gateMode15 (fun i => cell (e i)) = some (a, b, r) := by
  have hMode' := hMode
  unfold gateMode15 at hMode'
  cases hA : uniquePred24 (fun i => cell i == .ancA) with
  | none => rw [hA] at hMode'; exact Option.noConfusion hMode'
  | some a0 =>
    cases hB : uniquePred24 (fun i => cell i == .ancB) with
    | none => rw [hA, hB] at hMode'; exact Option.noConfusion hMode'
    | some b0 =>
      rw [hA, hB] at hMode'
      split_ifs at hMode' with hCond hR3 hR014
      · simp only [Option.some.injEq, Prod.mk.injEq] at hMode'
        rcases hMode' with ⟨rfl, rfl, rfl⟩
        simp only [Bool.and_eq_true] at hCond
        rcases hCond with ⟨hOrth, hQNoCat⟩
        have hDisj := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hOrth).2.2
        have hea : e a = a := heOut a
          (by cases h : isInQ a b a <;> [rfl; exact absurd ⟨Or.inl rfl, h⟩ (hDisj a).1])
          (by cases h : isInP a b a <;> [rfl; exact absurd ⟨Or.inl rfl, h⟩ (hDisj a).2.1])
        have heb : e b = b := heOut b
          (by cases h : isInQ a b b <;> [rfl; exact absurd ⟨Or.inr rfl, h⟩ (hDisj b).1])
          (by cases h : isInP a b b <;> [rfl; exact absurd ⟨Or.inr rfl, h⟩ (hDisj b).2.1])
        have hA' : uniquePred24 (fun i => cell (e i) == .ancA) = some a := by
          simpa [hA, show e.symm a = a from by simpa [hea] using e.symm_apply_apply a] using
            uniquePred24_comp_equiv e.symm (fun i => cell i == .ancA)
        have hB' : uniquePred24 (fun i => cell (e i) == .ancB) = some b := by
          simpa [hB, show e.symm b = b from by simpa [heb] using e.symm_apply_apply b] using
            uniquePred24_comp_equiv e.symm (fun i => cell i == .ancB)
        have hQ' : allPred24 (fun i => !isInQ a b i || !isCat15 (cell (e i))) = true := by
          rw [allPred24_congr _ (fun i => !isInQ a b (e i) || !isCat15 (cell (e i))) (fun i => by rw [heQ]),
              allPred24_comp_equiv e]; exact hQNoCat
        have hR' : countPred24 (fun i => isInP a b i && (cell (e i) == .rotR)) =
            countPred24 (fun i => isInP a b i && (cell i == .rotR)) := by
          rw [countPred24_congr _ (fun i => isInP a b (e i) && (cell (e i) == .rotR)) (fun i => by rw [heP])]
          exact countPred24_comp_equiv e _
        unfold gateMode15; rw [hA', hB', hR']; simp [hOrth, hQ', hR3]
      · simp only [Option.some.injEq, Prod.mk.injEq] at hMode'
        rcases hMode' with ⟨rfl, rfl, rfl⟩
        simp only [Bool.and_eq_true] at hCond hR014
        rcases hCond with ⟨hOrth, hQNoCat⟩
        rcases hR014 with ⟨hRCase, hPOnly⟩
        have hDisj := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hOrth).2.2
        have hea : e a = a := heOut a
          (by cases h : isInQ a b a <;> [rfl; exact absurd ⟨Or.inl rfl, h⟩ (hDisj a).1])
          (by cases h : isInP a b a <;> [rfl; exact absurd ⟨Or.inl rfl, h⟩ (hDisj a).2.1])
        have heb : e b = b := heOut b
          (by cases h : isInQ a b b <;> [rfl; exact absurd ⟨Or.inr rfl, h⟩ (hDisj b).1])
          (by cases h : isInP a b b <;> [rfl; exact absurd ⟨Or.inr rfl, h⟩ (hDisj b).2.1])
        have hA' : uniquePred24 (fun i => cell (e i) == .ancA) = some a := by
          simpa [hA, show e.symm a = a from by simpa [hea] using e.symm_apply_apply a] using
            uniquePred24_comp_equiv e.symm (fun i => cell i == .ancA)
        have hB' : uniquePred24 (fun i => cell (e i) == .ancB) = some b := by
          simpa [hB, show e.symm b = b from by simpa [heb] using e.symm_apply_apply b] using
            uniquePred24_comp_equiv e.symm (fun i => cell i == .ancB)
        have hQ' : allPred24 (fun i => !isInQ a b i || !isCat15 (cell (e i))) = true := by
          rw [allPred24_congr _ (fun i => !isInQ a b (e i) || !isCat15 (cell (e i))) (fun i => by rw [heQ]),
              allPred24_comp_equiv e]; exact hQNoCat
        have hP' : allPred24 (fun i => !isInP a b i || (cell (e i) == .empty || cell (e i) == .rotR)) = true := by
          rw [allPred24_congr _ (fun i => !isInP a b (e i) || (cell (e i) == .empty || cell (e i) == .rotR)) (fun i => by rw [heP]),
              allPred24_comp_equiv e]; exact hPOnly
        have hR' : countPred24 (fun i => isInP a b i && (cell (e i) == .rotR)) =
            countPred24 (fun i => isInP a b i && (cell i == .rotR)) := by
          rw [countPred24_congr _ (fun i => isInP a b (e i) && (cell (e i) == .rotR)) (fun i => by rw [heP])]
          exact countPred24_comp_equiv e _
        unfold gateMode15; rw [hA', hB', hR']; simp [hOrth, hQ', hR3, hRCase, hP']

private theorem gateMode15_preserved_by_launcher (cell : Fin 24 → Sym15) (a b pEmpty : Fin 24)
    (hMode : gateMode15 cell = some (a, b, 3))
    (hpEmpty : uniquePred24 (fun i => isInP a b i && !(cell i == .rotR)) = some pEmpty)
    (vs : Sym15 × Sym15 × Sym15 × Sym15 × Sym15)
    (hNoCat : isCat15 vs.1 = false ∧ isCat15 vs.2.1 = false ∧ isCat15 vs.2.2.1 = false ∧
              isCat15 vs.2.2.2.1 = false ∧ isCat15 vs.2.2.2.2 = false) :
    let q0 := qNorth a b pEmpty
    let q1 := rotQ a b q0
    let q2 := rotQ a b q1
    let q3 := rotQ a b q2
    let cell' := write5 q0 q1 q2 q3 pEmpty vs cell
    gateMode15 cell' = some (a, b, 3) ∧
    uniquePred24 (fun i => isInP a b i && !(cell' i == .rotR)) = some pEmpty := by
  have hMode' := hMode
  unfold gateMode15 at hMode'
  cases hA : uniquePred24 (fun i => cell i == .ancA) with
  | none => rw [hA] at hMode'; exact Option.noConfusion hMode'
  | some a0 =>
    cases hB : uniquePred24 (fun i => cell i == .ancB) with
    | none => rw [hA, hB] at hMode'; exact Option.noConfusion hMode'
    | some b0 =>
      rw [hA, hB] at hMode'
      split_ifs at hMode' with hCond hR3 hR014
      · simp only [Option.some.injEq, Prod.mk.injEq] at hMode'
        rcases hMode' with ⟨rfl, rfl, _⟩
        simp only [Bool.and_eq_true] at hCond
        rcases hCond with ⟨hOrth, hQNoCat⟩
        have hpInP : isInP a b pEmpty = true := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ pEmpty).mp hpEmpty).1).1
        have hpNotR : (cell pEmpty == .rotR) = false := by
          have := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ pEmpty).mp hpEmpty).1).2
          simpa using this
        have hDisj := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hOrth).2.2
        have hL := launcher_ports_distinct a b pEmpty hOrth hpInP
        set q0 := qNorth a b pEmpty
        set q1 := rotQ a b q0
        set q2 := rotQ a b q1
        set q3 := rotQ a b q2
        set cell' := write5 q0 q1 q2 q3 pEmpty vs cell
        have hQIn : isInQ a b q0 = true ∧ isInQ a b q1 = true ∧ isInQ a b q2 = true ∧ isInQ a b q3 = true :=
          ⟨hL.2.2.2.2.2.2.2.2.2.2.1, hL.2.2.2.2.2.2.2.2.2.2.2.1,
           hL.2.2.2.2.2.2.2.2.2.2.2.2.1, hL.2.2.2.2.2.2.2.2.2.2.2.2.2⟩
        have hNoCatCell : isCat15 (cell q0) = false ∧ isCat15 (cell q1) = false ∧
            isCat15 (cell q2) = false ∧ isCat15 (cell q3) = false ∧ isCat15 (cell pEmpty) = false := by
          have hAllQ := (allPred24_eq_true_iff _).mp hQNoCat
          have hqnc : ∀ q, isInQ a b q = true → isCat15 (cell q) = false := fun q hq => by
            have := hAllQ q; simp [hq] at this; exact this
          have hpNeA : pEmpty ≠ a := fun h => (hDisj a).2.1 ⟨Or.inl rfl, h ▸ hpInP⟩
          have hpNeB : pEmpty ≠ b := fun h => (hDisj b).2.1 ⟨Or.inr rfl, h ▸ hpInP⟩
          have hAuniq := ((uniquePred24_eq_some_iff _ a).mp hA).2
          have hBuniq := ((uniquePred24_eq_some_iff _ b).mp hB).2
          have hpNotA : cell pEmpty ≠ .ancA := fun h => hpNeA (hAuniq pEmpty (by simp [h]))
          have hpNotB : cell pEmpty ≠ .ancB := fun h => hpNeB (hBuniq pEmpty (by simp [h]))
          have hpNotR' : cell pEmpty ≠ .rotR := fun h => by simp [h] at hpNotR
          have hpNC : isCat15 (cell pEmpty) = false := by
            cases hc : cell pEmpty <;> simp_all [isCat15]
          exact ⟨hqnc q0 hQIn.1, hqnc q1 hQIn.2.1, hqnc q2 hQIn.2.2.1, hqnc q3 hQIn.2.2.2, hpNC⟩
        have hCatEq : ∀ i : Fin 24,
            isCat15 (cell' i) = isCat15 (cell i) ∧
            (cell' i == .ancA) = (cell i == .ancA) ∧
            (cell' i == .ancB) = (cell i == .ancB) ∧
            (cell' i == .rotR) = (cell i == .rotR) := by
          intro i
          have hFalseCat : ∀ x y : Sym15, isCat15 x = false → isCat15 y = false →
              isCat15 x = isCat15 y ∧ (x == .ancA) = (y == .ancA) ∧
              (x == .ancB) = (y == .ancB) ∧ (x == .rotR) = (y == .rotR) := by
            intro x y hx hy; cases x <;> cases y <;> simp_all [isCat15]
          dsimp only [cell', write5]
          split_ifs with h0 h1 h2 h3 hp
          · subst h0; exact hFalseCat vs.1 (cell q0) hNoCat.1 hNoCatCell.1
          · subst h1; exact hFalseCat vs.2.1 (cell q1) hNoCat.2.1 hNoCatCell.2.1
          · subst h2; exact hFalseCat vs.2.2.1 (cell q2) hNoCat.2.2.1 hNoCatCell.2.2.1
          · subst h3; exact hFalseCat vs.2.2.2.1 (cell q3) hNoCat.2.2.2.1 hNoCatCell.2.2.2.1
          · subst hp; exact hFalseCat vs.2.2.2.2 (cell pEmpty) hNoCat.2.2.2.2 hNoCatCell.2.2.2.2
          · exact ⟨rfl, rfl, rfl, rfl⟩
        have hA' : uniquePred24 (fun i => cell' i == .ancA) = some a := by
          rw [uniquePred24_congr _ _ (fun i => (hCatEq i).2.1)]; exact hA
        have hB' : uniquePred24 (fun i => cell' i == .ancB) = some b := by
          rw [uniquePred24_congr _ _ (fun i => (hCatEq i).2.2.1)]; exact hB
        have hQ' : allPred24 (fun i => !isInQ a b i || !isCat15 (cell' i)) = true := by
          rw [allPred24_congr _ _ (fun i => by rw [(hCatEq i).1])]; exact hQNoCat
        have hR' : countPred24 (fun i => isInP a b i && (cell' i == .rotR)) = 3 := by
          rw [countPred24_congr _ _ (fun i => by rw [(hCatEq i).2.2.2])]; exact hR3
        have hpEmpty' : uniquePred24 (fun i => isInP a b i && !(cell' i == .rotR)) = some pEmpty := by
          rw [uniquePred24_congr _ _ (fun i => by rw [(hCatEq i).2.2.2])]; exact hpEmpty
        refine ⟨?_, hpEmpty'⟩
        unfold gateMode15; rw [hA', hB', hR']; simp [hOrth, hQ']
      · simp only [Option.some.injEq, Prod.mk.injEq] at hMode'
        exact absurd hMode'.2.2 hR3

private theorem gateMode15_equivariant (g : WF4Elem) (cell : Fin 24 → Sym15) :
    gateMode15 (actSym15 g cell) = (gateMode15 cell).map (fun t => (wf4Perm g t.1, wf4Perm g t.2.1, t.2.2)) := by
  unfold gateMode15 actSym15
  have hA := uniquePred24_comp_equiv (wf4Equiv g) (fun i => cell i == .ancA)
  have hB := uniquePred24_comp_equiv (wf4Equiv g) (fun i => cell i == .ancB)
  change (match uniquePred24 (fun i => cell ((wf4Equiv g).symm i) == .ancA),
                uniquePred24 (fun i => cell ((wf4Equiv g).symm i) == .ancB) with
          | some a, some b => _ | _, _ => none) = _
  rw [hA, hB]
  cases uniquePred24 (fun i => cell i == .ancA) with
  | none => rfl
  | some a =>
    cases uniquePred24 (fun i => cell i == .ancB) with
    | none => rfl
    | some b =>
      simp only [Option.map_some]
      have hOrth : isOrthPair (wf4Perm g a) (wf4Perm g b) = isOrthPair a b := isOrthPair_wf4 g a b
      have hQ : allPred24 (fun i => !isInQ (wf4Perm g a) (wf4Perm g b) i || !isCat15 (cell ((wf4Equiv g).symm i))) =
          allPred24 (fun i => !isInQ a b i || !isCat15 (cell i)) := by
        rw [allPred24_congr _ (fun i => !isInQ a b ((wf4Equiv g).symm i) || !isCat15 (cell ((wf4Equiv g).symm i))) (fun i => by
          have := isInQ_wf4 g a b ((wf4Equiv g).symm i)
          simpa using congrArg (fun x => !x || !isCat15 (cell ((wf4Equiv g).symm i))) this)]
        exact allPred24_comp_equiv (wf4Equiv g).symm _
      have hP : allPred24 (fun i => !isInP (wf4Perm g a) (wf4Perm g b) i ||
            (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .rotR)) =
          allPred24 (fun i => !isInP a b i || (cell i == .empty || cell i == .rotR)) := by
        rw [allPred24_congr _ (fun i => !isInP a b ((wf4Equiv g).symm i) ||
            (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .rotR)) (fun i => by
          have := isInP_wf4 g a b ((wf4Equiv g).symm i)
          simpa using congrArg (fun x => !x || (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .rotR)) this)]
        exact allPred24_comp_equiv (wf4Equiv g).symm _
      have hR : countPred24 (fun i => isInP (wf4Perm g a) (wf4Perm g b) i && (cell ((wf4Equiv g).symm i) == .rotR)) =
          countPred24 (fun i => isInP a b i && (cell i == .rotR)) := by
        rw [countPred24_congr _ (fun i => isInP a b ((wf4Equiv g).symm i) && (cell ((wf4Equiv g).symm i) == .rotR)) (fun i => by
          have := isInP_wf4 g a b ((wf4Equiv g).symm i)
          simpa using congrArg (fun x => x && (cell ((wf4Equiv g).symm i) == .rotR)) this)]
        exact countPred24_comp_equiv (wf4Equiv g).symm _
      change (if isOrthPair (wf4Perm g a) (wf4Perm g b) &&
          allPred24 (fun i => !isInQ (wf4Perm g a) (wf4Perm g b) i || !isCat15 (cell ((wf4Equiv g).symm i))) then
        let r := countPred24 (fun i => isInP (wf4Perm g a) (wf4Perm g b) i && (cell ((wf4Equiv g).symm i) == .rotR))
        if r = 3 then some (wf4Perm g a, wf4Perm g b, 3)
        else if (r = 0 || r = 1 || r = 4) &&
                allPred24 (fun i => !isInP (wf4Perm g a) (wf4Perm g b) i ||
                  (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .rotR)) then
          some (wf4Perm g a, wf4Perm g b, r)
        else none else none) = _
      rw [hOrth, hQ, hP, hR]
      split_ifs <;> simp

private theorem strong15_step_inv (fwd : Bool) (cell : Fin 24 → Sym15) :
    (if fwd then localStrong15Inv (localStrong15 cell) else localStrong15 (localStrong15Inv cell)) = cell := by
  cases hMode : gateMode15 cell with
  | none =>
    cases fwd
    · simp only [localStrong15, localStrong15Inv, hMode, (bgStep15_preserves_gateMode15 cell).2, bgStep15_inv_right]
    · simp only [localStrong15, localStrong15Inv, hMode, (bgStep15_preserves_gateMode15 cell).1, bgStep15_inv_left]
  | some abr =>
    rcases abr with ⟨a, b, r⟩
    by_cases hr0 : r = 0
    · subst hr0
      obtain ⟨hQ, hP, hOut⟩ := rotQ2Equiv_invariants a b
      have hM' := gateMode15_preserved_by_QP_equiv cell a b 0 hMode (rotQ2Equiv a b) hQ hP hOut
      cases fwd <;> simp only [localStrong15, localStrong15Inv, hMode, hM', ↓reduceIte] <;>
        (funext i; exact congrArg cell (rotQ2_invol a b i))
    · by_cases hr4 : r = 4
      · subst hr4
        obtain ⟨hQ, hQInv, hP, hPInv, hOut, hOutInv⟩ := rotQEquiv_invariants a b
        have hM1 := gateMode15_preserved_by_QP_equiv cell a b 4 hMode (rotQEquiv a b).symm hQInv hPInv hOutInv
        have hM2 := gateMode15_preserved_by_QP_equiv cell a b 4 hMode (rotQEquiv a b) hQ hP hOut
        cases fwd
        · simp only [localStrong15, localStrong15Inv, hMode, hM2, hr0, ↓reduceIte]
          funext i; exact congrArg cell ((rotQEquiv a b).apply_symm_apply i)
        · simp only [localStrong15, localStrong15Inv, hMode, hM1, hr0, ↓reduceIte]
          funext i; exact congrArg cell ((rotQEquiv a b).symm_apply_apply i)
      · by_cases hr3 : r = 3
        · subst hr3
          cases hpEmpty : uniquePred24 (fun i => isInP a b i && !(cell i == .rotR)) with
          | none =>
            cases fwd <;> simp only [localStrong15, localStrong15Inv, hMode, hr0, hr4, hpEmpty, ↓reduceIte]
          | some pEmpty =>
            have hOrth : isOrthPair a b = true := by
              unfold gateMode15 at hMode
              cases hA : uniquePred24 (fun i => cell i == .ancA) with
              | none => rw [hA] at hMode; exact Option.noConfusion hMode
              | some a0 =>
                cases hB : uniquePred24 (fun i => cell i == .ancB) with
                | none => rw [hA, hB] at hMode; exact Option.noConfusion hMode
                | some b0 =>
                  rw [hA, hB] at hMode
                  split_ifs at hMode with hC
                  · simp only [Option.some.injEq, Prod.mk.injEq] at hMode
                    rcases hMode with ⟨rfl, rfl, _⟩
                    exact (Bool.and_eq_true _ _).mp hC |>.1
                  · simp only [Option.some.injEq, Prod.mk.injEq] at hMode
                    rcases hMode with ⟨rfl, rfl, _⟩
                    exact (Bool.and_eq_true _ _).mp hC |>.1
            have hpInP : isInP a b pEmpty = true := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ pEmpty).mp hpEmpty).1).1
            have hL := launcher_ports_distinct a b pEmpty hOrth hpInP
            set q0 := qNorth a b pEmpty
            set q1 := rotQ a b q0
            set q2 := rotQ a b q1
            set q3 := rotQ a b q2
            have hNoCatCell : isCat15 (cell q0) = false ∧ isCat15 (cell q1) = false ∧
                isCat15 (cell q2) = false ∧ isCat15 (cell q3) = false ∧ isCat15 (cell pEmpty) = false := by
              unfold gateMode15 at hMode
              cases hA : uniquePred24 (fun i => cell i == .ancA) with
              | none => rw [hA] at hMode; exact Option.noConfusion hMode
              | some a0 =>
                cases hB : uniquePred24 (fun i => cell i == .ancB) with
                | none => rw [hA, hB] at hMode; exact Option.noConfusion hMode
                | some b0 =>
                  rw [hA, hB] at hMode
                  split_ifs at hMode with hC hR3
                  · simp only [Option.some.injEq, Prod.mk.injEq] at hMode
                    rcases hMode with ⟨rfl, rfl, _⟩
                    have hAllQ := (allPred24_eq_true_iff _).mp ((Bool.and_eq_true _ _).mp hC).2
                    have hqnc : ∀ q, isInQ a b q = true → isCat15 (cell q) = false := fun q hq => by
                      have := hAllQ q; simp [hq] at this; exact this
                    have hDisj := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hOrth).2.2
                    have hpNotA : cell pEmpty ≠ .ancA := fun h =>
                      (hDisj a).2.1 ⟨Or.inl rfl, (((uniquePred24_eq_some_iff _ a).mp hA).2 pEmpty (by simp [h])) ▸ hpInP⟩
                    have hpNotB : cell pEmpty ≠ .ancB := fun h =>
                      (hDisj b).2.1 ⟨Or.inr rfl, (((uniquePred24_eq_some_iff _ b).mp hB).2 pEmpty (by simp [h])) ▸ hpInP⟩
                    have hpNotR : cell pEmpty ≠ .rotR := by
                      have := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ pEmpty).mp hpEmpty).1).2
                      intro h; simp [h] at this
                    have hpNC : isCat15 (cell pEmpty) = false := by cases hc : cell pEmpty <;> simp_all [isCat15]
                    exact ⟨hqnc q0 hL.2.2.2.2.2.2.2.2.2.2.1, hqnc q1 hL.2.2.2.2.2.2.2.2.2.2.2.1,
                           hqnc q2 hL.2.2.2.2.2.2.2.2.2.2.2.2.1, hqnc q3 hL.2.2.2.2.2.2.2.2.2.2.2.2.2, hpNC⟩
                  · simp only [Option.some.injEq, Prod.mk.injEq] at hMode
                    exact absurd hMode.2.2 hR3
            set t := (cell q0, cell q1, cell q2, cell q3, cell pEmpty)
            have hT := launch5_laws t
            have hNoCatFwd := hT.2.2.2.1 hNoCatCell.1 hNoCatCell.2.1 hNoCatCell.2.2.1 hNoCatCell.2.2.2.1 hNoCatCell.2.2.2.2
            have hNoCatInv := hT.2.2.2.2 hNoCatCell.1 hNoCatCell.2.1 hNoCatCell.2.2.1 hNoCatCell.2.2.2.1 hNoCatCell.2.2.2.2
            have hPresFwd := gateMode15_preserved_by_launcher cell a b pEmpty hMode hpEmpty (launch5 t) hNoCatFwd
            have hPresInv := gateMode15_preserved_by_launcher cell a b pEmpty hMode hpEmpty (launch5Inv t) hNoCatInv
            have hRB_fwd := write5_read_back q0 q1 q2 q3 pEmpty hL.1 hL.2.1 hL.2.2.1 hL.2.2.2.1
              hL.2.2.2.2.1 hL.2.2.2.2.2.1 hL.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.2.2.1
              (launch5 t) cell
            have hRB_inv := write5_read_back q0 q1 q2 q3 pEmpty hL.1 hL.2.1 hL.2.2.1 hL.2.2.2.1
              hL.2.2.2.2.1 hL.2.2.2.2.2.1 hL.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.2.2.1
              (launch5Inv t) cell
            cases fwd
            · simp only [localStrong15, localStrong15Inv, hMode, hPresInv.1, hPresInv.2, hr0, hr4, hpEmpty, ↓reduceIte]
              change write5 q0 q1 q2 q3 pEmpty
                (launch5 (write5 q0 q1 q2 q3 pEmpty (launch5Inv t) cell q0,
                          write5 q0 q1 q2 q3 pEmpty (launch5Inv t) cell q1,
                          write5 q0 q1 q2 q3 pEmpty (launch5Inv t) cell q2,
                          write5 q0 q1 q2 q3 pEmpty (launch5Inv t) cell q3,
                          write5 q0 q1 q2 q3 pEmpty (launch5Inv t) cell pEmpty))
                (write5 q0 q1 q2 q3 pEmpty (launch5Inv t) cell) = cell
              rw [hRB_inv.1, hRB_inv.2.1, hRB_inv.2.2.1, hRB_inv.2.2.2.1, hRB_inv.2.2.2.2,
                  write5_overwrite, hT.2.1, write5_self]
            · simp only [localStrong15, localStrong15Inv, hMode, hPresFwd.1, hPresFwd.2, hr0, hr4, hpEmpty, ↓reduceIte]
              change write5 q0 q1 q2 q3 pEmpty
                (launch5Inv (write5 q0 q1 q2 q3 pEmpty (launch5 t) cell q0,
                             write5 q0 q1 q2 q3 pEmpty (launch5 t) cell q1,
                             write5 q0 q1 q2 q3 pEmpty (launch5 t) cell q2,
                             write5 q0 q1 q2 q3 pEmpty (launch5 t) cell q3,
                             write5 q0 q1 q2 q3 pEmpty (launch5 t) cell pEmpty))
                (write5 q0 q1 q2 q3 pEmpty (launch5 t) cell) = cell
              rw [hRB_fwd.1, hRB_fwd.2.1, hRB_fwd.2.2.1, hRB_fwd.2.2.2.1, hRB_fwd.2.2.2.2,
                  write5_overwrite, hT.1, write5_self]
        · by_cases hQOnly : allPred24 (fun i => !isInQ a b i || (cell i == .empty || cell i == .P)) = true
          · cases hpBar : uniquePred24 (fun i => isInP a b i && (cell i == .rotR)) with
            | none =>
              cases fwd <;> simp only [localStrong15, localStrong15Inv, hMode, hr0, hr4, hr3, hQOnly, hpBar, ↓reduceIte]
            | some pBar =>
              cases hqIn : uniquePred24 (fun i => isInQ a b i && (cell i == .P)) with
              | none =>
                cases fwd <;> simp only [localStrong15, localStrong15Inv, hMode, hr0, hr4, hr3, hQOnly, hpBar, hqIn, ↓reduceIte]
              | some qIn =>
                by_cases hPerp : isPerpQ a b pBar qIn = true
                · obtain ⟨hQ, hQInv, hP, hPInv, hOut, hOutInv⟩ := rotQPEquiv_invariants a b
                  have hM1 := gateMode15_preserved_by_QP_equiv cell a b r hMode (rotQPEquiv a b).symm hQInv hPInv hOutInv
                  have hM2 := gateMode15_preserved_by_QP_equiv cell a b r hMode (rotQPEquiv a b) hQ hP hOut
                  have hQO1 : allPred24 (fun i => !isInQ a b i || (cell ((rotQPEquiv a b).symm i) == .empty || cell ((rotQPEquiv a b).symm i) == .P)) = true := by
                    rw [allPred24_congr _ (fun i => !isInQ a b ((rotQPEquiv a b).symm i) ||
                        (cell ((rotQPEquiv a b).symm i) == .empty || cell ((rotQPEquiv a b).symm i) == .P)) (fun i => by rw [hQInv]),
                        allPred24_comp_equiv (rotQPEquiv a b).symm]; exact hQOnly
                  have hQO2 : allPred24 (fun i => !isInQ a b i || (cell (rotQPEquiv a b i) == .empty || cell (rotQPEquiv a b i) == .P)) = true := by
                    rw [allPred24_congr _ (fun i => !isInQ a b (rotQPEquiv a b i) ||
                        (cell (rotQPEquiv a b i) == .empty || cell (rotQPEquiv a b i) == .P)) (fun i => by rw [hQ]),
                        allPred24_comp_equiv (rotQPEquiv a b)]; exact hQOnly
                  have hP1 : uniquePred24 (fun i => isInP a b i && (cell ((rotQPEquiv a b).symm i) == .rotR)) =
                      some (rotQPEquiv a b pBar) := by
                    rw [uniquePred24_congr _ (fun i => isInP a b ((rotQPEquiv a b).symm i) &&
                        (cell ((rotQPEquiv a b).symm i) == .rotR)) (fun i => by rw [hPInv]),
                        uniquePred24_comp_equiv (rotQPEquiv a b), hpBar]; rfl
                  have hQ1 : uniquePred24 (fun i => isInQ a b i && (cell ((rotQPEquiv a b).symm i) == .P)) =
                      some (rotQPEquiv a b qIn) := by
                    rw [uniquePred24_congr _ (fun i => isInQ a b ((rotQPEquiv a b).symm i) &&
                        (cell ((rotQPEquiv a b).symm i) == .P)) (fun i => by rw [hQInv]),
                        uniquePred24_comp_equiv (rotQPEquiv a b), hqIn]; rfl
                  have hP2 : uniquePred24 (fun i => isInP a b i && (cell (rotQPEquiv a b i) == .rotR)) =
                      some ((rotQPEquiv a b).symm pBar) := by
                    rw [uniquePred24_congr _ (fun i => isInP a b (rotQPEquiv a b i) &&
                        (cell (rotQPEquiv a b i) == .rotR)) (fun i => by rw [hP]),
                        uniquePred24_comp_equiv (rotQPEquiv a b).symm, hpBar]; rfl
                  have hQ2 : uniquePred24 (fun i => isInQ a b i && (cell (rotQPEquiv a b i) == .P)) =
                      some ((rotQPEquiv a b).symm qIn) := by
                    rw [uniquePred24_congr _ (fun i => isInQ a b (rotQPEquiv a b i) &&
                        (cell (rotQPEquiv a b i) == .P)) (fun i => by rw [hQ]),
                        uniquePred24_comp_equiv (rotQPEquiv a b).symm, hqIn]; rfl
                  have hpInP : isInP a b pBar = true := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ pBar).mp hpBar).1).1
                  have hqInQ : isInQ a b qIn = true := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ qIn).mp hqIn).1).1
                  have hab : isOrthPair a b = true := by
                    unfold isPerpQ at hPerp; simp only [Bool.and_eq_true] at hPerp; exact hPerp.1.1.1
                  have hDisj := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hab).2.2
                  have hQP_p : rotQPEquiv a b pBar = rotP a b pBar := by
                    change rotQ a b (rotP a b pBar) = rotP a b pBar
                    have hp' : isInP a b (rotP a b pBar) = true := by rw [isInP_rotP]; exact hpInP
                    have hqf : isInQ a b (rotP a b pBar) = false := by
                      cases h : isInQ a b (rotP a b pBar) <;> [rfl; exact absurd ⟨h, hp'⟩ (hDisj _).2.2]
                    exact rotQ_outside a b _ hqf
                  have hQP_q : rotQPEquiv a b qIn = rotQ a b qIn := by
                    change rotQ a b (rotP a b qIn) = rotQ a b qIn
                    have hpf : isInP a b qIn = false := by
                      cases h : isInP a b qIn <;> [rfl; exact absurd ⟨hqInQ, h⟩ (hDisj qIn).2.2]
                    rw [rotP_outside a b qIn hpf]
                  have hPerp1 : isPerpQ a b (rotQPEquiv a b pBar) (rotQPEquiv a b qIn) = true := by
                    rw [hQP_p, hQP_q, isPerpQ_rot_preserved]; exact hPerp
                  have hQPs_p : (rotQPEquiv a b).symm pBar = rotPInv a b pBar := by
                    change rotPInv a b (rotQInv a b pBar) = rotPInv a b pBar
                    have hqf : isInQ a b pBar = false := by
                      cases h : isInQ a b pBar <;> [rfl; exact absurd ⟨h, hpInP⟩ (hDisj pBar).2.2]
                    have hQI : rotQInv a b pBar = pBar := by
                      unfold rotQInv; rw [rotQ_outside a b pBar hqf, rotQ_outside a b pBar hqf, rotQ_outside a b pBar hqf]
                    rw [hQI]
                  have hQPs_q : (rotQPEquiv a b).symm qIn = rotQInv a b qIn := by
                    rw [rotQP_symm_eq, rotQP_comm]
                    have hpf : isInP a b qIn = false := by
                      cases h : isInP a b qIn <;> [rfl; exact absurd ⟨hqInQ, h⟩ (hDisj qIn).2.2]
                    have hPI : rotPInv a b qIn = qIn := by
                      unfold rotPInv; rw [rotP_outside a b qIn hpf, rotP_outside a b qIn hpf, rotP_outside a b qIn hpf]
                    rw [hPI]
                  have hPerp2 : isPerpQ a b ((rotQPEquiv a b).symm pBar) ((rotQPEquiv a b).symm qIn) = true := by
                    rw [hQPs_p, hQPs_q, ← isPerpQ_rot_preserved a b (rotPInv a b pBar) (rotQInv a b qIn),
                        rotP_inv_right, rotQ_inv_right]; exact hPerp
                  cases fwd
                  · simp only [localStrong15, localStrong15Inv, hMode, hM2, hr0, hr4, hr3, hQOnly, hQO2,
                      hpBar, hqIn, hPerp, hP2, hQ2, hPerp2, ↓reduceIte]
                    funext i; exact congrArg cell ((rotQPEquiv a b).apply_symm_apply i)
                  · simp only [localStrong15, localStrong15Inv, hMode, hM1, hr0, hr4, hr3, hQOnly, hQO1,
                      hpBar, hqIn, hPerp, hP1, hQ1, hPerp1, ↓reduceIte]
                    funext i; exact congrArg cell ((rotQPEquiv a b).symm_apply_apply i)
                · have hPerpF : isPerpQ a b pBar qIn = false := Bool.eq_false_iff.mpr hPerp
                  obtain ⟨hQ, hP, hOut⟩ := rotQ2Equiv_invariants a b
                  have hM' := gateMode15_preserved_by_QP_equiv cell a b r hMode (rotQ2Equiv a b) hQ hP hOut
                  have hQO' : allPred24 (fun i => !isInQ a b i || (cell (rotQ2Equiv a b i) == .empty || cell (rotQ2Equiv a b i) == .P)) = true := by
                    rw [allPred24_congr _ (fun i => !isInQ a b (rotQ2Equiv a b i) ||
                        (cell (rotQ2Equiv a b i) == .empty || cell (rotQ2Equiv a b i) == .P)) (fun i => by rw [hQ]),
                        allPred24_comp_equiv (rotQ2Equiv a b)]; exact hQOnly
                  have hP' : uniquePred24 (fun i => isInP a b i && (cell (rotQ2Equiv a b i) == .rotR)) =
                      some ((rotQ2Equiv a b).symm pBar) := by
                    rw [uniquePred24_congr _ (fun i => isInP a b (rotQ2Equiv a b i) &&
                        (cell (rotQ2Equiv a b i) == .rotR)) (fun i => by rw [hP]),
                        uniquePred24_comp_equiv (rotQ2Equiv a b).symm, hpBar]; rfl
                  have hQ' : uniquePred24 (fun i => isInQ a b i && (cell (rotQ2Equiv a b i) == .P)) =
                      some ((rotQ2Equiv a b).symm qIn) := by
                    rw [uniquePred24_congr _ (fun i => isInQ a b (rotQ2Equiv a b i) &&
                        (cell (rotQ2Equiv a b i) == .P)) (fun i => by rw [hQ]),
                        uniquePred24_comp_equiv (rotQ2Equiv a b).symm, hqIn]; rfl
                  have hpInP : isInP a b pBar = true := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ pBar).mp hpBar).1).1
                  have hPFix : (rotQ2Equiv a b).symm pBar = pBar := by
                    change rotQ a b (rotQ a b pBar) = pBar
                    by_cases hab : isOrthPair a b = true
                    · have hD := (thm_wf4plus_orth_pair_orbit_and_c4_stabilizer.2.2.2.2 a b hab).2.2
                      have hqf : isInQ a b pBar = false := by
                        cases h : isInQ a b pBar <;> [rfl; exact absurd ⟨h, hpInP⟩ (hD pBar).2.2]
                      rw [rotQ_outside a b pBar hqf, rotQ_outside a b pBar hqf]
                    · simp [rotQ, Bool.eq_false_iff.mpr hab]
                  have hPerp' : isPerpQ a b ((rotQ2Equiv a b).symm pBar) ((rotQ2Equiv a b).symm qIn) = false := by
                    rw [hPFix]; change isPerpQ a b pBar (rotQ a b (rotQ a b qIn)) = false
                    rw [isPerpQ_rotQ2_preserved]; exact hPerpF
                  cases fwd <;>
                    simp only [localStrong15, localStrong15Inv, hMode, hM', hr0, hr4, hr3, hQOnly, hQO',
                      hpBar, hqIn, hPerpF, hP', hQ', hPerp', Bool.false_eq_true, ↓reduceIte] <;>
                    (funext i; exact congrArg cell (rotQ2_invol a b i))
          · have hQOF : allPred24 (fun i => !isInQ a b i || (cell i == .empty || cell i == .P)) = false :=
              Bool.eq_false_iff.mpr hQOnly
            cases fwd <;> simp only [localStrong15, localStrong15Inv, hMode, hr0, hr4, hr3, hQOF, Bool.false_eq_true, ↓reduceIte]

/-- **Headline Theorem 5 (15-Symbol Strong Universality: `S_exch` Ray Counter, `3-R` Launcher & Unified Bijection):**
    Universally across ALL `cell : Fin 24 → Sym15`:
    1. Exact `225`-pair bijection, reflection symmetry, catalyst invariance, and occupation conservation of `lineRev12_exch`.
    2. Exact `11`-state (`3 + 3 + 3 + 2`) bijection and occupation conservation of `launch5` on all `Sym15^5`.
    3. Exact two-sided bijection `localStrong15Inv (localStrong15 cell) = cell` and
       `localStrong15 (localStrong15Inv cell) = cell`.
    4. Unconditional global `W(F_4)^+`-equivariance for all `576` proper rotations `g` (`wf4Det g = 1`).
    5. Exact total occupied-port count conservation `countOcc15 (localStrong15 cell) = countOcc15 cell`.
    6. Quiescent stationarity `localStrong15 (fun _ => .empty) = fun _ => .empty`. -/
theorem thm_strong15_launcher_and_unified_bijection :
    (∀ a b : Sym15, lineRev12_exchInv (lineRev12_exch (a, b)) = (a, b) ∧
                    lineRev12_exch (lineRev12_exchInv (a, b)) = (a, b) ∧
                    lineRev12_exch (b, a) = ((lineRev12_exch (a, b)).2, (lineRev12_exch (a, b)).1) ∧
                    occ15 (lineRev12_exch (a, b)).1 + occ15 (lineRev12_exch (a, b)).2 = occ15 a + occ15 b) ∧
    (∀ t : Sym15 × Sym15 × Sym15 × Sym15 × Sym15,
      launch5Inv (launch5 t) = t ∧ launch5 (launch5Inv t) = t ∧
      (let u := launch5 t
       occ15 u.1 + occ15 u.2.1 + occ15 u.2.2.1 + occ15 u.2.2.2.1 + occ15 u.2.2.2.2 =
         occ15 t.1 + occ15 t.2.1 + occ15 t.2.2.1 + occ15 t.2.2.2.1 + occ15 t.2.2.2.2)) ∧
    (∀ cell : Fin 24 → Sym15, localStrong15Inv (localStrong15 cell) = cell) ∧
    (∀ cell : Fin 24 → Sym15, localStrong15 (localStrong15Inv cell) = cell) ∧
    (∀ (g : WF4Elem), wf4Det g = 1 → ∀ cell : Fin 24 → Sym15,
      actSym15 g (localStrong15 cell) = localStrong15 (actSym15 g cell)) ∧
    (∀ cell : Fin 24 → Sym15, countOcc15 (localStrong15 cell) = countOcc15 cell) ∧
    (localStrong15 (fun _ => .empty) = fun _ => .empty) := by
  refine ⟨fun a b => ⟨lineRev12_exch_all_laws.1 a b, lineRev12_exch_all_laws.2.1 a b,
                      lineRev12_exch_all_laws.2.2.1 a b, lineRev12_exch_all_laws.2.2.2.2.1 a b⟩,
          fun t => ⟨(launch5_laws t).1, (launch5_laws t).2.1, (launch5_laws t).2.2.1⟩,
          fun cell => strong15_step_inv true cell,
          fun cell => strong15_step_inv false cell, ?_, ?_, ?_⟩
  · intro g hg cell
    have hM := gateMode15_equivariant g cell
    cases hMode : gateMode15 cell with
    | none =>
      rw [hMode] at hM
      simp only [localStrong15, hMode, hM, Option.map_none]
      exact bgStep15_equivariant g cell
    | some abr =>
      rcases abr with ⟨a, b, r⟩
      rw [hMode] at hM
      simp only [Option.map_some] at hM
      have hRotQ2Inv : ∀ i : Fin 24, wf4PermInv g (rotQ (wf4Perm g a) (wf4Perm g b) (rotQ (wf4Perm g a) (wf4Perm g b) i)) =
          rotQ a b (rotQ a b (wf4PermInv g i)) := fun i => by
        apply (wf4Equiv g).injective
        change wf4Perm g (wf4PermInv g _) = wf4Perm g (rotQ a b (rotQ a b (wf4PermInv g i)))
        rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2,
            rotQ_equivariant g hg, rotQ_equivariant g hg,
            ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 i).2]
      have hRotQInv : ∀ i : Fin 24, wf4PermInv g (rotQInv (wf4Perm g a) (wf4Perm g b) i) =
          rotQInv a b (wf4PermInv g i) := fun i => by
        apply (wf4Equiv g).injective
        change wf4Perm g (wf4PermInv g _) = wf4Perm g (rotQInv a b (wf4PermInv g i))
        rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2,
            rotQInv_equivariant g hg, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 i).2]
      have hRotPInv : ∀ i : Fin 24, wf4PermInv g (rotPInv (wf4Perm g a) (wf4Perm g b) i) =
          rotPInv a b (wf4PermInv g i) := fun i => by
        apply (wf4Equiv g).injective
        change wf4Perm g (wf4PermInv g _) = wf4Perm g (rotPInv a b (wf4PermInv g i))
        rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 _).2,
            rotPInv_equivariant g hg, ((thm_wf4_action_orthogonal_and_bijective g).2.2.1 i).2]
      by_cases hr0 : r = 0
      · simp only [localStrong15, hMode, hM, hr0, ↓reduceIte]
        funext i; unfold actSym15 rotQ2Equiv; dsimp only; rw [hRotQ2Inv]
      · by_cases hr4 : r = 4
        · simp only [localStrong15, hMode, hM, hr0, hr4, ↓reduceIte]
          funext i; unfold actSym15 rotQEquiv; dsimp only; rw [hRotQInv]
        · by_cases hr3 : r = 3
          · have hPE : uniquePred24 (fun i => isInP (wf4Perm g a) (wf4Perm g b) i && !(actSym15 g cell i == .rotR)) =
                (uniquePred24 (fun i => isInP a b i && !(cell i == .rotR))).map (wf4Perm g) := by
              rw [uniquePred24_congr _ (fun i => isInP a b ((wf4Equiv g).symm i) && !(cell ((wf4Equiv g).symm i) == .rotR)) (fun i => by
                have := isInP_wf4 g a b ((wf4Equiv g).symm i)
                simpa [actSym15] using congrArg (fun x => x && !(cell (wf4PermInv g i) == .rotR)) this)]
              exact uniquePred24_comp_equiv (wf4Equiv g) _
            simp only [localStrong15, hMode, hM, hr0, hr4, hr3, hPE, ↓reduceIte]
            cases uniquePred24 (fun i => isInP a b i && !(cell i == .rotR)) with
            | none => rfl
            | some pEmpty =>
              simp only [Option.map_some]
              have hq0 : qNorth (wf4Perm g a) (wf4Perm g b) (wf4Perm g pEmpty) = wf4Perm g (qNorth a b pEmpty) :=
                (qNorth_equivariant g hg a b pEmpty).symm
              have hq1 : rotQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g (qNorth a b pEmpty)) =
                  wf4Perm g (rotQ a b (qNorth a b pEmpty)) := (rotQ_equivariant g hg _ _ _).symm
              have hq2 : rotQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g (rotQ a b (qNorth a b pEmpty))) =
                  wf4Perm g (rotQ a b (rotQ a b (qNorth a b pEmpty))) := (rotQ_equivariant g hg _ _ _).symm
              have hq3 : rotQ (wf4Perm g a) (wf4Perm g b) (wf4Perm g (rotQ a b (rotQ a b (qNorth a b pEmpty)))) =
                  wf4Perm g (rotQ a b (rotQ a b (rotQ a b (qNorth a b pEmpty)))) := (rotQ_equivariant g hg _ _ _).symm
              have hAct : ∀ x : Fin 24, actSym15 g cell (wf4Perm g x) = cell x := fun x => by
                unfold actSym15; rw [((thm_wf4_action_orthogonal_and_bijective g).2.2.1 x).1]
              rw [hq0, hq1, hq2, hq3, hAct, hAct, hAct, hAct, hAct, write5_actSym15]
          · have hQO : allPred24 (fun i => !isInQ (wf4Perm g a) (wf4Perm g b) i ||
                (actSym15 g cell i == .empty || actSym15 g cell i == .P)) =
                allPred24 (fun i => !isInQ a b i || (cell i == .empty || cell i == .P)) := by
              rw [allPred24_congr _ (fun i => !isInQ a b ((wf4Equiv g).symm i) ||
                  (cell ((wf4Equiv g).symm i) == .empty || cell ((wf4Equiv g).symm i) == .P)) (fun i => by
                have := isInQ_wf4 g a b ((wf4Equiv g).symm i)
                simpa [actSym15] using congrArg (fun x => !x || (cell (wf4PermInv g i) == .empty || cell (wf4PermInv g i) == .P)) this)]
              exact allPred24_comp_equiv (wf4Equiv g).symm _
            have hP : uniquePred24 (fun i => isInP (wf4Perm g a) (wf4Perm g b) i && (actSym15 g cell i == .rotR)) =
                (uniquePred24 (fun i => isInP a b i && (cell i == .rotR))).map (wf4Perm g) := by
              rw [uniquePred24_congr _ (fun i => isInP a b ((wf4Equiv g).symm i) && (cell ((wf4Equiv g).symm i) == .rotR)) (fun i => by
                have := isInP_wf4 g a b ((wf4Equiv g).symm i)
                simpa [actSym15] using congrArg (fun x => x && (cell (wf4PermInv g i) == .rotR)) this)]
              exact uniquePred24_comp_equiv (wf4Equiv g) _
            have hQ : uniquePred24 (fun i => isInQ (wf4Perm g a) (wf4Perm g b) i && (actSym15 g cell i == .P)) =
                (uniquePred24 (fun i => isInQ a b i && (cell i == .P))).map (wf4Perm g) := by
              rw [uniquePred24_congr _ (fun i => isInQ a b ((wf4Equiv g).symm i) && (cell ((wf4Equiv g).symm i) == .P)) (fun i => by
                have := isInQ_wf4 g a b ((wf4Equiv g).symm i)
                simpa [actSym15] using congrArg (fun x => x && (cell (wf4PermInv g i) == .P)) this)]
              exact uniquePred24_comp_equiv (wf4Equiv g) _
            simp only [localStrong15, hMode, hM, hr0, hr4, hr3, hQO, hP, hQ, ↓reduceIte]
            split_ifs
            · cases uniquePred24 (fun i => isInP a b i && (cell i == .rotR)) with
              | none => rfl
              | some pBar =>
                cases uniquePred24 (fun i => isInQ a b i && (cell i == .P)) with
                | none => rfl
                | some qIn =>
                  simp only [Option.map_some, isPerpQ_equivariant g hg]
                  split_ifs
                  · funext i; unfold actSym15; rw [rotQP_symm_eq, rotQP_symm_eq, hRotPInv, hRotQInv]
                  · funext i; unfold actSym15 rotQ2Equiv; dsimp only; rw [hRotQ2Inv]
            · rfl
  · intro cell
    cases hMode : gateMode15 cell with
    | none =>
      simp only [localStrong15, hMode]; exact bgStep15_countOcc15 cell
    | some abr =>
      rcases abr with ⟨a, b, r⟩
      simp only [localStrong15, hMode]
      split_ifs with hr0 hr4 hr3
      · unfold countOcc15; exact Equiv.sum_comp (rotQ2Equiv a b).symm (fun i => occ15 (cell i))
      · unfold countOcc15; exact Equiv.sum_comp (rotQEquiv a b).symm (fun i => occ15 (cell i))
      · cases hpEmpty : uniquePred24 (fun i => isInP a b i && !(cell i == .rotR)) with
        | none => rfl
        | some pEmpty =>
          have hOrth : isOrthPair a b = true := by
            unfold gateMode15 at hMode
            cases hA : uniquePred24 (fun i => cell i == .ancA) with
            | none => rw [hA] at hMode; exact Option.noConfusion hMode
            | some a0 =>
              cases hB : uniquePred24 (fun i => cell i == .ancB) with
              | none => rw [hA, hB] at hMode; exact Option.noConfusion hMode
              | some b0 =>
                rw [hA, hB] at hMode
                split_ifs at hMode with hC
                · simp only [Option.some.injEq, Prod.mk.injEq] at hMode
                  rcases hMode with ⟨rfl, rfl, _⟩; exact (Bool.and_eq_true _ _).mp hC |>.1
                · simp only [Option.some.injEq, Prod.mk.injEq] at hMode
                  rcases hMode with ⟨rfl, rfl, _⟩; exact (Bool.and_eq_true _ _).mp hC |>.1
          have hpInP : isInP a b pEmpty = true := ((Bool.and_eq_true _ _).mp ((uniquePred24_eq_some_iff _ pEmpty).mp hpEmpty).1).1
          have hL := launcher_ports_distinct a b pEmpty hOrth hpInP
          exact write5_countOcc15 _ _ _ _ pEmpty hL.1 hL.2.1 hL.2.2.1 hL.2.2.2.1
            hL.2.2.2.2.1 hL.2.2.2.2.2.1 hL.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.2.1 hL.2.2.2.2.2.2.2.2.2.1
            _ cell (launch5_laws _).2.2.1
      · split_ifs
        · cases uniquePred24 (fun i => isInP a b i && (cell i == .rotR)) with
          | none => rfl
          | some pBar =>
            cases uniquePred24 (fun i => isInQ a b i && (cell i == .P)) with
            | none => rfl
            | some qIn =>
              split_ifs
              · unfold countOcc15; exact Equiv.sum_comp (rotQPEquiv a b).symm (fun i => occ15 (cell i))
              · unfold countOcc15; exact Equiv.sum_comp (rotQ2Equiv a b).symm (fun i => occ15 (cell i))
        · rfl
  · have hNone : gateMode15 (fun _ => .empty) = none := by decide
    funext s
    simp [localStrong15, hNone, bgStep15, lineRev12_exch, lineRev12Geo, isCat15]


/-! ## Section 7: Theorem 6 — Horosphere Flat `ℤ^2` Commutation & Global Coxeter Partitioned CA Bijection -/

/-- Exact 6 cusp-layer facets `L_cusp = {0, 1, 4, 5, 8, 9}` fixing `cuspVertex` in `{3,4,3,4}`. -/
def cuspLayerFacets : List (Fin 24) :=
  [⟨0, by decide⟩, ⟨1, by decide⟩, ⟨4, by decide⟩, ⟨5, by decide⟩, ⟨8, by decide⟩, ⟨9, by decide⟩]

/-- The 4 horosphere plane facets `{E+, E-, N+, N-} = Q(0, 1) = {4, 5, 8, 9} ⊂ L_cusp`. -/
def slotEPos : Fin 24 := ⟨4, by decide⟩
def slotENeg : Fin 24 := ⟨5, by decide⟩
def slotNPos : Fin 24 := ⟨8, by decide⟩
def slotNNeg : Fin 24 := ⟨9, by decide⟩

/-- Horosphere `ℤ^2` translations `T_E = F_{E+} F_{E-}` and `T_N = F_{N+} F_{N-}`. -/
def horoTransE : Mat5 := mat5Mul (facetRefl slotEPos) (facetRefl slotENeg)
def horoTransN : Mat5 := mat5Mul (facetRefl slotNPos) (facetRefl slotNNeg)

/-- Universal one-hop exchange stream `S_exch` on any involutive Coxeter neighbor step `step : W → Fin 24 → W`. -/
def streamExch {W α : Type} (step : W → Fin 24 → W) (cfg : W → Fin 24 → α) : W → Fin 24 → α :=
  fun w s => cfg (step w s) s

/-- Pointwise lift of a local cell transition `L : (Fin 24 → α) → (Fin 24 → α)` across all cells `w : W`. -/
def liftLocal {W α : Type} (L : (Fin 24 → α) → (Fin 24 → α)) (cfg : W → Fin 24 → α) : W → Fin 24 → α :=
  fun w => L (cfg w)

/-- Global Coxeter partitioned cellular automaton `U = S_exch ∘ L`. -/
def globalPCA {W α : Type} (step : W → Fin 24 → W) (L : (Fin 24 → α) → (Fin 24 → α)) :
    (W → Fin 24 → α) → (W → Fin 24 → α) :=
  fun cfg => streamExch step (liftLocal L cfg)

/-- Exact local radius-1 inverse `U_inv = L_inv ∘ S_exch` of `globalPCA`. -/
def globalPCAInv {W α : Type} (step : W → Fin 24 → W) (LInv : (Fin 24 → α) → (Fin 24 → α)) :
    (W → Fin 24 → α) → (W → Fin 24 → α) :=
  fun cfg => liftLocal LInv (streamExch step cfg)

/-- Concrete `{3,4,3,4}` Coxeter neighbor step `step w s = w * F_s` on `Mat5` (`O^+(4,1; ℤ[√2])`). -/
def coxeterStep (w : Mat5) (s : Fin 24) : Mat5 :=
  mat5Mul w (facetRefl s)

private theorem mat5_reflection_comm_of_orth (u v : Vec5) (huv : twiceForm u v = ZSqrt2.zero) :
    mat5Mul (reflectionIn u) (reflectionIn v) = mat5Mul (reflectionIn v) (reflectionIn u) := by
  have hSym : (Matrix.of twiceGram)ᵀ = Matrix.of twiceGram := by
    rw [← toMat5_transpose]; exact congrArg Matrix.of thm_coxeter_gram_and_center.1
  have hDotUV : dotProduct ((Matrix.of twiceGram).mulVec u) v = 0 := by
    rw [dotProduct_comm]
    change dotProduct v ((Matrix.of twiceGram).mulVec u) = 0
    have h1 : dotProduct v ((Matrix.of twiceGram).mulVec u) =
        dotProduct u ((Matrix.of twiceGram).mulVec v) := by
      rw [Matrix.dotProduct_mulVec, ← Matrix.mulVec_transpose, hSym, dotProduct_comm]
    rw [h1, ← mat5Vec_eq_mulVec, ← dot5_eq_dot]
    exact huv
  have hDotVU : dotProduct ((Matrix.of twiceGram).mulVec v) u = 0 := by
    rw [dotProduct_comm]
    change dotProduct u ((Matrix.of twiceGram).mulVec v) = 0
    rw [← mat5Vec_eq_mulVec, ← dot5_eq_dot]
    exact huv
  have hToRefl : ∀ n : Vec5,
      Matrix.of (reflectionIn n) = 1 - Matrix.vecMulVec n ((Matrix.of twiceGram).mulVec n) := fun n => by
    apply Matrix.ext; intro i j
    simp only [Matrix.of_apply, reflectionIn, mat5Vec_eq_mulVec, Matrix.sub_apply, Matrix.vecMulVec_apply,
      Matrix.one_apply, mat5Id]
    split_ifs <;> rfl
  apply Matrix.of.injective
  rw [toMat5_mul, toMat5_mul, hToRefl u, hToRefl v]
  set ru := (Matrix.of twiceGram).mulVec u
  set rv := (Matrix.of twiceGram).mulVec v
  have hProd : ∀ (a b ra rb : Vec5), dotProduct ra b = 0 →
      Matrix.vecMulVec a ra * Matrix.vecMulVec b rb = 0 := fun a b ra rb h0 => by
    apply Matrix.ext; intro i j
    simp only [Matrix.mul_apply, Matrix.vecMulVec_apply, Matrix.zero_apply]
    have hFac : ∑ k : Fin 5, a i * ra k * (b k * rb j) = a i * dotProduct ra b * rb j := by
      rw [dotProduct, Finset.mul_sum, Finset.sum_mul]
      exact Finset.sum_congr rfl fun k _ => by ring
    rw [hFac, h0]; ring
  rw [Matrix.mul_sub, Matrix.sub_mul, Matrix.sub_mul, one_mul, mul_one,
      hProd u v ru rv hDotUV, hProd v u rv ru hDotVU]
  abel

private theorem cusp_layer_fix_iff (a : Fin 24) :
    mat5Vec (facetRefl a) cuspVertex = cuspVertex ↔ a ∈ cuspLayerFacets := by
  have hZeroIff : ∀ x : Fin 24,
      (dot5 (facetNormal x) (twiceGramVecFast cuspVertex) == ZSqrt2.zero) = true ↔ x ∈ cuspLayerFacets := by
    decide
  have hAct : ∀ i : Fin 5,
      mat5Vec (facetRefl a) cuspVertex i =
        ZSqrt2.sub (cuspVertex i) (ZSqrt2.mul (facetNormal a i) (dot5 (facetNormal a) (twiceGramVecFast cuspVertex))) := by
    intro i
    rw [mat5Vec_eq_mulVec]
    have hToRefl : Matrix.of (facetRefl a) =
        1 - Matrix.vecMulVec (facetNormal a) ((Matrix.of twiceGram).mulVec (facetNormal a)) := by
      apply Matrix.ext; intro r c
      simp only [Matrix.of_apply, facetRefl, faceReflection, reflectionIn, mat5Vec_eq_mulVec,
        Matrix.sub_apply, Matrix.vecMulVec_apply, Matrix.one_apply, mat5Id]
      split_ifs <;> rfl
    rw [hToRefl, Matrix.sub_mulVec, Matrix.one_mulVec]
    change cuspVertex i - ∑ k : Fin 5, facetNormal a i * ((Matrix.of twiceGram).mulVec (facetNormal a) k) * cuspVertex k = _
    have hSym : (Matrix.of twiceGram)ᵀ = Matrix.of twiceGram := by
      rw [← toMat5_transpose]; exact congrArg Matrix.of thm_coxeter_gram_and_center.1
    have hDot : ∑ k : Fin 5, facetNormal a i * ((Matrix.of twiceGram).mulVec (facetNormal a) k) * cuspVertex k =
        facetNormal a i * dot5 (facetNormal a) (twiceGramVecFast cuspVertex) := by
      have h1 : ∑ k : Fin 5, facetNormal a i * ((Matrix.of twiceGram).mulVec (facetNormal a) k) * cuspVertex k =
          facetNormal a i * dotProduct ((Matrix.of twiceGram).mulVec (facetNormal a)) cuspVertex := by
        rw [dotProduct, Finset.mul_sum]; exact Finset.sum_congr rfl fun k _ => by ring
      rw [h1, dotProduct_comm, Matrix.dotProduct_mulVec, ← Matrix.mulVec_transpose, hSym,
          dotProduct_comm, ← mat5Vec_eq_mulVec, mat5Vec_twiceGram_eq_fast, ← dot5_eq_dot]
    rw [hDot]; rfl
  have hLast : ∀ x : Fin 24, facetNormal x ⟨4, by decide⟩ = ZSqrt2.one := by decide
  constructor
  · intro hFix
    have h4 := congrFun hFix ⟨4, by decide⟩
    rw [hAct ⟨4, by decide⟩, hLast a] at h4
    have hZ : dot5 (facetNormal a) (twiceGramVecFast cuspVertex) = ZSqrt2.zero := by
      have hSub : cuspVertex ⟨4, by decide⟩ - (1 : ZSqrt2) * dot5 (facetNormal a) (twiceGramVecFast cuspVertex) =
          cuspVertex ⟨4, by decide⟩ := h4
      have hEq0 : dot5 (facetNormal a) (twiceGramVecFast cuspVertex) = 0 := by
        have h1 : cuspVertex ⟨4, by decide⟩ - dot5 (facetNormal a) (twiceGramVecFast cuspVertex) =
            cuspVertex ⟨4, by decide⟩ := by simpa using hSub
        have h2 := congrArg (fun z : ZSqrt2 => cuspVertex ⟨4, by decide⟩ - z) h1
        simpa using h2
      exact hEq0
    exact (hZeroIff a).mp (by simp [hZ])
  · intro hMem
    have hZ : dot5 (facetNormal a) (twiceGramVecFast cuspVertex) = ZSqrt2.zero := by
      have := (hZeroIff a).mpr hMem; simpa using this
    funext i
    rw [hAct i, hZ]
    change cuspVertex i - facetNormal a i * 0 = cuspVertex i
    ring

private theorem facetRefl_invol (a : Fin 24) :
    mat5Mul (facetRefl a) (facetRefl a) = mat5Id :=
  thm_reflection_involution (facetNormal a) (thm_24_facets_geometry.2.2.1 a)

private theorem coxeterStep_invol (w : Mat5) (s : Fin 24) :
    coxeterStep (coxeterStep w s) s = w := by
  unfold coxeterStep
  apply Matrix.of.injective
  rw [toMat5_mul, toMat5_mul, Matrix.mul_assoc, ← toMat5_mul, facetRefl_invol, toMat5_id, mul_one]

/-- Abstract universal global bijection theorem for ANY Coxeter partitioned CA `U = S_exch ∘ L`
    with involutive neighbor step `step (step w s) s = w` and local bijection `(L, LInv)`. -/
theorem thm_global_pca_bijection {W α : Type}
    (step : W → Fin 24 → W) (L LInv : (Fin 24 → α) → (Fin 24 → α))
    (hStep : ∀ w s, step (step w s) s = w)
    (hL : ∀ c, LInv (L c) = c)
    (hR : ∀ c, L (LInv c) = c) :
    (∀ cfg, streamExch step (streamExch step cfg) = cfg) ∧
    (∀ cfg, globalPCAInv step LInv (globalPCA step L cfg) = cfg) ∧
    (∀ cfg, globalPCA step L (globalPCAInv step LInv cfg) = cfg) ∧
    Function.Bijective (globalPCA step L) := by
  have hS : ∀ cfg, streamExch step (streamExch step cfg) = cfg := fun cfg => by
    funext w s; unfold streamExch; rw [hStep w s]
  have hLeft : ∀ cfg, globalPCAInv step LInv (globalPCA step L cfg) = cfg := fun cfg => by
    unfold globalPCAInv globalPCA
    rw [hS]
    funext w; exact congrFun (hL (cfg w))
  have hRight : ∀ cfg, globalPCA step L (globalPCAInv step LInv cfg) = cfg := fun cfg => by
    unfold globalPCAInv globalPCA
    have hLift : liftLocal L (liftLocal LInv (streamExch step cfg)) = streamExch step cfg := by
      funext w; exact congrFun (hR (streamExch step cfg w))
    rw [hLift, hS]
  exact ⟨hS, hLeft, hRight,
    ⟨Function.LeftInverse.injective hLeft, Function.RightInverse.surjective hRight⟩⟩

/-- **Headline Theorem 6 (Horosphere Flat `ℤ^2` Commutation & Global Coxeter Partitioned CA Bijection):**
    1. Exactly the `6` cusp-layer facets `L_cusp = {0, 1, 4, 5, 8, 9}` fix `cuspVertex` in `O^+(4,1; ℤ[√2])`.
    2. Every facet reflection `F_a` (`a : Fin 24`) is involutive (`F_a * F_a = I_5`).
    3. The `4` horosphere plane reflections `{E+, E-, N+, N-} = Q(0, 1) = {4, 5, 8, 9}` satisfy exact
       `ℤ^2` commutation (`F_{E±} F_{N±} = F_{N±} F_{E±}`), and their horosphere translations
       `T_E = F_{E+} F_{E-}`, `T_N = F_{N+} F_{N-}` commute (`T_E T_N = T_N T_E`) and fix `cuspVertex`.
    4. For ANY cell index type `W`, ANY port alphabet `α`, ANY involutive neighbor step `step`, and
       ANY local bijection `(L, LInv)`, the global Coxeter partitioned CA `U = S_exch ∘ L` is a
       global bijection with exact local inverse `U_inv = L_inv ∘ S_exch`.
    5. Concrete instantiation to the infinite `{3,4,3,4}` Coxeter honeycomb (`coxeterStep w s = w * F_s`)
       certifying global bijectivity for BOTH `localUniv5` (`Sym5`) and `localStrong15` (`Sym15`). -/
theorem thm_horosphere_flat_z2_and_global_bijection :
    (∀ a : Fin 24, mat5Vec (facetRefl a) cuspVertex = cuspVertex ↔ a ∈ cuspLayerFacets) ∧
    (∀ a : Fin 24, mat5Mul (facetRefl a) (facetRefl a) = mat5Id) ∧
    (mat5Mul (facetRefl slotEPos) (facetRefl slotNPos) = mat5Mul (facetRefl slotNPos) (facetRefl slotEPos) ∧
     mat5Mul (facetRefl slotEPos) (facetRefl slotNNeg) = mat5Mul (facetRefl slotNNeg) (facetRefl slotEPos) ∧
     mat5Mul (facetRefl slotENeg) (facetRefl slotNPos) = mat5Mul (facetRefl slotNPos) (facetRefl slotENeg) ∧
     mat5Mul (facetRefl slotENeg) (facetRefl slotNNeg) = mat5Mul (facetRefl slotNNeg) (facetRefl slotENeg) ∧
     mat5Mul horoTransE horoTransN = mat5Mul horoTransN horoTransE ∧
     mat5Vec horoTransE cuspVertex = cuspVertex ∧
     mat5Vec horoTransN cuspVertex = cuspVertex) ∧
    (∀ (W α : Type) (step : W → Fin 24 → W) (L LInv : (Fin 24 → α) → (Fin 24 → α)),
      (∀ w s, step (step w s) s = w) →
      (∀ c, LInv (L c) = c) →
      (∀ c, L (LInv c) = c) →
      (∀ cfg, globalPCAInv step LInv (globalPCA step L cfg) = cfg) ∧
      (∀ cfg, globalPCA step L (globalPCAInv step LInv cfg) = cfg) ∧
      Function.Bijective (globalPCA step L)) ∧
    ((∀ cfg : Mat5 → Fin 24 → Sym5,
        globalPCAInv coxeterStep localUniv5Inv (globalPCA coxeterStep localUniv5 cfg) = cfg ∧
        globalPCA coxeterStep localUniv5 (globalPCAInv coxeterStep localUniv5Inv cfg) = cfg) ∧
     Function.Bijective (globalPCA coxeterStep localUniv5) ∧
     (∀ cfg : Mat5 → Fin 24 → Sym15,
        globalPCAInv coxeterStep localStrong15Inv (globalPCA coxeterStep localStrong15 cfg) = cfg ∧
        globalPCA coxeterStep localStrong15 (globalPCAInv coxeterStep localStrong15Inv cfg) = cfg) ∧
     Function.Bijective (globalPCA coxeterStep localStrong15)) := by
  have hOrthEPNP : twiceForm (facetNormal slotEPos) (facetNormal slotNPos) = ZSqrt2.zero := by decide
  have hOrthEPNN : twiceForm (facetNormal slotEPos) (facetNormal slotNNeg) = ZSqrt2.zero := by decide
  have hOrthENNP : twiceForm (facetNormal slotENeg) (facetNormal slotNPos) = ZSqrt2.zero := by decide
  have hOrthENNN : twiceForm (facetNormal slotENeg) (facetNormal slotNNeg) = ZSqrt2.zero := by decide
  have cEPNP := mat5_reflection_comm_of_orth _ _ hOrthEPNP
  have cEPNN := mat5_reflection_comm_of_orth _ _ hOrthEPNN
  have cENNP := mat5_reflection_comm_of_orth _ _ hOrthENNP
  have cENNN := mat5_reflection_comm_of_orth _ _ hOrthENNN
  have hTransComm : mat5Mul horoTransE horoTransN = mat5Mul horoTransN horoTransE := by
    apply Matrix.of.injective
    have m1 := congrArg Matrix.of cEPNP
    have m2 := congrArg Matrix.of cEPNN
    have m3 := congrArg Matrix.of cENNP
    have m4 := congrArg Matrix.of cENNN
    simp only [horoTransE, horoTransN, toMat5_mul] at m1 m2 m3 m4 ⊢
    set EP := Matrix.of (facetRefl slotEPos)
    set EN := Matrix.of (facetRefl slotENeg)
    set NP := Matrix.of (facetRefl slotNPos)
    set NN := Matrix.of (facetRefl slotNNeg)
    calc EP * EN * (NP * NN)
        = EP * (EN * NP) * NN := by simp only [mul_assoc]
      _ = EP * (NP * EN) * NN := by rw [m3]
      _ = (EP * NP) * (EN * NN) := by simp only [mul_assoc]
      _ = (NP * EP) * (NN * EN) := by rw [m1, m4]
      _ = NP * (EP * NN) * EN := by simp only [mul_assoc]
      _ = NP * (NN * EP) * EN := by rw [m2]
      _ = NP * NN * (EP * EN) := by simp only [mul_assoc]
  have hFixE : mat5Vec horoTransE cuspVertex = cuspVertex := by
    unfold horoTransE
    rw [mat5Vec_eq_mulVec, toMat5_mul, ← Matrix.mulVec_mulVec,
        ← mat5Vec_eq_mulVec, (cusp_layer_fix_iff slotENeg).mpr (by decide),
        ← mat5Vec_eq_mulVec, (cusp_layer_fix_iff slotEPos).mpr (by decide)]
  have hFixN : mat5Vec horoTransN cuspVertex = cuspVertex := by
    unfold horoTransN
    rw [mat5Vec_eq_mulVec, toMat5_mul, ← Matrix.mulVec_mulVec,
        ← mat5Vec_eq_mulVec, (cusp_layer_fix_iff slotNNeg).mpr (by decide),
        ← mat5Vec_eq_mulVec, (cusp_layer_fix_iff slotNPos).mpr (by decide)]
  have hU5 := thm_global_pca_bijection coxeterStep localUniv5 localUniv5Inv
    coxeterStep_invol thm_univ5_bijective_equivariant_conservative.1
    thm_univ5_bijective_equivariant_conservative.2.1
  have hU15 := thm_global_pca_bijection coxeterStep localStrong15 localStrong15Inv
    coxeterStep_invol thm_strong15_launcher_and_unified_bijection.2.2.1
    thm_strong15_launcher_and_unified_bijection.2.2.2.1
  refine ⟨cusp_layer_fix_iff, facetRefl_invol,
    ⟨cEPNP, cEPNN, cENNP, cENNN, hTransComm, hFixE, hFixN⟩,
    fun W α step L LInv hS hL hR => (thm_global_pca_bijection step L LInv hS hL hR).2,
    ⟨fun cfg => ⟨hU5.2.1 cfg, hU5.2.2.1 cfg⟩, hU5.2.2.2,
     fun cfg => ⟨hU15.2.1 cfg, hU15.2.2.1 cfg⟩, hU15.2.2.2⟩⟩

end Vibe

end
