import Mathlib.Logic.Function.Iterate
import Vibe.Compute.Round
import Vibe.Compute.RuleCensus
import Vibe.Generated.Kleene

/-!
# Vibe Theory: Kleene and Counter Certificates on the Brick Line

The line results of milestones M5 and M6 (E-CMP-0058, E-CMP-0061, G6), proved on the round of
`Vibe.Compute.Round` over the infinite line `Int` under the brick schedule (colour 0 pairs `(2k, 2k + 1)`,
colour 1 pairs `(2k + 1, 2k + 2)`, the left cell first), with every rule read from the code's own census
table (`RuleCensus.genTable`, tied to `pair-rule.ts` by `gen_pair_rules_eq`).

- **B4, the one-law Kleene basis** (`thm_kleene_neg_width_nine`, `thm_kleene_min_max_width_twelve`): each
  of the four one-law cells `id.CAB.swap`, `id.BCA.swap` on `+1` and `swap.BCA.id`, `swap.CAB.id` on `-1`
  has a layout of window width 9 whose read slot holds `neg x` after the read round, for every input, and
  layouts of width 12 that compute Kleene `min` and `max`, for every pair of inputs. Each witness is a layout
  the code found (`Vibe.Generated.Kleene`): the four of E-CMP-0058 and the twelve of E-CMP-0061, all sixteen
  run here by the Lean round on every input (`gen_kleene_layouts_eq`, which also proves the Lean round's read
  table equals the code's dense run `denseLineTable` on every exported layout). Only the existence is
  claimed: that width 9 is the least for `neg`, and that no mux or Fredkin gate exists to span 12, are
  bounded searches and stay measurements.
- **A9, the T5 counter** (`thm_kleene_counter_add_sub`): in `id.CBA.swap` on the vacuum, a register `-1` at
  any `a : Int` and `n` movers `+1` placed as `registerRun` of counter.ts places them (from the right for ADD,
  from the left for SUB, 4 cells apart) end, after `4 n + 8` rounds, with the one `-1` at exactly `a + n`
  (ADD) or `a - n` (SUB), and every `+1` on its free-flight track, for every `a` and `n`. The proof is an
  induction over half steps: on any matching of any graph, a `+1` always crosses and a `-1` moves exactly
  when its mate holds a `+1` (`thm_kleene_register_move`, `thm_kleene_register_stay`), and the `k`-th mover
  meets the register at half step `e - 1 + 3 k`.
- **B5, the 162 cases** (`thm_kleene_counter_cases`, `gen_kleene_counter_eq`): the code's ADD and SUB value of
  every case `a, n` in `0 .. 8` is `a + n` and `a - n` and is the Lean round's register.

Limits, stated once: a Kleene certificate reads the slot at the read round; that the output then rides its
wire for 8 rounds (both runners of the experiments) is not certified here. The counter's start layout is
the formula of `registerRun`, restated in `moverPos`, and tied to the code through the 162 values only.

Zero `sorry`, zero `native_decide`; the finite checks are `decide +kernel`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

namespace Kleene

open Function
open RuleCensus

/-! ## The brick line -/

/-- The mate of `v` under colour `c` of the brick line: the cells `(c + 2k, c + 2k + 1)` are paired. -/
def brickMate (c : Int) (v : Int) : Int := if (v - c) % 2 = 0 then v + 1 else v - 1

/-- Colour `c` of the brick line, the cell `c + 2k` first. -/
def half (c : Int) : Matching Int where
  mate := brickMate c
  mate_mate v := by unfold brickMate; split_ifs <;> omega
  lead v := decide ((v - c) % 2 = 0)
  lead_mate v _ := by
    unfold brickMate
    by_cases h : (v - c) % 2 = 0
    · have h1 : ¬ ((v + 1 - c) % 2 = 0) := by omega
      simp [h, h1]
    · have h1 : (v - 1 - c) % 2 = 0 := by omega
      simp [h, h1]

/-- The brick schedule of gates.ts and counter.ts: colour 0, then colour 1. -/
def brick : Schedule Int := [half 0, half 1]

/-! ## Layouts and the Kleene connectives -/

/-- A window cell: `-1, 0, 1` is that constant tone, `2` is input `x`, anything else input `y`. -/
def cellTone (w : Int) (x y : Tone) : Tone :=
  if w = -1 then .neg else if w = 0 then .zero else if w = 1 then .pos else if w = 2 then x else y

/-- A line layout of gates.ts: a census rule, a background tone, a window of cells from position `start`,
    and the slot read after `readRound` rounds. -/
structure Layout where
  rule : Nat
  bg : Int
  start : Int
  window : List Int
  readPos : Int
  readRound : Nat

/-- A layout is well formed for an arity: constants and inputs only, input `x` placed once, input `y` placed
    once when binary and never when unary, and a tone for the background. -/
abbrev Layout.Wf (L : Layout) (arity : Nat) : Prop :=
  (∀ w ∈ L.window, -1 ≤ w ∧ w ≤ 3) ∧ L.window.count 2 = 1 ∧ L.window.count 3 = arity - 1 ∧
    (L.bg = -1 ∨ L.bg = 0 ∨ L.bg = 1)

/-- The start configuration on the whole line for inputs `x`, `y`: the window, background elsewhere. -/
def Layout.config (L : Layout) (x y : Tone) : Config Int := fun v =>
  if L.start ≤ v ∧ v < L.start + L.window.length then
    cellTone (L.window.getD (v - L.start).toNat L.bg) x y
  else cellTone L.bg x y

/-- The read slot after the read round of the Lean round, for inputs `x`, `y`. -/
def Layout.out (L : Layout) (x y : Tone) : Tone :=
  (round (genTable L.rule) brick)^[L.readRound] (L.config x y) L.readPos

/-- Kleene `min` on tones (`-1 < 0 < +1`). -/
def tMin (a b : Tone) : Tone := if a.value ≤ b.value then a else b

/-- Kleene `max` on tones. -/
def tMax (a b : Tone) : Tone := if a.value ≤ b.value then b else a

/-- The connective a target name of gates.ts' `KLEENE_TARGETS` denotes (`neg` reads `x` only). -/
def target (t : String) (x y : Tone) : Tone :=
  if t = "neg" then x.dual else if t = "min" then tMin x y else tMax x y

/-- The arity of a target name. -/
def arityOf (t : String) : Nat := if t = "neg" then 1 else 2

/-- A table over the inputs in `inputsOf` order (x least significant), as tone values. -/
def tableOf (arity : Nat) (g : Tone → Tone → Tone) : List Int :=
  if arity = 1 then tones.map (fun x => (g x .zero).value)
  else tones.flatMap (fun y => tones.map (fun x => (g x y).value))

/-- Whether `L.out` equals `g` on all nine input pairs. -/
def checkB (L : Layout) (g : Tone → Tone → Tone) : Bool :=
  tones.all fun x => tones.all fun y => decide (L.out x y = g x y)

private theorem checkB_sound {L : Layout} {g : Tone → Tone → Tone} (h : checkB L g = true) :
    ∀ x y, L.out x y = g x y := by
  intro x y
  unfold checkB at h
  rw [List.all_eq_true] at h
  have hx := h x (mem_tones x)
  rw [List.all_eq_true] at hx
  exact of_decide_eq_true (hx y (mem_tones y))

/-! ## The generated layouts -/

/-- A row of `Generated.kleeneLayouts`. -/
abbrev Row := String × Nat × String × Int × Int × List Int × Int × Nat × String × List Int

/-- The experiment code of a row. -/
def rowCode (r : Row) : String := r.1

/-- The rule name of a row. -/
def rowName (r : Row) : String := r.2.2.1

/-- The target name of a row. -/
def rowTarget (r : Row) : String := r.2.2.2.2.2.2.2.2.1

/-- The code's dense table of a row. -/
def rowDense (r : Row) : List Int := r.2.2.2.2.2.2.2.2.2

/-- The layout of a row. -/
def rowLayout (r : Row) : Layout where
  rule := r.2.1
  bg := r.2.2.2.1
  start := r.2.2.2.2.1
  window := r.2.2.2.2.2.1
  readPos := r.2.2.2.2.2.2.1
  readRound := r.2.2.2.2.2.2.2.1

/-- Bridge for `kleeneLayouts`: for every exported layout, the census rule at its index has its name, the
    layout is well formed for its target, the Lean round's read table on every input equals the code's dense
    table, and that table is the target connective's. -/
theorem gen_kleene_layouts_eq :
    ∀ r ∈ Generated.kleeneLayouts,
      ruleName (genTable (rowLayout r).rule) = rowName r ∧
      (rowLayout r).Wf (arityOf (rowTarget r)) ∧
      tableOf (arityOf (rowTarget r)) (rowLayout r).out = rowDense r ∧
      rowDense r = tableOf (arityOf (rowTarget r)) (target (rowTarget r)) := by
  decide +kernel

private theorem rows_compute :
    ∀ r ∈ Generated.kleeneLayouts, checkB (rowLayout r) (target (rowTarget r)) = true := by
  decide +kernel

/-- The four one-law cells with their background. -/
def oneLawCells : List (String × Int) :=
  [("id.CAB.swap", 1), ("id.BCA.swap", 1), ("swap.BCA.id", -1), ("swap.CAB.id", -1)]

private theorem cover_neg_nine :
    ∀ c ∈ oneLawCells, ∃ r ∈ Generated.kleeneLayouts,
      rowCode r = "E-CMP-0058" ∧ rowName r = c.1 ∧ (rowLayout r).bg = c.2 ∧ rowTarget r = "neg" ∧
        (rowLayout r).window.length = 9 := by
  decide +kernel

private theorem cover_min_max_twelve :
    ∀ c ∈ oneLawCells, ∀ t ∈ ["min", "max"], ∃ r ∈ Generated.kleeneLayouts,
      rowCode r = "E-CMP-0061" ∧ rowName r = c.1 ∧ (rowLayout r).bg = c.2 ∧ rowTarget r = t ∧
        (rowLayout r).window.length = 12 := by
  decide +kernel

private theorem row_facts (r : Row) (hr : r ∈ Generated.kleeneLayouts) :
    ruleName (genTable (rowLayout r).rule) = rowName r ∧ (rowLayout r).Wf (arityOf (rowTarget r)) ∧
      ∀ x y, (rowLayout r).out x y = target (rowTarget r) x y :=
  ⟨(gen_kleene_layouts_eq r hr).1, (gen_kleene_layouts_eq r hr).2.1, checkB_sound (rows_compute r hr)⟩

/-- B4, `neg`. Each of the four one-law cells has a well-formed unary layout of window width 9 on its
    background whose read slot holds `neg x` for every input `x` (and whatever `y`, which it never reads):
    the layouts E-CMP-0058 replays. -/
theorem thm_kleene_neg_width_nine :
    ∀ c ∈ oneLawCells, ∃ L : Layout,
      ruleName (genTable L.rule) = c.1 ∧ L.bg = c.2 ∧ L.window.length = 9 ∧ L.Wf 1 ∧
        ∀ x y : Tone, L.out x y = x.dual := by
  intro c hc
  obtain ⟨r, hr, -, hname, hbg, htgt, hlen⟩ := cover_neg_nine c hc
  obtain ⟨h1, h2, h3⟩ := row_facts r hr
  refine ⟨rowLayout r, by rw [h1, hname], hbg, hlen, ?_, ?_⟩
  · simpa [htgt, arityOf] using h2
  · intro x y
    simpa [htgt, target] using h3 x y

/-- B4, `min` and `max`. Each of the four one-law cells has well-formed binary layouts of window width 12 on
    its background whose read slot holds Kleene `min x y`, and `max x y`, for every pair of inputs: the
    layouts E-CMP-0061 found. With `neg` they are a full Kleene basis with garbage on the line. -/
theorem thm_kleene_min_max_width_twelve :
    ∀ c ∈ oneLawCells,
      (∃ L : Layout, ruleName (genTable L.rule) = c.1 ∧ L.bg = c.2 ∧ L.window.length = 12 ∧ L.Wf 2 ∧
        ∀ x y : Tone, L.out x y = tMin x y) ∧
      (∃ L : Layout, ruleName (genTable L.rule) = c.1 ∧ L.bg = c.2 ∧ L.window.length = 12 ∧ L.Wf 2 ∧
        ∀ x y : Tone, L.out x y = tMax x y) := by
  intro c hc
  constructor
  · obtain ⟨r, hr, -, hname, hbg, htgt, hlen⟩ := cover_min_max_twelve c hc "min" (by simp)
    obtain ⟨h1, h2, h3⟩ := row_facts r hr
    refine ⟨rowLayout r, by rw [h1, hname], hbg, hlen, ?_, ?_⟩
    · simpa [htgt, arityOf] using h2
    · intro x y
      simpa [htgt, target] using h3 x y
  · obtain ⟨r, hr, -, hname, hbg, htgt, hlen⟩ := cover_min_max_twelve c hc "max" (by simp)
    obtain ⟨h1, h2, h3⟩ := row_facts r hr
    refine ⟨rowLayout r, by rw [h1, hname], hbg, hlen, ?_, ?_⟩
    · simpa [htgt, arityOf] using h2
    · intro x y
      simpa [htgt, target] using h3 x y

/-! ## The register on any matching -/

/-- The T5 laws of `id.CBA.swap`: a `+1` always crosses its partner, and a `-1` moves exactly when its
    partner is a `+1`. -/
def T5Law (f : Pair → Pair) : Prop :=
  ∀ a b : Tone,
    ((f (a, b)).1 = .pos ↔ b = .pos) ∧ ((f (a, b)).2 = .pos ↔ a = .pos) ∧
    ((f (a, b)).1 = .neg ↔ (a = .neg ∧ b ≠ .pos) ∨ (a = .pos ∧ b = .neg)) ∧
    ((f (a, b)).2 = .neg ↔ (b = .neg ∧ a ≠ .pos) ∨ (b = .pos ∧ a = .neg))

/-- A register configuration: one `-1` at `s`, a `+1` exactly where `P` holds, `0` elsewhere. -/
def IsReg {V : Type*} (x : Config V) (s : V) (P : V → Prop) : Prop :=
  ∀ v, (x v = .neg ↔ v = s) ∧ (x v = .pos ↔ P v)

section Register

variable {V : Type*} [DecidableEq V]

private theorem step_local {f : Pair → Pair} (hf : T5Law f) (M : Matching V) (x : Config V) (v : V) :
    (M.step f x v = .pos ↔ x (M.mate v) = .pos) ∧
    (M.step f x v = .neg ↔
      (x v = .neg ∧ x (M.mate v) ≠ .pos) ∨ (x v = .pos ∧ x (M.mate v) = .neg)) := by
  by_cases h1 : M.mate v = v
  · have e : M.step f x v = x v := by simp only [Matching.step, h1, ↓reduceIte]
    rw [e, h1]
    constructor
    · exact Iff.rfl
    · cases x v <;> simp
  · by_cases h2 : M.lead v = true
    · have e : M.step f x v = (f (x v, x (M.mate v))).1 := by
        simp only [Matching.step, h1, h2, ↓reduceIte]
      rw [e]
      obtain ⟨ha, -, hc, -⟩ := hf (x v) (x (M.mate v))
      exact ⟨ha, hc⟩
    · have e : M.step f x v = (f (x (M.mate v), x v)).2 := by
        simp only [Matching.step, h1, h2, Bool.false_eq_true, ↓reduceIte]
      rw [e]
      obtain ⟨-, hb, -, hd⟩ := hf (x (M.mate v)) (x v)
      exact ⟨hb, hd⟩

/-- On any matching, a register whose `-1` has a `+1` as mate: the `-1` moves to its mate, and every `+1`
    crosses. -/
theorem thm_kleene_register_move {f : Pair → Pair} (hf : T5Law f) (M : Matching V) (x : Config V) (s : V)
    (P : V → Prop) (h : IsReg x s P) (hp : P (M.mate s)) :
    IsReg (M.step f x) (M.mate s) (fun v => P (M.mate v)) := by
  intro v
  obtain ⟨hpos, hneg⟩ := step_local hf M x v
  refine ⟨?_, by rw [hpos, (h (M.mate v)).2]⟩
  rw [hneg, ne_eq, (h v).1, (h (M.mate v)).2, (h v).2, (h (M.mate v)).1]
  constructor
  · rintro (⟨rfl, hn⟩ | ⟨-, hm⟩)
    · exact absurd hp hn
    · rw [← hm, M.mate_mate]
  · rintro rfl
    exact Or.inr ⟨hp, M.mate_mate s⟩

/-- On any matching, a register whose `-1` has no `+1` as mate: the `-1` stays, and every `+1` crosses. -/
theorem thm_kleene_register_stay {f : Pair → Pair} (hf : T5Law f) (M : Matching V) (x : Config V) (s : V)
    (P : V → Prop) (h : IsReg x s P) (hp : ¬ P (M.mate s)) :
    IsReg (M.step f x) s (fun v => P (M.mate v)) := by
  intro v
  obtain ⟨hpos, hneg⟩ := step_local hf M x v
  refine ⟨?_, by rw [hpos, (h (M.mate v)).2]⟩
  rw [hneg, ne_eq, (h v).1, (h (M.mate v)).2, (h v).2, (h (M.mate v)).1]
  constructor
  · rintro (⟨hv, -⟩ | ⟨hv, hm⟩)
    · exact hv
    · exact absurd (by rw [← hm, M.mate_mate]; exact hv) hp
  · rintro rfl
    exact Or.inl ⟨rfl, hp⟩

end Register

private theorem isReg_congr {V : Type*} {x : Config V} {s s' : V} {P P' : V → Prop} (h : IsReg x s P)
    (hs : s = s') (hP : ∀ v, P v ↔ P' v) : IsReg x s' P' := by
  intro v
  rw [← hs, ← hP v]
  exact h v

/-! ## The T5 counter on the line -/

/-- The T5 counter rule, read from the code's census at the exported index. -/
def t5Rule : Pair → Pair := genTable Generated.kleeneCounterCell.1

private theorem t5_law : T5Law t5Rule := by
  intro a b
  cases a <;> cases b <;> decide +kernel

/-- Mover `k` of `registerRun` (counter.ts): from the right (`true`) the first odd position at least
    `a + 3 + 4 k`, from the left (`false`) the first even position at most `a - 3 - 4 k`. -/
def moverPos (a : Int) (k : Nat) : Bool → Int
  | true => if (a + 3 + 4 * k) % 2 = 0 then a + 3 + 4 * k + 1 else a + 3 + 4 * k
  | false => if (a - 3 - 4 * k) % 2 = 0 then a - 3 - 4 * k else a - 3 - 4 * k - 1

/-- The start of `registerRun`: the still `-1` at `a`, `n` movers `+1` from one side, the vacuum elsewhere. -/
def registerStart (a : Int) (n : Nat) (side : Bool) : Config Int := fun v =>
  if v = a then .neg
  else if (List.range n).any (fun k => decide (v = moverPos a k side)) then .pos else .zero

/-- The state after `h` half steps of the brick schedule (colour `h mod 2` next). -/
def lineAt (f : Pair → Pair) (x : Config Int) : Nat → Config Int
  | 0 => x
  | h + 1 => (half ((h % 2 : Nat) : Int)).step f (lineAt f x h)

private theorem round_iter (f : Pair → Pair) (x : Config Int) (t : Nat) :
    (round f brick)^[t] x = lineAt f x (2 * t) := by
  induction t with
  | zero => rfl
  | succ t ih =>
    rw [iterate_succ_apply', ih, show 2 * (t + 1) = 2 * t + 1 + 1 by omega]
    have h1 : (2 * t + 1) % 2 = 1 := by omega
    have h0 : (2 * t) % 2 = 0 := by omega
    simp only [lineAt, h1, h0]
    rfl

/-- The direction of a register update: ADD from the right, SUB from the left. -/
def sgn : Bool → Int
  | true => 1
  | false => -1

/-- The offset of mover 0 from the register: 3 or 4 by the parity of `a`. -/
def eOf (a : Int) : Bool → Nat
  | true => if a % 2 = 0 then 3 else 4
  | false => if a % 2 = 0 then 4 else 3

/-- The number of movers that crossed the register before half step `h`: mover `k` crosses at half step
    `e - 1 + 3 k`. -/
def cnt (n e h : Nat) : Nat := if (h + 3 - e) / 3 < n then (h + 3 - e) / 3 else n

/-- The movers at half step `h`: every one on its free-flight track. -/
def movers (a : Int) (n : Nat) (side : Bool) (h : Nat) (v : Int) : Prop :=
  ∃ k, k < n ∧ v = moverPos a k side - sgn side * h

private theorem movers_mate (a : Int) (n : Nat) (side : Bool) (h : Nat) (v : Int) :
    movers a n side h (brickMate ((h % 2 : Nat) : Int) v) ↔ movers a n side (h + 1) v := by
  unfold movers
  constructor
  · rintro ⟨k, hk, hv⟩
    refine ⟨k, hk, ?_⟩
    cases side <;> simp only [moverPos, sgn, brickMate] at hv ⊢ <;> split_ifs at hv ⊢ <;> omega
  · rintro ⟨k, hk, hv⟩
    refine ⟨k, hk, ?_⟩
    cases side <;> simp only [moverPos, sgn, brickMate] at hv ⊢ <;> split_ifs at hv ⊢ <;> omega

/-- The parity of `a + eOf a side`: odd movers from the right, even from the left. -/
def par : Bool → Int
  | true => 1
  | false => 0

private theorem eOf_spec (a : Int) (side : Bool) :
    (eOf a side = 3 ∨ eOf a side = 4) ∧ (a + (eOf a side : Int)) % 2 = par side := by
  cases side <;> simp only [eOf, par] <;> split_ifs <;> omega

private theorem moverPos_eq (a : Int) (k : Nat) (side : Bool) :
    moverPos a k side = a + sgn side * ((eOf a side : Int) + 4 * k) := by
  cases side <;> simp only [moverPos, eOf, sgn] <;> split_ifs <;> omega

private theorem cnt_spec (n e h : Nat) :
    cnt n e h ≤ n ∧ (cnt n e h < n → h < 3 * cnt n e h + e) ∧
      (0 < cnt n e h → 3 * cnt n e h + e ≤ h + 3) := by
  unfold cnt
  split_ifs <;> omega

private theorem cross_move (a : Int) (n : Nat) (side : Bool) (h : Nat)
    (hp : movers a n side h (brickMate ((h % 2 : Nat) : Int) (a + sgn side * cnt n (eOf a side) h))) :
    brickMate ((h % 2 : Nat) : Int) (a + sgn side * cnt n (eOf a side) h) =
      a + sgn side * cnt n (eOf a side) (h + 1) := by
  obtain ⟨k, hk, hv⟩ := hp
  have he := eOf_spec a side
  have c0 := cnt_spec n (eOf a side) h
  have c1 := cnt_spec n (eOf a side) (h + 1)
  rw [moverPos_eq] at hv
  generalize eOf a side = e at *
  generalize cnt n e h = m at *
  generalize cnt n e (h + 1) = m' at *
  cases side <;> simp only [sgn, par, brickMate] at hv he ⊢ <;> split_ifs at hv ⊢ <;> omega

private theorem cross_stay (a : Int) (n : Nat) (side : Bool) (h : Nat)
    (hp : ¬ movers a n side h (brickMate ((h % 2 : Nat) : Int) (a + sgn side * cnt n (eOf a side) h))) :
    a + sgn side * cnt n (eOf a side) h = a + sgn side * cnt n (eOf a side) (h + 1) := by
  by_contra hne
  apply hp
  refine ⟨cnt n (eOf a side) h, ?_, ?_⟩
  · have he := eOf_spec a side
    have c0 := cnt_spec n (eOf a side) h
    have c1 := cnt_spec n (eOf a side) (h + 1)
    generalize eOf a side = e at *
    generalize cnt n e h = m at *
    generalize cnt n e (h + 1) = m' at *
    cases side <;> simp only [sgn] at hne <;> omega
  · rw [moverPos_eq]
    have he := eOf_spec a side
    have c0 := cnt_spec n (eOf a side) h
    have c1 := cnt_spec n (eOf a side) (h + 1)
    generalize eOf a side = e at *
    generalize cnt n e h = m at *
    generalize cnt n e (h + 1) = m' at *
    cases side <;> simp only [sgn, par, brickMate] at hne he ⊢ <;> split_ifs <;> omega

private theorem reg_start (a : Int) (n : Nat) (side : Bool) :
    IsReg (registerStart a n side) (a + sgn side * cnt n (eOf a side) 0) (movers a n side 0) := by
  have h0 : cnt n (eOf a side) 0 = 0 := by
    have he := (eOf_spec a side).1
    unfold cnt
    split_ifs <;> omega
  have hne : ∀ k : Nat, moverPos a k side ≠ a := by
    intro k
    cases side <;> simp only [moverPos] <;> split_ifs <;> omega
  have hany : ∀ v, (List.range n).any (fun k => decide (v = moverPos a k side)) = true ↔
      ∃ k, k < n ∧ v = moverPos a k side := by
    intro v
    rw [List.any_eq_true]
    constructor
    · rintro ⟨k, hk, hk'⟩
      exact ⟨k, List.mem_range.mp hk, of_decide_eq_true hk'⟩
    · rintro ⟨k, hk, hk'⟩
      exact ⟨k, List.mem_range.mpr hk, decide_eq_true hk'⟩
  intro v
  rw [h0]
  have hmov : movers a n side 0 v ↔ ∃ k, k < n ∧ v = moverPos a k side := by
    unfold movers
    simp only [Nat.cast_zero, mul_zero, sub_zero]
  rw [hmov, ← hany]
  simp only [Nat.cast_zero, mul_zero, add_zero]
  by_cases hv : v = a
  · have e : registerStart a n side v = .neg := by simp only [registerStart, hv, ↓reduceIte]
    have hm : ¬ (List.range n).any (fun k => decide (v = moverPos a k side)) = true := by
      rw [hany]
      rintro ⟨k, -, hk⟩
      exact hne k (by rw [← hk]; exact hv)
    rw [e]
    exact ⟨iff_of_true rfl hv, iff_of_false (by decide) hm⟩
  · by_cases hm : (List.range n).any (fun k => decide (v = moverPos a k side)) = true
    · have e : registerStart a n side v = .pos := by simp only [registerStart, hv, hm, ↓reduceIte]
      rw [e]
      exact ⟨iff_of_false (by decide) hv, iff_of_true rfl hm⟩
    · have e : registerStart a n side v = .zero := by
        simp only [registerStart, hv, hm, Bool.false_eq_true, ↓reduceIte]
      rw [e]
      exact ⟨iff_of_false (by decide) hv, iff_of_false (by decide) hm⟩

private theorem reg_line (a : Int) (n : Nat) (side : Bool) (h : Nat) :
    IsReg (lineAt t5Rule (registerStart a n side) h) (a + sgn side * cnt n (eOf a side) h)
      (movers a n side h) := by
  induction h with
  | zero => exact reg_start a n side
  | succ h ih =>
    show IsReg ((half ((h % 2 : Nat) : Int)).step t5Rule (lineAt t5Rule (registerStart a n side) h)) _ _
    by_cases hp :
        movers a n side h (brickMate ((h % 2 : Nat) : Int) (a + sgn side * cnt n (eOf a side) h))
    · exact isReg_congr (thm_kleene_register_move t5_law (half _) _ _ _ ih hp) (cross_move a n side h hp)
        (movers_mate a n side h)
    · exact isReg_congr (thm_kleene_register_stay t5_law (half _) _ _ _ ih hp) (cross_stay a n side h hp)
        (movers_mate a n side h)

/-- A9, the T5 counter. In `id.CBA.swap` on the vacuum, for every register value `a : Int` and every number
    `n` of movers placed as `registerRun` places them, after `4 n + 8` rounds of the brick line the one `-1`
    sits at `a + n` when the movers came from the right (ADD) and at `a - n` when they came from the left
    (SUB), and every `+1` is on its free-flight track, two cells a round. -/
theorem thm_kleene_counter_add_sub (a : Int) (n : Nat) :
    (∀ v, ((round t5Rule brick)^[4 * n + 8] (registerStart a n true) v = .neg ↔ v = a + n) ∧
      ((round t5Rule brick)^[4 * n + 8] (registerStart a n true) v = .pos ↔
        ∃ k, k < n ∧ v = moverPos a k true - (8 * n + 16 : Nat))) ∧
    (∀ v, ((round t5Rule brick)^[4 * n + 8] (registerStart a n false) v = .neg ↔ v = a - n) ∧
      ((round t5Rule brick)^[4 * n + 8] (registerStart a n false) v = .pos ↔
        ∃ k, k < n ∧ v = moverPos a k false + (8 * n + 16 : Nat))) := by
  have hc : ∀ side, cnt n (eOf a side) (2 * (4 * n + 8)) = n := by
    intro side
    have he := (eOf_spec a side).1
    unfold cnt
    split_ifs <;> omega
  have hh : 2 * (4 * n + 8) = 8 * n + 16 := by omega
  rw [round_iter, round_iter, hh]
  have hR := reg_line a n true (8 * n + 16)
  have hL := reg_line a n false (8 * n + 16)
  rw [← hh, hc, hh] at hR hL
  have sR : a + sgn true * (n : Int) = a + n := by simp only [sgn, one_mul]
  have sL : a + sgn false * (n : Int) = a - n := by simp only [sgn]; omega
  rw [sR] at hR
  rw [sL] at hL
  constructor
  · intro v
    refine ⟨(hR v).1, (hR v).2.trans ?_⟩
    simp only [movers, sgn, one_mul]
  · intro v
    refine ⟨(hL v).1, (hL v).2.trans ?_⟩
    simp only [movers, sgn, neg_one_mul, sub_neg_eq_add]

/-- Bridge for `kleeneCounterCell` and `kleeneCounterRows`: the exported census index is `id.CBA.swap`, a T5
    cell on the vacuum with still `-1` and mover `+1` that adds from the right; and the code's `registerRun`
    gives `a + n` for ADD and `a - n` for SUB, movers free, on every case `a, n` in `0 .. 8`. -/
theorem gen_kleene_counter_eq :
    ruleName t5Rule = "id.CBA.swap" ∧
    Generated.kleeneCounterCell.2 = ("id.CBA.swap", 0, -1, 1, "T5", "right", "left") ∧
    Generated.kleeneCounterRows =
      (List.range 9).flatMap (fun (a : Nat) => (List.range 9).map
        (fun (n : Nat) => (a, n, (a : Int) + (n : Int), (a : Int) - (n : Int), true, true))) := by
  refine ⟨by decide +kernel, by decide +kernel, by decide +kernel⟩

/-- B5. On every one of the code's 162 counter cases (`a, n` in `0 .. 8`, ADD and SUB), the Lean round puts
    the one `-1` exactly at the code's register value. -/
theorem thm_kleene_counter_cases :
    ∀ r ∈ Generated.kleeneCounterRows, ∀ v,
      ((round t5Rule brick)^[4 * r.2.1 + 8] (registerStart r.1 r.2.1 true) v = .neg ↔ v = r.2.2.1) ∧
      ((round t5Rule brick)^[4 * r.2.1 + 8] (registerStart r.1 r.2.1 false) v = .neg ↔
        v = r.2.2.2.1) := by
  intro r hr v
  rw [gen_kleene_counter_eq.2.2, List.mem_flatMap] at hr
  obtain ⟨a, -, hr⟩ := hr
  rw [List.mem_map] at hr
  obtain ⟨n, -, rfl⟩ := hr
  exact ⟨((thm_kleene_counter_add_sub a n).1 v).1, ((thm_kleene_counter_add_sub a n).2 v).1⟩

end Kleene

end Compute

end Vibe
