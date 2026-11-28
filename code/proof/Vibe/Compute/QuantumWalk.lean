import Mathlib.Analysis.InnerProductSpace.Orthonormal
import Mathlib.Data.Matrix.Mul
import Mathlib.Data.Nat.Prime.Basic
import Mathlib.Data.ZMod.Defs
import Mathlib.Algebra.BigOperators.Fin
import Mathlib.Tactic.FieldSimp
import Mathlib.Tactic.IntervalCases
import Mathlib.Tactic.LinearCombination

/-!
# Quantum walks and the bare-U search bound (Lean item L14, claims A14 and A15 of Q5)

The notes: `q-ladder.md` section Q5, the library `code/compute/quantum/walk.ts` and the
experiment `test/experiment/computation/bare-u-walk-search.ts` (E-CMP-0039).

## A14: the exact Grover walk

The walker sits on an arc `(v, i)` (cell `v`, facet `i : Fin d`). The coin on a cell is
`G = c J - I` with `J` the all-ones matrix; the Grover coin is `c = 2 / d`. A marked cell takes
the coin `-I`. The flip-flop shift moves the amplitude of each arc to its reverse arc, given as a
map `flip` on arcs. One beat is `walkStep c marked flip` (coin, then shift).

* `thm_qw_coin_sq_eq_one_iff`, `thm_qw_coin_orthogonal_iff`: over every commutative ring and every
  `d ≥ 1`, `c J - I` is symmetric and `Gᵀ G = G G = 1` exactly when `c (c d - 2) = 0`.
  `thm_qw_coin_orthogonal_iff_domain`, `thm_qw_coin_exists_iff`: over a domain, a nonzero `c` makes
  an orthogonal (real unitary) coin exactly when `c d = 2`, so an exact Grover coin exists in a
  ring exactly when `2 / d` is in it. `thm_qw_grover_coin_orthogonal`: over a field with `d ≠ 0`
  the coin `2/d J - I` is orthogonal.
* `thm_qw_two_div_mem_z_sixth_iff`: `2 / d` lies in `Z[1/6]` (it is `n / 6^k` for an integer `n`)
  exactly when `d = 2^a 3^b`. `thm_qw_exact_degrees_le_24`: among `1 ≤ d ≤ 24` these are
  `1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24`. `thm_qw_lab_degrees`: the lab degrees 2, 3, 4, 6, 8, 24
  have an exact coin and 5, 7 do not, so `{5,4}` and `{7,3}` have no exact Grover walk.
* `thm_qw_amplitudes_integral`: from the uniform start (amplitude 1 per arc), every amplitude at
  beat `t` is an integer over `q^t`, `q = d / gcd(2, d)`.
* `thm_qw_walk_sum_sq`: one beat keeps the sum of squared amplitudes (the norm: the coin is real)
  for every marked set and every bijective `flip`, whenever `c (c d - 2) = 0`.
* `thm_qw_unmarked_uniform_fixed`, `thm_qw_unmarked_prob`: with no marked cell the uniform state
  is fixed, so the probability of any cell stays exactly `1 / N` at every beat.
* `thm_qw_two_regular_amplitudes_unit`, `thm_qw_cycle_prob`: at degree 2 the coin `J - I` is the
  swap of the two arcs (`thm_qw_coin_two_is_swap`), every amplitude stays `±1` for every marked set
  and every `flip`, so on the cycle `Z/N` with the marked coin `-I` the marked cell's probability
  stays exactly `1 / N` forever.

## A15: the bare-U search bound

`thm_qw_sector_bound` and `thm_qw_line_confined_search_bound` are the general mechanism: in any
inner product space, if each beat `W k` is a linear isometry that keeps the span of the basis
states outside a set `S` of orthonormal basis states (nothing off the sector ever enters it), and
the readout `proj` is a contraction that kills that span, then from the uniform state on a finite set `X` of basis states the
readout probability is at most `|X ∩ S| / |X|` at every beat. `thm_qw_bare_u_search_bound` puts in
Q5's counts and gives `P ≤ (1 + 2R) / |B_R|`; `thm_qw_off_sector_never_reaches` is Q5's negative
control (a start off the sector reads exactly 0).

