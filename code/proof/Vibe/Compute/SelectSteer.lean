import Mathlib.Logic.Function.Iterate
import Vibe.Compute.SpeciesTransport

/-!
# Vibe Computation Lab: Select and Steer (level 6, Lemma P and Lemma X)

Claims I-a7 and I-a9. A **selection layout** holds A's content at cell
`aC`, B's at `bC`, and everything else is written by the evaluator from the two score levels
`i j : Fin L` alone (`bg i j`: any number of score cells, any codes, any constants). It
**selects** at read `v` after `n` rounds when, for both contents over two values and every strictly
ordered score pair, the read is the better candidate's content. A **steering layout** holds a
control `c`, data cells `P`, `Q` and constants; it **steers** when the read's behaviour over
`(P, Q)` changes with the control's value, both behaviours are a copy of `P`, a copy of `Q` or a
constant, and one is a copy (level6 slice 2).

1. **The pinning lemma** (`thm_select_no_selector_of_pinned`): on any vertex type and schedule, if
   a tone test `q` of the read after `n` rounds equals `q` of one start cell fixed by the schedule
   and `n` alone, and the two content values differ under `q`, no layout selects at any number
   `L ≥ 2` of levels.
2. **Per-class facts** (`thm_select_pinned_of_moved`, `thm_select_pinned_of_fixed`,
   `thm_select_fixed_cells`, `thm_select_t4_still`, `thm_select_t5_free_flight`): `T0` is the
   identity and `T3` the full swap on all nine pairs, so the whole read is one start cell's tone;
   in `T4` the static tone never moves (the read holds it exactly when the read cell did at the
   start); in `T5` the mover is in free flight (the read holds it exactly when the start cell
   `(fixedRoundPerm swap s)^[n] v` did).
3. **Lemma P** (`thm_select_pinned_cells`): in the 18 `T0`, `T3`, `T4`, `T5` cells no layout
   selects on any graph, schedule, round and number of levels or score cells, contents over the
   two excitations; in `T0` and `T3` not even over any two distinct tones.
4. **No steering in `T0` to `T3`** (`thm_steer_none_of_occ`, `thm_steer_none_blind_cells`): in a
   cell moved by occupancy the read is one fixed start cell on every input with the three role
   cells occupied, so no layout steers. **Presence** (`thm_steer_presence_blind_cells`): there a
   value never changes occupancy, and a presence-coded content is pinned, so it cannot be selected.
5. **The corrected sentence** (`thm_select_value_presence_t45`): in every `T4` and `T5` cell a
   value does change occupancy (one step on two cells).
6. **Lemma X** (`thm_select_steer_cells`): in each of the 24 species cells, either no layout steers
   (`T0` to `T3`) or no layout selects (`T0`, `T3`, `T4`, `T5`), on any graph; and the split is not
   vacuous (`thm_select_t1_t2_select`): every `T1` and every `T2` cell selects at two levels on a
   three-cell graph.

