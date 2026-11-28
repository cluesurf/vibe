import Mathlib.Algebra.Order.BigOperators.Group.Finset
import Mathlib.Algebra.Group.Even
import Vibe.Compute.Boundary

/-!
# Vibe Computation Lab: Association without Weights (M7)

The claims of milestone M7 that hold for every box (claims A18 and A19),
built on `Vibe.Compute.Round` (`round`, `roundPerm`, `finRoundPerm`, `charge`, `dCount`,
`thm_cmp_round_perm_charge_negation`, `thm_cmp_pair_rule_perm`) and `Vibe.Compute.Boundary`
(`exteriorD`, `interior`, `thm_cmp_d_no_repair_of_erase`, `thm_cmp_finite_perm_return`).

A *cue* `c` and a *word* `p` are configurations of finite support on the vacuum background
`b = 0`; the word holds no tone off the readout region `R`. The cue *ends as* `p` on `R` at
round `T` when the state of `c` at round `T` agrees with `p` on every cell of `R`. The word is
*stored* at round `T` when the cue `p` itself ends as `p` on `R` at round `T` (m7's definition asks
this at every round 24 to 48, so it holds at any round a completion is read).

Headline theorems:
1. `thm_cmp_completion_charges` (A18, any rule keeping `Q` and `D`, any vertex type, any
   schedule, open or closed): if `c` ends as `p` on `R`, the cells off `R` carry
   `Q(c) - Q(p)` and `D(c) - D(p)`, and these are the charges of a finite configuration on the
   vacuum: `D(c) - D(p) = a + b` and `Q(c) - Q(p) = a - b` for naturals `a` (tones `+1` off `R`)
   and `b` (tones `-1` off `R`). So `|Q(c) - Q(p)| <= D(c) - D(p)` with equal parity.
2. `thm_cmp_vacuum_rule_completion_bound` (A18, the 8 vacuum-fixing rules): the same for every
   conservative reversible pair rule that fixes the vacuum pair (`thm_pair_rule_vacuum_iff`:
   exactly 8 of the 24, and these are exactly the ones keeping `D`).
3. `thm_cmp_no_erase_flip_completion` and `thm_cmp_vacuum_rule_no_erase_flip` (A18, the
   no-go): a cue made from `p` by erasing entries (`D` falls) never ends as `p` on `R`; a cue
   with the same `D` and a different `Q` (a flip that moves the charge) never does; and a cue
   made from `p` by any mix of erases and sign flips, `c ≠ p`, never ends as `p` on `R` at a
   round where `p` is stored.
4. `thm_cmp_closed_coincidence_transient` (A19, any permutation of a finite set, any readout)
   and `thm_cmp_closed_box_completion_transient` (A19, rounds on a finite vertex type): every
   state returns to itself after some `P > 0` rounds, so the readout on `R` shows the cue's own
   word at arbitrarily late rounds; a cue whose word on `R` differs from `p` never ends as `p`
   on `R` from some round on, and two cues with different words on `R` never merge from some
   round on.

The Lean definitions here speak about Lean rounds, not a generated table of
`code/compute/lab/association.ts`. Mathlib (`finsum`, `Finset.sum`,
`Set.indicator`, `Equiv.Perm`, `Even`), zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Function

/-! ## Weights off a region -/

/-- The total of a tone weight over the cells off `R` (`offTotal toneSq` is Boundary's
    `exteriorD`, by definition). -/
noncomputable def offTotal {V : Type*} (w : Tone → Int) (R : Set V) (x : Config V) : Int :=
  ∑ᶠ v, Set.indicator Rᶜ (fun u => w (x u)) v

/-- The weight of a `+1` tone. -/
def tonePos (t : Tone) : Int := if t = .pos then 1 else 0

/-- The weight of a `-1` tone. -/
def toneNeg (t : Tone) : Int := if t = .neg then 1 else 0

private theorem toneSq_split (t : Tone) : toneSq t = tonePos t + toneNeg t := by
  cases t <;> decide

private theorem value_split (t : Tone) : t.value = tonePos t - toneNeg t := by
  cases t <;> decide

private theorem tonePos_nonneg (t : Tone) : 0 ≤ tonePos t := by cases t <;> decide

private theorem toneNeg_nonneg (t : Tone) : 0 ≤ toneNeg t := by cases t <;> decide

private theorem toneSq_nonneg' (t : Tone) : 0 ≤ toneSq t := by cases t <;> decide

