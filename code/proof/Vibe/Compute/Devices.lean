import Mathlib.Data.Set.Finite.Lemmas
import Vibe.Compute.Round
import Vibe.Compute.PairRuleLink
import Vibe.Generated.Devices

/-!
# Vibe Computation Lab: Devices and Collectives (levels 7 and 8)

Claims I-a11 to I-a15. Level 7's template: A* breaks
ties of `f = g + h` by a preference bit, decided per successor from the word `[t, d]` (`t` = the
taught bit, written as tone `0` or `+1`; `d` = the tone of the estimate change). A preference
function maps the 6 words to prefer or not: 64 functions. F1 (`OneInput`) holds the 10 that depend
on at most one input.

A device (every metered run starts from its window) is a start configuration on any
graph, two input cells, a read cell, a round count and a tone set `P`; its decision on a word is
`[read in P]` after the rounds of a pair rule from the window with the word written in. So a
device's decision is one of the 64 functions (`Device.decision`), on any vertex type and schedule.

Headline theorems:
1. `thm_dev_developments_distinct` (D2): for any vertex type, schedule and permutation pair rule,
   `T` rounds are injective and undone by `T` inverse rounds, so distinct starts give distinct
   developments at every `T`. `thm_dev_primitive_developments_distinct`: the census's starts (a
   window with both end cells off the background `b`, placed at a cell of the line `ℤ`) are told
   apart by their placement, so distinct (position, window) pairs give distinct developments.
2. `thm_dev_identity_one_input`, `thm_dev_identity_realizes_one_input`,
   `thm_dev_identity_exactly_one_input` (D3, the argument): under an identity rule the device on
   any window, any input cells `i ≠ j` and any round count realizes exactly F1, each with a read
   cell at an input and a nonempty proper `P`. `thm_dev_one_input_card`: F1 has 10 of 64.
3. `gen_devices_rule_eq`, `gen_devices_word_index_eq`, `gen_devices_identity_census_eq` (D3, the
   census): the bridges of `Generated/Devices`: the census rule `id.ABC.id` is the identity, the
   code's word index is `wordIdx`, and the masks the code's identity census realizes (lineBrickRun
   over windows of width 2 and 3, every background, parity, input pair, read round 1 to 6, read
   cell and tone set) are exactly the masks of F1.
4. `thm_dev_capacity_ceiling` (D4): for any capacity `C` on preference functions (the template
   reads a device only through its decision), some function is best over all 64 and no device of
   any rule, graph, schedule, window or round count beats it. `thm_dev_template_no_go`: when a
   one-input function is best over all 64, no device beats the identity wire realizing it.
   `thm_dev_credit_needs_both_inputs`: a device beats the best one-input function only through a
   function of both inputs.
5. `thm_dev_collective_one_device` (C1): any number of devices in one run are one window, so the
   collective's decision is a device decision and D4 bounds it; under an identity rule a
   collective realizes only F1.
6. `thm_dev_apart_one_input`, `thm_dev_apart_any_entities`, `thm_dev_interaction_headroom` (C2):
   devices run apart, one read per decision from the run that holds one entity's input, realize
   only F1 under any rule; with C1 the gain of any collective over the best one-input function is
   at most `C(best F1) - C(best of all 64)`.

The general theorems speak about the Lean round of `Vibe.Compute.Round` on any graph. The census
bridge speaks about the code that ran: its masks are computed by `lineBrickRun` itself. The held-out
numbers (8,130 against 8,131 and 8,143) and the C2 gain stay measurements.

Mathlib (`Set.exists_min_image`, `Function.update`), zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

namespace Devices

open Function

/-! ## Words and preference functions -/

/-- A decision word `[t, d]`: the taught bit and the tone of the estimate change. -/
abbrev Word := Bool × Tone

/-- A preference function: prefer or not on each of the 6 words (64 functions). -/
abbrev Pref := Word → Bool

/-- The tone the code writes for the taught bit: `0` or `+1`. -/
def tTone : Bool → Tone
  | false => .zero
  | true => .pos

/-- `g` ignores the taught bit. -/
def NoT (g : Pref) : Prop := ∀ d, g (false, d) = g (true, d)

/-- `g` ignores the estimate change. -/
def NoD (g : Pref) : Prop := ∀ t d d', g (t, d) = g (t, d')

/-- F1: the preference functions that depend on at most one input. -/
def OneInput (g : Pref) : Prop := NoT g ∨ NoD g

