import Mathlib.Algebra.BigOperators.Ring.Finset
import Mathlib.Data.ZMod.Basic
import Mathlib.Logic.Function.Iterate
import Mathlib.Data.List.GetD
import Mathlib.Tactic.IntervalCases
import Mathlib.Tactic.Ring
import Vibe.Generated.CertificatesKrylov
import Vibe.Generated.CertificatesGateSet

/-!
# Vibe Theory: Large Certificates of the Computation Lab (L21)

**B10, the excited-mode counts of M8** (`thm_gsr_krylov_degrees`, bridge `gen_gsr_krylov_degrees_eq`). On a
closed graph with neighbour lists `nb`, the linear Z3 wave has the shifted adjacency `A' = A + σ I` over `ZMod 3`
(`adjF`). The number of standing modes one source excites is the degree of the minimal polynomial of `A'` on
`δ₀`: the least `k` with `A'^k δ₀` a combination of `δ₀, …, A'^(k-1) δ₀` (`IsKrylovDegree`: a monic relation
of degree `k` holds on every cell, and `δ₀, …, A'^(k-1) δ₀` are linearly independent). For every graph of the
mode table of E-CMP-0046 (the six hyperbolic closed quotients with their flat partners, the two larger M2-B
pairs) and both laws `σ = 0, 1`, the degree `shiftedAdjacencyMinimalPolynomial` of z3-resonance.ts reported is
exactly that degree: 6, 12, 8, 106, 8, 23, 3, 9, 22, 96, 24, 171 under self 0 (and the self 1 values).

Each graph is the code's own neighbour table (`Vibe.Generated.CertificatesKrylov`). The certificate per graph and
law is the code's minimal polynomial, the series `K_0[i], …, K_k[i]` of every cell packed into one natural number
(base 1024), and a dual block `Y` on `k` pivot cells with `Σ_c Y[i][c] K_t[pivot c] = [i = t]`. The kernel checks
the series against the recursion `K_(t+1) = A' K_t` cell by cell, the relation on every cell, and the dual block;
the general lemmas below turn those checks into the statement. The curvature readings of M8 stay measurements.

**B7, Q1's generators** (`gen_gsr_generators_eq`, `thm_gsr_sector_projector`, `thm_gsr_generators_in_sector`,
`thm_gsr_transpositions_involutive`). The sector of six excitations with two in role 1, its transpositions, the
Casimir projector on `S = 1` and the eight generators `i P_ab Π_std(abc) Π_S` are rebuilt in Lean and equal the
code's `tripleGenerators` entry for entry; `Π_S` is a projector of trace 9, and each generator is symmetric,
traceless and supported on the sector, so `i G` lies in `su(9)` of the sector. That their Lie closure is all of
`su(9)` (dimension 80) is NOT certified here: `lieClosureDimension`'s 80 stays the code's reading
(`gateSetDimension`), left for later.

**B11** (the no-collidable-pair searches) is not in this module: it is left for later.

Zero `sorry`, zero `native_decide`; the finite checks are `decide +kernel`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

namespace GateSetRank

open Generated

/-! ## The statement -/

/-- `n` digits of `x` in base `b`, lowest first. -/
def digits (b : Nat) : Nat → Nat → List Nat
  | 0, _ => []
  | n + 1, x => x % b :: digits b n (x / b)

/-- The neighbour lists of an exported graph: `deg` neighbours per cell, packed base 4096. -/
def nbList (deg : Nat) (codes : List Nat) : List (List Nat) := codes.map (digits 4096 deg)

/-- The neighbour lists of an entry of `krylovGraphs`. -/
def graphNb (g : String × Nat × Nat × List Nat) : List (List Nat) := nbList g.2.2.1 g.2.2.2

/-- The shifted adjacency `A' = A + σ I` over `ZMod 3` on neighbour lists. -/
def adjF (nb : List (List Nat)) (σ : ZMod 3) (x : Nat → ZMod 3) : Nat → ZMod 3 :=
  fun i => σ * x i + ((nb.getD i []).map x).sum

/-- The source `δ₀`. -/
def delta0 : Nat → ZMod 3 := fun i => if i = 0 then 1 else 0

/-- The Krylov vector `A'^t δ₀`. -/
def krylov (nb : List (List Nat)) (σ : ZMod 3) (t : Nat) : Nat → ZMod 3 := (adjF nb σ)^[t] delta0

/-- `k` is the degree of the minimal polynomial of `A'` on `δ₀` over `ZMod 3`, on the cells `0 … n-1`: a monic
    polynomial of degree `k` kills `δ₀`, and `δ₀, …, A'^(k-1) δ₀` are linearly independent. -/
def IsKrylovDegree (nb : List (List Nat)) (n : Nat) (σ : ZMod 3) (k : Nat) : Prop :=
  (∃ m : Nat → ZMod 3, m k = 1 ∧ ∀ i < n, ∑ t ∈ Finset.range (k + 1), m t * krylov nb σ t i = 0) ∧
    ∀ a : Nat → ZMod 3, (∀ i < n, ∑ t ∈ Finset.range k, a t * krylov nb σ t i = 0) → ∀ t < k, a t = 0

/-! ## Digits in base 1024 -/

/-- Digit `t` of `x` in base 1024. -/
def dig (x t : Nat) : Nat := (x >>> (10 * t)) % 1024

private theorem dig_zero (x : Nat) : dig x 0 = x % 1024 := by simp [dig]

private theorem dig_succ (x t : Nat) : dig x (t + 1) = dig (x / 1024) t := by
  simp only [dig, Nat.shiftRight_eq_div_pow, Nat.div_div_eq_div_mul]
  congr 2
  rw [show 10 * (t + 1) = 10 + 10 * t by omega, Nat.pow_add]

private theorem dig_zero_left (t : Nat) : dig 0 t = 0 := by simp [dig]

private theorem dig_add (a b t : Nat) (h : ∀ s ≤ t, dig a s + dig b s < 1024) :
    dig (a + b) t = dig a t + dig b t := by
  induction t generalizing a b with
  | zero =>
    have h0 := h 0 le_rfl
    simp only [dig_zero] at h0 ⊢
    omega
  | succ t ih =>
    have h0 := h 0 (Nat.zero_le _)
    simp only [dig_zero] at h0
    have hd : (a + b) / 1024 = a / 1024 + b / 1024 := by omega
    rw [dig_succ, dig_succ a, dig_succ b, hd]
    exact ih _ _ fun s hs => by simpa [dig_succ] using h (s + 1) (by omega)

private theorem dig_mul (a : Nat) : ∀ (c t : Nat), (∀ s ≤ t, c * dig a s < 1024) → dig (c * a) t = c * dig a t := by
  intro c
  induction c with
  | zero => intro t _; simp [dig_zero_left]
  | succ c ih =>
    intro t h
    have hc : ∀ s ≤ t, dig (c * a) s = c * dig a s := fun s hs =>
      ih s fun s' hs' => lt_of_le_of_lt (Nat.mul_le_mul_right _ (Nat.le_succ c)) (h s' (le_trans hs' hs))
    rw [Nat.succ_mul, dig_add _ _ _ fun s hs => by rw [hc s hs]; have := h s hs; rw [Nat.succ_mul] at this; omega,
      hc t le_rfl, Nat.succ_mul]

