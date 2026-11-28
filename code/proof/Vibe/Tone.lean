module

public import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Algebra.Order.BigOperators.Group.Finset

/-!
# Vibe Theory: Signed Ternary State & 24-Slot Dock Algebra

Minimal signed ternary alphabet `{-1, 0, +1}`, 24-slot `DockState`, calm vacuum `v1Dock`,
exact charge conjugation `conjDock`, and total dock charge `dockCharge`.
Imported and used directly by `Vibe.Rule` for concrete `V1` stationarity and light-cone proofs.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-- Signed ternary state `{-1, 0, +1}` carried by each slot of a 24-slot dock. -/
inductive Tone where
  | neg
  | zero
  | pos
  deriving DecidableEq, Repr

/-- Integer charge value in `{-1, 0, +1}`. -/
def Tone.value : Tone → Int
  | .neg  => -1
  | .zero => 0
  | .pos  => 1

/-- Charge-conjugation involution swapping `-1 ↔ +1` and fixing `0`. -/
def Tone.dual : Tone → Tone
  | .neg  => .pos
  | .zero => .zero
  | .pos  => .neg

private theorem tone_dual_dual (t : Tone) : t.dual.dual = t := by
  cases t <;> rfl

private theorem tone_dual_value (t : Tone) : t.dual.value = -t.value := by
  cases t <;> decide

private theorem tone_value_bounds (t : Tone) : -1 ≤ t.value ∧ t.value ≤ 1 := by
  cases t <;> decide

/-- Full 24-slot ternary state of a single 24-cell dock. -/
abbrev DockState := Fin 24 → Tone

/-- Calm vacuum dock state `V1`: all 24 slots equal to `.zero`. -/
def v1Dock : DockState := fun _ => .zero

/-- Exact slotwise charge conjugation `C` on a 24-slot dock. -/
def conjDock (d : DockState) : DockState := fun i => (d i).dual

/-- Exact total integer charge `∑_{i=0}^{23} value(d_i)` over all 24 slots of a dock. -/
def dockCharge (d : DockState) : Int :=
  (List.finRange 24).foldl (fun acc i => acc + (d i).value) 0

private theorem dockCharge_eq_sum (d : DockState) :
    dockCharge d = ∑ i : Fin 24, (d i).value := by
  rw [Fin.sum_univ_def, List.sum_eq_foldl, List.foldl_map]
  rfl

/-- Charge conjugation on 24-slot docks is an exact involution (`C^2 = I`). -/
theorem conjDock_involutive (d : DockState) : conjDock (conjDock d) = d :=
  funext fun i => tone_dual_dual (d i)

/-- Charge conjugation fixes the calm vacuum dock `V1` identically. -/
theorem conjDock_fixes_v1 : conjDock v1Dock = v1Dock := rfl

/-- The calm vacuum dock `V1` carries exact zero total charge. -/
theorem dockCharge_v1 : dockCharge v1Dock = 0 := by decide

/-- Charge conjugation strictly negates total dock charge for EVERY 24-slot state `d`. -/
theorem dockCharge_conj (d : DockState) : dockCharge (conjDock d) = -dockCharge d := by
  rw [dockCharge_eq_sum, dockCharge_eq_sum, ← Finset.sum_neg_distrib]
  exact Finset.sum_congr rfl fun i _ => tone_dual_value (d i)

/-- Exact total charge bounds `-24 ≤ dockCharge d ≤ 24` for EVERY 24-slot dock state `d`. -/
theorem dockCharge_bounded (d : DockState) : -24 ≤ dockCharge d ∧ dockCharge d ≤ 24 := by
  rw [dockCharge_eq_sum]
  refine ⟨?_, ?_⟩
  · calc (-24 : Int) = ∑ _ : Fin 24, (-1 : Int) := by simp
      _ ≤ ∑ i : Fin 24, (d i).value := Finset.sum_le_sum fun i _ => (tone_value_bounds (d i)).1
  · calc ∑ i : Fin 24, (d i).value ≤ ∑ _ : Fin 24, (1 : Int) :=
        Finset.sum_le_sum fun i _ => (tone_value_bounds (d i)).2
      _ = 24 := by simp

end Vibe

end
