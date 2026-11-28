import Vibe.PairRules
import Vibe.WireInvariant
import Vibe.Compute.PairRuleLink
import Vibe.Generated.RuleCensus

/-!
# Vibe Theory: The Census of the 24 Pair Rules, Their Passenger Laws and Their 72 Cells

The finite facts of milestones M1, M5 and M6 about the 24 conservative reversible pair rules of
`Vibe.PairRules`, each proved by `decide` over Lean definitions, with a bridge theorem tying every
definition to the TypeScript that ran (`Vibe.Generated.RuleCensus`, written by `task/lean-export.ts`).

- **B1, coincidences** (`thm_rule_census_vacuum_classes`, `thm_rule_census_time_reversal`): 8 rules in 6
  classes fix the vacuum pair; the other 16, in the other 6 classes, have none of the three properties
  (fix the vacuum, conserve `D`, commute with the swap); every creating rule is chiral and makes
  `(-1, +1)` or `(+1, -1)`; the inverse of every rule lies in its own class, so adding time reversal
  to `{1, P, C, PC}` merges no class.
- **B2, passenger laws** (`thm_rule_census_passengers`, `thm_rule_census_sided_closure`): a rule keeps
  tone `v` forward when the second cell holds `v` after the rule exactly when the first held it before,
  backward when the first holds it exactly when the second did. 14 rules keep no tone either way, and
  exactly two, `swap.BCA.swap` and `swap.CAB.swap`, keep a tone on both sides. For those two the least
  sets of unary tables closed under the rule with sides (`Sided`) hold exactly the passenger-compatible
  tables, 13 per side, never Kleene `neg`, while the closure without sides (`Unsided`) holds all 27.
- **B3, the M6 cells** (`thm_rule_census_cells`, `thm_rule_census_blind`, `thm_rule_census_wire_cells`):
  of the 72 rule-background cells, 24 are species-conserving (types `T0` to `T5`: 3, 3, 3, 3, 6, 6),
  32 reactive and 16 have no quiet background; the quiet M5 occupancy-blind cells are exactly the
  `T0` to `T3` cells; exactly 8 cells have a one-sided wire, all reactive.
- **Representations** (`thm_rule_census_wire_tone_equiv`): `WireInvariant.T` and `Vibe.Tone` are in
  bijection (negation and order kept), and `bcaSwap`, `cabSwap`, `cabId` of `Vibe.WireInvariant` are the
  rules `swap.BCA.swap`, `swap.CAB.swap`, `id.CAB.swap` among the 24.

The cell kind, the type, the occupancy-blind flag, the quiet flag and the wire side are defined here
once for later modules.

Core Lean only: `decide` over finite tables and induction on the closure predicates, zero `sorry`,
zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe
namespace RuleCensus

open PairRuleLink

/-- The three tones in value order `-1, 0, +1`. -/
def tones : List Tone := [.neg, .zero, .pos]

-- [helper]
theorem mem_tones (t : Tone) : t ∈ tones := by
  cases t <;> decide

/-- Rule `i` of the code's census, decoded from the generated table (`gen_pair_rules_eq`). -/
def genTable (i : Nat) : Pair → Pair := decodeRule (Generated.pairRuleTables.getD i [])

/-! ## Representations: `WireInvariant.T` and `Vibe.Tone` -/

/-- `WireInvariant.T` to `Tone`. -/
def toTone : WireInvariant.T → Tone
  | .m => .neg
  | .z => .zero
  | .p => .pos

/-- `Tone` to `WireInvariant.T`. -/
def ofTone : Tone → WireInvariant.T
  | .neg => .m
  | .zero => .z
  | .pos => .p

/-- A pair rule of `Vibe.WireInvariant`, read as a map of `Pair`. -/
def liftRule (r : WireInvariant.T → WireInvariant.T → WireInvariant.T × WireInvariant.T) :
    Pair → Pair :=
  fun p => ((r (ofTone p.1) (ofTone p.2)).1 |> toTone, (r (ofTone p.1) (ofTone p.2)).2 |> toTone)

/-! ## Rule names and flags (pair-rule.ts) -/

/-- `id` or `swap` on the two pairs `x`, `y` of one fiber. -/
def twoName (f : Pair → Pair) (x y : Pair) : String :=
  if f x = x ∧ f y = y then "id" else if f x = y ∧ f y = x then "swap" else "?"

/-- The letter of a sum-0 pair: `A = (-1, +1)`, `B = (0, 0)`, `C = (+1, -1)`. -/
def letter (q : Pair) : String :=
  if q = (.neg, .pos) then "A" else if q = prVac then "B" else if q = (.pos, .neg) then "C" else "?"

/-- The name `s-.s0.s+` of a rule, as `pairRuleName` of pair-rule.ts reads it. -/
def ruleName (f : Pair → Pair) : String :=
  twoName f (.neg, .zero) (.zero, .neg) ++ "." ++ letter (f (.neg, .pos)) ++ letter (f prVac) ++
    letter (f (.pos, .neg)) ++ "." ++ twoName f (.zero, .pos) (.pos, .zero)

/-- `f` fixes the vacuum pair. -/
def fixesVacB (f : Pair → Pair) : Bool := decide (f prVac = prVac)

/-- `f` commutes with the negation `C`. -/
def prNegB (f : Pair → Pair) : Bool := prAllPairs.all fun p => decide (f (prNeg p) = prNeg (f p))

/-- The flags the code exports per rule: name, vacuum, `D`, swap, negation. -/
def metaFlags (f : Pair → Pair) : String × Bool × Bool × Bool × Bool :=
  (ruleName f, fixesVacB f, prDConsB f, prSwapB f, prNegB f)