private theorem dig_sum (c x : Nat → Nat) :
    ∀ m t : Nat, (∀ s ≤ t, ∑ r ∈ Finset.range m, c r * dig (x r) s < 1024) →
      dig (∑ r ∈ Finset.range m, c r * x r) t = ∑ r ∈ Finset.range m, c r * dig (x r) t := by
  intro m
  induction m with
  | zero => intro _ _; simp [dig_zero_left]
  | succ m ih =>
    intro t h
    have hm : ∀ s ≤ t, ∑ r ∈ Finset.range m, c r * dig (x r) s < 1024 := fun s hs => by
      have := h s hs
      rw [Finset.sum_range_succ] at this
      omega
    have hl : ∀ s ≤ t, c m * dig (x m) s < 1024 := fun s hs => by
      have := h s hs
      rw [Finset.sum_range_succ] at this
      omega
    have hs' : ∀ s ≤ t, dig (∑ r ∈ Finset.range m, c r * x r) s = ∑ r ∈ Finset.range m, c r * dig (x r) s :=
      fun s hs => ih s fun s' hs' => hm s' (le_trans hs' hs)
    rw [Finset.sum_range_succ, Finset.sum_range_succ, dig_add _ _ _ fun s hs => by
        rw [hs' s hs, dig_mul _ _ _ fun s' hs' => hl s' (le_trans hs' hs)]
        have := h s hs
        rw [Finset.sum_range_succ] at this
        exact this,
      hs' t le_rfl, dig_mul _ _ _ hl]

private theorem dig_eq_zero_of_lt (x k t : Nat) (hx : x < 1024 ^ (k + 1)) (ht : k < t) : dig x t = 0 := by
  have h1 : (1024 : Nat) ^ (k + 1) = 2 ^ (10 * (k + 1)) := by rw [Nat.pow_mul]
  have h2 : 2 ^ (10 * (k + 1)) ≤ 2 ^ (10 * t) := Nat.pow_le_pow_right (by decide) (by omega)
  simp only [dig, Nat.shiftRight_eq_div_pow]
  rw [Nat.div_eq_of_lt (lt_of_lt_of_le (h1 ▸ hx) h2)]

private theorem getD_mem (l : List Nat) (r : Nat) (hr : r < l.length) : l.getD r 0 ∈ l := by
  rw [List.getD_eq_getElem l 0 hr]
  exact List.getElem_mem hr

/-! ## Lists as sums, a balanced tree for random access -/

private theorem sum_map_getD (f : Nat → ZMod 3) (l : List Nat) :
    (l.map f).sum = ∑ r ∈ Finset.range l.length, f (l.getD r 0) := by
  induction l with
  | nil => simp
  | cons a l ih => rw [List.map_cons, List.sum_cons, ih, List.length_cons, Finset.sum_range_succ']; simp [add_comm]

/-- Every other entry, from the first. -/
def everyOther : List Nat → List Nat
  | [] => []
  | [a] => [a]
  | a :: _ :: l => a :: everyOther l

private theorem everyOther_getD (l : List Nat) (j : Nat) : (everyOther l).getD j 0 = l.getD (2 * j) 0 := by
  induction l using everyOther.induct generalizing j with
  | case1 => simp [everyOther]
  | case2 a => cases j <;> simp [everyOther]
  | case3 a b l ih =>
    cases j with
    | zero => simp [everyOther]
    | succ j =>
      rw [show 2 * (j + 1) = 2 * j + 1 + 1 by omega]
      simp only [everyOther, List.getD_cons_succ, ih]

/-- A binary tree over the cells, indexed by the bits of the cell lowest first. -/
inductive NTree where
  | leaf : Nat → NTree
  | node : NTree → NTree → NTree

/-- The tree of depth `d` over a list. -/
def build : Nat → List Nat → NTree
  | 0, l => .leaf (l.headD 0)
  | d + 1, l => .node (build d (everyOther l)) (build d (everyOther l.tail))

/-- Entry `i` of a tree. -/
def tget : NTree → Nat → Nat
  | .leaf x, _ => x
  | .node a b, i => if i % 2 = 0 then tget a (i / 2) else tget b (i / 2)

private theorem tget_build (d : Nat) : ∀ (l : List Nat) (i : Nat), i < 2 ^ d → tget (build d l) i = l.getD i 0 := by
  induction d with
  | zero =>
    intro l i hi
    have : i = 0 := by rw [Nat.pow_zero] at hi; omega
    subst this
    cases l <;> rfl
  | succ d ih =>
    intro l i hi
    rw [Nat.pow_succ] at hi
    simp only [build, tget]
    split_ifs with h
    · rw [ih _ _ (by omega), everyOther_getD, show 2 * (i / 2) = i by omega]
    · rw [ih _ _ (by omega), everyOther_getD]
      cases l with
      | nil => simp
      | cons a l =>
        obtain ⟨q, rfl⟩ : ∃ q, i = 2 * q + 1 := ⟨i / 2, by omega⟩
        rw [show (2 * q + 1) / 2 = q by omega, List.tail_cons, List.getD_cons_succ]

/-! ## The checks -/

/-- The sum of the tree's entries at a list of cells. -/
def nbSum (T : NTree) : List Nat → Nat
  | [] => 0
  | j :: js => tget T j + nbSum T js

private theorem nbSum_eq (T : NTree) (l : List Nat) :
    nbSum T l = ∑ r ∈ Finset.range l.length, 1 * tget T (l.getD r 0) := by
  induction l with
  | nil => simp [nbSum]
  | cons a l ih => rw [nbSum, ih, List.length_cons, Finset.sum_range_succ']; simp [add_comm]

/-- `dig X (t + 1) = dig D t % 3` for every `t < k`. -/
def seriesOk (D X : Nat) : Nat → Bool
  | 0 => true
  | t + 1 => (dig X (t + 1) == dig D t % 3) && seriesOk D X t

private theorem seriesOk_spec (D X : Nat) : ∀ k, seriesOk D X k = true → ∀ t < k, dig X (t + 1) = dig D t % 3 := by
  intro k
  induction k with
  | zero => intro _ t ht; omega
  | succ k ih =>
    intro h t ht
    simp only [seriesOk, Bool.and_eq_true, beq_iff_eq] at h
    rcases Nat.lt_succ_iff_lt_or_eq.mp ht with ht | ht
    · exact ih h.2 t ht
    · subst ht; exact h.1

/-- `Σ_r ms[r] · dig X (t₀ + r)`. -/
def annSum : List Nat → Nat → Nat → Nat
  | [], _, _ => 0
  | m :: ms, X, t => m * dig X t + annSum ms X (t + 1)

private theorem annSum_eq (X : Nat) : ∀ (ms : List Nat) (t₀ : Nat),
    annSum ms X t₀ = ∑ r ∈ Finset.range ms.length, ms.getD r 0 * dig X (t₀ + r) := by
  intro ms
  induction ms with
  | nil => simp [annSum]
  | cons m ms ih =>
    intro t₀
    rw [annSum, ih, List.length_cons, Finset.sum_range_succ']
    simp [add_comm, add_left_comm]

/-- Everything the kernel checks at one cell `i` with series `X` and neighbours `l`: the recursion of the
    series, its length, its first digit (the source), the neighbours, and the relation of `ms`. -/
def cellOk (T : NTree) (n s k : Nat) (ms : List Nat) (i X : Nat) (l : List Nat) : Bool :=
  seriesOk (s * X + nbSum T l) X k && decide (X < 1024 ^ (k + 1)) &&
    (dig X 0 == if i = 0 then 1 else 0) && l.all (· < n) && decide (l.length ≤ 100) &&
    (annSum ms X 0 % 3 == 0)

/-- `cellOk` along the cells `i₀, i₀ + 1, …` of two lists. -/
def cellsOk (T : NTree) (n s k : Nat) (ms : List Nat) : Nat → List Nat → List (List Nat) → Bool
  | i, X :: xs, l :: ls => cellOk T n s k ms i X l && cellsOk T n s k ms (i + 1) xs ls
  | _, _, _ => true

private theorem cellsOk_spec (T : NTree) (n s k : Nat) (ms : List Nat) : ∀ (xs : List Nat) (ls : List (List Nat)) (i₀ : Nat),
    cellsOk T n s k ms i₀ xs ls = true → ∀ r < xs.length, r < ls.length →
      cellOk T n s k ms (i₀ + r) (xs.getD r 0) (ls.getD r []) = true := by
  intro xs
  induction xs with
  | nil => intro _ _ _ r hr; simp at hr
  | cons X xs ih =>
    intro ls i₀ h r hr hl
    cases ls with
    | nil => simp at hl
    | cons l ls =>
      simp only [cellsOk, Bool.and_eq_true] at h
      cases r with
      | zero => simpa using h.1
      | succ r =>
        have := ih ls (i₀ + 1) h.2 r (by simpa using hr) (by simpa using hl)
        simpa [show i₀ + (r + 1) = i₀ + 1 + r by omega] using this

/-- The cells `a … a + m - 1` pass `cellOk`. -/
def cellRange (codes : List Nat) (deg d n s k : Nat) (ms Xs : List Nat) (a m : Nat) : Bool :=
  cellsOk (build d Xs) n s k ms a ((Xs.drop a).take m) (((nbList deg codes).drop a).take m)

private theorem cellRange_spec (codes : List Nat) (deg d n s k : Nat) (ms Xs : List Nat) (a m : Nat)
    (h : cellRange codes deg d n s k ms Xs a m = true) (i : Nat) (h1 : a ≤ i) (h2 : i < a + m)
    (hx : i < Xs.length) (hl : i < (nbList deg codes).length) :
    cellOk (build d Xs) n s k ms i (Xs.getD i 0) ((nbList deg codes).getD i []) = true := by
  have := cellsOk_spec _ _ _ _ _ _ _ _ h (i - a) (by simp; omega) (by simp; omega)
  rw [show a + (i - a) = i by omega] at this
  simpa [List.getD_eq_getElem?_getD, List.getElem?_take, List.getElem?_drop,
    show i - a < m by omega, show a + (i - a) = i by omega] using this

/-- `getP Y c % 3`: entry `c` of a dual row packed base 4, read in `ZMod 3`'s range. -/
def yAt (Y c : Nat) : Nat := ((Y >>> (2 * c)) % 4) % 3

/-- `Σ_r yAt Y (c₀ + r) · xs[r]`. -/
def sumY (Y : Nat) : Nat → List Nat → Nat
  | _, [] => 0
  | c, x :: xs => yAt Y c * x + sumY Y (c + 1) xs

private theorem sumY_eq (Y : Nat) : ∀ (xs : List Nat) (c₀ : Nat),
    sumY Y c₀ xs = ∑ r ∈ Finset.range xs.length, yAt Y (c₀ + r) * xs.getD r 0 := by
  intro xs
  induction xs with
  | nil => simp [sumY]
  | cons x xs ih =>
    intro c₀
    rw [sumY, ih, List.length_cons, Finset.sum_range_succ']
    simp [add_comm, add_left_comm]

/-- `dig S t % 3 = [t = i]` for every `t < k`. -/
def deltaOk (S i : Nat) : Nat → Bool
  | 0 => true
  | t + 1 => (dig S t % 3 == if t = i then 1 else 0) && deltaOk S i t

private theorem deltaOk_spec (S i : Nat) : ∀ k, deltaOk S i k = true → ∀ t < k, dig S t % 3 = if t = i then 1 else 0 := by
  intro k
  induction k with
  | zero => intro _ t ht; omega
  | succ k ih =>
    intro h t ht
    simp only [deltaOk, Bool.and_eq_true, beq_iff_eq] at h
    rcases Nat.lt_succ_iff_lt_or_eq.mp ht with ht | ht
    · exact ih h.2 t ht
    · subst ht; exact h.1

/-- The dual rows `i₀, i₀ + 1, …`: row `i` combines the pivot series `xp` into a series whose first `k` digits
    are `[t = i]` mod 3. -/
def dualOk (xp : List Nat) (k : Nat) : Nat → List Nat → Bool
  | _, [] => true
  | i, Y :: ys => deltaOk (sumY Y 0 xp) i k && dualOk xp k (i + 1) ys

private theorem dualOk_spec (xp : List Nat) (k : Nat) : ∀ (ys : List Nat) (i₀ : Nat), dualOk xp k i₀ ys = true →
    ∀ r < ys.length, deltaOk (sumY (ys.getD r 0) 0 xp) (i₀ + r) k = true := by
  intro ys
  induction ys with
  | nil => intro _ _ r hr; simp at hr
  | cons Y ys ih =>
    intro i₀ h r hr
    simp only [dualOk, Bool.and_eq_true] at h
    cases r with
    | zero => simpa using h.1
    | succ r =>
      have := ih (i₀ + 1) h.2 r (by simpa using hr)
      simpa [show i₀ + (r + 1) = i₀ + 1 + r by omega] using this

/-- The global facts of a certificate: lengths, the tree depth, the relation monic of degree `k`, the pivots. -/
def globalOk (codes : List Nat) (d n k : Nat) (ms piv ys Xs : List Nat) : Bool :=
  (Xs.length == n) && (codes.length == n) && decide (n ≤ 2 ^ d) && (ms.length == k + 1) &&
    (ms.getD k 0 % 3 == 1) && decide (k ≤ 255) && (piv.length == k) && piv.all (· < n) && (ys.length == k)

/-! ## Soundness -/

private theorem nbList_length (deg : Nat) (codes : List Nat) : (nbList deg codes).length = codes.length := by
  simp [nbList]

private theorem cast_dig_mod (x : Nat) : (((x % 3 : Nat)) : ZMod 3) = (x : ZMod 3) := ZMod.natCast_mod x 3

private theorem sum_le_mul (m b : Nat) (f : Nat → Nat) (h : ∀ r < m, f r ≤ b) : ∑ r ∈ Finset.range m, f r ≤ m * b := by
  induction m with
  | zero => simp
  | succ m ih =>
    rw [Finset.sum_range_succ, Nat.succ_mul]
    have := ih fun r hr => h r (by omega)
    have := h m (by omega)
    omega

/-- A certificate whose checks pass proves the Krylov degree. -/
private theorem krylov_cert_sound (codes : List Nat) (deg d n s k : Nat) (ms piv ys Xs : List Nat) (hs : s ≤ 1)
    (hg : globalOk codes d n k ms piv ys Xs = true)
    (hc : ∀ i < n, cellOk (build d Xs) n s k ms i (Xs.getD i 0) ((nbList deg codes).getD i []) = true)
    (hd : dualOk (piv.map (Xs.getD · 0)) k 0 ys = true) :
    IsKrylovDegree (nbList deg codes) n (s : ZMod 3) k := by
  simp only [globalOk, Bool.and_eq_true, beq_iff_eq, decide_eq_true_eq, List.all_eq_true] at hg
  obtain ⟨⟨⟨⟨⟨⟨⟨⟨hXl, hcl⟩, hnd⟩, hml⟩, hmk⟩, hk⟩, hpl⟩, hpv⟩, hyl⟩ := hg
  set nb := nbList deg codes with hnb
  set X : Nat → Nat := fun j => Xs.getD j 0 with hX
  have hnbl : nb.length = n := by rw [hnb, nbList_length, hcl]
  -- unpack the cell checks
  have hcell : ∀ i < n, seriesOk (s * X i + nbSum (build d Xs) (nb.getD i [])) (X i) k = true ∧
      X i < 1024 ^ (k + 1) ∧ dig (X i) 0 = (if i = 0 then 1 else 0) ∧ (∀ j ∈ nb.getD i [], j < n) ∧
      (nb.getD i []).length ≤ 100 ∧ annSum ms (X i) 0 % 3 = 0 := by
    intro i hi
    have := hc i hi
    simp only [cellOk, Bool.and_eq_true, beq_iff_eq, decide_eq_true_eq, List.all_eq_true] at this
    exact ⟨this.1.1.1.1.1, this.1.1.1.1.2, this.1.1.1.2, this.1.1.2, this.1.2, this.2⟩
  -- digits of every series are at most 2
  have hdig2 : ∀ j < n, ∀ t, dig (X j) t ≤ 2 := by
    intro j hj t
    obtain ⟨hser, hlt, h0, -, -, -⟩ := hcell j hj
    rcases Nat.lt_or_ge k t with ht | ht
    · rw [dig_eq_zero_of_lt _ k t hlt ht]; omega
    · cases t with
      | zero => rw [h0]; split_ifs <;> omega
      | succ t => rw [seriesOk_spec _ _ k hser t (by omega)]; omega
  -- the neighbour sum read digit by digit
  have hstep : ∀ j < n, ∀ t < k, dig (X j) (t + 1) =
      (s * dig (X j) t + ∑ r ∈ Finset.range (nb.getD j []).length, 1 * dig (X ((nb.getD j []).getD r 0)) t) % 3 := by
    intro j hj t ht
    obtain ⟨hser, -, -, hnbj, hlen, -⟩ := hcell j hj
    set l := nb.getD j []
    have hr : ∀ r < l.length, l.getD r 0 < n := fun r hr => hnbj _ (getD_mem _ _ hr)
    have htree : nbSum (build d Xs) l = ∑ r ∈ Finset.range l.length, 1 * X (l.getD r 0) := by
      rw [nbSum_eq]
      refine Finset.sum_congr rfl fun r hr' => ?_
      rw [tget_build _ _ _ (by have := hr r (Finset.mem_range.mp hr'); omega)]
    have hbound : ∀ u ≤ t, ∑ r ∈ Finset.range l.length, 1 * dig (X (l.getD r 0)) u ≤ 200 := fun u _ => by
      have := sum_le_mul l.length 2 (fun r => 1 * dig (X (l.getD r 0)) u)
        fun r hr' => by have := hdig2 _ (hr r hr') u; omega
      omega
    rw [seriesOk_spec _ _ k hser t ht, htree]
    congr 1
    rw [dig_add _ _ _ fun u hu => by
        rw [dig_sum _ _ _ _ fun u' hu' => by have := hbound u' (le_trans hu' hu); omega,
          dig_mul _ _ _ fun u' _ => by have := hdig2 j hj u'; interval_cases s <;> omega]
        have := hbound u hu
        have := hdig2 j hj u
        interval_cases s <;> omega,
      dig_mul _ _ _ fun u _ => by have := hdig2 j hj u; interval_cases s <;> omega,
      dig_sum _ _ _ _ fun u hu => by have := hbound u hu; omega]
  -- the Krylov vectors are the series read mod 3
  have hkry : ∀ t ≤ k, ∀ j < n, krylov nb (s : ZMod 3) t j = (dig (X j) t : ZMod 3) := by
    intro t
    induction t with
    | zero =>
      intro _ j hj
      obtain ⟨-, -, h0, -, -, -⟩ := hcell j hj
      simp only [krylov, Function.iterate_zero, id_eq, delta0, h0]
      split_ifs <;> simp
    | succ t ih =>
      intro ht j hj
      obtain ⟨-, -, -, hnbj, -, -⟩ := hcell j hj
      have hr : ∀ r < (nb.getD j []).length, (nb.getD j []).getD r 0 < n := fun r hr =>
        hnbj _ (getD_mem _ _ hr)
      rw [krylov, Function.iterate_succ_apply', ← krylov, hstep j hj t (by omega), cast_dig_mod]
      simp only [adjF, sum_map_getD]
      rw [ih (by omega) j hj]
      push_cast
      congr 1
      refine Finset.sum_congr rfl fun r hr' => ?_
      rw [ih (by omega) _ (hr r (Finset.mem_range.mp hr')), one_mul]
  refine ⟨⟨fun t => (ms.getD t 0 : ZMod 3), ?_, ?_⟩, ?_⟩
  · show (ms.getD k 0 : ZMod 3) = 1
    rw [← cast_dig_mod, hmk]
    rfl
  · intro i hi
    obtain ⟨-, -, -, -, -, hann⟩ := hcell i hi
    rw [annSum_eq, hml] at hann
    have : ∑ t ∈ Finset.range (k + 1), (ms.getD t 0 : ZMod 3) * krylov nb (s : ZMod 3) t i =
        ((∑ t ∈ Finset.range (k + 1), ms.getD t 0 * dig (X i) (0 + t) : Nat) : ZMod 3) := by
      push_cast
      refine Finset.sum_congr rfl fun t ht => ?_
      rw [hkry t (by have := Finset.mem_range.mp ht; omega) i hi, zero_add]
    rw [this, ← cast_dig_mod, hann]
    rfl
  · intro a ha i0 hi0
    have hpiv : ∀ c < k, piv.getD c 0 < n := fun c hc => hpv _ (getD_mem _ _ (by omega))
    set xp := piv.map (Xs.getD · 0)
    have hxpl : xp.length = k := by simp [xp, hpl]
    have hxp : ∀ c < k, xp.getD c 0 = X (piv.getD c 0) := fun c hc => by
      simp [xp, X, List.getD_eq_getElem?_getD, show c < piv.length by omega]
    -- row i0 of the dual block
    have hrow0 := dualOk_spec xp k ys 0 hd i0 (by omega)
    rw [zero_add] at hrow0
    have hrow := deltaOk_spec _ _ k hrow0
    have hdual : ∀ t < k, ∑ c ∈ Finset.range k, (yAt (ys.getD i0 0) c : ZMod 3) * krylov nb (s : ZMod 3) t (piv.getD c 0) =
        if t = i0 then 1 else 0 := by
      intro t ht
      have h1 := hrow t ht
      rw [sumY_eq, hxpl] at h1
      have hb : ∀ u ≤ t, ∑ c ∈ Finset.range k, yAt (ys.getD i0 0) (0 + c) * dig (xp.getD c 0) u < 1024 :=
        fun u _ => by
          have := sum_le_mul k 4 (fun c => yAt (ys.getD i0 0) (0 + c) * dig (xp.getD c 0) u) fun c hc => by
            have hy : yAt (ys.getD i0 0) (0 + c) < 3 := Nat.mod_lt _ (by norm_num)
            have hx := hdig2 _ (hpiv c hc) u
            rw [hxp c hc]
            have := Nat.mul_le_mul (show yAt (ys.getD i0 0) (0 + c) ≤ 2 by omega) hx
            omega
          omega
      rw [dig_sum _ _ _ _ hb] at h1
      have h2 : ((if t = i0 then 1 else 0 : Nat) : ZMod 3) = if t = i0 then 1 else 0 := by split_ifs <;> simp
      rw [← h2, ← h1, cast_dig_mod]
      push_cast
      refine Finset.sum_congr rfl fun c hc => ?_
      rw [zero_add, hxp c (Finset.mem_range.mp hc), hkry t (by omega) _ (hpiv c (Finset.mem_range.mp hc))]
    calc a i0 = ∑ t ∈ Finset.range k, a t * (if t = i0 then 1 else 0) := by
          rw [Finset.sum_eq_single i0 (fun t _ ht => by simp [ht]) (fun h => absurd (Finset.mem_range.mpr hi0) h)]
          simp
      _ = ∑ t ∈ Finset.range k, a t * ∑ c ∈ Finset.range k,
            (yAt (ys.getD i0 0) c : ZMod 3) * krylov nb (s : ZMod 3) t (piv.getD c 0) :=
          Finset.sum_congr rfl fun t ht => by rw [hdual t (Finset.mem_range.mp ht)]
      _ = ∑ c ∈ Finset.range k, (yAt (ys.getD i0 0) c : ZMod 3) *
            ∑ t ∈ Finset.range k, a t * krylov nb (s : ZMod 3) t (piv.getD c 0) := by
          simp only [Finset.mul_sum]
          rw [Finset.sum_comm]
          refine Finset.sum_congr rfl fun c _ => Finset.sum_congr rfl fun t _ => by ring
      _ = 0 := Finset.sum_eq_zero fun c hc => by rw [ha _ (hpiv c (Finset.mem_range.mp hc)), mul_zero]

private theorem globalOk_lengths (codes : List Nat) (d n k : Nat) (ms piv ys Xs : List Nat)
    (hg : globalOk codes d n k ms piv ys Xs = true) : Xs.length = n ∧ codes.length = n := by
  simp only [globalOk, Bool.and_eq_true, beq_iff_eq, decide_eq_true_eq, List.all_eq_true] at hg
  exact ⟨hg.1.1.1.1.1.1.1.1, hg.1.1.1.1.1.1.1.2⟩

/-- One chunk of cells, then the rest. -/
private theorem cells_step (codes : List Nat) (deg d n s k : Nat) (ms Xs : List Nat) (hx : Xs.length = n)
    (hc : codes.length = n) (a m : Nat) (h : cellRange codes deg d n s k ms Xs a m = true)
    (rest : ∀ i, a + m ≤ i → i < n →
      cellOk (build d Xs) n s k ms i (Xs.getD i 0) ((nbList deg codes).getD i []) = true) :
    ∀ i, a ≤ i → i < n → cellOk (build d Xs) n s k ms i (Xs.getD i 0) ((nbList deg codes).getD i []) = true := by
  intro i h1 h2
  rcases Nat.lt_or_ge i (a + m) with h3 | h3
  · exact cellRange_spec codes deg d n s k ms Xs a m h i h1 h3 (by omega) (by rw [nbList_length]; omega)
  · exact rest i h3 h2

/-! ## B7, the generators of Q1 on the S = 1 sector (bridge only)

The sector of gate-set.ts: six excitations, two in role 1, the 15 words `[a, b]` (`a < b`, the positions in role
1) in lexicographic order. Integer matrices are lists of rows over these words. -/

/-- The 15 words of the sector, lexicographic. -/
def sectorWords : List (List Nat) :=
  (List.range 6).flatMap fun a => ((List.range 6).filter (a < ·)).map fun b => [a, b]

/-- The word a transposition `(p q)` of positions takes a word to, sorted. -/
def swapWord (p q : Nat) (w : List Nat) : List Nat :=
  let s := fun x => if x = p then q else if x = q then p else x
  let x := s (w.getD 0 0)
  let y := s (w.getD 1 0)
  if x ≤ y then [x, y] else [y, x]

/-- The image of every word under `(p q)`, as word indices (`transpositionImage`). -/
def transImage (p q : Nat) : List Nat := sectorWords.map fun w => sectorWords.idxOf (swapWord p q w)

/-- The transpositions `p < q` of six positions in the code's order. -/
def sectorPairs : List (Nat × Nat) :=
  (List.range 6).flatMap fun p => ((List.range 6).filter (p < ·)).map fun q => (p, q)

/-- An integer matrix over the 15 words, as rows. -/
abbrev IMat := List (List Int)

/-- The identity. -/
def idM : IMat := (List.range 15).map fun r => (List.range 15).map fun c => if r = c then 1 else 0

/-- Entrywise sum. -/
def addM (a b : IMat) : IMat := List.zipWith (List.zipWith (· + ·)) a b

/-- A scalar multiple. -/
def smulM (s : Int) (a : IMat) : IMat := a.map (·.map (s * ·))

/-- The permutation matrix of an image list: column `c` goes to row `img[c]`. -/
def permM (img : List Nat) : IMat :=
  (List.range 15).map fun r => (List.range 15).map fun c => if img.getD c 0 = r then 1 else 0

/-- The product. -/
def mulM (a b : IMat) : IMat :=
  let bt := (List.range 15).map fun j => b.map (·.getD j 0)
  a.map fun r => bt.map fun c => (List.zipWith (· * ·) r c).sum

/-- The transpose. -/
def transposeM (a : IMat) : IMat := (List.range 15).map fun j => a.map (·.getD j 0)

/-- The trace. -/
def traceM (a : IMat) : Int := ((List.range 15).map fun i => (a.getD i []).getD i 0).sum

/-- `P_pq`. -/
def transM (p q : Nat) : IMat := permM (transImage p q)

/-- The Casimir `4 Σ_{p<q} P_pq - n (n - 4) I` (`n = 6`), eigenvalue `4 S (S + 1)` on total spin `S`. -/
def casimirM : IMat :=
  addM (smulM 4 (sectorPairs.foldr (fun pq acc => addM (transM pq.1 pq.2) acc)
    ((List.range 15).map fun _ => (List.range 15).map fun _ => 0))) (smulM (-12) idM)

/-- The numerator of the projector on `S = 1`: `(C - 24 I)(C - 48 I)` (the other spins `S = 2, 3`), with
    denominator `(8 - 24)(8 - 48) = 640`. -/
def projNumM : IMat := mulM (addM casimirM (smulM (-24) idM)) (addM casimirM (smulM (-48) idM))

/-- `P_pq X` for the permutation matrix of a transposition: row `r` of the product is row `img[r]` of `X`
    (`img` is an involution, `thm_gsr_transpositions_involutive`). -/
def permRows (img : List Nat) (a : IMat) : IMat := img.map fun r => a.getD r []

/-- Every transposition image is an involution, so `permRows` is the left product with `permM`. -/
theorem thm_gsr_transpositions_involutive :
    sectorPairs.all fun pq => (List.range 15).all fun c =>
      (transImage pq.1 pq.2).getD ((transImage pq.1 pq.2).getD c 0) 0 == c := by
  decide +kernel

/-- `Cy X = P_(a,a+1) P_(a+1,a+2) X`. -/
def cycleRows (a : Nat) (x : IMat) : IMat := permRows (transImage a (a + 1)) (permRows (transImage (a + 1) (a + 2)) x)

/-- The generator `P_pq · 3 Π_std(a, a+1, a+2) · num(Π_(S=1))` with `3 Π_std = 3 I - (I + Cy + Cy²)` (its imaginary
    part; `i` times it is the element of the Lie algebra). -/
def tripleGenM (a p q : Nat) : IMat :=
  permRows (transImage p q)
    (addM (smulM 2 projNumM) (smulM (-1) (addM (cycleRows a projNumM) (cycleRows a (cycleRows a projNumM)))))

/-- The eight generators of `tripleGenerators` in the code's order. -/
def tripleGens : List IMat :=
  (List.range 4).flatMap fun a => [tripleGenM a a (a + 1), tripleGenM a (a + 1) (a + 2)]

/-- A packed row of 15 entries (base 2^32, shifted by 2^31). -/
def decodeRow (x : Nat) : List Int := (digits (2 ^ 32) 15 x).map fun d => (d : Int) - 2 ^ 31

/-- **B7 bridge.** The code's sector and generators are the Lean ones: the 15 words, every transposition image,
    and the eight matrices `P_ab · 3 Π_std(abc) · num(Π_(S=1))` entry for entry. -/
theorem gen_gsr_generators_eq :
    gateSetWords = sectorWords ∧
      gateSetImages = sectorPairs.map (fun pq => (pq.1, pq.2, transImage pq.1 pq.2)) ∧
      gateSetGens.map (·.map decodeRow) = tripleGens := by
  decide +kernel

/-- The S = 1 projector `Π = num / 640` is idempotent of trace 9: the sector the generators live on has
    dimension 9. -/
theorem thm_gsr_sector_projector :
    mulM projNumM projNumM = smulM 640 projNumM ∧ traceM projNumM = 640 * 9 := by
  decide +kernel

/-- Each generator `G` is symmetric, traceless and supported on the sector (`G Π = G`), so `i G` lies in the
    special unitary algebra of the 9-dimensional S = 1 sector. -/
theorem thm_gsr_generators_in_sector :
    tripleGens.all fun g => transposeM g == g && traceM g == 0 && mulM g projNumM == smulM 640 g := by
  decide +kernel

/-! ## The certificates of the mode table -/

-- BEGIN GENERATED KRYLOV CHECKS
private theorem krylov_glob_0 :
    globalOk krylovNb0 5 30 6 krylovM0 krylovPiv0 krylovY0 krylovX0 = true := by
  decide +kernel

private theorem krylov_cells_0_0 : cellRange krylovNb0 4 5 30 0 6 krylovM0 krylovX0 0 30 = true := by
  decide +kernel

private theorem krylov_dual_0 : dualOk (krylovPiv0.map (krylovX0.getD · 0)) 6 0 krylovY0 = true := by
  decide +kernel

/-- surface-4-5-genus-4 under self 0: the Krylov degree of delta_0 is 6. -/
private theorem krylov_degree_0 :
    IsKrylovDegree (nbList 4 krylovNb0) 30 ((0 : Nat) : ZMod 3) 6 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_0
  krylov_cert_sound krylovNb0 4 5 30 0 6 _ _ _ _ (by decide) krylov_glob_0
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 30 krylov_cells_0_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_0

private theorem krylov_glob_1 :
    globalOk krylovNb0 5 30 6 krylovM1 krylovPiv1 krylovY1 krylovX1 = true := by
  decide +kernel

private theorem krylov_cells_1_0 : cellRange krylovNb0 4 5 30 1 6 krylovM1 krylovX1 0 30 = true := by
  decide +kernel

private theorem krylov_dual_1 : dualOk (krylovPiv1.map (krylovX1.getD · 0)) 6 0 krylovY1 = true := by
  decide +kernel

/-- surface-4-5-genus-4 under self 1: the Krylov degree of delta_0 is 6. -/
private theorem krylov_degree_1 :
    IsKrylovDegree (nbList 4 krylovNb0) 30 ((1 : Nat) : ZMod 3) 6 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_1
  krylov_cert_sound krylovNb0 4 5 30 1 6 _ _ _ _ (by decide) krylov_glob_1
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 30 krylov_cells_1_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_1

private theorem krylov_glob_2 :
    globalOk krylovNb1 5 30 12 krylovM2 krylovPiv2 krylovY2 krylovX2 = true := by
  decide +kernel

private theorem krylov_cells_2_0 : cellRange krylovNb1 4 5 30 0 12 krylovM2 krylovX2 0 30 = true := by
  decide +kernel

private theorem krylov_dual_2 : dualOk (krylovPiv2.map (krylovX2.getD · 0)) 12 0 krylovY2 = true := by
  decide +kernel

/-- torus-4-4-genus-1-5x6 under self 0: the Krylov degree of delta_0 is 12. -/
private theorem krylov_degree_2 :
    IsKrylovDegree (nbList 4 krylovNb1) 30 ((0 : Nat) : ZMod 3) 12 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_2
  krylov_cert_sound krylovNb1 4 5 30 0 12 _ _ _ _ (by decide) krylov_glob_2
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 30 krylov_cells_2_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_2

private theorem krylov_glob_3 :
    globalOk krylovNb1 5 30 12 krylovM3 krylovPiv3 krylovY3 krylovX3 = true := by
  decide +kernel

private theorem krylov_cells_3_0 : cellRange krylovNb1 4 5 30 1 12 krylovM3 krylovX3 0 30 = true := by
  decide +kernel

private theorem krylov_dual_3 : dualOk (krylovPiv3.map (krylovX3.getD · 0)) 12 0 krylovY3 = true := by
  decide +kernel

/-- torus-4-4-genus-1-5x6 under self 1: the Krylov degree of delta_0 is 12. -/
private theorem krylov_degree_3 :
    IsKrylovDegree (nbList 4 krylovNb1) 30 ((1 : Nat) : ZMod 3) 12 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_3
  krylov_cert_sound krylovNb1 4 5 30 1 12 _ _ _ _ (by decide) krylov_glob_3
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 30 krylov_cells_3_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_3

private theorem krylov_glob_4 :
    globalOk krylovNb2 8 220 8 krylovM4 krylovPiv4 krylovY4 krylovX4 = true := by
  decide +kernel

private theorem krylov_cells_4_0 : cellRange krylovNb2 6 8 220 0 8 krylovM4 krylovX4 0 220 = true := by
  decide +kernel

private theorem krylov_dual_4 : dualOk (krylovPiv4.map (krylovX4.getD · 0)) 8 0 krylovY4 = true := by
  decide +kernel

/-- surface-6-4-genus-56 under self 0: the Krylov degree of delta_0 is 8. -/
private theorem krylov_degree_4 :
    IsKrylovDegree (nbList 6 krylovNb2) 220 ((0 : Nat) : ZMod 3) 8 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_4
  krylov_cert_sound krylovNb2 6 8 220 0 8 _ _ _ _ (by decide) krylov_glob_4
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 220 krylov_cells_4_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_4

private theorem krylov_glob_5 :
    globalOk krylovNb2 8 220 8 krylovM5 krylovPiv5 krylovY5 krylovX5 = true := by
  decide +kernel

private theorem krylov_cells_5_0 : cellRange krylovNb2 6 8 220 1 8 krylovM5 krylovX5 0 220 = true := by
  decide +kernel

private theorem krylov_dual_5 : dualOk (krylovPiv5.map (krylovX5.getD · 0)) 8 0 krylovY5 = true := by
  decide +kernel

/-- surface-6-4-genus-56 under self 1: the Krylov degree of delta_0 is 8. -/
private theorem krylov_degree_5 :
    IsKrylovDegree (nbList 6 krylovNb2) 220 ((1 : Nat) : ZMod 3) 8 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_5
  krylov_cert_sound krylovNb2 6 8 220 1 8 _ _ _ _ (by decide) krylov_glob_5
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 220 krylov_cells_5_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_5

private theorem krylov_glob_6 :
    globalOk krylovNb3 8 220 106 krylovM6 krylovPiv6 krylovY6 krylovX6 = true := by
  decide +kernel

private theorem krylov_cells_6_0 : cellRange krylovNb3 6 8 220 0 106 krylovM6 krylovX6 0 121 = true := by
  decide +kernel

private theorem krylov_cells_6_1 : cellRange krylovNb3 6 8 220 0 106 krylovM6 krylovX6 121 99 = true := by
  decide +kernel

private theorem krylov_dual_6 : dualOk (krylovPiv6.map (krylovX6.getD · 0)) 106 0 krylovY6 = true := by
  decide +kernel

/-- torus-6-3-genus-1-11x20 under self 0: the Krylov degree of delta_0 is 106. -/
private theorem krylov_degree_6 :
    IsKrylovDegree (nbList 6 krylovNb3) 220 ((0 : Nat) : ZMod 3) 106 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_6
  krylov_cert_sound krylovNb3 6 8 220 0 106 _ _ _ _ (by decide) krylov_glob_6
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 121 krylov_cells_6_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 121 99 krylov_cells_6_1
        (fun j _ h2 => absurd h2 (by omega)))) i (Nat.zero_le _) hi)
    krylov_dual_6

private theorem krylov_glob_7 :
    globalOk krylovNb3 8 220 106 krylovM7 krylovPiv7 krylovY7 krylovX7 = true := by
  decide +kernel

private theorem krylov_cells_7_0 : cellRange krylovNb3 6 8 220 1 106 krylovM7 krylovX7 0 121 = true := by
  decide +kernel

private theorem krylov_cells_7_1 : cellRange krylovNb3 6 8 220 1 106 krylovM7 krylovX7 121 99 = true := by
  decide +kernel

private theorem krylov_dual_7 : dualOk (krylovPiv7.map (krylovX7.getD · 0)) 106 0 krylovY7 = true := by
  decide +kernel

/-- torus-6-3-genus-1-11x20 under self 1: the Krylov degree of delta_0 is 106. -/
private theorem krylov_degree_7 :
    IsKrylovDegree (nbList 6 krylovNb3) 220 ((1 : Nat) : ZMod 3) 106 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_7
  krylov_cert_sound krylovNb3 6 8 220 1 106 _ _ _ _ (by decide) krylov_glob_7
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 121 krylov_cells_7_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 121 99 krylov_cells_7_1
        (fun j _ h2 => absurd h2 (by omega)))) i (Nat.zero_le _) hi)
    krylov_dual_7

private theorem krylov_glob_8 :
    globalOk krylovNb4 6 56 8 krylovM8 krylovPiv8 krylovY8 krylovX8 = true := by
  decide +kernel

private theorem krylov_cells_8_0 : cellRange krylovNb4 3 6 56 0 8 krylovM8 krylovX8 0 56 = true := by
  decide +kernel

private theorem krylov_dual_8 : dualOk (krylovPiv8.map (krylovX8.getD · 0)) 8 0 krylovY8 = true := by
  decide +kernel

/-- surface-3-7-genus-3 under self 0: the Krylov degree of delta_0 is 8. -/
private theorem krylov_degree_8 :
    IsKrylovDegree (nbList 3 krylovNb4) 56 ((0 : Nat) : ZMod 3) 8 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_8
  krylov_cert_sound krylovNb4 3 6 56 0 8 _ _ _ _ (by decide) krylov_glob_8
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 56 krylov_cells_8_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_8

private theorem krylov_glob_9 :
    globalOk krylovNb4 6 56 8 krylovM9 krylovPiv9 krylovY9 krylovX9 = true := by
  decide +kernel

private theorem krylov_cells_9_0 : cellRange krylovNb4 3 6 56 1 8 krylovM9 krylovX9 0 56 = true := by
  decide +kernel

private theorem krylov_dual_9 : dualOk (krylovPiv9.map (krylovX9.getD · 0)) 8 0 krylovY9 = true := by
  decide +kernel

/-- surface-3-7-genus-3 under self 1: the Krylov degree of delta_0 is 8. -/
private theorem krylov_degree_9 :
    IsKrylovDegree (nbList 3 krylovNb4) 56 ((1 : Nat) : ZMod 3) 8 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_9
  krylov_cert_sound krylovNb4 3 6 56 1 8 _ _ _ _ (by decide) krylov_glob_9
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 56 krylov_cells_9_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_9

private theorem krylov_glob_10 :
    globalOk krylovNb5 6 56 23 krylovM10 krylovPiv10 krylovY10 krylovX10 = true := by
  decide +kernel

private theorem krylov_cells_10_0 : cellRange krylovNb5 3 6 56 0 23 krylovM10 krylovX10 0 56 = true := by
  decide +kernel

private theorem krylov_dual_10 : dualOk (krylovPiv10.map (krylovX10.getD · 0)) 23 0 krylovY10 = true := by
  decide +kernel

/-- torus-3-6-genus-1-4x7 under self 0: the Krylov degree of delta_0 is 23. -/
private theorem krylov_degree_10 :
    IsKrylovDegree (nbList 3 krylovNb5) 56 ((0 : Nat) : ZMod 3) 23 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_10
  krylov_cert_sound krylovNb5 3 6 56 0 23 _ _ _ _ (by decide) krylov_glob_10
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 56 krylov_cells_10_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_10

private theorem krylov_glob_11 :
    globalOk krylovNb5 6 56 23 krylovM11 krylovPiv11 krylovY11 krylovX11 = true := by
  decide +kernel

private theorem krylov_cells_11_0 : cellRange krylovNb5 3 6 56 1 23 krylovM11 krylovX11 0 56 = true := by
  decide +kernel

private theorem krylov_dual_11 : dualOk (krylovPiv11.map (krylovX11.getD · 0)) 23 0 krylovY11 = true := by
  decide +kernel

/-- torus-3-6-genus-1-4x7 under self 1: the Krylov degree of delta_0 is 23. -/
private theorem krylov_degree_11 :
    IsKrylovDegree (nbList 3 krylovNb5) 56 ((1 : Nat) : ZMod 3) 23 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_11
  krylov_cert_sound krylovNb5 3 6 56 1 23 _ _ _ _ (by decide) krylov_glob_11
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 56 krylov_cells_11_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_11

private theorem krylov_glob_12 :
    globalOk krylovNb6 11 2048 3 krylovM12 krylovPiv12 krylovY12 krylovX12 = true := by
  decide +kernel

private theorem krylov_cells_12_0 : cellRange krylovNb6 24 11 2048 0 3 krylovM12 krylovX12 0 267 = true := by
  decide +kernel

private theorem krylov_cells_12_1 : cellRange krylovNb6 24 11 2048 0 3 krylovM12 krylovX12 267 267 = true := by
  decide +kernel

private theorem krylov_cells_12_2 : cellRange krylovNb6 24 11 2048 0 3 krylovM12 krylovX12 534 267 = true := by
  decide +kernel

private theorem krylov_cells_12_3 : cellRange krylovNb6 24 11 2048 0 3 krylovM12 krylovX12 801 267 = true := by
  decide +kernel

private theorem krylov_cells_12_4 : cellRange krylovNb6 24 11 2048 0 3 krylovM12 krylovX12 1068 267 = true := by
  decide +kernel

private theorem krylov_cells_12_5 : cellRange krylovNb6 24 11 2048 0 3 krylovM12 krylovX12 1335 267 = true := by
  decide +kernel

private theorem krylov_cells_12_6 : cellRange krylovNb6 24 11 2048 0 3 krylovM12 krylovX12 1602 267 = true := by
  decide +kernel

private theorem krylov_cells_12_7 : cellRange krylovNb6 24 11 2048 0 3 krylovM12 krylovX12 1869 179 = true := by
  decide +kernel

private theorem krylov_dual_12 : dualOk (krylovPiv12.map (krylovX12.getD · 0)) 3 0 krylovY12 = true := by
  decide +kernel

/-- honeycomb-3-4-3-4-level-4 under self 0: the Krylov degree of delta_0 is 3. -/
private theorem krylov_degree_12 :
    IsKrylovDegree (nbList 24 krylovNb6) 2048 ((0 : Nat) : ZMod 3) 3 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_12
  krylov_cert_sound krylovNb6 24 11 2048 0 3 _ _ _ _ (by decide) krylov_glob_12
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 267 krylov_cells_12_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 267 267 krylov_cells_12_1
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 534 267 krylov_cells_12_2
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 801 267 krylov_cells_12_3
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1068 267 krylov_cells_12_4
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1335 267 krylov_cells_12_5
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1602 267 krylov_cells_12_6
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1869 179 krylov_cells_12_7
        (fun j _ h2 => absurd h2 (by omega)))))))))) i (Nat.zero_le _) hi)
    krylov_dual_12

