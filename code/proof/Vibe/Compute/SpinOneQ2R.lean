import Mathlib.Combinatorics.SimpleGraph.Clique
import Mathlib.Combinatorics.SimpleGraph.DegreeSum
import Mathlib.Algebra.BigOperators.Group.Finset.Basic
import Mathlib.Algebra.Order.BigOperators.Group.Finset
import Mathlib.Logic.Equiv.Defs
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.Ring
import Vibe.Compute.Round
import Vibe.Generated.SpinOneQ2R

/-!
# Vibe Computation Lab: the Spin-1 Q2R Rule (M2-B)

The reversible, energy-conserving spin-1 Blume-Capel rule of `code/rule/spin-one-q2r.ts` on any
finite `SimpleGraph` (claims A2 and A3; the bounded census B13 is superseded by A2
and kept as evidence only).

Tones `-1, 0, +1` are integer spins. With integer exchange `J` and crystal field `Δ` the energy is
`E = -J ∑_{edges} s_i s_j + Δ ∑_i s_i²` (`q2rEnergy`, the edge sum over Mathlib's `edgeFinset`), and the
local energy of tone `t` in the neighbour field `h` is `e(t) = -J t h + Δ t²` (`q2rLocalEnergy`).
`q2rMove J Δ t h` is the transposition of the two tones of equal local energy, line for line the
TypeScript `q2rMove`. `q2rSetStep g S` applies a local rule `g` at every cell of a set `S`, each cell
reading its field from the configuration before the step; a schedule is a list of sets, `q2rRound`
applies them in order and `q2rRoundBack` in reverse order.

Headline theorems:
1. `thm_q2r_round_general` (A2, any local rule): on any finite graph, for any schedule of
   independent sets and any local rule that keeps the local energy at every field and is an
   involution of the tones at every field, every set step is an involution, the round keeps `E`, is
   a bijection (`q2rRoundPerm`, an `Equiv.Perm` of all configurations), and the reverse-order round
   is its inverse on both sides.
2. `thm_q2r_round` (A2): the same for `q2rMove`, for every integer `J` and `Δ` (the note's `J ≥ 1`
   is not needed).
3. `thm_q2r_move_local` : `q2rMove` keeps the local energy, is an involution at every field, and
   commutes with negation (`t ↦ -t`, `h ↦ -h`).
4. `thm_q2r_delta_zero_keeps_d` (A2): at `Δ = 0` `q2rMove` keeps `t²`, so every set step and
   every round keeps `D` on any graph and schedule.
5. `thm_q2r_delta_zero_chiral` (A2): at `Δ = 0` and `J ≠ 0`, every local rule that keeps the local
   energy, permutes the tones at every field and commutes with negation keeps `t²`: a D-changing
   rule at `Δ = 0` has to be chiral.
6. `thm_q2r_odd_degree_frozen` (A3): on a graph of odd degrees with `J ≠ 0`, when no vacancy move
   is available (`J k ≠ Δ` for every integer `k` with `|k|` at most the degree), every configuration
   without a vacancy is a fixed point of every set step and every round, so it never moves.
7. `thm_q2r_vacancy_needs_ratio` (A3): a `q2rMove` that changes `t²` at a cell needs
   `Δ = J k` for an integer `k` with `|k|` at most the cell's degree; when no cell has one, every set
   step and round keeps `D` on any configuration.
8. `gen_q2r_move_eq` (bridge): the generated `q2rMoveTable` (the TypeScript `q2rMove` on every tone,
   `J ∈ 1..3`, `Δ, h ∈ -12..12`) equals `q2rMove` on that family.

Hypotheses stronger than the milestone M2-B statement: the frozen theorem (6) states the "no vacancy move"
condition that the note's "Ising limit" leaves implicit; the chirality theorem (5) states that the
rule permutes the tones at each field (the note's "local map", which the involution gives) and needs
`J ≠ 0`. Everything else is stated for every integer `J` and `Δ`, every finite graph and schedule.

Limit of the link: the theorems speak about the Lean `q2rMove`; it equals the code's on the exported
family only. The schedule here is any list of independent sets; the
code's greedy colouring is one such list (gated proper by `checkIndependentSchedule`).

Mathlib (`SimpleGraph`, `edgeFinset`, `Dart`, `IsIndepSet`, `Finset.sum`, `Equiv.Perm`), zero
`sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Function Finset

/-! ### The local rule -/

/-- The local energy `e(t) = -J t h + Δ t²` of tone `t` in the neighbour field `h`. -/
def q2rLocalEnergy (J Δ : ℤ) (t : Tone) (h : ℤ) : ℤ := -J * t.value * h + Δ * toneSq t

/-- `q2rMove` of spin-one-q2r.ts: the transposition of the two tones of equal local energy. A
    nonzero tone flips when `J h = 0`, falls to `0` when its local energy is `0`, and stays
    otherwise; `0` stays when `J h = 0`, rises to `+1` when `J h = Δ` and to `-1` when `J h = -Δ`. -/
def q2rMove (J Δ : ℤ) (t : Tone) (h : ℤ) : Tone :=
  match t with
  | .pos => if J * h = 0 then .neg else if -(J * h) + Δ = 0 then .zero else .pos
  | .neg => if J * h = 0 then .pos else if J * h + Δ = 0 then .zero else .neg
  | .zero =>
    if J * h = 0 then .zero
    else if -(J * h) + Δ = 0 then .pos
    else if J * h + Δ = 0 then .neg
    else .zero

private theorem q2r_move_energy (J Δ : ℤ) (t : Tone) (h : ℤ) :
    q2rLocalEnergy J Δ (q2rMove J Δ t h) h = q2rLocalEnergy J Δ t h := by
  cases t <;> simp only [q2rMove] <;> split_ifs <;>
    simp only [q2rLocalEnergy, toneSq, Tone.value] <;> linarith

private theorem q2r_move_involutive (J Δ : ℤ) (h : ℤ) :
    Involutive (fun t => q2rMove J Δ t h) := by
  intro t
  show q2rMove J Δ (q2rMove J Δ t h) h = t
  unfold q2rMove
  generalize J * h = m
  cases t <;> by_cases h1 : m = 0 <;> by_cases h2 : -m + Δ = 0 <;> by_cases h3 : m + Δ = 0 <;>
    first | (simp [h1, h2, h3]; done) | (simp [h1, h2, h3]; omega)

private theorem q2r_move_dual (J Δ : ℤ) (t : Tone) (h : ℤ) :
    q2rMove J Δ t.dual (-h) = (q2rMove J Δ t h).dual := by
  cases t <;> simp only [Tone.dual, q2rMove, mul_neg, neg_neg, neg_eq_zero] <;>
    split_ifs <;> first | rfl | omega

/-- `q2rMove` keeps the local energy, is an involution of the tones at every field, and commutes
    with negation of the tone and the field, for every integer `J` and `Δ`. -/
theorem thm_q2r_move_local (J Δ : ℤ) :
    (∀ t h, q2rLocalEnergy J Δ (q2rMove J Δ t h) h = q2rLocalEnergy J Δ t h) ∧
    (∀ h, Involutive (fun t => q2rMove J Δ t h)) ∧
    (∀ t h, q2rMove J Δ t.dual (-h) = (q2rMove J Δ t h).dual) :=
  ⟨q2r_move_energy J Δ, q2r_move_involutive J Δ, q2r_move_dual J Δ⟩

/-! ### Fields, energy and the set step on a finite graph -/

variable {V : Type*} [Fintype V] [DecidableEq V] (G : SimpleGraph V) [DecidableRel G.Adj]

/-- The neighbour field: the sum of the neighbours' tones. -/
def q2rField (x : Config V) (v : V) : ℤ := ∑ w ∈ G.neighborFinset v, (x w).value

/-- The bond sum `∑_{edges} s_i s_j` over Mathlib's `edgeFinset`. -/
def q2rBond (x : Config V) : ℤ :=
  ∑ e ∈ G.edgeFinset, Sym2.lift ⟨fun a b => (x a).value * (x b).value, fun _ _ => mul_comm _ _⟩ e

/-- The Blume-Capel energy `E = -J ∑_{edges} s_i s_j + Δ ∑_i s_i²`. -/
def q2rEnergy (J Δ : ℤ) (x : Config V) : ℤ := -J * q2rBond G x + Δ * ∑ v, toneSq (x v)

/-- One set step: every cell of `S` takes `g` of its tone and its field (read before the step);
    every other cell keeps its tone. -/
def q2rSetStep (g : Tone → ℤ → Tone) (S : Finset V) (x : Config V) : Config V :=
  fun v => if v ∈ S then g (x v) (q2rField G x v) else x v

/-- A round: the sets of the schedule in order. -/
def q2rRound (g : Tone → ℤ → Tone) (s : List (Finset V)) (x : Config V) : Config V :=
  s.foldl (fun y S => q2rSetStep G g S y) x

/-- The inverse round: the sets of the schedule in reverse order. -/
def q2rRoundBack (g : Tone → ℤ → Tone) (s : List (Finset V)) (x : Config V) : Config V :=
  s.reverse.foldl (fun y S => q2rSetStep G g S y) x

/-- The double sum over ordered adjacent pairs. -/
private def adjSum (F : V → V → ℤ) : ℤ := ∑ v, ∑ w, if G.Adj v w then F v w else 0

omit [DecidableEq V] in
private theorem adjSum_comm (F : V → V → ℤ) : adjSum G F = adjSum G (fun v w => F w v) := by
  unfold adjSum
  rw [Finset.sum_comm]
  refine Finset.sum_congr rfl fun v _ => Finset.sum_congr rfl fun w _ => ?_
  by_cases h : G.Adj v w
  · simp [h, G.adj_symm h]
  · have h' : ¬ G.Adj w v := fun h' => h (G.adj_symm h')
    simp [h, h']

omit [DecidableEq V] in
private theorem adjSum_add (F H : V → V → ℤ) :
    adjSum G (fun v w => F v w + H v w) = adjSum G F + adjSum G H := by
  unfold adjSum
  rw [← Finset.sum_add_distrib]
  refine Finset.sum_congr rfl fun v _ => ?_
  rw [← Finset.sum_add_distrib]
  refine Finset.sum_congr rfl fun w _ => ?_
  split_ifs <;> simp

omit [DecidableEq V] in
private theorem adjSum_congr {F H : V → V → ℤ} (hFH : ∀ v w, G.Adj v w → F v w = H v w) :
    adjSum G F = adjSum G H := by
  unfold adjSum
  refine Finset.sum_congr rfl fun v _ => Finset.sum_congr rfl fun w _ => ?_
  split_ifs with h
  · exact hFH v w h
  · rfl

omit [DecidableEq V] in
private theorem adjSum_field (a : V → ℤ) (x : Config V) :
    adjSum G (fun v w => a v * (x w).value) = ∑ v, a v * q2rField G x v := by
  unfold adjSum q2rField
  refine Finset.sum_congr rfl fun v _ => ?_
  rw [G.neighborFinset_eq_filter, Finset.sum_filter, Finset.mul_sum]
  refine Finset.sum_congr rfl fun w _ => ?_
  split_ifs <;> simp

omit [DecidableEq V] in
private theorem dart_sum_eq_adjSum (F : V → V → ℤ) :
    ∑ d : G.Dart, F d.fst d.snd = adjSum G F := by
  unfold adjSum
  rw [← Fintype.sum_prod_type' (f := fun v w => if G.Adj v w then F v w else 0)]
  rw [← Finset.sum_filter]
  refine Finset.sum_bij' (fun d _ => (d.fst, d.snd)) (fun p hp => ⟨p, (Finset.mem_filter.1 hp).2⟩)
    ?_ ?_ ?_ ?_ ?_ <;> simp

private theorem two_mul_bond (x : Config V) :
    2 * q2rBond G x = adjSum G (fun v w => (x v).value * (x w).value) := by
  rw [← dart_sum_eq_adjSum]
  unfold q2rBond
  have hmap : ∀ d ∈ (Finset.univ : Finset G.Dart), d.edge ∈ G.edgeFinset := fun d _ => by
    simp
  rw [← Finset.sum_fiberwise_of_maps_to hmap
    (f := fun d : G.Dart => (x d.fst).value * (x d.snd).value)]
  rw [Finset.mul_sum]
  refine Finset.sum_congr rfl fun e he => ?_
  have hcongr : ∀ d ∈ ({d : G.Dart | d.edge = e} : Finset G.Dart),
      (x d.fst).value * (x d.snd).value =
        Sym2.lift ⟨fun a b => (x a).value * (x b).value, fun _ _ => mul_comm _ _⟩ e := by
    intro d hd
    rw [← (Finset.mem_filter.1 hd).2]
    rfl
  rw [Finset.sum_congr rfl hcongr, Finset.sum_const,
    G.dart_edge_fiber_card e (G.mem_edgeFinset.1 he), nsmul_eq_mul]
  push_cast
  ring

omit [DecidableEq V] in
/-- A cell of an independent set has no neighbour in the set, so a step on the set leaves the field
    of each of its cells as it was. -/
private theorem field_eq_of_agree {S : Finset V} (hS : G.IsIndepSet (S : Set V)) {x y : Config V}
    (hxy : ∀ w, w ∉ S → y w = x w) {v : V} (hv : v ∈ S) :
    q2rField G y v = q2rField G x v := by
  unfold q2rField
  refine Finset.sum_congr rfl fun w hw => ?_
  rw [SimpleGraph.mem_neighborFinset] at hw
  have hwS : w ∉ S := fun hwS =>
    hS (Finset.mem_coe.2 hv) (Finset.mem_coe.2 hwS) (G.ne_of_adj hw) hw
  rw [hxy w hwS]

private theorem setStep_off (g : Tone → ℤ → Tone) (S : Finset V) (x : Config V) :
    ∀ w, w ∉ S → q2rSetStep G g S x w = x w := fun w hw => by
  simp [q2rSetStep, hw]

/-- The set step of an involutive local rule on an independent set is an involution. -/
theorem q2rSetStep_involutive (g : Tone → ℤ → Tone) (hg : ∀ h, Involutive (fun t => g t h))
    {S : Finset V} (hS : G.IsIndepSet (S : Set V)) : Involutive (q2rSetStep G g S) := by
  intro x
  funext v
  by_cases hv : v ∈ S
  · have hf := field_eq_of_agree G hS (setStep_off G g S x) hv
    show (if v ∈ S then g (q2rSetStep G g S x v) (q2rField G (q2rSetStep G g S x) v)
      else q2rSetStep G g S x v) = x v
    simp only [hv, ↓reduceIte, hf]
    show g (if v ∈ S then g (x v) (q2rField G x v) else x v) (q2rField G x v) = x v
    simp only [hv, ↓reduceIte]
    exact hg (q2rField G x v) (x v)
  · simp [q2rSetStep, hv]

/-- The bond change of a step on an independent set: `∑_v (s'_v - s_v) h_v`, the fields read
    before the step. -/
private theorem bond_change {S : Finset V} (hS : G.IsIndepSet (S : Set V)) {x y : Config V}
    (hxy : ∀ w, w ∉ S → y w = x w) :
    q2rBond G y - q2rBond G x = ∑ v, ((y v).value - (x v).value) * q2rField G x v := by
  have hy := two_mul_bond G y
  have hx := two_mul_bond G x
  have hsplit : adjSum G (fun v w => (y v).value * (y w).value) =
      adjSum G (fun v w => (x v).value * (x w).value) +
        adjSum G (fun v w => ((y v).value - (x v).value) * (x w).value) +
        adjSum G (fun v w => (x v).value * ((y w).value - (x w).value)) := by
    rw [← adjSum_add, ← adjSum_add]
    refine adjSum_congr G fun v w hvw => ?_
    by_cases hv : v ∈ S
    · have hwS : w ∉ S := fun hwS =>
        hS (Finset.mem_coe.2 hv) (Finset.mem_coe.2 hwS) (G.ne_of_adj hvw) hvw
      rw [hxy w hwS]
      ring
    · rw [hxy v hv]
      ring
  have hswap : adjSum G (fun v w => (x v).value * ((y w).value - (x w).value)) =
      adjSum G (fun v w => ((y v).value - (x v).value) * (x w).value) := by
    rw [adjSum_comm]
    refine adjSum_congr G fun v w _ => ?_
    ring
  have hfield := adjSum_field G (fun v => (y v).value - (x v).value) x
  linarith

/-- A step on an independent set by a local rule that keeps the local energy keeps `E`. -/
theorem q2rEnergy_setStep (J Δ : ℤ) (g : Tone → ℤ → Tone)
    (hg : ∀ t h, q2rLocalEnergy J Δ (g t h) h = q2rLocalEnergy J Δ t h)
    {S : Finset V} (hS : G.IsIndepSet (S : Set V)) (x : Config V) :
    q2rEnergy G J Δ (q2rSetStep G g S x) = q2rEnergy G J Δ x := by
  have hb := bond_change G hS (setStep_off G g S x)
  have hterm : ∀ v, q2rLocalEnergy J Δ (q2rSetStep G g S x v) (q2rField G x v) =
      q2rLocalEnergy J Δ (x v) (q2rField G x v) := by
    intro v
    by_cases hv : v ∈ S
    · show q2rLocalEnergy J Δ (if v ∈ S then g (x v) (q2rField G x v) else x v) _ = _
      simp only [hv, ↓reduceIte]
      exact hg _ _
    · rw [setStep_off G g S x v hv]
  have hsum : ∑ v, (q2rLocalEnergy J Δ (q2rSetStep G g S x v) (q2rField G x v) -
      q2rLocalEnergy J Δ (x v) (q2rField G x v)) =
      -J * ∑ v, ((q2rSetStep G g S x v).value - (x v).value) * q2rField G x v +
        Δ * (∑ v, toneSq (q2rSetStep G g S x v) - ∑ v, toneSq (x v)) := by
    rw [Finset.mul_sum, ← Finset.sum_sub_distrib, Finset.mul_sum, ← Finset.sum_add_distrib]
    refine Finset.sum_congr rfl fun v _ => ?_
    unfold q2rLocalEnergy
    ring
  have hzero : ∑ v, (q2rLocalEnergy J Δ (q2rSetStep G g S x v) (q2rField G x v) -
      q2rLocalEnergy J Δ (x v) (q2rField G x v)) = 0 :=
    Finset.sum_eq_zero fun v _ => by rw [hterm v]; ring
  unfold q2rEnergy
  rw [hsum, ← hb] at hzero
  linarith

/-! ### Rounds -/

private theorem round_cons (g : Tone → ℤ → Tone) (S : Finset V) (s : List (Finset V))
    (x : Config V) : q2rRound G g (S :: s) x = q2rRound G g s (q2rSetStep G g S x) := rfl

private theorem roundBack_cons (g : Tone → ℤ → Tone) (S : Finset V) (s : List (Finset V))
    (x : Config V) : q2rRoundBack G g (S :: s) x = q2rSetStep G g S (q2rRoundBack G g s x) := by
  simp [q2rRoundBack, List.foldl_append]

private theorem roundBack_round (g : Tone → ℤ → Tone) (hg : ∀ h, Involutive (fun t => g t h))
    (s : List (Finset V)) (hs : ∀ S ∈ s, G.IsIndepSet (S : Set V)) (x : Config V) :
    q2rRoundBack G g s (q2rRound G g s x) = x := by
  induction s generalizing x with
  | nil => rfl
  | cons S s ih =>
    rw [round_cons, roundBack_cons,
      ih (fun T hT => hs T (List.mem_cons_of_mem S hT)),
      q2rSetStep_involutive G g hg (hs S List.mem_cons_self)]

private theorem round_roundBack (g : Tone → ℤ → Tone) (hg : ∀ h, Involutive (fun t => g t h))
    (s : List (Finset V)) (hs : ∀ S ∈ s, G.IsIndepSet (S : Set V)) (x : Config V) :
    q2rRound G g s (q2rRoundBack G g s x) = x := by
  induction s generalizing x with
  | nil => rfl
  | cons S s ih =>
    rw [roundBack_cons, round_cons,
      q2rSetStep_involutive G g hg (hs S List.mem_cons_self),
      ih (fun T hT => hs T (List.mem_cons_of_mem S hT))]

private theorem round_energy (J Δ : ℤ) (g : Tone → ℤ → Tone)
    (hg : ∀ t h, q2rLocalEnergy J Δ (g t h) h = q2rLocalEnergy J Δ t h)
    (s : List (Finset V)) (hs : ∀ S ∈ s, G.IsIndepSet (S : Set V)) (x : Config V) :
    q2rEnergy G J Δ (q2rRound G g s x) = q2rEnergy G J Δ x := by
  induction s generalizing x with
  | nil => rfl
  | cons S s ih =>
    rw [round_cons, ih (fun T hT => hs T (List.mem_cons_of_mem S hT)),
      q2rEnergy_setStep G J Δ g hg (hs S List.mem_cons_self)]

/-- The round of an involutive local rule over a schedule of independent sets, as a permutation
    of all configurations with the reverse-order round as its inverse. -/
def q2rRoundPerm (g : Tone → ℤ → Tone) (hg : ∀ h, Involutive (fun t => g t h))
    (s : List (Finset V)) (hs : ∀ S ∈ s, G.IsIndepSet (S : Set V)) : Equiv.Perm (Config V) where
  toFun := q2rRound G g s
  invFun := q2rRoundBack G g s
  left_inv := roundBack_round G g hg s hs
  right_inv := round_roundBack G g hg s hs

/-- **A2, any local rule.** On any finite graph, for any schedule of independent sets and any
    local rule that keeps the local energy at every field and is an involution of the tones at
    every field: each set step is an involution and keeps `E`; the round keeps `E`, is a bijection
    (`q2rRoundPerm`), and the reverse-order round undoes it on both sides. -/
theorem thm_q2r_round_general (J Δ : ℤ) (g : Tone → ℤ → Tone)
    (hE : ∀ t h, q2rLocalEnergy J Δ (g t h) h = q2rLocalEnergy J Δ t h)
    (hI : ∀ h, Involutive (fun t => g t h))
    (s : List (Finset V)) (hs : ∀ S ∈ s, G.IsIndepSet (S : Set V)) :
    (∀ S ∈ s, Involutive (q2rSetStep G g S) ∧
      ∀ x, q2rEnergy G J Δ (q2rSetStep G g S x) = q2rEnergy G J Δ x) ∧
    (∀ x, q2rEnergy G J Δ (q2rRound G g s x) = q2rEnergy G J Δ x) ∧
    Bijective (q2rRound G g s) ∧
    ⇑(q2rRoundPerm G g hI s hs) = q2rRound G g s ∧
    ⇑(q2rRoundPerm G g hI s hs).symm = q2rRoundBack G g s ∧
    (∀ x, q2rRoundBack G g s (q2rRound G g s x) = x) ∧
    (∀ x, q2rRound G g s (q2rRoundBack G g s x) = x) :=
  ⟨fun S hS => ⟨q2rSetStep_involutive G g hI (hs S hS),
      q2rEnergy_setStep G J Δ g hE (hs S hS)⟩,
    round_energy G J Δ g hE s hs,
    (q2rRoundPerm G g hI s hs).bijective,
    rfl, rfl,
    roundBack_round G g hI s hs,
    round_roundBack G g hI s hs⟩

/-- **A2.** The spin-1 Q2R rule: for every integer `J` and `Δ`, on any finite graph and any
    schedule of independent sets, each set step is an involution keeping `E`, and the round keeps
    `E`, is a bijection, and is undone by the reverse-order round. -/
theorem thm_q2r_round (J Δ : ℤ) (s : List (Finset V)) (hs : ∀ S ∈ s, G.IsIndepSet (S : Set V)) :
    (∀ S ∈ s, Involutive (q2rSetStep G (q2rMove J Δ) S) ∧
      ∀ x, q2rEnergy G J Δ (q2rSetStep G (q2rMove J Δ) S x) = q2rEnergy G J Δ x) ∧
    (∀ x, q2rEnergy G J Δ (q2rRound G (q2rMove J Δ) s x) = q2rEnergy G J Δ x) ∧
    Bijective (q2rRound G (q2rMove J Δ) s) ∧
    (∀ x, q2rRoundBack G (q2rMove J Δ) s (q2rRound G (q2rMove J Δ) s x) = x) ∧
    (∀ x, q2rRound G (q2rMove J Δ) s (q2rRoundBack G (q2rMove J Δ) s x) = x) := by
  obtain ⟨h1, h2, h3, -, -, h6, h7⟩ :=
    thm_q2r_round_general G J Δ (q2rMove J Δ) (q2r_move_energy J Δ) (q2r_move_involutive J Δ) s hs
  exact ⟨h1, h2, h3, h6, h7⟩

/-! ### D -/

omit [DecidableEq V] in
private theorem dCount_eq_sum (x : Config V) : dCount x = ∑ v, toneSq (x v) := by
  unfold dCount total
  exact finsum_eq_sum_of_fintype _

/-- A local rule that keeps `t²` keeps `D` under every set step and round (no independence
    needed). -/
private theorem dCount_round_of_sq (g : Tone → ℤ → Tone) (hg : ∀ t h, toneSq (g t h) = toneSq t)
    (s : List (Finset V)) (x : Config V) :
    dCount (q2rRound G g s x) = dCount x ∧ ∀ S, dCount (q2rSetStep G g S x) = dCount x := by
  have hstep : ∀ (S : Finset V) (y : Config V), dCount (q2rSetStep G g S y) = dCount y := by
    intro S y
    rw [dCount_eq_sum, dCount_eq_sum]
    refine Finset.sum_congr rfl fun v _ => ?_
    unfold q2rSetStep
    split_ifs
    · exact hg _ _
    · rfl
  refine ⟨?_, fun S => hstep S x⟩
  induction s generalizing x with
  | nil => rfl
  | cons S s ih => rw [round_cons, ih, hstep]

/-- **A2, `Δ = 0`.** The C-symmetric rule keeps `t²` at `Δ = 0` for every `J`, so every set step
    and every round keeps `D = ∑ s²` on any finite graph, schedule and configuration. -/
theorem thm_q2r_delta_zero_keeps_d (J : ℤ) :
    (∀ t h, toneSq (q2rMove J 0 t h) = toneSq t) ∧
    ∀ (s : List (Finset V)) (x : Config V),
      dCount (q2rRound G (q2rMove J 0) s x) = dCount x ∧
      ∀ S, dCount (q2rSetStep G (q2rMove J 0) S x) = dCount x := by
  have hsq : ∀ t h, toneSq (q2rMove J 0 t h) = toneSq t := by
    intro t h
    cases t <;> simp only [q2rMove] <;> split_ifs <;> simp_all [toneSq, Tone.value]
  exact ⟨hsq, fun s x => dCount_round_of_sq G (q2rMove J 0) hsq s x⟩

omit [Fintype V] [DecidableEq V] [DecidableRel G.Adj] in
/-- **A2, chirality at `Δ = 0`.** With `J ≠ 0` and `Δ = 0`, every local rule that keeps the local
    energy, permutes the tones at every field and commutes with negation keeps `t²`. So a local rule
    that changes `D` at `Δ = 0` must break `s ↦ -s` (it is chiral): `f(0) = f(-0) = -f(0)` forces the
    fully degenerate cell (`h = 0`) to keep `0`. -/
theorem thm_q2r_delta_zero_chiral (J : ℤ) (hJ : J ≠ 0) (g : Tone → ℤ → Tone)
    (hE : ∀ t h, q2rLocalEnergy J 0 (g t h) h = q2rLocalEnergy J 0 t h)
    (hP : ∀ h, Injective (fun t => g t h))
    (hC : ∀ t h, g t.dual (-h) = (g t h).dual) :
    ∀ t h, toneSq (g t h) = toneSq t := by
  intro t h
  by_cases h0 : h = 0
  · subst h0
    have hz : g .zero 0 = .zero := by
      have := hC .zero 0
      simp only [Tone.dual, neg_zero] at this
      revert this
      cases g .zero 0 <;> simp
    cases t with
    | zero => rw [hz]
    | pos =>
      have hne : g .pos 0 ≠ .zero := fun he => by
        have := hP 0 (he.trans hz.symm)
        cases this
      revert hne
      cases g .pos 0 <;> simp [toneSq, Tone.value]
    | neg =>
      have hne : g .neg 0 ≠ .zero := fun he => by
        have := hP 0 (he.trans hz.symm)
        cases this
      revert hne
      cases g .neg 0 <;> simp [toneSq, Tone.value]
  · have hv : (g t h).value = t.value := by
      have := hE t h
      simp only [q2rLocalEnergy, zero_mul, add_zero] at this
      have hJh : J * h ≠ 0 := mul_ne_zero hJ h0
      have : (J * h) * ((g t h).value - t.value) = 0 := by linarith
      rcases mul_eq_zero.1 this with h1 | h1
      · exact absurd h1 hJh
      · linarith
    unfold toneSq
    rw [hv]

/-! ### A3: odd degree and the vacancy move -/

omit [DecidableEq V] in
/-- The field is bounded by the degree. -/
private theorem abs_field_le (x : Config V) (v : V) : |q2rField G x v| ≤ G.degree v := by
  unfold q2rField
  calc |∑ w ∈ G.neighborFinset v, (x w).value|
      ≤ ∑ w ∈ G.neighborFinset v, |(x w).value| := Finset.abs_sum_le_sum_abs _ _
    _ ≤ ∑ _w ∈ G.neighborFinset v, (1 : ℤ) :=
        Finset.sum_le_sum fun w _ => by cases x w <;> simp [Tone.value]
    _ = G.degree v := by simp [G.card_neighborFinset_eq_degree]

/-- With no vacancy among the neighbours, the field has the parity of the degree. -/
private theorem field_even_iff (x : Config V) (hx : ∀ w, x w ≠ .zero) (v : V) :
    Even (q2rField G x v) ↔ Even (G.degree v) := by
  unfold q2rField
  rw [← G.card_neighborFinset_eq_degree]
  induction G.neighborFinset v using Finset.induction_on with
  | empty => simp
  | insert a s ha ih =>
    rw [Finset.sum_insert ha, Finset.card_insert_of_notMem ha, Int.even_add, ih,
      Nat.even_add_one]
    have hodd : ¬ Even (x a).value := by
      have := hx a
      cases h : x a <;> simp_all [Tone.value]
    tauto

/-- **A3, the Ising limit is frozen on odd degree.** On a graph whose every degree is odd, with
    `J ≠ 0` and no vacancy move available (`J k ≠ Δ` for every integer `k` of size at most the
    degree), a configuration without a vacancy is a fixed point of every set step (independent or
    not) and of every round: every field is odd, so no cell is degenerate. -/
theorem thm_q2r_odd_degree_frozen (J Δ : ℤ) (hJ : J ≠ 0) (hodd : ∀ v, Odd (G.degree v))
    (hvac : ∀ v (k : ℤ), |k| ≤ G.degree v → J * k ≠ Δ)
    (x : Config V) (hx : ∀ v, x v ≠ .zero) :
    (∀ S, q2rSetStep G (q2rMove J Δ) S x = x) ∧
    ∀ s n, (q2rRound G (q2rMove J Δ) s)^[n] x = x := by
  have hstep : ∀ S, q2rSetStep G (q2rMove J Δ) S x = x := by
    intro S
    funext v
    unfold q2rSetStep
    split_ifs
    · have hne : q2rField G x v ≠ 0 := fun h0 => by
        have he : Even (q2rField G x v) := by rw [h0]; exact ⟨0, (add_zero 0).symm⟩
        exact (Nat.not_even_iff_odd.2 (hodd v)) ((field_even_iff G x hx v).1 he)
      have hJh : J * q2rField G x v ≠ 0 := mul_ne_zero hJ hne
      have hb := abs_field_le G x v
      have h1 := hvac v (q2rField G x v) hb
      have h2 := hvac v (-q2rField G x v) (by rwa [abs_neg])
      have := hx v
      cases h : x v with
      | zero => exact absurd h this
      | pos =>
        have h3 : ¬ (-(J * q2rField G x v) + Δ = 0) := fun h3 => h1 (by linarith)
        simp only [q2rMove, hJh, h3, ↓reduceIte]
      | neg =>
        have h3 : ¬ (J * q2rField G x v + Δ = 0) := fun h3 => h2 (by linarith)
        simp only [q2rMove, hJh, h3, ↓reduceIte]
    · rfl
  refine ⟨hstep, fun s n => ?_⟩
  have hround : q2rRound G (q2rMove J Δ) s x = x := by
    unfold q2rRound
    induction s with
    | nil => rfl
    | cons S s ih => simp only [List.foldl_cons, hstep S]; exact ih
  exact Function.iterate_fixed hround n

/-- **A3, the vacancy move.** A `q2rMove` that changes `t²` at a cell needs `Δ = J k` for an
    integer `k` (namely `±h`) of size at most the cell's degree. When no cell has such a `k`, every
    set step and every round keeps `D`, on any configuration and schedule. -/
theorem thm_q2r_vacancy_needs_ratio (J Δ : ℤ) :
    (∀ (x : Config V) v t, toneSq (q2rMove J Δ t (q2rField G x v)) ≠ toneSq t →
      ∃ k : ℤ, Δ = J * k ∧ |k| ≤ G.degree v) ∧
    ((∀ v (k : ℤ), |k| ≤ G.degree v → Δ ≠ J * k) →
      ∀ (s : List (Finset V)) (x : Config V),
        dCount (q2rRound G (q2rMove J Δ) s x) = dCount x ∧
        ∀ S, dCount (q2rSetStep G (q2rMove J Δ) S x) = dCount x) := by
  have hloc : ∀ (x : Config V) v t, toneSq (q2rMove J Δ t (q2rField G x v)) ≠ toneSq t →
      ∃ k : ℤ, Δ = J * k ∧ |k| ≤ G.degree v := by
    intro x v t hne
    have hb := abs_field_le G x v
    set h := q2rField G x v
    have key : J * h = Δ ∨ J * h = -Δ := by
      cases t <;> simp only [q2rMove] at hne <;> split_ifs at hne <;>
        simp_all [toneSq, Tone.value] <;> omega
    rcases key with k1 | k1
    · exact ⟨h, k1.symm, hb⟩
    · exact ⟨-h, by linarith, by rwa [abs_neg]⟩
  refine ⟨hloc, fun hno s x => ?_⟩
  -- every set step keeps `D` along the schedule, cell by cell
  have hstep : ∀ (S : Finset V) (y : Config V),
      dCount (q2rSetStep G (q2rMove J Δ) S y) = dCount y := by
    intro S y
    rw [dCount_eq_sum, dCount_eq_sum]
    refine Finset.sum_congr rfl fun v _ => ?_
    unfold q2rSetStep
    split_ifs
    · by_contra hne
      obtain ⟨k, hk, hkb⟩ := hloc y v (y v) hne
      exact hno v k hkb hk
    · rfl
  refine ⟨?_, fun S => hstep S x⟩
  induction s generalizing x with
  | nil => rfl
  | cons S s ih => rw [round_cons, ih, hstep]

/-! ### The link to spin-one-q2r.ts -/

/-- The exported family: `J ∈ 1..3`, `Δ ∈ -12..12`, `h ∈ -12..12`, `h` innermost. -/
def q2rFamily : List (ℤ × ℤ × ℤ) :=
  (List.range 3).flatMap fun j => (List.range 25).flatMap fun d => (List.range 25).map fun k =>
    ((j : ℤ) + 1, (d : ℤ) - 12, (k : ℤ) - 12)

/-- The code of a tone: `t + 1`. -/
def q2rToneCode : Tone → ℕ
  | .neg => 0
  | .zero => 1
  | .pos => 2

/-- The exporter's code of one `(J, Δ, h)`: `(move(-1) + 1) + 3 (move(0) + 1) + 9 (move(+1) + 1)`. -/
def q2rMoveCode (J Δ h : ℤ) : ℕ :=
  q2rToneCode (q2rMove J Δ .neg h) + 3 * q2rToneCode (q2rMove J Δ .zero h) +
    9 * q2rToneCode (q2rMove J Δ .pos h)

/-- Bridge for `q2rMoveCodes`: the TypeScript `q2rMove` on every tone, `J ∈ 1..3` and
    `Δ, h ∈ -12..12` is the Lean `q2rMove` (the exporter writes the three images of one
    `(J, Δ, h)` as one base-3 code, and the code determines the three tones). The equality holds on
    this exported family; the theorems above speak about the Lean `q2rMove` on all integers. -/
theorem gen_q2r_move_eq :
    Generated.q2rMoveCodes = q2rFamily.map (fun p => q2rMoveCode p.1 p.2.1 p.2.2) ∧
    q2rFamily.length = 1875 ∧
    ∀ a b c a' b' c' : Tone, q2rToneCode a + 3 * q2rToneCode b + 9 * q2rToneCode c =
      q2rToneCode a' + 3 * q2rToneCode b' + 9 * q2rToneCode c' → a = a' ∧ b = b' ∧ c = c' := by
  refine ⟨by decide +kernel, by decide +kernel, ?_⟩
  intro a b c a' b' c'
  cases a <;> cases b <;> cases c <;> cases a' <;> cases b' <;> cases c' <;> decide

end Compute

end Vibe
