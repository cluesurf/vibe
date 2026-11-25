import Vibe.Algebra
import Vibe.CuspGrowth
import Vibe.SchurGap

/-!
# Vibe Theory: Sharp `{3,4,3,4}` Spectral Radius Bracket `11 < ρ ≤ 335/28 < 12` (`λ_gap > 1/2`)

Zero-dependency Lean 4.35.0 formalization of Wave-2 Track W1 (`01-spectral-radius-sharpening.md`,
Milestone P7-A), sharpening the Depth-1 Cartier-Foata spectral radius upper bound from
`Vibe.SchurGap`'s `104/7 = 14.857143` (`ρ/24 ≤ 13/21`, `λ_gap ≥ 8/21`) down to
**`335/28 = 11.964286 < 12`** (`ρ/24 ≤ 335/672 < 1/2`, **`λ_gap ≥ 337/672 > 1/2`**) and
**`3325977059 / 278900000 = 11.925339`**, paired with exact finite-support Cartier-Foata
Rayleigh-Ritz lower-bound certificates exceeding **`11`** and **`11049 / 1000`**:

1. **Exact Gabber-Galil-Nagnibeda Reciprocal Edge-Weight Schur Criterion (`thm_ss_reciprocal_edge_amgm`,
   `thm_ss_finite_reciprocal_schur_bound`):** Unconditional `Int`/`QPos` AM-GM and finite-graph
   operator-norm bound `|⟨x, A x⟩| ≤ (MNum / D) ⟨x, x⟩` for arbitrary positive reciprocal edge
   weights `W(i → j) * W(j → i) = D^2` (no curl-free vertex potential required).
2. **Exhaustive 217-Clique `{3,4,3,4}` Right-Descent Partition & All-Depth Detailed Balance
   (`thm_ss_d4_comm_cliques_and_transitions`, `thm_ss_foata_detailed_balance`):** Direct verification
   across all `1 + 24 + 96 + 96 = 217` cliques of `Γ_24` (zero `K_4`s) of the uniform upward
   partitions `ssUpBound` (`(24,0,0), (15,8,0), (11,8,3), (9,6,6)`) and all-depth (`∀ r : Nat`)
   detailed balance linking `Vibe.CuspGrowth`'s `foataA0..foataA3` directly to `M_up`.
3. **3-Rational Upper Bounds & Structural RACG Subgraph Bridge (`thm_ss_three_rational_row_sums`,
   `thm_ss_spectral_radius_lt_12`, `thm_ss_normalized_gap_gt_half`, `thm_ss_refined_3rat_bound`,
   `thm_ss_racg_subgraph_schur_bound`):** Exact certificates for `(1/7, 1/3, 4/7) → 335/28 < 12`
   and `(13945/100000, 33282/100000, 57314/100000) → 3325977059/278900000`, applied from a single
   structural downward/upward degree hypothesis (`ssUpBound`) to arbitrary finite RACG subgraphs,
   with a concrete non-vacuity instantiation on the 25-vertex `R = 1` ball (`Fin 25`).
4. **Upward-Only Bipartite Stratum Rayleigh-Ritz Compression, Lower Witnesses & `(11, 12)` Bracket
   (`thm_ss_stratum_rayleigh_exact`, `thm_ss_rayleigh_lower_gt_11`, `thm_ss_spectral_bracket_11_12`):**
   Exact compression requiring only upward degree uniformity (true on `{3,4,3,4}` Depth-1 strata even
   where downward stratum degrees vary), bridged directly to concrete finite-support integer witnesses
   on `r = 1..24` (`amp = (2, 3, 5) → > 11`) and `r = 1..36` (`amp = (17, 26, 45) → > 11.049`).

**External Infinite-Graph Bridge (Scope Honesty):** Infinite-group `ℓ^2(W(Γ_24))` Hilbert spaces
and the Coxeter Exchange Condition on the full infinite Cayley graph of `W(Γ_24)` (bipartiteness by
word length, `D(w s_b) = {b} ∪ (D(w) ∩ Adj(b))`, and realization of `|V_{r, k}| = ssStratumCount k r`
on every finite ball `B_R`) are stated as explicit finite-subgraph structural hypotheses here and
connect to the infinite operator norm `ρ({3,4,3,4})` externally by density of finitely supported
vectors in `ℓ^2(W(Γ_24))`.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Private `Int`, `QPos`, and `Fin n` Summation Helpers -/

private theorem ss_ite_pos {α : Type} {c : Prop} [h : Decidable c] (hc : c) (a b : α) :
    (if c then a else b) = a :=
  match h with
  | isTrue _ => rfl
  | isFalse hnc => absurd hc hnc

private theorem ss_ite_neg {α : Type} {c : Prop} [h : Decidable c] (hnc : ¬ c) (a b : α) :
    (if c then a else b) = b :=
  match h with
  | isTrue hc => absurd hc hnc
  | isFalse _ => rfl

private theorem ss_dite_pos {α : Type} {c : Prop} [h : Decidable c] (hc : c)
    (a : c → α) (b : ¬ c → α) : (if hc' : c then a hc' else b hc') = a hc :=
  match h with
  | isTrue _ => rfl
  | isFalse hnc => absurd hc hnc

private theorem ss_dite_neg {α : Type} {c : Prop} [h : Decidable c] (hnc : ¬ c)
    (a : c → α) (b : ¬ c → α) : (if hc' : c then a hc' else b hc') = b hnc :=
  match h with
  | isTrue hc => absurd hc hnc
  | isFalse _ => rfl

private theorem ss_ofNat_add (a b : Nat) : Int.ofNat a + Int.ofNat b = Int.ofNat (a + b) := rfl
private theorem ss_ofNat_mul (a b : Nat) : Int.ofNat a * Int.ofNat b = Int.ofNat (a * b) := rfl
private theorem ss_ofNat_lt {a b : Nat} (h : a < b) : Int.ofNat a < Int.ofNat b := Int.ofNat_lt.mpr h

private theorem ss_int_mul_left_comm (a b c : Int) : a * (b * c) = b * (a * c) := by
  rw [← Int.mul_assoc, Int.mul_comm a b, Int.mul_assoc]

private theorem ss_int_mul_right_comm (a b c : Int) : (a * b) * c = (a * c) * b := by
  rw [Int.mul_assoc, Int.mul_comm b c, ← Int.mul_assoc]

private theorem ss_int_mul_four (p x q y : Int) : (p * x) * (q * y) = (p * q) * (x * y) := by
  rw [Int.mul_assoc p x (q * y), ss_int_mul_left_comm x q y, ← Int.mul_assoc p q (x * y)]

private theorem ss_int_mul_pos (a b : Int) (ha : 0 < a) (hb : 0 < b) : 0 < a * b := by
  have h : 0 ≤ (a - 1) * (b - 1) := Int.mul_nonneg (by omega) (by omega)
  rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.one_mul, Int.mul_one] at h
  omega

private theorem ss_int_mul_le_right (a b c : Int) (hab : a ≤ b) (hc : 0 ≤ c) : a * c ≤ b * c := by
  have h : 0 ≤ (b - a) * c := Int.mul_nonneg (by omega) hc
  rw [Int.sub_mul] at h
  omega

private theorem ss_int_le_of_mul_le_right (x y d : Int) (hd : 0 < d) (h : x * d ≤ y * d) :
    x ≤ y := by
  if hxy : x ≤ y then exact hxy
  else
    have hpos : 0 < (x - y) * d := ss_int_mul_pos (x - y) d (by omega) hd
    rw [Int.sub_mul] at hpos
    omega

private theorem ss_int_sub_sq (a b : Int) : (a - b) * (a - b) = a * a - 2 * (a * b) + b * b := by
  rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.mul_comm b a]; omega

private theorem ss_int_add_sq (a b : Int) : (a + b) * (a + b) = a * a + 2 * (a * b) + b * b := by
  rw [Int.add_mul, Int.mul_add, Int.mul_add, Int.mul_comm b a]; omega

/-- Rational scaling and inversion combinators extending `Vibe.SchurGap.QPos`. -/
def ssQPosScaleInt (c : Int) (q : QPos) : QPos := ⟨c * q.num, q.den, q.denPos⟩
def ssQPosInv (q : QPos) (hq : 0 < q.num) : QPos := ⟨q.den, q.num, hq⟩

/-- Exact finite integer sum `∑_{i = 0}^{k - 1} f i` over `Fin n`. -/
def ssSumFinAux {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Int) : Int :=
  match k with
  | 0 => 0
  | m + 1 => ssSumFinAux m (by omega) f + f ⟨m, by omega⟩

/-- Exact finite integer sum `∑_{i : Fin n} f i`. -/
def ssSumFin {n : Nat} (f : Fin n → Int) : Int := ssSumFinAux n (Nat.le_refl n) f

private theorem ss_sumFinAux_zero {n : Nat} (k : Nat) (hk : k ≤ n) :
    ssSumFinAux k hk (fun _ : Fin n => (0 : Int)) = 0 := by
  induction k with
  | zero => rfl
  | succ m ih => change ssSumFinAux m (by omega) _ + 0 = 0; rw [ih (by omega)]; omega

private theorem ss_sumFinAux_add {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Int) :
    ssSumFinAux k hk (fun i => f i + g i) = ssSumFinAux k hk f + ssSumFinAux k hk g := by
  induction k with
  | zero => rfl
  | succ m ih =>
    change ssSumFinAux m (by omega) (fun i => f i + g i) + (f ⟨m, by omega⟩ + g ⟨m, by omega⟩) =
      (ssSumFinAux m (by omega) f + f ⟨m, by omega⟩) + (ssSumFinAux m (by omega) g + g ⟨m, by omega⟩)
    rw [ih (by omega)]; omega

private theorem ss_sumFinAux_le {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Int)
    (h : ∀ i : Fin n, f i ≤ g i) : ssSumFinAux k hk f ≤ ssSumFinAux k hk g := by
  induction k with
  | zero => change (0 : Int) ≤ 0; decide
  | succ m ih =>
    change ssSumFinAux m (by omega) f + f ⟨m, by omega⟩ ≤
           ssSumFinAux m (by omega) g + g ⟨m, by omega⟩
    have hm := ih (by omega)
    have ht := h ⟨m, by omega⟩
    omega

private theorem ss_sumFinAux_mul_left {n : Nat} (k : Nat) (hk : k ≤ n) (c : Int) (f : Fin n → Int) :
    ssSumFinAux k hk (fun i => c * f i) = c * ssSumFinAux k hk f := by
  induction k with
  | zero => change (0 : Int) = c * 0; rw [Int.mul_zero]
  | succ m ih =>
    change ssSumFinAux m (by omega) (fun i => c * f i) + c * f ⟨m, by omega⟩ =
      c * (ssSumFinAux m (by omega) f + f ⟨m, by omega⟩)
    rw [ih (by omega), Int.mul_add]

private theorem ss_sumFinAux_swap {n1 n2 : Nat} (k : Nat) (hk : k ≤ n1)
    (f : Fin n1 → Fin n2 → Int) :
    ssSumFinAux k hk (fun i => ssSumFin (fun j => f i j)) =
      ssSumFin (fun j => ssSumFinAux k hk (fun i => f i j)) := by
  induction k with
  | zero => exact (ss_sumFinAux_zero n2 (Nat.le_refl n2)).symm
  | succ m ih =>
    change ssSumFinAux m (by omega) (fun i => ssSumFin (fun j => f i j)) +
      ssSumFin (fun j => f ⟨m, by omega⟩ j) =
      ssSumFin (fun j => ssSumFinAux m (by omega) (fun i => f i j) + f ⟨m, by omega⟩ j)
    rw [ih (by omega)]
    exact (ss_sumFinAux_add n2 (Nat.le_refl n2) _ _).symm

private theorem ss_sumFinAux_kronecker {m : Nat} (k : Nat) (hk : k ≤ m)
    (u0 : Fin m) (g : Fin m → Int) :
    ssSumFinAux k hk (fun u : Fin m => if u0 = u then g u else 0) =
      if u0.val < k then g u0 else 0 := by
  induction k with
  | zero =>
    have hlt : ¬ (u0.val < 0) := by omega
    rw [ss_ite_neg hlt]; rfl
  | succ p ih =>
    change ssSumFinAux p (by omega) (fun u : Fin m => if u0 = u then g u else 0) +
      (if u0 = ⟨p, by omega⟩ then g ⟨p, by omega⟩ else 0) = if u0.val < p + 1 then g u0 else 0
    rw [ih (by omega)]
    if hlt : u0.val < p then
      have hlt1 : u0.val < p + 1 := by omega
      have hne : u0 ≠ ⟨p, by omega⟩ := fun h => by
        have hv : u0.val = p := congrArg Fin.val h
        omega
      rw [ss_ite_pos hlt, ss_ite_neg hne, ss_ite_pos hlt1]; omega
    else if heq : u0.val = p then
      have hlt1 : u0.val < p + 1 := by omega
      have hfeq : u0 = ⟨p, by omega⟩ := Fin.ext heq
      rw [ss_ite_neg hlt, ss_ite_pos hfeq, ← hfeq, ss_ite_pos hlt1]; omega
    else
      have hlt1 : ¬ (u0.val < p + 1) := by omega
      have hne : u0 ≠ ⟨p, by omega⟩ := fun h => heq (congrArg Fin.val h)
      rw [ss_ite_neg hlt, ss_ite_neg hne, ss_ite_neg hlt1]; omega

private theorem ss_sumFin_zero {n : Nat} : ssSumFin (fun _ : Fin n => (0 : Int)) = 0 :=
  ss_sumFinAux_zero n (Nat.le_refl n)

private theorem ss_sumFin_add {n : Nat} (f g : Fin n → Int) :
    ssSumFin (fun i => f i + g i) = ssSumFin f + ssSumFin g :=
  ss_sumFinAux_add n (Nat.le_refl n) f g

private theorem ss_sumFin_le {n : Nat} (f g : Fin n → Int) (h : ∀ i : Fin n, f i ≤ g i) :
    ssSumFin f ≤ ssSumFin g := ss_sumFinAux_le n (Nat.le_refl n) f g h

private theorem ss_sumFin_mul_left {n : Nat} (c : Int) (f : Fin n → Int) :
    ssSumFin (fun i => c * f i) = c * ssSumFin f := ss_sumFinAux_mul_left n (Nat.le_refl n) c f

private theorem ss_sumFin_mul_right {n : Nat} (f : Fin n → Int) (c : Int) :
    ssSumFin (fun i => f i * c) = ssSumFin f * c := by
  have h1 : (fun i => f i * c) = (fun i => c * f i) := funext (fun i => Int.mul_comm (f i) c)
  rw [h1, ss_sumFin_mul_left, Int.mul_comm]

private theorem ss_sumFin_swap {n1 n2 : Nat} (f : Fin n1 → Fin n2 → Int) :
    ssSumFin (fun i => ssSumFin (fun j => f i j)) = ssSumFin (fun j => ssSumFin (fun i => f i j)) :=
  ss_sumFinAux_swap n1 (Nat.le_refl n1) f

private theorem ss_sumFin_kronecker {m : Nat} (u0 : Fin m) (g : Fin m → Int) :
    ssSumFin (fun u : Fin m => if u0 = u then g u else 0) = g u0 := by
  unfold ssSumFin; rw [ss_sumFinAux_kronecker, ss_ite_pos u0.isLt]

/-- Exact integer quadratic form `⟨x, A x⟩ = ∑_{i, j : Fin n} A_{ij} x_i x_j`. -/
def ssQuadForm {n : Nat} (A : Fin n → Fin n → Bool) (x : Fin n → Int) : Int :=
  ssSumFin (fun i => ssSumFin (fun j => if A i j = true then x i * x j else 0))

/-- Exact integer squared `ℓ^2` norm `⟨x, x⟩ = ∑_{i : Fin n} x_i^2`. -/
def ssNormSq {n : Nat} (x : Fin n → Int) : Int := ssSumFin (fun i => x i * x i)

/-- Exact integer-scaled row sum `∑_{j : A_{ij}} W(i → j)` (representing `D * ∑_{j ~ i} w(i → j)`). -/
def ssRowSumInt {n : Nat} (A : Fin n → Fin n → Bool) (W : Fin n → Fin n → Int) (i : Fin n) : Int :=
  ssSumFin (fun j => if A i j = true then W i j else 0)


/-! ## Section 1: Exact Gabber-Galil-Nagnibeda Reciprocal Edge-Weight Schur Criterion -/

/-- Headline Theorem 1 (Exact Reciprocal Edge AM-GM Inequality in `Int` and `QPos`):
    for ALL `a, b, D, u, v : Int` with `0 < u`, `0 < D`, and reciprocal weights `(u/D)(v/D) = 1`
    (`u * v = D * D`), both `± 2 D a b ≤ u a^2 + v b^2` and the exact `QPos` bounds
    `± 2 a b ≤ (u/D) a^2 + (v/D) b^2` hold unconditionally! -/