private theorem krylov_glob_13 :
    globalOk krylovNb6 11 2048 3 krylovM13 krylovPiv13 krylovY13 krylovX13 = true := by
  decide +kernel

private theorem krylov_cells_13_0 : cellRange krylovNb6 24 11 2048 1 3 krylovM13 krylovX13 0 267 = true := by
  decide +kernel

private theorem krylov_cells_13_1 : cellRange krylovNb6 24 11 2048 1 3 krylovM13 krylovX13 267 267 = true := by
  decide +kernel

private theorem krylov_cells_13_2 : cellRange krylovNb6 24 11 2048 1 3 krylovM13 krylovX13 534 267 = true := by
  decide +kernel

private theorem krylov_cells_13_3 : cellRange krylovNb6 24 11 2048 1 3 krylovM13 krylovX13 801 267 = true := by
  decide +kernel

private theorem krylov_cells_13_4 : cellRange krylovNb6 24 11 2048 1 3 krylovM13 krylovX13 1068 267 = true := by
  decide +kernel

private theorem krylov_cells_13_5 : cellRange krylovNb6 24 11 2048 1 3 krylovM13 krylovX13 1335 267 = true := by
  decide +kernel

private theorem krylov_cells_13_6 : cellRange krylovNb6 24 11 2048 1 3 krylovM13 krylovX13 1602 267 = true := by
  decide +kernel

