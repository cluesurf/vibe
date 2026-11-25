import Vibe.Algebra
import Vibe.CuspGrowth
import Vibe.SchurGap
import Vibe.SpectralSharp

/-!
# Vibe Theory: Deep Spectral Radius Collapse for `{3,4,3,4}` (`913/80 < ρ ≤ 387141227/33670000 < 11.5`, `λ_gap > 13/25`)

Zero-dependency Lean 4.35.0 formalization of Wave-3 Track W7 (`01-spectral-radius-deep-collapse.md`,
Milestone P8-C), collapsing `Vibe.SpectralSharp`'s kernel-verified spectral radius bracket
`[11049/1000, 3325977059/278900000]` (width `0.8763`) by more than **`10.2×`** strictly inside
Lean's kernel to **`[913/80, 387141227/33670000]`** (`[11.4125, 11.498106]`, width `< 0.086`):

1. **`W(F_4)` Automorphisms & Exhaustive `216`-Clique Transitivity (`thm_sse_wf4_automorphisms_and_216_cliques`):**
   - Proves all 4 Bourbaki `W(F_4)` simple reflections are involutions preserving `dot4 (d4RootOf a) (d4RootOf b)`
     and `adj24`, hence every `W(F_4)` word is an explicit bijection preserving `dot4` and `adj24`.
   - Builds all `216` non-empty cliques of `Γ_24` directly from `Vibe.CuspGrowth`'s `cliques1_24`,
     `cliques2_24`, `cliques3_24` and certifies explicit `W(F_4)` canonicalizing words mapping every
     `k`-clique onto `[0]`, `[0, 4]`, or `[0, 4, 8]`.
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
  1. All `W(F_4)` automorphism laws, `216`-clique transitivity, `19`-state Depth-2 automaton closure under
     `sseStepD2` on `adj24`, `24`-regularity, Depth-1 lumpability, `r = 0..6` and all-`r` shell growth
     matching `Vibe.CuspGrowth`, `23`-flag unique ownership, unconditional `Aut`-invariance, and edge reciprocity.
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
     (`ρ ≥ 11.439047`) live in `test/breakthrough/spectral-radius-deep-collapse.ts`.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Private `Nat` / `Int` / `Fin` / `List` Summation, Bijection & Grouping Helpers -/

private theorem sse_ite_pos {α : Type} {c : Prop} [h : Decidable c] (hc : c) (a b : α) :
    (if c then a else b) = a :=
  match h with | isTrue _ => rfl | isFalse hnc => absurd hc hnc

private theorem sse_ite_neg {α : Type} {c : Prop} [h : Decidable c] (hnc : ¬ c) (a b : α) :
    (if c then a else b) = b :=
  match h with | isTrue hc => absurd hc hnc | isFalse _ => rfl

private theorem sse_int_mul_pos (a b : Int) (ha : 0 < a) (hb : 0 < b) : 0 < a * b := by
  have h : 0 ≤ (a - 1) * (b - 1) := Int.mul_nonneg (by omega) (by omega)
  rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.one_mul, Int.mul_one] at h; omega

private theorem sse_int_mul_le_right (a b c : Int) (hab : a ≤ b) (hc : 0 ≤ c) : a * c ≤ b * c := by
  have h : 0 ≤ (b - a) * c := Int.mul_nonneg (by omega) hc
  rw [Int.sub_mul] at h; omega

private theorem sse_int_le_of_mul_le_right (x y d : Int) (hd : 0 < d) (h : x * d ≤ y * d) : x ≤ y := by
  if hxy : x ≤ y then exact hxy
  else
    have hpos : 0 < (x - y) * d := sse_int_mul_pos (x - y) d (by omega) hd
    rw [Int.sub_mul] at hpos; omega

private theorem sse_int_mul_right_comm (a b c : Int) : (a * b) * c = (a * c) * b := by
  rw [Int.mul_assoc, Int.mul_comm b c, ← Int.mul_assoc]

/-- Exact finite `Nat` sum `∑_{i = 0}^{k - 1} f i` over `Fin n`. -/
def sseSumFinNatAux {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) : Nat :=
  match k with
  | 0 => 0
  | m + 1 => sseSumFinNatAux m (Nat.le_of_succ_le hk) f + f ⟨m, hk⟩

/-- Exact finite `Nat` sum `∑_{i : Fin n} f i`. -/
def sseSumFinNat {n : Nat} (f : Fin n → Nat) : Nat := sseSumFinNatAux n (Nat.le_refl n) f

private theorem sse_sumFinNatAux_zero {n : Nat} (k : Nat) (hk : k ≤ n) :
    sseSumFinNatAux k hk (fun _ : Fin n => 0) = 0 := by
  induction k with | zero => rfl | succ m ih => simp only [sseSumFinNatAux]; rw [ih (Nat.le_of_succ_le hk)]

private theorem sse_sumFinNatAux_add {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Nat) :
    sseSumFinNatAux k hk (fun i => f i + g i) = sseSumFinNatAux k hk f + sseSumFinNatAux k hk g := by
  induction k with
  | zero => rfl
  | succ m ih => simp only [sseSumFinNatAux]; rw [ih (Nat.le_of_succ_le hk)]; omega

private theorem sse_sumFinNatAux_le {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Nat)
    (h : ∀ i : Fin n, f i ≤ g i) : sseSumFinNatAux k hk f ≤ sseSumFinNatAux k hk g := by
  induction k with
  | zero => exact Nat.le_refl 0
  | succ m ih =>
    simp only [sseSumFinNatAux]
    have hm := ih (Nat.le_of_succ_le hk)
    have ht := h ⟨m, hk⟩
    omega

private theorem sse_sumFinNatAux_congr {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Nat)
    (h : ∀ i : Fin n, f i = g i) : sseSumFinNatAux k hk f = sseSumFinNatAux k hk g := by
  induction k with
  | zero => rfl
  | succ m ih => simp only [sseSumFinNatAux]; rw [ih (Nat.le_of_succ_le hk), h ⟨m, hk⟩]

private theorem sse_sumFinNatAux_mul_left {n : Nat} (k : Nat) (hk : k ≤ n) (c : Nat) (f : Fin n → Nat) :
    sseSumFinNatAux k hk (fun i => c * f i) = c * sseSumFinNatAux k hk f := by
  induction k with
  | zero => simp only [sseSumFinNatAux, Nat.mul_zero]
  | succ m ih => simp only [sseSumFinNatAux]; rw [ih (Nat.le_of_succ_le hk), Nat.mul_add]

private theorem sse_sumFinNatAux_mul_right {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) (c : Nat) :
    sseSumFinNatAux k hk (fun i => f i * c) = sseSumFinNatAux k hk f * c := by
  induction k with
  | zero => simp only [sseSumFinNatAux, Nat.zero_mul]
  | succ m ih => simp only [sseSumFinNatAux]; rw [ih (Nat.le_of_succ_le hk), Nat.add_mul]

private theorem sse_sumFinNatAux_swap {n1 n2 : Nat} (k : Nat) (hk : k ≤ n1) (f : Fin n1 → Fin n2 → Nat) :
    sseSumFinNatAux k hk (fun i => sseSumFinNat (fun j => f i j)) =
      sseSumFinNat (fun j => sseSumFinNatAux k hk (fun i => f i j)) := by
  induction k with
  | zero => exact (sse_sumFinNatAux_zero n2 (Nat.le_refl n2)).symm
  | succ m ih =>
    simp only [sseSumFinNatAux]
    rw [ih (Nat.le_of_succ_le hk)]
    exact (sse_sumFinNatAux_add n2 (Nat.le_refl n2) _ _).symm

private theorem sse_sumFinNatAux_kronecker {m : Nat} (k : Nat) (hk : k ≤ m) (u0 : Fin m) (g : Fin m → Nat) :
    sseSumFinNatAux k hk (fun u : Fin m => if u0 = u then g u else 0) =
      if u0.val < k then g u0 else 0 := by
  induction k with
  | zero => rw [sse_ite_neg (by omega)]; rfl
  | succ p ih =>
    simp only [sseSumFinNatAux]
    rw [ih (Nat.le_of_succ_le hk)]
    if hlt : u0.val < p then
      have hlt1 : u0.val < p + 1 := by omega
      have hne : u0 ≠ ⟨p, hk⟩ := fun h => by have := congrArg Fin.val h; omega
      rw [sse_ite_pos hlt, sse_ite_neg hne, sse_ite_pos hlt1]; omega
    else if heq : u0.val = p then
      have hlt1 : u0.val < p + 1 := by omega
      have hfeq : u0 = ⟨p, hk⟩ := Fin.ext heq
      rw [sse_ite_neg hlt, sse_ite_pos hfeq, ← hfeq, sse_ite_pos hlt1]; omega
    else
      have hlt1 : ¬ (u0.val < p + 1) := by omega
      have hne : u0 ≠ ⟨p, hk⟩ := fun h => heq (congrArg Fin.val h)
      rw [sse_ite_neg hlt, sse_ite_neg hne, sse_ite_neg hlt1]

private theorem sse_sumFinNat_zero {n : Nat} : sseSumFinNat (fun _ : Fin n => 0) = 0 :=
  sse_sumFinNatAux_zero n (Nat.le_refl n)

private theorem sse_sumFinNat_add {n : Nat} (f g : Fin n → Nat) :
    sseSumFinNat (fun i => f i + g i) = sseSumFinNat f + sseSumFinNat g :=
  sse_sumFinNatAux_add n (Nat.le_refl n) f g

private theorem sse_sumFinNat_le {n : Nat} (f g : Fin n → Nat) (h : ∀ i : Fin n, f i ≤ g i) :
    sseSumFinNat f ≤ sseSumFinNat g := sse_sumFinNatAux_le n (Nat.le_refl n) f g h

private theorem sse_sumFinNat_congr {n : Nat} (f g : Fin n → Nat) (h : ∀ i : Fin n, f i = g i) :
    sseSumFinNat f = sseSumFinNat g := sse_sumFinNatAux_congr n (Nat.le_refl n) f g h

private theorem sse_sumFinNat_mul_left {n : Nat} (c : Nat) (f : Fin n → Nat) :
    sseSumFinNat (fun i => c * f i) = c * sseSumFinNat f :=
  sse_sumFinNatAux_mul_left n (Nat.le_refl n) c f

private theorem sse_sumFinNat_mul_right {n : Nat} (f : Fin n → Nat) (c : Nat) :
    sseSumFinNat (fun i => f i * c) = sseSumFinNat f * c :=
  sse_sumFinNatAux_mul_right n (Nat.le_refl n) f c

private theorem sse_sumFinNat_swap {n1 n2 : Nat} (f : Fin n1 → Fin n2 → Nat) :
    sseSumFinNat (fun i => sseSumFinNat (fun j => f i j)) =
      sseSumFinNat (fun j => sseSumFinNat (fun i => f i j)) :=
  sse_sumFinNatAux_swap n1 (Nat.le_refl n1) f

private theorem sse_sumFinNat_kronecker {m : Nat} (u0 : Fin m) (g : Fin m → Nat) :
    sseSumFinNat (fun u : Fin m => if u0 = u then g u else 0) = g u0 := by
  unfold sseSumFinNat; rw [sse_sumFinNatAux_kronecker, sse_ite_pos u0.isLt]

private theorem sse_sumFinNat_kronecker_symm {m : Nat} (u0 : Fin m) (g : Fin m → Nat) :
    sseSumFinNat (fun u : Fin m => if u = u0 then g u else 0) = g u0 := by
  have h : (fun u : Fin m => if u = u0 then g u else 0) = (fun u : Fin m => if u0 = u then g u else 0) := by
    funext u
    if hu : u = u0 then rw [sse_ite_pos hu, sse_ite_pos hu.symm]
    else rw [sse_ite_neg hu, sse_ite_neg (fun h' => hu h'.symm)]
  rw [h]; exact sse_sumFinNat_kronecker u0 g

private theorem sse_sumFinNat_bij {n : Nat} (π πInv : Fin n → Fin n)
    (hL : ∀ i : Fin n, πInv (π i) = i) (hR : ∀ j : Fin n, π (πInv j) = j) (f : Fin n → Nat) :
    sseSumFinNat (fun i => f (π i)) = sseSumFinNat f := by
  have h1 : (fun i : Fin n => f (π i)) =
      (fun i : Fin n => sseSumFinNat (fun j : Fin n => if π i = j then f j else 0)) :=
    funext (fun i => (sse_sumFinNat_kronecker (π i) f).symm)
  rw [h1, sse_sumFinNat_swap]
  apply sse_sumFinNat_congr; intro j
  have h2 : (fun i : Fin n => if π i = j then f j else 0) =
      (fun i : Fin n => if i = πInv j then f j else 0) := by
    funext i
    if he : π i = j then
      have hi : i = πInv j := by rw [← he, hL i]
      rw [sse_ite_pos he, sse_ite_pos hi]
    else
      have hni : i ≠ πInv j := fun hi => he (by rw [hi, hR j])
      rw [sse_ite_neg he, sse_ite_neg hni]
  rw [h2, sse_sumFinNat_kronecker_symm (πInv j) (fun _ => f j)]

/-- Weighted sum over a multiplicity table `List (α × Nat)`: `∑_{(k, m) ∈ tbl} m * F k`. -/
def sseTableSum {α : Type} (F : α → Nat) : List (α × Nat) → Nat
  | [] => 0
  | (k, m) :: rest => m * F k + sseTableSum F rest

/-- Unweighted sum of `F` over a list of tags `List α`. -/
def sseListMapSum {α : Type} (F : α → Nat) : List α → Nat
  | [] => 0
  | x :: xs => F x + sseListMapSum F xs

/-- Exact list count of occurrences of `k` in `xs`. -/
def sseListCount {α : Type} [DecidableEq α] (k : α) : List α → Nat
  | [] => 0
  | x :: xs => (if x = k then 1 else 0) + sseListCount k xs

/-- Exact duplicate-free boolean predicate on a list. -/
def sseListNodup {α : Type} [DecidableEq α] : List α → Bool
  | [] => true
  | x :: xs => !(xs.any (fun y => decide (y = x))) && sseListNodup xs

/-- Extract all tags `tag i` over `i ∈ 0..k-1` satisfying `P i = true` (evaluated once per `i`). -/
def sseCollectTagsAux {n : Nat} {α : Type} (P : Fin n → Bool) (tag : Fin n → α) :
    (k : Nat) → k ≤ n → List α
  | 0, _ => []
  | m + 1, hm =>
    let i : Fin n := ⟨m, hm⟩
    let rest := sseCollectTagsAux P tag m (Nat.le_of_succ_le hm)
    if P i = true then tag i :: rest else rest

def sseCollectTags {n : Nat} {α : Type} (P : Fin n → Bool) (tag : Fin n → α) : List α :=
  sseCollectTagsAux P tag n (Nat.le_refl n)

private theorem sse_sumFinNat_eq_collectTags {n : Nat} {α : Type}
    (P : Fin n → Bool) (tag : Fin n → α) (F : α → Nat) :
    sseSumFinNat (fun i : Fin n => if P i = true then F (tag i) else 0) =
      sseListMapSum F (sseCollectTags P tag) := by
  have hAux : ∀ (k : Nat) (hk : k ≤ n),
      sseSumFinNatAux k hk (fun i : Fin n => if P i = true then F (tag i) else 0) =
        sseListMapSum F (sseCollectTagsAux P tag k hk) := by
    intro k hk; induction k with
    | zero => rfl
    | succ m ih =>
      simp only [sseSumFinNatAux, sseCollectTagsAux]
      rw [ih (Nat.le_of_succ_le hk)]
      if hP : P ⟨m, hk⟩ = true then
        rw [sse_ite_pos hP, sse_ite_pos hP]; unfold sseListMapSum; omega
      else
        rw [sse_ite_neg hP, sse_ite_neg hP]; omega
  exact hAux n (Nat.le_refl n)

private theorem sse_listMapSum_kronecker {α : Type} [DecidableEq α] (k : α) (F : α → Nat) (xs : List α) :
    sseListMapSum (fun x => if x = k then F k else 0) xs = sseListCount k xs * F k := by
  induction xs with
  | nil => simp only [sseListMapSum, sseListCount, Nat.zero_mul]
  | cons x rest ih =>
    simp only [sseListMapSum, sseListCount, ih, Nat.add_mul]
    if hx : x = k then rw [sse_ite_pos hx, sse_ite_pos hx, Nat.one_mul]
    else rw [sse_ite_neg hx, sse_ite_neg hx, Nat.zero_mul]

private theorem sse_listMapSum_add {α : Type} (f g : α → Nat) (xs : List α) :
    sseListMapSum (fun x => f x + g x) xs = sseListMapSum f xs + sseListMapSum g xs := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [sseListMapSum, ih]; omega

private theorem sse_listMapSum_zero {α : Type} (xs : List α) :
    sseListMapSum (fun _ : α => 0) xs = 0 := by
  induction xs with | nil => rfl | cons _ _ ih => simp only [sseListMapSum, ih]

private theorem sse_listMapSum_congr {α : Type} (f g : α → Nat) (xs : List α)
    (h : ∀ x : α, xs.any (fun y => decide (y = x)) = true → f x = g x) :
    sseListMapSum f xs = sseListMapSum g xs := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [sseListMapSum]
    have hx : f x = g x := h x (by simp)
    have hr : sseListMapSum f rest = sseListMapSum g rest :=
      ih (fun y hy => h y (by simp [hy]))
    rw [hx, hr]

