module

public import Vibe.Algebra
public import Vibe.Geometry
public import Vibe.D4MassGap
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
# Vibe Theory: Sharp 4D `D_4` Lattice Mass-Gap Extensions (`Alt-x0+planes`, `SU(3)` Convex Hull & `K = 2` Peter-Weyl, `SU(2)` Chordal & 2-Link Wedge)

Lean `4.35.0` + Mathlib `v4.35.0` formalization of the exact **algebraic, graph-theoretic, representation-theoretic,
and spectral pillars** of Wave-3 Track W8 (`test/verify/d4-mass-gap-su2-su3-sharp.ts`, Milestone P9-A)
pushing the discrete 4D `D_4` Yang-Mills mass-gap window strictly beyond Wave-2 Track W6 (`Vibe.D4MassGap`)
and strictly beyond the 1D-axial single-link `SU(2)` chordal ceiling `4 / (4 + 4√7) ≈ 0.274291`.

## Honest Scope Boundary

- **Proved 100% unconditionally inside Lean 4.35.0's kernel (pure Lean core axioms only, zero `sorry`,
  zero `axiom`, zero `native_decide`, zero `unsafe`, zero `implemented_by`, zero heartbeat/recursion overrides):**
  1. Exact 4-direction alternating-plane spatial forest `Alt-x0+planes` on infinite `ℤ^4` / `D_4`:
     `Δx_0 = 0` on every frozen edge, exact `D_4` closure, exact `x_0 = 0` site-hyperplane reflection
     invariance `Θ(x_0, x_1, x_2, x_3) = (-x_0, x_1, x_2, x_3)`, disjoint infinite straight 1D lines
     with unique base-slab foliation `0 ≤ x · r ≤ 1`, and symbolic **unconditional acyclicity**
     (ZERO non-backtracking loops of ANY length `k ≥ 1` on infinite `ℤ^4` / `D_4`).
  2. Exact `88 × 88` periodic quotient coupling matrices `M88_0`, `M88_h`, `M88 = M88_0 + M88_h`
     on `MgeIdx88 = Fin 8 × Fin 11` derived directly from `d4Roots` and `mgeFrozenDirAt`: symmetry,
     zero diagonal, degree multiset `[14 × 48, 15 × 32, 16 × 8]`, exact universal-forest average
     degree `160/11`, and exact `4 × 4` geometric equitable quotient
     `Q_4 = [[0,8,4,2],[4,0,8,2],[2,8,4,1],[4,8,4,0]]`.
  3. Exact positive integer Collatz-Wielandt eigenvector witness on `M88` certifying
     `14568425 / 1000000 < Λ_Alt < 14568426 / 1000000 < 145685 / 10000 < 4 + 4√7`
     (both via cleared `(P - 4 Q)^2 < 112 Q^2` and via `ZSqrt7.lt`), plus full `88 × 88` matrix-power
     contraction and uniform finite-horizon geometric tail decay on time-tilted `1000 M88_0 + 1001 M88_h`
     (`e^{m/2} = 1001/1000 > 1`) at `β = 274292 / 1000000 > 4 / (4 + 4√7)`.
  4. Exact `SU(3)` staple convex-hull maximal-torus algebraic theorem (`cos u_1 + cos u_2 + cos u_3 ≤ 3 cos(φ/3)`
     for `u_1 + u_2 + u_3 = φ ∈ [-π, π]`) proved via a 2-branch unconstrained polynomial factorization over `ℤ`
     (lifting verbatim to `ℝ` with zero `Int`-domain collapse), exact Chebyshev triple-angle stationary-point
     comparison `3 cos(φ/3) - (-cos φ) = 4 cos^3(φ/3) ≥ 0`, exact 8-staple sum aggregation `≤ 24 cos(φ/3)`
     (`m_1 + m_2 + m_3 ≤ 8 β cos(φ/3)`), exact extreme 8-staple witness `4 I + 4 diag(-i, -i, -1)`,
     exact `SU(3)` deltoid trace-hull SOS `2 Re Tr(U) + 3 = (2 c_α + c_δ)^2 + s_δ^2 ≥ 0`, and exact
     Cardano depressed-cubic reduction for `H = W^† W`.
  5. Exact `SU(3)` Weyl dimension formula `d(p, q) = (p + 1)(q + 1)(p + q + 2) / 2` (exact all-`(p, q)`
     evenness), quadratic Casimir `3 C_2(p, q) = p^2 + q^2 + p q + 3 p + 3 q`, complete `K ≤ 2` irrep
     enumeration (`6` irreps, total Peter-Weyl matrix dimension `1 + 9 + 9 + 36 + 36 + 64 = 155`,
     exact Laplacian spectrum `0, 8/3, 6, 20/3`), **unconditional universal tail floor**
     `∀ p q : Nat, p + q ≥ 3 → 3 C_2(p, q) ≥ 16` (`λ = 2 C_2 ≥ 32/3`, sharp at `(2, 1)` and `(1, 2)`),
     universal `∀ p q` Clebsch-Gordan / Pieri dimension & Casimir trace sum rules for `3 ⊗ V(p, q)`
     and `3* ⊗ V(p, q)`, exact `K = 2` torus weight-sector decomposition `29 + 6·14 + 6·3 + 6·4 = 155`,
     and exact degree-2 Laplacian eigenmode identities.
  6. Exact `SU(2)` Region-3 Riccati→Poincaré polynomial factorization (`κ ≥ 4√7/3 < 3.53 → R(κ)/κ ≤ 3/16`,
     hence `S_ch ≤ 1/4`) and Region-1 small-`κ` parallel-variance expansion & drop-rate rational certificates,
     exact 2-link wedge `B = {R_1, R_2}` coverage `K_e = 1` across all `11` active directions and `11 × 11 → 2 × 2`
     block matrix reduction derived directly from `d4Roots`, concrete MG-6 contraction of the `11 × 11` wedge
     matrix at `β = 274292/1000000` and `β = 277274/1000000`, and exact zero-float `SU(2)` / `SU(3)`
     threshold brackets & breakthrough ratios (`SU(2)` `2.93×` BE / `29.70×` KP, `SU(3)` `2.57×` BE rounded / `58.53×` KP).
- **External analytic / measure-theoretic steps NOT formalized inside Lean (certified externally in
  `test/verify/d4-mass-gap-su2-su3-sharp.ts`):**
  1. Compact Lie groups `SU(2)`, `SU(3)`, Haar measure integration, Osterwalder-Seiler measure-theoretic
     reflection positivity and transfer-matrix mass-gap reconstruction, and infinite-lattice Dobrushin `W_1`
     uniqueness / covariance bounds.
  2. Continuous optimal-transport quantile coupling in `SU(2)` Region 1 (`[0, 0.35]`), monotonic box-interval
     arithmetic in Region 2 (`[0.35, 3.53]`), Bessel ODE Riccati inequality in Region 3 (`[3.53, ∞)`), and
     1D Holley-Stroock / Minkowski interval bounds for the 2-link wedge coupling `α_13(β)`.
  3. Complex polydisk Rouché/Cauchy Chebyshev-Schur `M_3(ℂ)` covariance supremum, 16-vertex operator-convexity
     Witten Laplacian Schur complement Cholesky certification for `SU(3)`, and coupling monotonicity on `Ω(β)`.

## 11 Substantive Headline Theorems (`thm_mge_*`)

1. `thm_mge_alt_x0_planes_forest_rp_and_acyclic`
2. `thm_mge_alt_x0_planes_quotient_M88_structure`
3. `thm_mge_alt_x0_planes_spectral_bound_and_contraction`
4. `thm_mge_su3_staple_convex_hull_algebraic`
5. `thm_mge_su3_maximal_torus_and_cardano_invariants`
6. `thm_mge_su3_weyl_dim_and_k2_casimir_spectrum`
7. `thm_mge_su3_pieri_branching_and_weight_sectors`
8. `thm_mge_su2_chordal_region1_and_region3_bounds`
9. `thm_mge_su2_wedge_coverage_and_block_matrix`
10. `thm_mge_su2_wedge_dobrushin_contraction`
11. `thm_mge_su2_and_su3_sharp_threshold_ratios`
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 0: Local Private Arithmetic, List, & `Fin 8 × Fin 11` Summation Helpers -/

/-- Exact `88`-class index space `Fin 8 × Fin 11` (`8` `D_4` site parity classes × `11` active directions). -/
abbrev MgeIdx88 := Fin 8 × Fin 11

def mgeListSum : List Nat → Nat
  | [] => 0
  | x :: xs => x + mgeListSum xs

private theorem mge_listSum_append (l1 l2 : List Nat) :
    mgeListSum (l1 ++ l2) = mgeListSum l1 + mgeListSum l2 := by
  induction l1 with
  | nil => simp only [List.nil_append, mgeListSum, Nat.zero_add]
  | cons a t ih => simp only [List.cons_append, mgeListSum, ih, Nat.add_assoc]

private theorem mge_listSum_map_const_mul {α : Type} (c : Nat) (f : α → Nat) (l : List α) :
    mgeListSum (l.map (fun x => c * f x)) = c * mgeListSum (l.map f) := by
  induction l with
  | nil => simp only [List.map_nil, mgeListSum, Nat.mul_zero]
  | cons a t ih => simp only [List.map_cons, mgeListSum, ih, Nat.mul_add]

private theorem mge_listSum_map_mul_const {α : Type} (f : α → Nat) (c : Nat) (l : List α) :
    mgeListSum (l.map (fun x => f x * c)) = mgeListSum (l.map f) * c := by
  induction l with
  | nil => simp only [List.map_nil, mgeListSum, Nat.zero_mul]
  | cons a t ih => simp only [List.map_cons, mgeListSum, ih, Nat.add_mul]

private theorem mge_listSum_map_zero {α : Type} (l : List α) :
    mgeListSum (l.map (fun _ => 0)) = 0 := by
  induction l with
  | nil => rfl
  | cons _ t ih => simp only [List.map_cons, mgeListSum, Nat.zero_add, ih]

private theorem mge_listSum_map_add {α : Type} (f g : α → Nat) (l : List α) :
    mgeListSum (l.map (fun x => f x + g x)) = mgeListSum (l.map f) + mgeListSum (l.map g) := by
  induction l with
  | nil => rfl
  | cons a t ih => simp only [List.map_cons, mgeListSum, ih]; omega

private theorem mge_listSum_map_le {α : Type} (f g : α → Nat) (l : List α)
    (hle : ∀ x ∈ l, f x ≤ g x) :
    mgeListSum (l.map f) ≤ mgeListSum (l.map g) := by
  induction l with
  | nil => exact Nat.le_refl 0
  | cons a t ih =>
    simp only [List.map_cons, mgeListSum]
    exact Nat.add_le_add (hle a (List.mem_cons_self ..))
      (ih (fun x hx => hle x (List.mem_cons_of_mem _ hx)))

private theorem mge_listSum_map_single_le {α : Type} (f : α → Nat) (l : List α) (a : α) (ha : a ∈ l) :
    f a ≤ mgeListSum (l.map f) := by
  induction l with
  | nil => cases ha
  | cons b t ih =>
    simp only [List.map_cons, mgeListSum]
    rcases List.mem_cons.mp ha with rfl | hIn
    · omega
    · have h := ih hIn; omega

private theorem mge_listSum_swap {α β : Type} (la : List α) (lb : List β) (F : α → β → Nat) :
    mgeListSum (la.map (fun a => mgeListSum (lb.map (fun b => F a b)))) =
      mgeListSum (lb.map (fun b => mgeListSum (la.map (fun a => F a b)))) := by
  induction la with
  | nil =>
    simp only [List.map_nil, mgeListSum]
    exact (mge_listSum_map_zero lb).symm
  | cons a t ih =>
    simp only [List.map_cons, mgeListSum, ih, ← mge_listSum_map_add]

private theorem mge_ite_true {α : Type} {c : Prop} [h : Decidable c] (hc : c) (a b : α) :
    (if c then a else b) = a :=
  match h with | isTrue _ => rfl | isFalse hnc => absurd hc hnc

private theorem mge_ite_false {α : Type} {c : Prop} [h : Decidable c] (hnc : ¬ c) (a b : α) :
    (if c then a else b) = b :=
  match h with | isTrue hc => absurd hc hnc | isFalse _ => rfl

private theorem mge_sumFinNat_eq_foldl_8 (f : Fin 8 → Nat) :
    sumFinNat f = (List.finRange 8).foldl (fun acc i => acc + f i) 0 := rfl

private theorem mge_sumFinNat_eq_foldl_11 (f : Fin 11 → Nat) :
    sumFinNat f = (List.finRange 11).foldl (fun acc i => acc + f i) 0 := rfl

private theorem mge_foldl_add_shift {α : Type} (f : α → Nat) (l : List α) (init : Nat) :
    l.foldl (fun acc x => acc + f x) init = init + l.foldl (fun acc x => acc + f x) 0 := by
  induction l generalizing init with
  | nil => simp only [List.foldl_nil, Nat.add_zero]
  | cons a t ih =>
    simp only [List.foldl_cons, Nat.zero_add]
    rw [ih (init + f a), ih (f a), Nat.add_assoc]

private theorem mge_foldl_eq_listSum {α : Type} (f : α → Nat) (l : List α) :
    l.foldl (fun acc x => acc + f x) 0 = mgeListSum (l.map f) := by
  induction l with
  | nil => rfl
  | cons a t ih =>
    simp only [List.foldl_cons, List.map_cons, mgeListSum, Nat.zero_add]
    rw [mge_foldl_add_shift, ih]

/-- Canonical `88`-element list of all `MgeIdx88 = Fin 8 × Fin 11` active link classes. -/
def mgeAll88 : List MgeIdx88 :=
  (List.finRange 8).flatMap (fun ci => (List.finRange 11).map (fun j => (ci, j)))

/-- Exact `88`-class sum over `MgeIdx88 = Fin 8 × Fin 11` (`8 × 11` block sum, depth `19`). -/
def mgeSum88 (f : MgeIdx88 → Nat) : Nat :=
  sumFinNat (fun ci : Fin 8 => sumFinNat (fun j : Fin 11 => f (ci, j)))

private theorem mge_listSum_flatMap {α β : Type} (la : List α) (g : α → List β) (f : β → Nat) :
    mgeListSum ((la.flatMap g).map f) = mgeListSum (la.map (fun a => mgeListSum ((g a).map f))) := by
  induction la with
  | nil => rfl
  | cons a t ih =>
    simp only [List.flatMap_cons, List.map_append, List.map_cons, mge_listSum_append, mgeListSum, ih]

private theorem mge_sum88_eq_listSum (f : MgeIdx88 → Nat) :
    mgeSum88 f = mgeListSum (mgeAll88.map f) := by
  unfold mgeSum88 mgeAll88
  rw [mge_sumFinNat_eq_foldl_8, mge_foldl_eq_listSum, mge_listSum_flatMap]
  congr 1; congr 1; funext ci
  rw [mge_sumFinNat_eq_foldl_11, mge_foldl_eq_listSum, List.map_map]
  rfl

private theorem mge_all88_nodup : mgeAll88.Nodup := by decide

private theorem mge_mem_all88 (u : MgeIdx88) : u ∈ mgeAll88 := by
  unfold mgeAll88
  rw [List.mem_flatMap]
  refine ⟨u.1, List.mem_finRange u.1, ?_⟩
  rw [List.mem_map]
  exact ⟨u.2, List.mem_finRange u.2, rfl⟩

private theorem mge_listSum_map_delta {α : Type} [DecidableEq α] (a : α) (f : α → Nat)
    (l : List α) (hNodup : l.Nodup) (hMem : a ∈ l) :
    mgeListSum (l.map (fun x => (if a = x then 1 else 0) * f x)) = f a := by
  induction l with
  | nil => cases hMem
  | cons b t ih =>
    simp only [List.map_cons, mgeListSum]
    have hNd : b ∉ t ∧ t.Nodup := List.nodup_cons.mp hNodup
    if hab : a = b then
      subst hab
      rw [mge_ite_true rfl, Nat.one_mul]
      have hZero : ∀ (xs : List α), (∀ x ∈ xs, a ≠ x) →
          mgeListSum (xs.map (fun x => (if a = x then 1 else 0) * f x)) = 0 := by
        intro xs
        induction xs with
        | nil => intro _; rfl
        | cons y ys ihy =>
          intro hy
          simp only [List.map_cons, mgeListSum]
          rw [mge_ite_false (hy y (List.mem_cons_self ..)), Nat.zero_mul, Nat.zero_add]
          exact ihy (fun z hz => hy z (List.mem_cons_of_mem _ hz))
      rw [hZero t (fun x hx hEq => hNd.1 (hEq ▸ hx)), Nat.add_zero]
    else
      rw [mge_ite_false hab, Nat.zero_mul, Nat.zero_add]
      have hMemT : a ∈ t := by
        rcases List.mem_cons.mp hMem with hEq | hIn
        · exact absurd hEq hab
        · exact hIn
      exact ih hNd.2 hMemT

private theorem mge_listSum_countP_mul {α : Type} [DecidableEq α]
    (dom : List α) (hNodup : dom.Nodup) (hDom : ∀ x : α, x ∈ dom)
    (L : List α) (f : α → Nat) :
    mgeListSum (dom.map (fun v => L.countP (fun x => x == v) * f v)) =
      mgeListSum (L.map f) := by
  induction L with
  | nil =>
    simp only [List.countP_nil, Nat.zero_mul, List.map_nil, mgeListSum]
    exact mge_listSum_map_zero dom
  | cons a tl ih =>
    have hEq : (fun v : α => (a :: tl).countP (fun x => x == v) * f v) =
        (fun v : α => (if a = v then 1 else 0) * f v + tl.countP (fun x => x == v) * f v) := by
      funext v
      simp only [List.countP_cons]
      by_cases h : a = v
      · subst h
        have hbt : (a == a) = true := beq_self_eq_true a
        rw [hbt, mge_ite_true (rfl : true = true), mge_ite_true (rfl : a = a), Nat.add_mul, Nat.one_mul]
        omega
      · have hbf : (a == v) = false := beq_false_of_ne h
        rw [hbf, mge_ite_false h, Nat.zero_mul, Nat.zero_add]
        simp only [Bool.false_eq_true, ite_false, Nat.add_zero]
    rw [hEq, mge_listSum_map_add, ih, mge_listSum_map_delta a f dom hNodup (hDom a)]
    rfl

private theorem mge_countP_pair_false {α : Type} [DecidableEq α] (L : List (α × Bool)) (v : α) :
    L.countP (fun p => p.1 == v && !p.2) =
      ((L.filter (fun p => !p.2)).map Prod.fst).countP (fun x => x == v) := by
  induction L with
  | nil => rfl
  | cons p tl ih =>
    rcases p with ⟨x, b⟩
    cases b with
    | false =>
      simp only [List.countP_cons, List.filter_cons, Bool.not_false, Bool.and_true, ite_true,
        List.map_cons, ih]
    | true =>
      simp only [List.countP_cons, List.filter_cons, Bool.not_true, Bool.and_false,
        Bool.false_eq_true, ite_false, Nat.add_zero, ih]

private theorem mge_countP_pair_true {α : Type} [DecidableEq α] (L : List (α × Bool)) (v : α) :
    L.countP (fun p => p.1 == v && p.2) =
      ((L.filter (fun p => p.2)).map Prod.fst).countP (fun x => x == v) := by
  induction L with
  | nil => rfl
  | cons p tl ih =>
    rcases p with ⟨x, b⟩
    cases b with
    | false =>
      simp only [List.countP_cons, List.filter_cons, Bool.and_false,
        Bool.false_eq_true, ite_false, Nat.add_zero, ih]
    | true =>
      simp only [List.countP_cons, List.filter_cons, Bool.and_true, ite_true,
        List.map_cons, ih]

private theorem mge_listSum_countP_pair_mul {α : Type} [DecidableEq α]
    (dom : List α) (hNodup : dom.Nodup) (hDom : ∀ x : α, x ∈ dom)
    (L : List (α × Bool)) (c0 ch : Nat) (f : α → Nat) :
    mgeListSum (dom.map (fun v =>
      (c0 * L.countP (fun p => p.1 == v && !p.2) + ch * L.countP (fun p => p.1 == v && p.2)) * f v)) =
      mgeListSum (L.map (fun p => (if p.2 then ch else c0) * f p.1)) := by
  have hSplit :
      (fun v : α =>
        (c0 * L.countP (fun p => p.1 == v && !p.2) + ch * L.countP (fun p => p.1 == v && p.2)) * f v) =
      (fun v : α =>
        c0 * (L.countP (fun p => p.1 == v && !p.2) * f v) +
        ch * (L.countP (fun p => p.1 == v && p.2) * f v)) := by
    funext v; rw [Nat.add_mul, Nat.mul_assoc, Nat.mul_assoc]
  rw [hSplit, mge_listSum_map_add, mge_listSum_map_const_mul, mge_listSum_map_const_mul]
  clear hSplit
  simp only [mge_countP_pair_false, mge_countP_pair_true]
  rw [mge_listSum_countP_mul dom hNodup hDom, mge_listSum_countP_mul dom hNodup hDom]
  induction L with
  | nil => simp only [List.filter_nil, List.map_nil, mgeListSum, Nat.mul_zero, Nat.add_zero]
  | cons p tl ih =>
    rcases p with ⟨x, b⟩
    cases b with
    | false =>
      simp only [List.filter_cons, Bool.not_false, Bool.false_eq_true, ite_true, ite_false,
        List.map_cons, mgeListSum, Nat.mul_add]
      rw [Nat.add_assoc, ih]
    | true =>
      simp only [List.filter_cons, Bool.not_true, Bool.false_eq_true, ite_true, ite_false,
        List.map_cons, mgeListSum, Nat.mul_add]
      rw [Nat.add_left_comm, ih]

private theorem mge_getD_map_aux {α β : Type} (f : α → β) (d : β) :
    ∀ (l : List α) (i : Nat) (h : i < l.length),
      (l.map f).getD i d = f l[i]
  | [], _, h => absurd h (Nat.not_lt_zero _)
  | _ :: _, 0, _ => rfl
  | _ :: tl, i + 1, h => mge_getD_map_aux f d tl i (Nat.lt_of_succ_lt_succ h)

private theorem mge_getD_map_finRange {n : Nat} {α : Type} (f : Fin n → α) (d : α) (u : Fin n) :
    ((List.finRange n).map f).getD u.val d = f u := by
  have hLen : u.val < (List.finRange n).length := by
    rw [List.length_finRange]; exact u.isLt
  rw [mge_getD_map_aux f d (List.finRange n) u.val hLen, List.getElem_finRange]
  exact congrArg f (Fin.ext rfl)

private theorem mge_int_abs_le_of_sq_le {a D : Int} (hD : 0 ≤ D) (hsq : a * a ≤ D * D) :
    -D ≤ a ∧ a ≤ D := ⟨by nlinarith, by nlinarith⟩

private theorem mge_int_cauchy_schwarz_2d (a b c d : Int) :
    (a * c + b * d) * (a * c + b * d) + (a * d - b * c) * (a * d - b * c) =
      (a * a + b * b) * (c * c + d * d) := by ring

private theorem mge_nat_half_slab :
    ∀ m : Nat, ∃ n : Int, 0 ≤ Int.ofNat m - 2 * n ∧ Int.ofNat m - 2 * n ≤ 1
  | 0 => ⟨0, by decide, by decide⟩
  | 1 => ⟨0, by decide, by decide⟩
  | m + 2 =>
    let ⟨n, h0, h1⟩ := mge_nat_half_slab m
    have hStep : Int.ofNat (m + 2) = Int.ofNat m + 2 := rfl
    ⟨n + 1, by rw [hStep]; omega, by rw [hStep]; omega⟩

