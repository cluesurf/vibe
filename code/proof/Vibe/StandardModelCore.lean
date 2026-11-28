module

public import Vibe.Algebra
public import Vibe.CuspGrowth
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.FinCases

/-!
# Vibe Theory: Standard Model Algebraic Core on `{3,4,3,4}` (Wave-5 Closure)

Lean `4.35.0` + Mathlib `v4.35.0` formalization of the six exact algebraic pillars underlying
the Wave-5 Standard Model closure suite (`test/verify/`):

1. **`thm_sm_anomaly_cancellation_and_z6_quotient`:**
   - Exact 1-generation 16-Weyl-fermion left-handed multiplet table
     `Q_L(3,2,+1)`, `u_R^c(3bar,1,-4)`, `d_R^c(3bar,1,+2)`, `L_L(1,2,-3)`, `e_R^c(1,1,+6)`, `ν_R^c(1,1,0)`
     (in `6 Y` integer units).
   - Simultaneous cancellation of all six perturbative + global anomalies (`16` Weyl states,
     `SU(3)_C^3`, `SU(3)_C^2 U(1)_Y`, `SU(2)_L^2 U(1)_Y`, `grav^2 U(1)_Y`, `U(1)_Y^3`, and Witten
     `SU(2)_L` global parity: `N_d = 4` even vs quark-only `3` odd).
   - Exact Tong `ℤ_6` quotient congruence `(2 t + 3 d + 6 Y) ≡ 0 (mod 6)` across all 6 multiplets,
     plus exact `ℤ_18` faithful separation vs `ℤ_6` collapse (`u_R^c`/`d_R^c` and `e_R^c`/`ν_R^c`).
2. **`thm_sm_so5_custodial_rho_one_and_center_parity`:**
   - Exact `5 × 5` integer antisymmetric `so(5)` Lie-algebra basis (`su(2)_L ⊕ su(2)_R ⊕ (2, 2)`):
     exact `su(2)_L` and `su(2)_R` brackets, `[su(2)_L, su(2)_R] = 0`, unbroken custodial `[V_a, H_3] = 0`,
     and exact `z_L = diag(-1,-1,-1,-1,+1)` center-parity split (`6` center-even `so(4)` vs `4` center-odd
     Higgs bidoublet generators, plus universal `E-FRC-0279` zero-odd obstruction on all of block `SO(4)`).
   - Unconstrained homogenized symbolic finite Wilson-line mass spectrum over ALL `(g, gp, s, c : Int)`
     (`W_hom^T W_hom = (c^2 + s^2)^2 I_5` with `2 s c` generically nonzero): `M_W^2`, `M_Z^2`, `M_γ^2 = 0`,
     and exact custodial `ρ = 1` directly on the `5 × 5` Frobenius norms, contrasted with the exact `3 × 3`
     `ℤ[ω]` `SU(3)_W` Wilson-line matrix negative control (`sin^2 θ_W = 3/4 ≠ 3/8`, `ρ_{SU(3)}^2 = 4/3 ≠ 1`).
3. **`thm_sm_pure_zomega_slab_ir_light_mass`:**
   - Exact `4 × 4` (`D_* = 1`) pure-`ℤ[ω][1/2]` chiral slab operator
     `8 U_depth(1) = - (2 i C_1(π/3)) (2 B_2(2π/3)) (2 i C_1(π/3))` over `Eis`.
   - Exact `4 × 4` unitarity `(8 U)^† (8 U) = (8 U)(8 U)^† = 64 I_4`, chiral symmetry
     `σ_z (8 U) σ_z = (8 U)^†`, trace invariants `Tr(8 U) = 4`, `Tr((8 U)^2) = 112`, exact matrix
     quadratic `(8 U + 8 U^†)^2 = 4 (8 U + 8 U^†) + 176 I_4`, exact `ℤ[√5]` root certificate
     `8 cos(m_eff(1)) = 1 + 3 √5` (`16 c^2 - 4 c - 11 = 0`), and exact `1/3` zero-mode evanescent
     transfer decay (`tan(π/6) / tan(π/3) = 1/3`) with exponential `(3^D)^2` hierarchy.
4. **`thm_sm_asl23_two_transitivity_and_oh_triality_obstruction`:**
   - Exact `24`-element `SL(2, 3)` and `216`-element `ASL(2, 3)` acting faithfully on `Fin 3 × Fin 3`:
     group closure, constructive exact 2-transitivity, Burnside character norms `∑ fix = 216`,
     `∑ fix^2 = 432 = 2 · 216` (`ℂ^9 = 1 ⊕ 8` irreducible, NOT `3_C ⊗ 3_gen`), and exact non-existence
     of ANY nontrivial `ASL(2, 3)`-invariant partition (including all 4 parallel-line `3 × 3` foliations).
   - Exact `48`-element signed permutation group `O_h` acting on the 3 `D_4` 16-cell frames (`Fin 3`):
     group closure, `∑ χ = 48` (multiplicity `1` of `A_{1g}`), `∑ χ^2 = 96 = 2 · 48` (strictly
     `3_frame = A_{1g} ⊕ E_g`, NOT `3 A_{1g}`), and irreducible orthogonal `E_g` character.
5. **`thm_sm_ckr_3d_bosonization_and_fermion_exchange`:**
   - Exact 3-qubit T-junction Pauli algebra: Levin–Wen fermionic exchange `S_3 S_2 S_1 S_3 S_2 S_1 = -I`
     (phase `2 mod 4`) vs naive bosonic control `B_3 B_2 B_1 B_3 B_2 B_1 = +I` (phase `0 mod 4`).
   - Exact 8-dim Fock space over `ℤ[i]`: 6-step dynamical-phase-cancelled physical 2-fermion exchange
     `E_ex |1, 1, 0⟩ = -|1, 1, 0⟩` vs bosonic `+|1, 1, 0⟩`, exact Pauli exclusion `H_hop |1, 1⟩ = 0`,
     and exact unitarity of every swap gate `T_k`.
   - Exact `3 × 3 × 3` (`V = 27, E = 81`) 3D `{4,3,4}` periodic torus Chen–Kapustin–Radicevic
     bosonization (`S_e`, `P_v`, `G_p`): Majorana bilinear anticommutation `{S_e, S_{e'}} = 0` on
     shared same-type endpoints and commutation elsewhere, `{S_e, P_v} = 0` iff `v ∈ ∂e`,
     `[G_p, S_e] = 0`, `[G_p, G_q] = 0`, `G_p^2 = +I`, and exact 3D cube Bianchi identity
     `∏_{p ∈ ∂c} G_p = +I` on all `27` cubes.
6. **`thm_sm_cusp_shell_recurrence_and_baryon_charge`:**
   - Exact `{3,4,3,4}` cusp-shell cubic recurrence (`N_0 = 1, N_1 = 18, N_2 = 330, N_3 = 6034`,
     `N_{D+4} + 51 N_{D+2} = 21 N_{D+3} + 23 N_{D+1}`), bridged identically to `Vibe.CuspGrowth.cuspShell`:
     `N_13 = 25123449085462194`, strict positivity `N_D > 0`, and exponential growth
     `N_{D+1} ≥ 18 N_D` & `N_D ≥ 18^D` for all `D : Nat`.
   - Exact `SU(3)_C` color-singlet 3-quark baryon electric charge quantization forced by the `ℤ_6`
     congruence (`Q ∈ {-1, 0, +1, +2}`, proton `u u d → +1`, neutron `u d d → 0`, `Δ^{++} u u u → +2`,
     `Δ^- d d d → -1`, plus general integer-charge law for any three `triality = 1` quarks).

Zero `sorry`, zero `axiom`, zero `native_decide`, machine-checked by Lean `4.35.0` with Mathlib `v4.35.0`.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Shared Small Helpers (Private to `Vibe.StandardModelCore`) -/

/-- Explicit Boolean XOR with total, version-independent reduction. -/
def smXor (a b : Bool) : Bool :=
  match a, b with
  | false, false => false
  | false, true => true
  | true, false => true
  | true, true => false

private theorem smXor_false_right (a : Bool) : smXor a false = a := by
  cases a <;> rfl

private theorem smXor_self (a : Bool) : smXor a a = false := by
  cases a <;> rfl

private theorem smXor_swap4 (a b c d : Bool) :
    smXor (smXor a b) (smXor c d) = smXor (smXor a c) (smXor b d) := by
  cases a <;> cases b <;> cases c <;> cases d <;> rfl

private theorem smXor_and_left (c a b : Bool) :
    (c && smXor a b) = smXor (c && a) (c && b) := by
  cases c <;> cases a <;> cases b <;> rfl

private theorem smXor_and_right (a b c : Bool) :
    (smXor a b && c) = smXor (a && c) (b && c) := by
  cases a <;> cases b <;> cases c <;> rfl

/-- Exact `Fin 3` modular arithmetic. -/
def smFin3Add (a b : Fin 3) : Fin 3 :=
  ⟨(a.val + b.val) % 3, Nat.mod_lt _ (by decide)⟩

def smFin3Sub (a b : Fin 3) : Fin 3 :=
  ⟨(a.val + 3 - b.val) % 3, Nat.mod_lt _ (by decide)⟩

def smFin3Mul (a b : Fin 3) : Fin 3 :=
  ⟨(a.val * b.val) % 3, Nat.mod_lt _ (by decide)⟩

def smFin3Neg (a : Fin 3) : Fin 3 :=
  ⟨(3 - a.val) % 3, Nat.mod_lt _ (by decide)⟩

/-- Exact `Fin 4` modular addition (for Pauli phases `i^p`). -/
def smFin4Add (a b : Fin 4) : Fin 4 :=
  ⟨(a.val + b.val) % 4, Nat.mod_lt _ (by decide)⟩


/-! ## Section 1: Standard Model 16-Weyl Anomaly Cancellation & Tong `ℤ_6` / `ℤ_18` Quotient -/

/-- One chiral left-handed Standard Model + `ν_R^c` multiplet in integer `6 Y` hypercharge units. -/
structure SMMultiplet where
  colorDim : Nat
  weakDim : Nat
  sixY : Int
  triality : Nat
  isDoublet : Nat
  colorSign : Int
  colorWeight : Int
  deriving DecidableEq, Repr

/-- Exact 1-generation 6-multiplet table (`Q_L, u_R^c, d_R^c, L_L, e_R^c, ν_R^c`). -/
def smMultiplet : Fin 6 → SMMultiplet
  | ⟨0, _⟩ => ⟨3, 2,  1, 1, 1,  1, 1⟩  -- Q_L:    (3,    2, +1/6)
  | ⟨1, _⟩ => ⟨3, 1, -4, 2, 0, -1, 1⟩  -- u_R^c:  (3bar, 1, -2/3)
  | ⟨2, _⟩ => ⟨3, 1,  2, 2, 0, -1, 1⟩  -- d_R^c:  (3bar, 1, +1/3)
  | ⟨3, _⟩ => ⟨1, 2, -3, 0, 1,  0, 0⟩  -- L_L:    (1,    2, -1/2)
  | ⟨4, _⟩ => ⟨1, 1,  6, 0, 0,  0, 0⟩  -- e_R^c:  (1,    1, +1)
  | ⟨5, _⟩ => ⟨1, 1,  0, 0, 0,  0, 0⟩  -- nu_R^c: (1,    1,  0)

def smSum6Nat (f : Fin 6 → Nat) : Nat :=
  f ⟨0, by decide⟩ + f ⟨1, by decide⟩ + f ⟨2, by decide⟩ +
  f ⟨3, by decide⟩ + f ⟨4, by decide⟩ + f ⟨5, by decide⟩

def smSum6Int (f : Fin 6 → Int) : Int :=
  f ⟨0, by decide⟩ + f ⟨1, by decide⟩ + f ⟨2, by decide⟩ +
  f ⟨3, by decide⟩ + f ⟨4, by decide⟩ + f ⟨5, by decide⟩

def smTotalWeylCount : Nat :=
  smSum6Nat (fun m => (smMultiplet m).colorDim * (smMultiplet m).weakDim)

def smAnomalySU3Cubic : Int :=
  smSum6Int (fun m => ((smMultiplet m).weakDim : Int) * (smMultiplet m).colorSign)

def smAnomalySU3SqY : Int :=
  smSum6Int (fun m =>
    ((smMultiplet m).weakDim : Int) * (smMultiplet m).colorWeight * (smMultiplet m).sixY)

def smAnomalySU2SqY : Int :=
  smSum6Int (fun m =>
    ((smMultiplet m).colorDim : Int) * ((smMultiplet m).isDoublet : Int) * (smMultiplet m).sixY)

def smAnomalyGravY : Int :=
  smSum6Int (fun m =>
    (((smMultiplet m).colorDim * (smMultiplet m).weakDim : Nat) : Int) * (smMultiplet m).sixY)

def smAnomalyYCubic : Int :=
  smSum6Int (fun m =>
    let y := (smMultiplet m).sixY
    (((smMultiplet m).colorDim * (smMultiplet m).weakDim : Nat) : Int) * (y * y * y))

def smTotalSU2Doublets : Nat :=
  smSum6Nat (fun m => (smMultiplet m).colorDim * (smMultiplet m).isDoublet)

def smQuarkOnlySU2Doublets : Nat :=
  (smMultiplet ⟨0, by decide⟩).colorDim * (smMultiplet ⟨0, by decide⟩).isDoublet

/-- Headline Theorem 1 (SM 16-Weyl Anomaly Cancellation, Witten Parity, Tong `ℤ_6` & `ℤ_18` Separation):
    Simultaneously certifies on the exact 1-generation 6-multiplet left-handed SM + `ν_R^c` table:
    1. Total Weyl count = `16`,
    2. `SU(3)_C^3 = 0`, `SU(3)_C^2 U(1)_Y = 0`, `SU(2)_L^2 U(1)_Y = 0`, `grav^2 U(1)_Y = 0`, `U(1)_Y^3 = 0`,
    3. Witten `SU(2)_L` global anomaly cancellation: `N_d = 4` is even (`∀ nGen, (nGen * N_d) % 2 = 0`),
       while quark-only `Q_L` has `3` doublets (odd, `3 % 2 = 1`),
    4. Exact Tong `ℤ_6` quotient congruence `∀ m : Fin 6, (2 t_m + 3 d_m + 6 Y_m) % 6 = 0`,
    5. Faithful `ℤ_18` separation (`∀ m1 m2, (6 Y_{m1}) % 18 = (6 Y_{m2}) % 18 → m1 = m2`) versus
       `ℤ_6` collapse (`u_R^c` vs `d_R^c` and `e_R^c` vs `ν_R^c` coincide mod `6` while differing in `6 Y`). -/
theorem thm_sm_anomaly_cancellation_and_z6_quotient :
    smTotalWeylCount = 16 ∧
    smAnomalySU3Cubic = 0 ∧
    smAnomalySU3SqY = 0 ∧
    smAnomalySU2SqY = 0 ∧
    smAnomalyGravY = 0 ∧
    smAnomalyYCubic = 0 ∧
    (smTotalSU2Doublets = 4 ∧ smTotalSU2Doublets % 2 = 0 ∧
      (∀ nGen : Nat, (nGen * smTotalSU2Doublets) % 2 = 0) ∧
      smQuarkOnlySU2Doublets = 3 ∧ smQuarkOnlySU2Doublets % 2 = 1) ∧
    (∀ m : Fin 6,
      (2 * ((smMultiplet m).triality : Int) + 3 * ((smMultiplet m).isDoublet : Int) +
        (smMultiplet m).sixY) % 6 = 0) ∧
    (∀ m1 m2 : Fin 6, (smMultiplet m1).sixY % 18 = (smMultiplet m2).sixY % 18 → m1 = m2) ∧
    ((smMultiplet ⟨1, by decide⟩).sixY % 6 = (smMultiplet ⟨2, by decide⟩).sixY % 6 ∧
      (smMultiplet ⟨1, by decide⟩).sixY ≠ (smMultiplet ⟨2, by decide⟩).sixY) ∧
    ((smMultiplet ⟨4, by decide⟩).sixY % 6 = (smMultiplet ⟨5, by decide⟩).sixY % 6 ∧
      (smMultiplet ⟨4, by decide⟩).sixY ≠ (smMultiplet ⟨5, by decide⟩).sixY) := by
  have hWittenAll : ∀ nGen : Nat, (nGen * smTotalSU2Doublets) % 2 = 0 := by
    intro nGen
    change (nGen * 4) % 2 = 0
    omega
  exact ⟨by decide, by decide, by decide, by decide, by decide, by decide,
    ⟨by decide, by decide, hWittenAll, by decide, by decide⟩,
    by decide, by decide, by decide, by decide⟩


/-! ## Section 2: `so(5)` Custodial Symmetry, `z_L` Center-Parity Split, `ρ = 1`, & `SU(3)_W` No-Go -/

abbrev SMMat5 := Fin 5 → Fin 5 → Int

def smSum5Int (f : Fin 5 → Int) : Int :=
  f ⟨0, by decide⟩ + f ⟨1, by decide⟩ + f ⟨2, by decide⟩ + f ⟨3, by decide⟩ + f ⟨4, by decide⟩

def smMat5Zero : SMMat5 := fun _ _ => 0

def smMat5Add (A B : SMMat5) : SMMat5 := fun i j => A i j + B i j
def smMat5Sub (A B : SMMat5) : SMMat5 := fun i j => A i j - B i j
def smMat5Neg (A : SMMat5) : SMMat5 := fun i j => -(A i j)
def smMat5Scale (k : Int) (A : SMMat5) : SMMat5 := fun i j => k * A i j
def smMat5Transpose (A : SMMat5) : SMMat5 := fun i j => A j i

def smMat5Mul (A B : SMMat5) : SMMat5 :=
  fun i j => smSum5Int (fun k => A i k * B k j)

def smMat5Comm (A B : SMMat5) : SMMat5 :=
  smMat5Sub (smMat5Mul A B) (smMat5Mul B A)

def smMat5FrobSq (A : SMMat5) : Int :=
  smSum5Int (fun i => smSum5Int (fun j => A i j * A i j))

/-- Elementary `5 × 5` antisymmetric basis matrix `E_{ab}`: `+1` at `(a, b)`, `-1` at `(b, a)`. -/
def smSo5E (a b : Fin 5) : SMMat5 :=
  fun i j => if i = a ∧ j = b then 1 else if i = b ∧ j = a then -1 else 0

/-- Self-dual `su(2)_L` generators (`2 L_a`, `a ∈ Fin 3`) inside `so(4) ⊂ so(5)`. -/
def smSo5L : Fin 3 → SMMat5
  | ⟨0, _⟩ => smMat5Neg (smMat5Add (smSo5E ⟨1, by decide⟩ ⟨2, by decide⟩) (smSo5E ⟨0, by decide⟩ ⟨3, by decide⟩))
  | ⟨1, _⟩ => smMat5Neg (smMat5Add (smSo5E ⟨2, by decide⟩ ⟨0, by decide⟩) (smSo5E ⟨1, by decide⟩ ⟨3, by decide⟩))
  | ⟨2, _⟩ => smMat5Neg (smMat5Add (smSo5E ⟨0, by decide⟩ ⟨1, by decide⟩) (smSo5E ⟨2, by decide⟩ ⟨3, by decide⟩))

/-- Anti-self-dual `su(2)_R` generators (`2 R_a`, `a ∈ Fin 3`) inside `so(4) ⊂ so(5)`. -/
def smSo5R : Fin 3 → SMMat5
  | ⟨0, _⟩ => smMat5Neg (smMat5Sub (smSo5E ⟨1, by decide⟩ ⟨2, by decide⟩) (smSo5E ⟨0, by decide⟩ ⟨3, by decide⟩))
  | ⟨1, _⟩ => smMat5Neg (smMat5Sub (smSo5E ⟨2, by decide⟩ ⟨0, by decide⟩) (smSo5E ⟨1, by decide⟩ ⟨3, by decide⟩))
  | ⟨2, _⟩ => smMat5Neg (smMat5Sub (smSo5E ⟨0, by decide⟩ ⟨1, by decide⟩) (smSo5E ⟨2, by decide⟩ ⟨3, by decide⟩))

/-- Canonical inclusion `Fin 4 → Fin 5` for the `SO(4) ⊂ SO(5)` block. -/
def smFin4To5 (i : Fin 4) : Fin 5 :=
  ⟨i.val, Nat.lt_trans i.isLt (by decide)⟩

/-- Four `so(5)/so(4)` custodial Higgs bidoublet generators `H_i = E_{i, 4}` (`i ∈ Fin 4`). -/
def smSo5H (i : Fin 4) : SMMat5 :=
  smSo5E (smFin4To5 i) ⟨4, by decide⟩

/-- Diagonal `SU(2)_L` center element `z_L = diag(-1, -1, -1, -1, +1) ∈ SO(4) ⊂ SO(5)`. -/
def smZL5Diag (i : Fin 5) : Int :=
  if i.val < 4 then -1 else 1

def smZL5Mat : SMMat5 :=
  fun i j => if i = j then smZL5Diag i else 0

def smZL5Conj (X : SMMat5) : SMMat5 :=
  smMat5Mul smZL5Mat (smMat5Mul X smZL5Mat)

/-- Homogenized `SO(5)` orbifold round-trip Wilson-line rotation `W_hom(s, c)` in the `(3, 4)` plane:
    diagonal `(0, 1, 2)` entries equal `c^2 + s^2`, diagonal `(3, 4)` entries equal `c^2 - s^2`,
    and off-diagonal `(3, 4)/(4, 3)` entries equal `± 2 s c`.
    For ALL unconstrained `(s, c : Int)`, `W_hom^T W_hom = (c^2 + s^2)^2 I_5` (dividing by `c^2 + s^2`
    yields the exact `SO(5)` rotation `W(2 θ_H)` along the dense rational unit circle). -/
def smSo5WilsonHom (s c : Int) : SMMat5 :=
  fun i j =>
    if i = j then
      if i.val = 3 ∨ i.val = 4 then c * c - s * s else c * c + s * s
    else if i.val = 3 ∧ j.val = 4 then 2 * (s * c)
    else if i.val = 4 ∧ j.val = 3 then -(2 * (s * c))
    else 0

/-- Scaled `5 × 5` integer identity matrix `k I_5`. -/
def smMat5ScaleId (k : Int) : SMMat5 :=
  fun i j => if i = j then k else 0

/-- Homogenized Wilson-line mass shift `Δ_hom(s, c, T) = W_hom(s, c)^T T W_hom(s, c) - (c^2 + s^2)^2 T`. -/
def smWilsonDeltaHom (s c : Int) (T : SMMat5) : SMMat5 :=
  let r := c * c + s * s
  smMat5Sub (smMat5Mul (smMat5Transpose (smSo5WilsonHom s c)) (smMat5Mul T (smSo5WilsonHom s c)))
            (smMat5Scale (r * r) T)

