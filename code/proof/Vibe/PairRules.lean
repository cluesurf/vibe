import Vibe.Tone

/-!
# Vibe Theory: The 24 Conservative Reversible Pair Rules

A pair rule maps a pair of tones `(a, b)` to `(a', b')`. It is conservative when `a + b = a' + b'`
and reversible when it is injective. The nine pairs split by their sum into fibers of size
`1, 2, 3, 2, 1`, so a sum-preserving map is one of `1 * 4 * 27 * 4 * 1 = 432` fiber-preserving tables,
indexed here by a mixed-radix code `n < 432` (`prTable`). Exactly `24` of them are injective
(`thm_pair_rules_card`). Under the cell swap `P` and the negation `C`, acting by conjugation, the 24
fall into `12` orbits (`thm_pair_rule_classes`, with the Burnside fixed-point counts). For these
rules, fixing the vacuum pair `(0, 0)`, conserving the excitation count `D = a^2 + b^2` and
commuting with the swap are equivalent; `8` rules in `6` classes have all three, and every rule that
creates `(-1, +1)` or `(+1, -1)` from the vacuum breaks the swap (`thm_pair_rule_vacuum_iff`). Every
rule has an explicit inverse among the 24 (`thm_pair_rule_inverse`).

Core Lean only: `decide` over finite tables, zero `sorry`, zero `axiom`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

/-- A pair of tones on the two cells of one matched edge. -/
abbrev Pair := Tone × Tone

/-- Charge `Q` of a pair: `a + b`. -/
def prSum (p : Pair) : Int := p.1.value + p.2.value

/-- Excitation count `D` of a pair: `a^2 + b^2`. -/
def prD (p : Pair) : Int := p.1.value * p.1.value + p.2.value * p.2.value

/-- The vacuum pair `(0, 0)`. -/
def prVac : Pair := (.zero, .zero)

/-- Cell swap `P`: `(a, b) ↦ (b, a)`. -/
def prSwap (p : Pair) : Pair := (p.2, p.1)

/-- Negation `C`: `(a, b) ↦ (-a, -b)`. -/
def prNeg (p : Pair) : Pair := (p.1.dual, p.2.dual)

/-- The fiber of sum `-1`, indexed by `k mod 2`. -/
def prFiberNeg (k : Nat) : Pair := if k % 2 = 0 then (.neg, .zero) else (.zero, .neg)

/-- The fiber of sum `0`, `A = (-1,+1)`, `B = (0,0)`, `C = (+1,-1)`, indexed by `k mod 3`. -/
def prFiberZero (k : Nat) : Pair :=
  if k % 3 = 0 then (.neg, .pos) else if k % 3 = 1 then (.zero, .zero) else (.pos, .neg)

/-- The fiber of sum `+1`, indexed by `k mod 2`. -/
def prFiberPos (k : Nat) : Pair := if k % 2 = 0 then (.zero, .pos) else (.pos, .zero)

/-- The fiber-preserving table with mixed-radix code `n` (radices `2, 2, 3, 3, 3, 2, 2`). -/
def prTable (n : Nat) : Pair → Pair
  | (.neg, .neg)   => (.neg, .neg)
  | (.neg, .zero)  => prFiberNeg (n % 2)
  | (.zero, .neg)  => prFiberNeg (n / 2 % 2)
  | (.neg, .pos)   => prFiberZero (n / 4 % 3)
  | (.zero, .zero) => prFiberZero (n / 12 % 3)
  | (.pos, .neg)   => prFiberZero (n / 36 % 3)
  | (.zero, .pos)  => prFiberPos (n / 108 % 2)
  | (.pos, .zero)  => prFiberPos (n / 216 % 2)
  | (.pos, .pos)   => (.pos, .pos)

def prNegIdx (q : Pair) : Nat := if q = (.zero, .neg) then 1 else 0
def prZeroIdx (q : Pair) : Nat :=
  if q = (.zero, .zero) then 1 else if q = (.pos, .neg) then 2 else 0
def prPosIdx (q : Pair) : Nat := if q = (.pos, .zero) then 1 else 0

