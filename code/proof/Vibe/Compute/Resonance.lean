import Mathlib.Data.Nat.Choose.Lucas
import Mathlib.Data.Nat.Digits.Defs
import Mathlib.Data.Int.Interval
import Mathlib.Tactic.FinCases
import Mathlib.Tactic.IntervalCases
import Vibe.Compute.SecondOrderZ3

/-!
# Resonance of the Z3 wave (M8): the Lucas front and the uniform mode

Lean track item L17 (claims A29 and A30 of the models lab, note m8-resonance, experiment E-CMP-0046, measure code
`code/measure/z3-resonance.ts`). Builds on `Vibe.Compute.SecondOrderZ3` (the M3 wave `s(t+1) = f(s(t)) - s(t-1)`
over `ZMod 3` and its front theorem, tone = number of geodesics mod 3).

## The graph model

The flat tilings `{4,4}` and `{6,3}` are read as their tile graphs on `ℤ × ℤ`: a tile's neighbours are its
translates by a fixed step set, `squareDirs` (4 steps, the square grid, degree 4) and `triDirs` (6 steps, axial
coordinates of the hexagons of `{6,3}`, whose tile graph is the triangular grid, degree 6). The source sits on the
tile `0`. `squareDist` (the taxicab norm) and `triDist` (the hexagonal norm `max(|x|, |y|, |x + y|)`) are the walk
distance (`thm_res_square_distance`, `thm_res_tri_distance`). The front shell at step `t` is `sphere N t`, every
tile at distance `t`, and `lit` counts the tiles on it whose tone is nonzero at step `t`, exactly the `lit(t)` of
E-CMP-0046.

`lucasCount b n` is the product of (digit + 1) over the base-`b` digits of `n`, line for line the TypeScript
`lucasNonzeroCount(t, base)`. `L3(t)` of the note is `lucasCount 3 t`.

## Headline theorems

1. `thm_res_lucas_count`: for every `n`, exactly `lucasCount 3 n` of the binomials `C(n, k)`, `0 ≤ k ≤ n`, are not
   divisible by 3 (Lucas's theorem, from Mathlib's `Choose.choose_modEq_choose_mod_mul_choose_div_nat`).
2. `thm_res_square_lucas_front` (A29 on `{4,4}`): for every `t ≥ 1` and every law `neighbour sum + h(own)` with
   `h 0 = 0` (the linear laws self 0 and self 1, the square law), `lit(t) = 4 (L3(t) - 1)`, and the shell has `4t`
   tiles.