/-- Explicit `4`-entry reduced form of `Δ_hom(s, c, L_a) / (c^2 + s^2)` (`a ∈ {0, 1, 2}`). -/
def smDeltaLa (a : Fin 3) (s c : Int) : SMMat5 :=
  fun i j =>
    if i.val = a.val ∧ j.val = 3 then 2 * (s * s)
    else if i.val = 3 ∧ j.val = a.val then -(2 * (s * s))
    else if i.val = a.val ∧ j.val = 4 then -(2 * (s * c))
    else if i.val = 4 ∧ j.val = a.val then 2 * (s * c)
    else 0

/-- Electroweak gauge-boson mass-squared formulas in `SO(5) × U(1)_X`:
    `M_W^2 = g^2 s^2`, `M_Z^2 = (g^2 + gp^2) s^2`, `M_γ^2 = 0`. -/
def smMW2 (g s : Int) : Int := (g * g) * (s * s)
def smMZ2 (g gp s : Int) : Int := (g * g + gp * gp) * (s * s)
def smMGamma2 : Int := 0

/-- `3 × 3` matrix over exact Eisenstein integers `ℤ[ω]` for the `SU(3)_W` negative control. -/
abbrev SMMat3Eis := Fin 3 → Fin 3 → Eis

def smSum3Eis (f : Fin 3 → Eis) : Eis :=
  Eis.add (Eis.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩)) (f ⟨2, by decide⟩)

def smSum3Int (f : Fin 3 → Int) : Int :=
  f ⟨0, by decide⟩ + f ⟨1, by decide⟩ + f ⟨2, by decide⟩

def smMat3EisMul (A B : SMMat3Eis) : SMMat3Eis :=
  fun i j => smSum3Eis (fun k => Eis.mul (A i k) (B k j))

def smMat3EisDag (A : SMMat3Eis) : SMMat3Eis :=
  fun i j => Eis.conj (A j i)

def smMat3EisSub (A B : SMMat3Eis) : SMMat3Eis :=
  fun i j => Eis.sub (A i j) (B i j)

def smMat3EisScale (k : Int) (A : SMMat3Eis) : SMMat3Eis :=
  fun i j => Eis.scale k (A i j)

def smMat3EisScaleId (k : Int) : SMMat3Eis :=
  fun i j => if i = j then Eis.ofInt k else Eis.zero

def smMat3EisFrobSq (A : SMMat3Eis) : Int :=
  smSum3Int (fun i => smSum3Int (fun j => Eis.normSq (A i j)))

def smMat3EisInner (A B : SMMat3Eis) : Eis :=
  smSum3Eis (fun i => smSum3Eis (fun j => Eis.mul (Eis.conj (A i j)) (B i j)))

/-- Exact `SU(3)_W` Wilson-line rotation `2 U_3(π/3) = 2 exp(i (π/3) λ_6)` over `ℤ[ω]`,
    using `2 cos(π/3) = 1` and `2 i sin(π/3) = i √3 = 1 + 2 ω`. -/
def smSU3Wilson2 : SMMat3Eis
  | ⟨0, _⟩, ⟨0, _⟩ => Eis.ofInt 2
  | ⟨1, _⟩, ⟨1, _⟩ => Eis.one
  | ⟨1, _⟩, ⟨2, _⟩ => ⟨1, 2⟩
  | ⟨2, _⟩, ⟨1, _⟩ => ⟨1, 2⟩
  | ⟨2, _⟩, ⟨2, _⟩ => Eis.one
  | _, _ => Eis.zero

/-- Exact `3 × 3` `SU(3)_W` generators over `ℤ[ω]`:
    `λ_1` (`W^1`), `λ_3` (`W^3`), `λ_Z = (1/2) λ_3 - (√3/2) λ_8 = diag(0, -1, 1)` (`Z`, canonical norm `2`),
    `√3 λ_γ = diag(2, -1, -1)` (photon, orthogonal to `λ_Z`), and `6 Y = √3 λ_8 = diag(1, 1, -2)`. -/
def smSU3Lam1 : SMMat3Eis
  | ⟨0, _⟩, ⟨1, _⟩ => Eis.one
  | ⟨1, _⟩, ⟨0, _⟩ => Eis.one
  | _, _ => Eis.zero

def smSU3Lam3 : SMMat3Eis
  | ⟨0, _⟩, ⟨0, _⟩ => Eis.one
  | ⟨1, _⟩, ⟨1, _⟩ => Eis.ofInt (-1)
  | _, _ => Eis.zero

def smSU3LamZ : SMMat3Eis
  | ⟨1, _⟩, ⟨1, _⟩ => Eis.ofInt (-1)
  | ⟨2, _⟩, ⟨2, _⟩ => Eis.one
  | _, _ => Eis.zero

def smSU3Photon : SMMat3Eis
  | ⟨0, _⟩, ⟨0, _⟩ => Eis.ofInt 2
  | ⟨1, _⟩, ⟨1, _⟩ => Eis.ofInt (-1)
  | ⟨2, _⟩, ⟨2, _⟩ => Eis.ofInt (-1)
  | _, _ => Eis.zero

def smSU3SixY : SMMat3Eis
  | ⟨0, _⟩, ⟨0, _⟩ => Eis.one
  | ⟨1, _⟩, ⟨1, _⟩ => Eis.one
  | ⟨2, _⟩, ⟨2, _⟩ => Eis.ofInt (-2)
  | _, _ => Eis.zero

/-- Exact scaled `SU(3)_W` Wilson-line mass shift `Δ_4(T) = (2 U_3(π/3))^† T (2 U_3(π/3)) - 4 T`. -/
def smSU3Delta4 (T : SMMat3Eis) : SMMat3Eis :=
  smMat3EisSub (smMat3EisMul (smMat3EisDag smSU3Wilson2) (smMat3EisMul T smSU3Wilson2))
               (smMat3EisScale 4 T)

private theorem sm_mat5_ext (A B : SMMat5) (h : ∀ i j : Fin 5, A i j = B i j) : A = B :=
  funext (fun i => funext (fun j => h i j))

private theorem sm_mat5FrobSq_scale (k : Int) (A : SMMat5) :
    smMat5FrobSq (smMat5Scale k A) = (k * k) * smMat5FrobSq A := by
  unfold smMat5FrobSq smMat5Scale smSum5Int; ring

private theorem sm_so5WilsonHom_orth (s c : Int) :
    smMat5Mul (smMat5Transpose (smSo5WilsonHom s c)) (smSo5WilsonHom s c) =
      smMat5ScaleId ((c * c + s * s) * (c * c + s * s)) := by
  apply sm_mat5_ext; intro i j
  fin_cases i <;> fin_cases j <;>
    simp [smMat5Mul, smMat5Transpose, smSo5WilsonHom, smMat5ScaleId, smSum5Int] <;> ring

private theorem sm_wilsonDeltaHom_scale (k s c : Int) (T : SMMat5) :
    smWilsonDeltaHom s c (smMat5Scale k T) = smMat5Scale k (smWilsonDeltaHom s c T) := by
  apply sm_mat5_ext; intro i j
  unfold smWilsonDeltaHom smMat5Sub smMat5Mul smMat5Scale smSum5Int; ring

private theorem sm_wilsonDeltaHom_add (s c : Int) (A B : SMMat5) :
    smWilsonDeltaHom s c (smMat5Add A B) = smMat5Add (smWilsonDeltaHom s c A) (smWilsonDeltaHom s c B) := by
  apply sm_mat5_ext; intro i j
  unfold smWilsonDeltaHom smMat5Add smMat5Sub smMat5Mul smMat5Scale smSum5Int; ring

private theorem sm_wilsonDeltaHom_sub (s c : Int) (A B : SMMat5) :
    smWilsonDeltaHom s c (smMat5Sub A B) = smMat5Sub (smWilsonDeltaHom s c A) (smWilsonDeltaHom s c B) := by
  apply sm_mat5_ext; intro i j
  unfold smWilsonDeltaHom smMat5Sub smMat5Mul smMat5Scale smSum5Int; ring

private theorem sm_wilsonDeltaHom_La (a : Fin 3) (s c : Int) :
    smWilsonDeltaHom s c (smSo5L a) = smMat5Scale (c * c + s * s) (smDeltaLa a s c) := by
  apply sm_mat5_ext; intro i j
  fin_cases a <;> fin_cases i <;> fin_cases j <;>
    simp [smWilsonDeltaHom, smDeltaLa, smSo5L, smSo5E, smSo5WilsonHom, smMat5Transpose,
      smMat5Mul, smMat5Add, smMat5Sub, smMat5Neg, smMat5Scale, smSum5Int] <;> ring

private theorem sm_wilsonDeltaHom_R2 (s c : Int) :
    smWilsonDeltaHom s c (smSo5R ⟨2, by decide⟩) =
      smMat5Neg (smMat5Scale (c * c + s * s) (smDeltaLa ⟨2, by decide⟩ s c)) := by
  apply sm_mat5_ext; intro i j
  fin_cases i <;> fin_cases j <;>
    simp [smWilsonDeltaHom, smDeltaLa, smSo5R, smSo5E, smSo5WilsonHom, smMat5Transpose,
      smMat5Mul, smMat5Sub, smMat5Neg, smMat5Scale, smSum5Int] <;> ring

private theorem sm_frobSq_deltaLa (a : Fin 3) (s c : Int) :
    smMat5FrobSq (smDeltaLa a s c) = 8 * (s * s) * (c * c + s * s) := by
  match a with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ =>
    simp [smMat5FrobSq, smSum5Int, smDeltaLa]; ring

private theorem sm_frobSq_scale_r_deltaLa (k s c : Int) (a : Fin 3) :
    smMat5FrobSq (smMat5Scale k (smMat5Scale (c * c + s * s) (smDeltaLa a s c))) =
      8 * ((k * k) * (s * s)) * ((c * c + s * s) * (c * c + s * s) * (c * c + s * s)) := by
  rw [sm_mat5FrobSq_scale, sm_mat5FrobSq_scale, sm_frobSq_deltaLa]; ring

private theorem sm_zl5_conj_block_so4 (M : SMMat5)
    (hBlock : ∀ i : Fin 4, M (smFin4To5 i) ⟨4, by decide⟩ = 0 ∧ M ⟨4, by decide⟩ (smFin4To5 i) = 0) :
    smZL5Conj M = M := by
  apply sm_mat5_ext; intro i j
  have hEntry : smZL5Conj M i j = smZL5Diag i * (M i j * smZL5Diag j) := by
    match i with
    | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
      match j with
      | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
        simp [smZL5Conj, smZL5Mat, smMat5Mul, smSum5Int]
  rw [hEntry]
  if hi : i.val < 4 then
    if hj : j.val < 4 then
      simp only [smZL5Diag, ite_eq_left hi, ite_eq_left hj]
      omega
    else
      have hj4 : j = ⟨4, by decide⟩ := Fin.ext (by have := j.isLt; change j.val = 4; omega)
      have hiEq : smFin4To5 ⟨i.val, hi⟩ = i := Fin.ext rfl
      have hz : M i ⟨4, by decide⟩ = 0 := by rw [← hiEq]; exact (hBlock ⟨i.val, hi⟩).1
      rw [hj4, hz]
      simp only [Int.zero_mul, Int.mul_zero]
  else
    have hi4 : i = ⟨4, by decide⟩ := Fin.ext (by have := i.isLt; change i.val = 4; omega)
    if hj : j.val < 4 then
      have hjEq : smFin4To5 ⟨j.val, hj⟩ = j := Fin.ext rfl
      have hz : M ⟨4, by decide⟩ j = 0 := by rw [← hjEq]; exact (hBlock ⟨j.val, hj⟩).2
      rw [hi4, hz]
      simp only [Int.zero_mul, Int.mul_zero]
    else
      have hj4 : j = ⟨4, by decide⟩ := Fin.ext (by have := j.isLt; change j.val = 4; omega)
      rw [hi4, hj4]
      simp [smZL5Diag]

/-- Headline Theorem 2 (`SO(5)` Custodial Symmetry, `z_L` Center-Parity Split, `ρ = 1` & `SU(3)_W` No-Go):
    1. Exact `5 × 5` antisymmetric `so(5)` Lie algebra: `su(2)_L` and `su(2)_R` brackets
       (`[L_0, L_1] = 2 L_2` cyclic, `[R_0, R_1] = 2 R_2` cyclic), exact `[su(2)_L, su(2)_R] = 0`,
       and unbroken custodial `[L_a + R_a, H_3] = 0`,
    2. Exact `z_L = diag(-1,-1,-1,-1,+1)` center-parity split: all `6` `so(4)` generators are
       center-even (`z_L X z_L = +X`), all `4` Higgs coset generators `H_0..3` are center-odd
       (`z_L X z_L = -X`), and EVERY block-`SO(4)` matrix (including `2T_L ∘ 2T_R`) is center-even
       (`0` center-odd components, `E-FRC-0279`),
    3. Unconstrained homogenized symbolic finite Wilson-line mass spectrum over ALL `(g, gp, s, c : Int)`
       (zero `c^2 + s^2 = 1` collapse; `W_hom^T W_hom = (c^2 + s^2)^2 I_5` identically with `2 s c`
       generically nonzero): `M_W^2` (for both `W^1, W^2`), massless photon `M_γ^2 = 0`, `M_Z^2`,
       and exact custodial `ρ = 1` both directly on the `5 × 5` Frobenius norms and on `(smMW2, smMZ2)`,
    4. Exact `3 × 3` `ℤ[ω]` `SU(3)_W` Wilson-line matrix negative control (`2 U_3(π/3)` unitary over `Eis`):
       tree-level `sin^2 θ_W = 3/4 ≠ 3/8` from `‖3 λ_3‖_F^2 = 3 ‖6 Y‖_F^2`, exact massless photon
       `‖Δ_4(A_γ)‖_F^2 = 0`, and exact finite-`θ_H` custodial violation `ρ_{SU(3)}^2 = 4/3 ≠ 1` derived
       directly from `‖Δ_4(λ_1)‖_F^2 = 32`, `‖Δ_4(λ_3)‖_F^2 = 24`, `‖Δ_4(λ_Z)‖_F^2 = 96`. -/
theorem thm_sm_so5_custodial_rho_one_and_center_parity :
    ((∀ (a : Fin 3) (i j : Fin 5), smSo5L a j i = -(smSo5L a i j) ∧ smSo5R a j i = -(smSo5R a i j)) ∧
     (∀ (a : Fin 4) (i j : Fin 5), smSo5H a j i = -(smSo5H a i j)) ∧
     (∀ i j : Fin 5,
        smMat5Comm (smSo5L ⟨0, by decide⟩) (smSo5L ⟨1, by decide⟩) i j = smMat5Scale 2 (smSo5L ⟨2, by decide⟩) i j ∧
        smMat5Comm (smSo5L ⟨1, by decide⟩) (smSo5L ⟨2, by decide⟩) i j = smMat5Scale 2 (smSo5L ⟨0, by decide⟩) i j ∧
        smMat5Comm (smSo5L ⟨2, by decide⟩) (smSo5L ⟨0, by decide⟩) i j = smMat5Scale 2 (smSo5L ⟨1, by decide⟩) i j ∧
        smMat5Comm (smSo5R ⟨0, by decide⟩) (smSo5R ⟨1, by decide⟩) i j = smMat5Scale 2 (smSo5R ⟨2, by decide⟩) i j ∧
        smMat5Comm (smSo5R ⟨1, by decide⟩) (smSo5R ⟨2, by decide⟩) i j = smMat5Scale 2 (smSo5R ⟨0, by decide⟩) i j ∧
        smMat5Comm (smSo5R ⟨2, by decide⟩) (smSo5R ⟨0, by decide⟩) i j = smMat5Scale 2 (smSo5R ⟨1, by decide⟩) i j) ∧
     (∀ (a b : Fin 3) (i j : Fin 5), smMat5Comm (smSo5L a) (smSo5R b) i j = 0) ∧
     (∀ (a : Fin 3) (i j : Fin 5),
        smMat5Comm (smMat5Add (smSo5L a) (smSo5R a)) (smSo5H ⟨3, by decide⟩) i j = 0)) ∧
    ((∀ (a : Fin 3) (i j : Fin 5),
        smZL5Conj (smSo5L a) i j = smSo5L a i j ∧ smZL5Conj (smSo5R a) i j = smSo5R a i j) ∧
     (∀ (a : Fin 4) (i j : Fin 5),
        smZL5Conj (smSo5H a) i j = -(smSo5H a i j)) ∧
     (∀ (M : SMMat5),
        (∀ i : Fin 4, M (smFin4To5 i) ⟨4, by decide⟩ = 0 ∧ M ⟨4, by decide⟩ (smFin4To5 i) = 0) →
        smZL5Conj M = M)) ∧
    ((∀ (s c : Int),
        smMat5Mul (smMat5Transpose (smSo5WilsonHom s c)) (smSo5WilsonHom s c) =
          smMat5ScaleId ((c * c + s * s) * (c * c + s * s))) ∧
     (∀ (g gp s c : Int),
        let r3 := (c * c + s * s) * (c * c + s * s) * (c * c + s * s)
        smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨0, by decide⟩))) = 8 * smMW2 g s * r3 ∧
        smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨1, by decide⟩))) = 8 * smMW2 g s * r3 ∧
        smMat5FrobSq (smWilsonDeltaHom s c
          (smMat5Add (smMat5Scale (gp * g) (smSo5L ⟨2, by decide⟩))
                     (smMat5Scale (g * gp) (smSo5R ⟨2, by decide⟩)))) = smMGamma2 ∧
        smMat5FrobSq (smWilsonDeltaHom s c
          (smMat5Sub (smMat5Scale (g * g) (smSo5L ⟨2, by decide⟩))
                     (smMat5Scale (gp * gp) (smSo5R ⟨2, by decide⟩)))) =
          8 * ((g * g + gp * gp) * smMZ2 g gp s) * r3 ∧
        smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨0, by decide⟩))) *
          ((g * g + gp * gp) * (g * g + gp * gp)) =
        smMat5FrobSq (smWilsonDeltaHom s c
          (smMat5Sub (smMat5Scale (g * g) (smSo5L ⟨2, by decide⟩))
                     (smMat5Scale (gp * gp) (smSo5R ⟨2, by decide⟩)))) * (g * g)) ∧
     (∀ (g gp s : Int), smMW2 g s * (g * g + gp * gp) = smMZ2 g gp s * (g * g))) ∧
    ((∀ i j : Fin 3,
        smMat3EisMul (smMat3EisDag smSU3Wilson2) smSU3Wilson2 i j = smMat3EisScaleId 4 i j) ∧
     (smMat3EisFrobSq smSU3Lam1 = 2 ∧
      smMat3EisFrobSq smSU3Lam3 = 2 ∧
      smMat3EisFrobSq smSU3LamZ = 2 ∧
      smMat3EisInner smSU3Photon smSU3LamZ = Eis.zero) ∧
     (let trT3 := smMat3EisFrobSq (smMat3EisScale 3 smSU3Lam3)
      let trY := smMat3EisFrobSq smSU3SixY
      let dW := smMat3EisFrobSq (smSU3Delta4 smSU3Lam1)
      let dW3 := smMat3EisFrobSq (smSU3Delta4 smSU3Lam3)
      let dZ := smMat3EisFrobSq (smSU3Delta4 smSU3LamZ)
      let dGam := smMat3EisFrobSq (smSU3Delta4 smSU3Photon)
      trT3 = 3 * trY ∧
      8 * trT3 ≠ 3 * (trT3 + trY) ∧
      dGam = 0 ∧
      dW = 32 ∧ dW3 = 24 ∧ dZ = 96 ∧
      3 * (dW * (trT3 + trY)) = 4 * (dZ * trY) ∧
      dW * (trT3 + trY) ≠ dZ * trY ∧
      3 * dW = 4 * dW3)) := by
  have hAlg :
      (∀ (a : Fin 3) (i j : Fin 5), smSo5L a j i = -(smSo5L a i j) ∧ smSo5R a j i = -(smSo5R a i j)) ∧
      (∀ (a : Fin 4) (i j : Fin 5), smSo5H a j i = -(smSo5H a i j)) ∧
      (∀ i j : Fin 5,
        smMat5Comm (smSo5L ⟨0, by decide⟩) (smSo5L ⟨1, by decide⟩) i j = smMat5Scale 2 (smSo5L ⟨2, by decide⟩) i j ∧
        smMat5Comm (smSo5L ⟨1, by decide⟩) (smSo5L ⟨2, by decide⟩) i j = smMat5Scale 2 (smSo5L ⟨0, by decide⟩) i j ∧
        smMat5Comm (smSo5L ⟨2, by decide⟩) (smSo5L ⟨0, by decide⟩) i j = smMat5Scale 2 (smSo5L ⟨1, by decide⟩) i j ∧
        smMat5Comm (smSo5R ⟨0, by decide⟩) (smSo5R ⟨1, by decide⟩) i j = smMat5Scale 2 (smSo5R ⟨2, by decide⟩) i j ∧
        smMat5Comm (smSo5R ⟨1, by decide⟩) (smSo5R ⟨2, by decide⟩) i j = smMat5Scale 2 (smSo5R ⟨0, by decide⟩) i j ∧
        smMat5Comm (smSo5R ⟨2, by decide⟩) (smSo5R ⟨0, by decide⟩) i j = smMat5Scale 2 (smSo5R ⟨1, by decide⟩) i j) ∧
      (∀ (a b : Fin 3) (i j : Fin 5), smMat5Comm (smSo5L a) (smSo5R b) i j = 0) ∧
      (∀ (a : Fin 3) (i j : Fin 5),
        smMat5Comm (smMat5Add (smSo5L a) (smSo5R a)) (smSo5H ⟨3, by decide⟩) i j = 0) :=
    ⟨by decide, by decide, by decide, by decide, by decide⟩
  have hParity :
      (∀ (a : Fin 3) (i j : Fin 5),
        smZL5Conj (smSo5L a) i j = smSo5L a i j ∧ smZL5Conj (smSo5R a) i j = smSo5R a i j) ∧
      (∀ (a : Fin 4) (i j : Fin 5),
        smZL5Conj (smSo5H a) i j = -(smSo5H a i j)) ∧
      (∀ (M : SMMat5),
        (∀ i : Fin 4, M (smFin4To5 i) ⟨4, by decide⟩ = 0 ∧ M ⟨4, by decide⟩ (smFin4To5 i) = 0) →
        smZL5Conj M = M) :=
    ⟨by decide, by decide, sm_zl5_conj_block_so4⟩
  have hMass : ∀ (g gp s c : Int),
      let r3 := (c * c + s * s) * (c * c + s * s) * (c * c + s * s)
      smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨0, by decide⟩))) = 8 * smMW2 g s * r3 ∧
      smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨1, by decide⟩))) = 8 * smMW2 g s * r3 ∧
      smMat5FrobSq (smWilsonDeltaHom s c
        (smMat5Add (smMat5Scale (gp * g) (smSo5L ⟨2, by decide⟩))
                   (smMat5Scale (g * gp) (smSo5R ⟨2, by decide⟩)))) = smMGamma2 ∧
      smMat5FrobSq (smWilsonDeltaHom s c
        (smMat5Sub (smMat5Scale (g * g) (smSo5L ⟨2, by decide⟩))
                   (smMat5Scale (gp * gp) (smSo5R ⟨2, by decide⟩)))) =
        8 * ((g * g + gp * gp) * smMZ2 g gp s) * r3 ∧
      smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨0, by decide⟩))) *
        ((g * g + gp * gp) * (g * g + gp * gp)) =
      smMat5FrobSq (smWilsonDeltaHom s c
        (smMat5Sub (smMat5Scale (g * g) (smSo5L ⟨2, by decide⟩))
                   (smMat5Scale (gp * gp) (smSo5R ⟨2, by decide⟩)))) * (g * g) := by
    intro g gp s c
    have hW0 : smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨0, by decide⟩))) =
        8 * smMW2 g s * ((c * c + s * s) * (c * c + s * s) * (c * c + s * s)) := by
      rw [sm_wilsonDeltaHom_scale, sm_wilsonDeltaHom_La, sm_frobSq_scale_r_deltaLa]; rfl
    have hW1 : smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨1, by decide⟩))) =
        8 * smMW2 g s * ((c * c + s * s) * (c * c + s * s) * (c * c + s * s)) := by
      rw [sm_wilsonDeltaHom_scale, sm_wilsonDeltaHom_La, sm_frobSq_scale_r_deltaLa]; rfl
    have hGam : smMat5FrobSq (smWilsonDeltaHom s c
        (smMat5Add (smMat5Scale (gp * g) (smSo5L ⟨2, by decide⟩))
                   (smMat5Scale (g * gp) (smSo5R ⟨2, by decide⟩)))) = smMGamma2 := by
      rw [sm_wilsonDeltaHom_add, sm_wilsonDeltaHom_scale, sm_wilsonDeltaHom_scale,
          sm_wilsonDeltaHom_La, sm_wilsonDeltaHom_R2]
      have hZero :
          smMat5Add (smMat5Scale (gp * g) (smMat5Scale (c * c + s * s) (smDeltaLa ⟨2, by decide⟩ s c)))
                    (smMat5Scale (g * gp) (smMat5Neg (smMat5Scale (c * c + s * s) (smDeltaLa ⟨2, by decide⟩ s c)))) =
            smMat5Zero := by
        apply sm_mat5_ext; intro i j
        unfold smMat5Add smMat5Scale smMat5Neg smMat5Zero; ring
      rw [hZero]; decide
    have hZ : smMat5FrobSq (smWilsonDeltaHom s c
        (smMat5Sub (smMat5Scale (g * g) (smSo5L ⟨2, by decide⟩))
                   (smMat5Scale (gp * gp) (smSo5R ⟨2, by decide⟩)))) =
        8 * ((g * g + gp * gp) * smMZ2 g gp s) * ((c * c + s * s) * (c * c + s * s) * (c * c + s * s)) := by
      rw [sm_wilsonDeltaHom_sub, sm_wilsonDeltaHom_scale, sm_wilsonDeltaHom_scale,
          sm_wilsonDeltaHom_La, sm_wilsonDeltaHom_R2]
      have hComb :
          smMat5Sub (smMat5Scale (g * g) (smMat5Scale (c * c + s * s) (smDeltaLa ⟨2, by decide⟩ s c)))
                    (smMat5Scale (gp * gp) (smMat5Neg (smMat5Scale (c * c + s * s) (smDeltaLa ⟨2, by decide⟩ s c)))) =
            smMat5Scale (g * g + gp * gp) (smMat5Scale (c * c + s * s) (smDeltaLa ⟨2, by decide⟩ s c)) := by
        apply sm_mat5_ext; intro i j
        unfold smMat5Sub smMat5Scale smMat5Neg; ring
      rw [hComb, sm_frobSq_scale_r_deltaLa]; unfold smMZ2; ring
    have hRhoDirect :
        smMat5FrobSq (smWilsonDeltaHom s c (smMat5Scale g (smSo5L ⟨0, by decide⟩))) *
          ((g * g + gp * gp) * (g * g + gp * gp)) =
        smMat5FrobSq (smWilsonDeltaHom s c
          (smMat5Sub (smMat5Scale (g * g) (smSo5L ⟨2, by decide⟩))
                     (smMat5Scale (gp * gp) (smSo5R ⟨2, by decide⟩)))) * (g * g) := by
      rw [hW0, hZ]; unfold smMW2 smMZ2; ring
    exact ⟨hW0, hW1, hGam, hZ, hRhoDirect⟩
  have hRho : ∀ (g gp s : Int), smMW2 g s * (g * g + gp * gp) = smMZ2 g gp s * (g * g) := by
    intro g gp s; unfold smMW2 smMZ2; ring
  exact ⟨hAlg, hParity, ⟨sm_so5WilsonHom_orth, hMass, hRho⟩, ⟨by decide, by decide, by decide⟩⟩