private theorem toneSq_eq_zero' (t : Tone) : toneSq t = 0 ↔ t = .zero := by cases t <;> decide

private theorem total_eq_sum' {V : Type*} (w : Tone → Int) (hw0 : w .zero = 0) (x : Config V)
    (U : Finset V) (hU : support x ⊆ ↑U) : total w x = ∑ v ∈ U, w (x v) := by
  unfold total
  refine finsum_eq_sum_of_support_subset _ ?_
  intro v hv
  apply hU
  intro e
  apply hv
  simp only [e, hw0]

private theorem offTotal_eq_sum {V : Type*} (w : Tone → Int) (hw0 : w .zero = 0) (R : Set V)
    (x : Config V) (U : Finset V) (hU : support x ⊆ ↑U) :
    offTotal w R x = ∑ v ∈ U, Set.indicator Rᶜ (fun u => w (x u)) v := by
  unfold offTotal
  refine finsum_eq_sum_of_support_subset _ ?_
  intro v hv
  apply hU
  intro e
  apply hv
  by_cases hB : v ∈ Rᶜ
  · rw [Set.indicator_of_mem hB, e, hw0]
  · rw [Set.indicator_of_notMem hB]

/-- If `y` agrees with `p` on `R` and `p` is vacuum off `R`, any weight vanishing on the vacuum
    splits as `p`'s total plus `y`'s total off `R`. -/
private theorem total_split {V : Type*} (w : Tone → Int) (hw0 : w .zero = 0) (R : Set V)
    (y p : Config V) (U : Finset V) (hUy : support y ⊆ ↑U) (hUp : support p ⊆ ↑U)
    (hp : ∀ v, v ∉ R → p v = .zero) (hag : ∀ v ∈ R, y v = p v) :
    total w y = total w p + offTotal w R y := by
  rw [total_eq_sum' w hw0 y U hUy, total_eq_sum' w hw0 p U hUp, offTotal_eq_sum w hw0 R y U hUy,
    ← Finset.sum_add_distrib]
  refine Finset.sum_congr rfl fun v _ => ?_
  by_cases hv : v ∈ R
  · rw [Set.indicator_of_notMem (by simpa using hv), hag v hv]
    omega
  · rw [Set.indicator_of_mem (by simpa using hv), hp v hv, hw0]
    omega

/-! ## Rounds of a D-keeping rule -/

section Rounds

variable {V : Type*} [DecidableEq V]

/-- A pair rule keeping `D` fixes the vacuum pair. -/
private theorem vac_of_dcons (f : Pair → Pair) (hD : PrDCons f) : f prVac = prVac := by
  have h := hD prVac
  generalize f prVac = q at h ⊢
  obtain ⟨a, b⟩ := q
  revert h
  cases a <;> cases b <;> decide

omit [DecidableEq V] in
private theorem keeps_of_dcons (F : Equiv.Perm Pair) (hD : PrDCons F) (s : Schedule V) :
    ∀ M ∈ s, M.Keeps F := fun _ _ => Or.inl (vac_of_dcons F hD)

/-- Every iterate of a round keeping `Q` and `D` keeps finite support, `Q` and `D`. -/
private theorem iter_keep (F : Equiv.Perm Pair) (hQ : PrSumPres F) (hD : PrDCons F)
    (s : Schedule V) : ∀ (T : Nat) (x : Config V), (support x).Finite →
      (support ((round F s)^[T] x)).Finite ∧ charge ((round F s)^[T] x) = charge x ∧
      dCount ((round F s)^[T] x) = dCount x := by
  have hk := keeps_of_dcons F hD s
  have hA := thm_cmp_round_perm_charge_negation F hQ s hk
  intro T
  induction T with
  | zero => exact fun x hx => ⟨hx, rfl, rfl⟩
  | succ T ih =>
    intro x hx
    rw [iterate_succ_apply]
    have h1 : (support (round F s x)).Finite := (finRoundPerm F s hk ⟨x, hx⟩).2
    obtain ⟨a, b, c⟩ := ih _ h1
    exact ⟨a, b.trans (hA.2.2.2.1 ⟨x, hx⟩), c.trans (hA.2.2.2.2.1 hD ⟨x, hx⟩)⟩