/-- The generated flags, without the class indices. -/
def genFlags : List (String × Bool × Bool × Bool × Bool) :=
  Generated.ruleCensusMeta.map fun m => (m.1, m.2.1, m.2.2.1, m.2.2.2.1, m.2.2.2.2.1)

/-- The generated class index of rule `i` under `{1, P, C, PC}`. -/
def genClass (i : Nat) : Nat :=
  (Generated.ruleCensusMeta.getD i ("", false, false, false, false, 0, 0)).2.2.2.2.2.1

/-- The generated class index of rule `i` with time reversal added. -/
def genClassInv (i : Nat) : Nat :=
  (Generated.ruleCensusMeta.getD i ("", false, false, false, false, 0, 0)).2.2.2.2.2.2

/-- Bridge for `ruleCensusMeta`: the code's name and four symmetry flags of every census rule are those
    of its decoded table; two rules share a code class index exactly when their codes lie in one orbit
    of `{1, P, C, PC}` (`prOrbit`); and the class index with time reversal is the plain one. -/
theorem gen_rule_census_meta_eq :
    genFlags = Generated.pairRuleTables.map (fun t => metaFlags (decodeRule t)) ∧
    (∀ i, i < 24 → ∀ j, j < 24 →
      (genClass i = genClass j ↔ prCodeOf (genTable j) ∈ prOrbit (prCodeOf (genTable i)))) ∧
    (∀ i, i < 24 → genClassInv i = genClass i) := by
  refine ⟨by decide +kernel, by decide +kernel, by decide +kernel⟩

/-! ## B1: vacuum, `D`, swap, classes and time reversal -/

private theorem vac_orbit_bool :
    ∀ n ∈ prRuleCodes, ∀ m ∈ prOrbit n, (prTable m prVac = prVac ↔ prTable n prVac = prVac) := by
  rw [pr_rule_codes_eq]; decide +kernel

private theorem create_bool :
    ∀ n ∈ prRuleCodes, prTable n prVac ≠ prVac →
      prTable n prVac = (.neg, .pos) ∨ prTable n prVac = (.pos, .neg) := by
  rw [pr_rule_codes_eq]; decide +kernel

/-- B1. Exactly 8 rules, in 6 classes, fix the vacuum pair; the other 16, in the other 6 classes, do
    not, and by `thm_pair_rule_vacuum_iff` neither conserve `D` nor commute with the swap; vacuum fixing
    is constant on every class; and every rule that makes something from the vacuum is chiral, conserves
    no `D`, and makes `(-1, +1)` or `(+1, -1)`. -/
theorem thm_rule_census_vacuum_classes :
    (prRuleCodes.filter fun n => decide (prTable n prVac = prVac)).length = 8 ∧
    (prClassReps.filter fun n => decide (prTable n prVac = prVac)).length = 6 ∧
    (prRuleCodes.filter fun n => decide (prTable n prVac ≠ prVac)).length = 16 ∧
    (prClassReps.filter fun n => decide (prTable n prVac ≠ prVac)).length = 6 ∧
    (∀ n ∈ prRuleCodes, ∀ m ∈ prOrbit n, (prTable m prVac = prVac ↔ prTable n prVac = prVac)) ∧
    (∀ B, PrSumPres B → PrInj B → B prVac ≠ prVac →
      ¬ PrDCons B ∧ ¬ PrSwapComm B ∧ (B prVac = (.neg, .pos) ∨ B prVac = (.pos, .neg))) := by
  refine ⟨by rw [pr_rule_codes_eq]; decide, by unfold prClassReps; rw [pr_rule_codes_eq]; decide,
    by rw [pr_rule_codes_eq]; decide, by unfold prClassReps; rw [pr_rule_codes_eq]; decide,
    vac_orbit_bool, ?_⟩
  intro B hS hI hV
  obtain ⟨hD, hP⟩ := thm_pair_rule_vacuum_iff.1 B hS hI
  refine ⟨fun h => hV (hD.2 h), fun h => hV (hP.2 h), ?_⟩
  obtain ⟨n, hn, hT⟩ := pr_rule_of B hS hI
  have hB : B = prTable n := funext hT
  subst hB
  exact create_bool n hn hV

private theorem inverse_bool :
    ∀ n ∈ prRuleCodes, prInvCode n ∈ prRuleCodes ∧ prInvCode n < 432 ∧ n < 432 ∧
      prAllPairs.all (fun p => decide (prTable n (prTable (prInvCode n) p) = p)) = true ∧
      prInvCode n ∈ prOrbit n ∧ ∀ m ∈ prOrbit (prInvCode n), m ∈ prOrbit n := by
  unfold prInvCode
  rw [pr_rule_codes_eq]; decide +kernel

/-- B1, time reversal. The inverse of every rule lies in the rule's own class, and so does its whole
    class: adding time reversal to `{1, P, C, PC}` merges no class. Stated for every conservative
    reversible pair rule `B` and every left inverse `g` of it: `g` is itself such a rule, in the class
    of `B`. -/