private theorem sse_listMapSum_eq_tableSum {α : Type} [DecidableEq α]
    (xs : List α) (tbl : List (α × Nat)) (F : α → Nat)
    (hCov : xs.all (fun x => tbl.any (fun e => decide (e.1 = x))) = true)
    (hNodup : sseListNodup (tbl.map Prod.fst) = true)
    (hCnt : tbl.all (fun e => decide (sseListCount e.1 xs = e.2)) = true) :
    sseListMapSum F xs = sseTableSum F tbl := by
  have hDecomp : ∀ (t : List (α × Nat)) (x : α),
      sseListNodup (t.map Prod.fst) = true →
      sseTableSum (fun k => if x = k then F k else 0) (t.map (fun e => (e.1, 1))) =
        if t.any (fun e => decide (e.1 = x)) = true then F x else 0 := by
    intro t x; induction t with
    | nil => intro _; rfl
    | cons e rest ih =>
      intro hnd
      simp only [List.map, sseListNodup, Bool.and_eq_true, Bool.not_eq_true'] at hnd
      simp only [List.map, sseTableSum, Nat.one_mul, ih hnd.2, List.any]
      if hxe : x = e.1 then
        have hNotIn : rest.any (fun p => decide (p.1 = x)) = false := by
          have h1 := hnd.1
          rw [← hxe] at h1
          clear ih hnd hxe
          induction rest with
          | nil => rfl
          | cons r rs ihr =>
            simp only [List.map, List.any, Bool.or_eq_false_iff] at h1 ⊢
            exact ⟨h1.1, ihr h1.2⟩
        have hEq1 : decide (e.1 = x) = true := decide_eq_true hxe.symm
        rw [sse_ite_pos hxe, hNotIn, hEq1, Bool.true_or, sse_ite_neg (by decide), sse_ite_pos rfl, hxe]; omega
      else
        have hNe1 : decide (e.1 = x) = false := decide_eq_false (fun h => hxe h.symm)
        rw [sse_ite_neg hxe, hNe1, Bool.false_or]; omega
  have hSwap : ∀ (t : List (α × Nat)),
      sseListMapSum (fun x => sseTableSum (fun k => if x = k then F k else 0) (t.map (fun e => (e.1, 1)))) xs =
        sseTableSum (fun k => sseListCount k xs * F k) (t.map (fun e => (e.1, 1))) := by
    intro t; induction t with
    | nil =>
      change sseListMapSum (fun _ => 0) xs = 0
      exact sse_listMapSum_zero xs
    | cons e rest ih =>
      simp only [List.map, sseTableSum, Nat.one_mul]
      rw [sse_listMapSum_add, sse_listMapSum_kronecker, ih]
  have hLeft : sseListMapSum F xs =
      sseListMapSum (fun x => sseTableSum (fun k => if x = k then F k else 0) (tbl.map (fun e => (e.1, 1)))) xs := by
    apply sse_listMapSum_congr; intro x hx
    rw [hDecomp tbl x hNodup]
    have hIn : tbl.any (fun e => decide (e.1 = x)) = true := by
      have hMem : ∀ (l : List α), l.all (fun y => tbl.any (fun e => decide (e.1 = y))) = true →
          l.any (fun y => decide (y = x)) = true → tbl.any (fun e => decide (e.1 = x)) = true := by
        intro l; induction l with
        | nil => intro _ ha; exact absurd ha (by decide)
        | cons y ys ihl =>
          intro hall hany
          simp only [List.all, Bool.and_eq_true] at hall
          simp only [List.any, Bool.or_eq_true] at hany
          cases hany with
          | inl hy => have heq : y = x := of_decide_eq_true hy; rw [← heq]; exact hall.1
          | inr hys => exact ihl hall.2 hys
      exact hMem xs hCov hx
    rw [sse_ite_pos hIn]
  have hRight : ∀ (t : List (α × Nat)),
      t.all (fun e => decide (sseListCount e.1 xs = e.2)) = true →
      sseTableSum (fun k => sseListCount k xs * F k) (t.map (fun e => (e.1, 1))) = sseTableSum F t := by
    intro t; induction t with
    | nil => intro _; rfl
    | cons e rest ih =>
      intro hc
      simp only [List.all, Bool.and_eq_true] at hc
      have he : sseListCount e.1 xs = e.2 := of_decide_eq_true hc.1
      simp only [List.map, sseTableSum, Nat.one_mul, he, ih hc.2]
  rw [hLeft, hSwap tbl, hRight tbl hCnt]

private theorem sse_sumFinNat_group_by_table {n : Nat} {α : Type} [DecidableEq α]
    (P : Fin n → Bool) (tag : Fin n → α) (tbl : List (α × Nat)) (F : α → Nat)
    (hCov : (sseCollectTags P tag).all (fun x => tbl.any (fun e => decide (e.1 = x))) = true)
    (hNodup : sseListNodup (tbl.map Prod.fst) = true)
    (hCnt : tbl.all (fun e => decide (sseListCount e.1 (sseCollectTags P tag) = e.2)) = true) :
    sseSumFinNat (fun i : Fin n => if P i = true then F (tag i) else 0) = sseTableSum F tbl := by
  rw [sse_sumFinNat_eq_collectTags]
  exact sse_listMapSum_eq_tableSum (sseCollectTags P tag) tbl F hCov hNodup hCnt

-- Private `Int` sum helpers over `Vibe.SpectralSharp.ssSumFin` for Section 4's subgraph Schur bridge.
private theorem sse_ssSumFinAux_add {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Int) :
    ssSumFinAux k hk (fun i => f i + g i) = ssSumFinAux k hk f + ssSumFinAux k hk g := by
  induction k with
  | zero => rfl
  | succ m ih =>
    change ssSumFinAux m (by omega) _ + (f ⟨m, by omega⟩ + g ⟨m, by omega⟩) =
      (ssSumFinAux m (by omega) f + f ⟨m, by omega⟩) + (ssSumFinAux m (by omega) g + g ⟨m, by omega⟩)
    rw [ih (by omega)]; omega

private theorem sse_ssSumFinAux_zero {n : Nat} (k : Nat) (hk : k ≤ n) :
    ssSumFinAux k hk (fun _ : Fin n => (0 : Int)) = 0 := by
  induction k with
  | zero => rfl
  | succ m ih => change ssSumFinAux m (by omega) _ + 0 = 0; rw [ih (by omega)]; omega

private theorem sse_ssSumFinAux_le {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Int)
    (h : ∀ i : Fin n, f i ≤ g i) : ssSumFinAux k hk f ≤ ssSumFinAux k hk g := by
  induction k with
  | zero => exact Int.le_refl 0
  | succ m ih =>
    change ssSumFinAux m (by omega) f + f ⟨m, by omega⟩ ≤ ssSumFinAux m (by omega) g + g ⟨m, by omega⟩
    have hm := ih (by omega); have ht := h ⟨m, by omega⟩; omega

private theorem sse_ssSumFinAux_mul_right {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Int) (c : Int) :
    ssSumFinAux k hk (fun i => f i * c) = ssSumFinAux k hk f * c := by
  induction k with
  | zero => change (0 : Int) = 0 * c; rw [Int.zero_mul]
  | succ m ih =>
    change ssSumFinAux m (by omega) _ + f ⟨m, by omega⟩ * c =
      (ssSumFinAux m (by omega) f + f ⟨m, by omega⟩) * c
    rw [ih (by omega), Int.add_mul]

private theorem sse_ssSumFinAux_swap {n1 n2 : Nat} (k : Nat) (hk : k ≤ n1) (f : Fin n1 → Fin n2 → Int) :
    ssSumFinAux k hk (fun i => ssSumFin (fun j => f i j)) =
      ssSumFin (fun j => ssSumFinAux k hk (fun i => f i j)) := by
  induction k with
  | zero => exact (sse_ssSumFinAux_zero n2 (Nat.le_refl n2)).symm
  | succ m ih =>
    change ssSumFinAux m (by omega) _ + ssSumFin (fun j => f ⟨m, by omega⟩ j) =
      ssSumFin (fun j => ssSumFinAux m (by omega) (fun i => f i j) + f ⟨m, by omega⟩ j)
    rw [ih (by omega)]
    exact (sse_ssSumFinAux_add n2 (Nat.le_refl n2) _ _).symm

private theorem sse_ssSumFinAux_kronecker {m : Nat} (k : Nat) (hk : k ≤ m) (u0 : Fin m) (g : Fin m → Int) :
    ssSumFinAux k hk (fun u : Fin m => if u0 = u then g u else 0) = if u0.val < k then g u0 else 0 := by
  induction k with
  | zero => rw [sse_ite_neg (by omega)]; rfl
  | succ p ih =>
    change ssSumFinAux p (by omega) _ + (if u0 = ⟨p, by omega⟩ then g ⟨p, by omega⟩ else 0) =
      if u0.val < p + 1 then g u0 else 0
    rw [ih (by omega)]
    if hlt : u0.val < p then
      have hne : u0 ≠ ⟨p, by omega⟩ := fun h => by have := congrArg Fin.val h; omega
      rw [sse_ite_pos hlt, sse_ite_neg hne, sse_ite_pos (by omega)]; omega
    else if heq : u0.val = p then
      have hfeq : u0 = ⟨p, by omega⟩ := Fin.ext heq
      rw [sse_ite_neg hlt, sse_ite_pos hfeq, ← hfeq, sse_ite_pos (by omega)]; omega
    else
      have hne : u0 ≠ ⟨p, by omega⟩ := fun h => heq (congrArg Fin.val h)
      rw [sse_ite_neg hlt, sse_ite_neg hne, sse_ite_neg (by omega)]; omega

private theorem sse_ssSumFin_add {n : Nat} (f g : Fin n → Int) :
    ssSumFin (fun i => f i + g i) = ssSumFin f + ssSumFin g := sse_ssSumFinAux_add n (Nat.le_refl n) f g

private theorem sse_ssSumFin_le {n : Nat} (f g : Fin n → Int) (h : ∀ i : Fin n, f i ≤ g i) :
    ssSumFin f ≤ ssSumFin g := sse_ssSumFinAux_le n (Nat.le_refl n) f g h

private theorem sse_ssSumFin_mul_right {n : Nat} (f : Fin n → Int) (c : Int) :
    ssSumFin (fun i => f i * c) = ssSumFin f * c := sse_ssSumFinAux_mul_right n (Nat.le_refl n) f c

private theorem sse_ssSumFin_swap {n1 n2 : Nat} (f : Fin n1 → Fin n2 → Int) :
    ssSumFin (fun i => ssSumFin (fun j => f i j)) = ssSumFin (fun j => ssSumFin (fun i => f i j)) :=
  sse_ssSumFinAux_swap n1 (Nat.le_refl n1) f

private theorem sse_ssSumFin_kronecker {m : Nat} (u0 : Fin m) (g : Fin m → Int) :
    ssSumFin (fun u : Fin m => if u0 = u then g u else 0) = g u0 := by
  unfold ssSumFin; rw [sse_ssSumFinAux_kronecker, sse_ite_pos u0.isLt]


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

private theorem sse_wf4GenNat_lt (k : Fin 4) (a : Fin 24) : sseWF4GenNat k.val a.val < 24 := by
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

private theorem sse_applyWord_inj (w : List (Fin 4)) (a b : Fin 24)
    (h : sseApplyWord w a = sseApplyWord w b) : a = b := by
  have h1 := congrArg (sseApplyWord w.reverse) h
  rw [sse_applyWord_inv, sse_applyWord_inv] at h1; exact h1

/-- Fast `Nat` adjacency mirror on `0..23` matching `Vibe.CuspGrowth.adj24`. -/
private abbrev sse_Adj8 := Nat × Nat × Nat × Nat × Nat × Nat × Nat × Nat

private def sse_in8 (x : Nat) (t : sse_Adj8) : Bool :=
  (x == t.1) || (x == t.2.1) || (x == t.2.2.1) || (x == t.2.2.2.1) ||
  (x == t.2.2.2.2.1) || (x == t.2.2.2.2.2.1) || (x == t.2.2.2.2.2.2.1) || (x == t.2.2.2.2.2.2.2)

private def sse_adjTupleNat : Nat → sse_Adj8
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

private def sse_adjFast (a b : Nat) : Bool := sse_in8 b (sse_adjTupleNat a)

private theorem sse_adj24_eq_fast : ∀ a b : Fin 24, adj24 a b = sse_adjFast a.val b.val := by decide

/-- Shifted dot product `(r_a · r_b + 2) ∈ {0, 1, 2, 3, 4}` on `0..23`. -/
def sseDotPlus2 (a b : Fin 24) : Nat := (dot4 (d4RootOf a) (d4RootOf b) + 2).toNat

/-- Fast `Nat` root coordinates for `dot4 + 2` calculation. -/
private def sse_dotPlus2Fast (a b : Nat) : Nat :=
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

private theorem sse_allCliquesList_len : sseAllCliquesList.length = 216 := by decide

private def sse_allCliquesArr : Array SseClique := sseAllCliquesList.toArray

/-- Indexed access to all `216` non-empty cliques of `Γ_24`. -/
def sseClique216 (i : Fin 216) : SseClique :=
  sse_allCliquesArr.getD i.val (SseClique.c1 ⟨0, by decide⟩)

/-- Clique cardinality `|C| ∈ {1, 2, 3}`. -/
def sseCliqueSize : SseClique → Nat
  | SseClique.c1 _ => 1
  | SseClique.c2 _ _ => 2
  | SseClique.c3 _ _ _ => 3

def sseSize216 (i : Fin 216) : Nat := sseCliqueSize (sseClique216 i)

/-- Sort 2 `Fin 24` vertices ascending. -/
def sseSort2Fin (a b : Fin 24) : Fin 24 × Fin 24 :=
  if a.val ≤ b.val then (a, b) else (b, a)

/-- Sort 3 `Fin 24` vertices ascending. -/
def sseSort3Fin (a b c : Fin 24) : Fin 24 × Fin 24 × Fin 24 :=
  let (x1, y1) := sseSort2Fin a b
  let (y2, z2) := sseSort2Fin y1 c
  let (x3, y3) := sseSort2Fin x1 y2
  (x3, y3, z2)

/-- Action of a `W(F_4)` generator `k : Fin 4` on a clique (re-sorted ascending). -/
def sseActCliqueGen (k : Fin 4) : SseClique → SseClique
  | SseClique.c1 a => SseClique.c1 (sseWF4Gen k a)
  | SseClique.c2 a b =>
    let p := sseSort2Fin (sseWF4Gen k a) (sseWF4Gen k b)
    SseClique.c2 p.1 p.2
  | SseClique.c3 a b c =>
    let t := sseSort3Fin (sseWF4Gen k a) (sseWF4Gen k b) (sseWF4Gen k c)
    SseClique.c3 t.1 t.2.1 t.2.2

private def sse_act216GenArr0 : Array Nat := #[
    4, 5, 6, 7, 0, 1, 2, 3, 8, 9, 10, 11, 12, 14, 13, 15, 20, 21, 22, 23, 16, 17, 18, 19,
    24, 32, 56, 57, 58, 59, 60, 61, 25, 33, 62, 63, 64, 65, 66, 67, 40, 48, 68, 69, 70, 71, 72, 73,
    41, 49, 74, 75, 76, 77, 78, 79, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 39, 42, 43, 44, 45,
    46, 47, 50, 51, 52, 53, 54, 55, 82, 83, 80, 81, 86, 87, 84, 85, 90, 91, 88, 89, 94, 95, 92, 93,
    98, 99, 96, 97, 106, 107, 104, 105, 102, 103, 100, 101, 110, 111, 108, 109, 112, 116, 114, 118, 113, 117, 115, 119,
    120, 121, 122, 132, 133, 134, 168, 169, 170, 171, 172, 173, 123, 124, 125, 135, 136, 137, 174, 175, 176, 177, 178, 179,
    144, 145, 146, 156, 157, 158, 180, 181, 182, 183, 184, 185, 147, 148, 149, 159, 160, 161, 186, 187, 188, 189, 190, 191,
    126, 127, 128, 129, 130, 131, 138, 139, 140, 141, 142, 143, 150, 151, 152, 153, 154, 155, 162, 163, 164, 165, 166, 167,
    192, 194, 193, 195, 196, 198, 197, 199, 200, 202, 201, 203, 204, 206, 205, 207, 208, 209, 212, 213, 210, 211, 214, 215
  ]

private def sse_act216GenArr1 : Array Nat := #[
    0, 1, 2, 3, 8, 9, 10, 11, 4, 5, 6, 7, 16, 17, 18, 19, 12, 13, 14, 15, 20, 22, 21, 23,
    26, 27, 24, 25, 30, 31, 28, 29, 34, 35, 32, 33, 38, 39, 36, 37, 42, 43, 40, 41, 46, 47, 44, 45,
    50, 51, 48, 49, 54, 55, 52, 53, 56, 62, 80, 81, 82, 83, 57, 63, 84, 85, 86, 87, 68, 74, 88, 89,
    90, 91, 69, 75, 92, 93, 94, 95, 58, 59, 60, 61, 64, 65, 66, 67, 70, 71, 72, 73, 76, 77, 78, 79,
    96, 100, 112, 113, 97, 101, 114, 115, 104, 108, 116, 117, 105, 109, 118, 119, 98, 99, 102, 103, 106, 107, 110, 111,
    120, 123, 126, 121, 124, 127, 122, 125, 128, 130, 129, 131, 132, 135, 138, 133, 136, 139, 134, 137, 140, 142, 141, 143,
    144, 147, 150, 145, 148, 151, 146, 149, 152, 154, 153, 155, 156, 159, 162, 157, 160, 163, 158, 161, 164, 166, 165, 167,
    168, 174, 192, 193, 194, 195, 169, 175, 196, 197, 198, 199, 180, 186, 200, 201, 202, 203, 181, 187, 204, 205, 206, 207,
    170, 171, 172, 173, 176, 177, 178, 179, 182, 183, 184, 185, 188, 189, 190, 191, 208, 210, 209, 211, 212, 214, 213, 215
  ]

private def sse_act216GenArr2 : Array Nat := #[
    0, 1, 2, 3, 4, 5, 6, 7, 9, 8, 11, 10, 12, 13, 14, 15, 17, 16, 19, 18, 21, 20, 23, 22,
    24, 25, 27, 26, 28, 29, 31, 30, 32, 33, 35, 34, 36, 37, 39, 38, 40, 41, 43, 42, 44, 45, 47, 46,
    48, 49, 51, 50, 52, 53, 55, 54, 57, 56, 58, 59, 61, 60, 63, 62, 64, 65, 67, 66, 69, 68, 70, 71,
    73, 72, 75, 74, 76, 77, 79, 78, 84, 85, 86, 87, 80, 81, 82, 83, 92, 93, 94, 95, 88, 89, 90, 91,
    97, 96, 99, 98, 101, 100, 103, 102, 105, 104, 107, 106, 109, 108, 111, 110, 114, 115, 112, 113, 118, 119, 116, 117,
    121, 120, 122, 124, 123, 125, 127, 126, 129, 128, 131, 130, 133, 132, 134, 136, 135, 137, 139, 138, 141, 140, 143, 142,
    145, 144, 146, 148, 147, 149, 151, 150, 153, 152, 155, 154, 157, 156, 158, 160, 159, 161, 163, 162, 165, 164, 167, 166,
    169, 168, 171, 170, 173, 172, 175, 174, 177, 176, 179, 178, 181, 180, 183, 182, 185, 184, 187, 186, 189, 188, 191, 190,
    196, 197, 198, 199, 192, 193, 194, 195, 204, 205, 206, 207, 200, 201, 202, 203, 209, 208, 211, 210, 213, 212, 215, 214
  ]

private def sse_act216GenArr3 : Array Nat := #[
    0, 20, 23, 3, 4, 16, 19, 7, 8, 12, 15, 11, 9, 13, 14, 10, 5, 17, 18, 6, 1, 21, 22, 2,
    24, 30, 26, 28, 27, 29, 25, 31, 60, 112, 82, 98, 106, 90, 116, 72, 119, 79, 111, 95, 87, 103, 67, 115,
    55, 49, 53, 51, 52, 50, 54, 48, 56, 58, 57, 59, 32, 61, 80, 96, 100, 88, 113, 46, 109, 93, 85, 105,
    39, 118, 77, 75, 76, 74, 78, 41, 62, 81, 34, 83, 97, 70, 99, 44, 65, 108, 37, 110, 92, 69, 94, 43,
    63, 84, 35, 86, 64, 101, 102, 45, 104, 71, 36, 107, 89, 68, 91, 42, 33, 66, 114, 47, 38, 117, 73, 40,
    120, 122, 121, 126, 128, 130, 123, 129, 124, 127, 125, 131, 168, 170, 172, 192, 208, 200, 194, 182, 212, 184, 202, 180,
    215, 207, 199, 191, 187, 189, 179, 205, 175, 197, 177, 211, 167, 163, 165, 161, 160, 159, 166, 157, 164, 158, 162, 156,
    132, 171, 133, 169, 134, 173, 193, 152, 210, 154, 201, 150, 143, 206, 139, 198, 141, 213, 190, 148, 188, 149, 186, 147,
    135, 174, 138, 195, 209, 153, 183, 146, 137, 178, 142, 214, 204, 151, 181, 145, 136, 196, 176, 155, 140, 185, 203, 144
  ]

private def sse_act216GenNat (k i : Nat) : Nat :=
  match k with
  | 0 => sse_act216GenArr0.getD i 0
  | 1 => sse_act216GenArr1.getD i 0
  | 2 => sse_act216GenArr2.getD i 0
  | _ => sse_act216GenArr3.getD i 0

private theorem sse_act216GenNat_lt (k : Fin 4) (i : Fin 216) : sse_act216GenNat k.val i.val < 216 := by
  exact (by decide : ∀ (x : Fin 4) (y : Fin 216), sse_act216GenNat x.val y.val < 216) k i

/-- Certified `W(F_4)` generator action on `Fin 216` (kernel-verified against `sseActCliqueGen`). -/
def sseAct216Gen (k : Fin 4) (i : Fin 216) : Fin 216 :=
  ⟨sse_act216GenNat k.val i.val, sse_act216GenNat_lt k i⟩

/-- `W(F_4)` word action on `Fin 216`. -/
def sseAct216 : List (Fin 4) → Fin 216 → Fin 216
  | [], i => i
  | k :: rest, i => sseAct216Gen k (sseAct216 rest i)

private theorem sse_act216Gen_compat :
    ∀ (k : Fin 4) (i : Fin 216), sseClique216 (sseAct216Gen k i) = sseActCliqueGen k (sseClique216 i) := by
  decide

private theorem sse_act216Gen_inv :
    ∀ (k : Fin 4) (i : Fin 216), sseAct216Gen k (sseAct216Gen k i) = i := by
  decide

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