The reading for bare U: `H` is the one-excitation sector of the Fock model of `Vibe.FockBeat`
(each slot holds a vibe of sign `±1` and one of 2 roles, so `24 · 2 · 2 = 96` states per dock),
`e` its basis kets, `S` the states whose excitation lies on one of the 12 lines through the marked
dock on a slot along that line, `X` the `96 |B_R|` one-excitation states of the ball, of which
`96 (1 + 2R)` lie in `S`, `W k = U ∘ oracle`, and `proj` the projection on states with the
excitation at the marked dock. Two hypotheses are NOT proved here and stay as Q5 states them:
that `U` and the oracle keep a lone vibe on its line (E-CMP-0039 measures 0 off-line terms to
`R = 3`, 16 beats, both meshes), and the count `96 (1 + 2R)` (line coordinate equals hop distance,
gated to radius 3). The unitarity of `U` is proved in `Vibe.FockBeat`
(`thm_fock_beat_unitary_all_time`) over its own ring `NinthLoc6`, not over a Mathlib inner product
space, so that link is by reading, not by a Lean bridge. The bound needs no light cone: unitarity on
the line sector alone gives it.

Measurements that stay experiments (decision 008): the first-maximum beats `T`, probabilities `P`,
the figure of merit `R = T²/(P N)` and its `quadratic` or `slower` reading, the curvature
comparisons on closed quotients and balls, the spreading second moments, and the bare-U beat
tables of Q5. The Lean definitions here are not tied to `walk.ts` by a generated table: the
theorems speak about the Lean definitions.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Finset Matrix

/-! ## A14 (1): the coin `c J - I` -/

/-- The all-ones matrix `J` on `d` arcs. -/
def onesMat (R : Type*) [One R] (d : ℕ) : Matrix (Fin d) (Fin d) R :=
  Matrix.of fun _ _ => 1

/-- The coin `c J - I`; the Grover coin is `c = 2 / d`. -/
def groverCoin {R : Type*} [CommRing R] (d : ℕ) (c : R) : Matrix (Fin d) (Fin d) R :=
  c • onesMat R d - 1

section Coin

variable {R : Type*} [CommRing R] {d : ℕ}

theorem groverCoin_apply (c : R) (i j : Fin d) :
    groverCoin d c i j = if i = j then c - 1 else c := by
  by_cases h : i = j <;> simp [groverCoin, onesMat, h]

private theorem ite_coin (c : R) (i k : Fin d) :
    (if i = k then c - 1 else c) = c - (if i = k then 1 else 0) := by
  split_ifs <;> ring

/-- The coin is symmetric. -/
theorem thm_qw_coin_transpose (c : R) : (groverCoin d c)ᵀ = groverCoin d c := by
  ext i j
  rw [Matrix.transpose_apply, groverCoin_apply, groverCoin_apply]
  by_cases h : i = j
  · simp [h]
  · simp [h, Ne.symm h]

/-- `G G = c (c d - 2) J + I`. -/
theorem groverCoin_mul_self (c : R) :
    groverCoin d c * groverCoin d c = (c * (c * d - 2)) • onesMat R d + 1 := by
  ext i j
  simp only [Matrix.mul_apply, groverCoin_apply, ite_coin, Matrix.add_apply, Matrix.smul_apply,
    onesMat, Matrix.of_apply, Matrix.one_apply, smul_eq_mul, mul_one]
  have h : ∀ k : Fin d, (c - (if i = k then (1 : R) else 0)) * (c - (if k = j then 1 else 0)) =
      c * c - c * (if k = j then 1 else 0) - c * (if i = k then 1 else 0) +
        (if i = k then (if k = j then 1 else 0) else 0) := by
    intro k
    split_ifs <;> ring
  simp only [h, Finset.sum_add_distrib, Finset.sum_sub_distrib, ← Finset.mul_sum,
    Finset.sum_ite_eq, Finset.sum_ite_eq', Finset.mem_univ, ite_true, Finset.sum_const,
    Finset.card_univ, Fintype.card_fin, nsmul_eq_mul]
  ring

/-- Over every commutative ring and `d ≥ 1`, `G G = 1` exactly when `c (c d - 2) = 0`. -/
theorem thm_qw_coin_sq_eq_one_iff (hd : 0 < d) (c : R) :
    groverCoin d c * groverCoin d c = 1 ↔ c * (c * d - 2) = 0 := by
  rw [groverCoin_mul_self]
  constructor
  · intro h
    have h0 := congrFun₂ h ⟨0, hd⟩ ⟨0, hd⟩
    simpa [onesMat, Matrix.add_apply, Matrix.smul_apply] using h0
  · intro h
    rw [h, zero_smul, zero_add]

/-- The coin is orthogonal (`Gᵀ G = 1`, unitary since it is real) exactly when `c (c d - 2) = 0`. -/
theorem thm_qw_coin_orthogonal_iff (hd : 0 < d) (c : R) :
    (groverCoin d c)ᵀ * groverCoin d c = 1 ↔ c * (c * d - 2) = 0 := by
  rw [thm_qw_coin_transpose]
  exact thm_qw_coin_sq_eq_one_iff hd c

