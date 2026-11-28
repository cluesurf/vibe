import Mathlib.Algebra.BigOperators.Group.Finset.Basic
import Mathlib.Algebra.BigOperators.Finprod
import Mathlib.Algebra.Order.BigOperators.Group.Finset
import Mathlib.Data.Set.Card
import Mathlib.Logic.Function.Iterate
import Vibe.Compute.Round
import Vibe.Compute.RuleCensus

/-!
# Vibe Computation Lab: Relative Charge, No Copy Without Food, and the Frontier Bound

Lean track item L05 (lean-track.md, claims A24 and I-a4). Everything is stated for any vertex type
`V` (any graph, finite or infinite), any schedule of matchings (`Vibe.Compute.Schedule`, possibly
infinite matchings) and any number of rounds, on the round of `Vibe.Compute.Round`.

- `relSupport b x`: the cells off the background tone `b`. `offCount b x` is their number `N`.
- `relCharge b x`: `Q_rel = ∑ (t - b)` over all cells (`finsum`).
- `speciesCount u x`: the number of cells holding tone `u`.
- `IsCopy b S y e`: `e` places the off-background cells of the structure `S` injectively in `y`,
  tone for tone. This asks less than M10's copy (no mesh symmetry, no isolation margin), so every
  bound on copies below is stronger than the note's.

Headline theorems:
1. `thm_cmp_relcharge_conserved` (A24): on a background the rule fixes, `Q_rel` of a finite
   structure is conserved by every round of every schedule, and the structure stays finite.
2. `thm_cmp_relcharge_one_sign` (A24, I-a4): on `b = +1` or `-1` every off-background tone has
   `t - b` of the one sign `-b`, of size 1 or 2.
3. `thm_cmp_offcount_charge_bound` (I-a4, level 4 counting theorem, level 7 D1):
   `N(T) ≤ |Q_rel| ≤ 2 N(0)`, and a set of `w` cells all off the background at one round (a lit
   frontier of width `w`) needs `w ≤ |Q_rel|`, so `w ≤ 2 N(0)` and `ceil(w/2) ≤ N(0)`.
4. `thm_cmp_species_never_grow` (I-a4, D1): under a rule that keeps or swaps every pair (the
   species cells), `N` and every species count are conserved.
5. `thm_cmp_copies_need_charge` and `thm_cmp_copies_need_species` (M10 P1 with food): `k` disjoint
   copies of `S` at any round of a run from `x0` need `k |Q_rel(S)| ≤ |Q_rel(x0)|` (reactive), and
   `k` times each species count of `S` at most that of `x0` (species).
6. `thm_cmp_quiet_cells` and `thm_cmp_no_copy_without_food` (M10 P1): 56 of the 72 rule-background
   cells have a quiet background, each is keep-or-swap or sits on `+1` or `-1`, and on every one of
   them a nonempty finite structure alone never shows two disjoint copies of itself at any round.

Not part of these theorems: the informal "one unit of charge per branch" step of level 4 (how a
splitting mechanism routes its charge). The bound `w ≤ |Q_rel|` holds without it.

Mathlib (`finsum`, `Finset.sum_biUnion`, `Set.ncard`), zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Function

/-! ## Definitions -/

/-- The cells off the background tone `b`. -/
def relSupport {V : Type*} (b : Tone) (x : Config V) : Set V := {v | x v ≠ b}

/-- The charge of a tone relative to the background `b`: `t - b`. -/
def relWeight (b t : Tone) : Int := t.value - b.value

/-- The relative charge `Q_rel = ∑ (t - b)` (`finsum`, so `0` on infinite support). -/
noncomputable def relCharge {V : Type*} (b : Tone) (x : Config V) : Int := total (relWeight b) x

/-- The number `N` of cells off the background `b` (`Set.ncard`, so `0` on infinite support). -/
noncomputable def offCount {V : Type*} (b : Tone) (x : Config V) : Nat := (relSupport b x).ncard

/-- The number of cells holding tone `u`. -/
noncomputable def speciesCount {V : Type*} (u : Tone) (x : Config V) : Nat := {v | x v = u}.ncard

/-- A tone weight whose pair total the rule `f` keeps. -/
def PairAdditive (f : Pair → Pair) (w : Tone → Int) : Prop :=
  ∀ p, w (f p).1 + w (f p).2 = w p.1 + w p.2

/-- The rule keeps or swaps every pair (the species-conserving cells of M6). -/
def KeepOrSwap (f : Pair → Pair) : Prop := ∀ p, f p = p ∨ f p = prSwap p

/-- `e` places a copy of the structure `S` (its cells off the background `b`) in `y`: injective on
    them, and tone for tone. -/