private def sse_canonWord216Arr : Array (List Nat) := #[
    [], [0, 1, 2, 1, 0], [0, 1, 2, 3, 1, 2, 0, 1, 2, 3], [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0], [0], [0, 1, 2, 1],
    [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0], [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1], [0, 1], [0, 1, 2], [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1], [0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2],
    [0, 1, 2, 3], [0, 1, 2, 3, 1, 2, 1], [0, 1, 2, 3, 1, 2, 1, 0], [0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1], [0, 1, 2, 3, 1], [0, 1, 2, 3, 1, 2],
    [0, 1, 2, 3, 1, 2, 0, 1, 0], [0, 1, 2, 3, 1, 2, 0, 1, 2, 0], [0, 1, 2, 3, 1, 0], [0, 1, 2, 3, 1, 2, 0], [0, 1, 2, 3, 1, 2, 0, 1], [0, 1, 2, 3, 1, 2, 0, 1, 2],
    [], [1, 2, 1], [1], [1, 2], [1, 2, 3], [1, 2, 3, 1, 2, 1],
    [1, 2, 3, 1], [1, 2, 3, 1, 2], [1, 2, 1, 0], [1, 2, 0, 1, 2, 0, 1], [1, 2, 0, 1, 0], [1, 2, 0, 1, 2, 0],
    [1, 2, 3, 0, 1, 2, 1, 0], [1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0], [1, 2, 3, 0, 1, 2, 0, 1, 0], [1, 2, 3, 1, 2, 0, 1, 2, 1, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1],
    [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2], [1, 2, 3, 1, 2, 0, 1, 2, 3], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 1], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2],
    [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1, 0],
    [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1, 0], [1, 0], [1, 2, 0], [1, 2, 3, 0], [1, 2, 3, 1, 2, 1, 0],
    [1, 2, 3, 1, 0], [1, 2, 3, 1, 2, 0], [1, 2, 0, 1], [1, 2, 0, 1, 2], [1, 2, 3, 0, 1, 2, 1], [1, 2, 3, 1, 2, 0, 1, 2, 0, 1],
    [1, 2, 3, 0, 1, 2, 0, 1], [1, 2, 3, 1, 2, 0, 1, 2, 1], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0],
    [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2], [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1],
    [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 1], [1, 2, 3, 0, 1], [1, 2, 3, 1, 2, 0, 1, 0], [1, 2, 3, 0, 1, 0], [1, 2, 3, 1, 2, 0, 1],
    [1, 2, 3, 0, 1, 2], [1, 2, 3, 1, 2, 0, 1, 2, 0], [1, 2, 3, 0, 1, 2, 0], [1, 2, 3, 1, 2, 0, 1, 2], [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0],
    [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1], [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0], [1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2],
    [1, 2, 0, 1, 2, 3], [1, 2, 0, 1, 2, 3, 2], [1, 2, 0, 1, 2, 3, 0], [1, 2, 0, 1, 2, 3, 2, 0], [1, 2, 0, 1, 2, 3, 2, 1], [1, 2, 0, 1, 2, 3, 2, 1, 2],
    [1, 2, 0, 1, 2, 3, 0, 1, 2, 1], [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 1], [1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0], [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 1, 0], [1, 2, 0, 1, 2, 3, 2, 1, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0],
    [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0], [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1], [1, 2, 0, 1, 2, 3, 0, 1], [1, 2, 0, 1, 2, 3, 2, 0, 1],
    [1, 2, 0, 1, 2, 3, 0, 1, 2], [1, 2, 0, 1, 2, 3, 2, 0, 1, 2], [1, 2, 0, 1, 2, 3, 2, 0, 1, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1], [1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0], [1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2],
    [], [2], [2, 3], [2, 1], [2, 1, 2], [2, 3, 1, 2, 1],
    [2, 3, 1], [2, 3, 1, 2], [2, 1, 2, 3], [2, 1, 2, 3, 2], [2, 1, 2, 3, 2, 1], [2, 1, 2, 3, 2, 1, 2],
    [2, 1, 0], [2, 1, 2, 0], [2, 3, 1, 2, 1, 0], [2, 1, 2, 0, 1], [2, 1, 2, 0, 1, 2], [2, 3, 1, 2, 0, 1, 2, 0, 1],
    [2, 3, 1, 2, 0, 1, 0], [2, 3, 1, 2, 0, 1, 2, 0], [2, 1, 2, 3, 0, 1, 2, 1, 0], [2, 1, 2, 3, 2, 0, 1, 2, 1, 0], [2, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0],
    [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1],
    [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2], [2, 3, 1, 2, 0, 1, 2, 3], [2, 3, 1, 2, 0, 1, 2, 3, 2], [2, 3, 1, 2, 0, 1, 2, 3, 2, 1], [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2],
    [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 0], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 1, 0], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0, 1],
    [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 0], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2, 0], [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1, 0], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 1, 0], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1, 0], [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 0],
    [2, 3, 1, 0], [2, 3, 1, 2, 0], [2, 1, 2, 3, 0], [2, 1, 2, 3, 2, 0], [2, 1, 2, 3, 2, 1, 0], [2, 1, 2, 3, 2, 1, 2, 0],
    [2, 3, 1, 2, 0, 1], [2, 3, 1, 2, 0, 1, 2], [2, 1, 2, 3, 0, 1, 2, 1], [2, 1, 2, 3, 2, 0, 1, 2, 1], [2, 1, 2, 3, 2, 0, 1, 2, 0, 1], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1],
    [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 0], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0], [2, 3, 1, 2, 0, 1, 2, 3, 0], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0], [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 0], [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0],
    [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 2], [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2, 1], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 1], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0, 1], [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1],
    [2, 1, 2, 3, 0, 1], [2, 1, 2, 3, 2, 0, 1], [2, 1, 2, 3, 2, 0, 1, 0], [2, 1, 2, 3, 2, 1, 2, 0, 1], [2, 1, 2, 3, 0, 1, 2], [2, 1, 2, 3, 2, 0, 1, 2],
    [2, 1, 2, 3, 2, 0, 1, 2, 0], [2, 1, 2, 3, 2, 1, 2, 0, 1, 2], [2, 3, 1, 2, 0, 1, 2, 3, 0, 1], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 0], [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1],
    [2, 3, 1, 2, 0, 1, 2, 3, 0, 1, 2], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2], [2, 3, 1, 2, 0, 1, 2, 3, 2, 0, 1, 2, 0], [2, 3, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2], [2, 1, 2, 0, 1, 2, 3], [2, 1, 2, 0, 1, 2, 3, 2],
    [2, 1, 2, 0, 1, 2, 3, 2, 1], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2], [2, 1, 2, 0, 1, 2, 3, 2, 1, 0], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1], [2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2]
  ]

/-- Explicit `W(F_4)` word mapping clique `i : Fin 216` onto the canonical clique of its size:
    `0` (`[0]`), `24` (`[0, 4]`), or `120` (`[0, 4, 8]`). -/
def sseCanonWord216 (i : Fin 216) : List (Fin 4) :=
  sseNatWordToFin4 (sse_canonWord216Arr.getD i.val [])

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
    (List.finRange 216).all (fun i =>
      decide (sse_act216NatWord (sse_canonWord216Arr.getD i.val []) i.val =
        (sseCanonCliqueOfSize (sseSize216 i)).val)) = true := by
  decide

private theorem sse_canonWord216_exact (i : Fin 216) :
    sseAct216 (sseCanonWord216 i) i = sseCanonCliqueOfSize (sseSize216 i) := by
  apply Fin.ext
  unfold sseCanonWord216
  rw [sse_act216_eq_natWord]
  have hAll : ∀ l : List (Fin 216), l.all (fun j =>
      decide (sse_act216NatWord (sse_canonWord216Arr.getD j.val []) j.val =
        (sseCanonCliqueOfSize (sseSize216 j)).val)) = true →
      i ∈ l → sse_act216NatWord (sse_canonWord216Arr.getD i.val []) i.val =
        (sseCanonCliqueOfSize (sseSize216 i)).val := by
    intro l; induction l with
    | nil => intro _ hm; cases hm
    | cons x xs ih =>
      intro ha hm
      simp only [List.all, Bool.and_eq_true] at ha
      cases hm with
      | head => exact of_decide_eq_true ha.1
      | tail _ htl => exact ih ha.2 htl
  exact hAll (List.finRange 216) sse_canonWord216_fast (List.mem_finRange i)

private theorem sse_cliques216_valid_and_distinct :
    (sseAllCliquesList.length = 216) ∧
    (sseClique216 ⟨0, by decide⟩ = SseClique.c1 ⟨0, by decide⟩) ∧
    (sseClique216 ⟨24, by decide⟩ = SseClique.c2 ⟨0, by decide⟩ ⟨4, by decide⟩) ∧
    (sseClique216 ⟨120, by decide⟩ = SseClique.c3 ⟨0, by decide⟩ ⟨4, by decide⟩ ⟨8, by decide⟩) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 1 then 1 else 0) = 24) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 2 then 1 else 0) = 96) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 3 then 1 else 0) = 96) := by
  decide

/-- Headline Theorem 1 (`W(F_4)` Automorphisms & Exhaustive `216`-Clique Transitivity):
    1. Every `W(F_4)` word `w : List (Fin 4)` is a bijection on `Fin 24` preserving `dot4` and `adj24`.
    2. `sseClique216` enumerates all `24 + 96 + 96 = 216` non-empty cliques of `Γ_24`, `sseAct216` is a
       compatible `W(F_4)` bijection on `Fin 216`, and EVERY `i : Fin 216` maps under `sseCanonWord216 i`
       onto the canonical representative `[0]`, `[0, 4]`, or `[0, 4, 8]` of its clique size! -/
theorem thm_sse_wf4_automorphisms_and_216_cliques :
    (∀ (w : List (Fin 4)) (a b : Fin 24),
      sseApplyWord w.reverse (sseApplyWord w a) = a ∧
      dot4 (d4RootOf (sseApplyWord w a)) (d4RootOf (sseApplyWord w b)) = dot4 (d4RootOf a) (d4RootOf b) ∧
      adj24 (sseApplyWord w a) (sseApplyWord w b) = adj24 a b) ∧
    (sseAllCliquesList.length = 216 ∧
     sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 1 then 1 else 0) = 24 ∧
     sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 2 then 1 else 0) = 96 ∧
     sseSumFinNat (fun i : Fin 216 => if sseSize216 i = 3 then 1 else 0) = 96) ∧
    (∀ (k : Fin 4) (i : Fin 216),
      sseClique216 (sseAct216Gen k i) = sseActCliqueGen k (sseClique216 i) ∧
      sseAct216Gen k (sseAct216Gen k i) = i) ∧
    (∀ (i : Fin 216), sseAct216 (sseCanonWord216 i) i = sseCanonCliqueOfSize (sseSize216 i)) := by
  exact ⟨fun w a b => ⟨sse_applyWord_inv w a, sse_applyWord_preserves_dot4 w a b, sse_applyWord_preserves_adj24 w a b⟩,
    ⟨sse_cliques216_valid_and_distinct.1, sse_cliques216_valid_and_distinct.2.2.2.2.1,
     sse_cliques216_valid_and_distinct.2.2.2.2.2.1, sse_cliques216_valid_and_distinct.2.2.2.2.2.2⟩,
    fun k i => ⟨sse_act216Gen_compat k i, sse_act216Gen_inv k i⟩,
    sse_canonWord216_exact⟩


/-! ## Section 2: Exact `19`-State Depth-2 Cartier-Foata Automaton & Shell Growth -/

/-- Exact Depth-2 Cartier-Foata suffix state `St_2(w) = (D(w), {a ↦ D(w s_a) : a ∈ D(w)})`
    stored in sorted `Nat` vertex representation (each entry `< 24`, mirroring `Fin 24`). -/
abbrev SseD2StateNat := List Nat × List (Nat × List Nat)

private def sse_insertNatSorted (x : Nat) : List Nat → List Nat
  | [] => [x]
  | y :: ys => if x < y then x :: y :: ys else if x == y then y :: ys else y :: sse_insertNatSorted x ys

private def sse_sortNatList : List Nat → List Nat
  | [] => []
  | x :: xs => sse_insertNatSorted x (sse_sortNatList xs)

private def sse_insertPairSorted (p : Nat × List Nat) : List (Nat × List Nat) → List (Nat × List Nat)
  | [] => [p]
  | q :: qs => if p.1 < q.1 then p :: q :: qs else q :: sse_insertPairSorted p qs

private def sse_sortPairList : List (Nat × List Nat) → List (Nat × List Nat)
  | [] => []
  | p :: ps => sse_insertPairSorted p (sse_sortPairList ps)

private def sse_memNat (x : Nat) : List Nat → Bool
  | [] => false
  | y :: ys => (x == y) || sse_memNat x ys

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
private def sse_d2TransList : Nat → List (Nat × Nat × List Nat)
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

private def sse_d2Lookup (u b : Nat) : Option (Nat × List Nat) :=
  match (sse_d2TransList u).find? (fun e => e.1 == b) with
  | some e => some (e.2.1, e.2.2)
  | none => none

private theorem sse_d2Lookup_bound :
    (List.finRange 19).all (fun u =>
      (List.finRange 24).all (fun b =>
        match sse_d2Lookup u.val b.val with
        | none => true
        | some e => decide (e.1 < 19) && e.2.all (fun g => decide (g < 4)))) = true := by
  decide

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

private def sse_d2WordNat (u : Fin 19) (b : Fin 24) : List Nat :=
  match sse_d2Lookup u.val b.val with
  | none => []
  | some e => e.2

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
    !(sse_memNat p.1 p.2) &&
    st.1.all (fun x => decide (x = p.1) || (sse_memNat x p.2 && sse_adjFast p.1 x)))

private theorem sse_d2_reps_valid_and_distinct :
    (∀ u : Fin 19, sseIsValidD2State (sseD2Rep u) = true) ∧
    (∀ u v : Fin 19, sseD2Rep u = sseD2Rep v → u = v) := by
  decide

private theorem sse_d2_step_closure_exact :
    (∀ (u : Fin 19) (b : Fin 24),
      (sse_memNat b.val (sseD2Rep u).1 = true ↔ sseD2Next u b = none) ∧
      (∀ v : Fin 19, sseD2Next u b = some v →
        ssePermD2 (sse_d2WordNat u b) (sseStepD2 (sseD2Rep u) b.val) = sseD2Rep v)) := by
  decide

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
                rw [sse_ite_neg hv]
                exact (by rw [sse_sumFinNat_congr _ _ (fun _ => sse_ite_neg hv _ _), sse_sumFinNat_zero]).symm
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
          match k with
          | ⟨0, _⟩ => omega
          | ⟨1, _⟩ =>
            change ssStratumCount ⟨0, by decide⟩ m * 24 + ssStratumCount ⟨1, by decide⟩ m * 15 +
                   ssStratumCount ⟨2, by decide⟩ m * 11 + ssStratumCount ⟨3, by decide⟩ m * 9 =
                   1 * ssStratumCount ⟨1, by decide⟩ (m + 1)
            omega
          | ⟨2, _⟩ =>
            change ssStratumCount ⟨0, by decide⟩ m * 0 + ssStratumCount ⟨1, by decide⟩ m * 8 +
                   ssStratumCount ⟨2, by decide⟩ m * 8 + ssStratumCount ⟨3, by decide⟩ m * 6 =
                   2 * ssStratumCount ⟨2, by decide⟩ (m + 1)
            omega
          | ⟨3, _⟩ =>
            change ssStratumCount ⟨0, by decide⟩ m * 0 + ssStratumCount ⟨1, by decide⟩ m * 0 +
                   ssStratumCount ⟨2, by decide⟩ m * 3 + ssStratumCount ⟨3, by decide⟩ m * 6 =
                   3 * ssStratumCount ⟨3, by decide⟩ (m + 1)
            omega
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
  change ((0 + ssStratumCount ⟨0, by decide⟩ r) + ssStratumCount ⟨1, by decide⟩ r) +
         ssStratumCount ⟨2, by decide⟩ r + ssStratumCount ⟨3, by decide⟩ r = ballShell r
  omega

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
      (sse_memNat b.val (sseD2Rep u).1 = true ↔ sseD2Next u b = none) ∧
      (∀ v : Fin 19, sseD2Next u b = some v →
        ssePermD2 (sse_d2WordNat u b) (sseStepD2 (sseD2Rep u) b.val) = sseD2Rep v)) ∧
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
        sseSumFinNat (fun u : Fin 19 => N r u) = ballShell r) :=
  ⟨sse_d2_reps_valid_and_distinct.1, sse_d2_reps_valid_and_distinct.2, sse_d2_step_closure_exact,
   sse_d2_lumpability_exact.1, sse_d2_lumpability_exact.2,
   ⟨sse_d2_shell_r0_to_r6.2.1.1, sse_d2_shell_r0_to_r6.2.2.1.1, sse_d2_shell_r0_to_r6.2.2.2.1.1,
    sse_d2_shell_r0_to_r6.2.2.2.2.1.1, sse_d2_shell_r0_to_r6.2.2.2.2.2.1.1,
    sse_d2_shell_r0_to_r6.2.2.2.2.2.2.1.1, sse_d2_shell_r0_to_r6.2.2.2.2.2.2.2.1⟩,
   sse_d2_all_depth_lumpable⟩


/-! ## Section 3: Exact `23`-Flag Upward-End Orbits, Unconditional `Aut`-Invariance & Reciprocity -/

private def sse_d2DownFlagList : Nat → List (Nat × Nat)
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
def sseD2FlagOwner : Fin 23 → Fin 19
  | ⟨e, _⟩ =>
    let o : Nat := match e with
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

private theorem sse_d2_flag_invariants :
    (∀ (v : Fin 19) (a : Fin 24),
      (sse_memNat a.val (sseD2Rep v).1 = true ↔ (sseD2DownFlag v a).isSome = true)) ∧
    (∀ (v : Fin 19) (a : Fin 24) (e : Fin 23),
      sseD2DownFlag v a = some e → sseD2FlagOwner e = v) ∧
    (∀ e : Fin 23, 0 < sseD2DownMult (sseD2FlagOwner e) e) ∧
    (∀ (v : Fin 19) (a b : Fin 24),
      sse_memNat a.val (sseD2Rep v).1 = true → sse_memNat b.val (sseD2Rep v).1 = true →
      sseD2DownCliqueLen v a = sseD2DownCliqueLen v b → sseD2DownFlag v a = sseD2DownFlag v b) ∧
    (∀ (u : Fin 19) (b : Fin 24) (v : Fin 19),
      sseD2Next u b = some v →
      ∃ e : Fin 23,
        sseD2UpFlag u b = some e ∧
        sseD2DownFlag v (sseApplyWord (sseD2Word u b) b) = some e ∧
        sseD2FlagOwner e = v) ∧
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
      (∀ a : Fin 24, sse_memNat a.val (sseD2Rep v).1 = true →
        sse_memNat (π a).val (sseD2Rep v).1 = true ∧ sseD2DownCliqueLen v (π a) = sseD2DownCliqueLen v a) →
      ∀ a : Fin 24, sse_memNat a.val (sseD2Rep v).1 = true → sseD2DownFlag v (π a) = sseD2DownFlag v a) ∧
    (∀ (u : Fin 19) (b : Fin 24) (v : Fin 19),
      sseD2Next u b = some v →
      ∃ e : Fin 23,
        sseD2UpFlag u b = some e ∧
        sseD2DownFlag v (sseApplyWord (sseD2Word u b) b) = some e ∧
        sseD2FlagOwner e = v) ∧
    (∀ u : Fin 19,
      sseSumFinNat (fun e : Fin 23 => sseD2DownMult u e) +
      sseSumFinNat (fun e : Fin 23 => sseD2UpMult u e) = 24) := by
  refine ⟨sse_d2_flag_invariants.2.1, sse_d2_flag_invariants.2.2.1, ?_,
          sse_d2_flag_invariants.2.2.2.2.1, sse_d2_flag_invariants.2.2.2.2.2⟩
  intro v π hπ a ha
  have h1 := hπ a ha
  exact (sse_d2_flag_invariants.2.2.2.1 v a (π a) ha h1.1 h1.2.symm).symm


/-! ## Section 4: Depth-2 Nagnibeda Schur Upper Bound (`ρ ≤ 387141227/33670000 < 11.5`) & Subgraph Bridge -/

/-- W7's exact `Q = 10,000` `23`-integer Depth-2 Nagnibeda certificate `p[0..22]` (`f_e = p_e / 10000`). -/
def sseD2CertP : Fin 23 → Int
  | ⟨0, _⟩  => 1606 | ⟨1, _⟩  => 1823 | ⟨2, _⟩  => 1606 | ⟨3, _⟩  => 3367 | ⟨4, _⟩  => 1651
  | ⟨5, _⟩  => 5226 | ⟨6, _⟩  => 2766 | ⟨7, _⟩  => 1863 | ⟨8, _⟩  => 1651 | ⟨9, _⟩  => 4791
  | ⟨10, _⟩ => 1700 | ⟨11, _⟩ => 2516 | ⟨12, _⟩ => 5090 | ⟨13, _⟩ => 6302 | ⟨14, _⟩ => 3847
  | ⟨15, _⟩ => 6405 | ⟨16, _⟩ => 3451 | ⟨17, _⟩ => 1905 | ⟨18, _⟩ => 1700 | ⟨19, _⟩ => 2521
  | ⟨20, _⟩ => 4402 | ⟨21, _⟩ => 7413 | ⟨22, _⟩ => 5241

