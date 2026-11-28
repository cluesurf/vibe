module

public import Vibe.Tone
public import Vibe.Algebra
public import Vibe.Geometry
public import Vibe.Uniqueness4D
public import Vibe.Chirality
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
# Vibe Theory: Foundational Obstructions, Octonion Non-Associativity & 12-Countermodel Separation

Lean 4.35.0 + Mathlib formalization of Milestone P6-C (`03-vibe-doors-and-proof-bridge.md`
Door 6, `04-asynchronous-causal-beat-and-p6-blueprint.md` Section 3.4, Notes 1–6):
1. General Stabilizer Theorem (`Stab_G(x) ⊆ Stab_G(B x)`, equality for bijective `B`), two-site
   reflection-equivariant vacuum lock, and Symmetric Totality orbit invariance (`Ω = G · x`).
2. Two Zeros separation (`0_D ⊊ 0_V`), central trinomial counts `[1, 3, 7, 19, 51, 141]`, and
   complete 2-site rule census (`24` charge-preserving bijections; `4` `R`-equivariant involutions).
3. Complete 12-row dropped-premise countermodel suite (CM-1..12), full symbolic 8-square Degen
   identity & non-associativity for Fano octonions `OctInt`, `A_4`/`B_4` vs `D_4`, Euclidean
   `{3,4,3,3}` parity frustration vs unique `{3,4,3,4}`, and the Five Competing Universes A–E scorecard.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 0: Fast `Bool` Nodup Helper -/

private def cmNodupBool {α : Type} [DecidableEq α] : List α → Bool
  | [] => true
  | x :: xs => !(xs.any (fun y => decide (y = x))) && cmNodupBool xs