/-- The code of a map, read off its seven non-trivial values. -/
def prCodeOf (f : Pair → Pair) : Nat :=
  prNegIdx (f (.neg, .zero)) + 2 * prNegIdx (f (.zero, .neg)) + 4 * prZeroIdx (f (.neg, .pos)) +
    12 * prZeroIdx (f (.zero, .zero)) + 36 * prZeroIdx (f (.pos, .neg)) +
    108 * prPosIdx (f (.zero, .pos)) + 216 * prPosIdx (f (.pos, .zero))

/-- All nine pairs. -/
def prAllPairs : List Pair :=
  [ (.neg, .neg), (.neg, .zero), (.neg, .pos), (.zero, .neg), (.zero, .zero),
    (.zero, .pos), (.pos, .neg), (.pos, .zero), (.pos, .pos) ]

/-- `f` preserves the charge of every pair. -/
def PrSumPres (f : Pair → Pair) : Prop := ∀ p, prSum (f p) = prSum p

/-- `f` is injective. -/
def PrInj (f : Pair → Pair) : Prop := ∀ p q, f p = f q → p = q

/-- `f` conserves the excitation count `D`. -/
def PrDCons (f : Pair → Pair) : Prop := ∀ p, prD (f p) = prD p

/-- `f` commutes with the cell swap. -/
def PrSwapComm (f : Pair → Pair) : Prop := ∀ p, f (prSwap p) = prSwap (f p)

def prInjB (f : Pair → Pair) : Bool :=
  prAllPairs.all fun p => prAllPairs.all fun q => !(decide (f p = f q)) || decide (p = q)

def prDConsB (f : Pair → Pair) : Bool := prAllPairs.all fun p => decide (prD (f p) = prD p)

def prSwapB (f : Pair → Pair) : Bool :=
  prAllPairs.all fun p => decide (f (prSwap p) = prSwap (f p))

/-- The codes of the injective tables: the conservative reversible pair rules. -/
def prRuleCodes : List Nat := (List.range 432).filter fun n => prInjB (prTable n)

/-- Conjugation by the cell swap `P`. -/
def prConjP (f : Pair → Pair) : Pair → Pair := fun p => prSwap (f (prSwap p))

/-- Conjugation by the negation `C`. -/
def prConjC (f : Pair → Pair) : Pair → Pair := fun p => prNeg (f (prNeg p))

/-- The orbit of code `n` under `{1, P, C, PC}`, as codes. -/
def prOrbit (n : Nat) : List Nat :=
  [n, prCodeOf (prConjP (prTable n)), prCodeOf (prConjC (prTable n)),
    prCodeOf (prConjP (prConjC (prTable n)))]

/-- The least code in the orbit of `n`. -/
def prOrbitMin (n : Nat) : Nat := (prOrbit n).foldl min n

/-- One representative per orbit: the rules that are the least code of their orbit. -/
def prClassReps : List Nat := prRuleCodes.filter fun n => decide (prOrbitMin n = n)

/-- The code of the inverse rule, found among the 24. -/
def prInvCode (n : Nat) : Nat :=
  (prRuleCodes.find? fun m => prAllPairs.all fun p => decide (prTable m (prTable n p) = p)).getD 0

/-! ## Fibers and codes -/

private theorem pr_tone_dual_dual (t : Tone) : t.dual.dual = t := by
  cases t <;> rfl

theorem pr_mem_allPairs (p : Pair) : p ∈ prAllPairs := by
  rcases p with ⟨a, b⟩
  cases a <;> cases b <;> decide

private theorem pr_negIdx_le (q : Pair) : prNegIdx q ≤ 1 := by
  unfold prNegIdx; split <;> omega

private theorem pr_zeroIdx_le (q : Pair) : prZeroIdx q ≤ 2 := by
  unfold prZeroIdx; split
  · omega
  · split <;> omega

private theorem pr_posIdx_le (q : Pair) : prPosIdx q ≤ 1 := by
  unfold prPosIdx; split <;> omega

