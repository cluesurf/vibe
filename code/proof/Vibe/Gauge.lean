import Vibe.Algebra

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

namespace Vibe

/-! ## Theorem 7: `Spin(10)` 16-Spinor Representation, `6/6` Anomaly Cancellation & `sin²θ_W = 3/8` -/

/-- One chiral left-handed Weyl state in the 16-spinor of `Spin(10)` represented by exact integer
    quantum numbers: `sixY = 6 Y`, `twoT3 = 2 T_3^L`, `colorSign ∈ {-1, 0, +1}` (`+1` for `3`,
    `-1` for `3bar`, `0` for singlet), `isDoublet ∈ {0, 1}`, and `colorWeight ∈ {0, 1}` (`1` iff
    the state transforms in `3` or `3bar` of `SU(3)_C`). -/
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
  [ -- Q_L: (3, 2)_{+1/6}  (6 states)
    ⟨1,  1,  1, 1, 1⟩, ⟨1,  1,  1, 1, 1⟩, ⟨1,  1,  1, 1, 1⟩,
    ⟨1, -1,  1, 1, 1⟩, ⟨1, -1,  1, 1, 1⟩, ⟨1, -1,  1, 1, 1⟩,
    -- u_R^c: (3bar, 1)_{-2/3} (3 states)
    ⟨-4, 0, -1, 0, 1⟩, ⟨-4, 0, -1, 0, 1⟩, ⟨-4, 0, -1, 0, 1⟩,
    -- d_R^c: (3bar, 1)_{+1/3} (3 states)
    ⟨ 2, 0, -1, 0, 1⟩, ⟨ 2, 0, -1, 0, 1⟩, ⟨ 2, 0, -1, 0, 1⟩,
    -- L_L: (1, 2)_{-1/2} (2 states)
    ⟨-3,  1, 0, 1, 0⟩, ⟨-3, -1, 0, 1, 0⟩,
    -- e_R^c: (1, 1)_{+1} (1 state)
    ⟨ 6, 0, 0, 0, 0⟩,
    -- ν_R^c: (1, 1)_{0} (1 state)
    ⟨ 0, 0, 0, 0, 0⟩
  ]

def sumIntList (xs : List Int) : Int :=
  xs.foldl (fun acc x => acc + x) 0

def sumNatList (xs : List Nat) : Nat :=
  xs.foldl (fun acc x => acc + x) 0

/-- Exact electric charge numerator `sixQ = 6 Q = 3 (2 T_3) + 6 Y`. -/
def Spin10State.sixQ (s : Spin10State) : Int := 3 * s.twoT3 + s.sixY

private theorem thm7_gen16_count : spin10Gen16.length = 16 := by decide

/-- Exact Gell-Mann-Nishijima electric charge quantization on the `Spin(10)` 16-spinor:
    every state has `6 Q ∈ {-6, -4, -2, 0, 2, 4, 6}`. -/
theorem thm7_charge_quantization :
    spin10Gen16.all (fun s =>
      let q := s.sixQ
      q == -6 || q == -4 || q == -2 || q == 0 || q == 2 || q == 4 || q == 6) = true := by
  decide

/-- Anomaly 1 (Gravitational-`U(1)_Y`): `Tr(6 Y) = 0` exact. -/
theorem thm7_anomaly_grav_u1 :
    sumIntList (spin10Gen16.map (fun s => s.sixY)) = 0 := by decide

/-- Anomaly 2 (Cubic `U(1)_Y^3`): `Tr((6 Y)^3) = 0` exact. -/
theorem thm7_anomaly_u1_cubic :
    sumIntList (spin10Gen16.map (fun s => s.sixY * s.sixY * s.sixY)) = 0 := by decide

/-- Anomaly 3 (`SU(2)_L^2 U(1)_Y`): `Tr((2 T_3)^2 (6 Y)) = 0` exact. -/
theorem thm7_anomaly_su2_u1 :
    sumIntList (spin10Gen16.map (fun s => s.twoT3 * s.twoT3 * s.sixY)) = 0 := by decide

