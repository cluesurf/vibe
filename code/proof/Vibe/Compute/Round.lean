import Mathlib.Logic.Equiv.Defs
import Mathlib.Algebra.BigOperators.Group.Finset.Basic
import Mathlib.Algebra.BigOperators.Finprod
import Mathlib.Data.Set.Finite.Basic
import Mathlib.Dynamics.PeriodicPts.Defs
import Vibe.PairRules

/-!
# Vibe Computation Lab: the Partitioned Round

The shared vocabulary of the computation lab's Lean track. Every later
module (species transport, charge bounds, association, boundary, lumpability, devices) builds on
these definitions.

- `Config V`: a tone on every vertex of any vertex type `V` (finite or infinite, any graph).
- `support x`: the vertices off the vacuum. `FinConfig V`: the configurations of finite support.
- `Matching V`: one colour class of a schedule, as an involution `mate` (a vertex matched to
  itself is unmatched) and an orientation `lead` (which end of each edge is the pair's first
  cell). Disjointness is built in, and a matching may be infinite (the open mesh).
- `Matching.step f M`: apply the pair rule `f` to every edge of `M` at once.
- `Schedule V`: a list of matchings. `round f s`: the steps in schedule order.
  `roundBack g s`: the steps of `g` in reverse order (the inverse round).
- `Matching.Keeps f M`: `f` fixes the vacuum pair, or `M` moves finitely many vertices. Under it a
  step keeps finite support (a creating rule on an infinite matching fills the whole mesh).
- `total w x`: `∑ᶠ v, w (x v)`; `charge` is `Q`, `dCount` is `D`.
- `partials f s x`: the configurations after each prefix of the schedule (the within-round
  states, whose supports are where a tone can be).

Headline theorems:
1. `thm_cmp_round_perm_charge_negation` (A1): for any vertex type, any schedule and any pair
   rule that is a permutation of `Tone × Tone` keeping the pair sum, the round is an
   `Equiv.Perm` of all configurations with `roundBack F.symm s` as its inverse, it restricts to an
   `Equiv.Perm` of the finite-support configurations whenever every matching keeps the rule, it
   keeps `Q` (and `D` when the rule does), and it commutes with global negation when the rule
   commutes with pair negation. This extends `thm_cf_partitioned_block_global_invariants` (one
   block on `Fin n`) to the composed round on any graph.
2. `thm_cmp_pair_rule_perm`: each of the 24 conservative reversible pair rules is such a
   permutation, with an inverse that is again one of the 24.
3. `thm_cmp_recurrence_is_periodic` (A31, bijectivity): a recurrence at any time is a return to
   the start, so an orbit has no transient.
4. `thm_cmp_confined_period` (A31, the confined reading): `state(P) = state(0)` gives period `P`
   forever, every round-end support and every within-round state at any time is one of the first
   `P` rounds', and the cells the orbit can ever hold form a finite set when the start has finite
   support.

Mathlib (`Equiv.Perm`, `Finset.sum_involution`, `finsum`, `Set.Finite`,
`Function.IsPeriodicPt`), zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Function

/-- A configuration: a tone on every vertex of any vertex type `V`. -/
abbrev Config (V : Type*) := V → Tone

/-- The vertices off the vacuum tone. -/
def support {V : Type*} (x : Config V) : Set V := {v | x v ≠ .zero}