private theorem krylov_cells_13_7 : cellRange krylovNb6 24 11 2048 1 3 krylovM13 krylovX13 1869 179 = true := by
  decide +kernel

private theorem krylov_dual_13 : dualOk (krylovPiv13.map (krylovX13.getD · 0)) 3 0 krylovY13 = true := by
  decide +kernel

/-- honeycomb-3-4-3-4-level-4 under self 1: the Krylov degree of delta_0 is 3. -/
private theorem krylov_degree_13 :
    IsKrylovDegree (nbList 24 krylovNb6) 2048 ((1 : Nat) : ZMod 3) 3 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_13
  krylov_cert_sound krylovNb6 24 11 2048 1 3 _ _ _ _ (by decide) krylov_glob_13
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 267 krylov_cells_13_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 267 267 krylov_cells_13_1
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 534 267 krylov_cells_13_2
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 801 267 krylov_cells_13_3
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1068 267 krylov_cells_13_4
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1335 267 krylov_cells_13_5
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1602 267 krylov_cells_13_6
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1869 179 krylov_cells_13_7
        (fun j _ h2 => absurd h2 (by omega)))))))))) i (Nat.zero_le _) hi)
    krylov_dual_13

private theorem krylov_glob_14 :
    globalOk krylovNb7 11 2048 9 krylovM14 krylovPiv14 krylovY14 krylovX14 = true := by
  decide +kernel

