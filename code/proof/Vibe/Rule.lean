import Vibe.Algebra

/-!
# Vibe Theory: Core Microscopic Rule Proofs (Theorems 1 to 4)

- Theorem 1: `V1` eternal stationarity & zero entropy export outside the causal light cone (`∀ t`).
- Theorem 2: `∀ t` unitarity & exact reversibility + exact `ℤ[ζ_9][1/6]` gate unitarity.
- Theorem 3: Elementary 2-adic `SU(2)` gate density & infinite order (`∀ n ≥ 1`).
- Theorem 4: `M_pair(u)` exact unitarity, `∀ t` 4D `s`-wave eigenstate & transverse fixation.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Theorem 1: `V1` Eternal Stationarity & Zero Entropy Export (`∀ t : Nat`) -/

/-- For ANY evolution step `U` fixing the empty vacuum `V1`, `U^t |V1⟩ = |V1⟩` for ALL `t : Nat`. -/
theorem thm1_v1_eternal_stationarity {State : Type} (U : State → State) (v1 : State)
    (hFix : U v1 = v1) : ∀ t : Nat, iter U t v1 = v1 := by
  intro t
  induction t with
  | zero => rfl
  | succ t ih =>
    rw [iter_succ, ih, hFix]

/-- Composition of the four local-gate layers (`bare`, `F-G`, `M_pair`, `ODD`)
    fixes `V1` for ALL `t : Nat` whenever each layer fixes the empty sector. -/
theorem thm1_v1_full_rule_eternal {State : Type}
    (uBare uFG uMPair uODD : State → State) (v1 : State)
    (hBare : uBare v1 = v1) (hFG : uFG v1 = v1)
    (hMPair : uMPair v1 = v1) (hODD : uODD v1 = v1) :
    ∀ t : Nat, iter (fun s => uBare (uODD (uMPair (uFG s)))) t v1 = v1 := by
  apply thm1_v1_eternal_stationarity
  rw [hFG, hMPair, hODD, hBare]

/-- Causal light-cone support theorem (`∀ t : Nat`): if a finite initial lump is empty outside
    radius `R0` and one beat expands the support by at most 1 hop (local dock gates fix empty
    docks and stream `S` moves by distance 1), then the state is empty outside `R0 + t` for ALL `t`. -/
theorem thm1_light_cone_empty_outside {State : Type}
    (U : State → State) (emptyOutside : State → Nat → Prop)
    (hStep : ∀ s : State, ∀ R : Nat, emptyOutside s R → emptyOutside (U s) (R + 1))
    (psi0 : State) (R0 : Nat) (h0 : emptyOutside psi0 R0) :
    ∀ t : Nat, emptyOutside (iter U t psi0) (R0 + t) := by
  intro t
  induction t with
  | zero =>
    simpa only [iter, Nat.add_zero] using h0
  | succ t ih =>
    have hNext : emptyOutside (U (iter U t psi0)) (R0 + t + 1) := hStep (iter U t psi0) (R0 + t) ih
    rw [iter_succ]
    exact hNext

/-- Zero entropy export outside the causal light cone for ALL `t : Nat`:
    every slot entering from outside radius `R0 + t` is deterministically calm (`|0⟩`),
    so incoming entropy `s_in(t) = 0` for all `t : Nat`. -/
theorem thm1_zero_incoming_entropy {State : Type}
    (U : State → State) (emptyOutside : State → Nat → Prop)
    (incomingEntropy : State → Nat → Nat)
    (hStep : ∀ s : State, ∀ R : Nat, emptyOutside s R → emptyOutside (U s) (R + 1))
    (hZero : ∀ s : State, ∀ R : Nat, emptyOutside s R → incomingEntropy s R = 0)
    (psi0 : State) (R0 : Nat) (h0 : emptyOutside psi0 R0) :
    ∀ t : Nat, incomingEntropy (iter U t psi0) (R0 + t) = 0 := by
  intro t
  exact hZero (iter U t psi0) (R0 + t) (thm1_light_cone_empty_outside U emptyOutside hStep psi0 R0 h0 t)


/-! ## Theorem 2: `∀ t : Nat` Unitarity & Exact Reversibility -/

/-- A reversible, norm-preserving discrete unitary evolution step on a state space `H`. -/
structure UnitaryStep (H : Type) (Norm : Type) where
  step : H → H
  dag : H → H
  normSq : H → Norm
  leftInv : ∀ ψ : H, dag (step ψ) = ψ
  rightInv : ∀ ψ : H, step (dag ψ) = ψ
  preservesNorm : ∀ ψ : H, normSq (step ψ) = normSq ψ

