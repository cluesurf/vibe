module

public import Vibe.Algebra
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
# Vibe Theory: `Spin(10)`, Koide, Electroweak & Pati-Salam Algebraic Proofs (Theorems 7 to 11, 13)

Scope disclosure: Theorems 7, 9, 10 (Pati-Salam traces), 11 (`Z_2` parity), and 13 (`E/N = 8/3`)
formalize exact finite-table (`by decide`) and symbolic/inductive representation-theory / electroweak
algebra of the Standard Model and `Spin(10)` / Pati-Salam GUTs (standard Tier-C GUT/EW algebra verified
machine-checked over exact integers, NOT claimed as standalone derivations from the microscopic QCA).
Theorem 8 formalizes exact `3 × 3` matrix trace identities for warped circulant Koide operators,
and `thm10_dyadic_pow2_mod3` formalizes the exact Eisenstein dyadic mod-3 congruence.
(Numbering note: `thm12` was retired during refactoring, so numbering skips directly from `thm11` to `thm13`.)
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Theorem 7: `Spin(10)` 16-Spinor Representation, `6/6` Anomaly Cancellation & `sin²θ_W = 3/8` -/

/-- One chiral left-handed Weyl state in the 16-spinor of `Spin(10)` represented by exact integer
    quantum numbers: `sixY = 6 Y`, `twoT3 = 2 T_3^L`, `colorSign ∈ {-1, 0, +1}`,
    `isDoublet ∈ {0, 1}`, and `colorWeight ∈ {0, 1}`. -/
structure Spin10State where
  sixY : Int
  twoT3 : Int
  colorSign : Int
  isDoublet : Nat
  colorWeight : Int
  deriving DecidableEq, Repr

/-- Exact 16 chiral Weyl states of one Standard Model + `ν_R^c` generation (`Q_L(6) + u_R^c(3) +
    d_R^c(3) + L_L(2) + e_R^c(1) + ν_R^c(1) = 16`). -/
def spin10Gen16 : List Spin10State :=
  [ ⟨1,  1,  1, 1, 1⟩, ⟨1,  1,  1, 1, 1⟩, ⟨1,  1,  1, 1, 1⟩,
    ⟨1, -1,  1, 1, 1⟩, ⟨1, -1,  1, 1, 1⟩, ⟨1, -1,  1, 1, 1⟩,
    ⟨-4, 0, -1, 0, 1⟩, ⟨-4, 0, -1, 0, 1⟩, ⟨-4, 0, -1, 0, 1⟩,
    ⟨ 2, 0, -1, 0, 1⟩, ⟨ 2, 0, -1, 0, 1⟩, ⟨ 2, 0, -1, 0, 1⟩,
    ⟨-3,  1, 0, 1, 0⟩, ⟨-3, -1, 0, 1, 0⟩,
    ⟨ 6, 0, 0, 0, 0⟩,
    ⟨ 0, 0, 0, 0, 0⟩
  ]

/-- Exact electric charge numerator `sixQ = 6 Q = 3 (2 T_3) + 6 Y`. -/
def Spin10State.sixQ (s : Spin10State) : Int := 3 * s.twoT3 + s.sixY

/-- Exact Gell-Mann-Nishijima electric charge quantization on the `Spin(10)` 16-spinor:
    every state has `6 Q ∈ {-6, -4, -2, 0, 2, 4, 6}`. -/
theorem thm7_charge_quantization :
    spin10Gen16.all (fun s =>
      let q := s.sixQ
      q == -6 || q == -4 || q == -2 || q == 0 || q == 2 || q == 4 || q == 6) = true := by
  decide

/-- Anomaly 1 (Gravitational-`U(1)_Y`): `Tr(6 Y) = 0` exact. -/
theorem thm7_anomaly_grav_u1 :
    (spin10Gen16.map fun s => s.sixY).sum = 0 := by decide

