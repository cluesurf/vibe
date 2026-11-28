module

public import Vibe.Tone
public import Vibe.Rule
public import Vibe.CoxeterTransport
public import Vibe.Fock.Ring
import Mathlib.Tactic.Ring

/-!
# Vibe Theory: Finite-Support Quantum Fock Space & Infinite `{3,4,3,4}` Configurations

Submodule 2 of 4 of `Vibe.FockBeat` (re-exported unchanged by `Vibe.FockBeat`):
- Finite-support quantum Fock space `FockVec R α` over any `StarCommRing R` (powered by
  `StarCommRing.toCommRing` + Mathlib `ring`), support-independent Hermitian inner product
  `innerOn` and norm `normSqOn`, `FockUnitary` composition & all-time iteration (`∀ t : Nat`),
  and universal unitary constructors (`permUnitary`, `phaseUnitary`, `block2Unitary`, `block12Unitary`),
- 24-slot line geometry, exact `{3,4,3,4}` Coxeter parity `M_P = simpleRefl 0` (with
  `det(M_P g M_P) = det(g)` via Mathlib `Matrix.det_mul`), canonical infinite-honeycomb
  configurations `HoneycombConfig`, vacuum `v1Config`, charge `totalCharge`, global
  configuration symmetries (`S`, `S⁻¹`, `R`, `C`, `P`, `CP`), and charge-sector / causal
  light-cone ball predicates (`InChargeSector`, `InBall`, `ConfigInBall`, `QuantumInBall`).
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 2: Finite-Support Quantum Fock Space & Universal Unitary Constructors -/

/-- Constructive duplicate-free list predicate. -/
inductive IsNodup {α : Type} : List α → Prop where
  | nil : IsNodup []
  | cons {x : α} {xs : List α} : x ∉ xs → IsNodup xs → IsNodup (x :: xs)

/-- Constructive membership check on `List α`. -/
def memBool {α : Type} [DecidableEq α] (a : α) : List α → Bool
  | [] => false
  | x :: xs => if x = a then true else memBool a xs

-- [helper]
theorem memBool_eq_true_iff {α : Type} [DecidableEq α] (a : α) (xs : List α) :
    memBool a xs = true ↔ a ∈ xs := by
  induction xs with
  | nil => simp [memBool]
  | cons x rest ih =>
    simp only [memBool]
    split_ifs with hx
    · subst hx; simp
    · simp [ih, Ne.symm hx]

private def isNodupBool {α : Type} [DecidableEq α] : List α → Bool
  | [] => true
  | x :: xs => !(memBool x xs) && isNodupBool xs

private theorem isNodup_of_bool {α : Type} [DecidableEq α] (xs : List α)
    (h : isNodupBool xs = true) : IsNodup xs := by
  induction xs with
  | nil => exact IsNodup.nil
  | cons x rest ih =>
    simp only [isNodupBool, Bool.and_eq_true, Bool.not_eq_true'] at h
    exact IsNodup.cons (fun hm => by rw [(memBool_eq_true_iff x rest).mpr hm] at h; exact Bool.noConfusion h.1) (ih h.2)

-- [helper]
theorem list_all_eq_true_iff {α : Type} (p : α → Bool) (xs : List α) :
    xs.all p = true ↔ ∀ x, x ∈ xs → p x = true :=
  List.all_eq_true

-- [helper]
theorem mem_filter_iff {α : Type} (p : α → Bool) (xs : List α) (a : α) :
    a ∈ xs.filter p ↔ a ∈ xs ∧ p a = true :=
  List.mem_filter

-- [helper]
theorem mem_map_iff {α β : Type} (f : α → β) (xs : List α) (b : β) :
    b ∈ xs.map f ↔ ∃ a : α, a ∈ xs ∧ f a = b :=
  List.mem_map

-- [helper]
theorem isNodup_filter {α : Type} (p : α → Bool) {xs : List α} (h : IsNodup xs) :
    IsNodup (xs.filter p) := by
  induction h with
  | nil => exact IsNodup.nil
  | cons hnot _ ih =>
    simp only [List.filter]
    cases hp : p _ with
    | true => exact IsNodup.cons (fun hm => hnot ((List.mem_filter.mp hm).1)) ih
    | false => exact ih

-- [helper]
theorem isNodup_map_inj {α β : Type} (f : α → β)
    (hinj : ∀ x y : α, f x = f y → x = y) {xs : List α} (h : IsNodup xs) :
    IsNodup (xs.map f) := by
  induction h with
  | nil => exact IsNodup.nil
  | cons hnot _ ih =>
    refine IsNodup.cons ?_ ih
    intro hm
    obtain ⟨a, ha, hfa⟩ := List.mem_map.mp hm
    rw [hinj _ _ hfa] at ha
    exact hnot ha

/-- Remove the first occurrence of `a` from a list. -/
def eraseOne {α : Type} [DecidableEq α] (a : α) : List α → List α
  | [] => []
  | x :: xs => if x = a then xs else x :: eraseOne a xs

-- [helper]
theorem mem_eraseOne_iff {α : Type} [DecidableEq α] (a y : α)
    {xs : List α} (hnd : IsNodup xs) :
    y ∈ eraseOne a xs ↔ y ∈ xs ∧ y ≠ a := by
  induction hnd with
  | nil => simp [eraseOne]
  | @cons x rest hnot _ ih =>
    simp only [eraseOne]
    split_ifs with hxa
    · subst hxa
      constructor
      · intro hy; exact ⟨List.Mem.tail _ hy, fun h => hnot (h ▸ hy)⟩
      · rintro ⟨hy, hne⟩; cases hy with | head => exact absurd rfl hne | tail _ h' => exact h'
    · constructor
      · intro hy
        cases hy with
        | head => exact ⟨List.Mem.head _, hxa⟩
        | tail _ h' => exact ⟨List.Mem.tail _ (ih.mp h').1, (ih.mp h').2⟩
      · rintro ⟨hy, hne⟩
        cases hy with
        | head => exact List.Mem.head _
        | tail _ h' => exact List.Mem.tail _ (ih.mpr ⟨h', hne⟩)

-- [helper]
theorem isNodup_eraseOne {α : Type} [DecidableEq α] (a : α)
    {xs : List α} (hnd : IsNodup xs) : IsNodup (eraseOne a xs) := by
  induction hnd with
  | nil => exact IsNodup.nil
  | @cons x rest hnot hndRest ih =>
    simp only [eraseOne]
    split_ifs with hxa
    · exact hndRest
    · exact IsNodup.cons (fun hm => hnot ((mem_eraseOne_iff a x hndRest).mp hm).1) ih

/-- Duplicate-free union of two lists. -/
def nodupUnion {α : Type} [DecidableEq α] (xs : List α) : List α → List α
  | [] => xs
  | y :: ys =>
    let rest := nodupUnion xs ys
    if memBool y rest then rest else y :: rest

-- [helper]
theorem mem_nodupUnion {α : Type} [DecidableEq α] (xs ys : List α) (a : α) :
    a ∈ nodupUnion xs ys ↔ a ∈ xs ∨ a ∈ ys := by
  induction ys with
  | nil => simp [nodupUnion]
  | cons y rest ih =>
    simp only [nodupUnion]
    cases hm : memBool y (nodupUnion xs rest) with
    | true =>
      simp only [ite_true, ih, List.mem_cons]
      have hy := (memBool_eq_true_iff y _).mp hm
      constructor
      · rintro (h | h)
        · exact Or.inl h
        · exact Or.inr (Or.inr h)
      · rintro (h | rfl | h)
        · exact Or.inl h
        · exact ih.mp hy
        · exact Or.inr h
    | false =>
      simp only [ite_bool_false, List.mem_cons, ih]
      constructor
      · rintro (rfl | h | h)
        · exact Or.inr (Or.inl rfl)
        · exact Or.inl h
        · exact Or.inr (Or.inr h)
      · rintro (h | rfl | h)
        · exact Or.inr (Or.inl h)
        · exact Or.inl rfl
        · exact Or.inr (Or.inr h)

-- [helper]
theorem isNodup_nodupUnion {α : Type} [DecidableEq α] {xs : List α} (hxs : IsNodup xs)
    (ys : List α) : IsNodup (nodupUnion xs ys) := by
  induction ys with
  | nil => exact hxs
  | cons y rest ih =>
    simp only [nodupUnion]
    cases hm : memBool y (nodupUnion xs rest) with
    | true => simp only [ite_true]; exact ih
    | false =>
      simp only [ite_bool_false]
      refine IsNodup.cons (fun hmem => ?_) ih
      have ht := (memBool_eq_true_iff y _).mpr hmem
      rw [hm] at ht; exact Bool.noConfusion ht

/-- Deduplicate an arbitrary list while preserving exact membership. -/
def dedupList {α : Type} [DecidableEq α] (xs : List α) : List α :=
  nodupUnion [] xs

-- [helper]
theorem isNodup_dedupList {α : Type} [DecidableEq α] (xs : List α) :
    IsNodup (dedupList xs) :=
  isNodup_nodupUnion IsNodup.nil xs

-- [helper]
theorem mem_dedupList {α : Type} [DecidableEq α] (xs : List α) (a : α) :
    a ∈ dedupList xs ↔ a ∈ xs := by
  simp [dedupList, mem_nodupUnion]

/-- Constructive flatMap over lists. -/
def flatMapList {α β : Type} (f : α → List β) : List α → List β
  | [] => []
  | x :: xs => f x ++ flatMapList f xs

-- [helper]
theorem mem_flatMapList_iff {α β : Type} (f : α → List β) (xs : List α) (b : β) :
    b ∈ flatMapList f xs ↔ ∃ a : α, a ∈ xs ∧ b ∈ f a := by
  induction xs with
  | nil => simp [flatMapList]
  | cons x rest ih =>
    simp only [flatMapList, List.mem_append, ih, List.mem_cons]
    constructor
    · rintro (h | ⟨a, ha, hb⟩)
      · exact ⟨x, Or.inl rfl, h⟩
      · exact ⟨a, Or.inr ha, hb⟩
    · rintro ⟨a, rfl | ha, hb⟩
      · exact Or.inl hb
      · exact Or.inr ⟨a, ha, hb⟩

/-- Quantum Fock-space wavefunction `ψ : α → R` assigning an exact amplitude in `R` to each basis configuration. -/
abbrev FockVec (R α : Type) := α → R

section FockSpace

variable {R α : Type} [StarCommRing R]

/-- Zero wavefunction. -/
def zeroVec : FockVec R α := fun _ => StarCommRing.zero

/-- Pointwise superposition `|ψ⟩ + |φ⟩`. -/
def addVec (ψ φ : FockVec R α) : FockVec R α := fun c => StarCommRing.add (ψ c) (φ c)

/-- Pointwise scalar multiplication `λ |ψ⟩`. -/
def scaleVec (lam : R) (ψ : FockVec R α) : FockVec R α := fun c => StarCommRing.mul lam (ψ c)

/-- Antilinear complex conjugation `K_conj |ψ⟩` (`c ↦ conj (ψ c)`). -/
def conjVec (ψ : FockVec R α) : FockVec R α := fun c => StarCommRing.conj (ψ c)

/-- Basis ket `|c₀⟩` with unit amplitude at `c₀` and `0` elsewhere. -/
def ket [DecidableEq α] (c₀ : α) : FockVec R α :=
  fun c => if c = c₀ then StarCommRing.one else StarCommRing.zero

/-- Exact finite sum `∑_{x ∈ xs} f x` in `R`. -/
def sumList : List α → (α → R) → R
  | [], _ => StarCommRing.zero
  | x :: xs, f => StarCommRing.add (f x) (sumList xs f)

/-- Exact Hermitian inner product `⟨ψ | φ⟩ = ∑_{c ∈ s} conj(ψ c) * φ c` evaluated over `s`. -/
def innerOn (s : List α) (ψ φ : FockVec R α) : R :=
  sumList s (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c))

/-- Exact squared norm `‖ψ‖² = ⟨ψ | ψ⟩` evaluated over `s`. -/
def normSqOn (s : List α) (ψ : FockVec R α) : R :=
  innerOn s ψ ψ

/-- Finite-support witness: `s` is duplicate-free and `ψ` vanishes outside `s`. -/
def SuppIn (s : List α) (ψ : FockVec R α) : Prop :=
  IsNodup s ∧ ∀ c : α, c ∉ s → ψ c = StarCommRing.zero

private theorem star_conj_zero : StarCommRing.conj (StarCommRing.zero : R) = StarCommRing.zero := by
  let _ : CommRing R := StarCommRing.toCommRing R
  have h1 : StarCommRing.conj (StarCommRing.zero : R) + StarCommRing.conj (StarCommRing.zero : R) =
      StarCommRing.conj (StarCommRing.zero : R) := by
    change StarCommRing.add (StarCommRing.conj StarCommRing.zero) (StarCommRing.conj StarCommRing.zero) = _
    rw [← StarCommRing.conj_add, StarCommRing.add_zero]
  calc StarCommRing.conj (StarCommRing.zero : R)
      = (StarCommRing.conj (StarCommRing.zero : R) + StarCommRing.conj (StarCommRing.zero : R)) +
          -StarCommRing.conj (StarCommRing.zero : R) := by ring
    _ = StarCommRing.conj (StarCommRing.zero : R) + -StarCommRing.conj (StarCommRing.zero : R) := by rw [h1]
    _ = 0 := by ring

-- [helper]
theorem star_conj_neg (a : R) : StarCommRing.conj (StarCommRing.neg a) = StarCommRing.neg (StarCommRing.conj a) := by
  let _ : CommRing R := StarCommRing.toCommRing R
  have h1 : StarCommRing.conj a + StarCommRing.conj (StarCommRing.neg a) = 0 := by
    change StarCommRing.add (StarCommRing.conj a) (StarCommRing.conj (StarCommRing.neg a)) = StarCommRing.zero
    rw [← StarCommRing.conj_add, StarCommRing.add_neg, star_conj_zero]
  change StarCommRing.conj (StarCommRing.neg a) = -StarCommRing.conj a
  calc StarCommRing.conj (StarCommRing.neg a)
      = (StarCommRing.conj a + StarCommRing.conj (StarCommRing.neg a)) + -StarCommRing.conj a := by ring
    _ = 0 + -StarCommRing.conj a := by rw [h1]
    _ = -StarCommRing.conj a := by ring

-- [helper]
theorem sumList_zero_of_all_zero (xs : List α) (f : α → R)
    (h : ∀ x : α, x ∈ xs → f x = StarCommRing.zero) : sumList xs f = StarCommRing.zero := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [sumList]
    rw [h x (List.Mem.head rest), StarCommRing.zero_add]
    exact ih (fun y hy => h y (List.Mem.tail x hy))

-- [helper]
theorem sumList_congr (xs : List α) (f g : α → R)
    (h : ∀ x : α, x ∈ xs → f x = g x) : sumList xs f = sumList xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [sumList]
    rw [h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]

-- [helper]
theorem sumList_add (xs : List α) (f g : α → R) :
    sumList xs (fun x => StarCommRing.add (f x) (g x)) = StarCommRing.add (sumList xs f) (sumList xs g) := by
  let _ : CommRing R := StarCommRing.toCommRing R
  induction xs with
  | nil => exact (StarCommRing.add_zero StarCommRing.zero).symm
  | cons x rest ih =>
    have ih' : sumList rest (fun y => f y + g y) = sumList rest f + sumList rest g := ih
    change (f x + g x) + sumList rest (fun y => f y + g y) = (f x + sumList rest f) + (g x + sumList rest g)
    rw [ih']; ring

-- [helper]
theorem sumList_mul_left (xs : List α) (c : R) (f : α → R) :
    sumList xs (fun x => StarCommRing.mul c (f x)) = StarCommRing.mul c (sumList xs f) := by
  induction xs with
  | nil => exact (StarCommRing.mul_zero c).symm
  | cons x rest ih =>
    simp only [sumList]; rw [ih, ← StarCommRing.mul_add]

-- [helper]
theorem sumList_conj (xs : List α) (f : α → R) :
    StarCommRing.conj (sumList xs f) = sumList xs (fun x => StarCommRing.conj (f x)) := by
  induction xs with
  | nil => exact star_conj_zero
  | cons x rest ih => simp only [sumList]; rw [StarCommRing.conj_add, ih]

-- [helper]
theorem sumList_map {β : Type} (xs : List β) (g : β → α) (f : α → R) :
    sumList (xs.map g) f = sumList xs (fun x => f (g x)) := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [List.map, sumList]; rw [ih]

-- [helper]
theorem sumList_filter_add (xs : List α) (p : α → Bool) (f : α → R) :
    sumList xs f = StarCommRing.add (sumList (xs.filter p) f) (sumList (xs.filter (fun x => !p x)) f) := by
  let _ : CommRing R := StarCommRing.toCommRing R
  induction xs with
  | nil => exact (StarCommRing.add_zero StarCommRing.zero).symm
  | cons x rest ih =>
    have ih' : sumList rest f = sumList (rest.filter p) f + sumList (rest.filter (fun y => !p y)) f := ih
    cases hp : p x with
    | true =>
      simp only [List.filter, hp, Bool.not_true, sumList]
      change f x + sumList rest f = (f x + sumList (rest.filter p) f) + sumList (rest.filter (fun y => !p y)) f
      rw [ih']; ring
    | false =>
      simp only [List.filter, hp, Bool.not_false, sumList]
      change f x + sumList rest f = sumList (rest.filter p) f + (f x + sumList (rest.filter (fun y => !p y)) f)
      rw [ih']; ring

private theorem sumList_eraseOne [DecidableEq α] (a : α) (xs : List α) (f : α → R)
    (hmem : a ∈ xs) :
    sumList xs f = StarCommRing.add (f a) (sumList (eraseOne a xs) f) := by
  let _ : CommRing R := StarCommRing.toCommRing R
  induction xs with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, sumList]
    split_ifs with hxa
    · subst hxa; rfl
    · cases hmem with
      | head => exact absurd rfl hxa
      | tail _ h' =>
        have ih' : sumList rest f = f a + sumList (eraseOne a rest) f := ih h'
        change f x + sumList rest f = f a + (f x + sumList (eraseOne a rest) f)
        rw [ih']; ring

private theorem sumList_subset_eq [DecidableEq α] (s₁ s₂ : List α) (f : α → R)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hsub : ∀ x : α, x ∈ s₁ → x ∈ s₂)
    (hvan : ∀ x : α, x ∈ s₂ → x ∉ s₁ → f x = StarCommRing.zero) :
    sumList s₁ f = sumList s₂ f := by
  induction h1 generalizing s₂ with
  | nil => exact (sumList_zero_of_all_zero s₂ f (fun x hx => hvan x hx (fun hm => nomatch hm))).symm
  | @cons a rest hnot _ ih =>
    rw [sumList_eraseOne a s₂ f (hsub a (List.Mem.head rest))]
    simp only [sumList]
    apply congrArg (StarCommRing.add (f a))
    apply ih (eraseOne a s₂) (isNodup_eraseOne a h2)
    · intro x hx
      exact (mem_eraseOne_iff a x h2).mpr ⟨hsub x (List.Mem.tail a hx), fun hxa => hnot (hxa ▸ hx)⟩
    · intro x hx hxnot
      have ⟨hx2, hne⟩ := (mem_eraseOne_iff a x h2).mp hx
      refine hvan x hx2 (fun hmem => ?_)
      cases hmem with
      | head => exact hne rfl
      | tail _ h' => exact hxnot h'

private theorem sumList_support_indep [DecidableEq α] (s₁ s₂ : List α) (f : α → R)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hv1 : ∀ x : α, x ∉ s₁ → f x = StarCommRing.zero)
    (hv2 : ∀ x : α, x ∉ s₂ → f x = StarCommRing.zero) :
    sumList s₁ f = sumList s₂ f := by
  let u := nodupUnion s₁ s₂
  have hu : IsNodup u := isNodup_nodupUnion h1 s₂
  rw [sumList_subset_eq s₁ u f h1 hu (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inl hx)) (fun x _ hx1 => hv1 x hx1),
      sumList_subset_eq s₂ u f h2 hu (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inr hx)) (fun x _ hx2 => hv2 x hx2)]

