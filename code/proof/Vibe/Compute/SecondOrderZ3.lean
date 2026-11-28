module

public import Mathlib.Data.ZMod.Basic
public import Mathlib.Algebra.BigOperators.Group.Finset.Basic
public import Mathlib.Data.Fintype.Prod
public import Mathlib.Data.Fintype.Pi
public import Mathlib.Logic.Function.Iterate
public import Mathlib.Algebra.BigOperators.Ring.Finset
public import Mathlib.Combinatorics.SimpleGraph.Walk.Counting
public import Mathlib.Combinatorics.SimpleGraph.Metric
public import Mathlib.Tactic.Ring
public import Mathlib.Tactic.NormNum
public import Mathlib.Tactic.LinearCombination

/-!
# Second-order Z3 waves (M3-B): bijectivity, time reversal, superposition, the front theorem

Claims A10, A11 and B14 of the models lab. The rule of `code/rule/second-order-z3.ts`:

  s(t+1) = f(s(t)) - s(t-1)   (mod 3), every tile at once,

where a slice `s : V → ZMod 3` holds one residue per tile (0, 1, 2 stand for the tones 0, +1, -1). The state is the
slice pair `(s(t-1), s(t))`. The local laws of the note read the middle slice on a tile and its neighbours:

  f(s)(i) = (sum of s over the neighbours of i) + h(s(i)),

with `h a = self * a` (the two linear laws, self 0 and self 1) or `h a = self * a + a^2` (the square law).

Headline theorems:

1. `thm_soz3_time_reversal`: for EVERY map `f` of slices (local or not, linear or not) and every tile set, running the
   same step on the two slices swapped returns the earlier slice, after any number of steps.
2. `thm_soz3_step_bijective`: the step is a bijection on slice pairs for every `f` and every tile set (A11), with the
   swapped step as its explicit inverse.
3. `thm_soz3_slice_pairs_permuted`: on a finite tile set the step permutes all `3^(2n)` slice pairs; on the 5 tiles of
   the radius-2 line that is all 59,049 pairs (B14, which the exhaustive TypeScript gate walked, superseded by 2).
4. `thm_soz3_linear_superposition`: for both linear laws (any `self`) on any graph with finite neighbourhoods, the
   orbit of a sum of starts is the sum of the orbits, at every step.