theorem thm_ss_reciprocal_edge_amgm (a b D u v : Int)
    (hu : 0 < u) (hD : 0 < D) (hRec : u * v = D * D) :
    (2 * D * (a * b) ≤ u * (a * a) + v * (b * b)) ∧
    (-(2 * D * (a * b)) ≤ u * (a * a) + v * (b * b)) ∧
    QPos.le ⟨2 * (a * b), 1, by decide⟩ (QPos.add ⟨u * (a * a), D, hD⟩ ⟨v * (b * b), D, hD⟩) ∧
    QPos.le ⟨-(2 * (a * b)), 1, by decide⟩ (QPos.add ⟨u * (a * a), D, hD⟩ ⟨v * (b * b), D, hD⟩) := by
  have hLHS : (2 * D * (a * b)) * u = 2 * ((u * a) * (D * b)) := by
    calc
      (2 * D * (a * b)) * u = (2 * D) * ((a * b) * u) := Int.mul_assoc (2 * D) (a * b) u
      _ = 2 * (D * ((a * b) * u)) := Int.mul_assoc 2 D ((a * b) * u)
      _ = 2 * ((u * a) * (D * b)) := by
        apply congrArg (2 * ·)
        calc
          D * ((a * b) * u) = D * (u * (a * b)) := by rw [Int.mul_comm (a * b) u]
          _ = u * (D * (a * b)) := ss_int_mul_left_comm D u (a * b)
          _ = u * (a * (D * b)) := by rw [ss_int_mul_left_comm D a b]
          _ = (u * a) * (D * b) := (Int.mul_assoc u a (D * b)).symm
  have hRHS : (u * (a * a) + v * (b * b)) * u = (u * a) * (u * a) + (D * b) * (D * b) := by
    have h1 : (u * (a * a)) * u = (u * a) * (u * a) := by
      rw [ss_int_mul_right_comm u (a * a) u, ← ss_int_mul_four u a u a]
    have h2 : (v * (b * b)) * u = (D * b) * (D * b) := by
      rw [ss_int_mul_right_comm v (b * b) u, Int.mul_comm v u, hRec, ← ss_int_mul_four D b D b]
    rw [Int.add_mul, h1, h2]
  have hPos : 2 * D * (a * b) ≤ u * (a * a) + v * (b * b) := by
    apply ss_int_le_of_mul_le_right _ _ u hu
    rw [hLHS, hRHS]
    have hsq := int_sq_nonneg (u * a - D * b)
    rw [ss_int_sub_sq] at hsq; omega
  have hNeg : -(2 * D * (a * b)) ≤ u * (a * a) + v * (b * b) := by
    apply ss_int_le_of_mul_le_right _ _ u hu
    rw [Int.neg_mul, hLHS, hRHS]
    have hsq := int_sq_nonneg (u * a + D * b)
    rw [ss_int_add_sq] at hsq; omega
  have hQP : QPos.le ⟨2 * (a * b), 1, by decide⟩
      (QPos.add ⟨u * (a * a), D, hD⟩ ⟨v * (b * b), D, hD⟩) := by
    unfold QPos.le QPos.add
    rw [Int.mul_one, ← Int.add_mul (u * (a * a)) (v * (b * b)) D,
        ← Int.mul_assoc (2 * (a * b)) D D, ss_int_mul_right_comm 2 (a * b) D]
    exact ss_int_mul_le_right _ _ D hPos (by omega)
  have hQM : QPos.le ⟨-(2 * (a * b)), 1, by decide⟩
      (QPos.add ⟨u * (a * a), D, hD⟩ ⟨v * (b * b), D, hD⟩) := by
    unfold QPos.le QPos.add
    rw [Int.mul_one, ← Int.add_mul (u * (a * a)) (v * (b * b)) D,
        Int.neg_mul, ← Int.mul_assoc (2 * (a * b)) D D,
        ss_int_mul_right_comm 2 (a * b) D, ← Int.neg_mul]
    exact ss_int_mul_le_right _ _ D hNeg (by omega)
  exact ⟨hPos, hNeg, hQP, hQM⟩

/-- Headline Theorem 2 (Unconditional Gabber-Galil-Nagnibeda Reciprocal Edge-Weight Schur Bound):
    for ANY finite symmetric graph `(Fin n, A)`, ANY common denominator `D > 0`, ANY strictly
    positive reciprocal edge weights `W(i → j) * W(j → i) = D^2` with uniform row-sum ceiling
    `∀ i, ∑_{j ~ i} W(i → j) ≤ MNum`, and EVERY `x : Fin n → Int`,
    `|⟨x, A x⟩| ≤ (MNum / D) * ⟨x, x⟩` unconditionally (in both cleared `Int` and `QPos` forms)! -/
theorem thm_ss_finite_reciprocal_schur_bound {n : Nat}
    (A : Fin n → Fin n → Bool) (hSym : ∀ i j : Fin n, A i j = A j i)
    (D : Int) (hD : 0 < D) (W : Fin n → Fin n → Int)
    (hWPos : ∀ i j : Fin n, 0 < W i j)
    (hWRec : ∀ i j : Fin n, A i j = true → W i j * W j i = D * D)
    (MNum : Int) (hRow : ∀ i : Fin n, ssRowSumInt A W i ≤ MNum)
    (x : Fin n → Int) :
    (D * ssQuadForm A x ≤ MNum * ssNormSq x) ∧
    (-(D * ssQuadForm A x) ≤ MNum * ssNormSq x) ∧
    QPos.le ⟨ssQuadForm A x, 1, by decide⟩ (ssQPosScaleInt (ssNormSq x) ⟨MNum, D, hD⟩) ∧
    QPos.le ⟨-(ssQuadForm A x), 1, by decide⟩ (ssQPosScaleInt (ssNormSq x) ⟨MNum, D, hD⟩) := by
  have hSigned : ∀ s : Int, (s = 1 ∨ s = -1) → s * (D * ssQuadForm A x) ≤ MNum * ssNormSq x := by
    intro s hs
    have hEdge : ∀ i j : Fin n,
        (if A i j = true then 2 * D * (s * (x i * x j)) else 0) ≤
          (if A i j = true then W i j * (x i * x i) else 0) +
          (if A i j = true then W j i * (x j * x j) else 0) := by
      intro i j
      if hA : A i j = true then
        rw [ss_ite_pos hA, ss_ite_pos hA, ss_ite_pos hA]
        have hAM := thm_ss_reciprocal_edge_amgm (x i) (x j) D (W i j) (W j i) (hWPos i j) hD (hWRec i j hA)
        cases hs with
        | inl h1 => rw [h1, Int.one_mul]; exact hAM.1
        | inr hm1 =>
          have hNeg : 2 * D * ((-1) * (x i * x j)) = -(2 * D * (x i * x j)) := by
            rw [Int.neg_mul, Int.one_mul, Int.mul_neg]
          rw [hm1, hNeg]; exact hAM.2.1
      else
        rw [ss_ite_neg hA, ss_ite_neg hA, ss_ite_neg hA]; omega
    have hSumLe : ssSumFin (fun i => ssSumFin (fun j => if A i j = true then 2 * D * (s * (x i * x j)) else 0)) ≤
        ssSumFin (fun i => ssSumFin (fun j =>
          (if A i j = true then W i j * (x i * x i) else 0) +
          (if A i j = true then W j i * (x j * x j) else 0))) :=
      ss_sumFin_le _ _ (fun i => ss_sumFin_le _ _ (fun j => hEdge i j))
    have hLHS : ssSumFin (fun i => ssSumFin (fun j => if A i j = true then 2 * D * (s * (x i * x j)) else 0)) =
        2 * (s * (D * ssQuadForm A x)) := by
      have hIn : (fun i : Fin n => ssSumFin (fun j => if A i j = true then 2 * D * (s * (x i * x j)) else 0)) =
          (fun i : Fin n => (2 * (s * D)) * ssSumFin (fun j => if A i j = true then x i * x j else 0)) := by
        funext i
        have hF : (fun j : Fin n => if A i j = true then 2 * D * (s * (x i * x j)) else 0) =
            (fun j : Fin n => (2 * (s * D)) * (if A i j = true then x i * x j else 0)) := by
          funext j
          if hA : A i j = true then
            rw [ss_ite_pos hA, ss_ite_pos hA, Int.mul_assoc 2 D (s * (x i * x j)),
                ss_int_mul_left_comm D s (x i * x j), ← Int.mul_assoc s D (x i * x j),
                ← Int.mul_assoc 2 (s * D) (x i * x j)]
          else
            rw [ss_ite_neg hA, ss_ite_neg hA, Int.mul_zero]
        rw [hF, ss_sumFin_mul_left]
      rw [hIn, ss_sumFin_mul_left, Int.mul_assoc 2 (s * D) _, Int.mul_assoc s D _]; rfl
    have hSplit : ssSumFin (fun i => ssSumFin (fun j =>
          (if A i j = true then W i j * (x i * x i) else 0) +
          (if A i j = true then W j i * (x j * x j) else 0))) =
        ssSumFin (fun i => ssSumFin (fun j => if A i j = true then W i j * (x i * x i) else 0)) +
        ssSumFin (fun i => ssSumFin (fun j => if A i j = true then W j i * (x j * x j) else 0)) := by
      have hIn : (fun i : Fin n => ssSumFin (fun j =>
            (if A i j = true then W i j * (x i * x i) else 0) +
            (if A i j = true then W j i * (x j * x j) else 0))) =
          (fun i : Fin n => ssSumFin (fun j => if A i j = true then W i j * (x i * x i) else 0) +
            ssSumFin (fun j => if A i j = true then W j i * (x j * x j) else 0)) :=
        funext (fun i => ss_sumFin_add _ _)
      rw [hIn, ss_sumFin_add]
    have hSwap : ssSumFin (fun i => ssSumFin (fun j => if A i j = true then W j i * (x j * x j) else 0)) =
        ssSumFin (fun i => ssSumFin (fun j => if A i j = true then W i j * (x i * x i) else 0)) := by
      rw [ss_sumFin_swap]
      apply congrArg ssSumFin; funext j; apply congrArg ssSumFin; funext i; rw [hSym i j]
    have hRowSum : ssSumFin (fun i => ssSumFin (fun j => if A i j = true then W i j * (x i * x i) else 0)) =
        ssSumFin (fun i => ssRowSumInt A W i * (x i * x i)) := by
      apply congrArg ssSumFin; funext i
      have hF : (fun j : Fin n => if A i j = true then W i j * (x i * x i) else 0) =
          (fun j : Fin n => (if A i j = true then W i j else 0) * (x i * x i)) := by
        funext j
        if hA : A i j = true then rw [ss_ite_pos hA, ss_ite_pos hA]
        else rw [ss_ite_neg hA, ss_ite_neg hA, Int.zero_mul]
      rw [hF, ss_sumFin_mul_right]; rfl
    have hBound : ssSumFin (fun i => ssRowSumInt A W i * (x i * x i)) ≤ MNum * ssNormSq x := by
      have hLe := ss_sumFin_le (fun i => ssRowSumInt A W i * (x i * x i))
        (fun i => MNum * (x i * x i))
        (fun i => ss_int_mul_le_right _ _ (x i * x i) (hRow i) (int_sq_nonneg (x i)))
      rw [ss_sumFin_mul_left] at hLe; exact hLe
    rw [hLHS, hSplit, hSwap, hRowSum] at hSumLe
    omega
  have hP := hSigned 1 (Or.inl rfl); rw [Int.one_mul] at hP
  have hM := hSigned (-1) (Or.inr rfl)
  have hNegEq : (-1) * (D * ssQuadForm A x) = -(D * ssQuadForm A x) := by omega
  rw [hNegEq] at hM
  refine ⟨hP, hM, ?_, ?_⟩
  · unfold QPos.le ssQPosScaleInt
    rw [Int.mul_one, Int.mul_comm (ssQuadForm A x) D, Int.mul_comm (ssNormSq x) MNum]; exact hP
  · unfold QPos.le ssQPosScaleInt
    rw [Int.mul_one, Int.neg_mul, Int.mul_comm (ssQuadForm A x) D, Int.mul_comm (ssNormSq x) MNum]; exact hM


/-! ## Section 2: Exhaustive 217-Clique `{3,4,3,4}` Right-Descent Partition & Detailed Balance -/

/-- Exact generator membership in a clique `C : List (Fin 24)`. -/
def ssMem (x : Fin 24) : List (Fin 24) → Bool
  | [] => false
  | a :: as => (a.val == x.val) || ssMem x as

/-- Count of vertices in `C` adjacent to `x` under `adj`. -/
def ssAdjCount (adj : Fin 24 → Fin 24 → Bool) (x : Fin 24) : List (Fin 24) → Nat
  | [] => 0
  | a :: as => (if adj a x = true then 1 else 0) + ssAdjCount adj x as

private def ss_bump (acc : Nat × Nat × Nat × Nat) (sz : Nat) : Nat × Nat × Nat × Nat :=
  match sz with
  | 1 => (acc.1 + 1, acc.2.1, acc.2.2.1, acc.2.2.2)
  | 2 => (acc.1, acc.2.1 + 1, acc.2.2.1, acc.2.2.2)
  | 3 => (acc.1, acc.2.1, acc.2.2.1 + 1, acc.2.2.2)
  | _ => (acc.1, acc.2.1, acc.2.2.1, acc.2.2.2 + 1)

/-- Recursive accumulation of upward right-descent clique sizes `(up1, up2, up3, up4)` over `0..k-1`. -/
def ssUpCountsAux (adj : Fin 24 → Fin 24 → Bool) (C : List (Fin 24)) :
    (k : Nat) → k ≤ 24 → Nat × Nat × Nat × Nat
  | 0, _ => (0, 0, 0, 0)
  | m + 1, hm =>
    let acc := ssUpCountsAux adj C m (by omega)
    let b : Fin 24 := ⟨m, by omega⟩
    if ssMem b C = true then acc else ss_bump acc (1 + ssAdjCount adj b C)

/-- Exact Cartier-Foata upward right-descent clique-size partition `(up1, up2, up3, up4)`
    directly over `Vibe.CuspGrowth.adj24`: `D(w s_b) = {b} ∪ (D(w) ∩ Adj(b))`. -/
def ssUpTypeCounts (C : List (Fin 24)) : Nat × Nat × Nat × Nat :=
  ssUpCountsAux adj24 C 24 (Nat.le_refl 24)

private abbrev ss_Adj8 := Nat × Nat × Nat × Nat × Nat × Nat × Nat × Nat

private def ss_in8 (x : Nat) (t : ss_Adj8) : Bool :=
  (x == t.1) || (x == t.2.1) || (x == t.2.2.1) || (x == t.2.2.2.1) ||
  (x == t.2.2.2.2.1) || (x == t.2.2.2.2.2.1) || (x == t.2.2.2.2.2.2.1) || (x == t.2.2.2.2.2.2.2)

private def ss_adjTuple : Fin 24 → ss_Adj8
  | ⟨0, _⟩  => (4, 5, 8, 9, 12, 13, 16, 17)
  | ⟨1, _⟩  => (4, 5, 8, 9, 14, 15, 18, 19)
  | ⟨2, _⟩  => (6, 7, 10, 11, 12, 13, 16, 17)
  | ⟨3, _⟩  => (6, 7, 10, 11, 14, 15, 18, 19)
  | ⟨4, _⟩  => (0, 1, 8, 9, 12, 14, 20, 21)
  | ⟨5, _⟩  => (0, 1, 8, 9, 13, 15, 22, 23)
  | ⟨6, _⟩  => (2, 3, 10, 11, 12, 14, 20, 21)
  | ⟨7, _⟩  => (2, 3, 10, 11, 13, 15, 22, 23)
  | ⟨8, _⟩  => (0, 1, 4, 5, 16, 18, 20, 22)
  | ⟨9, _⟩  => (0, 1, 4, 5, 17, 19, 21, 23)
  | ⟨10, _⟩ => (2, 3, 6, 7, 16, 18, 20, 22)
  | ⟨11, _⟩ => (2, 3, 6, 7, 17, 19, 21, 23)
  | ⟨12, _⟩ => (0, 2, 4, 6, 16, 17, 20, 21)
  | ⟨13, _⟩ => (0, 2, 5, 7, 16, 17, 22, 23)
  | ⟨14, _⟩ => (1, 3, 4, 6, 18, 19, 20, 21)
  | ⟨15, _⟩ => (1, 3, 5, 7, 18, 19, 22, 23)
  | ⟨16, _⟩ => (0, 2, 8, 10, 12, 13, 20, 22)
  | ⟨17, _⟩ => (0, 2, 9, 11, 12, 13, 21, 23)
  | ⟨18, _⟩ => (1, 3, 8, 10, 14, 15, 20, 22)
  | ⟨19, _⟩ => (1, 3, 9, 11, 14, 15, 21, 23)
  | ⟨20, _⟩ => (4, 6, 8, 10, 12, 14, 16, 18)
  | ⟨21, _⟩ => (4, 6, 9, 11, 12, 14, 17, 19)
  | ⟨22, _⟩ => (5, 7, 8, 10, 13, 15, 16, 18)
  | ⟨23, _⟩ => (5, 7, 9, 11, 13, 15, 17, 19)
  | ⟨n + 24, h⟩ => absurd h (by omega)

private def ss_adjFast (a b : Fin 24) : Bool := ss_in8 b.val (ss_adjTuple a)

private theorem ss_adj24_eq_fast : ∀ a b : Fin 24, adj24 a b = ss_adjFast a b := by decide

private theorem ss_adj24_fun_eq : adj24 = ss_adjFast :=
  funext (fun a => funext (fun b => ss_adj24_eq_fast a b))

private def ss_up1Aux (a : Nat) (ta : ss_Adj8) : Nat → Nat × Nat × Nat × Nat
  | 0 => (0, 0, 0, 0)
  | m + 1 =>
    let acc := ss_up1Aux a ta m
    if ((a == m) || false) = true then acc
    else ss_bump acc (1 + ((if ss_in8 m ta = true then 1 else 0) + 0))

