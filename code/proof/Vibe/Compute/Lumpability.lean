import Mathlib.Logic.Equiv.Basic
import Mathlib.Logic.Function.Iterate
import Mathlib.Data.Fintype.Card
import Mathlib.Algebra.Group.Action.Defs
import Vibe.Compute.Round
import Vibe.Compute.PairRuleLink
import Vibe.Generated.Lumpability
import Vibe.Generated.PartitionedRing

/-!
# Vibe Computation Lab: Lumpability of Block Maps (M11)

Lean track item L11 (lean-track.md, claims A26 and A27). A coarse reading `F` of a dynamics `φ`
is **lumpable** at `τ` steps when `F (φ^τ x)` is a function of `F x` over every configuration.

Headline theorems:
1. `thm_lump_iff_no_conflict` (A26, abstract): lumpable exactly when no two configurations share
   a coarse image and have two coarse futures. A conflict rules out every coarse rule `G`, so no
   coarse radius rescues it.
2. `thm_lump_window_conflict` (A26, windows): for any block-local reading and any dynamics whose
   coarse cell `j0` after `τ` steps reads only the blocks of a window `W`, two fine windows with
   one coarse window and two coarse center futures, padded identically outside, are two whole
   configurations with one coarse image and two coarse futures, so `F` is not lumpable.
3. `thm_lump_round_window_conflict` (A26, rounds): the same for the round of any pair rule on any
   graph and schedule, with the window hypothesis discharged by the backward light cone
   `iterCone` (a step at `v` reads only `v` and its mate).
4. `thm_lump_lone_hypotheses_of_charge` and `thm_lump_lone_rule_dichotomy` (A27 setup and step 1):
   a charge-keeping bijective rule fixing the vacuum (background `0`, any `u ≠ 0`) or any
   charge-keeping bijective rule (background `±1`, `u = 0`) fixes the background pair and acts on
   the two one-excitation pairs as the identity or the swap.
5. `thm_lump_lone_track` (A27 step 1): a lone excitation never moves, or after `τ` rounds sits at
   `P^τ a`, `P = matePath s` the product of the round's matchings; the orientation never enters
   (`thm_lump_mate_path_orientation_free`).
6. `thm_lump_lone_split_nogo` (A27 step 2): a reading that sees one lone excitation in a block as
   a letter other than the background's, and a `P^τ` that sends two cells of one block into
   different blocks, give a conflict: no effective rule at any coarse radius, on any graph.
7. `thm_lump_full_swap_transport` (A27 step 3): the full swap's round is the state-independent
   relabelling `x ↦ x ∘ pullPath^τ`; under a block reading that ignores the order inside a block
   (finite blocks of one shape), it is lumpable when `P^τ` splits no block, with the transport
   `G` as rule, and lumpable exactly then when the reading sees a lone excitation.
8. `thm_lump_split_decided_by_quotient` (A27 step 4): when every matching commutes with a group
   `N` of deck transformations and the blocks are `N`-invariant, `P^τ` commutes with `N` and
   whether it splits a block is decided on one block per `N`-orbit.

Step 5 (no `P^τ` commutes with every colour matching on a hyperbolic `{p,q}`, by Zariski density)
is deferred (lean-track.md section 7, claim A28) and is not claimed here.

These theorems speak about the Lean definitions of `Vibe.Compute.Round` (decision 008 point 3).
Mathlib, zero `sorry`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open Function

section Lump

/-- A coarse reading `F` is lumpable at `τ` steps of `φ` when some coarse rule `G` gives the
    coarse image after `τ` steps from the coarse image now, on every configuration. `G` is any
    function, so this covers every coarse radius. -/
def Lumpable {X A : Type*} (φ : X → X) (τ : Nat) (F : X → A) : Prop :=
  ∃ G : A → A, ∀ x, F (φ^[τ] x) = G (F x)

/-- **A26, abstract.** Lumpable exactly when no two configurations share a coarse image and have
    two coarse futures. -/
theorem thm_lump_iff_no_conflict {X A : Type*} (φ : X → X) (τ : Nat) (F : X → A) :
    Lumpable φ τ F ↔ ∀ x y, F x = F y → F (φ^[τ] x) = F (φ^[τ] y) := by
  constructor
  · rintro ⟨G, hG⟩ x y h
    rw [hG, hG, h]
  · intro h
    classical
    refine ⟨fun a => if hx : ∃ x, F x = a then F (φ^[τ] hx.choose) else a, fun x => ?_⟩
    have hx : ∃ y, F y = F x := ⟨x, rfl⟩
    simp only [hx, ↓reduceDIte]
    exact h x _ (Eq.symm (Exists.choose_spec (p := fun y => F y = F x) _))

open Classical in
/-- A fine window `w` on the blocks of `W`, padded by `pad` outside. -/
noncomputable def patch {V J : Type*} (blockOf : V → J) (W : Set J) (w pad : Config V) :
    Config V :=
  fun v => if blockOf v ∈ W then w v else pad v

private theorem patch_in {V J : Type*} (blockOf : V → J) (W : Set J) (w pad : Config V) (v : V)
    (h : blockOf v ∈ W) : patch blockOf W w pad v = w v := by
  simp only [patch, h, ↓reduceIte]

private theorem patch_out {V J : Type*} (blockOf : V → J) (W : Set J) (w pad : Config V) (v : V)
    (h : blockOf v ∉ W) : patch blockOf W w pad v = pad v := by
  simp only [patch, h, ↓reduceIte]

/-- **A26, windows.** Let `F` read each coarse cell `j` from the fine cells of block `j` only, and
    let the coarse cell `j0` after `τ` steps of `φ` depend only on the fine cells of the blocks of
    a window `W`. Two fine windows `w1`, `w2` with one coarse window and two coarse center futures,
    padded identically outside `W` by any `pad`, are two configurations with one coarse image and
    two coarse futures, so `F` is not lumpable at `τ`: no coarse rule exists at any radius. -/
theorem thm_lump_window_conflict {V J A : Type*} (φ : Config V → Config V) (τ : Nat)
    (blockOf : V → J) (F : Config V → J → A)
    (hloc : ∀ x y j, (∀ v, blockOf v = j → x v = y v) → F x j = F y j)
    (W : Set J) (j0 : J)
    (hcone : ∀ x y, (∀ v, blockOf v ∈ W → x v = y v) → F (φ^[τ] x) j0 = F (φ^[τ] y) j0)
    (w1 w2 : Config V) (hc : ∀ j ∈ W, F w1 j = F w2 j)
    (hd : F (φ^[τ] w1) j0 ≠ F (φ^[τ] w2) j0) (pad : Config V) :
    F (patch blockOf W w1 pad) = F (patch blockOf W w2 pad) ∧
    F (φ^[τ] (patch blockOf W w1 pad)) j0 ≠ F (φ^[τ] (patch blockOf W w2 pad)) j0 ∧
    ¬ Lumpable φ τ F := by
  have himg : F (patch blockOf W w1 pad) = F (patch blockOf W w2 pad) := by
    funext j
    by_cases hj : j ∈ W
    · rw [hloc (patch blockOf W w1 pad) w1 j
          (fun v hv => patch_in blockOf W w1 pad v (hv ▸ hj)),
        hloc (patch blockOf W w2 pad) w2 j
          (fun v hv => patch_in blockOf W w2 pad v (hv ▸ hj)), hc j hj]
    · apply hloc
      intro v hv
      rw [patch_out blockOf W w1 pad v (hv ▸ hj), patch_out blockOf W w2 pad v (hv ▸ hj)]
  have hfut : F (φ^[τ] (patch blockOf W w1 pad)) j0 ≠ F (φ^[τ] (patch blockOf W w2 pad)) j0 := by
    rw [hcone (patch blockOf W w1 pad) w1 (fun v hv => patch_in blockOf W w1 pad v hv),
      hcone (patch blockOf W w2 pad) w2 (fun v hv => patch_in blockOf W w2 pad v hv)]
    exact hd
  refine ⟨himg, hfut, fun hL => hfut ?_⟩
  obtain ⟨G, hG⟩ := hL
  rw [hG, hG, himg]

