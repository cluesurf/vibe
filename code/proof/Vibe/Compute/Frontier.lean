import Mathlib.Combinatorics.SimpleGraph.Metric
import Vibe.Compute.SecondOrderZ3

/-!
# Frontier read-back on the discovered graph (level 4, L4-Exact)

Lean track item I02 (claim I-a1 of the intelligence lab). The level-4 solver `meshWave` runs the M3-B wave
`s(t+1) = (sum of in-neighbours of s(t)) + h(own) - s(t-1)` (mod 3) on the state graph it discovers, seeded with `+1` on
the initial state `o`, expands each state the step it first lights, and reads a path back from the goal by stepping to
the known in-neighbour with the least first-lit step (`readBack` of `code/intelligence/solver/mesh/mesh-wave.ts`).

The graph is any tile type `V` with a finite in-neighbour set `nbr i` per state (directed or not, finite or not); a walk
steps from `j` to `i` when `j ∈ nbr i`, as in `SecondOrderZ3`. Distance is `IsDist nbr o v n`: a walk of length `n`
from `o` to `v` exists and none shorter. Headline theorems:

1. `thm_frontier_discovered_field`: if the discovered in-neighbour sets are true in-neighbour sets and every state that
   is non-zero in the discovered run at step `t` has all its out-arcs known at step `t`, the discovered run equals the
   field on the whole graph at every step, so the two agree on when every state first lights.
2. `thm_frontier_lights_iff`: a state with no walk shorter than `t` first lights at step `t` exactly when its number of
   length-`t` walks (at its distance, its geodesic count) is non-zero mod 3. `thm_frontier_never_early`: no state
   lights before its distance. `thm_frontier_unreachable_dark`: a state no walk reaches never lights.
