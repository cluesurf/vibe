import Mathlib.Logic.Equiv.Defs
import Mathlib.Logic.Function.Iterate
import Vibe.Compute.SpeciesTransport
import Vibe.Compute.Charge

/-!
# Vibe Computation Lab: Mesh No-Gos of Levels 4, 5 and 8

Claims I-a2, I-a3, I-a5 and I-a17. Every result is a corollary of
the species transport lemma (`Vibe.Compute.SpeciesTransport`, L04) and, for counts, of
`Vibe.Compute.Charge` (L05). Everything holds on any vertex type `V` (any graph, finite or not),
any schedule of matchings and any number of rounds.

1. **L4-NoFeedback (I-a2)** (`thm_nogo_layer_transport`, `thm_nogo_feedback_cells`): in a cell
   moved by a driving pattern `d`, the driving layer of an output cell `v` after `n` rounds is the
   start's driving layer at the one cell `(fixedRoundPerm σ s)^[n] v`, fixed by the schedule
   alone (never by the layout, the rule's tones or the inputs). In the 12 occupancy-blind cells
   (`d = occ b`) the occupancy of a laid-out output is therefore the occupancy of one input, or a
   constant of the layout.
2. **L4-WriteImpossible (I-a3)** (`thm_nogo_transport_test`, `thm_nogo_write_impossible`): for
   any two input cells, each fed one tone off the driving pattern or one tone on it, the output's
   driving bit as a function of the two input bits is a constant or one input's bit (the
   transport test). In the 12 occupancy-blind cells, so no layout has output occupancy
   `x and not s` (the 0/1 expand gate), `x and g` (the gated register write `g ? x : 0`) or
   `x or s` (the merge write `s ? s : x`).
3. **The level-5 no-go in the species cells (I-a5)** (`thm_nogo_species_cells`): in each of the 24
   species cells the driving layer stands still in `T0`, `T1`, `T4` (a `T4` structure, the static
   layer, is never rewritten by any stream), and in `T2`, `T3`, `T5` it moves exactly as under the
   full swap whatever the other tones are (a `T5` mover flies free whatever any structure did);
   and the driving layer's future depends on the start's driving layer alone. So in no species
   cell is a structure both rewritten and read by a later mover.
4. **C5's species part (I-a17)** (`thm_nogo_no_hereditary`, `thm_nogo_hereditary_cells`): in the
   24 species cells every excitation count is conserved (the number of devices never grows), and
   no point mutation is carried into two copies at distinct cells: the mark of a mutation lands
   on exactly one cell (M10 P2, via `thm_species_point_mutation`).

The reactive-cell parts of level 5 and C5 are bounded absences and stay experiments (decision
008). Mathlib (`Equiv.Perm`, `Function.iterate`), zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Function
open RuleCensus

/-- A function of two bits that is a constant or one of its arguments is none of `p and not q`,
    `p and q`, `p or q`. -/
private theorem nogo_bool_facts (g : Bool → Bool → Bool)
    (h : (∃ e : Bool, ∀ p q, g p q = e) ∨ (∀ p q, g p q = p) ∨ (∀ p q, g p q = q)) :
    ¬ (∀ p q, g p q = (p && !q)) ∧ ¬ (∀ p q, g p q = (p && q)) ∧
      ¬ (∀ p q, g p q = (p || q)) := by
  rcases h with ⟨e, he⟩ | he | he
  · refine ⟨fun h => ?_, fun h => ?_, fun h => ?_⟩
    · have h1 := h true false
      have h2 := h false false
      rw [he] at h1 h2
      simp_all
    · have h1 := h true true
      have h2 := h false false
      rw [he] at h1 h2
      simp_all
    · have h1 := h true true
      have h2 := h false false
      rw [he] at h1 h2
      simp_all
  · refine ⟨fun h => ?_, fun h => ?_, fun h => ?_⟩
    · have h1 := h true true
      rw [he] at h1
      simp at h1
    · have h1 := h true false
      rw [he] at h1
      simp at h1
    · have h1 := h false true
      rw [he] at h1
      simp at h1
  · refine ⟨fun h => ?_, fun h => ?_, fun h => ?_⟩
    · have h1 := h true false
      rw [he] at h1
      simp at h1
    · have h1 := h false true
      rw [he] at h1
      simp at h1
    · have h1 := h true false
      rw [he] at h1
      simp at h1

