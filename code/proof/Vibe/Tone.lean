/-!
# Vibe Theory: Signed Ternary State & 24-Slot Dock Algebra

Minimal signed ternary alphabet `{-1, 0, +1}`, 24-slot `DockState`, calm vacuum `v1Dock`,
exact charge conjugation `conjDock`, and total dock charge `dockCharge`.
Imported and used directly by `Vibe.Rule` for concrete `V1` stationarity and light-cone proofs.
-/

set_option autoImplicit false

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

private theorem foldl_add_shift {α : Type} (f : α → Int) (xs : List α) (init : Int) :
    xs.foldl (fun acc x => acc + f x) init = init + xs.foldl (fun acc x => acc + f x) 0 := by
  induction xs generalizing init with
  | nil =>
    simp only [List.foldl]
    omega
  | cons x rest ih =>
    simp only [List.foldl]
    rw [ih (init + f x), ih (0 + f x)]
    omega

private theorem foldl_neg {α : Type} (f : α → Int) (xs : List α) :
    xs.foldl (fun acc x => acc + (-f x)) 0 = -(xs.foldl (fun acc x => acc + f x) 0) := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [List.foldl]
    rw [foldl_add_shift (fun y => -f y) rest (0 + -f x),
        foldl_add_shift f rest (0 + f x), ih]
    omega

private theorem foldl_bounds {α : Type} (f : α → Int) (xs : List α)
    (hb : ∀ x : α, -1 ≤ f x ∧ f x ≤ 1) :
    -(xs.length : Int) ≤ xs.foldl (fun acc x => acc + f x) 0 ∧
      xs.foldl (fun acc x => acc + f x) 0 ≤ (xs.length : Int) := by
  induction xs with
  | nil =>
    simp only [List.length_nil, List.foldl]
    decide
  | cons x rest ih =>
    simp only [List.length_cons, List.foldl]
    rw [foldl_add_shift f rest (0 + f x)]
    have hx := hb x
    omega

/-- Full 24-slot ternary state of a single 24-cell dock. -/
abbrev DockState := Fin 24 → Tone

/-- Calm vacuum dock state `V1`: all 24 slots equal to `.zero`. -/
def v1Dock : DockState := fun _ => .zero

/-- Exact slotwise charge conjugation `C` on a 24-slot dock. -/
def conjDock (d : DockState) : DockState := fun i => (d i).dual

/-- Exact total integer charge `∑_{i=0}^{23} value(d_i)` over all 24 slots of a dock. -/
def dockCharge (d : DockState) : Int :=
  (List.finRange 24).foldl (fun acc i => acc + (d i).value) 0

/-- Charge conjugation on 24-slot docks is an exact involution (`C^2 = I`). -/
theorem conjDock_involutive (d : DockState) : conjDock (conjDock d) = d := by
  funext i
  exact tone_dual_dual (d i)

/-- Charge conjugation fixes the calm vacuum dock `V1` identically. -/
theorem conjDock_fixes_v1 : conjDock v1Dock = v1Dock := rfl

/-- The calm vacuum dock `V1` carries exact zero total charge. -/
theorem dockCharge_v1 : dockCharge v1Dock = 0 := by decide

/-- Charge conjugation strictly negates total dock charge for EVERY 24-slot state `d`. -/
theorem dockCharge_conj (d : DockState) : dockCharge (conjDock d) = -dockCharge d := by
  unfold dockCharge conjDock
  have hFun : (fun acc (i : Fin 24) => acc + (d i).dual.value) =
      (fun acc (i : Fin 24) => acc + -(d i).value) := by
    funext acc i
    rw [tone_dual_value]
  rw [hFun]
  exact foldl_neg (fun i => (d i).value) (List.finRange 24)

/-- Exact total charge bounds `-24 ≤ dockCharge d ≤ 24` for EVERY 24-slot dock state `d`. -/
theorem dockCharge_bounded (d : DockState) : -24 ≤ dockCharge d ∧ dockCharge d ≤ 24 := by
  unfold dockCharge
  have h := foldl_bounds (fun i => (d i).value) (List.finRange 24) (fun i => tone_value_bounds (d i))
  have hLen : ((List.finRange 24).length : Int) = 24 := by decide
  rw [hLen] at h
  exact h

end Vibe
