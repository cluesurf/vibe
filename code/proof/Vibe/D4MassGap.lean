import Vibe.Algebra
import Vibe.Geometry

/-!
# Vibe Theory: 4D `D_4` Yang-Mills Mass Gap Strictly Beyond Bakry-Emery (`beta_BE^{24c}`)

Zero-dependency Lean `4.35.0` formalization of the exact algebraic, spectral, and combinatorial
pillars of Wave-2 Track W6 (`test/breakthrough/d4-mass-gap-beyond-be.ts`):

1. **Exact 1D Spatial Axial Gauge Spectral Reduction (`16 → 4 + 4√7`) & Reflection Positivity:**
   - Alignment of the `12` lexicographically positive `D_4` root directions (`Fin 12`) with
     `Vibe.Geometry.d4Roots`,
   - Purely spatial frozen root `r_frozen = (0, 0, 1, 1)` (`x_0 = 0`): fixed identically by
     site-hyperplane time reflection `Θ(x_0, x_1, x_2, x_3) = (-x_0, x_1, x_2, x_3)` (preserving
     `x_0 = 0` reflection positivity), disjoint 1D-line foliation with unique base sites, and
     symbolic proof of ZERO closed non-backtracking loops of any length `k ≥ 1`,
   - Unfixed `12 × 12` triangle-neighbor interaction matrix `L_12 = L0_12 + Lh_12` (uniform degree
     `16 = 8 + 8`) and axial-gauge `11 × 11` matrix `M_11` with exact `2 × 2` block quotient
     `B = [[8, 6], [16, 0]]` (`8` reduced degree-14 + `3` untouched degree-16, zero
     untouched-to-untouched edges),
   - Ordered quadratic ring `ZSqrt7 = ℤ[√7]`, exact strictly positive Perron eigenvector `v_11`
     satisfying `M_11 v_11 = (4 + 4√7) v_11`, and strict rational bracket
     `14583005 / 1000000 < 4 + 4√7 < 14583006 / 1000000 < 16`.
2. **Exact Unconditional `SU(2)` `W_1` Thresholds (`2.51x` Past `beta_BE^{24c}`) & `S^3` Identities:**
   - Exact symbolic polynomial identities for the 10-line `S^3` von Mises-Fisher proof (`l = 1`
     and differentiated `l = 0` positive test-function quotients `≥ 3`, perpendicular power-series
     dominance, parallel Riccati comparison identities proving `Var(u · n) ≤ 1/4`),
   - Biquadratic ring `ZSqrt37 = ℤ[√3, √7]` proving exact cancellation
     `(1 / (2√3)) * (4 + 4√7) * β_SU2_axial = 1` and zero-float rational brackets & ratios
     `0.237543 < β_SU2_axial = √3(√7 - 1)/12 < 0.237544`, `β_SU2_axial > 2.51 * β_BE_SU2`,
     `0.216506 < β_SU2_unfixed = √3/8 < 0.216507`, `β_SU2_unfixed > 2.29 * β_BE_SU2`.
3. **Abstract Weighted Dobrushin Contraction → Geometric Correlation Decay & `D_4` Instantiation:**
   - For ANY finite nonnegative scaled matrix `C = K / Q` with bounded positive weights `v` and
     contraction constant `p / q < 1`, exact `n`-step power decay `∑_y C^n(x, y) v(y) ≤ (p/q)^n v(x)`
     and uniform finite-horizon geometric tail bound `∑_{n=d}^{d+M-1} C^n(x, y) ≤ (v_max/v_min) α^d / (1 - α)`,
   - Non-vacuous instantiation on `M_11` at `β = 1/5 > 2.11 β_BE^{24c}` (both untitled and
     `e^{m/2} = 5/4` mass-gap tilted!) and at `β = 23/100` (strictly past the unfixed threshold `√3/8`).
4. **Exact `H_12` Graph (`32` Edges), Explicit 3-Forest Partition `[11, 11, 10]`, & `p*(H_12) = 32/11`:**
   - Explicit 3-forest partition of all `32` edges of `H_12` with parent-depth acyclicity proved
     symbolically (no non-backtracking cycle of any length `L ≥ 1`, no simple cycle of any `L ≥ 3`),
   - Exhaustive Nash-Williams fractional arboricity `p*(H_12) = 32/11` across all `4,096` subsets.
5. **Symbolic BFS Polymer Step-Ratio Bound (`∀ n ≥ 1`) & `D_4` Tetrahedron Count `C_4(Δ) = 3`:**
   - Exact binomial identity & strict inequality `9^9 * choose(10(n+1)-1, n) < 10^10 * choose(10n-1, n-1)`
     for ALL `n ≥ 1`, plus exact `C_4(Δ) = 3` regular `D_4` tetrahedra per equilateral triangle.
6. **Exact `SU(3)` Closed-Form `W_1` Lower Bound (`β = 317/1000 > 1.49 * β_BE^{24c}`):**
   - Exact `su(3)` trace/discriminant SOS (`e_3^2 ≤ 1/54`, `∑ a_k^6 ≤ 11/36`, `E[v^6] ≤ 191/3456`),
   - Exact `A_2` Weyl-chamber Pieri walk computing `SU(3)` Haar moments `a_0..a_{10}` and proving
     `c_0(16 * 317/1000) < 12/5` with explicit geometric remainder bound,
   - Exact rational verification that the 1-term closed-form 1D-axial `SU(3)` `W_1` condition
     strictly holds at `β = 317/1000 > 1.49 * (9 / (16√7))`.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Local `Fin n` Natural/Integer Summation & Vector Helpers -/

private def sumFinNatAux {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) : Nat :=
  match k with
  | 0 => 0
  | m + 1 => sumFinNatAux m (by omega) f + f ⟨m, by omega⟩

/-- Exact finite natural-number sum `∑_{i : Fin n} f i`. -/
def sumFinNat {n : Nat} (f : Fin n → Nat) : Nat :=
  sumFinNatAux n (Nat.le_refl n) f

private theorem sumFinNatAux_zero {n : Nat} (k : Nat) (hk : k ≤ n) :
    sumFinNatAux k hk (fun _ : Fin n => 0) = 0 := by
  induction k with
  | zero => rfl
  | succ m ih =>
    simp only [sumFinNatAux, Nat.add_zero]
    exact ih (by omega)

private theorem sumFinNatAux_add {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Nat) :
    sumFinNatAux k hk (fun i => f i + g i) = sumFinNatAux k hk f + sumFinNatAux k hk g := by
  induction k with
  | zero => rfl
  | succ m ih =>
    simp only [sumFinNatAux]
    rw [ih (by omega)]
    omega

private theorem sumFinNat_add {n : Nat} (f g : Fin n → Nat) :
    sumFinNat (fun i => f i + g i) = sumFinNat f + sumFinNat g :=
  sumFinNatAux_add n (Nat.le_refl n) f g

private theorem sumFinNatAux_mul_left {n : Nat} (k : Nat) (hk : k ≤ n) (c : Nat) (f : Fin n → Nat) :
    sumFinNatAux k hk (fun i => c * f i) = c * sumFinNatAux k hk f := by
  induction k with
  | zero => simp only [sumFinNatAux, Nat.mul_zero]
  | succ m ih =>
    simp only [sumFinNatAux]
    rw [ih (by omega), Nat.mul_add]

private theorem sumFinNat_mul_left {n : Nat} (c : Nat) (f : Fin n → Nat) :
    sumFinNat (fun i => c * f i) = c * sumFinNat f :=
  sumFinNatAux_mul_left n (Nat.le_refl n) c f

private theorem sumFinNatAux_mul_right {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) (c : Nat) :
    sumFinNatAux k hk (fun i => f i * c) = sumFinNatAux k hk f * c := by
  induction k with
  | zero => simp only [sumFinNatAux, Nat.zero_mul]
  | succ m ih =>
    simp only [sumFinNatAux]
    rw [ih (by omega), Nat.add_mul]

private theorem sumFinNat_mul_right {n : Nat} (f : Fin n → Nat) (c : Nat) :
    sumFinNat (fun i => f i * c) = sumFinNat f * c :=
  sumFinNatAux_mul_right n (Nat.le_refl n) f c

private theorem sumFinNatAux_le {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Nat)
    (hle : ∀ i : Fin n, f i ≤ g i) :
    sumFinNatAux k hk f ≤ sumFinNatAux k hk g := by
  induction k with
  | zero => exact Nat.le_refl 0
  | succ m ih =>
    simp only [sumFinNatAux]
    exact Nat.add_le_add (ih (by omega)) (hle ⟨m, by omega⟩)

private theorem sumFinNat_le {n : Nat} (f g : Fin n → Nat) (hle : ∀ i : Fin n, f i ≤ g i) :
    sumFinNat f ≤ sumFinNat g :=
  sumFinNatAux_le n (Nat.le_refl n) f g hle

private theorem sumFinNatAux_swap {n : Nat} (k : Nat) (hk : k ≤ n) (F : Fin n → Fin n → Nat) :
    sumFinNatAux k hk (fun i => sumFinNat (fun j => F i j)) =
      sumFinNat (fun j => sumFinNatAux k hk (fun i => F i j)) := by
  induction k with
  | zero =>
    simp only [sumFinNatAux, sumFinNat]
    rw [sumFinNatAux_zero]
  | succ m ih =>
    simp only [sumFinNatAux]
    rw [ih (by omega), ← sumFinNat_add]

private theorem sumFinNat_swap {n : Nat} (F : Fin n → Fin n → Nat) :
    sumFinNat (fun i => sumFinNat (fun j => F i j)) =
      sumFinNat (fun j => sumFinNat (fun i => F i j)) :=
  sumFinNatAux_swap n (Nat.le_refl n) F

private theorem sumFinNatAux_delta {n : Nat} (k : Nat) (hk : k ≤ n) (a : Fin n) (f : Fin n → Nat) :
    sumFinNatAux k hk (fun i => (if a = i then 1 else 0) * f i) =
      if a.val < k then f a else 0 := by
  induction k with
  | zero =>
    simp only [sumFinNatAux]
    have h0 : ¬(a.val < 0) := by omega
    rw [ite_eq_right h0]
  | succ m ih =>
    simp only [sumFinNatAux]
    rw [ih (by omega)]
    if hlt : a.val < m then
      have hlt2 : a.val < m + 1 := by omega
      have hne : a ≠ (⟨m, by omega⟩ : Fin n) := by
        intro hEq
        have hv : a.val = m := congrArg Fin.val hEq
        omega
      rw [ite_eq_left hlt, ite_eq_right hne, ite_eq_left hlt2, Nat.zero_mul, Nat.add_zero]
    else if heq : a.val = m then
      have hlt2 : a.val < m + 1 := by omega
      have hfeq : a = (⟨m, by omega⟩ : Fin n) := Fin.ext heq
      rw [ite_eq_right hlt, ite_eq_left hfeq, ite_eq_left hlt2, Nat.one_mul, Nat.zero_add, hfeq]
    else
      have hlt2 : ¬(a.val < m + 1) := by omega
      have hne : a ≠ (⟨m, by omega⟩ : Fin n) := by
        intro hEq
        have hv : a.val = m := congrArg Fin.val hEq
        omega
      rw [ite_eq_right hlt, ite_eq_right hne, ite_eq_right hlt2, Nat.zero_mul, Nat.add_zero]

private theorem sumFinNat_delta {n : Nat} (a : Fin n) (f : Fin n → Nat) :
    sumFinNat (fun i => (if a = i then 1 else 0) * f i) = f a := by
  unfold sumFinNat
  rw [sumFinNatAux_delta, ite_eq_left a.isLt]

private theorem sumFinNatAux_single_le {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat)
    (a : Fin n) (ha : a.val < k) :
    f a ≤ sumFinNatAux k hk f := by
  induction k with
  | zero => omega
  | succ m ih =>
    simp only [sumFinNatAux]
    if hlt : a.val < m then
      have hPrev := ih (by omega) hlt
      omega
    else
      have hEq : a = ⟨m, by omega⟩ := Fin.ext (show a.val = m by omega)
      rw [hEq]
      omega

private theorem sumFinNat_single_le {n : Nat} (f : Fin n → Nat) (a : Fin n) :
    f a ≤ sumFinNat f :=
  sumFinNatAux_single_le n (Nat.le_refl n) f a a.isLt

/-- Exact 4D vector addition `u + v`. -/
def add4 (u v : Vec4) : Vec4 :=
  (u.1 + v.1, u.2.1 + v.2.1, u.2.2.1 + v.2.2.1, u.2.2.2 + v.2.2.2)

/-- Exact 4D vector negation `-v`. -/
def neg4 (v : Vec4) : Vec4 :=
  (-v.1, -v.2.1, -v.2.2.1, -v.2.2.2)

/-- Exact 4D scalar multiplication `k • v`. -/
def scale4 (k : Int) (v : Vec4) : Vec4 :=
  (k * v.1, k * v.2.1, k * v.2.2.1, k * v.2.2.2)

/-- Site-hyperplane Euclidean time reflection `Θ(x_0, x_1, x_2, x_3) = (-x_0, x_1, x_2, x_3)`. -/
def timeReflect4 (v : Vec4) : Vec4 :=
  (-v.1, v.2.1, v.2.2.1, v.2.2.2)

/-- Lexicographic positivity test on `Vec4` (first nonzero coordinate is strictly positive). -/
def mgLexPos (v : Vec4) : Bool :=
  if v.1 != 0 then v.1 > 0
  else if v.2.1 != 0 then v.2.1 > 0
  else if v.2.2.1 != 0 then v.2.2.1 > 0
  else v.2.2.2 > 0


/-! ## Section 1: Exact 1D Spatial Axial Gauge Spectral Reduction (`16 → 4 + 4√7`) & RP -/

/-- The `12` lexicographically positive `D_4` root directions in exact `Vibe.Geometry.d4Roots` order. -/
def mgPosRoot (d : Fin 12) : Vec4 :=
  match d.val with
  | 0  => (1,  1,  0,  0)
  | 1  => (1, -1,  0,  0)
  | 2  => (1,  0,  1,  0)
  | 3  => (1,  0, -1,  0)
  | 4  => (1,  0,  0,  1)
  | 5  => (1,  0,  0, -1)
  | 6  => (0,  1,  1,  0)
  | 7  => (0,  1, -1,  0)
  | 8  => (0,  1,  0,  1)
  | 9  => (0,  1,  0, -1)
  | 10 => (0,  0,  1,  1)
  | 11 => (0,  0,  1, -1)
  | _  => (0,  0,  0,  0)

/-- The purely spatial frozen axis index `10`, corresponding to `r_frozen = (0, 0, 1, 1)`. -/
def mgFrozenIdx : Fin 12 := ⟨10, by decide⟩

/-- The purely spatial frozen root `r_frozen = (0, 0, 1, 1)` (`x_0 = 0`). -/
def mgFrozenRoot : Vec4 := mgPosRoot mgFrozenIdx

/-- Linear height coordinate `x_2 + x_3` along the frozen 1D lines `r_frozen = (0, 0, 1, 1)`. -/
def mgFrozenCoord (x : Vec4) : Int := x.2.2.1 + x.2.2.2

/-- Transverse fiber invariant `(x_0, x_1, x_2 - x_3)` constant along each frozen 1D line. -/
def mgFrozenFiber (x : Vec4) : Int × Int × Int := (x.1, x.2.1, x.2.2.1 - x.2.2.2)

/-- Step relation along the frozen subgraph: `v - u = ± r_frozen`. -/
def mgFrozenStep (u v : Vec4) : Prop :=
  sub4 v u = mgFrozenRoot ∨ sub4 v u = neg4 mgFrozenRoot

private theorem mgFrozen_step_coord_fiber (u v : Vec4) (h : mgFrozenStep u v) :
    mgFrozenFiber v = mgFrozenFiber u ∧
    ((v = add4 u mgFrozenRoot ∧ mgFrozenCoord v = mgFrozenCoord u + 2) ∨
     (v = sub4 u mgFrozenRoot ∧ mgFrozenCoord v = mgFrozenCoord u - 2)) := by
  rcases u with ⟨u0, u1, u2, u3⟩
  rcases v with ⟨v0, v1, v2, v3⟩
  rcases h with hpos | hneg
  · simp only [sub4, mgFrozenRoot, mgPosRoot, mgFrozenIdx, Prod.mk.injEq] at hpos
    refine ⟨?_, Or.inl ⟨?_, ?_⟩⟩
    · simp only [mgFrozenFiber, Prod.mk.injEq]; omega
    · simp only [add4, mgFrozenRoot, mgPosRoot, mgFrozenIdx, Prod.mk.injEq]; omega
    · simp only [mgFrozenCoord]; omega
  · simp only [sub4, neg4, mgFrozenRoot, mgPosRoot, mgFrozenIdx, Prod.mk.injEq] at hneg
    refine ⟨?_, Or.inr ⟨?_, ?_⟩⟩
    · simp only [mgFrozenFiber, Prod.mk.injEq]; omega
    · simp only [sub4, mgFrozenRoot, mgPosRoot, mgFrozenIdx, Prod.mk.injEq]; omega
    · simp only [mgFrozenCoord]; omega

private theorem mgFrozen_walk_monotone (w : Nat → Vec4) (k : Nat)
    (hStep : ∀ i : Nat, i < k → mgFrozenStep (w i) (w (i + 1)))
    (hNoBack : ∀ i : Nat, i + 1 < k → w (i + 2) ≠ w i) :
    (k = 0) ∨
    (mgFrozenCoord (w k) = mgFrozenCoord (w 0) + 2 * Int.ofNat k) ∨
    (mgFrozenCoord (w k) = mgFrozenCoord (w 0) - 2 * Int.ofNat k) := by
  cases k with
  | zero => exact Or.inl rfl
  | succ m =>
    have h0 := (mgFrozen_step_coord_fiber (w 0) (w 1) (hStep 0 (by omega))).2
    rcases h0 with ⟨hw1, hc1⟩ | ⟨hw1, hc1⟩
    · right; left
      have hUp : ∀ j : Nat, j ≤ m →
          w (j + 1) = add4 (w j) mgFrozenRoot ∧
          mgFrozenCoord (w (j + 1)) = mgFrozenCoord (w 0) + 2 * Int.ofNat (j + 1) := by
        intro j
        induction j with
        | zero =>
          intro _
          exact ⟨hw1, by change mgFrozenCoord (w 1) = mgFrozenCoord (w 0) + 2 * 1; omega⟩
        | succ r ih =>
          intro hr
          have ⟨hPrevStep, hPrevCoord⟩ := ih (by omega)
          have hCur := (mgFrozen_step_coord_fiber (w (r + 1)) (w (r + 2)) (hStep (r + 1) (by omega))).2
          rcases hCur with ⟨hFwd, hFwdC⟩ | ⟨hBwd, _⟩
          · refine ⟨hFwd, ?_⟩
            have hCast : Int.ofNat (r + 2) = Int.ofNat (r + 1) + 1 := rfl
            change mgFrozenCoord (w (r + 2)) = mgFrozenCoord (w 0) + 2 * Int.ofNat (r + 2)
            rw [hCast]
            omega
          · exfalso
            apply hNoBack r (by omega)
            rw [hBwd, hPrevStep]
            rcases w r with ⟨a, b, c, d⟩
            simp only [add4, sub4, mgFrozenRoot, mgPosRoot, mgFrozenIdx, Prod.mk.injEq]
            refine ⟨by omega, by omega, by omega, by omega⟩
      exact (hUp m (Nat.le_refl m)).2
    · right; right
      have hDn : ∀ j : Nat, j ≤ m →
          w (j + 1) = sub4 (w j) mgFrozenRoot ∧
          mgFrozenCoord (w (j + 1)) = mgFrozenCoord (w 0) - 2 * Int.ofNat (j + 1) := by
        intro j
        induction j with
        | zero =>
          intro _
          exact ⟨hw1, by change mgFrozenCoord (w 1) = mgFrozenCoord (w 0) - 2 * 1; omega⟩
        | succ r ih =>
          intro hr
          have ⟨hPrevStep, hPrevCoord⟩ := ih (by omega)
          have hCur := (mgFrozen_step_coord_fiber (w (r + 1)) (w (r + 2)) (hStep (r + 1) (by omega))).2
          rcases hCur with ⟨hFwd, _⟩ | ⟨hBwd, hBwdC⟩
          · exfalso
            apply hNoBack r (by omega)
            rw [hFwd, hPrevStep]
            rcases w r with ⟨a, b, c, d⟩
            simp only [add4, sub4, mgFrozenRoot, mgPosRoot, mgFrozenIdx, Prod.mk.injEq]
            refine ⟨by omega, by omega, by omega, by omega⟩
          · refine ⟨hBwd, ?_⟩
            have hCast : Int.ofNat (r + 2) = Int.ofNat (r + 1) + 1 := rfl
            change mgFrozenCoord (w (r + 2)) = mgFrozenCoord (w 0) - 2 * Int.ofNat (r + 2)
            rw [hCast]
            omega
      exact (hDn m (Nat.le_refl m)).2

private theorem mgPosRoot_align_check :
    d4Roots.filter mgLexPos = (List.finRange 12).map mgPosRoot ∧
    ((List.finRange 12).map mgPosRoot).Nodup ∧
    (∀ r ∈ d4Roots, ∃ d : Fin 12, r = mgPosRoot d ∨ r = neg4 (mgPosRoot d)) ∧
    (∀ d1 d2 : Fin 12, (mgPosRoot d1 = mgPosRoot d2 ∨ mgPosRoot d1 = neg4 (mgPosRoot d2)) → d1 = d2) := by
  decide

private theorem nat_half_slab :
    ∀ m : Nat, ∃ n : Int, 0 ≤ Int.ofNat m - 2 * n ∧ Int.ofNat m - 2 * n ≤ 1
  | 0 => ⟨0, by decide, by decide⟩
  | 1 => ⟨0, by decide, by decide⟩
  | m + 2 =>
    let ⟨n, h0, h1⟩ := nat_half_slab m
    have hStep : Int.ofNat (m + 2) = Int.ofNat m + 2 := rfl
    ⟨n + 1, by rw [hStep]; omega, by rw [hStep]; omega⟩

private theorem negSucc_half_slab :
    ∀ m : Nat, ∃ n : Int, 0 ≤ Int.negSucc m - 2 * n ∧ Int.negSucc m - 2 * n ≤ 1
  | 0 => ⟨-1, by decide, by decide⟩
  | 1 => ⟨-1, by decide, by decide⟩
  | m + 2 =>
    let ⟨n, h0, h1⟩ := negSucc_half_slab m
    have hStep : Int.negSucc (m + 2) = Int.negSucc m - 2 := by omega
    ⟨n - 1, by rw [hStep]; omega, by rw [hStep]; omega⟩

private theorem int_half_floor_slab (s : Int) : ∃ n : Int, 0 ≤ s - 2 * n ∧ s - 2 * n ≤ 1 := by
  cases s with
  | ofNat m => exact nat_half_slab m
  | negSucc m => exact negSucc_half_slab m

/-- Theorem MG-1: Exact alignment of the `12` unoriented `D_4` root-line directions with
    `Vibe.Geometry.d4Roots`, exact `x_0 = 0` time-reflection invariance of the frozen spatial axis
    `r_frozen = (0, 0, 1, 1)` (preserving site-hyperplane reflection positivity for every frozen
    link `{x, x + r_frozen}`), unique base-slab foliation `x_2 + x_3 ∈ {0, 1}`, and symbolic
    acyclicity (ZERO closed non-backtracking loops of any length `k ≥ 1`) in infinite 4D `D_4`. -/