private def ss_up2Aux (a b : Nat) (ta tb : ss_Adj8) : Nat → Nat × Nat × Nat × Nat
  | 0 => (0, 0, 0, 0)
  | m + 1 =>
    let acc := ss_up2Aux a b ta tb m
    if ((a == m) || ((b == m) || false)) = true then acc
    else ss_bump acc (1 + ((if ss_in8 m ta = true then 1 else 0) +
                           ((if ss_in8 m tb = true then 1 else 0) + 0)))

private def ss_up3Aux (a b c : Nat) (ta tb tc : ss_Adj8) : Nat → Nat × Nat × Nat × Nat
  | 0 => (0, 0, 0, 0)
  | m + 1 =>
    let acc := ss_up3Aux a b c ta tb tc m
    if ((a == m) || ((b == m) || ((c == m) || false))) = true then acc
    else ss_bump acc (1 + ((if ss_in8 m ta = true then 1 else 0) +
                           ((if ss_in8 m tb = true then 1 else 0) +
                           ((if ss_in8 m tc = true then 1 else 0) + 0))))

private theorem ss_up1_eq_fast (a : Fin 24) :
    ssUpTypeCounts [a] = ss_up1Aux a.val (ss_adjTuple a) 24 := by
  unfold ssUpTypeCounts; rw [ss_adj24_fun_eq]
  have h : ∀ k (hk : k ≤ 24), ssUpCountsAux ss_adjFast [a] k hk = ss_up1Aux a.val (ss_adjTuple a) k := by
    intro k hk; induction k with
    | zero => rfl
    | succ m ih => unfold ssUpCountsAux ss_up1Aux; rw [ih (by omega)]; rfl
  exact h 24 (Nat.le_refl 24)

private theorem ss_up2_eq_fast (a b : Fin 24) :
    ssUpTypeCounts [a, b] = ss_up2Aux a.val b.val (ss_adjTuple a) (ss_adjTuple b) 24 := by
  unfold ssUpTypeCounts; rw [ss_adj24_fun_eq]
  have h : ∀ k (hk : k ≤ 24),
      ssUpCountsAux ss_adjFast [a, b] k hk = ss_up2Aux a.val b.val (ss_adjTuple a) (ss_adjTuple b) k := by
    intro k hk; induction k with
    | zero => rfl
    | succ m ih => unfold ssUpCountsAux ss_up2Aux; rw [ih (by omega)]; rfl
  exact h 24 (Nat.le_refl 24)

private theorem ss_up3_eq_fast (a b c : Fin 24) :
    ssUpTypeCounts [a, b, c] =
      ss_up3Aux a.val b.val c.val (ss_adjTuple a) (ss_adjTuple b) (ss_adjTuple c) 24 := by
  unfold ssUpTypeCounts; rw [ss_adj24_fun_eq]
  have h : ∀ k (hk : k ≤ 24),
      ssUpCountsAux ss_adjFast [a, b, c] k hk =
        ss_up3Aux a.val b.val c.val (ss_adjTuple a) (ss_adjTuple b) (ss_adjTuple c) k := by
    intro k hk; induction k with
    | zero => rfl
    | succ m ih => unfold ssUpCountsAux ss_up3Aux; rw [ih (by omega)]; rfl
  exact h 24 (Nat.le_refl 24)

private theorem ss_cliques1_up_fast :
    cliques1_24.all (fun a => decide (ss_up1Aux a.val (ss_adjTuple a) 24 = (15, 8, 0, 0))) = true := by
  decide

private theorem ss_cliques2_up_fast :
    cliques2_24.all (fun ab =>
      decide (ss_up2Aux ab.1.val ab.2.val (ss_adjTuple ab.1) (ss_adjTuple ab.2) 24 = (11, 8, 3, 0))) = true := by
  decide

private theorem ss_cliques3_up_fast :
    cliques3_24.all (fun t =>
      decide (ss_up3Aux t.1.val t.2.1.val t.2.2.val
        (ss_adjTuple t.1) (ss_adjTuple t.2.1) (ss_adjTuple t.2.2) 24 = (9, 6, 6, 0))) = true := by
  decide

/-- Exact `{3,4,3,4}` Depth-1 upward neighbor-type multiplicity `M_up(k, t)` (`k, t ∈ {0, 1, 2, 3}`),
    certified across all 217 cliques of `Γ_24` in `thm_ss_d4_comm_cliques_and_transitions`. -/
def ssUpBound : Fin 4 → Fin 4 → Nat
  | ⟨0, _⟩, ⟨1, _⟩ => 24
  | ⟨1, _⟩, ⟨1, _⟩ => 15
  | ⟨1, _⟩, ⟨2, _⟩ => 8
  | ⟨2, _⟩, ⟨1, _⟩ => 11
  | ⟨2, _⟩, ⟨2, _⟩ => 8
  | ⟨2, _⟩, ⟨3, _⟩ => 3
  | ⟨3, _⟩, ⟨1, _⟩ => 9
  | ⟨3, _⟩, ⟨2, _⟩ => 6
  | ⟨3, _⟩, ⟨3, _⟩ => 6
  | _, _ => 0

/-- Headline Theorem 3 (Exhaustive 217-Clique `{3,4,3,4}` Right-Descent Partition):
    certifies over ALL `1 + 24 + 96 + 96 = 217` right-descent cliques of `Γ_24` (zero `K_4`s)
    the exact uniform neighbor partitions `(down, up1, up2, up3, up4)` of all 24 facets and
    their exact match with `ssUpBound` on canonical clique representatives `[], [0], [0,4], [0,4,8]`. -/
theorem thm_ss_d4_comm_cliques_and_transitions :
    cliques1_24.length = 24 ∧ cliques2_24.length = 96 ∧ cliques3_24.length = 96 ∧
    ssUpTypeCounts [] = (24, 0, 0, 0) ∧
    (cliques1_24.all (fun a => decide (ssUpTypeCounts [a] = (15, 8, 0, 0))) = true) ∧
    (cliques2_24.all (fun ab => decide (ssUpTypeCounts [ab.1, ab.2] = (11, 8, 3, 0))) = true) ∧
    (cliques3_24.all (fun t => decide (ssUpTypeCounts [t.1, t.2.1, t.2.2] = (9, 6, 6, 0))) = true) ∧
    (ssUpTypeCounts [] =
      (ssUpBound ⟨0, by decide⟩ ⟨1, by decide⟩, ssUpBound ⟨0, by decide⟩ ⟨2, by decide⟩,
       ssUpBound ⟨0, by decide⟩ ⟨3, by decide⟩, ssUpBound ⟨0, by decide⟩ ⟨0, by decide⟩) ∧
     ssUpTypeCounts [⟨0, by decide⟩] =
      (ssUpBound ⟨1, by decide⟩ ⟨1, by decide⟩, ssUpBound ⟨1, by decide⟩ ⟨2, by decide⟩,
       ssUpBound ⟨1, by decide⟩ ⟨3, by decide⟩, ssUpBound ⟨1, by decide⟩ ⟨0, by decide⟩) ∧
     ssUpTypeCounts [⟨0, by decide⟩, ⟨4, by decide⟩] =
      (ssUpBound ⟨2, by decide⟩ ⟨1, by decide⟩, ssUpBound ⟨2, by decide⟩ ⟨2, by decide⟩,
       ssUpBound ⟨2, by decide⟩ ⟨3, by decide⟩, ssUpBound ⟨2, by decide⟩ ⟨0, by decide⟩) ∧
     ssUpTypeCounts [⟨0, by decide⟩, ⟨4, by decide⟩, ⟨8, by decide⟩] =
      (ssUpBound ⟨3, by decide⟩ ⟨1, by decide⟩, ssUpBound ⟨3, by decide⟩ ⟨2, by decide⟩,
       ssUpBound ⟨3, by decide⟩ ⟨3, by decide⟩, ssUpBound ⟨3, by decide⟩ ⟨0, by decide⟩)) ∧
    (0 + 24 = 24 ∧ 1 + 15 + 8 = 24 ∧ 2 + 11 + 8 + 3 = 24 ∧ 3 + 9 + 6 + 6 = 24) := by
  have h1 : (fun a : Fin 24 => decide (ssUpTypeCounts [a] = (15, 8, 0, 0))) =
      (fun a : Fin 24 => decide (ss_up1Aux a.val (ss_adjTuple a) 24 = (15, 8, 0, 0))) := by
    funext a; rw [ss_up1_eq_fast a]
  have h2 : (fun ab : Fin 24 × Fin 24 => decide (ssUpTypeCounts [ab.1, ab.2] = (11, 8, 3, 0))) =
      (fun ab : Fin 24 × Fin 24 =>
        decide (ss_up2Aux ab.1.val ab.2.val (ss_adjTuple ab.1) (ss_adjTuple ab.2) 24 = (11, 8, 3, 0))) := by
    funext ab; rw [ss_up2_eq_fast ab.1 ab.2]
  have h3 : (fun t : Fin 24 × Fin 24 × Fin 24 => decide (ssUpTypeCounts [t.1, t.2.1, t.2.2] = (9, 6, 6, 0))) =
      (fun t : Fin 24 × Fin 24 × Fin 24 =>
        decide (ss_up3Aux t.1.val t.2.1.val t.2.2.val
          (ss_adjTuple t.1) (ss_adjTuple t.2.1) (ss_adjTuple t.2.2) 24 = (9, 6, 6, 0))) := by
    funext t; rw [ss_up3_eq_fast t.1 t.2.1 t.2.2]
  refine ⟨thm_24cell_clique_fvector.1, thm_24cell_clique_fvector.2.1,
    thm_24cell_clique_fvector.2.2.1, by decide, ?_, ?_, ?_,
    by rw [ss_up1_eq_fast, ss_up2_eq_fast, ss_up3_eq_fast]; decide, by decide⟩
  · rw [h1]; exact ss_cliques1_up_fast
  · rw [h2]; exact ss_cliques2_up_fast
  · rw [h3]; exact ss_cliques3_up_fast

/-- Exact Depth-1 shell-stratum cardinality `|V_{r, k}|` directly from `Vibe.CuspGrowth`:
    `N(r, 0) = a_0(r)`, `N(r, 1) = 24 a_1(r)`, `N(r, 2) = 96 a_2(r)`, `N(r, 3) = 96 a_3(r)`. -/
def ssStratumCount : Fin 4 → Nat → Nat
  | ⟨0, _⟩, r => foataA0 r
  | ⟨1, _⟩, r => 24 * foataA1 r
  | ⟨2, _⟩, r => 96 * foataA2 r
  | ⟨3, _⟩, r => 96 * foataA3 r

/-- Headline Theorem 4 (All-Depth Cartier-Foata 1-Step Markov Laws & Stratum Detailed Balance):
    for EVERY shell radius `r : Nat`, `a_2(r+1) = a_1(r) + 4 a_2(r) + 3 a_3(r)`,
    `a_3(r+1) = a_2(r) + 2 a_3(r)`, exact detailed balance `∑_j N(r, j) M_{j -> k} = k * N(r+1, k)`,
    and exact shell partition `∑_k N(r, k) = ballShell r`. -/
theorem thm_ss_foata_detailed_balance :
    (∀ r : Nat,
      foataA2 (r + 1) = foataA1 r + 4 * foataA2 r + 3 * foataA3 r ∧
      foataA3 (r + 1) = foataA2 r + 2 * foataA3 r) ∧
    (∀ r : Nat,
      24 * ssStratumCount ⟨0, by decide⟩ r + 15 * ssStratumCount ⟨1, by decide⟩ r +
        11 * ssStratumCount ⟨2, by decide⟩ r + 9 * ssStratumCount ⟨3, by decide⟩ r =
        1 * ssStratumCount ⟨1, by decide⟩ (r + 1) ∧
      8 * ssStratumCount ⟨1, by decide⟩ r + 8 * ssStratumCount ⟨2, by decide⟩ r +
        6 * ssStratumCount ⟨3, by decide⟩ r =
        2 * ssStratumCount ⟨2, by decide⟩ (r + 1) ∧
      3 * ssStratumCount ⟨2, by decide⟩ r + 6 * ssStratumCount ⟨3, by decide⟩ r =
        3 * ssStratumCount ⟨3, by decide⟩ (r + 1)) ∧
    (∀ r : Nat,
      ssStratumCount ⟨0, by decide⟩ r + ssStratumCount ⟨1, by decide⟩ r +
        ssStratumCount ⟨2, by decide⟩ r + ssStratumCount ⟨3, by decide⟩ r = ballShell r) := by
  have hPair : ∀ r : Nat,
      (foataA2 (r + 1) = foataA1 r + 4 * foataA2 r + 3 * foataA3 r ∧
       foataA3 (r + 1) = foataA2 r + 2 * foataA3 r) ∧
      (foataA2 (r + 2) = foataA1 (r + 1) + 4 * foataA2 (r + 1) + 3 * foataA3 (r + 1) ∧
       foataA3 (r + 2) = foataA2 (r + 1) + 2 * foataA3 (r + 1)) := by
    intro r
    induction r with
    | zero => decide
    | succ m ih =>
      obtain ⟨⟨h2_0, h3_0⟩, ⟨h2_1, h3_1⟩⟩ := ih
      refine ⟨⟨h2_1, h3_1⟩, ⟨?_, ?_⟩⟩
      · have s1 : foataA1 (m + 2) =
            foataA0 (m + 1) + 15 * foataA1 (m + 1) + 44 * foataA2 (m + 1) + 36 * foataA3 (m + 1) := rfl
        have s2 : foataA2 (m + 3) =
            foataA0 (m + 1) + 19 * foataA1 (m + 1) + 63 * foataA2 (m + 1) + 54 * foataA3 (m + 1) := rfl
        change foataA2 (m + 3) = foataA1 (m + 2) + 4 * foataA2 (m + 2) + 3 * foataA3 (m + 2)
        omega
      · have s2 : foataA2 (m + 2) = foataA0 m + 19 * foataA1 m + 63 * foataA2 m + 54 * foataA3 m := rfl
        have s3 : foataA3 (m + 3) = foataA0 m + 21 * foataA1 m + 75 * foataA2 m + 68 * foataA3 m := rfl
        change foataA3 (m + 3) = foataA2 (m + 2) + 2 * foataA3 (m + 2)
        omega
  refine ⟨fun r => (hPair r).1, ?_, fun _ => rfl⟩
  intro r
  obtain ⟨h2, h3⟩ := (hPair r).1
  have s1 : foataA1 (r + 1) = foataA0 r + 15 * foataA1 r + 44 * foataA2 r + 36 * foataA3 r := rfl
  change (24 * foataA0 r + 15 * (24 * foataA1 r) + 11 * (96 * foataA2 r) + 9 * (96 * foataA3 r) =
            1 * (24 * foataA1 (r + 1))) ∧
         (8 * (24 * foataA1 r) + 8 * (96 * foataA2 r) + 6 * (96 * foataA3 r) =
            2 * (96 * foataA2 (r + 1))) ∧
         (3 * (96 * foataA2 r) + 6 * (96 * foataA3 r) =
            3 * (96 * foataA3 (r + 1)))
  exact ⟨by omega, by omega, by omega⟩


/-! ## Section 3: Exact 3-Rational Upper Bounds (`335/28 < 12`, `3325977059/278900000`) & Subgraph Bridge -/

/-- Parameterized Depth-1 Nagnibeda Schur row sum `S_k(a_1, a_2, a_3)` for `k ∈ {0, 1, 2, 3}`
    from the exact 217-clique counts `(0,24,0,0), (1,15,8,0), (2,11,8,3), (3,9,6,6)`. -/
def ssDepth1RowSum (a1 a2 a3 : QPos) (h1 : 0 < a1.num) (h2 : 0 < a2.num) (h3 : 0 < a3.num) :
    Fin 4 → QPos
  | ⟨0, _⟩ => ssQPosScaleInt 24 a1
  | ⟨1, _⟩ => QPos.add (QPos.add (ssQPosInv a1 h1) (ssQPosScaleInt 15 a1)) (ssQPosScaleInt 8 a2)
  | ⟨2, _⟩ =>
      QPos.add (QPos.add (ssQPosScaleInt 2 (ssQPosInv a2 h2)) (ssQPosScaleInt 11 a1))
               (QPos.add (ssQPosScaleInt 8 a2) (ssQPosScaleInt 3 a3))
  | ⟨3, _⟩ =>
      QPos.add (QPos.add (ssQPosScaleInt 3 (ssQPosInv a3 h3)) (ssQPosScaleInt 9 a1))
               (QPos.add (ssQPosScaleInt 6 a2) (ssQPosScaleInt 6 a3))

/-- Single-digit 3-rational row sums for `(a_1, a_2, a_3) = (1/7, 1/3, 4/7)`. -/
def ssSimpleRowSum (k : Fin 4) : QPos :=
  ssDepth1RowSum ⟨1, 7, by decide⟩ ⟨1, 3, by decide⟩ ⟨4, 7, by decide⟩
    (by decide) (by decide) (by decide) k

/-- Refined `Q = 100000` 3-rational row sums for `(13945/100000, 33282/100000, 57314/100000)`. -/
def ssRefinedRowSum (k : Fin 4) : QPos :=
  ssDepth1RowSum ⟨13945, 100000, by decide⟩ ⟨33282, 100000, by decide⟩ ⟨57314, 100000, by decide⟩
    (by decide) (by decide) (by decide) k