/-- The six words in the code's mask order. -/
def allWords : List Word :=
  [(false, .neg), (true, .neg), (false, .zero), (true, .zero), (false, .pos), (true, .pos)]

/-- The code's word index `(d + 1) * 2 + t` (develop-router.ts `wordIndex`). -/
def wordIdx (w : Word) : Nat := PairRuleLink.toneIdx w.2 * 2 + (if w.1 then 1 else 0)

/-- The preference function of a 6-bit mask: bit `wordIdx w` decides word `w`. -/
def prefOfMask (m : Nat) : Pref := fun w => m.testBit (wordIdx w)

/-- `2 ^ k` when `b`, else `0`. -/
def bitOf (b : Bool) (k : Nat) : Nat := if b then 2 ^ k else 0

/-- The mask of six decisions, in word-index order. -/
def mask6 (b0 b1 b2 b3 b4 b5 : Bool) : Nat :=
  bitOf b0 0 + bitOf b1 1 + bitOf b2 2 + bitOf b3 3 + bitOf b4 4 + bitOf b5 5

/-- The mask of a preference function. -/
def maskOf (g : Pref) : Nat :=
  mask6 (g (false, .neg)) (g (true, .neg)) (g (false, .zero)) (g (true, .zero))
    (g (false, .pos)) (g (true, .pos))

/-- F1 as a Boolean test, the code's `oneInput`. -/
def oneInputB (g : Pref) : Bool :=
  (g (false, .neg) == g (true, .neg) && g (false, .zero) == g (true, .zero) &&
      g (false, .pos) == g (true, .pos)) ||
    (g (false, .neg) == g (false, .zero) && g (false, .zero) == g (false, .pos) &&
      g (true, .neg) == g (true, .zero) && g (true, .zero) == g (true, .pos))

/-- The masks of F1 in increasing order. -/
def f1Masks : List Nat := (List.range 64).filter fun m => oneInputB (prefOfMask m)

private theorem mask6_spec : ∀ b0 b1 b2 b3 b4 b5 : Bool,
    mask6 b0 b1 b2 b3 b4 b5 < 64 ∧ (mask6 b0 b1 b2 b3 b4 b5).testBit 0 = b0 ∧
    (mask6 b0 b1 b2 b3 b4 b5).testBit 1 = b1 ∧ (mask6 b0 b1 b2 b3 b4 b5).testBit 2 = b2 ∧
    (mask6 b0 b1 b2 b3 b4 b5).testBit 3 = b3 ∧ (mask6 b0 b1 b2 b3 b4 b5).testBit 4 = b4 ∧
    (mask6 b0 b1 b2 b3 b4 b5).testBit 5 = b5 := by
  decide

private theorem pref_of_mask_of (g : Pref) : prefOfMask (maskOf g) = g ∧ maskOf g < 64 := by
  obtain ⟨hlt, h0, h1, h2, h3, h4, h5⟩ := mask6_spec (g (false, .neg)) (g (true, .neg))
    (g (false, .zero)) (g (true, .zero)) (g (false, .pos)) (g (true, .pos))
  refine ⟨?_, hlt⟩
  funext w
  rcases w with ⟨t, d⟩
  cases t
  · cases d
    · exact h0
    · exact h2
    · exact h4
  · cases d
    · exact h1
    · exact h3
    · exact h5

private theorem one_input_iff (g : Pref) : OneInput g ↔ oneInputB g = true := by
  constructor
  · rintro (hT | hD)
    · have e1 := hT .neg
      have e2 := hT .zero
      have e3 := hT .pos
      simp [oneInputB, e1, e2, e3]
    · have e1 := hD false .neg .zero
      have e2 := hD false .zero .pos
      have e3 := hD true .neg .zero
      have e4 := hD true .zero .pos
      simp [oneInputB, e1, e2, e3, e4]
  · intro h
    simp only [oneInputB, Bool.or_eq_true, Bool.and_eq_true, beq_iff_eq] at h
    rcases h with ⟨⟨h1, h2⟩, h3⟩ | ⟨⟨⟨h1, h2⟩, h3⟩, h4⟩
    · left
      intro d
      cases d
      · exact h1
      · exact h2
      · exact h3
    · right
      intro t d d'
      cases t <;> cases d <;> cases d' <;>
        first
        | rfl
        | exact h1 | exact h2 | exact h3 | exact h4
        | exact h1.symm | exact h2.symm | exact h3.symm | exact h4.symm
        | exact h1.trans h2 | exact (h1.trans h2).symm
        | exact h3.trans h4 | exact (h3.trans h4).symm