private theorem sse_d2CertP_pos : ∀ e : Fin 23, 0 < sseD2CertP e := by decide

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
    unfold QPos.le QPos.divPos at h ⊢
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
            rw [h0]; exact sse_ssSumFinAux_zero 23 (Nat.le_refl 23)
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
            rw [h0]; exact sse_ssSumFinAux_zero 23 (Nat.le_refl 23)
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
        rw [hZ1, hZ2, sse_ssSumFinAux_zero 23 (Nat.le_refl 23)]; omega
    have hEq : ssRowSumInt A (sseD2WeightInt depth eFlag) i =
        ssSumFin (fun e : Fin 23 => sseD2DownDegOf A depth eFlag i e * sseD2WeightDn e) +
        ssSumFin (fun e : Fin 23 => sseD2UpDegOf A depth eFlag i e * sseD2WeightUp e) := by
      unfold ssRowSumInt
      rw [funext hPt, sse_ssSumFin_add, sse_ssSumFin_swap, sse_ssSumFin_swap]
      have h1 : (fun e : Fin 23 => ssSumFin (fun j : Fin n =>
          (if A i j = true then (if depth i = depth j + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightDn e)) =
        (fun e : Fin 23 => sseD2DownDegOf A depth eFlag i e * sseD2WeightDn e) :=
        funext (fun e => sse_ssSumFin_mul_right _ _)
      have h2 : (fun e : Fin 23 => ssSumFin (fun j : Fin n =>
          (if A i j = true then (if depth j = depth i + 1 then (if eFlag i j = e then 1 else 0) else 0) else 0) * sseD2WeightUp e)) =
        (fun e : Fin 23 => sseD2UpDegOf A depth eFlag i e * sseD2WeightUp e) :=
        funext (fun e => sse_ssSumFin_mul_right _ _)
      rw [h1, h2]
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
    simp only [sseActCliqueGen, sseSort2Fin, sseInForbClique]
    split <;> simp only [sse_wf4Gen_preserves_adj24]
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
    have hPerm : ∀ p q r : Fin 24,
        (sseSort3Fin (sseWF4Gen k a) (sseWF4Gen k b) (sseWF4Gen k c) = (p, q, r)) →
        (∀ y, (y = p ∨ y = q ∨ y = r) ↔ (y = sseWF4Gen k a ∨ y = sseWF4Gen k b ∨ y = sseWF4Gen k c)) ∧
        (adj24 p (sseWF4Gen k x) && adj24 q (sseWF4Gen k x) && adj24 r (sseWF4Gen k x) =
         adj24 (sseWF4Gen k a) (sseWF4Gen k x) && adj24 (sseWF4Gen k b) (sseWF4Gen k x) && adj24 (sseWF4Gen k c) (sseWF4Gen k x)) := by
      intro p q r hp
      unfold sseSort3Fin sseSort2Fin at hp
      split at hp <;> split at hp <;> split at hp <;>
        cases hp <;>
        exact ⟨fun y => by tauto, by cases adj24 (sseWF4Gen k a) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k b) (sseWF4Gen k x) <;> cases adj24 (sseWF4Gen k c) (sseWF4Gen k x) <;> rfl⟩
    simp only [sseActCliqueGen]
    generalize ht : sseSort3Fin (sseWF4Gen k a) (sseWF4Gen k b) (sseWF4Gen k c) = t
    cases t with | mk p qr =>
    cases qr with | mk q r =>
    obtain ⟨hOr, hAnd⟩ := hPerm p q r ht
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

private theorem sse_canFollow216_wf4Gen (k : Fin 4) (i j : Fin 216) :
    sseCanFollow216 (sseAct216Gen k i) (sseAct216Gen k j) = sseCanFollow216 i j := by
  unfold sseCanFollow216
  rw [sse_act216Gen_compat, sse_act216Gen_compat]
  generalize sseClique216 i = c1
  cases hc2 : sseClique216 j with
  | c1 x => simp only [sseActCliqueGen, sseCanFollowClique, sse_inForb_wf4Gen]
  | c2 x y =>
    simp only [sseActCliqueGen, sseSort2Fin, sseCanFollowClique]
    split <;> simp only [sse_inForb_wf4Gen, Bool.and_comm]
  | c3 x y z =>
    simp only [sseActCliqueGen]
    have hP : ∀ p q r : Fin 24,
        sseSort3Fin (sseWF4Gen k x) (sseWF4Gen k y) (sseWF4Gen k z) = (p, q, r) →
        sseCanFollowClique (sseActCliqueGen k c1) (SseClique.c3 p q r) =
          sseCanFollowClique c1 (SseClique.c3 x y z) := by
      intro p q r hp
      unfold sseSort3Fin sseSort2Fin at hp
      split at hp <;> split at hp <;> split at hp <;> cases hp <;>
        (simp only [sseCanFollowClique, sse_inForb_wf4Gen];
         cases sseInForbClique c1 x <;> cases sseInForbClique c1 y <;> cases sseInForbClique c1 z <;> rfl)
    generalize ht : sseSort3Fin (sseWF4Gen k x) (sseWF4Gen k y) (sseWF4Gen k z) = t
    cases t with | mk p qr => cases qr with | mk q r => exact hP p q r ht

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

private theorem sse_isQ3_fast_check :
    ((List.finRange 24).filter isWallFacet).length = 8 ∧
    ((List.finRange 24).filter isWallFacet).all (fun a =>
      decide (((List.finRange 24).filter (fun b => isWallFacet b && adj24 a b)).length = 3)) = true ∧
    wallCliques2.length = 12 ∧
    (sseSumFinNat (fun i : Fin 216 => if sseIsQ3 i = true then 1 else 0) = 20) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseIsQ3 i = true && decide (sseSize216 i = 1) then 1 else 0) = 8) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseIsQ3 i = true && decide (sseSize216 i = 2) then 1 else 0) = 12) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseIsQ3 i = true && decide (sseSize216 i = 3) then 1 else 0) = 0) ∧
    (∀ j : Fin 216, sseIsQ3 j = true →
      sseApplyWord (sseStab0Q3Word j) ⟨0, by decide⟩ = ⟨0, by decide⟩ ∧
      sseAct216 (sseStab0Q3Word j) j = sseCanonQ3OfSize (sseSize216 j)) ∧
    (∀ j : Fin 216, sseIsQ3 j = true →
      match sseClique216 j with
      | SseClique.c1 a => sseClique216 (sseAdd0 j) = SseClique.c2 ⟨0, by decide⟩ a
      | SseClique.c2 a b => sseClique216 (sseAdd0 j) = SseClique.c3 ⟨0, by decide⟩ a b
      | SseClique.c3 _ _ _ => False) ∧
    (∀ c : Fin 216, sse_canFollowFast c sseIdx0 = true → sseIsQ3 c = false) := by
  decide

private def sse_q3List : List (Fin 216) := (List.finRange 216).filter sseIsQ3

private theorem sse_q3_212_pairs_and_zero_cascade :
    sse_q3List.length = 20 ∧
    (sse_q3List.foldl (fun acc j1 => acc + (sse_q3List.filter (fun j2 => sse_canFollowFast j1 j2)).length) 0 = 212) ∧
    (sse_q3List.all (fun j1 => sse_q3List.all (fun j2 =>
      !(sse_canFollowFast j1 j2) || sse_canFollowFast (sseAdd0 j1) j2)) = true) ∧
    ((List.finRange 216).all (fun c =>
      !(sse_canFollowFast c sseIdx0) ||
        sse_q3List.all (fun j => !(sse_canFollowFast c j) || sse_canFollowFast c (sseAdd0 j))) = true) := by
  decide

private theorem sse_mem_q3List_iff (j : Fin 216) : j ∈ sse_q3List ↔ sseIsQ3 j = true := by
  unfold sse_q3List
  simp only [List.mem_filter, List.mem_finRange, true_and]

private theorem sse_list_all_mem {α : Type} (l : List α) (p : α → Bool)
    (h : l.all p = true) {x : α} (hx : x ∈ l) : p x = true := by
  induction l with
  | nil => cases hx
  | cons y ys ih =>
    simp only [List.all, Bool.and_eq_true] at h
    cases hx with | head => exact h.1 | tail _ htl => exact ih h.2 htl

private theorem sse_canFollow_c_add0 (c j : Fin 216)
    (h0 : sseCanFollow216 c sseIdx0 = true) (hQ : sseIsQ3 j = true) (hJ : sseCanFollow216 c j = true) :
    sseCanFollow216 c (sseAdd0 j) = true := by
  rw [sse_canFollow216_eq_fast] at h0 hJ ⊢
  have h1 := sse_list_all_mem (List.finRange 216) _ sse_q3_212_pairs_and_zero_cascade.2.2.2 (List.mem_finRange c)
  rw [h0] at h1; simp only [Bool.not_true, Bool.false_or] at h1
  have h2 := sse_list_all_mem sse_q3List _ h1 ((sse_mem_q3List_iff j).2 hQ)
  rw [hJ] at h2; simp only [Bool.not_true, Bool.false_or] at h2
  exact h2

private theorem sse_zero_cascade (j1 j2 : Fin 216)
    (h1 : sseIsQ3 j1 = true) (h2 : sseIsQ3 j2 = true) (hF : sseCanFollow216 j1 j2 = true) :
    sseCanFollow216 (sseAdd0 j1) j2 = true := by
  rw [sse_canFollow216_eq_fast] at hF ⊢
  have ha := sse_list_all_mem sse_q3List _ sse_q3_212_pairs_and_zero_cascade.2.2.1 ((sse_mem_q3List_iff j1).2 h1)
  have hb := sse_list_all_mem sse_q3List _ ha ((sse_mem_q3List_iff j2).2 h2)
  rw [hF] at hb; simp only [Bool.not_true, Bool.false_or] at hb
  exact hb

/-- Symbolic `Stab_{W(F_4)}(0)` invariance of `sseIsQ3` and `sseAdd0`:
    any `W(F_4)` word `w` fixing `0` preserves `Q_3 = Adj(0)`, commutes with `sseAdd0`,
    and fixes `sseIdx0`. -/
private theorem sse_stab0_preserves_q3_and_add0 (w : List (Fin 4))
    (hFix0 : sseApplyWord w ⟨0, by decide⟩ = ⟨0, by decide⟩) :
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
    | nil => intro i x; cases sseClique216 i <;> rfl
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
          unfold sseActCliqueGen sseSort2Fin; split <;> (simp only [hEqG]; tauto)
        | c3 a b c =>
          unfold sseActCliqueGen sseSort3Fin sseSort2Fin
          split <;> split <;> split <;> (simp only [hEqG]; tauto)
      rw [hGen, ih i (sseWF4Gen k x)]
      have hEqG : ∀ p q : Fin 24, (sseWF4Gen k p = q) ↔ (p = sseWF4Gen k q) := fun p q =>
        ⟨fun h => by rw [← h, sse_wf4Gen_inv], fun h => by rw [h, sse_wf4Gen_inv]⟩
      cases sseClique216 i <;> simp only [sseApplyWord, hEqG]
  have hInj216 : ∀ i j : Fin 216,
      (∀ x : Fin 24,
        (match sseClique216 i with | SseClique.c1 a => x = a | SseClique.c2 a b => x = a ∨ x = b | SseClique.c3 a b c => x = a ∨ x = b ∨ x = c) ↔
        (match sseClique216 j with | SseClique.c1 a => x = a | SseClique.c2 a b => x = a ∨ x = b | SseClique.c3 a b c => x = a ∨ x = b ∨ x = c)) →
      i = j := by
    intro i j hMem
    have hEqC : sseClique216 i = sseClique216 j := by
      have hSorted : ∀ k : Fin 216,
          match sseClique216 k with
          | SseClique.c1 _ => True
          | SseClique.c2 a b => a.val < b.val
          | SseClique.c3 a b c => a.val < b.val ∧ b.val < c.val := by
        decide
      have hi := hSorted i; have hj := hSorted j
      cases hci : sseClique216 i <;> cases hcj : sseClique216 j <;> rw [hci] at hi hMem <;> rw [hcj] at hj hMem
      · exact congrArg SseClique.c1 ((hMem _).1 rfl)
      · rename_i a b c; have h1 := (hMem b).2 (Or.inl rfl); have h2 := (hMem c).2 (Or.inr rfl); subst h1; subst h2; omega
      · rename_i a b c d; have h1 := (hMem b).2 (Or.inl rfl); have h2 := (hMem c).2 (Or.inr (Or.inl rfl)); subst h1; subst h2; omega
      · rename_i a b c; have h1 := (hMem a).1 (Or.inl rfl); have h2 := (hMem b).1 (Or.inr rfl); subst h1; subst h2; omega
      · rename_i a b c d
        have ha := (hMem a).1 (Or.inl rfl); have hb := (hMem b).1 (Or.inr rfl)
        have hc := (hMem c).2 (Or.inl rfl); have hd := (hMem d).2 (Or.inr rfl)
        have e1 : a = c := by rcases ha with rfl | rfl <;> rcases hb with rfl | rfl <;> (try rfl) <;> omega
        have e2 : b = d := by subst e1; rcases hb with rfl | rfl <;> (try rfl) <;> omega
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
    exact (by decide : ∀ p q : Fin 216, sseClique216 p = sseClique216 q → p = q) i j hEqC
  have hFixIdx0 : sseAct216 w sseIdx0 = sseIdx0 := by
    apply hInj216; intro x
    rw [hCliqueWord w sseIdx0 x]
    have h0 : sseClique216 sseIdx0 = SseClique.c1 ⟨0, by decide⟩ := rfl
    rw [h0, hFix0]
  have hQ3 : ∀ j : Fin 216, sseIsQ3 (sseAct216 w j) = sseIsQ3 j := by
    intro j
    have hWall : ∀ x : Fin 24, isWallFacet (sseApplyWord w x) = isWallFacet x := by
      intro x; unfold isWallFacet; rw [← hFix0, sse_applyWord_preserves_adj24]
    have hAllWall : ∀ k : Fin 216, sseIsQ3 k = true ↔
        ∀ x : Fin 24,
          (match sseClique216 k with | SseClique.c1 a => x = a | SseClique.c2 a b => x = a ∨ x = b | SseClique.c3 a b c => x = a ∨ x = b ∨ x = c) →
          isWallFacet x = true := by
      intro k; unfold sseIsQ3
      cases sseClique216 k with
      | c1 a => constructor <;> intro h <;> [· intro x hx; rw [hx]; exact h; · exact h a rfl]
      | c2 a b =>
        simp only [Bool.and_eq_true]
        constructor
        · intro ⟨ha, hb⟩ x hx; rcases hx with rfl | rfl <;> assumption
        · intro h; exact ⟨h a (Or.inl rfl), h b (Or.inr rfl)⟩
      | c3 a b c =>
        simp only [Bool.and_eq_true]
        constructor
        · intro ⟨⟨ha, hb⟩, hc⟩ x hx; rcases hx with rfl | rfl | rfl <;> assumption
        · intro h; exact ⟨⟨h a (Or.inl rfl), h b (Or.inr (Or.inl rfl))⟩, h c (Or.inr (Or.inr rfl))⟩
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
  have hAdd1 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 j hQj
  have hAdd2 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 (sseAct216 w j) hQaj
  have hMemW := hCliqueWord w j x
  cases hcj : sseClique216 j <;> rw [hcj] at hAdd1 hMemW
  · rw [hAdd1, hFix0]
    cases hcw : sseClique216 (sseAct216 w j) <;> rw [hcw] at hAdd2 hMemW
    · rw [hAdd2]; exact ⟨fun h => h.elim Or.inl (fun h2 => Or.inr (hMemW.2 h2)),
                          fun h => h.elim Or.inl (fun h2 => Or.inr (hMemW.1 h2))⟩
    · exfalso; have hs := sse_act216_size w j; unfold sseSize216 at hs; rw [hcj, hcw] at hs; exact absurd hs (by decide)
    · exfalso; have hs := sse_act216_size w j; unfold sseSize216 at hs; rw [hcj, hcw] at hs; exact absurd hs (by decide)
  · rw [hAdd1, hFix0]
    cases hcw : sseClique216 (sseAct216 w j) <;> rw [hcw] at hAdd2 hMemW
    · exfalso; have hs := sse_act216_size w j; unfold sseSize216 at hs; rw [hcj, hcw] at hs; exact absurd hs (by decide)
    · rw [hAdd2]; exact ⟨fun h => h.elim Or.inl (fun h2 => Or.inr (hMemW.2 h2)),
                          fun h => h.elim Or.inl (fun h2 => Or.inr (hMemW.1 h2))⟩
    · exfalso; have hs := sse_act216_size w j; unfold sseSize216 at hs; rw [hcj, hcw] at hs; exact absurd hs (by decide)
  · exact False.elim hAdd1

/-- Headline Theorem 6 (Exact `Q_3 = Adj(0)` 3-Cube Link Algebra & Zero-Cascade Upward Insertion):
    1. `Q_3 = Adj(0)` is an `8`-vertex, `3`-regular, `12`-edge, triangle-free 3-cube with exactly
       `20` non-empty cliques (`8` 1-cliques + `12` 2-cliques) and `212` valid Cartier-Foata pairs;
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
    (sseSumFinNat (fun i : Fin 216 => if sseIsQ3 i = true && decide (sseSize216 i = 1) then 1 else 0) = 8) ∧
    (sseSumFinNat (fun i : Fin 216 => if sseIsQ3 i = true && decide (sseSize216 i = 2) then 1 else 0) = 12) ∧
    (sse_q3List.foldl (fun acc j1 => acc + (sse_q3List.filter (fun j2 => sseCanFollow216 j1 j2)).length) 0 = 212) ∧
    (∀ j : Fin 216, sseIsQ3 j = true →
      sseApplyWord (sseStab0Q3Word j) ⟨0, by decide⟩ = ⟨0, by decide⟩ ∧
      sseAct216 (sseStab0Q3Word j) j = sseCanonQ3OfSize (sseSize216 j)) ∧
    (∀ c : Fin 216, sseCanFollow216 c sseIdx0 = true → sseIsQ3 c = false) ∧
    (∀ c j : Fin 216, sseCanFollow216 c sseIdx0 = true → sseIsQ3 j = true →
      sseCanFollow216 c j = true → sseCanFollow216 c (sseAdd0 j) = true) ∧
    (∀ j1 j2 : Fin 216, sseIsQ3 j1 = true → sseIsQ3 j2 = true →
      sseCanFollow216 j1 j2 = true → sseCanFollow216 (sseAdd0 j1) j2 = true) := by
  have hFun : (fun j1 j2 => sseCanFollow216 j1 j2) = sse_canFollowFast :=
    funext (fun j1 => funext (fun j2 => sse_canFollow216_eq_fast j1 j2))
  refine ⟨sse_isQ3_fast_check.1, sse_isQ3_fast_check.2.1, sse_isQ3_fast_check.2.2.1,
    sse_isQ3_fast_check.2.2.2.1, sse_isQ3_fast_check.2.2.2.2.1, sse_isQ3_fast_check.2.2.2.2.2.1,
    ?_, sse_isQ3_fast_check.2.2.2.2.2.2.2.1, ?_, sse_canFollow_c_add0, sse_zero_cascade⟩
  · have hEq := sse_q3_212_pairs_and_zero_cascade.2.1
    rw [← hFun] at hEq; exact hEq
  · intro c hc; rw [sse_canFollow216_eq_fast] at hc; exact sse_isQ3_fast_check.2.2.2.2.2.2.2.2.2 c hc


/-! ## Section 6: Exact `57` Pair-Orbit Algebra & All-Depth Symbolic Cartier-Foata Word-Sum Reduction -/

private def sse_sort2Nat (a b : Nat) : Nat × Nat := if a ≤ b then (a, b) else (b, a)

private def sse_sort3Nat (a b c : Nat) : Nat × Nat × Nat :=
  let (x1, y1) := sse_sort2Nat a b
  let (y2, z2) := sse_sort2Nat y1 c
  let (x3, y3) := sse_sort2Nat x1 y2
  (x3, y3, z2)

private theorem sse_sort2Nat_comm (a b : Nat) : sse_sort2Nat a b = sse_sort2Nat b a := by
  unfold sse_sort2Nat; split <;> split <;> (try rfl) <;> (have : a = b := by omega; subst this; rfl)

private theorem sse_sort3Nat_swap12 (a b c : Nat) : sse_sort3Nat a b c = sse_sort3Nat b a c := by
  unfold sse_sort3Nat; rw [sse_sort2Nat_comm a b]