private theorem mge_negSucc_half_slab :
    ∀ m : Nat, ∃ n : Int, 0 ≤ Int.negSucc m - 2 * n ∧ Int.negSucc m - 2 * n ≤ 1
  | 0 => ⟨-1, by decide, by decide⟩
  | 1 => ⟨-1, by decide, by decide⟩
  | m + 2 =>
    let ⟨n, h0, h1⟩ := mge_negSucc_half_slab m
    have hStep : Int.negSucc (m + 2) = Int.negSucc m - 2 := by omega
    ⟨n - 1, by rw [hStep]; omega, by rw [hStep]; omega⟩

private theorem mge_int_half_floor_slab (s : Int) : ∃ n : Int, 0 ≤ s - 2 * n ∧ s - 2 * n ≤ 1 := by
  cases s with
  | ofNat m => exact mge_nat_half_slab m
  | negSucc m => exact mge_negSucc_half_slab m

private theorem mge_sumNat_mul_left (m c : Nat) (f : Nat → Nat) :
    sumNat m (fun j => c * f j) = c * sumNat m f := by
  induction m with
  | zero => simp only [sumNat, Nat.mul_zero]
  | succ k ih => simp only [sumNat, ih, Nat.mul_add]

private theorem mge_sumNat_mul_right (m : Nat) (f : Nat → Nat) (c : Nat) :
    sumNat m (fun j => f j * c) = sumNat m f * c := by
  induction m with
  | zero => simp only [sumNat, Nat.zero_mul]
  | succ k ih => simp only [sumNat, ih, Nat.add_mul]

private theorem mge_sumNat_le (m : Nat) (f g : Nat → Nat) (hle : ∀ j : Nat, j < m → f j ≤ g j) :
    sumNat m f ≤ sumNat m g := by
  induction m with
  | zero => exact Nat.le_refl 0
  | succ k ih =>
    simp only [sumNat]
    exact Nat.add_le_add (ih (fun j hj => hle j (by omega))) (hle k (by omega))

private theorem mge_nat_mul_pow (a b n : Nat) : (a * b) ^ n = a ^ n * b ^ n := by
  induction n with
  | zero => simp only [Nat.pow_zero, Nat.mul_one]
  | succ k ih => rw [Nat.pow_succ, ih, Nat.pow_succ a k, Nat.pow_succ b k]; ac_rfl


/-! ## Section 1: Exact 4-Direction `Alt-x0+planes` Spatial Forest (`x_0 = 0` RP & Acyclicity) -/

/-- Membership predicate for the 4D `D_4` lattice `{x ∈ ℤ^4 : x_0 + x_1 + x_2 + x_3 ≡ 0 (mod 2)}`. -/
def mgeInD4 (x : Vec4) : Prop :=
  (x.1 + x.2.1 + x.2.2.1 + x.2.2.2) % 2 = 0

/-- Exact 4-direction `Alt-x0+planes` frozen positive root index (`Fin 12`) at ANY site `x ∈ ℤ^4`:
    - `x_0` even, `x_1` even → `10` (`(0, 0, 1, 1)`)
    - `x_0` even, `x_1` odd  → `11` (`(0, 0, 1, -1)`)
    - `x_0` odd,  `x_2` even → `8`  (`(0, 1, 0, 1)`)
    - `x_0` odd,  `x_2` odd  → `9`  (`(0, 1, 0, -1)`). -/
def mgeFrozenDirAt (x : Vec4) : Fin 12 :=
  if x.1 % 2 == 0 then
    if x.2.1 % 2 == 0 then ⟨10, by decide⟩ else ⟨11, by decide⟩
  else
    if x.2.2.1 % 2 == 0 then ⟨8, by decide⟩ else ⟨9, by decide⟩

/-- Exact frozen spatial root vector `r_frozen(x) ∈ D_4` at site `x ∈ ℤ^4`. -/
def mgeFrozenRootAt (x : Vec4) : Vec4 :=
  mgPosRoot (mgeFrozenDirAt x)

/-- Exact 3-component transverse fiber invariant constant along the frozen straight 1D line through `x`. -/
def mgeFrozenFiberAt (x : Vec4) : Int × Int × Int :=
  if x.1 % 2 == 0 then
    if x.2.1 % 2 == 0 then (x.1, x.2.1, x.2.2.1 - x.2.2.2)
    else (x.1, x.2.1, x.2.2.1 + x.2.2.2)
  else
    if x.2.2.1 % 2 == 0 then (x.1, x.2.2.1, x.2.1 - x.2.2.2)
    else (x.1, x.2.2.1, x.2.1 + x.2.2.2)

/-- Exact line-height coordinate `x · r_frozen(x)` along the frozen 1D line through `x`. -/
def mgeFrozenHeightAt (x : Vec4) : Int :=
  dot4 x (mgeFrozenRootAt x)

/-- Frozen-forest edge step relation on `ℤ^4`: `v - u = ± r_frozen(u)`. -/
def mgeFrozenStep (u v : Vec4) : Prop :=
  sub4 v u = mgeFrozenRootAt u ∨ sub4 v u = mgNeg4 (mgeFrozenRootAt u)

private theorem mge_frozenRoot_mem_d4Roots (x : Vec4) : mgeFrozenRootAt x ∈ d4Roots := by
  unfold mgeFrozenRootAt mgeFrozenDirAt
  split <;> split <;> decide

private theorem mge_frozenRoot_x0_zero (x : Vec4) : (mgeFrozenRootAt x).1 = 0 := by
  unfold mgeFrozenRootAt mgeFrozenDirAt
  split <;> split <;> rfl

private theorem mge_frozenRoot_timeReflect (x : Vec4) :
    mgeFrozenRootAt (timeReflect4 x) = mgeFrozenRootAt x ∧
    timeReflect4 (mgeFrozenRootAt x) = mgeFrozenRootAt x := by
  rcases x with ⟨x0, x1, x2, x3⟩
  have hMod : ((-x0) % 2 == 0) = (x0 % 2 == 0) := by
    by_cases h : x0 % 2 = 0
    · have hNeg : (-x0) % 2 = 0 := by omega
      simp only [h, hNeg, beq_self_eq_true]
    · have hNeg : (-x0) % 2 ≠ 0 := by omega
      simp only [beq_false_of_ne h, beq_false_of_ne hNeg]
  constructor
  · simp only [mgeFrozenRootAt, mgeFrozenDirAt, timeReflect4, hMod]; rfl
  · unfold mgeFrozenRootAt mgeFrozenDirAt
    split <;> split <;> rfl

