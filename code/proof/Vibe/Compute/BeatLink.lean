import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.LinearCombination
import Mathlib.Tactic.Positivity
import Mathlib.Data.List.Nodup
import Mathlib.Data.List.GetD
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

private theorem bl_add_neg (a : NinthLoc6) : NinthLoc6.add a (NinthLoc6.neg a) = NinthLoc6.zero :=
  StarCommRing.add_neg (R := NinthLoc6) a

/-- `x = y` from the decidable zero test of `x - y`. -/
theorem bl_eq_of_isZero {x y : NinthLoc6} (h : NinthLoc6.isZero (NinthLoc6.sub x y)) : x = y := by
  have h0 := bl_zero_of_isZero _ h
  have : NinthLoc6.add (NinthLoc6.sub x y) y = x := by
    unfold NinthLoc6.sub
    rw [NinthLoc6.add_assoc, NinthLoc6.add_comm (NinthLoc6.neg y) y,
      bl_add_neg y, NinthLoc6.add_zero]
  rw [← this, h0, NinthLoc6.zero_add]

/-- `NinthLoc6` as a Mathlib commutative ring (the operations of `Vibe.Fock.Ring`), so `ring` applies. -/
instance blZero : Zero NinthLoc6 := ⟨NinthLoc6.zero⟩
instance blOne : One NinthLoc6 := ⟨NinthLoc6.one⟩
instance blAdd : Add NinthLoc6 := ⟨NinthLoc6.add⟩
instance blNeg : Neg NinthLoc6 := ⟨NinthLoc6.neg⟩
instance blSub : Sub NinthLoc6 := ⟨NinthLoc6.sub⟩
instance blMul : Mul NinthLoc6 := ⟨NinthLoc6.mul⟩

instance blCommRing : CommRing NinthLoc6 where
  add_assoc := NinthLoc6.add_assoc
  zero_add := NinthLoc6.zero_add
  add_zero := NinthLoc6.add_zero
  add_comm := NinthLoc6.add_comm
  mul_assoc := NinthLoc6.mul_assoc
  one_mul := NinthLoc6.one_mul
  mul_one := NinthLoc6.mul_one
  zero_mul := StarCommRing.zero_mul (R := NinthLoc6)
  mul_zero := NinthLoc6.mul_zero
  left_distrib := NinthLoc6.mul_add
  right_distrib := StarCommRing.add_mul (R := NinthLoc6)
  mul_comm := NinthLoc6.mul_comm
  neg_add_cancel := fun a => by
    show NinthLoc6.add (NinthLoc6.neg a) a = NinthLoc6.zero
    rw [NinthLoc6.add_comm]; exact StarCommRing.add_neg (R := NinthLoc6) a
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

private theorem bl_sq6 (a b c d e f : Int)
    (h : 3 * ((a - d) ^ 2 + (b - e) ^ 2 + (c - f) ^ 2) + 3 * (a ^ 2 + b ^ 2 + c ^ 2 + d ^ 2 + e ^ 2 + f ^ 2) = 0) :
    a = 0 ∧ b = 0 ∧ c = 0 ∧ d = 0 ∧ e = 0 ∧ f = 0 := by
  have ha : a ^ 2 = 0 := by nlinarith [sq_nonneg (a - d), sq_nonneg (b - e), sq_nonneg (c - f), sq_nonneg a, sq_nonneg b, sq_nonneg c, sq_nonneg d, sq_nonneg e, sq_nonneg f]
  have hb : b ^ 2 = 0 := by nlinarith [sq_nonneg (a - d), sq_nonneg (b - e), sq_nonneg (c - f), sq_nonneg a, sq_nonneg b, sq_nonneg c, sq_nonneg d, sq_nonneg e, sq_nonneg f]
  have hc : c ^ 2 = 0 := by nlinarith [sq_nonneg (a - d), sq_nonneg (b - e), sq_nonneg (c - f), sq_nonneg a, sq_nonneg b, sq_nonneg c, sq_nonneg d, sq_nonneg e, sq_nonneg f]
  have hd : d ^ 2 = 0 := by nlinarith [sq_nonneg (a - d), sq_nonneg (b - e), sq_nonneg (c - f), sq_nonneg a, sq_nonneg b, sq_nonneg c, sq_nonneg d, sq_nonneg e, sq_nonneg f]
  have he : e ^ 2 = 0 := by nlinarith [sq_nonneg (a - d), sq_nonneg (b - e), sq_nonneg (c - f), sq_nonneg a, sq_nonneg b, sq_nonneg c, sq_nonneg d, sq_nonneg e, sq_nonneg f]
  have hf : f ^ 2 = 0 := by nlinarith [sq_nonneg (a - d), sq_nonneg (b - e), sq_nonneg (c - f), sq_nonneg a, sq_nonneg b, sq_nonneg c, sq_nonneg d, sq_nonneg e, sq_nonneg f]
  exact ⟨pow_eq_zero_iff (n := 2) (by norm_num) |>.mp ha, pow_eq_zero_iff (n := 2) (by norm_num) |>.mp hb,
    pow_eq_zero_iff (n := 2) (by norm_num) |>.mp hc, pow_eq_zero_iff (n := 2) (by norm_num) |>.mp hd,
    pow_eq_zero_iff (n := 2) (by norm_num) |>.mp he, pow_eq_zero_iff (n := 2) (by norm_num) |>.mp hf⟩

private theorem bl_eq_zero_of_trZero_normSq (x : NinthLoc6) (h : blTrZero (NinthLoc6.conj x * x)) :
    x = 0 := by
  induction x using Quot.ind with
  | mk r =>
  change blTr (Ninth.mul (Ninth.conj r.num) r.num) = 0 at h
  rw [bl_tr_normSq] at h
  apply bl_zero_of_isZero
  change r.num = Ninth.zero
  obtain ⟨⟨n0, n1, n2, n3, n4, n5⟩, e⟩ := r
  obtain ⟨h0, h1, h2, h3, h4, h5⟩ := bl_sq6 n0 n1 n2 n3 n4 n5 h
  subst h0 h1 h2 h3 h4 h5
  rfl

private theorem bl_trZero_zero : blTrZero (0 : NinthLoc6) := by
  show blTr Ninth.zero = 0
  decide

/-! ## Finite sums, duplicate-free lists, and the zero-off lemma for a unitary -/

private theorem bl_isNodup_iff {α : Type} (l : List α) : IsNodup l ↔ l.Nodup := by
  induction l with
  | nil => exact ⟨fun _ => List.nodup_nil, fun _ => IsNodup.nil⟩
  | cons x xs ih =>
    rw [List.nodup_cons]
    constructor
    · intro h
      cases h with
      | cons hx hxs => exact ⟨hx, ih.mp hxs⟩
    · intro ⟨hx, hxs⟩
      exact IsNodup.cons hx (ih.mpr hxs)

private theorem bl_sumList_append (xs ys : List HoneycombConfig) (f : HoneycombConfig → NinthLoc6) :
    sumList (xs ++ ys) f = sumList xs f + sumList ys f := by
  induction xs with
  | nil => show sumList ys f = 0 + sumList ys f; rw [zero_add]
  | cons x rest ih =>
    show f x + sumList (rest ++ ys) f = (f x + sumList rest f) + sumList ys f
    rw [ih, add_assoc]

private theorem bl_sum_trNonneg (l : List HoneycombConfig) (f : HoneycombConfig → NinthLoc6)
    (h : ∀ c ∈ l, blTrNonneg (f c)) : blTrNonneg (sumList l f) := by
  induction l with
  | nil => show blTr Ninth.zero ≥ 0; decide
  | cons x rest ih =>
    exact bl_trNonneg_add _ _ (h x List.mem_cons_self) (ih fun c hc => h c (List.mem_cons_of_mem x hc))

private theorem bl_sum_trZero (l : List HoneycombConfig) (f : HoneycombConfig → NinthLoc6)
    (h : ∀ c ∈ l, blTrNonneg (f c)) (hz : blTrZero (sumList l f)) : ∀ c ∈ l, blTrZero (f c) := by
  induction l with
  | nil => intro c hc; cases hc
  | cons x rest ih =>
    have hx := h x List.mem_cons_self
    have hr : ∀ c ∈ rest, blTrNonneg (f c) := fun c hc => h c (List.mem_cons_of_mem x hc)
    have hs := bl_sum_trNonneg rest f hr
    change blTrZero (f x + sumList rest f) at hz
    have hzx := bl_trZero_left _ _ hx hs hz
    rw [add_comm] at hz
    have hzr := bl_trZero_left _ _ hs hx hz
    intro c hc
    rcases List.mem_cons.mp hc with rfl | hc
    · exact hzx
    · exact ih hr hzr c hc

theorem bl_ket (c₀ c : HoneycombConfig) :
    ket (R := NinthLoc6) c₀ c = if c = c₀ then 1 else 0 := rfl

/-- **Zero off a support.** If a Fock unitary sends `|c₀⟩` to a vector whose squared norm on a
    duplicate-free list `T` is already `1`, it vanishes off `T` (the trace form of `ℤ[ζ_9][1/6]` is
    positive definite). -/
