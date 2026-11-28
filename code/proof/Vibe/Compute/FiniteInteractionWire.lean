import Mathlib.Data.Set.Finite.Lattice
import Mathlib.Data.Int.Interval
import Vibe.Compute.Round
import Vibe.Compute.RuleCensus

/-!
# Vibe Computation Lab: Finitely Many Interactions for the One-Sided-Wire Cells on the Line

Claim A8 (M6, reactive cells with a one-sided wire, and
P29). On the brick line every finite start of the 8 one-sided-wire cells
has finitely many interactions, so after some step every tone flies free and no counter with a zero
test, no Minsky machine and no Turing machine runs there from a finite start.

**The line.** Cells are the integers, a configuration is `Config ℤ`, and the brick schedule is the
two matchings `brickAt 0` (pairs `(2k, 2k + 1)`) and `brickAt 1` (pairs `(2k + 1, 2k + 2)`), the
left cell of every pair its first cell (`lineBrickRun` of gates.ts: colour 0 first, the pair
`(i, i + 1)` with `i` of the colour's parity). `brick` is the schedule `[brickAt 0, brickAt 1]` of
`Vibe.Compute.round`, and `lineState f x s` the configuration after `s` matchings.

**The ray picture** (`rayEvent`). Every pair joins a right ray (its first cell, which leaves as the
second) and a left ray. Right ray `i` starts on cell `2i`, left ray `j` on cell `2j + 1`, and right
ray `i` meets left ray `i + d` once, at step `d`; `rayEvent f r l d i` is the pair of tones at that
meeting. An interaction is a meeting that is not a pass, that is, where the rule does not simply
swap the two cells (`f p ≠ prSwap p`).

Headline theorems:
1. `thm_fiw_ray_bridge`: the brick line is the ray grid. After `s` matchings cell `c` holds the
   right-ray or left-ray tone of `rayEvent` (by the parity of `c - s`), the pair at step `s` with
   first cell `2i + s` is `rayEvent f r l s i`, the line's interactions are the grid's, and `n`
   rounds of `round f brick` are `2n` matchings.
2. `thm_fiw_deficit_two_steps`: for any sum-keeping rule quiet on a background `b ≠ 0`, a left tone
   that meets two background right rays in a row passes every later one (each non-pass lowers its
   deficit `|t - b|`, which is at most 2).
3. `thm_fiw_grid_finite`: for any sum-keeping rule with a background `b ≠ 0` on which every tone
   passes a background partner on one fixed side (`f (t, b) = (b, t)` for every `t`, or the mirror
   `f (b, t) = (t, b)`), every grid whose ray starts are off the background finitely often has
   finitely many interactions (m6 steps 1 to 4: the deficit induction over the window's left rays
   from the left; the mirror side by the reflection `prConjP`).
4. `thm_fiw_line_finite`: the same rules on the brick line: every start with finitely many cells
   off the background has finitely many interactions; from some step on, every matching acts as
   the swap `prSwap` (free flight), and from some round on `round f brick` equals
   `round prSwap brick` on the orbit.
5. `thm_fiw_free_flight`: after that step every tone moves one cell per matching along its ray:
   cell `c` at step `s + m` holds what cell `c - m` (a right mover) or `c + m` (a left mover) held
   at step `s`. So whether a cell ever holds a tone is read off one finite configuration.
6. `thm_fiw_wire_cells`: each of the 8 one-sided-wire cells of `RuleCensus` (`wireSide` some, the
   list of `thm_rule_census_wire_cells`) satisfies the hypotheses of 3 and 4, so all of the above
   holds for all 8.

The hypotheses of 3 to 5 are weaker than the note's: any pair rule that keeps the pair sum (not
only the 24 reversible ones), any background `b ≠ 0` and only "every tone passes a background
partner on the wire side" (the census's `wireSide` also asks the other side to fail, which the proof
does not use). The rules of 6 are tied to the code by `RuleCensus` (`gen_rule_census_cells_eq`);
the brick matchings are Lean definitions of the declared schedule, equal to
`lineBrickRun`'s pair order by construction, not by a generated table.

Mathlib (`Set.Finite`, `BddAbove`, `Set.finite_Icc`), zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

namespace WireLine

open Function

/-! ## The ray grid -/

/-- The tones (right ray, left ray) where right ray `i` meets left ray `i + d`, at step `d`, given
    the start tones `r` of the right rays and `l` of the left rays. -/
def rayEvent (f : Pair → Pair) (r l : ℤ → Tone) : ℕ → ℤ → Pair
  | 0, i => (r i, l i)
  | d + 1, i => ((f (rayEvent f r l d i)).2, (f (rayEvent f r l d (i + 1))).1)

/-- A meeting is a pass when the rule swaps the two cells, so each tone stays on its ray. -/
def IsPass (f : Pair → Pair) (p : Pair) : Prop := f p = prSwap p

/-- The interactions of the grid: the meetings `(d, i)` that are not passes. -/
def rayInteractions (f : Pair → Pair) (r l : ℤ → Tone) : Set (ℕ × ℤ) :=
  {e | ¬ IsPass f (rayEvent f r l e.1 e.2)}