/-! ## Section 3: Exact `4 × 4` Pure-`ℤ[ω][1/2]` Slab Operator & `1/3` Evanescent Hierarchy -/

abbrev SMMat4Eis := Fin 4 → Fin 4 → Eis

def smSum4Eis (f : Fin 4 → Eis) : Eis :=
  Eis.add (Eis.add (Eis.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩)) (f ⟨2, by decide⟩)) (f ⟨3, by decide⟩)

def smMat4EisMul (A B : SMMat4Eis) : SMMat4Eis :=
  fun i j => smSum4Eis (fun k => Eis.mul (A i k) (B k j))

def smMat4EisDag (A : SMMat4Eis) : SMMat4Eis :=
  fun i j => Eis.conj (A j i)

def smMat4EisAdd (A B : SMMat4Eis) : SMMat4Eis :=
  fun i j => Eis.add (A i j) (B i j)

def smMat4EisNeg (A : SMMat4Eis) : SMMat4Eis :=
  fun i j => Eis.neg (A i j)

def smMat4EisScaleId (k : Int) : SMMat4Eis :=
  fun i j => if i = j then Eis.ofInt k else Eis.zero

def smMat4EisTrace (A : SMMat4Eis) : Eis :=
  smSum4Eis (fun i => A i i)

/-- Exact `2 i C_1(π/3)` block matrix over `ℤ[ω]` (`1 + 2 ω = i √3`). -/
def smSlabA2 : SMMat4Eis
  | ⟨0, _⟩, ⟨0, _⟩ => ⟨1, 2⟩
  | ⟨0, _⟩, ⟨1, _⟩ => ⟨1, 0⟩
  | ⟨1, _⟩, ⟨0, _⟩ => ⟨1, 0⟩
  | ⟨1, _⟩, ⟨1, _⟩ => ⟨1, 2⟩
  | ⟨2, _⟩, ⟨2, _⟩ => ⟨1, 2⟩
  | ⟨2, _⟩, ⟨3, _⟩ => ⟨1, 0⟩
  | ⟨3, _⟩, ⟨2, _⟩ => ⟨1, 0⟩
  | ⟨3, _⟩, ⟨3, _⟩ => ⟨1, 2⟩
  | _, _ => Eis.zero

/-- Exact `2 B_2(2 π/3)` inter-layer bond matrix over `ℤ[ω]`. -/
def smSlabB2 : SMMat4Eis
  | ⟨0, _⟩, ⟨0, _⟩ => ⟨2, 0⟩
  | ⟨1, _⟩, ⟨1, _⟩ => ⟨-1, 0⟩
  | ⟨1, _⟩, ⟨2, _⟩ => ⟨-1, -2⟩
  | ⟨2, _⟩, ⟨1, _⟩ => ⟨-1, -2⟩
  | ⟨2, _⟩, ⟨2, _⟩ => ⟨-1, 0⟩
  | ⟨3, _⟩, ⟨3, _⟩ => ⟨2, 0⟩
  | _, _ => Eis.zero

/-- Exact `8 U_depth(1) = - (2 i C_1(π/3)) (2 B_2(2 π/3)) (2 i C_1(π/3))` strictly in `ℤ[ω]`. -/
def smSlabM8 : SMMat4Eis :=
  smMat4EisNeg (smMat4EisMul smSlabA2 (smMat4EisMul smSlabB2 smSlabA2))

/-- Exact `16 cos(H_depth(1)) = 8 U_depth(1) + 8 U_depth(1)^†` over `ℤ[ω]`. -/
def smSlabH16 : SMMat4Eis :=
  smMat4EisAdd smSlabM8 (smMat4EisDag smSlabM8)

/-- Chiral grading `σ_z` on basis `(|0, L⟩, |0, R⟩, |1, L⟩, |1, R⟩)`: `+1` on `L`, `-1` on `R`. -/
def smSigmaZ4 (i : Fin 4) : Int :=
  if i.val % 2 = 0 then 1 else -1

/-- Exact quadratic integer ring `ℤ[√5]` (`a + b √5`) for `8 cos(m_eff(1)) = 1 + 3 √5`. -/
structure SMZSqrt5 where
  a : Int
  b : Int
  deriving DecidableEq, Repr

def SMZSqrt5.add (x y : SMZSqrt5) : SMZSqrt5 := ⟨x.a + y.a, x.b + y.b⟩
def SMZSqrt5.sub (x y : SMZSqrt5) : SMZSqrt5 := ⟨x.a - y.a, x.b - y.b⟩
def SMZSqrt5.mul (x y : SMZSqrt5) : SMZSqrt5 := ⟨x.a * y.a + 5 * x.b * y.b, x.a * y.b + x.b * y.a⟩
def SMZSqrt5.scale (k : Int) (x : SMZSqrt5) : SMZSqrt5 := ⟨k * x.a, k * x.b⟩
def SMZSqrt5.ofInt (k : Int) : SMZSqrt5 := ⟨k, 0⟩

/-- Headline Theorem 3 (Exact Pure-`ℤ[ω][1/2]` Slab Unitarity, Chiral Symmetry, Closed-Form Light Mass & `1/3` Hierarchy):
    1. Exact `4 × 4` unitarity `(8 U_depth(1))^† (8 U_depth(1)) = (8 U_depth(1)) (8 U_depth(1))^† = 64 I_4`,
    2. Exact chiral symmetry `σ_z (8 U_depth(1)) σ_z = (8 U_depth(1))^†`,
    3. Exact traces `Tr(8 U_depth(1)) = 4`, `Tr((8 U_depth(1))^2) = 112`, and exact `4 × 4` matrix
       quadratic `H_16^2 = 4 H_16 + 176 I_4` (`H_16 = 8 U + 8 U^†`),
    4. Exact `ℤ[√5]` root certificate: both `x_+ = 1 + 3 √5` (`8 cos(m_eff(1))`) and `x_- = 1 - 3 √5`
       satisfy `x^2 - 2 x - 44 = 0` (`16 c^2 - 4 c - 11 = 0` for `c = x / 8`), with cleared
       equivalence `∀ x : Int, (x - 1)^2 = 45 ↔ x^2 - 2 x - 44 = 0` and strict bound `0 < 1 + 3 √5 < 8`
       (`(3 √5)^2 = 45 < 49 = 7^2`, proving `m_eff(1) ∈ (0, π/2)`),
    5. Exact `1/3` rational chiral zero-mode evanescent transfer identity in `ℤ[ω]`
       (`2 B_2 (2 i C_1 |ψ⟩) = -2 (2 i C_1)^† |ψ⟩` at `ψ_L(0) = 3, ψ_L(1) = -1`, i.e.,
       `tan(π/6) / tan(π/3) = 1/3`) and exact exponential hierarchy `∀ D : Nat, (3 * 3^D)^2 = 9 * (3^D)^2`. -/
theorem thm_sm_pure_zomega_slab_ir_light_mass :
    (∀ i j : Fin 4,
      smMat4EisMul (smMat4EisDag smSlabM8) smSlabM8 i j = smMat4EisScaleId 64 i j ∧
      smMat4EisMul smSlabM8 (smMat4EisDag smSlabM8) i j = smMat4EisScaleId 64 i j) ∧
    (∀ i j : Fin 4,
      Eis.scale (smSigmaZ4 i * smSigmaZ4 j) (smSlabM8 i j) = Eis.conj (smSlabM8 j i)) ∧
    (smMat4EisTrace smSlabM8 = Eis.ofInt 4 ∧
     smMat4EisTrace (smMat4EisMul smSlabM8 smSlabM8) = Eis.ofInt 112 ∧
     ∀ i j : Fin 4,
       smMat4EisMul smSlabH16 smSlabH16 i j =
         Eis.add (Eis.scale 4 (smSlabH16 i j)) (smMat4EisScaleId 176 i j)) ∧
    (let xp : SMZSqrt5 := ⟨1, 3⟩
     let xm : SMZSqrt5 := ⟨1, -3⟩
     SMZSqrt5.sub (SMZSqrt5.sub (SMZSqrt5.mul xp xp) (SMZSqrt5.scale 2 xp)) (SMZSqrt5.ofInt 44) = ⟨0, 0⟩ ∧
     SMZSqrt5.sub (SMZSqrt5.sub (SMZSqrt5.mul xm xm) (SMZSqrt5.scale 2 xm)) (SMZSqrt5.ofInt 44) = ⟨0, 0⟩ ∧
     (∀ x : Int, (x - 1) * (x - 1) = 45 ↔ x * x - 2 * x - 44 = 0) ∧
     (3 * 3 * 5 < 7 * 7)) ∧
    (let w2p1 : Eis := ⟨1, 2⟩
     let mw2p1 : Eis := ⟨-1, -2⟩
     -- Exact E = 0 transfer step on bond (|0,R>, |1,L>) with ψ_L(0)=3, ψ_L(1)=-1 (ratio -1/3):
     Eis.add (Eis.mul ⟨-1, 0⟩ ⟨3, 0⟩) (Eis.mul mw2p1 (Eis.neg w2p1)) = Eis.scale (-2) ⟨3, 0⟩ ∧
     Eis.add (Eis.mul mw2p1 ⟨3, 0⟩) (Eis.mul ⟨-1, 0⟩ (Eis.neg w2p1)) = Eis.scale (-2) (Eis.mul (Eis.conj w2p1) ⟨-1, 0⟩) ∧
     ∀ D : Nat, 3 ^ (D + 1) = 3 * 3 ^ D ∧ (3 * (3 ^ D)) * (3 * (3 ^ D)) = 9 * ((3 ^ D) * (3 ^ D))) := by
  have hQuad : ∀ x : Int, (x - 1) * (x - 1) = 45 ↔ x * x - 2 * x - 44 = 0 := by
    intro x; constructor <;> (intro h; linarith)
  have hExp3 : ∀ D : Nat,
      3 ^ (D + 1) = 3 * 3 ^ D ∧ (3 * (3 ^ D)) * (3 * (3 ^ D)) = 9 * ((3 ^ D) * (3 ^ D)) := by
    intro D; exact ⟨by rw [Nat.pow_succ]; ring, by ring⟩
  exact ⟨by decide, by decide, ⟨by decide, by decide, by decide⟩,
    ⟨by decide, by decide, hQuad, by decide⟩,
    ⟨by decide, by decide, hExp3⟩⟩


/-! ## Section 4: `ASL(2, 3)` 2-Transitivity / Irreducible `1 ⊕ 8` & `O_h` `3_frame = A_{1g} ⊕ E_g` -/

/-- `2 × 2` matrix over `𝔽_3` (`Fin 3`). -/
structure SMMat2F3 where
  a : Fin 3
  b : Fin 3
  c : Fin 3
  d : Fin 3
  deriving DecidableEq, Repr

def smMat2F3Det (M : SMMat2F3) : Nat :=
  (M.a.val * M.d.val + 2 * M.b.val * M.c.val) % 3

def smMat2F3Mul (M N : SMMat2F3) : SMMat2F3 :=
  ⟨ smFin3Add (smFin3Mul M.a N.a) (smFin3Mul M.b N.c),
    smFin3Add (smFin3Mul M.a N.b) (smFin3Mul M.b N.d),
    smFin3Add (smFin3Mul M.c N.a) (smFin3Mul M.d N.c),
    smFin3Add (smFin3Mul M.c N.b) (smFin3Mul M.d N.d) ⟩

def smMat2F3Adj (M : SMMat2F3) : SMMat2F3 :=
  ⟨M.d, smFin3Neg M.b, smFin3Neg M.c, M.a⟩

def smMat2F3Act (M : SMMat2F3) (p : Fin 3 × Fin 3) : Fin 3 × Fin 3 :=
  (smFin3Add (smFin3Mul M.a p.1) (smFin3Mul M.b p.2),
   smFin3Add (smFin3Mul M.c p.1) (smFin3Mul M.d p.2))

/-- Canonical enumeration of all `24` elements of `SL(2, 3)`. -/
def smSL23Table : Fin 24 → SMMat2F3
  | ⟨0, _⟩  => ⟨⟨0, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩⟩
  | ⟨1, _⟩  => ⟨⟨0, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨2, _⟩  => ⟨⟨0, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨3, _⟩  => ⟨⟨0, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩⟩
  | ⟨4, _⟩  => ⟨⟨0, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨5, _⟩  => ⟨⟨0, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨6, _⟩  => ⟨⟨1, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨7, _⟩  => ⟨⟨1, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨8, _⟩  => ⟨⟨1, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨9, _⟩  => ⟨⟨1, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨10, _⟩ => ⟨⟨1, by decide⟩, ⟨1, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨11, _⟩ => ⟨⟨1, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩⟩
  | ⟨12, _⟩ => ⟨⟨1, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨13, _⟩ => ⟨⟨1, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩⟩
  | ⟨14, _⟩ => ⟨⟨1, by decide⟩, ⟨2, by decide⟩, ⟨2, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨15, _⟩ => ⟨⟨2, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨16, _⟩ => ⟨⟨2, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨17, _⟩ => ⟨⟨2, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨18, _⟩ => ⟨⟨2, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨19, _⟩ => ⟨⟨2, by decide⟩, ⟨1, by decide⟩, ⟨1, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨20, _⟩ => ⟨⟨2, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩⟩
  | ⟨21, _⟩ => ⟨⟨2, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩⟩
  | ⟨22, _⟩ => ⟨⟨2, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩⟩
  | ⟨23, _⟩ => ⟨⟨2, by decide⟩, ⟨2, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩⟩
  | ⟨_ + 24, h⟩ => absurd h (by omega)

/-- Inverse lookup from `SMMat2F3` (with `det = 1`) into `Fin 24`. -/
def smSL23Idx (M : SMMat2F3) : Fin 24 :=
  match M.a.val, M.b.val, M.c.val, M.d.val with
  | 0, 1, 2, 0 => ⟨0, by decide⟩
  | 0, 1, 2, 1 => ⟨1, by decide⟩
  | 0, 1, 2, 2 => ⟨2, by decide⟩
  | 0, 2, 1, 0 => ⟨3, by decide⟩
  | 0, 2, 1, 1 => ⟨4, by decide⟩
  | 0, 2, 1, 2 => ⟨5, by decide⟩
  | 1, 0, 0, 1 => ⟨6, by decide⟩
  | 1, 0, 1, 1 => ⟨7, by decide⟩
  | 1, 0, 2, 1 => ⟨8, by decide⟩
  | 1, 1, 0, 1 => ⟨9, by decide⟩
  | 1, 1, 1, 2 => ⟨10, by decide⟩
  | 1, 1, 2, 0 => ⟨11, by decide⟩
  | 1, 2, 0, 1 => ⟨12, by decide⟩
  | 1, 2, 1, 0 => ⟨13, by decide⟩
  | 1, 2, 2, 2 => ⟨14, by decide⟩
  | 2, 0, 0, 2 => ⟨15, by decide⟩
  | 2, 0, 1, 2 => ⟨16, by decide⟩
  | 2, 0, 2, 2 => ⟨17, by decide⟩
  | 2, 1, 0, 2 => ⟨18, by decide⟩
  | 2, 1, 1, 1 => ⟨19, by decide⟩
  | 2, 1, 2, 0 => ⟨20, by decide⟩
  | 2, 2, 0, 2 => ⟨21, by decide⟩
  | 2, 2, 1, 0 => ⟨22, by decide⟩
  | 2, 2, 2, 1 => ⟨23, by decide⟩
  | _, _, _, _ => ⟨6, by decide⟩

def smSL23Mul (k1 k2 : Fin 24) : Fin 24 :=
  smSL23Idx (smMat2F3Mul (smSL23Table k1) (smSL23Table k2))

def smSL23Inv (k : Fin 24) : Fin 24 :=
  smSL23Idx (smMat2F3Adj (smSL23Table k))

/-- Explicit `SL(2, 3)` element mapping `(1, 0) ↦ (x, y)` for any nonzero `(x, y) ∈ 𝔽_3^2`. -/
def smSL23FromE0 (x y : Fin 3) : Fin 24 :=
  match x.val, y.val with
  | 0, 1 => ⟨3, by decide⟩
  | 0, 2 => ⟨0, by decide⟩
  | 1, 0 => ⟨6, by decide⟩
  | 1, 1 => ⟨7, by decide⟩
  | 1, 2 => ⟨8, by decide⟩
  | 2, 0 => ⟨15, by decide⟩
  | 2, 1 => ⟨16, by decide⟩
  | 2, 2 => ⟨17, by decide⟩
  | _, _ => ⟨6, by decide⟩

/-- Explicit `216`-element affine special linear group `ASL(2, 3) = SL(2, 3) ⋉ 𝔽_3^2`. -/
structure SMASL23 where
  lin : Fin 24
  trX : Fin 3
  trY : Fin 3
  deriving DecidableEq, Repr

def smASL23Act (g : SMASL23) (p : Fin 3 × Fin 3) : Fin 3 × Fin 3 :=
  let q := smMat2F3Act (smSL23Table g.lin) p
  (smFin3Add q.1 g.trX, smFin3Add q.2 g.trY)

def smASL23Mul (g1 g2 : SMASL23) : SMASL23 :=
  let q := smMat2F3Act (smSL23Table g1.lin) (g2.trX, g2.trY)
  ⟨smSL23Mul g1.lin g2.lin, smFin3Add q.1 g1.trX, smFin3Add q.2 g1.trY⟩

/-- Four affine parallel-line `3 × 3` foliations of `𝔽_3^2`: `r`, `t`, `r + t`, `r - t`. -/
def smParallelFoliation (f : Fin 4) (p : Fin 3 × Fin 3) : Fin 3 :=
  match f with
  | ⟨0, _⟩ => p.1
  | ⟨1, _⟩ => p.2
  | ⟨2, _⟩ => smFin3Add p.1 p.2
  | ⟨3, _⟩ => smFin3Sub p.1 p.2