theorem bl_zero_off (U : FockUnitary NinthLoc6 HoneycombConfig) (c₀ : HoneycombConfig)
    (T : List HoneycombConfig) (hT : T.Nodup) (hnorm : normSqOn T (U.op (ket c₀)) = 1) :
    ∀ c, c ∉ T → U.op (ket c₀) c = 0 := by
  have hs : SuppIn [c₀] (ket (R := NinthLoc6) c₀) := by
    refine ⟨(bl_isNodup_iff _).mpr (List.nodup_cons.mpr ⟨List.not_mem_nil, List.nodup_nil⟩), fun c hc => ?_⟩
    have hne : c ≠ c₀ := fun e => hc (e ▸ List.mem_singleton_self c)
    show (if c = c₀ then (1 : NinthLoc6) else 0) = 0
    rw [ite_eq_right hne]
  have h1 : normSqOn [c₀] (ket (R := NinthLoc6) c₀) = 1 := by
    show NinthLoc6.conj (if c₀ = c₀ then (1 : NinthLoc6) else 0) * (if c₀ = c₀ then (1 : NinthLoc6) else 0) + 0 = 1
    rw [ite_eq_left rfl]
    show NinthLoc6.conj NinthLoc6.one * NinthLoc6.one + 0 = 1
    rw [NinthLoc6.conj_one]
    show (1 : NinthLoc6) * 1 + 0 = 1
    ring
  obtain ⟨s', hs'⟩ := U.preservesSupp _ _ hs
  have hs'nd : s'.Nodup := (bl_isNodup_iff _).mp hs'.1
  let rest := s'.filter (fun c => decide (c ∉ T))
  have hrest_nd : rest.Nodup := hs'nd.filter _
  have hdisj : ∀ c ∈ T, c ∉ rest := by
    intro c hcT hcr
    have := (List.mem_filter.mp hcr).2
    simp only [decide_eq_true_eq] at this
    exact this hcT
  have hu_nd : (T ++ rest).Nodup := List.nodup_append.mpr ⟨hT, hrest_nd, fun a ha b hb e => hdisj a ha (e ▸ hb)⟩
  have hu : SuppIn (T ++ rest) (U.op (ket c₀)) := by
    refine ⟨(bl_isNodup_iff _).mpr hu_nd, fun c hc => hs'.2 c (fun hcs => hc ?_)⟩
    by_cases hcT : c ∈ T
    · exact List.mem_append_left _ hcT
    · exact List.mem_append_right _ (List.mem_filter.mpr ⟨hcs, by simpa using hcT⟩)
  have hp := U.preservesInner (ket c₀) (ket c₀) [c₀] (T ++ rest) hs hs hu hu
  have hR : innerOn rest (U.op (ket c₀)) (U.op (ket c₀)) = 0 := by
    have e1 : innerOn (T ++ rest) (U.op (ket c₀)) (U.op (ket c₀)) =
        normSqOn T (U.op (ket c₀)) + innerOn rest (U.op (ket c₀)) (U.op (ket c₀)) :=
      bl_sumList_append _ _ _
    have e2 : innerOn [c₀] (ket (R := NinthLoc6) c₀) (ket c₀) = 1 := h1
    rw [e1, e2, hnorm] at hp
    linear_combination hp
  have hz := bl_sum_trZero rest (fun c => NinthLoc6.conj (U.op (ket c₀) c) * U.op (ket c₀) c)
    (fun c _ => bl_trNonneg_normSq _) (by
      have : sumList rest (fun c => NinthLoc6.conj (U.op (ket c₀) c) * U.op (ket c₀) c) = 0 := hR
      rw [this]; exact bl_trZero_zero)
  intro c hc
  by_cases hcs : c ∈ s'
  · exact bl_eq_zero_of_trZero_normSq _ (hz c (List.mem_filter.mpr ⟨hcs, by simpa using hc⟩))
  · exact hs'.2 c hcs

/-! ## Finite superpositions of kets -/

/-- `∑ a |c⟩` over a list of (configuration, amplitude). -/
def blCombo : List (HoneycombConfig × NinthLoc6) → FockVec NinthLoc6 HoneycombConfig
  | [] => fun _ => 0
  | p :: xs => fun c => p.2 * ket p.1 c + blCombo xs c

/-- `∑ |conj a|² ` over a list of (configuration, amplitude). -/
def blNormSum : List (HoneycombConfig × NinthLoc6) → NinthLoc6
  | [] => 0
  | p :: xs => NinthLoc6.conj p.2 * p.2 + blNormSum xs

private theorem bl_combo_off (xs : List (HoneycombConfig × NinthLoc6)) (c : HoneycombConfig)
    (hc : c ∉ xs.map Prod.fst) : blCombo xs c = 0 := by
  induction xs with
  | nil => rfl
  | cons p rest ih =>
    have hne : c ≠ p.1 := fun e => hc (e ▸ List.mem_cons_self)
    have hr : c ∉ rest.map Prod.fst := fun h => hc (List.mem_cons_of_mem _ h)
    show p.2 * ket p.1 c + blCombo rest c = 0
    rw [bl_ket, ite_eq_right hne, ih hr]; ring

