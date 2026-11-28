import Vibe.QuantumGates
import Vibe.HolographicCode

/-!
# Vibe Theory: Code Spaces the Bare Beat `U` Leaves Invariant (Q4)

Item `vibe-computation-models-0034` (decision 004 of `vibe/computation/models`). The experiment
(`computation/bare-u-memory`) finds two layer-by-code invariances under the bare beat; both are stated here, with the
one layer that breaks the second.

- `thm_q_code_space_invariant`:
  1. **`[[24, 1, 8]]_3` and `M_pair`.** The pair-line mixer acts only on a dock holding exactly two equal tones on one
     antipodal line. Read as a qutrit string on the dock's 24 slots (tone `+1 ↦ 1`, `-1 ↦ 2`), every such configuration
     has syndrome `2t ≢ 0 (mod 3)` under the code's check `Z^{⊗24}` (`hcAllZ`, the charge mod 3), so no codeword has
     weight there and `M_pair` is the identity on the code space.
  2. **The role-spin DFS and `M_meet`.** The role meeting `M = (ζ_6 / 2) I + ((ω - 1) / 2) SWAP` on two like-sign
     excitations commutes with the collective raising, lowering and `S_z` operators of the two roles, so it leaves every
     total role spin sector invariant. (The layers `Φ_odd`, `D`, `K` and `S` read slots and tones only and never a role,
     so they act as the identity on roles; nothing to state.)
- `thm_q_pair_mixer_breaks_dfs`: the pair-line mixer acts only when the pair's two roles are EQUAL; that projector
  `diag(1, 0, 0, 1)` does not commute with the collective raising operator (`|01⟩ ↦ |11⟩`), so `M_pair` is the layer
  that can move weight between total role spin sectors (the experiment sees it first at beat 3).