Statements are about the Lean definitions of L02 (`round`) and L03 (`prTable`, `cellType`), tied to
the code by L03's bridges; the selection and steering predicates are this file's reading of
level6's definitions (no generated table: the census code is a search, not a function). Zero
`sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

namespace SelectSteer

open Function
open RuleCensus

section Defs

variable {V : Type*} [DecidableEq V]

/-- The read after `n` rounds is pinned by the tone test `q`: for every read cell there is one start
    cell, fixed by the schedule and `n`, whose test the read's test equals on every start. -/
def PinnedBy (f : Pair → Pair) (s : Schedule V) (q : Tone → Bool) : Prop :=
  ∀ (n : Nat) (v : V), ∃ u : V, ∀ x : Config V, q ((round f s)^[n] x v) = q (x u)

/-- The start of a selection layout: contents at `aC` and `bC`, everything else written from the two
    score levels alone. -/
def selStart {L : Nat} (aC bC : V) (bg : Fin L → Fin L → Config V) (cA cB : Tone) (i j : Fin L) :
    Config V :=
  update (update (bg i j) aC cA) bC cB

/-- The layout selects at read `v` after `n` rounds: for contents over `t1`, `t2` and every
    strictly ordered score pair, the read is the content of the candidate with the larger score. -/
def Selects {L : Nat} (f : Pair → Pair) (s : Schedule V) (n : Nat) (v aC bC : V)
    (bg : Fin L → Fin L → Config V) (t1 t2 : Tone) : Prop :=
  ∀ cA ∈ [t1, t2], ∀ cB ∈ [t1, t2], ∀ i j : Fin L,
    (j < i → (round f s)^[n] (selStart aC bC bg cA cB i j) v = cA) ∧
    (i < j → (round f s)^[n] (selStart aC bC bg cA cB i j) v = cB)

/-- The start of a steering layout: control `c`, data `P` and `Q`, constants `k` elsewhere. -/
def steerStart (c P Q : V) (k : Config V) (cv p q : Tone) : Config V :=
  update (update (update k c cv) P p) Q q

/-- The read's behaviour over the data cells for control value `cv`. -/
def readOf (f : Pair → Pair) (s : Schedule V) (n : Nat) (v c P Q : V) (k : Config V) (cv : Tone) :
    Tone → Tone → Tone :=
  fun p q => (round f s)^[n] (steerStart c P Q k cv p q) v

end Defs

/-- A behaviour that copies `P` on the values `E`. -/
def IsCopyP (E : List Tone) (g : Tone → Tone → Tone) : Prop := ∀ p ∈ E, ∀ q ∈ E, g p q = p

/-- A behaviour that copies `Q` on the values `E`. -/
def IsCopyQ (E : List Tone) (g : Tone → Tone → Tone) : Prop := ∀ p ∈ E, ∀ q ∈ E, g p q = q

/-- A constant behaviour on the values `E`. -/
def IsConst (E : List Tone) (g : Tone → Tone → Tone) : Prop := ∃ c0, ∀ p ∈ E, ∀ q ∈ E, g p q = c0

/-- Level 6's steering, over data and control values `t1`, `t2`: the two behaviours differ, each is a
    copy of `P`, a copy of `Q` or a constant, and at least one is a copy. -/
def SteersBy (g1 g2 : Tone → Tone → Tone) (t1 t2 : Tone) : Prop :=
  (∃ p ∈ [t1, t2], ∃ q ∈ [t1, t2], g1 p q ≠ g2 p q) ∧
  (IsCopyP [t1, t2] g1 ∨ IsCopyQ [t1, t2] g1 ∨ IsConst [t1, t2] g1) ∧
  (IsCopyP [t1, t2] g2 ∨ IsCopyQ [t1, t2] g2 ∨ IsConst [t1, t2] g2) ∧
  (IsCopyP [t1, t2] g1 ∨ IsCopyQ [t1, t2] g1 ∨ IsCopyP [t1, t2] g2 ∨ IsCopyQ [t1, t2] g2)

section Defs2

variable {V : Type*} [DecidableEq V]

/-- The layout steers at read `v` after `n` rounds, control and data over `t1`, `t2`. -/
def Steers (f : Pair → Pair) (s : Schedule V) (n : Nat) (v c P Q : V) (k : Config V)
    (t1 t2 : Tone) : Prop :=
  SteersBy (readOf f s n v c P Q k t1) (readOf f s n v c P Q k t2) t1 t2

end Defs2

/-! ## The pinning lemma and the per-class pinning facts -/

section Pin

variable {V : Type*} [DecidableEq V]

private theorem selStart_a {L : Nat} (aC bC : V) (hab : aC ≠ bC) (bg : Fin L → Fin L → Config V)
    (cA cB : Tone) (i j : Fin L) : selStart aC bC bg cA cB i j aC = cA := by
  simp [selStart, hab]

private theorem selStart_b {L : Nat} (aC bC : V) (bg : Fin L → Fin L → Config V)
    (cA cB : Tone) (i j : Fin L) : selStart aC bC bg cA cB i j bC = cB := by
  simp [selStart]

private theorem selStart_off {L : Nat} (aC bC : V) (bg : Fin L → Fin L → Config V)
    (cA cB : Tone) (i j : Fin L) (u : V) (ha : u ≠ aC) (hb : u ≠ bC) :
    selStart aC bC bg cA cB i j u = bg i j u := by
  simp [selStart, ha, hb]

/-- **The pinning lemma (Lemma P's argument), any vertex type, schedule, round and levels.** If the
    read is pinned by a tone test `q` and the two content values differ under `q`, then no
    selection layout selects at any `L ≥ 2` levels, however the evaluator writes the scores. -/
theorem thm_select_no_selector_of_pinned (f : Pair → Pair) (s : Schedule V) (q : Tone → Bool)
    (hp : PinnedBy f s q) (t1 t2 : Tone) (hq : q t1 ≠ q t2) {L : Nat} (hL : 2 ≤ L) (n : Nat)
    (v aC bC : V) (hab : aC ≠ bC) (bg : Fin L → Fin L → Config V) :
    ¬ Selects f s n v aC bC bg t1 t2 := by
  intro hS
  obtain ⟨u, hu⟩ := hp n v
  let i1 : Fin L := ⟨1, by omega⟩
  let i0 : Fin L := ⟨0, by omega⟩
  have hlt : i0 < i1 := by simp [i0, i1, Fin.lt_def]
  have m1 : t1 ∈ [t1, t2] := by simp
  have m2 : t2 ∈ [t1, t2] := by simp
  -- A wins at (i1, i0)
  have h1 := (hS t1 m1 t2 m2 i1 i0).1 hlt
  have h2 := (hS t2 m2 t1 m1 i1 i0).1 hlt
  -- B wins at (i0, i1)
  have h3 := (hS t1 m1 t2 m2 i0 i1).2 hlt
  have e1 := hu (selStart aC bC bg t1 t2 i1 i0)
  have e2 := hu (selStart aC bC bg t2 t1 i1 i0)
  have e3 := hu (selStart aC bC bg t1 t2 i0 i1)
  rw [h1] at e1
  rw [h2] at e2
  rw [h3] at e3
  by_cases ha : u = aC
  · subst ha
    rw [selStart_a u bC hab] at e3
    exact hq e3.symm
  · by_cases hb : u = bC
    · subst hb
      rw [selStart_b] at e1
      exact hq e1
    · rw [selStart_off aC bC bg _ _ _ _ u ha hb] at e1 e2
      exact hq (e1.trans e2.symm)

/-- **Per-class fact, driven layer.** In a cell moved by a driving pattern `d` with a balanced table
    (the M6 lemma's hypotheses), the read is pinned by `d` itself: the driving tone at the read is
    the driving tone of the start cell `(fixedRoundPerm σ s)^[n] v`. -/
theorem thm_select_pinned_of_moved (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) : PinnedBy f s d :=
  fun n v => ⟨(fixedRoundPerm σ s)^[n] v,
    fun x => (thm_species_pull_back f d m σ hf hb s).2.1 x n v⟩

/-- **Per-class fact, fixed rule.** A rule that keeps every pair, or swaps every pair (`σ`), moves
    the whole state by one fixed bijection, so the read is pinned by every tone test. -/
theorem thm_select_pinned_of_fixed (f : Pair → Pair) (σ : Move)
    (hf : MovedBy f (fun _ => false) (fun _ _ => σ)) (s : Schedule V) (q : Tone → Bool) :
    PinnedBy f s q := by
  intro n v
  refine ⟨iterPullPerm (fun _ _ => σ) σ s n (fun _ => false) v, fun x => ?_⟩
  have h := (thm_species_pull_back f (fun _ => false) (fun _ _ => σ) σ hf ⟨rfl, rfl⟩ s).1 x n v
  rw [h]

end Pin

/-! ## The finite per-class facts over the 72 cells -/

private theorem movedByB_iff' (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move) :
    movedByB f d m = true ↔ MovedBy f d m := by
  unfold movedByB MovedBy
  simp only [List.all_eq_true, decide_eq_true_eq]
  exact ⟨fun h a c => h a (mem_tones a) c (mem_tones c), fun h a _ c _ => h a c⟩

private theorem class_facts_bool :
    ∀ c ∈ cells,
      (cellType (prTable c.1) c.2 = some .t0 →
        movedByB (prTable c.1) (fun _ => false) (fun _ _ => .keep) = true) ∧
      (cellType (prTable c.1) c.2 = some .t3 →
        movedByB (prTable c.1) (fun _ => false) (fun _ _ => .swap) = true) ∧
      (cellType (prTable c.1) c.2 = some .t4 ∨ cellType (prTable c.1) c.2 = some .t5 →
        drive (prTable c.1) c.2 (excitations c.2).1 ≠ drive (prTable c.1) c.2 (excitations c.2).2) := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

private theorem pinned_count :
    (cells.filter fun c =>
      decide (cellType (prTable c.1) c.2 ∈ [some .t0, some .t3, some .t4, some .t5])).length = 18 := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

private theorem exc_ne (b : Tone) : (excitations b).1 ≠ (excitations b).2 := by
  cases b <;> decide

private theorem exc_ne_b (b : Tone) : (excitations b).1 ≠ b ∧ (excitations b).2 ≠ b := by
  cases b <;> decide

private theorem species_of_type (c : Nat × Tone) (hc : c ∈ cells) (T : CellType)
    (h : cellType (prTable c.1) c.2 = some T) : cellKind (prTable c.1) c.2 = .species :=
  ((thm_rule_census_cells.2.2.2.2.1 c hc).2.2).2 (by rw [h]; rfl)

private theorem drive_t4 (f : Pair → Pair) (b : Tone) (h : cellType f b = some .t4) :
    drive f b = fun t => decide (t = staticOf f b) := by
  unfold drive
  rw [h]

private theorem drive_t5 (f : Pair → Pair) (b : Tone) (h : cellType f b = some .t5) :
    drive f b = fun t => decide (t = moverOf f b) := by
  unfold drive
  rw [h]

/-- **Per-class facts, `T0` and `T3`.** Every `T0` cell's rule keeps all nine pairs (it is the
    identity) and every `T3` cell's rule swaps all nine (the full swap), so on any graph and schedule
    the read after `n` rounds is one fixed start cell's tone; hence neither selects over any two
    distinct tones, presence and absence included. -/
theorem thm_select_fixed_cells {V : Type*} [DecidableEq V] :
    ∀ c ∈ cells,
      (cellType (prTable c.1) c.2 = some .t0 → ∀ a e : Tone, prTable c.1 (a, e) = (a, e)) ∧
      (cellType (prTable c.1) c.2 = some .t3 → ∀ a e : Tone, prTable c.1 (a, e) = (e, a)) ∧
      (cellType (prTable c.1) c.2 ∈ [some .t0, some .t3] →
        ∀ (s : Schedule V) (n : Nat) (v : V), ∃ u : V, ∀ x : Config V,
          (round (prTable c.1) s)^[n] x v = x u) ∧
      (cellType (prTable c.1) c.2 ∈ [some .t0, some .t3] →
        ∀ (t1 t2 : Tone), t1 ≠ t2 → ∀ {L : Nat} (s : Schedule V) (n : Nat) (v aC bC : V)
          (bg : Fin L → Fin L → Config V), 2 ≤ L → aC ≠ bC →
          ¬ Selects (prTable c.1) s n v aC bC bg t1 t2) := by
  intro c hc
  obtain ⟨h0, h3, _⟩ := class_facts_bool c hc
  have fixed : cellType (prTable c.1) c.2 ∈ [some .t0, some .t3] →
      ∃ σ, MovedBy (prTable c.1) (fun _ => false) (fun _ _ => σ) := by
    intro h
    simp only [List.mem_cons, List.not_mem_nil, or_false] at h
    rcases h with h | h
    · exact ⟨_, (movedByB_iff' _ _ _).1 (h0 h)⟩
    · exact ⟨_, (movedByB_iff' _ _ _).1 (h3 h)⟩
  refine ⟨fun h a e => (movedByB_iff' _ _ _).1 (h0 h) a e,
    fun h a e => (movedByB_iff' _ _ _).1 (h3 h) a e, ?_, ?_⟩
  · intro h s n v
    obtain ⟨σ, hm⟩ := fixed h
    refine ⟨iterPullPerm (fun _ _ => σ) σ s n (fun _ => false) v, fun x => ?_⟩
    have hh := (thm_species_pull_back _ (fun _ => false) (fun _ _ => σ) σ hm ⟨rfl, rfl⟩ s).1 x n v
    rw [hh]
  · intro h t1 t2 ht L s n v aC bC bg hL hab
    obtain ⟨σ, hm⟩ := fixed h
    refine thm_select_no_selector_of_pinned _ s (fun t => decide (t = t1))
      (thm_select_pinned_of_fixed _ σ hm s _) t1 t2 ?_ hL n v aC bC hab bg
    simp [ht.symm]

/-- **Per-class fact, `T4`: a still tone never moves.** In every `T4` cell, on any graph, schedule
    and start, the read after `n` rounds holds the static excitation exactly when the read cell held
    it at the start. -/
theorem thm_select_t4_still {V : Type*} [DecidableEq V] (c : Nat × Tone) (hc : c ∈ cells)
    (h4 : cellType (prTable c.1) c.2 = some .t4) (s : Schedule V) (x : Config V) (n : Nat) (v : V) :
    (round (prTable c.1) s)^[n] x v = staticOf (prTable c.1) c.2 ↔
      x v = staticOf (prTable c.1) c.2 := by
  obtain ⟨σ, hm, hb, hσ⟩ := thm_species_transport_cells.1 c hc (species_of_type c hc _ h4)
  have hk : σ = .keep := hσ.2 (by rw [h4]; simp)
  have hfix := (thm_species_transport _ _ _ σ hm hb s).2.2.1 hk
  have hl := (thm_species_pull_back _ _ _ σ hm hb s).2.1 x n v
  rw [iterate_fixed (hfix v) n, drive_t4 _ _ h4] at hl
  simpa only [decide_eq_decide] using hl

/-- **Per-class fact, `T5`: free flight.** In every `T5` cell, on any graph, schedule and start, the
    read after `n` rounds holds the mover exactly when the start cell
    `(fixedRoundPerm swap s)^[n] v` held it: the mover layer moves by the full swap's fixed
    bijection, whatever else is on the graph. -/
theorem thm_select_t5_free_flight {V : Type*} [DecidableEq V] (c : Nat × Tone) (hc : c ∈ cells)
    (h5 : cellType (prTable c.1) c.2 = some .t5) (s : Schedule V) (x : Config V) (n : Nat) (v : V) :
    (round (prTable c.1) s)^[n] x v = moverOf (prTable c.1) c.2 ↔
      x ((fixedRoundPerm .swap s)^[n] v) = moverOf (prTable c.1) c.2 := by
  obtain ⟨σ, hm, hb, hσ⟩ := thm_species_transport_cells.1 c hc (species_of_type c hc _ h5)
  have hs : σ = .swap := by
    cases σ with
    | keep => have := hσ.1 rfl; rw [h5] at this; simp at this
    | swap => rfl
  subst hs
  have hl := (thm_species_pull_back _ _ _ .swap hm hb s).2.1 x n v
  rw [drive_t5 _ _ h5] at hl
  simpa only [decide_eq_decide] using hl

section PinCells

variable {V : Type*} [DecidableEq V]

private theorem pinned_cell (c : Nat × Tone) (hc : c ∈ cells)
    (h : cellType (prTable c.1) c.2 ∈ [some .t0, some .t3, some .t4, some .t5]) (s : Schedule V) :
    ∃ q : Tone → Bool, PinnedBy (prTable c.1) s q ∧ q (excitations c.2).1 ≠ q (excitations c.2).2 := by
  obtain ⟨h0, h3, h45⟩ := class_facts_bool c hc
  have hne := exc_ne c.2
  simp only [List.mem_cons, List.not_mem_nil, or_false] at h
  rcases h with h | h | h | h
  · exact ⟨fun t => decide (t = (excitations c.2).1),
      thm_select_pinned_of_fixed _ .keep ((movedByB_iff' _ _ _).1 (h0 h)) s _, by simp [hne.symm]⟩
  · exact ⟨fun t => decide (t = (excitations c.2).1),
      thm_select_pinned_of_fixed _ .swap ((movedByB_iff' _ _ _).1 (h3 h)) s _, by simp [hne.symm]⟩
  · obtain ⟨σ, hm, hb, _⟩ := thm_species_transport_cells.1 c hc (species_of_type c hc _ h)
    exact ⟨_, thm_select_pinned_of_moved _ _ _ σ hm hb s, h45 (Or.inl h)⟩
  · obtain ⟨σ, hm, hb, _⟩ := thm_species_transport_cells.1 c hc (species_of_type c hc _ h)
    exact ⟨_, thm_select_pinned_of_moved _ _ _ σ hm hb s, h45 (Or.inr h)⟩

/-- **Lemma P (level 6), on any graph, schedule, round, number of levels and number of score
    cells.** Exactly 18 of the 72 cells have type `T0`, `T3`, `T4` or `T5`, and in each of them no
    selection layout selects with contents over the two excitations: the read is pinned to one start
    cell (`T0`, `T3` wholly, `T4` by the still tone, `T5` by the mover in free flight). -/
theorem thm_select_pinned_cells :
    (cells.filter fun c =>
      decide (cellType (prTable c.1) c.2 ∈ [some .t0, some .t3, some .t4, some .t5])).length = 18 ∧
    ∀ c ∈ cells, cellType (prTable c.1) c.2 ∈ [some .t0, some .t3, some .t4, some .t5] →
      ∀ {L : Nat} (s : Schedule V) (n : Nat) (v aC bC : V) (bg : Fin L → Fin L → Config V),
        2 ≤ L → aC ≠ bC →
        ¬ Selects (prTable c.1) s n v aC bC bg (excitations c.2).1 (excitations c.2).2 := by
  refine ⟨pinned_count, ?_⟩
  intro c hc h L s n v aC bC bg hL hab
  obtain ⟨q, hp, hq⟩ := pinned_cell c hc h s
  exact thm_select_no_selector_of_pinned _ s q hp _ _ hq hL n v aC bC hab bg

end PinCells

/-! ## No steering where occupancy drives -/

section Steer

variable {V : Type*} [DecidableEq V]

private theorem steer_c (c P Q : V) (hcP : c ≠ P) (hcQ : c ≠ Q) (k : Config V) (cv p q : Tone) :
    steerStart c P Q k cv p q c = cv := by
  simp [steerStart, hcP, hcQ]

private theorem steer_P (c P Q : V) (hPQ : P ≠ Q) (k : Config V) (cv p q : Tone) :
    steerStart c P Q k cv p q P = p := by
  simp [steerStart, hPQ]

private theorem steer_Q (c P Q : V) (k : Config V) (cv p q : Tone) :
    steerStart c P Q k cv p q Q = q := by
  simp [steerStart]

/-- **No steering in a cell moved by occupancy, any graph, schedule and round.** If the rule is moved
    by occupancy over background `b` with a balanced table, then with control and data over the two
    excitations every input has the same occupancy, so the read is one fixed start cell: a constant
    (the control's value, or a constant cell) or a copy of one data cell, the same for both control
    values unless it is the control itself, which gives two constants and no copy. -/
theorem thm_steer_none_of_occ (f : Pair → Pair) (b : Tone) (m : Bool → Bool → Move) (σ : Move)
    (hf : MovedBy f (occ b) m) (hb : Balanced m σ) (s : Schedule V) (n : Nat) (v c P Q : V)
    (k : Config V) (hcP : c ≠ P) (hcQ : c ≠ Q) (hPQ : P ≠ Q) :
    ¬ Steers f s n v c P Q k (excitations b).1 (excitations b).2 := by
  intro hS
  obtain ⟨hdiff, _, _, hcopy⟩ := hS
  set e1 := (excitations b).1 with he1
  set e2 := (excitations b).2 with he2
  have hne : e1 ≠ e2 := exc_ne b
  obtain ⟨hb1, hb2⟩ := exc_ne_b b
  have hocc : ∀ t ∈ [e1, e2], occ b t = true := by
    intro t ht
    simp only [List.mem_cons, List.not_mem_nil, or_false] at ht
    rcases ht with rfl | rfl
    · exact decide_eq_true hb1
    · exact decide_eq_true hb2
  let D : V → Bool := update (update (update (fun w => occ b (k w)) c true) P true) Q true
  have hD : ∀ cv ∈ [e1, e2], ∀ p ∈ [e1, e2], ∀ q ∈ [e1, e2],
      (fun w => occ b (steerStart c P Q k cv p q w)) = D := by
    intro cv hcv p hp q hq
    funext w
    by_cases hwQ : w = Q
    · subst hwQ; simp [D, steerStart, hocc q hq]
    · by_cases hwP : w = P
      · subst hwP; simp [D, steerStart, hwQ, hocc p hp]
      · by_cases hwc : w = c
        · subst hwc; simp [D, steerStart, hwQ, hwP, hocc cv hcv]
        · simp [D, steerStart, hwQ, hwP, hwc]
  obtain ⟨u, hu⟩ := thm_species_output_copy f (occ b) m σ hf hb s {c, P, Q} k D n v
  have hk : ∀ cv p q, ∀ w, w ∉ ({c, P, Q} : Set V) → steerStart c P Q k cv p q w = k w := by
    intro cv p q w hw
    simp only [Set.mem_insert_iff, Set.mem_singleton_iff, not_or] at hw
    simp [steerStart, hw.1, hw.2.1, hw.2.2]
  have hread : ∀ cv ∈ [e1, e2], ∀ p ∈ [e1, e2], ∀ q ∈ [e1, e2],
      readOf f s n v c P Q k cv p q = steerStart c P Q k cv p q u ∧
        (u ∉ ({c, P, Q} : Set V) → readOf f s n v c P Q k cv p q = k u) :=
    fun cv hcv p hp q hq => hu _ (hk cv p q) (hD cv hcv p hp q hq)
  have m1 : e1 ∈ [e1, e2] := by simp
  have m2 : e2 ∈ [e1, e2] := by simp
  obtain ⟨p, hp, q, hq, hpq⟩ := hdiff
  by_cases huQ : u = Q
  · subst huQ
    apply hpq
    rw [(hread e1 m1 p hp q hq).1, (hread e2 m2 p hp q hq).1, steer_Q, steer_Q]
  · by_cases huP : u = P
    · subst huP
      apply hpq
      rw [(hread e1 m1 p hp q hq).1, (hread e2 m2 p hp q hq).1, steer_P c u Q hPQ,
        steer_P c u Q hPQ]
    · by_cases huc : u = c
      · subst huc
        -- both behaviours are constants (e1 and e2), so neither is a copy
        have g1 : ∀ p ∈ [e1, e2], ∀ q ∈ [e1, e2], readOf f s n v u P Q k e1 p q = e1 :=
          fun p hp q hq => by rw [(hread e1 m1 p hp q hq).1, steer_c u P Q hcP hcQ]
        have g2 : ∀ p ∈ [e1, e2], ∀ q ∈ [e1, e2], readOf f s n v u P Q k e2 p q = e2 :=
          fun p hp q hq => by rw [(hread e2 m2 p hp q hq).1, steer_c u P Q hcP hcQ]
        rcases hcopy with h | h | h | h
        · exact hne ((g1 e2 m2 e1 m1).symm.trans (h e2 m2 e1 m1)) |>.elim
        · exact hne ((g1 e1 m1 e2 m2).symm.trans (h e1 m1 e2 m2)) |>.elim
        · exact hne ((h e1 m1 e2 m2).symm.trans (g2 e1 m1 e2 m2)) |>.elim
        · exact hne ((h e2 m2 e1 m1).symm.trans (g2 e2 m2 e1 m1)) |>.elim
      · have hnot : u ∉ ({c, P, Q} : Set V) := by
          simp only [Set.mem_insert_iff, Set.mem_singleton_iff, not_or]
          exact ⟨huc, huP, huQ⟩
        exact hpq (((hread e1 m1 p hp q hq).2 hnot).trans ((hread e2 m2 p hp q hq).2 hnot).symm)

private theorem occ_moved (c : Nat × Tone) (hc : c ∈ cells)
    (h : cellType (prTable c.1) c.2 ∈ [some .t0, some .t1, some .t2, some .t3]) :
    ∃ (m : Bool → Bool → Move) (σ : Move), MovedBy (prTable c.1) (occ c.2) m ∧ Balanced m σ :=
  thm_species_blind_cells c hc ((thm_rule_census_blind.1 c hc).2 h)

/-- **No steering in `T0` to `T3`, any graph, schedule and round.** In each of the 12
    occupancy-blind species cells no steering layout steers, control and data over the two
    excitations. -/
theorem thm_steer_none_blind_cells :
    ∀ c ∈ cells, cellType (prTable c.1) c.2 ∈ [some .t0, some .t1, some .t2, some .t3] →
      ∀ (s : Schedule V) (n : Nat) (v cc P Q : V) (k : Config V), cc ≠ P → cc ≠ Q → P ≠ Q →
        ¬ Steers (prTable c.1) s n v cc P Q k (excitations c.2).1 (excitations c.2).2 := by
  intro c hc h s n v cc P Q k hcP hcQ hPQ
  obtain ⟨m, σ, hm, hb⟩ := occ_moved c hc h
  exact thm_steer_none_of_occ _ c.2 m σ hm hb s n v cc P Q k hcP hcQ hPQ

/-- **Presence in `T0` to `T3`, any graph and schedule.** In each occupancy-blind species cell:
    (1) the read's occupancy is one fixed start cell's occupancy; (2) a value never changes
    occupancy: two starts with one occupancy layer have one occupancy layer after every number of
    rounds, so no layout turns a value into presence; (3) a content written as presence (the
    background or an excitation `t`) cannot be selected at any `L ≥ 2` levels. -/
theorem thm_steer_presence_blind_cells :
    ∀ c ∈ cells, cellType (prTable c.1) c.2 ∈ [some .t0, some .t1, some .t2, some .t3] →
      (∀ s : Schedule V, PinnedBy (prTable c.1) s (occ c.2)) ∧
      (∀ (s : Schedule V) (x y : Config V),
        (fun w => occ c.2 (x w)) = (fun w => occ c.2 (y w)) → ∀ n : Nat,
          (fun w => occ c.2 ((round (prTable c.1) s)^[n] x w)) =
            fun w => occ c.2 ((round (prTable c.1) s)^[n] y w)) ∧
      (∀ t : Tone, t ≠ c.2 → ∀ {L : Nat} (s : Schedule V) (n : Nat) (v aC bC : V)
        (bg : Fin L → Fin L → Config V), 2 ≤ L → aC ≠ bC →
        ¬ Selects (prTable c.1) s n v aC bC bg c.2 t) := by
  intro c hc h
  obtain ⟨m, σ, hm, hb⟩ := occ_moved c hc h
  refine ⟨fun s => thm_select_pinned_of_moved _ _ m σ hm hb s,
    fun s x y hxy n => (thm_species_transport _ _ m σ hm hb s).2.2.2.2 x y hxy n, ?_⟩
  intro t ht L s n v aC bC bg hL hab
  refine thm_select_no_selector_of_pinned _ s (occ c.2) (thm_select_pinned_of_moved _ _ m σ hm hb s)
    c.2 t ?_ hL n v aC bC hab bg
  simp [occ, ht]

end Steer

/-! ## Finite witnesses on three cells -/

/-- The matching on three cells that pairs `i` and `j` (lead `i`). -/
def pairOn3 (i j : Fin 3) (hij : i ≠ j) : Matching (Fin 3) where
  mate v := if v = i then j else if v = j then i else v
  mate_mate v := by
    by_cases hi : v = i
    · subst hi; simp [hij.symm]
    · by_cases hj : v = j
      · subst hj; simp [hij.symm]
      · simp [hi, hj]
  lead v := decide (v = i)
  lead_mate v h := by
    by_cases hi : v = i
    · subst hi; simp [hij.symm]
    · by_cases hj : v = j
      · subst hj; simp [hij.symm]
      · simp [hi, hj] at h

/-- The evaluator's write for the three-cell witness: A's score cell `2` holds the first excitation
    at level 1 and the background at level 0; B's score is not written (L = 2). -/
def witnessBg (b : Tone) : Fin 2 → Fin 2 → Config (Fin 3) :=
  fun i _ w => if w = 2 ∧ i = 1 then (excitations b).1 else b

/-- **The split is not vacuous: `T1` and `T2` select.** Every `T1` cell selects at two levels on three
    cells (contents at `0` and `1`, A's score at `2`), with the round `[0-2, 1-2]` and the read at
    cell `1` after one round; every `T2` cell with the round `[0-2, 0-1]` and the read at cell `0`.
    (Level 6's line census found three levels in `T1` and two in `T2`; this witness shows only that
    selection exists in both classes.) -/
theorem thm_select_t1_t2_select :
    ∀ c ∈ cells,
      (cellType (prTable c.1) c.2 = some .t1 →
        Selects (prTable c.1) [pairOn3 0 2 (by decide), pairOn3 1 2 (by decide)] 1 1 0 1
          (witnessBg c.2) (excitations c.2).1 (excitations c.2).2) ∧
      (cellType (prTable c.1) c.2 = some .t2 →
        Selects (prTable c.1) [pairOn3 0 2 (by decide), pairOn3 0 1 (by decide)] 1 0 0 1
          (witnessBg c.2) (excitations c.2).1 (excitations c.2).2) := by
  unfold cells Selects selStart
  rw [pr_rule_codes_eq]
  decide +kernel

/-- **The corrected sentence: `T4` and `T5` turn a value into presence.** In every `T4` and `T5`
    cell, one step on the pair `0-1` from an excitation at `0` beside the background leaves cell `1`
    occupied for one excitation and empty for the other. -/
theorem thm_select_value_presence_t45 :
    ∀ c ∈ cells, cellType (prTable c.1) c.2 = some .t4 ∨ cellType (prTable c.1) c.2 = some .t5 →
      occ c.2 (round (prTable c.1) [pairOn3 0 1 (by decide)]
          (update (fun _ => c.2) 0 (excitations c.2).1) 1) ≠
        occ c.2 (round (prTable c.1) [pairOn3 0 1 (by decide)]
          (update (fun _ => c.2) 0 (excitations c.2).2) 1) := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

/-! ## Lemma X -/

section LemmaX

variable {V : Type*} [DecidableEq V]

/-- **Lemma X (level 6): select or steer, never both, in the 24 species cells, any graph and
    schedule.** For every species cell: in `T0` to `T3` no layout steers (control and data over the
    two excitations); in `T0`, `T3`, `T4` and `T5` no layout selects (contents over the two
    excitations, any `L ≥ 2` levels, any score cells); so every species cell has no steering layout
    or no selecting layout. With `thm_select_t1_t2_select` and `thm_select_value_presence_t45`:
    `T0` and `T3` do neither, `T1` and `T2` select only, `T4` and `T5` never select. -/
theorem thm_select_steer_cells :
    ∀ c ∈ cells, cellKind (prTable c.1) c.2 = .species →
      (cellType (prTable c.1) c.2 ∈ [some .t0, some .t1, some .t2, some .t3] →
        ∀ (s : Schedule V) (n : Nat) (v cc P Q : V) (k : Config V), cc ≠ P → cc ≠ Q → P ≠ Q →
          ¬ Steers (prTable c.1) s n v cc P Q k (excitations c.2).1 (excitations c.2).2) ∧
      (cellType (prTable c.1) c.2 ∈ [some .t0, some .t3, some .t4, some .t5] →
        ∀ {L : Nat} (s : Schedule V) (n : Nat) (v aC bC : V) (bg : Fin L → Fin L → Config V),
          2 ≤ L → aC ≠ bC →
          ¬ Selects (prTable c.1) s n v aC bC bg (excitations c.2).1 (excitations c.2).2) ∧
      ((∀ (s : Schedule V) (n : Nat) (v cc P Q : V) (k : Config V), cc ≠ P → cc ≠ Q → P ≠ Q →
          ¬ Steers (prTable c.1) s n v cc P Q k (excitations c.2).1 (excitations c.2).2) ∨
        (∀ {L : Nat} (s : Schedule V) (n : Nat) (v aC bC : V) (bg : Fin L → Fin L → Config V),
          2 ≤ L → aC ≠ bC →
          ¬ Selects (prTable c.1) s n v aC bC bg (excitations c.2).1 (excitations c.2).2)) := by
  intro c hc hs
  have hst := thm_steer_none_blind_cells (V := V) c hc
  have hse := (thm_select_pinned_cells (V := V)).2 c hc
  refine ⟨hst, hse, ?_⟩
  have hsome := ((thm_rule_census_cells.2.2.2.2.1 c hc).2.2).1 hs
  cases hT : cellType (prTable c.1) c.2 with
  | none => rw [hT] at hsome; simp at hsome
  | some T =>
    cases T with
    | t0 => exact Or.inl (hst (by simp [hT]))
    | t1 => exact Or.inl (hst (by simp [hT]))
    | t2 => exact Or.inl (hst (by simp [hT]))
    | t3 => exact Or.inl (hst (by simp [hT]))
    | t4 => exact Or.inr (fun {L} => hse (by simp [hT]))
    | t5 => exact Or.inr (fun {L} => hse (by simp [hT]))

end LemmaX

end SelectSteer

end Compute

end Vibe
