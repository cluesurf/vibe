import Mathlib.Logic.Equiv.Defs
import Mathlib.Logic.Function.Iterate
import Vibe.Compute.Round
import Vibe.Compute.RuleCensus
import Vibe.Compute.SpeciesTransport

/-!
# Vibe Computation Lab: Finite Interaction in the Species Cells on the Brick Line

Lean track L08 (lean-track.md row A7, m6 "The line, unconditional", m12 P26). The line is `Int`,
the schedule is the brick schedule of `counter.ts` (`lineTransient`): colour 0 pairs
`(2k, 2k + 1)`, colour 1 pairs `(2k + 1, 2k + 2)`, the left cell first, colour 0 then colour 1 in
every round. A start lies in the window `[a, a + w)` when every cell off the background `b` does.

**Interaction** is the event `lineTransient` counts: at a half step of round `t` (rounds counted
from 0), a matched pair whose two cells hold the two distinct excitations of `b` (`Meets`). In a
`T4` cell a meeting inside the cavity of the start (between two mirrors, `InCavity`) is a bounce of
a confined mover and does not count, as in the code. The code never counts `T0` and `T1`, and
`thm_fis_static_meet_forever` shows why: there one adjacent pair of excitations meets in every
round, so no bound exists.

Headline theorems, on L04's species transport (`thm_species_transport`: the driving layer flies
free when `σ = swap` and stands still when `σ = keep`):

1. `thm_fis_occupancy_meetings` (`T2`, `T3`): for any rule moved by occupancy with `σ = swap`,
   every meeting at round `t` from a start of width `w` has `4 t + 2 ≤ w`.
2. `thm_fis_mover_meetings` (`T5`): for any rule moved by one mover tone `p` with `σ = swap`
   whose other tones never move alone, every meeting has `2 t + 2 ≤ w`. The other excitation never
   leaves the window.
3. `thm_fis_mirror_meetings` (`T4`): for any rule moved by one mirror tone `p` with `σ = keep`
   whose other tones fly free, every meeting outside the cavity has `2 t + 2 ≤ w`.
4. `thm_fis_species_cells` (A7): in each of the 18 species cells of type `T2` to `T5` among the
   72, every interaction from a start of width `w` happens at a round `t ≤ w - 2` (so every start
   finishes interacting before round `w - 1`), with `2 t + 2 ≤ w`, and `4 t + 2 ≤ w` in `T2`, `T3`.
5. `thm_fis_static_meet_forever`, `thm_fis_static_cells` (`T0`, `T1`): a start of two distinct
   excitations on cells 0 and 1 meets at every round, so these cells are rightly left out.

Mathlib (`Equiv.Perm`, `Function.iterate`) on L02's rounds, L03's cells and L04's transport.
Zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

namespace SpeciesLine

open Function
open RuleCensus

/-! ## The brick schedule on the line -/

/-- The mate of `v` under colour 0: `(2k, 2k + 1)` are paired. -/
def mate0 (v : Int) : Int := v + 1 - 2 * (v % 2)

/-- The mate of `v` under colour 1: `(2k + 1, 2k + 2)` are paired. -/
def mate1 (v : Int) : Int := v - 1 + 2 * (v % 2)

/-- Colour 0 of the brick schedule, the even cell first. -/
def brick0 : Matching Int where
  mate := mate0
  mate_mate v := by unfold mate0; omega
  lead v := decide (v % 2 = 0)
  lead_mate v _ := by
    have hv : v % 2 = 0 ∨ v % 2 = 1 := by omega
    rcases hv with hv | hv
    · have h1 : mate0 v % 2 = 1 := by unfold mate0; omega
      simp [hv, h1]
    · have h1 : mate0 v % 2 = 0 := by unfold mate0; omega
      simp [hv, h1]

/-- Colour 1 of the brick schedule, the odd cell first. -/
def brick1 : Matching Int where
  mate := mate1
  mate_mate v := by unfold mate1; omega
  lead v := decide (v % 2 = 1)
  lead_mate v _ := by
    have hv : v % 2 = 0 ∨ v % 2 = 1 := by omega
    rcases hv with hv | hv
    · have h1 : mate1 v % 2 = 1 := by unfold mate1; omega
      simp [hv, h1]
    · have h1 : mate1 v % 2 = 0 := by unfold mate1; omega
      simp [hv, h1]

/-- The brick schedule: colour 0, then colour 1. -/
def brick : Schedule Int := [brick0, brick1]

/-- The matching of a half step: `false` is colour 0, `true` is colour 1. -/
def lineMatching : Bool → Matching Int
  | false => brick0
  | true => brick1

/-- The state a half step of round `t` acts on: the round start (`false`) or the state after
    colour 0 (`true`). -/
def lineState (f : Pair → Pair) (x : Config Int) (t : Nat) : Bool → Config Int
  | false => (round f brick)^[t] x
  | true => brick0.step f ((round f brick)^[t] x)

/-- The start cell a free-flight track at cell `v` of the half-step state comes from. -/
def lineSrc (t : Nat) : Bool → Int → Int
  | false, v => if v % 2 = 0 then v - 2 * (t : Int) else v + 2 * (t : Int)
  | true, v => if v % 2 = 0 then v + 1 + 2 * (t : Int) else v - 1 - 2 * (t : Int)

/-- A meeting: the pair of `v` holds two distinct tones, both off the background `b`. -/
def Meets (b : Tone) (M : Matching Int) (y : Config Int) (v : Int) : Prop :=
  y v ≠ b ∧ y (M.mate v) ≠ b ∧ y v ≠ y (M.mate v)