/-- A rule moved by any driving pattern keeps or swaps every pair. -/
private theorem nogo_keepOrSwap (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (hf : MovedBy f d m) : KeepOrSwap f := by
  intro p
  rcases p with ⟨a, c⟩
  rw [hf]
  cases m (d a) (d c) <;> simp [applyMove, prSwap]

section General

variable {V : Type*} [DecidableEq V]

/-- The start of a two-input layout: the constants `k`, input cell `i` fed `a1` when its bit `p`
    is set and `a0` when not, input cell `j` fed `c1` or `c0` by its bit `q`. -/
def gateStart (k : Config V) (i j : V) (a0 a1 c0 c1 : Tone) (p q : Bool) : Config V :=
  update (update k i (if p then a1 else a0)) j (if q then c1 else c0)

/-- The driving bit `d` read at output cell `v` after `n` rounds of the layout `gateStart`. -/
def gateLayer (f : Pair → Pair) (d : Tone → Bool) (s : Schedule V) (n : Nat) (k : Config V)
    (i j : V) (a0 a1 c0 c1 : Tone) (v : V) (p q : Bool) : Bool :=
  d ((round f s)^[n] (gateStart k i j a0 a1 c0 c1 p q) v)

/-- **I-a2, L4-NoFeedback, for any moved rule.** Under the hypotheses of `thm_species_transport`
    (the rule `f` is moved by the driving pattern `d` with a balanced table), on any vertex type and
    schedule: the driving bit of output cell `v` after `n` rounds is the start's driving bit at the
    one cell `u = (fixedRoundPerm σ s)^[n] v`, which depends on the schedule, `σ`, `n` and `v` only;
    so for any layout (input cells `I`, constants `k` elsewhere) the output's driving bit is the
    input `u`'s when `u ∈ I`, and the constant `d (k u)` of the layout when `u ∉ I`. -/
theorem thm_nogo_layer_transport (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) (n : Nat) (v : V) :
    (∀ x : Config V, d ((round f s)^[n] x v) = d (x ((fixedRoundPerm σ s)^[n] v))) ∧
    ∀ (I : Set V) (k : Config V), (fixedRoundPerm σ s)^[n] v ∉ I →
      ∀ x : Config V, (∀ w, w ∉ I → x w = k w) →
        d ((round f s)^[n] x v) = d (k ((fixedRoundPerm σ s)^[n] v)) := by
  have h := fun x => (thm_species_pull_back f d m σ hf hb s).2.1 x n v
  refine ⟨h, fun I k hu x hx => ?_⟩
  rw [h x, hx _ hu]

/-- **I-a3, the transport test, for any moved rule.** Under the hypotheses of
    `thm_species_transport`, take any layout `k`, any input cells `i`, `j`, tones `a0`, `c0` off the
    driving pattern and `a1`, `c1` on it, any output cell `v` and round `n`. The output's driving
    bit, as a function of the two input bits, is a constant, or input `i`'s bit, or input `j`'s
    bit. -/
theorem thm_nogo_transport_test (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) (n : Nat)
    (k : Config V) (i j : V) (a0 a1 c0 c1 : Tone) (ha0 : d a0 = false) (ha1 : d a1 = true)
    (hc0 : d c0 = false) (hc1 : d c1 = true) (v : V) :
    (∃ e : Bool, ∀ p q, gateLayer f d s n k i j a0 a1 c0 c1 v p q = e) ∨
    (∀ p q, gateLayer f d s n k i j a0 a1 c0 c1 v p q = p) ∨
    (∀ p q, gateLayer f d s n k i j a0 a1 c0 c1 v p q = q) := by
  have key : ∀ p q, gateLayer f d s n k i j a0 a1 c0 c1 v p q =
      d (gateStart k i j a0 a1 c0 c1 p q ((fixedRoundPerm σ s)^[n] v)) :=
    fun p q => (thm_species_pull_back f d m σ hf hb s).2.1 _ n v
  by_cases hj : (fixedRoundPerm σ s)^[n] v = j
  · right; right
    intro p q
    rw [key, hj]
    unfold gateStart
    rw [update_self]
    cases q <;> simp [hc0, hc1]
  · by_cases hi : (fixedRoundPerm σ s)^[n] v = i
    · right; left
      intro p q
      rw [key]
      unfold gateStart
      rw [update_of_ne hj, hi, update_self]
      cases p <;> simp [ha0, ha1]
    · left
      refine ⟨d (k ((fixedRoundPerm σ s)^[n] v)), fun p q => ?_⟩
      rw [key]
      unfold gateStart
      rw [update_of_ne hj, update_of_ne hi]

/-- **I-a17, M10 P2 as a no-heredity statement, for any moved rule.** Under the hypotheses of
    `thm_species_transport`, let `y` be a point mutation of `x` at cell `c`. Suppose that after `n`
    rounds both runs hold a copy of a structure at two places `e₁`, `e₂` whose images of the
    structure's cell `p` are distinct, the `x` run showing tone `S p` there and the `y` run tone
    `S' p` (the offspring carry a mark `S p ≠ S' p`, which changes the driving bit whenever the
    mutation did). That is impossible: the mark lands on exactly one cell. -/
theorem thm_nogo_no_hereditary (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) (x y : Config V) (c : V)
    (hc : x c ≠ y c) (hoff : ∀ w, w ≠ c → x w = y w) (n : Nat) (S S' : Config V) (p : V)
    (hS : S p ≠ S' p) (hD : d (x c) ≠ d (y c) → d (S p) ≠ d (S' p)) (e₁ e₂ : V → V)
    (he : e₁ p ≠ e₂ p) (h₁ : (round f s)^[n] x (e₁ p) = S p)
    (h₁' : (round f s)^[n] y (e₁ p) = S' p) (h₂ : (round f s)^[n] x (e₂ p) = S p)
    (h₂' : (round f s)^[n] y (e₂ p) = S' p) : False := by
  have hm := thm_species_point_mutation f d m σ hf hb s x y c hc hoff n
  by_cases hd : d (x c) = d (y c)
  · obtain ⟨u, _, hu⟩ := hm.2.1 hd
    have k1 := (hu (e₁ p)).1 (by rw [h₁, h₁']; exact hS)
    have k2 := (hu (e₂ p)).1 (by rw [h₂, h₂']; exact hS)
    exact he (k1.trans k2.symm)
  · obtain ⟨u, _, hu⟩ := hm.1 hd
    have k1 := (hu (e₁ p)).1 (by rw [h₁, h₁']; exact hD hd)
    have k2 := (hu (e₂ p)).1 (by rw [h₂, h₂']; exact hD hd)
    exact he (k1.trans k2.symm)

end General

/-! ## The cells -/

section Cells

variable {V : Type*} [DecidableEq V]

/-- **I-a2, L4-NoFeedback, in the 12 occupancy-blind cells.** For every quiet occupancy-blind cell
    `(n, b)` of the 72, any vertex type, schedule, round `r` and output cell `v`, there is one cell
    `u`, fixed by the schedule alone, whose start occupancy is the output's occupancy for every
    start; so for any layout the output's occupancy is input `u`'s, or a constant of the layout
    when `u` is not an input cell. -/
theorem thm_nogo_feedback_cells (c : Nat × Tone) (hc : c ∈ cells)
    (hbl : (quietB (prTable c.1) c.2 && occBlindB (prTable c.1) c.2) = true) (s : Schedule V)
    (r : Nat) (v : V) :
    ∃ u : V, (∀ x : Config V, occ c.2 ((round (prTable c.1) s)^[r] x v) = occ c.2 (x u)) ∧
      ∀ (I : Set V) (k : Config V), u ∉ I → ∀ x : Config V, (∀ w, w ∉ I → x w = k w) →
        occ c.2 ((round (prTable c.1) s)^[r] x v) = occ c.2 (k u) := by
  obtain ⟨m, σ, hm, hb⟩ := thm_species_blind_cells c hc hbl
  exact ⟨_, thm_nogo_layer_transport _ _ m σ hm hb s r v⟩

/-- **I-a3, L4-WriteImpossible, in the 12 occupancy-blind cells.** For every quiet
    occupancy-blind cell `(n, b)`, any vertex type, schedule, round `r`, layout `k`, input cells
    `i`, `j`, output cell `v`, and inputs fed the background or an excitation (`a0`, `c0` on `b`,
    `a1`, `c1` off it): the output's occupancy is a constant or one input's (the transport test),
    so it is neither `x and not s` (the 0/1 expand gate, `x` at `i`, `s` at `j`), nor `x and g`
    (the gated register write `g ? x : 0`), nor `x or s` (the merge write `s ? s : x`). -/
theorem thm_nogo_write_impossible (c : Nat × Tone) (hc : c ∈ cells)
    (hbl : (quietB (prTable c.1) c.2 && occBlindB (prTable c.1) c.2) = true) (s : Schedule V)
    (r : Nat) (k : Config V) (i j : V) (a0 a1 c0 c1 : Tone) (ha0 : a0 = c.2) (ha1 : a1 ≠ c.2)
    (hc0 : c0 = c.2) (hc1 : c1 ≠ c.2) (v : V) :
    ((∃ e : Bool, ∀ p q, gateLayer (prTable c.1) (occ c.2) s r k i j a0 a1 c0 c1 v p q = e) ∨
      (∀ p q, gateLayer (prTable c.1) (occ c.2) s r k i j a0 a1 c0 c1 v p q = p) ∨
      (∀ p q, gateLayer (prTable c.1) (occ c.2) s r k i j a0 a1 c0 c1 v p q = q)) ∧
    ¬ (∀ p q, gateLayer (prTable c.1) (occ c.2) s r k i j a0 a1 c0 c1 v p q = (p && !q)) ∧
    ¬ (∀ p q, gateLayer (prTable c.1) (occ c.2) s r k i j a0 a1 c0 c1 v p q = (p && q)) ∧
    ¬ (∀ p q, gateLayer (prTable c.1) (occ c.2) s r k i j a0 a1 c0 c1 v p q = (p || q)) := by
  obtain ⟨m, σ, hm, hb⟩ := thm_species_blind_cells c hc hbl
  have ht := thm_nogo_transport_test _ _ m σ hm hb s r k i j a0 a1 c0 c1
    (by simp [occ, ha0]) (by simp [occ, ha1]) (by simp [occ, hc0]) (by simp [occ, hc1]) v
  exact ⟨ht, nogo_bool_facts _ ht⟩

/-- **I-a5, the level-5 no-go in the 24 species cells.** For every species cell `(n, b)` of the
    72, with its driving pattern `D = drive f b` (occupancy in `T0` to `T3`, the static tone in
    `T4`, the mover tone in `T5`), on any vertex type and schedule: (1) in `T0`, `T1`, `T4` the
    driving layer never changes, so a `T4` structure (its static layer) is never rewritten by any
    stream; (2) in `T2`, `T3`, `T5` the driving layer after `r` rounds is the start's under the
    full swap's free flight, whatever the other tones are, so a `T5` mover's track never depends on
    any structure; (3) two starts with one driving layer keep one driving layer at every round;
    (4) the driving pattern of `T4` is the static tone and of `T5` the mover tone. So in no species
    cell is a structure both rewritten and read by a later mover. -/
theorem thm_nogo_species_cells (c : Nat × Tone) (hc : c ∈ cells)
    (hs : cellKind (prTable c.1) c.2 = .species) (s : Schedule V) :
    (cellType (prTable c.1) c.2 ∈ [some .t0, some .t1, some .t4] →
      ∀ (x : Config V) (r : Nat) (v : V),
        drive (prTable c.1) c.2 ((round (prTable c.1) s)^[r] x v) = drive (prTable c.1) c.2 (x v)) ∧
    (cellType (prTable c.1) c.2 ∉ [some .t0, some .t1, some .t4] →
      ∀ (x : Config V) (r : Nat) (v : V),
        drive (prTable c.1) c.2 ((round (prTable c.1) s)^[r] x v) =
          drive (prTable c.1) c.2 ((round fullSwap s)^[r] x v)) ∧
    (∀ x y : Config V, (fun w => drive (prTable c.1) c.2 (x w)) =
        (fun w => drive (prTable c.1) c.2 (y w)) →
      ∀ r : Nat, (fun w => drive (prTable c.1) c.2 ((round (prTable c.1) s)^[r] x w)) =
        fun w => drive (prTable c.1) c.2 ((round (prTable c.1) s)^[r] y w)) ∧
    (cellType (prTable c.1) c.2 = some .t4 →
      ∀ t, drive (prTable c.1) c.2 t = decide (t = staticOf (prTable c.1) c.2)) ∧
    (cellType (prTable c.1) c.2 = some .t5 →
      ∀ t, drive (prTable c.1) c.2 t = decide (t = moverOf (prTable c.1) c.2)) := by
  obtain ⟨σ, hm, hb, hiff⟩ := thm_species_transport_cells.1 c hc hs
  have ht := thm_species_transport _ _ _ σ hm hb s
  have hl := fun x r v => (thm_species_pull_back _ _ _ σ hm hb s).2.1 x r v
  refine ⟨?_, ?_, ht.2.2.2.2, ?_, ?_⟩
  · intro hT x r v
    have hk := hiff.2 hT
    rw [hl x r v, iterate_fixed (ht.2.2.1 hk v)]
  · intro hT x r v
    have hk : σ = .swap := by
      cases σ with
      | keep => exact absurd (hiff.1 rfl) hT
      | swap => rfl
    rw [hl x r v]
    congr 1
    induction r generalizing v with
    | zero => rfl
    | succ r ih =>
      rw [iterate_succ_apply (f := ⇑(fixedRoundPerm σ s)), ih,
        iterate_succ_apply' (f := round fullSwap s), ht.2.2.2.1 hk]
  · intro hT t
    simp only [drive, hT]
  · intro hT t
    simp only [drive, hT]

/-- **I-a17, C5's species part.** For every species cell `(n, b)` of the 72, on any vertex type
    and schedule: the rule keeps or swaps every pair; from any start with finitely many cells off
    `b`, the off-background count and the count of every excitation are those of the start at
    every round (the number of devices never grows, `thm_cmp_species_never_grow`); and no point
    mutation breeds true: if `y` is `x` mutated at cell `c'`, no round shows the mutated tone
    `y c'` in the `y` run, where the `x` run shows `x c'`, at two distinct cells (no hereditary
    reproducer, M10 P2). -/
theorem thm_nogo_hereditary_cells (c : Nat × Tone) (hc : c ∈ cells)
    (hs : cellKind (prTable c.1) c.2 = .species) (s : Schedule V) :
    KeepOrSwap (prTable c.1) ∧
    (∀ x : Config V, (relSupport c.2 x).Finite → ∀ T : Nat,
      offCount c.2 ((round (prTable c.1) s)^[T] x) = offCount c.2 x ∧
      ∀ u, u ≠ c.2 → speciesCount u ((round (prTable c.1) s)^[T] x) = speciesCount u x) ∧
    (∀ (x y : Config V) (c' : V), x c' ≠ y c' → (∀ w, w ≠ c' → x w = y w) →
      ∀ (r : Nat) (q₁ q₂ : V), q₁ ≠ q₂ →
        ¬ ((round (prTable c.1) s)^[r] x q₁ = x c' ∧ (round (prTable c.1) s)^[r] y q₁ = y c' ∧
          (round (prTable c.1) s)^[r] x q₂ = x c' ∧ (round (prTable c.1) s)^[r] y q₂ = y c')) := by
  obtain ⟨σ, hm, hb, _⟩ := thm_species_transport_cells.1 c hc hs
  have hk := nogo_keepOrSwap _ _ _ hm
  refine ⟨hk, fun x hx T => ?_, ?_⟩
  · have h := thm_cmp_species_never_grow _ hk c.2 s x hx T
    exact ⟨h.2.1, h.2.2⟩
  · rintro x y c' hc' hoff r q₁ q₂ hq ⟨h₁, h₁', h₂, h₂'⟩
    exact thm_nogo_no_hereditary _ _ _ σ hm hb s x y c' hc' hoff r x y c' hc' id
      (fun _ => q₁) (fun _ => q₂) hq h₁ h₁' h₂ h₂'

end Cells

end Compute

end Vibe
