import Mathlib.Data.Fintype.Pigeonhole
import Mathlib.Data.Fintype.Pi
import Mathlib.Data.Set.Card
import Mathlib.Data.ZMod.Defs
import Mathlib.Algebra.BigOperators.Group.Finset.Basic
import Mathlib.Algebra.Order.BigOperators.Group.Finset
import Mathlib.Tactic.Ring
import Vibe.Compute.Round

/-!
# Vibe Computation Lab: Boundaries (M9)

The claims of m9-boundaries.md that hold for every box and every bijective round (lean-track.md,
L10, claims A20 to A23). Built on `Vibe.Compute.Round` (`roundPerm`, `finRoundPerm`,
`thm_cmp_round_perm_charge_negation`, `thm_cmp_recurrence_is_periodic`).

A *repair* at round `T` is the perturbed state agreeing with the unperturbed one on a region `B`
at round `T`. The *exterior* of a configuration is its restriction to the cells off `B`.

Headline theorems:
1. `thm_cmp_perturbation_never_meets` (A20, any box): under any injective map (any bijective
   round on any vertex type, open or closed), two different states differ at every time.
2. `thm_cmp_finite_perm_return` and `thm_cmp_closed_box_no_repair` (A20, closed box): on a finite
   vertex type, the perturbed run differs from the unperturbed run at every round, returns to its
   own start after some `P > 0` rounds, and its orbit meets the unperturbed orbit at any pair of
   times only if the perturbed start already lies on the unperturbed orbit.
3. `thm_cmp_export_injective` (A21, any injective dynamics) and `thm_cmp_landauer_export` (A21,
   rounds): if every member of an ensemble of `N` pairwise different starts is repaired on `B`
   at round `T`, the exteriors at round `T` are pairwise different, so the exterior takes exactly
   `N` values (`log2 N` bits for equiprobable outcomes); with partial repair, `N` is at most the
   number of interior values times the number of exterior values; and starts that differ only
   inside `B` share one exterior value at round 0 (0 bits).
4. `thm_cmp_d_theorem_abstract` and `thm_cmp_d_theorem` (A22): under any injective dynamics that
   keeps a quantity `D` which splits as an interior part plus an exterior part that is
   nonnegative and zero only on the empty exterior, a repaired hit on a structure whose
   unperturbed run stays inside `B` has `delta D` equal to the exterior's `D`, and
   `delta D > 0`. For pair-rule rounds keeping `D = sum t^2` this is stated on configurations,
   with the corollary `thm_cmp_d_no_repair_of_erase` (no erase or sign flip of any set of cells
   is ever repaired).
5. `thm_cmp_z3_superposition` (A23): a pair rule additive mod 3 (every Z3-linear rule
   `z3LinearRule a b c d`, `thm_cmp_z3_linear_additive`) makes every iterate of the round additive
   mod 3, so a perturbed run is the unperturbed run plus the lone perturbation's run, and a hit
   is repaired on `B` at round `T` exactly when the lone run is off `B` at round `T` (so over a
   window exactly when it leaves `B` and stays out).

The Lean definitions here speak about Lean rounds and Lean rules; the Z3-linear rule is the
formula of `code/rule/z3-linear-pair.ts` (residues 0, 1, 2 for tones 0, +1, -1), not a generated
table. Mathlib (`Set.ncard`, `Finite.exists_ne_map_eq_of_infinite`, `ZMod 3`, `Finset.sum`),
zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Function

/-! ## A20: a perturbed state never meets the unperturbed one -/

/-- **A20, any box.** Under any injective map, two different states stay different at every
    time: no repair is ever exact. This applies to every bijective round on any vertex type. -/
theorem thm_cmp_perturbation_never_meets {α : Type*} (g : α → α) (hg : Injective g) (x y : α)
    (hxy : x ≠ y) : ∀ t, g^[t] y ≠ g^[t] x :=
  fun t h => hxy ((hg.iterate t) h).symm

/-- **A20, closed box, return.** A permutation of a finite set brings every state back to
    itself after some `P > 0` steps. -/