-- [helper]
theorem sumList_bijection [DecidableEq α] (u : List α) (g gInv : α → α) (f : α → R)
    (hInv1 : ∀ x : α, gInv (g x) = x) (hInv2 : ∀ x : α, g (gInv x) = x)
    (hnd : IsNodup u) (hCl : ∀ x : α, x ∈ u → g x ∈ u) (hClInv : ∀ x : α, x ∈ u → gInv x ∈ u) :
    sumList u (fun x => f (g x)) = sumList u f := by
  rw [← sumList_map u g f]
  have hMapNd : IsNodup (u.map g) :=
    isNodup_map_inj g (fun x y h => by have := congrArg gInv h; rw [hInv1, hInv1] at this; exact this) hnd
  refine sumList_subset_eq (u.map g) u f hMapNd hnd ?_ ?_
  · intro x hx
    obtain ⟨y, hy, hgy⟩ := List.mem_map.mp hx
    exact hgy ▸ hCl y hy
  · intro x hx hxnot
    exact absurd (List.mem_map.mpr ⟨gInv x, hClInv x hx, hInv2 x⟩) hxnot

/-- Headline Theorem 2 (Exact Support-Independence of Fock Inner Product & Norm):
    for ANY `StarCommRing R`, any discrete configuration space `α`, and any two duplicate-free
    covering supports `s₁, s₂`, the Hermitian inner product `innerOn s ψ φ` and squared norm
    `normSqOn s ψ` are canonically independent of the chosen support list. -/
theorem thm_fock_inner_support_indep [DecidableEq α]
    (s₁ s₂ : List α) (ψ φ : FockVec R α)
    (h1 : SuppIn s₁ ψ) (h2 : SuppIn s₂ ψ) :
    innerOn s₁ ψ φ = innerOn s₂ ψ φ ∧ normSqOn s₁ ψ = normSqOn s₂ ψ := by
  have hInner : ∀ χ : FockVec R α, innerOn s₁ ψ χ = innerOn s₂ ψ χ := fun χ =>
    sumList_support_indep s₁ s₂ (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (χ c)) h1.1 h2.1
      (fun c hc => by rw [h1.2 c hc, star_conj_zero, StarCommRing.zero_mul])
      (fun c hc => by rw [h2.2 c hc, star_conj_zero, StarCommRing.zero_mul])
  exact ⟨hInner φ, hInner ψ⟩

/-- Headline Theorem 3 (Sesquilinearity, Conjugate Symmetry & Basis Ket Orthonormality):
    the exact Fock inner product over any `StarCommRing R` is linear in the second slot,
    conjugate-linear in the first slot, Hermitian conjugate-symmetric, and orthonormal on basis kets. -/
theorem thm_fock_inner_sesquilinear [DecidableEq α]
    (s : List α) (ψ ψ₁ ψ₂ φ φ₁ φ₂ : FockVec R α) (lam : R)
    (a b : α) (hnd : IsNodup s) (ha : a ∈ s) :
    innerOn s ψ (addVec φ₁ φ₂) = StarCommRing.add (innerOn s ψ φ₁) (innerOn s ψ φ₂) ∧
    innerOn s ψ (scaleVec lam φ) = StarCommRing.mul lam (innerOn s ψ φ) ∧
    innerOn s (addVec ψ₁ ψ₂) φ = StarCommRing.add (innerOn s ψ₁ φ) (innerOn s ψ₂ φ) ∧
    innerOn s (scaleVec lam ψ) φ = StarCommRing.mul (StarCommRing.conj lam) (innerOn s ψ φ) ∧
    StarCommRing.conj (innerOn s ψ φ) = innerOn s φ ψ ∧
    innerOn s (ket (R := R) a) (ket (R := R) b) = if a = b then StarCommRing.one else StarCommRing.zero := by
  let _ : CommRing R := StarCommRing.toCommRing R
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_⟩
  · unfold innerOn addVec
    rw [sumList_congr s _ (fun c => StarCommRing.add (StarCommRing.mul (StarCommRing.conj (ψ c)) (φ₁ c))
        (StarCommRing.mul (StarCommRing.conj (ψ c)) (φ₂ c))) (fun c _ => StarCommRing.mul_add _ _ _),
      sumList_add]
  · unfold innerOn scaleVec
    rw [sumList_congr s _ (fun c => StarCommRing.mul lam (StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c)))
        (fun c _ => by change StarCommRing.conj (ψ c) * (lam * φ c) = lam * (StarCommRing.conj (ψ c) * φ c); ring),
      sumList_mul_left]
  · unfold innerOn addVec
    rw [sumList_congr s _ (fun c => StarCommRing.add (StarCommRing.mul (StarCommRing.conj (ψ₁ c)) (φ c))
        (StarCommRing.mul (StarCommRing.conj (ψ₂ c)) (φ c)))
        (fun c _ => by rw [StarCommRing.conj_add, StarCommRing.add_mul]),
      sumList_add]
  · unfold innerOn scaleVec
    rw [sumList_congr s _ (fun c => StarCommRing.mul (StarCommRing.conj lam) (StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c)))
        (fun c _ => by rw [StarCommRing.conj_mul, StarCommRing.mul_assoc]),
      sumList_mul_left]
  · unfold innerOn
    rw [sumList_conj]
    exact sumList_congr s _ _ (fun c _ => by rw [StarCommRing.conj_mul, StarCommRing.conj_conj, StarCommRing.mul_comm])
  · unfold innerOn ket
    rw [sumList_eraseOne a s _ ha]
    have hRest : sumList (eraseOne a s)
        (fun c => StarCommRing.mul (StarCommRing.conj (if c = a then (StarCommRing.one : R) else StarCommRing.zero))
          (if c = b then StarCommRing.one else StarCommRing.zero)) = StarCommRing.zero := by
      apply sumList_zero_of_all_zero
      intro c hc
      have hne := ((mem_eraseOne_iff a c hnd).mp hc).2
      rw [ite_eq_right hne, star_conj_zero, StarCommRing.zero_mul]
    rw [hRest, StarCommRing.add_zero, ite_eq_left rfl, StarCommRing.conj_one, StarCommRing.one_mul]

/-- Exact unitary operator on finite-support Fock space `FockVec R α`. -/
structure FockUnitary (R α : Type) [StarCommRing R] where
  op : FockVec R α → FockVec R α
  dag : FockVec R α → FockVec R α
  leftInv : ∀ ψ : FockVec R α, dag (op ψ) = ψ
  rightInv : ∀ ψ : FockVec R α, op (dag ψ) = ψ
  preservesSupp : ∀ (ψ : FockVec R α) (s : List α), SuppIn s ψ → ∃ s' : List α, SuppIn s' (op ψ)
  preservesDagSupp : ∀ (ψ : FockVec R α) (s : List α), SuppIn s ψ → ∃ s' : List α, SuppIn s' (dag ψ)
  preservesInner : ∀ (ψ φ : FockVec R α) (s s' : List α),
    SuppIn s ψ → SuppIn s φ → SuppIn s' (op ψ) → SuppIn s' (op φ) →
    innerOn s' (op ψ) (op φ) = innerOn s ψ φ

/-- Identity Fock unitary. -/
def FockUnitary.id [DecidableEq α] : FockUnitary R α where
  op := fun ψ => ψ
  dag := fun ψ => ψ
  leftInv := fun _ => rfl
  rightInv := fun _ => rfl
  preservesSupp := fun _ s hs => ⟨s, hs⟩
  preservesDagSupp := fun _ s hs => ⟨s, hs⟩
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => (thm_fock_inner_support_indep s' s ψ φ hs'ψ hsψ).1

/-- Composition `B ∘ A` of two Fock unitaries (with reversed adjoint `(B ∘ A)† = A† ∘ B†`). -/
def FockUnitary.comp [DecidableEq α] (B A : FockUnitary R α) : FockUnitary R α where
  op := fun ψ => B.op (A.op ψ)
  dag := fun ψ => A.dag (B.dag ψ)
  leftInv := fun ψ => by rw [B.leftInv, A.leftInv]
  rightInv := fun ψ => by rw [A.rightInv, B.rightInv]
  preservesSupp := fun ψ s hs => by
    obtain ⟨s₁, hs₁⟩ := A.preservesSupp ψ s hs
    exact B.preservesSupp (A.op ψ) s₁ hs₁
  preservesDagSupp := fun ψ s hs => by
    obtain ⟨s₁, hs₁⟩ := B.preservesDagSupp ψ s hs
    exact A.preservesDagSupp (B.dag ψ) s₁ hs₁
  preservesInner := fun ψ φ s s' hsψ hsφ hs'ψ hs'φ => by
    obtain ⟨s₁, hs₁⟩ := A.preservesSupp ψ s hsψ
    obtain ⟨s₂, hs₂⟩ := A.preservesSupp φ s hsφ
    let sm := nodupUnion s₁ s₂
    have hsmψ : SuppIn sm (A.op ψ) :=
      ⟨isNodup_nodupUnion hs₁.1 s₂, fun c hc => hs₁.2 c (fun h => hc ((mem_nodupUnion s₁ s₂ c).mpr (Or.inl h)))⟩
    have hsmφ : SuppIn sm (A.op φ) :=
      ⟨isNodup_nodupUnion hs₁.1 s₂, fun c hc => hs₂.2 c (fun h => hc ((mem_nodupUnion s₁ s₂ c).mpr (Or.inr h)))⟩
    rw [B.preservesInner (A.op ψ) (A.op φ) sm s' hsmψ hsmφ hs'ψ hs'φ]
    exact A.preservesInner ψ φ s sm hsψ hsφ hsmψ hsmφ

-- [helper]
theorem fockUnitary_comm_dag {A B : FockUnitary R α}
    (h : ∀ ψ, A.op (B.op ψ) = B.op (A.op ψ)) :
    ∀ ψ, A.dag (B.dag ψ) = B.dag (A.dag ψ) := by
  intro ψ
  have h1 : B.op (A.op (A.dag (B.dag ψ))) = B.op (A.op (B.dag (A.dag ψ))) := by
    rw [A.rightInv, B.rightInv, ← h, B.rightInv, A.rightInv]
  have h2 := congrArg (fun x => A.dag (B.dag x)) h1
  rw [B.leftInv, A.leftInv, B.leftInv, A.leftInv] at h2
  exact h2

/-- Pushforward permutation operator `permOp πInv ψ c = ψ (πInv c)`. -/
def permOp (πInv : α → α) (ψ : FockVec R α) : FockVec R α :=
  fun c => ψ (πInv c)

/-- Exact Fock unitarity of ANY bijection `π, πInv : α → α`. -/
def permUnitary [DecidableEq α] (π πInv : α → α)
    (h1 : ∀ c : α, πInv (π c) = c) (h2 : ∀ c : α, π (πInv c) = c) : FockUnitary R α where
  op := permOp πInv
  dag := permOp π
  leftInv := fun ψ => by funext c; unfold permOp; rw [h1]
  rightInv := fun ψ => by funext c; unfold permOp; rw [h2]
  preservesSupp := fun ψ s hs => by
    refine ⟨s.map π, isNodup_map_inj π (fun x y hxy => by
      have := congrArg πInv hxy; rw [h1, h1] at this; exact this) hs.1, ?_⟩
    intro c hc
    exact hs.2 (πInv c) (fun hmem => hc (List.mem_map.mpr ⟨πInv c, hmem, h2 c⟩))
  preservesDagSupp := fun ψ s hs => by
    refine ⟨s.map πInv, isNodup_map_inj πInv (fun x y hxy => by
      have := congrArg π hxy; rw [h2, h2] at this; exact this) hs.1, ?_⟩
    intro c hc
    exact hs.2 (π c) (fun hmem => hc (List.mem_map.mpr ⟨π c, hmem, h1 c⟩))
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    have hMapSupp : SuppIn (s.map π) (permOp πInv ψ) :=
      ⟨isNodup_map_inj π (fun x y hxy => by
        have := congrArg πInv hxy; rw [h1, h1] at this; exact this) hsψ.1,
       fun c hc => hsψ.2 (πInv c) (fun hmem => hc (List.mem_map.mpr ⟨πInv c, hmem, h2 c⟩))⟩
    rw [(thm_fock_inner_support_indep s' (s.map π) (permOp πInv ψ) (permOp πInv φ) hs'ψ hMapSupp).1]
    unfold innerOn permOp
    rw [sumList_map]
    exact sumList_congr s _ _ (fun c _ => by rw [h1])

/-- Diagonal phase operator `phaseOp phase ψ c = phase c * ψ c`. -/
def phaseOp (phase : α → R) (ψ : FockVec R α) : FockVec R α :=
  fun c => StarCommRing.mul (phase c) (ψ c)

/-- Exact Fock unitarity of ANY unit-modulus diagonal phase `∀ c, conj(phase c) * phase c = 1`. -/
def phaseUnitary [DecidableEq α] (phase : α → R)
    (hUnit : ∀ c : α, StarCommRing.mul (StarCommRing.conj (phase c)) (phase c) = StarCommRing.one) :
    FockUnitary R α where
  op := phaseOp phase
  dag := phaseOp (fun c => StarCommRing.conj (phase c))
  leftInv := fun ψ => by
    funext c; unfold phaseOp; rw [← StarCommRing.mul_assoc, hUnit c, StarCommRing.one_mul]
  rightInv := fun ψ => by
    funext c; unfold phaseOp
    rw [← StarCommRing.mul_assoc, StarCommRing.mul_comm (phase c), hUnit c, StarCommRing.one_mul]
  preservesSupp := fun ψ s hs => ⟨s, hs.1, fun c hc => by unfold phaseOp; rw [hs.2 c hc, StarCommRing.mul_zero]⟩
  preservesDagSupp := fun ψ s hs => ⟨s, hs.1, fun c hc => by unfold phaseOp; rw [hs.2 c hc, StarCommRing.mul_zero]⟩
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    let _ : CommRing R := StarCommRing.toCommRing R
    have hS : SuppIn s (phaseOp phase ψ) :=
      ⟨hsψ.1, fun c hc => by unfold phaseOp; rw [hsψ.2 c hc, StarCommRing.mul_zero]⟩
    rw [(thm_fock_inner_support_indep s' s (phaseOp phase ψ) (phaseOp phase φ) hs'ψ hS).1]
    unfold innerOn phaseOp
    refine sumList_congr s _ _ fun c _ => ?_
    rw [StarCommRing.conj_mul]
    have hu : StarCommRing.conj (phase c) * phase c = 1 := hUnit c
    change (StarCommRing.conj (phase c) * StarCommRing.conj (ψ c)) * (phase c * φ c) =
      StarCommRing.conj (ψ c) * φ c
    calc (StarCommRing.conj (phase c) * StarCommRing.conj (ψ c)) * (phase c * φ c)
        = (StarCommRing.conj (phase c) * phase c) * (StarCommRing.conj (ψ c) * φ c) := by ring
      _ = 1 * (StarCommRing.conj (ψ c) * φ c) := by rw [hu]
      _ = StarCommRing.conj (ψ c) * φ c := by ring

/-- Symmetric involutive `2 × 2` block operator (instantiates half-coin `D` and role-meet `M_meet`). -/
def block2Op (flip : α → α) (act : α → Bool) (a b : R) (ψ : FockVec R α) : FockVec R α :=
  fun c => if act c then StarCommRing.add (StarCommRing.mul a (ψ c)) (StarCommRing.mul b (ψ (flip c))) else ψ c

-- [helper]
theorem block2_expand (a b u v x y : R) :
    StarCommRing.mul (StarCommRing.conj (StarCommRing.add (StarCommRing.mul a u) (StarCommRing.mul b v)))
        (StarCommRing.add (StarCommRing.mul a x) (StarCommRing.mul b y)) =
      StarCommRing.add
        (StarCommRing.add (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj a) a) (StarCommRing.mul (StarCommRing.conj u) x))
                          (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj b) b) (StarCommRing.mul (StarCommRing.conj v) y)))
        (StarCommRing.add (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj a) b) (StarCommRing.mul (StarCommRing.conj u) y))
                          (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj b) a) (StarCommRing.mul (StarCommRing.conj v) x))) := by
  let _ : CommRing R := StarCommRing.toCommRing R
  rw [StarCommRing.conj_add, StarCommRing.conj_mul, StarCommRing.conj_mul]
  change (StarCommRing.conj a * StarCommRing.conj u + StarCommRing.conj b * StarCommRing.conj v) * (a * x + b * y) =
    ((StarCommRing.conj a * a) * (StarCommRing.conj u * x) + (StarCommRing.conj b * b) * (StarCommRing.conj v * y)) +
    ((StarCommRing.conj a * b) * (StarCommRing.conj u * y) + (StarCommRing.conj b * a) * (StarCommRing.conj v * x))
  ring