theorem thm_rule_census_time_reversal :
    (∀ n ∈ prRuleCodes, prInvCode n ∈ prOrbit n ∧ ∀ m ∈ prOrbit (prInvCode n), m ∈ prOrbit n) ∧
    (∀ B, PrSumPres B → PrInj B → ∀ g : Pair → Pair, (∀ p, g (B p) = p) →
      PrSumPres g ∧ PrInj g ∧ prCodeOf g ∈ prOrbit (prCodeOf B)) := by
  refine ⟨fun n hn => ⟨(inverse_bool n hn).2.2.2.2.1, (inverse_bool n hn).2.2.2.2.2⟩, ?_⟩
  intro B hS hI g hg
  obtain ⟨n, hn, hT⟩ := pr_rule_of B hS hI
  have hB : B = prTable n := funext hT
  subst hB
  obtain ⟨hm, hmlt, hnlt, hall, horb, _⟩ := inverse_bool n hn
  simp only [List.all_eq_true, decide_eq_true_eq] at hall
  have hgm : g = prTable (prInvCode n) := by
    funext p
    have h := hg (prTable (prInvCode n) p)
    rw [hall p (pr_mem_allPairs p)] at h
    exact h
  subst hgm
  have hr := (thm_pair_rules_card.2.2.2.2.2 (prTable (prInvCode n))).2 ⟨prInvCode n, hm, fun _ => rfl⟩
  refine ⟨hr.1, hr.2, ?_⟩
  rw [pr_code_table _ hmlt, pr_code_table _ hnlt]
  exact horb

/-! ## B2: passenger laws -/

/-- `f` keeps tone `v` forward: the second cell holds `v` after the rule exactly when the first did. -/
def KeepsFwd (f : Pair → Pair) (v : Tone) : Prop := ∀ a b, (f (a, b)).2 = v ↔ a = v

/-- `f` keeps tone `v` backward: the first cell holds `v` after the rule exactly when the second did. -/
def KeepsBwd (f : Pair → Pair) (v : Tone) : Prop := ∀ a b, (f (a, b)).1 = v ↔ b = v

def keepsFwdB (f : Pair → Pair) (v : Tone) : Bool :=
  tones.all fun a => tones.all fun b => decide ((f (a, b)).2 = v) == decide (a = v)

def keepsBwdB (f : Pair → Pair) (v : Tone) : Bool :=
  tones.all fun a => tones.all fun b => decide ((f (a, b)).1 = v) == decide (b = v)

/-- `f` keeps no tone, forward or backward. -/
def keepsNoneB (f : Pair → Pair) : Bool := tones.all fun v => !keepsFwdB f v && !keepsBwdB f v

/-- `f` keeps some tone forward and some tone backward. -/
def twoLawB (f : Pair → Pair) : Bool := tones.any (keepsFwdB f) && tones.any (keepsBwdB f)

-- [helper]
theorem keepsFwdB_iff (f : Pair → Pair) (v : Tone) : keepsFwdB f v = true ↔ KeepsFwd f v := by
  unfold keepsFwdB KeepsFwd
  simp only [List.all_eq_true, beq_iff_eq, decide_eq_decide]
  exact ⟨fun h a b => h a (mem_tones a) b (mem_tones b), fun h a _ b _ => h a b⟩

-- [helper]
theorem keepsBwdB_iff (f : Pair → Pair) (v : Tone) : keepsBwdB f v = true ↔ KeepsBwd f v := by
  unfold keepsBwdB KeepsBwd
  simp only [List.all_eq_true, beq_iff_eq, decide_eq_decide]
  exact ⟨fun h a b => h a (mem_tones a) b (mem_tones b), fun h a _ b _ => h a b⟩

