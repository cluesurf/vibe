module

public import Vibe.Tone
public import Vibe.Algebra
import Mathlib.Algebra.Ring.Defs
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Data.Matrix.Basic
import Mathlib.Tactic.Ring

/-!
# Vibe Theory: Core Microscopic Algebraic & Configuration-Space Proofs (Theorems 1 to 4)

- Theorem 1: Classical 24-slot configuration-space `DockState` `V1` fixed-point stationarity and 1-hop
  Lipschitz graph-stream causal light-cone lemmas (`∀ t`, for arbitrary local dock maps fixing `v1Dock`;
  quantum `|V_1⟩` invariance under the full multi-layer QCA is verified in exact `BigInt` in `E-RLT-0122`
  and `E-FND-0185`).
- Theorem 2: Exact local gate-matrix and scalar unitarity in `ℤ[ω]` and `ℤ[ζ_9]` (`2 × 2` `C` and `D`,
  full `8 × 8` Frame-Grover `F-G` over `Matrix (Fin 8) (Fin 8) ℤ`, unit-modulus phase scalar `|ζ_6^n|^2 = 1`
  entering `Φ_odd`, and `12 × 12` `M_pair(ζ_18)`).
- Theorem 3: Elementary algebraic 2-adic `SU(2)` and `PSU(2)` infinite-order, non-commutativity, and
  non-`Pin(2)` hypotheses in `Mat2Eis` (`∀ n ≥ 1`).
- Theorem 4: Symbolic `12 × 12` `M_pair(u)` exact unitarity, `∀ t` 4D `s`-wave eigenstate, and transverse fixation.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Theorem 1: Classical 24-Slot `DockState` `V1` Fixed-Point & 1-Hop Causal Light-Cone Skeleton (`∀ t`) -/

/-- Lattice configuration assigning a concrete 24-slot `DockState` to every lattice site. -/
abbrev LatticeState := Nat → DockState

/-- Global calm vacuum `V1`: every site holds the all-zero 24-slot dock `v1Dock`. -/
def v1Lattice : LatticeState := fun _ => v1Dock

/-- Apply a site-local 24-slot dock gate uniformly across all lattice sites. -/
def applyLocalGate (g : DockState → DockState) (s : LatticeState) : LatticeState :=
  fun x => g (s x)

/-- Concrete 1-hop 24-port graph stream transporting slot `port i` from neighbor `nbr x i` to `(x, i)`. -/
def graphStream (nbr : Nat → Fin 24 → Nat) (port : Fin 24 → Fin 24) (s : LatticeState) : LatticeState :=
  fun x i => s (nbr x i) (port i)

/-- Composite four-layer dock step followed by a 1-hop 24-port graph stream. -/
def fullQcaStep (gBare gFG gMPair gODD : DockState → DockState)
    (nbr : Nat → Fin 24 → Nat) (port : Fin 24 → Fin 24) (s : LatticeState) : LatticeState :=
  graphStream nbr port
    (applyLocalGate gBare
      (applyLocalGate gODD
        (applyLocalGate gMPair
          (applyLocalGate gFG s))))

private theorem applyLocalGate_fixes_v1 (g : DockState → DockState) (hg : g v1Dock = v1Dock) :
    applyLocalGate g v1Lattice = v1Lattice :=
  funext fun _ => hg

/-- Theorem 1a: Classical 24-slot configuration-space `V1` fixed-point stationarity (`∀ t : Nat`). -/
theorem thm1_v1_eternal_stationarity
    (gBare gFG gMPair gODD : DockState → DockState)
    (nbr : Nat → Fin 24 → Nat) (port : Fin 24 → Fin 24)
    (hBare : gBare v1Dock = v1Dock) (hFG : gFG v1Dock = v1Dock)
    (hMPair : gMPair v1Dock = v1Dock) (hODD : gODD v1Dock = v1Dock) :
    ∀ t : Nat,
      iter (fullQcaStep gBare gFG gMPair gODD nbr port) t v1Lattice = v1Lattice ∧
      ∀ x : Nat, dockCharge (iter (fullQcaStep gBare gFG gMPair gODD nbr port) t v1Lattice x) = 0 := by
  have hStep : fullQcaStep gBare gFG gMPair gODD nbr port v1Lattice = v1Lattice := by
    unfold fullQcaStep
    rw [applyLocalGate_fixes_v1 gFG hFG, applyLocalGate_fixes_v1 gMPair hMPair,
        applyLocalGate_fixes_v1 gODD hODD, applyLocalGate_fixes_v1 gBare hBare]
    rfl
  have hIter : ∀ t : Nat, iter (fullQcaStep gBare gFG gMPair gODD nbr port) t v1Lattice = v1Lattice := by
    intro t; induction t with
    | zero => rfl
    | succ t ih => simp only [iter, ih, hStep]
  exact fun t => ⟨hIter t, fun x => by rw [hIter t]; exact dockCharge_v1⟩