/-- Exact Fock unitarity of ANY involutive `2 × 2` symmetric block operator. -/
def block2Unitary [DecidableEq α] (flip : α → α) (act : α → Bool) (a b : R)
    (hFlip : ∀ c : α, flip (flip c) = c)
    (hAct : ∀ c : α, act (flip c) = act c)
    (hDiag : StarCommRing.add (StarCommRing.mul (StarCommRing.conj a) a) (StarCommRing.mul (StarCommRing.conj b) b) = StarCommRing.one)
    (hOff : StarCommRing.add (StarCommRing.mul (StarCommRing.conj a) b) (StarCommRing.mul (StarCommRing.conj b) a) = StarCommRing.zero) :
    FockUnitary R α where
  op := block2Op flip act a b
  dag := block2Op flip act (StarCommRing.conj a) (StarCommRing.conj b)
  leftInv := fun ψ => by
    let _ : CommRing R := StarCommRing.toCommRing R
    funext c; unfold block2Op
    cases ha : act c with
    | false => simp only [ite_bool_false]
    | true =>
      have hfa : act (flip c) = true := by rw [hAct c, ha]
      simp only [ite_true, hfa, hFlip c]
      have hd : StarCommRing.conj a * a + StarCommRing.conj b * b = 1 := hDiag
      have ho : StarCommRing.conj a * b + StarCommRing.conj b * a = 0 := hOff
      change StarCommRing.conj a * (a * ψ c + b * ψ (flip c)) +
          StarCommRing.conj b * (a * ψ (flip c) + b * ψ c) = ψ c
      calc StarCommRing.conj a * (a * ψ c + b * ψ (flip c)) +
            StarCommRing.conj b * (a * ψ (flip c) + b * ψ c)
          = (StarCommRing.conj a * a + StarCommRing.conj b * b) * ψ c +
            (StarCommRing.conj a * b + StarCommRing.conj b * a) * ψ (flip c) := by ring
        _ = 1 * ψ c + 0 * ψ (flip c) := by rw [hd, ho]
        _ = ψ c := by ring
  rightInv := fun ψ => by
    let _ : CommRing R := StarCommRing.toCommRing R
    funext c; unfold block2Op
    cases ha : act c with
    | false => simp only [ite_bool_false]
    | true =>
      have hfa : act (flip c) = true := by rw [hAct c, ha]
      simp only [ite_true, hfa, hFlip c]
      have hd : StarCommRing.conj a * a + StarCommRing.conj b * b = 1 := hDiag
      have ho : StarCommRing.conj a * b + StarCommRing.conj b * a = 0 := hOff
      change a * (StarCommRing.conj a * ψ c + StarCommRing.conj b * ψ (flip c)) +
          b * (StarCommRing.conj a * ψ (flip c) + StarCommRing.conj b * ψ c) = ψ c
      calc a * (StarCommRing.conj a * ψ c + StarCommRing.conj b * ψ (flip c)) +
            b * (StarCommRing.conj a * ψ (flip c) + StarCommRing.conj b * ψ c)
          = (StarCommRing.conj a * a + StarCommRing.conj b * b) * ψ c +
            (StarCommRing.conj a * b + StarCommRing.conj b * a) * ψ (flip c) := by ring
        _ = 1 * ψ c + 0 * ψ (flip c) := by rw [hd, ho]
        _ = ψ c := by ring
  preservesSupp := fun ψ s hs => by
    let u := nodupUnion s (s.map flip)
    refine ⟨u, isNodup_nodupUnion hs.1 (s.map flip), fun c hc => ?_⟩
    have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
    have hc2 : flip c ∉ s := fun h =>
      hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr (List.mem_map.mpr ⟨flip c, h, hFlip c⟩)))
    unfold block2Op
    rw [hs.2 c hc1, hs.2 (flip c) hc2, StarCommRing.mul_zero, StarCommRing.mul_zero, StarCommRing.add_zero]
    cases act c <;> rfl
  preservesDagSupp := fun ψ s hs => by
    let u := nodupUnion s (s.map flip)
    refine ⟨u, isNodup_nodupUnion hs.1 (s.map flip), fun c hc => ?_⟩
    have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
    have hc2 : flip c ∉ s := fun h =>
      hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr (List.mem_map.mpr ⟨flip c, h, hFlip c⟩)))
    unfold block2Op
    rw [hs.2 c hc1, hs.2 (flip c) hc2, StarCommRing.mul_zero, StarCommRing.mul_zero, StarCommRing.add_zero]
    cases act c <;> rfl
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    let _ : CommRing R := StarCommRing.toCommRing R
    let u := nodupUnion s (s.map flip)
    have huNd : IsNodup u := isNodup_nodupUnion hsψ.1 (s.map flip)
    have huClosed : ∀ c : α, c ∈ u → flip c ∈ u := by
      intro c hc
      rcases (mem_nodupUnion s (s.map flip) c).mp hc with h1 | h2
      · exact (mem_nodupUnion s (s.map flip) (flip c)).mpr (Or.inr (List.mem_map.mpr ⟨c, h1, rfl⟩))
      · obtain ⟨x, hx, hfx⟩ := List.mem_map.mp h2
        rw [← hfx, hFlip x]
        exact (mem_nodupUnion s (s.map flip) x).mpr (Or.inl hx)
    have huψ : SuppIn u ψ :=
      ⟨huNd, fun c hc => hsψ.2 c (fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h)))⟩
    have huOpψ : SuppIn u (block2Op flip act a b ψ) := by
      refine ⟨huNd, fun c hc => ?_⟩
      have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
      have hc2 : flip c ∉ s := fun h =>
        hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr (List.mem_map.mpr ⟨flip c, h, hFlip c⟩)))
      unfold block2Op
      rw [hsψ.2 c hc1, hsψ.2 (flip c) hc2, StarCommRing.mul_zero, StarCommRing.mul_zero, StarCommRing.add_zero]
      cases act c <;> rfl
    rw [(thm_fock_inner_support_indep s' u (block2Op flip act a b ψ) (block2Op flip act a b φ) hs'ψ huOpψ).1]
    rw [← (thm_fock_inner_support_indep u s ψ φ huψ hsψ).1]
    unfold innerOn
    rw [sumList_filter_add u act, sumList_filter_add u act (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c))]
    refine congr (congrArg StarCommRing.add ?_) ?_
    · let ua := u.filter act
      have huaNd : IsNodup ua := isNodup_filter act huNd
      have huaClosed : ∀ c : α, c ∈ ua → flip c ∈ ua := by
        intro c hc
        have ⟨hcu, hca⟩ := List.mem_filter.mp hc
        exact List.mem_filter.mpr ⟨huClosed c hcu, by rw [hAct c, hca]⟩
      have hStep : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (block2Op flip act a b ψ c)) (block2Op flip act a b φ c)) =
          sumList ua (fun c =>
            StarCommRing.add
              (StarCommRing.add (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj a) a) (StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c)))
                                (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj b) b) (StarCommRing.mul (StarCommRing.conj (ψ (flip c))) (φ (flip c)))))
              (StarCommRing.add (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj a) b) (StarCommRing.mul (StarCommRing.conj (ψ c)) (φ (flip c))))
                                (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj b) a) (StarCommRing.mul (StarCommRing.conj (ψ (flip c))) (φ c))))) := by
        refine sumList_congr ua _ _ fun c hc => ?_
        have hca : act c = true := (List.mem_filter.mp hc).2
        unfold block2Op; simp only [ite_eq_left hca]
        exact block2_expand a b (ψ c) (ψ (flip c)) (φ c) (φ (flip c))
      rw [hStep, sumList_add, sumList_add, sumList_add,
          sumList_mul_left, sumList_mul_left, sumList_mul_left, sumList_mul_left]
      have hB1 : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (ψ (flip c))) (φ (flip c))) =
          sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c)) :=
        sumList_bijection ua flip flip (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c)) hFlip hFlip huaNd huaClosed huaClosed
      have hB2 : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (ψ (flip c))) (φ c)) =
          sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (φ (flip c))) := by
        have hEq : (fun c => StarCommRing.mul (StarCommRing.conj (ψ (flip c))) (φ c)) =
            (fun c => (fun x => StarCommRing.mul (StarCommRing.conj (ψ x)) (φ (flip x))) (flip c)) := by
          funext c; dsimp only; rw [hFlip c]
        rw [hEq]
        exact sumList_bijection ua flip flip (fun x => StarCommRing.mul (StarCommRing.conj (ψ x)) (φ (flip x))) hFlip hFlip huaNd huaClosed huaClosed
      rw [hB1, hB2, ← StarCommRing.add_mul, ← StarCommRing.add_mul, hDiag, hOff,
          StarCommRing.one_mul, StarCommRing.zero_mul, StarCommRing.add_zero]
    · refine sumList_congr _ _ _ fun c hc => ?_
      have hcf : act c = false := by
        have hnot := (List.mem_filter.mp hc).2
        cases ha : act c with | false => rfl | true => rw [ha] at hnot; exact Bool.noConfusion hnot
      unfold block2Op; simp only [hcf, ite_bool_false]

/-- Flat 12-term sum over `Fin 12` in any `StarCommRing R`. -/
def sumFin12 (f : Fin 12 → R) : R :=
  sumList (List.finRange 12) f

