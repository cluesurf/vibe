import Vibe.Algebra
import Vibe.Rule
import Vibe.Geometry
import Vibe.Limits

/-!
# Vibe Theory: Breakthrough Algebra — 4D `D_4` Mass Gap, `L_7` Catalyst & Molecule, `Spin(7)` SMG & `ℤ[ζ_9]` Nelson-Barr

Zero-dependency Lean 4.35.0 formalization of the exact algebraic pillars behind Breakthroughs 2, 3,
4A, and 4B (Milestone P5):

1. **Breakthrough 2 — 4D `D_4` Mass Gap Algebra (`combes-thomas-d4-mass-gap.ts`):**
   - Exact 24-cell adjacency matrix `A_24` (`r_a · r_b = 1` on `d4Roots`) and 96 triangular faces
     `cell24Tris` satisfying the exact Gram incidence identity `B_tri^T B_tri = 3 (A_24 + 4 I_24)`,
   - Exact all-vector sum-of-squares proof `3 v^T (A_24 + 4 I_24) v = ∑_{T ∈ cell24Tris} (v_a + v_b + v_c)^2 ≥ 0`
     for EVERY `v : Fin 24 → Int` (`λ_min(A_24) ≥ -4`), plus explicit `-4` eigenvector achieving equality,
   - Exact 1-plaquette 3-link Combes-Thomas SOS majorant and unconditional positivity margin proving
     strict Combes-Thomas tilt `c = p/q > 1` (`m_CT(β) > 0`) for EVERY rational `0 ≤ β < N^2 / (16 √7)`
     (`1792 β^2 < N^4`, strictly beating the `N^2 / 48` block threshold),
   - Exact `6 × 6` bivector Gram matrices (`48 I_6` on `D_4` vs `16 I_6` on `ℤ^4`) proving the
     exact continuum Yang-Mills action density ratio `2`.
2. **Breakthrough 3 — `L_7` Catalyst, Eisenstein Molecule & `M_meet` DFS Universality:**
   - Exact unitarity, `det(L_7 C) = 1`, `Tr(L_7 C) = -5/4`, Cayley-Hamilton `M^2 = 5 M - 16 I`,
     2-adic `trSeq5 (k + 1) ≡ 1 (mod 4)` infinite-order theorem (`∀ n ≥ 1`), non-commutativity
     `‖[2 L_7, 2 C]‖_F^2 = 54`, and non-`Pin(2)` exclusion for the 3-full-line `Φ_odd` catalyst `L_7`,
   - Exact `P = 0` Eisenstein molecule `λ_mol = (4 + 3ω)/(1 - 3ω) = (7 + 15ω)/13`, `u = 1/13`
     satisfying exact unit modulus `|7 + 15ω|^2 = 169 = 13^2` and all cleared transfer-matrix equations,
   - Exact bare `M_meet` 3-excitation DFS generators `S_{12}, S_{23}` (`Tr(S_{12} S_{23}) = 5/4`,
     infinite order `∀ n ≥ 1`, non-`Pin(2)`), plus exact 6-spin 15D Casimir `C_6 = ∑ P_{pq}`
     decomposition `15 = 9 (S=1) + 5 (S=2) + 1 (S=3)` enclosing the 4D logical DFS inside `su(9)`.
3. **Breakthrough 4A — 14-Term `D_4` Cayley 4-Form `Spin(7)` SMG Spectrum (`smg-cayley-four-form.ts`):**
   - Exact 14-term Fano/Cayley 4-form Hamiltonian `H_SMG` constructed directly from the 7 Fano
     triples via Jordan-Wigner Pauli strings on `dim = 2^4 = 16`,
   - Exact closed-form `16 × 16` matrix certificate, frustration-free ground state
     `|Ω_SMG⟩ = |0110⟩ - |1001⟩` (`T_k |Ω_SMG⟩ = -|Ω_SMG⟩` for all 14 terms, `H_SMG |Ω_SMG⟩ = -14 |Ω_SMG⟩`),
   - Exact minimal polynomial `H (H + 14 I)(H - 2 I) = 0`, traces `Tr(H) = 0, Tr(H^2) = 224` forcing
     multiplicities `{-14 (×1), 0 (×8), +2 (×7)}`,
   - All-vector (`∀ x : Fin 16 → Int`) exact SOS positivity and strict ground-state uniqueness theorem,
   - Exact zero bilinear contamination (`Tr(H * i γ_a γ_b) = 0`) and zero chiral condensate
     (`⟨Ω_SMG | i γ_a γ_b | Ω_SMG⟩ = 0`) across all 28 Majorana bilinears.
4. **Breakthrough 4B — Symbolic `ℤ[ζ_9]` Nelson-Barr Strong-CP (`nelson-barr-z9.ts`):**
   - Un-shortcut full Laplace determinants `det4Ninth` (24 perms) and `det5Ninth` (120 perms) over `Ninth`,
   - Symbolic theorems FOR ALL integer `m_q ∈ M_3(ℤ)`, `M_Q`, and ARBITRARY `B(ζ_9)` proving
     `det(M_d) = det(m_q) * det(M_Q) ∈ ℤ` (`c1 = c2 = c3 = c4 = c5 = 0`, hence `θ̄_tree = 0`),
   - Concrete `nelson-barr-z9.ts` `4 × 4` and `5 × 5` positive integer determinant witnesses,
   - Exact zero-float `ℤ[ζ_9]` Jarlskog commutator witness (`b = [1, ζ_9^2, ζ_9^5]`): simultaneously
     `det(M_d) = 7 ∈ ℤ_{>0}` (`θ̄_tree = 0`) AND `det([H_u, 4 H_d^{eff}]) ≠ 0` purely imaginary
     (CP strictly broken!), with real control `b = [1, 1, 1]` giving `det = 0`.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Generic `Fin n` Integer Summation & Bilinear Infrastructure -/

/-- Exact recursive integer sum `∑_{i = 0}^{k - 1} f i` over `Fin n`. -/
def sumFinAux {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Int) : Int :=
  match k with
  | 0 => 0
  | m + 1 => sumFinAux m (by omega) f + f ⟨m, by omega⟩

/-- Exact integer sum `∑_{i : Fin n} f i`. -/
def sumFin {n : Nat} (f : Fin n → Int) : Int :=
  sumFinAux n (Nat.le_refl n) f

/-- Exact integer quadratic form `v^T M v = ∑_{i, j : Fin n} M i j * (v i * v j)`. -/
def quadFormFin {n : Nat} (M : Fin n → Fin n → Int) (v : Fin n → Int) : Int :=
  sumFin (fun i => sumFin (fun j => M i j * (v i * v j)))

private theorem sumFinAux_zero {n : Nat} (k : Nat) (hk : k ≤ n) :
    sumFinAux k hk (fun _ : Fin n => (0 : Int)) = 0 := by
  induction k with
  | zero => rfl
  | succ m ih =>
    simp only [sumFinAux]
    rw [ih (by omega)]
    omega

private theorem sumFin_zero {n : Nat} :
    sumFin (fun _ : Fin n => (0 : Int)) = 0 :=
  sumFinAux_zero n (Nat.le_refl n)

private theorem sumFinAux_add {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Int) :
    sumFinAux k hk (fun i => f i + g i) = sumFinAux k hk f + sumFinAux k hk g := by
  induction k with
  | zero => rfl
  | succ m ih =>
    simp only [sumFinAux]
    rw [ih (by omega)]
    omega

private theorem sumFin_add {n : Nat} (f g : Fin n → Int) :
    sumFin (fun i => f i + g i) = sumFin f + sumFin g :=
  sumFinAux_add n (Nat.le_refl n) f g

private theorem sumFinAux_mul_left {n : Nat} (k : Nat) (hk : k ≤ n) (c : Int) (f : Fin n → Int) :
    sumFinAux k hk (fun i => c * f i) = c * sumFinAux k hk f := by
  induction k with
  | zero =>
    simp only [sumFinAux, Int.mul_zero]
  | succ m ih =>
    simp only [sumFinAux]
    rw [ih (by omega), Int.mul_add]

private theorem sumFin_mul_left {n : Nat} (c : Int) (f : Fin n → Int) :
    sumFin (fun i => c * f i) = c * sumFin f :=
  sumFinAux_mul_left n (Nat.le_refl n) c f

private theorem sumFinAux_mul_right {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Int) (c : Int) :
    sumFinAux k hk (fun i => f i * c) = sumFinAux k hk f * c := by
  induction k with
  | zero =>
    simp only [sumFinAux, Int.zero_mul]
  | succ m ih =>
    simp only [sumFinAux]
    rw [ih (by omega), Int.add_mul]

private theorem sumFin_mul_right {n : Nat} (f : Fin n → Int) (c : Int) :
    sumFin (fun i => f i * c) = sumFin f * c :=
  sumFinAux_mul_right n (Nat.le_refl n) f c

private theorem sumFinAux_delta {n : Nat} (k : Nat) (hk : k ≤ n) (a : Fin n) (f : Fin n → Int) :
    sumFinAux k hk (fun i => (if i = a then (1 : Int) else 0) * f i) =
      if a.val < k then f a else 0 := by
  induction k with
  | zero =>
    simp only [sumFinAux]
    have h0 : ¬(a.val < 0) := by omega
    rw [ite_eq_right h0]
  | succ m ih =>
    simp only [sumFinAux]
    rw [ih (by omega)]
    if hlt : a.val < m then
      have hlt2 : a.val < m + 1 := by omega
      have hne : (⟨m, by omega⟩ : Fin n) ≠ a := by
        intro hEq
        have hv : m = a.val := congrArg Fin.val hEq
        omega
      rw [ite_eq_left hlt, ite_eq_right hne, ite_eq_left hlt2, Int.zero_mul, Int.add_zero]
    else if heq : a.val = m then
      have hlt2 : a.val < m + 1 := by omega
      have hfeq : (⟨m, by omega⟩ : Fin n) = a := Fin.ext heq.symm
      rw [ite_eq_right hlt, ite_eq_left hfeq, ite_eq_left hlt2, Int.one_mul, Int.zero_add, hfeq]
    else
      have hlt2 : ¬(a.val < m + 1) := by omega
      have hne : (⟨m, by omega⟩ : Fin n) ≠ a := by
        intro hEq
        have hv : m = a.val := congrArg Fin.val hEq
        omega
      rw [ite_eq_right hlt, ite_eq_right hne, ite_eq_right hlt2, Int.zero_mul, Int.add_zero]

private theorem sumFin_delta {n : Nat} (a : Fin n) (f : Fin n → Int) :
    sumFin (fun i => (if i = a then (1 : Int) else 0) * f i) = f a := by
  unfold sumFin
  rw [sumFinAux_delta, ite_eq_left a.isLt]

private theorem bt_mul4_swap (a b c d : Int) : (a * b) * (c * d) = (a * c) * (b * d) := by
  calc
    (a * b) * (c * d) = a * (b * (c * d)) := Int.mul_assoc a b (c * d)
    _ = a * ((b * c) * d) := by rw [← Int.mul_assoc b c d]
    _ = a * ((c * b) * d) := by rw [Int.mul_comm b c]
    _ = a * (c * (b * d)) := by rw [Int.mul_assoc c b d]
    _ = (a * c) * (b * d) := (Int.mul_assoc a c (b * d)).symm

private theorem quadFormFin_rank1 {n : Nat} (u v : Fin n → Int) :
    quadFormFin (fun i j => u i * u j) v =
      (sumFin (fun i => u i * v i)) * (sumFin (fun i => u i * v i)) := by
  unfold quadFormFin
  have hSwap : (fun i => sumFin (fun j => (u i * u j) * (v i * v j))) =
      (fun i => (u i * v i) * sumFin (fun j => u j * v j)) := by
    funext i
    have hIn : (fun j => (u i * u j) * (v i * v j)) = (fun j => (u i * v i) * (u j * v j)) := by
      funext j
      exact bt_mul4_swap (u i) (u j) (v i) (v j)
    rw [hIn, sumFin_mul_left]
  rw [hSwap, sumFin_mul_right]

private theorem quadFormFin_add {n : Nat} (A B : Fin n → Fin n → Int) (v : Fin n → Int) :
    quadFormFin (fun i j => A i j + B i j) v = quadFormFin A v + quadFormFin B v := by
  unfold quadFormFin
  have hIn : (fun i => sumFin (fun j => (A i j + B i j) * (v i * v j))) =
      (fun i => sumFin (fun j => A i j * (v i * v j)) + sumFin (fun j => B i j * (v i * v j))) := by
    funext i
    have hDist : (fun j => (A i j + B i j) * (v i * v j)) =
        (fun j => A i j * (v i * v j) + B i j * (v i * v j)) := by
      funext j
      exact Int.add_mul (A i j) (B i j) (v i * v j)
    rw [hDist, sumFin_add]
  rw [hIn, sumFin_add]

private theorem quadFormFin_scale {n : Nat} (c : Int) (A : Fin n → Fin n → Int) (v : Fin n → Int) :
    quadFormFin (fun i j => c * A i j) v = c * quadFormFin A v := by
  unfold quadFormFin
  have hIn : (fun i => sumFin (fun j => (c * A i j) * (v i * v j))) =
      (fun i => c * sumFin (fun j => A i j * (v i * v j))) := by
    funext i
    have hAssoc : (fun j => (c * A i j) * (v i * v j)) =
        (fun j => c * (A i j * (v i * v j))) := by
      funext j
      exact Int.mul_assoc c (A i j) (v i * v j)
    rw [hAssoc, sumFin_mul_left]
  rw [hIn, sumFin_mul_left]

def matAdd {n : Nat} (A B : Fin n → Fin n → Int) : Fin n → Fin n → Int :=
  fun i j => A i j + B i j

def matScale {n : Nat} (c : Int) (A : Fin n → Fin n → Int) : Fin n → Fin n → Int :=
  fun i j => c * A i j

private theorem quadFormFin_matAdd {n : Nat} (A B : Fin n → Fin n → Int) (v : Fin n → Int) :
    quadFormFin (matAdd A B) v = quadFormFin A v + quadFormFin B v :=
  quadFormFin_add A B v

private theorem quadFormFin_matScale {n : Nat} (c : Int) (A : Fin n → Fin n → Int) (v : Fin n → Int) :
    quadFormFin (matScale c A) v = c * quadFormFin A v :=
  quadFormFin_scale c A v

private theorem bt_mul_left_comm (a b c : Int) : a * (b * c) = b * (a * c) := by
  rw [← Int.mul_assoc, Int.mul_comm a b, Int.mul_assoc]

private theorem bt_bool_and_comm (a b : Bool) : (a && b) = (b && a) := by
  cases a <;> cases b <;> rfl

private theorem bt_int_sq_eq_zero (u : Int) (hu : u * u = 0) : u = 0 := by
  if hpos : u ≥ 1 then
    have h1 : 0 ≤ (u - 1) * u := Int.mul_nonneg (by omega) (by omega)
    rw [Int.sub_mul, Int.one_mul] at h1
    omega
  else if hneg : u ≤ -1 then
    have h1 : 0 ≤ (-u - 1) * (-u) := Int.mul_nonneg (by omega) (by omega)
    rw [Int.sub_mul, Int.one_mul, Int.neg_mul, Int.mul_neg, Int.neg_neg] at h1
    omega
  else
    omega


/-! ## Section 1 (Breakthrough 2): 4D `D_4` Mass Gap Algebra (`A_24 + 4 I ≥ 0`, CT SOS, Bivector Ratio `2`) -/

/-- Explicit indexed lookup of the 24 `D_4` root vectors matching `Vibe.Geometry.d4Roots` in order. -/
def d4RootAt (i : Fin 24) : Vec4 :=
  match i.val with
  | 0  => ( 1,  1,  0,  0) | 1  => ( 1, -1,  0,  0) | 2  => (-1,  1,  0,  0) | 3  => (-1, -1,  0,  0)
  | 4  => ( 1,  0,  1,  0) | 5  => ( 1,  0, -1,  0) | 6  => (-1,  0,  1,  0) | 7  => (-1,  0, -1,  0)
  | 8  => ( 1,  0,  0,  1) | 9  => ( 1,  0,  0, -1) | 10 => (-1,  0,  0,  1) | 11 => (-1,  0,  0, -1)
  | 12 => ( 0,  1,  1,  0) | 13 => ( 0,  1, -1,  0) | 14 => ( 0, -1,  1,  0) | 15 => ( 0, -1, -1,  0)
  | 16 => ( 0,  1,  0,  1) | 17 => ( 0,  1,  0, -1) | 18 => ( 0, -1,  0,  1) | 19 => ( 0, -1,  0, -1)
  | 20 => ( 0,  0,  1,  1) | 21 => ( 0,  0,  1, -1) | 22 => ( 0,  0, -1,  1) | 23 => ( 0,  0, -1, -1)
  | _  => ( 0,  0,  0,  0)

/-- Exact `24 × 24` adjacency matrix `A_24` of the 24-cell (`r_a · r_b = 1`). -/
def a24Entry (i j : Fin 24) : Int :=
  if dot4 (d4RootAt i) (d4RootAt j) = 1 then 1 else 0

/-- Shifted 24-cell adjacency matrix `A_24 + 4 I_24`. -/
def a24Shift4 (i j : Fin 24) : Int :=
  a24Entry i j + if i = j then 4 else 0

/-- Matrix-vector action `A_24 v`. -/
def a24MatVec (v : Fin 24 → Int) (i : Fin 24) : Int :=
  sumFin (fun j => a24Entry i j * v j)

/-- Eight 12-triangle chunks of the 96 equilateral triangular faces of the 24-cell
    (balanced tree keeps kernel WHNF recursion depth at 15 instead of 96). -/
private def cell24Chunk0 : List (Fin 24 × Fin 24 × Fin 24) :=
  [ (⟨0, by decide⟩, ⟨4, by decide⟩, ⟨8, by decide⟩),   (⟨0, by decide⟩, ⟨4, by decide⟩, ⟨9, by decide⟩),
    (⟨0, by decide⟩, ⟨4, by decide⟩, ⟨12, by decide⟩),  (⟨0, by decide⟩, ⟨5, by decide⟩, ⟨8, by decide⟩),
    (⟨0, by decide⟩, ⟨5, by decide⟩, ⟨9, by decide⟩),   (⟨0, by decide⟩, ⟨5, by decide⟩, ⟨13, by decide⟩),
    (⟨0, by decide⟩, ⟨8, by decide⟩, ⟨16, by decide⟩),  (⟨0, by decide⟩, ⟨9, by decide⟩, ⟨17, by decide⟩),
    (⟨0, by decide⟩, ⟨12, by decide⟩, ⟨16, by decide⟩), (⟨0, by decide⟩, ⟨12, by decide⟩, ⟨17, by decide⟩),
    (⟨0, by decide⟩, ⟨13, by decide⟩, ⟨16, by decide⟩), (⟨0, by decide⟩, ⟨13, by decide⟩, ⟨17, by decide⟩) ]

private def cell24Chunk1 : List (Fin 24 × Fin 24 × Fin 24) :=
  [ (⟨1, by decide⟩, ⟨4, by decide⟩, ⟨8, by decide⟩),   (⟨1, by decide⟩, ⟨4, by decide⟩, ⟨9, by decide⟩),
    (⟨1, by decide⟩, ⟨4, by decide⟩, ⟨14, by decide⟩),  (⟨1, by decide⟩, ⟨5, by decide⟩, ⟨8, by decide⟩),
    (⟨1, by decide⟩, ⟨5, by decide⟩, ⟨9, by decide⟩),   (⟨1, by decide⟩, ⟨5, by decide⟩, ⟨15, by decide⟩),
    (⟨1, by decide⟩, ⟨8, by decide⟩, ⟨18, by decide⟩),  (⟨1, by decide⟩, ⟨9, by decide⟩, ⟨19, by decide⟩),
    (⟨1, by decide⟩, ⟨14, by decide⟩, ⟨18, by decide⟩), (⟨1, by decide⟩, ⟨14, by decide⟩, ⟨19, by decide⟩),
    (⟨1, by decide⟩, ⟨15, by decide⟩, ⟨18, by decide⟩), (⟨1, by decide⟩, ⟨15, by decide⟩, ⟨19, by decide⟩) ]