private theorem bl_combo_at (xs : List (HoneycombConfig × NinthLoc6)) (hnd : (xs.map Prod.fst).Nodup)
    (p : HoneycombConfig × NinthLoc6) (hp : p ∈ xs) : blCombo xs p.1 = p.2 := by
  induction xs with
  | nil => cases hp
  | cons q rest ih =>
    rw [List.map_cons, List.nodup_cons] at hnd
    show q.2 * ket q.1 p.1 + blCombo rest p.1 = p.2
    rcases List.mem_cons.mp hp with rfl | hp'
    · rw [bl_ket, ite_eq_left rfl, bl_combo_off rest _ hnd.1]; ring
    · have hne : p.1 ≠ q.1 := fun e => hnd.1 (e ▸ List.mem_map_of_mem hp')
      rw [bl_ket, ite_eq_right hne, ih hnd.2 hp']; ring

private theorem bl_normSq_eq (ψ : FockVec NinthLoc6 HoneycombConfig) (xs : List (HoneycombConfig × NinthLoc6))
    (hval : ∀ p ∈ xs, ψ p.1 = p.2) : normSqOn (xs.map Prod.fst) ψ = blNormSum xs := by
  induction xs with
  | nil => rfl
  | cons p rest ih =>
    show NinthLoc6.conj (ψ p.1) * ψ p.1 + normSqOn (rest.map Prod.fst) ψ = NinthLoc6.conj p.2 * p.2 + blNormSum rest
    rw [hval p List.mem_cons_self, ih fun q hq => hval q (List.mem_cons_of_mem _ hq)]

/-- A Fock unitary that matches a duplicate-free list of amplitudes of total squared norm `1` on
    `|c₀⟩` is that superposition, everywhere. -/
theorem bl_op_ket_eq (U : FockUnitary NinthLoc6 HoneycombConfig) (c₀ : HoneycombConfig)
    (xs : List (HoneycombConfig × NinthLoc6)) (hnd : (xs.map Prod.fst).Nodup)
    (hval : ∀ p ∈ xs, U.op (ket c₀) p.1 = p.2) (hn : blNormSum xs = 1) :
    U.op (ket c₀) = blCombo xs := by
  have hnorm : normSqOn (xs.map Prod.fst) (U.op (ket c₀)) = 1 := by rw [bl_normSq_eq _ _ hval, hn]
  funext c
  by_cases hc : c ∈ xs.map Prod.fst
  · obtain ⟨p, hp, rfl⟩ := List.mem_map.mp hc
    rw [hval p hp, bl_combo_at xs hnd p hp]
  · rw [bl_zero_off U c₀ _ hnd hnorm c hc, bl_combo_off xs c hc]

/-! ## Decoding the generated tables -/

/-- Zigzag natural to integer. -/
def blUnzig (n : Nat) : Int := if n % 2 = 0 then ((n / 2 : Nat) : Int) else -(((n + 1) / 2 : Nat) : Int)

/-- Six zigzag naturals as a number of `ℤ[ζ_9]`. -/
def blNinthOf (l : List Nat) : Ninth :=
  ⟨blUnzig (l.getD 0 0), blUnzig (l.getD 1 0), blUnzig (l.getD 2 0), blUnzig (l.getD 3 0),
    blUnzig (l.getD 4 0), blUnzig (l.getD 5 0)⟩

/-- Seven naturals `a₀ .. a₅, e` as the representative `(a₀ + a₁ z + ... + a₅ z⁵) / 6^e`. -/
def blRawOf (l : List Nat) : NinthRaw6 := ⟨blNinthOf l, l.getD 6 0⟩

/-- The number a representative stands for. -/
def blToN (x : NinthRaw6) : NinthLoc6 := Quot.mk _ x

/-- A flat table row `j, a₀ .. a₅, e, j', ...` as (index, representative) pairs. -/
def blRowsOfR : List Nat → List (Nat × NinthRaw6)
  | j :: a0 :: a1 :: a2 :: a3 :: a4 :: a5 :: e :: rest =>
    (j, blRawOf [a0, a1, a2, a3, a4, a5, e]) :: blRowsOfR rest
  | _ => []

/-- Row `i` of a generated table, as representatives. -/
def blRowsR (T : List (List Nat)) (i : Nat) : List (Nat × NinthRaw6) := blRowsOfR (T.getD i [])

/-- Row `i` of a generated table, as numbers. -/
def blRows (T : List (List Nat)) (i : Nat) : List (Nat × NinthLoc6) :=
  (blRowsR T i).map fun p => (p.1, blToN p.2)

/-- A flat family entry `slot, tone, role, ...` as vibes `(slot, tone = +1, role = 1)`. -/
def blVibesOf : List Nat → List (Nat × Bool × Bool)
  | s :: t :: r :: rest => (s, t == 1, r == 1) :: blVibesOf rest
  | _ => []

/-- The size of the declared family. -/
def blN : Nat := Generated.bareBeatFamily.length

/-- Family state `i` as its vibes at the base dock. -/
def blFam (i : Nat) : List (Nat × Bool × Bool) := blVibesOf (Generated.bareBeatFamily.getD i [])

/-- A dock holding the given vibes (`role = 1` is the Lean role `true`). -/
def blDock (vs : List (Nat × Bool × Bool)) : FullDock := fun s =>
  match vs.find? (fun v => v.1 == s.val) with
  | some (_, t, r) => .occ (if t then .pos else .neg) r
  | none => .empty

/-- The configuration with the given vibes at the base dock (frame `mat5Id`) and nothing else. -/
def blCfg (vs : List (Nat × Bool × Bool)) : HoneycombConfig := v1Config.setDock mat5Id (blDock vs)

/-- Family state `i` as a configuration of the infinite honeycomb. -/
def blCfgF (i : Nat) : HoneycombConfig := blCfg (blFam i)

/-- The vibes of a dock, read back slot by slot. -/
def blDecode (d : FullDock) : List (Nat × Bool × Bool) :=
  (List.finRange 24).filterMap fun s =>
    match d s with
    | .occ sg r => some (s.val, decide (sg = .pos), r)
    | .empty => none

/-- `∑ a |cf x⟩` over (label, amplitude) pairs, for a labelling `cf` of configurations. -/
def blComboG {α : Type} (cf : α → HoneycombConfig) (xs : List (α × NinthLoc6)) :
    FockVec NinthLoc6 HoneycombConfig :=
  blCombo (xs.map fun p => (cf p.1, p.2))

/-- `∑ a |cfg j⟩` over (family index, amplitude) pairs. -/
abbrev blComboI (xs : List (Nat × NinthLoc6)) : FockVec NinthLoc6 HoneycombConfig :=
  blComboG blCfgF xs

/-- Strictly increasing list of naturals. -/
def blSortedIdx : List Nat → Bool
  | a :: b :: r => decide (a < b) && blSortedIdx (b :: r)
  | _ => true

private theorem bl_sorted_head (a : Nat) (l : List Nat) (h : blSortedIdx (a :: l) = true) : ∀ x ∈ l, a < x := by
  induction l generalizing a with
  | nil => intro x hx; cases hx
  | cons b r ih =>
    simp only [blSortedIdx, Bool.and_eq_true, decide_eq_true_eq] at h
    intro x hx
    rcases List.mem_cons.mp hx with rfl | hx
    · exact h.1
    · exact Nat.lt_trans h.1 (ih b h.2 x hx)

private theorem bl_sorted_nodup (l : List Nat) (h : blSortedIdx l = true) : l.Nodup := by
  induction l with
  | nil => exact List.nodup_nil
  | cons a r ih =>
    rw [List.nodup_cons]
    refine ⟨fun ha => Nat.lt_irrefl a (bl_sorted_head a r h a ha), ih ?_⟩
    cases r with
    | nil => rfl
    | cons b r' =>
      simp only [blSortedIdx, Bool.and_eq_true] at h
      exact h.2

/-- Vibes back to the flat family form. -/
def blEncode : List (Nat × Bool × Bool) → List Nat
  | [] => []
  | (s, t, r) :: rest => s :: (if t then 1 else 0) :: (if r then 1 else 0) :: blEncode rest

/-- Every family state reads back from its dock. -/
theorem bl_family_decodes :
    Generated.bareBeatFamily.all (fun raw => blEncode (blDecode (blDock (blVibesOf raw))) == raw) = true := by
  decide +kernel

/-- Lexicographic order on lists of naturals (a proper prefix is smaller). -/
def blLexLt : List Nat → List Nat → Bool
  | [], [] => false
  | [], _ :: _ => true
  | _ :: _, [] => false
  | a :: as, b :: bs => decide (a < b) || (decide (a = b) && blLexLt as bs)

private theorem bl_lex_irrefl (l : List Nat) : blLexLt l l = false := by
  induction l with
  | nil => rfl
  | cons a as ih => simp [blLexLt, ih]

private theorem bl_lex_trans (a b c : List Nat) (h1 : blLexLt a b = true) (h2 : blLexLt b c = true) :
    blLexLt a c = true := by
  induction a generalizing b c with
  | nil =>
    cases b with
    | nil => simp [blLexLt] at h1
    | cons y ys => cases c with
      | nil => simp [blLexLt] at h2
      | cons z zs => rfl
  | cons x xs ih =>
    cases b with
    | nil => simp [blLexLt] at h1
    | cons y ys =>
      cases c with
      | nil => simp [blLexLt] at h2
      | cons z zs =>
        simp only [blLexLt, Bool.or_eq_true, Bool.and_eq_true, decide_eq_true_eq] at h1 h2 ⊢
        rcases h1 with h1 | ⟨rfl, h1⟩ <;> rcases h2 with h2 | ⟨rfl, h2⟩
        · exact Or.inl (Nat.lt_trans h1 h2)
        · exact Or.inl h1
        · exact Or.inl h2
        · exact Or.inr ⟨rfl, ih ys zs h1 h2⟩

/-- Adjacent entries strictly increase in `blLexLt`. -/
def blLexChain : List (List Nat) → Bool
  | a :: b :: r => blLexLt a b && blLexChain (b :: r)
  | _ => true

private theorem bl_lex_head (a : List Nat) (l : List (List Nat)) (h : blLexChain (a :: l) = true) :
    ∀ x ∈ l, blLexLt a x = true := by
  induction l generalizing a with
  | nil => intro x hx; cases hx
  | cons b r ih =>
    simp only [blLexChain, Bool.and_eq_true] at h
    intro x hx
    rcases List.mem_cons.mp hx with rfl | hx
    · exact h.1
    · exact bl_lex_trans _ _ _ h.1 (ih b h.2 x hx)

private theorem bl_lex_nodup (l : List (List Nat)) (h : blLexChain l = true) : l.Nodup := by
  induction l with
  | nil => exact List.nodup_nil
  | cons a r ih =>
    rw [List.nodup_cons]
    refine ⟨fun ha => (by have := bl_lex_head a r h a ha; rw [bl_lex_irrefl] at this; cases this), ih ?_⟩
    cases r with
    | nil => rfl
    | cons b r' =>
      simp only [blLexChain, Bool.and_eq_true] at h
      exact h.2

/-- The family is listed in strictly increasing lexicographic order. -/
theorem bl_family_chain : blLexChain Generated.bareBeatFamily = true := by
  decide +kernel

/-- The family states are distinct. -/
theorem bl_family_nodup : Generated.bareBeatFamily.Nodup :=
  bl_lex_nodup _ bl_family_chain

private theorem bl_lookup_cfg (vs : List (Nat × Bool × Bool)) : (blCfg vs).lookup mat5Id = blDock vs := by
  unfold blCfg; rw [lookup_setDock, ite_eq_left rfl]

/-- Distinct family indices are distinct configurations. -/
theorem bl_cfg_inj (i j : Nat) (hi : i < blN) (hj : j < blN) (h : blCfgF i = blCfgF j) : i = j := by
  have hd : blDock (blFam i) = blDock (blFam j) := by
    rw [← bl_lookup_cfg, ← bl_lookup_cfg]; exact congrArg (fun c => c.lookup mat5Id) h
  have hdec := bl_family_decodes
  rw [List.all_eq_true] at hdec
  have ei : Generated.bareBeatFamily.getD i [] = Generated.bareBeatFamily[i] := List.getD_eq_getElem _ _ hi
  have ej : Generated.bareBeatFamily.getD j [] = Generated.bareBeatFamily[j] := List.getD_eq_getElem _ _ hj
  have hfi := hdec _ (List.getElem_mem hi)
  have hfj := hdec _ (List.getElem_mem hj)
  simp only [beq_iff_eq] at hfi hfj
  have hf : Generated.bareBeatFamily[i] = Generated.bareBeatFamily[j] := by
    rw [← hfi, ← hfj]
    have := congrArg (fun d => blEncode (blDecode d)) hd
    simpa only [blFam, ei, ej] using this
  exact (List.Nodup.getElem_inj_iff bl_family_nodup).mp hf

/-- The check of one family state against a table row for a layer `L`: every row index is in the
    family, the indices increase, `L |cfg i⟩` has each row's amplitude at the row's configuration, and the
    row's squared norm is `1`. -/
def blLayerOk (L : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig)
    (T : List (List Nat)) (i : Nat) : Bool :=
  let rows := blRows T i
  rows.all (fun p => decide (p.1 < blN) &&
      decide (NinthLoc6.isZero (NinthLoc6.sub (L (ket (blCfgF i)) (blCfgF p.1)) p.2))) &&
    blSortedIdx (rows.map Prod.fst) &&
    decide (NinthLoc6.isZero (NinthLoc6.sub (blNormSum (rows.map fun p => (blCfgF p.1, p.2))) 1))

/-- A passing check makes the Lean layer equal the table row as a vector of the Fock space. -/
theorem bl_layer_of_ok (U : FockUnitary NinthLoc6 HoneycombConfig) (T : List (List Nat)) (i : Nat)
    (h : blLayerOk U.op T i = true) : U.op (ket (blCfgF i)) = blComboI (blRows T i) := by
  simp only [blLayerOk, Bool.and_eq_true, List.all_eq_true, decide_eq_true_eq] at h
  obtain ⟨⟨hrows, hsort⟩, hnorm⟩ := h
  apply bl_op_ket_eq
  · have hnd := bl_sorted_nodup _ hsort
    have he : ((blRows T i).map fun p => (blCfgF p.1, p.2)).map Prod.fst =
        ((blRows T i).map Prod.fst).map blCfgF := by
      rw [List.map_map, List.map_map]; rfl
    rw [he]
    refine List.Nodup.map_on ?_ hnd
    intro x hx y hy hxy
    obtain ⟨p, hp, rfl⟩ := List.mem_map.mp hx
    obtain ⟨q, hq, rfl⟩ := List.mem_map.mp hy
    exact bl_cfg_inj _ _ (hrows p hp).1 (hrows q hq).1 hxy
  · intro p hp
    obtain ⟨q, hq, rfl⟩ := List.mem_map.mp hp
    exact bl_eq_of_isZero (hrows q hq).2
  · exact bl_eq_of_isZero hnorm

/-! ## Linearity of the Lean layers -/

/-- A map of Fock vectors that is linear: `f (a ψ + φ) = a f ψ + f φ`. -/
def BLin (f : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ (a : NinthLoc6) (ψ φ : FockVec NinthLoc6 HoneycombConfig),
    f (fun c => a * ψ c + φ c) = fun c => a * f ψ c + f φ c

theorem bl_lin_zero {f : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig}
    (hf : BLin f) : f (fun _ => 0) = fun _ => 0 := by
  have h := hf (-1) (fun _ => 0) (fun _ => 0)
  have e : (fun c : HoneycombConfig => (-1 : NinthLoc6) * (fun _ => (0 : NinthLoc6)) c + (fun _ => 0) c) =
      fun _ => 0 := by funext c; ring
  rw [e] at h
  rw [h]; funext c; ring

theorem bl_lin_id : BLin (fun ψ => ψ) := fun _ _ _ => rfl

theorem bl_lin_comp {f g : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig}
    (hf : BLin f) (hg : BLin g) : BLin (fun ψ => f (g ψ)) := by
  intro a ψ φ
  show f (g (fun c => a * ψ c + φ c)) = _
  rw [hg, hf]

private theorem bl_lin_composeLines (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l, BLin (f l).op) : ∀ ls : List (Fin 12), BLin (composeLines f ls).op
  | [] => bl_lin_id
  | l :: ls => show BLin (fun ψ => (f l).op ((composeLines f ls).op ψ)) from
      bl_lin_comp (hf l) (bl_lin_composeLines f hf ls)

private theorem bl_lin_applySites (F : LocalSiteFamily) (hF : ∀ g, BLin (F.unit g).op) :
    ∀ gs : List Mat5, BLin (applySites F gs)
  | [] => bl_lin_id
  | g :: gs => show BLin (fun ψ => (F.unit g).op (applySites F gs ψ)) from
      bl_lin_comp (hF g) (bl_lin_applySites F hF gs)

private theorem bl_lin_global (F : LocalSiteFamily) (hF : ∀ g, BLin (F.unit g).op) :
    BLin (globalUnitary F).op := by
  intro a ψ φ
  funext c
  show applySites F c.activeDocks (fun c => a * ψ c + φ c) c =
    a * applySites F c.activeDocks ψ c + applySites F c.activeDocks φ c
  rw [bl_lin_applySites F hF c.activeDocks]

private theorem bl_lin_lineHalfCoin (g : Mat5) (l : Fin 12) : BLin (lineHalfCoinUnit g l).op := by
  intro a ψ φ; funext c
  simp only [lineHalfCoinUnit_op]
  split_ifs <;> simp only [bl_mul, bl_add] <;> ring

private theorem bl_lin_lineMeet (g : Mat5) (l : Fin 12) : BLin (lineMeetUnit g l).op := by
  intro a ψ φ; funext c
  simp only [lineMeetUnit_op]
  split_ifs <;> simp only [bl_mul, bl_add] <;> ring

private theorem bl_lin_lineBounce (g : Mat5) (l : Fin 12) : BLin (lineBounceKUnit g l).op := by
  intro a ψ φ; funext c
  simp only [lineBounceKUnit_op]
  split_ifs <;> simp only [bl_mul] <;> ring

private theorem bl_sum12_lin (a : NinthLoc6) (f g : Fin 12 → NinthLoc6) :
    sumFin12 (fun m => a * f m + g m) = a * sumFin12 f + sumFin12 g := by
  have h1 := sumFin12_add (R := NinthLoc6) (fun m => a * f m) g
  have h2 := sumFin12_mul_left (R := NinthLoc6) a f
  exact h1.trans (congrArg (fun x => x + sumFin12 g) h2)

private theorem bl_lin_siteMPair (g : Mat5) : BLin (siteMPairUnit g).op := by
  intro a ψ φ; funext c
  simp only [siteMPairUnit_op]
  split_ifs
  · rw [bl_sum12_lin]; simp only [bl_mul, bl_add]; ring
  · rfl

theorem bl_lin_halfCoin : BLin fockHalfCoin :=
  bl_lin_global halfCoinFamily fun g =>
    show BLin (composeLines (lineHalfCoinUnit g) (List.finRange 12)).op from
      bl_lin_composeLines _ (bl_lin_lineHalfCoin g) _

theorem bl_lin_meet : BLin fockMeet :=
  bl_lin_global meetFamily fun g =>
    show BLin (composeLines (lineMeetUnit g) (List.finRange 12)).op from
      bl_lin_composeLines _ (bl_lin_lineMeet g) _

theorem bl_lin_bounce : BLin fockBounceK :=
  bl_lin_global bounceKFamily fun g =>
    show BLin (composeLines (lineBounceKUnit g) (List.finRange 12)).op from
      bl_lin_composeLines _ (bl_lin_lineBounce g) _

theorem bl_lin_mpair : BLin fockMPair :=
  bl_lin_global mpairFamily fun g => show BLin (siteMPairUnit g).op from bl_lin_siteMPair g

theorem bl_lin_phi (χ : ChiralInvariant) : BLin (fockPhiOdd χ) :=
  bl_lin_global (phiOddFamily χ) fun g => show BLin (sitePhiOddUnit χ g).op by
    intro a ψ φ; funext c
    simp only [sitePhiOddUnit_op]
    show NinthLoc6.zeta6Pow _ * (a * ψ c + φ c) = a * (NinthLoc6.zeta6Pow _ * ψ c) + NinthLoc6.zeta6Pow _ * φ c
    ring

theorem bl_lin_stream : BLin fockStream := fun _ _ _ => rfl

/-! ## Superpositions through a linear layer -/

/-- Apply a table `G` (label to rows) to a superposition, without merging repeated labels. -/
def blApplyG {α : Type} (G : α → List (α × NinthLoc6)) (xs : List (α × NinthLoc6)) : List (α × NinthLoc6) :=
  xs.flatMap fun p => (G p.1).map fun q => (q.1, p.2 * q.2)

private theorem bl_comboG_append {α : Type} (cf : α → HoneycombConfig) (ys zs : List (α × NinthLoc6))
    (c : HoneycombConfig) : blComboG cf (ys ++ zs) c = blComboG cf ys c + blComboG cf zs c := by
  induction ys with
  | nil => show blComboG cf zs c = 0 + blComboG cf zs c; ring
  | cons q ys ih =>
    show q.2 * ket (cf q.1) c + blComboG cf (ys ++ zs) c = (q.2 * ket (cf q.1) c + blComboG cf ys c) + _
    rw [ih]; ring

private theorem bl_comboG_scale {α : Type} (cf : α → HoneycombConfig) (a : NinthLoc6)
    (ys : List (α × NinthLoc6)) (c : HoneycombConfig) :
    blComboG cf (ys.map fun q => (q.1, a * q.2)) c = a * blComboG cf ys c := by
  induction ys with
  | nil => show (0 : NinthLoc6) = a * 0; ring
  | cons q ys ih =>
    show a * q.2 * ket (cf q.1) c + blComboG cf (ys.map fun q => (q.1, a * q.2)) c =
      a * (q.2 * ket (cf q.1) c + blComboG cf ys c)
    rw [ih]; ring

/-- A linear layer carries a superposition to the superposition of the images of its kets. -/
theorem bl_lin_comboG {α : Type} {f : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig}
    (hf : BLin f) (cf : α → HoneycombConfig) (G : α → List (α × NinthLoc6)) (xs : List (α × NinthLoc6))
    (hg : ∀ p ∈ xs, f (ket (cf p.1)) = blComboG cf (G p.1)) :
    f (blComboG cf xs) = blComboG cf (blApplyG G xs) := by
  induction xs with
  | nil => exact bl_lin_zero hf
  | cons p xs ih =>
    have e : blComboG cf (p :: xs) = fun c => p.2 * ket (cf p.1) c + blComboG cf xs c := rfl
    rw [e, hf, hg p List.mem_cons_self, ih fun q hq => hg q (List.mem_cons_of_mem _ hq)]
    funext c
    show _ = blComboG cf (((G p.1).map fun q => (q.1, p.2 * q.2)) ++ blApplyG G xs) c
    rw [bl_comboG_append, bl_comboG_scale]

/-! ### The same on representatives (exponents stay small: products add them, nothing else does) -/

/-- Product of representatives. -/
def blRMul (x y : NinthRaw6) : NinthRaw6 := ⟨Ninth.mul x.num y.num, x.exp + y.exp⟩

/-- A labelled list of representatives as a labelled list of numbers. -/
def blToNL {α : Type} (xs : List (α × NinthRaw6)) : List (α × NinthLoc6) := xs.map fun p => (p.1, blToN p.2)

/-- `∑ a |cf x⟩` over (label, representative) pairs. -/
def blComboR {α : Type} (cf : α → HoneycombConfig) (xs : List (α × NinthRaw6)) :
    FockVec NinthLoc6 HoneycombConfig :=
  blComboG cf (blToNL xs)

/-- Apply a table of representatives to a superposition of representatives. -/
def blApplyR {α : Type} (G : α → List (α × NinthRaw6)) (xs : List (α × NinthRaw6)) : List (α × NinthRaw6) :=
  xs.flatMap fun p => (G p.1).map fun q => (q.1, blRMul p.2 q.2)

private theorem bl_toNL_apply {α : Type} (G : α → List (α × NinthRaw6)) (xs : List (α × NinthRaw6)) :
    blToNL (blApplyR G xs) = blApplyG (fun a => blToNL (G a)) (blToNL xs) := by
  induction xs with
  | nil => rfl
  | cons p xs ih =>
    show blToNL ((G p.1).map (fun q => (q.1, blRMul p.2 q.2)) ++ blApplyR G xs) =
      (blToNL (G p.1)).map (fun q => (q.1, blToN p.2 * q.2)) ++ blApplyG (fun a => blToNL (G a)) (blToNL xs)
    rw [← ih]
    unfold blToNL
    rw [List.map_append, List.map_map, List.map_map]
    rfl

/-- A linear layer on superpositions of representatives. -/
theorem bl_lin_comboR {α : Type} {f : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig}
    (hf : BLin f) (cf : α → HoneycombConfig) (G : α → List (α × NinthRaw6)) (xs : List (α × NinthRaw6))
    (hg : ∀ p ∈ xs, f (ket (cf p.1)) = blComboR cf (G p.1)) :
    f (blComboR cf xs) = blComboR cf (blApplyR G xs) := by
  unfold blComboR
  rw [bl_toNL_apply]
  apply bl_lin_comboG hf cf (fun a => blToNL (G a)) (blToNL xs)
  intro p hp
  obtain ⟨q, hq, rfl⟩ := List.mem_map.mp hp
  exact hg q hq

/-- A table carries the family to the family. -/
def BlClosed (T : List (List Nat)) : Prop := ∀ k < blN, ∀ q ∈ blRowsR T k, q.1 < blN

/-- One layer step on family superpositions. -/
theorem bl_step {f : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig}
    (hf : BLin f) (T : List (List Nat)) (hT : ∀ k < blN, f (ket (blCfgF k)) = blComboR blCfgF (blRowsR T k))
    (hc : BlClosed T) (xs : List (Nat × NinthRaw6)) (hxs : ∀ p ∈ xs, p.1 < blN) :
    f (blComboR blCfgF xs) = blComboR blCfgF (blApplyR (blRowsR T) xs) ∧
      ∀ p ∈ blApplyR (blRowsR T) xs, p.1 < blN := by
  refine ⟨bl_lin_comboR hf blCfgF (blRowsR T) xs fun p hp => hT p.1 (hxs p hp), ?_⟩
  intro p hp
  obtain ⟨q, hq, hpq⟩ := List.mem_flatMap.mp hp
  obtain ⟨r, hr, rfl⟩ := List.mem_map.mp hpq
  exact hc q.1 (hxs q hq) r hr

/-- The table-wide check for a layer. -/
def blTableOk (L : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig)
    (T : List (List Nat)) : Bool :=
  (List.range blN).all (blLayerOk L T)

theorem bl_table_of_ok (U : FockUnitary NinthLoc6 HoneycombConfig) (T : List (List Nat))
    (h : blTableOk U.op T = true) :
    (∀ k < blN, U.op (ket (blCfgF k)) = blComboR blCfgF (blRowsR T k)) ∧ BlClosed T := by
  rw [blTableOk, List.all_eq_true] at h
  refine ⟨fun k hk => bl_layer_of_ok U T k (h k (List.mem_range.mpr hk)), fun k hk q hq => ?_⟩
  have hk' := h k (List.mem_range.mpr hk)
  simp only [blLayerOk, Bool.and_eq_true, List.all_eq_true, decide_eq_true_eq] at hk'
  exact (hk'.1.1 (q.1, blToN q.2) (List.mem_map_of_mem hq)).1

/-! ## `Φ_odd` is silent on the family -/

/-- Occupied slots of a dock. -/
def blOcc (d : FullDock) : Nat := ((List.finRange 24).filter fun s => decide (d s ≠ .empty)).length

/-- A chiral invariant that vanishes on every dock with fewer than 4 excitations. bare-beat.ts's
    `chi_odd` is a sum over the 4-subsets of a dock's vibes, so it is such an invariant. -/
def BlSilent (χ : ChiralInvariant) : Prop := ∀ d : FullDock, blOcc d < 4 → χ.chi d = 0

private theorem bl_phi_sites (χ : ChiralInvariant) (c : HoneycombConfig) :
    ∀ gs : List Mat5, ∃ p : NinthLoc6, ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
      applySites (phiOddFamily χ) gs ψ c = p * ψ c
  | [] => ⟨1, fun ψ => by show ψ c = 1 * ψ c; ring⟩
  | g :: gs => by
    obtain ⟨p, hp⟩ := bl_phi_sites χ c gs
    refine ⟨NinthLoc6.zeta6Pow (dockParity g * χ.chi (c.lookup g)) * p, fun ψ => ?_⟩
    show (sitePhiOddUnit χ g).op (applySites (phiOddFamily χ) gs ψ) c = _
    rw [sitePhiOddUnit_op, hp]
    show _ * (p * ψ c) = _
    ring

private theorem bl_phi_silent_sites (χ : ChiralInvariant) (c : HoneycombConfig) :
    ∀ gs : List Mat5, (∀ g ∈ gs, χ.chi (c.lookup g) = 0) →
      ∀ ψ : FockVec NinthLoc6 HoneycombConfig, applySites (phiOddFamily χ) gs ψ c = ψ c
  | [] => fun _ _ => rfl
  | g :: gs => fun h ψ => by
    show (sitePhiOddUnit χ g).op (applySites (phiOddFamily χ) gs ψ) c = ψ c
    rw [sitePhiOddUnit_op, bl_phi_silent_sites χ c gs (fun g' hg' => h g' (List.mem_cons_of_mem _ hg')) ψ,
      h g List.mem_cons_self, Int.mul_zero]
    show NinthLoc6.zeta6Pow 0 * ψ c = ψ c
    have e : NinthLoc6.zeta6Pow 0 = 1 := rfl
    rw [e, one_mul]

/-- For a silent `χ`, `Φ_odd` fixes the ket of any configuration whose docks hold fewer than 4
    excitations. -/
theorem bl_phi_ket (χ : ChiralInvariant) (hχ : BlSilent χ) (c₀ : HoneycombConfig)
    (h0 : ∀ g ∈ c₀.activeDocks, blOcc (c₀.lookup g) < 4) : fockPhiOdd χ (ket c₀) = ket c₀ := by
  funext c
  show applySites (phiOddFamily χ) c.activeDocks (ket c₀) c = ket c₀ c
  by_cases hc : c = c₀
  · subst hc; exact bl_phi_silent_sites χ c c.activeDocks (fun g hg => hχ _ (h0 g hg)) _
  · obtain ⟨p, hp⟩ := bl_phi_sites χ c c.activeDocks
    rw [hp, bl_ket, ite_eq_right hc]; ring

private theorem bl_cfg_active (vs : List (Nat × Bool × Bool)) (g : Mat5) (hg : g ∈ (blCfg vs).activeDocks) :
    g = mat5Id := by
  have h := (mem_activeDocks_iff _ g).mp hg
  unfold blCfg at h
  rw [lookup_setDock] at h
  by_cases e : g = mat5Id
  · exact e
  · rw [ite_eq_right e] at h; exact absurd rfl h

/-- Every family state holds at most 2 excitations at its one dock. -/
theorem bl_family_small :
    Generated.bareBeatFamily.all (fun raw => decide (blOcc (blDock (blVibesOf raw)) < 4)) = true := by
  decide +kernel

private theorem bl_fam_getD (i : Nat) (hi : i < blN) :
    Generated.bareBeatFamily.getD i [] ∈ Generated.bareBeatFamily := by
  rw [List.getD_eq_getElem _ _ hi]; exact List.getElem_mem hi

theorem bl_phi_family (χ : ChiralInvariant) (hχ : BlSilent χ) (k : Nat) (hk : k < blN) :
    fockPhiOdd χ (ket (blCfgF k)) = ket (blCfgF k) := by
  apply bl_phi_ket χ hχ
  intro g hg
  have e := bl_cfg_active _ g hg
  subst e
  unfold blCfgF; rw [bl_lookup_cfg]
  have h := bl_family_small
  rw [List.all_eq_true] at h
  have := h _ (bl_fam_getD k hk)
  simp only [decide_eq_true_eq] at this
  exact this

/-- The `phi` table of the code is the identity on the family: row `k` is `(k, 1)` alone. -/
def blPhiRowOk (T : List (List Nat)) (k : Nat) : Bool :=
  match blRowsR T k with
  | [(j, a)] => decide (j = k) && decide (NinthRaw6.equiv a ⟨Ninth.one, 0⟩)
  | _ => false

private theorem bl_phi_row (T : List (List Nat)) (k : Nat) (h : blPhiRowOk T k = true) :
    blComboR blCfgF (blRowsR T k) = ket (blCfgF k) ∧ ∀ q ∈ blRowsR T k, q.1 = k := by
  unfold blPhiRowOk at h
  split at h
  · rename_i j a heq
    simp only [Bool.and_eq_true, decide_eq_true_eq] at h
    obtain ⟨rfl, ha⟩ := h
    have ha' : blToN a = 1 := Quot.sound ha
    rw [heq]
    refine ⟨?_, fun q hq => by rw [List.mem_singleton.mp hq]⟩
    funext c
    show blToN a * ket (blCfgF j) c + 0 = ket (blCfgF j) c
    rw [ha']; ring
  · exact absurd h (by simp)

/-! ## Comparing two superpositions by their coefficients -/

private theorem bl_pow6_add (a b : Nat) : pow6 (a + b) = pow6 a * pow6 b := by
  induction a with
  | zero => simp only [Nat.zero_add, pow6, Int.one_mul]
  | succ k ih =>
    rw [show k + 1 + b = (k + b) + 1 by omega]
    simp only [pow6]; rw [ih, Int.mul_assoc]

/-- Sum of representatives on the larger of the two exponents. -/
def blRAdd (x y : NinthRaw6) : NinthRaw6 :=
  if x.exp ≤ y.exp then ⟨Ninth.add (Ninth.scale (pow6 (y.exp - x.exp)) x.num) y.num, y.exp⟩
  else ⟨Ninth.add x.num (Ninth.scale (pow6 (x.exp - y.exp)) y.num), x.exp⟩

theorem bl_toN_add (x y : NinthRaw6) : blToN (blRAdd x y) = blToN x + blToN y := by
  show Quot.mk _ (blRAdd x y) = Quot.mk _ (NinthLoc6.rawAdd x y)
  apply Quot.sound
  obtain ⟨⟨a0, a1, a2, a3, a4, a5⟩, e1⟩ := x
  obtain ⟨⟨b0, b1, b2, b3, b4, b5⟩, e2⟩ := y
  unfold blRAdd NinthRaw6.equiv NinthLoc6.rawAdd
  dsimp only
  split_ifs with h
  · obtain ⟨d, rfl⟩ : ∃ d, e2 = e1 + d := ⟨e2 - e1, by omega⟩
    simp only [Nat.add_sub_cancel_left, bl_pow6_add, Ninth.scale, Ninth.add, Ninth.mk.injEq]
    refine ⟨by ring, by ring, by ring, by ring, by ring, by ring⟩
  · obtain ⟨d, rfl⟩ : ∃ d, e1 = e2 + d := ⟨e1 - e2, by omega⟩
    simp only [Nat.add_sub_cancel_left, bl_pow6_add, Ninth.scale, Ninth.add, Ninth.mk.injEq]
    refine ⟨by ring, by ring, by ring, by ring, by ring, by ring⟩

/-- The total coefficient of label `j` in a superposition. -/
def blCoefR {α : Type} [DecidableEq α] : List (α × NinthRaw6) → α → NinthRaw6
  | [], _ => ⟨Ninth.zero, 0⟩
  | p :: r, j => if p.1 = j then blRAdd p.2 (blCoefR r j) else blCoefR r j

/-- Two superpositions have equal coefficients on every label either one carries. -/
def blSameR {α : Type} [DecidableEq α] (xs ys : List (α × NinthRaw6)) : Bool :=
  (xs.map Prod.fst ++ ys.map Prod.fst).all fun j => decide (NinthRaw6.equiv (blCoefR xs j) (blCoefR ys j))

private theorem bl_comboR_eval {α : Type} [DecidableEq α] (cf : α → HoneycombConfig) (P : α → Prop)
    (inj : ∀ x y, P x → P y → cf x = cf y → x = y) (xs : List (α × NinthRaw6)) (hx : ∀ p ∈ xs, P p.1)
    (j : α) (hj : P j) : blComboR cf xs (cf j) = blToN (blCoefR xs j) := by
  induction xs with
  | nil => rfl
  | cons p r ih =>
    have ih' := ih fun q hq => hx q (List.mem_cons_of_mem _ hq)
    show blToN p.2 * ket (cf p.1) (cf j) + blComboR cf r (cf j) =
      blToN (if p.1 = j then blRAdd p.2 (blCoefR r j) else blCoefR r j)
    by_cases hpj : p.1 = j
    · rw [bl_ket, ite_eq_left (by rw [hpj]), ih', ite_eq_left hpj, bl_toN_add]; ring
    · have hne : cf j ≠ cf p.1 := fun e => hpj (inj _ _ (hx p List.mem_cons_self) hj e.symm)
      rw [bl_ket, ite_eq_right hne, ih', ite_eq_right hpj]; ring

private theorem bl_comboR_off {α : Type} (cf : α → HoneycombConfig) (xs : List (α × NinthRaw6))
    (c : HoneycombConfig) (h : ∀ p ∈ xs, cf p.1 ≠ c) : blComboR cf xs c = 0 := by
  induction xs with
  | nil => rfl
  | cons p r ih =>
    show blToN p.2 * ket (cf p.1) c + blComboR cf r c = 0
    rw [bl_ket, ite_eq_right (fun e => h p List.mem_cons_self e.symm),
      ih fun q hq => h q (List.mem_cons_of_mem _ hq)]
    ring

/-- Equal coefficients make equal vectors, for a labelling injective on the labels used. -/
theorem bl_comboR_eq_of_same {α : Type} [DecidableEq α] (cf : α → HoneycombConfig) (P : α → Prop)
    (inj : ∀ x y, P x → P y → cf x = cf y → x = y) (xs ys : List (α × NinthRaw6))
    (hx : ∀ p ∈ xs, P p.1) (hy : ∀ p ∈ ys, P p.1) (h : blSameR xs ys = true) :
    blComboR cf xs = blComboR cf ys := by
  funext c
  by_cases hc : ∃ j ∈ xs.map Prod.fst ++ ys.map Prod.fst, cf j = c
  · obtain ⟨j, hj, rfl⟩ := hc
    have hPj : P j := by
      rcases List.mem_append.mp hj with h' | h'
      · obtain ⟨p, hp, rfl⟩ := List.mem_map.mp h'; exact hx p hp
      · obtain ⟨p, hp, rfl⟩ := List.mem_map.mp h'; exact hy p hp
    rw [bl_comboR_eval cf P inj xs hx j hPj, bl_comboR_eval cf P inj ys hy j hPj]
    rw [blSameR, List.all_eq_true] at h
    exact Quot.sound (of_decide_eq_true (h j hj))
  · rw [bl_comboR_off cf xs c fun p hp e => hc ⟨p.1, List.mem_append_left _ (List.mem_map_of_mem hp), e⟩,
      bl_comboR_off cf ys c fun p hp e => hc ⟨p.1, List.mem_append_right _ (List.mem_map_of_mem hp), e⟩]

/-! ## The bridges: coefficients and layer order -/

/-- The `k`-th exported `Z9` constant. -/
def blZ9 (k : Nat) : Ninth := blNinthOf (Generated.bareBeatZ9.getD k [])

/-- The `k`-th coefficient the layers produced. -/
def blCoeff (k : Nat) : NinthLoc6 := blToN (blRawOf (Generated.bareBeatCoeffs.getD k []))

/-- **Coefficient bridge.** bare-beat.ts's `Z9_COIN_DIAG, Z9_COIN_OFF, Z9_MEET_SWAP` over the half-coin and
    meet denominator 2, `Z9_ZETA18`, `Z9_ZETA6`, `Z9_OMEGA` are the Fock constants, and the coefficients the
    layers produce on witness states (coin diagonal and off-diagonal, full-line phase, bounce sign, equal-role
    phase, meet keep and swap, pair keep and hop) are the Lean gate coefficients. -/
theorem gen_bare_beat_coeffs_eq :
    NinthLoc6.coinDiag = blToN ⟨blZ9 0, 0⟩ * NinthLoc6.inv2 ∧
    NinthLoc6.coinOff = blToN ⟨blZ9 1, 0⟩ * NinthLoc6.inv2 ∧
    NinthLoc6.meetSwap = blToN ⟨blZ9 2, 0⟩ * NinthLoc6.inv2 ∧
    NinthLoc6.zeta18 = blToN ⟨blZ9 3, 0⟩ ∧
    NinthLoc6.zeta6 = blToN ⟨blZ9 4, 0⟩ ∧
    NinthLoc6.omega = blToN ⟨blZ9 5, 0⟩ ∧
    Generated.bareBeatCoeffNames = ["coin_diag", "coin_off", "full_line_phase", "bounce_sign",
      "meet_equal_role_phase", "meet_keep", "meet_swap", "pair_keep", "pair_hop"] ∧
    blCoeff 0 = NinthLoc6.coinDiag ∧ blCoeff 1 = NinthLoc6.coinOff ∧ blCoeff 2 = NinthLoc6.zeta6 ∧
    blCoeff 3 = NinthLoc6.neg NinthLoc6.one ∧ blCoeff 4 = NinthLoc6.omega ∧
    blCoeff 5 = NinthLoc6.meetKeep ∧ blCoeff 6 = NinthLoc6.meetSwap ∧
    blCoeff 7 = NinthLoc6.add NinthLoc6.one NinthLoc6.pairHop ∧ blCoeff 8 = NinthLoc6.pairHop := by
  refine ⟨bl_eq_of_isZero (by decide +kernel), bl_eq_of_isZero (by decide +kernel),
    bl_eq_of_isZero (by decide +kernel), bl_eq_of_isZero (by decide +kernel),
    bl_eq_of_isZero (by decide +kernel), bl_eq_of_isZero (by decide +kernel), by decide +kernel,
    bl_eq_of_isZero (by decide +kernel), bl_eq_of_isZero (by decide +kernel),
    bl_eq_of_isZero (by decide +kernel), bl_eq_of_isZero (by decide +kernel),
    bl_eq_of_isZero (by decide +kernel), bl_eq_of_isZero (by decide +kernel),
    bl_eq_of_isZero (by decide +kernel), bl_eq_of_isZero (by decide +kernel),
    bl_eq_of_isZero (by decide +kernel)⟩

/-- **Layer order bridge.** `BEAT_LAYER_NAMES` and `BEAT_LAYERS` list the layers in the order `fockBeat`
    composes them: `Φ_odd, D, K, M_pair(ζ_18), M_meet, D, Φ_odd, S`. -/
theorem gen_bare_beat_layers_eq :
    Generated.bareBeatLayerNames = ["Phi_odd", "D", "K", "M_pair(zeta_18)", "M_meet", "D", "Phi_odd", "S"] ∧
    Generated.bareBeatLayerFunctions = ["applyOddChiralPhase", "applyHalfCoinD", "applyOppositeSignBounce",
      "applyPairLineMixer", "applyRoleMeet", "applyHalfCoinD", "applyOddChiralPhase", "applyStream"] ∧
    ∀ (χ : ChiralInvariant) (ψ : FockVec NinthLoc6 HoneycombConfig),
      fockBeat χ ψ = fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK
        (fockHalfCoin (fockPhiOdd χ ψ))))))) :=
  ⟨by decide, by decide, fun _ _ => rfl⟩

/-! ## The bridges: the five dock-local layers on the family -/

theorem bl_coin_ok : blTableOk fockHalfCoin Generated.bareBeatLayer_coin = true := by decide +kernel

theorem bl_bounce_ok : blTableOk fockBounceK Generated.bareBeatLayer_bounce = true := by decide +kernel

theorem bl_pair_ok : blTableOk fockMPair Generated.bareBeatLayer_pair = true := by decide +kernel

theorem bl_meet_ok : blTableOk fockMeet Generated.bareBeatLayer_meet = true := by decide +kernel

theorem bl_phi_ok : (List.range blN).all (blPhiRowOk Generated.bareBeatLayer_phi) = true := by decide +kernel

/-- **Layer bridge.** On every family state, each dock-local layer of bare-beat.ts (its exported table)
    is the Lean layer, as a vector of the Fock space: `fockHalfCoin` (D), `fockBounceK` (K), `fockMPair`
    (`M_pair(ζ_18)`), `fockMeet` (`M_meet`), and `fockPhiOdd χ` for every silent `χ` (`Φ_odd`, the identity
    on the family). -/
theorem gen_bare_beat_family_eq (χ : ChiralInvariant) (hχ : BlSilent χ) (k : Nat) (hk : k < blN) :
    fockHalfCoin (ket (blCfgF k)) = blComboR blCfgF (blRowsR Generated.bareBeatLayer_coin k) ∧
    fockBounceK (ket (blCfgF k)) = blComboR blCfgF (blRowsR Generated.bareBeatLayer_bounce k) ∧
    fockMPair (ket (blCfgF k)) = blComboR blCfgF (blRowsR Generated.bareBeatLayer_pair k) ∧
    fockMeet (ket (blCfgF k)) = blComboR blCfgF (blRowsR Generated.bareBeatLayer_meet k) ∧
    fockPhiOdd χ (ket (blCfgF k)) = blComboR blCfgF (blRowsR Generated.bareBeatLayer_phi k) := by
  have hphi := bl_phi_ok
  rw [List.all_eq_true] at hphi
  refine ⟨(bl_table_of_ok fockHalfCoinUnit _ bl_coin_ok).1 k hk,
    (bl_table_of_ok fockBounceKUnit _ bl_bounce_ok).1 k hk,
    (bl_table_of_ok fockMPairUnit _ bl_pair_ok).1 k hk,
    (bl_table_of_ok fockMeetUnit _ bl_meet_ok).1 k hk, ?_⟩
  rw [bl_phi_family χ hχ k hk, (bl_phi_row _ k (hphi k (List.mem_range.mpr hk))).1]

/-! ## The bridge: the whole beat on the family -/

/-- The seven dock-local layer tables of the code, composed in `BEAT_LAYERS` order on family state `i`
    (repeated configurations are not merged). -/
def blChain (i : Nat) : List (Nat × NinthRaw6) :=
  blApplyR (blRowsR Generated.bareBeatLayer_phi) (blApplyR (blRowsR Generated.bareBeatLayer_coin)
    (blApplyR (blRowsR Generated.bareBeatLayer_meet) (blApplyR (blRowsR Generated.bareBeatLayer_pair)
      (blApplyR (blRowsR Generated.bareBeatLayer_bounce) (blApplyR (blRowsR Generated.bareBeatLayer_coin)
        (blApplyR (blRowsR Generated.bareBeatLayer_phi) [(i, ⟨Ninth.one, 0⟩)]))))))

/-- The check that the composed layer tables are the code's `applyBeat` table, configuration by
    configuration, and that the beat table stays in the family. -/
def blBeatOk (i : Nat) : Bool :=
  blSameR (blChain i) (blRowsR Generated.bareBeatBeat i) &&
    (blRowsR Generated.bareBeatBeat i).all fun q => decide (q.1 < blN)

/-- **Beat bridge (data).** On every family state the composed layer tables equal bare-beat's
    `applyBeat` output (before the stream moves each vibe to the neighbour its slot points to). -/
theorem gen_bare_beat_beat_eq : (List.range blN).all blBeatOk = true := by decide +kernel

/-- A stream of a superposition streams each configuration. -/
theorem bl_stream_combo (xs : List (HoneycombConfig × NinthLoc6)) :
    fockStream (blCombo xs) = blCombo (xs.map fun p => (streamConfig p.1, p.2)) := by
  funext c
  induction xs with
  | nil => rfl
  | cons p xs ih =>
    show p.2 * ket p.1 (streamConfigInv c) + blCombo xs (streamConfigInv c) =
      p.2 * ket (streamConfig p.1) c + blCombo (xs.map fun p => (streamConfig p.1, p.2)) c
    have ih' : blCombo xs (streamConfigInv c) = blCombo (xs.map fun p => (streamConfig p.1, p.2)) c := ih
    rw [ih', bl_ket, bl_ket]
    by_cases h : c = streamConfig p.1
    · rw [ite_eq_left h, ite_eq_left (by rw [h]; exact (thm_fock_honeycomb_config_symmetries p.1).1)]
    · have h' : streamConfigInv c ≠ p.1 := fun e => h (by
        rw [← e]; exact ((thm_fock_honeycomb_config_symmetries c).2.1).symm)
      rw [ite_eq_right h, ite_eq_right h']

private theorem bl_id_transport : ∀ s : Fin 24, mat5Mul mat5Id (transport s) = transport s := by
  decide +kernel

/-- The stream puts what slot `s` of the base dock held on slot `s` of the neighbour `transport s`. -/
theorem bl_stream_lands (c : HoneycombConfig) (s : Fin 24) :
    (streamConfig c).lookup (transport s) s = c.lookup mat5Id s := by
  have h := lookup_streamConfigInv (streamConfig c) mat5Id s
  rw [(thm_fock_honeycomb_config_symmetries c).1, bl_id_transport] at h
  exact h.symm

/-- An integer as a zigzag natural. -/
def blZig (z : Int) : Nat := if 0 ≤ z then 2 * z.toNat else 2 * (-z).toNat - 1

/-- A dock center as the exporter writes it: ten zigzag naturals `a, b` of five `a + b √2`. -/
def blCenterNats (v : Vec5) : List Nat :=
  (List.finRange 5).flatMap fun i => [blZig (v i).a, blZig (v i).b]

/-- **Neighbour bridge.** The center of the neighbour `transport s` of the base dock is the center of
    bare-beat's `stepDock(0, s)`, for every slot `s`. -/
theorem gen_bare_beat_neighbours_eq :
    (List.finRange 24).map (fun s => blCenterNats (mat5Vec (transport s) baseCenter)) =
      Generated.bareBeatNeighbourCenters := by
  decide +kernel

/-- **The beat of the code is the Lean Fock beat on the family.** For every chiral invariant silent on
    docks with fewer than 4 excitations (bare-beat's `chi_odd` is) and every family state, `fockBeat χ`
    of its ket is bare-beat's `applyBeat` output: each pre-stream configuration of the code's beat table,
    streamed, with the code's amplitude. Roles 0 and 1 only (the Lean Fock model has two). -/
theorem thm_beat_link_family (χ : ChiralInvariant) (hχ : BlSilent χ) (i : Nat) (hi : i < blN) :
    fockBeat χ (ket (blCfgF i)) =
      blCombo ((blRowsR Generated.bareBeatBeat i).map fun p => (streamConfig (blCfgF p.1), blToN p.2)) := by
  have hphi := bl_phi_ok
  rw [List.all_eq_true] at hphi
  have hphiT : ∀ k < blN, fockPhiOdd χ (ket (blCfgF k)) = blComboR blCfgF (blRowsR Generated.bareBeatLayer_phi k) :=
    fun k hk => (gen_bare_beat_family_eq χ hχ k hk).2.2.2.2
  have cphi : BlClosed Generated.bareBeatLayer_phi := fun k hk q hq => by
    rw [(bl_phi_row _ k (hphi k (List.mem_range.mpr hk))).2 q hq]; exact hk
  obtain ⟨hcoin, ccoin⟩ := bl_table_of_ok fockHalfCoinUnit _ bl_coin_ok
  obtain ⟨hbounce, cbounce⟩ := bl_table_of_ok fockBounceKUnit _ bl_bounce_ok
  obtain ⟨hpair, cpair⟩ := bl_table_of_ok fockMPairUnit _ bl_pair_ok
  obtain ⟨hmeet, cmeet⟩ := bl_table_of_ok fockMeetUnit _ bl_meet_ok
  have h0 : ket (blCfgF i) = blComboR blCfgF [(i, ⟨Ninth.one, 0⟩)] := by
    funext c
    show _ = blToN ⟨Ninth.one, 0⟩ * ket (blCfgF i) c + 0
    have e : blToN ⟨Ninth.one, 0⟩ = 1 := rfl
    rw [e]; ring
  have s1 := bl_step (bl_lin_phi χ) _ hphiT cphi [(i, ⟨Ninth.one, 0⟩)] (by simpa using hi)
  have s2 := bl_step bl_lin_halfCoin _ hcoin ccoin _ s1.2
  have s3 := bl_step bl_lin_bounce _ hbounce cbounce _ s2.2
  have s4 := bl_step bl_lin_mpair _ hpair cpair _ s3.2
  have s5 := bl_step bl_lin_meet _ hmeet cmeet _ s4.2
  have s6 := bl_step bl_lin_halfCoin _ hcoin ccoin _ s5.2
  have s7 := bl_step (bl_lin_phi χ) _ hphiT cphi _ s6.2
  have hb := gen_bare_beat_beat_eq
  rw [List.all_eq_true] at hb
  have hbi := hb i (List.mem_range.mpr hi)
  simp only [blBeatOk, Bool.and_eq_true, List.all_eq_true, decide_eq_true_eq] at hbi
  have hsame : blComboR blCfgF (blChain i) = blComboR blCfgF (blRowsR Generated.bareBeatBeat i) :=
    bl_comboR_eq_of_same blCfgF (fun j => j < blN) bl_cfg_inj _ _ s7.2 hbi.2 hbi.1
  show fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin
    (fockPhiOdd χ (ket (blCfgF i))))))))) = _
  rw [h0, s1.1, s2.1, s3.1, s4.1, s5.1, s6.1, s7.1]
  have e7 : blComboR blCfgF (blApplyR (blRowsR Generated.bareBeatLayer_phi) (blApplyR (blRowsR Generated.bareBeatLayer_coin)
      (blApplyR (blRowsR Generated.bareBeatLayer_meet) (blApplyR (blRowsR Generated.bareBeatLayer_pair)
        (blApplyR (blRowsR Generated.bareBeatLayer_bounce) (blApplyR (blRowsR Generated.bareBeatLayer_coin)
          (blApplyR (blRowsR Generated.bareBeatLayer_phi) [(i, ⟨Ninth.one, 0⟩)]))))))) =
      blComboR blCfgF (blRowsR Generated.bareBeatBeat i) := hsame
  rw [e7]
  show fockStream (blCombo ((blToNL (blRowsR Generated.bareBeatBeat i)).map fun p => (blCfgF p.1, p.2))) = _
  rw [bl_stream_combo, blToNL, List.map_map, List.map_map]
  rfl