-- [helper]
theorem keepsNoneB_iff (f : Pair → Pair) :
    keepsNoneB f = true ↔ ∀ v, ¬ KeepsFwd f v ∧ ¬ KeepsBwd f v := by
  unfold keepsNoneB
  simp only [List.all_eq_true, Bool.and_eq_true, Bool.not_eq_true']
  constructor
  · intro h v
    obtain ⟨h1, h2⟩ := h v (mem_tones v)
    refine ⟨fun k => ?_, fun k => ?_⟩
    · rw [(keepsFwdB_iff f v).2 k] at h1
      cases h1
    · rw [(keepsBwdB_iff f v).2 k] at h2
      cases h2
  · intro h v _
    refine ⟨?_, ?_⟩
    · cases e : keepsFwdB f v
      · rfl
      · exact absurd ((keepsFwdB_iff f v).1 e) (h v).1
    · cases e : keepsBwdB f v
      · rfl
      · exact absurd ((keepsBwdB_iff f v).1 e) (h v).2

/-- Bridge for `ruleCensusPassengers`: the code's `toneTransport` of every census rule, forward and
    backward for the tones `-1, 0, +1`, is `keepsFwdB` and `keepsBwdB` of its decoded table. -/
theorem gen_rule_census_passengers_eq :
    Generated.ruleCensusPassengers =
      Generated.pairRuleTables.map
        (fun t => tones.map fun v => (keepsFwdB (decodeRule t) v, keepsBwdB (decodeRule t) v)) := by
  decide +kernel

/-- B2. A rule keeps no tone either way exactly when `keepsNoneB` holds, and exactly 14 of the 24
    rules keep no tone. The 10 that keep one are 4 vacuum-fixing rules (`swap.CBA.swap`, `id.CBA.swap`,
    `swap.ABC.swap`, `swap.CBA.id`) and the 6 creating rules whose sum-0 fiber is a 3-cycle. Of those 6,
    exactly two keep a tone on both sides: `swap.BCA.swap` (`+1` forward, `-1` backward) and
    `swap.CAB.swap` (`-1` forward, `+1` backward), which are `bcaSwap` and `cabSwap` of
    `Vibe.WireInvariant`; the other four keep one tone on one side only. -/
theorem thm_rule_census_passengers :
    (∀ f, keepsNoneB f = true ↔ ∀ v, ¬ KeepsFwd f v ∧ ¬ KeepsBwd f v) ∧
    (prRuleCodes.filter fun n => keepsNoneB (prTable n)).length = 14 ∧
    (prRuleCodes.filter fun n => fixesVacB (prTable n) && !keepsNoneB (prTable n)).map
      (fun n => ruleName (prTable n)) = ["swap.CBA.swap", "id.CBA.swap", "swap.ABC.swap", "swap.CBA.id"] ∧
    (prRuleCodes.filter fun n => !fixesVacB (prTable n) && !keepsNoneB (prTable n)).map
      (fun n => ruleName (prTable n)) =
      ["swap.BCA.swap", "id.BCA.swap", "swap.CAB.swap", "id.CAB.swap", "swap.BCA.id", "swap.CAB.id"] ∧
    (prRuleCodes.filter fun n => !fixesVacB (prTable n) && twoLawB (prTable n)).map
      (fun n => ruleName (prTable n)) = ["swap.BCA.swap", "swap.CAB.swap"] ∧
    KeepsFwd (liftRule WireInvariant.bcaSwap) .pos ∧ KeepsBwd (liftRule WireInvariant.bcaSwap) .neg ∧
    KeepsFwd (liftRule WireInvariant.cabSwap) .neg ∧ KeepsBwd (liftRule WireInvariant.cabSwap) .pos ∧
    ruleName (liftRule WireInvariant.bcaSwap) = "swap.BCA.swap" ∧
    ruleName (liftRule WireInvariant.cabSwap) = "swap.CAB.swap" := by
  refine ⟨keepsNoneB_iff, by rw [pr_rule_codes_eq]; decide +kernel,
    by rw [pr_rule_codes_eq]; decide +kernel, by rw [pr_rule_codes_eq]; decide +kernel,
    by rw [pr_rule_codes_eq]; decide +kernel, (keepsFwdB_iff _ _).1 (by decide +kernel),
    (keepsBwdB_iff _ _).1 (by decide +kernel), (keepsFwdB_iff _ _).1 (by decide +kernel),
    (keepsBwdB_iff _ _).1 (by decide +kernel), by decide +kernel, by decide +kernel⟩

/-! ## B2: the sided and unsided unary closures -/

/-- A unary table: its values at the inputs `-1, 0, +1`. -/
abbrev Tri := Tone × Tone × Tone

/-- All 27 unary tables, by base-3 code (the value at input `-1` least significant). -/
def allTris : List Tri := tones.flatMap fun z => tones.flatMap fun y => tones.map fun x => (x, y, z)

-- [helper]
theorem mem_allTris (t : Tri) : t ∈ allTris := by
  rcases t with ⟨x, y, z⟩
  cases x <;> cases y <;> cases z <;> decide

/-- The rule applied input by input to (first-cell table, second-cell table): (first out, second out). -/
def triApply (f : Pair → Pair) (a b : Tri) : Tri × Tri :=
  (((f (a.1, b.1)).1, (f (a.2.1, b.2.1)).1, (f (a.2.2, b.2.2)).1),
   ((f (a.1, b.1)).2, (f (a.2.1, b.2.1)).2, (f (a.2.2, b.2.2)).2))

/-- The constants and the identity. -/
def seeds : List Tri := [(.neg, .neg, .neg), (.zero, .zero, .zero), (.pos, .pos, .pos), (.neg, .zero, .pos)]

/-- The tables a cell can hold when it next enters a pair as the first cell (`true`) or as the second
    (`false`), on a schedule where every cell alternates sides: the least sets holding the seeds and
    closed under the rule (its second output enters next as a first cell, its first output as a
    second cell). -/
inductive Sided (f : Pair → Pair) : Bool → Tri → Prop
  | seed (s : Bool) (t : Tri) : t ∈ seeds → Sided f s t
  | toFirst (a b : Tri) : Sided f true a → Sided f false b → Sided f true (triApply f a b).2
  | toSecond (a b : Tri) : Sided f true a → Sided f false b → Sided f false (triApply f a b).1

/-- The same closure with no sides: one set, both outputs of any two of its tables added back. -/
inductive Unsided (f : Pair → Pair) : Tri → Prop
  | seed (t : Tri) : t ∈ seeds → Unsided f t
  | out1 (a b : Tri) : Unsided f a → Unsided f b → Unsided f (triApply f a b).1
  | out2 (a b : Tri) : Unsided f a → Unsided f b → Unsided f (triApply f a b).2

/-- One round of the sided closure. -/
def sidedStep (f : Pair → Pair) (S : List Tri × List Tri) : List Tri × List Tri :=
  (allTris.filter fun t =>
      decide (t ∈ S.1) || S.1.any fun a => S.2.any fun b => decide ((triApply f a b).2 = t),
   allTris.filter fun t =>
      decide (t ∈ S.2) || S.1.any fun a => S.2.any fun b => decide ((triApply f a b).1 = t))

/-- The sided closure after `k` rounds. -/
def sidedLevel (f : Pair → Pair) : Nat → List Tri × List Tri
  | 0 => (seeds, seeds)
  | k + 1 => sidedStep f (sidedLevel f k)

/-- One side of a pair of sets. -/
def side (S : List Tri × List Tri) : Bool → List Tri
  | true => S.1
  | false => S.2

/-- One round of the unsided closure. -/
def unsidedStep (f : Pair → Pair) (S : List Tri) : List Tri :=
  allTris.filter fun t =>
    decide (t ∈ S) || S.any fun a => S.any fun b =>
      decide ((triApply f a b).1 = t) || decide ((triApply f a b).2 = t)

/-- The unsided closure after `k` rounds. -/
def unsidedLevel (f : Pair → Pair) : Nat → List Tri
  | 0 => seeds
  | k + 1 => unsidedStep f (unsidedLevel f k)

-- [helper]
theorem sided_of_level (f : Pair → Pair) :
    ∀ (k : Nat) (s : Bool) (t : Tri), t ∈ side (sidedLevel f k) s → Sided f s t := by
  intro k
  induction k with
  | zero => intro s t h; cases s <;> exact Sided.seed _ t h
  | succ k ih =>
    intro s t h
    cases s
    · simp only [side, sidedLevel, sidedStep, List.mem_filter, Bool.or_eq_true, decide_eq_true_eq,
        List.any_eq_true] at h
      rcases h.2 with h1 | ⟨a, ha, b, hb, he⟩
      · exact ih false t h1
      · rw [← he]; exact Sided.toSecond a b (ih true a ha) (ih false b hb)
    · simp only [side, sidedLevel, sidedStep, List.mem_filter, Bool.or_eq_true, decide_eq_true_eq,
        List.any_eq_true] at h
      rcases h.2 with h1 | ⟨a, ha, b, hb, he⟩
      · exact ih true t h1
      · rw [← he]; exact Sided.toFirst a b (ih true a ha) (ih false b hb)

-- [helper]
theorem level_of_sided (f : Pair → Pair) (K : Nat) (hfix : sidedLevel f (K + 1) = sidedLevel f K)
    (hseed : ∀ s, ∀ t ∈ seeds, t ∈ side (sidedLevel f K) s) :
    ∀ (s : Bool) (t : Tri), Sided f s t → t ∈ side (sidedLevel f K) s := by
  intro s t h
  induction h with
  | seed s t ht => exact hseed s t ht
  | toFirst a b _ _ iha ihb =>
    have hm : (triApply f a b).2 ∈ (sidedLevel f (K + 1)).1 := by
      simp only [sidedLevel, sidedStep, List.mem_filter, Bool.or_eq_true, decide_eq_true_eq,
        List.any_eq_true]
      exact ⟨mem_allTris _, Or.inr ⟨a, iha, b, ihb, rfl⟩⟩
    rw [hfix] at hm
    exact hm
  | toSecond a b _ _ iha ihb =>
    have hm : (triApply f a b).1 ∈ (sidedLevel f (K + 1)).2 := by
      simp only [sidedLevel, sidedStep, List.mem_filter, Bool.or_eq_true, decide_eq_true_eq,
        List.any_eq_true]
      exact ⟨mem_allTris _, Or.inr ⟨a, iha, b, ihb, rfl⟩⟩
    rw [hfix] at hm
    exact hm

-- [helper]
theorem unsided_of_level (f : Pair → Pair) :
    ∀ (k : Nat) (t : Tri), t ∈ unsidedLevel f k → Unsided f t := by
  intro k
  induction k with
  | zero => intro t h; exact Unsided.seed t h
  | succ k ih =>
    intro t h
    simp only [unsidedLevel, unsidedStep, List.mem_filter, Bool.or_eq_true, decide_eq_true_eq,
      List.any_eq_true] at h
    rcases h.2 with h1 | ⟨a, ha, b, hb, he | he⟩
    · exact ih t h1
    · rw [← he]; exact Unsided.out1 a b (ih a ha) (ih b hb)
    · rw [← he]; exact Unsided.out2 a b (ih a ha) (ih b hb)

/-- The value of a unary table at input `x`. -/
def triAt (t : Tri) : Tone → Tone
  | .neg => t.1
  | .zero => t.2.1
  | .pos => t.2.2

/-- A table can sit on a side that carries `v` as a passenger: the inputs where it reads `v` are none,
    all, or exactly the input `v` itself (`passengerCompatible` of wire-invariant.ts, arity 1). -/
def passengerCompatibleB (v : Tone) (t : Tri) : Bool :=
  tones.all (fun x => !decide (triAt t x = v)) || tones.all (fun x => decide (triAt t x = v)) ||
    tones.all (fun x => decide (triAt t x = v) == decide (x = v))

/-- Kleene `neg` as a unary table. -/
def negTri : Tri := (.pos, .zero, .neg)

/-- The number of closure rounds after which both two-law closures are fixed. -/
def closureRounds : Nat := 3

-- [helper]
theorem sided_iff_level (f : Pair → Pair) (hfix : sidedLevel f (closureRounds + 1) = sidedLevel f closureRounds)
    (hseed : ∀ s, ∀ t ∈ seeds, t ∈ side (sidedLevel f closureRounds) s) (s : Bool) (t : Tri) :
    Sided f s t ↔ t ∈ side (sidedLevel f closureRounds) s :=
  ⟨level_of_sided f closureRounds hfix hseed s t, sided_of_level f closureRounds s t⟩

private theorem bca_fix :
    sidedLevel (liftRule WireInvariant.bcaSwap) (closureRounds + 1) =
      sidedLevel (liftRule WireInvariant.bcaSwap) closureRounds := by decide +kernel

private theorem cab_fix :
    sidedLevel (liftRule WireInvariant.cabSwap) (closureRounds + 1) =
      sidedLevel (liftRule WireInvariant.cabSwap) closureRounds := by decide +kernel

private theorem bca_seed :
    ∀ s, ∀ t ∈ seeds, t ∈ side (sidedLevel (liftRule WireInvariant.bcaSwap) closureRounds) s := by
  intro s; cases s <;> decide +kernel

private theorem cab_seed :
    ∀ s, ∀ t ∈ seeds, t ∈ side (sidedLevel (liftRule WireInvariant.cabSwap) closureRounds) s := by
  intro s; cases s <;> decide +kernel

private theorem bca_levels :
    (sidedLevel (liftRule WireInvariant.bcaSwap) closureRounds).1 = allTris.filter (passengerCompatibleB .pos) ∧
    (sidedLevel (liftRule WireInvariant.bcaSwap) closureRounds).2 = allTris.filter (passengerCompatibleB .neg) ∧
    unsidedLevel (liftRule WireInvariant.bcaSwap) closureRounds = allTris := by decide +kernel

private theorem cab_levels :
    (sidedLevel (liftRule WireInvariant.cabSwap) closureRounds).1 = allTris.filter (passengerCompatibleB .neg) ∧
    (sidedLevel (liftRule WireInvariant.cabSwap) closureRounds).2 = allTris.filter (passengerCompatibleB .pos) ∧
    unsidedLevel (liftRule WireInvariant.cabSwap) closureRounds = allTris := by decide +kernel

/-- B2, the sided closure. For `swap.BCA.swap` the tables a cell can hold entering as the first cell
    are exactly those compatible with the forward passenger `+1`, and entering as the second cell
    exactly those compatible with the backward passenger `-1`; 13 per side, `neg` on neither. For
    `swap.CAB.swap` the same with `-1` and `+1` exchanged. Without sides the closure holds all 27
    tables for both rules, so the theorem needs the side alternation. -/
theorem thm_rule_census_sided_closure :
    (∀ t, Sided (liftRule WireInvariant.bcaSwap) true t ↔ passengerCompatibleB .pos t = true) ∧
    (∀ t, Sided (liftRule WireInvariant.bcaSwap) false t ↔ passengerCompatibleB .neg t = true) ∧
    (∀ t, Sided (liftRule WireInvariant.cabSwap) true t ↔ passengerCompatibleB .neg t = true) ∧
    (∀ t, Sided (liftRule WireInvariant.cabSwap) false t ↔ passengerCompatibleB .pos t = true) ∧
    (allTris.filter (passengerCompatibleB .pos)).length = 13 ∧
    (allTris.filter (passengerCompatibleB .neg)).length = 13 ∧
    passengerCompatibleB .pos negTri = false ∧ passengerCompatibleB .neg negTri = false ∧
    (∀ t, Unsided (liftRule WireInvariant.bcaSwap) t) ∧ (∀ t, Unsided (liftRule WireInvariant.cabSwap) t) := by
  have key : ∀ (L : List Tri) (v : Tone), L = allTris.filter (passengerCompatibleB v) →
      ∀ t, t ∈ L ↔ passengerCompatibleB v t = true := by
    intro L v hL t
    rw [hL, List.mem_filter]
    exact ⟨fun h => h.2, fun h => ⟨mem_allTris t, h⟩⟩
  obtain ⟨b1, b2, b3⟩ := bca_levels
  obtain ⟨c1, c2, c3⟩ := cab_levels
  refine ⟨fun t => (sided_iff_level _ bca_fix bca_seed true t).trans (key _ _ b1 t),
    fun t => (sided_iff_level _ bca_fix bca_seed false t).trans (key _ _ b2 t),
    fun t => (sided_iff_level _ cab_fix cab_seed true t).trans (key _ _ c1 t),
    fun t => (sided_iff_level _ cab_fix cab_seed false t).trans (key _ _ c2 t),
    by decide, by decide, by decide, by decide, ?_, ?_⟩
  · intro t
    apply unsided_of_level _ closureRounds
    rw [b3]; exact mem_allTris t
  · intro t
    apply unsided_of_level _ closureRounds
    rw [c3]; exact mem_allTris t

/-- A unary table as the code's integer triple `(t(-1), t(0), t(+1))`. -/
def triInts (t : Tri) : Int × Int × Int := (t.1.value, t.2.1.value, t.2.2.value)

/-- Bridge for `ruleCensusClosures`: census rules 19 and 21 are `swap.BCA.swap` and `swap.CAB.swap`,
    equal to `bcaSwap` and `cabSwap` of `Vibe.WireInvariant`, and the code's `sidedUnaryClosure` (first
    and second side) and `unsidedUnaryClosure` of each are the Lean closures `sidedLevel` and
    `unsidedLevel` after `closureRounds` rounds (characterized by `thm_rule_census_sided_closure`). -/
