/-!
# Vibe Theory: Exact Simulation Contracts Compose

A simulation contract says that a fine rule, read in blocks, runs a coarse rule exactly on a declared
subset of fine configurations. The data are a fine rule `φ : X → X`, a coarse step of `τ` fine
steps, a section `σ : A → X` (each coarse configuration written as one fine configuration made of
declared blocks), a block map `F : X → A` that reads blocks back (`F ∘ σ = id`), and a coarse rule
`G : A → A`. The commuting condition is `φ^τ ∘ σ = σ ∘ G`. The declared subset is the image of `σ`;
nothing is claimed outside it. `iter f n` is `f` applied `n` times.

1. `thm_cf_simulation_contract_composition`: a contract `(σ₁, F₁, G₁)` at `τ₁` under `φ`, followed
   by a contract `(σ₂, F₂, G₂)` at `τ₂` under `G₁`, gives the contract `(σ₁ ∘ σ₂, F₂ ∘ F₁, G₂)` at
   `τ₁ τ₂` under `φ`. In particular `φ^(τ₁ τ₂) ∘ (σ₁ ∘ σ₂) = (σ₁ ∘ σ₂) ∘ G₂`.
2. `thm_cf_simulation_contract_commutes_composition`: the bare commuting form, with no block map.
3. `thm_cf_simulation_contract_power`: a contract at `τ` with rule `G` is a contract at `τ n` with
   rule `G^n`, for every `n`.
4. `thm_cf_simulation_contract_identity`: `(id, id, φ)` is a contract at one step (the unit of
   composition), and `(id, id, id)` at zero steps.
5. `thm_cf_simulation_contract_subset_invariant`: the declared subset (the image of `σ`) is carried
   into itself by `φ^(τ n)` for every `n`.
6. `thm_cf_simulation_contract_rule_unique`: the coarse rule is determined, `G = F ∘ φ^τ ∘ σ`, so two
   contracts with one section and one step have one coarse rule.
7. `thm_cf_full_swap_brick2_contract`: an instance from the block coarse-graining experiment. On a
   ring of 6 cells under the `brick2` schedule (edge `(i, i + 1)` of color `i mod 2`, colors 0 then
   1), the full swap with section `t ↦ (t, 0)` and the decimation map (the first cell of each block)
   is a contract at `b = 2`, `τ = 1`, and its coarse rule is the shift by one block. It holds for
   every tone value, since the full swap only moves tones.
8. `thm_cf_full_swap_brick2_contract_two_rounds`: item 3 applied to item 7 (two rounds, shift by two).

