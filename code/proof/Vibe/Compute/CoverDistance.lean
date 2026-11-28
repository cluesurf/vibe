import Mathlib.Combinatorics.SimpleGraph.Metric
import Mathlib.Combinatorics.SimpleGraph.Maps
import Mathlib.Combinatorics.SimpleGraph.Walk.Operations
import Mathlib.Combinatorics.SimpleGraph.Walk.Maps
import Mathlib.Combinatorics.SimpleGraph.Walk.Traversal

/-!
# Cover distance: what a closed quotient can read of distance on its cover (L20, claim A32)

Decision 006, as amended by the M1 audit fixes, gates the `surface_limited` systole branch on the loop systole `L`
of a closed quotient (the shortest closed walk that does not lift to a closed walk on the tiling), and states:
quotient distance never exceeds cover distance, and equals it whenever the cover distance is at most `L / 2`. The
lab reads `L` as `2r + 2` when some `(r + 1)`-ball loses a cell and `2r + 3` otherwise, where `r` is the injectivity
radius (every `r`-ball equals the tiling's). This file proves all of that for an arbitrary graph covering map.

Mathlib has no graph covering maps, so `GraphCover G H` is defined minimally: a surjective `SimpleGraph` hom that is
a bijection from each neighbourhood onto the neighbourhood of the image. Walks lift uniquely (`thm_cover_exists_lift`,
`thm_cover_lift_unique`). `LiftsBelow L` says every closed walk of length below `L` lifts to closed walks, so it holds for
every `L` up to the loop systole, and `IsLoopSystole L` says `L` is exactly the loop systole (`LiftsBelow L` plus a
closed walk of length `L` with an open lift). Distances are Mathlib's `SimpleGraph.dist`, balls are
`coverBall K c r = {x | K.Reachable c x ∧ K.dist c x ≤ r}`.

Headline theorems:
- `thm_cover_dist_le`: quotient distance never exceeds cover distance.
- `thm_cover_dist_eq`: under `LiftsBelow L`, quotient distance equals cover distance when `2 * dist ≤ L`.
- `thm_cover_injOn_ball`: under `LiftsBelow L`, the covering is injective on every ball of radius `r` with `2r < L`.
- `thm_cover_adj_ball`, `thm_cover_ball_iso`: when `2r + 1 < L` it also reflects adjacency there, and the cover's
  `r`-ball is isomorphic (as an induced graph, by the covering itself) to the quotient's `r`-ball. The bound is
  `2r + 1 < L`, not `2r < L`: the cover of a triangle by the line has `L = 3`, and its 1-balls are a path of 3 against
  a triangle. Below `2r < L` only the vertex bijection and the distances from the centre survive.
- `thm_cover_lifts_of_injOn`, `thm_cover_lifts_of_ball_embeds`: the lower-bound logic. Injective `r`-balls give
  `LiftsBelow (2r + 1)`; `r`-balls that embed as induced graphs give `LiftsBelow (2r + 2)`.
- `thm_cover_systole_le`: a `LiftsBelow L'` never exceeds the loop systole.
- `thm_cover_systole_sharp`, `thm_cover_dist_gap`: at the loop systole the covering is not injective on some ball of
  radius `⌈L / 2⌉`, and two points at cover distance between 1 and `L` read quotient distance 0.
- `thm_cover_systole_even`, `thm_cover_systole_odd`: the lab's rule. If every `r`-ball embeds and some `(r + 1)`-ball
  loses a cell, `L = 2r + 2`; if every `(r + 1)`-ball keeps its cells but some loses an edge, `L = 2r + 3`.
- `thm_surface_limited_reads`: if a quotient radius `m` has `2m > L`, the cover distance has `2d > L`.

What the `surface_limited` systole label then proves, and what it does not: a mover whose quotient radius `m` has
`2m > L` has cover distance past `L / 2` (`thm_surface_limited_reads`), and past `L / 2` quotient distance no longer
determines cover distance (`thm_cover_dist_gap`, with the exact `L`), so the quotient's radius track cannot decide the
ballistic radius test. Below `L / 2` it reads cover distance exactly (`thm_cover_dist_eq`), which is why a mere lower
bound on `L` must refuse the gate: with `L₀ < L`, a reading `L₀ < 2m ≤ L` is still an exact cover distance. The label
says nothing about what the mover does on the cover (ballistic, bounded or wandering); that reading belongs to the
open lazy window (M1 audit, m1-classification Limits).
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

open SimpleGraph SimpleGraph.Walk

/-- The closed ball of radius `r` about `c` in Mathlib's graph distance (reachable vertices only, since
`SimpleGraph.dist` reads 0 between components). -/
def coverBall {X : Type*} (K : SimpleGraph X) (c : X) (r : ℕ) : Set X :=
  {x | K.Reachable c x ∧ K.dist c x ≤ r}