/-- Anomaly 4 (`SU(3)_C^2 U(1)_Y`): `Tr(colorWeight * (6 Y)) = 0` exact. -/
theorem thm7_anomaly_su3_u1 :
    sumIntList (spin10Gen16.map (fun s => s.colorWeight * s.sixY)) = 0 := by decide

/-- Anomaly 5 (Pure `SU(3)_C^3`): fundamental quarks cancel antifundamental antiquarks. -/
theorem thm7_anomaly_su3_cubic :
    sumIntList (spin10Gen16.map (fun s => s.colorSign)) = 0 := by decide

private theorem thm7_witten_su2_doublets_gen1 :
    sumNatList (spin10Gen16.map (fun s => s.isDoublet)) = 8 := by decide

/-- Anomaly 6 (Witten `SU(2)_L` global anomaly): `4` doublets per generation (`8 / 2`),
    even for EVERY number of generations `nGen : Nat`. -/
theorem thm7_witten_su2_even_all_gens (nGen : Nat) :
    (nGen * (sumNatList (spin10Gen16.map (fun s => s.isDoublet)) / 2)) % 2 = 0 := by
  rw [thm7_witten_su2_doublets_gen1]
  omega

private theorem thm7_trace_t3_sq_scaled :
    sumIntList (spin10Gen16.map (fun s => (3 * s.twoT3) * (3 * s.twoT3))) = 72 := by decide

private theorem thm7_trace_q_sq_scaled :
    sumIntList (spin10Gen16.map (fun s => s.sixQ * s.sixQ)) = 192 := by decide

/-- Exact `Spin(10)` unification Weinberg angle `sin²θ_W|_GUT = Tr(T_3^2) / Tr(Q^2) = 3/8`
    for ALL `nGen : Nat` generations (`8 * 72 = 3 * 192`). -/
theorem thm7_weinberg_gut_three_eighths (nGen : Nat) :
    8 * ((nGen : Int) * sumIntList (spin10Gen16.map (fun s => (3 * s.twoT3) * (3 * s.twoT3))))
      = 3 * ((nGen : Int) * sumIntList (spin10Gen16.map (fun s => s.sixQ * s.sixQ))) := by
  rw [thm7_trace_t3_sq_scaled, thm7_trace_q_sq_scaled]
  omega


/-! ## Theorem 8: `3 × 3` Circulant Koide Identity & Diagonal Warp Lower Bound `Q ≥ 2/3` -/

/-- Entrywise squared modulus `4 |S_{ij}|^2` of a `3 × 3` Hermitian circulant operator `S`
    with unit diagonal `S_{ii} = 1` and off-diagonal squared amplitude `|S_{ij}|^2 = r^2 / 4`. -/
def circNormSq4 (rSq : Int) (i j : Fin 3) : Int :=
  if i = j then 4 else rSq

/-- Diagonal warp weight profile `wSq = (a, b, c)` representing `W^2 = diag(w_0^2, w_1^2, w_2^2)`. -/
def diagVec3 (a b c : Int) : Fin 3 → Int
  | ⟨0, _⟩ => a
  | ⟨1, _⟩ => b
  | ⟨2, _⟩ => c

/-- Exact trace `Tr(W S W) = ∑_{i : Fin 3} w_i^2 S_{ii} = a + b + c`. -/
def trWSW (a b c : Int) : Int :=
  (List.finRange 3).foldl (fun acc i => acc + diagVec3 a b c i) 0

/-- Exact scaled Hilbert-Schmidt trace `4 Tr((W S W)^2) = ∑_{i, j : Fin 3} w_i^2 w_j^2 (4 |S_{ij}|^2)`. -/
def trWSWsq4 (rSq a b c : Int) : Int :=
  (List.finRange 3).foldl (fun acc i =>
    acc + (List.finRange 3).foldl (fun acc2 j =>
      acc2 + diagVec3 a b c i * diagVec3 a b c j * circNormSq4 rSq i j) 0) 0