/-- A finite-support configuration with no `D` off `R` is vacuum off `R`. -/
private theorem off_vacuum_of_offD_zero (R : Set V) (y : Config V) (hy : (support y).Finite)
    (h0 : offTotal toneSq R y = 0) : ∀ v, v ∉ R → y v = .zero := by
  classical
  let U : Finset V := hy.toFinset
  have hU : support y ⊆ ↑U := fun v hv => (Set.Finite.mem_toFinset _).2 hv
  have hnn : ∀ v ∈ U, 0 ≤ Set.indicator Rᶜ (fun u => toneSq (y u)) v := by
    intro v _
    by_cases hB : v ∈ Rᶜ
    · rw [Set.indicator_of_mem hB]
      exact toneSq_nonneg' _
    · rw [Set.indicator_of_notMem hB]
  rw [offTotal_eq_sum toneSq rfl R y U hU] at h0
  have hz := (Finset.sum_eq_zero_iff_of_nonneg hnn).1 h0
  intro v hv
  by_cases hvU : v ∈ U
  · have := hz v hvU
    rw [Set.indicator_of_mem (by simpa using hv)] at this
    exact (toneSq_eq_zero' _).1 this
  · by_contra hne
    exact hvU (hU hne)

/-- **A18, any rule keeping `Q` and `D`.** For any vertex type (any graph, the open window
    included), any schedule, and any pair rule permuting `Tone × Tone` that keeps the pair sum
    and `t^2` (so it fixes the vacuum pair): let the cue `c` end as the word `p` on `R` at round
    `T`, with `p` vacuum off `R`. Then the cells off `R` carry `Q(c) - Q(p)` and
    `D(c) - D(p)`, these are the charges of a finite configuration on the vacuum
    (`D(c) - D(p) = a + b`, `Q(c) - Q(p) = a - b`, with `a` the `+1` tones and `b` the `-1`
    tones off `R`), so `|Q(c) - Q(p)| <= D(c) - D(p)` and the two have equal parity. -/
theorem thm_cmp_completion_charges (F : Equiv.Perm Pair) (hQ : PrSumPres F) (hD : PrDCons F)
    (s : Schedule V) (R : Set V) (T : Nat) (c p : FinConfig V)
    (hp : ∀ v, v ∉ R → p.1 v = .zero) (hend : ∀ v ∈ R, (round F s)^[T] c.1 v = p.1 v) :
    charge c.1 - charge p.1 = offTotal Tone.value R ((round F s)^[T] c.1) ∧
    dCount c.1 - dCount p.1 = offTotal toneSq R ((round F s)^[T] c.1) ∧
    (∃ a b : Nat, dCount c.1 - dCount p.1 = a + b ∧ charge c.1 - charge p.1 = a - b) ∧
    |charge c.1 - charge p.1| ≤ dCount c.1 - dCount p.1 ∧
    Even ((dCount c.1 - dCount p.1) - (charge c.1 - charge p.1)) := by
  classical
  obtain ⟨hfy, hcq, hcd⟩ := iter_keep F hQ hD s T c.1 c.2
  set y := (round F s)^[T] c.1 with hy
  let U : Finset V := (hfy.union p.2).toFinset
  have hUy : support y ⊆ ↑U := fun v hv => (Set.Finite.mem_toFinset _).2 (Or.inl hv)
  have hUp : support p.1 ⊆ ↑U := fun v hv => (Set.Finite.mem_toFinset _).2 (Or.inr hv)
  have hQs := total_split Tone.value rfl R y p.1 U hUy hUp hp hend
  have hDs := total_split toneSq rfl R y p.1 U hUy hUp hp hend
  have hQo : charge c.1 - charge p.1 = offTotal Tone.value R y := by
    unfold charge at hcq ⊢
    omega
  have hDo : dCount c.1 - dCount p.1 = offTotal toneSq R y := by
    unfold dCount at hcd ⊢
    omega
  let A : Int := ∑ v ∈ U, Set.indicator Rᶜ (fun u => tonePos (y u)) v
  let B : Int := ∑ v ∈ U, Set.indicator Rᶜ (fun u => toneNeg (y u)) v
  have hA0 : 0 ≤ A := Finset.sum_nonneg fun v _ =>
    Set.indicator_nonneg (fun u _ => tonePos_nonneg (y u)) v
  have hB0 : 0 ≤ B := Finset.sum_nonneg fun v _ =>
    Set.indicator_nonneg (fun u _ => toneNeg_nonneg (y u)) v
  have hDAB : offTotal toneSq R y = A + B := by
    rw [offTotal_eq_sum toneSq rfl R y U hUy, ← Finset.sum_add_distrib]
    refine Finset.sum_congr rfl fun v _ => ?_
    by_cases hv : v ∈ Rᶜ
    · simp only [Set.indicator_of_mem hv, toneSq_split]
    · simp only [Set.indicator_of_notMem hv, add_zero]
  have hQAB : offTotal Tone.value R y = A - B := by
    rw [offTotal_eq_sum Tone.value rfl R y U hUy, ← Finset.sum_sub_distrib]
    refine Finset.sum_congr rfl fun v _ => ?_
    by_cases hv : v ∈ Rᶜ
    · simp only [Set.indicator_of_mem hv, value_split]
    · simp only [Set.indicator_of_notMem hv, sub_zero]
  refine ⟨hQo, hDo, ⟨A.toNat, B.toNat, ?_, ?_⟩, ?_, ?_⟩
  · rw [Int.toNat_of_nonneg hA0, Int.toNat_of_nonneg hB0]
    omega
  · rw [Int.toNat_of_nonneg hA0, Int.toNat_of_nonneg hB0]
    omega
  · rw [abs_le]
    constructor <;> omega
  · exact ⟨B, by omega⟩

/-- **A18, the 8 vacuum-fixing rules.** Every conservative reversible pair rule that fixes the
    vacuum pair (8 of the 24, `thm_pair_rule_vacuum_iff`) obeys the completion bound of
    `thm_cmp_completion_charges` on any vertex type and schedule, open or closed. -/
theorem thm_cmp_vacuum_rule_completion_bound (B : Pair → Pair) (hS : PrSumPres B)
    (hI : PrInj B) (hvac : B prVac = prVac) (s : Schedule V) (R : Set V) (T : Nat)
    (c p : FinConfig V) (hp : ∀ v, v ∉ R → p.1 v = .zero)
    (hend : ∀ v ∈ R, (round B s)^[T] c.1 v = p.1 v) :
    charge c.1 - charge p.1 = offTotal Tone.value R ((round B s)^[T] c.1) ∧
    dCount c.1 - dCount p.1 = offTotal toneSq R ((round B s)^[T] c.1) ∧
    (∃ a b : Nat, dCount c.1 - dCount p.1 = a + b ∧ charge c.1 - charge p.1 = a - b) ∧
    |charge c.1 - charge p.1| ≤ dCount c.1 - dCount p.1 ∧
    Even ((dCount c.1 - dCount p.1) - (charge c.1 - charge p.1)) := by
  have hD : PrDCons B := ((thm_pair_rule_vacuum_iff.1 B hS hI).1).1 hvac
  obtain ⟨F, hF, hFS, -, -⟩ := thm_cmp_pair_rule_perm B hS hI
  subst hF
  exact thm_cmp_completion_charges F hFS hD s R T c p hp hend

/-- **A18, the no-go, any rule keeping `Q` and `D`.** On any vertex type and schedule, for a
    word `p` vacuum off `R`:
    1. a cue with `D(c) < D(p)` (some entry of `p` erased, the rest erased, flipped or kept)
       never ends as `p` on `R`;
    2. a cue with `D(c) = D(p)` and `Q(c) ≠ Q(p)` (a sign flip that moves the charge) never does;
    3. a cue `c ≠ p` made from `p` by any mix of erases and sign flips (`t^2` falls or stays at
       every cell) never ends as `p` on `R` at a round where `p` is stored. -/
theorem thm_cmp_no_erase_flip_completion (F : Equiv.Perm Pair) (hQ : PrSumPres F)
    (hD : PrDCons F) (s : Schedule V) (R : Set V) (T : Nat) (c p : FinConfig V)
    (hp : ∀ v, v ∉ R → p.1 v = .zero) :
    (dCount c.1 < dCount p.1 → ¬ ∀ v ∈ R, (round F s)^[T] c.1 v = p.1 v) ∧
    (dCount c.1 = dCount p.1 → charge c.1 ≠ charge p.1 →
      ¬ ∀ v ∈ R, (round F s)^[T] c.1 v = p.1 v) ∧
    ((∀ v, toneSq (c.1 v) ≤ toneSq (p.1 v)) → c.1 ≠ p.1 →
      (∀ v ∈ R, (round F s)^[T] p.1 v = p.1 v) →
      ¬ ∀ v ∈ R, (round F s)^[T] c.1 v = p.1 v) := by
  refine ⟨fun hlt hend => ?_, fun heq hne hend => ?_, fun hle hcp hstore hend => ?_⟩
  · have h := (thm_cmp_completion_charges F hQ hD s R T c p hp hend).2.2.2.1
    have := abs_nonneg (charge c.1 - charge p.1)
    omega
  · have h := (thm_cmp_completion_charges F hQ hD s R T c p hp hend).2.2.2.1
    have hpos : 0 < |charge c.1 - charge p.1| := abs_pos.2 (sub_ne_zero.2 hne)
    omega
  · have hk := keeps_of_dcons F hD s
    have hpp := thm_cmp_completion_charges F hQ hD s R T p p hp hstore
    have hfp := (iter_keep F hQ hD s T p.1 p.2).1
    have hx : ∀ v, v ∉ R → (round F s)^[T] p.1 v = .zero :=
      off_vacuum_of_offD_zero R _ hfp (by have := hpp.2.1; omega)
    apply thm_cmp_d_no_repair_of_erase F hQ hD s hk R T p c (Ne.symm hcp) hx hle
    intro v hv
    rw [hend v hv, hstore v hv]

/-- **A18, the no-go, the 8 vacuum-fixing rules.** For every conservative reversible pair rule
    that fixes the vacuum pair, on any vertex type and schedule, open or closed: no erase and no
    charge-moving flip ever completes, and no mix of erases and flips completes toward a stored
    word. -/
theorem thm_cmp_vacuum_rule_no_erase_flip (B : Pair → Pair) (hS : PrSumPres B) (hI : PrInj B)
    (hvac : B prVac = prVac) (s : Schedule V) (R : Set V) (T : Nat) (c p : FinConfig V)
    (hp : ∀ v, v ∉ R → p.1 v = .zero) :
    (dCount c.1 < dCount p.1 → ¬ ∀ v ∈ R, (round B s)^[T] c.1 v = p.1 v) ∧
    (dCount c.1 = dCount p.1 → charge c.1 ≠ charge p.1 →
      ¬ ∀ v ∈ R, (round B s)^[T] c.1 v = p.1 v) ∧
    ((∀ v, toneSq (c.1 v) ≤ toneSq (p.1 v)) → c.1 ≠ p.1 →
      (∀ v ∈ R, (round B s)^[T] p.1 v = p.1 v) →
      ¬ ∀ v ∈ R, (round B s)^[T] c.1 v = p.1 v) := by
  have hD : PrDCons B := ((thm_pair_rule_vacuum_iff.1 B hS hI).1).1 hvac
  obtain ⟨F, hF, hFS, -, -⟩ := thm_cmp_pair_rule_perm B hS hI
  subst hF
  exact thm_cmp_no_erase_flip_completion F hFS hD s R T c p hp

end Rounds

/-! ## A19: closed-box coincidences are transient -/

/-- **A19, any permutation of a finite set.** Let `σ` permute a finite set of states (a closed
    box under any bijective dynamics, Blume-Capel included) and `r` be any readout. Every state
    `c` returns to itself after some `P > 0` steps and at every multiple of `P`; so the readout
    shows `r c` at arbitrarily late times; a readout value `w ≠ r c` is never held from some time
    on; and two states with different readouts never share their readout from some time on. -/
theorem thm_cmp_closed_coincidence_transient {α β : Type*} [Finite α] (σ : Equiv.Perm α)
    (r : α → β) (c : α) :
    (∃ P, 0 < P ∧ ∀ k, σ^[k * P] c = c) ∧
    (∀ T₀, ∃ t, T₀ ≤ t ∧ r (σ^[t] c) = r c) ∧
    (∀ w, r c ≠ w → ¬ ∃ T₀, ∀ t, T₀ ≤ t → r (σ^[t] c) = w) ∧
    (∀ c', r c ≠ r c' → ¬ ∃ T₀, ∀ t, T₀ ≤ t → r (σ^[t] c) = r (σ^[t] c')) := by
  have hmul : ∀ x : α, ∃ P, 0 < P ∧ ∀ k, σ^[k * P] x = x := by
    intro x
    obtain ⟨P, hP, hPx⟩ := thm_cmp_finite_perm_return σ x
    refine ⟨P, hP, fun k => ?_⟩
    induction k with
    | zero => simp
    | succ k ih => rw [Nat.succ_mul, iterate_add_apply, hPx, ih]
  obtain ⟨P, hP, hPc⟩ := hmul c
  have hlate : ∀ T₀, ∃ t, T₀ ≤ t ∧ r (σ^[t] c) = r c := by
    intro T₀
    refine ⟨T₀ * P, Nat.le_mul_of_pos_right T₀ hP, ?_⟩
    rw [hPc]
  refine ⟨⟨P, hP, hPc⟩, hlate, ?_, ?_⟩
  · rintro w hw ⟨T₀, hT⟩
    obtain ⟨t, ht, hrt⟩ := hlate T₀
    exact hw (hrt.symm.trans (hT t ht))
  · rintro c' hne ⟨T₀, hT⟩
    obtain ⟨P', hP', hPc'⟩ := hmul c'
    have h1 : σ^[(T₀ * P') * P] c = c := hPc _
    have h2 : σ^[(T₀ * P') * P] c' = c' := by
      rw [Nat.mul_assoc, Nat.mul_comm P' P, ← Nat.mul_assoc]
      exact hPc' _
    have hle : T₀ ≤ (T₀ * P') * P :=
      (Nat.le_mul_of_pos_right T₀ hP').trans (Nat.le_mul_of_pos_right _ hP)
    have := hT _ hle
    rw [h1, h2] at this
    exact hne this

/-- **A19, rounds.** On a finite vertex type (a closed box: a walled box or a quotient), for any
    schedule and any pair rule permuting `Tone × Tone` (the 16 creating rules included): every cue
    returns to itself after some `P > 0` rounds; a cue `c` whose word on `R` differs from `p`
    never ends as `p` on `R` at every round from some round on (a completion is transient: the
    readout shows the cue's own word again at arbitrarily late rounds); and two cues with
    different words on `R` never merge on `R` at every round from some round on. -/
theorem thm_cmp_closed_box_completion_transient {V : Type*} [DecidableEq V] [Finite V]
    (F : Equiv.Perm Pair) (s : Schedule V) (R : Set V) (c p : Config V) :
    (∃ P, 0 < P ∧ (round F s)^[P] c = c) ∧
    (∀ T₀, ∃ t, T₀ ≤ t ∧ ∀ v ∈ R, (round F s)^[t] c v = c v) ∧
    ((∃ v ∈ R, c v ≠ p v) →
      ¬ ∃ T₀, ∀ t, T₀ ≤ t → ∀ v ∈ R, (round F s)^[t] c v = p v) ∧
    (∀ c' : Config V, (∃ v ∈ R, c v ≠ c' v) →
      ¬ ∃ T₀, ∀ t, T₀ ≤ t → ∀ v ∈ R, (round F s)^[t] c v = (round F s)^[t] c' v) := by
  have : Finite Tone := by
    refine Finite.of_surjective
      (fun i : Fin 3 => if i = 0 then Tone.neg else if i = 1 then Tone.zero else Tone.pos) ?_
    intro t
    cases t
    · exact ⟨0, rfl⟩
    · exact ⟨1, rfl⟩
    · exact ⟨2, rfl⟩
  have hr : (round F s : Config V → Config V) = roundPerm F s := rfl
  obtain ⟨⟨P, hP, hPc⟩, hlate, hnot, hmerge⟩ :=
    thm_cmp_closed_coincidence_transient (roundPerm F s) (interior R) c
  have hagree : ∀ x y : Config V, interior R x = interior R y ↔ ∀ v ∈ R, x v = y v := by
    intro x y
    constructor
    · intro h v hv
      exact congrFun h ⟨v, hv⟩
    · intro h
      funext v
      exact h v.1 v.2
  refine ⟨⟨P, hP, ?_⟩, ?_, ?_, ?_⟩
  · rw [hr]
    simpa using hPc 1
  · intro T₀
    obtain ⟨t, ht, h⟩ := hlate T₀
    rw [hr]
    exact ⟨t, ht, (hagree _ _).1 h⟩
  · rintro ⟨v, hv, hne⟩ ⟨T₀, hT⟩
    apply hnot (interior R p)
    · intro h
      exact hne ((hagree _ _).1 h v hv)
    · refine ⟨T₀, fun t ht => (hagree _ _).2 ?_⟩
      rw [← hr]
      exact hT t ht
  · rintro c' ⟨v, hv, hne⟩ ⟨T₀, hT⟩
    apply hmerge c'
    · intro h
      exact hne ((hagree _ _).1 h v hv)
    · refine ⟨T₀, fun t ht => (hagree _ _).2 ?_⟩
      rw [← hr]
      exact hT t ht

end Compute

end Vibe