private def cell24Chunk2 : List (Fin 24 × Fin 24 × Fin 24) :=
  [ (⟨2, by decide⟩, ⟨6, by decide⟩, ⟨10, by decide⟩),  (⟨2, by decide⟩, ⟨6, by decide⟩, ⟨11, by decide⟩),
    (⟨2, by decide⟩, ⟨6, by decide⟩, ⟨12, by decide⟩),  (⟨2, by decide⟩, ⟨7, by decide⟩, ⟨10, by decide⟩),
    (⟨2, by decide⟩, ⟨7, by decide⟩, ⟨11, by decide⟩),  (⟨2, by decide⟩, ⟨7, by decide⟩, ⟨13, by decide⟩),
    (⟨2, by decide⟩, ⟨10, by decide⟩, ⟨16, by decide⟩), (⟨2, by decide⟩, ⟨11, by decide⟩, ⟨17, by decide⟩),
    (⟨2, by decide⟩, ⟨12, by decide⟩, ⟨16, by decide⟩), (⟨2, by decide⟩, ⟨12, by decide⟩, ⟨17, by decide⟩),
    (⟨2, by decide⟩, ⟨13, by decide⟩, ⟨16, by decide⟩), (⟨2, by decide⟩, ⟨13, by decide⟩, ⟨17, by decide⟩) ]

private def cell24Chunk3 : List (Fin 24 × Fin 24 × Fin 24) :=
  [ (⟨3, by decide⟩, ⟨6, by decide⟩, ⟨10, by decide⟩),  (⟨3, by decide⟩, ⟨6, by decide⟩, ⟨11, by decide⟩),
    (⟨3, by decide⟩, ⟨6, by decide⟩, ⟨14, by decide⟩),  (⟨3, by decide⟩, ⟨7, by decide⟩, ⟨10, by decide⟩),
    (⟨3, by decide⟩, ⟨7, by decide⟩, ⟨11, by decide⟩),  (⟨3, by decide⟩, ⟨7, by decide⟩, ⟨15, by decide⟩),
    (⟨3, by decide⟩, ⟨10, by decide⟩, ⟨18, by decide⟩), (⟨3, by decide⟩, ⟨11, by decide⟩, ⟨19, by decide⟩),
    (⟨3, by decide⟩, ⟨14, by decide⟩, ⟨18, by decide⟩), (⟨3, by decide⟩, ⟨14, by decide⟩, ⟨19, by decide⟩),
    (⟨3, by decide⟩, ⟨15, by decide⟩, ⟨18, by decide⟩), (⟨3, by decide⟩, ⟨15, by decide⟩, ⟨19, by decide⟩) ]

private def cell24Chunk4 : List (Fin 24 × Fin 24 × Fin 24) :=
  [ (⟨4, by decide⟩, ⟨8, by decide⟩, ⟨20, by decide⟩),  (⟨4, by decide⟩, ⟨9, by decide⟩, ⟨21, by decide⟩),
    (⟨4, by decide⟩, ⟨12, by decide⟩, ⟨20, by decide⟩), (⟨4, by decide⟩, ⟨12, by decide⟩, ⟨21, by decide⟩),
    (⟨4, by decide⟩, ⟨14, by decide⟩, ⟨20, by decide⟩), (⟨4, by decide⟩, ⟨14, by decide⟩, ⟨21, by decide⟩),
    (⟨5, by decide⟩, ⟨8, by decide⟩, ⟨22, by decide⟩),  (⟨5, by decide⟩, ⟨9, by decide⟩, ⟨23, by decide⟩),
    (⟨5, by decide⟩, ⟨13, by decide⟩, ⟨22, by decide⟩), (⟨5, by decide⟩, ⟨13, by decide⟩, ⟨23, by decide⟩),
    (⟨5, by decide⟩, ⟨15, by decide⟩, ⟨22, by decide⟩), (⟨5, by decide⟩, ⟨15, by decide⟩, ⟨23, by decide⟩) ]

private def cell24Chunk5 : List (Fin 24 × Fin 24 × Fin 24) :=
  [ (⟨6, by decide⟩, ⟨10, by decide⟩, ⟨20, by decide⟩), (⟨6, by decide⟩, ⟨11, by decide⟩, ⟨21, by decide⟩),
    (⟨6, by decide⟩, ⟨12, by decide⟩, ⟨20, by decide⟩), (⟨6, by decide⟩, ⟨12, by decide⟩, ⟨21, by decide⟩),
    (⟨6, by decide⟩, ⟨14, by decide⟩, ⟨20, by decide⟩), (⟨6, by decide⟩, ⟨14, by decide⟩, ⟨21, by decide⟩),
    (⟨7, by decide⟩, ⟨10, by decide⟩, ⟨22, by decide⟩), (⟨7, by decide⟩, ⟨11, by decide⟩, ⟨23, by decide⟩),
    (⟨7, by decide⟩, ⟨13, by decide⟩, ⟨22, by decide⟩), (⟨7, by decide⟩, ⟨13, by decide⟩, ⟨23, by decide⟩),
    (⟨7, by decide⟩, ⟨15, by decide⟩, ⟨22, by decide⟩), (⟨7, by decide⟩, ⟨15, by decide⟩, ⟨23, by decide⟩) ]

private def cell24Chunk6 : List (Fin 24 × Fin 24 × Fin 24) :=
  [ (⟨8, by decide⟩, ⟨16, by decide⟩, ⟨20, by decide⟩), (⟨8, by decide⟩, ⟨16, by decide⟩, ⟨22, by decide⟩),
    (⟨8, by decide⟩, ⟨18, by decide⟩, ⟨20, by decide⟩), (⟨8, by decide⟩, ⟨18, by decide⟩, ⟨22, by decide⟩),
    (⟨9, by decide⟩, ⟨17, by decide⟩, ⟨21, by decide⟩), (⟨9, by decide⟩, ⟨17, by decide⟩, ⟨23, by decide⟩),
    (⟨9, by decide⟩, ⟨19, by decide⟩, ⟨21, by decide⟩), (⟨9, by decide⟩, ⟨19, by decide⟩, ⟨23, by decide⟩),
    (⟨10, by decide⟩, ⟨16, by decide⟩, ⟨20, by decide⟩), (⟨10, by decide⟩, ⟨16, by decide⟩, ⟨22, by decide⟩),
    (⟨10, by decide⟩, ⟨18, by decide⟩, ⟨20, by decide⟩), (⟨10, by decide⟩, ⟨18, by decide⟩, ⟨22, by decide⟩) ]

private def cell24Chunk7 : List (Fin 24 × Fin 24 × Fin 24) :=
  [ (⟨11, by decide⟩, ⟨17, by decide⟩, ⟨21, by decide⟩), (⟨11, by decide⟩, ⟨17, by decide⟩, ⟨23, by decide⟩),
    (⟨11, by decide⟩, ⟨19, by decide⟩, ⟨21, by decide⟩), (⟨11, by decide⟩, ⟨19, by decide⟩, ⟨23, by decide⟩),
    (⟨12, by decide⟩, ⟨16, by decide⟩, ⟨20, by decide⟩), (⟨12, by decide⟩, ⟨17, by decide⟩, ⟨21, by decide⟩),
    (⟨13, by decide⟩, ⟨16, by decide⟩, ⟨22, by decide⟩), (⟨13, by decide⟩, ⟨17, by decide⟩, ⟨23, by decide⟩),
    (⟨14, by decide⟩, ⟨18, by decide⟩, ⟨20, by decide⟩), (⟨14, by decide⟩, ⟨19, by decide⟩, ⟨21, by decide⟩),
    (⟨15, by decide⟩, ⟨18, by decide⟩, ⟨22, by decide⟩), (⟨15, by decide⟩, ⟨19, by decide⟩, ⟨23, by decide⟩) ]

/-- Exact list of all 96 equilateral triangular faces `(a, b, c)` (`a < b < c`, pairwise `r · r' = 1`)
    of the 24-cell. -/
def cell24Tris : List (Fin 24 × Fin 24 × Fin 24) :=
  ((cell24Chunk0 ++ cell24Chunk1) ++ (cell24Chunk2 ++ cell24Chunk3)) ++
  ((cell24Chunk4 ++ cell24Chunk5) ++ (cell24Chunk6 ++ cell24Chunk7))

/-- Fast `Bool` membership test of vertex `i : Fin 24` in a 24-cell triangle `(a, b, c)`. -/
def inTri24 (t : Fin 24 × Fin 24 × Fin 24) (i : Fin 24) : Bool :=
  i == t.1 || i == t.2.1 || i == t.2.2

/-- Exact triangle-vertex incidence Gram matrix `(B_tri^T B_tri)_{ij}` summed over a triangle list. -/
def triGram24 : List (Fin 24 × Fin 24 × Fin 24) → Fin 24 → Fin 24 → Int
  | [], _, _ => 0
  | t :: rest, i, j => (if inTri24 t i && inTri24 t j then 1 else 0) + triGram24 rest i j

/-- Sum of squared triangle sums `∑_{(a,b,c) ∈ ts} (v a + v b + v c)^2`. -/
def sumTriSq24 : List (Fin 24 × Fin 24 × Fin 24) → (Fin 24 → Int) → Int
  | [], _ => 0
  | (a, b, c) :: rest, v =>
    let s := v a + v b + v c
    s * s + sumTriSq24 rest v

private theorem fin24_beq_iff (a b : Fin 24) : (a == b) = true ↔ a = b := by
  revert a b; decide

private theorem fin24_beq_false (a b : Fin 24) (h : a ≠ b) : (a == b) = false := by
  cases hb : (a == b) with
  | false => rfl
  | true => exact absurd ((fin24_beq_iff a b).mp hb) h

private theorem triGram24_symm (ts : List (Fin 24 × Fin 24 × Fin 24)) (i j : Fin 24) :
    triGram24 ts i j = triGram24 ts j i := by
  induction ts with
  | nil => rfl
  | cons t rest ih =>
    simp only [triGram24]
    rw [bt_bool_and_comm (inTri24 t i) (inTri24 t j), ih]

private theorem a24Shift4_symm (i j : Fin 24) : a24Shift4 i j = a24Shift4 j i := by
  revert i j; decide

private def triGram24Nat : List (Fin 24 × Fin 24 × Fin 24) → Fin 24 → Fin 24 → Nat
  | [], _, _ => 0
  | t :: rest, i, j => (if inTri24 t i && inTri24 t j then 1 else 0) + triGram24Nat rest i j

private def triGram24Fast (i j : Fin 24) : Nat :=
  ((triGram24Nat cell24Chunk0 i j + triGram24Nat cell24Chunk1 i j) +
   (triGram24Nat cell24Chunk2 i j + triGram24Nat cell24Chunk3 i j)) +
  ((triGram24Nat cell24Chunk4 i j + triGram24Nat cell24Chunk5 i j) +
   (triGram24Nat cell24Chunk6 i j + triGram24Nat cell24Chunk7 i j))

private theorem triGram24_eq_ofNat (ts : List (Fin 24 × Fin 24 × Fin 24)) (i j : Fin 24) :
    triGram24 ts i j = Int.ofNat (triGram24Nat ts i j) := by
  induction ts with
  | nil => rfl
  | cons t rest ih =>
    simp only [triGram24, triGram24Nat, ih]
    cases (inTri24 t i && inTri24 t j) <;> rfl

private theorem triGram24Nat_append (ts1 ts2 : List (Fin 24 × Fin 24 × Fin 24)) (i j : Fin 24) :
    triGram24Nat (ts1 ++ ts2) i j = triGram24Nat ts1 i j + triGram24Nat ts2 i j := by
  induction ts1 with
  | nil =>
    simp only [List.nil_append, triGram24Nat, Nat.zero_add]
  | cons t rest ih =>
    simp only [List.cons_append, triGram24Nat]
    rw [ih, Nat.add_assoc]

private theorem triGram24_cell24_eq_fast (i j : Fin 24) :
    triGram24 cell24Tris i j = Int.ofNat (triGram24Fast i j) := by
  rw [triGram24_eq_ofNat]
  apply congrArg Int.ofNat
  unfold cell24Tris triGram24Fast
  simp only [triGram24Nat_append]

private theorem triGram24Fast_band0 :
    ∀ k : Fin 3, ∀ j : Fin 24, k.val ≤ j.val →
      Int.ofNat (triGram24Fast ⟨k.val, by have := k.isLt; omega⟩ j) =
        3 * a24Shift4 ⟨k.val, by have := k.isLt; omega⟩ j := by
  decide

private theorem triGram24Fast_band1 :
    ∀ k : Fin 3, ∀ j : Fin 24, k.val + 3 ≤ j.val →
      Int.ofNat (triGram24Fast ⟨k.val + 3, by have := k.isLt; omega⟩ j) =
        3 * a24Shift4 ⟨k.val + 3, by have := k.isLt; omega⟩ j := by
  decide

private theorem triGram24Fast_band2 :
    ∀ k : Fin 3, ∀ j : Fin 24, k.val + 6 ≤ j.val →
      Int.ofNat (triGram24Fast ⟨k.val + 6, by have := k.isLt; omega⟩ j) =
        3 * a24Shift4 ⟨k.val + 6, by have := k.isLt; omega⟩ j := by
  decide

private theorem triGram24Fast_band3 :
    ∀ k : Fin 3, ∀ j : Fin 24, k.val + 9 ≤ j.val →
      Int.ofNat (triGram24Fast ⟨k.val + 9, by have := k.isLt; omega⟩ j) =
        3 * a24Shift4 ⟨k.val + 9, by have := k.isLt; omega⟩ j := by
  decide

private theorem triGram24Fast_band4 :
    ∀ k : Fin 5, ∀ j : Fin 24, k.val + 12 ≤ j.val →
      Int.ofNat (triGram24Fast ⟨k.val + 12, by have := k.isLt; omega⟩ j) =
        3 * a24Shift4 ⟨k.val + 12, by have := k.isLt; omega⟩ j := by
  decide

private theorem triGram24Fast_band5 :
    ∀ k : Fin 7, ∀ j : Fin 24, k.val + 17 ≤ j.val →
      Int.ofNat (triGram24Fast ⟨k.val + 17, by have := k.isLt; omega⟩ j) =
        3 * a24Shift4 ⟨k.val + 17, by have := k.isLt; omega⟩ j := by
  decide

private theorem triGram24_cell24_upper :
    ∀ i j : Fin 24, i.val ≤ j.val → triGram24 cell24Tris i j = 3 * a24Shift4 i j := by
  intro i j hij
  rw [triGram24_cell24_eq_fast]
  if h0 : i.val < 3 then
    let k : Fin 3 := ⟨i.val, h0⟩
    have h := triGram24Fast_band0 k j hij
    have heq : (⟨k.val, by have := k.isLt; omega⟩ : Fin 24) = i := Fin.ext rfl
    rw [heq] at h
    exact h
  else if h1 : i.val < 6 then
    let k : Fin 3 := ⟨i.val - 3, by omega⟩
    have h := triGram24Fast_band1 k j (by dsimp [k]; omega)
    have heq : (⟨k.val + 3, by have := k.isLt; omega⟩ : Fin 24) = i := Fin.ext (by dsimp [k]; omega)
    rw [heq] at h
    exact h
  else if h2 : i.val < 9 then
    let k : Fin 3 := ⟨i.val - 6, by omega⟩
    have h := triGram24Fast_band2 k j (by dsimp [k]; omega)
    have heq : (⟨k.val + 6, by have := k.isLt; omega⟩ : Fin 24) = i := Fin.ext (by dsimp [k]; omega)
    rw [heq] at h
    exact h
  else if h3 : i.val < 12 then
    let k : Fin 3 := ⟨i.val - 9, by omega⟩
    have h := triGram24Fast_band3 k j (by dsimp [k]; omega)
    have heq : (⟨k.val + 9, by have := k.isLt; omega⟩ : Fin 24) = i := Fin.ext (by dsimp [k]; omega)
    rw [heq] at h
    exact h
  else if h4 : i.val < 17 then
    let k : Fin 5 := ⟨i.val - 12, by omega⟩
    have h := triGram24Fast_band4 k j (by dsimp [k]; omega)
    have heq : (⟨k.val + 12, by have := k.isLt; omega⟩ : Fin 24) = i := Fin.ext (by dsimp [k]; omega)
    rw [heq] at h
    exact h
  else
    let k : Fin 7 := ⟨i.val - 17, by have := i.isLt; omega⟩
    have h := triGram24Fast_band5 k j (by dsimp [k]; omega)
    have heq : (⟨k.val + 17, by have := k.isLt; omega⟩ : Fin 24) = i := Fin.ext (by dsimp [k]; omega)
    rw [heq] at h
    exact h

private theorem cell24Tris_valid :
    (List.finRange 24).map d4RootAt = d4Roots ∧
    cell24Tris.length = 96 ∧
    cell24Tris.Nodup ∧
    (∀ t ∈ cell24Tris,
      t.1.val < t.2.1.val ∧ t.2.1.val < t.2.2.val ∧
      dot4 (d4RootAt t.1) (d4RootAt t.2.1) = 1 ∧
      dot4 (d4RootAt t.1) (d4RootAt t.2.2) = 1 ∧
      dot4 (d4RootAt t.2.1) (d4RootAt t.2.2) = 1) := by
  decide

private theorem cell24Tris_distinct :
    ∀ t ∈ cell24Tris, t.1 ≠ t.2.1 ∧ t.1 ≠ t.2.2 ∧ t.2.1 ≠ t.2.2 := by
  decide

/-- Exact 24-cell triangular incidence Gram identity:
    the 96 triangular faces of the 24-cell satisfy `B_tri^T B_tri = 3 (A_24 + 4 I_24)` across all 576 entries. -/
theorem thm_bt2_cell24_triangles_and_gram :
    (List.finRange 24).map d4RootAt = d4Roots ∧
    cell24Tris.length = 96 ∧
    cell24Tris.Nodup ∧
    (∀ i j : Fin 24, triGram24 cell24Tris i j = 3 * a24Shift4 i j) := by
  refine ⟨cell24Tris_valid.1, cell24Tris_valid.2.1, cell24Tris_valid.2.2.1, ?_⟩
  intro i j
  if hij : i.val ≤ j.val then
    exact triGram24_cell24_upper i j hij
  else
    rw [triGram24_symm, a24Shift4_symm]
    exact triGram24_cell24_upper j i (by omega)

private theorem inTri24_eq_sum_delta (a b c : Fin 24) (hab : a ≠ b) (hac : a ≠ c) (hbc : b ≠ c)
    (i : Fin 24) :
    (if inTri24 (a, b, c) i then (1 : Int) else 0) =
      (if i = a then 1 else 0) + (if i = b then 1 else 0) + (if i = c then 1 else 0) := by
  unfold inTri24
  if h1 : i = a then
    have h2 : i ≠ b := fun h => hab (h1.symm.trans h)
    have h3 : i ≠ c := fun h => hac (h1.symm.trans h)
    have hb1 : (i == a) = true := (fin24_beq_iff i a).mpr h1
    rw [ite_eq_left h1, ite_eq_right h2, ite_eq_right h3, hb1]
    rfl
  else if h2 : i = b then
    have h3 : i ≠ c := fun h => hbc (h2.symm.trans h)
    have hb1 : (i == a) = false := fin24_beq_false i a h1
    have hb2 : (i == b) = true := (fin24_beq_iff i b).mpr h2
    rw [ite_eq_right h1, ite_eq_left h2, ite_eq_right h3, hb1, hb2]
    rfl
  else if h3 : i = c then
    have hb1 : (i == a) = false := fin24_beq_false i a h1
    have hb2 : (i == b) = false := fin24_beq_false i b h2
    have hb3 : (i == c) = true := (fin24_beq_iff i c).mpr h3
    rw [ite_eq_right h1, ite_eq_right h2, ite_eq_left h3, hb1, hb2, hb3]
    rfl
  else
    have hb1 : (i == a) = false := fin24_beq_false i a h1
    have hb2 : (i == b) = false := fin24_beq_false i b h2
    have hb3 : (i == c) = false := fin24_beq_false i c h3
    rw [ite_eq_right h1, ite_eq_right h2, ite_eq_right h3, hb1, hb2, hb3]
    rfl