/-- Headline Theorem 5 (Single-Digit 3-Rational Row-Sum Certificate `a = (1/7, 1/3, 4/7) → 335/28`):
    `S_0 = 24/7`, `S_1 = 248/21`, `S_2 = 251/21`, `S_3 = 335/28`, and `∀ k : Fin 4, S_k ≤ 335/28`. -/
theorem thm_ss_three_rational_row_sums :
    QPos.eq (ssSimpleRowSum ⟨0, by decide⟩) ⟨24, 7, by decide⟩ ∧
    QPos.eq (ssSimpleRowSum ⟨1, by decide⟩) ⟨248, 21, by decide⟩ ∧
    QPos.eq (ssSimpleRowSum ⟨2, by decide⟩) ⟨251, 21, by decide⟩ ∧
    QPos.eq (ssSimpleRowSum ⟨3, by decide⟩) ⟨335, 28, by decide⟩ ∧
    (∀ k : Fin 4, QPos.le (ssSimpleRowSum k) ⟨335, 28, by decide⟩) := by
  refine ⟨by unfold QPos.eq; decide, by unfold QPos.eq; decide,
          by unfold QPos.eq; decide, by unfold QPos.eq; decide, by unfold QPos.le; decide⟩

/-- Headline Theorem 6 (Strict Upper Bound `max_k S_k = 335/28 < 12` Beating `Vibe.SchurGap`'s `104/7` by `81/28`):
    tied directly to `ssSimpleRowSum`: every `S_k ≤ 335/28 < 12` (`335 < 336`), attained at `S_3 = 335/28`,
    and `S_3 + 81/28 = 104/7` (`335/28 < 104/7`). -/
theorem thm_ss_spectral_radius_lt_12 :
    (∀ k : Fin 4, QPos.le (ssSimpleRowSum k) ⟨335, 28, by decide⟩) ∧
    QPos.eq (ssSimpleRowSum ⟨3, by decide⟩) ⟨335, 28, by decide⟩ ∧
    (∀ k : Fin 4, QPos.le (ssSimpleRowSum k) ⟨12, 1, by decide⟩) ∧
    (335 * 1 < 12 * 28) ∧
    QPos.eq (QPos.add (ssSimpleRowSum ⟨3, by decide⟩) ⟨81, 28, by decide⟩) ⟨104, 7, by decide⟩ ∧
    (335 * 7 < 104 * 28) := by
  refine ⟨thm_ss_three_rational_row_sums.2.2.2.2, thm_ss_three_rational_row_sums.2.2.2.1,
          by unfold QPos.le; decide, by decide, by unfold QPos.eq; decide, by decide⟩

/-- Headline Theorem 7 (Normalized Random-Walk Radius `< 1/2` & Laplacian Spectral Gap `> 1/2`):
    tied directly to `ssSimpleRowSum k / 24`: `∀ k, S_k / 24 ≤ 335/672 < 1/2` (`670 < 672`),
    `S_3 / 24 + 337/672 = 1` (`λ_gap ≥ 337/672 > 1/2`), strictly improving `Vibe.SchurGap`'s `8/21`
    by `81/672` (`8/21 + 81/672 = 337/672`). -/
theorem thm_ss_normalized_gap_gt_half :
    (∀ k : Fin 4, QPos.le (QPos.divPos (ssSimpleRowSum k) 24 (by decide)) ⟨335, 672, by decide⟩) ∧
    QPos.eq (QPos.divPos (ssSimpleRowSum ⟨3, by decide⟩) 24 (by decide)) ⟨335, 672, by decide⟩ ∧
    QPos.le ⟨335, 672, by decide⟩ ⟨1, 2, by decide⟩ ∧ (335 * 2 < 1 * 672) ∧
    QPos.eq (QPos.add (QPos.divPos (ssSimpleRowSum ⟨3, by decide⟩) 24 (by decide)) ⟨337, 672, by decide⟩)
            ⟨1, 1, by decide⟩ ∧
    (1 * 672 < 337 * 2) ∧
    QPos.eq (QPos.add ⟨8, 21, by decide⟩ ⟨81, 672, by decide⟩) ⟨337, 672, by decide⟩ := by
  refine ⟨by unfold QPos.le; decide, by unfold QPos.eq; decide,
          by unfold QPos.le; decide, by decide,
          by unfold QPos.eq; decide, by decide, by unfold QPos.eq; decide⟩

/-- Headline Theorem 8 (Refined 3-Rational Bound `max_k S_k = 3325977059 / 278900000 < 11.9254 < 335/28`):
    for `(a_1, a_2, a_3) = (13945/100000, 33282/100000, 57314/100000)`, all 4 exact rational row sums
    satisfy `S_k ≤ 3325977059 / 278900000 < 119254 / 10000 < 335 / 28`, with normalized spectral gap
    `1 - S_1/24 = 3367622941 / 6693600000 > 337/672 > 1/2`. -/
theorem thm_ss_refined_3rat_bound :
    QPos.eq (ssRefinedRowSum ⟨0, by decide⟩) ⟨8367, 2500, by decide⟩ ∧
    QPos.eq (ssRefinedRowSum ⟨1, by decide⟩) ⟨3325977059, 278900000, by decide⟩ ∧
    QPos.eq (ssRefinedRowSum ⟨2, by decide⟩) ⟨19844699113, 1664100000, by decide⟩ ∧
    QPos.eq (ssRefinedRowSum ⟨3, by decide⟩) ⟨34173854217, 2865700000, by decide⟩ ∧
    (∀ k : Fin 4, QPos.le (ssRefinedRowSum k) ⟨3325977059, 278900000, by decide⟩) ∧
    (3325977059 * 10000 < 119254 * 278900000) ∧ (119254 * 28 < 335 * 10000) ∧
    QPos.eq (QPos.add (QPos.divPos (ssRefinedRowSum ⟨1, by decide⟩) 24 (by decide))
                      ⟨3367622941, 6693600000, by decide⟩) ⟨1, 1, by decide⟩ ∧
    (337 * 6693600000 < 3367622941 * 672) := by
  refine ⟨by unfold QPos.eq; decide, by unfold QPos.eq; decide,
          by unfold QPos.eq; decide, by unfold QPos.eq; decide, by unfold QPos.le; decide,
          by decide, by decide, by unfold QPos.eq; decide, by decide⟩

private def ss_wUp (D u1 u2 u3 : Int) : Fin 4 → Int
  | ⟨0, _⟩ => D
  | ⟨1, _⟩ => u1
  | ⟨2, _⟩ => u2
  | ⟨3, _⟩ => u3

private def ss_wDn (D d1 d2 d3 : Int) : Fin 4 → Int
  | ⟨0, _⟩ => D
  | ⟨1, _⟩ => d1
  | ⟨2, _⟩ => d2
  | ⟨3, _⟩ => d3

/-- Integer-scaled Depth-1 reciprocal edge weights `W(i → j) = D * w(i → j)` on any bipartite RACG
    subgraph `(Fin n, A, depth, ctype)`: upward edges take `u_{|D(j)|}`, downward edges take `d_{|D(i)|}`. -/
def ssDepth1WeightInt (D u1 d1 u2 d2 u3 d3 : Int)
    {n : Nat} (depth : Fin n → Nat) (ctype : Fin n → Fin 4) (i j : Fin n) : Int :=
  if depth j = depth i + 1 then ss_wUp D u1 u2 u3 (ctype j)
  else if depth i = depth j + 1 then ss_wDn D d1 d2 d3 (ctype i)
  else D

/-- Cleared-denominator Depth-1 row sum `D * S_k` for `(u_1, d_1, u_2, d_2, u_3, d_3)`. -/
def ssDepth1RowInt (u1 d1 u2 d2 u3 d3 : Int) : Fin 4 → Int
  | ⟨0, _⟩ => 24 * u1
  | ⟨1, _⟩ => d1 + 15 * u1 + 8 * u2
  | ⟨2, _⟩ => 2 * d2 + 11 * u1 + 8 * u2 + 3 * u3
  | ⟨3, _⟩ => 3 * d3 + 9 * u1 + 6 * u2 + 6 * u3

/-- Number of downward neighbors (`depth j + 1 = depth i`) of vertex `i`. -/
def ssDownDeg {n : Nat} (A : Fin n → Fin n → Bool) (depth : Fin n → Nat) (i : Fin n) : Int :=
  ssSumFin (fun j : Fin n => if A i j = true then (if depth i = depth j + 1 then 1 else 0) else 0)

/-- Number of upward neighbors (`depth j = depth i + 1`) of vertex `i` having clique type `t`. -/
def ssUpDegTo {n : Nat} (A : Fin n → Fin n → Bool) (depth : Fin n → Nat)
    (ctype : Fin n → Fin 4) (i : Fin n) (t : Fin 4) : Int :=
  ssSumFin (fun j : Fin n =>
    if A i j = true then (if depth j = depth i + 1 then (if ctype j = t then 1 else 0) else 0) else 0)

/-- Concrete 25-vertex `R = 1` ball (24-regular star around the base 24-cell `0`, leaves `1..24`). -/
def ssBall1Adj (i j : Fin 25) : Bool := (i.val == 0 && j.val != 0) || (j.val == 0 && i.val != 0)
def ssBall1Depth (i : Fin 25) : Nat := if i.val == 0 then 0 else 1
def ssBall1Type (i : Fin 25) : Fin 4 := if i.val == 0 then ⟨0, by decide⟩ else ⟨1, by decide⟩

private theorem ss_fin4_decomp (k : Fin 4) (v0 v1 v2 v3 : Int) :
    ss_wUp v0 v1 v2 v3 k =
      (if k = ⟨0, by decide⟩ then 1 else 0) * v0 +
      ((if k = ⟨1, by decide⟩ then 1 else 0) * v1 +
       ((if k = ⟨2, by decide⟩ then 1 else 0) * v2 +
        (if k = ⟨3, by decide⟩ then 1 else 0) * v3)) := by
  match k with
  | ⟨0, _⟩ =>
    have e0 : (⟨0, by decide⟩ : Fin 4) = ⟨0, by decide⟩ := rfl
    have n1 : (⟨0, by decide⟩ : Fin 4) ≠ ⟨1, by decide⟩ := by decide
    have n2 : (⟨0, by decide⟩ : Fin 4) ≠ ⟨2, by decide⟩ := by decide
    have n3 : (⟨0, by decide⟩ : Fin 4) ≠ ⟨3, by decide⟩ := by decide
    change v0 = (if (⟨0, by decide⟩ : Fin 4) = ⟨0, by decide⟩ then 1 else 0) * v0 +
      ((if (⟨0, by decide⟩ : Fin 4) = ⟨1, by decide⟩ then 1 else 0) * v1 +
       ((if (⟨0, by decide⟩ : Fin 4) = ⟨2, by decide⟩ then 1 else 0) * v2 +
        (if (⟨0, by decide⟩ : Fin 4) = ⟨3, by decide⟩ then 1 else 0) * v3))
    rw [ss_ite_pos e0, ss_ite_neg n1, ss_ite_neg n2, ss_ite_neg n3,
        Int.one_mul, Int.zero_mul, Int.zero_mul, Int.zero_mul]; omega
  | ⟨1, _⟩ =>
    have n0 : (⟨1, by decide⟩ : Fin 4) ≠ ⟨0, by decide⟩ := by decide
    have e1 : (⟨1, by decide⟩ : Fin 4) = ⟨1, by decide⟩ := rfl
    have n2 : (⟨1, by decide⟩ : Fin 4) ≠ ⟨2, by decide⟩ := by decide
    have n3 : (⟨1, by decide⟩ : Fin 4) ≠ ⟨3, by decide⟩ := by decide
    change v1 = (if (⟨1, by decide⟩ : Fin 4) = ⟨0, by decide⟩ then 1 else 0) * v0 +
      ((if (⟨1, by decide⟩ : Fin 4) = ⟨1, by decide⟩ then 1 else 0) * v1 +
       ((if (⟨1, by decide⟩ : Fin 4) = ⟨2, by decide⟩ then 1 else 0) * v2 +
        (if (⟨1, by decide⟩ : Fin 4) = ⟨3, by decide⟩ then 1 else 0) * v3))
    rw [ss_ite_neg n0, ss_ite_pos e1, ss_ite_neg n2, ss_ite_neg n3,
        Int.one_mul, Int.zero_mul, Int.zero_mul, Int.zero_mul]; omega
  | ⟨2, _⟩ =>
    have n0 : (⟨2, by decide⟩ : Fin 4) ≠ ⟨0, by decide⟩ := by decide
    have n1 : (⟨2, by decide⟩ : Fin 4) ≠ ⟨1, by decide⟩ := by decide
    have e2 : (⟨2, by decide⟩ : Fin 4) = ⟨2, by decide⟩ := rfl
    have n3 : (⟨2, by decide⟩ : Fin 4) ≠ ⟨3, by decide⟩ := by decide
    change v2 = (if (⟨2, by decide⟩ : Fin 4) = ⟨0, by decide⟩ then 1 else 0) * v0 +
      ((if (⟨2, by decide⟩ : Fin 4) = ⟨1, by decide⟩ then 1 else 0) * v1 +
       ((if (⟨2, by decide⟩ : Fin 4) = ⟨2, by decide⟩ then 1 else 0) * v2 +
        (if (⟨2, by decide⟩ : Fin 4) = ⟨3, by decide⟩ then 1 else 0) * v3))
    rw [ss_ite_neg n0, ss_ite_neg n1, ss_ite_pos e2, ss_ite_neg n3,
        Int.one_mul, Int.zero_mul, Int.zero_mul, Int.zero_mul]; omega
  | ⟨3, _⟩ =>
    have n0 : (⟨3, by decide⟩ : Fin 4) ≠ ⟨0, by decide⟩ := by decide
    have n1 : (⟨3, by decide⟩ : Fin 4) ≠ ⟨1, by decide⟩ := by decide
    have n2 : (⟨3, by decide⟩ : Fin 4) ≠ ⟨2, by decide⟩ := by decide
    have e3 : (⟨3, by decide⟩ : Fin 4) = ⟨3, by decide⟩ := rfl
    change v3 = (if (⟨3, by decide⟩ : Fin 4) = ⟨0, by decide⟩ then 1 else 0) * v0 +
      ((if (⟨3, by decide⟩ : Fin 4) = ⟨1, by decide⟩ then 1 else 0) * v1 +
       ((if (⟨3, by decide⟩ : Fin 4) = ⟨2, by decide⟩ then 1 else 0) * v2 +
        (if (⟨3, by decide⟩ : Fin 4) = ⟨3, by decide⟩ then 1 else 0) * v3))
    rw [ss_ite_neg n0, ss_ite_neg n1, ss_ite_neg n2, ss_ite_pos e3,
        Int.one_mul, Int.zero_mul, Int.zero_mul, Int.zero_mul]; omega

private theorem ss_rowSum_le_from_deg (D u1 d1 u2 d2 u3 d3 : Int)
    (hD : 0 < D) (hu1 : 0 < u1) (hd1 : 0 < d1) (hu2 : 0 < u2) (hd2 : 0 < d2) (hu3 : 0 < u3) (hd3 : 0 < d3)
    {n : Nat} (A : Fin n → Fin n → Bool) (depth : Fin n → Nat) (ctype : Fin n → Fin 4)
    (hBip : ∀ i j : Fin n, A i j = true → depth j = depth i + 1 ∨ depth i = depth j + 1)
    (hDown : ∀ i : Fin n, ssDownDeg A depth i ≤ Int.ofNat (ctype i).val)
    (hUp : ∀ (i : Fin n) (t : Fin 4), ssUpDegTo A depth ctype i t ≤ Int.ofNat (ssUpBound (ctype i) t))
    (i : Fin n) :
    ssRowSumInt A (ssDepth1WeightInt D u1 d1 u2 d2 u3 d3 depth ctype) i ≤
      ssDepth1RowInt u1 d1 u2 d2 u3 d3 (ctype i) := by
  have hPt : ∀ j : Fin n,
      (if A i j = true then ssDepth1WeightInt D u1 d1 u2 d2 u3 d3 depth ctype i j else 0) =
      (if A i j = true then (if depth i = depth j + 1 then 1 else 0) else 0) * ss_wDn D d1 d2 d3 (ctype i) +
      ((if A i j = true then (if depth j = depth i + 1 then (if ctype j = ⟨0, by decide⟩ then 1 else 0) else 0) else 0) * D +
       ((if A i j = true then (if depth j = depth i + 1 then (if ctype j = ⟨1, by decide⟩ then 1 else 0) else 0) else 0) * u1 +
        ((if A i j = true then (if depth j = depth i + 1 then (if ctype j = ⟨2, by decide⟩ then 1 else 0) else 0) else 0) * u2 +
         (if A i j = true then (if depth j = depth i + 1 then (if ctype j = ⟨3, by decide⟩ then 1 else 0) else 0) else 0) * u3))) := by
    intro j
    if hA : A i j = true then
      rw [ss_ite_pos hA, ss_ite_pos hA, ss_ite_pos hA, ss_ite_pos hA, ss_ite_pos hA, ss_ite_pos hA]
      unfold ssDepth1WeightInt
      cases hBip i j hA with
      | inl hUpJ =>
        have hNotDn : ¬ (depth i = depth j + 1) := by omega
        rw [ss_ite_pos hUpJ, ss_ite_neg hNotDn, ss_ite_pos hUpJ, ss_ite_pos hUpJ, ss_ite_pos hUpJ,
            ss_ite_pos hUpJ, Int.zero_mul, Int.zero_add]
        exact ss_fin4_decomp (ctype j) D u1 u2 u3
      | inr hDnJ =>
        have hNotUp : ¬ (depth j = depth i + 1) := by omega
        rw [ss_ite_neg hNotUp, ss_ite_pos hDnJ, ss_ite_pos hDnJ, ss_ite_neg hNotUp, ss_ite_neg hNotUp,
            ss_ite_neg hNotUp, ss_ite_neg hNotUp, Int.one_mul, Int.zero_mul, Int.zero_mul,
            Int.zero_mul, Int.zero_mul]
        omega
    else
      rw [ss_ite_neg hA, ss_ite_neg hA, ss_ite_neg hA, ss_ite_neg hA, ss_ite_neg hA, ss_ite_neg hA,
          Int.zero_mul, Int.zero_mul, Int.zero_mul, Int.zero_mul, Int.zero_mul]
      omega
  have hDecomp : ssRowSumInt A (ssDepth1WeightInt D u1 d1 u2 d2 u3 d3 depth ctype) i =
      ssDownDeg A depth i * ss_wDn D d1 d2 d3 (ctype i) +
      (ssUpDegTo A depth ctype i ⟨0, by decide⟩ * D +
       (ssUpDegTo A depth ctype i ⟨1, by decide⟩ * u1 +
        (ssUpDegTo A depth ctype i ⟨2, by decide⟩ * u2 +
         ssUpDegTo A depth ctype i ⟨3, by decide⟩ * u3))) := by
    unfold ssRowSumInt
    rw [funext hPt, ss_sumFin_add, ss_sumFin_add, ss_sumFin_add, ss_sumFin_add,
        ss_sumFin_mul_right, ss_sumFin_mul_right, ss_sumFin_mul_right,
        ss_sumFin_mul_right, ss_sumFin_mul_right]
    rfl
  rw [hDecomp]
  have hwDnPos : 0 ≤ ss_wDn D d1 d2 d3 (ctype i) := by
    match ctype i with
    | ⟨0, _⟩ => change 0 ≤ D; omega
    | ⟨1, _⟩ => change 0 ≤ d1; omega
    | ⟨2, _⟩ => change 0 ≤ d2; omega
    | ⟨3, _⟩ => change 0 ≤ d3; omega
  have bD := ss_int_mul_le_right _ _ (ss_wDn D d1 d2 d3 (ctype i)) (hDown i) hwDnPos
  have b0 := ss_int_mul_le_right _ _ D (hUp i ⟨0, by decide⟩) (by omega)
  have b1 := ss_int_mul_le_right _ _ u1 (hUp i ⟨1, by decide⟩) (by omega)
  have b2 := ss_int_mul_le_right _ _ u2 (hUp i ⟨2, by decide⟩) (by omega)
  have b3 := ss_int_mul_le_right _ _ u3 (hUp i ⟨3, by decide⟩) (by omega)
  match hc : ctype i with
  | ⟨0, _⟩ =>
    rw [hc] at bD b0 b1 b2 b3
    change ssDownDeg A depth i * D ≤ 0 * D at bD
    change ssUpDegTo A depth ctype i ⟨0, by decide⟩ * D ≤ 0 * D at b0
    change ssUpDegTo A depth ctype i ⟨1, by decide⟩ * u1 ≤ 24 * u1 at b1
    change ssUpDegTo A depth ctype i ⟨2, by decide⟩ * u2 ≤ 0 * u2 at b2
    change ssUpDegTo A depth ctype i ⟨3, by decide⟩ * u3 ≤ 0 * u3 at b3
    change ssDownDeg A depth i * D + _ ≤ 24 * u1
    omega
  | ⟨1, _⟩ =>
    rw [hc] at bD b0 b1 b2 b3
    change ssDownDeg A depth i * d1 ≤ 1 * d1 at bD
    change ssUpDegTo A depth ctype i ⟨0, by decide⟩ * D ≤ 0 * D at b0
    change ssUpDegTo A depth ctype i ⟨1, by decide⟩ * u1 ≤ 15 * u1 at b1
    change ssUpDegTo A depth ctype i ⟨2, by decide⟩ * u2 ≤ 8 * u2 at b2
    change ssUpDegTo A depth ctype i ⟨3, by decide⟩ * u3 ≤ 0 * u3 at b3
    change ssDownDeg A depth i * d1 + _ ≤ d1 + 15 * u1 + 8 * u2
    omega
  | ⟨2, _⟩ =>
    rw [hc] at bD b0 b1 b2 b3
    change ssDownDeg A depth i * d2 ≤ 2 * d2 at bD
    change ssUpDegTo A depth ctype i ⟨0, by decide⟩ * D ≤ 0 * D at b0
    change ssUpDegTo A depth ctype i ⟨1, by decide⟩ * u1 ≤ 11 * u1 at b1
    change ssUpDegTo A depth ctype i ⟨2, by decide⟩ * u2 ≤ 8 * u2 at b2
    change ssUpDegTo A depth ctype i ⟨3, by decide⟩ * u3 ≤ 3 * u3 at b3
    change ssDownDeg A depth i * d2 + _ ≤ 2 * d2 + 11 * u1 + 8 * u2 + 3 * u3
    omega
  | ⟨3, _⟩ =>
    rw [hc] at bD b0 b1 b2 b3
    change ssDownDeg A depth i * d3 ≤ 3 * d3 at bD
    change ssUpDegTo A depth ctype i ⟨0, by decide⟩ * D ≤ 0 * D at b0
    change ssUpDegTo A depth ctype i ⟨1, by decide⟩ * u1 ≤ 9 * u1 at b1
    change ssUpDegTo A depth ctype i ⟨2, by decide⟩ * u2 ≤ 6 * u2 at b2
    change ssUpDegTo A depth ctype i ⟨3, by decide⟩ * u3 ≤ 6 * u3 at b3
    change ssDownDeg A depth i * d3 + _ ≤ 3 * d3 + 9 * u1 + 6 * u2 + 6 * u3
    omega

private theorem ss_depth1_int_pos_rec (D u1 d1 u2 d2 u3 d3 : Int)
    (hD : 0 < D) (hu1 : 0 < u1) (hd1 : 0 < d1) (hu2 : 0 < u2) (hd2 : 0 < d2) (hu3 : 0 < u3) (hd3 : 0 < d3)
    (hr1 : u1 * d1 = D * D) (hr2 : u2 * d2 = D * D) (hr3 : u3 * d3 = D * D)
    {n : Nat} (A : Fin n → Fin n → Bool) (depth : Fin n → Nat) (ctype : Fin n → Fin 4)
    (hBip : ∀ i j : Fin n, A i j = true → depth j = depth i + 1 ∨ depth i = depth j + 1) :
    (∀ i j : Fin n, 0 < ssDepth1WeightInt D u1 d1 u2 d2 u3 d3 depth ctype i j) ∧
    (∀ i j : Fin n, A i j = true →
      ssDepth1WeightInt D u1 d1 u2 d2 u3 d3 depth ctype i j *
      ssDepth1WeightInt D u1 d1 u2 d2 u3 d3 depth ctype j i = D * D) := by
  constructor
  · intro i j; unfold ssDepth1WeightInt
    if hUp : depth j = depth i + 1 then
      rw [ss_ite_pos hUp]
      match ctype j with
      | ⟨0, _⟩ => exact hD
      | ⟨1, _⟩ => exact hu1
      | ⟨2, _⟩ => exact hu2
      | ⟨3, _⟩ => exact hu3
    else
      rw [ss_ite_neg hUp]
      if hDn : depth i = depth j + 1 then
        rw [ss_ite_pos hDn]
        match ctype i with
        | ⟨0, _⟩ => exact hD
        | ⟨1, _⟩ => exact hd1
        | ⟨2, _⟩ => exact hd2
        | ⟨3, _⟩ => exact hd3
      else rw [ss_ite_neg hDn]; exact hD
  · intro i j hA; unfold ssDepth1WeightInt
    cases hBip i j hA with
    | inl hUp =>
      have hNotDn : ¬ (depth i = depth j + 1) := by omega
      rw [ss_ite_pos hUp, ss_ite_neg hNotDn, ss_ite_pos hUp]
      match ctype j with
      | ⟨0, _⟩ => rfl
      | ⟨1, _⟩ => exact hr1
      | ⟨2, _⟩ => exact hr2
      | ⟨3, _⟩ => exact hr3
    | inr hDn =>
      have hNotUp : ¬ (depth j = depth i + 1) := by omega
      rw [ss_ite_neg hNotUp, ss_ite_pos hDn, ss_ite_pos hDn]
      match ctype i with
      | ⟨0, _⟩ => rfl
      | ⟨1, _⟩ => rw [Int.mul_comm]; exact hr1
      | ⟨2, _⟩ => rw [Int.mul_comm]; exact hr2
      | ⟨3, _⟩ => rw [Int.mul_comm]; exact hr3

private theorem ss_racg_subgraph_core {n : Nat}
    (A : Fin n → Fin n → Bool) (hSym : ∀ i j : Fin n, A i j = A j i)
    (depth : Fin n → Nat) (ctype : Fin n → Fin 4)
    (hBip : ∀ i j : Fin n, A i j = true → depth j = depth i + 1 ∨ depth i = depth j + 1)
    (hDown : ∀ i : Fin n, ssDownDeg A depth i ≤ Int.ofNat (ctype i).val)
    (hUp : ∀ (i : Fin n) (t : Fin 4), ssUpDegTo A depth ctype i t ≤ Int.ofNat (ssUpBound (ctype i) t))
    (x : Fin n → Int) :
    (28 * ssQuadForm A x ≤ 335 * ssNormSq x ∧ -(28 * ssQuadForm A x) ≤ 335 * ssNormSq x) ∧
    (278900000 * ssQuadForm A x ≤ 3325977059 * ssNormSq x ∧
     -(278900000 * ssQuadForm A x) ≤ 3325977059 * ssNormSq x) := by
  have hS := ss_depth1_int_pos_rec 84 12 588 28 252 48 147
    (by decide) (by decide) (by decide) (by decide) (by decide) (by decide) (by decide)
    (by decide) (by decide) (by decide) A depth ctype hBip
  have hSMax : ∀ k : Fin 4, ssDepth1RowInt 12 588 28 252 48 147 k ≤ 1005 := by decide
  have hRowS : ∀ i : Fin n, ssRowSumInt A (ssDepth1WeightInt 84 12 588 28 252 48 147 depth ctype) i ≤ 1005 :=
    fun i => Int.le_trans
      (ss_rowSum_le_from_deg 84 12 588 28 252 48 147
        (by decide) (by decide) (by decide) (by decide) (by decide) (by decide) (by decide)
        A depth ctype hBip hDown hUp i)
      (hSMax (ctype i))
  have hSB := thm_ss_finite_reciprocal_schur_bound A hSym 84 (by decide) _ hS.1 hS.2 1005 hRowS x
  have hR := ss_depth1_int_pos_rec 133002149109300000
    18547149693291885 953762274000000000 44265775266557226 399621865000000000
    76228851740504202 232058745000000000
    (by decide) (by decide) (by decide) (by decide) (by decide) (by decide) (by decide)
    (by decide) (by decide) (by decide) A depth ctype hBip
  have hRMax : ∀ k : Fin 4, ssDepth1RowInt 18547149693291885 953762274000000000
      44265775266557226 399621865000000000 76228851740504202 232058745000000000 k ≤
      1586095721531836083 := by decide
  have hRowR : ∀ i : Fin n, ssRowSumInt A (ssDepth1WeightInt 133002149109300000
      18547149693291885 953762274000000000 44265775266557226 399621865000000000
      76228851740504202 232058745000000000 depth ctype) i ≤ 1586095721531836083 :=
    fun i => Int.le_trans
      (ss_rowSum_le_from_deg 133002149109300000
        18547149693291885 953762274000000000 44265775266557226 399621865000000000
        76228851740504202 232058745000000000
        (by decide) (by decide) (by decide) (by decide) (by decide) (by decide) (by decide)
        A depth ctype hBip hDown hUp i)
      (hRMax (ctype i))
  have hRB := thm_ss_finite_reciprocal_schur_bound A hSym 133002149109300000 (by decide) _
    hR.1 hR.2 1586095721531836083 hRowR x
  have hDiv : ∀ (a b c d k q m : Int), 0 < k → a * k = c → b * k = d → c * q ≤ d * m → a * q ≤ b * m := by
    intro a b c d k q m hk hac hbd h
    apply ss_int_le_of_mul_le_right (a * q) (b * m) k hk
    rw [ss_int_mul_right_comm a q k, hac, ss_int_mul_right_comm b m k, hbd]
    exact h
  have hDivNeg : ∀ (a b c d k q m : Int), 0 < k → a * k = c → b * k = d → -(c * q) ≤ d * m → -(a * q) ≤ b * m := by
    intro a b c d k q m hk hac hbd h
    apply ss_int_le_of_mul_le_right (-(a * q)) (b * m) k hk
    rw [Int.neg_mul, ss_int_mul_right_comm a q k, hac, ss_int_mul_right_comm b m k, hbd]
    exact h
  exact ⟨⟨hDiv 28 335 84 1005 3 _ _ (by decide) (by decide) (by decide) hSB.1,
          hDivNeg 28 335 84 1005 3 _ _ (by decide) (by decide) (by decide) hSB.2.1⟩,
         ⟨hDiv 278900000 3325977059 133002149109300000 1586095721531836083 476881137 _ _
            (by decide) (by decide) (by decide) hRB.1,
          hDivNeg 278900000 3325977059 133002149109300000 1586095721531836083 476881137 _ _
            (by decide) (by decide) (by decide) hRB.2.1⟩⟩

private theorem ss_ball1_structural :
    (∀ i j : Fin 25, ssBall1Adj i j = ssBall1Adj j i) ∧
    (∀ i j : Fin 25, ssBall1Adj i j = true →
      ssBall1Depth j = ssBall1Depth i + 1 ∨ ssBall1Depth i = ssBall1Depth j + 1) ∧
    (∀ i : Fin 25, ssDownDeg ssBall1Adj ssBall1Depth i ≤ Int.ofNat (ssBall1Type i).val) ∧
    (∀ (i : Fin 25) (t : Fin 4),
      ssUpDegTo ssBall1Adj ssBall1Depth ssBall1Type i t ≤ Int.ofNat (ssUpBound (ssBall1Type i) t)) := by
  decide

/-- Headline Theorem 9 (End-to-End Structural `{3,4,3,4}` RACG Subgraph Operator-Norm Bound + `R = 1` Non-Vacuity):
    1. From ONLY the purely structural Depth-1 RACG degree bounds `ssDownDeg i ≤ |D(i)|` and
       `ssUpDegTo i t ≤ ssUpBound |D(i)| t` (Theorem 3's exact 217-clique counts), EVERY finite
       symmetric bipartite induced subgraph/ball `(Fin n, A, depth, ctype)` obeys BOTH
       `28 * |⟨x, A x⟩| ≤ 335 * ⟨x, x⟩` AND `278900000 * |⟨x, A x⟩| ≤ 3325977059 * ⟨x, x⟩`
       for EVERY `x : Fin n → Int` (with zero pre-weighted hypotheses!).
    2. Concrete non-vacuity instantiation on the 25-vertex `R = 1` ball (`ssBall1Adj`, center of type `0`,
       24 leaves of type `1`): all structural hypotheses hold unconditionally and both bounds apply
       to every `x : Fin 25 → Int`. -/
theorem thm_ss_racg_subgraph_schur_bound :
    (∀ {n : Nat} (A : Fin n → Fin n → Bool) (_hSym : ∀ i j : Fin n, A i j = A j i)
       (depth : Fin n → Nat) (ctype : Fin n → Fin 4)
       (_hBip : ∀ i j : Fin n, A i j = true → depth j = depth i + 1 ∨ depth i = depth j + 1)
       (_hDown : ∀ i : Fin n, ssDownDeg A depth i ≤ Int.ofNat (ctype i).val)
       (_hUp : ∀ (i : Fin n) (t : Fin 4), ssUpDegTo A depth ctype i t ≤ Int.ofNat (ssUpBound (ctype i) t))
       (x : Fin n → Int),
       (28 * ssQuadForm A x ≤ 335 * ssNormSq x ∧ -(28 * ssQuadForm A x) ≤ 335 * ssNormSq x) ∧
       (278900000 * ssQuadForm A x ≤ 3325977059 * ssNormSq x ∧
        -(278900000 * ssQuadForm A x) ≤ 3325977059 * ssNormSq x)) ∧
    (∀ x : Fin 25 → Int,
       (28 * ssQuadForm ssBall1Adj x ≤ 335 * ssNormSq x ∧
        -(28 * ssQuadForm ssBall1Adj x) ≤ 335 * ssNormSq x) ∧
       (278900000 * ssQuadForm ssBall1Adj x ≤ 3325977059 * ssNormSq x ∧
        -(278900000 * ssQuadForm ssBall1Adj x) ≤ 3325977059 * ssNormSq x)) :=
  ⟨fun A hSym depth ctype hBip hDown hUp x =>
     ss_racg_subgraph_core A hSym depth ctype hBip hDown hUp x,
   fun x =>
     ss_racg_subgraph_core ssBall1Adj ss_ball1_structural.1 ssBall1Depth ssBall1Type
       ss_ball1_structural.2.1 ss_ball1_structural.2.2.1 ss_ball1_structural.2.2.2 x⟩


/-! ## Section 4: Stratum Rayleigh-Ritz Compression, Lower Witnesses (`ρ > 11`) & `(11, 12)` Bracket -/

/-- Exact stratum cardinality `|{i : Fin n | σ i = u}|`. -/
def ssStratumSize {n m : Nat} (σ : Fin n → Fin m) (u : Fin m) : Int :=
  ssSumFin (fun i : Fin n => if σ i = u then 1 else 0)

/-- Exact count of `A`-neighbors of vertex `i` lying in stratum `v`. -/
def ssDegTo {n m : Nat} (A : Fin n → Fin n → Bool) (σ : Fin n → Fin m) (i : Fin n) (v : Fin m) : Int :=
  ssSumFin (fun j : Fin n => if A i j = true then (if σ j = v then 1 else 0) else 0)

private theorem ss_sumFin_stratify {n m : Nat} (σ : Fin n → Fin m) (g : Fin m → Int) :
    ssSumFin (fun i : Fin n => g (σ i)) = ssSumFin (fun u : Fin m => ssStratumSize σ u * g u) := by
  have hStep : (fun i : Fin n => g (σ i)) =
      (fun i : Fin n => ssSumFin (fun u : Fin m => if σ i = u then g u else 0)) :=
    funext (fun i => (ss_sumFin_kronecker (σ i) g).symm)
  rw [hStep, ss_sumFin_swap]
  apply congrArg ssSumFin; funext u
  have hF : (fun i : Fin n => if σ i = u then g u else 0) =
      (fun i : Fin n => (if σ i = u then 1 else 0) * g u) := by
    funext i
    if h : σ i = u then rw [ss_ite_pos h, ss_ite_pos h, Int.one_mul]
    else rw [ss_ite_neg h, ss_ite_neg h, Int.zero_mul]
  rw [hF, ss_sumFin_mul_right]; rfl

/-- Headline Theorem 10 (Exact Upward-Only Bipartite Stratum-Compression Rayleigh-Ritz Identity):
    for ANY finite symmetric (`A i j = A j i`) bipartite (`depth (σ j) = depth (σ i) + 1` or reverse)
    graph partitioned into strata `σ : Fin n → Fin m` whose **upward-only** inter-stratum degrees
    are uniform (`depth v = depth (σ i) + 1 → ssDegTo A σ i v = M_up (σ i) v` — requiring NO
    downward degree uniformity, matching `{3,4,3,4}` Depth-1 strata!), EVERY stratum-constant vector
    `x_i = c (σ i)` obeys exact norm `⟨x, x⟩ = ∑_u N_u c_u^2` and exact quadratic form
    `⟨x, A x⟩ = 2 ∑_u N_u c_u ∑_{v : depth v = depth u + 1} M_up(u, v) c_v`. -/
theorem thm_ss_stratum_rayleigh_exact {n m : Nat}
    (A : Fin n → Fin n → Bool) (hSym : ∀ i j : Fin n, A i j = A j i)
    (σ : Fin n → Fin m) (depth : Fin m → Nat) (M_up : Fin m → Fin m → Int)
    (hBip : ∀ i j : Fin n, A i j = true →
      depth (σ j) = depth (σ i) + 1 ∨ depth (σ i) = depth (σ j) + 1)
    (hUpDeg : ∀ (i : Fin n) (v : Fin m), depth v = depth (σ i) + 1 →
      ssDegTo A σ i v = M_up (σ i) v)
    (c : Fin m → Int) :
    ssNormSq (fun i => c (σ i)) = ssSumFin (fun u => ssStratumSize σ u * (c u * c u)) ∧
    ssQuadForm A (fun i => c (σ i)) =
      2 * ssSumFin (fun u => ssStratumSize σ u * c u *
        ssSumFin (fun v => if depth v = depth u + 1 then M_up u v * c v else 0)) := by
  refine ⟨ss_sumFin_stratify σ (fun u => c u * c u), ?_⟩
  let upTerm (i j : Fin n) : Int :=
    if A i j = true then (if depth (σ j) = depth (σ i) + 1 then c (σ i) * c (σ j) else 0) else 0
  let dnTerm (i j : Fin n) : Int :=
    if A i j = true then (if depth (σ i) = depth (σ j) + 1 then c (σ i) * c (σ j) else 0) else 0
  have hEdge : ∀ i j : Fin n,
      (if A i j = true then c (σ i) * c (σ j) else 0) = upTerm i j + dnTerm i j := by
    intro i j
    if hA : A i j = true then
      change (if A i j = true then c (σ i) * c (σ j) else 0) =
        (if A i j = true then (if depth (σ j) = depth (σ i) + 1 then c (σ i) * c (σ j) else 0) else 0) +
        (if A i j = true then (if depth (σ i) = depth (σ j) + 1 then c (σ i) * c (σ j) else 0) else 0)
      rw [ss_ite_pos hA, ss_ite_pos hA, ss_ite_pos hA]
      cases hBip i j hA with
      | inl hUp =>
        have hNotDn : ¬ (depth (σ i) = depth (σ j) + 1) := by omega
        rw [ss_ite_pos hUp, ss_ite_neg hNotDn]; omega
      | inr hDn =>
        have hNotUp : ¬ (depth (σ j) = depth (σ i) + 1) := by omega
        rw [ss_ite_neg hNotUp, ss_ite_pos hDn]; omega
    else
      change (if A i j = true then c (σ i) * c (σ j) else 0) =
        (if A i j = true then (if depth (σ j) = depth (σ i) + 1 then c (σ i) * c (σ j) else 0) else 0) +
        (if A i j = true then (if depth (σ i) = depth (σ j) + 1 then c (σ i) * c (σ j) else 0) else 0)
      rw [ss_ite_neg hA, ss_ite_neg hA, ss_ite_neg hA]; omega
  have hSplit : ssQuadForm A (fun i => c (σ i)) =
      ssSumFin (fun i => ssSumFin (fun j => upTerm i j)) +
      ssSumFin (fun i => ssSumFin (fun j => dnTerm i j)) := by
    unfold ssQuadForm
    have hF : (fun i : Fin n => ssSumFin (fun j : Fin n => if A i j = true then c (σ i) * c (σ j) else 0)) =
        (fun i : Fin n => ssSumFin (fun j : Fin n => upTerm i j) + ssSumFin (fun j : Fin n => dnTerm i j)) := by
      funext i
      have hJ : (fun j : Fin n => if A i j = true then c (σ i) * c (σ j) else 0) =
          (fun j : Fin n => upTerm i j + dnTerm i j) := funext (fun j => hEdge i j)
      rw [hJ, ss_sumFin_add]
    rw [hF, ss_sumFin_add]
  have hDnEqUp : ssSumFin (fun i => ssSumFin (fun j => dnTerm i j)) =
      ssSumFin (fun i => ssSumFin (fun j => upTerm i j)) := by
    rw [ss_sumFin_swap]
    apply congrArg ssSumFin; funext j; apply congrArg ssSumFin; funext i
    change (if A i j = true then (if depth (σ i) = depth (σ j) + 1 then c (σ i) * c (σ j) else 0) else 0) =
           (if A j i = true then (if depth (σ i) = depth (σ j) + 1 then c (σ j) * c (σ i) else 0) else 0)
    rw [hSym i j, Int.mul_comm (c (σ i)) (c (σ j))]
  have hUpRow : ∀ i : Fin n,
      ssSumFin (fun j : Fin n => upTerm i j) =
        c (σ i) * ssSumFin (fun v : Fin m =>
          if depth v = depth (σ i) + 1 then M_up (σ i) v * c v else 0) := by
    intro i
    have h1 : (fun j : Fin n => upTerm i j) =
        (fun j : Fin n => c (σ i) *
          (if A i j = true then (if depth (σ j) = depth (σ i) + 1 then c (σ j) else 0) else 0)) := by
      funext j
      change (if A i j = true then (if depth (σ j) = depth (σ i) + 1 then c (σ i) * c (σ j) else 0) else 0) = _
      if hA : A i j = true then
        rw [ss_ite_pos hA, ss_ite_pos hA]
        if hUp : depth (σ j) = depth (σ i) + 1 then rw [ss_ite_pos hUp, ss_ite_pos hUp]
        else rw [ss_ite_neg hUp, ss_ite_neg hUp, Int.mul_zero]
      else rw [ss_ite_neg hA, ss_ite_neg hA, Int.mul_zero]
    rw [h1, ss_sumFin_mul_left]
    apply congrArg (c (σ i) * ·)
    have h2 : (fun j : Fin n =>
          if A i j = true then (if depth (σ j) = depth (σ i) + 1 then c (σ j) else 0) else 0) =
        (fun j : Fin n => ssSumFin (fun v : Fin m =>
          if depth v = depth (σ i) + 1 then
            (if A i j = true then (if σ j = v then c v else 0) else 0)
          else 0)) := by
      funext j
      if hA : A i j = true then
        rw [ss_ite_pos hA]
        have hF : (fun v : Fin m =>
              if depth v = depth (σ i) + 1 then
                (if A i j = true then (if σ j = v then c v else 0) else 0)
              else 0) =
            (fun v : Fin m =>
              if σ j = v then (if depth v = depth (σ i) + 1 then c v else 0) else 0) := by
          funext v
          rw [ss_ite_pos hA]
          if hUp : depth v = depth (σ i) + 1 then
            rw [ss_ite_pos hUp]
            if hv : σ j = v then rw [ss_ite_pos hv, ss_ite_pos hv, ss_ite_pos hUp]
            else rw [ss_ite_neg hv, ss_ite_neg hv]
          else
            rw [ss_ite_neg hUp]
            if hv : σ j = v then rw [ss_ite_pos hv, ss_ite_neg hUp]
            else rw [ss_ite_neg hv]
        rw [hF, ss_sumFin_kronecker]
      else
        rw [ss_ite_neg hA]
        have hF : (fun v : Fin m =>
              if depth v = depth (σ i) + 1 then
                (if A i j = true then (if σ j = v then c v else 0) else 0)
              else 0) = (fun _ : Fin m => (0 : Int)) := by
          funext v
          rw [ss_ite_neg hA]
          if hUp : depth v = depth (σ i) + 1 then rw [ss_ite_pos hUp] else rw [ss_ite_neg hUp]
        rw [hF, ss_sumFin_zero]
    rw [h2, ss_sumFin_swap]
    apply congrArg ssSumFin; funext v
    if hUp : depth v = depth (σ i) + 1 then
      rw [ss_ite_pos hUp]
      have h3 : (fun j : Fin n =>
            if depth v = depth (σ i) + 1 then
              (if A i j = true then (if σ j = v then c v else 0) else 0)
            else 0) =
          (fun j : Fin n => (if A i j = true then (if σ j = v then 1 else 0) else 0) * c v) := by
        funext j
        rw [ss_ite_pos hUp]
        if hA : A i j = true then
          rw [ss_ite_pos hA, ss_ite_pos hA]
          if hv : σ j = v then rw [ss_ite_pos hv, ss_ite_pos hv, Int.one_mul]
          else rw [ss_ite_neg hv, ss_ite_neg hv, Int.zero_mul]
        else rw [ss_ite_neg hA, ss_ite_neg hA, Int.zero_mul]
      rw [h3, ss_sumFin_mul_right]
      exact congrArg (· * c v) (hUpDeg i v hUp)
    else
      rw [ss_ite_neg hUp]
      have h3 : (fun j : Fin n =>
            if depth v = depth (σ i) + 1 then
              (if A i j = true then (if σ j = v then c v else 0) else 0)
            else 0) = (fun _ : Fin n => (0 : Int)) :=
        funext (fun j => ss_ite_neg hUp (if A i j = true then (if σ j = v then c v else 0) else 0) 0)
      rw [h3, ss_sumFin_zero]
  have hUpSum : ssSumFin (fun i => ssSumFin (fun j => upTerm i j)) =
      ssSumFin (fun u => ssStratumSize σ u * c u *
        ssSumFin (fun v => if depth v = depth u + 1 then M_up u v * c v else 0)) := by
    have hFun : (fun i : Fin n => ssSumFin (fun j : Fin n => upTerm i j)) =
        (fun i : Fin n => c (σ i) * ssSumFin (fun v : Fin m =>
          if depth v = depth (σ i) + 1 then M_up (σ i) v * c v else 0)) := funext hUpRow
    rw [hFun, ss_sumFin_stratify σ (fun u => c u * ssSumFin (fun v : Fin m =>
      if depth v = depth u + 1 then M_up u v * c v else 0))]
    apply congrArg ssSumFin; funext u
    exact (Int.mul_assoc (ssStratumSize σ u) (c u) _).symm
  rw [hSplit, hDnEqUp, hUpSum]
  omega

/-- Closed-form finite-support Depth-1 Cartier-Foata Rayleigh-Ritz norm `⟨ψ, ψ⟩` on `r = 1..R`,
    with `ψ(w) = r (R + 1 - r) amp_{|D(w)|} 11^{r-1} 47^{R-r}` constant on each stratum `V_{r, k}`. -/
def ssDepth1NormSq (R : Nat) (a1 a2 a3 : Nat) : Nat :=
  sumNat R (fun i =>
    let r := i + 1
    let s := r * (R + 1 - r) * (11 ^ (r - 1)) * (47 ^ (R - r))
    let v := (foataWin r).cur
    let c1 := s * a1
    let c2 := s * a2
    let c3 := s * a3
    24 * v.a1 * (c1 * c1) + 96 * v.a2 * (c2 * c2) + 96 * v.a3 * (c3 * c3))

/-- Closed-form finite-support Depth-1 Cartier-Foata Rayleigh-Ritz quadratic form `⟨ψ, A ψ⟩` on `r = 1..R`,
    summing twice the certified upward inter-shell edge counts `N(r, j) * M_{j -> k}`. -/
def ssDepth1Quad (R : Nat) (a1 a2 a3 : Nat) : Nat :=
  sumNat (R - 1) (fun i =>
    let r := i + 1
    let s := r * (R + 1 - r) * (11 ^ (r - 1)) * (47 ^ (R - r))
    let sNext := (r + 1) * (R - r) * (11 ^ r) * (47 ^ (R - 1 - r))
    let v := (foataWin r).cur
    let p1 := s * a1
    let p2 := s * a2
    let p3 := s * a3
    let q1 := sNext * a1
    let q2 := sNext * a2
    let q3 := sNext * a3
    2 * (24 * v.a1 * p1 * (15 * q1 + 8 * q2) +
         96 * v.a2 * p2 * (11 * q1 + 8 * q2 + 3 * q3) +
         96 * v.a3 * p3 * (9 * q1 + 6 * q2 + 6 * q3)))

/-- Depth-1 stratum index `(r, k)` (`1 ≤ r ≤ R`, `k ∈ {1, 2, 3}`) encoded in `Fin (3 * R)`:
    `ssStratumDepth u = u / 3 + 1`, `ssDepth1Size u = N(r, k)`, `ssDepth1UpMat u v = M_up(k_u, k_v)`. -/
def ssStratumDepth {R : Nat} (u : Fin (3 * R)) : Nat := u.val / 3 + 1

def ssDepth1Size {R : Nat} (u : Fin (3 * R)) : Int :=
  Int.ofNat (ssStratumCount ⟨u.val % 3 + 1, by omega⟩ (u.val / 3 + 1))

def ssDepth1UpMat {R : Nat} (u v : Fin (3 * R)) : Int :=
  Int.ofNat (ssUpBound ⟨u.val % 3 + 1, by omega⟩ ⟨v.val % 3 + 1, by omega⟩)

def ssDepth1Amp (R a1 a2 a3 : Nat) (u : Fin (3 * R)) : Int :=
  let r := u.val / 3 + 1
  let s := r * (R + 1 - r) * (11 ^ (r - 1)) * (47 ^ (R - r))
  let ak := match u.val % 3 with
    | 0 => a1
    | 1 => a2
    | _ => a3
  Int.ofNat (s * ak)

private theorem ss_sumFinAux_step3 {n : Nat} (f : Fin n → Int) (k : Nat) (hk : 3 * (k + 1) ≤ n) :
    ssSumFinAux (3 * (k + 1)) hk f =
      ssSumFinAux (3 * k) (by omega) f +
        (f ⟨3 * k, by omega⟩ + f ⟨3 * k + 1, by omega⟩ + f ⟨3 * k + 2, by omega⟩) := by
  change ((ssSumFinAux (3 * k) (by omega) f + f ⟨3 * k, by omega⟩) +
          f ⟨3 * k + 1, by omega⟩) + f ⟨3 * k + 2, by omega⟩ = _
  omega

private theorem ss_sumFinAux_shell_slice {R : Nat} (i : Nat) (g : Fin (3 * R) → Int)
    (j : Nat) (hj : 3 * j ≤ 3 * R) :
    ssSumFinAux (3 * j) hj (fun v : Fin (3 * R) => if ssStratumDepth v = i + 2 then g v else 0) =
      if h : i + 1 < j then
        g ⟨3 * (i + 1), by omega⟩ + g ⟨3 * (i + 1) + 1, by omega⟩ + g ⟨3 * (i + 1) + 2, by omega⟩
      else 0 := by
  induction j with
  | zero =>
    have hlt : ¬ (i + 1 < 0) := by omega
    rw [ss_dite_neg hlt]; rfl
  | succ p ih =>
    rw [ss_sumFinAux_step3 _ p hj, ih (by omega)]
    unfold ssStratumDepth
    dsimp only
    if hlt : i + 1 < p then
      have hlt1 : i + 1 < p + 1 := by omega
      have hne0 : ¬ ((3 * p) / 3 + 1 = i + 2) := by omega
      have hne1 : ¬ ((3 * p + 1) / 3 + 1 = i + 2) := by omega
      have hne2 : ¬ ((3 * p + 2) / 3 + 1 = i + 2) := by omega
      rw [ss_dite_pos hlt, ss_dite_pos hlt1, ss_ite_neg hne0, ss_ite_neg hne1, ss_ite_neg hne2]; omega
    else if heq : i + 1 = p then
      have hlt1 : i + 1 < p + 1 := by omega
      have he0 : (3 * p) / 3 + 1 = i + 2 := by omega
      have he1 : (3 * p + 1) / 3 + 1 = i + 2 := by omega
      have he2 : (3 * p + 2) / 3 + 1 = i + 2 := by omega
      rw [ss_dite_neg hlt, ss_dite_pos hlt1, ss_ite_pos he0, ss_ite_pos he1, ss_ite_pos he2]
      have hp0 : (⟨3 * p, by omega⟩ : Fin (3 * R)) = ⟨3 * (i + 1), by omega⟩ :=
        Fin.ext (show 3 * p = 3 * (i + 1) by omega)
      have hp1 : (⟨3 * p + 1, by omega⟩ : Fin (3 * R)) = ⟨3 * (i + 1) + 1, by omega⟩ :=
        Fin.ext (show 3 * p + 1 = 3 * (i + 1) + 1 by omega)
      have hp2 : (⟨3 * p + 2, by omega⟩ : Fin (3 * R)) = ⟨3 * (i + 1) + 2, by omega⟩ :=
        Fin.ext (show 3 * p + 2 = 3 * (i + 1) + 2 by omega)
      rw [hp0, hp1, hp2]; omega
    else
      have hlt1 : ¬ (i + 1 < p + 1) := by omega
      have hne0 : ¬ ((3 * p) / 3 + 1 = i + 2) := by omega
      have hne1 : ¬ ((3 * p + 1) / 3 + 1 = i + 2) := by omega
      have hne2 : ¬ ((3 * p + 2) / 3 + 1 = i + 2) := by omega
      rw [ss_dite_neg hlt, ss_dite_neg hlt1, ss_ite_neg hne0, ss_ite_neg hne1, ss_ite_neg hne2]; omega

private theorem ss_depth1Amp_3k {R a1 a2 a3 k : Nat} (h0 : 3 * k < 3 * R)
    (h1 : 3 * k + 1 < 3 * R) (h2 : 3 * k + 2 < 3 * R) :
    ssDepth1Amp R a1 a2 a3 ⟨3 * k, h0⟩ =
      Int.ofNat ((k + 1) * (R + 1 - (k + 1)) * (11 ^ k) * (47 ^ (R - (k + 1))) * a1) ∧
    ssDepth1Amp R a1 a2 a3 ⟨3 * k + 1, h1⟩ =
      Int.ofNat ((k + 1) * (R + 1 - (k + 1)) * (11 ^ k) * (47 ^ (R - (k + 1))) * a2) ∧
    ssDepth1Amp R a1 a2 a3 ⟨3 * k + 2, h2⟩ =
      Int.ofNat ((k + 1) * (R + 1 - (k + 1)) * (11 ^ k) * (47 ^ (R - (k + 1))) * a3) := by
  have d0 : (3 * k) / 3 = k := by omega
  have m0 : (3 * k) % 3 = 0 := by omega
  have d1 : (3 * k + 1) / 3 = k := by omega
  have m1 : (3 * k + 1) % 3 = 1 := by omega
  have d2 : (3 * k + 2) / 3 = k := by omega
  have m2 : (3 * k + 2) % 3 = 2 := by omega
  refine ⟨?_, ?_, ?_⟩
  · unfold ssDepth1Amp; dsimp only; rw [d0, m0]; rfl
  · unfold ssDepth1Amp; dsimp only; rw [d1, m1]; rfl
  · unfold ssDepth1Amp; dsimp only; rw [d2, m2]; rfl

private theorem ss_depth1Size_3k {R k : Nat} (h0 : 3 * k < 3 * R)
    (h1 : 3 * k + 1 < 3 * R) (h2 : 3 * k + 2 < 3 * R) :
    ssDepth1Size ⟨3 * k, h0⟩ = Int.ofNat (24 * (foataWin (k + 1)).cur.a1) ∧
    ssDepth1Size ⟨3 * k + 1, h1⟩ = Int.ofNat (96 * (foataWin (k + 1)).cur.a2) ∧
    ssDepth1Size ⟨3 * k + 2, h2⟩ = Int.ofNat (96 * (foataWin (k + 1)).cur.a3) := by
  have d0 : (3 * k) / 3 = k := by omega
  have d1 : (3 * k + 1) / 3 = k := by omega
  have d2 : (3 * k + 2) / 3 = k := by omega
  have f0 : (⟨(3 * k) % 3 + 1, by omega⟩ : Fin 4) = ⟨1, by decide⟩ :=
    Fin.ext (show (3 * k) % 3 + 1 = 1 by omega)
  have f1 : (⟨(3 * k + 1) % 3 + 1, by omega⟩ : Fin 4) = ⟨2, by decide⟩ :=
    Fin.ext (show (3 * k + 1) % 3 + 1 = 2 by omega)
  have f2 : (⟨(3 * k + 2) % 3 + 1, by omega⟩ : Fin 4) = ⟨3, by decide⟩ :=
    Fin.ext (show (3 * k + 2) % 3 + 1 = 3 by omega)
  refine ⟨?_, ?_, ?_⟩
  · unfold ssDepth1Size; dsimp only; rw [f0, d0]; rfl
  · unfold ssDepth1Size; dsimp only; rw [f1, d1]; rfl
  · unfold ssDepth1Size; dsimp only; rw [f2, d2]; rfl

private theorem ss_depth1UpMat_eval {R k j : Nat}
    (hu0 : 3 * k < 3 * R) (hu1 : 3 * k + 1 < 3 * R) (hu2 : 3 * k + 2 < 3 * R)
    (hv0 : 3 * j < 3 * R) (hv1 : 3 * j + 1 < 3 * R) (hv2 : 3 * j + 2 < 3 * R) :
    (ssDepth1UpMat ⟨3 * k, hu0⟩ ⟨3 * j, hv0⟩ = Int.ofNat 15 ∧
     ssDepth1UpMat ⟨3 * k, hu0⟩ ⟨3 * j + 1, hv1⟩ = Int.ofNat 8 ∧
     ssDepth1UpMat ⟨3 * k, hu0⟩ ⟨3 * j + 2, hv2⟩ = Int.ofNat 0) ∧
    (ssDepth1UpMat ⟨3 * k + 1, hu1⟩ ⟨3 * j, hv0⟩ = Int.ofNat 11 ∧
     ssDepth1UpMat ⟨3 * k + 1, hu1⟩ ⟨3 * j + 1, hv1⟩ = Int.ofNat 8 ∧
     ssDepth1UpMat ⟨3 * k + 1, hu1⟩ ⟨3 * j + 2, hv2⟩ = Int.ofNat 3) ∧
    (ssDepth1UpMat ⟨3 * k + 2, hu2⟩ ⟨3 * j, hv0⟩ = Int.ofNat 9 ∧
     ssDepth1UpMat ⟨3 * k + 2, hu2⟩ ⟨3 * j + 1, hv1⟩ = Int.ofNat 6 ∧
     ssDepth1UpMat ⟨3 * k + 2, hu2⟩ ⟨3 * j + 2, hv2⟩ = Int.ofNat 6) := by
  have fu0 : (⟨(3 * k) % 3 + 1, by omega⟩ : Fin 4) = ⟨1, by decide⟩ :=
    Fin.ext (show (3 * k) % 3 + 1 = 1 by omega)
  have fu1 : (⟨(3 * k + 1) % 3 + 1, by omega⟩ : Fin 4) = ⟨2, by decide⟩ :=
    Fin.ext (show (3 * k + 1) % 3 + 1 = 2 by omega)
  have fu2 : (⟨(3 * k + 2) % 3 + 1, by omega⟩ : Fin 4) = ⟨3, by decide⟩ :=
    Fin.ext (show (3 * k + 2) % 3 + 1 = 3 by omega)
  have fv0 : (⟨(3 * j) % 3 + 1, by omega⟩ : Fin 4) = ⟨1, by decide⟩ :=
    Fin.ext (show (3 * j) % 3 + 1 = 1 by omega)
  have fv1 : (⟨(3 * j + 1) % 3 + 1, by omega⟩ : Fin 4) = ⟨2, by decide⟩ :=
    Fin.ext (show (3 * j + 1) % 3 + 1 = 2 by omega)
  have fv2 : (⟨(3 * j + 2) % 3 + 1, by omega⟩ : Fin 4) = ⟨3, by decide⟩ :=
    Fin.ext (show (3 * j + 2) % 3 + 1 = 3 by omega)
  unfold ssDepth1UpMat; dsimp only
  rw [fu0, fu1, fu2, fv0, fv1, fv2]
  exact ⟨⟨rfl, rfl, rfl⟩, ⟨rfl, rfl, rfl⟩, ⟨rfl, rfl, rfl⟩⟩

private def ss_depth1Inner (R a1 a2 a3 : Nat) (u : Fin (3 * R)) : Int :=
  ssSumFin (fun v : Fin (3 * R) =>
    if ssStratumDepth v = ssStratumDepth u + 1 then
      ssDepth1UpMat u v * ssDepth1Amp R a1 a2 a3 v
    else 0)

private theorem ss_depth1_normSq_eq (R a1 a2 a3 : Nat) :
    ssSumFin (fun u : Fin (3 * R) =>
      ssDepth1Size u * (ssDepth1Amp R a1 a2 a3 u * ssDepth1Amp R a1 a2 a3 u)) =
      Int.ofNat (ssDepth1NormSq R a1 a2 a3) := by
  have hAux : ∀ k (hk : 3 * k ≤ 3 * R),
      ssSumFinAux (3 * k) hk (fun u : Fin (3 * R) =>
        ssDepth1Size u * (ssDepth1Amp R a1 a2 a3 u * ssDepth1Amp R a1 a2 a3 u)) =
        Int.ofNat (sumNat k (fun i =>
          let r := i + 1
          let s := r * (R + 1 - r) * (11 ^ (r - 1)) * (47 ^ (R - r))
          let v := (foataWin r).cur
          let c1 := s * a1
          let c2 := s * a2
          let c3 := s * a3
          24 * v.a1 * (c1 * c1) + 96 * v.a2 * (c2 * c2) + 96 * v.a3 * (c3 * c3))) := by
    intro k hk; induction k with
    | zero => rfl
    | succ m ih =>
      rw [ss_sumFinAux_step3 _ m hk, ih (by omega)]
      dsimp only
      obtain ⟨ha0, ha1, ha2⟩ := ss_depth1Amp_3k (R := R) (a1 := a1) (a2 := a2) (a3 := a3) (k := m)
        (by omega) (by omega) (by omega)
      obtain ⟨hs0, hs1, hs2⟩ := ss_depth1Size_3k (R := R) (k := m) (by omega) (by omega) (by omega)
      rw [ha0, ha1, ha2, hs0, hs1, hs2]
      simp only [ss_ofNat_mul, ss_ofNat_add]
      all_goals rfl
  exact hAux R (Nat.le_refl (3 * R))

private theorem ss_depth1_quad_eq (R a1 a2 a3 : Nat) :
    2 * ssSumFin (fun u : Fin (3 * R) =>
      ssDepth1Size u * ssDepth1Amp R a1 a2 a3 u * ss_depth1Inner R a1 a2 a3 u) =
      Int.ofNat (ssDepth1Quad R a1 a2 a3) := by
  have hPair : ∀ k (hk : k + 1 < R),
      let r := k + 1
      let s := r * (R + 1 - r) * (11 ^ (r - 1)) * (47 ^ (R - r))
      let sNext := (r + 1) * (R - r) * (11 ^ r) * (47 ^ (R - 1 - r))
      let v := (foataWin r).cur
      let p1 := s * a1
      let p2 := s * a2
      let p3 := s * a3
      let q1 := sNext * a1
      let q2 := sNext * a2
      let q3 := sNext * a3
      ssDepth1Size (⟨3 * k, by omega⟩ : Fin (3 * R)) * ssDepth1Amp R a1 a2 a3 ⟨3 * k, by omega⟩ *
        ss_depth1Inner R a1 a2 a3 ⟨3 * k, by omega⟩ +
      ssDepth1Size (⟨3 * k + 1, by omega⟩ : Fin (3 * R)) * ssDepth1Amp R a1 a2 a3 ⟨3 * k + 1, by omega⟩ *
        ss_depth1Inner R a1 a2 a3 ⟨3 * k + 1, by omega⟩ +
      ssDepth1Size (⟨3 * k + 2, by omega⟩ : Fin (3 * R)) * ssDepth1Amp R a1 a2 a3 ⟨3 * k + 2, by omega⟩ *
        ss_depth1Inner R a1 a2 a3 ⟨3 * k + 2, by omega⟩ =
        Int.ofNat (24 * v.a1 * p1 * (15 * q1 + 8 * q2) +
                   96 * v.a2 * p2 * (11 * q1 + 8 * q2 + 3 * q3) +
                   96 * v.a3 * p3 * (9 * q1 + 6 * q2 + 6 * q3)) := by
    intro k hk
    have hd0 : ssStratumDepth (⟨3 * k, by omega⟩ : Fin (3 * R)) + 1 = k + 2 := by
      unfold ssStratumDepth; show (3 * k) / 3 + 1 + 1 = k + 2; omega
    have hd1 : ssStratumDepth (⟨3 * k + 1, by omega⟩ : Fin (3 * R)) + 1 = k + 2 := by
      unfold ssStratumDepth; show (3 * k + 1) / 3 + 1 + 1 = k + 2; omega
    have hd2 : ssStratumDepth (⟨3 * k + 2, by omega⟩ : Fin (3 * R)) + 1 = k + 2 := by
      unfold ssStratumDepth; show (3 * k + 2) / 3 + 1 + 1 = k + 2; omega
    have hi0 : ss_depth1Inner R a1 a2 a3 ⟨3 * k, by omega⟩ =
        ssDepth1UpMat (⟨3 * k, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1), by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1), by omega⟩ +
        ssDepth1UpMat (⟨3 * k, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1) + 1, by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1) + 1, by omega⟩ +
        ssDepth1UpMat (⟨3 * k, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1) + 2, by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1) + 2, by omega⟩ := by
      change ssSumFinAux (3 * R) (Nat.le_refl (3 * R)) _ = _
      have hF : (fun v : Fin (3 * R) =>
          if ssStratumDepth v = ssStratumDepth (⟨3 * k, by omega⟩ : Fin (3 * R)) + 1 then
            ssDepth1UpMat (⟨3 * k, by omega⟩ : Fin (3 * R)) v * ssDepth1Amp R a1 a2 a3 v else 0) =
        (fun v : Fin (3 * R) =>
          if ssStratumDepth v = k + 2 then
            ssDepth1UpMat (⟨3 * k, by omega⟩ : Fin (3 * R)) v * ssDepth1Amp R a1 a2 a3 v else 0) :=
        funext (fun _ => by rw [hd0])
      rw [hF, ss_sumFinAux_shell_slice k _ R (Nat.le_refl (3 * R)), ss_dite_pos hk]
    have hi1 : ss_depth1Inner R a1 a2 a3 ⟨3 * k + 1, by omega⟩ =
        ssDepth1UpMat (⟨3 * k + 1, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1), by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1), by omega⟩ +
        ssDepth1UpMat (⟨3 * k + 1, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1) + 1, by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1) + 1, by omega⟩ +
        ssDepth1UpMat (⟨3 * k + 1, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1) + 2, by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1) + 2, by omega⟩ := by
      change ssSumFinAux (3 * R) (Nat.le_refl (3 * R)) _ = _
      have hF : (fun v : Fin (3 * R) =>
          if ssStratumDepth v = ssStratumDepth (⟨3 * k + 1, by omega⟩ : Fin (3 * R)) + 1 then
            ssDepth1UpMat (⟨3 * k + 1, by omega⟩ : Fin (3 * R)) v * ssDepth1Amp R a1 a2 a3 v else 0) =
        (fun v : Fin (3 * R) =>
          if ssStratumDepth v = k + 2 then
            ssDepth1UpMat (⟨3 * k + 1, by omega⟩ : Fin (3 * R)) v * ssDepth1Amp R a1 a2 a3 v else 0) :=
        funext (fun _ => by rw [hd1])
      rw [hF, ss_sumFinAux_shell_slice k _ R (Nat.le_refl (3 * R)), ss_dite_pos hk]
    have hi2 : ss_depth1Inner R a1 a2 a3 ⟨3 * k + 2, by omega⟩ =
        ssDepth1UpMat (⟨3 * k + 2, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1), by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1), by omega⟩ +
        ssDepth1UpMat (⟨3 * k + 2, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1) + 1, by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1) + 1, by omega⟩ +
        ssDepth1UpMat (⟨3 * k + 2, by omega⟩ : Fin (3 * R)) (⟨3 * (k + 1) + 2, by omega⟩ : Fin (3 * R)) *
          ssDepth1Amp R a1 a2 a3 ⟨3 * (k + 1) + 2, by omega⟩ := by
      change ssSumFinAux (3 * R) (Nat.le_refl (3 * R)) _ = _
      have hF : (fun v : Fin (3 * R) =>
          if ssStratumDepth v = ssStratumDepth (⟨3 * k + 2, by omega⟩ : Fin (3 * R)) + 1 then
            ssDepth1UpMat (⟨3 * k + 2, by omega⟩ : Fin (3 * R)) v * ssDepth1Amp R a1 a2 a3 v else 0) =
        (fun v : Fin (3 * R) =>
          if ssStratumDepth v = k + 2 then
            ssDepth1UpMat (⟨3 * k + 2, by omega⟩ : Fin (3 * R)) v * ssDepth1Amp R a1 a2 a3 v else 0) :=
        funext (fun _ => by rw [hd2])
      rw [hF, ss_sumFinAux_shell_slice k _ R (Nat.le_refl (3 * R)), ss_dite_pos hk]
    obtain ⟨hp0, hp1, hp2⟩ := ss_depth1Amp_3k (R := R) (a1 := a1) (a2 := a2) (a3 := a3) (k := k)
      (by omega) (by omega) (by omega)
    obtain ⟨hq0, hq1, hq2⟩ := ss_depth1Amp_3k (R := R) (a1 := a1) (a2 := a2) (a3 := a3) (k := k + 1)
      (by omega) (by omega) (by omega)
    obtain ⟨hs0, hs1, hs2⟩ := ss_depth1Size_3k (R := R) (k := k) (by omega) (by omega) (by omega)
    obtain ⟨⟨m00, m01, m02⟩, ⟨m10, m11, m12⟩, ⟨m20, m21, m22⟩⟩ :=
      ss_depth1UpMat_eval (R := R) (k := k) (j := k + 1)
        (by omega) (by omega) (by omega) (by omega) (by omega) (by omega)
    rw [hi0, hi1, hi2, hp0, hp1, hp2, hq0, hq1, hq2, hs0, hs1, hs2,
        m00, m01, m02, m10, m11, m12, m20, m21, m22]
    have hR1 : R + 1 - (k + 1 + 1) = R - (k + 1) := by omega
    have hR2 : R - (k + 1 + 1) = R - 1 - (k + 1) := by omega
    rw [hR1, hR2]
    simp only [ss_ofNat_mul, ss_ofNat_add, Nat.zero_mul, Nat.add_zero]
    all_goals rfl
  have hAux : ∀ k (hk : k ≤ R - 1),
      2 * ssSumFinAux (3 * k) (by omega) (fun u : Fin (3 * R) =>
        ssDepth1Size u * ssDepth1Amp R a1 a2 a3 u * ss_depth1Inner R a1 a2 a3 u) =
        Int.ofNat (sumNat k (fun i =>
          let r := i + 1
          let s := r * (R + 1 - r) * (11 ^ (r - 1)) * (47 ^ (R - r))
          let sNext := (r + 1) * (R - r) * (11 ^ r) * (47 ^ (R - 1 - r))
          let v := (foataWin r).cur
          let p1 := s * a1
          let p2 := s * a2
          let p3 := s * a3
          let q1 := sNext * a1
          let q2 := sNext * a2
          let q3 := sNext * a3
          2 * (24 * v.a1 * p1 * (15 * q1 + 8 * q2) +
               96 * v.a2 * p2 * (11 * q1 + 8 * q2 + 3 * q3) +
               96 * v.a3 * p3 * (9 * q1 + 6 * q2 + 6 * q3)))) := by
    intro k hk; induction k with
    | zero => rfl
    | succ m ih =>
      rw [ss_sumFinAux_step3 _ m (by omega), Int.mul_add, ih (by omega)]
      dsimp only
      rw [hPair m (by omega)]
      change Int.ofNat _ + Int.ofNat 2 * Int.ofNat _ = _
      rw [ss_ofNat_mul, ss_ofNat_add]
      rfl
  cases R with
  | zero => rfl
  | succ m =>
    change 2 * ssSumFinAux (3 * (m + 1)) (Nat.le_refl (3 * (m + 1)))
      (fun u : Fin (3 * (m + 1)) =>
        ssDepth1Size u * ssDepth1Amp (m + 1) a1 a2 a3 u * ss_depth1Inner (m + 1) a1 a2 a3 u) = _
    rw [ss_sumFinAux_step3 _ m (Nat.le_refl (3 * (m + 1)))]
    have hTopZero : ∀ u : Fin (3 * (m + 1)), u.val / 3 = m → ss_depth1Inner (m + 1) a1 a2 a3 u = 0 := by
      intro u hu
      have hdu : ssStratumDepth u + 1 = m + 2 := by unfold ssStratumDepth; omega
      change ssSumFinAux (3 * (m + 1)) (Nat.le_refl (3 * (m + 1))) _ = 0
      have hF : (fun v : Fin (3 * (m + 1)) =>
          if ssStratumDepth v = ssStratumDepth u + 1 then
            ssDepth1UpMat u v * ssDepth1Amp (m + 1) a1 a2 a3 v else 0) =
        (fun v : Fin (3 * (m + 1)) =>
          if ssStratumDepth v = m + 2 then
            ssDepth1UpMat u v * ssDepth1Amp (m + 1) a1 a2 a3 v else 0) :=
        funext (fun _ => by rw [hdu])
      have hNotLt : ¬ (m + 1 < m + 1) := by omega
      rw [hF, ss_sumFinAux_shell_slice m _ (m + 1) (Nat.le_refl (3 * (m + 1))), ss_dite_neg hNotLt]
    have z0 : ss_depth1Inner (m + 1) a1 a2 a3 ⟨3 * m, by omega⟩ = 0 :=
      hTopZero ⟨3 * m, by omega⟩ (show (3 * m) / 3 = m by omega)
    have z1 : ss_depth1Inner (m + 1) a1 a2 a3 ⟨3 * m + 1, by omega⟩ = 0 :=
      hTopZero ⟨3 * m + 1, by omega⟩ (show (3 * m + 1) / 3 = m by omega)
    have z2 : ss_depth1Inner (m + 1) a1 a2 a3 ⟨3 * m + 2, by omega⟩ = 0 :=
      hTopZero ⟨3 * m + 2, by omega⟩ (show (3 * m + 2) / 3 = m by omega)
    rw [z0, z1, z2, Int.mul_zero, Int.mul_zero, Int.mul_zero, Int.add_zero, Int.add_zero, Int.add_zero]
    exact hAux m (by omega)

