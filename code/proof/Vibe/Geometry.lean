module

public import Vibe.Algebra
public import Mathlib.Data.Rat.Defs
public import Mathlib.Algebra.Order.Field.Rat
import Mathlib.Tactic.Ring
import Mathlib.Tactic.FieldSimp
import Mathlib.Tactic.Positivity
import Mathlib.Tactic.Linarith

/-!
# Vibe Theory: Conditional Warped Cusp Geometry, Causality & 4D `D_4` Lattice Theorems

- Theorem 5: Conditioned on shell growth `h0 : N 0 ≥ 1`, `hstep : ∀ D, N (D + 1) ≥ 18 * N D`
  (discharged unconditionally in `Vibe.CuspGrowth`) and single-face `cuspLateralLinks`:
  `1/N_D^2` column resistance divergence `17 R(F) + 1 ≥ 18^F` (`∀ F`) and lateral link bound
  `cuspLateralLinks D < N D` (`∀ D ≥ 1`).
- Theorem 6: Shared-column Rayleigh-quotient scale invariance over Mathlib `ℚ` and strict
  subluminality `K_eff < M_eff` (`cUniversalSq < 1`) for every canonical weighted column at `F ≥ 2`.
- Explicit 24-vector `D_4` root-system geometry: 256-component Celmaster (1982) rank-4 `SO(4)`
  isotropy (with `ℤ^4` negative control), triangular plaquette enumeration, and the combinatorial
  zero-straddling-triangle geometric premise for 4D `D_4` site-hyperplane reflection positivity.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Theorem 5: `1/N_D^2` Column Resistance Divergence & `{3,4,3,4}` Lateral Links (`∀ F`) -/

/-- Exact vertical column resistance across `F` floors under pair-density warp `w(D) = 1 / N_D^2`:
    `R(F) = ∑_{D = 0}^{F - 1} N_D`. -/
def colResistance (N : Nat → Nat) (F : Nat) : Nat := sumNat F N