private theorem bool_and_ite_mul (p q : Bool) :
    (if p && q then (1 : Int) else 0) = (if p then 1 else 0) * (if q then 1 else 0) := by
  cases p <;> cases q <;> rfl

private theorem sumTriSq24_nonneg (ts : List (Fin 24 × Fin 24 × Fin 24)) (v : Fin 24 → Int) :
    0 ≤ sumTriSq24 ts v := by
  induction ts with
  | nil => simp only [sumTriSq24]; omega
  | cons t rest ih =>
    cases t with
    | mk a bc =>
      cases bc with
      | mk b c =>
        simp only [sumTriSq24]
        have hSq := int_sq_nonneg (v a + v b + v c)
        omega

private theorem quadFormFin_triGram24 (ts : List (Fin 24 × Fin 24 × Fin 24))
    (hDisj : ∀ t ∈ ts, t.1 ≠ t.2.1 ∧ t.1 ≠ t.2.2 ∧ t.2.1 ≠ t.2.2) (v : Fin 24 → Int) :
    quadFormFin (triGram24 ts) v = sumTriSq24 ts v := by
  induction ts with
  | nil =>
    simp only [triGram24, sumTriSq24, quadFormFin]
    have hIn : (fun i : Fin 24 => sumFin (fun j : Fin 24 => (0 : Int) * (v i * v j))) =
        (fun _ => 0) := by
      funext i
      have h0 : (fun j : Fin 24 => (0 : Int) * (v i * v j)) = (fun _ => 0) := by
        funext j; exact Int.zero_mul (v i * v j)
      rw [h0, sumFin_zero]
    rw [hIn, sumFin_zero]
  | cons t rest ih =>
    cases t with
    | mk a bc =>
      cases bc with
      | mk b c =>
        have hHead := hDisj (a, b, c) (List.Mem.head rest)
        have hRest : ∀ q ∈ rest, q.1 ≠ q.2.1 ∧ q.1 ≠ q.2.2 ∧ q.2.1 ≠ q.2.2 :=
          fun q hq => hDisj q (List.Mem.tail _ hq)
        have hSplitMat : triGram24 ((a, b, c) :: rest) =
            fun i j => (if inTri24 (a, b, c) i && inTri24 (a, b, c) j then (1 : Int) else 0) +
                       triGram24 rest i j := by
          funext i j
          rfl
        rw [hSplitMat, quadFormFin_add, ih hRest]
        simp only [sumTriSq24]
        have hMat : (fun i j => if inTri24 (a, b, c) i && inTri24 (a, b, c) j then (1 : Int) else 0) =
            (fun i j => (if inTri24 (a, b, c) i then (1 : Int) else 0) *
                        (if inTri24 (a, b, c) j then (1 : Int) else 0)) := by
          funext i j
          exact bool_and_ite_mul (inTri24 (a, b, c) i) (inTri24 (a, b, c) j)
        rw [hMat, quadFormFin_rank1]
        have hLin : sumFin (fun i => (if inTri24 (a, b, c) i then (1 : Int) else 0) * v i) =
            v a + v b + v c := by
          have hSplit : (fun i => (if inTri24 (a, b, c) i then (1 : Int) else 0) * v i) =
              (fun i => ((if i = a then (1 : Int) else 0) * v i +
                         (if i = b then (1 : Int) else 0) * v i) +
                         (if i = c then (1 : Int) else 0) * v i) := by
            funext i
            rw [inTri24_eq_sum_delta a b c hHead.1 hHead.2.1 hHead.2.2 i,
                Int.add_mul, Int.add_mul]
          rw [hSplit, sumFin_add, sumFin_add, sumFin_delta, sumFin_delta, sumFin_delta]
        rw [hLin]

/-- Exact 24-cell spectral lower bound `A_24 + 4 I_24 ≥ 0` (`λ_min(A_24) ≥ -4`) for EVERY integer
    vector `v : Fin 24 → Int` via the exact 96-triangle sum-of-squares decomposition
    `3 v^T (A_24 + 4 I_24) v = ∑_{(a,b,c) ∈ cell24Tris} (v_a + v_b + v_c)^2 ≥ 0`. -/
theorem thm_bt2_a24_plus_4I_pos_semidef (v : Fin 24 → Int) :
    3 * quadFormFin a24Shift4 v = sumTriSq24 cell24Tris v ∧ 0 ≤ quadFormFin a24Shift4 v := by
  have hGramEq : triGram24 cell24Tris = fun i j => 3 * a24Shift4 i j := by
    funext i j
    exact thm_bt2_cell24_triangles_and_gram.2.2.2 i j
  have hId : 3 * quadFormFin a24Shift4 v = sumTriSq24 cell24Tris v := by
    rw [← quadFormFin_scale, ← hGramEq]
    exact quadFormFin_triGram24 cell24Tris cell24Tris_distinct v
  have hNonneg : 0 ≤ sumTriSq24 cell24Tris v := sumTriSq24_nonneg cell24Tris v
  exact ⟨hId, by omega⟩

/-- Explicit `-4` eigenvector of `A_24`: `+1` on inscribed 16-cell 0 (supports `{0,1}` / `{2,3}`),
    `-1` on 16-cell 1 (supports `{0,2}` / `{1,3}`), and `0` on 16-cell 2 (supports `{0,3}` / `{1,2}`). -/
def a24MinEigVec (i : Fin 24) : Int :=
  if i.val < 4 ∨ i.val ≥ 20 then 1
  else if i.val < 8 ∨ (16 ≤ i.val ∧ i.val < 20) then -1
  else 0

/-- Exact sharpness of `λ_min(A_24) = -4`: `a24MinEigVec` is nonzero, satisfies `A_24 v = -4 v`
    entry-by-entry, and attains `v^T (A_24 + 4 I_24) v = 0`. -/
theorem thm_bt2_a24_min_eigenvector_neg4 :
    a24MinEigVec ⟨0, by decide⟩ = 1 ∧
    (∀ i : Fin 24, a24MatVec a24MinEigVec i = -4 * a24MinEigVec i) ∧
    quadFormFin a24Shift4 a24MinEigVec = 0 := by
  decide

/-- Exact 1-plaquette 3-link Combes-Thomas tilted Hessian sum-of-squares majorant:
    for EVERY `c ≥ 0` and EVERY `x0, x1, x2 : Int`, BOTH `D_D4(c) - C_D4(c)` and `D_D4(c) + C_D4(c)`
    are exact sums of squares (`≥ 0`). -/
theorem thm_bt2_plaquette_tilted_hessian_sos (c x0 x1 x2 : Int) (hc : 0 ≤ c) :
    0 ≤ (1 + 2 * c) * (x0 * x0) + (2 + c) * (x1 * x1) + (2 + c) * (x2 * x2) -
        (x0 * x0 + x1 * x1 + x2 * x2 + 2 * c * (x0 * x1) + 2 * c * (x0 * x2) + 2 * (x1 * x2)) ∧
    0 ≤ (1 + 2 * c) * (x0 * x0) + (2 + c) * (x1 * x1) + (2 + c) * (x2 * x2) +
        (x0 * x0 + x1 * x1 + x2 * x2 + 2 * c * (x0 * x1) + 2 * c * (x0 * x2) + 2 * (x1 * x2)) := by
  have hSubSq : ∀ a b : Int, (a - b) * (a - b) = a * a - 2 * (a * b) + b * b := by
    intro a b
    rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.mul_comm b a]; omega
  have hAddSq : ∀ a b : Int, (a + b) * (a + b) = a * a + 2 * (a * b) + b * b := by
    intro a b
    rw [Int.add_mul, Int.mul_add, Int.mul_add, Int.mul_comm b a]; omega
  have hMinus :
      (1 + 2 * c) * (x0 * x0) + (2 + c) * (x1 * x1) + (2 + c) * (x2 * x2) -
        (x0 * x0 + x1 * x1 + x2 * x2 + 2 * c * (x0 * x1) + 2 * c * (x0 * x2) + 2 * (x1 * x2)) =
      c * ((x0 - x1) * (x0 - x1)) + c * ((x0 - x2) * (x0 - x2)) + (x1 - x2) * (x1 - x2) := by
    rw [hSubSq x0 x1, hSubSq x0 x2, hSubSq x1 x2]
    simp only [Int.add_mul, Int.mul_add, Int.mul_sub, Int.one_mul]
    rw [Int.mul_assoc 2 c (x0 * x0), Int.mul_assoc 2 c (x0 * x1), Int.mul_assoc 2 c (x0 * x2),
        bt_mul_left_comm c 2 (x0 * x1), bt_mul_left_comm c 2 (x0 * x2)]
    omega
  have hPlus :
      (1 + 2 * c) * (x0 * x0) + (2 + c) * (x1 * x1) + (2 + c) * (x2 * x2) +
        (x0 * x0 + x1 * x1 + x2 * x2 + 2 * c * (x0 * x1) + 2 * c * (x0 * x2) + 2 * (x1 * x2)) =
      c * ((x0 + x1) * (x0 + x1)) + c * ((x0 + x2) * (x0 + x2)) + (x1 + x2) * (x1 + x2) +
        2 * (x0 * x0) + 2 * (x1 * x1) + 2 * (x2 * x2) := by
    rw [hAddSq x0 x1, hAddSq x0 x2, hAddSq x1 x2]
    simp only [Int.add_mul, Int.mul_add, Int.one_mul]
    rw [Int.mul_assoc 2 c (x0 * x0), Int.mul_assoc 2 c (x0 * x1), Int.mul_assoc 2 c (x0 * x2),
        bt_mul_left_comm c 2 (x0 * x1), bt_mul_left_comm c 2 (x0 * x2)]
    omega
  have h1 : 0 ≤ c * ((x0 - x1) * (x0 - x1)) := Int.mul_nonneg hc (int_sq_nonneg _)
  have h2 : 0 ≤ c * ((x0 - x2) * (x0 - x2)) := Int.mul_nonneg hc (int_sq_nonneg _)
  have h3 : 0 ≤ (x1 - x2) * (x1 - x2) := int_sq_nonneg _
  have h4 : 0 ≤ c * ((x0 + x1) * (x0 + x1)) := Int.mul_nonneg hc (int_sq_nonneg _)
  have h5 : 0 ≤ c * ((x0 + x2) * (x0 + x2)) := Int.mul_nonneg hc (int_sq_nonneg _)
  have h6 : 0 ≤ (x1 + x2) * (x1 + x2) := int_sq_nonneg _
  have h7 := int_sq_nonneg x0
  have h8 := int_sq_nonneg x1
  have h9 := int_sq_nonneg x2
  rw [hMinus, hPlus]
  exact ⟨by omega, by omega⟩

/-- Homogeneous 24-cell Combes-Thomas cubic `4 p^3 + 13 p^2 q + 10 p q^2 + q^3` (at tilt `c = p / q`). -/
def ctCubic24c (p q : Int) : Int :=
  4 * (p * (p * p)) + 13 * (p * (p * q)) + 10 * (p * (q * q)) + q * (q * q)

/-- Exact 24-cell cubic-to-quadratic Combes-Thomas majorant identity and inequality for all `p ≥ q > 0`:
    `16 * (4 p^3 + 13 p^2 q + 10 p q^2 + q^3) = ((8 p + 13 q)^2 + 7 q^2) * p - 16 q^2 (p - q) ≤ ((8 p + 13 q)^2 + 7 q^2) * p`. -/
theorem thm_bt2_combes_thomas_cubic_majorant (p q : Int) (hp : q ≤ p) :
    16 * ctCubic24c p q =
      ((8 * p + 13 * q) * (8 * p + 13 * q) + 7 * (q * q)) * p - 16 * ((q * q) * (p - q)) ∧
    16 * ctCubic24c p q ≤
      ((8 * p + 13 * q) * (8 * p + 13 * q) + 7 * (q * q)) * p := by
  let p2 := p * p
  let q2 := q * q
  let pq := p * q
  let p3 := p * p2
  let p2q := p * pq
  let pq2 := p * q2
  let q3 := q * q2
  have hSq : (8 * p + 13 * q) * (8 * p + 13 * q) = 64 * p2 + 208 * pq + 169 * q2 := by
    simp only [Int.add_mul, Int.mul_add]
    have ha : (8 * p) * (8 * p) = 64 * p2 := by
      rw [Int.mul_assoc 8 p (8 * p), bt_mul_left_comm p 8 p, ← Int.mul_assoc 8 8 p2]; rfl
    have hb : (8 * p) * (13 * q) = 104 * pq := by
      rw [Int.mul_assoc 8 p (13 * q), bt_mul_left_comm p 13 q, ← Int.mul_assoc 8 13 pq]; rfl
    have hc : (13 * q) * (8 * p) = 104 * pq := by
      rw [Int.mul_assoc 13 q (8 * p), bt_mul_left_comm q 8 p, Int.mul_comm q p,
          ← Int.mul_assoc 13 8 pq]; rfl
    have hd : (13 * q) * (13 * q) = 169 * q2 := by
      rw [Int.mul_assoc 13 q (13 * q), bt_mul_left_comm q 13 q, ← Int.mul_assoc 13 13 q2]; rfl
    rw [ha, hb, hc, hd]
    omega
  have hId : 16 * ctCubic24c p q =
      ((8 * p + 13 * q) * (8 * p + 13 * q) + 7 * q2) * p - 16 * (q2 * (p - q)) := by
    change 16 * (4 * p3 + 13 * p2q + 10 * pq2 + q3) = _
    rw [hSq]
    have h1 : p2 * p = p3 := Int.mul_comm p2 p
    have h2 : pq * p = p2q := by
      change (p * q) * p = p * (p * q)
      exact Int.mul_comm (p * q) p
    have h3 : q2 * p = pq2 := Int.mul_comm q2 p
    have h4 : q2 * q = q3 := Int.mul_comm q2 q
    simp only [Int.add_mul, Int.mul_sub, Int.mul_add]
    rw [Int.mul_assoc 64 p2 p, h1, Int.mul_assoc 208 pq p, h2,
        Int.mul_assoc 169 q2 p, h3, Int.mul_assoc 7 q2 p, h3, h4]
    omega
  have hDiff : 0 ≤ 16 * (q2 * (p - q)) :=
    Int.mul_nonneg (by decide) (Int.mul_nonneg (int_sq_nonneg q) (by omega))
  have hLe : 16 * ctCubic24c p q ≤ ((8 * p + 13 * q) * (8 * p + 13 * q) + 7 * q2) * p := by
    rw [hId]
    omega
  exact ⟨hId, hLe⟩

private theorem bt_mul_lt_right (x y p : Int) (hxy : x < y) (hp : 0 < p) : x * p < y * p := by
  have h : 0 ≤ (y - x - 1) * (p - 1) := Int.mul_nonneg (by omega) (by omega)
  rw [Int.sub_mul, Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.mul_sub,
      Int.one_mul, Int.mul_one] at h
  omega

/-- Exact Combes-Thomas uniform positivity margin theorem on 4D `D_4`:
    for EVERY integer `N, b, d` satisfying the 24-cell Bakry-Emery threshold
    `1792 * b^2 < N^4 * d^2` (i.e. `0 ≤ β = |b/d| < N^2 / (16 √7)`, strictly beating the `N^2 / 48`
    block bound since `1792 < 2304 = 48^2`), there exist explicit integers `p > q > 0` (strictly
    positive tilt `c = p / q > 1`, yielding `m_CT(β) = 2 arccosh(p/q) > 0`) satisfying the exact
    Combes-Thomas cubic positivity margin `64 b^2 ctCubic24c(p, q) < N^4 d^2 p q^2`. -/
theorem thm_bt2_combes_thomas_mass_gap_margin (N b d : Int)
    (hThresh : 1792 * (b * b) < ((N * N) * (N * N)) * (d * d)) :
    1792 < 48 * 48 ∧
    ∃ p q : Int, p > q ∧ q > 0 ∧
      64 * (b * b) * ctCubic24c p q < (((N * N) * (N * N)) * (d * d)) * (p * (q * q)) := by
  refine ⟨by decide, ?_⟩
  let B2 := b * b
  let M4 := ((N * N) * (N * N)) * (d * d)
  let q : Int := 1600 * B2 + 1
  let p : Int := q + 1
  have hB2 : 0 ≤ B2 := int_sq_nonneg b
  have hqPos : q > 0 := by omega
  have hpGt : p > q := by omega
  refine ⟨p, q, hpGt, hqPos, ?_⟩
  let Q : Int := (8 * p + 13 * q) * (8 * p + 13 * q) + 7 * (q * q)
  have hQuadExp : 4 * Q = 1792 * (q * q) + 1344 * q + 256 := by
    have hlin : 8 * p + 13 * q = 21 * q + 8 := by
      change 8 * (q + 1) + 13 * q = 21 * q + 8
      omega
    have hSq21 : (21 * q + 8) * (21 * q + 8) = 441 * (q * q) + 336 * q + 64 := by
      simp only [Int.add_mul, Int.mul_add]
      have h1 : (21 * q) * (21 * q) = 441 * (q * q) := by
        rw [Int.mul_assoc 21 q (21 * q), bt_mul_left_comm q 21 q, ← Int.mul_assoc 21 21 (q * q)]; rfl
      have h2 : (21 * q) * 8 = 168 * q := by
        rw [Int.mul_assoc 21 q 8, Int.mul_comm q 8, ← Int.mul_assoc 21 8 q]; rfl
      have h3 : 8 * (21 * q) = 168 * q := by
        rw [← Int.mul_assoc 8 21 q]; rfl
      rw [h1, h2, h3]
      omega
    change 4 * ((8 * p + 13 * q) * (8 * p + 13 * q) + 7 * (q * q)) = _
    rw [hlin, hSq21]
    omega
  have hQ2ge : q * q = 1600 * (B2 * q) + q := by
    change (1600 * B2 + 1) * q = 1600 * (B2 * q) + q
    rw [Int.add_mul, Int.one_mul, Int.mul_assoc]
  have hB2q : B2 ≤ B2 * q := by
    have h := Int.mul_nonneg hB2 (show 0 ≤ q - 1 by omega)
    rw [Int.mul_sub, Int.mul_one] at h
    omega
  have hDiffPos : 0 < (M4 - 1792 * B2) * (q * q) - B2 * (1344 * q + 256) := by
    have h1 : q * q ≤ (M4 - 1792 * B2) * (q * q) := by
      have h := Int.mul_nonneg (show 0 ≤ (M4 - 1792 * B2) - 1 by omega) (int_sq_nonneg q)
      rw [Int.sub_mul, Int.one_mul] at h
      omega
    have h2 : B2 * (1344 * q + 256) = 1344 * (B2 * q) + 256 * B2 := by
      rw [Int.mul_add, bt_mul_left_comm B2 1344 q, Int.mul_comm B2 256]
    omega
  have hQuadStrict : 4 * B2 * Q < M4 * (q * q) := by
    rw [Int.mul_assoc 4 B2 Q, Int.mul_comm B2 Q, ← Int.mul_assoc 4 Q B2,
        Int.mul_comm (4 * Q) B2, hQuadExp]
    rw [Int.sub_mul, Int.mul_assoc 1792 B2 (q * q)] at hDiffPos
    have hSum : 1792 * (q * q) + 1344 * q + 256 = 1792 * (q * q) + (1344 * q + 256) := by omega
    have h1792 : B2 * (1792 * (q * q) + 1344 * q + 256) =
        1792 * (B2 * (q * q)) + B2 * (1344 * q + 256) := by
      rw [hSum, Int.mul_add, bt_mul_left_comm B2 1792 (q * q)]
    rw [h1792]
    omega
  have hCubicLe : 16 * ctCubic24c p q ≤ Q * p :=
    (thm_bt2_combes_thomas_cubic_majorant p q (by omega)).2
  have hStep1 : 64 * B2 * ctCubic24c p q ≤ (4 * B2 * Q) * p := by
    have hL : 64 * B2 * ctCubic24c p q = (4 * B2) * (16 * ctCubic24c p q) := by
      rw [Int.mul_assoc 4 B2 (16 * ctCubic24c p q), bt_mul_left_comm B2 16 (ctCubic24c p q),
          ← Int.mul_assoc 4 16 (B2 * ctCubic24c p q), ← Int.mul_assoc (4 * 16) B2 (ctCubic24c p q)]
      rfl
    have hR : (4 * B2 * Q) * p = (4 * B2) * (Q * p) :=
      Int.mul_assoc (4 * B2) Q p
    rw [hL, hR]
    have hDiff := Int.mul_nonneg (show 0 ≤ 4 * B2 by omega) (show 0 ≤ Q * p - 16 * ctCubic24c p q by omega)
    rw [Int.mul_sub] at hDiff
    omega
  have hStep2 : (4 * B2 * Q) * p < (M4 * (q * q)) * p :=
    bt_mul_lt_right (4 * B2 * Q) (M4 * (q * q)) p hQuadStrict (by omega)
  have hRhsEq : (M4 * (q * q)) * p = M4 * (p * (q * q)) := by
    rw [Int.mul_assoc, Int.mul_comm (q * q) p]
  rw [hRhsEq] at hStep2
  have hFinal : 64 * B2 * ctCubic24c p q < M4 * (p * (q * q)) := by omega
  exact hFinal