Core only: no Mathlib, no `sorry`, no `axiom`, no `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace SimulationContract

/-- `f` applied `n` times. -/
def iter {X : Type} (f : X → X) : Nat → X → X
  | 0, x => x
  | n + 1, x => iter f n (f x)

/-- An exact simulation contract: `F` reads `σ` back, and `τ` fine steps of `φ` on the declared
subset (the image of `σ`) are one step of `G`. -/
structure Contract {X A : Type} (φ : X → X) (τ : Nat) (σ : A → X) (F : X → A) (G : A → A) : Prop where
  readsBack : ∀ a, F (σ a) = a
  commutes : ∀ a, iter φ τ (σ a) = σ (G a)

private theorem iter_add {X : Type} (f : X → X) (m n : Nat) (x : X) :
    iter f (m + n) x = iter f m (iter f n x) := by
  induction n generalizing x with
  | zero => rfl
  | succ n ih =>
    show iter f (m + n) (f x) = iter f m (iter f n (f x))
    exact ih (f x)

private theorem iter_succ {X : Type} (f : X → X) (n : Nat) (x : X) :
    iter f (n + 1) x = iter f n (f x) := rfl

/-- `φ^τ ∘ σ = σ ∘ G` lifts to `φ^(τ n) ∘ σ = σ ∘ G^n`. -/
private theorem commutes_pow {X A : Type} (φ : X → X) (τ : Nat) (σ : A → X) (G : A → A)
    (h : ∀ a, iter φ τ (σ a) = σ (G a)) (n : Nat) :
    ∀ a, iter φ (τ * n) (σ a) = σ (iter G n a) := by
  induction n with
  | zero => intro a; rfl
  | succ n ih =>
    intro a
    rw [Nat.mul_succ, iter_add, h, ih, iter_succ]

theorem thm_cf_simulation_contract_commutes_composition {X A B : Type} (φ : X → X) (G₁ : A → A)
    (G₂ : B → B) (σ₁ : A → X) (σ₂ : B → A) (τ₁ τ₂ : Nat)
    (h₁ : ∀ a, iter φ τ₁ (σ₁ a) = σ₁ (G₁ a)) (h₂ : ∀ b, iter G₁ τ₂ (σ₂ b) = σ₂ (G₂ b)) :
    ∀ b, iter φ (τ₁ * τ₂) (σ₁ (σ₂ b)) = σ₁ (σ₂ (G₂ b)) := by
  intro b
  rw [commutes_pow φ τ₁ σ₁ G₁ h₁ τ₂, h₂]

theorem thm_cf_simulation_contract_composition {X A B : Type} (φ : X → X) (G₁ : A → A)
    (G₂ : B → B) (σ₁ : A → X) (F₁ : X → A) (σ₂ : B → A) (F₂ : A → B) (τ₁ τ₂ : Nat)
    (c₁ : Contract φ τ₁ σ₁ F₁ G₁) (c₂ : Contract G₁ τ₂ σ₂ F₂ G₂) :
    Contract φ (τ₁ * τ₂) (fun b => σ₁ (σ₂ b)) (fun x => F₂ (F₁ x)) G₂ where
  readsBack b := by
    show F₂ (F₁ (σ₁ (σ₂ b))) = b
    rw [c₁.readsBack, c₂.readsBack]
  commutes :=
    thm_cf_simulation_contract_commutes_composition φ G₁ G₂ σ₁ σ₂ τ₁ τ₂ c₁.commutes c₂.commutes

theorem thm_cf_simulation_contract_power {X A : Type} (φ : X → X) (τ : Nat) (σ : A → X)
    (F : X → A) (G : A → A) (c : Contract φ τ σ F G) (n : Nat) :
    Contract φ (τ * n) σ F (iter G n) where
  readsBack := c.readsBack
  commutes := commutes_pow φ τ σ G c.commutes n

theorem thm_cf_simulation_contract_identity {X : Type} (φ : X → X) :
    Contract φ 1 (fun x => x) (fun x => x) φ ∧
      Contract φ 0 (fun x => x) (fun x => x) (fun x => x) :=
  ⟨⟨fun _ => rfl, fun _ => rfl⟩, ⟨fun _ => rfl, fun _ => rfl⟩⟩

theorem thm_cf_simulation_contract_subset_invariant {X A : Type} (φ : X → X) (τ : Nat)
    (σ : A → X) (F : X → A) (G : A → A) (c : Contract φ τ σ F G) (n : Nat) (x : X)
    (hx : ∃ a, σ a = x) : ∃ a, σ a = iter φ (τ * n) x := by
  obtain ⟨a, rfl⟩ := hx
  exact ⟨iter G n a, (commutes_pow φ τ σ G c.commutes n a).symm⟩

theorem thm_cf_simulation_contract_rule_unique {X A : Type} (φ : X → X) (τ : Nat) (σ : A → X)
    (F : X → A) (G G' : A → A) (c : Contract φ τ σ F G) (c' : Contract φ τ σ F G') :
    (∀ a, G a = F (iter φ τ (σ a))) ∧ ∀ a, G a = G' a := by
  have hG : ∀ a, G a = F (iter φ τ (σ a)) := fun a => by rw [c.commutes, c.readsBack]
  refine ⟨hG, fun a => ?_⟩
  rw [hG, c'.commutes, c'.readsBack]

/-! ## An instance: the full swap under `brick2` on a ring of 6 cells -/

/-- One matching layer of a pair rule `r` on a ring of 6 cells: color `col` holds the edges
`(i, i + 1)` with `i mod 2 = col`, applied left to right. -/
def ringLayer {α : Type} (r : α → α → α × α) (col : Nat) (x : Fin 6 → α) : Fin 6 → α :=
  fun i =>
    if i.val % 2 = col then (r (x i) (x ⟨(i.val + 1) % 6, Nat.mod_lt _ (by decide)⟩)).1
    else (r (x ⟨(i.val + 5) % 6, Nat.mod_lt _ (by decide)⟩) (x i)).2

/-- One `brick2` round: color 0, then color 1. -/
def brick2Round {α : Type} (r : α → α → α × α) (x : Fin 6 → α) : Fin 6 → α :=
  ringLayer r 1 (ringLayer r 0 x)

/-- The full swap pair rule. -/
def fullSwap {α : Type} (u v : α) : α × α := (v, u)

/-- The section `t ↦ (t, 0)` on 3 coarse cells: coarse cell `j` is fine cells `2 j, 2 j + 1`. -/
def swapSection {α : Type} (zero : α) (a : Fin 3 → α) : Fin 6 → α :=
  fun i => if i.val % 2 = 0 then a ⟨i.val / 2, by omega⟩ else zero

/-- Decimation: coarse cell `j` reads fine cell `2 j`. -/
def decimate {α : Type} (x : Fin 6 → α) : Fin 3 → α :=
  fun j => x ⟨2 * j.val, by omega⟩

/-- The coarse shift by one cell to the right on the ring of 3. -/
def coarseShift {α : Type} (a : Fin 3 → α) : Fin 3 → α :=
  fun j => a ⟨(j.val + 2) % 3, Nat.mod_lt _ (by decide)⟩

set_option linter.unusedSimpArgs false in
theorem thm_cf_full_swap_brick2_contract {α : Type} (zero : α) :
    Contract (brick2Round (fullSwap (α := α))) 1 (swapSection zero) decimate coarseShift where
  readsBack a := by
    funext j
    match j with
    | ⟨0, _⟩ => simp [decimate, swapSection]
    | ⟨1, _⟩ => simp [decimate, swapSection]
    | ⟨2, _⟩ => simp [decimate, swapSection]
  commutes a := by
    funext i
    match i with
    | ⟨0, _⟩ => simp [iter, brick2Round, ringLayer, fullSwap, swapSection, coarseShift]
    | ⟨1, _⟩ => simp [iter, brick2Round, ringLayer, fullSwap, swapSection, coarseShift]
    | ⟨2, _⟩ => simp [iter, brick2Round, ringLayer, fullSwap, swapSection, coarseShift]
    | ⟨3, _⟩ => simp [iter, brick2Round, ringLayer, fullSwap, swapSection, coarseShift]
    | ⟨4, _⟩ => simp [iter, brick2Round, ringLayer, fullSwap, swapSection, coarseShift]
    | ⟨5, _⟩ => simp [iter, brick2Round, ringLayer, fullSwap, swapSection, coarseShift]

theorem thm_cf_full_swap_brick2_contract_two_rounds {α : Type} (zero : α) :
    Contract (brick2Round (fullSwap (α := α))) 2 (swapSection zero) decimate
      (fun a j => a ⟨(j.val + 1) % 3, Nat.mod_lt _ (by decide)⟩) := by
  have c := thm_cf_simulation_contract_power _ 1 _ _ _ (thm_cf_full_swap_brick2_contract zero) 2
  refine ⟨c.readsBack, fun a => ?_⟩
  have h : iter (brick2Round (fullSwap (α := α))) 2 (swapSection zero a) =
      swapSection zero (iter coarseShift 2 a) := c.commutes a
  rw [h]
  congr 1
  funext j
  match j with
  | ⟨0, _⟩ => simp [iter, coarseShift]
  | ⟨1, _⟩ => simp [iter, coarseShift]
  | ⟨2, _⟩ => simp [iter, coarseShift]

end SimulationContract

end Vibe