/-- Over a domain, a nonzero `c` gives an orthogonal coin exactly when `c d = 2`. -/
theorem thm_qw_coin_orthogonal_iff_domain [IsDomain R] (hd : 0 < d) {c : R} (hc : c ≠ 0) :
    (groverCoin d c)ᵀ * groverCoin d c = 1 ↔ c * d = 2 := by
  rw [thm_qw_coin_orthogonal_iff hd, mul_eq_zero, sub_eq_zero]
  exact ⟨fun h => h.resolve_left hc, Or.inr⟩

/-- An exact Grover coin (a nonzero `c` with `c J - I` orthogonal) exists in a domain where
    `2 ≠ 0` exactly when `2 / d` is in the ring. -/
theorem thm_qw_coin_exists_iff [IsDomain R] (hd : 0 < d) (h2 : (2 : R) ≠ 0) :
    (∃ c : R, c ≠ 0 ∧ (groverCoin d c)ᵀ * groverCoin d c = 1) ↔ ∃ c : R, c * d = 2 := by
  constructor
  · rintro ⟨c, hc, h⟩
    exact ⟨c, (thm_qw_coin_orthogonal_iff_domain hd hc).1 h⟩
  · rintro ⟨c, h⟩
    have hc : c ≠ 0 := by
      rintro rfl
      exact h2 (by simpa using h.symm)
    exact ⟨c, hc, (thm_qw_coin_orthogonal_iff_domain hd hc).2 h⟩

/-- Over a field with `d ≠ 0`, the Grover coin `2/d J - I` is orthogonal. -/
theorem thm_qw_grover_coin_orthogonal {K : Type*} [Field K] (hd : 0 < d) (hdK : (d : K) ≠ 0) :
    (groverCoin d ((2 : K) / d))ᵀ * groverCoin d ((2 : K) / d) = 1 := by
  rw [thm_qw_coin_orthogonal_iff hd]
  field_simp
  ring

/-- At degree 2 the Grover coin `J - I` is the swap of the two arcs. -/
theorem thm_qw_coin_two_is_swap : groverCoin 2 (1 : R) = !![0, 1; 1, 0] := by
  ext i j
  fin_cases i <;> fin_cases j <;> simp [groverCoin_apply]

end Coin

/-! ## A14 (2): `2 / d` in `Z[1/6]` exactly for `d = 2^a 3^b` -/