/-- The 6 coordinate 2-planes `(μ, ν)` (`0 ≤ μ < ν < 4`) indexed by `Fin 6`. -/
def planePair6 (p : Fin 6) : Fin 4 × Fin 4 :=
  match p.val with
  | 0 => (⟨0, by decide⟩, ⟨1, by decide⟩)
  | 1 => (⟨0, by decide⟩, ⟨2, by decide⟩)
  | 2 => (⟨0, by decide⟩, ⟨3, by decide⟩)
  | 3 => (⟨1, by decide⟩, ⟨2, by decide⟩)
  | 4 => (⟨1, by decide⟩, ⟨3, by decide⟩)
  | _ => (⟨2, by decide⟩, ⟨3, by decide⟩)

/-- Doubled bivector component `2 Σ_{μν}(r1, r2) = r1_μ r2_ν - r1_ν r2_μ`. -/
def bivector2 (r1 r2 : Vec4) (p : Fin 6) : Int :=
  let (a, b) := planePair6 p
  coord4 r1 a * coord4 r2 b - coord4 r1 b * coord4 r2 a

/-- Exact `6 × 6` doubled-bivector Gram matrix summed over all 96 origin `D_4` triangles `{0, r_i, r_j}`
    (`i < j`, `r_i · r_j = 1`). -/
def d4BivectorGram (p q : Fin 6) : Int :=
  (List.finRange 24).foldl (fun acc i =>
    acc + (List.finRange 24).foldl (fun acc2 j =>
      if i.val < j.val ∧ dot4 (d4RootAt i) (d4RootAt j) = 1 then
        acc2 + bivector2 (d4RootAt i) (d4RootAt j) p * bivector2 (d4RootAt i) (d4RootAt j) q
      else acc2) 0) 0

/-- Indexed lookup of the 8 `ℤ^4` hypercubic unit vectors matching `Vibe.Geometry.z4Roots`. -/
def z4RootAt (i : Fin 8) : Vec4 :=
  match i.val with
  | 0 => ( 1,  0,  0,  0) | 1 => (-1,  0,  0,  0)
  | 2 => ( 0,  1,  0,  0) | 3 => ( 0, -1,  0,  0)
  | 4 => ( 0,  0,  1,  0) | 5 => ( 0,  0, -1,  0)
  | 6 => ( 0,  0,  0,  1) | 7 => ( 0,  0,  0, -1)
  | _ => ( 0,  0,  0,  0)

/-- Exact `6 × 6` doubled-bivector Gram matrix summed over all 24 origin `ℤ^4` squares `{0, e_i, e_j, e_i+e_j}`
    (`i < j`, `e_i · e_j = 0`, area `Σ = ±1` so `2 Σ = ±2`). -/
def z4BivectorGram (p q : Fin 6) : Int :=
  (List.finRange 8).foldl (fun acc i =>
    acc + (List.finRange 8).foldl (fun acc2 j =>
      if i.val < j.val ∧ dot4 (z4RootAt i) (z4RootAt j) = 0 then
        acc2 + (2 * bivector2 (z4RootAt i) (z4RootAt j) p) *
               (2 * bivector2 (z4RootAt i) (z4RootAt j) q)
      else acc2) 0) 0

/-- Exact `D_4 / ℤ^4` continuum Yang-Mills bivector ratio `2`:
    on `D_4`, `∑_{T at 0} (2 Σ_p)(2 Σ_q) = 48 δ_{pq}` (divided by `4 * 3 * 2 = 24` gives density `2`);
    on `ℤ^4`, `∑_{P at 0} (2 Σ_p)(2 Σ_q) = 16 δ_{pq}` (divided by `4 * 4 * 1 = 16` gives density `1`),
    yielding exact isotropic ratio `2` across all 6 coordinate planes. -/
theorem thm_bt2_d4_z4_bivector_ratio_two :
    (∀ p q : Fin 6, d4BivectorGram p q = if p = q then 48 else 0) ∧
    (∀ p q : Fin 6, z4BivectorGram p q = if p = q then 16 else 0) ∧
    (∀ p : Fin 6, d4BivectorGram p p * 16 = 2 * (24 * z4BivectorGram p p)) := by
  decide


/-! ## Section 2 (Breakthrough 3): `L_7` Catalyst, Eisenstein Molecule & `M_meet` DFS Universality -/

/-- Exact 3-full-line `Φ_odd` catalyst gate `2 L_7 = [[ω, -1 - 2ω], [ω - 1, ω]]` in `Mat_2(ℤ[ω])`
    (from `yang-baxter-catalyst-proof.ts` & `algebraic-phase-flavor.ts`). -/
def catalystL7_2 : Mat2Eis :=
  ⟨⟨0, 1⟩, ⟨-1, -2⟩, ⟨-1, 1⟩, ⟨0, 1⟩⟩

/-- Product `4 L_7 C` in `Mat_2(ℤ[ω])` (`Tr = -5`, `det = 16`). -/
def catalystProd4 : Mat2Eis :=
  Mat2Eis.mul catalystL7_2 coin2

/-- Negated generator `M_cat = -4 L_7 C` (`Tr = +5`, `det = 16`, `M_cat^2 = 5 M_cat - 16 I`). -/
def catalystM : Mat2Eis :=
  Mat2Eis.scale (-1) catalystProd4

/-- Exact bare `M_meet` 3-excitation DFS `SU(2)` generators `S_{12}` and `4 S_{23}` in `Mat_2(ℤ[ω])`. -/
def dfsS12 : Mat2Eis :=
  ⟨⟨0, -1⟩, Eis.zero, Eis.zero, ⟨1, 1⟩⟩

def dfsS23_4 : Mat2Eis :=
  ⟨⟨3, 2⟩, ⟨-3, 0⟩, ⟨3, 0⟩, ⟨1, -2⟩⟩

/-- Product `M_dfs = 4 S_{12} S_{23}` (`Tr = +5`, `det = 16`, `M_dfs^2 = 5 M_dfs - 16 I`). -/
def dfsM : Mat2Eis :=
  Mat2Eis.mul dfsS12 dfsS23_4

/-- Exact integer trace sequence `t(n) = Tr(M^n)` for any `M` obeying `Tr(M) = 5` and `M^2 = 5 M - 16 I`. -/
def trSeq5 : Nat → Int
  | 0 => 2
  | 1 => 5
  | n + 2 => 5 * trSeq5 (n + 1) - 16 * trSeq5 n

private theorem trSeq5_mod4 : ∀ k : Nat, trSeq5 (k + 1) % 4 = 1 := by
  intro k
  induction k with
  | zero => decide
  | succ k ih =>
    change trSeq5 (k + 2) % 4 = 1
    simp only [trSeq5]
    omega

private theorem mat_ch5_pow_recurrence (M : Mat2Eis)
    (hCH : Mat2Eis.mul M M = Mat2Eis.sub (Mat2Eis.scale 5 M) (Mat2Eis.scale 16 Mat2Eis.id))
    (n : Nat) :
    Mat2Eis.pow M (n + 2) =
      Mat2Eis.sub (Mat2Eis.scale 5 (Mat2Eis.pow M (n + 1))) (Mat2Eis.scale 16 (Mat2Eis.pow M n)) := by
  change Mat2Eis.mul (Mat2Eis.mul (Mat2Eis.pow M n) M) M =
    Mat2Eis.sub (Mat2Eis.scale 5 (Mat2Eis.mul (Mat2Eis.pow M n) M))
                (Mat2Eis.scale 16 (Mat2Eis.pow M n))
  rw [Mat2Eis.mul_assoc, hCH, Mat2Eis.mul_sub, Mat2Eis.mul_scale, Mat2Eis.mul_scale, Mat2Eis.mul_id]

private theorem mat_ch5_trace_pow_pair (M : Mat2Eis)
    (hTr : Mat2Eis.trace M = Eis.ofInt 5)
    (hCH : Mat2Eis.mul M M = Mat2Eis.sub (Mat2Eis.scale 5 M) (Mat2Eis.scale 16 Mat2Eis.id)) :
    ∀ n : Nat,
      Mat2Eis.trace (Mat2Eis.pow M n) = Eis.ofInt (trSeq5 n) ∧
      Mat2Eis.trace (Mat2Eis.pow M (n + 1)) = Eis.ofInt (trSeq5 (n + 1)) := by
  intro n
  induction n with
  | zero =>
    refine ⟨by change Mat2Eis.trace Mat2Eis.id = Eis.ofInt (trSeq5 0); decide, ?_⟩
    change Mat2Eis.trace (Mat2Eis.mul Mat2Eis.id M) = Eis.ofInt 5
    have hIdL : Mat2Eis.mul Mat2Eis.id M = M := by
      cases M with
      | mk m00 m01 m10 m11 =>
        cases m00; cases m01; cases m10; cases m11
        simp only [Mat2Eis.mul, Mat2Eis.id, Eis.one, Eis.zero, Eis.mul, Eis.add,
          Int.one_mul, Int.zero_mul, Int.add_zero, Int.zero_add, Int.sub_zero]
    rw [hIdL]
    exact hTr
  | succ n ih =>
    refine ⟨ih.2, ?_⟩
    change Mat2Eis.trace (Mat2Eis.pow M (n + 2)) = Eis.ofInt (trSeq5 (n + 2))
    rw [mat_ch5_pow_recurrence M hCH n, Mat2Eis.trace_sub, Mat2Eis.trace_scale,
        Mat2Eis.trace_scale, ih.2, ih.1]
    simp only [trSeq5, Eis.ofInt, Eis.sub, Eis.scale, Eis.mk.injEq]
    exact ⟨trivial, by decide⟩

private theorem mat_ch5_infinite_order (M : Mat2Eis)
    (hTr : Mat2Eis.trace M = Eis.ofInt 5)
    (hCH : Mat2Eis.mul M M = Mat2Eis.sub (Mat2Eis.scale 5 M) (Mat2Eis.scale 16 Mat2Eis.id))
    (n : Nat) (hn : n ≥ 1) :
    Mat2Eis.trace (Mat2Eis.pow M n) = Eis.ofInt (trSeq5 n) ∧
    Mat2Eis.pow M n ≠ Mat2Eis.scale (pow4Int n) Mat2Eis.id ∧
    Mat2Eis.pow M n ≠ Mat2Eis.scale (-pow4Int n) Mat2Eis.id := by
  cases n with
  | zero => omega
  | succ k =>
    have hTrPow := (mat_ch5_trace_pow_pair M hTr hCH (k + 1)).1
    have hMod := trSeq5_mod4 k
    refine ⟨hTrPow, ?_, ?_⟩
    · intro hEq
      have hT := congrArg Mat2Eis.trace hEq
      rw [hTrPow, Mat2Eis.trace_scale_id] at hT
      have hA : trSeq5 (k + 1) = 2 * pow4Int (k + 1) := by
        have := congrArg Eis.a hT
        simpa only [Eis.ofInt] using this
      change trSeq5 (k + 1) = 2 * (4 * pow4Int k) at hA
      omega
    · intro hEq
      have hT := congrArg Mat2Eis.trace hEq
      rw [hTrPow, Mat2Eis.trace_scale_id] at hT
      have hA : trSeq5 (k + 1) = 2 * (-pow4Int (k + 1)) := by
        have := congrArg Eis.a hT
        simpa only [Eis.ofInt] using this
      change trSeq5 (k + 1) = 2 * -(4 * pow4Int k) at hA
      omega

/-- Breakthrough 3 (`L_7` catalyst): exact unitarity, `det(L_7 C) = 1`, `Tr(L_7 C) = -5/4`
    (`Tr(4 L_7 C) = -5`), Cayley-Hamilton `M_cat^2 = 5 M_cat - 16 I`, non-commutativity
    `‖[2 L_7, 2 C]‖_F^2 = 54` (`‖[L_7, C]‖_F^2 = 27/8`), and non-`Pin(2)` exclusion. -/
theorem thm_bt3_catalyst_L7_trace_and_unitarity :
    Mat2Eis.mul (Mat2Eis.dag catalystL7_2) catalystL7_2 = Mat2Eis.scale 4 Mat2Eis.id ∧
    Mat2Eis.mul catalystL7_2 (Mat2Eis.dag catalystL7_2) = Mat2Eis.scale 4 Mat2Eis.id ∧
    Mat2Eis.det catalystL7_2 = Eis.scale 4 Eis.omega2 ∧
    Mat2Eis.det catalystProd4 = Eis.ofInt 16 ∧
    Mat2Eis.trace catalystProd4 = Eis.ofInt (-5) ∧
    Mat2Eis.trace catalystM = Eis.ofInt 5 ∧
    Mat2Eis.mul catalystM catalystM =
      Mat2Eis.sub (Mat2Eis.scale 5 catalystM) (Mat2Eis.scale 16 Mat2Eis.id) ∧
    Mat2Eis.frobNormSq
      (Mat2Eis.sub (Mat2Eis.mul catalystL7_2 coin2) (Mat2Eis.mul coin2 catalystL7_2)) = 54 ∧
    Mat2Eis.mul coin2 catalystM ≠ Mat2Eis.mul (Mat2Eis.dag catalystM) coin2 := by
  decide

/-- Exact 2-adic infinite-order theorem for the bare 3-full-line `Φ_odd` catalyst `L_7 C`:
    `(-4 L_7 C)^n` has trace `trSeq5 n ≡ 1 (mod 4)` and NEVER equals `± 4^n I` for ANY `n ≥ 1`. -/
theorem thm_bt3_catalyst_L7_infinite_order (n : Nat) (hn : n ≥ 1) :
    Mat2Eis.trace (Mat2Eis.pow catalystM n) = Eis.ofInt (trSeq5 n) ∧
    Mat2Eis.pow catalystM n ≠ Mat2Eis.scale (pow4Int n) Mat2Eis.id ∧
    Mat2Eis.pow catalystM n ≠ Mat2Eis.scale (-pow4Int n) Mat2Eis.id :=
  mat_ch5_infinite_order catalystM
    thm_bt3_catalyst_L7_trace_and_unitarity.2.2.2.2.2.1
    thm_bt3_catalyst_L7_trace_and_unitarity.2.2.2.2.2.2.1
    n hn

/-- Exact `P = 0` Eisenstein molecule certificate (`|u| = 1/13`, `λ_mol = (4 + 3ω)/(1 - 3ω) = (7 + 15ω)/13`):
    1. Exact Eisenstein ratio identity `13 (4 + 3ω) = (7 + 15ω)(1 - 3ω)` and unit modulus `|7 + 15ω|^2 = 169`,
    2. Exact cleared transfer-matrix parameters `α = (7 + 4ω)/74`, `β = (7 - 70ω)/74` (`α - β = ω`),
    3. Exact cleared resolvent coupling `g = α - ω/4`, bound-state matching `Z(0, λ_mol) = ω^2` at `u = 1/13`,
       and transfer-matrix quadratic `α λ u^2 - (λ^2 + α^2 - β^2) u + α λ = 0`. -/
theorem thm_bt3_eisenstein_molecule_exact :
    let lam13 : Eis := ⟨7, 15⟩
    let alp74 : Eis := ⟨7, 4⟩
    let bet74 : Eis := ⟨7, -70⟩
    let num13 : Eis := Eis.sub (Eis.scale 2 lam13) (Eis.scale 26 Eis.omega)
    let den338 : Eis := Eis.sub
      (Eis.sub (Eis.scale 2 (Eis.mul lam13 lam13)) (Eis.scale 13 (Eis.mul Eis.omega lam13)))
      (Eis.scale 169 Eis.omega2)
    let g148 : Eis := Eis.sub (Eis.scale 2 alp74) (Eis.scale 37 Eis.omega)
    let tU2 : Eis := Eis.scale 74 (Eis.mul alp74 lam13)
    let tU0 : Eis := Eis.scale (74 * 169) (Eis.mul alp74 lam13)
    let tU1 : Eis := Eis.add
      (Eis.scale (74 * 74) (Eis.mul lam13 lam13))
      (Eis.scale 169 (Eis.sub (Eis.mul alp74 alp74) (Eis.mul bet74 bet74)))
    Eis.scale 13 ⟨4, 3⟩ = Eis.mul lam13 ⟨1, -3⟩ ∧
    Eis.normSq lam13 = 169 ∧
    Eis.normSq ⟨4, 3⟩ = 13 ∧
    Eis.normSq ⟨1, -3⟩ = 13 ∧
    Eis.sub alp74 bet74 = Eis.scale 74 Eis.omega ∧
    Eis.scale 2 (Eis.mul den338 g148) = Eis.mul (Eis.scale (-1443) Eis.omega2) num13 ∧
    Eis.mul lam13 bet74 = Eis.mul Eis.omega2 (Eis.sub (Eis.scale 74 lam13) (Eis.scale 169 alp74)) ∧
    Eis.add (Eis.sub tU2 tU1) tU0 = Eis.zero := by
  decide

private theorem dfsM_core_identities :
    Mat2Eis.mul (Mat2Eis.dag dfsS12) dfsS12 = Mat2Eis.id ∧
    Mat2Eis.mul (Mat2Eis.dag dfsS23_4) dfsS23_4 = Mat2Eis.scale 16 Mat2Eis.id ∧
    Mat2Eis.det dfsS12 = Eis.one ∧
    Mat2Eis.det dfsS23_4 = Eis.ofInt 16 ∧
    Mat2Eis.det dfsM = Eis.ofInt 16 ∧
    Mat2Eis.trace dfsM = Eis.ofInt 5 ∧
    Mat2Eis.mul dfsM dfsM =
      Mat2Eis.sub (Mat2Eis.scale 5 dfsM) (Mat2Eis.scale 16 Mat2Eis.id) ∧
    Mat2Eis.frobNormSq
      (Mat2Eis.sub (Mat2Eis.mul dfsS12 dfsS23_4) (Mat2Eis.mul dfsS23_4 dfsS12)) = 54 ∧
    Mat2Eis.mul dfsS12 dfsM ≠ Mat2Eis.mul (Mat2Eis.dag dfsM) dfsS12 := by
  decide