private theorem pr_fiber_neg2 (q : Pair) (h : prSum q = -2) : q = (.neg, .neg) := by
  rcases q with ⟨a, b⟩
  cases a <;> cases b <;> first | rfl | exact absurd h (by decide)

private theorem pr_fiber_pos2 (q : Pair) (h : prSum q = 2) : q = (.pos, .pos) := by
  rcases q with ⟨a, b⟩
  cases a <;> cases b <;> first | rfl | exact absurd h (by decide)

private theorem pr_fiber_neg1 (q : Pair) (h : prSum q = -1) : prFiberNeg (prNegIdx q) = q := by
  rcases q with ⟨a, b⟩
  cases a <;> cases b <;> first | exact absurd h (by decide) | decide

private theorem pr_fiber_zero (q : Pair) (h : prSum q = 0) : prFiberZero (prZeroIdx q) = q := by
  rcases q with ⟨a, b⟩
  cases a <;> cases b <;> first | exact absurd h (by decide) | decide

private theorem pr_fiber_pos1 (q : Pair) (h : prSum q = 1) : prFiberPos (prPosIdx q) = q := by
  rcases q with ⟨a, b⟩
  cases a <;> cases b <;> first | exact absurd h (by decide) | decide

private theorem pr_fiberNeg_sum (k : Nat) : prSum (prFiberNeg k) = -1 := by
  unfold prFiberNeg; split <;> decide

private theorem pr_fiberZero_sum (k : Nat) : prSum (prFiberZero k) = 0 := by
  unfold prFiberZero; split
  · decide
  · split <;> decide

private theorem pr_fiberPos_sum (k : Nat) : prSum (prFiberPos k) = 1 := by
  unfold prFiberPos; split <;> decide

/-- Every fiber-preserving table preserves the charge. -/
theorem pr_table_sumPres (n : Nat) : PrSumPres (prTable n) := by
  intro p
  rcases p with ⟨a, b⟩
  cases a <;> cases b <;>
    simp only [prTable, pr_fiberNeg_sum, pr_fiberZero_sum, pr_fiberPos_sum] <;> decide

/-- A sum-preserving map is the table of its own code. -/
theorem pr_table_code (B : Pair → Pair) (hB : PrSumPres B) :
    prCodeOf B < 432 ∧ ∀ p, B p = prTable (prCodeOf B) p := by
  have b1 := pr_negIdx_le (B (.neg, .zero))
  have b2 := pr_negIdx_le (B (.zero, .neg))
  have b3 := pr_zeroIdx_le (B (.neg, .pos))
  have b4 := pr_zeroIdx_le (B (.zero, .zero))
  have b5 := pr_zeroIdx_le (B (.pos, .neg))
  have b6 := pr_posIdx_le (B (.zero, .pos))
  have b7 := pr_posIdx_le (B (.pos, .zero))
  refine ⟨by unfold prCodeOf; omega, ?_⟩
  intro p
  rcases p with ⟨a, b⟩
  cases a <;> cases b
  · exact pr_fiber_neg2 _ ((hB _).trans (by decide))
  · show B (.neg, .zero) = prFiberNeg (prCodeOf B % 2)
    have h : prCodeOf B % 2 = prNegIdx (B (.neg, .zero)) := by unfold prCodeOf; omega
    rw [h, pr_fiber_neg1 _ ((hB _).trans (by decide))]
  · show B (.neg, .pos) = prFiberZero (prCodeOf B / 4 % 3)
    have h : prCodeOf B / 4 % 3 = prZeroIdx (B (.neg, .pos)) := by unfold prCodeOf; omega
    rw [h, pr_fiber_zero _ ((hB _).trans (by decide))]
  · show B (.zero, .neg) = prFiberNeg (prCodeOf B / 2 % 2)
    have h : prCodeOf B / 2 % 2 = prNegIdx (B (.zero, .neg)) := by unfold prCodeOf; omega
    rw [h, pr_fiber_neg1 _ ((hB _).trans (by decide))]
  · show B (.zero, .zero) = prFiberZero (prCodeOf B / 12 % 3)
    have h : prCodeOf B / 12 % 3 = prZeroIdx (B (.zero, .zero)) := by unfold prCodeOf; omega
    rw [h, pr_fiber_zero _ ((hB _).trans (by decide))]
  · show B (.zero, .pos) = prFiberPos (prCodeOf B / 108 % 2)
    have h : prCodeOf B / 108 % 2 = prPosIdx (B (.zero, .pos)) := by unfold prCodeOf; omega
    rw [h, pr_fiber_pos1 _ ((hB _).trans (by decide))]
  · show B (.pos, .neg) = prFiberZero (prCodeOf B / 36 % 3)
    have h : prCodeOf B / 36 % 3 = prZeroIdx (B (.pos, .neg)) := by unfold prCodeOf; omega
    rw [h, pr_fiber_zero _ ((hB _).trans (by decide))]
  · show B (.pos, .zero) = prFiberPos (prCodeOf B / 216 % 2)
    have h : prCodeOf B / 216 % 2 = prPosIdx (B (.pos, .zero)) := by unfold prCodeOf; omega
    rw [h, pr_fiber_pos1 _ ((hB _).trans (by decide))]
  · exact pr_fiber_pos2 _ ((hB _).trans (by decide))