private theorem sumList_const (xs : List α) (c : R) :
    sumList xs (fun _ => c) = StarCommRing.mul (StarCommRing.ofNatR xs.length) c := by
  let _ : CommRing R := StarCommRing.toCommRing R
  induction xs with
  | nil => simp only [sumList, List.length_nil, StarCommRing.ofNatR, StarCommRing.zero_mul]
  | cons _ rest ih =>
    have ih' : sumList rest (fun _ => c) = StarCommRing.ofNatR rest.length * c := ih
    change c + sumList rest (fun _ => c) = (StarCommRing.ofNatR rest.length + 1) * c
    rw [ih']; ring

-- [helper]
theorem sumFin12_const (c : R) : sumFin12 (fun _ => c) = StarCommRing.mul (StarCommRing.ofNatR 12) c := by
  unfold sumFin12
  rw [sumList_const, List.length_finRange]

-- [helper]
theorem sumFin12_congr (f g : Fin 12 → R) (h : ∀ m : Fin 12, f m = g m) :
    sumFin12 f = sumFin12 g :=
  sumList_congr (List.finRange 12) f g (fun m _ => h m)

-- [helper]
theorem sumFin12_add (f g : Fin 12 → R) :
    sumFin12 (fun m => StarCommRing.add (f m) (g m)) = StarCommRing.add (sumFin12 f) (sumFin12 g) :=
  sumList_add (List.finRange 12) f g

-- [helper]
theorem sumFin12_mul_left (c : R) (f : Fin 12 → R) :
    sumFin12 (fun m => StarCommRing.mul c (f m)) = StarCommRing.mul c (sumFin12 f) :=
  sumList_mul_left (List.finRange 12) c f

-- [helper]
theorem sumFin12_conj (f : Fin 12 → R) :
    StarCommRing.conj (sumFin12 f) = sumFin12 (fun m => StarCommRing.conj (f m)) :=
  sumList_conj (List.finRange 12) f

-- [helper]
theorem sumList_sumFin12_comm (xs : List α) (f : α → Fin 12 → R) :
    sumList xs (fun c => sumFin12 (f c)) = sumFin12 (fun m => sumList xs (fun c => f c m)) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact (sumList_zero_of_all_zero (List.finRange 12) (fun _ => StarCommRing.zero) (fun _ _ => rfl)).symm
  | cons x rest ih =>
    simp only [sumList]; rw [ih, ← sumFin12_add]

-- [helper]
theorem sumFin12_swap (f : Fin 12 → Fin 12 → R) :
    sumFin12 (fun m₁ => sumFin12 (fun m₂ => f m₁ m₂)) =
      sumFin12 (fun m₂ => sumFin12 (fun m₁ => f m₁ m₂)) :=
  sumList_sumFin12_comm (List.finRange 12) f

-- [helper]
theorem finRange12_nodup : IsNodup (List.finRange 12) :=
  isNodup_of_bool (List.finRange 12) (by decide)

-- [helper]
theorem mem_finRange12 (m : Fin 12) : m ∈ List.finRange 12 :=
  List.mem_finRange m

-- [helper]
theorem sumFin12_bijection (g gInv : Fin 12 → Fin 12) (f : Fin 12 → R)
    (h1 : ∀ m, gInv (g m) = m) (h2 : ∀ m, g (gInv m) = m) :
    sumFin12 (fun m => f (g m)) = sumFin12 f :=
  sumList_bijection (List.finRange 12) g gInv f h1 h2 finRange12_nodup
    (fun m _ => mem_finRange12 (g m)) (fun m _ => mem_finRange12 (gInv m))

/-- 12-state isotropic orbit-mixing operator `I + ((u - 1) / 12) J` (instantiates `M_pair(ζ_18)`). -/
def block12Op (act : α → Bool) (moveTo : Fin 12 → α → α) (u inv12 : R)
    (ψ : FockVec R α) : FockVec R α :=
  fun c =>
    if act c then
      StarCommRing.add (ψ c)
        (StarCommRing.mul (StarCommRing.mul (StarCommRing.sub u StarCommRing.one) inv12)
          (sumFin12 (fun m => ψ (moveTo m c))))
    else ψ c

-- [helper]
theorem block12_comp
    (act : α → Bool) (moveTo : Fin 12 → α → α) (inv12 v₁ v₂ : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (h12 : StarCommRing.mul (StarCommRing.ofNatR 12) inv12 = StarCommRing.one)
    (ψ : FockVec R α) (c : α) :
    block12Op act moveTo v₂ inv12 (block12Op act moveTo v₁ inv12 ψ) c =
      block12Op act moveTo (StarCommRing.mul v₂ v₁) inv12 ψ c := by
  let _ : CommRing R := StarCommRing.toCommRing R
  unfold block12Op
  cases ha : act c with
  | false => rw [ite_bool_false, ite_bool_false, ite_bool_false]
  | true =>
    rw [ite_bool_true, ite_bool_true]
    have h12' : StarCommRing.ofNatR 12 * inv12 = 1 := h12
    have hS1 : sumFin12 (fun m =>
          if act (moveTo m c) then
            StarCommRing.add (ψ (moveTo m c))
              (StarCommRing.mul (StarCommRing.mul (StarCommRing.sub v₁ StarCommRing.one) inv12)
                (sumFin12 (fun m' => ψ (moveTo m' (moveTo m c)))))
          else ψ (moveTo m c)) =
        StarCommRing.mul v₁ (sumFin12 (fun m => ψ (moveTo m c))) := by
      rw [sumFin12_congr _ (fun m => StarCommRing.add (ψ (moveTo m c))
            (StarCommRing.mul (StarCommRing.mul (StarCommRing.sub v₁ StarCommRing.one) inv12)
              (sumFin12 (fun m' => ψ (moveTo m' c))))) (fun m => by
            rw [ite_eq_left (hActMove m c ha)]
            congr 2; exact sumFin12_congr _ _ (fun m' => by rw [hMoveMove m' m c ha])),
          sumFin12_add, sumFin12_const]
      let S := sumFin12 (fun m => ψ (moveTo m c))
      change S + StarCommRing.ofNatR 12 * (((v₁ + -1) * inv12) * S) = v₁ * S
      calc S + StarCommRing.ofNatR 12 * (((v₁ + -1) * inv12) * S)
          = S + (StarCommRing.ofNatR 12 * inv12) * ((v₁ + -1) * S) := by ring
        _ = S + 1 * ((v₁ + -1) * S) := by rw [h12']
        _ = v₁ * S := by ring
    rw [hS1]
    let S := sumFin12 (fun m => ψ (moveTo m c))
    change (ψ c + ((v₁ + -1) * inv12) * S) + ((v₂ + -1) * inv12) * (v₁ * S) =
      ψ c + ((v₂ * v₁ + -1) * inv12) * S
    ring

-- [helper]
theorem block12_one (act : α → Bool) (moveTo : Fin 12 → α → α) (inv12 : R)
    (ψ : FockVec R α) : block12Op act moveTo StarCommRing.one inv12 ψ = ψ := by
  funext c; unfold block12Op
  rw [StarCommRing.sub_self, StarCommRing.zero_mul, StarCommRing.zero_mul, StarCommRing.add_zero]
  cases act c <;> rfl

-- [helper]
theorem block12_expand_supp [DecidableEq α]
    (act : α → Bool) (curLine : α → Fin 12) (moveTo : Fin 12 → α → α) (inv12 v : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (hMoveCur : ∀ (c : α), act c = true → moveTo (curLine c) c = c)
    (ψ : FockVec R α) (s : List α) (hs : SuppIn s ψ) :
    ∃ s' : List α, SuppIn s' (block12Op act moveTo v inv12 ψ) := by
  let uL := dedupList (s ++ flatMapList (fun c => (List.finRange 12).map (fun m => if act c then moveTo m c else c)) s)
  refine ⟨uL, isNodup_dedupList _, fun c hc => ?_⟩
  have hcNotS : c ∉ s := fun h =>
    hc ((mem_dedupList _ c).mpr (List.mem_append.mpr (Or.inl h)))
  unfold block12Op
  cases ha : act c with
  | false => rw [ite_bool_false]; exact hs.2 c hcNotS
  | true =>
    rw [ite_bool_true, hs.2 c hcNotS, StarCommRing.zero_add]
    have hS0 : sumFin12 (fun m => ψ (moveTo m c)) = StarCommRing.zero := by
      refine sumList_zero_of_all_zero _ _ fun m _ => hs.2 _ fun hmS => ?_
      have hInFM : c ∈ flatMapList (fun x => (List.finRange 12).map (fun k => if act x then moveTo k x else x)) s :=
        (mem_flatMapList_iff _ s c).mpr ⟨moveTo m c, hmS,
          List.mem_map.mpr ⟨curLine c, mem_finRange12 (curLine c),
            by rw [ite_eq_left (hActMove m c ha), hMoveMove _ _ c ha, hMoveCur c ha]⟩⟩
      exact hc ((mem_dedupList _ c).mpr (List.mem_append.mpr (Or.inr hInFM)))
    rw [hS0, StarCommRing.mul_zero]

/-- Exact Fock unitarity of ANY 12-orbit mixer `block12Op` whenever `12 * inv12 = 1`, `conj inv12 = inv12`,
    and `conj u * u = 1`. -/
def block12Unitary [DecidableEq α]
    (act : α → Bool) (curLine : α → Fin 12) (moveTo : Fin 12 → α → α) (u inv12 : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (hMoveCur : ∀ (c : α), act c = true → moveTo (curLine c) c = c)
    (hCurMove : ∀ (m : Fin 12) (c : α), act c = true → curLine (moveTo m c) = m)
    (h12 : StarCommRing.mul (StarCommRing.ofNatR 12) inv12 = StarCommRing.one)
    (hInvConj : StarCommRing.conj inv12 = inv12)
    (hUnit : StarCommRing.mul (StarCommRing.conj u) u = StarCommRing.one) : FockUnitary R α where
  op := block12Op act moveTo u inv12
  dag := block12Op act moveTo (StarCommRing.conj u) inv12
  leftInv := fun ψ => by
    funext c
    rw [block12_comp act moveTo inv12 u (StarCommRing.conj u) hActMove hMoveMove h12 ψ c, hUnit, block12_one]
  rightInv := fun ψ => by
    funext c
    rw [block12_comp act moveTo inv12 (StarCommRing.conj u) u hActMove hMoveMove h12 ψ c,
        StarCommRing.mul_comm u (StarCommRing.conj u), hUnit, block12_one]
  preservesSupp := block12_expand_supp act curLine moveTo inv12 u hActMove hMoveMove hMoveCur
  preservesDagSupp := block12_expand_supp act curLine moveTo inv12 (StarCommRing.conj u) hActMove hMoveMove hMoveCur
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    let _ : CommRing R := StarCommRing.toCommRing R
    let addMod12 : Fin 12 → Fin 12 → Fin 12 := fun a b => ⟨(a.val + b.val) % 12, Nat.mod_lt _ (by decide)⟩
    let subMod12 : Fin 12 → Fin 12 → Fin 12 := fun a b => ⟨(a.val + (12 - b.val)) % 12, Nat.mod_lt _ (by decide)⟩
    have hAddSub : ∀ a b : Fin 12, subMod12 (addMod12 a b) b = a := by decide
    have hSubAdd : ∀ a b : Fin 12, addMod12 (subMod12 a b) b = a := by decide
    let rot : Fin 12 → α → α := fun k c => if act c then moveTo (addMod12 (curLine c) k) c else c
    let rotInv : Fin 12 → α → α := fun k c => if act c then moveTo (subMod12 (curLine c) k) c else c
    have hRotInv1 : ∀ (k : Fin 12) (c : α), rotInv k (rot k c) = c := by
      intro k c; dsimp only [rot, rotInv]
      cases ha : act c with
      | false => simp [ha]
      | true =>
        rw [ite_eq_left rfl, ite_eq_left (hActMove _ c ha), hCurMove _ c ha, hAddSub, hMoveMove _ _ c ha, hMoveCur c ha]
    have hRotInv2 : ∀ (k : Fin 12) (c : α), rot k (rotInv k c) = c := by
      intro k c; dsimp only [rot, rotInv]
      cases ha : act c with
      | false => simp [ha]
      | true =>
        rw [ite_eq_left rfl, ite_eq_left (hActMove _ c ha), hCurMove _ c ha, hSubAdd, hMoveMove _ _ c ha, hMoveCur c ha]
    let uL := dedupList (s ++ flatMapList (fun c => (List.finRange 12).map (fun m => if act c then moveTo m c else c)) s)
    have huNd : IsNodup uL := isNodup_dedupList _
    have huClosedMove : ∀ (c : α) (m : Fin 12), c ∈ uL → act c = true → moveTo m c ∈ uL := by
      intro c m hc hca
      have hMem := List.mem_append.mp ((mem_dedupList _ c).mp hc)
      refine (mem_dedupList _ _).mpr (List.mem_append.mpr (Or.inr ?_))
      rcases hMem with hS | hFM
      · exact (mem_flatMapList_iff _ s _).mpr ⟨c, hS, List.mem_map.mpr ⟨m, mem_finRange12 m, ite_eq_left hca⟩⟩
      · obtain ⟨x, hxS, hmx⟩ := (mem_flatMapList_iff _ s c).mp hFM
        obtain ⟨k, _, hkx⟩ := List.mem_map.mp hmx
        cases hxa : act x with
        | false => rw [hxa, ite_bool_false] at hkx; rw [← hkx, hxa] at hca; exact Bool.noConfusion hca
        | true =>
          rw [ite_eq_left hxa] at hkx
          exact (mem_flatMapList_iff _ s _).mpr ⟨x, hxS, List.mem_map.mpr ⟨m, mem_finRange12 m,
            by rw [ite_eq_left hxa, ← hkx, hMoveMove m k x hxa]⟩⟩
    have huψ : SuppIn uL ψ :=
      ⟨huNd, fun c hc => hsψ.2 c (fun h => hc ((mem_dedupList _ c).mpr (List.mem_append.mpr (Or.inl h))))⟩
    have huOpψ : SuppIn uL (block12Op act moveTo u inv12 ψ) := by
      refine ⟨huNd, fun c hc => ?_⟩
      have hcNotS : c ∉ s := fun h => hc ((mem_dedupList _ c).mpr (List.mem_append.mpr (Or.inl h)))
      unfold block12Op
      cases ha : act c with
      | false => rw [ite_bool_false]; exact hsψ.2 c hcNotS
      | true =>
        rw [ite_bool_true, hsψ.2 c hcNotS, StarCommRing.zero_add]
        have hS0 : sumFin12 (fun m => ψ (moveTo m c)) = StarCommRing.zero := by
          refine sumList_zero_of_all_zero _ _ fun m _ => hsψ.2 _ fun hmS => ?_
          have hInU : moveTo m c ∈ uL := (mem_dedupList _ _).mpr (List.mem_append.mpr (Or.inl hmS))
          have hBack : moveTo (curLine c) (moveTo m c) ∈ uL := huClosedMove _ (curLine c) hInU (hActMove m c ha)
          rw [hMoveMove _ _ c ha, hMoveCur c ha] at hBack
          exact hc hBack
        rw [hS0, StarCommRing.mul_zero]
    rw [(thm_fock_inner_support_indep s' uL _ _ hs'ψ huOpψ).1]
    rw [← (thm_fock_inner_support_indep uL s ψ φ huψ hsψ).1]
    unfold innerOn
    rw [sumList_filter_add uL act, sumList_filter_add uL act (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c))]
    refine congr (congrArg StarCommRing.add ?_) ?_
    · let ua := uL.filter act
      have huaNd : IsNodup ua := isNodup_filter act huNd
      have huaRotCl : ∀ (k : Fin 12) (c : α), c ∈ ua → rot k c ∈ ua := by
        intro k c hc
        have ⟨hcu, hca⟩ := List.mem_filter.mp hc
        exact List.mem_filter.mpr
          ⟨by dsimp only [rot]; rw [ite_eq_left hca]; exact huClosedMove c _ hcu hca,
           by dsimp only [rot]; rw [ite_eq_left hca]; exact hActMove _ c hca⟩
      have huaRotInvCl : ∀ (k : Fin 12) (c : α), c ∈ ua → rotInv k c ∈ ua := by
        intro k c hc
        have ⟨hcu, hca⟩ := List.mem_filter.mp hc
        exact List.mem_filter.mpr
          ⟨by dsimp only [rotInv]; rw [ite_eq_left hca]; exact huClosedMove c _ hcu hca,
           by dsimp only [rotInv]; rw [ite_eq_left hca]; exact hActMove _ c hca⟩
      let hop := StarCommRing.mul (StarCommRing.sub u StarCommRing.one) inv12
      let Sψ : α → R := fun c => sumFin12 (fun m => ψ (moveTo m c))
      let Sφ : α → R := fun c => sumFin12 (fun m => φ (moveTo m c))
      have hRotS : ∀ (χ : FockVec R α) (c : α), act c = true →
          sumFin12 (fun k => χ (rot k c)) = sumFin12 (fun m => χ (moveTo m c)) := by
        intro χ c hca
        rw [sumFin12_congr _ (fun k => χ (moveTo (addMod12 (curLine c) k) c))
              (fun k => by dsimp only [rot]; rw [ite_eq_left hca])]
        exact sumFin12_bijection (R := R) (addMod12 (curLine c)) (fun m => subMod12 m (curLine c))
          (fun m => χ (moveTo m c))
          (fun k => (by decide : ∀ a b : Fin 12, subMod12 (addMod12 a b) a = b) (curLine c) k)
          (fun m => (by decide : ∀ a b : Fin 12, addMod12 a (subMod12 b a) = b) (curLine c) m)
      have hSInv : ∀ (χ : FockVec R α) (k : Fin 12) (c : α), act c = true →
          sumFin12 (fun m => χ (moveTo m (rot k c))) = sumFin12 (fun m => χ (moveTo m c)) := by
        intro χ k c hca
        exact sumFin12_congr _ _ (fun m => by dsimp only [rot]; rw [ite_eq_left hca, hMoveMove m _ c hca])
      have hCross1 : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (Sφ c)) =
          StarCommRing.mul (StarCommRing.ofNatR 12) (sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (Sφ c))) := by
        have h1 : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (Sφ c)) =
            sumList ua (fun c => sumFin12 (fun k => StarCommRing.mul (StarCommRing.conj (ψ (rot k c))) (Sφ (rot k c)))) := by
          refine sumList_congr ua _ _ fun c hc => ?_
          have hca := (List.mem_filter.mp hc).2
          rw [show Sψ c = sumFin12 (fun k => ψ (rot k c)) from (hRotS ψ c hca).symm, sumFin12_conj,
              StarCommRing.mul_comm, ← sumFin12_mul_left]
          exact sumFin12_congr _ _ (fun k => by
            rw [StarCommRing.mul_comm]
            exact congrArg (StarCommRing.mul _) (hSInv φ k c hca).symm)
        rw [h1, sumList_sumFin12_comm,
            sumFin12_congr _ (fun _ => sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (Sφ c)))
              (fun k => sumList_bijection ua (rot k) (rotInv k) _ (hRotInv1 k) (hRotInv2 k) huaNd (huaRotCl k) (huaRotInvCl k)),
            sumFin12_const]
      have hCross2 : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (Sφ c)) =
          StarCommRing.mul (StarCommRing.ofNatR 12) (sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (φ c))) := by
        have h1 : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (Sφ c)) =
            sumList ua (fun c => sumFin12 (fun k => StarCommRing.mul (StarCommRing.conj (Sψ (rot k c))) (φ (rot k c)))) := by
          refine sumList_congr ua _ _ fun c hc => ?_
          have hca := (List.mem_filter.mp hc).2
          rw [show Sφ c = sumFin12 (fun k => φ (rot k c)) from (hRotS φ c hca).symm, ← sumFin12_mul_left]
          exact sumFin12_congr _ _ (fun k => congrArg (fun x => StarCommRing.mul (StarCommRing.conj x) _) (hSInv ψ k c hca).symm)
        rw [h1, sumList_sumFin12_comm,
            sumFin12_congr _ (fun _ => sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (φ c)))
              (fun k => sumList_bijection ua (rot k) (rotInv k) _ (hRotInv1 k) (hRotInv2 k) huaNd (huaRotCl k) (huaRotInvCl k)),
            sumFin12_const]
      have hC1 : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (Sφ c)) =
          StarCommRing.mul inv12 (sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (Sφ c))) := by
        rw [hCross1, ← StarCommRing.mul_assoc, StarCommRing.mul_comm inv12, h12, StarCommRing.one_mul]
      have hC2 : sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (φ c)) =
          StarCommRing.mul inv12 (sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (Sφ c))) := by
        rw [hCross2, ← StarCommRing.mul_assoc, StarCommRing.mul_comm inv12, h12, StarCommRing.one_mul]
      have hTerm : sumList ua (fun c =>
            StarCommRing.mul (StarCommRing.conj (block12Op act moveTo u inv12 ψ c)) (block12Op act moveTo u inv12 φ c)) =
          sumList ua (fun c =>
            StarCommRing.add (StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c))
              (StarCommRing.add (StarCommRing.mul hop (StarCommRing.mul (StarCommRing.conj (ψ c)) (Sφ c)))
                (StarCommRing.add (StarCommRing.mul (StarCommRing.conj hop) (StarCommRing.mul (StarCommRing.conj (Sψ c)) (φ c)))
                  (StarCommRing.mul (StarCommRing.mul (StarCommRing.conj hop) hop) (StarCommRing.mul (StarCommRing.conj (Sψ c)) (Sφ c)))))) := by
        refine sumList_congr ua _ _ fun c hc => ?_
        have hca := (List.mem_filter.mp hc).2
        unfold block12Op; simp only [ite_eq_left hca]
        change StarCommRing.mul (StarCommRing.conj (StarCommRing.add (ψ c) (StarCommRing.mul hop (Sψ c))))
          (StarCommRing.add (φ c) (StarCommRing.mul hop (Sφ c))) = _
        rw [StarCommRing.conj_add, StarCommRing.conj_mul]
        change (StarCommRing.conj (ψ c) + StarCommRing.conj hop * StarCommRing.conj (Sψ c)) * (φ c + hop * Sφ c) =
          StarCommRing.conj (ψ c) * φ c +
            (hop * (StarCommRing.conj (ψ c) * Sφ c) +
              (StarCommRing.conj hop * (StarCommRing.conj (Sψ c) * φ c) +
                (StarCommRing.conj hop * hop) * (StarCommRing.conj (Sψ c) * Sφ c)))
        ring
      rw [hTerm, sumList_add, sumList_add, sumList_add,
          sumList_mul_left, sumList_mul_left, sumList_mul_left, hC1, hC2]
      have hConjHop : StarCommRing.conj hop = (StarCommRing.conj u + -1) * inv12 := by
        change StarCommRing.conj (StarCommRing.mul (StarCommRing.add u (StarCommRing.neg StarCommRing.one)) inv12) = _
        rw [StarCommRing.conj_mul, hInvConj, StarCommRing.conj_add, star_conj_neg, StarCommRing.conj_one]
        rfl
      have hu : StarCommRing.conj u * u = 1 := hUnit
      let T0 := sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (ψ c)) (φ c))
      let T1 := sumList ua (fun c => StarCommRing.mul (StarCommRing.conj (Sψ c)) (Sφ c))
      change T0 + (hop * (inv12 * T1) + (StarCommRing.conj hop * (inv12 * T1) + (StarCommRing.conj hop * hop) * T1)) = T0
      rw [hConjHop]
      change T0 + (((u + -1) * inv12) * (inv12 * T1) + (((StarCommRing.conj u + -1) * inv12) * (inv12 * T1) +
        (((StarCommRing.conj u + -1) * inv12) * ((u + -1) * inv12)) * T1)) = T0
      calc T0 + (((u + -1) * inv12) * (inv12 * T1) + (((StarCommRing.conj u + -1) * inv12) * (inv12 * T1) +
            (((StarCommRing.conj u + -1) * inv12) * ((u + -1) * inv12)) * T1))
          = T0 + (StarCommRing.conj u * u - 1) * (inv12 * inv12 * T1) := by ring
        _ = T0 + (1 - 1) * (inv12 * inv12 * T1) := by rw [hu]
        _ = T0 := by ring
    · refine sumList_congr _ _ _ fun c hc => ?_
      have hcf : act c = false := by
        have hnot := (List.mem_filter.mp hc).2
        cases ha : act c with | false => rfl | true => rw [ha] at hnot; exact Bool.noConfusion hnot
      unfold block12Op; rw [hcf, ite_bool_false, ite_bool_false]