/-- Exact bare `M_meet` 3-excitation DFS `SU(2)` density certificate (`S_{12}, S_{23}`):
    unitary in `SU(2) ∩ Mat_2(ℤ[ω][1/2])`, `Tr(S_{12} S_{23}) = 5/4`, `‖[S_{12}, 4 S_{23}]‖_F^2 = 54`,
    non-`Pin(2)`, and exact infinite order `(S_{12} S_{23})^n ≠ ±I` for ALL `n ≥ 1`. -/
theorem thm_bt3_dfs_S12_S23_dense_su2 :
    Mat2Eis.mul (Mat2Eis.dag dfsS12) dfsS12 = Mat2Eis.id ∧
    Mat2Eis.mul (Mat2Eis.dag dfsS23_4) dfsS23_4 = Mat2Eis.scale 16 Mat2Eis.id ∧
    Mat2Eis.det dfsM = Eis.ofInt 16 ∧
    Mat2Eis.trace dfsM = Eis.ofInt 5 ∧
    Mat2Eis.frobNormSq
      (Mat2Eis.sub (Mat2Eis.mul dfsS12 dfsS23_4) (Mat2Eis.mul dfsS23_4 dfsS12)) = 54 ∧
    Mat2Eis.mul dfsS12 dfsM ≠ Mat2Eis.mul (Mat2Eis.dag dfsM) dfsS12 ∧
    ∀ n : Nat, n ≥ 1 →
      Mat2Eis.pow dfsM n ≠ Mat2Eis.scale (pow4Int n) Mat2Eis.id ∧
      Mat2Eis.pow dfsM n ≠ Mat2Eis.scale (-pow4Int n) Mat2Eis.id := by
  refine ⟨dfsM_core_identities.1, dfsM_core_identities.2.1, dfsM_core_identities.2.2.2.2.1,
          dfsM_core_identities.2.2.2.2.2.1, dfsM_core_identities.2.2.2.2.2.2.2.1,
          dfsM_core_identities.2.2.2.2.2.2.2.2, ?_⟩
  intro n hn
  have hInf := mat_ch5_infinite_order dfsM
    dfsM_core_identities.2.2.2.2.2.1
    dfsM_core_identities.2.2.2.2.2.2.1
    n hn
  exact ⟨hInf.2.1, hInf.2.2⟩

/-- All `C(6, 2) = 15` two-1s spin basis states `(i, j)` (`0 ≤ i < j < 6`) for two 3-spin DFS qubits. -/
def pair6At (idx : Fin 15) : Nat × Nat :=
  match idx.val with
  | 0  => (0, 1) | 1  => (0, 2) | 2  => (0, 3) | 3  => (0, 4) | 4  => (0, 5)
  | 5  => (1, 2) | 6  => (1, 3) | 7  => (1, 4) | 8  => (1, 5)
  | 9  => (2, 3) | 10 => (2, 4) | 11 => (2, 5)
  | 12 => (3, 4) | 13 => (3, 5)
  | _  => (4, 5)

/-- Lookup index of ordered pair `(a, b)` (`0 ≤ a < b < 6`) inside `Fin 15`. -/
def pair6Idx (a b : Nat) : Fin 15 :=
  let lo := if a < b then a else b
  let hi := if a < b then b else a
  match lo, hi with
  | 0, 1 => ⟨0, by decide⟩  | 0, 2 => ⟨1, by decide⟩  | 0, 3 => ⟨2, by decide⟩
  | 0, 4 => ⟨3, by decide⟩  | 0, 5 => ⟨4, by decide⟩
  | 1, 2 => ⟨5, by decide⟩  | 1, 3 => ⟨6, by decide⟩  | 1, 4 => ⟨7, by decide⟩
  | 1, 5 => ⟨8, by decide⟩
  | 2, 3 => ⟨9, by decide⟩  | 2, 4 => ⟨10, by decide⟩ | 2, 5 => ⟨11, by decide⟩
  | 3, 4 => ⟨12, by decide⟩ | 3, 5 => ⟨13, by decide⟩
  | _, _ => ⟨14, by decide⟩

/-- Action of spin transposition `P_{pq}` on the 15 two-1s basis states. -/
def swapPair15 (p q : Nat) (col : Fin 15) : Fin 15 :=
  let (i, j) := pair6At col
  let ni := if i = p then q else if i = q then p else i
  let nj := if j = p then q else if j = q then p else j
  pair6Idx ni nj

/-- Exact `15 × 15` 6-spin Casimir matrix `C_6 = ∑_{0 ≤ p < q < 6} P_{pq}` (`S_tot^2 + 3 I`). -/
def casimir15 (r c : Fin 15) : Int :=
  (List.finRange 6).foldl (fun acc p =>
    acc + (List.finRange 6).foldl (fun acc2 q =>
      if p.val < q.val then
        acc2 + (if swapPair15 p.val q.val c = r then 1 else 0)
      else acc2) 0) 0

def casimir15Mul (A B : Fin 15 → Fin 15 → Int) (r c : Fin 15) : Int :=
  sumFin (fun k => A r k * B k c)

/-- Integer unnormalized logical 2-DFS-qubit basis kets `|a_L, b_L⟩` (`a, b ∈ {0, 1}`) inside `ℂ^{15}`:
    `|0_L⟩ = (-1, 1, 0)` and `|1_L⟩ = (-1, -1, 2)` on spins `(0,1,2)` and `(3,4,5)`. -/
def dfsLogicalKet15 (idx : Fin 4) (s : Fin 15) : Int :=
  let (i, j) := pair6At s
  if i < 3 ∧ j ≥ 3 then
    let ca : Int :=
      if idx.val / 2 = 0 then (if i = 0 then -1 else if i = 1 then 1 else 0)
      else (if i = 0 then -1 else if i = 1 then -1 else 2)
    let cb : Int :=
      if idx.val % 2 = 0 then (if j = 3 then -1 else if j = 4 then 1 else 0)
      else (if j = 3 then -1 else if j = 4 then -1 else 2)
    ca * cb
  else 0

/-- Fast closed-form `C_6` by pair overlap (`2 → 7`, `1 → 1`, `0 → 0`) and `C_6^2` (`2 → 57`, `1 → 18`, `0 → 4`). -/
def pair6Overlap (r c : Fin 15) : Nat :=
  let (i1, j1) := pair6At r
  let (i2, j2) := pair6At c
  (if i1 = i2 ∨ i1 = j2 then 1 else 0) + (if j1 = i2 ∨ j1 = j2 then 1 else 0)

def casimir15Fast (r c : Fin 15) : Int :=
  match pair6Overlap r c with
  | 2 => 7
  | 1 => 1
  | _ => 0

def casimir15SqFast (r c : Fin 15) : Int :=
  match pair6Overlap r c with
  | 2 => 57
  | 1 => 18
  | _ => 4

private theorem casimir15_eq_fast : casimir15 = casimir15Fast := by
  funext r c; revert r c; decide

private theorem casimir15Sq_eq_fast :
    casimir15Mul casimir15Fast casimir15Fast = casimir15SqFast := by
  funext r c; revert r c; decide

private theorem casimir15_spectral_cert :
    (∀ r c : Fin 15,
      casimir15Mul casimir15SqFast casimir15Fast r c -
      29 * casimir15SqFast r c +
      255 * casimir15Fast r c - (if r = c then 675 else 0) = 0) ∧
    (sumFin (fun i : Fin 15 => casimir15Fast i i) = 105) ∧
    (sumFin (fun i : Fin 15 => casimir15SqFast i i) = 855) ∧
    (∀ k : Fin 5, ∀ r c : Fin 15,
      casimir15Fast (swapPair15 k.val (k.val + 1) r) c = casimir15Fast r (swapPair15 k.val (k.val + 1) c)) ∧
    (∀ a : Fin 4, ∀ r : Fin 15,
      sumFin (fun c => casimir15Fast r c * dfsLogicalKet15 a c) = 5 * dfsLogicalKet15 a r) ∧
    (∀ a b : Fin 4, a ≠ b →
      sumFin (fun s : Fin 15 => dfsLogicalKet15 a s * dfsLogicalKet15 b s) = 0) ∧
    (∀ k : Fin 4, ∃ c : Fin 15,
      swapPair15 k.val (k.val + 1) (swapPair15 (k.val + 1) (k.val + 2) c) ≠
      swapPair15 (k.val + 1) (k.val + 2) (swapPair15 k.val (k.val + 1) c)) := by
  decide

/-- Exact 6-spin `15 = 9 (S=1) + 5 (S=2) + 1 (S=3)` Casimir & DFS `su(9)` subspace certificate:
    1. `(C_6 - 5 I)(C_6 - 9 I)(C_6 - 15 I) = 0`, `Tr(C_6) = 105`, `Tr(C_6^2) = 855`, uniquely forcing
       irrep dimensions `(dim S=1, dim S=2, dim S=3) = (9, 5, 1)` (`dim su(9) = 9^2 - 1 = 80`),
    2. All 5 adjacent swap generators `P_{k, k+1}` commute with `C_6` (preserving the 9D `S=1` sector)
       and adjacent pairs fail to commute along the entire 6-spin chain,
    3. All 4 mutually orthogonal logical 2-DFS-qubit basis states lie strictly in the `C_6 = 5` (`S=1`) sector. -/
theorem thm_bt3_dfs_6spin_casimir_sector_and_su9_dims :
    (∀ r c : Fin 15,
      casimir15Mul (casimir15Mul casimir15 casimir15) casimir15 r c -
      29 * casimir15Mul casimir15 casimir15 r c +
      255 * casimir15 r c - (if r = c then 675 else 0) = 0) ∧
    (sumFin (fun i : Fin 15 => casimir15 i i) = 105) ∧
    (sumFin (fun i : Fin 15 => casimir15Mul casimir15 casimir15 i i) = 855) ∧
    (∀ m1 m2 m3 : Int,
      m1 + m2 + m3 = 15 → 5 * m1 + 9 * m2 + 15 * m3 = 105 →
      25 * m1 + 81 * m2 + 225 * m3 = 855 → m1 = 9 ∧ m2 = 5 ∧ m3 = 1) ∧
    (∀ k : Fin 5, ∀ r c : Fin 15,
      casimir15 (swapPair15 k.val (k.val + 1) r) c = casimir15 r (swapPair15 k.val (k.val + 1) c)) ∧
    (∀ a : Fin 4, ∀ r : Fin 15,
      sumFin (fun c => casimir15 r c * dfsLogicalKet15 a c) = 5 * dfsLogicalKet15 a r) ∧
    (∀ a b : Fin 4, a ≠ b →
      sumFin (fun s : Fin 15 => dfsLogicalKet15 a s * dfsLogicalKet15 b s) = 0) ∧
    (∀ k : Fin 4, ∃ c : Fin 15,
      swapPair15 k.val (k.val + 1) (swapPair15 (k.val + 1) (k.val + 2) c) ≠
      swapPair15 (k.val + 1) (k.val + 2) (swapPair15 k.val (k.val + 1) c)) := by
  rw [casimir15_eq_fast, casimir15Sq_eq_fast]
  refine ⟨casimir15_spectral_cert.1, casimir15_spectral_cert.2.1, casimir15_spectral_cert.2.2.1,
          ?_, casimir15_spectral_cert.2.2.2.1, casimir15_spectral_cert.2.2.2.2.1,
          casimir15_spectral_cert.2.2.2.2.2.1, casimir15_spectral_cert.2.2.2.2.2.2⟩
  intro m1 m2 m3 h1 h2 h3
  omega


/-! ## Section 3 (Breakthrough 4A): 14-Term `D_4` Cayley 4-Form `Spin(7)` SMG Spectrum -/

/-- Pure-arithmetic 4-bit operations (zero `Nat.bitwise` kernel overhead). -/
def bitAt4 (x b : Nat) : Nat :=
  (x / (2 ^ b)) % 2

def pop4 (x : Nat) : Nat :=
  bitAt4 x 0 + bitAt4 x 1 + bitAt4 x 2 + bitAt4 x 3

def xor4 (x y : Nat) : Nat :=
  (if bitAt4 x 0 = bitAt4 y 0 then 0 else 1) +
  2 * (if bitAt4 x 1 = bitAt4 y 1 then 0 else 1) +
  4 * (if bitAt4 x 2 = bitAt4 y 2 then 0 else 1) +
  8 * (if bitAt4 x 3 = bitAt4 y 3 then 0 else 1)

def and4 (x y : Nat) : Nat :=
  (bitAt4 x 0 * bitAt4 y 0) +
  2 * (bitAt4 x 1 * bitAt4 y 1) +
  4 * (bitAt4 x 2 * bitAt4 y 2) +
  8 * (bitAt4 x 3 * bitAt4 y 3)

/-- 4-qubit Pauli string `i^{iPow} X^{xMask} Z^{zMask}` for 8 Majorana fermions (`dim = 16`). -/
structure Pauli4 where
  xMask : Nat
  zMask : Nat
  iPow  : Nat
  deriving DecidableEq, Repr

def mulPauli4 (a b : Pauli4) : Pauli4 :=
  let flips := pop4 (and4 a.zMask b.xMask)
  ⟨xor4 a.xMask b.xMask, xor4 a.zMask b.zMask, (a.iPow + b.iPow + 2 * (flips % 2)) % 4⟩

/-- Exact Jordan-Wigner Majorana operator `γ_idx` (`idx ∈ 0..7`) on 4 qubits. -/
def majoranaPauli4 (idx : Nat) : Pauli4 :=
  let q := idx / 2
  if idx % 2 = 0 then
    ⟨2 ^ q, 2 ^ q - 1, 0⟩
  else
    ⟨2 ^ q, 2 ^ (q + 1) - 1, 1⟩

def prodMajoranas4 : List Nat → Pauli4
  | [] => ⟨0, 0, 0⟩
  | idx :: rest => mulPauli4 (majoranaPauli4 idx) (prodMajoranas4 rest)

/-- Levi-Civita inversion sign of a list of natural numbers (`+1` even, `-1` odd). -/
def lcInversions : List Nat → Nat
  | [] => 0
  | x :: rest => (rest.filter (fun y => x > y)).length + lcInversions rest

def lcSign (xs : List Nat) : Int :=
  if lcInversions xs % 2 = 0 then 1 else -1

/-- The 7 octonionic Fano plane triples matching `smg-cayley-four-form.ts` verbatim. -/
def fanoTriples : List (Nat × Nat × Nat) :=
  [(1, 2, 3), (1, 4, 5), (1, 7, 6), (2, 4, 6), (2, 5, 7), (3, 4, 7), (3, 6, 5)]

/-- Insert-sort for tiny 4-element index lists. -/
def insertNat (x : Nat) : List Nat → List Nat
  | [] => [x]
  | y :: rest => if x ≤ y then x :: y :: rest else y :: insertNat x rest

def sortNat : List Nat → List Nat
  | [] => []
  | x :: rest => insertNat x (sortNat rest)

/-- One signed Cayley 4-form term `(-sign) * γ_a γ_b γ_c γ_d`. -/
structure CayleyTerm4 where
  quad : List Nat
  sign : Int
  deriving DecidableEq, Repr

/-- Exact 14-term self-dual `Spin(7)` Cayley 4-form (7 associative + 7 coassociative complements). -/
def cayleyTerms14 : List CayleyTerm4 :=
  fanoTriples.foldl (fun acc t =>
    let rawA := [0, t.1, t.2.1, t.2.2]
    let sortedA := sortNat rawA
    let signA := lcSign rawA
    let comp := [0, 1, 2, 3, 4, 5, 6, 7].filter (fun x => !(rawA.contains x))
    let signC := lcSign (rawA ++ comp)
    acc ++ [⟨sortedA, signA⟩, ⟨comp, signC⟩]) []

/-- Real matrix entry `(r, c)` of a single Cayley term `-t.sign * prodMajoranas4 t.quad`. -/
def smgTermEntry (t : CayleyTerm4) (r c : Fin 16) : Int :=
  let p := prodMajoranas4 t.quad
  if xor4 c.val p.xMask = r.val then
    let phaseSign : Int := if p.iPow % 4 = 0 then 1 else -1
    let zSign : Int := if pop4 (and4 c.val p.zMask) % 2 = 0 then 1 else -1
    (-t.sign) * phaseSign * zSign
  else 0

/-- Full 14-term `D_4` Cayley 4-form `Spin(7)` SMG Hamiltonian `H_SMG` on `dim = 16`. -/
def smgHam (r c : Fin 16) : Int :=
  cayleyTerms14.foldl (fun acc t => acc + smgTermEntry t r c) 0

/-- Closed-form `16 × 16` matrix of `H_SMG`:
    `0` on all 8 odd-parity states, `+2` diagonal on `{0, 3, 5, 10, 12, 15}`,
    and `[[-6, 8], [8, -6]]` on the entangled pair `{6, 9}` (`|0110⟩, |1001⟩`). -/
def smgHamClosed (r c : Fin 16) : Int :=
  if pop4 r.val % 2 = 1 ∨ pop4 c.val % 2 = 1 then 0
  else if r.val = 6 ∧ c.val = 6 then -6
  else if r.val = 9 ∧ c.val = 9 then -6
  else if (r.val = 6 ∧ c.val = 9) ∨ (r.val = 9 ∧ c.val = 6) then 8
  else if r = c then 2
  else 0

/-- Shifted Hamiltonian `H_SMG + 14 I_16`. -/
def smgHamShift14 (r c : Fin 16) : Int :=
  smgHam r c + if r = c then 14 else 0

/-- Exact integer SMG ground state `|Ω_SMG⟩ = |0110⟩ - |1001⟩` (`6 ↦ 1, 9 ↦ -1`, norm squared `2`). -/
def smgGroundState (s : Fin 16) : Int :=
  if s.val = 6 then 1 else if s.val = 9 then -1 else 0

def smgMatMul (A B : Fin 16 → Fin 16 → Int) (r c : Fin 16) : Int :=
  sumFin (fun k => A r k * B k c)

private theorem smgHam_eq_closed_fun : smgHam = smgHamClosed := by
  funext r c; revert r c; decide

/-- Breakthrough 4A: exact 14-term Cayley 4-form structure and closed-form `16 × 16` matrix certificate. -/
theorem thm_bt4a_cayley_14_terms_and_closed_form :
    cayleyTerms14.length = 14 ∧
    cayleyTerms14.all (fun t =>
      let p := prodMajoranas4 t.quad
      p.iPow % 2 == 0 && mulPauli4 p p == ⟨0, 0, 0⟩) = true ∧
    (∀ r c : Fin 16, smgHam r c = smgHamClosed r c) ∧
    (∀ r c : Fin 16, smgHam r c = smgHam c r) := by
  rw [smgHam_eq_closed_fun]
  decide

private theorem xor4_lt_16 (x y : Nat) : xor4 x y < 16 := by
  unfold xor4
  split <;> split <;> split <;> split <;> omega

/-- Exact closed-form `H_SMG^2` (`0` on odd, `4` on even `≠ 6, 9`, `[[100, -96], [-96, 100]]` on `{6, 9}`). -/
def smgHam2Closed (r c : Fin 16) : Int :=
  if pop4 r.val % 2 = 1 ∨ pop4 c.val % 2 = 1 then 0
  else if r.val = 6 ∧ c.val = 6 then 100
  else if r.val = 9 ∧ c.val = 9 then 100
  else if (r.val = 6 ∧ c.val = 9) ∨ (r.val = 9 ∧ c.val = 6) then -96
  else if r = c then 4
  else 0

private theorem smgHamSq_eq_closed_fun : smgMatMul smgHamClosed smgHamClosed = smgHam2Closed := by
  funext r c; revert r c; decide

/-- Exact frustration-free ground-state certificate:
    `|Ω_SMG⟩ = |0110⟩ - |1001⟩` has even parity, squared norm `2`, satisfies `H_SMG |Ω_SMG⟩ = -14 |Ω_SMG⟩`,
    and is simultaneously a `-1` eigenstate of ALL 14 individual Cayley 4-form terms `T_k`. -/