/-- Reading the code back off a table returns the code. -/
theorem pr_code_table : ∀ n, n < 432 → prCodeOf (prTable n) = n := by
  intro n hn
  have e1 : ∀ k, prNegIdx (prFiberNeg k) = k % 2 := by
    intro k; unfold prFiberNeg; split
    · rename_i h; rw [h]; decide
    · rename_i h; rw [show k % 2 = 1 by omega]; decide
  have e2 : ∀ k, prZeroIdx (prFiberZero k) = k % 3 := by
    intro k; unfold prFiberZero; split
    · rename_i h; rw [h]; decide
    · split
      · rename_i h; rw [h]; decide
      · rename_i h1 h2; rw [show k % 3 = 2 by omega]; decide
  have e3 : ∀ k, prPosIdx (prFiberPos k) = k % 2 := by
    intro k; unfold prFiberPos; split
    · rename_i h; rw [h]; decide
    · rename_i h; rw [show k % 2 = 1 by omega]; decide
  show prNegIdx (prFiberNeg (n % 2)) + 2 * prNegIdx (prFiberNeg (n / 2 % 2)) +
      4 * prZeroIdx (prFiberZero (n / 4 % 3)) + 12 * prZeroIdx (prFiberZero (n / 12 % 3)) +
      36 * prZeroIdx (prFiberZero (n / 36 % 3)) + 108 * prPosIdx (prFiberPos (n / 108 % 2)) +
      216 * prPosIdx (prFiberPos (n / 216 % 2)) = n
  rw [e1, e1, e2, e2, e2, e3, e3]
  omega

private theorem pr_injB_iff (f : Pair → Pair) : prInjB f = true ↔ PrInj f := by
  unfold prInjB PrInj
  simp only [List.all_eq_true, Bool.or_eq_true, Bool.not_eq_true', decide_eq_false_iff_not,
    decide_eq_true_eq]
  constructor
  · intro h p q hpq
    rcases h p (pr_mem_allPairs p) q (pr_mem_allPairs q) with h1 | h1
    · exact absurd hpq h1
    · exact h1
  · intro h p _ q _
    by_cases hpq : f p = f q
    · exact Or.inr (h p q hpq)
    · exact Or.inl hpq

private theorem pr_dConsB_iff (f : Pair → Pair) : prDConsB f = true ↔ PrDCons f := by
  unfold prDConsB PrDCons
  simp only [List.all_eq_true, decide_eq_true_eq]
  exact ⟨fun h p => h p (pr_mem_allPairs p), fun h p _ => h p⟩

private theorem pr_swapB_iff (f : Pair → Pair) : prSwapB f = true ↔ PrSwapComm f := by
  unfold prSwapB PrSwapComm
  simp only [List.all_eq_true, decide_eq_true_eq]
  exact ⟨fun h p => h p (pr_mem_allPairs p), fun h p _ => h p⟩