theorem gen_rule_census_closures_eq :
    Generated.ruleCensusClosures.map (fun c => (c.1, c.2.1)) =
      [19, 21].map (fun i => (i, ruleName (genTable i))) ∧
    Generated.ruleCensusClosures.map (fun c => c.2.2.1) =
      [19, 21].map (fun i => (sidedLevel (genTable i) closureRounds).1.map triInts) ∧
    Generated.ruleCensusClosures.map (fun c => c.2.2.2.1) =
      [19, 21].map (fun i => (sidedLevel (genTable i) closureRounds).2.map triInts) ∧
    Generated.ruleCensusClosures.map (fun c => c.2.2.2.2) =
      [19, 21].map (fun i => (unsidedLevel (genTable i) closureRounds).map triInts) ∧
    (∀ p, genTable 19 p = liftRule WireInvariant.bcaSwap p) ∧
    (∀ p, genTable 21 p = liftRule WireInvariant.cabSwap p) := by
  refine ⟨by decide +kernel, by decide +kernel, by decide +kernel, by decide +kernel, ?_, ?_⟩
  · intro p; rcases p with ⟨a, b⟩; cases a <;> cases b <;> decide
  · intro p; rcases p with ⟨a, b⟩; cases a <;> cases b <;> decide

/-! ## B3: the 72 rule-background cells of M6 -/