/-- Every cell of `x` off the background lies in `[a, a + w)`. -/
def InWindow (b : Tone) (x : Config Int) (a w : Int) : Prop :=
  ∀ v, x v ≠ b → a ≤ v ∧ v < a + w

/-- The pair `{v, v'}` lies between two mirrors `p` of the start. -/
def InCavity (x : Config Int) (p : Tone) (v v' : Int) : Prop :=
  ∃ l h, x l = p ∧ x h = p ∧ l ≤ v ∧ l ≤ v' ∧ v ≤ h ∧ v' ≤ h

private theorem brick0_ne (v : Int) : brick0.mate v ≠ v := by
  show mate0 v ≠ v
  unfold mate0; omega

private theorem brick1_ne (v : Int) : brick1.mate v ≠ v := by
  show mate1 v ≠ v
  unfold mate1; omega

private theorem lineMatching_ne (h : Bool) (v : Int) : (lineMatching h).mate v ≠ v := by
  cases h
  · exact brick0_ne v
  · exact brick1_ne v

private theorem state_true (f : Pair → Pair) (x : Config Int) (t : Nat) :
    lineState f x t true = brick0.step f (lineState f x t false) := rfl

private theorem state_succ (f : Pair → Pair) (x : Config Int) (t : Nat) :
    lineState f x (t + 1) false = brick1.step f (lineState f x t true) := by
  show (round f brick)^[t + 1] x = _
  rw [iterate_succ_apply']
  rfl

private theorem state_zero (f : Pair → Pair) (x : Config Int) : lineState f x 0 false = x := rfl

private theorem src_zero (v : Int) : lineSrc 0 false v = v := by
  simp only [lineSrc]
  split_ifs <;> omega

private theorem src_half (t : Nat) (v : Int) : lineSrc t false (mate0 v) = lineSrc t true v := by
  simp only [lineSrc, mate0]
  split_ifs <;> omega

private theorem src_round (t : Nat) (v : Int) :
    lineSrc t true (mate1 v) = lineSrc (t + 1) false v := by
  simp only [lineSrc, mate1]
  push_cast
  split_ifs <;> omega

/-! ## One step, read through the species transport -/

/-- A step reads every cell from itself or its mate, as the edge's move says. -/
private theorem step_eq (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move) (σ : Move)
    (hf : MovedBy f d m) (hb : Balanced m σ) (M : Matching Int) (hM : ∀ v, M.mate v ≠ v)
    (y : Config Int) (v : Int) :
    M.step f y v = y (Matching.moveAt (M.edgeMove m (fun w => d (y w)) v) M v) := by
  have h := (thm_species_transport f d m σ hf hb [M]).1 y v
  change M.step f y v = y (M.src m (fun w => d (y w)) v) at h
  rw [h]
  unfold Matching.src
  simp only [hM v, ↓reduceIte]

private theorem edge_ff (m : Bool → Bool → Move) (M : Matching Int) (D : Int → Bool) (v : Int)
    (h1 : D v = false) (h2 : D (M.mate v) = false) : M.edgeMove m D v = m false false := by
  unfold Matching.edgeMove
  cases M.lead v <;> simp [h1, h2]

private theorem edge_one (m : Bool → Bool → Move) (σ : Move) (hb : Balanced m σ) (M : Matching Int)
    (D : Int → Bool) (v : Int) (hD : D v ≠ D (M.mate v)) : M.edgeMove m D v = σ := by
  obtain ⟨h1, h2⟩ := hb
  unfold Matching.edgeMove
  cases hl : M.lead v <;> cases ha : D v <;> cases hc : D (M.mate v) <;>
    simp only [ha, hc, ne_eq, not_true_eq_false] at hD <;> simp [h1, h2]

/-- With `σ = swap` the driving layer of a step is the layer read at the mate. -/
private theorem layer_swap (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (hf : MovedBy f d m) (hb : Balanced m .swap) (M : Matching Int) (hM : ∀ v, M.mate v ≠ v)
    (y : Config Int) (v : Int) : d (M.step f y v) = d (y (M.mate v)) := by
  have h := (thm_species_transport f d m .swap hf hb [M]).2.1 y v
  change d (M.step f y v) = d (y (M.fixedSrc .swap v)) at h
  rw [h]
  unfold Matching.fixedSrc Matching.src Matching.edgeMove
  simp only [hM v, ↓reduceIte]
  cases M.lead v <;> rfl

/-- With `σ = keep` the driving layer of a step is the layer itself. -/
private theorem layer_keep (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (hf : MovedBy f d m) (hb : Balanced m .keep) (M : Matching Int) (y : Config Int) (v : Int) :
    d (M.step f y v) = d (y v) := by
  have h := (thm_species_transport f d m .keep hf hb [M]).2.1 y v
  have hk := (thm_species_transport f d m .keep hf hb [M]).2.2.1 rfl v
  change d (M.step f y v) = _ at h
  rw [h, hk]

/-- With `σ = swap` on the brick line the driving layer of every half-step state is the start's
    read at the free-flight source `lineSrc`. -/
private theorem line_layer_swap (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (hf : MovedBy f d m) (hb : Balanced m .swap) (x : Config Int) :
    ∀ (t : Nat) (h : Bool) (v : Int), d (lineState f x t h v) = d (x (lineSrc t h v)) := by
  have htrue : ∀ t : Nat, (∀ v, d (lineState f x t false v) = d (x (lineSrc t false v))) →
      ∀ v, d (lineState f x t true v) = d (x (lineSrc t true v)) := by
    intro t ih v
    rw [state_true, layer_swap f d m hf hb brick0 brick0_ne, ih]
    exact congrArg (fun u => d (x u)) (src_half t v)
  have hfalse : ∀ t : Nat, ∀ v, d (lineState f x t false v) = d (x (lineSrc t false v)) := by
    intro t
    induction t with
    | zero => intro v; rw [state_zero, src_zero]
    | succ t ih =>
      intro v
      rw [state_succ, layer_swap f d m hf hb brick1 brick1_ne, htrue t ih]
      exact congrArg (fun u => d (x u)) (src_round t v)
  intro t h
  cases h
  · exact hfalse t
  · exact htrue t (hfalse t)

/-- With `σ = keep` the driving layer of every half-step state is the start's. -/
private theorem line_layer_keep (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (hf : MovedBy f d m) (hb : Balanced m .keep) (x : Config Int) :
    ∀ (t : Nat) (h : Bool) (v : Int), d (lineState f x t h v) = d (x v) := by
  have hfalse : ∀ t : Nat, ∀ v, d (lineState f x t false v) = d (x v) := by
    intro t
    induction t with
    | zero => intro v; rfl
    | succ t ih =>
      intro v
      rw [state_succ, layer_keep f d m hf hb brick1, state_true, layer_keep f d m hf hb brick0, ih]
  intro t h v
  cases h
  · exact hfalse t v
  · rw [state_true, layer_keep f d m hf hb brick0, hfalse]

private theorem decide_eq_true_of (p s r : Tone) (h : decide (s = p) = decide (r = p)) :
    s = p ↔ r = p := by
  constructor
  · intro hs; subst hs; simpa using h
  · intro hr; subst hr; simpa using h.symm

private theorem third (s r b p : Tone) : s ≠ b → s ≠ p → r ≠ b → r ≠ p → p ≠ b → s = r := by
  cases s <;> cases r <;> cases b <;> cases p <;> decide

/-! ## `T2`, `T3`: occupancy in free flight -/

/-- **`T2`, `T3` on the brick line.** For any rule `f` moved by the occupancy of the background
    `b` with `σ = swap` (a pair with one excitation always swaps, as in `T2` and `T3`), every
    meeting at a half step of round `t` from a start in a window of width `w` has
    `4 t + 2 ≤ w`. Two occupied tracks meet only while a right mover and a left mover of the
    window close in on each other, at four cells a round. -/
theorem thm_fis_occupancy_meetings (f : Pair → Pair) (b : Tone) (m : Bool → Bool → Move)
    (hf : MovedBy f (occ b) m) (hb : Balanced m .swap) (x : Config Int) (a w : Int)
    (hx : InWindow b x a w) (t : Nat) (h : Bool) (v : Int)
    (hm : Meets b (lineMatching h) (lineState f x t h) v) : 4 * (t : Int) + 2 ≤ w := by
  obtain ⟨h1, h2, -⟩ := hm
  have hl := line_layer_swap f (occ b) m hf hb x t h
  have e1 : x (lineSrc t h v) ≠ b := by simpa [occ, h1] using (hl v).symm
  have e2 : x (lineSrc t h ((lineMatching h).mate v)) ≠ b := by
    simpa [occ, h2] using (hl ((lineMatching h).mate v)).symm
  obtain ⟨a1, a2⟩ := hx _ e1
  obtain ⟨a3, a4⟩ := hx _ e2
  cases h
  · change a ≤ lineSrc t false (mate0 v) at a3
    change lineSrc t false (mate0 v) < a + w at a4
    simp only [lineSrc, mate0] at a1 a2 a3 a4
    split_ifs at a1 a2 a3 a4 <;> omega
  · change a ≤ lineSrc t true (mate1 v) at a3
    change lineSrc t true (mate1 v) < a + w at a4
    simp only [lineSrc, mate1] at a1 a2 a3 a4
    split_ifs at a1 a2 a3 a4 <;> omega

/-! ## `T5`: one mover in free flight, the other excitation pushed -/

section Mover

variable (f : Pair → Pair) (b p : Tone) (m : Bool → Bool → Move)

/-- One step keeps every non-mover excitation inside the window, provided every mover that
    meets one sits inside the window. -/
private theorem mover_step (hf : MovedBy f (fun s => decide (s = p)) m) (hb : Balanced m .swap)
    (hff : m false false = .keep) (M : Matching Int) (hM : ∀ v, M.mate v ≠ v) (y : Config Int)
    (a w : Int) (hQ : ∀ c, y c ≠ b → y c ≠ p → a ≤ c ∧ c < a + w)
    (hP : ∀ c, y c = p → y (M.mate c) ≠ b → y (M.mate c) ≠ p → a ≤ c ∧ c < a + w) :
    ∀ c, M.step f y c ≠ b → M.step f y c ≠ p → a ≤ c ∧ c < a + w := by
  intro c hc1 hc2
  have hs := step_eq f (fun s => decide (s = p)) m .swap hf hb M hM y c
  by_cases e1 : y c = p <;> by_cases e2 : y (M.mate c) = p
  · rw [hs] at hc2
    cases hE : M.edgeMove m (fun w => decide (y w = p)) c <;> rw [hE] at hc2
    · exact absurd e1 hc2
    · exact absurd e2 hc2
  · have he : M.edgeMove m (fun w => decide (y w = p)) c = .swap :=
      edge_one m .swap hb M _ c (by simp [e1, e2])
    rw [hs, he] at hc1 hc2
    exact hP c e1 hc1 hc2
  · have he : M.edgeMove m (fun w => decide (y w = p)) c = .swap :=
      edge_one m .swap hb M _ c (by simp [e1, e2])
    rw [hs, he] at hc2
    exact absurd e2 hc2
  · have he : M.edgeMove m (fun w => decide (y w = p)) c = .keep := by
      rw [edge_ff m M _ c (by simp [e1]) (by simp [e2]), hff]
    rw [hs, he] at hc1 hc2
    exact hQ c hc1 hc2

/-- In a `T5`-like cell the non-mover excitations of every half-step state stay in the window. -/
private theorem mover_window (hp : p ≠ b) (hf : MovedBy f (fun s => decide (s = p)) m)
    (hb : Balanced m .swap) (hff : m false false = .keep) (x : Config Int) (a w : Int)
    (hx : InWindow b x a w) :
    ∀ (t : Nat) (h : Bool) (c : Int), lineState f x t h c ≠ b → lineState f x t h c ≠ p →
      a ≤ c ∧ c < a + w := by
  have hl := line_layer_swap f (fun s => decide (s = p)) m hf hb x
  have hpos : ∀ t h c, lineState f x t h c = p → a ≤ lineSrc t h c ∧ lineSrc t h c < a + w := by
    intro t h c hc
    have := (decide_eq_true_of p _ _ (hl t h c)).1 hc
    exact hx _ (by rw [this]; exact hp)
  have htrue : ∀ t : Nat, (∀ c, lineState f x t false c ≠ b → lineState f x t false c ≠ p →
      a ≤ c ∧ c < a + w) →
      ∀ c, lineState f x t true c ≠ b → lineState f x t true c ≠ p → a ≤ c ∧ c < a + w := by
    intro t ih
    rw [state_true]
    refine mover_step f b p m hf hb hff brick0 brick0_ne _ a w ih ?_
    intro c hc hq1 hq2
    obtain ⟨s1, s2⟩ := hpos t false c hc
    obtain ⟨n1, n2⟩ := ih _ hq1 hq2
    change a ≤ mate0 c at n1
    change mate0 c < a + w at n2
    simp only [lineSrc, mate0] at s1 s2 n1 n2
    split_ifs at s1 s2 <;> omega
  have hfalse : ∀ t : Nat, ∀ c, lineState f x t false c ≠ b → lineState f x t false c ≠ p →
      a ≤ c ∧ c < a + w := by
    intro t
    induction t with
    | zero => intro c hc _; exact hx c hc
    | succ t ih =>
      rw [state_succ]
      have ih' := htrue t ih
      refine mover_step f b p m hf hb hff brick1 brick1_ne _ a w ih' ?_
      intro c hc hq1 hq2
      obtain ⟨s1, s2⟩ := hpos t true c hc
      obtain ⟨n1, n2⟩ := ih' _ hq1 hq2
      change a ≤ mate1 c at n1
      change mate1 c < a + w at n2
      simp only [lineSrc, mate1] at s1 s2 n1 n2
      split_ifs at s1 s2 <;> omega
  intro t h
  cases h
  · exact hfalse t
  · exact htrue t (hfalse t)

end Mover

/-- **`T5` on the brick line.** Let `p ≠ b` be a mover tone: the rule `f` is moved by
    `s = p` with `σ = swap` (a pair with exactly one `p` swaps) and a pair without `p` is kept
    (`m false false = keep`: the other excitation moves only when a mover crosses it). Then from a
    start in a window of width `w` the other excitation never leaves the window, and every meeting
    at a half step of round `t` has `2 t + 2 ≤ w`. -/
theorem thm_fis_mover_meetings (f : Pair → Pair) (b p : Tone) (m : Bool → Bool → Move)
    (hp : p ≠ b) (hf : MovedBy f (fun s => decide (s = p)) m) (hb : Balanced m .swap)
    (hff : m false false = .keep) (x : Config Int) (a w : Int) (hx : InWindow b x a w)
    (t : Nat) (h : Bool) (v : Int) (hm : Meets b (lineMatching h) (lineState f x t h) v) :
    2 * (t : Int) + 2 ≤ w := by
  obtain ⟨h1, h2, h3⟩ := hm
  have hl := line_layer_swap f (fun s => decide (s = p)) m hf hb x
  have hpos : ∀ c, lineState f x t h c = p → a ≤ lineSrc t h c ∧ lineSrc t h c < a + w := by
    intro c hc
    have := (decide_eq_true_of p _ _ (hl t h c)).1 hc
    exact hx _ (by rw [this]; exact hp)
  have hwin := mover_window f b p m hp hf hb hff x a w hx t h
  -- the bound for a mover at `c` beside a non-mover at its mate
  have key : ∀ c, lineState f x t h c = p → lineState f x t h ((lineMatching h).mate c) ≠ b →
      lineState f x t h ((lineMatching h).mate c) ≠ p → 2 * (t : Int) + 2 ≤ w := by
    intro c hc hq1 hq2
    obtain ⟨s1, s2⟩ := hpos c hc
    obtain ⟨n1, n2⟩ := hwin _ hq1 hq2
    cases h
    · change a ≤ mate0 c at n1
      change mate0 c < a + w at n2
      simp only [lineSrc, mate0] at s1 s2 n1 n2
      split_ifs at s1 s2 <;> omega
    · change a ≤ mate1 c at n1
      change mate1 c < a + w at n2
      simp only [lineSrc, mate1] at s1 s2 n1 n2
      split_ifs at s1 s2 <;> omega
  by_cases e1 : lineState f x t h v = p
  · exact key v e1 h2 (fun e => h3 (e1.trans e.symm))
  · by_cases e2 : lineState f x t h ((lineMatching h).mate v) = p
    · refine key _ e2 ?_ ?_ <;> rw [(lineMatching h).mate_mate]
      · exact h1
      · exact e1
    · exact absurd (third _ _ b p h1 e1 h2 e2 hp) h3

/-! ## `T4`: mirrors at rest, the other excitation in free flight between them -/

section Mirror

variable (f : Pair → Pair) (b p : Tone) (m : Bool → Bool → Move)

/-- A pair with no mirror swaps. -/
private theorem mirror_swap (hf : MovedBy f (fun s => decide (s = p)) m) (hb : Balanced m .keep)
    (hff : m false false = .swap) (M : Matching Int) (hM : ∀ v, M.mate v ≠ v) (y : Config Int)
    (c : Int) (e1 : y c ≠ p) (e2 : y (M.mate c) ≠ p) : M.step f y c = y (M.mate c) := by
  have hs := step_eq f (fun s => decide (s = p)) m .keep hf hb M hM y c
  have he : M.edgeMove m (fun w => decide (y w = p)) c = .swap := by
    rw [edge_ff m M _ c (by simp [e1]) (by simp [e2]), hff]
  rw [hs, he]
  rfl

/-- The movers left of every mirror (and right of every mirror) are in free flight: at the start
    of round `t` a mover on an even cell left of every mirror sits at least `2 t` right of `a`, and
    one on an odd cell right of every mirror at least `2 t` left of `a + w`; after colour 0 the
    same holds with odd and even exchanged and `2 t + 1`. -/
private theorem mirror_tracks (hf : MovedBy f (fun s => decide (s = p)) m)
    (hb : Balanced m .keep) (hff : m false false = .swap) (x : Config Int) (a w : Int)
    (hx : InWindow b x a w) :
    ∀ (t : Nat) (h : Bool) (c : Int), lineState f x t h c ≠ b → lineState f x t h c ≠ p →
      ((∀ l, l ≤ c → x l ≠ p) → (c % 2 = 0) = (h = false) →
        a + 2 * (t : Int) + (if h then 1 else 0) ≤ c) ∧
      ((∀ l, c ≤ l → x l ≠ p) → (c % 2 = 1) = (h = false) →
        c + 2 * (t : Int) + (if h then 1 else 0) < a + w) := by
  have hl := line_layer_keep f (fun s => decide (s = p)) m hf hb x
  have hmir : ∀ t h c, lineState f x t h c = p ↔ x c = p := fun t h c =>
    decide_eq_true_of p _ _ (hl t h c)
  have htrue : ∀ t : Nat, (∀ c, lineState f x t false c ≠ b → lineState f x t false c ≠ p →
      ((∀ l, l ≤ c → x l ≠ p) → c % 2 = 0 → a + 2 * (t : Int) ≤ c) ∧
      ((∀ l, c ≤ l → x l ≠ p) → c % 2 = 1 → c + 2 * (t : Int) < a + w)) →
      ∀ c, lineState f x t true c ≠ b → lineState f x t true c ≠ p →
      ((∀ l, l ≤ c → x l ≠ p) → c % 2 = 1 → a + 2 * (t : Int) + 1 ≤ c) ∧
      ((∀ l, c ≤ l → x l ≠ p) → c % 2 = 0 → c + 2 * (t : Int) + 1 < a + w) := by
    intro t ih c hc1 hc2
    have hnp : ∀ u, x u ≠ p → lineState f x t false u ≠ p := fun u hu e => hu ((hmir t false u).1 e)
    refine ⟨fun hL hc => ?_, fun hR hc => ?_⟩
    · have hm0 : mate0 c = c - 1 := by unfold mate0; omega
      have hs := mirror_swap f p m hf hb hff brick0 brick0_ne (lineState f x t false) c
        (hnp c (hL c le_rfl)) (by rw [show brick0.mate c = c - 1 from hm0]; exact hnp _ (hL _ (by omega)))
      rw [state_true, hs, show brick0.mate c = c - 1 from hm0] at hc1 hc2
      have := (ih (c - 1) hc1 hc2).1 (fun l hl' => hL l (by omega)) (by omega)
      omega
    · have hm0 : mate0 c = c + 1 := by unfold mate0; omega
      have hs := mirror_swap f p m hf hb hff brick0 brick0_ne (lineState f x t false) c
        (hnp c (hR c le_rfl)) (by rw [show brick0.mate c = c + 1 from hm0]; exact hnp _ (hR _ (by omega)))
      rw [state_true, hs, show brick0.mate c = c + 1 from hm0] at hc1 hc2
      have := (ih (c + 1) hc1 hc2).2 (fun l hl' => hR l (by omega)) (by omega)
      omega
  have hfalse : ∀ t : Nat, ∀ c, lineState f x t false c ≠ b → lineState f x t false c ≠ p →
      ((∀ l, l ≤ c → x l ≠ p) → c % 2 = 0 → a + 2 * (t : Int) ≤ c) ∧
      ((∀ l, c ≤ l → x l ≠ p) → c % 2 = 1 → c + 2 * (t : Int) < a + w) := by
    intro t
    induction t with
    | zero =>
      intro c hc _
      obtain ⟨w1, w2⟩ := hx c hc
      exact ⟨fun _ _ => by omega, fun _ _ => by omega⟩
    | succ t ih =>
      have ih' := htrue t ih
      intro c hc1 hc2
      have hnp : ∀ u, x u ≠ p → lineState f x t true u ≠ p := fun u hu e => hu ((hmir t true u).1 e)
      refine ⟨fun hL hc => ?_, fun hR hc => ?_⟩
      · have hm1 : mate1 c = c - 1 := by unfold mate1; omega
        have hs := mirror_swap f p m hf hb hff brick1 brick1_ne (lineState f x t true) c
          (hnp c (hL c le_rfl)) (by rw [show brick1.mate c = c - 1 from hm1]; exact hnp _ (hL _ (by omega)))
        rw [state_succ, hs, show brick1.mate c = c - 1 from hm1] at hc1 hc2
        have := (ih' (c - 1) hc1 hc2).1 (fun l hl' => hL l (by omega)) (by omega)
        push_cast
        omega
      · have hm1 : mate1 c = c + 1 := by unfold mate1; omega
        have hs := mirror_swap f p m hf hb hff brick1 brick1_ne (lineState f x t true) c
          (hnp c (hR c le_rfl)) (by rw [show brick1.mate c = c + 1 from hm1]; exact hnp _ (hR _ (by omega)))
        rw [state_succ, hs, show brick1.mate c = c + 1 from hm1] at hc1 hc2
        have := (ih' (c + 1) hc1 hc2).2 (fun l hl' => hR l (by omega)) (by omega)
        push_cast
        omega
  intro t h c hc1 hc2
  cases h
  · obtain ⟨k1, k2⟩ := hfalse t c hc1 hc2
    refine ⟨fun hL hc => ?_, fun hR hc => ?_⟩
    · have := k1 hL (by simpa using hc)
      simp only [Bool.false_eq_true, ↓reduceIte]
      omega
    · have := k2 hR (by simpa using hc)
      simp only [Bool.false_eq_true, ↓reduceIte]
      omega
  · obtain ⟨k1, k2⟩ := htrue t (hfalse t) c hc1 hc2
    refine ⟨fun hL hc => ?_, fun hR hc => ?_⟩
    · have h' : c % 2 = 1 := by
        have : ¬ c % 2 = 0 := by simpa using hc
        omega
      simpa using k1 hL h'
    · have h' : c % 2 = 0 := by
        have : ¬ c % 2 = 1 := by simpa using hc
        omega
      simpa using k2 hR h'

end Mirror

/-- **`T4` on the brick line.** Let `p ≠ b` be a mirror tone: the rule `f` is moved by `s = p`
    with `σ = keep` (a pair holding exactly one mirror is kept, so mirrors never move) and a pair
    without a mirror swaps (`m false false = swap`: the other excitation flies free between
    mirrors). Then from a start in a window of width `w` every meeting at a half step of round `t`
    whose pair is not inside the cavity of the start's mirrors has `2 t + 2 ≤ w`: a mover outside
    the cavity hits its outermost mirror once, on its way in from the window. -/
theorem thm_fis_mirror_meetings (f : Pair → Pair) (b p : Tone) (m : Bool → Bool → Move)
    (hp : p ≠ b) (hf : MovedBy f (fun s => decide (s = p)) m) (hb : Balanced m .keep)
    (hff : m false false = .swap) (x : Config Int) (a w : Int) (hx : InWindow b x a w)
    (t : Nat) (h : Bool) (v : Int) (hm : Meets b (lineMatching h) (lineState f x t h) v)
    (hcav : ¬ InCavity x p v ((lineMatching h).mate v)) : 2 * (t : Int) + 2 ≤ w := by
  obtain ⟨h1, h2, h3⟩ := hm
  have hl := line_layer_keep f (fun s => decide (s = p)) m hf hb x
  have hmir : ∀ c, lineState f x t h c = p ↔ x c = p := fun c =>
    decide_eq_true_of p _ _ (hl t h c)
  have htr := mirror_tracks f b p m hf hb hff x a w hx t h
  -- the bound for a mover at `c` beside a mirror at its mate, the pair outside the cavity
  have key : ∀ c, lineState f x t h c ≠ b → lineState f x t h c ≠ p →
      lineState f x t h ((lineMatching h).mate c) = p →
      ¬ InCavity x p c ((lineMatching h).mate c) → 2 * (t : Int) + 2 ≤ w := by
    intro c hq1 hq2 hmc hnc
    have xe : x ((lineMatching h).mate c) = p := (hmir _).1 hmc
    obtain ⟨e1, e2⟩ := hx _ (by rw [xe]; exact hp)
    obtain ⟨k1, k2⟩ := htr c hq1 hq2
    have hd : (lineMatching h).mate c = c + 1 ∨ (lineMatching h).mate c = c - 1 := by
      cases h
      · change mate0 c = c + 1 ∨ mate0 c = c - 1
        unfold mate0; omega
      · change mate1 c = c + 1 ∨ mate1 c = c - 1
        unfold mate1; omega
    rcases hd with hd | hd
    · have hL : ∀ l, l ≤ c → x l ≠ p := by
        intro l hl' hxl
        exact hnc ⟨l, _, hxl, xe, hl', by omega, by omega, le_rfl⟩
      have hpar : (c % 2 = 0) = (h = false) := by
        cases h
        · change mate0 c = c + 1 at hd
          unfold mate0 at hd
          simp only [eq_iff_iff, iff_true]
          omega
        · change mate1 c = c + 1 at hd
          unfold mate1 at hd
          simp only [Bool.true_eq_false, eq_iff_iff, iff_false]
          omega
      have := k1 hL hpar
      rw [hd] at e2
      split_ifs at this <;> omega
    · have hR : ∀ l, c ≤ l → x l ≠ p := by
        intro l hl' hxl
        exact hnc ⟨_, l, xe, hxl, by omega, le_rfl, hl', by omega⟩
      have hpar : (c % 2 = 1) = (h = false) := by
        cases h
        · change mate0 c = c - 1 at hd
          unfold mate0 at hd
          simp only [eq_iff_iff, iff_true]
          omega
        · change mate1 c = c - 1 at hd
          unfold mate1 at hd
          simp only [Bool.true_eq_false, eq_iff_iff, iff_false]
          omega
      have := k2 hR hpar
      rw [hd] at e1
      split_ifs at this <;> omega
  by_cases e2 : lineState f x t h ((lineMatching h).mate v) = p
  · exact key v h1 (fun e => h3 (e.trans e2.symm)) e2 hcav
  · by_cases e1 : lineState f x t h v = p
    · refine key _ h2 e2 ?_ ?_ <;> rw [(lineMatching h).mate_mate]
      · exact e1
      · intro hc
        apply hcav
        obtain ⟨l, r, hl1, hl2, q1, q2, q3, q4⟩ := hc
        exact ⟨l, r, hl1, hl2, q2, q1, q4, q3⟩
    · exact absurd (third _ _ b p h1 e1 h2 e2 hp) h3

/-! ## `T0`, `T1`: the meetings of a static pair never end -/

/-- **`T0`, `T1` on the brick line: no bound.** For any rule moved by occupancy with
    `σ = keep` (occupancy never moves, as in `T0` and `T1`), a start whose only excitations are
    two distinct tones on cells 0 and 1 has a meeting on the pair `(0, 1)` at colour 0 of every
    round. So the finite-interaction bound holds only for `T2` to `T5`, and the code rightly reads
    `T0` and `T1` by their exact return instead. -/
theorem thm_fis_static_meet_forever (f : Pair → Pair) (b : Tone) (m : Bool → Bool → Move)
    (hf : MovedBy f (occ b) m) (hb : Balanced m .keep) (x : Config Int)
    (h0 : x 0 ≠ b) (h1 : x 1 ≠ b) (h01 : x 0 ≠ x 1) (hrest : ∀ v, v ≠ 0 → v ≠ 1 → x v = b)
    (t : Nat) : Meets b brick0 (lineState f x t false) 0 := by
  have hl := line_layer_keep f (occ b) m hf hb x t false
  have hpull := (thm_species_pull_back f (occ b) m .keep hf hb brick).1 x t
  have hm : brick0.mate 0 = 1 := rfl
  let π := iterPullPerm m .keep brick t (fun w => occ b (x w))
  have s0 : lineState f x t false 0 ≠ b := by simpa [occ, h0] using hl 0
  have s1 : lineState f x t false 1 ≠ b := by simpa [occ, h1] using hl 1
  refine ⟨s0, by rw [hm]; exact s1, ?_⟩
  rw [hm]
  intro e
  have p0 : lineState f x t false 0 = x (π 0) := hpull 0
  have p1 : lineState f x t false 1 = x (π 1) := hpull 1
  have q0 : π 0 = 0 ∨ π 0 = 1 := by
    by_contra hc
    exact s0 (p0.trans (hrest _ (fun e => hc (Or.inl e)) (fun e => hc (Or.inr e))))
  have q1 : π 1 = 0 ∨ π 1 = 1 := by
    by_contra hc
    exact s1 (p1.trans (hrest _ (fun e => hc (Or.inl e)) (fun e => hc (Or.inr e))))
  have hne : π 0 ≠ π 1 := fun e' => absurd (π.injective e') (by omega)
  rw [p0, p1] at e
  rcases q0 with q0 | q0 <;> rcases q1 with q1 | q1 <;> rw [q0, q1] at e hne
  · exact hne rfl
  · exact h01 e
  · exact h01 e.symm
  · exact hne rfl

/-! ## The 24 species cells -/

/-- The B15-style row of one cell for this module: in `T0`, `T1` the rule is moved by occupancy
    with `σ = keep`; in `T2`, `T3` by occupancy with `σ = swap`; in `T4` by its static tone with
    `σ = keep` and a mirror-free pair swapping; in `T5` by its mover with `σ = swap` and a
    mover-free pair kept. -/
def fisRowB (f : Pair → Pair) (b : Tone) : Bool :=
  match cellType f b with
  | some .t0 | some .t1 =>
      movedByB f (occ b) (mtab f (occ b)) && decide (mtab f (occ b) true false = .keep) &&
        decide (mtab f (occ b) false true = .keep)
  | some .t2 | some .t3 =>
      movedByB f (occ b) (mtab f (occ b)) && decide (mtab f (occ b) true false = .swap) &&
        decide (mtab f (occ b) false true = .swap)
  | some .t4 =>
      movedByB f (fun s => decide (s = staticOf f b)) (mtab f (fun s => decide (s = staticOf f b))) &&
        decide (mtab f (fun s => decide (s = staticOf f b)) true false = .keep) &&
        decide (mtab f (fun s => decide (s = staticOf f b)) false true = .keep) &&
        decide (mtab f (fun s => decide (s = staticOf f b)) false false = .swap) &&
        decide (staticOf f b ≠ b)
  | some .t5 =>
      movedByB f (fun s => decide (s = moverOf f b)) (mtab f (fun s => decide (s = moverOf f b))) &&
        decide (mtab f (fun s => decide (s = moverOf f b)) true false = .swap) &&
        decide (mtab f (fun s => decide (s = moverOf f b)) false true = .swap) &&
        decide (mtab f (fun s => decide (s = moverOf f b)) false false = .keep) &&
        decide (moverOf f b ≠ b)
  | none => true

private theorem fis_cells : ∀ c ∈ cells, fisRowB (prTable c.1) c.2 = true := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

private theorem moved_of_b (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (h : movedByB f d m = true) : MovedBy f d m := by
  unfold movedByB at h
  simp only [List.all_eq_true, decide_eq_true_eq] at h
  exact fun a c => h a (mem_tones a) c (mem_tones c)

/-- An interaction of the cell `(f, b)` at half step `h` of round `t` from the start `x`, on the
    pair of `v`: a meeting (`lineTransient`'s u-v meeting), not inside the cavity when the cell is
    `T4`. -/
def Interaction (f : Pair → Pair) (b : Tone) (x : Config Int) (t : Nat) (h : Bool) (v : Int) :
    Prop :=
  Meets b (lineMatching h) (lineState f x t h) v ∧
    (cellType f b = some .t4 → ¬ InCavity x (staticOf f b) v ((lineMatching h).mate v))

/-- **A7, the species cells on the brick line finish interacting.** In each species cell of the
    72 of type `T2`, `T3`, `T4` or `T5` (18 cells), from any start whose excitations lie in a
    window of width `w`, every interaction at a half step of round `t` (rounds from 0) has
    `t ≤ w - 2`, so every start finishes interacting before round `w - 1`; more sharply
    `2 t + 2 ≤ w`, and `4 t + 2 ≤ w` in `T2` and `T3`. -/
theorem thm_fis_species_cells :
    ∀ c ∈ cells, ∀ T : CellType, cellType (prTable c.1) c.2 = some T → T ≠ .t0 → T ≠ .t1 →
      ∀ (x : Config Int) (a w : Int), InWindow c.2 x a w →
      ∀ (t : Nat) (h : Bool) (v : Int), Interaction (prTable c.1) c.2 x t h v →
        (t : Int) ≤ w - 2 ∧ 2 * (t : Int) + 2 ≤ w ∧
          ((T = .t2 ∨ T = .t3) → 4 * (t : Int) + 2 ≤ w) := by
  intro c hc T hT h0 h1 x a w hx t h v hI
  have hrow := fis_cells c hc
  unfold fisRowB at hrow
  rw [hT] at hrow
  obtain ⟨hm, hcav⟩ := hI
  have occCase : (T = .t2 ∨ T = .t3) → 4 * (t : Int) + 2 ≤ w := by
    rintro (rfl | rfl) <;>
    · simp only [Bool.and_eq_true, decide_eq_true_eq] at hrow
      obtain ⟨⟨hmv, h1'⟩, h2'⟩ := hrow
      exact thm_fis_occupancy_meetings _ c.2 _ (moved_of_b _ _ _ hmv) ⟨h1', h2'⟩ x a w hx t h v hm
  have two : 2 * (t : Int) + 2 ≤ w := by
    cases T with
    | t0 => exact absurd rfl h0
    | t1 => exact absurd rfl h1
    | t2 => have := occCase (Or.inl rfl); omega
    | t3 => have := occCase (Or.inr rfl); omega
    | t4 =>
      simp only [Bool.and_eq_true, decide_eq_true_eq] at hrow
      obtain ⟨⟨⟨⟨hmv, h1'⟩, h2'⟩, hff⟩, hp⟩ := hrow
      exact thm_fis_mirror_meetings _ c.2 _ _ hp (moved_of_b _ _ _ hmv) ⟨h1', h2'⟩ hff x a w hx
        t h v hm (hcav hT)
    | t5 =>
      simp only [Bool.and_eq_true, decide_eq_true_eq] at hrow
      obtain ⟨⟨⟨⟨hmv, h1'⟩, h2'⟩, hff⟩, hp⟩ := hrow
      exact thm_fis_mover_meetings _ c.2 _ _ hp (moved_of_b _ _ _ hmv) ⟨h1', h2'⟩ hff x a w hx
        t h v hm
  exact ⟨by omega, two, occCase⟩

/-- **`T0`, `T1` among the 72: no bound.** In each of the 6 species cells of type `T0` or `T1`,
    the start holding the two excitations of the background on cells 0 and 1 meets at colour 0 of
    every round, so `thm_fis_species_cells` cannot be extended to them. -/
theorem thm_fis_static_cells :
    ∀ c ∈ cells, (cellType (prTable c.1) c.2 = some .t0 ∨ cellType (prTable c.1) c.2 = some .t1) →
      ∀ x : Config Int, x 0 = (excitations c.2).1 → x 1 = (excitations c.2).2 →
        (∀ v, v ≠ 0 → v ≠ 1 → x v = c.2) →
        ∀ t : Nat, Interaction (prTable c.1) c.2 x t false 0 := by
  intro c hc hT x hx0 hx1 hrest t
  have hrow := fis_cells c hc
  unfold fisRowB at hrow
  have hex : (excitations c.2).1 ≠ c.2 ∧ (excitations c.2).2 ≠ c.2 ∧
      (excitations c.2).1 ≠ (excitations c.2).2 := by
    cases c.2 <;> decide
  have hm : Meets c.2 brick0 (lineState (prTable c.1) x t false) 0 := by
    rcases hT with hT | hT <;> rw [hT] at hrow <;>
    · simp only [Bool.and_eq_true, decide_eq_true_eq] at hrow
      obtain ⟨⟨hmv, h1'⟩, h2'⟩ := hrow
      exact thm_fis_static_meet_forever _ c.2 _ (moved_of_b _ _ _ hmv) ⟨h1', h2'⟩ x
        (by rw [hx0]; exact hex.1) (by rw [hx1]; exact hex.2.1) (by rw [hx0, hx1]; exact hex.2.2)
        hrest t
  refine ⟨hm, fun h4 => ?_⟩
  rcases hT with hT | hT <;> rw [hT] at h4 <;> exact absurd h4 (by decide)

end SpeciesLine

end Compute

end Vibe