/-- Exponential shell-growth lower bound `N_D ≥ 18^D` for ALL depths `D : Nat`. -/
theorem thm5_shell_exp_lower_bound (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ D : Nat, N D ≥ 18 ^ D := by
  intro D; induction D with
  | zero => simpa using h0
  | succ D ih => have := hstep D; rw [Nat.pow_succ]; omega

/-- Theorem 5a: Exact exponential divergence bound `17 * R(F) + 1 ≥ 18^F` for ALL `F : Nat`. -/
theorem thm5_resistance_exp_lower_bound (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ F : Nat, 17 * colResistance N F + 1 ≥ 18 ^ F := by
  intro F; induction F with
  | zero => simp [colResistance, sumNat]
  | succ F ih =>
    have hNF := thm5_shell_exp_lower_bound N h0 hstep F
    simp only [colResistance, sumNat] at ih ⊢
    rw [Nat.pow_succ]; omega

private theorem pow18_linear_lower : ∀ F : Nat, 18 ^ F ≥ 1 + 17 * F := by
  intro F; induction F with
  | zero => decide
  | succ F ih => rw [Nat.pow_succ]; omega

/-- Theorem 5b: `R(F)` is strictly increasing for ALL `F : Nat`. -/
theorem thm5_resistance_strictly_increasing (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ F : Nat, colResistance N (F + 1) > colResistance N F := by
  intro F
  have hNF := thm5_shell_exp_lower_bound N h0 hstep F
  have hPow : 18 ^ F ≥ 1 := Nat.one_le_pow F 18 (by decide)
  simp only [colResistance, sumNat]; omega

/-- Theorem 5c: `R(F) → ∞` (unbounded for ALL targets `B : Nat`). -/
theorem thm5_resistance_unbounded (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ B : Nat, ∃ F : Nat, colResistance N F > B := by
  intro B
  refine ⟨B + 1, ?_⟩
  have hExp := thm5_resistance_exp_lower_bound N h0 hstep (B + 1)
  have hLin := pow18_linear_lower (B + 1)
  omega

/-- Exact `{3,4,3,4}` single-face incremental lateral links at depth `D`:
    `1` at `D = 0` and `4 * 5^(D - 1)` for `D ≥ 1`. -/
def cuspLateralLinks : Nat → Nat
  | 0 => 1
  | d + 1 => 4 * 5 ^ d

/-- Exact cumulative single-face lateral link identity `∑_{d=0}^{D} cuspLateralLinks d = 5^D`. -/
theorem thm5_cusp_lateral_cumulative : ∀ D : Nat, sumNat (D + 1) cuspLateralLinks = 5 ^ D := by
  intro D; induction D with
  | zero => decide
  | succ d ih =>
    change sumNat (d + 1) cuspLateralLinks + 4 * 5 ^ d = 5 ^ (d + 1)
    rw [ih, Nat.pow_succ]; omega

/-- For EVERY depth `D ≥ 1`, single-face lateral links `l_D` are strictly smaller than `18^D ≤ N_D`. -/
theorem thm5_cusp_lateral_lt_shell (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ D : Nat, D ≥ 1 → cuspLateralLinks D < N D := by
  intro D hD
  have hBound := thm5_shell_exp_lower_bound N h0 hstep D
  cases D with
  | zero => omega
  | succ d =>
    have hPowLt : 4 * 5 ^ d < 18 ^ (d + 1) := by
      have h5 : 5 ^ d ≤ 18 ^ d := Nat.pow_le_pow_left (by decide) d
      rw [Nat.pow_succ]
      have hPos : 1 ≤ 18 ^ d := Nat.one_le_pow d 18 (by decide)
      omega
    change 4 * 5 ^ d < N (d + 1)
    omega


/-! ## Theorem 6: Shared-Column Rayleigh Scale Invariance & `{3,4,3,4}` Strict Subluminality -/

/-- Exact rational Rayleigh quotient backed by Mathlib `ℚ`. -/
abbrev PosRat := ℚ

namespace PosRat

/-- Exact rational equality on `ℚ`. -/
def eq (a b : PosRat) : Prop := a = b

/-- Exact strict subluminal inequality `a < 1` on `ℚ`. -/
def ltOne (a : PosRat) : Prop := a < 1

end PosRat

/-- Shared warped cusp column data for floor `F ≥ 1` with positive layer masses `M_D > 0`
    and positive lateral stiffnesses `K_D > 0`. -/
structure WarpedColumn where
  F : Nat
  hF : F ≥ 1
  M : Nat → Nat
  K : Nat → Nat
  hM : ∀ D : Nat, D < F → M D > 0
  hK : ∀ D : Nat, D < F → K D > 0

namespace WarpedColumn

def mEff (C : WarpedColumn) : Nat := sumNat C.F C.M
def kEff (C : WarpedColumn) : Nat := sumNat C.F C.K

private theorem mEff_pos (C : WarpedColumn) : C.mEff > 0 :=
  sumNat_pos C.F C.M C.hF C.hM

/-- Base column Rayleigh quotient `K_eff / M_eff ∈ ℚ`. -/
def cUniversalSq (C : WarpedColumn) : PosRat :=
  (C.kEff : ℚ) / (C.mEff : ℚ)

/-- Rescaled Rayleigh quotient `(s * K_eff) / (s * M_eff) ∈ ℚ` for any positive factor `s > 0`. -/
def scaledRayleigh (C : WarpedColumn) (s : Nat) (_ : s > 0) : PosRat :=
  ((s * C.kEff : Nat) : ℚ) / ((s * C.mEff : Nat) : ℚ)

end WarpedColumn

/-- Theorem 6a: Shared-column Rayleigh-quotient scale invariance over `ℚ`. -/
theorem thm6_rayleigh_scale_invariance (C : WarpedColumn)
    (s1 s2 : Nat) (h1 : s1 > 0) (h2 : s2 > 0) :
    PosRat.eq (C.scaledRayleigh s1 h1) C.cUniversalSq ∧
    PosRat.eq (C.scaledRayleigh s2 h2) C.cUniversalSq ∧
    PosRat.eq (C.scaledRayleigh s1 h1) (C.scaledRayleigh s2 h2) := by
  have hs1 : (s1 : ℚ) ≠ 0 := by positivity
  have hs2 : (s2 : ℚ) ≠ 0 := by positivity
  have hm : (C.mEff : ℚ) ≠ 0 := Nat.cast_ne_zero.mpr (Nat.ne_of_gt C.mEff_pos)
  have e1 : C.scaledRayleigh s1 h1 = C.cUniversalSq := by
    simp only [WarpedColumn.scaledRayleigh, WarpedColumn.cUniversalSq, Nat.cast_mul]
    field_simp [hs1, hm]
  have e2 : C.scaledRayleigh s2 h2 = C.cUniversalSq := by
    simp only [WarpedColumn.scaledRayleigh, WarpedColumn.cUniversalSq, Nat.cast_mul]
    field_simp [hs2, hm]
  exact ⟨e1, e2, e1.trans e2.symm⟩

/-- Construct the concrete weighted `{3,4,3,4}` cusp `WarpedColumn`. -/
def cuspWarpedColumn (N w : Nat → Nat) (F : Nat) (hF : F ≥ 1)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D)
    (hw : ∀ D : Nat, w D > 0) : WarpedColumn where
  F := F
  hF := hF
  M := fun D => w D * N D
  K := fun D => w D * cuspLateralLinks D
  hM := fun D _ => by
    have hExp := thm5_shell_exp_lower_bound N h0 hstep D
    have hPow := Nat.one_le_pow D 18 (by decide)
    exact Nat.mul_pos (hw D) (by omega)
  hK := fun D _ => by
    have hL : cuspLateralLinks D > 0 := by
      cases D with
      | zero => decide
      | succ d => have := Nat.one_le_pow d 5 (by decide); change 4 * 5 ^ d > 0; omega
    exact Nat.mul_pos (hw D) hL

/-- Theorem 6b: Conditional canonical single-face strict subluminality (`K_eff < M_eff`,
    `cUniversalSq < 1`, and every rescaled Rayleigh quotient `< 1`) for EVERY floor `F ≥ 2`. -/
theorem thm6_strictly_subluminal (N w : Nat → Nat) (F : Nat) (hF : F ≥ 2)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D)
    (hw : ∀ D : Nat, w D > 0) (s : Nat) (hs : s > 0) :
    let C := cuspWarpedColumn N w F (by omega) h0 hstep hw
    C.kEff < C.mEff ∧
    PosRat.ltOne C.cUniversalSq ∧
    PosRat.ltOne (C.scaledRayleigh s hs) := by
  intro C
  have hle : ∀ D : Nat, D < F → w D * cuspLateralLinks D ≤ w D * N D := by
    intro D _
    cases D with
    | zero => exact Nat.mul_le_mul_left (w 0) h0
    | succ d => exact Nat.mul_le_mul_left (w (d + 1)) (Nat.le_of_lt (thm5_cusp_lateral_lt_shell N h0 hstep (d + 1) (by omega)))
  have h1 : w 1 * cuspLateralLinks 1 < w 1 * N 1 :=
    Nat.mul_lt_mul_of_pos_left (thm5_cusp_lateral_lt_shell N h0 hstep 1 (by omega)) (hw 1)
  have hSub : C.kEff < C.mEff :=
    sumNat_lt_of_step F (fun D => w D * cuspLateralLinks D) (fun D => w D * N D) hF hle h1
  have hBase : PosRat.ltOne C.cUniversalSq := by
    unfold PosRat.ltOne WarpedColumn.cUniversalSq
    have hm : (0 : ℚ) < (C.mEff : ℚ) := Nat.cast_pos.mpr C.mEff_pos
    rw [div_lt_one hm]
    exact_mod_cast hSub
  have hScale : C.scaledRayleigh s hs = C.cUniversalSq :=
    (thm6_rayleigh_scale_invariance C s s hs hs).1
  exact ⟨hSub, hBase, hScale ▸ hBase⟩


/-! ## Explicit 4D `D_4` Root System: Rank-4 `SO(4)` Isotropy, Triangles & Zero-Straddling Premise -/

/-- Exact 4D integer lattice coordinate vector `(x_0, x_1, x_2, x_3) ∈ ℤ^4`. -/
abbrev Vec4 := Int × Int × Int × Int

def dot4 (u v : Vec4) : Int :=
  u.1 * v.1 + u.2.1 * v.2.1 + u.2.2.1 * v.2.2.1 + u.2.2.2 * v.2.2.2

def sub4 (u v : Vec4) : Vec4 :=
  (u.1 - v.1, u.2.1 - v.2.1, u.2.2.1 - v.2.2.1, u.2.2.2 - v.2.2.2)

def coord4 (v : Vec4) : Fin 4 → Int
  | ⟨0, _⟩ => v.1
  | ⟨1, _⟩ => v.2.1
  | ⟨2, _⟩ => v.2.2.1
  | ⟨3, _⟩ => v.2.2.2

/-- Explicit 24 root vectors of the 4D `D_4` root system (vertices of the 24-cell):
    all 6 coordinate pairs × 4 sign choices `(±1, ±1, 0, 0)`. -/
def d4Roots : List Vec4 :=
  [ ( 1,  1,  0,  0), ( 1, -1,  0,  0), (-1,  1,  0,  0), (-1, -1,  0,  0),
    ( 1,  0,  1,  0), ( 1,  0, -1,  0), (-1,  0,  1,  0), (-1,  0, -1,  0),
    ( 1,  0,  0,  1), ( 1,  0,  0, -1), (-1,  0,  0,  1), (-1,  0,  0, -1),
    ( 0,  1,  1,  0), ( 0,  1, -1,  0), ( 0, -1,  1,  0), ( 0, -1, -1,  0),
    ( 0,  1,  0,  1), ( 0,  1,  0, -1), ( 0, -1,  0,  1), ( 0, -1,  0, -1),
    ( 0,  0,  1,  1), ( 0,  0,  1, -1), ( 0,  0, -1,  1), ( 0,  0, -1, -1) ]

/-- Negative control: the 8 nearest-neighbor unit vectors `(±1, 0, 0, 0)` of hypercubic `ℤ^4`. -/
def z4Roots : List Vec4 :=
  [ ( 1,  0,  0,  0), (-1,  0,  0,  0),
    ( 0,  1,  0,  0), ( 0, -1,  0,  0),
    ( 0,  0,  1,  0), ( 0,  0, -1,  0),
    ( 0,  0,  0,  1), ( 0,  0,  0, -1) ]

/-- Exact 4th-moment tensor component `T_{ijkl} = ∑_{r ∈ roots} r_i r_j r_k r_l`. -/
def moment4 (roots : List Vec4) (i j k l : Fin 4) : Int :=
  (roots.map fun r => coord4 r i * coord4 r j * coord4 r k * coord4 r l).sum

def kron4 (a b : Fin 4) : Int :=
  if a = b then 1 else 0

/-- Exact `D_4` root-system certificate: 24 distinct vectors, each of squared norm `2`. -/
theorem thm_d4_root_system :
    d4Roots.length = 24 ∧
    d4Roots.Nodup ∧
    d4Roots.all (fun r => dot4 r r == 2) = true := by
  decide

/-- Exact Celmaster (1982) rank-4 `SO(4)` isotropy across ALL `4^4 = 256` tensor components. -/
theorem thm_d4_rank4_so4_isotropy :
    ∀ i j k l : Fin 4,
      moment4 d4Roots i j k l =
        4 * (kron4 i j * kron4 k l + kron4 i k * kron4 j l + kron4 i l * kron4 j k) := by
  decide

/-- Negative control: hypercubic `ℤ^4` violates rank-4 `SO(4)` isotropy on every coordinate pair `i ≠ j`. -/
theorem thm_z4_fails_rank4_isotropy :
    ∀ i j : Fin 4, i ≠ j → moment4 z4Roots i i i i ≠ 3 * moment4 z4Roots i i j j := by
  decide

/-- Number of `D_4` roots `r'` having inner product `r · r' = 1` with a given root `r`. -/
def d4SharedTrianglesPerLink (r : Vec4) : Nat :=
  (d4Roots.filter (fun r' => dot4 r r' == 1)).length

/-- Exact `D_4` triangular-plaquette geometry directly enumerated on `d4Roots`. -/
theorem thm_d4_triangular_plaquette_geometry :
    (d4Roots.all (fun r => d4SharedTrianglesPerLink r == 8) = true) ∧
    (d4Roots.all (fun r =>
      (d4Roots.filter (fun r' => dot4 r r' == 1)).all (fun r' =>
        d4Roots.contains (sub4 r' r))) = true) ∧
    (d4Roots.length * 8 = 3 * 64) := by
  decide

private theorem d4Roots_abs_x0_le_one :
    ∀ r ∈ d4Roots, -1 ≤ r.1 ∧ r.1 ≤ 1 := by
  decide

/-- Combinatorial zero-straddling-triangle geometric premise for infinite-volume 4D `D_4`
    site-hyperplane reflection positivity. -/
theorem thm_d4_no_straddling_triangles (v0 v1 v2 : Vec4)
    (h01 : sub4 v1 v0 ∈ d4Roots)
    (h02 : sub4 v2 v0 ∈ d4Roots)
    (h12 : sub4 v2 v1 ∈ d4Roots) :
    ¬ (v0.1 < 0 ∧ v1.1 > 0) ∧ ¬ (v0.1 < 0 ∧ v2.1 > 0) ∧ ¬ (v1.1 < 0 ∧ v2.1 > 0) ∧
    ¬ (v1.1 < 0 ∧ v0.1 > 0) ∧ ¬ (v2.1 < 0 ∧ v0.1 > 0) ∧ ¬ (v2.1 < 0 ∧ v1.1 > 0) := by
  have b01 := d4Roots_abs_x0_le_one (sub4 v1 v0) h01
  have b02 := d4Roots_abs_x0_le_one (sub4 v2 v0) h02
  have b12 := d4Roots_abs_x0_le_one (sub4 v2 v1) h12
  simp only [sub4] at b01 b02 b12
  omega

/-- Half-space partition corollary: EVERY triangular plaquette in infinite 4D `D_4` lies wholly
    in `{x_0 ≥ 0}` or wholly in `{x_0 ≤ 0}`. -/
theorem thm_d4_triangle_halfspace_decomposition (v0 v1 v2 : Vec4)
    (h01 : sub4 v1 v0 ∈ d4Roots)
    (h02 : sub4 v2 v0 ∈ d4Roots)
    (h12 : sub4 v2 v1 ∈ d4Roots) :
    (v0.1 ≥ 0 ∧ v1.1 ≥ 0 ∧ v2.1 ≥ 0) ∨ (v0.1 ≤ 0 ∧ v1.1 ≤ 0 ∧ v2.1 ≤ 0) := by
  have h := thm_d4_no_straddling_triangles v0 v1 v2 h01 h02 h12
  omega

end Vibe

end