/-- Theorem 1b: Classical 1-hop graph-stream causal light-cone skeleton (`∀ t : Nat`). -/
theorem thm1_light_cone_empty_outside
    (g : DockState → DockState) (hg : g v1Dock = v1Dock)
    (nbr : Nat → Fin 24 → Nat) (port : Fin 24 → Fin 24)
    (dist : Nat → Nat) (hLip : ∀ x : Nat, ∀ i : Fin 24, dist x ≤ dist (nbr x i) + 1)
    (psi0 : LatticeState) (R0 : Nat)
    (h0 : ∀ x : Nat, dist x > R0 → psi0 x = v1Dock) :
    ∀ t : Nat, ∀ x : Nat, dist x > R0 + t →
      iter (fun s => graphStream nbr port (applyLocalGate g s)) t psi0 x = v1Dock ∧
      dockCharge (iter (fun s => graphStream nbr port (applyLocalGate g s)) t psi0 x) = 0 := by
  have hCore : ∀ t : Nat, ∀ x : Nat, dist x > R0 + t →
      iter (fun s => graphStream nbr port (applyLocalGate g s)) t psi0 x = v1Dock := by
    intro t; induction t with
    | zero => exact fun x hx => h0 x (by omega)
    | succ t ih =>
      intro x hx
      funext i
      change g (iter (fun s => graphStream nbr port (applyLocalGate g s)) t psi0 (nbr x i)) (port i) = v1Dock i
      rw [ih (nbr x i) (by have := hLip x i; omega), hg]; rfl
  intro t x hx
  have hDock := hCore t x hx
  exact ⟨hDock, by rw [hDock]; exact dockCharge_v1⟩


/-! ## Theorem 2: Local Gate-Matrix & Scalar Unitarity (`C`, `D`, `8 × 8` `F-G`, `ζ_6^n`, `M_pair(ζ_18)`) -/

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

/-- Exact working-rule coin `2 C = [[1 + ω, 1 - ω], [1 - ω, 1 + ω]]` in `Mat_2(ℤ[ω])`. -/
def coin2 : Mat2Eis :=
  ⟨⟨1, 1⟩, ⟨1, -1⟩, ⟨1, -1⟩, ⟨1, 1⟩⟩

/-- Exact working-rule half-coin `2 D = [[2 + ω, -ω], [-ω, 2 + ω]]` in `Mat_2(ℤ[ω])`. -/
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

/-- Scaled `8 × 8` Frame-Grover matrix `4 (F-G) = 4 I_8 - J_8` with diagonal `3` and off-diagonal `-1`. -/
def fgEntry (i j : Fin 8) : Int :=
  if i = j then 3 else -1

/-- Exact `(i, j)` entry of `(4 (F-G))^2`. -/
def fgSqEntry (i j : Fin 8) : Int :=
  ((List.finRange 8).map fun k => fgEntry i k * fgEntry k j).sum

/-- Full `8 × 8` Frame-Grover symmetry and matrix unitarity:
    `(4 (F-G))^T = 4 (F-G)` and `(4 (F-G))^2 = 16 I_8` across all 64 matrix entries. -/
theorem thm2_fg_matrix_unitary :
    (∀ i j : Fin 8, fgEntry i j = fgEntry j i) ∧
    (∀ i j : Fin 8, fgSqEntry i j = if i = j then 16 else 0) := by
  decide