-- [helper]
theorem mem_coverBall_of_walk {X : Type*} {K : SimpleGraph X} {c x : X} {r : ℕ} (q : K.Walk c x)
    (h : q.length ≤ r) : x ∈ coverBall K c r :=
  ⟨⟨q⟩, (dist_le q).trans h⟩

-- [helper]
theorem exists_walk_of_mem_coverBall {X : Type*} {K : SimpleGraph X} {c x : X} {r : ℕ}
    (hx : x ∈ coverBall K c r) : ∃ q : K.Walk c x, q.length ≤ r := by
  obtain ⟨q, hq⟩ := hx.1.exists_walk_length_eq_dist
  exact ⟨q, hq ▸ hx.2⟩

/-- A graph covering map: a surjective graph hom that maps each neighbourhood bijectively onto the neighbourhood of
the image. A closed quotient of a tiling, with the tiling as cover, is one. -/
structure GraphCover {V W : Type*} (G : SimpleGraph V) (H : SimpleGraph W) where
  /-- the underlying graph hom -/
  hom : G →g H
  /-- every quotient vertex is covered -/
  surj : Function.Surjective hom
  /-- local bijectivity on neighbourhoods -/
  nbr : ∀ v : V, Set.BijOn hom (G.neighborSet v) (H.neighborSet (hom v))

namespace GraphCover

variable {V W : Type*} {G : SimpleGraph V} {H : SimpleGraph W} (p : GraphCover G H)

/-- Every closed walk of length below `L` lifts to closed walks: any walk upstairs whose image is the closed walk
starts and ends at the same vertex. It holds for every `L` up to the loop systole. -/
def LiftsBelow (L : ℕ) : Prop :=
  ∀ ⦃b : W⦄ (w : H.Walk b b), w.length < L →
    ∀ ⦃x y : V⦄ (g : G.Walk x y), g.support.map p.hom = w.support → x = y

/-- `L` is the loop systole: closed walks shorter than `L` lift closed, and some closed walk of length `L` has a lift
that does not close. -/
def IsLoopSystole (L : ℕ) : Prop :=
  p.LiftsBelow L ∧ ∃ (b : W) (w : H.Walk b b) (x y : V) (g : G.Walk x y),
    w.length = L ∧ g.support.map p.hom = w.support ∧ x ≠ y

/-- Every `r`-ball of the cover maps onto its image as an induced graph: injectively and reflecting adjacency. This
is the lab's "every `r`-ball equals the tiling's" (injectivity radius at least `r`). -/
def BallEmbeds (r : ℕ) : Prop :=
  ∀ u : V, Set.InjOn p.hom (coverBall G u r) ∧
    ∀ x ∈ coverBall G u r, ∀ y ∈ coverBall G u r, H.Adj (p.hom x) (p.hom y) → G.Adj x y