/-- **F1 has 10 of the 64 preference functions.** The masks below 64 are exactly the preference
    functions (`maskOf` and `prefOfMask` are inverse), and 10 of them lie in F1: the 2 constants,
    the 2 non-constant functions of `t` and the 6 non-constant functions of `d`. -/
theorem thm_dev_one_input_card :
    (∀ g : Pref, prefOfMask (maskOf g) = g ∧ maskOf g < 64) ∧
    (∀ m < 64, maskOf (prefOfMask m) = m) ∧
    (∀ g : Pref, OneInput g ↔ maskOf g ∈ f1Masks) ∧
    f1Masks = [0, 3, 12, 15, 21, 42, 48, 51, 60, 63] ∧ f1Masks.length = 10 := by
  refine ⟨pref_of_mask_of, by decide, ?_, by decide, by decide⟩
  intro g
  simp only [f1Masks, List.mem_filter, List.mem_range]
  rw [(pref_of_mask_of g).1, one_input_iff]
  exact ⟨fun h => ⟨(pref_of_mask_of g).2, h⟩, fun h => h.2⟩

/-! ## The census bridges (Generated/Devices) -/

/-- Bridge for `devicesIdentityRule`: the census rule `id.ABC.id` of the code is one of the 24
    rule tables of pair-rule.ts, and it decodes to the identity on every pair. -/
theorem gen_devices_rule_eq :
    Generated.devicesIdentityRule ∈ Generated.pairRuleTables ∧
    ∀ p : Pair, PairRuleLink.decodeRule Generated.devicesIdentityRule p = p := by
  refine ⟨by decide, ?_⟩
  rintro ⟨a, b⟩
  cases a <;> cases b <;> decide

/-- Bridge for `devicesWordIndex`: the code writes the taught bit as tone `0` or `+1` (`tTone`),
    and its `wordIndex(t, d)` is `wordIdx` on the six words, a bijection onto `0 .. 5`. -/
theorem gen_devices_word_index_eq :
    Generated.devicesWordIndex =
      allWords.map (fun w => ((if w.1 then 1 else 0), w.2.value, wordIdx w)) ∧
    (∀ b : Bool, (tTone b).value = if b then 1 else 0) ∧
    allWords.map wordIdx = List.range 6 ∧ (∀ w : Word, w ∈ allWords) := by
  refine ⟨by decide, ?_, by decide, ?_⟩
  · intro b
    cases b <;> rfl
  · rintro ⟨t, d⟩
    cases t <;> cases d <;> decide

/-- Bridge for `devicesIdentityCensus` (D3, the census): the preference masks the code's identity
    census realizes (computed by `lineBrickRun` under `id.ABC.id`) are exactly `f1Masks`, so a
    preference function is realized by the census iff it lies in F1, and the census holds 10. -/
theorem gen_devices_identity_census_eq :
    Generated.devicesIdentityCensus = f1Masks ∧ Generated.devicesIdentityCensus.length = 10 ∧
    ∀ g : Pref, maskOf g ∈ Generated.devicesIdentityCensus ↔ OneInput g := by
  have hc : Generated.devicesIdentityCensus = f1Masks := by decide
  refine ⟨hc, by decide, ?_⟩
  intro g
  rw [hc]
  exact (thm_dev_one_input_card.2.2.1 g).symm

/-! ## Devices -/

/-- A device: a start configuration (the window and its background), the two input cells, the
    read cell, the read round and the preferred tone set `P`. -/
structure Device (V : Type*) where
  window : Config V
  tIn : V
  dIn : V
  read : V
  rounds : Nat
  prefer : Tone → Bool

/-- A collective of devices indexed by `ι` on one window: device `k`'s start on the cells it owns,
    the background elsewhere, and one placement of the two inputs and the read. -/
structure Collective (V ι : Type*) where
  background : Tone
  start : ι → Config V
  owner : V → Option ι
  tIn : V
  dIn : V
  read : V
  rounds : Nat
  prefer : Tone → Bool

/-- Devices run apart: run 1 holds device 1's start and input `t` only, run 2 device 2's start and
    input `d` only (every other cell at whatever fixed tone the run starts with), and each decision
    reads the read cell in one run, fixed by the placement (`readsT`). -/