/-- Scalar unit-modulus identity for the phase `ζ_6 = 1 + ω` entering `Φ_odd`:
    `|ζ_6^n|^2 = 1` for ALL `n : Nat`. -/
theorem thm2_odd_value_phase_unit :
    ∀ n : Nat, Eis.mul (Eis.conj (Eis.pow Eis.zeta6 n)) (Eis.pow Eis.zeta6 n) = Eis.one :=
  Eis.pow_unit Eis.zeta6 Eis.zeta6_unit

/-- Exact `M_pair(ζ_18)` 12×12 unitarity in `ℤ[ζ_9]` (scaled by 12, so `M† M = 144 I`). -/
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


/-! ## Theorem 3: Algebraic 2-Adic `SU(2)` / `PSU(2)` Infinite-Order & Non-`Pin(2)` Hypotheses (`∀ n ≥ 1`) -/

/-- Phase gate `P_ω = diag(1, ω)` and its adjoint `P_{ω^2} = diag(1, ω^2)`. -/
def phaseW : Mat2Eis := ⟨Eis.one, Eis.zero, Eis.zero, Eis.omega⟩
def phaseW2 : Mat2Eis := ⟨Eis.one, Eis.zero, Eis.zero, Eis.omega2⟩

/-- Scaled `SU(2)` generator `M = 2 W = 2 ω^2 C diag(1, ω) = [[-ω, 1 - ω], [-2 - ω, 1 + ω]]`. -/
def gateM : Mat2Eis := Mat2Eis.scaleEis Eis.omega2 (Mat2Eis.mul coin2 phaseW)

/-- Conjugate generator `M2 = P_ω M P_ω† = 2 (V W V†)`. -/
def gateM2 : Mat2Eis := Mat2Eis.mul (Mat2Eis.mul phaseW gateM) phaseW2

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

/-- Exact integer powers of 2: `pow2Int n = 2^n`. -/
def pow2Int : Nat → Int
  | 0 => 1
  | n + 1 => 2 * pow2Int n

private theorem thm3_trace_M_pow_pair :
    ∀ n : Nat,
      Mat2Eis.trace (Mat2Eis.pow gateM n) = Eis.ofInt (traceSeq n) ∧
      Mat2Eis.trace (Mat2Eis.pow gateM (n + 1)) = Eis.ofInt (traceSeq (n + 1)) := by
  intro n; induction n with
  | zero => exact ⟨by decide, by decide⟩
  | succ n ih =>
    refine ⟨ih.2, ?_⟩
    rw [thm3_M_pow_recurrence n, Mat2Eis.trace_sub, Mat2Eis.trace_scale, ih.2, ih.1]
    simp only [traceSeq, Eis.ofInt, Eis.sub, Eis.scale, Eis.mk.injEq]
    exact ⟨rfl, by omega⟩

theorem thm3_trace_M_pow (n : Nat) :
    Mat2Eis.trace (Mat2Eis.pow gateM n) = Eis.ofInt (traceSeq n) :=
  (thm3_trace_M_pow_pair n).1

/-- Elementary 2-adic parity theorem: `2^n Tr(W^n) ≡ 1 (mod 2)` for ALL `n ≥ 1`. -/
theorem thm3_traceSeq_odd : ∀ k : Nat, traceSeq (k + 1) % 2 = 1 := by
  intro k; induction k with
  | zero => decide
  | succ k ih => simp only [traceSeq]; omega

/-- `W^n ≠ I` for EVERY `n ≥ 1` (infinite order in `SU(2)`, elementary 2-adic proof). -/
theorem thm3_W_infinite_order_su2 (n : Nat) (hn : n ≥ 1) :
    Mat2Eis.pow gateM n ≠ Mat2Eis.scale (pow2Int n) Mat2Eis.id := by
  cases n with
  | zero => omega
  | succ k =>
    intro hEq
    have hTr := congrArg (fun M => (Mat2Eis.trace M).a) hEq
    rw [thm3_trace_M_pow (k + 1), Mat2Eis.trace_scale_id] at hTr
    have hOdd := thm3_traceSeq_odd k
    dsimp [Eis.ofInt] at hTr
    omega