/-- `2 / d` is `n / 6^k` for an integer `n` exactly when `d = 2^a 3^b`. -/
theorem thm_qw_two_div_mem_z_sixth_iff (d : ℕ) (hd : 0 < d) :
    (∃ (n : ℤ) (k : ℕ), (2 : ℚ) / d = n / 6 ^ k) ↔ ∃ a b : ℕ, d = 2 ^ a * 3 ^ b := by
  constructor
  · rintro ⟨n, k, h⟩
    have hd' : (d : ℚ) ≠ 0 := by exact_mod_cast hd.ne'
    have h6 : (6 : ℚ) ^ k ≠ 0 := pow_ne_zero _ (by norm_num)
    rw [div_eq_div_iff hd' h6] at h
    have hz : ((2 * 6 ^ k : ℕ) : ℤ) = n * d := by exact_mod_cast h
    have hdvd : (d : ℤ) ∣ ((2 * 6 ^ k : ℕ) : ℤ) := ⟨n, by rw [hz, mul_comm]⟩
    have hdvd' : d ∣ 2 ^ (k + 1) * 3 ^ k := by
      have h2 : 2 * 6 ^ k = 2 ^ (k + 1) * 3 ^ k := by
        rw [show (6 : ℕ) = 2 * 3 by norm_num, mul_pow, pow_succ]
        ring
      rw [← h2]
      exact Int.natCast_dvd_natCast.mp hdvd
    obtain ⟨d1, d2, h1, h2, rfl⟩ := dvd_mul.mp hdvd'
    obtain ⟨a, -, rfl⟩ := (Nat.dvd_prime_pow Nat.prime_two).1 h1
    obtain ⟨b, -, rfl⟩ := (Nat.dvd_prime_pow Nat.prime_three).1 h2
    exact ⟨a, b, rfl⟩
  · rintro ⟨a, b, rfl⟩
    refine ⟨2 * 2 ^ b * 3 ^ a, a + b, ?_⟩
    have h2 : (2 : ℚ) ^ a ≠ 0 := pow_ne_zero _ (by norm_num)
    have h3 : (3 : ℚ) ^ b ≠ 0 := pow_ne_zero _ (by norm_num)
    have h6 : (6 : ℚ) ^ (a + b) ≠ 0 := pow_ne_zero _ (by norm_num)
    push_cast
    rw [div_eq_div_iff (mul_ne_zero h2 h3) h6, show (6 : ℚ) = 2 * 3 by norm_num, mul_pow,
      pow_add, pow_add]
    ring

/-- Among `1 ≤ d ≤ 24`, the degrees with `2 / d` in `Z[1/6]` are exactly these. -/
theorem thm_qw_exact_degrees_le_24 (d : ℕ) (h24 : d ≤ 24) :
    (∃ a b : ℕ, d = 2 ^ a * 3 ^ b) ↔ d ∈ [1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24] := by
  constructor
  · rintro ⟨a, b, rfl⟩
    have h2 : 1 ≤ 2 ^ a := Nat.one_le_two_pow
    have h3 : 1 ≤ 3 ^ b := Nat.one_le_pow _ _ (by norm_num)
    have ha : a < 5 := by
      by_contra hc
      have : 2 ^ 5 ≤ 2 ^ a := Nat.pow_le_pow_right (by norm_num) (by omega)
      have : 2 ^ a ≤ 2 ^ a * 3 ^ b := Nat.le_mul_of_pos_right _ (by omega)
      omega
    have hb : b < 3 := by
      by_contra hc
      have : 3 ^ 3 ≤ 3 ^ b := Nat.pow_le_pow_right (by norm_num) (by omega)
      have : 3 ^ b ≤ 2 ^ a * 3 ^ b := Nat.le_mul_of_pos_left _ (by omega)
      omega
    interval_cases a <;> interval_cases b <;> simp_all
  · intro h
    simp only [List.mem_cons, List.not_mem_nil, or_false] at h
    rcases h with rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl
    exacts [⟨0, 0, rfl⟩, ⟨1, 0, rfl⟩, ⟨0, 1, rfl⟩, ⟨2, 0, rfl⟩, ⟨1, 1, rfl⟩, ⟨3, 0, rfl⟩,
      ⟨0, 2, rfl⟩, ⟨2, 1, rfl⟩, ⟨4, 0, rfl⟩, ⟨1, 2, rfl⟩, ⟨3, 1, rfl⟩]

/-- The lab degrees 2, 3, 4, 6, 8, 24 have an exact Grover coin over `Z[1/6]`; 5 and 7
    (`{5,4}` and `{7,3}`) do not. -/
theorem thm_qw_lab_degrees :
    (∀ d : ℕ, d ∈ [2, 3, 4, 6, 8, 24] → ∃ (n : ℤ) (k : ℕ), (2 : ℚ) / d = n / 6 ^ k) ∧
    (∀ d : ℕ, d ∈ [5, 7] → ¬ ∃ (n : ℤ) (k : ℕ), (2 : ℚ) / d = n / 6 ^ k) := by
  constructor
  · intro d hd
    have h24 : d ≤ 24 := by simp only [List.mem_cons, List.not_mem_nil, or_false] at hd; omega
    have h0 : 0 < d := by simp only [List.mem_cons, List.not_mem_nil, or_false] at hd; omega
    rw [thm_qw_two_div_mem_z_sixth_iff d h0, thm_qw_exact_degrees_le_24 d h24]
    simp only [List.mem_cons, List.not_mem_nil, or_false] at hd ⊢
    omega
  · intro d hd
    have h24 : d ≤ 24 := by simp only [List.mem_cons, List.not_mem_nil, or_false] at hd; omega
    have h0 : 0 < d := by simp only [List.mem_cons, List.not_mem_nil, or_false] at hd; omega
    rw [thm_qw_two_div_mem_z_sixth_iff d h0, thm_qw_exact_degrees_le_24 d h24]
    simp only [List.mem_cons, List.not_mem_nil, or_false] at hd ⊢
    omega

/-! ## A14 (3): the walk -/

section Walk

variable {R : Type*} [CommRing R] {V : Type*} {d : ℕ}

/-- The coin layer: `c J - I` on the arcs of every unmarked cell, `-I` on a marked cell. -/
def coinStep (c : R) (marked : V → Bool) (ψ : V × Fin d → R) : V × Fin d → R :=
  fun a => if marked a.1 then -ψ a else c * ∑ j, ψ (a.1, j) - ψ a

/-- One beat: the coin, then the flip-flop shift (the amplitude of each arc comes from `flip` of
    it, the reverse arc). -/
def walkStep (c : R) (marked : V → Bool) (flip : V × Fin d → V × Fin d) (ψ : V × Fin d → R) :
    V × Fin d → R :=
  fun a => coinStep c marked ψ (flip a)

/-- On an unmarked cell the coin layer is the matrix `groverCoin d c` acting on the cell's arcs. -/
theorem coinStep_eq_mulVec (c : R) (marked : V → Bool) (ψ : V × Fin d → R) (v : V) (i : Fin d)
    (hv : marked v = false) :
    coinStep c marked ψ (v, i) = (groverCoin d c).mulVec (fun j => ψ (v, j)) i := by
  simp only [coinStep, hv, Bool.false_eq_true, ite_false, Matrix.mulVec, dotProduct,
    groverCoin_apply, ite_coin, sub_mul, one_mul, zero_mul, Finset.sum_sub_distrib,
    ← Finset.mul_sum, ite_mul, Finset.sum_ite_eq, Finset.mem_univ, ite_true]

/-- One beat keeps the sum of squared amplitudes, for every marked set and bijective `flip`,
    whenever `c (c d - 2) = 0` (for the Grover coin `c = 2/d`). -/
theorem thm_qw_walk_sum_sq [Fintype V] (c : R) (hc : c * (c * d - 2) = 0) (marked : V → Bool)
    (flip : Equiv.Perm (V × Fin d)) (ψ : V × Fin d → R) :
    ∑ a, (walkStep c marked flip ψ a) ^ 2 = ∑ a, ψ a ^ 2 := by
  simp only [walkStep]
  rw [Equiv.sum_comp flip (fun a => (coinStep c marked ψ a) ^ 2), Fintype.sum_prod_type,
    Fintype.sum_prod_type]
  refine Finset.sum_congr rfl fun v _ => ?_
  by_cases hm : marked v = true
  · simp [coinStep, hm]
  · simp only [coinStep, hm, Bool.false_eq_true, ite_false]
    set S := ∑ j, ψ (v, j) with hS
    have h : ∀ i : Fin d, (c * S - ψ (v, i)) ^ 2 = c ^ 2 * S ^ 2 - 2 * c * S * ψ (v, i) +
        ψ (v, i) ^ 2 := fun i => by ring
    simp only [h, Finset.sum_add_distrib, Finset.sum_sub_distrib, ← Finset.mul_sum, ← hS,
      Finset.sum_const, Finset.card_univ, Fintype.card_fin, nsmul_eq_mul]
    linear_combination S ^ 2 * hc

/-- With no marked cell and `c d = 2`, the uniform state (amplitude 1 per arc) is fixed. -/
theorem thm_qw_unmarked_uniform_fixed (c : R) (hc : c * d = 2) (flip : V × Fin d → V × Fin d) :
    ∀ t : ℕ, (walkStep c (fun _ => false) flip)^[t] (fun _ => 1) = fun _ => 1 := by
  have h1 : walkStep c (fun _ => false) flip (fun _ => (1 : R)) = fun _ => 1 := by
    funext a
    simp only [walkStep, coinStep, Bool.false_eq_true, ite_false, Finset.sum_const,
      Finset.card_univ, Fintype.card_fin, nsmul_eq_mul, mul_one, hc]
    norm_num
  intro t
  exact Function.iterate_fixed h1 t

/-- The probability of cell `m`: its arcs' squared amplitudes over `d N` (the uniform start has
    amplitude 1 per arc, so `1 / sqrt (d N)` never enters). -/