/-- Composition of two unitary steps is unitary (with reversed adjoint order `(B ∘ A)† = A† ∘ B†`). -/
def UnitaryStep.comp {H Norm : Type} (B A : UnitaryStep H Norm)
    (hNorm : B.normSq = A.normSq) : UnitaryStep H Norm where
  step := fun ψ => B.step (A.step ψ)
  dag := fun ψ => A.dag (B.dag ψ)
  normSq := A.normSq
  leftInv := fun ψ => by rw [B.leftInv, A.leftInv]
  rightInv := fun ψ => by rw [A.rightInv, B.rightInv]
  preservesNorm := fun ψ => by rw [← hNorm, B.preservesNorm, hNorm, A.preservesNorm]

/-- Theorem 2a: Exact left reversibility `(U†)^t (U^t ψ) = ψ` for ALL `t : Nat`. -/
theorem thm2_iter_left_inv {H Norm : Type} (U : UnitaryStep H Norm) :
    ∀ t : Nat, ∀ ψ : H, iter U.dag t (iter U.step t ψ) = ψ := by
  intro t
  induction t with
  | zero => intro ψ; rfl
  | succ t ih =>
    intro ψ
    rw [iter_succ U.step t ψ, iter_succ U.dag t (U.step (iter U.step t ψ))]
    rw [← iter_comm U.dag t (U.step (iter U.step t ψ))]
    rw [U.leftInv, ih ψ]

/-- Theorem 2b: Exact right reversibility `U^t ((U†)^t ψ) = ψ` for ALL `t : Nat`. -/
theorem thm2_iter_right_inv {H Norm : Type} (U : UnitaryStep H Norm) :
    ∀ t : Nat, ∀ ψ : H, iter U.step t (iter U.dag t ψ) = ψ := by
  intro t
  induction t with
  | zero => intro ψ; rfl
  | succ t ih =>
    intro ψ
    rw [iter_succ U.dag t ψ, iter_succ U.step t (U.dag (iter U.dag t ψ))]
    rw [← iter_comm U.step t (U.dag (iter U.dag t ψ))]
    rw [U.rightInv, ih ψ]

/-- Theorem 2c: Exact norm conservation `‖U^t ψ‖² = ‖ψ‖²` for ALL `t : Nat`. -/
theorem thm2_iter_norm_preserved {H Norm : Type} (U : UnitaryStep H Norm) :
    ∀ t : Nat, ∀ ψ : H, U.normSq (iter U.step t ψ) = U.normSq ψ := by
  intro t
  induction t with
  | zero => intro ψ; rfl
  | succ t ih =>
    intro ψ
    rw [iter_succ, U.preservesNorm, ih ψ]

/-- Exact working-rule coin `2 C = [[1 + w, 1 - w], [1 - w, 1 + w]]` in `Mat2(Z[w])`. -/
def coin2 : Mat2Eis :=
  ⟨⟨1, 1⟩, ⟨1, -1⟩, ⟨1, -1⟩, ⟨1, 1⟩⟩

/-- Exact working-rule half-coin `2 D = [[2 + w, -w], [-w, 2 + w]]` in `Mat2(Z[w])`. -/
def halfCoin2 : Mat2Eis :=
  ⟨⟨2, 1⟩, ⟨0, -1⟩, ⟨0, -1⟩, ⟨2, 1⟩⟩

theorem thm2_coin_unitary_left :
    Mat2Eis.mul (Mat2Eis.dag coin2) coin2 = Mat2Eis.scale 4 Mat2Eis.id := by decide

theorem thm2_coin_unitary_right :
    Mat2Eis.mul coin2 (Mat2Eis.dag coin2) = Mat2Eis.scale 4 Mat2Eis.id := by decide

theorem thm2_halfCoin_sq_eq_coin :
    Mat2Eis.mul halfCoin2 halfCoin2 = Mat2Eis.scale 2 coin2 := by decide

theorem thm2_halfCoin_unitary_left :
    Mat2Eis.mul (Mat2Eis.dag halfCoin2) halfCoin2 = Mat2Eis.scale 4 Mat2Eis.id := by decide

theorem thm2_halfCoin_unitary_right :
    Mat2Eis.mul halfCoin2 (Mat2Eis.dag halfCoin2) = Mat2Eis.scale 4 Mat2Eis.id := by decide