3. `thm_res_tri_lucas_front` (A29 on `{6,3}`): the same with `6 (L3(t) - 1)` and `6t` tiles.
4. `thm_res_lucas_base_two_fails`: the base-2 formula is wrong already at `t = 2` (the note's negative control).
5. `thm_res_uniform_field` (A30, first half): on any tile set where every tile has `p` neighbours, a uniform start
   stays uniform under the linear law with self term `σ`, its value following `x(t+1) = (p + σ) x(t) - x(t-1)` mod 3.
6. `thm_res_uniform_mode` (A30): from the all-ones start `(s(-1), s(0)) = (0, 1)` on any nonempty tile set of degree
   `p`, the state returns at step `n` exactly when `uniformPeriod (p + σ) ∣ n`: the period is 4, 6 or 3 as
   `p + σ ≡ 0, 1, 2 (mod 3)`, so it depends on the degree (mod 3) and the law alone, never on the graph.
7. `thm_res_uniform_period_injective`: the three periods differ, so two degrees share the uniform period exactly when
   `p + σ` agrees mod 3 (degrees 4 and 6 differ; degrees 3 and 6 agree).

A29 holds for every `t ≥ 1`, not only for the `t ≤ 40` the experiment checked; at `t = 0` the shell is the source
alone and `lit(0) = 1`. The front-share readings, the curvature comparisons, the Krylov degrees and the periods of
the closed quotients stay measurements of E-CMP-0046. These theorems speak about the Lean definitions, which mirror
`secondOrderZ3Step`, `geodesicCounts`, `lucasNonzeroCount` and `uniformModePeriod`; no generated table ties them to
the TypeScript.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

namespace Resonance

open Finset SecondOrderZ3

/-! ### Lucas's count -/

/-- The product of (digit + 1) over the base-`base` digits of `n` (`lucasNonzeroCount` of `z3-resonance.ts`). -/
def lucasCount (base n : ℕ) : ℕ :=
  ((Nat.digits base n).map (· + 1)).prod

/-- 1 when `C(n, k)` is not divisible by 3, else 0. -/
def notDiv3 (n k : ℕ) : ℕ :=
  if 3 ∣ n.choose k then 0 else 1

-- [helper]
theorem lucasCount_rec (n : ℕ) (hn : 0 < n) : lucasCount 3 n = (n % 3 + 1) * lucasCount 3 (n / 3) := by
  unfold lucasCount
  rw [Nat.digits_def' (by norm_num) hn]
  simp

-- [helper]
theorem sum_notDiv3_extend (n N : ℕ) (hN : n + 1 ≤ N) :
    ∑ k ∈ range N, notDiv3 n k = ∑ k ∈ range (n + 1), notDiv3 n k := by
  induction N, hN using Nat.le_induction with
  | base => rfl
  | succ N hN ih =>
    rw [sum_range_succ, ih, notDiv3, Nat.choose_eq_zero_of_lt (by omega)]
    simp

-- [helper]
theorem sum_range_three_mul (f : ℕ → ℕ) (m : ℕ) :
    ∑ k ∈ range (3 * m), f k = ∑ q ∈ range m, (f (3 * q) + f (3 * q + 1) + f (3 * q + 2)) := by
  induction m with
  | zero => simp
  | succ m ih =>
    rw [show 3 * (m + 1) = 3 * m + 1 + 1 + 1 by ring]
    simp only [sum_range_succ, ih]
    ring

-- [helper]
theorem three_dvd_choose_iff (n q r : ℕ) (hr : r < 3) :
    3 ∣ n.choose (3 * q + r) ↔ (n % 3 < r ∨ 3 ∣ (n / 3).choose q) := by
  have hmod := Choose.choose_modEq_choose_mod_mul_choose_div_nat (n := n) (k := 3 * q + r) (p := 3)
  have h1 : (3 * q + r) % 3 = r := by omega
  have h2 : (3 * q + r) / 3 = q := by omega
  rw [h1, h2] at hmod
  unfold Nat.ModEq at hmod
  rw [Nat.dvd_iff_mod_eq_zero, hmod, ← Nat.dvd_iff_mod_eq_zero, Nat.Prime.dvd_mul Nat.prime_three]
  have hn : n % 3 < 3 := Nat.mod_lt _ (by norm_num)
  have key : 3 ∣ (n % 3).choose r ↔ n % 3 < r := by
    generalize n % 3 = a at hn ⊢
    interval_cases a <;> interval_cases r <;> decide
  rw [key]

-- [helper]
theorem sum_notDiv3 (n : ℕ) : ∑ k ∈ range (n + 1), notDiv3 n k = lucasCount 3 n := by
  induction n using Nat.strong_induction_on with
  | _ n ih =>
  rcases Nat.eq_zero_or_pos n with rfl | hn
  · simp [notDiv3, lucasCount]
  · rw [lucasCount_rec n hn, ← ih (n / 3) (Nat.div_lt_self hn (by norm_num)),
      ← sum_notDiv3_extend n (3 * (n / 3 + 1)) (by omega), sum_range_three_mul, mul_sum]
    refine sum_congr rfl (fun q _ => ?_)
    have e : ∀ r, r < 3 → notDiv3 n (3 * q + r) = (if n % 3 < r then 0 else 1) * notDiv3 (n / 3) q := by
      intro r hr
      unfold notDiv3
      by_cases hA : n % 3 < r
      · simp [(three_dvd_choose_iff n q r hr).2 (Or.inl hA), hA]
      · by_cases hB : 3 ∣ (n / 3).choose q
        · simp [(three_dvd_choose_iff n q r hr).2 (Or.inr hB), hA, hB]
        · have : ¬ 3 ∣ n.choose (3 * q + r) := fun h => by
            rcases (three_dvd_choose_iff n q r hr).1 h with h | h
            · exact hA h
            · exact hB h
          simp [this, hA, hB]
    have e0 := e 0 (by norm_num)
    rw [add_zero] at e0
    rw [e0, e 1 (by norm_num), e 2 (by norm_num)]
    have hn3 : n % 3 < 3 := Nat.mod_lt _ (by norm_num)
    generalize n % 3 = a at hn3 ⊢
    interval_cases a <;> split_ifs <;> omega

/-- Lucas's count: exactly `lucasCount 3 n` of the `C(n, k)`, `0 ≤ k ≤ n`, are not divisible by 3. -/
theorem thm_res_lucas_count (n : ℕ) :
    ((range (n + 1)).filter (fun k => ¬ 3 ∣ n.choose k)).card = lucasCount 3 n := by
  rw [card_filter, ← sum_notDiv3]
  refine sum_congr rfl (fun k _ => ?_)
  by_cases h : 3 ∣ n.choose k <;> simp [notDiv3, h]

-- [helper]
theorem card_not_dvd_choose_lt (t : ℕ) :
    ((range t).filter (fun a => ¬ 3 ∣ t.choose a)).card = lucasCount 3 t - 1 := by
  have h := thm_res_lucas_count t
  rw [range_add_one, filter_insert, if_pos (by simp), card_insert_of_notMem (by simp)] at h
  omega

/-! ### Flat tile graphs on `ℤ × ℤ` -/

/-- A tile of a flat tiling, in lattice coordinates. -/
abbrev Cell := ℤ × ℤ

/-- The neighbours of a tile: its translates by a fixed step set. -/
def latticeNbr (dirs : Finset Cell) (v : Cell) : Finset Cell :=
  dirs.image (v + ·)

/-- The tile graph of `{4,4}`: the square grid, degree 4. -/
def squareDirs : Finset Cell :=
  {(1, 0), (-1, 0), (0, 1), (0, -1)}

/-- The tile graph of `{6,3}` in axial coordinates: the triangular grid, degree 6. -/
def triDirs : Finset Cell :=
  {(1, 0), (-1, 0), (0, 1), (0, -1), (1, -1), (-1, 1)}

/-- Walk distance on the square grid. -/
def squareDist (v : Cell) : ℕ :=
  v.1.natAbs + v.2.natAbs

/-- Walk distance on the triangular grid. -/
def triDist (v : Cell) : ℕ :=
  max (max v.1.natAbs v.2.natAbs) (v.1 + v.2).natAbs

/-- The quarter turn of the square grid. -/
def squareRot (v : Cell) : Cell :=
  (-v.2, v.1)

/-- The sixth turn of the triangular grid. -/
def triRot (v : Cell) : Cell :=
  (-v.2, v.1 + v.2)

/-- The shell at distance `t`: every tile with `N v = t`. -/
def sphere (N : Cell → ℕ) (t : ℕ) : Finset Cell :=
  (Icc (-(t : ℤ)) t ×ˢ Icc (-(t : ℤ)) t).filter (fun v => N v = t)

/-- The tone at step `t` of the one-source wave (source on tile `0`) under the law `neighbour sum + h(own)`. -/
def tone (dirs : Finset Cell) (h : ZMod 3 → ZMod 3) (t : ℕ) (v : Cell) : ZMod 3 :=
  ((step (law (latticeNbr dirs) h))^[t] (seed (0 : Cell))).2 v

/-- `lit(t)`: the tiles on the shell at distance `t` whose tone is nonzero at step `t`. -/
def lit (dirs : Finset Cell) (N : Cell → ℕ) (h : ZMod 3 → ZMod 3) (t : ℕ) : ℕ :=
  ((sphere N t).filter (fun v => tone dirs h t v ≠ 0)).card

/-- The `k` sectors of the shell: tile `a` of sector `q` is the `q`-th turn of `(t - a, a)`. -/
def front (rot : Cell → Cell) (t : ℕ) {k : ℕ} (p : Fin k × ℕ) : Cell :=
  rot^[p.1.val] ((t : ℤ) - p.2, (p.2 : ℤ))

-- [helper]
theorem sum_latticeNbr {β : Type} [AddCommMonoid β] (dirs : Finset Cell) (v : Cell) (f : Cell → β) :
    ∑ j ∈ latticeNbr dirs v, f j = ∑ d ∈ dirs, f (v + d) :=
  sum_image (add_right_injective v).injOn

-- [helper]
theorem walks_eq_zero_of_lt (dirs : Finset Cell) (N : Cell → ℕ) (hN0 : N 0 = 0)
    (hstep : ∀ v, ∀ d ∈ dirs, N v ≤ N (v + d) + 1) :
    ∀ n v, n < N v → walks (latticeNbr dirs) 0 n v = 0 := by
  intro n
  induction n with
  | zero =>
    intro v hv
    have hv0 : v ≠ 0 := by
      rintro rfl
      omega
    simp [walks, hv0]
  | succ n ih =>
    intro v hv
    simp only [walks]
    rw [sum_latticeNbr]
    exact sum_eq_zero (fun d hd => ih _ (by have := hstep v d hd; omega))

-- [helper]
theorem walks_rot (dirs : Finset Cell) (σ : Cell → Cell) (hadd : ∀ a b, σ (a + b) = σ a + σ b)
    (hinj : Function.Injective σ) (hdirs : dirs.image σ = dirs) :
    ∀ n v, walks (latticeNbr dirs) 0 n (σ v) = walks (latticeNbr dirs) 0 n v := by
  have h0 : σ 0 = 0 := by simpa using hadd 0 0
  intro n
  induction n with
  | zero =>
    intro v
    simp only [walks]
    by_cases hv : v = 0
    · simp [hv, h0]
    · have : σ v ≠ 0 := fun h => hv (hinj (h.trans h0.symm))
      simp [hv, this]
  | succ n ih =>
    intro v
    simp only [walks]
    rw [sum_latticeNbr, sum_latticeNbr]
    calc ∑ d ∈ dirs, walks (latticeNbr dirs) 0 n (σ v + d)
        = ∑ d ∈ dirs.image σ, walks (latticeNbr dirs) 0 n (σ v + d) := by rw [hdirs]
      _ = ∑ d ∈ dirs, walks (latticeNbr dirs) 0 n (σ v + σ d) := sum_image hinj.injOn
      _ = ∑ d ∈ dirs, walks (latticeNbr dirs) 0 n (v + d) := sum_congr rfl (fun d _ => by rw [← hadd, ih])

-- [helper]
theorem walks_rot_iter (dirs : Finset Cell) (σ : Cell → Cell) (hadd : ∀ a b, σ (a + b) = σ a + σ b)
    (hinj : Function.Injective σ) (hdirs : dirs.image σ = dirs) (k n : ℕ) (v : Cell) :
    walks (latticeNbr dirs) 0 n (σ^[k] v) = walks (latticeNbr dirs) 0 n v := by
  induction k generalizing v with
  | zero => rfl
  | succ k ih => rw [Function.iterate_succ_apply', walks_rot dirs σ hadd hinj hdirs, ih]

/-- The generic front argument: a step set with a distance `N` that moves by at most 1 per step, a turn `σ`
permuting the steps, binomial walk counts on the first quadrant, and a shell cut into `k` turned sectors give the
geodesic count `C(t, a)` on every front tile and `lit(t) = k (L3(t) - 1)`. -/
theorem lit_of_front (dirs : Finset Cell) (N : Cell → ℕ) (hN0 : N 0 = 0)
    (hstep : ∀ v, ∀ d ∈ dirs, N v ≤ N (v + d) + 1) (σ : Cell → Cell) (hadd : ∀ a b, σ (a + b) = σ a + σ b)
    (hinj : Function.Injective σ) (hdirs : dirs.image σ = dirs) (k : ℕ)
    (hq : ∀ n x y : ℕ, x + y = n → walks (latticeNbr dirs) 0 n ((x : ℤ), (y : ℤ)) = n.choose x)
    (t : ℕ) (himg : sphere N t = ((univ : Finset (Fin k)) ×ˢ range t).image (front σ t))
    (hinjOn : Set.InjOn (front σ t) ↑((univ : Finset (Fin k)) ×ˢ range t))
    (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0) :
    (∀ p ∈ (univ : Finset (Fin k)) ×ˢ range t, N (front σ t p) = t ∧
      walks (latticeNbr dirs) 0 t (front σ t p) = t.choose p.2 ∧
      tone dirs h t (front σ t p) = (t.choose p.2 : ZMod 3)) ∧
    (sphere N t).card = k * t ∧
    lit dirs N h t = k * (lucasCount 3 t - 1) := by
  have hfront : ∀ p ∈ (univ : Finset (Fin k)) ×ˢ range t, N (front σ t p) = t ∧
      walks (latticeNbr dirs) 0 t (front σ t p) = t.choose p.2 ∧
      tone dirs h t (front σ t p) = (t.choose p.2 : ZMod 3) := by
    intro p hp
    have hN : N (front σ t p) = t := by
      have hm : front σ t p ∈ sphere N t := by
        rw [himg]
        exact mem_image_of_mem _ hp
      exact (mem_filter.1 hm).2
    have ha : p.2 < t := mem_range.1 (mem_product.1 hp).2
    have hw : walks (latticeNbr dirs) 0 t (front σ t p) = t.choose p.2 := by
      unfold front
      rw [walks_rot_iter dirs σ hadd hinj hdirs]
      have e : ((t : ℤ) - (p.2 : ℤ), (p.2 : ℤ)) = (((t - p.2 : ℕ) : ℤ), (p.2 : ℤ)) := by
        rw [Nat.cast_sub ha.le]
      rw [e, hq t (t - p.2) p.2 (by omega), Nat.choose_symm ha.le]
    refine ⟨hN, hw, ?_⟩
    unfold tone
    rw [thm_soz3_front_geodesic_count _ h h0 0 t _
      (fun j hj => walks_eq_zero_of_lt dirs N hN0 hstep j _ (by omega)), hw]
  refine ⟨hfront, ?_, ?_⟩
  · rw [himg, card_image_of_injOn hinjOn, card_product, card_univ, Fintype.card_fin, card_range]
  · unfold lit
    rw [himg, filter_image, card_image_of_injOn (hinjOn.mono (coe_subset.2 (filter_subset _ _)))]
    rw [filter_congr (q := fun p : Fin k × ℕ => ¬ 3 ∣ t.choose p.2) (fun p hp => by
      rw [(hfront p hp).2.2, Ne, ZMod.natCast_eq_zero_iff])]
    rw [filter_product_right, card_product, card_univ, Fintype.card_fin, card_not_dvd_choose_lt]

/-! ### The square grid `{4,4}` -/

-- [helper]
theorem sum_squareDirs {β : Type} [AddCommMonoid β] (f : Cell → β) :
    ∑ d ∈ squareDirs, f d = f (1, 0) + f (-1, 0) + f (0, 1) + f (0, -1) := by
  unfold squareDirs
  rw [sum_insert (by decide), sum_insert (by decide), sum_insert (by decide), sum_singleton]
  abel

-- [helper]
theorem square_step : ∀ v, ∀ d ∈ squareDirs, squareDist v ≤ squareDist (v + d) + 1 := by
  rintro ⟨x, y⟩ d hd
  simp only [squareDirs, mem_insert, mem_singleton] at hd
  rcases hd with rfl | rfl | rfl | rfl <;> simp only [squareDist, Prod.mk_add_mk] <;> omega

-- [helper]
theorem square_quadrant : ∀ n x y : ℕ, x + y = n →
    walks (latticeNbr squareDirs) 0 n ((x : ℤ), (y : ℤ)) = n.choose x := by
  intro n
  induction n with
  | zero =>
    intro x y hxy
    obtain ⟨rfl, rfl⟩ : x = 0 ∧ y = 0 := by omega
    simp [walks]
  | succ n ih =>
    intro x y hxy
    have hz := walks_eq_zero_of_lt squareDirs squareDist (by simp [squareDist]) square_step n
    have t1 : walks (latticeNbr squareDirs) 0 n (((x : ℤ), (y : ℤ)) + (1, 0)) = 0 :=
      hz _ (by simp only [squareDist, Prod.mk_add_mk]; omega)
    have t3 : walks (latticeNbr squareDirs) 0 n (((x : ℤ), (y : ℤ)) + (0, 1)) = 0 :=
      hz _ (by simp only [squareDist, Prod.mk_add_mk]; omega)
    have t2 : walks (latticeNbr squareDirs) 0 n (((x : ℤ), (y : ℤ)) + (-1, 0)) =
        if x = 0 then 0 else n.choose (x - 1) := by
      by_cases hx : x = 0
      · rw [if_pos hx]
        exact hz _ (by simp only [squareDist, Prod.mk_add_mk]; omega)
      · rw [if_neg hx]
        have e : ((x : ℤ), (y : ℤ)) + (-1, 0) = (((x - 1 : ℕ) : ℤ), (y : ℤ)) := by
          rw [Prod.mk_add_mk, Nat.cast_sub (by omega)]
          simp only [Nat.cast_one, add_zero]
          rfl
        rw [e, ih (x - 1) y (by omega)]
    have t4 : walks (latticeNbr squareDirs) 0 n (((x : ℤ), (y : ℤ)) + (0, -1)) =
        if y = 0 then 0 else n.choose x := by
      by_cases hy : y = 0
      · rw [if_pos hy]
        exact hz _ (by simp only [squareDist, Prod.mk_add_mk]; omega)
      · rw [if_neg hy]
        have e : ((x : ℤ), (y : ℤ)) + (0, -1) = ((x : ℤ), ((y - 1 : ℕ) : ℤ)) := by
          rw [Prod.mk_add_mk, Nat.cast_sub (by omega)]
          simp only [Nat.cast_one, add_zero]
          rfl
        rw [e, ih x (y - 1) (by omega)]
    simp only [walks]
    rw [sum_latticeNbr, sum_squareDirs, t1, t2, t3, t4]
    by_cases hx : x = 0
    · subst hx
      have hy : y ≠ 0 := by omega
      simp [hy]
    · by_cases hy : y = 0
      · subst hy
        obtain rfl : x = n + 1 := by omega
        simp
      · obtain ⟨x', rfl⟩ : ∃ x', x = x' + 1 := ⟨x - 1, by omega⟩
        simp only [hy, hx, if_false, zero_add, add_zero, Nat.add_sub_cancel]
        rw [Nat.choose_succ_succ']

-- [helper]
theorem square_rot_dirs : squareDirs.image squareRot = squareDirs := by decide

-- [helper]
theorem square_rot_injective : Function.Injective squareRot := by
  rintro ⟨a, b⟩ ⟨c, d⟩ h
  simp only [squareRot, Prod.mk.injEq] at h
  ext <;> omega

-- [helper]
theorem square_rot_add (a b : Cell) : squareRot (a + b) = squareRot a + squareRot b := by
  obtain ⟨a1, a2⟩ := a
  obtain ⟨b1, b2⟩ := b
  simp only [squareRot, Prod.mk_add_mk, neg_add]

-- [helper]
theorem square_mem_sphere (t : ℕ) (v : Cell) : v ∈ sphere squareDist t ↔ squareDist v = t := by
  obtain ⟨x, y⟩ := v
  simp only [sphere, mem_filter, mem_product, mem_Icc, squareDist]
  omega

-- [helper]
theorem square_front_eq (t a : ℕ) :
    front squareRot t ((0 : Fin 4), a) = ((t : ℤ) - a, (a : ℤ)) ∧
    front squareRot t ((1 : Fin 4), a) = (-(a : ℤ), (t : ℤ) - a) ∧
    front squareRot t ((2 : Fin 4), a) = ((a : ℤ) - t, -(a : ℤ)) ∧
    front squareRot t ((3 : Fin 4), a) = ((a : ℤ), (a : ℤ) - t) := by
  refine ⟨rfl, ?_, ?_, ?_⟩ <;>
    simp only [front, squareRot, Function.iterate_succ_apply', Function.iterate_zero_apply,
      Fin.isValue, Fin.val_one, Fin.val_two, Prod.mk.injEq] <;>
    first
    | (constructor <;> ring)
    | (simp only [show ((3 : Fin 4) : ℕ) = 2 + 1 from rfl, Function.iterate_succ_apply',
        Function.iterate_zero_apply]; constructor <;> ring)

-- [helper]
theorem square_sphere_eq_image (t : ℕ) (ht : 0 < t) :
    sphere squareDist t = ((univ : Finset (Fin 4)) ×ˢ range t).image (front squareRot t) := by
  obtain ⟨f0, f1, f2, f3⟩ := fun a => square_front_eq t a
  ext ⟨x, y⟩
  rw [square_mem_sphere, mem_image]
  simp only [squareDist]
  constructor
  · intro h
    by_cases c0 : 0 < x ∧ 0 ≤ y
    · refine ⟨((0 : Fin 4), y.toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f0, Prod.mk.injEq]
      omega
    by_cases c1 : x ≤ 0 ∧ 0 < y
    · refine ⟨((1 : Fin 4), (-x).toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f1, Prod.mk.injEq]
      omega
    by_cases c2 : x < 0 ∧ y ≤ 0
    · refine ⟨((2 : Fin 4), (-y).toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f2, Prod.mk.injEq]
      omega
    · refine ⟨((3 : Fin 4), x.toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f3, Prod.mk.injEq]
      omega
  · rintro ⟨⟨q, a⟩, hp, he⟩
    have ha : a < t := mem_range.1 (mem_product.1 hp).2
    fin_cases q
    · rw [f0, Prod.mk.injEq] at he
      omega
    · rw [f1, Prod.mk.injEq] at he
      omega
    · rw [f2, Prod.mk.injEq] at he
      omega
    · rw [f3, Prod.mk.injEq] at he
      omega

-- [helper]
theorem square_front_injOn (t : ℕ) :
    Set.InjOn (front squareRot t) ↑((univ : Finset (Fin 4)) ×ˢ range t) := by
  obtain ⟨f0, f1, f2, f3⟩ := fun a => square_front_eq t a
  rintro ⟨q, a⟩ hp ⟨q', a'⟩ hp' he
  have ha : a < t := mem_range.1 (mem_product.1 hp).2
  have ha' : a' < t := mem_range.1 (mem_product.1 hp').2
  fin_cases q <;> fin_cases q' <;>
    simp only [f0, f1, f2, f3, Prod.mk.injEq] at he <;>
    simp only [Prod.mk.injEq, Fin.isValue, Fin.reduceEq, false_and, true_and] <;>
    omega

/-- Walk distance on the square grid is the taxicab norm: no walk shorter than `squareDist v` reaches `v`, and at
least one of that length does. -/
theorem thm_res_square_distance (v : Cell) :
    (∀ k < squareDist v, walks (latticeNbr squareDirs) 0 k v = 0) ∧
      0 < walks (latticeNbr squareDirs) 0 (squareDist v) v := by
  refine ⟨fun k hk => walks_eq_zero_of_lt squareDirs squareDist (by simp [squareDist]) square_step k v hk, ?_⟩
  rcases Nat.eq_zero_or_pos (squareDist v) with h0 | hpos
  · have hv : v = 0 := by
      obtain ⟨x, y⟩ := v
      simp only [squareDist] at h0
      ext <;> simp <;> omega
    subst hv
    simp [squareDist, walks]
  · have hm : v ∈ sphere squareDist (squareDist v) := (square_mem_sphere _ v).2 rfl
    rw [square_sphere_eq_image _ hpos, mem_image] at hm
    obtain ⟨p, hp, rfl⟩ := hm
    have hw := ((lit_of_front squareDirs squareDist (by simp [squareDist]) square_step squareRot square_rot_add
      square_rot_injective square_rot_dirs 4 square_quadrant _ (square_sphere_eq_image _ hpos)
      (square_front_injOn _) (fun _ => 0) rfl).1 p hp).2.1
    rw [hw]
    exact Nat.choose_pos (mem_range.1 (mem_product.1 hp).2).le

/-- A29 on `{4,4}`: for every `t ≥ 1` and every law `neighbour sum + h(own)` with `h 0 = 0`, the shell at distance
`t` has `4t` tiles, the tone on its tile `a` of each sector is `C(t, a)` mod 3, and `lit(t) = 4 (L3(t) - 1)`. -/
theorem thm_res_square_lucas_front (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0) (t : ℕ) (ht : 0 < t) :
    (∀ p ∈ (univ : Finset (Fin 4)) ×ˢ range t, tone squareDirs h t (front squareRot t p) = (t.choose p.2 : ZMod 3)) ∧
    (sphere squareDist t).card = 4 * t ∧
    lit squareDirs squareDist h t = 4 * (lucasCount 3 t - 1) := by
  obtain ⟨hf, hc, hl⟩ := lit_of_front squareDirs squareDist (by simp [squareDist]) square_step squareRot
    square_rot_add square_rot_injective square_rot_dirs 4 square_quadrant t (square_sphere_eq_image t ht)
    (square_front_injOn t) h h0
  exact ⟨fun p hp => (hf p hp).2.2, hc, hl⟩

/-! ### The triangular grid `{6,3}` -/

-- [helper]
theorem sum_triDirs {β : Type} [AddCommMonoid β] (f : Cell → β) :
    ∑ d ∈ triDirs, f d = f (1, 0) + f (-1, 0) + f (0, 1) + f (0, -1) + f (1, -1) + f (-1, 1) := by
  unfold triDirs
  rw [sum_insert (by decide), sum_insert (by decide), sum_insert (by decide), sum_insert (by decide),
    sum_insert (by decide), sum_singleton]
  abel

-- [helper]
theorem tri_step : ∀ v, ∀ d ∈ triDirs, triDist v ≤ triDist (v + d) + 1 := by
  rintro ⟨x, y⟩ d hd
  simp only [triDirs, mem_insert, mem_singleton] at hd
  rcases hd with rfl | rfl | rfl | rfl | rfl | rfl <;> simp only [triDist, Prod.mk_add_mk] <;> omega

-- [helper]
theorem tri_quadrant : ∀ n x y : ℕ, x + y = n →
    walks (latticeNbr triDirs) 0 n ((x : ℤ), (y : ℤ)) = n.choose x := by
  intro n
  induction n with
  | zero =>
    intro x y hxy
    obtain ⟨rfl, rfl⟩ : x = 0 ∧ y = 0 := by omega
    simp [walks]
  | succ n ih =>
    intro x y hxy
    have hz := walks_eq_zero_of_lt triDirs triDist (by simp [triDist]) tri_step n
    have t1 : walks (latticeNbr triDirs) 0 n (((x : ℤ), (y : ℤ)) + (1, 0)) = 0 :=
      hz _ (by simp only [triDist, Prod.mk_add_mk]; omega)
    have t3 : walks (latticeNbr triDirs) 0 n (((x : ℤ), (y : ℤ)) + (0, 1)) = 0 :=
      hz _ (by simp only [triDist, Prod.mk_add_mk]; omega)
    have t5 : walks (latticeNbr triDirs) 0 n (((x : ℤ), (y : ℤ)) + (1, -1)) = 0 :=
      hz _ (by simp only [triDist, Prod.mk_add_mk]; omega)
    have t6 : walks (latticeNbr triDirs) 0 n (((x : ℤ), (y : ℤ)) + (-1, 1)) = 0 :=
      hz _ (by simp only [triDist, Prod.mk_add_mk]; omega)
    have t2 : walks (latticeNbr triDirs) 0 n (((x : ℤ), (y : ℤ)) + (-1, 0)) =
        if x = 0 then 0 else n.choose (x - 1) := by
      by_cases hx : x = 0
      · rw [if_pos hx]
        exact hz _ (by simp only [triDist, Prod.mk_add_mk]; omega)
      · rw [if_neg hx]
        have e : ((x : ℤ), (y : ℤ)) + (-1, 0) = (((x - 1 : ℕ) : ℤ), (y : ℤ)) := by
          rw [Prod.mk_add_mk, Nat.cast_sub (by omega)]
          simp only [Nat.cast_one, add_zero]
          rfl
        rw [e, ih (x - 1) y (by omega)]
    have t4 : walks (latticeNbr triDirs) 0 n (((x : ℤ), (y : ℤ)) + (0, -1)) =
        if y = 0 then 0 else n.choose x := by
      by_cases hy : y = 0
      · rw [if_pos hy]
        exact hz _ (by simp only [triDist, Prod.mk_add_mk]; omega)
      · rw [if_neg hy]
        have e : ((x : ℤ), (y : ℤ)) + (0, -1) = ((x : ℤ), ((y - 1 : ℕ) : ℤ)) := by
          rw [Prod.mk_add_mk, Nat.cast_sub (by omega)]
          simp only [Nat.cast_one, add_zero]
          rfl
        rw [e, ih x (y - 1) (by omega)]
    simp only [walks]
    rw [sum_latticeNbr, sum_triDirs, t1, t2, t3, t4, t5, t6]
    by_cases hx : x = 0
    · subst hx
      have hy : y ≠ 0 := by omega
      simp [hy]
    · by_cases hy : y = 0
      · subst hy
        obtain rfl : x = n + 1 := by omega
        simp
      · obtain ⟨x', rfl⟩ : ∃ x', x = x' + 1 := ⟨x - 1, by omega⟩
        simp only [hy, hx, if_false, zero_add, add_zero, Nat.add_sub_cancel]
        rw [Nat.choose_succ_succ']

-- [helper]
theorem tri_rot_dirs : triDirs.image triRot = triDirs := by decide

-- [helper]
theorem tri_rot_injective : Function.Injective triRot := by
  rintro ⟨a, b⟩ ⟨c, d⟩ h
  simp only [triRot, Prod.mk.injEq] at h
  ext <;> omega

-- [helper]
theorem tri_rot_add (a b : Cell) : triRot (a + b) = triRot a + triRot b := by
  obtain ⟨a1, a2⟩ := a
  obtain ⟨b1, b2⟩ := b
  simp only [triRot, Prod.mk_add_mk, Prod.mk.injEq]
  constructor <;> ring

-- [helper]
theorem tri_mem_sphere (t : ℕ) (v : Cell) : v ∈ sphere triDist t ↔ triDist v = t := by
  obtain ⟨x, y⟩ := v
  simp only [sphere, mem_filter, mem_product, mem_Icc, triDist]
  omega

-- [helper]
theorem tri_front_eq (t a : ℕ) :
    front triRot t ((⟨0, by norm_num⟩ : Fin 6), a) = ((t : ℤ) - a, (a : ℤ)) ∧
    front triRot t ((⟨1, by norm_num⟩ : Fin 6), a) = (-(a : ℤ), (t : ℤ)) ∧
    front triRot t ((⟨2, by norm_num⟩ : Fin 6), a) = (-(t : ℤ), (t : ℤ) - a) ∧
    front triRot t ((⟨3, by norm_num⟩ : Fin 6), a) = ((a : ℤ) - t, -(a : ℤ)) ∧
    front triRot t ((⟨4, by norm_num⟩ : Fin 6), a) = ((a : ℤ), -(t : ℤ)) ∧
    front triRot t ((⟨5, by norm_num⟩ : Fin 6), a) = ((t : ℤ), (a : ℤ) - t) := by
  refine ⟨rfl, ?_, ?_, ?_, ?_, ?_⟩ <;>
    simp only [front, triRot, Function.iterate_succ_apply', Function.iterate_zero_apply, Prod.mk.injEq] <;>
    constructor <;> ring

-- [helper]
theorem tri_sphere_eq_image (t : ℕ) (ht : 0 < t) :
    sphere triDist t = ((univ : Finset (Fin 6)) ×ˢ range t).image (front triRot t) := by
  obtain ⟨f0, f1, f2, f3, f4, f5⟩ := fun a => tri_front_eq t a
  ext ⟨x, y⟩
  rw [tri_mem_sphere, mem_image]
  simp only [triDist]
  constructor
  · intro h
    by_cases c0 : 0 < x ∧ 0 ≤ y
    · refine ⟨(⟨0, by norm_num⟩, y.toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f0, Prod.mk.injEq]
      omega
    by_cases c1 : 0 < y ∧ x ≤ 0 ∧ 0 < x + y
    · refine ⟨(⟨1, by norm_num⟩, (-x).toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f1, Prod.mk.injEq]
      omega
    by_cases c2 : 0 < y ∧ x + y ≤ 0
    · refine ⟨(⟨2, by norm_num⟩, (-x - y).toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f2, Prod.mk.injEq]
      omega
    by_cases c3 : x < 0 ∧ y ≤ 0
    · refine ⟨(⟨3, by norm_num⟩, (-y).toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f3, Prod.mk.injEq]
      omega
    by_cases c4 : y < 0 ∧ 0 ≤ x ∧ x + y < 0
    · refine ⟨(⟨4, by norm_num⟩, x.toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f4, Prod.mk.injEq]
      omega
    · refine ⟨(⟨5, by norm_num⟩, (x + y).toNat), mem_product.2 ⟨mem_univ _, mem_range.2 (by omega)⟩, ?_⟩
      rw [f5, Prod.mk.injEq]
      omega
  · rintro ⟨⟨q, a⟩, hp, he⟩
    have ha : a < t := mem_range.1 (mem_product.1 hp).2
    obtain ⟨q, hq⟩ := q
    interval_cases q
    · rw [f0, Prod.mk.injEq] at he
      omega
    · rw [f1, Prod.mk.injEq] at he
      omega
    · rw [f2, Prod.mk.injEq] at he
      omega
    · rw [f3, Prod.mk.injEq] at he
      omega
    · rw [f4, Prod.mk.injEq] at he
      omega
    · rw [f5, Prod.mk.injEq] at he
      omega

-- [helper]
theorem tri_front_injOn (t : ℕ) :
    Set.InjOn (front triRot t) ↑((univ : Finset (Fin 6)) ×ˢ range t) := by
  obtain ⟨f0, f1, f2, f3, f4, f5⟩ := fun a => tri_front_eq t a
  rintro ⟨⟨q, hq⟩, a⟩ hp ⟨⟨q', hq'⟩, a'⟩ hp' he
  have ha : a < t := mem_range.1 (mem_product.1 hp).2
  have ha' : a' < t := mem_range.1 (mem_product.1 hp').2
  interval_cases q <;> interval_cases q' <;>
    simp only [f0, f1, f2, f3, f4, f5, Prod.mk.injEq] at he <;>
    simp only [Prod.mk.injEq, Fin.mk.injEq] <;>
    omega

/-- Walk distance on the triangular grid is the hexagonal norm `max(|x|, |y|, |x + y|)`. -/
theorem thm_res_tri_distance (v : Cell) :
    (∀ k < triDist v, walks (latticeNbr triDirs) 0 k v = 0) ∧
      0 < walks (latticeNbr triDirs) 0 (triDist v) v := by
  refine ⟨fun k hk => walks_eq_zero_of_lt triDirs triDist (by simp [triDist]) tri_step k v hk, ?_⟩
  rcases Nat.eq_zero_or_pos (triDist v) with h0 | hpos
  · have hv : v = 0 := by
      obtain ⟨x, y⟩ := v
      simp only [triDist] at h0
      ext <;> simp <;> omega
    subst hv
    simp [triDist, walks]
  · have hm : v ∈ sphere triDist (triDist v) := (tri_mem_sphere _ v).2 rfl
    rw [tri_sphere_eq_image _ hpos, mem_image] at hm
    obtain ⟨p, hp, rfl⟩ := hm
    have hw := ((lit_of_front triDirs triDist (by simp [triDist]) tri_step triRot tri_rot_add
      tri_rot_injective tri_rot_dirs 6 tri_quadrant _ (tri_sphere_eq_image _ hpos)
      (tri_front_injOn _) (fun _ => 0) rfl).1 p hp).2.1
    rw [hw]
    exact Nat.choose_pos (mem_range.1 (mem_product.1 hp).2).le

/-- A29 on `{6,3}`: for every `t ≥ 1` and every law `neighbour sum + h(own)` with `h 0 = 0`, the shell at distance
`t` has `6t` tiles, the tone on its tile `a` of each sector is `C(t, a)` mod 3, and `lit(t) = 6 (L3(t) - 1)`. -/
theorem thm_res_tri_lucas_front (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0) (t : ℕ) (ht : 0 < t) :
    (∀ p ∈ (univ : Finset (Fin 6)) ×ˢ range t, tone triDirs h t (front triRot t p) = (t.choose p.2 : ZMod 3)) ∧
    (sphere triDist t).card = 6 * t ∧
    lit triDirs triDist h t = 6 * (lucasCount 3 t - 1) := by
  obtain ⟨hf, hc, hl⟩ := lit_of_front triDirs triDist (by simp [triDist]) tri_step triRot
    tri_rot_add tri_rot_injective tri_rot_dirs 6 tri_quadrant t (tri_sphere_eq_image t ht)
    (tri_front_injOn t) h h0
  exact ⟨fun p hp => (hf p hp).2.2, hc, hl⟩

/-- The note's negative control: the base-2 count gives the wrong front already at `t = 2` on `{4,4}` (8 lit tiles,
against `4 (L2(2) - 1) = 4`), for every law with `h 0 = 0`. -/
theorem thm_res_lucas_base_two_fails (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0) :
    lit squareDirs squareDist h 2 = 8 ∧ lit squareDirs squareDist h 2 ≠ 4 * (lucasCount 2 2 - 1) := by
  have hl := (thm_res_square_lucas_front h h0 2 (by norm_num)).2.2
  have h3 : lucasCount 3 2 = 3 := by
    unfold lucasCount
    rw [Nat.digits_def' (by norm_num) (by norm_num)]
    norm_num
  have h2 : lucasCount 2 2 = 2 := by
    unfold lucasCount
    rw [Nat.digits_def' (by norm_num) (by norm_num), Nat.digits_def' (by norm_num) (by norm_num)]
    norm_num
  rw [hl, h3, h2]
  norm_num

/-! ### The uniform mode -/

/-- The uniform value recurrence `x(t+1) = c x(t) - x(t-1)` on the pair `(x(t-1), x(t))`. -/
def uniStep (c : ZMod 3) (x : ZMod 3 × ZMod 3) : ZMod 3 × ZMod 3 :=
  (x.2, c * x.2 - x.1)

/-- The uniform period for `c = p + σ`: 4, 6, 3 for `c = 0, 1, 2` (`uniformModePeriod` of `z3-resonance.ts`). -/
def uniformPeriod (c : ZMod 3) : ℕ :=
  if c = 0 then 4 else if c = 1 then 6 else 3

-- [helper]
theorem step_uniform {V : Type} (nbr : V → Finset V) (p : ℕ) (hp : ∀ i, (nbr i).card = p) (σ a b : ZMod 3) :
    step (linearLaw nbr σ) ((fun _ => a), (fun _ => b)) =
      ((fun _ => b), (fun _ => ((p : ZMod 3) + σ) * b - a)) := by
  refine Prod.ext rfl (funext fun i => ?_)
  simp only [step, linearLaw, law, Pi.sub_apply, sum_const, hp, nsmul_eq_mul]
  ring

/-- A30, first half: on any tile set where every tile has `p` neighbours, a uniform start `(a, b)` stays uniform
under the linear law with self term `σ`, at every step, its value following `x(t+1) = (p + σ) x(t) - x(t-1)`. -/
theorem thm_res_uniform_field {V : Type} (nbr : V → Finset V) (p : ℕ) (hp : ∀ i, (nbr i).card = p)
    (σ a b : ZMod 3) (n : ℕ) :
    (step (linearLaw nbr σ))^[n] ((fun _ => a), (fun _ => b)) =
      ((fun _ => ((uniStep ((p : ZMod 3) + σ))^[n] (a, b)).1),
        (fun _ => ((uniStep ((p : ZMod 3) + σ))^[n] (a, b)).2)) := by
  induction n with
  | zero => rfl
  | succ n ih =>
    rw [Function.iterate_succ_apply', ih, step_uniform nbr p hp, Function.iterate_succ_apply']
    rfl

-- [helper]
theorem uniStep_period_id : ∀ c : ZMod 3, ∀ x, (uniStep c)^[uniformPeriod c] x = x := by
  decide

-- [helper]
theorem uniStep_no_early_return :
    ∀ c : ZMod 3, ∀ r : Fin 6, r.val < uniformPeriod c → ((uniStep c)^[r.val] (0, 1) = (0, 1) ↔ r.val = 0) := by
  decide

-- [helper]
theorem uniStep_return_iff (c : ZMod 3) (n : ℕ) :
    (uniStep c)^[n] (0, 1) = (0, 1) ↔ uniformPeriod c ∣ n := by
  have hid : (uniStep c)^[uniformPeriod c] = id := funext (uniStep_period_id c)
  have hle : uniformPeriod c ≤ 6 := by
    unfold uniformPeriod
    split_ifs <;> norm_num
  have hpos : 0 < uniformPeriod c := by
    unfold uniformPeriod
    split_ifs <;> norm_num
  have key : (uniStep c)^[n] = (uniStep c)^[n % uniformPeriod c] := by
    conv_lhs => rw [← Nat.mod_add_div n (uniformPeriod c)]
    rw [Function.iterate_add, Function.iterate_mul, hid, Function.iterate_id, Function.comp_id]
  rw [key, Nat.dvd_iff_mod_eq_zero]
  have hr : n % uniformPeriod c < uniformPeriod c := Nat.mod_lt _ hpos
  exact uniStep_no_early_return c ⟨n % uniformPeriod c, by omega⟩ hr

/-- A30: from the all-ones start `(s(-1), s(0)) = (0, 1)` on any nonempty tile set where every tile has `p`
neighbours, under the linear law with self term `σ`, the state is back at step `n` exactly when
`uniformPeriod (p + σ)` divides `n`. The uniform period is 4, 6 or 3 as `p + σ ≡ 0, 1, 2 (mod 3)`: the degree and
the law alone, whatever the graph (flat or hyperbolic, any size). -/
theorem thm_res_uniform_mode {V : Type} [Nonempty V] (nbr : V → Finset V) (p : ℕ) (hp : ∀ i, (nbr i).card = p)
    (σ : ZMod 3) (n : ℕ) :
    (step (linearLaw nbr σ))^[n] (0, 1) = (0, 1) ↔ uniformPeriod ((p : ZMod 3) + σ) ∣ n := by
  have e : ((0 : Slice V), (1 : Slice V)) = ((fun _ => (0 : ZMod 3)), (fun _ => (1 : ZMod 3))) := rfl
  rw [e, thm_res_uniform_field nbr p hp, ← uniStep_return_iff]
  obtain ⟨v⟩ := ‹Nonempty V›
  constructor
  · intro H
    exact Prod.ext (congrFun (congrArg Prod.fst H) v) (congrFun (congrArg Prod.snd H) v)
  · intro H
    rw [H]

/-- The three uniform periods differ, so two (degree, law) pairs share the uniform period exactly when `p + σ`
agrees mod 3. Instances: degree 4 (`{4,4}`, `{4,5}`) has period 6 under self 0 and 3 under self 1; degree 6
(`{6,3}`, `{6,4}`) and degree 3 (`{3,6}`, `{3,7}`) both have 4 under self 0 and 6 under self 1; degree 24
(`{3,4,3,4}`) has 4 and 6. -/
theorem thm_res_uniform_period_injective :
    (∀ c c' : ZMod 3, uniformPeriod c = uniformPeriod c' ↔ c = c') ∧
    uniformPeriod ((4 : ℕ) : ZMod 3) = 6 ∧ uniformPeriod (((4 : ℕ) : ZMod 3) + 1) = 3 ∧
    uniformPeriod ((6 : ℕ) : ZMod 3) = 4 ∧ uniformPeriod (((6 : ℕ) : ZMod 3) + 1) = 6 ∧
    uniformPeriod ((3 : ℕ) : ZMod 3) = 4 ∧ uniformPeriod (((3 : ℕ) : ZMod 3) + 1) = 6 ∧
    uniformPeriod ((24 : ℕ) : ZMod 3) = 4 ∧ uniformPeriod (((24 : ℕ) : ZMod 3) + 1) = 6 := by
  decide

end Resonance

end Compute

end Vibe