-- [helper]
theorem ray_event_succ_fst (f : Pair → Pair) (r l : ℤ → Tone) (d : ℕ) (i : ℤ) :
    (rayEvent f r l (d + 1) i).1 = (f (rayEvent f r l d i)).2 := rfl

-- [helper]
theorem ray_event_succ_snd (f : Pair → Pair) (r l : ℤ → Tone) (d : ℕ) (i : ℤ) :
    (rayEvent f r l (d + 1) i).2 = (f (rayEvent f r l d (i + 1))).1 := rfl

private theorem pair_of_fst {p : Pair} {b : Tone} (h : p.1 = b) : p = (b, p.2) := by
  rw [← h]

private theorem pair_of_snd {p : Pair} {b : Tone} (h : p.2 = b) : p = (p.1, b) := by
  rw [← h]

/-! ## The deficit -/

/-- The deficit of tone `t` on background `b`: `|t - b|`. -/
def deficit (b t : Tone) : ℕ := (t.value - b.value).natAbs

/-- The tone a left ray carries on after meeting a background right ray. -/
def leftOut (f : Pair → Pair) (b t : Tone) : Tone := (f (b, t)).1

private theorem pass_or_drop (f : Pair → Pair) (hS : PrSumPres f) (b : Tone) (hb : b ≠ .zero)
    (t : Tone) : f (b, t) = (t, b) ∨ deficit b (f (b, t)).1 < deficit b t := by
  have h := hS (b, t)
  unfold prSum at h
  revert h
  generalize f (b, t) = p
  obtain ⟨u, w⟩ := p
  cases b <;> cases t <;> cases u <;> cases w <;> first | exact absurd rfl hb | decide

/-- **The deficit step.** For any pair rule that keeps the pair sum and is quiet on a background
    `b ≠ 0`, a left tone `t` that meets a background right ray either passes it or leaves with a
    strictly smaller deficit; so after two background right rays in a row it passes every later one
    (`leftOut` is the tone it carries on). -/
theorem thm_fiw_deficit_two_steps (f : Pair → Pair) (hS : PrSumPres f) (b : Tone) (hb : b ≠ .zero)
    (hq : f (b, b) = (b, b)) (t : Tone) :
    (f (b, t) = (t, b) ∨ deficit b (leftOut f b t) < deficit b t) ∧
    f (b, leftOut f b (leftOut f b t)) = (leftOut f b (leftOut f b t), b) := by
  have fix : ∀ u, f (b, u) = (u, b) → leftOut f b u = u := fun u hu => by
    simp only [leftOut, hu]
  have le2 : ∀ u, deficit b u ≤ 2 := by
    intro u; cases b <;> cases u <;> decide
  have zero : ∀ u, deficit b u = 0 → u = b := by
    intro u; cases b <;> cases u <;> decide
  refine ⟨pass_or_drop f hS b hb t, ?_⟩
  rcases pass_or_drop f hS b hb t with h1 | h1
  · have e := fix t h1
    simp only [e]
    exact h1
  · rcases pass_or_drop f hS b hb (leftOut f b t) with h2 | h2
    · rw [fix _ h2]
      exact h2
    · have hz : deficit b (leftOut f b (leftOut f b t)) = 0 := by
        have := le2 t
        unfold leftOut at *
        omega
      rw [zero _ hz]
      exact hq

/-! ## The finite-interaction theorem on the grid -/

section Grid

variable (f : Pair → Pair) (r l : ℤ → Tone)

/-- Left of the window every meeting holds the background on both rays. -/
private theorem grid_left (b : Tone) (hq : f (b, b) = (b, b)) (lo : ℤ)
    (hr : ∀ i, i < lo → r i = b) (hl : ∀ i, i < lo → l i = b) :
    ∀ d : ℕ, ∀ i : ℤ, i + d < lo → rayEvent f r l d i = (b, b) := by
  intro d
  induction d with
  | zero =>
    intro i h
    show (r i, l i) = (b, b)
    rw [hr i (by omega), hl i (by omega)]
  | succ d ih =>
    intro i h
    show ((f (rayEvent f r l d i)).2, (f (rayEvent f r l d (i + 1))).1) = (b, b)
    rw [ih i (by omega), ih (i + 1) (by omega), hq]

/-- Right of the window every left ray holds the background: it meets right-ray tones that pass
    it. -/
private theorem grid_right (b : Tone) (hw : ∀ t, f (t, b) = (b, t)) (hi : ℤ)
    (hl : ∀ i, hi < i → l i = b) :
    ∀ d : ℕ, ∀ i : ℤ, hi < i + d → (rayEvent f r l d i).2 = b := by
  intro d
  induction d with
  | zero =>
    intro i h
    exact hl i (by omega)
  | succ d ih =>
    intro i h
    rw [ray_event_succ_snd, pair_of_snd (ih (i + 1) (by omega)), hw]

/-- The tone of left ray `j` after it has met `k` right rays (at its meeting with right ray
    `j - k`). -/
private def leftTone (j : ℤ) (k : ℕ) : Tone := (rayEvent f r l k (j - k)).2