private theorem ss_depth1_compress_exact {n R : Nat} (a1 a2 a3 : Nat)
    (A : Fin n → Fin n → Bool) (hSym : ∀ i j : Fin n, A i j = A j i)
    (σ : Fin n → Fin (3 * R))
    (hBip : ∀ i j : Fin n, A i j = true →
      ssStratumDepth (σ j) = ssStratumDepth (σ i) + 1 ∨
      ssStratumDepth (σ i) = ssStratumDepth (σ j) + 1)
    (hSize : ∀ u : Fin (3 * R), ssStratumSize σ u = ssDepth1Size u)
    (hUpDeg : ∀ (i : Fin n) (v : Fin (3 * R)),
      ssStratumDepth v = ssStratumDepth (σ i) + 1 →
      ssDegTo A σ i v = ssDepth1UpMat (σ i) v) :
    ssNormSq (fun i => ssDepth1Amp R a1 a2 a3 (σ i)) = Int.ofNat (ssDepth1NormSq R a1 a2 a3) ∧
    ssQuadForm A (fun i => ssDepth1Amp R a1 a2 a3 (σ i)) = Int.ofNat (ssDepth1Quad R a1 a2 a3) := by
  have hRR := thm_ss_stratum_rayleigh_exact A hSym σ ssStratumDepth ssDepth1UpMat hBip hUpDeg
    (ssDepth1Amp R a1 a2 a3)
  have hNormEq : ssSumFin (fun u : Fin (3 * R) =>
        ssStratumSize σ u * (ssDepth1Amp R a1 a2 a3 u * ssDepth1Amp R a1 a2 a3 u)) =
      ssSumFin (fun u : Fin (3 * R) =>
        ssDepth1Size u * (ssDepth1Amp R a1 a2 a3 u * ssDepth1Amp R a1 a2 a3 u)) := by
    apply congrArg ssSumFin; funext u; rw [hSize u]
  have hQuadEq : ssSumFin (fun u : Fin (3 * R) =>
        ssStratumSize σ u * ssDepth1Amp R a1 a2 a3 u * ss_depth1Inner R a1 a2 a3 u) =
      ssSumFin (fun u : Fin (3 * R) =>
        ssDepth1Size u * ssDepth1Amp R a1 a2 a3 u * ss_depth1Inner R a1 a2 a3 u) := by
    apply congrArg ssSumFin; funext u; rw [hSize u]
  refine ⟨by rw [hRR.1, hNormEq, ss_depth1_normSq_eq], ?_⟩
  rw [hRR.2]
  change 2 * ssSumFin (fun u : Fin (3 * R) =>
      ssStratumSize σ u * ssDepth1Amp R a1 a2 a3 u * ss_depth1Inner R a1 a2 a3 u) = _
  rw [hQuadEq, ss_depth1_quad_eq]