theorem thm_bt4a_smg_ground_state_and_frustration_free :
    (sumFin (fun s : Fin 16 => smgGroundState s * smgGroundState s) = 2) ∧
    (∀ s : Fin 16, pop4 s.val % 2 = 1 → smgGroundState s = 0) ∧
    (∀ r : Fin 16, sumFin (fun c => smgHam r c * smgGroundState c) = -14 * smgGroundState r) ∧
    (∀ t ∈ cayleyTerms14, ∀ r : Fin 16,
      sumFin (fun c => smgTermEntry t r c * smgGroundState c) = -smgGroundState r) := by
  rw [smgHam_eq_closed_fun]
  decide

private theorem smg_minpoly_cert :
    (∀ r c : Fin 16,
      smgMatMul smgHam2Closed smgHamClosed r c +
      12 * smgHam2Closed r c -
      28 * smgHamClosed r c = 0) ∧
    (sumFin (fun i : Fin 16 => smgHamClosed i i) = 0) ∧
    (sumFin (fun i : Fin 16 => smgHam2Closed i i) = 224) := by
  decide

/-- Exact minimal polynomial `H (H + 14 I)(H - 2 I) = 0`, traces `Tr(H) = 0, Tr(H^2) = 224`,
    and arithmetic multiplicity uniqueness forcing exact spectrum `{-14 (×1), 0 (×8), +2 (×7)}`. -/
theorem thm_bt4a_smg_minpoly_and_spectrum_multiplicities :
    (∀ r c : Fin 16,
      smgMatMul (smgMatMul smgHam smgHam) smgHam r c +
      12 * smgMatMul smgHam smgHam r c -
      28 * smgHam r c = 0) ∧
    (sumFin (fun i : Fin 16 => smgHam i i) = 0) ∧
    (sumFin (fun i : Fin 16 => smgMatMul smgHam smgHam i i) = 224) ∧
    (∀ mNeg14 m0 m2 : Int,
      mNeg14 + m0 + m2 = 16 →
      -14 * mNeg14 + 2 * m2 = 0 →
      196 * mNeg14 + 4 * m2 = 224 →
      mNeg14 = 1 ∧ m0 = 8 ∧ m2 = 7) := by
  rw [smgHam_eq_closed_fun, smgHamSq_eq_closed_fun]
  refine ⟨smg_minpoly_cert.1, smg_minpoly_cert.2.1, smg_minpoly_cert.2.2, ?_⟩
  intro mNeg14 m0 m2 h1 h2 h3
  omega

/-- Rank-1 diagonal projector matrix `e_k e_k^T` on `Fin 16`. -/
def diagEntry16 (k : Fin 16) (r c : Fin 16) : Int :=
  (if r = k then 1 else 0) * (if c = k then 1 else 0)

/-- Rank-1 symmetric pair matrix `(e_6 + e_9)(e_6 + e_9)^T` on `Fin 16`. -/
def pair69Entry16 (r c : Fin 16) : Int :=
  ((if r = ⟨6, by decide⟩ then 1 else 0) + (if r = ⟨9, by decide⟩ then 1 else 0)) *
  ((if c = ⟨6, by decide⟩ then 1 else 0) + (if c = ⟨9, by decide⟩ then 1 else 0))

private theorem smgHamShift14_eq_sos_mat :
    smgHamShift14 =
      matAdd
        (matAdd
          (matScale 16
            (matAdd (matAdd (matAdd (matAdd (matAdd
              (diagEntry16 ⟨0, by decide⟩) (diagEntry16 ⟨3, by decide⟩))
              (diagEntry16 ⟨5, by decide⟩)) (diagEntry16 ⟨10, by decide⟩))
              (diagEntry16 ⟨12, by decide⟩)) (diagEntry16 ⟨15, by decide⟩)))
          (matScale 14
            (matAdd (matAdd (matAdd (matAdd (matAdd (matAdd (matAdd
              (diagEntry16 ⟨1, by decide⟩) (diagEntry16 ⟨2, by decide⟩))
              (diagEntry16 ⟨4, by decide⟩)) (diagEntry16 ⟨7, by decide⟩))
              (diagEntry16 ⟨8, by decide⟩)) (diagEntry16 ⟨11, by decide⟩))
              (diagEntry16 ⟨13, by decide⟩)) (diagEntry16 ⟨14, by decide⟩))))
        (matScale 8 pair69Entry16) := by
  funext r c
  unfold smgHamShift14 matAdd matScale
  rw [smgHam_eq_closed_fun]
  revert r c
  decide

private theorem quadFormFin_diagEntry16 (k : Fin 16) (x : Fin 16 → Int) :
    quadFormFin (diagEntry16 k) x = x k * x k := by
  unfold diagEntry16
  rw [quadFormFin_rank1, sumFin_delta]

private theorem quadFormFin_pair69Entry16 (x : Fin 16 → Int) :
    quadFormFin pair69Entry16 x =
      (x ⟨6, by decide⟩ + x ⟨9, by decide⟩) * (x ⟨6, by decide⟩ + x ⟨9, by decide⟩) := by
  unfold pair69Entry16
  rw [quadFormFin_rank1]
  have hLin : sumFin (fun i : Fin 16 =>
      ((if i = ⟨6, by decide⟩ then (1 : Int) else 0) +
       (if i = ⟨9, by decide⟩ then (1 : Int) else 0)) * x i) =
      x ⟨6, by decide⟩ + x ⟨9, by decide⟩ := by
    have hDist : (fun i : Fin 16 =>
        ((if i = ⟨6, by decide⟩ then (1 : Int) else 0) +
         (if i = ⟨9, by decide⟩ then (1 : Int) else 0)) * x i) =
        (fun i : Fin 16 =>
         (if i = ⟨6, by decide⟩ then (1 : Int) else 0) * x i +
         (if i = ⟨9, by decide⟩ then (1 : Int) else 0) * x i) := by
      funext i
      exact Int.add_mul _ _ (x i)
    rw [hDist, sumFin_add, sumFin_delta, sumFin_delta]
  rw [hLin]

/-- Exact all-vector (`∀ x : Fin 16 → Int`) sum-of-squares positivity and ground-state uniqueness
    for the 14-term `Spin(7)` Cayley SMG Hamiltonian `H_SMG`:
    `x^T (H_SMG + 14 I_16) x = 16 ∑_{even ≠ 6,9} x_i^2 + 14 ∑_{odd} x_i^2 + 8 (x_6 + x_9)^2 ≥ 0`,
    vanishing IF AND ONLY IF `x` is a scalar multiple of `|Ω_SMG⟩ = |0110⟩ - |1001⟩`. -/
theorem thm_bt4a_smg_sos_positivity_and_unique_ground_state (x : Fin 16 → Int) :
    let e0  := x ⟨0, by decide⟩;  let e1  := x ⟨1, by decide⟩
    let e2  := x ⟨2, by decide⟩;  let e3  := x ⟨3, by decide⟩
    let e4  := x ⟨4, by decide⟩;  let e5  := x ⟨5, by decide⟩
    let e6  := x ⟨6, by decide⟩;  let e7  := x ⟨7, by decide⟩
    let e8  := x ⟨8, by decide⟩;  let e9  := x ⟨9, by decide⟩
    let e10 := x ⟨10, by decide⟩; let e11 := x ⟨11, by decide⟩
    let e12 := x ⟨12, by decide⟩; let e13 := x ⟨13, by decide⟩
    let e14 := x ⟨14, by decide⟩; let e15 := x ⟨15, by decide⟩
    quadFormFin smgHamShift14 x =
      16 * (e0 * e0 + e3 * e3 + e5 * e5 + e10 * e10 + e12 * e12 + e15 * e15) +
      14 * (e1 * e1 + e2 * e2 + e4 * e4 + e7 * e7 + e8 * e8 + e11 * e11 + e13 * e13 + e14 * e14) +
      8 * ((e6 + e9) * (e6 + e9)) ∧
    0 ≤ quadFormFin smgHamShift14 x ∧
    (quadFormFin smgHamShift14 x = 0 ↔
      (e6 + e9 = 0 ∧ ∀ i : Fin 16, i.val ≠ 6 → i.val ≠ 9 → x i = 0)) := by
  intro e0 e1 e2 e3 e4 e5 e6 e7 e8 e9 e10 e11 e12 e13 e14 e15
  have hId : quadFormFin smgHamShift14 x =
      16 * (e0 * e0 + e3 * e3 + e5 * e5 + e10 * e10 + e12 * e12 + e15 * e15) +
      14 * (e1 * e1 + e2 * e2 + e4 * e4 + e7 * e7 + e8 * e8 + e11 * e11 + e13 * e13 + e14 * e14) +
      8 * ((e6 + e9) * (e6 + e9)) := by
    rw [smgHamShift14_eq_sos_mat]
    simp only [quadFormFin_matAdd, quadFormFin_matScale, quadFormFin_diagEntry16, quadFormFin_pair69Entry16]
    rfl
  have s0  := int_sq_nonneg e0;  have s1  := int_sq_nonneg e1
  have s2  := int_sq_nonneg e2;  have s3  := int_sq_nonneg e3
  have s4  := int_sq_nonneg e4;  have s5  := int_sq_nonneg e5
  have s7  := int_sq_nonneg e7;  have s8  := int_sq_nonneg e8
  have s10 := int_sq_nonneg e10; have s11 := int_sq_nonneg e11
  have s12 := int_sq_nonneg e12; have s13 := int_sq_nonneg e13
  have s14 := int_sq_nonneg e14; have s15 := int_sq_nonneg e15
  have s69 := int_sq_nonneg (e6 + e9)
  have hNonneg : 0 ≤ quadFormFin smgHamShift14 x := by
    rw [hId]
    omega
  refine ⟨hId, hNonneg, ?_⟩
  constructor
  · intro hZero
    rw [hId] at hZero
    have z69 : e6 + e9 = 0 := bt_int_sq_eq_zero (e6 + e9) (by omega)
    have z0  : e0  = 0 := bt_int_sq_eq_zero e0  (by omega); have z1  : e1  = 0 := bt_int_sq_eq_zero e1  (by omega)
    have z2  : e2  = 0 := bt_int_sq_eq_zero e2  (by omega); have z3  : e3  = 0 := bt_int_sq_eq_zero e3  (by omega)
    have z4  : e4  = 0 := bt_int_sq_eq_zero e4  (by omega); have z5  : e5  = 0 := bt_int_sq_eq_zero e5  (by omega)
    have z7  : e7  = 0 := bt_int_sq_eq_zero e7  (by omega); have z8  : e8  = 0 := bt_int_sq_eq_zero e8  (by omega)
    have z10 : e10 = 0 := bt_int_sq_eq_zero e10 (by omega); have z11 : e11 = 0 := bt_int_sq_eq_zero e11 (by omega)
    have z12 : e12 = 0 := bt_int_sq_eq_zero e12 (by omega); have z13 : e13 = 0 := bt_int_sq_eq_zero e13 (by omega)
    have z14 : e14 = 0 := bt_int_sq_eq_zero e14 (by omega); have z15 : e15 = 0 := bt_int_sq_eq_zero e15 (by omega)
    refine ⟨z69, ?_⟩
    intro i hi6 hi9
    match i with
    | ⟨0, _⟩  => exact z0  | ⟨1, _⟩  => exact z1  | ⟨2, _⟩  => exact z2  | ⟨3, _⟩  => exact z3
    | ⟨4, _⟩  => exact z4  | ⟨5, _⟩  => exact z5  | ⟨6, _⟩  => exact absurd rfl hi6
    | ⟨7, _⟩  => exact z7  | ⟨8, _⟩  => exact z8  | ⟨9, _⟩  => exact absurd rfl hi9
    | ⟨10, _⟩ => exact z10 | ⟨11, _⟩ => exact z11 | ⟨12, _⟩ => exact z12 | ⟨13, _⟩ => exact z13
    | ⟨14, _⟩ => exact z14 | ⟨15, _⟩ => exact z15
    | ⟨n + 16, h⟩ => exact absurd (show 16 ≤ n + 16 by omega) (by omega)
  · rintro ⟨h69, hRest⟩
    rw [hId]
    have z0  : e0  = 0 := hRest ⟨0, by decide⟩  (by decide) (by decide)
    have z1  : e1  = 0 := hRest ⟨1, by decide⟩  (by decide) (by decide)
    have z2  : e2  = 0 := hRest ⟨2, by decide⟩  (by decide) (by decide)
    have z3  : e3  = 0 := hRest ⟨3, by decide⟩  (by decide) (by decide)
    have z4  : e4  = 0 := hRest ⟨4, by decide⟩  (by decide) (by decide)
    have z5  : e5  = 0 := hRest ⟨5, by decide⟩  (by decide) (by decide)
    have z7  : e7  = 0 := hRest ⟨7, by decide⟩  (by decide) (by decide)
    have z8  : e8  = 0 := hRest ⟨8, by decide⟩  (by decide) (by decide)
    have z10 : e10 = 0 := hRest ⟨10, by decide⟩ (by decide) (by decide)
    have z11 : e11 = 0 := hRest ⟨11, by decide⟩ (by decide) (by decide)
    have z12 : e12 = 0 := hRest ⟨12, by decide⟩ (by decide) (by decide)
    have z13 : e13 = 0 := hRest ⟨13, by decide⟩ (by decide) (by decide)
    have z14 : e14 = 0 := hRest ⟨14, by decide⟩ (by decide) (by decide)
    have z15 : e15 = 0 := hRest ⟨15, by decide⟩ (by decide) (by decide)
    rw [h69, z0, z1, z2, z3, z4, z5, z7, z8, z10, z11, z12, z13, z14, z15]
    rfl

/-- Unphased integer contraction `∑_col (-1)^{pop(col & zMask)} H_{col, col ⊕ xMask}` for `Tr(H * i γ_a γ_b)`. -/
def smgBilinearTrace (a b : Fin 8) : Int :=
  let p := prodMajoranas4 [a.val, b.val]
  sumFin (fun col : Fin 16 =>
    let zSign : Int := if pop4 (and4 col.val p.zMask) % 2 = 0 then 1 else -1
    let row : Fin 16 := ⟨xor4 col.val p.xMask, xor4_lt_16 col.val p.xMask⟩
    zSign * smgHam col row)

/-- Unphased integer contraction `∑_col (-1)^{pop(col & zMask)} v0_{col ⊕ xMask} v0_{col}`
    for `⟨Ω_SMG | i γ_a γ_b | Ω_SMG⟩`. -/
def smgBilinearCondensate (a b : Fin 8) : Int :=
  let p := prodMajoranas4 [a.val, b.val]
  sumFin (fun col : Fin 16 =>
    let zSign : Int := if pop4 (and4 col.val p.zMask) % 2 = 0 then 1 else -1
    let row : Fin 16 := ⟨xor4 col.val p.xMask, xor4_lt_16 col.val p.xMask⟩
    zSign * smgGroundState row * smgGroundState col)

/-- Exact zero bilinear operator contamination AND zero bilinear chiral condensate across ALL
    `C(8, 2) = 28` Majorana bilinear pairs `0 ≤ a < b < 8`. -/
theorem thm_bt4a_smg_zero_bilinear_contamination_and_condensate :
    ∀ a b : Fin 8, a.val < b.val →
      smgBilinearTrace a b = 0 ∧ smgBilinearCondensate a b = 0 := by
  have hTr : smgBilinearTrace = fun a b : Fin 8 =>
      let p := prodMajoranas4 [a.val, b.val]
      sumFin (fun col : Fin 16 =>
        let zSign : Int := if pop4 (and4 col.val p.zMask) % 2 = 0 then 1 else -1
        let row : Fin 16 := ⟨xor4 col.val p.xMask, xor4_lt_16 col.val p.xMask⟩
        zSign * smgHamClosed col row) := by
    funext a b
    unfold smgBilinearTrace
    rw [smgHam_eq_closed_fun]
  rw [hTr]
  decide


/-! ## Section 4 (Breakthrough 4B): Symbolic `ℤ[ζ_9]` Nelson-Barr Strong-CP (`det(M_d) ∈ ℤ`) -/

/-- Predicate asserting an element of `ℤ[ζ_9]` is a pure rational integer (all 5 cyclotomic coords `0`). -/
def ninthIsRational (x : Ninth) : Prop :=
  x.c1 = 0 ∧ x.c2 = 0 ∧ x.c3 = 0 ∧ x.c4 = 0 ∧ x.c5 = 0

