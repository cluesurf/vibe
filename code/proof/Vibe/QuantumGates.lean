import Vibe.Fock.Ring

/-!
# Vibe Theory: Exact Gates of the Bare Beat `U` (Q1)

Item `vibe-computation-models-0030` (decision 004 of `vibe/computation/models`). Two exact facts over
`NinthLoc6 = ℤ[ζ_9][1/6]` about gates that W12 read in floating point:

- `thm_q_meet_gates_unitary`: the role meeting `M = (ζ_6 / 2) I + ((ω - 1) / 2) SWAP` on the roles of two like-sign
  excitations on one line (the `M_meet` layer: `ω` on equal roles, the keep / swap mixer on unequal ones, built from
  `NinthLoc6.meetKeep`, `NinthLoc6.meetSwap` and `NinthLoc6.omega`) is unitary, `M† M = M M† = I` entry by entry,
  on two roles (the Lean model's `Bool` roles) and on three roles.
- `thm_q_role_swap_two_thirds`: the Yang-fused pulse-doublon operator `F = R_02(i ζ_6) R_12(i ω)`, with
  `R_ab(i x) = (x I - P_ab) / (x + 1)` (the R-matrix at the rapidity `u* = -√3 / 2`), sends the doublon-pulse word
  `|0,1,2⟩ + |1,0,2⟩` to a vector whose weight with the pulse still in role 2 is `2/3` and whose weight with the pulse's
  role exchanged is `4/3` (of the input's `2`): elastic probability `1/3`, role-SWAP probability `2/3`, nothing lost,
  elastic amplitude `(2ω + 1) / 3 = i / √3`, and zero weight on the part antisymmetric in excitations 0 and 1.
- `thm_q_sym3_cz_minus_one`: the same `F` multiplies the fully symmetric word of three distinct roles, and the word
  with three equal roles, by exactly `-1` (the CZ phase `π`).

Every equality is decided on the exact representatives (`NinthRaw6`) by `decide`; no `sorry`, no axiom, no
`native_decide`. That the beat's one-line two-body scattering IS the Yang R-matrix at `u*` is W12's floating result and
is not stated here.
-/

set_option autoImplicit false

namespace Vibe

namespace QuantumGates

open NinthLoc6 (rawAdd rawMul rawConj rawNeg)

/-! ## Raw representatives -/

/-- The raw zero and one. -/
def rawZero : NinthRaw6 := ⟨Ninth.zero, 0⟩
def rawOne : NinthRaw6 := ⟨Ninth.one, 0⟩

/-- `ζ_6 / 2`, the representative of `NinthLoc6.meetKeep` (`mul zeta6 inv2`). -/
def rawKeep : NinthRaw6 := rawMul ⟨⟨1, 0, 0, 1, 0, 0⟩, 0⟩ ⟨Ninth.ofInt 3, 1⟩
/-- `(ω - 1) / 2`, the representative of `NinthLoc6.meetSwap`. -/
def rawSwap : NinthRaw6 := rawMul ⟨⟨-1, 0, 0, 1, 0, 0⟩, 0⟩ ⟨Ninth.ofInt 3, 1⟩
/-- `ω`. -/
def rawOmega : NinthRaw6 := ⟨Ninth.omega, 0⟩

/-- Sum of a list of raw numbers. -/
def rawSum : List NinthRaw6 → NinthRaw6
  | [] => rawZero
  | x :: xs => rawAdd x (rawSum xs)

/-- The meeting on two excitations with `d` roles, entry (row `i`, column `j`), index `r₁ d + r₂`. -/
def meetRaw (d i j : Nat) : NinthRaw6 :=
  if j / d = j % d then
    (if i = j then rawOmega else rawZero)
  else if i = j then rawKeep
  else if i / d = j % d ∧ i % d = j / d then rawSwap
  else rawZero

/-- `(M† M)_{ij}`. -/
def gramRaw (d i j : Nat) : NinthRaw6 :=
  rawSum ((List.range (d * d)).map (fun k => rawMul (rawConj (meetRaw d k i)) (meetRaw d k j)))

/-- `(M M†)_{ij}`. -/
def coGramRaw (d i j : Nat) : NinthRaw6 :=
  rawSum ((List.range (d * d)).map (fun k => rawMul (meetRaw d i k) (rawConj (meetRaw d j k))))

def deltaRaw (i j : Nat) : NinthRaw6 := if i = j then rawOne else rawZero

private theorem gram2 : ∀ i j : Fin 4, NinthRaw6.equiv (gramRaw 2 i j) (deltaRaw i j) := by decide
private theorem coGram2 : ∀ i j : Fin 4, NinthRaw6.equiv (coGramRaw 2 i j) (deltaRaw i j) := by decide
private theorem gram3 : ∀ i j : Fin 9, NinthRaw6.equiv (gramRaw 3 i j) (deltaRaw i j) := by decide
private theorem coGram3 : ∀ i j : Fin 9, NinthRaw6.equiv (coGramRaw 3 i j) (deltaRaw i j) := by decide

/-! ## The meeting in `NinthLoc6` -/

/-- The meeting's entries as numbers of `ℤ[ζ_9][1/6]`. -/
def meetLoc (d i j : Nat) : NinthLoc6 := Quot.mk NinthRaw6.equiv (meetRaw d i j)

/-- Sum of a list in `NinthLoc6`. -/
def locSum : List NinthLoc6 → NinthLoc6
  | [] => NinthLoc6.zero
  | x :: xs => NinthLoc6.add x (locSum xs)

private theorem locSum_map (f : Nat → NinthRaw6) (g : Nat → NinthLoc6)
    (hg : ∀ k, g k = Quot.mk NinthRaw6.equiv (f k)) (xs : List Nat) :
    locSum (xs.map g) = Quot.mk NinthRaw6.equiv (rawSum (xs.map f)) := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [List.map, locSum, rawSum]
    rw [ih, hg]
    rfl

/-- `(M† M)_{ij}` in `NinthLoc6`. -/
def gramLoc (d i j : Nat) : NinthLoc6 :=
  locSum ((List.range (d * d)).map (fun k => NinthLoc6.mul (NinthLoc6.conj (meetLoc d k i)) (meetLoc d k j)))

/-- `(M M†)_{ij}` in `NinthLoc6`. -/
def coGramLoc (d i j : Nat) : NinthLoc6 :=
  locSum ((List.range (d * d)).map (fun k => NinthLoc6.mul (meetLoc d i k) (NinthLoc6.conj (meetLoc d j k))))

def deltaLoc (i j : Nat) : NinthLoc6 := if i = j then NinthLoc6.one else NinthLoc6.zero

private theorem gramLoc_eq (d i j : Nat) : gramLoc d i j = Quot.mk NinthRaw6.equiv (gramRaw d i j) := by
  unfold gramLoc gramRaw
  exact locSum_map _ _ (fun _ => rfl) _

private theorem coGramLoc_eq (d i j : Nat) : coGramLoc d i j = Quot.mk NinthRaw6.equiv (coGramRaw d i j) := by
  unfold coGramLoc coGramRaw
  exact locSum_map _ _ (fun _ => rfl) _

private theorem deltaLoc_eq (i j : Nat) : deltaLoc i j = Quot.mk NinthRaw6.equiv (deltaRaw i j) := by
  unfold deltaLoc deltaRaw
  by_cases h : i = j
  · simp only [h, ↓reduceIte]; rfl
  · simp only [h, ↓reduceIte]; rfl

/-- Headline Theorem (Q1, the meeting is unitary): the role meeting `M_meet` of the bare beat, read as a gate on the
    roles of two like-sign excitations on one line, `M = (ζ_6 / 2) I + ((ω - 1) / 2) SWAP` (`ω` on equal roles,
    `NinthLoc6.meetKeep` and `NinthLoc6.meetSwap` on unequal ones), satisfies `M† M = M M† = I` exactly over
    `ℤ[ζ_9][1/6]` on two roles and on three roles. -/
theorem thm_q_meet_gates_unitary :
    (∀ i j : Fin 4, gramLoc 2 i j = deltaLoc i j) ∧
    (∀ i j : Fin 4, coGramLoc 2 i j = deltaLoc i j) ∧
    (∀ i j : Fin 9, gramLoc 3 i j = deltaLoc i j) ∧
    (∀ i j : Fin 9, coGramLoc 3 i j = deltaLoc i j) ∧
    meetLoc 3 1 1 = NinthLoc6.meetKeep ∧
    meetLoc 3 3 1 = NinthLoc6.meetSwap ∧
    meetLoc 3 0 0 = NinthLoc6.omega ∧
    meetLoc 2 1 1 = NinthLoc6.meetKeep ∧
    meetLoc 2 2 1 = NinthLoc6.meetSwap ∧
    meetLoc 2 3 3 = NinthLoc6.omega := by
  refine ⟨?_, ?_, ?_, ?_, Quot.sound (by decide), Quot.sound (by decide), Quot.sound (by decide),
    Quot.sound (by decide), Quot.sound (by decide), Quot.sound (by decide)⟩
  · intro i j; rw [gramLoc_eq, deltaLoc_eq]; exact Quot.sound (gram2 i j)
  · intro i j; rw [coGramLoc_eq, deltaLoc_eq]; exact Quot.sound (coGram2 i j)
  · intro i j; rw [gramLoc_eq, deltaLoc_eq]; exact Quot.sound (gram3 i j)
  · intro i j; rw [coGramLoc_eq, deltaLoc_eq]; exact Quot.sound (coGram3 i j)

/-! ## The Yang fusion on three excitations with three roles (index `9 r₀ + 3 r₁ + r₂`) -/

def swap01 (b : Nat) : Nat := 9 * ((b / 3) % 3) + 3 * (b / 9) + b % 3
def swap02 (b : Nat) : Nat := 9 * (b % 3) + 3 * ((b / 3) % 3) + b / 9
def swap12 (b : Nat) : Nat := 9 * (b / 9) + 3 * (b % 3) + (b / 3) % 3

/-- `(1 + ζ_6)⁻¹ = (1 - ω) / 3`. -/
def rawInvZeta6 : NinthRaw6 := ⟨Ninth.scale 2 ⟨1, 0, 0, -1, 0, 0⟩, 1⟩
/-- `(1 + ω)⁻¹ = -ω`. -/
def rawInvOmega : NinthRaw6 := ⟨Ninth.neg Ninth.omega, 0⟩

/-- One factor `R_ab(i x) w = (x w - P_ab w) / (x + 1)`, applied to a vector, with `xi = x / (x + 1)` and
    `inv = 1 / (x + 1)`. `P_ab` is an involution, so `(P_ab w)_b = w_{swap b}`. -/
def yangApply (xi inv : NinthRaw6) (sw : Nat → Nat) (w : Nat → NinthRaw6) (b : Nat) : NinthRaw6 :=
  rawAdd (rawMul xi (w b)) (rawNeg (rawMul inv (w (sw b))))

/-- The doublon-pulse word `|0,1,2⟩ + |1,0,2⟩` (indices 5 and 11). -/
def inputRaw (b : Nat) : NinthRaw6 := if b = 5 ∨ b = 11 then rawOne else rawZero

/-- `F w = R_02(i ζ_6) R_12(i ω) w`. -/
def fusedApply (w : Nat → NinthRaw6) : Nat → NinthRaw6 :=
  yangApply (rawMul ⟨⟨1, 0, 0, 1, 0, 0⟩, 0⟩ rawInvZeta6) rawInvZeta6 swap02
    (yangApply (rawMul rawOmega rawInvOmega) rawInvOmega swap12 w)

def outRaw : Nat → NinthRaw6 := fusedApply inputRaw

def weightRaw (keep : Bool) : NinthRaw6 :=
  rawSum (((List.range 27).filter (fun b => decide (b % 3 = 2) == keep)).map
    (fun b => rawMul (rawConj (outRaw b)) (outRaw b)))

def altRaw : NinthRaw6 :=
  rawSum ((List.range 27).map (fun b =>
    rawMul (rawConj (rawAdd (outRaw b) (rawNeg (outRaw (swap01 b)))))
      (rawAdd (outRaw b) (rawNeg (outRaw (swap01 b))))))

/-- The output with the pulse still in role 2 (elastic), with the pulse's role exchanged, and the input norm. -/
def keepWeight : NinthLoc6 := Quot.mk NinthRaw6.equiv (weightRaw true)
def swapWeight : NinthLoc6 := Quot.mk NinthRaw6.equiv (weightRaw false)
def inputNorm : NinthLoc6 :=
  Quot.mk NinthRaw6.equiv (rawSum ((List.range 27).map (fun b => rawMul (rawConj (inputRaw b)) (inputRaw b))))
/-- The output's weight on the part antisymmetric in excitations 0 and 1 (times 4). -/
def altLeak : NinthLoc6 := Quot.mk NinthRaw6.equiv altRaw
/-- The output amplitudes on the two input words. -/
def elasticAt (b : Nat) : NinthLoc6 := Quot.mk NinthRaw6.equiv (outRaw b)

/-- Headline Theorem (Q1, the 2/3 role-SWAP): the Yang-fused pulse-doublon operator `F = R_02(i ζ_6) R_12(i ω)`
    maps `|0,1,2⟩ + |1,0,2⟩` (norm² 2) to weight `2/3` with the pulse still in role 2 and `4/3` with its role
    exchanged, so elastic probability `1/3` and role-SWAP probability `2/3`, with total weight `2` (lossless) and
    zero weight antisymmetric in the doublon's two excitations; the elastic amplitude on each input word is
    `(2ω + 1) / 3 = i / √3`. -/
theorem thm_q_role_swap_two_thirds :
    inputNorm = NinthLoc6.ofInt 2 ∧
    keepWeight = NinthLoc6.mul (NinthLoc6.ofInt 2) NinthLoc6.inv3 ∧
    swapWeight = NinthLoc6.mul (NinthLoc6.ofInt 4) NinthLoc6.inv3 ∧
    NinthLoc6.add keepWeight swapWeight = inputNorm ∧
    NinthLoc6.mul (NinthLoc6.ofInt 3) keepWeight = inputNorm ∧
    NinthLoc6.mul (NinthLoc6.ofInt 3) swapWeight = NinthLoc6.mul (NinthLoc6.ofInt 2) inputNorm ∧
    altLeak = NinthLoc6.zero ∧
    elasticAt 5 = NinthLoc6.mul (NinthLoc6.ofNinth ⟨1, 0, 0, 2, 0, 0⟩) NinthLoc6.inv3 ∧
    elasticAt 11 = NinthLoc6.mul (NinthLoc6.ofNinth ⟨1, 0, 0, 2, 0, 0⟩) NinthLoc6.inv3 := by
  exact ⟨Quot.sound (by decide +kernel), Quot.sound (by decide +kernel), Quot.sound (by decide +kernel),
    Quot.sound (by decide +kernel), Quot.sound (by decide +kernel), Quot.sound (by decide +kernel),
    Quot.sound (by decide +kernel), Quot.sound (by decide +kernel), Quot.sound (by decide +kernel)⟩

/-- The symmetric word of three distinct roles and the word with three equal roles. -/
def sym3Raw (b : Nat) : NinthRaw6 :=
  if b = 5 ∨ b = 7 ∨ b = 11 ∨ b = 15 ∨ b = 19 ∨ b = 21 then rawOne else rawZero
def equalRaw (b : Nat) : NinthRaw6 := if b = 0 then rawOne else rawZero

private theorem cz_sym3 : ∀ b : Fin 27,
    NinthRaw6.equiv (fusedApply sym3Raw b) (rawNeg (sym3Raw b)) := by decide
private theorem cz_equal : ∀ b : Fin 27,
    NinthRaw6.equiv (fusedApply equalRaw b) (rawNeg (equalRaw b)) := by decide

/-- Headline Theorem (Q1, the Sym³ CZ phase is exactly `π`): `F` multiplies the symmetric word of three distinct roles
    and the word of three equal roles by exactly `-1`, every amplitude in `ℤ[ζ_9][1/6]`. -/
theorem thm_q_sym3_cz_minus_one :
    (∀ b : Fin 27, Quot.mk NinthRaw6.equiv (fusedApply sym3Raw b) =
      NinthLoc6.neg (Quot.mk NinthRaw6.equiv (sym3Raw b))) ∧
    (∀ b : Fin 27, Quot.mk NinthRaw6.equiv (fusedApply equalRaw b) =
      NinthLoc6.neg (Quot.mk NinthRaw6.equiv (equalRaw b))) :=
  ⟨fun b => Quot.sound (cz_sym3 b), fun b => Quot.sound (cz_equal b)⟩

end QuantumGates

end Vibe