private theorem ss_rayleigh_nat_witnesses :
    (ssDepth1NormSq 24 2 3 5 > 0 ∧ ssDepth1Quad 24 2 3 5 > 11 * ssDepth1NormSq 24 2 3 5) ∧
    (ssDepth1NormSq 36 17 26 45 > 0 ∧ 1000 * ssDepth1Quad 36 17 26 45 > 11049 * ssDepth1NormSq 36 17 26 45) := by
  decide

/-- Headline Theorem 11 (Concrete Finite-Support Cartier-Foata Rayleigh-Ritz Lower Witnesses `ρ > 11` & `> 11.049`):
    1. Exact closed-form `Nat` witness inequalities on shells `r = 1..24` (`amp = (2, 3, 5) → > 11`) and
       `r = 1..36` (`amp = (17, 26, 45) → > 11049 / 1000 > 11.013439`).
    2. Bridged directly through `thm_ss_stratum_rayleigh_exact` (upward-only degree uniformity):
       on ANY finite symmetric bipartite graph `(Fin n, A, σ)` matching `ssDepth1Size` and `ssDepth1UpMat`
       on `r = 1..24` (resp. `r = 1..36`), the explicit finite-support integer vector `x_i = ssDepth1Amp ... (σ i)`
       satisfies `ssNormSq x > 0 ∧ ssQuadForm A x > 11 * ssNormSq x` (resp. `1000 * ssQuadForm A x > 11049 * ssNormSq x`)! -/