/-- Anomaly 2 (Cubic `U(1)_Y^3`): `Tr((6 Y)^3) = 0` exact. -/
theorem thm7_anomaly_u1_cubic :
    (spin10Gen16.map fun s => s.sixY ^ 3).sum = 0 := by decide

/-- Anomaly 3 (`SU(2)_L^2 U(1)_Y`): `Tr((2 T_3)^2 (6 Y)) = 0` exact. -/
theorem thm7_anomaly_su2_u1 :
    (spin10Gen16.map fun s => s.twoT3 ^ 2 * s.sixY).sum = 0 := by decide

/-- Anomaly 4 (`SU(3)_C^2 U(1)_Y`): `Tr(colorWeight * (6 Y)) = 0` exact. -/
theorem thm7_anomaly_su3_u1 :
    (spin10Gen16.map fun s => s.colorWeight * s.sixY).sum = 0 := by decide

/-- Anomaly 5 (Pure `SU(3)_C^3`): fundamental quarks cancel antifundamental antiquarks. -/
theorem thm7_anomaly_su3_cubic :
    (spin10Gen16.map fun s => s.colorSign).sum = 0 := by decide

private theorem thm7_witten_su2_doublets_gen1 :
    (spin10Gen16.map fun s => s.isDoublet).sum = 8 := by decide

/-- Anomaly 6 (Witten `SU(2)_L` global anomaly): `4` doublets per generation (`8 / 2`),
    even for EVERY number of generations `nGen : Nat`. -/
theorem thm7_witten_su2_even_all_gens (nGen : Nat) :
    (nGen * ((spin10Gen16.map fun s => s.isDoublet).sum / 2)) % 2 = 0 := by
  rw [thm7_witten_su2_doublets_gen1]; omega

private theorem thm7_trace_t3_sq_scaled :
    (spin10Gen16.map fun s => (3 * s.twoT3) ^ 2).sum = 72 := by decide

private theorem thm7_trace_q_sq_scaled :
    (spin10Gen16.map fun s => s.sixQ ^ 2).sum = 192 := by decide

/-- Exact `Spin(10)` unification Weinberg angle `sin²θ_W|_GUT = Tr(T_3^2) / Tr(Q^2) = 3/8`
    for ALL `nGen : Nat` generations (`8 * 72 = 3 * 192`). -/
theorem thm7_weinberg_gut_three_eighths (nGen : Nat) :
    8 * ((nGen : Int) * (spin10Gen16.map fun s => (3 * s.twoT3) ^ 2).sum)
      = 3 * ((nGen : Int) * (spin10Gen16.map fun s => s.sixQ ^ 2).sum) := by
  rw [thm7_trace_t3_sq_scaled, thm7_trace_q_sq_scaled]; ring


/-! ## Theorem 8: `3 × 3` Circulant Koide Identity & Diagonal Warp Lower Bound `Q ≥ 2/3` -/

/-- Entrywise squared modulus `4 |S_{ij}|^2` of a `3 × 3` Hermitian circulant operator `S`. -/
def circNormSq4 (rSq : Int) (i j : Fin 3) : Int :=
  if i = j then 4 else rSq

/-- Diagonal warp weight profile `wSq = (a, b, c)` representing `W^2 = diag(w_0^2, w_1^2, w_2^2)`. -/
def diagVec3 (a b c : Int) : Fin 3 → Int
  | ⟨0, _⟩ => a
  | ⟨1, _⟩ => b
  | ⟨2, _⟩ => c

/-- Exact trace `Tr(W S W) = ∑_{i : Fin 3} w_i^2 S_{ii} = a + b + c`. -/
def trWSW (a b c : Int) : Int :=
  ((List.finRange 3).map fun i => diagVec3 a b c i).sum

/-- Exact scaled Hilbert-Schmidt trace `4 Tr((W S W)^2) = ∑_{i, j : Fin 3} w_i^2 w_j^2 (4 |S_{ij}|^2)`. -/
def trWSWsq4 (rSq a b c : Int) : Int :=
  ((List.finRange 3).map fun i =>
    ((List.finRange 3).map fun j => diagVec3 a b c i * diagVec3 a b c j * circNormSq4 rSq i j).sum).sum

