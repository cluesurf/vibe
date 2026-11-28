module

public import Mathlib.Data.Fintype.Card
public import Mathlib.Data.Fintype.EquivFin
public import Mathlib.Data.Fintype.Prod
public import Mathlib.Data.Fintype.BigOperators

/-!
# Selection lemmas of level 6 (intelligence, Lean item I01)

Pure combinatorics, no mesh definitions. Score levels are the natural numbers `0, ..., L - 1`,
strictly ordered. The evaluator writes candidate A's level through a code `cA : ℕ → α` and
candidate B's through `cB : ℕ → β`, chosen independently. The read `f : α → β → Bool` sees only
the two written values and returns `true` when it holds A's content, `false` when it holds B's.

* `IsSelector L cA cB f`: on every strictly ordered pair of levels the read picks the better
  candidate.
* `IsTieSelector L cA cB f`: the same, and on every tied pair it keeps A (the incumbent).

Headline theorems:

1. Lemma S (`thm_sel_lemma_s`): with `L ≥ 3` levels no read that depends on one candidate's
   score alone, and no constant, is a selector. `thm_sel_lemma_s_two_levels`: with `L = 2`,
   `sA ? A : B` is one.
2. Lemma K (`thm_sel_lemma_k`): a selector whose codes take `a` values on A's levels and `b` on
   B's orders at most `min (a + b - 1) (min (2a) (2b))` levels, for any value types. Attained
   for every `a, b` (`thm_sel_lemma_k_attained`, and on any nonempty finite types of those
   sizes, `thm_sel_lemma_k_attained_card`). Corollaries: `k` occupancy-blind score cells
   (alphabet `Fin k → Bool`) give exactly `2 ^ (k + 1) - 1` levels (`thm_sel_blind_levels`;
   3 for one cell, 7 for two, `thm_sel_lemma_k_blind_three_seven`), `k` trit cells (alphabet
   `Fin k → Fin 3`) exactly `2 * 3 ^ k - 1` (`thm_sel_trit_levels`; 5 for one, 17 for two,
   `thm_sel_lemma_k_trit_five_seventeen`). Lemma S is also the case `b = 1` of Lemma K.
3. Lemma T (`thm_sel_lemma_t`): a tie-holding selector has both codes one-to-one on the levels,
   so `L ≤ a` and `L ≤ b`; with `L` equal to the alphabet size both codes are bijections onto
   it. One occupancy-blind cell (`Bool`) holds ties for A at two levels at most. The bound is
   attained (`thm_sel_lemma_t_attained`).

These speak about abstract codes and reads. Which mesh layouts realize them (the census of
level6, the width-6 absence of a tie-holding three-level selector) stays an experiment.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe
namespace Selection

open Finset

/-- A selector for `L` strictly ordered levels: on every pair of distinct levels the read holds
the better candidate (`true` for A). -/
def IsSelector {α β : Type*} (L : ℕ) (cA : ℕ → α) (cB : ℕ → β) (f : α → β → Bool) : Prop :=
  ∀ i j, i < L → j < L → i ≠ j → f (cA i) (cB j) = decide (j < i)

/-- A tie-holding selector: the better candidate on strictly ordered pairs, A on ties. -/
def IsTieSelector {α β : Type*} (L : ℕ) (cA : ℕ → α) (cB : ℕ → β) (f : α → β → Bool) : Prop :=
  ∀ i j, i < L → j < L → f (cA i) (cB j) = decide (j ≤ i)

/-! ## Lemma S -/

/-- Lemma S, A side: with three or more levels no read of A's score alone is a selector. -/
private theorem sel_s_a {α β : Type*} (L : ℕ) (hL : 3 ≤ L) (cA : ℕ → α) (cB : ℕ → β)
    (g : α → Bool) : ¬ IsSelector L cA cB (fun x _ => g x) := by
  intro h
  have h1 := h 1 0 (by omega) (by omega) (by omega)
  have h2 := h 1 2 (by omega) (by omega) (by omega)
  simp only at h1 h2
  rw [h1, decide_eq_true (by omega : 0 < 1), decide_eq_false (by omega : ¬ 2 < 1)] at h2
  cases h2