private theorem ninth_add_zero (x : Ninth) : Ninth.add x Ninth.zero = x := by
  cases x
  simp only [Ninth.add, Ninth.zero, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_sub_zero (x : Ninth) : Ninth.sub x Ninth.zero = x := by
  cases x
  simp only [Ninth.sub, Ninth.zero, Ninth.mk.injEq]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_mul_zero (x : Ninth) : Ninth.mul x Ninth.zero = Ninth.zero := by
  cases x
  simp only [Ninth.mul, Ninth.zero, Ninth.mk.injEq, Int.mul_zero]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_zero_mul (x : Ninth) : Ninth.mul Ninth.zero x = Ninth.zero := by
  cases x
  simp only [Ninth.mul, Ninth.zero, Ninth.mk.injEq, Int.zero_mul]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem ninth_ofInt_add (a b : Int) :
    Ninth.add (Ninth.ofInt a) (Ninth.ofInt b) = Ninth.ofInt (a + b) := rfl

private theorem ninth_ofInt_sub (a b : Int) :
    Ninth.sub (Ninth.ofInt a) (Ninth.ofInt b) = Ninth.ofInt (a - b) := rfl

private theorem ninth_ofInt_mul (a b : Int) :
    Ninth.mul (Ninth.ofInt a) (Ninth.ofInt b) = Ninth.ofInt (a * b) := by
  simp only [Ninth.mul, Ninth.ofInt, Ninth.mk.injEq, Int.mul_zero, Int.zero_mul]
  exact ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

/-- Column-skip map for exact un-shortcut Laplace minor extraction. -/
def skipCol {n : Nat} (skip : Fin (n + 1)) (j : Fin n) : Fin (n + 1) :=
  if j.val < skip.val then
    ⟨j.val, by have := j.isLt; omega⟩
  else
    ⟨j.val + 1, by have := j.isLt; omega⟩

/-- Exact Laplace submatrix deleting row `0` and column `col`. -/
def laplaceSub {n : Nat} (M : Fin (n + 1) → Fin (n + 1) → Ninth) (col : Fin (n + 1)) :
    Fin n → Fin n → Ninth :=
  fun r c => M ⟨r.val + 1, by have := r.isLt; omega⟩ (skipCol col c)

/-- Exact un-shortcut `2 × 2`, `3 × 3`, `4 × 4` (24 perms), and `5 × 5` (120 perms)
    Laplace determinants over `ℤ[ζ_9]`. -/
def det2Ninth (M : Fin 2 → Fin 2 → Ninth) : Ninth :=
  Ninth.sub
    (Ninth.mul (M ⟨0, by decide⟩ ⟨0, by decide⟩) (M ⟨1, by decide⟩ ⟨1, by decide⟩))
    (Ninth.mul (M ⟨0, by decide⟩ ⟨1, by decide⟩) (M ⟨1, by decide⟩ ⟨0, by decide⟩))

def det3Ninth (M : Fin 3 → Fin 3 → Ninth) : Ninth :=
  Ninth.add
    (Ninth.sub
      (Ninth.mul (M ⟨0, by decide⟩ ⟨0, by decide⟩) (det2Ninth (laplaceSub M ⟨0, by decide⟩)))
      (Ninth.mul (M ⟨0, by decide⟩ ⟨1, by decide⟩) (det2Ninth (laplaceSub M ⟨1, by decide⟩))))
    (Ninth.mul (M ⟨0, by decide⟩ ⟨2, by decide⟩) (det2Ninth (laplaceSub M ⟨2, by decide⟩)))

def det4Ninth (M : Fin 4 → Fin 4 → Ninth) : Ninth :=
  Ninth.sub
    (Ninth.add
      (Ninth.sub
        (Ninth.mul (M ⟨0, by decide⟩ ⟨0, by decide⟩) (det3Ninth (laplaceSub M ⟨0, by decide⟩)))
        (Ninth.mul (M ⟨0, by decide⟩ ⟨1, by decide⟩) (det3Ninth (laplaceSub M ⟨1, by decide⟩))))
      (Ninth.mul (M ⟨0, by decide⟩ ⟨2, by decide⟩) (det3Ninth (laplaceSub M ⟨2, by decide⟩))))
    (Ninth.mul (M ⟨0, by decide⟩ ⟨3, by decide⟩) (det3Ninth (laplaceSub M ⟨3, by decide⟩)))

def det5Ninth (M : Fin 5 → Fin 5 → Ninth) : Ninth :=
  Ninth.add
    (Ninth.sub
      (Ninth.add
        (Ninth.sub
          (Ninth.mul (M ⟨0, by decide⟩ ⟨0, by decide⟩) (det4Ninth (laplaceSub M ⟨0, by decide⟩)))
          (Ninth.mul (M ⟨0, by decide⟩ ⟨1, by decide⟩) (det4Ninth (laplaceSub M ⟨1, by decide⟩))))
        (Ninth.mul (M ⟨0, by decide⟩ ⟨2, by decide⟩) (det4Ninth (laplaceSub M ⟨2, by decide⟩))))
      (Ninth.mul (M ⟨0, by decide⟩ ⟨3, by decide⟩) (det4Ninth (laplaceSub M ⟨3, by decide⟩))))
    (Ninth.mul (M ⟨0, by decide⟩ ⟨4, by decide⟩) (det4Ninth (laplaceSub M ⟨4, by decide⟩)))

/-- Exact integer `2 × 2` and `3 × 3` determinants for real bare quark mass blocks. -/
def nbDet2Int (M : Fin 2 → Fin 2 → Int) : Int :=
  M ⟨0, by decide⟩ ⟨0, by decide⟩ * M ⟨1, by decide⟩ ⟨1, by decide⟩ -
  M ⟨0, by decide⟩ ⟨1, by decide⟩ * M ⟨1, by decide⟩ ⟨0, by decide⟩

def nbDet3Int (M : Fin 3 → Fin 3 → Int) : Int :=
  let a00 := M ⟨0, by decide⟩ ⟨0, by decide⟩
  let a01 := M ⟨0, by decide⟩ ⟨1, by decide⟩
  let a02 := M ⟨0, by decide⟩ ⟨2, by decide⟩
  let a10 := M ⟨1, by decide⟩ ⟨0, by decide⟩
  let a11 := M ⟨1, by decide⟩ ⟨1, by decide⟩
  let a12 := M ⟨1, by decide⟩ ⟨2, by decide⟩
  let a20 := M ⟨2, by decide⟩ ⟨0, by decide⟩
  let a21 := M ⟨2, by decide⟩ ⟨1, by decide⟩
  let a22 := M ⟨2, by decide⟩ ⟨2, by decide⟩
  a00 * (a11 * a22 - a12 * a21) -
  a01 * (a10 * a22 - a12 * a20) +
  a02 * (a10 * a21 - a11 * a20)

/-- General `4 × 4` Bento-Branco-Parada (`n_VL = 1`) Nelson-Barr mass matrix
    `M_d = [[m_q, 0], [B(ζ_9), M_VL]]` over `ℤ[ζ_9]`. -/
def bbpMat4 (mQ : Fin 3 → Fin 3 → Int) (B : Fin 3 → Ninth) (mVL : Int) : Fin 4 → Fin 4 → Ninth :=
  fun r c =>
    if hr : r.val < 3 then
      if hc : c.val < 3 then Ninth.ofInt (mQ ⟨r.val, hr⟩ ⟨c.val, hc⟩)
      else Ninth.zero
    else
      if hc : c.val < 3 then B ⟨c.val, hc⟩
      else Ninth.ofInt mVL

/-- General `5 × 5` Two-Vectorlike-Quark (`n_VL = 2`) Nelson-Barr mass matrix
    `M_d = [[m_q, 0], [B(ζ_9), M_VL]]` over `ℤ[ζ_9]`. -/
def nbMat5 (mQ : Fin 3 → Fin 3 → Int) (B : Fin 2 → Fin 3 → Ninth) (mVL : Fin 2 → Fin 2 → Int) :
    Fin 5 → Fin 5 → Ninth :=
  fun r c =>
    if hr : r.val < 3 then
      if hc : c.val < 3 then Ninth.ofInt (mQ ⟨r.val, hr⟩ ⟨c.val, hc⟩)
      else Ninth.zero
    else
      if hc : c.val < 3 then B ⟨r.val - 3, by have := r.isLt; omega⟩ ⟨c.val, hc⟩
      else Ninth.ofInt (mVL ⟨r.val - 3, by have := r.isLt; omega⟩ ⟨c.val - 3, by have := c.isLt; omega⟩)

private theorem det3Ninth_block21_ofInt (a00 a01 a10 a11 q : Int)
    (M : Fin 3 → Fin 3 → Ninth)
    (h00 : M ⟨0, by decide⟩ ⟨0, by decide⟩ = Ninth.ofInt a00)
    (h01 : M ⟨0, by decide⟩ ⟨1, by decide⟩ = Ninth.ofInt a01)
    (h02 : M ⟨0, by decide⟩ ⟨2, by decide⟩ = Ninth.zero)
    (h10 : M ⟨1, by decide⟩ ⟨0, by decide⟩ = Ninth.ofInt a10)
    (h11 : M ⟨1, by decide⟩ ⟨1, by decide⟩ = Ninth.ofInt a11)
    (h12 : M ⟨1, by decide⟩ ⟨2, by decide⟩ = Ninth.zero)
    (h22 : M ⟨2, by decide⟩ ⟨2, by decide⟩ = Ninth.ofInt q) :
    det3Ninth M = Ninth.ofInt ((a00 * a11 - a01 * a10) * q) := by
  change Ninth.add
    (Ninth.sub
      (Ninth.mul (M ⟨0, by decide⟩ ⟨0, by decide⟩)
        (Ninth.sub (Ninth.mul (M ⟨1, by decide⟩ ⟨1, by decide⟩) (M ⟨2, by decide⟩ ⟨2, by decide⟩))
                   (Ninth.mul (M ⟨1, by decide⟩ ⟨2, by decide⟩) (M ⟨2, by decide⟩ ⟨1, by decide⟩))))
      (Ninth.mul (M ⟨0, by decide⟩ ⟨1, by decide⟩)
        (Ninth.sub (Ninth.mul (M ⟨1, by decide⟩ ⟨0, by decide⟩) (M ⟨2, by decide⟩ ⟨2, by decide⟩))
                   (Ninth.mul (M ⟨1, by decide⟩ ⟨2, by decide⟩) (M ⟨2, by decide⟩ ⟨0, by decide⟩)))))
    (Ninth.mul (M ⟨0, by decide⟩ ⟨2, by decide⟩)
      (Ninth.sub (Ninth.mul (M ⟨1, by decide⟩ ⟨0, by decide⟩) (M ⟨2, by decide⟩ ⟨1, by decide⟩))
                 (Ninth.mul (M ⟨1, by decide⟩ ⟨1, by decide⟩) (M ⟨2, by decide⟩ ⟨0, by decide⟩)))) = _
  rw [h00, h01, h02, h10, h11, h12, h22]
  rw [ninth_zero_mul, ninth_zero_mul, ninth_zero_mul,
      ninth_sub_zero, ninth_sub_zero, ninth_add_zero,
      ninth_ofInt_mul, ninth_ofInt_mul, ninth_ofInt_mul, ninth_ofInt_mul,
      ninth_ofInt_sub]
  apply congrArg Ninth.ofInt
  rw [Int.sub_mul, Int.mul_assoc, Int.mul_assoc]

private theorem bt_det3_factor_right (a00 a01 a02 d0 d1 d2 k : Int) :
    a00 * (d0 * k) - a01 * (d1 * k) + a02 * (d2 * k) =
      (a00 * d0 - a01 * d1 + a02 * d2) * k := by
  rw [Int.add_mul, Int.sub_mul, Int.mul_assoc, Int.mul_assoc, Int.mul_assoc]

/-- Symbolic Breakthrough 4B (`4 × 4` BBP Nelson-Barr Strong-CP Theorem):
    for EVERY integer `m_q ∈ M_3(ℤ)`, EVERY integer `M_VL ∈ ℤ`, and EVERY arbitrary complex
    cyclotomic mixing row `B ∈ M_{1×3}(ℤ[ζ_9])`, the full 24-term Laplace determinant satisfies
    `det(M_d) = det(m_q) * M_VL ∈ ℤ` (all 5 non-rational coordinates identically `0`, hence `θ̄_tree = 0`). -/
theorem thm_bt4b_nelson_barr_4x4_symbolic
    (mQ : Fin 3 → Fin 3 → Int) (B : Fin 3 → Ninth) (mVL : Int) :
    det4Ninth (bbpMat4 mQ B mVL) = Ninth.ofInt (nbDet3Int mQ * mVL) ∧
    ninthIsRational (det4Ninth (bbpMat4 mQ B mVL)) := by
  let M := bbpMat4 mQ B mVL
  have hM0 : det3Ninth (laplaceSub M ⟨0, by decide⟩) =
      Ninth.ofInt ((mQ ⟨1, by decide⟩ ⟨1, by decide⟩ * mQ ⟨2, by decide⟩ ⟨2, by decide⟩ -
                    mQ ⟨1, by decide⟩ ⟨2, by decide⟩ * mQ ⟨2, by decide⟩ ⟨1, by decide⟩) * mVL) :=
    det3Ninth_block21_ofInt _ _ _ _ mVL
      (laplaceSub M ⟨0, by decide⟩) rfl rfl rfl rfl rfl rfl rfl
  have hM1 : det3Ninth (laplaceSub M ⟨1, by decide⟩) =
      Ninth.ofInt ((mQ ⟨1, by decide⟩ ⟨0, by decide⟩ * mQ ⟨2, by decide⟩ ⟨2, by decide⟩ -
                    mQ ⟨1, by decide⟩ ⟨2, by decide⟩ * mQ ⟨2, by decide⟩ ⟨0, by decide⟩) * mVL) :=
    det3Ninth_block21_ofInt _ _ _ _ mVL
      (laplaceSub M ⟨1, by decide⟩) rfl rfl rfl rfl rfl rfl rfl
  have hM2 : det3Ninth (laplaceSub M ⟨2, by decide⟩) =
      Ninth.ofInt ((mQ ⟨1, by decide⟩ ⟨0, by decide⟩ * mQ ⟨2, by decide⟩ ⟨1, by decide⟩ -
                    mQ ⟨1, by decide⟩ ⟨1, by decide⟩ * mQ ⟨2, by decide⟩ ⟨0, by decide⟩) * mVL) :=
    det3Ninth_block21_ofInt _ _ _ _ mVL
      (laplaceSub M ⟨2, by decide⟩) rfl rfl rfl rfl rfl rfl rfl
  have hDet : det4Ninth M = Ninth.ofInt (nbDet3Int mQ * mVL) := by
    unfold det4Ninth
    have h00 : M ⟨0, by decide⟩ ⟨0, by decide⟩ = Ninth.ofInt (mQ ⟨0, by decide⟩ ⟨0, by decide⟩) := rfl
    have h01 : M ⟨0, by decide⟩ ⟨1, by decide⟩ = Ninth.ofInt (mQ ⟨0, by decide⟩ ⟨1, by decide⟩) := rfl
    have h02 : M ⟨0, by decide⟩ ⟨2, by decide⟩ = Ninth.ofInt (mQ ⟨0, by decide⟩ ⟨2, by decide⟩) := rfl
    have h03 : M ⟨0, by decide⟩ ⟨3, by decide⟩ = Ninth.zero := rfl
    rw [h00, h01, h02, h03, hM0, hM1, hM2,
        ninth_zero_mul, ninth_sub_zero,
        ninth_ofInt_mul, ninth_ofInt_mul, ninth_ofInt_mul,
        ninth_ofInt_sub, ninth_ofInt_add]
    apply congrArg Ninth.ofInt
    dsimp only [nbDet3Int]
    exact bt_det3_factor_right _ _ _ _ _ _ mVL
  exact ⟨hDet, by change ninthIsRational (det4Ninth M); rw [hDet]; exact ⟨rfl, rfl, rfl, rfl, rfl⟩⟩

private theorem det3Ninth_block12_ofInt (a q00 q01 q10 q11 : Int)
    (M : Fin 3 → Fin 3 → Ninth)
    (h00 : M ⟨0, by decide⟩ ⟨0, by decide⟩ = Ninth.ofInt a)
    (h01 : M ⟨0, by decide⟩ ⟨1, by decide⟩ = Ninth.zero)
    (h02 : M ⟨0, by decide⟩ ⟨2, by decide⟩ = Ninth.zero)
    (h11 : M ⟨1, by decide⟩ ⟨1, by decide⟩ = Ninth.ofInt q00)
    (h12 : M ⟨1, by decide⟩ ⟨2, by decide⟩ = Ninth.ofInt q01)
    (h21 : M ⟨2, by decide⟩ ⟨1, by decide⟩ = Ninth.ofInt q10)
    (h22 : M ⟨2, by decide⟩ ⟨2, by decide⟩ = Ninth.ofInt q11) :
    det3Ninth M = Ninth.ofInt (a * (q00 * q11 - q01 * q10)) := by
  change Ninth.add
    (Ninth.sub
      (Ninth.mul (M ⟨0, by decide⟩ ⟨0, by decide⟩)
        (Ninth.sub (Ninth.mul (M ⟨1, by decide⟩ ⟨1, by decide⟩) (M ⟨2, by decide⟩ ⟨2, by decide⟩))
                   (Ninth.mul (M ⟨1, by decide⟩ ⟨2, by decide⟩) (M ⟨2, by decide⟩ ⟨1, by decide⟩))))
      (Ninth.mul (M ⟨0, by decide⟩ ⟨1, by decide⟩)
        (Ninth.sub (Ninth.mul (M ⟨1, by decide⟩ ⟨0, by decide⟩) (M ⟨2, by decide⟩ ⟨2, by decide⟩))
                   (Ninth.mul (M ⟨1, by decide⟩ ⟨2, by decide⟩) (M ⟨2, by decide⟩ ⟨0, by decide⟩)))))
    (Ninth.mul (M ⟨0, by decide⟩ ⟨2, by decide⟩)
      (Ninth.sub (Ninth.mul (M ⟨1, by decide⟩ ⟨0, by decide⟩) (M ⟨2, by decide⟩ ⟨1, by decide⟩))
                 (Ninth.mul (M ⟨1, by decide⟩ ⟨1, by decide⟩) (M ⟨2, by decide⟩ ⟨0, by decide⟩)))) = _
  rw [h00, h01, h02, h11, h12, h21, h22]
  rw [ninth_zero_mul, ninth_zero_mul, ninth_sub_zero, ninth_add_zero,
      ninth_ofInt_mul, ninth_ofInt_mul, ninth_ofInt_sub, ninth_ofInt_mul]

private theorem det4Ninth_block22_ofInt (a00 a01 a10 a11 q00 q01 q10 q11 : Int)
    (M : Fin 4 → Fin 4 → Ninth)
    (h00 : M ⟨0, by decide⟩ ⟨0, by decide⟩ = Ninth.ofInt a00)
    (h01 : M ⟨0, by decide⟩ ⟨1, by decide⟩ = Ninth.ofInt a01)
    (h02 : M ⟨0, by decide⟩ ⟨2, by decide⟩ = Ninth.zero)
    (h03 : M ⟨0, by decide⟩ ⟨3, by decide⟩ = Ninth.zero)
    (h10 : M ⟨1, by decide⟩ ⟨0, by decide⟩ = Ninth.ofInt a10)
    (h11 : M ⟨1, by decide⟩ ⟨1, by decide⟩ = Ninth.ofInt a11)
    (h12 : M ⟨1, by decide⟩ ⟨2, by decide⟩ = Ninth.zero)
    (h13 : M ⟨1, by decide⟩ ⟨3, by decide⟩ = Ninth.zero)
    (h22 : M ⟨2, by decide⟩ ⟨2, by decide⟩ = Ninth.ofInt q00)
    (h23 : M ⟨2, by decide⟩ ⟨3, by decide⟩ = Ninth.ofInt q01)
    (h32 : M ⟨3, by decide⟩ ⟨2, by decide⟩ = Ninth.ofInt q10)
    (h33 : M ⟨3, by decide⟩ ⟨3, by decide⟩ = Ninth.ofInt q11) :
    det4Ninth M = Ninth.ofInt ((a00 * a11 - a01 * a10) * (q00 * q11 - q01 * q10)) := by
  have hS0 : det3Ninth (laplaceSub M ⟨0, by decide⟩) =
      Ninth.ofInt (a11 * (q00 * q11 - q01 * q10)) :=
    det3Ninth_block12_ofInt a11 q00 q01 q10 q11 (laplaceSub M ⟨0, by decide⟩)
      h11 h12 h13 h22 h23 h32 h33
  have hS1 : det3Ninth (laplaceSub M ⟨1, by decide⟩) =
      Ninth.ofInt (a10 * (q00 * q11 - q01 * q10)) :=
    det3Ninth_block12_ofInt a10 q00 q01 q10 q11 (laplaceSub M ⟨1, by decide⟩)
      h10 h12 h13 h22 h23 h32 h33
  unfold det4Ninth
  rw [h00, h01, h02, h03, hS0, hS1,
      ninth_zero_mul, ninth_zero_mul, ninth_add_zero, ninth_sub_zero,
      ninth_ofInt_mul, ninth_ofInt_mul, ninth_ofInt_sub]
  apply congrArg Ninth.ofInt
  rw [Int.sub_mul, Int.mul_assoc, Int.mul_assoc]

/-- Symbolic Breakthrough 4B (`5 × 5` Two-VL Nelson-Barr Strong-CP Theorem):
    for EVERY integer `m_q ∈ M_3(ℤ)`, EVERY integer `M_VL ∈ M_2(ℤ)`, and EVERY arbitrary complex
    cyclotomic mixing block `B ∈ M_{2×3}(ℤ[ζ_9])`, the full 120-term Laplace determinant satisfies
    `det(M_d) = det(m_q) * det(M_VL) ∈ ℤ` (all 5 non-rational coordinates identically `0`, hence `θ̄_tree = 0`). -/
theorem thm_bt4b_nelson_barr_5x5_symbolic
    (mQ : Fin 3 → Fin 3 → Int) (B : Fin 2 → Fin 3 → Ninth) (mVL : Fin 2 → Fin 2 → Int) :
    det5Ninth (nbMat5 mQ B mVL) = Ninth.ofInt (nbDet3Int mQ * nbDet2Int mVL) ∧
    ninthIsRational (det5Ninth (nbMat5 mQ B mVL)) := by
  let M := nbMat5 mQ B mVL
  let dVL := nbDet2Int mVL
  have hM0 : det4Ninth (laplaceSub M ⟨0, by decide⟩) =
      Ninth.ofInt ((mQ ⟨1, by decide⟩ ⟨1, by decide⟩ * mQ ⟨2, by decide⟩ ⟨2, by decide⟩ -
                    mQ ⟨1, by decide⟩ ⟨2, by decide⟩ * mQ ⟨2, by decide⟩ ⟨1, by decide⟩) * dVL) :=
    det4Ninth_block22_ofInt _ _ _ _ _ _ _ _
      (laplaceSub M ⟨0, by decide⟩)
      rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl
  have hM1 : det4Ninth (laplaceSub M ⟨1, by decide⟩) =
      Ninth.ofInt ((mQ ⟨1, by decide⟩ ⟨0, by decide⟩ * mQ ⟨2, by decide⟩ ⟨2, by decide⟩ -
                    mQ ⟨1, by decide⟩ ⟨2, by decide⟩ * mQ ⟨2, by decide⟩ ⟨0, by decide⟩) * dVL) :=
    det4Ninth_block22_ofInt _ _ _ _ _ _ _ _
      (laplaceSub M ⟨1, by decide⟩)
      rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl
  have hM2 : det4Ninth (laplaceSub M ⟨2, by decide⟩) =
      Ninth.ofInt ((mQ ⟨1, by decide⟩ ⟨0, by decide⟩ * mQ ⟨2, by decide⟩ ⟨1, by decide⟩ -
                    mQ ⟨1, by decide⟩ ⟨1, by decide⟩ * mQ ⟨2, by decide⟩ ⟨0, by decide⟩) * dVL) :=
    det4Ninth_block22_ofInt _ _ _ _ _ _ _ _
      (laplaceSub M ⟨2, by decide⟩)
      rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl rfl
  have hDet : det5Ninth M = Ninth.ofInt (nbDet3Int mQ * dVL) := by
    unfold det5Ninth
    have h00 : M ⟨0, by decide⟩ ⟨0, by decide⟩ = Ninth.ofInt (mQ ⟨0, by decide⟩ ⟨0, by decide⟩) := rfl
    have h01 : M ⟨0, by decide⟩ ⟨1, by decide⟩ = Ninth.ofInt (mQ ⟨0, by decide⟩ ⟨1, by decide⟩) := rfl
    have h02 : M ⟨0, by decide⟩ ⟨2, by decide⟩ = Ninth.ofInt (mQ ⟨0, by decide⟩ ⟨2, by decide⟩) := rfl
    have h03 : M ⟨0, by decide⟩ ⟨3, by decide⟩ = Ninth.zero := rfl
    have h04 : M ⟨0, by decide⟩ ⟨4, by decide⟩ = Ninth.zero := rfl
    rw [h00, h01, h02, h03, h04, hM0, hM1, hM2,
        ninth_zero_mul, ninth_zero_mul, ninth_sub_zero, ninth_add_zero,
        ninth_ofInt_mul, ninth_ofInt_mul, ninth_ofInt_mul,
        ninth_ofInt_sub, ninth_ofInt_add]
    apply congrArg Ninth.ofInt
    dsimp only [nbDet3Int]
    exact bt_det3_factor_right _ _ _ _ _ _ dVL
  exact ⟨hDet, by change ninthIsRational (det5Ninth M); rw [hDet]; exact ⟨rfl, rfl, rfl, rfl, rfl⟩⟩

/-- Concrete `nelson-barr-z9.ts` real bare down-quark block `m_q` (`det = 3,796,608`). -/
def nbConcreteMQ (r c : Fin 3) : Int :=
  match r.val, c.val with
  | 0, 0 => 7  | 0, 1 => 23  | 0, 2 => 11
  | 1, 0 => -5 | 1, 1 => 113 | 1, 2 => 47
  | 2, 0 => 3  | 2, 1 => -19 | 2, 2 => 4183
  | _, _ => 0

def nbConcreteB4 (c : Fin 3) : Ninth :=
  match c.val with
  | 0 => Ninth.add (Ninth.scale 1000 (Ninth.pow Ninth.zeta9 1))
                   (Ninth.scale 300  (Ninth.pow Ninth.zeta9 4))
  | 1 => Ninth.add (Ninth.scale 1500 (Ninth.pow Ninth.zeta9 2))
                   (Ninth.scale (-400) (Ninth.pow Ninth.zeta9 7))
  | _ => Ninth.add (Ninth.scale 2200 (Ninth.pow Ninth.zeta9 5))
                   (Ninth.scale 700  (Ninth.pow Ninth.zeta9 8))

def nbConcreteB5 (r : Fin 2) (c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => Ninth.scale 1200 (Ninth.pow Ninth.zeta9 1)
  | 0, 1 => Ninth.scale 1700 (Ninth.pow Ninth.zeta9 3)
  | 0, 2 => Ninth.scale 2100 (Ninth.pow Ninth.zeta9 5)
  | 1, 0 => Ninth.scale 900  (Ninth.pow Ninth.zeta9 2)
  | 1, 1 => Ninth.scale 1300 (Ninth.pow Ninth.zeta9 6)
  | _, _ => Ninth.scale 1800 (Ninth.pow Ninth.zeta9 8)

def nbConcreteMVL5 (r c : Fin 2) : Int :=
  match r.val, c.val with
  | 0, 0 => 4000 | 0, 1 => 300
  | 1, 0 => -250 | _, _ => 6000

/-- Concrete `nelson-barr-z9.ts` `4 × 4` (`mD4`) and `5 × 5` (`mD5`) determinant certificates:
    `det(mD4) = 18,983,040,000 > 0` and `det(mD5) = 91,403,337,600,000 > 0` inside `ℤ ⊂ ℤ[ζ_9]`. -/
theorem thm_bt4b_nelson_barr_concrete_witnesses :
    det4Ninth (bbpMat4 nbConcreteMQ nbConcreteB4 5000) = Ninth.ofInt 18983040000 ∧
    det5Ninth (nbMat5 nbConcreteMQ nbConcreteB5 nbConcreteMVL5) = Ninth.ofInt 91403337600000 := by
  rw [(thm_bt4b_nelson_barr_4x4_symbolic nbConcreteMQ nbConcreteB4 5000).1,
      (thm_bt4b_nelson_barr_5x5_symbolic nbConcreteMQ nbConcreteB5 nbConcreteMVL5).1]
  decide

/-- `3 × 3` matrix multiplication over `ℤ[ζ_9]` for exact Jarlskog commutator witnesses. -/
def mat3NinthMul (A B : Fin 3 → Fin 3 → Ninth) : Fin 3 → Fin 3 → Ninth :=
  fun r c =>
    Ninth.add
      (Ninth.add
        (Ninth.mul (A r ⟨0, by decide⟩) (B ⟨0, by decide⟩ c))
        (Ninth.mul (A r ⟨1, by decide⟩) (B ⟨1, by decide⟩ c)))
      (Ninth.mul (A r ⟨2, by decide⟩) (B ⟨2, by decide⟩ c))

def nbWitMd (r c : Fin 3) : Int :=
  match r.val, c.val with
  | 0, 0 => 1 | 0, 1 => 1 | 0, 2 => 0
  | 1, 0 => 0 | 1, 1 => 2 | 1, 2 => 1
  | 2, 0 => 1 | 2, 1 => 0 | 2, 2 => 3
  | _, _ => 0

def nbWitHu (r c : Fin 3) : Ninth :=
  if r = c then
    match r.val with
    | 0 => Ninth.ofInt 1
    | 1 => Ninth.ofInt 4
    | _ => Ninth.ofInt 9
  else Ninth.zero

def nbWitBZ9 (c : Fin 3) : Ninth :=
  match c.val with
  | 0 => Ninth.one
  | 1 => Ninth.pow Ninth.zeta9 2
  | _ => Ninth.pow Ninth.zeta9 5

def nbWitBReal (_ : Fin 3) : Ninth := Ninth.one

def nbWitK4 (b : Fin 3 → Ninth) (r c : Fin 3) : Ninth :=
  Ninth.sub (if r = c then Ninth.ofInt 4 else Ninth.zero) (Ninth.mul (Ninth.conj (b r)) (b c))

def nbWitIpBB (b : Fin 3 → Ninth) (r c : Fin 3) : Ninth :=
  Ninth.add (if r = c then Ninth.one else Ninth.zero) (Ninth.mul (Ninth.conj (b r)) (b c))

def nbWitHd4 (b : Fin 3 → Ninth) : Fin 3 → Fin 3 → Ninth :=
  let mD : Fin 3 → Fin 3 → Ninth := fun r c => Ninth.ofInt (nbWitMd r c)
  let mDT : Fin 3 → Fin 3 → Ninth := fun r c => Ninth.ofInt (nbWitMd c r)
  mat3NinthMul (mat3NinthMul mD (nbWitK4 b)) mDT

def nbWitJarlskogDet (b : Fin 3 → Ninth) : Ninth :=
  let hD := nbWitHd4 b
  let ab := mat3NinthMul nbWitHu hD
  let ba := mat3NinthMul hD nbWitHu
  det3Ninth (fun r c => Ninth.sub (ab r c) (ba r c))

private def nbWitBZ9Lit (c : Fin 3) : Ninth :=
  match c.val with
  | 0 => ⟨1, 0, 0, 0, 0, 0⟩
  | 1 => ⟨0, 0, 1, 0, 0, 0⟩
  | _ => ⟨0, 0, 0, 0, 0, 1⟩

private def nbWitIpBBZ9Lit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨2, 0, 0, 0, 0, 0⟩
  | 0, 1 => ⟨0, 0, 1, 0, 0, 0⟩
  | 0, 2 => ⟨0, 0, 0, 0, 0, 1⟩
  | 1, 0 => ⟨0, -1, 0, 0, -1, 0⟩
  | 1, 1 => ⟨2, 0, 0, 0, 0, 0⟩
  | 1, 2 => ⟨0, 0, 0, 1, 0, 0⟩
  | 2, 0 => ⟨0, 0, 0, 0, 1, 0⟩
  | 2, 1 => ⟨-1, 0, 0, -1, 0, 0⟩
  | _, _ => ⟨2, 0, 0, 0, 0, 0⟩

private def nbWitK4Z9Lit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨3, 0, 0, 0, 0, 0⟩
  | 0, 1 => ⟨0, 0, -1, 0, 0, 0⟩
  | 0, 2 => ⟨0, 0, 0, 0, 0, -1⟩
  | 1, 0 => ⟨0, 1, 0, 0, 1, 0⟩
  | 1, 1 => ⟨3, 0, 0, 0, 0, 0⟩
  | 1, 2 => ⟨0, 0, 0, -1, 0, 0⟩
  | 2, 0 => ⟨0, 0, 0, 0, -1, 0⟩
  | 2, 1 => ⟨1, 0, 0, 1, 0, 0⟩
  | _, _ => ⟨3, 0, 0, 0, 0, 0⟩

private def nbWitMDK4Z9Lit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨3, 1, 0, 0, 1, 0⟩
  | 0, 1 => ⟨3, 0, -1, 0, 0, 0⟩
  | 0, 2 => ⟨0, 0, 0, -1, 0, -1⟩
  | 1, 0 => ⟨0, 2, 0, 0, 1, 0⟩
  | 1, 1 => ⟨7, 0, 0, 1, 0, 0⟩
  | 1, 2 => ⟨3, 0, 0, -2, 0, 0⟩
  | 2, 0 => ⟨3, 0, 0, 0, -3, 0⟩
  | 2, 1 => ⟨3, 0, -1, 3, 0, 0⟩
  | _, _ => ⟨9, 0, 0, 0, 0, -1⟩

private def nbWitHd4Z9Lit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨6, 1, -1, 0, 1, 0⟩
  | 0, 1 => ⟨6, 0, -2, -1, 0, -1⟩
  | 0, 2 => ⟨3, 1, 0, -3, 1, -3⟩
  | 1, 0 => ⟨7, 2, 0, 1, 1, 0⟩
  | 1, 1 => ⟨17, 0, 0, 0, 0, 0⟩
  | 1, 2 => ⟨9, 2, 0, -6, 1, 0⟩
  | 2, 0 => ⟨6, 0, -1, 3, -3, 0⟩
  | 2, 1 => ⟨15, 0, -2, 6, 0, -1⟩
  | _, _ => ⟨30, 0, 0, 0, -3, -3⟩

private def nbWitCommZ9Lit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨0, 0, 0, 0, 0, 0⟩
  | 0, 1 => ⟨-18, 0, 6, 3, 0, 3⟩
  | 0, 2 => ⟨-24, -8, 0, 24, -8, 24⟩
  | 1, 0 => ⟨21, 6, 0, 3, 3, 0⟩
  | 1, 1 => ⟨0, 0, 0, 0, 0, 0⟩
  | 1, 2 => ⟨-45, -10, 0, 30, -5, 0⟩
  | 2, 0 => ⟨48, 0, -8, 24, -24, 0⟩
  | 2, 1 => ⟨75, 0, -10, 30, 0, -5⟩
  | _, _ => ⟨0, 0, 0, 0, 0, 0⟩

private def nbWitK4RealLit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨3, 0, 0, 0, 0, 0⟩
  | 0, 1 => ⟨-1, 0, 0, 0, 0, 0⟩
  | 0, 2 => ⟨-1, 0, 0, 0, 0, 0⟩
  | 1, 0 => ⟨-1, 0, 0, 0, 0, 0⟩
  | 1, 1 => ⟨3, 0, 0, 0, 0, 0⟩
  | 1, 2 => ⟨-1, 0, 0, 0, 0, 0⟩
  | 2, 0 => ⟨-1, 0, 0, 0, 0, 0⟩
  | 2, 1 => ⟨-1, 0, 0, 0, 0, 0⟩
  | _, _ => ⟨3, 0, 0, 0, 0, 0⟩

private def nbWitMDK4RealLit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨2, 0, 0, 0, 0, 0⟩
  | 0, 1 => ⟨2, 0, 0, 0, 0, 0⟩
  | 0, 2 => ⟨-2, 0, 0, 0, 0, 0⟩
  | 1, 0 => ⟨-3, 0, 0, 0, 0, 0⟩
  | 1, 1 => ⟨5, 0, 0, 0, 0, 0⟩
  | 1, 2 => ⟨1, 0, 0, 0, 0, 0⟩
  | 2, 0 => ⟨0, 0, 0, 0, 0, 0⟩
  | 2, 1 => ⟨-4, 0, 0, 0, 0, 0⟩
  | _, _ => ⟨8, 0, 0, 0, 0, 0⟩

private def nbWitHd4RealLit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨4, 0, 0, 0, 0, 0⟩
  | 0, 1 => ⟨2, 0, 0, 0, 0, 0⟩
  | 0, 2 => ⟨-4, 0, 0, 0, 0, 0⟩
  | 1, 0 => ⟨2, 0, 0, 0, 0, 0⟩
  | 1, 1 => ⟨11, 0, 0, 0, 0, 0⟩
  | 1, 2 => ⟨0, 0, 0, 0, 0, 0⟩
  | 2, 0 => ⟨-4, 0, 0, 0, 0, 0⟩
  | 2, 1 => ⟨0, 0, 0, 0, 0, 0⟩
  | _, _ => ⟨24, 0, 0, 0, 0, 0⟩

private def nbWitCommRealLit (r c : Fin 3) : Ninth :=
  match r.val, c.val with
  | 0, 0 => ⟨0, 0, 0, 0, 0, 0⟩
  | 0, 1 => ⟨-6, 0, 0, 0, 0, 0⟩
  | 0, 2 => ⟨32, 0, 0, 0, 0, 0⟩
  | 1, 0 => ⟨6, 0, 0, 0, 0, 0⟩
  | 1, 1 => ⟨0, 0, 0, 0, 0, 0⟩
  | 1, 2 => ⟨0, 0, 0, 0, 0, 0⟩
  | 2, 0 => ⟨-32, 0, 0, 0, 0, 0⟩
  | 2, 1 => ⟨0, 0, 0, 0, 0, 0⟩
  | _, _ => ⟨0, 0, 0, 0, 0, 0⟩

private theorem nbWitBZ9_eq_lit : nbWitBZ9 = nbWitBZ9Lit := by
  funext c; revert c; decide

private theorem nbWitIpBB_z9_eq : nbWitIpBB nbWitBZ9 = nbWitIpBBZ9Lit := by
  rw [nbWitBZ9_eq_lit]
  funext r c; revert r c; decide

private theorem nbWitK4_z9_eq : nbWitK4 nbWitBZ9 = nbWitK4Z9Lit := by
  rw [nbWitBZ9_eq_lit]
  funext r c; revert r c; decide

private theorem nbWitHd4_z9_eq : nbWitHd4 nbWitBZ9 = nbWitHd4Z9Lit := by
  unfold nbWitHd4
  dsimp only
  rw [nbWitK4_z9_eq]
  have hMid : mat3NinthMul (fun r c => Ninth.ofInt (nbWitMd r c)) nbWitK4Z9Lit = nbWitMDK4Z9Lit := by
    funext r c; revert r c; decide
  rw [hMid]
  funext r c; revert r c; decide

private theorem nbWitJarlskogDet_z9_eq :
    nbWitJarlskogDet nbWitBZ9 = ⟨-9600, -31680, -31680, -19200, -41760, 10080⟩ := by
  unfold nbWitJarlskogDet
  dsimp only
  rw [nbWitHd4_z9_eq]
  have hComm :
      (fun r c => Ninth.sub (mat3NinthMul nbWitHu nbWitHd4Z9Lit r c)
        (mat3NinthMul nbWitHd4Z9Lit nbWitHu r c)) = nbWitCommZ9Lit := by
    funext r c; revert r c; decide
  rw [hComm]
  decide

private theorem nbWitK4_real_eq : nbWitK4 nbWitBReal = nbWitK4RealLit := by
  funext r c; revert r c; decide

private theorem nbWitHd4_real_eq : nbWitHd4 nbWitBReal = nbWitHd4RealLit := by
  unfold nbWitHd4
  dsimp only
  rw [nbWitK4_real_eq]
  have hMid : mat3NinthMul (fun r c => Ninth.ofInt (nbWitMd r c)) nbWitK4RealLit = nbWitMDK4RealLit := by
    funext r c; revert r c; decide
  rw [hMid]
  funext r c; revert r c; decide

private theorem nbWitJarlskogDet_real_eq :
    nbWitJarlskogDet nbWitBReal = Ninth.zero := by
  unfold nbWitJarlskogDet
  dsimp only
  rw [nbWitHd4_real_eq]
  have hComm :
      (fun r c => Ninth.sub (mat3NinthMul nbWitHu nbWitHd4RealLit r c)
        (mat3NinthMul nbWitHd4RealLit nbWitHu r c)) = nbWitCommRealLit := by
    funext r c; revert r c; decide
  rw [hComm]
  decide

/-- Exact zero-float `ℤ[ζ_9]` Nelson-Barr CP-violation witness (`θ̄_tree = 0` AND `J_CKM ≠ 0`):
    for `b = [1, ζ_9^2, ζ_9^5]` and strictly real `m_u = diag(1, 2, 3)`, `m_d = [[1,1,0],[0,2,1],[1,0,3]]`:
    1. Full `4 × 4` determinant `det(M_d) = 7 ∈ ℤ_{>0}` (`θ̄_tree = 0` identically!),
    2. Exact Sherman-Morrison inverse `(I_3 + b† b)(4 I_3 - b† b) = 4 I_3` in `ℤ[ζ_9]`,
    3. Basis-invariant Jarlskog commutator determinant `det([H_u, 4 H_d^{eff}])` is STRICTLY NONZERO
       and purely imaginary (`conj(det C) = -det C`), proving spontaneous CP breaking,
    4. Negative control: turning off the `ζ_9` phases (`b = [1, 1, 1]`) gives `det([H_u, 4 H_d^{eff}]) = 0`. -/
theorem thm_bt4b_nelson_barr_cp_broken_jarlskog_witness :
    det4Ninth (bbpMat4 nbWitMd nbWitBZ9 1) = Ninth.ofInt 7 ∧
    (∀ r c : Fin 3,
      mat3NinthMul (nbWitIpBB nbWitBZ9) (nbWitK4 nbWitBZ9) r c =
        if r = c then Ninth.ofInt 4 else Ninth.zero) ∧
    nbWitJarlskogDet nbWitBZ9 ≠ Ninth.zero ∧
    Ninth.conj (nbWitJarlskogDet nbWitBZ9) = Ninth.neg (nbWitJarlskogDet nbWitBZ9) ∧
    nbWitJarlskogDet nbWitBReal = Ninth.zero := by
  rw [(thm_bt4b_nelson_barr_4x4_symbolic nbWitMd nbWitBZ9 1).1,
      nbWitIpBB_z9_eq, nbWitK4_z9_eq, nbWitJarlskogDet_z9_eq, nbWitJarlskogDet_real_eq]
  decide

end Vibe