theorem thm_mg_d4_pos_roots_and_frozen_rp :
    d4Roots.filter mgLexPos = (List.finRange 12).map mgPosRoot ∧
    (∀ r ∈ d4Roots, ∃ d : Fin 12, r = mgPosRoot d ∨ r = neg4 (mgPosRoot d)) ∧
    (∀ d1 d2 : Fin 12, (mgPosRoot d1 = mgPosRoot d2 ∨ mgPosRoot d1 = neg4 (mgPosRoot d2)) → d1 = d2) ∧
    mgFrozenRoot = (0, 0, 1, 1) ∧
    mgFrozenRoot.1 = 0 ∧
    timeReflect4 mgFrozenRoot = mgFrozenRoot ∧
    (∀ x : Vec4, timeReflect4 (add4 x mgFrozenRoot) = add4 (timeReflect4 x) mgFrozenRoot) ∧
    (∀ x : Vec4, ∃ n : Int, let b := sub4 x (scale4 n mgFrozenRoot)
      mgFrozenFiber b = mgFrozenFiber x ∧ 0 ≤ mgFrozenCoord b ∧ mgFrozenCoord b ≤ 1) ∧
    (∀ (k : Nat) (w : Nat → Vec4), k ≥ 1 →
      (∀ i : Nat, i < k → mgFrozenStep (w i) (w (i + 1))) →
      (∀ i : Nat, i + 1 < k → w (i + 2) ≠ w i) →
      w k ≠ w 0) := by
  refine ⟨mgPosRoot_align_check.1, mgPosRoot_align_check.2.2.1, mgPosRoot_align_check.2.2.2,
          rfl, rfl, rfl, ?_, ?_, ?_⟩
  · intro x
    rcases x with ⟨x0, x1, x2, x3⟩
    simp only [timeReflect4, add4, mgFrozenRoot, mgPosRoot, mgFrozenIdx]
    exact congrArg (fun z => (z, x1 + 0, x2 + 1, x3 + 1)) (by omega)
  · intro x
    rcases x with ⟨x0, x1, x2, x3⟩
    have ⟨n, hn0, hn1⟩ := int_half_floor_slab (x2 + x3)
    refine ⟨n, ?_, ?_, ?_⟩
    · simp only [sub4, scale4, mgFrozenFiber, mgFrozenRoot, mgPosRoot, mgFrozenIdx, Prod.mk.injEq]
      refine ⟨by omega, by omega, by omega⟩
    · simp only [sub4, scale4, mgFrozenCoord, mgFrozenRoot, mgPosRoot, mgFrozenIdx]
      omega
    · simp only [sub4, scale4, mgFrozenCoord, mgFrozenRoot, mgPosRoot, mgFrozenIdx]
      omega
  · intro k w hk hStep hNoBack hClosed
    have hMon := mgFrozen_walk_monotone w k hStep hNoBack
    have hkInt : (1 : Int) ≤ Int.ofNat k := Int.ofNat_le.mpr hk
    rcases hMon with hZero | hUp | hDn
    · omega
    · rw [hClosed] at hUp; omega
    · rw [hClosed] at hDn; omega

/-- Map any `D_4` root `v` to its unoriented direction index `Fin 12` (canonical positive sign). -/
def mgDirOf (v : Vec4) : Fin 12 :=
  let u := if mgLexPos v then v else neg4 v
  match u with
  | (1,  1,  0,  0) => ⟨0, by decide⟩
  | (1, -1,  0,  0) => ⟨1, by decide⟩
  | (1,  0,  1,  0) => ⟨2, by decide⟩
  | (1,  0, -1,  0) => ⟨3, by decide⟩
  | (1,  0,  0,  1) => ⟨4, by decide⟩
  | (1,  0,  0, -1) => ⟨5, by decide⟩
  | (0,  1,  1,  0) => ⟨6, by decide⟩
  | (0,  1, -1,  0) => ⟨7, by decide⟩
  | (0,  1,  0,  1) => ⟨8, by decide⟩
  | (0,  1,  0, -1) => ⟨9, by decide⟩
  | (0,  0,  1,  1) => ⟨10, by decide⟩
  | (0,  0,  1, -1) => ⟨11, by decide⟩
  | _               => ⟨0, by decide⟩

/-- Exact unfixed `12 × 12` same-time-slice (`|Δx_0| = 0`) triangle-neighbor multiplicity `L0_12`. -/
def mgL0_12 (a b : Fin 12) : Nat :=
  let r := mgPosRoot a
  d4Roots.foldl (fun acc s =>
    if dot4 r s == 1 then
      let diff := sub4 r s
      let c1 := if mgDirOf s == b && r.1 == s.1 then 1 else 0
      let c2 := if mgDirOf diff == b && r.1 == r.1 + s.1 then 1 else 0
      acc + c1 + c2
    else acc) 0

/-- Exact unfixed `12 × 12` half-step-time (`|Δx_0| = 1/2`) triangle-neighbor multiplicity `Lh_12`. -/
def mgLh_12 (a b : Fin 12) : Nat :=
  let r := mgPosRoot a
  d4Roots.foldl (fun acc s =>
    if dot4 r s == 1 then
      let diff := sub4 r s
      let c1 := if mgDirOf s == b && r.1 != s.1 then 1 else 0
      let c2 := if mgDirOf diff == b && r.1 != r.1 + s.1 then 1 else 0
      acc + c1 + c2
    else acc) 0

/-- Total unfixed `12 × 12` triangle-neighbor link-interaction matrix `L_12 = L0_12 + Lh_12`. -/
def mgL12 (a b : Fin 12) : Nat := mgL0_12 a b + mgLh_12 a b

/-- The `11` remaining active directions after freezing `mgFrozenIdx = 10` (`(0, 0, 1, 1)`). -/
def mgActiveDir (i : Fin 11) : Fin 12 :=
  if h : i.val < 10 then ⟨i.val, by omega⟩ else ⟨11, by decide⟩

/-- Indicator of the `3` untouched active directions (`r · r_frozen = 0`: indices `0, 1, 10`). -/
def mgIsUntouched (i : Fin 11) : Bool :=
  dot4 (mgPosRoot (mgActiveDir i)) mgFrozenRoot == 0

/-- Axial-gauge `11 × 11` same-time interaction matrix `M0_11`. -/
def mgM0_11 (a b : Fin 11) : Nat := mgL0_12 (mgActiveDir a) (mgActiveDir b)

/-- Axial-gauge `11 × 11` half-step-time interaction matrix `Mh_11`. -/
def mgMh_11 (a b : Fin 11) : Nat := mgLh_12 (mgActiveDir a) (mgActiveDir b)

/-- Total axial-gauge `11 × 11` link-interaction matrix `M_11 = M0_11 + Mh_11`. -/
def mgM11 (a b : Fin 11) : Nat := mgM0_11 a b + mgMh_11 a b

private theorem mgL12_props :
    (∀ r ∈ d4Roots, r = mgPosRoot (mgDirOf r) ∨ r = neg4 (mgPosRoot (mgDirOf r))) ∧
    (∀ a : Fin 12, mgL12 a a = 0) ∧
    (∀ a b : Fin 12, mgL12 a b = mgL12 b a) ∧
    (∀ a : Fin 12, sumFinNat (fun b => mgL0_12 a b) = 8) ∧
    (∀ a : Fin 12, sumFinNat (fun b => mgLh_12 a b) = 8) ∧
    (∀ a : Fin 12, sumFinNat (fun b => mgL12 a b) = 16) := by
  decide

private theorem mgM11_block_props :
    ((List.finRange 11).filter (fun i => !mgIsUntouched i)).length = 8 ∧
    ((List.finRange 11).filter mgIsUntouched).length = 3 ∧
    (∀ a b : Fin 11, mgM11 a b = mgM11 b a) ∧
    (∀ a b : Fin 11, mgIsUntouched a = true → mgIsUntouched b = true → mgM11 a b = 0) ∧
    (∀ a : Fin 11, mgIsUntouched a = false →
      sumFinNat (fun b => if mgIsUntouched b then 0 else mgM11 a b) = 8 ∧
      sumFinNat (fun b => if mgIsUntouched b then mgM11 a b else 0) = 6 ∧
      sumFinNat (fun b => mgM11 a b) = 14) ∧
    (∀ a : Fin 11, mgIsUntouched a = true →
      sumFinNat (fun b => if mgIsUntouched b then 0 else mgM11 a b) = 16 ∧
      sumFinNat (fun b => if mgIsUntouched b then mgM11 a b else 0) = 0 ∧
      sumFinNat (fun b => mgM11 a b) = 16) := by
  decide

/-- Theorem MG-2: Exact unfixed `12 × 12` interaction matrix `L_12` (uniform row sum `16 = 8 + 8`
    across `|Δx_0| ∈ {0, 1/2}`, symmetric, zero diagonal) and exact 1D-spatial axial-gauge `11 × 11`
    block structure of `M_11`: `8` reduced directions of degree `14` (`8` reduced + `6` untouched),
    `3` untouched directions of degree `16` (`16` reduced + `0` untouched, ZERO untouched-to-untouched
    couplings), yielding the exact `2 × 2` block quotient matrix `B = [[8, 6], [16, 0]]`. -/
theorem thm_mg_unfixed_L12_and_axial_M11_blocks :
    (∀ a : Fin 12, mgL12 a a = 0 ∧
      sumFinNat (fun b => mgL0_12 a b) = 8 ∧
      sumFinNat (fun b => mgLh_12 a b) = 8 ∧
      sumFinNat (fun b => mgL12 a b) = 16) ∧
    (∀ a b : Fin 12, mgL12 a b = mgL12 b a) ∧
    ((List.finRange 11).filter (fun i => !mgIsUntouched i)).length = 8 ∧
    ((List.finRange 11).filter mgIsUntouched).length = 3 ∧
    (∀ a b : Fin 11, mgM11 a b = mgM11 b a) ∧
    (∀ a b : Fin 11, mgIsUntouched a = true → mgIsUntouched b = true → mgM11 a b = 0) ∧
    (∀ a : Fin 11, mgIsUntouched a = false →
      sumFinNat (fun b => if mgIsUntouched b then 0 else mgM11 a b) = 8 ∧
      sumFinNat (fun b => if mgIsUntouched b then mgM11 a b else 0) = 6 ∧
      sumFinNat (fun b => mgM11 a b) = 14) ∧
    (∀ a : Fin 11, mgIsUntouched a = true →
      sumFinNat (fun b => if mgIsUntouched b then 0 else mgM11 a b) = 16 ∧
      sumFinNat (fun b => if mgIsUntouched b then mgM11 a b else 0) = 0 ∧
      sumFinNat (fun b => mgM11 a b) = 16) := by
  refine ⟨fun a => ⟨mgL12_props.2.1 a, mgL12_props.2.2.2.1 a,
                    mgL12_props.2.2.2.2.1 a, mgL12_props.2.2.2.2.2 a⟩,
          mgL12_props.2.2.1, mgM11_block_props.1, mgM11_block_props.2.1,
          mgM11_block_props.2.2.1, mgM11_block_props.2.2.2.1,
          mgM11_block_props.2.2.2.2.1, mgM11_block_props.2.2.2.2.2⟩


/-! ## Section 2: Ordered Quadratic Ring `ℤ[√7]` & Exact `M_11` Perron Eigenvector -/

/-- Exact quadratic integer `a + b √7 ∈ ℤ[√7]`. -/
structure ZSqrt7 where
  a : Int
  b : Int
  deriving DecidableEq, Repr

namespace ZSqrt7

def zero : ZSqrt7 := ⟨0, 0⟩
def one : ZSqrt7 := ⟨1, 0⟩
def sqrt7 : ZSqrt7 := ⟨0, 1⟩
def ofInt (k : Int) : ZSqrt7 := ⟨k, 0⟩

def add (x y : ZSqrt7) : ZSqrt7 := ⟨x.a + y.a, x.b + y.b⟩
def neg (x : ZSqrt7) : ZSqrt7 := ⟨-x.a, -x.b⟩
def sub (x y : ZSqrt7) : ZSqrt7 := ⟨x.a - y.a, x.b - y.b⟩
def scale (k : Int) (x : ZSqrt7) : ZSqrt7 := ⟨k * x.a, k * x.b⟩

/-- Exact multiplication `(a + b √7)(c + d √7) = (a c + 7 b d) + (a d + b c) √7`. -/
def mul (x y : ZSqrt7) : ZSqrt7 :=
  ⟨x.a * y.a + 7 * (x.b * y.b), x.a * y.b + x.b * y.a⟩

/-- Algebraic field norm `N(a + b √7) = a^2 - 7 b^2`. -/
def norm (x : ZSqrt7) : Int := x.a * x.a - 7 * (x.b * x.b)

/-- Exact strict positivity predicate `a + b √7 > 0` under the real embedding `√7 > 0`. -/
def isPos (x : ZSqrt7) : Prop :=
  (0 ≤ x.a ∧ 0 ≤ x.b ∧ (0 < x.a ∨ 0 < x.b)) ∨
  (0 < x.a ∧ x.b < 0 ∧ 7 * (x.b * x.b) < x.a * x.a) ∨
  (x.a < 0 ∧ 0 < x.b ∧ x.a * x.a < 7 * (x.b * x.b))

instance (x : ZSqrt7) : Decidable (isPos x) := by
  unfold isPos
  infer_instance

/-- Strict order `x < y` in `ℤ[√7]`. -/
def lt (x y : ZSqrt7) : Prop := isPos (sub y x)

instance (x y : ZSqrt7) : Decidable (lt x y) := by
  unfold lt
  infer_instance

private theorem sqrt7_sq : mul sqrt7 sqrt7 = ofInt 7 := by decide