/-- Lemma S, B side: with three or more levels no read of B's score alone is a selector. -/
private theorem sel_s_b {α β : Type*} (L : ℕ) (hL : 3 ≤ L) (cA : ℕ → α) (cB : ℕ → β)
    (g : β → Bool) : ¬ IsSelector L cA cB (fun _ y => g y) := by
  intro h
  have h1 := h 2 1 (by omega) (by omega) (by omega)
  have h2 := h 0 1 (by omega) (by omega) (by omega)
  simp only at h1 h2
  rw [h1, decide_eq_true (by omega : 1 < 2), decide_eq_false (by omega : ¬ 1 < 0)] at h2
  cases h2

/-- **Lemma S.** With `L ≥ 3` strictly ordered levels, no selector depends on A's score alone,
none on B's score alone, and no constant is a selector, whatever the codes. -/
theorem thm_sel_lemma_s {α β : Type*} (L : ℕ) (hL : 3 ≤ L) (cA : ℕ → α) (cB : ℕ → β) :
    (∀ g : α → Bool, ¬ IsSelector L cA cB (fun x _ => g x)) ∧
    (∀ g : β → Bool, ¬ IsSelector L cA cB (fun _ y => g y)) ∧
    (∀ c : Bool, ¬ IsSelector L cA cB (fun _ _ => c)) :=
  ⟨sel_s_a L hL cA cB, sel_s_b L hL cA cB, fun c => sel_s_a L hL cA cB (fun _ => c)⟩