/-- Pairwise variance `V(a, b, c) = (a - b)^2 + (b - c)^2 + (c - a)^2`. -/
def warpVariance (a b c : Int) : Int :=
  (a - b) * (a - b) + (b - c) * (b - c) + (c - a) * (c - a)

private theorem thm8_warp_variance_nonneg (a b c : Int) : 0 ≤ warpVariance a b c := by
  unfold warpVariance
  have h1 := int_sq_nonneg (a - b)
  have h2 := int_sq_nonneg (b - c)
  have h3 := int_sq_nonneg (c - a)
  omega

/-- Theorem 8a: Unwarped `3 × 3` circulant Koide ratio computed directly from `trWSW` and `trWSWsq4`:
    `Tr(S^2) / (Tr S)^2 = 2/3` (`3 * (4 Tr(S^2)) = 8 * (Tr S)^2`) IF AND ONLY IF `r^2 = 2`. -/
theorem thm8_koide_two_thirds_iff_f4_root_ratio (rSq : Int) :
    3 * trWSWsq4 rSq 1 1 1 = 8 * (trWSW 1 1 1 * trWSW 1 1 1) ↔ rSq = 2 := by
  have hFR : List.finRange 3 = [0, 1, 2] := by decide
  simp [trWSWsq4, trWSW, hFR, diagVec3, circNormSq4]
  omega

/-- Theorem 8b: Exact `3 × 3` warped-circulant trace identity at `r^2 = 2`:
    `3 * (4 Tr((W S W)^2)) = 8 * (Tr(W S W))^2 + 2 * V(a, b, c)` for ALL diagonal warp profiles `a, b, c`. -/
theorem thm8_warp_koide_exact_identity (a b c : Int) :
    3 * trWSWsq4 2 a b c = 8 * (trWSW a b c * trWSW a b c) + 2 * warpVariance a b c := by
  have hFR : List.finRange 3 = [0, 1, 2] := by decide
  simp [trWSWsq4, trWSW, warpVariance, hFR, diagVec3, circNormSq4,
    Int.add_mul, Int.mul_add, Int.sub_mul, Int.mul_sub]
  rw [Int.mul_comm b a, Int.mul_comm c a, Int.mul_comm c b]
  omega

/-- Theorem 8c: Exact lower bound `Q((W S W)^2) ≥ 2/3` (`8 * (Tr(W S W))^2 ≤ 3 * (4 Tr((W S W)^2))`)
    for EVERY diagonal warp profile `W = diag(w_0, w_1, w_2)` acting on `S(√2, δ)`. -/
theorem thm8_warp_koide_ge_two_thirds (a b c : Int) :
    8 * (trWSW a b c * trWSW a b c) ≤ 3 * trWSWsq4 2 a b c := by
  rw [thm8_warp_koide_exact_identity]
  have hV := thm8_warp_variance_nonneg a b c
  omega

/-- Theorem 8d: Equality `Q((W S W)^2) = 2/3` holds IF AND ONLY IF all three diagonal warp weights
    are uniform (`a = b = c`). -/
theorem thm8_warp_koide_eq_iff_uniform (a b c : Int) :
    3 * trWSWsq4 2 a b c = 8 * (trWSW a b c * trWSW a b c) ↔ (a = b ∧ b = c) := by
  rw [thm8_warp_koide_exact_identity]
  constructor
  · intro h
    have hV0 : warpVariance a b c = 0 := by omega
    unfold warpVariance at hV0
    have h1 := int_sq_nonneg (a - b)
    have h2 := int_sq_nonneg (b - c)
    have h3 := int_sq_nonneg (c - a)
    have hz1 : (a - b) * (a - b) = 0 := by omega
    have hz2 : (b - c) * (b - c) = 0 := by omega
    have hab : a - b = 0 := (Int.mul_eq_zero.mp hz1).elim id id
    have hbc : b - c = 0 := (Int.mul_eq_zero.mp hz2).elim id id
    omega
  · rintro ⟨rfl, rfl⟩
    unfold warpVariance
    omega