def smSumFinAux {n : Nat} : (k : Nat) → k ≤ n → (Fin n → Nat) → Nat
  | 0, _, _ => 0
  | k + 1, hk, f => smSumFinAux k (Nat.le_of_succ_le hk) f + f ⟨k, hk⟩

def smSumFin {n : Nat} (f : Fin n → Nat) : Nat :=
  smSumFinAux n (Nat.le_refl n) f

def smASL23FixCount (g : SMASL23) : Nat :=
  smSumFin (fun x : Fin 3 => smSumFin (fun y : Fin 3 =>
    if smASL23Act g (x, y) = (x, y) then 1 else 0))

def smASL23SumFix : Nat :=
  smSumFin (fun k : Fin 24 => smSumFin (fun tx : Fin 3 => smSumFin (fun ty : Fin 3 =>
    smASL23FixCount ⟨k, tx, ty⟩)))

def smASL23SumFixSq : Nat :=
  smSumFin (fun k : Fin 24 => smSumFin (fun tx : Fin 3 => smSumFin (fun ty : Fin 3 =>
    let c := smASL23FixCount ⟨k, tx, ty⟩
    c * c)))

/-- All `6` permutations of `Fin 3` (`S_3`). -/
def smPerm3 : Fin 6 → Fin 3 → Fin 3
  | ⟨0, _⟩, ⟨0, _⟩ => ⟨0, by decide⟩
  | ⟨0, _⟩, ⟨1, _⟩ => ⟨1, by decide⟩
  | ⟨0, _⟩, ⟨2, _⟩ => ⟨2, by decide⟩
  | ⟨1, _⟩, ⟨0, _⟩ => ⟨0, by decide⟩
  | ⟨1, _⟩, ⟨1, _⟩ => ⟨2, by decide⟩
  | ⟨1, _⟩, ⟨2, _⟩ => ⟨1, by decide⟩
  | ⟨2, _⟩, ⟨0, _⟩ => ⟨1, by decide⟩
  | ⟨2, _⟩, ⟨1, _⟩ => ⟨0, by decide⟩
  | ⟨2, _⟩, ⟨2, _⟩ => ⟨2, by decide⟩
  | ⟨3, _⟩, ⟨0, _⟩ => ⟨1, by decide⟩
  | ⟨3, _⟩, ⟨1, _⟩ => ⟨2, by decide⟩
  | ⟨3, _⟩, ⟨2, _⟩ => ⟨0, by decide⟩
  | ⟨4, _⟩, ⟨0, _⟩ => ⟨2, by decide⟩
  | ⟨4, _⟩, ⟨1, _⟩ => ⟨0, by decide⟩
  | ⟨4, _⟩, ⟨2, _⟩ => ⟨1, by decide⟩
  | ⟨5, _⟩, ⟨0, _⟩ => ⟨2, by decide⟩
  | ⟨5, _⟩, ⟨1, _⟩ => ⟨1, by decide⟩
  | ⟨5, _⟩, ⟨2, _⟩ => ⟨0, by decide⟩

def smPerm3Idx (p0 p1 p2 : Fin 3) : Fin 6 :=
  match p0.val, p1.val, p2.val with
  | 0, 1, 2 => ⟨0, by decide⟩
  | 0, 2, 1 => ⟨1, by decide⟩
  | 1, 0, 2 => ⟨2, by decide⟩
  | 1, 2, 0 => ⟨3, by decide⟩
  | 2, 0, 1 => ⟨4, by decide⟩
  | 2, 1, 0 => ⟨5, by decide⟩
  | _, _, _ => ⟨0, by decide⟩

def smPerm3Mul (p1 p2 : Fin 6) : Fin 6 :=
  smPerm3Idx (smPerm3 p1 (smPerm3 p2 ⟨0, by decide⟩))
             (smPerm3 p1 (smPerm3 p2 ⟨1, by decide⟩))
             (smPerm3 p1 (smPerm3 p2 ⟨2, by decide⟩))

/-- Sign triple `s ∈ Fin 8` (`(ℤ_2)^3`) on `Fin 3`. -/
def smSign3 (s : Fin 8) (i : Fin 3) : Int :=
  match i with
  | ⟨0, _⟩ => if s.val % 2 = 0 then 1 else -1
  | ⟨1, _⟩ => if (s.val / 2) % 2 = 0 then 1 else -1
  | ⟨2, _⟩ => if (s.val / 4) % 2 = 0 then 1 else -1

def smSign3Pack (b0 b1 b2 : Bool) : Fin 8 :=
  ⟨(if b0 then 1 else 0) + 2 * (if b1 then 1 else 0) + 4 * (if b2 then 1 else 0),
    by cases b0 <;> cases b1 <;> cases b2 <;> decide⟩

/-- Explicit `48`-element octahedral group `O_h = S_3 ⋉ (ℤ_2)^3 = Stab_{W(F_4)}(v_cusp)`. -/
structure SMOh where
  perm : Fin 6
  sign : Fin 8
  deriving DecidableEq, Repr

def smOhMat3 (g : SMOh) (i j : Fin 3) : Int :=
  if i = smPerm3 g.perm j then smSign3 g.sign j else 0

def smOhMul (g1 g2 : SMOh) : SMOh :=
  let s0 := smSign3 g1.sign (smPerm3 g2.perm ⟨0, by decide⟩) * smSign3 g2.sign ⟨0, by decide⟩
  let s1 := smSign3 g1.sign (smPerm3 g2.perm ⟨1, by decide⟩) * smSign3 g2.sign ⟨1, by decide⟩
  let s2 := smSign3 g1.sign (smPerm3 g2.perm ⟨2, by decide⟩) * smSign3 g2.sign ⟨2, by decide⟩
  ⟨smPerm3Mul g1.perm g2.perm,
   smSign3Pack (if s0 < 0 then true else false)
               (if s1 < 0 then true else false)
               (if s2 < 0 then true else false)⟩

def smMat3IntMul (A B : Fin 3 → Fin 3 → Int) (i j : Fin 3) : Int :=
  A i ⟨0, by decide⟩ * B ⟨0, by decide⟩ j +
  A i ⟨1, by decide⟩ * B ⟨1, by decide⟩ j +
  A i ⟨2, by decide⟩ * B ⟨2, by decide⟩ j

/-- Action of `O_h` on the 3 inscribed `D_4` 16-cell frames (`Fin 3`) and its characters `χ_frame`, `χ_{Eg}`. -/
def smOhFrameAct (g : SMOh) (f : Fin 3) : Fin 3 := smPerm3 g.perm f

def smOhChiFrame (g : SMOh) : Nat :=
  (if smOhFrameAct g ⟨0, by decide⟩ = ⟨0, by decide⟩ then 1 else 0) +
  (if smOhFrameAct g ⟨1, by decide⟩ = ⟨1, by decide⟩ then 1 else 0) +
  (if smOhFrameAct g ⟨2, by decide⟩ = ⟨2, by decide⟩ then 1 else 0)

def smOhChiEg (g : SMOh) : Int := (smOhChiFrame g : Int) - 1

def smOhSumChiFrame : Nat :=
  smSumFin (fun p : Fin 6 => smSumFin (fun s : Fin 8 => smOhChiFrame ⟨p, s⟩))

def smOhSumChiFrameSq : Nat :=
  smSumFin (fun p : Fin 6 => smSumFin (fun s : Fin 8 =>
    let c := smOhChiFrame ⟨p, s⟩
    c * c))

def smSumFinIntAux {n : Nat} : (k : Nat) → k ≤ n → (Fin n → Int) → Int
  | 0, _, _ => 0
  | k + 1, hk, f => smSumFinIntAux k (Nat.le_of_succ_le hk) f + f ⟨k, hk⟩

def smSumFinInt {n : Nat} (f : Fin n → Int) : Int :=
  smSumFinIntAux n (Nat.le_refl n) f

def smOhSumChiEg : Int :=
  smSumFinInt (fun p : Fin 6 => smSumFinInt (fun s : Fin 8 => smOhChiEg ⟨p, s⟩))

def smOhSumChiEgSq : Int :=
  smSumFinInt (fun p : Fin 6 => smSumFinInt (fun s : Fin 8 =>
    let c := smOhChiEg ⟨p, s⟩
    c * c))

private theorem sm_sl23_roundtrip : ∀ k : Fin 24, smSL23Idx (smSL23Table k) = k := by decide

private theorem sm_sl23_mul_spec :
    ∀ k1 k2 : Fin 24, smSL23Table (smSL23Mul k1 k2) = smMat2F3Mul (smSL23Table k1) (smSL23Table k2) := by
  decide

private theorem sm_mul_mod3_left (a b : Nat) : ((a % 3) * b) % 3 = (a * b) % 3 := by
  rw [Nat.mul_mod, Nat.mod_mod, ← Nat.mul_mod]

private theorem sm_mul_mod3_right (a b : Nat) : (a * (b % 3)) % 3 = (a * b) % 3 := by
  rw [Nat.mul_mod, Nat.mod_mod, ← Nat.mul_mod]

private theorem sm_sl23_act_mul (k1 k2 : Fin 24) (x y : Fin 3) :
    smMat2F3Act (smSL23Table k1) (smMat2F3Act (smSL23Table k2) (x, y)) =
      smMat2F3Act (smSL23Table (smSL23Mul k1 k2)) (x, y) := by
  rw [sm_sl23_mul_spec]
  cases smSL23Table k1 with | mk a1 b1 c1 d1 =>
  cases smSL23Table k2 with | mk a2 b2 c2 d2 =>
  unfold smMat2F3Act smMat2F3Mul smFin3Add smFin3Mul
  have hMod : ∀ u1 u2 v1 v2 w1 w2 z1 z2 : Nat,
      (u1 * ((v1 * z1 % 3 + v2 * z2 % 3) % 3) % 3 + u2 * ((w1 * z1 % 3 + w2 * z2 % 3) % 3) % 3) % 3 =
      ((u1 * v1 % 3 + u2 * w1 % 3) % 3 * z1 % 3 + (u1 * v2 % 3 + u2 * w2 % 3) % 3 * z2 % 3) % 3 := by
    intro u1 u2 v1 v2 w1 w2 z1 z2
    have hL1 : u1 * ((v1 * z1 % 3 + v2 * z2 % 3) % 3) % 3 = (u1 * (v1 * z1 + v2 * z2)) % 3 := by
      have h1 : (v1 * z1 % 3 + v2 * z2 % 3) % 3 = (v1 * z1 + v2 * z2) % 3 := by omega
      rw [h1, sm_mul_mod3_right]
    have hL2 : u2 * ((w1 * z1 % 3 + w2 * z2 % 3) % 3) % 3 = (u2 * (w1 * z1 + w2 * z2)) % 3 := by
      have h1 : (w1 * z1 % 3 + w2 * z2 % 3) % 3 = (w1 * z1 + w2 * z2) % 3 := by omega
      rw [h1, sm_mul_mod3_right]
    have hR1 : (u1 * v1 % 3 + u2 * w1 % 3) % 3 * z1 % 3 = ((u1 * v1 + u2 * w1) * z1) % 3 := by
      have h1 : (u1 * v1 % 3 + u2 * w1 % 3) % 3 = (u1 * v1 + u2 * w1) % 3 := by omega
      rw [h1, sm_mul_mod3_left]
    have hR2 : (u1 * v2 % 3 + u2 * w2 % 3) % 3 * z2 % 3 = ((u1 * v2 + u2 * w2) * z2) % 3 := by
      have h1 : (u1 * v2 % 3 + u2 * w2 % 3) % 3 = (u1 * v2 + u2 * w2) % 3 := by omega
      rw [h1, sm_mul_mod3_left]
    rw [hL1, hL2, hR1, hR2]
    have hEq : u1 * (v1 * z1 + v2 * z2) + u2 * (w1 * z1 + w2 * z2) =
        (u1 * v1 + u2 * w1) * z1 + (u1 * v2 + u2 * w2) * z2 := by
      simp only [Nat.mul_add, Nat.add_mul, Nat.mul_assoc]; omega
    omega
  exact Prod.ext
    (Fin.ext (hMod a1.val b1.val a2.val b2.val c2.val d2.val x.val y.val))
    (Fin.ext (hMod c1.val d1.val a2.val b2.val c2.val d2.val x.val y.val))

private theorem sm_sl23_act_add (k : Fin 24) (x1 y1 x2 y2 : Fin 3) :
    let p1 := smMat2F3Act (smSL23Table k) (x1, y1)
    let p2 := smMat2F3Act (smSL23Table k) (x2, y2)
    smMat2F3Act (smSL23Table k) (smFin3Add x1 x2, smFin3Add y1 y2) =
      (smFin3Add p1.1 p2.1, smFin3Add p1.2 p2.2) := by
  cases smSL23Table k with | mk a b c d =>
  unfold smMat2F3Act smFin3Add smFin3Mul
  have hLin : ∀ u v x1 y1 x2 y2 : Nat,
      (u * ((x1 + x2) % 3) % 3 + v * ((y1 + y2) % 3) % 3) % 3 =
      ((u * x1 % 3 + v * y1 % 3) % 3 + (u * x2 % 3 + v * y2 % 3) % 3) % 3 := by
    intro u v x1 y1 x2 y2
    rw [sm_mul_mod3_right u (x1 + x2), sm_mul_mod3_right v (y1 + y2)]
    have h3 : u * (x1 + x2) + v * (y1 + y2) = (u * x1 + v * y1) + (u * x2 + v * y2) := by
      simp only [Nat.mul_add]; omega
    omega
  exact Prod.ext
    (Fin.ext (hLin a.val b.val x1.val y1.val x2.val y2.val))
    (Fin.ext (hLin c.val d.val x1.val y1.val x2.val y2.val))

private theorem sm_sl23_map_nonzero_spec :
    ∀ u1 u2 v1 v2 : Fin 3,
      (u1 ≠ ⟨0, by decide⟩ ∨ u2 ≠ ⟨0, by decide⟩) →
      (v1 ≠ ⟨0, by decide⟩ ∨ v2 ≠ ⟨0, by decide⟩) →
      smMat2F3Act (smSL23Table (smSL23Mul (smSL23FromE0 v1 v2) (smSL23Inv (smSL23FromE0 u1 u2))))
        (u1, u2) = (v1, v2) := by
  decide

private theorem sm_fin3_add_assoc : ∀ a b c : Fin 3, smFin3Add (smFin3Add a b) c = smFin3Add a (smFin3Add b c) := by decide
private theorem sm_fin3_add_comm : ∀ a b : Fin 3, smFin3Add a b = smFin3Add b a := by decide
private theorem sm_fin3_add_sub_cancel : ∀ a b : Fin 3, smFin3Add a (smFin3Sub b a) = b := by decide
private theorem sm_fin3_sub_eq_zero_iff : ∀ a b : Fin 3, smFin3Sub a b = ⟨0, by decide⟩ ↔ a = b := by decide

private theorem sm_asl23_two_transitive :
    ∀ p1 p2 q1 q2 : Fin 3 × Fin 3, p1 ≠ p2 → q1 ≠ q2 →
      ∃ g : SMASL23, smASL23Act g p1 = q1 ∧ smASL23Act g p2 = q2 := by
  rintro ⟨x1, y1⟩ ⟨x2, y2⟩ ⟨a1, b1⟩ ⟨a2, b2⟩ hp hq
  let u1 := smFin3Sub x2 x1
  let u2 := smFin3Sub y2 y1
  let v1 := smFin3Sub a2 a1
  let v2 := smFin3Sub b2 b1
  have hu : u1 ≠ ⟨0, by decide⟩ ∨ u2 ≠ ⟨0, by decide⟩ := by
    if h1 : u1 = ⟨0, by decide⟩ then
      apply Or.inr; intro h2
      have hx : x2 = x1 := (sm_fin3_sub_eq_zero_iff x2 x1).mp h1
      have hy : y2 = y1 := (sm_fin3_sub_eq_zero_iff y2 y1).mp h2
      exact hp (Prod.ext hx.symm hy.symm)
    else
      exact Or.inl h1
  have hv : v1 ≠ ⟨0, by decide⟩ ∨ v2 ≠ ⟨0, by decide⟩ := by
    if h1 : v1 = ⟨0, by decide⟩ then
      apply Or.inr; intro h2
      have ha : a2 = a1 := (sm_fin3_sub_eq_zero_iff a2 a1).mp h1
      have hb : b2 = b1 := (sm_fin3_sub_eq_zero_iff b2 b1).mp h2
      exact hq (Prod.ext ha.symm hb.symm)
    else
      exact Or.inl h1
  let k := smSL23Mul (smSL23FromE0 v1 v2) (smSL23Inv (smSL23FromE0 u1 u2))
  let mp1 := smMat2F3Act (smSL23Table k) (x1, y1)
  let tx := smFin3Sub a1 mp1.1
  let ty := smFin3Sub b1 mp1.2
  refine ⟨⟨k, tx, ty⟩, ?_, ?_⟩
  · dsimp only [smASL23Act]
    exact Prod.ext (sm_fin3_add_sub_cancel mp1.1 a1) (sm_fin3_add_sub_cancel mp1.2 b1)
  · have hp2 : (x2, y2) = (smFin3Add x1 u1, smFin3Add y1 u2) :=
      Prod.ext (sm_fin3_add_sub_cancel x1 x2).symm (sm_fin3_add_sub_cancel y1 y2).symm
    have hMap : smMat2F3Act (smSL23Table k) (u1, u2) = (v1, v2) :=
      sm_sl23_map_nonzero_spec u1 u2 v1 v2 hu hv
    dsimp only [smASL23Act]
    rw [hp2, sm_sl23_act_add k x1 y1 u1 u2, hMap]
    dsimp only
    refine Prod.ext ?_ ?_
    · dsimp only
      rw [sm_fin3_add_comm mp1.1 v1, sm_fin3_add_assoc v1 mp1.1 tx, sm_fin3_add_sub_cancel mp1.1 a1,
          sm_fin3_add_comm v1 a1, sm_fin3_add_sub_cancel a1 a2]
    · dsimp only
      rw [sm_fin3_add_comm mp1.2 v2, sm_fin3_add_assoc v2 mp1.2 ty, sm_fin3_add_sub_cancel mp1.2 b1,
          sm_fin3_add_comm v2 b1, sm_fin3_add_sub_cancel b1 b2]

private theorem sm_mat2f3_ext (M N : SMMat2F3)
    (ha : M.a = N.a) (hb : M.b = N.b) (hc : M.c = N.c) (hd : M.d = N.d) : M = N := by
  cases M; cases N; cases ha; cases hb; cases hc; cases hd; rfl

private theorem sm_asl23_faithful (g1 g2 : SMASL23)
    (h : ∀ p : Fin 3 × Fin 3, smASL23Act g1 p = smASL23Act g2 p) : g1 = g2 := by
  have h00 : smASL23Act g1 (⟨0, by decide⟩, ⟨0, by decide⟩) = smASL23Act g2 (⟨0, by decide⟩, ⟨0, by decide⟩) :=
    h (⟨0, by decide⟩, ⟨0, by decide⟩)
  have hZero : ∀ k : Fin 24, smMat2F3Act (smSL23Table k) (⟨0, by decide⟩, ⟨0, by decide⟩) = (⟨0, by decide⟩, ⟨0, by decide⟩) := by decide
  have hAdd0 : ∀ a : Fin 3, smFin3Add ⟨0, by decide⟩ a = a := by decide
  dsimp only [smASL23Act] at h00
  rw [hZero g1.lin, hZero g2.lin] at h00
  dsimp only at h00
  rw [hAdd0, hAdd0, hAdd0, hAdd0] at h00
  have htx : g1.trX = g2.trX := congrArg Prod.fst h00
  have hty : g1.trY = g2.trY := congrArg Prod.snd h00
  have hE10 : smASL23Act g1 (⟨1, by decide⟩, ⟨0, by decide⟩) = smASL23Act g2 (⟨1, by decide⟩, ⟨0, by decide⟩) :=
    h (⟨1, by decide⟩, ⟨0, by decide⟩)
  have hE01 : smASL23Act g1 (⟨0, by decide⟩, ⟨1, by decide⟩) = smASL23Act g2 (⟨0, by decide⟩, ⟨1, by decide⟩) :=
    h (⟨0, by decide⟩, ⟨1, by decide⟩)
  have hAddInj : ∀ a b c : Fin 3, smFin3Add a c = smFin3Add b c → a = b := by decide
  have hCol1 : ∀ k : Fin 24, smMat2F3Act (smSL23Table k) (⟨1, by decide⟩, ⟨0, by decide⟩) = ((smSL23Table k).a, (smSL23Table k).c) := by decide
  have hCol2 : ∀ k : Fin 24, smMat2F3Act (smSL23Table k) (⟨0, by decide⟩, ⟨1, by decide⟩) = ((smSL23Table k).b, (smSL23Table k).d) := by decide
  dsimp only [smASL23Act] at hE10 hE01
  rw [hCol1, hCol1, htx, hty] at hE10
  rw [hCol2, hCol2, htx, hty] at hE01
  dsimp only at hE10 hE01
  have ha : (smSL23Table g1.lin).a = (smSL23Table g2.lin).a := hAddInj _ _ _ (congrArg Prod.fst hE10)
  have hc : (smSL23Table g1.lin).c = (smSL23Table g2.lin).c := hAddInj _ _ _ (congrArg Prod.snd hE10)
  have hb : (smSL23Table g1.lin).b = (smSL23Table g2.lin).b := hAddInj _ _ _ (congrArg Prod.fst hE01)
  have hd : (smSL23Table g1.lin).d = (smSL23Table g2.lin).d := hAddInj _ _ _ (congrArg Prod.snd hE01)
  have hMat : smSL23Table g1.lin = smSL23Table g2.lin := sm_mat2f3_ext _ _ ha hb hc hd
  have hLin : g1.lin = g2.lin := by
    rw [← sm_sl23_roundtrip g1.lin, hMat, sm_sl23_roundtrip g2.lin]
  cases g1; cases g2; cases hLin; cases htx; cases hty; rfl

private theorem sm_asl23_mul_act (g1 g2 : SMASL23) (p : Fin 3 × Fin 3) :
    smASL23Act g1 (smASL23Act g2 p) = smASL23Act (smASL23Mul g1 g2) p := by
  cases p with | mk x y =>
  unfold smASL23Act smASL23Mul
  rw [sm_sl23_act_add g1.lin _ _ g2.trX g2.trY, sm_sl23_act_mul g1.lin g2.lin x y]
  exact Prod.ext (sm_fin3_add_assoc _ _ _) (sm_fin3_add_assoc _ _ _)

private theorem sm_perm3_mul_spec :
    ∀ (p1 p2 : Fin 6) (k : Fin 3), smPerm3 (smPerm3Mul p1 p2) k = smPerm3 p1 (smPerm3 p2 k) := by
  decide