/-- What a pair rule does to one pair: keep it or swap its cells. -/
inductive Move
  | keep
  | swap
  deriving DecidableEq, Repr

/-- The M6 kind of a rule-background cell. -/
inductive CellKind
  | species
  | reactive
  | liveVacuum
  deriving DecidableEq, Repr

/-- The six species types, up to exchanging the two excitations. -/
inductive CellType
  | t0
  | t1
  | t2
  | t3
  | t4
  | t5
  deriving DecidableEq, Repr

/-- The side of every pair a one-sided wire rides. -/
inductive WireSide
  | right
  | left
  deriving DecidableEq, Repr

/-- `keep` or `swap` when the pair `(a, c)` maps to itself or to `(c, a)`, `none` when its tones change. -/
def pairMove (f : Pair → Pair) (a c : Tone) : Option Move :=
  if f (a, c) = (a, c) then some .keep else if f (a, c) = (c, a) then some .swap else none

/-- The background is quiet: the uniform pair `(b, b)` is fixed. -/
def quietB (f : Pair → Pair) (b : Tone) : Bool := decide (f (b, b) = (b, b))

/-- The two excitations of background `b`, in value order. -/
def excitations : Tone → Tone × Tone
  | .neg => (.zero, .pos)
  | .zero => (.neg, .pos)
  | .pos => (.neg, .zero)

