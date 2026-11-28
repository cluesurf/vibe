import Mathlib.Logic.Equiv.Defs
import Mathlib.Logic.Function.Iterate
import Vibe.Compute.Round
import Vibe.Compute.RuleCensus

/-!
# Vibe Computation Lab: Species Transport (the M6 No-Feedback Lemma)

Lean track L04 (lean-track.md rows A4, A5, A25, B15). In a species-conserving cell every pair is
kept or swapped, and which of the two is decided by a driving pattern alone: a predicate
`d : Tone → Bool` on the two tones of the pair (occupancy for `T0` to `T3`, the mover tone for
`T5`, the static tone for `T4`). When the move on a pair with one driving tone does not depend on
which side holds it (`Balanced m σ`), then on any vertex type and any schedule:

1. **No feedback (A4)** (`thm_species_transport`): the driving layer of the round is the start's
   driving layer read through one fixed bijection `fixedRoundPerm σ s` of the vertices, which
   depends on the schedule and `σ` only, never on any tone (the identity for `σ = keep`, the free
   flight of the full swap for `σ = swap`); and the whole state of the round is the start read
   through a bijection `pullPerm m σ s D` fixed by the start's driving layer `D` (the `tau_D` of
   m10 P2).
2. **Pull-back (the lemma the logspace consequence rests on)** (`thm_species_pull_back`): after
   `n` rounds the tone of cell `v` is the start tone of the one cell
   `iterPullPerm m σ s n D v`, and the driving layer after `k` rounds is the start's read through
   `(fixedRoundPerm σ s)^[k]`, so the cell is found by a backward walk that reads the start's
   driving layer at one cell per step. The L = P step itself is deferred (decision 008).
3. **B15** (`thm_species_transport_cells`): for each of the 24 species cells of the 72 the
   driving pattern `drive` and the move table `mtab` satisfy the lemma's hypotheses over the nine
   pairs, by `decide`, with `σ = keep` exactly for `T0`, `T1`, `T4`; the same holds for the code's
   census tables (`genTable`); and no reactive cell is moved by any driving pattern.
4. **A5, the occupancy lemma** (`thm_species_output_copy`, `thm_species_no_kleene`,
   `thm_species_blind_cells`): in a cell driven by occupancy every output of any layout is, on each
   class of inputs with one occupancy pattern, a constant or a copy of one input, so no layout
   computes Kleene `neg`, `min` or `max` on the excitations; the 12 occupancy-blind cells are
   driven by occupancy.
5. **A25, M10 P2** (`thm_species_point_mutation`): a point mutation at one cell differs from the
   original at exactly one cell after every number of rounds: in the driving layer when it changes
   the driving tone, in the whole state otherwise. So no point mutation is carried into two
   disjoint copies.

Mathlib (`Equiv.Perm`, `Function.Involutive.toPerm`, `Function.iterate`), on L02's rounds and
L03's cells. Zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Function
open RuleCensus

/-- What a move does to a pair. -/
def applyMove : Move → Pair → Pair
  | .keep, p => p
  | .swap, p => (p.2, p.1)

/-- `f` is moved by the driving pattern `d` with move table `m`: every pair `(a, c)` is kept or
    swapped as `m (d a) (d c)` says. -/
def MovedBy (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move) : Prop :=
  ∀ a c, f (a, c) = applyMove (m (d a) (d c)) (a, c)

/-- A pair with exactly one driving tone moves by `σ`, whichever side holds it. -/
def Balanced (m : Bool → Bool → Move) (σ : Move) : Prop :=
  m true false = σ ∧ m false true = σ

/-- The full swap of the two cells of every pair (free flight). -/
def fullSwap : Pair → Pair := applyMove .swap

namespace Matching

variable {V : Type*} [DecidableEq V]

/-- The vertex a move sends `v` to within its edge. -/
def moveAt (μ : Move) (M : Matching V) (v : V) : V :=
  match μ with
  | .keep => v
  | .swap => M.mate v

/-- The move the table `m` picks on the edge of `v` from the driving layer `D`, read with the
    edge's orientation. -/
def edgeMove (M : Matching V) (m : Bool → Bool → Move) (D : V → Bool) (v : V) : Move :=
  if M.lead v then m (D v) (D (M.mate v)) else m (D (M.mate v)) (D v)

/-- The cell whose start tone `v` holds after one step moved by `m` on the driving layer `D`. -/
def src (M : Matching V) (m : Bool → Bool → Move) (D : V → Bool) (v : V) : V :=
  if M.mate v = v then v else moveAt (M.edgeMove m D v) M v

/-- The source map of a step whose every edge moves by `σ`. -/
def fixedSrc (M : Matching V) (σ : Move) (v : V) : V := M.src (fun _ _ => σ) (fun _ => false) v

omit [DecidableEq V] in
private theorem edgeMove_mate (M : Matching V) (m : Bool → Bool → Move) (D : V → Bool) (v : V)
    (h : M.mate v ≠ v) : M.edgeMove m D (M.mate v) = M.edgeMove m D v := by
  have hl := M.lead_mate v h
  unfold edgeMove
  rw [hl, M.mate_mate]
  cases M.lead v <;> rfl