private theorem sm_sign3_mul_spec :
    ∀ (p2 : Fin 6) (s1 s2 : Fin 8) (j : Fin 3),
      smSign3 (smOhMul ⟨⟨0, by decide⟩, s1⟩ ⟨p2, s2⟩).sign j =
        smSign3 s1 (smPerm3 p2 j) * smSign3 s2 j := by
  decide

private theorem sm_oh_mul_mat3 (g1 g2 : SMOh) (i j : Fin 3) :
    smMat3IntMul (smOhMat3 g1) (smOhMat3 g2) i j = smOhMat3 (smOhMul g1 g2) i j := by
  have hSign : smSign3 (smOhMul g1 g2).sign j = smSign3 g1.sign (smPerm3 g2.perm j) * smSign3 g2.sign j :=
    sm_sign3_mul_spec g2.perm g1.sign g2.sign j
  have hPerm : smPerm3 (smOhMul g1 g2).perm j = smPerm3 g1.perm (smPerm3 g2.perm j) :=
    sm_perm3_mul_spec g1.perm g2.perm j
  unfold smMat3IntMul smOhMat3
  rw [hPerm, hSign]
  cases smPerm3 g2.perm j with | mk kv hkv =>
  match kv, hkv with
  | 0, h0v =>
    have h0 : (⟨0, by decide⟩ : Fin 3) = ⟨0, h0v⟩ := rfl
    have h1 : (⟨1, by decide⟩ : Fin 3) ≠ ⟨0, h0v⟩ := by intro h; have hv : 1 = 0 := congrArg Fin.val h; omega
    have h2 : (⟨2, by decide⟩ : Fin 3) ≠ ⟨0, h0v⟩ := by intro h; have hv : 2 = 0 := congrArg Fin.val h; omega
    rw [ite_eq_left h0, ite_eq_right h1, ite_eq_right h2, Int.mul_zero, Int.mul_zero, Int.add_zero, Int.add_zero]
    if hi : i = smPerm3 g1.perm ⟨0, h0v⟩ then
      rw [ite_eq_left hi, ite_eq_left hi]
    else
      rw [ite_eq_right hi, ite_eq_right hi, Int.zero_mul]
  | 1, h1v =>
    have h0 : (⟨0, by decide⟩ : Fin 3) ≠ ⟨1, h1v⟩ := by intro h; have hv : 0 = 1 := congrArg Fin.val h; omega
    have h1 : (⟨1, by decide⟩ : Fin 3) = ⟨1, h1v⟩ := rfl
    have h2 : (⟨2, by decide⟩ : Fin 3) ≠ ⟨1, h1v⟩ := by intro h; have hv : 2 = 1 := congrArg Fin.val h; omega
    rw [ite_eq_right h0, ite_eq_left h1, ite_eq_right h2, Int.mul_zero, Int.mul_zero, Int.zero_add, Int.add_zero]
    if hi : i = smPerm3 g1.perm ⟨1, h1v⟩ then
      rw [ite_eq_left hi, ite_eq_left hi]
    else
      rw [ite_eq_right hi, ite_eq_right hi, Int.zero_mul]
  | 2, h2v =>
    have h0 : (⟨0, by decide⟩ : Fin 3) ≠ ⟨2, h2v⟩ := by intro h; have hv : 0 = 2 := congrArg Fin.val h; omega
    have h1 : (⟨1, by decide⟩ : Fin 3) ≠ ⟨2, h2v⟩ := by intro h; have hv : 1 = 2 := congrArg Fin.val h; omega
    have h2 : (⟨2, by decide⟩ : Fin 3) = ⟨2, h2v⟩ := rfl
    rw [ite_eq_right h0, ite_eq_right h1, ite_eq_left h2, Int.mul_zero, Int.mul_zero, Int.add_zero, Int.zero_add]
    if hi : i = smPerm3 g1.perm ⟨2, h2v⟩ then
      rw [ite_eq_left hi, ite_eq_left hi]
    else
      rw [ite_eq_right hi, ite_eq_right hi, Int.zero_mul]
  | _ + 3, h => exact absurd h (by omega)

/-- Headline Theorem 4 (`ASL(2, 3)` Exact 2-Transitivity / Irreducible `1 ⊕ 8` & `O_h` `3_frame = A_{1g} ⊕ E_g`):
    1. Exact `24`-element `SL(2, 3)` (`|ASL(2, 3)| = 24 × 9 = 216`), faithful action on `Fin 3 × Fin 3`,
       and exact group closure under composition,
    2. Exact 2-transitivity of `ASL(2, 3)` on `Fin 3 × Fin 3`,
    3. Exact Burnside character proof `∑_{g ∈ ASL(2,3)} fix(g) = 216` and `∑_{g ∈ ASL(2,3)} fix(g)^2 = 432 = 2 · 216`
       (proving `ℂ^9 = 1 ⊕ 8` irreducible, NOT `3_C ⊗ 3_gen`),
    4. Exact non-existence of ANY nontrivial `ASL(2, 3)`-invariant partition of `Fin 3 × Fin 3`, and in
       particular `0 / 4` invariant parallel-line `3 × 3` foliations,
    5. Exact `48`-element `O_h` signed permutation group closure and 3-frame decomposition
       `3_frame = A_{1g} ⊕ E_g`: `∑ χ_frame = 48` (multiplicity `1` of `A_{1g}`),
       `∑ χ_frame^2 = 96 = 2 · 48` (strictly `2` irreps, NOT `3 A_{1g}`), `∑ χ_{Eg} = 0`, `∑ χ_{Eg}^2 = 48`. -/
theorem thm_sm_asl23_two_transitivity_and_oh_triality_obstruction :
    ((∀ k : Fin 24, smMat2F3Det (smSL23Table k) = 1) ∧
     (∀ a b c d : Fin 3, smMat2F3Det ⟨a, b, c, d⟩ = 1 →
       smSL23Table (smSL23Idx ⟨a, b, c, d⟩) = ⟨a, b, c, d⟩) ∧
     (24 * 9 = 216) ∧
     (∀ g1 g2 : SMASL23, (∀ p, smASL23Act g1 p = smASL23Act g2 p) → g1 = g2) ∧
     (∀ g1 g2 : SMASL23, ∀ p, smASL23Act g1 (smASL23Act g2 p) = smASL23Act (smASL23Mul g1 g2) p)) ∧
    (∀ p1 p2 q1 q2 : Fin 3 × Fin 3, p1 ≠ p2 → q1 ≠ q2 →
      ∃ g : SMASL23, smASL23Act g p1 = q1 ∧ smASL23Act g p2 = q2) ∧
    (smASL23SumFix = 216 ∧ smASL23SumFixSq = 2 * 216) ∧
    ((∀ f : (Fin 3 × Fin 3) → Fin 3,
        (∃ a b, a ≠ b ∧ f a = f b) → (∃ c d, f c ≠ f d) →
        ¬ (∀ g : SMASL23, ∀ x y, f x = f y → f (smASL23Act g x) = f (smASL23Act g y))) ∧
     (∀ k : Fin 4,
        ¬ (∀ g : SMASL23, ∀ x y,
          smParallelFoliation k x = smParallelFoliation k y →
          smParallelFoliation k (smASL23Act g x) = smParallelFoliation k (smASL23Act g y)))) ∧
    ((6 * 8 = 48) ∧
     (∀ (g1 g2 : SMOh) (i j : Fin 3), smMat3IntMul (smOhMat3 g1) (smOhMat3 g2) i j = smOhMat3 (smOhMul g1 g2) i j) ∧
     smOhSumChiFrame = 48 ∧
     smOhSumChiFrameSq = 2 * 48 ∧
     smOhSumChiEg = 0 ∧
     smOhSumChiEgSq = 48) := by
  have hNoPart :
      ∀ f : (Fin 3 × Fin 3) → Fin 3,
        (∃ a b, a ≠ b ∧ f a = f b) → (∃ c d, f c ≠ f d) →
        ¬ (∀ g : SMASL23, ∀ x y, f x = f y → f (smASL23Act g x) = f (smASL23Act g y)) := by
    rintro f ⟨a, b, hab, hfab⟩ ⟨c, d, hfcd⟩ hInv
    have hcd : c ≠ d := fun hEq => hfcd (congrArg f hEq)
    obtain ⟨g, hg1, hg2⟩ := sm_asl23_two_transitive a b c d hab hcd
    have hEq := hInv g a b hfab
    rw [hg1, hg2] at hEq
    exact hfcd hEq
  have hNoParFol : ∀ k : Fin 4,
      ¬ (∀ g : SMASL23, ∀ x y,
        smParallelFoliation k x = smParallelFoliation k y →
        smParallelFoliation k (smASL23Act g x) = smParallelFoliation k (smASL23Act g y)) := by
    intro k
    have hSame : ∃ a b : Fin 3 × Fin 3, a ≠ b ∧ smParallelFoliation k a = smParallelFoliation k b := by
      match k with
      | ⟨0, h⟩ =>
        have hk : (⟨0, h⟩ : Fin 4) = ⟨0, by decide⟩ := rfl
        rw [hk]; exact ⟨(⟨0, by decide⟩, ⟨0, by decide⟩), (⟨0, by decide⟩, ⟨1, by decide⟩), by decide, by decide⟩
      | ⟨1, h⟩ =>
        have hk : (⟨1, h⟩ : Fin 4) = ⟨1, by decide⟩ := rfl
        rw [hk]; exact ⟨(⟨0, by decide⟩, ⟨0, by decide⟩), (⟨1, by decide⟩, ⟨0, by decide⟩), by decide, by decide⟩
      | ⟨2, h⟩ =>
        have hk : (⟨2, h⟩ : Fin 4) = ⟨2, by decide⟩ := rfl
        rw [hk]; exact ⟨(⟨0, by decide⟩, ⟨0, by decide⟩), (⟨1, by decide⟩, ⟨2, by decide⟩), by decide, by decide⟩
      | ⟨3, h⟩ =>
        have hk : (⟨3, h⟩ : Fin 4) = ⟨3, by decide⟩ := rfl
        rw [hk]; exact ⟨(⟨0, by decide⟩, ⟨0, by decide⟩), (⟨1, by decide⟩, ⟨1, by decide⟩), by decide, by decide⟩
    have hDiff : ∃ c d : Fin 3 × Fin 3, smParallelFoliation k c ≠ smParallelFoliation k d := by
      match k with
      | ⟨0, h⟩ =>
        have hk : (⟨0, h⟩ : Fin 4) = ⟨0, by decide⟩ := rfl
        rw [hk]; exact ⟨(⟨0, by decide⟩, ⟨0, by decide⟩), (⟨1, by decide⟩, ⟨0, by decide⟩), by decide⟩
      | ⟨1, h⟩ =>
        have hk : (⟨1, h⟩ : Fin 4) = ⟨1, by decide⟩ := rfl
        rw [hk]; exact ⟨(⟨0, by decide⟩, ⟨0, by decide⟩), (⟨0, by decide⟩, ⟨1, by decide⟩), by decide⟩
      | ⟨2, h⟩ =>
        have hk : (⟨2, h⟩ : Fin 4) = ⟨2, by decide⟩ := rfl
        rw [hk]; exact ⟨(⟨0, by decide⟩, ⟨0, by decide⟩), (⟨1, by decide⟩, ⟨0, by decide⟩), by decide⟩
      | ⟨3, h⟩ =>
        have hk : (⟨3, h⟩ : Fin 4) = ⟨3, by decide⟩ := rfl
        rw [hk]; exact ⟨(⟨0, by decide⟩, ⟨0, by decide⟩), (⟨1, by decide⟩, ⟨0, by decide⟩), by decide⟩
    exact hNoPart (smParallelFoliation k) hSame hDiff
  exact ⟨⟨by decide, by decide, rfl, sm_asl23_faithful, sm_asl23_mul_act⟩,
    sm_asl23_two_transitive,
    ⟨by decide, by decide⟩,
    ⟨hNoPart, hNoParFol⟩,
    ⟨rfl, sm_oh_mul_mat3, by decide, by decide, by decide, by decide⟩⟩


/-! ## Section 5: 3-Qubit T-Junction Fermion Exchange & `3 × 3 × 3` `{4,3,4}` CKR 3D Bosonization -/

/-- Exact 3-qubit Pauli operator `i^p X_0^{x0} X_1^{x1} X_2^{x2} Z_0^{z0} Z_1^{z1} Z_2^{z2}`. -/
structure SMPauli3 where
  x0 : Bool
  x1 : Bool
  x2 : Bool
  z0 : Bool
  z1 : Bool
  z2 : Bool
  p : Fin 4
  deriving DecidableEq, Repr

def smPauli3Mul (A B : SMPauli3) : SMPauli3 :=
  let dot := smXor (smXor (A.z0 && B.x0) (A.z1 && B.x1)) (A.z2 && B.x2)
  let pDot : Fin 4 := if dot then ⟨2, by decide⟩ else ⟨0, by decide⟩
  ⟨ smXor A.x0 B.x0, smXor A.x1 B.x1, smXor A.x2 B.x2,
    smXor A.z0 B.z0, smXor A.z1 B.z1, smXor A.z2 B.z2,
    smFin4Add (smFin4Add A.p B.p) pDot ⟩

def smPauli3Id : SMPauli3 := ⟨false, false, false, false, false, false, ⟨0, by decide⟩⟩
def smPauli3NegId : SMPauli3 := ⟨false, false, false, false, false, false, ⟨2, by decide⟩⟩

/-- Fermionic T-junction hopping strings `S_1 = X_0 Z_1`, `S_2 = X_1 Z_2`, `S_3 = X_2 Z_0`. -/
def smTJunS1 : SMPauli3 := ⟨true,  false, false, false, true,  false, ⟨0, by decide⟩⟩
def smTJunS2 : SMPauli3 := ⟨false, true,  false, false, false, true,  ⟨0, by decide⟩⟩
def smTJunS3 : SMPauli3 := ⟨false, false, true,  true,  false, false, ⟨0, by decide⟩⟩

/-- Bosonic T-junction control `B_1 = X_0`, `B_2 = X_1`, `B_3 = X_2`. -/
def smTJunB1 : SMPauli3 := ⟨true,  false, false, false, false, false, ⟨0, by decide⟩⟩
def smTJunB2 : SMPauli3 := ⟨false, true,  false, false, false, false, ⟨0, by decide⟩⟩
def smTJunB3 : SMPauli3 := ⟨false, false, true,  false, false, false, ⟨0, by decide⟩⟩

def smLevinWen (O1 O2 O3 : SMPauli3) : SMPauli3 :=
  smPauli3Mul O3 (smPauli3Mul O2 (smPauli3Mul O1 (smPauli3Mul O3 (smPauli3Mul O2 O1))))

/-- Exact Gaussian integers `ℤ[i]` for the 8-dim T-junction Fock space. -/
structure SMGaussInt where
  re : Int
  im : Int
  deriving DecidableEq, Repr

def SMGaussInt.zero : SMGaussInt := ⟨0, 0⟩
def SMGaussInt.one : SMGaussInt := ⟨1, 0⟩
def SMGaussInt.neg (z : SMGaussInt) : SMGaussInt := ⟨-z.re, -z.im⟩
def SMGaussInt.add (a b : SMGaussInt) : SMGaussInt := ⟨a.re + b.re, a.im + b.im⟩
def SMGaussInt.mulI (z : SMGaussInt) : SMGaussInt := ⟨-z.im, z.re⟩
def SMGaussInt.mulNegI (z : SMGaussInt) : SMGaussInt := ⟨z.im, -z.re⟩

abbrev SMVec8 := Fin 8 → SMGaussInt

def smBasis8 (k : Fin 8) : SMVec8 :=
  fun i => if i = k then SMGaussInt.one else SMGaussInt.zero

def smVec8Zero : SMVec8 := fun _ => SMGaussInt.zero
def smVec8Neg (v : SMVec8) : SMVec8 := fun i => SMGaussInt.neg (v i)

def smBit3 (c : Fin 8) (q : Fin 3) : Bool :=
  match q with
  | ⟨0, _⟩ => c.val % 2 = 1
  | ⟨1, _⟩ => (c.val / 2) % 2 = 1
  | ⟨2, _⟩ => (c.val / 4) % 2 = 1

def smPack3 (b0 b1 b2 : Bool) : Fin 8 :=
  ⟨(if b0 then 1 else 0) + 2 * (if b1 then 1 else 0) + 4 * (if b2 then 1 else 0),
    by cases b0 <;> cases b1 <;> cases b2 <;> decide⟩

/-- Eigenvalue parity of `P_0 P_k` (`true` iff `P_0 P_k = -1`, so exactly one of `{v_0, v_k}` is occupied). -/
def smBondActive (k : Fin 3) (c : Fin 8) : Bool :=
  match k with
  | ⟨0, _⟩ => smXor (smBit3 c ⟨1, by decide⟩) (smBit3 c ⟨2, by decide⟩)
  | ⟨1, _⟩ => smXor (smBit3 c ⟨0, by decide⟩) (smBit3 c ⟨2, by decide⟩)
  | ⟨2, _⟩ => smXor (smBit3 c ⟨0, by decide⟩) (smBit3 c ⟨1, by decide⟩)

def smPauli3ImageIdx (op : SMPauli3) (c : Fin 8) : Fin 8 :=
  smPack3 (smXor (smBit3 c ⟨0, by decide⟩) op.x0)
          (smXor (smBit3 c ⟨1, by decide⟩) op.x1)
          (smXor (smBit3 c ⟨2, by decide⟩) op.x2)

def smPauli3SignNeg (op : SMPauli3) (c : Fin 8) : Bool :=
  smXor (smXor (op.z0 && smBit3 c ⟨0, by decide⟩) (op.z1 && smBit3 c ⟨1, by decide⟩))
        (op.z2 && smBit3 c ⟨2, by decide⟩)

/-- Exact hopping operator `H_hop,k = (1/2) O_k (I - P_0 P_k)` acting on `SMVec8`. -/
def smHopOp8 (op : SMPauli3) (k : Fin 3) (v : SMVec8) : SMVec8 :=
  fun r =>
    let src := smPauli3ImageIdx op r
    if smBondActive k src then
      if smPauli3SignNeg op src then SMGaussInt.neg (v src) else v src
    else SMGaussInt.zero

/-- Exact unitary `π/2` swap gate `T_k = exp(∓ i (π/2) H_hop,k)` (`dag = false` gives `-i`, `dag = true` gives `+i`). -/
def smSwapGate8 (op : SMPauli3) (k : Fin 3) (dag : Bool) (v : SMVec8) : SMVec8 :=
  fun r =>
    let stay := if smBondActive k r then SMGaussInt.zero else v r
    let hVal := smHopOp8 op k v r
    let rot := if dag then SMGaussInt.mulI hVal else SMGaussInt.mulNegI hVal
    SMGaussInt.add stay rot

/-- Exact 6-step dynamical-phase-cancelled physical 2-particle exchange `E_ex = T_2^† T_3 T_1^† T_2 T_3^† T_1`. -/
def smExchange6 (O1 O2 O3 : SMPauli3) (v : SMVec8) : SMVec8 :=
  smSwapGate8 O2 ⟨1, by decide⟩ true
    (smSwapGate8 O3 ⟨2, by decide⟩ false
      (smSwapGate8 O1 ⟨0, by decide⟩ true
        (smSwapGate8 O2 ⟨1, by decide⟩ false
          (smSwapGate8 O3 ⟨2, by decide⟩ true
            (smSwapGate8 O1 ⟨0, by decide⟩ false v)))))

/-- `3 × 3 × 3` periodic 3D `{4,3,4}` torus vertex (`V = 27`), edge (`E = 81`), and plaquette (`81`). -/
structure SMVert3 where
  x : Fin 3
  y : Fin 3
  z : Fin 3
  deriving DecidableEq, Repr

structure SMEdge3 where
  v : SMVert3
  d : Fin 3
  deriving DecidableEq, Repr

structure SMPlaq3 where
  v : SMVert3
  t : Fin 3
  deriving DecidableEq, Repr

def smVert3Zero : SMVert3 := ⟨⟨0, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩⟩
def smVert3Add (u v : SMVert3) : SMVert3 := ⟨smFin3Add u.x v.x, smFin3Add u.y v.y, smFin3Add u.z v.z⟩
def smVert3Sub (u v : SMVert3) : SMVert3 := ⟨smFin3Sub u.x v.x, smFin3Sub u.y v.y, smFin3Sub u.z v.z⟩

def smVert3Step (v : SMVert3) (d : Fin 3) : SMVert3 :=
  match d with
  | ⟨0, _⟩ => ⟨smFin3Add v.x ⟨1, by decide⟩, v.y, v.z⟩
  | ⟨1, _⟩ => ⟨v.x, smFin3Add v.y ⟨1, by decide⟩, v.z⟩
  | ⟨2, _⟩ => ⟨v.x, v.y, smFin3Add v.z ⟨1, by decide⟩⟩

def smEdge3Dst (e : SMEdge3) : SMVert3 := smVert3Step e.v e.d

/-- Exact 81-qubit Pauli operator on the `3 × 3 × 3` `{4,3,4}` torus (`i^p X^x Z^z`). -/
structure SMPauli81 where
  x : SMEdge3 → Bool
  z : SMEdge3 → Bool
  p : Fin 4

def smXorFin3 (f : Fin 3 → Bool) : Bool :=
  smXor (smXor (f ⟨0, by decide⟩) (f ⟨1, by decide⟩)) (f ⟨2, by decide⟩)

def smXorVert3 (f : SMVert3 → Bool) : Bool :=
  smXorFin3 (fun x => smXorFin3 (fun y => smXorFin3 (fun z => f ⟨x, y, z⟩)))

def smXorEdge3 (f : SMEdge3 → Bool) : Bool :=
  smXorVert3 (fun v => smXorFin3 (fun d => f ⟨v, d⟩))

def smPauli81Id : SMPauli81 :=
  ⟨fun _ => false, fun _ => false, ⟨0, by decide⟩⟩

def smPauli81Neg (A : SMPauli81) : SMPauli81 :=
  ⟨A.x, A.z, smFin4Add A.p ⟨2, by decide⟩⟩

def smPauli81Mul (A B : SMPauli81) : SMPauli81 :=
  let dot := smXorEdge3 (fun e => A.z e && B.x e)
  let pDot : Fin 4 := if dot then ⟨2, by decide⟩ else ⟨0, by decide⟩
  ⟨fun e => smXor (A.x e) (B.x e), fun e => smXor (A.z e) (B.z e), smFin4Add (smFin4Add A.p B.p) pDot⟩

/-- Exact 81-edge symplectic pairing (`true` iff `A` and `B` anticommute, `false` iff they commute). -/
def smPauli81Symp (A B : SMPauli81) : Bool :=
  smXor (smXorEdge3 (fun e => A.x e && B.z e)) (smXorEdge3 (fun e => A.z e && B.x e))