/-- One left ray: if, from some meeting on, the right rays leave left ray `j - 1` as background,
    then from some meeting on they also reach left ray `j` as background and pass it. -/
private theorem grid_ray (hS : PrSumPres f) (b : Tone) (hb : b ≠ .zero)
    (hw : ∀ t, f (t, b) = (b, t)) (j : ℤ)
    (hprev : ∃ K : ℕ, ∀ k, K ≤ k →
      (rayEvent f r l k (j - 1 - k)).1 = b ∧ IsPass f (rayEvent f r l k (j - 1 - k))) :
    ∃ K : ℕ, ∀ k, K ≤ k → (rayEvent f r l k (j - k)).1 = b ∧ IsPass f (rayEvent f r l k (j - k)) := by
  have hq : f (b, b) = (b, b) := hw b
  obtain ⟨K', hK'⟩ := hprev
  have hin : ∀ k, K' + 1 ≤ k → (rayEvent f r l k (j - k)).1 = b := by
    intro k hk
    obtain ⟨m, rfl⟩ : ∃ m, k = m + 1 := ⟨k - 1, by omega⟩
    rw [ray_event_succ_fst, show j - ((m + 1 : ℕ) : ℤ) = j - 1 - m by push_cast; ring]
    obtain ⟨h1, h2⟩ := hK' m (by omega)
    rw [h2]
    exact h1
  have hstep : ∀ k, K' + 1 ≤ k → leftTone f r l j (k + 1) = leftOut f b (leftTone f r l j k) := by
    intro k hk
    unfold leftTone
    rw [ray_event_succ_snd, show j - ((k + 1 : ℕ) : ℤ) + 1 = j - k by push_cast; ring,
      pair_of_fst (hin k hk)]
    rfl
  have hpass : ∀ m, f (b, leftTone f r l j (K' + 1 + 2 + m)) = (leftTone f r l j (K' + 1 + 2 + m), b) := by
    intro m
    induction m with
    | zero =>
      rw [Nat.add_zero, show K' + 1 + 2 = K' + 1 + 1 + 1 by rfl, hstep _ (by omega),
        hstep _ (by omega)]
      exact (thm_fiw_deficit_two_steps f hS b hb hq _).2
    | succ m ih =>
      rw [show K' + 1 + 2 + (m + 1) = K' + 1 + 2 + m + 1 by rfl, hstep _ (by omega)]
      have e : leftOut f b (leftTone f r l j (K' + 1 + 2 + m)) = leftTone f r l j (K' + 1 + 2 + m) := by
        simp only [leftOut, ih]
      rw [e]
      exact ih
  refine ⟨K' + 1 + 2, fun k hk => ?_⟩
  obtain ⟨m, rfl⟩ : ∃ m, k = K' + 1 + 2 + m := ⟨k - (K' + 1 + 2), by omega⟩
  refine ⟨hin _ (by omega), ?_⟩
  unfold IsPass
  rw [pair_of_fst (hin _ (by omega))]
  exact hpass m

/-- Every left ray: from some meeting on, the right rays reach it as background and pass it. -/
private theorem grid_rays (hS : PrSumPres f) (b : Tone) (hb : b ≠ .zero)
    (hw : ∀ t, f (t, b) = (b, t)) (lo : ℤ) (hr : ∀ i, i < lo → r i = b)
    (hl : ∀ i, i < lo → l i = b) :
    ∀ j : ℤ, ∃ K : ℕ, ∀ k, K ≤ k →
      (rayEvent f r l k (j - k)).1 = b ∧ IsPass f (rayEvent f r l k (j - k)) := by
  have hq : f (b, b) = (b, b) := hw b
  have base : ∀ j, j < lo → ∃ K : ℕ, ∀ k, K ≤ k →
      (rayEvent f r l k (j - k)).1 = b ∧ IsPass f (rayEvent f r l k (j - k)) := by
    intro j hj
    refine ⟨0, fun k _ => ?_⟩
    rw [grid_left f r l b hq lo hr hl k (j - k) (by omega)]
    exact ⟨rfl, hq⟩
  have up : ∀ n : ℕ, ∀ j, j < lo + n → ∃ K : ℕ, ∀ k, K ≤ k →
      (rayEvent f r l k (j - k)).1 = b ∧ IsPass f (rayEvent f r l k (j - k)) := by
    intro n
    induction n with
    | zero => intro j hj; exact base j (by omega)
    | succ n ih =>
      intro j hj
      by_cases h : j < lo + n
      · exact ih j h
      · exact grid_ray f r l hS b hb hw j (ih (j - 1) (by omega))
  intro j
  rcases lt_or_ge j lo with h | h
  · exact base j h
  · have e := Int.toNat_of_nonneg (show 0 ≤ j - lo by omega)
    exact up ((j - lo).toNat + 1) j (by push_cast; omega)