private theorem sse_sort3Nat_swap23 (a b c : Nat) : sse_sort3Nat a b c = sse_sort3Nat a c b := by
  unfold sse_sort3Nat sse_sort2Nat
  split <;> split <;> split <;> split <;> split <;> split <;>
    (try rfl) <;>
    (try (apply Prod.ext; omega; apply Prod.ext; omega; omega))

private theorem sse_sort3Nat_perm (a b c x y z : Nat)
    (h : (x = a ∧ y = b ∧ z = c) ∨ (x = a ∧ y = c ∧ z = b) ∨ (x = b ∧ y = a ∧ z = c) ∨
         (x = b ∧ y = c ∧ z = a) ∨ (x = c ∧ y = a ∧ z = b) ∨ (x = c ∧ y = b ∧ z = a)) :
    sse_sort3Nat x y z = sse_sort3Nat a b c := by
  rcases h with ⟨rfl, rfl, rfl⟩ | ⟨rfl, rfl, rfl⟩ | ⟨rfl, rfl, rfl⟩ | ⟨rfl, rfl, rfl⟩ | ⟨rfl, rfl, rfl⟩ | ⟨rfl, rfl, rfl⟩
  · rfl
  · exact sse_sort3Nat_swap23 a c b
  · exact sse_sort3Nat_swap12 b a c
  · rw [sse_sort3Nat_swap23 b c a, sse_sort3Nat_swap12 b a c]
  · rw [sse_sort3Nat_swap12 c a b, sse_sort3Nat_swap23 a c b]
  · rw [sse_sort3Nat_swap12 c b a, sse_sort3Nat_swap23 b c a, sse_sort3Nat_swap12 b a c]

/-- Exact `W(F_4)`-invariant sorted `dot4` matrix signature of an ordered clique pair `(C_1, C_2)`
    packed as a single `Nat` (zero collisions across all `57` pair orbits!). -/
def ssePairDotCode (c1 c2 : SseClique) : Nat :=
  let rowCode (a : Fin 24) : Nat :=
    match c2 with
    | SseClique.c1 b => sse_dotPlus2Fast a.val b.val
    | SseClique.c2 b1 b2 =>
      let p := sse_sort2Nat (sse_dotPlus2Fast a.val b1.val) (sse_dotPlus2Fast a.val b2.val)
      p.1 + 5 * p.2
    | SseClique.c3 b1 b2 b3 =>
      let t := sse_sort3Nat (sse_dotPlus2Fast a.val b1.val) (sse_dotPlus2Fast a.val b2.val) (sse_dotPlus2Fast a.val b3.val)
      t.1 + 5 * (t.2.1 + 5 * t.2.2)
  let s1 := sseCliqueSize c1
  let s2 := sseCliqueSize c2
  let rPack : Nat :=
    match c1 with
    | SseClique.c1 a => rowCode a
    | SseClique.c2 a1 a2 =>
      let p := sse_sort2Nat (rowCode a1) (rowCode a2)
      p.1 + 125 * p.2
    | SseClique.c3 a1 a2 a3 =>
      let t := sse_sort3Nat (rowCode a1) (rowCode a2) (rowCode a3)
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

private theorem sse_codeToOrbitNat_lt (code : Nat) : sseCodeToOrbitNat code < 57 := by
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
  have hRow : ∀ a : Fin 24,
      (match sseActCliqueGen k c2 with
       | SseClique.c1 b => sse_dotPlus2Fast (sseWF4Gen k a).val b.val
       | SseClique.c2 b1 b2 =>
         let p := sse_sort2Nat (sse_dotPlus2Fast (sseWF4Gen k a).val b1.val) (sse_dotPlus2Fast (sseWF4Gen k a).val b2.val)
         p.1 + 5 * p.2
       | SseClique.c3 b1 b2 b3 =>
         let t := sse_sort3Nat (sse_dotPlus2Fast (sseWF4Gen k a).val b1.val) (sse_dotPlus2Fast (sseWF4Gen k a).val b2.val) (sse_dotPlus2Fast (sseWF4Gen k a).val b3.val)
         t.1 + 5 * (t.2.1 + 5 * t.2.2)) =
      (match c2 with
       | SseClique.c1 b => sse_dotPlus2Fast a.val b.val
       | SseClique.c2 b1 b2 =>
         let p := sse_sort2Nat (sse_dotPlus2Fast a.val b1.val) (sse_dotPlus2Fast a.val b2.val)
         p.1 + 5 * p.2
       | SseClique.c3 b1 b2 b3 =>
         let t := sse_sort3Nat (sse_dotPlus2Fast a.val b1.val) (sse_dotPlus2Fast a.val b2.val) (sse_dotPlus2Fast a.val b3.val)
         t.1 + 5 * (t.2.1 + 5 * t.2.2)) := by
    intro a; cases c2 with
    | c1 b => exact hDot a b
    | c2 b1 b2 =>
      unfold sseActCliqueGen sseSort2Fin; split
      · simp only [hDot]
      · simp only [hDot, sse_sort2Nat_comm]
    | c3 b1 b2 b3 =>
      unfold sseActCliqueGen sseSort3Fin sseSort2Fin
      split <;> split <;> split <;>
        (simp only [hDot]; rw [sse_sort3Nat_perm (sse_dotPlus2Fast a.val b1.val) (sse_dotPlus2Fast a.val b2.val) (sse_dotPlus2Fast a.val b3.val) _ _ _ (by tauto)])
  have hSz2 : sseCliqueSize (sseActCliqueGen k c2) = sseCliqueSize c2 := by cases c2 <;> rfl
  unfold ssePairDotCode
  rw [hSz2]
  cases c1 with
  | c1 a => simp only [sseActCliqueGen, sseCliqueSize, hRow]
  | c2 a1 a2 =>
    simp only [sseActCliqueGen, sseCliqueSize]
    unfold sseSort2Fin; split
    · simp only [hRow]
    · simp only [hRow, sse_sort2Nat_comm]
  | c3 a1 a2 a3 =>
    simp only [sseActCliqueGen, sseCliqueSize]
    unfold sseSort3Fin sseSort2Fin
    split <;> split <;> split <;>
      (simp only [hRow];
       rw [sse_sort3Nat_perm _ _ _ _ _ _ (by tauto)])

private theorem sse_pairOrbit216_wf4Gen (k : Fin 4) (i j : Fin 216) :
    ssePairOrbit216 (sseAct216Gen k i) (sseAct216Gen k j) = ssePairOrbit216 i j := by
  apply Fin.ext; unfold ssePairOrbit216
  rw [sse_act216Gen_compat, sse_act216Gen_compat, sse_pairDotCode_wf4Gen]

private theorem sse_pairOrbit216_wf4 (w : List (Fin 4)) (i j : Fin 216) :
    ssePairOrbit216 (sseAct216 w i) (sseAct216 w j) = ssePairOrbit216 i j := by
  induction w with | nil => rfl | cons k rest ih => simp only [sseAct216, sse_pairOrbit216_wf4Gen, ih]

private def sse_orbitMetaArr : Array (Nat × Nat × Nat × Nat × Nat) := #[
    (18, 1, 1, 144, 6), (0, 1, 1, 24, 1), (9, 1, 1, 192, 8), (102, 1, 2, 576, 6),
    (48, 1, 2, 192, 2), (57, 1, 2, 288, 3), (510, 1, 3, 576, 6), (276, 1, 3, 288, 3),
    (3394, 2, 1, 576, 24), (2260, 2, 1, 576, 24), (1126, 2, 1, 192, 8), (1135, 2, 1, 288, 12),
    (3385, 2, 1, 192, 8), (19282, 2, 2, 288, 3), (20353, 2, 2, 576, 6), (18103, 2, 2, 576, 6),
    (19228, 2, 2, 1152, 12), (12478, 2, 2, 288, 3), (12424, 2, 2, 576, 6), (12433, 2, 2, 1152, 12),
    (19183, 2, 2, 576, 6), (5674, 2, 2, 96, 1), (6799, 2, 2, 576, 6), (18049, 2, 2, 192, 2),
    (97531, 2, 3, 288, 3), (104011, 2, 3, 1152, 12), (97261, 2, 3, 1152, 12), (63511, 2, 3, 576, 6),
    (63277, 2, 3, 1152, 12), (97027, 2, 3, 576, 6), (34027, 2, 3, 288, 3), (425270, 3, 1, 576, 24),
    (282386, 3, 1, 576, 24), (141752, 3, 1, 288, 12), (424136, 3, 1, 576, 24), (2550533, 3, 2, 576, 6),
    (2550479, 3, 2, 1152, 12), (2408729, 3, 2, 1152, 12), (1559309, 3, 2, 576, 6), (1553675, 3, 2, 1152, 12),
    (2403059, 3, 2, 1152, 12), (849425, 3, 2, 288, 3), (2262425, 3, 2, 576, 6), (2543729, 3, 2, 288, 3),
    (2409809, 3, 2, 288, 3), (13041836, 3, 3, 192, 2), (13035032, 3, 3, 576, 6), (13041512, 3, 3, 576, 6),
    (13034762, 3, 3, 1152, 12), (12191012, 3, 3, 576, 6), (7938512, 3, 3, 192, 2), (7938278, 3, 3, 576, 6),
    (7909028, 3, 3, 576, 6), (12157028, 3, 3, 1152, 12), (13001012, 3, 3, 576, 6), (4252778, 3, 3, 96, 1),
    (12190778, 3, 3, 288, 3)
  ]

/-- Exact orbit metadata `(dotCode, s1, s2, totalPairs, multIntoS2)` for each `o : Fin 57`. -/
def sseOrbitCode (o : Fin 57) : Nat := (sse_orbitMetaArr.getD o.val (0, 1, 1, 0, 0)).1
def sseOrbitS1 (o : Fin 57) : Nat := (sse_orbitMetaArr.getD o.val (0, 1, 1, 0, 0)).2.1
def sseOrbitS2 (o : Fin 57) : Nat := (sse_orbitMetaArr.getD o.val (0, 1, 1, 0, 0)).2.2.1
def sseOrbitTotalPairs (o : Fin 57) : Nat := (sse_orbitMetaArr.getD o.val (0, 1, 1, 0, 0)).2.2.2.1
def sseOrbitMultIn (o : Fin 57) : Nat := (sse_orbitMetaArr.getD o.val (0, 1, 1, 0, 0)).2.2.2.2

/-- Exact incoming orbit-multiplicity tables for canonical cliques `[0]`, `[0,4]`, `[0,4,8]`
    and canonical `Q_3` cliques `[4]`, `[4,8]` (every entry kernel-verified against `adj24` below!). -/
private def sse_inOrbitTblNat : Nat → List (Nat × Nat)
  | 1 => [(0, 6), (1, 1), (2, 8), (8, 24), (9, 24), (10, 8), (11, 12), (12, 8), (31, 24), (32, 24), (33, 12), (34, 24)]
  | 2 => [(3, 6), (4, 2), (5, 3), (13, 3), (14, 6), (15, 6), (16, 12), (17, 3), (18, 6), (19, 12), (20, 6), (21, 1), (22, 6), (23, 2), (35, 6), (36, 12), (37, 12), (38, 6), (39, 12), (40, 12), (41, 3), (42, 6), (43, 3), (44, 3)]
  | _ => [(6, 6), (7, 3), (24, 3), (25, 12), (26, 12), (27, 6), (28, 12), (29, 6), (30, 3), (45, 2), (46, 6), (47, 6), (48, 12), (49, 6), (50, 2), (51, 6), (52, 6), (53, 12), (54, 6), (55, 1), (56, 3)]

private def sse_m1TblNat : Nat → List ((Nat × Nat) × Nat)
  | 1 => [((0, 3), 3), ((10, 18), 3), ((10, 21), 1), ((10, 22), 3), ((10, 23), 1), ((11, 15), 3), ((11, 19), 6), ((11, 22), 3), ((12, 14), 3), ((12, 20), 3), ((12, 23), 1), ((1, 4), 1), ((2, 3), 3), ((2, 4), 1), ((2, 5), 3), ((31, 35), 6), ((31, 36), 6), ((31, 37), 6), ((32, 37), 6), ((32, 38), 6), ((32, 39), 6), ((32, 40), 6), ((33, 39), 6), ((33, 41), 3), ((33, 42), 3), ((34, 36), 6), ((34, 40), 6), ((34, 42), 3), ((34, 43), 3), ((34, 44), 3), ((8, 13), 3), ((8, 14), 3), ((8, 15), 3), ((8, 16), 6), ((9, 16), 6), ((9, 17), 3), ((9, 18), 3), ((9, 19), 6), ((9, 20), 3)]
  | _ => [((13, 24), 1), ((14, 25), 4), ((15, 24), 2), ((15, 26), 4), ((16, 25), 4), ((16, 26), 4), ((17, 27), 2), ((18, 28), 4), ((18, 29), 2), ((19, 26), 4), ((19, 27), 4), ((19, 28), 4), ((20, 25), 4), ((20, 29), 2), ((21, 30), 1), ((22, 28), 4), ((22, 30), 2), ((23, 29), 2), ((35, 45), 2), ((35, 46), 2), ((36, 47), 4), ((36, 48), 4), ((37, 46), 4), ((37, 48), 4), ((37, 49), 4), ((38, 49), 2), ((38, 50), 2), ((38, 51), 2), ((39, 51), 4), ((39, 52), 4), ((39, 53), 4), ((3, 6), 4), ((40, 48), 4), ((40, 53), 4), ((40, 54), 4), ((41, 52), 2), ((41, 55), 1), ((42, 53), 4), ((42, 56), 2), ((43, 54), 2), ((44, 47), 2), ((44, 56), 1), ((4, 7), 2), ((5, 6), 2), ((5, 7), 1)]

private def sse_m2TblNat : Nat → List ((Nat × Nat) × Nat)
  | 1 => [((0, 8), 3), ((2, 12), 1), ((8, 31), 6), ((9, 34), 3)]
  | _ => [((13, 35), 2), ((16, 36), 4), ((17, 43), 1), ((3, 14), 2)]

private def sse_q3InTblNat : Nat → List (Nat × Nat)
  | 1 => [(0, 3), (2, 1), (8, 6), (9, 3)]
  | _ => [(3, 2), (13, 2), (16, 4), (17, 1)]

private def sse_toFin57 (n : Nat) : Fin 57 := if h : n < 57 then ⟨n, h⟩ else ⟨0, by decide⟩

def sseInOrbitTbl (sz : Nat) : List (Fin 57 × Nat) :=
  (sse_inOrbitTblNat sz).map (fun e => (sse_toFin57 e.1, e.2))

def sseM1Tbl (j1sz : Nat) : List ((Fin 57 × Fin 57) × Nat) :=
  (sse_m1TblNat j1sz).map (fun e => ((sse_toFin57 e.1.1, sse_toFin57 e.1.2), e.2))

def sseM2Tbl (j2sz : Nat) : List ((Fin 57 × Fin 57) × Nat) :=
  (sse_m2TblNat j2sz).map (fun e => ((sse_toFin57 e.1.1, sse_toFin57 e.1.2), e.2))

def sseQ3InTbl (jbsz : Nat) : List (Fin 57 × Nat) :=
  (sse_q3InTblNat jbsz).map (fun e => (sse_toFin57 e.1, e.2))

-- Fast kernel verification of ALL 5 grouping tables directly from `adj24` & `d4RootOf` (single-pass `sseCollectTags`)!
private def sse_checkGroupTbl {n : Nat} {α : Type} [DecidableEq α]
    (P : Fin n → Bool) (tag : Fin n → α) (tbl : List (α × Nat)) : Bool :=
  let xs := sseCollectTags P tag
  xs.all (fun x => tbl.any (fun e => decide (e.1 = x))) &&
  sseListNodup (tbl.map Prod.fst) &&
  tbl.all (fun e => decide (sseListCount e.1 xs = e.2))

private theorem sse_checkGroupTbl_sound {n : Nat} {α : Type} [DecidableEq α]
    (P : Fin n → Bool) (tag : Fin n → α) (tbl : List (α × Nat)) (F : α → Nat)
    (h : sse_checkGroupTbl P tag tbl = true) :
    sseSumFinNat (fun i : Fin n => if P i = true then F (tag i) else 0) = sseTableSum F tbl := by
  unfold sse_checkGroupTbl at h
  simp only [Bool.and_eq_true] at h
  exact sse_sumFinNat_group_by_table P tag tbl F h.1.1 h.1.2 h.2