theorem thm_ss_rayleigh_lower_gt_11 :
    (ssDepth1NormSq 24 2 3 5 > 0 ∧ ssDepth1Quad 24 2 3 5 > 11 * ssDepth1NormSq 24 2 3 5) ∧
    (ssDepth1NormSq 36 17 26 45 > 0 ∧ 1000 * ssDepth1Quad 36 17 26 45 > 11049 * ssDepth1NormSq 36 17 26 45) ∧
    (∀ {n : Nat} (A : Fin n → Fin n → Bool) (_hSym : ∀ i j : Fin n, A i j = A j i)
       (σ : Fin n → Fin (3 * 24))
       (_hBip : ∀ i j : Fin n, A i j = true →
         ssStratumDepth (σ j) = ssStratumDepth (σ i) + 1 ∨
         ssStratumDepth (σ i) = ssStratumDepth (σ j) + 1)
       (_hSize : ∀ u : Fin (3 * 24), ssStratumSize σ u = ssDepth1Size u)
       (_hUpDeg : ∀ (i : Fin n) (v : Fin (3 * 24)),
         ssStratumDepth v = ssStratumDepth (σ i) + 1 →
         ssDegTo A σ i v = ssDepth1UpMat (σ i) v),
       let x := fun i => ssDepth1Amp 24 2 3 5 (σ i)
       ssNormSq x > 0 ∧ ssQuadForm A x > 11 * ssNormSq x) ∧
    (∀ {n : Nat} (A : Fin n → Fin n → Bool) (_hSym : ∀ i j : Fin n, A i j = A j i)
       (σ : Fin n → Fin (3 * 36))
       (_hBip : ∀ i j : Fin n, A i j = true →
         ssStratumDepth (σ j) = ssStratumDepth (σ i) + 1 ∨
         ssStratumDepth (σ i) = ssStratumDepth (σ j) + 1)
       (_hSize : ∀ u : Fin (3 * 36), ssStratumSize σ u = ssDepth1Size u)
       (_hUpDeg : ∀ (i : Fin n) (v : Fin (3 * 36)),
         ssStratumDepth v = ssStratumDepth (σ i) + 1 →
         ssDegTo A σ i v = ssDepth1UpMat (σ i) v),
       let x := fun i => ssDepth1Amp 36 17 26 45 (σ i)
       ssNormSq x > 0 ∧ 1000 * ssQuadForm A x > 11049 * ssNormSq x) := by
  refine ⟨ss_rayleigh_nat_witnesses.1, ss_rayleigh_nat_witnesses.2, ?_, ?_⟩
  · intro _ A hSym σ hBip hSize hUpDeg
    obtain ⟨hN, hQ⟩ := ss_depth1_compress_exact 2 3 5 A hSym σ hBip hSize hUpDeg
    have hw := ss_rayleigh_nat_witnesses.1
    change ssNormSq (fun i => ssDepth1Amp 24 2 3 5 (σ i)) > 0 ∧
           ssQuadForm A (fun i => ssDepth1Amp 24 2 3 5 (σ i)) >
             11 * ssNormSq (fun i => ssDepth1Amp 24 2 3 5 (σ i))
    rw [hN, hQ]
    change Int.ofNat 0 < Int.ofNat (ssDepth1NormSq 24 2 3 5) ∧
           Int.ofNat 11 * Int.ofNat (ssDepth1NormSq 24 2 3 5) < Int.ofNat (ssDepth1Quad 24 2 3 5)
    rw [ss_ofNat_mul]
    exact ⟨ss_ofNat_lt hw.1, ss_ofNat_lt hw.2⟩
  · intro _ A hSym σ hBip hSize hUpDeg
    obtain ⟨hN, hQ⟩ := ss_depth1_compress_exact 17 26 45 A hSym σ hBip hSize hUpDeg
    have hw := ss_rayleigh_nat_witnesses.2
    change ssNormSq (fun i => ssDepth1Amp 36 17 26 45 (σ i)) > 0 ∧
           1000 * ssQuadForm A (fun i => ssDepth1Amp 36 17 26 45 (σ i)) >
             11049 * ssNormSq (fun i => ssDepth1Amp 36 17 26 45 (σ i))
    rw [hN, hQ]
    change Int.ofNat 0 < Int.ofNat (ssDepth1NormSq 36 17 26 45) ∧
           Int.ofNat 11049 * Int.ofNat (ssDepth1NormSq 36 17 26 45) <
             Int.ofNat 1000 * Int.ofNat (ssDepth1Quad 36 17 26 45)
    rw [ss_ofNat_mul, ss_ofNat_mul]
    exact ⟨ss_ofNat_lt hw.1, ss_ofNat_lt hw.2⟩