private theorem krylov_cells_14_0 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 0 241 = true := by
  decide +kernel

private theorem krylov_cells_14_1 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 241 241 = true := by
  decide +kernel

private theorem krylov_cells_14_2 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 482 241 = true := by
  decide +kernel

private theorem krylov_cells_14_3 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 723 241 = true := by
  decide +kernel

private theorem krylov_cells_14_4 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 964 241 = true := by
  decide +kernel

private theorem krylov_cells_14_5 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 1205 241 = true := by
  decide +kernel

private theorem krylov_cells_14_6 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 1446 241 = true := by
  decide +kernel

private theorem krylov_cells_14_7 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 1687 241 = true := by
  decide +kernel

private theorem krylov_cells_14_8 : cellRange krylovNb7 24 11 2048 0 9 krylovM14 krylovX14 1928 120 = true := by
  decide +kernel

private theorem krylov_dual_14 : dualOk (krylovPiv14.map (krylovX14.getD · 0)) 9 0 krylovY14 = true := by
  decide +kernel

/-- torus-3-4-3-3-side-8 under self 0: the Krylov degree of delta_0 is 9. -/
private theorem krylov_degree_14 :
    IsKrylovDegree (nbList 24 krylovNb7) 2048 ((0 : Nat) : ZMod 3) 9 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_14
  krylov_cert_sound krylovNb7 24 11 2048 0 9 _ _ _ _ (by decide) krylov_glob_14
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 241 krylov_cells_14_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 241 241 krylov_cells_14_1
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 482 241 krylov_cells_14_2
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 723 241 krylov_cells_14_3
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 964 241 krylov_cells_14_4
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1205 241 krylov_cells_14_5
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1446 241 krylov_cells_14_6
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1687 241 krylov_cells_14_7
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1928 120 krylov_cells_14_8
        (fun j _ h2 => absurd h2 (by omega))))))))))) i (Nat.zero_le _) hi)
    krylov_dual_14

