set_option autoImplicit false

namespace Vibe

/-- The three base tones: `-1` (pain), `0` (peace), `+1` (pleasure). -/
inductive Tone where
  | pain
  | peace
  | pleasure
  deriving DecidableEq, Repr

def Tone.value : Tone → Int
  | .pain     => -1
  | .peace    => 0
  | .pleasure => 1

def Tone.dual : Tone → Tone
  | .pain     => .pleasure
  | .peace    => .peace
  | .pleasure => .pain

abbrev Balanced (a b : Tone) : Prop :=
  a.value + b.value = 0

theorem dual_dual (t : Tone) :
    t.dual.dual = t := by
  cases t <;> rfl

theorem dual_value (t : Tone) :
    t.dual.value = -t.value := by
  cases t <;> decide

theorem dual_balance (t : Tone) :
    t.value + t.dual.value = 0 := by
  cases t <;> decide

theorem peace_balanced : Balanced .peace .peace := by
  decide

theorem opposites_balanced : Balanced .pain .pleasure := by
  decide

theorem balanced_iff_dual (a b : Tone) :
    Balanced a b ↔ b = a.dual := by
  cases a <;> cases b <;> unfold Balanced <;> simp [Tone.value, Tone.dual]

theorem sum_tones_zero :
    Tone.pain.value + Tone.peace.value + Tone.pleasure.value = 0 := by
  decide

theorem tone_value_bounds (t : Tone) :
    -1 ≤ t.value ∧ t.value ≤ 1 := by
  cases t <;> decide

end Vibe