private theorem src_src (M : Matching V) (m : Bool → Bool → Move) (D : V → Bool) :
    Involutive (M.src m D) := by
  intro v
  by_cases h : M.mate v = v
  · simp only [src, h, ↓reduceIte]
  · have h' : ¬ v = M.mate v := fun e => h e.symm
    cases he : M.edgeMove m D v with
    | keep => simp only [src, h, he, moveAt, ↓reduceIte]
    | swap =>
      have he' : M.edgeMove m D (M.mate v) = .swap := by rw [edgeMove_mate M m D v h, he]
      simp only [src, h, h', he, he', moveAt, M.mate_mate, ↓reduceIte]

/-- One step's source map as a permutation (an involution). -/
def srcPerm (M : Matching V) (m : Bool → Bool → Move) (D : V → Bool) : Equiv.Perm V :=
  Involutive.toPerm (M.src m D) (src_src M m D)

/-- A step moved by `m` on the driving pattern `d` reads every vertex from its source. -/
private theorem step_eq_src (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (hf : MovedBy f d m) (M : Matching V) (x : Config V) (v : V) :
    M.step f x v = x (M.src m (fun w => d (x w)) v) := by
  by_cases h : M.mate v = v
  · simp only [step, src, h, ↓reduceIte]
  · cases hl : M.lead v with
    | true =>
      simp only [step, src, edgeMove, h, hl, ↓reduceIte]
      rw [hf]
      cases m (d (x v)) (d (x (M.mate v))) <;> rfl
    | false =>
      simp only [step, src, edgeMove, h, hl, Bool.false_eq_true, ↓reduceIte]
      rw [hf]
      cases m (d (x (M.mate v))) (d (x v)) <;> rfl

omit [DecidableEq V] in
private theorem moveAt_layer (M : Matching V) (D : V → Bool) (v : V) (h : D v = D (M.mate v))
    (μ : Move) : D (moveAt μ M v) = D v := by
  cases μ with
  | keep => rfl
  | swap => exact h.symm

omit [DecidableEq V] in
private theorem edgeMove_balanced (M : Matching V) (m : Bool → Bool → Move) (σ : Move)
    (hb : Balanced m σ) (D : V → Bool) (v : V) (hD : D v ≠ D (M.mate v)) :
    M.edgeMove m D v = σ := by
  obtain ⟨h1, h2⟩ := hb
  unfold edgeMove
  cases hl : M.lead v <;> cases ha : D v <;> cases hc : D (M.mate v) <;>
    simp only [ha, hc, ne_eq, not_true_eq_false] at hD <;> simp [h1, h2]

/-- Under a balanced table the driving layer after a step is the layer read through the fixed
    source map of `σ`, whatever the layer is. -/
private theorem src_layer (M : Matching V) (m : Bool → Bool → Move) (σ : Move)
    (hb : Balanced m σ) (D : V → Bool) (v : V) : D (M.src m D v) = D (M.fixedSrc σ v) := by
  by_cases h : M.mate v = v
  · simp only [fixedSrc, src, h, ↓reduceIte]
  · by_cases hD : D v = D (M.mate v)
    · simp only [fixedSrc, src, h, ↓reduceIte, moveAt_layer M D v hD]
    · have he := edgeMove_balanced M m σ hb D v hD
      have he' : M.edgeMove (fun _ _ => σ) (fun _ => false) v = σ := by
        unfold edgeMove
        cases M.lead v <;> rfl
      simp only [fixedSrc, src, h, he, he', ↓reduceIte]

/-- The fixed source map of `σ` as a permutation. -/
def fixedPerm (M : Matching V) (σ : Move) : Equiv.Perm V := M.srcPerm (fun _ _ => σ) (fun _ => false)

end Matching

section Transport

variable {V : Type*} [DecidableEq V]

/-- The fixed bijection that carries the driving layer through one round: the start layer is read
    at `fixedRoundPerm σ s v`. It depends on the schedule and `σ` only. -/
def fixedRoundPerm (σ : Move) : Schedule V → Equiv.Perm V
  | [] => Equiv.refl V
  | M :: s => (fixedRoundPerm σ s).trans (M.fixedPerm σ)

/-- The bijection `tau_D` of one round: the state after the round reads the start at
    `pullPerm m σ s D v`, where `D` is the start's driving layer. -/
def pullPerm (m : Bool → Bool → Move) (σ : Move) : Schedule V → (V → Bool) → Equiv.Perm V
  | [], _ => Equiv.refl V
  | M :: s, D => (pullPerm m σ s (fun w => D (M.fixedSrc σ w))).trans (M.srcPerm m D)

/-- The bijection of `n` rounds: round `k + 1` uses the driving layer of round `k`, which is the
    start's read through `(fixedRoundPerm σ s)^[k]`. -/
def iterPullPerm (m : Bool → Bool → Move) (σ : Move) (s : Schedule V) :
    Nat → (V → Bool) → Equiv.Perm V
  | 0, _ => Equiv.refl V
  | n + 1, D => (pullPerm m σ s (fun w => D ((fixedRoundPerm σ s)^[n] w))).trans
      (iterPullPerm m σ s n D)

private theorem round_transport (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) :
    ∀ (x : Config V) (v : V), round f s x v = x (pullPerm m σ s (fun w => d (x w)) v) ∧
      d (round f s x v) = d (x (fixedRoundPerm σ s v)) := by
  induction s with
  | nil => intro x v; exact ⟨rfl, rfl⟩
  | cons M s ih =>
    intro x v
    have hlay : (fun w => d (M.step f x w)) = fun w => d (x (M.fixedSrc σ w)) := by
      funext w
      rw [Matching.step_eq_src f d m hf M x w]
      exact Matching.src_layer M m σ hb (fun u => d (x u)) w
    obtain ⟨h1, h2⟩ := ih (M.step f x) v
    refine ⟨?_, ?_⟩
    · change round f s (M.step f x) v = _
      rw [h1, hlay, Matching.step_eq_src f d m hf M x]
      rfl
    · change d (round f s (M.step f x) v) = _
      rw [h2, Matching.step_eq_src f d m hf M x]
      exact Matching.src_layer M m σ hb (fun u => d (x u)) _

private theorem fixedRoundPerm_keep (s : Schedule V) (v : V) : fixedRoundPerm .keep s v = v := by
  induction s with
  | nil => rfl
  | cons M s ih =>
    change M.fixedSrc .keep (fixedRoundPerm .keep s v) = v
    rw [ih]
    unfold Matching.fixedSrc Matching.src
    split
    · rfl
    · unfold Matching.edgeMove
      cases M.lead v <;> rfl

private theorem fullSwap_moved : MovedBy fullSwap (fun _ => false) (fun _ _ => .swap) :=
  fun _ _ => rfl

private theorem iterate_layer (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) (x : Config V) :
    ∀ (n : Nat) (v : V), d ((round f s)^[n] x v) = d (x ((fixedRoundPerm σ s)^[n] v)) := by
  intro n
  induction n with
  | zero => intro v; rfl
  | succ n ih =>
    intro v
    rw [iterate_succ_apply', (round_transport f d m σ hf hb s _ v).2, ih, iterate_succ_apply]

private theorem iterate_transport (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) (x : Config V) :
    ∀ (n : Nat) (v : V), (round f s)^[n] x v = x (iterPullPerm m σ s n (fun w => d (x w)) v) := by
  intro n
  induction n with
  | zero => intro v; rfl
  | succ n ih =>
    intro v
    have hlay : (fun w => d ((round f s)^[n] x w)) =
        fun w => d (x ((fixedRoundPerm σ s)^[n] w)) := by
      funext w
      exact iterate_layer f d m σ hf hb s x n w
    rw [iterate_succ_apply', (round_transport f d m σ hf hb s _ v).1, hlay, ih]
    rfl

/-- **A4, the M6 no-feedback lemma, on any vertex type and any schedule.** Let the pair rule `f`
    be moved by a driving pattern `d` with a balanced move table (`σ` on a pair with one driving
    tone, whichever side). Then (1) the round reads the start through the bijection
    `pullPerm m σ s D`, fixed by the start's driving layer `D` alone; (2) the driving layer of the
    round is the start's read through the bijection `fixedRoundPerm σ s`, which no tone changes;
    (3) that bijection is the identity when `σ = keep`, and (4) is the free flight of the full
    swap round when `σ = swap`; (5) the driving layer after the round never depends on the driven
    tones: two starts with one driving layer have one driving layer after every round. -/
theorem thm_species_transport (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) :
    (∀ (x : Config V) (v : V), round f s x v = x (pullPerm m σ s (fun w => d (x w)) v)) ∧
    (∀ (x : Config V) (v : V), d (round f s x v) = d (x (fixedRoundPerm σ s v))) ∧
    (σ = .keep → ∀ v : V, fixedRoundPerm σ s v = v) ∧
    (σ = .swap → ∀ (x : Config V) (v : V), round fullSwap s x v = x (fixedRoundPerm σ s v)) ∧
    (∀ (x y : Config V), (fun w => d (x w)) = (fun w => d (y w)) →
      ∀ n : Nat, (fun w => d ((round f s)^[n] x w)) = fun w => d ((round f s)^[n] y w)) := by
  refine ⟨fun x v => (round_transport f d m σ hf hb s x v).1,
    fun x v => (round_transport f d m σ hf hb s x v).2, ?_, ?_, ?_⟩
  · intro hσ v
    subst hσ
    exact fixedRoundPerm_keep s v
  · intro hσ x v
    subst hσ
    have h := (round_transport fullSwap (fun _ => false) (fun _ _ => .swap) .swap fullSwap_moved
      ⟨rfl, rfl⟩ s x v).1
    rw [h]
    congr 1
    clear h
    induction s with
    | nil => rfl
    | cons M s ih =>
      change M.src (fun _ _ => .swap) (fun _ => false)
          (pullPerm (fun _ _ => .swap) .swap s (fun w => false) v) =
        M.fixedSrc .swap (fixedRoundPerm .swap s v)
      rw [← ih]
      rfl
  · intro x y hxy n
    funext w
    rw [iterate_layer f d m σ hf hb s x n w, iterate_layer f d m σ hf hb s y n w]
    exact congrFun hxy _

/-- **The pull-back lemma.** Under the hypotheses of `thm_species_transport`, after `n` rounds
    the tone of every cell `v` is the start tone of the one cell `iterPullPerm m σ s n D v`, a
    bijection fixed by the start's driving layer `D`; that bijection is built round by round from
    the driving layer of round `k`, which is the start's read through `(fixedRoundPerm σ s)^[k]`, a
    bijection no tone changes. So the cell a tone at time `n` comes from is found by a backward
    walk that reads the start's driving layer at one cell per step (the tracer of m6 G2(b)). The
    complexity consequence (efficient universality gives L = P) is deferred (decision 008). -/
theorem thm_species_pull_back (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) :
    (∀ (x : Config V) (n : Nat) (v : V),
      (round f s)^[n] x v = x (iterPullPerm m σ s n (fun w => d (x w)) v)) ∧
    (∀ (x : Config V) (n : Nat) (v : V),
      d ((round f s)^[n] x v) = d (x ((fixedRoundPerm σ s)^[n] v))) ∧
    (∀ (D : V → Bool) (n : Nat) (v : V),
      iterPullPerm m σ s (n + 1) D v =
        iterPullPerm m σ s n D (pullPerm m σ s (fun w => D ((fixedRoundPerm σ s)^[n] w)) v)) ∧
    (∀ (D : V → Bool) (n : Nat), Bijective (iterPullPerm m σ s n D)) := by
  exact ⟨fun x n v => iterate_transport f d m σ hf hb s x n v,
    fun x n v => iterate_layer f d m σ hf hb s x n v, fun _ _ _ => rfl,
    fun D n => (iterPullPerm m σ s n D).bijective⟩

/-- **A5, the occupancy lemma, as an output copy.** Under the hypotheses of
    `thm_species_transport`, take any layout: input cells `I`, constants `k` elsewhere. On every
    class of inputs with one driving layer `D`, the output at cell `v` after `n` rounds is the start
    tone of one fixed cell `u`: a copy of the input at `u` when `u` is an input cell, the constant
    `k u` when it is not. -/
theorem thm_species_output_copy (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) (I : Set V)
    (k : Config V) (D : V → Bool) (n : Nat) (v : V) :
    ∃ u : V, ∀ x : Config V, (∀ w, w ∉ I → x w = k w) → (fun w => d (x w)) = D →
      (round f s)^[n] x v = x u ∧ (u ∉ I → (round f s)^[n] x v = k u) := by
  refine ⟨iterPullPerm m σ s n D v, fun x hk hD => ?_⟩
  have h := iterate_transport f d m σ hf hb s x n v
  rw [hD] at h
  exact ⟨h, fun hu => h.trans (hk _ hu)⟩

end Transport

/-! ## Occupancy, Kleene gates and the 72 cells -/

/-- The occupancy pattern of background `b`. -/
def occ (b : Tone) : Tone → Bool := fun t => decide (t ≠ b)

/-- Kleene `min` by tone value. -/
def toneMin (a c : Tone) : Tone := if a.value ≤ c.value then a else c

/-- Kleene `max` by tone value. -/
def toneMax (a c : Tone) : Tone := if a.value ≤ c.value then c else a

private theorem kleene_facts : ∀ b : Tone,
    (excitations b).1 ≠ b ∧ (excitations b).2 ≠ b ∧ (excitations b).1 ≠ (excitations b).2 ∧
    (excitations b).1.dual ≠ (excitations b).2.dual ∧
    ¬ ((excitations b).1.dual = (excitations b).1 ∧ (excitations b).2.dual = (excitations b).2) ∧
    (∀ g : Tone → Tone → Tone, g = toneMin ∨ g = toneMax →
      ¬ (∃ c0, ∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = c0) ∧
      ¬ (∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = a) ∧
      ¬ (∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = c)) := by
  intro b
  refine ⟨by cases b <;> decide, by cases b <;> decide, by cases b <;> decide,
    by cases b <;> decide, by cases b <;> decide, ?_⟩
  intro g hg
  rcases hg with rfl | rfl
  · refine ⟨?_, ?_, ?_⟩
    · rintro ⟨c0, h⟩
      cases b <;> cases c0 <;> simp_all [toneMin, excitations, Tone.value]
    · intro h
      cases b <;> simp_all [toneMin, excitations, Tone.value]
    · intro h
      cases b <;> simp_all [toneMin, excitations, Tone.value]
  · refine ⟨?_, ?_, ?_⟩
    · rintro ⟨c0, h⟩
      cases b <;> cases c0 <;> simp_all [toneMax, excitations, Tone.value]
    · intro h
      cases b <;> simp_all [toneMax, excitations, Tone.value]
    · intro h
      cases b <;> simp_all [toneMax, excitations, Tone.value]

section Kleene

variable {V : Type*} [DecidableEq V]

/-- **A5, no Kleene gate.** In a cell driven by occupancy (`d = occ b`, a balanced table), on any
    vertex type, schedule and layout `k`, no output cell `v` at any round `n` computes, from an
    input cell `i` holding either excitation of `b`, any function other than a constant or the
    identity of the input, so in particular not Kleene `neg`; and from two distinct input cells
    `i`, `j` holding excitations, no function other than a constant or a copy of one input, so
    neither `min` nor `max`. -/
theorem thm_species_no_kleene (f : Pair → Pair) (b : Tone) (m : Bool → Bool → Move) (σ : Move)
    (hf : MovedBy f (occ b) m) (hb : Balanced m σ) (s : Schedule V) (k : Config V) (n : Nat)
    (v i j : V) (hij : i ≠ j) :
    (∀ g : Tone → Tone, (∀ t ∈ [(excitations b).1, (excitations b).2],
        (round f s)^[n] (update k i t) v = g t) →
      g (excitations b).1 = g (excitations b).2 ∨
        (g (excitations b).1 = (excitations b).1 ∧ g (excitations b).2 = (excitations b).2)) ∧
    ¬ (∀ t ∈ [(excitations b).1, (excitations b).2],
        (round f s)^[n] (update k i t) v = t.dual) ∧
    (∀ g : Tone → Tone → Tone, (∀ a ∈ [(excitations b).1, (excitations b).2],
        ∀ c ∈ [(excitations b).1, (excitations b).2],
          (round f s)^[n] (update (update k i a) j c) v = g a c) →
      (∃ c0, ∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = c0) ∨
      (∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = a) ∨
      (∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = c)) ∧
    ¬ (∀ a ∈ [(excitations b).1, (excitations b).2],
        ∀ c ∈ [(excitations b).1, (excitations b).2],
          (round f s)^[n] (update (update k i a) j c) v = toneMin a c) ∧
    ¬ (∀ a ∈ [(excitations b).1, (excitations b).2],
        ∀ c ∈ [(excitations b).1, (excitations b).2],
          (round f s)^[n] (update (update k i a) j c) v = toneMax a c) := by
  obtain ⟨he1, he2, he12, hdual, hnotid, hbin⟩ := kleene_facts b
  have hS : ∀ t ∈ [(excitations b).1, (excitations b).2], occ b t = true := by
    intro t ht
    simp only [List.mem_cons, List.not_mem_nil, or_false] at ht
    rcases ht with rfl | rfl <;> simp [occ, he1, he2]
  -- unary
  have hun : ∀ g : Tone → Tone, (∀ t ∈ [(excitations b).1, (excitations b).2],
      (round f s)^[n] (update k i t) v = g t) →
      g (excitations b).1 = g (excitations b).2 ∨
        (g (excitations b).1 = (excitations b).1 ∧ g (excitations b).2 = (excitations b).2) := by
    intro g hg
    let D : V → Bool := update (fun w => occ b (k w)) i true
    have hD : ∀ t ∈ [(excitations b).1, (excitations b).2],
        (fun w => occ b (update k i t w)) = D := by
      intro t ht
      funext w
      by_cases hw : w = i
      · subst hw; simp [D, hS t ht]
      · simp [D, hw]
    obtain ⟨u, hu⟩ := thm_species_output_copy f (occ b) m σ hf hb s {i} k D n v
    have m1 : (excitations b).1 ∈ [(excitations b).1, (excitations b).2] := by simp
    have m2 : (excitations b).2 ∈ [(excitations b).1, (excitations b).2] := by simp
    have k1 := hu (update k i (excitations b).1) (fun w hw => by
      simp only [Set.mem_singleton_iff] at hw; simp [hw]) (hD _ m1)
    have k2 := hu (update k i (excitations b).2) (fun w hw => by
      simp only [Set.mem_singleton_iff] at hw; simp [hw]) (hD _ m2)
    by_cases hui : u = i
    · subst hui
      right
      rw [← hg _ m1, ← hg _ m2, k1.1, k2.1]
      simp
    · left
      rw [← hg _ m1, ← hg _ m2, k1.2 hui, k2.2 hui]
  -- binary
  have hbi : ∀ g : Tone → Tone → Tone, (∀ a ∈ [(excitations b).1, (excitations b).2],
      ∀ c ∈ [(excitations b).1, (excitations b).2],
        (round f s)^[n] (update (update k i a) j c) v = g a c) →
      (∃ c0, ∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = c0) ∨
      (∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = a) ∨
      (∀ a ∈ [(excitations b).1, (excitations b).2],
          ∀ c ∈ [(excitations b).1, (excitations b).2], g a c = c) := by
    intro g hg
    let D : V → Bool := update (update (fun w => occ b (k w)) i true) j true
    have hD : ∀ a ∈ [(excitations b).1, (excitations b).2],
        ∀ c ∈ [(excitations b).1, (excitations b).2],
        (fun w => occ b (update (update k i a) j c w)) = D := by
      intro a ha c hc
      funext w
      by_cases hwj : w = j
      · subst hwj; simp [D, hS c hc]
      · by_cases hwi : w = i
        · subst hwi; simp [D, hwj, hS a ha]
        · simp [D, hwj, hwi]
    obtain ⟨u, hu⟩ := thm_species_output_copy f (occ b) m σ hf hb s {i, j} k D n v
    have hk : ∀ a c, ∀ w, w ∉ ({i, j} : Set V) → update (update k i a) j c w = k w := by
      intro a c w hw
      simp only [Set.mem_insert_iff, Set.mem_singleton_iff, not_or] at hw
      simp [hw.1, hw.2]
    by_cases huj : u = j
    · subst huj
      right; right
      intro a ha c hc
      rw [← hg a ha c hc, (hu _ (hk a c) (hD a ha c hc)).1]
      simp
    · by_cases hui : u = i
      · subst hui
        right; left
        intro a ha c hc
        rw [← hg a ha c hc, (hu _ (hk a c) (hD a ha c hc)).1]
        simp [hij]
      · left
        refine ⟨k u, fun a ha c hc => ?_⟩
        have hnot : u ∉ ({i, j} : Set V) := by
          simp only [Set.mem_insert_iff, Set.mem_singleton_iff, not_or]
          exact ⟨hui, huj⟩
        rw [← hg a ha c hc, (hu _ (hk a c) (hD a ha c hc)).2 hnot]
  refine ⟨hun, ?_, hbi, ?_, ?_⟩
  · intro h
    rcases hun Tone.dual h with h1 | h1
    · exact hdual h1
    · exact hnotid h1
  · intro h
    obtain ⟨n1, n2, n3⟩ := hbin toneMin (Or.inl rfl)
    rcases hbi toneMin h with h1 | h1 | h1
    · exact n1 h1
    · exact n2 h1
    · exact n3 h1
  · intro h
    obtain ⟨n1, n2, n3⟩ := hbin toneMax (Or.inr rfl)
    rcases hbi toneMax h with h1 | h1 | h1
    · exact n1 h1
    · exact n2 h1
    · exact n3 h1

end Kleene

/-! ## B15: the driving pattern and the move table of every species cell -/

/-- `movedBy` as a check over the nine pairs. -/
def movedByB (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move) : Bool :=
  tones.all fun a => tones.all fun c => decide (f (a, c) = applyMove (m (d a) (d c)) (a, c))

private theorem movedByB_iff (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move) :
    movedByB f d m = true ↔ MovedBy f d m := by
  unfold movedByB MovedBy
  simp only [List.all_eq_true, decide_eq_true_eq]
  exact ⟨fun h a c => h a (mem_tones a) c (mem_tones c), fun h a _ c _ => h a c⟩

/-- The move table read off a rule: `swap` on a driving pattern where some pair of tones with it
    changes, `keep` otherwise. -/
def mtab (f : Pair → Pair) (d : Tone → Bool) (x y : Bool) : Move :=
  if tones.any (fun a => tones.any fun c =>
      d a == x && d c == y && !decide (f (a, c) = (a, c))) then .swap else .keep

/-- The static excitation of a `T4` cell (its lone pair is kept). -/
def staticOf (f : Pair → Pair) (b : Tone) : Tone :=
  if pairMove f (excitations b).1 b = some .keep then (excitations b).1 else (excitations b).2

/-- The moving excitation of a `T5` cell (its lone pair is swapped). -/
def moverOf (f : Pair → Pair) (b : Tone) : Tone :=
  if pairMove f (excitations b).1 b = some .swap then (excitations b).1 else (excitations b).2

/-- The driving pattern of a cell (m6): the static tone for `T4`, the mover for `T5`, occupancy
    otherwise. -/
def drive (f : Pair → Pair) (b : Tone) : Tone → Bool :=
  match cellType f b with
  | some .t4 => fun t => decide (t = staticOf f b)
  | some .t5 => fun t => decide (t = moverOf f b)
  | _ => occ b

/-- The B15 row of one cell: the lemma's table holds on the nine pairs, the table is balanced, and
    a pair with one driving tone is kept exactly in `T0`, `T1`, `T4`. -/
def b15RowB (f : Pair → Pair) (b : Tone) : Bool :=
  movedByB f (drive f b) (mtab f (drive f b)) &&
    decide (mtab f (drive f b) false true = mtab f (drive f b) true false) &&
    (decide (mtab f (drive f b) true false = .keep) ==
      decide (cellType f b ∈ [some .t0, some .t1, some .t4]))

private theorem b15_cells :
    ∀ c ∈ cells, cellKind (prTable c.1) c.2 = .species → b15RowB (prTable c.1) c.2 = true := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

private theorem b15_gen :
    ∀ i ∈ List.range 24, ∀ b ∈ tones, cellKind (genTable i) b = .species →
      b15RowB (genTable i) b = true := by
  decide +kernel

private theorem blind_cells_bool :
    ∀ c ∈ cells, (quietB (prTable c.1) c.2 && occBlindB (prTable c.1) c.2) = true →
      (tones.all fun t => drive (prTable c.1) c.2 t == occ c.2 t) = true := by
  unfold cells
  rw [pr_rule_codes_eq]
  decide +kernel

private theorem blind_drive (c : Nat × Tone) (hc : c ∈ cells)
    (h : (quietB (prTable c.1) c.2 && occBlindB (prTable c.1) c.2) = true) :
    drive (prTable c.1) c.2 = occ c.2 := by
  have hall := blind_cells_bool c hc h
  simp only [List.all_eq_true, beq_iff_eq] at hall
  funext t
  exact hall t (mem_tones t)

private theorem moved_pairMove (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (hf : MovedBy f d m) (a c : Tone) : (pairMove f a c).isSome = true := by
  unfold pairMove
  rw [hf]
  cases m (d a) (d c) with
  | keep => simp [applyMove]
  | swap =>
    simp only [applyMove]
    split
    · rfl
    · simp

private theorem row_spec (f : Pair → Pair) (b : Tone) (h : b15RowB f b = true) :
    MovedBy f (drive f b) (mtab f (drive f b)) ∧
      Balanced (mtab f (drive f b)) (mtab f (drive f b) true false) ∧
      (mtab f (drive f b) true false = .keep ↔ cellType f b ∈ [some .t0, some .t1, some .t4]) := by
  unfold b15RowB at h
  simp only [Bool.and_eq_true, beq_iff_eq, decide_eq_decide, decide_eq_true_eq] at h
  obtain ⟨⟨h1, h2⟩, h3⟩ := h
  exact ⟨(movedByB_iff _ _ _).1 h1, ⟨rfl, h2⟩, h3⟩

/-- **B15, the M6 lemma table over the 24 species cells.** For every species cell of the 72 the
    driving pattern `drive` (occupancy for `T0` to `T3`, the static tone for `T4`, the mover for
    `T5`) and the table `mtab` move every one of the nine pairs, the table is balanced, and its
    `σ` is `keep` (the driving layer stands still) exactly in `T0`, `T1`, `T4` and `swap` (free
    flight) in `T2`, `T3`, `T5`. The same rows hold for the code's census tables `genTable`
    (bridged by `gen_rule_census_cells_eq`). Conversely a rule moved by any driving pattern keeps
    or swaps every pair, so no reactive cell has a driving layer. -/
theorem thm_species_transport_cells :
    (∀ c ∈ cells, cellKind (prTable c.1) c.2 = .species →
      ∃ σ, MovedBy (prTable c.1) (drive (prTable c.1) c.2) (mtab (prTable c.1) (drive (prTable c.1) c.2)) ∧
        Balanced (mtab (prTable c.1) (drive (prTable c.1) c.2)) σ ∧
        (σ = .keep ↔ cellType (prTable c.1) c.2 ∈ [some .t0, some .t1, some .t4])) ∧
    (∀ i ∈ List.range 24, ∀ b ∈ tones, cellKind (genTable i) b = .species →
      ∃ σ, MovedBy (genTable i) (drive (genTable i) b) (mtab (genTable i) (drive (genTable i) b)) ∧
        Balanced (mtab (genTable i) (drive (genTable i) b)) σ ∧
        (σ = .keep ↔ cellType (genTable i) b ∈ [some .t0, some .t1, some .t4])) ∧
    (∀ (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move), MovedBy f d m →
      ∀ a c, (pairMove f a c).isSome = true) ∧
    (∀ c ∈ cells, cellKind (prTable c.1) c.2 = .reactive →
      ∀ (d : Tone → Bool) (m : Bool → Bool → Move), ¬ MovedBy (prTable c.1) d m) := by
  refine ⟨fun c hc hs => ⟨_, row_spec _ _ (b15_cells c hc hs)⟩,
    fun i hi b hb hs => ⟨_, row_spec _ _ (b15_gen i hi b hb hs)⟩, moved_pairMove, ?_⟩
  intro c _ hr d m hf
  have hq : quietB (prTable c.1) c.2 = true := by
    unfold cellKind at hr
    cases hq : quietB (prTable c.1) c.2
    · simp [hq] at hr
    · rfl
  have hall : (tones.all fun a => tones.all fun c' => (pairMove (prTable c.1) a c').isSome) = true := by
    simp only [List.all_eq_true]
    exact fun a _ c' _ => moved_pairMove _ d m hf a c'
  unfold cellKind at hr
  simp [hq, hall] at hr

/-- **A5 on the 12 occupancy-blind cells.** Every quiet occupancy-blind cell (exactly the `T0` to
    `T3` cells, `thm_rule_census_blind`) is moved by occupancy with a balanced table, so
    `thm_species_output_copy` and `thm_species_no_kleene` apply to it on every graph, schedule and
    layout. -/
theorem thm_species_blind_cells :
    ∀ c ∈ cells, (quietB (prTable c.1) c.2 && occBlindB (prTable c.1) c.2) = true →
      ∃ (m : Bool → Bool → Move) (σ : Move), MovedBy (prTable c.1) (occ c.2) m ∧ Balanced m σ := by
  intro c hc h
  have hs : cellKind (prTable c.1) c.2 = .species := by
    have h12 := (thm_rule_census_blind.1 c hc).1 h
    have hsome : (cellType (prTable c.1) c.2).isSome = true := by
      simp only [List.mem_cons, List.not_mem_nil, or_false] at h12
      rcases h12 with h12 | h12 | h12 | h12 <;> rw [h12] <;> rfl
    exact ((thm_rule_census_cells.2.2.2.2.1 c hc).2.2).2 hsome
  obtain ⟨hm, hb, _⟩ := row_spec _ _ (b15_cells c hc hs)
  rw [blind_drive c hc h] at hm hb
  exact ⟨_, _, hm, hb⟩

/-! ## A25: M10 P2, a point mutation marks one cell -/

section Mutation

variable {V : Type*} [DecidableEq V]

/-- **A25, M10 P2, on any vertex type and schedule.** Under the hypotheses of
    `thm_species_transport`, let `y` be a point mutation of `x` at cell `c` (they differ there and
    nowhere else; any start, finite or not). After every number of rounds `n`: if the mutation
    changes the driving tone, the two driving layers differ at exactly one cell, the cell `u` with
    `(fixedRoundPerm σ s)^[n] u = c`; if it does not, the two whole states differ at exactly one
    cell, the cell `u` with `iterPullPerm m σ s n D u = c` (`D` the common driving layer). So the
    mark never lands on two distinct cells, and no point mutation breeds true in two disjoint
    copies at fixed places (m10 P2; offspring placed by the mutation itself stay outside, as the
    note says). -/
theorem thm_species_point_mutation (f : Pair → Pair) (d : Tone → Bool) (m : Bool → Bool → Move)
    (σ : Move) (hf : MovedBy f d m) (hb : Balanced m σ) (s : Schedule V) (x y : Config V) (c : V)
    (hc : x c ≠ y c) (hoff : ∀ w, w ≠ c → x w = y w) (n : Nat) :
    (d (x c) ≠ d (y c) → ∃ u : V, (fixedRoundPerm σ s)^[n] u = c ∧
      ∀ w, d ((round f s)^[n] x w) ≠ d ((round f s)^[n] y w) ↔ w = u) ∧
    (d (x c) = d (y c) → ∃ u : V, iterPullPerm m σ s n (fun w => d (x w)) u = c ∧
      ∀ w, (round f s)^[n] x w ≠ (round f s)^[n] y w ↔ w = u) ∧
    (∀ u₁ u₂ : V,
      (if d (x c) = d (y c) then (round f s)^[n] x u₁ ≠ (round f s)^[n] y u₁
        else d ((round f s)^[n] x u₁) ≠ d ((round f s)^[n] y u₁)) →
      (if d (x c) = d (y c) then (round f s)^[n] x u₂ ≠ (round f s)^[n] y u₂
        else d ((round f s)^[n] x u₂) ≠ d ((round f s)^[n] y u₂)) → u₁ = u₂) := by
  have hA : d (x c) ≠ d (y c) → ∃ u : V, (fixedRoundPerm σ s)^[n] u = c ∧
      ∀ w, d ((round f s)^[n] x w) ≠ d ((round f s)^[n] y w) ↔ w = u := by
    intro hd
    obtain ⟨u, hu⟩ := ((fixedRoundPerm σ s).bijective.iterate n).2 c
    refine ⟨u, hu, fun w => ?_⟩
    rw [iterate_layer f d m σ hf hb s x n w, iterate_layer f d m σ hf hb s y n w]
    constructor
    · intro h
      by_contra hw
      apply h
      have hne : (fixedRoundPerm σ s)^[n] w ≠ c := by
        rw [← hu]
        exact fun e => hw (((fixedRoundPerm σ s).injective.iterate n) e)
      rw [hoff _ hne]
    · rintro rfl
      rw [hu]
      exact hd
  have hB : d (x c) = d (y c) → ∃ u : V, iterPullPerm m σ s n (fun w => d (x w)) u = c ∧
      ∀ w, (round f s)^[n] x w ≠ (round f s)^[n] y w ↔ w = u := by
    intro hd
    have hD : (fun w => d (x w)) = fun w => d (y w) := by
      funext w
      by_cases hw : w = c
      · subst hw; exact hd
      · rw [hoff w hw]
    let τ := iterPullPerm m σ s n (fun w => d (x w))
    refine ⟨τ.symm c, τ.apply_symm_apply c, fun w => ?_⟩
    rw [iterate_transport f d m σ hf hb s x n w, iterate_transport f d m σ hf hb s y n w, ← hD]
    constructor
    · intro h
      by_contra hw
      apply h
      have hne : τ w ≠ c := by
        intro e
        apply hw
        rw [← e, τ.symm_apply_apply]
      exact hoff _ hne
    · rintro rfl
      change x (τ (τ.symm c)) ≠ y (τ (τ.symm c))
      rw [τ.apply_symm_apply]
      exact hc
  refine ⟨hA, hB, fun u₁ u₂ h₁ h₂ => ?_⟩
  by_cases hd : d (x c) = d (y c)
  · simp only [hd, ↓reduceIte] at h₁ h₂
    obtain ⟨u, _, hu⟩ := hB hd
    rw [(hu u₁).1 h₁, (hu u₂).1 h₂]
  · simp only [hd, ↓reduceIte] at h₁ h₂
    obtain ⟨u, _, hu⟩ := hA hd
    rw [(hu u₁).1 h₁, (hu u₂).1 h₂]

end Mutation

end Compute

end Vibe