/-- The grid theorem with the wire on the right rays. -/
private theorem grid_finite_right (hS : PrSumPres f) (b : Tone) (hb : b ≠ .zero)
    (hw : ∀ t, f (t, b) = (b, t)) (hfin : {i | r i ≠ b ∨ l i ≠ b}.Finite) :
    (rayInteractions f r l).Finite := by
  have hq : f (b, b) = (b, b) := hw b
  obtain ⟨lo, hlo⟩ := hfin.bddBelow
  obtain ⟨hi, hhi⟩ := hfin.bddAbove
  have hout : ∀ i, (i < lo ∨ hi < i) → r i = b ∧ l i = b := by
    intro i hi'
    by_contra hc
    have hm : i ∈ {i | r i ≠ b ∨ l i ≠ b} := by
      rw [Set.mem_ofPred_eq]
      by_contra hn
      exact hc ⟨of_not_not fun h => hn (Or.inl h), of_not_not fun h => hn (Or.inr h)⟩
    have h1 := hlo hm
    have h2 := hhi hm
    omega
  choose K hK using grid_rays f r l hS b hb hw lo (fun i h => (hout i (Or.inl h)).1)
    (fun i h => (hout i (Or.inl h)).2)
  have hT : (⋃ j ∈ Set.Icc lo hi, (fun k : ℕ => (k, j - (k : ℤ))) '' {k | k < K j}).Finite :=
    Set.Finite.biUnion (Set.finite_Icc lo hi) fun j _ => (Set.finite_lt_nat (K j)).image _
  refine hT.subset ?_
  rintro ⟨d, i⟩ he
  have he' : ¬ IsPass f (rayEvent f r l d i) := he
  have hlo' : lo ≤ i + d := by
    by_contra hc
    apply he'
    rw [grid_left f r l b hq lo (fun i h => (hout i (Or.inl h)).1)
      (fun i h => (hout i (Or.inl h)).2) d i (by omega)]
    exact hq
  have hhi' : i + d ≤ hi := by
    by_contra hc
    apply he'
    rw [IsPass, pair_of_snd (grid_right f r l b hw hi (fun i h => (hout i (Or.inr h)).2) d i
      (by omega))]
    exact hw _
  have hd : d < K (i + d) := by
    by_contra hc
    have hp := (hK (i + d) d (by omega)).2
    rw [show i + (d : ℤ) - d = i by ring] at hp
    exact he' hp
  simp only [Set.mem_iUnion, Set.mem_image]
  exact ⟨i + d, ⟨hlo', hhi'⟩, d, hd, by simp⟩

end Grid

/-- The mirror of the grid: reflecting the line exchanges right and left rays and turns `f` into
    `prConjP f`. -/
private theorem mirror_event (f : Pair → Pair) (r l : ℤ → Tone) :
    ∀ (d : ℕ) (i : ℤ), rayEvent (prConjP f) (fun k => l (-k)) (fun k => r (-k)) d (-(i + d)) =
      prSwap (rayEvent f r l d i) := by
  intro d
  induction d with
  | zero =>
    intro i
    simp only [rayEvent, prSwap, Nat.cast_zero, add_zero, neg_neg]
  | succ d ih =>
    intro i
    simp only [rayEvent]
    rw [show -(i + ((d + 1 : ℕ) : ℤ)) = -((i + 1) + d) by push_cast; ring,
      show -((i + 1) + (d : ℤ)) + 1 = -(i + d) by ring, ih, ih]
    simp only [prConjP, prSwap]

private theorem conj_sum (f : Pair → Pair) (hS : PrSumPres f) : PrSumPres (prConjP f) := by
  intro p
  have h := hS (p.2, p.1)
  simp only [prConjP, prSwap, prSum] at h ⊢
  omega

/-- **The finite-interaction theorem on the ray grid.** For any pair rule that keeps the pair sum
    and any background `b ≠ 0` on which every tone passes a background partner on one fixed side
    (the right rays: `f (t, b) = (b, t)`; or the left rays: `f (b, t) = (t, b)`), every grid whose
    right and left ray starts are off the background only finitely often has finitely many
    interactions. -/
theorem thm_fiw_grid_finite (f : Pair → Pair) (hS : PrSumPres f) (b : Tone) (hb : b ≠ .zero)
    (hw : (∀ t, f (t, b) = (b, t)) ∨ (∀ t, f (b, t) = (t, b))) (r l : ℤ → Tone)
    (hfin : {i | r i ≠ b ∨ l i ≠ b}.Finite) : (rayInteractions f r l).Finite := by
  rcases hw with hw | hw
  · exact grid_finite_right f r l hS b hb hw hfin
  · have hwg : ∀ t, prConjP f (t, b) = (b, t) := by
      intro t
      simp only [prConjP, prSwap, hw]
    have hfin' : {k : ℤ | l (-k) ≠ b ∨ r (-k) ≠ b}.Finite := by
      refine (Set.Finite.preimage (f := fun k : ℤ => -k) (neg_injective.injOn) hfin).subset ?_
      intro k hk
      simp only [Set.mem_preimage, Set.mem_ofPred_eq] at hk ⊢
      tauto
    have hg := grid_finite_right (prConjP f) (fun k => l (-k)) (fun k => r (-k)) (conj_sum f hS)
      b hb hwg hfin'
    refine (hg.image fun e : ℕ × ℤ => (e.1, -(e.2 + (e.1 : ℤ)))).subset ?_
    rintro ⟨d, i⟩ he
    refine ⟨(d, -(i + (d : ℤ))), ?_, by simp only [Prod.mk.injEq, true_and]; ring⟩
    intro hp
    apply he
    have h := congrArg prSwap hp
    rw [mirror_event] at h
    simp only [IsPass, prConjP, prSwap, Prod.mk.eta] at h ⊢
    rw [← h]