private theorem finRange3_sum (f : Fin 3 → Int) :
    ((List.finRange 3).map f).sum = ∑ i : Fin 3, f i := by
  rw [Fin.sum_univ_def]

/-- Pairwise variance `V(a, b, c) = (a - b)^2 + (b - c)^2 + (c - a)^2`. -/
def warpVariance (a b c : Int) : Int :=
  (a - b) ^ 2 + (b - c) ^ 2 + (c - a) ^ 2

/-- Theorem 8a: Unwarped `3 × 3` circulant Koide ratio equals `2/3` IF AND ONLY IF `r^2 = 2`. -/
theorem thm8_koide_two_thirds_iff_f4_root_ratio (rSq : Int) :
    3 * trWSWsq4 rSq 1 1 1 = 8 * (trWSW 1 1 1) ^ 2 ↔ rSq = 2 := by
  simp [trWSWsq4, trWSW, finRange3_sum, diagVec3, circNormSq4, Fin.sum_univ_three]
  omega

/-- Theorem 8b: Exact `3 × 3` warped-circulant trace identity at `r^2 = 2`:
    `3 * (4 Tr((W S W)^2)) = 8 * (Tr(W S W))^2 + 2 * V(a, b, c)`. -/
theorem thm8_warp_koide_exact_identity (a b c : Int) :
    3 * trWSWsq4 2 a b c = 8 * (trWSW a b c) ^ 2 + 2 * warpVariance a b c := by
  simp [trWSWsq4, trWSW, finRange3_sum, warpVariance, diagVec3, circNormSq4, Fin.sum_univ_three]
  ring

/-- Theorem 8c: Exact lower bound `Q((W S W)^2) ≥ 2/3` for EVERY diagonal warp profile. -/
theorem thm8_warp_koide_ge_two_thirds (a b c : Int) :
    8 * (trWSW a b c) ^ 2 ≤ 3 * trWSWsq4 2 a b c := by
  rw [thm8_warp_koide_exact_identity]
  unfold warpVariance
  nlinarith [sq_nonneg (a - b), sq_nonneg (b - c), sq_nonneg (c - a)]

/-- Theorem 8d: Equality `Q((W S W)^2) = 2/3` holds IF AND ONLY IF `a = b = c`. -/
theorem thm8_warp_koide_eq_iff_uniform (a b c : Int) :
    3 * trWSWsq4 2 a b c = 8 * (trWSW a b c) ^ 2 ↔ (a = b ∧ b = c) := by
  rw [thm8_warp_koide_exact_identity]
  unfold warpVariance
  constructor
  · intro h
    refine ⟨by nlinarith [sq_nonneg (a - b), sq_nonneg (b - c), sq_nonneg (c - a)],
            by nlinarith [sq_nonneg (a - b), sq_nonneg (b - c), sq_nonneg (c - a)]⟩
  · rintro ⟨rfl, rfl⟩; ring


/-! ## Theorem 9: Electroweak Higgs Doublet Mass Matrix, `m_γ = 0` & Tree-Level Custodial `ρ = 1` -/

/-- Action of the electroweak covariant derivative on the real Higgs doublet vacuum `Φ = (0, v)`. -/
def ewHiggsCovDeriv (g gp v w1 w3 b : Int) : Int × Int :=
  (g * w1 * v, (-g * w3 + gp * b) * v)

/-- Squared norm `4 |D Φ|^2` giving the gauge-boson mass-squared quadratic form directly from `Φ = (0, v)`. -/
def ewHiggsMassQuad (g gp v w1 w3 b : Int) : Int :=
  let d := ewHiggsCovDeriv g gp v w1 w3 b
  d.1 * d.1 + d.2 * d.2