structure Apart (V : Type*) where
  runT : Config V
  runD : Config V
  tIn : V
  dIn : V
  read : V
  rounds : Nat
  readsT : Bool
  prefer : Tone → Bool

section DeviceTheory

variable {V : Type*} [DecidableEq V]

/-- The window with the word written in: `t` at cell `i`, `d` at cell `j`. -/
def writeWord (x : Config V) (i j : V) (w : Word) : Config V :=
  update (update x i (tTone w.1)) j w.2

/-- A device's decision under the pair rule `f` and the schedule `s`: `[read in P]` after its
    rounds from the window with the word written in. -/
def Device.decision (D : Device V) (f : Pair → Pair) (s : Schedule V) : Pref := fun w =>
  D.prefer ((round f s)^[D.rounds] (writeWord D.window D.tIn D.dIn w) D.read)

/-- The joint window of a collective. -/
def Collective.window {ι : Type*} (J : Collective V ι) : Config V := fun v =>
  match J.owner v with
  | some k => J.start k v
  | none => J.background

/-- A collective's joint decision: one run of the joint window with both inputs written in. -/
def Collective.decision {ι : Type*} (J : Collective V ι) (f : Pair → Pair) (s : Schedule V) :
    Pref := fun w =>
  J.prefer ((round f s)^[J.rounds] (writeWord J.window J.tIn J.dIn w) J.read)

/-- The device whose window is the collective's joint window. -/
def Collective.toDevice {ι : Type*} (J : Collective V ι) : Device V :=
  ⟨J.window, J.tIn, J.dIn, J.read, J.rounds, J.prefer⟩

/-- The decision of devices run apart. -/
def Apart.decision (A : Apart V) (f : Pair → Pair) (s : Schedule V) : Pref := fun w =>
  if A.readsT then A.prefer ((round f s)^[A.rounds] (update A.runT A.tIn (tTone w.1)) A.read)
  else A.prefer ((round f s)^[A.rounds] (update A.runD A.dIn w.2) A.read)

private theorem writeWord_d (x : Config V) (i j : V) (t : Bool) (d : Tone) :
    writeWord x i j (t, d) j = d := by
  simp only [writeWord, update_self]

private theorem writeWord_t (x : Config V) (i j : V) (hij : i ≠ j) (t : Bool) (d : Tone) :
    writeWord x i j (t, d) i = tTone t := by
  simp only [writeWord, update_of_ne hij, update_self]

private theorem writeWord_other (x : Config V) (i j v : V) (hi : v ≠ i) (hj : v ≠ j) (w : Word) :
    writeWord x i j w v = x v := by
  simp only [writeWord, update_of_ne hj, update_of_ne hi]

private theorem step_ident (M : Matching V) (x : Config V) : M.step id x = x := by
  funext v
  unfold Matching.step
  split_ifs <;> rfl

private theorem round_ident (s : Schedule V) (x : Config V) : round id s x = x := by
  induction s generalizing x with
  | nil => rfl
  | cons M s ih =>
    show round id s (M.step id x) = x
    rw [step_ident, ih]