/-- The 24 rule codes, computed once. -/
theorem pr_rule_codes_eq :
    prRuleCodes = [129, 130, 137, 138, 153, 154, 169, 170, 185, 186, 193, 194,
      237, 238, 245, 246, 261, 262, 277, 278, 293, 294, 301, 302] := by
  decide

/-! ## Card: exactly 24 -/

/-- The 24 conservative reversible pair rules. There are exactly `432` sum-preserving maps of
    `Tone × Tone` (each is the table of a unique code `n < 432`, and distinct codes give distinct
    maps), and exactly `24` of them are injective: a map is sum-preserving and injective iff it is
    the table of one of the `24` distinct codes in `prRuleCodes`. -/
theorem thm_pair_rules_card :
    (∀ n, n < 432 → PrSumPres (prTable n)) ∧
    (∀ n m, n < 432 → m < 432 → (∀ p, prTable n p = prTable m p) → n = m) ∧
    (∀ B, PrSumPres B → ∃ n, n < 432 ∧ ∀ p, B p = prTable n p) ∧
    prRuleCodes.length = 24 ∧ prRuleCodes.Nodup ∧
    (∀ B, (PrSumPres B ∧ PrInj B) ↔ ∃ n ∈ prRuleCodes, ∀ p, B p = prTable n p) := by
  refine ⟨fun n _ => pr_table_sumPres n, ?_, ?_, by rw [pr_rule_codes_eq]; rfl,
    by rw [pr_rule_codes_eq]; decide, ?_⟩
  · intro n m hn hm h
    have hf : prTable n = prTable m := funext h
    rw [← pr_code_table n hn, ← pr_code_table m hm, hf]
  · intro B hB
    exact ⟨prCodeOf B, (pr_table_code B hB).1, (pr_table_code B hB).2⟩
  · intro B
    constructor
    · intro ⟨hS, hI⟩
      obtain ⟨hlt, hT⟩ := pr_table_code B hS
      refine ⟨prCodeOf B, ?_, hT⟩
      unfold prRuleCodes
      rw [List.mem_filter]
      refine ⟨List.mem_range.2 hlt, (pr_injB_iff _).2 ?_⟩
      intro p q h
      rw [← hT p, ← hT q] at h
      exact hI p q h
    · intro ⟨n, hn, hT⟩
      unfold prRuleCodes at hn
      rw [List.mem_filter] at hn
      refine ⟨fun p => by rw [hT]; exact pr_table_sumPres n p, ?_⟩
      intro p q h
      rw [hT p, hT q] at h
      exact (pr_injB_iff _).1 hn.2 p q h

/-- The membership half of `thm_pair_rules_card`, used below. -/
theorem pr_rule_of (B : Pair → Pair) (hS : PrSumPres B) (hI : PrInj B) :
    ∃ n ∈ prRuleCodes, ∀ p, B p = prTable n p :=
  (thm_pair_rules_card.2.2.2.2.2 B).1 ⟨hS, hI⟩

/-! ## Classes under swap and negation -/

private theorem pr_swap_sum (p : Pair) : prSum (prSwap p) = prSum p := by
  unfold prSum prSwap; exact Int.add_comm _ _

private theorem pr_neg_sum (p : Pair) : prSum (prNeg p) = -prSum p := by
  rcases p with ⟨a, b⟩
  cases a <;> cases b <;> decide

private theorem pr_swap_swap (p : Pair) : prSwap (prSwap p) = p := rfl

private theorem pr_neg_neg (p : Pair) : prNeg (prNeg p) = p := by
  rcases p with ⟨a, b⟩
  simp only [prNeg, pr_tone_dual_dual]

private theorem pr_conjP_sumPres (f : Pair → Pair) (h : PrSumPres f) : PrSumPres (prConjP f) := by
  intro p
  show prSum (prSwap (f (prSwap p))) = prSum p
  rw [pr_swap_sum, h, pr_swap_sum]

private theorem pr_conjC_sumPres (f : Pair → Pair) (h : PrSumPres f) : PrSumPres (prConjC f) := by
  intro p
  show prSum (prNeg (f (prNeg p))) = prSum p
  rw [pr_neg_sum, h, pr_neg_sum, Int.neg_neg]

