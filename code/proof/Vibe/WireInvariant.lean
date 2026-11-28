/-!
# Vibe Theory: the passenger laws of the 3-cycle wire rules

The pair rules whose sum-0 fiber is a 3-cycle carry wires locked to one side of every pair. Some of
them keep one tone as a fixed PASSENGER of one side: after the rule the second cell holds the tone
exactly when the first cell did (forward), or the first cell holds it exactly when the second did
(backward). On the brick line every cell alternates sides, so the values a cell carries into its
next pair as the first cell lie along one right-moving light ray, and those it carries in as the
second cell along one left-moving ray; the rays cross at every pair. A passenger law then says the
tone's indicator never changes along a ray of its side, whatever crosses it (`rightRay`,
`leftRay`, with an arbitrary crossing sequence that may depend on the inputs).

* `swap.BCA.swap` keeps `+1` forward and `-1` backward; `swap.CAB.swap` keeps `-1` forward and `+1`
  backward. Both sides carry a passenger, so no ray, started at an input or at a constant, carries
  Kleene `neg`, `min` or `max` (`thm_wire_bca_no_neg_right` and the rest).
* `id.CAB.swap` keeps `+1` backward only (on the `+1` background: a left ray is empty for ever or
  never) and keeps no tone forward, so its right rays, where its wires run, are unconstrained; the
  experiment E-CMP-0058 exhibits a width-9 line layout that computes `neg` on such a wire.