end FockSpace

/-- Headline Theorem 4 (Universal Fock Unitary Constructors):
    over ANY `StarCommRing R` and discrete configuration space `α`, bijections (`permUnitary`),
    unit-modulus diagonal phases (`phaseUnitary`), involutive `2 × 2` blocks (`block2Unitary`),
    and 12-orbit mixers (`block12Unitary`) are exact norm-preserving, inner-product-preserving,
    reversible Fock-space unitaries. -/
theorem thm_fock_elementary_unitaries {R α : Type} [StarCommRing R] [DecidableEq α]
    (π πInv : α → α) (hπ1 : ∀ c, πInv (π c) = c) (hπ2 : ∀ c, π (πInv c) = c)
    (phase : α → R) (hPhase : ∀ c, StarCommRing.mul (StarCommRing.conj (phase c)) (phase c) = StarCommRing.one)
    (flip : α → α) (act2 : α → Bool) (a b : R)
    (hFlip : ∀ c, flip (flip c) = c) (hAct2 : ∀ c, act2 (flip c) = act2 c)
    (hDiag : StarCommRing.add (StarCommRing.mul (StarCommRing.conj a) a) (StarCommRing.mul (StarCommRing.conj b) b) = StarCommRing.one)
    (hOff : StarCommRing.add (StarCommRing.mul (StarCommRing.conj a) b) (StarCommRing.mul (StarCommRing.conj b) a) = StarCommRing.zero) :
    (∀ ψ, (permUnitary (R := R) π πInv hπ1 hπ2).dag ((permUnitary (R := R) π πInv hπ1 hπ2).op ψ) = ψ) ∧
    (∀ ψ, (phaseUnitary phase hPhase).dag ((phaseUnitary phase hPhase).op ψ) = ψ) ∧
    (∀ ψ, (block2Unitary flip act2 a b hFlip hAct2 hDiag hOff).dag
          ((block2Unitary flip act2 a b hFlip hAct2 hDiag hOff).op ψ) = ψ) :=
  ⟨(permUnitary (R := R) π πInv hπ1 hπ2).leftInv,
   (phaseUnitary phase hPhase).leftInv,
   (block2Unitary flip act2 a b hFlip hAct2 hDiag hOff).leftInv⟩

/-- Headline Theorem 5 (All-Time Iterated Fock Unitarity `∀ t : Nat`):
    for EVERY `FockUnitary U` over any `StarCommRing R`, iterating `U` for any `t : Nat` beats
    preserves exact reversibility, finite support, Hermitian inner products, and squared norms. -/
theorem thm_fock_unitary_iter_all_time {R α : Type} [StarCommRing R] [DecidableEq α] (U : FockUnitary R α) :
    ∀ t : Nat,
      (∀ ψ : FockVec R α, iter U.dag t (iter U.op t ψ) = ψ) ∧
      (∀ ψ : FockVec R α, iter U.op t (iter U.dag t ψ) = ψ) ∧
      (∀ (ψ : FockVec R α) (s : List α), SuppIn s ψ → ∃ s' : List α, SuppIn s' (iter U.op t ψ)) ∧
      (∀ (ψ φ : FockVec R α) (s s' : List α),
        SuppIn s ψ → SuppIn s φ → SuppIn s' (iter U.op t ψ) → SuppIn s' (iter U.op t φ) →
        innerOn s' (iter U.op t ψ) (iter U.op t φ) = innerOn s ψ φ ∧
        normSqOn s' (iter U.op t ψ) = normSqOn s ψ) := by
  intro t
  induction t with
  | zero =>
    refine ⟨fun _ => rfl, fun _ => rfl, fun _ s hs => ⟨s, hs⟩, ?_⟩
    intro ψ φ s s' hsψ _ hs'ψ _
    exact thm_fock_inner_support_indep s' s ψ φ hs'ψ hsψ
  | succ k ih =>
    obtain ⟨ihL, ihR, ihS, ihIn⟩ := ih
    refine ⟨?_, ?_, ?_, ?_⟩
    · intro ψ; simp only [iter]; rw [← iter_comm U.dag k (U.op (iter U.op k ψ)), U.leftInv, ihL ψ]
    · intro ψ; simp only [iter]; rw [← iter_comm U.op k (U.dag (iter U.dag k ψ)), U.rightInv, ihR ψ]
    · intro ψ s hs; obtain ⟨sk, hsk⟩ := ihS ψ s hs; exact U.preservesSupp (iter U.op k ψ) sk hsk
    · intro ψ φ s s' hsψ hsφ hs'ψ hs'φ
      obtain ⟨s1, hs1⟩ := ihS ψ s hsψ
      obtain ⟨s2, hs2⟩ := ihS φ s hsφ
      let sm := nodupUnion s1 s2
      have hsmψ : SuppIn sm (iter U.op k ψ) :=
        ⟨isNodup_nodupUnion hs1.1 s2, fun c hc => hs1.2 c (fun h => hc ((mem_nodupUnion s1 s2 c).mpr (Or.inl h)))⟩
      have hsmφ : SuppIn sm (iter U.op k φ) :=
        ⟨isNodup_nodupUnion hs1.1 s2, fun c hc => hs2.2 c (fun h => hc ((mem_nodupUnion s1 s2 c).mpr (Or.inr h)))⟩
      have hInner : innerOn s' (iter U.op (k + 1) ψ) (iter U.op (k + 1) φ) = innerOn s ψ φ := by
        simp only [iter]
        rw [U.preservesInner (iter U.op k ψ) (iter U.op k φ) sm s' hsmψ hsmφ hs'ψ hs'φ]
        exact (ihIn ψ φ s sm hsψ hsφ hsmψ hsmφ).1
      have hNorm : normSqOn s' (iter U.op (k + 1) ψ) = normSqOn s ψ := by
        unfold normSqOn; simp only [iter]
        rw [U.preservesInner (iter U.op k ψ) (iter U.op k ψ) sm s' hsmψ hsmψ hs'ψ hs'ψ]
        exact (ihIn ψ ψ s sm hsψ hsψ hsmψ hsmψ).2
      exact ⟨hInner, hNorm⟩


/-! ## Section 3: 24-Slot Line Geometry, Coxeter Parity `M_P = simpleRefl 0`, & Infinite `HoneycombConfig` -/

/-- Nonzero excitation sign `{-1, +1}`, embedding into `Vibe.Tone`. -/
inductive Sign where
  | neg
  | pos
  deriving DecidableEq, Repr

def Sign.dual : Sign → Sign
  | .neg => .pos
  | .pos => .neg

def Sign.toTone : Sign → Tone
  | .neg => .neg
  | .pos => .pos

def Sign.value : Sign → Int
  | .neg => -1
  | .pos => 1

/-- Full single-slot Fock occupation state: empty (neutral vacuum `0`) or `(sign, role)`. -/
inductive SlotState where
  | empty
  | occ (s : Sign) (r : Bool)
  deriving DecidableEq, Repr

def SlotState.tone : SlotState → Tone
  | .empty => .zero
  | .occ s _ => s.toTone

def SlotState.charge : SlotState → Int
  | .empty => 0
  | .occ s _ => s.value

def SlotState.dual : SlotState → SlotState
  | .empty => .empty
  | .occ s r => .occ s.dual r

private theorem slotState_dual_dual (x : SlotState) : x.dual.dual = x := by
  cases x with | empty => rfl | occ s _ => cases s <;> rfl

/-- Constructive `DecidableEq (Fin n → α)` for any `[DecidableEq α]`. -/
def decEqFinGo {α : Type} [DecidableEq α] {N : Nat} (f g : Fin N → α) :
    (k : Nat) → (hk : k ≤ N) → Decidable (∀ i : Fin N, i.val < k → f i = g i)
  | 0, _ => isTrue (fun i hi => absurd hi (Nat.not_lt_zero i.val))
  | k + 1, hk =>
    if hlast : f ⟨k, hk⟩ = g ⟨k, hk⟩ then
      match decEqFinGo f g k (Nat.le_of_succ_le hk) with
      | isTrue hprev =>
        isTrue (fun i hi =>
          if hlt : i.val < k then hprev i hlt
          else
            have heq : i = ⟨k, hk⟩ := Fin.ext (by dsimp only; omega)
            heq ▸ hlast)
      | isFalse hne =>
        isFalse (fun hall => hne (fun i hi => hall i (Nat.lt_succ_of_lt hi)))
    else
      isFalse (fun hall => hlast (hall ⟨k, hk⟩ (Nat.lt_succ_self k)))

def decEqFinAux {α : Type} [DecidableEq α] (n : Nat) (f g : Fin n → α) :
    Decidable (∀ i : Fin n, f i = g i) :=
  match decEqFinGo f g n (Nat.le_refl n) with
  | isTrue h => isTrue (fun i => h i i.isLt)
  | isFalse h => isFalse (fun hall => h (fun i _ => hall i))

def decEqFin {n : Nat} {α : Type} [DecidableEq α] (f g : Fin n → α) : Decidable (f = g) :=
  match decEqFinAux n f g with
  | isTrue h => isTrue (funext h)
  | isFalse h => isFalse (fun heq => h (fun i => congrFun heq i))

instance : DecidableEq Vec5 := fun u v => decEqFin u v
instance : DecidableEq Mat5 := fun A B => decEqFin A B

/-- Full 24-slot quantum dock state `Fin 24 → SlotState` extending `Vibe.DockState`. -/
abbrev FullDock := Fin 24 → SlotState

instance : DecidableEq FullDock := fun d₁ d₂ => decEqFin d₁ d₂
instance : DecidableEq DockState := fun d₁ d₂ => decEqFin d₁ d₂

/-- Calm vacuum dock `v1FullDock`: all 24 slots empty. -/
def v1FullDock : FullDock := fun _ => .empty

/-- Projection from `FullDock` to `Vibe.Tone.DockState`. -/
def fullDockToDockState (d : FullDock) : DockState := fun i => (d i).tone

/-- Exact integer charge of a 24-slot `FullDock` (equals `dockCharge (fullDockToDockState d)`). -/
def fullDockCharge (d : FullDock) : Int :=
  (List.finRange 24).foldl (fun acc i => acc + (d i).charge) 0

/-- Slotwise charge conjugation `C` on a `FullDock`. -/
def conjFullDock (d : FullDock) : FullDock := fun i => (d i).dual

/-- Antipodal slot reversal `R` on a `FullDock`. -/
def revFullDock (d : FullDock) : FullDock := fun i => d (oppSlot i)

/-- Canonical first endpoint `lineA l < lineB l` of antipodal line `l : Fin 12`. -/
def lineA (l : Fin 12) : Fin 24 :=
  ⟨(l.val / 2) * 4 + (l.val % 2), by have := l.isLt; omega⟩

/-- Canonical antipodal second endpoint `lineB l = oppSlot (lineA l)` of line `l : Fin 12`. -/
def lineB (l : Fin 12) : Fin 24 := oppSlot (lineA l)

/-- Line index `0..11` containing slot `s : Fin 24`. -/
def lineOfSlot (s : Fin 24) : Fin 12 :=
  ⟨(s.val / 4) * 2 + (if s.val % 4 < 2 then s.val % 4 else 3 - s.val % 4),
   by have := s.isLt; split <;> omega⟩

/-- Exact improper `W(F_4)^-` spatial parity reflection `M_P = simpleRefl 0` (`det = -1`) in `O^+(4,1; ℤ[√2])`. -/
def parityMat5 : Mat5 := simpleRefl ⟨0, by decide⟩

/-- Induced slot involution `paritySlot` of `M_P = simpleRefl 0` on `Fin 24` (`1↔20, 2↔23, 5↔16, 6↔19, 9↔12, 10↔15`). -/
def paritySlot : Fin 24 → Fin 24
  | ⟨1, _⟩  => ⟨20, by decide⟩
  | ⟨2, _⟩  => ⟨23, by decide⟩
  | ⟨5, _⟩  => ⟨16, by decide⟩
  | ⟨6, _⟩  => ⟨19, by decide⟩
  | ⟨9, _⟩  => ⟨12, by decide⟩
  | ⟨10, _⟩ => ⟨15, by decide⟩
  | ⟨12, _⟩ => ⟨9, by decide⟩
  | ⟨15, _⟩ => ⟨10, by decide⟩
  | ⟨16, _⟩ => ⟨5, by decide⟩
  | ⟨19, _⟩ => ⟨6, by decide⟩
  | ⟨20, _⟩ => ⟨1, by decide⟩
  | ⟨23, _⟩ => ⟨2, by decide⟩
  | s       => s

/-- Induced antipodal-line involution `parityLine` of `M_P` on `Fin 12` (`1↔10, 3↔8, 5↔6`). -/
def parityLine : Fin 12 → Fin 12
  | ⟨1, _⟩  => ⟨10, by decide⟩
  | ⟨3, _⟩  => ⟨8, by decide⟩
  | ⟨5, _⟩  => ⟨6, by decide⟩
  | ⟨6, _⟩  => ⟨5, by decide⟩
  | ⟨8, _⟩  => ⟨3, by decide⟩
  | ⟨10, _⟩ => ⟨1, by decide⟩
  | l       => l

/-- Spatial parity `P` on a `FullDock`. -/
def parityFullDock (d : FullDock) : FullDock := fun i => d (paritySlot i)

/-- Combined `CP` action on a `FullDock`. -/
def cpFullDock (d : FullDock) : FullDock := conjFullDock (parityFullDock d)

-- [helper]
theorem line_geom_facts :
    (∀ l : Fin 12, oppSlot (lineA l) = lineB l ∧ oppSlot (lineB l) = lineA l ∧ lineA l ≠ lineB l) ∧
    (∀ l : Fin 12, lineOfSlot (lineA l) = l ∧ lineOfSlot (lineB l) = l) ∧
    (∀ s : Fin 24, s = lineA (lineOfSlot s) ∨ s = lineB (lineOfSlot s)) ∧
    (∀ l₁ l₂ : Fin 12, l₁ ≠ l₂ →
      lineA l₁ ≠ lineA l₂ ∧ lineA l₁ ≠ lineB l₂ ∧ lineB l₁ ≠ lineA l₂ ∧ lineB l₁ ≠ lineB l₂) ∧
    (∀ s : Fin 24, paritySlot (paritySlot s) = s ∧ paritySlot (oppSlot s) = oppSlot (paritySlot s)) ∧
    (∀ l : Fin 12, parityLine (parityLine l) = l ∧
      paritySlot (lineA l) = lineA (parityLine l) ∧ paritySlot (lineB l) = lineB (parityLine l)) := by
  decide

/-! ### `Mat5` Ring/Determinant Bridges & Coxeter Parity Conjugation (`Matrix.det_mul`) -/

-- [helper]
theorem fb_mat5Mul_id_left (A : Mat5) : mat5Mul mat5Id A = A := by
  apply Matrix.of.injective; simp [toMat5_mul, toMat5_id]

-- [helper]
theorem fb_mat5Mul_id_right (A : Mat5) : mat5Mul A mat5Id = A := by
  apply Matrix.of.injective; simp [toMat5_mul, toMat5_id]

-- [helper]
theorem fb_mat5Mul_assoc (A B C : Mat5) :
    mat5Mul (mat5Mul A B) C = mat5Mul A (mat5Mul B C) := by
  apply Matrix.of.injective; simp [toMat5_mul, mul_assoc]

/-- Exact Coxeter parity conjugation on cell frames: `g ↦ M_P * g * M_P`. -/
def conjMatP (g : Mat5) : Mat5 := mat5Mul (mat5Mul parityMat5 g) parityMat5

/-- Exact canonical bipartite dock orientation `σ(g) = +1` if `det(g) = +1`, else `-1`. -/
def dockParity (g : Mat5) : Int :=
  if mat5Det g = ZSqrt2.one then 1 else -1

/-- Headline Theorem 6 (Exact `{3,4,3,4}` Coxeter Spatial Parity Equivariance & Unconditional
    Determinant Conjugation Invariance):
    `M_P = simpleRefl 0` is an improper `W(F_4)^-` reflection (`M_P^2 = I_5`, `det(M_P) = -1`)
    mapping every facet normal `n_a ↦ n_{paritySlot a}`, conjugating every Coxeter transport
    `M_P k_a M_P = k_{paritySlot a}` across all 24 slots, and preserving `mat5Det` (and hence
    `dockParity`) under conjugation `g ↦ M_P g M_P` unconditionally for ALL `g : Mat5`. -/
theorem thm_fock_coxeter_parity_equivariance :
    mat5Mul parityMat5 parityMat5 = mat5Id ∧
    mat5Det parityMat5 = ZSqrt2.ofInt (-1) ∧
    (∀ a : Fin 24, mat5Vec parityMat5 (facetNormal a) = facetNormal (paritySlot a)) ∧
    (∀ a : Fin 24, mat5Mul (mat5Mul parityMat5 (transport a)) parityMat5 = transport (paritySlot a)) ∧
    (∀ g : Mat5, mat5Det (conjMatP g) = mat5Det g ∧ dockParity (conjMatP g) = dockParity g) := by
  have hP2 : mat5Mul parityMat5 parityMat5 = mat5Id :=
    funext fun i => funext fun j => (by decide : ∀ x y : Fin 5, mat5Mul parityMat5 parityMat5 x y = mat5Id x y) i j
  have hPOrth : mat5Mul (mat5Transpose parityMat5) (mat5Mul twiceGram parityMat5) = twiceGram :=
    thm_reflection_preserves_twiceGram (unitVec5 ⟨0, by decide⟩) (by decide)
  have hDet : mat5Det parityMat5 = ZSqrt2.ofInt (-1) := by decide
  have hNorm : ∀ a : Fin 24, mat5Vec parityMat5 (facetNormal a) = facetNormal (paritySlot a) := fun a =>
    funext ((by decide : ∀ (x : Fin 24) (i : Fin 5),
      mat5Vec parityMat5 (facetNormal x) i = facetNormal (paritySlot x) i) a)
  have hTrans : ∀ a : Fin 24,
      mat5Mul (mat5Mul parityMat5 (transport a)) parityMat5 = transport (paritySlot a) := by
    intro a
    have hCommZ : mat5Mul parityMat5 centralInversion = mat5Mul centralInversion parityMat5 :=
      thm_central_inversion_properties.2.2.2.2 ⟨0, by decide⟩
    unfold transport faceReflection
    calc mat5Mul (mat5Mul parityMat5 (mat5Mul (reflectionIn (facetNormal a)) centralInversion)) parityMat5
        = mat5Mul (mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) centralInversion) parityMat5 := by
            rw [← fb_mat5Mul_assoc]
      _ = mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) (mat5Mul centralInversion parityMat5) := by
            rw [fb_mat5Mul_assoc]
      _ = mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) (mat5Mul parityMat5 centralInversion) := by
            rw [hCommZ]
      _ = mat5Mul (mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) parityMat5) centralInversion := by
            rw [← fb_mat5Mul_assoc]
      _ = mat5Mul (reflectionIn (mat5Vec parityMat5 (facetNormal a))) centralInversion := by
            rw [thm_conj_reflection parityMat5 hP2 hPOrth (facetNormal a)]
      _ = mat5Mul (reflectionIn (facetNormal (paritySlot a))) centralInversion := by
            rw [hNorm a]
  have hConjDet : ∀ g : Mat5, mat5Det (conjMatP g) = mat5Det g ∧ dockParity (conjMatP g) = dockParity g := by
    intro g
    have hd : mat5Det (conjMatP g) = mat5Det g := by
      rw [conjMatP, mat5Det_eq_det, toMat5_mul, toMat5_mul, Matrix.det_mul, Matrix.det_mul,
          ← mat5Det_eq_det, ← mat5Det_eq_det, hDet]
      change (-1 : ZSqrt2) * mat5Det g * (-1 : ZSqrt2) = mat5Det g
      ring
    exact ⟨hd, by unfold dockParity; rw [hd]⟩
  exact ⟨hP2, hDet, hNorm, hTrans, hConjDet⟩