end Lump

section Cone

variable {V : Type*}

/-- The cells a step must agree on for its result to agree on `T`: `T` and the mates of `T`. -/
def stepPre (M : Matching V) (T : Set V) : Set V := {v | v ∈ T ∨ M.mate v ∈ T}

/-- The backward light cone of `T` through one round (the first matching acts first). -/
def roundCone (s : Schedule V) (T : Set V) : Set V := s.foldr (fun M T => stepPre M T) T

/-- The backward light cone of `T` through `τ` rounds. -/
def iterCone (s : Schedule V) (τ : Nat) (T : Set V) : Set V := (roundCone s)^[τ] T

variable [DecidableEq V]

private theorem step_agree (M : Matching V) (f : Pair → Pair) (T : Set V) (x y : Config V)
    (h : ∀ v ∈ stepPre M T, x v = y v) : ∀ v ∈ T, M.step f x v = M.step f y v := by
  intro v hv
  have h1 : x v = y v := h v (Or.inl hv)
  have h2 : x (M.mate v) = y (M.mate v) :=
    h (M.mate v) (Or.inr (by rw [M.mate_mate]; exact hv))
  unfold Matching.step
  rw [h1, h2]

private theorem round_agree (f : Pair → Pair) (s : Schedule V) (T : Set V) (x y : Config V)
    (h : ∀ v ∈ roundCone s T, x v = y v) : ∀ v ∈ T, round f s x v = round f s y v := by
  induction s generalizing x y with
  | nil => exact h
  | cons M s ih =>
    exact ih (M.step f x) (M.step f y) (step_agree M f (roundCone s T) x y h)

private theorem iter_agree (f : Pair → Pair) (s : Schedule V) (τ : Nat) (T : Set V)
    (x y : Config V) (h : ∀ v ∈ iterCone s τ T, x v = y v) :
    ∀ v ∈ T, (round f s)^[τ] x v = (round f s)^[τ] y v := by
  induction τ generalizing T with
  | zero => exact h
  | succ n ih =>
    intro v hv
    rw [iterate_succ_apply', iterate_succ_apply']
    refine round_agree f s T _ _ (ih (roundCone s T) ?_) v hv
    intro w hw
    apply h
    unfold iterCone
    rw [iterate_succ_apply]
    exact hw

/-- **A26, rounds.** For the round of any pair rule on any graph and schedule, any block-local
    reading `F`, and any window `W` whose blocks hold the backward light cone of block `j0`
    through `τ` rounds: two fine windows with one coarse window and two coarse center futures,
    padded identically outside, are two configurations with one coarse image and two coarse
    futures, so `F` is not lumpable at `τ`, at any coarse radius. On the line with `c` matchings
    per round and blocks of `b` cells, the cone of one block lies in the `2R + 1` blocks around
    it with `R = ⌈τ c / b⌉`, the window of m11. -/
theorem thm_lump_round_window_conflict {J A : Type*} (f : Pair → Pair) (s : Schedule V)
    (τ : Nat) (blockOf : V → J) (F : Config V → J → A)
    (hloc : ∀ x y j, (∀ v, blockOf v = j → x v = y v) → F x j = F y j)
    (W : Set J) (j0 : J) (hW : iterCone s τ {v | blockOf v = j0} ⊆ {v | blockOf v ∈ W})
    (w1 w2 : Config V) (hc : ∀ j ∈ W, F w1 j = F w2 j)
    (hd : F ((round f s)^[τ] w1) j0 ≠ F ((round f s)^[τ] w2) j0) (pad : Config V) :
    F (patch blockOf W w1 pad) = F (patch blockOf W w2 pad) ∧
    F ((round f s)^[τ] (patch blockOf W w1 pad)) j0 ≠
      F ((round f s)^[τ] (patch blockOf W w2 pad)) j0 ∧
    ¬ Lumpable (round f s) τ F :=
  thm_lump_window_conflict (round f s) τ blockOf F hloc W j0
    (fun x y hxy => hloc _ _ j0 fun v hv =>
      iter_agree f s τ {v | blockOf v = j0} x y (fun w hw => hxy w (hW hw)) v hv)
    w1 w2 hc hd pad

end Cone

section Lone

variable {V : Type*}

/-- The forward lone track through one round: the cell is carried by each matching in order. -/
def matePath (s : Schedule V) (a : V) : V := s.foldl (fun b M => M.mate b) a

/-- The backward track: the inverse of `matePath`. -/
def pullPath (s : Schedule V) (v : V) : V := s.foldr (fun M w => M.mate w) v

/-- `matePath` reads only the mates of the schedule, never the orientation. -/
private theorem matePath_eq_map (s : Schedule V) (a : V) :
    matePath s a = (s.map Matching.mate).foldl (fun b m => m b) a := by
  unfold matePath
  rw [List.foldl_map]

private theorem pull_mate (s : Schedule V) (a : V) : pullPath s (matePath s a) = a := by
  induction s generalizing a with
  | nil => rfl
  | cons M s ih =>
    show M.mate (pullPath s (matePath s (M.mate a))) = a
    rw [ih, M.mate_mate]

private theorem mate_pull (s : Schedule V) (v : V) : matePath s (pullPath s v) = v := by
  induction s generalizing v with
  | nil => rfl
  | cons M s ih =>
    show matePath s (M.mate (M.mate (pullPath s v))) = v
    rw [M.mate_mate, ih]

private theorem lump_mate_ne (M : Matching V) (v : V) (h : M.mate v ≠ v) :
    M.mate (M.mate v) ≠ M.mate v := by
  rw [M.mate_mate]
  exact fun e => h e.symm

/-- **A27 step 1, orientation.** Two schedules with the same matchings in the same order and any
    orientations have the same lone track. -/