/-- The cell kind of `splitCell` (counter.ts): no quiet background, species-conserving when every pair
    is kept or swapped, reactive otherwise. -/
def cellKind (f : Pair → Pair) (b : Tone) : CellKind :=
  if quietB f b = false then .liveVacuum
  else if tones.all (fun a => tones.all fun c => (pairMove f a c).isSome) then .species
  else .reactive

/-- The type of the triple (lone `u`, lone `v`, `u` meets `v`). -/
def typeOf : Move → Move → Move → CellType
  | .keep, .keep, .keep => .t0
  | .keep, .keep, .swap => .t1
  | .swap, .swap, .keep => .t2
  | .swap, .swap, .swap => .t3
  | .swap, .keep, .keep => .t4
  | .keep, .swap, .keep => .t4
  | .swap, .keep, .swap => .t5
  | .keep, .swap, .swap => .t5

/-- The species type of a cell, `none` off the species cells. -/
def cellType (f : Pair → Pair) (b : Tone) : Option CellType :=
  if cellKind f b = .species then
    match pairMove f (excitations b).1 b, pairMove f (excitations b).2 b,
        pairMove f (excitations b).1 (excitations b).2 with
    | some lu, some lv, some m => some (typeOf lu lv m)
    | _, _, _ => none
  else none

/-- The M5 occupancy-blind flag (gates.ts): for each occupancy pattern of a pair, one move (keep or
    swap) is right for every pair of that pattern. -/
def occBlindB (f : Pair → Pair) (b : Tone) : Bool :=
  [(false, false), (false, true), (true, false), (true, true)].all fun pat =>
    [Move.keep, Move.swap].any fun m => tones.all fun a => tones.all fun c =>
      !decide ((decide (a ≠ b), decide (c ≠ b)) = pat) ||
        (match m with
         | .keep => decide (f (a, c) = (a, c))
         | .swap => decide (f (a, c) = (c, a)))

/-- Both excitations pass a background partner on the right: `(t, b) ↦ (b, t)`. -/
def passesRightB (f : Pair → Pair) (b : Tone) : Bool :=
  decide (f ((excitations b).1, b) = (b, (excitations b).1)) &&
    decide (f ((excitations b).2, b) = (b, (excitations b).2))

/-- Both excitations pass a background partner on the left: `(b, t) ↦ (t, b)`. -/
def passesLeftB (f : Pair → Pair) (b : Tone) : Bool :=
  decide (f (b, (excitations b).1) = ((excitations b).1, b)) &&
    decide (f (b, (excitations b).2) = ((excitations b).2, b))

/-- The wire side of `wireSide` (ray-search.ts): a quiet cell whose excitations pass the background on
    exactly one side. -/
def wireSide (f : Pair → Pair) (b : Tone) : Option WireSide :=
  if quietB f b = false then none
  else if passesRightB f b && !passesLeftB f b then some .right
  else if passesLeftB f b && !passesRightB f b then some .left
  else none

/-- The 72 cells: every rule code with every background. -/
def cells : List (Nat × Tone) := prRuleCodes.flatMap fun n => tones.map fun b => (n, b)

def kindName : CellKind → String
  | .species => "species"
  | .reactive => "reactive"
  | .liveVacuum => "live_vacuum"

def typeName : Option CellType → String
  | some .t0 => "T0"
  | some .t1 => "T1"
  | some .t2 => "T2"
  | some .t3 => "T3"
  | some .t4 => "T4"
  | some .t5 => "T5"
  | none => "none"

def sideName : Option WireSide → String
  | some .right => "right"
  | some .left => "left"
  | none => "none"

/-- The row the code exports for census rule `i` on background `b`. -/
def cellRow (i : Nat) (b : Tone) : Nat × Int × String × String × String × Bool :=
  (i, b.value, kindName (cellKind (genTable i) b), typeName (cellType (genTable i) b),
    sideName (wireSide (genTable i) b), occBlindB (genTable i) b)

/-- Bridge for `ruleCensusCells`: for every census rule and background `-1, 0, +1`, the code's
    `splitCell` kind and type, `wireSide` and `occupancyBlind` are `cellKind`, `cellType`, `wireSide`
    and `occBlindB` of the decoded table. -/