/-- `W^n ≠ -I` for EVERY `n ≥ 1` (infinite order in `PSU(2) = SO(3)` as well). -/
theorem thm3_W_infinite_order_psu2 (n : Nat) (hn : n ≥ 1) :
    Mat2Eis.pow gateM n ≠ Mat2Eis.scale (-pow2Int n) Mat2Eis.id := by
  cases n with
  | zero => omega
  | succ k =>
    intro hEq
    have hTr := congrArg (fun M => (Mat2Eis.trace M).a) hEq
    rw [thm3_trace_M_pow (k + 1), Mat2Eis.trace_scale_id] at hTr
    have hOdd := thm3_traceSeq_odd k
    dsimp [Eis.ofInt] at hTr
    omega

/-- Non-commuting conjugate `[W, V W V†] ≠ 0`, ruling out `U(1)`. -/
theorem thm3_noncommuting_conjugate :
    Mat2Eis.mul gateM gateM2 ≠ Mat2Eis.mul gateM2 gateM := by decide

/-- `M2 M ≠ M† M2`, ruling out `Pin(2) = N(U(1))`. -/
theorem thm3_not_in_pin2 :
    Mat2Eis.mul gateM2 gateM ≠ Mat2Eis.mul (Mat2Eis.dag gateM) gateM2 := by decide

/-- Exact squared Frobenius norm `‖[2W, 2W2]‖_F^2 = 108` (`‖[W, W2]‖_F^2 = 27 / 4`). -/
theorem thm3_commutator_frob_norm_sq :
    Mat2Eis.frobNormSq (Mat2Eis.sub (Mat2Eis.mul gateM gateM2) (Mat2Eis.mul gateM2 gateM)) = 108 := by
  decide


/-! ## Theorem 4: Symbolic `M_pair(u)` Exact Unitarity & `∀ t` 4D `s`-Wave Eigenstate -/

section MPair

variable {R : Type} [StarCommRing R]

open StarCommRing

@[instance_reducible]
private def starToCommRing (R : Type) [StarCommRing R] : CommRing R where
  zero := zero
  one := one
  add := add
  neg := neg
  mul := mul
  add_assoc := StarCommRing.add_assoc
  zero_add := StarCommRing.zero_add
  add_zero := StarCommRing.add_zero
  nsmul := @nsmulRec R ⟨zero⟩ ⟨add⟩
  zsmul := @zsmulRec R ⟨zero⟩ ⟨add⟩ ⟨neg⟩ (@nsmulRec R ⟨zero⟩ ⟨add⟩)
  neg_add_cancel a := by change add (neg a) a = zero; rw [StarCommRing.add_comm, StarCommRing.add_neg]
  add_comm := StarCommRing.add_comm
  left_distrib := StarCommRing.mul_add
  right_distrib := StarCommRing.add_mul
  zero_mul := StarCommRing.zero_mul
  mul_zero := StarCommRing.mul_zero
  mul_assoc := StarCommRing.mul_assoc
  one_mul := StarCommRing.one_mul
  mul_one := StarCommRing.mul_one
  mul_comm := StarCommRing.mul_comm
  npow := @npowRec R ⟨one⟩ ⟨mul⟩

/-- Sum of all 12 line amplitudes on a dock (`∑_{j=0}^{11} v j`). -/
def sum12 (v : Nat → R) : R := sumN 12 v

/-- The integer `12` inside `R`. -/
def twelveR : R := ofNatR 12

/-- The unnormalized 4D `W(F_4)`-invariant `s`-wave vector `|s⟩ = (1, ..., 1)` on 12 lines. -/
def sVec : Nat → R := fun _ => one

/-- Scaled pair-line mixer `12 M_pair(u) = 12 I + (u - 1) J` acting on a 12-line vector. -/
def mpair12 (u : R) (v : Nat → R) : Nat → R :=
  fun i => add (mul twelveR (v i)) (mul (sub u one) (sum12 v))

private theorem sum12_mpair12 (u : R) (v : Nat → R) :
    sum12 (mpair12 u v) = mul (mul twelveR u) (sum12 v) := by
  let _ : CommRing R := starToCommRing R
  unfold mpair12 sum12
  rw [sumN_add, sumN_scale, sumN_const]
  change twelveR * sumN 12 v + twelveR * ((u + -1) * sumN 12 v) = (twelveR * u) * sumN 12 v
  ring