private theorem iter_ident (s : Schedule V) (n : Nat) (x : Config V) : (round id s)^[n] x = x := by
  induction n with
  | zero => rfl
  | succ n ih => rw [iterate_succ_apply', ih, round_ident]

private theorem decision_ident (f : Pair → Pair) (hf : ∀ p, f p = p) (s : Schedule V)
    (D : Device V) (w : Word) :
    D.decision f s w = D.prefer (writeWord D.window D.tIn D.dIn w D.read) := by
  have hfid : f = id := funext hf
  subst hfid
  show D.prefer ((round id s)^[D.rounds] (writeWord D.window D.tIn D.dIn w) D.read) = _
  rw [iter_ident]

/-- **D2, development adds no information.** For any vertex type (any graph), any schedule and
    any pair rule that permutes `Tone × Tone`: `T` rounds are injective and `T` inverse rounds undo
    them, at every `T`, so distinct starts of any family give distinct developments, and a
    development determines its start. -/
theorem thm_dev_developments_distinct (F : Equiv.Perm Pair) (s : Schedule V) (T : Nat)
    (ι : Type*) (start : ι → Config V) (hstart : Injective start) :
    Injective (round F s)^[T] ∧
    (∀ x : Config V, (roundBack F.symm s)^[T] ((round F s)^[T] x) = x) ∧
    Injective (fun k => (round F s)^[T] (start k)) := by
  have hinj : Injective (round F s)^[T] := (roundPerm F s).injective.iterate T
  have hleft : LeftInverse (roundBack F.symm s)^[T] (round F s)^[T] :=
    LeftInverse.iterate (roundPerm F s).left_inv T
  exact ⟨hinj, hleft, hinj.comp hstart⟩

/-- **D3, one direction.** Under an identity rule, on any vertex type and schedule, every device
    (any window, input cells, read cell, round count and tone set) realizes a function in F1: the
    read is the tone of input `d`, of input `t`, or of a fixed window cell. -/
theorem thm_dev_identity_one_input (f : Pair → Pair) (hf : ∀ p, f p = p) (s : Schedule V)
    (D : Device V) : OneInput (D.decision f s) := by
  by_cases hd : D.read = D.dIn
  · left
    intro d
    rw [decision_ident f hf, decision_ident f hf, hd, writeWord_d, writeWord_d]
  · by_cases ht : D.read = D.tIn
    · right
      intro t d d'
      have hne : D.tIn ≠ D.dIn := fun e => hd (ht.trans e)
      rw [decision_ident f hf, decision_ident f hf, ht, writeWord_t _ _ _ hne,
        writeWord_t _ _ _ hne]
    · left
      intro d
      rw [decision_ident f hf, decision_ident f hf, writeWord_other _ _ _ _ ht hd,
        writeWord_other _ _ _ _ ht hd]

/-- The tone set reading a constant `c` off the `t` input: `{0, +1}` for `true`, `{-1}` for
    `false`. -/
private def constPrefer (c : Bool) : Tone → Bool
  | .neg => !c
  | .zero => c
  | .pos => c

/-- The tone set reading `k t` off the `t` input. -/
private def tPrefer (k : Bool → Bool) : Tone → Bool
  | .neg => false
  | .zero => k false
  | .pos => k true

/-- **D3, the other direction.** Under an identity rule, on any vertex type, schedule, window,
    input cells `i ≠ j` and round count, every function of F1 is realized, with the read cell at
    an input and a nonempty proper tone set `P` (as the census requires). -/
theorem thm_dev_identity_realizes_one_input (f : Pair → Pair) (hf : ∀ p, f p = p)
    (s : Schedule V) (x : Config V) (i j : V) (hij : i ≠ j) (r : Nat) (g : Pref)
    (hg : OneInput g) :
    ∃ D : Device V, D.window = x ∧ D.tIn = i ∧ D.dIn = j ∧ D.rounds = r ∧
      (D.read = i ∨ D.read = j) ∧ (∃ a, D.prefer a = true) ∧ (∃ a, D.prefer a = false) ∧
      D.decision f s = g := by
  by_cases hc : ∀ w, g w = g (false, .zero)
  · refine ⟨⟨x, i, j, i, r, constPrefer (g (false, .zero))⟩, rfl, rfl, rfl, rfl, Or.inl rfl,
      ?_, ?_, ?_⟩
    · show ∃ a, constPrefer (g (false, .zero)) a = true
      generalize g (false, .zero) = c
      cases c
      · exact ⟨.neg, rfl⟩
      · exact ⟨.zero, rfl⟩
    · show ∃ a, constPrefer (g (false, .zero)) a = false
      generalize g (false, .zero) = c
      cases c
      · exact ⟨.zero, rfl⟩
      · exact ⟨.neg, rfl⟩
    · funext w
      rcases w with ⟨t, d⟩
      rw [decision_ident f hf]
      show constPrefer (g (false, .zero)) (writeWord x i j (t, d) i) = g (t, d)
      rw [writeWord_t x i j hij, hc (t, d)]
      generalize g (false, .zero) = c
      cases t <;> cases c <;> rfl
  · obtain ⟨⟨t0, d0⟩, h0⟩ := not_forall.1 hc
    rcases hg with hT | hD
    · have h0' : g (false, d0) ≠ g (false, .zero) := by
        cases t0
        · exact h0
        · rwa [hT d0]
      refine ⟨⟨x, i, j, j, r, fun a => g (false, a)⟩, rfl, rfl, rfl, rfl, Or.inr rfl, ?_, ?_,
        ?_⟩
      · show ∃ a, g (false, a) = true
        cases ha : g (false, d0)
        · cases hb : g (false, .zero)
          · rw [ha, hb] at h0'
            exact absurd rfl h0'
          · exact ⟨.zero, hb⟩
        · exact ⟨d0, ha⟩
      · show ∃ a, g (false, a) = false
        cases ha : g (false, d0)
        · exact ⟨d0, ha⟩
        · cases hb : g (false, .zero)
          · exact ⟨.zero, hb⟩
          · rw [ha, hb] at h0'
            exact absurd rfl h0'
      · funext w
        rcases w with ⟨t, d⟩
        rw [decision_ident f hf]
        show g (false, writeWord x i j (t, d) j) = g (t, d)
        rw [writeWord_d]
        cases t
        · rfl
        · exact hT d
    · have hk : g (false, .zero) ≠ g (true, .zero) := by
        intro e
        apply hc
        rintro ⟨t, d⟩
        cases t
        · exact hD false d .zero
        · exact (hD true d .zero).trans e.symm
      refine ⟨⟨x, i, j, i, r, tPrefer (fun t => g (t, .zero))⟩, rfl, rfl, rfl, rfl, Or.inl rfl,
        ?_, ⟨.neg, rfl⟩, ?_⟩
      · show ∃ a, tPrefer (fun t => g (t, .zero)) a = true
        cases ha : g (false, .zero)
        · cases hb : g (true, .zero)
          · rw [ha, hb] at hk
            exact absurd rfl hk
          · exact ⟨.pos, hb⟩
        · exact ⟨.zero, ha⟩
      · funext w
        rcases w with ⟨t, d⟩
        rw [decision_ident f hf]
        show tPrefer (fun t => g (t, .zero)) (writeWord x i j (t, d) i) = g (t, d)
        rw [writeWord_t x i j hij]
        cases t
        · exact hD false .zero d
        · exact hD true .zero d

/-- **D3, the wire lemma.** Under an identity rule, on any vertex type, schedule, window, input
    cells `i ≠ j` and round count, the device realizes a preference function iff it lies in F1. -/
theorem thm_dev_identity_exactly_one_input (f : Pair → Pair) (hf : ∀ p, f p = p)
    (s : Schedule V) (x : Config V) (i j : V) (hij : i ≠ j) (r : Nat) (g : Pref) :
    (∃ D : Device V, D.window = x ∧ D.tIn = i ∧ D.dIn = j ∧ D.rounds = r ∧ D.decision f s = g) ↔
      OneInput g := by
  constructor
  · rintro ⟨D, -, -, -, -, rfl⟩
    exact thm_dev_identity_one_input f hf s D
  · intro hg
    obtain ⟨D, h1, h2, h3, h4, -, -, -, h8⟩ :=
      thm_dev_identity_realizes_one_input f hf s x i j hij r g hg
    exact ⟨D, h1, h2, h3, h4, h8⟩

/-- **D4, the ceiling.** For any capacity `C` on preference functions with values in any linear
    order (the template reads a device only through its decision, so a device's capacity is `C` of
    its decision function), some preference function is best over all 64, and no device of any
    pair rule, vertex type, schedule, window, placement or round count beats it. -/
theorem thm_dev_capacity_ceiling {α : Type*} [LinearOrder α] (C : Pref → α) :
    ∃ gStar : Pref, (∀ g, C gStar ≤ C g) ∧
      ∀ (f : Pair → Pair) (s : Schedule V) (D : Device V), C gStar ≤ C (D.decision f s) := by
  obtain ⟨m, -, hmin⟩ := Set.exists_min_image {m : Nat | m < 64} (fun m => C (prefOfMask m))
    (Set.finite_lt_nat 64) ⟨0, by decide⟩
  have hall : ∀ g, C (prefOfMask m) ≤ C g := by
    intro g
    have h := hmin (maskOf g) (pref_of_mask_of g).2
    rwa [(pref_of_mask_of g).1] at h
  exact ⟨prefOfMask m, hall, fun f s D => hall (D.decision f s)⟩

/-- **D4, the sharp no-go for the template.** If a one-input function `h` is best over all 64,
    then no device of any rule, graph, schedule, window or round count beats it, and an identity
    device (the wire) on any window and input cells `i ≠ j` realizes it. -/
theorem thm_dev_template_no_go {α : Type*} [LinearOrder α] (C : Pref → α) (h : Pref)
    (hh : OneInput h) (hbest : ∀ g, C h ≤ C g) :
    (∀ (f : Pair → Pair) (s : Schedule V) (D : Device V), C h ≤ C (D.decision f s)) ∧
    ∀ (s : Schedule V) (x : Config V) (i j : V), i ≠ j → ∀ r : Nat,
      ∃ W : Device V, W.window = x ∧ W.tIn = i ∧ W.dIn = j ∧ W.rounds = r ∧
        W.decision id s = h := by
  refine ⟨fun f s D => hbest _, fun s x i j hij r => ?_⟩
  exact (thm_dev_identity_exactly_one_input id (fun _ => rfl) s x i j hij r h).2 hh

/-- **D3 and D4, credit.** Let `h` be the best one-input function. A device of any rule that does
    strictly better than `h` realizes a function of both inputs, and `h` is realized by an identity
    device (the wire) on any window and input cells `i ≠ j`. -/
theorem thm_dev_credit_needs_both_inputs {α : Type*} [LinearOrder α] (C : Pref → α) (h : Pref)
    (hh : OneInput h) (hF1 : ∀ g, OneInput g → C h ≤ C g) (f : Pair → Pair) (s : Schedule V)
    (D : Device V) (hD : C (D.decision f s) < C h) :
    ¬ OneInput (D.decision f s) ∧
    ∀ (x : Config V) (i j : V), i ≠ j → ∀ r : Nat,
      ∃ W : Device V, W.window = x ∧ W.tIn = i ∧ W.dIn = j ∧ W.rounds = r ∧
        W.decision id s = h := by
  refine ⟨fun h1 => absurd (hF1 _ h1) (not_le.2 hD), fun x i j hij r => ?_⟩
  exact (thm_dev_identity_exactly_one_input id (fun _ => rfl) s x i j hij r h).2 hh

/-- **C1, a collective is one device.** For any index type of devices, the joint decision of a
    collective is the decision of the device whose window is the joint window, so D4 bounds every
    collective by the best of all 64 functions (any rule, graph, schedule, placement), and under an
    identity rule a collective realizes only F1. -/
theorem thm_dev_collective_one_device {α : Type*} [LinearOrder α] (C : Pref → α) (ι : Type*) :
    ∃ gStar : Pref, (∀ g, C gStar ≤ C g) ∧
      ∀ (f : Pair → Pair) (s : Schedule V) (J : Collective V ι),
        J.decision f s = J.toDevice.decision f s ∧ C gStar ≤ C (J.decision f s) ∧
        ((∀ p, f p = p) → OneInput (J.decision f s)) := by
  obtain ⟨gStar, hall, -⟩ := thm_dev_capacity_ceiling (V := V) C
  refine ⟨gStar, hall, fun f s J => ⟨rfl, hall _, fun hf => ?_⟩⟩
  exact thm_dev_identity_one_input f hf s J.toDevice

/-- **C2, devices run apart.** Under any pair rule, schedule and placement, devices run apart
    (each decision read in the run that holds one entity's input only) realize a function in F1. -/
theorem thm_dev_apart_one_input (f : Pair → Pair) (s : Schedule V) (A : Apart V) :
    OneInput (A.decision f s) := by
  cases h : A.readsT
  · left
    intro d
    simp only [Apart.decision, h, Bool.false_eq_true, ↓reduceIte]
  · right
    intro t d d'
    simp only [Apart.decision, h, ↓reduceIte]

/-- **C2, any number of entities.** Entity `k` of any index type holds input `w k` of any type;
    the run that holds only entity `k`'s device and input starts from `run k (w k)`. With one read
    per decision in run `k`, the decision depends on entity `k`'s input alone, under any rule. -/
theorem thm_dev_apart_any_entities {ι : Type*} {A : ι → Type*} (f : Pair → Pair)
    (s : Schedule V) (run : (k : ι) → A k → Config V) (read : V) (rounds : Nat)
    (prefer : Tone → Bool) (k : ι) (w w' : (j : ι) → A j) (h : w k = w' k) :
    prefer ((round f s)^[rounds] (run k (w k)) read) =
      prefer ((round f s)^[rounds] (run k (w' k)) read) := by
  rw [h]

/-- **C2 with C1, the interaction headroom.** Let `h` be best among one-input functions and
    `gStar` best over all 64 (integer capacities). Devices run apart never beat `h`, and any
    collective of any devices, rule, graph and schedule beats `h` by at most
    `C h - C gStar`. -/
theorem thm_dev_interaction_headroom (ι : Type*) (C : Pref → ℤ) (h gStar : Pref)
    (hF1 : ∀ g, OneInput g → C h ≤ C g) (hStar : ∀ g, C gStar ≤ C g) :
    (∀ (f : Pair → Pair) (s : Schedule V) (A : Apart V), C h ≤ C (A.decision f s)) ∧
    ∀ (f : Pair → Pair) (s : Schedule V) (J : Collective V ι),
      C h - C (J.decision f s) ≤ C h - C gStar := by
  refine ⟨fun f s A => hF1 _ (thm_dev_apart_one_input f s A), fun f s J => ?_⟩
  have := hStar (J.decision f s)
  omega

end DeviceTheory

/-! ## Primitive starts on the line -/

/-- A window `L` placed at cell `p` of the line in background `b`. -/
def place (b : Tone) (p : ℤ) (L : List Tone) : Config ℤ := fun v =>
  if p ≤ v then L.getD (v - p).toNat b else b

/-- A primitive start: both end cells off the background (so it is nonempty). -/
def Primitive (b : Tone) (L : List Tone) : Prop :=
  L.getD 0 b ≠ b ∧ L.getD (L.length - 1) b ≠ b

private theorem place_at (b : Tone) (p : ℤ) (L : List Tone) (k : Nat) :
    place b p L (p + (k : ℤ)) = L.getD k b := by
  have h1 : p ≤ p + (k : ℤ) := by omega
  have h2 : (p + (k : ℤ) - p).toNat = k := by omega
  simp only [place, h1, h2, ↓reduceIte]

private theorem place_below (b : Tone) (p : ℤ) (L : List Tone) (v : ℤ) (hv : v < p) :
    place b p L v = b := by
  have h : ¬ p ≤ v := by omega
  simp only [place, h, ↓reduceIte]

private theorem place_inj (b : Tone) (p p' : ℤ) (L L' : List Tone) (hL : Primitive b L)
    (hL' : Primitive b L') (h : place b p L = place b p' L') : p = p' ∧ L = L' := by
  have hp : p = p' := by
    rcases lt_trichotomy p p' with hlt | heq | hlt
    · have e := congrFun h (p + ((0 : Nat) : ℤ))
      rw [place_at, place_below b p' L' _ (by omega)] at e
      exact absurd e hL.1
    · exact heq
    · have e := congrFun h (p' + ((0 : Nat) : ℤ))
      rw [place_at, place_below b p L _ (by omega)] at e
      exact absurd e.symm hL'.1
  subst hp
  have hlen : L.length = L'.length := by
    rcases lt_trichotomy L.length L'.length with hlt | heq | hlt
    · have e := congrFun h (p + ((L'.length - 1 : Nat) : ℤ))
      rw [place_at, place_at, List.getD_eq_getElem?_getD (l := L),
        List.getElem?_eq_none (by omega), Option.getD_none] at e
      exact absurd e.symm hL'.2
    · exact heq
    · have e := congrFun h (p + ((L.length - 1 : Nat) : ℤ))
      rw [place_at, place_at, List.getD_eq_getElem?_getD (l := L'),
        List.getElem?_eq_none (by omega), Option.getD_none] at e
      exact absurd e hL.2
  refine ⟨rfl, List.ext_getElem hlen fun k h1 h2 => ?_⟩
  have e := congrFun h (p + (k : ℤ))
  rwa [place_at, place_at, List.getD_eq_getElem?_getD (l := L),
    List.getD_eq_getElem?_getD (l := L'), List.getElem?_eq_getElem h1,
    List.getElem?_eq_getElem h2, Option.getD_some, Option.getD_some] at e

/-- **D2 on the census's starts.** On the line `ℤ` under any schedule and any permutation pair
    rule, two primitive starts (both end cells off the background `b`) placed at cells `p` and `p'`
    give distinct developments at every round count `T` unless they are the same window at the same
    cell: the census's starts at parity 0 and 1 are all told apart. -/
theorem thm_dev_primitive_developments_distinct (F : Equiv.Perm Pair) (s : Schedule ℤ)
    (b : Tone) (T : Nat) (p p' : ℤ) (L L' : List Tone) (hL : Primitive b L)
    (hL' : Primitive b L') (hne : (p, L) ≠ (p', L')) :
    (round F s)^[T] (place b p L) ≠ (round F s)^[T] (place b p' L') := by
  intro e
  obtain ⟨h1, h2⟩ := place_inj b p p' L L' hL hL' ((roundPerm F s).injective.iterate T e)
  exact hne (by rw [h1, h2])

end Devices

end Compute

end Vibe