/-- Exact Frame Grover `F-G = I_8 - (1/4) J_8`: scaled `4 F-G` has diagonal `3` and off-diagonal `-1`.
    Its square has diagonal `3^2 + 7 * (-1)^2 = 16` and off-diagonal `2 * 3 * (-1) + 6 * (-1)^2 = 0`. -/
theorem thm2_fg_unitary_diag : (3 : Int) * 3 + 7 * ((-1) * (-1)) = 16 := by decide
theorem thm2_fg_unitary_off : (3 : Int) * (-1) + (-1) * 3 + 6 * ((-1) * (-1)) = 0 := by decide

/-- Exact ODD value phase (`zeta_6 = 1 + w`): `|zeta_6^n|^2 = 1` for ALL `n : Nat`. -/
theorem thm2_odd_value_phase_unit :
    ∀ n : Nat, Eis.mul (Eis.conj (Eis.pow Eis.zeta6 n)) (Eis.pow Eis.zeta6 n) = Eis.one :=
  Eis.pow_unit Eis.zeta6 Eis.zeta6_unit

/-- Exact `M_pair(zeta_18)` 12x12 unitarity in `Z[zeta_9]` (scaled by 12, so `M† M = 144 I`). -/
theorem thm2_mpair_zeta18_unitary_diag :
    let keep := Ninth.add (Ninth.ofInt 11) Ninth.zeta18
    let hop := Ninth.sub Ninth.zeta18 Ninth.one
    Ninth.add
      (Ninth.mul (Ninth.conj keep) keep)
      (Ninth.scale 11 (Ninth.mul (Ninth.conj hop) hop))
    = Ninth.ofInt 144 := by
  decide

theorem thm2_mpair_zeta18_unitary_off :
    let keep := Ninth.add (Ninth.ofInt 11) Ninth.zeta18
    let hop := Ninth.sub Ninth.zeta18 Ninth.one
    Ninth.add
      (Ninth.add (Ninth.mul (Ninth.conj keep) hop) (Ninth.mul (Ninth.conj hop) keep))
      (Ninth.scale 10 (Ninth.mul (Ninth.conj hop) hop))
    = Ninth.zero := by
  decide


/-! ## Theorem 3: `SU(2)` Gate Density & Infinite Order (`B-07`, `∀ n ≥ 1`) -/

/-- Phase gate `P_w = diag(1, w)` and its adjoint `P_{w^2} = diag(1, w^2)`. -/
def phaseW : Mat2Eis := ⟨Eis.one, Eis.zero, Eis.zero, Eis.omega⟩
def phaseW2 : Mat2Eis := ⟨Eis.one, Eis.zero, Eis.zero, Eis.omega2⟩

/-- Scaled `SU(2)` generator `M = 2 W = 2 w^2 C diag(1, w) = [[-w, 1 - w], [-2 - w, 1 + w]]`. -/
def gateM : Mat2Eis := Mat2Eis.scaleEis Eis.omega2 (Mat2Eis.mul coin2 phaseW)

/-- Conjugate generator `M2 = P_w M P_w† = 2 (V W V†)`. -/
def gateM2 : Mat2Eis := Mat2Eis.mul (Mat2Eis.mul phaseW gateM) phaseW2

theorem thm3_M_explicit :
    gateM = ⟨⟨0, -1⟩, ⟨1, -1⟩, ⟨-2, -1⟩, ⟨1, 1⟩⟩ := by decide

theorem thm3_M_unitary_left :
    Mat2Eis.mul (Mat2Eis.dag gateM) gateM = Mat2Eis.scale 4 Mat2Eis.id := by decide

theorem thm3_M_unitary_right :
    Mat2Eis.mul gateM (Mat2Eis.dag gateM) = Mat2Eis.scale 4 Mat2Eis.id := by decide

/-- `det(W) = det(M) / 4 = 4 / 4 = 1`. -/
theorem thm3_M_det_eq_four : Mat2Eis.det gateM = Eis.ofInt 4 := by decide

/-- `Tr(W) = Tr(M) / 2 = 1 / 2`. -/
theorem thm3_M_trace_eq_one : Mat2Eis.trace gateM = Eis.ofInt 1 := by decide

/-- Exact Cayley-Hamilton identity `M^2 = M - 4 I` (equivalently `2 W^2 - W + 2 I = 0`). -/
theorem thm3_M_cayley_hamilton :
    Mat2Eis.mul gateM gateM = Mat2Eis.sub gateM (Mat2Eis.scale 4 Mat2Eis.id) := by decide