theorem thm_cmp_finite_perm_return {α : Type*} [Finite α] (σ : Equiv.Perm α) (y : α) :
    ∃ P, 0 < P ∧ σ^[P] y = y := by
  obtain ⟨a, b, hab, heq⟩ := Finite.exists_ne_map_eq_of_infinite (fun n : Nat => σ^[n] y)
  have key : ∀ m n : Nat, m < n → σ^[n] y = σ^[m] y → σ^[n - m] y = y := by
    intro m n hmn h
    apply (σ.injective.iterate m)
    rw [← iterate_add_apply, Nat.add_sub_cancel' hmn.le, h]
  rcases Nat.lt_or_gt_of_ne hab with h | h
  · exact ⟨b - a, by omega, key a b h heq.symm⟩
  · exact ⟨a - b, by omega, key b a h heq⟩

private theorem perm_orbits_meet {α : Type*} [Finite α] (σ : Equiv.Perm α) (x y : α) :
    (∃ t u, σ^[t] y = σ^[u] x) ↔ ∃ k, y = σ^[k] x := by
  constructor
  · rintro ⟨t, u, h⟩
    rcases Nat.le_total t u with htu | hut
    · refine ⟨u - t, (σ.injective.iterate t) ?_⟩
      rw [h, ← iterate_add_apply, Nat.add_sub_cancel' htu]
    · obtain ⟨P, hP, hPy⟩ := thm_cmp_finite_perm_return σ y
      have hy : ∀ j, σ^[P * j] y = y := by
        intro j
        induction j with
        | zero => rfl
        | succ j ih => rw [Nat.mul_succ, iterate_add_apply, hPy, ih]
      have hk : σ^[t - u] y = x := by
        apply (σ.injective.iterate u)
        rw [← iterate_add_apply, Nat.add_sub_cancel' hut, h]
      have hle : t - u ≤ P * (t - u) := Nat.le_mul_of_pos_left _ hP
      refine ⟨P * (t - u) - (t - u), ?_⟩
      rw [← hk, ← iterate_add_apply, Nat.sub_add_cancel hle, hy]
  · rintro ⟨k, hk⟩
    exact ⟨0, k, hk⟩

private theorem tone_finite : Finite Tone := by
  refine Finite.of_surjective
    (fun i : Fin 3 => if i = 0 then Tone.neg else if i = 1 then Tone.zero else Tone.pos) ?_
  intro t
  cases t
  · exact ⟨0, rfl⟩
  · exact ⟨1, rfl⟩
  · exact ⟨2, rfl⟩

/-- **A20, closed box.** On a finite vertex type (a closed box), for any schedule and any pair
    rule that permutes `Tone × Tone`: a perturbed state `y` differs from the unperturbed state
    `x` at every round (no repair ever happens, let alone lasts), it returns to itself after some
    `P > 0` rounds, and its orbit meets the unperturbed orbit at any pair of times exactly when
    `y` already lies on the orbit of `x`. -/
theorem thm_cmp_closed_box_no_repair {V : Type*} [DecidableEq V] [Finite V]
    (F : Equiv.Perm Pair) (s : Schedule V) (x y : Config V) (hxy : x ≠ y) :
    (∀ t, (round F s)^[t] y ≠ (round F s)^[t] x) ∧
    (∃ P, 0 < P ∧ (round F s)^[P] y = y) ∧
    ((∃ t u, (round F s)^[t] y = (round F s)^[u] x) ↔ ∃ k, y = (round F s)^[k] x) := by
  have : Finite Tone := tone_finite
  have hr : (round F s : Config V → Config V) = roundPerm F s := rfl
  refine ⟨thm_cmp_perturbation_never_meets _ (roundPerm F s).injective x y hxy, ?_, ?_⟩
  · rw [hr]
    exact thm_cmp_finite_perm_return (roundPerm F s) y
  · rw [hr]
    exact perm_orbits_meet (roundPerm F s) x y

/-! ## A21: the export of an open repair -/

/-- **A21, any injective dynamics.** Let `inner` and `outer` together determine a state (the
    interior on `B` and the exterior off `B`) and `g` be injective. For any ensemble `S` of starts:
    the number of starts is at most the number of interior values times the number of exterior
    values at the end; if every start is repaired (all end with the same interior), the exterior
    distinguishes every start and takes exactly `S.ncard` values; and if all starts share one
    exterior, the exterior takes at most one value. -/
theorem thm_cmp_export_injective {α β ε : Type*} (g : α → α) (hg : Injective g)
    (inner : α → β) (outer : α → ε) (hsep : ∀ a b, inner a = inner b → outer a = outer b → a = b)
    (S : Set α) (hS : S.Finite) :
    S.ncard ≤ ((inner ∘ g) '' S).ncard * ((outer ∘ g) '' S).ncard ∧
    ((∀ a ∈ S, ∀ b ∈ S, inner (g a) = inner (g b)) →
      Set.InjOn (outer ∘ g) S ∧ ((outer ∘ g) '' S).ncard = S.ncard) ∧
    ((∀ a ∈ S, ∀ b ∈ S, outer a = outer b) → (outer '' S).ncard ≤ 1) := by
  refine ⟨?_, ?_, ?_⟩
  · rw [← Set.ncard_prod]
    refine Set.ncard_le_ncard_of_injOn (fun a => (inner (g a), outer (g a)))
      (fun a ha => ⟨⟨a, ha, rfl⟩, ⟨a, ha, rfl⟩⟩) ?_ ((hS.image _).prod (hS.image _))
    intro a _ b _ h
    simp only [Prod.mk.injEq] at h
    exact hg (hsep _ _ h.1 h.2)
  · intro hrep
    have hinj : Set.InjOn (outer ∘ g) S := by
      intro a ha b hb h
      exact hg (hsep _ _ (hrep a ha b hb) h)
    exact ⟨hinj, hinj.ncard_image⟩
  · intro hsame
    rw [Set.ncard_le_one_iff (hS.image _)]
    rintro _ _ ⟨a, ha, rfl⟩ ⟨b, hb, rfl⟩
    exact hsame a ha b hb

/-- The exterior of a configuration: its tones off `B`. -/
def exterior {V : Type*} (B : Set V) (x : Config V) : {v // v ∉ B} → Tone := fun v => x v.1

/-- The interior of a configuration: its tones on `B`. -/
def interior {V : Type*} (B : Set V) (x : Config V) : {v // v ∈ B} → Tone := fun v => x v.1

private theorem interior_exterior_sep {V : Type*} (B : Set V) (x y : Config V)
    (hi : interior B x = interior B y) (he : exterior B x = exterior B y) : x = y := by
  funext v
  by_cases hv : v ∈ B
  · exact congrFun hi ⟨v, hv⟩
  · exact congrFun he ⟨v, hv⟩

/-- **A21, Landauer export, rounds.** For any vertex type (the open window included), any
    schedule, any pair rule that permutes `Tone × Tone`, any region `B` and any finite ensemble
    `S` of `N` pairwise different starts (the unperturbed state and its hits): if at round `T`
    every member agrees on `B` with the unperturbed state `x0`, then the exteriors at round `T`
    are pairwise different, so the exterior takes exactly `N` values (`log2 N` bits for `N`
    equiprobable outcomes, the minimum, since it is also an upper bound: `N` members give at most
    `N` values). With partial repair, `N` is at most the interior count times the exterior count,
    and starts that agree off `B` give one exterior value at round 0. -/
theorem thm_cmp_landauer_export {V : Type*} [DecidableEq V] (F : Equiv.Perm Pair)
    (s : Schedule V) (B : Set V) (S : Finset (Config V)) (T : Nat) :
    S.card ≤ ((fun y => interior B ((round F s)^[T] y)) '' ↑S).ncard *
      ((fun y => exterior B ((round F s)^[T] y)) '' ↑S).ncard ∧
    (∀ x0 : Config V, (∀ y ∈ S, ∀ v ∈ B, (round F s)^[T] y v = (round F s)^[T] x0 v) →
      Set.InjOn (fun y => exterior B ((round F s)^[T] y)) ↑S ∧
      ((fun y => exterior B ((round F s)^[T] y)) '' ↑S).ncard = S.card) ∧
    ((∀ y ∈ S, ∀ z ∈ S, ∀ v, v ∉ B → y v = z v) → (exterior B '' ↑S).ncard ≤ 1) := by
  have hinj : Injective (round F s)^[T] := (roundPerm F s).injective.iterate T
  obtain ⟨h1, h2, h3⟩ := thm_cmp_export_injective _ hinj (interior B) (exterior B)
    (interior_exterior_sep B) (↑S) S.finite_toSet
  rw [Set.ncard_coe_finset] at h1 h2
  refine ⟨h1, ?_, ?_⟩
  · intro x0 hrep
    apply h2
    intro a ha b hb
    funext v
    exact (hrep a ha v.1 v.2).trans (hrep b hb v.1 v.2).symm
  · intro hsame
    apply h3
    intro a ha b hb
    funext v
    exact hsame a ha b hb v.1 v.2

/-! ## A22: the D theorem -/

/-- **A22, any injective dynamics.** Let `g` be injective and keep `D`, let `D` split as an
    interior part plus an exterior part that is nonnegative and zero only on the empty exterior
    `e0`, let the unperturbed run of `x` end with the empty exterior (the structure stays inside
    `B`), and let the hit `y ≠ x` be repaired (same interior at the end). Then the exterior
    carries `delta D = D y - D x`, and `delta D > 0`. -/
theorem thm_cmp_d_theorem_abstract {α β ε : Type*} (g : α → α) (hg : Injective g)
    (inner : α → β) (outer : α → ε) (hsep : ∀ a b, inner a = inner b → outer a = outer b → a = b)
    (D : α → Int) (Din : β → Int) (Dout : ε → Int) (hsplit : ∀ a, D a = Din (inner a) + Dout (outer a))
    (e0 : ε) (hpos : ∀ a, 0 ≤ Dout (outer a)) (hzero : ∀ a, Dout (outer a) = 0 → outer a = e0)
    (he0 : Dout e0 = 0) (hkeep : ∀ a, D (g a) = D a) (x y : α) (hxy : x ≠ y)
    (hx : outer (g x) = e0) (hrep : inner (g y) = inner (g x)) :
    D y - D x = Dout (outer (g y)) ∧ 0 < D y - D x := by
  have hdy := hsplit (g y)
  have hdx := hsplit (g x)
  rw [hkeep] at hdy hdx
  rw [hx, he0] at hdx
  rw [hrep] at hdy
  have heq : D y - D x = Dout (outer (g y)) := by omega
  refine ⟨heq, ?_⟩
  rcases (hpos (g y)).lt_or_eq with h | h
  · omega
  · exfalso
    apply hxy
    apply hg
    exact (hsep _ _ hrep ((hzero _ h.symm).trans hx.symm)).symm

private theorem fin_iterate_val {V : Type*} [DecidableEq V] (F : Equiv.Perm Pair)
    (s : Schedule V) (hk : ∀ M ∈ s, M.Keeps F) (T : Nat) (x : FinConfig V) :
    ((finRoundPerm F s hk)^[T] x).1 = (round F s)^[T] x.1 := by
  induction T generalizing x with
  | zero => rfl
  | succ T ih => rw [iterate_succ_apply, iterate_succ_apply, ih]; rfl

private theorem fin_iterate_finite {V : Type*} [DecidableEq V] (F : Equiv.Perm Pair)
    (s : Schedule V) (hk : ∀ M ∈ s, M.Keeps F) (T : Nat) (x : FinConfig V) :
    (support ((round F s)^[T] x.1)).Finite := by
  rw [← fin_iterate_val F s hk T x]
  exact ((finRoundPerm F s hk)^[T] x).2

private theorem fin_iterate_dCount {V : Type*} [DecidableEq V] (F : Equiv.Perm Pair)
    (hQ : PrSumPres F) (hD : PrDCons F) (s : Schedule V) (hk : ∀ M ∈ s, M.Keeps F) (T : Nat)
    (x : FinConfig V) : dCount ((round F s)^[T] x.1) = dCount x.1 := by
  rw [← fin_iterate_val F s hk T x]
  induction T generalizing x with
  | zero => rfl
  | succ T ih =>
    rw [iterate_succ_apply, ih]
    exact (thm_cmp_round_perm_charge_negation F hQ s hk).2.2.2.2.1 hD x

private theorem toneSq_nonneg (t : Tone) : 0 ≤ toneSq t := by cases t <;> decide

private theorem toneSq_eq_zero (t : Tone) : toneSq t = 0 ↔ t = .zero := by cases t <;> decide

/-- A tone weight vanishing on the vacuum sums over any finset holding the support. -/
private theorem total_eq_sum {V : Type*} (w : Tone → Int) (hw0 : w .zero = 0) (x : Config V)
    (T : Finset V) (hT : support x ⊆ ↑T) : total w x = ∑ v ∈ T, w (x v) := by
  unfold total
  refine finsum_eq_sum_of_support_subset _ ?_
  intro v hv
  apply hT
  intro e
  apply hv
  simp only [e, hw0]

/-- The excitation count off `B`: the `D` the exterior carries. -/
noncomputable def exteriorD {V : Type*} (B : Set V) (x : Config V) : Int :=
  ∑ᶠ v, Set.indicator Bᶜ (fun u => toneSq (x u)) v

/-- **A22, rounds.** For any vertex type, schedule, and pair rule permuting `Tone × Tone` that
    keeps `Q` and `D = sum t^2` (every matching keeping the rule): let the unperturbed run of `x`
    hold no tone off `B` at round `T`, and let the hit `y ≠ x` be repaired on `B` at round `T`.
    Then the exterior carries `delta D` (`dCount y - dCount x = exteriorD B (state of y at T)`)
    and `delta D > 0`. -/
theorem thm_cmp_d_theorem {V : Type*} [DecidableEq V] (F : Equiv.Perm Pair) (hQ : PrSumPres F)
    (hD : PrDCons F) (s : Schedule V) (hk : ∀ M ∈ s, M.Keeps F) (B : Set V) (T : Nat)
    (x y : FinConfig V) (hxy : x.1 ≠ y.1)
    (hx : ∀ v, v ∉ B → (round F s)^[T] x.1 v = .zero)
    (hrep : ∀ v ∈ B, (round F s)^[T] y.1 v = (round F s)^[T] x.1 v) :
    dCount y.1 - dCount x.1 = exteriorD B ((round F s)^[T] y.1) ∧ 0 < dCount y.1 - dCount x.1 := by
  classical
  set a := (round F s)^[T] y.1 with ha
  set b := (round F s)^[T] x.1 with hb
  have hfa := fin_iterate_finite F s hk T y
  have hfb := fin_iterate_finite F s hk T x
  rw [← ha] at hfa
  rw [← hb] at hfb
  let U : Finset V := (hfa.union hfb).toFinset
  have hUa : support a ⊆ ↑U := fun v hv => (Set.Finite.mem_toFinset _).2 (Or.inl hv)
  have hUb : support b ⊆ ↑U := fun v hv => (Set.Finite.mem_toFinset _).2 (Or.inr hv)
  have hpt : ∀ v, toneSq (a v) = toneSq (b v) + Set.indicator Bᶜ (fun u => toneSq (a u)) v := by
    intro v
    by_cases hv : v ∈ B
    · rw [Set.indicator_of_notMem (by simpa using hv), hrep v hv]
      omega
    · rw [Set.indicator_of_mem (by simpa using hv), hx v hv]
      simp [toneSq, Tone.value]
  have hext : exteriorD B a = ∑ v ∈ U, Set.indicator Bᶜ (fun u => toneSq (a u)) v := by
    unfold exteriorD
    refine finsum_eq_sum_of_support_subset _ ?_
    intro v hv
    apply hUa
    intro e
    apply hv
    by_cases hB : v ∈ Bᶜ
    · rw [Set.indicator_of_mem hB, e]
      rfl
    · rw [Set.indicator_of_notMem hB]
  have hsum : dCount a = dCount b + exteriorD B a := by
    unfold dCount
    rw [total_eq_sum toneSq rfl a U hUa, total_eq_sum toneSq rfl b U hUb, hext,
      ← Finset.sum_add_distrib]
    exact Finset.sum_congr rfl fun v _ => hpt v
  have hka : dCount a = dCount y.1 := fin_iterate_dCount F hQ hD s hk T y
  have hkb : dCount b = dCount x.1 := fin_iterate_dCount F hQ hD s hk T x
  have heq : dCount y.1 - dCount x.1 = exteriorD B a := by omega
  refine ⟨heq, ?_⟩
  have hnn : ∀ v ∈ U, 0 ≤ Set.indicator Bᶜ (fun u => toneSq (a u)) v := by
    intro v _
    by_cases hB : v ∈ Bᶜ
    · rw [Set.indicator_of_mem hB]
      exact toneSq_nonneg _
    · rw [Set.indicator_of_notMem hB]
  have hpos : 0 ≤ exteriorD B a := by
    rw [hext]
    exact Finset.sum_nonneg hnn
  rcases hpos.lt_or_eq with h | h
  · omega
  · exfalso
    have hz := (Finset.sum_eq_zero_iff_of_nonneg hnn).1 (hext ▸ h.symm)
    apply hxy
    apply (roundPerm F s).injective.iterate T
    show b = a
    funext v
    by_cases hv : v ∈ B
    · exact (hrep v hv).symm
    · rw [hx v hv]
      by_cases hU : v ∈ U
      · have := hz v hU
        rw [Set.indicator_of_mem (by simpa using hv)] at this
        exact ((toneSq_eq_zero _).1 this).symm
      · by_contra hne
        exact hU (hUa (fun e => hne e.symm))

/-- **A22, corollary.** Under the same rounds, a hit that lowers or keeps every cell's `t^2`
    (an erase or a sign flip of any set of cells, two-cell hits included) is never repaired on a
    structure whose unperturbed run stays inside `B`. -/
theorem thm_cmp_d_no_repair_of_erase {V : Type*} [DecidableEq V] (F : Equiv.Perm Pair)
    (hQ : PrSumPres F) (hD : PrDCons F) (s : Schedule V) (hk : ∀ M ∈ s, M.Keeps F) (B : Set V)
    (T : Nat) (x y : FinConfig V) (hxy : x.1 ≠ y.1)
    (hx : ∀ v, v ∉ B → (round F s)^[T] x.1 v = .zero)
    (hle : ∀ v, toneSq (y.1 v) ≤ toneSq (x.1 v)) :
    ¬ ∀ v ∈ B, (round F s)^[T] y.1 v = (round F s)^[T] x.1 v := by
  intro hrep
  have hpos := (thm_cmp_d_theorem F hQ hD s hk B T x y hxy hx hrep).2
  classical
  let U : Finset V := (y.2.union x.2).toFinset
  have hUy : support y.1 ⊆ ↑U := fun v hv => (Set.Finite.mem_toFinset _).2 (Or.inl hv)
  have hUx : support x.1 ⊆ ↑U := fun v hv => (Set.Finite.mem_toFinset _).2 (Or.inr hv)
  have hdle : dCount y.1 ≤ dCount x.1 := by
    unfold dCount
    rw [total_eq_sum toneSq rfl _ U hUy, total_eq_sum toneSq rfl _ U hUx]
    exact Finset.sum_le_sum fun v _ => hle v
  omega

/-! ## A23: Z3-linear rules are additive mod 3 -/

/-- A tone as a residue mod 3 (`0, +1, -1` read as `0, 1, 2`, as in `z3-linear-pair.ts`). -/
def toneZ3 : Tone → ZMod 3
  | .neg => 2
  | .zero => 0
  | .pos => 1

/-- A residue mod 3 as a tone. -/
def z3Tone (r : ZMod 3) : Tone := if r = 0 then .zero else if r = 1 then .pos else .neg

private theorem toneZ3_z3Tone (r : ZMod 3) : toneZ3 (z3Tone r) = r := by
  revert r
  decide

/-- Residue-wise sum of two pairs. -/
def prAdd (p q : Pair) : Pair :=
  (z3Tone (toneZ3 p.1 + toneZ3 q.1), z3Tone (toneZ3 p.2 + toneZ3 q.2))

/-- Residue-wise sum of two configurations. -/
def zAdd {V : Type*} (x d : Config V) : Config V := fun v => z3Tone (toneZ3 (x v) + toneZ3 (d v))

/-- A pair rule additive mod 3. -/
def Z3Additive (f : Pair → Pair) : Prop := ∀ p q, f (prAdd p q) = prAdd (f p) (f q)

/-- The Z3-linear pair rule of matrix `[a, b; c, d]`: `(x, y) -> (a x + b y, c x + d y)` mod 3. -/
def z3LinearRule (a b c d : ZMod 3) (p : Pair) : Pair :=
  (z3Tone (a * toneZ3 p.1 + b * toneZ3 p.2), z3Tone (c * toneZ3 p.1 + d * toneZ3 p.2))

/-- Every Z3-linear pair rule is additive mod 3. -/
theorem thm_cmp_z3_linear_additive (a b c d : ZMod 3) : Z3Additive (z3LinearRule a b c d) := by
  intro p q
  simp only [z3LinearRule, prAdd, toneZ3_z3Tone, Prod.mk.injEq]
  constructor <;> congr 1 <;> ring

private theorem step_zAdd {V : Type*} [DecidableEq V] (M : Matching V) (f : Pair → Pair)
    (hf : Z3Additive f) (x d : Config V) :
    M.step f (zAdd x d) = zAdd (M.step f x) (M.step f d) := by
  funext v
  by_cases h : M.mate v = v
  · simp only [Matching.step, zAdd, h, ↓reduceIte]
  · cases hl : M.lead v with
    | true =>
      simp only [Matching.step, zAdd, h, hl, ↓reduceIte]
      exact congrArg Prod.fst (hf (x v, x (M.mate v)) (d v, d (M.mate v)))
    | false =>
      simp only [Matching.step, zAdd, h, hl, Bool.false_eq_true, ↓reduceIte]
      exact congrArg Prod.snd (hf (x (M.mate v), x v) (d (M.mate v), d v))

private theorem round_zAdd {V : Type*} [DecidableEq V] (f : Pair → Pair) (hf : Z3Additive f)
    (s : Schedule V) (x d : Config V) : round f s (zAdd x d) = zAdd (round f s x) (round f s d) := by
  induction s generalizing x d with
  | nil => rfl
  | cons M s ih =>
    show round f s (M.step f (zAdd x d)) = zAdd (round f s (M.step f x)) (round f s (M.step f d))
    rw [step_zAdd M f hf, ih]

private theorem zAdd_eq_left (t u : Tone) : z3Tone (toneZ3 t + toneZ3 u) = t ↔ u = .zero := by
  cases t <;> cases u <;> decide

/-- **A23.** For any vertex type, any schedule and any pair rule additive mod 3 (every Z3-linear
    rule): every iterate of the round is additive mod 3, so the perturbed run of `x ⊕ d` is the
    unperturbed run of `x` plus the lone run of the perturbation `d` from the vacuum, residue by
    residue; a hit is repaired on `B` at round `T` exactly when the lone run is off `B` at round
    `T`; and it stays repaired over a window of rounds exactly when the lone run stays off `B`
    over that window. -/
theorem thm_cmp_z3_superposition {V : Type*} [DecidableEq V] (f : Pair → Pair)
    (hf : Z3Additive f) (s : Schedule V) (x d : Config V) (B : Set V) :
    (∀ T, (round f s)^[T] (zAdd x d) = zAdd ((round f s)^[T] x) ((round f s)^[T] d)) ∧
    (∀ T, (∀ v ∈ B, (round f s)^[T] (zAdd x d) v = (round f s)^[T] x v) ↔
      (∀ v ∈ B, (round f s)^[T] d v = .zero)) ∧
    (∀ W : Set Nat, (∀ T ∈ W, ∀ v ∈ B, (round f s)^[T] (zAdd x d) v = (round f s)^[T] x v) ↔
      (∀ T ∈ W, ∀ v ∈ B, (round f s)^[T] d v = .zero)) := by
  have hsup : ∀ T, (round f s)^[T] (zAdd x d) = zAdd ((round f s)^[T] x) ((round f s)^[T] d) := by
    intro T
    induction T with
    | zero => rfl
    | succ T ih => rw [iterate_succ_apply', iterate_succ_apply', iterate_succ_apply', ih,
        round_zAdd f hf]
  have hpt : ∀ T, (∀ v ∈ B, (round f s)^[T] (zAdd x d) v = (round f s)^[T] x v) ↔
      (∀ v ∈ B, (round f s)^[T] d v = .zero) := by
    intro T
    rw [hsup T]
    exact forall₂_congr fun v _ => zAdd_eq_left _ _
  exact ⟨hsup, hpt, fun W => forall₂_congr fun T _ => hpt T⟩

end Compute

end Vibe