/-! ## The brick line -/

/-- The partner of cell `c` at step `s`: the pairs are `(c, c + 1)` with `c - s` even. -/
def brickMate (s : ℕ) (c : ℤ) : ℤ := if (c - s) % 2 = 0 then c + 1 else c - 1

/-- Cell `c` is the first (left) cell of its pair at step `s`. -/
def brickLead (s : ℕ) (c : ℤ) : Bool := decide ((c - s) % 2 = 0)

-- [helper]
theorem brick_first (s : ℕ) (c : ℤ) (h : (c - s) % 2 = 0) :
    brickMate s c = c + 1 ∧ brickLead s c = true := by
  simp only [brickMate, brickLead, h, ↓reduceIte, decide_true, and_self]

-- [helper]
theorem brick_second (s : ℕ) (c : ℤ) (h : ¬ (c - s) % 2 = 0) :
    brickMate s c = c - 1 ∧ brickLead s c = false := by
  simp only [brickMate, brickLead, h, ↓reduceIte, decide_false, and_self]

/-- The matching of step `s` on the line: `brickAt 0` pairs `(2k, 2k + 1)`, `brickAt 1` pairs
    `(2k + 1, 2k + 2)`, the left cell first. -/
def brickAt (s : ℕ) : Matching ℤ where
  mate := brickMate s
  mate_mate c := by
    by_cases h : (c - s) % 2 = 0
    · rw [(brick_first s c h).1, (brick_second s (c + 1) (by omega)).1]
      ring
    · rw [(brick_second s c h).1, (brick_first s (c - 1) (by omega)).1]
      ring
  lead := brickLead s
  lead_mate c _ := by
    by_cases h : (c - s) % 2 = 0
    · rw [(brick_first s c h).1, (brick_first s c h).2, (brick_second s (c + 1) (by omega)).2]
      rfl
    · rw [(brick_second s c h).1, (brick_second s c h).2, (brick_first s (c - 1) (by omega)).2]
      rfl

/-- The brick schedule of the line: one round is `brickAt 0` then `brickAt 1`. -/
def brick : Schedule ℤ := [brickAt 0, brickAt 1]

/-- The configuration after `s` matchings of the brick schedule. -/
def lineState (f : Pair → Pair) (x : Config ℤ) : ℕ → Config ℤ
  | 0 => x
  | s + 1 => (brickAt s).step f (lineState f x s)

/-- The start tones of the right rays: right ray `i` starts on cell `2i`. -/
def rightStart (x : Config ℤ) (i : ℤ) : Tone := x (2 * i)

/-- The start tones of the left rays: left ray `j` starts on cell `2j + 1`. -/
def leftStart (x : Config ℤ) (j : ℤ) : Tone := x (2 * j + 1)

/-- The interactions on the line: the pairs `(s, i)` (step `s`, first cell `2i + s`) that the rule
    does not simply swap. -/
def lineInteractions (f : Pair → Pair) (x : Config ℤ) : Set (ℕ × ℤ) :=
  {e | ¬ IsPass f (lineState f x e.1 (2 * e.2 + e.1), lineState f x e.1 (2 * e.2 + e.1 + 1))}

-- [helper]
theorem brick_step (g : Pair → Pair) (s : ℕ) (y : Config ℤ) (c : ℤ) :
    (brickAt s).step g y c =
      if (c - s) % 2 = 0 then (g (y c, y (c + 1))).1 else (g (y (c - 1), y c)).2 := by
  show (if brickMate s c = c then y c
    else if brickLead s c then (g (y c, y (brickMate s c))).1
    else (g (y (brickMate s c), y c)).2) = _
  by_cases h : (c - s) % 2 = 0
  · obtain ⟨h1, h2⟩ := brick_first s c h
    rw [ite_eq_left h, h1, h2, ite_eq_right (by omega), ite_eq_left rfl]
  · obtain ⟨h1, h2⟩ := brick_second s c h
    rw [ite_eq_right h, h1, h2, ite_eq_right (by omega), ite_eq_right Bool.false_ne_true]

private theorem brick_step_mod (g : Pair → Pair) (s : ℕ) (y : Config ℤ) :
    (brickAt s).step g y = (brickAt (s % 2)).step g y := by
  funext c
  rw [brick_step, brick_step]
  by_cases h : (c - s) % 2 = 0
  · rw [ite_eq_left h, ite_eq_left (by omega)]
  · rw [ite_eq_right h, ite_eq_right (by omega)]