/-- Fundamental composition law:
    `12 M_pair(v) (12 M_pair(u) x) = 144 x + 12 (v u - 1) J x`. -/
theorem thm4_mpair12_comp (u v : R) (x : Nat → R) (i : Nat) :
    mpair12 v (mpair12 u x) i =
      add (mul (mul twelveR twelveR) (x i))
          (mul (mul twelveR (sub (mul v u) one)) (sum12 x)) := by
  let _ : CommRing R := starToCommRing R
  change twelveR * (twelveR * x i + (u + -1) * sum12 x) + (v + -1) * sum12 (mpair12 u x) =
    (twelveR * twelveR) * x i + (twelveR * (v * u + -1)) * sum12 x
  rw [sum12_mpair12]
  change twelveR * (twelveR * x i + (u + -1) * sum12 x) + (v + -1) * ((twelveR * u) * sum12 x) =
    (twelveR * twelveR) * x i + (twelveR * (v * u + -1)) * sum12 x
  ring

/-- Theorem 4a: Exact left unitarity `M_pair(u)† M_pair(u) = I` whenever `u* u = 1`. -/
theorem thm4_mpair12_unitary_left (u : R) (hu : mul (conj u) u = one)
    (x : Nat → R) (i : Nat) :
    mpair12 (conj u) (mpair12 u x) i = mul (mul twelveR twelveR) (x i) := by
  rw [thm4_mpair12_comp, hu, StarCommRing.sub_self, StarCommRing.mul_zero, StarCommRing.zero_mul,
    StarCommRing.add_zero]

/-- Theorem 4b: Exact right unitarity `M_pair(u) M_pair(u)† = I` whenever `u u* = 1`. -/
theorem thm4_mpair12_unitary_right (u : R) (hu : mul u (conj u) = one)
    (x : Nat → R) (i : Nat) :
    mpair12 u (mpair12 (conj u) x) i = mul (mul twelveR twelveR) (x i) := by
  rw [thm4_mpair12_comp, hu, StarCommRing.sub_self, StarCommRing.mul_zero, StarCommRing.zero_mul,
    StarCommRing.add_zero]

/-- Theorem 4c: Exact `∀ t : Nat` 4D `s`-wave eigenstate law `(12 M_pair(u))^t |s⟩ = (12 u)^t |s⟩`. -/
theorem thm4_mpair12_swave_iter (u : R) :
    ∀ t : Nat, ∀ i : Nat, iter (mpair12 u) t (sVec (R := R)) i = powR (mul twelveR u) t := by
  let _ : CommRing R := starToCommRing R
  intro t; induction t with
  | zero => intro _; rfl
  | succ t ih =>
    intro i
    simp only [iter, funext ih, mpair12, sum12, sumN_const]
    change twelveR * powR (twelveR * u) t + (u + -1) * (twelveR * powR (twelveR * u) t) =
      powR (twelveR * u) t * (twelveR * u)
    ring

/-- Theorem 4d: Exact `∀ t : Nat` transverse fixation `(12 M_pair(u))^t |v⟩ = 12^t |v⟩` for all `v ⊥ |s⟩`. -/
theorem thm4_mpair12_transverse_iter (u : R) (v : Nat → R) (hv : sum12 v = zero) :
    ∀ t : Nat, ∀ i : Nat, iter (mpair12 u) t v i = mul (powR twelveR t) (v i) := by
  let _ : CommRing R := starToCommRing R
  intro t; induction t with
  | zero => intro i; exact (StarCommRing.one_mul (v i)).symm
  | succ t ih =>
    intro i
    have hsum : sum12 (iter (mpair12 u) t v) = zero := by
      rw [funext ih]; unfold sum12 at hv ⊢; rw [sumN_scale, hv, StarCommRing.mul_zero]
    simp only [iter, mpair12, hsum, ih i]
    change twelveR * (powR twelveR t * v i) + (u + -1) * 0 = (powR twelveR t * twelveR) * v i
    ring

end MPair

end Vibe

end