private theorem cm_nodup_of_nodupBool {α : Type} [DecidableEq α] :
    ∀ l : List α, cmNodupBool l = true → l.Nodup
  | [], _ => List.nodup_nil
  | x :: xs, h => by
    simp only [cmNodupBool, Bool.and_eq_true, Bool.not_eq_true', List.any_eq_false] at h
    refine List.nodup_cons.mpr ⟨fun hx => ?_, cm_nodup_of_nodupBool xs h.2⟩
    have hne := h.1 x hx
    simp at hne

/-! ## Section 1: General Stabilizer Obstruction & Symmetric Totality -/

def cmTwoSiteDual (p : Tone × Tone) : Tone × Tone := (p.1.dual, p.2.dual)
def cmC2Act : Bool → (Tone × Tone) → (Tone × Tone)
  | false, p => p
  | true, p => cmTwoSiteDual p
def cmAsymOrbit : List (Tone × Tone) := [(.neg, .pos), (.pos, .neg)]

private theorem cm_tone_dual_dual (t : Tone) : t.dual.dual = t := by cases t <;> rfl

private theorem cm_twoSiteDual_eq_self (p : Tone × Tone) (h : cmTwoSiteDual p = p) :
    p = (.zero, .zero) := by
  cases p with | mk a b => cases a <;> cases b <;> first | rfl | exact absurd h (by decide)

/-- General Stabilizer Theorem (`01c` §26, `01e` §17): for ANY `G`-equivariant map `B`,
    `Stab_G(x) ⊆ Stab_G(B x)` persists for ALL `t`, and bijective `B` yields `Stab_G(B x) = Stab_G(x)`. -/
theorem thm_cm_general_stabilizer_preservation {G C : Type}
    (act : G → C → C) (B : C → C)
    (hEq : ∀ g : G, ∀ y : C, B (act g y) = act g (B y)) (x : C) :
    (∀ g : G, act g x = x → act g (B x) = B x) ∧
    (∀ g : G, act g x = x → ∀ t : Nat, act g (iter B t x) = iter B t x) ∧
    (∀ Binv : C → C, (∀ y : C, Binv (B y) = y) → (∀ y : C, B (Binv y) = y) →
      (∀ g : G, ∀ y : C, Binv (act g y) = act g (Binv y)) ∧
      (∀ g : G, act g (B x) = B x ↔ act g x = x)) := by
  refine ⟨fun g hFix => by rw [← hEq g x, hFix], ?_, ?_⟩
  · intro g hFix t
    induction t with
    | zero => exact hFix
    | succ t ih => simp only [iter]; rw [← hEq g (iter B t x), ih]
  · intro Binv hLeft hRight
    have hEqInv : ∀ g : G, ∀ y : C, Binv (act g y) = act g (Binv y) := fun g y => by
      have h1 : B (act g (Binv y)) = act g y := by rw [hEq g (Binv y), hRight y]
      have h2 := congrArg Binv h1
      rw [hLeft (act g (Binv y))] at h2
      exact h2.symm
    refine ⟨hEqInv, fun g => ⟨fun hB => ?_, fun hx => by rw [← hEq g x, hx]⟩⟩
    have h2 := congrArg Binv ((hEq g x).trans hB)
    rw [hLeft (act g x), hLeft x] at h2
    exact h2

/-- Two-Site Reflection-Equivariant Vacuum Lock: every `R`-equivariant map on `Tone × Tone`
    fixes `(.zero, .zero)` identically and for ALL iterates `t : Nat`. -/
theorem thm_cm_two_site_symmetric_beat_fixes_zero
    (B : Tone × Tone → Tone × Tone)
    (hComm : ∀ p : Tone × Tone, B (cmTwoSiteDual p) = cmTwoSiteDual (B p)) :
    B (.zero, .zero) = (.zero, .zero) ∧ ∀ t : Nat, iter B t (.zero, .zero) = (.zero, .zero) := by
  have hStab := thm_cm_general_stabilizer_preservation
    (fun (_ : Unit) p => cmTwoSiteDual p) B (fun _ p => hComm p) (.zero, .zero)
  exact ⟨cm_twoSiteDual_eq_self _ (hStab.1 () rfl),
    fun t => cm_twoSiteDual_eq_self _ (hStab.2.1 () rfl t)⟩

/-- Symmetric Totality Orbit Invariance (`01e` §18): every group orbit `Ω(x) = G · x` is globally
    `G`-invariant even when individual members have trivial stabilizer (witness: `Ω = {(-,+), (+,-)}`). -/
theorem thm_cm_symmetric_totality_orbit_invariant :
    (∀ {G C : Type} (one : G) (mul : G → G → G) (inv : G → G) (act : G → C → C),
      (∀ y : C, act one y = y) →
      (∀ g h : G, ∀ y : C, act (mul g h) y = act g (act h y)) →
      (∀ g : G, mul (inv g) g = one) →
      ∀ (x y : C) (g : G), (∃ h : G, act h x = y) ↔ (∃ h : G, act h x = act g y)) ∧
    ((∀ b : Bool, cmC2Act b (.neg, .pos) = (.neg, .pos) → b = false) ∧
     (∀ b : Bool, ∀ p : Tone × Tone, (p ∈ cmAsymOrbit) ↔ (cmC2Act b p ∈ cmAsymOrbit)) ∧
     (∀ p ∈ cmAsymOrbit, p.1.value + p.2.value = 0)) := by
  refine ⟨?_, ?_, ?_, by decide⟩
  · intro G C one mul inv act hOne hMul hInv x y g
    constructor
    · intro ⟨h, hh⟩; exact ⟨mul g h, by rw [hMul g h x, hh]⟩
    · intro ⟨h, hh⟩
      exact ⟨mul (inv g) h, by rw [hMul (inv g) h x, hh, ← hMul (inv g) g y, hInv g, hOne y]⟩
  · intro b hb
    cases b with
    | false => rfl
    | true => exact absurd hb (by decide)
  · intro b p; cases b <;> cases p with | mk a c => cases a <;> cases c <;> decide

/-! ## Section 2: Two Zeros (`0_V` vs `0_D`), Central Trinomial Fiber & 2-Site Rule Census -/

def cmListSum : List Int → Int
  | [] => 0
  | x :: rest => x + cmListSum rest

def cmListSumSq : List Int → Int
  | [] => 0
  | x :: rest => x * x + cmListSumSq rest

def cmAllTernary : List Int → Prop
  | [] => True
  | x :: rest => (x = -1 ∨ x = 0 ∨ x = 1) ∧ cmAllTernary rest

def cmBalancedPairs : Nat → List Int
  | 0 => []
  | k + 1 => (-1) :: 1 :: cmBalancedPairs k

private theorem cm_listSumSq_nonneg (xs : List Int) : 0 ≤ cmListSumSq xs := by
  induction xs with
  | nil => decide
  | cons x _ ih => simp only [cmListSumSq]; nlinarith

private theorem cm_balancedPairs_spec (k : Nat) :
    cmListSum (cmBalancedPairs k) = 0 ∧ cmListSumSq (cmBalancedPairs k) = 2 * (k : Int) ∧
    cmAllTernary (cmBalancedPairs k) := by
  induction k with
  | zero => exact ⟨rfl, rfl, trivial⟩
  | succ k ih =>
    obtain ⟨ihSum, ihSq, ihT⟩ := ih
    simp only [cmBalancedPairs, cmListSum, cmListSumSq, cmAllTernary]
    exact ⟨by omega, by omega, Or.inl trivial, Or.inr (Or.inr trivial), ihT⟩

/-- Two Zeros Separation (`01b` §5, `01e` §19): `D = 0` (`0_D`) implies `Q = 0` (`0_V`), yet EVERY
    `k : Nat` admits a ternary configuration with `Q = 0` and `D = 2k`, so `0_V` does NOT imply `0_D`. -/
theorem thm_cm_two_zeros_separation :
    (∀ xs : List Int, cmListSumSq xs = 0 → (∀ x ∈ xs, x = 0) ∧ cmListSum xs = 0) ∧
    (∀ k : Nat, ∃ xs : List Int,
      cmListSum xs = 0 ∧ cmListSumSq xs = 2 * (k : Int) ∧ cmAllTernary xs) ∧
    ¬ (∀ xs : List Int, cmAllTernary xs → cmListSum xs = 0 → cmListSumSq xs = 0) := by
  refine ⟨?_, fun k => ⟨cmBalancedPairs k, cm_balancedPairs_spec k⟩, ?_⟩
  · intro xs
    induction xs with
    | nil => intro _; exact ⟨(fun _ h => nomatch h), rfl⟩
    | cons x rest ih =>
      intro hSq; simp only [cmListSumSq] at hSq
      have hRest := cm_listSumSq_nonneg rest
      have hx0 : x * x = 0 := by nlinarith
      have hx : x = 0 := mul_self_eq_zero.mp hx0
      obtain ⟨ihMem, ihSum⟩ := ih (by omega)
      refine ⟨fun y hy => ?_, by simp only [cmListSum]; omega⟩
      cases hy with
      | head => exact hx
      | tail _ hm => exact ihMem y hm
  · intro hAll
    exact absurd (hAll [-1, 1] ⟨Or.inl rfl, Or.inr (Or.inr rfl), trivial⟩ (by decide)) (by decide)

def cmToneListSum : List Tone → Int
  | [] => 0
  | t :: rest => t.value + cmToneListSum rest

def cmToneListSumSq : List Tone → Int
  | [] => 0
  | t :: rest => t.value * t.value + cmToneListSumSq rest

/-- Tree-recursive counter over all `3^n` ternary words in `{-1, 0, +1}^n` (recursion depth `n`). -/
def cmCountTernaryPred (p : List Tone → Bool) : Nat → List Tone → Nat
  | 0, acc => if p acc then 1 else 0
  | n + 1, acc =>
      cmCountTernaryPred p n (.neg :: acc) +
      cmCountTernaryPred p n (.zero :: acc) +
      cmCountTernaryPred p n (.pos :: acc)

def cmNeutralFiberCount (n : Nat) : Nat :=
  cmCountTernaryPred (fun w => cmToneListSum w == 0) n []

def cmZeroActivityCount (n : Nat) : Nat :=
  cmCountTernaryPred (fun w => cmToneListSumSq w == 0) n []

def cmTotalTernaryCount (n : Nat) : Nat :=
  cmCountTernaryPred (fun _ => true) n []

/-- Central Trinomial Neutral Fiber (`01b` §5): across `n = 1..6`, `|Q⁻¹(0) ∩ {-1,0,+1}^n|` equals
    `[1, 3, 7, 19, 51, 141]` while `|D⁻¹(0)| = [1, 1, 1, 1, 1, 1]` inside `3^n`. -/
theorem thm_cm_central_trinomial_counts :
    [1, 2, 3, 4, 5, 6].map cmNeutralFiberCount = [1, 3, 7, 19, 51, 141] ∧
    [1, 2, 3, 4, 5, 6].map cmZeroActivityCount = [1, 1, 1, 1, 1, 1] ∧
    [1, 2, 3, 4, 5, 6].map cmTotalTernaryCount = [3, 9, 27, 81, 243, 729] := by
  decide

def cmTwoSiteCharge (p : Tone × Tone) : Int := p.1.value + p.2.value
def cmAllTwoSiteStates : List (Tone × Tone) :=
  [ (.neg, .neg), (.neg, .zero), (.neg, .pos), (.zero, .neg), (.zero, .zero),
    (.zero, .pos), (.pos, .neg), (.pos, .zero), (.pos, .pos) ]

def cmApplyS3 (k : Fin 6) : Tone × Tone → Tone × Tone
  | (.neg, .pos)   =>
      if k.val = 0 ∨ k.val = 3 then (.neg, .pos)
      else if k.val = 1 ∨ k.val = 4 then (.pos, .neg) else (.zero, .zero)
  | (.zero, .zero) =>
      if k.val = 0 ∨ k.val = 1 then (.zero, .zero)
      else if k.val = 2 ∨ k.val = 4 then (.neg, .pos) else (.pos, .neg)
  | (.pos, .neg)   =>
      if k.val = 0 ∨ k.val = 2 then (.pos, .neg)
      else if k.val = 1 ∨ k.val = 5 then (.neg, .pos) else (.zero, .zero)
  | q              => q

def cmApplyTwoSiteRule (r : Bool × Fin 6 × Bool) : Tone × Tone → Tone × Tone
  | (.neg, .neg)   => (.neg, .neg)
  | (.neg, .zero)  => if r.1 then (.zero, .neg) else (.neg, .zero)
  | (.zero, .neg)  => if r.1 then (.neg, .zero) else (.zero, .neg)
  | (.neg, .pos)   => cmApplyS3 r.2.1 (.neg, .pos)
  | (.zero, .zero) => cmApplyS3 r.2.1 (.zero, .zero)
  | (.pos, .neg)   => cmApplyS3 r.2.1 (.pos, .neg)
  | (.zero, .pos)  => if r.2.2 then (.pos, .zero) else (.zero, .pos)
  | (.pos, .zero)  => if r.2.2 then (.zero, .pos) else (.pos, .zero)
  | (.pos, .pos)   => (.pos, .pos)

def cmAll24TwoSiteRules : List (Bool × Fin 6 × Bool) :=
  (List.finRange 6).foldl (fun acc k =>
    acc ++ [(false, k, false), (false, k, true), (true, k, false), (true, k, true)]) []

def cmRuleCommutesR (r : Bool × Fin 6 × Bool) : Bool :=
  cmAllTwoSiteStates.all (fun p =>
    cmApplyTwoSiteRule r (cmTwoSiteDual p) == cmTwoSiteDual (cmApplyTwoSiteRule r p))

private theorem cm_charge_neg2 (p : Tone × Tone) (h : cmTwoSiteCharge p = -2) : p = (.neg, .neg) := by
  cases p with | mk a b => cases a <;> cases b <;> first | rfl | exact absurd h (by decide)
private theorem cm_charge_pos2 (p : Tone × Tone) (h : cmTwoSiteCharge p = 2) : p = (.pos, .pos) := by
  cases p with | mk a b => cases a <;> cases b <;> first | rfl | exact absurd h (by decide)
private theorem cm_charge_neg1 (p : Tone × Tone) (h : cmTwoSiteCharge p = -1) :
    p = (.neg, .zero) ∨ p = (.zero, .neg) := by
  cases p with | mk a b => cases a <;> cases b <;> first | exact Or.inl rfl | exact Or.inr rfl | exact absurd h (by decide)
private theorem cm_charge_pos1 (p : Tone × Tone) (h : cmTwoSiteCharge p = 1) :
    p = (.zero, .pos) ∨ p = (.pos, .zero) := by
  cases p with | mk a b => cases a <;> cases b <;> first | exact Or.inl rfl | exact Or.inr rfl | exact absurd h (by decide)
private theorem cm_charge_zero (p : Tone × Tone) (h : cmTwoSiteCharge p = 0) :
    p = (.neg, .pos) ∨ p = (.zero, .zero) ∨ p = (.pos, .neg) := by
  cases p with | mk a b => cases a <;> cases b <;>
    first | exact Or.inl rfl | exact Or.inr (Or.inl rfl) | exact Or.inr (Or.inr rfl) | exact absurd h (by decide)

private theorem cm_pair_match (B : Tone × Tone → Tone × Tone) (x y : Tone × Tone) (hne : x ≠ y)
    (hx : B x = x ∨ B x = y) (hy : B y = x ∨ B y = y) (hInj : ∀ p q, B p = B q → p = q) :
    ∃ b : Bool, B x = (if b then y else x) ∧ B y = (if b then x else y) := by
  rcases hx with h1 | h1 <;> rcases hy with h2 | h2
  · exact absurd (hInj x y (h1.trans h2.symm)) hne
  · exact ⟨false, h1, h2⟩
  · exact ⟨true, h1, h2⟩
  · exact absurd (hInj x y (h1.trans h2.symm)) hne

private theorem cm_fiber_zero_match (B : Tone × Tone → Tone × Tone)
    (hQ : ∀ p, cmTwoSiteCharge (B p) = cmTwoSiteCharge p) (hInj : ∀ p q, B p = B q → p = q) :
    ∃ k : Fin 6, B (.neg, .pos) = cmApplyS3 k (.neg, .pos) ∧
      B (.zero, .zero) = cmApplyS3 k (.zero, .zero) ∧ B (.pos, .neg) = cmApplyS3 k (.pos, .neg) := by
  have ha := cm_charge_zero (B (.neg, .pos)) (hQ (.neg, .pos))
  have hz := cm_charge_zero (B (.zero, .zero)) (hQ (.zero, .zero))
  have hb := cm_charge_zero (B (.pos, .neg)) (hQ (.pos, .neg))
  rcases ha with ha | ha | ha <;> rcases hz with hz | hz | hz <;> rcases hb with hb | hb | hb <;>
    first
    | exact absurd (hInj _ _ (ha.trans hz.symm)) (by decide)
    | exact absurd (hInj _ _ (ha.trans hb.symm)) (by decide)
    | exact absurd (hInj _ _ (hz.trans hb.symm)) (by decide)
    | exact ⟨⟨0, by decide⟩, ha, hz, hb⟩ | exact ⟨⟨1, by decide⟩, ha, hz, hb⟩
    | exact ⟨⟨2, by decide⟩, ha, hz, hb⟩ | exact ⟨⟨3, by decide⟩, ha, hz, hb⟩
    | exact ⟨⟨4, by decide⟩, ha, hz, hb⟩ | exact ⟨⟨5, by decide⟩, ha, hz, hb⟩

/-- Complete 2-Site Rule Census (Note 5 §14): EVERY valence-preserving bijection on `Tone × Tone`
    is one of `1! 2! 3! 2! 1! = 24` distinct rules; EXACTLY `4` commute with `R`, and ALL `4` are
    involutions fixing `(.zero, .zero)` (while dropping `R` permits the 3-cycle `k = 4`). -/
theorem thm_cm_two_site_rule_census :
    (∀ B : Tone × Tone → Tone × Tone,
      (∀ p, cmTwoSiteCharge (B p) = cmTwoSiteCharge p) →
      (∀ p q, B p = B q → p = q) →
      ∃ r ∈ cmAll24TwoSiteRules, ∀ p, B p = cmApplyTwoSiteRule r p) ∧
    cmAll24TwoSiteRules.length = 24 ∧
    (cmAll24TwoSiteRules.all (fun r =>
      cmAllTwoSiteStates.all (fun p => cmTwoSiteCharge (cmApplyTwoSiteRule r p) == cmTwoSiteCharge p) &&
      cmAllTwoSiteStates.all (fun p => cmAllTwoSiteStates.all (fun q =>
        !(cmApplyTwoSiteRule r p == cmApplyTwoSiteRule r q) || (p == q)))) = true) ∧
    (cmAll24TwoSiteRules.all (fun r1 => cmAll24TwoSiteRules.all (fun r2 =>
      (r1 == r2) || !(cmAllTwoSiteStates.all (fun p => cmApplyTwoSiteRule r1 p == cmApplyTwoSiteRule r2 p)))) = true) ∧
    ((cmAll24TwoSiteRules.filter cmRuleCommutesR).length = 4) ∧
    ((cmAll24TwoSiteRules.filter cmRuleCommutesR).all (fun r =>
      (cmApplyTwoSiteRule r (.zero, .zero) == (.zero, .zero)) &&
      cmAllTwoSiteStates.all (fun p => cmApplyTwoSiteRule r (cmApplyTwoSiteRule r p) == p)) = true) ∧
    (let r3 := (false, (⟨4, by decide⟩ : Fin 6), false)
     cmApplyTwoSiteRule r3 (.zero, .zero) = (.neg, .pos) ∧
     cmApplyTwoSiteRule r3 (.neg, .pos) = (.pos, .neg) ∧
     cmApplyTwoSiteRule r3 (.pos, .neg) = (.zero, .zero)) := by
  refine ⟨?_, by decide, by decide, by decide, by decide, by decide, by decide⟩
  intro B hQ hInj
  have hnn := cm_charge_neg2 (B (.neg, .neg)) (hQ (.neg, .neg))
  have hpp := cm_charge_pos2 (B (.pos, .pos)) (hQ (.pos, .pos))
  obtain ⟨pNeg, hn1, hn2⟩ := cm_pair_match B (.neg, .zero) (.zero, .neg) (by decide)
    (cm_charge_neg1 _ (hQ _)) (cm_charge_neg1 _ (hQ _)) hInj
  obtain ⟨pZero, hz1, hz2, hz3⟩ := cm_fiber_zero_match B hQ hInj
  obtain ⟨pPos, hp1, hp2⟩ := cm_pair_match B (.zero, .pos) (.pos, .zero) (by decide)
    (cm_charge_pos1 _ (hQ _)) (cm_charge_pos1 _ (hQ _)) hInj
  have hMem : ∀ (b1 : Bool) (k : Fin 6) (b2 : Bool), (b1, k, b2) ∈ cmAll24TwoSiteRules := by
    intro b1 k b2
    have hAny : cmAll24TwoSiteRules.any (fun r => decide (r = (b1, k, b2))) = true :=
      (by decide : ∀ (x1 : Bool) (x2 : Fin 6) (x3 : Bool),
        cmAll24TwoSiteRules.any (fun r => decide (r = (x1, x2, x3))) = true) b1 k b2
    rcases List.any_eq_true.mp hAny with ⟨r, hr, heq⟩
    rw [of_decide_eq_true heq] at hr
    exact hr
  refine ⟨(pNeg, pZero, pPos), hMem pNeg pZero pPos, fun p => ?_⟩
  cases p with | mk a b => cases a <;> cases b <;> first
    | exact hnn | exact hn1 | exact hz1 | exact hn2 | exact hz2
    | exact hp1 | exact hz3 | exact hp2 | exact hpp

/-! ## Section 3: Dropped-Premise Countermodels CM-1 through CM-5 -/

def cmAllTones : List Tone := [.neg, .zero, .pos]
def cmToneMul : Tone → Tone → Tone
  | .zero, _ => .zero
  | _, .zero => .zero
  | .pos, t => t
  | .neg, t => t.dual

def cmC2ToneAct : Bool → Tone → Tone
  | false, t => t
  | true, t => t.dual

/-- CM-1 / Universe A (`{e_0}`): existence + trivial neutrality/reflection/reversibility admit a
    1-element model `Unit` with zero differentiation (`∀ a b : Unit, a = b`). -/
theorem thm_cm_countermodel_singleton :
    (∃ x : Unit, x = ()) ∧ (∀ x : Unit, (fun _ : Unit => (0 : Int)) x = 0) ∧
    (∀ x : Unit, id (id x) = x) ∧ (∀ a b : Unit, a = b) ∧ ¬ (∃ a b : Unit, a ≠ b) := by
  refine ⟨⟨(), rfl⟩, fun _ => rfl, fun _ => rfl, ?_, ?_⟩
  · intro a b; cases a; cases b; rfl
  · intro ⟨a, b, hne⟩; cases a; cases b; exact hne rfl

/-- CM-2 / Universe B (1D `C_2`): `(Tone, Tone.dual, cmToneMul)` satisfies differentiation,
    neutrality, involution `R^2 = I`, reversibility, and associativity, yet is period-2 and commutative. -/
theorem thm_cm_countermodel_1d_c2 :
    (∃ a b : Tone, a ≠ b) ∧
    (Tone.zero.value = 0 ∧ Tone.zero.dual = .zero ∧ ∀ t : Tone, t.dual.value = -t.value) ∧
    (∀ t : Tone, t.dual.dual = t) ∧
    (∀ (n : Nat) (t : Tone), iter Tone.dual (2 * n) t = t ∧ iter Tone.dual (2 * n + 1) t = t.dual) ∧
    (∀ a b c : Tone, cmToneMul (cmToneMul a b) c = cmToneMul a (cmToneMul b c)) ∧
    (∀ a b : Tone, cmToneMul a b = cmToneMul b a) ∧
    (∀ a b : Bool, ∀ t : Tone, cmC2ToneAct a (cmC2ToneAct b t) = cmC2ToneAct b (cmC2ToneAct a t)) := by
  refine ⟨⟨.neg, .pos, by decide⟩, ⟨rfl, rfl, fun t => by cases t <;> decide⟩,
    cm_tone_dual_dual, ?_, ?_, ?_, ?_⟩
  · intro n t
    have hEven : iter Tone.dual (2 * n) t = t := by
      induction n with
      | zero => rfl
      | succ n ih =>
        have h2 : 2 * (n + 1) = (2 * n + 1) + 1 := by omega
        rw [h2]; simp only [iter]; rw [ih, cm_tone_dual_dual]
    exact ⟨hEven, by simp only [iter]; rw [hEven]⟩
  · intro a b c; cases a <;> cases b <;> cases c <;> decide
  · intro a b; cases a <;> cases b <;> decide
  · intro a b t; cases a <;> cases b <;> cases t <;> decide

def cmTnDual {n : Nat} (v : Fin n → Tone) : Fin n → Tone := fun i => (v i).dual
def cmZnRefl0 (n : Nat) (v : Fin n → Int) : Fin n → Int := fun i => if i.val = 0 then -v i else v i
def cmRotZ3 (v : Int × Int × Int) : Int × Int × Int := (-v.2.1, v.1, v.2.2)

structure GaussInt where
  re : Int
  im : Int
  deriving DecidableEq, Repr

def cmGMul (x y : GaussInt) : GaussInt := ⟨x.re * y.re - x.im * y.im, x.re * y.im + x.im * y.re⟩
def cmGNorm (x : GaussInt) : Int := x.re * x.re + x.im * x.im

private theorem cm_gauss_mul_comm (x y : GaussInt) : cmGMul x y = cmGMul y x := by
  cases x; cases y; simp only [cmGMul, GaussInt.mk.injEq]; constructor <;> ring

private theorem cm_gauss_mul_assoc (x y z : GaussInt) : cmGMul (cmGMul x y) z = cmGMul x (cmGMul y z) := by
  cases x; cases y; cases z; simp only [cmGMul, GaussInt.mk.injEq]; constructor <;> ring

private theorem cm_gauss_norm_mul (x y : GaussInt) : cmGNorm (cmGMul x y) = cmGNorm x * cmGNorm y := by
  cases x; cases y; simp only [cmGNorm, cmGMul]; ring

private theorem cm_eis_norm_mul (x y : Eis) : Eis.normSq (Eis.mul x y) = Eis.normSq x * Eis.normSq y := by
  cases x; cases y; simp only [Eis.normSq, Eis.mul]; ring

/-- CM-3 (`T^n`/`ℤ^n`), CM-4 (`O(3)` on `S^2`), CM-5 (1D `ℤ` & 2D `ℤ[i]`/`ℤ[ω]`): arbitrary `n ≥ 1`
    admits orthogonal reflection without selecting `n = 4`, `O(3)` has nontrivial point stabilizers,
    and `ℤ`, `ℤ[i]`, `ℤ[ω]` are strictly commutative associative normed rings. -/
theorem thm_cm_countermodel_free_tn_and_on :
    (∀ (n : Nat) (v : Fin n → Tone), cmTnDual (cmTnDual v) = v) ∧
    (∀ n : Nat, n ≥ 1 →
      (∀ v : Fin n → Int, cmZnRefl0 n (cmZnRefl0 n v) = v) ∧
      (∀ (v : Fin n → Int) (i : Fin n), (cmZnRefl0 n v i) * (cmZnRefl0 n v i) = v i * v i) ∧
      (∃ v : Fin n → Int, cmZnRefl0 n v ≠ v)) ∧
    ((∀ v : Int × Int × Int,
        (cmRotZ3 v).1 * (cmRotZ3 v).1 + (cmRotZ3 v).2.1 * (cmRotZ3 v).2.1 + (cmRotZ3 v).2.2 * (cmRotZ3 v).2.2 =
          v.1 * v.1 + v.2.1 * v.2.1 + v.2.2 * v.2.2) ∧
     cmRotZ3 (0, 0, 1) = (0, 0, 1) ∧ cmRotZ3 (1, 0, 0) ≠ (1, 0, 0)) ∧
    ((∀ a b : Int, a * b = b * a) ∧
     (∀ a b c : GaussInt, cmGMul (cmGMul a b) c = cmGMul a (cmGMul b c)) ∧
     (∀ a b : GaussInt, cmGMul a b = cmGMul b a ∧ cmGNorm (cmGMul a b) = cmGNorm a * cmGNorm b) ∧
     (∀ a b c : Eis, Eis.mul (Eis.mul a b) c = Eis.mul a (Eis.mul b c)) ∧
     (∀ a b : Eis, Eis.mul a b = Eis.mul b a ∧ Eis.normSq (Eis.mul a b) = Eis.normSq a * Eis.normSq b)) := by
  refine ⟨fun _ v => funext fun i => cm_tone_dual_dual (v i), ?_, ?_, ?_⟩
  · intro n hn; refine ⟨?_, ?_, ?_⟩
    · intro v; funext i; unfold cmZnRefl0
      split <;> simp
    · intro v i; unfold cmZnRefl0
      split <;> ring
    · refine ⟨fun i => if i.val = 0 then 1 else 0, fun hEq => ?_⟩
      have h0 := congrFun hEq ⟨0, by omega⟩
      simp [cmZnRefl0] at h0
  · refine ⟨fun v => ?_, rfl, by decide⟩
    rcases v with ⟨x, y, z⟩; simp only [cmRotZ3]; ring
  · exact ⟨Int.mul_comm, cm_gauss_mul_assoc, fun a b => ⟨cm_gauss_mul_comm a b, cm_gauss_norm_mul a b⟩,
      fun a b c => mul_assoc a b c, fun a b => ⟨mul_comm a b, cm_eis_norm_mul a b⟩⟩

/-! ## Section 4: Exact Quaternions (`ℍ`) & Cayley-Dickson Fano Octonions (`𝕆`, CM-6) -/

structure QuatInt where
  a : Int
  b : Int
  c : Int
  d : Int
  deriving DecidableEq, Repr

def cmQI : QuatInt := ⟨0, 1, 0, 0⟩
def cmQJ : QuatInt := ⟨0, 0, 1, 0⟩
def cmQAdd (x y : QuatInt) : QuatInt := ⟨x.a + y.a, x.b + y.b, x.c + y.c, x.d + y.d⟩
def cmQSub (x y : QuatInt) : QuatInt := ⟨x.a - y.a, x.b - y.b, x.c - y.c, x.d - y.d⟩
def cmQNeg (x : QuatInt) : QuatInt := ⟨-x.a, -x.b, -x.c, -x.d⟩
def cmQConj (x : QuatInt) : QuatInt := ⟨x.a, -x.b, -x.c, -x.d⟩
def cmQDot (x y : QuatInt) : Int := x.a * y.a + x.b * y.b + x.c * y.c + x.d * y.d
def cmQNorm (x : QuatInt) : Int := cmQDot x x
def cmQMul (x y : QuatInt) : QuatInt :=
  ⟨ x.a * y.a - x.b * y.b - x.c * y.c - x.d * y.d, x.a * y.b + x.b * y.a + x.c * y.d - x.d * y.c,
    x.a * y.c - x.b * y.d + x.c * y.a + x.d * y.b, x.a * y.d + x.b * y.c - x.c * y.b + x.d * y.a ⟩

/-- Exact 8-component Fano-plane integer octonion (`p + q e_4`, Cayley-Dickson doubling of `QuatInt`). -/
structure OctInt where
  lo : QuatInt
  hi : QuatInt
  deriving DecidableEq, Repr

def octMul (x y : OctInt) : OctInt :=
  ⟨cmQSub (cmQMul x.lo y.lo) (cmQMul (cmQConj y.hi) x.hi),
   cmQAdd (cmQMul y.hi x.lo) (cmQMul x.hi (cmQConj y.lo))⟩
def octNeg (x : OctInt) : OctInt := ⟨cmQNeg x.lo, cmQNeg x.hi⟩
def octNorm (x : OctInt) : Int := cmQNorm x.lo + cmQNorm x.hi
def octBasis (k : Fin 8) : OctInt :=
  match k.val with
  | 0 => ⟨⟨1, 0, 0, 0⟩, ⟨0, 0, 0, 0⟩⟩ | 1 => ⟨⟨0, 1, 0, 0⟩, ⟨0, 0, 0, 0⟩⟩
  | 2 => ⟨⟨0, 0, 1, 0⟩, ⟨0, 0, 0, 0⟩⟩ | 3 => ⟨⟨0, 0, 0, 1⟩, ⟨0, 0, 0, 0⟩⟩
  | 4 => ⟨⟨0, 0, 0, 0⟩, ⟨1, 0, 0, 0⟩⟩ | 5 => ⟨⟨0, 0, 0, 0⟩, ⟨0, 1, 0, 0⟩⟩
  | 6 => ⟨⟨0, 0, 0, 0⟩, ⟨0, 0, 1, 0⟩⟩ | _ => ⟨⟨0, 0, 0, 0⟩, ⟨0, 0, 0, 1⟩⟩
def cmFanoTriples : List (Fin 8 × Fin 8 × Fin 8) :=
  [ (⟨1, by decide⟩, ⟨2, by decide⟩, ⟨3, by decide⟩), (⟨1, by decide⟩, ⟨4, by decide⟩, ⟨5, by decide⟩),
    (⟨1, by decide⟩, ⟨7, by decide⟩, ⟨6, by decide⟩), (⟨2, by decide⟩, ⟨4, by decide⟩, ⟨6, by decide⟩),
    (⟨2, by decide⟩, ⟨5, by decide⟩, ⟨7, by decide⟩), (⟨3, by decide⟩, ⟨4, by decide⟩, ⟨7, by decide⟩),
    (⟨3, by decide⟩, ⟨6, by decide⟩, ⟨5, by decide⟩) ]

private theorem cm_qNorm_conj (x : QuatInt) : cmQNorm (cmQConj x) = cmQNorm x := by
  cases x; simp only [cmQNorm, cmQDot, cmQConj]; ring
private theorem cm_qNorm_add (u v : QuatInt) : cmQNorm (cmQAdd u v) = cmQNorm u + cmQNorm v + 2 * cmQDot u v := by
  cases u; cases v; simp only [cmQNorm, cmQDot, cmQAdd]; ring
private theorem cm_qNorm_sub (u v : QuatInt) : cmQNorm (cmQSub u v) = cmQNorm u + cmQNorm v - 2 * cmQDot u v := by
  cases u; cases v; simp only [cmQNorm, cmQDot, cmQSub]; ring
private theorem cm_qDot_eq_real_conj (u v : QuatInt) : cmQDot u v = (cmQMul (cmQConj u) v).a := by
  cases u; cases v; simp only [cmQDot, cmQMul, cmQConj]; ring
private theorem cm_qReal_mul_comm (u v : QuatInt) : (cmQMul u v).a = (cmQMul v u).a := by
  cases u; cases v; simp only [cmQMul]; ring
private theorem cm_qMul_assoc (x y z : QuatInt) : cmQMul (cmQMul x y) z = cmQMul x (cmQMul y z) := by
  cases x; cases y; cases z; simp only [cmQMul, QuatInt.mk.injEq]; refine ⟨?_, ?_, ?_, ?_⟩ <;> ring
private theorem cm_qConj_mul (x y : QuatInt) : cmQConj (cmQMul x y) = cmQMul (cmQConj y) (cmQConj x) := by
  cases x; cases y; simp only [cmQConj, cmQMul, QuatInt.mk.injEq]; refine ⟨?_, ?_, ?_, ?_⟩ <;> ring
private theorem cm_qNorm_mul (x y : QuatInt) : cmQNorm (cmQMul x y) = cmQNorm x * cmQNorm y := by
  cases x; cases y; simp only [cmQNorm, cmQDot, cmQMul]; ring
private theorem cm_oct_cross_eq (p q r s : QuatInt) :
    cmQDot (cmQMul p r) (cmQMul (cmQConj s) q) = cmQDot (cmQMul s p) (cmQMul q (cmQConj r)) := by
  rw [cm_qDot_eq_real_conj, cm_qDot_eq_real_conj, cm_qConj_mul, cm_qConj_mul,
      cm_qMul_assoc (cmQConj r) (cmQConj p) (cmQMul (cmQConj s) q), ← cm_qMul_assoc (cmQConj p) (cmQConj s) q,
      cm_qReal_mul_comm (cmQConj r) (cmQMul (cmQMul (cmQConj p) (cmQConj s)) q),
      cm_qMul_assoc (cmQMul (cmQConj p) (cmQConj s)) q (cmQConj r)]
private theorem cm_octNorm_mul (x y : OctInt) : octNorm (octMul x y) = octNorm x * octNorm y := by
  cases x with | mk p q => cases y with | mk r s =>
  unfold octNorm octMul
  dsimp only
  rw [cm_qNorm_sub, cm_qNorm_add, cm_oct_cross_eq p q r s,
      cm_qNorm_mul p r, cm_qNorm_mul (cmQConj s) q, cm_qNorm_mul s p, cm_qNorm_mul q (cmQConj r),
      cm_qNorm_conj s, cm_qNorm_conj r]
  ring

/-- CM-6 (Fano Octonions `OctInt`): full symbolic 8-square Degen identity (`∀ x y`), exact 7 Fano
    triples, strict non-associativity `(e_1 * e_2) * e_4 ≠ e_1 * (e_2 * e_4)`, vs associative `QuatInt`. -/
theorem thm_cm_countermodel_octonion_nonassociative :
    (∀ x y : OctInt, octNorm (octMul x y) = octNorm x * octNorm y) ∧
    (cmFanoTriples.all (fun t =>
      (octMul (octBasis t.1) (octBasis t.2.1) == octBasis t.2.2) &&
      (octMul (octBasis t.2.1) (octBasis t.1) == octNeg (octBasis t.2.2)) &&
      (octMul (octBasis t.1) (octBasis t.1) == octNeg (octBasis ⟨0, by decide⟩)) &&
      (octMul (octBasis t.2.1) (octBasis t.2.1) == octNeg (octBasis ⟨0, by decide⟩)) &&
      (octMul (octBasis t.2.2) (octBasis t.2.2) == octNeg (octBasis ⟨0, by decide⟩))) = true) ∧
    (∃ a b c : OctInt, octMul (octMul a b) c ≠ octMul a (octMul b c)) ∧
    ((∀ a b c : QuatInt, cmQMul (cmQMul a b) c = cmQMul a (cmQMul b c)) ∧
     (∀ a b : QuatInt, cmQNorm (cmQMul a b) = cmQNorm a * cmQNorm b) ∧ cmQMul cmQI cmQJ ≠ cmQMul cmQJ cmQI) := by
  refine ⟨cm_octNorm_mul, by decide,
    ⟨octBasis ⟨1, by decide⟩, octBasis ⟨2, by decide⟩, octBasis ⟨4, by decide⟩, by decide⟩,
    cm_qMul_assoc, cm_qNorm_mul, by decide⟩

/-! ## Section 5: `A_4`, `B_4`, Euclidean `{3,4,3,3}`, Static/Achiral & Five Competing Universes -/

abbrev CmVec5 := Int × Int × Int × Int × Int
def cmSum5 (v : CmVec5) : Int := v.1 + v.2.1 + v.2.2.1 + v.2.2.2.1 + v.2.2.2.2
def cmDot5 (u v : CmVec5) : Int :=
  u.1 * v.1 + u.2.1 * v.2.1 + u.2.2.1 * v.2.2.1 + u.2.2.2.1 * v.2.2.2.1 + u.2.2.2.2 * v.2.2.2.2
def cmRefl5 (a b : CmVec5) : CmVec5 :=
  let k := cmDot5 a b
  (b.1 - k * a.1, b.2.1 - k * a.2.1, b.2.2.1 - k * a.2.2.1, b.2.2.2.1 - k * a.2.2.2.1, b.2.2.2.2 - k * a.2.2.2.2)
def cmRefl4 (a b : Vec4) : Vec4 :=
  let k := (2 * dot4 a b) / dot4 a a
  (b.1 - k * a.1, b.2.1 - k * a.2.1, b.2.2.1 - k * a.2.2.1, b.2.2.2 - k * a.2.2.2)

/-- Explicit 20 roots `{e_i - e_j : i ≠ j}` of `A_4` in `{x ∈ ℤ^5 : ∑ x_i = 0}`. -/
def a4Roots : List CmVec5 :=
  [ ( 1, -1,  0,  0,  0), (-1,  1,  0,  0,  0), ( 1,  0, -1,  0,  0), (-1,  0,  1,  0,  0),
    ( 1,  0,  0, -1,  0), (-1,  0,  0,  1,  0), ( 1,  0,  0,  0, -1), (-1,  0,  0,  0,  1),
    ( 0,  1, -1,  0,  0), ( 0, -1,  1,  0,  0), ( 0,  1,  0, -1,  0), ( 0, -1,  0,  1,  0),
    ( 0,  1,  0,  0, -1), ( 0, -1,  0,  0,  1), ( 0,  0,  1, -1,  0), ( 0,  0, -1,  1,  0),
    ( 0,  0,  1,  0, -1), ( 0,  0, -1,  0,  1), ( 0,  0,  0,  1, -1), ( 0,  0,  0, -1,  1) ]

/-- Explicit 32 two-length roots `±e_i` (norm² 1) and `±e_i ± e_j` (norm² 2) of `B_4`. -/
def b4Roots : List Vec4 := d4Roots ++ z4Roots

/-- CM-7 (`A_4`, 20 roots in `∑ x_i = 0`) & CM-8 (`B_4`, 32 two-length roots) vs simply-laced `D_4` (24). -/
theorem thm_cm_countermodel_a4_and_b4_roots :
    (a4Roots.length = 20 ∧ a4Roots.length ≠ d4Roots.length ∧ a4Roots.Nodup ∧
     a4Roots.all (fun r => cmSum5 r == 0 && cmDot5 r r == 2) = true ∧
     a4Roots.all (fun a => a4Roots.all (fun b => a4Roots.contains (cmRefl5 a b))) = true) ∧
    (b4Roots.length = 32 ∧ b4Roots.length ≠ d4Roots.length ∧ b4Roots.Nodup ∧
     (b4Roots.filter (fun r => dot4 r r == 1)).length = 8 ∧
     (b4Roots.filter (fun r => dot4 r r == 2)).length = 24 ∧
     (∃ u ∈ b4Roots, ∃ v ∈ b4Roots, dot4 u u ≠ dot4 v v) ∧
     b4Roots.all (fun a => b4Roots.all (fun b =>
       ((2 * dot4 a b) / dot4 a a) * dot4 a a == 2 * dot4 a b && b4Roots.contains (cmRefl4 a b))) = true) ∧
    (d4Roots.length = 24 ∧ d4Roots.Nodup ∧ d4Roots.all (fun r => dot4 r r == 2) = true) := by
  refine ⟨⟨by decide, by decide, cm_nodup_of_nodupBool a4Roots (by decide), by decide, by decide⟩,
          ⟨by decide, by decide, cm_nodup_of_nodupBool b4Roots (by decide), by decide, by decide, ?_, by decide⟩,
          thm_d4_root_system⟩
  have hu : ((1, 0, 0, 0) : Vec4) ∈ b4Roots := by
    rcases List.any_eq_true.mp (by decide : b4Roots.any (fun r => decide (r = (1, 0, 0, 0))) = true) with ⟨r, hr, heq⟩
    rwa [of_decide_eq_true heq] at hr
  have hv : ((1, 1, 0, 0) : Vec4) ∈ b4Roots := by
    rcases List.any_eq_true.mp (by decide : b4Roots.any (fun r => decide (r = (1, 1, 0, 0))) = true) with ⟨r, hr, heq⟩
    rwa [of_decide_eq_true heq] at hr
  exact ⟨(1, 0, 0, 0), hu, (1, 1, 0, 0), hv, by decide⟩

def cmHoneycomb3433 : Schlafli4D := ⟨3, 4, 3, 3⟩
def cmNegOnePow : Nat → Int
  | 0 => 1
  | p + 1 => -(cmNegOnePow p)

private theorem cm_negOnePow_spec (p : Nat) : cmNegOnePow p = if p % 2 = 0 then 1 else -1 := by
  induction p with
  | zero => decide
  | succ p ih =>
    simp only [cmNegOnePow]; rw [ih]
    split <;> (split <;> omega)

/-- CM-9 / Universe C (Euclidean `{3,4,3,3}`): `det G = 0` fails odd ridge parity `(-1)^3 = -1 ≠ 1`
    and hyperbolic cusp criteria; unfrustrated parity across Euclidean/finite-covolume `{3,4,3,p}` forces `p = 4`. -/
theorem thm_cm_countermodel_euclidean_3433 :
    (hasSelfDualFiniteCell cmHoneycomb3433 = true ∧ isEuclidean4D cmHoneycomb3433 = true ∧
     schlafliMinor5 3 4 3 3 = ⟨0, 0⟩ ∧ (-1 : Int) ^ 3 = -1 ∧ cmNegOnePow 3 ≠ 1 ∧
     isFiniteCovolumeHyp4D cmHoneycomb3433 = false ∧ hasFlat3DEuclideanCusp cmHoneycomb3433 = false) ∧
    (hasSelfDualFiniteCell honeycomb3434 = true ∧ isFiniteCovolumeHyp4D honeycomb3434 = true ∧
     hasFlat3DEuclideanCusp honeycomb3434 = true ∧ schlafliMinor5 3 4 3 4 = ⟨-32, 0⟩ ∧
     (-1 : Int) ^ 4 = 1 ∧ cmNegOnePow 4 = 1) ∧
    (∀ p : Nat, cmNegOnePow p = 1 ↔ p % 2 = 0) ∧
    (∀ p : Nat, ((isEuclidean4D ⟨3, 4, 3, p⟩ = true ∨ isFiniteCovolumeHyp4D ⟨3, 4, 3, p⟩ = true) ∧
      cmNegOnePow p = 1) ↔ p = 4) := by
  refine ⟨by decide, by decide, ?_, ?_⟩
  · intro p; rw [cm_negOnePow_spec p]
    split <;> constructor <;> intro h <;> omega
  · intro p; constructor
    · intro ⟨hGeom, hPar⟩
      cases hGeom with
      | inl hEuc =>
        have hMem := (thm_coxeter_classify_euclidean_4d ⟨3, 4, 3, p⟩).mp hEuc
        have hAll : euclidean4DList.all (fun h => !(h.p == 3 && h.q == 4 && h.r == 3) || h.s == 3) = true := by decide
        have hRow := List.all_eq_true.mp hAll ⟨3, 4, 3, p⟩ hMem
        have hp3 : p = 3 := by simpa using hRow
        rw [hp3] at hPar; exact absurd hPar (by decide)
      | inr hHyp =>
        have hMem := (thm_coxeter_complete_finite_covolume_4d ⟨3, 4, 3, p⟩).mp hHyp
        have hAll : allFiniteCovolumeHyp4DList.all (fun h => !(h.p == 3 && h.q == 4 && h.r == 3) || h.s == 4) = true := by decide
        have hRow := List.all_eq_true.mp hAll ⟨3, 4, 3, p⟩ hMem
        simpa using hRow
    · intro hp4; rw [hp4]; exact ⟨Or.inr (by decide), by decide⟩

private theorem cm_conjDock_eq_self (d : DockState) (h : conjDock d = d) : d = v1Dock := by
  funext i; have hi : (d i).dual = d i := congrFun h i
  cases hd : d i with
  | neg => rw [hd] at hi; exact absurd hi (by decide)
  | zero => rfl
  | pos => rw [hd] at hi; exact absurd hi (by decide)

/-- CM-10 (Static `id`), CM-11 (Calm Vacuum `v1Dock`), CM-12 (`k ≤ 3` Achiral): static `id` satisfies
    conservation with zero change, any `C`-equivariant dock map locks `v1Dock` eternally, and every
    `k ≤ 3` dock is `W(F_4)`-achiral with zero pseudoscalar (`Vibe.Chirality`). -/
theorem thm_cm_countermodel_static_vacuum_achiral :
    (∀ (t : Nat) (d : DockState),
      iter id t d = d ∧ dockCharge (id d) = dockCharge d ∧ id (conjDock d) = conjDock (id d)) ∧
    (∀ (B : DockState → DockState), (∀ d : DockState, B (conjDock d) = conjDock (B d)) →
      ∀ t : Nat, iter B t v1Dock = v1Dock ∧ dockCharge (iter B t v1Dock) = 0) ∧
    (∀ (a b c : Fin 24) (d : DockState), (∀ i : Fin 24, i ≠ a → i ≠ b → i ≠ c → d i = .zero) →
      ¬ isChiralUnderG d ∧ ∀ F : DockState → Int, isWF4Pseudoscalar F → F d = 0) := by
  refine ⟨?_, ?_, fun a b c d hs => ⟨(thm_achiral_k3 a b c d hs).2.1, (thm_achiral_k3 a b c d hs).2.2⟩⟩
  · intro t d
    have hId : iter id t d = d := by
      induction t with
      | zero => rfl
      | succ _ ih => exact ih
    exact ⟨hId, rfl, rfl⟩
  · intro B hComm t
    have hStab := thm_cm_general_stabilizer_preservation
      (fun (_ : Unit) d => conjDock d) B (fun _ d => hComm d) v1Dock
    have hEq : iter B t v1Dock = v1Dock := cm_conjDock_eq_self _ (hStab.2.1 () conjDock_fixes_v1 t)
    exact ⟨hEq, by rw [hEq]; exact dockCharge_v1⟩

inductive CompetingUniverse where
  | univA_singular
  | univB_1dC2
  | univC_euclidean3433
  | univD_higherDOct
  | univE_vibe3434
  deriving DecidableEq, Repr

/-- Uniform `Prop`-level specification of a candidate universe model (`01d` §21), carrying its
    state carrier, orientation algebra `(Alg, algMul)`, discrete root list + norm², and optional
    regular 4D Schläfli honeycomb symbol (zero hardcoded booleans). -/
structure UniverseCandidate where
  State      : Type
  Alg        : Type
  algMul     : Alg → Alg → Alg
  Root       : Type
  roots      : List Root
  rootNormSq : Root → Int
  schlafli   : Option Schlafli4D

/-- Criterion 1 (Intrinsic Differentiation): state space has at least two distinct states. -/
def cmHasDistinction (U : UniverseCandidate) : Prop :=
  ∃ x y : U.State, x ≠ y

/-- Criterion 2 (Noncommutative Associative Orientation Algebra): `algMul` is BOTH noncommutative
    AND associative (ruling out commutative `1D/2D` and non-associative `8D` octonions). -/
def cmNoncommAssoc (U : UniverseCandidate) : Prop :=
  (∃ a b : U.Alg, U.algMul a b ≠ U.algMul b a) ∧
  (∀ a b c : U.Alg, U.algMul (U.algMul a b) c = U.algMul a (U.algMul b c))

/-- Criterion 3 (Simply-Laced 24-Root `D_4` Self-Dual Cell): 24 equal-length (`norm² = 2`) roots
    and a finite regular self-dual 4-polytope cell (`{3,4,3}`). -/
def cmD4SelfDualCell (U : UniverseCandidate) : Prop :=
  U.roots.length = 24 ∧ (∀ r ∈ U.roots, U.rootNormSq r = 2) ∧
  ∃ h : Schlafli4D, U.schlafli = some h ∧ hasSelfDualFiniteCell h = true

/-- Criterion 4 (Unfrustrated Cell-Boundary Parity): alternating Coxeter parity `(-1)^s = +1`. -/
def cmUnfrustratedParity (U : UniverseCandidate) : Prop :=
  ∃ h : Schlafli4D, U.schlafli = some h ∧ cmNegOnePow h.s = 1

/-- Criterion 5 (Finite-Covolume Hyperbolic `ℍ^4` Honeycomb with Flat 3D `{4,3,4}` Cusp). -/
def cmFiniteCovolumeFlatCusp (U : UniverseCandidate) : Prop :=
  ∃ h : Schlafli4D, U.schlafli = some h ∧
    isFiniteCovolumeHyp4D h = true ∧ hasFlat3DEuclideanCusp h = true

/-- Conjunction of all five uniform structural selection invariants. -/
def cmPassesAllFive (U : UniverseCandidate) : Prop :=
  cmHasDistinction U ∧ cmNoncommAssoc U ∧ cmD4SelfDualCell U ∧
    cmUnfrustratedParity U ∧ cmFiniteCovolumeFlatCusp U

/-- Concrete instantiations of Competing Universes A–E:
    - A: Singular `{e_0}` (`Unit`),
    - B: 1D Ternary `C_2` (`Tone`, `cmToneMul`),
    - C: Euclidean 24-cell honeycomb (`QuatInt`, `d4Roots`, `{3,4,3,3}`),
    - D: Higher-D / non-associative / hyperideal family witness (`OctInt`, `a4Roots`, `{3,4,3,5}`),
    - E: Vibe hyperbolic 24-cell honeycomb (`QuatInt`, `d4Roots`, `{3,4,3,4}`). -/
abbrev cmUniverseModel : CompetingUniverse → UniverseCandidate
  | .univA_singular =>
    { State := Unit, Alg := Unit, algMul := fun _ _ => (),
      Root := Unit, roots := [], rootNormSq := fun _ => 0, schlafli := none }
  | .univB_1dC2 =>
    { State := Tone, Alg := Tone, algMul := cmToneMul,
      Root := Tone, roots := [.neg, .pos], rootNormSq := fun t => t.value * t.value,
      schlafli := none }
  | .univC_euclidean3433 =>
    { State := Vec4, Alg := QuatInt, algMul := cmQMul,
      Root := Vec4, roots := d4Roots, rootNormSq := fun r => dot4 r r,
      schlafli := some cmHoneycomb3433 }
  | .univD_higherDOct =>
    { State := CmVec5, Alg := OctInt, algMul := octMul,
      Root := CmVec5, roots := a4Roots, rootNormSq := fun r => cmDot5 r r,
      schlafli := some ⟨3, 4, 3, 5⟩ }
  | .univE_vibe3434 =>
    { State := Vec4, Alg := QuatInt, algMul := cmQMul,
      Root := Vec4, roots := d4Roots, rootNormSq := fun r => dot4 r r,
      schlafli := some honeycomb3434 }

/-- Five Competing Universes A–E Separation Theorem (`01d` §21, uniform `Prop` invariants, zero
    hardcoded booleans): evaluated uniformly via `UniverseCandidate`, ONLY Universe E (`{3,4,3,4}`)
    satisfies all five invariants simultaneously (`cmPassesAllFive (cmUniverseModel u) ↔ u = .univE_vibe3434`),
    with explicit failure proofs directly from Theorems 7–12 for Universes A, B, C, and D. -/
theorem thm_cm_five_competing_universes_separation :
    (∀ u : CompetingUniverse, cmPassesAllFive (cmUniverseModel u) ↔ u = .univE_vibe3434) ∧
    (¬ cmHasDistinction (cmUniverseModel .univA_singular)) ∧
    (cmHasDistinction (cmUniverseModel .univB_1dC2) ∧
     ¬ cmNoncommAssoc (cmUniverseModel .univB_1dC2)) ∧
    (cmHasDistinction (cmUniverseModel .univC_euclidean3433) ∧
     cmNoncommAssoc (cmUniverseModel .univC_euclidean3433) ∧
     cmD4SelfDualCell (cmUniverseModel .univC_euclidean3433) ∧
     ¬ cmUnfrustratedParity (cmUniverseModel .univC_euclidean3433) ∧
     ¬ cmFiniteCovolumeFlatCusp (cmUniverseModel .univC_euclidean3433)) ∧
    (cmHasDistinction (cmUniverseModel .univD_higherDOct) ∧
     (∃ a b : (cmUniverseModel .univD_higherDOct).Alg,
        (cmUniverseModel .univD_higherDOct).algMul a b ≠
          (cmUniverseModel .univD_higherDOct).algMul b a) ∧
     ¬ cmNoncommAssoc (cmUniverseModel .univD_higherDOct) ∧
     ¬ cmD4SelfDualCell (cmUniverseModel .univD_higherDOct) ∧
     ¬ cmUnfrustratedParity (cmUniverseModel .univD_higherDOct) ∧
     ¬ cmFiniteCovolumeFlatCusp (cmUniverseModel .univD_higherDOct)) ∧
    cmPassesAllFive (cmUniverseModel .univE_vibe3434) := by
  have hD4Norm : ∀ r ∈ d4Roots, dot4 r r = 2 := fun r hr =>
    beq_iff_eq.mp (List.all_eq_true.mp thm_d4_root_system.2.2 r hr)
  have hAFail : ¬ cmHasDistinction (cmUniverseModel .univA_singular) :=
    thm_cm_countermodel_singleton.2.2.2.2
  have hBDist : cmHasDistinction (cmUniverseModel .univB_1dC2) :=
    thm_cm_countermodel_1d_c2.1
  have hBNoNC : ¬ cmNoncommAssoc (cmUniverseModel .univB_1dC2) := fun ⟨⟨a, b, hne⟩, _⟩ =>
    hne (thm_cm_countermodel_1d_c2.2.2.2.2.2.1 a b)
  have hCDist : cmHasDistinction (cmUniverseModel .univC_euclidean3433) :=
    ⟨(1, 0, 0, 0), (0, 0, 0, 0), show ((1, 0, 0, 0) : Vec4) ≠ (0, 0, 0, 0) by decide⟩
  have hCNC : cmNoncommAssoc (cmUniverseModel .univC_euclidean3433) :=
    ⟨⟨cmQI, cmQJ, show cmQMul cmQI cmQJ ≠ cmQMul cmQJ cmQI by decide⟩, cm_qMul_assoc⟩
  have hCCell : cmD4SelfDualCell (cmUniverseModel .univC_euclidean3433) :=
    ⟨thm_d4_root_system.1, hD4Norm, cmHoneycomb3433, rfl, by decide⟩
  have hCNoPar : ¬ cmUnfrustratedParity (cmUniverseModel .univC_euclidean3433) := by
    intro ⟨_, hh, hPar⟩; cases hh; exact absurd hPar (by decide)
  have hCNoCusp : ¬ cmFiniteCovolumeFlatCusp (cmUniverseModel .univC_euclidean3433) := by
    intro ⟨_, hh, hFin, _⟩; cases hh; exact absurd hFin (by decide)
  have hDDist : cmHasDistinction (cmUniverseModel .univD_higherDOct) :=
    ⟨(1, -1, 0, 0, 0), (-1, 1, 0, 0, 0),
     show ((1, -1, 0, 0, 0) : CmVec5) ≠ (-1, 1, 0, 0, 0) by decide⟩
  have hDOctNC : ∃ a b : (cmUniverseModel .univD_higherDOct).Alg,
      (cmUniverseModel .univD_higherDOct).algMul a b ≠
        (cmUniverseModel .univD_higherDOct).algMul b a :=
    ⟨octBasis ⟨1, by decide⟩, octBasis ⟨2, by decide⟩,
     show octMul (octBasis ⟨1, by decide⟩) (octBasis ⟨2, by decide⟩) ≠
       octMul (octBasis ⟨2, by decide⟩) (octBasis ⟨1, by decide⟩) by decide⟩
  have hDNoNC : ¬ cmNoncommAssoc (cmUniverseModel .univD_higherDOct) := by
    intro ⟨_, hAssoc⟩
    obtain ⟨a, b, c, hne⟩ := thm_cm_countermodel_octonion_nonassociative.2.2.1
    exact hne (hAssoc a b c)
  have hDNoCell : ¬ cmD4SelfDualCell (cmUniverseModel .univD_higherDOct) := fun ⟨hLen, _, _⟩ =>
    absurd hLen (by decide)
  have hDNoPar : ¬ cmUnfrustratedParity (cmUniverseModel .univD_higherDOct) := by
    intro ⟨_, hh, hPar⟩; cases hh; exact absurd hPar (by decide)
  have hDNoCusp : ¬ cmFiniteCovolumeFlatCusp (cmUniverseModel .univD_higherDOct) := by
    intro ⟨_, hh, hFin, _⟩; cases hh; exact absurd hFin (by decide)
  have hEPass : cmPassesAllFive (cmUniverseModel .univE_vibe3434) :=
    ⟨⟨(1, 0, 0, 0), (0, 0, 0, 0), show ((1, 0, 0, 0) : Vec4) ≠ (0, 0, 0, 0) by decide⟩,
     ⟨⟨cmQI, cmQJ, show cmQMul cmQI cmQJ ≠ cmQMul cmQJ cmQI by decide⟩, cm_qMul_assoc⟩,
     ⟨thm_d4_root_system.1, hD4Norm, honeycomb3434, rfl, by decide⟩,
     ⟨honeycomb3434, rfl, by decide⟩,
     ⟨honeycomb3434, rfl, by decide, by decide⟩⟩
  have hEquiv : ∀ u : CompetingUniverse, cmPassesAllFive (cmUniverseModel u) ↔ u = .univE_vibe3434 := by
    intro u
    cases u with
    | univA_singular => exact ⟨fun h => absurd h.1 hAFail, fun h => absurd h (by decide)⟩
    | univB_1dC2 => exact ⟨fun h => absurd h.2.1 hBNoNC, fun h => absurd h (by decide)⟩
    | univC_euclidean3433 => exact ⟨fun h => absurd h.2.2.2.1 hCNoPar, fun h => absurd h (by decide)⟩
    | univD_higherDOct => exact ⟨fun h => absurd h.2.1 hDNoNC, fun h => absurd h (by decide)⟩
    | univE_vibe3434 => exact ⟨fun _ => rfl, fun _ => hEPass⟩
  exact ⟨hEquiv, hAFail, ⟨hBDist, hBNoNC⟩,
    ⟨hCDist, hCNC, hCCell, hCNoPar, hCNoCusp⟩,
    ⟨hDDist, hDOctNC, hDNoNC, hDNoCell, hDNoPar, hDNoCusp⟩,
    hEPass⟩

end Vibe

end