Core Lean only: `decide` over finite cases and list induction, zero `sorry`, zero `axiom`, zero
`native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace WireInvariant

/-- A tone: `m = -1`, `z = 0`, `p = +1`. -/
inductive T
  | m
  | z
  | p
  deriving DecidableEq, Repr

/-- `swap.BCA.swap` on (first, second): `s-` swap, `s0` `A ↦ B ↦ C ↦ A`, `s+` swap. -/
def bcaSwap : T → T → T × T
  | .m, .z => (.z, .m)
  | .z, .m => (.m, .z)
  | .z, .p => (.p, .z)
  | .p, .z => (.z, .p)
  | .m, .p => (.z, .z)
  | .z, .z => (.p, .m)
  | .p, .m => (.m, .p)
  | a, b => (a, b)

/-- `swap.CAB.swap`: `s-` swap, `s0` `A ↦ C ↦ B ↦ A`, `s+` swap. -/
def cabSwap : T → T → T × T
  | .m, .z => (.z, .m)
  | .z, .m => (.m, .z)
  | .z, .p => (.p, .z)
  | .p, .z => (.z, .p)
  | .m, .p => (.p, .m)
  | .z, .z => (.m, .p)
  | .p, .m => (.z, .z)
  | a, b => (a, b)

/-- `id.CAB.swap`: `s-` identity, `s0` `A ↦ C ↦ B ↦ A`, `s+` swap. -/
def cabId : T → T → T × T
  | .z, .p => (.p, .z)
  | .p, .z => (.z, .p)
  | .m, .p => (.p, .m)
  | .z, .z => (.m, .p)
  | .p, .m => (.z, .z)
  | a, b => (a, b)

/-- A right-moving ray: its value enters each pair as the first cell and leaves as the second. -/
def rightRay (r : T → T → T × T) : T → List T → T
  | a, [] => a
  | a, b :: bs => rightRay r (r a b).2 bs

/-- A left-moving ray: its value enters each pair as the second cell and leaves as the first. -/
def leftRay (r : T → T → T × T) : T → List T → T
  | b, [] => b
  | b, a :: as => leftRay r (r a b).1 as

theorem thm_wire_bca_passengers (a b : T) :
    ((bcaSwap a b).2 = .p ↔ a = .p) ∧ ((bcaSwap a b).1 = .m ↔ b = .m) := by
  cases a <;> cases b <;> decide

theorem thm_wire_cab_passengers (a b : T) :
    ((cabSwap a b).2 = .m ↔ a = .m) ∧ ((cabSwap a b).1 = .p ↔ b = .p) := by
  cases a <;> cases b <;> decide

/-- `id.CAB.swap` keeps `+1` backward... -/
theorem thm_wire_cab_id_backward (a b : T) : (cabId a b).1 = .p ↔ b = .p := by
  cases a <;> cases b <;> decide

/-- ...and keeps no tone forward: every forward law fails on some pair. -/
theorem thm_wire_cab_id_no_forward :
    ¬ (∀ a b : T, (cabId a b).2 = .m ↔ a = .m) ∧
    ¬ (∀ a b : T, (cabId a b).2 = .z ↔ a = .z) ∧
    ¬ (∀ a b : T, (cabId a b).2 = .p ↔ a = .p) := by
  refine ⟨fun h => ?_, fun h => ?_, fun h => ?_⟩
  · exact absurd ((h .m .z).mpr rfl) (by decide)
  · exact absurd ((h .z .z).mpr rfl) (by decide)
  · exact absurd ((h .p .m).mpr rfl) (by decide)

-- [helper]
theorem right_ray_forward (r : T → T → T × T) (v : T) (h : ∀ a b, (r a b).2 = v ↔ a = v) :
    ∀ (bs : List T) (a : T), rightRay r a bs = v ↔ a = v := by
  intro bs
  induction bs with
  | nil => intro a; exact Iff.rfl
  | cons b bs ih => intro a; exact (ih _).trans (h a b)

-- [helper]
theorem left_ray_backward (r : T → T → T × T) (v : T) (h : ∀ a b, (r a b).1 = v ↔ b = v) :
    ∀ (as : List T) (b : T), leftRay r b as = v ↔ b = v := by
  intro as
  induction as with
  | nil => intro b; exact Iff.rfl
  | cons a as ih => intro b; exact (ih _).trans (h a b)

/-- Along a right ray of `swap.BCA.swap` the `+1` indicator never changes; along a left ray the `-1`. -/
theorem thm_wire_bca_rays (a : T) (bs : List T) :
    (rightRay bcaSwap a bs = .p ↔ a = .p) ∧ (leftRay bcaSwap a bs = .m ↔ a = .m) :=
  ⟨right_ray_forward bcaSwap .p (fun a b => (thm_wire_bca_passengers a b).1) bs a,
   left_ray_backward bcaSwap .m (fun a b => (thm_wire_bca_passengers a b).2) bs a⟩

theorem thm_wire_cab_rays (a : T) (bs : List T) :
    (rightRay cabSwap a bs = .m ↔ a = .m) ∧ (leftRay cabSwap a bs = .p ↔ a = .p) :=
  ⟨right_ray_forward cabSwap .m (fun a b => (thm_wire_cab_passengers a b).1) bs a,
   left_ray_backward cabSwap .p (fun a b => (thm_wire_cab_passengers a b).2) bs a⟩

/-- `id.CAB.swap`: a left ray holds `+1` (the empty slot on the `+1` background) for ever or never. -/
theorem thm_wire_cab_id_left_ray (b : T) (as : List T) : leftRay cabId b as = .p ↔ b = .p :=
  left_ray_backward cabId .p thm_wire_cab_id_backward as b

/-- Kleene negation. -/
def tneg : T → T
  | .m => .p
  | .z => .z
  | .p => .m

def rank : T → Nat
  | .m => 0
  | .z => 1
  | .p => 2

def tmax (x y : T) : T := if rank y ≤ rank x then x else y

def tmin (x y : T) : T := if rank x ≤ rank y then x else y

/-- A ray's start: the input itself, or a constant of the layout. -/
def Start (s : T → T) : Prop := (∀ x, s x = x) ∨ ∃ c, ∀ x, s x = c

/-- A two-input ray start: one of the inputs, or a constant. -/
def Start2 (s : T → T → T) : Prop :=
  (∀ x y, s x y = x) ∨ (∀ x y, s x y = y) ∨ ∃ c, ∀ x y, s x y = c

/-- A one-tone passenger reading: `ray x` holds `v` exactly when its start does. -/
def Keeps (v : T) (s : T → T) (ray : T → T) : Prop := ∀ x, ray x = v ↔ s x = v

-- [helper]
/-- No ray whose indicator of `+1` or of `-1` follows its start computes `neg`. -/
theorem no_neg_of_keeps (v : T) (hv : v ≠ .z) (s : T → T) (hs : Start s) (ray : T → T)
    (hk : Keeps v s ray) : ¬ ∀ x, ray x = tneg x := by
  intro h
  have e : ∀ x, tneg x = v ↔ s x = v := fun x => by rw [← h x]; exact hk x
  rcases hs with hid | ⟨c, hc⟩
  · cases v with
    | z => exact hv rfl
    | p => have a := e .p; rw [hid] at a; exact absurd (a.mpr rfl) (by decide)
    | m => have a := e .m; rw [hid] at a; exact absurd (a.mpr rfl) (by decide)
  · cases v with
    | z => exact hv rfl
    | p =>
      have a := e .m
      have b := e .p
      rw [hc] at a b
      exact absurd (b.mpr (a.mp (by decide))) (by decide)
    | m =>
      have a := e .p
      have b := e .m
      rw [hc] at a b
      exact absurd (b.mpr (a.mp (by decide))) (by decide)

/-- No ray of either side of `swap.BCA.swap`, started at an input or a constant and crossed by any
input-dependent sequence, computes `neg`. -/
theorem thm_wire_bca_no_neg (s : T → T) (hs : Start s) (g : T → List T) :
    (¬ ∀ x, rightRay bcaSwap (s x) (g x) = tneg x) ∧ (¬ ∀ x, leftRay bcaSwap (s x) (g x) = tneg x) :=
  ⟨no_neg_of_keeps .p (by decide) s hs _ (fun x => (thm_wire_bca_rays (s x) (g x)).1),
   no_neg_of_keeps .m (by decide) s hs _ (fun x => (thm_wire_bca_rays (s x) (g x)).2)⟩

theorem thm_wire_cab_no_neg (s : T → T) (hs : Start s) (g : T → List T) :
    (¬ ∀ x, rightRay cabSwap (s x) (g x) = tneg x) ∧ (¬ ∀ x, leftRay cabSwap (s x) (g x) = tneg x) :=
  ⟨no_neg_of_keeps .m (by decide) s hs _ (fun x => (thm_wire_cab_rays (s x) (g x)).1),
   no_neg_of_keeps .p (by decide) s hs _ (fun x => (thm_wire_cab_rays (s x) (g x)).2)⟩

-- [helper]
/-- A two-input ray whose `v` indicator follows its start computes neither `min` nor `max`. -/
theorem no_min_max_of_keeps (v : T) (hv : v ≠ .z) (s : T → T → T) (hs : Start2 s) (ray : T → T → T)
    (hk : ∀ x y, ray x y = v ↔ s x y = v) :
    (¬ ∀ x y, ray x y = tmin x y) ∧ (¬ ∀ x y, ray x y = tmax x y) := by
  have key : ∀ f : T → T → T, (∀ x y, ray x y = f x y) →
      (∀ x y, f x y = v ↔ s x y = v) := fun f h x y => by rw [← h x y]; exact hk x y
  constructor
  · intro h
    have e := key tmin h
    cases v with
    | z => exact hv rfl
    | p =>
      rcases hs with h1 | h1 | ⟨c, h1⟩
      · have := e .p .z; rw [h1] at this; exact absurd this (by decide)
      · have := e .z .p; rw [h1] at this; exact absurd this (by decide)
      · have a := e .p .p; have b := e .z .z; rw [h1] at a b
        exact absurd (b.mpr (a.mp (by decide))) (by decide)
    | m =>
      rcases hs with h1 | h1 | ⟨c, h1⟩
      · have := e .z .m; rw [h1] at this; exact absurd this (by decide)
      · have := e .m .z; rw [h1] at this; exact absurd this (by decide)
      · have a := e .m .z; have b := e .z .z; rw [h1] at a b
        exact absurd (b.mpr (a.mp (by decide))) (by decide)
  · intro h
    have e := key tmax h
    cases v with
    | z => exact hv rfl
    | p =>
      rcases hs with h1 | h1 | ⟨c, h1⟩
      · have := e .z .p; rw [h1] at this; exact absurd this (by decide)
      · have := e .p .z; rw [h1] at this; exact absurd this (by decide)
      · have a := e .p .z; have b := e .z .z; rw [h1] at a b
        exact absurd (b.mpr (a.mp (by decide))) (by decide)
    | m =>
      rcases hs with h1 | h1 | ⟨c, h1⟩
      · have := e .m .z; rw [h1] at this; exact absurd this (by decide)
      · have := e .z .m; rw [h1] at this; exact absurd this (by decide)
      · have a := e .m .m; have b := e .z .z; rw [h1] at a b
        exact absurd (b.mpr (a.mp (by decide))) (by decide)

/-- `swap.BCA.swap`: no ray of either side computes `min` or `max`. -/
theorem thm_wire_bca_no_min_max (s : T → T → T) (hs : Start2 s) (g : T → T → List T) :
    ((¬ ∀ x y, rightRay bcaSwap (s x y) (g x y) = tmin x y) ∧
      (¬ ∀ x y, rightRay bcaSwap (s x y) (g x y) = tmax x y)) ∧
    ((¬ ∀ x y, leftRay bcaSwap (s x y) (g x y) = tmin x y) ∧
      (¬ ∀ x y, leftRay bcaSwap (s x y) (g x y) = tmax x y)) :=
  ⟨no_min_max_of_keeps .p (by decide) s hs _ (fun x y => (thm_wire_bca_rays (s x y) (g x y)).1),
   no_min_max_of_keeps .m (by decide) s hs _ (fun x y => (thm_wire_bca_rays (s x y) (g x y)).2)⟩

theorem thm_wire_cab_no_min_max (s : T → T → T) (hs : Start2 s) (g : T → T → List T) :
    ((¬ ∀ x y, rightRay cabSwap (s x y) (g x y) = tmin x y) ∧
      (¬ ∀ x y, rightRay cabSwap (s x y) (g x y) = tmax x y)) ∧
    ((¬ ∀ x y, leftRay cabSwap (s x y) (g x y) = tmin x y) ∧
      (¬ ∀ x y, leftRay cabSwap (s x y) (g x y) = tmax x y)) :=
  ⟨no_min_max_of_keeps .m (by decide) s hs _ (fun x y => (thm_wire_cab_rays (s x y) (g x y)).1),
   no_min_max_of_keeps .p (by decide) s hs _ (fun x y => (thm_wire_cab_rays (s x y) (g x y)).2)⟩

end WireInvariant

end Vibe