/-- Neutral `(W^3, B)` mass-squared matrix action `M^2_neutral (x, y)` (scaled by `4`). -/
def ewNeutralMul (g gp v x y : Int) : Int × Int :=
  (g * g * v * v * x - g * gp * v * v * y,
   -(g * gp * v * v * x) + gp * gp * v * v * y)

/-- Theorem 9a: Exact massless photon for ALL `g, gp, v`: the photon state `(W^3, B) = (gp, g)`
    annihilates both `D Φ` (`ewHiggsMassQuad = 0`) and `M^2_neutral`. -/
theorem thm9_photon_exact_zero_mode (g gp v : Int) :
    ewHiggsMassQuad g gp v 0 gp g = 0 ∧ ewNeutralMul g gp v gp g = (0, 0) := by
  unfold ewHiggsMassQuad ewHiggsCovDeriv ewNeutralMul
  exact ⟨by ring, Prod.ext (by ring) (by ring)⟩

/-- Theorem 9b: Exact `Z^0` boson eigenmode `(g, -gp)` with eigenvalue `(g^2 + gp^2) v^2` for ALL `g, gp, v`. -/
theorem thm9_z_boson_eigenmode (g gp v : Int) :
    ewNeutralMul g gp v g (-gp) = ((g * g + gp * gp) * v * v * g, (g * g + gp * gp) * v * v * (-gp)) := by
  unfold ewNeutralMul
  exact Prod.ext (by ring) (by ring)

/-- Theorem 9c: Tree-level custodial symmetry `ρ = m_W^2 / (m_Z^2 cos^2 θ_W) = 1` derived
    directly from the Higgs-doublet kinetic form `ewHiggsMassQuad`. -/
theorem thm9_custodial_rho_eq_one (g gp v : Int) :
    ewHiggsMassQuad g gp v 1 0 0 * ((g * g + gp * gp) * (g * g + gp * gp)) =
      ewHiggsMassQuad g gp v 0 g (-gp) * (g * g) := by
  unfold ewHiggsMassQuad ewHiggsCovDeriv
  ring


/-! ## Theorem 10: Pati-Salam `SO(10)` Embedding Traces & Dyadic Mod-3 Congruence -/

/-- One chiral Weyl state in the `Spin(10)` 16-spinor decomposed under
    Pati-Salam `SU(4)_C × SU(2)_L × SU(2)_R` as `(4, 2, 1) + (4bar, 1, 2)`. -/
structure PSState where
  threeBL : Int
  twoT3L : Int
  twoT3R : Int
  deriving DecidableEq, Repr

/-- Exact Pati-Salam hypercharge `6 Y = 3 (2 T_3^R) + 3 (B - L)`. -/
def PSState.sixY (s : PSState) : Int := 3 * s.twoT3R + s.threeBL

/-- Exact 16 chiral Weyl states of `(4, 2, 1) + (4bar, 1, 2)` ordered identically to `spin10Gen16`. -/
def psGen16 : List PSState :=
  [ ⟨ 1,  1,  0⟩, ⟨ 1,  1,  0⟩, ⟨ 1,  1,  0⟩,
    ⟨ 1, -1,  0⟩, ⟨ 1, -1,  0⟩, ⟨ 1, -1,  0⟩,
    ⟨-1,  0, -1⟩, ⟨-1,  0, -1⟩, ⟨-1,  0, -1⟩,
    ⟨-1,  0,  1⟩, ⟨-1,  0,  1⟩, ⟨-1,  0,  1⟩,
    ⟨-3,  1,  0⟩, ⟨-3, -1,  0⟩,
    ⟨ 3,  0,  1⟩,
    ⟨ 3,  0, -1⟩
  ]

/-- Exact embedding equivalence: `Y = T_3^R + (B - L)/2` on `(4,2,1) + (4bar,1,2)` reproduces
    all 16 Standard Model hypercharges and weak isospins in `spin10Gen16` state by state. -/