def IsCopy {V : Type*} (b : Tone) (S y : Config V) (e : V → V) : Prop :=
  Set.InjOn e (relSupport b S) ∧ ∀ v ∈ relSupport b S, y (e v) = S v

/-! ## A step on a quiet background -/

namespace Matching

private theorem ch_step_fixed {V : Type*} [DecidableEq V] (M : Matching V) (f : Pair → Pair)
    (x : Config V) (v : V) (h : M.mate v = v) : M.step f x v = x v := by
  simp only [Matching.step, h, ↓reduceIte]

private theorem ch_step_lead {V : Type*} [DecidableEq V] (M : Matching V) (f : Pair → Pair)
    (x : Config V) (v : V) (h : M.mate v ≠ v) (hl : M.lead v = true) :
    M.step f x v = (f (x v, x (M.mate v))).1 := by
  simp only [Matching.step, h, hl, ↓reduceIte]

private theorem ch_step_follow {V : Type*} [DecidableEq V] (M : Matching V) (f : Pair → Pair)
    (x : Config V) (v : V) (h : M.mate v ≠ v) (hl : M.lead v = false) :
    M.step f x v = (f (x (M.mate v), x v)).2 := by
  simp only [Matching.step, h, hl, Bool.false_eq_true, ↓reduceIte]

private theorem ch_mate_ne {V : Type*} (M : Matching V) (v : V) (h : M.mate v ≠ v) :
    M.mate (M.mate v) ≠ M.mate v := by
  rw [M.mate_mate]
  exact fun e => h e.symm

private theorem ch_mate_injective {V : Type*} (M : Matching V) : Injective M.mate := by
  intro a b h
  rw [← M.mate_mate a, h, M.mate_mate]