theorem gen_rule_census_cells_eq :
    Generated.ruleCensusCells = (List.range 24).flatMap fun i => tones.map (cellRow i) := by
  decide +kernel

/-- B3, the split. Of the 72 cells, 24 are species-conserving, 32 reactive and 16 have no quiet
    background. A cell is species-conserving exactly when its rule fixes the vacuum pair, and has no
    quiet background exactly when its rule does not and the background is `0`. Every species cell has
    one type, and the types `T0` to `T5` hold 3, 3, 3, 3, 6 and 6 cells. -/
theorem thm_rule_census_cells :
    cells.length = 72 ∧
    (cells.filter fun c => decide (cellKind (prTable c.1) c.2 = .species)).length = 24 ∧
    (cells.filter fun c => decide (cellKind (prTable c.1) c.2 = .reactive)).length = 32 ∧
    (cells.filter fun c => decide (cellKind (prTable c.1) c.2 = .liveVacuum)).length = 16 ∧
    (∀ c ∈ cells, (cellKind (prTable c.1) c.2 = .species ↔ prTable c.1 prVac = prVac) ∧
      (cellKind (prTable c.1) c.2 = .liveVacuum ↔ prTable c.1 prVac ≠ prVac ∧ c.2 = .zero) ∧
      (cellKind (prTable c.1) c.2 = .species ↔ (cellType (prTable c.1) c.2).isSome)) ∧
    [CellType.t0, .t1, .t2, .t3, .t4, .t5].map (fun T =>
      (cells.filter fun c => decide (cellType (prTable c.1) c.2 = some T)).length) = [3, 3, 3, 3, 6, 6] := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

/-- B3, occupancy-blind cells. A cell is quiet and occupancy-blind (M5) exactly when it is a species
    cell of type `T0` to `T3`: 12 cells. -/
theorem thm_rule_census_blind :
    (∀ c ∈ cells, (quietB (prTable c.1) c.2 && occBlindB (prTable c.1) c.2) = true ↔
      cellType (prTable c.1) c.2 ∈ [some .t0, some .t1, some .t2, some .t3]) ∧
    (cells.filter fun c => quietB (prTable c.1) c.2 && occBlindB (prTable c.1) c.2).length = 12 := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

/-- B3, one-sided wires. Exactly 8 of the 72 cells have a one-sided wire, all reactive: `id.BCA.swap`
    and `id.CAB.swap` on `+1`, `swap.BCA.id` and `swap.CAB.id` on `-1`, and `swap.BCA.swap` and
    `swap.CAB.swap` on both, with the sides listed. -/
theorem thm_rule_census_wire_cells :
    (cells.filter fun c => (wireSide (prTable c.1) c.2).isSome).length = 8 ∧
    (∀ c ∈ cells, (wireSide (prTable c.1) c.2).isSome → cellKind (prTable c.1) c.2 = .reactive) ∧
    ((cells.filter fun c => (wireSide (prTable c.1) c.2).isSome).map fun c =>
      (ruleName (prTable c.1), c.2, wireSide (prTable c.1) c.2)) =
      [("swap.BCA.swap", .neg, some .right), ("swap.BCA.swap", .pos, some .left),
        ("id.BCA.swap", .pos, some .left), ("swap.CAB.swap", .neg, some .left),
        ("swap.CAB.swap", .pos, some .right), ("id.CAB.swap", .pos, some .right),
        ("swap.BCA.id", .neg, some .right), ("swap.CAB.id", .neg, some .left)] := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

/-! ## Representations -/

/-- `WireInvariant.T` and `Vibe.Tone` are in bijection by `toTone` and `ofTone`, which keeps the value
    order, sends Kleene `tneg` to `Tone.dual`, and carries `bcaSwap`, `cabSwap`, `cabId` of
    `Vibe.WireInvariant` to the rules named `swap.BCA.swap`, `swap.CAB.swap`, `id.CAB.swap` among the
    24 of `Vibe.PairRules`. -/
theorem thm_rule_census_wire_tone_equiv :
    (∀ t, ofTone (toTone t) = t) ∧ (∀ u, toTone (ofTone u) = u) ∧
    (∀ t, toTone (WireInvariant.tneg t) = (toTone t).dual) ∧
    (∀ x y, WireInvariant.rank x ≤ WireInvariant.rank y ↔ (toTone x).value ≤ (toTone y).value) ∧
    (∀ p, liftRule WireInvariant.bcaSwap p = prTable 137 p) ∧
    (∀ p, liftRule WireInvariant.cabSwap p = prTable 153 p) ∧
    (∀ p, liftRule WireInvariant.cabId p = prTable 154 p) ∧
    137 ∈ prRuleCodes ∧ 153 ∈ prRuleCodes ∧ 154 ∈ prRuleCodes ∧
    ruleName (prTable 137) = "swap.BCA.swap" ∧ ruleName (prTable 153) = "swap.CAB.swap" ∧
    ruleName (prTable 154) = "id.CAB.swap" := by
  refine ⟨fun t => by cases t <;> rfl, fun u => by cases u <;> rfl, fun t => by cases t <;> rfl,
    fun x y => by cases x <;> cases y <;> decide, ?_, ?_, ?_, by rw [pr_rule_codes_eq]; decide,
    by rw [pr_rule_codes_eq]; decide, by rw [pr_rule_codes_eq]; decide, by decide, by decide, by decide⟩
  all_goals (intro p; rcases p with ⟨a, b⟩; cases a <;> cases b <;> decide)

end RuleCensus
end Vibe