def markedProb [Fintype V] (ψ : V × Fin d → ℚ) (m : V) : ℚ :=
  (∑ i, ψ (m, i) ^ 2) / (d * Fintype.card V)

/-- With no marked cell the Grover walk keeps every cell's probability exactly `1 / N`. -/
theorem thm_qw_unmarked_prob [Fintype V] [Nonempty V] (hd : 0 < d)
    (flip : V × Fin d → V × Fin d) :
    ∀ (t : ℕ) (m : V),
      markedProb ((walkStep ((2 : ℚ) / d) (fun _ => false) flip)^[t] (fun _ => 1)) m =
        1 / Fintype.card V := by
  intro t m
  have hd' : (d : ℚ) ≠ 0 := by exact_mod_cast hd.ne'
  have hN : (Fintype.card V : ℚ) ≠ 0 := by exact_mod_cast Fintype.card_ne_zero
  rw [thm_qw_unmarked_uniform_fixed _ (by field_simp) flip t]
  simp only [markedProb, one_pow, Finset.sum_const, Finset.card_univ, Fintype.card_fin,
    nsmul_eq_mul, mul_one]
  field_simp

/-- From the uniform start, every amplitude at beat `t` is an integer over `q^t`,
    `q = d / gcd(2, d)`, for every marked set and every `flip`. -/
