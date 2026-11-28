import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith
import Vibe.FockBeat
import Vibe.Generated.BareBeat

/-!
# Vibe Computation Lab: the bare beat of the code is the Lean Fock beat on a declared family

Lean track L15 (lean-track.md, claims B6 and B12; q-ladder Q0 and Q5). `code/rule/bare-beat.ts` runs the
bare beat `U = S ∘ Φ_odd ∘ D ∘ M_meet ∘ M_pair(ζ_18) ∘ K ∘ D ∘ Φ_odd`; `Vibe.FockBeat` defines the same
beat `fockBeat χ` on the infinite `{3,4,3,4}` Fock space over `ℤ[ζ_9][1/6]`. `Vibe.Generated.BareBeat`
is exported from the TypeScript module itself (task/lean-export.ts). This module proves:

1. `gen_bare_beat_coeffs_eq`: the `Z9` constants `Z9_COIN_DIAG, Z9_COIN_OFF, Z9_MEET_SWAP, Z9_ZETA18`
   (with `Z9_ZETA6, Z9_OMEGA`) and every coefficient the layers produce on a witness state are the
   Fock constants `coinDiag, coinOff, meetSwap, zeta18, zeta6, omega, meetKeep, pairHop`, as
   `NinthRaw6` coordinates.