private theorem sse_orbit_tables_verified :
    (sse_checkGroupTbl (fun p : Fin 216 => sse_canFollowFast p ⟨0, by decide⟩)
      (fun p => ssePairOrbit216 p ⟨0, by decide⟩) (sseInOrbitTbl 1) = true) ∧
    (sse_checkGroupTbl (fun p : Fin 216 => sse_canFollowFast p ⟨24, by decide⟩)
      (fun p => ssePairOrbit216 p ⟨24, by decide⟩) (sseInOrbitTbl 2) = true) ∧
    (sse_checkGroupTbl (fun p : Fin 216 => sse_canFollowFast p ⟨120, by decide⟩)
      (fun p => ssePairOrbit216 p ⟨120, by decide⟩) (sseInOrbitTbl 3) = true) ∧
    (sse_checkGroupTbl (fun c : Fin 216 => sse_canFollowFast c sseIdx0 && sse_canFollowFast c ⟨4, by decide⟩)
      (fun c => (ssePairOrbit216 c ⟨4, by decide⟩, ssePairOrbit216 c (sseAdd0 ⟨4, by decide⟩))) (sseM1Tbl 1) = true) ∧
    (sse_checkGroupTbl (fun c : Fin 216 => sse_canFollowFast c sseIdx0 && sse_canFollowFast c ⟨56, by decide⟩)
      (fun c => (ssePairOrbit216 c ⟨56, by decide⟩, ssePairOrbit216 c (sseAdd0 ⟨56, by decide⟩))) (sseM1Tbl 2) = true) ∧
    (sse_checkGroupTbl (fun j1 : Fin 216 => sseIsQ3 j1 && sse_canFollowFast j1 ⟨4, by decide⟩)
      (fun j1 => (ssePairOrbit216 j1 ⟨4, by decide⟩, ssePairOrbit216 (sseAdd0 j1) ⟨4, by decide⟩)) (sseM2Tbl 1) = true) ∧
    (sse_checkGroupTbl (fun j1 : Fin 216 => sseIsQ3 j1 && sse_canFollowFast j1 ⟨56, by decide⟩)
      (fun j1 => (ssePairOrbit216 j1 ⟨56, by decide⟩, ssePairOrbit216 (sseAdd0 j1) ⟨56, by decide⟩)) (sseM2Tbl 2) = true) ∧
    (sse_checkGroupTbl (fun ja : Fin 216 => sseIsQ3 ja && sse_canFollowFast ja ⟨4, by decide⟩)
      (fun ja => ssePairOrbit216 ja ⟨4, by decide⟩) (sseQ3InTbl 1) = true) ∧
    (sse_checkGroupTbl (fun ja : Fin 216 => sseIsQ3 ja && sse_canFollowFast ja ⟨56, by decide⟩)
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
    (∀ (sz : Nat), sz = 1 ∨ sz = 2 ∨ sz = 3 →
      ∀ (p : Fin 216), sse_canFollowFast p (sseCanonCliqueOfSize sz) = true →
        sseOrbitS1 (ssePairOrbit216 p (sseCanonCliqueOfSize sz)) = sseSize216 p ∧
        sseOrbitS2 (ssePairOrbit216 p (sseCanonCliqueOfSize sz)) = sz) := by
  decide

private theorem sse_pairOrbit_sizes (p c : Fin 216) (hF : sseCanFollow216 p c = true) :
    sseOrbitS1 (ssePairOrbit216 p c) = sseSize216 p ∧ sseOrbitS2 (ssePairOrbit216 p c) = sseSize216 c := by
  let w := sseCanonWord216 c
  have hCw : sseAct216 w c = sseCanonCliqueOfSize (sseSize216 c) := sse_canonWord216_exact c
  have hFw : sse_canFollowFast (sseAct216 w p) (sseCanonCliqueOfSize (sseSize216 c)) = true := by
    rw [← sse_canFollow216_eq_fast, ← hCw, sse_canFollow216_wf4, hF]
  have hSz : sseSize216 c = 1 ∨ sseSize216 c = 2 ∨ sseSize216 c = 3 := by
    unfold sseSize216; cases sseClique216 c <;> simp [sseCliqueSize]
  have hM := sse_orbit_meta_verified.2.2.2.2.2.2.2 (sseSize216 c) hSz (sseAct216 w p) hFw
  rw [← hCw, sse_pairOrbit216_wf4, sse_act216_size] at hM
  exact hM

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
        rw [sse_ite_pos hF, sse_ite_pos hF]; exact ih p _ _ (fun rev => h (c :: rev))
      else
        rw [sse_ite_neg hF, sse_ite_neg hF]; exact Nat.le_refl 0

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
        rw [sse_ite_pos hF, sse_ite_pos hF, sse_ite_pos hF]; exact ih p _ _
      else
        rw [sse_ite_neg hF, sse_ite_neg hF, sse_ite_neg hF]

private theorem sse_wordsEnd_mul_left (k : Nat) (c : Fin 216) (a : Nat) (f : List (Fin 216) → Nat) :
    sseWordsEnd k c (fun w => a * f w) = a * sseWordsEnd k c f := by
  induction k generalizing c f with
  | zero => simp only [sseWordsEnd, Nat.mul_zero]
  | succ n ih =>
    cases n with
    | zero => rfl
    | succ m =>
      simp only [sseWordsEnd]
      rw [← sse_sumFinNat_mul_left]
      apply sse_sumFinNat_congr; intro p
      if hF : sseCanFollow216 p c = true then
        rw [sse_ite_pos hF, sse_ite_pos hF]; exact ih p _
      else
        rw [sse_ite_neg hF, sse_ite_neg hF, Nat.mul_zero]

private theorem sse_wordsEnd_zero (k : Nat) (c : Fin 216) : sseWordsEnd k c (fun _ => 0) = 0 := by
  induction k generalizing c with
  | zero => rfl
  | succ n ih =>
    cases n with
    | zero => rfl
    | succ m =>
      simp only [sseWordsEnd]
      rw [sse_sumFinNat_congr _ (fun _ => 0) (fun p => by
        if hF : sseCanFollow216 p c = true then rw [sse_ite_pos hF, ih p] else rw [sse_ite_neg hF])]
      exact sse_sumFinNat_zero

private theorem sse_wordsEnd_head (n : Nat) (c : Fin 216) (f : List (Fin 216) → Nat) :
    sseWordsEnd (n + 1) c (fun w => match w with | h :: _ => if h = c then f w else 0 | [] => 0) =
      sseWordsEnd (n + 1) c f := by
  cases n with
  | zero => simp only [sseWordsEnd, sse_ite_pos rfl]
  | succ m =>
    simp only [sseWordsEnd]
    apply sse_sumFinNat_congr; intro p
    if hF : sseCanFollow216 p c = true then
      rw [sse_ite_pos hF, sse_ite_pos hF]
      apply sse_wordsEnd_congr; intro rev _; rw [sse_ite_pos rfl]
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
  · rw [h1]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.1
  · rw [h2]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.2.1
  · rw [h3]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.2.2.1

-- Canonical `Stab(0)` grouping over `m = 1`, `m = 2`, and `Q_3`-step for ANY `j ∈ Q_3`!
private theorem sse_sum_m1_any (j : Fin 216) (hQ : sseIsQ3 j = true) (F : Fin 57 × Fin 57 → Nat) :
    sseSumFinNat (fun c : Fin 216 =>
      if sseCanFollow216 c sseIdx0 = true && sseCanFollow216 c j = true then
        F (ssePairOrbit216 c j, ssePairOrbit216 c (sseAdd0 j)) else 0) =
      sseTableSum F (sseM1Tbl (sseSize216 j)) := by
  let w := sseStab0Q3Word j
  obtain ⟨hFix0, hJw⟩ := sse_isQ3_fast_check.2.2.2.2.2.2.2.1 j hQ
  obtain ⟨hIdx0, _, hAddW⟩ := sse_stab0_preserves_q3_and_add0 w hFix0
  rw [← sse_sumFinNat_bij (sseAct216 w.reverse) (sseAct216 w) (sse_act216_inv_right w) (sse_act216_inv w)]
  have hEq : (fun c : Fin 216 =>
      if sseCanFollow216 (sseAct216 w.reverse c) sseIdx0 = true && sseCanFollow216 (sseAct216 w.reverse c) j = true then
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
    cases sse_canFollowFast c sseIdx0 <;> cases sse_canFollowFast c (sseCanonQ3OfSize (sseSize216 j)) <;> rfl
  rw [hEq]
  have hSz : sseSize216 j = 1 ∨ sseSize216 j = 2 := by
    have h3 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 j hQ
    unfold sseSize216; cases hcj : sseClique216 j <;> rw [hcj] at h3
    · exact Or.inl rfl
    · exact Or.inr rfl
    · exact False.elim h3
  rcases hSz with h1 | h2
  · rw [h1]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.2.2.2.1
  · rw [h2]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.2.2.2.2.1

private theorem sse_sum_m2_any (j2 : Fin 216) (hQ : sseIsQ3 j2 = true) (F : Fin 57 × Fin 57 → Nat) :
    sseSumFinNat (fun j1 : Fin 216 =>
      if sseIsQ3 j1 = true && sseCanFollow216 j1 j2 = true then
        F (ssePairOrbit216 j1 j2, ssePairOrbit216 (sseAdd0 j1) j2) else 0) =
      sseTableSum F (sseM2Tbl (sseSize216 j2)) := by
  let w := sseStab0Q3Word j2
  obtain ⟨hFix0, hJw⟩ := sse_isQ3_fast_check.2.2.2.2.2.2.2.1 j2 hQ
  obtain ⟨_, hQ3W, hAddW⟩ := sse_stab0_preserves_q3_and_add0 w hFix0
  have hFix0Rev : sseApplyWord w.reverse ⟨0, by decide⟩ = ⟨0, by decide⟩ := by
    have h := congrArg (sseApplyWord w.reverse) hFix0; rw [sse_applyWord_inv] at h; exact h.symm
  obtain ⟨_, hQ3Rev, _⟩ := sse_stab0_preserves_q3_and_add0 w.reverse hFix0Rev
  rw [← sse_sumFinNat_bij (sseAct216 w.reverse) (sseAct216 w) (sse_act216_inv_right w) (sse_act216_inv w)]
  have hEq : (fun j1 : Fin 216 =>
      if sseIsQ3 (sseAct216 w.reverse j1) = true && sseCanFollow216 (sseAct216 w.reverse j1) j2 = true then
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
      rw [hQj1, h4]; cases sse_canFollowFast j1 (sseCanonQ3OfSize (sseSize216 j2)) <;> rfl
    else
      have hF : sseIsQ3 j1 = false := by cases hq : sseIsQ3 j1; rfl; exact absurd hq hQj1
      rw [hF]; rfl
  rw [hEq]
  have hSz : sseSize216 j2 = 1 ∨ sseSize216 j2 = 2 := by
    have h3 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 j2 hQ
    unfold sseSize216; cases hcj : sseClique216 j2 <;> rw [hcj] at h3
    · exact Or.inl rfl
    · exact Or.inr rfl
    · exact False.elim h3
  rcases hSz with h1 | h2
  · rw [h1]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.2.2.2.2.2.1
  · rw [h2]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.2.2.2.2.2.2.1

private theorem sse_sum_q3In_any (jb : Fin 216) (hQ : sseIsQ3 jb = true) (F : Fin 57 → Nat) :
    sseSumFinNat (fun ja : Fin 216 =>
      if sseIsQ3 ja = true && sseCanFollow216 ja jb = true then F (ssePairOrbit216 ja jb) else 0) =
      sseTableSum F (sseQ3InTbl (sseSize216 jb)) := by
  let w := sseStab0Q3Word jb
  obtain ⟨hFix0, hJw⟩ := sse_isQ3_fast_check.2.2.2.2.2.2.2.1 jb hQ
  have hFix0Rev : sseApplyWord w.reverse ⟨0, by decide⟩ = ⟨0, by decide⟩ := by
    have h := congrArg (sseApplyWord w.reverse) hFix0; rw [sse_applyWord_inv] at h; exact h.symm
  obtain ⟨_, hQ3Rev, _⟩ := sse_stab0_preserves_q3_and_add0 w.reverse hFix0Rev
  rw [← sse_sumFinNat_bij (sseAct216 w.reverse) (sseAct216 w) (sse_act216_inv_right w) (sse_act216_inv w)]
  have hEq : (fun ja : Fin 216 =>
      if sseIsQ3 (sseAct216 w.reverse ja) = true && sseCanFollow216 (sseAct216 w.reverse ja) jb = true then
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
    cases sseIsQ3 ja <;> cases sse_canFollowFast ja (sseCanonQ3OfSize (sseSize216 jb)) <;> rfl
  rw [hEq]
  have hSz : sseSize216 jb = 1 ∨ sseSize216 jb = 2 := by
    have h3 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 jb hQ
    unfold sseSize216; cases hcj : sseClique216 jb <;> rw [hcj] at h3
    · exact Or.inl rfl
    · exact Or.inr rfl
    · exact False.elim h3
  rcases hSz with h1 | h2
  · rw [h1]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.2.2.2.2.2.2.2.1
  · rw [h2]; exact sse_checkGroupTbl_sound _ _ _ F sse_orbit_tables_verified.2.2.2.2.2.2.2

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
      rcases hSz with h1 | h2 | h3 <;> (rw [h1] <;> rfl) <|> (rw [h2] <;> rfl) <|> (rw [h3] <;> rfl)

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
      sse_cliques216_valid_and_distinct.2.2.2.2.1,
      sse_cliques216_valid_and_distinct.2.2.2.2.2.1,
      sse_cliques216_valid_and_distinct.2.2.2.2.2.2]; omega

private theorem sse_sum_q3_by_size (f : Nat → Nat) :
    sseSumFinNat (fun j : Fin 216 => if sseIsQ3 j = true then f (sseSize216 j) else 0) = 8 * f 1 + 12 * f 2 := by
  have hPt : ∀ j : Fin 216, (if sseIsQ3 j = true then f (sseSize216 j) else 0) =
      (if sseIsQ3 j = true && decide (sseSize216 j = 1) then 1 else 0) * f 1 +
      (if sseIsQ3 j = true && decide (sseSize216 j = 2) then 1 else 0) * f 2 := by
    intro j
    if hQ : sseIsQ3 j = true then
      have hSz : sseSize216 j = 1 ∨ sseSize216 j = 2 := by
        have h3 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 j hQ
        unfold sseSize216; cases hcj : sseClique216 j <;> rw [hcj] at h3
        · exact Or.inl rfl
        · exact Or.inr rfl
        · exact False.elim h3
      rw [sse_ite_pos hQ, hQ]
      rcases hSz with h1 | h2 <;> simp [h1, h2]
    else
      have hF : sseIsQ3 j = false := by cases hq : sseIsQ3 j; rfl; exact absurd hq hQ
      rw [sse_ite_neg hQ, hF]; simp
  rw [sse_sumFinNat_congr _ _ hPt, sse_sumFinNat_add, sse_sumFinNat_mul_right, sse_sumFinNat_mul_right,
      sse_isQ3_fast_check.2.2.2.2.1, sse_isQ3_fast_check.2.2.2.2.2.1]

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
    | zero => rfl
    | succ n =>
      cases n with
      | zero => rfl
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
                if hh : h = p then
                  rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                  have hrl : rs.length + 2 = m + 2 := by simp at hlen; omega
                  simp only [ssePsi, ssePrefixProd, hrl]
                  have hAlg : ∀ w0 a b d : Nat, (w0 * (a * d) * b) * (w0 * (a * d) * b) =
                      w0 * w0 * (a * a * b * b) * (d * d) := by
                    intro w0 a b d
                    have h1 : w0 * (a * d) * b = (w0 * a * b) * d := by
                      rw [Nat.mul_assoc w0 a d, Nat.mul_right_comm (w0 * a) d b]
                    rw [h1]
                    have h2 : ∀ x y : Nat, (x * y) * (x * y) = (x * x) * (y * y) := by
                      intro x y; rw [Nat.mul_assoc, Nat.mul_left_comm y x y, ← Nat.mul_assoc]
                    rw [h2, h2, h2, Nat.mul_assoc (w0 * w0) (a * a) (b * b),
                        ← Nat.mul_assoc (a * a) b b, ← Nat.mul_assoc (w0 * w0 * (a * a * b * b))]
                  exact hAlg _ _ _ _
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
              if sseCanFollow216 c sseIdx0 = true && sseCanFollow216 c j = true then
                om (ssePairOrbit216 c j) * om (ssePairOrbit216 c (sseAdd0 j)) *
                  sseZAt om (k2 + 1) (sseOrbitS1 (ssePairOrbit216 c j))
              else 0) := by
            apply sse_sumFinNat_congr; intro c
            if hFj : sseCanFollow216 c j = true then
              rw [sse_ite_pos hFj]
              if hF0 : sseCanFollow216 c sseIdx0 = true then
                have hNotQ : sseIsQ3 c = false := thm_sse_q3_link_and_zero_cascade.2.2.2.2.2.2.2.2.1 c hF0
                rw [hF0, hFj]; simp only [Bool.and_self, sse_ite_pos rfl]
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
                    if hh : h = c then
                      rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                      simp only [sseQ3SuffixLenRev, hQ, hNotQ, sse_ite_pos rfl, sseInsert0Rev, hF0, ssePrefixProd]
                      have hA : ∀ a b d : Nat, (a * d) * (b * d) = (a * b) * (d * d) := by
                        intro a b d; rw [Nat.mul_assoc, Nat.mul_left_comm d b d, ← Nat.mul_assoc]
                      exact hA _ _ _
                    else rw [sse_ite_neg hh, sse_ite_neg hh]
                rw [hMul, sse_wordsEnd_prefixProdSq om (k2 + 1) (by omega) c, (sse_pairOrbit_sizes c j hFj).1]
              else
                have hF0f : sseCanFollow216 c sseIdx0 = false := by cases h : sseCanFollow216 c sseIdx0; rfl; exact absurd h hF0
                rw [hF0f, Bool.false_and, sse_ite_neg (by decide)]
                rw [← sse_wordsEnd_head k2 c]
                have hZ : sseWordsEnd (k2 + 1) c (fun rev => match rev with
                    | h :: _ => if h = c then (if sseQ3SuffixLenRev (j :: rev) = 1 then
                        match sseInsert0Rev (j :: rev) with | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w' | none => 0
                      else 0) else 0 | [] => 0) = sseWordsEnd (k2 + 1) c (fun _ => 0) := by
                  apply sse_wordsEnd_congr; intro rev hlen
                  cases rev with
                  | nil => simp at hlen
                  | cons h rs =>
                    if hh : h = c then
                      rw [sse_ite_pos hh, hh]
                      cases hQc : sseIsQ3 c
                      · simp only [sseQ3SuffixLenRev, hQ, hQc, sse_ite_pos rfl, sseInsert0Rev, hF0f]; rfl
                      · simp only [sseQ3SuffixLenRev, hQ, hQc, sse_ite_pos rfl]
                        rw [sse_ite_neg (by omega)]
                    else rw [sse_ite_neg hh]
                rw [hZ, sse_wordsEnd_zero]
            else
              have hFjf : sseCanFollow216 c j = false := by cases h : sseCanFollow216 c j; rfl; exact absurd h hFj
              rw [sse_ite_neg hFj, hFjf, Bool.and_false, sse_ite_neg (by decide)]
          rw [hStep, sse_sum_m1_any j hQ (fun p => om p.1 * om p.2 * sseZAt om (k2 + 1) (sseOrbitS1 p.1))]
          have hSub : k2 + 2 - 1 = k2 + 1 := by omega
          rw [hSub]
          have hSz : sseSize216 j = 1 ∨ sseSize216 j = 2 := by
            have h3 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 j hQ
            unfold sseSize216; cases hcj : sseClique216 j <;> rw [hcj] at h3
            · exact Or.inl rfl
            · exact Or.inr rfl
            · exact False.elim h3
          rcases hSz with h1 | h2 <;> (rw [h1] <;> rfl) <|> (rw [h2] <;> rfl)
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
                if sseIsQ3 j1 = true && sseCanFollow216 j1 j = true then
                  om (ssePairOrbit216 j1 j) * om (ssePairOrbit216 (sseAdd0 j1) j) *
                    sse_q3MassPick om (sseZVec om (k2 + 1 - 1)) 1 (sseOrbitS1 (ssePairOrbit216 j1 j))
                else 0) := by
              apply sse_sumFinNat_congr; intro j1
              if hFj : sseCanFollow216 j1 j = true then
                rw [sse_ite_pos hFj]
                if hQ1 : sseIsQ3 j1 = true then
                  rw [hQ1, hFj]; simp only [Bool.and_self, sse_ite_pos rfl]
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
                      if hh : h = j1 then
                        rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                        cases rs with
                        | nil => simp at hlen; omega
                        | cons c cs =>
                          simp only [sseQ3SuffixLenRev, hQ, hQ1, sse_ite_pos rfl]
                          cases hQc : sseIsQ3 c
                          · simp only [sse_ite_neg (by decide : ¬ (false = true)), sse_ite_pos rfl, sseInsert0Rev, hQ, hQ1, hQc]
                            cases hF0 : sseCanFollow216 c sseIdx0
                            · simp
                            · simp only [sse_ite_pos rfl, ssePrefixProd]
                              have hA : ∀ a b x y : Nat, (a * x) * (b * y) = (a * b) * (x * y) := by
                                intro a b x y; rw [Nat.mul_assoc, Nat.mul_left_comm x b y, ← Nat.mul_assoc]
                              exact hA _ _ _ _
                          · simp only [sse_ite_pos rfl]
                            rw [sse_ite_neg (by omega), sse_ite_neg (by omega), Nat.mul_zero]
                      else rw [sse_ite_neg hh, sse_ite_neg hh]
                  rw [hMul, ih (by omega) (k2 + 1) (by omega) j1 hQ1, (sse_pairOrbit_sizes j1 j hFj).1]
                else
                  have hQ1f : sseIsQ3 j1 = false := by cases h : sseIsQ3 j1; rfl; exact absurd h hQ1
                  rw [hQ1f, Bool.false_and, sse_ite_neg (by decide)]
                  rw [← sse_wordsEnd_head k2 j1]
                  have hZ : sseWordsEnd (k2 + 1) j1 (fun rev => match rev with
                      | h :: _ => if h = j1 then (if sseQ3SuffixLenRev (j :: rev) = 2 then
                          match sseInsert0Rev (j :: rev) with | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w' | none => 0
                        else 0) else 0 | [] => 0) = sseWordsEnd (k2 + 1) j1 (fun _ => 0) := by
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      if hh : h = j1 then
                        rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQ, hQ1f]
                        rw [sse_ite_neg (by decide : ¬ (false = true)), sse_ite_pos rfl, sse_ite_neg (by decide)]
                      else rw [sse_ite_neg hh]
                  rw [hZ, sse_wordsEnd_zero]
              else
                have hFjf : sseCanFollow216 j1 j = false := by cases h : sseCanFollow216 j1 j; rfl; exact absurd h hFj
                rw [sse_ite_neg hFj, hFjf, Bool.and_false, sse_ite_neg (by decide)]
            rw [hStep, sse_sum_m2_any j hQ (fun p => om p.1 * om p.2 * sse_q3MassPick om (sseZVec om (k2 + 1 - 1)) 1 (sseOrbitS1 p.1))]
            have hSub : k2 + 2 - 2 = k2 + 1 - 1 := by omega
            rw [hSub]
            have hSz : sseSize216 j = 1 ∨ sseSize216 j = 2 := by
              have h3 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 j hQ
              unfold sseSize216; cases hcj : sseClique216 j <;> rw [hcj] at h3
              · exact Or.inl rfl
              · exact Or.inr rfl
              · exact False.elim h3
            rcases hSz with h1 | h2 <;> (rw [h1] <;> rfl) <|> (rw [h2] <;> rfl)
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
                if sseIsQ3 p = true && sseCanFollow216 p j = true then
                  om (ssePairOrbit216 p j) * om (ssePairOrbit216 p j) *
                    sse_q3MassPick om (sseZVec om (k2 + 1 - (d + 2))) (d + 2) (sseOrbitS1 (ssePairOrbit216 p j))
                else 0) := by
              apply sse_sumFinNat_congr; intro p
              if hFp : sseCanFollow216 p j = true then
                rw [sse_ite_pos hFp]
                if hQp : sseIsQ3 p = true then
                  rw [hQp, hFp]; simp only [Bool.and_self, sse_ite_pos rfl]
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
                      if hh : h = p then
                        rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                        cases rs with
                        | nil => simp at hlen; omega
                        | cons r rss =>
                          simp only [sseQ3SuffixLenRev, hQ, hQp, sse_ite_pos rfl]
                          cases hQr : sseIsQ3 r
                          · simp only [sse_ite_neg (by decide : ¬ (false = true))]
                            rw [sse_ite_neg (by omega), sse_ite_neg (by omega), Nat.mul_zero]
                          · simp only [sse_ite_pos rfl]
                            if hLenEq : sseQ3SuffixLenRev rss + 1 + 1 = d + 2 then
                              have hLenEq2 : sseQ3SuffixLenRev rss + 1 + 1 + 1 = d + 3 := by omega
                              rw [sse_ite_pos hLenEq2, sse_ite_pos hLenEq]
                              simp only [sseInsert0Rev, hQ, hQp, hQr, sse_ite_pos rfl]
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
                  rw [hQpf, Bool.false_and, sse_ite_neg (by decide)]
                  rw [← sse_wordsEnd_head k2 p]
                  have hZ : sseWordsEnd (k2 + 1) p (fun rev => match rev with
                      | h :: _ => if h = p then (if sseQ3SuffixLenRev (j :: rev) = d + 3 then
                          match sseInsert0Rev (j :: rev) with | some w' => ssePrefixProd om (j :: rev) * ssePrefixProd om w' | none => 0
                        else 0) else 0 | [] => 0) = sseWordsEnd (k2 + 1) p (fun _ => 0) := by
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      if hh : h = p then
                        rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQ, hQpf]
                        rw [sse_ite_neg (by decide : ¬ (false = true)), sse_ite_pos rfl, sse_ite_neg (by omega)]
                      else rw [sse_ite_neg hh]
                  rw [hZ, sse_wordsEnd_zero]
              else
                have hFpf : sseCanFollow216 p j = false := by cases h : sseCanFollow216 p j; rfl; exact absurd h hFp
                rw [sse_ite_neg hFp, hFpf, Bool.and_false, sse_ite_neg (by decide)]
            rw [hStep, sse_sum_q3In_any j hQ (fun o => om o * om o * sse_q3MassPick om (sseZVec om (k2 + 1 - (d + 2))) (d + 2) (sseOrbitS1 o))]
            have hSub : k2 + 2 - (d + 3) = k2 + 1 - (d + 2) := by omega
            rw [hSub]
            have hSz : sseSize216 j = 1 ∨ sseSize216 j = 2 := by
              have h3 := sse_isQ3_fast_check.2.2.2.2.2.2.2.2.1 j hQ
              unfold sseSize216; cases hcj : sseClique216 j <;> rw [hcj] at h3
              · exact Or.inl rfl
              · exact Or.inr rfl
              · exact False.elim h3
            rcases hSz with h1 | h2 <;> (rw [h1] <;> rfl) <|> (rw [h2] <;> rfl)

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
      apply congrArg (48 * ·)
      cases m with
      | zero =>
        -- Case `m = 0`, `k = k2 + 2`
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
                  if hh : h = p then
                    rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                    have hrl : rs.length + 2 = k2 + 2 := by simp at hlen; omega
                    have hrl1 : rs.length + 1 + 2 = k2 + 3 := by omega
                    simp only [sseQ3SuffixLenRev, hNotQ, sse_ite_neg (by decide : ¬ (false = true)),
                      sse_ite_pos rfl, sse_up0PairVal, sseInsert0Rev, hF0, ssePsi, List.length, hrl, hrl1, ssePrefixProd]
                    have hAlg : ∀ w1 w2 a b o0 v0 d : Nat,
                        (w1 * (a * d) * b) * (w2 * (o0 * (a * d)) * v0) =
                        w1 * w2 * (o0 * v0 * (a * a * b)) * (d * d) := by
                      intro w1 w2 a b o0 v0 d
                      have h1 : w1 * (a * d) * b = (w1 * a * b) * d := by
                        rw [Nat.mul_assoc w1 a d, Nat.mul_right_comm (w1 * a) d b]
                      have h2 : w2 * (o0 * (a * d)) * v0 = (w2 * o0 * a * v0) * d := by
                        rw [← Nat.mul_assoc o0 a d, Nat.mul_assoc w2 (o0 * a) d,
                            Nat.mul_right_comm (w2 * (o0 * a)) d v0, Nat.mul_assoc w2 o0 a]
                      rw [h1, h2]
                      have h3 : ∀ x y : Nat, (x * d) * (y * d) = (x * y) * (d * d) := by
                        intro x y; rw [Nat.mul_assoc, Nat.mul_left_comm d y d, ← Nat.mul_assoc]
                      rw [h3]
                      apply congrArg (· * (d * d))
                      calc (w1 * a * b) * (w2 * o0 * a * v0)
                          = w1 * (a * (b * (w2 * (o0 * (a * v0))))) := by simp only [Nat.mul_assoc]
                        _ = w1 * (w2 * (o0 * (v0 * (a * (a * b))))) := by
                            apply congrArg (w1 * ·)
                            rw [Nat.mul_left_comm a b, Nat.mul_left_comm a w2,
                                Nat.mul_left_comm b w2, Nat.mul_left_comm b o0,
                                Nat.mul_left_comm a o0, Nat.mul_left_comm b a,
                                Nat.mul_left_comm a v0, Nat.mul_left_comm a v0,
                                Nat.mul_comm b v0]
                        _ = w1 * w2 * (o0 * v0 * (a * a * b)) := by simp only [Nat.mul_assoc]
                    exact hAlg _ _ _ _ _ _ _
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
                if hh : h = c then
                  rw [sse_ite_pos hh, hh]
                  cases hQc : sseIsQ3 c
                  · simp only [sseQ3SuffixLenRev, hQc, sse_ite_neg (by decide : ¬ (false = true)), sse_ite_pos rfl,
                      sse_up0PairVal, sseInsert0Rev, hF0f]; rfl
                  · simp only [sseQ3SuffixLenRev, hQc, sse_ite_pos rfl, sse_ite_neg (by omega)]
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
            rcases hSz with h1 | h2 | h3 <;> (rw [h1] <;> rfl) <|> (rw [h2] <;> rfl) <|> (rw [h3] <;> rfl)
          else rw [sse_ite_neg hF0, sse_ite_neg hF0, Nat.mul_zero]
        rw [hOut, sse_sum_inOrbit_any sseIdx0]; rfl
      | succ m' =>
        cases m' with
        | zero =>
          -- Case `m = 1`, `k = k2 + 2`
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
                  rw [hF0, hFj]; simp only [Bool.and_self, sse_ite_pos rfl]
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
                      if hh : h = c then
                        rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                        have hrl : rs.length + 2 = k2 + 2 := by simp at hlen; omega
                        simp only [sseQ3SuffixLenRev, hQj, hNotQ, sse_ite_neg (by decide : ¬ (false = true)),
                          sse_ite_pos rfl, sse_up0PairVal, sseInsert0Rev, hF0, ssePsi, hrl, ssePrefixProd]
                        have hAlg : ∀ w0 a b va vb d : Nat,
                            (w0 * (a * d) * va) * (w0 * (b * d) * vb) =
                            w0 * w0 * (a * b * va * vb) * (d * d) := by
                          intro w0 a b va vb d
                          have h1 : w0 * (a * d) * va = (w0 * a * va) * d := by
                            rw [Nat.mul_assoc w0 a d, Nat.mul_right_comm (w0 * a) d va]
                          have h2 : w0 * (b * d) * vb = (w0 * b * vb) * d := by
                            rw [Nat.mul_assoc w0 b d, Nat.mul_right_comm (w0 * b) d vb]
                          rw [h1, h2]
                          have h3 : ∀ x y : Nat, (x * d) * (y * d) = (x * y) * (d * d) := by
                            intro x y; rw [Nat.mul_assoc, Nat.mul_left_comm d y d, ← Nat.mul_assoc]
                          rw [h3]
                          apply congrArg (· * (d * d))
                          calc (w0 * a * va) * (w0 * b * vb)
                              = w0 * (a * (va * (w0 * (b * vb)))) := by simp only [Nat.mul_assoc]
                            _ = w0 * (w0 * (a * (b * (va * vb)))) := by
                                apply congrArg (w0 * ·)
                                rw [Nat.mul_left_comm a va, Nat.mul_left_comm a w0,
                                    Nat.mul_left_comm va w0, Nat.mul_left_comm va b]
                            _ = w0 * w0 * (a * b * va * vb) := by simp only [Nat.mul_assoc]
                        exact hAlg _ _ _ _ _ _
                      else rw [sse_ite_neg hh, sse_ite_neg hh]
                  rw [hMul, sse_wordsEnd_prefixProdSq om (k2 + 1) (by omega) c, (sse_pairOrbit_sizes c j hFj).1, Nat.mul_assoc]
                else
                  have hF0f : sseCanFollow216 c sseIdx0 = false := by cases h : sseCanFollow216 c sseIdx0; rfl; exact absurd h hF0
                  rw [hF0f, Bool.false_and, sse_ite_neg (by decide), Nat.mul_zero, ← sse_wordsEnd_head k2 c]
                  have hZ : sseWordsEnd (k2 + 1) c (fun rev => match rev with
                      | h :: _ => if h = c then (if sseQ3SuffixLenRev (j :: rev) = 1 then sse_up0PairVal W om v (j :: rev) else 0) else 0
                      | [] => 0) = sseWordsEnd (k2 + 1) c (fun _ => 0) := by
                    apply sse_wordsEnd_congr; intro rev hlen
                    cases rev with
                    | nil => simp at hlen
                    | cons h rs =>
                      if hh : h = c then
                        rw [sse_ite_pos hh, hh]
                        cases hQc : sseIsQ3 c
                        · simp only [sseQ3SuffixLenRev, hQj, hQc, sse_ite_pos rfl, sse_up0PairVal, sseInsert0Rev, hF0f]; rfl
                        · simp only [sseQ3SuffixLenRev, hQj, hQc, sse_ite_pos rfl, sse_ite_neg (by omega)]
                      else rw [sse_ite_neg hh]
                  rw [hZ, sse_wordsEnd_zero]
              else
                have hFjf : sseCanFollow216 c j = false := by cases h : sseCanFollow216 c j; rfl; exact absurd h hFj
                rw [sse_ite_neg hFj, hFjf, Bool.and_false, sse_ite_neg (by decide), Nat.mul_zero]
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
                  if hh : h = j then
                    rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQjf, sse_ite_neg (by decide : ¬ (false = true)), sse_ite_neg (by decide)]
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
          rw [hOut, sse_sum_q3_by_size]; rfl
        | succ m'' =>
          cases m'' with
          | zero =>
            -- Case `m = 2`, `k = k2 + 2 ≥ 3`
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
                    rw [hQ1, hFj]; simp only [Bool.and_self, sse_ite_pos rfl]
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
                        if hh : h = j1 then
                          rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                          cases rs with
                          | nil => simp at hlen; omega
                          | cons c cs =>
                            have hrl : cs.length + 1 + 2 = k2 + 2 := by simp at hlen; omega
                            simp only [sseQ3SuffixLenRev, hQj, hQ1, sse_ite_pos rfl]
                            cases hQc : sseIsQ3 c
                            · simp only [sse_ite_neg (by decide : ¬ (false = true)), sse_ite_pos rfl,
                                sse_up0PairVal, sseInsert0Rev, hQj, hQ1, hQc]
                              cases hF0 : sseCanFollow216 c sseIdx0
                              · simp
                              · simp only [sse_ite_pos rfl, ssePsi, List.length, hrl, ssePrefixProd]
                                have hAlg : ∀ w0 a b va vb x y : Nat,
                                    (w0 * (a * x) * va) * (w0 * (b * y) * vb) =
                                    w0 * w0 * (a * b * va * vb) * (x * y) := by
                                  intro w0 a b va vb x y
                                  have h1 : w0 * (a * x) * va = (w0 * a * va) * x := by
                                    rw [Nat.mul_assoc w0 a x, Nat.mul_right_comm (w0 * a) x va]
                                  have h2 : w0 * (b * y) * vb = (w0 * b * vb) * y := by
                                    rw [Nat.mul_assoc w0 b y, Nat.mul_right_comm (w0 * b) y vb]
                                  rw [h1, h2]
                                  have h3 : ∀ p q : Nat, (p * x) * (q * y) = (p * q) * (x * y) := by
                                    intro p q; rw [Nat.mul_assoc, Nat.mul_left_comm x q y, ← Nat.mul_assoc]
                                  rw [h3]; apply congrArg (· * (x * y))
                                  calc (w0 * a * va) * (w0 * b * vb)
                                      = w0 * (a * (va * (w0 * (b * vb)))) := by simp only [Nat.mul_assoc]
                                    _ = w0 * (w0 * (a * (b * (va * vb)))) := by
                                        apply congrArg (w0 * ·)
                                        rw [Nat.mul_left_comm a va, Nat.mul_left_comm a w0,
                                            Nat.mul_left_comm va w0, Nat.mul_left_comm va b]
                                    _ = w0 * w0 * (a * b * va * vb) := by simp only [Nat.mul_assoc]
                                exact hAlg _ _ _ _ _ _ _
                            · simp only [sse_ite_pos rfl]
                              rw [sse_ite_neg (by omega), sse_ite_neg (by omega), Nat.mul_zero]
                        else rw [sse_ite_neg hh, sse_ite_neg hh]
                    rw [hMul, sse_q3Mass_eq om 1 (by omega) (k2 + 1) (by omega) j1 hQ1, (sse_pairOrbit_sizes j1 j2 hFj).1, Nat.mul_assoc]
                  else
                    have hQ1f : sseIsQ3 j1 = false := by cases h : sseIsQ3 j1; rfl; exact absurd h hQ1
                    rw [hQ1f, Bool.false_and, sse_ite_neg (by decide), Nat.mul_zero, ← sse_wordsEnd_head k2 j1]
                    have hZ : sseWordsEnd (k2 + 1) j1 (fun rev => match rev with
                        | h :: _ => if h = j1 then (if sseQ3SuffixLenRev (j2 :: rev) = 2 then sse_up0PairVal W om v (j2 :: rev) else 0) else 0
                        | [] => 0) = sseWordsEnd (k2 + 1) j1 (fun _ => 0) := by
                      apply sse_wordsEnd_congr; intro rev hlen
                      cases rev with
                      | nil => simp at hlen
                      | cons h rs =>
                        if hh : h = j1 then
                          rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQj, hQ1f]
                          rw [sse_ite_neg (by decide : ¬ (false = true)), sse_ite_pos rfl, sse_ite_neg (by decide)]
                        else rw [sse_ite_neg hh]
                    rw [hZ, sse_wordsEnd_zero]
                else
                  have hFjf : sseCanFollow216 j1 j2 = false := by cases h : sseCanFollow216 j1 j2; rfl; exact absurd h hFj
                  rw [sse_ite_neg hFj, hFjf, Bool.and_false, sse_ite_neg (by decide), Nat.mul_zero]
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
                    if hh : h = j2 then
                      rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQjf, sse_ite_neg (by decide : ¬ (false = true)), sse_ite_neg (by decide)]
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
            rw [hOut, hSub, sse_sum_q3_by_size]; rfl
          | succ d =>
            -- Case `m = d + 3 ≥ 3`, `k = k2 + 2 > d + 3`
            have hInsLen : ∀ (u : List (Fin 216)) (u' : List (Fin 216)),
                sseQ3SuffixLenRev u ≥ 1 → sseInsert0Rev u = some u' → u'.length = u.length := by
              intro u; induction u with
              | nil => intro _ h1; simp [sseQ3SuffixLenRev] at h1
              | cons x xs ihu =>
                intro u' h1 h2
                cases hQx : sseIsQ3 x
                · simp [sseQ3SuffixLenRev, hQx] at h1
                · simp only [sseInsert0Rev, hQx, sse_ite_pos rfl] at h2
                  cases xs with
                  | nil => cases h2; rfl
                  | cons y ys =>
                    cases hQy : sseIsQ3 y
                    · simp only [hQy, sse_ite_neg (by decide : ¬ (false = true))] at h2
                      cases hFy : sseCanFollow216 y sseIdx0 <;> simp [hFy] at h2
                      subst h2; rfl
                    · simp only [hQy, sse_ite_pos rfl] at h2
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
                    rw [hQp, hFp]; simp only [Bool.and_self, sse_ite_pos rfl]
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
                        if hh : h = p then
                          rw [sse_ite_pos hh, sse_ite_pos hh, hh]
                          cases rs with
                          | nil => simp at hlen; omega
                          | cons r rss =>
                            simp only [sseQ3SuffixLenRev, hQj, hQp, sse_ite_pos rfl]
                            cases hQr : sseIsQ3 r
                            · simp only [sse_ite_neg (by decide : ¬ (false = true))]
                              rw [sse_ite_neg (by omega), sse_ite_neg (by omega), Nat.mul_zero]
                            · simp only [sse_ite_pos rfl]
                              if hLenEq : sseQ3SuffixLenRev rss + 1 + 1 = d + 2 then
                                have hLenEq2 : sseQ3SuffixLenRev rss + 1 + 1 + 1 = d + 3 := by omega
                                rw [sse_ite_pos hLenEq2, sse_ite_pos hLenEq]
                                simp only [sse_up0PairVal, sseInsert0Rev, hQj, hQp, hQr, sse_ite_pos rfl]
                                cases hIns : sseInsert0Rev (r :: rss) with
                                | none => simp
                                | some tail' =>
                                  have hTLen : tail'.length = (r :: rss).length :=
                                    hInsLen (r :: rss) tail' (by simp [sseQ3SuffixLenRev, hQr]) hIns
                                  have hrl : (r :: rss).length + 2 = k2 + 2 := by simp at hlen; omega
                                  have hrl' : tail'.length + 2 = k2 + 2 := by rw [hTLen]; exact hrl
                                  simp only [ssePsi, hrl, hrl', ssePrefixProd]
                                  have hAlg : ∀ w0 a va x y : Nat,
                                      (w0 * (a * x) * va) * (w0 * (a * y) * va) =
                                      w0 * w0 * (a * a * va * va) * (x * y) := by
                                    intro w0 a va x y
                                    have h1 : w0 * (a * x) * va = (w0 * a * va) * x := by
                                      rw [Nat.mul_assoc w0 a x, Nat.mul_right_comm (w0 * a) x va]
                                    have h2 : w0 * (a * y) * va = (w0 * a * va) * y := by
                                      rw [Nat.mul_assoc w0 a y, Nat.mul_right_comm (w0 * a) y va]
                                    rw [h1, h2]
                                    have h3 : ∀ q1 q2 : Nat, (q1 * x) * (q2 * y) = (q1 * q2) * (x * y) := by
                                      intro q1 q2; rw [Nat.mul_assoc, Nat.mul_left_comm x q2 y, ← Nat.mul_assoc]
                                    rw [h3]; apply congrArg (· * (x * y))
                                    calc (w0 * a * va) * (w0 * a * va)
                                        = w0 * (a * (va * (w0 * (a * va)))) := by simp only [Nat.mul_assoc]
                                      _ = w0 * (w0 * (a * (a * (va * va)))) := by
                                          apply congrArg (w0 * ·)
                                          rw [Nat.mul_left_comm a va, Nat.mul_left_comm a w0,
                                              Nat.mul_left_comm va w0, Nat.mul_left_comm va a]
                                      _ = w0 * w0 * (a * a * va * va) := by simp only [Nat.mul_assoc]
                                  exact hAlg _ _ _ _ _
                              else
                                have hLenNe2 : ¬ (sseQ3SuffixLenRev rss + 1 + 1 + 1 = d + 3) := by omega
                                rw [sse_ite_neg hLenNe2, sse_ite_neg hLenEq, Nat.mul_zero]
                        else rw [sse_ite_neg hh, sse_ite_neg hh]
                    rw [hMul, sse_q3Mass_eq om (d + 2) (by omega) (k2 + 1) (by omega) p hQp, (sse_pairOrbit_sizes p j hFp).1, Nat.mul_assoc]
                  else
                    have hQpf : sseIsQ3 p = false := by cases h : sseIsQ3 p; rfl; exact absurd h hQp
                    rw [hQpf, Bool.false_and, sse_ite_neg (by decide), Nat.mul_zero, ← sse_wordsEnd_head k2 p]
                    have hZ : sseWordsEnd (k2 + 1) p (fun rev => match rev with
                        | h :: _ => if h = p then (if sseQ3SuffixLenRev (j :: rev) = d + 3 then sse_up0PairVal W om v (j :: rev) else 0) else 0
                        | [] => 0) = sseWordsEnd (k2 + 1) p (fun _ => 0) := by
                      apply sse_wordsEnd_congr; intro rev hlen
                      cases rev with
                      | nil => simp at hlen
                      | cons h rs =>
                        if hh : h = p then
                          rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQj, hQpf]
                          rw [sse_ite_neg (by decide : ¬ (false = true)), sse_ite_pos rfl, sse_ite_neg (by omega)]
                        else rw [sse_ite_neg hh]
                    rw [hZ, sse_wordsEnd_zero]
                else
                  have hFpf : sseCanFollow216 p j = false := by cases h : sseCanFollow216 p j; rfl; exact absurd h hFp
                  rw [sse_ite_neg hFp, hFpf, Bool.and_false, sse_ite_neg (by decide), Nat.mul_zero]
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
                    if hh : h = j then
                      rw [sse_ite_pos hh, hh]; simp only [sseQ3SuffixLenRev, hQjf, sse_ite_neg (by decide : ¬ (false = true)), sse_ite_neg (by omega)]
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
            rw [hOut, hSub, sse_sum_q3_by_size]; rfl

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
      else rw [sse_ite_neg hm]; exact (by rw [sse_sumFinNat_congr _ _ (fun _ => sse_ite_neg hm _ _), sse_sumFinNat_zero]).symm
    rw [hIn]
    exact sse_sumFinNat_le _ _ (fun c => hDisj (M + 1) k c (sse_up0PairVal W om v))
  else
    rw [sse_ite_neg hk2, sse_ite_neg hk2, Nat.mul_zero]; exact Nat.le_refl 0

/-- Headline Theorem 7 (Exact `57` Pair-Orbit Algebra & All-Depth Symbolic Cartier-Foata Word-Sum Reduction):
    1. `ssePairDotCode` classifies all `31,080` valid clique pairs of `Γ_24` (`2280 + 13056 + 15744`)
       into `57` distinct `W(F_4)`-invariant orbits with zero collisions;
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
      48 * sseCFExactUp0Quad K W om v ≥ sseCF1QuadTrunc K M W om v) :=
  ⟨sse_orbit_meta_verified.1,
   ⟨sse_orbit_meta_verified.2.2.1, sse_orbit_meta_verified.2.2.2.1,
    sse_orbit_meta_verified.2.2.2.2.1, sse_orbit_meta_verified.2.2.2.2.2.1⟩,
   sse_pairOrbit216_wf4, sse_wordsEnd_prefixProdSq, sse_cf_exact_normSq_eq, sse_cf_exact_up0Quad_ge⟩