/-! ## B6: the Q0 gates on the family -/

/-- Excitations of sign `+1` in a dock. -/
def blPlus (d : FullDock) : Nat :=
  ((List.finRange 24).filter fun s => match d s with | .occ .pos _ => true | _ => false).length

/-- Squared norm of a superposition of representatives. -/
def blNormR {α : Type} : List (α × NinthRaw6) → NinthRaw6
  | [] => ⟨Ninth.zero, 0⟩
  | p :: r => blRAdd (blRMul ⟨Ninth.conj p.2.num, p.2.exp⟩ p.2) (blNormR r)

private theorem bl_normR_eq {α : Type} (cf : α → HoneycombConfig) (xs : List (α × NinthRaw6)) :
    blToN (blNormR xs) = blNormSum (xs.map fun p => (cf p.1, blToN p.2)) := by
  induction xs with
  | nil => rfl
  | cons p r ih =>
    show blToN (blRAdd _ _) = NinthLoc6.conj (blToN p.2) * blToN p.2 + blNormSum _
    rw [bl_toN_add, ih]; rfl

/-- The Q0 check of one family state: the code's beat output has norm exactly 1, and every output
    configuration keeps the charge, the excitation count and the `+1` count. -/
def blQ0Ok (i : Nat) : Bool :=
  let rows := blRowsR Generated.bareBeatBeat i
  decide (NinthRaw6.equiv (blNormR rows) ⟨Ninth.one, 0⟩) &&
    rows.all fun q =>
      decide (totalCharge (blCfgF q.1) = totalCharge (blCfgF i)) &&
      decide (blOcc (blDock (blFam q.1)) = blOcc (blDock (blFam i))) &&
      decide (blPlus (blDock (blFam q.1)) = blPlus (blDock (blFam i)))

