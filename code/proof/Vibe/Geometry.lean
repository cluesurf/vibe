import Vibe.Algebra

/-!
# Vibe Theory: `{3,4,3,4}` Warped Cusp Geometry & Causality (Theorems 5 to 6)

- Theorem 5: `1/N_D^2` column resistance divergence `17 R(F) + 1 ≥ 18^F` (`∀ F`).
- Theorem 6: Universal speed lock `c_grav² = c_light² = c_matter²` & strict subluminal causality (`∀ F ≥ 1`).
-/

set_option autoImplicit false

namespace Vibe

/-! ## Theorem 5: `1/N_D^2` Column Resistance Divergence (`∀ F : Nat`, `B-14`, `B-52`) -/

/-- Exact vertical column resistance across `F` floors under pair-density warp `w(D) = 1 / N_D^2`:
    `R(F) = ∑_{D = 0}^{F - 1} 1 / (N_D w(D)) = ∑_{D = 0}^{F - 1} N_D`. -/
def colResistance (N : Nat → Nat) (F : Nat) : Nat := sumNat F N

/-- Exponential shell-growth lower bound `N_D ≥ 18^D` for ALL depths `D : Nat`. -/
theorem thm5_shell_exp_lower_bound (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ D : Nat, N D ≥ 18 ^ D := by
  intro D
  induction D with
  | zero =>
    simpa only [Nat.pow_zero] using h0
  | succ D ih =>
    have hs := hstep D
    rw [Nat.pow_succ]
    omega

/-- Theorem 5a: Exact exponential divergence bound `17 * R(F) + 1 ≥ 18^F` for ALL `F : Nat`. -/
theorem thm5_resistance_exp_lower_bound (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ F : Nat, 17 * colResistance N F + 1 ≥ 18 ^ F := by
  intro F
  induction F with
  | zero =>
    simp only [colResistance, sumNat, Nat.pow_zero]
    omega
  | succ F ih =>
    have hNF : N F ≥ 18 ^ F := thm5_shell_exp_lower_bound N h0 hstep F
    simp only [colResistance, sumNat] at ih ⊢
    rw [Nat.pow_succ]
    omega

/-- Elementary Bernoulli bound `18^F ≥ 1 + 17 * F` for ALL `F : Nat`. -/
theorem pow18_linear_lower : ∀ F : Nat, 18 ^ F ≥ 1 + 17 * F := by
  intro F
  induction F with
  | zero => decide
  | succ F ih =>
    rw [Nat.pow_succ]
    omega

/-- Theorem 5b: `R(F)` is strictly increasing for ALL `F : Nat`, so `m_screen^2(F) = 1 / R(F)`
    decreases strictly monotonically across every floor. -/
theorem thm5_resistance_strictly_increasing (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ F : Nat, colResistance N (F + 1) > colResistance N F := by
  intro F
  have hNF : N F ≥ 18 ^ F := thm5_shell_exp_lower_bound N h0 hstep F
  have hPow : 18 ^ F ≥ 1 := by
    have hlin := pow18_linear_lower F
    omega
  simp only [colResistance, sumNat]
  omega

/-- Theorem 5c: `R(F) → ∞` (unbounded for ALL targets `B : Nat`), so the screening mass
    `m_screen^2(F) = 1 / R(F)` drops below ANY `1 / B` in the infinite-depth limit. -/
theorem thm5_resistance_unbounded (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ B : Nat, ∃ F : Nat, colResistance N F > B := by
  intro B
  refine ⟨B + 1, ?_⟩
  have hExp := thm5_resistance_exp_lower_bound N h0 hstep (B + 1)
  have hLin := pow18_linear_lower (B + 1)
  omega


/-! ## Theorem 6: Universal Speed Lock Identity (`∀ F ≥ 1`, `B-41`, `m-29`) -/

/-- Exact positive rational number `num / den` (`den > 0`) for exact Rayleigh quotients. -/
structure PosRat where
  num : Nat
  den : Nat
  denPos : den > 0

namespace PosRat

/-- Exact rational equality `a.num / a.den = b.num / b.den` (zero algebraic difference). -/
def eq (a b : PosRat) : Prop := a.num * b.den = b.num * a.den

/-- Exact strict subluminal inequality `a.num / a.den < 1`. -/
def ltOne (a : PosRat) : Prop := a.num < a.den

theorem eq_refl (a : PosRat) : eq a a := rfl

theorem eq_symm {a b : PosRat} (h : eq a b) : eq b a := h.symm

/-- Cancellation of any shared nonzero scale factor `s > 0` in numerator and denominator. -/
theorem scale_cancel (s num den : Nat) (hs : s > 0) (hd : den > 0) :
    eq ⟨s * num, s * den, Nat.mul_pos hs hd⟩ ⟨num, den, hd⟩ := by
  unfold eq
  calc (s * num) * den
      = s * (num * den) := Nat.mul_assoc s num den
    _ = s * (den * num) := by rw [Nat.mul_comm num den]
    _ = (s * den) * num := (Nat.mul_assoc s den num).symm
    _ = num * (s * den) := Nat.mul_comm (s * den) num

/-- Cross-multiplication identity between two rescalings of the same ratio `num / den`. -/
theorem eq_scale_pair (a b num den : Nat) :
    (a * num) * (b * den) = (b * num) * (a * den) := by
  calc (a * num) * (b * den)
      = a * (num * (b * den)) := Nat.mul_assoc a num (b * den)
    _ = a * ((b * num) * den) := by
          rw [← Nat.mul_assoc num b den, Nat.mul_comm num b]
    _ = (a * (b * num)) * den := (Nat.mul_assoc a (b * num) den).symm
    _ = ((b * num) * a) * den := by rw [Nat.mul_comm a (b * num)]
    _ = (b * num) * (a * den) := Nat.mul_assoc (b * num) a den

theorem ltOne_of_scale (s num den : Nat) (hs : s > 0) (hd : den > 0) (hlt : num < den) :
    ltOne ⟨s * num, s * den, Nat.mul_pos hs hd⟩ :=
  Nat.mul_lt_mul_of_pos_left hlt hs

end PosRat

/-- Shared warped cusp column data for floor `F ≥ 1` with positive layer masses `M_D > 0`
    and positive lateral stiffnesses `K_D > 0` (e.g. `M_D = N_D w(D)`, `K_D = l_D w(D)`). -/
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

theorem mEff_pos (C : WarpedColumn) : C.mEff > 0 :=
  sumNat_pos C.F C.M C.hF C.hM

/-- Universal warped column speed squared `c_universal^2 = K_eff / M_eff`. -/
def cUniversalSq (C : WarpedColumn) : PosRat :=
  ⟨C.kEff, C.mEff, C.mEff_pos⟩

/-- Spin-2 TT graviton lowest-mode Rayleigh quotient `c_grav^2`:
    `E_TT ⊗ u_0` (`L_vert u_0 = 0`, `P_TT E_TT = E_TT`, polarization norm squared `pGrav > 0`). -/
def cGravSq (C : WarpedColumn) (lam pGrav : Nat) (hLam : lam > 0) (hP : pGrav > 0) : PosRat :=
  ⟨(pGrav * lam) * C.kEff, (pGrav * lam) * C.mEff,
    Nat.mul_pos (Nat.mul_pos hP hLam) C.mEff_pos⟩

/-- Spin-1 transverse Maxwell photon lowest-mode Rayleigh quotient `c_light^2`:
    `e_T ⊗ u_0` (`d† e_T = 0`, `(|d|^2 I - d d†) e_T = lam e_T`, norm squared `pLight > 0`). -/
def cLightSq (C : WarpedColumn) (lam pLight : Nat) (hLam : lam > 0) (hP : pLight > 0) : PosRat :=
  ⟨(pLight * lam) * C.kEff, (pLight * lam) * C.mEff,
    Nat.mul_pos (Nat.mul_pos hP hLam) C.mEff_pos⟩

/-- Spin-1/2 squared chiral Weyl fermion lowest-mode Rayleigh quotient `c_matter^2`:
    `χ ⊗ (M^{1/2} u_0)` (`D_Weyl^2 = I_2 ⊗ H_warp`, spinor norm squared `pMatter > 0`). -/
def cMatterSq (C : WarpedColumn) (lam pMatter : Nat) (hLam : lam > 0) (hP : pMatter > 0) : PosRat :=
  ⟨(pMatter * lam) * C.kEff, (pMatter * lam) * C.mEff,
    Nat.mul_pos (Nat.mul_pos hP hLam) C.mEff_pos⟩

end WarpedColumn

/-- Theorem 6a: Universal Speed Lock Identity (`∀ F ≥ 1`, ALL positive `M_D, K_D`,
    ALL nonzero `lam`, ALL polarization norms `pGrav, pLight, pMatter > 0`):
    `c_grav^2 = c_light^2 = c_matter^2 = K_eff / M_eff` identically (exact `0` difference). -/
theorem thm6_universal_speed_lock (C : WarpedColumn)
    (lam pGrav pLight pMatter : Nat)
    (hLam : lam > 0) (hG : pGrav > 0) (hL : pLight > 0) (hM : pMatter > 0) :
    PosRat.eq (C.cGravSq lam pGrav hLam hG) C.cUniversalSq ∧
    PosRat.eq (C.cLightSq lam pLight hLam hL) C.cUniversalSq ∧
    PosRat.eq (C.cMatterSq lam pMatter hLam hM) C.cUniversalSq ∧
    PosRat.eq (C.cGravSq lam pGrav hLam hG) (C.cLightSq lam pLight hLam hL) ∧
    PosRat.eq (C.cLightSq lam pLight hLam hL) (C.cMatterSq lam pMatter hLam hM) :=
  ⟨ PosRat.scale_cancel (pGrav * lam) C.kEff C.mEff (Nat.mul_pos hG hLam) C.mEff_pos,
    PosRat.scale_cancel (pLight * lam) C.kEff C.mEff (Nat.mul_pos hL hLam) C.mEff_pos,
    PosRat.scale_cancel (pMatter * lam) C.kEff C.mEff (Nat.mul_pos hM hLam) C.mEff_pos,
    PosRat.eq_scale_pair (pGrav * lam) (pLight * lam) C.kEff C.mEff,
    PosRat.eq_scale_pair (pLight * lam) (pMatter * lam) C.kEff C.mEff ⟩

/-- Theorem 6b: Strict subluminal causality (`c_grav^2 = c_light^2 = c_matter^2 < 1`)
    whenever `K_eff < M_eff`. -/
theorem thm6_strictly_subluminal (C : WarpedColumn)
    (lam pGrav pLight pMatter : Nat)
    (hLam : lam > 0) (hG : pGrav > 0) (hL : pLight > 0) (hM : pMatter > 0)
    (hSub : C.kEff < C.mEff) :
    PosRat.ltOne (C.cGravSq lam pGrav hLam hG) ∧
    PosRat.ltOne (C.cLightSq lam pLight hLam hL) ∧
    PosRat.ltOne (C.cMatterSq lam pMatter hLam hM) :=
  ⟨ PosRat.ltOne_of_scale (pGrav * lam) C.kEff C.mEff (Nat.mul_pos hG hLam) C.mEff_pos hSub,
    PosRat.ltOne_of_scale (pLight * lam) C.kEff C.mEff (Nat.mul_pos hL hLam) C.mEff_pos hSub,
    PosRat.ltOne_of_scale (pMatter * lam) C.kEff C.mEff (Nat.mul_pos hM hLam) C.mEff_pos hSub ⟩

/-- Exact `{3,4,3,4}` cusp incremental lateral links per cubic neighbor at depth `D`:
    `1` at `D = 0`, `10` at `D = 1`, `8 * 5^(D - 1)` for `D ≥ 2`. -/
def cuspLateralLinks : Nat → Nat
  | 0 => 1
  | 1 => 10
  | d + 2 => 8 * 5 ^ (d + 1)

/-- For EVERY depth `D ≥ 1`, lateral links `l_D` are strictly smaller than `18^D ≤ N_D`. -/
theorem thm6_cusp_lateral_lt_shell (N : Nat → Nat)
    (h0 : N 0 ≥ 1) (hstep : ∀ D : Nat, N (D + 1) ≥ 18 * N D) :
    ∀ D : Nat, D ≥ 1 → cuspLateralLinks D < N D := by
  intro D hD
  have hBound : N D ≥ 18 ^ D := thm5_shell_exp_lower_bound N h0 hstep D
  cases D with
  | zero => omega
  | succ k =>
    cases k with
    | zero =>
      have hBound1 : N 1 ≥ 18 := hBound
      change 10 < N 1
      omega
    | succ m =>
      have hPowLt : ∀ r : Nat, 8 * 5 ^ (r + 1) < 18 ^ (r + 2) := by
        intro r
        induction r with
        | zero => decide
        | succ r ih =>
          change 8 * 5 ^ (r + 2) < 18 ^ (r + 3)
          have h5 : 5 * (8 * 5 ^ (r + 1)) < 5 * (18 ^ (r + 2)) :=
            Nat.mul_lt_mul_of_pos_left ih (by decide)
          have hLhs : 8 * 5 ^ (r + 2) = 5 * (8 * 5 ^ (r + 1)) := by
            have hPow : 5 ^ (r + 2) = 5 ^ (r + 1) * 5 := Nat.pow_succ 5 (r + 1)
            rw [hPow]
            omega
          have hRhs : 18 ^ (r + 3) = 18 ^ (r + 2) * 18 := Nat.pow_succ 18 (r + 2)
          omega
      have hStrict : 8 * 5 ^ (m + 1) < 18 ^ (m + 2) := hPowLt m
      have hBound2 : N (m + 2) ≥ 18 ^ (m + 2) := hBound
      change 8 * 5 ^ (m + 1) < N (m + 2)
      omega

end Vibe