private theorem krylov_glob_15 :
    globalOk krylovNb7 11 2048 9 krylovM15 krylovPiv15 krylovY15 krylovX15 = true := by
  decide +kernel

private theorem krylov_cells_15_0 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 0 241 = true := by
  decide +kernel

private theorem krylov_cells_15_1 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 241 241 = true := by
  decide +kernel

private theorem krylov_cells_15_2 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 482 241 = true := by
  decide +kernel

private theorem krylov_cells_15_3 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 723 241 = true := by
  decide +kernel

private theorem krylov_cells_15_4 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 964 241 = true := by
  decide +kernel

private theorem krylov_cells_15_5 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 1205 241 = true := by
  decide +kernel

private theorem krylov_cells_15_6 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 1446 241 = true := by
  decide +kernel

private theorem krylov_cells_15_7 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 1687 241 = true := by
  decide +kernel

private theorem krylov_cells_15_8 : cellRange krylovNb7 24 11 2048 1 9 krylovM15 krylovX15 1928 120 = true := by
  decide +kernel

private theorem krylov_dual_15 : dualOk (krylovPiv15.map (krylovX15.getD · 0)) 9 0 krylovY15 = true := by
  decide +kernel

/-- torus-3-4-3-3-side-8 under self 1: the Krylov degree of delta_0 is 9. -/
private theorem krylov_degree_15 :
    IsKrylovDegree (nbList 24 krylovNb7) 2048 ((1 : Nat) : ZMod 3) 9 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_15
  krylov_cert_sound krylovNb7 24 11 2048 1 9 _ _ _ _ (by decide) krylov_glob_15
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 241 krylov_cells_15_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 241 241 krylov_cells_15_1
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 482 241 krylov_cells_15_2
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 723 241 krylov_cells_15_3
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 964 241 krylov_cells_15_4
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1205 241 krylov_cells_15_5
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1446 241 krylov_cells_15_6
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1687 241 krylov_cells_15_7
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 1928 120 krylov_cells_15_8
        (fun j _ h2 => absurd h2 (by omega))))))))))) i (Nat.zero_le _) hi)
    krylov_dual_15

