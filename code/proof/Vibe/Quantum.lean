import Vibe.Algebra
import Vibe.Rule

/-!
# Vibe Theory: Quantum Foundations — Half-Coin, `M_meet^diff`, `E-QTM-0204` `6 × 6` Splitter & `E-QTM-0205` Envariance

Zero-dependency Lean 4.35.0 formalization of the exact `ℤ[ω]` / `ℤ[ω][1/6]` quantum foundation
identities (Milestone P3, bridging `Vibe.Rule`, `E-QTM-0204`, and `E-QTM-0205`):

1. **Half-Coin `C_{1/2}` & `M_meet^diff` Exact Eisenstein Identities:**
   - Exact `det(2 C_{1/2}) = 4 ζ_6` (`det C_{1/2} = ζ_6 = -ω^2 = 1 + ω`), `C_{1/2}^2 = C`, `det(2 C) = 4 ω`,
   - Exact Strang full-line phase relation `ζ_6 * ω * ζ_6 = ω^2` and sixth-root cycle `ζ_6^3 = -1, ζ_6^6 = 1`,
   - Exact left/right unitarity, determinant `ω`, order-3 cube `(M_meet^diff)^3 = I_2`, `(1/4, 3/4)`
     keep/swap weights, and symmetric/antisymmetric eigenmodes (`ω`, `1`) of `M_meet^diff`.
2. **Exact `6 × 6` `E-QTM-0204` Path⊗Role Unitary Splitter & Mach-Zehnder Recombination:**
   - Exact 2-adic obstruction: `ord_9(2) = 6` (`2` inert in `ℤ[ζ_9]`) and `∀ x : Eis, Eis.normSq x ≠ 2`
     (no single `ℤ[ω][1/2]` amplitude has squared modulus `1/2 = 2/4`),
   - Exact `6 × 6` layer & composite unitarity (`U_1 = C ⊗ I_3`, `U_2 = diag(I_3, Z_3 F_3)`,
     `U_3 = swap(|1,0⟩ ↔ |0,1⟩)`, `U_tot = U_3 U_2 U_1`, `(6 U_tot)† (6 U_tot) = 36 I_6`),
   - Exact reduction of `U_tot |0,0⟩` into `ℤ[ω][1/2]` with balanced `(1/2, 1/2)` port squared norms,
   - Exact Mach-Zehnder interference: `U_tot† I_6 U_tot |0,0⟩ = |0,0⟩` (`(1, 0)`), exact destructive
     cancellation `⟨0,0| U_tot† P_π U_tot |0,0⟩ = 0`, and exact `6 × 6` `ℤ[ω][1/2]` unitary recombiner
     `V_MZ` producing exact `(1, 0)` at `φ = 0` and `(0, 1)` at `φ = π`.
3. **Exact `E-QTM-0205` `36/36` `ℤ_6 × ℤ_6` & `24/24` `S_4` Bipartite Envariance:**
   - Exact single-beat 2-branch Schmidt state `|Ψ_2⟩` (`(1/4, 3/4)` weights) invariant under ALL
     `36/36` explicit `ℤ_6 × ℤ_6` bipartite phase unitaries `U_S(p_0, p_1) ⊗ U_E(-p_0, -p_1)`,
   - Exact Eisenstein fine-graining collapse `(-1 - 2ω)(1 - ω) = -3(1 + ω)` mapping `|Ψ_2⟩` under
     `(U_2 ⊗ I_6)` and controlled environment-role copy into the 4-branch equal-modulus `ℤ[ω][1/2]`
     Schmidt state `|Ψ_4⟩` (`(1/4, 1/4, 1/4, 1/4)`, branch counts `(1, 3)`),
   - Symbolic AND explicit `24/24` `S_4` swap-and-phase bipartite unitaries `(U_S(π) ⊗ U_E(π)) |Ψ_4⟩ = |Ψ_4⟩`,
   - Exact reduced density matrix `ρ_S = Tr_E |Ψ⟩⟨Ψ|` proportional to identity on all 4 active branches
     (`4 ρ_S^{red} = I_4`, zero off-diagonal coherence, exact equal weights `1/4`).
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Eisenstein Star-Ring Helpers & Finite-Dimensional Matrix Operations -/

private theorem qEis_add_zero (x : Eis) : Eis.add x Eis.zero = x :=
  StarCommRing.add_zero (R := Eis) x

private theorem qEis_zero_add (x : Eis) : Eis.add Eis.zero x = x :=
  StarCommRing.zero_add (R := Eis) x

private theorem qEis_mul_one (x : Eis) : Eis.mul x Eis.one = x :=
  StarCommRing.mul_one (R := Eis) x

private theorem qEis_one_mul (x : Eis) : Eis.mul Eis.one x = x :=
  StarCommRing.one_mul (R := Eis) x

private theorem qEis_mul_zero (x : Eis) : Eis.mul x Eis.zero = Eis.zero :=
  StarCommRing.mul_zero (R := Eis) x

private theorem qEis_zero_mul (x : Eis) : Eis.mul Eis.zero x = Eis.zero :=
  StarCommRing.zero_mul (R := Eis) x

private theorem qEis_mul_comm (x y : Eis) : Eis.mul x y = Eis.mul y x :=
  StarCommRing.mul_comm (R := Eis) x y

private theorem qEis_mul_assoc (x y z : Eis) :
    Eis.mul (Eis.mul x y) z = Eis.mul x (Eis.mul y z) :=
  StarCommRing.mul_assoc (R := Eis) x y z

private theorem qEis_conj_mul (x y : Eis) :
    Eis.conj (Eis.mul x y) = Eis.mul (Eis.conj x) (Eis.conj y) :=
  StarCommRing.conj_mul (R := Eis) x y

private theorem qEis_conj_conj (x : Eis) : Eis.conj (Eis.conj x) = x :=
  StarCommRing.conj_conj (R := Eis) x

private theorem qEis_conj_one : Eis.conj Eis.one = Eis.one :=
  StarCommRing.conj_one (R := Eis)

private theorem qEis_conj_zero : Eis.conj Eis.zero = Eis.zero := by decide

private theorem qEis_ofInt_one : Eis.ofInt 1 = Eis.one := rfl

/-- Exact 2-vector and `2 × 2` function-indexed matrix over `ℤ[ω]`. -/
abbrev Vec2Eis := Fin 2 → Eis
abbrev Mat2F := Fin 2 → Fin 2 → Eis

/-- Exact 4-vector and `4 × 4` matrix over `ℤ[ω]`. -/
abbrev Vec4Eis := Fin 4 → Eis
abbrev Mat4Eis := Fin 4 → Fin 4 → Eis

/-- Exact 6-vector and `6 × 6` matrix over `ℤ[ω]` for `path(2) ⊗ role(3)`. -/
abbrev Vec6Eis := Fin 6 → Eis
abbrev Mat6Eis := Fin 6 → Fin 6 → Eis

def sum2Eis (f : Fin 2 → Eis) : Eis :=
  Eis.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩)

def sum4Eis (f : Fin 4 → Eis) : Eis :=
  Eis.add
    (Eis.add (Eis.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩)) (f ⟨2, by decide⟩))
    (f ⟨3, by decide⟩)

def sum6Eis (f : Fin 6 → Eis) : Eis :=
  Eis.add
    (Eis.add
      (Eis.add
        (Eis.add
          (Eis.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩))
          (f ⟨2, by decide⟩))
        (f ⟨3, by decide⟩))
      (f ⟨4, by decide⟩))
    (f ⟨5, by decide⟩)

def mat2FId (s : Int) : Mat2F :=
  fun i j => if i = j then Eis.ofInt s else Eis.zero

def mat2FDag (A : Mat2F) : Mat2F :=
  fun i j => Eis.conj (A j i)

def mat2FMul (A B : Mat2F) : Mat2F :=
  fun i j => sum2Eis (fun k => Eis.mul (A i k) (B k j))

def mat6Id (s : Int) : Mat6Eis :=
  fun i j => if i = j then Eis.ofInt s else Eis.zero

def mat6Dag (A : Mat6Eis) : Mat6Eis :=
  fun i j => Eis.conj (A j i)

def mat6Mul (A B : Mat6Eis) : Mat6Eis :=
  fun i j => sum6Eis (fun k => Eis.mul (A i k) (B k j))

def mat6Vec (A : Mat6Eis) (v : Vec6Eis) : Vec6Eis :=
  fun i => sum6Eis (fun k => Eis.mul (A i k) (v k))