/-! ## Theorem 9: Electroweak Higgs Doublet Mass Matrix, `m_γ = 0` & Tree-Level Custodial `ρ = 1` -/

/-- Action of the electroweak covariant derivative `2 D = g (W^1 σ_1 + W^3 σ_3) + gp B I_2`
    on the real Higgs doublet vacuum `Φ = (0, v)`: returns `(g W^1 v, (-g W^3 + gp B) v)`. -/
def ewHiggsCovDeriv (g gp v w1 w3 b : Int) : Int × Int :=
  (g * w1 * v, (-g * w3 + gp * b) * v)

/-- Squared norm `4 |D Φ|^2` giving the gauge-boson mass-squared quadratic form directly from `Φ = (0, v)`. -/
def ewHiggsMassQuad (g gp v w1 w3 b : Int) : Int :=
  let d := ewHiggsCovDeriv g gp v w1 w3 b
  d.1 * d.1 + d.2 * d.2

/-- Neutral `(W^3, B)` mass-squared matrix action `M^2_neutral (x, y)` (scaled by `4`)
    derived from the neutral block `v^2 (-g W^3 + gp B)^2` of `ewHiggsMassQuad`. -/
def ewNeutralMul (g gp v x y : Int) : Int × Int :=
  (g * g * v * v * x - g * gp * v * v * y,
   -(g * gp * v * v * x) + gp * gp * v * v * y)

/-- Theorem 9a: Exact massless photon for ALL `g, gp, v`: the photon state `(W^3, B) = (gp, g)`
    annihilates both `D Φ` (`ewHiggsMassQuad = 0`) and `M^2_neutral`. -/
theorem thm9_photon_exact_zero_mode (g gp v : Int) :
    ewHiggsMassQuad g gp v 0 gp g = 0 ∧ ewNeutralMul g gp v gp g = (0, 0) := by
  have hZeroD : -g * gp + gp * g = 0 := by
    rw [Int.neg_mul, Int.mul_comm g gp]
    omega
  have hQuad : ewHiggsMassQuad g gp v 0 gp g = 0 := by
    unfold ewHiggsMassQuad ewHiggsCovDeriv
    rw [hZeroD]
    simp only [Int.mul_zero, Int.zero_mul, Int.add_zero]
  have h1 : g * g * v * v * gp = g * gp * v * v * g := by
    calc
      g * g * v * v * gp = (g * g) * (v * v) * gp := by rw [Int.mul_assoc (g * g) v v]
      _ = g * (g * (v * v)) * gp := by rw [Int.mul_assoc g g (v * v)]
      _ = g * ((v * v) * g) * gp := by rw [Int.mul_comm g (v * v)]
      _ = g * (v * v) * g * gp := by rw [← Int.mul_assoc g (v * v) g]
      _ = g * (v * v) * (g * gp) := by rw [Int.mul_assoc (g * (v * v)) g gp]
      _ = g * (v * v) * (gp * g) := by rw [Int.mul_comm g gp]
      _ = g * (v * v) * gp * g := by rw [← Int.mul_assoc (g * (v * v)) gp g]
      _ = g * ((v * v) * gp) * g := by rw [Int.mul_assoc g (v * v) gp]
      _ = g * (gp * (v * v)) * g := by rw [Int.mul_comm (v * v) gp]
      _ = g * gp * (v * v) * g := by rw [← Int.mul_assoc g gp (v * v)]
      _ = g * gp * v * v * g := by rw [← Int.mul_assoc (g * gp) v v]
  have h2 : g * gp * v * v * gp = gp * gp * v * v * g := by
    calc
      g * gp * v * v * gp = (g * gp) * (v * v) * gp := by rw [Int.mul_assoc (g * gp) v v]
      _ = (gp * g) * (v * v) * gp := by rw [Int.mul_comm g gp]
      _ = gp * (g * (v * v)) * gp := by rw [Int.mul_assoc gp g (v * v)]
      _ = gp * ((v * v) * g) * gp := by rw [Int.mul_comm g (v * v)]
      _ = gp * (v * v) * g * gp := by rw [← Int.mul_assoc gp (v * v) g]
      _ = gp * (v * v) * (g * gp) := by rw [Int.mul_assoc (gp * (v * v)) g gp]
      _ = gp * (v * v) * (gp * g) := by rw [Int.mul_comm g gp]
      _ = gp * (v * v) * gp * g := by rw [← Int.mul_assoc (gp * (v * v)) gp g]
      _ = gp * ((v * v) * gp) * g := by rw [Int.mul_assoc gp (v * v) gp]
      _ = gp * (gp * (v * v)) * g := by rw [Int.mul_comm (v * v) gp]
      _ = gp * gp * (v * v) * g := by rw [← Int.mul_assoc gp gp (v * v)]
      _ = gp * gp * v * v * g := by rw [← Int.mul_assoc (gp * gp) v v]
  refine ⟨hQuad, ?_⟩
  unfold ewNeutralMul
  rw [h1, h2]
  exact Prod.ext (by omega) (by omega)