def smPauli81Shift (Δ : SMVert3) (A : SMPauli81) : SMPauli81 :=
  ⟨fun e => A.x ⟨smVert3Sub e.v Δ, e.d⟩, fun e => A.z ⟨smVert3Sub e.v Δ, e.d⟩, A.p⟩

def smEdgeSingle (e0 e : SMEdge3) : Bool := if e = e0 then true else false

/-- The two `Z`-flux-attachment edges of the weight-3 Chen–Kapustin–Radicevic hopping string `S_e`. -/
def smCkrZ1 (e : SMEdge3) : SMEdge3 :=
  match e.d with
  | ⟨0, _⟩ => ⟨e.v, ⟨1, by decide⟩⟩
  | ⟨1, _⟩ => ⟨e.v, ⟨2, by decide⟩⟩
  | ⟨2, _⟩ => ⟨e.v, ⟨0, by decide⟩⟩

def smCkrZ2 (e : SMEdge3) : SMEdge3 :=
  match e.d with
  | ⟨0, _⟩ => ⟨⟨smFin3Add e.v.x ⟨1, by decide⟩, smFin3Add e.v.y ⟨2, by decide⟩, e.v.z⟩, ⟨1, by decide⟩⟩
  | ⟨1, _⟩ => ⟨⟨e.v.x, smFin3Add e.v.y ⟨1, by decide⟩, smFin3Add e.v.z ⟨2, by decide⟩⟩, ⟨2, by decide⟩⟩
  | ⟨2, _⟩ => ⟨⟨smFin3Add e.v.x ⟨2, by decide⟩, e.v.y, smFin3Add e.v.z ⟨1, by decide⟩⟩, ⟨0, by decide⟩⟩