-- [helper]
theorem conjMatP_involutive (g : Mat5) : conjMatP (conjMatP g) = g := by
  have hP2 := congrArg Matrix.of thm_fock_coxeter_parity_equivariance.1
  apply Matrix.of.injective
  simp only [conjMatP, toMat5_mul, toMat5_id] at hP2 ⊢
  calc Matrix.of parityMat5 * (Matrix.of parityMat5 * Matrix.of g * Matrix.of parityMat5) * Matrix.of parityMat5
      = (Matrix.of parityMat5 * Matrix.of parityMat5) * Matrix.of g * (Matrix.of parityMat5 * Matrix.of parityMat5) := by
          simp only [mul_assoc]
    _ = Matrix.of g := by rw [hP2, one_mul, mul_one]

private theorem conjMatP_mul (g₁ g₂ : Mat5) :
    conjMatP (mat5Mul g₁ g₂) = mat5Mul (conjMatP g₁) (conjMatP g₂) := by
  have hP2 := congrArg Matrix.of thm_fock_coxeter_parity_equivariance.1
  apply Matrix.of.injective
  simp only [conjMatP, toMat5_mul, toMat5_id] at hP2 ⊢
  calc Matrix.of parityMat5 * (Matrix.of g₁ * Matrix.of g₂) * Matrix.of parityMat5
      = Matrix.of parityMat5 * Matrix.of g₁ * 1 * Matrix.of g₂ * Matrix.of parityMat5 := by
          simp only [mul_one, mul_assoc]
    _ = Matrix.of parityMat5 * Matrix.of g₁ * (Matrix.of parityMat5 * Matrix.of parityMat5) *
          Matrix.of g₂ * Matrix.of parityMat5 := by rw [hP2]
    _ = Matrix.of parityMat5 * Matrix.of g₁ * Matrix.of parityMat5 *
          (Matrix.of parityMat5 * Matrix.of g₂ * Matrix.of parityMat5) := by simp only [mul_assoc]

/-! ### Canonical Total Order on `Mat5` & Infinite-Honeycomb `HoneycombConfig` -/

def listIntLt : List Int → List Int → Bool
  | [], _ => false
  | _, [] => false
  | x :: xs, y :: ys => if x < y then true else if y < x then false else listIntLt xs ys

private theorem listIntLt_irrefl (xs : List Int) : listIntLt xs xs = false := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [listIntLt]
    rw [ite_eq_right (by omega), ite_eq_right (by omega)]
    exact ih

private theorem listIntLt_trans (xs ys zs : List Int)
    (h1 : listIntLt xs ys = true) (h2 : listIntLt ys zs = true) :
    listIntLt xs zs = true := by
  induction xs generalizing ys zs with
  | nil => simp [listIntLt] at h1
  | cons x xr ih =>
    cases ys with
    | nil => simp [listIntLt] at h1
    | cons y yr =>
      cases zs with
      | nil => simp [listIntLt] at h2
      | cons z zr =>
        simp only [listIntLt] at h1 h2 ⊢
        split_ifs at h1 h2 ⊢
        all_goals first | omega | exact ih yr zr h1 h2

private theorem listIntLt_trichotomy (xs ys : List Int) (hlen : xs.length = ys.length) :
    listIntLt xs ys = true ∨ xs = ys ∨ listIntLt ys xs = true := by
  induction xs generalizing ys with
  | nil =>
    cases ys with
    | nil => exact Or.inr (Or.inl rfl)
    | cons _ _ => simp at hlen
  | cons x xr ih =>
    cases ys with
    | nil => simp at hlen
    | cons y yr =>
      simp only [List.length_cons] at hlen
      if hxy : x < y then exact Or.inl (by simp [listIntLt, hxy])
      else if hyx : y < x then exact Or.inr (Or.inr (by simp [listIntLt, hyx]))
      else
        have hEq : x = y := by omega
        rcases ih yr (by omega) with h1 | h2 | h3
        · exact Or.inl (by simp [listIntLt, hxy, hyx, h1])
        · exact Or.inr (Or.inl (by rw [hEq, h2]))
        · exact Or.inr (Or.inr (by simp [listIntLt, hyx, hxy, h3]))

def vec5Key (v : Vec5) : List Int :=
  [ (v ⟨0, by decide⟩).a, (v ⟨0, by decide⟩).b,
    (v ⟨1, by decide⟩).a, (v ⟨1, by decide⟩).b,
    (v ⟨2, by decide⟩).a, (v ⟨2, by decide⟩).b,
    (v ⟨3, by decide⟩).a, (v ⟨3, by decide⟩).b,
    (v ⟨4, by decide⟩).a, (v ⟨4, by decide⟩).b ]

def mat5Key (g : Mat5) : List Int :=
  vec5Key (g ⟨0, by decide⟩) ++ vec5Key (g ⟨1, by decide⟩) ++
  vec5Key (g ⟨2, by decide⟩) ++ vec5Key (g ⟨3, by decide⟩) ++ vec5Key (g ⟨4, by decide⟩)

private theorem vec5Key_inj (u v : Vec5) (h : vec5Key u = vec5Key v) : u = v := by
  unfold vec5Key at h
  simp only [List.cons.injEq] at h
  rcases h with ⟨h0a, h0b, h1a, h1b, h2a, h2b, h3a, h3b, h4a, h4b, _⟩
  funext i; fin_cases i <;> exact ZSqrt2.ext (by assumption) (by assumption)

private theorem mat5Key_inj (g₁ g₂ : Mat5) (h : mat5Key g₁ = mat5Key g₂) : g₁ = g₂ := by
  unfold mat5Key at h
  have ⟨h0123, h4⟩ := List.append_inj h rfl
  have ⟨h012, h3⟩ := List.append_inj h0123 rfl
  have ⟨h01, h2⟩ := List.append_inj h012 rfl
  have ⟨h0, h1⟩ := List.append_inj h01 rfl
  funext i; fin_cases i
  · exact vec5Key_inj _ _ h0
  · exact vec5Key_inj _ _ h1
  · exact vec5Key_inj _ _ h2
  · exact vec5Key_inj _ _ h3
  · exact vec5Key_inj _ _ h4

/-- Canonical strict total order on `{3,4,3,4}` Coxeter cell frames `Mat5`. -/
def mat5Lt (g₁ g₂ : Mat5) : Bool := listIntLt (mat5Key g₁) (mat5Key g₂)

private theorem mat5Lt_irrefl (g : Mat5) : mat5Lt g g = false := listIntLt_irrefl (mat5Key g)

private theorem mat5Lt_trans (g₁ g₂ g₃ : Mat5)
    (h1 : mat5Lt g₁ g₂ = true) (h2 : mat5Lt g₂ g₃ = true) : mat5Lt g₁ g₃ = true :=
  listIntLt_trans _ _ _ h1 h2

private theorem mat5Lt_trichotomy (g₁ g₂ : Mat5) :
    mat5Lt g₁ g₂ = true ∨ g₁ = g₂ ∨ mat5Lt g₂ g₁ = true := by
  rcases listIntLt_trichotomy (mat5Key g₁) (mat5Key g₂) rfl with h1 | h2 | h3
  · exact Or.inl h1
  · exact Or.inr (Or.inl (mat5Key_inj g₁ g₂ h2))
  · exact Or.inr (Or.inr h3)

/-- Strict key-order predicate for canonical finite-excitation honeycomb maps. -/
def SortedEntries : List (Mat5 × FullDock) → Prop
  | [] => True
  | (g, _) :: rest => (∀ p : Mat5 × FullDock, p ∈ rest → mat5Lt g p.1 = true) ∧ SortedEntries rest

/-- Canonical finite-excitation configuration on the ENTIRE infinite `{3,4,3,4}` honeycomb:
    stores only non-vacuum docks `d ≠ v1FullDock` in strictly sorted `Mat5` key order. -/
structure HoneycombConfig where
  entries : List (Mat5 × FullDock)
  sorted : SortedEntries entries
  nonEmpty : ∀ p : Mat5 × FullDock, p ∈ entries → p.2 ≠ v1FullDock

-- [helper]
theorem honeycombConfig_eq_iff (c₁ c₂ : HoneycombConfig) :
    c₁ = c₂ ↔ c₁.entries = c₂.entries := by
  cases c₁; cases c₂; simp

instance : DecidableEq HoneycombConfig := fun c₁ c₂ =>
  if h : c₁.entries = c₂.entries then
    isTrue ((honeycombConfig_eq_iff c₁ c₂).mpr h)
  else
    isFalse (fun heq => h ((honeycombConfig_eq_iff c₁ c₂).mp heq))

/-- Global calm vacuum configuration `v1Config` (`|V_1⟩` basis configuration): zero excited docks. -/
def v1Config : HoneycombConfig := ⟨[], trivial, fun _ h => nomatch h⟩

/-- Lookup dock state at ANY cell `g : Mat5` of the infinite `{3,4,3,4}` honeycomb (`v1FullDock` if unlisted). -/
def lookupEntries (g : Mat5) : List (Mat5 × FullDock) → FullDock
  | [] => v1FullDock
  | (k, d) :: rest => if k = g then d else lookupEntries g rest

def HoneycombConfig.lookup (c : HoneycombConfig) (g : Mat5) : FullDock :=
  lookupEntries g c.entries

/-- Sorted list of all non-empty occupied cells of `c`. -/
def HoneycombConfig.activeDocks (c : HoneycombConfig) : List Mat5 :=
  c.entries.map Prod.fst