private theorem line_state_eq (f : Pair → Pair) (x : Config ℤ) :
    ∀ (s : ℕ) (c : ℤ), lineState f x s c =
      if (c - s) % 2 = 0 then (rayEvent f (rightStart x) (leftStart x) s ((c - s) / 2)).1
      else (rayEvent f (rightStart x) (leftStart x) s ((c - s - 1) / 2)).2 := by
  intro s
  induction s with
  | zero =>
    intro c
    by_cases h : (c - ((0 : ℕ) : ℤ)) % 2 = 0
    · rw [ite_eq_left h]
      show x c = x (2 * ((c - ((0 : ℕ) : ℤ)) / 2))
      congr 1
      omega
    · rw [ite_eq_right h]
      show x c = x (2 * ((c - ((0 : ℕ) : ℤ) - 1) / 2) + 1)
      congr 1
      omega
  | succ s ih =>
    intro c
    show (brickAt s).step f (lineState f x s) c = _
    rw [brick_step]
    by_cases h : (c - s) % 2 = 0
    · rw [ite_eq_left h, ih c, ih (c + 1), ite_eq_left h, ite_eq_right (show ¬ (c + 1 - (s : ℤ)) % 2 = 0 by omega),
        show (c + 1 - (s : ℤ) - 1) / 2 = (c - s) / 2 by omega, Prod.mk.eta,
        ite_eq_right (show ¬ (c - ((s + 1 : ℕ) : ℤ)) % 2 = 0 by push_cast; omega), ray_event_succ_snd,
        show (c - ((s + 1 : ℕ) : ℤ) - 1) / 2 + 1 = (c - s) / 2 by push_cast; omega]
    · rw [ite_eq_right h, ih (c - 1), ih c, ite_eq_right h, ite_eq_left (show (c - 1 - (s : ℤ)) % 2 = 0 by omega),
        show (c - 1 - (s : ℤ)) / 2 = (c - s - 1) / 2 by omega, Prod.mk.eta,
        ite_eq_left (show (c - ((s + 1 : ℕ) : ℤ)) % 2 = 0 by push_cast; omega), ray_event_succ_fst,
        show (c - ((s + 1 : ℕ) : ℤ)) / 2 = (c - s - 1) / 2 by push_cast; omega]

private theorem line_pair (f : Pair → Pair) (x : Config ℤ) (s : ℕ) (i : ℤ) :
    (lineState f x s (2 * i + s), lineState f x s (2 * i + s + 1)) =
      rayEvent f (rightStart x) (leftStart x) s i := by
  rw [line_state_eq, line_state_eq, ite_eq_left (by omega), ite_eq_right (by omega),
    show (2 * i + (s : ℤ) - s) / 2 = i by omega, show (2 * i + (s : ℤ) + 1 - s - 1) / 2 = i by omega]