/-- Exact weight-3 3D Chen–Kapustin–Radicevic hopping operator `S_e` on the `3 × 3 × 3` `{4,3,4}` torus. -/
def smCkrS (e : SMEdge3) : SMPauli81 :=
  ⟨smEdgeSingle e, fun e' => smXor (smEdgeSingle (smCkrZ1 e) e') (smEdgeSingle (smCkrZ2 e) e'), ⟨0, by decide⟩⟩

/-- Exact weight-6 vertex fermion-parity operator `P_v = ∏_{e ∋ v} Z_e`. -/
def smCkrP (v : SMVert3) : SMPauli81 :=
  let e0 : SMEdge3 := ⟨v, ⟨0, by decide⟩⟩
  let e1 : SMEdge3 := ⟨⟨smFin3Add v.x ⟨2, by decide⟩, v.y, v.z⟩, ⟨0, by decide⟩⟩
  let e2 : SMEdge3 := ⟨v, ⟨1, by decide⟩⟩
  let e3 : SMEdge3 := ⟨⟨v.x, smFin3Add v.y ⟨2, by decide⟩, v.z⟩, ⟨1, by decide⟩⟩
  let e4 : SMEdge3 := ⟨v, ⟨2, by decide⟩⟩
  let e5 : SMEdge3 := ⟨⟨v.x, v.y, smFin3Add v.z ⟨2, by decide⟩⟩, ⟨2, by decide⟩⟩
  ⟨fun _ => false,
   fun e' =>
     smXor (smXor (smXor (smXor (smXor (smEdgeSingle e0 e') (smEdgeSingle e1 e'))
       (smEdgeSingle e2 e')) (smEdgeSingle e3 e')) (smEdgeSingle e4 e')) (smEdgeSingle e5 e'),
   ⟨0, by decide⟩⟩

/-- Exact plaquette stabilizer `G_p = - S_1 S_2 S_3 S_4 P_B P_D` on the `3 × 3 × 3` `{4,3,4}` torus. -/
def smCkrG (p : SMPlaq3) : SMPauli81 :=
  let v := p.v
  let ex : SMVert3 := ⟨⟨1, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩⟩
  let ey : SMVert3 := ⟨⟨0, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩⟩
  let ez : SMVert3 := ⟨⟨0, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩⟩
  let mul6 (a b c d e f : SMPauli81) : SMPauli81 :=
    smPauli81Neg (smPauli81Mul (smPauli81Mul (smPauli81Mul (smPauli81Mul (smPauli81Mul a b) c) d) e) f)
  match p.t with
  | ⟨0, _⟩ =>
    mul6 (smCkrS ⟨v, ⟨0, by decide⟩⟩)
         (smCkrS ⟨smVert3Add v ex, ⟨1, by decide⟩⟩)
         (smCkrS ⟨smVert3Add v ey, ⟨0, by decide⟩⟩)
         (smCkrS ⟨v, ⟨1, by decide⟩⟩)
         (smCkrP (smVert3Add v ex))
         (smCkrP (smVert3Add v ey))
  | ⟨1, _⟩ =>
    mul6 (smCkrS ⟨v, ⟨1, by decide⟩⟩)
         (smCkrS ⟨smVert3Add v ey, ⟨2, by decide⟩⟩)
         (smCkrS ⟨smVert3Add v ez, ⟨1, by decide⟩⟩)
         (smCkrS ⟨v, ⟨2, by decide⟩⟩)
         (smCkrP (smVert3Add v ey))
         (smCkrP (smVert3Add v ez))
  | ⟨2, _⟩ =>
    mul6 (smCkrS ⟨v, ⟨2, by decide⟩⟩)
         (smCkrS ⟨smVert3Add v ez, ⟨0, by decide⟩⟩)
         (smCkrS ⟨smVert3Add v ex, ⟨2, by decide⟩⟩)
         (smCkrS ⟨v, ⟨0, by decide⟩⟩)
         (smCkrP (smVert3Add v ez))
         (smCkrP (smVert3Add v ex))

/-- Exact 3D cube Bianchi product `∏_{p ∈ ∂c} G_p` around cube `c`. -/
def smCkrCubeBianchi (c : SMVert3) : SMPauli81 :=
  let ex : SMVert3 := ⟨⟨1, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩⟩
  let ey : SMVert3 := ⟨⟨0, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩⟩
  let ez : SMVert3 := ⟨⟨0, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩⟩
  let g0 := smCkrG ⟨c, ⟨0, by decide⟩⟩
  let g1 := smCkrG ⟨smVert3Add c ez, ⟨0, by decide⟩⟩
  let g2 := smCkrG ⟨c, ⟨1, by decide⟩⟩
  let g3 := smCkrG ⟨smVert3Add c ex, ⟨1, by decide⟩⟩
  let g4 := smCkrG ⟨c, ⟨2, by decide⟩⟩
  let g5 := smCkrG ⟨smVert3Add c ey, ⟨2, by decide⟩⟩
  smPauli81Mul (smPauli81Mul (smPauli81Mul (smPauli81Mul (smPauli81Mul g0 g1) g2) g3) g4) g5

/-- Exact Majorana bilinear incidence predicate: `S_{e1} = i γ_{src1} γ'_{dst1}` and `S_{e2} = i γ_{src2} γ'_{dst2}`
    anticommute iff they share exactly one same-type endpoint (`(src1 = src2) ⊕ (dst1 = dst2)`). -/
def smMajoranaInc (e1 e2 : SMEdge3) : Bool :=
  smXor (if e1.v = e2.v then true else false) (if smEdge3Dst e1 = smEdge3Dst e2 then true else false)

/-- Exact edge-vertex incidence predicate: `{S_e, P_v} = 0` iff `v = src(e)` or `v = dst(e)`. -/
def smEdgeVertInc (e : SMEdge3) (v : SMVert3) : Bool :=
  if v = e.v ∨ v = smEdge3Dst e then true else false

private def smMkE (x y z d : Nat) (hx : x < 3 := by decide) (hy : y < 3 := by decide)
    (hz : z < 3 := by decide) (hd : d < 3 := by decide) : SMEdge3 :=
  ⟨⟨⟨x, hx⟩, ⟨y, hy⟩, ⟨z, hz⟩⟩, ⟨d, hd⟩⟩

private def smMask4 (a0 a1 a2 a3 e : SMEdge3) : Bool :=
  smXor (smXor (smXor (smEdgeSingle a0 e) (smEdgeSingle a1 e)) (smEdgeSingle a2 e)) (smEdgeSingle a3 e)

private def smMask8 (b0 b1 b2 b3 b4 b5 b6 b7 e : SMEdge3) : Bool :=
  smXor (smMask4 b0 b1 b2 b3 e) (smMask4 b4 b5 b6 b7 e)

/-- Exact sparse form of `G((0,0,0), t)` (proved identical to `smCkrG ⟨smVert3Zero, t⟩` below). -/
private def smCkrG0Sparse : Fin 3 → SMPauli81
  | ⟨0, _⟩ =>
    ⟨ smMask4 (smMkE 0 0 0 0) (smMkE 0 0 0 1) (smMkE 1 0 0 1) (smMkE 0 1 0 0),
      smMask8 (smMkE 0 0 0 0) (smMkE 0 0 0 2) (smMkE 1 0 0 0) (smMkE 0 1 0 0)
              (smMkE 0 1 0 2) (smMkE 2 1 0 0) (smMkE 1 0 2 2) (smMkE 1 1 2 2),
      ⟨0, by decide⟩ ⟩
  | ⟨1, _⟩ =>
    ⟨ smMask4 (smMkE 0 0 0 1) (smMkE 0 0 0 2) (smMkE 0 1 0 2) (smMkE 0 0 1 1),
      smMask8 (smMkE 0 0 0 0) (smMkE 0 0 0 1) (smMkE 0 1 0 1) (smMkE 2 1 0 0)
              (smMkE 0 0 1 0) (smMkE 0 0 1 1) (smMkE 2 1 1 0) (smMkE 0 2 1 1),
      ⟨0, by decide⟩ ⟩
  | ⟨2, _⟩ =>
    ⟨ smMask4 (smMkE 0 0 0 0) (smMkE 0 0 0 2) (smMkE 1 0 0 2) (smMkE 0 0 1 0),
      smMask8 (smMkE 0 0 0 1) (smMkE 0 0 0 2) (smMkE 1 0 0 1) (smMkE 1 0 0 2)
              (smMkE 0 0 1 2) (smMkE 0 2 1 1) (smMkE 1 2 1 1) (smMkE 1 0 2 2),
      ⟨0, by decide⟩ ⟩

private theorem sm_pauli81_ext (A B : SMPauli81)
    (hx : ∀ e : SMEdge3, A.x e = B.x e) (hz : ∀ e : SMEdge3, A.z e = B.z e) (hp : A.p = B.p) :
    A = B := by
  cases A; cases B
  simp only [SMPauli81.mk.injEq]
  exact ⟨funext hx, funext hz, hp⟩

private theorem sm_fin3Sub_eval :
    (smFin3Sub ⟨0, by decide⟩ ⟨0, by decide⟩ = ⟨0, by decide⟩ ∧
     smFin3Sub ⟨1, by decide⟩ ⟨0, by decide⟩ = ⟨1, by decide⟩ ∧
     smFin3Sub ⟨2, by decide⟩ ⟨0, by decide⟩ = ⟨2, by decide⟩) ∧
    (smFin3Sub ⟨0, by decide⟩ ⟨1, by decide⟩ = ⟨2, by decide⟩ ∧
     smFin3Sub ⟨1, by decide⟩ ⟨1, by decide⟩ = ⟨0, by decide⟩ ∧
     smFin3Sub ⟨2, by decide⟩ ⟨1, by decide⟩ = ⟨1, by decide⟩) ∧
    (smFin3Sub ⟨0, by decide⟩ ⟨2, by decide⟩ = ⟨1, by decide⟩ ∧
     smFin3Sub ⟨1, by decide⟩ ⟨2, by decide⟩ = ⟨2, by decide⟩ ∧
     smFin3Sub ⟨2, by decide⟩ ⟨2, by decide⟩ = ⟨0, by decide⟩) := by decide

private theorem sm_xorFin3_sub (b : Fin 3) (f : Fin 3 → Bool) :
    smXorFin3 (fun a => f (smFin3Sub a b)) = smXorFin3 f := by
  unfold smXorFin3
  dsimp only
  match b with
  | ⟨0, h⟩ =>
    have hb : (⟨0, h⟩ : Fin 3) = ⟨0, by decide⟩ := rfl
    rw [hb, sm_fin3Sub_eval.1.1, sm_fin3Sub_eval.1.2.1, sm_fin3Sub_eval.1.2.2]
  | ⟨1, h⟩ =>
    have hb : (⟨1, h⟩ : Fin 3) = ⟨1, by decide⟩ := rfl
    rw [hb, sm_fin3Sub_eval.2.1.1, sm_fin3Sub_eval.2.1.2.1, sm_fin3Sub_eval.2.1.2.2]
    cases f ⟨0, by decide⟩ <;> cases f ⟨1, by decide⟩ <;> cases f ⟨2, by decide⟩ <;> rfl
  | ⟨2, h⟩ =>
    have hb : (⟨2, h⟩ : Fin 3) = ⟨2, by decide⟩ := rfl
    rw [hb, sm_fin3Sub_eval.2.2.1, sm_fin3Sub_eval.2.2.2.1, sm_fin3Sub_eval.2.2.2.2]
    cases f ⟨0, by decide⟩ <;> cases f ⟨1, by decide⟩ <;> cases f ⟨2, by decide⟩ <;> rfl

private theorem sm_xorEdge3_shift (Δ : SMVert3) (f : SMEdge3 → Bool) :
    smXorEdge3 (fun e => f ⟨smVert3Sub e.v Δ, e.d⟩) = smXorEdge3 f := by
  unfold smXorEdge3 smXorVert3 smVert3Sub
  dsimp only
  calc smXorFin3 (fun x => smXorFin3 (fun y => smXorFin3 (fun z => smXorFin3 (fun d =>
          f ⟨⟨smFin3Sub x Δ.x, smFin3Sub y Δ.y, smFin3Sub z Δ.z⟩, d⟩))))
    _ = smXorFin3 (fun x => smXorFin3 (fun y => smXorFin3 (fun z => smXorFin3 (fun d =>
          f ⟨⟨x, smFin3Sub y Δ.y, smFin3Sub z Δ.z⟩, d⟩)))) :=
        sm_xorFin3_sub Δ.x (fun x => smXorFin3 (fun y => smXorFin3 (fun z => smXorFin3 (fun d =>
          f ⟨⟨x, smFin3Sub y Δ.y, smFin3Sub z Δ.z⟩, d⟩))))
    _ = smXorFin3 (fun x => smXorFin3 (fun y => smXorFin3 (fun z => smXorFin3 (fun d =>
          f ⟨⟨x, y, smFin3Sub z Δ.z⟩, d⟩)))) := by
        apply congrArg smXorFin3; funext x
        exact sm_xorFin3_sub Δ.y (fun y => smXorFin3 (fun z => smXorFin3 (fun d =>
          f ⟨⟨x, y, smFin3Sub z Δ.z⟩, d⟩)))
    _ = smXorFin3 (fun x => smXorFin3 (fun y => smXorFin3 (fun z => smXorFin3 (fun d =>
          f ⟨⟨x, y, z⟩, d⟩)))) := by
        apply congrArg smXorFin3; funext x
        apply congrArg smXorFin3; funext y
        exact sm_xorFin3_sub Δ.z (fun z => smXorFin3 (fun d => f ⟨⟨x, y, z⟩, d⟩))

private theorem sm_xorFin3_xor (f g : Fin 3 → Bool) :
    smXorFin3 (fun i => smXor (f i) (g i)) = smXor (smXorFin3 f) (smXorFin3 g) := by
  unfold smXorFin3
  dsimp only
  rw [smXor_swap4 (f ⟨0, by decide⟩) (g ⟨0, by decide⟩) (f ⟨1, by decide⟩) (g ⟨1, by decide⟩), smXor_swap4]

private theorem sm_xorEdge3_xor (f g : SMEdge3 → Bool) :
    smXorEdge3 (fun e => smXor (f e) (g e)) = smXor (smXorEdge3 f) (smXorEdge3 g) := by
  unfold smXorEdge3 smXorVert3
  simp only [sm_xorFin3_xor]

private theorem sm_xorFin3_const_and (c : Bool) (f : Fin 3 → Bool) :
    smXorFin3 (fun i => c && f i) = (c && smXorFin3 f) := by
  cases c
  · rfl
  · rfl

private theorem sm_xorFin3_single (i0 : Fin 3) (f : Fin 3 → Bool) :
    smXorFin3 (fun i => (if i = i0 then true else false) && f i) = f i0 := by
  match i0 with
  | ⟨0, _⟩ =>
    change smXor (smXor (true && f ⟨0, by decide⟩) (false && f ⟨1, by decide⟩)) (false && f ⟨2, by decide⟩) = f ⟨0, by decide⟩
    cases f ⟨0, by decide⟩ <;> rfl
  | ⟨1, _⟩ =>
    change smXor (smXor (false && f ⟨0, by decide⟩) (true && f ⟨1, by decide⟩)) (false && f ⟨2, by decide⟩) = f ⟨1, by decide⟩
    cases f ⟨1, by decide⟩ <;> rfl
  | ⟨2, _⟩ =>
    change smXor (smXor (false && f ⟨0, by decide⟩) (false && f ⟨1, by decide⟩)) (true && f ⟨2, by decide⟩) = f ⟨2, by decide⟩
    cases f ⟨2, by decide⟩ <;> rfl

private theorem sm_edgeSingle_split (x y z d x0 y0 z0 d0 : Fin 3) :
    smEdgeSingle ⟨⟨x0, y0, z0⟩, d0⟩ ⟨⟨x, y, z⟩, d⟩ =
      ((if x = x0 then true else false) &&
       ((if y = y0 then true else false) &&
        ((if z = z0 then true else false) &&
         (if d = d0 then true else false)))) := by
  unfold smEdgeSingle
  if hx : x = x0 then
    subst hx
    if hy : y = y0 then
      subst hy
      if hz : z = z0 then
        subst hz
        if hd : d = d0 then
          subst hd
          rw [ite_eq_left rfl, ite_eq_left rfl, ite_eq_left rfl, ite_eq_left rfl, ite_eq_left rfl]; rfl
        else
          rw [ite_eq_right (fun h => hd (congrArg SMEdge3.d h)),
              ite_eq_left rfl, ite_eq_left rfl, ite_eq_left rfl, ite_eq_right hd]; rfl
      else
        rw [ite_eq_right (fun h => hz (congrArg (fun e => e.v.z) h)),
            ite_eq_left rfl, ite_eq_left rfl, ite_eq_right hz]; rfl
    else
      rw [ite_eq_right (fun h => hy (congrArg (fun e => e.v.y) h)),
          ite_eq_left rfl, ite_eq_right hy]; rfl
  else
    rw [ite_eq_right (fun h => hx (congrArg (fun e => e.v.x) h)), ite_eq_right hx]; rfl

private theorem sm_xorEdge3_single_left (e0 : SMEdge3) (f : SMEdge3 → Bool) :
    smXorEdge3 (fun e => smEdgeSingle e0 e && f e) = f e0 := by
  cases e0 with | mk v0 d0 =>
  cases v0 with | mk x0 y0 z0 =>
  unfold smXorEdge3 smXorVert3
  have hSplit : ∀ x y z d : Fin 3,
      (smEdgeSingle ⟨⟨x0, y0, z0⟩, d0⟩ ⟨⟨x, y, z⟩, d⟩ && f ⟨⟨x, y, z⟩, d⟩) =
        ((if x = x0 then true else false) &&
         ((if y = y0 then true else false) &&
          ((if z = z0 then true else false) &&
           ((if d = d0 then true else false) && f ⟨⟨x, y, z⟩, d⟩)))) := by
    intro x y z d
    rw [sm_edgeSingle_split]
    cases (if x = x0 then true else false) <;>
    cases (if y = y0 then true else false) <;>
    cases (if z = z0 then true else false) <;>
    cases (if d = d0 then true else false) <;>
    cases f ⟨⟨x, y, z⟩, d⟩ <;> rfl
  simp only [hSplit, sm_xorFin3_const_and, sm_xorFin3_single]

private theorem sm_xorEdge3_single_right (e0 : SMEdge3) (f : SMEdge3 → Bool) :
    smXorEdge3 (fun e => f e && smEdgeSingle e0 e) = f e0 := by
  have hComm : (fun e => f e && smEdgeSingle e0 e) = (fun e => smEdgeSingle e0 e && f e) := by
    funext e; cases f e <;> cases smEdgeSingle e0 e <;> rfl
  rw [hComm, sm_xorEdge3_single_left]

private theorem sm_xorEdge3_mask4_left (a0 a1 a2 a3 : SMEdge3) (f : SMEdge3 → Bool) :
    smXorEdge3 (fun e => smMask4 a0 a1 a2 a3 e && f e) =
      smXor (smXor (smXor (f a0) (f a1)) (f a2)) (f a3) := by
  unfold smMask4
  simp only [smXor_and_right, sm_xorEdge3_xor, sm_xorEdge3_single_left]

private theorem sm_xorEdge3_mask8_left (b0 b1 b2 b3 b4 b5 b6 b7 : SMEdge3) (f : SMEdge3 → Bool) :
    smXorEdge3 (fun e => smMask8 b0 b1 b2 b3 b4 b5 b6 b7 e && f e) =
      smXor (smXor (smXor (smXor (f b0) (f b1)) (f b2)) (f b3))
            (smXor (smXor (smXor (f b4) (f b5)) (f b6)) (f b7)) := by
  unfold smMask8
  simp only [smXor_and_right, sm_xorEdge3_xor, sm_xorEdge3_mask4_left]

private theorem sm_xorEdge3_false : smXorEdge3 (fun _ => false) = false := rfl

private theorem sm_pauli81Symp_shift (Δ : SMVert3) (A B : SMPauli81) :
    smPauli81Symp (smPauli81Shift Δ A) (smPauli81Shift Δ B) = smPauli81Symp A B := by
  unfold smPauli81Symp smPauli81Shift
  rw [sm_xorEdge3_shift Δ (fun e => A.x e && B.z e),
      sm_xorEdge3_shift Δ (fun e => A.z e && B.x e)]

private theorem sm_pauli81Mul_shift (Δ : SMVert3) (A B : SMPauli81) :
    smPauli81Mul (smPauli81Shift Δ A) (smPauli81Shift Δ B) = smPauli81Shift Δ (smPauli81Mul A B) := by
  apply sm_pauli81_ext
  · intro _; rfl
  · intro _; rfl
  · unfold smPauli81Mul smPauli81Shift
    simp only
    rw [sm_xorEdge3_shift Δ (fun e => A.z e && B.x e)]

private theorem sm_fin3_sub_eq_add_iff :
    ∀ a b c : Fin 3, smFin3Sub a b = c ↔ a = smFin3Add c b := by decide

private theorem sm_vert3_sub_eq_add_iff (u Δ w : SMVert3) :
    smVert3Sub u Δ = w ↔ u = smVert3Add w Δ := by
  cases u; cases Δ; cases w
  simp only [smVert3Sub, smVert3Add, SMVert3.mk.injEq, sm_fin3_sub_eq_add_iff]

private theorem sm_vert3Add_comm (u v : SMVert3) : smVert3Add u v = smVert3Add v u := by
  cases u; cases v
  simp only [smVert3Add, SMVert3.mk.injEq]
  exact ⟨sm_fin3_add_comm _ _, sm_fin3_add_comm _ _, sm_fin3_add_comm _ _⟩

private theorem sm_vert3Add_assoc (u v w : SMVert3) :
    smVert3Add (smVert3Add u v) w = smVert3Add u (smVert3Add v w) := by
  cases u; cases v; cases w
  simp only [smVert3Add, SMVert3.mk.injEq]
  exact ⟨sm_fin3_add_assoc _ _ _, sm_fin3_add_assoc _ _ _, sm_fin3_add_assoc _ _ _⟩

private theorem sm_vert3Zero_add (u : SMVert3) : smVert3Add smVert3Zero u = u := by
  cases u
  have h0 : ∀ a : Fin 3, smFin3Add ⟨0, by decide⟩ a = a := by decide
  simp only [smVert3Add, smVert3Zero, h0]

private theorem sm_vert3Add_sub_cancel (u v : SMVert3) :
    smVert3Add (smVert3Sub u v) v = u := by
  cases u; cases v
  have hC : ∀ a b : Fin 3, smFin3Add (smFin3Sub a b) b = a := by decide
  simp only [smVert3Add, smVert3Sub, hC]

private theorem sm_edgeSingle_shift (Δ v0 : SMVert3) (d0 : Fin 3) (e : SMEdge3) :
    smEdgeSingle ⟨smVert3Add v0 Δ, d0⟩ e = smEdgeSingle ⟨v0, d0⟩ ⟨smVert3Sub e.v Δ, e.d⟩ := by
  cases e with | mk v d =>
  unfold smEdgeSingle
  if h : (⟨v, d⟩ : SMEdge3) = ⟨smVert3Add v0 Δ, d0⟩ then
    have hv : v = smVert3Add v0 Δ := congrArg SMEdge3.v h
    have hd : d = d0 := congrArg SMEdge3.d h
    have hSub : smVert3Sub v Δ = v0 := (sm_vert3_sub_eq_add_iff v Δ v0).mpr hv
    rw [ite_eq_left h, ite_eq_left (by rw [hSub, hd])]
  else
    have hNe : (⟨smVert3Sub v Δ, d⟩ : SMEdge3) ≠ ⟨v0, d0⟩ := by
      intro hEq
      have hv : smVert3Sub v Δ = v0 := congrArg SMEdge3.v hEq
      have hd : d = d0 := congrArg SMEdge3.d hEq
      exact h (by rw [(sm_vert3_sub_eq_add_iff v Δ v0).mp hv, hd])
    rw [ite_eq_right h, ite_eq_right hNe]

private theorem sm_ckrZ1_shift (Δ v : SMVert3) (d : Fin 3) :
    smCkrZ1 ⟨smVert3Add v Δ, d⟩ = ⟨smVert3Add (smCkrZ1 ⟨v, d⟩).v Δ, (smCkrZ1 ⟨v, d⟩).d⟩ := by
  match d with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ => rfl

private theorem sm_ckrZ2_shift (Δ v : SMVert3) (d : Fin 3) :
    smCkrZ2 ⟨smVert3Add v Δ, d⟩ = ⟨smVert3Add (smCkrZ2 ⟨v, d⟩).v Δ, (smCkrZ2 ⟨v, d⟩).d⟩ := by
  cases v with | mk vx vy vz =>
  have hSwap : ∀ a b c : Fin 3, smFin3Add (smFin3Add a b) c = smFin3Add (smFin3Add a c) b := by decide
  match d with
  | ⟨0, _⟩ => simp only [smCkrZ2, smVert3Add, hSwap]
  | ⟨1, _⟩ => simp only [smCkrZ2, smVert3Add, hSwap]
  | ⟨2, _⟩ => simp only [smCkrZ2, smVert3Add, hSwap]

private theorem sm_ckrS_shift (Δ v : SMVert3) (d : Fin 3) :
    smCkrS ⟨smVert3Add v Δ, d⟩ = smPauli81Shift Δ (smCkrS ⟨v, d⟩) := by
  apply sm_pauli81_ext
  · intro e'; exact sm_edgeSingle_shift Δ v d e'
  · intro e'
    unfold smCkrS smPauli81Shift
    simp only
    rw [sm_ckrZ1_shift Δ v d, sm_ckrZ2_shift Δ v d,
        sm_edgeSingle_shift Δ (smCkrZ1 ⟨v, d⟩).v (smCkrZ1 ⟨v, d⟩).d e',
        sm_edgeSingle_shift Δ (smCkrZ2 ⟨v, d⟩).v (smCkrZ2 ⟨v, d⟩).d e']
  · rfl

private theorem sm_ckrP_shift (Δ v : SMVert3) :
    smCkrP (smVert3Add v Δ) = smPauli81Shift Δ (smCkrP v) := by
  have hSwap : ∀ a b c : Fin 3, smFin3Add (smFin3Add a b) c = smFin3Add (smFin3Add a c) b := by decide
  apply sm_pauli81_ext
  · intro _; rfl
  · intro e'
    cases v with | mk vx vy vz =>
    cases Δ with | mk dx dy dz =>
    unfold smCkrP smPauli81Shift
    simp only [smVert3Add]
    have hx : (⟨smFin3Add (smFin3Add vx dx) ⟨2, by decide⟩, smFin3Add vy dy, smFin3Add vz dz⟩ : SMVert3) =
        smVert3Add ⟨smFin3Add vx ⟨2, by decide⟩, vy, vz⟩ ⟨dx, dy, dz⟩ := by
      simp only [smVert3Add, hSwap]
    have hy : (⟨smFin3Add vx dx, smFin3Add (smFin3Add vy dy) ⟨2, by decide⟩, smFin3Add vz dz⟩ : SMVert3) =
        smVert3Add ⟨vx, smFin3Add vy ⟨2, by decide⟩, vz⟩ ⟨dx, dy, dz⟩ := by
      simp only [smVert3Add, hSwap]
    have hz : (⟨smFin3Add vx dx, smFin3Add vy dy, smFin3Add (smFin3Add vz dz) ⟨2, by decide⟩⟩ : SMVert3) =
        smVert3Add ⟨vx, vy, smFin3Add vz ⟨2, by decide⟩⟩ ⟨dx, dy, dz⟩ := by
      simp only [smVert3Add, hSwap]
    have h0 : (⟨smFin3Add vx dx, smFin3Add vy dy, smFin3Add vz dz⟩ : SMVert3) =
        smVert3Add ⟨vx, vy, vz⟩ ⟨dx, dy, dz⟩ := rfl
    rw [hx, hy, hz, h0]
    simp only [sm_edgeSingle_shift]
  · rfl

private theorem sm_ckrG_shift (Δ v : SMVert3) (t : Fin 3) :
    smCkrG ⟨smVert3Add v Δ, t⟩ = smPauli81Shift Δ (smCkrG ⟨v, t⟩) := by
  have hAddSwap : ∀ u w : SMVert3, smVert3Add (smVert3Add u Δ) w = smVert3Add (smVert3Add u w) Δ := by
    intro u w; rw [sm_vert3Add_assoc, sm_vert3Add_comm Δ w, ← sm_vert3Add_assoc]
  have hNegShift : ∀ A : SMPauli81, smPauli81Neg (smPauli81Shift Δ A) = smPauli81Shift Δ (smPauli81Neg A) :=
    fun _ => rfl
  let ex : SMVert3 := ⟨⟨1, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩⟩
  let ey : SMVert3 := ⟨⟨0, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩⟩
  let ez : SMVert3 := ⟨⟨0, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩⟩
  match t with
  | ⟨0, _⟩ =>
    unfold smCkrG; dsimp only
    rw [hAddSwap v ex, hAddSwap v ey]
    simp only [sm_ckrS_shift, sm_ckrP_shift, sm_pauli81Mul_shift, hNegShift]
    rfl
  | ⟨1, _⟩ =>
    unfold smCkrG; dsimp only
    rw [hAddSwap v ey, hAddSwap v ez]
    simp only [sm_ckrS_shift, sm_ckrP_shift, sm_pauli81Mul_shift, hNegShift]
    rfl
  | ⟨2, _⟩ =>
    unfold smCkrG; dsimp only
    rw [hAddSwap v ez, hAddSwap v ex]
    simp only [sm_ckrS_shift, sm_ckrP_shift, sm_pauli81Mul_shift, hNegShift]
    rfl

private theorem sm_ckrG0_eq_sparse (t : Fin 3) :
    smCkrG ⟨smVert3Zero, t⟩ = smCkrG0Sparse t := by
  have hx : ∀ (t0 x y z d : Fin 3),
      (smCkrG ⟨smVert3Zero, t0⟩).x ⟨⟨x, y, z⟩, d⟩ = (smCkrG0Sparse t0).x ⟨⟨x, y, z⟩, d⟩ := by decide
  have hz : ∀ (t0 x y z d : Fin 3),
      (smCkrG ⟨smVert3Zero, t0⟩).z ⟨⟨x, y, z⟩, d⟩ = (smCkrG0Sparse t0).z ⟨⟨x, y, z⟩, d⟩ := by decide
  have hp : ∀ t0 : Fin 3, (smCkrG ⟨smVert3Zero, t0⟩).p = (smCkrG0Sparse t0).p := by decide
  apply sm_pauli81_ext
  · rintro ⟨⟨x, y, z⟩, d⟩; exact hx t x y z d
  · rintro ⟨⟨x, y, z⟩, d⟩; exact hz t x y z d
  · exact hp t

private theorem sm_ckrG_eq_shift_sparse (p : SMPlaq3) :
    smCkrG p = smPauli81Shift p.v (smCkrG0Sparse p.t) := by
  cases p with | mk v t =>
  dsimp only
  rw [← sm_ckrG0_eq_sparse t, ← sm_ckrG_shift v smVert3Zero t, sm_vert3Zero_add]

private theorem sm_vert3Step_add (v Δ : SMVert3) (d : Fin 3) :
    smVert3Step (smVert3Add v Δ) d = smVert3Add (smVert3Step v d) Δ := by
  cases v with | mk vx vy vz =>
  cases Δ with | mk dx dy dz =>
  have hS : ∀ p q r : Fin 3, smFin3Add (smFin3Add p q) r = smFin3Add (smFin3Add p r) q := by decide
  match d with
  | ⟨0, _⟩ => simp only [smVert3Step, smVert3Add, hS]
  | ⟨1, _⟩ => simp only [smVert3Step, smVert3Add, hS]
  | ⟨2, _⟩ => simp only [smVert3Step, smVert3Add, hS]

private theorem sm_vert3Add_inj_right (u w Δ : SMVert3) :
    smVert3Add u Δ = smVert3Add w Δ ↔ u = w := by
  constructor
  · intro hEq
    have h1 := (sm_vert3_sub_eq_add_iff (smVert3Add u Δ) Δ w).mpr hEq
    have h2 := (sm_vert3_sub_eq_add_iff (smVert3Add u Δ) Δ u).mpr rfl
    rw [← h2]; exact h1
  · intro hEq; rw [hEq]

private theorem sm_ckr_SS_algebra (e1 e2 : SMEdge3) :
    smPauli81Symp (smCkrS e1) (smCkrS e2) = smMajoranaInc e1 e2 := by
  have hSympS : ∀ a b : SMEdge3,
      smPauli81Symp (smCkrS a) (smCkrS b) = smXor ((smCkrS b).z a) ((smCkrS a).z b) := by
    intro a b
    unfold smPauli81Symp smCkrS
    simp only [sm_xorEdge3_single_left, sm_xorEdge3_single_right]
  have hShift : smPauli81Symp (smCkrS e1) (smCkrS e2) =
      smPauli81Symp (smCkrS ⟨smVert3Zero, e1.d⟩) (smCkrS ⟨smVert3Sub e2.v e1.v, e2.d⟩) := by
    have h1 : smCkrS e1 = smPauli81Shift e1.v (smCkrS ⟨smVert3Zero, e1.d⟩) := by
      cases e1 with | mk v1 d1 => rw [← sm_ckrS_shift, sm_vert3Zero_add]
    have h2 : smCkrS e2 = smPauli81Shift e1.v (smCkrS ⟨smVert3Sub e2.v e1.v, e2.d⟩) := by
      cases e2 with | mk v2 d2 => rw [← sm_ckrS_shift, sm_vert3Add_sub_cancel]
    rw [h1, h2, sm_pauli81Symp_shift]
  have hIncShift : smMajoranaInc e1 e2 =
      smMajoranaInc ⟨smVert3Zero, e1.d⟩ ⟨smVert3Sub e2.v e1.v, e2.d⟩ := by
    have hDst : smEdge3Dst e1 = smEdge3Dst e2 ↔
        smEdge3Dst ⟨smVert3Zero, e1.d⟩ = smEdge3Dst ⟨smVert3Sub e2.v e1.v, e2.d⟩ := by
      unfold smEdge3Dst
      rw [← sm_vert3Add_inj_right (smVert3Step smVert3Zero e1.d)
            (smVert3Step (smVert3Sub e2.v e1.v) e2.d) e1.v,
          ← sm_vert3Step_add smVert3Zero e1.v e1.d,
          ← sm_vert3Step_add (smVert3Sub e2.v e1.v) e1.v e2.d,
          sm_vert3Zero_add, sm_vert3Add_sub_cancel]
    have hV : e1.v = e2.v ↔ smVert3Zero = smVert3Sub e2.v e1.v := by
      constructor
      · intro hEq
        rw [hEq]
        exact ((sm_vert3_sub_eq_add_iff e2.v e2.v smVert3Zero).mpr (sm_vert3Zero_add e2.v).symm).symm
      · intro hEq
        exact ((sm_vert3_sub_eq_add_iff e2.v e1.v smVert3Zero).mp hEq.symm).trans (sm_vert3Zero_add e1.v) |>.symm
    unfold smMajoranaInc
    have hI1 : (if e1.v = e2.v then true else false) =
        (if smVert3Zero = smVert3Sub e2.v e1.v then true else false) := by
      if hv : e1.v = e2.v then rw [ite_eq_left hv, ite_eq_left (hV.mp hv)]
      else rw [ite_eq_right hv, ite_eq_right (fun h => hv (hV.mpr h))]
    have hI2 : (if smEdge3Dst e1 = smEdge3Dst e2 then true else false) =
        (if smEdge3Dst ⟨smVert3Zero, e1.d⟩ = smEdge3Dst ⟨smVert3Sub e2.v e1.v, e2.d⟩ then true else false) := by
      if hd : smEdge3Dst e1 = smEdge3Dst e2 then rw [ite_eq_left hd, ite_eq_left (hDst.mp hd)]
      else rw [ite_eq_right hd, ite_eq_right (fun h => hd (hDst.mpr h))]
    rw [hI1, hI2]
  rw [hShift, hIncShift, hSympS]
  have hDec : ∀ (d1 x2 y2 z2 d2 : Fin 3),
      smXor ((smCkrS ⟨⟨x2, y2, z2⟩, d2⟩).z ⟨smVert3Zero, d1⟩)
            ((smCkrS ⟨smVert3Zero, d1⟩).z ⟨⟨x2, y2, z2⟩, d2⟩) =
        smMajoranaInc ⟨smVert3Zero, d1⟩ ⟨⟨x2, y2, z2⟩, d2⟩ := by
    decide
  cases smVert3Sub e2.v e1.v with | mk x2 y2 z2 =>
  exact hDec e1.d x2 y2 z2 e2.d

private theorem sm_ckr_SP_algebra (e : SMEdge3) (v : SMVert3) :
    smPauli81Symp (smCkrS e) (smCkrP v) = smEdgeVertInc e v := by
  have hSympSP : ∀ a : SMEdge3, ∀ w : SMVert3,
      smPauli81Symp (smCkrS a) (smCkrP w) = (smCkrP w).z a := by
    intro a w
    unfold smPauli81Symp smCkrS smCkrP
    simp only [Bool.and_false, sm_xorEdge3_false, smXor_false_right, sm_xorEdge3_single_left]
  have hShift : smPauli81Symp (smCkrS e) (smCkrP v) =
      smPauli81Symp (smCkrS ⟨smVert3Sub e.v v, e.d⟩) (smCkrP smVert3Zero) := by
    have h1 : smCkrS e = smPauli81Shift v (smCkrS ⟨smVert3Sub e.v v, e.d⟩) := by
      cases e with | mk ev ed => rw [← sm_ckrS_shift, sm_vert3Add_sub_cancel]
    have h2 : smCkrP v = smPauli81Shift v (smCkrP smVert3Zero) := by
      rw [← sm_ckrP_shift, sm_vert3Zero_add]
    rw [h1, h2, sm_pauli81Symp_shift]
  have hInc : smEdgeVertInc e v = smEdgeVertInc ⟨smVert3Sub e.v v, e.d⟩ smVert3Zero := by
    have h1 : v = e.v ↔ smVert3Zero = smVert3Sub e.v v := by
      constructor
      · intro h; rw [h]; exact ((sm_vert3_sub_eq_add_iff e.v e.v smVert3Zero).mpr (sm_vert3Zero_add e.v).symm).symm
      · intro h; exact ((sm_vert3_sub_eq_add_iff e.v v smVert3Zero).mp h.symm).trans (sm_vert3Zero_add v) |>.symm
    have h2 : v = smEdge3Dst e ↔ smVert3Zero = smEdge3Dst ⟨smVert3Sub e.v v, e.d⟩ := by
      unfold smEdge3Dst
      rw [← sm_vert3Add_inj_right smVert3Zero (smVert3Step (smVert3Sub e.v v) e.d) v,
          ← sm_vert3Step_add (smVert3Sub e.v v) v e.d,
          sm_vert3Zero_add, sm_vert3Add_sub_cancel]
    unfold smEdgeVertInc
    if hc : v = e.v ∨ v = smEdge3Dst e then
      have hc' : smVert3Zero = smVert3Sub e.v v ∨ smVert3Zero = smEdge3Dst ⟨smVert3Sub e.v v, e.d⟩ :=
        hc.elim (fun a => Or.inl (h1.mp a)) (fun b => Or.inr (h2.mp b))
      rw [ite_eq_left hc, ite_eq_left hc']
    else
      have hc' : ¬ (smVert3Zero = smVert3Sub e.v v ∨ smVert3Zero = smEdge3Dst ⟨smVert3Sub e.v v, e.d⟩) :=
        fun h => hc (h.elim (fun a => Or.inl (h1.mpr a)) (fun b => Or.inr (h2.mpr b)))
      rw [ite_eq_right hc, ite_eq_right hc']
  rw [hShift, hInc, hSympSP]
  have hDec : ∀ (x y z d : Fin 3),
      (smCkrP smVert3Zero).z ⟨⟨x, y, z⟩, d⟩ = smEdgeVertInc ⟨⟨x, y, z⟩, d⟩ smVert3Zero := by decide
  cases smVert3Sub e.v v with | mk x y z =>
  exact hDec x y z e.d

private theorem sm_ckr_GS_comm (p : SMPlaq3) (e : SMEdge3) :
    smPauli81Symp (smCkrG p) (smCkrS e) = false := by
  have hShift : smPauli81Symp (smCkrG p) (smCkrS e) =
      smPauli81Symp (smCkrG0Sparse p.t) (smCkrS ⟨smVert3Sub e.v p.v, e.d⟩) := by
    have h1 := sm_ckrG_eq_shift_sparse p
    have h2 : smCkrS e = smPauli81Shift p.v (smCkrS ⟨smVert3Sub e.v p.v, e.d⟩) := by
      cases e with | mk ev ed => rw [← sm_ckrS_shift, sm_vert3Add_sub_cancel]
    rw [h1, h2, sm_pauli81Symp_shift]
  have hSympRed : ∀ (A : SMPauli81) (a : SMEdge3),
      smPauli81Symp A (smCkrS a) =
        smXor (smXor (A.x (smCkrZ1 a)) (A.x (smCkrZ2 a))) (A.z a) := by
    intro A a
    unfold smPauli81Symp smCkrS
    simp only [smXor_and_left, sm_xorEdge3_xor, sm_xorEdge3_single_right]
  rw [hShift, hSympRed]
  have hDec : ∀ (t x y z d : Fin 3),
      smXor (smXor ((smCkrG0Sparse t).x (smCkrZ1 ⟨⟨x, y, z⟩, d⟩))
                   ((smCkrG0Sparse t).x (smCkrZ2 ⟨⟨x, y, z⟩, d⟩)))
            ((smCkrG0Sparse t).z ⟨⟨x, y, z⟩, d⟩) = false := by decide
  cases smVert3Sub e.v p.v with | mk x y z =>
  exact hDec p.t x y z e.d

private theorem sm_ckr_GG_comm (p q : SMPlaq3) :
    smPauli81Symp (smCkrG p) (smCkrG q) = false := by
  cases p with | mk pv pt =>
  cases q with | mk qv qt =>
  have hShift : smPauli81Symp (smCkrG ⟨pv, pt⟩) (smCkrG ⟨qv, qt⟩) =
      smPauli81Symp (smCkrG0Sparse pt) (smPauli81Shift (smVert3Sub qv pv) (smCkrG0Sparse qt)) := by
    have h1 := sm_ckrG_eq_shift_sparse ⟨pv, pt⟩
    have h2 : smCkrG ⟨qv, qt⟩ = smPauli81Shift pv (smPauli81Shift (smVert3Sub qv pv) (smCkrG0Sparse qt)) := by
      rw [sm_ckrG_eq_shift_sparse ⟨qv, qt⟩]
      apply sm_pauli81_ext
      · intro e; unfold smPauli81Shift; simp only
        have hSub : smVert3Sub (smVert3Sub e.v pv) (smVert3Sub qv pv) = smVert3Sub e.v qv := by
          cases e.v; cases pv; cases qv
          have hF : ∀ a b c : Fin 3, smFin3Sub (smFin3Sub a b) (smFin3Sub c b) = smFin3Sub a c := by decide
          simp only [smVert3Sub, hF]
        rw [hSub]
      · intro e; unfold smPauli81Shift; simp only
        have hSub : smVert3Sub (smVert3Sub e.v pv) (smVert3Sub qv pv) = smVert3Sub e.v qv := by
          cases e.v; cases pv; cases qv
          have hF : ∀ a b c : Fin 3, smFin3Sub (smFin3Sub a b) (smFin3Sub c b) = smFin3Sub a c := by decide
          simp only [smVert3Sub, hF]
        rw [hSub]
      · rfl
    rw [h1, h2, sm_pauli81Symp_shift]
  rw [hShift]
  cases smVert3Sub qv pv with | mk rx ry rz =>
  match pt with
  | ⟨0, _⟩ =>
    unfold smPauli81Symp smCkrG0Sparse
    simp only [sm_xorEdge3_mask4_left, sm_xorEdge3_mask8_left]
    have hDec0 : ∀ (x y z t2 : Fin 3),
        let B := smPauli81Shift ⟨x, y, z⟩ (smCkrG0Sparse t2)
        smXor
          (smXor (smXor (smXor (B.z (smMkE 0 0 0 0)) (B.z (smMkE 0 0 0 1))) (B.z (smMkE 1 0 0 1))) (B.z (smMkE 0 1 0 0)))
          (smXor
            (smXor (smXor (smXor (B.x (smMkE 0 0 0 0)) (B.x (smMkE 0 0 0 2))) (B.x (smMkE 1 0 0 0))) (B.x (smMkE 0 1 0 0)))
            (smXor (smXor (smXor (B.x (smMkE 0 1 0 2)) (B.x (smMkE 2 1 0 0))) (B.x (smMkE 1 0 2 2))) (B.x (smMkE 1 1 2 2))))
        = false := by decide
    exact hDec0 rx ry rz qt
  | ⟨1, _⟩ =>
    unfold smPauli81Symp smCkrG0Sparse
    simp only [sm_xorEdge3_mask4_left, sm_xorEdge3_mask8_left]
    have hDec1 : ∀ (x y z t2 : Fin 3),
        let B := smPauli81Shift ⟨x, y, z⟩ (smCkrG0Sparse t2)
        smXor
          (smXor (smXor (smXor (B.z (smMkE 0 0 0 1)) (B.z (smMkE 0 0 0 2))) (B.z (smMkE 0 1 0 2))) (B.z (smMkE 0 0 1 1)))
          (smXor
            (smXor (smXor (smXor (B.x (smMkE 0 0 0 0)) (B.x (smMkE 0 0 0 1))) (B.x (smMkE 0 1 0 1))) (B.x (smMkE 2 1 0 0)))
            (smXor (smXor (smXor (B.x (smMkE 0 0 1 0)) (B.x (smMkE 0 0 1 1))) (B.x (smMkE 2 1 1 0))) (B.x (smMkE 0 2 1 1))))
        = false := by decide
    exact hDec1 rx ry rz qt
  | ⟨2, _⟩ =>
    unfold smPauli81Symp smCkrG0Sparse
    simp only [sm_xorEdge3_mask4_left, sm_xorEdge3_mask8_left]
    have hDec2 : ∀ (x y z t2 : Fin 3),
        let B := smPauli81Shift ⟨x, y, z⟩ (smCkrG0Sparse t2)
        smXor
          (smXor (smXor (smXor (B.z (smMkE 0 0 0 0)) (B.z (smMkE 0 0 0 2))) (B.z (smMkE 1 0 0 2))) (B.z (smMkE 0 0 1 0)))
          (smXor
            (smXor (smXor (smXor (B.x (smMkE 0 0 0 1)) (B.x (smMkE 0 0 0 2))) (B.x (smMkE 1 0 0 1))) (B.x (smMkE 1 0 0 2)))
            (smXor (smXor (smXor (B.x (smMkE 0 0 1 2)) (B.x (smMkE 0 2 1 1))) (B.x (smMkE 1 2 1 1))) (B.x (smMkE 1 0 2 2))))
        = false := by decide
    exact hDec2 rx ry rz qt

private theorem sm_ckr_G_sq_id (p : SMPlaq3) :
    smPauli81Mul (smCkrG p) (smCkrG p) = smPauli81Id := by
  rw [sm_ckrG_eq_shift_sparse p, sm_pauli81Mul_shift]
  have hBase : ∀ t : Fin 3, smPauli81Mul (smCkrG0Sparse t) (smCkrG0Sparse t) = smPauli81Id := by
    intro t
    apply sm_pauli81_ext
    · intro e; exact smXor_self ((smCkrG0Sparse t).x e)
    · intro e; exact smXor_self ((smCkrG0Sparse t).z e)
    · have hp : ∀ t0 : Fin 3, (smPauli81Mul (smCkrG0Sparse t0) (smCkrG0Sparse t0)).p = ⟨0, by decide⟩ := by decide
      exact hp t
  rw [hBase p.t]
  rfl

private def smCkrCubeBianchi0Sparse : SMPauli81 :=
  let ex : SMVert3 := ⟨⟨1, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩⟩
  let ey : SMVert3 := ⟨⟨0, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩⟩
  let ez : SMVert3 := ⟨⟨0, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩⟩
  smPauli81Mul
    (smPauli81Mul
      (smPauli81Mul
        (smPauli81Mul
          (smPauli81Mul
            (smPauli81Shift smVert3Zero (smCkrG0Sparse ⟨0, by decide⟩))
            (smPauli81Shift (smVert3Add smVert3Zero ez) (smCkrG0Sparse ⟨0, by decide⟩)))
          (smPauli81Shift smVert3Zero (smCkrG0Sparse ⟨1, by decide⟩)))
        (smPauli81Shift (smVert3Add smVert3Zero ex) (smCkrG0Sparse ⟨1, by decide⟩)))
      (smPauli81Shift smVert3Zero (smCkrG0Sparse ⟨2, by decide⟩)))
    (smPauli81Shift (smVert3Add smVert3Zero ey) (smCkrG0Sparse ⟨2, by decide⟩))

private theorem sm_ckr_cube_bianchi_all (c : SMVert3) :
    smCkrCubeBianchi c = smPauli81Id := by
  let ex : SMVert3 := ⟨⟨1, by decide⟩, ⟨0, by decide⟩, ⟨0, by decide⟩⟩
  let ey : SMVert3 := ⟨⟨0, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩⟩
  let ez : SMVert3 := ⟨⟨0, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩⟩
  have hShift : smCkrCubeBianchi c = smPauli81Shift c (smCkrCubeBianchi smVert3Zero) := by
    have hg0 : smCkrG ⟨c, ⟨0, by decide⟩⟩ = smPauli81Shift c (smCkrG ⟨smVert3Zero, ⟨0, by decide⟩⟩) := by
      rw [← sm_ckrG_shift, sm_vert3Zero_add]
    have hg1 : smCkrG ⟨smVert3Add c ez, ⟨0, by decide⟩⟩ =
        smPauli81Shift c (smCkrG ⟨smVert3Add smVert3Zero ez, ⟨0, by decide⟩⟩) := by
      rw [← sm_ckrG_shift, sm_vert3Zero_add, sm_vert3Add_comm]
    have hg2 : smCkrG ⟨c, ⟨1, by decide⟩⟩ = smPauli81Shift c (smCkrG ⟨smVert3Zero, ⟨1, by decide⟩⟩) := by
      rw [← sm_ckrG_shift, sm_vert3Zero_add]
    have hg3 : smCkrG ⟨smVert3Add c ex, ⟨1, by decide⟩⟩ =
        smPauli81Shift c (smCkrG ⟨smVert3Add smVert3Zero ex, ⟨1, by decide⟩⟩) := by
      rw [← sm_ckrG_shift, sm_vert3Zero_add, sm_vert3Add_comm]
    have hg4 : smCkrG ⟨c, ⟨2, by decide⟩⟩ = smPauli81Shift c (smCkrG ⟨smVert3Zero, ⟨2, by decide⟩⟩) := by
      rw [← sm_ckrG_shift, sm_vert3Zero_add]
    have hg5 : smCkrG ⟨smVert3Add c ey, ⟨2, by decide⟩⟩ =
        smPauli81Shift c (smCkrG ⟨smVert3Add smVert3Zero ey, ⟨2, by decide⟩⟩) := by
      rw [← sm_ckrG_shift, sm_vert3Zero_add, sm_vert3Add_comm]
    unfold smCkrCubeBianchi; dsimp only
    rw [hg0, hg1, hg2, hg3, hg4, hg5]
    simp only [sm_pauli81Mul_shift]
    rfl
  rw [hShift]
  have hZeroSparse : smCkrCubeBianchi smVert3Zero = smCkrCubeBianchi0Sparse := by
    unfold smCkrCubeBianchi smCkrCubeBianchi0Sparse
    simp only [sm_ckrG_eq_shift_sparse]
  have hZero : smCkrCubeBianchi0Sparse = smPauli81Id := by
    have hx : ∀ x y z d : Fin 3, smCkrCubeBianchi0Sparse.x ⟨⟨x, y, z⟩, d⟩ = false := by decide
    have hz : ∀ x y z d : Fin 3, smCkrCubeBianchi0Sparse.z ⟨⟨x, y, z⟩, d⟩ = false := by decide
    have hp : smCkrCubeBianchi0Sparse.p = ⟨0, by decide⟩ := by decide
    apply sm_pauli81_ext
    · rintro ⟨⟨x, y, z⟩, d⟩; exact hx x y z d
    · rintro ⟨⟨x, y, z⟩, d⟩; exact hz x y z d
    · exact hp
  rw [hZeroSparse, hZero]; rfl

/-- Headline Theorem 5 (Levin–Wen 3D T-Junction Exchange, 8-Dim Physical Swap & `3 × 3 × 3` CKR Bosonization):
    1. Exact 3-qubit Levin–Wen operator invariant: `S_3 S_2 S_1 S_3 S_2 S_1 = -I` (`p = 2 mod 4`)
       versus naive bosonic control `B_3 B_2 B_1 B_3 B_2 B_1 = +I` (`p = 0 mod 4`),
    2. Exact 8-dim Fock space (`ℤ[i]`) 6-step dynamical-phase-cancelled 2-particle exchange on `|1, 1, 0⟩`:
       fermionic `E_ex |1, 1, 0⟩ = -|1, 1, 0⟩` vs bosonic `+|1, 1, 0⟩`, exact Pauli exclusion
       `H_hop,k |n_0 = 1, n_k = 1⟩ = 0` on all 3 legs, and exact unitarity `T_k^† T_k = I_8`,
    3. Exact `3 × 3 × 3` (`V = 27, E = 81`) 3D `{4,3,4}` torus Chen–Kapustin–Radicevic bosonization:
       exact Majorana anticommutation `{S_e, S_{e'}} = 0` on shared same-type endpoints and commutation
       elsewhere, `{S_e, P_v} = 0` iff `v ∈ ∂e`, `[G_p, S_e] = 0`, `[G_p, G_q] = 0`, `G_p^2 = +I`,
       and exact 3D cube Bianchi identity `∏_{p ∈ ∂c} G_p = +I` across all `27` cubes. -/
theorem thm_sm_ckr_3d_bosonization_and_fermion_exchange :
    (smLevinWen smTJunS1 smTJunS2 smTJunS3 = smPauli3NegId ∧
     smLevinWen smTJunB1 smTJunB2 smTJunB3 = smPauli3Id) ∧
    ((∀ i : Fin 8,
        smExchange6 smTJunS1 smTJunS2 smTJunS3 (smBasis8 ⟨3, by decide⟩) i =
          smVec8Neg (smBasis8 ⟨3, by decide⟩) i) ∧
     (∀ i : Fin 8,
        smExchange6 smTJunB1 smTJunB2 smTJunB3 (smBasis8 ⟨3, by decide⟩) i =
          smBasis8 ⟨3, by decide⟩ i) ∧
     (∀ i : Fin 8,
        smHopOp8 smTJunS1 ⟨0, by decide⟩ (smBasis8 ⟨1, by decide⟩) i = SMGaussInt.zero ∧
        smHopOp8 smTJunS2 ⟨1, by decide⟩ (smBasis8 ⟨2, by decide⟩) i = SMGaussInt.zero ∧
        smHopOp8 smTJunS3 ⟨2, by decide⟩ (smBasis8 ⟨4, by decide⟩) i = SMGaussInt.zero) ∧
     (∀ (c i : Fin 8),
        smSwapGate8 smTJunS1 ⟨0, by decide⟩ true (smSwapGate8 smTJunS1 ⟨0, by decide⟩ false (smBasis8 c)) i = smBasis8 c i ∧
        smSwapGate8 smTJunS2 ⟨1, by decide⟩ true (smSwapGate8 smTJunS2 ⟨1, by decide⟩ false (smBasis8 c)) i = smBasis8 c i ∧
        smSwapGate8 smTJunS3 ⟨2, by decide⟩ true (smSwapGate8 smTJunS3 ⟨2, by decide⟩ false (smBasis8 c)) i = smBasis8 c i)) ∧
    ((∀ e1 e2 : SMEdge3, smPauli81Symp (smCkrS e1) (smCkrS e2) = smMajoranaInc e1 e2) ∧
     (∀ (e : SMEdge3) (v : SMVert3), smPauli81Symp (smCkrS e) (smCkrP v) = smEdgeVertInc e v) ∧
     (∀ (p : SMPlaq3) (e : SMEdge3), smPauli81Symp (smCkrG p) (smCkrS e) = false) ∧
     (∀ p q : SMPlaq3, smPauli81Symp (smCkrG p) (smCkrG q) = false) ∧
     (∀ p : SMPlaq3, smPauli81Mul (smCkrG p) (smCkrG p) = smPauli81Id) ∧
     (∀ c : SMVert3, smCkrCubeBianchi c = smPauli81Id)) :=
  ⟨⟨by decide, by decide⟩,
   ⟨by decide, by decide, by decide, by decide⟩,
   ⟨sm_ckr_SS_algebra, sm_ckr_SP_algebra, sm_ckr_GS_comm, sm_ckr_GG_comm, sm_ckr_G_sq_id, sm_ckr_cube_bianchi_all⟩⟩


/-! ## Section 6: `{3,4,3,4}` Cusp Shell Recurrence (`N_13`) & Color-Singlet Baryon Charge Quantization -/

/-- Linear-time 3-term sliding window `(N_{D+1}, N_{D+2}, N_{D+3})` for the `{3,4,3,4}` cusp shell
    recurrence `N_0 = 1, N_1 = 18, N_2 = 330, N_3 = 6034`, `N_{D+4} = 21 N_{D+3} - 51 N_{D+2} + 23 N_{D+1}`. -/
def smCuspWin : Nat → Nat × Nat × Nat
  | 0 => (18, 330, 6034)
  | D + 1 =>
    let w := smCuspWin D
    (w.2.1, w.2.2, 21 * w.2.2 + 23 * w.1 - 51 * w.2.1)

def smCuspShell : Nat → Nat
  | 0 => 1
  | D + 1 => (smCuspWin D).1

private theorem sm_cuspWin_invariant (D : Nat) :
    (smCuspWin D).1 ≥ 1 ∧
    (smCuspWin D).2.1 ≥ 18 * (smCuspWin D).1 ∧
    (smCuspWin D).2.2 ≥ 18 * (smCuspWin D).2.1 := by
  induction D with
  | zero => decide
  | succ k ih =>
    simp only [smCuspWin]
    have h1 := ih.1
    have h2 := ih.2.1
    have h3 := ih.2.2
    exact ⟨by omega, h3, by omega⟩

private theorem sm_cuspShell_recurrence (D : Nat) :
    smCuspShell (D + 4) + 51 * smCuspShell (D + 2) =
      21 * smCuspShell (D + 3) + 23 * smCuspShell (D + 1) := by
  have h3 := (sm_cuspWin_invariant D).2.2
  change (21 * (smCuspWin D).2.2 + 23 * (smCuspWin D).1 - 51 * (smCuspWin D).2.1) +
      51 * (smCuspWin D).2.1 =
    21 * (smCuspWin D).2.2 + 23 * (smCuspWin D).1
  omega

private theorem sm_cuspShell_eq_foata (D : Nat) : smCuspShell D = cuspShell D := by
  have hTriple : ∀ n : Nat,
      smCuspShell n = cuspShell n ∧
      smCuspShell (n + 1) = cuspShell (n + 1) ∧
      smCuspShell (n + 2) = cuspShell (n + 2) ∧
      smCuspShell (n + 3) = cuspShell (n + 3) := by
    intro n
    induction n with
    | zero =>
      have hInit := thm_foata_exact_initial_values.2.1
      refine ⟨?_, ?_, ?_, ?_⟩
      · rw [hInit.1]; decide
      · rw [hInit.2.1]; decide
      · rw [hInit.2.2.1]; decide
      · rw [hInit.2.2.2.1]; decide
    | succ m ih =>
      refine ⟨ih.2.1, ih.2.2.1, ih.2.2.2, ?_⟩
      have hRec1 := sm_cuspShell_recurrence m
      have hRec2 := (thm_foata_cubic_recurrence.1 m).2
      have h1 := ih.2.1
      have h2 := ih.2.2.1
      have h3 := ih.2.2.2
      change smCuspShell (m + 4) = cuspShell (m + 4)
      omega
  exact (hTriple D).1

private theorem sm_cuspShell_growth (D : Nat) :
    smCuspShell D > 0 ∧ smCuspShell (D + 1) ≥ 18 * smCuspShell D := by
  cases D with
  | zero => decide
  | succ k =>
    have h1 := (sm_cuspWin_invariant k).1
    have h2 := (sm_cuspWin_invariant k).2.1
    exact ⟨by change (smCuspWin k).1 > 0; omega,
           by change (smCuspWin k).2.1 ≥ 18 * (smCuspWin k).1; exact h2⟩

private theorem sm_cuspShell_exp (D : Nat) : smCuspShell D ≥ 18 ^ D := by
  induction D with
  | zero => decide
  | succ k ih =>
    have hStep := (sm_cuspShell_growth k).2
    have hMul : 18 * 18 ^ k ≤ 18 * smCuspShell k := by
      have h := Nat.mul_le_mul_left 18 ih
      exact h
    rw [Nat.pow_succ, Nat.mul_comm]
    omega

/-- Light quark flavor for color-singlet `SU(3)_C` baryons (`6 Y_u = +4`, `6 Y_d = -2`, electric charge `Q = 6 Y / 6`). -/
inductive SMQuarkFlavor where
  | up
  | down
  deriving DecidableEq, Repr

def smQuarkSixY : SMQuarkFlavor → Int
  | .up => 4
  | .down => -2

def smBaryonSixQ (q1 q2 q3 : SMQuarkFlavor) : Int :=
  smQuarkSixY q1 + smQuarkSixY q2 + smQuarkSixY q3

def smBaryonCharge (q1 q2 q3 : SMQuarkFlavor) : Int :=
  smBaryonSixQ q1 q2 q3 / 6

/-- Headline Theorem 6 (`{3,4,3,4}` Cusp Shell Recurrence `N_13` & `ℤ_6` Color-Singlet Baryon Quantization):
    1. Exact initial values `N_0 = 1, N_1 = 18, N_2 = 330, N_3 = 6034`, exact `D_* = 13` value
       `N_13 = 25123449085462194`, exact cubic recurrence
       `∀ D, N_{D+4} + 51 N_{D+2} = 21 N_{D+3} + 23 N_{D+1}`, and exact identity `∀ D, smCuspShell D = cuspShell D`,
    2. Strict positivity `N_D > 0` and exponential growth `N_{D+1} ≥ 18 N_D` & `N_D ≥ 18^D` for ALL `D : Nat`,
    3. Exact `ℤ_6` color-singlet baryon charge quantization:
       - Universal congruence: any three `triality = 1` quarks with `(2 + y_i) % 6 = 0` satisfy
         `(y_1 + y_2 + y_3) % 6 = 0` (exact integer electric charge),
       - Exhaustively across all 8 light 3-quark baryons `(q_1, q_2, q_3) ∈ {u, d}^3`,
         `6 * Q = 6 Y_1 + 6 Y_2 + 6 Y_3` and `Q ∈ {-1, 0, +1, +2}`,
       - Specific physical baryons: proton `u u d → Q = +1`, neutron `u d d → Q = 0`,
         `Δ^{++} u u u → Q = +2`, and `Δ^- d d d → Q = -1`. -/
theorem thm_sm_cusp_shell_recurrence_and_baryon_charge :
    (smCuspShell 0 = 1 ∧ smCuspShell 1 = 18 ∧ smCuspShell 2 = 330 ∧ smCuspShell 3 = 6034 ∧
     smCuspShell 13 = 25123449085462194 ∧
     (∀ D : Nat, smCuspShell (D + 4) + 51 * smCuspShell (D + 2) =
       21 * smCuspShell (D + 3) + 23 * smCuspShell (D + 1)) ∧
     (∀ D : Nat, smCuspShell D = cuspShell D)) ∧
    (∀ D : Nat, smCuspShell D > 0 ∧ smCuspShell (D + 1) ≥ 18 * smCuspShell D ∧ smCuspShell D ≥ 18 ^ D) ∧
    ((∀ y1 y2 y3 : Int, (2 + y1) % 6 = 0 → (2 + y2) % 6 = 0 → (2 + y3) % 6 = 0 →
        (y1 + y2 + y3) % 6 = 0) ∧
     (∀ q : SMQuarkFlavor, (2 + smQuarkSixY q) % 6 = 0) ∧
     (∀ q1 q2 q3 : SMQuarkFlavor,
        6 * smBaryonCharge q1 q2 q3 = smBaryonSixQ q1 q2 q3 ∧
        (smBaryonCharge q1 q2 q3 = -1 ∨ smBaryonCharge q1 q2 q3 = 0 ∨
         smBaryonCharge q1 q2 q3 = 1 ∨ smBaryonCharge q1 q2 q3 = 2)) ∧
     smBaryonCharge .up .up .down = 1 ∧
     smBaryonCharge .up .down .down = 0 ∧
     smBaryonCharge .up .up .up = 2 ∧
     smBaryonCharge .down .down .down = -1) := by
  have hBaryonAll : ∀ q1 q2 q3 : SMQuarkFlavor,
      6 * smBaryonCharge q1 q2 q3 = smBaryonSixQ q1 q2 q3 ∧
      (smBaryonCharge q1 q2 q3 = -1 ∨ smBaryonCharge q1 q2 q3 = 0 ∨
       smBaryonCharge q1 q2 q3 = 1 ∨ smBaryonCharge q1 q2 q3 = 2) := by
    intro q1 q2 q3
    cases q1 <;> cases q2 <;> cases q3 <;> decide
  have hQuarkZ6 : ∀ q : SMQuarkFlavor, (2 + smQuarkSixY q) % 6 = 0 := by
    intro q; cases q <;> decide
  exact ⟨⟨by decide, by decide, by decide, by decide, by decide,
          sm_cuspShell_recurrence, sm_cuspShell_eq_foata⟩,
         fun D => ⟨(sm_cuspShell_growth D).1, (sm_cuspShell_growth D).2, sm_cuspShell_exp D⟩,
         ⟨fun y1 y2 y3 h1 h2 h3 => by omega, hQuarkZ6, hBaryonAll,
          by decide, by decide, by decide, by decide⟩⟩

end Vibe