2. `gen_bare_beat_layers_eq`: `BEAT_LAYER_NAMES` and `BEAT_LAYERS` run in the order of `fockBeatUnit`.
3. `gen_bare_beat_family_eq`: on the declared family (below), each of the five dock-local layers of
   bare-beat.ts equals the Lean layer, as vectors of the Fock space (`fockHalfCoin`, `fockBounceK`,
   `fockMPair`, `fockMeet` on every family ket, and `Φ_odd` for every chiral invariant that is
   silent on docks with fewer than 4 excitations, as bare-beat's `chi_odd` is).
4. `gen_bare_beat_beat_eq` (with `thm_beat_link_family`): on the family, `fockBeat χ` of a ket is the
   streamed `applyBeat` output of bare-beat.ts, amplitude for amplitude, with the output docks the
   neighbours `transport s` whose centers are bare-beat's `stepDock(0, s)` centers.
5. `thm_beat_link_q0_gates` (B6): on the family the code's beat output has norm exactly 1, keeps the
   charge, the excitation count and the `+1` count of every configuration, and `fockBeatDag`
   inverts it exactly.
6. `gen_bare_beat_walk_eq` and `thm_beat_link_q5_walk` (B12): the lone vibe (slot 0, `+1`, role 0)
   under `fockBeat χ` for beats 0 to 16 is bare-beat's walk on line 0, and its second moments and
   returns to the start dock are q-ladder Q5's printed table.

**The family.** At the base dock (frame `mat5Id`, bare-beat's dock 0): every one-excitation state
(96), every two-excitation state with an excitation on line 0, slot 0 or its opposite (720), and
every identical full-line pair on the other 11 lines (44): 860 states, closed under the seven
dock-local layers.

**Roles.** The Lean Fock model has two roles (`SlotState.occ s r` with `r : Bool`); bare-beat.ts
carries a role number per vibe and uses up to 9 in the Q1 and Q3b experiments. Every statement here
is about roles 0 and 1 (`false`, `true`). Roles 2 and above are outside the Lean Fock model, so the
role-SWAP of Q1, the three-role Yang-Baxter of Q3b and the 216-parity count stay TypeScript-only.

**Limits.** Equality with the code holds on the exported family and walk, not on every state.
`Φ_odd` is checked silent there for any silent `χ`; its 4-vibe orbit sign is not linked. Two
excitations on two lines that both miss line 0 are left out of the family (the layers act on them
as on two lone lines, but no theorem here says so).
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

/-! ## The ring `ℤ[ζ_9][1/6]`: a zero test, a commutative ring, and positivity of the trace form -/

/-- Decidable zero test on `NinthLoc6` (reads any representative's numerator). -/
instance blDecIsZero (x : NinthLoc6) : Decidable (NinthLoc6.isZero x) :=
  Quot.recOnSubsingleton (motive := fun q => Decidable (NinthLoc6.isZero q)) x
    (fun a => inferInstanceAs (Decidable (a.num = Ninth.zero)))

private theorem bl_zero_of_isZero (z : NinthLoc6) (h : NinthLoc6.isZero z) : z = NinthLoc6.zero := by
  induction z using Quot.ind with
  | mk a =>
    change a.num = Ninth.zero at h
    apply Quot.sound
    show Ninth.scale (pow6 0) a.num = Ninth.scale (pow6 a.exp) Ninth.zero
    rw [h]
    simp only [Ninth.scale, Ninth.zero, Int.mul_zero]

/-- `x = y` from the decidable zero test of `x - y`. -/
theorem bl_eq_of_isZero {x y : NinthLoc6} (h : NinthLoc6.isZero (NinthLoc6.sub x y)) : x = y := by
  have h0 := bl_zero_of_isZero _ h
  have : NinthLoc6.add (NinthLoc6.sub x y) y = x := by
    unfold NinthLoc6.sub
    rw [NinthLoc6.add_assoc, NinthLoc6.add_comm (NinthLoc6.neg y) y, NinthLoc6.add_neg,
      NinthLoc6.add_zero]
  rw [← this, h0, NinthLoc6.zero_add]

/-- `NinthLoc6` as a Mathlib commutative ring (the operations of `Vibe.Fock.Ring`), so `ring` applies. -/
instance blCommRing : CommRing NinthLoc6 where
  add := NinthLoc6.add
  zero := NinthLoc6.zero
  neg := NinthLoc6.neg
  sub := NinthLoc6.sub
  mul := NinthLoc6.mul
  one := NinthLoc6.one
  add_assoc := NinthLoc6.add_assoc
  zero_add := NinthLoc6.zero_add
  add_zero := NinthLoc6.add_zero
  add_comm := NinthLoc6.add_comm
  mul_assoc := NinthLoc6.mul_assoc
  one_mul := NinthLoc6.one_mul
  mul_one := NinthLoc6.mul_one
  zero_mul := NinthLoc6.zero_mul
  mul_zero := NinthLoc6.mul_zero
  left_distrib := NinthLoc6.mul_add
  right_distrib := NinthLoc6.add_mul
  mul_comm := NinthLoc6.mul_comm
  neg_add_cancel := fun a => by rw [NinthLoc6.add_comm]; exact NinthLoc6.add_neg a
  sub_eq_add_neg := fun _ _ => rfl
  nsmul := nsmulRec
  zsmul := zsmulRec

theorem bl_add (a b : NinthLoc6) : NinthLoc6.add a b = a + b := rfl
theorem bl_mul (a b : NinthLoc6) : NinthLoc6.mul a b = a * b := rfl
theorem bl_neg (a : NinthLoc6) : NinthLoc6.neg a = -a := rfl
theorem bl_sub (a b : NinthLoc6) : NinthLoc6.sub a b = a - b := rfl
theorem bl_zero : NinthLoc6.zero = 0 := rfl
theorem bl_one : NinthLoc6.one = 1 := rfl
theorem bl_sc_add (a b : NinthLoc6) : StarCommRing.add a b = a + b := rfl
theorem bl_sc_mul (a b : NinthLoc6) : StarCommRing.mul a b = a * b := rfl
theorem bl_sc_zero : (StarCommRing.zero : NinthLoc6) = 0 := rfl
theorem bl_sc_one : (StarCommRing.one : NinthLoc6) = 1 := rfl

/-- The trace `Tr_{ℚ(ζ_9)/ℚ}` on `ℤ[ζ_9]` in the basis `1, z, ..., z^5`: `6 c₀ - 3 c₃`. -/
def blTr (n : Ninth) : Int := 6 * n.c0 - 3 * n.c3

private theorem bl_pow6_pos (n : Nat) : 0 < pow6 n := by
  induction n with
  | zero => decide
  | succ k ih => simp only [pow6]; omega

private theorem bl_tr_scale (k : Int) (n : Ninth) : blTr (Ninth.scale k n) = k * blTr n := by
  cases n; simp only [blTr, Ninth.scale]; ring

private theorem bl_tr_add (n m : Ninth) : blTr (Ninth.add n m) = blTr n + blTr m := by
  cases n; cases m; simp only [blTr, Ninth.add]; ring

private theorem bl_tr_resp {a b : NinthRaw6} (h : NinthRaw6.equiv a b) :
    pow6 b.exp * blTr a.num = pow6 a.exp * blTr b.num := by
  have := congrArg blTr h
  rwa [bl_tr_scale, bl_tr_scale] at this

/-- The trace is `≥ 0` (well defined on the localization: a representative's sign). -/
def blTrNonneg : NinthLoc6 → Prop :=
  Quot.lift (fun r => 0 ≤ blTr r.num) (fun a b h => by
    have e := bl_tr_resp h
    have pa := bl_pow6_pos a.exp
    have pb := bl_pow6_pos b.exp
    apply propext
    constructor
    · intro ha; nlinarith
    · intro hb; nlinarith)

/-- The trace is `0`. -/
def blTrZero : NinthLoc6 → Prop :=
  Quot.lift (fun r => blTr r.num = 0) (fun a b h => by
    have e := bl_tr_resp h
    have pa := bl_pow6_pos a.exp
    have pb := bl_pow6_pos b.exp
    apply propext
    constructor
    · intro ha
      rw [ha, Int.mul_zero] at e
      rcases Int.mul_eq_zero.mp e.symm with h1 | h1
      · omega
      · exact h1
    · intro hb
      rw [hb, Int.mul_zero] at e
      rcases Int.mul_eq_zero.mp e with h1 | h1
      · omega
      · exact h1)

private theorem bl_trNonneg_add (a b : NinthLoc6) (ha : blTrNonneg a) (hb : blTrNonneg b) :
    blTrNonneg (a + b) := by
  induction a using Quot.ind with
  | mk x =>
  induction b using Quot.ind with
  | mk y =>
  change 0 ≤ blTr x.num at ha
  change 0 ≤ blTr y.num at hb
  change 0 ≤ blTr (Ninth.add (Ninth.scale (pow6 y.exp) x.num) (Ninth.scale (pow6 x.exp) y.num))
  rw [bl_tr_add, bl_tr_scale, bl_tr_scale]
  have px := bl_pow6_pos x.exp
  have py := bl_pow6_pos y.exp
  nlinarith

private theorem bl_trZero_left (a b : NinthLoc6) (ha : blTrNonneg a) (hb : blTrNonneg b)
    (hab : blTrZero (a + b)) : blTrZero a := by
  induction a using Quot.ind with
  | mk x =>
  induction b using Quot.ind with
  | mk y =>
  change 0 ≤ blTr x.num at ha
  change 0 ≤ blTr y.num at hb
  change blTr (Ninth.add (Ninth.scale (pow6 y.exp) x.num) (Ninth.scale (pow6 x.exp) y.num)) = 0 at hab
  change blTr x.num = 0
  rw [bl_tr_add, bl_tr_scale, bl_tr_scale] at hab
  have px := bl_pow6_pos x.exp
  have py := bl_pow6_pos y.exp
  have h1 : pow6 y.exp * blTr x.num = 0 := by nlinarith
  rcases Int.mul_eq_zero.mp h1 with h | h
  · omega
  · exact h

private theorem bl_tr_normSq (n : Ninth) :
    blTr (Ninth.mul (Ninth.conj n) n) =
      3 * ((n.c0 - n.c3) ^ 2 + (n.c1 - n.c4) ^ 2 + (n.c2 - n.c5) ^ 2) +
      3 * (n.c0 ^ 2 + n.c1 ^ 2 + n.c2 ^ 2 + n.c3 ^ 2 + n.c4 ^ 2 + n.c5 ^ 2) := by
  cases n; simp only [blTr, Ninth.mul, Ninth.conj]; ring

private theorem bl_trNonneg_normSq (x : NinthLoc6) : blTrNonneg (NinthLoc6.conj x * x) := by
  induction x using Quot.ind with
  | mk r =>
  change 0 ≤ blTr (Ninth.mul (Ninth.conj r.num) r.num)
  rw [bl_tr_normSq]
  positivity

private theorem bl_eq_zero_of_trZero_normSq (x : NinthLoc6) (h : blTrZero (NinthLoc6.conj x * x)) :
    x = 0 := by
  induction x using Quot.ind with
  | mk r =>
  change blTr (Ninth.mul (Ninth.conj r.num) r.num) = 0 at h
  rw [bl_tr_normSq] at h
  apply bl_zero_of_isZero
  change r.num = Ninth.zero
  obtain ⟨n0, n1, n2, n3, n4, n5⟩ := r.num
  simp only at h
  have h0 : n0 = 0 := by nlinarith [sq_nonneg (n0 - n3), sq_nonneg (n1 - n4), sq_nonneg (n2 - n5),
    sq_nonneg n0, sq_nonneg n1, sq_nonneg n2, sq_nonneg n3, sq_nonneg n4, sq_nonneg n5]
  have h1 : n1 = 0 := by nlinarith [sq_nonneg (n0 - n3), sq_nonneg (n1 - n4), sq_nonneg (n2 - n5),
    sq_nonneg n0, sq_nonneg n1, sq_nonneg n2, sq_nonneg n3, sq_nonneg n4, sq_nonneg n5]
  have h2 : n2 = 0 := by nlinarith [sq_nonneg (n0 - n3), sq_nonneg (n1 - n4), sq_nonneg (n2 - n5),
    sq_nonneg n0, sq_nonneg n1, sq_nonneg n2, sq_nonneg n3, sq_nonneg n4, sq_nonneg n5]
  have h3 : n3 = 0 := by nlinarith [sq_nonneg (n0 - n3), sq_nonneg (n1 - n4), sq_nonneg (n2 - n5),
    sq_nonneg n0, sq_nonneg n1, sq_nonneg n2, sq_nonneg n3, sq_nonneg n4, sq_nonneg n5]
  have h4 : n4 = 0 := by nlinarith [sq_nonneg (n0 - n3), sq_nonneg (n1 - n4), sq_nonneg (n2 - n5),
    sq_nonneg n0, sq_nonneg n1, sq_nonneg n2, sq_nonneg n3, sq_nonneg n4, sq_nonneg n5]
  have h5 : n5 = 0 := by nlinarith [sq_nonneg (n0 - n3), sq_nonneg (n1 - n4), sq_nonneg (n2 - n5),
    sq_nonneg n0, sq_nonneg n1, sq_nonneg n2, sq_nonneg n3, sq_nonneg n4, sq_nonneg n5]
  subst h0 h1 h2 h3 h4 h5
  rfl

end Compute

end Vibe