/-- Theorem 9b: Exact `Z^0` boson eigenmode `(g, -gp)` with eigenvalue `(g^2 + gp^2) v^2` for ALL `g, gp, v`. -/
theorem thm9_z_boson_eigenmode (g gp v : Int) :
    ewNeutralMul g gp v g (-gp) = ((g * g + gp * gp) * v * v * g, (g * g + gp * gp) * v * v * (-gp)) := by
  unfold ewNeutralMul
  have h1 : g * g * v * v * g - g * gp * v * v * (-gp) = (g * g + gp * gp) * v * v * g := by
    have hNeg : -(g * gp * v * v * (-gp)) = gp * gp * v * v * g := by
      have hMulNeg : g * gp * v * v * (-gp) = -(g * gp * v * v * gp) := Int.mul_neg _ _
      rw [hMulNeg, Int.neg_neg]
      calc
        g * gp * v * v * gp = (g * gp) * (v * v) * gp := by rw [Int.mul_assoc (g * gp) v v]
        _ = (gp * g) * (v * v) * gp := by rw [Int.mul_comm g gp]
        _ = gp * (g * (v * v)) * gp := by rw [Int.mul_assoc gp g (v * v)]
        _ = gp * ((v * v) * g) * gp := by rw [Int.mul_comm g (v * v)]
        _ = gp * (v * v) * g * gp := by rw [← Int.mul_assoc gp (v * v) g]
        _ = gp * (v * v) * (g * gp) := by rw [Int.mul_assoc (gp * (v * v)) g gp]
        _ = gp * (v * v) * (gp * g) := by rw [Int.mul_comm g gp]
        _ = gp * (v * v) * gp * g := by rw [← Int.mul_assoc (gp * (v * v)) gp g]
        _ = gp * ((v * v) * gp) * g := by rw [Int.mul_assoc gp (v * v) gp]
        _ = gp * (gp * (v * v)) * g := by rw [Int.mul_comm (v * v) gp]
        _ = gp * gp * (v * v) * g := by rw [← Int.mul_assoc gp gp (v * v)]
        _ = gp * gp * v * v * g := by rw [← Int.mul_assoc (gp * gp) v v]
    have hDist : (g * g + gp * gp) * v * v * g = g * g * v * v * g + gp * gp * v * v * g := by
      rw [Int.add_mul, Int.add_mul, Int.add_mul]
    rw [hDist]
    omega
  have h2 : -(g * gp * v * v * g) + gp * gp * v * v * (-gp) = (g * g + gp * gp) * v * v * (-gp) := by
    have hSwap : -(g * gp * v * v * g) = g * g * v * v * (-gp) := by
      rw [Int.mul_neg]
      apply congrArg Neg.neg
      calc
        g * gp * v * v * g = (g * gp) * (v * v) * g := by rw [Int.mul_assoc (g * gp) v v]
        _ = g * (gp * (v * v)) * g := by rw [Int.mul_assoc g gp (v * v)]
        _ = g * ((v * v) * gp) * g := by rw [Int.mul_comm gp (v * v)]
        _ = g * (v * v) * gp * g := by rw [← Int.mul_assoc g (v * v) gp]
        _ = g * (v * v) * (gp * g) := by rw [Int.mul_assoc (g * (v * v)) gp g]
        _ = g * (v * v) * (g * gp) := by rw [Int.mul_comm gp g]
        _ = g * (v * v) * g * gp := by rw [← Int.mul_assoc (g * (v * v)) g gp]
        _ = g * ((v * v) * g) * gp := by rw [Int.mul_assoc g (v * v) g]
        _ = g * (g * (v * v)) * gp := by rw [Int.mul_comm (v * v) g]
        _ = g * g * (v * v) * gp := by rw [← Int.mul_assoc g g (v * v)]
        _ = g * g * v * v * gp := by rw [← Int.mul_assoc (g * g) v v]
    have hDist : (g * g + gp * gp) * v * v * (-gp) = g * g * v * v * (-gp) + gp * gp * v * v * (-gp) := by
      rw [Int.add_mul, Int.add_mul, Int.add_mul]
    rw [hSwap, hDist]
  exact Prod.ext h1 h2