/-- Walks lift: a walk downstairs from `p x` has a lift from `x` with the same length. -/
theorem thm_cover_exists_lift {u v : W} (w : H.Walk u v) (x : V) (hx : p.hom x = u) :
    ∃ (y : V) (g : G.Walk x y), p.hom y = v ∧ g.length = w.length ∧ g.support.map p.hom = w.support := by
  induction w generalizing x with
  | nil => exact ⟨x, .nil, hx, rfl, by simp [hx]⟩
  | @cons a b c h q ih =>
    subst hx
    obtain ⟨x', hx'adj, hx'⟩ := (p.nbr x).surjOn (show b ∈ H.neighborSet (p.hom x) by simpa using h)
    obtain ⟨y, g, hy, hlen, hg⟩ := ih x' hx'
    exact ⟨y, .cons (by simpa using hx'adj) g, hy, by simp [hlen], by simp [hg]⟩

/-- Lifts are unique: two walks from one vertex with the same image end at the same vertex. -/
theorem thm_cover_lift_unique {x y₁ : V} (g₁ : G.Walk x y₁) :
    ∀ {y₂ : V} (g₂ : G.Walk x y₂), g₁.support.map p.hom = g₂.support.map p.hom → y₁ = y₂ := by
  induction g₁ with
  | nil =>
    intro y₂ g₂ h
    cases g₂ with
    | nil => rfl
    | cons ha q => cases q <;> simp at h
  | @cons a b c ha q ih =>
    intro y₂ g₂ h
    cases g₂ with
    | nil => cases q <;> simp at h
    | @cons _ b' _ hb q' =>
      simp only [support_cons, List.map_cons, List.cons.injEq, true_and] at h
      have hbb : b = b' := by
        have h1 := congrArg List.head? h
        rw [← cons_tail_support q, ← cons_tail_support q'] at h1
        simp only [List.map_cons, List.head?_cons, Option.some.injEq] at h1
        exact (p.nbr a).injOn (by simpa using ha) (by simpa using hb) h1
      subst hbb
      exact ih q' h

-- [helper]
theorem lift_ends {u v : W} (w : H.Walk u v) {x y : V} (g : G.Walk x y)
    (hg : g.support.map p.hom = w.support) : p.hom x = u ∧ p.hom y = v ∧ g.length = w.length := by
  have hx : p.hom x = u := by
    have h1 := congrArg List.head? hg
    rw [← cons_tail_support g, ← cons_tail_support w] at h1
    simp only [List.map_cons, List.head?_cons, Option.some.injEq] at h1
    exact h1
  obtain ⟨y', g', hy', hlen', hg'⟩ := p.thm_cover_exists_lift w x hx
  have hyy : y = y' := p.thm_cover_lift_unique g g' (hg.trans hg'.symm)
  subst hyy
  exact ⟨hx, hy', by have := congrArg List.length hg; simpa using this⟩

-- [helper]
theorem eq_of_walk_of_lt {L : ℕ} (hL : p.LiftsBelow L) {x y : V} (g : G.Walk x y)
    (hxy : p.hom x = p.hom y) (hg : g.length < L) : x = y :=
  hL ((g.map p.hom).copy rfl hxy.symm) (by simpa using hg) g (by simp)

/-- Quotient distance never exceeds cover distance. -/
theorem thm_cover_dist_le {x y : V} (h : G.Reachable x y) :
    H.dist (p.hom x) (p.hom y) ≤ G.dist x y := by
  obtain ⟨g, hg⟩ := h.exists_walk_length_eq_dist
  calc H.dist (p.hom x) (p.hom y) ≤ (g.map p.hom).length := dist_le _
    _ = G.dist x y := by simp [hg]

/-- Decision 006 (amended): quotient distance equals cover distance whenever the cover distance is at most `L / 2`. -/
theorem thm_cover_dist_eq {L : ℕ} (hL : p.LiftsBelow L) {x y : V} (h : G.Reachable x y)
    (hd : 2 * G.dist x y ≤ L) : H.dist (p.hom x) (p.hom y) = G.dist x y := by
  refine le_antisymm (p.thm_cover_dist_le h) ?_
  by_contra hlt
  rw [not_le] at hlt
  obtain ⟨g, hg⟩ := h.exists_walk_length_eq_dist
  obtain ⟨q, hq⟩ := (h.map p.hom).exists_walk_length_eq_dist
  obtain ⟨z, g', -, hlen', hg'⟩ := p.thm_cover_exists_lift q.reverse y rfl
  have hxz : x = z := by
    refine hL ((g.map p.hom).append q.reverse) ?_ (g.append g') ?_
    · simp only [length_append, length_map, length_reverse]
      omega
    · rw [support_append, support_append, List.map_append, Walk.support_map, ← hg', List.map_tail]
  subst hxz
  have h1 := dist_le g'.reverse
  simp only [length_reverse] at h1 hlen'
  omega

/-- The covering is injective on every ball of radius `r` with `2r < L`. -/
theorem thm_cover_injOn_ball {L : ℕ} (hL : p.LiftsBelow L) (c : V) {r : ℕ} (hr : 2 * r < L) :
    Set.InjOn p.hom (coverBall G c r) := by
  intro x hx y hy hxy
  obtain ⟨g₁, h₁⟩ := exists_walk_of_mem_coverBall hx
  obtain ⟨g₂, h₂⟩ := exists_walk_of_mem_coverBall hy
  exact p.eq_of_walk_of_lt hL (g₁.reverse.append g₂) hxy (by simp only [length_append, length_reverse]; omega)

/-- When `2r + 1 < L` the covering reflects adjacency inside every `r`-ball. -/
theorem thm_cover_adj_ball {L : ℕ} (hL : p.LiftsBelow L) (c : V) {r : ℕ} (hr : 2 * r + 1 < L) {x y : V}
    (hx : x ∈ coverBall G c r) (hy : y ∈ coverBall G c r) (h : H.Adj (p.hom x) (p.hom y)) : G.Adj x y := by
  obtain ⟨y', hy'adj, hy'⟩ := (p.nbr x).surjOn (show p.hom y ∈ H.neighborSet (p.hom x) by simpa using h)
  have hadj : G.Adj x y' := by simpa using hy'adj
  obtain ⟨g₁, h₁⟩ := exists_walk_of_mem_coverBall hx
  obtain ⟨g₂, h₂⟩ := exists_walk_of_mem_coverBall hy
  have hyy : y = y' := p.eq_of_walk_of_lt hL ((g₂.reverse.append g₁).concat hadj) hy'.symm
    (by simp only [length_concat, length_append, length_reverse]; omega)
  subst hyy
  exact hadj

/-- When `2r + 1 < L` the cover's `r`-ball about `c`, as an induced graph, is isomorphic to the quotient's `r`-ball
about `p c`, by the covering itself. -/
theorem thm_cover_ball_iso {L : ℕ} (hL : p.LiftsBelow L) (c : V) {r : ℕ} (hr : 2 * r + 1 < L) :
    ∃ e : G.induce (coverBall G c r) ≃g H.induce (coverBall H (p.hom c) r), ∀ x, (e x : W) = p.hom x := by
  let f : coverBall G c r → coverBall H (p.hom c) r := fun x =>
    ⟨p.hom x, by
      obtain ⟨q, hq⟩ := exists_walk_of_mem_coverBall x.2
      exact mem_coverBall_of_walk (q.map p.hom) (by simpa using hq)⟩
  have hinj : Function.Injective f := by
    intro x y hxy
    exact Subtype.ext (p.thm_cover_injOn_ball hL c (by omega) x.2 y.2 (congrArg Subtype.val hxy))
  have hsurj : Function.Surjective f := by
    intro v
    obtain ⟨q, hq⟩ := exists_walk_of_mem_coverBall v.2
    obtain ⟨y, g, hy, hlen, -⟩ := p.thm_cover_exists_lift q c rfl
    exact ⟨⟨y, mem_coverBall_of_walk g (hlen ▸ hq)⟩, Subtype.ext hy⟩
  refine ⟨{ toEquiv := Equiv.ofBijective f ⟨hinj, hsurj⟩, map_rel_iff' := ?_ }, fun _ => rfl⟩
  intro a b
  simp only [comap_adj, Function.Embedding.coe_subtype]
  exact ⟨fun h => p.thm_cover_adj_ball hL c hr a.2 b.2 h, fun h => p.hom.map_adj h⟩

/-- Lower-bound logic, first half: if every `r`-ball maps injectively, every closed walk of length at most `2r`
lifts closed. -/
theorem thm_cover_lifts_of_injOn {r : ℕ} (hinj : ∀ u : V, Set.InjOn p.hom (coverBall G u r)) :
    p.LiftsBelow (2 * r + 1) := by
  intro b w hw x y g hg
  obtain ⟨hx, hy, hlen⟩ := p.lift_ends w g hg
  refine hinj (g.getVert r) ?_ ?_ (hx.trans hy.symm)
  · exact mem_coverBall_of_walk (g.take r).reverse (by simp)
  · exact mem_coverBall_of_walk (g.drop r) (by simp only [drop_length]; omega)

/-- Lower-bound logic, second half: if every `r`-ball embeds as an induced graph, every closed walk of length at
most `2r + 1` lifts closed, so the loop systole is at least `2r + 2`. -/
theorem thm_cover_lifts_of_ball_embeds {r : ℕ} (he : p.BallEmbeds r) : p.LiftsBelow (2 * r + 2) := by
  intro b w hw x y g hg
  obtain ⟨hx, hy, hlen⟩ := p.lift_ends w g hg
  by_cases hshort : w.length < 2 * r + 1
  · exact p.thm_cover_lifts_of_injOn (fun u => (he u).1) w hshort g hg
  have hl : g.length = 2 * r + 1 := by omega
  have hxu : x ∈ coverBall G (g.getVert r) r :=
    mem_coverBall_of_walk (g.take r).reverse (by simp)
  have hdl : (g.drop r).length = r + 1 := by simp only [drop_length]; omega
  have hzu : (g.drop r).getVert r ∈ coverBall G (g.getVert r) r :=
    mem_coverBall_of_walk ((g.drop r).take r) (by simp)
  have hzy : G.Adj ((g.drop r).getVert r) y := by
    have h1 := (g.drop r).adj_getVert_succ (i := r) (by omega)
    have h2 := (g.drop r).getVert_length
    rw [hdl] at h2
    rwa [h2] at h1
  have hxz : G.Adj x ((g.drop r).getVert r) := by
    refine (he (g.getVert r)).2 x hxu _ hzu ?_
    have h3 := p.hom.map_adj hzy
    rw [hy, ← hx] at h3
    exact h3.symm
  exact (p.nbr ((g.drop r).getVert r)).injOn (by simpa using hxz.symm) (by simpa using hzy)
    (hx.trans hy.symm)

/-- No `LiftsBelow L'` exceeds the loop systole. -/
theorem thm_cover_systole_le {L L' : ℕ} (hs : p.IsLoopSystole L) (hL' : p.LiftsBelow L') : L' ≤ L := by
  obtain ⟨-, b, w, x, y, g, hwL, hg, hxy⟩ := hs
  by_contra hlt
  exact hxy (hL' w (by omega) g hg)

/-- Sharpness: at the loop systole the covering is not injective on some ball of radius `⌈L / 2⌉`. -/
theorem thm_cover_systole_sharp {L : ℕ} (hs : p.IsLoopSystole L) :
    ∃ u : V, ¬ Set.InjOn p.hom (coverBall G u ((L + 1) / 2)) := by
  obtain ⟨-, b, w, x, y, g, hwL, hg, hxy⟩ := hs
  obtain ⟨hx, hy, hlen⟩ := p.lift_ends w g hg
  refine ⟨g.getVert (L / 2), fun hinj => hxy (hinj ?_ ?_ (hx.trans hy.symm))⟩
  · exact mem_coverBall_of_walk (g.take (L / 2)).reverse (by simp only [length_reverse, take_length]; omega)
  · exact mem_coverBall_of_walk (g.drop (L / 2)) (by simp only [drop_length]; omega)

/-- Past half the loop systole the quotient cannot read cover distance: two cover points at cover distance between
1 and `L` read quotient distance 0. -/
theorem thm_cover_dist_gap {L : ℕ} (hs : p.IsLoopSystole L) :
    ∃ x y : V, G.Reachable x y ∧ 0 < G.dist x y ∧ G.dist x y ≤ L ∧ H.dist (p.hom x) (p.hom y) = 0 := by
  obtain ⟨-, b, w, x, y, g, hwL, hg, hxy⟩ := hs
  obtain ⟨hx, hy, hlen⟩ := p.lift_ends w g hg
  refine ⟨x, y, ⟨g⟩, Reachable.pos_dist_of_ne ⟨g⟩ hxy, (dist_le g).trans (by omega), ?_⟩
  rw [hx, hy]
  exact dist_self

/-- The lab's rule, even case: if every `r`-ball embeds and some `(r + 1)`-ball loses a cell, `L = 2r + 2`. -/
theorem thm_cover_systole_even {L r : ℕ} (hs : p.IsLoopSystole L) (he : p.BallEmbeds r)
    (hlose : ∃ u : V, ¬ Set.InjOn p.hom (coverBall G u (r + 1))) : L = 2 * r + 2 := by
  have hlo := p.thm_cover_systole_le hs (p.thm_cover_lifts_of_ball_embeds he)
  obtain ⟨u, hu⟩ := hlose
  by_contra hne
  exact hu (p.thm_cover_injOn_ball hs.1 u (by omega))

/-- The lab's rule, odd case: if every `(r + 1)`-ball keeps its cells but some `(r + 1)`-ball loses an edge (fails to
embed), `L = 2r + 3`. -/
theorem thm_cover_systole_odd {L r : ℕ} (hs : p.IsLoopSystole L)
    (hkeep : ∀ u : V, Set.InjOn p.hom (coverBall G u (r + 1))) (hedge : ¬ p.BallEmbeds (r + 1)) :
    L = 2 * r + 3 := by
  have hlo := p.thm_cover_systole_le hs (p.thm_cover_lifts_of_injOn hkeep)
  by_contra hne
  exact hedge fun u => ⟨hkeep u, fun x hx y hy h => p.thm_cover_adj_ball hs.1 u (by omega) hx hy h⟩

/-- What the `surface_limited` systole gate reads: a quotient radius `m` with `2m > L` means the cover distance `d`
has `2d > L`, past the range where `thm_cover_dist_eq` makes the quotient read it. -/
theorem thm_surface_limited_reads {L : ℕ} {c x : V} (h : G.Reachable c x)
    (hm : L < 2 * H.dist (p.hom c) (p.hom x)) : L < 2 * G.dist c x := by
  have := p.thm_cover_dist_le h
  omega

end GraphCover

end Compute

end Vibe