/-! ## Section 7: Concrete CF 1-Step Lower Bound (`ρ > 913/80 = 11.4125`) & Master Certified Bracket -/

/-- Concrete `57`-orbit positive integer bulk weights `om[0..56]` (scale `100`). -/
private def sse_cf1OmArr : Array Nat := #[
  100, 83, 88, 41, 37, 38, 22, 21, 126, 80, 71, 74, 113, 54, 60, 41, 44, 35, 32, 33,
  41, 30, 31, 38, 26, 27, 22, 19, 18, 21, 17, 139, 68, 62, 92, 67, 55, 42, 29, 28,
  34, 26, 32, 44, 39, 37, 28, 28, 24, 21, 16, 16, 15, 18, 21, 15, 19
]

/-- Concrete `57`-orbit positive integer boundary weights `v[0..56]` (scale `100`). -/
private def sse_cf1VArr : Array Nat := #[
  146, 148, 147, 119, 119, 119, 101, 101, 135, 144, 147, 145, 136, 118, 115, 118, 118, 119, 118, 118,
  117, 119, 119, 118, 101, 101, 101, 101, 101, 101, 101, 129, 142, 146, 136, 114, 115, 116, 117, 118,
  117, 119, 118, 116, 116, 100, 100, 100, 100, 101, 101, 101, 101, 101, 101, 101, 101
]