theorem thm_qw_amplitudes_integral (hd : 0 < d) (marked : V → Bool)
    (flip : V × Fin d → V × Fin d) :
    ∀ (t : ℕ) (a : V × Fin d), ∃ n : ℤ,
      ((d / Nat.gcd 2 d : ℕ) : ℚ) ^ t *
        (walkStep ((2 : ℚ) / d) marked flip)^[t] (fun _ => 1) a = n := by
  set q := d / Nat.gcd 2 d with hq
  have hqc : ∃ m : ℤ, (q : ℚ) * (2 / d) = m := by
    obtain ⟨m, hm⟩ := Nat.gcd_dvd_left 2 d
    have hg : 0 < Nat.gcd 2 d := Nat.gcd_pos_of_pos_left _ (by norm_num)
    have hqd : q * Nat.gcd 2 d = d := Nat.div_mul_cancel (Nat.gcd_dvd_right 2 d)
    refine ⟨(m : ℤ), ?_⟩
    rw [Int.cast_natCast]
    have hd' : (d : ℚ) ≠ 0 := by exact_mod_cast hd.ne'
    have hqd' : (q : ℚ) * (Nat.gcd 2 d : ℚ) = d := by exact_mod_cast hqd
    have hm' : (2 : ℚ) = (Nat.gcd 2 d : ℚ) * m := by exact_mod_cast hm
    rw [hm', ← hqd']
    have hg' : (Nat.gcd 2 d : ℚ) ≠ 0 := by exact_mod_cast hg.ne'
    have hq0 : (q : ℚ) ≠ 0 := by
      intro h0
      rw [h0, zero_mul] at hqd'
      exact hd' hqd'.symm
    field_simp
  obtain ⟨m, hm⟩ := hqc
  intro t
  induction t with
  | zero => intro a; exact ⟨1, by simp⟩
  | succ t ih =>
    choose f hf using ih
    intro a
    rw [Function.iterate_succ_apply']
    simp only [walkStep, coinStep]
    by_cases hmk : marked (flip a).1 = true
    · refine ⟨-(q * f (flip a)), ?_⟩
      simp only [hmk, ite_true]
      push_cast
      rw [← hf (flip a), pow_succ]
      ring
    · refine ⟨m * ∑ j, f ((flip a).1, j) - q * f (flip a), ?_⟩
      simp only [hmk, Bool.false_eq_true, ite_false]
      push_cast
      simp only [← hf, ← hm]
      simp only [← Finset.mul_sum]
      ring

/-- At degree 2 with the coin `J - I` (the swap), every amplitude stays `±1` from the uniform
    start, for every marked set and every `flip`. -/
theorem thm_qw_two_regular_amplitudes_unit (marked : V → Bool)
    (flip : V × Fin 2 → V × Fin 2) :
    ∀ (t : ℕ) (a : V × Fin 2), ((walkStep (1 : R) marked flip)^[t] (fun _ => 1) a) ^ 2 = 1 := by
  intro t
  induction t with
  | zero => intro a; simp
  | succ t ih =>
    intro a
    rw [Function.iterate_succ_apply']
    simp only [walkStep, coinStep]
    obtain ⟨v, i⟩ := flip a
    by_cases hmk : marked v = true
    · simp only [hmk, ite_true, neg_sq]
      exact ih (v, i)
    · simp only [hmk, Bool.false_eq_true, ite_false, one_mul, Fin.sum_univ_two]
      fin_cases i
      · simpa using ih (v, 1)
      · simpa using ih (v, 0)

/-- The flip-flop shift of the cycle `Z/N`: facet 0 points to `v + 1`, facet 1 to `v - 1`. -/
def cycleFlip (N : ℕ) : ZMod N × Fin 2 → ZMod N × Fin 2 :=
  fun a => if a.2 = 0 then (a.1 + 1, 1) else (a.1 - 1, 0)

theorem cycleFlip_involutive (N : ℕ) : Function.Involutive (cycleFlip N) := by
  rintro ⟨v, i⟩
  fin_cases i <;> simp [cycleFlip]

/-- On the cycle `Z/N` the Grover walk (degree 2, coin `2/2 J - I = J - I`) with the marked coin
    `-I` keeps the probability of every cell, the marked ones included, exactly `1 / N` at every
    beat, for every marked set: it is a degenerate negative control, not a slow search. -/
theorem thm_qw_cycle_prob (N : ℕ) [NeZero N] (marked : ZMod N → Bool) :
    ∀ (t : ℕ) (m : ZMod N),
      markedProb ((walkStep ((2 : ℚ) / 2) marked (cycleFlip N))^[t] (fun _ => 1)) m = 1 / N := by
  intro t m
  have hN : (N : ℚ) ≠ 0 := by exact_mod_cast NeZero.ne N
  rw [show (2 : ℚ) / 2 = 1 by norm_num]
  simp only [markedProb, Fin.sum_univ_two, thm_qw_two_regular_amplitudes_unit, ZMod.card]
  field_simp
  norm_num

end Walk

/-! ## A15: the bare-U search bound -/

section Search

variable {𝕜 H ι : Type*} [RCLike 𝕜] [NormedAddCommGroup H] [InnerProductSpace 𝕜 H]

/-- `t` beats: `W (t - 1) ∘ ... ∘ W 0`. -/
def evolve (W : ℕ → H →ₗᵢ[𝕜] H) : ℕ → H → H
  | 0, ψ => ψ
  | t + 1, ψ => W t (evolve W t ψ)

private theorem evolve_add (W : ℕ → H →ₗᵢ[𝕜] H) (t : ℕ) (x y : H) :
    evolve W t (x + y) = evolve W t x + evolve W t y := by
  induction t with
  | zero => rfl
  | succ t ih => simp only [evolve, ih, map_add]

private theorem evolve_norm (W : ℕ → H →ₗᵢ[𝕜] H) (t : ℕ) (x : H) :
    ‖evolve W t x‖ = ‖x‖ := by
  induction t with
  | zero => rfl
  | succ t ih => simp only [evolve, LinearIsometry.norm_map, ih]

private theorem evolve_mem (W : ℕ → H →ₗᵢ[𝕜] H) (K : Submodule 𝕜 H)
    (hK : ∀ k, ∀ x ∈ K, W k x ∈ K) (t : ℕ) {x : H} (hx : x ∈ K) : evolve W t x ∈ K := by
  induction t with
  | zero => exact hx
  | succ t ih => exact hK t _ ih

/-- A start in the complement's span never reaches the readout: Q5's negative control (a start on
    the 11 lines through a neighbour that miss the marked dock reads exactly 0). -/
theorem thm_qw_off_sector_never_reaches (W : ℕ → H →ₗᵢ[𝕜] H) (Kc : Submodule 𝕜 H)
    (hKc : ∀ k, ∀ x ∈ Kc, W k x ∈ Kc) (proj : H →ₗ[𝕜] H) (hprojc : ∀ x ∈ Kc, proj x = 0)
    (t : ℕ) {b : H} (hb : b ∈ Kc) : proj (evolve W t b) = 0 :=
  hprojc _ (evolve_mem W Kc hKc t hb)

/-- The sector bound: if every beat is a linear isometry keeping `Kc`, and the readout `proj` is a
    contraction killing `Kc`, then from `a + b` with `b ∈ Kc` the readout never exceeds `‖a‖` at
    any beat. (For a unitary beat, keeping `Kc` is the same as keeping its orthogonal complement,
    the sector; the proof needs only the first.) -/
theorem thm_qw_sector_bound (W : ℕ → H →ₗᵢ[𝕜] H) (Kc : Submodule 𝕜 H)
    (hKc : ∀ k, ∀ x ∈ Kc, W k x ∈ Kc)
    (proj : H →ₗ[𝕜] H) (hproj : ∀ x, ‖proj x‖ ≤ ‖x‖) (hprojc : ∀ x ∈ Kc, proj x = 0)
    (t : ℕ) (a : H) {b : H} (hb : b ∈ Kc) :
    ‖proj (evolve W t (a + b))‖ ≤ ‖a‖ := by
  rw [evolve_add, map_add, thm_qw_off_sector_never_reaches W Kc hKc proj hprojc t hb, add_zero,
    ← evolve_norm W t a]
  exact hproj _

/-- The line-confined search bound: with orthonormal basis states `e`, a sector `S`, beats that
    are linear isometries keeping the span of `e '' Sᶜ` (no state off the sector ever enters it), a
    contraction readout killing that span, and the uniform start `c` on a finite set `X`
    (`|X| ‖c‖² = 1`), the readout probability is at most `|X ∩ S| / |X|` at every beat. -/
theorem thm_qw_line_confined_search_bound (e : ι → H) (he : Orthonormal 𝕜 e) (S : Set ι)
    [DecidablePred (· ∈ S)] (W : ℕ → H →ₗᵢ[𝕜] H)
    (hKc : ∀ k, ∀ x ∈ Submodule.span 𝕜 (e '' Sᶜ), W k x ∈ Submodule.span 𝕜 (e '' Sᶜ))
    (proj : H →ₗ[𝕜] H) (hproj : ∀ x, ‖proj x‖ ≤ ‖x‖)
    (hprojc : ∀ x ∈ Submodule.span 𝕜 (e '' Sᶜ), proj x = 0)
    (X : Finset ι) (c : 𝕜) (hc : (X.card : ℝ) * ‖c‖ ^ 2 = 1) (t : ℕ) :
    ‖proj (evolve W t (∑ i ∈ X, c • e i))‖ ^ 2 ≤ ((X.filter (· ∈ S)).card : ℝ) / X.card := by
  rw [← Finset.sum_filter_add_sum_filter_not X (· ∈ S)]
  set a := ∑ i ∈ X.filter (· ∈ S), c • e i with ha_def
  have hb : ∑ i ∈ X.filter (fun i => ¬ i ∈ S), c • e i ∈ Submodule.span 𝕜 (e '' Sᶜ) :=
    Submodule.sum_mem _ fun i hi =>
      Submodule.smul_mem _ _ (Submodule.subset_span ⟨i, (Finset.mem_filter.1 hi).2, rfl⟩)
  have hbound := thm_qw_sector_bound W _ hKc proj hproj hprojc t a hb
  have hnorm : ‖a‖ ^ 2 = ((X.filter (· ∈ S)).card : ℝ) * ‖c‖ ^ 2 := by
    have h1 := he.inner_sum (fun _ => c) (fun _ => c) (X.filter (· ∈ S))
    rw [← ha_def, inner_self_eq_norm_sq_to_K] at h1
    simp only [RCLike.conj_mul, Finset.sum_const, nsmul_eq_mul] at h1
    have h2 : ((‖a‖ ^ 2 : ℝ) : 𝕜) = (((X.filter (· ∈ S)).card * ‖c‖ ^ 2 : ℝ) : 𝕜) := by
      push_cast
      exact h1
    exact RCLike.ofReal_injective h2
  have hX : (X.card : ℝ) ≠ 0 := by
    intro h0
    rw [h0, zero_mul] at hc
    exact zero_ne_one hc
  have hc2 : ‖c‖ ^ 2 = 1 / X.card := by
    field_simp
    linarith
  calc ‖proj (evolve W t (a + ∑ i ∈ X.filter (fun i => ¬ i ∈ S), c • e i))‖ ^ 2 ≤ ‖a‖ ^ 2 :=
        pow_le_pow_left₀ (norm_nonneg _) hbound 2
    _ = ((X.filter (· ∈ S)).card : ℝ) / X.card := by
        rw [hnorm, hc2]
        ring

/-- Q5's bare-U bound: with `|X| = 96 |B_R|` one-excitation states in the ball and
    `96 (1 + 2R)` of them on the 12 lines through the marked dock, `P ≤ (1 + 2R) / |B_R|` at every
    beat. The hypotheses (line confinement of a lone vibe under `U` and the oracle, the count) are
    those of Q5; see the module docstring for which are proved and which are measured. -/
theorem thm_qw_bare_u_search_bound (e : ι → H) (he : Orthonormal 𝕜 e) (S : Set ι)
    [DecidablePred (· ∈ S)] (W : ℕ → H →ₗᵢ[𝕜] H)
    (hKc : ∀ k, ∀ x ∈ Submodule.span 𝕜 (e '' Sᶜ), W k x ∈ Submodule.span 𝕜 (e '' Sᶜ))
    (proj : H →ₗ[𝕜] H) (hproj : ∀ x, ‖proj x‖ ≤ ‖x‖)
    (hprojc : ∀ x ∈ Submodule.span 𝕜 (e '' Sᶜ), proj x = 0)
    (X : Finset ι) (c : 𝕜) (hc : (X.card : ℝ) * ‖c‖ ^ 2 = 1) (ballSize radius : ℕ)
    (hX : X.card = 96 * ballSize) (hS : (X.filter (· ∈ S)).card = 96 * (1 + 2 * radius))
    (t : ℕ) :
    ‖proj (evolve W t (∑ i ∈ X, c • e i))‖ ^ 2 ≤ (1 + 2 * radius : ℝ) / ballSize := by
  have h := thm_qw_line_confined_search_bound e he S W hKc proj hproj hprojc X c hc t
  rw [hX, hS] at h
  push_cast at h
  rwa [mul_div_mul_left _ _ (by norm_num : (96 : ℝ) ≠ 0)] at h

end Search

end Compute

end Vibe