theorem thm_lump_mate_path_orientation_free (s s' : Schedule V)
    (h : s.map Matching.mate = s'.map Matching.mate) : matePath s = matePath s' := by
  funext a
  rw [matePath_eq_map, matePath_eq_map, h]

variable [DecidableEq V]

/-- One excitation `u` at `a` on the background `β`. -/
def lone (β u : Tone) (a : V) : Config V := fun v => if v = a then u else β

/-- A step whose rule swaps every matched pair of `x` relabels `x` by the mate. -/
private theorem step_of_swaps (M : Matching V) (f : Pair → Pair) (x : Config V)
    (h : ∀ v, M.mate v ≠ v → f (x v, x (M.mate v)) = (x (M.mate v), x v)) :
    M.step f x = fun v => x (M.mate v) := by
  funext v
  by_cases hv : M.mate v = v
  · simp only [Matching.step, hv, ↓reduceIte]
  · cases hl : M.lead v with
    | true =>
      simp only [Matching.step, hv, hl, ↓reduceIte]
      rw [h v hv]
    | false =>
      simp only [Matching.step, hv, hl, Bool.false_eq_true, ↓reduceIte]
      have := h (M.mate v) (lump_mate_ne M v hv)
      rw [M.mate_mate] at this
      rw [this]

/-- A step whose rule fixes every matched pair of `x` fixes `x`. -/
private theorem step_of_fixes (M : Matching V) (f : Pair → Pair) (x : Config V)
    (h : ∀ v, M.mate v ≠ v → f (x v, x (M.mate v)) = (x v, x (M.mate v))) :
    M.step f x = x := by
  funext v
  by_cases hv : M.mate v = v
  · simp only [Matching.step, hv, ↓reduceIte]
  · cases hl : M.lead v with
    | true =>
      simp only [Matching.step, hv, hl, ↓reduceIte]
      rw [h v hv]
    | false =>
      simp only [Matching.step, hv, hl, Bool.false_eq_true, ↓reduceIte]
      have := h (M.mate v) (lump_mate_ne M v hv)
      rw [M.mate_mate] at this
      rw [this]

private theorem lone_at (β u : Tone) (a : V) : lone β u a a = u := by
  simp [lone]

private theorem lone_off (β u : Tone) (a v : V) (h : v ≠ a) : lone β u a v = β := by
  simp [lone, h]

private theorem lone_pair (M : Matching V) (β u : Tone) (a : V) (v : V)
    (hv : M.mate v ≠ v) (P : Pair → Prop) (hbb : P (β, β)) (hub : P (u, β)) (hbu : P (β, u)) :
    P (lone β u a v, lone β u a (M.mate v)) := by
  by_cases h1 : v = a
  · subst h1
    rw [lone_at, lone_off β u v _ hv]
    exact hub
  · by_cases h2 : M.mate v = a
    · rw [lone_off β u a v h1, h2, lone_at]
      exact hbu
    · rw [lone_off β u a v h1, lone_off β u a _ h2]
      exact hbb

private theorem lone_comp_mate (M : Matching V) (β u : Tone) (a : V) :
    (fun v => lone β u a (M.mate v)) = lone β u (M.mate a) := by
  funext v
  by_cases h : v = M.mate a
  · rw [h, M.mate_mate, lone_at, lone_at]
  · rw [lone_off β u _ v h, lone_off β u a _ (fun e => h (by rw [← e, M.mate_mate]))]

private theorem round_lone_swap (f : Pair → Pair) (β u : Tone) (hbb : f (β, β) = (β, β))
    (hub : f (u, β) = (β, u)) (hbu : f (β, u) = (u, β)) (s : Schedule V) (a : V) :
    round f s (lone β u a) = lone β u (matePath s a) := by
  induction s generalizing a with
  | nil => rfl
  | cons M s ih =>
    show round f s (M.step f (lone β u a)) = lone β u (matePath s (M.mate a))
    rw [step_of_swaps M f _ (fun v hv => lone_pair M β u a v hv
      (fun p => f p = (p.2, p.1)) hbb hub hbu), lone_comp_mate, ih]

private theorem round_lone_fix (f : Pair → Pair) (β u : Tone) (hbb : f (β, β) = (β, β))
    (hub : f (u, β) = (u, β)) (hbu : f (β, u) = (β, u)) (s : Schedule V) (a : V) :
    round f s (lone β u a) = lone β u a := by
  induction s with
  | nil => rfl
  | cons M s ih =>
    show round f s (M.step f (lone β u a)) = lone β u a
    rw [step_of_fixes M f _ (fun v hv => lone_pair M β u a v hv
      (fun p => f p = p) hbb hub hbu), ih]

private theorem iter_lone_swap (f : Pair → Pair) (β u : Tone) (hbb : f (β, β) = (β, β))
    (hub : f (u, β) = (β, u)) (hbu : f (β, u) = (u, β)) (s : Schedule V) (τ : Nat) (a : V) :
    (round f s)^[τ] (lone β u a) = lone β u ((matePath s)^[τ] a) := by
  induction τ generalizing a with
  | zero => rfl
  | succ n ih =>
    rw [iterate_succ_apply, iterate_succ_apply, round_lone_swap f β u hbb hub hbu, ih]

private theorem iter_lone_fix (f : Pair → Pair) (β u : Tone) (hbb : f (β, β) = (β, β))
    (hub : f (u, β) = (u, β)) (hbu : f (β, u) = (β, u)) (s : Schedule V) (τ : Nat) (a : V) :
    (round f s)^[τ] (lone β u a) = lone β u a := by
  induction τ with
  | zero => rfl
  | succ n ih =>
    rw [iterate_succ_apply', ih, round_lone_fix f β u hbb hub hbu]

/-- **A27 step 1, the rule.** A pair rule that is injective and maps the two one-excitation
    pairs `(u, β)`, `(β, u)` (with `u ≠ β`) into that two-element set acts on it as the identity
    or as the swap. -/
theorem thm_lump_lone_rule_dichotomy (f : Pair → Pair) (hI : PrInj f) (β u : Tone)
    (huβ : u ≠ β) (h1 : f (u, β) = (u, β) ∨ f (u, β) = (β, u))
    (h2 : f (β, u) = (u, β) ∨ f (β, u) = (β, u)) :
    (f (u, β) = (u, β) ∧ f (β, u) = (β, u)) ∨ (f (u, β) = (β, u) ∧ f (β, u) = (u, β)) := by
  have hne : ((u, β) : Pair) ≠ (β, u) := fun e => huβ (Prod.mk.inj e).1
  rcases h1 with h1 | h1 <;> rcases h2 with h2 | h2
  · exact absurd (hI _ _ (h1.trans h2.symm)) hne
  · exact Or.inl ⟨h1, h2⟩
  · exact Or.inr ⟨h1, h2⟩
  · exact absurd (hI _ _ (h1.trans h2.symm)) hne

private theorem fiber_one : ∀ (β u a b : Tone), u ≠ β → (β = .zero ∨ u = .zero) →
    prSum (a, b) = prSum (u, β) → (a, b) = (u, β) ∨ (a, b) = (β, u) := by
  intro β u a b
  cases β <;> cases u <;> cases a <;> cases b <;> decide

private theorem fiber_two : ∀ (β a b : Tone), β ≠ .zero →
    prSum (a, b) = prSum (β, β) → (a, b) = (β, β) := by
  intro β a b
  cases β <;> cases a <;> cases b <;> decide

/-- **A27 hypotheses from charge.** A charge-keeping injective pair rule fixes the background pair
    and acts on the two one-excitation pairs as the identity or the swap, for the background `0`
    and any `u ≠ 0` when it fixes the vacuum pair, and for the background `±1` and `u = 0`
    always. -/
theorem thm_lump_lone_hypotheses_of_charge (f : Pair → Pair) (hS : PrSumPres f) (hI : PrInj f)
    (β u : Tone)
    (hcase : (β = .zero ∧ u ≠ .zero ∧ f prVac = prVac) ∨ (β ≠ .zero ∧ u = .zero)) :
    f (β, β) = (β, β) ∧ u ≠ β ∧
    ((f (u, β) = (u, β) ∧ f (β, u) = (β, u)) ∨ (f (u, β) = (β, u) ∧ f (β, u) = (u, β))) := by
  have huβ : u ≠ β := by
    rcases hcase with ⟨hb, hu, _⟩ | ⟨hb, hu⟩
    · rw [hb]; exact hu
    · rw [hu]; exact fun e => hb e.symm
  have hz : β = .zero ∨ u = .zero := by
    rcases hcase with ⟨hb, _, _⟩ | ⟨_, hu⟩
    · exact Or.inl hb
    · exact Or.inr hu
  have hbb : f (β, β) = (β, β) := by
    rcases hcase with ⟨hb, _, hv⟩ | ⟨hb, _⟩
    · rw [hb]; exact hv
    · have := fiber_two β (f (β, β)).1 (f (β, β)).2 hb (hS (β, β))
      rwa [Prod.mk.eta] at this
  have hsym : prSum (β, u) = prSum (u, β) := by
    show β.value + u.value = u.value + β.value
    omega
  have h1 := fiber_one β u (f (u, β)).1 (f (u, β)).2 huβ hz (hS (u, β))
  have h2 := fiber_one β u (f (β, u)).1 (f (β, u)).2 huβ hz ((hS (β, u)).trans hsym)
  rw [Prod.mk.eta] at h1 h2
  exact ⟨hbb, huβ, thm_lump_lone_rule_dichotomy f hI β u huβ h1 h2⟩

/-- **A27 step 1, the track.** On any graph and schedule, for a pair rule that fixes the
    background pair `(β, β)` and acts on the one-excitation pairs as the identity or the swap, a
    lone `u` either never moves, or after `τ` rounds sits at `P^τ a` with `P = matePath s` the
    product of the round's matchings in order. The track is the same for every orientation of
    the schedule (`thm_lump_mate_path_orientation_free`). -/
theorem thm_lump_lone_track (f : Pair → Pair) (s : Schedule V) (β u : Tone)
    (hbb : f (β, β) = (β, β))
    (hdich : (f (u, β) = (u, β) ∧ f (β, u) = (β, u)) ∨ (f (u, β) = (β, u) ∧ f (β, u) = (u, β))) :
    ∃ P : V → V, (P = id ∨ P = matePath s) ∧
      ∀ τ a, (round f s)^[τ] (lone β u a) = lone β u (P^[τ] a) := by
  rcases hdich with ⟨hub, hbu⟩ | ⟨hub, hbu⟩
  · refine ⟨id, Or.inl rfl, fun τ a => ?_⟩
    rw [iterate_id, iter_lone_fix f β u hbb hub hbu]
    rfl
  · exact ⟨matePath s, Or.inr rfl, fun τ a => iter_lone_swap f β u hbb hub hbu s τ a⟩

/-- **A27 step 2, the no-go.** On any graph and schedule, let a pair rule fix the background pair
    and swap the two one-excitation pairs (a lone `u` moves), and let a coarse reading `F` read a
    block holding one `u` as `t1` and a background block as `t0 ≠ t1`. If `P^τ` sends two cells
    `a`, `b` of one block into different blocks, the two lone configurations have one coarse
    image and two coarse futures, so `F` is not lumpable at `τ`, at any coarse radius. -/
theorem thm_lump_lone_split_nogo {J A : Type*} [DecidableEq J] (f : Pair → Pair)
    (s : Schedule V) (τ : Nat) (β u : Tone) (hbb : f (β, β) = (β, β))
    (hub : f (u, β) = (β, u)) (hbu : f (β, u) = (u, β)) (blockOf : V → J)
    (F : Config V → J → A) (t0 t1 : A) (ht : t1 ≠ t0)
    (hread : ∀ a j, F (lone β u a) j = if blockOf a = j then t1 else t0)
    (a b : V) (hab : blockOf a = blockOf b)
    (hsplit : blockOf ((matePath s)^[τ] a) ≠ blockOf ((matePath s)^[τ] b)) :
    F (lone β u a) = F (lone β u b) ∧
    F ((round f s)^[τ] (lone β u a)) ≠ F ((round f s)^[τ] (lone β u b)) ∧
    ¬ Lumpable (round f s) τ F := by
  have himg : F (lone β u a) = F (lone β u b) := by
    funext j
    rw [hread, hread, hab]
  have hfut : F ((round f s)^[τ] (lone β u a)) ≠ F ((round f s)^[τ] (lone β u b)) := by
    rw [iter_lone_swap f β u hbb hub hbu, iter_lone_swap f β u hbb hub hbu]
    intro e
    have := congrFun e (blockOf ((matePath s)^[τ] a))
    rw [hread, hread] at this
    have hn : blockOf ((matePath s)^[τ] b) ≠ blockOf ((matePath s)^[τ] a) :=
      fun e' => hsplit e'.symm
    simp only [hn, ↓reduceIte] at this
    exact ht this
  exact ⟨himg, hfut, fun hL => hfut ((thm_lump_iff_no_conflict _ τ F).1 hL _ _ himg)⟩

end Lone

section Swap

variable {V : Type*} [DecidableEq V]

/-- The block of a cell, for blocks `j` of one shape `I` given by `cellOf : J × I ≃ V`. -/
def cellBlock {J I : Type*} (cellOf : J × I ≃ V) (v : V) : J := (cellOf.symm v).1

/-- A block reading: coarse cell `j` is `r` of the tones of block `j`, in the order of `I`. -/
def blockRead {J I A : Type*} (cellOf : J × I ≃ V) (r : (I → Tone) → A) (x : Config V) :
    J → A :=
  fun j => r fun i => x (cellOf (j, i))

/-- `P^τ` keeps block `j` whole: any two of its cells land in one block. -/
def SplitFreeAt {J : Type*} (s : Schedule V) (τ : Nat) (blockOf : V → J) (j : J) : Prop :=
  ∀ a b, blockOf a = j → blockOf b = j →
    blockOf ((matePath s)^[τ] a) = blockOf ((matePath s)^[τ] b)

/-- `P^τ` splits no block. -/
def NoSplit {J : Type*} (s : Schedule V) (τ : Nat) (blockOf : V → J) : Prop :=
  ∀ j, SplitFreeAt s τ blockOf j

private theorem round_swap (s : Schedule V) (x : Config V) :
    round prSwap s x = fun v => x (pullPath s v) := by
  induction s generalizing x with
  | nil => rfl
  | cons M s ih =>
    show round prSwap s (M.step prSwap x) = fun v => x (M.mate (pullPath s v))
    rw [step_of_swaps M prSwap x (fun _ _ => rfl), ih]

private theorem iter_round_swap (s : Schedule V) (τ : Nat) (x : Config V) :
    (round prSwap s)^[τ] x = fun v => x ((pullPath s)^[τ] v) := by
  induction τ generalizing x with
  | zero => rfl
  | succ n ih =>
    rw [iterate_succ_apply, ih, round_swap]
    funext v
    rw [iterate_succ_apply']

omit [DecidableEq V] in
/-- With finite blocks of one shape, a bijection `R` (inverse `L`) that sends every block into a
    block has an inverse that does too. -/
private theorem back_no_split {J I : Type*} [Finite I] (cellOf : J × I ≃ V) (R L : V → V)
    (hLR : ∀ a, L (R a) = a) (hRL : ∀ v, R (L v) = v)
    (hns : ∀ a b, (cellOf.symm a).1 = (cellOf.symm b).1 →
      (cellOf.symm (R a)).1 = (cellOf.symm (R b)).1)
    (v w : V) (hvw : (cellOf.symm v).1 = (cellOf.symm w).1) :
    (cellOf.symm (L v)).1 = (cellOf.symm (L w)).1 := by
  have hin : ∀ i, (cellOf.symm (R (cellOf ((cellOf.symm (L v)).1, i)))).1 =
      (cellOf.symm v).1 := by
    intro i
    have := hns (cellOf ((cellOf.symm (L v)).1, i)) (L v) (by rw [Equiv.symm_apply_apply])
    rw [hRL] at this
    exact this
  have hg : Injective fun i => (cellOf.symm (R (cellOf ((cellOf.symm (L v)).1, i)))).2 := by
    intro i i' h
    have e : cellOf.symm (R (cellOf ((cellOf.symm (L v)).1, i))) =
        cellOf.symm (R (cellOf ((cellOf.symm (L v)).1, i'))) :=
      Prod.ext (by rw [hin, hin]) h
    have e2 := congrArg L (cellOf.symm.injective e)
    rw [hLR, hLR] at e2
    exact (Prod.mk.inj (cellOf.injective e2)).2
  obtain ⟨i, hi⟩ := Finite.surjective_of_injective hg (cellOf.symm w).2
  have hw : R (cellOf ((cellOf.symm (L v)).1, i)) = w := by
    apply cellOf.symm.injective
    exact Prod.ext (by rw [hin]; exact hvw) hi
  rw [← hw, hLR, Equiv.symm_apply_apply]

private theorem single_symm {I A : Type*} [DecidableEq I] (r : (I → Tone) → A)
    (hr : ∀ y (π : Equiv.Perm I), r (y ∘ π) = r y) (β u : Tone) (i i' : I) :
    r (fun k => if k = i then u else β) = r (fun k => if k = i' then u else β) := by
  rw [← hr (fun k => if k = i' then u else β) (Equiv.swap i i')]
  congr 1
  funext k
  simp only [comp_apply]
  by_cases hk : k = i
  · subst hk
    simp
  · have : Equiv.swap i i' k ≠ i' := by
      rw [Ne, Equiv.swap_apply_eq_iff, Equiv.swap_apply_right]
      exact hk
    simp [hk, this]

/-- **A27 step 3, the full swap.** On any graph and schedule, the round of the full swap is the
    state-independent relabelling `x ↦ x ∘ pullPath s`, so `τ` rounds are `x ↦ x ∘ pullPath^τ`.
    For finite blocks of one shape `I` and a block reading `r` that ignores the order inside a
    block: if `P^τ` splits no block, the full swap is lumpable at `τ` and its rule is the
    transport `G(c)(j) = c(block of P^-τ(block j))`; and when `r` sees a lone excitation (a block
    holding one `u` reads differently from the background block), it is lumpable at `τ` exactly
    when `P^τ` splits no block. -/
theorem thm_lump_full_swap_transport {J I A : Type*} [Finite I] [DecidableEq I] [DecidableEq J]
    (s : Schedule V) (τ : Nat) (cellOf : J × I ≃ V) (r : (I → Tone) → A)
    (hr : ∀ y (π : Equiv.Perm I), r (y ∘ π) = r y) :
    (∀ x : Config V, (round prSwap s)^[τ] x = fun v => x ((pullPath s)^[τ] v)) ∧
    (NoSplit s τ (cellBlock cellOf) → Lumpable (round prSwap s) τ (blockRead cellOf r)) ∧
    ((∃ β u : Tone, ∃ i : I, r (fun k => if k = i then u else β) ≠ r (fun _ => β)) →
      (Lumpable (round prSwap s) τ (blockRead cellOf r) ↔ NoSplit s τ (cellBlock cellOf))) := by
  have hLR : ∀ a, (pullPath s)^[τ] ((matePath s)^[τ] a) = a :=
    LeftInverse.iterate (fun a => pull_mate s a) τ
  have hRL : ∀ v, (matePath s)^[τ] ((pullPath s)^[τ] v) = v :=
    LeftInverse.iterate (fun v => mate_pull s v) τ
  have hlump : NoSplit s τ (cellBlock cellOf) →
      Lumpable (round prSwap s) τ (blockRead cellOf r) := by
    intro hns
    have hns' : ∀ a b, (cellOf.symm a).1 = (cellOf.symm b).1 →
        (cellOf.symm ((matePath s)^[τ] a)).1 = (cellOf.symm ((matePath s)^[τ] b)).1 :=
      fun a b h => hns _ a b rfl h.symm
    classical
    refine ⟨fun c j => if h : Nonempty I then
      c (cellOf.symm ((pullPath s)^[τ] (cellOf (j, h.some)))).1 else c j, fun x => ?_⟩
    funext j
    rw [iter_round_swap]
    by_cases hI : Nonempty I
    · simp only [hI, ↓reduceDIte, blockRead]
      have hblk : ∀ i, (cellOf.symm ((pullPath s)^[τ] (cellOf (j, i)))).1 =
          (cellOf.symm ((pullPath s)^[τ] (cellOf (j, hI.some)))).1 := fun i =>
        back_no_split cellOf _ _ hLR hRL hns' _ _
          (by rw [Equiv.symm_apply_apply, Equiv.symm_apply_apply])
      have hπ : Injective fun i => (cellOf.symm ((pullPath s)^[τ] (cellOf (j, i)))).2 := by
        intro i i' h
        have e : cellOf.symm ((pullPath s)^[τ] (cellOf (j, i))) =
            cellOf.symm ((pullPath s)^[τ] (cellOf (j, i'))) :=
          Prod.ext (by rw [hblk, hblk i']) h
        have e2 := congrArg ((matePath s)^[τ]) (cellOf.symm.injective e)
        rw [hRL, hRL] at e2
        exact (Prod.mk.inj (cellOf.injective e2)).2
      have hbij : Bijective fun i => (cellOf.symm ((pullPath s)^[τ] (cellOf (j, i)))).2 :=
        ⟨hπ, Finite.surjective_of_injective hπ⟩
      let π : Equiv.Perm I := Equiv.ofBijective _ hbij
      have hfun : (fun i => x ((pullPath s)^[τ] (cellOf (j, i)))) =
          (fun k => x (cellOf ((cellOf.symm ((pullPath s)^[τ] (cellOf (j, hI.some)))).1, k)))
            ∘ π := by
        funext i
        show x ((pullPath s)^[τ] (cellOf (j, i))) =
          x (cellOf ((cellOf.symm ((pullPath s)^[τ] (cellOf (j, hI.some)))).1,
            (cellOf.symm ((pullPath s)^[τ] (cellOf (j, i)))).2))
        rw [← hblk i, Prod.mk.eta, Equiv.apply_symm_apply]
      rw [hfun, hr]
    · simp only [hI, ↓reduceDIte, blockRead]
      exact congrArg r (funext fun i => (hI ⟨i⟩).elim)
  refine ⟨iter_round_swap s τ, hlump, fun hsee => ⟨fun hL => ?_, hlump⟩⟩
  obtain ⟨β, u, i0, hne⟩ := hsee
  intro j a b ha hb
  by_contra hsplit
  have hread : ∀ a' j', blockRead cellOf r (lone β u a') j' =
      if cellBlock cellOf a' = j' then r (fun k => if k = i0 then u else β)
      else r (fun _ => β) := by
    intro a' j'
    unfold blockRead
    by_cases hj : cellBlock cellOf a' = j'
    · simp only [hj, ↓reduceIte]
      rw [single_symm r hr β u i0 (cellOf.symm a').2]
      congr 1
      funext k
      unfold lone
      have : (cellOf (j', k) = a') ↔ (k = (cellOf.symm a').2) := by
        constructor
        · intro e
          rw [← e, Equiv.symm_apply_apply]
        · intro e
          rw [e, ← hj]
          exact cellOf.apply_symm_apply a'
      simp only [this]
    · simp only [hj, ↓reduceIte]
      congr 1
      funext k
      have : cellOf (j', k) ≠ a' := by
        intro e
        apply hj
        unfold cellBlock
        rw [← e, Equiv.symm_apply_apply]
      exact lone_off β u a' _ this
  exact (thm_lump_lone_split_nogo prSwap s τ β u rfl rfl rfl (cellBlock cellOf)
    (blockRead cellOf r) _ _ hne hread a b (ha.trans hb.symm) hsplit).2.2 hL

end Swap

section Quotient

variable {V : Type*}

/-- **A27 step 4, decided by the quotient.** On any graph, when every matching of the schedule
    commutes with a group `N` of deck transformations and the blocks are `N`-invariant, `P^τ`
    commutes with `N`, a block is split exactly when its `N`-translates are, and so `P^τ` splits
    no block exactly when it splits none of a set of blocks meeting every `N`-orbit (one block per
    quotient class decides it for the whole infinite graph). -/
theorem thm_lump_split_decided_by_quotient {J N : Type*} [Group N] [MulAction N V]
    [MulAction N J] (s : Schedule V) (τ : Nat) (blockOf : V → J)
    (hmate : ∀ M ∈ s, ∀ (n : N) (v : V), M.mate (n • v) = n • M.mate v)
    (hblock : ∀ (n : N) (v : V), blockOf (n • v) = n • blockOf v) :
    (∀ (n : N) (a : V), (matePath s)^[τ] (n • a) = n • (matePath s)^[τ] a) ∧
    (∀ (n : N) (j : J), SplitFreeAt s τ blockOf j ↔ SplitFreeAt s τ blockOf (n • j)) ∧
    (∀ Rep : Set J, (∀ j, ∃ n : N, n • j ∈ Rep) →
      (NoSplit s τ blockOf ↔ ∀ j ∈ Rep, SplitFreeAt s τ blockOf j)) := by
  have hpath : ∀ (n : N) (a : V), matePath s (n • a) = n • matePath s a := by
    intro n
    induction s with
    | nil => intro a; rfl
    | cons M s ih =>
      intro a
      show matePath s (M.mate (n • a)) = n • matePath s (M.mate a)
      rw [hmate M List.mem_cons_self n a,
        ih (fun M' hM' => hmate M' (List.mem_cons_of_mem M hM'))]
  have hiter : ∀ (n : N) (a : V), (matePath s)^[τ] (n • a) = n • (matePath s)^[τ] a := by
    intro n
    induction τ with
    | zero => intro a; rfl
    | succ k ih =>
      intro a
      rw [iterate_succ_apply', iterate_succ_apply', ih, hpath]
  have htrans : ∀ (n : N) (j : J), SplitFreeAt s τ blockOf j →
      SplitFreeAt s τ blockOf (n • j) := by
    intro n j h a b ha hb
    have ha' : blockOf (n⁻¹ • a) = j := by rw [hblock, ha, inv_smul_smul]
    have hb' : blockOf (n⁻¹ • b) = j := by rw [hblock, hb, inv_smul_smul]
    have := h _ _ ha' hb'
    rw [hiter, hiter, hblock, hblock] at this
    have := congrArg (n • ·) this
    simpa only [smul_inv_smul] using this
  have hiff : ∀ (n : N) (j : J), SplitFreeAt s τ blockOf j ↔
      SplitFreeAt s τ blockOf (n • j) := by
    intro n j
    refine ⟨htrans n j, fun h => ?_⟩
    have := htrans n⁻¹ _ h
    rwa [inv_smul_smul] at this
  refine ⟨hiter, hiff, fun Rep hRep => ⟨fun h j _ => h j, fun h j => ?_⟩⟩
  obtain ⟨n, hn⟩ := hRep j
  exact (hiff n j).2 (h _ hn)

end Quotient

section Line

open PairRuleLink

/-- The tone of a base-3 digit of a code (digit `t + 1`). -/
def toneOfDigit (d : Nat) : Tone := if d = 0 then .neg else if d = 1 then .zero else .pos

/-- The `w` cells of a base-3 code, cell 0 the lowest digit (`decodeCells` of coarse-block.ts). -/
def decodeCells : Nat → Nat → List Tone
  | _, 0 => []
  | c, w + 1 => toneOfDigit (c % 3) :: decodeCells (c / 3) w

private theorem decodeCells_length : ∀ c w, (decodeCells c w).length = w
  | _, 0 => rfl
  | c, w + 1 => by simp only [decodeCells, List.length_cons, decodeCells_length (c / 3) w]

/-- The mate of cell `v` on the line in colour `c` of period `p`: edge `(i, i + 1)` has colour
    `i mod p`. -/
def lineMate (p c : Nat) (v : ℤ) : ℤ :=
  if (v - c) % (p : ℤ) = 0 then v + 1 else if (v - 1 - c) % (p : ℤ) = 0 then v - 1 else v

/-- The first cell of each edge is its left cell. -/
def lineLead (p c : Nat) (v : ℤ) : Bool := decide ((v - c) % (p : ℤ) = 0)

private theorem line_excl (p c : Nat) (hp : 2 ≤ p) (v : ℤ) (h1 : (v - c) % (p : ℤ) = 0)
    (h2 : (v - 1 - c) % (p : ℤ) = 0) : False := by
  have d := dvd_sub (Int.dvd_of_emod_eq_zero h1) (Int.dvd_of_emod_eq_zero h2)
  have e : v - c - (v - 1 - c) = 1 := by omega
  rw [e] at d
  have := Int.le_of_dvd Int.one_pos d
  omega

private theorem lineMate_mate (p c : Nat) (hp : 2 ≤ p) (v : ℤ) :
    lineMate p c (lineMate p c v) = v := by
  by_cases h1 : (v - c) % (p : ℤ) = 0
  · have e1 : v + 1 - 1 - c = v - c := by omega
    have n1 : ¬ (v + 1 - c) % (p : ℤ) = 0 := fun h =>
      line_excl p c hp (v + 1) h (by rw [e1]; exact h1)
    simp only [lineMate, h1, ↓reduceIte, n1, e1]
    omega
  · by_cases h2 : (v - 1 - c) % (p : ℤ) = 0
    · have e2 : v - 1 + 1 = v := by omega
      simp only [lineMate, h1, h2, ↓reduceIte, e2]
    · simp only [lineMate, h1, h2, ↓reduceIte]

private theorem lineLead_mate (p c : Nat) (hp : 2 ≤ p) (v : ℤ) (h : lineMate p c v ≠ v) :
    lineLead p c (lineMate p c v) = !lineLead p c v := by
  by_cases h1 : (v - c) % (p : ℤ) = 0
  · have e1 : v + 1 - 1 - c = v - c := by omega
    have n1 : ¬ (v + 1 - c) % (p : ℤ) = 0 := fun h =>
      line_excl p c hp (v + 1) h (by rw [e1]; exact h1)
    simp only [lineLead, lineMate, h1, ↓reduceIte, n1, decide_true, decide_false, Bool.not_true]
  · by_cases h2 : (v - 1 - c) % (p : ℤ) = 0
    · simp only [lineLead, lineMate, h1, h2, ↓reduceIte, decide_true, decide_false,
        Bool.not_false]
    · simp only [lineMate, h1, h2, ↓reduceIte, ne_eq, not_true_eq_false] at h

/-- Colour `c` of the line schedule of period `p`, every edge oriented left to right. -/
def lineMatching (p c : Nat) (hp : 2 ≤ p) : Matching ℤ where
  mate := lineMate p c
  mate_mate := lineMate_mate p c hp
  lead := lineLead p c
  lead_mate := lineLead_mate p c hp

/-- The line schedules of coarse-block.ts in `LINE_SCHEDULES` order: `brick2` (colours 0, 1),
    `brick3-forward` (0, 1, 2) and `brick3-reverse` (2, 1, 0). -/
def lineSchedule : Nat → Schedule ℤ
  | 0 => [lineMatching 2 0 (by decide), lineMatching 2 1 (by decide)]
  | 1 => [lineMatching 3 0 (by decide), lineMatching 3 1 (by decide), lineMatching 3 2 (by decide)]
  | _ => [lineMatching 3 2 (by decide), lineMatching 3 1 (by decide), lineMatching 3 0 (by decide)]

/-- The declared block offsets: every offset modulo `gcd(b, period)` (`blockOffsets`). -/
def lineOffsets (s b : Nat) : List Nat := List.range (Nat.gcd b (if s = 0 then 2 else 3))

/-- The reading maps of coarse-block.ts: `0` majority, `1` netSign, `2` netResidue. -/
def lumpMap (m : Nat) (cells : List Tone) : Int :=
  if m = 0 then
    if 2 * cells.countP (fun t => t == .pos) > cells.length then 1
    else if 2 * cells.countP (fun t => t == .neg) > cells.length then -1 else 0
  else if m = 1 then ((cells.map Tone.value).sum).sign
  else ((cells.map Tone.value).sum + 1) % 3 - 1

/-- The block reading on the line: coarse cell `j` is `mp` of the cells `o + j b .. o + j b + b - 1`. -/
def lineRead (mp : List Tone → Int) (b : Nat) (o : ℤ) (x : Config ℤ) (j : ℤ) : Int :=
  mp ((List.range b).map fun k => x (o + j * b + k))

/-- A fine window `cells` starting at `base`, the vacuum outside. -/
def windowConfig (base : ℤ) (cells : List Tone) : Config ℤ := fun v =>
  if base ≤ v ∧ v < base + cells.length then cells.getD (v - base).toNat .zero else .zero

private theorem windowConfig_out (base : ℤ) (cells : List Tone) (v : ℤ)
    (h : v < base ∨ base + cells.length ≤ v) : windowConfig base cells v = .zero := by
  have : ¬ (base ≤ v ∧ v < base + cells.length) := by omega
  simp only [windowConfig, this, ↓reduceIte]

/-- The check of one witness: the window of `2R + 1` blocks starts on a block boundary, the two
    windows read alike block for block, and their center blocks read differently after `τ`
    rounds of the Lean round on the whole line. -/
def witnessCheck (f : Pair → Pair) (sch : Schedule ℤ) (τ b : Nat) (o : ℤ)
    (mp : List Tone → Int) (R : Nat) (base : ℤ) (lc rc : Nat) : Bool :=
  decide ((base - o) % (b : ℤ) = 0) &&
  ((List.range (2 * R + 1)).all fun i =>
    decide (lineRead mp b o (windowConfig base (decodeCells lc ((2 * R + 1) * b)))
        ((base - o) / b + i) =
      lineRead mp b o (windowConfig base (decodeCells rc ((2 * R + 1) * b)))
        ((base - o) / b + i))) &&
  decide (lineRead mp b o ((round f sch)^[τ] (windowConfig base (decodeCells lc ((2 * R + 1) * b))))
      ((base - o) / b + R) ≠
    lineRead mp b o ((round f sch)^[τ] (windowConfig base (decodeCells rc ((2 * R + 1) * b))))
      ((base - o) / b + R))

private theorem line_conflict (f : Pair → Pair) (sch : Schedule ℤ) (τ b : Nat) (o : ℤ)
    (mp : List Tone → Int) (R : Nat) (base : ℤ) (x y : Config ℤ)
    (hx : ∀ v, v < base ∨ base + (((2 * R + 1) * b : Nat) : ℤ) ≤ v → x v = .zero)
    (hy : ∀ v, v < base ∨ base + (((2 * R + 1) * b : Nat) : ℤ) ≤ v → y v = .zero)
    (hmod : (base - o) % (b : ℤ) = 0)
    (hall : ∀ i < 2 * R + 1,
      lineRead mp b o x ((base - o) / b + i) = lineRead mp b o y ((base - o) / b + i))
    (hne : lineRead mp b o ((round f sch)^[τ] x) ((base - o) / b + R) ≠
      lineRead mp b o ((round f sch)^[τ] y) ((base - o) / b + R)) :
    ¬ Lumpable (round f sch) τ (lineRead mp b o) := by
  have hq := Int.ediv_mul_cancel (Int.dvd_of_emod_eq_zero hmod)
  have himg : lineRead mp b o x = lineRead mp b o y := by
    funext j
    by_cases hj : (base - o) / b ≤ j ∧ j < (base - o) / b + ((2 * R + 1 : Nat) : ℤ)
    · have := hall (j - (base - o) / b).toNat (by omega)
      rwa [show (base - o) / b + (((j - (base - o) / b).toNat : Nat) : ℤ) = j by omega] at this
    · unfold lineRead
      congr 1
      apply List.map_congr_left
      intro k hk
      have hkb : k < b := List.mem_range.1 hk
      have hb : (0 : ℤ) ≤ b := by omega
      have hout : o + j * b + k < base ∨ base + (((2 * R + 1) * b : Nat) : ℤ) ≤ o + j * b + k := by
        rcases not_and_or.1 hj with h | h
        · have h1 : j * b ≤ ((base - o) / b - 1) * b :=
            Int.mul_le_mul_of_nonneg_right (by omega) hb
          rw [Int.sub_mul, Int.one_mul] at h1
          left
          omega
        · have h2 : ((base - o) / b + ((2 * R + 1 : Nat) : ℤ)) * b ≤ j * b :=
            Int.mul_le_mul_of_nonneg_right (by omega) hb
          rw [Int.add_mul] at h2
          right
          push_cast at h2 ⊢
          omega
      rw [hx _ hout, hy _ hout]
  intro hL
  obtain ⟨G, hG⟩ := hL
  apply hne
  rw [hG, hG, himg]

/-- **B9 soundness.** A witness that passes `witnessCheck` is two configurations of the whole line
    with one coarse image and two coarse futures, so the reading is not lumpable at `τ`. -/
theorem thm_lump_line_witness_sound (f : Pair → Pair) (sch : Schedule ℤ) (τ b : Nat) (o : ℤ)
    (mp : List Tone → Int) (R : Nat) (base : ℤ) (lc rc : Nat)
    (h : witnessCheck f sch τ b o mp R base lc rc = true) :
    ¬ Lumpable (round f sch) τ (lineRead mp b o) := by
  simp only [witnessCheck, Bool.and_eq_true, decide_eq_true_eq, List.all_eq_true,
    List.mem_range] at h
  obtain ⟨⟨hmod, hall⟩, hne⟩ := h
  refine line_conflict f sch τ b o mp R base _ _ (fun v hv => windowConfig_out _ _ v ?_)
    (fun v hv => windowConfig_out _ _ v ?_) hmod hall hne
  · rwa [decodeCells_length]
  · rwa [decodeCells_length]

/-- The rows of a flat list of nine Nats each (`fuel` bounds the recursion). -/
def chunkRows : Nat → List Nat → List (List Nat)
  | 0, _ => []
  | fuel + 1, l => if l.isEmpty then [] else l.take 9 :: chunkRows fuel (l.drop 9)

/-- A generated row is a passing witness for rule `k`, schedule `s`, block `b`, offset `o`, step
    `τ` and map `m`. -/
def witnessRowOk (k s b o τ m : Nat) (row : List Nat) : Bool :=
  row.take 6 == [k, s, b, o, τ, m] &&
  witnessCheck (decodeRule (Generated.pairRuleTables.getD k [])) (lineSchedule s) τ b o (lumpMap m)
    ((τ * (lineSchedule s).length + b - 1) / b) ((row.getD 6 0 : ℤ) - 32) (row.getD 7 0)
    (row.getD 8 0)

/-- Some generated row of rule `k` is a passing witness for the case. -/
def hasWitness (k s b o τ m : Nat) : Bool :=
  (chunkRows 1000 (Generated.lumpWitnesses.getD k [])).any (witnessRowOk k s b o τ m)

private theorem hasWitness_sound (k s b o τ m : Nat) (h : hasWitness k s b o τ m = true) :
    ¬ Lumpable (round (decodeRule (Generated.pairRuleTables.getD k [])) (lineSchedule s)) τ
      (lineRead (lumpMap m) b o) := by
  obtain ⟨row, _, hrow⟩ := List.any_eq_true.1 h
  exact thm_lump_line_witness_sound _ _ τ b o _ _ _ _ _ (Bool.and_eq_true _ _ ▸ hrow).2

/-- Every case of E-CMP-0066's reading-map lumpability for a non-identity rule. -/
def allLineCases : Bool :=
  (List.range' 1 23).all fun k => (List.range 3).all fun s => [2, 3, 4].all fun b =>
    (lineOffsets s b).all fun o => [1, 2].all fun τ => (List.range 3).all fun m =>
      hasWitness k s b o τ m

private theorem allLineCases_true : allLineCases = true := by decide +kernel

private theorem decode_identity : ∀ p, decodeRule (Generated.pairRuleTables.getD 0 []) p = p := by
  intro p
  rcases p with ⟨a, b⟩
  cases a <;> cases b <;> decide

/-- **B9.** For every conservative reversible pair rule other than the identity, every line
    schedule (`brick2`, `brick3` forward and reverse), every block size `b` in 2 to 4 at every
    declared offset, `τ` in 1 and 2, and each reading map (majority, netSign, netResidue), the
    block reading is not lumpable on the whole line at any coarse radius. Proved by checking, in
    the kernel against the Lean round on `ℤ`, a witness the TypeScript search found for each of
    the 2,070 cases. -/
theorem thm_lump_line_conflict_witnesses (f : Pair → Pair) (hS : PrSumPres f) (hI : PrInj f)
    (hid : ∃ p, f p ≠ p) :
    ∀ s < 3, ∀ b ∈ [2, 3, 4], ∀ o ∈ lineOffsets s b, ∀ τ ∈ [1, 2], ∀ m < 3,
      ¬ Lumpable (round f (lineSchedule s)) τ (lineRead (lumpMap m) b o) := by
  obtain ⟨t, ht, hft⟩ := (gen_pair_rules_eq.2.2.2.2 f).1 ⟨hS, hI⟩
  obtain ⟨k, hk, hkt⟩ := List.getElem_of_mem ht
  have hget : Generated.pairRuleTables.getD k [] = t := by
    rw [List.getD_eq_getElem _ _ hk, hkt]
  have hf : f = decodeRule (Generated.pairRuleTables.getD k []) := by
    funext p
    rw [hget]
    exact hft p
  have hk0 : k ≠ 0 := by
    rintro rfl
    obtain ⟨p, hp⟩ := hid
    exact hp (by rw [hf]; exact decode_identity p)
  have hlen : Generated.pairRuleTables.length = 24 := gen_pair_rules_eq.1
  have hkr : k ∈ List.range' 1 23 := List.mem_range'_1.2 ⟨by omega, by omega⟩
  intro s hs b hb o ho τ hτ m hm
  have h := allLineCases_true
  simp only [allLineCases, List.all_eq_true] at h
  rw [hf]
  exact hasWitness_sound k s b o τ m
    (h k hkr s (List.mem_range.2 hs) b hb o ho τ hτ m (List.mem_range.2 hm))

/-- Bridge for `lumpBlockMapTables`: the Lean reading maps equal `read` of majority, netSign and
    netResidue in coarse-block.ts on every block of 2 to 4 cells. -/
theorem gen_lump_block_maps_eq :
    Generated.lumpBlockMapTables = (List.range 3).flatMap fun m =>
      [2, 3, 4].map fun b => (List.range (3 ^ b)).map fun c => lumpMap m (decodeCells c b) := by
  decide +kernel

end Line

section Ring

open PairRuleLink

/-- Colour `c` (0 or 1) of `brick2` on the 6-ring (`ringPartition` with base 0): edge
    `(i, i + 1 mod 6)` for `i ≡ c mod 2`, oriented forward. -/
def ringMatching (c : Nat) (hc : c < 2) : Matching (Fin 6) where
  mate i := if i.val % 2 = c then ⟨(i.val + 1) % 6, Nat.mod_lt _ (by decide)⟩
    else ⟨(i.val + 5) % 6, Nat.mod_lt _ (by decide)⟩
  mate_mate := by
    rcases (by omega : c = 0 ∨ c = 1) with rfl | rfl <;> decide
  lead i := decide (i.val % 2 = c)
  lead_mate := by
    rcases (by omega : c = 0 ∨ c = 1) with rfl | rfl <;> decide

/-- `brick2` on the 6-ring: colour 0, then colour 1. -/
def ringBrick : Schedule (Fin 6) := [ringMatching 0 (by decide), ringMatching 1 (by decide)]

/-- The configuration of code `x` (`decodeState` of partitioned-pair.ts). -/
def decodeRing (x : Nat) : Config (Fin 6) := fun i => toneOfDigit (x / 3 ^ i.val % 3)

/-- The code of a configuration (`encodeState` of partitioned-pair.ts). -/
def encodeRing (y : Config (Fin 6)) : Nat :=
  toneIdx (y 0) + 3 * toneIdx (y 1) + 9 * toneIdx (y 2) + 27 * toneIdx (y 3) +
    81 * toneIdx (y 4) + 243 * toneIdx (y 5)

private theorem toneIdx_lt (t : Tone) : toneIdx t < 3 := by cases t <;> decide

private theorem toneOfDigit_idx (t : Tone) : toneOfDigit (toneIdx t) = t := by cases t <;> rfl

private theorem decode_encode (y : Config (Fin 6)) : decodeRing (encodeRing y) = y := by
  funext i
  have h0 := toneIdx_lt (y 0)
  have h1 := toneIdx_lt (y 1)
  have h2 := toneIdx_lt (y 2)
  have h3 := toneIdx_lt (y 3)
  have h4 := toneIdx_lt (y 4)
  have h5 := toneIdx_lt (y 5)
  unfold decodeRing encodeRing
  fin_cases i <;> simp only [Fin.zero_eta, Fin.isValue, Fin.mk_one, Fin.reduceFinMk, pow_zero,
    pow_one, Nat.reducePow] <;> rw [← toneOfDigit_idx (y _)] <;> congr 1 <;> omega

private theorem encode_lt (y : Config (Fin 6)) : encodeRing y < 729 := by
  have h0 := toneIdx_lt (y 0)
  have h1 := toneIdx_lt (y 1)
  have h2 := toneIdx_lt (y 2)
  have h3 := toneIdx_lt (y 3)
  have h4 := toneIdx_lt (y 4)
  have h5 := toneIdx_lt (y 5)
  unfold encodeRing
  omega

private theorem ring_images_true :
    ((List.range 24).all fun k => (List.range 729).all fun x =>
      encodeRing (round (decodeRule (Generated.pairRuleTables.getD k [])) ringBrick (decodeRing x)) ==
        (Generated.partitionedRingImages.getD k []).getD x 0) = true := by
  decide +kernel

/-- Bridge for `partitionedRingImages` (the extensional link of `round` to
    code/rule/partitioned-pair.ts): for every rule of the census and every configuration `y` of
    the 6-ring, the code of the Lean round of `y` under `brick2` is `globalPermutation`'s image of
    the code of `y`. The link holds on this finite family only (lean-track.md section 4.5); the
    general theorems speak about the Lean round, which equals the code here. -/
theorem gen_partitioned_ring_eq :
    Generated.partitionedRingImages.length = 24 ∧
    ∀ k < 24, ∀ y : Config (Fin 6),
      encodeRing (round (decodeRule (Generated.pairRuleTables.getD k [])) ringBrick y) =
        (Generated.partitionedRingImages.getD k []).getD (encodeRing y) 0 := by
  refine ⟨by decide, fun k hk y => ?_⟩
  have h := ring_images_true
  simp only [List.all_eq_true, List.mem_range, beq_iff_eq] at h
  have := h k hk (encodeRing y) (encode_lt y)
  rwa [decode_encode] at this

end Ring

end Compute

end Vibe
