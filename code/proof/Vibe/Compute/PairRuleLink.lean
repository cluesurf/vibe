import Vibe.PairRules
import Vibe.Generated.PairRuleTable

/-!
# Vibe Theory: The Pair-Rule Tables of the Code Equal `PairRules`

`Vibe.Generated.PairRuleTable` is written by `task/lean-export.ts`, which calls `pair-rule.ts` itself:
`pairTonesTable` is `pairTones p` for every pair index `p`, and `pairRuleTables` is the table of every
rule of `pairRuleCensus()` (the brute force over all `9!` permutations of the nine pairs). The drift gate
`task/check-lean-link.ts` regenerates that file and fails on any byte of difference, so the two theorems
here speak about the tables the TypeScript experiments ran:

- `gen_pair_tones_eq`: the code's pair index `p = (a + 1) * 3 + (b + 1)` names the same pair as
  position `p` of `prAllPairs`, so decoding an index table into a map `Pair → Pair` is faithful.
- `gen_pair_rules_eq`: the decoded generated tables are exactly the `24` conservative reversible pair rules
  of `Vibe.PairRules`: 24 distinct tables, a permutation of the encodings of `prRuleCodes`, and a map of
  `Tone × Tone` is sum-preserving and injective iff it is one of the decoded tables.

Core Lean only: `decide` over finite tables, zero `sorry`, zero `axiom`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe
namespace PairRuleLink

/-- The code's index of a tone: `t + 1`. -/
def toneIdx : Tone → Nat
  | .neg  => 0
  | .zero => 1
  | .pos  => 2

/-- The code's index of a pair: `(a + 1) * 3 + (b + 1)`. -/
def pairIdx (p : Pair) : Nat := toneIdx p.1 * 3 + toneIdx p.2

/-- The pair at code index `i` (the vacuum past the end, never reached on a rule table). -/
def decodePair (i : Nat) : Pair := prAllPairs.getD i prVac

/-- The map `Pair → Pair` of a code table: pair `p` goes to the pair at entry `pairIdx p`. -/
def decodeRule (t : List Nat) : Pair → Pair := fun p => decodePair (t.getD (pairIdx p) 0)

/-- The code table of a map: the index of the image of each pair, in index order. -/
def encodeRule (f : Pair → Pair) : List Nat := prAllPairs.map fun p => pairIdx (f p)

-- [helper]
/-- `decodePair` inverts `pairIdx`. -/
theorem decodePair_pairIdx (p : Pair) : decodePair (pairIdx p) = p := by
  rcases p with ⟨a, b⟩
  cases a <;> cases b <;> decide

/-- Bridge for `pairTonesTable`: the code's `pairTones` on every index is the tone pair at that
    position of `prAllPairs`, and position `pairIdx p` holds the values of `p`, so the code's pair
    index and `pairIdx` name the same pair. -/
theorem gen_pair_tones_eq :
    Generated.pairTonesTable = prAllPairs.map (fun p => (p.1.value, p.2.value)) ∧
    (∀ p : Pair, Generated.pairTonesTable.getD (pairIdx p) (0, 0) = (p.1.value, p.2.value)) ∧
    (∀ p : Pair, decodePair (pairIdx p) = p) ∧
    prAllPairs.map pairIdx = List.range 9 := by
  refine ⟨by decide, ?_, decodePair_pairIdx, by decide⟩
  intro p
  rcases p with ⟨a, b⟩
  cases a <;> cases b <;> decide

private theorem gen_rules_fwd :
    ∀ n ∈ prRuleCodes, ∃ t ∈ Generated.pairRuleTables,
      prAllPairs.all (fun p => decide (prTable n p = decodeRule t p)) = true := by
  rw [pr_rule_codes_eq]; decide

private theorem gen_rules_bwd :
    ∀ t ∈ Generated.pairRuleTables, ∃ n ∈ prRuleCodes,
      prAllPairs.all (fun p => decide (decodeRule t p = prTable n p)) = true := by
  rw [pr_rule_codes_eq]; decide

private theorem gen_all_eq {f g : Pair → Pair}
    (h : prAllPairs.all (fun p => decide (f p = g p)) = true) : ∀ p, f p = g p := by
  intro p
  have := List.all_eq_true.1 h p (pr_mem_allPairs p)
  simpa using this

/-- Bridge for `pairRuleTables`: the decoded generated tables are exactly the 24 rules of
    `Vibe.PairRules`. There are `24` distinct tables of nine entries, each the encoding of its own
    decoding; they are a permutation of the encodings of `prRuleCodes`; and a map of `Tone × Tone` is
    sum-preserving and injective iff it equals the decoding of one of them. -/
theorem gen_pair_rules_eq :
    Generated.pairRuleTables.length = 24 ∧ Generated.pairRuleTables.Nodup ∧
    (∀ t ∈ Generated.pairRuleTables, t.length = 9 ∧ encodeRule (decodeRule t) = t) ∧
    (prRuleCodes.map fun n => encodeRule (prTable n)).Perm Generated.pairRuleTables ∧
    (∀ B : Pair → Pair,
      (PrSumPres B ∧ PrInj B) ↔ ∃ t ∈ Generated.pairRuleTables, ∀ p, B p = decodeRule t p) := by
  refine ⟨by decide, by decide, by decide, by rw [pr_rule_codes_eq]; decide, ?_⟩
  intro B
  rw [thm_pair_rules_card.2.2.2.2.2 B]
  constructor
  · rintro ⟨n, hn, hT⟩
    obtain ⟨t, ht, hall⟩ := gen_rules_fwd n hn
    exact ⟨t, ht, fun p => (hT p).trans (gen_all_eq hall p)⟩
  · rintro ⟨t, ht, hT⟩
    obtain ⟨n, hn, hall⟩ := gen_rules_bwd t ht
    exact ⟨n, hn, fun p => (hT p).trans (gen_all_eq hall p)⟩

end PairRuleLink
end Vibe