private theorem round_brick_iterate (f : Pair → Pair) (x : Config ℤ) :
    ∀ n : ℕ, (round f brick)^[n] x = lineState f x (2 * n) := by
  intro n
  induction n with
  | zero => rfl
  | succ n ih =>
    rw [iterate_succ_apply', ih, show 2 * (n + 1) = 2 * n + 1 + 1 by ring]
    show (brickAt 1).step f ((brickAt 0).step f (lineState f x (2 * n))) =
      (brickAt (2 * n + 1)).step f ((brickAt (2 * n)).step f (lineState f x (2 * n)))
    rw [brick_step_mod f (2 * n + 1), brick_step_mod f (2 * n),
      show (2 * n + 1) % 2 = 1 by omega, show (2 * n) % 2 = 0 by omega]

/-- **The brick line is the ray grid.** After `s` matchings of the brick schedule, cell `c` holds
    the right-ray tone of `rayEvent` when `c - s` is even and the left-ray tone otherwise; the pair
    at step `s` whose first cell is `2i + s` is the meeting `rayEvent f r l s i` (with `r`, `l` the
    start tones of the even and odd cells); the line's interactions are the grid's; and `n` rounds
    of `round f brick` are `2n` matchings. -/
theorem thm_fiw_ray_bridge (f : Pair → Pair) (x : Config ℤ) :
    (∀ (s : ℕ) (c : ℤ), lineState f x s c =
      if (c - s) % 2 = 0 then (rayEvent f (rightStart x) (leftStart x) s ((c - s) / 2)).1
      else (rayEvent f (rightStart x) (leftStart x) s ((c - s - 1) / 2)).2) ∧
    (∀ (s : ℕ) (i : ℤ), (lineState f x s (2 * i + s), lineState f x s (2 * i + s + 1)) =
      rayEvent f (rightStart x) (leftStart x) s i) ∧
    lineInteractions f x = rayInteractions f (rightStart x) (leftStart x) ∧
    (∀ n : ℕ, (round f brick)^[n] x = lineState f x (2 * n)) := by
  refine ⟨line_state_eq f x, line_pair f x, ?_, round_brick_iterate f x⟩
  ext ⟨s, i⟩
  show ¬ IsPass f (lineState f x s (2 * i + s), lineState f x s (2 * i + s + 1)) ↔
    ¬ IsPass f (rayEvent f (rightStart x) (leftStart x) s i)
  rw [line_pair]

/-! ## The finite-interaction theorem on the line -/

private theorem start_finite (x : Config ℤ) (b : Tone) (hx : {c | x c ≠ b}.Finite) :
    {i | rightStart x i ≠ b ∨ leftStart x i ≠ b}.Finite := by
  have h1 := Set.Finite.preimage (f := fun i : ℤ => 2 * i)
    (fun a _ c _ h => by simp only at h; omega) hx
  have h2 := Set.Finite.preimage (f := fun i : ℤ => 2 * i + 1)
    (fun a _ c _ h => by simp only at h; omega) hx
  refine (h1.union h2).subset ?_
  intro i hi
  simp only [Set.mem_union, Set.mem_preimage, Set.mem_ofPred_eq, rightStart, leftStart] at hi ⊢
  exact hi

private theorem free_after (f : Pair → Pair) (x : Config ℤ) (hfin : (lineInteractions f x).Finite) :
    ∃ S : ℕ, ∀ s, S ≤ s →
      (brickAt s).step f (lineState f x s) = (brickAt s).step prSwap (lineState f x s) := by
  obtain ⟨D, hD⟩ := (hfin.image Prod.fst).bddAbove
  refine ⟨D + 1, fun s hs => ?_⟩
  have hpass : ∀ i : ℤ, IsPass f (lineState f x s (2 * i + s), lineState f x s (2 * i + s + 1)) := by
    intro i
    by_contra hc
    have := hD ⟨(s, i), hc, rfl⟩
    simp only at this
    omega
  funext c
  rw [brick_step, brick_step]
  by_cases h : (c - s) % 2 = 0
  · rw [ite_eq_left h, ite_eq_left h]
    obtain ⟨i, rfl⟩ : ∃ i : ℤ, c = 2 * i + s := ⟨(c - s) / 2, by omega⟩
    exact congrArg Prod.fst (hpass i)
  · rw [ite_eq_right h, ite_eq_right h]
    obtain ⟨i, rfl⟩ : ∃ i : ℤ, c = 2 * i + s + 1 := ⟨(c - s - 1) / 2, by omega⟩
    rw [show 2 * i + (s : ℤ) + 1 - 1 = 2 * i + s by ring]
    exact congrArg Prod.snd (hpass i)

/-- **A8, the finite-interaction theorem on the brick line.** For any pair rule that keeps the pair
    sum and any background `b ≠ 0` on which every tone passes a background partner on one fixed side
    (`f (t, b) = (b, t)` for all `t`, or `f (b, t) = (t, b)` for all `t`), every start with finitely
    many cells off the background has finitely many interactions under the brick schedule; from some
    step on every matching acts on the line as the swap `prSwap` (free flight); and from some round
    on `round f brick` equals `round prSwap brick` along the orbit. -/
theorem thm_fiw_line_finite (f : Pair → Pair) (hS : PrSumPres f) (b : Tone) (hb : b ≠ .zero)
    (hw : (∀ t, f (t, b) = (b, t)) ∨ (∀ t, f (b, t) = (t, b))) (x : Config ℤ)
    (hx : {c | x c ≠ b}.Finite) :
    (lineInteractions f x).Finite ∧
    (∃ S : ℕ, ∀ s, S ≤ s →
      (brickAt s).step f (lineState f x s) = (brickAt s).step prSwap (lineState f x s)) ∧
    (∃ N : ℕ, ∀ n, N ≤ n →
      round f brick ((round f brick)^[n] x) = round prSwap brick ((round f brick)^[n] x)) := by
  have hfin : (lineInteractions f x).Finite := by
    rw [(thm_fiw_ray_bridge f x).2.2.1]
    exact thm_fiw_grid_finite f hS b hb hw _ _ (start_finite x b hx)
  obtain ⟨S, hS'⟩ := free_after f x hfin
  refine ⟨hfin, ⟨S, hS'⟩, S, fun n hn => ?_⟩
  rw [round_brick_iterate]
  have e0 : (brickAt 0).step f (lineState f x (2 * n)) = lineState f x (2 * n + 1) := by
    show _ = (brickAt (2 * n)).step f (lineState f x (2 * n))
    rw [brick_step_mod f (2 * n), show (2 * n) % 2 = 0 by omega]
  show (brickAt 1).step f ((brickAt 0).step f (lineState f x (2 * n))) =
    (brickAt 1).step prSwap ((brickAt 0).step prSwap (lineState f x (2 * n)))
  have h0 := hS' (2 * n) (by omega)
  have h1 := hS' (2 * n + 1) (by omega)
  rw [brick_step_mod f (2 * n), brick_step_mod prSwap (2 * n), show (2 * n) % 2 = 0 by omega] at h0
  rw [brick_step_mod f (2 * n + 1), brick_step_mod prSwap (2 * n + 1),
    show (2 * n + 1) % 2 = 1 by omega] at h1
  rw [← h0, e0, h1]

/-- **Free flight.** Under the hypotheses of `thm_fiw_line_finite`, there is a step `S` after which
    every tone moves one cell per matching along its ray: for every `s ≥ S`, `m` and cell `c`, the
    tone of `c` at step `s + m` is the tone of `c - m` at step `s` when `c - (s + m)` is even (a right
    mover) and the tone of `c + m` otherwise (a left mover). With finitely many cells off the
    background at step `S`, whether cell `c` ever holds tone `t` is read off that one configuration. -/
theorem thm_fiw_free_flight (f : Pair → Pair) (hS : PrSumPres f) (b : Tone) (hb : b ≠ .zero)
    (hw : (∀ t, f (t, b) = (b, t)) ∨ (∀ t, f (b, t) = (t, b))) (x : Config ℤ)
    (hx : {c | x c ≠ b}.Finite) :
    ∃ S : ℕ, ∀ s, S ≤ s → ∀ (m : ℕ) (c : ℤ), lineState f x (s + m) c =
      if (c - ((s + m : ℕ) : ℤ)) % 2 = 0 then lineState f x s (c - m) else lineState f x s (c + m) := by
  obtain ⟨S, hS'⟩ := (thm_fiw_line_finite f hS b hb hw x hx).2.1
  refine ⟨S, fun s hs m => ?_⟩
  induction m with
  | zero =>
    intro c
    by_cases h : (c - ((s + 0 : ℕ) : ℤ)) % 2 = 0
    · rw [ite_eq_left h]; simp
    · rw [ite_eq_right h]; simp
  | succ m ih =>
    intro c
    show (brickAt (s + m)).step f (lineState f x (s + m)) c = _
    rw [hS' (s + m) (by omega), brick_step]
    by_cases h : (c - ((s + m : ℕ) : ℤ)) % 2 = 0
    · rw [ite_eq_left h, ih (c + 1),
        ite_eq_right (show ¬ (c + 1 - ((s + m : ℕ) : ℤ)) % 2 = 0 by omega),
        ite_eq_right (show ¬ (c - ((s + (m + 1) : ℕ) : ℤ)) % 2 = 0 by push_cast at h ⊢; omega)]
      show lineState f x s (c + 1 + m) = lineState f x s (c + ((m + 1 : ℕ) : ℤ))
      congr 1
      push_cast
      ring
    · rw [ite_eq_right h, ih (c - 1),
        ite_eq_left (show (c - 1 - ((s + m : ℕ) : ℤ)) % 2 = 0 by omega),
        ite_eq_left (show (c - ((s + (m + 1) : ℕ) : ℤ)) % 2 = 0 by push_cast at h ⊢; omega)]
      show lineState f x s (c - 1 - m) = lineState f x s (c - ((m + 1 : ℕ) : ℤ))
      congr 1
      push_cast
      ring

/-! ## The 8 one-sided-wire cells -/

private theorem wire_cells_bool :
    ∀ c ∈ RuleCensus.cells, (RuleCensus.wireSide (prTable c.1) c.2).isSome = true →
      c.2 ≠ .zero ∧
      (RuleCensus.tones.all (fun t => decide (prTable c.1 (t, c.2) = (c.2, t))) = true ∨
        RuleCensus.tones.all (fun t => decide (prTable c.1 (c.2, t) = (t, c.2))) = true) := by
  unfold RuleCensus.cells
  rw [pr_rule_codes_eq]
  decide +kernel

/-- **A8 for the 8 one-sided-wire cells.** Each of the 8 cells with a one-sided wire
    (`thm_rule_census_wire_cells`: `id.BCA.swap` and `id.CAB.swap` on `+1`, `swap.BCA.id` and
    `swap.CAB.id` on `-1`, `swap.BCA.swap` and `swap.CAB.swap` on both) has a background `b ≠ 0` on
    which every tone passes a background partner on its wire side, so on the brick line every start
    with finitely many cells off its background has finitely many interactions, and from some round
    on the round is free flight (`round prSwap brick`). -/
theorem thm_fiw_wire_cells :
    ∀ c ∈ RuleCensus.cells, (RuleCensus.wireSide (prTable c.1) c.2).isSome = true →
      c.2 ≠ .zero ∧
      ((∀ t, prTable c.1 (t, c.2) = (c.2, t)) ∨ (∀ t, prTable c.1 (c.2, t) = (t, c.2))) ∧
      ∀ x : Config ℤ, {v | x v ≠ c.2}.Finite →
        (lineInteractions (prTable c.1) x).Finite ∧
        ∃ N : ℕ, ∀ n, N ≤ n →
          round (prTable c.1) brick ((round (prTable c.1) brick)^[n] x) =
            round prSwap brick ((round (prTable c.1) brick)^[n] x) := by
  intro c hc hs
  obtain ⟨hb, hw⟩ := wire_cells_bool c hc hs
  have hw' : (∀ t, prTable c.1 (t, c.2) = (c.2, t)) ∨ (∀ t, prTable c.1 (c.2, t) = (t, c.2)) := by
    simp only [List.all_eq_true, decide_eq_true_eq] at hw
    rcases hw with h | h
    · exact Or.inl fun t => h t (RuleCensus.mem_tones t)
    · exact Or.inr fun t => h t (RuleCensus.mem_tones t)
  refine ⟨hb, hw', fun x hx => ?_⟩
  obtain ⟨h1, _, h3⟩ := thm_fiw_line_finite (prTable c.1) (pr_table_sumPres c.1) c.2 hb hw' x hx
  exact ⟨h1, h3⟩

end WireLine

end Compute

end Vibe