private theorem pr_conjP_inj (f : Pair → Pair) (h : PrInj f) : PrInj (prConjP f) := by
  intro p q hpq
  have h1 := congrArg prSwap hpq
  simp only [prConjP, pr_swap_swap] at h1
  have h2 := congrArg prSwap (h _ _ h1)
  simpa only [pr_swap_swap] using h2

private theorem pr_conjC_inj (f : Pair → Pair) (h : PrInj f) : PrInj (prConjC f) := by
  intro p q hpq
  have h1 := congrArg prNeg hpq
  simp only [prConjC, pr_neg_neg] at h1
  have h2 := congrArg prNeg (h _ _ h1)
  simpa only [pr_neg_neg] using h2

private theorem pr_rule_orbit_closed :
    ∀ n ∈ prRuleCodes, ∀ m ∈ prOrbit n, m ∈ prRuleCodes := by
  rw [pr_rule_codes_eq]; decide

private theorem pr_class_partition :
    ∀ n ∈ prRuleCodes, (prClassReps.filter fun r => decide (n ∈ prOrbit r)).length = 1 := by
  unfold prClassReps
  rw [pr_rule_codes_eq]; decide

/-- Twelve classes. `P` (cell swap) and `C` (negation) act on maps by conjugation as commuting
    involutions, so `{1, P, C, PC}` is a group acting on maps; it sends the 24 rules to rules, and
    the code of a conjugate is the conjugate (`prOrbit n` lists the codes of the 4 conjugates of
    rule `n`). The 12 codes of `prClassReps` meet every rule's orbit exactly once, so the 24 rules
    fall into exactly 12 orbits. The Burnside fixed-point counts are `24, 8, 4, 12` for
    `1, P, C, PC`, and `(24 + 8 + 4 + 12) / 4 = 12`. -/
theorem thm_pair_rule_classes :
    (∀ f p, prConjP (prConjP f) p = f p) ∧ (∀ f p, prConjC (prConjC f) p = f p) ∧
    (∀ f p, prConjP (prConjC f) p = prConjC (prConjP f) p) ∧
    (∀ f, PrSumPres f → PrInj f →
      PrSumPres (prConjP f) ∧ PrInj (prConjP f) ∧ PrSumPres (prConjC f) ∧ PrInj (prConjC f)) ∧
    (∀ f, PrSumPres f → ∀ p, prTable (prCodeOf f) p = f p) ∧
    (∀ n ∈ prRuleCodes, ∀ m ∈ prOrbit n, m ∈ prRuleCodes) ∧
    prClassReps ⊆ prRuleCodes ∧ prClassReps.length = 12 ∧
    (∀ n ∈ prRuleCodes, (prClassReps.filter fun r => decide (n ∈ prOrbit r)).length = 1) ∧
    (prRuleCodes.filter fun n => decide (prCodeOf (prConjP (prTable n)) = n)).length = 8 ∧
    (prRuleCodes.filter fun n => decide (prCodeOf (prConjC (prTable n)) = n)).length = 4 ∧
    (prRuleCodes.filter fun n =>
      decide (prCodeOf (prConjP (prConjC (prTable n))) = n)).length = 12 := by
  refine ⟨?_, ?_, ?_, ?_, ?_, pr_rule_orbit_closed, ?_, ?_, pr_class_partition, ?_, ?_, ?_⟩
  · intro f p; simp only [prConjP, pr_swap_swap]
  · intro f p; simp only [prConjC, pr_neg_neg]
  · intro f p
    rcases p with ⟨a, b⟩
    rfl
  · intro f hS hI
    exact ⟨pr_conjP_sumPres f hS, pr_conjP_inj f hI, pr_conjC_sumPres f hS, pr_conjC_inj f hI⟩
  · intro f hS p
    exact ((pr_table_code f hS).2 p).symm
  · intro n hn
    unfold prClassReps at hn
    exact (List.mem_filter.1 hn).1
  · unfold prClassReps; rw [pr_rule_codes_eq]; decide
  · rw [pr_rule_codes_eq]; decide
  · rw [pr_rule_codes_eq]; decide
  · rw [pr_rule_codes_eq]; decide