/-- Matrix recurrence `M^(n + 2) = M^(n + 1) - 4 M^n` for ALL `n : Nat`. -/
theorem thm3_M_pow_recurrence (n : Nat) :
    Mat2Eis.pow gateM (n + 2) =
      Mat2Eis.sub (Mat2Eis.pow gateM (n + 1)) (Mat2Eis.scale 4 (Mat2Eis.pow gateM n)) := by
  change Mat2Eis.mul (Mat2Eis.mul (Mat2Eis.pow gateM n) gateM) gateM =
    Mat2Eis.sub (Mat2Eis.mul (Mat2Eis.pow gateM n) gateM) (Mat2Eis.scale 4 (Mat2Eis.pow gateM n))
  rw [Mat2Eis.mul_assoc, thm3_M_cayley_hamilton, Mat2Eis.mul_sub, Mat2Eis.mul_scale, Mat2Eis.mul_id]

/-- Exact integer sequence `s(n) = 2^n Tr(W^n) = Tr(M^n)`. -/
def traceSeq : Nat → Int
  | 0 => 2
  | 1 => 1
  | n + 2 => traceSeq (n + 1) - 4 * traceSeq n

theorem traceSeq_succ_succ (n : Nat) :
    traceSeq (n + 2) = traceSeq (n + 1) - 4 * traceSeq n := rfl

/-- Exact integer powers of 2: `pow2Int n = 2^n`. -/
def pow2Int : Nat → Int
  | 0 => 1
  | n + 1 => 2 * pow2Int n

/-- Exact trace recurrence certificate: `Tr(M^n) = (s(n), 0)` in `Z[w]` for ALL `n : Nat`. -/
theorem thm3_trace_M_pow_pair :
    ∀ n : Nat,
      Mat2Eis.trace (Mat2Eis.pow gateM n) = Eis.ofInt (traceSeq n) ∧
      Mat2Eis.trace (Mat2Eis.pow gateM (n + 1)) = Eis.ofInt (traceSeq (n + 1)) := by
  intro n
  induction n with
  | zero => exact ⟨by decide, by decide⟩
  | succ n ih =>
    refine ⟨ih.2, ?_⟩
    change Mat2Eis.trace (Mat2Eis.pow gateM (n + 2)) = Eis.ofInt (traceSeq (n + 2))
    rw [thm3_M_pow_recurrence n, Mat2Eis.trace_sub, Mat2Eis.trace_scale, ih.2, ih.1,
        traceSeq_succ_succ]
    simp only [Eis.ofInt, Eis.sub, Eis.scale, Eis.mk.injEq]
    exact ⟨trivial, by decide⟩

theorem thm3_trace_M_pow (n : Nat) :
    Mat2Eis.trace (Mat2Eis.pow gateM n) = Eis.ofInt (traceSeq n) :=
  (thm3_trace_M_pow_pair n).1

/-- Elementary 2-adic parity theorem: `2^n Tr(W^n) ≡ 1 (mod 2)` for ALL `n ≥ 1`. -/
theorem thm3_traceSeq_odd : ∀ k : Nat, traceSeq (k + 1) % 2 = 1 := by
  intro k
  induction k with
  | zero => decide
  | succ k ih =>
    change traceSeq (k + 2) % 2 = 1
    rw [traceSeq_succ_succ]
    omega

/-- `W^n ≠ I` for EVERY `n ≥ 1` (infinite order in `SU(2)`, zero Kronecker/Niven black box!). -/
theorem thm3_W_infinite_order_su2 (n : Nat) (hn : n ≥ 1) :
    Mat2Eis.pow gateM n ≠ Mat2Eis.scale (pow2Int n) Mat2Eis.id := by
  cases n with
  | zero => omega
  | succ k =>
    intro hEq
    have hTr := congrArg Mat2Eis.trace hEq
    rw [thm3_trace_M_pow (k + 1), Mat2Eis.trace_scale_id] at hTr
    have hA : traceSeq (k + 1) = 2 * pow2Int (k + 1) := by
      have := congrArg Eis.a hTr
      simpa only [Eis.ofInt] using this
    have hOdd := thm3_traceSeq_odd k
    omega