private theorem lookupEntries_not_lt (g : Mat5) (es : List (Mat5 × FullDock))
    (hgt : ∀ p : Mat5 × FullDock, p ∈ es → mat5Lt g p.1 = true) :
    lookupEntries g es = v1FullDock := by
  induction es with
  | nil => rfl
  | cons p rest ih =>
    cases p with | mk k d =>
    simp only [lookupEntries]
    have hlt := hgt (k, d) (List.Mem.head rest)
    have hne : k ≠ g := fun heq => by rw [heq, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
    rw [ite_eq_right hne]
    exact ih (fun q hq => hgt q (List.Mem.tail _ hq))

private theorem sortedEntries_ext (es₁ es₂ : List (Mat5 × FullDock))
    (hs₁ : SortedEntries es₁) (hs₂ : SortedEntries es₂)
    (hne₁ : ∀ p, p ∈ es₁ → p.2 ≠ v1FullDock) (hne₂ : ∀ p, p ∈ es₂ → p.2 ≠ v1FullDock)
    (hlk : ∀ g : Mat5, lookupEntries g es₁ = lookupEntries g es₂) :
    es₁ = es₂ := by
  induction es₁ generalizing es₂ with
  | nil =>
    cases es₂ with
    | nil => rfl
    | cons p rest =>
      cases p with | mk k d =>
      have h0 := hlk k; simp [lookupEntries] at h0
      exact absurd h0.symm (hne₂ (k, d) (List.Mem.head rest))
  | cons p₁ r₁ ih =>
    cases p₁ with | mk k₁ d₁ =>
    cases es₂ with
    | nil =>
      have h0 := hlk k₁; simp [lookupEntries] at h0
      exact absurd h0 (hne₁ (k₁, d₁) (List.Mem.head r₁))
    | cons p₂ r₂ =>
      cases p₂ with | mk k₂ d₂ =>
      rcases mat5Lt_trichotomy k₁ k₂ with hlt | heq | hgt
      · have h0 := hlk k₁
        have hne12 : k₂ ≠ k₁ := fun h => by rw [h, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        simp only [lookupEntries, ite_true, ite_eq_right hne12] at h0
        rw [lookupEntries_not_lt k₁ r₂ (fun q hq => mat5Lt_trans k₁ k₂ q.1 hlt (hs₂.1 q hq))] at h0
        exact absurd h0 (hne₁ (k₁, d₁) (List.Mem.head r₁))
      · subst heq
        have hd : d₁ = d₂ := by simpa [lookupEntries] using hlk k₁
        have hr : r₁ = r₂ := by
          apply ih r₂ hs₁.2 hs₂.2 (fun q hq => hne₁ q (List.Mem.tail _ hq)) (fun q hq => hne₂ q (List.Mem.tail _ hq))
          intro g
          if hgk : k₁ = g then
            subst hgk; rw [lookupEntries_not_lt k₁ r₁ hs₁.1, lookupEntries_not_lt k₁ r₂ hs₂.1]
          else
            simpa [lookupEntries, hgk] using hlk g
        rw [hd, hr]
      · have h0 := hlk k₂
        have hne21 : k₁ ≠ k₂ := fun h => by rw [h, mat5Lt_irrefl] at hgt; exact Bool.noConfusion hgt
        simp only [lookupEntries, ite_true, ite_eq_right hne21] at h0
        rw [lookupEntries_not_lt k₂ r₁ (fun q hq => mat5Lt_trans k₂ k₁ q.1 hgt (hs₁.1 q hq))] at h0
        exact absurd h0.symm (hne₂ (k₂, d₂) (List.Mem.head r₂))

-- [helper]
/-- Canonical extensionality for infinite-honeycomb configurations: equal lookup everywhere implies equality. -/
theorem honeycombConfig_ext (c₁ c₂ : HoneycombConfig)
    (h : ∀ g : Mat5, c₁.lookup g = c₂.lookup g) : c₁ = c₂ :=
  (honeycombConfig_eq_iff c₁ c₂).mpr
    (sortedEntries_ext c₁.entries c₂.entries c₁.sorted c₂.sorted c₁.nonEmpty c₂.nonEmpty h)

-- [helper]
theorem activeDocks_nodup (c : HoneycombConfig) : IsNodup c.activeDocks := by
  unfold HoneycombConfig.activeDocks
  have hAux : ∀ es : List (Mat5 × FullDock), SortedEntries es → IsNodup (es.map Prod.fst) := by
    intro es hs
    induction es with
    | nil => exact IsNodup.nil
    | cons p rest ih =>
      cases p with | mk k d =>
      refine IsNodup.cons (fun hmem => ?_) (ih hs.2)
      obtain ⟨q, hq, hqk⟩ := List.mem_map.mp hmem
      have hlt := hs.1 q hq
      rw [hqk, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
  exact hAux c.entries c.sorted

-- [helper]
theorem mem_activeDocks_iff (c : HoneycombConfig) (g : Mat5) :
    g ∈ c.activeDocks ↔ c.lookup g ≠ v1FullDock := by
  unfold HoneycombConfig.activeDocks HoneycombConfig.lookup
  have hAux : ∀ es : List (Mat5 × FullDock), SortedEntries es →
      (∀ p, p ∈ es → p.2 ≠ v1FullDock) →
      (g ∈ es.map Prod.fst ↔ lookupEntries g es ≠ v1FullDock) := by
    intro es hs hne
    induction es with
    | nil => simp [lookupEntries]
    | cons p rest ih =>
      cases p with | mk k d =>
      simp only [List.map, lookupEntries, List.mem_cons]
      split_ifs with hkg
      · subst hkg; simp [hne (k, d) (List.Mem.head rest)]
      · have hih := ih hs.2 (fun q hq => hne q (List.Mem.tail _ hq))
        simp [Ne.symm hkg, hih]
  exact hAux c.entries c.sorted c.nonEmpty

def setEntries (g : Mat5) (d : FullDock) : List (Mat5 × FullDock) → List (Mat5 × FullDock)
  | [] => if d = v1FullDock then [] else [(g, d)]
  | (k, dk) :: rest =>
    if mat5Lt g k then
      if d = v1FullDock then (k, dk) :: rest else (g, d) :: (k, dk) :: rest
    else if k = g then
      if d = v1FullDock then rest else (g, d) :: rest
    else
      (k, dk) :: setEntries g d rest

private theorem mem_setEntries_keys (g : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (p : Mat5 × FullDock) (hp : p ∈ setEntries g d es) :
    p.1 = g ∨ ∃ q : Mat5 × FullDock, q ∈ es ∧ q.1 = p.1 := by
  induction es with
  | nil =>
    simp only [setEntries] at hp
    split_ifs at hp
    · cases hp
    · simp only [List.mem_singleton] at hp; left; rw [hp]
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries] at hp
    split_ifs at hp
    · exact Or.inr ⟨p, hp, rfl⟩
    · rcases List.mem_cons.mp hp with rfl | h'; exact Or.inl rfl; exact Or.inr ⟨p, h', rfl⟩
    · exact Or.inr ⟨p, List.Mem.tail _ hp, rfl⟩
    · rcases List.mem_cons.mp hp with rfl | h'; exact Or.inl rfl; exact Or.inr ⟨p, List.Mem.tail _ h', rfl⟩
    · rcases List.mem_cons.mp hp with rfl | h'
      · exact Or.inr ⟨(k, dk), List.Mem.head _, rfl⟩
      · rcases ih h' with h1 | ⟨q', hq', hq'p⟩
        · exact Or.inl h1
        · exact Or.inr ⟨q', List.Mem.tail _ hq', hq'p⟩

-- [helper]
theorem setEntries_sorted (g : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hs : SortedEntries es) : SortedEntries (setEntries g d es) := by
  induction es with
  | nil =>
    simp only [setEntries]
    by_cases hd : d = v1FullDock
    · simp [hd, SortedEntries]
    · simp [hd, SortedEntries]
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries]
    split_ifs with hlt hd hkg hd'
    · exact hs
    · refine ⟨fun p hp => ?_, hs⟩
      cases hp with | head => exact hlt | tail _ h' => exact mat5Lt_trans g k p.1 hlt (hs.1 p h')
    · exact hs.2
    · subst hkg; exact ⟨hs.1, hs.2⟩
    · have hklg : mat5Lt k g = true := by
        rcases mat5Lt_trichotomy g k with h1 | h2 | h3
        · exact absurd h1 hlt
        · exact absurd h2.symm hkg
        · exact h3
      refine ⟨fun p hp => ?_, ih hs.2⟩
      rcases mem_setEntries_keys g d rest p hp with hpg | ⟨q', hq', hq'p⟩
      · exact hpg ▸ hklg
      · exact hq'p ▸ hs.1 q' hq'

-- [helper]
theorem setEntries_nonEmpty (g : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hne : ∀ p, p ∈ es → p.2 ≠ v1FullDock) :
    ∀ p, p ∈ setEntries g d es → p.2 ≠ v1FullDock := by
  induction es with
  | nil =>
    intro p hp; simp only [setEntries] at hp
    split_ifs at hp with hd
    · cases hp
    · simp only [List.mem_singleton] at hp; rw [hp]; exact hd
  | cons q rest ih =>
    cases q with | mk k dk =>
    intro p hp; simp only [setEntries] at hp
    split_ifs at hp with hlt hd hkg hd'
    · exact hne p hp
    · rcases List.mem_cons.mp hp with rfl | h'; exact hd; exact hne p h'
    · exact hne p (List.Mem.tail _ hp)
    · rcases List.mem_cons.mp hp with rfl | h'; exact hd'; exact hne p (List.Mem.tail _ h')
    · rcases List.mem_cons.mp hp with rfl | h'
      · exact hne (k, dk) (List.Mem.head _)
      · exact ih (fun r hr => hne r (List.Mem.tail _ hr)) p h'

private theorem lookupEntries_setEntries (g h : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hs : SortedEntries es) :
    lookupEntries h (setEntries g d es) = if h = g then d else lookupEntries h es := by
  induction es with
  | nil =>
    simp only [setEntries]
    by_cases hd : d = v1FullDock <;> by_cases hhg : h = g
    · simp [hd, hhg, lookupEntries]
    · simp [hd, hhg, lookupEntries]
    · subst hhg; simp [hd, lookupEntries]
    · simp [hd, hhg, Ne.symm hhg, lookupEntries]
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries]
    by_cases hlt : mat5Lt g k = true
    · simp only [hlt, ↓reduceIte]
      by_cases hd : d = v1FullDock
      · simp only [hd, ↓reduceIte]
        by_cases hhg : h = g
        · subst hhg
          have hne : k ≠ h := fun e => by rw [e, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
          simp only [lookupEntries, ite_true, ite_eq_right hne]
          exact lookupEntries_not_lt h rest (fun p hp => mat5Lt_trans h k p.1 hlt (hs.1 p hp))
        · simp [hhg]
      · simp only [hd, ↓reduceIte, lookupEntries]
        by_cases hhg : h = g
        · subst hhg; simp
        · simp [hhg, Ne.symm hhg]
    · simp only [hlt, ↓reduceIte]
      by_cases hkg : k = g
      · subst hkg
        simp only [↓reduceIte]
        by_cases hd : d = v1FullDock
        · simp only [hd, ↓reduceIte]
          by_cases hhg : h = k
          · subst hhg; simp only [↓reduceIte]; exact lookupEntries_not_lt h rest hs.1
          · simp [hhg, Ne.symm hhg, lookupEntries]
        · simp only [hd, ↓reduceIte, lookupEntries]
          by_cases hhg : h = k
          · subst hhg; simp
          · simp [hhg, Ne.symm hhg]
      · simp only [hkg, ↓reduceIte, lookupEntries]
        by_cases hkh : k = h
        · subst hkh; simp [Ne.symm hkg]
        · simp only [hkh, ↓reduceIte]; exact ih hs.2

/-- Update dock `g` of `c` to `d` (deleting `g` if `d = v1FullDock`). -/
def HoneycombConfig.setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock) : HoneycombConfig :=
  ⟨setEntries g d c.entries, setEntries_sorted g d c.entries c.sorted,
   setEntries_nonEmpty g d c.entries c.nonEmpty⟩

-- [helper]
theorem lookup_setDock (c : HoneycombConfig) (g h : Mat5) (d : FullDock) :
    (c.setDock g d).lookup h = if h = g then d else c.lookup h :=
  lookupEntries_setEntries g h d c.entries c.sorted

-- [helper]
theorem setDock_lookup_self (c : HoneycombConfig) (g : Mat5) :
    c.setDock g (c.lookup g) = c := by
  apply honeycombConfig_ext; intro h; rw [lookup_setDock]; split_ifs with hhg <;> simp_all

-- [helper]
theorem setDock_setDock_same (c : HoneycombConfig) (g : Mat5) (d₁ d₂ : FullDock) :
    (c.setDock g d₁).setDock g d₂ = c.setDock g d₂ := by
  apply honeycombConfig_ext; intro h; simp only [lookup_setDock]; split_ifs <;> rfl

-- [helper]
theorem setDock_setDock_comm (c : HoneycombConfig) (g₁ g₂ : Mat5) (d₁ d₂ : FullDock)
    (hne : g₁ ≠ g₂) :
    (c.setDock g₁ d₁).setDock g₂ d₂ = (c.setDock g₂ d₂).setDock g₁ d₁ := by
  apply honeycombConfig_ext; intro h
  simp only [lookup_setDock]
  split_ifs <;> simp_all

private theorem sortedEntries_map_fst_eq (es₁ es₂ : List (Mat5 × FullDock))
    (hs₁ : SortedEntries es₁) (hs₂ : SortedEntries es₂)
    (hm : ∀ k : Mat5, k ∈ es₁.map Prod.fst ↔ k ∈ es₂.map Prod.fst) :
    es₁.map Prod.fst = es₂.map Prod.fst := by
  induction es₁ generalizing es₂ with
  | nil =>
    cases es₂ with | nil => rfl | cons p _ => cases (hm p.1).mpr (List.Mem.head _)
  | cons p₁ r₁ ih =>
    cases p₁ with | mk k₁ _ =>
    cases es₂ with
    | nil => cases (hm k₁).mp (List.Mem.head _)
    | cons p₂ r₂ =>
      cases p₂ with | mk k₂ _ =>
      simp only [List.map]
      have h12 : k₁ = k₂ := by
        cases (hm k₁).mp (List.Mem.head _) with
        | head => rfl
        | tail _ h1r =>
          obtain ⟨q2, hq2, hq2k⟩ := List.mem_map.mp h1r
          have hlt1 : mat5Lt k₂ k₁ = true := hq2k ▸ hs₂.1 q2 hq2
          cases (hm k₂).mpr (List.Mem.head _) with
          | head => rfl
          | tail _ h2r =>
            obtain ⟨q1, hq1, hq1k⟩ := List.mem_map.mp h2r
            have hlt2 : mat5Lt k₁ k₂ = true := hq1k ▸ hs₁.1 q1 hq1
            have hc := mat5Lt_trans k₁ k₂ k₁ hlt2 hlt1
            rw [mat5Lt_irrefl] at hc; exact Bool.noConfusion hc
      subst h12
      apply congrArg (List.cons k₁)
      apply ih r₂ hs₁.2 hs₂.2
      intro k
      constructor
      · intro hk
        have hne : k ≠ k₁ := fun heq => by
          obtain ⟨q1, hq1, hq1k⟩ := List.mem_map.mp hk
          have hlt := hs₁.1 q1 hq1; rw [hq1k, heq, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        cases (hm k).mp (List.Mem.tail _ hk) with | head => exact absurd rfl hne | tail _ h' => exact h'
      · intro hk
        have hne : k ≠ k₁ := fun heq => by
          obtain ⟨q2, hq2, hq2k⟩ := List.mem_map.mp hk
          have hlt := hs₂.1 q2 hq2; rw [hq2k, heq, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        cases (hm k).mpr (List.Mem.tail _ hk) with | head => exact absurd rfl hne | tail _ h' => exact h'

-- [helper]
theorem activeDocks_setDock_eq (c : HoneycombConfig) (g : Mat5) (d : FullDock)
    (hSame : d = v1FullDock ↔ c.lookup g = v1FullDock) :
    (c.setDock g d).activeDocks = c.activeDocks := by
  apply sortedEntries_map_fst_eq (c.setDock g d).entries c.entries (c.setDock g d).sorted c.sorted
  intro h
  change h ∈ (c.setDock g d).activeDocks ↔ h ∈ c.activeDocks
  rw [mem_activeDocks_iff, mem_activeDocks_iff, lookup_setDock]
  split_ifs with hhg
  · subst hhg; exact not_congr hSame
  · rfl

/-- Build a canonical `HoneycombConfig` from a finite candidate site list `cand` and dock assignment `f`. -/
def ofSites (cand : List Mat5) (f : Mat5 → FullDock) : HoneycombConfig :=
  cand.foldl (fun acc g => acc.setDock g (f g)) v1Config

private theorem lookup_ofSites_foldl (cand : List Mat5) (f : Mat5 → FullDock)
    (init : HoneycombConfig) (g : Mat5) :
    (cand.foldl (fun acc k => acc.setDock k (f k)) init).lookup g =
      if memBool g cand then f g else init.lookup g := by
  induction cand generalizing init with
  | nil => rfl
  | cons k rest ih =>
    simp only [List.foldl, ih, memBool]
    by_cases hkg : k = g
    · subst hkg
      cases hm : memBool k rest <;> simp [lookup_setDock]
    · cases hm : memBool g rest <;> simp [hkg, lookup_setDock, Ne.symm hkg]

-- [helper]
theorem lookup_ofSites (cand : List Mat5) (f : Mat5 → FullDock)
    (hvan : ∀ g : Mat5, g ∉ cand → f g = v1FullDock) (g : Mat5) :
    (ofSites cand f).lookup g = f g := by
  unfold ofSites
  rw [lookup_ofSites_foldl]
  cases hm : memBool g cand with
  | true => rfl
  | false =>
    change v1FullDock = f g
    exact (hvan g (fun hmem => by rw [(memBool_eq_true_iff g cand).mpr hmem] at hm; exact Bool.noConfusion hm)).symm

/-- Exact integer sum of `f` over a list `xs`. -/
def fockSumInt {α : Type} : List α → (α → Int) → Int
  | [], _ => 0
  | x :: xs, f => f x + fockSumInt xs f

-- [helper]
theorem fockSumInt_zero_of_all_zero {α : Type} (xs : List α) (f : α → Int)
    (h : ∀ x, x ∈ xs → f x = 0) : fockSumInt xs f = 0 := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [fockSumInt, h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]; omega

-- [helper]
theorem fockSumInt_congr {α : Type} (xs : List α) (f g : α → Int)
    (h : ∀ x, x ∈ xs → f x = g x) : fockSumInt xs f = fockSumInt xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [fockSumInt, h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]

private theorem fockSumInt_add {α : Type} (xs : List α) (f g : α → Int) :
    fockSumInt xs (fun x => f x + g x) = fockSumInt xs f + fockSumInt xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [fockSumInt, ih]; omega

private theorem fockSumInt_swap {α β : Type} (xs : List α) (ys : List β) (f : α → β → Int) :
    fockSumInt xs (fun x => fockSumInt ys (fun y => f x y)) =
      fockSumInt ys (fun y => fockSumInt xs (fun x => f x y)) := by
  induction xs with
  | nil => exact (fockSumInt_zero_of_all_zero ys (fun _ => 0) (fun _ _ => rfl)).symm
  | cons x rest ih => simp only [fockSumInt, ih, ← fockSumInt_add]

-- [helper]
theorem fockSumInt_map {α β : Type} (xs : List α) (g : α → β) (f : β → Int) :
    fockSumInt (xs.map g) f = fockSumInt xs (fun x => f (g x)) := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [List.map, fockSumInt, ih]

-- [helper]
theorem fockSumInt_eraseOne {α : Type} [DecidableEq α] (a : α) (xs : List α) (f : α → Int)
    (hmem : a ∈ xs) :
    fockSumInt xs f = f a + fockSumInt (eraseOne a xs) f := by
  induction xs with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, fockSumInt]
    split_ifs with hxa
    · subst hxa; rfl
    · cases hmem with
      | head => exact absurd rfl hxa
      | tail _ h' => simp only [fockSumInt, ih h']; omega

-- [helper]
theorem fockSumInt_subset_eq {α : Type} [DecidableEq α] (s₁ s₂ : List α) (f : α → Int)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hsub : ∀ x, x ∈ s₁ → x ∈ s₂) (hvan : ∀ x, x ∈ s₂ → x ∉ s₁ → f x = 0) :
    fockSumInt s₁ f = fockSumInt s₂ f := by
  induction h1 generalizing s₂ with
  | nil => exact (fockSumInt_zero_of_all_zero s₂ f (fun x hx => hvan x hx (fun hm => nomatch hm))).symm
  | @cons a rest hnot _ ih =>
    rw [fockSumInt_eraseOne a s₂ f (hsub a (List.Mem.head rest))]
    simp only [fockSumInt]
    rw [ih (eraseOne a s₂) (isNodup_eraseOne a h2)
      (fun x hx => (mem_eraseOne_iff a x h2).mpr ⟨hsub x (List.Mem.tail a hx), fun hxa => hnot (hxa ▸ hx)⟩)
      (fun x hx hxnot => by
        have ⟨hx2, hne⟩ := (mem_eraseOne_iff a x h2).mp hx
        exact hvan x hx2 (fun hm => match hm with | List.Mem.head _ => hne rfl | List.Mem.tail _ h' => hxnot h'))]

private theorem fockSumInt_support_indep {α : Type} [DecidableEq α] (s₁ s₂ : List α) (f : α → Int)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hv1 : ∀ x, x ∉ s₁ → f x = 0) (hv2 : ∀ x, x ∉ s₂ → f x = 0) :
    fockSumInt s₁ f = fockSumInt s₂ f := by
  let u := nodupUnion s₁ s₂
  have hu := isNodup_nodupUnion h1 s₂
  rw [fockSumInt_subset_eq s₁ u f h1 hu (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inl hx)) (fun x _ hx1 => hv1 x hx1),
      fockSumInt_subset_eq s₂ u f h2 hu (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inr hx)) (fun x _ hx2 => hv2 x hx2)]

-- [helper]
theorem fullDockCharge_eq_fockSumInt (d : FullDock) :
    fullDockCharge d = fockSumInt (List.finRange 24) (fun a => (d a).charge) := by
  unfold fullDockCharge
  have hAux : ∀ (xs : List (Fin 24)) (init : Int),
      xs.foldl (fun acc a => acc + (d a).charge) init = init + fockSumInt xs (fun a => (d a).charge) := by
    intro xs; induction xs with
    | nil => intro init; simp [fockSumInt]
    | cons x rest ih => intro init; simp only [List.foldl, fockSumInt, ih]; omega
  rw [hAux (List.finRange 24) 0]; omega

private theorem fullDockCharge_v1 : fullDockCharge v1FullDock = 0 := by decide

/-- Exact total integer charge `Q(c) = ∑_{g ∈ activeDocks c} fullDockCharge (c.lookup g)`. -/
def totalCharge (c : HoneycombConfig) : Int :=
  fockSumInt c.activeDocks (fun g => fullDockCharge (c.lookup g))