/-- Theorem 9c: Tree-level custodial symmetry `ρ = m_W^2 / (m_Z^2 cos^2 θ_W) = 1` derived
    directly from the Higgs-doublet kinetic form `ewHiggsMassQuad`:
    the charged `W` excitation `(1, 0, 0)` and the unnormalized `Z` excitation `(0, g, -gp)`
    (squared norm `g^2 + gp^2`) obey `ewHiggsMassQuad(W) * (g^2 + gp^2)^2 = ewHiggsMassQuad(Z) * g^2`. -/
theorem thm9_custodial_rho_eq_one (g gp v : Int) :
    ewHiggsMassQuad g gp v 1 0 0 * ((g * g + gp * gp) * (g * g + gp * gp)) =
      ewHiggsMassQuad g gp v 0 g (-gp) * (g * g) := by
  unfold ewHiggsMassQuad ewHiggsCovDeriv
  simp only [Int.mul_one, Int.mul_zero, Int.zero_mul, Int.add_zero, Int.zero_add]
  have hZ : -g * g + gp * (-gp) = -(g * g + gp * gp) := by
    rw [Int.neg_mul, Int.mul_neg]
    omega
  rw [hZ, Int.neg_mul, Int.neg_mul, Int.mul_neg, Int.neg_neg]
  have hSq : ∀ x : Int, x * v * (x * v) = (x * x) * (v * v) := by
    intro x
    calc x * v * (x * v) = x * (v * (x * v)) := Int.mul_assoc x v (x * v)
      _ = x * ((v * x) * v) := by rw [← Int.mul_assoc v x v]
      _ = x * ((x * v) * v) := by rw [Int.mul_comm v x]
      _ = x * (x * (v * v)) := by rw [Int.mul_assoc x v v]
      _ = (x * x) * (v * v) := (Int.mul_assoc x x (v * v)).symm
  have hSwap : ∀ x y z : Int, x * y * z = (z * y) * x := by
    intro x y z
    calc x * y * z = x * (y * z) := Int.mul_assoc x y z
      _ = x * (z * y) := by rw [Int.mul_comm y z]
      _ = (z * y) * x := Int.mul_comm x (z * y)
  rw [hSq g, hSq (g * g + gp * gp)]
  exact hSwap (g * g) (v * v) ((g * g + gp * gp) * (g * g + gp * gp))


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

private theorem thm10_ps16_count : psGen16.length = 16 := by decide

/-- Exact embedding equivalence: `Y = T_3^R + (B - L)/2` on `(4,2,1) + (4bar,1,2)` reproduces
    all 16 Standard Model hypercharges and weak isospins in `spin10Gen16` state by state. -/