private theorem mge_frozen_step_invariants (u v : Vec4) (h : mgeFrozenStep u v) :
    u.1 = v.1 ∧
    mgeFrozenDirAt v = mgeFrozenDirAt u ∧
    mgeFrozenRootAt v = mgeFrozenRootAt u ∧
    mgeFrozenFiberAt v = mgeFrozenFiberAt u ∧
    mgeFrozenStep v u ∧
    ((v = add4 u (mgeFrozenRootAt u) ∧ mgeFrozenHeightAt v = mgeFrozenHeightAt u + 2) ∨
     (v = sub4 u (mgeFrozenRootAt u) ∧ mgeFrozenHeightAt v = mgeFrozenHeightAt u - 2)) := by
  rcases u with ⟨u0, u1, u2, u3⟩
  rcases v with ⟨v0, v1, v2, v3⟩
  unfold mgeFrozenStep at h
  by_cases h0 : u0 % 2 = 0
  · by_cases h1 : u1 % 2 = 0
    · have hDirU : mgeFrozenDirAt (u0, u1, u2, u3) = ⟨10, by decide⟩ := by
        simp only [mgeFrozenDirAt, h0, h1, beq_self_eq_true, ite_true]
      have hRootU : mgeFrozenRootAt (u0, u1, u2, u3) = (0, 0, 1, 1) := by
        simp only [mgeFrozenRootAt, hDirU, mgPosRoot]
      rw [hRootU] at h
      rcases h with hpos | hneg
      · simp only [sub4, Prod.mk.injEq] at hpos
        have hv0 : v0 = u0 := by omega
        have hv1 : v1 = u1 := by omega
        have hDirV : mgeFrozenDirAt (v0, v1, v2, v3) = ⟨10, by decide⟩ := by
          simp only [mgeFrozenDirAt, hv0, hv1, h0, h1, beq_self_eq_true, ite_true]
        have hRootV : mgeFrozenRootAt (v0, v1, v2, v3) = (0, 0, 1, 1) := by
          simp only [mgeFrozenRootAt, hDirV, mgPosRoot]
        refine ⟨by omega, by rw [hDirV, hDirU], by rw [hRootV, hRootU], ?_, ?_, Or.inl ⟨?_, ?_⟩⟩
        · simp only [mgeFrozenFiberAt, hv0, hv1, h0, h1, beq_self_eq_true, ite_true, Prod.mk.injEq]
          exact ⟨trivial, trivial, by omega⟩
        · right; simp only [hRootV, sub4, mgNeg4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [hRootU, add4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [mgeFrozenHeightAt, hRootV, hRootU, dot4, Int.mul_zero, Int.mul_one]; omega
      · simp only [sub4, mgNeg4, Prod.mk.injEq] at hneg
        have hv0 : v0 = u0 := by omega
        have hv1 : v1 = u1 := by omega
        have hDirV : mgeFrozenDirAt (v0, v1, v2, v3) = ⟨10, by decide⟩ := by
          simp only [mgeFrozenDirAt, hv0, hv1, h0, h1, beq_self_eq_true, ite_true]
        have hRootV : mgeFrozenRootAt (v0, v1, v2, v3) = (0, 0, 1, 1) := by
          simp only [mgeFrozenRootAt, hDirV, mgPosRoot]
        refine ⟨by omega, by rw [hDirV, hDirU], by rw [hRootV, hRootU], ?_, ?_, Or.inr ⟨?_, ?_⟩⟩
        · simp only [mgeFrozenFiberAt, hv0, hv1, h0, h1, beq_self_eq_true, ite_true, Prod.mk.injEq]
          exact ⟨trivial, trivial, by omega⟩
        · left; simp only [hRootV, sub4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [hRootU, sub4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [mgeFrozenHeightAt, hRootV, hRootU, dot4, Int.mul_zero, Int.mul_one]; omega
    · have hDirU : mgeFrozenDirAt (u0, u1, u2, u3) = ⟨11, by decide⟩ := by
        simp only [mgeFrozenDirAt, h0, beq_self_eq_true, beq_false_of_ne h1, ite_true,
          Bool.false_eq_true, ite_false]
      have hRootU : mgeFrozenRootAt (u0, u1, u2, u3) = (0, 0, 1, -1) := by
        simp only [mgeFrozenRootAt, hDirU, mgPosRoot]
      rw [hRootU] at h
      rcases h with hpos | hneg
      · simp only [sub4, Prod.mk.injEq] at hpos
        have hv0 : v0 = u0 := by omega
        have hv1 : v1 = u1 := by omega
        have hDirV : mgeFrozenDirAt (v0, v1, v2, v3) = ⟨11, by decide⟩ := by
          simp only [mgeFrozenDirAt, hv0, hv1, h0, beq_self_eq_true, beq_false_of_ne h1, ite_true,
            Bool.false_eq_true, ite_false]
        have hRootV : mgeFrozenRootAt (v0, v1, v2, v3) = (0, 0, 1, -1) := by
          simp only [mgeFrozenRootAt, hDirV, mgPosRoot]
        refine ⟨by omega, by rw [hDirV, hDirU], by rw [hRootV, hRootU], ?_, ?_, Or.inl ⟨?_, ?_⟩⟩
        · simp only [mgeFrozenFiberAt, hv0, hv1, h0, beq_self_eq_true, beq_false_of_ne h1,
            ite_true, Bool.false_eq_true, ite_false, Prod.mk.injEq]
          exact ⟨trivial, trivial, by omega⟩
        · right; simp only [hRootV, sub4, mgNeg4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [hRootU, add4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [mgeFrozenHeightAt, hRootV, hRootU, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega
      · simp only [sub4, mgNeg4, Prod.mk.injEq] at hneg
        have hv0 : v0 = u0 := by omega
        have hv1 : v1 = u1 := by omega
        have hDirV : mgeFrozenDirAt (v0, v1, v2, v3) = ⟨11, by decide⟩ := by
          simp only [mgeFrozenDirAt, hv0, hv1, h0, beq_self_eq_true, beq_false_of_ne h1, ite_true,
            Bool.false_eq_true, ite_false]
        have hRootV : mgeFrozenRootAt (v0, v1, v2, v3) = (0, 0, 1, -1) := by
          simp only [mgeFrozenRootAt, hDirV, mgPosRoot]
        refine ⟨by omega, by rw [hDirV, hDirU], by rw [hRootV, hRootU], ?_, ?_, Or.inr ⟨?_, ?_⟩⟩
        · simp only [mgeFrozenFiberAt, hv0, hv1, h0, beq_self_eq_true, beq_false_of_ne h1,
            ite_true, Bool.false_eq_true, ite_false, Prod.mk.injEq]
          exact ⟨trivial, trivial, by omega⟩
        · left; simp only [hRootV, sub4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [hRootU, sub4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [mgeFrozenHeightAt, hRootV, hRootU, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega
  · by_cases h2 : u2 % 2 = 0
    · have hDirU : mgeFrozenDirAt (u0, u1, u2, u3) = ⟨8, by decide⟩ := by
        simp only [mgeFrozenDirAt, beq_false_of_ne h0, h2, beq_self_eq_true,
          Bool.false_eq_true, ite_false, ite_true]
      have hRootU : mgeFrozenRootAt (u0, u1, u2, u3) = (0, 1, 0, 1) := by
        simp only [mgeFrozenRootAt, hDirU, mgPosRoot]
      rw [hRootU] at h
      rcases h with hpos | hneg
      · simp only [sub4, Prod.mk.injEq] at hpos
        have hv0 : v0 = u0 := by omega
        have hv2 : v2 = u2 := by omega
        have hDirV : mgeFrozenDirAt (v0, v1, v2, v3) = ⟨8, by decide⟩ := by
          simp only [mgeFrozenDirAt, hv0, hv2, beq_false_of_ne h0, h2, beq_self_eq_true,
            Bool.false_eq_true, ite_false, ite_true]
        have hRootV : mgeFrozenRootAt (v0, v1, v2, v3) = (0, 1, 0, 1) := by
          simp only [mgeFrozenRootAt, hDirV, mgPosRoot]
        refine ⟨by omega, by rw [hDirV, hDirU], by rw [hRootV, hRootU], ?_, ?_, Or.inl ⟨?_, ?_⟩⟩
        · simp only [mgeFrozenFiberAt, hv0, hv2, beq_false_of_ne h0, h2, beq_self_eq_true,
            Bool.false_eq_true, ite_false, ite_true, Prod.mk.injEq]
          exact ⟨trivial, trivial, by omega⟩
        · right; simp only [hRootV, sub4, mgNeg4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [hRootU, add4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [mgeFrozenHeightAt, hRootV, hRootU, dot4, Int.mul_zero, Int.mul_one]; omega
      · simp only [sub4, mgNeg4, Prod.mk.injEq] at hneg
        have hv0 : v0 = u0 := by omega
        have hv2 : v2 = u2 := by omega
        have hDirV : mgeFrozenDirAt (v0, v1, v2, v3) = ⟨8, by decide⟩ := by
          simp only [mgeFrozenDirAt, hv0, hv2, beq_false_of_ne h0, h2, beq_self_eq_true,
            Bool.false_eq_true, ite_false, ite_true]
        have hRootV : mgeFrozenRootAt (v0, v1, v2, v3) = (0, 1, 0, 1) := by
          simp only [mgeFrozenRootAt, hDirV, mgPosRoot]
        refine ⟨by omega, by rw [hDirV, hDirU], by rw [hRootV, hRootU], ?_, ?_, Or.inr ⟨?_, ?_⟩⟩
        · simp only [mgeFrozenFiberAt, hv0, hv2, beq_false_of_ne h0, h2, beq_self_eq_true,
            Bool.false_eq_true, ite_false, ite_true, Prod.mk.injEq]
          exact ⟨trivial, trivial, by omega⟩
        · left; simp only [hRootV, sub4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [hRootU, sub4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [mgeFrozenHeightAt, hRootV, hRootU, dot4, Int.mul_zero, Int.mul_one]; omega
    · have hDirU : mgeFrozenDirAt (u0, u1, u2, u3) = ⟨9, by decide⟩ := by
        simp only [mgeFrozenDirAt, beq_false_of_ne h0, beq_false_of_ne h2,
          Bool.false_eq_true, ite_false]
      have hRootU : mgeFrozenRootAt (u0, u1, u2, u3) = (0, 1, 0, -1) := by
        simp only [mgeFrozenRootAt, hDirU, mgPosRoot]
      rw [hRootU] at h
      rcases h with hpos | hneg
      · simp only [sub4, Prod.mk.injEq] at hpos
        have hv0 : v0 = u0 := by omega
        have hv2 : v2 = u2 := by omega
        have hDirV : mgeFrozenDirAt (v0, v1, v2, v3) = ⟨9, by decide⟩ := by
          simp only [mgeFrozenDirAt, hv0, hv2, beq_false_of_ne h0, beq_false_of_ne h2,
            Bool.false_eq_true, ite_false]
        have hRootV : mgeFrozenRootAt (v0, v1, v2, v3) = (0, 1, 0, -1) := by
          simp only [mgeFrozenRootAt, hDirV, mgPosRoot]
        refine ⟨by omega, by rw [hDirV, hDirU], by rw [hRootV, hRootU], ?_, ?_, Or.inl ⟨?_, ?_⟩⟩
        · simp only [mgeFrozenFiberAt, hv0, hv2, beq_false_of_ne h0, beq_false_of_ne h2,
            Bool.false_eq_true, ite_false, Prod.mk.injEq]
          exact ⟨trivial, trivial, by omega⟩
        · right; simp only [hRootV, sub4, mgNeg4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [hRootU, add4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [mgeFrozenHeightAt, hRootV, hRootU, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega
      · simp only [sub4, mgNeg4, Prod.mk.injEq] at hneg
        have hv0 : v0 = u0 := by omega
        have hv2 : v2 = u2 := by omega
        have hDirV : mgeFrozenDirAt (v0, v1, v2, v3) = ⟨9, by decide⟩ := by
          simp only [mgeFrozenDirAt, hv0, hv2, beq_false_of_ne h0, beq_false_of_ne h2,
            Bool.false_eq_true, ite_false]
        have hRootV : mgeFrozenRootAt (v0, v1, v2, v3) = (0, 1, 0, -1) := by
          simp only [mgeFrozenRootAt, hDirV, mgPosRoot]
        refine ⟨by omega, by rw [hDirV, hDirU], by rw [hRootV, hRootU], ?_, ?_, Or.inr ⟨?_, ?_⟩⟩
        · simp only [mgeFrozenFiberAt, hv0, hv2, beq_false_of_ne h0, beq_false_of_ne h2,
            Bool.false_eq_true, ite_false, Prod.mk.injEq]
          exact ⟨trivial, trivial, by omega⟩
        · left; simp only [hRootV, sub4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [hRootU, sub4, Prod.mk.injEq]
          exact ⟨by omega, by omega, by omega, by omega⟩
        · simp only [mgeFrozenHeightAt, hRootV, hRootU, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega

private theorem mge_frozen_walk_monotone (w : Nat → Vec4) (k : Nat)
    (hStep : ∀ i : Nat, i < k → mgeFrozenStep (w i) (w (i + 1)))
    (hNoBack : ∀ i : Nat, i + 1 < k → w (i + 2) ≠ w i) :
    (k = 0) ∨
    (mgeFrozenHeightAt (w k) = mgeFrozenHeightAt (w 0) + 2 * Int.ofNat k) ∨
    (mgeFrozenHeightAt (w k) = mgeFrozenHeightAt (w 0) - 2 * Int.ofNat k) := by
  cases k with
  | zero => exact Or.inl rfl
  | succ m =>
    have h0 := mge_frozen_step_invariants (w 0) (w 1) (hStep 0 (by omega))
    rcases h0.2.2.2.2.2 with ⟨hw1, hc1⟩ | ⟨hw1, hc1⟩
    · right; left
      have hUp : ∀ j : Nat, j ≤ m →
          w (j + 1) = add4 (w j) (mgeFrozenRootAt (w j)) ∧
          mgeFrozenRootAt (w (j + 1)) = mgeFrozenRootAt (w j) ∧
          mgeFrozenHeightAt (w (j + 1)) = mgeFrozenHeightAt (w 0) + 2 * Int.ofNat (j + 1) := by
        intro j
        induction j with
        | zero =>
          intro _
          exact ⟨hw1, h0.2.2.1, by change mgeFrozenHeightAt (w 1) = mgeFrozenHeightAt (w 0) + 2 * 1; omega⟩
        | succ r ih =>
          intro hr
          have ⟨hPrevStep, hPrevRoot, hPrevCoord⟩ := ih (by omega)
          have hCur := mge_frozen_step_invariants (w (r + 1)) (w (r + 2)) (hStep (r + 1) (by omega))
          rcases hCur.2.2.2.2.2 with ⟨hFwd, hFwdC⟩ | ⟨hBwd, _⟩
          · refine ⟨hFwd, hCur.2.2.1, ?_⟩
            have hCast : Int.ofNat (r + 2) = Int.ofNat (r + 1) + 1 := rfl
            change mgeFrozenHeightAt (w (r + 2)) = mgeFrozenHeightAt (w 0) + 2 * Int.ofNat (r + 2)
            rw [hCast]; omega
          · exfalso
            apply hNoBack r (by omega)
            rw [hBwd, hPrevRoot, hPrevStep]
            rcases w r with ⟨a, b, c, d⟩
            rcases mgeFrozenRootAt (a, b, c, d) with ⟨r0, r1, r2, r3⟩
            simp only [add4, sub4, Prod.mk.injEq]
            exact ⟨by omega, by omega, by omega, by omega⟩
      exact (hUp m (Nat.le_refl m)).2.2
    · right; right
      have hDn : ∀ j : Nat, j ≤ m →
          w (j + 1) = sub4 (w j) (mgeFrozenRootAt (w j)) ∧
          mgeFrozenRootAt (w (j + 1)) = mgeFrozenRootAt (w j) ∧
          mgeFrozenHeightAt (w (j + 1)) = mgeFrozenHeightAt (w 0) - 2 * Int.ofNat (j + 1) := by
        intro j
        induction j with
        | zero =>
          intro _
          exact ⟨hw1, h0.2.2.1, by change mgeFrozenHeightAt (w 1) = mgeFrozenHeightAt (w 0) - 2 * 1; omega⟩
        | succ r ih =>
          intro hr
          have ⟨hPrevStep, hPrevRoot, hPrevCoord⟩ := ih (by omega)
          have hCur := mge_frozen_step_invariants (w (r + 1)) (w (r + 2)) (hStep (r + 1) (by omega))
          rcases hCur.2.2.2.2.2 with ⟨hFwd, _⟩ | ⟨hBwd, hBwdC⟩
          · exfalso
            apply hNoBack r (by omega)
            rw [hFwd, hPrevRoot, hPrevStep]
            rcases w r with ⟨a, b, c, d⟩
            rcases mgeFrozenRootAt (a, b, c, d) with ⟨r0, r1, r2, r3⟩
            simp only [add4, sub4, Prod.mk.injEq]
            exact ⟨by omega, by omega, by omega, by omega⟩
          · refine ⟨hBwd, hCur.2.2.1, ?_⟩
            have hCast : Int.ofNat (r + 2) = Int.ofNat (r + 1) + 1 := rfl
            change mgeFrozenHeightAt (w (r + 2)) = mgeFrozenHeightAt (w 0) - 2 * Int.ofNat (r + 2)
            rw [hCast]; omega
      exact (hDn m (Nat.le_refl m)).2.2

/-- Theorem MGE-1: Exact 4-direction `Alt-x0+planes` spatial forest gauge fixing on infinite 4D `D_4`:
    1. Every frozen root `mgeFrozenRootAt x` lies in `d4Roots`, has `Δx_0 = 0`, and preserves `mgeInD4`,
    2. Every frozen step `mgeFrozenStep u v` satisfies `u_0 = v_0`, preserves `mgeFrozenRootAt` and
       `mgeFrozenFiberAt`, and is undirected (`mgeFrozenStep v u`), forming disjoint infinite straight
       1D spatial lines with zero branching,
    3. Site-hyperplane time reflection `Θ(x_0, x_1, x_2, x_3) = (-x_0, x_1, x_2, x_3)` fixes
       `mgeFrozenRootAt` identically and preserves the entire frozen edge set
       (`mgeFrozenStep u v ↔ mgeFrozenStep (Θ u) (Θ v)`), establishing the geometric premise for
       exact `x_0 = 0` Osterwalder-Seiler reflection positivity,
    4. Unique base-slab foliation `0 ≤ b · r_frozen ≤ 1` along every frozen 1D line,
    5. **Unconditional acyclicity (`0` cycles of ANY length `k ≥ 1`)** over all `w : Nat → Vec4`
       on infinite 4D `D_4` (and any open-BC finite sublattice). -/
theorem thm_mge_alt_x0_planes_forest_rp_and_acyclic :
    (∀ x : Vec4, mgeFrozenRootAt x ∈ d4Roots ∧ (mgeFrozenRootAt x).1 = 0) ∧
    (∀ x : Vec4, mgeInD4 x →
      mgeInD4 (add4 x (mgeFrozenRootAt x)) ∧ mgeInD4 (sub4 x (mgeFrozenRootAt x))) ∧
    (∀ u v : Vec4, mgeFrozenStep u v →
      u.1 = v.1 ∧ mgeFrozenRootAt v = mgeFrozenRootAt u ∧
      mgeFrozenFiberAt v = mgeFrozenFiberAt u ∧ mgeFrozenStep v u) ∧
    (∀ x : Vec4,
      mgeFrozenRootAt (timeReflect4 x) = mgeFrozenRootAt x ∧
      timeReflect4 (mgeFrozenRootAt x) = mgeFrozenRootAt x) ∧
    (∀ u v : Vec4, mgeFrozenStep u v ↔ mgeFrozenStep (timeReflect4 u) (timeReflect4 v)) ∧
    (∀ x : Vec4, ∃ n : Int,
      (let b := sub4 x (scale4 n (mgeFrozenRootAt x))
       mgeFrozenRootAt b = mgeFrozenRootAt x ∧
       mgeFrozenFiberAt b = mgeFrozenFiberAt x ∧
       0 ≤ mgeFrozenHeightAt b ∧ mgeFrozenHeightAt b ≤ 1) ∧
      (∀ n' : Int, let b' := sub4 x (scale4 n' (mgeFrozenRootAt x))
       0 ≤ dot4 b' (mgeFrozenRootAt x) → dot4 b' (mgeFrozenRootAt x) ≤ 1 → n' = n)) ∧
    (∀ (k : Nat) (w : Nat → Vec4), k ≥ 1 →
      (∀ i : Nat, i < k → mgeFrozenStep (w i) (w (i + 1))) →
      (∀ i : Nat, i + 1 < k → w (i + 2) ≠ w i) →
      w k ≠ w 0) := by
  refine ⟨fun x => ⟨mge_frozenRoot_mem_d4Roots x, mge_frozenRoot_x0_zero x⟩, ?_, ?_,
          mge_frozenRoot_timeReflect, ?_, ?_, ?_⟩
  · intro x hx
    rcases x with ⟨x0, x1, x2, x3⟩
    unfold mgeInD4 at hx ⊢
    dsimp only at hx
    unfold mgeFrozenRootAt mgeFrozenDirAt
    split <;> split
    · change ((x0 + 0) + (x1 + 0) + (x2 + 1) + (x3 + 1)) % 2 = 0 ∧
        ((x0 - 0) + (x1 - 0) + (x2 - 1) + (x3 - 1)) % 2 = 0
      exact ⟨by omega, by omega⟩
    · change ((x0 + 0) + (x1 + 0) + (x2 + 1) + (x3 + -1)) % 2 = 0 ∧
        ((x0 - 0) + (x1 - 0) + (x2 - 1) + (x3 - -1)) % 2 = 0
      exact ⟨by omega, by omega⟩
    · change ((x0 + 0) + (x1 + 1) + (x2 + 0) + (x3 + 1)) % 2 = 0 ∧
        ((x0 - 0) + (x1 - 1) + (x2 - 0) + (x3 - 1)) % 2 = 0
      exact ⟨by omega, by omega⟩
    · change ((x0 + 0) + (x1 + 1) + (x2 + 0) + (x3 + -1)) % 2 = 0 ∧
        ((x0 - 0) + (x1 - 1) + (x2 - 0) + (x3 - -1)) % 2 = 0
      exact ⟨by omega, by omega⟩
  · intro u v h
    have hi := mge_frozen_step_invariants u v h
    exact ⟨hi.1, hi.2.2.1, hi.2.2.2.1, hi.2.2.2.2.1⟩
  · intro u v
    have hReflStep : ∀ a b : Vec4, mgeFrozenStep a b →
        mgeFrozenStep (timeReflect4 a) (timeReflect4 b) := by
      intro a b hab
      rcases a with ⟨a0, a1, a2, a3⟩
      rcases b with ⟨b0, b1, b2, b3⟩
      have hr := mge_frozenRoot_timeReflect (a0, a1, a2, a3)
      have hx0 := mge_frozenRoot_x0_zero (a0, a1, a2, a3)
      unfold mgeFrozenStep at hab ⊢
      rw [hr.1]
      rcases hR : mgeFrozenRootAt (a0, a1, a2, a3) with ⟨r0, r1, r2, r3⟩
      rw [hR] at hab hx0
      dsimp only at hx0
      rcases hab with hpos | hneg
      · left
        simp only [sub4, timeReflect4, Prod.mk.injEq] at hpos ⊢
        exact ⟨by omega, by omega, by omega, by omega⟩
      · right
        simp only [sub4, mgNeg4, timeReflect4, Prod.mk.injEq] at hneg ⊢
        exact ⟨by omega, by omega, by omega, by omega⟩
    constructor
    · exact hReflStep u v
    · intro h
      have h2 := hReflStep (timeReflect4 u) (timeReflect4 v) h
      have hInv : ∀ z : Vec4, timeReflect4 (timeReflect4 z) = z := by
        intro ⟨z0, z1, z2, z3⟩
        simp only [timeReflect4, Int.neg_neg]
      rw [hInv u, hInv v] at h2
      exact h2
  · intro x
    rcases x with ⟨x0, x1, x2, x3⟩
    have ⟨n, hn0, hn1⟩ := mge_int_half_floor_slab (mgeFrozenHeightAt (x0, x1, x2, x3))
    refine ⟨n, ?_, ?_⟩
    · by_cases h0 : x0 % 2 = 0
      · by_cases h1 : x1 % 2 = 0
        · have hD : mgeFrozenDirAt (x0, x1, x2, x3) = ⟨10, by decide⟩ := by
            simp only [mgeFrozenDirAt, h0, h1, beq_self_eq_true, ite_true]
          have hR : mgeFrozenRootAt (x0, x1, x2, x3) = (0, 0, 1, 1) := by
            simp only [mgeFrozenRootAt, hD, mgPosRoot]
          simp only [mgeFrozenHeightAt, hR, dot4, Int.mul_zero, Int.mul_one] at hn0 hn1
          have hDb : mgeFrozenDirAt (sub4 (x0, x1, x2, x3) (scale4 n (0, 0, 1, 1))) = ⟨10, by decide⟩ := by
            simp only [sub4, scale4, Int.mul_zero, Int.sub_zero, mgeFrozenDirAt, h0, h1,
              beq_self_eq_true, ite_true]
          have hRb : mgeFrozenRootAt (sub4 (x0, x1, x2, x3) (scale4 n (0, 0, 1, 1))) = (0, 0, 1, 1) := by
            simp only [mgeFrozenRootAt, hDb, mgPosRoot]
          refine ⟨by rw [hR, hRb], ?_, ?_, ?_⟩
          · simp only [hR, sub4, scale4, Int.mul_zero, Int.sub_zero, Int.mul_one, mgeFrozenFiberAt,
              h0, h1, beq_self_eq_true, ite_true, Prod.mk.injEq]
            exact ⟨trivial, trivial, by omega⟩
          · rw [hR, mgeFrozenHeightAt, hRb]
            simp only [sub4, scale4, dot4, Int.mul_zero, Int.mul_one]; omega
          · rw [hR, mgeFrozenHeightAt, hRb]
            simp only [sub4, scale4, dot4, Int.mul_zero, Int.mul_one]; omega
        · have hD : mgeFrozenDirAt (x0, x1, x2, x3) = ⟨11, by decide⟩ := by
            simp only [mgeFrozenDirAt, h0, beq_self_eq_true, beq_false_of_ne h1, ite_true,
              Bool.false_eq_true, ite_false]
          have hR : mgeFrozenRootAt (x0, x1, x2, x3) = (0, 0, 1, -1) := by
            simp only [mgeFrozenRootAt, hD, mgPosRoot]
          simp only [mgeFrozenHeightAt, hR, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg] at hn0 hn1
          have hDb : mgeFrozenDirAt (sub4 (x0, x1, x2, x3) (scale4 n (0, 0, 1, -1))) = ⟨11, by decide⟩ := by
            simp only [sub4, scale4, Int.mul_zero, Int.sub_zero, mgeFrozenDirAt, h0,
              beq_self_eq_true, beq_false_of_ne h1, ite_true, Bool.false_eq_true, ite_false]
          have hRb : mgeFrozenRootAt (sub4 (x0, x1, x2, x3) (scale4 n (0, 0, 1, -1))) = (0, 0, 1, -1) := by
            simp only [mgeFrozenRootAt, hDb, mgPosRoot]
          refine ⟨by rw [hR, hRb], ?_, ?_, ?_⟩
          · simp only [hR, sub4, scale4, Int.mul_zero, Int.sub_zero, Int.mul_one, Int.mul_neg,
              mgeFrozenFiberAt, h0, beq_self_eq_true, beq_false_of_ne h1, ite_true,
              Bool.false_eq_true, ite_false, Prod.mk.injEq]
            exact ⟨trivial, trivial, by omega⟩
          · rw [hR, mgeFrozenHeightAt, hRb]
            simp only [sub4, scale4, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega
          · rw [hR, mgeFrozenHeightAt, hRb]
            simp only [sub4, scale4, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega
      · by_cases h2 : x2 % 2 = 0
        · have hD : mgeFrozenDirAt (x0, x1, x2, x3) = ⟨8, by decide⟩ := by
            simp only [mgeFrozenDirAt, beq_false_of_ne h0, h2, beq_self_eq_true,
              Bool.false_eq_true, ite_false, ite_true]
          have hR : mgeFrozenRootAt (x0, x1, x2, x3) = (0, 1, 0, 1) := by
            simp only [mgeFrozenRootAt, hD, mgPosRoot]
          simp only [mgeFrozenHeightAt, hR, dot4, Int.mul_zero, Int.mul_one] at hn0 hn1
          have hDb : mgeFrozenDirAt (sub4 (x0, x1, x2, x3) (scale4 n (0, 1, 0, 1))) = ⟨8, by decide⟩ := by
            simp only [sub4, scale4, Int.mul_zero, Int.sub_zero, mgeFrozenDirAt,
              beq_false_of_ne h0, h2, beq_self_eq_true, Bool.false_eq_true, ite_false, ite_true]
          have hRb : mgeFrozenRootAt (sub4 (x0, x1, x2, x3) (scale4 n (0, 1, 0, 1))) = (0, 1, 0, 1) := by
            simp only [mgeFrozenRootAt, hDb, mgPosRoot]
          refine ⟨by rw [hR, hRb], ?_, ?_, ?_⟩
          · simp only [hR, sub4, scale4, Int.mul_zero, Int.sub_zero, Int.mul_one, mgeFrozenFiberAt,
              beq_false_of_ne h0, h2, beq_self_eq_true, Bool.false_eq_true, ite_false, ite_true,
              Prod.mk.injEq]
            exact ⟨trivial, trivial, by omega⟩
          · rw [hR, mgeFrozenHeightAt, hRb]
            simp only [sub4, scale4, dot4, Int.mul_zero, Int.mul_one]; omega
          · rw [hR, mgeFrozenHeightAt, hRb]
            simp only [sub4, scale4, dot4, Int.mul_zero, Int.mul_one]; omega
        · have hD : mgeFrozenDirAt (x0, x1, x2, x3) = ⟨9, by decide⟩ := by
            simp only [mgeFrozenDirAt, beq_false_of_ne h0, beq_false_of_ne h2,
              Bool.false_eq_true, ite_false]
          have hR : mgeFrozenRootAt (x0, x1, x2, x3) = (0, 1, 0, -1) := by
            simp only [mgeFrozenRootAt, hD, mgPosRoot]
          simp only [mgeFrozenHeightAt, hR, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg] at hn0 hn1
          have hDb : mgeFrozenDirAt (sub4 (x0, x1, x2, x3) (scale4 n (0, 1, 0, -1))) = ⟨9, by decide⟩ := by
            simp only [sub4, scale4, Int.mul_zero, Int.sub_zero, mgeFrozenDirAt,
              beq_false_of_ne h0, beq_false_of_ne h2, Bool.false_eq_true, ite_false]
          have hRb : mgeFrozenRootAt (sub4 (x0, x1, x2, x3) (scale4 n (0, 1, 0, -1))) = (0, 1, 0, -1) := by
            simp only [mgeFrozenRootAt, hDb, mgPosRoot]
          refine ⟨by rw [hR, hRb], ?_, ?_, ?_⟩
          · simp only [hR, sub4, scale4, Int.mul_zero, Int.sub_zero, Int.mul_one, Int.mul_neg,
              mgeFrozenFiberAt, beq_false_of_ne h0, beq_false_of_ne h2, Bool.false_eq_true,
              ite_false, Prod.mk.injEq]
            exact ⟨trivial, trivial, by omega⟩
          · rw [hR, mgeFrozenHeightAt, hRb]
            simp only [sub4, scale4, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega
          · rw [hR, mgeFrozenHeightAt, hRb]
            simp only [sub4, scale4, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega
    · intro n'
      dsimp only
      intro h0' h1'
      have hDot : dot4 (sub4 (x0, x1, x2, x3) (scale4 n' (mgeFrozenRootAt (x0, x1, x2, x3))))
          (mgeFrozenRootAt (x0, x1, x2, x3)) = mgeFrozenHeightAt (x0, x1, x2, x3) - 2 * n' := by
        unfold mgeFrozenHeightAt mgeFrozenRootAt mgeFrozenDirAt
        split <;> split <;>
          (simp only [mgPosRoot, sub4, scale4, dot4, Int.mul_zero, Int.mul_one, Int.mul_neg]; omega)
      rw [hDot] at h0' h1'
      omega
  · intro k w hk hStep hNoBack hClosed
    have hMon := mge_frozen_walk_monotone w k hStep hNoBack
    have hkInt : (1 : Int) ≤ Int.ofNat k := Int.ofNat_le.mpr hk
    rcases hMon with hZero | hUp | hDn
    · omega
    · rw [hClosed] at hUp; omega
    · rw [hClosed] at hDn; omega


/-! ## Section 2: Exact `88 × 88` `Alt-x0+planes` Quotient Matrix `M88`, `4 × 4` Equitable Partition & Collatz-Wielandt Bound -/

/-- Canonical `D_4` site parity-class representative `c ∈ {0, 1}^4` with even coordinate sum (`Fin 8`). -/
def mgeClassVec (ci : Fin 8) : Vec4 :=
  let b0 : Int := Int.ofNat (ci.val / 4)
  let b1 : Int := Int.ofNat ((ci.val / 2) % 2)
  let b2 : Int := Int.ofNat (ci.val % 2)
  (b0, b1, b2, (b0 + b1 + b2) % 2)

/-- Map any `D_4` lattice vector `v` to its site parity class index `Fin 8`. -/
def mgeClassOf (v : Vec4) : Fin 8 :=
  let b0 : Nat := if v.1 % 2 == 0 then 0 else 1
  let b1 : Nat := if v.2.1 % 2 == 0 then 0 else 1
  let b2 : Nat := if v.2.2.1 % 2 == 0 then 0 else 1
  have h0 : b0 ≤ 1 := by dsimp [b0]; split <;> decide
  have h1 : b1 ≤ 1 := by dsimp [b1]; split <;> decide
  have h2 : b2 ≤ 1 := by dsimp [b2]; split <;> decide
  ⟨b0 * 4 + b1 * 2 + b2, by omega⟩

/-- Frozen positive direction index `Fin 12` for parity class `ci : Fin 8`, derived directly
    from `mgeFrozenDirAt (mgeClassVec ci)`. -/
def mgeClassFrozenDir (ci : Fin 8) : Fin 12 :=
  mgeFrozenDirAt (mgeClassVec ci)

/-- Active positive direction index `Fin 12` for link class `u : MgeIdx88`, skipping `mgeClassFrozenDir u.1`. -/
def mgeActiveDir88 (u : MgeIdx88) : Fin 12 :=
  let fd := (mgeClassFrozenDir u.1).val
  let j := u.2.val
  let d := if j < fd then j else j + 1
  have hfd : fd < 12 := (mgeClassFrozenDir u.1).isLt
  have hj : j < 11 := u.2.isLt
  ⟨d, by dsimp [d]; split <;> omega⟩

/-- Inverse lookup: pack `(ci : Fin 8, d : Fin 12)` with `d ≠ mgeClassFrozenDir ci` into `Option MgeIdx88`. -/
def mgePackActive88 (ci : Fin 8) (d : Fin 12) : Option MgeIdx88 :=
  let fd := (mgeClassFrozenDir ci).val
  if d.val == fd then none
  else
    let j := if d.val < fd then d.val else d.val - 1
    if h : j < 11 then some (ci, ⟨j, h⟩) else none

/-- Canonicalize an undirected `D_4` edge `(a, b)` into `(parityClass, posDir, 2 * x0_midpoint)`. -/
def mgeCanonEdge88 (a b : Vec4) : Fin 8 × Fin 12 × Int :=
  let diff := sub4 b a
  if mgLexPos diff then
    (mgeClassOf a, mgDirOf diff, a.1 + b.1)
  else
    (mgeClassOf b, mgDirOf (mgNeg4 diff), a.1 + b.1)

/-- Exact list of active triangle-neighbor link classes `(v : MgeIdx88, isHalfStep : Bool)` for
    active class `u : MgeIdx88`, derived directly from `d4Roots` and `mgeFrozenDirAt`. -/
def mgeNeighbors88 (u : MgeIdx88) : List (MgeIdx88 × Bool) :=
  let x := mgeClassVec u.1
  let r := mgPosRoot (mgeActiveDir88 u)
  let y := add4 x r
  let x0e := x.1 + y.1
  d4Roots.foldl (fun acc s =>
    if dot4 r s == 1 then
      let z := add4 x s
      let (ci1, d1, m1) := mgeCanonEdge88 x z
      let (ci2, d2, m2) := mgeCanonEdge88 y z
      let acc1 := match mgePackActive88 ci1 d1 with
        | some v1 => (v1, m1 != x0e) :: acc
        | none => acc
      match mgePackActive88 ci2 d2 with
      | some v2 => (v2, m2 != x0e) :: acc1
      | none => acc1
    else acc) []

/-- Exact `88 × 88` same-time-slice (`|Δx_0| = 0`) `Alt-x0+planes` quotient coupling matrix `M88_0`. -/
def mgeM88_0 (u v : MgeIdx88) : Nat :=
  (mgeNeighbors88 u).countP (fun p => p.1 == v && !p.2)

/-- Exact `88 × 88` half-step-time (`|Δx_0| = 1/2`) `Alt-x0+planes` quotient coupling matrix `M88_h`. -/
def mgeM88_h (u v : MgeIdx88) : Nat :=
  (mgeNeighbors88 u).countP (fun p => p.1 == v && p.2)

/-- Total `88 × 88` `Alt-x0+planes` quotient Dobrushin coupling matrix `M88 = M88_0 + M88_h`. -/
def mgeM88 (u v : MgeIdx88) : Nat :=
  mgeM88_0 u v + mgeM88_h u v

/-- Exact geometric `4`-orbit classification of `MgeIdx88` directly from `r` and endpoint frozen roots:
    - Orbit `3` (`8` links, deg `16`): spatial (`r_0 = 0`) orthogonal to `r_frozen(x)`,
    - Orbit `0` (`16` links, deg `14`): spatial (`r_0 = 0`, `r_3 ≠ 0`) frozen on opposite `x_0` parity,
    - Orbit `1` (`32` links, deg `14`): spatial `(0,1,±1,0)` never frozen + temporal with `|r·r_x| = |r·r_y| = 1`,
    - Orbit `2` (`32` links, deg `15`): temporal (`r_0 = 1`) orthogonal to one endpoint's frozen root. -/
def mgeOrbit88 (u : MgeIdx88) : Fin 4 :=
  let x := mgeClassVec u.1
  let r := mgPosRoot (mgeActiveDir88 u)
  let rx := mgeFrozenRootAt x
  let ry := mgeFrozenRootAt (add4 x r)
  if r.1 == 0 then
    if dot4 r rx == 0 then ⟨3, by decide⟩
    else if r.2.2.2 != 0 then ⟨0, by decide⟩
    else ⟨1, by decide⟩
  else
    if dot4 r rx == 0 || dot4 r ry == 0 then ⟨2, by decide⟩
    else ⟨1, by decide⟩

/-- Exact `4 × 4` equitable quotient matrix `Q_4` of `M88`. -/
def mgeQ4 (a b : Fin 4) : Nat :=
  match a.val, b.val with
  | 0, 0 => 0 | 0, 1 => 8 | 0, 2 => 4 | 0, 3 => 2
  | 1, 0 => 4 | 1, 1 => 0 | 1, 2 => 8 | 1, 3 => 2
  | 2, 0 => 2 | 2, 1 => 8 | 2, 2 => 4 | 2, 3 => 1
  | 3, 0 => 4 | 3, 1 => 8 | 3, 2 => 4 | 3, 3 => 0
  | _, _ => 0

private def mgeTable88 : List (List (List (MgeIdx88 × Bool))) :=
  (List.finRange 8).map fun ci => (List.finRange 11).map fun j => mgeNeighbors88 (ci, j)

private def mgeLookup88 (tbl : List (List (List (MgeIdx88 × Bool)))) (u : MgeIdx88) :
    List (MgeIdx88 × Bool) :=
  (tbl.getD u.1.val []).getD u.2.val []

private theorem mge_lookup88_eq (u : MgeIdx88) :
    mgeLookup88 mgeTable88 u = mgeNeighbors88 u := by
  unfold mgeLookup88 mgeTable88
  rw [mge_getD_map_finRange, mge_getD_map_finRange]

private theorem mge_m88_linear_action (c0 ch : Nat) (f : MgeIdx88 → Nat) (u : MgeIdx88) :
    mgeSum88 (fun v => (c0 * mgeM88_0 u v + ch * mgeM88_h u v) * f v) =
      mgeListSum ((mgeNeighbors88 u).map (fun p => (if p.2 then ch else c0) * f p.1)) := by
  rw [mge_sum88_eq_listSum]
  exact mge_listSum_countP_pair_mul mgeAll88 mge_all88_nodup mge_mem_all88 (mgeNeighbors88 u) c0 ch f

private theorem mge_m88_action_eq (f : MgeIdx88 → Nat) (u : MgeIdx88) :
    mgeSum88 (fun v => mgeM88 u v * f v) =
      mgeListSum ((mgeNeighbors88 u).map (fun p => f p.1)) := by
  have h1 := mge_m88_linear_action 1 1 f u
  have hL : (fun v : MgeIdx88 => (1 * mgeM88_0 u v + 1 * mgeM88_h u v) * f v) =
      (fun v : MgeIdx88 => mgeM88 u v * f v) := by
    funext v; simp only [mgeM88, Nat.one_mul]
  have hR : (fun p : MgeIdx88 × Bool => (if p.2 then (1 : Nat) else 1) * f p.1) =
      (fun p : MgeIdx88 × Bool => f p.1) := by
    funext ⟨v, b⟩; cases b <;> simp only [Bool.false_eq_true, ite_true, ite_false, Nat.one_mul]
  rw [hL, hR] at h1
  exact h1

private theorem mge_m88_struct_checks :
    let tbl := mgeTable88
    ((List.finRange 8).all fun ci =>
      let c := mgeClassVec ci
      decide ((c.1 + c.2.1 + c.2.2.1 + c.2.2.2) % 2 = 0) && (mgeClassOf c == ci)) = true ∧
    ((List.finRange 8).all fun ci =>
      (List.finRange 11).all fun j =>
        let u : MgeIdx88 := (ci, j)
        let nu := mgeLookup88 tbl u
        (nu.all fun p => p.1 != u) &&
        ((List.finRange 4).all fun o => nu.countP (fun p => mgeOrbit88 p.1 == o) == mgeQ4 (mgeOrbit88 u) o)) = true ∧
    (mgeAll88.filter fun u => (mgeLookup88 tbl u).length == 14).length = 48 ∧
    (mgeAll88.filter fun u => (mgeLookup88 tbl u).length == 15).length = 32 ∧
    (mgeAll88.filter fun u => (mgeLookup88 tbl u).length == 16).length = 8 ∧
    mgeListSum (mgeAll88.map fun u => (mgeLookup88 tbl u).length) = 1280 ∧
    ((List.finRange 4).map fun o => (mgeAll88.filter fun u => mgeOrbit88 u == o).length) =
      [16, 32, 32, 8] := by
  decide

private theorem mge_m88_sym_check :
    let tbl := mgeTable88
    ((List.finRange 8).all fun ci =>
      (List.finRange 11).all fun j =>
        let u : MgeIdx88 := (ci, j)
        let nu := mgeLookup88 tbl u
        nu.all fun p =>
          let nv := mgeLookup88 tbl p.1
          (nu.countP (fun q => q.1 == p.1 && !q.2) == nv.countP (fun q => q.1 == u && !q.2)) &&
          (nu.countP (fun q => q.1 == p.1 && q.2) == nv.countP (fun q => q.1 == u && q.2))) = true := by
  decide

private theorem mge_countP_eq_zero_of_not_mem {α : Type} (l : List α) (p : α → Bool)
    (h : ∀ x ∈ l, p x = false) : l.countP p = 0 := by
  induction l with
  | nil => rfl
  | cons a t ih =>
    simp only [List.countP_cons, h a (List.mem_cons_self ..), Bool.false_eq_true, ite_false, Nat.add_zero]
    exact ih (fun x hx => h x (List.mem_cons_of_mem _ hx))

/-- Theorem MGE-2: Exact structural certification of the `88 × 88` `Alt-x0+planes` quotient Dobrushin
    coupling matrix `M88 = M88_0 + M88_h` on `MgeIdx88 = Fin 8 × Fin 11`, derived directly from
    `d4Roots` and `mgeFrozenDirAt`:
    1. All `8` site parity classes lie in `D_4` and round-trip through `mgeClassOf`,
    2. `M88` has zero diagonal (`∀ u, M88 u u = 0`) and exact symmetry of BOTH `M88_0` (`|Δx_0| = 0`)
       and `M88_h` (`|Δx_0| = 1/2`), hence `M88`, for ALL `u, v : MgeIdx88`,
    3. Exact degree distribution `[14 × 48, 15 × 32, 16 × 8]`, total incidence sum `1280 = 160 * 8`
       (average degree `1280 / 88 = 160 / 11`, matching the universal spatial-forest lower bound!),
    4. The geometric `4`-orbit partition `mgeOrbit88` (sizes `[16, 32, 32, 8]`) is an **exact
       equitable quotient** onto `Q_4 = [[0,8,4,2],[4,0,8,2],[2,8,4,1],[4,8,4,0]]` for ALL `u : MgeIdx88`
       and ALL `o : Fin 4`. -/
theorem thm_mge_alt_x0_planes_quotient_M88_structure :
    (∀ ci : Fin 8, mgeInD4 (mgeClassVec ci) ∧ mgeClassOf (mgeClassVec ci) = ci) ∧
    (∀ u : MgeIdx88, mgeM88 u u = 0) ∧
    (∀ u v : MgeIdx88, mgeM88_0 u v = mgeM88_0 v u ∧ mgeM88_h u v = mgeM88_h v u ∧ mgeM88 u v = mgeM88 v u) ∧
    (mgeAll88.filter (fun u => mgeSum88 (fun v => mgeM88 u v) == 14)).length = 48 ∧
    (mgeAll88.filter (fun u => mgeSum88 (fun v => mgeM88 u v) == 15)).length = 32 ∧
    (mgeAll88.filter (fun u => mgeSum88 (fun v => mgeM88 u v) == 16)).length = 8 ∧
    mgeSum88 (fun u => mgeSum88 (fun v => mgeM88 u v)) = 1280 ∧
    ((List.finRange 4).map fun o => (mgeAll88.filter fun u => mgeOrbit88 u == o).length) =
      [16, 32, 32, 8] ∧
    (∀ (u : MgeIdx88) (o : Fin 4),
      mgeSum88 (fun v => if mgeOrbit88 v = o then mgeM88 u v else 0) = mgeQ4 (mgeOrbit88 u) o) := by
  have hS := mge_m88_struct_checks
  have hSym := mge_m88_sym_check
  dsimp only at hS hSym
  rcases hS with ⟨hPar, hDiagEq, hD14, hD15, hD16, hTot, hOrbSz⟩
  have hRowSum : ∀ u : MgeIdx88, mgeSum88 (fun v => mgeM88 u v) = (mgeNeighbors88 u).length := by
    intro u
    have h1 := mge_m88_action_eq (fun _ => 1) u
    have hL : (fun v : MgeIdx88 => mgeM88 u v * 1) = (fun v : MgeIdx88 => mgeM88 u v) := by
      funext v; exact Nat.mul_one _
    rw [hL] at h1
    rw [h1]
    have hLen : ∀ {α : Type} (l : List α), mgeListSum (l.map (fun _ => 1)) = l.length := by
      intro α l; induction l with
      | nil => rfl
      | cons _ t ih => simp only [List.map_cons, mgeListSum, List.length_cons, ih]; omega
    exact hLen (mgeNeighbors88 u)
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_, ?_, hOrbSz, ?_⟩
  · intro ci
    have h := (List.all_eq_true.mp hPar) ci (List.mem_finRange ci)
    simp only [Bool.and_eq_true, decide_eq_true_eq, beq_iff_eq] at h
    exact h
  · intro u
    have hu1 := (List.all_eq_true.mp hDiagEq) u.1 (List.mem_finRange u.1)
    have hu2 := (List.all_eq_true.mp hu1) u.2 (List.mem_finRange u.2)
    rw [mge_lookup88_eq] at hu2
    have hAll := (Bool.and_eq_true _ _ |>.mp hu2).1
    have h0 : mgeM88_0 u u = 0 := by
      apply mge_countP_eq_zero_of_not_mem
      intro p hp
      have hne := bne_iff_ne.mp ((List.all_eq_true.mp hAll) p hp)
      simp only [beq_false_of_ne hne, Bool.false_and]
    have h1 : mgeM88_h u u = 0 := by
      apply mge_countP_eq_zero_of_not_mem
      intro p hp
      have hne := bne_iff_ne.mp ((List.all_eq_true.mp hAll) p hp)
      simp only [beq_false_of_ne hne, Bool.false_and]
    simp only [mgeM88, h0, h1]
  · have hPair : ∀ u v : MgeIdx88, (∃ b : Bool, (v, b) ∈ mgeNeighbors88 u) →
        mgeM88_0 u v = mgeM88_0 v u ∧ mgeM88_h u v = mgeM88_h v u := by
      intro u v ⟨b, hMem⟩
      have hu1 := (List.all_eq_true.mp hSym) u.1 (List.mem_finRange u.1)
      have hu2 := (List.all_eq_true.mp hu1) u.2 (List.mem_finRange u.2)
      rw [mge_lookup88_eq] at hu2
      have hp := (List.all_eq_true.mp hu2) (v, b) hMem
      rw [mge_lookup88_eq] at hp
      simp only [Bool.and_eq_true, beq_iff_eq] at hp
      exact hp
    have hZeroOfNo : ∀ u v : MgeIdx88, (¬ ∃ b : Bool, (v, b) ∈ mgeNeighbors88 u) →
        mgeM88_0 u v = 0 ∧ mgeM88_h u v = 0 := by
      intro u v hNo
      constructor
      · apply mge_countP_eq_zero_of_not_mem
        intro ⟨x, bx⟩ hMem
        by_cases hxv : x = v
        · subst hxv; exact absurd ⟨bx, hMem⟩ hNo
        · simp only [beq_false_of_ne hxv, Bool.false_and]
      · apply mge_countP_eq_zero_of_not_mem
        intro ⟨x, bx⟩ hMem
        by_cases hxv : x = v
        · subst hxv; exact absurd ⟨bx, hMem⟩ hNo
        · simp only [beq_false_of_ne hxv, Bool.false_and]
    intro u v
    by_cases huv : ∃ b : Bool, (v, b) ∈ mgeNeighbors88 u
    · have h := hPair u v huv
      exact ⟨h.1, h.2, by unfold mgeM88; rw [h.1, h.2]⟩
    · by_cases hvu : ∃ b : Bool, (u, b) ∈ mgeNeighbors88 v
      · have h := hPair v u hvu
        exact ⟨h.1.symm, h.2.symm, by unfold mgeM88; rw [h.1, h.2]⟩
      · have hz1 := hZeroOfNo u v huv
        have hz2 := hZeroOfNo v u hvu
        exact ⟨by rw [hz1.1, hz2.1], by rw [hz1.2, hz2.2], by unfold mgeM88; rw [hz1.1, hz1.2, hz2.1, hz2.2]⟩
  · simpa only [hRowSum, mge_lookup88_eq] using hD14
  · simpa only [hRowSum, mge_lookup88_eq] using hD15
  · simpa only [hRowSum, mge_lookup88_eq] using hD16
  · rw [mge_sum88_eq_listSum]
    simpa only [hRowSum, mge_lookup88_eq] using hTot
  · intro u o
    have h1 := mge_m88_action_eq (fun v => if mgeOrbit88 v = o then 1 else 0) u
    have hL : (fun v : MgeIdx88 => mgeM88 u v * (if mgeOrbit88 v = o then 1 else 0)) =
        (fun v : MgeIdx88 => if mgeOrbit88 v = o then mgeM88 u v else 0) := by
      funext v
      by_cases h : mgeOrbit88 v = o
      · simp only [mge_ite_true h, Nat.mul_one]
      · simp only [mge_ite_false h, Nat.mul_zero]
    rw [hL] at h1
    rw [h1]
    have hCnt : ∀ (l : List (MgeIdx88 × Bool)),
        mgeListSum (l.map (fun p => if mgeOrbit88 p.1 = o then 1 else 0)) =
          l.countP (fun p => mgeOrbit88 p.1 == o) := by
      intro l
      induction l with
      | nil => rfl
      | cons p tl ih =>
        simp only [List.map_cons, mgeListSum, List.countP_cons, ih]
        by_cases h : mgeOrbit88 p.1 = o
        · simp only [h, beq_self_eq_true, ite_true]; omega
        · simp only [beq_false_of_ne h, mge_ite_false h, Bool.false_eq_true, ite_false,
            Nat.zero_add, Nat.add_zero]
    rw [hCnt]
    have hu1 := (List.all_eq_true.mp hDiagEq) u.1 (List.mem_finRange u.1)
    have hu2 := (List.all_eq_true.mp hu1) u.2 (List.mem_finRange u.2)
    rw [mge_lookup88_eq] at hu2
    have ho := (List.all_eq_true.mp (Bool.and_eq_true _ _ |>.mp hu2).2) o (List.mem_finRange o)
    exact beq_iff_eq.mp ho

/-- Exact positive integer Collatz-Wielandt eigenvector witness on `MgeIdx88` (`4`-orbit constant),
    certifying the sharp 6-decimal bracket `14568425 / 1000000 < Λ_Alt < 14568426 / 1000000`. -/
def mgePerronVec88 (u : MgeIdx88) : Nat :=
  match (mgeOrbit88 u).val with
  | 0 => 100000000
  | 1 => 101069738
  | 2 => 106035577
  | _ => 112071153

/-- Time-tilted `88 × 88` `Alt-x0+planes` Dobrushin kernel at `β = 274292 / 1000000`
    (strictly past the 1D-axial single-link chordal ceiling `4 / (4 + 4√7) ≈ 0.274291885`)
    with time tilt `e^{m/2} = 1001 / 1000 > 1` (`C = mgeK88_tilted / 10^9`, `c = β/4 = 68573/10^6`). -/
def mgeK88_tilted (u v : MgeIdx88) : Nat :=
  68573 * (1000 * mgeM88_0 u v + 1001 * mgeM88_h u v)

/-- Exact `n`-step matrix power `K^n` on `MgeIdx88 = Fin 8 × Fin 11`. -/
def mgeMatPow88 (K : MgeIdx88 → MgeIdx88 → Nat) : Nat → MgeIdx88 → MgeIdx88 → Nat
  | 0, x, y => if x = y then 1 else 0
  | n + 1, x, y => mgeSum88 (fun z => K x z * mgeMatPow88 K n z y)

/-- Cleared finite-horizon entrywise Dobrushin path sum on `MgeIdx88`. -/
def mgeEntryTailSum88 (K : MgeIdx88 → MgeIdx88 → Nat) (Q : Nat)
    (x y : MgeIdx88) (d M : Nat) : Nat :=
  sumNat M (fun j => mgeMatPow88 K (d + j) x y * Q ^ (M - 1 - j))

private theorem mge_matPow88_weighted_step (K : MgeIdx88 → MgeIdx88 → Nat)
    (Q p q : Nat) (v : MgeIdx88 → Nat)
    (hStep : ∀ x : MgeIdx88, q * mgeSum88 (fun y => K x y * v y) ≤ p * Q * v x) :
    ∀ (n : Nat) (x : MgeIdx88),
      q ^ n * mgeSum88 (fun y => mgeMatPow88 K n x y * v y) ≤ (p * Q) ^ n * v x := by
  intro n
  induction n with
  | zero =>
    intro x
    simp only [Nat.pow_zero, Nat.one_mul, mgeMatPow88]
    rw [mge_sum88_eq_listSum, mge_listSum_map_delta x v mgeAll88 mge_all88_nodup (mge_mem_all88 x)]
  | succ m ih =>
    intro x
    have hDist : mgeSum88 (fun y => mgeMatPow88 K (m + 1) x y * v y) =
        mgeSum88 (fun z => K x z * mgeSum88 (fun y => mgeMatPow88 K m z y * v y)) := by
      simp only [mgeMatPow88, mge_sum88_eq_listSum]
      have h1 : (fun y : MgeIdx88 => mgeListSum (mgeAll88.map (fun z => K x z * mgeMatPow88 K m z y)) * v y) =
          (fun y : MgeIdx88 => mgeListSum (mgeAll88.map (fun z => K x z * (mgeMatPow88 K m z y * v y)))) := by
        funext y
        rw [← mge_listSum_map_mul_const]
        exact congrArg mgeListSum (congrArg (fun g => mgeAll88.map g) (funext fun z => Nat.mul_assoc (K x z) (mgeMatPow88 K m z y) (v y)))
      rw [h1, mge_listSum_swap]
      exact congrArg mgeListSum (congrArg (fun g => mgeAll88.map g) (funext fun z =>
        mge_listSum_map_const_mul (K x z) (fun y => mgeMatPow88 K m z y * v y) mgeAll88))
    rw [hDist, Nat.pow_succ q m]
    have hPull : q ^ m * q * mgeSum88 (fun z => K x z * mgeSum88 (fun y => mgeMatPow88 K m z y * v y)) =
        q * mgeSum88 (fun z => K x z * (q ^ m * mgeSum88 (fun y => mgeMatPow88 K m z y * v y))) := by
      rw [Nat.mul_comm (q ^ m) q, Nat.mul_assoc q (q ^ m), mge_sum88_eq_listSum, mge_sum88_eq_listSum,
          ← mge_listSum_map_const_mul]
      exact congrArg (q * ·) (congrArg mgeListSum (congrArg (fun g => mgeAll88.map g) (funext fun z => by ac_rfl)))
    rw [hPull]
    have hLe1 : mgeSum88 (fun z => K x z * (q ^ m * mgeSum88 (fun y => mgeMatPow88 K m z y * v y))) ≤
        mgeSum88 (fun z => K x z * ((p * Q) ^ m * v z)) := by
      rw [mge_sum88_eq_listSum, mge_sum88_eq_listSum]
      exact mge_listSum_map_le _ _ mgeAll88 (fun z _ => Nat.mul_le_mul_left (K x z) (ih z))
    have hRew : mgeSum88 (fun z => K x z * ((p * Q) ^ m * v z)) =
        (p * Q) ^ m * mgeSum88 (fun z => K x z * v z) := by
      rw [mge_sum88_eq_listSum, mge_sum88_eq_listSum, ← mge_listSum_map_const_mul]
      exact congrArg mgeListSum (congrArg (fun g => mgeAll88.map g) (funext fun z => by ac_rfl))
    have hLe2 : q * mgeSum88 (fun z => K x z * (q ^ m * mgeSum88 (fun y => mgeMatPow88 K m z y * v y))) ≤
        (p * Q) ^ m * (q * mgeSum88 (fun z => K x z * v z)) := by
      have hMul := Nat.mul_le_mul_left q hLe1
      rw [hRew, ← Nat.mul_assoc, Nat.mul_comm q ((p * Q) ^ m), Nat.mul_assoc] at hMul
      exact hMul
    have hLe3 : (p * Q) ^ m * (q * mgeSum88 (fun z => K x z * v z)) ≤ (p * Q) ^ (m + 1) * v x := by
      have h := Nat.mul_le_mul_left ((p * Q) ^ m) (hStep x)
      rw [← Nat.mul_assoc ((p * Q) ^ m) (p * Q) (v x), ← Nat.pow_succ (p * Q) m] at h
      exact h
    exact Nat.le_trans hLe2 hLe3

private theorem mge_geomTailNum_le (p q d M : Nat) (hpq : p < q) :
    (q - p) * geomTailNum p q d M ≤ p ^ d * q ^ M := by
  have hT := (thm_mg_dobrushin_power_and_geometric_decay
    (fun (_ _ : Fin 1) => 0) 1 p q 1 1 (fun _ => 1) hpq (fun _ => ⟨Nat.le_refl 1, Nat.le_refl 1⟩)
    (fun _ => Nat.zero_le _)).2.2.1 d M
  omega

private theorem mge_dobrushin88_decay (K : MgeIdx88 → MgeIdx88 → Nat)
    (Q p q vMin vMax : Nat) (v : MgeIdx88 → Nat) (hpq : p < q)
    (hvBounds : ∀ x : MgeIdx88, vMin ≤ v x ∧ v x ≤ vMax)
    (hStep : ∀ x : MgeIdx88, q * mgeSum88 (fun y => K x y * v y) ≤ p * Q * v x) :
    (∀ (n : Nat) (x y : MgeIdx88),
      q ^ n * mgeMatPow88 K n x y * vMin ≤ (p * Q) ^ n * vMax) ∧
    (∀ d M : Nat, M ≥ 1 → ∀ x y : MgeIdx88,
      q ^ d * (q - p) * vMin * mgeEntryTailSum88 K Q x y d M ≤
        Q ^ (d + M - 1) * (p ^ d * q) * vMax) := by
  have hPow := mge_matPow88_weighted_step K Q p q v hStep
  have hEntry : ∀ (n : Nat) (x y : MgeIdx88), q ^ n * mgeMatPow88 K n x y * vMin ≤ (p * Q) ^ n * vMax := by
    intro n x y
    have h1 : mgeMatPow88 K n x y * vMin ≤ mgeMatPow88 K n x y * v y :=
      Nat.mul_le_mul_left _ (hvBounds y).1
    have h2 : mgeMatPow88 K n x y * v y ≤ mgeSum88 (fun z => mgeMatPow88 K n x z * v z) := by
      rw [mge_sum88_eq_listSum]
      exact mge_listSum_map_single_le (fun z => mgeMatPow88 K n x z * v z) mgeAll88 y (mge_mem_all88 y)
    have h3 : q ^ n * (mgeMatPow88 K n x y * vMin) ≤
        q ^ n * mgeSum88 (fun z => mgeMatPow88 K n x z * v z) :=
      Nat.mul_le_mul_left (q ^ n) (Nat.le_trans h1 h2)
    have h4 : (p * Q) ^ n * v x ≤ (p * Q) ^ n * vMax := Nat.mul_le_mul_left _ (hvBounds x).2
    rw [Nat.mul_assoc]
    exact Nat.le_trans h3 (Nat.le_trans (hPow n x) h4)
  refine ⟨hEntry, ?_⟩
  intro d M hM x y
  have hqPos : 0 < q := by omega
  have hqMPos : 0 < q ^ (M - 1) := Nat.pow_pos hqPos
  have hTerm : ∀ j : Nat, j < M →
      q ^ (d + M - 1) * (vMin * (mgeMatPow88 K (d + j) x y * Q ^ (M - 1 - j))) ≤
        Q ^ (d + M - 1) * (p ^ (d + j) * q ^ (M - 1 - j)) * vMax := by
    intro j hj
    have hExp : d + M - 1 = (d + j) + (M - 1 - j) := by omega
    have hEj := hEntry (d + j) x y
    calc q ^ (d + M - 1) * (vMin * (mgeMatPow88 K (d + j) x y * Q ^ (M - 1 - j)))
        = (q ^ (M - 1 - j) * Q ^ (M - 1 - j)) * (q ^ (d + j) * mgeMatPow88 K (d + j) x y * vMin) := by
            rw [hExp, Nat.pow_add]; ac_rfl
      _ ≤ (q ^ (M - 1 - j) * Q ^ (M - 1 - j)) * ((p * Q) ^ (d + j) * vMax) :=
            Nat.mul_le_mul_left _ hEj
      _ = Q ^ (d + M - 1) * (p ^ (d + j) * q ^ (M - 1 - j)) * vMax := by
            rw [mge_nat_mul_pow p Q (d + j), hExp, Nat.pow_add Q (d + j) (M - 1 - j)]; ring
  have hSumLe : q ^ (d + M - 1) * (vMin * mgeEntryTailSum88 K Q x y d M) ≤
      Q ^ (d + M - 1) * geomTailNum p q d M * vMax := by
    unfold mgeEntryTailSum88 geomTailNum
    rw [← mge_sumNat_mul_left, ← mge_sumNat_mul_left, ← mge_sumNat_mul_left, ← mge_sumNat_mul_right]
    exact mge_sumNat_le M _ _ hTerm
  have hGeomLe := mge_geomTailNum_le p q d M hpq
  have hMul : q ^ (M - 1) * (q ^ d * (q - p) * vMin * mgeEntryTailSum88 K Q x y d M) ≤
      q ^ (M - 1) * (Q ^ (d + M - 1) * (p ^ d * q) * vMax) := by
    have hExp : d + M - 1 = d + (M - 1) := by omega
    have hLhs : q ^ (M - 1) * (q ^ d * (q - p) * vMin * mgeEntryTailSum88 K Q x y d M) =
        (q - p) * (q ^ (d + M - 1) * (vMin * mgeEntryTailSum88 K Q x y d M)) := by
      rw [hExp, Nat.pow_add]; ac_rfl
    have hRhs : q ^ (M - 1) * (Q ^ (d + M - 1) * (p ^ d * q) * vMax) =
        Q ^ (d + M - 1) * (p ^ d * q ^ M) * vMax := by
      have hPowM : q ^ (M - 1) * q = q ^ M := by
        rw [← Nat.pow_succ q (M - 1)]
        exact congrArg (q ^ ·) (Nat.sub_add_cancel hM)
      calc q ^ (M - 1) * (Q ^ (d + M - 1) * (p ^ d * q) * vMax)
          = Q ^ (d + M - 1) * (p ^ d * (q ^ (M - 1) * q)) * vMax := by ac_rfl
        _ = Q ^ (d + M - 1) * (p ^ d * q ^ M) * vMax := by rw [hPowM]
    rw [hLhs, hRhs]
    have h1 := Nat.mul_le_mul_left (q - p) hSumLe
    have hRew : (q - p) * (Q ^ (d + M - 1) * geomTailNum p q d M * vMax) =
        Q ^ (d + M - 1) * ((q - p) * geomTailNum p q d M) * vMax := by ac_rfl
    rw [hRew] at h1
    exact Nat.le_trans h1 (Nat.mul_le_mul_right vMax (Nat.mul_le_mul_left _ hGeomLe))
  exact Nat.le_of_mul_le_mul_left hMul hqMPos

private theorem mge_cw88_checks :
    let tbl := mgeTable88
    ((List.finRange 8).all fun ci =>
      (List.finRange 11).all fun j =>
        let u : MgeIdx88 := (ci, j)
        let nu := mgeLookup88 tbl u
        let mv := mgeListSum (nu.map fun p => mgePerronVec88 p.1)
        let kv := 68573 * mgeListSum (nu.map fun p => (if p.2 then 1001 else 1000) * mgePerronVec88 p.1)
        decide (100000000 ≤ mgePerronVec88 u) &&
        decide (mgePerronVec88 u ≤ 112071153) &&
        decide (14568425 * mgePerronVec88 u < 1000000 * mv) &&
        decide (1000000 * mv < 14568426 * mgePerronVec88 u) &&
        decide (10000 * kv ≤ 9996 * 1000000000 * mgePerronVec88 u)) = true ∧
    14568426 < 14568500 ∧
    (14568426 - 4 * 1000000) * (14568426 - 4 * 1000000) < 112 * (1000000 * 1000000) ∧
    ZSqrt7.lt (ZSqrt7.ofInt 14568426) (ZSqrt7.scale 1000000 mgLambda11) := by
  decide

/-- Theorem MGE-3: Exact Collatz-Wielandt spectral bracket and `88 × 88` Dobrushin contraction for the
    `Alt-x0+planes` quotient matrix `M88`:
    1. Strictly positive witness `100000000 ≤ mgePerronVec88 u ≤ 112071153` (`∀ u : MgeIdx88`),
    2. Sharp Collatz-Wielandt bracket `14568425 / 1000000 < (M88 v)_u / v_u < 14568426 / 1000000`
       for ALL `u : MgeIdx88`, certifying `Λ_Alt < 14.568426 < 14.5685`,
    3. Strict victory over 1D spatial axial gauge `4 + 4√7 = 14.583005...` via BOTH exact cleared
       quadratic inequality `(14568426 - 4·10^6)^2 < 112·(10^6)^2` AND `ZSqrt7.lt`,
    4. Full `88 × 88` all-`n` power decay and uniform finite-horizon geometric tail decay on time-tilted
       `1000 M88_0 + 1001 M88_h` (`e^{m/2} = 1001/1000 > 1`) at `β = 274292 / 1000000`, STRICTLY past
       the 1D-axial single-link chordal ceiling `4 / (4 + 4√7)`! -/
theorem thm_mge_alt_x0_planes_spectral_bound_and_contraction :
    (∀ u : MgeIdx88, 100000000 ≤ mgePerronVec88 u ∧ mgePerronVec88 u ≤ 112071153) ∧
    (∀ u : MgeIdx88,
      14568425 * mgePerronVec88 u < 1000000 * mgeSum88 (fun v => mgeM88 u v * mgePerronVec88 v) ∧
      1000000 * mgeSum88 (fun v => mgeM88 u v * mgePerronVec88 v) < 14568426 * mgePerronVec88 u) ∧
    14568426 < 14568500 ∧
    (14568426 - 4 * 1000000) * (14568426 - 4 * 1000000) < 112 * (1000000 * 1000000) ∧
    ZSqrt7.lt (ZSqrt7.ofInt 14568426) (ZSqrt7.scale 1000000 mgLambda11) ∧
    (∀ (n : Nat) (x y : MgeIdx88),
      10000 ^ n * mgeMatPow88 mgeK88_tilted n x y * 100000000 ≤
        (9996 * 1000000000) ^ n * 112071153) ∧
    (∀ d M : Nat, M ≥ 1 → ∀ x y : MgeIdx88,
      10000 ^ d * (10000 - 9996) * 100000000 * mgeEntryTailSum88 mgeK88_tilted 1000000000 x y d M ≤
        1000000000 ^ (d + M - 1) * (9996 ^ d * 10000) * 112071153) := by
  have hC := mge_cw88_checks
  dsimp only at hC
  rcases hC with ⟨hAll, hLt5, hSq, hZ7⟩
  have hRow : ∀ u : MgeIdx88,
      (100000000 ≤ mgePerronVec88 u ∧ mgePerronVec88 u ≤ 112071153) ∧
      (14568425 * mgePerronVec88 u < 1000000 * mgeListSum ((mgeNeighbors88 u).map fun p => mgePerronVec88 p.1) ∧
       1000000 * mgeListSum ((mgeNeighbors88 u).map fun p => mgePerronVec88 p.1) < 14568426 * mgePerronVec88 u) ∧
      10000 * (68573 * mgeListSum ((mgeNeighbors88 u).map fun p => (if p.2 then 1001 else 1000) * mgePerronVec88 p.1)) ≤
        9996 * 1000000000 * mgePerronVec88 u := by
    intro u
    have h1 := (List.all_eq_true.mp hAll) u.1 (List.mem_finRange u.1)
    have h2 := (List.all_eq_true.mp h1) u.2 (List.mem_finRange u.2)
    rw [mge_lookup88_eq] at h2
    simp only [Bool.and_eq_true, decide_eq_true_eq] at h2
    exact ⟨⟨h2.1.1.1.1, h2.1.1.1.2⟩, ⟨h2.1.1.2, h2.1.2⟩, h2.2⟩
  have hWBounds : ∀ u : MgeIdx88, 100000000 ≤ mgePerronVec88 u ∧ mgePerronVec88 u ≤ 112071153 :=
    fun u => (hRow u).1
  have hCWExact : ∀ u : MgeIdx88,
      14568425 * mgePerronVec88 u < 1000000 * mgeSum88 (fun v => mgeM88 u v * mgePerronVec88 v) ∧
      1000000 * mgeSum88 (fun v => mgeM88 u v * mgePerronVec88 v) < 14568426 * mgePerronVec88 u := by
    intro u
    rw [mge_m88_action_eq]
    exact (hRow u).2.1
  have hTiltStep : ∀ u : MgeIdx88,
      10000 * mgeSum88 (fun v => mgeK88_tilted u v * mgePerronVec88 v) ≤
        9996 * 1000000000 * mgePerronVec88 u := by
    intro u
    have hPull : mgeSum88 (fun v => mgeK88_tilted u v * mgePerronVec88 v) =
        68573 * mgeSum88 (fun v => (1000 * mgeM88_0 u v + 1001 * mgeM88_h u v) * mgePerronVec88 v) := by
      rw [mge_sum88_eq_listSum, mge_sum88_eq_listSum, ← mge_listSum_map_const_mul]
      exact congrArg mgeListSum (congrArg (fun g => mgeAll88.map g) (funext fun v => Nat.mul_assoc 68573 _ _))
    rw [hPull, mge_m88_linear_action]
    exact (hRow u).2.2
  have hDec := mge_dobrushin88_decay mgeK88_tilted 1000000000 9996 10000 100000000 112071153
    mgePerronVec88 (by decide) hWBounds hTiltStep
  exact ⟨hWBounds, hCWExact, hLt5, hSq, hZ7, hDec.1, hDec.2⟩


/-! ## Section 3: Exact `SU(3)` Staple Convex-Hull, Maximal-Torus Trace Hull & Cardano Algebra -/

/-- Unconstrained 5-variable polynomial residual for the `SU(3)` maximal-torus eigenphase sum
    `3 cos γ - (cos(γ + β + δ) + cos(γ + β - δ) + cos(γ - 2β))` (with `u_1 + u_2 + u_3 = 3 γ = φ`),
    expressed directly in `(c_γ, s_γ, c_β, s_β, c_δ)` over `ℤ` (lifting verbatim to `ℝ`). -/
def mgeSu3HullResidual (cg sg cb sb cd : Int) : Int :=
  3 * cg - (2 * (cg * cb - sg * sb) * cd + cg * (2 * (cb * cb) - 1) + 2 * sg * sb * cb)

/-- Cleared-denominator homogenized 6-variable form of `mgeSu3HullResidual` for rational circle points
    `(c_γ/D, s_γ/D)`, `(c_β/D, s_β/D)`, `c_δ/D` (non-degenerate across infinitely many Pythagorean triples!). -/
def mgeSu3HullResidualHom (cg sg cb sb cd D : Int) : Int :=
  3 * cg * (D * D * D) -
    (2 * D * (cg * cb - sg * sb) * cd + cg * (2 * (cb * cb) - D * D) * D + 2 * sg * sb * cb * D)

/-- Exact degree-3 Chebyshev polynomial `T_3(x) = 4 x^3 - 3 x` (representing `cos(3 γ) = 4 cos^3 γ - 3 cos γ`). -/
def mgeChebT3 (x : Int) : Int := 4 * (x * x * x) - 3 * x

/-- Homogenized degree-3 Chebyshev numerator `4 x^3 - 3 x D^2`. -/
def mgeChebT3Hom (x D : Int) : Int := 4 * (x * x * x) - 3 * x * (D * D)

private theorem mge_su3_hull_poly_id (cg sg cb sb cd : Int) :
    mgeSu3HullResidual cg sg cb sb cd =
      2 * (cg * cb - sg * sb) * (1 - cd) + 2 * (1 - cb) * (2 * cg + (cg * cb + sg * sb)) ∧
    mgeSu3HullResidual cg sg cb sb cd =
      2 * (-(cg * cb - sg * sb)) * (1 + cd) + 2 * (1 + cb) * (2 * cg - (cg * cb + sg * sb)) := by
  unfold mgeSu3HullResidual; exact ⟨by ring, by ring⟩

private theorem mge_su3_hull_hom_poly_id (cg sg cb sb cd D : Int) :
    mgeSu3HullResidualHom cg sg cb sb cd D =
      2 * D * (cg * cb - sg * sb) * (D - cd) +
      2 * (D - cb) * (2 * cg * (D * D) + (cg * cb + sg * sb) * D) ∧
    mgeSu3HullResidualHom cg sg cb sb cd D =
      2 * D * (-(cg * cb - sg * sb)) * (D + cd) +
      2 * (D + cb) * (2 * cg * (D * D) - (cg * cb + sg * sb) * D) := by
  unfold mgeSu3HullResidualHom; exact ⟨by ring, by ring⟩

/-- Theorem MGE-4: Exact `SU(3)` staple convex-hull maximal-torus algebraic theorem
    (`cos u_1 + cos u_2 + cos u_3 ≤ 3 cos(φ/3)` for `u_1 + u_2 + u_3 = φ ∈ [-π, π]`, yielding
    `σ_1 + σ_2 + σ_3 ≤ 24 cos(φ/3)` and `m_1 + m_2 + m_3 ≤ 8 β cos(φ/3)` across 8 staples):
    1. Exact 2-branch unconstrained polynomial factorizations over `ℤ` (lifting verbatim to `ℝ`),
    2. Unconditional cleared-denominator nonnegativity `mgeSu3HullResidualHom cg sg cb sb cd D ≥ 0`
       on ALL rational circle triples `cg^2 + sg^2 = D^2`, `cb^2 + sb^2 = D^2`, `|cd| ≤ D`, `D ≥ 0`
       with `2 cg ≥ D` (`cos(φ/3) ≥ 1/2`, i.e., `|φ| ≤ π`), proved via 2D Cauchy-Schwarz + branch sign,
    3. Exact Chebyshev triple-angle Lagrange stationary-point domination:
       `3 x - (-T_3(x)) = 4 x^3 ≥ 0` (homogenized `3 x D^2 + mgeChebT3Hom x D = 4 x^3 ≥ 0`),
    4. Exact 8-staple linear aggregation `∑_{k=0}^7 s_k ≤ 24 C` and extreme 8-staple witness
       `W = 4 I + 4 diag(-i, -i, -1) = diag(4 - 4i, 4 - 4i, 0)` having `|4 - 4i|^2 = 32` and
       `(2 √32)^2 = 128 < 144 = 12^2 = (24 cos(π/3))^2`. -/
theorem thm_mge_su3_staple_convex_hull_algebraic :
    (∀ cg sg cb sb cd : Int,
      mgeSu3HullResidual cg sg cb sb cd =
        2 * (cg * cb - sg * sb) * (1 - cd) + 2 * (1 - cb) * (2 * cg + (cg * cb + sg * sb)) ∧
      mgeSu3HullResidual cg sg cb sb cd =
        2 * (-(cg * cb - sg * sb)) * (1 + cd) + 2 * (1 + cb) * (2 * cg - (cg * cb + sg * sb))) ∧
    (∀ cg sg cb sb cd D : Int, 0 ≤ D →
      cg * cg + sg * sg = D * D →
      cb * cb + sb * sb = D * D →
      -D ≤ cd → cd ≤ D →
      D ≤ 2 * cg →
      0 ≤ mgeSu3HullResidualHom cg sg cb sb cd D) ∧
    (∀ x D : Int, 0 ≤ x →
      3 * x + mgeChebT3 x = 4 * (x * x * x) ∧
      3 * x * (D * D) + mgeChebT3Hom x D = 4 * (x * x * x) ∧
      0 ≤ 4 * (x * x * x)) ∧
    (∀ (s : Fin 8 → Int) (C : Int), (∀ k : Fin 8, s k ≤ 3 * C) →
      s ⟨0, by decide⟩ + s ⟨1, by decide⟩ + s ⟨2, by decide⟩ + s ⟨3, by decide⟩ +
      s ⟨4, by decide⟩ + s ⟨5, by decide⟩ + s ⟨6, by decide⟩ + s ⟨7, by decide⟩ ≤ 24 * C) ∧
    (4 * 4 + (-4) * (-4) = (32 : Int) ∧ 4 * 32 = (128 : Int) ∧ (128 : Int) < 12 * 12) := by
  refine ⟨mge_su3_hull_poly_id, ?_, ?_, ?_, by decide⟩
  · intro cg sg cb sb cd D hD hG hB hcdLo hcdHi hHalf
    have hCS := mge_int_cauchy_schwarz_2d cg sg cb sb
    rw [hG, hB] at hCS
    have hD2 : 0 ≤ D * D := int_sq_nonneg D
    have hSqLe : (cg * cb + sg * sb) * (cg * cb + sg * sb) ≤ (D * D) * (D * D) := by
      have hnn := int_sq_nonneg (cg * sb - sg * cb); omega
    have ⟨hDotLo, hDotHi⟩ := mge_int_abs_le_of_sq_le hD2 hSqLe
    have hCbSq : cb * cb ≤ D * D := by have hnn := int_sq_nonneg sb; omega
    have ⟨hCbLo, hCbHi⟩ := mge_int_abs_le_of_sq_le hD hCbSq
    have h2cgD : D * D ≤ 2 * cg * D := by
      have h1 := Int.mul_nonneg (show 0 ≤ 2 * cg - D by omega) hD
      rw [Int.sub_mul] at h1; omega
    have hFacPos : 0 ≤ 2 * cg * (D * D) + (cg * cb + sg * sb) * D := by
      have h1 : 0 ≤ (2 * cg * D + (cg * cb + sg * sb)) * D := Int.mul_nonneg (by omega) hD
      rw [Int.add_mul, Int.mul_assoc (2 * cg) D D] at h1; exact h1
    have hFacNeg : 0 ≤ 2 * cg * (D * D) - (cg * cb + sg * sb) * D := by
      have h1 : 0 ≤ (2 * cg * D - (cg * cb + sg * sb)) * D := Int.mul_nonneg (by omega) hD
      rw [Int.sub_mul, Int.mul_assoc (2 * cg) D D] at h1; exact h1
    have hId := mge_su3_hull_hom_poly_id cg sg cb sb cd D
    by_cases hSign : 0 ≤ cg * cb - sg * sb
    · rw [hId.1]
      have t1 : 0 ≤ 2 * D * (cg * cb - sg * sb) * (D - cd) :=
        Int.mul_nonneg (Int.mul_nonneg (by omega) hSign) (by omega)
      have t2 : 0 ≤ 2 * (D - cb) * (2 * cg * (D * D) + (cg * cb + sg * sb) * D) :=
        Int.mul_nonneg (by omega) hFacPos
      omega
    · rw [hId.2]
      have t1 : 0 ≤ 2 * D * (-(cg * cb - sg * sb)) * (D + cd) :=
        Int.mul_nonneg (Int.mul_nonneg (by omega) (by omega)) (by omega)
      have t2 : 0 ≤ 2 * (D + cb) * (2 * cg * (D * D) - (cg * cb + sg * sb) * D) :=
        Int.mul_nonneg (by omega) hFacNeg
      omega
  · intro x D hx
    refine ⟨by unfold mgeChebT3; omega, by unfold mgeChebT3Hom; omega, ?_⟩
    have hx3 : 0 ≤ x * x * x := Int.mul_nonneg (int_sq_nonneg x) hx
    omega
  · intro s C hs
    have h0 := hs ⟨0, by decide⟩; have h1 := hs ⟨1, by decide⟩
    have h2 := hs ⟨2, by decide⟩; have h3 := hs ⟨3, by decide⟩
    have h4 := hs ⟨4, by decide⟩; have h5 := hs ⟨5, by decide⟩
    have h6 := hs ⟨6, by decide⟩; have h7 := hs ⟨7, by decide⟩
    omega

/-- Theorem MGE-5: Exact `SU(3)` maximal-torus trace hull `Re Tr(U) ∈ [-3/2, 3]` (proved via exact
    2-square SOS on `u_1 + u_2 + u_3 = 0`), exact Cardano depressed-cubic transformation for the
    `3 × 3` singular-value Gram matrix `H = W^† W`, and exact singular-value Cauchy-Schwarz / 8-staple
    Frobenius curvature bound:
    1. Upper trace bound `|c_1 + c_2 + c_3| ≤ 3 D` on `c_k^2 + s_k^2 = D^2` (`|Re Tr U| ≤ 3`),
    2. Exact deltoid lower-hull SOS identity (`u_1 = α + δ, u_2 = α - δ, u_3 = -2 α`, `∑ u_k = 0`):
       `2 (2 c_α c_δ + (2 c_α^2 - 1)) + 3 = (2 c_α + c_δ)^2 + (1 - c_δ^2)` (and homogenized
       `2 (2 c_α c_δ + 2 c_α^2 - D^2) + 3 D^2 = (2 c_α + c_δ)^2 + s_δ^2 ≥ 0`), proving
       `Re Tr(U) ≥ -3/2` everywhere on `SU(3)` with zero calculus,
    3. Exact Cardano depressed-cubic identity for `λ^3 - tr λ^2 + q_1 λ - detH` (cleared by `27`),
       matching `d4-mass-gap-su2-su3-sharp.ts` line 1913,
    4. Exact 3-variable Cauchy-Schwarz `(s_1 + s_2 + s_3)^2 ≤ 3 (s_1^2 + s_2^2 + s_3^2)`. -/
theorem thm_mge_su3_maximal_torus_and_cardano_invariants :
    (∀ c1 s1 c2 s2 c3 s3 D : Int, 0 ≤ D →
      c1 * c1 + s1 * s1 = D * D → c2 * c2 + s2 * s2 = D * D → c3 * c3 + s3 * s3 = D * D →
      -3 * D ≤ c1 + c2 + c3 ∧ c1 + c2 + c3 ≤ 3 * D) ∧
    (∀ ca cd sd : Int,
      2 * (2 * ca * cd + (2 * (ca * ca) - 1)) + 3 =
        (2 * ca + cd) * (2 * ca + cd) + sd * sd + (1 - cd * cd - sd * sd)) ∧
    (∀ ca cd sd D : Int, 0 ≤ D → cd * cd + sd * sd = D * D →
      2 * (2 * ca * cd + (2 * (ca * ca) - D * D)) + 3 * (D * D) =
        (2 * ca + cd) * (2 * ca + cd) + sd * sd ∧
      -(3 * (D * D)) ≤ 2 * (2 * ca * cd + (2 * (ca * ca) - D * D))) ∧
    (∀ lam tr q1 detH : Int,
      27 * (lam * lam * lam - tr * (lam * lam) + q1 * lam - detH) =
        (3 * lam - tr) * (3 * lam - tr) * (3 * lam - tr) +
        3 * (3 * q1 - tr * tr) * (3 * lam - tr) -
        (2 * (tr * tr * tr) - 9 * tr * q1 + 27 * detH)) ∧
    (∀ s1 s2 s3 : Int,
      3 * (s1 * s1 + s2 * s2 + s3 * s3) - (s1 + s2 + s3) * (s1 + s2 + s3) =
        (s1 - s2) * (s1 - s2) + (s2 - s3) * (s2 - s3) + (s3 - s1) * (s3 - s1) ∧
      (s1 + s2 + s3) * (s1 + s2 + s3) ≤ 3 * (s1 * s1 + s2 * s2 + s3 * s3)) := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · intro c1 s1 c2 s2 c3 s3 D hD h1 h2 h3
    have b1 := mge_int_abs_le_of_sq_le hD (show c1 * c1 ≤ D * D by have := int_sq_nonneg s1; omega)
    have b2 := mge_int_abs_le_of_sq_le hD (show c2 * c2 ≤ D * D by have := int_sq_nonneg s2; omega)
    have b3 := mge_int_abs_le_of_sq_le hD (show c3 * c3 ≤ D * D by have := int_sq_nonneg s3; omega)
    exact ⟨by omega, by omega⟩
  · intro ca cd sd; ring
  · intro ca cd sd D _ hCirc
    exact ⟨by nlinarith, by nlinarith [mul_self_nonneg (2 * ca + cd), mul_self_nonneg sd]⟩
  · intro lam tr q1 detH; ring
  · intro s1 s2 s3
    exact ⟨by ring, by nlinarith [mul_self_nonneg (s1 - s2), mul_self_nonneg (s2 - s3), mul_self_nonneg (s3 - s1)]⟩


/-! ## Section 4: Exact `SU(3)` `K = 2` Peter-Weyl Irreps, Casimir Tail Floor, Pieri Rules & Weight Sectors -/

/-- Exact `SU(3)` Weyl dimension formula `d(p, q) = (p + 1)(q + 1)(p + q + 2) / 2`. -/
def mgeSu3Dim (p q : Nat) : Nat :=
  (p + 1) * (q + 1) * (p + q + 2) / 2

/-- Exact cleared quadratic Casimir `3 C_2(p, q) = p^2 + q^2 + p q + 3 p + 3 q`. -/
def mgeSu3Casimir3 (p q : Nat) : Nat :=
  p * p + q * q + p * q + 3 * p + 3 * q

/-- Exact cleared Laplacian eigenvalue `3 λ(p, q) = 6 C_2(p, q) = 2 * mgeSu3Casimir3 p q`. -/
def mgeSu3Lap3 (p q : Nat) : Nat :=
  2 * mgeSu3Casimir3 p q

/-- Complete `K ≤ 2` (`p + q ≤ 2`) `SU(3)` irreducible representation list. -/
def mgeSu3IrrepsK2 : List (Nat × Nat) :=
  [(0, 0), (1, 0), (0, 1), (2, 0), (0, 2), (1, 1)]

private theorem mge_su3_dim_even (p q : Nat) :
    2 * mgeSu3Dim p q = (p + 1) * (q + 1) * (p + q + 2) := by
  unfold mgeSu3Dim
  have hDvd : 2 ∣ (p + 1) * (q + 1) * (p + q + 2) := by
    by_cases hp : p % 2 = 1
    · have h1 : 2 ∣ p + 1 := ⟨(p + 1) / 2, by omega⟩
      exact Nat.dvd_trans h1 (Nat.dvd_trans (Nat.dvd_mul_right _ _) (Nat.dvd_mul_right _ _))
    · by_cases hq : q % 2 = 1
      · have h1 : 2 ∣ q + 1 := ⟨(q + 1) / 2, by omega⟩
        exact Nat.dvd_trans h1 (Nat.dvd_trans (Nat.dvd_mul_left _ _) (Nat.dvd_mul_right _ _))
      · have h1 : 2 ∣ p + q + 2 := ⟨(p + q + 2) / 2, by omega⟩
        exact Nat.dvd_trans h1 (Nat.dvd_mul_left _ _)
  exact Nat.mul_div_cancel' hDvd

private theorem mge_su3_casimir3_tail (p q : Nat) (h : p + q ≥ 3) :
    mgeSu3Casimir3 p q ≥ 16 := by
  unfold mgeSu3Casimir3
  rcases (by omega : p = 0 ∨ p = 1 ∨ p = 2 ∨ 3 ≤ p) with rfl | rfl | rfl | hp <;> nlinarith

/-- Theorem MGE-6: Exact `SU(3)` Weyl dimension formula, complete `K ≤ 2` Peter-Weyl irrep
    enumeration (`dim = 155`, `6` characters, Laplacian spectrum `0, 8/3, 6, 20/3`), and
    **unconditional all-`(p, q)` tail floor `3 C_2(p, q) ≥ 16` (`λ = 2 C_2 ≥ 32/3`)**:
    1. Universal exact evenness `2 * mgeSu3Dim p q = (p + 1)(q + 1)(p + q + 2)`, positivity
       `mgeSu3Dim p q ≥ 1`, and conjugation symmetry `d(p, q) = d(q, p)` & `C_2(p, q) = C_2(q, p)`,
    2. Complete bijective enumeration `∀ p q, p + q ≤ 2 ↔ (p, q) ∈ mgeSu3IrrepsK2` (`6` distinct irreps),
    3. Exact dimensions `[1, 3, 3, 6, 6, 8]` (character sum `27`), exact Peter-Weyl matrix dimension
       `∑ d(p, q)^2 = 1 + 9 + 9 + 36 + 36 + 64 = 155`, and exact Casimir / Laplacian spectrum
       `3 C_2 = [0, 4, 4, 10, 10, 9]`, `3 λ = 6 C_2 = [0, 8, 8, 20, 20, 18]`,
    4. **Unconditional `∀ p q : Nat` tail bound:** `p + q ≥ 3 → 3 C_2(p, q) ≥ 16 ∧ 3 λ(p, q) ≥ 32`,
       attained sharply at `(2, 1)` and `(1, 2)` (`3 C_2 = 16`, `λ = 32/3`). -/
theorem thm_mge_su3_weyl_dim_and_k2_casimir_spectrum :
    (∀ p q : Nat,
      2 * mgeSu3Dim p q = (p + 1) * (q + 1) * (p + q + 2) ∧
      mgeSu3Dim p q ≥ 1 ∧
      mgeSu3Dim p q = mgeSu3Dim q p ∧
      mgeSu3Casimir3 p q = mgeSu3Casimir3 q p) ∧
    (∀ p q : Nat, p + q ≤ 2 ↔ (p, q) ∈ mgeSu3IrrepsK2) ∧
    mgeSu3IrrepsK2.length = 6 ∧
    mgeSu3IrrepsK2.Nodup ∧
    (mgeSu3IrrepsK2.map fun r => mgeSu3Dim r.1 r.2) = [1, 3, 3, 6, 6, 8] ∧
    mgeListSum (mgeSu3IrrepsK2.map fun r => mgeSu3Dim r.1 r.2 * mgeSu3Dim r.1 r.2) = 155 ∧
    (mgeSu3IrrepsK2.map fun r => mgeSu3Casimir3 r.1 r.2) = [0, 4, 4, 10, 10, 9] ∧
    (mgeSu3IrrepsK2.map fun r => mgeSu3Lap3 r.1 r.2) = [0, 8, 8, 20, 20, 18] ∧
    (∀ p q : Nat, p + q ≥ 3 → mgeSu3Casimir3 p q ≥ 16 ∧ mgeSu3Lap3 p q ≥ 32) ∧
    (mgeSu3Casimir3 2 1 = 16 ∧ mgeSu3Casimir3 1 2 = 16 ∧ mgeSu3Lap3 2 1 = 32 ∧ mgeSu3Lap3 1 2 = 32) := by
  refine ⟨?_, ?_, by decide, by decide, by decide, by decide, by decide, by decide, ?_, by decide⟩
  · intro p q
    have hEv := mge_su3_dim_even p q
    have hPos : (p + 1) * (q + 1) * (p + q + 2) ≥ 2 := by
      have h12 : (p + 1) * (q + 1) ≥ 1 := Nat.mul_pos (by omega) (by omega)
      have h123 : (p + 1) * (q + 1) * (p + q + 2) ≥ 1 * 2 := Nat.mul_le_mul h12 (by omega)
      omega
    refine ⟨hEv, by omega, ?_, ?_⟩
    · unfold mgeSu3Dim
      rw [Nat.mul_comm (p + 1) (q + 1), show p + q + 2 = q + p + 2 by omega]
    · unfold mgeSu3Casimir3
      rw [Nat.mul_comm p q]; omega
  · intro p q
    constructor
    · intro h
      have hp : p = 0 ∨ p = 1 ∨ p = 2 := by omega
      have hq : q = 0 ∨ q = 1 ∨ q = 2 := by omega
      rcases hp with rfl | rfl | rfl <;> rcases hq with rfl | rfl | rfl <;>
        (try omega) <;> decide
    · intro hMem
      simp only [mgeSu3IrrepsK2, List.mem_cons, List.not_mem_nil, or_false, Prod.mk.injEq] at hMem
      rcases hMem with ⟨rfl, rfl⟩ | ⟨rfl, rfl⟩ | ⟨rfl, rfl⟩ | ⟨rfl, rfl⟩ | ⟨rfl, rfl⟩ | ⟨rfl, rfl⟩ <;>
        omega
  · intro p q h
    have hc := mge_su3_casimir3_tail p q h
    exact ⟨hc, by unfold mgeSu3Lap3; omega⟩

/-- Exact `SU(3)` Pieri / Clebsch-Gordan branching list for `3 ⊗ V(p, q)` (`(1, 0) ⊗ (p, q)`). -/
def mgePieri3 (p q : Nat) : List (Nat × Nat) :=
  (p + 1, q) :: (if p > 0 then [(p - 1, q + 1)] else []) ++ (if q > 0 then [(p, q - 1)] else [])

/-- Exact `SU(3)` Pieri / Clebsch-Gordan branching list for `3* ⊗ V(p, q)` (`(0, 1) ⊗ (p, q)`). -/
def mgePieri3Bar (p q : Nat) : List (Nat × Nat) :=
  (p, q + 1) :: (if q > 0 then [(p + 1, q - 1)] else []) ++ (if p > 0 then [(p - 1, q)] else [])

/-- Sum of Weyl dimensions across a list of `SU(3)` irreps. -/
def mgePieriDimSum (l : List (Nat × Nat)) : Nat :=
  mgeListSum (l.map fun r => mgeSu3Dim r.1 r.2)

/-- Sum of `d(p', q') * (3 C_2(p', q'))` across a list of `SU(3)` irreps (Dynkin Casimir trace). -/
def mgePieriCasimirSum (l : List (Nat × Nat)) : Nat :=
  mgeListSum (l.map fun r => mgeSu3Dim r.1 r.2 * mgeSu3Casimir3 r.1 r.2)

/-- Exact `SU(3)` torus weight list `(w_0, w_1, w_2)` (with multiplicity) for each `K ≤ 2` irrep `V(p, q)`. -/
def mgeIrrepWeights (p q : Nat) : List (Int × Int × Int) :=
  match p, q with
  | 0, 0 => [(0, 0, 0)]
  | 1, 0 => [(1, 0, 0), (0, 1, 0), (0, 0, 1)]
  | 0, 1 => [(-1, 0, 0), (0, -1, 0), (0, 0, -1)]
  | 2, 0 => [(2, 0, 0), (0, 2, 0), (0, 0, 2), (1, 1, 0), (1, 0, 1), (0, 1, 1)]
  | 0, 2 => [(-2, 0, 0), (0, -2, 0), (0, 0, -2), (-1, -1, 0), (-1, 0, -1), (0, -1, -1)]
  | 1, 1 => [(0, 0, 0), (0, 0, 0), (1, -1, 0), (-1, 1, 0), (1, 0, -1), (-1, 0, 1), (0, 1, -1), (0, -1, 1)]
  | _, _ => []

/-- Exact multiplicity of adjoint torus weight `w` in `V(p, q) ⊗ V(p, q)*` (`|μ⟩⟨ν|` has weight `μ - ν`). -/
def mgePeterWeylWeightMult (p q : Nat) (w : Int × Int × Int) : Nat :=
  let ws := mgeIrrepWeights p q
  ws.foldl (fun acc w1 =>
    acc + ws.countP (fun w2 =>
      w1.1 - w2.1 == w.1 && w1.2.1 - w2.2.1 == w.2.1 && w1.2.2 - w2.2.2 == w.2.2)) 0

/-- Total `K ≤ 2` Peter-Weyl dimension in adjoint torus weight sector `w`. -/
def mgeK2SectorDim (w : Int × Int × Int) : Nat :=
  mgeListSum (mgeSu3IrrepsK2.map fun r => mgePeterWeylWeightMult r.1 r.2 w)

/-- Exact `19` non-empty `K ≤ 2` adjoint torus weights (`1` zero, `6` roots, `6` double-roots, `6` `(2,-1,-1)`-type). -/
def mgeK2Weights : List (Int × Int × Int) :=
  [ (0, 0, 0),
    (1, -1, 0), (-1, 1, 0), (1, 0, -1), (-1, 0, 1), (0, 1, -1), (0, -1, 1),
    (2, -2, 0), (-2, 2, 0), (2, 0, -2), (-2, 0, 2), (0, 2, -2), (0, -2, 2),
    (2, -1, -1), (-2, 1, 1), (-1, 2, -1), (1, -2, 1), (-1, -1, 2), (1, 1, -2) ]

private theorem mge_pieri3_xy_identities (x y : Int) :
    (x + 1) * y * (x + y + 1) + (x - 1) * (y + 1) * (x + y) + x * (y - 1) * (x + y - 1) =
      3 * (x * y * (x + y)) ∧
    (x + 1) * y * (x + y + 1) * (2 * x + y) +
      (x - 1) * (y + 1) * (x + y) * (-x + y) +
      x * (y - 1) * (x + y - 1) * (-x - 2 * y) =
      9 * (x * y * (x + y)) := ⟨by ring, by ring⟩

private def mgeDimXY (x y : Int) : Int := x * y * (x + y)
private def mgeCasXY (x y : Int) : Int := x * x + y * y + x * y - 3

private theorem mge_pieri3_dim_and_casimir_int (p q : Nat) :
    2 * mgePieriDimSum (mgePieri3 p q) = 3 * (2 * mgeSu3Dim p q) ∧
    2 * mgePieriCasimirSum (mgePieri3 p q) =
      3 * (2 * mgeSu3Dim p q) * (mgeSu3Casimir3 p q + 4) := by
  let x : Int := (p : Int) + 1
  let y : Int := (q : Int) + 1
  have hXY := mge_pieri3_xy_identities x y
  have hDimInt : ∀ a b : Nat, ((2 * mgeSu3Dim a b : Nat) : Int) = mgeDimXY ((a : Int) + 1) ((b : Int) + 1) := by
    intro a b
    rw [mge_su3_dim_even a b]
    unfold mgeDimXY
    simp only [Int.natCast_mul, Int.natCast_add]
    congr 1; omega
  have hCasInt : ∀ a b : Nat, ((mgeSu3Casimir3 a b : Nat) : Int) = mgeCasXY ((a : Int) + 1) ((b : Int) + 1) := by
    intro a b
    unfold mgeSu3Casimir3 mgeCasXY
    simp only [Int.natCast_add, Int.natCast_mul, Int.add_mul, Int.mul_add, Int.one_mul, Int.mul_one]
    omega
  have hTerm : ∀ a b : Nat,
      ((2 * (mgeSu3Dim a b * mgeSu3Casimir3 a b) : Nat) : Int) =
        mgeDimXY ((a : Int) + 1) ((b : Int) + 1) * mgeCasXY ((a : Int) + 1) ((b : Int) + 1) := by
    intro a b
    rw [← Nat.mul_assoc, Int.natCast_mul, hDimInt, hCasInt]
  have hZeroL : ∀ b : Int, mgeDimXY 0 b = 0 := by intro b; unfold mgeDimXY; simp only [Int.zero_mul]
  have hZeroR : ∀ a : Int, mgeDimXY a 0 = 0 := by intro a; unfold mgeDimXY; simp only [Int.mul_zero, Int.zero_mul]
  have hPieriCases :
      ((2 * mgePieriDimSum (mgePieri3 p q) : Nat) : Int) =
        mgeDimXY (x + 1) y + mgeDimXY (x - 1) (y + 1) + mgeDimXY x (y - 1) ∧
      ((2 * mgePieriCasimirSum (mgePieri3 p q) : Nat) : Int) =
        mgeDimXY (x + 1) y * mgeCasXY (x + 1) y +
        mgeDimXY (x - 1) (y + 1) * mgeCasXY (x - 1) (y + 1) +
        mgeDimXY x (y - 1) * mgeCasXY x (y - 1) := by
    cases p with
    | zero =>
      cases q with
      | zero => exact ⟨by decide, by decide⟩
      | succ q' =>
        have hP3 : mgePieri3 0 (q' + 1) = [(1, q' + 1), (0, q')] := by
          unfold mgePieri3
          have h1 : ¬ ((0 : Nat) > 0) := by decide
          have h2 : q' + 1 > 0 := by omega
          rw [mge_ite_false h1, mge_ite_true h2, Nat.add_sub_cancel]; rfl
        have hDimEq : 2 * mgePieriDimSum (mgePieri3 0 (q' + 1)) =
            2 * mgeSu3Dim 1 (q' + 1) + 2 * mgeSu3Dim 0 q' := by
          rw [hP3]; unfold mgePieriDimSum
          simp only [List.map_cons, List.map_nil, mgeListSum, Nat.add_zero, Nat.mul_add]
        have hCasEq : 2 * mgePieriCasimirSum (mgePieri3 0 (q' + 1)) =
            2 * (mgeSu3Dim 1 (q' + 1) * mgeSu3Casimir3 1 (q' + 1)) +
            2 * (mgeSu3Dim 0 q' * mgeSu3Casimir3 0 q') := by
          rw [hP3]; unfold mgePieriCasimirSum
          simp only [List.map_cons, List.map_nil, mgeListSum, Nat.add_zero, Nat.mul_add]
        have hx0 : x - 1 = 0 := by simp only [x]; omega
        have hx1 : ((1 : Nat) : Int) + 1 = x + 1 := by simp only [x]; omega
        have hx0' : ((0 : Nat) : Int) + 1 = x := rfl
        have hy1 : ((q' + 1 : Nat) : Int) + 1 = y := by simp only [y]
        have hy0 : ((q' : Nat) : Int) + 1 = y - 1 := by simp only [y, Int.natCast_add]; omega
        constructor
        · rw [hDimEq, Int.natCast_add, hDimInt, hDimInt, hx1, hx0', hy1, hy0, hx0, hZeroL, Int.add_zero]
        · rw [hCasEq, Int.natCast_add, hTerm, hTerm, hx1, hx0', hy1, hy0, hx0, hZeroL, Int.zero_mul, Int.add_zero]
    | succ p' =>
      cases q with
      | zero =>
        have hP3 : mgePieri3 (p' + 1) 0 = [(p' + 2, 0), (p', 1)] := by
          unfold mgePieri3
          have h1 : p' + 1 > 0 := by omega
          have h2 : ¬ ((0 : Nat) > 0) := by decide
          rw [mge_ite_true h1, mge_ite_false h2, Nat.add_sub_cancel]; rfl
        have hDimEq : 2 * mgePieriDimSum (mgePieri3 (p' + 1) 0) =
            2 * mgeSu3Dim (p' + 2) 0 + 2 * mgeSu3Dim p' 1 := by
          rw [hP3]; unfold mgePieriDimSum
          simp only [List.map_cons, List.map_nil, mgeListSum, Nat.add_zero, Nat.mul_add]
        have hCasEq : 2 * mgePieriCasimirSum (mgePieri3 (p' + 1) 0) =
            2 * (mgeSu3Dim (p' + 2) 0 * mgeSu3Casimir3 (p' + 2) 0) +
            2 * (mgeSu3Dim p' 1 * mgeSu3Casimir3 p' 1) := by
          rw [hP3]; unfold mgePieriCasimirSum
          simp only [List.map_cons, List.map_nil, mgeListSum, Nat.add_zero, Nat.mul_add]
        have hy0 : y - 1 = 0 := by simp only [y]; omega
        have hx2 : ((p' + 2 : Nat) : Int) + 1 = x + 1 := by simp only [x, Int.natCast_add]; omega
        have hx0 : ((p' : Nat) : Int) + 1 = x - 1 := by simp only [x, Int.natCast_add]; omega
        have hy0' : ((0 : Nat) : Int) + 1 = y := by simp only [y]
        have hy1 : ((1 : Nat) : Int) + 1 = y + 1 := by simp only [y]; omega
        constructor
        · rw [hDimEq, Int.natCast_add, hDimInt, hDimInt, hx2, hx0, hy0', hy1, hy0, hZeroR, Int.add_zero]
        · rw [hCasEq, Int.natCast_add, hTerm, hTerm, hx2, hx0, hy0', hy1, hy0, hZeroR, Int.zero_mul, Int.add_zero]
      | succ q' =>
        have hP3 : mgePieri3 (p' + 1) (q' + 1) = [(p' + 2, q' + 1), (p', q' + 2), (p' + 1, q')] := by
          unfold mgePieri3
          have h1 : p' + 1 > 0 := by omega
          have h2 : q' + 1 > 0 := by omega
          rw [mge_ite_true h1, mge_ite_true h2, Nat.add_sub_cancel, Nat.add_sub_cancel]; rfl
        have hDimEq : 2 * mgePieriDimSum (mgePieri3 (p' + 1) (q' + 1)) =
            2 * mgeSu3Dim (p' + 2) (q' + 1) + (2 * mgeSu3Dim p' (q' + 2) + 2 * mgeSu3Dim (p' + 1) q') := by
          rw [hP3]; unfold mgePieriDimSum
          simp only [List.map_cons, List.map_nil, mgeListSum, Nat.add_zero, Nat.mul_add]
        have hCasEq : 2 * mgePieriCasimirSum (mgePieri3 (p' + 1) (q' + 1)) =
            2 * (mgeSu3Dim (p' + 2) (q' + 1) * mgeSu3Casimir3 (p' + 2) (q' + 1)) +
            (2 * (mgeSu3Dim p' (q' + 2) * mgeSu3Casimir3 p' (q' + 2)) +
             2 * (mgeSu3Dim (p' + 1) q' * mgeSu3Casimir3 (p' + 1) q')) := by
          rw [hP3]; unfold mgePieriCasimirSum
          simp only [List.map_cons, List.map_nil, mgeListSum, Nat.add_zero, Nat.mul_add]
        have hx2 : ((p' + 2 : Nat) : Int) + 1 = x + 1 := by simp only [x, Int.natCast_add]; omega
        have hx1 : ((p' + 1 : Nat) : Int) + 1 = x := by simp only [x]
        have hx0 : ((p' : Nat) : Int) + 1 = x - 1 := by simp only [x, Int.natCast_add]; omega
        have hy2 : ((q' + 2 : Nat) : Int) + 1 = y + 1 := by simp only [y, Int.natCast_add]; omega
        have hy1 : ((q' + 1 : Nat) : Int) + 1 = y := by simp only [y]
        have hy0 : ((q' : Nat) : Int) + 1 = y - 1 := by simp only [y, Int.natCast_add]; omega
        constructor
        · rw [hDimEq, Int.natCast_add, Int.natCast_add, hDimInt, hDimInt, hDimInt,
              hx2, hx1, hx0, hy2, hy1, hy0]; omega
        · rw [hCasEq, Int.natCast_add, Int.natCast_add, hTerm, hTerm, hTerm,
              hx2, hx1, hx0, hy2, hy1, hy0]; omega
  have hDimXY : mgeDimXY (x + 1) y + mgeDimXY (x - 1) (y + 1) + mgeDimXY x (y - 1) =
      3 * mgeDimXY x y := by
    unfold mgeDimXY
    have h1 : x + 1 + y = x + y + 1 := by omega
    have h2 : x - 1 + (y + 1) = x + y := by omega
    have h3 : x + (y - 1) = x + y - 1 := by omega
    rw [h1, h2, h3]
    exact hXY.1
  constructor
  · apply Int.ofNat.inj
    rw [Int.ofNat_eq_natCast, Int.ofNat_eq_natCast, hPieriCases.1, hDimXY, Int.natCast_mul, hDimInt]
    rfl
  · apply Int.ofNat.inj
    rw [Int.ofNat_eq_natCast, Int.ofNat_eq_natCast, hPieriCases.2,
        Int.natCast_mul, Int.natCast_mul, Int.natCast_add, hDimInt, hCasInt]
    have hC1 : mgeCasXY (x + 1) y = (mgeCasXY x y + 1) + (2 * x + y) := by
      unfold mgeCasXY; simp only [Int.add_mul, Int.mul_add, Int.one_mul, Int.mul_one]; omega
    have hC2 : mgeCasXY (x - 1) (y + 1) = (mgeCasXY x y + 1) + (-x + y) := by
      unfold mgeCasXY; simp only [Int.add_mul, Int.mul_add, Int.sub_mul, Int.mul_sub, Int.one_mul, Int.mul_one]; omega
    have hC3 : mgeCasXY x (y - 1) = (mgeCasXY x y + 1) + (-x - 2 * y) := by
      unfold mgeCasXY; simp only [Int.sub_mul, Int.mul_sub, Int.one_mul, Int.mul_one]; omega
    have hShift :
        mgeDimXY (x + 1) y * (2 * x + y) +
        mgeDimXY (x - 1) (y + 1) * (-x + y) +
        mgeDimXY x (y - 1) * (-x - 2 * y) = 9 * mgeDimXY x y := by
      unfold mgeDimXY
      have h1 : x + 1 + y = x + y + 1 := by omega
      have h2 : x - 1 + (y + 1) = x + y := by omega
      have h3 : x + (y - 1) = x + y - 1 := by omega
      rw [h1, h2, h3]
      exact hXY.2
    rw [hC1, hC2, hC3, Int.mul_add (mgeDimXY (x + 1) y), Int.mul_add (mgeDimXY (x - 1) (y + 1)),
        Int.mul_add (mgeDimXY x (y - 1))]
    have hGrp :
        mgeDimXY (x + 1) y * (mgeCasXY x y + 1) + mgeDimXY (x + 1) y * (2 * x + y) +
        (mgeDimXY (x - 1) (y + 1) * (mgeCasXY x y + 1) + mgeDimXY (x - 1) (y + 1) * (-x + y)) +
        (mgeDimXY x (y - 1) * (mgeCasXY x y + 1) + mgeDimXY x (y - 1) * (-x - 2 * y)) =
        (mgeDimXY (x + 1) y + mgeDimXY (x - 1) (y + 1) + mgeDimXY x (y - 1)) * (mgeCasXY x y + 1) +
        (mgeDimXY (x + 1) y * (2 * x + y) + mgeDimXY (x - 1) (y + 1) * (-x + y) +
         mgeDimXY x (y - 1) * (-x - 2 * y)) := by
      simp only [Int.add_mul]; omega
    rw [hGrp, hDimXY, hShift]
    change 3 * mgeDimXY x y * (mgeCasXY x y + 1) + 9 * mgeDimXY x y =
      3 * mgeDimXY x y * (mgeCasXY x y + 4)
    simp only [Int.mul_add, Int.mul_one]
    have h4 : 3 * mgeDimXY x y * 4 = 12 * mgeDimXY x y := by
      calc 3 * mgeDimXY x y * 4 = (3 * 4) * mgeDimXY x y := by ac_rfl
        _ = 12 * mgeDimXY x y := rfl
    rw [h4]; omega

private theorem mge_pieri3Bar_eq_swap (p q : Nat) :
    mgePieri3Bar p q = (mgePieri3 q p).map Prod.swap := by
  unfold mgePieri3Bar mgePieri3
  cases p <;> cases q <;> rfl

private theorem mge_k2_pieri_and_sectors_check :
    mgePieri3 0 0 = [(1, 0)] ∧
    mgePieri3 1 0 = [(2, 0), (0, 1)] ∧
    mgePieri3 0 1 = [(1, 1), (0, 0)] ∧
    mgePieri3 2 0 = [(3, 0), (1, 1)] ∧
    mgePieri3 0 2 = [(1, 2), (0, 1)] ∧
    mgePieri3 1 1 = [(2, 1), (0, 2), (1, 0)] ∧
    mgePieri3Bar 1 1 = [(1, 2), (2, 0), (0, 1)] ∧
    (mgeSu3IrrepsK2.all fun r => (mgeIrrepWeights r.1 r.2).length == mgeSu3Dim r.1 r.2) = true ∧
    mgeK2Weights.length = 19 ∧
    mgeK2Weights.Nodup ∧
    mgeK2SectorDim (0, 0, 0) = 29 ∧
    (mgeK2Weights.map mgeK2SectorDim) =
      [29, 14, 14, 14, 14, 14, 14, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4] ∧
    mgeListSum (mgeK2Weights.map mgeK2SectorDim) = 155 ∧
    14 + 6 = mgeSu3Lap3 2 0 ∧
    14 - 6 = mgeSu3Lap3 0 1 ∧
    3 * 6 = mgeSu3Lap3 1 1 ∧
    6 * 1 - 2 * 3 = mgeSu3Lap3 0 0 := by
  decide

/-- Theorem MGE-7: Universal `∀ p q : Nat` Clebsch-Gordan / Pieri branching rules for `3 ⊗ V(p, q)`
    and `3* ⊗ V(p, q)` (exact dimension conservation AND exact Dynkin quadratic-Casimir trace sum rule),
    explicit `K = 2` Witten-Laplacian coupling table, exact `19`-sector torus weight decomposition
    `29 + 6·14 + 6·3 + 6·4 = 155` matching `sec0=29, secR=14, sec20=3, sec211=4`, and exact degree-2
    Laplacian eigenmode identities:
    1. `∀ p q, mgePieriDimSum (mgePieri3 p q) = 3 * mgeSu3Dim p q` and same for `mgePieri3Bar`,
    2. `∀ p q, mgePieriCasimirSum (mgePieri3 p q) = 3 * mgeSu3Dim p q * (mgeSu3Casimir3 p q + 4)`
       and same for `mgePieri3Bar`,
    3. Exact `K ≤ 2` branching table showing boundary couplings into `K = 3` (`(2,1), (1,2)` at `32/3`),
    4. Exact `K ≤ 2` Peter-Weyl weight-sector dimensions `[29, 14×6, 3×6, 4×6]` summing to `155`,
    5. Exact degree-2 `-Δ` eigenmode match (`14 + 6 = 20`, `14 - 6 = 8`, `3·6 = 18`, `6 - 6 = 0`). -/
theorem thm_mge_su3_pieri_branching_and_weight_sectors :
    (∀ p q : Nat,
      mgePieriDimSum (mgePieri3 p q) = 3 * mgeSu3Dim p q ∧
      mgePieriCasimirSum (mgePieri3 p q) = 3 * mgeSu3Dim p q * (mgeSu3Casimir3 p q + 4) ∧
      mgePieriDimSum (mgePieri3Bar p q) = 3 * mgeSu3Dim p q ∧
      mgePieriCasimirSum (mgePieri3Bar p q) = 3 * mgeSu3Dim p q * (mgeSu3Casimir3 p q + 4)) ∧
    mgePieri3 0 0 = [(1, 0)] ∧
    mgePieri3 1 0 = [(2, 0), (0, 1)] ∧
    mgePieri3 0 1 = [(1, 1), (0, 0)] ∧
    mgePieri3 2 0 = [(3, 0), (1, 1)] ∧
    mgePieri3 0 2 = [(1, 2), (0, 1)] ∧
    mgePieri3 1 1 = [(2, 1), (0, 2), (1, 0)] ∧
    mgePieri3Bar 1 1 = [(1, 2), (2, 0), (0, 1)] ∧
    mgeK2Weights.length = 19 ∧
    mgeK2Weights.Nodup ∧
    mgeK2SectorDim (0, 0, 0) = 29 ∧
    (mgeK2Weights.map mgeK2SectorDim) =
      [29, 14, 14, 14, 14, 14, 14, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4] ∧
    mgeListSum (mgeK2Weights.map mgeK2SectorDim) = 155 ∧
    (14 + 6 = mgeSu3Lap3 2 0 ∧ 14 - 6 = mgeSu3Lap3 0 1 ∧ 3 * 6 = mgeSu3Lap3 1 1 ∧ 6 * 1 - 2 * 3 = mgeSu3Lap3 0 0) := by
  have hC := mge_k2_pieri_and_sectors_check
  refine ⟨?_, hC.1, hC.2.1, hC.2.2.1, hC.2.2.2.1, hC.2.2.2.2.1, hC.2.2.2.2.2.1,
          hC.2.2.2.2.2.2.1, hC.2.2.2.2.2.2.2.2.1, hC.2.2.2.2.2.2.2.2.2.1,
          hC.2.2.2.2.2.2.2.2.2.2.1, hC.2.2.2.2.2.2.2.2.2.2.2.1, hC.2.2.2.2.2.2.2.2.2.2.2.2.1,
          hC.2.2.2.2.2.2.2.2.2.2.2.2.2⟩
  intro p q
  have hP := mge_pieri3_dim_and_casimir_int p q
  have hDim3 : mgePieriDimSum (mgePieri3 p q) = 3 * mgeSu3Dim p q := by
    have h := hP.1
    rw [← Nat.mul_assoc, Nat.mul_comm 3 2, Nat.mul_assoc] at h
    omega
  have hCas3 : mgePieriCasimirSum (mgePieri3 p q) = 3 * mgeSu3Dim p q * (mgeSu3Casimir3 p q + 4) := by
    have h := hP.2
    have hR : 3 * (2 * mgeSu3Dim p q) * (mgeSu3Casimir3 p q + 4) =
        2 * (3 * mgeSu3Dim p q * (mgeSu3Casimir3 p q + 4)) := by ac_rfl
    rw [hR] at h
    omega
  have hSwapSym : ∀ l : List (Nat × Nat),
      mgePieriDimSum (l.map Prod.swap) = mgePieriDimSum l ∧
      mgePieriCasimirSum (l.map Prod.swap) = mgePieriCasimirSum l := by
    intro l
    induction l with
    | nil => exact ⟨rfl, rfl⟩
    | cons r tl ih =>
      rcases r with ⟨a, b⟩
      have hSym := thm_mge_su3_weyl_dim_and_k2_casimir_spectrum.1 a b
      simp only [mgePieriDimSum, mgePieriCasimirSum, List.map_cons, Prod.swap, mgeListSum] at ih ⊢
      rw [← hSym.2.2.1, ← hSym.2.2.2, ih.1, ih.2]
      exact ⟨rfl, rfl⟩
  have hQP := mge_pieri3_dim_and_casimir_int q p
  have hSymPQ := thm_mge_su3_weyl_dim_and_k2_casimir_spectrum.1 p q
  have hDimBar : mgePieriDimSum (mgePieri3Bar p q) = 3 * mgeSu3Dim p q := by
    rw [mge_pieri3Bar_eq_swap, (hSwapSym (mgePieri3 q p)).1]
    have h := hQP.1
    rw [← Nat.mul_assoc, Nat.mul_comm 3 2, Nat.mul_assoc] at h
    rw [hSymPQ.2.2.1]; omega
  have hCasBar : mgePieriCasimirSum (mgePieri3Bar p q) = 3 * mgeSu3Dim p q * (mgeSu3Casimir3 p q + 4) := by
    rw [mge_pieri3Bar_eq_swap, (hSwapSym (mgePieri3 q p)).2]
    have h := hQP.2
    have hR : 3 * (2 * mgeSu3Dim q p) * (mgeSu3Casimir3 q p + 4) =
        2 * (3 * mgeSu3Dim q p * (mgeSu3Casimir3 q p + 4)) := by ac_rfl
    rw [hR] at h
    rw [hSymPQ.2.2.1, hSymPQ.2.2.2]; omega
  exact ⟨hDim3, hCas3, hDimBar, hCasBar⟩


/-! ## Section 5: `SU(2)` Region-1 / Region-3 Chordal Bounds, 2-Link Wedge Contraction & Sharp Thresholds -/

private theorem mge_su2_region13_checks :
    112 * (100 * 100) < 9 * (353 * 353) ∧
    38400 * 1 - 4 * 49 = 4 * 9551 ∧
    76800 * 1 - 32 * 49 = 32 * 2351 ∧
    3 * 76800 < 100 * 2351 ∧
    (2 * 224000 + 3200 - 9551 * 49 : Int) = -16799 ∧
    20 * 16799 > 224000 := by
  decide

/-- Theorem MGE-8: Exact `SU(2)` Region-1 (`[0, 0.35]`) and Region-3 (`[3.53, ∞)`) chordal
    variance paper-bound algebra (`S_ch(κ, ψ) ≤ 1/4`):
    1. **Region-3 Riccati → Poincaré polynomial factorization** over `ℤ` (lifting to `ℝ`):
       `(16 r - 3 Dr)(112 r + 48 Dr) = 16 (112 r^2 + 27 r Dr - 9 Dr^2)`,
    2. **Unconditional Region-3 theorem** for ALL `κ, D, r, Dr : Int` (`D, Dr > 0`, `r ≥ 0`):
       whenever `112 D^2 ≤ 9 κ^2` (`κ/D ≥ 4√7/3 ≈ 3.527668 < 3.53`) and the Bessel Riccati upper
       barrier `κ^2 r^2 + 3 D^2 r Dr ≤ D^2 Dr^2` holds (`r/Dr = R(κ)/κ`), then **`16 r ≤ 3 Dr`**
       (`R(κ)/κ ≤ 3/16`, hence `Var_⊥(κ)/3 = R(κ)/(3κ) ≤ 1/16 = (1/4)^2`),
    3. **Region-1 parallel-variance expansion identity** at `r = (24 D^2 - κ^2)/(96 D^2)`:
       `9216 D^6 - 288 D^4 (24 D^2 - κ^2) - κ^2 (24 D^2 - κ^2)^2 = 2304 D^6 - κ^2 (288 D^4 - 48 D^2 κ^2 + κ^4)`,
       proving `Var_∥(κ) ≤ 1/4 - κ^2 (1/32 - κ^2 / 192)` with strictly positive drop rate `6 D^2 - κ^2 > 0`
       on all `|κ/D| ≤ 7/20`,
    4. Exact cleared rational verification of Region-1 (`rRatioMin = 9551/38400`, `dropCoeff = 2351/76800 > 3/100`,
       `expCheck = -16799/224000 < -1/20`) and Region-3 (`112 * 100^2 < 9 * 353^2`). -/
theorem thm_mge_su2_chordal_region1_and_region3_bounds :
    (∀ r Dr : Int,
      (16 * r - 3 * Dr) * (112 * r + 48 * Dr) = 16 * (112 * (r * r) + 27 * (r * Dr) - 9 * (Dr * Dr))) ∧
    (∀ κ D r Dr : Int, 0 < D → 0 < Dr → 0 ≤ r →
      112 * (D * D) ≤ 9 * (κ * κ) →
      (κ * κ) * (r * r) + 3 * (D * D) * (r * Dr) ≤ (D * D) * (Dr * Dr) →
      16 * r ≤ 3 * Dr) ∧
    (∀ D2 k2 : Int,
      9216 * (D2 * D2 * D2) - 288 * (D2 * D2) * (24 * D2 - k2) - k2 * ((24 * D2 - k2) * (24 * D2 - k2)) =
        2304 * (D2 * D2 * D2) - k2 * (288 * (D2 * D2) - 48 * (D2 * k2) + k2 * k2)) ∧
    (∀ κ D : Int, 0 < D → 400 * (κ * κ) ≤ 49 * (D * D) →
      0 < 6 * (D * D) - κ * κ) ∧
    (112 * (100 * 100) < 9 * (353 * 353) ∧
     3 * 76800 < 100 * 2351 ∧
     20 * 16799 > 224000) := by
  refine ⟨fun _ _ => by ring, ?_, fun _ _ => by ring, ?_,
          ⟨mge_su2_region13_checks.1, mge_su2_region13_checks.2.2.2.1, mge_su2_region13_checks.2.2.2.2.2⟩⟩
  · intro κ D r Dr hD hDr hr hKap hRic
    have hQuad : 112 * (r * r) + 27 * (r * Dr) - 9 * (Dr * Dr) ≤ 0 := by
      nlinarith [mul_self_nonneg r, mul_pos hD hD]
    nlinarith
  · intro κ D hD hBound; nlinarith [mul_pos hD hD]

/-- Map a positive direction `d ≠ mgFrozenIdx` (`10`) back to its `Fin 11` active index. -/
def mgeDirTo11 (d : Fin 12) : Option (Fin 11) :=
  if h1 : d.val < 10 then some ⟨d.val, by omega⟩
  else if d.val == 10 then none
  else some ⟨10, by decide⟩

/-- Canonical undirected edge `(baseSite, dir11)` for 1D-axial `D_4` (`mgFrozenIdx = 10` excluded). -/
def mgeCanonEdge1D (p q : Vec4) : Option (Vec4 × Fin 11) :=
  let diff := sub4 q p
  if mgLexPos diff then
    match mgeDirTo11 (mgDirOf diff) with
    | some u => some (p, u)
    | none => none
  else
    match mgeDirTo11 (mgDirOf (mgNeg4 diff)) with
    | some u => some (q, u)
    | none => none

/-- Exact list of active 1D-axial triangle-neighbor edges `(baseSite, dir11)` of an active edge `(p, u)`. -/
def mgeNeighbors1D (p : Vec4) (u : Fin 11) : List (Vec4 × Fin 11) :=
  let r := mgPosRoot (mgActiveDir u)
  let q := add4 p r
  d4Roots.foldl (fun acc s =>
    if dot4 r s == 1 then
      let z := add4 p s
      let acc1 := match mgeCanonEdge1D p z with | some e1 => e1 :: acc | none => acc
      match mgeCanonEdge1D q z with | some e2 => e2 :: acc1 | none => acc1
    else acc) []

/-- Exact list of all `24` `URR` wedges `(eU, r1, r2)` rooted at `0` on 1D-axial `D_4`, derived
    directly from `d4Roots` and `mgIsUntouched`. -/
def mgeWedgeList : List ((Vec4 × Fin 11) × (Vec4 × Fin 11) × (Vec4 × Fin 11)) :=
  (List.finRange 11).foldl (fun acc u =>
    if mgIsUntouched u then
      let p : Vec4 := (0, 0, 0, 0)
      let r := mgPosRoot (mgActiveDir u)
      let q := r
      let eU : Vec4 × Fin 11 := (p, u)
      d4Roots.foldl (fun acc2 s =>
        if dot4 r s == 1 then
          match mgeCanonEdge1D p s, mgeCanonEdge1D q s with
          | some r1, some r2 => (eU, r1, r2) :: acc2
          | _, _ => acc2
        else acc2) acc
    else acc) []

/-- Pre-attached neighbor-direction lists for each of the `24` `URR` wedges (derived directly from
    `mgeWedgeList` and `mgeNeighbors1D`), enabling fast kernel evaluation of the `11 × 11` wedge matrices. -/
def mgeWedgeNbrData : List (Fin 11 × Fin 11 × Fin 11 × List (Fin 11) × List (Fin 11)) :=
  mgeWedgeList.map fun w =>
    let eU := w.1; let r1 := w.2.1; let r2 := w.2.2
    let n1 := ((mgeNeighbors1D r1.1 r1.2).filter fun f => f != r2 && f != eU).map Prod.snd
    let n2 := ((mgeNeighbors1D r2.1 r2.2).filter fun f => f != r1 && f != eU).map Prod.snd
    (eU.2, r1.2, r2.2, n1, n2)

/-- Exact `6×` cleared block coverage `6 * K_e` for each active direction `u : Fin 11`:
    `6` for each singleton `U`-block + `1` per `URR`-wedge containing `u` (`p_W = 1/6`). -/
def mgeWedgeCov6 (u : Fin 11) : Nat :=
  (if mgIsUntouched u then 6 else 0) +
  mgeWedgeList.foldl (fun acc w =>
    acc + (if w.2.1.2 == u then 1 else 0) + (if w.2.2.2 == u then 1 else 0)) 0

/-- Exact `11 × 11` `U`-block neighbor incidence count `mgeWedgeUBlock v u`. -/
def mgeWedgeUBlock (v u : Fin 11) : Nat :=
  if mgIsUntouched u then
    (mgeNeighbors1D (0, 0, 0, 0) u).countP (fun e => e.2 == v)
  else 0

/-- Exact `11 × 11` shared-`U` wedge incidence count `mgeWedgeShared v u`. -/
def mgeWedgeShared (v u : Fin 11) : Nat :=
  mgeWedgeNbrData.foldl (fun acc w =>
    if w.1 == v then
      acc + (if w.2.1 == u then 1 else 0) + (if w.2.2.1 == u then 1 else 0)
    else acc) 0

/-- Exact `11 × 11` direct-wedge (`c_1`) neighbor incidence count `mgeWedgeC1 v u`. -/
def mgeWedgeC1 (v u : Fin 11) : Nat :=
  mgeWedgeNbrData.foldl (fun acc w =>
    let u1 := w.2.1; let u2 := w.2.2.1; let n1 := w.2.2.2.1; let n2 := w.2.2.2.2
    acc + (if u1 == u then n1.countP (· == v) else 0) + (if u2 == u then n2.countP (· == v) else 0)) 0

/-- Exact `11 × 11` indirect-wedge (`c_2`) neighbor incidence count `mgeWedgeC2 v u`. -/
def mgeWedgeC2 (v u : Fin 11) : Nat :=
  mgeWedgeNbrData.foldl (fun acc w =>
    let u1 := w.2.1; let u2 := w.2.2.1; let n1 := w.2.2.2.1; let n2 := w.2.2.2.2
    acc + (if u2 == u then n1.countP (· == v) else 0) + (if u1 == u then n2.countP (· == v) else 0)) 0

private theorem mge_wedge_structure_checks :
    ((List.finRange 11).filter mgIsUntouched).length = 3 ∧
    mgeWedgeList.length = 24 ∧
    (mgeWedgeList.all fun w => !mgIsUntouched w.2.1.2 && !mgIsUntouched w.2.2.2) = true ∧
    (∀ u : Fin 11, mgeWedgeCov6 u = 6) ∧
    (∀ v : Fin 11, mgIsUntouched v = true →
      sumFinNat (fun u => if mgIsUntouched u then mgeWedgeUBlock v u + mgeWedgeShared v u + mgeWedgeC1 v u + mgeWedgeC2 v u else 0) = 0 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeUBlock v u) = 0 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeShared v u) = 16 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeC1 v u) = 80 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeC2 v u) = 80) ∧
    (∀ v : Fin 11, mgIsUntouched v = false →
      sumFinNat (fun u => if mgIsUntouched u then mgeWedgeUBlock v u else 0) = 6 ∧
      sumFinNat (fun u => if mgIsUntouched u then mgeWedgeShared v u + mgeWedgeC1 v u + mgeWedgeC2 v u else 0) = 0 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeUBlock v u + mgeWedgeShared v u) = 0 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeC1 v u) = 42 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeC2 v u) = 42) := by
  decide

/-- Theorem MGE-9: Exact 2-link wedge block cover `B = {R_1, R_2}` on 1D-axial `D_4` derived
    directly from `d4Roots`, certifying uniform coverage `K_e = 1` and the exact `11 × 11 → 2 × 2`
    equitable block reduction:
    1. Exactly `3` singleton `U`-blocks and `24` `URR`-wedges (every wedge arm is a reduced `R`-link,
       ZERO frozen links inside any `U`-triangle),
    2. Exact uniform block coverage `∀ u : Fin 11, mgeWedgeCov6 u = 6` (`K_e = 1` on all `11` directions),
    3. Exact `11 × 11 → 2 × 2` block row sums across `(mgeWedgeUBlock, mgeWedgeShared, mgeWedgeC1, mgeWedgeC2)`:
       - `U ← U = 0`, `U ← R`: `16` shared, `80` `c_1`, `80` `c_2` (giving `G_{U,R} = (4/3)(α_13 + c(1+α_13)) + (40/3) c/(1-c)`),
       - `R ← U`: `6` `uBlock` (`G_{R,U} = 6 c`), `R ← R`: `42` `c_1`, `42` `c_2` (`G_{R,R} = 7 c/(1-c)`). -/
theorem thm_mge_su2_wedge_coverage_and_block_matrix :
    ((List.finRange 11).filter mgIsUntouched).length = 3 ∧
    mgeWedgeList.length = 24 ∧
    (∀ w ∈ mgeWedgeList, mgIsUntouched w.2.1.2 = false ∧ mgIsUntouched w.2.2.2 = false) ∧
    (∀ u : Fin 11, mgeWedgeCov6 u = 6) ∧
    (∀ v : Fin 11, mgIsUntouched v = true →
      sumFinNat (fun u => if mgIsUntouched u then mgeWedgeUBlock v u + mgeWedgeShared v u + mgeWedgeC1 v u + mgeWedgeC2 v u else 0) = 0 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeUBlock v u) = 0 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeShared v u) = 16 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeC1 v u) = 80 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeC2 v u) = 80) ∧
    (∀ v : Fin 11, mgIsUntouched v = false →
      sumFinNat (fun u => if mgIsUntouched u then mgeWedgeUBlock v u else 0) = 6 ∧
      sumFinNat (fun u => if mgIsUntouched u then mgeWedgeShared v u + mgeWedgeC1 v u + mgeWedgeC2 v u else 0) = 0 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeUBlock v u + mgeWedgeShared v u) = 0 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeC1 v u) = 42 ∧
      sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeC2 v u) = 42) := by
  rcases mge_wedge_structure_checks with ⟨h3, h24, hArms, hCov, hU, hR⟩
  refine ⟨h3, h24, ?_, hCov, hU, hR⟩
  intro w hw
  have h := (List.all_eq_true.mp hArms) w hw
  simp only [Bool.and_eq_true, Bool.not_eq_true'] at h
  exact h

/-- Cleared-denominator `11 × 11` 2-link wedge Dobrushin matrix denominator
    `Q = 12 * aDen * cDen * (cDen - cNum) * (cDen + cNum)`. -/
def mgeWedgeDen (cNum cDen aDen : Nat) : Nat :=
  12 * aDen * cDen * (cDen - cNum) * (cDen + cNum)

/-- Exact cleared-integer `11 × 11` 2-link wedge Dobrushin matrix entry `(Q * G)(v, u)`. -/
def mgeWedgeMat (cNum cDen aNum aDen : Nat) (v u : Fin 11) : Nat :=
  let d1 := cDen - cNum
  let d2 := cDen + cNum
  let kUBlock := 12 * aDen * cNum * d1 * d2
  let kShared := (aNum * d2 + cNum * aDen) * d1 * d2
  let kC1 := 2 * aDen * cNum * cDen * cDen
  let kC2 := 2 * aDen * cNum * cNum * cDen
  kUBlock * mgeWedgeUBlock v u + kShared * mgeWedgeShared v u +
  kC1 * mgeWedgeC1 v u + kC2 * mgeWedgeC2 v u

/-- Positive `2`-block Collatz-Wielandt weight vector on `Fin 11`: `wU` on `U` directions, `wR` on `R`. -/
def mgeWedgeVec (wU wR : Nat) (i : Fin 11) : Nat :=
  if mgIsUntouched i then wU else wR

private theorem mge_wedge_action_2x2 (cNum cDen aNum aDen wU wR : Nat) (v : Fin 11) :
    let d1 := cDen - cNum
    let d2 := cDen + cNum
    let kUBlock := 12 * aDen * cNum * d1 * d2
    let kShared := (aNum * d2 + cNum * aDen) * d1 * d2
    let kC1 := 2 * aDen * cNum * cDen * cDen
    let kC2 := 2 * aDen * cNum * cNum * cDen
    sumFinNat (fun u => mgeWedgeMat cNum cDen aNum aDen v u * mgeWedgeVec wU wR u) =
      if mgIsUntouched v then
        (16 * kShared + 80 * kC1 + 80 * kC2) * wR
      else
        6 * kUBlock * wU + (42 * kC1 + 42 * kC2) * wR := by
  dsimp only
  let d1 := cDen - cNum
  let d2 := cDen + cNum
  let kUBlock := 12 * aDen * cNum * d1 * d2
  let kShared := (aNum * d2 + cNum * aDen) * d1 * d2
  let kC1 := 2 * aDen * cNum * cDen * cDen
  let kC2 := 2 * aDen * cNum * cNum * cDen
  have hSplit : ∀ (A B C D : Fin 11 → Nat) (a b c d : Nat),
      sumFinNat (fun u => (a * A u + b * B u + c * C u + d * D u) * mgeWedgeVec wU wR u) =
      a * sumFinNat (fun u => A u * mgeWedgeVec wU wR u) +
      b * sumFinNat (fun u => B u * mgeWedgeVec wU wR u) +
      c * sumFinNat (fun u => C u * mgeWedgeVec wU wR u) +
      d * sumFinNat (fun u => D u * mgeWedgeVec wU wR u) := by
    intro A B C D a b c d
    simp only [mge_sumFinNat_eq_foldl_11, mge_foldl_eq_listSum]
    have hExp : (fun u : Fin 11 => (a * A u + b * B u + c * C u + d * D u) * mgeWedgeVec wU wR u) =
        (fun u : Fin 11 =>
          a * (A u * mgeWedgeVec wU wR u) + b * (B u * mgeWedgeVec wU wR u) +
          c * (C u * mgeWedgeVec wU wR u) + d * (D u * mgeWedgeVec wU wR u)) := by
      funext u; simp only [Nat.add_mul, Nat.mul_assoc]
    rw [hExp, mge_listSum_map_add, mge_listSum_map_add, mge_listSum_map_add,
        mge_listSum_map_const_mul, mge_listSum_map_const_mul,
        mge_listSum_map_const_mul, mge_listSum_map_const_mul]
  have hVecSplit : ∀ (M : Fin 11 → Nat),
      sumFinNat (fun u => M u * mgeWedgeVec wU wR u) =
      sumFinNat (fun u => if mgIsUntouched u then M u else 0) * wU +
      sumFinNat (fun u => if mgIsUntouched u then 0 else M u) * wR := by
    intro M
    simp only [mge_sumFinNat_eq_foldl_11, mge_foldl_eq_listSum]
    have h1 : (fun u : Fin 11 => M u * mgeWedgeVec wU wR u) =
        (fun u : Fin 11 =>
          wU * (if mgIsUntouched u then M u else 0) +
          wR * (if mgIsUntouched u then 0 else M u)) := by
      funext u
      unfold mgeWedgeVec
      cases mgIsUntouched u <;> simp only [Bool.false_eq_true, ite_true, ite_false,
        Nat.mul_zero, Nat.add_zero, Nat.zero_add, Nat.mul_comm]
    rw [h1, mge_listSum_map_add, mge_listSum_map_const_mul, mge_listSum_map_const_mul,
        Nat.mul_comm wU, Nat.mul_comm wR]
  have hAct := hSplit (mgeWedgeUBlock v) (mgeWedgeShared v) (mgeWedgeC1 v) (mgeWedgeC2 v)
    kUBlock kShared kC1 kC2
  change sumFinNat (fun u => (kUBlock * mgeWedgeUBlock v u + kShared * mgeWedgeShared v u +
    kC1 * mgeWedgeC1 v u + kC2 * mgeWedgeC2 v u) * mgeWedgeVec wU wR u) =
      if mgIsUntouched v then
        (16 * kShared + 80 * kC1 + 80 * kC2) * wR
      else
        6 * kUBlock * wU + (42 * kC1 + 42 * kC2) * wR
  rw [hAct, hVecSplit (mgeWedgeUBlock v), hVecSplit (mgeWedgeShared v),
      hVecSplit (mgeWedgeC1 v), hVecSplit (mgeWedgeC2 v)]
  cases hv : mgIsUntouched v with
  | true =>
    have hU := thm_mge_su2_wedge_coverage_and_block_matrix.2.2.2.2.1 v hv
    have hZero :
        sumFinNat (fun u => if mgIsUntouched u then mgeWedgeUBlock v u else 0) = 0 ∧
        sumFinNat (fun u => if mgIsUntouched u then mgeWedgeShared v u else 0) = 0 ∧
        sumFinNat (fun u => if mgIsUntouched u then mgeWedgeC1 v u else 0) = 0 ∧
        sumFinNat (fun u => if mgIsUntouched u then mgeWedgeC2 v u else 0) = 0 := by
      have hAll0 := hU.1
      simp only [mge_sumFinNat_eq_foldl_11, mge_foldl_eq_listSum] at hAll0 ⊢
      have hAdd : (fun u : Fin 11 => if mgIsUntouched u then mgeWedgeUBlock v u + mgeWedgeShared v u + mgeWedgeC1 v u + mgeWedgeC2 v u else 0) =
          (fun u : Fin 11 =>
            (if mgIsUntouched u then mgeWedgeUBlock v u else 0) +
            (if mgIsUntouched u then mgeWedgeShared v u else 0) +
            (if mgIsUntouched u then mgeWedgeC1 v u else 0) +
            (if mgIsUntouched u then mgeWedgeC2 v u else 0)) := by
        funext u; cases mgIsUntouched u <;> simp only [Bool.false_eq_true, ite_true, ite_false, Nat.add_zero]
      rw [hAdd, mge_listSum_map_add, mge_listSum_map_add, mge_listSum_map_add] at hAll0
      omega
    rw [hZero.1, hZero.2.1, hZero.2.2.1, hZero.2.2.2, hU.2.1, hU.2.2.1, hU.2.2.2.1, hU.2.2.2.2]
    simp only [Nat.zero_mul, Nat.add_zero, Nat.zero_add, Nat.mul_zero, ite_true]
    have e1 : kShared * (16 * wR) = 16 * kShared * wR := by ac_rfl
    have e2 : kC1 * (80 * wR) = 80 * kC1 * wR := by ac_rfl
    have e3 : kC2 * (80 * wR) = 80 * kC2 * wR := by ac_rfl
    rw [e1, e2, e3, ← Nat.add_mul, ← Nat.add_mul]
  | false =>
    have hR := thm_mge_su2_wedge_coverage_and_block_matrix.2.2.2.2.2 v hv
    have hZero1 :
        sumFinNat (fun u => if mgIsUntouched u then mgeWedgeShared v u else 0) = 0 ∧
        sumFinNat (fun u => if mgIsUntouched u then mgeWedgeC1 v u else 0) = 0 ∧
        sumFinNat (fun u => if mgIsUntouched u then mgeWedgeC2 v u else 0) = 0 := by
      have hAll0 := hR.2.1
      simp only [mge_sumFinNat_eq_foldl_11, mge_foldl_eq_listSum] at hAll0 ⊢
      have hAdd : (fun u : Fin 11 => if mgIsUntouched u then mgeWedgeShared v u + mgeWedgeC1 v u + mgeWedgeC2 v u else 0) =
          (fun u : Fin 11 =>
            (if mgIsUntouched u then mgeWedgeShared v u else 0) +
            (if mgIsUntouched u then mgeWedgeC1 v u else 0) +
            (if mgIsUntouched u then mgeWedgeC2 v u else 0)) := by
        funext u; cases mgIsUntouched u <;> simp only [Bool.false_eq_true, ite_true, ite_false, Nat.add_zero]
      rw [hAdd, mge_listSum_map_add, mge_listSum_map_add] at hAll0
      omega
    have hZero2 :
        sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeUBlock v u) = 0 ∧
        sumFinNat (fun u => if mgIsUntouched u then 0 else mgeWedgeShared v u) = 0 := by
      have hAll0 := hR.2.2.1
      simp only [mge_sumFinNat_eq_foldl_11, mge_foldl_eq_listSum] at hAll0 ⊢
      have hAdd : (fun u : Fin 11 => if mgIsUntouched u then 0 else mgeWedgeUBlock v u + mgeWedgeShared v u) =
          (fun u : Fin 11 =>
            (if mgIsUntouched u then 0 else mgeWedgeUBlock v u) +
            (if mgIsUntouched u then 0 else mgeWedgeShared v u)) := by
        funext u; cases mgIsUntouched u <;> simp only [Bool.false_eq_true, ite_true, ite_false, Nat.add_zero]
      rw [hAdd, mge_listSum_map_add] at hAll0
      omega
    rw [hR.1, hZero1.1, hZero1.2.1, hZero1.2.2, hZero2.1, hZero2.2, hR.2.2.2.1, hR.2.2.2.2]
    simp only [Nat.zero_mul, Nat.add_zero, Nat.zero_add, Nat.mul_zero,
      Bool.false_eq_true, ite_false]
    have e1 : kUBlock * (6 * wU) = 6 * kUBlock * wU := by ac_rfl
    have e2 : kC1 * (42 * wR) = 42 * kC1 * wR := by ac_rfl
    have e3 : kC2 * (42 * wR) = 42 * kC2 * wR := by ac_rfl
    rw [e1, e2, e3, Nat.add_assoc, ← Nat.add_mul]

private theorem mge_wedge_contraction_checks :
    (let cN := 68573; let cD := 1000000; let aN := 1117; let aD := 25000
     let d1 := cD - cN; let d2 := cD + cN
     let kU := 12 * aD * cN * d1 * d2
     let kS := (aN * d2 + cN * aD) * d1 * d2
     let k1 := 2 * aD * cN * cD * cD
     let k2 := 2 * aD * cN * cN * cD
     let Q := mgeWedgeDen cN cD aD
     1000 * ((16 * kS + 80 * k1 + 80 * k2) * 1000000) ≤ 992 * Q * 1157325 ∧
     1000 * (6 * kU * 1157325 + (42 * k1 + 42 * k2) * 1000000) ≤ 992 * Q * 1000000) ∧
    (let cN := 138637; let cD := 2000000; let aN := 9157; let aD := 200000
     let d1 := cD - cN; let d2 := cD + cN
     let kU := 12 * aD * cN * d1 * d2
     let kS := (aN * d2 + cN * aD) * d1 * d2
     let k1 := 2 * aD * cN * cD * cD
     let k2 := 2 * aD * cN * cN * cD
     let Q := mgeWedgeDen cN cD aD
     1000000 * ((16 * kS + 80 * k1 + 80 * k2) * 1000000) ≤ 999999 * Q * 1150794 ∧
     1000000 * (6 * kU * 1150794 + (42 * k1 + 42 * k2) * 1000000) ≤ 999999 * Q * 1000000) := by
  decide

/-- Theorem MGE-10: Concrete MG-6 (`thm_mg_dobrushin_power_and_geometric_decay`) instantiation of
    the `11 × 11` 2-link wedge Dobrushin matrix `G` directly derived from `d4Roots`:
    1. At `β = 274292 / 1000000` (strictly past the 1D-axial single-link chordal ceiling
       `4 / (4 + 4√7) ≈ 0.274291885`) with certified `α_13 ≤ 1117 / 25000`: exact `n`-step power
       decay and uniform finite-horizon geometric tail decay with contraction `α = 992 / 1000 < 1`,
    2. At `β = 277274 / 1000000` (`> 2.93×` `β_BE^{24c}`, `> 29.70×` old KP) with certified
       `α_13 ≤ 9157 / 200000`: exact `n`-step power decay and uniform finite-horizon geometric
       tail decay with contraction `α = 999999 / 1000000 < 1`! -/
theorem thm_mge_su2_wedge_dobrushin_contraction :
    let KA := mgeWedgeMat 68573 1000000 1117 25000
    let QA := mgeWedgeDen 68573 1000000 25000
    let KB := mgeWedgeMat 138637 2000000 9157 200000
    let QB := mgeWedgeDen 138637 2000000 200000
    (∀ (n : Nat) (x y : Fin 11),
      1000 ^ n * matPowNat KA n x y * 1000000 ≤ (992 * QA) ^ n * 1157325) ∧
    (∀ d M : Nat, M ≥ 1 → ∀ x y : Fin 11,
      1000 ^ d * (1000 - 992) * 1000000 * dobrushinEntryTailSum KA QA x y d M ≤
        QA ^ (d + M - 1) * (992 ^ d * 1000) * 1157325) ∧
    (∀ (n : Nat) (x y : Fin 11),
      1000000 ^ n * matPowNat KB n x y * 1000000 ≤ (999999 * QB) ^ n * 1150794) ∧
    (∀ d M : Nat, M ≥ 1 → ∀ x y : Fin 11,
      1000000 ^ d * (1000000 - 999999) * 1000000 * dobrushinEntryTailSum KB QB x y d M ≤
        QB ^ (d + M - 1) * (999999 ^ d * 1000000) * 1150794) := by
  dsimp only
  have hC := mge_wedge_contraction_checks
  dsimp only at hC
  have hStepA : ∀ x : Fin 11,
      1000 * sumFinNat (fun y => mgeWedgeMat 68573 1000000 1117 25000 x y * mgeWedgeVec 1157325 1000000 y) ≤
        992 * mgeWedgeDen 68573 1000000 25000 * mgeWedgeVec 1157325 1000000 x := by
    intro x
    rw [mge_wedge_action_2x2]
    unfold mgeWedgeVec
    cases mgIsUntouched x
    · exact hC.1.2
    · exact hC.1.1
  have hStepB : ∀ x : Fin 11,
      1000000 * sumFinNat (fun y => mgeWedgeMat 138637 2000000 9157 200000 x y * mgeWedgeVec 1150794 1000000 y) ≤
        999999 * mgeWedgeDen 138637 2000000 200000 * mgeWedgeVec 1150794 1000000 x := by
    intro x
    rw [mge_wedge_action_2x2]
    unfold mgeWedgeVec
    cases mgIsUntouched x
    · exact hC.2.2
    · exact hC.2.1
  have hBndA : ∀ x : Fin 11, 1000000 ≤ mgeWedgeVec 1157325 1000000 x ∧ mgeWedgeVec 1157325 1000000 x ≤ 1157325 := by
    intro x; unfold mgeWedgeVec; cases mgIsUntouched x <;> decide
  have hBndB : ∀ x : Fin 11, 1000000 ≤ mgeWedgeVec 1150794 1000000 x ∧ mgeWedgeVec 1150794 1000000 x ≤ 1150794 := by
    intro x; unfold mgeWedgeVec; cases mgIsUntouched x <;> decide
  have hA := thm_mg_dobrushin_power_and_geometric_decay
    (mgeWedgeMat 68573 1000000 1117 25000) (mgeWedgeDen 68573 1000000 25000)
    992 1000 1000000 1157325 (mgeWedgeVec 1157325 1000000) (by decide) hBndA hStepA
  have hB := thm_mg_dobrushin_power_and_geometric_decay
    (mgeWedgeMat 138637 2000000 9157 200000) (mgeWedgeDen 138637 2000000 200000)
    999999 1000000 1000000 1150794 (mgeWedgeVec 1150794 1000000) (by decide) hBndB hStepB
  exact ⟨hA.2.1, hA.2.2.2.2, hB.2.1, hB.2.2.2.2⟩

private theorem mge_sharp_thresholds_cert :
    ZSqrt7.mul ⟨-1, 1⟩ mgLambda11 = ZSqrt7.ofInt 24 ∧
    ZSqrt7.lt (ZSqrt7.scale 274291 mgLambda11) (ZSqrt7.ofInt 4000000) ∧
    ZSqrt7.lt (ZSqrt7.ofInt 4000000) (ZSqrt7.scale 274292 mgLambda11) ∧
    ZSqrt7.lt (ZSqrt7.scale 290 mgLambda11) (ZSqrt7.scale 1600 ZSqrt7.sqrt7) ∧
    274566 * 14568426 < 4000000 * 1000000 ∧
    274292 < 274566 ∧
    (2905 * 1000) * (2905 * 1000) < 112 * (274566 * 274566) ∧
    274566 < 277274 ∧
    (293 * 10000) * (293 * 10000) < 112 * (277274 * 277274) ∧
    (29343 * 100) * (29343 * 100) < 112 * (277274 * 277274) ∧
    2970 * 9335 < 100 * 277274 ∧
    (237 * 90) * (237 * 90) < 7 * (504 * 16) * (504 * 16) ∧
    1574 * 320114 < 504 * 1000000 ∧
    ZSqrt7.lt (ZSqrt7.scale 545454000 mgLambda11) (ZSqrt7.ofInt (546 * 14568425)) ∧
    (25681 * 9) * (25681 * 9) < 7 * (546 * 160) * (546 * 160) ∧
    7 * (546 * 160) * (546 * 160) < (25682 * 9) * (25682 * 9) ∧
    1615 * 337971 < 546 * 1000000 ∧
    5853 * 9328 < 100 * 546000 := by
  decide

/-- Theorem MGE-11: Exact zero-float rational and `ℤ[√7]` threshold brackets and breakthrough-ratio
    certificates for BOTH `SU(2)` and `SU(3)` (zero floating-point rounding drift):
    1. `SU(2)` 1D-axial single-link chordal ceiling `4 / (4 + 4√7) = (√7 - 1)/6 ∈ (0.274291, 0.274292)`
       (`> 2.90×` `β_BE^{24c}`),
    2. `SU(2)` 4-dir `Alt-x0+planes` chordal threshold `4 / Λ_Alt > 4000000 / 14568426 > 0.274566`
       (strictly surpassing the 1D-axial single-link ceiling `0.274292 > 4 / (4 + 4√7)`, `> 2.905×` BE),
    3. `SU(2)` 1D-axial 2-link wedge `β = 277274 / 1000000` (`> 2.93×` BE, in fact `> 2.9343×` BE,
       and `> 29.70×` old KP `0.009335`, strictly surpassing BOTH single-link ceilings!),
    4. `SU(3)` sharp thresholds: unfixed `0.504` (`> 2.37×` BE, `+57.4%` past W6), 1D-axial `0.545454`
       (derived via exact 1-line coupling monotonicity `0.546 * (14568425/10^6) / (4 + 4√7) > 0.545454`),
       and 4-dir `0.546000` (`2.5681× < 0.546 / β_BE^{24c} < 2.5682×`, rounding to `2.57×` BE;
       `+61.5%` past W6; `> 58.53×` old KP `0.009328`). -/
theorem thm_mge_su2_and_su3_sharp_threshold_ratios :
    ZSqrt7.mul ⟨-1, 1⟩ mgLambda11 = ZSqrt7.ofInt 24 ∧
    ZSqrt7.lt (ZSqrt7.scale 274291 mgLambda11) (ZSqrt7.ofInt 4000000) ∧
    ZSqrt7.lt (ZSqrt7.ofInt 4000000) (ZSqrt7.scale 274292 mgLambda11) ∧
    ZSqrt7.lt (ZSqrt7.scale 290 mgLambda11) (ZSqrt7.scale 1600 ZSqrt7.sqrt7) ∧
    274566 * 14568426 < 4000000 * 1000000 ∧
    274292 < 274566 ∧
    (2905 * 1000) * (2905 * 1000) < 112 * (274566 * 274566) ∧
    274566 < 277274 ∧
    (293 * 10000) * (293 * 10000) < 112 * (277274 * 277274) ∧
    (29343 * 100) * (29343 * 100) < 112 * (277274 * 277274) ∧
    2970 * 9335 < 100 * 277274 ∧
    (237 * 90) * (237 * 90) < 7 * (504 * 16) * (504 * 16) ∧
    1574 * 320114 < 504 * 1000000 ∧
    ZSqrt7.lt (ZSqrt7.scale 545454000 mgLambda11) (ZSqrt7.ofInt (546 * 14568425)) ∧
    (25681 * 9) * (25681 * 9) < 7 * (546 * 160) * (546 * 160) ∧
    7 * (546 * 160) * (546 * 160) < (25682 * 9) * (25682 * 9) ∧
    1615 * 337971 < 546 * 1000000 ∧
    5853 * 9328 < 100 * 546000 :=
  mge_sharp_thresholds_cert

end Vibe