def sseCF1Om (o : Fin 57) : Nat := sse_cf1OmArr.getD o.val 1
def sseCF1V (o : Fin 57) : Nat := sse_cf1VArr.getD o.val 1

/-- Explicit positive finite-support shell window `W(k) = (k - 1)(121 - k) * 5^{k - 2} * 2556^{120 - k}`
    supported strictly on Cartier-Foata heights `k ∈ [2, 120]` (`0` outside). -/
def sseCF1Win (k : Nat) : Nat :=
  if 2 ≤ k ∧ k ≤ 120 then (k - 1) * (121 - k) * (5 ^ (k - 2)) * (2556 ^ (120 - k)) else 0

-- Fast O(K) linear-time mirror of `sseCF1NormSq` and `sseCF1QuadTrunc` using precomputed scalar coefficients
-- and a single linear pass over `k = 2..K` (proved symbolically equal to `sseCF1NormSq` and `sseCF1QuadTrunc`!).
private def sse_zStepLin (om : Fin 57 → Nat) (z : Nat × Nat × Nat) : Nat × Nat × Nat :=
  let c (sz s1 : Nat) : Nat :=
    sseTableSum (fun o => if sseOrbitS1 o = s1 then om o * om o else 0) (sseInOrbitTbl sz)
  (c 1 1 * z.1 + c 1 2 * z.2.1 + c 1 3 * z.2.2,
   c 2 1 * z.1 + c 2 2 * z.2.1 + c 2 3 * z.2.2,
   c 3 1 * z.1 + c 3 2 * z.2.1 + c 3 3 * z.2.2)

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
    · rw [h1]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (1 = 2)), sse_ite_neg (by decide : ¬ (1 = 3)),
        Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h2]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (2 = 1)), sse_ite_neg (by decide : ¬ (2 = 3)),
        Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h3]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (3 = 1)), sse_ite_neg (by decide : ¬ (3 = 2)),
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
    · rw [h1]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (1 = 2)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h2]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (2 = 1)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega

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
    · rw [h1]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (1 = 2)), sse_ite_neg (by decide : ¬ (1 = 3)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h2]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (2 = 1)), sse_ite_neg (by decide : ¬ (2 = 3)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h3]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (3 = 1)), sse_ite_neg (by decide : ¬ (3 = 2)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega

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
    · rw [h1]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (1 = 2)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega
    · rw [h2]; simp only [sse_ite_pos rfl, sse_ite_neg (by decide : ¬ (2 = 1)), Nat.mul_zero, Nat.zero_mul, Nat.mul_assoc]; omega

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

-- Precomputed linear-form scalar coefficients (all evaluated ONCE by `decide` for `sseCF1Om`, `sseCF1V`!):
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

-- Compute the 3-vector slice coefficient `sse_cSlice m = (c1, c2, c3)` so `sseCF1SliceAt W om v k m = W_k * W_{k'} * (c1 Z1 + c2 Z2 + c3 Z3)`!
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
    rw [sse_tableSum_split3_pair _ _ z sse_tbl_s1_ranges.2.2.2.1,
        sse_tableSum_split3_pair _ _ z sse_tbl_s1_ranges.2.2.2.2.1]
  · unfold sseQ3MassVec sse_cP2
    dsimp only
    rw [sse_tableSum_split2_pair _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.1,
        sse_tableSum_split2_pair _ _ _ sse_tbl_s1_ranges.2.2.2.2.2.2.1]
  · intro d; unfold sseQ3MassVec sse_cQ3
    dsimp only
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
    have hV1 : sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1) =
        let z := sseZVec sseCF1Om (k - 1)
        sseTableSum (fun o => if sseOrbitS1 o = 1 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 1) * z.1 +
        sseTableSum (fun o => if sseOrbitS1 o = 2 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 1) * z.2.1 +
        sseTableSum (fun o => if sseOrbitS1 o = 3 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 1) * z.2.2 :=
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.1
    have hV2 : sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2) =
        let z := sseZVec sseCF1Om (k - 1)
        sseTableSum (fun o => if sseOrbitS1 o = 1 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 2) * z.1 +
        sseTableSum (fun o => if sseOrbitS1 o = 2 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 2) * z.2.1 +
        sseTableSum (fun o => if sseOrbitS1 o = 3 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 2) * z.2.2 :=
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.2.1
    have hV3 : sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3) =
        let z := sseZVec sseCF1Om (k - 1)
        sseTableSum (fun o => if sseOrbitS1 o = 1 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 3) * z.1 +
        sseTableSum (fun o => if sseOrbitS1 o = 2 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 3) * z.2.1 +
        sseTableSum (fun o => if sseOrbitS1 o = 3 then sseCF1Om o * sseCF1Om o * sseCF1V o else 0) (sseInOrbitTbl 3) * z.2.2 :=
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.2.2.1
    have hOuter := sse_tableSum_split3 (sseInOrbitTbl 1) (fun o => sseCF1Om o * sseCF1V o)
      (sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1),
       sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2),
       sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3))
      sse_tbl_s1_ranges.1
    rw [hOuter, hV1, hV2, hV3]
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
        simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega

private theorem sse_cf1NormSq_term_eq (W : Nat → Nat) (k : Nat) :
    W k * W k *
      (24 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 1) +
       96 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 2) +
       96 * sseTableSum (fun o => sseCF1Om o * sseCF1Om o * sseCF1V o * sseCF1V o * sseZAt sseCF1Om (k - 1) (sseOrbitS1 o)) (sseInOrbitTbl 3)) =
    W k * W k * sse_dot3 (sse_cDen 1, sse_cDen 2, sse_cDen 3) (sseZVec sseCF1Om (k - 1)) := by
  rw [sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.1,
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.2.1,
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k - 1)) sse_tbl_s1_ranges.2.2.1]
  unfold sse_dot3 sse_cDen
  apply congrArg (W k * W k * ·)
  simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega

-- Compute all scalar 3-vector coefficients ONCE by `decide` into concrete closed `Nat` constants so the
-- `K = 120` loop performs ZERO `sseTableSum` work!
private def sse_zArr (K : Nat) : Array (Nat × Nat × Nat) :=
  let c11 := sse_cZ 1 1; let c12 := sse_cZ 1 2; let c13 := sse_cZ 1 3
  let c21 := sse_cZ 2 1; let c22 := sse_cZ 2 2; let c23 := sse_cZ 2 3
  let c31 := sse_cZ 3 1; let c32 := sse_cZ 3 2; let c33 := sse_cZ 3 3
  let rec go : Nat → Array (Nat × Nat × Nat) → Array (Nat × Nat × Nat)
    | 0, acc => acc
    | n + 1, acc =>
      let prev := acc.getD (acc.size - 1) (0, 0, 0)
      let nxt :=
        (c11 * prev.1 + c12 * prev.2.1 + c13 * prev.2.2,
         c21 * prev.1 + c22 * prev.2.1 + c23 * prev.2.2,
         c31 * prev.1 + c32 * prev.2.1 + c33 * prev.2.2)
      go n (acc.push nxt)
  go (K - 1) #[(0, 0, 0), (1, 1, 1)]

private theorem sse_zVec_step (k : Nat) :
    sseZVec sseCF1Om (k + 2) =
      let prev := sseZVec sseCF1Om (k + 1)
      (sse_cZ 1 1 * prev.1 + sse_cZ 1 2 * prev.2.1 + sse_cZ 1 3 * prev.2.2,
       sse_cZ 2 1 * prev.1 + sse_cZ 2 2 * prev.2.1 + sse_cZ 2 3 * prev.2.2,
       sse_cZ 3 1 * prev.1 + sse_cZ 3 2 * prev.2.1 + sse_cZ 3 3 * prev.2.2) := by
  unfold sseZVec sse_cZ
  rw [sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k + 1)) sse_tbl_s1_ranges.1,
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k + 1)) sse_tbl_s1_ranges.2.1,
      sse_tableSum_split3 _ _ (sseZVec sseCF1Om (k + 1)) sse_tbl_s1_ranges.2.2.1]

/-- Pure tail-recursive `O(K)` list builder for `[Z(k), Z(k-1), ..., Z(0)]` proved exact against `sseZVec sseCF1Om`. -/
private def sse_zHist (c11 c12 c13 c21 c22 c23 c31 c32 c33 : Nat) : Nat → List (Nat × Nat × Nat)
  | 0 => [(0, 0, 0)]
  | 1 => [(1, 1, 1), (0, 0, 0)]
  | k + 2 =>
    let rest := sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 (k + 1)
    let prev := rest.headD (0, 0, 0)
    (c11 * prev.1 + c12 * prev.2.1 + c13 * prev.2.2,
     c21 * prev.1 + c22 * prev.2.1 + c23 * prev.2.2,
     c31 * prev.1 + c32 * prev.2.1 + c33 * prev.2.2) :: rest

private theorem sse_zHist_getD :
    ∀ (k m : Nat), m ≤ k →
      (sse_zHist (sse_cZ 1 1) (sse_cZ 1 2) (sse_cZ 1 3)
                 (sse_cZ 2 1) (sse_cZ 2 2) (sse_cZ 2 3)
                 (sse_cZ 3 1) (sse_cZ 3 2) (sse_cZ 3 3) k).getD m (0, 0, 0) =
      sseZVec sseCF1Om (k - m) := by
  intro k; induction k with
  | zero => intro m hm; have : m = 0 := by omega; subst this; rfl
  | succ k1 ih =>
    intro m hm
    cases k1 with
    | zero =>
      cases m with
      | zero => rfl
      | succ m1 => have : m1 = 0 := by omega; subst this; rfl
    | succ k2 =>
      cases m with
      | zero =>
        simp only [sse_zHist, List.getD, List.getElem?_cons_zero, Option.getD_some, Nat.sub_zero]
        have hHead : (sse_zHist (sse_cZ 1 1) (sse_cZ 1 2) (sse_cZ 1 3)
            (sse_cZ 2 1) (sse_cZ 2 2) (sse_cZ 2 3)
            (sse_cZ 3 1) (sse_cZ 3 2) (sse_cZ 3 3) (k2 + 1)).headD (0, 0, 0) = sseZVec sseCF1Om (k2 + 1) := by
          have h0 := ih 0 (by omega)
          simp only [Nat.sub_zero] at h0
          cases hL : sse_zHist (sse_cZ 1 1) (sse_cZ 1 2) (sse_cZ 1 3)
              (sse_cZ 2 1) (sse_cZ 2 2) (sse_cZ 2 3)
              (sse_cZ 3 1) (sse_cZ 3 2) (sse_cZ 3 3) (k2 + 1) with
          | nil => rw [hL] at h0; exact h0
          | cons hd tl => rw [hL] at h0; exact h0
        rw [hHead, sse_zVec_step]
      | succ m1 =>
        simp only [sse_zHist, List.getD, List.getElem?_cons_succ]
        have hSub : k2 + 2 - (m1 + 1) = k2 + 1 - m1 := by omega
        rw [hSub]; exact ih m1 (by omega)

/-- Fast single-pass `O(K * M)` exact `Nat` evaluator for `(sseCF1NormSq K W om v, sseCF1QuadTrunc K M W om v)`
    with all `12` slice coefficients computed ONCE! -/
private def sse_cf1FastPair (K M : Nat) (W : Nat → Nat) : Nat × Nat :=
  let c11 := sse_cZ 1 1; let c12 := sse_cZ 1 2; let c13 := sse_cZ 1 3
  let c21 := sse_cZ 2 1; let c22 := sse_cZ 2 2; let c23 := sse_cZ 2 3
  let c31 := sse_cZ 3 1; let c32 := sse_cZ 3 2; let c33 := sse_cZ 3 3
  let cDen := (sse_cDen 1, sse_cDen 2, sse_cDen 3)
  let cSl : Array (Nat × Nat × Nat) := (List.range (M + 1)).map sse_cSlice |>.toArray
  let rec go : Nat → List (Nat × Nat × Nat) → Nat × Nat
    | 0, _ => (0, 0)
    | k + 1, hist =>
      let prevHist := match hist with | _ :: tl => tl | [] => []
      let (dPrev, qPrev) := go k prevHist
      if k ≥ 2 then
        let wk := W k; let wk2 := wk * wk; let w01 := wk * W (k + 1)
        let z1 := hist.getD 1 (0, 0, 0)
        let dK := wk2 * sse_dot3 cDen z1
        let qK := sumNat (M + 1) (fun m =>
          if m < k then
            (match m with | 0 => w01 | _ => wk2) *
              sse_dot3 (cSl.getD m (0, 0, 0)) (hist.getD (match m with | 0 => 1 | _ => m) (0, 0, 0))
          else 0)
        (dPrev + dK, qPrev + qK)
      else (dPrev, qPrev)
  go (K + 1) (sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 K)

private theorem sse_cf1FastPair_eq (K M : Nat) (W : Nat → Nat) :
    sse_cf1FastPair K M W = (sseCF1NormSq K W sseCF1Om sseCF1V, sseCF1QuadTrunc K M W sseCF1Om sseCF1V) := by
  let c11 := sse_cZ 1 1; let c12 := sse_cZ 1 2; let c13 := sse_cZ 1 3
  let c21 := sse_cZ 2 1; let c22 := sse_cZ 2 2; let c23 := sse_cZ 2 3
  let c31 := sse_cZ 3 1; let c32 := sse_cZ 3 2; let c33 := sse_cZ 3 3
  let cSl : Array (Nat × Nat × Nat) := (List.range (M + 1)).map sse_cSlice |>.toArray
  have hCSl : ∀ m : Nat, m < M + 1 → cSl.getD m (0, 0, 0) = sse_cSlice m := by
    intro m hm
    have hLen : ((List.range (M + 1)).map sse_cSlice).length = M + 1 := by simp
    simp only [cSl, Array.getD, Array.size_toArray, hLen, hm, dite_true,
      Array.getElem_toArray, List.getElem_map, List.getElem_range]
  have hTail : ∀ r : Nat,
      (match sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 (r + 1) with | _ :: tl => tl | [] => []) =
      sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 r := by
    intro r; cases r <;> rfl
  have hAux : ∀ n : Nat,
      sse_cf1FastPair.go M W (sse_cDen 1, sse_cDen 2, sse_cDen 3) cSl (n + 1)
        (sse_zHist c11 c12 c13 c21 c22 c23 c31 c32 c33 n) =
      (sseCF1NormSq n W sseCF1Om sseCF1V, sseCF1QuadTrunc n M W sseCF1Om sseCF1V) := by
    intro n; induction n with
    | zero => rfl
    | succ r ih =>
      unfold sse_cf1FastPair.go
      rw [hTail r, ih]
      unfold sseCF1NormSq sseCF1QuadTrunc
      simp only [sumNat]
      if hr2 : r + 1 ≥ 2 then
        rw [sse_ite_pos hr2, sse_ite_pos hr2, sse_ite_pos hr2]
        apply Prod.ext
        · dsimp only
          rw [sse_zHist_getD (r + 1) 1 (by omega), sse_cf1NormSq_term_eq]
        · dsimp only
          apply congrArg (_ + ·)
          have hSum : ∀ t (f g : Nat → Nat), (∀ i, i < t → f i = g i) → sumNat t f = sumNat t g := by
            intro t f g h; induction t with
            | zero => rfl
            | succ p ihp => simp only [sumNat, ihp (fun i hi => h i (by omega)), h p (by omega)]
          apply hSum (M + 1); intro m hm
          if hmk : m < r + 1 then
            rw [sse_ite_pos hmk, sse_ite_pos hmk, hCSl m hm, sse_sliceAt_eq_dot3]
            cases m with
            | zero => rw [sse_zHist_getD (r + 1) 1 (by omega)]
            | succ m1 => rw [sse_zHist_getD (r + 1) (m1 + 1) (by omega)]
          else rw [sse_ite_neg hmk, sse_ite_neg hmk]
      else
        rw [sse_ite_neg hr2, sse_ite_neg hr2, sse_ite_neg hr2]; simp
  exact hAux K

private theorem sse_cf1_witness_verified :
    (∀ o : Fin 57, 0 < sseCF1Om o ∧ 0 < sseCF1V o) ∧
    (let p := sse_cf1FastPair 120 11 sseCF1Win
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
  have hEq := sse_cf1FastPair_eq 120 11 sseCF1Win
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
    - Certified width `387141227/33670000 - 913/80 = 57620709/673400000 < 86/1000` (**`> 10.2×` tighter**
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
    QPos.eq (QPos.add ⟨913, 80, by decide⟩ ⟨57620709, 673400000, by decide⟩) ⟨387141227, 33670000, by decide⟩ ∧
    (57620709 * 1000 < 86 * 673400000 ∧
     10 * (387141227 * 80 - 913 * 33670000) * 278900000 * 1000 <
       (3325977059 * 1000 - 11049 * 278900000) * 33670000 * 80) ∧
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

end Vibe