def inner6Eis (u v : Vec6Eis) : Eis :=
  sum6Eis (fun k => Eis.mul (Eis.conj (u k)) (v k))

/-- Explicit bipartite tensor-product action `(U_S ⊗ U_E) |Ψ⟩` on `H_S^(2) ⊗ H_E^(2)`. -/
def bipartiteApply2 (uS uE : Mat2F) (psi : Fin 2 → Fin 2 → Eis) : Fin 2 → Fin 2 → Eis :=
  fun s e =>
    sum2Eis (fun s' =>
      sum2Eis (fun e' => Eis.mul (Eis.mul (uS s s') (uE e e')) (psi s' e')))

/-- Explicit bipartite tensor-product action `(U_S ⊗ U_E) |Ψ⟩` on `H_S^(6) ⊗ H_E^(6)`. -/
def bipartiteApply6 (uS uE : Mat6Eis) (psi : Fin 6 → Fin 6 → Eis) : Fin 6 → Fin 6 → Eis :=
  fun s e =>
    sum6Eis (fun s' =>
      sum6Eis (fun e' => Eis.mul (Eis.mul (uS s s') (uE e e')) (psi s' e')))

/-- Exact reduced density matrix `ρ_S = Tr_E |Ψ⟩⟨Ψ|` on `H_S^(4)`. -/
def reducedRhoS4 (psi : Fin 4 → Fin 4 → Eis) : Mat4Eis :=
  fun s1 s2 => sum4Eis (fun e => Eis.mul (psi s1 e) (Eis.conj (psi s2 e)))

/-- Exact reduced density matrix `ρ_S = Tr_E |Ψ⟩⟨Ψ|` on `H_S^(6)`. -/
def reducedRhoS6 (psi : Fin 6 → Fin 6 → Eis) : Mat6Eis :=
  fun s1 s2 => sum6Eis (fun e => Eis.mul (psi s1 e) (Eis.conj (psi s2 e)))

private theorem sum2Eis_delta (a : Fin 2) (f : Fin 2 → Eis) :
    sum2Eis (fun k => if k = a then f k else Eis.zero) = f a := by
  match a with
  | ⟨0, _⟩ | ⟨1, _⟩ =>
    simp [sum2Eis, qEis_add_zero, qEis_zero_add]

private theorem sum6Eis_delta (a : Fin 6) (f : Fin 6 → Eis) :
    sum6Eis (fun k => if k = a then f k else Eis.zero) = f a := by
  match a with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ | ⟨5, _⟩ =>
    simp [sum6Eis, qEis_add_zero, qEis_zero_add]

private theorem bij_eq_iff {n : Nat} (f fInv : Fin n → Fin n)
    (hL : ∀ x : Fin n, fInv (f x) = x) (hR : ∀ x : Fin n, f (fInv x) = x)
    (a k : Fin n) : f k = a ↔ k = fInv a := by
  constructor
  · intro h
    rw [← h, hL]
  · intro h
    rw [h, hR]

private theorem sum6Eis_bij_delta (f fInv : Fin 6 → Fin 6)
    (hL : ∀ x : Fin 6, fInv (f x) = x) (hR : ∀ x : Fin 6, f (fInv x) = x)
    (a : Fin 6) (g : Fin 6 → Eis) :
    sum6Eis (fun k => if a = f k then g k else Eis.zero) = g (fInv a) := by
  have hFun : (fun k => if a = f k then g k else Eis.zero) =
      (fun k => if k = fInv a then g k else Eis.zero) := by
    funext k
    if hk : k = fInv a then
      have hfk : a = f k := ((bij_eq_iff f fInv hL hR a k).mpr hk).symm
      rw [if_pos hfk, if_pos hk]
    else
      have hfk : ¬(a = f k) := fun h => hk ((bij_eq_iff f fInv hL hR a k).mp h.symm)
      rw [if_neg hfk, if_neg hk]
  rw [hFun, sum6Eis_delta]


/-! ## Section 1: Half-Coin `C_{1/2}` & `M_meet^diff` Exact Eisenstein Identities -/

/-- Exact scaled like-sign distinct-role meeting matrix
    `2 M_meet^diff = [[1 + ω, ω - 1], [ω - 1, 1 + ω]]` in `Mat_2(ℤ[ω])`. -/
def mMeetDiff2 : Mat2Eis :=
  ⟨⟨1, 1⟩, ⟨-1, 1⟩, ⟨-1, 1⟩, ⟨1, 1⟩⟩

/-- Exact half-coin determinant and squaring identities connecting directly to `Vibe.Rule`:
    `det(2 C_{1/2}) = 4 ζ_6`, `ζ_6 = -ω^2 = 1 + ω`, `(2 C_{1/2})^2 = 2 (2 C)`, and `det(2 C) = 4 ω`. -/
theorem thm_qtm_halfCoin_det_and_sq :
    Mat2Eis.det halfCoin2 = Eis.scale 4 Eis.zeta6 ∧
    Eis.zeta6 = Eis.neg Eis.omega2 ∧
    Mat2Eis.mul halfCoin2 halfCoin2 = Mat2Eis.scale 2 coin2 ∧
    Mat2Eis.det coin2 = Eis.scale 4 Eis.omega := by
  decide

/-- Exact Eisenstein Strang braiding/phase relation `ζ_6 * ω * ζ_6 = ω^2` and sixth-root cycle:
    on a like-sign full line, the Strang sandwich `C_{1/2} M_meet C_{1/2}` imparts `ζ_6 ω ζ_6 = ω^2`. -/
theorem thm_qtm_zeta6_braiding_and_strang :
    Eis.mul (Eis.mul Eis.zeta6 Eis.omega) Eis.zeta6 = Eis.omega2 ∧
    Eis.mul Eis.zeta6 Eis.zeta6 = Eis.omega ∧
    Eis.pow Eis.zeta6 3 = Eis.ofInt (-1) ∧
    Eis.pow Eis.zeta6 6 = Eis.one := by
  decide

/-- Exact left & right unitarity, determinant `ω`, and order-3 cube identity for `M_meet^diff`:
    `(2 M_meet^diff)† (2 M_meet^diff) = 4 I_2`, `(2 M_meet^diff) (2 M_meet^diff)† = 4 I_2`,
    `det(2 M_meet^diff) = 4 ω`, and `(2 M_meet^diff)^3 = 8 I_2` (`(M_meet^diff)^3 = I_2`). -/
theorem thm_qtm_mMeetDiff_unitary_and_order3 :
    Mat2Eis.mul (Mat2Eis.dag mMeetDiff2) mMeetDiff2 = Mat2Eis.scale 4 Mat2Eis.id ∧
    Mat2Eis.mul mMeetDiff2 (Mat2Eis.dag mMeetDiff2) = Mat2Eis.scale 4 Mat2Eis.id ∧
    Mat2Eis.det mMeetDiff2 = Eis.scale 4 Eis.omega ∧
    Mat2Eis.pow mMeetDiff2 3 = Mat2Eis.scale 8 Mat2Eis.id := by
  decide

/-- Exact keep/swap weights `(1/4, 3/4)` and symmetric/antisymmetric eigenmodes of `M_meet^diff`:
    `M_meet^diff |+⟩ = ω |+⟩`, `M_meet^diff |-⟩ = 1 |-⟩`, and Strang-sandwiched
    `ζ_6 M_meet^diff ζ_6` has symmetric eigenvalue `ω^2` and antisymmetric eigenvalue `ω`. -/
theorem thm_qtm_mMeetDiff_weights_and_eigenmodes :
    Eis.normSq mMeetDiff2.m00 = 1 ∧
    Eis.normSq mMeetDiff2.m01 = 3 ∧
    Eis.add mMeetDiff2.m00 mMeetDiff2.m01 = Eis.scale 2 Eis.omega ∧
    Eis.sub mMeetDiff2.m00 mMeetDiff2.m01 = Eis.ofInt 2 ∧
    Eis.mul Eis.zeta6 (Eis.mul (Eis.add mMeetDiff2.m00 mMeetDiff2.m01) Eis.zeta6) =
      Eis.scale 2 Eis.omega2 ∧
    Eis.mul Eis.zeta6 (Eis.mul (Eis.sub mMeetDiff2.m00 mMeetDiff2.m01) Eis.zeta6) =
      Eis.scale 2 Eis.omega := by
  decide


/-! ## Section 2: Exact `6 × 6` `E-QTM-0204` Path⊗Role Unitary Splitter & Mach-Zehnder Recombination -/

private theorem int_sq_ge_four_of_ge_two (u : Int) (hu : u ≥ 2) : u * u ≥ 4 := by
  have h : (u - 2) * (u + 2) ≥ 0 := Int.mul_nonneg (by omega) (by omega)
  rw [Int.sub_mul, Int.mul_add, Int.mul_add, Int.mul_comm 2 u] at h
  omega

private theorem int_sq_ge_nine_of_ge_three (u : Int) (hu : u ≥ 3) : u * u ≥ 9 := by
  have h : (u - 3) * (u + 3) ≥ 0 := Int.mul_nonneg (by omega) (by omega)
  rw [Int.sub_mul, Int.mul_add, Int.mul_add, Int.mul_comm 3 u] at h
  omega

private theorem int_sq_ne_five_eight (u : Int) : u * u ≠ 5 ∧ u * u ≠ 8 := by
  if hge : u ≥ 3 then
    have h9 := int_sq_ge_nine_of_ge_three u hge
    exact ⟨by omega, by omega⟩
  else if hle : u ≤ -3 then
    have h9 := int_sq_ge_nine_of_ge_three (-u) (by omega)
    rw [Int.neg_mul, Int.mul_neg, Int.neg_neg] at h9
    exact ⟨by omega, by omega⟩
  else
    have hCases : u = -2 ∨ u = -1 ∨ u = 0 ∨ u = 1 ∨ u = 2 := by omega
    rcases hCases with h | h | h | h | h <;> (rw [h]; decide)

/-- Exact 2-adic inertia certificate from `E-QTM-0204`: `2` has multiplicative order `6 = φ(9)` mod `9`,
    so `2` is inert in `ℤ[ζ_9]`. -/
theorem thm_qtm_two_inert_mod9 :
    (2 ^ 1) % 9 ≠ 1 ∧ (2 ^ 2) % 9 ≠ 1 ∧ (2 ^ 3) % 9 ≠ 1 ∧
    (2 ^ 4) % 9 ≠ 1 ∧ (2 ^ 5) % 9 ≠ 1 ∧ (2 ^ 6) % 9 = 1 := by
  decide

/-- Exact Eisenstein norm obstruction: NO element `x ∈ ℤ[ω]` satisfies `|x|^2 = 2`.
    Hence no single amplitude in `ℤ[ω][1/2]` hits squared modulus `1/2 = 2/4`, forcing an exact
    50:50 splitter over `ℤ[ω][1/6]` to distribute `1/2 = 1/4 + 1/4` across two orthogonal roles. -/
theorem thm_qtm_no_eis_normSq_eq_two (x : Eis) : Eis.normSq x ≠ 2 := by
  cases x with
  | mk a b =>
    unfold Eis.normSq
    intro h
    have hId : (2 * a - b) * (2 * a - b) + 3 * (b * b) = 4 * (a * a - a * b + b * b) := by
      rw [Int.sub_mul, Int.mul_sub, Int.mul_sub]
      have h1 : (2 * a) * (2 * a) = 4 * (a * a) := by
        rw [Int.mul_assoc 2 a (2 * a), ← Int.mul_assoc a 2 a, Int.mul_comm a 2,
            Int.mul_assoc 2 a a, ← Int.mul_assoc 2 2 (a * a)]
        rfl
      have h2 : (2 * a) * b = 2 * (a * b) := Int.mul_assoc 2 a b
      have h3 : b * (2 * a) = 2 * (a * b) := by
        rw [← Int.mul_assoc b 2 a, Int.mul_comm b 2, Int.mul_assoc 2 b a, Int.mul_comm b a]
      rw [h1, h2, h3]
      omega
    have h8 : (2 * a - b) * (2 * a - b) + 3 * (b * b) = 8 := by omega
    have hSq : 0 ≤ (2 * a - b) * (2 * a - b) := int_sq_nonneg (2 * a - b)
    have hBbound : b * b ≤ 2 := by omega
    have hAbs : -1 ≤ b ∧ b ≤ 1 := by
      if hge : b ≥ 2 then
        have h4 := int_sq_ge_four_of_ge_two b hge
        omega
      else if hle : b ≤ -2 then
        have h4 := int_sq_ge_four_of_ge_two (-b) (by omega)
        rw [Int.neg_mul, Int.mul_neg, Int.neg_neg] at h4
        omega
      else
        omega
    have hBcases : b = -1 ∨ b = 0 ∨ b = 1 := by omega
    have hU := int_sq_ne_five_eight (2 * a - b)
    rcases hBcases with hb | hb | hb
    · subst hb
      change (2 * a - -1) * (2 * a - -1) + 3 * 1 = 8 at h8
      exact hU.1 (by omega)
    · subst hb
      change (2 * a - 0) * (2 * a - 0) + 3 * 0 = 8 at h8
      exact hU.2 (by omega)
    · subst hb
      change (2 * a - 1) * (2 * a - 1) + 3 * 1 = 8 at h8
      exact hU.1 (by omega)

/-- Exact power `ω^(k mod 3)` inside `ℤ[ω]`. -/
def omegaPow3 (k : Nat) : Eis :=
  match k % 3 with
  | 0 => Eis.one
  | 1 => Eis.omega
  | _ => Eis.omega2

/-- `E-QTM-0204` Step 1 (`2 U_1 = (2 C) ⊗ I_3` on `path(2) ⊗ role(3)`, index `3 * path + role`). -/
def splitterU1_2 : Mat6Eis :=
  fun i j =>
    let pi := i.val / 3
    let ri := i.val % 3
    let pj := j.val / 3
    let rj := j.val % 3
    if ri = rj then
      if pi = pj then ⟨1, 1⟩ else ⟨1, -1⟩
    else
      Eis.zero

/-- `E-QTM-0204` Step 2 (`3 U_2 = diag(3 I_3, 3 Z_3 F_3)` in `Σ(648)`, where `3 / (i √3) = -1 - 2ω`). -/
def splitterU2_3 : Mat6Eis :=
  fun i j =>
    let pi := i.val / 3
    let ri := i.val % 3
    let pj := j.val / 3
    let rj := j.val % 3
    if pi = 0 ∧ pj = 0 then
      if ri = rj then Eis.ofInt 3 else Eis.zero
    else if pi = 1 ∧ pj = 1 then
      Eis.mul ⟨-1, -2⟩ (omegaPow3 (ri * (rj + 1)))
    else
      Eis.zero

/-- `E-QTM-0204` Step 3 (`U_3 =` controlled swap `|1, 0⟩` (index 3) `↔` `|0, 1⟩` (index 1)). -/
def splitterU3 : Mat6Eis :=
  fun i j =>
    let target : Nat :=
      if j.val = 1 then 3
      else if j.val = 3 then 1
      else j.val
    if i.val = target then Eis.one else Eis.zero

/-- Composite `E-QTM-0204` `6 × 6` beamsplitter `6 U_tot = U_3 * (3 U_2) * (2 U_1)` in `ℤ[ω]`. -/
def splitterUtot_6 : Mat6Eis :=
  mat6Mul splitterU3 (mat6Mul splitterU2_3 splitterU1_2)

/-- Explicit entry-by-entry form of `6 U_tot` (proven equal to `splitterUtot_6`, accelerating kernel reduction). -/
def splitterUtotExplicit : Mat6Eis :=
  fun i j =>
    match i.val, j.val with
    | 0, 0 => ⟨3, 3⟩   | 0, 3 => ⟨3, -3⟩
    | 1, 0 => ⟨-3, -3⟩ | 1, 1 => ⟨-3, -3⟩ | 1, 2 => ⟨-3, -3⟩
    | 1, 3 => ⟨1, -1⟩  | 1, 4 => ⟨1, -1⟩  | 1, 5 => ⟨1, -1⟩
    | 2, 2 => ⟨3, 3⟩   | 2, 5 => ⟨3, -3⟩
    | 3, 1 => ⟨3, 3⟩   | 3, 4 => ⟨3, -3⟩
    | 4, 0 => ⟨3, 0⟩   | 4, 1 => ⟨0, 3⟩   | 4, 2 => ⟨-3, -3⟩
    | 4, 3 => ⟨1, 2⟩   | 4, 4 => ⟨-2, -1⟩ | 4, 5 => ⟨1, -1⟩
    | 5, 0 => ⟨0, 3⟩   | 5, 1 => ⟨3, 0⟩   | 5, 2 => ⟨-3, -3⟩
    | 5, 3 => ⟨-2, -1⟩ | 5, 4 => ⟨1, 2⟩   | 5, 5 => ⟨1, -1⟩
    | _, _ => Eis.zero

private theorem splitterUtot_eq_explicit : splitterUtot_6 = splitterUtotExplicit := by
  funext i j
  revert i j
  decide

/-- Standard computational basis vector `|k⟩` on `Fin 6`. -/
def basisKet6 (k : Fin 6) : Vec6Eis :=
  fun i => if i = k then Eis.one else Eis.zero

/-- Reduced `ℤ[ω][1/2]` output vector `2 U_tot |0, 0⟩ = [1 + ω, -(1 + ω), 0, 0, 1, ω]`. -/
def splitterOutHalf : Vec6Eis :=
  fun i =>
    match i.val with
    | 0 => ⟨1, 1⟩
    | 1 => ⟨-1, -1⟩
    | 4 => ⟨1, 0⟩
    | 5 => ⟨0, 1⟩
    | _ => Eis.zero

/-- Port 0 (indices `0, 1, 2`) and Port 1 (indices `3, 4, 5`) squared norms on `Vec6Eis`. -/
def port0NormSq6 (v : Vec6Eis) : Int :=
  Eis.normSq (v ⟨0, by decide⟩) + Eis.normSq (v ⟨1, by decide⟩) + Eis.normSq (v ⟨2, by decide⟩)

def port1NormSq6 (v : Vec6Eis) : Int :=
  Eis.normSq (v ⟨3, by decide⟩) + Eis.normSq (v ⟨4, by decide⟩) + Eis.normSq (v ⟨5, by decide⟩)

/-- Relative `π` port-phase gate `P_π = diag(I_3, -I_3)` between the two Mach-Zehnder arms. -/
def mzPhasePi : Mat6Eis :=
  fun i j =>
    if i = j then (if i.val < 3 then Eis.one else Eis.ofInt (-1)) else Eis.zero

/-- Exact `6 × 6` `ℤ[ω][1/2]` Mach-Zehnder recombiner `2 V_MZ` satisfying `(2 V_MZ)† (2 V_MZ) = 4 I_6`,
    recombining `U_tot |0,0⟩` cleanly to `|0,0⟩` at `φ = 0` and to `|1,0⟩` at `φ = π`. -/
def mzRecomb2 : Mat6Eis :=
  fun i j =>
    match i.val, j.val with
    | 0, 0 => ⟨0, -1⟩ | 0, 1 => ⟨0, 1⟩  | 0, 4 => ⟨1, 0⟩  | 0, 5 => ⟨-1, -1⟩
    | 1, 0 => ⟨0, -1⟩ | 1, 1 => ⟨0, -1⟩ | 1, 4 => ⟨1, 0⟩  | 1, 5 => ⟨1, 1⟩
    | 2, 2 => ⟨2, 0⟩
    | 3, 0 => ⟨0, -1⟩ | 3, 1 => ⟨0, 1⟩  | 3, 4 => ⟨-1, 0⟩ | 3, 5 => ⟨1, 1⟩
    | 4, 0 => ⟨0, -1⟩ | 4, 1 => ⟨0, -1⟩ | 4, 4 => ⟨-1, 0⟩ | 4, 5 => ⟨-1, -1⟩
    | 5, 3 => ⟨2, 0⟩
    | _, _ => Eis.zero

/-- Exact left & right unitarity of all three `E-QTM-0204` `6 × 6` circuit layers:
    `(2 U_1)† (2 U_1) = 4 I_6`, `(3 U_2)† (3 U_2) = 9 I_6`, and `U_3† U_3 = I_6`. -/
theorem thm_qtm_0204_splitter_layers_unitary :
    (∀ i j : Fin 6, mat6Mul (mat6Dag splitterU1_2) splitterU1_2 i j = mat6Id 4 i j) ∧
    (∀ i j : Fin 6, mat6Mul splitterU1_2 (mat6Dag splitterU1_2) i j = mat6Id 4 i j) ∧
    (∀ i j : Fin 6, mat6Mul (mat6Dag splitterU2_3) splitterU2_3 i j = mat6Id 9 i j) ∧
    (∀ i j : Fin 6, mat6Mul splitterU2_3 (mat6Dag splitterU2_3) i j = mat6Id 9 i j) ∧
    (∀ i j : Fin 6, mat6Mul (mat6Dag splitterU3) splitterU3 i j = mat6Id 1 i j) ∧
    (∀ i j : Fin 6, mat6Mul splitterU3 (mat6Dag splitterU3) i j = mat6Id 1 i j) := by
  decide

/-- Exact left & right unitarity of the composite `6 × 6` `E-QTM-0204` splitter `6 U_tot`:
    `(6 U_tot)† (6 U_tot) = 36 I_6` and `(6 U_tot) (6 U_tot)† = 36 I_6`. -/
theorem thm_qtm_0204_splitter_composite_unitary :
    (∀ i j : Fin 6, mat6Mul (mat6Dag splitterUtot_6) splitterUtot_6 i j = mat6Id 36 i j) ∧
    (∀ i j : Fin 6, mat6Mul splitterUtot_6 (mat6Dag splitterUtot_6) i j = mat6Id 36 i j) := by
  rw [splitterUtot_eq_explicit]
  decide

/-- Exact `(1/2, 1/2)` balanced port splitting of `E-QTM-0204` on single-input launch `|0, 0⟩`:
    `6 U_tot |0, 0⟩` is identically divisible by `3` into `ℤ[ω][1/2]` (`splitterOutHalf`),
    with exact port weights `18/36 = 2/4 = 1/2` on port 0 and `18/36 = 2/4 = 1/2` on port 1. -/
theorem thm_qtm_0204_splitter_balanced_ports :
    let out6 := mat6Vec splitterUtot_6 (basisKet6 ⟨0, by decide⟩)
    (∀ i : Fin 6, out6 i = Eis.scale 3 (splitterOutHalf i)) ∧
    port0NormSq6 out6 = 18 ∧
    port1NormSq6 out6 = 18 ∧
    port0NormSq6 splitterOutHalf = 2 ∧
    port1NormSq6 splitterOutHalf = 2 := by
  dsimp only
  rw [splitterUtot_eq_explicit]
  decide

/-- Exact Mach-Zehnder constructive/destructive recombination on the `6 × 6` `E-QTM-0204` splitter:
    1. Under `U_tot†`: `φ = 0` restores `|0, 0⟩` with exact `(1, 0)` ports (`1296, 0`), while `φ = π`
       gives exact destructive cancellation `⟨0,0| U_tot† P_π U_tot |0,0⟩ = 0` at the input mode.
    2. Under the exact `ℤ[ω][1/2]` `6 × 6` unitary recombiner `V_MZ` (`(2 V_MZ)† (2 V_MZ) = 4 I_6`):
       `φ = 0` recombines to `|0, 0⟩` with exact ports `(1, 0)` (`16, 0`), and
       `φ = π` switches to `|1, 0⟩` with exact ports `(0, 1)` (`0, 16`). -/
theorem thm_qtm_0204_mach_zehnder_recombination :
    let e0 := basisKet6 ⟨0, by decide⟩
    let out6 := mat6Vec splitterUtot_6 e0
    let mzSelf0 := mat6Vec (mat6Dag splitterUtot_6) out6
    let mzSelfPi := mat6Vec (mat6Dag splitterUtot_6) (mat6Vec mzPhasePi out6)
    let mzRecomb0 := mat6Vec mzRecomb2 splitterOutHalf
    let mzRecombPi := mat6Vec mzRecomb2 (mat6Vec mzPhasePi splitterOutHalf)
    (∀ i j : Fin 6, mat6Mul (mat6Dag mzRecomb2) mzRecomb2 i j = mat6Id 4 i j) ∧
    (∀ i j : Fin 6, mat6Mul mzRecomb2 (mat6Dag mzRecomb2) i j = mat6Id 4 i j) ∧
    (port0NormSq6 mzSelf0 = 1296 ∧ port1NormSq6 mzSelf0 = 0) ∧
    (inner6Eis e0 mzSelfPi = Eis.zero) ∧
    (∀ i : Fin 6, mzRecomb0 i = Eis.scale 4 (basisKet6 ⟨0, by decide⟩ i)) ∧
    (port0NormSq6 mzRecomb0 = 16 ∧ port1NormSq6 mzRecomb0 = 0) ∧
    (∀ i : Fin 6, mzRecombPi i = Eis.scale 4 (basisKet6 ⟨3, by decide⟩ i)) ∧
    (port0NormSq6 mzRecombPi = 0 ∧ port1NormSq6 mzRecombPi = 16) := by
  dsimp only
  rw [splitterUtot_eq_explicit]
  decide


/-! ## Section 3: Exact `E-QTM-0205` `36/36` `ℤ_6 × ℤ_6` & `24/24` `S_4` Bipartite Envariance -/

/-- Exact `ℤ_6` phase power `ζ_6^p` for `p : Fin 6`. -/
def zeta6Pow6 (p : Fin 6) : Eis :=
  Eis.pow Eis.zeta6 p.val

/-- Inverse exponent `(-p) mod 6` inside `Fin 6`. -/
def phaseInv6 (p : Fin 6) : Fin 6 :=
  ⟨(6 - p.val) % 6, Nat.mod_lt _ (by decide)⟩

private theorem zeta6Pow6_unit_left (p : Fin 6) :
    Eis.mul (Eis.conj (zeta6Pow6 p)) (zeta6Pow6 p) = Eis.one := by
  revert p; decide

private theorem zeta6Pow6_unit_right (p : Fin 6) :
    Eis.mul (zeta6Pow6 p) (Eis.conj (zeta6Pow6 p)) = Eis.one := by
  revert p; decide

private theorem zeta6Pow6_mul_inv (p : Fin 6) :
    Eis.mul (zeta6Pow6 p) (zeta6Pow6 (phaseInv6 p)) = Eis.one := by
  revert p; decide

/-- Single-beat 2-branch bipartite state `2 |Ψ_2⟩ = (1 + ω) |0, 0⟩ + (1 - ω) |1, 1⟩`
    from `E-QTM-0205` on `H_S^(2) ⊗ H_E^(2)`. -/
def envPsi2 : Fin 2 → Fin 2 → Eis :=
  fun s e =>
    match s.val, e.val with
    | 0, 0 => ⟨1, 1⟩
    | 1, 1 => ⟨1, -1⟩
    | _, _ => Eis.zero

/-- Diagonal `2 × 2` `ℤ_6 × ℤ_6` phase unitary `diag(ζ_6^{p0}, ζ_6^{p1})`. -/
def envPhaseMat2 (p0 p1 : Fin 6) : Mat2F :=
  fun i j =>
    if i = j then
      match i.val with
      | 0 => zeta6Pow6 p0
      | _ => zeta6Pow6 p1
    else
      Eis.zero

private theorem envPhaseMat2_unitary (p0 p1 : Fin 6) :
    (∀ i j : Fin 2, mat2FMul (mat2FDag (envPhaseMat2 p0 p1)) (envPhaseMat2 p0 p1) i j = mat2FId 1 i j) ∧
    (∀ i j : Fin 2, mat2FMul (envPhaseMat2 p0 p1) (mat2FDag (envPhaseMat2 p0 p1)) i j = mat2FId 1 i j) := by
  constructor
  · intro i j
    match i, j with
    | ⟨0, _⟩, ⟨0, _⟩ =>
      simp [mat2FMul, mat2FDag, envPhaseMat2, mat2FId, sum2Eis, qEis_conj_zero, qEis_mul_zero,
        qEis_add_zero, zeta6Pow6_unit_left, qEis_ofInt_one]
    | ⟨1, _⟩, ⟨1, _⟩ =>
      simp [mat2FMul, mat2FDag, envPhaseMat2, mat2FId, sum2Eis, qEis_conj_zero, qEis_mul_zero,
        qEis_zero_add, zeta6Pow6_unit_left, qEis_ofInt_one]
    | ⟨0, _⟩, ⟨1, _⟩ | ⟨1, _⟩, ⟨0, _⟩ =>
      simp [mat2FMul, mat2FDag, envPhaseMat2, mat2FId, sum2Eis, qEis_conj_zero, qEis_mul_zero,
        qEis_zero_mul, qEis_add_zero]
  · intro i j
    match i, j with
    | ⟨0, _⟩, ⟨0, _⟩ =>
      simp [mat2FMul, mat2FDag, envPhaseMat2, mat2FId, sum2Eis, qEis_conj_zero, qEis_mul_zero,
        qEis_add_zero, zeta6Pow6_unit_right, qEis_ofInt_one]
    | ⟨1, _⟩, ⟨1, _⟩ =>
      simp [mat2FMul, mat2FDag, envPhaseMat2, mat2FId, sum2Eis, qEis_conj_zero, qEis_mul_zero,
        qEis_zero_add, zeta6Pow6_unit_right, qEis_ofInt_one]
    | ⟨0, _⟩, ⟨1, _⟩ | ⟨1, _⟩, ⟨0, _⟩ =>
      simp [mat2FMul, mat2FDag, envPhaseMat2, mat2FId, sum2Eis, qEis_conj_zero, qEis_mul_zero,
        qEis_zero_mul, qEis_add_zero]

/-- Exact `E-QTM-0205` `36/36` `ℤ_6 × ℤ_6` phase envariance on `|Ψ_2⟩`:
    1. Single-beat Schmidt weights are exact `(1/4, 3/4)` (`normSq = 1, 3`, total `4`),
    2. For ALL `p0, p1 : Fin 6` (all `36` elements of `ℤ_6 × ℤ_6`), `U_S(p0, p1)` and
       `U_E(-p0, -p1)` are exact `2 × 2` unitaries AND `(U_S ⊗ U_E) |Ψ_2⟩ = |Ψ_2⟩` entry-by-entry. -/
theorem thm_qtm_0205_psi2_schmidt_and_z6x6_envariance :
    Eis.normSq (envPsi2 ⟨0, by decide⟩ ⟨0, by decide⟩) = 1 ∧
    Eis.normSq (envPsi2 ⟨1, by decide⟩ ⟨1, by decide⟩) = 3 ∧
    ∀ p0 p1 : Fin 6,
      let uS := envPhaseMat2 p0 p1
      let uE := envPhaseMat2 (phaseInv6 p0) (phaseInv6 p1)
      (∀ i j : Fin 2, mat2FMul (mat2FDag uS) uS i j = mat2FId 1 i j) ∧
      (∀ i j : Fin 2, mat2FMul (mat2FDag uE) uE i j = mat2FId 1 i j) ∧
      (∀ s e : Fin 2, bipartiteApply2 uS uE envPsi2 s e = envPsi2 s e) := by
  refine ⟨by decide, by decide, ?_⟩
  intro p0 p1
  dsimp only
  refine ⟨(envPhaseMat2_unitary p0 p1).1,
          (envPhaseMat2_unitary (phaseInv6 p0) (phaseInv6 p1)).1, ?_⟩
  intro s e
  match s, e with
  | ⟨0, _⟩, ⟨0, _⟩ =>
    simp [bipartiteApply2, envPhaseMat2, envPsi2, sum2Eis,
      qEis_mul_zero, qEis_zero_mul, qEis_add_zero, qEis_zero_add, zeta6Pow6_mul_inv, qEis_one_mul]
  | ⟨1, _⟩, ⟨1, _⟩ =>
    simp [bipartiteApply2, envPhaseMat2, envPsi2, sum2Eis,
      qEis_mul_zero, qEis_zero_mul, qEis_add_zero, qEis_zero_add, zeta6Pow6_mul_inv, qEis_one_mul]
  | ⟨0, _⟩, ⟨1, _⟩ | ⟨1, _⟩, ⟨0, _⟩ =>
    simp [bipartiteApply2, envPhaseMat2, envPsi2, sum2Eis,
      qEis_mul_zero, qEis_zero_mul, qEis_add_zero, qEis_zero_add]

/-- Initial 2-branch bipartite state embedded into `H_S^(6) ⊗ H_E^(6)` at `role = 0` (`den = 2`). -/
def envPsi6Init : Fin 6 → Fin 6 → Eis :=
  fun s e =>
    match s.val, e.val with
    | 0, 0 => ⟨1, 1⟩
    | 3, 3 => ⟨1, -1⟩
    | _, _ => Eis.zero

/-- Controlled environment-role copy `U_copy` from `E-QTM-0205`:
    on `(sPath = 1, ePath = 1)`, shifts `eRole' = (eRole + sRole) mod 3` (inverse `(eRole + 3 - sRole) mod 3`). -/
def envApplyCopyRole (psi : Fin 6 → Fin 6 → Eis) : Fin 6 → Fin 6 → Eis :=
  fun s e =>
    let prevERole : Nat :=
      if s.val / 3 = 1 ∧ e.val / 3 = 1 then (e.val % 3 + 3 - s.val % 3) % 3 else e.val % 3
    have hPrev : prevERole < 3 := by
      show (if s.val / 3 = 1 ∧ e.val / 3 = 1 then (e.val % 3 + 3 - s.val % 3) % 3 else e.val % 3) < 3
      split <;> omega
    have he : e.val < 6 := e.isLt
    psi s ⟨(e.val / 3) * 3 + prevERole, by omega⟩

/-- Fine-grained 36-component state `6 |Ψ_4⟩ = U_copy (3 U_2 ⊗ I_6) (2 |Ψ_2⟩)` over `ℤ[ω]`. -/
def envPsi4Scaled6 : Fin 6 → Fin 6 → Eis :=
  envApplyCopyRole (bipartiteApply6 splitterU2_3 (mat6Id 1) envPsi6Init)

/-- Diagonal Schmidt amplitudes of the reduced `ℤ[ω][1/2]` 4-branch state `2 |Ψ_4⟩`:
    `[1 + ω, 0, 0, -(1 + ω), 1, ω]` (active indices `{0, 3, 4, 5}`, all squared norm `1`). -/
def envPsi4Diag : Fin 6 → Eis :=
  fun s =>
    match s.val with
    | 0 => ⟨1, 1⟩
    | 3 => ⟨-1, -1⟩
    | 4 => ⟨1, 0⟩
    | 5 => ⟨0, 1⟩
    | _ => Eis.zero

/-- Reduced `ℤ[ω][1/2]` 36-component bipartite state `2 |Ψ_4⟩ = ∑_{s ∈ {0,3,4,5}} a_s |s⟩_S |s⟩_E`. -/
def envPsi4 : Fin 6 → Fin 6 → Eis :=
  fun s e => if s = e then envPsi4Diag s else Eis.zero

/-- Active-index predicate on `Fin 6`: `s ∈ {0, 3, 4, 5}` (1 keep branch `0`, 3 cross branches `3, 4, 5`). -/
def isActiveBranch6 (s : Fin 6) : Bool :=
  s.val == 0 || s.val == 3 || s.val == 4 || s.val == 5

private theorem envPsi4Diag_active_unit (s : Fin 6) (h : isActiveBranch6 s = true) :
    Eis.mul (Eis.conj (envPsi4Diag s)) (envPsi4Diag s) = Eis.one := by
  revert s h; decide

private theorem envPsi4Diag_active_unit_right (s : Fin 6) (h : isActiveBranch6 s = true) :
    Eis.mul (envPsi4Diag s) (Eis.conj (envPsi4Diag s)) = Eis.one := by
  revert s h; decide

private theorem envPsi4Diag_inactive_zero (s : Fin 6) (h : isActiveBranch6 s = false) :
    envPsi4Diag s = Eis.zero := by
  revert s h; decide

/-- Exact `E-QTM-0205` `Σ(648)` qutrit fine-graining theorem:
    1. Eisenstein collapse identity `(-1 - 2ω)(1 - ω) = -3(1 + ω)`,
    2. `envPsi4Scaled6` is identically divisible by `3` into `envPsi4` (`ℤ[ω][1/2]`),
    3. All 4 active Schmidt branches `{0, 3, 4, 5}` (1 keep + 3 cross) have exact equal squared norm `1`
       (`1/4` each, total `4`), linking equal-branch counts `(1, 3)` to `(1/4, 3/4)`. -/
theorem thm_qtm_0205_fine_graining_to_psi4 :
    Eis.mul ⟨-1, -2⟩ ⟨1, -1⟩ = Eis.scale (-3) Eis.zeta6 ∧
    (∀ s e : Fin 6, envPsi4Scaled6 s e = Eis.scale 3 (envPsi4 s e)) ∧
    (∀ s : Fin 6, isActiveBranch6 s = true → Eis.normSq (envPsi4Diag s) = 1) ∧
    (∀ s : Fin 6, isActiveBranch6 s = false → envPsi4Diag s = Eis.zero) ∧
    (Eis.normSq (envPsi4Diag ⟨0, by decide⟩) +
     Eis.normSq (envPsi4Diag ⟨3, by decide⟩) +
     Eis.normSq (envPsi4Diag ⟨4, by decide⟩) +
     Eis.normSq (envPsi4Diag ⟨5, by decide⟩) = 4) := by
  decide

/-- Phase factor `amp[f j] * conj(amp[j])` on active branches (and `1` on inactive `{1, 2}`). -/
def envSwapPhase (f : Fin 6 → Fin 6) (j : Fin 6) : Eis :=
  match isActiveBranch6 j with
  | true => Eis.mul (envPsi4Diag (f j)) (Eis.conj (envPsi4Diag j))
  | false => Eis.one

/-- Explicit `6 × 6` system swap unitary `U_S(f) : |j⟩ ↦ |f j⟩` over `ℤ[ω]`. -/
def envSwapUS (f : Fin 6 → Fin 6) : Mat6Eis :=
  fun i j => if i = f j then Eis.one else Eis.zero

/-- Explicit `6 × 6` environment swap-and-phase unitary `U_E(f) : |j⟩ ↦ phase(f, j) |f j⟩` over `ℤ[ω]`. -/
def envSwapUE (f : Fin 6 → Fin 6) : Mat6Eis :=
  fun i j => if i = f j then envSwapPhase f j else Eis.zero

private theorem envSwapPhase_unit_left (f : Fin 6 → Fin 6)
    (hAct : ∀ x : Fin 6, isActiveBranch6 (f x) = isActiveBranch6 x) (j : Fin 6) :
    Eis.mul (Eis.conj (envSwapPhase f j)) (envSwapPhase f j) = Eis.one := by
  unfold envSwapPhase
  cases hj : isActiveBranch6 j with
  | false =>
    simp only [qEis_conj_one, qEis_one_mul]
  | true =>
    have hfj : isActiveBranch6 (f j) = true := by rw [hAct j, hj]
    simp only [qEis_conj_mul, qEis_conj_conj]
    calc
      Eis.mul (Eis.mul (Eis.conj (envPsi4Diag (f j))) (envPsi4Diag j))
              (Eis.mul (envPsi4Diag (f j)) (Eis.conj (envPsi4Diag j)))
          = Eis.mul (Eis.mul (Eis.conj (envPsi4Diag (f j))) (envPsi4Diag (f j)))
                    (Eis.mul (envPsi4Diag j) (Eis.conj (envPsi4Diag j))) := by
              rw [qEis_mul_assoc, ← qEis_mul_assoc (envPsi4Diag j) (envPsi4Diag (f j)),
                  qEis_mul_comm (envPsi4Diag j) (envPsi4Diag (f j)),
                  qEis_mul_assoc (envPsi4Diag (f j)) (envPsi4Diag j), ← qEis_mul_assoc]
      _ = Eis.mul Eis.one Eis.one := by
              rw [envPsi4Diag_active_unit (f j) hfj, envPsi4Diag_active_unit_right j hj]
      _ = Eis.one := qEis_one_mul Eis.one

private theorem envSwapPhase_unit_right (f : Fin 6 → Fin 6)
    (hAct : ∀ x : Fin 6, isActiveBranch6 (f x) = isActiveBranch6 x) (j : Fin 6) :
    Eis.mul (envSwapPhase f j) (Eis.conj (envSwapPhase f j)) = Eis.one := by
  rw [qEis_mul_comm]
  exact envSwapPhase_unit_left f hAct j

private theorem envSwapPhase_mul_diag (f : Fin 6 → Fin 6)
    (hAct : ∀ x : Fin 6, isActiveBranch6 (f x) = isActiveBranch6 x) (j : Fin 6) :
    Eis.mul (envSwapPhase f j) (envPsi4Diag j) = envPsi4Diag (f j) := by
  unfold envSwapPhase
  cases hj : isActiveBranch6 j with
  | false =>
    have hfj : isActiveBranch6 (f j) = false := by rw [hAct j, hj]
    simp only [qEis_one_mul]
    rw [envPsi4Diag_inactive_zero j hj, envPsi4Diag_inactive_zero (f j) hfj]
  | true =>
    rw [qEis_mul_assoc, envPsi4Diag_active_unit j hj, qEis_mul_one]

/-- General symbolic `S_4` envariance theorem on `|Ψ_4⟩`:
    for ANY bijection `(f, fInv)` on `Fin 6` preserving the active 4-branch support `{0, 3, 4, 5}`,
    `U_S(f)` and `U_E(f)` are exact `6 × 6` unitaries (left & right) over `ℤ[ω]` AND
    `(U_S(f) ⊗ U_E(f)) |Ψ_4⟩ = |Ψ_4⟩` entry-by-entry across all 36 components. -/
theorem thm_qtm_0205_s4_envariance_general (f fInv : Fin 6 → Fin 6)
    (hL : ∀ x : Fin 6, fInv (f x) = x) (hR : ∀ x : Fin 6, f (fInv x) = x)
    (hAct : ∀ x : Fin 6, isActiveBranch6 (f x) = isActiveBranch6 x) :
    (∀ i j : Fin 6, mat6Mul (mat6Dag (envSwapUS f)) (envSwapUS f) i j = mat6Id 1 i j) ∧
    (∀ i j : Fin 6, mat6Mul (envSwapUS f) (mat6Dag (envSwapUS f)) i j = mat6Id 1 i j) ∧
    (∀ i j : Fin 6, mat6Mul (mat6Dag (envSwapUE f)) (envSwapUE f) i j = mat6Id 1 i j) ∧
    (∀ i j : Fin 6, mat6Mul (envSwapUE f) (mat6Dag (envSwapUE f)) i j = mat6Id 1 i j) ∧
    (∀ s e : Fin 6, bipartiteApply6 (envSwapUS f) (envSwapUE f) envPsi4 s e = envPsi4 s e) := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · -- U_S† U_S = I
    intro i j
    unfold mat6Mul mat6Dag envSwapUS mat6Id
    have hTerm : (fun k => Eis.mul (Eis.conj (if k = f i then Eis.one else Eis.zero))
                                   (if k = f j then Eis.one else Eis.zero)) =
        (fun k => if k = f i then (if k = f j then Eis.one else Eis.zero) else Eis.zero) := by
      funext k
      if hk : k = f i then
        rw [if_pos hk, qEis_conj_one, qEis_one_mul]
      else
        rw [if_neg hk, qEis_conj_zero, qEis_zero_mul]
    rw [hTerm, sum6Eis_delta]
    if hij : i = j then
      rw [hij, if_pos rfl, if_pos rfl]
      rfl
    else
      have hne : f i ≠ f j := fun h => hij (by rw [← hL i, h, hL j])
      rw [if_neg hne, if_neg hij]
  · -- U_S U_S† = I
    intro i j
    unfold mat6Mul mat6Dag envSwapUS mat6Id
    have hTerm : (fun k => Eis.mul (if i = f k then Eis.one else Eis.zero)
                                   (Eis.conj (if j = f k then Eis.one else Eis.zero))) =
        (fun k => if i = f k then (if j = f k then Eis.one else Eis.zero) else Eis.zero) := by
      funext k
      if hjk : j = f k then
        rw [if_pos hjk, qEis_conj_one]
        if hik : i = f k then
          rw [if_pos hik, qEis_one_mul]
        else
          rw [if_neg hik, qEis_zero_mul]
      else
        rw [if_neg hjk, qEis_conj_zero, qEis_mul_zero]
        if hik : i = f k then rw [if_pos hik] else rw [if_neg hik]
    rw [hTerm, sum6Eis_bij_delta f fInv hL hR i, hR i]
    if hij : i = j then
      rw [hij, if_pos rfl, if_pos rfl]
      rfl
    else
      have hne : j ≠ i := fun h => hij h.symm
      rw [if_neg hne, if_neg hij]
  · -- U_E† U_E = I
    intro i j
    unfold mat6Mul mat6Dag envSwapUE mat6Id
    have hTerm : (fun k => Eis.mul (Eis.conj (if k = f i then envSwapPhase f i else Eis.zero))
                                   (if k = f j then envSwapPhase f j else Eis.zero)) =
        (fun k => if k = f i then
          (if k = f j then Eis.mul (Eis.conj (envSwapPhase f i)) (envSwapPhase f j) else Eis.zero)
          else Eis.zero) := by
      funext k
      if hk : k = f i then
        rw [if_pos hk]
        if hkj : k = f j then
          rw [if_pos hkj]
        else
          rw [if_neg hkj, qEis_mul_zero]
      else
        rw [if_neg hk, qEis_conj_zero, qEis_zero_mul]
    rw [hTerm, sum6Eis_delta]
    if hij : i = j then
      rw [hij, if_pos rfl, if_pos rfl, envSwapPhase_unit_left f hAct j]
      rfl
    else
      have hne : f i ≠ f j := fun h => hij (by rw [← hL i, h, hL j])
      rw [if_neg hne, if_neg hij]
  · -- U_E U_E† = I
    intro i j
    unfold mat6Mul mat6Dag envSwapUE mat6Id
    have hTerm : (fun k => Eis.mul (if i = f k then envSwapPhase f k else Eis.zero)
                                   (Eis.conj (if j = f k then envSwapPhase f k else Eis.zero))) =
        (fun k => if i = f k then
          (if j = f k then Eis.mul (envSwapPhase f k) (Eis.conj (envSwapPhase f k)) else Eis.zero)
          else Eis.zero) := by
      funext k
      if hik : i = f k then
        rw [if_pos hik]
        if hjk : j = f k then
          rw [if_pos hjk]
        else
          rw [if_neg hjk, qEis_conj_zero, qEis_mul_zero]
      else
        rw [if_neg hik, qEis_zero_mul]
    rw [hTerm, sum6Eis_bij_delta f fInv hL hR i, hR i]
    if hij : i = j then
      rw [hij, if_pos rfl, if_pos rfl, envSwapPhase_unit_right f hAct (fInv j)]
      rfl
    else
      have hne : j ≠ i := fun h => hij h.symm
      rw [if_neg hne, if_neg hij]
  · -- (U_S ⊗ U_E) |Ψ_4⟩ = |Ψ_4⟩
    intro s e
    unfold bipartiteApply6 envSwapUS envSwapUE
    have hInner : ∀ s' : Fin 6,
        sum6Eis (fun e' =>
          Eis.mul (Eis.mul (if s = f s' then Eis.one else Eis.zero)
                           (if e = f e' then envSwapPhase f e' else Eis.zero))
                  (envPsi4 s' e')) =
        if s = f s' then Eis.mul (envSwapPhase f (fInv e)) (envPsi4 s' (fInv e)) else Eis.zero := by
      intro s'
      if hs : s = f s' then
        rw [if_pos hs]
        have hF : (fun e' =>
            Eis.mul (Eis.mul Eis.one (if e = f e' then envSwapPhase f e' else Eis.zero))
                    (envPsi4 s' e')) =
            (fun e' => if e = f e' then Eis.mul (envSwapPhase f e') (envPsi4 s' e') else Eis.zero) := by
          funext e'
          rw [qEis_one_mul]
          if he : e = f e' then
            rw [if_pos he]
          else
            rw [if_neg he, qEis_zero_mul]
        rw [hF, sum6Eis_bij_delta f fInv hL hR e]
      else
        rw [if_neg hs]
        have hF : (fun e' =>
            Eis.mul (Eis.mul Eis.zero (if e = f e' then envSwapPhase f e' else Eis.zero))
                    (envPsi4 s' e')) = (fun _ => Eis.zero) := by
          funext e'
          rw [qEis_zero_mul, qEis_zero_mul]
        rw [hF]
        decide
    have hOuter :
        sum6Eis (fun s' =>
          sum6Eis (fun e' =>
            Eis.mul (Eis.mul (if s = f s' then Eis.one else Eis.zero)
                             (if e = f e' then envSwapPhase f e' else Eis.zero))
                    (envPsi4 s' e'))) =
        Eis.mul (envSwapPhase f (fInv e)) (envPsi4 (fInv s) (fInv e)) := by
      have hEq : (fun s' =>
          sum6Eis (fun e' =>
            Eis.mul (Eis.mul (if s = f s' then Eis.one else Eis.zero)
                             (if e = f e' then envSwapPhase f e' else Eis.zero))
                    (envPsi4 s' e'))) =
          (fun s' => if s = f s' then Eis.mul (envSwapPhase f (fInv e)) (envPsi4 s' (fInv e))
                     else Eis.zero) :=
        funext hInner
      rw [hEq, sum6Eis_bij_delta f fInv hL hR s]
    rw [hOuter]
    unfold envPsi4
    if hse : s = e then
      rw [hse, if_pos rfl, if_pos rfl, envSwapPhase_mul_diag f hAct (fInv e), hR e]
    else
      have hne : fInv s ≠ fInv e := fun h => hse (by rw [← hR s, h, hR e])
      rw [if_neg hne, if_neg hse, qEis_mul_zero]

/-- Explicit list of all `4! = 24` permutations of `Fin 4` as 4-tuples `(π(0), π(1), π(2), π(3))`. -/
def s4Perms : List (Fin 4 × Fin 4 × Fin 4 × Fin 4) :=
  [ (⟨0, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨3, by decide⟩),
    (⟨0, by decide⟩, ⟨1, by decide⟩, ⟨3, by decide⟩, ⟨2, by decide⟩),
    (⟨0, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩, ⟨3, by decide⟩),
    (⟨0, by decide⟩, ⟨2, by decide⟩, ⟨3, by decide⟩, ⟨1, by decide⟩),
    (⟨0, by decide⟩, ⟨3, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩),
    (⟨0, by decide⟩, ⟨3, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩),
    (⟨1, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩, ⟨3, by decide⟩),
    (⟨1, by decide⟩, ⟨0, by decide⟩, ⟨3, by decide⟩, ⟨2, by decide⟩),
    (⟨1, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩, ⟨3, by decide⟩),
    (⟨1, by decide⟩, ⟨2, by decide⟩, ⟨3, by decide⟩, ⟨0, by decide⟩),
    (⟨1, by decide⟩, ⟨3, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩),
    (⟨1, by decide⟩, ⟨3, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩),
    (⟨2, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩, ⟨3, by decide⟩),
    (⟨2, by decide⟩, ⟨0, by decide⟩, ⟨3, by decide⟩, ⟨1, by decide⟩),
    (⟨2, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩, ⟨3, by decide⟩),
    (⟨2, by decide⟩, ⟨1, by decide⟩, ⟨3, by decide⟩, ⟨0, by decide⟩),
    (⟨2, by decide⟩, ⟨3, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩),
    (⟨2, by decide⟩, ⟨3, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩),
    (⟨3, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩),
    (⟨3, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩),
    (⟨3, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩, ⟨2, by decide⟩),
    (⟨3, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩),
    (⟨3, by decide⟩, ⟨2, by decide⟩, ⟨0, by decide⟩, ⟨1, by decide⟩),
    (⟨3, by decide⟩, ⟨2, by decide⟩, ⟨1, by decide⟩, ⟨0, by decide⟩) ]

/-- Map a branch slot `j : Fin 4` to its active `Fin 6` index `{0, 3, 4, 5}`. -/
def activeIdx6 (j : Fin 4) : Fin 6 :=
  match j.val with
  | 0 => ⟨0, by decide⟩
  | 1 => ⟨3, by decide⟩
  | 2 => ⟨4, by decide⟩
  | _ => ⟨5, by decide⟩

/-- Evaluate a permutation tuple `p ∈ s4Perms` on `Fin 4`. -/
def applyS4Tuple (p : Fin 4 × Fin 4 × Fin 4 × Fin 4) (j : Fin 4) : Fin 4 :=
  match j.val with
  | 0 => p.1
  | 1 => p.2.1
  | 2 => p.2.2.1
  | _ => p.2.2.2

/-- Lift a permutation tuple `p ∈ s4Perms` to a map `Fin 6 → Fin 6` fixing inactive `{1, 2}`. -/
def liftS4To6 (p : Fin 4 × Fin 4 × Fin 4 × Fin 4) (x : Fin 6) : Fin 6 :=
  match x.val with
  | 0 => activeIdx6 (applyS4Tuple p ⟨0, by decide⟩)
  | 3 => activeIdx6 (applyS4Tuple p ⟨1, by decide⟩)
  | 4 => activeIdx6 (applyS4Tuple p ⟨2, by decide⟩)
  | 5 => activeIdx6 (applyS4Tuple p ⟨3, by decide⟩)
  | _ => x

/-- Explicit inverse of `liftS4To6 p` on `Fin 6`. -/
def liftS4Inv6 (p : Fin 4 × Fin 4 × Fin 4 × Fin 4) (y : Fin 6) : Fin 6 :=
  if liftS4To6 p ⟨0, by decide⟩ = y then ⟨0, by decide⟩
  else if liftS4To6 p ⟨3, by decide⟩ = y then ⟨3, by decide⟩
  else if liftS4To6 p ⟨4, by decide⟩ = y then ⟨4, by decide⟩
  else if liftS4To6 p ⟨5, by decide⟩ = y then ⟨5, by decide⟩
  else y

private theorem s4Perms_all_bijections :
    ∀ p ∈ s4Perms,
      (∀ x : Fin 6, liftS4Inv6 p (liftS4To6 p x) = x) ∧
      (∀ x : Fin 6, liftS4To6 p (liftS4Inv6 p x) = x) ∧
      (∀ x : Fin 6, isActiveBranch6 (liftS4To6 p x) = isActiveBranch6 x) := by
  decide

/-- Exact `E-QTM-0205` `24/24` `S_4` bipartite swap-and-phase envariance certificate:
    all 24 distinct permutations `π ∈ S_4` lift to exact `6 × 6` unitary pairs `(U_S(π), U_E(π))`
    over `ℤ[ω]` satisfying `(U_S(π) ⊗ U_E(π)) |Ψ_4⟩ = |Ψ_4⟩` across all 36 components. -/
theorem thm_qtm_0205_s4_all_24_permutations :
    s4Perms.length = 24 ∧
    s4Perms.Nodup ∧
    ∀ p ∈ s4Perms,
      let f := liftS4To6 p
      (∀ i j : Fin 6, mat6Mul (mat6Dag (envSwapUS f)) (envSwapUS f) i j = mat6Id 1 i j) ∧
      (∀ i j : Fin 6, mat6Mul (mat6Dag (envSwapUE f)) (envSwapUE f) i j = mat6Id 1 i j) ∧
      (∀ s e : Fin 6, bipartiteApply6 (envSwapUS f) (envSwapUE f) envPsi4 s e = envPsi4 s e) := by
  refine ⟨by decide, by decide, ?_⟩
  intro p hp
  have hBij := s4Perms_all_bijections p hp
  have hEnv := thm_qtm_0205_s4_envariance_general (liftS4To6 p) (liftS4Inv6 p)
    hBij.1 hBij.2.1 hBij.2.2
  exact ⟨hEnv.1, hEnv.2.2.1, hEnv.2.2.2.2⟩

/-- Canonical 4-branch equal-modulus Schmidt state `2 |Ψ_4^{red}⟩` on `H_S^(4) ⊗ H_E^(4)`. -/
def envPsi4Red : Fin 4 → Fin 4 → Eis :=
  fun s e => if s = e then envPsi4Diag (activeIdx6 s) else Eis.zero

/-- Exact reduced density matrix `ρ_S = Tr_E |Ψ⟩⟨Ψ|` is scalar proportional to identity:
    1. On the 4-branch canonical state `|Ψ_4^{red}⟩`: `4 ρ_S = I_4` (exact equal weight `1/4`
       on all 4 branches, zero off-diagonal coherence).
    2. On the 6-dim embedded state `|Ψ_4⟩`: `4 ρ_S = diag(1, 0, 0, 1, 1, 1)` (equal weight `1/4`
       on each active branch, with port traces `Tr_{keep}(4 ρ_S) = 1` and `Tr_{cross}(4 ρ_S) = 3`). -/
theorem thm_qtm_0205_reduced_density_matrix_scalar :
    (∀ i j : Fin 4, reducedRhoS4 envPsi4Red i j = if i = j then Eis.one else Eis.zero) ∧
    (∀ i j : Fin 6, reducedRhoS6 envPsi4 i j =
      if i = j ∧ isActiveBranch6 i = true then Eis.one else Eis.zero) ∧
    (Eis.add (Eis.add (reducedRhoS6 envPsi4 ⟨0, by decide⟩ ⟨0, by decide⟩)
                      (reducedRhoS6 envPsi4 ⟨1, by decide⟩ ⟨1, by decide⟩))
             (reducedRhoS6 envPsi4 ⟨2, by decide⟩ ⟨2, by decide⟩) = Eis.ofInt 1) ∧
    (Eis.add (Eis.add (reducedRhoS6 envPsi4 ⟨3, by decide⟩ ⟨3, by decide⟩)
                      (reducedRhoS6 envPsi4 ⟨4, by decide⟩ ⟨4, by decide⟩))
             (reducedRhoS6 envPsi4 ⟨5, by decide⟩ ⟨5, by decide⟩) = Eis.ofInt 3) := by
  decide

end Vibe