5. `thm_soz3_square_breaks_superposition`: the square law breaks superposition on every graph with a tile, for every
   `self` (the note's negative control N2).
6. `thm_soz3_light_cone`: from one source (`s(-1) = 0`, `s(0) = 1` at the origin) under any law
   `f = neighbour sum + h(own)` with `h 0 = 0`, a tile with no walk of length at most `t` from the origin holds 0 in
   both slices of step `t`.
7. `thm_soz3_front_geodesic_count` (A10, the front theorem): under the same hypotheses, a tile with no walk of length
   below `t` holds, at step `t`, the number of walks of length `t` from the origin, mod 3. When that number is nonzero
   the tile is at distance exactly `t` and every one of those walks is a geodesic, so the tone on the front shell at
   step `t` is the geodesic count mod 3.
8. `thm_soz3_front_all_laws`: the front theorem for the three laws of the note (linear self `c`, square self `c`).
9. `thm_soz3_front_simple_graph`: the front theorem on any locally finite `SimpleGraph`: the tone of tile `v` at step
   `G.dist o v` is the number of walks of length `G.dist o v` from `o` to `v` (its geodesics), mod 3.

Graph class: any tile type `V` with decidable equality and a finite neighbour set `nbr i` per tile. Nothing needs
the graph to be finite, symmetric, regular, planar or flat: the front theorem holds on every tiling, hyperbolic or
flat, which is what the note found on every geometry. On a directed neighbour function a "walk" steps from `j` to `i`
when `j ∈ nbr i` (the tiles a tile reads); on a tiling the relation is symmetric and these are ordinary walks.

These theorems speak about the Lean definitions below, which mirror `secondOrderZ3Step` and `geodesicCountsMod3`
line for line; no generated table ties them to the TypeScript yet.
-/

@[expose] public section

set_option autoImplicit false

namespace Vibe
namespace Compute
namespace SecondOrderZ3

open Finset

/-- One slice: a residue mod 3 on every tile. -/
abbrev Slice (V : Type) := V → ZMod 3

/-- A slice pair `(s(t-1), s(t))`. -/
abbrev SlicePair (V : Type) := Slice V × Slice V

/-- One forward step: `(s(t-1), s(t)) ↦ (s(t), f(s(t)) - s(t-1))`. -/
def step {V : Type} (f : Slice V → Slice V) (x : SlicePair V) : SlicePair V :=
  (x.2, f x.2 - x.1)

/-- The explicit inverse: from `(s(t), s(t+1))` recover `(s(t-1), s(t))`. -/
def back {V : Type} (f : Slice V → Slice V) (x : SlicePair V) : SlicePair V :=
  (f x.1 - x.2, x.1)

/-- The local law: neighbour sum plus a function of the tile's own tone. -/
def law {V : Type} (nbr : V → Finset V) (h : ZMod 3 → ZMod 3) : Slice V → Slice V :=
  fun s i => (∑ j ∈ nbr i, s j) + h (s i)

/-- The linear law `f = sum of neighbours + self * own` (self 0 is the reversible wave). -/
def linearLaw {V : Type} (nbr : V → Finset V) (self : ZMod 3) : Slice V → Slice V :=
  law nbr (fun a => self * a)

/-- The square law `f = sum of neighbours + self * own + own^2`. -/
def squareLaw {V : Type} (nbr : V → Finset V) (self : ZMod 3) : Slice V → Slice V :=
  law nbr (fun a => self * a + a ^ 2)

/-- Walks of length `n` from `o` ending at `v`, a walk stepping from `j` to `i` when `j ∈ nbr i`. -/
def walks {V : Type} [DecidableEq V] (nbr : V → Finset V) (o : V) : ℕ → V → ℕ
  | 0, v => if v = o then 1 else 0
  | n + 1, v => ∑ j ∈ nbr v, walks nbr o n j

/-- One source: `s(-1) = 0` everywhere and `s(0) = 1` on the origin tile only. -/
def seed {V : Type} [DecidableEq V] (o : V) : SlicePair V :=
  (0, fun v => if v = o then 1 else 0)

-- [helper]
theorem step_swap {V : Type} (f : Slice V → Slice V) (x : SlicePair V) :
    step f (Prod.swap (step f x)) = Prod.swap x := by
  obtain ⟨p, c⟩ := x
  simp [step]

/-- Exact time reversal, all steps: run the same step on the swapped pair and every earlier slice returns. -/
theorem thm_soz3_time_reversal {V : Type} (f : Slice V → Slice V) (x : SlicePair V) (n : ℕ) :
    step f (Prod.swap (step f x)) = Prod.swap x ∧
      (step f)^[n] (Prod.swap ((step f)^[n] x)) = Prod.swap x := by
  refine ⟨step_swap f x, ?_⟩
  induction n generalizing x with
  | zero => rfl
  | succ n ih =>
    rw [Function.iterate_succ_apply, Function.iterate_succ_apply', step_swap]
    exact ih x

/-- A11: the second-order step is a bijection on slice pairs for every `f` and every tile set, with `back` as its
two-sided inverse. -/
theorem thm_soz3_step_bijective {V : Type} (f : Slice V → Slice V) :
    (∀ x, back f (step f x) = x) ∧ (∀ y, step f (back f y) = y) ∧ Function.Bijective (step f) := by
  have h1 : ∀ x, back f (step f x) = x := by
    rintro ⟨p, c⟩
    simp [back, step]
  have h2 : ∀ y, step f (back f y) = y := by
    rintro ⟨c, n⟩
    simp [back, step]
  exact ⟨h1, h2, ⟨Function.LeftInverse.injective h1, Function.RightInverse.surjective h2⟩⟩

/-- The step as a permutation of slice pairs. -/
def stepEquiv {V : Type} (f : Slice V → Slice V) : SlicePair V ≃ SlicePair V where
  toFun := step f
  invFun := back f
  left_inv := (thm_soz3_step_bijective f).1
  right_inv := (thm_soz3_step_bijective f).2.1

/-- B14 from A11: on a finite tile set the step permutes all `3^(2n)` slice pairs; on the 5 tiles of the radius-2
line, all 59,049. -/
theorem thm_soz3_slice_pairs_permuted :
    (∀ (V : Type) [Fintype V] [DecidableEq V] (f : Slice V → Slice V),
      Function.Bijective (step f) ∧ Fintype.card (SlicePair V) = 3 ^ (2 * Fintype.card V)) ∧
    (∀ f : Slice (Fin 5) → Slice (Fin 5),
      Function.Bijective (step f) ∧ Fintype.card (SlicePair (Fin 5)) = 59049) := by
  have hc : ∀ (V : Type) [Fintype V] [DecidableEq V],
      Fintype.card (SlicePair V) = 3 ^ (2 * Fintype.card V) := by
    intro V _ _
    rw [Fintype.card_prod, Fintype.card_fun, ZMod.card, ← pow_add, two_mul]
  refine ⟨fun V _ _ f => ⟨(thm_soz3_step_bijective f).2.2, hc V⟩, fun f => ⟨(thm_soz3_step_bijective f).2.2, ?_⟩⟩
  rw [hc (Fin 5), Fintype.card_fin]
  norm_num

-- [helper]
theorem step_add_of_additive {V : Type} (f : Slice V → Slice V) (hf : ∀ a b, f (a + b) = f a + f b)
    (x y : SlicePair V) : step f (x + y) = step f x + step f y := by
  obtain ⟨p, c⟩ := x
  obtain ⟨q, d⟩ := y
  simp only [step, Prod.mk_add_mk, hf]
  exact Prod.ext rfl (sub_add_sub_comm (f c) p (f d) q).symm

-- [helper]
theorem iterate_add_of_additive {V : Type} (f : Slice V → Slice V) (hf : ∀ a b, f (a + b) = f a + f b)
    (x y : SlicePair V) (n : ℕ) : (step f)^[n] (x + y) = (step f)^[n] x + (step f)^[n] y := by
  induction n with
  | zero => rfl
  | succ n ih =>
    rw [Function.iterate_succ_apply', Function.iterate_succ_apply', Function.iterate_succ_apply', ih,
      step_add_of_additive f hf]

-- [helper]
theorem linearLaw_additive {V : Type} (nbr : V → Finset V) (self : ZMod 3) (a b : Slice V) :
    linearLaw nbr self (a + b) = linearLaw nbr self a + linearLaw nbr self b := by
  funext i
  simp only [linearLaw, law, Pi.add_apply, Finset.sum_add_distrib]
  ring

/-- Superposition for both linear laws (any `self`), any graph with finite neighbourhoods, every step. -/
theorem thm_soz3_linear_superposition {V : Type} (nbr : V → Finset V) (self : ZMod 3) (x y : SlicePair V)
    (n : ℕ) :
    (step (linearLaw nbr self))^[n] (x + y) =
      (step (linearLaw nbr self))^[n] x + (step (linearLaw nbr self))^[n] y :=
  iterate_add_of_additive _ (linearLaw_additive nbr self) x y n

/-- The square law breaks superposition after one step, on every graph with a tile and for every `self`: the start
`(0, 1)` (tone `+1` on every tile) added to itself already disagrees on any tile. -/
theorem thm_soz3_square_breaks_superposition {V : Type} (nbr : V → Finset V) (self : ZMod 3) (v : V) :
    step (squareLaw nbr self) ((0, 1) + (0, 1)) ≠
      step (squareLaw nbr self) (0, 1) + step (squareLaw nbr self) (0, 1) := by
  intro H
  have hv := congrArg (fun p : SlicePair V => p.2 v) H
  simp only [step, squareLaw, law, Prod.mk_add_mk, Pi.add_apply, Pi.one_apply, sub_zero, add_zero,
    Finset.sum_add_distrib] at hv
  have key : (2 : ZMod 3) = 0 := by linear_combination hv
  exact absurd key (by decide)

-- [helper]
theorem walks_nbr_zero {V : Type} [DecidableEq V] (nbr : V → Finset V) (o v j : V) (k : ℕ)
    (hv : walks nbr o (k + 1) v = 0) (hj : j ∈ nbr v) : walks nbr o k j = 0 := by
  simp only [walks] at hv
  exact (Finset.sum_eq_zero_iff.mp hv) j hj

/-- Light cone from one source: under any law `neighbour sum + h(own)` with `h 0 = 0`, a tile with no walk of length
at most `t` from the origin holds 0 in both slices of step `t`. -/
theorem thm_soz3_light_cone {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0)
    (o : V) (t : ℕ) (v : V) (hfar : ∀ k ≤ t, walks nbr o k v = 0) :
    ((step (law nbr h))^[t] (seed o)).1 v = 0 ∧ ((step (law nbr h))^[t] (seed o)).2 v = 0 := by
  induction t generalizing v with
  | zero =>
    have h00 := hfar 0 le_rfl
    simp only [walks] at h00
    by_cases hvo : v = o
    · simp [hvo] at h00
    · simp [seed, hvo]
  | succ t ih =>
    have hprev := ih v (fun k hk => hfar k (Nat.le_succ_of_le hk))
    rw [Function.iterate_succ_apply']
    refine ⟨hprev.2, ?_⟩
    have hsum : ∑ j ∈ nbr v, ((step (law nbr h))^[t] (seed o)).2 j = 0 := by
      refine Finset.sum_eq_zero (fun j hj => (ih j (fun k hk => ?_)).2)
      exact walks_nbr_zero nbr o v j k (hfar (k + 1) (Nat.succ_le_succ hk)) hj
    simp only [step, law, Pi.sub_apply, hsum, hprev.1, hprev.2, h0, add_zero, sub_zero]

/-- A10, the front theorem: from one source under any law `neighbour sum + h(own)` with `h 0 = 0` (every law of the
note), a tile with no walk of length below `t` from the origin holds, at step `t`, the number of walks of length `t`
from the origin, mod 3. When that number is nonzero the tile lies at distance exactly `t`, each such walk is a
geodesic, and the tone is the geodesic count mod 3. Any tile type with finite neighbour sets. -/
theorem thm_soz3_front_geodesic_count {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3)
    (h0 : h 0 = 0) (o : V) (t : ℕ) (v : V) (hfar : ∀ k < t, walks nbr o k v = 0) :
    ((step (law nbr h))^[t] (seed o)).2 v = (walks nbr o t v : ZMod 3) := by
  induction t generalizing v with
  | zero =>
    by_cases hvo : v = o
    · simp [seed, walks, hvo]
    · simp [seed, walks, hvo]
  | succ t ih =>
    have hcone := thm_soz3_light_cone nbr h h0 o t v (fun k hk => hfar k (Nat.lt_succ_of_le hk))
    rw [Function.iterate_succ_apply']
    have hsum : ∑ j ∈ nbr v, ((step (law nbr h))^[t] (seed o)).2 j =
        ∑ j ∈ nbr v, ((walks nbr o t j : ℕ) : ZMod 3) := by
      refine Finset.sum_congr rfl (fun j hj => ih j (fun k hk => ?_))
      exact walks_nbr_zero nbr o v j k (hfar (k + 1) (Nat.succ_lt_succ hk)) hj
    simp only [step, law, Pi.sub_apply, hsum, hcone.1, hcone.2, h0, add_zero, sub_zero, walks, Nat.cast_sum]

/-- The front theorem for the three laws of the note: linear with any `self` (self 0 and self 1) and square with any
`self`. -/
theorem thm_soz3_front_all_laws {V : Type} [DecidableEq V] (nbr : V → Finset V) (self : ZMod 3) (o : V) (t : ℕ)
    (v : V) (hfar : ∀ k < t, walks nbr o k v = 0) :
    ((step (linearLaw nbr self))^[t] (seed o)).2 v = (walks nbr o t v : ZMod 3) ∧
      ((step (squareLaw nbr self))^[t] (seed o)).2 v = (walks nbr o t v : ZMod 3) :=
  ⟨thm_soz3_front_geodesic_count nbr _ (by simp) o t v hfar,
    thm_soz3_front_geodesic_count nbr _ (by simp) o t v hfar⟩

/-! ### The front theorem in Mathlib's graph vocabulary -/

-- [helper]
theorem walks_eq_card_finsetWalkLength {V : Type} [DecidableEq V] (G : SimpleGraph V) [G.LocallyFinite]
    (o : V) (n : ℕ) (v : V) :
    walks (fun i => G.neighborFinset i) o n v = (G.finsetWalkLength n v o).card := by
  induction n generalizing v with
  | zero =>
    by_cases hvo : v = o
    · subst hvo
      simp [walks, SimpleGraph.finsetWalkLength]
    · simp [walks, SimpleGraph.finsetWalkLength, hvo]
  | succ n ih =>
    simp only [walks, SimpleGraph.finsetWalkLength, ih]
    rw [Finset.card_biUnion]
    · simp only [Finset.card_map, SimpleGraph.neighborFinset_def]
      exact Finset.sum_subtype _ (fun x => Set.mem_toFinset) _
    · rintro ⟨x, hx⟩ - ⟨y, hy⟩ - hxy
      rw [Function.onFun, disjoint_iff_inf_le]
      intro p hp
      simp only [Finset.inf_eq_inter, Finset.mem_inter, Finset.mem_map] at hp
      obtain ⟨⟨px, _, rfl⟩, ⟨py, hpy, hp⟩⟩ := hp
      cases hp
      simp at hxy

-- [helper]
theorem card_walks_reverse {V : Type} [DecidableEq V] (G : SimpleGraph V) [G.LocallyFinite] (o v : V) (n : ℕ) :
    (G.finsetWalkLength n v o).card = Fintype.card {p : G.Walk o v | p.length = n} := by
  rw [← SimpleGraph.card_set_walk_length_eq]
  exact Fintype.card_congr
    { toFun := fun p => ⟨p.1.reverse, (SimpleGraph.Walk.length_reverse _).trans p.2⟩
      invFun := fun p => ⟨p.1.reverse, (SimpleGraph.Walk.length_reverse _).trans p.2⟩
      left_inv := fun p => by simp
      right_inv := fun p => by simp }

/-- A10 on any locally finite `SimpleGraph` (every tiling, flat or hyperbolic), read off the neighbour sets: from one
source under any law `neighbour sum + h(own)` with `h 0 = 0`, the tone of a tile `v` at step `G.dist o v` is the
number of walks from `o` to `v` of length `G.dist o v`, which are exactly its geodesics, mod 3. (For a tile the
origin cannot reach, Mathlib's `dist` is 0 and both sides are 0.) -/
theorem thm_soz3_front_simple_graph {V : Type} [DecidableEq V] (G : SimpleGraph V) [G.LocallyFinite]
    (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0) (o v : V) :
    ((step (law (fun i => G.neighborFinset i) h))^[G.dist o v] (seed o)).2 v =
      (Fintype.card {p : G.Walk o v | p.length = G.dist o v} : ZMod 3) := by
  rw [thm_soz3_front_geodesic_count _ h h0 o (G.dist o v) v, walks_eq_card_finsetWalkLength,
    card_walks_reverse]
  intro k hk
  rw [walks_eq_card_finsetWalkLength, Finset.card_eq_zero, Finset.eq_empty_iff_forall_notMem]
  intro p hp
  have hlen : p.length = k := SimpleGraph.mem_finsetWalkLength_iff.mp hp
  have hle := SimpleGraph.dist_le p.reverse
  rw [SimpleGraph.Walk.length_reverse, hlen] at hle
  omega

end SecondOrderZ3
end Compute
end Vibe

end