private theorem totalCharge_eq_over_superset (c : HoneycombConfig) (V : List Mat5)
    (hnd : IsNodup V) (hsub : ∀ g, g ∈ c.activeDocks → g ∈ V) :
    totalCharge c = fockSumInt V (fun g => fullDockCharge (c.lookup g)) := by
  unfold totalCharge
  refine fockSumInt_subset_eq c.activeDocks V (fun g => fullDockCharge (c.lookup g))
    (activeDocks_nodup c) hnd hsub (fun g _ hgNot => ?_)
  have hEmpty : c.lookup g = v1FullDock :=
    if h : c.lookup g = v1FullDock then h else absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  rw [hEmpty, fullDockCharge_v1]

-- [helper]
theorem totalCharge_setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock)
    (hSame : fullDockCharge d = fullDockCharge (c.lookup g)) :
    totalCharge (c.setDock g d) = totalCharge c := by
  let V := nodupUnion c.activeDocks (g :: (c.setDock g d).activeDocks)
  have hVnd : IsNodup V := isNodup_nodupUnion (activeDocks_nodup c) _
  rw [totalCharge_eq_over_superset (c.setDock g d) V hVnd
        (fun x hx => (mem_nodupUnion _ _ x).mpr (Or.inr (List.Mem.tail g hx))),
      totalCharge_eq_over_superset c V hVnd
        (fun x hx => (mem_nodupUnion _ _ x).mpr (Or.inl hx))]
  refine fockSumInt_congr V _ _ fun x _ => ?_
  rw [lookup_setDock]; split_ifs with hxg <;> simp_all

/-! ### Exact Global Configuration Maps (`S`, `S⁻¹`, `R`, `C`, `P`, `CP`) on Infinite `{3,4,3,4}` -/

-- [helper]
theorem transport_inv_left (a : Fin 24) :
    mat5Mul (transport (oppSlot a)) (transport a) = mat5Id := by
  have h := thm_coxeter_transport_antipodal_inverse.2 (oppSlot a)
  rw [(thm_24_facets_geometry.2.1 a).1] at h; exact h

-- [helper]
theorem transport_inv_right (a : Fin 24) :
    mat5Mul (transport a) (transport (oppSlot a)) = mat5Id :=
  thm_coxeter_transport_antipodal_inverse.2 a

/-- Exact 1-hop Coxeter stream `S` on infinite-honeycomb configurations:
    `(S c)(g, a) = c(g * k_{opp(a)}, a)` (matching `CoxeterTransport.honeycombStream`). -/
def streamConfig (c : HoneycombConfig) : HoneycombConfig :=
  let cand := flatMapList (fun g => (List.finRange 24).map (fun a => mat5Mul g (transport a))) c.activeDocks
  ofSites cand (fun g a => c.lookup (mat5Mul g (transport (oppSlot a))) a)

/-- Exact inverse 1-hop Coxeter stream `S⁻¹`: `(S⁻¹ c)(g, a) = c(g * k_a, a)`. -/
def streamConfigInv (c : HoneycombConfig) : HoneycombConfig :=
  let cand := flatMapList (fun g => (List.finRange 24).map (fun a => mat5Mul g (transport (oppSlot a)))) c.activeDocks
  ofSites cand (fun g a => c.lookup (mat5Mul g (transport a)) a)

/-- Exact antipodal slot reversal `R` on infinite-honeycomb configurations: `(R c)(g, a) = c(g, opp(a))`. -/
def revConfig (c : HoneycombConfig) : HoneycombConfig :=
  ofSites c.activeDocks (fun g => revFullDock (c.lookup g))

/-- Exact charge conjugation `C` on infinite-honeycomb configurations. -/
def conjConfig (c : HoneycombConfig) : HoneycombConfig :=
  ofSites c.activeDocks (fun g => conjFullDock (c.lookup g))

/-- Exact spatial parity `P` (`M_P = simpleRefl 0`) on infinite-honeycomb configurations. -/
def parityConfig (c : HoneycombConfig) : HoneycombConfig :=
  ofSites (c.activeDocks.map conjMatP) (fun g => parityFullDock (c.lookup (conjMatP g)))

/-- Combined `CP = C ∘ P` on infinite-honeycomb configurations. -/
def cpConfig (c : HoneycombConfig) : HoneycombConfig := conjConfig (parityConfig c)

-- [helper]
theorem mem_finRange24 (a : Fin 24) : a ∈ List.finRange 24 :=
  List.mem_finRange a

-- [helper]
theorem finRange24_nodup : IsNodup (List.finRange 24) :=
  isNodup_of_bool (List.finRange 24) (by decide)

-- [helper]
theorem exists_nonempty_of_ne_v1 (d : FullDock) (hne : d ≠ v1FullDock) :
    ∃ a : Fin 24, d a ≠ .empty := by
  by_contra h
  apply hne; funext a
  by_contra ha; exact h ⟨a, ha⟩

-- [helper]
theorem lookup_streamConfig (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (streamConfig c).lookup g a = c.lookup (mat5Mul g (transport (oppSlot a))) a := by
  unfold streamConfig
  have hvan : ∀ x : Mat5,
      x ∉ flatMapList (fun k => (List.finRange 24).map (fun b => mat5Mul k (transport b))) c.activeDocks →
      (fun b => c.lookup (mat5Mul x (transport (oppSlot b))) b) = v1FullDock := by
    intro x hx; funext b
    by_contra hb
    have hAct : mat5Mul x (transport (oppSlot b)) ∈ c.activeDocks :=
      (mem_activeDocks_iff c _).mpr (fun h0 => hb (congrFun h0 b))
    have hBack : mat5Mul (mat5Mul x (transport (oppSlot b))) (transport b) = x := by
      rw [fb_mat5Mul_assoc, transport_inv_left b, fb_mat5Mul_id_right]
    exact hx ((mem_flatMapList_iff _ _ x).mpr
      ⟨_, hAct, List.mem_map.mpr ⟨b, mem_finRange24 b, hBack⟩⟩)
  exact congrFun (lookup_ofSites _ _ hvan g) a

-- [helper]
theorem lookup_streamConfigInv (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (streamConfigInv c).lookup g a = c.lookup (mat5Mul g (transport a)) a := by
  unfold streamConfigInv
  have hvan : ∀ x : Mat5,
      x ∉ flatMapList (fun k => (List.finRange 24).map (fun b => mat5Mul k (transport (oppSlot b)))) c.activeDocks →
      (fun b => c.lookup (mat5Mul x (transport b)) b) = v1FullDock := by
    intro x hx; funext b
    by_contra hb
    have hAct : mat5Mul x (transport b) ∈ c.activeDocks :=
      (mem_activeDocks_iff c _).mpr (fun h0 => hb (congrFun h0 b))
    have hBack : mat5Mul (mat5Mul x (transport b)) (transport (oppSlot b)) = x := by
      rw [fb_mat5Mul_assoc, transport_inv_right b, fb_mat5Mul_id_right]
    exact hx ((mem_flatMapList_iff _ _ x).mpr
      ⟨_, hAct, List.mem_map.mpr ⟨b, mem_finRange24 b, hBack⟩⟩)
  exact congrFun (lookup_ofSites _ _ hvan g) a

-- [helper]
theorem lookup_revConfig (c : HoneycombConfig) (g : Mat5) :
    (revConfig c).lookup g = revFullDock (c.lookup g) := by
  unfold revConfig
  refine lookup_ofSites c.activeDocks (fun x => revFullDock (c.lookup x)) (fun x hx => ?_) g
  have h0 : c.lookup x = v1FullDock :=
    if h : c.lookup x = v1FullDock then h else absurd ((mem_activeDocks_iff c x).mpr h) hx
  rw [h0]; rfl

-- [helper]
theorem lookup_conjConfig (c : HoneycombConfig) (g : Mat5) :
    (conjConfig c).lookup g = conjFullDock (c.lookup g) := by
  unfold conjConfig
  refine lookup_ofSites c.activeDocks (fun x => conjFullDock (c.lookup x)) (fun x hx => ?_) g
  have h0 : c.lookup x = v1FullDock :=
    if h : c.lookup x = v1FullDock then h else absurd ((mem_activeDocks_iff c x).mpr h) hx
  rw [h0]; rfl

-- [helper]
theorem lookup_parityConfig (c : HoneycombConfig) (g : Mat5) :
    (parityConfig c).lookup g = parityFullDock (c.lookup (conjMatP g)) := by
  unfold parityConfig
  refine lookup_ofSites (c.activeDocks.map conjMatP) (fun x => parityFullDock (c.lookup (conjMatP x))) (fun x hx => ?_) g
  have h0 : c.lookup (conjMatP x) = v1FullDock :=
    if h : c.lookup (conjMatP x) = v1FullDock then h
    else absurd (List.mem_map.mpr ⟨conjMatP x, (mem_activeDocks_iff c _).mpr h, conjMatP_involutive x⟩) hx
  rw [h0]; rfl

-- [helper]
theorem lookup_cpConfig (c : HoneycombConfig) (g : Mat5) :
    (cpConfig c).lookup g = cpFullDock (c.lookup (conjMatP g)) := by
  unfold cpConfig cpFullDock; rw [lookup_conjConfig, lookup_parityConfig]

-- [helper]
theorem activeDocks_revConfig (c : HoneycombConfig) :
    (revConfig c).activeDocks = c.activeDocks := by
  apply sortedEntries_map_fst_eq (revConfig c).entries c.entries (revConfig c).sorted c.sorted
  intro g
  change g ∈ (revConfig c).activeDocks ↔ g ∈ c.activeDocks
  rw [mem_activeDocks_iff, mem_activeDocks_iff, lookup_revConfig]
  constructor
  · intro hne h0; exact hne (by rw [h0]; rfl)
  · intro hne h0; apply hne; funext a
    have := congrFun h0 (oppSlot a)
    unfold revFullDock at this
    rw [(thm_24_facets_geometry.2.1 a).1] at this; exact this

/-- Headline Theorem 7 (Exact Infinite-Honeycomb Configuration Symmetries, Stream Reversal & Charge):
    on canonical finite-excitation configurations over infinite `{3,4,3,4}`:
    `S` is bijective (`S⁻¹ ∘ S = S ∘ S⁻¹ = id`), `R² = I`, `S R S = R`, `C² = P² = CP² = I`,
    `CP ∘ S = S ∘ CP`, `CP ∘ R = R ∘ CP`, `S v1Config = v1Config`, `totalCharge v1Config = 0`,
    and `totalCharge (S c) = totalCharge c` for EVERY configuration `c`. -/
theorem thm_fock_honeycomb_config_symmetries (c : HoneycombConfig) :
    streamConfigInv (streamConfig c) = c ∧
    streamConfig (streamConfigInv c) = c ∧
    revConfig (revConfig c) = c ∧
    streamConfig (revConfig (streamConfig c)) = revConfig c ∧
    conjConfig (conjConfig c) = c ∧
    parityConfig (parityConfig c) = c ∧
    cpConfig (cpConfig c) = c ∧
    cpConfig (streamConfig c) = streamConfig (cpConfig c) ∧
    cpConfig (revConfig c) = revConfig (cpConfig c) ∧
    streamConfig v1Config = v1Config ∧
    totalCharge v1Config = 0 ∧
    totalCharge (streamConfig c) = totalCharge c := by
  have hS1 : streamConfigInv (streamConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_streamConfigInv, lookup_streamConfig, fb_mat5Mul_assoc, transport_inv_right a, fb_mat5Mul_id_right]
  have hS2 : streamConfig (streamConfigInv c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_streamConfig, lookup_streamConfigInv, fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
  have hR2 : revConfig (revConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_revConfig, lookup_revConfig]; unfold revFullDock
    rw [(thm_24_facets_geometry.2.1 a).1]
  have hSRS : streamConfig (revConfig (streamConfig c)) = revConfig c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_streamConfig, lookup_revConfig, lookup_revConfig]
    unfold revFullDock
    rw [lookup_streamConfig, (thm_24_facets_geometry.2.1 a).1, fb_mat5Mul_assoc,
        transport_inv_left a, fb_mat5Mul_id_right]
  have hC2 : conjConfig (conjConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_conjConfig, lookup_conjConfig]; exact slotState_dual_dual _
  have hP2 : parityConfig (parityConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_parityConfig, lookup_parityConfig]; unfold parityFullDock
    rw [conjMatP_involutive, (line_geom_facts.2.2.2.2.1 a).1]
  have hCP2 : cpConfig (cpConfig c) = c := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_cpConfig, lookup_cpConfig]; unfold cpFullDock conjFullDock parityFullDock
    dsimp only; rw [conjMatP_involutive, (line_geom_facts.2.2.2.2.1 a).1, slotState_dual_dual]
  have hCPS : cpConfig (streamConfig c) = streamConfig (cpConfig c) := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_cpConfig, lookup_streamConfig]
    unfold cpFullDock conjFullDock parityFullDock
    rw [lookup_streamConfig, lookup_cpConfig]
    unfold cpFullDock conjFullDock parityFullDock
    rw [conjMatP_mul, ← (line_geom_facts.2.2.2.2.1 a).2]
    have hT : conjMatP (transport (oppSlot a)) = transport (paritySlot (oppSlot a)) :=
      thm_fock_coxeter_parity_equivariance.2.2.2.1 (oppSlot a)
    rw [hT]
  have hCPR : cpConfig (revConfig c) = revConfig (cpConfig c) := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_cpConfig, lookup_revConfig]
    unfold cpFullDock conjFullDock parityFullDock revFullDock
    rw [lookup_revConfig, lookup_cpConfig]
    unfold cpFullDock conjFullDock parityFullDock revFullDock
    dsimp only; rw [(line_geom_facts.2.2.2.2.1 a).2]
  have hSv1 : streamConfig v1Config = v1Config := by
    apply honeycombConfig_ext; intro g; funext a; rw [lookup_streamConfig]; rfl
  have hQS : totalCharge (streamConfig c) = totalCharge c := by
    unfold totalCharge
    rw [fockSumInt_congr _ _ (fun g => fockSumInt (List.finRange 24) (fun a => ((streamConfig c).lookup g a).charge))
          (fun g _ => fullDockCharge_eq_fockSumInt _),
        fockSumInt_congr c.activeDocks _ (fun g => fockSumInt (List.finRange 24) (fun a => (c.lookup g a).charge))
          (fun g _ => fullDockCharge_eq_fockSumInt _),
        fockSumInt_swap (streamConfig c).activeDocks, fockSumInt_swap c.activeDocks]
    refine fockSumInt_congr _ _ _ fun a _ => ?_
    let shifted := c.activeDocks.map (fun g => mat5Mul g (transport a))
    have hShNd : IsNodup shifted :=
      isNodup_map_inj (fun g => mat5Mul g (transport a))
        (fun x y hxy => by
          have := congrArg (fun m => mat5Mul m (transport (oppSlot a))) hxy
          rw [fb_mat5Mul_assoc, fb_mat5Mul_assoc, transport_inv_right a, fb_mat5Mul_id_right, fb_mat5Mul_id_right] at this
          exact this)
        (activeDocks_nodup c)
    have hEqS : fockSumInt (streamConfig c).activeDocks (fun g => ((streamConfig c).lookup g a).charge) =
        fockSumInt shifted (fun g => ((streamConfig c).lookup g a).charge) := by
      refine fockSumInt_support_indep (streamConfig c).activeDocks shifted _ (activeDocks_nodup _) hShNd ?_ ?_
      · intro g hg
        have h0 : (streamConfig c).lookup g = v1FullDock :=
          if h : (streamConfig c).lookup g = v1FullDock then h else absurd ((mem_activeDocks_iff _ g).mpr h) hg
        rw [h0]; rfl
      · intro g hg
        rw [lookup_streamConfig]
        have h0 : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock := by
          if h : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock then exact h
          else
            have hBack : mat5Mul (mat5Mul g (transport (oppSlot a))) (transport a) = g := by
              rw [fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
            exact absurd (List.mem_map.mpr ⟨_, (mem_activeDocks_iff c _).mpr h, hBack⟩) hg
        rw [h0]; rfl
    rw [hEqS, fockSumInt_map]
    refine fockSumInt_congr _ _ _ fun g _ => ?_
    rw [lookup_streamConfig, fb_mat5Mul_assoc, transport_inv_right a, fb_mat5Mul_id_right]
  exact ⟨hS1, hS2, hR2, hSRS, hC2, hP2, hCP2, hCPS, hCPR, hSv1, rfl, hQS⟩

/-! ### Charge-Sector & Causal Ball / Light-Cone Predicates -/

/-- Exact total charge eigenspace `Q = q`: `ψ` has zero amplitude on every configuration with `totalCharge c ≠ q`. -/
def InChargeSector (q : Int) (ψ : FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ c : HoneycombConfig, totalCharge c ≠ q → ψ c = NinthLoc6.zero

/-- Exact `{3,4,3,4}` Coxeter graph ball `B_r` of radius `r` around the base cell `mat5Id`. -/
inductive InBall : Nat → Mat5 → Prop where
  | base : InBall 0 mat5Id
  | mono {r : Nat} {g : Mat5} : InBall r g → InBall (r + 1) g
  | step {r : Nat} {g : Mat5} (a : Fin 24) : InBall r g → InBall (r + 1) (mat5Mul g (transport a))

/-- Every occupied cell of configuration `c` lies inside the `{3,4,3,4}` ball `B_R`. -/
def ConfigInBall (R : Nat) (c : HoneycombConfig) : Prop :=
  ∀ g : Mat5, g ∈ c.activeDocks → InBall R g

/-- Quantum Fock-space causal support predicate: `ψ` has strictly zero amplitude on every configuration
    containing ANY excitation outside the `{3,4,3,4}` ball `B_R`. -/
def QuantumInBall (R : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ c : HoneycombConfig, ¬ ConfigInBall R c → ψ c = NinthLoc6.zero

end Vibe

end