theorem thm10_ps16_matches_spin10 :
    psGen16.map (fun s => (s.sixY, s.twoT3L)) =
      spin10Gen16.map (fun s => (s.sixY, s.twoT3)) := by
  decide

theorem thm10_ps_trace_bl_zero :
    sumIntList (psGen16.map (fun s => s.threeBL)) = 0 := by decide

theorem thm10_ps_trace_t3L_sq :
    sumIntList (psGen16.map (fun s => s.twoT3L * s.twoT3L)) = 8 := by decide

theorem thm10_ps_trace_t3R_sq :
    sumIntList (psGen16.map (fun s => s.twoT3R * s.twoT3R)) = 8 := by decide

theorem thm10_ps_trace_bl_sq :
    sumIntList (psGen16.map (fun s => s.threeBL * s.threeBL)) = 48 := by decide

theorem thm10_ps_trace_bl_t3R_orthogonal :
    sumIntList (psGen16.map (fun s => s.threeBL * s.twoT3R)) = 0 := by decide

theorem thm10_ps_trace_y_sq :
    sumIntList (psGen16.map (fun s => s.sixY * s.sixY)) = 120 := by decide

/-- Exact derivation of the `(3/5, 2/5)` Pati-Salam-to-SM hypercharge matching weights directly
    from the traces on `psGen16`: `Tr((6 Y)^2) = 9 Tr((2 T_3^R)^2) + Tr((3(B - L))^2) = 72 + 48 = 120`. -/
theorem thm10_ps_matching_weights_from_traces :
    let trY2  := sumIntList (psGen16.map (fun s => s.sixY * s.sixY))
    let trR2  := sumIntList (psGen16.map (fun s => (3 * s.twoT3R) * (3 * s.twoT3R)))
    let trBL2 := sumIntList (psGen16.map (fun s => s.threeBL * s.threeBL))
    trY2 = trR2 + trBL2 ∧ 5 * trR2 = 3 * trY2 ∧ 5 * trBL2 = 2 * trY2 := by
  decide

/-- Exact Eisenstein dyadic mod-3 congruence: `2^{p + 1} mod 3` alternates strictly between
    `2` (even `p`) and `1` (odd `p`) for ALL `p : Nat`. -/
theorem thm10_dyadic_pow2_mod3 :
    ∀ p : Nat, (2 ^ (p + 1)) % 3 = if p % 2 = 0 then 2 else 1 := by
  intro p
  induction p with
  | zero => decide
  | succ k ih =>
    have hPow : 2 ^ (k + 2) = 2 * 2 ^ (k + 1) := by
      rw [Nat.pow_succ, Nat.mul_comm]
    rw [hPow]
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
    sumIntList (spin10Gen16.map (fun s => s.colorWeight)) = 12 := by decide

/-- Exact `SO(10)` DFSZ axion electromagnetic-to-color anomaly ratio `E / N = 8 / 3`,
    computed independently from `s.sixQ` (`E = Tr(Q^2) = sumQ2 / 36 = 16/3`) and `s.colorWeight`
    (`N = ∑ T_{SU(3)}(R) = sumColorWeight / 6 = 2` per generation, since each color triplet/antitriplet
    has `dim = 3` and Dynkin index `1/2`, contributing `1/6` per colored Weyl state).
    Cleared of denominators: `3 * sumQ2 = 8 * (6 * sumColorWeight)` for ALL `nGen : Nat`. -/
theorem thm13_axion_e_over_n_eight_thirds (nGen : Nat) :
    3 * ((nGen : Int) * sumIntList (spin10Gen16.map (fun s => s.sixQ * s.sixQ)))
      = 8 * (6 * ((nGen : Int) * sumIntList (spin10Gen16.map (fun s => s.colorWeight)))) := by
  rw [thm7_trace_q_sq_scaled, thm13_color_weight_sum]
  omega

end Vibe