Every equality is decided on exact representatives (`NinthRaw6` or `Nat`) by `decide`; no `sorry`, no axiom, no
`native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace QuantumMemory

open QuantumGates

/-! ## 1. `[[24, 1, 8]]_3`: the pair-line mixer never touches the code -/

/-- Tone value `t` on both slots of antipodal line `l` of a dock, nothing elsewhere (`t = 1` for `+1`, `2` for `-1`). -/
def pairConfig (l : Fin 12) (t : Nat) : Fin 24 → Nat :=
  fun r => if r = hcLineRep l ∨ r = hcOppRep l then t else 0

/-- The syndrome of a configuration under the code's `Z^{⊗24}` check `hcAllZ` (its `Z` part). -/
def chargeSyndrome (x : Fin 24 → Nat) : Nat :=
  hcSumFin (fun r : Fin 24 => hcAllZ ⟨1, by decide⟩ r * x r) % 3

private theorem pair_syndrome :
    ∀ l : Fin 12, chargeSyndrome (pairConfig l 1) = 2 ∧ chargeSyndrome (pairConfig l 2) = 1 := by decide

private theorem pair_two_slots : ∀ l : Fin 12, hcLineRep l ≠ hcOppRep l ∧ hcLineOf (hcLineRep l) = l ∧
    hcLineOf (hcOppRep l) = l := by decide

/-! ## 2. The role meeting commutes with the collective role spin -/

/-- The collective raising operator `σ⁺ ⊗ 1 + 1 ⊗ σ⁺` on two roles (index `2 r₁ + r₂`, role `1` raised). -/
def raiseRaw (i j : Nat) : NinthRaw6 :=
  if j < 2 ∧ i = j + 2 then rawOne
  else if j % 2 = 0 ∧ i = j + 1 then rawOne
  else rawZero

/-- The collective lowering operator, the transpose of `raiseRaw`. -/
def lowerRaw (i j : Nat) : NinthRaw6 := raiseRaw j i

/-- Twice the collective `S_z`, shifted to be nonnegative: the number of role-`1` excitations, on the diagonal. -/
def countRaw (i j : Nat) : NinthRaw6 :=
  if i = j then ⟨Ninth.ofInt (Int.ofNat (i / 2 + i % 2)), 0⟩ else rawZero

/-- `(A B)_{ij}` on two roles. -/
def prodRaw (a b : Nat → Nat → NinthRaw6) (i j : Nat) : NinthRaw6 :=
  rawSum ((List.range 4).map (fun k => NinthLoc6.rawMul (a i k) (b k j)))

private theorem meet_raise : ∀ i j : Fin 4,
    NinthRaw6.equiv (prodRaw (meetRaw 2) raiseRaw i j) (prodRaw raiseRaw (meetRaw 2) i j) := by decide +kernel
private theorem meet_lower : ∀ i j : Fin 4,
    NinthRaw6.equiv (prodRaw (meetRaw 2) lowerRaw i j) (prodRaw lowerRaw (meetRaw 2) i j) := by decide +kernel
private theorem meet_count : ∀ i j : Fin 4,
    NinthRaw6.equiv (prodRaw (meetRaw 2) countRaw i j) (prodRaw countRaw (meetRaw 2) i j) := by decide +kernel

/-- The products in `NinthLoc6 = ℤ[ζ_9][1/6]`. -/
def prodLoc (a b : Nat → Nat → NinthRaw6) (i j : Nat) : NinthLoc6 := Quot.mk NinthRaw6.equiv (prodRaw a b i j)

/-- Headline Theorem (Q4, the code spaces `U` leaves invariant, layer by layer):
    (1) every configuration the pair-line mixer `M_pair` acts on (two equal tones on one antipodal line of a dock, the
    two slots distinct and on that line) has nonzero syndrome under the `[[24, 1, 8]]_3` check `Z^{⊗24}`, so no
    codeword has weight on it and `M_pair` is the identity on the code space;
    (2) the role meeting `M_meet` commutes exactly with the collective raising, lowering and role-count operators of the
    two roles it meets, so it leaves every total role spin sector, the decoherence-free code space, invariant. -/
theorem thm_q_code_space_invariant :
    (∀ l : Fin 12, chargeSyndrome (pairConfig l 1) ≠ 0 ∧ chargeSyndrome (pairConfig l 2) ≠ 0) ∧
    (∀ l : Fin 12, hcLineRep l ≠ hcOppRep l ∧ hcLineOf (hcLineRep l) = l ∧ hcLineOf (hcOppRep l) = l) ∧
    (∀ i j : Fin 4, prodLoc (meetRaw 2) raiseRaw i j = prodLoc raiseRaw (meetRaw 2) i j) ∧
    (∀ i j : Fin 4, prodLoc (meetRaw 2) lowerRaw i j = prodLoc lowerRaw (meetRaw 2) i j) ∧
    (∀ i j : Fin 4, prodLoc (meetRaw 2) countRaw i j = prodLoc countRaw (meetRaw 2) i j) := by
  refine ⟨fun l => ?_, pair_two_slots, fun i j => Quot.sound (meet_raise i j), fun i j => Quot.sound (meet_lower i j),
    fun i j => Quot.sound (meet_count i j)⟩
  obtain ⟨h1, h2⟩ := pair_syndrome l
  exact ⟨by rw [h1]; decide, by rw [h2]; decide⟩

/-! ## 3. The pair-line mixer breaks the role spin -/

/-- The projector on equal roles `|00⟩, |11⟩` of a pair: where `M_pair` acts. -/
def equalRoleNat (i j : Nat) : Nat := if i = j ∧ (i = 0 ∨ i = 3) then 1 else 0

/-- The collective raising operator with natural-number entries. -/
def raiseNat (i j : Nat) : Nat := if (j < 2 ∧ i = j + 2) ∨ (j % 2 = 0 ∧ i = j + 1) then 1 else 0

def prodNat (a b : Nat → Nat → Nat) (i j : Nat) : Nat := ((List.range 4).map (fun k => a i k * b k j)).foldr (· + ·) 0

/-- Headline Theorem (Q4, the layer that breaks the decoherence-free subspace): the equal-role projector on which
    `M_pair` acts does not commute with the collective raising operator: on `|01⟩` (index 1) raising then projecting
    gives `|11⟩` (index 3), projecting then raising gives `0`. -/
theorem thm_q_pair_mixer_breaks_dfs :
    prodNat equalRoleNat raiseNat 3 1 = 1 ∧ prodNat raiseNat equalRoleNat 3 1 = 0 ∧
    ¬ (∀ i j : Fin 4, prodNat equalRoleNat raiseNat i j = prodNat raiseNat equalRoleNat i j) := by
  decide

end QuantumMemory

end Vibe