/-- **Lemma S, the two-level case.** With `L = 2` the read `sA ? A : B` (A's score written as a
bit, B's score ignored) is a selector, whatever B's code. -/
theorem thm_sel_lemma_s_two_levels {β : Type*} (cB : ℕ → β) :
    IsSelector 2 (fun i => decide (i = 1)) cB (fun sA _ => sA) := by
  intro i j hi hj hij
  have : (i = 0 ∧ j = 1) ∨ (i = 1 ∧ j = 0) := by omega
  rcases this with ⟨rfl, rfl⟩ | ⟨rfl, rfl⟩ <;> rfl

/-! ## Lemma K -/

/-- Levels whose code equals the next level's code. -/
def mergeSet {γ : Type*} [DecidableEq γ] (c : ℕ → γ) (L : ℕ) : Finset ℕ :=
  (range L).filter (fun i => i + 1 < L ∧ c i = c (i + 1))

/-- Levels whose code differs from the next level's code (or the last level). -/
def keepSet {γ : Type*} [DecidableEq γ] (c : ℕ → γ) (L : ℕ) : Finset ℕ :=
  (range L).filter (fun i => ¬ (i + 1 < L ∧ c i = c (i + 1)))

/-- A code merges only adjacent levels: two levels with one written value differ by one. -/
def OnlyAdjacentMerges {γ : Type*} (c : ℕ → γ) (L : ℕ) : Prop :=
  ∀ i i', i < i' → i' < L → c i = c i' → i' = i + 1

/-- Counting for a code that merges only adjacent levels: `L ≤ a + #merges` and `L ≤ 2 a`. -/
private theorem merge_count {γ : Type*} [DecidableEq γ] (c : ℕ → γ) (L : ℕ)
    (hadj : OnlyAdjacentMerges c L) :
    L ≤ ((range L).image c).card + (mergeSet c L).card ∧
      L ≤ 2 * ((range L).image c).card := by
  have hsplit : (mergeSet c L).card + (keepSet c L).card = L := by
    unfold mergeSet keepSet
    rw [Finset.card_filter_add_card_filter_not, card_range]
  have hinj : Set.InjOn c (keepSet c L : Set ℕ) := by
    intro i hi i' hi' heq
    have hi2 := Finset.mem_coe.1 hi
    have hi2' := Finset.mem_coe.1 hi'
    simp only [keepSet, mem_filter, mem_range] at hi2 hi2'
    rcases lt_trichotomy i i' with hlt | heq' | hgt
    · have e := hadj i i' hlt hi2'.1 heq
      subst e
      exact absurd ⟨hi2'.1, heq⟩ hi2.2
    · exact heq'
    · have e := hadj i' i hgt hi2.1 heq.symm
      subst e
      exact absurd ⟨hi2.1, heq.symm⟩ hi2'.2
  have hkeep : (keepSet c L).card ≤ ((range L).image c).card := by
    rw [← card_image_of_injOn hinj]
    apply card_le_card
    apply image_subset_image
    exact filter_subset _ _
  have hmerge : (mergeSet c L).card ≤ (keepSet c L).card := by
    apply card_le_card_of_injOn (fun i => i + 1)
    · intro i hi
      have hi2 := Finset.mem_coe.1 hi
      simp only [mergeSet, mem_filter, mem_range] at hi2
      show i + 1 ∈ keepSet c L
      simp only [keepSet, mem_filter, mem_range]
      refine ⟨hi2.2.1, ?_⟩
      rintro ⟨h2, h3⟩
      have := hadj i (i + 1 + 1) (by omega) h2 (hi2.2.2.trans h3)
      omega
    · intro x _ y _ hxy
      simp only at hxy
      omega
  constructor <;> omega

/-- In a selector, A's code merges only adjacent levels. -/
private theorem sel_adj_a {α β : Type*} (L : ℕ) (cA : ℕ → α) (cB : ℕ → β) (f : α → β → Bool)
    (h : IsSelector L cA cB f) : OnlyAdjacentMerges cA L := by
  intro i i' hlt hi' heq
  by_contra hne
  have h1 := h i (i + 1) (by omega) (by omega) (by omega)
  have h2 := h i' (i + 1) hi' (by omega) (by omega)
  rw [heq] at h1
  rw [h1, decide_eq_false (by omega : ¬ i + 1 < i), decide_eq_true (by omega : i + 1 < i')] at h2
  cases h2

/-- In a selector, B's code merges only adjacent levels. -/
private theorem sel_adj_b {α β : Type*} (L : ℕ) (cA : ℕ → α) (cB : ℕ → β) (f : α → β → Bool)
    (h : IsSelector L cA cB f) : OnlyAdjacentMerges cB L := by
  intro j j' hlt hj' heq
  by_contra hne
  have h1 := h (j + 1) j (by omega) (by omega) (by omega)
  have h2 := h (j + 1) j' (by omega) hj' (by omega)
  rw [heq] at h1
  rw [h1, decide_eq_true (by omega : j < j + 1), decide_eq_false (by omega : ¬ j' < j + 1)] at h2
  cases h2

/-- In a selector, A and B never merge the same adjacent pair of levels. -/
private theorem sel_no_double {α β : Type*} (L : ℕ) (cA : ℕ → α) (cB : ℕ → β)
    (f : α → β → Bool) (h : IsSelector L cA cB f) (i : ℕ) (hi : i + 1 < L)
    (hA : cA i = cA (i + 1)) (hB : cB i = cB (i + 1)) : False := by
  have h1 := h i (i + 1) (by omega) hi (by omega)
  have h2 := h (i + 1) i hi (by omega) (by omega)
  rw [hA, ← hB] at h1
  rw [h1, decide_eq_false (by omega : ¬ i + 1 < i), decide_eq_true (by omega : i < i + 1)] at h2
  cases h2

/-- **Lemma K (the alphabet bound).** If a selector's codes take `a` distinct values on A's
levels and `b` on B's, then `L ≤ min (a + b - 1) (min (2 a) (2 b))`. Any value types, any read. -/
theorem thm_sel_lemma_k {α β : Type*} [DecidableEq α] [DecidableEq β] (L : ℕ) (cA : ℕ → α)
    (cB : ℕ → β) (f : α → β → Bool) (h : IsSelector L cA cB f) :
    L ≤ min (((range L).image cA).card + ((range L).image cB).card - 1)
      (min (2 * ((range L).image cA).card) (2 * ((range L).image cB).card)) := by
  obtain ⟨hA1, hA2⟩ := merge_count cA L (sel_adj_a L cA cB f h)
  obtain ⟨hB1, hB2⟩ := merge_count cB L (sel_adj_b L cA cB f h)
  have hdisj : Disjoint (mergeSet cA L) (mergeSet cB L) := by
    rw [Finset.disjoint_left]
    intro i hiA hiB
    simp only [mergeSet, mem_filter, mem_range] at hiA hiB
    exact sel_no_double L cA cB f h i hiA.2.1 hiA.2.2 hiB.2.2
  have hsub : mergeSet cA L ∪ mergeSet cB L ⊆ range (L - 1) := by
    intro i hi
    rw [mem_union] at hi
    rw [mem_range]
    rcases hi with hi | hi <;> simp only [mergeSet, mem_filter, mem_range] at hi <;> omega
  have hcard := card_le_card hsub
  rw [card_union_of_disjoint hdisj, card_range] at hcard
  omega

/-- **Lemma K on finite alphabets.** `L ≤ min (|α| + |β| - 1) (min (2 |α|) (2 |β|))`. -/
theorem thm_sel_lemma_k_card {α β : Type*} [Fintype α] [Fintype β] (L : ℕ) (cA : ℕ → α)
    (cB : ℕ → β) (f : α → β → Bool) (h : IsSelector L cA cB f) :
    L ≤ min (Fintype.card α + Fintype.card β - 1)
      (min (2 * Fintype.card α) (2 * Fintype.card β)) := by
  classical
  have hk := thm_sel_lemma_k L cA cB f h
  have ha : ((range L).image cA).card ≤ Fintype.card α := card_le_univ _
  have hb : ((range L).image cB).card ≤ Fintype.card β := card_le_univ _
  omega

/-! ## Lemma K is attained -/

/-- A nondecreasing code that merges the `m` adjacent pairs `{p + 2t, p + 2t + 1}`, `t < m`. -/
def mergeCode (p m i : ℕ) : ℕ := if i < 2 * m + p then (i + p) / 2 else i - m

private theorem mergeCode_eq (p m i i' : ℕ) (hp : p ≤ 1) (h : mergeCode p m i = mergeCode p m i') :
    i = i' ∨ (i' = i + 1 ∧ i % 2 = p) ∨ (i = i' + 1 ∧ i' % 2 = p) := by
  unfold mergeCode at h
  split_ifs at h <;> omega

private theorem mergeCode_lt (p m L i : ℕ) (hp : p ≤ 1) (hi : i < L)
    (hm : m = 0 ∨ 2 * m + p ≤ L) : mergeCode p m i < L - m := by
  unfold mergeCode
  split_ifs <;> omega

open Classical in
/-- The read that answers A exactly when some strictly ordered pair with A ahead writes these
two values. -/
noncomputable def existsRead {α β : Type*} (L : ℕ) (cA : ℕ → α) (cB : ℕ → β) (x : α) (y : β) :
    Bool :=
  decide (∃ i j, i < L ∧ j < L ∧ j < i ∧ cA i = x ∧ cB j = y)

/-- Codes with no conflicting pair of written values admit a selector. -/
private theorem selector_of_no_conflict {α β : Type*} (L : ℕ) (cA : ℕ → α) (cB : ℕ → β)
    (hnc : ∀ i j i' j', i < j → j' < i' → cA i = cA i' → cB j = cB j' → False) :
    IsSelector L cA cB (existsRead L cA cB) := by
  classical
  intro i j hi hj hij
  unfold existsRead
  rcases Nat.lt_or_gt_of_ne hij with hlt | hlt
  · rw [decide_eq_false (by omega : ¬ j < i)]
    apply decide_eq_false
    rintro ⟨i', j', _, _, hlt', e1, e2⟩
    exact hnc i j i' j' hlt hlt' e1.symm e2.symm
  · rw [decide_eq_true (show j < i from hlt)]
    exact decide_eq_true ⟨i, j, hi, hj, hlt, rfl, rfl⟩

private theorem merge_no_conflict (pA pB mA mB : ℕ) (hpA : pA ≤ 1) (hpB : pB ≤ 1)
    (hne : pA ≠ pB) (i j i' j' : ℕ) (hij : i < j) (hji : j' < i')
    (eA : mergeCode pA mA i = mergeCode pA mA i') (eB : mergeCode pB mB j = mergeCode pB mB j') :
    False := by
  rcases mergeCode_eq pA mA i i' hpA eA with h | h | h <;>
    rcases mergeCode_eq pB mB j j' hpB eB with h' | h' | h' <;> omega

/-- A selector for any `L ≤ min (a + b - 1) (min (2a) (2b))` with A's code below `a` and B's
code below `b` on every level. -/
private theorem attained_le (a b L : ℕ) (h1 : L ≤ a + b - 1) (h2 : L ≤ 2 * a) (h3 : L ≤ 2 * b) :
    ∃ (cA cB : ℕ → ℕ) (f : ℕ → ℕ → Bool), IsSelector L cA cB f ∧
      (∀ i, i < L → cA i < a) ∧ (∀ i, i < L → cB i < b) := by
  rcases le_total a b with hab | hab
  · refine ⟨mergeCode 0 (L - a), mergeCode 1 (L - b),
      existsRead L (mergeCode 0 (L - a)) (mergeCode 1 (L - b)), ?_, ?_, ?_⟩
    · exact selector_of_no_conflict L _ _ (merge_no_conflict 0 1 (L - a) (L - b) (by omega)
        (by omega) (by omega))
    · intro i hi
      have := mergeCode_lt 0 (L - a) L i (by omega) hi (by omega)
      omega
    · intro i hi
      have := mergeCode_lt 1 (L - b) L i (by omega) hi (by omega)
      omega
  · refine ⟨mergeCode 1 (L - a), mergeCode 0 (L - b),
      existsRead L (mergeCode 1 (L - a)) (mergeCode 0 (L - b)), ?_, ?_, ?_⟩
    · exact selector_of_no_conflict L _ _ (merge_no_conflict 1 0 (L - a) (L - b) (by omega)
        (by omega) (by omega))
    · intro i hi
      have := mergeCode_lt 1 (L - a) L i (by omega) hi (by omega)
      omega
    · intro i hi
      have := mergeCode_lt 0 (L - b) L i (by omega) hi (by omega)
      omega

/-- **Lemma K is attained.** For every `a, b` some selector orders exactly
`L = min (a + b - 1) (min (2a) (2b))` levels with A's code taking at most `a` values and B's at
most `b` (A merges levels at one parity, B at the other). -/
theorem thm_sel_lemma_k_attained (a b : ℕ) :
    ∃ (cA cB : ℕ → ℕ) (f : ℕ → ℕ → Bool),
      IsSelector (min (a + b - 1) (min (2 * a) (2 * b))) cA cB f ∧
      ((range (min (a + b - 1) (min (2 * a) (2 * b)))).image cA).card ≤ a ∧
      ((range (min (a + b - 1) (min (2 * a) (2 * b)))).image cB).card ≤ b := by
  obtain ⟨cA, cB, f, hs, hA, hB⟩ :=
    attained_le a b (min (a + b - 1) (min (2 * a) (2 * b))) (min_le_left _ _)
      ((min_le_right _ _).trans (min_le_left _ _)) ((min_le_right _ _).trans (min_le_right _ _))
  refine ⟨cA, cB, f, hs, ?_, ?_⟩
  · calc _ ≤ (range a).card := by
          apply card_le_card
          intro x hx
          obtain ⟨i, hi, rfl⟩ := mem_image.1 hx
          exact mem_range.2 (hA i (mem_range.1 hi))
      _ = a := card_range a
  · calc _ ≤ (range b).card := by
          apply card_le_card
          intro x hx
          obtain ⟨i, hi, rfl⟩ := mem_image.1 hx
          exact mem_range.2 (hB i (mem_range.1 hi))
      _ = b := card_range b

/-- **Lemma K is attained on any nonempty finite alphabets**: every
`L ≤ min (|α| + |β| - 1) (min (2 |α|) (2 |β|))` has a selector with codes into `α` and `β`. -/
theorem thm_sel_lemma_k_attained_card (α β : Type*) [Fintype α] [Fintype β] [Nonempty α]
    [Nonempty β] (L : ℕ) (h1 : L ≤ Fintype.card α + Fintype.card β - 1)
    (h2 : L ≤ 2 * Fintype.card α) (h3 : L ≤ 2 * Fintype.card β) :
    ∃ (cA : ℕ → α) (cB : ℕ → β) (f : α → β → Bool), IsSelector L cA cB f := by
  obtain ⟨cA, cB, f, hs, hA, hB⟩ := attained_le _ _ L h1 h2 h3
  have ha : 0 < Fintype.card α := Fintype.card_pos
  have hb : 0 < Fintype.card β := Fintype.card_pos
  refine ⟨fun i => (Fintype.equivFin α).symm ⟨cA i % Fintype.card α, Nat.mod_lt _ ha⟩,
    fun j => (Fintype.equivFin β).symm ⟨cB j % Fintype.card β, Nat.mod_lt _ hb⟩,
    fun x y => f (Fintype.equivFin α x).val (Fintype.equivFin β y).val, ?_⟩
  intro i j hi hj hij
  simp only [Equiv.apply_symm_apply]
  rw [Nat.mod_eq_of_lt (hA i hi), Nat.mod_eq_of_lt (hB j hj)]
  exact hs i j hi hj hij

/-- **Lemma K for `k` occupancy-blind score cells** (each cell read as one bit): at most
`2 ^ (k + 1) - 1` levels, and that many are attained. -/
theorem thm_sel_blind_levels (k : ℕ) :
    (∀ (L : ℕ) (cA cB : ℕ → (Fin k → Bool)) (f : (Fin k → Bool) → (Fin k → Bool) → Bool),
      IsSelector L cA cB f → L ≤ 2 ^ (k + 1) - 1) ∧
    ∃ (cA cB : ℕ → (Fin k → Bool)) (f : (Fin k → Bool) → (Fin k → Bool) → Bool),
      IsSelector (2 ^ (k + 1) - 1) cA cB f := by
  have hc : Fintype.card (Fin k → Bool) = 2 ^ k := by
    rw [Fintype.card_fun, Fintype.card_bool, Fintype.card_fin]
  have hp : 2 ^ (k + 1) = 2 * 2 ^ k := by rw [pow_succ]; omega
  refine ⟨fun L cA cB f h => ?_, ?_⟩
  · have := thm_sel_lemma_k_card L cA cB f h
    rw [hc] at this
    omega
  · apply thm_sel_lemma_k_attained_card <;> rw [hc] <;> omega

/-- **Lemma K for `k` trit score cells**: at most `2 * 3 ^ k - 1` levels, and that many are
attained. -/
theorem thm_sel_trit_levels (k : ℕ) :
    (∀ (L : ℕ) (cA cB : ℕ → (Fin k → Fin 3)) (f : (Fin k → Fin 3) → (Fin k → Fin 3) → Bool),
      IsSelector L cA cB f → L ≤ 2 * 3 ^ k - 1) ∧
    ∃ (cA cB : ℕ → (Fin k → Fin 3)) (f : (Fin k → Fin 3) → (Fin k → Fin 3) → Bool),
      IsSelector (2 * 3 ^ k - 1) cA cB f := by
  have hc : Fintype.card (Fin k → Fin 3) = 3 ^ k := by
    rw [Fintype.card_fun, Fintype.card_fin, Fintype.card_fin]
  have hpos : 0 < 3 ^ k := Nat.pow_pos (by decide)
  refine ⟨fun L cA cB f h => ?_, ?_⟩
  · have := thm_sel_lemma_k_card L cA cB f h
    rw [hc] at this
    omega
  · apply thm_sel_lemma_k_attained_card <;> rw [hc] <;> omega

/-- **Corollary of Lemma K, occupancy-blind cells** (a score cell read as one bit, `Bool`): one
cell orders at most 3 levels, two cells (`Bool × Bool`) at most 7, and both are attained. -/
theorem thm_sel_lemma_k_blind_three_seven :
    ((∀ (L : ℕ) (cA cB : ℕ → Bool) (f : Bool → Bool → Bool), IsSelector L cA cB f → L ≤ 3) ∧
      ∃ (cA cB : ℕ → Bool) (f : Bool → Bool → Bool), IsSelector 3 cA cB f) ∧
    ((∀ (L : ℕ) (cA cB : ℕ → Bool × Bool) (f : Bool × Bool → Bool × Bool → Bool),
        IsSelector L cA cB f → L ≤ 7) ∧
      ∃ (cA cB : ℕ → Bool × Bool) (f : Bool × Bool → Bool × Bool → Bool),
        IsSelector 7 cA cB f) := by
  have c1 : Fintype.card Bool = 2 := Fintype.card_bool
  have c2 : Fintype.card (Bool × Bool) = 4 := by rw [Fintype.card_prod, c1]
  refine ⟨⟨fun L cA cB f h => ?_, ?_⟩, ⟨fun L cA cB f h => ?_, ?_⟩⟩
  · have := thm_sel_lemma_k_card L cA cB f h
    rw [c1] at this
    omega
  · exact thm_sel_lemma_k_attained_card Bool Bool 3 (by rw [c1]) (by rw [c1]; omega)
      (by rw [c1]; omega)
  · have := thm_sel_lemma_k_card L cA cB f h
    rw [c2] at this
    omega
  · exact thm_sel_lemma_k_attained_card (Bool × Bool) (Bool × Bool) 7 (by rw [c2])
      (by rw [c2]; omega) (by rw [c2]; omega)

/-- **Corollary of Lemma K, trit cells** (a score cell read as one of three tones, `Fin 3`): one
cell orders at most 5 levels, two cells (`Fin 3 × Fin 3`) at most 17, and both are attained. -/
theorem thm_sel_lemma_k_trit_five_seventeen :
    ((∀ (L : ℕ) (cA cB : ℕ → Fin 3) (f : Fin 3 → Fin 3 → Bool), IsSelector L cA cB f → L ≤ 5) ∧
      ∃ (cA cB : ℕ → Fin 3) (f : Fin 3 → Fin 3 → Bool), IsSelector 5 cA cB f) ∧
    ((∀ (L : ℕ) (cA cB : ℕ → Fin 3 × Fin 3) (f : Fin 3 × Fin 3 → Fin 3 × Fin 3 → Bool),
        IsSelector L cA cB f → L ≤ 17) ∧
      ∃ (cA cB : ℕ → Fin 3 × Fin 3) (f : Fin 3 × Fin 3 → Fin 3 × Fin 3 → Bool),
        IsSelector 17 cA cB f) := by
  have c1 : Fintype.card (Fin 3) = 3 := Fintype.card_fin 3
  have c2 : Fintype.card (Fin 3 × Fin 3) = 9 := by rw [Fintype.card_prod, c1]
  refine ⟨⟨fun L cA cB f h => ?_, ?_⟩, ⟨fun L cA cB f h => ?_, ?_⟩⟩
  · have := thm_sel_lemma_k_card L cA cB f h
    rw [c1] at this
    omega
  · exact thm_sel_lemma_k_attained_card (Fin 3) (Fin 3) 5 (by rw [c1]) (by rw [c1]; omega)
      (by rw [c1]; omega)
  · have := thm_sel_lemma_k_card L cA cB f h
    rw [c2] at this
    omega
  · exact thm_sel_lemma_k_attained_card (Fin 3 × Fin 3) (Fin 3 × Fin 3) 17 (by rw [c2])
      (by rw [c2]; omega) (by rw [c2]; omega)

/-! ## Lemma T -/

/-- **Lemma T, injectivity.** A tie-holding selector writes distinct values for distinct levels,
for A and for B. -/
theorem thm_sel_lemma_t_injective {α β : Type*} (L : ℕ) (cA : ℕ → α) (cB : ℕ → β)
    (f : α → β → Bool) (h : IsTieSelector L cA cB f) :
    (∀ i i', i < L → i' < L → cA i = cA i' → i = i') ∧
      (∀ j j', j < L → j' < L → cB j = cB j' → j = j') := by
  constructor
  · intro i i' hi hi' heq
    by_contra hne
    rcases Nat.lt_or_gt_of_ne hne with hlt | hlt
    · have h1 := h i i' hi hi'
      have h2 := h i' i' hi' hi'
      rw [heq, h2, decide_eq_true (le_refl i'), decide_eq_false (by omega : ¬ i' ≤ i)] at h1
      cases h1
    · have h1 := h i' i hi' hi
      have h2 := h i i hi hi
      rw [← heq, h2, decide_eq_true (le_refl i), decide_eq_false (by omega : ¬ i ≤ i')] at h1
      cases h1
  · intro j j' hj hj' heq
    by_contra hne
    rcases Nat.lt_or_gt_of_ne hne with hlt | hlt
    · have h1 := h j j hj hj
      have h2 := h j j' hj hj'
      rw [heq, h2, decide_eq_true (le_refl j), decide_eq_false (by omega : ¬ j' ≤ j)] at h1
      cases h1
    · have h1 := h j' j' hj' hj'
      have h2 := h j' j hj' hj
      rw [← heq, h2, decide_eq_true (le_refl j'), decide_eq_false (by omega : ¬ j ≤ j')] at h1
      cases h1

private theorem card_image_eq_of_inj {γ : Type*} [DecidableEq γ] (L : ℕ) (c : ℕ → γ)
    (hinj : ∀ i i', i < L → i' < L → c i = c i' → i = i') : ((range L).image c).card = L := by
  rw [card_image_of_injOn, card_range]
  intro i hi i' hi' heq
  exact hinj i i' (mem_range.1 (Finset.mem_coe.1 hi)) (mem_range.1 (Finset.mem_coe.1 hi')) heq

/-- **Lemma T.** A tie-holding selector whose codes take `a` values on A's levels and `b` on
B's has `L ≤ a` and `L ≤ b`. -/
theorem thm_sel_lemma_t {α β : Type*} [DecidableEq α] [DecidableEq β] (L : ℕ) (cA : ℕ → α)
    (cB : ℕ → β) (f : α → β → Bool) (h : IsTieSelector L cA cB f) :
    L ≤ ((range L).image cA).card ∧ L ≤ ((range L).image cB).card := by
  obtain ⟨hA, hB⟩ := thm_sel_lemma_t_injective L cA cB f h
  rw [card_image_eq_of_inj L cA hA, card_image_eq_of_inj L cB hB]
  exact ⟨le_refl L, le_refl L⟩

/-- **Lemma T on finite alphabets**: `L ≤ |α|` and `L ≤ |β|`. One occupancy-blind cell
(`α = β = Bool`) therefore holds ties for A at two levels at most. -/
theorem thm_sel_lemma_t_card {α β : Type*} [Fintype α] [Fintype β] (L : ℕ) (cA : ℕ → α)
    (cB : ℕ → β) (f : α → β → Bool) (h : IsTieSelector L cA cB f) :
    L ≤ Fintype.card α ∧ L ≤ Fintype.card β := by
  classical
  obtain ⟨hA, hB⟩ := thm_sel_lemma_t L cA cB f h
  exact ⟨hA.trans (card_le_univ _), hB.trans (card_le_univ _)⟩

/-- **Lemma T, one occupancy-blind cell**: a tie-holding selector on bit codes has `L ≤ 2`. -/
theorem thm_sel_lemma_t_blind (L : ℕ) (cA cB : ℕ → Bool) (f : Bool → Bool → Bool)
    (h : IsTieSelector L cA cB f) : L ≤ 2 := by
  have := (thm_sel_lemma_t_card L cA cB f h).1
  simpa using this

/-- **Lemma T at full width**: when `L` equals the alphabet size, both codes are bijections from
the levels onto the alphabet (for one trit cell and three levels, the read must answer on all nine
tone pairs in the `≥` pattern). -/
theorem thm_sel_lemma_t_bijective {α β : Type*} [Fintype α] [Fintype β] (L : ℕ) (cA : ℕ → α)
    (cB : ℕ → β) (f : α → β → Bool) (h : IsTieSelector L cA cB f)
    (hα : Fintype.card α = L) (hβ : Fintype.card β = L) :
    (∀ x : α, ∃ i, i < L ∧ cA i = x) ∧ (∀ y : β, ∃ j, j < L ∧ cB j = y) := by
  classical
  obtain ⟨hA, hB⟩ := thm_sel_lemma_t_injective L cA cB f h
  have uA : (range L).image cA = univ :=
    eq_univ_of_card _ (by rw [card_image_eq_of_inj L cA hA, hα])
  have uB : (range L).image cB = univ :=
    eq_univ_of_card _ (by rw [card_image_eq_of_inj L cB hB, hβ])
  constructor
  · intro x
    have hx : x ∈ (range L).image cA := uA ▸ mem_univ x
    obtain ⟨i, hi, e⟩ := mem_image.1 hx
    exact ⟨i, mem_range.1 hi, e⟩
  · intro y
    have hy : y ∈ (range L).image cB := uB ▸ mem_univ y
    obtain ⟨j, hj, e⟩ := mem_image.1 hy
    exact ⟨j, mem_range.1 hj, e⟩

/-- **Lemma T is attained**: with one-to-one codes (the level itself) the read `[sB ≤ sA]` is a
tie-holding selector at every `L`. -/
theorem thm_sel_lemma_t_attained (L : ℕ) :
    IsTieSelector L (fun i => i) (fun j => j) (fun x y => decide (y ≤ x)) := by
  intro i j _ _
  rfl

end Selection
end Vibe

end