theorem thm10_ps16_matches_spin10 :
    psGen16.map (fun s => (s.sixY, s.twoT3L)) =
      spin10Gen16.map (fun s => (s.sixY, s.twoT3)) := by
  decide

theorem thm10_ps_trace_bl_zero :
    (psGen16.map fun s => s.threeBL).sum = 0 := by decide

theorem thm10_ps_trace_t3L_sq :
    (psGen16.map fun s => s.twoT3L ^ 2).sum = 8 := by decide

theorem thm10_ps_trace_t3R_sq :
    (psGen16.map fun s => s.twoT3R ^ 2).sum = 8 := by decide

theorem thm10_ps_trace_bl_sq :
    (psGen16.map fun s => s.threeBL ^ 2).sum = 48 := by decide

theorem thm10_ps_trace_bl_t3R_orthogonal :
    (psGen16.map fun s => s.threeBL * s.twoT3R).sum = 0 := by decide

theorem thm10_ps_trace_y_sq :
    (psGen16.map fun s => s.sixY ^ 2).sum = 120 := by decide

/-- Exact derivation of the `(3/5, 2/5)` Pati-Salam-to-SM hypercharge matching weights. -/
theorem thm10_ps_matching_weights_from_traces :
    let trY2  := (psGen16.map fun s => s.sixY ^ 2).sum
    let trR2  := (psGen16.map fun s => (3 * s.twoT3R) ^ 2).sum
    let trBL2 := (psGen16.map fun s => s.threeBL ^ 2).sum
    trY2 = trR2 + trBL2 ∧ 5 * trR2 = 3 * trY2 ∧ 5 * trBL2 = 2 * trY2 := by
  decide

/-- Exact Eisenstein dyadic mod-3 congruence: `2^{p + 1} mod 3` alternates strictly between
    `2` (even `p`) and `1` (odd `p`) for ALL `p : Nat`. -/
theorem thm10_dyadic_pow2_mod3 :
    ∀ p : Nat, (2 ^ (p + 1)) % 3 = if p % 2 = 0 then 2 else 1 := by
  intro p; induction p with
  | zero => decide
  | succ k ih =>
    rw [show 2 ^ (k + 2) = 2 * 2 ^ (k + 1) by ring]
    split at ih <;> split <;> omega


/-! ## Theorem 11: Exact `Z_2` Matter Parity on the `Spin(10)` 16-Spinor -/

/-- Exact `Z_2` matter parity `P_M = (-1)^{3(B - L)}`: ALL 16 fermions in `psGen16` have odd `3(B - L)`. -/
theorem thm11_matter_parity_all_16_fermions_odd :
    psGen16.all (fun s => Int.natAbs s.threeBL % 2 == 1) = true := by
  decide

/-- Exact unbroken `Z_2` matter parity under `126_H` condensation (`Δ(3(B - L)) = ±6`). -/
theorem thm11_matter_parity_preserved_by_126H (bl : Int) :
    Int.natAbs (bl + 6) % 2 = Int.natAbs bl % 2 := by
  omega


/-! ## Theorem 13: `SO(10)` Axion `E/N = 8/3` from Direct Color-Weight Anomaly Sum (`thm12` retired) -/

private theorem thm13_color_weight_sum :
    (spin10Gen16.map fun s => s.colorWeight).sum = 12 := by decide

/-- Exact `SO(10)` DFSZ axion electromagnetic-to-color anomaly ratio `E / N = 8 / 3`
    for ALL `nGen : Nat`. -/
theorem thm13_axion_e_over_n_eight_thirds (nGen : Nat) :
    3 * ((nGen : Int) * (spin10Gen16.map fun s => s.sixQ ^ 2).sum)
      = 8 * (6 * ((nGen : Int) * (spin10Gen16.map fun s => s.colorWeight).sum)) := by
  rw [thm7_trace_q_sq_scaled, thm13_color_weight_sum]; ring

end Vibe

end