theorem bl_q0_ok : (List.range blN).all blQ0Ok = true := by decide +kernel

/-- **B6, the Q0 gates (q-ladder Q0), on the family.** For every silent `χ` and family state: bare-beat's
    beat output has squared norm exactly `1`; every output configuration keeps the total charge, the
    excitation count and the `+1` count of the input; `fockBeatDag` inverts the beat exactly; and the beat
    is the code's output (`thm_beat_link_family`). Roles 0 and 1 only. -/
theorem thm_beat_link_q0_gates (χ : ChiralInvariant) (hχ : BlSilent χ) (i : Nat) (hi : i < blN) :
    blNormSum ((blRowsR Generated.bareBeatBeat i).map fun p => (streamConfig (blCfgF p.1), blToN p.2)) = 1 ∧
    (∀ q ∈ blRowsR Generated.bareBeatBeat i,
      totalCharge (streamConfig (blCfgF q.1)) = totalCharge (blCfgF i) ∧
      blOcc (blDock (blFam q.1)) = blOcc (blDock (blFam i)) ∧
      blPlus (blDock (blFam q.1)) = blPlus (blDock (blFam i))) ∧
    fockBeatDag χ (blCombo ((blRowsR Generated.bareBeatBeat i).map
      fun p => (streamConfig (blCfgF p.1), blToN p.2))) = ket (blCfgF i) := by
  have h := bl_q0_ok
  rw [List.all_eq_true] at h
  have hi' := h i (List.mem_range.mpr hi)
  simp only [blQ0Ok, Bool.and_eq_true, List.all_eq_true, decide_eq_true_eq] at hi'
  refine ⟨?_, fun q hq => ?_, ?_⟩
  · rw [← bl_normR_eq (fun j => streamConfig (blCfgF j))]
    exact Quot.sound hi'.1
  · obtain ⟨⟨hc, ho⟩, hp⟩ := hi'.2 q hq
    exact ⟨by rw [(thm_fock_honeycomb_config_symmetries _).2.2.2.2.2.2.2.2.2.2.2, hc], ho, hp⟩
  · rw [← thm_beat_link_family χ hχ i hi]
    exact (fockBeatUnit χ).leftInv _

end Compute

end Vibe