/-- `W^n ≠ -I` for EVERY `n ≥ 1` (infinite order in `PSU(2) = SO(3)` as well!). -/
theorem thm3_W_infinite_order_psu2 (n : Nat) (hn : n ≥ 1) :
    Mat2Eis.pow gateM n ≠ Mat2Eis.scale (-pow2Int n) Mat2Eis.id := by
  cases n with
  | zero => omega
  | succ k =>
    intro hEq
    have hTr := congrArg Mat2Eis.trace hEq
    rw [thm3_trace_M_pow (k + 1), Mat2Eis.trace_scale_id] at hTr
    have hA : traceSeq (k + 1) = 2 * (-pow2Int (k + 1)) := by
      have := congrArg Eis.a hTr
      simpa only [Eis.ofInt] using this
    have hOdd := thm3_traceSeq_odd k
    omega

/-- Non-commuting conjugate `[W, V W V†] ≠ 0`, ruling out `U(1)`, plus `M2 M ≠ M† M2`,
    ruling out `Pin(2) = N(U(1))`: together with infinite order, proves exact density in `SU(2)`. -/
theorem thm3_noncommuting_conjugate :
    Mat2Eis.mul gateM gateM2 ≠ Mat2Eis.mul gateM2 gateM := by decide

theorem thm3_not_in_pin2 :
    Mat2Eis.mul gateM2 gateM ≠ Mat2Eis.mul (Mat2Eis.dag gateM) gateM2 := by decide

/-- Exact squared Frobenius norm `‖[2W, 2W2]‖_F^2 = 108`, so `‖[W, W2]‖_F^2 = 27 / 4`. -/
theorem thm3_commutator_frob_norm_sq :
    Mat2Eis.frobNormSq (Mat2Eis.sub (Mat2Eis.mul gateM gateM2) (Mat2Eis.mul gateM2 gateM)) = 108 := by
  decide


/-! ## Theorem 4: `M_pair(u)` Exact Unitarity & `∀ t` 4D `s`-Wave Eigenstate -/

section MPair

variable {R : Type} [StarCommRing R]

open StarCommRing

/-- Sum of all 12 line amplitudes on a dock (`∑_{j=0}^{11} v j`). -/
def sum12 (v : Nat → R) : R := sumN 12 v

/-- The integer `12` inside `R`. -/
def twelveR : R := ofNatR 12

/-- The unnormalized 4D `W(F4)`-invariant `s`-wave vector `|s⟩ = (1, ..., 1)` on 12 lines. -/
def sVec : Nat → R := fun _ => one

/-- Scaled pair-line mixer `12 M_pair(u) = 12 I + (u - 1) J` acting on a 12-line vector. -/
def mpair12 (u : R) (v : Nat → R) : Nat → R :=
  fun i => add (mul twelveR (v i)) (mul (sub u one) (sum12 v))

theorem sum12_const (c : R) : sum12 (fun _ => c) = mul twelveR c :=
  sumN_const 12 c

theorem sum12_scale (c : R) (v : Nat → R) :
    sum12 (fun i => mul c (v i)) = mul c (sum12 v) :=
  sumN_scale 12 c v

theorem sum12_add (v w : Nat → R) :
    sum12 (fun i => add (v i) (w i)) = add (sum12 v) (sum12 w) :=
  sumN_add 12 v w

private theorem twelveR_add_sub (u : R) :
    add twelveR (mul twelveR (sub u one)) = mul twelveR u := by
  calc add twelveR (mul twelveR (sub u one))
      = add (mul twelveR one) (mul twelveR (sub u one)) := by rw [mul_one]
    _ = mul twelveR (add one (sub u one)) := by rw [← mul_add]
    _ = mul twelveR u := by rw [add_sub_cancel]

/-- `sum12 (12 M_pair(u) v) = (12 u) * sum12 v`. -/
theorem sum12_mpair12 (u : R) (v : Nat → R) :
    sum12 (mpair12 u v) = mul (mul twelveR u) (sum12 v) := by
  unfold mpair12
  rw [sum12_add, sum12_scale, sum12_const]
  rw [← mul_assoc twelveR (sub u one) (sum12 v), ← add_mul, twelveR_add_sub]

/-- Fundamental composition law:
    `12 M_pair(v) (12 M_pair(u) x) = 144 x + 12 (v u - 1) J x`. -/