private theorem krylov_glob_16 :
    globalOk krylovNb8 9 330 22 krylovM16 krylovPiv16 krylovY16 krylovX16 = true := by
  decide +kernel

private theorem krylov_cells_16_0 : cellRange krylovNb8 4 9 330 0 22 krylovM16 krylovX16 0 330 = true := by
  decide +kernel

private theorem krylov_dual_16 : dualOk (krylovPiv16.map (krylovX16.getD · 0)) 22 0 krylovY16 = true := by
  decide +kernel

/-- surface-4-5-pgl2-11-330 under self 0: the Krylov degree of delta_0 is 22. -/
private theorem krylov_degree_16 :
    IsKrylovDegree (nbList 4 krylovNb8) 330 ((0 : Nat) : ZMod 3) 22 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_16
  krylov_cert_sound krylovNb8 4 9 330 0 22 _ _ _ _ (by decide) krylov_glob_16
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 330 krylov_cells_16_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_16

private theorem krylov_glob_17 :
    globalOk krylovNb8 9 330 22 krylovM17 krylovPiv17 krylovY17 krylovX17 = true := by
  decide +kernel

private theorem krylov_cells_17_0 : cellRange krylovNb8 4 9 330 1 22 krylovM17 krylovX17 0 330 = true := by
  decide +kernel

private theorem krylov_dual_17 : dualOk (krylovPiv17.map (krylovX17.getD · 0)) 22 0 krylovY17 = true := by
  decide +kernel

/-- surface-4-5-pgl2-11-330 under self 1: the Krylov degree of delta_0 is 22. -/
private theorem krylov_degree_17 :
    IsKrylovDegree (nbList 4 krylovNb8) 330 ((1 : Nat) : ZMod 3) 22 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_17
  krylov_cert_sound krylovNb8 4 9 330 1 22 _ _ _ _ (by decide) krylov_glob_17
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 330 krylov_cells_17_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_17

private theorem krylov_glob_18 :
    globalOk krylovNb9 9 330 96 krylovM18 krylovPiv18 krylovY18 krylovX18 = true := by
  decide +kernel

private theorem krylov_cells_18_0 : cellRange krylovNb9 4 9 330 0 96 krylovM18 krylovX18 0 137 = true := by
  decide +kernel

private theorem krylov_cells_18_1 : cellRange krylovNb9 4 9 330 0 96 krylovM18 krylovX18 137 137 = true := by
  decide +kernel

private theorem krylov_cells_18_2 : cellRange krylovNb9 4 9 330 0 96 krylovM18 krylovX18 274 56 = true := by
  decide +kernel

private theorem krylov_dual_18 : dualOk (krylovPiv18.map (krylovX18.getD · 0)) 96 0 krylovY18 = true := by
  decide +kernel

/-- square-15x22 under self 0: the Krylov degree of delta_0 is 96. -/
private theorem krylov_degree_18 :
    IsKrylovDegree (nbList 4 krylovNb9) 330 ((0 : Nat) : ZMod 3) 96 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_18
  krylov_cert_sound krylovNb9 4 9 330 0 96 _ _ _ _ (by decide) krylov_glob_18
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 137 krylov_cells_18_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 137 137 krylov_cells_18_1
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 274 56 krylov_cells_18_2
        (fun j _ h2 => absurd h2 (by omega))))) i (Nat.zero_le _) hi)
    krylov_dual_18

private theorem krylov_glob_19 :
    globalOk krylovNb9 9 330 96 krylovM19 krylovPiv19 krylovY19 krylovX19 = true := by
  decide +kernel

private theorem krylov_cells_19_0 : cellRange krylovNb9 4 9 330 1 96 krylovM19 krylovX19 0 137 = true := by
  decide +kernel

private theorem krylov_cells_19_1 : cellRange krylovNb9 4 9 330 1 96 krylovM19 krylovX19 137 137 = true := by
  decide +kernel

private theorem krylov_cells_19_2 : cellRange krylovNb9 4 9 330 1 96 krylovM19 krylovX19 274 56 = true := by
  decide +kernel

private theorem krylov_dual_19 : dualOk (krylovPiv19.map (krylovX19.getD · 0)) 96 0 krylovY19 = true := by
  decide +kernel

/-- square-15x22 under self 1: the Krylov degree of delta_0 is 96. -/
private theorem krylov_degree_19 :
    IsKrylovDegree (nbList 4 krylovNb9) 330 ((1 : Nat) : ZMod 3) 96 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_19
  krylov_cert_sound krylovNb9 4 9 330 1 96 _ _ _ _ (by decide) krylov_glob_19
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 137 krylov_cells_19_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 137 137 krylov_cells_19_1
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 274 56 krylov_cells_19_2
        (fun j _ h2 => absurd h2 (by omega))))) i (Nat.zero_le _) hi)
    krylov_dual_19

private theorem krylov_glob_20 :
    globalOk krylovNb10 9 364 24 krylovM20 krylovPiv20 krylovY20 krylovX20 = true := by
  decide +kernel

private theorem krylov_cells_20_0 : cellRange krylovNb10 3 9 364 0 24 krylovM20 krylovX20 0 364 = true := by
  decide +kernel

private theorem krylov_dual_20 : dualOk (krylovPiv20.map (krylovX20.getD · 0)) 24 0 krylovY20 = true := by
  decide +kernel