/-- Headline Theorem 12 (Master Certified `{3,4,3,4}` Spectral Radius Bracket Strictly Inside `(11, 12)`):
    combines the Depth-1 Cartier-Foata finite-support lower witnesses (`ssDepth1Quad / ssDepth1NormSq > 11`
    and `> 11049/1000`) with the refined & single-digit Nagnibeda upper bounds (`ssRefinedRowSum k ≤ 3325977059/278900000`,
    `ssSimpleRowSum k ≤ 335/28 < 12`), certifying:
    - Raw adjacency bracket: `11 < 11049/1000 < 3325977059/278900000 < 335/28 < 12` (width `< 88/100`),
    - Normalized walk radius: `11/24 < max_k S_k / 24 = 335/672 < 1/2`,
    - Normalized Laplacian gap: `1/2 < 337/672 < 3367622941/6693600000 < 13/24`. -/
theorem thm_ss_spectral_bracket_11_12 :
    (ssDepth1Quad 24 2 3 5 > 11 * ssDepth1NormSq 24 2 3 5) ∧
    (1000 * ssDepth1Quad 36 17 26 45 > 11049 * ssDepth1NormSq 36 17 26 45) ∧
    (∀ k : Fin 4, QPos.le (ssRefinedRowSum k) ⟨3325977059, 278900000, by decide⟩) ∧
    (∀ k : Fin 4, QPos.le (ssSimpleRowSum k) ⟨335, 28, by decide⟩) ∧
    (∀ k : Fin 4, QPos.le (QPos.divPos (ssSimpleRowSum k) 24 (by decide)) ⟨335, 672, by decide⟩) ∧
    (11 * 1000 < 11049 ∧ 11049 * 278900000 < 3325977059 * 1000 ∧
     3325977059 * 28 < 335 * 278900000 ∧ 335 < 12 * 28) ∧
    (3325977059 * 1000 < 11049 * 278900000 + 88 * 278900000 * 10) ∧
    (11 * 672 < 335 * 24 ∧ 335 * 2 < 672) ∧
    (672 < 337 * 2 ∧ 337 * 6693600000 < 3367622941 * 672 ∧ 3367622941 * 24 < 13 * 6693600000) := by
  exact ⟨thm_ss_rayleigh_lower_gt_11.1.2, thm_ss_rayleigh_lower_gt_11.2.1.2,
         thm_ss_refined_3rat_bound.2.2.2.2.1, thm_ss_three_rational_row_sums.2.2.2.2,
         thm_ss_normalized_gap_gt_half.1, by decide, by decide, by decide, by decide⟩

end Vibe
