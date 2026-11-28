module

public import Vibe.Algebra
public import Vibe.CuspGrowth
public import Vibe.SchurGap
public import Vibe.SpectralSharp
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.Positivity
import Mathlib.Data.Finset.Basic
import Mathlib.Algebra.BigOperators.Group.Finset.Basic
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Algebra.Order.BigOperators.Group.Finset
import Mathlib.Data.Fintype.BigOperators

/-!
# Vibe Theory: Deep Spectral Radius Collapse for `{3,4,3,4}` (`913/80 < ρ ≤ 387141227/33670000 < 11.5`, `λ_gap > 13/25`)

Zero-dependency Lean 4.35.0 formalization of Wave-3 Track W7 (`01-spectral-radius-deep-collapse.md`,
Milestone P8-C), collapsing `Vibe.SpectralSharp`'s kernel-verified spectral radius bracket
`[11049/1000, 3325977059/278900000]` (width `0.8763`) by more than **`10.2×`** strictly inside
Lean's kernel to **`[913/80, 387141227/33670000]`** (`[11.4125, 11.498106]`, width `< 0.086`):

1. **`W(F_4)` Automorphisms & Exhaustive `216`-Clique Transitivity (`thm_sse_wf4_automorphisms_and_216_cliques`):**
   - Proves all 4 Bourbaki `W(F_4)` simple reflections are involutions preserving `dot4 (d4RootOf a) (d4RootOf b)`
     and `adj24`, hence every `W(F_4)` word is an explicit bijection preserving `dot4` and `adj24`.
   - Links `sseClique216` directly to `Vibe.CuspGrowth`'s `cliques1_24`, `cliques2_24`, `cliques3_24`
     and certifies explicit `W(F_4)` canonicalizing words mapping every `k`-clique onto `[0]`, `[0, 4]`,
     or `[0, 4, 8]`.
2. **Exact `19`-State Depth-2 Cartier-Foata Automaton & All-Depth Shell Growth (`thm_sse_depth2_automaton_and_shell_growth`):**
   - Defines `sseStepD2` directly from `adj24` and proves all `19` canonical Depth-2 states are valid,
     pairwise distinct, and 100% closed under `sseStepD2` modulo explicit `W(F_4)` canonicalizing words.
   - Proves exact `24`-regularity (`down + up = 24`), exact Depth-1 lumpability onto `Vibe.SpectralSharp.ssUpBound`,
     exact zero-remainder shell counts `r = 0..6` matching `ballShell 0..6 = [1, 24, 456, 8376, 153192, 2800344, 51187080]`,
     and universal all-`r` (`∀ r : Nat`) detailed-balance projection onto `ssStratumCount` and `ballShell`.
3. **Exact `23`-Flag Upward-End Orbits, Unconditional `Aut`-Invariance & Reciprocity (`thm_sse_depth2_flag_reciprocity`):**
   - Certifies the `23` upward-end flag orbits `[St_2(y), b]_{W(F_4)}` in W7's exact numbering,
     proving unique state ownership, unconditional `Aut(d2Rep v)` invariance via down-clique cardinalities,
     and exact directed-edge reciprocity across every transition `(u, b) → v`.
4. **Depth-2 Nagnibeda Schur Upper Bound `ρ ≤ 387141227/33670000 < 11.5` & Structural Subgraph Bridge
   (`thm_sse_depth2_nagnibeda_upper_bound`, `thm_sse_depth2_subgraph_schur_bound`):**
   - Certifies W7's exact `Q = 10,000` `23`-integer vector across all `19` states directly from the
     certified flag transitions, proving `ρ ≤ 387141227/33670000 < 114982/10000 < 115/10`,
     `ρ/24 ≤ 387141227/808080000 < 23/48 < 1/2`, and `λ_gap ≥ 420938773/808080000 > 25/48 > 13/25 > 1/2`.
   - Applies `Vibe.SpectralSharp.thm_ss_finite_reciprocal_schur_bound` via exact common-denominator reciprocal
     integer weights (`D = 10000 * lcm(p_0..p_22)`) to arbitrary finite symmetric bipartite subgraphs obeying
     the Depth-2 flag multiplicity bounds, with a concrete non-vacuity instantiation on the 25-vertex `R = 1` ball.
5. **Exact `Q_3 = Adj(0)` 3-Cube Upward-Insertion Algebra & Zero-Cascade Theorem (`thm_sse_q3_link_and_zero_cascade`):**
   - Certifies directly from `adj24` and `wallCliques1`/`wallCliques2` that `Q_3 = Adj(0)` is an `8`-vertex,
     `3`-regular, `12`-edge, triangle-free 3-cube with `20` non-empty cliques and `212` valid Cartier-Foata pairs,
     transitive under `Stab_{W(F_4)}(0)`, and proves exact zero-cascade upward insertion `sseCanFollow216 (sseAdd0 j1) j2 = true`
     on all `212` pairs.
6. **Exact `57` Pair-Orbit Algebra, Symbolic Word-Sum Reduction & Concrete CF 1-Step Lower Bound
   (`thm_sse_cf_57_orbits_and_exact_word_sum`, `thm_sse_cf_lower_bound`, `thm_sse_combined_spectral_bracket`):**
   - Classifies all `31,080` valid clique pairs of `Γ_24` into `57` `W(F_4)`-orbits via an exact `W(F_4)`-invariant
     sorted `dot4` signature with zero collisions.
   - Proves **symbolically for ALL `K, M, W, om, v`** over the literal Cartier-Foata normal-form word tree
     `List (Fin 216)` that `sseCFExactNormSq K W om v = sseCF1NormSq K W om v` and
     `48 * sseCFExactUp0Quad K W om v ≥ sseCF1QuadTrunc K M W om v` (zero dropped negative terms).
   - Evaluates an explicit positive finite-support integer witness (`K = 120`, `M = 11`, `57` positive `om` and `v`)
     certifying `80 * (48 * sseCFExactUp0Quad) > 913 * sseCFExactNormSq` (`ρ > 913/80 = 11.4125`,
     beating `11.346` CF 0-step and beating `SpectralSharp.lean`'s `11.049` by `> 0.363`), yielding the combined
     machine-checked bracket `913/80 < ρ_low ≤ ρ ≤ 387141227/33670000 < 115/10` (width `< 86/1000`).

## Honest Scope Boundary

- **Proved 100% unconditionally inside Lean 4.35.0's kernel (pure Lean core axioms only, zero `sorry`,
  zero `axiom`, zero `native_decide`, zero `unsafe`):**
  1. All `W(F_4)` automorphism laws, `216`-clique transitivity linked to `Vibe.CuspGrowth.cliques1_24/2_24/3_24`,
     `19`-state Depth-2 automaton closure under `sseStepD2` on `adj24`, `24`-regularity, Depth-1 lumpability,
     `r = 0..6` and all-`r` shell growth matching `Vibe.CuspGrowth`, `23`-flag unique ownership, unconditional
     `Aut`-invariance, and edge reciprocity.
  2. Exact `QPos` Depth-2 Schur row-sum bound `≤ 387141227/33670000 < 11.5` (`λ_gap > 13/25`) and end-to-end
     finite-graph operator-norm bound `33670000 * |⟨x, A x⟩| ≤ 387141227 * ⟨x, x⟩` via
     `thm_ss_finite_reciprocal_schur_bound` (plus `Fin 25` non-vacuity).
  3. Exact `Q_3 = Adj(0)` 3-cube classification (`20` cliques, `212` pairs), zero-cascade upward insertion,
     `57` pair-orbit `dot4`-signature classification (`31,080` pairs), all-depth symbolic word-sum reduction
     `sseCFExactNormSq = sseCF1NormSq` and `48 * sseCFExactUp0Quad ≥ sseCF1QuadTrunc` on `List (Fin 216)`,
     and the concrete finite-support integer lower bound `> 913/80 = 11.4125` and combined bracket width `< 86/1000`.
- **External infinite-graph bridges (not formalized in Lean core):**
  1. Poincaré Polyhedron Theorem identifying the 1-skeleton of the infinite `{3,4,3,4}` hyperbolic honeycomb
     with the Cayley graph `Cay(W(Γ_24), S)` of the right-angled Coxeter group `W(Γ_24)` (bipartite by word length).
  2. Density lift of finite-subgraph Schur and Rayleigh-Ritz bounds to the bounded self-adjoint adjacency operator
     `A` on the infinite Hilbert space `ℓ^2(W(Γ_24))`.
  3. Tits's Cartier-Foata left-normal-form bijection `W(Γ_24) ↔ ValidCFWords` identifying `sseInsert0Rev` with
     upward right-multiplication `w ↦ w s_0` and `W(F_4)`-transitivity across `b ∈ Fin 24` equating
     `⟨ψ, A ψ⟩` with `48 * sseCFExactUp0Quad`.
  4. Deeper Depth-3..5 Nagnibeda certificates (`ρ ≤ 11.443713`) and 2-step 4,440-triple CF lower bounds
     (`ρ ≥ 11.439047`) live in `test/verify/spectral-radius-deep-collapse.ts`.
-/

set_option autoImplicit false

namespace Vibe

@[expose] public section

/-! ## Section 0: Mathlib `Finset.sum` Bridges, Arithmetic & Binary-Tree Grouping Helpers -/

private theorem sse_ite_pos {α : Type} {c : Prop} [Decidable c] (hc : c) (a b : α) :
    (if c then a else b) = a := ite_eq_left hc

private theorem sse_ite_neg {α : Type} {c : Prop} [Decidable c] (hnc : ¬ c) (a b : α) :
    (if c then a else b) = b := ite_eq_right hnc

private theorem sse_int_mul_pos (a b : Int) (ha : 0 < a) (hb : 0 < b) : 0 < a * b := by nlinarith

private theorem sse_int_mul_le_right (a b c : Int) (hab : a ≤ b) (hc : 0 ≤ c) : a * c ≤ b * c := by nlinarith

private theorem sse_int_le_of_mul_le_right (x y d : Int) (hd : 0 < d) (h : x * d ≤ y * d) : x ≤ y := by nlinarith

private theorem sse_int_mul_right_comm (a b c : Int) : (a * b) * c = (a * c) * b := by ring

private theorem sse_nat_mul_quad (w0 a b va vb x y : Nat) :
    (w0 * (a * x) * va) * (w0 * (b * y) * vb) = w0 * w0 * (a * b * va * vb) * (x * y) := by ring

private theorem sse_nat_mul_m0 (w1 w2 a b o0 v0 d : Nat) :
    (w1 * (a * d) * b) * (w2 * (o0 * (a * d)) * v0) =
      w1 * w2 * (o0 * v0 * (a * a * b)) * (d * d) := by ring


private def sse_rangeMap {α : Type} (f : Nat → α) (start : Nat) : Nat → List α
  | 0 => []
  | n + 1 => f start :: sse_rangeMap f (start + 1) n

private theorem sse_rangeMap_append {α : Type} (f : Nat → α) (s a b : Nat) :
    sse_rangeMap f s (a + b) = sse_rangeMap f s a ++ sse_rangeMap f (s + a) b := by
  induction a generalizing s with
  | zero => simp [sse_rangeMap]
  | succ r ih =>
    have h1 : (r + 1) + b = (r + b) + 1 := by omega
    have h2 : s + 1 + r = s + (r + 1) := by omega
    rw [h1]; simp only [sse_rangeMap, List.cons_append, ih (s + 1), h2]

private theorem sse_rangeMap_length {α : Type} (f : Nat → α) (s len : Nat) :
    (sse_rangeMap f s len).length = len := by
  induction len generalizing s with
  | zero => rfl
  | succ r ih => simp only [sse_rangeMap, List.length, ih]

/-- Safe indexed list lookup with default value. -/
def sseListGetD {α : Type} (d : α) : List α → Nat → α
  | [], _ => d
  | x :: _, 0 => x
  | _ :: xs, n + 1 => sseListGetD d xs n

private theorem sse_rangeMap_listGetD {α : Type} (f : Nat → α) (d : α) (s len m : Nat) (hm : m < len) :
    sseListGetD d (sse_rangeMap f s len) m = f (s + m) := by
  induction len generalizing s m with
  | zero => omega
  | succ r ih =>
    cases m with
    | zero => simp [sse_rangeMap, sseListGetD]
    | succ m1 =>
      simp only [sse_rangeMap, sseListGetD]
      have h := ih (s + 1) m1 (by omega)
      have hEq : s + 1 + m1 = s + (m1 + 1) := by omega
      rw [hEq] at h; exact h

/-- Exact finite `Nat` sum `∑_{i = 0}^{k - 1} f i` over `Fin n`. -/
def sseSumFinNatAux {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) : Nat :=
  match k with
  | 0 => 0
  | m + 1 => sseSumFinNatAux m (Nat.le_of_succ_le hk) f + f ⟨m, hk⟩

/-- Exact finite `Nat` sum `∑_{i : Fin n} f i`. -/
def sseSumFinNat {n : Nat} (f : Fin n → Nat) : Nat := sseSumFinNatAux n (Nat.le_refl n) f


private theorem sseSumFinNatAux_eq_sum {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) :
    sseSumFinNatAux k hk f = ∑ i : Fin k, f ⟨i.val, Nat.lt_of_lt_of_le i.isLt hk⟩ := by
  induction k with
  | zero => simp [sseSumFinNatAux]
  | succ m ih =>
    simp only [sseSumFinNatAux, Fin.sum_univ_castSucc, ih (Nat.le_of_succ_le hk)]; rfl

-- [helper]
theorem sseSumFinNat_eq_sum {n : Nat} (f : Fin n → Nat) :
    sseSumFinNat f = ∑ i : Fin n, f i :=
  sseSumFinNatAux_eq_sum n (Nat.le_refl n) f

private theorem sse_sumFinNat_zero {n : Nat} : sseSumFinNat (fun _ : Fin n => 0) = 0 := by
  rw [sseSumFinNat_eq_sum]; exact Finset.sum_const_zero

private theorem sse_sumFinNat_add {n : Nat} (f g : Fin n → Nat) :
    sseSumFinNat (fun i => f i + g i) = sseSumFinNat f + sseSumFinNat g := by
  simp only [sseSumFinNat_eq_sum]; exact Finset.sum_add_distrib

private theorem sse_sumFinNat_le {n : Nat} (f g : Fin n → Nat) (h : ∀ i : Fin n, f i ≤ g i) :
    sseSumFinNat f ≤ sseSumFinNat g := by
  simp only [sseSumFinNat_eq_sum]; exact Finset.sum_le_sum fun i _ => h i

private theorem sse_sumFinNat_congr {n : Nat} (f g : Fin n → Nat) (h : ∀ i : Fin n, f i = g i) :
    sseSumFinNat f = sseSumFinNat g := by
  simp only [sseSumFinNat_eq_sum]; exact Finset.sum_congr rfl fun i _ => h i

private theorem sse_sumFinNat_mul_left {n : Nat} (c : Nat) (f : Fin n → Nat) :
    sseSumFinNat (fun i => c * f i) = c * sseSumFinNat f := by
  simp only [sseSumFinNat_eq_sum]; exact (Finset.mul_sum _ _ _).symm

private theorem sse_sumFinNat_mul_right {n : Nat} (f : Fin n → Nat) (c : Nat) :
    sseSumFinNat (fun i => f i * c) = sseSumFinNat f * c := by
  simp only [sseSumFinNat_eq_sum]; exact (Finset.sum_mul _ _ _).symm

private theorem sse_sumFinNat_swap {n1 n2 : Nat} (f : Fin n1 → Fin n2 → Nat) :
    sseSumFinNat (fun i => sseSumFinNat (fun j => f i j)) =
      sseSumFinNat (fun j => sseSumFinNat (fun i => f i j)) := by
  simp only [sseSumFinNat_eq_sum]; exact Finset.sum_comm

private theorem sse_sumFinNat_kronecker {m : Nat} (u0 : Fin m) (g : Fin m → Nat) :
    sseSumFinNat (fun u : Fin m => if u0 = u then g u else 0) = g u0 := by
  rw [sseSumFinNat_eq_sum]; simp

private theorem sse_sumFinNat_kronecker_symm {m : Nat} (u0 : Fin m) (g : Fin m → Nat) :
    sseSumFinNat (fun u : Fin m => if u = u0 then g u else 0) = g u0 := by
  rw [sseSumFinNat_eq_sum]; simp

private theorem sse_sumFinNat_bij {n : Nat} (π πInv : Fin n → Fin n)
    (hL : ∀ i : Fin n, πInv (π i) = i) (hR : ∀ j : Fin n, π (πInv j) = j) (f : Fin n → Nat) :
    sseSumFinNat (fun i => f (π i)) = sseSumFinNat f := by
  simp only [sseSumFinNat_eq_sum]
  exact Fintype.sum_equiv ⟨π, πInv, hL, hR⟩ _ f fun _ => rfl


-- O(log n)-depth binary-tree quantifier, summation, and tag-collection checkers (recursion depth 8 for Fin 216!).
private def sse_allPow2 (P : Nat → Bool) : Nat → Nat → Bool
  | 0, lo => P lo
  | d + 1, lo => sse_allPow2 P d lo && sse_allPow2 P d (lo + 2 ^ d)

private theorem sse_allPow2_sound (P : Nat → Bool) (d lo : Nat)
    (h : sse_allPow2 P d lo = true) (k : Nat) (hlo : lo ≤ k) (hhi : k < lo + 2 ^ d) :
    P k = true := by
  induction d generalizing lo with
  | zero =>
    have hk : k = lo := by omega
    rw [hk]; exact h
  | succ d ih =>
    simp only [sse_allPow2, Bool.and_eq_true] at h
    have hPow : 2 ^ (d + 1) = 2 ^ d + 2 ^ d := by rw [Nat.pow_succ]; omega
    if hlt : k < lo + 2 ^ d then exact ih lo h.1 hlo hlt
    else exact ih (lo + 2 ^ d) h.2 (by omega) (by omega)

private theorem sse_forall_fin_of_pow2 {n : Nat} (d : Nat) (hd : n ≤ 2 ^ d) (P : Fin n → Bool)
    (h : sse_allPow2 (fun k => if hk : k < n then P ⟨k, hk⟩ else true) d 0 = true)
    (i : Fin n) : P i = true := by
  have h1 := sse_allPow2_sound _ d 0 h i.val (Nat.zero_le _) (by have := i.isLt; omega)
  rw [dite_eq_left i.isLt] at h1; exact h1

private def sse_sumPow2 (f : Nat → Nat) : Nat → Nat → Nat
  | 0, lo => f lo
  | d + 1, lo => sse_sumPow2 f d lo + sse_sumPow2 f d (lo + 2 ^ d)

private def sse_sumNatPrefix (g : Nat → Nat) : Nat → Nat
  | 0 => 0
  | m + 1 => sse_sumNatPrefix g m + g m

private theorem sse_sumFinNatAux_eq_prefix {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) :
    sseSumFinNatAux k hk f = sse_sumNatPrefix (fun m => if h : m < n then f ⟨m, h⟩ else 0) k := by
  induction k with
  | zero => rfl
  | succ m ih =>
    simp only [sseSumFinNatAux, sse_sumNatPrefix, ih (Nat.le_of_succ_le hk)]
    have hlt : m < n := hk
    rw [dite_eq_left hlt]

private theorem sse_sumPow2_eq_prefix (g : Nat → Nat) (d lo : Nat) :
    sse_sumNatPrefix g (lo + 2 ^ d) = sse_sumNatPrefix g lo + sse_sumPow2 g d lo := by
  induction d generalizing lo with
  | zero => simp [sse_sumPow2, sse_sumNatPrefix]
  | succ d ih =>
    have hPow : 2 ^ (d + 1) = 2 ^ d + 2 ^ d := by rw [Nat.pow_succ]; omega
    have hAdd : lo + 2 ^ (d + 1) = (lo + 2 ^ d) + 2 ^ d := by omega
    rw [hAdd, ih (lo + 2 ^ d), ih lo]
    simp only [sse_sumPow2]; omega

private theorem sse_sumNatPrefix_zero_tail (g : Nat → Nat) (n m : Nat) (hnm : n ≤ m)
    (hZ : ∀ k, n ≤ k → g k = 0) : sse_sumNatPrefix g m = sse_sumNatPrefix g n := by
  induction m with
  | zero =>
    have : n = 0 := by omega
    subst this; rfl
  | succ r ih =>
    if hr : n ≤ r then simp only [sse_sumNatPrefix, hZ r hr, Nat.add_zero, ih hr]
    else
      have : n = r + 1 := by omega
      subst this; rfl

private theorem sse_sumFinNat_eq_sumPow2 {n : Nat} (d : Nat) (hd : n ≤ 2 ^ d) (f : Fin n → Nat) :
    sseSumFinNat f = sse_sumPow2 (fun k => if h : k < n then f ⟨k, h⟩ else 0) d 0 := by
  unfold sseSumFinNat
  rw [sse_sumFinNatAux_eq_prefix n (Nat.le_refl n)]
  have h1 := sse_sumPow2_eq_prefix (fun k => if h : k < n then f ⟨k, h⟩ else 0) d 0
  simp only [Nat.zero_add, sse_sumNatPrefix] at h1
  rw [← h1]
  exact (sse_sumNatPrefix_zero_tail _ n (2 ^ d) hd (fun k hk => dite_eq_right (by omega))).symm

/-- Weighted sum over a multiplicity table `List (α × Nat)`: `∑_{(k, m) ∈ tbl} m * F k`. -/
def sseTableSum {α : Type} (F : α → Nat) : List (α × Nat) → Nat
  | [] => 0
  | (k, m) :: rest => m * F k + sseTableSum F rest

/-- Exact duplicate-free boolean predicate on a list. -/
def sseListNodup {α : Type} [DecidableEq α] : List α → Bool
  | [] => true
  | x :: xs => !(xs.any (fun y => decide (y = x))) && sseListNodup xs

/-- Balanced binary tag tree of depth `d` (`d = 8` for `Fin 216`) so grouping checks never hit `maxRecDepth`. -/
private inductive SseTree (α : Type) where
  | empty
  | single (x : α)
  | branch (l r : SseTree α)

private def sse_treeCollect {n : Nat} {α : Type} (P : Fin n → Bool) (tag : Fin n → α) : Nat → Nat → SseTree α
  | 0, lo => if h : lo < n then (if P ⟨lo, h⟩ = true then SseTree.single (tag ⟨lo, h⟩) else SseTree.empty) else SseTree.empty
  | d + 1, lo => SseTree.branch (sse_treeCollect P tag d lo) (sse_treeCollect P tag d (lo + 2 ^ d))

private def sse_treeMapSum {α : Type} (F : α → Nat) : SseTree α → Nat
  | SseTree.empty => 0
  | SseTree.single x => F x
  | SseTree.branch l r => sse_treeMapSum F l + sse_treeMapSum F r

private def sse_treeCount {α : Type} [DecidableEq α] (k : α) : SseTree α → Nat
  | SseTree.empty => 0
  | SseTree.single x => if x = k then 1 else 0
  | SseTree.branch l r => sse_treeCount k l + sse_treeCount k r

private def sse_treeAll {α : Type} (p : α → Bool) : SseTree α → Bool
  | SseTree.empty => true
  | SseTree.single x => p x
  | SseTree.branch l r => sse_treeAll p l && sse_treeAll p r

private def sse_treeMem {α : Type} [DecidableEq α] (x : α) : SseTree α → Bool
  | SseTree.empty => false
  | SseTree.single y => decide (y = x)
  | SseTree.branch l r => sse_treeMem x l || sse_treeMem x r

private theorem sse_treeCollect_mapSum {n : Nat} {α : Type} (P : Fin n → Bool) (tag : Fin n → α)
    (F : α → Nat) (d lo : Nat) :
    sse_treeMapSum F (sse_treeCollect P tag d lo) =
      sse_sumPow2 (fun k => if h : k < n then (if P ⟨k, h⟩ = true then F (tag ⟨k, h⟩) else 0) else 0) d lo := by
  induction d generalizing lo with
  | zero =>
    simp only [sse_treeCollect, sse_sumPow2]
    if h : lo < n then
      rw [dite_eq_left h, dite_eq_left h]
      if hP : P ⟨lo, h⟩ = true then rw [sse_ite_pos hP, sse_ite_pos hP]; rfl
      else rw [sse_ite_neg hP, sse_ite_neg hP]; rfl
    else rw [dite_eq_right h, dite_eq_right h]; rfl
  | succ d ih => simp only [sse_treeCollect, sse_treeMapSum, sse_sumPow2, ih]

private theorem sse_treeMapSum_zero {α : Type} (t : SseTree α) : sse_treeMapSum (fun _ : α => 0) t = 0 := by
  induction t with | empty => rfl | single _ => rfl | branch _ _ ihl ihr => simp [sse_treeMapSum, ihl, ihr]

private theorem sse_treeMapSum_add {α : Type} (f g : α → Nat) (t : SseTree α) :
    sse_treeMapSum (fun x => f x + g x) t = sse_treeMapSum f t + sse_treeMapSum g t := by
  induction t with
  | empty => rfl
  | single _ => rfl
  | branch _ _ ihl ihr => simp only [sse_treeMapSum, ihl, ihr]; omega

private theorem sse_treeMapSum_kronecker {α : Type} [DecidableEq α] (k : α) (F : α → Nat) (t : SseTree α) :
    sse_treeMapSum (fun x => if x = k then F k else 0) t = sse_treeCount k t * F k := by
  induction t with
  | empty => simp [sse_treeMapSum, sse_treeCount]
  | single x =>
    simp only [sse_treeMapSum, sse_treeCount]
    if hx : x = k then rw [sse_ite_pos hx, sse_ite_pos hx, Nat.one_mul]
    else rw [sse_ite_neg hx, sse_ite_neg hx, Nat.zero_mul]
  | branch _ _ ihl ihr => simp only [sse_treeMapSum, sse_treeCount, ihl, ihr, Nat.add_mul]

private theorem sse_treeMapSum_congr {α : Type} [DecidableEq α] (f g : α → Nat) (t : SseTree α)
    (h : ∀ x : α, sse_treeMem x t = true → f x = g x) :
    sse_treeMapSum f t = sse_treeMapSum g t := by
  induction t with
  | empty => rfl
  | single x => exact h x (by simp [sse_treeMem])
  | branch l r ihl ihr =>
    simp only [sse_treeMapSum]
    rw [ihl (fun x hx => h x (by simp [sse_treeMem, hx])),
        ihr (fun x hx => h x (by simp [sse_treeMem, hx]))]

private theorem sse_treeAll_mem {α : Type} [DecidableEq α] (p : α → Bool) (t : SseTree α)
    (hAll : sse_treeAll p t = true) (x : α) (hMem : sse_treeMem x t = true) : p x = true := by
  induction t with
  | empty => simp [sse_treeMem] at hMem
  | single y =>
    simp only [sse_treeMem] at hMem
    have hyx : y = x := of_decide_eq_true hMem
    rw [← hyx]; exact hAll
  | branch l r ihl ihr =>
    simp only [sse_treeAll, Bool.and_eq_true] at hAll
    simp only [sse_treeMem, Bool.or_eq_true] at hMem
    cases hMem with
    | inl hl => exact ihl hAll.1 hl
    | inr hr => exact ihr hAll.2 hr

private theorem sse_treeMapSum_eq_tableSum {α : Type} [DecidableEq α]
    (t : SseTree α) (tbl : List (α × Nat)) (F : α → Nat)
    (hCov : sse_treeAll (fun x => tbl.any (fun e => decide (e.1 = x))) t = true)
    (hNodup : sseListNodup (tbl.map Prod.fst) = true)
    (hCnt : tbl.all (fun e => decide (sse_treeCount e.1 t = e.2)) = true) :
    sse_treeMapSum F t = sseTableSum F tbl := by
  have hDecomp : ∀ (l : List (α × Nat)) (x : α),
      sseListNodup (l.map Prod.fst) = true →
      sseTableSum (fun k => if x = k then F k else 0) (l.map (fun e => (e.1, 1))) =
        match l.any (fun e => decide (e.1 = x)) with | true => F x | false => 0 := by
    intro l x; induction l with
    | nil => intro _; rfl
    | cons e rest ih =>
      intro hnd
      simp only [List.map, sseListNodup, Bool.and_eq_true, Bool.not_eq_true'] at hnd
      simp only [List.map, sseTableSum, Nat.one_mul, ih hnd.2, List.any]
      if hxe : x = e.1 then
        have hNotIn : rest.any (fun p => decide (p.1 = x)) = false := by
          have h1 := hnd.1; rw [← hxe] at h1
          clear ih hnd hxe
          induction rest with
          | nil => rfl
          | cons r rs ihr =>
            simp only [List.map, List.any, Bool.or_eq_false_iff] at h1 ⊢
            exact ⟨h1.1, ihr h1.2⟩
        have hEq1 : decide (e.1 = x) = true := decide_eq_true hxe.symm
        rw [sse_ite_pos hxe, hNotIn, hEq1, Bool.true_or, hxe]; dsimp only; exact Nat.add_zero _
      else
        have hNe1 : decide (e.1 = x) = false := decide_eq_false (fun h => hxe h.symm)
        rw [sse_ite_neg hxe, hNe1, Bool.false_or]; omega
  have hSwap : ∀ (l : List (α × Nat)),
      sse_treeMapSum (fun x => sseTableSum (fun k => if x = k then F k else 0) (l.map (fun e => (e.1, 1)))) t =
        sseTableSum (fun k => sse_treeCount k t * F k) (l.map (fun e => (e.1, 1))) := by
    intro l; induction l with
    | nil => exact sse_treeMapSum_zero t
    | cons e rest ih =>
      simp only [List.map, sseTableSum, Nat.one_mul]
      rw [sse_treeMapSum_add, sse_treeMapSum_kronecker, ih]
  have hLeft : sse_treeMapSum F t =
      sse_treeMapSum (fun x => sseTableSum (fun k => if x = k then F k else 0) (tbl.map (fun e => (e.1, 1)))) t := by
    apply sse_treeMapSum_congr; intro x hx
    rw [hDecomp tbl x hNodup, sse_treeAll_mem _ t hCov x hx]
  have hRight : ∀ (l : List (α × Nat)),
      l.all (fun e => decide (sse_treeCount e.1 t = e.2)) = true →
      sseTableSum (fun k => sse_treeCount k t * F k) (l.map (fun e => (e.1, 1))) = sseTableSum F l := by
    intro l; induction l with
    | nil => intro _; rfl
    | cons e rest ih =>
      intro hc
      simp only [List.all, Bool.and_eq_true] at hc
      have he : sse_treeCount e.1 t = e.2 := of_decide_eq_true hc.1
      simp only [List.map, sseTableSum, Nat.one_mul, he, ih hc.2]
  rw [hLeft, hSwap tbl, hRight tbl hCnt]

private def sse_checkGroupTbl {n : Nat} {α : Type} [DecidableEq α]
    (d : Nat) (P : Fin n → Bool) (tag : Fin n → α) (tbl : List (α × Nat)) : Bool :=
  let t := sse_treeCollect P tag d 0
  sse_treeAll (fun x => tbl.any (fun e => decide (e.1 = x))) t &&
  sseListNodup (tbl.map Prod.fst) &&
  tbl.all (fun e => decide (sse_treeCount e.1 t = e.2))

private theorem sse_checkGroupTbl_sound {n : Nat} {α : Type} [DecidableEq α]
    (d : Nat) (hd : n ≤ 2 ^ d) (P : Fin n → Bool) (tag : Fin n → α) (tbl : List (α × Nat)) (F : α → Nat)
    (h : sse_checkGroupTbl d P tag tbl = true) :
    sseSumFinNat (fun i : Fin n => if P i = true then F (tag i) else 0) = sseTableSum F tbl := by
  unfold sse_checkGroupTbl at h
  simp only [Bool.and_eq_true] at h
  rw [sse_sumFinNat_eq_sumPow2 d hd, ← sse_treeCollect_mapSum P tag F d 0]
  exact sse_treeMapSum_eq_tableSum (sse_treeCollect P tag d 0) tbl F h.1.1 h.1.2 h.2


-- Private `Int` sum helpers over `Vibe.SpectralSharp.ssSumFin` via `ssSumFin_eq_sum`.
private theorem sse_ssSumFin_zero {n : Nat} : ssSumFin (fun _ : Fin n => (0 : Int)) = 0 := by
  rw [ssSumFin_eq_sum]; exact Finset.sum_const_zero

private theorem sse_ssSumFin_add {n : Nat} (f g : Fin n → Int) :
    ssSumFin (fun i => f i + g i) = ssSumFin f + ssSumFin g := by
  simp only [ssSumFin_eq_sum]; exact Finset.sum_add_distrib

private theorem sse_ssSumFin_le {n : Nat} (f g : Fin n → Int) (h : ∀ i : Fin n, f i ≤ g i) :
    ssSumFin f ≤ ssSumFin g := by
  simp only [ssSumFin_eq_sum]; exact Finset.sum_le_sum fun i _ => h i

private theorem sse_ssSumFin_mul_right {n : Nat} (f : Fin n → Int) (c : Int) :
    ssSumFin (fun i => f i * c) = ssSumFin f * c := by
  simp only [ssSumFin_eq_sum]; exact (Finset.sum_mul _ _ _).symm

private theorem sse_ssSumFin_swap {n1 n2 : Nat} (f : Fin n1 → Fin n2 → Int) :
    ssSumFin (fun i => ssSumFin (fun j => f i j)) = ssSumFin (fun j => ssSumFin (fun i => f i j)) := by
  simp only [ssSumFin_eq_sum]; exact Finset.sum_comm

private theorem sse_ssSumFin_kronecker {m : Nat} (u0 : Fin m) (g : Fin m → Int) :
    ssSumFin (fun u : Fin m => if u0 = u then g u else 0) = g u0 := by
  rw [ssSumFin_eq_sum]; simp


/-! ## Section 1: `W(F_4)` Automorphisms & Exhaustive `216`-Clique Geometry -/

/-- Exact `Fin 24` permutations of the 4 Bourbaki `W(F_4)` simple reflections `s_0..s_3` on `d4RootOf`. -/
def sseWF4GenNat : Nat → Nat → Nat
  | 0, a => match a with
    | 0 => 4 | 1 => 5 | 2 => 6 | 3 => 7 | 4 => 0 | 5 => 1 | 6 => 2 | 7 => 3
    | 8 => 8 | 9 => 9 | 10 => 10 | 11 => 11 | 12 => 12 | 13 => 14 | 14 => 13 | 15 => 15
    | 16 => 20 | 17 => 21 | 18 => 22 | 19 => 23 | 20 => 16 | 21 => 17 | 22 => 18 | _ => 19
  | 1, a => match a with
    | 0 => 0 | 1 => 1 | 2 => 2 | 3 => 3 | 4 => 8 | 5 => 9 | 6 => 10 | 7 => 11
    | 8 => 4 | 9 => 5 | 10 => 6 | 11 => 7 | 12 => 16 | 13 => 17 | 14 => 18 | 15 => 19
    | 16 => 12 | 17 => 13 | 18 => 14 | 19 => 15 | 20 => 20 | 21 => 22 | 22 => 21 | _ => 23
  | 2, a => match a with
    | 0 => 0 | 1 => 1 | 2 => 2 | 3 => 3 | 4 => 4 | 5 => 5 | 6 => 6 | 7 => 7
    | 8 => 9 | 9 => 8 | 10 => 11 | 11 => 10 | 12 => 12 | 13 => 13 | 14 => 14 | 15 => 15
    | 16 => 17 | 17 => 16 | 18 => 19 | 19 => 18 | 20 => 21 | 21 => 20 | 22 => 23 | _ => 22
  | _, a => match a with
    | 0 => 0 | 1 => 20 | 2 => 23 | 3 => 3 | 4 => 4 | 5 => 16 | 6 => 19 | 7 => 7
    | 8 => 8 | 9 => 12 | 10 => 15 | 11 => 11 | 12 => 9 | 13 => 13 | 14 => 14 | 15 => 10
    | 16 => 5 | 17 => 17 | 18 => 18 | 19 => 6 | 20 => 1 | 21 => 21 | 22 => 22 | _ => 2

-- [helper]
theorem sse_wf4GenNat_lt (k : Fin 4) (a : Fin 24) : sseWF4GenNat k.val a.val < 24 := by
  exact (by decide : ∀ (x : Fin 4) (y : Fin 24), sseWF4GenNat x.val y.val < 24) k a

/-- Typed `W(F_4)` simple reflection generator on `Fin 24`. -/
def sseWF4Gen (k : Fin 4) (a : Fin 24) : Fin 24 := ⟨sseWF4GenNat k.val a.val, sse_wf4GenNat_lt k a⟩

/-- Apply a `W(F_4)` generator word `[k_1, ..., k_m]` (`k_1` applied outermost) to `Fin 24`. -/
def sseApplyWord : List (Fin 4) → Fin 24 → Fin 24
  | [], a => a
  | k :: rest, a => sseWF4Gen k (sseApplyWord rest a)

/-- Fast raw-`Nat` word application mirroring `sseApplyWord`. -/
def sseApplyWordNat : List Nat → Nat → Nat
  | [], a => a
  | k :: rest, a => sseWF4GenNat k (sseApplyWordNat rest a)

/-- Convert raw `Nat` generator list (`0..3`) into `List (Fin 4)`. -/
def sseNatWordToFin4 : List Nat → List (Fin 4)
  | [] => []
  | k :: rest => ⟨k % 4, Nat.mod_lt k (by decide)⟩ :: sseNatWordToFin4 rest

private theorem sse_wf4Gen_inv : ∀ (k : Fin 4) (a : Fin 24), sseWF4Gen k (sseWF4Gen k a) = a := by
  decide

private theorem sse_wf4Gen_preserves_dot4 :
    ∀ (k : Fin 4) (a b : Fin 24),
      dot4 (d4RootOf (sseWF4Gen k a)) (d4RootOf (sseWF4Gen k b)) = dot4 (d4RootOf a) (d4RootOf b) := by
  decide

private theorem sse_wf4Gen_preserves_adj24 :
    ∀ (k : Fin 4) (a b : Fin 24), adj24 (sseWF4Gen k a) (sseWF4Gen k b) = adj24 a b := by
  intro k a b; unfold adj24; rw [sse_wf4Gen_preserves_dot4]

private theorem sse_applyWord_append (w1 w2 : List (Fin 4)) (a : Fin 24) :
    sseApplyWord (w1 ++ w2) a = sseApplyWord w1 (sseApplyWord w2 a) := by
  induction w1 with | nil => rfl | cons k rest ih => simp only [List.cons_append, sseApplyWord, ih]

private theorem sse_applyWord_inv (w : List (Fin 4)) (a : Fin 24) :
    sseApplyWord w.reverse (sseApplyWord w a) = a := by
  induction w with
  | nil => rfl
  | cons k rest ih =>
    simp only [List.reverse_cons, sseApplyWord, sse_applyWord_append, sse_wf4Gen_inv, ih]

private theorem sse_applyWord_preserves_dot4 (w : List (Fin 4)) (a b : Fin 24) :
    dot4 (d4RootOf (sseApplyWord w a)) (d4RootOf (sseApplyWord w b)) = dot4 (d4RootOf a) (d4RootOf b) := by
  induction w with
  | nil => rfl
  | cons k rest ih => simp only [sseApplyWord, sse_wf4Gen_preserves_dot4, ih]

private theorem sse_applyWord_preserves_adj24 (w : List (Fin 4)) (a b : Fin 24) :
    adj24 (sseApplyWord w a) (sseApplyWord w b) = adj24 a b := by
  unfold adj24; rw [sse_applyWord_preserves_dot4]

private theorem sse_applyWord_val_eq_nat (w : List (Fin 4)) (a : Fin 24) :
    (sseApplyWord w a).val = sseApplyWordNat (w.map Fin.val) a.val := by
  induction w with
  | nil => rfl
  | cons k rest ih => simp only [sseApplyWord, List.map, sseApplyWordNat, sseWF4Gen, ih]

/-- Fast `Nat` adjacency mirror on `0..23` matching `Vibe.CuspGrowth.adj24`. -/
-- [helper]
abbrev sse_Adj8 := Nat × Nat × Nat × Nat × Nat × Nat × Nat × Nat

-- [helper]
def sse_in8 (x : Nat) (t : sse_Adj8) : Bool :=
  (x == t.1) || (x == t.2.1) || (x == t.2.2.1) || (x == t.2.2.2.1) ||
  (x == t.2.2.2.2.1) || (x == t.2.2.2.2.2.1) || (x == t.2.2.2.2.2.2.1) || (x == t.2.2.2.2.2.2.2)

-- [helper]
def sse_adjTupleNat : Nat → sse_Adj8
  | 0  => (4, 5, 8, 9, 12, 13, 16, 17)  | 1  => (4, 5, 8, 9, 14, 15, 18, 19)
  | 2  => (6, 7, 10, 11, 12, 13, 16, 17) | 3  => (6, 7, 10, 11, 14, 15, 18, 19)
  | 4  => (0, 1, 8, 9, 12, 14, 20, 21)  | 5  => (0, 1, 8, 9, 13, 15, 22, 23)
  | 6  => (2, 3, 10, 11, 12, 14, 20, 21) | 7  => (2, 3, 10, 11, 13, 15, 22, 23)
  | 8  => (0, 1, 4, 5, 16, 18, 20, 22)  | 9  => (0, 1, 4, 5, 17, 19, 21, 23)
  | 10 => (2, 3, 6, 7, 16, 18, 20, 22)  | 11 => (2, 3, 6, 7, 17, 19, 21, 23)
  | 12 => (0, 2, 4, 6, 16, 17, 20, 21)  | 13 => (0, 2, 5, 7, 16, 17, 22, 23)
  | 14 => (1, 3, 4, 6, 18, 19, 20, 21)  | 15 => (1, 3, 5, 7, 18, 19, 22, 23)
  | 16 => (0, 2, 8, 10, 12, 13, 20, 22) | 17 => (0, 2, 9, 11, 12, 13, 21, 23)
  | 18 => (1, 3, 8, 10, 14, 15, 20, 22) | 19 => (1, 3, 9, 11, 14, 15, 21, 23)
  | 20 => (4, 6, 8, 10, 12, 14, 16, 18) | 21 => (4, 6, 9, 11, 12, 14, 17, 19)
  | 22 => (5, 7, 8, 10, 13, 15, 16, 18) | _  => (5, 7, 9, 11, 13, 15, 17, 19)

-- [helper]
def sse_adjFast (a b : Nat) : Bool := sse_in8 b (sse_adjTupleNat a)

private theorem sse_adj24_eq_fast : ∀ a b : Fin 24, adj24 a b = sse_adjFast a.val b.val := by decide

/-- Shifted dot product `(r_a · r_b + 2) ∈ {0, 1, 2, 3, 4}` on `0..23`. -/
def sseDotPlus2 (a b : Fin 24) : Nat := (dot4 (d4RootOf a) (d4RootOf b) + 2).toNat

/-- Fast `Nat` root coordinates for `dot4 + 2` calculation. -/
-- [helper]
def sse_dotPlus2Fast (a b : Nat) : Nat :=
  let r : Nat → Int × Int × Int × Int
    | 0 => (1,1,0,0) | 1 => (1,-1,0,0) | 2 => (-1,1,0,0) | 3 => (-1,-1,0,0)
    | 4 => (1,0,1,0) | 5 => (1,0,-1,0) | 6 => (-1,0,1,0) | 7 => (-1,0,-1,0)
    | 8 => (1,0,0,1) | 9 => (1,0,0,-1) | 10 => (-1,0,0,1) | 11 => (-1,0,0,-1)
    | 12 => (0,1,1,0) | 13 => (0,1,-1,0) | 14 => (0,-1,1,0) | 15 => (0,-1,-1,0)
    | 16 => (0,1,0,1) | 17 => (0,1,0,-1) | 18 => (0,-1,0,1) | 19 => (0,-1,0,-1)
    | 20 => (0,0,1,1) | 21 => (0,0,1,-1) | 22 => (0,0,-1,1) | _ => (0,0,-1,-1)
  let ra := r a; let rb := r b
  (ra.1 * rb.1 + ra.2.1 * rb.2.1 + ra.2.2.1 * rb.2.2.1 + ra.2.2.2 * rb.2.2.2 + 2).toNat

private theorem sse_dotPlus2_eq_fast : ∀ a b : Fin 24, sseDotPlus2 a b = sse_dotPlus2Fast a.val b.val := by
  decide

/-- Non-empty clique of `Γ_24` (`1`, `2`, or `3` vertices in strictly ascending `Fin 24` order). -/
inductive SseClique where
  | c1 (a : Fin 24)
  | c2 (a b : Fin 24)
  | c3 (a b c : Fin 24)
  deriving DecidableEq, Repr

/-- Exact list of all `216` non-empty cliques of `Γ_24`, built directly from `Vibe.CuspGrowth`'s
    `cliques1_24` (`24`), `cliques2_24` (`96`), and `cliques3_24` (`96`). -/
def sseAllCliquesList : List SseClique :=
  cliques1_24.map SseClique.c1 ++
  cliques2_24.map (fun p => SseClique.c2 p.1 p.2) ++
  cliques3_24.map (fun t => SseClique.c3 t.1 t.2.1 t.2.2)

-- [helper]
abbrev sse_v0 : Fin 24 := ⟨0, by decide⟩
-- [helper]
abbrev sse_v1 : Fin 24 := ⟨1, by decide⟩
-- [helper]
abbrev sse_v2 : Fin 24 := ⟨2, by decide⟩
-- [helper]
abbrev sse_v3 : Fin 24 := ⟨3, by decide⟩
-- [helper]
abbrev sse_v4 : Fin 24 := ⟨4, by decide⟩
-- [helper]
abbrev sse_v5 : Fin 24 := ⟨5, by decide⟩
-- [helper]
abbrev sse_v6 : Fin 24 := ⟨6, by decide⟩
-- [helper]
abbrev sse_v7 : Fin 24 := ⟨7, by decide⟩
-- [helper]
abbrev sse_v8 : Fin 24 := ⟨8, by decide⟩
-- [helper]
abbrev sse_v9 : Fin 24 := ⟨9, by decide⟩
-- [helper]
abbrev sse_v10 : Fin 24 := ⟨10, by decide⟩
-- [helper]
abbrev sse_v11 : Fin 24 := ⟨11, by decide⟩
-- [helper]
abbrev sse_v12 : Fin 24 := ⟨12, by decide⟩
-- [helper]
abbrev sse_v13 : Fin 24 := ⟨13, by decide⟩
-- [helper]
abbrev sse_v14 : Fin 24 := ⟨14, by decide⟩
-- [helper]
abbrev sse_v15 : Fin 24 := ⟨15, by decide⟩
-- [helper]
abbrev sse_v16 : Fin 24 := ⟨16, by decide⟩
-- [helper]
abbrev sse_v17 : Fin 24 := ⟨17, by decide⟩
-- [helper]
abbrev sse_v18 : Fin 24 := ⟨18, by decide⟩
-- [helper]
abbrev sse_v19 : Fin 24 := ⟨19, by decide⟩
-- [helper]
abbrev sse_v20 : Fin 24 := ⟨20, by decide⟩
-- [helper]
abbrev sse_v21 : Fin 24 := ⟨21, by decide⟩
-- [helper]
abbrev sse_v22 : Fin 24 := ⟨22, by decide⟩
-- [helper]
abbrev sse_v23 : Fin 24 := ⟨23, by decide⟩

-- [helper]
def sse_clique216Nat (i : Nat) : SseClique :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => SseClique.c1 sse_v0 | 1 => SseClique.c1 sse_v1 | 2 => SseClique.c1 sse_v2 | 3 => SseClique.c1 sse_v3 | 4 => SseClique.c1 sse_v4 | 5 => SseClique.c1 sse_v5 | 6 => SseClique.c1 sse_v6 | 7 => SseClique.c1 sse_v7 | 8 => SseClique.c1 sse_v8 | 9 => SseClique.c1 sse_v9 | 10 => SseClique.c1 sse_v10 | 11 => SseClique.c1 sse_v11 | 12 => SseClique.c1 sse_v12 | 13 => SseClique.c1 sse_v13 | 14 => SseClique.c1 sse_v14 | 15 => SseClique.c1 sse_v15 | _ => SseClique.c1 sse_v0
  | 1 => match i % 16 with
    | 0 => SseClique.c1 sse_v16 | 1 => SseClique.c1 sse_v17 | 2 => SseClique.c1 sse_v18 | 3 => SseClique.c1 sse_v19 | 4 => SseClique.c1 sse_v20 | 5 => SseClique.c1 sse_v21 | 6 => SseClique.c1 sse_v22 | 7 => SseClique.c1 sse_v23 | 8 => SseClique.c2 sse_v0 sse_v4 | 9 => SseClique.c2 sse_v0 sse_v5 | 10 => SseClique.c2 sse_v0 sse_v8 | 11 => SseClique.c2 sse_v0 sse_v9 | 12 => SseClique.c2 sse_v0 sse_v12 | 13 => SseClique.c2 sse_v0 sse_v13 | 14 => SseClique.c2 sse_v0 sse_v16 | 15 => SseClique.c2 sse_v0 sse_v17 | _ => SseClique.c1 sse_v0
  | 2 => match i % 16 with
    | 0 => SseClique.c2 sse_v1 sse_v4 | 1 => SseClique.c2 sse_v1 sse_v5 | 2 => SseClique.c2 sse_v1 sse_v8 | 3 => SseClique.c2 sse_v1 sse_v9 | 4 => SseClique.c2 sse_v1 sse_v14 | 5 => SseClique.c2 sse_v1 sse_v15 | 6 => SseClique.c2 sse_v1 sse_v18 | 7 => SseClique.c2 sse_v1 sse_v19 | 8 => SseClique.c2 sse_v2 sse_v6 | 9 => SseClique.c2 sse_v2 sse_v7 | 10 => SseClique.c2 sse_v2 sse_v10 | 11 => SseClique.c2 sse_v2 sse_v11 | 12 => SseClique.c2 sse_v2 sse_v12 | 13 => SseClique.c2 sse_v2 sse_v13 | 14 => SseClique.c2 sse_v2 sse_v16 | 15 => SseClique.c2 sse_v2 sse_v17 | _ => SseClique.c1 sse_v0
  | 3 => match i % 16 with
    | 0 => SseClique.c2 sse_v3 sse_v6 | 1 => SseClique.c2 sse_v3 sse_v7 | 2 => SseClique.c2 sse_v3 sse_v10 | 3 => SseClique.c2 sse_v3 sse_v11 | 4 => SseClique.c2 sse_v3 sse_v14 | 5 => SseClique.c2 sse_v3 sse_v15 | 6 => SseClique.c2 sse_v3 sse_v18 | 7 => SseClique.c2 sse_v3 sse_v19 | 8 => SseClique.c2 sse_v4 sse_v8 | 9 => SseClique.c2 sse_v4 sse_v9 | 10 => SseClique.c2 sse_v4 sse_v12 | 11 => SseClique.c2 sse_v4 sse_v14 | 12 => SseClique.c2 sse_v4 sse_v20 | 13 => SseClique.c2 sse_v4 sse_v21 | 14 => SseClique.c2 sse_v5 sse_v8 | 15 => SseClique.c2 sse_v5 sse_v9 | _ => SseClique.c1 sse_v0
  | 4 => match i % 16 with
    | 0 => SseClique.c2 sse_v5 sse_v13 | 1 => SseClique.c2 sse_v5 sse_v15 | 2 => SseClique.c2 sse_v5 sse_v22 | 3 => SseClique.c2 sse_v5 sse_v23 | 4 => SseClique.c2 sse_v6 sse_v10 | 5 => SseClique.c2 sse_v6 sse_v11 | 6 => SseClique.c2 sse_v6 sse_v12 | 7 => SseClique.c2 sse_v6 sse_v14 | 8 => SseClique.c2 sse_v6 sse_v20 | 9 => SseClique.c2 sse_v6 sse_v21 | 10 => SseClique.c2 sse_v7 sse_v10 | 11 => SseClique.c2 sse_v7 sse_v11 | 12 => SseClique.c2 sse_v7 sse_v13 | 13 => SseClique.c2 sse_v7 sse_v15 | 14 => SseClique.c2 sse_v7 sse_v22 | 15 => SseClique.c2 sse_v7 sse_v23 | _ => SseClique.c1 sse_v0
  | 5 => match i % 16 with
    | 0 => SseClique.c2 sse_v8 sse_v16 | 1 => SseClique.c2 sse_v8 sse_v18 | 2 => SseClique.c2 sse_v8 sse_v20 | 3 => SseClique.c2 sse_v8 sse_v22 | 4 => SseClique.c2 sse_v9 sse_v17 | 5 => SseClique.c2 sse_v9 sse_v19 | 6 => SseClique.c2 sse_v9 sse_v21 | 7 => SseClique.c2 sse_v9 sse_v23 | 8 => SseClique.c2 sse_v10 sse_v16 | 9 => SseClique.c2 sse_v10 sse_v18 | 10 => SseClique.c2 sse_v10 sse_v20 | 11 => SseClique.c2 sse_v10 sse_v22 | 12 => SseClique.c2 sse_v11 sse_v17 | 13 => SseClique.c2 sse_v11 sse_v19 | 14 => SseClique.c2 sse_v11 sse_v21 | 15 => SseClique.c2 sse_v11 sse_v23 | _ => SseClique.c1 sse_v0
  | 6 => match i % 16 with
    | 0 => SseClique.c2 sse_v12 sse_v16 | 1 => SseClique.c2 sse_v12 sse_v17 | 2 => SseClique.c2 sse_v12 sse_v20 | 3 => SseClique.c2 sse_v12 sse_v21 | 4 => SseClique.c2 sse_v13 sse_v16 | 5 => SseClique.c2 sse_v13 sse_v17 | 6 => SseClique.c2 sse_v13 sse_v22 | 7 => SseClique.c2 sse_v13 sse_v23 | 8 => SseClique.c2 sse_v14 sse_v18 | 9 => SseClique.c2 sse_v14 sse_v19 | 10 => SseClique.c2 sse_v14 sse_v20 | 11 => SseClique.c2 sse_v14 sse_v21 | 12 => SseClique.c2 sse_v15 sse_v18 | 13 => SseClique.c2 sse_v15 sse_v19 | 14 => SseClique.c2 sse_v15 sse_v22 | 15 => SseClique.c2 sse_v15 sse_v23 | _ => SseClique.c1 sse_v0
  | 7 => match i % 16 with
    | 0 => SseClique.c2 sse_v16 sse_v20 | 1 => SseClique.c2 sse_v16 sse_v22 | 2 => SseClique.c2 sse_v17 sse_v21 | 3 => SseClique.c2 sse_v17 sse_v23 | 4 => SseClique.c2 sse_v18 sse_v20 | 5 => SseClique.c2 sse_v18 sse_v22 | 6 => SseClique.c2 sse_v19 sse_v21 | 7 => SseClique.c2 sse_v19 sse_v23 | 8 => SseClique.c3 sse_v0 sse_v4 sse_v8 | 9 => SseClique.c3 sse_v0 sse_v4 sse_v9 | 10 => SseClique.c3 sse_v0 sse_v4 sse_v12 | 11 => SseClique.c3 sse_v0 sse_v5 sse_v8 | 12 => SseClique.c3 sse_v0 sse_v5 sse_v9 | 13 => SseClique.c3 sse_v0 sse_v5 sse_v13 | 14 => SseClique.c3 sse_v0 sse_v8 sse_v16 | 15 => SseClique.c3 sse_v0 sse_v9 sse_v17 | _ => SseClique.c1 sse_v0
  | 8 => match i % 16 with
    | 0 => SseClique.c3 sse_v0 sse_v12 sse_v16 | 1 => SseClique.c3 sse_v0 sse_v12 sse_v17 | 2 => SseClique.c3 sse_v0 sse_v13 sse_v16 | 3 => SseClique.c3 sse_v0 sse_v13 sse_v17 | 4 => SseClique.c3 sse_v1 sse_v4 sse_v8 | 5 => SseClique.c3 sse_v1 sse_v4 sse_v9 | 6 => SseClique.c3 sse_v1 sse_v4 sse_v14 | 7 => SseClique.c3 sse_v1 sse_v5 sse_v8 | 8 => SseClique.c3 sse_v1 sse_v5 sse_v9 | 9 => SseClique.c3 sse_v1 sse_v5 sse_v15 | 10 => SseClique.c3 sse_v1 sse_v8 sse_v18 | 11 => SseClique.c3 sse_v1 sse_v9 sse_v19 | 12 => SseClique.c3 sse_v1 sse_v14 sse_v18 | 13 => SseClique.c3 sse_v1 sse_v14 sse_v19 | 14 => SseClique.c3 sse_v1 sse_v15 sse_v18 | 15 => SseClique.c3 sse_v1 sse_v15 sse_v19 | _ => SseClique.c1 sse_v0
  | 9 => match i % 16 with
    | 0 => SseClique.c3 sse_v2 sse_v6 sse_v10 | 1 => SseClique.c3 sse_v2 sse_v6 sse_v11 | 2 => SseClique.c3 sse_v2 sse_v6 sse_v12 | 3 => SseClique.c3 sse_v2 sse_v7 sse_v10 | 4 => SseClique.c3 sse_v2 sse_v7 sse_v11 | 5 => SseClique.c3 sse_v2 sse_v7 sse_v13 | 6 => SseClique.c3 sse_v2 sse_v10 sse_v16 | 7 => SseClique.c3 sse_v2 sse_v11 sse_v17 | 8 => SseClique.c3 sse_v2 sse_v12 sse_v16 | 9 => SseClique.c3 sse_v2 sse_v12 sse_v17 | 10 => SseClique.c3 sse_v2 sse_v13 sse_v16 | 11 => SseClique.c3 sse_v2 sse_v13 sse_v17 | 12 => SseClique.c3 sse_v3 sse_v6 sse_v10 | 13 => SseClique.c3 sse_v3 sse_v6 sse_v11 | 14 => SseClique.c3 sse_v3 sse_v6 sse_v14 | 15 => SseClique.c3 sse_v3 sse_v7 sse_v10 | _ => SseClique.c1 sse_v0
  | 10 => match i % 16 with
    | 0 => SseClique.c3 sse_v3 sse_v7 sse_v11 | 1 => SseClique.c3 sse_v3 sse_v7 sse_v15 | 2 => SseClique.c3 sse_v3 sse_v10 sse_v18 | 3 => SseClique.c3 sse_v3 sse_v11 sse_v19 | 4 => SseClique.c3 sse_v3 sse_v14 sse_v18 | 5 => SseClique.c3 sse_v3 sse_v14 sse_v19 | 6 => SseClique.c3 sse_v3 sse_v15 sse_v18 | 7 => SseClique.c3 sse_v3 sse_v15 sse_v19 | 8 => SseClique.c3 sse_v4 sse_v8 sse_v20 | 9 => SseClique.c3 sse_v4 sse_v9 sse_v21 | 10 => SseClique.c3 sse_v4 sse_v12 sse_v20 | 11 => SseClique.c3 sse_v4 sse_v12 sse_v21 | 12 => SseClique.c3 sse_v4 sse_v14 sse_v20 | 13 => SseClique.c3 sse_v4 sse_v14 sse_v21 | 14 => SseClique.c3 sse_v5 sse_v8 sse_v22 | 15 => SseClique.c3 sse_v5 sse_v9 sse_v23 | _ => SseClique.c1 sse_v0
  | 11 => match i % 16 with
    | 0 => SseClique.c3 sse_v5 sse_v13 sse_v22 | 1 => SseClique.c3 sse_v5 sse_v13 sse_v23 | 2 => SseClique.c3 sse_v5 sse_v15 sse_v22 | 3 => SseClique.c3 sse_v5 sse_v15 sse_v23 | 4 => SseClique.c3 sse_v6 sse_v10 sse_v20 | 5 => SseClique.c3 sse_v6 sse_v11 sse_v21 | 6 => SseClique.c3 sse_v6 sse_v12 sse_v20 | 7 => SseClique.c3 sse_v6 sse_v12 sse_v21 | 8 => SseClique.c3 sse_v6 sse_v14 sse_v20 | 9 => SseClique.c3 sse_v6 sse_v14 sse_v21 | 10 => SseClique.c3 sse_v7 sse_v10 sse_v22 | 11 => SseClique.c3 sse_v7 sse_v11 sse_v23 | 12 => SseClique.c3 sse_v7 sse_v13 sse_v22 | 13 => SseClique.c3 sse_v7 sse_v13 sse_v23 | 14 => SseClique.c3 sse_v7 sse_v15 sse_v22 | 15 => SseClique.c3 sse_v7 sse_v15 sse_v23 | _ => SseClique.c1 sse_v0
  | 12 => match i % 16 with
    | 0 => SseClique.c3 sse_v8 sse_v16 sse_v20 | 1 => SseClique.c3 sse_v8 sse_v16 sse_v22 | 2 => SseClique.c3 sse_v8 sse_v18 sse_v20 | 3 => SseClique.c3 sse_v8 sse_v18 sse_v22 | 4 => SseClique.c3 sse_v9 sse_v17 sse_v21 | 5 => SseClique.c3 sse_v9 sse_v17 sse_v23 | 6 => SseClique.c3 sse_v9 sse_v19 sse_v21 | 7 => SseClique.c3 sse_v9 sse_v19 sse_v23 | 8 => SseClique.c3 sse_v10 sse_v16 sse_v20 | 9 => SseClique.c3 sse_v10 sse_v16 sse_v22 | 10 => SseClique.c3 sse_v10 sse_v18 sse_v20 | 11 => SseClique.c3 sse_v10 sse_v18 sse_v22 | 12 => SseClique.c3 sse_v11 sse_v17 sse_v21 | 13 => SseClique.c3 sse_v11 sse_v17 sse_v23 | 14 => SseClique.c3 sse_v11 sse_v19 sse_v21 | 15 => SseClique.c3 sse_v11 sse_v19 sse_v23 | _ => SseClique.c1 sse_v0
  | 13 => match i % 16 with
    | 0 => SseClique.c3 sse_v12 sse_v16 sse_v20 | 1 => SseClique.c3 sse_v12 sse_v17 sse_v21 | 2 => SseClique.c3 sse_v13 sse_v16 sse_v22 | 3 => SseClique.c3 sse_v13 sse_v17 sse_v23 | 4 => SseClique.c3 sse_v14 sse_v18 sse_v20 | 5 => SseClique.c3 sse_v14 sse_v19 sse_v21 | 6 => SseClique.c3 sse_v15 sse_v18 sse_v22 | 7 => SseClique.c3 sse_v15 sse_v19 sse_v23 | _ => SseClique.c1 sse_v0
  | _ => SseClique.c1 sse_v0

/-- O(1)-depth indexed access to all `216` non-empty cliques of `Γ_24`
    (kernel-verified identically equal to `sseAllCliquesList` from `Vibe.CuspGrowth`!). -/
def sseClique216 (i : Fin 216) : SseClique := sse_clique216Nat i.val

private theorem sse_clique216_eq_cuspGrowth_parts :
    sse_rangeMap sse_clique216Nat 0 24 = cliques1_24.map SseClique.c1 ∧
    sse_rangeMap sse_clique216Nat 24 96 = cliques2_24.map (fun p => SseClique.c2 p.1 p.2) ∧
    sse_rangeMap sse_clique216Nat 120 96 = cliques3_24.map (fun t => SseClique.c3 t.1 t.2.1 t.2.2) := by
  decide

private theorem sse_allCliquesList_eq_rangeMap :
    sseAllCliquesList = sse_rangeMap sse_clique216Nat 0 216 := by
  unfold sseAllCliquesList
  rw [← sse_clique216_eq_cuspGrowth_parts.1, ← sse_clique216_eq_cuspGrowth_parts.2.1,
      ← sse_clique216_eq_cuspGrowth_parts.2.2]
  have h1 := sse_rangeMap_append sse_clique216Nat 0 24 96
  have h2 := sse_rangeMap_append sse_clique216Nat 0 120 96
  rw [← h1, ← h2]

private theorem sse_allCliquesList_len : sseAllCliquesList.length = 216 := by
  rw [sse_allCliquesList_eq_rangeMap, sse_rangeMap_length]

private theorem sse_allCliquesList_getD (i : Fin 216) :
    sseListGetD (SseClique.c1 ⟨0, by decide⟩) sseAllCliquesList i.val = sseClique216 i := by
  rw [sse_allCliquesList_eq_rangeMap, sse_rangeMap_listGetD sse_clique216Nat _ 0 216 i.val i.isLt]
  simp [sseClique216]

/-- Clique cardinality `|C| ∈ {1, 2, 3}`. -/
def sseCliqueSize : SseClique → Nat
  | SseClique.c1 _ => 1
  | SseClique.c2 _ _ => 2
  | SseClique.c3 _ _ _ => 3

def sseSize216 (i : Fin 216) : Nat := sseCliqueSize (sseClique216 i)

/-- Strict lexicographic key for proving injectivity of `sseClique216` in `215` steps (not `46,656`). -/
private def sse_cliqueKey : SseClique → Nat
  | SseClique.c1 a => a.val
  | SseClique.c2 a b => 100 + a.val * 24 + b.val
  | SseClique.c3 a b c => 1000 + (a.val * 24 + b.val) * 24 + c.val

private theorem sse_clique216_strict_adj :
    sse_allPow2 (fun k =>
      if k < 215 then decide (sse_cliqueKey (sse_clique216Nat k) < sse_cliqueKey (sse_clique216Nat (k + 1)))
      else true) 8 0 = true := by
  decide

private theorem sse_clique216_key_strict (i j : Fin 216) (hij : i.val < j.val) :
    sse_cliqueKey (sseClique216 i) < sse_cliqueKey (sseClique216 j) := by
  have hAdj : ∀ k : Nat, k < 215 → sse_cliqueKey (sse_clique216Nat k) < sse_cliqueKey (sse_clique216Nat (k + 1)) := by
    intro k hk
    have h1 := sse_allPow2_sound _ 8 0 sse_clique216_strict_adj k (Nat.zero_le _) (by omega)
    rw [sse_ite_pos hk] at h1; exact of_decide_eq_true h1
  have hStep : ∀ (d a : Nat), a + d < 216 → d > 0 →
      sse_cliqueKey (sse_clique216Nat a) < sse_cliqueKey (sse_clique216Nat (a + d)) := by
    intro d; induction d with
    | zero => intro _ _ h0; omega
    | succ d' ih =>
      intro a hlt _
      cases d' with
      | zero => exact hAdj a (by omega)
      | succ d'' =>
        have h1 := ih a (by omega) (by omega)
        have h2 := hAdj (a + (d'' + 1)) (by omega)
        have hEq : a + (d'' + 1) + 1 = a + (d'' + 1 + 1) := by omega
        rw [hEq] at h2; exact Nat.lt_trans h1 h2
  have hRes := hStep (j.val - i.val) i.val (by have := j.isLt; omega) (by omega)
  have hEq : i.val + (j.val - i.val) = j.val := by omega
  rw [hEq] at hRes; exact hRes

private theorem sse_clique216_inj (i j : Fin 216) (h : sseClique216 i = sseClique216 j) : i = j := by
  apply Fin.ext
  if hlt : i.val < j.val then
    have hk := sse_clique216_key_strict i j hlt
    rw [h] at hk; omega
  else if hgt : j.val < i.val then
    have hk := sse_clique216_key_strict j i hgt
    rw [h] at hk; omega
  else omega

/-- Sort 2 `Fin 24` vertices ascending. -/
def sseSort2Fin (a b : Fin 24) : Fin 24 × Fin 24 :=
  if a.val ≤ b.val then (a, b) else (b, a)

/-- Sort 3 `Fin 24` vertices ascending. -/
def sseSort3Fin (a b c : Fin 24) : Fin 24 × Fin 24 × Fin 24 :=
  let (x1, y1) := sseSort2Fin a b
  let (y2, z2) := sseSort2Fin y1 c
  let (x3, y3) := sseSort2Fin x1 y2
  (x3, y3, z2)

private theorem sse_sort2Fin_cases (a b : Fin 24) :
    sseSort2Fin a b = (a, b) ∨ sseSort2Fin a b = (b, a) := by
  unfold sseSort2Fin; split
  · exact Or.inl rfl
  · exact Or.inr rfl

private theorem sse_sort3Fin_cases (a b c : Fin 24) :
    sseSort3Fin a b c = (a, b, c) ∨ sseSort3Fin a b c = (a, c, b) ∨
    sseSort3Fin a b c = (b, a, c) ∨ sseSort3Fin a b c = (b, c, a) ∨
    sseSort3Fin a b c = (c, a, b) ∨ sseSort3Fin a b c = (c, b, a) := by
  unfold sseSort3Fin
  rcases sse_sort2Fin_cases a b with h1 | h1 <;> rw [h1] <;> dsimp only
  · rcases sse_sort2Fin_cases b c with h2 | h2 <;> rw [h2] <;> dsimp only
    · rcases sse_sort2Fin_cases a b with h3 | h3 <;> rw [h3] <;> simp
    · rcases sse_sort2Fin_cases a c with h3 | h3 <;> rw [h3] <;> simp
  · rcases sse_sort2Fin_cases a c with h2 | h2 <;> rw [h2] <;> dsimp only
    · rcases sse_sort2Fin_cases b a with h3 | h3 <;> rw [h3] <;> simp
    · rcases sse_sort2Fin_cases b c with h3 | h3 <;> rw [h3] <;> simp

/-- Action of a `W(F_4)` generator `k : Fin 4` on a clique (re-sorted ascending). -/
def sseActCliqueGen (k : Fin 4) : SseClique → SseClique
  | SseClique.c1 a => SseClique.c1 (sseWF4Gen k a)
  | SseClique.c2 a b =>
    let p := sseSort2Fin (sseWF4Gen k a) (sseWF4Gen k b)
    SseClique.c2 p.1 p.2
  | SseClique.c3 a b c =>
    let t := sseSort3Fin (sseWF4Gen k a) (sseWF4Gen k b) (sseWF4Gen k c)
    SseClique.c3 t.1 t.2.1 t.2.2

-- [helper]
def sse_act216Gen0Nat (i : Nat) : Nat :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => 4 | 1 => 5 | 2 => 6 | 3 => 7 | 4 => 0 | 5 => 1 | 6 => 2 | 7 => 3 | 8 => 8 | 9 => 9 | 10 => 10 | 11 => 11 | 12 => 12 | 13 => 14 | 14 => 13 | 15 => 15 | _ => 0
  | 1 => match i % 16 with
    | 0 => 20 | 1 => 21 | 2 => 22 | 3 => 23 | 4 => 16 | 5 => 17 | 6 => 18 | 7 => 19 | 8 => 24 | 9 => 32 | 10 => 56 | 11 => 57 | 12 => 58 | 13 => 59 | 14 => 60 | 15 => 61 | _ => 0
  | 2 => match i % 16 with
    | 0 => 25 | 1 => 33 | 2 => 62 | 3 => 63 | 4 => 64 | 5 => 65 | 6 => 66 | 7 => 67 | 8 => 40 | 9 => 48 | 10 => 68 | 11 => 69 | 12 => 70 | 13 => 71 | 14 => 72 | 15 => 73 | _ => 0
  | 3 => match i % 16 with
    | 0 => 41 | 1 => 49 | 2 => 74 | 3 => 75 | 4 => 76 | 5 => 77 | 6 => 78 | 7 => 79 | 8 => 26 | 9 => 27 | 10 => 28 | 11 => 29 | 12 => 30 | 13 => 31 | 14 => 34 | 15 => 35 | _ => 0
  | 4 => match i % 16 with
    | 0 => 36 | 1 => 37 | 2 => 38 | 3 => 39 | 4 => 42 | 5 => 43 | 6 => 44 | 7 => 45 | 8 => 46 | 9 => 47 | 10 => 50 | 11 => 51 | 12 => 52 | 13 => 53 | 14 => 54 | 15 => 55 | _ => 0
  | 5 => match i % 16 with
    | 0 => 82 | 1 => 83 | 2 => 80 | 3 => 81 | 4 => 86 | 5 => 87 | 6 => 84 | 7 => 85 | 8 => 90 | 9 => 91 | 10 => 88 | 11 => 89 | 12 => 94 | 13 => 95 | 14 => 92 | 15 => 93 | _ => 0
  | 6 => match i % 16 with
    | 0 => 98 | 1 => 99 | 2 => 96 | 3 => 97 | 4 => 106 | 5 => 107 | 6 => 104 | 7 => 105 | 8 => 102 | 9 => 103 | 10 => 100 | 11 => 101 | 12 => 110 | 13 => 111 | 14 => 108 | 15 => 109 | _ => 0
  | 7 => match i % 16 with
    | 0 => 112 | 1 => 116 | 2 => 114 | 3 => 118 | 4 => 113 | 5 => 117 | 6 => 115 | 7 => 119 | 8 => 120 | 9 => 121 | 10 => 122 | 11 => 132 | 12 => 133 | 13 => 134 | 14 => 168 | 15 => 169 | _ => 0
  | 8 => match i % 16 with
    | 0 => 170 | 1 => 171 | 2 => 172 | 3 => 173 | 4 => 123 | 5 => 124 | 6 => 125 | 7 => 135 | 8 => 136 | 9 => 137 | 10 => 174 | 11 => 175 | 12 => 176 | 13 => 177 | 14 => 178 | 15 => 179 | _ => 0
  | 9 => match i % 16 with
    | 0 => 144 | 1 => 145 | 2 => 146 | 3 => 156 | 4 => 157 | 5 => 158 | 6 => 180 | 7 => 181 | 8 => 182 | 9 => 183 | 10 => 184 | 11 => 185 | 12 => 147 | 13 => 148 | 14 => 149 | 15 => 159 | _ => 0
  | 10 => match i % 16 with
    | 0 => 160 | 1 => 161 | 2 => 186 | 3 => 187 | 4 => 188 | 5 => 189 | 6 => 190 | 7 => 191 | 8 => 126 | 9 => 127 | 10 => 128 | 11 => 129 | 12 => 130 | 13 => 131 | 14 => 138 | 15 => 139 | _ => 0
  | 11 => match i % 16 with
    | 0 => 140 | 1 => 141 | 2 => 142 | 3 => 143 | 4 => 150 | 5 => 151 | 6 => 152 | 7 => 153 | 8 => 154 | 9 => 155 | 10 => 162 | 11 => 163 | 12 => 164 | 13 => 165 | 14 => 166 | 15 => 167 | _ => 0
  | 12 => match i % 16 with
    | 0 => 192 | 1 => 194 | 2 => 193 | 3 => 195 | 4 => 196 | 5 => 198 | 6 => 197 | 7 => 199 | 8 => 200 | 9 => 202 | 10 => 201 | 11 => 203 | 12 => 204 | 13 => 206 | 14 => 205 | 15 => 207 | _ => 0
  | 13 => match i % 16 with
    | 0 => 208 | 1 => 209 | 2 => 212 | 3 => 213 | 4 => 210 | 5 => 211 | 6 => 214 | 7 => 215 | _ => 0
  | _ => 0

-- [helper]
def sse_act216Gen1Nat (i : Nat) : Nat :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => 0 | 1 => 1 | 2 => 2 | 3 => 3 | 4 => 8 | 5 => 9 | 6 => 10 | 7 => 11 | 8 => 4 | 9 => 5 | 10 => 6 | 11 => 7 | 12 => 16 | 13 => 17 | 14 => 18 | 15 => 19 | _ => 0
  | 1 => match i % 16 with
    | 0 => 12 | 1 => 13 | 2 => 14 | 3 => 15 | 4 => 20 | 5 => 22 | 6 => 21 | 7 => 23 | 8 => 26 | 9 => 27 | 10 => 24 | 11 => 25 | 12 => 30 | 13 => 31 | 14 => 28 | 15 => 29 | _ => 0
  | 2 => match i % 16 with
    | 0 => 34 | 1 => 35 | 2 => 32 | 3 => 33 | 4 => 38 | 5 => 39 | 6 => 36 | 7 => 37 | 8 => 42 | 9 => 43 | 10 => 40 | 11 => 41 | 12 => 46 | 13 => 47 | 14 => 44 | 15 => 45 | _ => 0
  | 3 => match i % 16 with
    | 0 => 50 | 1 => 51 | 2 => 48 | 3 => 49 | 4 => 54 | 5 => 55 | 6 => 52 | 7 => 53 | 8 => 56 | 9 => 62 | 10 => 80 | 11 => 81 | 12 => 82 | 13 => 83 | 14 => 57 | 15 => 63 | _ => 0
  | 4 => match i % 16 with
    | 0 => 84 | 1 => 85 | 2 => 86 | 3 => 87 | 4 => 68 | 5 => 74 | 6 => 88 | 7 => 89 | 8 => 90 | 9 => 91 | 10 => 69 | 11 => 75 | 12 => 92 | 13 => 93 | 14 => 94 | 15 => 95 | _ => 0
  | 5 => match i % 16 with
    | 0 => 58 | 1 => 59 | 2 => 60 | 3 => 61 | 4 => 64 | 5 => 65 | 6 => 66 | 7 => 67 | 8 => 70 | 9 => 71 | 10 => 72 | 11 => 73 | 12 => 76 | 13 => 77 | 14 => 78 | 15 => 79 | _ => 0
  | 6 => match i % 16 with
    | 0 => 96 | 1 => 100 | 2 => 112 | 3 => 113 | 4 => 97 | 5 => 101 | 6 => 114 | 7 => 115 | 8 => 104 | 9 => 108 | 10 => 116 | 11 => 117 | 12 => 105 | 13 => 109 | 14 => 118 | 15 => 119 | _ => 0
  | 7 => match i % 16 with
    | 0 => 98 | 1 => 99 | 2 => 102 | 3 => 103 | 4 => 106 | 5 => 107 | 6 => 110 | 7 => 111 | 8 => 120 | 9 => 123 | 10 => 126 | 11 => 121 | 12 => 124 | 13 => 127 | 14 => 122 | 15 => 125 | _ => 0
  | 8 => match i % 16 with
    | 0 => 128 | 1 => 130 | 2 => 129 | 3 => 131 | 4 => 132 | 5 => 135 | 6 => 138 | 7 => 133 | 8 => 136 | 9 => 139 | 10 => 134 | 11 => 137 | 12 => 140 | 13 => 142 | 14 => 141 | 15 => 143 | _ => 0
  | 9 => match i % 16 with
    | 0 => 144 | 1 => 147 | 2 => 150 | 3 => 145 | 4 => 148 | 5 => 151 | 6 => 146 | 7 => 149 | 8 => 152 | 9 => 154 | 10 => 153 | 11 => 155 | 12 => 156 | 13 => 159 | 14 => 162 | 15 => 157 | _ => 0
  | 10 => match i % 16 with
    | 0 => 160 | 1 => 163 | 2 => 158 | 3 => 161 | 4 => 164 | 5 => 166 | 6 => 165 | 7 => 167 | 8 => 168 | 9 => 174 | 10 => 192 | 11 => 193 | 12 => 194 | 13 => 195 | 14 => 169 | 15 => 175 | _ => 0
  | 11 => match i % 16 with
    | 0 => 196 | 1 => 197 | 2 => 198 | 3 => 199 | 4 => 180 | 5 => 186 | 6 => 200 | 7 => 201 | 8 => 202 | 9 => 203 | 10 => 181 | 11 => 187 | 12 => 204 | 13 => 205 | 14 => 206 | 15 => 207 | _ => 0
  | 12 => match i % 16 with
    | 0 => 170 | 1 => 171 | 2 => 172 | 3 => 173 | 4 => 176 | 5 => 177 | 6 => 178 | 7 => 179 | 8 => 182 | 9 => 183 | 10 => 184 | 11 => 185 | 12 => 188 | 13 => 189 | 14 => 190 | 15 => 191 | _ => 0
  | 13 => match i % 16 with
    | 0 => 208 | 1 => 210 | 2 => 209 | 3 => 211 | 4 => 212 | 5 => 214 | 6 => 213 | 7 => 215 | _ => 0
  | _ => 0

-- [helper]
def sse_act216Gen2Nat (i : Nat) : Nat :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => 0 | 1 => 1 | 2 => 2 | 3 => 3 | 4 => 4 | 5 => 5 | 6 => 6 | 7 => 7 | 8 => 9 | 9 => 8 | 10 => 11 | 11 => 10 | 12 => 12 | 13 => 13 | 14 => 14 | 15 => 15 | _ => 0
  | 1 => match i % 16 with
    | 0 => 17 | 1 => 16 | 2 => 19 | 3 => 18 | 4 => 21 | 5 => 20 | 6 => 23 | 7 => 22 | 8 => 24 | 9 => 25 | 10 => 27 | 11 => 26 | 12 => 28 | 13 => 29 | 14 => 31 | 15 => 30 | _ => 0
  | 2 => match i % 16 with
    | 0 => 32 | 1 => 33 | 2 => 35 | 3 => 34 | 4 => 36 | 5 => 37 | 6 => 39 | 7 => 38 | 8 => 40 | 9 => 41 | 10 => 43 | 11 => 42 | 12 => 44 | 13 => 45 | 14 => 47 | 15 => 46 | _ => 0
  | 3 => match i % 16 with
    | 0 => 48 | 1 => 49 | 2 => 51 | 3 => 50 | 4 => 52 | 5 => 53 | 6 => 55 | 7 => 54 | 8 => 57 | 9 => 56 | 10 => 58 | 11 => 59 | 12 => 61 | 13 => 60 | 14 => 63 | 15 => 62 | _ => 0
  | 4 => match i % 16 with
    | 0 => 64 | 1 => 65 | 2 => 67 | 3 => 66 | 4 => 69 | 5 => 68 | 6 => 70 | 7 => 71 | 8 => 73 | 9 => 72 | 10 => 75 | 11 => 74 | 12 => 76 | 13 => 77 | 14 => 79 | 15 => 78 | _ => 0
  | 5 => match i % 16 with
    | 0 => 84 | 1 => 85 | 2 => 86 | 3 => 87 | 4 => 80 | 5 => 81 | 6 => 82 | 7 => 83 | 8 => 92 | 9 => 93 | 10 => 94 | 11 => 95 | 12 => 88 | 13 => 89 | 14 => 90 | 15 => 91 | _ => 0
  | 6 => match i % 16 with
    | 0 => 97 | 1 => 96 | 2 => 99 | 3 => 98 | 4 => 101 | 5 => 100 | 6 => 103 | 7 => 102 | 8 => 105 | 9 => 104 | 10 => 107 | 11 => 106 | 12 => 109 | 13 => 108 | 14 => 111 | 15 => 110 | _ => 0
  | 7 => match i % 16 with
    | 0 => 114 | 1 => 115 | 2 => 112 | 3 => 113 | 4 => 118 | 5 => 119 | 6 => 116 | 7 => 117 | 8 => 121 | 9 => 120 | 10 => 122 | 11 => 124 | 12 => 123 | 13 => 125 | 14 => 127 | 15 => 126 | _ => 0
  | 8 => match i % 16 with
    | 0 => 129 | 1 => 128 | 2 => 131 | 3 => 130 | 4 => 133 | 5 => 132 | 6 => 134 | 7 => 136 | 8 => 135 | 9 => 137 | 10 => 139 | 11 => 138 | 12 => 141 | 13 => 140 | 14 => 143 | 15 => 142 | _ => 0
  | 9 => match i % 16 with
    | 0 => 145 | 1 => 144 | 2 => 146 | 3 => 148 | 4 => 147 | 5 => 149 | 6 => 151 | 7 => 150 | 8 => 153 | 9 => 152 | 10 => 155 | 11 => 154 | 12 => 157 | 13 => 156 | 14 => 158 | 15 => 160 | _ => 0
  | 10 => match i % 16 with
    | 0 => 159 | 1 => 161 | 2 => 163 | 3 => 162 | 4 => 165 | 5 => 164 | 6 => 167 | 7 => 166 | 8 => 169 | 9 => 168 | 10 => 171 | 11 => 170 | 12 => 173 | 13 => 172 | 14 => 175 | 15 => 174 | _ => 0
  | 11 => match i % 16 with
    | 0 => 177 | 1 => 176 | 2 => 179 | 3 => 178 | 4 => 181 | 5 => 180 | 6 => 183 | 7 => 182 | 8 => 185 | 9 => 184 | 10 => 187 | 11 => 186 | 12 => 189 | 13 => 188 | 14 => 191 | 15 => 190 | _ => 0
  | 12 => match i % 16 with
    | 0 => 196 | 1 => 197 | 2 => 198 | 3 => 199 | 4 => 192 | 5 => 193 | 6 => 194 | 7 => 195 | 8 => 204 | 9 => 205 | 10 => 206 | 11 => 207 | 12 => 200 | 13 => 201 | 14 => 202 | 15 => 203 | _ => 0
  | 13 => match i % 16 with
    | 0 => 209 | 1 => 208 | 2 => 211 | 3 => 210 | 4 => 213 | 5 => 212 | 6 => 215 | 7 => 214 | _ => 0
  | _ => 0

-- [helper]
def sse_act216Gen3Nat (i : Nat) : Nat :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => 0 | 1 => 20 | 2 => 23 | 3 => 3 | 4 => 4 | 5 => 16 | 6 => 19 | 7 => 7 | 8 => 8 | 9 => 12 | 10 => 15 | 11 => 11 | 12 => 9 | 13 => 13 | 14 => 14 | 15 => 10 | _ => 0
  | 1 => match i % 16 with
    | 0 => 5 | 1 => 17 | 2 => 18 | 3 => 6 | 4 => 1 | 5 => 21 | 6 => 22 | 7 => 2 | 8 => 24 | 9 => 30 | 10 => 26 | 11 => 28 | 12 => 27 | 13 => 29 | 14 => 25 | 15 => 31 | _ => 0
  | 2 => match i % 16 with
    | 0 => 60 | 1 => 112 | 2 => 82 | 3 => 98 | 4 => 106 | 5 => 90 | 6 => 116 | 7 => 72 | 8 => 119 | 9 => 79 | 10 => 111 | 11 => 95 | 12 => 87 | 13 => 103 | 14 => 67 | 15 => 115 | _ => 0
  | 3 => match i % 16 with
    | 0 => 55 | 1 => 49 | 2 => 53 | 3 => 51 | 4 => 52 | 5 => 50 | 6 => 54 | 7 => 48 | 8 => 56 | 9 => 58 | 10 => 57 | 11 => 59 | 12 => 32 | 13 => 61 | 14 => 80 | 15 => 96 | _ => 0
  | 4 => match i % 16 with
    | 0 => 100 | 1 => 88 | 2 => 113 | 3 => 46 | 4 => 109 | 5 => 93 | 6 => 85 | 7 => 105 | 8 => 39 | 9 => 118 | 10 => 77 | 11 => 75 | 12 => 76 | 13 => 74 | 14 => 78 | 15 => 41 | _ => 0
  | 5 => match i % 16 with
    | 0 => 62 | 1 => 81 | 2 => 34 | 3 => 83 | 4 => 97 | 5 => 70 | 6 => 99 | 7 => 44 | 8 => 65 | 9 => 108 | 10 => 37 | 11 => 110 | 12 => 92 | 13 => 69 | 14 => 94 | 15 => 43 | _ => 0
  | 6 => match i % 16 with
    | 0 => 63 | 1 => 84 | 2 => 35 | 3 => 86 | 4 => 64 | 5 => 101 | 6 => 102 | 7 => 45 | 8 => 104 | 9 => 71 | 10 => 36 | 11 => 107 | 12 => 89 | 13 => 68 | 14 => 91 | 15 => 42 | _ => 0
  | 7 => match i % 16 with
    | 0 => 33 | 1 => 66 | 2 => 114 | 3 => 47 | 4 => 38 | 5 => 117 | 6 => 73 | 7 => 40 | 8 => 120 | 9 => 122 | 10 => 121 | 11 => 126 | 12 => 128 | 13 => 130 | 14 => 123 | 15 => 129 | _ => 0
  | 8 => match i % 16 with
    | 0 => 124 | 1 => 127 | 2 => 125 | 3 => 131 | 4 => 168 | 5 => 170 | 6 => 172 | 7 => 192 | 8 => 208 | 9 => 200 | 10 => 194 | 11 => 182 | 12 => 212 | 13 => 184 | 14 => 202 | 15 => 180 | _ => 0
  | 9 => match i % 16 with
    | 0 => 215 | 1 => 207 | 2 => 199 | 3 => 191 | 4 => 187 | 5 => 189 | 6 => 179 | 7 => 205 | 8 => 175 | 9 => 197 | 10 => 177 | 11 => 211 | 12 => 167 | 13 => 163 | 14 => 165 | 15 => 161 | _ => 0
  | 10 => match i % 16 with
    | 0 => 160 | 1 => 159 | 2 => 166 | 3 => 157 | 4 => 164 | 5 => 158 | 6 => 162 | 7 => 156 | 8 => 132 | 9 => 171 | 10 => 133 | 11 => 169 | 12 => 134 | 13 => 173 | 14 => 193 | 15 => 152 | _ => 0
  | 11 => match i % 16 with
    | 0 => 210 | 1 => 154 | 2 => 201 | 3 => 150 | 4 => 143 | 5 => 206 | 6 => 139 | 7 => 198 | 8 => 141 | 9 => 213 | 10 => 190 | 11 => 148 | 12 => 188 | 13 => 149 | 14 => 186 | 15 => 147 | _ => 0
  | 12 => match i % 16 with
    | 0 => 135 | 1 => 174 | 2 => 138 | 3 => 195 | 4 => 209 | 5 => 153 | 6 => 183 | 7 => 146 | 8 => 137 | 9 => 178 | 10 => 142 | 11 => 214 | 12 => 204 | 13 => 151 | 14 => 181 | 15 => 145 | _ => 0
  | 13 => match i % 16 with
    | 0 => 136 | 1 => 196 | 2 => 176 | 3 => 155 | 4 => 140 | 5 => 185 | 6 => 203 | 7 => 144 | _ => 0
  | _ => 0

-- [helper]
def sse_act216GenNat (k i : Nat) : Nat :=
  match k with
  | 0 => sse_act216Gen0Nat i
  | 1 => sse_act216Gen1Nat i
  | 2 => sse_act216Gen2Nat i
  | _ => sse_act216Gen3Nat i

private theorem sse_act216GenNat_lt_fast :
    sse_allPow2 (fun i =>
      if i < 216 then
        decide (sse_act216Gen0Nat i < 216) && decide (sse_act216Gen1Nat i < 216) &&
        decide (sse_act216Gen2Nat i < 216) && decide (sse_act216Gen3Nat i < 216)
      else true) 8 0 = true := by
  decide

-- [helper]
theorem sse_act216GenNat_lt (k : Fin 4) (i : Fin 216) : sse_act216GenNat k.val i.val < 216 := by
  have h := sse_allPow2_sound _ 8 0 sse_act216GenNat_lt_fast i.val (Nat.zero_le _) (by have := i.isLt; omega)
  rw [sse_ite_pos i.isLt] at h
  simp only [Bool.and_eq_true] at h
  rcases k with ⟨kv, hkv⟩
  match kv with
  | 0 => exact of_decide_eq_true h.1.1.1
  | 1 => exact of_decide_eq_true h.1.1.2
  | 2 => exact of_decide_eq_true h.1.2
  | 3 => exact of_decide_eq_true h.2
  | _ + 4 => omega

/-- Certified `W(F_4)` generator action on `Fin 216` (kernel-verified against `sseActCliqueGen`). -/
def sseAct216Gen (k : Fin 4) (i : Fin 216) : Fin 216 :=
  ⟨sse_act216GenNat k.val i.val, sse_act216GenNat_lt k i⟩

/-- `W(F_4)` word action on `Fin 216`. -/
def sseAct216 : List (Fin 4) → Fin 216 → Fin 216
  | [], i => i
  | k :: rest, i => sseAct216Gen k (sseAct216 rest i)

private theorem sse_act216Gen_compat_fast :
    sse_allPow2 (fun i =>
      if i < 216 then
        let ci := sse_clique216Nat i
        decide (sse_clique216Nat (sse_act216Gen0Nat i) = sseActCliqueGen ⟨0, by decide⟩ ci) &&
        decide (sse_clique216Nat (sse_act216Gen1Nat i) = sseActCliqueGen ⟨1, by decide⟩ ci) &&
        decide (sse_clique216Nat (sse_act216Gen2Nat i) = sseActCliqueGen ⟨2, by decide⟩ ci) &&
        decide (sse_clique216Nat (sse_act216Gen3Nat i) = sseActCliqueGen ⟨3, by decide⟩ ci) &&
        decide (sse_act216Gen0Nat (sse_act216Gen0Nat i) = i) &&
        decide (sse_act216Gen1Nat (sse_act216Gen1Nat i) = i) &&
        decide (sse_act216Gen2Nat (sse_act216Gen2Nat i) = i) &&
        decide (sse_act216Gen3Nat (sse_act216Gen3Nat i) = i)
      else true) 8 0 = true := by
  decide

private theorem sse_act216Gen_compat (k : Fin 4) (i : Fin 216) :
    sseClique216 (sseAct216Gen k i) = sseActCliqueGen k (sseClique216 i) := by
  have h := sse_allPow2_sound _ 8 0 sse_act216Gen_compat_fast i.val (Nat.zero_le _) (by have := i.isLt; omega)
  rw [sse_ite_pos i.isLt] at h; simp only [Bool.and_eq_true] at h
  rcases k with ⟨kv, hkv⟩
  match kv with
  | 0 => exact of_decide_eq_true h.1.1.1.1.1.1.1
  | 1 => exact of_decide_eq_true h.1.1.1.1.1.1.2
  | 2 => exact of_decide_eq_true h.1.1.1.1.1.2
  | 3 => exact of_decide_eq_true h.1.1.1.1.2
  | _ + 4 => omega

private theorem sse_act216Gen_inv (k : Fin 4) (i : Fin 216) :
    sseAct216Gen k (sseAct216Gen k i) = i := by
  have h := sse_allPow2_sound _ 8 0 sse_act216Gen_compat_fast i.val (Nat.zero_le _) (by have := i.isLt; omega)
  rw [sse_ite_pos i.isLt] at h; simp only [Bool.and_eq_true] at h
  apply Fin.ext; unfold sseAct216Gen sse_act216GenNat
  rcases k with ⟨kv, hkv⟩
  match kv with
  | 0 => exact of_decide_eq_true h.1.1.1.2
  | 1 => exact of_decide_eq_true h.1.1.2
  | 2 => exact of_decide_eq_true h.1.2
  | 3 => exact of_decide_eq_true h.2
  | _ + 4 => omega

private theorem sse_act216Gen_size (k : Fin 4) (i : Fin 216) :
    sseSize216 (sseAct216Gen k i) = sseSize216 i := by
  unfold sseSize216; rw [sse_act216Gen_compat]
  cases sseClique216 i <;> rfl

private theorem sse_act216_append (w1 w2 : List (Fin 4)) (i : Fin 216) :
    sseAct216 (w1 ++ w2) i = sseAct216 w1 (sseAct216 w2 i) := by
  induction w1 with | nil => rfl | cons k rest ih => simp only [List.cons_append, sseAct216, ih]

private theorem sse_act216_inv (w : List (Fin 4)) (i : Fin 216) :
    sseAct216 w.reverse (sseAct216 w i) = i := by
  induction w with
  | nil => rfl
  | cons k rest ih =>
    simp only [List.reverse_cons, sseAct216, sse_act216_append, sse_act216Gen_inv, ih]

private theorem sse_act216_inv_right (w : List (Fin 4)) (i : Fin 216) :
    sseAct216 w (sseAct216 w.reverse i) = i := by
  have h := sse_act216_inv w.reverse i
  rw [List.reverse_reverse] at h; exact h

private theorem sse_act216_size (w : List (Fin 4)) (i : Fin 216) :
    sseSize216 (sseAct216 w i) = sseSize216 i := by
  induction w with | nil => rfl | cons k rest ih => simp only [sseAct216, sse_act216Gen_size, ih]

-- [helper]
def sse_canonWord216Nat (i : Nat) : List Nat :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => [] | 1 => [0, 1, 2, 1, 0] | 2 => [0, 1, 2, 3, 1, 2, 0, 1, 2, 3] | 3 => [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0] | 4 => [0] | 5 => [0, 1, 2, 1] | 6 => [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0] | 7 => [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1] | 8 => [0, 1] | 9 => [0, 1, 2] | 10 => [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1] | 11 => [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2] | 12 => [0, 1, 2, 3] | 13 => [0, 1, 2, 3, 1, 2, 1] | 14 => [0, 1, 2, 3, 1, 2, 1, 0] | 15 => [0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1] | _ => []
  | 1 => match i % 16 with
    | 0 => [0, 1, 2, 3, 1] | 1 => [0, 1, 2, 3, 1, 2] | 2 => [0, 1, 2, 3, 1, 2, 0, 1, 0] | 3 => [0, 1, 2, 3, 1, 2, 0, 1, 2, 0] | 4 => [0, 1, 2, 3, 1, 0] | 5 => [0, 1, 2, 3, 1, 2, 0] | 6 => [0, 1, 2, 3, 1, 2, 0, 1] | 7 => [0, 1, 2, 3, 1, 2, 0, 1, 2] | 8 => [] | 9 => [1, 2, 1] | 10 => [1] | 11 => [1, 2] | 12 => [1, 2, 3] | 13 => [1, 2, 3, 1, 2, 1] | 14 => [1, 2, 3, 1] | 15 => [1, 2, 3, 1, 2] | _ => []
  | 2 => match i % 16 with
    | 0 => [1, 2, 1, 0] | 1 => [1, 2, 0, 1, 2, 0, 1] | 2 => [1, 2, 0, 1, 0] | 3 => [1, 2, 0, 1, 2, 0] | 4 => [1, 2, 3, 0, 1, 2, 1, 0] | 5 => [1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0] | 6 => [1, 2, 3, 0, 1, 2, 0, 1, 0] | 7 => [1, 2, 3, 1, 2, 0, 1, 2, 1, 0] | 8 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3] | 9 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1] | 10 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1] | 11 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2] | 12 => [1, 2, 3, 1, 2, 0, 1, 2, 3] | 13 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 1] | 14 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1] | 15 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2] | _ => []
  | 3 => match i % 16 with
    | 0 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0] | 1 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1] | 2 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0] | 3 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0] | 4 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0] | 5 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0] | 6 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0] | 7 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0] | 8 => [1, 0] | 9 => [1, 2, 0] | 10 => [1, 2, 3, 0] | 11 => [1, 2, 3, 1, 2, 1, 0] | 12 => [1, 2, 3, 1, 0] | 13 => [1, 2, 3, 1, 2, 0] | 14 => [1, 2, 0, 1] | 15 => [1, 2, 0, 1, 2] | _ => []
  | 4 => match i % 16 with
    | 0 => [1, 2, 3, 0, 1, 2, 1] | 1 => [1, 2, 3, 1, 2, 0, 1, 2, 0, 1] | 2 => [1, 2, 3, 0, 1, 2, 0, 1] | 3 => [1, 2, 3, 1, 2, 0, 1, 2, 1] | 4 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 0] | 5 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0] | 6 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0] | 7 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0] | 8 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 0] | 9 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0] | 10 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1] | 11 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2] | 12 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1] | 13 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1] | 14 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1] | 15 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1] | _ => []
  | 5 => match i % 16 with
    | 0 => [1, 2, 3, 0, 1] | 1 => [1, 2, 3, 1, 2, 0, 1, 0] | 2 => [1, 2, 3, 0, 1, 0] | 3 => [1, 2, 3, 1, 2, 0, 1] | 4 => [1, 2, 3, 0, 1, 2] | 5 => [1, 2, 3, 1, 2, 0, 1, 2, 0] | 6 => [1, 2, 3, 0, 1, 2, 0] | 7 => [1, 2, 3, 1, 2, 0, 1, 2] | 8 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1] | 9 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0] | 10 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 0] | 11 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1] | 12 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2] | 13 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0] | 14 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0] | 15 => [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2] | _ => []
  | 6 => match i % 16 with
    | 0 => [1, 2, 0, 1, 2, 3] | 1 => [1, 2, 0, 1, 2, 3, 2] | 2 => [1, 2, 0, 1, 2, 3, 0] | 3 => [1, 2, 0, 1, 2, 3, 2, 0] | 4 => [1, 2, 0, 1, 2, 3, 2, 1] | 5 => [1, 2, 0, 1, 2, 3, 2, 1, 2] | 6 => [1, 2, 0, 1, 2, 3, 0, 1, 2, 1] | 7 => [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 1] | 8 => [1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0] | 9 => [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 1, 0] | 10 => [1, 2, 0, 1, 2, 3, 2, 1, 0] | 11 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0] | 12 => [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0] | 13 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0] | 14 => [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1] | 15 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1] | _ => []
  | 7 => match i % 16 with
    | 0 => [1, 2, 0, 1, 2, 3, 0, 1] | 1 => [1, 2, 0, 1, 2, 3, 2, 0, 1] | 2 => [1, 2, 0, 1, 2, 3, 0, 1, 2] | 3 => [1, 2, 0, 1, 2, 3, 2, 0, 1, 2] | 4 => [1, 2, 0, 1, 2, 3, 2, 0, 1, 0] | 5 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1] | 6 => [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0] | 7 => [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2] | 8 => [] | 9 => [2] | 10 => [2, 3] | 11 => [2, 1] | 12 => [2, 1, 2] | 13 => [2, 3, 1, 2, 1] | 14 => [2, 3, 1] | 15 => [2, 3, 1, 2] | _ => []
  | 8 => match i % 16 with
    | 0 => [2, 1, 2, 3] | 1 => [2, 1, 2, 3, 2] | 2 => [2, 1, 2, 3, 2, 1] | 3 => [2, 1, 2, 3, 2, 1, 2] | 4 => [2, 1, 0] | 5 => [2, 1, 2, 0] | 6 => [2, 3, 1, 2, 1, 0] | 7 => [2, 1, 2, 0, 1] | 8 => [2, 1, 2, 0, 1, 2] | 9 => [2, 3, 1, 2, 0, 1, 2, 0, 1] | 10 => [2, 3, 1, 2, 0, 1, 0] | 11 => [2, 3, 1, 2, 0, 1, 2, 0] | 12 => [2, 1, 2, 3, 0, 1, 2, 1, 0] | 13 => [2, 1, 2, 3, 2, 0, 1, 2, 1, 0] | 14 => [2, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0] | 15 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0] | _ => []
  | 9 => match i % 16 with
    | 0 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3] | 1 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2] | 2 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3] | 3 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1] | 4 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2] | 5 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1] | 6 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1] | 7 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2] | 8 => [2, 3, 1, 2, 0, 1, 2, 3] | 9 => [2, 3, 1, 2, 0, 1, 2, 3, 2] | 10 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 1] | 11 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2] | 12 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 0] | 13 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0] | 14 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0] | 15 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1] | _ => []
  | 10 => match i % 16 with
    | 0 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2] | 1 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1] | 2 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0] | 3 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0] | 4 => [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0] | 5 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 1, 0] | 6 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0] | 7 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0] | 8 => [2, 3, 1, 0] | 9 => [2, 3, 1, 2, 0] | 10 => [2, 1, 2, 3, 0] | 11 => [2, 1, 2, 3, 2, 0] | 12 => [2, 1, 2, 3, 2, 1, 0] | 13 => [2, 1, 2, 3, 2, 1, 2, 0] | 14 => [2, 3, 1, 2, 0, 1] | 15 => [2, 3, 1, 2, 0, 1, 2] | _ => []
  | 11 => match i % 16 with
    | 0 => [2, 1, 2, 3, 0, 1, 2, 1] | 1 => [2, 1, 2, 3, 2, 0, 1, 2, 1] | 2 => [2, 1, 2, 3, 2, 0, 1, 2, 0, 1] | 3 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1] | 4 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 0] | 5 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0] | 6 => [2, 3, 1, 2, 0, 1, 2, 3, 0] | 7 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0] | 8 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 0] | 9 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0] | 10 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1] | 11 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2] | 12 => [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1] | 13 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 1] | 14 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1] | 15 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1] | _ => []
  | 12 => match i % 16 with
    | 0 => [2, 1, 2, 3, 0, 1] | 1 => [2, 1, 2, 3, 2, 0, 1] | 2 => [2, 1, 2, 3, 2, 0, 1, 0] | 3 => [2, 1, 2, 3, 2, 1, 2, 0, 1] | 4 => [2, 1, 2, 3, 0, 1, 2] | 5 => [2, 1, 2, 3, 2, 0, 1, 2] | 6 => [2, 1, 2, 3, 2, 0, 1, 2, 0] | 7 => [2, 1, 2, 3, 2, 1, 2, 0, 1, 2] | 8 => [2, 3, 1, 2, 0, 1, 2, 3, 0, 1] | 9 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1] | 10 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 0] | 11 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1] | 12 => [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2] | 13 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2] | 14 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0] | 15 => [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2] | _ => []
  | 13 => match i % 16 with
    | 0 => [2, 1, 2, 0, 1, 2, 3] | 1 => [2, 1, 2, 0, 1, 2, 3, 2] | 2 => [2, 1, 2, 0, 1, 2, 3, 2, 1] | 3 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2] | 4 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 0] | 5 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0] | 6 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1] | 7 => [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2] | _ => []
  | _ => []

/-- Explicit `W(F_4)` word mapping clique `i : Fin 216` onto the canonical clique of its size:
    `0` (`[0]`), `24` (`[0, 4]`), or `120` (`[0, 4, 8]`). -/
def sseCanonWord216 (i : Fin 216) : List (Fin 4) :=
  sseNatWordToFin4 (sse_canonWord216Nat i.val)

/-- Canonical `Fin 216` representative for clique size `1, 2, 3`. -/
def sseCanonCliqueOfSize : Nat → Fin 216
  | 1 => ⟨0, by decide⟩
  | 2 => ⟨24, by decide⟩
  | _ => ⟨120, by decide⟩

private def sse_act216NatWord : List Nat → Nat → Nat
  | [], i => i
  | k :: rest, i => sse_act216GenNat (k % 4) (sse_act216NatWord rest i)

private theorem sse_act216_eq_natWord (w : List Nat) (i : Fin 216) :
    (sseAct216 (sseNatWordToFin4 w) i).val = sse_act216NatWord w i.val := by
  induction w with
  | nil => rfl
  | cons k rest ih =>
    simp only [sseNatWordToFin4, sseAct216, sse_act216NatWord, sseAct216Gen]
    rw [← ih]

private theorem sse_canonWord216_fast :
    sse_allPow2 (fun i =>
      if i < 216 then
        decide (sse_act216NatWord (sse_canonWord216Nat i) i =
          (sseCanonCliqueOfSize (sseCliqueSize (sse_clique216Nat i))).val)
      else true) 8 0 = true := by
  decide

private theorem sse_canonWord216_exact (i : Fin 216) :
    sseAct216 (sseCanonWord216 i) i = sseCanonCliqueOfSize (sseSize216 i) := by
  apply Fin.ext
  unfold sseCanonWord216 sseSize216 sseClique216
  rw [sse_act216_eq_natWord]
  have h := sse_allPow2_sound _ 8 0 sse_canonWord216_fast i.val (Nat.zero_le _) (by have := i.isLt; omega)
  rw [sse_ite_pos i.isLt] at h; exact of_decide_eq_true h

private theorem sse_cliques216_counts_fast :
    (sseClique216 ⟨0, by decide⟩ = SseClique.c1 sse_v0) ∧
    (sseClique216 ⟨24, by decide⟩ = SseClique.c2 sse_v0 sse_v4) ∧
    (sseClique216 ⟨120, by decide⟩ = SseClique.c3 sse_v0 sse_v4 sse_v8) ∧
    (sse_sumPow2 (fun k => if h : k < 216 then if sseSize216 ⟨k, h⟩ = 1 then 1 else 0 else 0) 8 0 = 24) ∧
    (sse_sumPow2 (fun k => if h : k < 216 then if sseSize216 ⟨k, h⟩ = 2 then 1 else 0 else 0) 8 0 = 96) ∧
    (sse_sumPow2 (fun k => if h : k < 216 then if sseSize216 ⟨k, h⟩ = 3 then 1 else 0 else 0) 8 0 = 96) := by
  decide

private theorem sse_cliques216_size_counts :
    (sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 1 then 1 else 0) = 24) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 2 then 1 else 0) = 96) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 3 then 1 else 0) = 96) := by
  refine ⟨?_, ?_, ?_⟩
  · rw [sse_sumFinNat_eq_sumPow2 8 (by decide)]; exact sse_cliques216_counts_fast.2.2.2.1
  · rw [sse_sumFinNat_eq_sumPow2 8 (by decide)]; exact sse_cliques216_counts_fast.2.2.2.2.1
  · rw [sse_sumFinNat_eq_sumPow2 8 (by decide)]; exact sse_cliques216_counts_fast.2.2.2.2.2

/-- Headline Theorem 1 (`W(F_4)` Automorphisms & Exhaustive `216`-Clique Transitivity):
    1. Every `W(F_4)` word `w : List (Fin 4)` is a bijection on `Fin 24` preserving `dot4` and `adj24`
       and matching `sseApplyWordNat (w.map Fin.val)` on values.
    2. `sseClique216` matches `sseAllCliquesList` from `Vibe.CuspGrowth` identically (`24 + 96 + 96 = 216`),
       `sseAct216` is a compatible `W(F_4)` bijection on `Fin 216`, and EVERY `i : Fin 216` maps under
       `sseCanonWord216 i` onto the canonical representative `[0]`, `[0, 4]`, or `[0, 4, 8]` of its size! -/
theorem thm_sse_wf4_automorphisms_and_216_cliques :
    (∀ (w : List (Fin 4)) (a b : Fin 24),
      sseApplyWord w.reverse (sseApplyWord w a) = a ∧
      dot4 (d4RootOf (sseApplyWord w a)) (d4RootOf (sseApplyWord w b)) = dot4 (d4RootOf a) (d4RootOf b) ∧
      adj24 (sseApplyWord w a) (sseApplyWord w b) = adj24 a b ∧
      (sseApplyWord w a).val = sseApplyWordNat (w.map Fin.val) a.val) ∧
    (sseAllCliquesList.length = 216 ∧
     (∀ i : Fin 216, sseListGetD (SseClique.c1 ⟨0, by decide⟩) sseAllCliquesList i.val = sseClique216 i) ∧
     sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 1 then 1 else 0) = 24 ∧
     sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 2 then 1 else 0) = 96 ∧
     sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 3 then 1 else 0) = 96) ∧
    (∀ (k : Fin 4) (i : Fin 216),
      sseClique216 (sseAct216Gen k i) = sseActCliqueGen k (sseClique216 i) ∧
      sseAct216Gen k (sseAct216Gen k i) = i) ∧
    (∀ (i : Fin 216), sseAct216 (sseCanonWord216 i) i = sseCanonCliqueOfSize (sseSize216 i)) :=
  ⟨fun w a b => ⟨sse_applyWord_inv w a, sse_applyWord_preserves_dot4 w a b,
     sse_applyWord_preserves_adj24 w a b, sse_applyWord_val_eq_nat w a⟩,
   ⟨sse_allCliquesList_len, sse_allCliquesList_getD,
    sse_cliques216_size_counts.1, sse_cliques216_size_counts.2.1, sse_cliques216_size_counts.2.2⟩,
   fun k i => ⟨sse_act216Gen_compat k i, sse_act216Gen_inv k i⟩,
   sse_canonWord216_exact⟩


/-! ## Section 2: Exact `19`-State Depth-2 Cartier-Foata Automaton & Shell Growth -/

/-- Exact Depth-2 Cartier-Foata suffix state `St_2(w) = (D(w), {a ↦ D(w s_a) : a ∈ D(w)})`
    stored in sorted `Nat` vertex representation (each entry `< 24`, mirroring `Fin 24`). -/
abbrev SseD2StateNat := List Nat × List (Nat × List Nat)

-- [helper]
def sse_insertNatSorted (x : Nat) : List Nat → List Nat
  | [] => [x]
  | y :: ys => if x < y then x :: y :: ys else if x == y then y :: ys else y :: sse_insertNatSorted x ys

-- [helper]
def sse_sortNatList : List Nat → List Nat
  | [] => []
  | x :: xs => sse_insertNatSorted x (sse_sortNatList xs)

-- [helper]
def sse_insertPairSorted (p : Nat × List Nat) : List (Nat × List Nat) → List (Nat × List Nat)
  | [] => [p]
  | q :: qs => if p.1 < q.1 then p :: q :: qs else q :: sse_insertPairSorted p qs

-- [helper]
def sse_sortPairList : List (Nat × List Nat) → List (Nat × List Nat)
  | [] => []
  | p :: ps => sse_insertPairSorted p (sse_sortPairList ps)

/-- Exact membership test on `List Nat`. -/
def sseMemNat (x : Nat) : List Nat → Bool
  | [] => false
  | y :: ys => (x == y) || sseMemNat x ys

/-- Exact Depth-2 suffix transition `stepD2(St_2(w), b) = St_2(w s_b)` computed directly from `adj24` (`sse_adjFast`). -/
def sseStepD2 (st : SseD2StateNat) (b : Nat) : SseD2StateNat :=
  let newC0 := sse_insertNatSorted b (st.1.filter (fun a => sse_adjFast b a))
  let downB := (b, st.1)
  let downOthers := (st.2.filter (fun p => sse_adjFast b p.1)).map
    (fun p => (p.1, sse_insertNatSorted b (p.2.filter (fun x => sse_adjFast b x))))
  (newC0, sse_sortPairList (downB :: downOthers))

/-- Action of a `W(F_4)` generator word on a Depth-2 suffix state. -/
def ssePermD2 (w : List Nat) (st : SseD2StateNat) : SseD2StateNat :=
  let f := fun x => sseApplyWordNat w x
  (sse_sortNatList (st.1.map f),
   sse_sortPairList (st.2.map (fun p => (f p.1, sse_sortNatList (p.2.map f)))))

/-- Exact `19` canonical Depth-2 suffix state representatives `St_2(w)` mod `W(F_4)`. -/
def sseD2Rep : Fin 19 → SseD2StateNat
  | ⟨u, _⟩ => match u with
  | 0 => ([], [])
  | 1 => ([0], [(0, [])])
  | 2 => ([0], [(0, [21])])
  | 3 => ([0], [(0, [3])])
  | 4 => ([0, 4], [(0, [4]), (4, [0])])
  | 5 => ([0], [(0, [11])])
  | 6 => ([0, 4], [(0, [4, 21]), (4, [0])])
  | 7 => ([0], [(0, [6, 21])])
  | 8 => ([0], [(0, [3, 11])])
  | 9 => ([0, 4, 8], [(0, [4, 8]), (4, [0, 8]), (8, [0, 4])])
  | 10 => ([0], [(0, [6, 11])])
  | 11 => ([0, 4], [(0, [4, 14]), (4, [0])])
  | 12 => ([0, 4, 8], [(0, [4, 8]), (4, [0, 8, 16]), (8, [0, 4])])
  | 13 => ([0, 4], [(0, [4, 21]), (4, [0, 17])])
  | 14 => ([0, 4], [(0, [4, 14, 21]), (4, [0])])
  | 15 => ([0], [(0, [6, 11, 21])])
  | 16 => ([0], [(0, [3, 6, 11])])
  | 17 => ([0, 4, 8], [(0, [4, 8]), (4, [0, 8, 16]), (8, [0, 4, 12])])
  | 18 => ([0, 4, 8], [(0, [1, 4, 8]), (4, [0, 5, 8]), (8, [0, 4, 9])])
  | _ => ([], [])

/-- Exact Depth-2 upward transition table `(b, v, word)` for each state `u : Fin 19`. -/
-- [helper]
def sse_d2TransList : Nat → List (Nat × Nat × List Nat)
  | 0 => [(0, 1, []), (1, 1, [0, 1, 2, 1, 0]), (2, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3]), (3, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 1, [0]), (5, 1, [0, 1, 2, 1]), (6, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0]), (7, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1]), (8, 1, [0, 1]), (9, 1, [0, 1, 2]), (10, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1]), (11, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2]), (12, 1, [0, 1, 2, 3]), (13, 1, [0, 1, 2, 3, 1, 2, 1]), (14, 1, [0, 1, 2, 3, 1, 2, 1, 0]), (15, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 1, [0, 1, 2, 3, 1]), (17, 1, [0, 1, 2, 3, 1, 2]), (18, 1, [0, 1, 2, 3, 1, 2, 0, 1, 0]), (19, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (20, 1, [0, 1, 2, 3, 1, 0]), (21, 1, [0, 1, 2, 3, 1, 2, 0]), (22, 1, [0, 1, 2, 3, 1, 2, 0, 1]), (23, 1, [0, 1, 2, 3, 1, 2, 0, 1, 2])]
  | 1 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 4, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 4, [1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 4, [1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 4, [1, 2, 3, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 2 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 6, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 6, [2, 1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 6, [2, 1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 6, [2, 1, 2, 3, 2, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 3 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 4, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 4, [1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 4, [1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 4, [1, 2, 3, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 4 => [(1, 6, [2, 3, 0, 1, 2, 1, 0]), (2, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1]), (3, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (5, 6, [2, 3, 0, 1, 2, 1]), (6, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 0]), (7, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 9, []), (9, 9, [2]), (10, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 9, [2, 3]), (13, 11, [0, 1, 2, 3, 1, 2, 1]), (14, 11, [0, 1, 2, 3, 1, 2, 1, 0]), (15, 10, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 6, [2, 0, 1, 2, 3, 2, 1]), (17, 6, [2, 0, 1, 2, 3, 2, 1, 2]), (18, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0]), (19, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (20, 6, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 6, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1]), (23, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1])]
  | 5 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 4, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 4, [1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 4, [1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 11, [1, 2, 3, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 6 => [(1, 6, [2, 3, 0, 1, 2, 1, 0]), (2, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1]), (3, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (5, 6, [2, 3, 0, 1, 2, 1]), (6, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 0]), (7, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 9, []), (9, 12, [2, 0]), (10, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 12, [2, 3, 0]), (13, 11, [0, 1, 2, 3, 1, 2, 1]), (14, 11, [0, 1, 2, 3, 1, 2, 1, 0]), (15, 10, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 6, [2, 0, 1, 2, 3, 2, 1]), (17, 13, [2, 1, 2, 3, 2, 1, 2]), (18, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0]), (19, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (20, 6, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 6, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1]), (23, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1])]
  | 7 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 6, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 6, [2, 1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 14, [2, 1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 6, [2, 1, 2, 3, 2, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 8 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 4, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 4, [1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 4, [1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 11, [1, 2, 3, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 9 => [(1, 12, [3, 1, 2, 1, 0]), (2, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2]), (3, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (5, 12, [3, 1, 2, 1]), (6, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0]), (7, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1]), (9, 12, [3, 1, 2]), (10, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 12, [1, 2, 3, 2]), (13, 14, [2, 0, 1, 2, 3, 2, 1, 2, 1]), (14, 14, [2, 0, 1, 2, 3, 2, 1, 2, 1, 0]), (15, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 12, [1, 2, 3, 2, 1]), (17, 14, [2, 0, 1, 2, 3, 2, 1, 2]), (18, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 0]), (19, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (20, 12, [1, 2, 3, 2, 1, 0]), (21, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2])]
  | 10 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 4, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 4, [1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 11, [1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 11, [1, 2, 3, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 11 => [(1, 6, [2, 3, 0, 1, 2, 1, 0]), (2, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1]), (3, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (5, 6, [2, 3, 0, 1, 2, 1]), (6, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 0]), (7, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 9, []), (9, 9, [2]), (10, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 9, [2, 3]), (13, 11, [0, 1, 2, 3, 1, 2, 1]), (14, 11, [0, 1, 2, 3, 1, 2, 1, 0]), (15, 10, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 6, [2, 0, 1, 2, 3, 2, 1]), (17, 6, [2, 0, 1, 2, 3, 2, 1, 2]), (18, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0]), (19, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (20, 6, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 6, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1]), (23, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1])]
  | 12 => [(1, 12, [3, 1, 2, 1, 0]), (2, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2]), (3, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (5, 12, [3, 1, 2, 1]), (6, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0]), (7, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1]), (9, 12, [3, 1, 2]), (10, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 17, [2, 3, 2]), (13, 14, [2, 0, 1, 2, 3, 2, 1, 2, 1]), (14, 14, [2, 0, 1, 2, 3, 2, 1, 2, 1, 0]), (15, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 12, [1, 2, 3, 2, 1]), (17, 14, [2, 0, 1, 2, 3, 2, 1, 2]), (18, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 0]), (19, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (20, 17, [2, 3, 2, 0, 1, 0]), (21, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2])]
  | 13 => [(1, 6, [2, 3, 0, 1, 2, 1, 0]), (2, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1]), (3, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (5, 6, [2, 3, 0, 1, 2, 1]), (6, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 0]), (7, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 9, []), (9, 17, [0, 1, 2]), (10, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 17, [0, 1, 2, 3]), (13, 11, [0, 1, 2, 3, 1, 2, 1]), (14, 11, [0, 1, 2, 3, 1, 2, 1, 0]), (15, 10, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 6, [2, 0, 1, 2, 3, 2, 1]), (17, 13, [2, 1, 2, 3, 2, 1, 2]), (18, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0]), (19, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (20, 6, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 13, [2, 1, 2, 3, 2, 1, 2, 0]), (22, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1]), (23, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1])]
  | 14 => [(1, 6, [2, 3, 0, 1, 2, 1, 0]), (2, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1]), (3, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (5, 6, [2, 3, 0, 1, 2, 1]), (6, 7, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 0]), (7, 8, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 9, []), (9, 12, [2, 0]), (10, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 10, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 12, [2, 3, 0]), (13, 11, [0, 1, 2, 3, 1, 2, 1]), (14, 11, [0, 1, 2, 3, 1, 2, 1, 0]), (15, 10, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 6, [2, 0, 1, 2, 3, 2, 1]), (17, 13, [2, 1, 2, 3, 2, 1, 2]), (18, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0]), (19, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (20, 6, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 6, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 7, [3, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1]), (23, 7, [3, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1])]
  | 15 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 6, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 6, [2, 1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 14, [2, 1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 14, [2, 1, 2, 3, 2, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 16 => [(1, 2, [2, 3, 0, 1, 2, 1, 0]), (2, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3]), (3, 3, [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (4, 4, []), (5, 4, [1, 2, 1]), (6, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0]), (7, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (8, 4, [1]), (9, 4, [1, 2]), (10, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0]), (11, 5, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (12, 11, [1, 2, 3]), (13, 4, [1, 2, 3, 1, 2, 1]), (14, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0]), (15, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0]), (16, 4, [1, 2, 3, 1]), (17, 11, [1, 2, 3, 1, 2]), (18, 5, [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]), (19, 5, [2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0]), (20, 2, [2, 0, 1, 2, 3, 2, 1, 0]), (21, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 2, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2])]
  | 17 => [(1, 12, [3, 1, 2, 1, 0]), (2, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2]), (3, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (5, 12, [3, 1, 2, 1]), (6, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0]), (7, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1]), (9, 12, [3, 1, 2]), (10, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 17, [2, 3, 2]), (13, 14, [2, 0, 1, 2, 3, 2, 1, 2, 1]), (14, 14, [2, 0, 1, 2, 3, 2, 1, 2, 1, 0]), (15, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 17, [2, 3, 2, 1]), (17, 14, [2, 0, 1, 2, 3, 2, 1, 2]), (18, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 0]), (19, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (20, 18, [2, 3, 1, 0]), (21, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2])]
  | 18 => [(1, 18, [2, 1, 0]), (2, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2]), (3, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0]), (5, 18, [2, 1]), (6, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0]), (7, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1]), (9, 18, [2]), (10, 15, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (11, 16, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]), (12, 12, [1, 2, 3, 2]), (13, 14, [2, 0, 1, 2, 3, 2, 1, 2, 1]), (14, 14, [2, 0, 1, 2, 3, 2, 1, 2, 1, 0]), (15, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1]), (16, 12, [1, 2, 3, 2, 1]), (17, 14, [2, 0, 1, 2, 3, 2, 1, 2]), (18, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 0]), (19, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0]), (20, 12, [1, 2, 3, 2, 1, 0]), (21, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0]), (22, 14, [2, 0, 1, 2, 3, 2, 1, 2, 0, 1]), (23, 15, [2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2])]
  | _ => []

-- [helper]
def sse_d2Lookup (u b : Nat) : Option (Nat × List Nat) :=
  match (sse_d2TransList u).find? (fun e => e.1 == b) with
  | some e => some (e.2.1, e.2.2)
  | none => none

/-- Certified Depth-2 automaton next-state map `sseD2Next u b : Option (Fin 19)`. -/
def sseD2Next (u : Fin 19) (b : Fin 24) : Option (Fin 19) :=
  match sse_d2Lookup u.val b.val with
  | none => none
  | some e => if h : e.1 < 19 then some ⟨e.1, h⟩ else none

/-- Explicit `W(F_4)` canonicalizing word `sseD2Word u b : List (Fin 4)` mapping `sseStepD2 (sseD2Rep u) b`
    onto `sseD2Rep (sseD2Next u b)`. -/
def sseD2Word (u : Fin 19) (b : Fin 24) : List (Fin 4) :=
  match sse_d2Lookup u.val b.val with
  | none => []
  | some e => sseNatWordToFin4 e.2

/-- Clique size `|D(u)| ∈ {0, 1, 2, 3}` of Depth-2 state `u : Fin 19`. -/
def sseD2Size (u : Fin 19) : Fin 4 :=
  match (sseD2Rep u).1.length with
  | 0 => ⟨0, by decide⟩
  | 1 => ⟨1, by decide⟩
  | 2 => ⟨2, by decide⟩
  | _ => ⟨3, by decide⟩

/-- Transition multiplicity `M_2(u → v) = |{b : Fin 24 | sseD2Next u b = some v}|`. -/
def sseD2TransMult (u v : Fin 19) : Nat :=
  sseSumFinNat (fun b : Fin 24 => match sseD2Next u b with | some w => if w = v then 1 else 0 | none => 0)

/-- Validity predicate for a Depth-2 state directly over `adj24` (`sse_adjFast`):
    strictly sorted `< 24` cliques, `downs` keyed by `c0`, and `∀ a ∈ c0, a ∉ downs[a] ∧ (c0 \ {a} ⊆ downs[a] ∩ Adj(a))`. -/
def sseIsValidCliqueNat (xs : List Nat) : Bool :=
  xs.all (fun a => decide (a < 24)) &&
  match xs with
  | [] => true
  | [_] => true
  | [a, b] => decide (a < b) && sse_adjFast a b
  | [a, b, c] => decide (a < b) && decide (b < c) && sse_adjFast a b && sse_adjFast a c && sse_adjFast b c
  | _ => false

def sseIsValidD2State (st : SseD2StateNat) : Bool :=
  sseIsValidCliqueNat st.1 &&
  decide (st.2.map Prod.fst = st.1) &&
  st.2.all (fun p =>
    sseIsValidCliqueNat p.2 &&
    !(sseMemNat p.1 p.2) &&
    st.1.all (fun x => decide (x = p.1) || (sseMemNat x p.2 && sse_adjFast p.1 x)))

private theorem sse_d2_reps_valid_and_distinct :
    (∀ u : Fin 19, sseIsValidD2State (sseD2Rep u) = true) ∧
    (∀ u v : Fin 19, sseD2Rep u = sseD2Rep v → u = v) := by
  decide

private theorem sse_natWordToFin4_map_val (w : List Nat) (h : w.all (fun k => decide (k < 4)) = true) :
    (sseNatWordToFin4 w).map Fin.val = w := by
  induction w with
  | nil => rfl
  | cons k rest ih =>
    simp only [List.all, Bool.and_eq_true] at h
    have hk : k < 4 := of_decide_eq_true h.1
    simp only [sseNatWordToFin4, List.map, Nat.mod_eq_of_lt hk, ih h.2]

-- Single-lookup O(19 * 24) closure check split into 4 fast slices (well under default maxHeartbeats!).
private def sse_d2StepClosureOk (u : Fin 19) (b : Fin 24) : Bool :=
  match sse_d2Lookup u.val b.val with
  | none => sseMemNat b.val (sseD2Rep u).1
  | some e =>
    decide (e.1 < 19) &&
    !(sseMemNat b.val (sseD2Rep u).1) &&
    e.2.all (fun k => decide (k < 4)) &&
    decide (ssePermD2 e.2 (sseStepD2 (sseD2Rep u) b.val) = sseD2Rep ⟨e.1 % 19, Nat.mod_lt _ (by decide)⟩)

private theorem sse_d2_step_closure_p0 :
    ∀ (i : Fin 5) (b : Fin 24), sse_d2StepClosureOk ⟨i.val, by omega⟩ b = true := by decide

private theorem sse_d2_step_closure_p1 :
    ∀ (i : Fin 5) (b : Fin 24), sse_d2StepClosureOk ⟨i.val + 5, by omega⟩ b = true := by decide

private theorem sse_d2_step_closure_p2 :
    ∀ (i : Fin 5) (b : Fin 24), sse_d2StepClosureOk ⟨i.val + 10, by omega⟩ b = true := by decide

private theorem sse_d2_step_closure_p3 :
    ∀ (i : Fin 4) (b : Fin 24), sse_d2StepClosureOk ⟨i.val + 15, by omega⟩ b = true := by decide

private theorem sse_d2_step_closure_fast (u : Fin 19) (b : Fin 24) :
    sse_d2StepClosureOk u b = true := by
  if h0 : u.val < 5 then
    exact sse_d2_step_closure_p0 ⟨u.val, h0⟩ b
  else if h1 : u.val < 10 then
    have h := sse_d2_step_closure_p1 ⟨u.val - 5, by omega⟩ b
    have hu : (⟨u.val - 5 + 5, by omega⟩ : Fin 19) = u := Fin.ext (by dsimp only; omega)
    rw [hu] at h; exact h
  else if h2 : u.val < 15 then
    have h := sse_d2_step_closure_p2 ⟨u.val - 10, by omega⟩ b
    have hu : (⟨u.val - 10 + 10, by omega⟩ : Fin 19) = u := Fin.ext (by dsimp only; omega)
    rw [hu] at h; exact h
  else
    have h := sse_d2_step_closure_p3 ⟨u.val - 15, by omega⟩ b
    have hu : (⟨u.val - 15 + 15, by omega⟩ : Fin 19) = u := Fin.ext (by dsimp only; omega)
    rw [hu] at h; exact h

private theorem sse_d2_step_closure_exact (u : Fin 19) (b : Fin 24) :
    (sseMemNat b.val (sseD2Rep u).1 = true ↔ sseD2Next u b = none) ∧
    (∀ v : Fin 19, sseD2Next u b = some v →
      ssePermD2 ((sseD2Word u b).map Fin.val) (sseStepD2 (sseD2Rep u) b.val) = sseD2Rep v) := by
  have h := sse_d2_step_closure_fast u b
  unfold sse_d2StepClosureOk at h
  unfold sseD2Next sseD2Word
  cases hL : sse_d2Lookup u.val b.val with
  | none =>
    rw [hL] at h; dsimp only at h ⊢
    exact ⟨⟨fun _ => rfl, fun _ => h⟩, fun _ hv => nomatch hv⟩
  | some e =>
    rw [hL] at h; dsimp only at h ⊢
    simp only [Bool.and_eq_true, Bool.not_eq_true'] at h
    have hlt : e.1 < 19 := of_decide_eq_true h.1.1.1
    rw [dite_eq_left hlt]
    refine ⟨⟨fun hm => by rw [h.1.1.2] at hm; exact absurd hm (by decide), fun hn => nomatch hn⟩, ?_⟩
    intro v hv; cases hv
    rw [sse_natWordToFin4_map_val e.2 h.1.2]
    have heq : (⟨e.1 % 19, Nat.mod_lt _ (by decide)⟩ : Fin 19) = ⟨e.1, hlt⟩ := Fin.ext (Nat.mod_eq_of_lt hlt)
    have hP := of_decide_eq_true h.2
    rw [heq] at hP; exact hP

private theorem sse_d2_lumpability_exact :
    (∀ u : Fin 19, (sseD2Size u).val + sseSumFinNat (fun v : Fin 19 => sseD2TransMult u v) = 24) ∧
    (∀ (u : Fin 19) (t : Fin 4),
      sseSumFinNat (fun v : Fin 19 => if sseD2Size v = t then sseD2TransMult u v else 0) =
        ssUpBound (sseD2Size u) t) := by
  decide

/-- Exact Depth-2 shell histogram `N_2(r, u)` computed directly from `sseD2TransMult` via division by `|c0(v)|`. -/
def sseD2ShellVec : Nat → Fin 19 → Nat
  | 0, u => if u.val = 0 then 1 else 0
  | r + 1, v =>
    if v.val = 0 then 0
    else sseSumFinNat (fun u : Fin 19 => sseD2ShellVec r u * sseD2TransMult u v) / (sseD2Size v).val

private theorem sse_d2_shell_r0_to_r6 :
    (∀ r : Fin 6, ∀ v : Fin 19, v.val ≠ 0 →
      sseSumFinNat (fun u : Fin 19 => sseD2ShellVec r.val u * sseD2TransMult u v) % (sseD2Size v).val = 0) ∧
    (sseSumFinNat (sseD2ShellVec 0) = ballShell 0 ∧ sseSumFinNat (sseD2ShellVec 0) = 1) ∧
    (sseSumFinNat (sseD2ShellVec 1) = ballShell 1 ∧ sseSumFinNat (sseD2ShellVec 1) = 24) ∧
    (sseSumFinNat (sseD2ShellVec 2) = ballShell 2 ∧ sseSumFinNat (sseD2ShellVec 2) = 456) ∧
    (sseSumFinNat (sseD2ShellVec 3) = ballShell 3 ∧ sseSumFinNat (sseD2ShellVec 3) = 8376) ∧
    (sseSumFinNat (sseD2ShellVec 4) = ballShell 4 ∧ sseSumFinNat (sseD2ShellVec 4) = 153192) ∧
    (sseSumFinNat (sseD2ShellVec 5) = ballShell 5 ∧ sseSumFinNat (sseD2ShellVec 5) = 2800344) ∧
    (sseSumFinNat (sseD2ShellVec 6) = ballShell 6 ∧ sseSumFinNat (sseD2ShellVec 6) = 51187080) := by
  decide

private theorem sse_d2_all_depth_lumpable (N : Nat → Fin 19 → Nat)
    (hInit : ∀ u : Fin 19, N 0 u = if u.val = 0 then 1 else 0)
    (hZero : ∀ r : Nat, N (r + 1) ⟨0, by decide⟩ = 0)
    (hDB : ∀ (r : Nat) (v : Fin 19),
      (sseD2Size v).val * N (r + 1) v = sseSumFinNat (fun u : Fin 19 => N r u * sseD2TransMult u v)) :
    ∀ r : Nat,
      (∀ k : Fin 4, sseSumFinNat (fun u : Fin 19 => if sseD2Size u = k then N r u else 0) = ssStratumCount k r) ∧
      sseSumFinNat (fun u : Fin 19 => N r u) = ballShell r := by
  have hStrata : ∀ r : Nat, ∀ k : Fin 4,
      sseSumFinNat (fun u : Fin 19 => if sseD2Size u = k then N r u else 0) = ssStratumCount k r := by
    intro r; induction r with
    | zero =>
      intro k
      have hFun : (fun u : Fin 19 => if sseD2Size u = k then N 0 u else 0) =
          (fun u : Fin 19 => if sseD2Size u = k then (if u.val = 0 then 1 else 0) else 0) :=
        funext (fun u => by rw [hInit u])
      rw [hFun]
      exact (by decide : ∀ t : Fin 4,
        sseSumFinNat (fun u : Fin 19 => if sseD2Size u = t then (if u.val = 0 then 1 else 0) else 0) =
          ssStratumCount t 0) k
    | succ m ih =>
      intro k
      cases hk : k.val with
      | zero =>
        have hk0 : k = ⟨0, by decide⟩ := Fin.ext hk
        rw [hk0]
        have hOnly0 : ∀ u : Fin 19, (if sseD2Size u = ⟨0, by decide⟩ then N (m + 1) u else 0) = 0 := by
          intro u
          if hu : u.val = 0 then
            have hu0 : u = ⟨0, by decide⟩ := Fin.ext hu
            rw [hu0, hZero m]; split <;> rfl
          else
            have hne : sseD2Size u ≠ ⟨0, by decide⟩ :=
              (by decide : ∀ x : Fin 19, x.val ≠ 0 → sseD2Size x ≠ ⟨0, by decide⟩) u hu
            rw [sse_ite_neg hne]
        rw [sse_sumFinNat_congr _ _ hOnly0, sse_sumFinNat_zero]; rfl
      | succ k' =>
        have hkPos : 0 < k.val := by omega
        have hMul : k.val * sseSumFinNat (fun v : Fin 19 => if sseD2Size v = k then N (m + 1) v else 0) =
            k.val * ssStratumCount k (m + 1) := by
          rw [← sse_sumFinNat_mul_left]
          have hStep1 : sseSumFinNat (fun v : Fin 19 => k.val * (if sseD2Size v = k then N (m + 1) v else 0)) =
              sseSumFinNat (fun v : Fin 19 =>
                if sseD2Size v = k then sseSumFinNat (fun u : Fin 19 => N m u * sseD2TransMult u v) else 0) := by
            apply sse_sumFinNat_congr; intro v
            if hv : sseD2Size v = k then
              rw [sse_ite_pos hv, sse_ite_pos hv, ← hv, hDB m v]
            else
              rw [sse_ite_neg hv, sse_ite_neg hv, Nat.mul_zero]
          have hStep2 : sseSumFinNat (fun v : Fin 19 =>
                if sseD2Size v = k then sseSumFinNat (fun u : Fin 19 => N m u * sseD2TransMult u v) else 0) =
              sseSumFinNat (fun u : Fin 19 =>
                N m u * sseSumFinNat (fun v : Fin 19 => if sseD2Size v = k then sseD2TransMult u v else 0)) := by
            have hIn : (fun v : Fin 19 =>
                if sseD2Size v = k then sseSumFinNat (fun u : Fin 19 => N m u * sseD2TransMult u v) else 0) =
              (fun v : Fin 19 => sseSumFinNat (fun u : Fin 19 =>
                if sseD2Size v = k then N m u * sseD2TransMult u v else 0)) := by
              funext v
              if hv : sseD2Size v = k then
                rw [sse_ite_pos hv]; exact (sse_sumFinNat_congr _ _ (fun _ => sse_ite_pos hv _ _)).symm
              else
                rw [sse_ite_neg hv]; symm
                rw [sse_sumFinNat_congr _ _ (fun _ => sse_ite_neg hv _ _), sse_sumFinNat_zero]
            rw [hIn, sse_sumFinNat_swap]
            apply sse_sumFinNat_congr; intro u
            rw [← sse_sumFinNat_mul_left]
            apply sse_sumFinNat_congr; intro v
            if hv : sseD2Size v = k then rw [sse_ite_pos hv, sse_ite_pos hv]
            else rw [sse_ite_neg hv, sse_ite_neg hv, Nat.mul_zero]
          have hStep3 : sseSumFinNat (fun u : Fin 19 =>
                N m u * sseSumFinNat (fun v : Fin 19 => if sseD2Size v = k then sseD2TransMult u v else 0)) =
              sseSumFinNat (fun j : Fin 4 =>
                ssStratumCount j m * ssUpBound j k) := by
            have hLump : (fun u : Fin 19 =>
                N m u * sseSumFinNat (fun v : Fin 19 => if sseD2Size v = k then sseD2TransMult u v else 0)) =
              (fun u : Fin 19 => sseSumFinNat (fun j : Fin 4 =>
                if sseD2Size u = j then N m u * ssUpBound j k else 0)) := by
              funext u
              rw [sse_d2_lumpability_exact.2 u k, sse_sumFinNat_kronecker (sseD2Size u) (fun j => N m u * ssUpBound j k)]
            rw [hLump, sse_sumFinNat_swap]
            apply sse_sumFinNat_congr; intro j
            rw [← ih j, ← sse_sumFinNat_mul_right]
            apply sse_sumFinNat_congr; intro u
            if hu : sseD2Size u = j then rw [sse_ite_pos hu, sse_ite_pos hu]
            else rw [sse_ite_neg hu, sse_ite_neg hu, Nat.zero_mul]
          rw [hStep1, hStep2, hStep3]
          obtain ⟨hDB1, hDB2, hDB3⟩ := thm_ss_foata_detailed_balance.2.1 m
          match k' with
          | 0 =>
            have hkEq : k = ⟨1, by decide⟩ := Fin.ext hk
            rw [hkEq]; simp only [sseSumFinNat, sseSumFinNatAux, ssUpBound, Nat.zero_add]; omega
          | 1 =>
            have hkEq : k = ⟨2, by decide⟩ := Fin.ext hk
            rw [hkEq]; simp only [sseSumFinNat, sseSumFinNatAux, ssUpBound, Nat.zero_add]; omega
          | 2 =>
            have hkEq : k = ⟨3, by decide⟩ := Fin.ext hk
            rw [hkEq]; simp only [sseSumFinNat, sseSumFinNatAux, ssUpBound, Nat.zero_add]; omega
          | _ + 3 => have := k.isLt; omega
        exact Nat.eq_of_mul_eq_mul_left hkPos hMul
  intro r
  refine ⟨hStrata r, ?_⟩
  have hPart : sseSumFinNat (fun u : Fin 19 => N r u) =
      sseSumFinNat (fun k : Fin 4 => sseSumFinNat (fun u : Fin 19 => if sseD2Size u = k then N r u else 0)) := by
    rw [sse_sumFinNat_swap]
    apply sse_sumFinNat_congr; intro u
    exact (sse_sumFinNat_kronecker (sseD2Size u) (fun _ => N r u)).symm
  rw [hPart, sse_sumFinNat_congr _ _ (hStrata r)]
  have hBall := thm_ss_foata_detailed_balance.2.2 r
  simp only [sseSumFinNat, sseSumFinNatAux, Nat.zero_add]; omega

/-- Headline Theorem 2 (Exact `19`-State Depth-2 Automaton Closure, Lumpability & Shell Growth):
    certifies inside Lean's kernel directly against `adj24` and `Vibe.CuspGrowth`:
    1. All `19` canonical Depth-2 representatives are valid and pairwise distinct;
    2. For every `(u : Fin 19, b : Fin 24)`, `b ∈ c0(u) ↔ sseD2Next u b = none`, and every upward step
       `sseStepD2 (sseD2Rep u) b` maps under the explicit `W(F_4)` word `sseD2Word u b` identically onto
       `sseD2Rep (sseD2Next u b)`;
    3. Exact `24`-regularity and Depth-1 lumpability onto `Vibe.SpectralSharp.ssUpBound` at all `19` states;
    4. Exact zero-remainder Depth-2 shell counts `r = 0..6` matching `ballShell 0..6 = [1, 24, 456, 8376, 153192, 2800344, 51187080]`,
       and universal all-`r` (`∀ r : Nat`) projection onto `ssStratumCount` and `ballShell`. -/
theorem thm_sse_depth2_automaton_and_shell_growth :
    (∀ u : Fin 19, sseIsValidD2State (sseD2Rep u) = true) ∧
    (∀ u v : Fin 19, sseD2Rep u = sseD2Rep v → u = v) ∧
    (∀ (u : Fin 19) (b : Fin 24),
      (sseMemNat b.val (sseD2Rep u).1 = true ↔ sseD2Next u b = none) ∧
      (∀ v : Fin 19, sseD2Next u b = some v →
        ssePermD2 ((sseD2Word u b).map Fin.val) (sseStepD2 (sseD2Rep u) b.val) = sseD2Rep v)) ∧
    (∀ u : Fin 19, (sseD2Size u).val + sseSumFinNat (fun v : Fin 19 => sseD2TransMult u v) = 24) ∧
    (∀ (u : Fin 19) (t : Fin 4),
      sseSumFinNat (fun v : Fin 19 => if sseD2Size v = t then sseD2TransMult u v else 0) =
        ssUpBound (sseD2Size u) t) ∧
    (sseSumFinNat (sseD2ShellVec 0) = ballShell 0 ∧ sseSumFinNat (sseD2ShellVec 1) = ballShell 1 ∧
     sseSumFinNat (sseD2ShellVec 2) = ballShell 2 ∧ sseSumFinNat (sseD2ShellVec 3) = ballShell 3 ∧
     sseSumFinNat (sseD2ShellVec 4) = ballShell 4 ∧ sseSumFinNat (sseD2ShellVec 5) = ballShell 5 ∧
     sseSumFinNat (sseD2ShellVec 6) = ballShell 6) ∧
    (∀ (N : Nat → Fin 19 → Nat),
      (∀ u : Fin 19, N 0 u = if u.val = 0 then 1 else 0) →
      (∀ r : Nat, N (r + 1) ⟨0, by decide⟩ = 0) →
      (∀ (r : Nat) (v : Fin 19),
        (sseD2Size v).val * N (r + 1) v = sseSumFinNat (fun u : Fin 19 => N r u * sseD2TransMult u v)) →
      ∀ r : Nat,
        (∀ k : Fin 4, sseSumFinNat (fun u : Fin 19 => if sseD2Size u = k then N r u else 0) = ssStratumCount k r) ∧
        sseSumFinNat (fun u : Fin 19 => N r u) = ballShell r) ∧
    (∀ r : Fin 6, ∀ v : Fin 19, v.val ≠ 0 →
      sseSumFinNat (fun u : Fin 19 => sseD2ShellVec r.val u * sseD2TransMult u v) % (sseD2Size v).val = 0) :=
  ⟨sse_d2_reps_valid_and_distinct.1, sse_d2_reps_valid_and_distinct.2, sse_d2_step_closure_exact,
   sse_d2_lumpability_exact.1, sse_d2_lumpability_exact.2,
   ⟨sse_d2_shell_r0_to_r6.2.1.1, sse_d2_shell_r0_to_r6.2.2.1.1, sse_d2_shell_r0_to_r6.2.2.2.1.1,
    sse_d2_shell_r0_to_r6.2.2.2.2.1.1, sse_d2_shell_r0_to_r6.2.2.2.2.2.1.1,
    sse_d2_shell_r0_to_r6.2.2.2.2.2.2.1.1, sse_d2_shell_r0_to_r6.2.2.2.2.2.2.2.1⟩,
   sse_d2_all_depth_lumpable, sse_d2_shell_r0_to_r6.1⟩


/-! ## Section 3: Exact `23`-Flag Upward-End Orbits, Unconditional `Aut`-Invariance & Reciprocity -/

-- [helper]
def sse_d2DownFlagList : Nat → List (Nat × Nat)
  | 0 => []
  | 1 => [(0, 0)]
  | 2 => [(0, 1)]
  | 3 => [(0, 2)]
  | 4 => [(0, 3), (4, 3)]
  | 5 => [(0, 4)]
  | 6 => [(0, 6), (4, 5)]
  | 7 => [(0, 7)]
  | 8 => [(0, 8)]
  | 9 => [(0, 9), (4, 9), (8, 9)]
  | 10 => [(0, 10)]
  | 11 => [(0, 11), (4, 12)]
  | 12 => [(0, 13), (4, 16), (8, 13)]
  | 13 => [(0, 14), (4, 14)]
  | 14 => [(0, 19), (4, 15)]
  | 15 => [(0, 17)]
  | 16 => [(0, 18)]
  | 17 => [(0, 21), (4, 20), (8, 20)]
  | 18 => [(0, 22), (4, 22), (8, 22)]
  | _ => []

/-- Certified downward flag id `[St_2(v), a]_{W(F_4)} ∈ Fin 23` (in W7's exact numbering) for `a ∈ c0(v)`. -/
def sseD2DownFlag (v : Fin 19) (a : Fin 24) : Option (Fin 23) :=
  match (sse_d2DownFlagList v.val).find? (fun p => p.1 == a.val) with
  | some p => if h : p.2 < 23 then some ⟨p.2, h⟩ else none
  | none => none

/-- Certified upward flag id `[St_2(v), p(b)]_{W(F_4)} ∈ Fin 23` computed from the lower endpoint `(u, b)`
    via `v = sseD2Next u b` and canonicalizing `W(F_4)` word `p = sseD2Word u b`. -/
def sseD2UpFlag (u : Fin 19) (b : Fin 24) : Option (Fin 23) :=
  match sseD2Next u b with
  | none => none
  | some v => sseD2DownFlag v (sseApplyWord (sseD2Word u b) b)

/-- Unique owner state `owner(e) : Fin 19` for each of the `23` upward-end flags `e : Fin 23`. -/
def sseD2FlagOwner (e : Fin 23) : Fin 19 :=
  let o : Nat := match e.val with
  | 0 => 1
  | 1 => 2
  | 2 => 3
  | 3 => 4
  | 4 => 5
  | 5 => 6
  | 6 => 6
  | 7 => 7
  | 8 => 8
  | 9 => 9
  | 10 => 10
  | 11 => 11
  | 12 => 11
  | 13 => 12
  | 14 => 13
  | 15 => 14
  | 16 => 12
  | 17 => 15
  | 18 => 16
  | 19 => 14
  | 20 => 17
  | 21 => 17
  | 22 => 18
    | _ => 1
  if h : o < 19 then ⟨o, h⟩ else ⟨0, by decide⟩

/-- Size `|D(v s_a)|` of the `a`-downward clique stored in `sseD2Rep v`. -/
def sseD2DownCliqueLen (v : Fin 19) (a : Fin 24) : Nat :=
  match (sseD2Rep v).2.find? (fun p => p.1 == a.val) with
  | some p => p.2.length
  | none => 0

/-- Exact downward multiplicity of flag `e` at Depth-2 state `u`. -/
def sseD2DownMult (u : Fin 19) (e : Fin 23) : Nat :=
  sseSumFinNat (fun a : Fin 24 => match sseD2DownFlag u a with | some f => if f = e then 1 else 0 | none => 0)

/-- Exact upward multiplicity of flag `e` at Depth-2 state `u`. -/
def sseD2UpMult (u : Fin 19) (e : Fin 23) : Nat :=
  sseSumFinNat (fun b : Fin 24 => match sseD2UpFlag u b with | some f => if f = e then 1 else 0 | none => 0)

-- Fast O(19 * 24) flag invariant verification (avoids O(19*24*19*23) quantifier expansion!).
private def sse_d2DownFlagOk (v : Fin 19) (a : Fin 24) : Bool :=
  match sseD2DownFlag v a with
  | none => !(sseMemNat a.val (sseD2Rep v).1)
  | some e => sseMemNat a.val (sseD2Rep v).1 && decide (sseD2FlagOwner e = v)

private def sse_d2RecOk (u : Fin 19) (b : Fin 24) : Bool :=
  match sseD2Next u b with
  | none => true
  | some v =>
    match sseD2UpFlag u b with
    | none => false
    | some e =>
      decide (sseD2DownFlag v (sseApplyWord (sseD2Word u b) b) = some e) &&
      decide (sseD2FlagOwner e = v)

private theorem sse_d2_flag_invariants_fast :
    (∀ (v : Fin 19) (a : Fin 24), sse_d2DownFlagOk v a = true) ∧
    (∀ e : Fin 23, 0 < sseD2DownMult (sseD2FlagOwner e) e) ∧
    (∀ (v : Fin 19) (a b : Fin 24),
      sseMemNat a.val (sseD2Rep v).1 = true → sseMemNat b.val (sseD2Rep v).1 = true →
      sseD2DownCliqueLen v a = sseD2DownCliqueLen v b → sseD2DownFlag v a = sseD2DownFlag v b) ∧
    (∀ (u : Fin 19) (b : Fin 24), sse_d2RecOk u b = true) ∧
    (∀ u : Fin 19,
      sseSumFinNat (fun e : Fin 23 => sseD2DownMult u e) +
      sseSumFinNat (fun e : Fin 23 => sseD2UpMult u e) = 24) := by
  decide

/-- Headline Theorem 3 (Exact `23`-Flag Unique Ownership, Unconditional `Aut`-Invariance & Edge Reciprocity):
    1. Every downward generator `a ∈ c0(v)` carries a flag `e ∈ Fin 23` whose owner state `sseD2FlagOwner e = v`
       is unique, and all `23` flags are realized;
    2. **Unconditional `Aut(d2Rep v)` invariance:** at EVERY state `v : Fin 19`, `sseD2DownFlag v a` is uniquely
       determined by `|D(v s_a)| = sseD2DownCliqueLen v a`, so EVERY permutation `π : Fin 24 → Fin 24` preserving
       `c0(v)` and down-clique cardinalities obeys `sseD2DownFlag v (π a) = sseD2DownFlag v a` (guaranteeing
       independence from the choice of canonicalizing `W(F_4)` isomorphism!);
    3. **Exact directed-edge reciprocity:** for every upward transition `(u, b) → v`, the upward flag
       `sseD2UpFlag u b = some e` identically matches the downward flag `sseD2DownFlag v (p b) = some e`,
       with exact degree conservation `∑_e (B_{u,e} + A_{u,e}) = 24` at all `19` states. -/
theorem thm_sse_depth2_flag_reciprocity :
    (∀ (v : Fin 19) (a : Fin 24) (e : Fin 23), sseD2DownFlag v a = some e → sseD2FlagOwner e = v) ∧
    (∀ e : Fin 23, 0 < sseD2DownMult (sseD2FlagOwner e) e) ∧
    (∀ (v : Fin 19) (π : Fin 24 → Fin 24),
      (∀ a : Fin 24, sseMemNat a.val (sseD2Rep v).1 = true →
        sseMemNat (π a).val (sseD2Rep v).1 = true ∧ sseD2DownCliqueLen v (π a) = sseD2DownCliqueLen v a) →
      ∀ a : Fin 24, sseMemNat a.val (sseD2Rep v).1 = true → sseD2DownFlag v (π a) = sseD2DownFlag v a) ∧
    (∀ (u : Fin 19) (b : Fin 24) (v : Fin 19),
      sseD2Next u b = some v →
      ∃ e : Fin 23,
        sseD2UpFlag u b = some e ∧
        sseD2DownFlag v (sseApplyWord (sseD2Word u b) b) = some e ∧
        sseD2FlagOwner e = v) ∧
    (∀ u : Fin 19,
      sseSumFinNat (fun e : Fin 23 => sseD2DownMult u e) +
      sseSumFinNat (fun e : Fin 23 => sseD2UpMult u e) = 24) := by
  refine ⟨?_, sse_d2_flag_invariants_fast.2.1, ?_, ?_, sse_d2_flag_invariants_fast.2.2.2.2⟩
  · intro v a e he
    have h := sse_d2_flag_invariants_fast.1 v a
    unfold sse_d2DownFlagOk at h; rw [he] at h; dsimp only at h; simp only [Bool.and_eq_true] at h
    exact of_decide_eq_true h.2
  · intro v π hπ a ha
    have h1 := hπ a ha
    exact (sse_d2_flag_invariants_fast.2.2.1 v a (π a) ha h1.1 h1.2.symm).symm
  · intro u b v hv
    have h := sse_d2_flag_invariants_fast.2.2.2.1 u b
    unfold sse_d2RecOk at h; rw [hv] at h; dsimp only at h
    cases hu : sseD2UpFlag u b with
    | none => rw [hu] at h; dsimp only at h; exact absurd h (by decide)
    | some e =>
      rw [hu] at h; dsimp only at h; simp only [Bool.and_eq_true] at h
      exact ⟨e, rfl, of_decide_eq_true h.1, of_decide_eq_true h.2⟩


/-! ## Section 4: Depth-2 Nagnibeda Schur Upper Bound (`ρ ≤ 387141227/33670000 < 11.5`) & Subgraph Bridge -/

/-- W7's exact `Q = 10,000` `23`-integer Depth-2 Nagnibeda certificate `p[0..22]` (`f_e = p_e / 10000`). -/
def sseD2CertP (e : Fin 23) : Int :=
  match e.val with
  | 0  => 1606 | 1  => 1823 | 2  => 1606 | 3  => 3367 | 4  => 1651
  | 5  => 5226 | 6  => 2766 | 7  => 1863 | 8  => 1651 | 9  => 4791
  | 10 => 1700 | 11 => 2516 | 12 => 5090 | 13 => 6302 | 14 => 3847
  | 15 => 6405 | 16 => 3451 | 17 => 1905 | 18 => 1700 | 19 => 2521
  | 20 => 4402 | 21 => 7413 | 22 => 5241 | _  => 1

-- [helper]
theorem sse_d2CertP_pos : ∀ e : Fin 23, 0 < sseD2CertP e := by decide

/-- Exact `QPos` Depth-2 Schur row sum `S_u = ∑_{b up} (p_{f(u,b)} / 10000) + ∑_{a down} (10000 / p_{f(u,a)})`
    computed directly from the certified transitions `sseD2UpFlag` and `sseD2DownFlag`. -/
def sseD2RowSumQPos (u : Fin 19) : QPos :=
  let upNum : Int := ssSumFin (fun b : Fin 24 =>
    match sseD2UpFlag u b with | some e => sseD2CertP e | none => 0)
  let upQ : QPos := ⟨upNum, 10000, by decide⟩
  let dnList : List (Fin 23) := (List.finRange 24).filterMap (fun a => sseD2DownFlag u a)
  dnList.foldl (fun acc e => QPos.add acc ⟨10000, sseD2CertP e, sse_d2CertP_pos e⟩) upQ

private theorem sse_d2_rowSumQPos_le_all :
    (∀ u : Fin 19, QPos.le (sseD2RowSumQPos u) ⟨387141227, 33670000, by decide⟩) ∧
    QPos.eq (sseD2RowSumQPos ⟨4, by decide⟩) ⟨387141227, 33670000, by decide⟩ := by
  unfold QPos.le QPos.eq; decide

/-- Headline Theorem 4 (Exact Depth-2 Nagnibeda Schur Upper Bound `ρ ≤ 387141227/33670000 < 11.5`, `λ_gap > 13/25 > 1/2`):
    certifies across ALL `19` Depth-2 states directly from `sseD2RowSumQPos`:
    - `∀ u : Fin 19, S_u ≤ 387141227 / 33670000` (exact equality attained at `u = 4`),
    - `387141227 / 33670000 < 114982 / 10000 < 115 / 10 = 11.5`, beating `Vibe.SpectralSharp`'s
      `3325977059 / 278900000` by `> 427 / 1000`,
    - Normalized random-walk radius: `∀ u, S_u / 24 ≤ 387141227 / 808080000 < 23 / 48 < 1 / 2`,
    - Normalized Laplacian spectral gap: `λ_gap ≥ 420938773 / 808080000 > 25 / 48 > 13 / 25 = 0.52 > 1 / 2`,
      strictly improving `Vibe.SpectralSharp`'s `3367622941 / 6693600000`. -/
theorem thm_sse_depth2_nagnibeda_upper_bound :
    (∀ e : Fin 23, 0 < sseD2CertP e) ∧
    (∀ u : Fin 19, QPos.le (sseD2RowSumQPos u) ⟨387141227, 33670000, by decide⟩) ∧
    QPos.eq (sseD2RowSumQPos ⟨4, by decide⟩) ⟨387141227, 33670000, by decide⟩ ∧
    (387141227 * 10000 < 114982 * 33670000 ∧ 114982 * 10 < 115 * 10000) ∧
    (387141227 * 278900000 + 427 * 33670000 * 278900 < 3325977059 * 33670000) ∧
    (∀ u : Fin 19, QPos.le (QPos.divPos (sseD2RowSumQPos u) 24 (by decide)) ⟨387141227, 808080000, by decide⟩) ∧
    (387141227 * 48 < 23 * 808080000) ∧
    QPos.eq (QPos.add (QPos.divPos (sseD2RowSumQPos ⟨4, by decide⟩) 24 (by decide))
                      ⟨420938773, 808080000, by decide⟩) ⟨1, 1, by decide⟩ ∧
    (25 * 808080000 < 420938773 * 48 ∧ 13 * 48 < 25 * 25 ∧
     3367622941 * 808080000 < 420938773 * 6693600000) := by
  refine ⟨sse_d2CertP_pos, sse_d2_rowSumQPos_le_all.1, sse_d2_rowSumQPos_le_all.2,
          by decide, by decide, ?_, by decide, ?_, by decide⟩
  · intro u
    have h := sse_d2_rowSumQPos_le_all.1 u
    unfold QPos.le at h; unfold QPos.le QPos.divPos
    change (sseD2RowSumQPos u).num * (24 * 33670000) ≤ 387141227 * (24 * (sseD2RowSumQPos u).den)
    rw [← Int.mul_assoc, Int.mul_comm (sseD2RowSumQPos u).num 24, Int.mul_assoc 24,
        ← Int.mul_assoc 387141227 24, Int.mul_comm 387141227 24, Int.mul_assoc 24]
    have h2 : (sseD2RowSumQPos u).num * 33670000 * 24 ≤ 387141227 * (sseD2RowSumQPos u).den * 24 :=
      sse_int_mul_le_right _ _ 24 h (by decide)
    omega
  · unfold QPos.eq QPos.add QPos.divPos; decide

-- Exact common-denominator reciprocal integer weights for `thm_ss_finite_reciprocal_schur_bound`:
-- `L = lcm(p_0..p_22)`, `D = 10000 * L`, `U(e) = p_e * L`, `V(e) = 10000^2 * (L / p_e)`.
def sseD2LcmP : Int := 158796285400015134733068040790332434319952014424100
def sseD2CommonD : Int := 10000 * sseD2LcmP
def sseD2CommonM : Int := 18258565124087925476427169226627665090740461373705902100
def sseD2WeightUp (e : Fin 23) : Int := sseD2CertP e * sseD2LcmP
def sseD2WeightDn (e : Fin 23) : Int := 100000000 * (sseD2LcmP / sseD2CertP e)

private theorem sse_d2_weights_pos_and_rec :
    (0 < sseD2CommonD) ∧
    (∀ e : Fin 23, 0 < sseD2WeightUp e ∧ 0 < sseD2WeightDn e ∧
      sseD2WeightUp e * sseD2WeightDn e = sseD2CommonD * sseD2CommonD) ∧
    (∀ u : Fin 19,
      ssSumFin (fun e : Fin 23 => Int.ofNat (sseD2DownMult u e) * sseD2WeightDn e) +
      ssSumFin (fun e : Fin 23 => Int.ofNat (sseD2UpMult u e) * sseD2WeightUp e) ≤ sseD2CommonM) ∧
    (33670000 * 47162543926348421364142572257300990294016042300 = sseD2CommonD ∧
     387141227 * 47162543926348421364142572257300990294016042300 = sseD2CommonM) := by
  decide

/-- Integer-scaled Depth-2 reciprocal edge weight `W(i → j) = D * w(i → j)` on any finite bipartite
    graph equipped with symmetric edge-flag labels `eFlag : Fin n → Fin n → Fin 23`. -/
def sseD2WeightInt {n : Nat} (depth : Fin n → Nat) (eFlag : Fin n → Fin n → Fin 23) (i j : Fin n) : Int :=
  if depth j = depth i + 1 then sseD2WeightUp (eFlag i j)
  else if depth i = depth j + 1 then sseD2WeightDn (eFlag i j)
  else sseD2CommonD

/-- Downward neighbors of vertex `i` carrying edge flag `e : Fin 23`. -/
def sseD2DownDegOf {n : Nat} (A : Fin n → Fin n → Bool) (depth : Fin n → Nat)
    (eFlag : Fin n → Fin n → Fin 23) (i : Fin n) (e : Fin 23) : Int :=
  ssSumFin (fun j : Fin n =>
    if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0)

/-- Upward neighbors of vertex `i` carrying edge flag `e : Fin 23`. -/
def sseD2UpDegOf {n : Nat} (A : Fin n → Fin n → Bool) (depth : Fin n → Nat)
    (eFlag : Fin n → Fin n → Fin 23) (i : Fin n) (e : Fin 23) : Int :=
  ssSumFin (fun j : Fin n =>
    if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0)

private theorem sse_d2_subgraph_core {n : Nat}
    (A : Fin n → Fin n → Bool) (hSym : ∀ i j : Fin n, A i j = A j i)
    (depth : Fin n → Nat) (st2 : Fin n → Fin 19) (eFlag : Fin n → Fin n → Fin 23)
    (hFlagSym : ∀ i j : Fin n, A i j = true → eFlag i j = eFlag j i)
    (hBip : ∀ i j : Fin n, A i j = true → depth j = depth i + 1 ∨ depth i = depth j + 1)
    (hDown : ∀ (i : Fin n) (e : Fin 23), sseD2DownDegOf A depth eFlag i e ≤ Int.ofNat (sseD2DownMult (st2 i) e))
    (hUp : ∀ (i : Fin n) (e : Fin 23), sseD2UpDegOf A depth eFlag i e ≤ Int.ofNat (sseD2UpMult (st2 i) e))
    (x : Fin n → Int) :
    33670000 * ssQuadForm A x ≤ 387141227 * ssNormSq x ∧
    -(33670000 * ssQuadForm A x) ≤ 387141227 * ssNormSq x := by
  have hPos : ∀ i j : Fin n, 0 < sseD2WeightInt depth eFlag i j := by
    intro i j; unfold sseD2WeightInt
    if hu : depth j = depth i + 1 then rw [sse_ite_pos hu]; exact (sse_d2_weights_pos_and_rec.2.1 _).1
    else
      rw [sse_ite_neg hu]
      if hd : depth i = depth j + 1 then rw [sse_ite_pos hd]; exact (sse_d2_weights_pos_and_rec.2.1 _).2.1
      else rw [sse_ite_neg hd]; exact sse_d2_weights_pos_and_rec.1
  have hRec : ∀ i j : Fin n, A i j = true →
      sseD2WeightInt depth eFlag i j * sseD2WeightInt depth eFlag j i = sseD2CommonD * sseD2CommonD := by
    intro i j hA; unfold sseD2WeightInt
    have hfs := hFlagSym i j hA
    cases hBip i j hA with
    | inl hUpJ =>
      have hNotDn : ¬ (depth i = depth j + 1) := by omega
      rw [sse_ite_pos hUpJ, sse_ite_neg hNotDn, sse_ite_pos hUpJ, ← hfs]
      exact (sse_d2_weights_pos_and_rec.2.1 _).2.2
    | inr hDnJ =>
      have hNotUp : ¬ (depth j = depth i + 1) := by omega
      rw [sse_ite_neg hNotUp, sse_ite_pos hDnJ, sse_ite_pos hDnJ, ← hfs, Int.mul_comm]
      exact (sse_d2_weights_pos_and_rec.2.1 _).2.2
  have hRow : ∀ i : Fin n, ssRowSumInt A (sseD2WeightInt depth eFlag) i ≤ sseD2CommonM := by
    intro i
    have hPt : ∀ j : Fin n,
        (if A i j = true then sseD2WeightInt depth eFlag i j else 0) =
        ssSumFin (fun e : Fin 23 =>
          (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e) +
        ssSumFin (fun e : Fin 23 =>
          (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e) := by
      intro j
      if hA : A i j = true then
        rw [sse_ite_pos hA]; unfold sseD2WeightInt
        cases hBip i j hA with
        | inl hUpJ =>
          have hNotDn : ¬ (depth i = depth j + 1) := by omega
          rw [sse_ite_pos hUpJ]
          have hZ : ssSumFin (fun e : Fin 23 =>
              (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e) = 0 := by
            have h0 : (fun e : Fin 23 =>
                (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e) =
              (fun _ : Fin 23 => (0 : Int)) := by
              funext e; rw [sse_ite_pos hA, sse_ite_neg hNotDn, Int.zero_mul]
            rw [h0, sse_ssSumFin_zero]
          have hU : ssSumFin (fun e : Fin 23 =>
              (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e) =
              sseD2WeightUp (eFlag i j) := by
            have h1 : (fun e : Fin 23 =>
                (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e) =
              (fun e : Fin 23 => if eFlag i j = e then sseD2WeightUp e else 0) := by
              funext e; rw [sse_ite_pos hA, sse_ite_pos hUpJ]
              if he : eFlag i j = e then rw [sse_ite_pos he, sse_ite_pos he, Int.one_mul]
              else rw [sse_ite_neg he, sse_ite_neg he, Int.zero_mul]
            rw [h1, sse_ssSumFin_kronecker]
          rw [hZ, hU, Int.zero_add]
        | inr hDnJ =>
          have hNotUp : ¬ (depth j = depth i + 1) := by omega
          rw [sse_ite_neg hNotUp, sse_ite_pos hDnJ]
          have hZ : ssSumFin (fun e : Fin 23 =>
              (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e) = 0 := by
            have h0 : (fun e : Fin 23 =>
                (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e) =
              (fun _ : Fin 23 => (0 : Int)) := by
              funext e; rw [sse_ite_pos hA, sse_ite_neg hNotUp, Int.zero_mul]
            rw [h0, sse_ssSumFin_zero]
          have hD : ssSumFin (fun e : Fin 23 =>
              (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e) =
              sseD2WeightDn (eFlag i j) := by
            have h1 : (fun e : Fin 23 =>
                (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e) =
              (fun e : Fin 23 => if eFlag i j = e then sseD2WeightDn e else 0) := by
              funext e; rw [sse_ite_pos hA, sse_ite_pos hDnJ]
              if he : eFlag i j = e then rw [sse_ite_pos he, sse_ite_pos he, Int.one_mul]
              else rw [sse_ite_neg he, sse_ite_neg he, Int.zero_mul]
            rw [h1, sse_ssSumFin_kronecker]
          rw [hD, hZ, Int.add_zero]
      else
        rw [sse_ite_neg hA]
        have hZ1 : (fun e : Fin 23 =>
            (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e) =
          (fun _ : Fin 23 => (0 : Int)) := funext (fun _ => by rw [sse_ite_neg hA, Int.zero_mul])
        have hZ2 : (fun e : Fin 23 =>
            (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e) =
          (fun _ : Fin 23 => (0 : Int)) := funext (fun _ => by rw [sse_ite_neg hA, Int.zero_mul])
        rw [hZ1, hZ2, sse_ssSumFin_zero]; omega
    have hEq : ssRowSumInt A (sseD2WeightInt depth eFlag) i =
        ssSumFin (fun e : Fin 23 => sseD2DownDegOf A depth eFlag i e * sseD2WeightDn e) +
        ssSumFin (fun e : Fin 23 => sseD2UpDegOf A depth eFlag i e * sseD2WeightUp e) := by
      unfold ssRowSumInt
      have hS1 := sse_ssSumFin_swap (fun (j : Fin n) (e : Fin 23) =>
        (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e)
      have hS2 := sse_ssSumFin_swap (fun (j : Fin n) (e : Fin 23) =>
        (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e)
      have h1 : (fun e : Fin 23 => ssSumFin (fun j : Fin n =>
          (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e)) =
        (fun e : Fin 23 => sseD2DownDegOf A depth eFlag i e * sseD2WeightDn e) :=
        funext (fun e => sse_ssSumFin_mul_right _ _)
      have h2 : (fun e : Fin 23 => ssSumFin (fun j : Fin n =>
          (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e)) =
        (fun e : Fin 23 => sseD2UpDegOf A depth eFlag i e * sseD2WeightUp e) :=
        funext (fun e => sse_ssSumFin_mul_right _ _)
      rw [funext hPt, sse_ssSumFin_add, hS1, hS2, h1, h2]
    rw [hEq]
    have hLeDn : ssSumFin (fun e : Fin 23 => sseD2DownDegOf A depth eFlag i e * sseD2WeightDn e) ≤
        ssSumFin (fun e : Fin 23 => Int.ofNat (sseD2DownMult (st2 i) e) * sseD2WeightDn e) :=
      sse_ssSumFin_le _ _ (fun e => sse_int_mul_le_right _ _ _ (hDown i e) (by have := (sse_d2_weights_pos_and_rec.2.1 e).2.1; omega))
    have hLeUp : ssSumFin (fun e : Fin 23 => sseD2UpDegOf A depth eFlag i e * sseD2WeightUp e) ≤
        ssSumFin (fun e : Fin 23 => Int.ofNat (sseD2UpMult (st2 i) e) * sseD2WeightUp e) :=
      sse_ssSumFin_le _ _ (fun e => sse_int_mul_le_right _ _ _ (hUp i e) (by have := (sse_d2_weights_pos_and_rec.2.1 e).1; omega))
    have hMax := sse_d2_weights_pos_and_rec.2.2.1 (st2 i)
    omega
  have hB := thm_ss_finite_reciprocal_schur_bound A hSym sseD2CommonD sse_d2_weights_pos_and_rec.1
    (sseD2WeightInt depth eFlag) hPos hRec sseD2CommonM hRow x
  have hKPos : (0 : Int) < 47162543926348421364142572257300990294016042300 := by decide
  obtain ⟨hDK, hMK⟩ := sse_d2_weights_pos_and_rec.2.2.2
  constructor
  · apply sse_int_le_of_mul_le_right _ _ _ hKPos
    rw [sse_int_mul_right_comm 33670000, hDK, sse_int_mul_right_comm 387141227, hMK]; exact hB.1
  · apply sse_int_le_of_mul_le_right _ _ _ hKPos
    rw [Int.neg_mul, sse_int_mul_right_comm 33670000, hDK, sse_int_mul_right_comm 387141227, hMK]; exact hB.2.1

/-- Concrete `R = 1` ball (`Fin 25`) Depth-2 state and edge-flag assignment (center `0`, leaves `1`, flag `0`). -/
def sseBall1St2 (i : Fin 25) : Fin 19 := if i.val == 0 then ⟨0, by decide⟩ else ⟨1, by decide⟩
def sseBall1Flag (_ _ : Fin 25) : Fin 23 := ⟨0, by decide⟩

private theorem sse_ball1_d2_structural :
    (∀ i j : Fin 25, ssBall1Adj i j = ssBall1Adj j i) ∧
    (∀ i j : Fin 25, ssBall1Adj i j = true → sseBall1Flag i j = sseBall1Flag j i) ∧
    (∀ i j : Fin 25, ssBall1Adj i j = true →
      ssBall1Depth j = ssBall1Depth i + 1 ∨ ssBall1Depth i = ssBall1Depth j + 1) ∧
    (∀ (i : Fin 25) (e : Fin 23),
      sseD2DownDegOf ssBall1Adj ssBall1Depth sseBall1Flag i e ≤ Int.ofNat (sseD2DownMult (sseBall1St2 i) e)) ∧
    (∀ (i : Fin 25) (e : Fin 23),
      sseD2UpDegOf ssBall1Adj ssBall1Depth sseBall1Flag i e ≤ Int.ofNat (sseD2UpMult (sseBall1St2 i) e)) := by
  decide

/-- Headline Theorem 5 (End-to-End Structural Depth-2 RACG Subgraph Operator-Norm Bound + `R = 1` Non-Vacuity):
    1. On ANY finite symmetric bipartite graph `(Fin n, A, depth, st2, eFlag)` obeying the Depth-2 flag
       multiplicity bounds `sseD2DownMult` / `sseD2UpMult`, EVERY vector `x : Fin n → Int` satisfies
       `33670000 * |⟨x, A x⟩| ≤ 387141227 * ⟨x, x⟩` via `thm_ss_finite_reciprocal_schur_bound`!
    2. Concrete non-vacuity instantiation on the 25-vertex `R = 1` ball (`ssBall1Adj`, center state `0`,
       24 leaves state `1`, edge flag `0`). -/
theorem thm_sse_depth2_subgraph_schur_bound :
    (∀ {n : Nat} (A : Fin n → Fin n → Bool) (_hSym : ∀ i j : Fin n, A i j = A j i)
       (depth : Fin n → Nat) (st2 : Fin n → Fin 19) (eFlag : Fin n → Fin n → Fin 23)
       (_hFlagSym : ∀ i j : Fin n, A i j = true → eFlag i j = eFlag j i)
       (_hBip : ∀ i j : Fin n, A i j = true → depth j = depth i + 1 ∨ depth i = depth j + 1)
       (_hDown : ∀ (i : Fin n) (e : Fin 23), sseD2DownDegOf A depth eFlag i e ≤ Int.ofNat (sseD2DownMult (st2 i) e))
       (_hUp : ∀ (i : Fin n) (e : Fin 23), sseD2UpDegOf A depth eFlag i e ≤ Int.ofNat (sseD2UpMult (st2 i) e))
       (x : Fin n → Int),
       33670000 * ssQuadForm A x ≤ 387141227 * ssNormSq x ∧
       -(33670000 * ssQuadForm A x) ≤ 387141227 * ssNormSq x) ∧
    (∀ x : Fin 25 → Int,
       33670000 * ssQuadForm ssBall1Adj x ≤ 387141227 * ssNormSq x ∧
       -(33670000 * ssQuadForm ssBall1Adj x) ≤ 387141227 * ssNormSq x) :=
  ⟨fun A hSym depth st2 eFlag hFS hB hD hU x => sse_d2_subgraph_core A hSym depth st2 eFlag hFS hB hD hU x,
   fun x => sse_d2_subgraph_core ssBall1Adj sse_ball1_d2_structural.1 ssBall1Depth sseBall1St2 sseBall1Flag
     sse_ball1_d2_structural.2.1 sse_ball1_d2_structural.2.2.1
     sse_ball1_d2_structural.2.2.2.1 sse_ball1_d2_structural.2.2.2.2 x⟩


/-! ## Section 5: Exact `Q_3 = Adj(0)` 3-Cube Link Algebra & Zero-Cascade Upward Insertion -/

/-- Exact Cartier-Foata forbidden predicate `x ∈ C ∪ CommonAdj(C)` directly from `adj24`. -/
def sseInForbClique (c : SseClique) (x : Fin 24) : Bool :=
  match c with
  | SseClique.c1 a => decide (x = a) || adj24 a x
  | SseClique.c2 a b => decide (x = a ∨ x = b) || (adj24 a x && adj24 b x)
  | SseClique.c3 a b c => decide (x = a ∨ x = b ∨ x = c) || (adj24 a x && adj24 b x && adj24 c x)

/-- Exact Cartier-Foata allowed-next relation `C_2 ⊆ F(C_1) = V \ (C_1 ∪ CommonAdj(C_1))` directly from `adj24`. -/
def sseCanFollowClique (c1 c2 : SseClique) : Bool :=
  match c2 with
  | SseClique.c1 x => !(sseInForbClique c1 x)
  | SseClique.c2 x y => !(sseInForbClique c1 x) && !(sseInForbClique c1 y)
  | SseClique.c3 x y z => !(sseInForbClique c1 x) && !(sseInForbClique c1 y) && !(sseInForbClique c1 z)

def sseCanFollow216 (i j : Fin 216) : Bool := sseCanFollowClique (sseClique216 i) (sseClique216 j)

private def sse_inForbFast (c : SseClique) (x : Fin 24) : Bool :=
  match c with
  | SseClique.c1 a => decide (x = a) || sse_adjFast a.val x.val
  | SseClique.c2 a b => decide (x = a ∨ x = b) || (sse_adjFast a.val x.val && sse_adjFast b.val x.val)
  | SseClique.c3 a b c => decide (x = a ∨ x = b ∨ x = c) || (sse_adjFast a.val x.val && sse_adjFast b.val x.val && sse_adjFast c.val x.val)

private theorem sse_inForb_eq_fast (c : SseClique) (x : Fin 24) :
    sseInForbClique c x = sse_inForbFast c x := by
  cases c <;> simp only [sseInForbClique, sse_inForbFast, sse_adj24_eq_fast]

private def sse_canFollowFast (i j : Fin 216) : Bool :=
  match sseClique216 j with
  | SseClique.c1 x => !(sse_inForbFast (sseClique216 i) x)
  | SseClique.c2 x y => !(sse_inForbFast (sseClique216 i) x) && !(sse_inForbFast (sseClique216 i) y)
  | SseClique.c3 x y z => !(sse_inForbFast (sseClique216 i) x) && !(sse_inForbFast (sseClique216 i) y) && !(sse_inForbFast (sseClique216 i) z)

private theorem sse_canFollow216_eq_fast (i j : Fin 216) : sseCanFollow216 i j = sse_canFollowFast i j := by
  unfold sseCanFollow216 sseCanFollowClique sse_canFollowFast
  cases sseClique216 j <;> simp only [sse_inForb_eq_fast]

private theorem sse_inForb_wf4Gen (k : Fin 4) (c : SseClique) (x : Fin 24) :
    sseInForbClique (sseActCliqueGen k c) (sseWF4Gen k x) = sseInForbClique c x := by
  have hInj : ∀ u v : Fin 24, (sseWF4Gen k u = sseWF4Gen k v) ↔ (u = v) := fun u v =>
    ⟨fun h => by have h' := congrArg (sseWF4Gen k) h; rw [sse_wf4Gen_inv, sse_wf4Gen_inv] at h'; exact h',
     fun h => congrArg (sseWF4Gen k) h⟩
  cases c with
  | c1 a =>
    simp only [sseActCliqueGen, sseInForbClique, sse_wf4Gen_preserves_adj24]
    have hd : decide (sseWF4Gen k x = sseWF4Gen k a) = decide (x = a) := by
      if h : x = a then rw [decide_eq_true ((hInj x a).2 h), decide_eq_true h]
      else rw [decide_eq_false (fun h' => h ((hInj x a).1 h')), decide_eq_false h]
    rw [hd]
  | c2 a b =>
    unfold sseActCliqueGen; dsimp only
    rcases sse_sort2Fin_cases (sseWF4Gen k a) (sseWF4Gen k b) with hs | hs <;> rw [hs] <;>
      simp only [sseInForbClique, sse_wf4Gen_preserves_adj24]
    · have hd : decide (sseWF4Gen k x = sseWF4Gen k a ∨ sseWF4Gen k x = sseWF4Gen k b) = decide (x = a ∨ x = b) := by
        if h : x = a ∨ x = b then
          rw [decide_eq_true h, decide_eq_true (h.elim (fun h1 => Or.inl ((hInj _ _).2 h1)) (fun h2 => Or.inr ((hInj _ _).2 h2)))]
        else
          rw [decide_eq_false h, decide_eq_false (fun h' => h (h'.elim (fun h1 => Or.inl ((hInj _ _).1 h1)) (fun h2 => Or.inr ((hInj _ _).1 h2))))]
      rw [hd]
    · have hd : decide (sseWF4Gen k x = sseWF4Gen k b ∨ sseWF4Gen k x = sseWF4Gen k a) = decide (x = a ∨ x = b) := by
        if h : x = a ∨ x = b then
          rw [decide_eq_true h, decide_eq_true (h.elim (fun h1 => Or.inr ((hInj _ _).2 h1)) (fun h2 => Or.inl ((hInj _ _).2 h2)))]
        else
          rw [decide_eq_false h, decide_eq_false (fun h' => h (h'.elim (fun h1 => Or.inr ((hInj _ _).1 h1)) (fun h2 => Or.inl ((hInj _ _).1 h2))))]
      rw [hd, Bool.and_comm]
  | c3 a b c =>
    have hEq3 : ∀ p q r : Fin 24,
        (∀ y : Fin 24, (y = p ∨ y = q ∨ y = r) ↔ (y = sseWF4Gen k a ∨ y = sseWF4Gen k b ∨ y = sseWF4Gen k c)) →
        ((adj24 p (sseWF4Gen k x) && adj24 q (sseWF4Gen k x) && adj24 r (sseWF4Gen k x)) =
         (adj24 (sseWF4Gen k a) (sseWF4Gen k x) && adj24 (sseWF4Gen k b) (sseWF4Gen k x) && adj24 (sseWF4Gen k c) (sseWF4Gen k x))) →
        sseInForbClique (SseClique.c3 p q r) (sseWF4Gen k x) = sseInForbClique (SseClique.c3 a b c) x := by
      intro p q r hOr hAnd
      simp only [sseInForbClique, hAnd, sse_wf4Gen_preserves_adj24]
      have hd : decide (sseWF4Gen k x = p ∨ sseWF4Gen k x = q ∨ sseWF4Gen k x = r) = decide (x = a ∨ x = b ∨ x = c) := by
        if h : x = a ∨ x = b ∨ x = c then
          rw [decide_eq_true h, decide_eq_true ((hOr (sseWF4Gen k x)).2
            (h.elim (fun h1 => Or.inl ((hInj _ _).2 h1))
                    (fun h2 => Or.inr (h2.elim (fun h3 => Or.inl ((hInj _ _).2 h3)) (fun h4 => Or.inr ((hInj _ _).2 h4))))))]
        else
          rw [decide_eq_false h, decide_eq_false (fun h' => h (((hOr (sseWF4Gen k x)).1 h').elim
            (fun h1 => Or.inl ((hInj _ _).1 h1))
            (fun h2 => Or.inr (h2.elim (fun h3 => Or.inl ((hInj _ _).1 h3)) (fun h4 => Or.inr ((hInj _ _).1 h4))))))]
      rw [hd]
    unfold sseActCliqueGen; dsimp only
    rcases sse_sort3Fin_cases (sseWF4Gen k a) (sseWF4Gen k b) (sseWF4Gen k c) with hs | hs | hs | hs | hs | hs <;> rw [hs] <;> dsimp only
    · exact hEq3 _ _ _ (fun _ => Iff.rfl) rfl
    · exact hEq3 _ _ _ (fun y => ⟨fun h => by rcases h with rfl | rfl | rfl <;> simp, fun h => by rcases h with rfl | rfl | rfl <;> simp⟩)
        (by cases adj24 (sseWF4Gen k a) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k b) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k c) (sseWF4Gen k x) <;> rfl)
    · exact hEq3 _ _ _ (fun y => ⟨fun h => by rcases h with rfl | rfl | rfl <;> simp, fun h => by rcases h with rfl | rfl | rfl <;> simp⟩)
        (by cases adj24 (sseWF4Gen k a) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k b) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k c) (sseWF4Gen k x) <;> rfl)
    · exact hEq3 _ _ _ (fun y => ⟨fun h => by rcases h with rfl | rfl | rfl <;> simp, fun h => by rcases h with rfl | rfl | rfl <;> simp⟩)
        (by cases adj24 (sseWF4Gen k a) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k b) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k c) (sseWF4Gen k x) <;> rfl)
    · exact hEq3 _ _ _ (fun y => ⟨fun h => by rcases h with rfl | rfl | rfl <;> simp, fun h => by rcases h with rfl | rfl | rfl <;> simp⟩)
        (by cases adj24 (sseWF4Gen k a) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k b) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k c) (sseWF4Gen k x) <;> rfl)
    · exact hEq3 _ _ _ (fun y => ⟨fun h => by rcases h with rfl | rfl | rfl <;> simp, fun h => by rcases h with rfl | rfl | rfl <;> simp⟩)
        (by cases adj24 (sseWF4Gen k a) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k b) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k c) (sseWF4Gen k x) <;> rfl)

private theorem sse_canFollow216_wf4Gen (k : Fin 4) (i j : Fin 216) :
    sseCanFollow216 (sseAct216Gen k i) (sseAct216Gen k j) = sseCanFollow216 i j := by
  unfold sseCanFollow216
  rw [sse_act216Gen_compat, sse_act216Gen_compat]
  generalize sseClique216 i = c1
  cases sseClique216 j with
  | c1 x =>
    change sseCanFollowClique (sseActCliqueGen k c1) (SseClique.c1 (sseWF4Gen k x)) = _
    dsimp only [sseCanFollowClique]
    rw [sse_inForb_wf4Gen]
  | c2 x y =>
    change sseCanFollowClique (sseActCliqueGen k c1)
        (SseClique.c2 (sseSort2Fin (sseWF4Gen k x) (sseWF4Gen k y)).1 (sseSort2Fin (sseWF4Gen k x) (sseWF4Gen k y)).2) = _
    rcases sse_sort2Fin_cases (sseWF4Gen k x) (sseWF4Gen k y) with hs | hs <;> rw [hs] <;> dsimp only [sseCanFollowClique]
    · rw [sse_inForb_wf4Gen, sse_inForb_wf4Gen]
    · rw [sse_inForb_wf4Gen, sse_inForb_wf4Gen, Bool.and_comm]
  | c3 x y z =>
    change sseCanFollowClique (sseActCliqueGen k c1)
        (SseClique.c3 (sseSort3Fin (sseWF4Gen k x) (sseWF4Gen k y) (sseWF4Gen k z)).1
                      (sseSort3Fin (sseWF4Gen k x) (sseWF4Gen k y) (sseWF4Gen k z)).2.1
                      (sseSort3Fin (sseWF4Gen k x) (sseWF4Gen k y) (sseWF4Gen k z)).2.2) = _
    rcases sse_sort3Fin_cases (sseWF4Gen k x) (sseWF4Gen k y) (sseWF4Gen k z) with hs | hs | hs | hs | hs | hs <;>
      rw [hs] <;> dsimp only [sseCanFollowClique] <;>
      rw [sse_inForb_wf4Gen, sse_inForb_wf4Gen, sse_inForb_wf4Gen] <;>
      (cases sseInForbClique c1 x <;> cases sseInForbClique c1 y <;> cases sseInForbClique c1 z <;> rfl)

private theorem sse_canFollow216_wf4 (w : List (Fin 4)) (i j : Fin 216) :
    sseCanFollow216 (sseAct216 w i) (sseAct216 w j) = sseCanFollow216 i j := by
  induction w with | nil => rfl | cons k rest ih => simp only [sseAct216, sse_canFollow216_wf4Gen, ih]

/-- Singleton clique `{0}` in `Fin 216`. -/
def sseIdx0 : Fin 216 := ⟨0, by decide⟩

/-- `Q_3 = Adj(0)` clique membership predicate directly from `isWallFacet` (`adj24 0`). -/
def sseIsQ3 (i : Fin 216) : Bool :=
  match sseClique216 i with
  | SseClique.c1 a => isWallFacet a
  | SseClique.c2 a b => isWallFacet a && isWallFacet b
  | SseClique.c3 a b c => isWallFacet a && isWallFacet b && isWallFacet c

/-- Exact insertion `J ↦ J ∪ {0}` on `Q_3 = Adj(0)` cliques inside `Fin 216`. -/
def sseAdd0 (i : Fin 216) : Fin 216 :=
  let v : Nat := match i.val with
  | 4 => 24
  | 5 => 25
  | 8 => 26
  | 9 => 27
  | 12 => 28
  | 13 => 29
  | 16 => 30
  | 17 => 31
  | 56 => 120
  | 57 => 121
  | 58 => 122
  | 62 => 123
  | 63 => 124
  | 64 => 125
  | 80 => 126
  | 84 => 127
  | 96 => 128
  | 97 => 129
  | 100 => 130
  | 101 => 131
    | _ => i.val
  if h : v < 216 then ⟨v, h⟩ else i

/-- Canonical `Q_3` clique representative by size: `4` (`[4]`) for size 1, `56` (`[4, 8]`) for size 2. -/
def sseCanonQ3OfSize : Nat → Fin 216
  | 1 => ⟨4, by decide⟩
  | _ => ⟨56, by decide⟩

/-- Explicit `Stab_{W(F_4)}(0)` word mapping each `Q_3` clique onto `[4]` or `[4, 8]`. -/
def sseStab0Q3Word (i : Fin 216) : List (Fin 4) :=
  sseNatWordToFin4 (match i.val with
  | 4 => []
  | 5 => [1, 2, 1]
  | 8 => [1]
  | 9 => [1, 2]
  | 12 => [1, 2, 3]
  | 13 => [1, 2, 3, 1, 2, 1]
  | 16 => [1, 2, 3, 1]
  | 17 => [1, 2, 3, 1, 2]
  | 56 => []
  | 57 => [2]
  | 58 => [2, 3]
  | 62 => [2, 1]
  | 63 => [2, 1, 2]
  | 64 => [2, 3, 1, 2, 1]
  | 80 => [2, 3, 1]
  | 84 => [2, 3, 1, 2]
  | 96 => [2, 1, 2, 3]
  | 97 => [2, 1, 2, 3, 2]
  | 100 => [2, 1, 2, 3, 2, 1]
  | 101 => [2, 1, 2, 3, 2, 1, 2]
    | _ => [])

/-- Explicit 20-element list of all `Q_3 = Adj(0)` cliques (kernel-verified equal to `{j | sseIsQ3 j = true}`). -/
def sseQ3List : List (Fin 216) := [⟨4, by decide⟩, ⟨5, by decide⟩, ⟨8, by decide⟩, ⟨9, by decide⟩, ⟨12, by decide⟩, ⟨13, by decide⟩, ⟨16, by decide⟩, ⟨17, by decide⟩, ⟨56, by decide⟩, ⟨57, by decide⟩, ⟨58, by decide⟩, ⟨62, by decide⟩, ⟨63, by decide⟩, ⟨64, by decide⟩, ⟨80, by decide⟩, ⟨84, by decide⟩, ⟨96, by decide⟩, ⟨97, by decide⟩, ⟨100, by decide⟩, ⟨101, by decide⟩]

private def sse_add0SpecBool (j : Fin 216) : Bool :=
  match sseClique216 j with
  | SseClique.c1 a => decide (sseClique216 (sseAdd0 j) = SseClique.c2 sse_v0 a)
  | SseClique.c2 a b => decide (sseClique216 (sseAdd0 j) = SseClique.c3 sse_v0 a b)
  | SseClique.c3 _ _ _ => false

private theorem sse_isQ3_wall_and_counts_fast :
    ((List.finRange 24).filter isWallFacet).length = 8 ∧
    ((List.finRange 24).filter isWallFacet).all (fun a =>
      decide (((List.finRange 24).filter (fun b => isWallFacet b && adj24 a b)).length = 3)) = true ∧
    wallCliques2.length = 12 ∧
    (sse_sumPow2 (fun k => if h : k < 216 then if sseIsQ3 ⟨k, h⟩ = true then 1 else 0 else 0) 8 0 = 20) ∧
    (sse_sumPow2 (fun k => if h : k < 216 then if (sseIsQ3 ⟨k, h⟩ && decide (sseSize216 ⟨k, h⟩ = 1)) = true then 1 else 0 else 0) 8 0 = 8) ∧
    (sse_sumPow2 (fun k => if h : k < 216 then if (sseIsQ3 ⟨k, h⟩ && decide (sseSize216 ⟨k, h⟩ = 2)) = true then 1 else 0 else 0) 8 0 = 12) ∧
    (sse_sumPow2 (fun k => if h : k < 216 then if (sseIsQ3 ⟨k, h⟩ && decide (sseSize216 ⟨k, h⟩ = 3)) = true then 1 else 0 else 0) 8 0 = 0) ∧
    (sse_allPow2 (fun k => if h : k < 216 then
      let j : Fin 216 := ⟨k, h⟩
      decide (sseQ3List.any (fun x => decide (x = j)) = sseIsQ3 j) &&
      (!(sseIsQ3 j) || (decide (sseApplyWord (sseStab0Q3Word j) sse_v0 = sse_v0) &&
                        decide (sseAct216 (sseStab0Q3Word j) j = sseCanonQ3OfSize (sseSize216 j)) &&
                        sse_add0SpecBool j)) &&
      (!(sse_canFollowFast j sseIdx0) || !(sseIsQ3 j))
    else true) 8 0 = true) := by
  decide

private theorem sse_q3_212_pairs_and_zero_cascade_fast :
    sseQ3List.length = 20 ∧
    (sseQ3List.foldl (fun acc j1 => acc + (sseQ3List.filter (fun j2 => sse_canFollowFast j1 j2)).length) 0 = 212) ∧
    (sseQ3List.all (fun j1 => sseQ3List.all (fun j2 =>
      !(sse_canFollowFast j1 j2) || sse_canFollowFast (sseAdd0 j1) j2)) = true) ∧
    (sse_allPow2 (fun k => if h : k < 216 then
      let c : Fin 216 := ⟨k, h⟩
      !(sse_canFollowFast c sseIdx0) ||
        sseQ3List.all (fun j => !(sse_canFollowFast c j) || sse_canFollowFast c (sseAdd0 j))
    else true) 8 0 = true) := by
  decide

private theorem sse_q3_counts :
    (sseSumFinNat (fun i : Fin 216 => if sseIsQ3 i = true then 1 else 0) = 20) ∧
    (sseSumFinNat (fun i : Fin 216 => if (sseIsQ3 i && decide (sseSize216 i = 1)) = true then 1 else 0) = 8) ∧
    (sseSumFinNat (fun i : Fin 216 => if (sseIsQ3 i && decide (sseSize216 i = 2)) = true then 1 else 0) = 12) ∧
    (sseSumFinNat (fun i : Fin 216 => if (sseIsQ3 i && decide (sseSize216 i = 3)) = true then 1 else 0) = 0) := by
  refine ⟨?_, ?_, ?_, ?_⟩
  · rw [sse_sumFinNat_eq_sumPow2 8 (by decide)]; exact sse_isQ3_wall_and_counts_fast.2.2.2.1
  · rw [sse_sumFinNat_eq_sumPow2 8 (by decide)]; exact sse_isQ3_wall_and_counts_fast.2.2.2.2.1
  · rw [sse_sumFinNat_eq_sumPow2 8 (by decide)]; exact sse_isQ3_wall_and_counts_fast.2.2.2.2.2.1
  · rw [sse_sumFinNat_eq_sumPow2 8 (by decide)]; exact sse_isQ3_wall_and_counts_fast.2.2.2.2.2.2.1

private theorem sse_q3_all_props (j : Fin 216) :
    (sseQ3List.any (fun x => decide (x = j)) = sseIsQ3 j) ∧
    (sseIsQ3 j = true →
      sseApplyWord (sseStab0Q3Word j) sse_v0 = sse_v0 ∧
      sseAct216 (sseStab0Q3Word j) j = sseCanonQ3OfSize (sseSize216 j) ∧
      sse_add0SpecBool j = true) ∧
    (sse_canFollowFast j sseIdx0 = true → sseIsQ3 j = false) := by
  have h := sse_allPow2_sound _ 8 0 sse_isQ3_wall_and_counts_fast.2.2.2.2.2.2.2 j.val (Nat.zero_le _) (by have := j.isLt; omega)
  rw [dite_eq_left j.isLt] at h; dsimp only at h; simp only [Bool.and_eq_true] at h
  refine ⟨of_decide_eq_true h.1.1, ?_, ?_⟩
  · intro hQ
    have h2 := h.1.2; rw [hQ] at h2; simp only [Bool.not_true, Bool.false_or, Bool.and_eq_true] at h2
    exact ⟨of_decide_eq_true h2.1.1, of_decide_eq_true h2.1.2, h2.2⟩
  · intro hF
    have h3 := h.2; rw [hF] at h3; simp only [Bool.not_true, Bool.false_or, Bool.not_eq_true'] at h3
    exact h3

private theorem sse_q3_size_1_or_2 (j : Fin 216) (hQ : sseIsQ3 j = true) :
    sseSize216 j = 1 ∨ sseSize216 j = 2 := by
  have h3 := ((sse_q3_all_props j).2.1 hQ).2.2
  unfold sse_add0SpecBool at h3; unfold sseSize216
  cases hcj : sseClique216 j <;> rw [hcj] at h3
  · exact Or.inl rfl
  · exact Or.inr rfl
  · dsimp only at h3; exact absurd h3 (by decide)

private theorem sse_list_all_of_any {α : Type} [DecidableEq α] (l : List α) (p : α → Bool)
    (h : l.all p = true) {x : α} (hx : l.any (fun y => decide (y = x)) = true) : p x = true := by
  induction l with
  | nil => simp [List.any] at hx
  | cons y ys ih =>
    simp only [List.all, Bool.and_eq_true] at h
    simp only [List.any, Bool.or_eq_true] at hx
    cases hx with
    | inl hy => have heq : y = x := of_decide_eq_true hy; rw [← heq]; exact h.1
    | inr hys => exact ih h.2 hys

private theorem sse_canFollow_c_add0 (c j : Fin 216)
    (h0 : sseCanFollow216 c sseIdx0 = true) (hQ : sseIsQ3 j = true) (hJ : sseCanFollow216 c j = true) :
    sseCanFollow216 c (sseAdd0 j) = true := by
  rw [sse_canFollow216_eq_fast] at h0 hJ ⊢
  have h1 := sse_allPow2_sound _ 8 0 sse_q3_212_pairs_and_zero_cascade_fast.2.2.2 c.val (Nat.zero_le _) (by have := c.isLt; omega)
  rw [dite_eq_left c.isLt] at h1
  change (!(sse_canFollowFast c sseIdx0) || sseQ3List.all (fun j => !(sse_canFollowFast c j) || sse_canFollowFast c (sseAdd0 j))) = true at h1
  rw [h0] at h1; simp only [Bool.not_true, Bool.false_or] at h1
  have hAny : sseQ3List.any (fun x => decide (x = j)) = true := by rw [(sse_q3_all_props j).1, hQ]
  have h2 := sse_list_all_of_any sseQ3List _ h1 hAny
  rw [hJ] at h2; simp only [Bool.not_true, Bool.false_or] at h2
  exact h2

private theorem sse_zero_cascade (j1 j2 : Fin 216)
    (h1 : sseIsQ3 j1 = true) (h2 : sseIsQ3 j2 = true) (hF : sseCanFollow216 j1 j2 = true) :
    sseCanFollow216 (sseAdd0 j1) j2 = true := by
  rw [sse_canFollow216_eq_fast] at hF ⊢
  have hA1 : sseQ3List.any (fun x => decide (x = j1)) = true := by rw [(sse_q3_all_props j1).1, h1]
  have hA2 : sseQ3List.any (fun x => decide (x = j2)) = true := by rw [(sse_q3_all_props j2).1, h2]
  have ha := sse_list_all_of_any sseQ3List _ sse_q3_212_pairs_and_zero_cascade_fast.2.2.1 hA1
  have hb := sse_list_all_of_any sseQ3List _ ha hA2
  rw [hF] at hb; simp only [Bool.not_true, Bool.false_or] at hb
  exact hb

/-- Symbolic `Stab_{W(F_4)}(0)` invariance of `sseIsQ3` and `sseAdd0`:
    any `W(F_4)` word `w` fixing `0` preserves `Q_3 = Adj(0)`, commutes with `sseAdd0`,
    and fixes `sseIdx0`. -/
private theorem sse_stab0_preserves_q3_and_add0 (w : List (Fin 4))
    (hFix0 : sseApplyWord w sse_v0 = sse_v0) :
    sseAct216 w sseIdx0 = sseIdx0 ∧
    (∀ j : Fin 216, sseIsQ3 (sseAct216 w j) = sseIsQ3 j) ∧
    (∀ j : Fin 216, sseIsQ3 j = true → sseAct216 w (sseAdd0 j) = sseAdd0 (sseAct216 w j)) := by
  have hCliqueWord : ∀ (u : List (Fin 4)) (i : Fin 216) (x : Fin 24),
      (match sseClique216 (sseAct216 u i) with
       | SseClique.c1 a => x = a | SseClique.c2 a b => x = a ∨ x = b | SseClique.c3 a b c => x = a ∨ x = b ∨ x = c) ↔
      (match sseClique216 i with
       | SseClique.c1 a => x = sseApplyWord u a
       | SseClique.c2 a b => x = sseApplyWord u a ∨ x = sseApplyWord u b
       | SseClique.c3 a b c => x = sseApplyWord u a ∨ x = sseApplyWord u b ∨ x = sseApplyWord u c) := by
    intro u; induction u with
    | nil => intro i x; simp only [sseAct216, sseApplyWord]
    | cons k rest ih =>
      intro i x
      simp only [sseAct216, sse_act216Gen_compat]
      have hGen : ∀ (c : SseClique) (y : Fin 24),
          (match sseActCliqueGen k c with
           | SseClique.c1 a => y = a | SseClique.c2 a b => y = a ∨ y = b | SseClique.c3 a b c => y = a ∨ y = b ∨ y = c) ↔
          (match c with
           | SseClique.c1 a => sseWF4Gen k y = a | SseClique.c2 a b => sseWF4Gen k y = a ∨ sseWF4Gen k y = b
           | SseClique.c3 a b c => sseWF4Gen k y = a ∨ sseWF4Gen k y = b ∨ sseWF4Gen k y = c) := by
        intro c y
        have hEqG : ∀ p q : Fin 24, (p = sseWF4Gen k q) ↔ (sseWF4Gen k p = q) := fun p q =>
          ⟨fun h => by rw [h, sse_wf4Gen_inv], fun h => by rw [← h, sse_wf4Gen_inv]⟩
        cases c with
        | c1 a => exact hEqG y a
        | c2 a b =>
          unfold sseActCliqueGen; dsimp only
          rcases sse_sort2Fin_cases (sseWF4Gen k a) (sseWF4Gen k b) with hs | hs <;> rw [hs] <;> dsimp only
          · exact ⟨fun h => h.elim (fun h1 => Or.inl ((hEqG _ _).1 h1)) (fun h2 => Or.inr ((hEqG _ _).1 h2)),
                   fun h => h.elim (fun h1 => Or.inl ((hEqG _ _).2 h1)) (fun h2 => Or.inr ((hEqG _ _).2 h2))⟩
          · exact ⟨fun h => h.elim (fun h1 => Or.inr ((hEqG _ _).1 h1)) (fun h2 => Or.inl ((hEqG _ _).1 h2)),
                   fun h => h.elim (fun h1 => Or.inr ((hEqG _ _).2 h1)) (fun h2 => Or.inl ((hEqG _ _).2 h2))⟩
        | c3 a b c =>
          unfold sseActCliqueGen; dsimp only
          have hLift : ∀ p q r : Fin 24,
              ((y = p ∨ y = q ∨ y = r) ↔ (y = sseWF4Gen k a ∨ y = sseWF4Gen k b ∨ y = sseWF4Gen k c)) →
              ((y = p ∨ y = q ∨ y = r) ↔ (sseWF4Gen k y = a ∨ sseWF4Gen k y = b ∨ sseWF4Gen k y = c)) := by
            intro p q r hP
            refine ⟨fun h => (hP.1 h).elim (fun h1 => Or.inl ((hEqG _ _).1 h1))
                (fun h2 => Or.inr (h2.elim (fun h3 => Or.inl ((hEqG _ _).1 h3)) (fun h4 => Or.inr ((hEqG _ _).1 h4)))),
              fun h => hP.2 (h.elim (fun h1 => Or.inl ((hEqG _ _).2 h1))
                (fun h2 => Or.inr (h2.elim (fun h3 => Or.inl ((hEqG _ _).2 h3)) (fun h4 => Or.inr ((hEqG _ _).2 h4)))))⟩
          rcases sse_sort3Fin_cases (sseWF4Gen k a) (sseWF4Gen k b) (sseWF4Gen k c) with hs | hs | hs | hs | hs | hs <;>
            rw [hs] <;> dsimp only <;> apply hLift <;>
            exact ⟨fun h => by rcases h with rfl | rfl | rfl <;> simp, fun h => by rcases h with rfl | rfl | rfl <;> simp⟩
      rw [hGen, ih i (sseWF4Gen k x)]
      have hEqG : ∀ p q : Fin 24, (sseWF4Gen k p = q) ↔ (p = sseWF4Gen k q) := fun p q =>
        ⟨fun h => by rw [← h, sse_wf4Gen_inv], fun h => by rw [h, sse_wf4Gen_inv]⟩
      cases sseClique216 i <;> simp only [sseApplyWord, hEqG]
  have hSorted : ∀ k : Fin 216,
      match sseClique216 k with
      | SseClique.c1 _ => True
      | SseClique.c2 a b => a.val < b.val
      | SseClique.c3 a b c => a.val < b.val ∧ b.val < c.val := by
    have hFast : sse_allPow2 (fun k => if hk : k < 216 then
        match sse_clique216Nat k with
        | SseClique.c1 _ => true
        | SseClique.c2 a b => decide (a.val < b.val)
        | SseClique.c3 a b c => decide (a.val < b.val) && decide (b.val < c.val)
      else true) 8 0 = true := by decide
    intro k
    have h := sse_allPow2_sound _ 8 0 hFast k.val (Nat.zero_le _) (by have := k.isLt; omega)
    rw [dite_eq_left k.isLt] at h; unfold sseClique216
    cases hck : sse_clique216Nat k.val <;> rw [hck] at h
    · trivial
    · exact of_decide_eq_true h
    · simp only [Bool.and_eq_true] at h; exact ⟨of_decide_eq_true h.1, of_decide_eq_true h.2⟩
  have hInj216 : ∀ i j : Fin 216,
      (∀ x : Fin 24,
        (match sseClique216 i with | SseClique.c1 a => x = a | SseClique.c2 a b => x = a ∨ x = b | SseClique.c3 a b c => x = a ∨ x = b ∨ x = c) ↔
        (match sseClique216 j with | SseClique.c1 a => x = a | SseClique.c2 a b => x = a ∨ x = b | SseClique.c3 a b c => x = a ∨ x = b ∨ x = c)) →
      i = j := by
    intro i j hMem
    apply sse_clique216_inj
    have hi := hSorted i; have hj := hSorted j
    cases hci : sseClique216 i <;> cases hcj : sseClique216 j <;> rw [hci] at hi hMem <;> rw [hcj] at hj hMem
    · exact congrArg SseClique.c1 ((hMem _).1 rfl)
    · rename_i a b c; have h1 := (hMem b).2 (Or.inl rfl); have h2 := (hMem c).2 (Or.inr rfl); subst h1; subst h2; omega
    · rename_i a b c d; have h1 := (hMem b).2 (Or.inl rfl); have h2 := (hMem c).2 (Or.inr (Or.inl rfl)); subst h1; subst h2; omega
    · rename_i a b c; have h1 := (hMem a).1 (Or.inl rfl); have h2 := (hMem b).1 (Or.inr rfl); subst h1; subst h2; omega
    · rename_i a b c d
      have ha := (hMem a).1 (Or.inl rfl); have hb := (hMem b).1 (Or.inr rfl)
      have e1 : a = c := by rcases ha with rfl | rfl <;> rcases hb with rfl | rfl <;> (try rfl) <;> omega
      have e2 : b = d := by
        subst e1
        rcases hb with rfl | rfl
        · omega
        · rfl
      rw [e1, e2]
    · rename_i a b c d e
      have hc := (hMem c).2 (Or.inl rfl); have hd := (hMem d).2 (Or.inr (Or.inl rfl)); have he := (hMem e).2 (Or.inr (Or.inr rfl))
      rcases hc with rfl | rfl <;> rcases hd with rfl | rfl <;> rcases he with rfl | rfl <;> omega
    · rename_i a b c d
      have ha := (hMem a).1 (Or.inl rfl); have hb := (hMem b).1 (Or.inr (Or.inl rfl)); subst ha; subst hb; omega
    · rename_i a b c d e
      have ha := (hMem a).1 (Or.inl rfl); have hb := (hMem b).1 (Or.inr (Or.inl rfl)); have hc := (hMem c).1 (Or.inr (Or.inr rfl))
      rcases ha with rfl | rfl <;> rcases hb with rfl | rfl <;> rcases hc with rfl | rfl <;> omega
    · rename_i a b c d e f
      have ha := (hMem a).1 (Or.inl rfl); have hb := (hMem b).1 (Or.inr (Or.inl rfl)); have hc := (hMem c).1 (Or.inr (Or.inr rfl))
      rcases ha with rfl | rfl | rfl <;> rcases hb with rfl | rfl | rfl <;> rcases hc with rfl | rfl | rfl <;> (try rfl) <;> omega
  have hFixIdx0 : sseAct216 w sseIdx0 = sseIdx0 := by
    apply hInj216; intro x
    rw [hCliqueWord w sseIdx0 x]
    have h0 : sseClique216 sseIdx0 = SseClique.c1 sse_v0 := rfl
    rw [h0]; dsimp only; rw [hFix0]
  have hQ3 : ∀ j : Fin 216, sseIsQ3 (sseAct216 w j) = sseIsQ3 j := by
    intro j
    have hWall : ∀ x : Fin 24, isWallFacet (sseApplyWord w x) = isWallFacet x := by
      intro x
      change adj24 sse_v0 (sseApplyWord w x) = adj24 sse_v0 x
      rw [← sse_applyWord_preserves_adj24 w sse_v0 x, hFix0]
    have hAllWall : ∀ k : Fin 216, sseIsQ3 k = true ↔
        ∀ x : Fin 24,
          (match sseClique216 k with | SseClique.c1 a => x = a | SseClique.c2 a b => x = a ∨ x = b | SseClique.c3 a b c => x = a ∨ x = b ∨ x = c) →
          isWallFacet x = true := by
      intro k; unfold sseIsQ3
      cases sseClique216 k with
      | c1 a => exact ⟨fun h x hx => by rw [hx]; exact h, fun h => h a rfl⟩
      | c2 a b =>
        simp only [Bool.and_eq_true]
        exact ⟨fun ⟨ha, hb⟩ x hx => by rcases hx with rfl | rfl <;> assumption,
               fun h => ⟨h a (Or.inl rfl), h b (Or.inr rfl)⟩⟩
      | c3 a b c =>
        simp only [Bool.and_eq_true]
        exact ⟨fun ⟨⟨ha, hb⟩, hc⟩ x hx => by rcases hx with rfl | rfl | rfl <;> assumption,
               fun h => ⟨⟨h a (Or.inl rfl), h b (Or.inr (Or.inl rfl))⟩, h c (Or.inr (Or.inr rfl))⟩⟩
    cases hR : sseIsQ3 j
    · cases hL : sseIsQ3 (sseAct216 w j)
      · rfl
      · exfalso
        have hLw := (hAllWall (sseAct216 w j)).1 hL
        have hRw : sseIsQ3 j = true := (hAllWall j).2 (fun x hx => by
          rw [← hWall x]
          apply hLw (sseApplyWord w x)
          rw [hCliqueWord w j (sseApplyWord w x)]
          cases hcj : sseClique216 j <;> rw [hcj] at hx
          · exact congrArg (sseApplyWord w) hx
          · exact hx.elim (fun h => Or.inl (congrArg _ h)) (fun h => Or.inr (congrArg _ h))
          · exact hx.elim (fun h => Or.inl (congrArg _ h))
              (fun h => Or.inr (h.elim (fun h1 => Or.inl (congrArg _ h1)) (fun h2 => Or.inr (congrArg _ h2)))))
        rw [hR] at hRw; exact absurd hRw (by decide)
    · apply (hAllWall (sseAct216 w j)).2
      intro x hx
      rw [hCliqueWord w j x] at hx
      have hRw := (hAllWall j).1 hR
      cases hcj : sseClique216 j <;> rw [hcj] at hx
      · rw [hx, hWall]; exact hRw _ (by rw [hcj])
      · rcases hx with rfl | rfl <;> rw [hWall]
        · exact hRw _ (by rw [hcj]; exact Or.inl rfl)
        · exact hRw _ (by rw [hcj]; exact Or.inr rfl)
      · rcases hx with rfl | rfl | rfl <;> rw [hWall]
        · exact hRw _ (by rw [hcj]; exact Or.inl rfl)
        · exact hRw _ (by rw [hcj]; exact Or.inr (Or.inl rfl))
        · exact hRw _ (by rw [hcj]; exact Or.inr (Or.inr rfl))
  refine ⟨hFixIdx0, hQ3, ?_⟩
  intro j hQj
  have hQaj : sseIsQ3 (sseAct216 w j) = true := by rw [hQ3 j, hQj]
  apply hInj216; intro x
  rw [hCliqueWord w (sseAdd0 j) x]
  have hAdd1 := ((sse_q3_all_props j).2.1 hQj).2.2
  have hAdd2 := ((sse_q3_all_props (sseAct216 w j)).2.1 hQaj).2.2
  unfold sse_add0SpecBool at hAdd1 hAdd2
  have hMemW := hCliqueWord w j x
  cases hcj : sseClique216 j <;> rw [hcj] at hAdd1 hMemW <;> dsimp only at hAdd1 hMemW
  · have hE1 := of_decide_eq_true hAdd1; rw [hE1]; dsimp only; rw [hFix0]
    cases hcw : sseClique216 (sseAct216 w j) <;> rw [hcw] at hAdd2 hMemW <;> dsimp only at hAdd2 hMemW
    · have hE2 := of_decide_eq_true hAdd2; rw [hE2]; dsimp only
      exact ⟨fun h => h.elim Or.inl (fun h2 => Or.inr (hMemW.2 h2)),
             fun h => h.elim Or.inl (fun h2 => Or.inr (hMemW.1 h2))⟩
    · exfalso; have hs := sse_act216_size w j; simp only [sseSize216, hcj, hcw, sseCliqueSize] at hs; exact absurd hs (by decide)
    · exfalso; have hs := sse_act216_size w j; simp only [sseSize216, hcj, hcw, sseCliqueSize] at hs; exact absurd hs (by decide)
  · have hE1 := of_decide_eq_true hAdd1; rw [hE1]; dsimp only; rw [hFix0]
    cases hcw : sseClique216 (sseAct216 w j) <;> rw [hcw] at hAdd2 hMemW <;> dsimp only at hAdd2 hMemW
    · exfalso; have hs := sse_act216_size w j; simp only [sseSize216, hcj, hcw, sseCliqueSize] at hs; exact absurd hs (by decide)
    · have hE2 := of_decide_eq_true hAdd2; rw [hE2]; dsimp only
      exact ⟨fun h => h.elim Or.inl (fun h2 => Or.inr (hMemW.2 h2)),
             fun h => h.elim Or.inl (fun h2 => Or.inr (hMemW.1 h2))⟩
    · exfalso; have hs := sse_act216_size w j; simp only [sseSize216, hcj, hcw, sseCliqueSize] at hs; exact absurd hs (by decide)
  · exact absurd hAdd1 (by decide)

/-- Headline Theorem 6 (Exact `Q_3 = Adj(0)` 3-Cube Link Algebra & Zero-Cascade Upward Insertion):
    1. `Q_3 = Adj(0)` is an `8`-vertex, `3`-regular, `12`-edge, triangle-free 3-cube with exactly
       `20` non-empty cliques (`8` 1-cliques + `12` 2-cliques + `0` 3-cliques) and `212` valid Cartier-Foata pairs;
    2. `Stab_{W(F_4)}(0)` acts transitively on all `8` 1-cliques (`→ [4]`) and all `12` 2-cliques (`→ [4, 8]`);
    3. For EVERY `J ∈ Q_3`, `J ∪ {0}` is a valid clique of `Γ_24`; for EVERY `C` allowing `0`, `C ∉ Q_3`
       and `J ⊆ F(C) → J ∪ {0} ⊆ F(C)`; and for ALL `212` valid `Q_3` pairs `(J_1, J_2)`,
       **`sseCanFollow216 (sseAdd0 J_1) J_2 = true` (exact zero cascade!)**. -/
theorem thm_sse_q3_link_and_zero_cascade :
    ((List.finRange 24).filter isWallFacet).length = 8 ∧
    ((List.finRange 24).filter isWallFacet).all (fun a =>
      decide (((List.finRange 24).filter (fun b => isWallFacet b && adj24 a b)).length = 3)) = true ∧
    wallCliques2.length = 12 ∧
    (sseSumFinNat (fun i : Fin 216 => if sseIsQ3 i = true then 1 else 0) = 20) ∧
    (sseSumFinNat (fun i : Fin 216 => if (sseIsQ3 i && decide (sseSize216 i = 1)) = true then 1 else 0) = 8) ∧
    (sseSumFinNat (fun i : Fin 216 => if (sseIsQ3 i && decide (sseSize216 i = 2)) = true then 1 else 0) = 12) ∧
    (sseQ3List.foldl (fun acc j1 => acc + (sseQ3List.filter (fun j2 => sseCanFollow216 j1 j2)).length) 0 = 212) ∧
    (∀ j : Fin 216, sseIsQ3 j = true →
      sseApplyWord (sseStab0Q3Word j) ⟨0, by decide⟩ = ⟨0, by decide⟩ ∧
      sseAct216 (sseStab0Q3Word j) j = sseCanonQ3OfSize (sseSize216 j)) ∧
    (∀ c : Fin 216, sseCanFollow216 c sseIdx0 = true → sseIsQ3 c = false) ∧
    (∀ c j : Fin 216, sseCanFollow216 c sseIdx0 = true → sseIsQ3 j = true →
      sseCanFollow216 c j = true → sseCanFollow216 c (sseAdd0 j) = true) ∧
    (∀ j1 j2 : Fin 216, sseIsQ3 j1 = true → sseIsQ3 j2 = true →
      sseCanFollow216 j1 j2 = true → sseCanFollow216 (sseAdd0 j1) j2 = true) ∧
    (sseSumFinNat (fun i : Fin 216 => if (sseIsQ3 i && decide (sseSize216 i = 3)) = true then 1 else 0) = 0) ∧
    (∀ j : Fin 216, sseIsQ3 j = true →
      match sseClique216 j with
      | SseClique.c1 a => sseClique216 (sseAdd0 j) = SseClique.c2 ⟨0, by decide⟩ a
      | SseClique.c2 a b => sseClique216 (sseAdd0 j) = SseClique.c3 ⟨0, by decide⟩ a b
      | SseClique.c3 _ _ _ => False) := by
  have hFun : (fun j1 j2 => sseCanFollow216 j1 j2) = sse_canFollowFast :=
    funext (fun j1 => funext (fun j2 => sse_canFollow216_eq_fast j1 j2))
  refine ⟨sse_isQ3_wall_and_counts_fast.1, sse_isQ3_wall_and_counts_fast.2.1, sse_isQ3_wall_and_counts_fast.2.2.1,
    sse_q3_counts.1, sse_q3_counts.2.1, sse_q3_counts.2.2.1,
    ?_, fun j hQ => ⟨((sse_q3_all_props j).2.1 hQ).1, ((sse_q3_all_props j).2.1 hQ).2.1⟩,
    ?_, sse_canFollow_c_add0, sse_zero_cascade, sse_q3_counts.2.2.2, ?_⟩
  · have hEq := sse_q3_212_pairs_and_zero_cascade_fast.2.1
    rw [← hFun] at hEq; exact hEq
  · intro c hc; rw [sse_canFollow216_eq_fast] at hc; exact (sse_q3_all_props c).2.2 hc
  · intro j hQ
    have hSpec := ((sse_q3_all_props j).2.1 hQ).2.2
    unfold sse_add0SpecBool at hSpec
    cases hcj : sseClique216 j <;> rw [hcj] at hSpec <;> dsimp only at hSpec
    · exact of_decide_eq_true hSpec
    · exact of_decide_eq_true hSpec
    · exact absurd hSpec (by decide)


/-! ## Section 6: Exact `57` Pair-Orbit Algebra & All-Depth Symbolic Cartier-Foata Word-Sum Reduction -/

-- [helper]
def sse_sort2Nat (a b : Nat) : Nat × Nat := if a ≤ b then (a, b) else (b, a)

-- [helper]
def sse_sort3Nat (a b c : Nat) : Nat × Nat × Nat :=
  let (x1, y1) := sse_sort2Nat a b
  let (y2, z2) := sse_sort2Nat y1 c
  let (x3, y3) := sse_sort2Nat x1 y2
  (x3, y3, z2)

private theorem sse_sort2Nat_comm (a b : Nat) : sse_sort2Nat a b = sse_sort2Nat b a := by
  unfold sse_sort2Nat
  if hab : a ≤ b then
    if hba : b ≤ a then
      have heq : a = b := by omega
      rw [sse_ite_pos hab, sse_ite_pos hba, heq]
    else rw [sse_ite_pos hab, sse_ite_neg hba]
  else
    have hba : b ≤ a := by omega
    rw [sse_ite_neg hab, sse_ite_pos hba]

private theorem sse_sort3Nat_swap12 (a b c : Nat) : sse_sort3Nat a b c = sse_sort3Nat b a c := by
  unfold sse_sort3Nat; rw [sse_sort2Nat_comm a b]

private theorem sse_sort3Nat_swap23 (a b c : Nat) : sse_sort3Nat a b c = sse_sort3Nat a c b := by
  have hLe : ∀ {x y : Nat}, x ≤ y → sse_sort2Nat x y = (x, y) := fun h => sse_ite_pos h _ _
  have hGe : ∀ {x y : Nat}, y ≤ x → sse_sort2Nat x y = (y, x) := by
    intro x y h; unfold sse_sort2Nat
    if hxy : x ≤ y then
      have : x = y := by omega
      subst this; exact sse_ite_pos hxy _ _
    else exact sse_ite_neg hxy _ _
  have hStep : ∀ x y z x1 y1 y2 z2 x3 y3 : Nat,
      sse_sort2Nat x y = (x1, y1) → sse_sort2Nat y1 z = (y2, z2) → sse_sort2Nat x1 y2 = (x3, y3) →
      sse_sort3Nat x y z = (x3, y3, z2) := by
    intro x y z x1 y1 y2 z2 x3 y3 h1 h2 h3
    unfold sse_sort3Nat; rw [h1]; dsimp only; rw [h2]; dsimp only; rw [h3]
  if hab : a ≤ b then
    if hbc : b ≤ c then
      rw [hStep _ _ _ _ _ _ _ _ _ (hLe hab) (hLe hbc) (hLe hab),
          hStep _ _ _ _ _ _ _ _ _ (hLe (Nat.le_trans hab hbc)) (hGe hbc) (hLe hab)]
    else if hac : a ≤ c then
      rw [hStep _ _ _ _ _ _ _ _ _ (hLe hab) (hGe (by omega : c ≤ b)) (hLe hac),
          hStep _ _ _ _ _ _ _ _ _ (hLe hac) (hLe (by omega : c ≤ b)) (hLe hac)]
    else
      rw [hStep _ _ _ _ _ _ _ _ _ (hLe hab) (hGe (by omega : c ≤ b)) (hGe (by omega : c ≤ a)),
          hStep _ _ _ _ _ _ _ _ _ (hGe (by omega : c ≤ a)) (hLe hab) (hLe (by omega : c ≤ a))]
  else
    if hac : a ≤ c then
      rw [hStep _ _ _ _ _ _ _ _ _ (hGe (by omega : b ≤ a)) (hLe hac) (hLe (by omega : b ≤ a)),
          hStep _ _ _ _ _ _ _ _ _ (hLe hac) (hGe (by omega : b ≤ c)) (hGe (by omega : b ≤ a))]
    else if hbc : b ≤ c then
      rw [hStep _ _ _ _ _ _ _ _ _ (hGe (by omega : b ≤ a)) (hGe (by omega : c ≤ a)) (hLe hbc),
          hStep _ _ _ _ _ _ _ _ _ (hGe (by omega : c ≤ a)) (hGe (by omega : b ≤ a)) (hGe hbc)]
    else
      rw [hStep _ _ _ _ _ _ _ _ _ (hGe (by omega : b ≤ a)) (hGe (by omega : c ≤ a)) (hGe (by omega : c ≤ b)),
          hStep _ _ _ _ _ _ _ _ _ (hGe (by omega : c ≤ a)) (hGe (by omega : b ≤ a)) (hLe (by omega : c ≤ b))]

private theorem sse_sort3Nat_perm23 (a b c : Nat) : sse_sort3Nat a c b = sse_sort3Nat a b c :=
  (sse_sort3Nat_swap23 a b c).symm

private theorem sse_sort3Nat_perm213 (a b c : Nat) : sse_sort3Nat b a c = sse_sort3Nat a b c :=
  (sse_sort3Nat_swap12 a b c).symm

private theorem sse_sort3Nat_perm231 (a b c : Nat) : sse_sort3Nat b c a = sse_sort3Nat a b c := by
  rw [sse_sort3Nat_swap23 b c a, sse_sort3Nat_swap12 b a c]

private theorem sse_sort3Nat_perm312 (a b c : Nat) : sse_sort3Nat c a b = sse_sort3Nat a b c := by
  rw [sse_sort3Nat_swap12 c a b, sse_sort3Nat_swap23 a c b]

private theorem sse_sort3Nat_perm321 (a b c : Nat) : sse_sort3Nat c b a = sse_sort3Nat a b c := by
  rw [sse_sort3Nat_swap12 c b a, sse_sort3Nat_swap23 b c a, sse_sort3Nat_swap12 b a c]

-- [helper]
def sse_rowCode (a : Fin 24) (c2 : SseClique) : Nat :=
  match c2 with
  | SseClique.c1 b => sse_dotPlus2Fast a.val b.val
  | SseClique.c2 b1 b2 =>
    let p := sse_sort2Nat (sse_dotPlus2Fast a.val b1.val) (sse_dotPlus2Fast a.val b2.val)
    p.1 + 5 * p.2
  | SseClique.c3 b1 b2 b3 =>
    let t := sse_sort3Nat (sse_dotPlus2Fast a.val b1.val) (sse_dotPlus2Fast a.val b2.val) (sse_dotPlus2Fast a.val b3.val)
    t.1 + 5 * (t.2.1 + 5 * t.2.2)

/-- Exact `W(F_4)`-invariant sorted `dot4` matrix signature of an ordered clique pair `(C_1, C_2)`
    packed as a single `Nat` (zero collisions across all `57` pair orbits!). -/
def ssePairDotCode (c1 c2 : SseClique) : Nat :=
  let s1 := sseCliqueSize c1
  let s2 := sseCliqueSize c2
  let rPack : Nat :=
    match c1 with
    | SseClique.c1 a => sse_rowCode a c2
    | SseClique.c2 a1 a2 =>
      let p := sse_sort2Nat (sse_rowCode a1 c2) (sse_rowCode a2 c2)
      p.1 + 125 * p.2
    | SseClique.c3 a1 a2 a3 =>
      let t := sse_sort3Nat (sse_rowCode a1 c2) (sse_rowCode a2 c2) (sse_rowCode a3 c2)
      t.1 + 125 * (t.2.1 + 125 * t.2.2)
  (s1 - 1) + 3 * (s2 - 1) + 9 * rPack

/-- Map the `57` canonical `dot4` signatures to `Fin 57`. -/
def sseCodeToOrbitNat (code : Nat) : Nat :=
  match code with
  | 18 => 0
  | 0 => 1
  | 9 => 2
  | 102 => 3
  | 48 => 4
  | 57 => 5
  | 510 => 6
  | 276 => 7
  | 3394 => 8
  | 2260 => 9
  | 1126 => 10
  | 1135 => 11
  | 3385 => 12
  | 19282 => 13
  | 20353 => 14
  | 18103 => 15
  | 19228 => 16
  | 12478 => 17
  | 12424 => 18
  | 12433 => 19
  | 19183 => 20
  | 5674 => 21
  | 6799 => 22
  | 18049 => 23
  | 97531 => 24
  | 104011 => 25
  | 97261 => 26
  | 63511 => 27
  | 63277 => 28
  | 97027 => 29
  | 34027 => 30
  | 425270 => 31
  | 282386 => 32
  | 141752 => 33
  | 424136 => 34
  | 2550533 => 35
  | 2550479 => 36
  | 2408729 => 37
  | 1559309 => 38
  | 1553675 => 39
  | 2403059 => 40
  | 849425 => 41
  | 2262425 => 42
  | 2543729 => 43
  | 2409809 => 44
  | 13041836 => 45
  | 13035032 => 46
  | 13041512 => 47
  | 13034762 => 48
  | 12191012 => 49
  | 7938512 => 50
  | 7938278 => 51
  | 7909028 => 52
  | 12157028 => 53
  | 13001012 => 54
  | 4252778 => 55
  | 12190778 => 56
  | _ => 0

-- [helper]
theorem sse_codeToOrbitNat_lt (code : Nat) : sseCodeToOrbitNat code < 57 := by
  unfold sseCodeToOrbitNat; split <;> decide

/-- Exact `W(F_4)`-invariant pair orbit `ssePairOrbit216 i j : Fin 57` directly from `d4RootOf`. -/
def ssePairOrbit216 (i j : Fin 216) : Fin 57 :=
  let code := ssePairDotCode (sseClique216 i) (sseClique216 j)
  ⟨sseCodeToOrbitNat code, sse_codeToOrbitNat_lt code⟩

private theorem sse_pairDotCode_wf4Gen (k : Fin 4) (c1 c2 : SseClique) :
    ssePairDotCode (sseActCliqueGen k c1) (sseActCliqueGen k c2) = ssePairDotCode c1 c2 := by
  have hDot : ∀ a b : Fin 24, sse_dotPlus2Fast (sseWF4Gen k a).val (sseWF4Gen k b).val = sse_dotPlus2Fast a.val b.val := by
    intro a b
    rw [← sse_dotPlus2_eq_fast, ← sse_dotPlus2_eq_fast]
    unfold sseDotPlus2; rw [sse_wf4Gen_preserves_dot4]
  have hRow : ∀ a : Fin 24, sse_rowCode (sseWF4Gen k a) (sseActCliqueGen k c2) = sse_rowCode a c2 := by
    intro a; cases c2 with
    | c1 b => exact hDot a b
    | c2 b1 b2 =>
      unfold sseActCliqueGen; dsimp only
      rcases sse_sort2Fin_cases (sseWF4Gen k b1) (sseWF4Gen k b2) with hs | hs <;> rw [hs] <;> dsimp only [sse_rowCode]
      · simp only [hDot]
      · simp only [hDot, sse_sort2Nat_comm]
    | c3 b1 b2 b3 =>
      unfold sseActCliqueGen; dsimp only
      rcases sse_sort3Fin_cases (sseWF4Gen k b1) (sseWF4Gen k b2) (sseWF4Gen k b3) with hs | hs | hs | hs | hs | hs <;>
        rw [hs] <;> dsimp only [sse_rowCode]
      · simp only [hDot]
      · simp only [hDot, sse_sort3Nat_perm23]
      · simp only [hDot, sse_sort3Nat_perm213]
      · simp only [hDot, sse_sort3Nat_perm231]
      · simp only [hDot, sse_sort3Nat_perm312]
      · simp only [hDot, sse_sort3Nat_perm321]
  have hSz2 : sseCliqueSize (sseActCliqueGen k c2) = sseCliqueSize c2 := by cases c2 <;> rfl
  unfold ssePairDotCode
  rw [hSz2]
  generalize sseActCliqueGen k c2 = c2' at hRow ⊢
  cases c1 with
  | c1 a => simp only [sseActCliqueGen, sseCliqueSize, hRow]
  | c2 a1 a2 =>
    dsimp only [sseActCliqueGen, sseCliqueSize]
    rcases sse_sort2Fin_cases (sseWF4Gen k a1) (sseWF4Gen k a2) with hs | hs <;> rw [hs] <;> dsimp only
    · simp only [hRow]
    · simp only [hRow, sse_sort2Nat_comm]
  | c3 a1 a2 a3 =>
    dsimp only [sseActCliqueGen, sseCliqueSize]
    rcases sse_sort3Fin_cases (sseWF4Gen k a1) (sseWF4Gen k a2) (sseWF4Gen k a3) with hs | hs | hs | hs | hs | hs <;>
      rw [hs] <;> dsimp only
    · simp only [hRow]
    · simp only [hRow, sse_sort3Nat_perm23]
    · simp only [hRow, sse_sort3Nat_perm213]
    · simp only [hRow, sse_sort3Nat_perm231]
    · simp only [hRow, sse_sort3Nat_perm312]
    · simp only [hRow, sse_sort3Nat_perm321]

private theorem sse_pairDotCode_wf4 (w : List (Fin 4)) (i j : Fin 216) :
    ssePairDotCode (sseClique216 (sseAct216 w i)) (sseClique216 (sseAct216 w j)) =
      ssePairDotCode (sseClique216 i) (sseClique216 j) := by
  induction w with
  | nil => rfl
  | cons k rest ih => simp only [sseAct216, sse_act216Gen_compat, sse_pairDotCode_wf4Gen, ih]

private theorem sse_pairOrbit216_wf4Gen (k : Fin 4) (i j : Fin 216) :
    ssePairOrbit216 (sseAct216Gen k i) (sseAct216Gen k j) = ssePairOrbit216 i j := by
  apply Fin.ext; unfold ssePairOrbit216
  rw [sse_act216Gen_compat, sse_act216Gen_compat, sse_pairDotCode_wf4Gen]

private theorem sse_pairOrbit216_wf4 (w : List (Fin 4)) (i j : Fin 216) :
    ssePairOrbit216 (sseAct216 w i) (sseAct216 w j) = ssePairOrbit216 i j := by
  induction w with | nil => rfl | cons k rest ih => simp only [sseAct216, sse_pairOrbit216_wf4Gen, ih]

-- [helper]
def sse_orbitMetaNat (i : Nat) : Nat × Nat × Nat × Nat × Nat :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => (18, 1, 1, 144, 6) | 1 => (0, 1, 1, 24, 1) | 2 => (9, 1, 1, 192, 8) | 3 => (102, 1, 2, 576, 6) | 4 => (48, 1, 2, 192, 2) | 5 => (57, 1, 2, 288, 3) | 6 => (510, 1, 3, 576, 6) | 7 => (276, 1, 3, 288, 3) | 8 => (3394, 2, 1, 576, 24) | 9 => (2260, 2, 1, 576, 24) | 10 => (1126, 2, 1, 192, 8) | 11 => (1135, 2, 1, 288, 12) | 12 => (3385, 2, 1, 192, 8) | 13 => (19282, 2, 2, 288, 3) | 14 => (20353, 2, 2, 576, 6) | 15 => (18103, 2, 2, 576, 6) | _ => (0, 1, 1, 0, 0)
  | 1 => match i % 16 with
    | 0 => (19228, 2, 2, 1152, 12) | 1 => (12478, 2, 2, 288, 3) | 2 => (12424, 2, 2, 576, 6) | 3 => (12433, 2, 2, 1152, 12) | 4 => (19183, 2, 2, 576, 6) | 5 => (5674, 2, 2, 96, 1) | 6 => (6799, 2, 2, 576, 6) | 7 => (18049, 2, 2, 192, 2) | 8 => (97531, 2, 3, 288, 3) | 9 => (104011, 2, 3, 1152, 12) | 10 => (97261, 2, 3, 1152, 12) | 11 => (63511, 2, 3, 576, 6) | 12 => (63277, 2, 3, 1152, 12) | 13 => (97027, 2, 3, 576, 6) | 14 => (34027, 2, 3, 288, 3) | 15 => (425270, 3, 1, 576, 24) | _ => (0, 1, 1, 0, 0)
  | 2 => match i % 16 with
    | 0 => (282386, 3, 1, 576, 24) | 1 => (141752, 3, 1, 288, 12) | 2 => (424136, 3, 1, 576, 24) | 3 => (2550533, 3, 2, 576, 6) | 4 => (2550479, 3, 2, 1152, 12) | 5 => (2408729, 3, 2, 1152, 12) | 6 => (1559309, 3, 2, 576, 6) | 7 => (1553675, 3, 2, 1152, 12) | 8 => (2403059, 3, 2, 1152, 12) | 9 => (849425, 3, 2, 288, 3) | 10 => (2262425, 3, 2, 576, 6) | 11 => (2543729, 3, 2, 288, 3) | 12 => (2409809, 3, 2, 288, 3) | 13 => (13041836, 3, 3, 192, 2) | 14 => (13035032, 3, 3, 576, 6) | 15 => (13041512, 3, 3, 576, 6) | _ => (0, 1, 1, 0, 0)
  | 3 => match i % 16 with
    | 0 => (13034762, 3, 3, 1152, 12) | 1 => (12191012, 3, 3, 576, 6) | 2 => (7938512, 3, 3, 192, 2) | 3 => (7938278, 3, 3, 576, 6) | 4 => (7909028, 3, 3, 576, 6) | 5 => (12157028, 3, 3, 1152, 12) | 6 => (13001012, 3, 3, 576, 6) | 7 => (4252778, 3, 3, 96, 1) | 8 => (12190778, 3, 3, 288, 3) | _ => (0, 1, 1, 0, 0)
  | _ => (0, 1, 1, 0, 0)

/-- Exact orbit metadata `(dotCode, s1, s2, totalPairs, multIntoS2)` for each `o : Fin 57`. -/
def sseOrbitCode (o : Fin 57) : Nat := (sse_orbitMetaNat o.val).1
def sseOrbitS1 (o : Fin 57) : Nat := (sse_orbitMetaNat o.val).2.1
def sseOrbitS2 (o : Fin 57) : Nat := (sse_orbitMetaNat o.val).2.2.1
def sseOrbitTotalPairs (o : Fin 57) : Nat := (sse_orbitMetaNat o.val).2.2.2.1
def sseOrbitMultIn (o : Fin 57) : Nat := (sse_orbitMetaNat o.val).2.2.2.2

/-- Exact incoming orbit-multiplicity tables for canonical cliques `[0]`, `[0,4]`, `[0,4,8]`
    and canonical `Q_3` cliques `[4]`, `[4,8]` (every entry kernel-verified against `adj24` below!). -/
-- [helper]
def sse_inOrbitTblNat : Nat → List (Nat × Nat)
  | 1 => [(0, 6), (1, 1), (2, 8), (8, 24), (9, 24), (10, 8), (11, 12), (12, 8), (31, 24), (32, 24), (33, 12), (34, 24)]
  | 2 => [(3, 6), (4, 2), (5, 3), (13, 3), (14, 6), (15, 6), (16, 12), (17, 3), (18, 6), (19, 12), (20, 6), (21, 1), (22, 6), (23, 2), (35, 6), (36, 12), (37, 12), (38, 6), (39, 12), (40, 12), (41, 3), (42, 6), (43, 3), (44, 3)]
  | _ => [(6, 6), (7, 3), (24, 3), (25, 12), (26, 12), (27, 6), (28, 12), (29, 6), (30, 3), (45, 2), (46, 6), (47, 6), (48, 12), (49, 6), (50, 2), (51, 6), (52, 6), (53, 12), (54, 6), (55, 1), (56, 3)]

-- [helper]
def sse_m1TblNat : Nat → List ((Nat × Nat) × Nat)
  | 1 => [((0, 3), 3), ((10, 18), 3), ((10, 21), 1), ((10, 22), 3), ((10, 23), 1), ((11, 15), 3), ((11, 19), 6), ((11, 22), 3), ((12, 14), 3), ((12, 20), 3), ((12, 23), 1), ((1, 4), 1), ((2, 3), 3), ((2, 4), 1), ((2, 5), 3), ((31, 35), 6), ((31, 36), 6), ((31, 37), 6), ((32, 37), 6), ((32, 38), 6), ((32, 39), 6), ((32, 40), 6), ((33, 39), 6), ((33, 41), 3), ((33, 42), 3), ((34, 36), 6), ((34, 40), 6), ((34, 42), 3), ((34, 43), 3), ((34, 44), 3), ((8, 13), 3), ((8, 14), 3), ((8, 15), 3), ((8, 16), 6), ((9, 16), 6), ((9, 17), 3), ((9, 18), 3), ((9, 19), 6), ((9, 20), 3)]
  | _ => [((13, 24), 1), ((14, 25), 4), ((15, 24), 2), ((15, 26), 4), ((16, 25), 4), ((16, 26), 4), ((17, 27), 2), ((18, 28), 4), ((18, 29), 2), ((19, 26), 4), ((19, 27), 4), ((19, 28), 4), ((20, 25), 4), ((20, 29), 2), ((21, 30), 1), ((22, 28), 4), ((22, 30), 2), ((23, 29), 2), ((35, 45), 2), ((35, 46), 2), ((36, 47), 4), ((36, 48), 4), ((37, 46), 4), ((37, 48), 4), ((37, 49), 4), ((38, 49), 2), ((38, 50), 2), ((38, 51), 2), ((39, 51), 4), ((39, 52), 4), ((39, 53), 4), ((3, 6), 4), ((40, 48), 4), ((40, 53), 4), ((40, 54), 4), ((41, 52), 2), ((41, 55), 1), ((42, 53), 4), ((42, 56), 2), ((43, 54), 2), ((44, 47), 2), ((44, 56), 1), ((4, 7), 2), ((5, 6), 2), ((5, 7), 1)]

-- [helper]
def sse_m2TblNat : Nat → List ((Nat × Nat) × Nat)
  | 1 => [((0, 8), 3), ((2, 12), 1), ((8, 31), 6), ((9, 34), 3)]
  | _ => [((13, 35), 2), ((16, 36), 4), ((17, 43), 1), ((3, 14), 2)]

-- [helper]
def sse_q3InTblNat : Nat → List (Nat × Nat)
  | 1 => [(0, 3), (2, 1), (8, 6), (9, 3)]
  | _ => [(3, 2), (13, 2), (16, 4), (17, 1)]

-- [helper]
def sse_toFin57 (n : Nat) : Fin 57 := if h : n < 57 then ⟨n, h⟩ else ⟨0, by decide⟩

def sseInOrbitTbl (sz : Nat) : List (Fin 57 × Nat) :=
  (sse_inOrbitTblNat sz).map (fun e => (sse_toFin57 e.1, e.2))

def sseM1Tbl (j1sz : Nat) : List ((Fin 57 × Fin 57) × Nat) :=
  (sse_m1TblNat j1sz).map (fun e => ((sse_toFin57 e.1.1, sse_toFin57 e.1.2), e.2))

def sseM2Tbl (j2sz : Nat) : List ((Fin 57 × Fin 57) × Nat) :=
  (sse_m2TblNat j2sz).map (fun e => ((sse_toFin57 e.1.1, sse_toFin57 e.1.2), e.2))

def sseQ3InTbl (jbsz : Nat) : List (Fin 57 × Nat) :=
  (sse_q3InTblNat jbsz).map (fun e => (sse_toFin57 e.1, e.2))

-- Fast O(log 216)-depth binary-tree kernel verification of ALL 9 grouping tables directly from `adj24` & `d4RootOf`!
private theorem sse_orbit_tables_verified :
    (sse_checkGroupTbl 8 (fun p : Fin 216 => sse_canFollowFast p ⟨0, by decide⟩)
      (fun p => ssePairOrbit216 p ⟨0, by decide⟩) (sseInOrbitTbl 1) = true) ∧
    (sse_checkGroupTbl 8 (fun p : Fin 216 => sse_canFollowFast p ⟨24, by decide⟩)
      (fun p => ssePairOrbit216 p ⟨24, by decide⟩) (sseInOrbitTbl 2) = true) ∧
    (sse_checkGroupTbl 8 (fun p : Fin 216 => sse_canFollowFast p ⟨120, by decide⟩)
      (fun p => ssePairOrbit216 p ⟨120, by decide⟩) (sseInOrbitTbl 3) = true) ∧
    (sse_checkGroupTbl 8 (fun c : Fin 216 => sse_canFollowFast c sseIdx0 && sse_canFollowFast c ⟨4, by decide⟩)
      (fun c => (ssePairOrbit216 c ⟨4, by decide⟩, ssePairOrbit216 c (sseAdd0 ⟨4, by decide⟩))) (sseM1Tbl 1) = true) ∧
    (sse_checkGroupTbl 8 (fun c : Fin 216 => sse_canFollowFast c sseIdx0 && sse_canFollowFast c ⟨56, by decide⟩)
      (fun c => (ssePairOrbit216 c ⟨56, by decide⟩, ssePairOrbit216 c (sseAdd0 ⟨56, by decide⟩))) (sseM1Tbl 2) = true) ∧
    (sse_checkGroupTbl 8 (fun j1 : Fin 216 => sseIsQ3 j1 && sse_canFollowFast j1 ⟨4, by decide⟩)
      (fun j1 => (ssePairOrbit216 j1 ⟨4, by decide⟩, ssePairOrbit216 (sseAdd0 j1) ⟨4, by decide⟩)) (sseM2Tbl 1) = true) ∧
    (sse_checkGroupTbl 8 (fun j1 : Fin 216 => sseIsQ3 j1 && sse_canFollowFast j1 ⟨56, by decide⟩)
      (fun j1 => (ssePairOrbit216 j1 ⟨56, by decide⟩, ssePairOrbit216 (sseAdd0 j1) ⟨56, by decide⟩)) (sseM2Tbl 2) = true) ∧
    (sse_checkGroupTbl 8 (fun ja : Fin 216 => sseIsQ3 ja && sse_canFollowFast ja ⟨4, by decide⟩)
      (fun ja => ssePairOrbit216 ja ⟨4, by decide⟩) (sseQ3InTbl 1) = true) ∧
    (sse_checkGroupTbl 8 (fun ja : Fin 216 => sseIsQ3 ja && sse_canFollowFast ja ⟨56, by decide⟩)
      (fun ja => ssePairOrbit216 ja ⟨56, by decide⟩) (sseQ3InTbl 2) = true) := by
  decide

private theorem sse_orbit_meta_verified :
    (∀ o1 o2 : Fin 57, sseOrbitCode o1 = sseOrbitCode o2 → o1 = o2) ∧
    (∀ o : Fin 57, sseCodeToOrbitNat (sseOrbitCode o) = o.val) ∧
    (sseSumFinNat sseOrbitTotalPairs = 31080) ∧
    (sseSumFinNat (fun o : Fin 57 => if sseOrbitS1 o = 1 then sseOrbitTotalPairs o else 0) = 2280) ∧
    (sseSumFinNat (fun o : Fin 57 => if sseOrbitS1 o = 2 then sseOrbitTotalPairs o else 0) = 13056) ∧
    (sseSumFinNat (fun o : Fin 57 => if sseOrbitS1 o = 3 then sseOrbitTotalPairs o else 0) = 15744) ∧
    (∀ (o : Fin 57),
      sseOrbitTotalPairs o =
        (match sseOrbitS2 o with | 1 => 24 | _ => 96) * sseOrbitMultIn o) ∧
    (∀ (o : Fin 57),
      sseTableSum (fun x => if x = o then 1 else 0) (sseInOrbitTbl (sseOrbitS2 o)) =
        sseOrbitMultIn o) ∧
    (∀ (o : Fin 57),
      24 * sseTableSum (fun x => if x = o then 1 else 0) (sseInOrbitTbl 1) +
      96 * sseTableSum (fun x => if x = o then 1 else 0) (sseInOrbitTbl 2) +
      96 * sseTableSum (fun x => if x = o then 1 else 0) (sseInOrbitTbl 3) =
        sseOrbitTotalPairs o) ∧
    (sse_allPow2 (fun k => if hk : k < 216 then
      let p : Fin 216 := ⟨k, hk⟩
      (!(sse_canFollowFast p ⟨0, by decide⟩) ||
        (decide (sseOrbitS1 (ssePairOrbit216 p ⟨0, by decide⟩) = sseSize216 p) &&
         decide (sseOrbitS2 (ssePairOrbit216 p ⟨0, by decide⟩) = 1) &&
         decide (ssePairDotCode (sseClique216 p) (sseClique216 ⟨0, by decide⟩) =
           sseOrbitCode (ssePairOrbit216 p ⟨0, by decide⟩)))) &&
      (!(sse_canFollowFast p ⟨24, by decide⟩) ||
        (decide (sseOrbitS1 (ssePairOrbit216 p ⟨24, by decide⟩) = sseSize216 p) &&
         decide (sseOrbitS2 (ssePairOrbit216 p ⟨24, by decide⟩) = 2) &&
         decide (ssePairDotCode (sseClique216 p) (sseClique216 ⟨24, by decide⟩) =
           sseOrbitCode (ssePairOrbit216 p ⟨24, by decide⟩)))) &&
      (!(sse_canFollowFast p ⟨120, by decide⟩) ||
        (decide (sseOrbitS1 (ssePairOrbit216 p ⟨120, by decide⟩) = sseSize216 p) &&
         decide (sseOrbitS2 (ssePairOrbit216 p ⟨120, by decide⟩) = 3) &&
         decide (ssePairDotCode (sseClique216 p) (sseClique216 ⟨120, by decide⟩) =
           sseOrbitCode (ssePairOrbit216 p ⟨120, by decide⟩))))
    else true) 8 0 = true) := by
  decide

private theorem sse_pairOrbit_sizes_and_code (p c : Fin 216) (hF : sseCanFollow216 p c = true) :
    sseOrbitS1 (ssePairOrbit216 p c) = sseSize216 p ∧
    sseOrbitS2 (ssePairOrbit216 p c) = sseSize216 c ∧
    ssePairDotCode (sseClique216 p) (sseClique216 c) = sseOrbitCode (ssePairOrbit216 p c) := by
  let w := sseCanonWord216 c
  have hCw : sseAct216 w c = sseCanonCliqueOfSize (sseSize216 c) := sse_canonWord216_exact c
  have hFw : sse_canFollowFast (sseAct216 w p) (sseCanonCliqueOfSize (sseSize216 c)) = true := by
    rw [← sse_canFollow216_eq_fast, ← hCw, sse_canFollow216_wf4, hF]
  have hAll := sse_allPow2_sound _ 8 0 sse_orbit_meta_verified.2.2.2.2.2.2.2.2.2 (sseAct216 w p).val
    (Nat.zero_le _) (by have := (sseAct216 w p).isLt; omega)
  rw [dite_eq_left (sseAct216 w p).isLt] at hAll; dsimp only at hAll; simp only [Bool.and_eq_true] at hAll
  have hSz : sseSize216 c = 1 ∨ sseSize216 c = 2 ∨ sseSize216 c = 3 := by
    unfold sseSize216; cases sseClique216 c <;> simp [sseCliqueSize]
  have hM : sseOrbitS1 (ssePairOrbit216 (sseAct216 w p) (sseCanonCliqueOfSize (sseSize216 c))) = sseSize216 (sseAct216 w p) ∧
      sseOrbitS2 (ssePairOrbit216 (sseAct216 w p) (sseCanonCliqueOfSize (sseSize216 c))) = sseSize216 c ∧
      ssePairDotCode (sseClique216 (sseAct216 w p)) (sseClique216 (sseCanonCliqueOfSize (sseSize216 c))) =
        sseOrbitCode (ssePairOrbit216 (sseAct216 w p) (sseCanonCliqueOfSize (sseSize216 c))) := by
    rcases hSz with h1 | h2 | h3
    · rw [h1] at hFw ⊢; simp only [sseCanonCliqueOfSize] at hFw ⊢
      have ha := hAll.1.1
      change (!(sse_canFollowFast (sseAct216 w p) ⟨0, by decide⟩) || _) = true at ha
      rw [hFw] at ha; simp only [Bool.not_true, Bool.false_or, Bool.and_eq_true] at ha
      exact ⟨of_decide_eq_true ha.1.1, of_decide_eq_true ha.1.2, of_decide_eq_true ha.2⟩
    · rw [h2] at hFw ⊢; simp only [sseCanonCliqueOfSize] at hFw ⊢
      have ha := hAll.1.2
      change (!(sse_canFollowFast (sseAct216 w p) ⟨24, by decide⟩) || _) = true at ha
      rw [hFw] at ha; simp only [Bool.not_true, Bool.false_or, Bool.and_eq_true] at ha
      exact ⟨of_decide_eq_true ha.1.1, of_decide_eq_true ha.1.2, of_decide_eq_true ha.2⟩
    · rw [h3] at hFw ⊢; simp only [sseCanonCliqueOfSize] at hFw ⊢
      have ha := hAll.2
      change (!(sse_canFollowFast (sseAct216 w p) ⟨120, by decide⟩) || _) = true at ha
      rw [hFw] at ha; simp only [Bool.not_true, Bool.false_or, Bool.and_eq_true] at ha
      exact ⟨of_decide_eq_true ha.1.1, of_decide_eq_true ha.1.2, of_decide_eq_true ha.2⟩
  rw [← hCw, sse_pairOrbit216_wf4, sse_pairDotCode_wf4, sse_act216_size] at hM
  exact hM

private theorem sse_pairOrbit_sizes (p c : Fin 216) (hF : sseCanFollow216 p c = true) :
    sseOrbitS1 (ssePairOrbit216 p c) = sseSize216 p ∧ sseOrbitS2 (ssePairOrbit216 p c) = sseSize216 c :=
  ⟨(sse_pairOrbit_sizes_and_code p c hF).1, (sse_pairOrbit_sizes_and_code p c hF).2.1⟩

-- Literal Cartier-Foata normal-form word tree & 1-step Markov product witness `ssePsi`:
/-- Exact sum of `f w` over ALL valid Cartier-Foata normal-form words `w` (stored reversed `[C_k, ..., C_1]`)
    of height `k ≥ 1` ending in clique `c : Fin 216`. -/
def sseWordsEnd : Nat → Fin 216 → (List (Fin 216) → Nat) → Nat
  | 0, _, _ => 0
  | 1, c, f => f [c]
  | n + 2, c, f =>
    sseSumFinNat (fun p : Fin 216 =>
      if sseCanFollow216 p c = true then sseWordsEnd (n + 1) p (fun rev => f (c :: rev)) else 0)

/-- Product of 1-step pair-orbit bulk weights `∏_{t=2}^k om(o(C_{t-1}, C_t))` on reversed CF word `w`. -/
def ssePrefixProd (om : Fin 57 → Nat) : List (Fin 216) → Nat
  | [] => 1
  | [_] => 1
  | c :: p :: rest => om (ssePairOrbit216 p c) * ssePrefixProd om (p :: rest)

/-- Concrete 1-step Cartier-Foata Markov product witness `ψ(C_1, ..., C_k)` supported on heights `k ≥ 2`. -/
def ssePsi (W : Nat → Nat) (om v : Fin 57 → Nat) : List (Fin 216) → Nat
  | [] => 0
  | [_] => 0
  | c :: p :: rest => W (rest.length + 2) * ssePrefixProd om (c :: p :: rest) * v (ssePairOrbit216 p c)

/-- Exact upward `s_0`-insertion `w ↦ w s_0` on reversed Cartier-Foata normal-form words `w = [C_k, ..., C_1]`:
    scans from the right through the maximal `Q_3 = Adj(0)` suffix `J_m, ..., J_1` and inserts `0` at `J_1`
    (or appends `[0]` if `m = 0`) with zero cascade. Returns `none` on downward edges `s_0 ∈ D(w)`. -/
def sseInsert0Rev : List (Fin 216) → Option (List (Fin 216))
  | [] => some [sseIdx0]
  | c :: rest =>
    if sseIsQ3 c = true then
      match rest with
      | [] => some [sseAdd0 c]
      | r :: rs =>
        if sseIsQ3 r = true then
          match sseInsert0Rev (r :: rs) with
          | some rest' => some (c :: rest')
          | none => none
        else if sseCanFollow216 r sseIdx0 = true then
          some (sseAdd0 c :: r :: rs)
        else none
    else if sseCanFollow216 c sseIdx0 = true then
      some (sseIdx0 :: c :: rest)
    else none

/-- Exact `Q_3`-suffix slide depth `m(w)` of a reversed CF word `w = [C_k, ..., C_1]`. -/
def sseQ3SuffixLenRev : List (Fin 216) → Nat
  | [] => 0
  | c :: rest => if sseIsQ3 c = true then sseQ3SuffixLenRev rest + 1 else 0

/-- Exact finite-support squared norm `∑_{k=2}^K ∑_{w ∈ CF(k)} ψ(w)^2` over ALL valid CF words of heights `2..K`. -/
def sseCFExactNormSq (K : Nat) (W : Nat → Nat) (om v : Fin 57 → Nat) : Nat :=
  sumNat (K + 1) (fun k =>
    if k ≥ 2 then
      sseSumFinNat (fun c : Fin 216 => sseWordsEnd k c (fun w => ssePsi W om v w * ssePsi W om v w))
    else 0)

/-- Exact upward `s_0`-edge inner product `∑_{k=2}^K ∑_{w ∈ CF(k)} ψ(w) * ψ(w s_0)` over ALL valid CF words. -/
def sseCFExactUp0Quad (K : Nat) (W : Nat → Nat) (om v : Fin 57 → Nat) : Nat :=
  sumNat (K + 1) (fun k =>
    if k ≥ 2 then
      sseSumFinNat (fun c : Fin 216 => sseWordsEnd k c (fun w =>
        match sseInsert0Rev w with
        | some w' => ssePsi W om v w * ssePsi W om v w'
        | none => 0))
    else 0)

-- Exact `3`-vector + `2×2` matrix compressed evaluators (proved symbolically equal / `≤` below!):
/-- Exact `3`-vector prefix squared-weight recurrence `Z(k, s)` (`s ∈ {1, 2, 3}`). -/
def sseZVec (om : Fin 57 → Nat) : Nat → Nat × Nat × Nat
  | 0 => (0, 0, 0)
  | 1 => (1, 1, 1)
  | k + 2 =>
    let prev := sseZVec om (k + 1)
    let pick (s : Nat) : Nat := match s with | 1 => prev.1 | 2 => prev.2.1 | _ => prev.2.2
    let step (sz : Nat) : Nat :=
      sseTableSum (fun o : Fin 57 => om o * om o * pick (sseOrbitS1 o)) (sseInOrbitTbl sz)
    (step 1, step 2, step 3)

def sseZAt (om : Fin 57 → Nat) (k s : Nat) : Nat :=
  let v := sseZVec om k
  match s with | 1 => v.1 | 2 => v.2.1 | _ => v.2.2

/-- Exact compressed `O(57)` norm `⟨ψ, ψ⟩` for heights `2..K`. -/
def sseCF1NormSq (K : Nat) (W : Nat → Nat) (om v : Fin 57 → Nat) : Nat :=
  sumNat (K + 1) (fun k =>
    if k ≥ 2 then
      W k * W k *
        (24 * sseTableSum (fun o => om o * om o * v o * v o * sseZAt om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1) +
         96 * sseTableSum (fun o => om o * om o * v o * v o * sseZAt om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2) +
         96 * sseTableSum (fun o => om o * om o * v o * v o * sseZAt om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3))
    else 0)

/-- Exact `Q_3` incoming prefix mass `(P_m(1), P_m(2))` for slide depth `m ≥ 1` starting from prefix `z = Z(k - m)`. -/
def sseQ3MassVec (om : Fin 57 → Nat) (z : Nat × Nat × Nat) : Nat → Nat × Nat
  | 0 => (0, 0)
  | 1 =>
    let pick (s : Nat) : Nat := match s with | 1 => z.1 | 2 => z.2.1 | _ => z.2.2
    let p1 (sz : Nat) : Nat :=
      sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * pick (sseOrbitS1 p.1)) (sseM1Tbl sz)
    (p1 1, p1 2)
  | 2 =>
    let prev := sseQ3MassVec om z 1
    let pick2 (s : Nat) : Nat := match s with | 1 => prev.1 | _ => prev.2
    let p2 (sz : Nat) : Nat :=
      sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * pick2 (sseOrbitS1 p.1)) (sseM2Tbl sz)
    (p2 1, p2 2)
  | m + 3 =>
    let prev := sseQ3MassVec om z (m + 2)
    let pick2 (s : Nat) : Nat := match s with | 1 => prev.1 | _ => prev.2
    let pm (sz : Nat) : Nat :=
      sseTableSum (fun o : Fin 57 => om o * om o * pick2 (sseOrbitS1 o)) (sseQ3InTbl sz)
    (pm 1, pm 2)

/-- Exact compressed slide-depth `m` contribution (with factor `48 = 2 * 24`) at height `k ≥ 2`. -/
def sseCF1SliceAt (W : Nat → Nat) (om v : Fin 57 → Nat) (k m : Nat) : Nat :=
  match m with
  | 0 =>
    let vOut (sz : Nat) : Nat :=
      sseTableSum (fun o => om o * om o * v o * sseZAt om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl sz)
    let pickV (s : Nat) : Nat := match s with | 1 => vOut 1 | 2 => vOut 2 | _ => vOut 3
    48 * (W k * W (k + 1) *
      sseTableSum (fun o => om o * v o * pickV (sseOrbitS1 o)) (sseInOrbitTbl 1))
  | 1 =>
    let z := sseZVec om (k - 1)
    let pick (s : Nat) : Nat := match s with | 1 => z.1 | 2 => z.2.1 | _ => z.2.2
    let s1 := sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 * pick (sseOrbitS1 p.1)) (sseM1Tbl 1)
    let s2 := sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 * pick (sseOrbitS1 p.1)) (sseM1Tbl 2)
    48 * (W k * W k * (8 * s1 + 12 * s2))
  | 2 =>
    let p1 := sseQ3MassVec om (sseZVec om (k - 2)) 1
    let pick2 (s : Nat) : Nat := match s with | 1 => p1.1 | _ => p1.2
    let s1 := sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 * pick2 (sseOrbitS1 p.1)) (sseM2Tbl 1)
    let s2 := sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 * pick2 (sseOrbitS1 p.1)) (sseM2Tbl 2)
    48 * (W k * W k * (8 * s1 + 12 * s2))
  | d + 3 =>
    let prev := sseQ3MassVec om (sseZVec om (k - (d + 3))) (d + 2)
    let pick2 (s : Nat) : Nat := match s with | 1 => prev.1 | _ => prev.2
    let s1 := sseTableSum (fun o : Fin 57 => om o * om o * v o * v o * pick2 (sseOrbitS1 o)) (sseQ3InTbl 1)
    let s2 := sseTableSum (fun o : Fin 57 => om o * om o * v o * v o * pick2 (sseOrbitS1 o)) (sseQ3InTbl 2)
    48 * (W k * W k * (8 * s1 + 12 * s2))

/-- Exact truncated `m = 0..min(M, k-1)` compressed quadratic lower bound `≤ 48 * sseCFExactUp0Quad`. -/
def sseCF1QuadTrunc (K M : Nat) (W : Nat → Nat) (om v : Fin 57 → Nat) : Nat :=
  sumNat (K + 1) (fun k =>
    if k ≥ 2 then
      sumNat (M + 1) (fun m => if m < k then sseCF1SliceAt W om v k m else 0)
    else 0)

-- Symbolic induction lemmas proving `sseCFExactNormSq = sseCF1NormSq` and `48 * sseCFExactUp0Quad ≥ sseCF1QuadTrunc`!
private theorem sse_wordsEnd_congr (k : Nat) (c : Fin 216) (f g : List (Fin 216) → Nat)
    (h : ∀ w : List (Fin 216), w.length = k → f w = g w) :
    sseWordsEnd k c f = sseWordsEnd k c g := by
  induction k generalizing c f g with
  | zero => rfl
  | succ n ih =>
    cases n with
    | zero => exact h [c] rfl
    | succ m =>
      simp only [sseWordsEnd]
      apply sse_sumFinNat_congr; intro p
      if hF : sseCanFollow216 p c = true then
        rw [sse_ite_pos hF, sse_ite_pos hF]
        exact ih p (fun rev => f (c :: rev)) (fun rev => g (c :: rev))
          (fun rev hlen => h (c :: rev) (by simp [hlen]))
      else
        rw [sse_ite_neg hF, sse_ite_neg hF]

private theorem sse_wordsEnd_le (k : Nat) (c : Fin 216) (f g : List (Fin 216) → Nat)
    (h : ∀ w : List (Fin 216), f w ≤ g w) : sseWordsEnd k c f ≤ sseWordsEnd k c g := by
  induction k generalizing c f g with
  | zero => exact Nat.le_refl 0
  | succ n ih =>
    cases n with
    | zero => exact h [c]
    | succ m =>
      simp only [sseWordsEnd]
      apply sse_sumFinNat_le; intro p
      if hF : sseCanFollow216 p c = true then
        rw [sse_ite_pos hF, sse_ite_pos hF]
        exact ih p (fun rev => f (c :: rev)) (fun rev => g (c :: rev)) (fun rev => h (c :: rev))
      else
        rw [sse_ite_neg hF, sse_ite_neg hF]

private theorem sse_wordsEnd_zero (k : Nat) (c : Fin 216) :
    sseWordsEnd k c (fun _ => 0) = 0 := by
  induction k generalizing c with
  | zero => rfl
  | succ n ih =>
    cases n with
    | zero => rfl
    | succ m =>
      simp only [sseWordsEnd]
      have h : (fun p : Fin 216 => if sseCanFollow216 p c = true then sseWordsEnd (m + 1) p (fun _ => 0) else 0) =
          (fun _ : Fin 216 => 0) := by
        funext p; rw [ih p]; split <;> rfl
      rw [h, sse_sumFinNat_zero]

private theorem sse_wordsEnd_add (k : Nat) (c : Fin 216) (f g : List (Fin 216) → Nat) :
    sseWordsEnd k c (fun w => f w + g w) = sseWordsEnd k c f + sseWordsEnd k c g := by
  induction k generalizing c f g with
  | zero => rfl
  | succ n ih =>
    cases n with
    | zero => rfl
    | succ m =>
      simp only [sseWordsEnd]
      rw [← sse_sumFinNat_add]
      apply sse_sumFinNat_congr; intro p
      if hF : sseCanFollow216 p c = true then
        rw [sse_ite_pos hF, sse_ite_pos hF, sse_ite_pos hF, ih p]
      else
        rw [sse_ite_neg hF, sse_ite_neg hF, sse_ite_neg hF]

private theorem sse_wordsEnd_mul_left (k : Nat) (c : Fin 216) (a : Nat) (f : List (Fin 216) → Nat) :
    sseWordsEnd k c (fun w => a * f w) = a * sseWordsEnd k c f := by
  induction k generalizing c f with
  | zero => simp [sseWordsEnd]
  | succ n ih =>
    cases n with
    | zero => rfl
    | succ m =>
      simp only [sseWordsEnd]
      rw [← sse_sumFinNat_mul_left]
      apply sse_sumFinNat_congr; intro p
      if hF : sseCanFollow216 p c = true then
        rw [sse_ite_pos hF, sse_ite_pos hF, ih p]
      else
        rw [sse_ite_neg hF, sse_ite_neg hF, Nat.mul_zero]

private theorem sse_wordsEnd_head (n : Nat) (c : Fin 216) (f : List (Fin 216) → Nat) :
    sseWordsEnd (n + 1) c (fun w => match w with | h :: _ => if h = c then f w else 0 | [] => 0) =
      sseWordsEnd (n + 1) c f := by
  cases n with
  | zero => dsimp only [sseWordsEnd]; rw [sse_ite_pos rfl]
  | succ m =>
    simp only [sseWordsEnd]
    apply sse_sumFinNat_congr; intro p
    if hF : sseCanFollow216 p c = true then
      rw [sse_ite_pos hF, sse_ite_pos hF]
      apply sse_wordsEnd_congr; intro rev _; simp only [ite_true]
    else rw [sse_ite_neg hF, sse_ite_neg hF]

-- Canonical grouping over all `p : Fin 216` preceding ANY `c : Fin 216` via `W(F_4)` bijection!
private theorem sse_sum_inOrbit_any (c : Fin 216) (F : Fin 57 → Nat) :
    sseSumFinNat (fun p : Fin 216 => if sseCanFollow216 p c = true then F (ssePairOrbit216 p c) else 0) =
      sseTableSum F (sseInOrbitTbl (sseSize216 c)) := by
  let w := sseCanonWord216 c
  have hCw : sseAct216 w c = sseCanonCliqueOfSize (sseSize216 c) := sse_canonWord216_exact c
  rw [← sse_sumFinNat_bij (sseAct216 w.reverse) (sseAct216 w) (sse_act216_inv_right w) (sse_act216_inv w)]
  have hEq : (fun p : Fin 216 =>
      if sseCanFollow216 (sseAct216 w.reverse p) c = true then F (ssePairOrbit216 (sseAct216 w.reverse p) c) else 0) =
    (fun p : Fin 216 =>
      if sse_canFollowFast p (sseCanonCliqueOfSize (sseSize216 c)) = true then
        F (ssePairOrbit216 p (sseCanonCliqueOfSize (sseSize216 c))) else 0) := by
    funext p
    have h1 : sseCanFollow216 (sseAct216 w.reverse p) c = sseCanFollow216 p (sseCanonCliqueOfSize (sseSize216 c)) := by
      rw [← sse_canFollow216_wf4 w, sse_act216_inv_right, hCw]
    have h2 : ssePairOrbit216 (sseAct216 w.reverse p) c = ssePairOrbit216 p (sseCanonCliqueOfSize (sseSize216 c)) := by
      rw [← sse_pairOrbit216_wf4 w, sse_act216_inv_right, hCw]
    rw [h1, h2, sse_canFollow216_eq_fast]
  rw [hEq]
  have hSz : sseSize216 c = 1 ∨ sseSize216 c = 2 ∨ sseSize216 c = 3 := by
    unfold sseSize216; cases sseClique216 c <;> simp [sseCliqueSize]
  rcases hSz with h1 | h2 | h3
  · rw [h1]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.1
  · rw [h2]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.2.1
  · rw [h3]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.2.2.1

-- Canonical `Stab(0)` grouping over `m = 1`, `m = 2`, and `Q_3`-step for ANY `j ∈ Q_3`!
private theorem sse_sum_m1_any (j : Fin 216) (hQ : sseIsQ3 j = true) (F : Fin 57 × Fin 57 → Nat) :
    sseSumFinNat (fun c : Fin 216 =>
      if (sseCanFollow216 c sseIdx0 && sseCanFollow216 c j) = true then
        F (ssePairOrbit216 c j, ssePairOrbit216 c (sseAdd0 j)) else 0) =
      sseTableSum F (sseM1Tbl (sseSize216 j)) := by
  let w := sseStab0Q3Word j
  obtain ⟨hFix0, hJw, _⟩ := (sse_q3_all_props j).2.1 hQ
  obtain ⟨hIdx0, _, hAddW⟩ := sse_stab0_preserves_q3_and_add0 w hFix0
  rw [← sse_sumFinNat_bij (sseAct216 w.reverse) (sseAct216 w) (sse_act216_inv_right w) (sse_act216_inv w)]
  have hEq : (fun c : Fin 216 =>
      if (sseCanFollow216 (sseAct216 w.reverse c) sseIdx0 && sseCanFollow216 (sseAct216 w.reverse c) j) = true then
        F (ssePairOrbit216 (sseAct216 w.reverse c) j, ssePairOrbit216 (sseAct216 w.reverse c) (sseAdd0 j)) else 0) =
    (fun c : Fin 216 =>
      if (sse_canFollowFast c sseIdx0 && sse_canFollowFast c (sseCanonQ3OfSize (sseSize216 j))) = true then
        F (ssePairOrbit216 c (sseCanonQ3OfSize (sseSize216 j)),
           ssePairOrbit216 c (sseAdd0 (sseCanonQ3OfSize (sseSize216 j)))) else 0) := by
    funext c
    have h1 : sseCanFollow216 (sseAct216 w.reverse c) sseIdx0 = sseCanFollow216 c sseIdx0 := by
      rw [← sse_canFollow216_wf4 w, sse_act216_inv_right, hIdx0]
    have h2 : sseCanFollow216 (sseAct216 w.reverse c) j = sseCanFollow216 c (sseCanonQ3OfSize (sseSize216 j)) := by
      rw [← sse_canFollow216_wf4 w, sse_act216_inv_right, hJw]
    have h3 : ssePairOrbit216 (sseAct216 w.reverse c) j = ssePairOrbit216 c (sseCanonQ3OfSize (sseSize216 j)) := by
      rw [← sse_pairOrbit216_wf4 w, sse_act216_inv_right, hJw]
    have h4 : ssePairOrbit216 (sseAct216 w.reverse c) (sseAdd0 j) =
        ssePairOrbit216 c (sseAdd0 (sseCanonQ3OfSize (sseSize216 j))) := by
      rw [← sse_pairOrbit216_wf4 w, sse_act216_inv_right, hAddW j hQ, hJw]
    rw [h1, h2, h3, h4, sse_canFollow216_eq_fast, sse_canFollow216_eq_fast]
  rw [hEq]
  rcases sse_q3_size_1_or_2 j hQ with h1 | h2
  · rw [h1]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.2.2.2.1
  · rw [h2]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.2.2.2.2.1

private theorem sse_sum_m2_any (j2 : Fin 216) (hQ : sseIsQ3 j2 = true) (F : Fin 57 × Fin 57 → Nat) :
    sseSumFinNat (fun j1 : Fin 216 =>
      if (sseIsQ3 j1 && sseCanFollow216 j1 j2) = true then
        F (ssePairOrbit216 j1 j2, ssePairOrbit216 (sseAdd0 j1) j2) else 0) =
      sseTableSum F (sseM2Tbl (sseSize216 j2)) := by
  let w := sseStab0Q3Word j2
  obtain ⟨hFix0, hJw, _⟩ := (sse_q3_all_props j2).2.1 hQ
  obtain ⟨_, _, hAddW⟩ := sse_stab0_preserves_q3_and_add0 w hFix0
  have hFix0Rev : sseApplyWord w.reverse sse_v0 = sse_v0 := by
    have h := congrArg (sseApplyWord w.reverse) hFix0; rw [sse_applyWord_inv] at h; exact h.symm
  obtain ⟨_, hQ3Rev, _⟩ := sse_stab0_preserves_q3_and_add0 w.reverse hFix0Rev
  rw [← sse_sumFinNat_bij (sseAct216 w.reverse) (sseAct216 w) (sse_act216_inv_right w) (sse_act216_inv w)]
  have hEq : (fun j1 : Fin 216 =>
      if (sseIsQ3 (sseAct216 w.reverse j1) && sseCanFollow216 (sseAct216 w.reverse j1) j2) = true then
        F (ssePairOrbit216 (sseAct216 w.reverse j1) j2, ssePairOrbit216 (sseAdd0 (sseAct216 w.reverse j1)) j2) else 0) =
    (fun j1 : Fin 216 =>
      if (sseIsQ3 j1 && sse_canFollowFast j1 (sseCanonQ3OfSize (sseSize216 j2))) = true then
        F (ssePairOrbit216 j1 (sseCanonQ3OfSize (sseSize216 j2)),
           ssePairOrbit216 (sseAdd0 j1) (sseCanonQ3OfSize (sseSize216 j2))) else 0) := by
    funext j1
    have h1 : sseIsQ3 (sseAct216 w.reverse j1) = sseIsQ3 j1 := hQ3Rev j1
    have h2 : sseCanFollow216 (sseAct216 w.reverse j1) j2 = sseCanFollow216 j1 (sseCanonQ3OfSize (sseSize216 j2)) := by
      rw [← sse_canFollow216_wf4 w, sse_act216_inv_right, hJw]
    have h3 : ssePairOrbit216 (sseAct216 w.reverse j1) j2 = ssePairOrbit216 j1 (sseCanonQ3OfSize (sseSize216 j2)) := by
      rw [← sse_pairOrbit216_wf4 w, sse_act216_inv_right, hJw]
    rw [h1, h2, h3, sse_canFollow216_eq_fast]
    if hQj1 : sseIsQ3 j1 = true then
      have hQrev : sseIsQ3 (sseAct216 w.reverse j1) = true := by rw [hQ3Rev j1, hQj1]
      have h4 : ssePairOrbit216 (sseAdd0 (sseAct216 w.reverse j1)) j2 =
          ssePairOrbit216 (sseAdd0 j1) (sseCanonQ3OfSize (sseSize216 j2)) := by
        rw [← sse_pairOrbit216_wf4 w, hAddW _ hQrev, sse_act216_inv_right, hJw]
      rw [h4]
    else
      have hF : sseIsQ3 j1 = false := by cases hq : sseIsQ3 j1; rfl; exact absurd hq hQj1
      rw [hF]; rfl
  rw [hEq]
  rcases sse_q3_size_1_or_2 j2 hQ with h1 | h2
  · rw [h1]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.2.2.2.2.2.1
  · rw [h2]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.2.2.2.2.2.2.1

private theorem sse_sum_q3In_any (jb : Fin 216) (hQ : sseIsQ3 jb = true) (F : Fin 57 → Nat) :
    sseSumFinNat (fun ja : Fin 216 =>
      if (sseIsQ3 ja && sseCanFollow216 ja jb) = true then F (ssePairOrbit216 ja jb) else 0) =
      sseTableSum F (sseQ3InTbl (sseSize216 jb)) := by
  let w := sseStab0Q3Word jb
  obtain ⟨hFix0, hJw, _⟩ := (sse_q3_all_props jb).2.1 hQ
  have hFix0Rev : sseApplyWord w.reverse sse_v0 = sse_v0 := by
    have h := congrArg (sseApplyWord w.reverse) hFix0; rw [sse_applyWord_inv] at h; exact h.symm
  obtain ⟨_, hQ3Rev, _⟩ := sse_stab0_preserves_q3_and_add0 w.reverse hFix0Rev
  rw [← sse_sumFinNat_bij (sseAct216 w.reverse) (sseAct216 w) (sse_act216_inv_right w) (sse_act216_inv w)]
  have hEq : (fun ja : Fin 216 =>
      if (sseIsQ3 (sseAct216 w.reverse ja) && sseCanFollow216 (sseAct216 w.reverse ja) jb) = true then
        F (ssePairOrbit216 (sseAct216 w.reverse ja) jb) else 0) =
    (fun ja : Fin 216 =>
      if (sseIsQ3 ja && sse_canFollowFast ja (sseCanonQ3OfSize (sseSize216 jb))) = true then
        F (ssePairOrbit216 ja (sseCanonQ3OfSize (sseSize216 jb))) else 0) := by
    funext ja
    have h1 := hQ3Rev ja
    have h2 : sseCanFollow216 (sseAct216 w.reverse ja) jb = sseCanFollow216 ja (sseCanonQ3OfSize (sseSize216 jb)) := by
      rw [← sse_canFollow216_wf4 w, sse_act216_inv_right, hJw]
    have h3 : ssePairOrbit216 (sseAct216 w.reverse ja) jb = ssePairOrbit216 ja (sseCanonQ3OfSize (sseSize216 jb)) := by
      rw [← sse_pairOrbit216_wf4 w, sse_act216_inv_right, hJw]
    rw [h1, h2, h3, sse_canFollow216_eq_fast]
  rw [hEq]
  rcases sse_q3_size_1_or_2 jb hQ with h1 | h2
  · rw [h1]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.2.2.2.2.2.2.2.1
  · rw [h2]; exact sse_checkGroupTbl_sound 8 (by decide) _ _ _ F sse_orbit_tables_verified.2.2.2.2.2.2.2.2

-- All-depth prefix squared-weight induction: `sseWordsEnd k c (prefixProd^2) = sseZAt om k (size c)`!
private theorem sse_wordsEnd_prefixProdSq (om : Fin 57 → Nat) :
    ∀ (k : Nat) (_hk : k ≥ 1) (c : Fin 216),
      sseWordsEnd k c (fun w => ssePrefixProd om w * ssePrefixProd om w) = sseZAt om k (sseSize216 c) := by
  intro k; induction k with
  | zero => intro hk; omega
  | succ n ih =>
    intro _ c
    cases n with
    | zero =>
      change 1 * 1 = match sseSize216 c with | 1 => 1 | 2 => 1 | _ => 1
      cases sseSize216 c with | zero => rfl | succ m => cases m with | zero => rfl | succ m2 => cases m2 <;> rfl
    | succ m =>
      simp only [sseWordsEnd]
      have hStep : sseSumFinNat (fun p : Fin 216 =>
            if sseCanFollow216 p c = true then
              sseWordsEnd (m + 1) p (fun rev => ssePrefixProd om (c :: rev) * ssePrefixProd om (c :: rev))
            else 0) =
          sseSumFinNat (fun p : Fin 216 =>
            if sseCanFollow216 p c = true then
              om (ssePairOrbit216 p c) * om (ssePairOrbit216 p c) * sseZAt om (m + 1) (sseOrbitS1 (ssePairOrbit216 p c))
            else 0) := by
        apply sse_sumFinNat_congr; intro p
        if hF : sseCanFollow216 p c = true then
          rw [sse_ite_pos hF, sse_ite_pos hF]
          have hMul : sseWordsEnd (m + 1) p (fun rev => ssePrefixProd om (c :: rev) * ssePrefixProd om (c :: rev)) =
              (om (ssePairOrbit216 p c) * om (ssePairOrbit216 p c)) *
                sseWordsEnd (m + 1) p (fun rev => ssePrefixProd om rev * ssePrefixProd om rev) := by
            rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head m p]
            have hR := (sse_wordsEnd_head m p (fun rev =>
              (om (ssePairOrbit216 p c) * om (ssePairOrbit216 p c)) * (ssePrefixProd om rev * ssePrefixProd om rev))).symm
            rw [hR]
            apply sse_wordsEnd_congr; intro rev _
            cases rev with
            | nil => rfl
            | cons h rs =>
              dsimp only
              if hh : h = p then
                rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                simp only [ssePrefixProd]
                have hA : ∀ x y : Nat, (x * y) * (x * y) = (x * x) * (y * y) := by
                  intro x y; rw [Nat.mul_assoc, Nat.mul_left_comm y x y, ← Nat.mul_assoc]
                exact hA _ _
              else rw [sse_ite_neg hh, sse_ite_neg hh]
          rw [hMul, ih (by omega) p, (sse_pairOrbit_sizes p c hF).1]
        else
          rw [sse_ite_neg hF, sse_ite_neg hF]
      rw [hStep, sse_sum_inOrbit_any c (fun o => om o * om o * sseZAt om (m + 1) (sseOrbitS1 o))]
      have hSz : sseSize216 c = 1 ∨ sseSize216 c = 2 ∨ sseSize216 c = 3 := by
        unfold sseSize216; cases sseClique216 c <;> simp [sseCliqueSize]
      rcases hSz with h1 | h2 | h3
      · rw [h1]; rfl
      · rw [h2]; rfl
      · rw [h3]; rfl

-- Helper: summing a size-dependent function over `Fin 216` or over `Q_3`!
private theorem sse_sum_by_size216 (f : Nat → Nat) :
    sseSumFinNat (fun c : Fin 216 => f (sseSize216 c)) = 24 * f 1 + 96 * f 2 + 96 * f 3 := by
  have hPt : ∀ c : Fin 216, f (sseSize216 c) =
      (if sseSize216 c = 1 then 1 else 0) * f 1 +
      ((if sseSize216 c = 2 then 1 else 0) * f 2 + (if sseSize216 c = 3 then 1 else 0) * f 3) := by
    intro c
    have hSz : sseSize216 c = 1 ∨ sseSize216 c = 2 ∨ sseSize216 c = 3 := by
      unfold sseSize216; cases sseClique216 c <;> simp [sseCliqueSize]
    rcases hSz with h1 | h2 | h3
    · rw [h1]; simp
    · rw [h2]; simp
    · rw [h3]; simp
  rw [sse_sumFinNat_congr _ _ hPt, sse_sumFinNat_add, sse_sumFinNat_add,
      sse_sumFinNat_mul_right, sse_sumFinNat_mul_right, sse_sumFinNat_mul_right,
      sse_cliques216_size_counts.1, sse_cliques216_size_counts.2.1, sse_cliques216_size_counts.2.2]; omega

private theorem sse_sum_q3_by_size (f : Nat → Nat) :
    sseSumFinNat (fun j : Fin 216 => if sseIsQ3 j = true then f (sseSize216 j) else 0) = 8 * f 1 + 12 * f 2 := by
  have hPt : ∀ j : Fin 216, (if sseIsQ3 j = true then f (sseSize216 j) else 0) =
      (if (sseIsQ3 j && decide (sseSize216 j = 1)) = true then 1 else 0) * f 1 +
      (if (sseIsQ3 j && decide (sseSize216 j = 2)) = true then 1 else 0) * f 2 := by
    intro j
    if hQ : sseIsQ3 j = true then
      rw [sse_ite_pos hQ, hQ]
      rcases sse_q3_size_1_or_2 j hQ with h1 | h2
      · rw [h1]; simp
      · rw [h2]; simp
    else
      have hF : sseIsQ3 j = false := by cases hq : sseIsQ3 j; rfl; exact absurd hq hQ
      rw [sse_ite_neg hQ, hF]; simp
  rw [sse_sumFinNat_congr _ _ hPt, sse_sumFinNat_add, sse_sumFinNat_mul_right, sse_sumFinNat_mul_right,
      sse_q3_counts.2.1, sse_q3_counts.2.2.1]

-- Exact norm identity `sseCFExactNormSq K W om v = sseCF1NormSq K W om v` for ALL `K, W, om, v`!
private theorem sse_cf_exact_normSq_eq (K : Nat) (W : Nat → Nat) (om v : Fin 57 → Nat) :
    sseCFExactNormSq K W om v = sseCF1NormSq K W om v := by
  unfold sseCFExactNormSq sseCF1NormSq
  have hTerm : ∀ k : Nat,
      (if k ≥ 2 then sseSumFinNat (fun c : Fin 216 => sseWordsEnd k c (fun w => ssePsi W om v w * ssePsi W om v w)) else 0) =
      (if k ≥ 2 then W k * W k *
        (24 * sseTableSum (fun o => om o * om o * v o * v o * sseZAt om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1) +
         96 * sseTableSum (fun o => om o * om o * v o * v o * sseZAt om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2) +
         96 * sseTableSum (fun o => om o * om o * v o * v o * sseZAt om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3)) else 0) := by
    intro k
    cases k with
    | zero => rw [sse_ite_neg (by omega), sse_ite_neg (by omega)]
    | succ n =>
      cases n with
      | zero => rw [sse_ite_neg (by omega), sse_ite_neg (by omega)]
      | succ m =>
        rw [sse_ite_pos (by omega), sse_ite_pos (by omega)]
        have hEach : ∀ c : Fin 216,
            sseWordsEnd (m + 2) c (fun w => ssePsi W om v w * ssePsi W om v w) =
            (W (m + 2) * W (m + 2)) *
              sseTableSum (fun o => om o * om o * v o * v o * sseZAt om (m + 1) (sseOrbitS1 o)) (sseInOrbitTbl (sseSize216 c)) := by
          intro c
          simp only [sseWordsEnd]
          rw [← sse_sum_inOrbit_any c (fun o => om o * om o * v o * v o * sseZAt om (m + 1) (sseOrbitS1 o)),
              ← sse_sumFinNat_mul_left]
          apply sse_sumFinNat_congr; intro p
          if hF : sseCanFollow216 p c = true then
            rw [sse_ite_pos hF, sse_ite_pos hF]
            have hIn : sseWordsEnd (m + 1) p (fun rev => ssePsi W om v (c :: rev) * ssePsi W om v (c :: rev)) =
                (W (m + 2) * W (m + 2) * (om (ssePairOrbit216 p c) * om (ssePairOrbit216 p c) *
                  v (ssePairOrbit216 p c) * v (ssePairOrbit216 p c))) *
                sseWordsEnd (m + 1) p (fun rev => ssePrefixProd om rev * ssePrefixProd om rev) := by
              rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head m p]
              have hR := (sse_wordsEnd_head m p (fun rev =>
                (W (m + 2) * W (m + 2) * (om (ssePairOrbit216 p c) * om (ssePairOrbit216 p c) *
                  v (ssePairOrbit216 p c) * v (ssePairOrbit216 p c))) *
                (ssePrefixProd om rev * ssePrefixProd om rev))).symm
              rw [hR]
              apply sse_wordsEnd_congr; intro rev hlen
              cases rev with
              | nil => simp at hlen
              | cons h rs =>
                dsimp only
                if hh : h = p then
                  rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                  have hrl : rs.length + 2 = m + 2 := by simp at hlen; omega
                  simp only [ssePsi, ssePrefixProd, hrl]
                  exact sse_nat_mul_quad _ _ _ _ _ _ _
                else rw [sse_ite_neg hh, sse_ite_neg hh]
            rw [hIn, sse_wordsEnd_prefixProdSq om (m + 1) (by omega) p, (sse_pairOrbit_sizes p c hF).1, Nat.mul_assoc]
          else
            rw [sse_ite_neg hF, sse_ite_neg hF, Nat.mul_zero]
        rw [sse_sumFinNat_congr _ _ hEach, sse_sumFinNat_mul_left,
            sse_sum_by_size216 (fun sz => sseTableSum (fun o => om o * om o * v o * v o * sseZAt om (m + 1) (sseOrbitS1 o)) (sseInOrbitTbl sz))]
        rfl
  have hSum : ∀ n (f g : Nat → Nat), (∀ i, f i = g i) → sumNat n f = sumNat n g := by
    intro n f g h; induction n with | zero => rfl | succ r ih => simp only [sumNat, ih, h]
  exact hSum (K + 1) _ _ hTerm

-- Exact slide-depth `m` mass induction for `m ≥ 1` and `k ≥ m + 1`!
private def sse_up0PairVal (W : Nat → Nat) (om v : Fin 57 → Nat) (w : List (Fin 216)) : Nat :=
  match sseInsert0Rev w with
  | some w' => ssePsi W om v w * ssePsi W om v w'
  | none => 0

private def sse_q3MassExact (om : Fin 57 → Nat) (k m : Nat) (j : Fin 216) : Nat :=
  sseWordsEnd k j (fun w =>
    if sseQ3SuffixLenRev w = m then
      match sseInsert0Rev w with
      | some w' => ssePrefixProd om w * ssePrefixProd om w'
      | none => 0
    else 0)

private def sse_q3MassPick (om : Fin 57 → Nat) (z : Nat × Nat × Nat) (m sz : Nat) : Nat :=
  let v := sseQ3MassVec om z m
  match sz with | 1 => v.1 | _ => v.2

private theorem sse_q3Mass_eq (om : Fin 57 → Nat) :
    ∀ (m : Nat) (_hm : m ≥ 1) (k : Nat) (_hk : k > m) (j : Fin 216) (_hQ : sseIsQ3 j = true),
      sse_q3MassExact om k m j = sse_q3MassPick om (sseZVec om (k - m)) m (sseSize216 j) := by
  intro m; induction m with
  | zero => intro hm; omega
  | succ m' ih =>
    intro _ k hk j hQ
    cases m' with
    | zero =>
      -- Base case `m = 1`, `k ≥ 2`
      cases k with
      | zero => omega
      | succ k1 =>
        cases k1 with
        | zero => omega
        | succ k2 =>
          unfold sse_q3MassExact
          simp only [sseWordsEnd]
          have hStep : sseSumFinNat (fun c : Fin 216 =>
              if sseCanFollow216 c j = true then
                sseWordsEnd (k2 + 1) c (fun rev =>
                  if sseQ3SuffixLenRev (j :: rev) = 1 then
                    match sseInsert0Rev (j :: rev) with
                    | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w'
                    | none => 0
                  else 0)
              else 0) =
            sseSumFinNat (fun c : Fin 216 =>
              if (sseCanFollow216 c sseIdx0 && sseCanFollow216 c j) = true then
                om (ssePairOrbit216 c j) * om (ssePairOrbit216 c (sseAdd0 j)) *
                  sseZAt om (k2 + 1) (sseOrbitS1 (ssePairOrbit216 c j))
              else 0) := by
            apply sse_sumFinNat_congr; intro c
            if hFj : sseCanFollow216 c j = true then
              rw [sse_ite_pos hFj]
              if hF0 : sseCanFollow216 c sseIdx0 = true then
                have hNotQ : sseIsQ3 c = false := thm_sse_q3_link_and_zero_cascade.2.2.2.2.2.2.2.2.1 c hF0
                have hAnd : (sseCanFollow216 c sseIdx0 && sseCanFollow216 c j) = true := by rw [hF0, hFj]; rfl
                rw [sse_ite_pos hAnd]
                have hMul : sseWordsEnd (k2 + 1) c (fun rev =>
                    if sseQ3SuffixLenRev (j :: rev) = 1 then
                      match sseInsert0Rev (j :: rev) with
                      | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w'
                      | none => 0
                    else 0) =
                  (om (ssePairOrbit216 c j) * om (ssePairOrbit216 c (sseAdd0 j))) *
                    sseWordsEnd (k2 + 1) c (fun rev => ssePrefixProd om rev * ssePrefixProd om rev) := by
                  rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head k2 c]
                  have hR := (sse_wordsEnd_head k2 c (fun rev =>
                    (om (ssePairOrbit216 c j) * om (ssePairOrbit216 c (sseAdd0 j))) *
                    (ssePrefixProd om rev * ssePrefixProd om rev))).symm
                  rw [hR]
                  apply sse_wordsEnd_congr; intro rev hlen
                  cases rev with
                  | nil => simp at hlen
                  | cons h rs =>
                    dsimp only
                    if hh : h = c then
                      rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                      simp only [sseQ3SuffixLenRev, hQ, hNotQ, ite_true,
                        Bool.false_eq_true, ite_false, sseInsert0Rev, hF0, ssePrefixProd]
                      have hA : ∀ a b d : Nat, (a * d) * (b * d) = (a * b) * (d * d) := by
                        intro a b d; rw [Nat.mul_assoc, Nat.mul_left_comm d b d, ← Nat.mul_assoc]
                      exact hA _ _ _
                    else rw [sse_ite_neg hh, sse_ite_neg hh]
                rw [hMul, sse_wordsEnd_prefixProdSq om (k2 + 1) (by omega) c, (sse_pairOrbit_sizes c j hFj).1]
              else
                have hF0f : sseCanFollow216 c sseIdx0 = false := by cases h : sseCanFollow216 c sseIdx0; rfl; exact absurd h hF0
                have hAndF : ¬ ((sseCanFollow216 c sseIdx0 && sseCanFollow216 c j) = true) := by rw [hF0f, Bool.false_and]; decide
                rw [sse_ite_neg hAndF, ← sse_wordsEnd_head k2 c]
                have hZ : sseWordsEnd (k2 + 1) c (fun rev => match rev with
                    | h :: _ => if h = c then (if sseQ3SuffixLenRev (j :: rev) = 1 then
                        match sseInsert0Rev (j :: rev) with | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w' | none => 0
                      else 0) else 0 | [] => 0) = sseWordsEnd (k2 + 1) c (fun _ => 0) := by
                  apply sse_wordsEnd_congr; intro rev hlen
                  cases rev with
                  | nil => simp at hlen
                  | cons h rs =>
                    dsimp only
                    if hh : h = c then
                      rw [sse_ite_pos hh, hh]
                      cases hQc : sseIsQ3 c
                      · simp only [sseQ3SuffixLenRev, hQ, hQc, ite_true,
                          Bool.false_eq_true, ite_false, sseInsert0Rev, hF0f]
                      · simp only [sseQ3SuffixLenRev, hQ, hQc, ite_true]
                        rw [sse_ite_neg (by omega)]
                    else rw [sse_ite_neg hh]
                rw [hZ, sse_wordsEnd_zero]
            else
              have hFjf : sseCanFollow216 c j = false := by cases h : sseCanFollow216 c j; rfl; exact absurd h hFj
              have hAndF : ¬ ((sseCanFollow216 c sseIdx0 && sseCanFollow216 c j) = true) := by rw [hFjf, Bool.and_false]; decide
              rw [sse_ite_neg hFj, sse_ite_neg hAndF]
          rw [hStep, sse_sum_m1_any j hQ (fun p => om p.1 * om p.2 * sseZAt om (k2 + 1) (sseOrbitS1 p.1))]
          have hSub : k2 + 2 - 1 = k2 + 1 := by omega
          rw [hSub]
          rcases sse_q3_size_1_or_2 j hQ with h1 | h2
          · rw [h1]; rfl
          · rw [h2]; rfl
    | succ m'' =>
      -- Inductive cases `m = 2` (`m'' = 0`) and `m ≥ 3` (`m'' ≥ 1`)!
      cases k with
      | zero => omega
      | succ k1 =>
        cases k1 with
        | zero => omega
        | succ k2 =>
          unfold sse_q3MassExact
          simp only [sseWordsEnd]
          cases m'' with
          | zero =>
            -- Case `m = 2`, `k = k2 + 2 ≥ 3`
            have hStep : sseSumFinNat (fun j1 : Fin 216 =>
                if sseCanFollow216 j1 j = true then
                  sseWordsEnd (k2 + 1) j1 (fun rev =>
                    if sseQ3SuffixLenRev (j :: rev) = 2 then
                      match sseInsert0Rev (j :: rev) with
                      | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w'
                      | none => 0
                    else 0)
                else 0) =
              sseSumFinNat (fun j1 : Fin 216 =>
                if (sseIsQ3 j1 && sseCanFollow216 j1 j) = true then
                  om (ssePairOrbit216 j1 j) * om (ssePairOrbit216 (sseAdd0 j1) j) *
                    sse_q3MassPick om (sseZVec om (k2 + 1 - 1)) 1 (sseOrbitS1 (ssePairOrbit216 j1 j))
                else 0) := by
              apply sse_sumFinNat_congr; intro j1
              if hFj : sseCanFollow216 j1 j = true then
                rw [sse_ite_pos hFj]
                if hQ1 : sseIsQ3 j1 = true then
                  have hAnd : (sseIsQ3 j1 && sseCanFollow216 j1 j) = true := by rw [hQ1, hFj]; rfl
                  rw [sse_ite_pos hAnd]
                  have hMul : sseWordsEnd (k2 + 1) j1 (fun rev =>
                      if sseQ3SuffixLenRev (j :: rev) = 2 then
                        match sseInsert0Rev (j :: rev) with
                        | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w'
                        | none => 0
                      else 0) =
                    (om (ssePairOrbit216 j1 j) * om (ssePairOrbit216 (sseAdd0 j1) j)) *
                      sse_q3MassExact om (k2 + 1) 1 j1 := by
                    unfold sse_q3MassExact
                    rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head k2 j1]
                    have hR := (sse_wordsEnd_head k2 j1 (fun rev =>
                      (om (ssePairOrbit216 j1 j) * om (ssePairOrbit216 (sseAdd0 j1) j)) *
                      (if sseQ3SuffixLenRev rev = 1 then
                        match sseInsert0Rev rev with | some w' => ssePrefixProd om rev * ssePrefixProd om w' | none => 0
                       else 0))).symm
                    rw [hR]
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      dsimp only
                      if hh : h = j1 then
                        rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                        cases rs with
                        | nil => simp at hlen; omega
                        | cons c cs =>
                          simp only [sseQ3SuffixLenRev, hQ, hQ1, ite_true]
                          cases hQc : sseIsQ3 c
                          · simp only [Bool.false_eq_true, ite_false, ite_true, sseInsert0Rev, hQ, hQ1, hQc]
                            cases hF0 : sseCanFollow216 c sseIdx0
                            · simp
                            · simp only [ite_true, ssePrefixProd]
                              have hA : ∀ a b x y : Nat, (a * x) * (b * y) = (a * b) * (x * y) := by
                                intro a b x y; rw [Nat.mul_assoc, Nat.mul_left_comm x b y, ← Nat.mul_assoc]
                              exact hA _ _ _ _
                          · simp only [ite_true]
                            rw [sse_ite_neg (by omega), sse_ite_neg (by omega), Nat.mul_zero]
                      else rw [sse_ite_neg hh, sse_ite_neg hh]
                  rw [hMul, ih (by omega) (k2 + 1) (by omega) j1 hQ1, (sse_pairOrbit_sizes j1 j hFj).1]
                else
                  have hQ1f : sseIsQ3 j1 = false := by cases h : sseIsQ3 j1; rfl; exact absurd h hQ1
                  have hAndF : ¬ ((sseIsQ3 j1 && sseCanFollow216 j1 j) = true) := by rw [hQ1f, Bool.false_and]; decide
                  rw [sse_ite_neg hAndF, ← sse_wordsEnd_head k2 j1]
                  have hZ : sseWordsEnd (k2 + 1) j1 (fun rev => match rev with
                      | h :: _ => if h = j1 then (if sseQ3SuffixLenRev (j :: rev) = 2 then
                          match sseInsert0Rev (j :: rev) with | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w' | none => 0
                        else 0) else 0 | [] => 0) = sseWordsEnd (k2 + 1) j1 (fun _ => 0) := by
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      dsimp only
                      if hh : h = j1 then
                        rw [sse_ite_pos hh, hh]
                        simp only [sseQ3SuffixLenRev, hQ, hQ1f, ite_true, Bool.false_eq_true, ite_false]
                        rw [sse_ite_neg (by decide : ¬ (0 + 1 = 2))]
                      else rw [sse_ite_neg hh]
                  rw [hZ, sse_wordsEnd_zero]
              else
                have hFjf : sseCanFollow216 j1 j = false := by cases h : sseCanFollow216 j1 j; rfl; exact absurd h hFj
                have hAndF : ¬ ((sseIsQ3 j1 && sseCanFollow216 j1 j) = true) := by rw [hFjf, Bool.and_false]; decide
                rw [sse_ite_neg hFj, sse_ite_neg hAndF]
            rw [hStep, sse_sum_m2_any j hQ (fun p => om p.1 * om p.2 * sse_q3MassPick om (sseZVec om (k2 + 1 - 1)) 1 (sseOrbitS1 p.1))]
            have hSub : k2 + 2 - 2 = k2 + 1 - 1 := by omega
            rw [hSub]
            rcases sse_q3_size_1_or_2 j hQ with h1 | h2
            · rw [h1]; rfl
            · rw [h2]; rfl
          | succ d =>
            -- Case `m = d + 3 ≥ 3`, `k = k2 + 2 > d + 3`
            have hStep : sseSumFinNat (fun p : Fin 216 =>
                if sseCanFollow216 p j = true then
                  sseWordsEnd (k2 + 1) p (fun rev =>
                    if sseQ3SuffixLenRev (j :: rev) = d + 3 then
                      match sseInsert0Rev (j :: rev) with
                      | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w'
                      | none => 0
                    else 0)
                else 0) =
              sseSumFinNat (fun p : Fin 216 =>
                if (sseIsQ3 p && sseCanFollow216 p j) = true then
                  om (ssePairOrbit216 p j) * om (ssePairOrbit216 p j) *
                    sse_q3MassPick om (sseZVec om (k2 + 1 - (d + 2))) (d + 2) (sseOrbitS1 (ssePairOrbit216 p j))
                else 0) := by
              apply sse_sumFinNat_congr; intro p
              if hFp : sseCanFollow216 p j = true then
                rw [sse_ite_pos hFp]
                if hQp : sseIsQ3 p = true then
                  have hAnd : (sseIsQ3 p && sseCanFollow216 p j) = true := by rw [hQp, hFp]; rfl
                  rw [sse_ite_pos hAnd]
                  have hMul : sseWordsEnd (k2 + 1) p (fun rev =>
                      if sseQ3SuffixLenRev (j :: rev) = d + 3 then
                        match sseInsert0Rev (j :: rev) with
                        | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w'
                        | none => 0
                      else 0) =
                    (om (ssePairOrbit216 p j) * om (ssePairOrbit216 p j)) *
                      sse_q3MassExact om (k2 + 1) (d + 2) p := by
                    unfold sse_q3MassExact
                    rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head k2 p]
                    have hR := (sse_wordsEnd_head k2 p (fun rev =>
                      (om (ssePairOrbit216 p j) * om (ssePairOrbit216 p j)) *
                      (if sseQ3SuffixLenRev rev = d + 2 then
                        match sseInsert0Rev rev with | some w' => ssePrefixProd om rev * ssePrefixProd om w' | none => 0
                       else 0))).symm
                    rw [hR]
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      dsimp only
                      if hh : h = p then
                        rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                        cases rs with
                        | nil => simp at hlen; omega
                        | cons r rss =>
                          simp only [sseQ3SuffixLenRev, hQ, hQp, ite_true]
                          cases hQr : sseIsQ3 r
                          · simp only [Bool.false_eq_true, ite_false]
                            rw [sse_ite_neg (by omega), sse_ite_neg (by omega), Nat.mul_zero]
                          · simp only [ite_true]
                            if hLenEq : sseQ3SuffixLenRev rss + 1 + 1 = d + 2 then
                              have hLenEq2 : sseQ3SuffixLenRev rss + 1 + 1 + 1 = d + 3 := by omega
                              rw [sse_ite_pos hLenEq2, sse_ite_pos hLenEq]
                              simp only [sseInsert0Rev, hQ, hQp, hQr, ite_true]
                              cases hIns : sseInsert0Rev (r :: rss) with
                              | none => simp
                              | some tail' =>
                                simp only [ssePrefixProd]
                                have hA : ∀ a x y : Nat, (a * x) * (a * y) = (a * a) * (x * y) := by
                                  intro a x y; rw [Nat.mul_assoc, Nat.mul_left_comm x a y, ← Nat.mul_assoc]
                                exact hA _ _ _
                            else
                              have hLenNe2 : ¬ (sseQ3SuffixLenRev rss + 1 + 1 + 1 = d + 3) := by omega
                              rw [sse_ite_neg hLenNe2, sse_ite_neg hLenEq, Nat.mul_zero]
                      else rw [sse_ite_neg hh, sse_ite_neg hh]
                  rw [hMul, ih (by omega) (k2 + 1) (by omega) p hQp, (sse_pairOrbit_sizes p j hFp).1]
                else
                  have hQpf : sseIsQ3 p = false := by cases h : sseIsQ3 p; rfl; exact absurd h hQp
                  have hAndF : ¬ ((sseIsQ3 p && sseCanFollow216 p j) = true) := by rw [hQpf, Bool.false_and]; decide
                  rw [sse_ite_neg hAndF, ← sse_wordsEnd_head k2 p]
                  have hZ : sseWordsEnd (k2 + 1) p (fun rev => match rev with
                      | h :: _ => if h = p then (if sseQ3SuffixLenRev (j :: rev) = d + 3 then
                          match sseInsert0Rev (j :: rev) with | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w' | none => 0
                        else 0) else 0 | [] => 0) = sseWordsEnd (k2 + 1) p (fun _ => 0) := by
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      dsimp only
                      if hh : h = p then
                        rw [sse_ite_pos hh, hh]
                        simp only [sseQ3SuffixLenRev, hQ, hQpf, ite_true, Bool.false_eq_true, ite_false]
                        rw [sse_ite_neg (by omega)]
                      else rw [sse_ite_neg hh]
                  rw [hZ, sse_wordsEnd_zero]
              else
                have hFpf : sseCanFollow216 p j = false := by cases h : sseCanFollow216 p j; rfl; exact absurd h hFp
                have hAndF : ¬ ((sseIsQ3 p && sseCanFollow216 p j) = true) := by rw [hFpf, Bool.and_false]; decide
                rw [sse_ite_neg hFp, sse_ite_neg hAndF]
            rw [hStep, sse_sum_q3In_any j hQ (fun o => om o * om o * sse_q3MassPick om (sseZVec om (k2 + 1 - (d + 2))) (d + 2) (sseOrbitS1 o))]
            have hSub : k2 + 2 - (d + 3) = k2 + 1 - (d + 2) := by omega
            rw [hSub]
            rcases sse_q3_size_1_or_2 j hQ with h1 | h2
            · rw [h1]; rfl
            · rw [h2]; rfl

-- Exact slide-depth `m` identity for `48 * ∑_{w ∈ CF(k), suffixLen w = m} ψ(w) ψ(w s_0) = sseCF1SliceAt W om v k m`!
private theorem sse_up0_slice_exact (W : Nat → Nat) (om v : Fin 57 → Nat)
    (k m : Nat) (hk2 : k ≥ 2) (hm : m < k) :
    48 * sseSumFinNat (fun c : Fin 216 => sseWordsEnd k c (fun w =>
      if sseQ3SuffixLenRev w = m then sse_up0PairVal W om v w else 0)) =
      sseCF1SliceAt W om v k m := by
  cases k with
  | zero => omega
  | succ k1 =>
    cases k1 with
    | zero => omega
    | succ k2 =>
      cases m with
      | zero =>
        -- Case `m = 0`, `k = k2 + 2`
        unfold sseCF1SliceAt
        apply congrArg (48 * ·)
        have hEach : ∀ c : Fin 216,
            sseWordsEnd (k2 + 2) c (fun w => if sseQ3SuffixLenRev w = 0 then sse_up0PairVal W om v w else 0) =
            if sseCanFollow216 c sseIdx0 = true then
              W (k2 + 2) * W (k2 + 3) * (om (ssePairOrbit216 c sseIdx0) * v (ssePairOrbit216 c sseIdx0) *
                sseTableSum (fun o => om o * om o * v o * sseZAt om (k2 + 1) (sseOrbitS1 o)) (sseInOrbitTbl (sseSize216 c)))
            else 0 := by
          intro c
          if hF0 : sseCanFollow216 c sseIdx0 = true then
            have hNotQ : sseIsQ3 c = false := thm_sse_q3_link_and_zero_cascade.2.2.2.2.2.2.2.2.1 c hF0
            rw [sse_ite_pos hF0]
            simp only [sseWordsEnd]
            rw [← sse_sum_inOrbit_any c (fun o => om o * om o * v o * sseZAt om (k2 + 1) (sseOrbitS1 o)),
                ← sse_sumFinNat_mul_left, ← sse_sumFinNat_mul_left]
            apply sse_sumFinNat_congr; intro p
            if hFp : sseCanFollow216 p c = true then
              rw [sse_ite_pos hFp, sse_ite_pos hFp]
              have hMul : sseWordsEnd (k2 + 1) p (fun rev =>
                  if sseQ3SuffixLenRev (c :: rev) = 0 then sse_up0PairVal W om v (c :: rev) else 0) =
                (W (k2 + 2) * W (k2 + 3) * (om (ssePairOrbit216 c sseIdx0) * v (ssePairOrbit216 c sseIdx0) *
                  (om (ssePairOrbit216 p c) * om (ssePairOrbit216 p c) * v (ssePairOrbit216 p c)))) *
                sseWordsEnd (k2 + 1) p (fun rev => ssePrefixProd om rev * ssePrefixProd om rev) := by
                rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head k2 p]
                have hR := (sse_wordsEnd_head k2 p (fun rev =>
                  (W (k2 + 2) * W (k2 + 3) * (om (ssePairOrbit216 c sseIdx0) * v (ssePairOrbit216 c sseIdx0) *
                    (om (ssePairOrbit216 p c) * om (ssePairOrbit216 p c) * v (ssePairOrbit216 p c)))) *
                  (ssePrefixProd om rev * ssePrefixProd om rev))).symm
                rw [hR]
                apply sse_wordsEnd_congr; intro rev hlen
                cases rev with
                | nil => simp at hlen
                | cons h rs =>
                  dsimp only
                  if hh : h = p then
                    rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                    have hrl : rs.length + 2 = k2 + 2 := by simp at hlen; omega
                    have hrl1 : rs.length + 1 + 2 = k2 + 3 := by omega
                    simp only [sseQ3SuffixLenRev, hNotQ, Bool.false_eq_true, ite_false,
                      ite_true, sse_up0PairVal, sseInsert0Rev, hF0, ssePsi, List.length, hrl, hrl1, ssePrefixProd]
                    exact sse_nat_mul_m0 _ _ _ _ _ _ _
                  else rw [sse_ite_neg hh, sse_ite_neg hh]
              rw [hMul, sse_wordsEnd_prefixProdSq om (k2 + 1) (by omega) p, (sse_pairOrbit_sizes p c hFp).1]
              simp only [Nat.mul_assoc]
            else
              rw [sse_ite_neg hFp, sse_ite_neg hFp, Nat.mul_zero, Nat.mul_zero]
          else
            have hF0f : sseCanFollow216 c sseIdx0 = false := by cases h : sseCanFollow216 c sseIdx0; rfl; exact absurd h hF0
            rw [sse_ite_neg hF0, ← sse_wordsEnd_head (k2 + 1) c]
            have hZ : sseWordsEnd (k2 + 2) c (fun w => match w with
                | h :: _ => if h = c then (if sseQ3SuffixLenRev w = 0 then sse_up0PairVal W om v w else 0) else 0
                | [] => 0) = sseWordsEnd (k2 + 2) c (fun _ => 0) := by
              apply sse_wordsEnd_congr; intro w hlen
              cases w with
              | nil => simp at hlen
              | cons h rs =>
                dsimp only
                if hh : h = c then
                  rw [sse_ite_pos hh, hh]
                  cases hQc : sseIsQ3 c
                  · cases rs with
                    | nil => simp at hlen
                    | cons r rss =>
                      simp only [sseQ3SuffixLenRev, hQc, Bool.false_eq_true, ite_false, ite_true,
                        sse_up0PairVal, sseInsert0Rev, hF0f]
                  · simp only [sseQ3SuffixLenRev, hQc, ite_true]
                    rw [sse_ite_neg (by omega)]
                else rw [sse_ite_neg hh]
            rw [hZ, sse_wordsEnd_zero]
        rw [sse_sumFinNat_congr _ _ hEach]
        have hOut : sseSumFinNat (fun c : Fin 216 =>
              if sseCanFollow216 c sseIdx0 = true then
                W (k2 + 2) * W (k2 + 3) * (om (ssePairOrbit216 c sseIdx0) * v (ssePairOrbit216 c sseIdx0) *
                  sseTableSum (fun o => om o * om o * v o * sseZAt om (k2 + 1) (sseOrbitS1 o)) (sseInOrbitTbl (sseSize216 c)))
              else 0) =
            (W (k2 + 2) * W (k2 + 3)) *
              sseSumFinNat (fun c : Fin 216 =>
                if sseCanFollow216 c sseIdx0 = true then
                  om (ssePairOrbit216 c sseIdx0) * v (ssePairOrbit216 c sseIdx0) *
                    (match sseOrbitS1 (ssePairOrbit216 c sseIdx0) with
                     | 1 => sseTableSum (fun o => om o * om o * v o * sseZAt om (k2 + 1) (sseOrbitS1 o)) (sseInOrbitTbl 1)
                     | 2 => sseTableSum (fun o => om o * om o * v o * sseZAt om (k2 + 1) (sseOrbitS1 o)) (sseInOrbitTbl 2)
                     | _ => sseTableSum (fun o => om o * om o * v o * sseZAt om (k2 + 1) (sseOrbitS1 o)) (sseInOrbitTbl 3))
                else 0) := by
          rw [← sse_sumFinNat_mul_left]
          apply sse_sumFinNat_congr; intro c
          if hF0 : sseCanFollow216 c sseIdx0 = true then
            rw [sse_ite_pos hF0, sse_ite_pos hF0, (sse_pairOrbit_sizes c sseIdx0 hF0).1]
            have hSz : sseSize216 c = 1 ∨ sseSize216 c = 2 ∨ sseSize216 c = 3 := by
              unfold sseSize216; cases sseClique216 c <;> simp [sseCliqueSize]
            rcases hSz with h1 | h2 | h3
            · rw [h1]; rfl
            · rw [h2]; rfl
            · rw [h3]; rfl
          else rw [sse_ite_neg hF0, sse_ite_neg hF0, Nat.mul_zero]
        rw [hOut, sse_sum_inOrbit_any sseIdx0 (fun o => om o * v o *
          (match sseOrbitS1 o with
           | 1 => sseTableSum (fun o' => om o' * om o' * v o' * sseZAt om (k2 + 1) (sseOrbitS1 o')) (sseInOrbitTbl 1)
           | 2 => sseTableSum (fun o' => om o' * om o' * v o' * sseZAt om (k2 + 1) (sseOrbitS1 o')) (sseInOrbitTbl 2)
           | _ => sseTableSum (fun o' => om o' * om o' * v o' * sseZAt om (k2 + 1) (sseOrbitS1 o')) (sseInOrbitTbl 3)))]; rfl
      | succ m' =>
        cases m' with
        | zero =>
          -- Case `m = 1`, `k = k2 + 2`
          unfold sseCF1SliceAt
          apply congrArg (48 * ·)
          have hEach : ∀ j : Fin 216,
              sseWordsEnd (k2 + 2) j (fun w => if sseQ3SuffixLenRev w = 1 then sse_up0PairVal W om v w else 0) =
              if sseIsQ3 j = true then
                W (k2 + 2) * W (k2 + 2) *
                  sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 * sseZAt om (k2 + 1) (sseOrbitS1 p.1)) (sseM1Tbl (sseSize216 j))
              else 0 := by
            intro j
            if hQj : sseIsQ3 j = true then
              rw [sse_ite_pos hQj]
              simp only [sseWordsEnd]
              rw [← sse_sum_m1_any j hQj (fun p => om p.1 * om p.2 * v p.1 * v p.2 * sseZAt om (k2 + 1) (sseOrbitS1 p.1)),
                  ← sse_sumFinNat_mul_left]
              apply sse_sumFinNat_congr; intro c
              if hFj : sseCanFollow216 c j = true then
                rw [sse_ite_pos hFj]
                if hF0 : sseCanFollow216 c sseIdx0 = true then
                  have hNotQ : sseIsQ3 c = false := thm_sse_q3_link_and_zero_cascade.2.2.2.2.2.2.2.2.1 c hF0
                  have hAnd : (sseCanFollow216 c sseIdx0 && sseCanFollow216 c j) = true := by rw [hF0, hFj]; rfl
                  rw [sse_ite_pos hAnd]
                  have hMul : sseWordsEnd (k2 + 1) c (fun rev =>
                      if sseQ3SuffixLenRev (j :: rev) = 1 then sse_up0PairVal W om v (j :: rev) else 0) =
                    (W (k2 + 2) * W (k2 + 2) * (om (ssePairOrbit216 c j) * om (ssePairOrbit216 c (sseAdd0 j)) *
                      v (ssePairOrbit216 c j) * v (ssePairOrbit216 c (sseAdd0 j)))) *
                    sseWordsEnd (k2 + 1) c (fun rev => ssePrefixProd om rev * ssePrefixProd om rev) := by
                    rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head k2 c]
                    have hR := (sse_wordsEnd_head k2 c (fun rev =>
                      (W (k2 + 2) * W (k2 + 2) * (om (ssePairOrbit216 c j) * om (ssePairOrbit216 c (sseAdd0 j)) *
                        v (ssePairOrbit216 c j) * v (ssePairOrbit216 c (sseAdd0 j)))) *
                      (ssePrefixProd om rev * ssePrefixProd om rev))).symm
                    rw [hR]
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      dsimp only
                      if hh : h = c then
                        rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                        have hrl : rs.length + 2 = k2 + 2 := by simp at hlen; omega
                        simp only [sseQ3SuffixLenRev, hQj, hNotQ, Bool.false_eq_true, ite_false,
                          ite_true, sse_up0PairVal, sseInsert0Rev, hF0, ssePsi, hrl, ssePrefixProd]
                        exact sse_nat_mul_quad _ _ _ _ _ _ _
                      else rw [sse_ite_neg hh, sse_ite_neg hh]
                  rw [hMul, sse_wordsEnd_prefixProdSq om (k2 + 1) (by omega) c, (sse_pairOrbit_sizes c j hFj).1, Nat.mul_assoc]
                else
                  have hF0f : sseCanFollow216 c sseIdx0 = false := by cases h : sseCanFollow216 c sseIdx0; rfl; exact absurd h hF0
                  have hAndF : ¬ ((sseCanFollow216 c sseIdx0 && sseCanFollow216 c j) = true) := by rw [hF0f, Bool.false_and]; decide
                  rw [sse_ite_neg hAndF, Nat.mul_zero, ← sse_wordsEnd_head k2 c]
                  have hZ : sseWordsEnd (k2 + 1) c (fun rev => match rev with
                      | h :: _ => if h = c then (if sseQ3SuffixLenRev (j :: rev) = 1 then sse_up0PairVal W om v (j :: rev) else 0) else 0
                      | [] => 0) = sseWordsEnd (k2 + 1) c (fun _ => 0) := by
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      dsimp only
                      if hh : h = c then
                        rw [sse_ite_pos hh, hh]
                        cases hQc : sseIsQ3 c
                        · simp only [sseQ3SuffixLenRev, hQj, hQc, ite_true,
                            Bool.false_eq_true, ite_false, sse_up0PairVal, sseInsert0Rev, hF0f]
                        · simp only [sseQ3SuffixLenRev, hQj, hQc, ite_true]
                          rw [sse_ite_neg (by omega)]
                      else rw [sse_ite_neg hh]
                  rw [hZ, sse_wordsEnd_zero]
              else
                have hFjf : sseCanFollow216 c j = false := by cases h : sseCanFollow216 c j; rfl; exact absurd h hFj
                have hAndF : ¬ ((sseCanFollow216 c sseIdx0 && sseCanFollow216 c j) = true) := by rw [hFjf, Bool.and_false]; decide
                rw [sse_ite_neg hFj, sse_ite_neg hAndF, Nat.mul_zero]
            else
              have hQjf : sseIsQ3 j = false := by cases h : sseIsQ3 j; rfl; exact absurd h hQj
              rw [sse_ite_neg hQj, ← sse_wordsEnd_head (k2 + 1) j]
              have hZ : sseWordsEnd (k2 + 2) j (fun w => match w with
                  | h :: _ => if h = j then (if sseQ3SuffixLenRev w = 1 then sse_up0PairVal W om v w else 0) else 0
                  | [] => 0) = sseWordsEnd (k2 + 2) j (fun _ => 0) := by
                apply sse_wordsEnd_congr; intro w hlen
                cases w with
                | nil => simp at hlen
                | cons h rs =>
                  dsimp only
                  if hh : h = j then
                    rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQjf, Bool.false_eq_true, ite_false]
                    rw [sse_ite_neg (by decide : ¬ (0 = 1))]
                  else rw [sse_ite_neg hh]
              rw [hZ, sse_wordsEnd_zero]
          rw [sse_sumFinNat_congr _ _ hEach]
          have hOut : sseSumFinNat (fun j : Fin 216 => if sseIsQ3 j = true then
                W (k2 + 2) * W (k2 + 2) *
                  sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 * sseZAt om (k2 + 1) (sseOrbitS1 p.1)) (sseM1Tbl (sseSize216 j))
              else 0) =
              W (k2 + 2) * W (k2 + 2) * sseSumFinNat (fun j : Fin 216 => if sseIsQ3 j = true then
                sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 * sseZAt om (k2 + 1) (sseOrbitS1 p.1)) (sseM1Tbl (sseSize216 j))
              else 0) := by
            rw [← sse_sumFinNat_mul_left]
            apply sse_sumFinNat_congr; intro j
            if hQ : sseIsQ3 j = true then rw [sse_ite_pos hQ, sse_ite_pos hQ]
            else rw [sse_ite_neg hQ, sse_ite_neg hQ, Nat.mul_zero]
          rw [hOut, sse_sum_q3_by_size (fun sz => sseTableSum
            (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 * sseZAt om (k2 + 1) (sseOrbitS1 p.1))
            (sseM1Tbl sz))]; rfl
        | succ m'' =>
          cases m'' with
          | zero =>
            -- Case `m = 2`, `k = k2 + 2 ≥ 3`
            unfold sseCF1SliceAt
            apply congrArg (48 * ·)
            have hEach : ∀ j2 : Fin 216,
                sseWordsEnd (k2 + 2) j2 (fun w => if sseQ3SuffixLenRev w = 2 then sse_up0PairVal W om v w else 0) =
                if sseIsQ3 j2 = true then
                  W (k2 + 2) * W (k2 + 2) *
                    sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 *
                      sse_q3MassPick om (sseZVec om (k2 + 1 - 1)) 1 (sseOrbitS1 p.1)) (sseM2Tbl (sseSize216 j2))
                else 0 := by
              intro j2
              if hQj : sseIsQ3 j2 = true then
                rw [sse_ite_pos hQj]; simp only [sseWordsEnd]
                rw [← sse_sum_m2_any j2 hQj (fun p => om p.1 * om p.2 * v p.1 * v p.2 *
                      sse_q3MassPick om (sseZVec om (k2 + 1 - 1)) 1 (sseOrbitS1 p.1)),
                    ← sse_sumFinNat_mul_left]
                apply sse_sumFinNat_congr; intro j1
                if hFj : sseCanFollow216 j1 j2 = true then
                  rw [sse_ite_pos hFj]
                  if hQ1 : sseIsQ3 j1 = true then
                    have hAnd : (sseIsQ3 j1 && sseCanFollow216 j1 j2) = true := by rw [hQ1, hFj]; rfl
                    rw [sse_ite_pos hAnd]
                    have hMul : sseWordsEnd (k2 + 1) j1 (fun rev =>
                        if sseQ3SuffixLenRev (j2 :: rev) = 2 then sse_up0PairVal W om v (j2 :: rev) else 0) =
                      (W (k2 + 2) * W (k2 + 2) * (om (ssePairOrbit216 j1 j2) * om (ssePairOrbit216 (sseAdd0 j1) j2) *
                        v (ssePairOrbit216 j1 j2) * v (ssePairOrbit216 (sseAdd0 j1) j2))) *
                      sse_q3MassExact om (k2 + 1) 1 j1 := by
                      unfold sse_q3MassExact
                      rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head k2 j1]
                      have hR := (sse_wordsEnd_head k2 j1 (fun rev =>
                        (W (k2 + 2) * W (k2 + 2) * (om (ssePairOrbit216 j1 j2) * om (ssePairOrbit216 (sseAdd0 j1) j2) *
                          v (ssePairOrbit216 j1 j2) * v (ssePairOrbit216 (sseAdd0 j1) j2))) *
                        (if sseQ3SuffixLenRev rev = 1 then
                          match sseInsert0Rev rev with | some w' => ssePrefixProd om rev * ssePrefixProd om w' | none => 0
                         else 0))).symm
                      rw [hR]
                      apply sse_wordsEnd_congr; intro rev hlen
                      cases rev with
                      | nil => simp at hlen
                      | cons h rs =>
                        dsimp only
                        if hh : h = j1 then
                          rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                          cases rs with
                          | nil => simp at hlen; omega
                          | cons c cs =>
                            have hrl : cs.length + 1 + 2 = k2 + 2 := by simp at hlen; omega
                            simp only [sseQ3SuffixLenRev, hQj, hQ1, ite_true]
                            cases hQc : sseIsQ3 c
                            · simp only [Bool.false_eq_true, ite_false, ite_true,
                                sse_up0PairVal, sseInsert0Rev, hQj, hQ1, hQc]
                              cases hF0 : sseCanFollow216 c sseIdx0
                              · simp
                              · simp only [ite_true, ssePsi, List.length, hrl, ssePrefixProd]
                                exact sse_nat_mul_quad _ _ _ _ _ _ _
                            · simp only [ite_true]
                              rw [sse_ite_neg (by omega), sse_ite_neg (by omega), Nat.mul_zero]
                        else rw [sse_ite_neg hh, sse_ite_neg hh]
                    rw [hMul, sse_q3Mass_eq om 1 (by omega) (k2 + 1) (by omega) j1 hQ1, (sse_pairOrbit_sizes j1 j2 hFj).1, Nat.mul_assoc]
                  else
                    have hQ1f : sseIsQ3 j1 = false := by cases h : sseIsQ3 j1; rfl; exact absurd h hQ1
                    have hAndF : ¬ ((sseIsQ3 j1 && sseCanFollow216 j1 j2) = true) := by rw [hQ1f, Bool.false_and]; decide
                    rw [sse_ite_neg hAndF, Nat.mul_zero, ← sse_wordsEnd_head k2 j1]
                    have hZ : sseWordsEnd (k2 + 1) j1 (fun rev => match rev with
                        | h :: _ => if h = j1 then (if sseQ3SuffixLenRev (j2 :: rev) = 2 then sse_up0PairVal W om v (j2 :: rev) else 0) else 0
                        | [] => 0) = sseWordsEnd (k2 + 1) j1 (fun _ => 0) := by
                      apply sse_wordsEnd_congr; intro rev hlen
                      cases rev with
                      | nil => simp at hlen
                      | cons h rs =>
                        dsimp only
                        if hh : h = j1 then
                          rw [sse_ite_pos hh, hh]
                          simp only [sseQ3SuffixLenRev, hQj, hQ1f, ite_true, Bool.false_eq_true, ite_false]
                          rw [sse_ite_neg (by decide : ¬ (0 + 1 = 2))]
                        else rw [sse_ite_neg hh]
                    rw [hZ, sse_wordsEnd_zero]
                else
                  have hFjf : sseCanFollow216 j1 j2 = false := by cases h : sseCanFollow216 j1 j2; rfl; exact absurd h hFj
                  have hAndF : ¬ ((sseIsQ3 j1 && sseCanFollow216 j1 j2) = true) := by rw [hFjf, Bool.and_false]; decide
                  rw [sse_ite_neg hFj, sse_ite_neg hAndF, Nat.mul_zero]
              else
                have hQjf : sseIsQ3 j2 = false := by cases h : sseIsQ3 j2; rfl; exact absurd h hQj
                rw [sse_ite_neg hQj, ← sse_wordsEnd_head (k2 + 1) j2]
                have hZ : sseWordsEnd (k2 + 2) j2 (fun w => match w with
                    | h :: _ => if h = j2 then (if sseQ3SuffixLenRev w = 2 then sse_up0PairVal W om v w else 0) else 0
                    | [] => 0) = sseWordsEnd (k2 + 2) j2 (fun _ => 0) := by
                  apply sse_wordsEnd_congr; intro w hlen
                  cases w with
                  | nil => simp at hlen
                  | cons h rs =>
                    dsimp only
                    if hh : h = j2 then
                      rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQjf, Bool.false_eq_true, ite_false]
                      rw [sse_ite_neg (by decide : ¬ (0 = 2))]
                    else rw [sse_ite_neg hh]
                rw [hZ, sse_wordsEnd_zero]
            rw [sse_sumFinNat_congr _ _ hEach]
            have hOut : sseSumFinNat (fun j2 : Fin 216 => if sseIsQ3 j2 = true then
                  W (k2 + 2) * W (k2 + 2) * sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 *
                    sse_q3MassPick om (sseZVec om (k2 + 1 - 1)) 1 (sseOrbitS1 p.1)) (sseM2Tbl (sseSize216 j2))
                else 0) =
                W (k2 + 2) * W (k2 + 2) * sseSumFinNat (fun j2 : Fin 216 => if sseIsQ3 j2 = true then
                  sseTableSum (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 *
                    sse_q3MassPick om (sseZVec om (k2 + 1 - 1)) 1 (sseOrbitS1 p.1)) (sseM2Tbl (sseSize216 j2))
                else 0) := by
              rw [← sse_sumFinNat_mul_left]
              apply sse_sumFinNat_congr; intro j2
              if hQ : sseIsQ3 j2 = true then rw [sse_ite_pos hQ, sse_ite_pos hQ]
              else rw [sse_ite_neg hQ, sse_ite_neg hQ, Nat.mul_zero]
            have hSub : k2 + 1 - 1 = k2 + 2 - 2 := by omega
            rw [hOut, hSub, sse_sum_q3_by_size (fun sz => sseTableSum
              (fun p : Fin 57 × Fin 57 => om p.1 * om p.2 * v p.1 * v p.2 *
                sse_q3MassPick om (sseZVec om (k2 + 2 - 2)) 1 (sseOrbitS1 p.1)) (sseM2Tbl sz))]; rfl
          | succ d =>
            -- Case `m = d + 3 ≥ 3`, `k = k2 + 2 > d + 3`
            unfold sseCF1SliceAt
            apply congrArg (48 * ·)
            have hInsLen : ∀ (u : List (Fin 216)) (u' : List (Fin 216)),
                sseQ3SuffixLenRev u ≥ 1 → sseInsert0Rev u = some u' → u'.length = u.length := by
              intro u; induction u with
              | nil => intro _ h1; simp [sseQ3SuffixLenRev] at h1
              | cons x xs ihu =>
                intro u' h1 h2
                cases hQx : sseIsQ3 x
                · simp [sseQ3SuffixLenRev, hQx] at h1
                · cases xs with
                  | nil =>
                    simp only [sseInsert0Rev, hQx, ite_true] at h2
                    cases h2; rfl
                  | cons y ys =>
                    cases hQy : sseIsQ3 y
                    · simp only [sseInsert0Rev, hQx, hQy, ite_true, Bool.false_eq_true, ite_false] at h2
                      cases hFy : sseCanFollow216 y sseIdx0 <;> simp [hFy] at h2
                      subst h2; rfl
                    · simp only [sseInsert0Rev, hQx, hQy, ite_true] at h2
                      cases hIns : sseInsert0Rev (y :: ys) with
                      | none => simp [hIns] at h2
                      | some rs' =>
                        simp only [hIns] at h2; cases h2
                        have hSub := ihu rs' (by simp [sseQ3SuffixLenRev, hQy]) hIns
                        simp [hSub]
            have hEach : ∀ j : Fin 216,
                sseWordsEnd (k2 + 2) j (fun w => if sseQ3SuffixLenRev w = d + 3 then sse_up0PairVal W om v w else 0) =
                if sseIsQ3 j = true then
                  W (k2 + 2) * W (k2 + 2) *
                    sseTableSum (fun o : Fin 57 => om o * om o * v o * v o *
                      sse_q3MassPick om (sseZVec om (k2 + 1 - (d + 2))) (d + 2) (sseOrbitS1 o)) (sseQ3InTbl (sseSize216 j))
                else 0 := by
              intro j
              if hQj : sseIsQ3 j = true then
                rw [sse_ite_pos hQj]; simp only [sseWordsEnd]
                rw [← sse_sum_q3In_any j hQj (fun o => om o * om o * v o * v o *
                      sse_q3MassPick om (sseZVec om (k2 + 1 - (d + 2))) (d + 2) (sseOrbitS1 o)),
                    ← sse_sumFinNat_mul_left]
                apply sse_sumFinNat_congr; intro p
                if hFp : sseCanFollow216 p j = true then
                  rw [sse_ite_pos hFp]
                  if hQp : sseIsQ3 p = true then
                    have hAnd : (sseIsQ3 p && sseCanFollow216 p j) = true := by rw [hQp, hFp]; rfl
                    rw [sse_ite_pos hAnd]
                    have hMul : sseWordsEnd (k2 + 1) p (fun rev =>
                        if sseQ3SuffixLenRev (j :: rev) = d + 3 then sse_up0PairVal W om v (j :: rev) else 0) =
                      (W (k2 + 2) * W (k2 + 2) * (om (ssePairOrbit216 p j) * om (ssePairOrbit216 p j) *
                        v (ssePairOrbit216 p j) * v (ssePairOrbit216 p j))) *
                      sse_q3MassExact om (k2 + 1) (d + 2) p := by
                      unfold sse_q3MassExact
                      rw [← sse_wordsEnd_mul_left, ← sse_wordsEnd_head k2 p]
                      have hR := (sse_wordsEnd_head k2 p (fun rev =>
                        (W (k2 + 2) * W (k2 + 2) * (om (ssePairOrbit216 p j) * om (ssePairOrbit216 p j) *
                          v (ssePairOrbit216 p j) * v (ssePairOrbit216 p j))) *
                        (if sseQ3SuffixLenRev rev = d + 2 then
                          match sseInsert0Rev rev with | some w' => ssePrefixProd om rev * ssePrefixProd om w' | none => 0
                         else 0))).symm
                      rw [hR]
                      apply sse_wordsEnd_congr; intro rev hlen
                      cases rev with
                      | nil => simp at hlen
                      | cons h rs =>
                        dsimp only
                        if hh : h = p then
                          rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                          cases rs with
                          | nil => simp at hlen; omega
                          | cons r rss =>
                            simp only [sseQ3SuffixLenRev, hQj, hQp, ite_true]
                            cases hQr : sseIsQ3 r
                            · simp only [Bool.false_eq_true, ite_false]
                              rw [sse_ite_neg (by omega), sse_ite_neg (by omega), Nat.mul_zero]
                            · simp only [ite_true]
                              if hLenEq : sseQ3SuffixLenRev rss + 1 + 1 = d + 2 then
                                have hLenEq2 : sseQ3SuffixLenRev rss + 1 + 1 + 1 = d + 3 := by omega
                                rw [sse_ite_pos hLenEq2, sse_ite_pos hLenEq]
                                simp only [sse_up0PairVal, sseInsert0Rev, hQj, hQp, hQr, ite_true]
                                cases hIns : sseInsert0Rev (r :: rss) with
                                | none => simp
                                | some tail' =>
                                  have hTLen : tail'.length = (r :: rss).length :=
                                    hInsLen (r :: rss) tail' (by simp [sseQ3SuffixLenRev, hQr]) hIns
                                  have hrl : (r :: rss).length + 2 = k2 + 2 := by simp only [List.length] at hlen ⊢; omega
                                  have hrl' : tail'.length + 2 = k2 + 2 := by rw [hTLen]; exact hrl
                                  simp only [ssePsi, hrl, hrl', ssePrefixProd]
                                  exact sse_nat_mul_quad _ _ _ _ _ _ _
                              else
                                have hLenNe2 : ¬ (sseQ3SuffixLenRev rss + 1 + 1 + 1 = d + 3) := by omega
                                rw [sse_ite_neg hLenNe2, sse_ite_neg hLenEq, Nat.mul_zero]
                        else rw [sse_ite_neg hh, sse_ite_neg hh]
                    rw [hMul, sse_q3Mass_eq om (d + 2) (by omega) (k2 + 1) (by omega) p hQp, (sse_pairOrbit_sizes p j hFp).1, Nat.mul_assoc]
                  else
                    have hQpf : sseIsQ3 p = false := by cases h : sseIsQ3 p; rfl; exact absurd h hQp
                    have hAndF : ¬ ((sseIsQ3 p && sseCanFollow216 p j) = true) := by rw [hQpf, Bool.false_and]; decide
                    rw [sse_ite_neg hAndF, Nat.mul_zero, ← sse_wordsEnd_head k2 p]
                    have hZ : sseWordsEnd (k2 + 1) p (fun rev => match rev with
                        | h :: _ => if h = p then (if sseQ3SuffixLenRev (j :: rev) = d + 3 then sse_up0PairVal W om v (j :: rev) else 0) else 0
                        | [] => 0) = sseWordsEnd (k2 + 1) p (fun _ => 0) := by
                      apply sse_wordsEnd_congr; intro rev hlen
                      cases rev with
                      | nil => simp at hlen
                      | cons h rs =>
                        dsimp only
                        if hh : h = p then
                          rw [sse_ite_pos hh, hh]
                          simp only [sseQ3SuffixLenRev, hQj, hQpf, ite_true, Bool.false_eq_true, ite_false]
                          rw [sse_ite_neg (by omega)]
                        else rw [sse_ite_neg hh]
                    rw [hZ, sse_wordsEnd_zero]
                else
                  have hFpf : sseCanFollow216 p j = false := by cases h : sseCanFollow216 p j; rfl; exact absurd h hFp
                  have hAndF : ¬ ((sseIsQ3 p && sseCanFollow216 p j) = true) := by rw [hFpf, Bool.and_false]; decide
                  rw [sse_ite_neg hFp, sse_ite_neg hAndF, Nat.mul_zero]
              else
                have hQjf : sseIsQ3 j = false := by cases h : sseIsQ3 j; rfl; exact absurd h hQj
                rw [sse_ite_neg hQj, ← sse_wordsEnd_head (k2 + 1) j]
                have hZ : sseWordsEnd (k2 + 2) j (fun w => match w with
                    | h :: _ => if h = j then (if sseQ3SuffixLenRev w = d + 3 then sse_up0PairVal W om v w else 0) else 0
                    | [] => 0) = sseWordsEnd (k2 + 2) j (fun _ => 0) := by
                  apply sse_wordsEnd_congr; intro w hlen
                  cases w with
                  | nil => simp at hlen
                  | cons h rs =>
                    dsimp only
                    if hh : h = j then
                      rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQjf, Bool.false_eq_true, ite_false]
                      rw [sse_ite_neg (by omega)]
                    else rw [sse_ite_neg hh]
                rw [hZ, sse_wordsEnd_zero]
            rw [sse_sumFinNat_congr _ _ hEach]
            have hOut : sseSumFinNat (fun j : Fin 216 => if sseIsQ3 j = true then
                  W (k2 + 2) * W (k2 + 2) * sseTableSum (fun o : Fin 57 => om o * om o * v o * v o *
                    sse_q3MassPick om (sseZVec om (k2 + 1 - (d + 2))) (d + 2) (sseOrbitS1 o)) (sseQ3InTbl (sseSize216 j))
                else 0) =
                W (k2 + 2) * W (k2 + 2) * sseSumFinNat (fun j : Fin 216 => if sseIsQ3 j = true then
                  sseTableSum (fun o : Fin 57 => om o * om o * v o * v o *
                    sse_q3MassPick om (sseZVec om (k2 + 1 - (d + 2))) (d + 2) (sseOrbitS1 o)) (sseQ3InTbl (sseSize216 j))
                else 0) := by
              rw [← sse_sumFinNat_mul_left]
              apply sse_sumFinNat_congr; intro j
              if hQ : sseIsQ3 j = true then rw [sse_ite_pos hQ, sse_ite_pos hQ]
              else rw [sse_ite_neg hQ, sse_ite_neg hQ, Nat.mul_zero]
            have hSub : k2 + 1 - (d + 2) = k2 + 2 - (d + 3) := by omega
            rw [hOut, hSub, sse_sum_q3_by_size (fun sz => sseTableSum
              (fun o : Fin 57 => om o * om o * v o * v o *
                sse_q3MassPick om (sseZVec om (k2 + 2 - (d + 3))) (d + 2) (sseOrbitS1 o))
              (sseQ3InTbl sz))]; rfl

-- Disjoint slide-depth partition inequality: `48 * sseCFExactUp0Quad ≥ sseCF1QuadTrunc` for ALL `K, M, W, om, v`!
private theorem sse_cf_exact_up0Quad_ge (K M : Nat) (W : Nat → Nat) (om v : Fin 57 → Nat) :
    48 * sseCFExactUp0Quad K W om v ≥ sseCF1QuadTrunc K M W om v := by
  have hSumNatMul : ∀ (n c : Nat) (f : Nat → Nat), c * sumNat n f = sumNat n (fun i => c * f i) := by
    intro n c f; induction n with | zero => simp [sumNat] | succ r ih => simp only [sumNat, Nat.mul_add, ih]
  have hSumNatLe : ∀ (n : Nat) (f g : Nat → Nat), (∀ i, f i ≤ g i) → sumNat n f ≤ sumNat n g := by
    intro n f g h; induction n with | zero => exact Nat.le_refl 0 | succ r ih => simp only [sumNat]; have := h r; omega
  have hDisj : ∀ (L : Nat) (k : Nat) (c : Fin 216) (f : List (Fin 216) → Nat),
      sumNat L (fun m => if m < k then sseWordsEnd k c (fun w => if sseQ3SuffixLenRev w = m then f w else 0) else 0) ≤
        sseWordsEnd k c f := by
    intro L k c f
    have hEq : sumNat L (fun m => if m < k then sseWordsEnd k c (fun w => if sseQ3SuffixLenRev w = m then f w else 0) else 0) =
        sseWordsEnd k c (fun w => if sseQ3SuffixLenRev w < L ∧ sseQ3SuffixLenRev w < k then f w else 0) := by
      induction L with
      | zero =>
        change 0 = sseWordsEnd k c (fun w => if sseQ3SuffixLenRev w < 0 ∧ sseQ3SuffixLenRev w < k then f w else 0)
        rw [sse_wordsEnd_congr k c _ (fun _ => 0) (fun w _ => sse_ite_neg (by omega) _ _), sse_wordsEnd_zero]
      | succ l ih =>
        simp only [sumNat, ih]
        if hlk : l < k then
          rw [sse_ite_pos hlk, ← sse_wordsEnd_add]
          apply sse_wordsEnd_congr; intro w _
          if h1 : sseQ3SuffixLenRev w < l ∧ sseQ3SuffixLenRev w < k then
            rw [sse_ite_pos h1, sse_ite_neg (by omega), sse_ite_pos (by omega)]; omega
          else if h2 : sseQ3SuffixLenRev w = l then
            rw [sse_ite_neg h1, sse_ite_pos h2, sse_ite_pos (by omega)]; omega
          else
            rw [sse_ite_neg h1, sse_ite_neg h2, sse_ite_neg (by omega)]
        else
          rw [sse_ite_neg hlk, Nat.add_zero]
          apply sse_wordsEnd_congr; intro w _
          if h1 : sseQ3SuffixLenRev w < l ∧ sseQ3SuffixLenRev w < k then
            rw [sse_ite_pos h1, sse_ite_pos (by omega)]
          else
            rw [sse_ite_neg h1, sse_ite_neg (by omega)]
    rw [hEq]
    apply sse_wordsEnd_le; intro w
    split <;> omega
  have hSwapFin : ∀ (L : Nat) (g : Nat → Fin 216 → Nat),
      sumNat L (fun m => sseSumFinNat (fun c : Fin 216 => g m c)) =
        sseSumFinNat (fun c : Fin 216 => sumNat L (fun m => g m c)) := by
    intro L g; induction L with
    | zero => exact sse_sumFinNat_zero.symm
    | succ l ih => simp only [sumNat, ih, ← sse_sumFinNat_add]
  unfold sseCFExactUp0Quad sseCF1QuadTrunc
  rw [hSumNatMul]
  apply hSumNatLe; intro k
  if hk2 : k ≥ 2 then
    rw [sse_ite_pos hk2, sse_ite_pos hk2]
    have hSliceEq : sumNat (M + 1) (fun m => if m < k then sseCF1SliceAt W om v k m else 0) =
        48 * sumNat (M + 1) (fun m => if m < k then
          sseSumFinNat (fun c : Fin 216 => sseWordsEnd k c (fun w =>
            if sseQ3SuffixLenRev w = m then sse_up0PairVal W om v w else 0))
        else 0) := by
      rw [hSumNatMul]
      have hCon : ∀ n (f g : Nat → Nat), (∀ i, f i = g i) → sumNat n f = sumNat n g := by
        intro n f g h; induction n with | zero => rfl | succ r ih => simp only [sumNat, ih, h]
      apply hCon; intro m
      if hm : m < k then
        rw [sse_ite_pos hm, sse_ite_pos hm]
        exact (sse_up0_slice_exact W om v k m hk2 hm).symm
      else rw [sse_ite_neg hm, sse_ite_neg hm, Nat.mul_zero]
    rw [hSliceEq]
    apply Nat.mul_le_mul_left 48
    have hIn : sumNat (M + 1) (fun m => if m < k then
          sseSumFinNat (fun c : Fin 216 => sseWordsEnd k c (fun w =>
            if sseQ3SuffixLenRev w = m then sse_up0PairVal W om v w else 0))
        else 0) =
        sseSumFinNat (fun c : Fin 216 => sumNat (M + 1) (fun m =>
          if m < k then sseWordsEnd k c (fun w =>
            if sseQ3SuffixLenRev w = m then sse_up0PairVal W om v w else 0) else 0)) := by
      rw [← hSwapFin]
      have hCon : ∀ n (f g : Nat → Nat), (∀ i, f i = g i) → sumNat n f = sumNat n g := by
        intro n f g h; induction n with | zero => rfl | succ r ih => simp only [sumNat, ih, h]
      apply hCon; intro m
      if hm : m < k then rw [sse_ite_pos hm]; exact (sse_sumFinNat_congr _ _ (fun _ => sse_ite_pos hm _ _)).symm
      else rw [sse_ite_neg hm]; symm; rw [sse_sumFinNat_congr _ _ (fun _ => sse_ite_neg hm _ _), sse_sumFinNat_zero]
    rw [hIn]
    exact sse_sumFinNat_le _ _ (fun c => hDisj (M + 1) k c (sse_up0PairVal W om v))
  else
    rw [sse_ite_neg hk2, sse_ite_neg hk2, Nat.mul_zero]

private theorem sse_orbit_totalPairs_exact (o : Fin 57) :
    sseSumFinNat (fun c : Fin 216 =>
      sseSumFinNat (fun p : Fin 216 =>
        if sseCanFollow216 p c = true then (if ssePairOrbit216 p c = o then 1 else 0) else 0)) =
      sseOrbitTotalPairs o := by
  have hIn : ∀ c : Fin 216,
      sseSumFinNat (fun p : Fin 216 =>
        if sseCanFollow216 p c = true then (if ssePairOrbit216 p c = o then 1 else 0) else 0) =
      sseTableSum (fun x => if x = o then 1 else 0) (sseInOrbitTbl (sseSize216 c)) :=
    fun c => sse_sum_inOrbit_any c (fun x => if x = o then 1 else 0)
  rw [sse_sumFinNat_congr _ _ hIn,
      sse_sum_by_size216 (fun sz => sseTableSum (fun x => if x = o then 1 else 0) (sseInOrbitTbl sz))]
  exact sse_orbit_meta_verified.2.2.2.2.2.2.2.2.1 o

/-- Headline Theorem 7 (Exact `57` Pair-Orbit Algebra & All-Depth Symbolic Cartier-Foata Word-Sum Reduction):
    1. `ssePairDotCode` classifies all `31,080` valid clique pairs of `Γ_24` (`2280 + 13056 + 15744`)
       into `57` distinct `W(F_4)`-invariant orbits with zero collisions and zero fallback hits, with
       `sseOrbitTotalPairs o` and `sseOrbitMultIn o` proved directly equal to the exact valid-pair counts
       over `sseCanFollow216` and `sseInOrbitTbl`;
    2. **All-depth symbolic prefix identity:** for EVERY `om : Fin 57 → Nat`, EVERY `k ≥ 1`, and EVERY
       `c : Fin 216`, `sseWordsEnd k c (prefixProd^2) = sseZAt om k (sseSize216 c)`;
    3. **Exact symbolic finite-support norm:** for EVERY `K, W, om, v`,
       `sseCFExactNormSq K W om v = sseCF1NormSq K W om v`;
    4. **Exact symbolic upward-insertion lower bound (zero dropped negative terms):** for EVERY `K, M, W, om, v`,
       `48 * sseCFExactUp0Quad K W om v ≥ sseCF1QuadTrunc K M W om v`. -/
theorem thm_sse_cf_57_orbits_and_exact_word_sum :
    (∀ o1 o2 : Fin 57, sseOrbitCode o1 = sseOrbitCode o2 → o1 = o2) ∧
    (sseSumFinNat sseOrbitTotalPairs = 31080 ∧
     sseSumFinNat (fun o : Fin 57 => if sseOrbitS1 o = 1 then sseOrbitTotalPairs o else 0) = 2280 ∧
     sseSumFinNat (fun o : Fin 57 => if sseOrbitS1 o = 2 then sseOrbitTotalPairs o else 0) = 13056 ∧
     sseSumFinNat (fun o : Fin 57 => if sseOrbitS1 o = 3 then sseOrbitTotalPairs o else 0) = 15744) ∧
    (∀ (w : List (Fin 4)) (i j : Fin 216), ssePairOrbit216 (sseAct216 w i) (sseAct216 w j) = ssePairOrbit216 i j) ∧
    (∀ (om : Fin 57 → Nat) (k : Nat) (_hk : k ≥ 1) (c : Fin 216),
      sseWordsEnd k c (fun w => ssePrefixProd om w * ssePrefixProd om w) = sseZAt om k (sseSize216 c)) ∧
    (∀ (K : Nat) (W : Nat → Nat) (om v : Fin 57 → Nat),
      sseCFExactNormSq K W om v = sseCF1NormSq K W om v) ∧
    (∀ (K M : Nat) (W : Nat → Nat) (om v : Fin 57 → Nat),
      48 * sseCFExactUp0Quad K W om v ≥ sseCF1QuadTrunc K M W om v) ∧
    (∀ p c : Fin 216, sseCanFollow216 p c = true →
      ssePairDotCode (sseClique216 p) (sseClique216 c) = sseOrbitCode (ssePairOrbit216 p c)) ∧
    (∀ o : Fin 57,
      sseTableSum (fun x => if x = o then 1 else 0) (sseInOrbitTbl (sseOrbitS2 o)) = sseOrbitMultIn o) ∧
    (∀ o : Fin 57,
      sseSumFinNat (fun c : Fin 216 =>
        sseSumFinNat (fun p : Fin 216 =>
          if sseCanFollow216 p c = true then (if ssePairOrbit216 p c = o then 1 else 0) else 0)) =
        sseOrbitTotalPairs o) :=
  ⟨sse_orbit_meta_verified.1,
   ⟨sse_orbit_meta_verified.2.2.1, sse_orbit_meta_verified.2.2.2.1,
    sse_orbit_meta_verified.2.2.2.2.1, sse_orbit_meta_verified.2.2.2.2.2.1⟩,
   sse_pairOrbit216_wf4, sse_wordsEnd_prefixProdSq, sse_cf_exact_normSq_eq, sse_cf_exact_up0Quad_ge,
   fun p c hF => (sse_pairOrbit_sizes_and_code p c hF).2.2,
   sse_orbit_meta_verified.2.2.2.2.2.2.2.1, sse_orbit_totalPairs_exact⟩


/-! ## Section 7: Concrete CF 1-Step Lower Bound (`ρ > 913/80 = 11.4125`) & Master Certified Bracket -/

-- [helper]
def sse_cf1OmNat (i : Nat) : Nat :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => 100 | 1 => 83 | 2 => 88 | 3 => 41 | 4 => 37 | 5 => 38 | 6 => 22 | 7 => 21 | 8 => 126 | 9 => 80 | 10 => 71 | 11 => 74 | 12 => 113 | 13 => 54 | 14 => 60 | 15 => 41 | _ => 1
  | 1 => match i % 16 with
    | 0 => 44 | 1 => 35 | 2 => 32 | 3 => 33 | 4 => 41 | 5 => 30 | 6 => 31 | 7 => 38 | 8 => 26 | 9 => 27 | 10 => 22 | 11 => 19 | 12 => 18 | 13 => 21 | 14 => 17 | 15 => 139 | _ => 1
  | 2 => match i % 16 with
    | 0 => 68 | 1 => 62 | 2 => 92 | 3 => 67 | 4 => 55 | 5 => 42 | 6 => 29 | 7 => 28 | 8 => 34 | 9 => 26 | 10 => 32 | 11 => 44 | 12 => 39 | 13 => 37 | 14 => 28 | 15 => 28 | _ => 1
  | 3 => match i % 16 with
    | 0 => 24 | 1 => 21 | 2 => 16 | 3 => 16 | 4 => 15 | 5 => 18 | 6 => 21 | 7 => 15 | 8 => 19 | _ => 1
  | _ => 1

-- [helper]
def sse_cf1VNat (i : Nat) : Nat :=
  match i / 16 with
  | 0 => match i % 16 with
    | 0 => 146 | 1 => 148 | 2 => 147 | 3 => 119 | 4 => 119 | 5 => 119 | 6 => 101 | 7 => 101 | 8 => 135 | 9 => 144 | 10 => 147 | 11 => 145 | 12 => 136 | 13 => 118 | 14 => 115 | 15 => 118 | _ => 1
  | 1 => match i % 16 with
    | 0 => 118 | 1 => 119 | 2 => 118 | 3 => 118 | 4 => 117 | 5 => 119 | 6 => 119 | 7 => 118 | 8 => 101 | 9 => 101 | 10 => 101 | 11 => 101 | 12 => 101 | 13 => 101 | 14 => 101 | 15 => 129 | _ => 1
  | 2 => match i % 16 with
    | 0 => 142 | 1 => 146 | 2 => 136 | 3 => 114 | 4 => 115 | 5 => 116 | 6 => 117 | 7 => 118 | 8 => 117 | 9 => 119 | 10 => 118 | 11 => 116 | 12 => 116 | 13 => 100 | 14 => 100 | 15 => 100 | _ => 1
  | 3 => match i % 16 with
    | 0 => 100 | 1 => 101 | 2 => 101 | 3 => 101 | 4 => 101 | 5 => 101 | 6 => 101 | 7 => 101 | 8 => 101 | _ => 1
  | _ => 1

/-- Concrete `57`-orbit positive integer bulk weights `om[0..56]` and boundary weights `v[0..56]` (scale `100`). -/
def sseCF1Om (o : Fin 57) : Nat := sse_cf1OmNat o.val
def sseCF1V (o : Fin 57) : Nat := sse_cf1VNat o.val

/-- Explicit positive finite-support shell window `W(k) = (k - 1)(121 - k) * 5^{k - 2} * 2556^{120 - k}`
    supported strictly on Cartier-Foata heights `k ∈ [2, 120]` (`0` outside). -/
def sseCF1Win (k : Nat) : Nat :=
  if 2 ≤ k ∧ k ≤ 120 then (k - 1) * (121 - k) * (5 ^ (k - 2)) * (2556 ^ (120 - k)) else 0

private theorem sse_tableSum_split3 (tbl : List (Fin 57 × Nat)) (f : Fin 57 → Nat) (z : Nat × Nat × Nat)
    (hS : tbl.all (fun e => decide (sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2 ∨ sseOrbitS1 e.1 = 3)) = true) :
    sseTableSum (fun o => f o * (match sseOrbitS1 o with | 1 => z.1 | 2 => z.2.1 | _ => z.2.2)) tbl =
      sseTableSum (fun o => if sseOrbitS1 o = 1 then f o else 0) tbl * z.1 +
      sseTableSum (fun o => if sseOrbitS1 o = 2 then f o else 0) tbl * z.2.1 +
      sseTableSum (fun o => if sseOrbitS1 o = 3 then f o else 0) tbl * z.2.2 := by
  induction tbl with
  | nil => simp [sseTableSum]
  | cons e rest ih =>
    simp only [List.all, Bool.and_eq_true] at hS
    have he : sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2 ∨ sseOrbitS1 e.1 = 3 := of_decide_eq_true hS.1
    simp only [sseTableSum, ih hS.2, Nat.add_mul]
    rcases he with h1 | h2 | h3
    · rw [h1]; simp only [ite_true, sse_ite_neg (by decide : ¬ (1 = 2)), sse_ite_neg (by decide : ¬ (1 = 3)),
        Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h2]; simp only [ite_true, sse_ite_neg (by decide : ¬ (2 = 1)), sse_ite_neg (by decide : ¬ (2 = 3)),
        Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h3]; simp only [ite_true, sse_ite_neg (by decide : ¬ (3 = 1)), sse_ite_neg (by decide : ¬ (3 = 2)),
        Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega

private theorem sse_tableSum_split2_pair (tbl : List ((Fin 57 × Fin 57) × Nat)) (f : Fin 57 × Fin 57 → Nat)
    (z : Nat × Nat)
    (hS : tbl.all (fun e => decide (sseOrbitS1 e.1.1 = 1 ∨ sseOrbitS1 e.1.1 = 2)) = true) :
    sseTableSum (fun p => f p * (match sseOrbitS1 p.1 with | 1 => z.1 | _ => z.2)) tbl =
      sseTableSum (fun p => if sseOrbitS1 p.1 = 1 then f p else 0) tbl * z.1 +
      sseTableSum (fun p => if sseOrbitS1 p.1 = 2 then f p else 0) tbl * z.2 := by
  induction tbl with
  | nil => simp [sseTableSum]
  | cons e rest ih =>
    simp only [List.all, Bool.and_eq_true] at hS
    have he : sseOrbitS1 e.1.1 = 1 ∨ sseOrbitS1 e.1.1 = 2 := of_decide_eq_true hS.1
    simp only [sseTableSum, ih hS.2, Nat.add_mul]
    rcases he with h1 | h2
    · rw [h1]; simp only [ite_true, sse_ite_neg (by decide : ¬ (1 = 2)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h2]; simp only [ite_true, sse_ite_neg (by decide : ¬ (2 = 1)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega

private theorem sse_tableSum_split3_pair (tbl : List ((Fin 57 × Fin 57) × Nat)) (f : Fin 57 × Fin 57 → Nat)
    (z : Nat × Nat × Nat)
    (hS : tbl.all (fun e => decide (sseOrbitS1 e.1.1 = 1 ∨ sseOrbitS1 e.1.1 = 2 ∨ sseOrbitS1 e.1.1 = 3)) = true) :
    sseTableSum (fun p => f p * (match sseOrbitS1 p.1 with | 1 => z.1 | 2 => z.2.1 | _ => z.2.2)) tbl =
      sseTableSum (fun p => if sseOrbitS1 p.1 = 1 then f p else 0) tbl * z.1 +
      sseTableSum (fun p => if sseOrbitS1 p.1 = 2 then f p else 0) tbl * z.2.1 +
      sseTableSum (fun p => if sseOrbitS1 p.1 = 3 then f p else 0) tbl * z.2.2 := by
  induction tbl with
  | nil => simp [sseTableSum]
  | cons e rest ih =>
    simp only [List.all, Bool.and_eq_true] at hS
    have he : sseOrbitS1 e.1.1 = 1 ∨ sseOrbitS1 e.1.1 = 2 ∨ sseOrbitS1 e.1.1 = 3 := of_decide_eq_true hS.1
    simp only [sseTableSum, ih hS.2, Nat.add_mul]
    rcases he with h1 | h2 | h3
    · rw [h1]; simp only [ite_true, sse_ite_neg (by decide : ¬ (1 = 2)), sse_ite_neg (by decide : ¬ (1 = 3)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h2]; simp only [ite_true, sse_ite_neg (by decide : ¬ (2 = 1)), sse_ite_neg (by decide : ¬ (2 = 3)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h3]; simp only [ite_true, sse_ite_neg (by decide : ¬ (3 = 1)), sse_ite_neg (by decide : ¬ (3 = 2)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega

private theorem sse_tableSum_split2 (tbl : List (Fin 57 × Nat)) (f : Fin 57 → Nat) (z : Nat × Nat)
    (hS : tbl.all (fun e => decide (sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2)) = true) :
    sseTableSum (fun o => f o * (match sseOrbitS1 o with | 1 => z.1 | _ => z.2)) tbl =
      sseTableSum (fun o => if sseOrbitS1 o = 1 then f o else 0) tbl * z.1 +
      sseTableSum (fun o => if sseOrbitS1 o = 2 then f o else 0) tbl * z.2 := by
  induction tbl with
  | nil => simp [sseTableSum]
  | cons e rest ih =>
    simp only [List.all, Bool.and_eq_true] at hS
    have he : sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2 := of_decide_eq_true hS.1
    simp only [sseTableSum, ih hS.2, Nat.add_mul]
    rcases he with h1 | h2
    · rw [h1]; simp only [ite_true, sse_ite_neg (by decide : ¬ (1 = 2)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h2]; simp only [ite_true, sse_ite_neg (by decide : ¬ (2 = 1)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega

private theorem sse_tbl_s1_ranges :
    ((sseInOrbitTbl 1).all (fun e => decide (sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2 ∨ sseOrbitS1 e.1 = 3)) = true) ∧
    ((sseInOrbitTbl 2).all (fun e => decide (sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2 ∨ sseOrbitS1 e.1 = 3)) = true) ∧
    ((sseInOrbitTbl 3).all (fun e => decide (sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2 ∨ sseOrbitS1 e.1 = 3)) = true) ∧
    ((sseM1Tbl 1).all (fun e => decide (sseOrbitS1 e.1.1 = 1 ∨ sseOrbitS1 e.1.1 = 2 ∨ sseOrbitS1 e.1.1 = 3)) = true) ∧
    ((sseM1Tbl 2).all (fun e => decide (sseOrbitS1 e.1.1 = 1 ∨ sseOrbitS1 e.1.1 = 2 ∨ sseOrbitS1 e.1.1 = 3)) = true) ∧
    ((sseM2Tbl 1).all (fun e => decide (sseOrbitS1 e.1.1 = 1 ∨ sseOrbitS1 e.1.1 = 2)) = true) ∧
    ((sseM2Tbl 2).all (fun e => decide (sseOrbitS1 e.1.1 = 1 ∨ sseOrbitS1 e.1.1 = 2)) = true) ∧
    ((sseQ3InTbl 1).all (fun e => decide (sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2)) = true) ∧
    ((sseQ3InTbl 2).all (fun e => decide (sseOrbitS1 e.1 = 1 ∨ sseOrbitS1 e.1 = 2)) = true) := by
  decide

-- Precomputed linear-form scalar coefficients (evaluated ONCE for `sseCF1Om`, `sseCF1V`):
private def sse_cZ (sz s1 : Nat) : Nat :=
  sseTableSum (fun o => if sseOrbitS1 o = s1 then sseCF1Om o * sseCF1Om o else 0) (sseInOrbitTbl sz)

private def sse_cDen (s1 : Nat) : Nat :=
  24 * sseTableSum (fun o => if sseOrbitS1 o = s1 then sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o else 0) (sseInOrbitTbl 1) +
  96 * sseTableSum (fun o => if sseOrbitS1 o = s1 then sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o else 0) (sseInOrbitTbl 2) +
  96 * sseTableSum (fun o => if sseOrbitS1 o = s1 then sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o else 0) (sseInOrbitTbl 3)

private def sse_cM0 (s1 : Nat) : Nat :=
  let b (sz : Nat) : Nat := sseTableSum (fun o => if sseOrbitS1 o = sz then sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 1)
  let a (sz : Nat) : Nat := sseTableSum (fun o => if sseOrbitS1 o = s1 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl sz)
  48 * (b 1 * a 1 + b 2 * a 2 + b 3 * a 3)

private def sse_cM1V (s1 : Nat) : Nat :=
  48 * (8 * sseTableSum (fun p => if sseOrbitS1 p.1 = s1 then sseCF1Om p.1 * sseCF1Om p.2 * sseCF1V p.1 * sseCF1V p.2 else 0) (sseM1Tbl 1) +
       12 * sseTableSum (fun p => if sseOrbitS1 p.1 = s1 then sseCF1Om p.1 * sseCF1Om p.2 * sseCF1V p.1 * sseCF1V p.2 else 0) (sseM1Tbl 2))

private def sse_cP1 (j1sz s1 : Nat) : Nat :=
  sseTableSum (fun p => if sseOrbitS1 p.1 = s1 then sseCF1Om p.1 * sseCF1Om p.2 else 0) (sseM1Tbl j1sz)

private def sse_cM2V (j1sz : Nat) : Nat :=
  48 * (8 * sseTableSum (fun p => if sseOrbitS1 p.1 = j1sz then sseCF1Om p.1 * sseCF1Om p.2 * sseCF1V p.1 * sseCF1V p.2 else 0) (sseM2Tbl 1) +
       12 * sseTableSum (fun p => if sseOrbitS1 p.1 = j1sz then sseCF1Om p.1 * sseCF1Om p.2 * sseCF1V p.1 * sseCF1V p.2 else 0) (sseM2Tbl 2))

private def sse_cP2 (j2sz j1sz : Nat) : Nat :=
  sseTableSum (fun p => if sseOrbitS1 p.1 = j1sz then sseCF1Om p.1 * sseCF1Om p.2 else 0) (sseM2Tbl j2sz)

private def sse_cQ3 (jbsz jasz : Nat) : Nat :=
  sseTableSum (fun o => if sseOrbitS1 o = jasz then sseCF1Om o * sseCF1Om o else 0) (sseQ3InTbl jbsz)

private def sse_cQ3V (jasz : Nat) : Nat :=
  48 * (8 * sseTableSum (fun o => if sseOrbitS1 o = jasz then sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o else 0) (sseQ3InTbl 1) +
       12 * sseTableSum (fun o => if sseOrbitS1 o = jasz then sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o else 0) (sseQ3InTbl 2))

private def sse_dot3 (c z : Nat × Nat × Nat) : Nat := c.1 * z.1 + c.2.1 * z.2.1 + c.2.2 * z.2.2

private def sse_q3PowCoef (v1 v2 : Nat) : Nat → Nat × Nat
  | 0 => (v1, v2)
  | d + 1 =>
    let (a1, a2) := sse_q3PowCoef v1 v2 d
    (a1 * sse_cQ3 1 1 + a2 * sse_cQ3 2 1, a1 * sse_cQ3 1 2 + a2 * sse_cQ3 2 2)

private def sse_cSlice (m : Nat) : Nat × Nat × Nat :=
  match m with
  | 0 => (sse_cM0 1, sse_cM0 2, sse_cM0 3)
  | 1 => (sse_cM1V 1, sse_cM1V 2, sse_cM1V 3)
  | 2 =>
    let w1 := sse_cM2V 1; let w2 := sse_cM2V 2
    (w1 * sse_cP1 1 1 + w2 * sse_cP1 2 1, w1 * sse_cP1 1 2 + w2 * sse_cP1 2 2, w1 * sse_cP1 1 3 + w2 * sse_cP1 2 3)
  | d + 3 =>
    let (u1, u2) := sse_q3PowCoef (sse_cQ3V 1) (sse_cQ3V 2) d
    let w1 := u1 * sse_cP2 1 1 + u2 * sse_cP2 2 1
    let w2 := u1 * sse_cP2 1 2 + u2 * sse_cP2 2 2
    (w1 * sse_cP1 1 1 + w2 * sse_cP1 2 1, w1 * sse_cP1 1 2 + w2 * sse_cP1 2 2, w1 * sse_cP1 1 3 + w2 * sse_cP1 2 3)

private theorem sse_q3MassVec_lin (z : Nat × Nat × Nat) :
    (sseQ3MassVec sseCF1Om z 1 =
      (sse_cP1 1 1 * z.1 + sse_cP1 1 2 * z.2.1 + sse_cP1 1 3 * z.2.2,
       sse_cP1 2 1 * z.1 + sse_cP1 2 2 * z.2.1 + sse_cP1 2 3 * z.2.2)) ∧
    (sseQ3MassVec sseCF1Om z 2 =
      let p := sseQ3MassVec sseCF1Om z 1
      (sse_cP2 1 1 * p.1 + sse_cP2 1 2 * p.2,
       sse_cP2 2 1 * p.1 + sse_cP2 2 2 * p.2)) ∧
    (∀ d : Nat, sseQ3MassVec sseCF1Om z (d + 3) =
      let p := sseQ3MassVec sseCF1Om z (d + 2)
      (sse_cQ3 1 1 * p.1 + sse_cQ3 1 2 * p.2,
       sse_cQ3 2 1 * p.1 + sse_cQ3 2 2 * p.2)) := by
  refine ⟨?_, ?_, ?_⟩
  · unfold sseQ3MassVec sse_cP1
    dsimp only
    rw [sse_tableSum_split3_pair _ _ z sse_tbl_s1_ranges.2.2.2.1,
        sse_tableSum_split3_pair _ _ z sse_tbl_s1_ranges.2.2.2.2.1]
  · have hL : sseQ3MassVec sseCF1Om z 2 =
        (sseTableSum (fun p => sseCF1Om p.1 * sseCF1Om p.2 *
            (match sseOrbitS1 p.1 with | 1 => (sseQ3MassVec sseCF1Om z 1).1 | _ => (sseQ3MassVec sseCF1Om z 1).2)) (sseM2Tbl 1),
         sseTableSum (fun p => sseCF1Om p.1 * sseCF1Om p.2 *
            (match sseOrbitS1 p.1 with | 1 => (sseQ3MassVec sseCF1Om z 1).1 | _ => (sseQ3MassVec sseCF1Om z 1).2)) (sseM2Tbl 2)) := rfl
    rw [hL]; unfold sse_cP2; dsimp only
    rw [sse_tableSum_split2_pair _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.1,
        sse_tableSum_split2_pair _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.2.1]
  · intro d
    have hL : sseQ3MassVec sseCF1Om z (d + 3) =
        (sseTableSum (fun o => sseCF1Om o * sseCF1Om o *
            (match sseOrbitS1 o with | 1 => (sseQ3MassVec sseCF1Om z (d + 2)).1 | _ => (sseQ3MassVec sseCF1Om z (d + 2)).2)) (sseQ3InTbl 1),
         sseTableSum (fun o => sseCF1Om o * sseCF1Om o *
            (match sseOrbitS1 o with | 1 => (sseQ3MassVec sseCF1Om z (d + 2)).1 | _ => (sseQ3MassVec sseCF1Om z (d + 2)).2)) (sseQ3InTbl 2)) := rfl
    rw [hL]; unfold sse_cQ3; dsimp only
    rw [sse_tableSum_split2 _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.2.2.1,
        sse_tableSum_split2 _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.2.2.2]

private theorem sse_sliceAt_eq_dot3 (W : Nat → Nat) (k m : Nat) :
    sseCF1SliceAt W sseCF1Om sseCF1V k m =
      (match m with | 0 => W k * W (k + 1) | _ => W k * W k) *
        sse_dot3 (sse_cSlice m) (sseZVec sseCF1Om (match m with | 0 => k - 1 | _ => k - m)) := by
  cases m with
  | zero =>
    unfold sseCF1SliceAt sse_dot3 sse_cSlice sse_cM0
    dsimp only
    have hV1 := sse_tableSum_split3 (sseInOrbitTbl 1) (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o)
      (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.1
    have hV2 := sse_tableSum_split3 (sseInOrbitTbl 2) (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o)
      (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.2.1
    have hV3 := sse_tableSum_split3 (sseInOrbitTbl 3) (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o)
      (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.2.2.1
    have hOuter := sse_tableSum_split3 (sseInOrbitTbl 1) (fun o => sseCF1Om o * sseCF1V o)
      (sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1),
       sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2),
       sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3))
      sse_tbl_s1_ranges.1
    rw [hOuter]; unfold sseZAt; dsimp only; rw [hV1, hV2, hV3]
    have hAlg : ∀ (ww b1 b2 b3 a11 a12 a13 a21 a22 a23 a31 a32 a33 z1 z2 z3 : Nat),
        48 * (ww * (b1 * (a11 * z1 + a12 * z2 + a13 * z3) +
                    b2 * (a21 * z1 + a22 * z2 + a23 * z3) +
                    b3 * (a31 * z1 + a32 * z2 + a33 * z3))) =
        ww * (48 * (b1 * a11 + b2 * a21 + b3 * a31) * z1 +
              48 * (b1 * a12 + b2 * a22 + b3 * a32) * z2 +
              48 * (b1 * a13 + b2 * a23 + b3 * a33) * z3) := by
      intro ww b1 b2 b3 a11 a12 a13 a21 a22 a23 a31 a32 a33 z1 z2 z3
      rw [Nat.mul_left_comm 48 ww]
      apply congrArg (ww * ·)
      simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega
    exact hAlg _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
  | succ m' =>
    cases m' with
    | zero =>
      unfold sseCF1SliceAt sse_dot3 sse_cSlice sse_cM1V
      dsimp only
      rw [sse_tableSum_split3_pair _ _ _ sse_tbl_s1_ranges.2.2.2.1,
          sse_tableSum_split3_pair _ _ _ sse_tbl_s1_ranges.2.2.2.2.1]
      have hAlg : ∀ (ww x1 x2 x3 y1 y2 y3 z1 z2 z3 : Nat),
          48 * (ww * (8 * (x1 * z1 + x2 * z2 + x3 * z3) + 12 * (y1 * z1 + y2 * z2 + y3 * z3))) =
          ww * (48 * (8 * x1 + 12 * y1) * z1 + 48 * (8 * x2 + 12 * y2) * z2 + 48 * (8 * x3 + 12 * y3) * z3) := by
        intro ww x1 x2 x3 y1 y2 y3 z1 z2 z3
        rw [Nat.mul_left_comm 48 ww]; apply congrArg (ww * ·)
        simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega
      exact hAlg _ _ _ _ _ _ _ _ _ _
    | succ m'' =>
      cases m'' with
      | zero =>
        unfold sseCF1SliceAt sse_dot3 sse_cSlice sse_cM2V
        dsimp only
        rw [sse_tableSum_split2_pair _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.1,
            sse_tableSum_split2_pair _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.2.1,
            (sse_q3MassVec_lin (sseZVec sseCF1Om (k - 2))).1]
        have hAlg : ∀ (ww x1 x2 y1 y2 a11 a12 a13 a21 a22 a23 z1 z2 z3 : Nat),
            48 * (ww * (8 * (x1 * (a11 * z1 + a12 * z2 + a13 * z3) + x2 * (a21 * z1 + a22 * z2 + a23 * z3)) +
                       12 * (y1 * (a11 * z1 + a12 * z2 + a13 * z3) + y2 * (a21 * z1 + a22 * z2 + a23 * z3)))) =
            ww * ((48 * (8 * x1 + 12 * y1) * a11 + 48 * (8 * x2 + 12 * y2) * a21) * z1 +
                  (48 * (8 * x1 + 12 * y1) * a12 + 48 * (8 * x2 + 12 * y2) * a22) * z2 +
                  (48 * (8 * x1 + 12 * y1) * a13 + 48 * (8 * x2 + 12 * y2) * a23) * z3) := by
          intro ww x1 x2 y1 y2 a11 a12 a13 a21 a22 a23 z1 z2 z3
          rw [Nat.mul_left_comm 48 ww]; apply congrArg (ww * ·)
          simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega
        exact hAlg _ _ _ _ _ _ _ _ _ _ _ _ _ _
      | succ d =>
        unfold sseCF1SliceAt sse_dot3 sse_cSlice
        dsimp only
        rw [sse_tableSum_split2 _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.2.2.1,
            sse_tableSum_split2 _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.2.2.2]
        have hStep1 : ∀ (ww x1 x2 y1 y2 p1 p2 : Nat),
            48 * (ww * (8 * (x1 * p1 + x2 * p2) + 12 * (y1 * p1 + y2 * p2))) =
            ww * (48 * (8 * x1 + 12 * y1) * p1 + 48 * (8 * x2 + 12 * y2) * p2) := by
          intro ww x1 x2 y1 y2 p1 p2
          rw [Nat.mul_left_comm 48 ww]; apply congrArg (ww * ·)
          simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega
        rw [hStep1]
        change (W k * W k) * (sse_cQ3V 1 * (sseQ3MassVec sseCF1Om (sseZVec sseCF1Om (k - (d + 3))) (d + 2)).1 +
                              sse_cQ3V 2 * (sseQ3MassVec sseCF1Om (sseZVec sseCF1Om (k - (d + 3))) (d + 2)).2) = _
        apply congrArg (W k * W k * ·)
        have hPow : ∀ (r v1 v2 : Nat) (z : Nat × Nat × Nat),
            v1 * (sseQ3MassVec sseCF1Om z (r + 2)).1 + v2 * (sseQ3MassVec sseCF1Om z (r + 2)).2 =
            (sse_q3PowCoef v1 v2 r).1 * (sseQ3MassVec sseCF1Om z 2).1 +
            (sse_q3PowCoef v1 v2 r).2 * (sseQ3MassVec sseCF1Om z 2).2 := by
          intro r; induction r with
          | zero => intro v1 v2 z; rfl
          | succ r' ihr =>
            intro v1 v2 z
            rw [(sse_q3MassVec_lin z).2.2 r']
            dsimp only
            have hLin : v1 * (sse_cQ3 1 1 * (sseQ3MassVec sseCF1Om z (r' + 2)).1 + sse_cQ3 1 2 * (sseQ3MassVec sseCF1Om z (r' + 2)).2) +
                v2 * (sse_cQ3 2 1 * (sseQ3MassVec sseCF1Om z (r' + 2)).1 + sse_cQ3 2 2 * (sseQ3MassVec sseCF1Om z (r' + 2)).2) =
                (v1 * sse_cQ3 1 1 + v2 * sse_cQ3 2 1) * (sseQ3MassVec sseCF1Om z (r' + 2)).1 +
                (v1 * sse_cQ3 1 2 + v2 * sse_cQ3 2 2) * (sseQ3MassVec sseCF1Om z (r' + 2)).2 := by
              simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega
            rw [hLin, ihr]
            have hShift : ∀ (s a1 a2 : Nat),
                sse_q3PowCoef (a1 * sse_cQ3 1 1 + a2 * sse_cQ3 2 1) (a1 * sse_cQ3 1 2 + a2 * sse_cQ3 2 2) s =
                let (b1, b2) := sse_q3PowCoef a1 a2 s
                (b1 * sse_cQ3 1 1 + b2 * sse_cQ3 2 1, b1 * sse_cQ3 1 2 + b2 * sse_cQ3 2 2) := by
              intro s; induction s with
              | zero => intro a1 a2; rfl
              | succ s' ihs =>
                intro a1 a2; simp only [sse_q3PowCoef, ihs]
            rw [hShift]; rfl
        rw [hPow d (sse_cQ3V 1) (sse_cQ3V 2), (sse_q3MassVec_lin _).2.1, (sse_q3MassVec_lin _).1]
        dsimp only
        have hSub : k - (d + 1 + 1 + 1) = k - (d + 3) := by omega
        rw [hSub]
        simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega

private theorem sse_cf1NormSq_term_eq (W : Nat → Nat) (k : Nat) :
    W k * W k *
      (24 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1) +
       96 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2) +
       96 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3)) =
    W k * W k * sse_dot3 (sse_cDen 1, sse_cDen 2, sse_cDen 3) (sseZVec sseCF1Om (k - 1)) := by
  unfold sseZAt; dsimp only
  rw [sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.1,
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.2.1,
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.2.2.1]
  unfold sse_dot3 sse_cDen
  apply congrArg (W k * W k * ·)
  simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega

private theorem sse_zVec_step (k : Nat) :
    sseZVec sseCF1Om (k + 2) =
      let prev := sseZVec sseCF1Om (k + 1)
      (sse_cZ 1 1 * prev.1 + sse_cZ 1 2 * prev.2.1 + sse_cZ 1 3 * prev.2.2,
       sse_cZ 2 1 * prev.1 + sse_cZ 2 2 * prev.2.1 + sse_cZ 2 3 * prev.2.2,
       sse_cZ 3 1 * prev.1 + sse_cZ 3 2 * prev.2.1 + sse_cZ 3 3 * prev.2.2) := by
  have hL : sseZVec sseCF1Om (k + 2) =
      (sseTableSum (fun o => sseCF1Om o * sseCF1Om o *
          (match sseOrbitS1 o with | 1 => (sseZVec sseCF1Om (k + 1)).1 | 2 => (sseZVec sseCF1Om (k + 1)).2.1 | _ => (sseZVec sseCF1Om (k + 1)).2.2)) (sseInOrbitTbl 1),
       sseTableSum (fun o => sseCF1Om o * sseCF1Om o *
          (match sseOrbitS1 o with | 1 => (sseZVec sseCF1Om (k + 1)).1 | 2 => (sseZVec sseCF1Om (k + 1)).2.1 | _ => (sseZVec sseCF1Om (k + 1)).2.2)) (sseInOrbitTbl 2),
       sseTableSum (fun o => sseCF1Om o * sseCF1Om o *
          (match sseOrbitS1 o with | 1 => (sseZVec sseCF1Om (k + 1)).1 | 2 => (sseZVec sseCF1Om (k + 1)).2.1 | _ => (sseZVec sseCF1Om (k + 1)).2.2)) (sseInOrbitTbl 3)) := rfl
  rw [hL]; unfold sse_cZ; dsimp only
  rw [sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k + 1)) sse_tbl_s1_ranges.1,
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k + 1)) sse_tbl_s1_ranges.2.1,
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k + 1)) sse_tbl_s1_ranges.2.2.1]

/-- Pure `O(K)` list builder for `[Z(k), Z(k-1), ..., Z(0)]` proved exact against `sseZVec sseCF1Om`. -/
private def sse_zHist (c11 c12 c13 c21 c22 c23 c31 c32 c33 : Nat) : Nat → List (Nat × Nat × Nat)
  | 0 => [(0, 0, 0)]
  | 1 => [(1, 1, 1), (0, 0, 0)]
  | k + 2 =>
    let rest := sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 (k + 1)
    let prev := sseListGetD (0, 0, 0) rest 0
    (c11 * prev.1 + c12 * prev.2.1 + c13 * prev.2.2,
     c21 * prev.1 + c22 * prev.2.1 + c23 * prev.2.2,
     c31 * prev.1 + c32 * prev.2.1 + c33 * prev.2.2) :: rest

private theorem sse_zHist_getD :
    ∀ (k m : Nat), m ≤ k →
      sseListGetD (0, 0, 0)
        (sse_zHist (sse_cZ 1 1) (sse_cZ 1 2) (sse_cZ 1 3)
                   (sse_cZ 2 1) (sse_cZ 2 2) (sse_cZ 2 3)
                   (sse_cZ 3 1) (sse_cZ 3 2) (sse_cZ 3 3) k) m =
      sseZVec sseCF1Om (k - m) := by
  intro k; induction k with
  | zero =>
    intro m hm
    have : m = 0 := by omega
    subst this; rfl
  | succ k1 ih =>
    intro m hm
    cases k1 with
    | zero =>
      cases m with
      | zero => rfl
      | succ m1 =>
        have : m1 = 0 := by omega
        subst this; rfl
    | succ k2 =>
      cases m with
      | zero =>
        simp only [sse_zHist, sseListGetD, Nat.sub_zero]
        have hHead := ih 0 (by omega)
        simp only [Nat.sub_zero] at hHead
        rw [hHead, sse_zVec_step]
      | succ m1 =>
        simp only [sse_zHist, sseListGetD]
        have hSub : k2 + 2 - (m1 + 1) = k2 + 1 - m1 := by omega
        rw [hSub]; exact ih m1 (by omega)

/-- Fast single-pass `O(K * M)` exact `Nat` evaluator for `(sseCF1NormSq K W om v, sseCF1QuadTrunc K M W om v)`
    with all `12` slice coefficients computed ONCE! -/
private def sse_cf1FastGo (M : Nat) (W : Nat → Nat) (cDen : Nat × Nat × Nat) (cSl : List (Nat × Nat × Nat)) :
    Nat → List (Nat × Nat × Nat) → Nat × Nat
  | 0, _ => (0, 0)
  | k + 1, hist =>
    let prevHist := match hist with | _ :: tl => tl | [] => []
    let (dPrev, qPrev) := sse_cf1FastGo M W cDen cSl k prevHist
    if k ≥ 2 then
      let wk := W k; let wk2 := wk * wk; let w01 := wk * W (k + 1)
      let z1 := sseListGetD (0, 0, 0) hist 1
      let dK := wk2 * sse_dot3 cDen z1
      let qK := sumNat (M + 1) (fun m =>
        if m < k then
          (match m with | 0 => w01 | _ => wk2) *
            sse_dot3 (sseListGetD (0, 0, 0) cSl m) (sseListGetD (0, 0, 0) hist (match m with | 0 => 1 | _ => m))
        else 0)
      (dPrev + dK, qPrev + qK)
    else (dPrev, qPrev)

private def sse_cf1FastPair (K M : Nat) (W : Nat → Nat) : Nat × Nat :=
  let c11 := sse_cZ 1 1; let c12 := sse_cZ 1 2; let c13 := sse_cZ 1 3
  let c21 := sse_cZ 2 1; let c22 := sse_cZ 2 2; let c23 := sse_cZ 2 3
  let c31 := sse_cZ 3 1; let c32 := sse_cZ 3 2; let c33 := sse_cZ 3 3
  let cDen := (sse_cDen 1, sse_cDen 2, sse_cDen 3)
  let cSl := sse_rangeMap sse_cSlice 0 (M + 1)
  sse_cf1FastGo M W cDen cSl (K + 1) (sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 K)

private theorem sse_cf1FastPair_eq (K M : Nat) (W : Nat → Nat) :
    sse_cf1FastPair K M W = (sseCF1NormSq K W sseCF1Om sseCF1V, sseCF1QuadTrunc K M W sseCF1Om sseCF1V) := by
  let c11 := sse_cZ 1 1; let c12 := sse_cZ 1 2; let c13 := sse_cZ 1 3
  let c21 := sse_cZ 2 1; let c22 := sse_cZ 2 2; let c23 := sse_cZ 2 3
  let c31 := sse_cZ 3 1; let c32 := sse_cZ 3 2; let c33 := sse_cZ 3 3
  let cDen := (sse_cDen 1, sse_cDen 2, sse_cDen 3)
  let cSl := sse_rangeMap sse_cSlice 0 (M + 1)
  have hCSl : ∀ m : Nat, m < M + 1 → sseListGetD (0, 0, 0) cSl m = sse_cSlice m := by
    intro m hm
    have h := sse_rangeMap_listGetD sse_cSlice (0, 0, 0) 0 (M + 1) m hm
    simp only [Nat.zero_add] at h; exact h
  have hTail : ∀ r : Nat,
      (match sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 (r + 1) with | _ :: tl => tl | [] => []) =
      sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 r := by
    intro r; cases r <;> rfl
  have hAux : ∀ n : Nat,
      sse_cf1FastGo M W cDen cSl (n + 1)
        (sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 n) =
      (sseCF1NormSq n W sseCF1Om sseCF1V, sseCF1QuadTrunc n M W sseCF1Om sseCF1V) := by
    intro n; induction n with
    | zero => rfl
    | succ r ih =>
      unfold sse_cf1FastGo
      rw [hTail r]; dsimp only; rw [ih]
      have hNStep : sseCF1NormSq (r + 1) W sseCF1Om sseCF1V =
          sseCF1NormSq r W sseCF1Om sseCF1V +
            (if r + 1 ≥ 2 then W (r + 1) * W (r + 1) *
              (24 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (r + 1 - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1) +
               96 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (r + 1 - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2) +
               96 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (r + 1 - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3))
             else 0) := rfl
      have hQStep : sseCF1QuadTrunc (r + 1) M W sseCF1Om sseCF1V =
          sseCF1QuadTrunc r M W sseCF1Om sseCF1V +
            (if r + 1 ≥ 2 then sumNat (M + 1) (fun m => if m < r + 1 then sseCF1SliceAt W sseCF1Om sseCF1V (r + 1) m else 0)
             else 0) := rfl
      rw [hNStep, hQStep]
      if hr2 : r + 1 ≥ 2 then
        rw [sse_ite_pos hr2, sse_ite_pos hr2, sse_ite_pos hr2]
        apply Prod.ext
        · dsimp only
          rw [sse_zHist_getD (r + 1) 1 (by omega), sse_cf1NormSq_term_eq]
        · dsimp only
          apply congrArg (sseCF1QuadTrunc r M W sseCF1Om sseCF1V + ·)
          have hSum : ∀ t (f g : Nat → Nat), (∀ i, i < t → f i = g i) → sumNat t f = sumNat t g := by
            intro t f g h; induction t with
            | zero => rfl
            | succ p ihp => simp only [sumNat, ihp (fun i hi => h i (by omega)), h p (by omega)]
          apply hSum (M + 1); intro m hm
          if hmk : m < r + 1 then
            rw [sse_ite_pos hmk, sse_ite_pos hmk, hCSl m hm, sse_sliceAt_eq_dot3]
            cases m with
            | zero =>
              exact congrArg (fun z => (W (r + 1) * W (r + 1 + 1)) * sse_dot3 (sse_cSlice 0) z)
                (sse_zHist_getD (r + 1) 1 (by omega))
            | succ m1 =>
              exact congrArg (fun z => (W (r + 1) * W (r + 1)) * sse_dot3 (sse_cSlice (m1 + 1)) z)
                (sse_zHist_getD (r + 1) (m1 + 1) (by omega))
          else rw [sse_ite_neg hmk, sse_ite_neg hmk]
      else
        rw [sse_ite_neg hr2, sse_ite_neg hr2, sse_ite_neg hr2, Nat.add_zero, Nat.add_zero]
  exact hAux K

-- Balanced `O(log K)` binary-tree evaluator for `sseCF1NormSq` and `sseCF1QuadTrunc` (depth `≤ 18`, zero `maxRecDepth` bump!):
private abbrev sse_Vec3 := Nat × Nat × Nat
private abbrev sse_Mat3 := sse_Vec3 × sse_Vec3 × sse_Vec3

private def sse_mat3Vec (m : sse_Mat3) (v : sse_Vec3) : sse_Vec3 :=
  (sse_dot3 m.1 v, sse_dot3 m.2.1 v, sse_dot3 m.2.2 v)

private def sse_mat3Mul (a b : sse_Mat3) : sse_Mat3 :=
  let c1 : sse_Vec3 := (b.1.1, b.2.1.1, b.2.2.1)
  let c2 : sse_Vec3 := (b.1.2.1, b.2.1.2.1, b.2.2.2.1)
  let c3 : sse_Vec3 := (b.1.2.2, b.2.1.2.2, b.2.2.2.2)
  ((sse_dot3 a.1 c1, sse_dot3 a.1 c2, sse_dot3 a.1 c3),
   (sse_dot3 a.2.1 c1, sse_dot3 a.2.1 c2, sse_dot3 a.2.1 c3),
   (sse_dot3 a.2.2 c1, sse_dot3 a.2.2 c2, sse_dot3 a.2.2 c3))

private def sse_mat3Pow2 (m : sse_Mat3) : Nat → sse_Mat3
  | 0 => m
  | d + 1 =>
    let h := sse_mat3Pow2 m d
    sse_mat3Mul h h

private def sse_matZ : sse_Mat3 :=
  ((sse_cZ 1 1, sse_cZ 1 2, sse_cZ 1 3),
   (sse_cZ 2 1, sse_cZ 2 2, sse_cZ 2 3),
   (sse_cZ 3 1, sse_cZ 3 2, sse_cZ 3 3))

private theorem sse_mat3Vec_mul (a b : sse_Mat3) (v : sse_Vec3) :
    sse_mat3Vec a (sse_mat3Vec b v) = sse_mat3Vec (sse_mat3Mul a b) v := by
  unfold sse_mat3Vec sse_mat3Mul sse_dot3; dsimp only
  apply Prod.ext
  · simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega
  · apply Prod.ext
    · simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega
    · simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega

private theorem sse_zVec_matZ_step (k : Nat) (hk : k ≥ 1) :
    sseZVec sseCF1Om (k + 1) = sse_mat3Vec sse_matZ (sseZVec sseCF1Om k) := by
  cases k with
  | zero => omega
  | succ k' => exact sse_zVec_step k'

private theorem sse_zVec_matZ_pow2 (d : Nat) :
    ∀ k : Nat, k ≥ 1 → sseZVec sseCF1Om (k + 2 ^ d) = sse_mat3Vec (sse_mat3Pow2 sse_matZ d) (sseZVec sseCF1Om k) := by
  induction d with
  | zero =>
    intro k hk; exact sse_zVec_matZ_step k hk
  | succ d' ih =>
    intro k hk
    have hE : k + 2 ^ (d' + 1) = (k + 2 ^ d') + 2 ^ d' := by
      simp only [Nat.pow_succ]; omega
    rw [hE, ih (k + 2 ^ d') (Nat.le_trans hk (Nat.le_add_right _ _)), ih k hk, sse_mat3Vec_mul]; rfl

private def sse_zWinGo (mZ : sse_Mat3) : Nat → sse_Vec3 → List sse_Vec3 → List sse_Vec3
  | 0, _, acc => acc
  | r + 1, cur, acc => sse_zWinGo mZ r (sse_mat3Vec mZ cur) (cur :: acc)

private theorem sse_zWinGo_getD (r : Nat) :
    ∀ (b : Nat) (_hb : b ≥ 1) (acc : List sse_Vec3),
      (∀ j, j < acc.length → sseListGetD (0, 0, 0) acc j = sseZVec sseCF1Om (b - 1 - j)) →
      ∀ i, i < r + acc.length →
        sseListGetD (0, 0, 0) (sse_zWinGo sse_matZ r (sseZVec sseCF1Om b) acc) i =
          sseZVec sseCF1Om (b + r - 1 - i) := by
  induction r with
  | zero =>
    intro b _ acc hacc i hi
    simp only [sse_zWinGo, Nat.add_zero]
    exact hacc i (by omega)
  | succ r' ih =>
    intro b hb acc hacc i hi
    unfold sse_zWinGo
    rw [← sse_zVec_matZ_step b hb]
    have hAcc' : ∀ j, j < (sseZVec sseCF1Om b :: acc).length →
        sseListGetD (0, 0, 0) (sseZVec sseCF1Om b :: acc) j = sseZVec sseCF1Om (b + 1 - 1 - j) := by
      intro j hj
      cases j with
      | zero => simp only [sseListGetD, Nat.add_sub_cancel, Nat.sub_zero]
      | succ j' =>
        simp only [List.length] at hj
        simp only [sseListGetD]
        have hSub : b + 1 - 1 - (j' + 1) = b - 1 - j' := by omega
        rw [hSub]; exact hacc j' (by omega)
    have hRes := ih (b + 1) (by omega) (sseZVec sseCF1Om b :: acc) hAcc' i (by simp only [List.length]; omega)
    have hSub2 : b + 1 + r' - 1 - i = b + (r' + 1) - 1 - i := by omega
    rw [hSub2] at hRes; exact hRes

private def sse_cf1PairAt (M : Nat) (W : Nat → Nat) (k : Nat) : Nat × Nat :=
  (if k ≥ 2 then W k * W k *
      (24 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1) +
       96 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2) +
       96 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3))
   else 0,
   if k ≥ 2 then sumNat (M + 1) (fun m => if m < k then sseCF1SliceAt W sseCF1Om sseCF1V k m else 0) else 0)

private def sse_sumPairRange (f : Nat → Nat × Nat) (lo : Nat) : Nat → Nat × Nat
  | 0 => (0, 0)
  | n + 1 =>
    let prev := sse_sumPairRange f lo n
    let cur := f (lo + n)
    (prev.1 + cur.1, prev.2 + cur.2)

private theorem sse_sumPairRange_add (f : Nat → Nat × Nat) (lo a b : Nat) :
    sse_sumPairRange f lo (a + b) =
      let p := sse_sumPairRange f lo a
      let q := sse_sumPairRange f (lo + a) b
      (p.1 + q.1, p.2 + q.2) := by
  induction b with
  | zero => simp [sse_sumPairRange]
  | succ b' ih =>
    have hAdd : a + (b' + 1) = (a + b') + 1 := by omega
    have hIdx : lo + (a + b') = lo + a + b' := by omega
    have hL : sse_sumPairRange f lo ((a + b') + 1) =
        ((sse_sumPairRange f lo (a + b')).1 + (f (lo + (a + b'))).1,
         (sse_sumPairRange f lo (a + b')).2 + (f (lo + (a + b'))).2) := rfl
    have hR : sse_sumPairRange f (lo + a) (b' + 1) =
        ((sse_sumPairRange f (lo + a) b').1 + (f (lo + a + b')).1,
         (sse_sumPairRange f (lo + a) b').2 + (f (lo + a + b')).2) := rfl
    rw [hAdd, hL, hR]; dsimp only; rw [ih]; dsimp only
    rw [hIdx]
    apply Prod.ext <;> exact Nat.add_assoc _ _ _

private theorem sse_sumPairRange_congr (f g : Nat → Nat × Nat) (lo n : Nat)
    (h : ∀ i, i < n → f (lo + i) = g (lo + i)) :
    sse_sumPairRange f lo n = sse_sumPairRange g lo n := by
  induction n with
  | zero => rfl
  | succ n' ih =>
    unfold sse_sumPairRange; dsimp only
    rw [ih (fun i hi => h i (by omega)), h n' (by omega)]

private theorem sse_sumPairRange_zero (f : Nat → Nat × Nat) (lo n : Nat)
    (h : ∀ i, i < n → f (lo + i) = (0, 0)) :
    sse_sumPairRange f lo n = (0, 0) := by
  induction n with
  | zero => rfl
  | succ n' ih =>
    unfold sse_sumPairRange; dsimp only
    rw [ih (fun i hi => h i (by omega)), h n' (by omega)]; rfl

private theorem sse_sumPairRange_normQuad (M : Nat) (W : Nat → Nat) (n : Nat) :
    sse_sumPairRange (sse_cf1PairAt M W) 0 (n + 1) =
      (sseCF1NormSq n W sseCF1Om sseCF1V, sseCF1QuadTrunc n M W sseCF1Om sseCF1V) := by
  induction n with
  | zero => rfl
  | succ r ih =>
    unfold sse_sumPairRange
    dsimp only; rw [ih, Nat.zero_add]
    rfl

private def sse_cf1Term (M : Nat) (W : Nat → Nat) (cDen : sse_Vec3) (cSl : List sse_Vec3)
    (k : Nat) (zs : List sse_Vec3) : Nat × Nat :=
  let wk := W k; let wk2 := wk * wk; let w01 := wk * W (k + 1)
  let z1 := sseListGetD (0, 0, 0) zs 0
  let dK := wk2 * sse_dot3 cDen z1
  let qK := sumNat (M + 1) (fun m =>
    (match m with | 0 => w01 | _ => wk2) *
      sse_dot3 (sseListGetD (0, 0, 0) cSl m)
        (sseListGetD (0, 0, 0) zs (match m with | 0 => 0 | m' + 1 => m')))
  (dK, qK)

private def sse_matPowLookup (m0 m1 m2 m3 m4 m5 m6 : sse_Mat3) : Nat → sse_Mat3
  | 0 => m0 | 1 => m1 | 2 => m2 | 3 => m3 | 4 => m4 | 5 => m5 | 6 => m6
  | d => sse_mat3Pow2 m0 d

private def sse_cf1TreeSum (K M : Nat) (W : Nat → Nat) (cDen : sse_Vec3) (cSl : List sse_Vec3)
    (pows : Nat → sse_Mat3) : Nat → Nat → sse_Vec3 → Nat × Nat
  | 0, lo, zBase =>
    if lo ≤ K then
      sse_cf1Term M W cDen cSl lo (sse_zWinGo (pows 0) M zBase [])
    else (0, 0)
  | d + 1, lo, zBase =>
    let l := sse_cf1TreeSum K M W cDen cSl pows d lo zBase
    let mid := lo + 2 ^ d
    if mid ≤ K then
      let r := sse_cf1TreeSum K M W cDen cSl pows d mid (sse_mat3Vec (pows d) zBase)
      (l.1 + r.1, l.2 + r.2)
    else l

private def sse_cf1TreePairAux (K M d : Nat) (W : Nat → Nat)
    (cDen : sse_Vec3) (cSl : List sse_Vec3) (m0 m1 m2 m3 m4 m5 m6 : sse_Mat3) : Nat × Nat :=
  let lo := sse_cf1FastGo M W cDen cSl (M + 1)
    (sse_zHist m0.1.1 m0.1.2.1 m0.1.2.2 m0.2.1.1 m0.2.1.2.1 m0.2.1.2.2 m0.2.2.1 m0.2.2.2.1 m0.2.2.2.2 M)
  let hi := sse_cf1TreeSum K M W cDen cSl (sse_matPowLookup m0 m1 m2 m3 m4 m5 m6) d (M + 1) (1, 1, 1)
  (lo.1 + hi.1, lo.2 + hi.2)

private def sse_cf1TreePair (K M d : Nat) (W : Nat → Nat) : Nat × Nat :=
  let m0 := sse_matZ
  let m1 := sse_mat3Mul m0 m0
  let m2 := sse_mat3Mul m1 m1
  let m3 := sse_mat3Mul m2 m2
  let m4 := sse_mat3Mul m3 m3
  let m5 := sse_mat3Mul m4 m4
  let m6 := sse_mat3Mul m5 m5
  let cDen := (sse_cDen 1, sse_cDen 2, sse_cDen 3)
  let cSl := sse_rangeMap sse_cSlice 0 (M + 1)
  sse_cf1TreePairAux K M d W cDen cSl m0 m1 m2 m3 m4 m5 m6

private theorem sse_cf1TreePair_eq (K M d : Nat) (W : Nat → Nat)
    (hM : M ≥ 1) (hKM : M ≤ K) (hCov : K < M + 1 + 2 ^ d) :
    sse_cf1TreePair K M d W = (sseCF1NormSq K W sseCF1Om sseCF1V, sseCF1QuadTrunc K M W sseCF1Om sseCF1V) := by
  let m0 := sse_matZ
  let m1 := sse_mat3Mul m0 m0
  let m2 := sse_mat3Mul m1 m1
  let m3 := sse_mat3Mul m2 m2
  let m4 := sse_mat3Mul m3 m3
  let m5 := sse_mat3Mul m4 m4
  let m6 := sse_mat3Mul m5 m5
  let cDen := (sse_cDen 1, sse_cDen 2, sse_cDen 3)
  let cSl := sse_rangeMap sse_cSlice 0 (M + 1)
  let pows := sse_matPowLookup m0 m1 m2 m3 m4 m5 m6
  have hPows : ∀ i : Nat, pows i = sse_mat3Pow2 sse_matZ i := by
    intro i; rcases i with _ | _ | _ | _ | _ | _ | _ | _ <;> rfl
  have hCSl : ∀ m : Nat, m < M + 1 → sseListGetD (0, 0, 0) cSl m = sse_cSlice m := by
    intro m hm
    have h := sse_rangeMap_listGetD sse_cSlice (0, 0, 0) 0 (M + 1) m hm
    simp only [Nat.zero_add] at h; exact h
  have hTerm : ∀ k : Nat, k ≥ M + 1 →
      sse_cf1Term M W cDen cSl k (sse_zWinGo sse_matZ M (sseZVec sseCF1Om (k - M)) []) =
        sse_cf1PairAt M W k := by
    intro k hk
    have hk2 : k ≥ 2 := by omega
    have hWin : ∀ i, i < M →
        sseListGetD (0, 0, 0) (sse_zWinGo sse_matZ M (sseZVec sseCF1Om (k - M)) []) i =
          sseZVec sseCF1Om (k - 1 - i) := by
      intro i hi
      have hW := sse_zWinGo_getD M (k - M) (by omega) [] (fun _ hj => by simp at hj) i (by simp; omega)
      have hSub : k - M + M - 1 - i = k - 1 - i := by omega
      rw [hSub] at hW; exact hW
    unfold sse_cf1Term sse_cf1PairAt
    rw [sse_ite_pos hk2, sse_ite_pos hk2]
    apply Prod.ext
    · dsimp only
      have h0 := hWin 0 (by omega)
      simp only [Nat.sub_zero] at h0
      rw [h0, sse_cf1NormSq_term_eq]
    · dsimp only
      have hSum : ∀ t (f g : Nat → Nat), (∀ i, i < t → f i = g i) → sumNat t f = sumNat t g := by
        intro t f g h; induction t with
        | zero => rfl
        | succ p ihp => simp only [sumNat, ihp (fun i hi => h i (by omega)), h p (by omega)]
      apply hSum (M + 1); intro m hm
      have hmk : m < k := by omega
      rw [sse_ite_pos hmk, hCSl m hm, sse_sliceAt_eq_dot3]
      cases m with
      | zero =>
        have h0 := hWin 0 (by omega); simp only [Nat.sub_zero] at h0; rw [h0]; rfl
      | succ m' =>
        have hm' := hWin m' (by omega)
        have hSub : k - 1 - m' = k - (m' + 1) := by omega
        rw [hSub] at hm'; rw [hm']; rfl
  have hTree : ∀ (t lo : Nat), lo ≥ M + 1 →
      sse_cf1TreeSum K M W cDen cSl pows t lo (sseZVec sseCF1Om (lo - M)) =
        sse_sumPairRange (fun k => if k ≤ K then sse_cf1PairAt M W k else (0, 0)) lo (2 ^ t) := by
    intro t; induction t with
    | zero =>
      intro lo hlo
      have hR : sse_sumPairRange (fun k => if k ≤ K then sse_cf1PairAt M W k else (0, 0)) lo (2 ^ 0) =
          (if lo ≤ K then sse_cf1PairAt M W lo else (0, 0)) := by
        change (0 + (if lo + 0 ≤ K then sse_cf1PairAt M W (lo + 0) else (0, 0)).1,
                0 + (if lo + 0 ≤ K then sse_cf1PairAt M W (lo + 0) else (0, 0)).2) = _
        simp only [Nat.zero_add, Nat.add_zero]
      rw [hR]; unfold sse_cf1TreeSum; rw [hPows 0]
      if hle : lo ≤ K then
        rw [sse_ite_pos hle, sse_ite_pos hle]; exact hTerm lo hlo
      else
        rw [sse_ite_neg hle, sse_ite_neg hle]
    | succ t' ih =>
      intro lo hlo
      have hPow : 2 ^ (t' + 1) = 2 ^ t' + 2 ^ t' := by simp only [Nat.pow_succ]; omega
      rw [hPow, sse_sumPairRange_add]
      unfold sse_cf1TreeSum; dsimp only
      rw [ih lo hlo]
      if hmid : lo + 2 ^ t' ≤ K then
        rw [sse_ite_pos hmid, hPows t', ← sse_zVec_matZ_pow2 t' (lo - M) (by omega)]
        have hSub : lo - M + 2 ^ t' = lo + 2 ^ t' - M := (Nat.sub_add_comm (by omega : M ≤ lo)).symm
        rw [hSub, ih (lo + 2 ^ t') (Nat.le_trans hlo (Nat.le_add_right _ _))]
      else
        rw [sse_ite_neg hmid]
        have hR : sse_sumPairRange (fun k => if k ≤ K then sse_cf1PairAt M W k else (0, 0)) (lo + 2 ^ t') (2 ^ t') = (0, 0) :=
          sse_sumPairRange_zero _ _ _ (fun i _ => sse_ite_neg (by omega) _ _)
        rw [hR]; simp
  unfold sse_cf1TreePair sse_cf1TreePairAux; dsimp only
  have hLo : sse_cf1FastGo M W cDen cSl (M + 1)
      (sse_zHist m0.1.1 m0.1.2.1 m0.1.2.2 m0.2.1.1 m0.2.1.2.1 m0.2.1.2.2 m0.2.2.1 m0.2.2.2.1 m0.2.2.2.2 M) =
      sse_sumPairRange (sse_cf1PairAt M W) 0 (M + 1) := by
    rw [sse_sumPairRange_normQuad M W M]
    exact sse_cf1FastPair_eq M M W
  have hZ1 : (1, 1, 1) = sseZVec sseCF1Om (M + 1 - M) := by
    have h1 : M + 1 - M = 1 := by omega
    rw [h1]; rfl
  have hHi : sse_cf1TreeSum K M W cDen cSl pows d (M + 1) (1, 1, 1) =
      sse_sumPairRange (sse_cf1PairAt M W) (M + 1) (K - M) := by
    rw [hZ1, hTree d (M + 1) (by omega)]
    have hSplit : 2 ^ d = (K - M) + (M + 1 + 2 ^ d - (K + 1)) := by omega
    rw [hSplit, sse_sumPairRange_add]; dsimp only
    have hA : sse_sumPairRange (fun k => if k ≤ K then sse_cf1PairAt M W k else (0, 0)) (M + 1) (K - M) =
        sse_sumPairRange (sse_cf1PairAt M W) (M + 1) (K - M) :=
      sse_sumPairRange_congr _ _ _ _ (fun i hi => sse_ite_pos (by omega) _ _)
    have hB : sse_sumPairRange (fun k => if k ≤ K then sse_cf1PairAt M W k else (0, 0))
        (M + 1 + (K - M)) (M + 1 + 2 ^ d - (K + 1)) = (0, 0) :=
      sse_sumPairRange_zero _ _ _ (fun i _ => sse_ite_neg (by omega) _ _)
    rw [hA, hB]; simp
  rw [hLo, hHi]
  have hComb := (sse_sumPairRange_add (sse_cf1PairAt M W) 0 (M + 1) (K - M)).symm
  simp only [Nat.zero_add] at hComb
  have hLen : M + 1 + (K - M) = K + 1 := by omega
  rw [hLen, sse_sumPairRange_normQuad M W K] at hComb
  exact hComb

private theorem sse_cf1_witness_verified :
    (∀ o : Fin 57, 0 < sseCF1Om o ∧ 0 < sseCF1V o) ∧
    (let p := sse_cf1TreePair 120 11 7 sseCF1Win
     p.1 > 0 ∧ 80 * p.2 > 913 * p.1 ∧ 1000 * p.2 > 11412 * p.1) := by
  decide

/-- Headline Theorem 8 (Concrete Finite-Support CF 1-Step Lower Bound `ρ > 913/80 = 11.4125`):
    plugs the concrete `57`-orbit positive integer witness `(sseCF1Om, sseCF1V, sseCF1Win)` on Cartier-Foata
    heights `k = 2..120` (`M = 11`, zero `sqrt`, zero asymptotic limits, zero dropped negative terms) into the
    exact literal Cartier-Foata word sums `sseCFExactNormSq` and `sseCFExactUp0Quad` via Theorem 7, proving:
    - `sseCFExactNormSq 120 sseCF1Win sseCF1Om sseCF1V > 0`,
    - **`80 * (48 * sseCFExactUp0Quad) > 913 * sseCFExactNormSq`** (`> 913 / 80 = 11.4125`!),
    - **`1000 * (48 * sseCFExactUp0Quad) > 11412 * sseCFExactNormSq`** (beating `Vibe.SpectralSharp`'s
      `11049/1000` by `> 0.363` and beating CF 0-step `11346/1000` by `> 0.066`!). -/
theorem thm_sse_cf_lower_bound :
    (∀ o : Fin 57, 0 < sseCF1Om o ∧ 0 < sseCF1V o) ∧
    (sseCFExactNormSq 120 sseCF1Win sseCF1Om sseCF1V > 0) ∧
    (80 * (48 * sseCFExactUp0Quad 120 sseCF1Win sseCF1Om sseCF1V) >
      913 * sseCFExactNormSq 120 sseCF1Win sseCF1Om sseCF1V) ∧
    (1000 * (48 * sseCFExactUp0Quad 120 sseCF1Win sseCF1Om sseCF1V) >
      11412 * sseCFExactNormSq 120 sseCF1Win sseCF1Om sseCF1V) := by
  have hEq := sse_cf1TreePair_eq 120 11 7 sseCF1Win (by decide) (by decide) (by decide)
  have hW := sse_cf1_witness_verified.2
  dsimp only at hW
  rw [hEq] at hW
  have hN := sse_cf_exact_normSq_eq 120 sseCF1Win sseCF1Om sseCF1V
  have hQ := sse_cf_exact_up0Quad_ge 120 11 sseCF1Win sseCF1Om sseCF1V
  refine ⟨sse_cf1_witness_verified.1, ?_, ?_, ?_⟩
  · rw [hN]; exact hW.1
  · rw [hN]
    have h1 : 80 * sseCF1QuadTrunc 120 11 sseCF1Win sseCF1Om sseCF1V ≤
        80 * (48 * sseCFExactUp0Quad 120 sseCF1Win sseCF1Om sseCF1V) := Nat.mul_le_mul_left 80 hQ
    omega
  · rw [hN]
    have h1 : 1000 * sseCF1QuadTrunc 120 11 sseCF1Win sseCF1Om sseCF1V ≤
        1000 * (48 * sseCFExactUp0Quad 120 sseCF1Win sseCF1Om sseCF1V) := Nat.mul_le_mul_left 1000 hQ
    omega

/-- Headline Theorem 9 (Master Machine-Checked `{3,4,3,4}` Spectral Radius Bracket `[913/80, 387141227/33670000]`):
    combines the concrete CF 1-step lower witness (`> 913/80 = 11.4125`) with the Depth-2 `19`-state
    Nagnibeda Schur upper bound (`≤ 387141227/33670000 < 11.4982 < 11.5`), certifying inside Lean's kernel:
    - Raw adjacency bracket: `11049/1000 < 913/80 < ρ_low ≤ ρ ≤ 387141227/33670000 < 115/10 < 3325977059/278900000`,
    - Certified width `387141227/33670000 - 913/80 = 57647040/673400000 < 86/1000` (**`> 10.2×` tighter**
      than `Vibe.SpectralSharp`'s width `3325977059/278900000 - 11049/1000 > 876/1000`!),
    - Normalized walk radius: `913/1920 < ρ/24 ≤ 387141227/808080000 < 23/48 < 1/2`,
    - Normalized Laplacian spectral gap: `1/2 < 13/25 < 25/48 < 420938773/808080000 ≤ λ_gap < 1007/1920`. -/
theorem thm_sse_combined_spectral_bracket :
    (80 * (48 * sseCFExactUp0Quad 120 sseCF1Win sseCF1Om sseCF1V) >
      913 * sseCFExactNormSq 120 sseCF1Win sseCF1Om sseCF1V) ∧
    (∀ u : Fin 19, QPos.le (sseD2RowSumQPos u) ⟨387141227, 33670000, by decide⟩) ∧
    (∀ u : Fin 19, QPos.le (QPos.divPos (sseD2RowSumQPos u) 24 (by decide)) ⟨387141227, 808080000, by decide⟩) ∧
    (11049 * 80 < 913 * 1000 ∧
     913 * 33670000 < 387141227 * 80 ∧
     387141227 * 10 < 115 * 33670000 ∧
     115 * 278900000 < 3325977059 * 10) ∧
    QPos.eq (QPos.add ⟨913, 80, by decide⟩ ⟨57647040, 673400000, by decide⟩) ⟨387141227, 33670000, by decide⟩ ∧
    (57647040 * 1000 < 86 * 673400000 ∧
     102 * (387141227 * 80 - 913 * 33670000) * 278900000 * 1000 <
       10 * (3325977059 * 1000 - 11049 * 278900000) * 33670000 * 80) ∧
    (913 * 808080000 < 387141227 * 1920 ∧ 387141227 * 48 < 23 * 808080000 ∧ 23 < 24) ∧
    (1 * 25 < 13 * 2 ∧ 13 * 48 < 25 * 25 ∧ 25 * 808080000 < 420938773 * 48 ∧
     420938773 * 1920 < 1007 * 808080000) :=
  ⟨thm_sse_cf_lower_bound.2.2.1,
   thm_sse_depth2_nagnibeda_upper_bound.2.1,
   thm_sse_depth2_nagnibeda_upper_bound.2.2.2.2.2.1,
   by decide,
   by unfold QPos.eq QPos.add; decide,
   by decide,
   by decide,
   by decide⟩


end

end Vibe