/-- On a finite vertex set closed under `mate`, a step keeps the sum of a pair-additive weight. -/
private theorem ch_step_sum {V : Type*} [DecidableEq V] (M : Matching V) (f : Pair → Pair)
    (w : Tone → Int) (hw : PairAdditive f w) (S : Finset V) (hS : ∀ v ∈ S, M.mate v ∈ S)
    (x : Config V) : ∑ v ∈ S, w (M.step f x v) = ∑ v ∈ S, w (x v) := by
  have hdiff : ∑ v ∈ S, (w (M.step f x v) - w (x v)) = 0 := by
    refine Finset.sum_involution (fun v _ => M.mate v) ?_ ?_ (fun v hv => hS v hv)
      (fun v _ => M.mate_mate v)
    · intro v _
      by_cases h : M.mate v = v
      · rw [h, ch_step_fixed M f x v h]
        omega
      · have hw' := ch_mate_ne M v h
        cases hl : M.lead v with
        | true =>
          have hlw : M.lead (M.mate v) = false := by rw [M.lead_mate v h, hl]; rfl
          rw [ch_step_lead M f x v h hl, ch_step_follow M f x _ hw' hlw, M.mate_mate]
          have := hw (x v, x (M.mate v))
          simp only at this
          omega
        | false =>
          have hlw : M.lead (M.mate v) = true := by rw [M.lead_mate v h, hl]; rfl
          rw [ch_step_follow M f x v h hl, ch_step_lead M f x _ hw' hlw, M.mate_mate]
          have := hw (x (M.mate v), x v)
          simp only at this
          omega
    · intro v _ hne h
      apply hne
      rw [ch_step_fixed M f x v h]
      omega
  rw [Finset.sum_sub_distrib] at hdiff
  omega

/-- On a background the rule fixes, a step lights only cells whose pair was lit. -/
private theorem ch_step_rel_support {V : Type*} [DecidableEq V] (M : Matching V)
    (f : Pair → Pair) (b : Tone) (hb : f (b, b) = (b, b)) (x : Config V) :
    relSupport b (M.step f x) ⊆ relSupport b x ∪ M.mate ⁻¹' relSupport b x := by
  intro v hs
  by_contra hn
  simp only [Set.mem_union, Set.mem_preimage, relSupport, Set.mem_ofPred_eq, not_or,
    not_not] at hn hs
  obtain ⟨h0, h1⟩ := hn
  apply hs
  by_cases h : M.mate v = v
  · rw [ch_step_fixed M f x v h, h0]
  · cases hl : M.lead v with
    | true => rw [ch_step_lead M f x v h hl, h0, h1]; exact congrArg Prod.fst hb
    | false => rw [ch_step_follow M f x v h hl, h0, h1]; exact congrArg Prod.snd hb

private theorem ch_step_finite {V : Type*} [DecidableEq V] (M : Matching V) (f : Pair → Pair)
    (b : Tone) (hb : f (b, b) = (b, b)) (x : Config V) (hx : (relSupport b x).Finite) :
    (relSupport b (M.step f x)).Finite :=
  (hx.union (hx.preimage (ch_mate_injective M).injOn)).subset (ch_step_rel_support M f b hb x)

/-- A step keeps the total of a pair-additive weight vanishing on the background. -/
private theorem ch_step_total {V : Type*} [DecidableEq V] (M : Matching V) (f : Pair → Pair)
    (w : Tone → Int) (b : Tone) (hw0 : w b = 0) (hw : PairAdditive f w) (x : Config V)
    (hx : (relSupport b x).Finite) (hy : (relSupport b (M.step f x)).Finite) :
    total w (M.step f x) = total w x := by
  let T : Finset V := (hx.union hy).toFinset
  let S : Finset V := T ∪ T.image M.mate
  have hS : ∀ v ∈ S, M.mate v ∈ S := by
    intro v hv
    rcases Finset.mem_union.1 hv with h | h
    · exact Finset.mem_union_right _ (Finset.mem_image_of_mem _ h)
    · obtain ⟨u, hu, rfl⟩ := Finset.mem_image.1 h
      rw [M.mate_mate]
      exact Finset.mem_union_left _ hu
  have hsub : ∀ z : Config V, relSupport b z ⊆ relSupport b x ∪ relSupport b (M.step f x) →
      Function.support (fun v => w (z v)) ⊆ (S : Set V) := by
    intro z hz v hv
    have hzv : z v ≠ b := by
      intro e
      apply hv
      simp only [e, hw0]
    have hT : v ∈ T := (Set.Finite.mem_toFinset _).2 (hz hzv)
    exact Finset.mem_coe.2 (Finset.mem_union_left _ hT)
  unfold total
  rw [finsum_eq_sum_of_support_subset _ (hsub _ Set.subset_union_right),
    finsum_eq_sum_of_support_subset _ (hsub _ Set.subset_union_left)]
  exact ch_step_sum M f w hw S hS x

end Matching

/-! ## Rounds and iterates on a quiet background -/

private theorem ch_round_finite_total {V : Type*} [DecidableEq V] (f : Pair → Pair)
    (w : Tone → Int) (b : Tone) (hw0 : w b = 0) (hw : PairAdditive f w)
    (hb : f (b, b) = (b, b)) (s : Schedule V) (x : Config V) (hx : (relSupport b x).Finite) :
    (relSupport b (round f s x)).Finite ∧ total w (round f s x) = total w x := by
  induction s generalizing x with
  | nil => exact ⟨hx, rfl⟩
  | cons M s ih =>
    have hy := Matching.ch_step_finite M f b hb x hx
    obtain ⟨h1, h2⟩ := ih _ hy
    refine ⟨h1, ?_⟩
    show total w (round f s (M.step f x)) = total w x
    rw [h2, Matching.ch_step_total M f w b hw0 hw x hx hy]

private theorem ch_iter {V : Type*} [DecidableEq V] (f : Pair → Pair) (w : Tone → Int) (b : Tone)
    (hw0 : w b = 0) (hw : PairAdditive f w) (hb : f (b, b) = (b, b)) (s : Schedule V)
    (x : Config V) (hx : (relSupport b x).Finite) (T : Nat) :
    (relSupport b ((round f s)^[T] x)).Finite ∧ total w ((round f s)^[T] x) = total w x := by
  induction T with
  | zero => exact ⟨hx, rfl⟩
  | succ T ih =>
    rw [iterate_succ_apply']
    obtain ⟨h1, h2⟩ := ch_round_finite_total f w b hw0 hw hb s _ ih.1
    exact ⟨h1, h2.trans ih.2⟩

/-! ## Totals as finite sums -/

private theorem ch_total_eq_sum {V : Type*} (w : Tone → Int) (b : Tone) (hw0 : w b = 0)
    (x : Config V) (hx : (relSupport b x).Finite) :
    total w x = ∑ v ∈ hx.toFinset, w (x v) := by
  unfold total
  apply finsum_eq_sum_of_support_subset
  intro v hv
  rw [Set.Finite.coe_toFinset]
  intro e
  apply hv
  show w (x v) = 0
  rw [e, hw0]

private theorem ch_total_indicator {V : Type*} (w : Tone → Int) (b : Tone) (P : Tone → Prop)
    [DecidablePred P] (hw : ∀ t, w t = if P t then 1 else 0) (hP : ¬ P b) (x : Config V)
    (hx : (relSupport b x).Finite) : total w x = ({v | P (x v)}.ncard : Int) := by
  have hw0 : w b = 0 := by rw [hw]; simp only [hP, ↓reduceIte]
  rw [ch_total_eq_sum w b hw0 x hx]
  have hset : {v | P (x v)} = ↑(hx.toFinset.filter fun v => P (x v)) := by
    ext v
    simp only [Set.mem_ofPred_eq, Finset.coe_filter, Set.Finite.mem_toFinset]
    constructor
    · intro h
      exact ⟨fun e => hP (e ▸ h), h⟩
    · intro h
      exact h.2
  rw [hset, Set.ncard_coe_finset, Finset.card_filter]
  push_cast
  exact Finset.sum_congr rfl fun v _ => by rw [hw]

/-! ## Sign and pair additivity -/

private theorem ch_sign (b t : Tone) (hb : b ≠ .zero) :
    0 ≤ -b.value * relWeight b t ∧ -b.value * relWeight b t ≤ 2 ∧
      (t ≠ b → 1 ≤ -b.value * relWeight b t) := by
  cases b <;> cases t <;> first | exact absurd rfl hb | decide

private theorem ch_relWeight_self (b : Tone) : relWeight b b = 0 := by
  simp only [relWeight, sub_self]

private theorem ch_relWeight_add (f : Pair → Pair) (hQ : PrSumPres f) (b : Tone) :
    PairAdditive f (relWeight b) := by
  intro p
  have := hQ p
  simp only [prSum] at this
  simp only [relWeight]
  omega

private theorem ch_scaled_add (f : Pair → Pair) (hQ : PrSumPres f) (b : Tone) :
    PairAdditive f (fun t => -b.value * relWeight b t) := by
  intro p
  have := ch_relWeight_add f hQ b p
  simp only
  rw [← mul_add, ← mul_add, this]

private theorem ch_keepOrSwap_add (f : Pair → Pair) (h : KeepOrSwap f) (w : Tone → Int) :
    PairAdditive f w := by
  intro p
  rcases h p with e | e
  · rw [e]
  · rw [e]
    simp only [prSwap]
    omega

private theorem ch_keepOrSwap_quiet (f : Pair → Pair) (h : KeepOrSwap f) (b : Tone) :
    f (b, b) = (b, b) := by
  rcases h (b, b) with e | e
  · exact e
  · rw [e]
    rfl

/-! ## `N ≤ |Q_rel| ≤ 2N` -/

private theorem ch_total_scaled {V : Type*} (b : Tone) (x : Config V)
    (hx : (relSupport b x).Finite) :
    total (fun t => -b.value * relWeight b t) x = ∑ v ∈ hx.toFinset, -b.value * relWeight b (x v) ∧
      -b.value * relCharge b x = ∑ v ∈ hx.toFinset, -b.value * relWeight b (x v) := by
  refine ⟨ch_total_eq_sum _ b (by simp only [ch_relWeight_self, mul_zero]) x hx, ?_⟩
  unfold relCharge
  rw [ch_total_eq_sum _ b (ch_relWeight_self b) x hx, Finset.mul_sum]

private theorem ch_abs_charge {V : Type*} (b : Tone) (hb : b ≠ .zero) (x : Config V)
    (hx : (relSupport b x).Finite) :
    |relCharge b x| = total (fun t => -b.value * relWeight b t) x ∧
      (offCount b x : Int) ≤ |relCharge b x| ∧ |relCharge b x| ≤ 2 * (offCount b x : Int) := by
  obtain ⟨ht, hs⟩ := ch_total_scaled b x hx
  have hcard : (offCount b x : Int) = ∑ v ∈ hx.toFinset, (1 : Int) := by
    unfold offCount
    rw [Set.ncard_eq_toFinset_card _ hx]
    simp
  have hlo : ∑ v ∈ hx.toFinset, (1 : Int) ≤ ∑ v ∈ hx.toFinset, -b.value * relWeight b (x v) :=
    Finset.sum_le_sum fun v hv => (ch_sign b (x v) hb).2.2 ((Set.Finite.mem_toFinset hx).1 hv)
  have hhi : ∑ v ∈ hx.toFinset, -b.value * relWeight b (x v) ≤ ∑ v ∈ hx.toFinset, (2 : Int) :=
    Finset.sum_le_sum fun v _ => (ch_sign b (x v) hb).2.1
  have h2 : ∑ v ∈ hx.toFinset, (2 : Int) = 2 * ∑ v ∈ hx.toFinset, (1 : Int) := by
    simp only [Finset.sum_const, nsmul_eq_mul, mul_one]
    ring
  have habs : |relCharge b x| = -b.value * relCharge b x := by
    have h0 : 0 ≤ -b.value * relCharge b x := by
      rw [hs]
      exact Finset.sum_nonneg fun v _ => (ch_sign b (x v) hb).1
    cases b with
    | zero => exact absurd rfl hb
    | neg =>
      simp only [Tone.value, neg_neg, one_mul] at h0 ⊢
      exact abs_of_nonneg h0
    | pos =>
      simp only [Tone.value, neg_mul, one_mul] at h0 ⊢
      exact abs_of_nonpos (by omega)
  refine ⟨by rw [habs, hs, ht], ?_, ?_⟩
  · rw [habs, hcard, hs]
    exact hlo
  · rw [habs, hcard, hs, ← h2]
    exact hhi

/-! ## Copies -/

/-- `k` pairwise disjoint copies of `S` in `y` carry `k` times the total of `S` of a nonnegative
    weight vanishing on the background. -/
private theorem ch_copies_le {V : Type*} (w : Tone → Int) (b : Tone) (hw0 : w b = 0)
    (hwn : ∀ t, 0 ≤ w t) (S y : Config V) (hS : (relSupport b S).Finite)
    (hy : (relSupport b y).Finite) (k : Nat) (e : Fin k → V → V)
    (hc : ∀ i, IsCopy b S y (e i))
    (hd : ∀ i j, i ≠ j → Disjoint (e i '' relSupport b S) (e j '' relSupport b S)) :
    (k : Int) * total w S ≤ total w y := by
  classical
  have himg : ∀ i, ∑ u ∈ hS.toFinset.image (e i), w (y u) = total w S := by
    intro i
    rw [Finset.sum_image (fun a ha c hc' h => (hc i).1 ((Set.Finite.mem_toFinset hS).1 ha)
      ((Set.Finite.mem_toFinset hS).1 hc') h), ch_total_eq_sum w b hw0 S hS]
    exact Finset.sum_congr rfl fun v hv => by
      rw [(hc i).2 v ((Set.Finite.mem_toFinset hS).1 hv)]
  have hpd : (↑(Finset.univ : Finset (Fin k)) : Set (Fin k)).PairwiseDisjoint
      fun i => hS.toFinset.image (e i) := by
    intro i _ j _ hij
    simp only [Function.onFun]
    rw [← Finset.disjoint_coe, Finset.coe_image, Finset.coe_image, Set.Finite.coe_toFinset]
    exact hd i j hij
  have hsub : Finset.univ.biUnion (fun i => hS.toFinset.image (e i)) ⊆ hy.toFinset := by
    intro u hu
    simp only [Finset.mem_biUnion, Finset.mem_univ, true_and, Finset.mem_image] at hu
    obtain ⟨i, v, hv, rfl⟩ := hu
    rw [Set.Finite.mem_toFinset]
    have hv' := (Set.Finite.mem_toFinset hS).1 hv
    show y (e i v) ≠ b
    rw [(hc i).2 v hv']
    exact hv'
  calc (k : Int) * total w S = ∑ i : Fin k, ∑ u ∈ hS.toFinset.image (e i), w (y u) := by
        simp only [himg, Finset.sum_const, Finset.card_univ, Fintype.card_fin, nsmul_eq_mul]
    _ = ∑ u ∈ Finset.univ.biUnion (fun i => hS.toFinset.image (e i)), w (y u) :=
        (Finset.sum_biUnion hpd).symm
    _ ≤ ∑ u ∈ hy.toFinset, w (y u) :=
        Finset.sum_le_sum_of_subset_of_nonneg hsub fun u _ _ => hwn _
    _ = total w y := (ch_total_eq_sum w b hw0 y hy).symm

/-! ## Headline theorems -/

/-- **A24, conservation.** For any vertex type, any schedule and any pair rule `f` that keeps the
    pair sum and fixes the uniform pair `(b, b)` of the background `b`: a structure with finitely
    many cells off `b` stays finite at every round count `T`, and its relative charge
    `Q_rel = ∑ (t - b)` never changes. -/
theorem thm_cmp_relcharge_conserved {V : Type*} [DecidableEq V] (f : Pair → Pair)
    (hQ : PrSumPres f) (b : Tone) (hb : f (b, b) = (b, b)) (s : Schedule V) (x : Config V)
    (hx : (relSupport b x).Finite) (T : Nat) :
    (relSupport b ((round f s)^[T] x)).Finite ∧
      relCharge b ((round f s)^[T] x) = relCharge b x :=
  ch_iter f (relWeight b) b (ch_relWeight_self b) (ch_relWeight_add f hQ b) hb s x hx T

/-- **A24, one sign.** On the background `b = +1` or `-1`, every off-background tone `t` has
    `t - b` of the one sign `-b` (so `-b (t - b) > 0`), of size at most 2; the background itself
    has relative charge 0. -/
theorem thm_cmp_relcharge_one_sign (b : Tone) (hb : b ≠ .zero) :
    relWeight b b = 0 ∧
      ∀ t, t ≠ b → 0 < -b.value * relWeight b t ∧ -b.value * relWeight b t ≤ 2 :=
  ⟨ch_relWeight_self b, fun t ht => ⟨(ch_sign b t hb).2.2 ht, (ch_sign b t hb).2.1⟩⟩

/-- **I-a4, the counting theorem (level 4 L4-Charge, level 7 D1).** On a background
    `b = +1` or `-1` that the rule fixes, for a rule keeping the pair sum, any vertex type and any
    schedule, a finite start `x` and any round count `T`, with `y` the state after `T` rounds:
    `N(y) ≤ |Q_rel(y)| = |Q_rel(x)| ≤ 2 N(x)`, so `N(y) ≤ 2 N(x)` (a development at most doubles);
    and any set `L` of cells all off the background in `y` (a lit frontier of width `|L|`) has
    `|L| ≤ |Q_rel(x)|`, `|L| ≤ 2 N(x)` and `ceil(|L| / 2) ≤ N(x)`. -/
theorem thm_cmp_offcount_charge_bound {V : Type*} [DecidableEq V] (f : Pair → Pair)
    (hQ : PrSumPres f) (b : Tone) (hb0 : b ≠ .zero) (hb : f (b, b) = (b, b)) (s : Schedule V)
    (x : Config V) (hx : (relSupport b x).Finite) (T : Nat) :
    (offCount b ((round f s)^[T] x) : Int) ≤ |relCharge b ((round f s)^[T] x)| ∧
    |relCharge b ((round f s)^[T] x)| = |relCharge b x| ∧
    |relCharge b x| ≤ 2 * (offCount b x : Int) ∧
    offCount b ((round f s)^[T] x) ≤ 2 * offCount b x ∧
    (∀ L : Finset V, (∀ v ∈ L, (round f s)^[T] x v ≠ b) →
      (L.card : Int) ≤ |relCharge b x| ∧ L.card ≤ 2 * offCount b x ∧
        (L.card + 1) / 2 ≤ offCount b x) := by
  obtain ⟨hy, hq⟩ := thm_cmp_relcharge_conserved f hQ b hb s x hx T
  have h1 := (ch_abs_charge b hb0 _ hy).2.1
  have h2 : |relCharge b ((round f s)^[T] x)| = |relCharge b x| := by rw [hq]
  have h3 := (ch_abs_charge b hb0 x hx).2.2
  have h4 : (offCount b ((round f s)^[T] x) : Int) ≤ 2 * (offCount b x : Int) :=
    le_trans h1 (h2 ▸ h3)
  have h4' : offCount b ((round f s)^[T] x) ≤ 2 * offCount b x := by exact_mod_cast h4
  refine ⟨h1, h2, h3, h4', ?_⟩
  intro L hL
  have hsub : (↑L : Set V) ⊆ relSupport b ((round f s)^[T] x) := fun v hv => hL v hv
  have hcard : L.card ≤ offCount b ((round f s)^[T] x) := by
    unfold offCount
    rw [← Set.ncard_coe_finset]
    exact Set.ncard_le_ncard hsub hy
  have hc : (L.card : Int) ≤ |relCharge b x| := by
    rw [← h2]
    exact le_trans (by exact_mod_cast hcard) h1
  refine ⟨hc, by omega, by omega⟩

/-- **I-a4, D1, species cells never grow.** For a rule that keeps or swaps every pair (the
    species-conserving cells; such a rule fixes every uniform pair), any vertex type, schedule and
    background `b`, and a start with finitely many cells off `b`: at every round count the state
    stays finite, its off-background count `N` is the start's, and so is the count of every tone
    `u ≠ b`. -/
theorem thm_cmp_species_never_grow {V : Type*} [DecidableEq V] (f : Pair → Pair)
    (hf : KeepOrSwap f) (b : Tone) (s : Schedule V) (x : Config V)
    (hx : (relSupport b x).Finite) (T : Nat) :
    (relSupport b ((round f s)^[T] x)).Finite ∧
    offCount b ((round f s)^[T] x) = offCount b x ∧
    ∀ u, u ≠ b → speciesCount u ((round f s)^[T] x) = speciesCount u x := by
  have hq := ch_keepOrSwap_quiet f hf b
  have hfin := (ch_iter f (fun _ => 0) b rfl (ch_keepOrSwap_add f hf _) hq s x hx T).1
  refine ⟨hfin, ?_, ?_⟩
  · have h := (ch_iter f (fun t => if t ≠ b then 1 else 0) b (by simp)
      (ch_keepOrSwap_add f hf _) hq s x hx T).2
    rw [ch_total_indicator _ b (fun t => t ≠ b) (fun _ => rfl) (by simp) _ hfin,
      ch_total_indicator _ b (fun t => t ≠ b) (fun _ => rfl) (by simp) x hx] at h
    unfold offCount relSupport
    exact_mod_cast h
  · intro u hu
    have hP : ¬ (b = u) := fun e => hu e.symm
    have h := (ch_iter f (fun t => if t = u then 1 else 0) b (by simp [hP])
      (ch_keepOrSwap_add f hf _) hq s x hx T).2
    rw [ch_total_indicator _ b (fun t => t = u) (fun _ => rfl) hP _ hfin,
      ch_total_indicator _ b (fun t => t = u) (fun _ => rfl) hP x hx] at h
    unfold speciesCount
    exact_mod_cast h

/-- **M10 P1 with food, reactive.** On a background `b = +1` or `-1` that the rule fixes, for a
    rule keeping the pair sum, any vertex type and schedule: if the state after `T` rounds from a
    finite start `x0` holds `k` pairwise disjoint copies of a finite structure `S`, then
    `k |Q_rel(S)| ≤ |Q_rel(x0)|`; and a nonempty `S` has `|Q_rel(S)| ≥ 1`. So every copy beyond what
    the start's charge pays for is impossible. -/
theorem thm_cmp_copies_need_charge {V : Type*} [DecidableEq V] (f : Pair → Pair)
    (hQ : PrSumPres f) (b : Tone) (hb0 : b ≠ .zero) (hb : f (b, b) = (b, b)) (s : Schedule V)
    (x0 S : Config V) (hx0 : (relSupport b x0).Finite) (hS : (relSupport b S).Finite) (T k : Nat)
    (e : Fin k → V → V) (hc : ∀ i, IsCopy b S ((round f s)^[T] x0) (e i))
    (hd : ∀ i j, i ≠ j → Disjoint (e i '' relSupport b S) (e j '' relSupport b S)) :
    (k : Int) * |relCharge b S| ≤ |relCharge b x0| ∧
      ((relSupport b S).Nonempty → 1 ≤ |relCharge b S|) := by
  obtain ⟨hy, hq⟩ := thm_cmp_relcharge_conserved f hQ b hb s x0 hx0 T
  have hle := ch_copies_le (fun t => -b.value * relWeight b t) b
    (by simp only [ch_relWeight_self, mul_zero]) (fun t => (ch_sign b t hb0).1) S _ hS hy k e hc hd
  rw [← (ch_abs_charge b hb0 S hS).1, ← (ch_abs_charge b hb0 _ hy).1, hq] at hle
  refine ⟨hle, fun hne => ?_⟩
  have hpos : 0 < offCount b S := (Set.ncard_pos hS).2 hne
  have := (ch_abs_charge b hb0 S hS).2.1
  have hpos' : (1 : Int) ≤ (offCount b S : Int) := by exact_mod_cast hpos
  exact le_trans hpos' this

/-- **M10 P1 with food, species.** For a rule that keeps or swaps every pair, any vertex type,
    schedule and background `b`: if the state after `T` rounds from a finite start `x0` holds `k`
    pairwise disjoint copies of a finite structure `S`, then for every tone `u ≠ b`, `k` times the
    count of `u` in `S` is at most the count of `u` in `x0`. -/
theorem thm_cmp_copies_need_species {V : Type*} [DecidableEq V] (f : Pair → Pair)
    (hf : KeepOrSwap f) (b : Tone) (s : Schedule V) (x0 S : Config V)
    (hx0 : (relSupport b x0).Finite) (hS : (relSupport b S).Finite) (T k : Nat)
    (e : Fin k → V → V) (hc : ∀ i, IsCopy b S ((round f s)^[T] x0) (e i))
    (hd : ∀ i j, i ≠ j → Disjoint (e i '' relSupport b S) (e j '' relSupport b S)) :
    ∀ u, u ≠ b → k * speciesCount u S ≤ speciesCount u x0 := by
  intro u hu
  have hP : ¬ (b = u) := fun e => hu e.symm
  obtain ⟨hy, _, hcount⟩ := thm_cmp_species_never_grow f hf b s x0 hx0 T
  have hle := ch_copies_le (fun t => if t = u then 1 else 0) b (by simp [hP])
    (fun t => by by_cases h : t = u <;> simp [h]) S _ hS hy k e hc hd
  rw [ch_total_indicator _ b (fun t => t = u) (fun _ => rfl) hP S hS,
    ch_total_indicator _ b (fun t => t = u) (fun _ => rfl) hP _ hy] at hle
  have hle' : k * speciesCount u S ≤ speciesCount u ((round f s)^[T] x0) := by
    unfold speciesCount
    exact_mod_cast hle
  rw [hcount u hu] at hle'
  exact hle'

private theorem ch_species_keepOrSwap (f : Pair → Pair) (b : Tone)
    (h : RuleCensus.cellKind f b = RuleCensus.CellKind.species) : KeepOrSwap f := by
  unfold RuleCensus.cellKind at h
  by_cases h1 : RuleCensus.quietB f b = false
  · simp only [h1, ↓reduceIte] at h
    cases h
  · simp only [h1] at h
    by_cases h2 : (RuleCensus.tones.all fun a =>
        RuleCensus.tones.all fun c => (RuleCensus.pairMove f a c).isSome) = true
    · intro p
      rcases p with ⟨a, c⟩
      simp only [List.all_eq_true] at h2
      have hs := h2 a (RuleCensus.mem_tones a) c (RuleCensus.mem_tones c)
      unfold RuleCensus.pairMove at hs
      by_cases e1 : f (a, c) = (a, c)
      · exact Or.inl e1
      · by_cases e2 : f (a, c) = (c, a)
        · exact Or.inr e2
        · simp only [e1, e2, ↓reduceIte, Option.isSome_none, Bool.false_eq_true] at hs
    · simp only [h2] at h
      cases h

private theorem ch_quiet_split :
    ∀ c ∈ RuleCensus.cells, RuleCensus.quietB (prTable c.1) c.2 = true →
      RuleCensus.cellKind (prTable c.1) c.2 = RuleCensus.CellKind.species ∨ c.2 ≠ .zero := by
  unfold RuleCensus.cells
  rw [pr_rule_codes_eq]
  decide +kernel

/-- **M10 P1, the quiet cells.** Of the 72 rule-background cells (`RuleCensus.cells`), exactly 56
    have a quiet background (the rule fixes `(b, b)`), and on each the rule keeps or swaps every
    pair (a species cell), or the background is `+1` or `-1` and the rule keeps the pair sum and
    fixes `(b, b)` (a reactive cell). -/
theorem thm_cmp_quiet_cells :
    (RuleCensus.cells.filter fun c => RuleCensus.quietB (prTable c.1) c.2).length = 56 ∧
    ∀ c ∈ RuleCensus.cells, RuleCensus.quietB (prTable c.1) c.2 = true →
      KeepOrSwap (prTable c.1) ∨
        (c.2 ≠ .zero ∧ PrSumPres (prTable c.1) ∧ prTable c.1 (c.2, c.2) = (c.2, c.2)) := by
  refine ⟨by unfold RuleCensus.cells; rw [pr_rule_codes_eq]; decide +kernel, ?_⟩
  intro c hc hq
  rcases ch_quiet_split c hc hq with h | h
  · exact Or.inl (ch_species_keepOrSwap _ _ h)
  · refine Or.inr ⟨h, pr_table_sumPres c.1, ?_⟩
    unfold RuleCensus.quietB at hq
    exact of_decide_eq_true hq

/-- **M10 P1, no reproduction without food, every graph and schedule, all 56 quiet cells.** For
    every rule-background cell `(n, b)` with a quiet background, any vertex type and schedule, a
    nonempty structure `x` with finitely many cells off `b`, alone (no food), never shows two
    pairwise disjoint copies of itself at any round `T`: `k` disjoint copies force `k ≤ 1`. -/
theorem thm_cmp_no_copy_without_food {V : Type*} [DecidableEq V] (c : Nat × Tone)
    (hc : c ∈ RuleCensus.cells) (hq : RuleCensus.quietB (prTable c.1) c.2 = true)
    (s : Schedule V) (x : Config V) (hx : (relSupport c.2 x).Finite)
    (hne : (relSupport c.2 x).Nonempty) (T k : Nat) (e : Fin k → V → V)
    (hcopy : ∀ i, IsCopy c.2 x ((round (prTable c.1) s)^[T] x) (e i))
    (hd : ∀ i j, i ≠ j → Disjoint (e i '' relSupport c.2 x) (e j '' relSupport c.2 x)) :
    k ≤ 1 := by
  rcases (thm_cmp_quiet_cells).2 c hc hq with hs | ⟨hb0, hQ, hb⟩
  · obtain ⟨v, hv⟩ := hne
    have hle := thm_cmp_copies_need_species _ hs c.2 s x x hx hx T k e hcopy hd (x v) hv
    have hfin : {w | x w = x v}.Finite := hx.subset fun w hw => by
      show x w ≠ c.2
      rw [Set.mem_ofPred_eq.mp hw]
      exact hv
    have hpos : 0 < speciesCount (x v) x := (Set.ncard_pos hfin).2 ⟨v, rfl⟩
    by_contra hk
    have h2 : 2 * speciesCount (x v) x ≤ k * speciesCount (x v) x :=
      Nat.mul_le_mul_right _ (by omega)
    omega
  · obtain ⟨hle, hone⟩ := thm_cmp_copies_need_charge _ hQ c.2 hb0 hb s x x hx hx T k e hcopy hd
    have h1 := hone hne
    by_contra hk
    have h2 : (2 : Int) * |relCharge c.2 x| ≤ (k : Int) * |relCharge c.2 x| :=
      mul_le_mul_of_nonneg_right (by omega) (abs_nonneg _)
    omega

end Compute

end Vibe