3. `thm_frontier_readback_shortest` (L4-Exact): if every state at distance `k < d(goal)` first lights at step `k`, the
   read-back from the goal (the code's rule: a known in-neighbour of least first-lit step, any tie-break) reaches the
   initial state in exactly `d(goal)` steps along true arcs, the distance dropping by one each step, so it is a
   shortest path; it never meets a state with no earlier known in-neighbour (the code's throw never fires).
4. `thm_frontier_readback_earlier`: the same when every step after the first goes to ANY known in-neighbour lit
   strictly earlier than the current state (the first step, from the goal, keeps the least-lit rule).
5. `thm_frontier_readback_lucas`: L4-Exact with the hole condition read as arithmetic: no state at distance
   `k < d(goal)` has a geodesic count divisible by 3 (no Lucas hole inside the goal's radius).
6. `thm_frontier_isDist_simple_graph`, `thm_frontier_readback_simple_graph`: the same on any locally finite
   `SimpleGraph` with Mathlib's `SimpleGraph.dist`: the read-back is a walk of `G.Adj` steps along which `G.dist o`
   drops by one, from the goal down to the initial state.

The solver run enters as hypotheses on the final known arcs `known`, a first-lit step `lit`, and the stop step `T`:
known arcs are true arcs; a known in-neighbour was expanded at its first lighting, at a step at most `T`; every state
that first lit before step `T` was expanded with all its out-arcs; and if the goal is not the initial state it was
discovered (has a known in-neighbour). These describe the code, not the note: the note's only condition is the hole
condition. The theorems speak about these Lean definitions; no generated table ties them to the TypeScript.
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

namespace Frontier

open Finset SecondOrderZ3

/-- The field `s(t)` of one source `o` under the law `neighbour sum + h(own)` on the whole graph. -/
def field {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3) (o : V) (t : ℕ) : Slice V :=
  ((step (law nbr h))^[t] (seed o)).2

/-- `v` first lights at step `n` in the field history `s`: non-zero at `n`, zero at every earlier step. -/
def FirstLit {V : Type} (s : ℕ → V → ZMod 3) (v : V) (n : ℕ) : Prop :=
  s n v ≠ 0 ∧ ∀ m < n, s m v = 0

/-- `v` lies at distance `n` from `o`: a walk of length `n` exists and none shorter. -/
def IsDist {V : Type} [DecidableEq V] (nbr : V → Finset V) (o v : V) (n : ℕ) : Prop :=
  walks nbr o n v ≠ 0 ∧ ∀ m < n, walks nbr o m v = 0

/-- The discovered run: step `t` uses the in-neighbour sets `known t` the solver holds at that step. -/
def run {V : Type} [DecidableEq V] (known : ℕ → V → Finset V) (h : ZMod 3 → ZMod 3) (o : V) : ℕ → SlicePair V
  | 0 => seed o
  | t + 1 => step (law (known t) h) (run known h o t)

/-- The code's read-back rule: `u` is a known in-neighbour of `x` of least first-lit step (ties broken any way). -/
def ReadBack {V : Type} (known : V → Finset V) (lit : V → ℕ) (x u : V) : Prop :=
  u ∈ known x ∧ ∀ w ∈ known x, lit u ≤ lit w

/-! ### The discovered field -/

/-- The discovered run equals the field on the whole graph, at every step, and so lights every state at the same
step: known arcs are true arcs, and a state non-zero at step `t` of the run has every out-arc known at step `t`. -/
theorem thm_frontier_discovered_field {V : Type} [DecidableEq V] (nbr : V → Finset V)
    (known : ℕ → V → Finset V) (h : ZMod 3 → ZMod 3) (o : V)
    (hsub : ∀ t i, known t i ⊆ nbr i)
    (hexp : ∀ t i j, (run known h o t).2 j ≠ 0 → j ∈ nbr i → j ∈ known t i) :
    (∀ t, run known h o t = (step (law nbr h))^[t] (seed o)) ∧
      ∀ v n, FirstLit (fun t => (run known h o t).2) v n ↔ FirstLit (field nbr h o) v n := by
  have heq : ∀ t, run known h o t = (step (law nbr h))^[t] (seed o) := by
    intro t
    induction t with
    | zero => rfl
    | succ t ih =>
      rw [Function.iterate_succ_apply', ← ih]
      have hlaw : law (known t) h (run known h o t).2 = law nbr h (run known h o t).2 := by
        funext i
        simp only [law]
        congr 1
        refine Finset.sum_subset (hsub t i) (fun j hj hnot => ?_)
        by_contra hne
        exact hnot (hexp t i j hne hj)
      simp only [run, step, hlaw]
  refine ⟨heq, fun v n => ?_⟩
  have hf : (fun t => (run known h o t).2) = field nbr h o := by
    funext t
    rw [heq t]
    rfl
  rw [hf]

/-! ### Which states the front lights -/

-- [helper]
theorem walk_of_field_ne {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0)
    (o : V) (n : ℕ) (v : V) (hs : field nbr h o n v ≠ 0) : ∃ m ≤ n, walks nbr o m v ≠ 0 := by
  by_contra hno
  push Not at hno
  exact hs (thm_soz3_light_cone nbr h h0 o n v hno).2

-- [helper]
theorem walks_succ_ne {V : Type} [DecidableEq V] (nbr : V → Finset V) (o x u : V) (m : ℕ) (hu : u ∈ nbr x)
    (hw : walks nbr o m u ≠ 0) : walks nbr o (m + 1) x ≠ 0 :=
  fun hz => hw (walks_nbr_zero nbr o x u m hz hu)

-- [helper]
theorem isDist_unique {V : Type} [DecidableEq V] (nbr : V → Finset V) (o v : V) (a b : ℕ)
    (h1 : IsDist nbr o v a) (h2 : IsDist nbr o v b) : a = b := by
  rcases lt_trichotomy a b with hab | hab | hab
  · exact absurd (h2.2 a hab) h1.1
  · exact hab
  · exact absurd (h1.2 b hab) h2.1

-- [helper]
theorem firstLit_unique {V : Type} (s : ℕ → V → ZMod 3) (v : V) (a b : ℕ)
    (h1 : FirstLit s v a) (h2 : FirstLit s v b) : a = b := by
  rcases lt_trichotomy a b with hab | hab | hab
  · exact absurd (h2.2 a hab) h1.1
  · exact hab
  · exact absurd (h1.2 b hab) h2.1

-- [helper]
theorem isDist_zero_iff {V : Type} [DecidableEq V] (nbr : V → Finset V) (o v : V) :
    IsDist nbr o v 0 ↔ v = o := by
  constructor
  · intro hd
    by_contra hvo
    exact hd.1 (by simp [walks, hvo])
  · rintro rfl
    exact ⟨by simp [walks], fun m hm => absurd hm (Nat.not_lt_zero m)⟩

-- [helper]
theorem isDist_pred {V : Type} [DecidableEq V] (nbr : V → Finset V) (o x : V) (k : ℕ)
    (hd : IsDist nbr o x (k + 1)) : ∃ y ∈ nbr x, IsDist nbr o y k := by
  obtain ⟨hne, hlt⟩ := hd
  have hex : ∃ y ∈ nbr x, walks nbr o k y ≠ 0 := by
    by_contra hno
    push Not at hno
    exact hne (by simp only [walks]; exact Finset.sum_eq_zero hno)
  obtain ⟨y, hy, hyk⟩ := hex
  exact ⟨y, hy, hyk, fun m hm => walks_nbr_zero nbr o x y m (hlt (m + 1) (by omega)) hy⟩

-- [helper]
theorem isDist_of_nbr {V : Type} [DecidableEq V] (nbr : V → Finset V) (o x u : V) (k m : ℕ)
    (hx : IsDist nbr o x (k + 1)) (hu : u ∈ nbr x) (hm : m ≤ k) (hw : walks nbr o m u ≠ 0) :
    IsDist nbr o u k ∧ m = k := by
  have hmk : m = k := by
    by_contra hne
    exact walks_succ_ne nbr o x u m hu hw (hx.2 (m + 1) (by omega))
  subst hmk
  exact ⟨⟨hw, fun m' hm' => by
    by_contra hne
    exact walks_succ_ne nbr o x u m' hu hne (hx.2 (m' + 1) (by omega))⟩, rfl⟩

/-- The front lights exactly the states whose count is non-zero mod 3: a state with no walk shorter than `t` first
lights at step `t` if and only if its number of length-`t` walks is non-zero mod 3. At `t` its distance that number is
its geodesic count; when it is divisible by 3 the state stays dark as the front passes (a Lucas hole). -/
theorem thm_frontier_lights_iff {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3)
    (h0 : h 0 = 0) (o v : V) (t : ℕ) (hfar : ∀ k < t, walks nbr o k v = 0) :
    FirstLit (field nbr h o) v t ↔ (walks nbr o t v : ZMod 3) ≠ 0 := by
  have hfront := thm_soz3_front_geodesic_count nbr h h0 o t v hfar
  constructor
  · intro hl
    rw [← hfront]
    exact hl.1
  · intro hw
    refine ⟨by rw [field, hfront]; exact hw, fun m hm => ?_⟩
    exact (thm_soz3_light_cone nbr h h0 o m v (fun k hk => hfar k (lt_of_le_of_lt hk hm))).2

/-- No state lights before its distance. -/
theorem thm_frontier_never_early {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3)
    (h0 : h 0 = 0) (o v : V) (n m : ℕ) (hd : IsDist nbr o v n) (hl : field nbr h o m v ≠ 0) : n ≤ m := by
  obtain ⟨m', hm', hw⟩ := walk_of_field_ne nbr h h0 o m v hl
  by_contra hlt
  exact hw (hd.2 m' (by omega))

/-- A state that no walk from the origin reaches never lights. -/
theorem thm_frontier_unreachable_dark {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3)
    (h0 : h 0 = 0) (o v : V) (hno : ∀ k, walks nbr o k v = 0) (t : ℕ) : field nbr h o t v = 0 :=
  (thm_soz3_light_cone nbr h h0 o t v (fun k _ => hno k)).2

/-! ### Read-back -/

-- [helper]
theorem readback_step {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0)
    (o : V) (lit : V → ℕ) (x u : V) (k : ℕ) (hx : IsDist nbr o x (k + 1)) (hu : u ∈ nbr x)
    (hlu : field nbr h o (lit u) u ≠ 0) (hle : lit u ≤ k) : IsDist nbr o u k ∧ lit u = k := by
  obtain ⟨m, hm, hw⟩ := walk_of_field_ne nbr h h0 o (lit u) u hlu
  obtain ⟨hd, hmk⟩ := isDist_of_nbr nbr o x u k m hx hu (le_trans hm hle) hw
  exact ⟨hd, by omega⟩

-- [helper]
theorem readback_exists {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3) (o : V)
    (d : ℕ) (known : V → Finset V) (lit : V → ℕ) (T : ℕ)
    (hlit : ∀ x, ∀ u ∈ known x, FirstLit (field nbr h o) u (lit u) ∧ lit u ≤ T)
    (hall : ∀ x u n, u ∈ nbr x → FirstLit (field nbr h o) u n → n < T → u ∈ known x)
    (hhole : ∀ v k, IsDist nbr o v k → k < d → FirstLit (field nbr h o) v k)
    (x : V) (k : ℕ) (hx : IsDist nbr o x (k + 1)) (hkd : k < d) (hreach : k < T ∨ (known x).Nonempty) :
    ∃ w ∈ known x, lit w ≤ k := by
  obtain ⟨y, hy, hyd⟩ := isDist_pred nbr o x k hx
  have hyl := hhole y k hyd hkd
  have viaY : k < T → ∃ w ∈ known x, lit w ≤ k := by
    intro hkT
    have hyk := hall x y k hy hyl hkT
    have hlity := firstLit_unique _ y _ _ (hlit x y hyk).1 hyl
    exact ⟨y, hyk, le_of_eq hlity⟩
  rcases hreach with hkT | ⟨u0, hu0⟩
  · exact viaY hkT
  · by_cases hle : lit u0 ≤ k
    · exact ⟨u0, hu0, hle⟩
    · exact viaY (lt_of_lt_of_le (not_le.mp hle) (hlit x u0 hu0).2)

-- [helper]
theorem readback_core {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0)
    (o g : V) (d : ℕ) (hg : IsDist nbr o g d) (known : V → Finset V) (lit : V → ℕ) (T : ℕ)
    (hsub : ∀ x, known x ⊆ nbr x)
    (hlit : ∀ x, ∀ u ∈ known x, FirstLit (field nbr h o) u (lit u) ∧ lit u ≤ T)
    (hall : ∀ x u n, u ∈ nbr x → FirstLit (field nbr h o) u n → n < T → u ∈ known x)
    (hfound : 0 < d → (known g).Nonempty)
    (hhole : ∀ v k, IsDist nbr o v k → k < d → FirstLit (field nbr h o) v k)
    (p : ℕ → V) (hp0 : p 0 = g)
    (hp : ∀ i < d, IsDist nbr o (p i) (d - i) → (0 < i → lit (p i) = d - i) →
      p (i + 1) ∈ known (p i) ∧ ∀ w ∈ known (p i), lit w ≤ d - i - 1 → lit (p (i + 1)) ≤ d - i - 1) :
    p d = o ∧ (∀ i < d, p i ≠ o ∧ p (i + 1) ∈ nbr (p i)) ∧ (∀ i ≤ d, IsDist nbr o (p i) (d - i)) ∧
      (∀ i, 0 < i → i ≤ d → lit (p i) = d - i) := by
  have key : ∀ i ≤ d, IsDist nbr o (p i) (d - i) ∧ (0 < i → lit (p i) = d - i ∧ lit (p i) ≤ T) := by
    intro i
    induction i with
    | zero =>
      intro _
      rw [hp0, Nat.sub_zero]
      exact ⟨hg, fun hi => absurd hi (lt_irrefl 0)⟩
    | succ i ih =>
      intro hi
      obtain ⟨hdi, hli⟩ := ih (by omega)
      have hk : d - i = (d - i - 1) + 1 := by omega
      rw [hk] at hdi
      obtain ⟨hmem, hmin⟩ := hp i (by omega) (by rw [hk]; exact hdi) (fun hpos => (hli hpos).1)
      have hreach : d - i - 1 < T ∨ (known (p i)).Nonempty := by
        rcases Nat.eq_zero_or_pos i with h0i | hpos
        · subst h0i
          exact Or.inr (by rw [hp0]; exact hfound (by omega))
        · left
          have := hli hpos
          omega
      obtain ⟨w, hw, hwle⟩ := readback_exists nbr h o d known lit T hlit hall hhole (p i) (d - i - 1) hdi
        (by omega) hreach
      have hule := hmin w hw hwle
      have hfl := hlit (p i) (p (i + 1)) hmem
      obtain ⟨hdu, hlu⟩ := readback_step nbr h h0 o lit (p i) (p (i + 1)) (d - i - 1) hdi (hsub _ hmem) hfl.1.1
        hule
      have he : d - (i + 1) = d - i - 1 := by omega
      rw [he]
      exact ⟨hdu, fun _ => ⟨hlu, hfl.2⟩⟩
  refine ⟨?_, fun i hi => ?_, fun i hi => (key i hi).1, fun i hi hid => ((key i hid).2 hi).1⟩
  · have := (key d le_rfl).1
    rw [Nat.sub_self] at this
    exact (isDist_zero_iff nbr o (p d)).mp this
  · have hdi := (key i (le_of_lt hi)).1
    refine ⟨fun heq => ?_, ?_⟩
    · rw [heq] at hdi
      have := isDist_unique nbr o o _ _ hdi ((isDist_zero_iff nbr o o).mpr rfl)
      omega
    · have hk : d - i = (d - i - 1) + 1 := by omega
      rw [hk] at hdi
      have hli := (key i (le_of_lt hi)).2
      obtain ⟨hmem, _⟩ := hp i hi (by rw [hk]; exact hdi) (fun hpos => (hli hpos).1)
      exact hsub _ hmem

/-- L4-Exact, the read-back rule exactly as the code runs it. On any graph with finite in-neighbour sets and any law
`neighbour sum + h(own)` with `h 0 = 0`: if every state at distance `k < d` (`d` the goal's distance) first lights at
step `k`, then every read-back sequence `p` from the goal (each `p (i + 1)` a known in-neighbour of `p i` of least
first-lit step, while `p i` is not the initial state) reaches the initial state at step `d` exactly, every step along a
true arc and away from the initial state before then, `p i` at distance `d - i` (a shortest path), and each visited
state after the goal at first-lit step `d - i`, strictly below its successor's (so the code's check never fires). -/
theorem thm_frontier_readback_shortest {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3)
    (h0 : h 0 = 0) (o g : V) (d : ℕ) (hg : IsDist nbr o g d) (known : V → Finset V) (lit : V → ℕ) (T : ℕ)
    (hsub : ∀ x, known x ⊆ nbr x)
    (hlit : ∀ x, ∀ u ∈ known x, FirstLit (field nbr h o) u (lit u) ∧ lit u ≤ T)
    (hall : ∀ x u n, u ∈ nbr x → FirstLit (field nbr h o) u n → n < T → u ∈ known x)
    (hfound : 0 < d → (known g).Nonempty)
    (hhole : ∀ v k, IsDist nbr o v k → k < d → FirstLit (field nbr h o) v k)
    (p : ℕ → V) (hp0 : p 0 = g) (hp : ∀ i, p i ≠ o → ReadBack known lit (p i) (p (i + 1))) :
    p d = o ∧ (∀ i < d, p i ≠ o ∧ p (i + 1) ∈ nbr (p i)) ∧ (∀ i ≤ d, IsDist nbr o (p i) (d - i)) ∧
      (∀ i, 0 < i → i ≤ d → lit (p i) = d - i) := by
  refine readback_core nbr h h0 o g d hg known lit T hsub hlit hall hfound hhole p hp0 ?_
  intro i hi hdi _
  have hne : p i ≠ o := by
    intro heq
    rw [heq] at hdi
    have := isDist_unique nbr o o _ _ hdi ((isDist_zero_iff nbr o o).mpr rfl)
    omega
  obtain ⟨hmem, hmin⟩ := hp i hne
  exact ⟨hmem, fun w hw hwle => le_trans (hmin w hw) hwle⟩

/-- L4-Exact for the looser rule "step to any earlier-lit known in-neighbour": the first step from the goal takes a
known in-neighbour of least first-lit step (the goal itself may light late or never), every later step any known
in-neighbour lit strictly before the current state. The conclusion is that of `thm_frontier_readback_shortest`. -/
theorem thm_frontier_readback_earlier {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3)
    (h0 : h 0 = 0) (o g : V) (d : ℕ) (hg : IsDist nbr o g d) (known : V → Finset V) (lit : V → ℕ) (T : ℕ)
    (hsub : ∀ x, known x ⊆ nbr x)
    (hlit : ∀ x, ∀ u ∈ known x, FirstLit (field nbr h o) u (lit u) ∧ lit u ≤ T)
    (hall : ∀ x u n, u ∈ nbr x → FirstLit (field nbr h o) u n → n < T → u ∈ known x)
    (hfound : 0 < d → (known g).Nonempty)
    (hhole : ∀ v k, IsDist nbr o v k → k < d → FirstLit (field nbr h o) v k)
    (p : ℕ → V) (hp0 : p 0 = g) (hfirst : g ≠ o → ReadBack known lit g (p 1))
    (hp : ∀ i, 0 < i → p i ≠ o → p (i + 1) ∈ known (p i) ∧ lit (p (i + 1)) < lit (p i)) :
    p d = o ∧ (∀ i < d, p i ≠ o ∧ p (i + 1) ∈ nbr (p i)) ∧ (∀ i ≤ d, IsDist nbr o (p i) (d - i)) ∧
      (∀ i, 0 < i → i ≤ d → lit (p i) = d - i) := by
  refine readback_core nbr h h0 o g d hg known lit T hsub hlit hall hfound hhole p hp0 ?_
  intro i hi hdi hli
  have hne : p i ≠ o := by
    intro heq
    rw [heq] at hdi
    have := isDist_unique nbr o o _ _ hdi ((isDist_zero_iff nbr o o).mpr rfl)
    omega
  rcases Nat.eq_zero_or_pos i with h0i | hpos
  · subst h0i
    rw [hp0] at hne ⊢
    obtain ⟨hmem, hmin⟩ := hfirst hne
    exact ⟨hmem, fun w hw hwle => le_trans (hmin w hw) hwle⟩
  · obtain ⟨hmem, hlt⟩ := hp i hpos hne
    have := hli hpos
    exact ⟨hmem, fun _ _ _ => by omega⟩

/-- L4-Exact with the hole condition as arithmetic: if no state at distance `k < d` has a number of geodesics from the
initial state divisible by 3 (no Lucas hole inside the goal's radius), the code's read-back is a shortest path. -/
theorem thm_frontier_readback_lucas {V : Type} [DecidableEq V] (nbr : V → Finset V) (h : ZMod 3 → ZMod 3)
    (h0 : h 0 = 0) (o g : V) (d : ℕ) (hg : IsDist nbr o g d) (known : V → Finset V) (lit : V → ℕ) (T : ℕ)
    (hsub : ∀ x, known x ⊆ nbr x)
    (hlit : ∀ x, ∀ u ∈ known x, FirstLit (field nbr h o) u (lit u) ∧ lit u ≤ T)
    (hall : ∀ x u n, u ∈ nbr x → FirstLit (field nbr h o) u n → n < T → u ∈ known x)
    (hfound : 0 < d → (known g).Nonempty)
    (hlucas : ∀ v k, IsDist nbr o v k → k < d → (walks nbr o k v : ZMod 3) ≠ 0)
    (p : ℕ → V) (hp0 : p 0 = g) (hp : ∀ i, p i ≠ o → ReadBack known lit (p i) (p (i + 1))) :
    p d = o ∧ (∀ i < d, p i ≠ o ∧ p (i + 1) ∈ nbr (p i)) ∧ (∀ i ≤ d, IsDist nbr o (p i) (d - i)) ∧
      (∀ i, 0 < i → i ≤ d → lit (p i) = d - i) :=
  thm_frontier_readback_shortest nbr h h0 o g d hg known lit T hsub hlit hall hfound
    (fun v k hd hkd => (thm_frontier_lights_iff nbr h h0 o v k hd.2).mpr (hlucas v k hd hkd)) p hp0 hp

/-! ### In Mathlib's graph vocabulary -/

-- [helper]
theorem walks_ne_zero_iff {V : Type} [DecidableEq V] (G : SimpleGraph V) [G.LocallyFinite] (o v : V) (n : ℕ) :
    walks (fun i => G.neighborFinset i) o n v ≠ 0 ↔ ∃ q : G.Walk o v, q.length = n := by
  rw [walks_eq_card_finsetWalkLength, card_walks_reverse, Ne, Fintype.card_eq_zero_iff, not_isEmpty_iff]
  constructor
  · rintro ⟨⟨q, hq⟩⟩
    exact ⟨q, hq⟩
  · rintro ⟨q, hq⟩
    exact ⟨⟨q, hq⟩⟩

/-- On a locally finite `SimpleGraph`, `IsDist` is Mathlib's distance: `v` is at distance `n` exactly when it is
reachable and `G.dist o v = n`. -/
theorem thm_frontier_isDist_simple_graph {V : Type} [DecidableEq V] (G : SimpleGraph V) [G.LocallyFinite]
    (o v : V) (n : ℕ) : IsDist (fun i => G.neighborFinset i) o v n ↔ G.Reachable o v ∧ G.dist o v = n := by
  constructor
  · rintro ⟨hne, hlt⟩
    obtain ⟨q, hq⟩ := (walks_ne_zero_iff G o v n).mp hne
    have hr : G.Reachable o v := ⟨q⟩
    refine ⟨hr, ?_⟩
    have hle : G.dist o v ≤ n := hq ▸ SimpleGraph.dist_le q
    by_contra hneq
    obtain ⟨q', hq'⟩ := hr.exists_walk_length_eq_dist
    exact (walks_ne_zero_iff G o v _).mpr ⟨q', hq'⟩ (hlt _ (lt_of_le_of_ne hle hneq))
  · rintro ⟨hr, hd⟩
    obtain ⟨q, hq⟩ := hr.exists_walk_length_eq_dist
    refine ⟨(walks_ne_zero_iff G o v n).mpr ⟨q, hq.trans hd⟩, fun m hm => ?_⟩
    by_contra hne
    obtain ⟨q', hq'⟩ := (walks_ne_zero_iff G o v m).mp hne
    have := SimpleGraph.dist_le q'
    omega

/-- L4-Exact on any locally finite `SimpleGraph`, in Mathlib's words: if every state `v` reachable from the initial
state with `G.dist o v < G.dist o g` first lights at step `G.dist o v`, the code's read-back from a reachable goal
`g` reaches `o` after exactly `G.dist o g` steps, each step to an adjacent state with `G.dist o` one smaller. -/
theorem thm_frontier_readback_simple_graph {V : Type} [DecidableEq V] (G : SimpleGraph V) [G.LocallyFinite]
    (h : ZMod 3 → ZMod 3) (h0 : h 0 = 0) (o g : V) (hgr : G.Reachable o g)
    (known : V → Finset V) (lit : V → ℕ) (T : ℕ)
    (hsub : ∀ x, known x ⊆ G.neighborFinset x)
    (hlit : ∀ x, ∀ u ∈ known x, FirstLit (field (fun i => G.neighborFinset i) h o) u (lit u) ∧ lit u ≤ T)
    (hall : ∀ x u n, G.Adj x u → FirstLit (field (fun i => G.neighborFinset i) h o) u n → n < T → u ∈ known x)
    (hfound : g ≠ o → (known g).Nonempty)
    (hhole : ∀ v, G.Reachable o v → G.dist o v < G.dist o g →
      FirstLit (field (fun i => G.neighborFinset i) h o) v (G.dist o v))
    (p : ℕ → V) (hp0 : p 0 = g) (hp : ∀ i, p i ≠ o → ReadBack known lit (p i) (p (i + 1))) :
    p (G.dist o g) = o ∧ (∀ i < G.dist o g, p i ≠ o ∧ G.Adj (p i) (p (i + 1))) ∧
      (∀ i ≤ G.dist o g, G.Reachable o (p i) ∧ G.dist o (p i) = G.dist o g - i) := by
  have hg : IsDist (fun i => G.neighborFinset i) o g (G.dist o g) :=
    (thm_frontier_isDist_simple_graph G o g _).mpr ⟨hgr, rfl⟩
  have hfound' : 0 < G.dist o g → (known g).Nonempty := by
    intro hpos
    refine hfound (fun heq => ?_)
    rw [heq, SimpleGraph.dist_self] at hpos
    exact lt_irrefl 0 hpos
  have hall' : ∀ x u n, u ∈ G.neighborFinset x →
      FirstLit (field (fun i => G.neighborFinset i) h o) u n → n < T → u ∈ known x :=
    fun x u n hu => hall x u n ((SimpleGraph.mem_neighborFinset G x u).mp hu)
  have hhole' : ∀ v k, IsDist (fun i => G.neighborFinset i) o v k → k < G.dist o g →
      FirstLit (field (fun i => G.neighborFinset i) h o) v k := by
    intro v k hd hk
    obtain ⟨hr, hdv⟩ := (thm_frontier_isDist_simple_graph G o v k).mp hd
    rw [← hdv] at hk ⊢
    exact hhole v hr hk
  obtain ⟨hend, hstep, hdist, _⟩ := thm_frontier_readback_shortest (fun i => G.neighborFinset i) h h0 o g
    (G.dist o g) hg known lit T hsub hlit hall' hfound' hhole' p hp0 hp
  refine ⟨hend, fun i hi => ?_, fun i hi => (thm_frontier_isDist_simple_graph G o (p i) _).mp (hdist i hi)⟩
  obtain ⟨hne, hmem⟩ := hstep i hi
  exact ⟨hne, (SimpleGraph.mem_neighborFinset G (p i) (p (i + 1))).mp hmem⟩

end Frontier

end Compute

end Vibe