/-- The configurations of finite support (the states of an open window). -/
abbrev FinConfig (V : Type*) := {x : Config V // (support x).Finite}

/-- Global negation of a configuration. -/
def negate {V : Type*} (x : Config V) : Config V := fun v => (x v).dual

/-- The sum of a tone weight over all vertices (`finsum`, so `0` on infinite support). -/
noncomputable def total {V : Type*} (w : Tone → Int) (x : Config V) : Int := ∑ᶠ v, w (x v)

/-- The square tone weight, so `total toneSq` is `D`. -/
def toneSq (t : Tone) : Int := t.value * t.value

/-- The total charge `Q`. -/
noncomputable def charge {V : Type*} (x : Config V) : Int := total Tone.value x

/-- The excitation count `D`. -/
noncomputable def dCount {V : Type*} (x : Config V) : Int := total toneSq x

/-- One colour class of a schedule: an involution `mate` (a vertex with `mate v = v` is
    unmatched) and an orientation `lead`, which picks the first cell of each matched pair. -/
structure Matching (V : Type*) where
  mate : V → V
  mate_mate : ∀ v, mate (mate v) = v
  lead : V → Bool
  lead_mate : ∀ v, mate v ≠ v → lead (mate v) = !lead v

/-- A schedule: the colour classes in the order a round applies them. -/
abbrev Schedule (V : Type*) := List (Matching V)

namespace Matching

variable {V : Type*} [DecidableEq V]

/-- Apply the pair rule `f` to every edge of the matching at once: on an edge with first cell
    `v` and second cell `mate v`, the pair `(x v, x (mate v))` becomes `f` of it. -/
def step (M : Matching V) (f : Pair → Pair) (x : Config V) : Config V := fun v =>
  if M.mate v = v then x v
  else if M.lead v then (f (x v, x (M.mate v))).1
  else (f (x (M.mate v), x v)).2

/-- The step keeps finite support: the rule fixes the vacuum pair, or the matching moves
    finitely many vertices. -/
def Keeps (M : Matching V) (f : Pair → Pair) : Prop :=
  f prVac = prVac ∨ {v | M.mate v ≠ v}.Finite

private theorem step_fixed (M : Matching V) (f : Pair → Pair) (x : Config V) (v : V)
    (h : M.mate v = v) : M.step f x v = x v := by
  simp only [step, h, ↓reduceIte]

private theorem step_lead (M : Matching V) (f : Pair → Pair) (x : Config V) (v : V)
    (h : M.mate v ≠ v) (hl : M.lead v = true) : M.step f x v = (f (x v, x (M.mate v))).1 := by
  simp only [step, h, hl, ↓reduceIte]

private theorem step_follow (M : Matching V) (f : Pair → Pair) (x : Config V) (v : V)
    (h : M.mate v ≠ v) (hl : M.lead v = false) :
    M.step f x v = (f (x (M.mate v), x v)).2 := by
  simp only [step, h, hl, Bool.false_eq_true, ↓reduceIte]

omit [DecidableEq V] in
private theorem mate_ne (M : Matching V) (v : V) (h : M.mate v ≠ v) :
    M.mate (M.mate v) ≠ M.mate v := by
  rw [M.mate_mate]
  exact fun e => h e.symm

omit [DecidableEq V] in
private theorem mate_injective (M : Matching V) : Injective M.mate := by
  intro a b h
  rw [← M.mate_mate a, h, M.mate_mate]

/-- The step of `g` undoes the step of `f` when `g` undoes `f` on pairs. -/
private theorem step_inv (M : Matching V) (f g : Pair → Pair) (hgf : ∀ p, g (f p) = p)
    (x : Config V) : M.step g (M.step f x) = x := by
  funext v
  by_cases h : M.mate v = v
  · rw [step_fixed M g _ v h, step_fixed M f x v h]
  · have hw := mate_ne M v h
    cases hl : M.lead v with
    | true =>
      have hlw : M.lead (M.mate v) = false := by rw [M.lead_mate v h, hl]; rfl
      rw [step_lead M g _ v h hl, step_lead M f x v h hl, step_follow M f x _ hw hlw,
        M.mate_mate, Prod.mk.eta, hgf]
    | false =>
      have hlw : M.lead (M.mate v) = true := by rw [M.lead_mate v h, hl]; rfl
      rw [step_follow M g _ v h hl, step_follow M f x v h hl, step_lead M f x _ hw hlw,
        M.mate_mate, Prod.mk.eta, hgf]

/-- The step commutes with global negation for a negation-symmetric rule. -/
private theorem step_negate (M : Matching V) (f : Pair → Pair)
    (hC : ∀ p, f (prNeg p) = prNeg (f p)) (x : Config V) :
    M.step f (negate x) = negate (M.step f x) := by
  funext v
  by_cases h : M.mate v = v
  · rw [step_fixed M f _ v h]
    simp only [negate, step_fixed M f x v h]
  · cases hl : M.lead v with
    | true =>
      rw [step_lead M f _ v h hl]
      simp only [negate, step_lead M f x v h hl]
      exact congrArg Prod.fst (hC (x v, x (M.mate v)))
    | false =>
      rw [step_follow M f _ v h hl]
      simp only [negate, step_follow M f x v h hl]
      exact congrArg Prod.snd (hC (x (M.mate v), x v))

/-- On any finite vertex set closed under `mate`, a step keeps the sum of a pair-additive
    weight (an involution pairing of the differences). -/
private theorem step_sum (M : Matching V) (f : Pair → Pair) (w : Tone → Int)
    (hw : ∀ p, w (f p).1 + w (f p).2 = w p.1 + w p.2) (S : Finset V)
    (hS : ∀ v ∈ S, M.mate v ∈ S) (x : Config V) :
    ∑ v ∈ S, w (M.step f x v) = ∑ v ∈ S, w (x v) := by
  have hdiff : ∑ v ∈ S, (w (M.step f x v) - w (x v)) = 0 := by
    refine Finset.sum_involution (fun v _ => M.mate v) ?_ ?_ (fun v hv => hS v hv)
      (fun v _ => M.mate_mate v)
    · intro v _
      by_cases h : M.mate v = v
      · rw [h, step_fixed M f x v h]
        omega
      · have hw' := mate_ne M v h
        cases hl : M.lead v with
        | true =>
          have hlw : M.lead (M.mate v) = false := by rw [M.lead_mate v h, hl]; rfl
          rw [step_lead M f x v h hl, step_follow M f x _ hw' hlw, M.mate_mate]
          have := hw (x v, x (M.mate v))
          simp only at this
          omega
        | false =>
          have hlw : M.lead (M.mate v) = true := by rw [M.lead_mate v h, hl]; rfl
          rw [step_follow M f x v h hl, step_lead M f x _ hw' hlw, M.mate_mate]
          have := hw (x (M.mate v), x v)
          simp only at this
          omega
    · intro v _ hne h
      apply hne
      rw [step_fixed M f x v h]
      omega
  rw [Finset.sum_sub_distrib] at hdiff
  omega

/-- A step changes only matched vertices. -/
private theorem step_support_moved (M : Matching V) (f : Pair → Pair) (x : Config V) :
    support (M.step f x) ⊆ support x ∪ {v | M.mate v ≠ v} := by
  intro v hv
  by_cases h : M.mate v = v
  · left
    simp only [support, Set.mem_ofPred_eq] at hv ⊢
    rwa [step_fixed M f x v h] at hv
  · exact Or.inr h

/-- Under a vacuum-fixing rule a step lights only vertices whose pair was lit. -/
private theorem step_support_vac (M : Matching V) (f : Pair → Pair) (hv : f prVac = prVac)
    (x : Config V) : support (M.step f x) ⊆ support x ∪ M.mate ⁻¹' support x := by
  intro v hs
  by_contra hn
  simp only [Set.mem_union, Set.mem_preimage, support, Set.mem_ofPred_eq, not_or,
    not_not] at hn hs
  obtain ⟨h0, h1⟩ := hn
  apply hs
  by_cases h : M.mate v = v
  · rw [step_fixed M f x v h, h0]
  · cases hl : M.lead v with
    | true => rw [step_lead M f x v h hl, h0, h1]; exact congrArg Prod.fst hv
    | false => rw [step_follow M f x v h hl, h0, h1]; exact congrArg Prod.snd hv

/-- A step that keeps the rule keeps finite support. -/
private theorem step_finite (M : Matching V) (f : Pair → Pair) (hk : M.Keeps f) (x : Config V)
    (hx : (support x).Finite) : (support (M.step f x)).Finite := by
  rcases hk with hv | hm
  · exact (hx.union (hx.preimage (mate_injective M).injOn)).subset
      (step_support_vac M f hv x)
  · exact (hx.union hm).subset (step_support_moved M f x)

/-- A step keeps the total of a pair-additive weight that vanishes on the vacuum tone, between
    configurations of finite support. -/
private theorem step_total (M : Matching V) (f : Pair → Pair) (w : Tone → Int)
    (hw0 : w .zero = 0) (hw : ∀ p, w (f p).1 + w (f p).2 = w p.1 + w p.2) (x : Config V)
    (hx : (support x).Finite) (hy : (support (M.step f x)).Finite) :
    total w (M.step f x) = total w x := by
  classical
  let T : Finset V := (hx.union hy).toFinset
  let S : Finset V := T ∪ T.image M.mate
  have hS : ∀ v ∈ S, M.mate v ∈ S := by
    intro v hv
    rcases Finset.mem_union.1 hv with h | h
    · exact Finset.mem_union_right _ (Finset.mem_image_of_mem _ h)
    · obtain ⟨u, hu, rfl⟩ := Finset.mem_image.1 h
      rw [M.mate_mate]
      exact Finset.mem_union_left _ hu
  have hsub : ∀ z : Config V, support z ⊆ support x ∪ support (M.step f x) →
      Function.support (fun v => w (z v)) ⊆ (S : Set V) := by
    intro z hz v hv
    have hzv : z v ≠ .zero := by
      intro e
      apply hv
      simp only [e, hw0]
    have hT : v ∈ T := (Set.Finite.mem_toFinset _).2 (hz hzv)
    exact Finset.mem_coe.2 (Finset.mem_union_left _ hT)
  unfold total
  rw [finsum_eq_sum_of_support_subset _ (hsub _ Set.subset_union_right),
    finsum_eq_sum_of_support_subset _ (hsub _ Set.subset_union_left)]
  exact step_sum M f w hw S hS x

omit [DecidableEq V] in
/-- Negation keeps the support. -/
private theorem support_negate (x : Config V) : support (negate x) = support x := by
  ext v
  simp only [support, negate, Set.mem_ofPred_eq]
  cases x v <;> decide

end Matching

section RoundDefs

variable {V : Type*} [DecidableEq V]

/-- The round: every matching of the schedule in order. -/
def round (f : Pair → Pair) (s : Schedule V) (x : Config V) : Config V :=
  s.foldl (fun y M => M.step f y) x

/-- The inverse round: the matchings in reverse order, each with the inverse rule `g`. -/
def roundBack (g : Pair → Pair) (s : Schedule V) (x : Config V) : Config V :=
  s.reverse.foldl (fun y M => M.step g y) x

/-- The configurations after each prefix of the schedule, starting with `x` and ending with
    `round f s x`: the within-round states, whose supports are where a tone can be. -/
def partials (f : Pair → Pair) (s : Schedule V) (x : Config V) : List (Config V) :=
  s.scanl (fun y M => M.step f y) x

end RoundDefs

section RoundTheory

variable {V : Type*} [DecidableEq V]

private theorem round_cons (f : Pair → Pair) (M : Matching V) (s : Schedule V) (x : Config V) :
    round f (M :: s) x = round f s (M.step f x) := rfl

private theorem roundBack_cons (g : Pair → Pair) (M : Matching V) (s : Schedule V)
    (x : Config V) : roundBack g (M :: s) x = M.step g (roundBack g s x) := by
  simp only [roundBack, List.reverse_cons, List.foldl_append, List.foldl_cons, List.foldl_nil]

private theorem round_left_inv (f g : Pair → Pair) (hgf : ∀ p, g (f p) = p) (s : Schedule V)
    (x : Config V) : roundBack g s (round f s x) = x := by
  induction s generalizing x with
  | nil => rfl
  | cons M s ih => rw [round_cons, roundBack_cons, ih, Matching.step_inv M f g hgf]

private theorem round_right_inv (f g : Pair → Pair) (hfg : ∀ p, f (g p) = p) (s : Schedule V)
    (x : Config V) : round f s (roundBack g s x) = x := by
  induction s generalizing x with
  | nil => rfl
  | cons M s ih => rw [roundBack_cons, round_cons, Matching.step_inv M g f hfg, ih]

/-- A list of steps that all keep the rule keeps finite support and the total of a
    pair-additive weight that vanishes on the vacuum tone. -/
private theorem fold_finite_total (f : Pair → Pair) (w : Tone → Int) (hw0 : w .zero = 0)
    (hw : ∀ p, w (f p).1 + w (f p).2 = w p.1 + w p.2) (L : List (Matching V))
    (hk : ∀ M ∈ L, M.Keeps f) (x : Config V) (hx : (support x).Finite) :
    (support (L.foldl (fun y M => M.step f y) x)).Finite ∧
      total w (L.foldl (fun y M => M.step f y) x) = total w x := by
  induction L generalizing x with
  | nil => exact ⟨hx, rfl⟩
  | cons M L ih =>
    have hM := hk M List.mem_cons_self
    have hy := Matching.step_finite M f hM x hx
    obtain ⟨h1, h2⟩ := ih (fun M' hM' => hk M' (List.mem_cons_of_mem M hM')) _ hy
    refine ⟨h1, ?_⟩
    rw [List.foldl_cons, h2, Matching.step_total M f w hw0 hw x hx hy]

omit [DecidableEq V] in
private theorem keeps_symm (F : Equiv.Perm Pair) (M : Matching V) (hk : M.Keeps F) :
    M.Keeps F.symm := by
  rcases hk with hv | hm
  · left
    rw [Equiv.symm_apply_eq]
    exact hv.symm
  · exact Or.inr hm

private theorem round_finite (F : Equiv.Perm Pair) (s : Schedule V) (hk : ∀ M ∈ s, M.Keeps F)
    (x : Config V) (hx : (support x).Finite) : (support (round F s x)).Finite :=
  (fold_finite_total F (fun _ => 0) rfl (fun _ => rfl) s hk x hx).1

private theorem roundBack_finite (F : Equiv.Perm Pair) (s : Schedule V)
    (hk : ∀ M ∈ s, M.Keeps F) (x : Config V) (hx : (support x).Finite) :
    (support (roundBack F.symm s x)).Finite :=
  (fold_finite_total F.symm (fun _ => 0) rfl (fun _ => rfl) s.reverse
    (fun M hM => keeps_symm F M (hk M (List.mem_reverse.1 hM))) x hx).1

/-- The round as a permutation of all configurations, on any vertex type and schedule. -/
def roundPerm (F : Equiv.Perm Pair) (s : Schedule V) : Equiv.Perm (Config V) where
  toFun := round F s
  invFun := roundBack F.symm s
  left_inv := round_left_inv F F.symm (fun p => F.symm_apply_apply p) s
  right_inv := round_right_inv F F.symm (fun p => F.apply_symm_apply p) s

/-- The round as a permutation of the finite-support configurations, when every matching keeps
    the rule. -/
def finRoundPerm (F : Equiv.Perm Pair) (s : Schedule V) (hk : ∀ M ∈ s, M.Keeps F) :
    Equiv.Perm (FinConfig V) where
  toFun x := ⟨round F s x.1, round_finite F s hk x.1 x.2⟩
  invFun x := ⟨roundBack F.symm s x.1, roundBack_finite F s hk x.1 x.2⟩
  left_inv x := Subtype.ext (round_left_inv F F.symm (fun p => F.symm_apply_apply p) s x.1)
  right_inv x := Subtype.ext (round_right_inv F F.symm (fun p => F.apply_symm_apply p) s x.1)

private theorem round_negate (f : Pair → Pair) (hC : ∀ p, f (prNeg p) = prNeg (f p))
    (s : Schedule V) (x : Config V) : round f s (negate x) = negate (round f s x) := by
  induction s generalizing x with
  | nil => rfl
  | cons M s ih => rw [round_cons, round_cons, Matching.step_negate M f hC, ih]

/-- **A1.** For any vertex type `V` (any graph, finite or infinite), any schedule of matchings
    and any pair rule `F` that permutes `Tone × Tone` and keeps the pair sum: the round is a
    bijection of all configurations whose inverse is the reversed round of `F.symm`; when every
    matching keeps the rule (the rule fixes the vacuum pair, or the matching is finite) it maps
    finite-support configurations to finite-support configurations, as the permutation
    `finRoundPerm`, and keeps the charge `Q`; it keeps `D` when the rule does; and it commutes
    with global negation when the rule commutes with pair negation. -/
theorem thm_cmp_round_perm_charge_negation (F : Equiv.Perm Pair) (hQ : PrSumPres F)
    (s : Schedule V) (hk : ∀ M ∈ s, M.Keeps F) :
    Bijective (round F s) ∧
    (∀ x : Config V, roundBack F.symm s (round F s x) = x ∧
      round F s (roundBack F.symm s x) = x) ∧
    (∀ x : FinConfig V, (finRoundPerm F s hk x).1 = round F s x.1 ∧
      ((finRoundPerm F s hk).symm x).1 = roundBack F.symm s x.1) ∧
    (∀ x : FinConfig V, charge (round F s x.1) = charge x.1) ∧
    (PrDCons F → ∀ x : FinConfig V, dCount (round F s x.1) = dCount x.1) ∧
    ((∀ p, F (prNeg p) = prNeg (F p)) →
      ∀ x : Config V, round F s (negate x) = negate (round F s x)) := by
  refine ⟨(roundPerm F s).bijective, fun x => ⟨(roundPerm F s).left_inv x,
    (roundPerm F s).right_inv x⟩, fun x => ⟨rfl, rfl⟩, ?_, ?_, fun hC => round_negate F hC s⟩
  · intro x
    exact (fold_finite_total F Tone.value rfl (fun p => hQ p) s hk x.1 x.2).2
  · intro hD x
    exact (fold_finite_total F toneSq rfl (fun p => hD p) s hk x.1 x.2).2

/-- Each of the 24 conservative reversible pair rules is a permutation of `Tone × Tone` keeping
    the pair sum, whose inverse is again one of the 24, so
    `thm_cmp_round_perm_charge_negation` applies to every one of them. -/
theorem thm_cmp_pair_rule_perm (B : Pair → Pair) (hS : PrSumPres B) (hI : PrInj B) :
    ∃ F : Equiv.Perm Pair, (F : Pair → Pair) = B ∧ PrSumPres F ∧
      PrSumPres F.symm ∧ PrInj F.symm := by
  obtain ⟨g, hgS, hgI, hgf, hfg⟩ := thm_pair_rule_inverse B hS hI
  exact ⟨⟨B, g, hgf, hfg⟩, rfl, hS, hgS, hgI⟩

/-- **A31, no transient.** The round is injective, so a recurrence at any time is a return to
    the start: `state(t + P) = state(t)` gives `state(P) = state(0)`. -/
theorem thm_cmp_recurrence_is_periodic (F : Equiv.Perm Pair) (s : Schedule V) (x : Config V)
    (t P : Nat) (h : (round F s)^[t + P] x = (round F s)^[t] x) :
    (round F s)^[P] x = x := by
  have hinj : Injective (round F s)^[t] := (roundPerm F s).injective.iterate t
  apply hinj
  rw [← iterate_add_apply, h]

private theorem iterate_finite (F : Equiv.Perm Pair) (s : Schedule V)
    (hk : ∀ M ∈ s, M.Keeps F) (x : Config V) (hx : (support x).Finite) (k : Nat) :
    (support ((round F s)^[k] x)).Finite := by
  induction k with
  | zero => exact hx
  | succ k ih =>
    rw [iterate_succ_apply']
    exact round_finite F s hk _ ih

private theorem partials_finite (F : Equiv.Perm Pair) (s : Schedule V)
    (hk : ∀ M ∈ s, M.Keeps F) (x : Config V) (hx : (support x).Finite) :
    ∀ y ∈ partials F s x, (support y).Finite := by
  induction s generalizing x with
  | nil =>
    intro y hy
    simp only [partials, List.scanl_nil, List.mem_singleton] at hy
    rw [hy]
    exact hx
  | cons M s ih =>
    intro y hy
    simp only [partials, List.scanl_cons, List.mem_cons] at hy
    rcases hy with hy | hy
    · rw [hy]
      exact hx
    · exact ih (fun M' hM' => hk M' (List.mem_cons_of_mem M hM')) _
        (Matching.step_finite M F (hk M List.mem_cons_self) x hx) y hy

/-- **A31, the confined reading.** If a round orbit returns to its start after `P > 0` rounds,
    then it has period `P` forever (`Function.IsPeriodicPt`, and `state(t) = state(t mod P)`),
    every round-end support at any time lies inside the cells the first `P` round ends hold,
    every within-round state at any time is a within-round state of one of the first `P` rounds
    (so the field hull of the first `P` rounds bounds where a tone can ever be), and when the
    start has finite support and every matching keeps the rule that region is finite. -/
theorem thm_cmp_confined_period (F : Equiv.Perm Pair) (s : Schedule V) (x : Config V)
    (P : Nat) (hP : 0 < P) (h : (round F s)^[P] x = x) :
    IsPeriodicPt (round F s) P x ∧
    (∀ t, (round F s)^[t] x = (round F s)^[t % P] x) ∧
    (∀ t, support ((round F s)^[t] x) ⊆ ⋃ k ∈ Finset.range P, support ((round F s)^[k] x)) ∧
    (∀ t, ∀ y ∈ partials F s ((round F s)^[t] x),
      ∃ k < P, y ∈ partials F s ((round F s)^[k] x)) ∧
    ((∀ M ∈ s, M.Keeps F) → (support x).Finite →
      (⋃ k ∈ Finset.range P, ⋃ y ∈ partials F s ((round F s)^[k] x), support y).Finite) := by
  have hper : IsPeriodicPt (round F s) P x := h
  have hmod : ∀ t, (round F s)^[t] x = (round F s)^[t % P] x := fun t =>
    (hper.iterate_mod_apply t).symm
  refine ⟨hper, hmod, ?_, ?_, ?_⟩
  · intro t v hv
    rw [hmod t] at hv
    exact Set.mem_biUnion (Finset.mem_coe.2 (Finset.mem_range.2 (Nat.mod_lt t hP))) hv
  · intro t y hy
    rw [hmod t] at hy
    exact ⟨t % P, Nat.mod_lt t hP, hy⟩
  · intro hk hx
    refine Set.Finite.biUnion (Finset.finite_toSet _) fun k _ => ?_
    refine Set.Finite.biUnion (List.finite_toSet _) fun y hy => ?_
    have hz := iterate_finite F s hk x hx k
    exact partials_finite F s hk _ hz y hy

end RoundTheory

end Compute

end Vibe