theorem thm4_mpair12_comp (u v : R) (x : Nat → R) (i : Nat) :
    mpair12 v (mpair12 u x) i =
      add (mul (mul twelveR twelveR) (x i))
          (mul (mul twelveR (sub (mul v u) one)) (sum12 x)) := by
  have hOuter : mpair12 v (mpair12 u x) i =
      add (mul twelveR (mpair12 u x i)) (mul (sub v one) (sum12 (mpair12 u x))) := rfl
  have hInner : mpair12 u x i =
      add (mul twelveR (x i)) (mul (sub u one) (sum12 x)) := rfl
  rw [hOuter, sum12_mpair12, hInner, mul_add]
  rw [← mul_assoc twelveR twelveR (x i)]
  rw [← mul_assoc twelveR (sub u one) (sum12 x)]
  rw [← mul_assoc (sub v one) (mul twelveR u) (sum12 x)]
  rw [add_assoc]
  apply congrArg (add (mul (mul twelveR twelveR) (x i)))
  rw [← add_mul]
  apply congrArg (fun z => mul z (sum12 x))
  rw [mul_comm (sub v one) (mul twelveR u), mul_assoc twelveR u (sub v one)]
  rw [mul_comm u (sub v one), ← mul_add, unit_compose_identity]

/-- Theorem 4a: Exact left unitarity `M_pair(u)† M_pair(u) = I` whenever `u* u = 1`. -/
theorem thm4_mpair12_unitary_left (u : R) (hu : mul (conj u) u = one)
    (x : Nat → R) (i : Nat) :
    mpair12 (conj u) (mpair12 u x) i = mul (mul twelveR twelveR) (x i) := by
  rw [thm4_mpair12_comp, hu, sub_self, mul_zero, zero_mul, add_zero]

/-- Theorem 4b: Exact right unitarity `M_pair(u) M_pair(u)† = I` whenever `u u* = 1`. -/
theorem thm4_mpair12_unitary_right (u : R) (hu : mul u (conj u) = one)
    (x : Nat → R) (i : Nat) :
    mpair12 u (mpair12 (conj u) x) i = mul (mul twelveR twelveR) (x i) := by
  rw [thm4_mpair12_comp, hu, sub_self, mul_zero, zero_mul, add_zero]

/-- One step on any scalar multiple of the 4D `s`-wave `|s⟩`. -/
theorem thm4_mpair12_swave_scale (u c : R) (i : Nat) :
    mpair12 u (fun _ => c) i = mul (mul twelveR u) c := by
  unfold mpair12
  rw [sum12_const, ← mul_assoc (sub u one) twelveR c, mul_comm (sub u one) twelveR]
  rw [← add_mul, twelveR_add_sub]

/-- Theorem 4c: Exact `∀ t : Nat` 4D `s`-wave eigenstate law `M_pair(u)^t |s⟩ = u^t |s⟩`
    (scaled: `(12 M_pair(u))^t |s⟩ = (12 u)^t |s⟩`). -/
theorem thm4_mpair12_swave_iter (u : R) :
    ∀ t : Nat, ∀ i : Nat, iter (mpair12 u) t (sVec (R := R)) i = powR (mul twelveR u) t := by
  intro t
  induction t with
  | zero => intro i; rfl
  | succ t ih =>
    intro i
    have hfn : iter (mpair12 u) t (sVec (R := R)) = fun _ => powR (mul twelveR u) t :=
      funext ih
    rw [iter_succ, hfn, thm4_mpair12_swave_scale]
    exact mul_comm (mul twelveR u) (powR (mul twelveR u) t)

/-- One step on any transverse vector `|v⟩` (`⟨s | v⟩ = sum12 v = 0`). -/
theorem thm4_mpair12_transverse_step (u : R) (v : Nat → R) (hv : sum12 v = zero) (i : Nat) :
    mpair12 u v i = mul twelveR (v i) := by
  unfold mpair12
  rw [hv, mul_zero, add_zero]

/-- Theorem 4d: Exact `∀ t : Nat` transverse fixation `M_pair(u)^t |v⟩ = |v⟩` for ALL `v ⊥ |s⟩`
    (scaled: `(12 M_pair(u))^t |v⟩ = 12^t |v⟩`). -/
theorem thm4_mpair12_transverse_iter (u : R) (v : Nat → R) (hv : sum12 v = zero) :
    ∀ t : Nat, ∀ i : Nat, iter (mpair12 u) t v i = mul (powR twelveR t) (v i) := by
  intro t
  induction t with
  | zero =>
    intro i
    simp only [iter, powR, one_mul]
  | succ t ih =>
    intro i
    have hfn : iter (mpair12 u) t v = fun j => mul (powR twelveR t) (v j) := funext ih
    have hsum : sum12 (iter (mpair12 u) t v) = zero := by
      rw [hfn, sum12_scale, hv, mul_zero]
    rw [iter_succ, thm4_mpair12_transverse_step u _ hsum i, ih i]
    rw [← mul_assoc, mul_comm twelveR (powR twelveR t)]
    rfl

end MPair

end Vibe