/-! ## Vacuum, `D` and swap symmetry coincide -/

private theorem pr_rule_vac_bool :
    ∀ n ∈ prRuleCodes,
      decide (prTable n prVac = prVac) = prDConsB (prTable n) ∧
      decide (prTable n prVac = prVac) = prSwapB (prTable n) := by
  rw [pr_rule_codes_eq]; decide

/-- For a conservative reversible pair rule, fixing the vacuum `(0, 0)`, conserving `D` and
    commuting with the cell swap are equivalent. `8` of the 24 rules, in `6` of the 12 classes,
    have them. A rule that creates `(-1, +1)` or `(+1, -1)` from the vacuum is chiral: it does not
    commute with the swap. -/
theorem thm_pair_rule_vacuum_iff :
    (∀ B, PrSumPres B → PrInj B →
      ((B prVac = prVac ↔ PrDCons B) ∧ (B prVac = prVac ↔ PrSwapComm B))) ∧
    (prRuleCodes.filter fun n => decide (prTable n prVac = prVac)).length = 8 ∧
    (prClassReps.filter fun n => decide (prTable n prVac = prVac)).length = 6 ∧
    (∀ B, PrSumPres B → PrInj B →
      (B prVac = (.neg, .pos) ∨ B prVac = (.pos, .neg)) → ¬ PrSwapComm B) := by
  have hMain : ∀ B, PrSumPres B → PrInj B →
      ((B prVac = prVac ↔ PrDCons B) ∧ (B prVac = prVac ↔ PrSwapComm B)) := by
    intro B hS hI
    obtain ⟨n, hn, hT⟩ := pr_rule_of B hS hI
    have hB : B = prTable n := funext hT
    subst hB
    obtain ⟨h1, h2⟩ := pr_rule_vac_bool n hn
    refine ⟨?_, ?_⟩
    · rw [← pr_dConsB_iff, ← h1, decide_eq_true_iff]
    · rw [← pr_swapB_iff, ← h2, decide_eq_true_iff]
  refine ⟨hMain, by rw [pr_rule_codes_eq]; decide,
    by unfold prClassReps; rw [pr_rule_codes_eq]; decide, ?_⟩
  intro B hS hI hc hP
  have hV : B prVac = prVac := ((hMain B hS hI).2).2 hP
  rcases hc with h | h
  · rw [hV] at h; exact absurd h (by decide)
  · rw [hV] at h; exact absurd h (by decide)

/-! ## Explicit inverses -/

private theorem pr_rule_inverse_bool :
    ∀ n ∈ prRuleCodes, prInvCode n ∈ prRuleCodes ∧
      prAllPairs.all (fun p => decide (prTable (prInvCode n) (prTable n p) = p) &&
        decide (prTable n (prTable (prInvCode n) p) = p)) = true := by
  unfold prInvCode
  rw [pr_rule_codes_eq]; decide

/-- Every conservative reversible pair rule has a two-sided inverse, itself one of the 24 rules
    (the table of `prInvCode`). -/
theorem thm_pair_rule_inverse :
    ∀ B, PrSumPres B → PrInj B →
      ∃ g : Pair → Pair, PrSumPres g ∧ PrInj g ∧ (∀ p, g (B p) = p) ∧ (∀ p, B (g p) = p) := by
  intro B hS hI
  obtain ⟨n, hn, hT⟩ := pr_rule_of B hS hI
  have hB : B = prTable n := funext hT
  subst hB
  obtain ⟨hm, hall⟩ := pr_rule_inverse_bool n hn
  simp only [List.all_eq_true, Bool.and_eq_true, decide_eq_true_eq] at hall
  have hInvRule := (thm_pair_rules_card.2.2.2.2.2 (prTable (prInvCode n))).2 ⟨prInvCode n, hm, fun _ => rfl⟩
  exact ⟨prTable (prInvCode n), hInvRule.1, hInvRule.2,
    fun p => (hall p (pr_mem_allPairs p)).1, fun p => (hall p (pr_mem_allPairs p)).2⟩

end Vibe