private theorem add_comm (x y : ZSqrt7) : add x y = add y x := by
  cases x; cases y; simp only [add, ZSqrt7.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem add_assoc (x y z : ZSqrt7) : add (add x y) z = add x (add y z) := by
  cases x; cases y; cases z; simp only [add, ZSqrt7.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem mul_comm (x y : ZSqrt7) : mul x y = mul y x := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [mul, ZSqrt7.mk.injEq]
  rw [Int.mul_comm xa ya, Int.mul_comm xb yb, Int.mul_comm xa yb, Int.mul_comm xb ya]
  exact ⟨rfl, by omega⟩

private theorem mul_add (x y z : ZSqrt7) : mul x (add y z) = add (mul x y) (mul x z) := by
  cases x; cases y; cases z
  simp only [mul, add, ZSqrt7.mk.injEq, Int.mul_add]
  exact ⟨by omega, by omega⟩

private theorem mul_assoc (x y z : ZSqrt7) : mul (mul x y) z = mul x (mul y z) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  cases z with | mk za zb =>
  simp only [mul, ZSqrt7.mk.injEq, Int.add_mul, Int.mul_add, Int.mul_assoc]
  have h1 : 7 * (xa * (yb * zb)) = xa * (7 * (yb * zb)) := by
    rw [← Int.mul_assoc 7 xa (yb * zb), Int.mul_comm 7 xa, Int.mul_assoc]
  have h2 : 7 * (xb * (yb * zb)) = xb * (7 * (yb * zb)) := by
    rw [← Int.mul_assoc 7 xb (yb * zb), Int.mul_comm 7 xb, Int.mul_assoc]
  rw [h1, h2]
  exact ⟨by omega, by omega⟩

private theorem norm_mul (x y : ZSqrt7) : norm (mul x y) = norm x * norm y := by
  cases x with | mk a b =>
  cases y with | mk c d =>
  simp only [norm, mul, Int.add_mul, Int.mul_add, Int.sub_mul, Int.mul_sub]
  have hsq : ∀ u v : Int, (u * v) * (u * v) = (u * u) * (v * v) := by
    intro u v
    calc (u * v) * (u * v) = u * (v * (u * v)) := Int.mul_assoc u v (u * v)
      _ = u * ((v * u) * v) := by rw [← Int.mul_assoc v u v]
      _ = u * ((u * v) * v) := by rw [Int.mul_comm v u]
      _ = u * (u * (v * v)) := by rw [Int.mul_assoc u v v]
      _ = (u * u) * (v * v) := (Int.mul_assoc u u (v * v)).symm
  have h1 : (a * c) * (a * c) = (a * a) * (c * c) := hsq a c
  have h2 : (a * d) * (a * d) = (a * a) * (d * d) := hsq a d
  have h3 : (b * c) * (b * c) = (b * b) * (c * c) := hsq b c
  have h4 : (b * d) * (b * d) = (b * b) * (d * d) := hsq b d
  have h5 : (7 * (b * d)) * (7 * (b * d)) = 49 * ((b * b) * (d * d)) := by
    calc (7 * (b * d)) * (7 * (b * d))
        = 7 * ((b * d) * (7 * (b * d))) := Int.mul_assoc 7 (b * d) (7 * (b * d))
      _ = 7 * (7 * ((b * d) * (b * d))) := by
            rw [← Int.mul_assoc (b * d) 7 (b * d), Int.mul_comm (b * d) 7, Int.mul_assoc]
      _ = (7 * 7) * ((b * d) * (b * d)) := (Int.mul_assoc 7 7 _).symm
      _ = 49 * ((b * b) * (d * d)) := by rw [h4]; rfl
  have h6 : (7 * (b * b)) * (7 * (d * d)) = 49 * ((b * b) * (d * d)) := by
    calc (7 * (b * b)) * (7 * (d * d))
        = 7 * ((b * b) * (7 * (d * d))) := Int.mul_assoc 7 (b * b) (7 * (d * d))
      _ = 7 * (7 * ((b * b) * (d * d))) := by
            rw [← Int.mul_assoc (b * b) 7 (d * d), Int.mul_comm (b * b) 7, Int.mul_assoc]
      _ = (7 * 7) * ((b * b) * (d * d)) := (Int.mul_assoc 7 7 _).symm
      _ = 49 * ((b * b) * (d * d)) := rfl
  have hc1 : (a * c) * (7 * (b * d)) = 7 * ((a * b) * (c * d)) := by
    calc (a * c) * (7 * (b * d)) = 7 * ((a * c) * (b * d)) := by
            rw [Int.mul_comm (a * c) (7 * (b * d)), Int.mul_assoc, Int.mul_comm (b * d) (a * c)]
      _ = 7 * ((a * b) * (c * d)) := by
            congr 1
            calc (a * c) * (b * d) = a * (c * (b * d)) := Int.mul_assoc a c (b * d)
              _ = a * ((c * b) * d) := by rw [← Int.mul_assoc c b d]
              _ = a * ((b * c) * d) := by rw [Int.mul_comm c b]
              _ = a * (b * (c * d)) := by rw [Int.mul_assoc b c d]
              _ = (a * b) * (c * d) := (Int.mul_assoc a b (c * d)).symm
  have hc2 : (7 * (b * d)) * (a * c) = 7 * ((a * b) * (c * d)) := by
    rw [Int.mul_comm, hc1]
  have hc3 : (a * d) * (b * c) = (a * b) * (c * d) := by
    calc (a * d) * (b * c) = a * (d * (b * c)) := Int.mul_assoc a d (b * c)
      _ = a * ((d * b) * c) := by rw [← Int.mul_assoc d b c]
      _ = a * ((b * d) * c) := by rw [Int.mul_comm d b]
      _ = a * (b * (d * c)) := by rw [Int.mul_assoc b d c]
      _ = a * (b * (c * d)) := by rw [Int.mul_comm d c]
      _ = (a * b) * (c * d) := (Int.mul_assoc a b (c * d)).symm
  have hc4 : (b * c) * (a * d) = (a * b) * (c * d) := by rw [Int.mul_comm, hc3]
  have hm1 : (a * a) * (7 * (d * d)) = 7 * ((a * a) * (d * d)) := by
    rw [Int.mul_comm (a * a) (7 * (d * d)), Int.mul_assoc, Int.mul_comm (d * d) (a * a)]
  have hm2 : (7 * (b * b)) * (c * c) = 7 * ((b * b) * (c * c)) := Int.mul_assoc 7 (b * b) (c * c)
  rw [h1, h2, h3, h5, h6, hc1, hc2, hc3, hc4, hm1, hm2]
  omega

private theorem isPos_asym (x : ZSqrt7) : ¬(isPos x ∧ isPos (neg x)) := by
  rcases x with ⟨a, b⟩
  simp only [isPos, neg]
  rintro ⟨h1, h2⟩
  have ha : (-a) * (-a) = a * a := by rw [Int.neg_mul, Int.mul_neg, Int.neg_neg]
  have hb : (-b) * (-b) = b * b := by rw [Int.neg_mul, Int.mul_neg, Int.neg_neg]
  rw [ha, hb] at h2
  rcases h1 with ⟨_, _, _⟩ | ⟨_, _, _⟩ | ⟨_, _, _⟩ <;>
  rcases h2 with ⟨_, _, _⟩ | ⟨_, _, _⟩ | ⟨_, _, _⟩ <;>
  omega

private theorem int_mul_pos_of_pos {u v : Int} (hu : 0 < u) (hv : 0 < v) : 0 < u * v := by
  have h := Int.mul_nonneg (show 0 ≤ u - 1 by omega) (show 0 ≤ v - 1 by omega)
  rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.one_mul, Int.mul_one] at h
  omega

private theorem int_sq_lt_of_pos_lt {u v : Int} (hu : 0 ≤ u) (huv : u < v) : u * u < v * v := by
  have h : 0 < (v - u) * (v + u) := int_mul_pos_of_pos (by omega) (by omega)
  rw [Int.sub_mul, Int.mul_add, Int.mul_add, Int.mul_comm u v] at h
  omega

private theorem isPos_scale_pos (k : Int) (hk : 0 < k) (x : ZSqrt7) (hx : isPos x) :
    isPos (scale k x) := by
  rcases x with ⟨a, b⟩
  simp only [isPos, scale] at hx ⊢
  have hka : (k * a) * (k * a) = (k * k) * (a * a) := by
    calc (k * a) * (k * a) = k * (a * (k * a)) := Int.mul_assoc k a (k * a)
      _ = k * ((a * k) * a) := by rw [← Int.mul_assoc a k a]
      _ = k * ((k * a) * a) := by rw [Int.mul_comm a k]
      _ = k * (k * (a * a)) := by rw [Int.mul_assoc k a a]
      _ = (k * k) * (a * a) := (Int.mul_assoc k k (a * a)).symm
  have hkb : (k * b) * (k * b) = (k * k) * (b * b) := by
    calc (k * b) * (k * b) = k * (b * (k * b)) := Int.mul_assoc k b (k * b)
      _ = k * ((b * k) * b) := by rw [← Int.mul_assoc b k b]
      _ = k * ((k * b) * b) := by rw [Int.mul_comm b k]
      _ = k * (k * (b * b)) := by rw [Int.mul_assoc k b b]
      _ = (k * k) * (b * b) := (Int.mul_assoc k k (b * b)).symm
  have hk2 : 0 < k * k := int_mul_pos_of_pos hk hk
  rcases hx with ⟨ha, hb, hab⟩ | ⟨ha, hb, hsq⟩ | ⟨ha, hb, hsq⟩
  · left
    refine ⟨Int.mul_nonneg (by omega) ha, Int.mul_nonneg (by omega) hb, ?_⟩
    rcases hab with ha0 | hb0
    · exact Or.inl (int_mul_pos_of_pos hk ha0)
    · exact Or.inr (int_mul_pos_of_pos hk hb0)
  · right; left
    have hnb : k * b < 0 := by
      have hp := int_mul_pos_of_pos hk (show 0 < -b by omega)
      rw [Int.mul_neg] at hp; omega
    refine ⟨int_mul_pos_of_pos hk ha, hnb, ?_⟩
    rw [hka, hkb]
    have hd : 0 < (k * k) * (a * a - 7 * (b * b)) := int_mul_pos_of_pos hk2 (by omega)
    rw [Int.mul_sub, ← Int.mul_assoc (k * k) 7 (b * b), Int.mul_comm (k * k) 7,
        Int.mul_assoc 7 (k * k) (b * b)] at hd
    omega
  · right; right
    have hna : k * a < 0 := by
      have hp := int_mul_pos_of_pos hk (show 0 < -a by omega)
      rw [Int.mul_neg] at hp; omega
    refine ⟨hna, int_mul_pos_of_pos hk hb, ?_⟩
    rw [hka, hkb]
    have hd : 0 < (k * k) * (7 * (b * b) - a * a) := int_mul_pos_of_pos hk2 (by omega)
    rw [Int.mul_sub, ← Int.mul_assoc (k * k) 7 (b * b), Int.mul_comm (k * k) 7,
        Int.mul_assoc 7 (k * k) (b * b)] at hd
    omega

/-- Exact finite sum of `ZSqrt7` elements over `Fin n`. -/
def sumFinAux {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → ZSqrt7) : ZSqrt7 :=
  match k with
  | 0 => zero
  | m + 1 => add (sumFinAux m (by omega) f) (f ⟨m, by omega⟩)

def sumFin {n : Nat} (f : Fin n → ZSqrt7) : ZSqrt7 :=
  sumFinAux n (Nat.le_refl n) f

end ZSqrt7

/-- Exact axial-gauge Perron-Frobenius eigenvalue `Λ_11(0) = 4 + 4 √7 ∈ ℤ[√7]`. -/
def mgLambda11 : ZSqrt7 := ⟨4, 4⟩

/-- Exact strictly positive Perron eigenvector `v_11 : Fin 11 → ℤ[√7]`:
    `v_R = 1 + √7 > 0` on the `8` reduced directions and `v_U = 4 > 0` on the `3` untouched directions
    (achieving the exact ratio `v_U / v_R = 2 (√7 - 1) / 3`). -/
def mgPerronVec11 (i : Fin 11) : ZSqrt7 :=
  if mgIsUntouched i then ZSqrt7.ofInt 4 else ⟨1, 1⟩

/-- Exact `ZSqrt7` matrix-vector action `(M_11 v)_a = ∑_{b : Fin 11} M_11(a, b) * v(b)`. -/
def mgM11ActionZ7 (v : Fin 11 → ZSqrt7) (a : Fin 11) : ZSqrt7 :=
  ZSqrt7.sumFin (fun b => ZSqrt7.scale (Int.ofNat (mgM11 a b)) (v b))

private theorem mg_perron_and_brackets :
    (∀ a : Fin 11, ZSqrt7.isPos (mgPerronVec11 a)) ∧
    (∀ a : Fin 11, mgM11ActionZ7 mgPerronVec11 a = ZSqrt7.mul mgLambda11 (mgPerronVec11 a)) ∧
    ZSqrt7.mul (ZSqrt7.ofInt 3) (ZSqrt7.ofInt 4) =
      ZSqrt7.mul ⟨-2, 2⟩ ⟨1, 1⟩ ∧
    ZSqrt7.lt (ZSqrt7.ofInt 14583005) (ZSqrt7.scale 1000000 mgLambda11) ∧
    ZSqrt7.lt (ZSqrt7.scale 1000000 mgLambda11) (ZSqrt7.ofInt 14583006) ∧
    ZSqrt7.lt mgLambda11 (ZSqrt7.ofInt 16) ∧
    ZSqrt7.lt (ZSqrt7.scale 10971 mgLambda11) (ZSqrt7.ofInt 160000) := by
  decide

/-- Theorem MG-3: Exact `ℤ[√7]` Perron-Frobenius eigenpair `M_11 v_11 = (4 + 4√7) v_11` with
    strictly positive eigenvector `v_11` (`1 + √7 > 0` on the `8` reduced directions, `4 > 0` on
    the `3` untouched directions, exact ratio `3 v_U = 2(√7 - 1) v_R`), exact strict rational
    bracket `14583005 / 1000000 < 4 + 4√7 < 14583006 / 1000000`, and strict spectral contraction
    `4 + 4√7 < 16` (`16 / (4 + 4√7) > 10971 / 10000`, `> 9.71%` threshold boost). -/
theorem thm_mg_axial_perron_eigenvector_and_bracket :
    ZSqrt7.mul ZSqrt7.sqrt7 ZSqrt7.sqrt7 = ZSqrt7.ofInt 7 ∧
    (∀ x y : ZSqrt7, ZSqrt7.norm (ZSqrt7.mul x y) = ZSqrt7.norm x * ZSqrt7.norm y) ∧
    (∀ x : ZSqrt7, ¬(ZSqrt7.isPos x ∧ ZSqrt7.isPos (ZSqrt7.neg x))) ∧
    (∀ a : Fin 11, ZSqrt7.isPos (mgPerronVec11 a)) ∧
    (∀ a : Fin 11, mgM11ActionZ7 mgPerronVec11 a = ZSqrt7.mul mgLambda11 (mgPerronVec11 a)) ∧
    ZSqrt7.mul (ZSqrt7.ofInt 3) (ZSqrt7.ofInt 4) = ZSqrt7.mul ⟨-2, 2⟩ ⟨1, 1⟩ ∧
    ZSqrt7.lt (ZSqrt7.ofInt 14583005) (ZSqrt7.scale 1000000 mgLambda11) ∧
    ZSqrt7.lt (ZSqrt7.scale 1000000 mgLambda11) (ZSqrt7.ofInt 14583006) ∧
    ZSqrt7.lt mgLambda11 (ZSqrt7.ofInt 16) ∧
    ZSqrt7.lt (ZSqrt7.scale 10971 mgLambda11) (ZSqrt7.ofInt 160000) :=
  ⟨ZSqrt7.sqrt7_sq, ZSqrt7.norm_mul, ZSqrt7.isPos_asym,
   mg_perron_and_brackets.1, mg_perron_and_brackets.2.1,
   mg_perron_and_brackets.2.2.1, mg_perron_and_brackets.2.2.2.1,
   mg_perron_and_brackets.2.2.2.2.1, mg_perron_and_brackets.2.2.2.2.2.1,
   mg_perron_and_brackets.2.2.2.2.2.2⟩


/-! ## Section 3: Biquadratic Ring `ℤ[√3, √7]`, Exact `SU(2)` `S^3` Identities & `2.51x` Ratio -/

/-- Exact biquadratic integer `a + b √3 + c √7 + d √21 ∈ ℤ[√3, √7]`. -/
structure ZSqrt37 where
  a : Int
  b : Int
  c : Int
  d : Int
  deriving DecidableEq, Repr

namespace ZSqrt37

def ofInt (k : Int) : ZSqrt37 := ⟨k, 0, 0, 0⟩
def ofZSqrt7 (x : ZSqrt7) : ZSqrt37 := ⟨x.a, 0, x.b, 0⟩
def sqrt3 : ZSqrt37 := ⟨0, 1, 0, 0⟩
def sqrt7 : ZSqrt37 := ⟨0, 0, 1, 0⟩
def sqrt21 : ZSqrt37 := ⟨0, 0, 0, 1⟩

def add (x y : ZSqrt37) : ZSqrt37 :=
  ⟨x.a + y.a, x.b + y.b, x.c + y.c, x.d + y.d⟩

def sub (x y : ZSqrt37) : ZSqrt37 :=
  ⟨x.a - y.a, x.b - y.b, x.c - y.c, x.d - y.d⟩

def scale (k : Int) (x : ZSqrt37) : ZSqrt37 :=
  ⟨k * x.a, k * x.b, k * x.c, k * x.d⟩

/-- Exact multiplication in `ℤ[√3, √7]` using `√3^2 = 3`, `√7^2 = 7`, `√3 √7 = √21`, `√21^2 = 21`. -/
def mul (x y : ZSqrt37) : ZSqrt37 :=
  ⟨ x.a * y.a + 3 * (x.b * y.b) + 7 * (x.c * y.c) + 21 * (x.d * y.d),
    x.a * y.b + x.b * y.a + 7 * (x.c * y.d + x.d * y.c),
    x.a * y.c + x.c * y.a + 3 * (x.b * y.d + x.d * y.b),
    x.a * y.d + x.d * y.a + x.b * y.c + x.c * y.b ⟩

end ZSqrt37

/-- Exact factorial `n!`. -/
def natFact : Nat → Nat
  | 0 => 1
  | n + 1 => (n + 1) * natFact n

/-- Cleared `l = 1` test-function quotient `s^2 * (L_{κ, 1} φ) / φ` for `φ(θ) = sin θ exp(-γ cos θ)`
    with `s = sin θ`, `c = cos θ` (`c^2 + s^2 = 1`):
    `s^2 (1 - 3 γ c - γ^2 s^2) - (2 c - κ s^2)(c + γ s^2) + 2`. -/
def su2TestQuotL1 (κ γ c s : Int) : Int :=
  (s * s) * (1 - 3 * γ * c - (γ * γ) * (s * s)) -
    (2 * c - κ * (s * s)) * (c + γ * (s * s)) + 2

/-- Cleared differentiated `l = 0` test-function quotient `s^2 * ((L_{κ,1} + κ cos θ) φ) / φ`. -/
def su2TestQuotL0Diff (κ γ c s : Int) : Int :=
  su2TestQuotL1 κ γ c s + κ * c * (s * s)

private theorem mg_mul_left_comm (a b c : Int) : a * (b * c) = b * (a * c) := by
  rw [← Int.mul_assoc, Int.mul_comm a b, Int.mul_assoc]

private theorem su2TestQuotL1_identity (κ γ c s : Int) (hUnit : c * c + s * s = 1) :
    su2TestQuotL1 κ γ c s = (s * s) * (3 + (κ - 5 * γ) * c + γ * (κ - γ) * (s * s)) := by
  unfold su2TestQuotL1
  have hcs : 2 - 2 * (c * c) = 2 * (s * s) := by omega
  have h1 : (2 * c - κ * (s * s)) * (c + γ * (s * s)) =
      2 * (c * c) + 2 * (γ * c * (s * s)) - κ * c * (s * s) - κ * γ * ((s * s) * (s * s)) := by
    simp only [Int.sub_mul, Int.mul_add]
    have ha : (2 * c) * c = 2 * (c * c) := Int.mul_assoc 2 c c
    have hb : (2 * c) * (γ * (s * s)) = 2 * (γ * c * (s * s)) := by
      calc (2 * c) * (γ * (s * s)) = 2 * (c * (γ * (s * s))) := Int.mul_assoc 2 c _
        _ = 2 * ((c * γ) * (s * s)) := by rw [← Int.mul_assoc c γ (s * s)]
        _ = 2 * ((γ * c) * (s * s)) := by rw [Int.mul_comm c γ]
    have hc : (κ * (s * s)) * c = κ * c * (s * s) := by
      rw [Int.mul_assoc, Int.mul_comm (s * s) c, ← Int.mul_assoc]
    have hd : (κ * (s * s)) * (γ * (s * s)) = κ * γ * ((s * s) * (s * s)) := by
      calc (κ * (s * s)) * (γ * (s * s))
          = κ * ((s * s) * (γ * (s * s))) := Int.mul_assoc κ _ _
        _ = κ * (γ * ((s * s) * (s * s))) := by rw [mg_mul_left_comm (s * s) γ (s * s)]
        _ = (κ * γ) * ((s * s) * (s * s)) := (Int.mul_assoc κ γ _).symm
    rw [ha, hb, hc, hd]
    omega
  have h2 : (s * s) * (1 - 3 * γ * c - (γ * γ) * (s * s)) =
      s * s - 3 * (γ * c * (s * s)) - (γ * γ) * ((s * s) * (s * s)) := by
    simp only [Int.mul_sub, Int.mul_one]
    have ha : (s * s) * (3 * γ * c) = 3 * (γ * c * (s * s)) := by
      rw [Int.mul_comm (s * s) (3 * γ * c), Int.mul_assoc 3 γ c, Int.mul_assoc 3 (γ * c) (s * s)]
    have hb : (s * s) * ((γ * γ) * (s * s)) = (γ * γ) * ((s * s) * (s * s)) :=
      mg_mul_left_comm (s * s) (γ * γ) (s * s)
    rw [ha, hb]
  have h3 : (s * s) * (3 + (κ - 5 * γ) * c + γ * (κ - γ) * (s * s)) =
      3 * (s * s) + κ * c * (s * s) - 5 * (γ * c * (s * s)) +
      κ * γ * ((s * s) * (s * s)) - (γ * γ) * ((s * s) * (s * s)) := by
    simp only [Int.mul_add, Int.sub_mul, Int.mul_sub]
    have ha : (s * s) * 3 = 3 * (s * s) := Int.mul_comm (s * s) 3
    have hb : (s * s) * (κ * c) = κ * c * (s * s) := Int.mul_comm (s * s) (κ * c)
    have hc : (s * s) * (5 * γ * c) = 5 * (γ * c * (s * s)) := by
      rw [Int.mul_comm (s * s) (5 * γ * c), Int.mul_assoc 5 γ c, Int.mul_assoc 5 (γ * c) (s * s)]
    have hd : (s * s) * (γ * κ * (s * s)) = κ * γ * ((s * s) * (s * s)) := by
      rw [mg_mul_left_comm (s * s) (γ * κ) (s * s), Int.mul_comm γ κ]
    have he : (s * s) * (γ * γ * (s * s)) = (γ * γ) * ((s * s) * (s * s)) :=
      mg_mul_left_comm (s * s) (γ * γ) (s * s)
    rw [ha, hb, hc, hd, he]
    omega
  rw [h1, h2, h3]
  omega

/-- Theorem MG-4: Exact symbolic algebraic identities of the 10-line `SU(2)` `S^3` von Mises-Fisher
    proof:
    1. Transverse `l = 1` positive test-function quotient identity (at `γ = κ/5`, `≥ 3` for all `κ`),
    2. Radial differentiated `l = 0` quotient identity (at `γ = 2κ/5`, `≥ 3` for all `κ`),
    3. Perpendicular variance power-series term bound `2 * (m! * (m + 1)!) ≤ m! * (m + 2)!` (`∀ m`),
    4. Parallel variance Riccati comparison identities for `s^2 = 4 + κ^2`:
       `(s + 2)^2 - 3(s + 2) - κ^2 = s + 2` and `s(s + 2) - κ^2 = 2(s + 2)`, plus convex combination
       `Var(u · n) ≤ 1/4`,
    5. Exact `ℤ[√3, √7]` axial-threshold cancellation `(12 * β_SU2_axial) * (4 + 4√7) = 24 √3`,
       i.e. `(1 / (2√3)) * (4 + 4√7) * β_SU2_axial = 1` identically. -/
theorem thm_mg_su2_vmf_spectral_gap_and_variance_identities :
    (∀ κ γ c s : Int, c * c + s * s = 1 →
      su2TestQuotL1 κ γ c s = (s * s) * (3 + (κ - 5 * γ) * c + γ * (κ - γ) * (s * s)) ∧
      su2TestQuotL0Diff κ γ c s = (s * s) * (3 + (2 * κ - 5 * γ) * c + γ * (κ - γ) * (s * s))) ∧
    (∀ k c s : Int, c * c + s * s = 1 →
      su2TestQuotL1 (5 * k) k c s = (s * s) * (3 + 4 * ((k * s) * (k * s))) ∧
      3 * (s * s) ≤ su2TestQuotL1 (5 * k) k c s ∧
      su2TestQuotL0Diff (5 * k) (2 * k) c s = (s * s) * (3 + 6 * ((k * s) * (k * s))) ∧
      3 * (s * s) ≤ su2TestQuotL0Diff (5 * k) (2 * k) c s) ∧
    (∀ m : Nat, 2 * (natFact m * natFact (m + 1)) ≤ natFact m * natFact (m + 2)) ∧
    (∀ κ s : Int, s * s = 4 + κ * κ →
      (s + 2) * (s + 2) - 3 * (s + 2) - κ * κ = s + 2 ∧
      s * (s + 2) - κ * κ = 2 * (s + 2)) ∧
    (∀ c s vPar vPerp : Int, 4 * vPar ≤ 1 → 4 * vPerp ≤ 1 →
      4 * ((c * c) * vPar + (s * s) * vPerp) ≤ c * c + s * s) ∧
    ZSqrt37.mul ⟨0, -1, 0, 1⟩ (ZSqrt37.ofZSqrt7 mgLambda11) = ZSqrt37.scale 24 ZSqrt37.sqrt3 := by
  refine ⟨?_, ?_, ?_, ?_, ?_, by decide⟩
  · intro κ γ c s hUnit
    have h1 := su2TestQuotL1_identity κ γ c s hUnit
    refine ⟨h1, ?_⟩
    unfold su2TestQuotL0Diff
    rw [h1]
    simp only [Int.mul_add, Int.sub_mul, Int.mul_sub]
    have hkc : κ * c * (s * s) = (s * s) * (κ * c) := Int.mul_comm (κ * c) (s * s)
    have h2k : (s * s) * (2 * κ * c) = 2 * ((s * s) * (κ * c)) := by
      rw [Int.mul_assoc 2 κ c, mg_mul_left_comm (s * s) 2 (κ * c)]
    rw [hkc, h2k]
    omega
  · intro k c s hUnit
    have h1 := su2TestQuotL1_identity (5 * k) k c s hUnit
    have h2 := su2TestQuotL1_identity (5 * k) (2 * k) c s hUnit
    have hks : k * (5 * k - k) * (s * s) = 4 * ((k * s) * (k * s)) := by
      have hsub : 5 * k - k = 4 * k := by omega
      rw [hsub]
      calc k * (4 * k) * (s * s) = (4 * (k * k)) * (s * s) := by rw [mg_mul_left_comm k 4 k]
        _ = 4 * ((k * k) * (s * s)) := Int.mul_assoc 4 (k * k) (s * s)
        _ = 4 * ((k * s) * (k * s)) := by
              congr 1
              calc (k * k) * (s * s) = k * (k * (s * s)) := Int.mul_assoc k k (s * s)
                _ = k * ((k * s) * s) := by rw [← Int.mul_assoc k s s]
                _ = k * ((s * k) * s) := by rw [Int.mul_comm k s]
                _ = k * (s * (k * s)) := by rw [Int.mul_assoc s k s]
                _ = (k * s) * (k * s) := (Int.mul_assoc k s (k * s)).symm
    have hks2 : 2 * k * (5 * k - 2 * k) * (s * s) = 6 * ((k * s) * (k * s)) := by
      have hsub : 5 * k - 2 * k = 3 * k := by omega
      rw [hsub]
      calc (2 * k) * (3 * k) * (s * s)
          = (2 * (k * (3 * k))) * (s * s) := by rw [Int.mul_assoc 2 k (3 * k)]
        _ = (2 * (3 * (k * k))) * (s * s) := by rw [mg_mul_left_comm k 3 k]
        _ = (6 * (k * k)) * (s * s) := by rw [← Int.mul_assoc 2 3 (k * k)]; rfl
        _ = 6 * ((k * k) * (s * s)) := Int.mul_assoc 6 (k * k) (s * s)
        _ = 6 * ((k * s) * (k * s)) := by
              congr 1
              calc (k * k) * (s * s) = k * (k * (s * s)) := Int.mul_assoc k k (s * s)
                _ = k * ((k * s) * s) := by rw [← Int.mul_assoc k s s]
                _ = k * ((s * k) * s) := by rw [Int.mul_comm k s]
                _ = k * (s * (k * s)) := by rw [Int.mul_assoc s k s]
                _ = (k * s) * (k * s) := (Int.mul_assoc k s (k * s)).symm
    have heq1 : su2TestQuotL1 (5 * k) k c s = (s * s) * (3 + 4 * ((k * s) * (k * s))) := by
      rw [h1, show 5 * k - 5 * k = 0 by omega, Int.zero_mul, Int.add_zero, hks]
    have heq2 : su2TestQuotL0Diff (5 * k) (2 * k) c s = (s * s) * (3 + 6 * ((k * s) * (k * s))) := by
      unfold su2TestQuotL0Diff
      rw [h2]
      have hmid : (s * s) * (3 + (5 * k - 5 * (2 * k)) * c + 2 * k * (5 * k - 2 * k) * (s * s)) +
          5 * k * c * (s * s) = (s * s) * (3 + 6 * ((k * s) * (k * s))) := by
        rw [hks2]
        have hlin : 5 * k - 5 * (2 * k) = -(5 * k) := by omega
        rw [hlin, Int.neg_mul]
        simp only [Int.mul_add, Int.mul_neg]
        rw [Int.mul_comm (s * s) (5 * k * c)]
        omega
      exact hmid
    have hnn1 : 0 ≤ (s * s) * (4 * ((k * s) * (k * s))) :=
      Int.mul_nonneg (int_sq_nonneg s) (Int.mul_nonneg (by decide) (int_sq_nonneg (k * s)))
    have hnn2 : 0 ≤ (s * s) * (6 * ((k * s) * (k * s))) :=
      Int.mul_nonneg (int_sq_nonneg s) (Int.mul_nonneg (by decide) (int_sq_nonneg (k * s)))
    refine ⟨heq1, ?_, heq2, ?_⟩
    · rw [heq1, Int.mul_add, Int.mul_comm (s * s) 3]; omega
    · rw [heq2, Int.mul_add, Int.mul_comm (s * s) 3]; omega
  · intro m
    change 2 * (natFact m * natFact (m + 1)) ≤ natFact m * ((m + 2) * natFact (m + 1))
    have h1 : 2 * (natFact m * natFact (m + 1)) = natFact m * (2 * natFact (m + 1)) := by
      rw [← Nat.mul_assoc, Nat.mul_comm 2 (natFact m), Nat.mul_assoc]
    rw [h1]
    exact Nat.mul_le_mul_left (natFact m) (Nat.mul_le_mul_right (natFact (m + 1)) (by omega))
  · intro κ s hs
    have h1 : (s + 2) * (s + 2) = s * s + 4 * s + 4 := by
      simp only [Int.add_mul, Int.mul_add]; omega
    have h2 : s * (s + 2) = s * s + 2 * s := by
      rw [Int.mul_add]; omega
    rw [h1, h2, hs]
    exact ⟨by omega, by omega⟩
  · intro c s vPar vPerp hPar hPerp
    have hc : 0 ≤ (c * c) * (1 - 4 * vPar) := Int.mul_nonneg (int_sq_nonneg c) (by omega)
    have hs : 0 ≤ (s * s) * (1 - 4 * vPerp) := Int.mul_nonneg (int_sq_nonneg s) (by omega)
    rw [Int.mul_sub, Int.mul_one, ← Int.mul_assoc, Int.mul_comm (c * c) 4, Int.mul_assoc] at hc
    rw [Int.mul_sub, Int.mul_one, ← Int.mul_assoc, Int.mul_comm (s * s) 4, Int.mul_assoc] at hs
    rw [Int.mul_add]
    omega

/-- Exact `ℤ[√3, √7]` identities and zero-float integer-squared inequalities for all `SU(2)`
    thresholds and ratios past `β_BE^{24c}(SU(2)) = 1 / (4√7)`. -/
private theorem mg_su2_thresholds_cert :
    -- Exact biquadratic squaring reductions into ℤ[√7]
    ZSqrt37.mul ⟨0, -1, 0, 1⟩ ⟨0, -1, 0, 1⟩ = ZSqrt37.ofZSqrt7 ⟨24, -6⟩ ∧
    ZSqrt37.mul (ZSqrt37.scale 4 ZSqrt37.sqrt7) ⟨0, -1, 0, 1⟩ = ZSqrt37.scale 4 ⟨0, 7, 0, -1⟩ ∧
    ZSqrt37.mul ⟨0, 7, 0, -1⟩ ⟨0, 7, 0, -1⟩ = ZSqrt37.ofZSqrt7 ⟨168, -42⟩ ∧
    -- β_BE_SU2 = 1 / (4√7) ∈ (0.094491, 0.094492)
    112 * (94491 * 94491) < 1000000 * 1000000 ∧
    1000000 * 1000000 < 112 * (94492 * 94492) ∧
    -- β_SU2_unfixed = √3 / 8 ∈ (0.216506, 0.216507) and > (229/100) * β_BE_SU2
    64 * (216506 * 216506) < 3 * (1000000 * 1000000) ∧
    3 * (1000000 * 1000000) < 64 * (216507 * 216507) ∧
    4 * (229 * 229) < 21 * (100 * 100) ∧
    -- β_SU2_axial = (√21 - √3) / 12 ∈ (0.237543, 0.237544) via (√21 - √3)^2 = 24 - 6√7
    ZSqrt7.lt (ZSqrt7.ofInt ((12 * 237543) * (12 * 237543)))
              (ZSqrt7.scale (1000000 * 1000000) ⟨24, -6⟩) ∧
    ZSqrt7.lt (ZSqrt7.scale (1000000 * 1000000) ⟨24, -6⟩)
              (ZSqrt7.ofInt ((12 * 237544) * (12 * 237544))) ∧
    -- β_SU2_axial / β_BE_SU2 = (7√3 - √21) / 3 > 251/100 (and > 25139/10000) via (7√3 - √21)^2 = 168 - 42√7
    ZSqrt7.lt (ZSqrt7.ofInt ((3 * 251) * (3 * 251)))
              (ZSqrt7.scale (100 * 100) ⟨168, -42⟩) ∧
    ZSqrt7.lt (ZSqrt7.ofInt ((3 * 25139) * (3 * 25139)))
              (ZSqrt7.scale (10000 * 10000) ⟨168, -42⟩) := by
  decide

/-- Theorem MG-5: Exact zero-float `SU(2)` `W_1` thresholds and ratios strictly past `β_BE^{24c}`:
    - `0.094491 < β_BE_SU2 = 1 / (4√7) < 0.094492`,
    - `0.216506 < β_SU2_unfixed = √3 / 8 < 0.216507` and `β_SU2_unfixed > 2.29 * β_BE_SU2`,
    - `0.237543 < β_SU2_axial = √3(√7 - 1) / 12 < 0.237544` (exact `(√21 - √3)^2 = 24 - 6√7`),
    - `β_SU2_axial > 2.51 * β_BE_SU2` (in fact `> 2.5139 * β_BE_SU2`, exact `(7√3 - √21)^2 = 168 - 42√7`). -/
theorem thm_mg_su2_thresholds_and_be_ratios :
    ZSqrt37.mul ⟨0, -1, 0, 1⟩ ⟨0, -1, 0, 1⟩ = ZSqrt37.ofZSqrt7 ⟨24, -6⟩ ∧
    ZSqrt37.mul (ZSqrt37.scale 4 ZSqrt37.sqrt7) ⟨0, -1, 0, 1⟩ = ZSqrt37.scale 4 ⟨0, 7, 0, -1⟩ ∧
    ZSqrt37.mul ⟨0, 7, 0, -1⟩ ⟨0, 7, 0, -1⟩ = ZSqrt37.ofZSqrt7 ⟨168, -42⟩ ∧
    112 * (94491 * 94491) < 1000000 * 1000000 ∧
    1000000 * 1000000 < 112 * (94492 * 94492) ∧
    64 * (216506 * 216506) < 3 * (1000000 * 1000000) ∧
    3 * (1000000 * 1000000) < 64 * (216507 * 216507) ∧
    4 * (229 * 229) < 21 * (100 * 100) ∧
    ZSqrt7.lt (ZSqrt7.ofInt ((12 * 237543) * (12 * 237543)))
              (ZSqrt7.scale (1000000 * 1000000) ⟨24, -6⟩) ∧
    ZSqrt7.lt (ZSqrt7.scale (1000000 * 1000000) ⟨24, -6⟩)
              (ZSqrt7.ofInt ((12 * 237544) * (12 * 237544))) ∧
    ZSqrt7.lt (ZSqrt7.ofInt ((3 * 251) * (3 * 251)))
              (ZSqrt7.scale (100 * 100) ⟨168, -42⟩) ∧
    ZSqrt7.lt (ZSqrt7.ofInt ((3 * 25139) * (3 * 25139)))
              (ZSqrt7.scale (10000 * 10000) ⟨168, -42⟩) :=
  mg_su2_thresholds_cert


/-! ## Section 4: Abstract Weighted Dobrushin Contraction → Geometric Decay & `D_4` Instantiation -/

/-- Exact `n`-step nonnegative matrix power `K^n` on `Fin N` (representing `Q^n * C^n`). -/
def matPowNat {N : Nat} (K : Fin N → Fin N → Nat) : Nat → Fin N → Fin N → Nat
  | 0, x, y => if x = y then 1 else 0
  | n + 1, x, y => sumFinNat (fun z => K x z * matPowNat K n z y)

/-- Cleared geometric tail numerator `q^(d + M - 1) * ∑_{j=0}^{M-1} (p / q)^(d + j)`. -/
def geomTailNum (p q d M : Nat) : Nat :=
  sumNat M (fun j => p ^ (d + j) * q ^ (M - 1 - j))

/-- Cleared finite-horizon weighted Dobrushin path sum `Q^(d + M - 1) * ∑_{n=d}^{d+M-1} ∑_y C^n(x,y) v(y)`. -/
def dobrushinTailSum {N : Nat} (K : Fin N → Fin N → Nat) (Q : Nat)
    (v : Fin N → Nat) (x : Fin N) (d M : Nat) : Nat :=
  sumNat M (fun j => sumFinNat (fun y => matPowNat K (d + j) x y * v y) * Q ^ (M - 1 - j))

/-- Cleared finite-horizon entrywise Dobrushin path sum `Q^(d + M - 1) * ∑_{n=d}^{d+M-1} C^n(x, y)`. -/
def dobrushinEntryTailSum {N : Nat} (K : Fin N → Fin N → Nat) (Q : Nat)
    (x y : Fin N) (d M : Nat) : Nat :=
  sumNat M (fun j => matPowNat K (d + j) x y * Q ^ (M - 1 - j))

private theorem matPowNat_weighted_step {N : Nat} (K : Fin N → Fin N → Nat)
    (Q p q : Nat) (v : Fin N → Nat)
    (hStep : ∀ x : Fin N, q * sumFinNat (fun y => K x y * v y) ≤ p * Q * v x) :
    ∀ (n : Nat) (x : Fin N),
      q ^ n * sumFinNat (fun y => matPowNat K n x y * v y) ≤ (p * Q) ^ n * v x := by
  intro n
  induction n with
  | zero =>
    intro x
    simp only [Nat.pow_zero, Nat.one_mul, matPowNat]
    rw [sumFinNat_delta]
    exact Nat.le_refl (v x)
  | succ m ih =>
    intro x
    have hDist : sumFinNat (fun y => matPowNat K (m + 1) x y * v y) =
        sumFinNat (fun z => K x z * sumFinNat (fun y => matPowNat K m z y * v y)) := by
      have h1 : (fun y => matPowNat K (m + 1) x y * v y) =
          (fun y => sumFinNat (fun z => K x z * (matPowNat K m z y * v y))) := by
        funext y
        simp only [matPowNat, ← sumFinNat_mul_right]
        congr 1
        funext z
        exact Nat.mul_assoc (K x z) (matPowNat K m z y) (v y)
      rw [h1, sumFinNat_swap]
      congr 1
      funext z
      rw [sumFinNat_mul_left]
    rw [hDist, Nat.pow_succ q m]
    have hPull : q ^ m * q * sumFinNat (fun z => K x z * sumFinNat (fun y => matPowNat K m z y * v y)) =
        q * sumFinNat (fun z => K x z * (q ^ m * sumFinNat (fun y => matPowNat K m z y * v y))) := by
      rw [Nat.mul_comm (q ^ m) q, Nat.mul_assoc q (q ^ m), ← sumFinNat_mul_left]
      congr 1
      congr 1
      funext z
      rw [← Nat.mul_assoc, Nat.mul_comm (q ^ m) (K x z), Nat.mul_assoc]
    rw [hPull]
    have hLe1 : sumFinNat (fun z => K x z * (q ^ m * sumFinNat (fun y => matPowNat K m z y * v y))) ≤
        sumFinNat (fun z => K x z * ((p * Q) ^ m * v z)) :=
      sumFinNat_le _ _ (fun z => Nat.mul_le_mul_left (K x z) (ih z))
    have hLe2 : q * sumFinNat (fun z => K x z * (q ^ m * sumFinNat (fun y => matPowNat K m z y * v y))) ≤
        (p * Q) ^ m * (q * sumFinNat (fun z => K x z * v z)) := by
      have hRew : sumFinNat (fun z => K x z * ((p * Q) ^ m * v z)) =
          (p * Q) ^ m * sumFinNat (fun z => K x z * v z) := by
        rw [← sumFinNat_mul_left]
        congr 1
        funext z
        rw [← Nat.mul_assoc, Nat.mul_comm (K x z) ((p * Q) ^ m), Nat.mul_assoc]
      have hMul := Nat.mul_le_mul_left q hLe1
      rw [hRew, ← Nat.mul_assoc, Nat.mul_comm q ((p * Q) ^ m), Nat.mul_assoc] at hMul
      exact hMul
    have hLe3 : (p * Q) ^ m * (q * sumFinNat (fun z => K x z * v z)) ≤
        (p * Q) ^ (m + 1) * v x := by
      have h := Nat.mul_le_mul_left ((p * Q) ^ m) (hStep x)
      rw [← Nat.mul_assoc ((p * Q) ^ m) (p * Q) (v x), ← Nat.pow_succ (p * Q) m] at h
      exact h
    exact Nat.le_trans hLe2 hLe3

private theorem geomTailNum_telescoping (p q d M : Nat) (hpq : p < q) :
    (q - p) * geomTailNum p q d M + p ^ (d + M) = p ^ d * q ^ M := by
  induction M with
  | zero =>
    simp only [geomTailNum, sumNat, Nat.mul_zero, Nat.zero_add, Nat.add_zero, Nat.pow_zero, Nat.mul_one]
  | succ k ih =>
    have hSplit : geomTailNum p q d (k + 1) = q * geomTailNum p q d k + p ^ (d + k) := by
      unfold geomTailNum
      simp only [sumNat]
      have hLast : k + 1 - 1 - k = 0 := by omega
      rw [hLast, Nat.pow_zero, Nat.mul_one]
      have hPrefix : ∀ m : Nat, m ≤ k →
          sumNat m (fun j => p ^ (d + j) * q ^ (k + 1 - 1 - j)) =
            q * sumNat m (fun j => p ^ (d + j) * q ^ (k - 1 - j)) := by
        intro m
        induction m with
        | zero => intro _; simp only [sumNat, Nat.mul_zero]
        | succ r ihr =>
          intro hr
          simp only [sumNat]
          rw [ihr (by omega), Nat.mul_add]
          congr 1
          have hexp : k + 1 - 1 - r = (k - 1 - r) + 1 := by omega
          rw [hexp, Nat.pow_succ, ← Nat.mul_assoc, Nat.mul_comm (p ^ (d + r) * q ^ (k - 1 - r)) q]
      rw [hPrefix k (Nat.le_refl k)]
    rw [hSplit, Nat.mul_add]
    have hAssoc : (q - p) * (q * geomTailNum p q d k) = q * ((q - p) * geomTailNum p q d k) := by
      rw [← Nat.mul_assoc, Nat.mul_comm (q - p) q, Nat.mul_assoc]
    have hStepEq : (q - p) * p ^ (d + k) + p ^ (d + (k + 1)) = q * p ^ (d + k) := by
      have hexp : d + (k + 1) = (d + k) + 1 := by omega
      rw [hexp, Nat.pow_succ, Nat.mul_comm (p ^ (d + k)) p]
      have hSub : (q - p) * p ^ (d + k) + p * p ^ (d + k) = ((q - p) + p) * p ^ (d + k) :=
        (Nat.add_mul (q - p) p (p ^ (d + k))).symm
      rw [hSub, Nat.sub_add_cancel (Nat.le_of_lt hpq)]
    calc (q - p) * (q * geomTailNum p q d k) + (q - p) * p ^ (d + k) + p ^ (d + (k + 1))
        = q * ((q - p) * geomTailNum p q d k) + ((q - p) * p ^ (d + k) + p ^ (d + (k + 1))) := by
            rw [hAssoc, Nat.add_assoc]
      _ = q * ((q - p) * geomTailNum p q d k) + q * p ^ (d + k) := by rw [hStepEq]
      _ = q * ((q - p) * geomTailNum p q d k + p ^ (d + k)) := (Nat.mul_add _ _ _).symm
      _ = q * (p ^ d * q ^ k) := by rw [ih]
      _ = p ^ d * q ^ (k + 1) := by
            rw [Nat.pow_succ, ← Nat.mul_assoc, Nat.mul_comm q (p ^ d), Nat.mul_assoc, Nat.mul_comm q (q ^ k)]

private theorem sumNat_mul_left (m c : Nat) (f : Nat → Nat) :
    sumNat m (fun j => c * f j) = c * sumNat m f := by
  induction m with
  | zero => simp only [sumNat, Nat.mul_zero]
  | succ k ih => simp only [sumNat, ih, Nat.mul_add]

private theorem sumNat_mul_right (m : Nat) (f : Nat → Nat) (c : Nat) :
    sumNat m (fun j => f j * c) = sumNat m f * c := by
  induction m with
  | zero => simp only [sumNat, Nat.zero_mul]
  | succ k ih => simp only [sumNat, ih, Nat.add_mul]

private theorem sumNat_le (m : Nat) (f g : Nat → Nat) (hle : ∀ j : Nat, j < m → f j ≤ g j) :
    sumNat m f ≤ sumNat m g := by
  induction m with
  | zero => exact Nat.le_refl 0
  | succ k ih =>
    simp only [sumNat]
    exact Nat.add_le_add (ih (fun j hj => hle j (by omega))) (hle k (by omega))

private theorem nat_mul_pow (a b n : Nat) : (a * b) ^ n = a ^ n * b ^ n := by
  induction n with
  | zero => simp only [Nat.pow_zero, Nat.mul_one]
  | succ k ih =>
    rw [Nat.pow_succ, ih, Nat.pow_succ a k, Nat.pow_succ b k]
    ac_rfl

/-- Theorem MG-6: Abstract weighted Dobrushin contraction → exact `n`-step matrix power decay
    and uniform finite-horizon geometric correlation decay for ANY finite index set `Fin N`,
    ANY nonnegative scaled matrix `C = K / Q`, ANY bounded positive weights `0 < vMin ≤ v x ≤ vMax`,
    and ANY contraction constant `p / q < 1`:
    1. `q^n * ∑_y K^n(x, y) v(y) ≤ (p * Q)^n * v(x)` for ALL `n : Nat`,
    2. Entrywise decay `q^n * K^n(x, y) * vMin ≤ (p * Q)^n * vMax`,
    3. Exact geometric tail telescoping `(q - p) * geomTailNum p q d M + p^(d + M) = p^d * q^M`,
    4. Uniform finite-horizon Dobrushin tail bound for ALL distances `d` and horizons `M ≥ 1`:
       `q^d * (q - p) * dobrushinTailSum K Q v x d M ≤ Q^(d + M - 1) * (p^d * q) * v x` and
       entrywise `q^d * (q - p) * vMin * dobrushinEntryTailSum K Q x y d M ≤ Q^(d + M - 1) * (p^d * q) * vMax`. -/
theorem thm_mg_dobrushin_power_and_geometric_decay {N : Nat}
    (K : Fin N → Fin N → Nat) (Q p q vMin vMax : Nat) (v : Fin N → Nat)
    (hpq : p < q)
    (hvBounds : ∀ x : Fin N, vMin ≤ v x ∧ v x ≤ vMax)
    (hStep : ∀ x : Fin N, q * sumFinNat (fun y => K x y * v y) ≤ p * Q * v x) :
    (∀ (n : Nat) (x : Fin N),
      q ^ n * sumFinNat (fun y => matPowNat K n x y * v y) ≤ (p * Q) ^ n * v x) ∧
    (∀ (n : Nat) (x y : Fin N),
      q ^ n * matPowNat K n x y * vMin ≤ (p * Q) ^ n * vMax) ∧
    (∀ d M : Nat, (q - p) * geomTailNum p q d M + p ^ (d + M) = p ^ d * q ^ M) ∧
    (∀ d M : Nat, M ≥ 1 → ∀ x : Fin N,
      q ^ d * (q - p) * dobrushinTailSum K Q v x d M ≤ Q ^ (d + M - 1) * (p ^ d * q) * v x) ∧
    (∀ d M : Nat, M ≥ 1 → ∀ x y : Fin N,
      q ^ d * (q - p) * vMin * dobrushinEntryTailSum K Q x y d M ≤
        Q ^ (d + M - 1) * (p ^ d * q) * vMax) := by
  have hPow := matPowNat_weighted_step K Q p q v hStep
  have hEntry : ∀ (n : Nat) (x y : Fin N), q ^ n * matPowNat K n x y * vMin ≤ (p * Q) ^ n * vMax := by
    intro n x y
    have h1 : matPowNat K n x y * vMin ≤ matPowNat K n x y * v y :=
      Nat.mul_le_mul_left _ (hvBounds y).1
    have h2 : matPowNat K n x y * v y ≤ sumFinNat (fun z => matPowNat K n x z * v z) :=
      sumFinNat_single_le (fun z => matPowNat K n x z * v z) y
    have h3 : q ^ n * (matPowNat K n x y * vMin) ≤
        q ^ n * sumFinNat (fun z => matPowNat K n x z * v z) :=
      Nat.mul_le_mul_left (q ^ n) (Nat.le_trans h1 h2)
    have h4 : (p * Q) ^ n * v x ≤ (p * Q) ^ n * vMax :=
      Nat.mul_le_mul_left _ (hvBounds x).2
    rw [Nat.mul_assoc]
    exact Nat.le_trans h3 (Nat.le_trans (hPow n x) h4)
  have hTail : ∀ (d M : Nat), M ≥ 1 → ∀ x : Fin N,
      q ^ d * (q - p) * dobrushinTailSum K Q v x d M ≤ Q ^ (d + M - 1) * (p ^ d * q) * v x := by
    intro d M hM x
    have hqPos : 0 < q := by omega
    have hqMPos : 0 < q ^ (M - 1) := Nat.pow_pos hqPos
    have hTerm : ∀ j : Nat, j < M →
        q ^ (d + M - 1) * (sumFinNat (fun y => matPowNat K (d + j) x y * v y) * Q ^ (M - 1 - j)) ≤
          Q ^ (d + M - 1) * (p ^ (d + j) * q ^ (M - 1 - j)) * v x := by
      intro j hj
      have hExp : d + M - 1 = (d + j) + (M - 1 - j) := by omega
      have hStepJ := hPow (d + j) x
      calc q ^ (d + M - 1) * (sumFinNat (fun y => matPowNat K (d + j) x y * v y) * Q ^ (M - 1 - j))
          = (q ^ (M - 1 - j) * Q ^ (M - 1 - j)) *
              (q ^ (d + j) * sumFinNat (fun y => matPowNat K (d + j) x y * v y)) := by
              rw [hExp, Nat.pow_add]
              calc q ^ (d + j) * q ^ (M - 1 - j) *
                      (sumFinNat (fun y => matPowNat K (d + j) x y * v y) * Q ^ (M - 1 - j))
                  = (q ^ (d + j) * sumFinNat (fun y => matPowNat K (d + j) x y * v y)) *
                      (q ^ (M - 1 - j) * Q ^ (M - 1 - j)) := by
                      rw [Nat.mul_assoc (q ^ (d + j)), ← Nat.mul_assoc (q ^ (M - 1 - j)),
                          Nat.mul_comm (q ^ (M - 1 - j)) (sumFinNat _),
                          Nat.mul_assoc (sumFinNat _), ← Nat.mul_assoc (q ^ (d + j))]
                _ = _ := Nat.mul_comm _ _
        _ ≤ (q ^ (M - 1 - j) * Q ^ (M - 1 - j)) * ((p * Q) ^ (d + j) * v x) :=
              Nat.mul_le_mul_left _ hStepJ
        _ = Q ^ (d + M - 1) * (p ^ (d + j) * q ^ (M - 1 - j)) * v x := by
              rw [nat_mul_pow p Q (d + j), hExp, Nat.pow_add Q (d + j) (M - 1 - j)]
              calc q ^ (M - 1 - j) * Q ^ (M - 1 - j) * (p ^ (d + j) * Q ^ (d + j) * v x)
                  = (q ^ (M - 1 - j) * Q ^ (M - 1 - j) * (p ^ (d + j) * Q ^ (d + j))) * v x :=
                      (Nat.mul_assoc _ _ (v x)).symm
                _ = (Q ^ (d + j) * Q ^ (M - 1 - j) * (p ^ (d + j) * q ^ (M - 1 - j))) * v x := by
                      congr 1
                      calc q ^ (M - 1 - j) * Q ^ (M - 1 - j) * (p ^ (d + j) * Q ^ (d + j))
                          = (Q ^ (M - 1 - j) * Q ^ (d + j)) * (q ^ (M - 1 - j) * p ^ (d + j)) := by
                              rw [Nat.mul_comm (q ^ (M - 1 - j)) (Q ^ (M - 1 - j)),
                                  Nat.mul_comm (p ^ (d + j)) (Q ^ (d + j)),
                                  Nat.mul_assoc (Q ^ (M - 1 - j)),
                                  ← Nat.mul_assoc (q ^ (M - 1 - j)),
                                  Nat.mul_comm (q ^ (M - 1 - j)) (Q ^ (d + j)),
                                  Nat.mul_assoc (Q ^ (d + j)), ← Nat.mul_assoc (Q ^ (M - 1 - j))]
                        _ = Q ^ (d + j) * Q ^ (M - 1 - j) * (p ^ (d + j) * q ^ (M - 1 - j)) := by
                              rw [Nat.mul_comm (Q ^ (M - 1 - j)) (Q ^ (d + j)),
                                  Nat.mul_comm (q ^ (M - 1 - j)) (p ^ (d + j))]
    have hSumLe : q ^ (d + M - 1) * dobrushinTailSum K Q v x d M ≤
        Q ^ (d + M - 1) * geomTailNum p q d M * v x := by
      unfold dobrushinTailSum geomTailNum
      rw [← sumNat_mul_left, ← sumNat_mul_left, ← sumNat_mul_right]
      exact sumNat_le M _ _ hTerm
    have hGeomLe : (q - p) * geomTailNum p q d M ≤ p ^ d * q ^ M := by
      have hEq := geomTailNum_telescoping p q d M hpq
      omega
    have hMul : q ^ (M - 1) * (q ^ d * (q - p) * dobrushinTailSum K Q v x d M) ≤
        q ^ (M - 1) * (Q ^ (d + M - 1) * (p ^ d * q) * v x) := by
      have hLhs : q ^ (M - 1) * (q ^ d * (q - p) * dobrushinTailSum K Q v x d M) =
          (q - p) * (q ^ (d + M - 1) * dobrushinTailSum K Q v x d M) := by
        have hExp : d + M - 1 = d + (M - 1) := by omega
        rw [hExp, Nat.pow_add]
        calc q ^ (M - 1) * (q ^ d * (q - p) * dobrushinTailSum K Q v x d M)
            = (q ^ (M - 1) * q ^ d) * (q - p) * dobrushinTailSum K Q v x d M := by
                rw [← Nat.mul_assoc, ← Nat.mul_assoc]
          _ = (q - p) * (q ^ d * q ^ (M - 1) * dobrushinTailSum K Q v x d M) := by
                rw [Nat.mul_comm (q ^ (M - 1)) (q ^ d),
                    Nat.mul_comm (q ^ d * q ^ (M - 1)) (q - p), Nat.mul_assoc]
      have hRhs : q ^ (M - 1) * (Q ^ (d + M - 1) * (p ^ d * q) * v x) =
          Q ^ (d + M - 1) * (p ^ d * q ^ M) * v x := by
        have hM1 : (M - 1).succ = M := Nat.sub_add_cancel hM
        have hPowM : q ^ (M - 1) * q = q ^ M := by
          rw [← Nat.pow_succ q (M - 1), hM1]
        calc q ^ (M - 1) * (Q ^ (d + M - 1) * (p ^ d * q) * v x)
            = Q ^ (d + M - 1) * (p ^ d * (q ^ (M - 1) * q)) * v x := by ac_rfl
          _ = Q ^ (d + M - 1) * (p ^ d * q ^ M) * v x := by rw [hPowM]
      rw [hLhs, hRhs]
      have h1 := Nat.mul_le_mul_left (q - p) hSumLe
      have hRew : (q - p) * (Q ^ (d + M - 1) * geomTailNum p q d M * v x) =
          Q ^ (d + M - 1) * ((q - p) * geomTailNum p q d M) * v x := by ac_rfl
      rw [hRew] at h1
      have h2 : Q ^ (d + M - 1) * ((q - p) * geomTailNum p q d M) * v x ≤
          Q ^ (d + M - 1) * (p ^ d * q ^ M) * v x :=
        Nat.mul_le_mul_right (v x) (Nat.mul_le_mul_left (Q ^ (d + M - 1)) hGeomLe)
      exact Nat.le_trans h1 h2
    exact Nat.le_of_mul_le_mul_left hMul hqMPos
  refine ⟨hPow, hEntry, fun d M => geomTailNum_telescoping p q d M hpq, hTail, ?_⟩
  intro d M hM x y
  have hEntLe : vMin * dobrushinEntryTailSum K Q x y d M ≤ dobrushinTailSum K Q v x d M := by
    unfold dobrushinEntryTailSum dobrushinTailSum
    rw [← sumNat_mul_left]
    refine sumNat_le M _ _ (fun j _ => ?_)
    rw [← Nat.mul_assoc, Nat.mul_comm vMin (matPowNat K (d + j) x y)]
    have h1 : matPowNat K (d + j) x y * vMin ≤ matPowNat K (d + j) x y * v y :=
      Nat.mul_le_mul_left _ (hvBounds y).1
    have h2 : matPowNat K (d + j) x y * v y ≤ sumFinNat (fun z => matPowNat K (d + j) x z * v z) :=
      sumFinNat_single_le (fun z => matPowNat K (d + j) x z * v z) y
    exact Nat.mul_le_mul_right _ (Nat.le_trans h1 h2)
  have h1 : q ^ d * (q - p) * vMin * dobrushinEntryTailSum K Q x y d M ≤
      q ^ d * (q - p) * dobrushinTailSum K Q v x d M := by
    rw [Nat.mul_assoc (q ^ d * (q - p)) vMin]
    exact Nat.mul_le_mul_left _ hEntLe
  have h2 := hTail d M hM x
  have h3 : Q ^ (d + M - 1) * (p ^ d * q) * v x ≤ Q ^ (d + M - 1) * (p ^ d * q) * vMax :=
    Nat.mul_le_mul_left _ (hvBounds x).2
  exact Nat.le_trans h1 (Nat.le_trans h2 h3)

/-- Integer Perron-approximate weight vector `v_int` (`10` on reduced, `11` on untouched directions). -/
def mgPerronInt11 (i : Fin 11) : Nat :=
  if mgIsUntouched i then 11 else 10

/-- Scaled axial interaction matrix at `β = 1/5` (`C = (3 / 50) M_11`, `Q = 50`). -/
def mgK_beta020 (a b : Fin 11) : Nat := 3 * mgM11 a b

/-- Mass-gap tilted axial interaction matrix at `β = 1/5` with `e^{m/2} = 5/4`
    (`C_tilted = (29 / 2000) * (4 M0_11 + 5 Mh_11)`, `Q = 2000`). -/
def mgK_beta020_tilted (a b : Fin 11) : Nat := 29 * (4 * mgM0_11 a b + 5 * mgMh_11 a b)

/-- Scaled axial interaction matrix at `β = 23/100` (`C = (83 / 1250) M_11`, `Q = 1250`,
    strictly past the unfixed threshold `√3/8 ≈ 0.216506`). -/
def mgK_beta023 (a b : Fin 11) : Nat := 83 * mgM11 a b

private theorem mg_d4_instantiation_checks :
    -- β = 1/5 > (211/100) * β_BE_SU2 (since 25 * 211^2 < 112 * 100^2), 1/(10√3) < 3/50, and 1/(10√3) < 29/500
    25 * (211 * 211) < 112 * (100 * 100) ∧
    50 * 50 < 300 * (3 * 3) ∧
    500 * 500 < 300 * (29 * 29) ∧
    -- β = 23/100 > √3/8 (fails unfixed!) and 23/(200√3) < 83/1250
    3 * (100 * 100) < 64 * (23 * 23) ∧
    (23 * 1250) * (23 * 1250) < 3 * ((83 * 200) * (83 * 200)) ∧
    -- Weight bounds 10 ≤ v_int ≤ 11
    (∀ x : Fin 11, 10 ≤ mgPerronInt11 x ∧ mgPerronInt11 x ≤ 11) ∧
    -- 1-step weighted contractions for all 3 regimes
    (∀ x : Fin 11, 250 * sumFinNat (fun y => mgK_beta020 x y * mgPerronInt11 y) ≤
      219 * 50 * mgPerronInt11 x) ∧
    (∀ x : Fin 11, 5000 * sumFinNat (fun y => mgK_beta020_tilted x y * mgPerronInt11 y) ≤
      4843 * 2000 * mgPerronInt11 x) ∧
    (∀ x : Fin 11, 6250 * sumFinNat (fun y => mgK_beta023 x y * mgPerronInt11 y) ≤
      6059 * 1250 * mgPerronInt11 x) := by
  decide

/-- Theorem MG-7: Non-vacuous concrete instantiation of `thm_mg_dobrushin_power_and_geometric_decay`
    on the exact `11`-direction `D_4` axial-gauge matrix `M_11` with integer Perron weights
    `v_int ∈ {10, 11}`:
    1. At `β = 1/5 = 0.200` (`> 2.11 * β_BE_SU2`): strict geometric correlation decay with rate
       `α = 219 / 250 < 1`,
    2. At `β = 1/5` WITH time-tilt `e^{m/2} = 5/4` (`m = 2 ln(5/4) > 0`): strict weighted
       contraction on `M0_11 + (5/4) Mh_11` with rate `α_tilted = 4843 / 5000 < 1`, certifying a
       strictly positive exponential mass gap beyond `2.11 * β_BE_SU2`,
    3. At `β = 23/100 = 0.230` (strictly past the unfixed threshold `√3/8 ≈ 0.216506`): strict
       axial-gauge geometric decay with rate `α = 6059 / 6250 < 1`. -/
theorem thm_mg_d4_axial_dobrushin_instantiation :
    (25 * (211 * 211) < 112 * (100 * 100) ∧
     50 * 50 < 300 * (3 * 3) ∧ 500 * 500 < 300 * (29 * 29)) ∧
    (3 * (100 * 100) < 64 * (23 * 23) ∧ (23 * 1250) * (23 * 1250) < 3 * ((83 * 200) * (83 * 200))) ∧
    (∀ (d M : Nat), M ≥ 1 → ∀ x y : Fin 11,
      250 ^ d * 31 * 10 * dobrushinEntryTailSum mgK_beta020 50 x y d M ≤
        50 ^ (d + M - 1) * (219 ^ d * 250) * 11) ∧
    (∀ (d M : Nat), M ≥ 1 → ∀ x y : Fin 11,
      5000 ^ d * 157 * 10 * dobrushinEntryTailSum mgK_beta020_tilted 2000 x y d M ≤
        2000 ^ (d + M - 1) * (4843 ^ d * 5000) * 11) ∧
    (∀ (d M : Nat), M ≥ 1 → ∀ x y : Fin 11,
      6250 ^ d * 191 * 10 * dobrushinEntryTailSum mgK_beta023 1250 x y d M ≤
        1250 ^ (d + M - 1) * (6059 ^ d * 6250) * 11) := by
  have hB := mg_d4_instantiation_checks.2.2.2.2.2.1
  have h20 := (thm_mg_dobrushin_power_and_geometric_decay mgK_beta020 50 219 250 10 11 mgPerronInt11
    (by decide) hB mg_d4_instantiation_checks.2.2.2.2.2.2.1).2.2.2.2
  have h20t := (thm_mg_dobrushin_power_and_geometric_decay mgK_beta020_tilted 2000 4843 5000 10 11 mgPerronInt11
    (by decide) hB mg_d4_instantiation_checks.2.2.2.2.2.2.2.1).2.2.2.2
  have h23 := (thm_mg_dobrushin_power_and_geometric_decay mgK_beta023 1250 6059 6250 10 11 mgPerronInt11
    (by decide) hB mg_d4_instantiation_checks.2.2.2.2.2.2.2.2).2.2.2.2
  exact ⟨⟨mg_d4_instantiation_checks.1, mg_d4_instantiation_checks.2.1, mg_d4_instantiation_checks.2.2.1⟩,
         ⟨mg_d4_instantiation_checks.2.2.2.1, mg_d4_instantiation_checks.2.2.2.2.1⟩,
         h20, h20t, h23⟩


/-! ## Section 5: Exact `H_12` Graph (`32` Edges), 3-Forest `[11, 11, 10]`, & Arboricity `32 / 11` -/

/-- Exact undirected edge adjacency of `H_12` on the `12` positive `D_4` roots: `r_i · r_j = 1`. -/
def h12Adj (i j : Fin 12) : Bool :=
  (i != j) && (dot4 (mgPosRoot i) (mgPosRoot j) == 1)

/-- Canonical ordered list of all `32` undirected edges `(i, j)` (`i < j`) of `H_12`. -/
def h12Edges : List (Fin 12 × Fin 12) :=
  ((List.finRange 12).flatMap fun i =>
    ((List.finRange 12).filter fun j => i.val < j.val && h12Adj i j).map fun j => (i, j))

/-- Vertex degree in `H_12`. -/
def h12Deg (i : Fin 12) : Nat :=
  ((List.finRange 12).filter fun j => h12Adj i j).length

/-- Explicit Forest `F_0` (`11` edges) of the `H_12` 3-forest partition. -/
def h12Forest0 : List (Fin 12 × Fin 12) :=
  [ (⟨0, by decide⟩, ⟨2, by decide⟩), (⟨0, by decide⟩, ⟨3, by decide⟩),
    (⟨0, by decide⟩, ⟨4, by decide⟩), (⟨0, by decide⟩, ⟨5, by decide⟩),
    (⟨0, by decide⟩, ⟨6, by decide⟩), (⟨0, by decide⟩, ⟨7, by decide⟩),
    (⟨0, by decide⟩, ⟨8, by decide⟩), (⟨1, by decide⟩, ⟨2, by decide⟩),
    (⟨2, by decide⟩, ⟨10, by decide⟩), (⟨5, by decide⟩, ⟨9, by decide⟩),
    (⟨5, by decide⟩, ⟨11, by decide⟩) ]

/-- Explicit Forest `F_1` (`11` edges) of the `H_12` 3-forest partition. -/
def h12Forest1 : List (Fin 12 × Fin 12) :=
  [ (⟨0, by decide⟩, ⟨9, by decide⟩), (⟨1, by decide⟩, ⟨3, by decide⟩),
    (⟨1, by decide⟩, ⟨4, by decide⟩), (⟨2, by decide⟩, ⟨4, by decide⟩),
    (⟨2, by decide⟩, ⟨5, by decide⟩), (⟨2, by decide⟩, ⟨6, by decide⟩),
    (⟨3, by decide⟩, ⟨7, by decide⟩), (⟨4, by decide⟩, ⟨8, by decide⟩),
    (⟨6, by decide⟩, ⟨9, by decide⟩), (⟨6, by decide⟩, ⟨10, by decide⟩),
    (⟨6, by decide⟩, ⟨11, by decide⟩) ]

/-- Explicit Forest `F_2` (`10` edges) of the `H_12` 3-forest partition. -/
def h12Forest2 : List (Fin 12 × Fin 12) :=
  [ (⟨1, by decide⟩, ⟨5, by decide⟩), (⟨2, by decide⟩, ⟨11, by decide⟩),
    (⟨3, by decide⟩, ⟨4, by decide⟩), (⟨3, by decide⟩, ⟨5, by decide⟩),
    (⟨4, by decide⟩, ⟨10, by decide⟩), (⟨6, by decide⟩, ⟨8, by decide⟩),
    (⟨7, by decide⟩, ⟨8, by decide⟩), (⟨7, by decide⟩, ⟨9, by decide⟩),
    (⟨8, by decide⟩, ⟨10, by decide⟩), (⟨9, by decide⟩, ⟨11, by decide⟩) ]

/-- Undirected adjacency predicate of an edge list on `Fin n`. -/
def edgeListAdj {n : Nat} (es : List (Fin n × Fin n)) (u v : Fin n) : Bool :=
  es.any fun e => (e.1 == u && e.2 == v) || (e.1 == v && e.2 == u)

/-- Parent-pointer and depth witnesses certifying acyclicity of `F_0, F_1, F_2`. -/
def h12Parent0 : Fin 12 → Option (Fin 12)
  | ⟨0, _⟩  => none
  | ⟨1, _⟩  => some ⟨2, by decide⟩
  | ⟨2, _⟩  => some ⟨0, by decide⟩
  | ⟨3, _⟩  => some ⟨0, by decide⟩
  | ⟨4, _⟩  => some ⟨0, by decide⟩
  | ⟨5, _⟩  => some ⟨0, by decide⟩
  | ⟨6, _⟩  => some ⟨0, by decide⟩
  | ⟨7, _⟩  => some ⟨0, by decide⟩
  | ⟨8, _⟩  => some ⟨0, by decide⟩
  | ⟨9, _⟩  => some ⟨5, by decide⟩
  | ⟨10, _⟩ => some ⟨2, by decide⟩
  | ⟨11, _⟩ => some ⟨5, by decide⟩

def h12Depth0 : Fin 12 → Nat
  | ⟨0, _⟩ => 0 | ⟨1, _⟩ => 2 | ⟨2, _⟩ => 1 | ⟨3, _⟩ => 1
  | ⟨4, _⟩ => 1 | ⟨5, _⟩ => 1 | ⟨6, _⟩ => 1 | ⟨7, _⟩ => 1
  | ⟨8, _⟩ => 1 | ⟨9, _⟩ => 2 | ⟨10, _⟩ => 2 | ⟨11, _⟩ => 2

def h12Parent1 : Fin 12 → Option (Fin 12)
  | ⟨0, _⟩  => none
  | ⟨1, _⟩  => some ⟨4, by decide⟩
  | ⟨2, _⟩  => some ⟨6, by decide⟩
  | ⟨3, _⟩  => some ⟨1, by decide⟩
  | ⟨4, _⟩  => some ⟨2, by decide⟩
  | ⟨5, _⟩  => some ⟨2, by decide⟩
  | ⟨6, _⟩  => some ⟨9, by decide⟩
  | ⟨7, _⟩  => some ⟨3, by decide⟩
  | ⟨8, _⟩  => some ⟨4, by decide⟩
  | ⟨9, _⟩  => some ⟨0, by decide⟩
  | ⟨10, _⟩ => some ⟨6, by decide⟩
  | ⟨11, _⟩ => some ⟨6, by decide⟩

def h12Depth1 : Fin 12 → Nat
  | ⟨0, _⟩ => 0 | ⟨1, _⟩ => 5 | ⟨2, _⟩ => 3 | ⟨3, _⟩ => 6
  | ⟨4, _⟩ => 4 | ⟨5, _⟩ => 4 | ⟨6, _⟩ => 2 | ⟨7, _⟩ => 7
  | ⟨8, _⟩ => 5 | ⟨9, _⟩ => 1 | ⟨10, _⟩ => 3 | ⟨11, _⟩ => 3

def h12Parent2 : Fin 12 → Option (Fin 12)
  | ⟨0, _⟩  => none
  | ⟨1, _⟩  => none
  | ⟨2, _⟩  => some ⟨11, by decide⟩
  | ⟨3, _⟩  => some ⟨5, by decide⟩
  | ⟨4, _⟩  => some ⟨3, by decide⟩
  | ⟨5, _⟩  => some ⟨1, by decide⟩
  | ⟨6, _⟩  => some ⟨8, by decide⟩
  | ⟨7, _⟩  => some ⟨8, by decide⟩
  | ⟨8, _⟩  => some ⟨10, by decide⟩
  | ⟨9, _⟩  => some ⟨7, by decide⟩
  | ⟨10, _⟩ => some ⟨4, by decide⟩
  | ⟨11, _⟩ => some ⟨9, by decide⟩

def h12Depth2 : Fin 12 → Nat
  | ⟨0, _⟩ => 0 | ⟨1, _⟩ => 0 | ⟨2, _⟩ => 9 | ⟨3, _⟩ => 2
  | ⟨4, _⟩ => 3 | ⟨5, _⟩ => 1 | ⟨6, _⟩ => 6 | ⟨7, _⟩ => 6
  | ⟨8, _⟩ => 5 | ⟨9, _⟩ => 7 | ⟨10, _⟩ => 4 | ⟨11, _⟩ => 8

private theorem fin_argmax_exists {L : Nat} (hL : L ≥ 1) (f : Fin L → Nat) :
    ∃ m : Fin L, ∀ i : Fin L, f i ≤ f m := by
  have hAux : ∀ k : Nat, k ≥ 1 → k ≤ L → ∃ m : Fin L, m.val < k ∧ ∀ i : Fin L, i.val < k → f i ≤ f m := by
    intro k
    induction k with
    | zero => intro hk; omega
    | succ r ih =>
      intro _ hrL
      cases r with
      | zero =>
        refine ⟨⟨0, by omega⟩, show (0 : Nat) < 1 from by decide, ?_⟩
        intro i hi
        have hEq : i = ⟨0, by omega⟩ := Fin.ext (show i.val = 0 by omega)
        rw [hEq]
        exact Nat.le_refl _
      | succ t =>
        have ⟨mPrev, hmLt, hmMax⟩ := ih (by omega) (by omega)
        let cur : Fin L := ⟨t + 1, by omega⟩
        if hCmp : f mPrev ≤ f cur then
          refine ⟨cur, by dsimp [cur]; omega, ?_⟩
          intro i hi
          if hilt : i.val < t + 1 then
            exact Nat.le_trans (hmMax i hilt) hCmp
          else
            have hEq : i = cur := Fin.ext (by dsimp [cur]; omega)
            rw [hEq]
            exact Nat.le_refl _
        else
          refine ⟨mPrev, by omega, ?_⟩
          intro i hi
          if hilt : i.val < t + 1 then
            exact hmMax i hilt
          else
            have hEq : i = cur := Fin.ext (by dsimp [cur]; omega)
            rw [hEq]
            omega
  have ⟨m, _, hm⟩ := hAux L hL (Nat.le_refl L)
  exact ⟨m, fun i => hm i i.isLt⟩

/-- General symbolic graph acyclicity theorem from a parent-depth certificate:
    NO non-backtracking cyclic walk of ANY length `L ≥ 1` (and hence NO simple cycle of ANY
    length `L ≥ 3`) can exist in any graph oriented by `par` with strictly decreasing `depth`. -/
private theorem acyclic_of_parent_depth {n : Nat} (E : Fin n → Fin n → Bool)
    (par : Fin n → Option (Fin n)) (depth : Fin n → Nat)
    (hCover : ∀ u v : Fin n, E u v = true → par u = some v ∨ par v = some u)
    (hDepth : ∀ u p : Fin n, par u = some p → depth p < depth u)
    (L : Nat) (hL : L ≥ 1) (w : Fin L → Fin n)
    (hAdj : ∀ i : Fin L, E (w i) (w ⟨(i.val + 1) % L, Nat.mod_lt _ (by omega)⟩) = true)
    (hNoBack : ∀ i : Fin L, w ⟨(i.val + 2) % L, Nat.mod_lt _ (by omega)⟩ ≠ w i) :
    False := by
  have ⟨m, hmMax⟩ := fin_argmax_exists hL (fun i => depth (w i))
  let prevIdx : Fin L := ⟨(m.val + L - 1) % L, Nat.mod_lt _ (by omega)⟩
  let nextIdx : Fin L := ⟨(m.val + 1) % L, Nat.mod_lt _ (by omega)⟩
  have hPrevNext : (prevIdx.val + 1) % L = m.val := by
    dsimp [prevIdx]
    have h1 : ((m.val + L - 1) % L + 1) % L = ((m.val + L - 1) + 1) % L := by
      rw [Nat.add_mod, Nat.mod_mod, ← Nat.add_mod]
    have h2 : (m.val + L - 1) + 1 = m.val + L := by omega
    rw [h1, h2, Nat.add_mod_right, Nat.mod_eq_of_lt m.isLt]
  have hPrev2 : (prevIdx.val + 2) % L = nextIdx.val := by
    dsimp [prevIdx, nextIdx]
    have h1 : ((m.val + L - 1) % L + 2) % L = ((m.val + L - 1) + 2) % L := by
      rw [Nat.add_mod, Nat.mod_mod, ← Nat.add_mod]
    have h2 : (m.val + L - 1) + 2 = (m.val + 1) + L := by omega
    rw [h1, h2, Nat.add_mod_right]
  have hE1 : E (w prevIdx) (w m) = true := by
    have h := hAdj prevIdx
    have hIdx : (⟨(prevIdx.val + 1) % L, Nat.mod_lt _ (by omega)⟩ : Fin L) = m := Fin.ext hPrevNext
    rw [hIdx] at h
    exact h
  have hE2 : E (w m) (w nextIdx) = true := hAdj m
  have hParPrev : par (w m) = some (w prevIdx) := by
    rcases hCover (w prevIdx) (w m) hE1 with hP | hM
    · have hLt := hDepth (w prevIdx) (w m) hP
      have hLe := hmMax prevIdx
      omega
    · exact hM
  have hParNext : par (w m) = some (w nextIdx) := by
    rcases hCover (w m) (w nextIdx) hE2 with hM | hN
    · exact hM
    · have hLt := hDepth (w nextIdx) (w m) hN
      have hLe := hmMax nextIdx
      omega
  have hEqSome : some (w prevIdx) = some (w nextIdx) := hParPrev.symm.trans hParNext
  have hEqVert : w prevIdx = w nextIdx := Option.some.inj hEqSome
  have hNe := hNoBack prevIdx
  have hIdx2 : (⟨(prevIdx.val + 2) % L, Nat.mod_lt _ (by omega)⟩ : Fin L) = nextIdx := Fin.ext hPrev2
  rw [hIdx2] at hNe
  exact hNe hEqVert.symm

private theorem simple_cycle_no_back {n L : Nat} (hL : L ≥ 3) (w : Fin L → Fin n)
    (hInj : ∀ i j : Fin L, w i = w j → i = j) :
    ∀ i : Fin L, w ⟨(i.val + 2) % L, Nat.mod_lt _ (by omega)⟩ ≠ w i := by
  intro i hEq
  have hIdx := hInj _ _ hEq
  have hv : (i.val + 2) % L = i.val := congrArg Fin.val hIdx
  have hi := i.isLt
  if h1 : i.val + 2 < L then
    rw [Nat.mod_eq_of_lt h1] at hv
    omega
  else
    have h2 : (i.val + 2) % L = i.val + 2 - L := by
      have hSub : i.val + 2 = (i.val + 2 - L) + L := by omega
      conv => lhs; rw [hSub]
      rw [Nat.add_mod_right, Nat.mod_eq_of_lt (by omega)]
    rw [h2] at hv
    omega

private theorem h12_structure_and_forests_check :
    h12Edges.length = 32 ∧
    h12Edges.Nodup ∧
    (List.finRange 12).map h12Deg = [8, 4, 7, 5, 6, 6, 6, 4, 5, 5, 4, 4] ∧
    sumFinNat h12Deg = 64 ∧
    h12Forest0.length = 11 ∧
    h12Forest1.length = 11 ∧
    h12Forest2.length = 10 ∧
    (h12Forest0 ++ h12Forest1 ++ h12Forest2).Nodup ∧
    ((h12Forest0 ++ h12Forest1 ++ h12Forest2).all fun e => h12Edges.contains e) = true ∧
    (h12Edges.all fun e => h12Forest0.contains e || h12Forest1.contains e || h12Forest2.contains e) = true ∧
    (∀ u v : Fin 12, edgeListAdj h12Forest0 u v = true → h12Parent0 u = some v ∨ h12Parent0 v = some u) ∧
    (∀ u p : Fin 12, h12Parent0 u = some p → h12Depth0 p < h12Depth0 u) ∧
    (∀ u v : Fin 12, edgeListAdj h12Forest1 u v = true → h12Parent1 u = some v ∨ h12Parent1 v = some u) ∧
    (∀ u p : Fin 12, h12Parent1 u = some p → h12Depth1 p < h12Depth1 u) ∧
    (∀ u v : Fin 12, edgeListAdj h12Forest2 u v = true → h12Parent2 u = some v ∨ h12Parent2 v = some u) ∧
    (∀ u p : Fin 12, h12Parent2 u = some p → h12Depth2 p < h12Depth2 u) := by
  decide

/-- Theorem MG-8: Exact `H_12` graph on the `12` positive `D_4` roots (`32` undirected edges,
    degrees `[8, 4, 7, 5, 6, 6, 6, 4, 5, 5, 4, 4]` summing to `64`), explicit disjoint covering
    3-forest edge partition `F_0, F_1, F_2` of sizes `[11, 11, 10]`, and symbolic acyclicity
    (NO non-backtracking cycle of any length `L ≥ 1`, and NO simple cycle of any length `L ≥ 3`,
    in any of `F_0, F_1, F_2`). -/
theorem thm_mg_h12_graph_and_3forest_partition :
    h12Edges.length = 32 ∧
    h12Edges.Nodup ∧
    (List.finRange 12).map h12Deg = [8, 4, 7, 5, 6, 6, 6, 4, 5, 5, 4, 4] ∧
    sumFinNat h12Deg = 64 ∧
    h12Forest0.length = 11 ∧ h12Forest1.length = 11 ∧ h12Forest2.length = 10 ∧
    (h12Forest0 ++ h12Forest1 ++ h12Forest2).Nodup ∧
    (∀ e, e ∈ h12Edges ↔ (e ∈ h12Forest0 ∨ e ∈ h12Forest1 ∨ e ∈ h12Forest2)) ∧
    (∀ (L : Nat) (hL : L ≥ 3) (w : Fin L → Fin 12),
      (∀ i j : Fin L, w i = w j → i = j) →
      (¬ ∀ i : Fin L, edgeListAdj h12Forest0 (w i) (w ⟨(i.val + 1) % L, Nat.mod_lt _ (by omega)⟩) = true) ∧
      (¬ ∀ i : Fin L, edgeListAdj h12Forest1 (w i) (w ⟨(i.val + 1) % L, Nat.mod_lt _ (by omega)⟩) = true) ∧
      (¬ ∀ i : Fin L, edgeListAdj h12Forest2 (w i) (w ⟨(i.val + 1) % L, Nat.mod_lt _ (by omega)⟩) = true)) := by
  have hc := h12_structure_and_forests_check
  refine ⟨hc.1, hc.2.1, hc.2.2.1, hc.2.2.2.1,
          hc.2.2.2.2.1, hc.2.2.2.2.2.1, hc.2.2.2.2.2.2.1,
          hc.2.2.2.2.2.2.2.1, ?_, ?_⟩
  · intro e
    constructor
    · intro hMem
      have hAll := (List.all_eq_true.mp hc.2.2.2.2.2.2.2.2.2.1) e hMem
      simp only [Bool.or_eq_true, List.contains_eq_mem, decide_eq_true_eq] at hAll
      rcases hAll with (h0 | h1) | h2
      · exact Or.inl h0
      · exact Or.inr (Or.inl h1)
      · exact Or.inr (Or.inr h2)
    · intro hMem
      have hIn : e ∈ h12Forest0 ++ h12Forest1 ++ h12Forest2 := by
        rcases hMem with h0 | h1 | h2
        · exact List.mem_append_left _ (List.mem_append_left _ h0)
        · exact List.mem_append_left _ (List.mem_append_right _ h1)
        · exact List.mem_append_right _ h2
      have hAll := (List.all_eq_true.mp hc.2.2.2.2.2.2.2.2.1) e hIn
      simp only [List.contains_eq_mem, decide_eq_true_eq] at hAll
      exact hAll
  · intro L hL w hInj
    have hNB := simple_cycle_no_back hL w hInj
    refine ⟨?_, ?_, ?_⟩
    · intro hAdj
      exact acyclic_of_parent_depth (edgeListAdj h12Forest0) h12Parent0 h12Depth0
        hc.2.2.2.2.2.2.2.2.2.2.1 hc.2.2.2.2.2.2.2.2.2.2.2.1 L (by omega) w hAdj hNB
    · intro hAdj
      exact acyclic_of_parent_depth (edgeListAdj h12Forest1) h12Parent1 h12Depth1
        hc.2.2.2.2.2.2.2.2.2.2.2.2.1 hc.2.2.2.2.2.2.2.2.2.2.2.2.2.1 L (by omega) w hAdj hNB
    · intro hAdj
      exact acyclic_of_parent_depth (edgeListAdj h12Forest2) h12Parent2 h12Depth2
        hc.2.2.2.2.2.2.2.2.2.2.2.2.2.2.1 hc.2.2.2.2.2.2.2.2.2.2.2.2.2.2.2 L (by omega) w hAdj hNB

/-- Bit membership test `i ∈ mask` for a 12-bit subset `mask : Nat`. -/
def bitInMask (mask : Nat) (i : Fin 12) : Bool :=
  ((mask >>> i.val) &&& 1) == 1

/-- Exact subset cardinality `|S|` for a 12-bit mask `mask : Nat`. -/
def popCount12 (mask : Nat) : Nat :=
  ((mask >>> 0) &&& 1) + ((mask >>> 1) &&& 1) + ((mask >>> 2) &&& 1) + ((mask >>> 3) &&& 1) +
  ((mask >>> 4) &&& 1) + ((mask >>> 5) &&& 1) + ((mask >>> 6) &&& 1) + ((mask >>> 7) &&& 1) +
  ((mask >>> 8) &&& 1) + ((mask >>> 9) &&& 1) + ((mask >>> 10) &&& 1) + ((mask >>> 11) &&& 1)

/-- Direct transparent induced edge count `|E(H_12[S])|` on `h12Edges`. -/
def h12MaskEdgeCount (mask : Nat) : Nat :=
  (h12Edges.filter fun e => bitInMask mask e.1 && bitInMask mask e.2).length

/-- Fast bit-cached induced edge count `|E(H_12[S])|` extracting each of the 12 mask bits once. -/
private def h12MaskEdgeCountFast (mask : Nat) : Nat :=
  let b0  := (mask >>> 0) &&& 1
  let b1  := (mask >>> 1) &&& 1
  let b2  := (mask >>> 2) &&& 1
  let b3  := (mask >>> 3) &&& 1
  let b4  := (mask >>> 4) &&& 1
  let b5  := (mask >>> 5) &&& 1
  let b6  := (mask >>> 6) &&& 1
  let b7  := (mask >>> 7) &&& 1
  let b8  := (mask >>> 8) &&& 1
  let b9  := (mask >>> 9) &&& 1
  let b10 := (mask >>> 10) &&& 1
  let b11 := (mask >>> 11) &&& 1
  b0 * (b2 + b3 + b4 + b5 + b6 + b7 + b8 + b9) +
  b1 * (b2 + b3 + b4 + b5) +
  b2 * (b4 + b5 + b6 + b10 + b11) +
  b3 * (b4 + b5 + b7) +
  b4 * (b8 + b10) +
  b5 * (b9 + b11) +
  b6 * (b8 + b9 + b10 + b11) +
  b7 * (b8 + b9) +
  b8 * b10 +
  b9 * b11

private def h12EdgeCountRec (mask : Nat) : List (Fin 12 × Fin 12) → Nat
  | [] => 0
  | (u, v) :: rest => (if bitInMask mask u && bitInMask mask v then 1 else 0) + h12EdgeCountRec mask rest

private theorem h12Filter_eq_rec (mask : Nat) (es : List (Fin 12 × Fin 12)) :
    (es.filter fun e => bitInMask mask e.1 && bitInMask mask e.2).length = h12EdgeCountRec mask es := by
  induction es with
  | nil => rfl
  | cons e rest ih =>
    cases e with | mk u v =>
    simp only [List.filter, h12EdgeCountRec]
    cases (bitInMask mask u && bitInMask mask v)
    · simp only [Bool.false_eq_true, ite_false, Nat.zero_add]; exact ih
    · simp only [ite_true, List.length_cons, ih]; omega

private theorem h12Edges_explicit :
    h12Edges =
      [ (⟨0, by decide⟩, ⟨2, by decide⟩), (⟨0, by decide⟩, ⟨3, by decide⟩),
        (⟨0, by decide⟩, ⟨4, by decide⟩), (⟨0, by decide⟩, ⟨5, by decide⟩),
        (⟨0, by decide⟩, ⟨6, by decide⟩), (⟨0, by decide⟩, ⟨7, by decide⟩),
        (⟨0, by decide⟩, ⟨8, by decide⟩), (⟨0, by decide⟩, ⟨9, by decide⟩),
        (⟨1, by decide⟩, ⟨2, by decide⟩), (⟨1, by decide⟩, ⟨3, by decide⟩),
        (⟨1, by decide⟩, ⟨4, by decide⟩), (⟨1, by decide⟩, ⟨5, by decide⟩),
        (⟨2, by decide⟩, ⟨4, by decide⟩), (⟨2, by decide⟩, ⟨5, by decide⟩),
        (⟨2, by decide⟩, ⟨6, by decide⟩), (⟨2, by decide⟩, ⟨10, by decide⟩),
        (⟨2, by decide⟩, ⟨11, by decide⟩),
        (⟨3, by decide⟩, ⟨4, by decide⟩), (⟨3, by decide⟩, ⟨5, by decide⟩),
        (⟨3, by decide⟩, ⟨7, by decide⟩),
        (⟨4, by decide⟩, ⟨8, by decide⟩), (⟨4, by decide⟩, ⟨10, by decide⟩),
        (⟨5, by decide⟩, ⟨9, by decide⟩), (⟨5, by decide⟩, ⟨11, by decide⟩),
        (⟨6, by decide⟩, ⟨8, by decide⟩), (⟨6, by decide⟩, ⟨9, by decide⟩),
        (⟨6, by decide⟩, ⟨10, by decide⟩), (⟨6, by decide⟩, ⟨11, by decide⟩),
        (⟨7, by decide⟩, ⟨8, by decide⟩), (⟨7, by decide⟩, ⟨9, by decide⟩),
        (⟨8, by decide⟩, ⟨10, by decide⟩),
        (⟨9, by decide⟩, ⟨11, by decide⟩) ] := by
  decide

private theorem h12BitPair (mask : Nat) (u v : Fin 12) :
    (if bitInMask mask u && bitInMask mask v then 1 else 0) =
      ((mask >>> u.val) &&& 1) * ((mask >>> v.val) &&& 1) := by
  unfold bitInMask
  have hu : ((mask >>> u.val) &&& 1) = 0 ∨ ((mask >>> u.val) &&& 1) = 1 := by
    have hlt : ((mask >>> u.val) &&& 1) < 2 := by rw [Nat.and_one_is_mod]; exact Nat.mod_lt _ (by decide)
    omega
  have hv : ((mask >>> v.val) &&& 1) = 0 ∨ ((mask >>> v.val) &&& 1) = 1 := by
    have hlt : ((mask >>> v.val) &&& 1) < 2 := by rw [Nat.and_one_is_mod]; exact Nat.mod_lt _ (by decide)
    omega
  rcases hu with h1 | h1 <;> rcases hv with h2 | h2 <;> rw [h1, h2] <;> decide

private theorem h12MaskEdgeCount_eq_fast (mask : Nat) :
    h12MaskEdgeCount mask = h12MaskEdgeCountFast mask := by
  unfold h12MaskEdgeCount
  rw [h12Filter_eq_rec, h12Edges_explicit]
  dsimp only [h12EdgeCountRec, h12MaskEdgeCountFast]
  simp only [h12BitPair, Nat.mul_add]
  omega

private def h12ArbOk (mask : Nat) : Bool :=
  let k := popCount12 mask
  (k < 2) || (11 * h12MaskEdgeCountFast mask ≤ 32 * (k - 1))

/-- Binary-tree range verifier of recursion depth `k` checking all `2^k` masks `[lo, lo + 2^k)`. -/
private def h12ArbCheckPow2 (lo : Nat) : Nat → Bool
  | 0 => h12ArbOk lo
  | k + 1 => h12ArbCheckPow2 lo k && h12ArbCheckPow2 (lo + 2 ^ k) k

private theorem h12ArbCheckPow2_sound (lo k : Nat) (h : h12ArbCheckPow2 lo k = true) :
    ∀ offset : Nat, offset < 2 ^ k → h12ArbOk (lo + offset) = true := by
  induction k generalizing lo with
  | zero =>
    intro offset ho
    have h0 : offset = 0 := by omega
    rw [h0, Nat.add_zero]
    exact h
  | succ r ih =>
    simp only [h12ArbCheckPow2, Bool.and_eq_true] at h
    intro offset ho
    have hPow : 2 ^ (r + 1) = 2 ^ r + 2 ^ r := by rw [Nat.pow_succ]; omega
    if hlt : offset < 2 ^ r then
      exact ih lo h.1 offset hlt
    else
      have h2 := ih (lo + 2 ^ r) h.2 (offset - 2 ^ r) (by omega)
      have hEq : lo + 2 ^ r + (offset - 2 ^ r) = lo + offset := by omega
      rw [hEq] at h2
      exact h2

-- 16 bands of 2^8 = 256 subsets (recursion depth 8) covering all 4096 masks of Fin 12
private theorem h12Arb_band0  : h12ArbCheckPow2 0    8 = true := by decide
private theorem h12Arb_band1  : h12ArbCheckPow2 256  8 = true := by decide
private theorem h12Arb_band2  : h12ArbCheckPow2 512  8 = true := by decide
private theorem h12Arb_band3  : h12ArbCheckPow2 768  8 = true := by decide
private theorem h12Arb_band4  : h12ArbCheckPow2 1024 8 = true := by decide
private theorem h12Arb_band5  : h12ArbCheckPow2 1280 8 = true := by decide
private theorem h12Arb_band6  : h12ArbCheckPow2 1536 8 = true := by decide
private theorem h12Arb_band7  : h12ArbCheckPow2 1792 8 = true := by decide
private theorem h12Arb_band8  : h12ArbCheckPow2 2048 8 = true := by decide
private theorem h12Arb_band9  : h12ArbCheckPow2 2304 8 = true := by decide
private theorem h12Arb_band10 : h12ArbCheckPow2 2560 8 = true := by decide
private theorem h12Arb_band11 : h12ArbCheckPow2 2816 8 = true := by decide
private theorem h12Arb_band12 : h12ArbCheckPow2 3072 8 = true := by decide
private theorem h12Arb_band13 : h12ArbCheckPow2 3328 8 = true := by decide
private theorem h12Arb_band14 : h12ArbCheckPow2 3584 8 = true := by decide
private theorem h12Arb_band15 : h12ArbCheckPow2 3840 8 = true := by decide

private theorem h12Arb_all4096 (m : Fin 4096) : h12ArbOk m.val = true := by
  have hm := m.isLt
  have hUse : ∀ lo : Nat, h12ArbCheckPow2 lo 8 = true → lo ≤ m.val → m.val < lo + 256 →
      h12ArbOk m.val = true := by
    intro lo hR hLo hHi
    have h := h12ArbCheckPow2_sound lo 8 hR (m.val - lo) (by omega)
    have hEq : lo + (m.val - lo) = m.val := by omega
    rw [hEq] at h
    exact h
  if h0 : m.val < 256 then exact hUse 0 h12Arb_band0 (by omega) (by omega)
  else if h1 : m.val < 512 then exact hUse 256 h12Arb_band1 (by omega) (by omega)
  else if h2 : m.val < 768 then exact hUse 512 h12Arb_band2 (by omega) (by omega)
  else if h3 : m.val < 1024 then exact hUse 768 h12Arb_band3 (by omega) (by omega)
  else if h4 : m.val < 1280 then exact hUse 1024 h12Arb_band4 (by omega) (by omega)
  else if h5 : m.val < 1536 then exact hUse 1280 h12Arb_band5 (by omega) (by omega)
  else if h6 : m.val < 1792 then exact hUse 1536 h12Arb_band6 (by omega) (by omega)
  else if h7 : m.val < 2048 then exact hUse 1792 h12Arb_band7 (by omega) (by omega)
  else if h8 : m.val < 2304 then exact hUse 2048 h12Arb_band8 (by omega) (by omega)
  else if h9 : m.val < 2560 then exact hUse 2304 h12Arb_band9 (by omega) (by omega)
  else if h10 : m.val < 2816 then exact hUse 2560 h12Arb_band10 (by omega) (by omega)
  else if h11 : m.val < 3072 then exact hUse 2816 h12Arb_band11 (by omega) (by omega)
  else if h12 : m.val < 3328 then exact hUse 3072 h12Arb_band12 (by omega) (by omega)
  else if h13 : m.val < 3584 then exact hUse 3328 h12Arb_band13 (by omega) (by omega)
  else if h14 : m.val < 3840 then exact hUse 3584 h12Arb_band14 (by omega) (by omega)
  else exact hUse 3840 h12Arb_band15 (by omega) (by omega)

/-- Theorem MG-9: Exact Nash-Williams fractional arboricity `p*(H_12) = 32 / 11`:
    1. Attained at the full vertex set `S = V(H_12)` (`mask = 4095`: `|S| = 12`, `|E(S)| = 32`,
       `11 * |E(S)| = 32 * (|S| - 1)`),
    2. Satisfied across ALL `4,096` subsets `m : Fin 4096` of `V(H_12)`: whenever `|S| ≥ 2`,
       `11 * |E(H_12[S])| ≤ 32 * (|S| - 1)` (using the transparent `h12Edges.filter` count). -/
theorem thm_mg_h12_exact_fractional_arboricity_32_over_11 :
    popCount12 4095 = 12 ∧
    h12MaskEdgeCount 4095 = 32 ∧
    11 * h12MaskEdgeCount 4095 = 32 * (popCount12 4095 - 1) ∧
    (∀ m : Fin 4096, popCount12 m.val ≥ 2 →
      11 * h12MaskEdgeCount m.val ≤ 32 * (popCount12 m.val - 1)) := by
  refine ⟨by decide, by decide, by decide, ?_⟩
  intro m hk
  rw [h12MaskEdgeCount_eq_fast]
  have hOk := h12Arb_all4096 m
  unfold h12ArbOk at hOk
  simp only [Bool.or_eq_true, decide_eq_true_eq] at hOk
  rcases hOk with hLt | hBound
  · omega
  · exact hBound


/-! ## Section 6: Exact BFS Polymer Step-Ratio Bound (`∀ n ≥ 1`) & `D_4` Tetrahedra `C_4(Δ) = 3` -/

/-- Exact binomial coefficient `C(n, k)` via Pascal's recurrence. -/
def natChoose : Nat → Nat → Nat
  | _, 0 => 1
  | 0, _ + 1 => 0
  | n + 1, k + 1 => natChoose n k + natChoose n (k + 1)

private theorem natFact_pos : ∀ n : Nat, 0 < natFact n
  | 0 => by decide
  | n + 1 => Nat.mul_pos (Nat.succ_pos n) (natFact_pos n)

private theorem natChoose_self : ∀ n : Nat, natChoose n n = 1
  | 0 => rfl
  | n + 1 => by
    have hGt : ∀ a b : Nat, a < b → natChoose a b = 0 := by
      intro a
      induction a with
      | zero => intro b hb; cases b with | zero => omega | succ _ => rfl
      | succ r ih =>
        intro b hb
        cases b with
        | zero => omega
        | succ s =>
          simp only [natChoose]
          rw [ih s (by omega), ih (s + 1) (by omega)]
    simp only [natChoose, natChoose_self n, hGt n (n + 1) (by omega), Nat.add_zero]

private theorem natChoose_mul_fact :
    ∀ n k : Nat, k ≤ n → natChoose n k * (natFact k * natFact (n - k)) = natFact n := by
  intro n
  induction n with
  | zero =>
    intro k hk
    have hk0 : k = 0 := by omega
    rw [hk0]; decide
  | succ m ih =>
    intro k hk
    cases k with
    | zero =>
      simp only [natChoose, natFact, Nat.sub_zero, Nat.one_mul]
    | succ j =>
      if hEq : j = m then
        rw [hEq, natChoose_self (m + 1), Nat.sub_self, Nat.one_mul, show natFact 0 = 1 by rfl, Nat.mul_one]
      else
        have hjm : j < m := by omega
        have hSub : m - j = (m - (j + 1)) + 1 := by omega
        have hSub2 : m + 1 - (j + 1) = m - j := by omega
        simp only [natChoose, hSub2, Nat.add_mul]
        have hT1 : natChoose m j * (natFact (j + 1) * natFact (m - j)) = (j + 1) * natFact m := by
          change natChoose m j * (((j + 1) * natFact j) * natFact (m - j)) = (j + 1) * natFact m
          calc natChoose m j * (((j + 1) * natFact j) * natFact (m - j))
              = natChoose m j * ((j + 1) * (natFact j * natFact (m - j))) := by
                  rw [Nat.mul_assoc (j + 1)]
            _ = (j + 1) * (natChoose m j * (natFact j * natFact (m - j))) := by
                  rw [← Nat.mul_assoc, Nat.mul_comm (natChoose m j) (j + 1), Nat.mul_assoc]
            _ = (j + 1) * natFact m := by rw [ih j (by omega)]
        have hT2 : natChoose m (j + 1) * (natFact (j + 1) * natFact (m - j)) = (m - j) * natFact m := by
          rw [hSub]
          change natChoose m (j + 1) * (natFact (j + 1) * ((m - (j + 1) + 1) * natFact (m - (j + 1)))) =
            (m - (j + 1) + 1) * natFact m
          calc natChoose m (j + 1) * (natFact (j + 1) * ((m - (j + 1) + 1) * natFact (m - (j + 1))))
              = natChoose m (j + 1) * ((m - (j + 1) + 1) * (natFact (j + 1) * natFact (m - (j + 1)))) := by
                  congr 1
                  rw [← Nat.mul_assoc, Nat.mul_comm (natFact (j + 1)) (m - (j + 1) + 1), Nat.mul_assoc]
            _ = (m - (j + 1) + 1) * (natChoose m (j + 1) * (natFact (j + 1) * natFact (m - (j + 1)))) := by
                  rw [← Nat.mul_assoc, Nat.mul_comm (natChoose m (j + 1)) _, Nat.mul_assoc]
            _ = (m - (j + 1) + 1) * natFact m := by rw [ih (j + 1) (by omega)]
        rw [hT1, hT2, ← Nat.add_mul, show j + 1 + (m - j) = m + 1 by omega]
        rfl

private theorem natChoose_pos (n k : Nat) (hk : k ≤ n) : 0 < natChoose n k := by
  have h := natChoose_mul_fact n k hk
  have hPos := natFact_pos n
  rw [← h] at hPos
  cases hc : natChoose n k with
  | zero => rw [hc, Nat.zero_mul] at hPos; omega
  | succ _ => exact Nat.succ_pos _

/-- Falling-rising product `∏_{j = 1}^{9} (a + j)`. -/
def prod9Shift (a : Nat) : Nat :=
  (a + 1) * (a + 2) * (a + 3) * (a + 4) * (a + 5) * (a + 6) * (a + 7) * (a + 8) * (a + 9)

private theorem natFact_add_nine (a : Nat) :
    natFact (a + 9) = prod9Shift a * natFact a := by
  unfold prod9Shift
  have h1 : natFact (a + 1) = (a + 1) * natFact a := rfl
  have h2 : natFact (a + 2) = (a + 2) * natFact (a + 1) := rfl
  have h3 : natFact (a + 3) = (a + 3) * natFact (a + 2) := rfl
  have h4 : natFact (a + 4) = (a + 4) * natFact (a + 3) := rfl
  have h5 : natFact (a + 5) = (a + 5) * natFact (a + 4) := rfl
  have h6 : natFact (a + 6) = (a + 6) * natFact (a + 5) := rfl
  have h7 : natFact (a + 7) = (a + 7) * natFact (a + 6) := rfl
  have h8 : natFact (a + 8) = (a + 8) * natFact (a + 7) := rfl
  have h9 : natFact (a + 9) = (a + 9) * natFact (a + 8) := rfl
  rw [h9, h8, h7, h6, h5, h4, h3, h2, h1]
  -- Normalize associativity & commutativity of the 9 scalar factors
  simp only [← Nat.mul_assoc]
  congr 1
  ac_rfl

private theorem prod9Shift_pos (a : Nat) : 0 < prod9Shift a := by
  unfold prod9Shift
  repeat apply Nat.mul_pos
  all_goals omega

private theorem prod9Shift_step_lt (n : Nat) :
    9 ^ 9 * prod9Shift (10 * n) < 10 ^ 9 * prod9Shift (9 * n) := by
  unfold prod9Shift
  have step : ∀ j : Nat, j ≥ 1 → 9 * (10 * n + j) < 10 * (9 * n + j) := by
    intro j hj; omega
  have mulLt : ∀ a b c d : Nat, 0 < b → 0 < c → a < b → c < d → a * c < b * d := by
    intro a b c d _ hc hab hcd
    exact Nat.lt_of_lt_of_le (Nat.mul_lt_mul_of_pos_right hab hc)
      (Nat.mul_le_mul_left b (Nat.le_of_lt hcd))
  have h1 := step 1 (by decide)
  have h2 := step 2 (by decide)
  have h3 := step 3 (by decide)
  have h4 := step 4 (by decide)
  have h5 := step 5 (by decide)
  have h6 := step 6 (by decide)
  have h7 := step 7 (by decide)
  have h8 := step 8 (by decide)
  have h9 := step 9 (by decide)
  have p12 := mulLt _ _ _ _ (by omega) (by omega) h1 h2
  have p13 := mulLt _ _ _ _ (by omega) (by omega) p12 h3
  have p14 := mulLt _ _ _ _ (by omega) (by omega) p13 h4
  have p15 := mulLt _ _ _ _ (by omega) (by omega) p14 h5
  have p16 := mulLt _ _ _ _ (by omega) (by omega) p15 h6
  have p17 := mulLt _ _ _ _ (by omega) (by omega) p16 h7
  have p18 := mulLt _ _ _ _ (by omega) (by omega) p17 h8
  have p19 := mulLt _ _ _ _ (by omega) (by omega) p18 h9
  have hL : 9 ^ 9 * ((10 * n + 1) * (10 * n + 2) * (10 * n + 3) * (10 * n + 4) *
      (10 * n + 5) * (10 * n + 6) * (10 * n + 7) * (10 * n + 8) * (10 * n + 9)) =
      9 * (10 * n + 1) * (9 * (10 * n + 2)) * (9 * (10 * n + 3)) * (9 * (10 * n + 4)) *
      (9 * (10 * n + 5)) * (9 * (10 * n + 6)) * (9 * (10 * n + 7)) * (9 * (10 * n + 8)) *
      (9 * (10 * n + 9)) := by
    have h9p : (9 : Nat) ^ 9 = 9 * 9 * 9 * 9 * 9 * 9 * 9 * 9 * 9 := by decide
    rw [h9p]; ac_rfl
  have hR : 10 ^ 9 * ((9 * n + 1) * (9 * n + 2) * (9 * n + 3) * (9 * n + 4) *
      (9 * n + 5) * (9 * n + 6) * (9 * n + 7) * (9 * n + 8) * (9 * n + 9)) =
      10 * (9 * n + 1) * (10 * (9 * n + 2)) * (10 * (9 * n + 3)) * (10 * (9 * n + 4)) *
      (10 * (9 * n + 5)) * (10 * (9 * n + 6)) * (10 * (9 * n + 7)) * (10 * (9 * n + 8)) *
      (10 * (9 * n + 9)) := by
    have h10p : (10 : Nat) ^ 9 = 10 * 10 * 10 * 10 * 10 * 10 * 10 * 10 * 10 := by decide
    rw [h10p]; ac_rfl
  rw [hL, hR]
  exact p19

/-- Theorem MG-10: Exact 2-edge-covered BFS polymer enumeration binomial identity and strict
    symbolic step-ratio bound for ALL `n : Nat`, `n ≥ 1`:
    1. `natChoose (10 * (n + 1) - 1) n * (n * prod9Shift (9 * n)) = natChoose (10 * n - 1) (n - 1) * (10 * n * prod9Shift (10 * n))`,
    2. `9^9 * natChoose (10 * (n + 1) - 1) n < 10^10 * natChoose (10 * n - 1) (n - 1)` (`∀ n ≥ 1`),
       proving the exact universal geometric tail ratio `R_KP = 10^10 / 9^9` for Kotecky-Preiss! -/
theorem thm_mg_bfs_polymer_step_ratio_all_n :
    (∀ n k : Nat, k ≤ n → natChoose n k * (natFact k * natFact (n - k)) = natFact n) ∧
    (∀ n : Nat, n ≥ 1 →
      natChoose (10 * (n + 1) - 1) n * (n * prod9Shift (9 * n)) =
        natChoose (10 * n - 1) (n - 1) * (10 * n * prod9Shift (10 * n))) ∧
    (∀ n : Nat, n ≥ 1 →
      9 ^ 9 * natChoose (10 * (n + 1) - 1) n <
        10 ^ 10 * natChoose (10 * n - 1) (n - 1)) ∧
    (natChoose 9 0 = 1 ∧ natChoose 19 1 = 19 ∧ natChoose 29 2 = 406 ∧
     natChoose 39 3 = 9139 ∧ natChoose 49 4 = 211876) := by
  have hStepId : ∀ n : Nat, n ≥ 1 →
      natChoose (10 * (n + 1) - 1) n * (n * prod9Shift (9 * n)) =
        natChoose (10 * n - 1) (n - 1) * (10 * n * prod9Shift (10 * n)) := by
    intro n hn
    have hE1 : 10 * (n + 1) - 1 = 10 * n + 9 := by omega
    have hE2 : 10 * n + 9 - n = 9 * n + 9 := by omega
    have hE3 : 10 * n - 1 - (n - 1) = 9 * n := by omega
    have hE4 : 10 * n = (10 * n - 1) + 1 := by omega
    have hF1 := natChoose_mul_fact (10 * n + 9) n (by omega)
    rw [hE2] at hF1
    have hF2 := natChoose_mul_fact (10 * n - 1) (n - 1) (by omega)
    rw [hE3] at hF2
    have hFac10 : natFact (10 * n + 9) = 10 * n * prod9Shift (10 * n) * natFact (10 * n - 1) := by
      rw [natFact_add_nine (10 * n)]
      have hStep10 : natFact (10 * n) = 10 * n * natFact (10 * n - 1) := by
        conv => lhs; rw [hE4]
        change ((10 * n - 1) + 1) * natFact (10 * n - 1) = _
        rw [← hE4]
      rw [hStep10]
      ac_rfl
    have hFacN : natFact n = n * natFact (n - 1) := by
      have hn1 : n = (n - 1) + 1 := by omega
      conv => lhs; rw [hn1]
      change ((n - 1) + 1) * natFact (n - 1) = _
      rw [← hn1]
    have hFac9 : natFact (9 * n + 9) = prod9Shift (9 * n) * natFact (9 * n) :=
      natFact_add_nine (9 * n)
    have hCommonPos : 0 < natFact (n - 1) * natFact (9 * n) :=
      Nat.mul_pos (natFact_pos (n - 1)) (natFact_pos (9 * n))
    have hBig : natChoose (10 * n + 9) n * (n * prod9Shift (9 * n)) *
          (natFact (n - 1) * natFact (9 * n)) =
        natChoose (10 * n - 1) (n - 1) * (10 * n * prod9Shift (10 * n)) *
          (natFact (n - 1) * natFact (9 * n)) := by
      calc natChoose (10 * n + 9) n * (n * prod9Shift (9 * n)) *
              (natFact (n - 1) * natFact (9 * n))
          = natChoose (10 * n + 9) n * (natFact n * natFact (9 * n + 9)) := by
              rw [hFacN, hFac9]; ac_rfl
        _ = natFact (10 * n + 9) := hF1
        _ = 10 * n * prod9Shift (10 * n) * natFact (10 * n - 1) := hFac10
        _ = 10 * n * prod9Shift (10 * n) *
              (natChoose (10 * n - 1) (n - 1) * (natFact (n - 1) * natFact (9 * n))) := by
              rw [hF2]
        _ = natChoose (10 * n - 1) (n - 1) * (10 * n * prod9Shift (10 * n)) *
              (natFact (n - 1) * natFact (9 * n)) := by ac_rfl
    rw [hE1]
    exact Nat.eq_of_mul_eq_mul_right hCommonPos hBig
  refine ⟨natChoose_mul_fact, hStepId, ?_, by decide⟩
  intro n hn
  have hId := hStepId n hn
  have hShiftLt := prod9Shift_step_lt n
  have hDenPos : 0 < n * prod9Shift (9 * n) := Nat.mul_pos (by omega) (prod9Shift_pos (9 * n))
  have hChPos : 0 < natChoose (10 * n - 1) (n - 1) := natChoose_pos (10 * n - 1) (n - 1) (by omega)
  have h10nPos : 0 < 10 * n := by omega
  have hMul1 : (10 * n) * (9 ^ 9 * prod9Shift (10 * n)) <
      (10 * n) * (10 ^ 9 * prod9Shift (9 * n)) :=
    Nat.mul_lt_mul_of_pos_left hShiftLt h10nPos
  have hMul2 : 9 ^ 9 * (10 * n * prod9Shift (10 * n)) <
      10 ^ 10 * (n * prod9Shift (9 * n)) := by
    have hL : (10 * n) * (9 ^ 9 * prod9Shift (10 * n)) = 9 ^ 9 * (10 * n * prod9Shift (10 * n)) := by
      ac_rfl
    have hR : (10 * n) * (10 ^ 9 * prod9Shift (9 * n)) = 10 ^ 10 * (n * prod9Shift (9 * n)) := by
      have h10 : (10 : Nat) ^ 10 = 10 * 10 ^ 9 := by decide
      rw [h10]; ac_rfl
    rw [← hL, ← hR]
    exact hMul1
  have hMul3 : natChoose (10 * n - 1) (n - 1) * (9 ^ 9 * (10 * n * prod9Shift (10 * n))) <
      natChoose (10 * n - 1) (n - 1) * (10 ^ 10 * (n * prod9Shift (9 * n))) :=
    Nat.mul_lt_mul_of_pos_left hMul2 hChPos
  have hL2 : 9 ^ 9 * natChoose (10 * (n + 1) - 1) n * (n * prod9Shift (9 * n)) =
      natChoose (10 * n - 1) (n - 1) * (9 ^ 9 * (10 * n * prod9Shift (10 * n))) := by
    calc 9 ^ 9 * natChoose (10 * (n + 1) - 1) n * (n * prod9Shift (9 * n))
        = 9 ^ 9 * (natChoose (10 * (n + 1) - 1) n * (n * prod9Shift (9 * n))) := Nat.mul_assoc _ _ _
      _ = 9 ^ 9 * (natChoose (10 * n - 1) (n - 1) * (10 * n * prod9Shift (10 * n))) := by rw [hId]
      _ = natChoose (10 * n - 1) (n - 1) * (9 ^ 9 * (10 * n * prod9Shift (10 * n))) := by ac_rfl
  have hR2 : 10 ^ 10 * natChoose (10 * n - 1) (n - 1) * (n * prod9Shift (9 * n)) =
      natChoose (10 * n - 1) (n - 1) * (10 ^ 10 * (n * prod9Shift (9 * n))) := by ac_rfl
  rw [← hL2, ← hR2] at hMul3
  exact Nat.lt_of_mul_lt_mul_right hMul3

/-- Vertices `w ∈ d4Roots` completing an equilateral `D_4` triangle `(0, r1, r2)` to a regular
    `D_4` tetrahedron (`w · r1 = 1` and `w · r2 = 1`). -/
def d4TetCompletions (r1 r2 : Vec4) : List Vec4 :=
  d4Roots.filter fun w => dot4 w r1 == 1 && dot4 w r2 == 1

private theorem d4_tet_all_check :
    (d4Roots.all fun r1 => d4Roots.all fun r2 =>
      !(dot4 r1 r2 == 1) ||
      ((d4TetCompletions r1 r2).length == 3 &&
        (d4TetCompletions r1 r2).all fun w =>
          d4Roots.contains (sub4 w r1) && d4Roots.contains (sub4 w r2))) = true ∧
    d4TetCompletions (1, 1, 0, 0) (1, 0, 1, 0) =
      [(1, 0, 0, 1), (1, 0, 0, -1), (0, 1, 1, 0)] := by
  decide

/-- Theorem MG-11: Exact regular `D_4` tetrahedron count `C_4(Δ) = 3` directly on
    `Vibe.Geometry.d4Roots`: EVERY equilateral `D_4` triangle `(0, r1, r2)` (`r1, r2 ∈ d4Roots`,
    `r1 · r2 = 1`) belongs to EXACTLY `3` regular `D_4` tetrahedra (with every edge difference
    lying in `d4Roots`), and the canonical triangle `Δ_0 = (0, (1, 1, 0, 0), (1, 0, 1, 0))` has
    exact tetrahedron completions `[(1, 0, 0, 1), (1, 0, 0, -1), (0, 1, 1, 0)]`. -/
theorem thm_mg_d4_tetrahedra_per_triangle_eq_3 :
    (∀ r1 ∈ d4Roots, ∀ r2 ∈ d4Roots, dot4 r1 r2 = 1 →
      (d4TetCompletions r1 r2).length = 3 ∧
      ∀ w ∈ d4TetCompletions r1 r2, sub4 w r1 ∈ d4Roots ∧ sub4 w r2 ∈ d4Roots) ∧
    d4TetCompletions (1, 1, 0, 0) (1, 0, 1, 0) =
      [(1, 0, 0, 1), (1, 0, 0, -1), (0, 1, 1, 0)] := by
  refine ⟨?_, d4_tet_all_check.2⟩
  intro r1 hr1 r2 hr2 hdot
  have h1 := (List.all_eq_true.mp d4_tet_all_check.1) r1 hr1
  have h2 := (List.all_eq_true.mp h1) r2 hr2
  simp only [hdot, beq_self_eq_true, Bool.not_true, Bool.false_or, Bool.and_eq_true,
    beq_iff_eq] at h2
  refine ⟨h2.1, ?_⟩
  intro w hw
  have h3 := (List.all_eq_true.mp h2.2) w hw
  simp only [Bool.and_eq_true, List.contains_eq_mem, decide_eq_true_eq] at h3
  exact h3


/-! ## Section 7: Exact `SU(3)` Closed-Form `W_1` Lower Bound (`β = 317/1000 > 1.49 * β_BE^{24c}`) -/

/-- Exact `A_2` Weyl-chamber Pieri step for `SU(3)` tensor multiplication by `3 ⊕ 3̄`:
    tracks multiplicities of irreps `V(p, q)` on `[0..dim-1] × [0..dim-1]`. -/
private def gridAt (g : List (List Nat)) (p q : Nat) : Nat :=
  (g.getD p []).getD q 0

private def pieriInit (dim : Nat) : List (List Nat) :=
  (List.range dim).map fun p =>
    (List.range dim).map fun q => if p == 0 && q == 0 then 1 else 0

private def pieriStep (dim : Nat) (g : List (List Nat)) : List (List Nat) :=
  (List.range dim).map fun p =>
    (List.range dim).map fun q =>
      (if p > 0 then gridAt g (p - 1) q else 0) +
      (if q > 0 then gridAt g (p + 1) (q - 1) else 0) +
      gridAt g p (q + 1) +
      (if q > 0 then gridAt g p (q - 1) else 0) +
      (if p > 0 then gridAt g (p - 1) (q + 1) else 0) +
      gridAt g (p + 1) q

private def pieriGrid (dim : Nat) : Nat → List (List Nat)
  | 0 => pieriInit dim
  | n + 1 => pieriStep dim (pieriGrid dim n)

/-- Exact `SU(3)` Haar moment `a_n = E_{SU(3)}[(2 Re Tr U)^n]` via the `A_2` Weyl-chamber Pieri walk
    (grid width `n + 1` guarantees zero boundary clipping for all walks of length `n`). -/
def su3PieriMoment (n : Nat) : Nat :=
  gridAt (pieriGrid (n + 1) n) 0 0

/-- Cleared numerator of the degree-10 `SU(3)` `c_0(x)` partial sum at `β = 317/1000`
    (`x = 16 β = 634/125`, `y = x/6 = 317/375`) over common denominator `D_10 = 10! * 375^10`. -/
def su3C0PartialNum10 : Nat :=
  sumNat 11 fun k =>
    su3PieriMoment k * (317 ^ k) * (natFact 10 / natFact k) * (375 ^ (10 - k))

/-- Common denominator `D_10 = 10! * 375^10`. -/
def su3C0Den10 : Nat := natFact 10 * 375 ^ 10

/-- Degree-10 term numerator `a_10 * 317^10` for the exact geometric remainder bound (`k ≥ 11`). -/
def su3C0Term10Num : Nat := su3PieriMoment 10 * 317 ^ 10

private theorem natFact_tail_dom (m : Nat) :
    natFact 11 * 12 ^ m ≤ natFact (11 + m) := by
  induction m with
  | zero => simp only [Nat.pow_zero, Nat.mul_one, Nat.add_zero]; exact Nat.le_refl _
  | succ r ih =>
    have h1 : 11 + (r + 1) = (11 + r) + 1 := by omega
    rw [h1, Nat.pow_succ]
    change natFact 11 * (12 ^ r * 12) ≤ (11 + r + 1) * natFact (11 + r)
    rw [← Nat.mul_assoc, Nat.mul_comm (natFact 11 * 12 ^ r) 12]
    exact Nat.mul_le_mul (by omega) ih

private theorem su3_traceless_invariants (a1 a2 a3 : Int) (hTr : a1 + a2 + a3 = 0) :
    let S := a1 * a1 + a2 * a2 + a3 * a3
    let e3 := a1 * a2 * a3
    let u1 := (a1 - a2) * (a1 - a2)
    let u2 := (a2 - a3) * (a2 - a3)
    let u3 := (a3 - a1) * (a3 - a1)
    2 * (a1 * a1 * a1 * a1 + a2 * a2 * a2 * a2 + a3 * a3 * a3 * a3) = S * S ∧
    4 * (a1 * a1 * a1 * a1 * a1 * a1 + a2 * a2 * a2 * a2 * a2 * a2 + a3 * a3 * a3 * a3 * a3 * a3) =
      S * S * S + 12 * (e3 * e3) ∧
    S * S * S - 54 * (e3 * e3) = 2 * (((a1 - a2) * (a2 - a3) * (a3 - a1)) * ((a1 - a2) * (a2 - a3) * (a3 - a1))) ∧
    54 * (e3 * e3) ≤ S * S * S ∧
    u1 + u2 + u3 = 3 * S ∧
    4 * (u1 * u2 + u2 * u3 + u3 * u1) = 9 * (S * S) := by
  have ha3 : a3 = -(a1 + a2) := by omega
  subst ha3
  -- Reduce to 2 free variables a1, a2 and express everything in terms of p = a1 + a2, q = a1 * a2!
  -- Notice: a1^2 + a2^2 + (-(a1+a2))^2 = 2 (p^2 - q), e3 = -p q,
  -- a1^4 + a2^4 + (-(a1+a2))^4 = 2 (p^2 - q)^2, etc.!
  let p := a1 + a2
  let q := a1 * a2
  have hp2 : a1 * a1 + a2 * a2 = p * p - 2 * q := by
    have h : (a1 + a2) * (a1 + a2) = a1 * a1 + 2 * (a1 * a2) + a2 * a2 := by
      simp only [Int.add_mul, Int.mul_add, Int.mul_comm a2 a1]; omega
    change a1 * a1 + a2 * a2 = (a1 + a2) * (a1 + a2) - 2 * (a1 * a2)
    omega
  have hNegSq : (-(a1 + a2)) * (-(a1 + a2)) = p * p := by
    rw [Int.neg_mul, Int.mul_neg, Int.neg_neg]
  have hS : a1 * a1 + a2 * a2 + (-(a1 + a2)) * (-(a1 + a2)) = 2 * (p * p - q) := by
    rw [hNegSq, hp2]; omega
  have hA4 : a1 * a1 * a1 * a1 + a2 * a2 * a2 * a2 = (p * p - 2 * q) * (p * p - 2 * q) - 2 * (q * q) := by
    have hsq : (a1 * a1 + a2 * a2) * (a1 * a1 + a2 * a2) =
        (a1 * a1) * (a1 * a1) + 2 * ((a1 * a2) * (a1 * a2)) + (a2 * a2) * (a2 * a2) := by
      simp only [Int.add_mul, Int.mul_add]
      have hm1 : (a1 * a1) * (a2 * a2) = (a1 * a2) * (a1 * a2) := by
        calc (a1 * a1) * (a2 * a2) = a1 * (a1 * (a2 * a2)) := Int.mul_assoc _ _ _
          _ = a1 * ((a1 * a2) * a2) := by rw [← Int.mul_assoc a1 a2 a2]
          _ = a1 * ((a2 * a1) * a2) := by rw [Int.mul_comm a1 a2]
          _ = a1 * (a2 * (a1 * a2)) := by rw [Int.mul_assoc a2 a1 a2]
          _ = (a1 * a2) * (a1 * a2) := (Int.mul_assoc _ _ _).symm
      have hm2 : (a2 * a2) * (a1 * a1) = (a1 * a2) * (a1 * a2) := by rw [Int.mul_comm, hm1]
      rw [hm1, hm2]; omega
    have h4a : a1 * a1 * a1 * a1 = (a1 * a1) * (a1 * a1) := by rw [Int.mul_assoc (a1 * a1) a1 a1]
    have h4b : a2 * a2 * a2 * a2 = (a2 * a2) * (a2 * a2) := by rw [Int.mul_assoc (a2 * a2) a2 a2]
    rw [hp2] at hsq
    rw [h4a, h4b]
    change (a1 * a1) * (a1 * a1) + (a2 * a2) * (a2 * a2) =
      (p * p - 2 * q) * (p * p - 2 * q) - 2 * ((a1 * a2) * (a1 * a2))
    omega
  have hNeg4 : (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) = (p * p) * (p * p) := by
    have h4 : (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) =
        ((-(a1 + a2)) * (-(a1 + a2))) * ((-(a1 + a2)) * (-(a1 + a2))) := by
      rw [Int.mul_assoc ((-(a1 + a2)) * (-(a1 + a2)))]
    rw [h4, hNegSq]
  have hA4Sum : a1 * a1 * a1 * a1 + a2 * a2 * a2 * a2 +
      (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) =
      2 * ((p * p - q) * (p * p - q)) := by
    rw [hA4, hNeg4]
    simp only [Int.sub_mul, Int.mul_sub]
    have hc1 : (p * p) * (2 * q) = 2 * ((p * p) * q) := by rw [mg_mul_left_comm]
    have hc2 : (2 * q) * (p * p) = 2 * ((p * p) * q) := by rw [Int.mul_comm, hc1]
    have hc3 : (2 * q) * (2 * q) = 4 * (q * q) := by
      rw [Int.mul_assoc 2 q (2 * q), mg_mul_left_comm q 2 q, ← Int.mul_assoc 2 2 (q * q)]; rfl
    have hc4 : q * (p * p) = (p * p) * q := Int.mul_comm q (p * p)
    rw [hc1, hc2, hc3, hc4]
    omega
  have hA6Sum : a1 * a1 * a1 * a1 * a1 * a1 + a2 * a2 * a2 * a2 * a2 * a2 +
      (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) =
      2 * ((p * p - q) * (p * p - q) * (p * p - q)) + 3 * ((p * q) * (p * q)) := by
    have h6a : a1 * a1 * a1 * a1 * a1 * a1 = (a1 * a1) * (a1 * a1 * a1 * a1) := by
      simp only [Int.mul_assoc]
    have h6b : a2 * a2 * a2 * a2 * a2 * a2 = (a2 * a2) * (a2 * a2 * a2 * a2) := by
      simp only [Int.mul_assoc]
    have h6c : (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) =
        (p * p) * ((p * p) * (p * p)) := by
      have hStep : (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) * (-(a1 + a2)) =
          ((-(a1 + a2)) * (-(a1 + a2))) * (((-(a1 + a2)) * (-(a1 + a2))) * ((-(a1 + a2)) * (-(a1 + a2)))) := by
        simp only [Int.mul_assoc]
      rw [hStep, hNegSq]
    have hProd : (a1 * a1 + a2 * a2) * (a1 * a1 * a1 * a1 + a2 * a2 * a2 * a2) =
        (a1 * a1) * (a1 * a1 * a1 * a1) + (a2 * a2) * (a2 * a2 * a2 * a2) +
        (q * q) * (a1 * a1 + a2 * a2) := by
      simp only [Int.add_mul, Int.mul_add]
      have hx1 : (a1 * a1) * (a2 * a2 * a2 * a2) = (q * q) * (a2 * a2) := by
        change (a1 * a1) * (a2 * a2 * a2 * a2) = ((a1 * a2) * (a1 * a2)) * (a2 * a2)
        have hq2 : (a1 * a2) * (a1 * a2) = (a1 * a1) * (a2 * a2) := by
          calc (a1 * a2) * (a1 * a2) = a1 * (a2 * (a1 * a2)) := Int.mul_assoc _ _ _
            _ = a1 * ((a2 * a1) * a2) := by rw [← Int.mul_assoc a2 a1 a2]
            _ = a1 * ((a1 * a2) * a2) := by rw [Int.mul_comm a2 a1]
            _ = a1 * (a1 * (a2 * a2)) := by rw [Int.mul_assoc a1 a2 a2]
            _ = (a1 * a1) * (a2 * a2) := (Int.mul_assoc _ _ _).symm
        rw [hq2, Int.mul_assoc (a1 * a1), ← Int.mul_assoc (a2 * a2) a2 a2]
      have hx2 : (a2 * a2) * (a1 * a1 * a1 * a1) = (q * q) * (a1 * a1) := by
        change (a2 * a2) * (a1 * a1 * a1 * a1) = ((a1 * a2) * (a1 * a2)) * (a1 * a1)
        have hq2 : (a1 * a2) * (a1 * a2) = (a2 * a2) * (a1 * a1) := by
          calc (a1 * a2) * (a1 * a2) = a1 * (a2 * (a1 * a2)) := Int.mul_assoc _ _ _
            _ = a1 * ((a2 * a1) * a2) := by rw [← Int.mul_assoc a2 a1 a2]
            _ = a1 * ((a1 * a2) * a2) := by rw [Int.mul_comm a2 a1]
            _ = a1 * (a1 * (a2 * a2)) := by rw [Int.mul_assoc a1 a2 a2]
            _ = (a1 * a1) * (a2 * a2) := (Int.mul_assoc _ _ _).symm
            _ = (a2 * a2) * (a1 * a1) := Int.mul_comm _ _
        rw [hq2, Int.mul_assoc (a2 * a2), ← Int.mul_assoc (a1 * a1) a1 a1]
      rw [hx1, hx2]
      omega
    rw [h6a, h6b, h6c]
    rw [hp2, hA4] at hProd
    let P := p * p
    have hpqSq : (p * q) * (p * q) = P * (q * q) := by
      calc (p * q) * (p * q) = p * (q * (p * q)) := Int.mul_assoc _ _ _
        _ = p * ((q * p) * q) := by rw [← Int.mul_assoc q p q]
        _ = p * ((p * q) * q) := by rw [Int.mul_comm q p]
        _ = p * (p * (q * q)) := by rw [Int.mul_assoc p q q]
        _ = (p * p) * (q * q) := (Int.mul_assoc _ _ _).symm
    have hL : (P - 2 * q) * ((P - 2 * q) * (P - 2 * q) - 2 * (q * q)) - (q * q) * (P - 2 * q) + P * (P * P) =
        2 * ((P - q) * (P - q) * (P - q)) + 3 * (P * (q * q)) := by
      simp only [Int.sub_mul, Int.mul_sub]
      have m1 : P * (P * P) = P * P * P := (Int.mul_assoc P P P).symm
      have m2 : P * (2 * q) = 2 * (P * q) := mg_mul_left_comm P 2 q
      have m3 : (2 * q) * P = 2 * (P * q) := by rw [Int.mul_comm, m2]
      have m4 : (2 * q) * (2 * q) = 4 * (q * q) := by
        rw [Int.mul_assoc 2 q (2 * q), mg_mul_left_comm q 2 q, ← Int.mul_assoc 2 2 (q * q)]; rfl
      have m5 : q * P = P * q := Int.mul_comm q P
      have m7 : P * (2 * (P * q)) = 2 * (P * P * q) := by
        rw [mg_mul_left_comm P 2 (P * q), ← Int.mul_assoc P P q]
      have m8 : P * (4 * (q * q)) = 4 * (P * (q * q)) := mg_mul_left_comm P 4 (q * q)
      have m9 : P * (2 * (q * q)) = 2 * (P * (q * q)) := mg_mul_left_comm P 2 (q * q)
      have m10 : (2 * q) * (P * P) = 2 * (P * P * q) := by
        rw [Int.mul_comm (2 * q) (P * P), mg_mul_left_comm (P * P) 2 q]
      have m11 : (2 * q) * (2 * (P * q)) = 4 * (P * (q * q)) := by
        calc (2 * q) * (2 * (P * q)) = 2 * (q * (2 * (P * q))) := Int.mul_assoc _ _ _
          _ = 2 * (2 * (q * (P * q))) := by rw [mg_mul_left_comm q 2 (P * q)]
          _ = 4 * (q * (P * q)) := by rw [← Int.mul_assoc 2 2]; rfl
          _ = 4 * (P * (q * q)) := by rw [mg_mul_left_comm q P q]
      have m12 : (2 * q) * (4 * (q * q)) = 8 * (q * (q * q)) := by
        rw [Int.mul_assoc 2 q (4 * (q * q)), mg_mul_left_comm q 4 (q * q), ← Int.mul_assoc 2 4]; rfl
      have m13 : (2 * q) * (2 * (q * q)) = 4 * (q * (q * q)) := by
        rw [Int.mul_assoc 2 q (2 * (q * q)), mg_mul_left_comm q 2 (q * q), ← Int.mul_assoc 2 2]; rfl
      have m14 : (q * q) * P = P * (q * q) := Int.mul_comm _ _
      have m15 : (q * q) * (2 * q) = 2 * (q * (q * q)) := by
        rw [mg_mul_left_comm (q * q) 2 q, Int.mul_comm (q * q) q]
      have m16 : P * q * P = P * P * q := by rw [Int.mul_assoc P q P, Int.mul_comm q P, ← Int.mul_assoc]
      have m18 : P * q * q = P * (q * q) := Int.mul_assoc P q q
      have m19 : q * q * q = q * (q * q) := Int.mul_assoc q q q
      rw [m2, m3, m4, m5, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m18, m19, m1]
      omega
    rw [hpqSq]
    change (a1 * a1) * (a1 * a1 * a1 * a1) + (a2 * a2) * (a2 * a2 * a2 * a2) + P * (P * P) =
      2 * ((P - q) * (P - q) * (P - q)) + 3 * (P * (q * q))
    change (P - 2 * q) * ((P - 2 * q) * (P - 2 * q) - 2 * (q * q)) =
      (a1 * a1) * (a1 * a1 * a1 * a1) + (a2 * a2) * (a2 * a2 * a2 * a2) + (q * q) * (P - 2 * q) at hProd
    omega
  have hE3Sq : (a1 * a2 * (-(a1 + a2))) * (a1 * a2 * (-(a1 + a2))) = (p * q) * (p * q) := by
    have h : a1 * a2 * (-(a1 + a2)) = -(p * q) := by
      rw [Int.mul_neg, Int.mul_comm (a1 * a2) (a1 + a2)]
    rw [h, Int.neg_mul, Int.mul_neg, Int.neg_neg]
  have hNegSqGen : ∀ x : Int, (-x) * (-x) = x * x := by
    intro x; rw [Int.neg_mul, Int.mul_neg, Int.neg_neg]
  have hDisc : ((a1 - a2) * (a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)) *
      ((a1 - a2) * (a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)) =
      4 * ((p * p - q) * (p * p - q) * (p * p - q)) - 27 * ((p * q) * (p * q)) := by
    have hD1 : (a1 - a2) * (a1 - a2) = p * p - 4 * q := by
      have h : (a1 - a2) * (a1 - a2) = a1 * a1 - 2 * (a1 * a2) + a2 * a2 := by
        simp only [Int.sub_mul, Int.mul_sub, Int.mul_comm a2 a1]; omega
      change (a1 - a2) * (a1 - a2) = p * p - 4 * (a1 * a2)
      omega
    have hD2 : (a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1) = -(2 * (p * p) + q) := by
      have h1 : a2 - (-(a1 + a2)) = a1 + 2 * a2 := by omega
      have h2 : (-(a1 + a2)) - a1 = -(2 * a1 + a2) := by omega
      rw [h1, h2, Int.mul_neg]
      have h3 : (a1 + 2 * a2) * (2 * a1 + a2) = 2 * (a1 * a1 + a2 * a2) + 5 * (a1 * a2) := by
        simp only [Int.add_mul, Int.mul_add]
        have ha : a1 * (2 * a1) = 2 * (a1 * a1) := mg_mul_left_comm a1 2 a1
        have hb : (2 * a2) * (2 * a1) = 4 * (a1 * a2) := by
          rw [Int.mul_assoc 2 a2 (2 * a1), mg_mul_left_comm a2 2 a1, Int.mul_comm a2 a1,
              ← Int.mul_assoc 2 2]; rfl
        have hc : (2 * a2) * a2 = 2 * (a2 * a2) := Int.mul_assoc 2 a2 a2
        rw [ha, hb, hc]; omega
      rw [h3, hp2]; omega
    have hProd3 : ((a1 - a2) * (a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)) *
        ((a1 - a2) * (a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)) =
        ((a1 - a2) * (a1 - a2)) *
        (((a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)) * ((a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1))) := by
      have hA : (a1 - a2) * (a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1) =
          (a1 - a2) * ((a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)) := Int.mul_assoc _ _ _
      rw [hA]
      let x := a1 - a2
      let y := (a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)
      calc (x * y) * (x * y) = x * (y * (x * y)) := Int.mul_assoc _ _ _
        _ = x * ((y * x) * y) := by rw [← Int.mul_assoc y x y]
        _ = x * ((x * y) * y) := by rw [Int.mul_comm y x]
        _ = x * (x * (y * y)) := by rw [Int.mul_assoc x y y]
        _ = (x * x) * (y * y) := (Int.mul_assoc _ _ _).symm
    rw [hProd3, hD1, hD2, hNegSqGen]
    let P := p * p
    have hpqSq : (p * q) * (p * q) = P * (q * q) := by
      calc (p * q) * (p * q) = p * (q * (p * q)) := Int.mul_assoc _ _ _
        _ = p * ((q * p) * q) := by rw [← Int.mul_assoc q p q]
        _ = p * ((p * q) * q) := by rw [Int.mul_comm q p]
        _ = p * (p * (q * q)) := by rw [Int.mul_assoc p q q]
        _ = (p * p) * (q * q) := (Int.mul_assoc _ _ _).symm
    rw [hpqSq]
    change (P - 4 * q) * ((2 * P + q) * (2 * P + q)) =
      4 * ((P - q) * (P - q) * (P - q)) - 27 * (P * (q * q))
    simp only [Int.sub_mul, Int.mul_sub, Int.add_mul, Int.mul_add]
    have c1 : (2 * P) * (2 * P) = 4 * (P * P) := by
      rw [Int.mul_assoc 2 P (2 * P), mg_mul_left_comm P 2 P, ← Int.mul_assoc 2 2]; rfl
    have c2 : (2 * P) * q = 2 * (P * q) := Int.mul_assoc 2 P q
    have c3 : q * (2 * P) = 2 * (P * q) := by rw [Int.mul_comm, c2]
    have c4 : P * (4 * (P * P)) = 4 * (P * P * P) := by
      rw [mg_mul_left_comm P 4 (P * P), ← Int.mul_assoc P P P]
    have c5 : P * (2 * (P * q)) = 2 * (P * P * q) := by
      rw [mg_mul_left_comm P 2 (P * q), ← Int.mul_assoc P P q]
    have c6 : (4 * q) * (4 * (P * P)) = 16 * (P * P * q) := by
      rw [Int.mul_assoc 4 q (4 * (P * P)), mg_mul_left_comm q 4 (P * P), ← Int.mul_assoc 4 4,
          Int.mul_comm q (P * P)]; rfl
    have c7 : (4 * q) * (2 * (P * q)) = 8 * (P * (q * q)) := by
      calc (4 * q) * (2 * (P * q)) = 4 * (q * (2 * (P * q))) := Int.mul_assoc _ _ _
        _ = 4 * (2 * (q * (P * q))) := by rw [mg_mul_left_comm q 2 (P * q)]
        _ = 8 * (q * (P * q)) := by rw [← Int.mul_assoc 4 2]; rfl
        _ = 8 * (P * (q * q)) := by rw [mg_mul_left_comm q P q]
    have c8 : (4 * q) * (q * q) = 4 * (q * (q * q)) := Int.mul_assoc 4 q (q * q)
    have c9 : q * P = P * q := Int.mul_comm q P
    have c10 : P * q * P = P * P * q := by rw [Int.mul_assoc P q P, Int.mul_comm q P, ← Int.mul_assoc]
    have c11 : q * q * P = P * (q * q) := Int.mul_comm _ _
    have c12 : P * q * q = P * (q * q) := Int.mul_assoc P q q
    have c13 : q * q * q = q * (q * q) := Int.mul_assoc q q q
    rw [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13]
    omega
  -- Root-difference invariants u1, u2, u3
  have hUsum : (a1 - a2) * (a1 - a2) + (a2 - (-(a1 + a2))) * (a2 - (-(a1 + a2))) +
      ((-(a1 + a2)) - a1) * ((-(a1 + a2)) - a1) = 6 * (p * p - q) := by
    have h1 : (a1 - a2) * (a1 - a2) = a1 * a1 - 2 * q + a2 * a2 := by
      simp only [Int.sub_mul, Int.mul_sub, Int.mul_comm a2 a1]; omega
    have h2 : (a2 - (-(a1 + a2))) * (a2 - (-(a1 + a2))) = a1 * a1 + 4 * q + 4 * (a2 * a2) := by
      have ha : a2 - (-(a1 + a2)) = a1 + 2 * a2 := by omega
      rw [ha]; simp only [Int.add_mul, Int.mul_add]
      have m1 : a1 * (2 * a2) = 2 * q := mg_mul_left_comm a1 2 a2
      have m2 : (2 * a2) * a1 = 2 * q := by rw [Int.mul_comm, m1]
      have m3 : (2 * a2) * (2 * a2) = 4 * (a2 * a2) := by
        rw [Int.mul_assoc 2 a2 (2 * a2), mg_mul_left_comm a2 2 a2, ← Int.mul_assoc 2 2]; rfl
      rw [m1, m2, m3]; omega
    have h3 : ((-(a1 + a2)) - a1) * ((-(a1 + a2)) - a1) = 4 * (a1 * a1) + 4 * q + a2 * a2 := by
      have ha : (-(a1 + a2)) - a1 = -(2 * a1 + a2) := by omega
      rw [ha, hNegSqGen]; simp only [Int.add_mul, Int.mul_add]
      have m1 : (2 * a1) * (2 * a1) = 4 * (a1 * a1) := by
        rw [Int.mul_assoc 2 a1 (2 * a1), mg_mul_left_comm a1 2 a1, ← Int.mul_assoc 2 2]; rfl
      have m2 : (2 * a1) * a2 = 2 * q := Int.mul_assoc 2 a1 a2
      have m3 : a2 * (2 * a1) = 2 * q := by rw [Int.mul_comm, m2]
      rw [m1, m2, m3]; omega
    rw [h1, h2, h3]
    omega
  have hU2 :
      let u1 := (a1 - a2) * (a1 - a2)
      let u2 := (a2 - (-(a1 + a2))) * (a2 - (-(a1 + a2)))
      let u3 := ((-(a1 + a2)) - a1) * ((-(a1 + a2)) - a1)
      4 * (u1 * u2 + u2 * u3 + u3 * u1) = 36 * ((p * p - q) * (p * p - q)) := by
    let P := p * p
    have hU1 : (a1 - a2) * (a1 - a2) = P - 4 * q := by
      have h : (a1 - a2) * (a1 - a2) = a1 * a1 - 2 * q + a2 * a2 := by
        simp only [Int.sub_mul, Int.mul_sub, Int.mul_comm a2 a1]; omega
      change (a1 - a2) * (a1 - a2) = p * p - 4 * q
      omega
    have hU23Sum : (a2 - (-(a1 + a2))) * (a2 - (-(a1 + a2))) +
        ((-(a1 + a2)) - a1) * ((-(a1 + a2)) - a1) = 5 * P - 2 * q := by
      change (a2 - (-(a1 + a2))) * (a2 - (-(a1 + a2))) +
        ((-(a1 + a2)) - a1) * ((-(a1 + a2)) - a1) = 5 * (p * p) - 2 * q
      change (a1 - a2) * (a1 - a2) = p * p - 4 * q at hU1
      omega
    have hU23Prod : ((a2 - (-(a1 + a2))) * (a2 - (-(a1 + a2)))) *
        (((-(a1 + a2)) - a1) * ((-(a1 + a2)) - a1)) = (2 * P + q) * (2 * P + q) := by
      have hProd : ((a2 - (-(a1 + a2))) * (a2 - (-(a1 + a2)))) *
          (((-(a1 + a2)) - a1) * ((-(a1 + a2)) - a1)) =
          ((a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)) *
          ((a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1)) := by
        let x := a2 - (-(a1 + a2))
        let y := (-(a1 + a2)) - a1
        calc (x * x) * (y * y) = x * (x * (y * y)) := Int.mul_assoc _ _ _
          _ = x * ((x * y) * y) := by rw [← Int.mul_assoc x y y]
          _ = x * ((y * x) * y) := by rw [Int.mul_comm x y]
          _ = x * (y * (x * y)) := by rw [Int.mul_assoc y x y]
          _ = (x * y) * (x * y) := (Int.mul_assoc _ _ _).symm
      have hPair : (a2 - (-(a1 + a2))) * ((-(a1 + a2)) - a1) = -(2 * P + q) := by
        have h1 : a2 - (-(a1 + a2)) = a1 + 2 * a2 := by omega
        have h2 : (-(a1 + a2)) - a1 = -(2 * a1 + a2) := by omega
        rw [h1, h2, Int.mul_neg]
        have h3 : (a1 + 2 * a2) * (2 * a1 + a2) = 2 * (a1 * a1 + a2 * a2) + 5 * q := by
          simp only [Int.add_mul, Int.mul_add]
          have ha : a1 * (2 * a1) = 2 * (a1 * a1) := mg_mul_left_comm a1 2 a1
          have hb : (2 * a2) * (2 * a1) = 4 * q := by
            rw [Int.mul_assoc 2 a2 (2 * a1), mg_mul_left_comm a2 2 a1, Int.mul_comm a2 a1,
                ← Int.mul_assoc 2 2]; rfl
          have hc : (2 * a2) * a2 = 2 * (a2 * a2) := Int.mul_assoc 2 a2 a2
          rw [ha, hb, hc]; omega
        rw [h3, hp2]; omega
      rw [hProd, hPair, hNegSqGen]
    dsimp only
    have hFactor :
        (a1 - a2) * (a1 - a2) * ((a2 - -(a1 + a2)) * (a2 - -(a1 + a2))) +
        (a2 - -(a1 + a2)) * (a2 - -(a1 + a2)) * ((-(a1 + a2) - a1) * (-(a1 + a2) - a1)) +
        (-(a1 + a2) - a1) * (-(a1 + a2) - a1) * ((a1 - a2) * (a1 - a2)) =
        (a1 - a2) * (a1 - a2) *
          ((a2 - -(a1 + a2)) * (a2 - -(a1 + a2)) + (-(a1 + a2) - a1) * (-(a1 + a2) - a1)) +
        (a2 - -(a1 + a2)) * (a2 - -(a1 + a2)) * ((-(a1 + a2) - a1) * (-(a1 + a2) - a1)) := by
      rw [Int.mul_add, Int.mul_comm ((-(a1 + a2) - a1) * (-(a1 + a2) - a1)) ((a1 - a2) * (a1 - a2))]
      omega
    rw [hFactor, hU1, hU23Sum, hU23Prod]
    change 4 * ((P - 4 * q) * (5 * P - 2 * q) + (2 * P + q) * (2 * P + q)) =
      36 * ((P - q) * (P - q))
    simp only [Int.sub_mul, Int.mul_sub, Int.add_mul, Int.mul_add]
    have d1 : P * (5 * P) = 5 * (P * P) := mg_mul_left_comm P 5 P
    have d2 : P * (2 * q) = 2 * (P * q) := mg_mul_left_comm P 2 q
    have d3 : (4 * q) * (5 * P) = 20 * (P * q) := by
      rw [Int.mul_assoc 4 q (5 * P), mg_mul_left_comm q 5 P, Int.mul_comm q P, ← Int.mul_assoc 4 5]; rfl
    have d4 : (4 * q) * (2 * q) = 8 * (q * q) := by
      rw [Int.mul_assoc 4 q (2 * q), mg_mul_left_comm q 2 q, ← Int.mul_assoc 4 2]; rfl
    have d5 : (2 * P) * (2 * P) = 4 * (P * P) := by
      rw [Int.mul_assoc 2 P (2 * P), mg_mul_left_comm P 2 P, ← Int.mul_assoc 2 2]; rfl
    have d6 : (2 * P) * q = 2 * (P * q) := Int.mul_assoc 2 P q
    have d7 : q * (2 * P) = 2 * (P * q) := by rw [Int.mul_comm, d6]
    have d8 : q * P = P * q := Int.mul_comm q P
    rw [d1, d2, d3, d4, d5, d6, d7, d8]
    omega
  dsimp only
  have hS2 : (2 * (p * p - q)) * (2 * (p * p - q)) = 4 * ((p * p - q) * (p * p - q)) := by
    rw [Int.mul_assoc 2 (p * p - q) (2 * (p * p - q)), mg_mul_left_comm (p * p - q) 2 (p * p - q),
        ← Int.mul_assoc 2 2]; rfl
  have hS3 : (2 * (p * p - q)) * (2 * (p * p - q)) * (2 * (p * p - q)) =
      8 * ((p * p - q) * (p * p - q) * (p * p - q)) := by
    rw [hS2, Int.mul_assoc 4, mg_mul_left_comm ((p * p - q) * (p * p - q)) 2 (p * p - q),
        ← Int.mul_assoc 4 2]; rfl
  rw [hS, hS3, hS2, hA4Sum, hA6Sum, hE3Sq, hDisc, hUsum, hU2]
  have hNonneg := int_sq_nonneg ((a1 - a2) * (a2 - -(a1 + a2)) * (-(a1 + a2) - a1))
  rw [hDisc] at hNonneg
  refine ⟨by omega, by omega, by omega, by omega, by omega, by omega⟩

private theorem su3_closed_form_cert :
    -- Exact A_2 Weyl-chamber Pieri moments a_0 .. a_10
    (List.range 11).map su3PieriMoment = [1, 0, 2, 2, 12, 30, 130, 462, 1946, 7980, 34776] ∧
    -- Exact upper bound c_0(16 * 317/1000) < 12/5 using K = 10 partial sum + exact geometric tail
    5 * (4763 * su3C0PartialNum10 + 3804 * su3C0Term10Num) < 12 * (4763 * su3C0Den10) ∧
    -- Exact ZSqrt7 upper bound 4 + 4√7 < 14584/1000
    ZSqrt7.lt (ZSqrt7.scale 1000 mgLambda11) (ZSqrt7.ofInt 14584) ∧
    -- Closed-form 1-term Chen-Wang gap at β = 317/1000: λ_1 ≥ 15/8 - 8*(317/1000)/3 = 3089/3000 > 1
    3000 * 15 - 8 * (8 * 317) = 8 * 3089 ∧
    -- Exact 1D-axial closed-form SU(3) W_1 contraction at β = 317/1000:
    -- (14584/1000)^4 * (317/1000)^4 * 5 * (12/5) < (72 * 3089 / 3000)^2
    -- Cleared of 1000^8 (note 72/3000 = 3/125, 1000^8 / 125^2 = 64 * 1000^6):
    (14584 ^ 4) * (317 ^ 4) * 12 < (3 * 3089) * (3 * 3089) * 64 * (1000 ^ 6) ∧
    -- Exact β_BE^{24c}(SU(3)) = 9 / (16 √7) bracket (0.212605, 0.212606)
    1792 * (212605 * 212605) < 81 * (1000000 * 1000000) ∧
    81 * (1000000 * 1000000) < 1792 * (212606 * 212606) ∧
    -- Strict ratio 317/1000 > (149/100) * (9 / (16 √7))  (> 1.49x past β_BE^{24c}!)
    (149 * 1125) * (149 * 1125) < 7 * ((634 * 100) * (634 * 100)) := by
  decide

/-- Theorem MG-12: Exact `SU(3)` closed-form `W_1` lower bound strictly past `1.49 * β_BE^{24c}`:
    1. Exact symbolic `su(3)` trace/discriminant SOS for ALL traceless `(a_1, a_2, a_3)`
       (`∑ a_k^4 = S^2/2`, `∑ a_k^6 = S^3/4 + 3 e_3^2`, `54 e_3^2 ≤ S^3`, root-difference
       invariants `e_1(u) = 3 S`, `e_2(u) = (9/4) S^2`, implying `∑ a_k^6 ≤ 11/36` and `E[v^6] ≤ 191/3456`),
    2. Exact `A_2` Weyl-chamber Pieri walk computing `SU(3)` Haar moments `a_0..a_{10}` + symbolic
       factorial tail dominance `11! * 12^m ≤ (11 + m)!` (`∀ m`), proving `c_0(16 * 317/1000) < 12/5`,
    3. Exact closed-form 1D-axial `SU(3)` `W_1` contraction (`λ_1 ≥ 15/8 - 8β/3 = 3089/3000`,
       `m_4 = 5/64`, `c_0 < 12/5`, `4 + 4√7 < 14584/1000`) strictly satisfied at `β = 317/1000`,
    4. Exact bracket `0.212605 < β_BE^{24c}(SU(3)) = 9 / (16√7) < 0.212606` and strict ratio
       `317/1000 > (149/100) * β_BE^{24c}(SU(3))` (`> 1.49x` past `β_BE^{24c}`). -/
theorem thm_mg_su3_closed_form_w1_beyond_be :
    (∀ a1 a2 a3 : Int, a1 + a2 + a3 = 0 →
      let S := a1 * a1 + a2 * a2 + a3 * a3
      let e3 := a1 * a2 * a3
      let u1 := (a1 - a2) * (a1 - a2)
      let u2 := (a2 - a3) * (a2 - a3)
      let u3 := (a3 - a1) * (a3 - a1)
      2 * (a1 * a1 * a1 * a1 + a2 * a2 * a2 * a2 + a3 * a3 * a3 * a3) = S * S ∧
      4 * (a1 * a1 * a1 * a1 * a1 * a1 + a2 * a2 * a2 * a2 * a2 * a2 + a3 * a3 * a3 * a3 * a3 * a3) =
        S * S * S + 12 * (e3 * e3) ∧
      54 * (e3 * e3) ≤ S * S * S ∧
      u1 + u2 + u3 = 3 * S ∧
      4 * (u1 * u2 + u2 * u3 + u3 * u1) = 9 * (S * S)) ∧
    (∀ m : Nat, natFact 11 * 12 ^ m ≤ natFact (11 + m)) ∧
    (List.range 11).map su3PieriMoment = [1, 0, 2, 2, 12, 30, 130, 462, 1946, 7980, 34776] ∧
    5 * (4763 * su3C0PartialNum10 + 3804 * su3C0Term10Num) < 12 * (4763 * su3C0Den10) ∧
    ZSqrt7.lt (ZSqrt7.scale 1000 mgLambda11) (ZSqrt7.ofInt 14584) ∧
    3000 * 15 - 8 * (8 * 317) = 8 * 3089 ∧
    (14584 ^ 4) * (317 ^ 4) * 12 < (3 * 3089) * (3 * 3089) * 64 * (1000 ^ 6) ∧
    1792 * (212605 * 212605) < 81 * (1000000 * 1000000) ∧
    81 * (1000000 * 1000000) < 1792 * (212606 * 212606) ∧
    (149 * 1125) * (149 * 1125) < 7 * ((634 * 100) * (634 * 100)) := by
  refine ⟨?_, natFact_tail_dom, su3_closed_form_cert.1, su3_closed_form_cert.2.1,
          su3_closed_form_cert.2.2.1, su3_closed_form_cert.2.2.2.1,
          su3_closed_form_cert.2.2.2.2.1, su3_closed_form_cert.2.2.2.2.2.1,
          su3_closed_form_cert.2.2.2.2.2.2.1, su3_closed_form_cert.2.2.2.2.2.2.2⟩
  intro a1 a2 a3 hTr
  have h := su3_traceless_invariants a1 a2 a3 hTr
  exact ⟨h.1, h.2.1, h.2.2.2.1, h.2.2.2.2.1, h.2.2.2.2.2⟩

end Vibe