/-- surface-3-7-pgl2-13-364 under self 0: the Krylov degree of delta_0 is 24. -/
private theorem krylov_degree_20 :
    IsKrylovDegree (nbList 3 krylovNb10) 364 ((0 : Nat) : ZMod 3) 24 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_20
  krylov_cert_sound krylovNb10 3 9 364 0 24 _ _ _ _ (by decide) krylov_glob_20
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 364 krylov_cells_20_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_20

private theorem krylov_glob_21 :
    globalOk krylovNb10 9 364 24 krylovM21 krylovPiv21 krylovY21 krylovX21 = true := by
  decide +kernel

private theorem krylov_cells_21_0 : cellRange krylovNb10 3 9 364 1 24 krylovM21 krylovX21 0 364 = true := by
  decide +kernel

private theorem krylov_dual_21 : dualOk (krylovPiv21.map (krylovX21.getD · 0)) 24 0 krylovY21 = true := by
  decide +kernel

/-- surface-3-7-pgl2-13-364 under self 1: the Krylov degree of delta_0 is 24. -/
private theorem krylov_degree_21 :
    IsKrylovDegree (nbList 3 krylovNb10) 364 ((1 : Nat) : ZMod 3) 24 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_21
  krylov_cert_sound krylovNb10 3 9 364 1 24 _ _ _ _ (by decide) krylov_glob_21
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 364 krylov_cells_21_0
        (fun j _ h2 => absurd h2 (by omega))) i (Nat.zero_le _) hi)
    krylov_dual_21

private theorem krylov_glob_22 :
    globalOk krylovNb11 9 364 171 krylovM22 krylovPiv22 krylovY22 krylovX22 = true := by
  decide +kernel

private theorem krylov_cells_22_0 : cellRange krylovNb11 3 9 364 0 171 krylovM22 krylovX22 0 82 = true := by
  decide +kernel

private theorem krylov_cells_22_1 : cellRange krylovNb11 3 9 364 0 171 krylovM22 krylovX22 82 82 = true := by
  decide +kernel

private theorem krylov_cells_22_2 : cellRange krylovNb11 3 9 364 0 171 krylovM22 krylovX22 164 82 = true := by
  decide +kernel

private theorem krylov_cells_22_3 : cellRange krylovNb11 3 9 364 0 171 krylovM22 krylovX22 246 82 = true := by
  decide +kernel

private theorem krylov_cells_22_4 : cellRange krylovNb11 3 9 364 0 171 krylovM22 krylovX22 328 36 = true := by
  decide +kernel

private theorem krylov_dual_22 : dualOk (krylovPiv22.map (krylovX22.getD · 0)) 171 0 krylovY22 = true := by
  decide +kernel

/-- triangle-13x14 under self 0: the Krylov degree of delta_0 is 171. -/
private theorem krylov_degree_22 :
    IsKrylovDegree (nbList 3 krylovNb11) 364 ((0 : Nat) : ZMod 3) 171 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_22
  krylov_cert_sound krylovNb11 3 9 364 0 171 _ _ _ _ (by decide) krylov_glob_22
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 82 krylov_cells_22_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 82 82 krylov_cells_22_1
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 164 82 krylov_cells_22_2
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 246 82 krylov_cells_22_3
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 328 36 krylov_cells_22_4
        (fun j _ h2 => absurd h2 (by omega))))))) i (Nat.zero_le _) hi)
    krylov_dual_22

private theorem krylov_glob_23 :
    globalOk krylovNb11 9 364 171 krylovM23 krylovPiv23 krylovY23 krylovX23 = true := by
  decide +kernel

private theorem krylov_cells_23_0 : cellRange krylovNb11 3 9 364 1 171 krylovM23 krylovX23 0 82 = true := by
  decide +kernel

private theorem krylov_cells_23_1 : cellRange krylovNb11 3 9 364 1 171 krylovM23 krylovX23 82 82 = true := by
  decide +kernel

private theorem krylov_cells_23_2 : cellRange krylovNb11 3 9 364 1 171 krylovM23 krylovX23 164 82 = true := by
  decide +kernel

private theorem krylov_cells_23_3 : cellRange krylovNb11 3 9 364 1 171 krylovM23 krylovX23 246 82 = true := by
  decide +kernel

private theorem krylov_cells_23_4 : cellRange krylovNb11 3 9 364 1 171 krylovM23 krylovX23 328 36 = true := by
  decide +kernel

private theorem krylov_dual_23 : dualOk (krylovPiv23.map (krylovX23.getD · 0)) 171 0 krylovY23 = true := by
  decide +kernel

/-- triangle-13x14 under self 1: the Krylov degree of delta_0 is 171. -/
private theorem krylov_degree_23 :
    IsKrylovDegree (nbList 3 krylovNb11) 364 ((1 : Nat) : ZMod 3) 171 :=
  have hl := globalOk_lengths _ _ _ _ _ _ _ _ krylov_glob_23
  krylov_cert_sound krylovNb11 3 9 364 1 171 _ _ _ _ (by decide) krylov_glob_23
    (fun i hi => (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 0 82 krylov_cells_23_0
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 82 82 krylov_cells_23_1
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 164 82 krylov_cells_23_2
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 246 82 krylov_cells_23_3
        (cells_step _ _ _ _ _ _ _ _ hl.1 hl.2 328 36 krylov_cells_23_4
        (fun j _ h2 => absurd h2 (by omega))))))) i (Nat.zero_le _) hi)
    krylov_dual_23

/-- The code's Krylov degrees are the ones certified, graph for graph and law for law. -/
theorem gen_gsr_krylov_degrees_eq :
    krylovDegrees = krylovCerts.map fun c => ((krylovGraphs.getD c.1 ("", 0, 0, [])).1, c.2.1, c.2.2.1) := by
  decide +kernel

/-- **B10.** Every Krylov degree `shiftedAdjacencyMinimalPolynomial` reported for the mode table of E-CMP-0046
    (each graph, both laws) is the exact degree of the minimal polynomial of `A + σ I` on `δ₀` over `ZMod 3`. -/
theorem thm_gsr_krylov_degrees : ∀ e ∈ krylovDegrees, ∃ g ∈ krylovGraphs, g.1 = e.1 ∧
    IsKrylovDegree (graphNb g) g.2.1 ((e.2.1 : Nat) : ZMod 3) e.2.2 := by
  intro e he
  simp only [krylovDegrees, List.mem_cons, List.not_mem_nil, or_false] at he
  rcases he with rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl
  · exact ⟨krylovGraphs[0]'(by decide), List.getElem_mem _, rfl, krylov_degree_0⟩
  · exact ⟨krylovGraphs[0]'(by decide), List.getElem_mem _, rfl, krylov_degree_1⟩
  · exact ⟨krylovGraphs[1]'(by decide), List.getElem_mem _, rfl, krylov_degree_2⟩
  · exact ⟨krylovGraphs[1]'(by decide), List.getElem_mem _, rfl, krylov_degree_3⟩
  · exact ⟨krylovGraphs[2]'(by decide), List.getElem_mem _, rfl, krylov_degree_4⟩
  · exact ⟨krylovGraphs[2]'(by decide), List.getElem_mem _, rfl, krylov_degree_5⟩
  · exact ⟨krylovGraphs[3]'(by decide), List.getElem_mem _, rfl, krylov_degree_6⟩
  · exact ⟨krylovGraphs[3]'(by decide), List.getElem_mem _, rfl, krylov_degree_7⟩
  · exact ⟨krylovGraphs[4]'(by decide), List.getElem_mem _, rfl, krylov_degree_8⟩
  · exact ⟨krylovGraphs[4]'(by decide), List.getElem_mem _, rfl, krylov_degree_9⟩
  · exact ⟨krylovGraphs[5]'(by decide), List.getElem_mem _, rfl, krylov_degree_10⟩
  · exact ⟨krylovGraphs[5]'(by decide), List.getElem_mem _, rfl, krylov_degree_11⟩
  · exact ⟨krylovGraphs[6]'(by decide), List.getElem_mem _, rfl, krylov_degree_12⟩
  · exact ⟨krylovGraphs[6]'(by decide), List.getElem_mem _, rfl, krylov_degree_13⟩
  · exact ⟨krylovGraphs[7]'(by decide), List.getElem_mem _, rfl, krylov_degree_14⟩
  · exact ⟨krylovGraphs[7]'(by decide), List.getElem_mem _, rfl, krylov_degree_15⟩
  · exact ⟨krylovGraphs[8]'(by decide), List.getElem_mem _, rfl, krylov_degree_16⟩
  · exact ⟨krylovGraphs[8]'(by decide), List.getElem_mem _, rfl, krylov_degree_17⟩
  · exact ⟨krylovGraphs[9]'(by decide), List.getElem_mem _, rfl, krylov_degree_18⟩
  · exact ⟨krylovGraphs[9]'(by decide), List.getElem_mem _, rfl, krylov_degree_19⟩
  · exact ⟨krylovGraphs[10]'(by decide), List.getElem_mem _, rfl, krylov_degree_20⟩
  · exact ⟨krylovGraphs[10]'(by decide), List.getElem_mem _, rfl, krylov_degree_21⟩
  · exact ⟨krylovGraphs[11]'(by decide), List.getElem_mem _, rfl, krylov_degree_22⟩
  · exact ⟨krylovGraphs[11]'(by decide), List.getElem_mem _, rfl, krylov_degree_23⟩
-- END GENERATED KRYLOV CHECKS

end GateSetRank

end Compute

end Vibe
