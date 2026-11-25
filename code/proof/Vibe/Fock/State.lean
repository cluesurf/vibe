import Vibe.Tone
import Vibe.Rule
import Vibe.CoxeterTransport
import Vibe.Fock.Ring

/-!
# Vibe Theory: Finite-Support Quantum Fock Space & Infinite `{3,4,3,4}` Configurations

Submodule 2 of 4 of `Vibe.FockBeat` (re-exported unchanged by `Vibe.FockBeat`):
- Finite-support quantum Fock space `FockVec R α` over any `StarCommRing R`, support-independent
  Hermitian inner product `innerOn` and norm `normSqOn`, `FockUnitary` composition & all-time
  iteration (`∀ t : Nat`), and universal unitary constructors (`permUnitary`, `phaseUnitary`,
  `block2Unitary`, `block12Unitary`),
- 24-slot line geometry, exact `{3,4,3,4}` Coxeter parity `M_P = simpleRefl 0`, canonical
  infinite-honeycomb configurations `HoneycombConfig`, vacuum `v1Config`, charge `totalCharge`,
  global configuration symmetries (`S`, `S⁻¹`, `R`, `C`, `P`, `CP`), and charge-sector / causal
  light-cone ball predicates (`InChargeSector`, `InBall`, `ConfigInBall`, `QuantumInBall`).
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 2: Finite-Support Quantum Fock Space & Universal Unitary Constructors -/

/-- Constructive duplicate-free list predicate (zero external `Init.Data.List.Pairwise` dependency). -/
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
  | nil =>
    simp only [memBool]
    exact ⟨fun h => Bool.noConfusion h, fun h => nomatch h⟩
  | cons x rest ih =>
    simp only [memBool]
    if hx : x = a then
      rw [ite_eq_left hx, hx]
      exact ⟨fun _ => List.Mem.head rest, fun _ => rfl⟩
    else
      rw [ite_eq_right hx]
      constructor
      · intro h
        exact List.Mem.tail x (ih.mp h)
      · intro h
        cases h with
        | head => exact absurd rfl hx
        | tail _ h' => exact ih.mpr h'

private def isNodupBool {α : Type} [DecidableEq α] : List α → Bool
  | [] => true
  | x :: xs => !(memBool x xs) && isNodupBool xs

private theorem isNodup_of_bool {α : Type} [DecidableEq α] (xs : List α)
    (h : isNodupBool xs = true) : IsNodup xs := by
  induction xs with
  | nil => exact IsNodup.nil
  | cons x rest ih =>
    simp only [isNodupBool, Bool.and_eq_true] at h
    refine IsNodup.cons ?_ (ih h.2)
    intro hmem
    have hm := (memBool_eq_true_iff x rest).mpr hmem
    have h1 := h.1
    rw [hm] at h1
    exact Bool.noConfusion h1

-- [helper]
theorem list_all_eq_true_iff {α : Type} (p : α → Bool) (xs : List α) :
    xs.all p = true ↔ ∀ x, x ∈ xs → p x = true := by
  induction xs with
  | nil =>
    simp only [List.all]
    exact ⟨fun _ _ h => (nomatch h), fun _ => trivial⟩
  | cons x rest ih =>
    simp only [List.all, Bool.and_eq_true]
    constructor
    · intro ⟨hpx, hrest⟩ y hy
      cases hy with
      | head => exact hpx
      | tail _ h' => exact ih.mp hrest y h'
    · intro hall
      exact ⟨hall x (List.Mem.head rest), ih.mpr (fun y hy => hall y (List.Mem.tail x hy))⟩

private theorem mem_filter_iff {α : Type} (p : α → Bool) (xs : List α) (a : α) :
    a ∈ xs.filter p ↔ a ∈ xs ∧ p a = true := by
  induction xs with
  | nil =>
    simp only [List.filter]
    exact ⟨fun h => (nomatch h), fun h => nomatch h.1⟩
  | cons x rest ih =>
    simp only [List.filter]
    cases hp : p x with
    | true =>
      constructor
      · intro h
        cases h with
        | head => exact ⟨List.Mem.head rest, hp⟩
        | tail _ h' => exact ⟨List.Mem.tail x (ih.mp h').1, (ih.mp h').2⟩
      · intro ⟨hmem, hpa⟩
        cases hmem with
        | head => exact List.Mem.head _
        | tail _ h' => exact List.Mem.tail x (ih.mpr ⟨h', hpa⟩)
    | false =>
      constructor
      · intro h
        exact ⟨List.Mem.tail x (ih.mp h).1, (ih.mp h).2⟩
      · intro ⟨hmem, hpa⟩
        cases hmem with
        | head => rw [hp] at hpa; exact Bool.noConfusion hpa
        | tail _ h' => exact ih.mpr ⟨h', hpa⟩

-- [helper]
theorem mem_map_iff {α β : Type} (f : α → β) (xs : List α) (b : β) :
    b ∈ xs.map f ↔ ∃ a : α, a ∈ xs ∧ f a = b := by
  induction xs with
  | nil =>
    simp only [List.map]
    exact ⟨fun h => (nomatch h), fun ⟨_, ha, _⟩ => nomatch ha⟩
  | cons x rest ih =>
    simp only [List.map]
    constructor
    · intro h
      cases h with
      | head => exact ⟨x, List.Mem.head rest, rfl⟩
      | tail _ h' =>
        obtain ⟨a, ha, hfa⟩ := ih.mp h'
        exact ⟨a, List.Mem.tail x ha, hfa⟩
    · intro ⟨a, ha, hfa⟩
      cases ha with
      | head => rw [hfa]; exact List.Mem.head _
      | tail _ h' => exact List.Mem.tail (f x) (ih.mpr ⟨a, h', hfa⟩)

private theorem isNodup_filter {α : Type} (p : α → Bool) {xs : List α} (h : IsNodup xs) :
    IsNodup (xs.filter p) := by
  induction h with
  | nil => exact IsNodup.nil
  | cons hnot _ ih =>
    simp only [List.filter]
    cases hp : p _ with
    | true =>
      exact IsNodup.cons (fun hm => hnot (mem_filter_iff p _ _ |>.mp hm).1) ih
    | false =>
      exact ih

-- [helper]
theorem isNodup_map_inj {α β : Type} (f : α → β)
    (hinj : ∀ x y : α, f x = f y → x = y) {xs : List α} (h : IsNodup xs) :
    IsNodup (xs.map f) := by
  induction h with
  | nil => exact IsNodup.nil
  | cons hnot _ ih =>
    simp only [List.map]
    refine IsNodup.cons ?_ ih
    intro hm
    obtain ⟨a, ha, hfa⟩ := (mem_map_iff f _ _).mp hm
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
  | nil =>
    simp only [eraseOne]
    exact ⟨fun h => (nomatch h), fun h => nomatch h.1⟩
  | @cons x rest hnot _ ih =>
    simp only [eraseOne]
    if hxa : x = a then
      rw [ite_eq_left hxa]
      constructor
      · intro hy
        refine ⟨List.Mem.tail x hy, ?_⟩
        intro hya
        rw [hya, ← hxa] at hy
        exact hnot hy
      · intro ⟨hmem, hne⟩
        cases hmem with
        | head => exact absurd hxa hne
        | tail _ h' => exact h'
    else
      rw [ite_eq_right hxa]
      constructor
      · intro h
        cases h with
        | head => exact ⟨List.Mem.head rest, hxa⟩
        | tail _ h' =>
          have ⟨hm, hne⟩ := ih.mp h'
          exact ⟨List.Mem.tail x hm, hne⟩
      · intro ⟨hmem, hne⟩
        cases hmem with
        | head => exact List.Mem.head _
        | tail _ h' => exact List.Mem.tail x (ih.mpr ⟨h', hne⟩)

-- [helper]
theorem isNodup_eraseOne {α : Type} [DecidableEq α] (a : α)
    {xs : List α} (hnd : IsNodup xs) : IsNodup (eraseOne a xs) := by
  induction hnd with
  | nil => exact IsNodup.nil
  | @cons x rest hnot hndRest ih =>
    simp only [eraseOne]
    if hxa : x = a then
      rw [ite_eq_left hxa]
      exact hndRest
    else
      rw [ite_eq_right hxa]
      refine IsNodup.cons ?_ ih
      intro hm
      exact hnot ((mem_eraseOne_iff a x hndRest).mp hm).1

/-- Duplicate-free union of two lists. -/
def nodupUnion {α : Type} [DecidableEq α] (xs : List α) : List α → List α
  | [] => xs
  | y :: ys =>
    let rest := nodupUnion xs ys
    if memBool y rest then rest else y :: rest

private theorem mem_nodupUnion {α : Type} [DecidableEq α] (xs ys : List α) (a : α) :
    a ∈ nodupUnion xs ys ↔ a ∈ xs ∨ a ∈ ys := by
  induction ys with
  | nil =>
    simp only [nodupUnion]
    exact ⟨Or.inl, fun h => match h with | Or.inl h1 => h1 | Or.inr h2 => nomatch h2⟩
  | cons y rest ih =>
    simp only [nodupUnion]
    cases hm : memBool y (nodupUnion xs rest) with
    | true =>
      rw [ite_eq_left rfl]
      constructor
      · intro ha
        rcases ih.mp ha with h1 | h2
        · exact Or.inl h1
        · exact Or.inr (List.Mem.tail y h2)
      · intro h
        rcases h with h1 | h2
        · exact ih.mpr (Or.inl h1)
        · cases h2 with
          | head => exact (memBool_eq_true_iff a _).mp hm
          | tail _ h' => exact ih.mpr (Or.inr h')
    | false =>
      rw [ite_eq_right (by decide : false ≠ true)]
      constructor
      · intro ha
        cases ha with
        | head => exact Or.inr (List.Mem.head rest)
        | tail _ h' =>
          rcases ih.mp h' with h1 | h2
          · exact Or.inl h1
          · exact Or.inr (List.Mem.tail y h2)
      · intro h
        rcases h with h1 | h2
        · exact List.Mem.tail y (ih.mpr (Or.inl h1))
        · cases h2 with
          | head => exact List.Mem.head _
          | tail _ h' => exact List.Mem.tail y (ih.mpr (Or.inr h'))

private theorem isNodup_nodupUnion {α : Type} [DecidableEq α] {xs : List α} (hxs : IsNodup xs)
    (ys : List α) : IsNodup (nodupUnion xs ys) := by
  induction ys with
  | nil => exact hxs
  | cons y rest ih =>
    simp only [nodupUnion]
    cases hm : memBool y (nodupUnion xs rest) with
    | true =>
      rw [ite_eq_left rfl]
      exact ih
    | false =>
      rw [ite_eq_right (by decide : false ≠ true)]
      refine IsNodup.cons ?_ ih
      intro hmem
      have ht := (memBool_eq_true_iff y _).mpr hmem
      rw [hm] at ht
      exact Bool.noConfusion ht

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
  unfold dedupList
  rw [mem_nodupUnion]
  exact ⟨fun h => match h with | Or.inl h1 => nomatch h1 | Or.inr h2 => h2, Or.inr⟩

/-- Constructive flatMap over lists. -/
def flatMapList {α β : Type} (f : α → List β) : List α → List β
  | [] => []
  | x :: xs => f x ++ flatMapList f xs

private theorem mem_append_iff {α : Type} (xs ys : List α) (a : α) :
    a ∈ xs ++ ys ↔ a ∈ xs ∨ a ∈ ys := by
  induction xs with
  | nil =>
    simp only [List.nil_append]
    exact ⟨Or.inr, fun h => match h with | Or.inl h1 => nomatch h1 | Or.inr h2 => h2⟩
  | cons x rest ih =>
    simp only [List.cons_append]
    constructor
    · intro h
      cases h with
      | head => exact Or.inl (List.Mem.head rest)
      | tail _ h' =>
        rcases ih.mp h' with h1 | h2
        · exact Or.inl (List.Mem.tail x h1)
        · exact Or.inr h2
    · intro h
      rcases h with h1 | h2
      · cases h1 with
        | head => exact List.Mem.head _
        | tail _ h' => exact List.Mem.tail x (ih.mpr (Or.inl h'))
      · exact List.Mem.tail x (ih.mpr (Or.inr h2))

-- [helper]
theorem mem_flatMapList_iff {α β : Type} (f : α → List β) (xs : List α) (b : β) :
    b ∈ flatMapList f xs ↔ ∃ a : α, a ∈ xs ∧ b ∈ f a := by
  induction xs with
  | nil =>
    simp only [flatMapList]
    exact ⟨fun h => (nomatch h), fun ⟨_, ha, _⟩ => nomatch ha⟩
  | cons x rest ih =>
    simp only [flatMapList]
    rw [mem_append_iff, ih]
    constructor
    · intro h
      rcases h with h1 | ⟨a, ha, hb⟩
      · exact ⟨x, List.Mem.head rest, h1⟩
      · exact ⟨a, List.Mem.tail x ha, hb⟩
    · intro ⟨a, ha, hb⟩
      cases ha with
      | head => exact Or.inl hb
      | tail _ h' => exact Or.inr ⟨a, h', hb⟩

/-- Quantum Fock-space wavefunction `ψ : α → R` assigning an exact amplitude in `R` to each basis configuration. -/
abbrev FockVec (R α : Type) := α → R

section FockSpace

variable {R α : Type} [StarCommRing R]

open StarCommRing

/-- Zero wavefunction. -/
def zeroVec : FockVec R α := fun _ => zero

/-- Pointwise superposition `|ψ⟩ + |φ⟩`. -/
def addVec (ψ φ : FockVec R α) : FockVec R α := fun c => add (ψ c) (φ c)

/-- Pointwise scalar multiplication `λ |ψ⟩`. -/
def scaleVec (lam : R) (ψ : FockVec R α) : FockVec R α := fun c => mul lam (ψ c)

/-- Antilinear complex conjugation `K_conj |ψ⟩` (`c ↦ conj (ψ c)`). -/
def conjVec (ψ : FockVec R α) : FockVec R α := fun c => conj (ψ c)

/-- Basis ket `|c₀⟩` with unit amplitude at `c₀` and `0` elsewhere. -/
def ket [DecidableEq α] (c₀ : α) : FockVec R α :=
  fun c => if c = c₀ then one else zero

/-- Exact finite sum `∑_{x ∈ xs} f x` in `R`. -/
def sumList : List α → (α → R) → R
  | [], _ => zero
  | x :: xs, f => add (f x) (sumList xs f)

/-- Exact Hermitian inner product `⟨ψ | φ⟩ = ∑_{c ∈ s} conj(ψ c) * φ c` evaluated over `s`. -/
def innerOn (s : List α) (ψ φ : FockVec R α) : R :=
  sumList s (fun c => mul (conj (ψ c)) (φ c))

/-- Exact squared norm `‖ψ‖² = ⟨ψ | ψ⟩` evaluated over `s`. -/
def normSqOn (s : List α) (ψ : FockVec R α) : R :=
  innerOn s ψ ψ

/-- Finite-support witness: `s` is duplicate-free and `ψ` vanishes outside `s`. -/
def SuppIn (s : List α) (ψ : FockVec R α) : Prop :=
  IsNodup s ∧ ∀ c : α, c ∉ s → ψ c = zero

private theorem star_conj_zero : conj (zero : R) = zero := by
  have h1 : add (conj (zero : R)) (conj (zero : R)) = conj (zero : R) := by
    rw [← conj_add, add_zero]
  have h2 : add (add (conj (zero : R)) (conj (zero : R))) (neg (conj (zero : R))) =
      add (conj (zero : R)) (neg (conj (zero : R))) := congrArg (fun z => add z (neg (conj (zero : R)))) h1
  rw [add_assoc, add_neg, add_zero] at h2
  exact h2

private theorem star_neg_mul (a b : R) : mul (neg a) b = neg (mul a b) := by
  have h1 : add (mul a b) (mul (neg a) b) = zero := by
    rw [← add_mul, add_neg, zero_mul]
  have h2 : add (neg (mul a b)) (add (mul a b) (mul (neg a) b)) = neg (mul a b) := by
    rw [h1, add_zero]
  rw [← add_assoc, add_comm (neg (mul a b)) (mul a b), add_neg, zero_add] at h2
  exact h2

private theorem star_mul_neg (a b : R) : mul a (neg b) = neg (mul a b) := by
  rw [mul_comm, star_neg_mul, mul_comm]

private theorem star_neg_neg (a : R) : neg (neg a) = a := by
  have h1 : add (neg a) (neg (neg a)) = zero := add_neg (neg a)
  have h2 : add a (add (neg a) (neg (neg a))) = add a zero := congrArg (add a) h1
  rw [← add_assoc, add_neg, zero_add, add_zero] at h2
  exact h2

private theorem star_conj_neg (a : R) : conj (neg a) = neg (conj a) := by
  have h1 : add (conj a) (conj (neg a)) = zero := by
    rw [← conj_add, add_neg, star_conj_zero]
  have h2 : add (neg (conj a)) (add (conj a) (conj (neg a))) = add (neg (conj a)) zero :=
    congrArg (add (neg (conj a))) h1
  rw [← add_assoc, add_comm (neg (conj a)) (conj a), add_neg, zero_add, add_zero] at h2
  exact h2

-- [helper]
theorem sumList_zero_of_all_zero (xs : List α) (f : α → R)
    (h : ∀ x : α, x ∈ xs → f x = zero) : sumList xs f = zero := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [sumList]
    rw [h x (List.Mem.head rest), zero_add]
    exact ih (fun y hy => h y (List.Mem.tail x hy))

private theorem sumList_congr (xs : List α) (f g : α → R)
    (h : ∀ x : α, x ∈ xs → f x = g x) : sumList xs f = sumList xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [sumList]
    rw [h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]

private theorem sumList_add (xs : List α) (f g : α → R) :
    sumList xs (fun x => add (f x) (g x)) = add (sumList xs f) (sumList xs g) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact (add_zero zero).symm
  | cons x rest ih =>
    simp only [sumList]
    rw [ih]
    rw [add_assoc (f x) (g x) (add (sumList rest f) (sumList rest g))]
    rw [← add_assoc (g x) (sumList rest f) (sumList rest g)]
    rw [add_comm (g x) (sumList rest f)]
    rw [add_assoc (sumList rest f) (g x) (sumList rest g)]
    rw [← add_assoc (f x) (sumList rest f) (add (g x) (sumList rest g))]

private theorem sumList_mul_left (xs : List α) (c : R) (f : α → R) :
    sumList xs (fun x => mul c (f x)) = mul c (sumList xs f) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact (mul_zero c).symm
  | cons x rest ih =>
    simp only [sumList]
    rw [ih, ← mul_add]

private theorem sumList_conj (xs : List α) (f : α → R) :
    conj (sumList xs f) = sumList xs (fun x => conj (f x)) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact star_conj_zero
  | cons x rest ih =>
    simp only [sumList]
    rw [conj_add, ih]

private theorem sumList_map {β : Type} (xs : List β) (g : β → α) (f : α → R) :
    sumList (xs.map g) f = sumList xs (fun x => f (g x)) := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [List.map, sumList]
    rw [ih]

private theorem sumList_filter_add (xs : List α) (p : α → Bool) (f : α → R) :
    sumList xs f = add (sumList (xs.filter p) f) (sumList (xs.filter (fun x => !p x)) f) := by
  induction xs with
  | nil =>
    simp only [List.filter, sumList]
    exact (add_zero zero).symm
  | cons x rest ih =>
    cases hp : p x with
    | true =>
      simp only [List.filter, hp, Bool.not_true, sumList]
      rw [ih, add_assoc]
    | false =>
      simp only [List.filter, hp, Bool.not_false, sumList]
      rw [ih, ← add_assoc, add_comm (f x) (sumList (rest.filter p) f), add_assoc]

private theorem sumList_eraseOne [DecidableEq α] (a : α) (xs : List α) (f : α → R)
    (hmem : a ∈ xs) :
    sumList xs f = add (f a) (sumList (eraseOne a xs) f) := by
  induction xs with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, sumList]
    if hxa : x = a then
      rw [ite_eq_left hxa, hxa]
    else
      rw [ite_eq_right hxa]
      simp only [sumList]
      cases hmem with
      | head => exact absurd rfl hxa
      | tail _ h' =>
        rw [ih h', ← add_assoc, add_comm (f x) (f a), add_assoc]

private theorem sumList_subset_eq [DecidableEq α] (s₁ s₂ : List α) (f : α → R)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hsub : ∀ x : α, x ∈ s₁ → x ∈ s₂)
    (hvan : ∀ x : α, x ∈ s₂ → x ∉ s₁ → f x = zero) :
    sumList s₁ f = sumList s₂ f := by
  induction h1 generalizing s₂ with
  | nil =>
    simp only [sumList]
    exact (sumList_zero_of_all_zero s₂ f (fun x hx => hvan x hx (fun hm => nomatch hm))).symm
  | @cons a rest hnot _ ih =>
    have ha2 : a ∈ s₂ := hsub a (List.Mem.head rest)
    rw [sumList_eraseOne a s₂ f ha2]
    simp only [sumList]
    apply congrArg (add (f a))
    apply ih (eraseOne a s₂) (isNodup_eraseOne a h2)
    · intro x hx
      refine (mem_eraseOne_iff a x h2).mpr ⟨hsub x (List.Mem.tail a hx), ?_⟩
      intro hxa
      rw [hxa] at hx
      exact hnot hx
    · intro x hx hxnot
      have ⟨hx2, hne⟩ := (mem_eraseOne_iff a x h2).mp hx
      refine hvan x hx2 ?_
      intro hmem
      cases hmem with
      | head => exact hne rfl
      | tail _ h' => exact hxnot h'

private theorem sumList_support_indep [DecidableEq α] (s₁ s₂ : List α) (f : α → R)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hv1 : ∀ x : α, x ∉ s₁ → f x = zero)
    (hv2 : ∀ x : α, x ∉ s₂ → f x = zero) :
    sumList s₁ f = sumList s₂ f := by
  let u := nodupUnion s₁ s₂
  have hu : IsNodup u := isNodup_nodupUnion h1 s₂
  have eq1 : sumList s₁ f = sumList u f :=
    sumList_subset_eq s₁ u f h1 hu
      (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inl hx))
      (fun x _ hx1 => hv1 x hx1)
  have eq2 : sumList s₂ f = sumList u f :=
    sumList_subset_eq s₂ u f h2 hu
      (fun x hx => (mem_nodupUnion s₁ s₂ x).mpr (Or.inr hx))
      (fun x _ hx2 => hv2 x hx2)
  rw [eq1, eq2]

private theorem sumList_bijection [DecidableEq α] (u : List α) (g gInv : α → α) (f : α → R)
    (hInv1 : ∀ x : α, gInv (g x) = x) (hInv2 : ∀ x : α, g (gInv x) = x)
    (hnd : IsNodup u) (hCl : ∀ x : α, x ∈ u → g x ∈ u) (hClInv : ∀ x : α, x ∈ u → gInv x ∈ u) :
    sumList u (fun x => f (g x)) = sumList u f := by
  rw [← sumList_map u g f]
  have hMapNd : IsNodup (u.map g) :=
    isNodup_map_inj g (fun x y h => by have := congrArg gInv h; rw [hInv1, hInv1] at this; exact this) hnd
  refine sumList_subset_eq (u.map g) u f hMapNd hnd ?_ ?_
  · intro x hx
    obtain ⟨y, hy, hgy⟩ := (mem_map_iff g u x).mp hx
    rw [← hgy]
    exact hCl y hy
  · intro x hx hxnot
    have hIn : x ∈ u.map g := (mem_map_iff g u x).mpr ⟨gInv x, hClInv x hx, hInv2 x⟩
    exact absurd hIn hxnot

/-- Headline Theorem 2 (Exact Support-Independence of Fock Inner Product & Norm):
    for ANY `StarCommRing R`, any discrete configuration space `α`, and any two duplicate-free
    covering supports `s₁, s₂`, the Hermitian inner product `innerOn s ψ φ` and squared norm
    `normSqOn s ψ` are canonically independent of the chosen support list. -/
theorem thm_fock_inner_support_indep [DecidableEq α]
    (s₁ s₂ : List α) (ψ φ : FockVec R α)
    (h1 : SuppIn s₁ ψ) (h2 : SuppIn s₂ ψ) :
    innerOn s₁ ψ φ = innerOn s₂ ψ φ ∧ normSqOn s₁ ψ = normSqOn s₂ ψ := by
  have hInner : ∀ χ : FockVec R α, innerOn s₁ ψ χ = innerOn s₂ ψ χ := by
    intro χ
    refine sumList_support_indep s₁ s₂ (fun c => mul (conj (ψ c)) (χ c)) h1.1 h2.1 ?_ ?_
    · intro c hc
      rw [h1.2 c hc, star_conj_zero, zero_mul]
    · intro c hc
      rw [h2.2 c hc, star_conj_zero, zero_mul]
  exact ⟨hInner φ, hInner ψ⟩

/-- Headline Theorem 3 (Sesquilinearity, Conjugate Symmetry & Basis Ket Orthonormality):
    the exact Fock inner product over any `StarCommRing R` is linear in the second slot,
    conjugate-linear in the first slot, Hermitian conjugate-symmetric, and orthonormal on basis kets. -/
theorem thm_fock_inner_sesquilinear [DecidableEq α]
    (s : List α) (ψ ψ₁ ψ₂ φ φ₁ φ₂ : FockVec R α) (lam : R)
    (a b : α) (hnd : IsNodup s) (ha : a ∈ s) :
    innerOn s ψ (addVec φ₁ φ₂) = add (innerOn s ψ φ₁) (innerOn s ψ φ₂) ∧
    innerOn s ψ (scaleVec lam φ) = mul lam (innerOn s ψ φ) ∧
    innerOn s (addVec ψ₁ ψ₂) φ = add (innerOn s ψ₁ φ) (innerOn s ψ₂ φ) ∧
    innerOn s (scaleVec lam ψ) φ = mul (conj lam) (innerOn s ψ φ) ∧
    conj (innerOn s ψ φ) = innerOn s φ ψ ∧
    innerOn s (ket (R := R) a) (ket (R := R) b) = if a = b then one else zero := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_⟩
  · unfold innerOn addVec
    have hFun : (fun c => mul (conj (ψ c)) (add (φ₁ c) (φ₂ c))) =
        (fun c => add (mul (conj (ψ c)) (φ₁ c)) (mul (conj (ψ c)) (φ₂ c))) := by
      funext c; exact mul_add _ _ _
    rw [hFun, sumList_add]
  · unfold innerOn scaleVec
    have hFun : (fun c => mul (conj (ψ c)) (mul lam (φ c))) =
        (fun c => mul lam (mul (conj (ψ c)) (φ c))) := by
      funext c; rw [← mul_assoc, mul_comm (conj (ψ c)) lam, mul_assoc]
    rw [hFun, sumList_mul_left]
  · unfold innerOn addVec
    have hFun : (fun c => mul (conj (add (ψ₁ c) (ψ₂ c))) (φ c)) =
        (fun c => add (mul (conj (ψ₁ c)) (φ c)) (mul (conj (ψ₂ c)) (φ c))) := by
      funext c; rw [conj_add, add_mul]
    rw [hFun, sumList_add]
  · unfold innerOn scaleVec
    have hFun : (fun c => mul (conj (mul lam (ψ c))) (φ c)) =
        (fun c => mul (conj lam) (mul (conj (ψ c)) (φ c))) := by
      funext c; rw [conj_mul, mul_assoc]
    rw [hFun, sumList_mul_left]
  · unfold innerOn
    rw [sumList_conj]
    apply sumList_congr
    intro c _
    rw [conj_mul, conj_conj, mul_comm]
  · unfold innerOn ket
    rw [sumList_eraseOne a s _ ha]
    have hRest : sumList (eraseOne a s)
        (fun c => mul (conj (if c = a then (one : R) else zero)) (if c = b then one else zero)) = zero := by
      apply sumList_zero_of_all_zero
      intro c hc
      have hne := ((mem_eraseOne_iff a c hnd).mp hc).2
      rw [ite_eq_right hne, star_conj_zero, zero_mul]
    rw [hRest, add_zero, ite_eq_left rfl, conj_one, one_mul]

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
    unfold permOp
    apply hs.2
    intro hmem
    exact hc ((mem_map_iff π s c).mpr ⟨πInv c, hmem, h2 c⟩)
  preservesDagSupp := fun ψ s hs => by
    refine ⟨s.map πInv, isNodup_map_inj πInv (fun x y hxy => by
      have := congrArg π hxy; rw [h2, h2] at this; exact this) hs.1, ?_⟩
    intro c hc
    unfold permOp
    apply hs.2
    intro hmem
    exact hc ((mem_map_iff πInv s c).mpr ⟨π c, hmem, h1 c⟩)
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    have hMapSupp : SuppIn (s.map π) (permOp πInv ψ) := by
      refine ⟨isNodup_map_inj π (fun x y hxy => by
        have := congrArg πInv hxy; rw [h1, h1] at this; exact this) hsψ.1, ?_⟩
      intro c hc
      unfold permOp
      apply hsψ.2
      intro hmem
      exact hc ((mem_map_iff π s c).mpr ⟨πInv c, hmem, h2 c⟩)
    rw [(thm_fock_inner_support_indep s' (s.map π) (permOp πInv ψ) (permOp πInv φ) hs'ψ hMapSupp).1]
    unfold innerOn permOp
    rw [sumList_map]
    apply sumList_congr
    intro c _
    rw [h1]

/-- Diagonal phase operator `phaseOp phase ψ c = phase c * ψ c`. -/
def phaseOp (phase : α → R) (ψ : FockVec R α) : FockVec R α :=
  fun c => mul (phase c) (ψ c)

/-- Exact Fock unitarity of ANY unit-modulus diagonal phase `∀ c, conj(phase c) * phase c = 1`. -/
def phaseUnitary [DecidableEq α] (phase : α → R)
    (hUnit : ∀ c : α, mul (conj (phase c)) (phase c) = one) : FockUnitary R α where
  op := phaseOp phase
  dag := phaseOp (fun c => conj (phase c))
  leftInv := fun ψ => by
    funext c; unfold phaseOp
    rw [← mul_assoc, hUnit c, one_mul]
  rightInv := fun ψ => by
    funext c; unfold phaseOp
    rw [← mul_assoc, mul_comm (phase c) (conj (phase c)), hUnit c, one_mul]
  preservesSupp := fun ψ s hs => ⟨s, hs.1, fun c hc => by unfold phaseOp; rw [hs.2 c hc, mul_zero]⟩
  preservesDagSupp := fun ψ s hs => ⟨s, hs.1, fun c hc => by unfold phaseOp; rw [hs.2 c hc, mul_zero]⟩
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    have hS : SuppIn s (phaseOp phase ψ) :=
      ⟨hsψ.1, fun c hc => by unfold phaseOp; rw [hsψ.2 c hc, mul_zero]⟩
    rw [(thm_fock_inner_support_indep s' s (phaseOp phase ψ) (phaseOp phase φ) hs'ψ hS).1]
    unfold innerOn phaseOp
    apply sumList_congr
    intro c _
    rw [conj_mul, mul_assoc (conj (phase c)) (conj (ψ c)),
        ← mul_assoc (conj (ψ c)) (phase c) (φ c),
        mul_comm (conj (ψ c)) (phase c),
        mul_assoc (phase c) (conj (ψ c)) (φ c),
        ← mul_assoc (conj (phase c)) (phase c),
        hUnit c, one_mul]

/-- Symmetric involutive `2 × 2` block operator (instantiates half-coin `D` and role-meet `M_meet`). -/
def block2Op (flip : α → α) (act : α → Bool) (a b : R) (ψ : FockVec R α) : FockVec R α :=
  fun c => if act c then add (mul a (ψ c)) (mul b (ψ (flip c))) else ψ c

private theorem block2_expand (a b u v x y : R) :
    mul (conj (add (mul a u) (mul b v))) (add (mul a x) (mul b y)) =
      add (add (mul (mul (conj a) a) (mul (conj u) x))
               (mul (mul (conj b) b) (mul (conj v) y)))
          (add (mul (mul (conj a) b) (mul (conj u) y))
               (mul (mul (conj b) a) (mul (conj v) x))) := by
  rw [conj_add, conj_mul, conj_mul, add_mul, mul_add, mul_add]
  have rearrange : ∀ p q r s : R,
      mul (mul p q) (mul r s) = mul (mul p r) (mul q s) := by
    intro p q r s
    rw [mul_assoc p q (mul r s), ← mul_assoc q r s, mul_comm q r,
        mul_assoc r q s, ← mul_assoc p r (mul q s)]
  rw [rearrange (conj a) (conj u) a x,
      rearrange (conj a) (conj u) b y,
      rearrange (conj b) (conj v) a x,
      rearrange (conj b) (conj v) b y]
  have swap4 : ∀ p q r s : R,
      add (add p q) (add r s) = add (add p s) (add q r) := by
    intro p q r s
    rw [add_assoc p q (add r s), add_comm r s, ← add_assoc q s r, add_comm q s,
        add_assoc s q r, ← add_assoc p s (add q r)]
  exact swap4 _ _ _ _

/-- Exact Fock unitarity of ANY involutive `2 × 2` symmetric block operator. -/
def block2Unitary [DecidableEq α] (flip : α → α) (act : α → Bool) (a b : R)
    (hFlip : ∀ c : α, flip (flip c) = c)
    (hAct : ∀ c : α, act (flip c) = act c)
    (hDiag : add (mul (conj a) a) (mul (conj b) b) = one)
    (hOff : add (mul (conj a) b) (mul (conj b) a) = zero) : FockUnitary R α where
  op := block2Op flip act a b
  dag := block2Op flip act (conj a) (conj b)
  leftInv := fun ψ => by
    funext c; unfold block2Op
    cases ha : act c with
    | false =>
      simp only [ite_bool_false]
    | true =>
      have hfa : act (flip c) = true := by rw [hAct c, ha]
      simp only [ite_true, hfa, hFlip c]
      rw [mul_add, mul_add, ← mul_assoc, ← mul_assoc, ← mul_assoc, ← mul_assoc]
      have swap4 : ∀ p q r s : R, add (add p q) (add r s) = add (add p s) (add q r) := by
        intro p q r s
        rw [add_assoc p q (add r s), add_comm r s, ← add_assoc q s r, add_comm q s,
            add_assoc s q r, ← add_assoc p s (add q r)]
      rw [swap4, ← add_mul, ← add_mul, hDiag, hOff, one_mul, zero_mul, add_zero]
  rightInv := fun ψ => by
    funext c; unfold block2Op
    cases ha : act c with
    | false =>
      simp only [ite_bool_false]
    | true =>
      have hfa : act (flip c) = true := by rw [hAct c, ha]
      simp only [ite_true, hfa, hFlip c]
      rw [mul_add, mul_add, ← mul_assoc, ← mul_assoc, ← mul_assoc, ← mul_assoc]
      have hDiag' : add (mul a (conj a)) (mul b (conj b)) = one := by
        rw [mul_comm a (conj a), mul_comm b (conj b), hDiag]
      have hOff' : add (mul a (conj b)) (mul b (conj a)) = zero := by
        rw [mul_comm a (conj b), mul_comm b (conj a), add_comm, hOff]
      have swap4 : ∀ p q r s : R, add (add p q) (add r s) = add (add p s) (add q r) := by
        intro p q r s
        rw [add_assoc p q (add r s), add_comm r s, ← add_assoc q s r, add_comm q s,
            add_assoc s q r, ← add_assoc p s (add q r)]
      rw [swap4, ← add_mul, ← add_mul, hDiag', hOff', one_mul, zero_mul, add_zero]
  preservesSupp := fun ψ s hs => by
    let u := nodupUnion s (s.map flip)
    refine ⟨u, isNodup_nodupUnion hs.1 (s.map flip), ?_⟩
    intro c hc
    have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
    have hc2 : flip c ∉ s := fun h =>
      hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr ((mem_map_iff flip s c).mpr ⟨flip c, h, hFlip c⟩)))
    unfold block2Op
    rw [hs.2 c hc1, hs.2 (flip c) hc2, mul_zero, mul_zero, add_zero]
    cases act c <;> rfl
  preservesDagSupp := fun ψ s hs => by
    let u := nodupUnion s (s.map flip)
    refine ⟨u, isNodup_nodupUnion hs.1 (s.map flip), ?_⟩
    intro c hc
    have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
    have hc2 : flip c ∉ s := fun h =>
      hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr ((mem_map_iff flip s c).mpr ⟨flip c, h, hFlip c⟩)))
    unfold block2Op
    rw [hs.2 c hc1, hs.2 (flip c) hc2, mul_zero, mul_zero, add_zero]
    cases act c <;> rfl
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    let u := nodupUnion s (s.map flip)
    have huNd : IsNodup u := isNodup_nodupUnion hsψ.1 (s.map flip)
    have huClosed : ∀ c : α, c ∈ u → flip c ∈ u := by
      intro c hc
      rcases (mem_nodupUnion s (s.map flip) c).mp hc with h1 | h2
      · exact (mem_nodupUnion s (s.map flip) (flip c)).mpr (Or.inr ((mem_map_iff flip s (flip c)).mpr ⟨c, h1, rfl⟩))
      · obtain ⟨x, hx, hfx⟩ := (mem_map_iff flip s c).mp h2
        rw [← hfx, hFlip x]
        exact (mem_nodupUnion s (s.map flip) x).mpr (Or.inl hx)
    have huψ : SuppIn u ψ :=
      ⟨huNd, fun c hc => hsψ.2 c (fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h)))⟩
    have huOpψ : SuppIn u (block2Op flip act a b ψ) := by
      refine ⟨huNd, fun c hc => ?_⟩
      have hc1 : c ∉ s := fun h => hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inl h))
      have hc2 : flip c ∉ s := fun h =>
        hc ((mem_nodupUnion s (s.map flip) c).mpr (Or.inr ((mem_map_iff flip s c).mpr ⟨flip c, h, hFlip c⟩)))
      unfold block2Op
      rw [hsψ.2 c hc1, hsψ.2 (flip c) hc2, mul_zero, mul_zero, add_zero]
      cases act c <;> rfl
    rw [(thm_fock_inner_support_indep s' u (block2Op flip act a b ψ) (block2Op flip act a b φ) hs'ψ huOpψ).1]
    rw [← (thm_fock_inner_support_indep u s ψ φ huψ hsψ).1]
    unfold innerOn
    rw [sumList_filter_add u act, sumList_filter_add u act (fun c => mul (conj (ψ c)) (φ c))]
    refine congr (congrArg add ?_) ?_
    · let ua := u.filter act
      have huaNd : IsNodup ua := isNodup_filter act huNd
      have huaClosed : ∀ c : α, c ∈ ua → flip c ∈ ua := by
        intro c hc
        have ⟨hcu, hca⟩ := (mem_filter_iff act u c).mp hc
        exact (mem_filter_iff act u (flip c)).mpr ⟨huClosed c hcu, by rw [hAct c, hca]⟩
      have hStep : sumList ua (fun c => mul (conj (block2Op flip act a b ψ c)) (block2Op flip act a b φ c)) =
          sumList ua (fun c =>
            add (add (mul (mul (conj a) a) (mul (conj (ψ c)) (φ c)))
                     (mul (mul (conj b) b) (mul (conj (ψ (flip c))) (φ (flip c)))))
                (add (mul (mul (conj a) b) (mul (conj (ψ c)) (φ (flip c))))
                     (mul (mul (conj b) a) (mul (conj (ψ (flip c))) (φ c))))) := by
        apply sumList_congr
        intro c hc
        have hca : act c = true := ((mem_filter_iff act u c).mp hc).2
        unfold block2Op
        simp only [ite_eq_left hca]
        exact block2_expand a b (ψ c) (ψ (flip c)) (φ c) (φ (flip c))
      rw [hStep, sumList_add, sumList_add, sumList_add,
          sumList_mul_left, sumList_mul_left, sumList_mul_left, sumList_mul_left]
      have hB1 : sumList ua (fun c => mul (conj (ψ (flip c))) (φ (flip c))) =
          sumList ua (fun c => mul (conj (ψ c)) (φ c)) :=
        sumList_bijection ua flip flip (fun c => mul (conj (ψ c)) (φ c)) hFlip hFlip huaNd huaClosed huaClosed
      have hB2 : sumList ua (fun c => mul (conj (ψ (flip c))) (φ c)) =
          sumList ua (fun c => mul (conj (ψ c)) (φ (flip c))) := by
        have hEq : (fun c => mul (conj (ψ (flip c))) (φ c)) =
            (fun c => (fun x => mul (conj (ψ x)) (φ (flip x))) (flip c)) := by
          funext c; dsimp only; rw [hFlip c]
        rw [hEq]
        exact sumList_bijection ua flip flip (fun x => mul (conj (ψ x)) (φ (flip x))) hFlip hFlip huaNd huaClosed huaClosed
      rw [hB1, hB2, ← add_mul, ← add_mul, hDiag, hOff, one_mul, zero_mul, add_zero]
    · apply sumList_congr
      intro c hc
      have hcf : act c = false := by
        have hnot := ((mem_filter_iff (fun x => !act x) u c).mp hc).2
        cases ha : act c with
        | false => rfl
        | true => rw [ha] at hnot; exact Bool.noConfusion hnot
      unfold block2Op
      simp only [hcf, ite_bool_false]

/-- Flat 12-term sum over `Fin 12` in any `StarCommRing R`. -/
def sumFin12 (f : Fin 12 → R) : R :=
  sumList (List.finRange 12) f

private theorem sumList_const (xs : List α) (c : R) :
    sumList xs (fun _ => c) = mul (ofNatR xs.length) c := by
  induction xs with
  | nil => simp only [sumList, List.length_nil, ofNatR, zero_mul]
  | cons _ rest ih =>
    simp only [sumList, List.length_cons, ofNatR]
    rw [ih, add_mul, one_mul, add_comm]

private theorem sumFin12_const (c : R) : sumFin12 (fun _ => c) = mul (ofNatR 12) c := by
  unfold sumFin12
  rw [sumList_const]
  have hLen : (List.finRange 12).length = 12 := by decide
  rw [hLen]

-- [helper]
theorem sumFin12_congr (f g : Fin 12 → R) (h : ∀ m : Fin 12, f m = g m) :
    sumFin12 f = sumFin12 g :=
  sumList_congr (List.finRange 12) f g (fun m _ => h m)

-- [helper]
theorem sumFin12_add (f g : Fin 12 → R) :
    sumFin12 (fun m => add (f m) (g m)) = add (sumFin12 f) (sumFin12 g) :=
  sumList_add (List.finRange 12) f g

-- [helper]
theorem sumFin12_mul_left (c : R) (f : Fin 12 → R) :
    sumFin12 (fun m => mul c (f m)) = mul c (sumFin12 f) :=
  sumList_mul_left (List.finRange 12) c f

-- [helper]
theorem sumFin12_conj (f : Fin 12 → R) :
    conj (sumFin12 f) = sumFin12 (fun m => conj (f m)) :=
  sumList_conj (List.finRange 12) f

private theorem sumList_sumFin12_comm (xs : List α) (f : α → Fin 12 → R) :
    sumList xs (fun c => sumFin12 (f c)) = sumFin12 (fun m => sumList xs (fun c => f c m)) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact (sumList_zero_of_all_zero (List.finRange 12) (fun _ => zero) (fun _ _ => rfl)).symm
  | cons x rest ih =>
    simp only [sumList]
    rw [ih, ← sumFin12_add]

-- [helper]
theorem sumFin12_swap (f : Fin 12 → Fin 12 → R) :
    sumFin12 (fun m₁ => sumFin12 (fun m₂ => f m₁ m₂)) =
      sumFin12 (fun m₂ => sumFin12 (fun m₁ => f m₁ m₂)) :=
  sumList_sumFin12_comm (List.finRange 12) f

-- [helper]
theorem finRange12_nodup : IsNodup (List.finRange 12) :=
  isNodup_of_bool (List.finRange 12) (by decide)

-- [helper]
theorem mem_finRange12 (m : Fin 12) : m ∈ List.finRange 12 := by
  have h12 : List.finRange 12 =
      [⟨0, by decide⟩, ⟨1, by decide⟩, ⟨2, by decide⟩, ⟨3, by decide⟩,
       ⟨4, by decide⟩, ⟨5, by decide⟩, ⟨6, by decide⟩, ⟨7, by decide⟩,
       ⟨8, by decide⟩, ⟨9, by decide⟩, ⟨10, by decide⟩, ⟨11, by decide⟩] := by decide
  rw [h12]
  match m with
  | ⟨0, _⟩ => exact List.Mem.head _
  | ⟨1, _⟩ => exact List.Mem.tail _ (List.Mem.head _)
  | ⟨2, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))
  | ⟨3, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))
  | ⟨4, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))))
  | ⟨5, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))))
  | ⟨6, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))))))
  | ⟨7, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))))))
  | ⟨8, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))))))))
  | ⟨9, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))))))))
  | ⟨10, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _))))))))))
  | ⟨11, _⟩ => exact List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.tail _ (List.Mem.head _)))))))))))

-- [helper]
theorem sumFin12_bijection (g gInv : Fin 12 → Fin 12) (f : Fin 12 → R)
    (h1 : ∀ m, gInv (g m) = m) (h2 : ∀ m, g (gInv m) = m) :
    sumFin12 (fun m => f (g m)) = sumFin12 f :=
  sumList_bijection (List.finRange 12) g gInv f h1 h2 finRange12_nodup
    (fun m _ => mem_finRange12 (g m)) (fun m _ => mem_finRange12 (gInv m))

private def addMod12 (a b : Fin 12) : Fin 12 :=
  ⟨(a.val + b.val) % 12, Nat.mod_lt _ (by decide)⟩

private def subMod12 (a b : Fin 12) : Fin 12 :=
  ⟨(a.val + (12 - b.val)) % 12, Nat.mod_lt _ (by decide)⟩

private theorem addMod12_subMod12 : ∀ a b : Fin 12, subMod12 (addMod12 a b) b = a := by decide
private theorem subMod12_addMod12 : ∀ a b : Fin 12, addMod12 (subMod12 a b) b = a := by decide

/-- 12-state isotropic orbit-mixing operator `I + ((u - 1) / 12) J` (instantiates `M_pair(ζ_18)`). -/
def block12Op (act : α → Bool) (moveTo : Fin 12 → α → α) (u inv12 : R)
    (ψ : FockVec R α) : FockVec R α :=
  fun c =>
    if act c then
      add (ψ c) (mul (mul (sub u one) inv12) (sumFin12 (fun m => ψ (moveTo m c))))
    else ψ c

private theorem block12_comp
    (act : α → Bool) (moveTo : Fin 12 → α → α) (inv12 v₁ v₂ : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (h12 : mul (ofNatR 12) inv12 = one)
    (ψ : FockVec R α) (c : α) :
    block12Op act moveTo v₂ inv12 (block12Op act moveTo v₁ inv12 ψ) c =
      block12Op act moveTo (mul v₂ v₁) inv12 ψ c := by
  unfold block12Op
  cases ha : act c with
  | false => rw [ite_bool_false, ite_bool_false, ite_bool_false]
  | true =>
    rw [ite_bool_true, ite_bool_true]
    have hS1 : sumFin12 (fun m =>
          if act (moveTo m c) then
            add (ψ (moveTo m c)) (mul (mul (sub v₁ one) inv12) (sumFin12 (fun m' => ψ (moveTo m' (moveTo m c)))))
          else ψ (moveTo m c)) =
        mul v₁ (sumFin12 (fun m => ψ (moveTo m c))) := by
      have hEq : (fun m =>
          if act (moveTo m c) then
            add (ψ (moveTo m c)) (mul (mul (sub v₁ one) inv12) (sumFin12 (fun m' => ψ (moveTo m' (moveTo m c)))))
          else ψ (moveTo m c)) =
        (fun m => add (ψ (moveTo m c)) (mul (mul (sub v₁ one) inv12) (sumFin12 (fun m' => ψ (moveTo m' c))))) := by
        funext m
        rw [ite_eq_left (hActMove m c ha)]
        apply congrArg (add (ψ (moveTo m c)))
        apply congrArg (mul (mul (sub v₁ one) inv12))
        apply sumFin12_congr
        intro m'
        rw [hMoveMove m' m c ha]
      rw [hEq, sumFin12_add, sumFin12_const]
      let S := sumFin12 (fun m => ψ (moveTo m c))
      have h12c : mul (ofNatR 12) (mul (mul (sub v₁ one) inv12) S) = mul (sub v₁ one) S := by
        rw [← mul_assoc (ofNatR 12), ← mul_assoc (ofNatR 12),
            mul_comm (ofNatR 12) (sub v₁ one), mul_assoc (sub v₁ one), h12, mul_one]
      rw [h12c]
      calc add S (mul (sub v₁ one) S)
          = add (mul one S) (mul (sub v₁ one) S) := by rw [one_mul]
        _ = mul (add one (sub v₁ one)) S := by rw [← add_mul]
        _ = mul v₁ S := by rw [add_sub_cancel]
    rw [hS1, add_assoc]
    apply congrArg (add (ψ c))
    let S := sumFin12 (fun m => ψ (moveTo m c))
    have hCoef : add (mul (mul (sub v₁ one) inv12) S) (mul (mul (sub v₂ one) inv12) (mul v₁ S)) =
        mul (mul (sub (mul v₂ v₁) one) inv12) S := by
      rw [← mul_assoc (mul (sub v₂ one) inv12) v₁ S, ← add_mul]
      apply congrArg (fun z => mul z S)
      rw [mul_assoc (sub v₂ one) inv12 v₁, mul_comm inv12 v₁, ← mul_assoc (sub v₂ one) v₁ inv12,
          ← add_mul, unit_compose_identity]
    exact hCoef

private theorem block12_one (act : α → Bool) (moveTo : Fin 12 → α → α) (inv12 : R)
    (ψ : FockVec R α) : block12Op act moveTo one inv12 ψ = ψ := by
  funext c; unfold block12Op
  rw [sub_self, zero_mul, zero_mul, add_zero]
  cases act c <;> rfl

private theorem block12_expand_supp [DecidableEq α]
    (act : α → Bool) (curLine : α → Fin 12) (moveTo : Fin 12 → α → α) (inv12 v : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (hMoveCur : ∀ (c : α), act c = true → moveTo (curLine c) c = c)
    (ψ : FockVec R α) (s : List α) (hs : SuppIn s ψ) :
    ∃ s' : List α, SuppIn s' (block12Op act moveTo v inv12 ψ) := by
  let uL := dedupList (s ++ flatMapList (fun c => (List.finRange 12).map (fun m => if act c then moveTo m c else c)) s)
  refine ⟨uL, isNodup_dedupList _, ?_⟩
  intro c hc
  have hcNotS : c ∉ s := fun h =>
    hc ((mem_dedupList _ c).mpr ((mem_append_iff _ _ c).mpr (Or.inl h)))
  unfold block12Op
  cases ha : act c with
  | false => rw [ite_bool_false]; exact hs.2 c hcNotS
  | true =>
    rw [ite_bool_true, hs.2 c hcNotS, zero_add]
    have hS0 : sumFin12 (fun m => ψ (moveTo m c)) = zero := by
      apply sumList_zero_of_all_zero
      intro m _
      apply hs.2
      intro hmS
      have hMoveBack : moveTo (curLine c) (moveTo m c) = c := by
        rw [hMoveMove _ _ c ha, hMoveCur c ha]
      have hInFM : c ∈ flatMapList (fun x => (List.finRange 12).map (fun k => if act x then moveTo k x else x)) s := by
        refine (mem_flatMapList_iff _ s c).mpr ⟨moveTo m c, hmS, ?_⟩
        refine (mem_map_iff _ (List.finRange 12) c).mpr ⟨curLine c, mem_finRange12 (curLine c), ?_⟩
        rw [ite_eq_left (hActMove m c ha), hMoveBack]
      exact hc ((mem_dedupList _ c).mpr ((mem_append_iff _ _ c).mpr (Or.inr hInFM)))
    rw [hS0, mul_zero]

/-- Exact Fock unitarity of ANY 12-orbit mixer `block12Op` whenever `12 * inv12 = 1`, `conj inv12 = inv12`,
    and `conj u * u = 1`. -/
def block12Unitary [DecidableEq α]
    (act : α → Bool) (curLine : α → Fin 12) (moveTo : Fin 12 → α → α) (u inv12 : R)
    (hActMove : ∀ (m : Fin 12) (c : α), act c = true → act (moveTo m c) = true)
    (hMoveMove : ∀ (m₁ m₂ : Fin 12) (c : α), act c = true → moveTo m₁ (moveTo m₂ c) = moveTo m₁ c)
    (hMoveCur : ∀ (c : α), act c = true → moveTo (curLine c) c = c)
    (hCurMove : ∀ (m : Fin 12) (c : α), act c = true → curLine (moveTo m c) = m)
    (h12 : mul (ofNatR 12) inv12 = one)
    (hInvConj : conj inv12 = inv12)
    (hUnit : mul (conj u) u = one) : FockUnitary R α where
  op := block12Op act moveTo u inv12
  dag := block12Op act moveTo (conj u) inv12
  leftInv := fun ψ => by
    funext c
    rw [block12_comp act moveTo inv12 u (conj u) hActMove hMoveMove h12 ψ c, hUnit, block12_one]
  rightInv := fun ψ => by
    funext c
    rw [block12_comp act moveTo inv12 (conj u) u hActMove hMoveMove h12 ψ c,
        mul_comm u (conj u), hUnit, block12_one]
  preservesSupp := block12_expand_supp act curLine moveTo inv12 u hActMove hMoveMove hMoveCur
  preservesDagSupp := block12_expand_supp act curLine moveTo inv12 (conj u) hActMove hMoveMove hMoveCur
  preservesInner := fun ψ φ s s' hsψ _ hs'ψ _ => by
    let rot : Fin 12 → α → α := fun k c => if act c then moveTo (addMod12 (curLine c) k) c else c
    let rotInv : Fin 12 → α → α := fun k c => if act c then moveTo (subMod12 (curLine c) k) c else c
    have hRotInv1 : ∀ (k : Fin 12) (c : α), rotInv k (rot k c) = c := by
      intro k c
      change (if act (if act c then moveTo (addMod12 (curLine c) k) c else c) then
        moveTo (subMod12 (curLine (if act c then moveTo (addMod12 (curLine c) k) c else c)) k)
          (if act c then moveTo (addMod12 (curLine c) k) c else c)
        else (if act c then moveTo (addMod12 (curLine c) k) c else c)) = c
      cases ha : act c with
      | false => rw [ite_bool_false, ha, ite_bool_false]
      | true =>
        have hm := hActMove (addMod12 (curLine c) k) c ha
        rw [ite_bool_true, ite_eq_left hm, hCurMove _ c ha, addMod12_subMod12, hMoveMove _ _ c ha, hMoveCur c ha]
    have hRotInv2 : ∀ (k : Fin 12) (c : α), rot k (rotInv k c) = c := by
      intro k c
      change (if act (if act c then moveTo (subMod12 (curLine c) k) c else c) then
        moveTo (addMod12 (curLine (if act c then moveTo (subMod12 (curLine c) k) c else c)) k)
          (if act c then moveTo (subMod12 (curLine c) k) c else c)
        else (if act c then moveTo (subMod12 (curLine c) k) c else c)) = c
      cases ha : act c with
      | false => rw [ite_bool_false, ha, ite_bool_false]
      | true =>
        have hm := hActMove (subMod12 (curLine c) k) c ha
        rw [ite_bool_true, ite_eq_left hm, hCurMove _ c ha, subMod12_addMod12, hMoveMove _ _ c ha, hMoveCur c ha]
    let uL := dedupList (s ++ flatMapList (fun c => (List.finRange 12).map (fun m => if act c then moveTo m c else c)) s)
    have huNd : IsNodup uL := isNodup_dedupList _
    have huClosedMove : ∀ (c : α) (m : Fin 12), c ∈ uL → act c = true → moveTo m c ∈ uL := by
      intro c m hc hca
      have hMem := (mem_append_iff _ _ c).mp ((mem_dedupList _ c).mp hc)
      refine (mem_dedupList _ _).mpr ((mem_append_iff _ _ _).mpr (Or.inr ?_))
      rcases hMem with hS | hFM
      · refine (mem_flatMapList_iff _ s _).mpr ⟨c, hS, (mem_map_iff _ _ _).mpr ⟨m, mem_finRange12 m, ?_⟩⟩
        rw [ite_eq_left hca]
      · obtain ⟨x, hxS, hmx⟩ := (mem_flatMapList_iff _ s c).mp hFM
        obtain ⟨k, _, hkx⟩ := (mem_map_iff _ _ c).mp hmx
        cases hxa : act x with
        | false =>
          rw [hxa, ite_bool_false] at hkx
          rw [← hkx, hxa] at hca
          exact Bool.noConfusion hca
        | true =>
          rw [ite_eq_left hxa] at hkx
          refine (mem_flatMapList_iff _ s _).mpr ⟨x, hxS, (mem_map_iff _ _ _).mpr ⟨m, mem_finRange12 m, ?_⟩⟩
          rw [ite_eq_left hxa, ← hkx, hMoveMove m k x hxa]
    have huψ : SuppIn uL ψ :=
      ⟨huNd, fun c hc => hsψ.2 c (fun h => hc ((mem_dedupList _ c).mpr ((mem_append_iff _ _ c).mpr (Or.inl h))))⟩
    have huOpψ : SuppIn uL (block12Op act moveTo u inv12 ψ) := by
      refine ⟨huNd, fun c hc => ?_⟩
      have hcNotS : c ∉ s := fun h => hc ((mem_dedupList _ c).mpr ((mem_append_iff _ _ c).mpr (Or.inl h)))
      unfold block12Op
      cases ha : act c with
      | false => rw [ite_bool_false]; exact hsψ.2 c hcNotS
      | true =>
        rw [ite_bool_true, hsψ.2 c hcNotS, zero_add]
        have hS0 : sumFin12 (fun m => ψ (moveTo m c)) = zero := by
          apply sumList_zero_of_all_zero
          intro m _
          apply hsψ.2
          intro hmS
          have hInU : moveTo m c ∈ uL := (mem_dedupList _ _).mpr ((mem_append_iff _ _ _).mpr (Or.inl hmS))
          have hBack : moveTo (curLine c) (moveTo m c) ∈ uL := huClosedMove _ (curLine c) hInU (hActMove m c ha)
          rw [hMoveMove _ _ c ha, hMoveCur c ha] at hBack
          exact hc hBack
        rw [hS0, mul_zero]
    rw [(thm_fock_inner_support_indep s' uL _ _ hs'ψ huOpψ).1]
    rw [← (thm_fock_inner_support_indep uL s ψ φ huψ hsψ).1]
    unfold innerOn
    rw [sumList_filter_add uL act, sumList_filter_add uL act (fun c => mul (conj (ψ c)) (φ c))]
    refine congr (congrArg add ?_) ?_
    · let ua := uL.filter act
      have huaNd : IsNodup ua := isNodup_filter act huNd
      have huaRotCl : ∀ (k : Fin 12) (c : α), c ∈ ua → rot k c ∈ ua := by
        intro k c hc
        have ⟨hcu, hca⟩ := (mem_filter_iff act uL c).mp hc
        exact (mem_filter_iff act uL _).mpr
          ⟨by change (if act c then moveTo (addMod12 (curLine c) k) c else c) ∈ uL; rw [ite_eq_left hca]; exact huClosedMove c _ hcu hca,
           by change act (if act c then moveTo (addMod12 (curLine c) k) c else c) = true; rw [ite_eq_left hca]; exact hActMove _ c hca⟩
      have huaRotInvCl : ∀ (k : Fin 12) (c : α), c ∈ ua → rotInv k c ∈ ua := by
        intro k c hc
        have ⟨hcu, hca⟩ := (mem_filter_iff act uL c).mp hc
        exact (mem_filter_iff act uL _).mpr
          ⟨by change (if act c then moveTo (subMod12 (curLine c) k) c else c) ∈ uL; rw [ite_eq_left hca]; exact huClosedMove c _ hcu hca,
           by change act (if act c then moveTo (subMod12 (curLine c) k) c else c) = true; rw [ite_eq_left hca]; exact hActMove _ c hca⟩
      let hop := mul (sub u one) inv12
      let Sψ : α → R := fun c => sumFin12 (fun m => ψ (moveTo m c))
      let Sφ : α → R := fun c => sumFin12 (fun m => φ (moveTo m c))
      have hRotS : ∀ (χ : FockVec R α) (c : α), act c = true →
          sumFin12 (fun k => χ (rot k c)) = sumFin12 (fun m => χ (moveTo m c)) := by
        intro χ c hca
        have hEq : (fun k => χ (rot k c)) = (fun k => (fun m => χ (moveTo m c)) (addMod12 (curLine c) k)) := by
          funext k
          change χ (if act c then moveTo (addMod12 (curLine c) k) c else c) = _
          rw [ite_eq_left hca]
        rw [hEq]
        exact sumFin12_bijection (R := R) (addMod12 (curLine c)) (fun m => subMod12 m (curLine c))
          (fun m => χ (moveTo m c))
          (fun k => by
            have : ∀ a b : Fin 12, subMod12 (addMod12 a b) a = b := by decide
            exact this (curLine c) k)
          (fun m => by
            have : ∀ a b : Fin 12, addMod12 a (subMod12 b a) = b := by decide
            exact this (curLine c) m)
      have hSInv : ∀ (χ : FockVec R α) (k : Fin 12) (c : α), act c = true →
          sumFin12 (fun m => χ (moveTo m (rot k c))) = sumFin12 (fun m => χ (moveTo m c)) := by
        intro χ k c hca
        apply sumFin12_congr
        intro m
        change χ (moveTo m (if act c then moveTo (addMod12 (curLine c) k) c else c)) = _
        rw [ite_eq_left hca, hMoveMove m _ c hca]
      have hCross1 : sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)) =
          mul (ofNatR 12) (sumList ua (fun c => mul (conj (ψ c)) (Sφ c))) := by
        have h1 : sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)) =
            sumList ua (fun c => sumFin12 (fun k => mul (conj (ψ (rot k c))) (Sφ (rot k c)))) := by
          apply sumList_congr
          intro c hc
          have hca := ((mem_filter_iff act uL c).mp hc).2
          have hSψc : Sψ c = sumFin12 (fun k => ψ (rot k c)) := (hRotS ψ c hca).symm
          rw [hSψc, sumFin12_conj]
          have hMulR : mul (sumFin12 (fun k => conj (ψ (rot k c)))) (Sφ c) =
              sumFin12 (fun k => mul (conj (ψ (rot k c))) (Sφ c)) := by
            rw [mul_comm, ← sumFin12_mul_left]
            apply sumFin12_congr; intro k; exact mul_comm _ _
          rw [hMulR]
          apply sumFin12_congr; intro k
          exact congrArg (mul (conj (ψ (rot k c)))) (hSInv φ k c hca).symm
        rw [h1, sumList_sumFin12_comm]
        have h2 : sumFin12 (fun k => sumList ua (fun c => mul (conj (ψ (rot k c))) (Sφ (rot k c)))) =
            sumFin12 (fun _ => sumList ua (fun c => mul (conj (ψ c)) (Sφ c))) := by
          apply sumFin12_congr; intro k
          exact sumList_bijection ua (rot k) (rotInv k) (fun c => mul (conj (ψ c)) (Sφ c))
            (hRotInv1 k) (hRotInv2 k) huaNd (huaRotCl k) (huaRotInvCl k)
        rw [h2, sumFin12_const]
      have hCross2 : sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)) =
          mul (ofNatR 12) (sumList ua (fun c => mul (conj (Sψ c)) (φ c))) := by
        have h1 : sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)) =
            sumList ua (fun c => sumFin12 (fun k => mul (conj (Sψ (rot k c))) (φ (rot k c)))) := by
          apply sumList_congr
          intro c hc
          have hca := ((mem_filter_iff act uL c).mp hc).2
          have hSφc : Sφ c = sumFin12 (fun k => φ (rot k c)) := (hRotS φ c hca).symm
          rw [hSφc, ← sumFin12_mul_left]
          apply sumFin12_congr; intro k
          exact congrArg (fun z => mul (conj z) (φ (rot k c))) (hSInv ψ k c hca).symm
        rw [h1, sumList_sumFin12_comm]
        have h2 : sumFin12 (fun k => sumList ua (fun c => mul (conj (Sψ (rot k c))) (φ (rot k c)))) =
            sumFin12 (fun _ => sumList ua (fun c => mul (conj (Sψ c)) (φ c))) := by
          apply sumFin12_congr; intro k
          exact sumList_bijection ua (rot k) (rotInv k) (fun c => mul (conj (Sψ c)) (φ c))
            (hRotInv1 k) (hRotInv2 k) huaNd (huaRotCl k) (huaRotInvCl k)
        rw [h2, sumFin12_const]
      have hC1 : sumList ua (fun c => mul (conj (ψ c)) (Sφ c)) =
          mul inv12 (sumList ua (fun c => mul (conj (Sψ c)) (Sφ c))) := by
        rw [hCross1, ← mul_assoc, mul_comm inv12 (ofNatR 12), h12, one_mul]
      have hC2 : sumList ua (fun c => mul (conj (Sψ c)) (φ c)) =
          mul inv12 (sumList ua (fun c => mul (conj (Sψ c)) (Sφ c))) := by
        rw [hCross2, ← mul_assoc, mul_comm inv12 (ofNatR 12), h12, one_mul]
      have hExpand : sumList ua (fun c =>
          mul (conj (block12Op act moveTo u inv12 ψ c)) (block12Op act moveTo u inv12 φ c)) =
        add (sumList ua (fun c => mul (conj (ψ c)) (φ c)))
          (add (mul hop (sumList ua (fun c => mul (conj (ψ c)) (Sφ c))))
               (add (mul (conj hop) (sumList ua (fun c => mul (conj (Sψ c)) (φ c))))
                    (mul (mul (conj hop) hop) (sumList ua (fun c => mul (conj (Sψ c)) (Sφ c)))))) := by
        have hTerm : sumList ua (fun c =>
              mul (conj (block12Op act moveTo u inv12 ψ c)) (block12Op act moveTo u inv12 φ c)) =
            sumList ua (fun c =>
              add (mul (conj (ψ c)) (φ c))
                (add (mul hop (mul (conj (ψ c)) (Sφ c)))
                     (add (mul (conj hop) (mul (conj (Sψ c)) (φ c)))
                          (mul (mul (conj hop) hop) (mul (conj (Sψ c)) (Sφ c)))))) := by
          apply sumList_congr
          intro c hc
          have hca := ((mem_filter_iff act uL c).mp hc).2
          unfold block12Op
          simp only [ite_eq_left hca]
          change mul (conj (add (ψ c) (mul hop (Sψ c)))) (add (φ c) (mul hop (Sφ c))) = _
          rw [conj_add, conj_mul, add_mul, mul_add, mul_add, add_assoc]
          apply congrArg (add (mul (conj (ψ c)) (φ c)))
          have t1 : mul (conj (ψ c)) (mul hop (Sφ c)) = mul hop (mul (conj (ψ c)) (Sφ c)) := by
            rw [← mul_assoc, mul_comm (conj (ψ c)) hop, mul_assoc]
          have t2 : mul (mul (conj hop) (conj (Sψ c))) (φ c) = mul (conj hop) (mul (conj (Sψ c)) (φ c)) :=
            mul_assoc _ _ _
          have t3 : mul (mul (conj hop) (conj (Sψ c))) (mul hop (Sφ c)) =
              mul (mul (conj hop) hop) (mul (conj (Sψ c)) (Sφ c)) := by
            rw [mul_assoc (conj hop) (conj (Sψ c)), ← mul_assoc (conj (Sψ c)) hop (Sφ c),
                mul_comm (conj (Sψ c)) hop, mul_assoc hop (conj (Sψ c)) (Sφ c),
                ← mul_assoc (conj hop) hop]
          rw [t1, t2, t3]
        rw [hTerm, sumList_add, sumList_add, sumList_add,
            sumList_mul_left, sumList_mul_left, sumList_mul_left]
      rw [hExpand, hC1, hC2, ← mul_assoc, ← mul_assoc, ← add_mul, ← add_mul]
      have hVanish : add (mul hop inv12) (add (mul (conj hop) inv12) (mul (conj hop) hop)) = zero := by
        have hConjHop : conj hop = mul (sub (conj u) one) inv12 := by
          change conj (mul (sub u one) inv12) = _
          rw [conj_mul, hInvConj]
          unfold sub
          rw [conj_add, star_conj_neg, conj_one]
        have hFactor : add (mul hop inv12) (add (mul (conj hop) inv12) (mul (conj hop) hop)) =
            mul (add (sub u one) (add (sub (conj u) one) (mul (sub (conj u) one) (sub u one))))
                (mul inv12 inv12) := by
          have a1 : mul hop inv12 = mul (sub u one) (mul inv12 inv12) := mul_assoc _ _ _
          have a2 : mul (conj hop) inv12 = mul (sub (conj u) one) (mul inv12 inv12) := by
            rw [hConjHop, mul_assoc]
          have a3 : mul (conj hop) hop = mul (mul (sub (conj u) one) (sub u one)) (mul inv12 inv12) := by
            rw [hConjHop]
            change mul (mul (sub (conj u) one) inv12) (mul (sub u one) inv12) = _
            rw [mul_assoc (sub (conj u) one) inv12, ← mul_assoc inv12 (sub u one) inv12,
                mul_comm inv12 (sub u one), mul_assoc (sub u one) inv12 inv12,
                ← mul_assoc (sub (conj u) one) (sub u one)]
          rw [a1, a2, a3, ← add_mul, ← add_mul]
        rw [hFactor]
        have hMid : add (sub u one) (add (sub (conj u) one) (mul (sub (conj u) one) (sub u one))) = zero := by
          have hSubMul : mul (sub (conj u) one) (sub u one) =
              sub (mul (sub (conj u) one) u) (sub (conj u) one) := by
            unfold sub
            rw [mul_add, star_mul_neg, mul_one]
          rw [hSubMul, add_sub_cancel, unit_compose_identity, hUnit, sub_self]
        rw [hMid, zero_mul]
      rw [hVanish, zero_mul, add_zero]
    · apply sumList_congr
      intro c hc
      have hcf : act c = false := by
        have hnot := ((mem_filter_iff (fun x => !act x) uL c).mp hc).2
        cases ha : act c with
        | false => rfl
        | true => rw [ha] at hnot; exact Bool.noConfusion hnot
      unfold block12Op
      rw [hcf, ite_bool_false, ite_bool_false]

/-- Headline Theorem 4 (Universal Fock Unitary Constructors):
    over ANY `StarCommRing R` and discrete configuration space `α`, bijections (`permUnitary`),
    unit-modulus diagonal phases (`phaseUnitary`), involutive `2 × 2` blocks (`block2Unitary`),
    and 12-orbit mixers (`block12Unitary`) are exact norm-preserving, inner-product-preserving,
    reversible Fock-space unitaries. -/
theorem thm_fock_elementary_unitaries [DecidableEq α]
    (π πInv : α → α) (hπ1 : ∀ c, πInv (π c) = c) (hπ2 : ∀ c, π (πInv c) = c)
    (phase : α → R) (hPhase : ∀ c, mul (conj (phase c)) (phase c) = one)
    (flip : α → α) (act2 : α → Bool) (a b : R)
    (hFlip : ∀ c, flip (flip c) = c) (hAct2 : ∀ c, act2 (flip c) = act2 c)
    (hDiag : add (mul (conj a) a) (mul (conj b) b) = one)
    (hOff : add (mul (conj a) b) (mul (conj b) a) = zero) :
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
theorem thm_fock_unitary_iter_all_time [DecidableEq α] (U : FockUnitary R α) :
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
    · intro ψ
      simp only [iter]
      rw [← iter_comm U.dag k (U.op (iter U.op k ψ)), U.leftInv, ihL ψ]
    · intro ψ
      simp only [iter]
      rw [← iter_comm U.op k (U.dag (iter U.dag k ψ)), U.rightInv, ihR ψ]
    · intro ψ s hs
      obtain ⟨sk, hsk⟩ := ihS ψ s hs
      exact U.preservesSupp (iter U.op k ψ) sk hsk
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
        unfold normSqOn
        simp only [iter]
        rw [U.preservesInner (iter U.op k ψ) (iter U.op k ψ) sm s' hsmψ hsmψ hs'ψ hs'ψ]
        exact (ihIn ψ ψ s sm hsψ hsψ hsmψ hsmψ).2
      exact ⟨hInner, hNorm⟩

end FockSpace


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
  cases x with
  | empty => rfl
  | occ s r => cases s <;> rfl

/-- Constructive `DecidableEq (Fin n → α)` for any `[DecidableEq α]`. -/
private def decEqFinGo {α : Type} [DecidableEq α] {N : Nat} (f g : Fin N → α) :
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

private def decEqFinAux {α : Type} [DecidableEq α] (n : Nat) (f g : Fin n → α) :
    Decidable (∀ i : Fin n, f i = g i) :=
  match decEqFinGo f g n (Nat.le_refl n) with
  | isTrue h => isTrue (fun i => h i i.isLt)
  | isFalse h => isFalse (fun hall => h (fun i _ => hall i))

private def decEqFin {n : Nat} {α : Type} [DecidableEq α] (f g : Fin n → α) : Decidable (f = g) :=
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

/-! ### Local `ZSqrt2` & `Mat5` Helpers for Unconditional `det(M_P g M_P) = det(g)` -/

private theorem z2_add_comm (x y : ZSqrt2) : ZSqrt2.add x y = ZSqrt2.add y x := by
  cases x; cases y; simp only [ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_add_assoc (x y z : ZSqrt2) :
    ZSqrt2.add (ZSqrt2.add x y) z = ZSqrt2.add x (ZSqrt2.add y z) := by
  cases x; cases y; cases z; simp only [ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_add_zero (x : ZSqrt2) : ZSqrt2.add x ZSqrt2.zero = x := by
  cases x; simp only [ZSqrt2.add, ZSqrt2.zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_zero_add (x : ZSqrt2) : ZSqrt2.add ZSqrt2.zero x = x := by
  cases x; simp only [ZSqrt2.add, ZSqrt2.zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_neg_neg (x : ZSqrt2) : ZSqrt2.neg (ZSqrt2.neg x) = x := by
  cases x; simp only [ZSqrt2.neg, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_neg_add (x y : ZSqrt2) :
    ZSqrt2.neg (ZSqrt2.add x y) = ZSqrt2.add (ZSqrt2.neg x) (ZSqrt2.neg y) := by
  cases x; cases y; simp only [ZSqrt2.neg, ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_neg_sub (x y : ZSqrt2) :
    ZSqrt2.neg (ZSqrt2.sub x y) = ZSqrt2.sub (ZSqrt2.neg x) (ZSqrt2.neg y) := by
  cases x; cases y; simp only [ZSqrt2.neg, ZSqrt2.sub, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem z2_mul_comm (x y : ZSqrt2) : ZSqrt2.mul x y = ZSqrt2.mul y x := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [ZSqrt2.mul, ZSqrt2.mk.injEq]
  rw [Int.mul_comm xa ya, Int.mul_comm xa yb, Int.mul_comm xb ya,
      Int.mul_assoc 2 xb yb, Int.mul_comm xb yb, ← Int.mul_assoc 2 yb xb]
  exact ⟨by omega, by omega⟩

private theorem z2_mul_add (x y z : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.add y z) = ZSqrt2.add (ZSqrt2.mul x y) (ZSqrt2.mul x z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.add, ZSqrt2.mk.injEq, Int.mul_add]
  exact ⟨by omega, by omega⟩

private theorem z2_add_mul (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.add x y) z = ZSqrt2.add (ZSqrt2.mul x z) (ZSqrt2.mul y z) := by
  rw [z2_mul_comm, z2_mul_add, z2_mul_comm z x, z2_mul_comm z y]

private theorem z2_mul_sub (x y z : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.sub y z) = ZSqrt2.sub (ZSqrt2.mul x y) (ZSqrt2.mul x z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.sub, ZSqrt2.mk.injEq, Int.mul_sub]
  exact ⟨by omega, by omega⟩

private theorem z2_sub_mul (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.sub x y) z = ZSqrt2.sub (ZSqrt2.mul x z) (ZSqrt2.mul y z) := by
  rw [z2_mul_comm, z2_mul_sub, z2_mul_comm z x, z2_mul_comm z y]

private theorem z2_neg_mul (x y : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.neg x) y = ZSqrt2.neg (ZSqrt2.mul x y) := by
  cases x; cases y
  simp only [ZSqrt2.mul, ZSqrt2.neg, ZSqrt2.mk.injEq, Int.neg_mul, Int.mul_neg]
  exact ⟨by omega, by omega⟩

private theorem z2_mul_neg (x y : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.neg y) = ZSqrt2.neg (ZSqrt2.mul x y) := by
  rw [z2_mul_comm, z2_neg_mul, z2_mul_comm]

private theorem z2_mul_assoc (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.mul x y) z = ZSqrt2.mul x (ZSqrt2.mul y z) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  cases z with | mk za zb =>
  simp only [ZSqrt2.mul, ZSqrt2.mk.injEq, Int.add_mul, Int.mul_add, Int.mul_assoc]
  have h1 : xa * (2 * (yb * zb)) = 2 * (xa * (yb * zb)) := by
    rw [← Int.mul_assoc xa 2 (yb * zb), Int.mul_comm xa 2, Int.mul_assoc 2 xa (yb * zb)]
  have h2 : xb * (2 * (yb * zb)) = 2 * (xb * (yb * zb)) := by
    rw [← Int.mul_assoc xb 2 (yb * zb), Int.mul_comm xb 2, Int.mul_assoc 2 xb (yb * zb)]
  rw [h1, h2]
  exact ⟨by omega, by omega⟩

private theorem z2_mul_one (x : ZSqrt2) : ZSqrt2.mul x ZSqrt2.one = x := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.one, ZSqrt2.mk.injEq, Int.mul_one, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem z2_one_mul (x : ZSqrt2) : ZSqrt2.mul ZSqrt2.one x = x := by
  rw [z2_mul_comm, z2_mul_one]

private theorem z2_mul_zero (x : ZSqrt2) : ZSqrt2.mul x ZSqrt2.zero = ZSqrt2.zero := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.zero, ZSqrt2.mk.injEq, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem z2_zero_mul (x : ZSqrt2) : ZSqrt2.mul ZSqrt2.zero x = ZSqrt2.zero := by
  rw [z2_mul_comm, z2_mul_zero]

private theorem fb_sum5_add_aux (f0 f1 f2 f3 f4 g0 g1 g2 g3 g4 : ZSqrt2) :
    ZSqrt2.add
      (ZSqrt2.add
        (ZSqrt2.add
          (ZSqrt2.add (ZSqrt2.add f0 g0) (ZSqrt2.add f1 g1))
          (ZSqrt2.add f2 g2))
        (ZSqrt2.add f3 g3))
      (ZSqrt2.add f4 g4) =
    ZSqrt2.add
      (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add f0 f1) f2) f3) f4)
      (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add g0 g1) g2) g3) g4) := by
  have swap4 : ∀ a b c d : ZSqrt2,
      ZSqrt2.add (ZSqrt2.add a b) (ZSqrt2.add c d) =
        ZSqrt2.add (ZSqrt2.add a c) (ZSqrt2.add b d) := by
    intro a b c d
    rw [z2_add_assoc a b (ZSqrt2.add c d), ← z2_add_assoc b c d, z2_add_comm b c,
        z2_add_assoc c b d, ← z2_add_assoc a c (ZSqrt2.add b d)]
  rw [swap4 f0 g0 f1 g1,
      swap4 (ZSqrt2.add f0 f1) (ZSqrt2.add g0 g1) f2 g2,
      swap4 (ZSqrt2.add (ZSqrt2.add f0 f1) f2) (ZSqrt2.add (ZSqrt2.add g0 g1) g2) f3 g3,
      swap4 (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add f0 f1) f2) f3)
            (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add g0 g1) g2) g3) f4 g4]

private theorem fb_sum5_add (f g : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.add (f k) (g k)) = ZSqrt2.add (sum5 f) (sum5 g) :=
  fb_sum5_add_aux
    (f ⟨0, by decide⟩) (f ⟨1, by decide⟩) (f ⟨2, by decide⟩) (f ⟨3, by decide⟩) (f ⟨4, by decide⟩)
    (g ⟨0, by decide⟩) (g ⟨1, by decide⟩) (g ⟨2, by decide⟩) (g ⟨3, by decide⟩) (g ⟨4, by decide⟩)

private theorem fb_sum5_mul_left (c : ZSqrt2) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul c (f k)) = ZSqrt2.mul c (sum5 f) := by
  unfold sum5; rw [z2_mul_add, z2_mul_add, z2_mul_add, z2_mul_add]

private theorem fb_sum5_mul_right (f : Fin 5 → ZSqrt2) (c : ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (f k) c) = ZSqrt2.mul (sum5 f) c := by
  unfold sum5; rw [z2_add_mul, z2_add_mul, z2_add_mul, z2_add_mul]

private theorem fb_sum5_comm (f : Fin 5 → Fin 5 → ZSqrt2) :
    sum5 (fun i => sum5 (fun j => f i j)) = sum5 (fun j => sum5 (fun i => f i j)) := by
  change sum5 (fun i => sum5 (fun j => f i j)) =
    ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add
      (sum5 (fun i => f i ⟨0, by decide⟩))
      (sum5 (fun i => f i ⟨1, by decide⟩)))
      (sum5 (fun i => f i ⟨2, by decide⟩)))
      (sum5 (fun i => f i ⟨3, by decide⟩)))
      (sum5 (fun i => f i ⟨4, by decide⟩))
  rw [← fb_sum5_add, ← fb_sum5_add, ← fb_sum5_add, ← fb_sum5_add]
  rfl

private theorem fb_mat5Mul_id_left (A : Mat5) : mat5Mul mat5Id A = A := by
  funext i j
  unfold mat5Mul sum5
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp [mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

-- [helper]
theorem fb_mat5Mul_id_right (A : Mat5) : mat5Mul A mat5Id = A := by
  funext i j
  unfold mat5Mul sum5
  match j with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp [mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero, z2_zero_add]

-- [helper]
theorem fb_mat5Mul_assoc (A B C : Mat5) :
    mat5Mul (mat5Mul A B) C = mat5Mul A (mat5Mul B C) := by
  funext i j
  unfold mat5Mul
  have hL : sum5 (fun k => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (A i m) (B m k))) (C k j)) =
      sum5 (fun k => sum5 (fun m => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (C k j)))) := by
    apply congrArg sum5; funext k
    rw [← fb_sum5_mul_right]
    apply congrArg sum5; funext m
    exact z2_mul_assoc (A i m) (B m k) (C k j)
  have hR : sum5 (fun m => ZSqrt2.mul (A i m) (sum5 (fun k => ZSqrt2.mul (B m k) (C k j)))) =
      sum5 (fun m => sum5 (fun k => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (C k j)))) := by
    apply congrArg sum5; funext m
    rw [← fb_sum5_mul_left]
  rw [hL, fb_sum5_comm, hR]

private def parityMat5Fast : Mat5
  | ⟨0, _⟩, ⟨0, _⟩ => ZSqrt2.negOne
  | ⟨0, _⟩, ⟨1, _⟩ => ZSqrt2.one
  | ⟨0, _⟩, _      => ZSqrt2.zero
  | i, j           => mat5Id i j

private theorem parityMat5_eq_fast : parityMat5 = parityMat5Fast :=
  funext (fun i => funext (fun j => (by decide : ∀ x y : Fin 5, parityMat5 x y = parityMat5Fast x y) i j))

private theorem parityMat5_mul_row0 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨0, by decide⟩ j = ZSqrt2.sub (g ⟨1, by decide⟩ j) (g ⟨0, by decide⟩ j) := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp only [parityMat5Fast, z2_one_mul, z2_zero_mul, z2_add_zero]
  cases g ⟨0, by decide⟩ j; cases g ⟨1, by decide⟩ j
  simp only [ZSqrt2.negOne, ZSqrt2.mul, ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mk.injEq,
    Int.mul_zero, Int.zero_mul, Int.neg_mul, Int.one_mul]
  exact ⟨by omega, by omega⟩

private theorem parityMat5_mul_row1 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨1, by decide⟩ j = g ⟨1, by decide⟩ j := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp [parityMat5Fast, mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

private theorem parityMat5_mul_row2 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨2, by decide⟩ j = g ⟨2, by decide⟩ j := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp [parityMat5Fast, mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

private theorem parityMat5_mul_row3 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨3, by decide⟩ j = g ⟨3, by decide⟩ j := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp [parityMat5Fast, mat5Id, z2_one_mul, z2_zero_mul, z2_add_zero, z2_zero_add]

private theorem parityMat5_mul_row4 (g : Mat5) (j : Fin 5) :
    mat5Mul parityMat5 g ⟨4, by decide⟩ j = g ⟨4, by decide⟩ j := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5
  simp [parityMat5Fast, mat5Id, z2_one_mul, z2_zero_mul, z2_zero_add]

private theorem mul_parityMat5_col0 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨0, by decide⟩ = ZSqrt2.neg (g i ⟨0, by decide⟩) := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5; dsimp only
  have h0 : parityMat5Fast ⟨0, by decide⟩ ⟨0, by decide⟩ = ZSqrt2.negOne := by decide
  rw [h0]
  simp [parityMat5Fast, mat5Id, z2_mul_zero, z2_add_zero]
  cases g i ⟨0, by decide⟩
  simp only [ZSqrt2.negOne, ZSqrt2.mul, ZSqrt2.neg, ZSqrt2.mk.injEq,
    Int.mul_zero, Int.mul_neg, Int.mul_one]
  exact ⟨by omega, by omega⟩

private theorem mul_parityMat5_col1 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨1, by decide⟩ = ZSqrt2.add (g i ⟨0, by decide⟩) (g i ⟨1, by decide⟩) := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5; dsimp only
  have h0 : parityMat5Fast ⟨0, by decide⟩ ⟨1, by decide⟩ = ZSqrt2.one := by decide
  rw [h0]
  simp [parityMat5Fast, mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero]

private theorem mul_parityMat5_col2 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨2, by decide⟩ = g i ⟨2, by decide⟩ := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5; dsimp only
  have h0 : parityMat5Fast ⟨0, by decide⟩ ⟨2, by decide⟩ = ZSqrt2.zero := by decide
  rw [h0]
  simp [parityMat5Fast, mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero, z2_zero_add]

private theorem mul_parityMat5_col3 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨3, by decide⟩ = g i ⟨3, by decide⟩ := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5; dsimp only
  have h0 : parityMat5Fast ⟨0, by decide⟩ ⟨3, by decide⟩ = ZSqrt2.zero := by decide
  rw [h0]
  simp [parityMat5Fast, mat5Id, z2_mul_one, z2_mul_zero, z2_add_zero, z2_zero_add]

private theorem mul_parityMat5_col4 (g : Mat5) (i : Fin 5) :
    mat5Mul g parityMat5 i ⟨4, by decide⟩ = g i ⟨4, by decide⟩ := by
  rw [parityMat5_eq_fast]; unfold mat5Mul sum5; dsimp only
  have h0 : parityMat5Fast ⟨0, by decide⟩ ⟨4, by decide⟩ = ZSqrt2.zero := by decide
  rw [h0]
  simp [parityMat5Fast, mat5Id, z2_mul_one, z2_mul_zero, z2_zero_add]

private theorem det2Z2_row0_op (a0 a1 b0 b1 : ZSqrt2) :
    det2Z2 (ZSqrt2.sub b0 a0) (ZSqrt2.sub b1 a1) b0 b1 = ZSqrt2.neg (det2Z2 a0 a1 b0 b1) := by
  unfold det2Z2
  rw [z2_sub_mul, z2_sub_mul, z2_mul_comm b1 b0]
  cases ZSqrt2.mul b0 b1; cases ZSqrt2.mul a0 b1; cases ZSqrt2.mul a1 b0
  simp only [ZSqrt2.sub, ZSqrt2.neg, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem det2Z2_col01_op (x y u v : ZSqrt2) :
    det2Z2 (ZSqrt2.neg x) (ZSqrt2.add x y) (ZSqrt2.neg u) (ZSqrt2.add u v) =
      ZSqrt2.neg (det2Z2 x y u v) := by
  unfold det2Z2
  rw [z2_neg_mul, z2_mul_add, z2_mul_neg, z2_add_mul, z2_mul_comm y u, z2_mul_comm x u]
  cases ZSqrt2.mul u x; cases ZSqrt2.mul x v; cases ZSqrt2.mul u y
  simp only [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.neg, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem det2Z2_col0q_op (x z u w : ZSqrt2) :
    det2Z2 (ZSqrt2.neg x) z (ZSqrt2.neg u) w = ZSqrt2.neg (det2Z2 x z u w) := by
  unfold det2Z2
  rw [z2_neg_mul, z2_mul_neg, z2_neg_sub]

private theorem det2Z2_col1q_op (x y z u v w : ZSqrt2) :
    det2Z2 (ZSqrt2.add x y) z (ZSqrt2.add u v) w =
      ZSqrt2.add (det2Z2 x z u w) (det2Z2 y z v w) := by
  unfold det2Z2
  rw [z2_add_mul, z2_mul_add]
  cases ZSqrt2.mul x w; cases ZSqrt2.mul y w; cases ZSqrt2.mul z u; cases ZSqrt2.mul z v
  simp only [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem mat5Det_parityMat5_mul (g : Mat5) :
    mat5Det (mat5Mul parityMat5 g) = ZSqrt2.neg (mat5Det g) := by
  unfold mat5Det
  dsimp only
  simp only [parityMat5_mul_row0, parityMat5_mul_row1, parityMat5_mul_row2,
    parityMat5_mul_row3, parityMat5_mul_row4, det2Z2_row0_op, z2_neg_mul, z2_neg_add, z2_neg_sub]

private theorem det3_col01_op (m0 m1 m2 b01 b02 b12 : ZSqrt2) :
    ZSqrt2.add
      (ZSqrt2.sub (ZSqrt2.mul (ZSqrt2.neg m0) (ZSqrt2.add b02 b12))
                  (ZSqrt2.mul (ZSqrt2.add m0 m1) (ZSqrt2.neg b02)))
      (ZSqrt2.mul m2 (ZSqrt2.neg b01)) =
    ZSqrt2.neg (ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul m0 b12) (ZSqrt2.mul m1 b02)) (ZSqrt2.mul m2 b01)) := by
  rw [z2_neg_mul, z2_mul_add, z2_mul_neg, z2_add_mul, z2_mul_neg]
  cases ZSqrt2.mul m0 b02; cases ZSqrt2.mul m0 b12; cases ZSqrt2.mul m1 b02; cases ZSqrt2.mul m2 b01
  simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.neg, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem det3_col0_op (m0 m1 m2 b12 b02 b01 : ZSqrt2) :
    ZSqrt2.add
      (ZSqrt2.sub (ZSqrt2.mul (ZSqrt2.neg m0) b12) (ZSqrt2.mul m1 (ZSqrt2.neg b02)))
      (ZSqrt2.mul m2 (ZSqrt2.neg b01)) =
    ZSqrt2.neg (ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul m0 b12) (ZSqrt2.mul m1 b02)) (ZSqrt2.mul m2 b01)) := by
  rw [z2_neg_mul, z2_mul_neg, z2_mul_neg, z2_neg_add, z2_neg_sub]

private theorem det3_col1_op (m0 m1 m2 m3 b23 b03 b13 b02 b12 : ZSqrt2) :
    ZSqrt2.add
      (ZSqrt2.sub (ZSqrt2.mul (ZSqrt2.add m0 m1) b23) (ZSqrt2.mul m2 (ZSqrt2.add b03 b13)))
      (ZSqrt2.mul m3 (ZSqrt2.add b02 b12)) =
    ZSqrt2.add
      (ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul m0 b23) (ZSqrt2.mul m2 b03)) (ZSqrt2.mul m3 b02))
      (ZSqrt2.add (ZSqrt2.sub (ZSqrt2.mul m1 b23) (ZSqrt2.mul m2 b13)) (ZSqrt2.mul m3 b12)) := by
  rw [z2_add_mul, z2_mul_add, z2_mul_add]
  cases ZSqrt2.mul m0 b23; cases ZSqrt2.mul m1 b23
  cases ZSqrt2.mul m2 b03; cases ZSqrt2.mul m2 b13
  cases ZSqrt2.mul m3 b02; cases ZSqrt2.mul m3 b12
  simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem det5_col01_sum_rearrange
    (a01 a02 a03 a04 a12 a13 a14 a23 a24 a34
     d234 d134 d124 d123 d034 d024 d023 d014 d013 d012 : ZSqrt2) :
    let t0 := ZSqrt2.mul (ZSqrt2.neg a01) d234
    let t1 := ZSqrt2.sub t0 (ZSqrt2.mul (ZSqrt2.neg a02) (ZSqrt2.add d034 d134))
    let t2 := ZSqrt2.add t1 (ZSqrt2.mul (ZSqrt2.neg a03) (ZSqrt2.add d024 d124))
    let t3 := ZSqrt2.sub t2 (ZSqrt2.mul (ZSqrt2.neg a04) (ZSqrt2.add d023 d123))
    let t4 := ZSqrt2.add t3 (ZSqrt2.mul (ZSqrt2.add a02 a12) (ZSqrt2.neg d034))
    let t5 := ZSqrt2.sub t4 (ZSqrt2.mul (ZSqrt2.add a03 a13) (ZSqrt2.neg d024))
    let t6 := ZSqrt2.add t5 (ZSqrt2.mul (ZSqrt2.add a04 a14) (ZSqrt2.neg d023))
    let t7 := ZSqrt2.add t6 (ZSqrt2.mul a23 (ZSqrt2.neg d014))
    let t8 := ZSqrt2.sub t7 (ZSqrt2.mul a24 (ZSqrt2.neg d013))
    ZSqrt2.add t8 (ZSqrt2.mul a34 (ZSqrt2.neg d012)) =
    ZSqrt2.neg (
      let s0 := ZSqrt2.mul a01 d234
      let s1 := ZSqrt2.sub s0 (ZSqrt2.mul a02 d134)
      let s2 := ZSqrt2.add s1 (ZSqrt2.mul a03 d124)
      let s3 := ZSqrt2.sub s2 (ZSqrt2.mul a04 d123)
      let s4 := ZSqrt2.add s3 (ZSqrt2.mul a12 d034)
      let s5 := ZSqrt2.sub s4 (ZSqrt2.mul a13 d024)
      let s6 := ZSqrt2.add s5 (ZSqrt2.mul a14 d023)
      let s7 := ZSqrt2.add s6 (ZSqrt2.mul a23 d014)
      let s8 := ZSqrt2.sub s7 (ZSqrt2.mul a24 d013)
      ZSqrt2.add s8 (ZSqrt2.mul a34 d012)) := by
  dsimp only
  simp only [z2_neg_mul, z2_mul_neg, z2_mul_add, z2_add_mul]
  cases ZSqrt2.mul a01 d234; cases ZSqrt2.mul a02 d034; cases ZSqrt2.mul a02 d134
  cases ZSqrt2.mul a03 d024; cases ZSqrt2.mul a03 d124; cases ZSqrt2.mul a04 d023
  cases ZSqrt2.mul a04 d123; cases ZSqrt2.mul a12 d034; cases ZSqrt2.mul a13 d024
  cases ZSqrt2.mul a14 d023; cases ZSqrt2.mul a23 d014; cases ZSqrt2.mul a24 d013
  cases ZSqrt2.mul a34 d012
  simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.neg, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem mat5Det_mul_parityMat5 (g : Mat5) :
    mat5Det (mat5Mul g parityMat5) = ZSqrt2.neg (mat5Det g) := by
  unfold mat5Det
  dsimp only
  simp only [mul_parityMat5_col0, mul_parityMat5_col1, mul_parityMat5_col2,
    mul_parityMat5_col3, mul_parityMat5_col4]
  simp only [det2Z2_col01_op]
  simp only [det2Z2_col0q_op, det2Z2_col1q_op]
  simp only [det3_col01_op]
  simp only [det3_col0_op, det3_col1_op]
  exact det5_col01_sum_rearrange _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

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
    funext (fun i => funext (fun j => (by decide : ∀ x y : Fin 5, mat5Mul parityMat5 parityMat5 x y = mat5Id x y) i j))
  have hPOrth : mat5Mul (mat5Transpose parityMat5) (mat5Mul twiceGram parityMat5) = twiceGram :=
    thm_reflection_preserves_twiceGram (unitVec5 ⟨0, by decide⟩) (by decide)
  have hDet : mat5Det parityMat5 = ZSqrt2.ofInt (-1) := by decide
  have hNorm : ∀ a : Fin 24, mat5Vec parityMat5 (facetNormal a) = facetNormal (paritySlot a) := by
    intro a
    exact funext ((by decide : ∀ (x : Fin 24) (i : Fin 5),
      mat5Vec parityMat5 (facetNormal x) i = facetNormal (paritySlot x) i) a)
  have hTrans : ∀ a : Fin 24,
      mat5Mul (mat5Mul parityMat5 (transport a)) parityMat5 = transport (paritySlot a) := by
    intro a
    have hCommZ : mat5Mul parityMat5 centralInversion = mat5Mul centralInversion parityMat5 :=
      thm_central_inversion_properties.2.2.2.2 ⟨0, by decide⟩
    unfold transport faceReflection
    calc mat5Mul (mat5Mul parityMat5 (mat5Mul (reflectionIn (facetNormal a)) centralInversion)) parityMat5
        = mat5Mul (mat5Mul (mat5Mul parityMat5 (reflectionIn (facetNormal a))) centralInversion) parityMat5 := by
            rw [← fb_mat5Mul_assoc parityMat5 (reflectionIn (facetNormal a)) centralInversion]
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
      unfold conjMatP
      rw [mat5Det_mul_parityMat5, mat5Det_parityMat5_mul, z2_neg_neg]
    refine ⟨hd, ?_⟩
    unfold dockParity
    rw [hd]
  exact ⟨hP2, hDet, hNorm, hTrans, hConjDet⟩

-- [helper]
theorem conjMatP_involutive (g : Mat5) : conjMatP (conjMatP g) = g := by
  unfold conjMatP
  have hP2 := thm_fock_coxeter_parity_equivariance.1
  rw [fb_mat5Mul_assoc parityMat5 (mat5Mul (mat5Mul parityMat5 g) parityMat5) parityMat5]
  rw [fb_mat5Mul_assoc (mat5Mul parityMat5 g) parityMat5 parityMat5, hP2, fb_mat5Mul_id_right]
  rw [← fb_mat5Mul_assoc parityMat5 parityMat5 g, hP2, fb_mat5Mul_id_left]

private theorem conjMatP_mul (g₁ g₂ : Mat5) :
    conjMatP (mat5Mul g₁ g₂) = mat5Mul (conjMatP g₁) (conjMatP g₂) := by
  unfold conjMatP
  have hP2 := thm_fock_coxeter_parity_equivariance.1
  calc mat5Mul (mat5Mul parityMat5 (mat5Mul g₁ g₂)) parityMat5
      = mat5Mul (mat5Mul parityMat5 g₁) (mat5Mul g₂ parityMat5) := by
          rw [← fb_mat5Mul_assoc parityMat5 g₁ g₂, fb_mat5Mul_assoc]
    _ = mat5Mul (mat5Mul parityMat5 g₁) (mat5Mul mat5Id (mat5Mul g₂ parityMat5)) := by
          rw [fb_mat5Mul_id_left]
    _ = mat5Mul (mat5Mul parityMat5 g₁) (mat5Mul (mat5Mul parityMat5 parityMat5) (mat5Mul g₂ parityMat5)) := by
          rw [hP2]
    _ = mat5Mul (mat5Mul (mat5Mul parityMat5 g₁) parityMat5) (mat5Mul parityMat5 (mat5Mul g₂ parityMat5)) := by
          rw [fb_mat5Mul_assoc parityMat5 parityMat5 (mat5Mul g₂ parityMat5), ← fb_mat5Mul_assoc]
    _ = mat5Mul (mat5Mul (mat5Mul parityMat5 g₁) parityMat5) (mat5Mul (mat5Mul parityMat5 g₂) parityMat5) := by
          rw [fb_mat5Mul_assoc parityMat5 g₂ parityMat5]

/-! ### Canonical Total Order on `Mat5` & Infinite-Honeycomb `HoneycombConfig` -/

private def listIntLt : List Int → List Int → Bool
  | [], _ => false
  | _, [] => false
  | x :: xs, y :: ys => if x < y then true else if y < x then false else listIntLt xs ys

private theorem listIntLt_irrefl (xs : List Int) : listIntLt xs xs = false := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [listIntLt]
    have hxx : ¬ (x < x) := by omega
    simp only [ite_eq_right hxx]
    exact ih

private theorem listIntLt_trans (xs ys zs : List Int)
    (h1 : listIntLt xs ys = true) (h2 : listIntLt ys zs = true) :
    listIntLt xs zs = true := by
  induction xs generalizing ys zs with
  | nil => simp only [listIntLt] at h1; exact Bool.noConfusion h1
  | cons x xr ih =>
    cases ys with
    | nil => simp only [listIntLt] at h1; exact Bool.noConfusion h1
    | cons y yr =>
      cases zs with
      | nil => simp only [listIntLt] at h2; exact Bool.noConfusion h2
      | cons z zr =>
        simp only [listIntLt] at h1 h2 ⊢
        if hxy : x < y then
          if hyz : y < z then
            rw [ite_eq_left (by omega)]
          else if hzy : z < y then
            rw [ite_eq_right hyz, ite_eq_left hzy] at h2; exact Bool.noConfusion h2
          else
            rw [ite_eq_left (by omega)]
        else if hyx : y < x then
          rw [ite_eq_right hxy, ite_eq_left hyx] at h1; exact Bool.noConfusion h1
        else
          rw [ite_eq_right hxy, ite_eq_right hyx] at h1
          if hyz : y < z then
            rw [ite_eq_left (by omega)]
          else if hzy : z < y then
            rw [ite_eq_right hyz, ite_eq_left hzy] at h2; exact Bool.noConfusion h2
          else
            rw [ite_eq_right hyz, ite_eq_right hzy] at h2
            have hxz : ¬ (x < z) := by omega
            have hzx : ¬ (z < x) := by omega
            simp only [ite_eq_right hxz, ite_eq_right hzx]
            exact ih yr zr h1 h2

private theorem listIntLt_trichotomy (xs ys : List Int) (hlen : xs.length = ys.length) :
    listIntLt xs ys = true ∨ xs = ys ∨ listIntLt ys xs = true := by
  induction xs generalizing ys with
  | nil =>
    cases ys with
    | nil => exact Or.inr (Or.inl rfl)
    | cons _ _ => simp only [List.length_nil, List.length_cons] at hlen; omega
  | cons x xr ih =>
    cases ys with
    | nil => simp only [List.length_nil, List.length_cons] at hlen; omega
    | cons y yr =>
      simp only [List.length_cons] at hlen
      if hxy : x < y then
        exact Or.inl (by simp only [listIntLt, ite_eq_left hxy])
      else if hyx : y < x then
        exact Or.inr (Or.inr (by simp only [listIntLt, ite_eq_left hyx]))
      else
        have hEq : x = y := by omega
        rcases ih yr (by omega) with h1 | h2 | h3
        · exact Or.inl (by simp only [listIntLt, ite_eq_right hxy, ite_eq_right hyx]; exact h1)
        · exact Or.inr (Or.inl (by rw [hEq, h2]))
        · exact Or.inr (Or.inr (by simp only [listIntLt, ite_eq_right hyx, ite_eq_right hxy]; exact h3))

private def vec5Key (v : Vec5) : List Int :=
  [ (v ⟨0, by decide⟩).a, (v ⟨0, by decide⟩).b,
    (v ⟨1, by decide⟩).a, (v ⟨1, by decide⟩).b,
    (v ⟨2, by decide⟩).a, (v ⟨2, by decide⟩).b,
    (v ⟨3, by decide⟩).a, (v ⟨3, by decide⟩).b,
    (v ⟨4, by decide⟩).a, (v ⟨4, by decide⟩).b ]

private def mat5Key (g : Mat5) : List Int :=
  vec5Key (g ⟨0, by decide⟩) ++ vec5Key (g ⟨1, by decide⟩) ++
  vec5Key (g ⟨2, by decide⟩) ++ vec5Key (g ⟨3, by decide⟩) ++ vec5Key (g ⟨4, by decide⟩)

private theorem mat5Key_len (g : Mat5) : (mat5Key g).length = 50 := rfl

private theorem vec5Key_inj (u v : Vec5) (h : vec5Key u = vec5Key v) : u = v := by
  unfold vec5Key at h
  simp only [List.cons.injEq] at h
  rcases h with ⟨h0a, h0b, h1a, h1b, h2a, h2b, h3a, h3b, h4a, h4b, _⟩
  have mkEq : ∀ (x y : ZSqrt2), x.a = y.a → x.b = y.b → x = y := fun x y ha hb => by
    cases x; cases y; simp only [ZSqrt2.mk.injEq]; exact ⟨ha, hb⟩
  funext i
  match i with
  | ⟨0, _⟩ => exact mkEq _ _ h0a h0b
  | ⟨1, _⟩ => exact mkEq _ _ h1a h1b
  | ⟨2, _⟩ => exact mkEq _ _ h2a h2b
  | ⟨3, _⟩ => exact mkEq _ _ h3a h3b
  | ⟨4, _⟩ => exact mkEq _ _ h4a h4b

private theorem mat5Key_inj (g₁ g₂ : Mat5) (h : mat5Key g₁ = mat5Key g₂) : g₁ = g₂ := by
  have append_eq_of_len : ∀ (a₁ a₂ b₁ b₂ : List Int),
      a₁.length = a₂.length → a₁ ++ b₁ = a₂ ++ b₂ → a₁ = a₂ ∧ b₁ = b₂ := by
    intro a₁
    induction a₁ with
    | nil =>
      intro a₂ b₁ b₂ hlen heq
      cases a₂ with
      | nil => exact ⟨rfl, heq⟩
      | cons _ _ => simp only [List.length_nil, List.length_cons] at hlen; omega
    | cons x xs ih =>
      intro a₂ b₁ b₂ hlen heq
      cases a₂ with
      | nil => simp only [List.length_nil, List.length_cons] at hlen; omega
      | cons y ys =>
        simp only [List.length_cons, List.cons_append, List.cons.injEq] at hlen heq
        have ⟨hxs, hbs⟩ := ih ys b₁ b₂ (by omega) heq.2
        exact ⟨by rw [heq.1, hxs], hbs⟩
  unfold mat5Key at h
  have hlen4 : (vec5Key (g₁ ⟨0, by decide⟩) ++ vec5Key (g₁ ⟨1, by decide⟩) ++
      vec5Key (g₁ ⟨2, by decide⟩) ++ vec5Key (g₁ ⟨3, by decide⟩)).length =
      (vec5Key (g₂ ⟨0, by decide⟩) ++ vec5Key (g₂ ⟨1, by decide⟩) ++
      vec5Key (g₂ ⟨2, by decide⟩) ++ vec5Key (g₂ ⟨3, by decide⟩)).length := rfl
  have hlen3 : (vec5Key (g₁ ⟨0, by decide⟩) ++ vec5Key (g₁ ⟨1, by decide⟩) ++
      vec5Key (g₁ ⟨2, by decide⟩)).length =
      (vec5Key (g₂ ⟨0, by decide⟩) ++ vec5Key (g₂ ⟨1, by decide⟩) ++
      vec5Key (g₂ ⟨2, by decide⟩)).length := rfl
  have hlen2 : (vec5Key (g₁ ⟨0, by decide⟩) ++ vec5Key (g₁ ⟨1, by decide⟩)).length =
      (vec5Key (g₂ ⟨0, by decide⟩) ++ vec5Key (g₂ ⟨1, by decide⟩)).length := rfl
  have hlen1 : (vec5Key (g₁ ⟨0, by decide⟩)).length = (vec5Key (g₂ ⟨0, by decide⟩)).length := rfl
  have ⟨h0123, h4⟩ := append_eq_of_len _ _ _ _ hlen4 h
  have ⟨h012, h3⟩ := append_eq_of_len _ _ _ _ hlen3 h0123
  have ⟨h01, h2⟩ := append_eq_of_len _ _ _ _ hlen2 h012
  have ⟨h0, h1⟩ := append_eq_of_len _ _ _ _ hlen1 h01
  funext i
  match i with
  | ⟨0, _⟩ => exact vec5Key_inj _ _ h0
  | ⟨1, _⟩ => exact vec5Key_inj _ _ h1
  | ⟨2, _⟩ => exact vec5Key_inj _ _ h2
  | ⟨3, _⟩ => exact vec5Key_inj _ _ h3
  | ⟨4, _⟩ => exact vec5Key_inj _ _ h4

/-- Canonical strict total order on `{3,4,3,4}` Coxeter cell frames `Mat5`. -/
def mat5Lt (g₁ g₂ : Mat5) : Bool := listIntLt (mat5Key g₁) (mat5Key g₂)

private theorem mat5Lt_irrefl (g : Mat5) : mat5Lt g g = false := listIntLt_irrefl (mat5Key g)

private theorem mat5Lt_trans (g₁ g₂ g₃ : Mat5)
    (h1 : mat5Lt g₁ g₂ = true) (h2 : mat5Lt g₂ g₃ = true) : mat5Lt g₁ g₃ = true :=
  listIntLt_trans _ _ _ h1 h2

private theorem mat5Lt_trichotomy (g₁ g₂ : Mat5) :
    mat5Lt g₁ g₂ = true ∨ g₁ = g₂ ∨ mat5Lt g₂ g₁ = true := by
  rcases listIntLt_trichotomy (mat5Key g₁) (mat5Key g₂) (by rw [mat5Key_len, mat5Key_len]) with h1 | h2 | h3
  · exact Or.inl h1
  · exact Or.inr (Or.inl (mat5Key_inj g₁ g₂ h2))
  · exact Or.inr (Or.inr h3)

private theorem mat5Lt_asymm (g₁ g₂ : Mat5) (h1 : mat5Lt g₁ g₂ = true) : mat5Lt g₂ g₁ = false := by
  cases h2 : mat5Lt g₂ g₁ with
  | false => rfl
  | true =>
    have hcontra := mat5Lt_trans g₁ g₂ g₁ h1 h2
    rw [mat5Lt_irrefl] at hcontra
    exact Bool.noConfusion hcontra

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

private theorem honeycombConfig_eq_iff (c₁ c₂ : HoneycombConfig) :
    c₁ = c₂ ↔ c₁.entries = c₂.entries := by
  cases c₁; cases c₂
  constructor
  · intro h; cases h; rfl
  · intro h; simp only [HoneycombConfig.mk.injEq]; exact h

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
    have hlt : mat5Lt g k = true := hgt (k, d) (List.Mem.head rest)
    have hne : k ≠ g := by
      intro heq; rw [heq, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
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
      have h0 := hlk k
      simp only [lookupEntries, ite_true] at h0
      exact absurd h0.symm (hne₂ (k, d) (List.Mem.head rest))
  | cons p₁ r₁ ih =>
    cases p₁ with | mk k₁ d₁ =>
    cases es₂ with
    | nil =>
      have h0 := hlk k₁
      simp only [lookupEntries, ite_true] at h0
      exact absurd h0 (hne₁ (k₁, d₁) (List.Mem.head r₁))
    | cons p₂ r₂ =>
      cases p₂ with | mk k₂ d₂ =>
      rcases mat5Lt_trichotomy k₁ k₂ with hlt | heq | hgt
      · have h0 := hlk k₁
        simp only [lookupEntries, ite_true] at h0
        have hne12 : k₂ ≠ k₁ := fun h => by rw [h, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        rw [ite_eq_right hne12] at h0
        have hvan : lookupEntries k₁ r₂ = v1FullDock :=
          lookupEntries_not_lt k₁ r₂ (fun q hq => mat5Lt_trans k₁ k₂ q.1 hlt (hs₂.1 q hq))
        rw [hvan] at h0
        exact absurd h0 (hne₁ (k₁, d₁) (List.Mem.head r₁))
      · have hd : d₁ = d₂ := by
          have h0 := hlk k₁
          simp only [lookupEntries, heq, ite_true] at h0
          exact h0
        have hr : r₁ = r₂ := by
          apply ih r₂ hs₁.2 hs₂.2
            (fun q hq => hne₁ q (List.Mem.tail _ hq))
            (fun q hq => hne₂ q (List.Mem.tail _ hq))
          intro g
          if hgk : k₁ = g then
            rw [← hgk,
                lookupEntries_not_lt k₁ r₁ hs₁.1,
                lookupEntries_not_lt k₁ r₂ (by rw [heq]; exact hs₂.1)]
          else
            have h0 := hlk g
            simp only [lookupEntries, ite_eq_right hgk, ← heq] at h0
            exact h0
        rw [heq, hd, hr]
      · have h0 := hlk k₂
        simp only [lookupEntries, ite_true] at h0
        have hne21 : k₁ ≠ k₂ := fun h => by rw [h, mat5Lt_irrefl] at hgt; exact Bool.noConfusion hgt
        rw [ite_eq_right hne21] at h0
        have hvan : lookupEntries k₂ r₁ = v1FullDock :=
          lookupEntries_not_lt k₂ r₁ (fun q hq => mat5Lt_trans k₂ k₁ q.1 hgt (hs₁.1 q hq))
        rw [hvan] at h0
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
      simp only [List.map]
      refine IsNodup.cons ?_ (ih hs.2)
      intro hmem
      obtain ⟨q, hq, hqk⟩ := (mem_map_iff Prod.fst rest k).mp hmem
      have hlt := hs.1 q hq
      rw [hqk, mat5Lt_irrefl] at hlt
      exact Bool.noConfusion hlt
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
    | nil =>
      simp only [List.map, lookupEntries]
      exact ⟨fun h => (nomatch h), fun h => absurd rfl h⟩
    | cons p rest ih =>
      cases p with | mk k d =>
      simp only [List.map, lookupEntries]
      if hkg : k = g then
        rw [ite_eq_left hkg, hkg]
        exact ⟨fun _ => hne (g, d) (by rw [← hkg]; exact List.Mem.head rest), fun _ => List.Mem.head _⟩
      else
        rw [ite_eq_right hkg]
        have hih := ih hs.2 (fun q hq => hne q (List.Mem.tail _ hq))
        constructor
        · intro hm
          cases hm with
          | head => exact absurd rfl hkg
          | tail _ h' => exact hih.mp h'
        · intro hneL
          exact List.Mem.tail k (hih.mpr hneL)
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
    if hd : d = v1FullDock then
      rw [ite_eq_left hd] at hp; cases hp
    else
      rw [ite_eq_right hd] at hp
      cases hp with
      | head => exact Or.inl rfl
      | tail _ h' => cases h'
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries] at hp
    if hlt : mat5Lt g k = true then
      rw [ite_eq_left hlt] at hp
      if hd : d = v1FullDock then
        rw [ite_eq_left hd] at hp
        exact Or.inr ⟨p, hp, rfl⟩
      else
        rw [ite_eq_right hd] at hp
        cases hp with
        | head => exact Or.inl rfl
        | tail _ h' => exact Or.inr ⟨p, h', rfl⟩
    else
      rw [ite_eq_right hlt] at hp
      if hkg : k = g then
        rw [ite_eq_left hkg] at hp
        if hd : d = v1FullDock then
          rw [ite_eq_left hd] at hp
          exact Or.inr ⟨p, List.Mem.tail _ hp, rfl⟩
        else
          rw [ite_eq_right hd] at hp
          cases hp with
          | head => exact Or.inl rfl
          | tail _ h' => exact Or.inr ⟨p, List.Mem.tail _ h', rfl⟩
      else
        rw [ite_eq_right hkg] at hp
        cases hp with
        | head => exact Or.inr ⟨(k, dk), List.Mem.head rest, rfl⟩
        | tail _ h' =>
          rcases ih h' with h1 | ⟨q', hq', hq'p⟩
          · exact Or.inl h1
          · exact Or.inr ⟨q', List.Mem.tail _ hq', hq'p⟩

private theorem setEntries_sorted (g : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hs : SortedEntries es) : SortedEntries (setEntries g d es) := by
  induction es with
  | nil =>
    simp only [setEntries]
    if hd : d = v1FullDock then
      rw [ite_eq_left hd]; trivial
    else
      rw [ite_eq_right hd]; exact ⟨fun _ h => (nomatch h), trivial⟩
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries]
    if hlt : mat5Lt g k = true then
      rw [ite_eq_left hlt]
      if hd : d = v1FullDock then
        rw [ite_eq_left hd]; exact hs
      else
        rw [ite_eq_right hd]
        refine ⟨?_, hs⟩
        intro p hp
        cases hp with
        | head => exact hlt
        | tail _ h' => exact mat5Lt_trans g k p.1 hlt (hs.1 p h')
    else
      rw [ite_eq_right hlt]
      if hkg : k = g then
        rw [ite_eq_left hkg]
        if hd : d = v1FullDock then
          rw [ite_eq_left hd]; exact hs.2
        else
          rw [ite_eq_right hd]; exact ⟨fun p hp => by rw [← hkg]; exact hs.1 p hp, hs.2⟩
      else
        rw [ite_eq_right hkg]
        have hklg : mat5Lt k g = true := by
          rcases mat5Lt_trichotomy g k with h1 | h2 | h3
          · exact absurd h1 hlt
          · exact absurd h2.symm hkg
          · exact h3
        refine ⟨?_, ih hs.2⟩
        intro p hp
        rcases mem_setEntries_keys g d rest p hp with hpg | ⟨q', hq', hq'p⟩
        · rw [hpg]; exact hklg
        · rw [← hq'p]; exact hs.1 q' hq'

private theorem setEntries_nonEmpty (g : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hne : ∀ p, p ∈ es → p.2 ≠ v1FullDock) :
    ∀ p, p ∈ setEntries g d es → p.2 ≠ v1FullDock := by
  induction es with
  | nil =>
    intro p hp
    simp only [setEntries] at hp
    if hd : d = v1FullDock then
      rw [ite_eq_left hd] at hp; cases hp
    else
      rw [ite_eq_right hd] at hp
      cases hp with
      | head => exact hd
      | tail _ h' => cases h'
  | cons q rest ih =>
    cases q with | mk k dk =>
    intro p hp
    simp only [setEntries] at hp
    if hlt : mat5Lt g k = true then
      rw [ite_eq_left hlt] at hp
      if hd : d = v1FullDock then
        rw [ite_eq_left hd] at hp; exact hne p hp
      else
        rw [ite_eq_right hd] at hp
        cases hp with
        | head => exact hd
        | tail _ h' => exact hne p h'
    else
      rw [ite_eq_right hlt] at hp
      if hkg : k = g then
        rw [ite_eq_left hkg] at hp
        if hd : d = v1FullDock then
          rw [ite_eq_left hd] at hp; exact hne p (List.Mem.tail _ hp)
        else
          rw [ite_eq_right hd] at hp
          cases hp with
          | head => exact hd
          | tail _ h' => exact hne p (List.Mem.tail _ h')
      else
        rw [ite_eq_right hkg] at hp
        cases hp with
        | head => exact hne (k, dk) (List.Mem.head rest)
        | tail _ h' => exact ih (fun r hr => hne r (List.Mem.tail _ hr)) p h'

private theorem lookupEntries_setEntries (g h : Mat5) (d : FullDock) (es : List (Mat5 × FullDock))
    (hs : SortedEntries es) :
    lookupEntries h (setEntries g d es) = if h = g then d else lookupEntries h es := by
  induction es with
  | nil =>
    simp only [setEntries]
    if hd : d = v1FullDock then
      rw [ite_eq_left hd]; simp only [lookupEntries]
      if hhg : h = g then rw [ite_eq_left hhg, hd] else rw [ite_eq_right hhg]
    else
      rw [ite_eq_right hd]; simp only [lookupEntries]
      if hhg : h = g then rw [ite_eq_left hhg, ite_eq_left hhg.symm]
      else
        have hgh : g ≠ h := fun e => hhg e.symm
        rw [ite_eq_right hhg, ite_eq_right hgh]
  | cons q rest ih =>
    cases q with | mk k dk =>
    simp only [setEntries]
    if hlt : mat5Lt g k = true then
      rw [ite_eq_left hlt]
      if hd : d = v1FullDock then
        rw [ite_eq_left hd]
        if hhg : h = g then
          rw [ite_eq_left hhg, hd, hhg]
          have hkg : k ≠ g := fun e => by rw [e, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
          simp only [lookupEntries, ite_eq_right hkg]
          exact lookupEntries_not_lt g rest (fun p hp => mat5Lt_trans g k p.1 hlt (hs.1 p hp))
        else
          rw [ite_eq_right hhg]
      else
        rw [ite_eq_right hd]
        simp only [lookupEntries]
        if hhg : h = g then
          rw [ite_eq_left hhg, ite_eq_left hhg.symm]
        else
          have hgh : g ≠ h := fun e => hhg e.symm
          rw [ite_eq_right hhg, ite_eq_right hgh]
    else
      rw [ite_eq_right hlt]
      if hkg : k = g then
        rw [ite_eq_left hkg]
        if hd : d = v1FullDock then
          rw [ite_eq_left hd]
          if hhg : h = g then
            rw [ite_eq_left hhg, hd, hhg]
            exact lookupEntries_not_lt g rest (by rw [← hkg]; exact hs.1)
          else
            have hkh : k ≠ h := by rw [hkg]; exact fun e => hhg e.symm
            rw [ite_eq_right hhg]; simp only [lookupEntries, ite_eq_right hkh]
        else
          rw [ite_eq_right hd]
          simp only [lookupEntries]
          if hhg : h = g then
            rw [ite_eq_left hhg, ite_eq_left hhg.symm]
          else
            have hgh : g ≠ h := fun e => hhg e.symm
            have hkh : k ≠ h := by rw [hkg]; exact hgh
            rw [ite_eq_right hhg, ite_eq_right hgh, ite_eq_right hkh]
      else
        rw [ite_eq_right hkg]
        simp only [lookupEntries]
        if hkh : k = h then
          have hhg : h ≠ g := by rw [← hkh]; exact hkg
          rw [ite_eq_left hkh, ite_eq_right hhg, ite_eq_left hkh]
        else
          rw [ite_eq_right hkh, ite_eq_right hkh, ih hs.2]

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
  apply honeycombConfig_ext; intro h; rw [lookup_setDock]
  if hhg : h = g then rw [ite_eq_left hhg, hhg] else rw [ite_eq_right hhg]

-- [helper]
theorem setDock_setDock_same (c : HoneycombConfig) (g : Mat5) (d₁ d₂ : FullDock) :
    (c.setDock g d₁).setDock g d₂ = c.setDock g d₂ := by
  apply honeycombConfig_ext; intro h; rw [lookup_setDock, lookup_setDock, lookup_setDock]
  if hhg : h = g then rw [ite_eq_left hhg, ite_eq_left hhg]
  else rw [ite_eq_right hhg, ite_eq_right hhg, ite_eq_right hhg]

-- [helper]
theorem setDock_setDock_comm (c : HoneycombConfig) (g₁ g₂ : Mat5) (d₁ d₂ : FullDock)
    (hne : g₁ ≠ g₂) :
    (c.setDock g₁ d₁).setDock g₂ d₂ = (c.setDock g₂ d₂).setDock g₁ d₁ := by
  apply honeycombConfig_ext; intro h
  rw [lookup_setDock, lookup_setDock, lookup_setDock, lookup_setDock]
  if h2 : h = g₂ then
    have h1 : h ≠ g₁ := by rw [h2]; exact fun e => hne e.symm
    simp only [ite_eq_left h2, ite_eq_right h1]
  else
    rw [ite_eq_right h2]
    if h1 : h = g₁ then simp only [ite_eq_left h1] else simp only [ite_eq_right h1, ite_eq_right h2]

private theorem sortedEntries_map_fst_eq (es₁ es₂ : List (Mat5 × FullDock))
    (hs₁ : SortedEntries es₁) (hs₂ : SortedEntries es₂)
    (hm : ∀ k : Mat5, k ∈ es₁.map Prod.fst ↔ k ∈ es₂.map Prod.fst) :
    es₁.map Prod.fst = es₂.map Prod.fst := by
  induction es₁ generalizing es₂ with
  | nil =>
    cases es₂ with
    | nil => rfl
    | cons p _ =>
      have hc := (hm p.1).mpr (List.Mem.head _)
      cases hc
  | cons p₁ r₁ ih =>
    cases p₁ with | mk k₁ _d₁ =>
    cases es₂ with
    | nil =>
      have hc := (hm k₁).mp (List.Mem.head _)
      cases hc
    | cons p₂ r₂ =>
      cases p₂ with | mk k₂ _d₂ =>
      simp only [List.map]
      have h12 : k₁ = k₂ := by
        have h1in2 : k₁ ∈ k₂ :: r₂.map Prod.fst := (hm k₁).mp (List.Mem.head _)
        have h2in1 : k₂ ∈ k₁ :: r₁.map Prod.fst := (hm k₂).mpr (List.Mem.head _)
        cases h1in2 with
        | head => rfl
        | tail _ h1r =>
          obtain ⟨q2, hq2, hq2k⟩ := (mem_map_iff Prod.fst r₂ k₁).mp h1r
          have hlt1 : mat5Lt k₂ k₁ = true := by rw [← hq2k]; exact hs₂.1 q2 hq2
          cases h2in1 with
          | head => rfl
          | tail _ h2r =>
            obtain ⟨q1, hq1, hq1k⟩ := (mem_map_iff Prod.fst r₁ k₂).mp h2r
            have hlt2 : mat5Lt k₁ k₂ = true := by rw [← hq1k]; exact hs₁.1 q1 hq1
            have hcontra := mat5Lt_trans k₁ k₂ k₁ hlt2 hlt1
            rw [mat5Lt_irrefl] at hcontra
            exact Bool.noConfusion hcontra
      rw [h12]
      apply congrArg (List.cons k₂)
      apply ih r₂ hs₁.2 hs₂.2
      intro k
      constructor
      · intro hk
        have hne : k ≠ k₂ := by
          obtain ⟨q1, hq1, hq1k⟩ := (mem_map_iff Prod.fst r₁ k).mp hk
          intro heq; have hlt := hs₁.1 q1 hq1
          rw [hq1k, heq, h12, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        have hin := (hm k).mp (List.Mem.tail k₁ hk)
        cases hin with
        | head => exact absurd rfl hne
        | tail _ h' => exact h'
      · intro hk
        have hne : k ≠ k₁ := by
          obtain ⟨q2, hq2, hq2k⟩ := (mem_map_iff Prod.fst r₂ k).mp hk
          intro heq; have hlt := hs₂.1 q2 hq2
          rw [hq2k, heq, h12, mat5Lt_irrefl] at hlt; exact Bool.noConfusion hlt
        have hin := (hm k).mpr (List.Mem.tail k₂ hk)
        cases hin with
        | head => exact absurd rfl hne
        | tail _ h' => exact h'

-- [helper]
theorem activeDocks_setDock_eq (c : HoneycombConfig) (g : Mat5) (d : FullDock)
    (hSame : d = v1FullDock ↔ c.lookup g = v1FullDock) :
    (c.setDock g d).activeDocks = c.activeDocks := by
  apply sortedEntries_map_fst_eq (c.setDock g d).entries c.entries (c.setDock g d).sorted c.sorted
  intro h
  change h ∈ (c.setDock g d).activeDocks ↔ h ∈ c.activeDocks
  rw [mem_activeDocks_iff, mem_activeDocks_iff, lookup_setDock]
  if hhg : h = g then
    rw [ite_eq_left hhg, hhg]
    exact ⟨fun hne h0 => hne (hSame.mpr h0), fun hne h0 => hne (hSame.mp h0)⟩
  else
    rw [ite_eq_right hhg]

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
    simp only [List.foldl]
    rw [ih (init.setDock k (f k))]
    if hkg : k = g then
      have hMem : memBool g (k :: rest) = true := by simp only [memBool, ite_eq_left hkg]
      rw [ite_eq_left hMem]
      cases hm : memBool g rest with
      | true => rw [ite_bool_true]
      | false => rw [ite_bool_false, lookup_setDock, ite_eq_left hkg.symm, hkg]
    else
      have hMem : memBool g (k :: rest) = memBool g rest := by simp only [memBool, ite_eq_right hkg]
      cases hm : memBool g rest with
      | true =>
        have hMemT : memBool g (k :: rest) = true := by rw [hMem, hm]
        rw [ite_bool_true, ite_eq_left hMemT]
      | false =>
        have hMemNe : memBool g (k :: rest) ≠ true := by rw [hMem, hm]; decide
        have hgk : g ≠ k := fun e => hkg e.symm
        rw [ite_bool_false, ite_eq_right hMemNe, lookup_setDock, ite_eq_right hgk]

private theorem lookup_ofSites (cand : List Mat5) (f : Mat5 → FullDock)
    (hvan : ∀ g : Mat5, g ∉ cand → f g = v1FullDock) (g : Mat5) :
    (ofSites cand f).lookup g = f g := by
  unfold ofSites
  rw [lookup_ofSites_foldl]
  cases hm : memBool g cand with
  | true => rfl
  | false =>
    change v1FullDock = f g
    refine (hvan g ?_).symm
    intro hmem
    have ht := (memBool_eq_true_iff g cand).mpr hmem
    rw [hm] at ht
    exact Bool.noConfusion ht

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
    simp only [fockSumInt]
    rw [h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]
    omega

-- [helper]
theorem fockSumInt_congr {α : Type} (xs : List α) (f g : α → Int)
    (h : ∀ x, x ∈ xs → f x = g x) : fockSumInt xs f = fockSumInt xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [fockSumInt]
    rw [h x (List.Mem.head rest), ih (fun y hy => h y (List.Mem.tail x hy))]

private theorem fockSumInt_add {α : Type} (xs : List α) (f g : α → Int) :
    fockSumInt xs (fun x => f x + g x) = fockSumInt xs f + fockSumInt xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [fockSumInt]; rw [ih]; omega

private theorem fockSumInt_swap {α β : Type} (xs : List α) (ys : List β) (f : α → β → Int) :
    fockSumInt xs (fun x => fockSumInt ys (fun y => f x y)) =
      fockSumInt ys (fun y => fockSumInt xs (fun x => f x y)) := by
  induction xs with
  | nil =>
    simp only [fockSumInt]
    exact (fockSumInt_zero_of_all_zero ys (fun _ => 0) (fun _ _ => rfl)).symm
  | cons x rest ih =>
    simp only [fockSumInt]
    rw [ih, ← fockSumInt_add]

-- [helper]
theorem fockSumInt_map {α β : Type} (xs : List α) (g : α → β) (f : β → Int) :
    fockSumInt (xs.map g) f = fockSumInt xs (fun x => f (g x)) := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [List.map, fockSumInt]; rw [ih]

-- [helper]
theorem fockSumInt_eraseOne {α : Type} [DecidableEq α] (a : α) (xs : List α) (f : α → Int)
    (hmem : a ∈ xs) :
    fockSumInt xs f = f a + fockSumInt (eraseOne a xs) f := by
  induction xs with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, fockSumInt]
    if hxa : x = a then
      rw [ite_eq_left hxa, hxa]
    else
      rw [ite_eq_right hxa]; simp only [fockSumInt]
      cases hmem with
      | head => exact absurd rfl hxa
      | tail _ h' => rw [ih h']; omega

-- [helper]
theorem fockSumInt_subset_eq {α : Type} [DecidableEq α] (s₁ s₂ : List α) (f : α → Int)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hsub : ∀ x, x ∈ s₁ → x ∈ s₂) (hvan : ∀ x, x ∈ s₂ → x ∉ s₁ → f x = 0) :
    fockSumInt s₁ f = fockSumInt s₂ f := by
  induction h1 generalizing s₂ with
  | nil =>
    simp only [fockSumInt]
    exact (fockSumInt_zero_of_all_zero s₂ f (fun x hx => hvan x hx (fun hm => nomatch hm))).symm
  | @cons a rest hnot _ ih =>
    rw [fockSumInt_eraseOne a s₂ f (hsub a (List.Mem.head rest))]
    simp only [fockSumInt]
    have hRest := ih (eraseOne a s₂) (isNodup_eraseOne a h2)
      (fun x hx => (mem_eraseOne_iff a x h2).mpr ⟨hsub x (List.Mem.tail a hx), fun hxa => by rw [hxa] at hx; exact hnot hx⟩)
      (fun x hx hxnot => by
        have ⟨hx2, hne⟩ := (mem_eraseOne_iff a x h2).mp hx
        refine hvan x hx2 (fun hm => match hm with | List.Mem.head _ => hne rfl | List.Mem.tail _ h' => hxnot h'))
    rw [hRest]

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
    intro xs
    induction xs with
    | nil => intro init; simp only [List.foldl, fockSumInt]; omega
    | cons x rest ih =>
      intro init
      simp only [List.foldl, fockSumInt]
      rw [ih (init + (d x).charge)]
      omega
  rw [hAux (List.finRange 24) 0]
  omega

private theorem fullDockCharge_v1 : fullDockCharge v1FullDock = 0 := by decide

/-- Exact total integer charge `Q(c) = ∑_{g ∈ activeDocks c} fullDockCharge (c.lookup g)`. -/
def totalCharge (c : HoneycombConfig) : Int :=
  fockSumInt c.activeDocks (fun g => fullDockCharge (c.lookup g))

private theorem totalCharge_eq_over_superset (c : HoneycombConfig) (V : List Mat5)
    (hnd : IsNodup V) (hsub : ∀ g, g ∈ c.activeDocks → g ∈ V) :
    totalCharge c = fockSumInt V (fun g => fullDockCharge (c.lookup g)) := by
  unfold totalCharge
  refine fockSumInt_subset_eq c.activeDocks V (fun g => fullDockCharge (c.lookup g))
    (activeDocks_nodup c) hnd hsub ?_
  intro g _ hgNot
  have hEmpty : c.lookup g = v1FullDock := by
    if h : c.lookup g = v1FullDock then exact h
    else exact absurd ((mem_activeDocks_iff c g).mpr h) hgNot
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
  apply fockSumInt_congr
  intro x _
  rw [lookup_setDock]
  if hxg : x = g then rw [ite_eq_left hxg, hxg, hSame] else rw [ite_eq_right hxg]

/-! ### Exact Global Configuration Maps (`S`, `S⁻¹`, `R`, `C`, `P`, `CP`) on Infinite `{3,4,3,4}` -/

-- [helper]
theorem transport_inv_left (a : Fin 24) :
    mat5Mul (transport (oppSlot a)) (transport a) = mat5Id := by
  have h := thm_coxeter_transport_antipodal_inverse.2 (oppSlot a)
  rw [(thm_24_facets_geometry.2.1 a).1] at h
  exact h

private theorem transport_inv_right (a : Fin 24) :
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
theorem mem_finRange24 (a : Fin 24) : a ∈ List.finRange 24 := by
  have h24 : ∀ x : Fin 24, memBool x (List.finRange 24) = true := by decide
  exact (memBool_eq_true_iff a (List.finRange 24)).mp (h24 a)

-- [helper]
theorem finRange24_nodup : IsNodup (List.finRange 24) :=
  isNodup_of_bool (List.finRange 24) (by decide)

-- [helper]
theorem exists_nonempty_of_ne_v1 (d : FullDock) (hne : d ≠ v1FullDock) :
    ∃ a : Fin 24, d a ≠ .empty := by
  have hAll : Decidable (∀ a : Fin 24, d a = .empty) := decEqFinAux 24 d v1FullDock
  cases hAll with
  | isTrue hall => exact absurd (funext hall) hne
  | isFalse hnot =>
    have findIdx : ∀ (xs : List (Fin 24)), (∃ a, a ∈ xs ∧ d a ≠ .empty) ∨ (∀ a, a ∈ xs → d a = .empty) := by
      intro xs
      induction xs with
      | nil => exact Or.inr (fun _ h => nomatch h)
      | cons x rest ih =>
        if hx : d x = .empty then
          rcases ih with ⟨a, ha, hda⟩ | hall
          · exact Or.inl ⟨a, List.Mem.tail x ha, hda⟩
          · exact Or.inr (fun a ha => match ha with | List.Mem.head _ => hx | List.Mem.tail _ h' => hall a h')
        else
          exact Or.inl ⟨x, List.Mem.head rest, hx⟩
    rcases findIdx (List.finRange 24) with ⟨a, _, hda⟩ | hall
    · exact ⟨a, hda⟩
    · exact absurd (fun a => hall a (mem_finRange24 a)) hnot

private theorem lookup_streamConfig (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (streamConfig c).lookup g a = c.lookup (mat5Mul g (transport (oppSlot a))) a := by
  unfold streamConfig
  have hvan : ∀ x : Mat5,
      x ∉ flatMapList (fun k => (List.finRange 24).map (fun b => mat5Mul k (transport b))) c.activeDocks →
      (fun b => c.lookup (mat5Mul x (transport (oppSlot b))) b) = v1FullDock := by
    intro x hx
    funext b
    if hb : c.lookup (mat5Mul x (transport (oppSlot b))) b = .empty then
      exact hb
    else
      have hneDock : c.lookup (mat5Mul x (transport (oppSlot b))) ≠ v1FullDock :=
        fun h0 => hb (congrFun h0 b)
      have hAct : mat5Mul x (transport (oppSlot b)) ∈ c.activeDocks :=
        (mem_activeDocks_iff c _).mpr hneDock
      have hBack : mat5Mul (mat5Mul x (transport (oppSlot b))) (transport b) = x := by
        rw [fb_mat5Mul_assoc, transport_inv_left b, fb_mat5Mul_id_right]
      have hIn : x ∈ flatMapList (fun k => (List.finRange 24).map (fun s => mat5Mul k (transport s))) c.activeDocks :=
        (mem_flatMapList_iff _ _ x).mpr
          ⟨mat5Mul x (transport (oppSlot b)), hAct,
           (mem_map_iff _ _ x).mpr ⟨b, mem_finRange24 b, hBack⟩⟩
      exact absurd hIn hx
  exact congrFun (lookup_ofSites _ _ hvan g) a

-- [helper]
theorem lookup_streamConfigInv (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (streamConfigInv c).lookup g a = c.lookup (mat5Mul g (transport a)) a := by
  unfold streamConfigInv
  have hvan : ∀ x : Mat5,
      x ∉ flatMapList (fun k => (List.finRange 24).map (fun b => mat5Mul k (transport (oppSlot b)))) c.activeDocks →
      (fun b => c.lookup (mat5Mul x (transport b)) b) = v1FullDock := by
    intro x hx
    funext b
    if hb : c.lookup (mat5Mul x (transport b)) b = .empty then
      exact hb
    else
      have hneDock : c.lookup (mat5Mul x (transport b)) ≠ v1FullDock :=
        fun h0 => hb (congrFun h0 b)
      have hAct : mat5Mul x (transport b) ∈ c.activeDocks :=
        (mem_activeDocks_iff c _).mpr hneDock
      have hBack : mat5Mul (mat5Mul x (transport b)) (transport (oppSlot b)) = x := by
        rw [fb_mat5Mul_assoc, transport_inv_right b, fb_mat5Mul_id_right]
      have hIn : x ∈ flatMapList (fun k => (List.finRange 24).map (fun s => mat5Mul k (transport (oppSlot s)))) c.activeDocks :=
        (mem_flatMapList_iff _ _ x).mpr
          ⟨mat5Mul x (transport b), hAct,
           (mem_map_iff _ _ x).mpr ⟨b, mem_finRange24 b, hBack⟩⟩
      exact absurd hIn hx
  exact congrFun (lookup_ofSites _ _ hvan g) a

-- [helper]
theorem lookup_revConfig (c : HoneycombConfig) (g : Mat5) :
    (revConfig c).lookup g = revFullDock (c.lookup g) := by
  unfold revConfig
  refine lookup_ofSites c.activeDocks (fun x => revFullDock (c.lookup x)) ?_ g
  intro x hx
  have h0 : c.lookup x = v1FullDock := by
    if h : c.lookup x = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c x).mpr h) hx
  rw [h0]; rfl

-- [helper]
theorem lookup_conjConfig (c : HoneycombConfig) (g : Mat5) :
    (conjConfig c).lookup g = conjFullDock (c.lookup g) := by
  unfold conjConfig
  refine lookup_ofSites c.activeDocks (fun x => conjFullDock (c.lookup x)) ?_ g
  intro x hx
  have h0 : c.lookup x = v1FullDock := by
    if h : c.lookup x = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c x).mpr h) hx
  rw [h0]; rfl

-- [helper]
theorem lookup_parityConfig (c : HoneycombConfig) (g : Mat5) :
    (parityConfig c).lookup g = parityFullDock (c.lookup (conjMatP g)) := by
  unfold parityConfig
  refine lookup_ofSites (c.activeDocks.map conjMatP) (fun x => parityFullDock (c.lookup (conjMatP x))) ?_ g
  intro x hx
  have h0 : c.lookup (conjMatP x) = v1FullDock := by
    if h : c.lookup (conjMatP x) = v1FullDock then exact h
    else
      have hIn := (mem_activeDocks_iff c (conjMatP x)).mpr h
      exact absurd ((mem_map_iff conjMatP c.activeDocks x).mpr ⟨conjMatP x, hIn, conjMatP_involutive x⟩) hx
  rw [h0]; rfl

-- [helper]
theorem lookup_cpConfig (c : HoneycombConfig) (g : Mat5) :
    (cpConfig c).lookup g = cpFullDock (c.lookup (conjMatP g)) := by
  unfold cpConfig cpFullDock
  rw [lookup_conjConfig, lookup_parityConfig]

-- [helper]
theorem activeDocks_revConfig (c : HoneycombConfig) :
    (revConfig c).activeDocks = c.activeDocks := by
  apply sortedEntries_map_fst_eq (revConfig c).entries c.entries (revConfig c).sorted c.sorted
  intro g
  change g ∈ (revConfig c).activeDocks ↔ g ∈ c.activeDocks
  rw [mem_activeDocks_iff, mem_activeDocks_iff, lookup_revConfig]
  constructor
  · intro hne h0; exact hne (by rw [h0]; rfl)
  · intro hne h0
    apply hne; funext a
    have := congrFun h0 (oppSlot a)
    unfold revFullDock at this
    rw [(thm_24_facets_geometry.2.1 a).1] at this
    exact this

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
    dsimp only
    rw [conjMatP_involutive, (line_geom_facts.2.2.2.2.1 a).1, slotState_dual_dual]
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
    dsimp only
    rw [(line_geom_facts.2.2.2.2.1 a).2]
  have hSv1 : streamConfig v1Config = v1Config := by
    apply honeycombConfig_ext; intro g; funext a
    rw [lookup_streamConfig]; rfl
  have hQv1 : totalCharge v1Config = 0 := rfl
  have hQS : totalCharge (streamConfig c) = totalCharge c := by
    unfold totalCharge
    have hLHS : fockSumInt (streamConfig c).activeDocks (fun g => fullDockCharge ((streamConfig c).lookup g)) =
        fockSumInt (List.finRange 24) (fun a =>
          fockSumInt (streamConfig c).activeDocks (fun g => ((streamConfig c).lookup g a).charge)) := by
      have h1 : (fun g => fullDockCharge ((streamConfig c).lookup g)) =
          (fun g => fockSumInt (List.finRange 24) (fun a => ((streamConfig c).lookup g a).charge)) :=
        funext (fun g => fullDockCharge_eq_fockSumInt _)
      rw [h1, fockSumInt_swap]
    have hRHS : fockSumInt c.activeDocks (fun g => fullDockCharge (c.lookup g)) =
        fockSumInt (List.finRange 24) (fun a =>
          fockSumInt c.activeDocks (fun g => (c.lookup g a).charge)) := by
      have h1 : (fun g => fullDockCharge (c.lookup g)) =
          (fun g => fockSumInt (List.finRange 24) (fun a => (c.lookup g a).charge)) :=
        funext (fun g => fullDockCharge_eq_fockSumInt _)
      rw [h1, fockSumInt_swap]
    rw [hLHS, hRHS]
    apply fockSumInt_congr
    intro a _
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
        have h0 : (streamConfig c).lookup g = v1FullDock := by
          if h : (streamConfig c).lookup g = v1FullDock then exact h
          else exact absurd ((mem_activeDocks_iff _ g).mpr h) hg
        rw [h0]; rfl
      · intro g hg
        rw [lookup_streamConfig]
        have h0 : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock := by
          if h : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock then exact h
          else
            have hAct := (mem_activeDocks_iff c _).mpr h
            have hBack : mat5Mul (mat5Mul g (transport (oppSlot a))) (transport a) = g := by
              rw [fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
            exact absurd ((mem_map_iff _ _ g).mpr ⟨_, hAct, hBack⟩) hg
        rw [h0]; rfl
    rw [hEqS, fockSumInt_map]
    apply fockSumInt_congr
    intro g _
    rw [lookup_streamConfig, fb_mat5Mul_assoc, transport_inv_right a, fb_mat5Mul_id_right]
  exact ⟨hS1, hS2, hR2, hSRS, hC2, hP2, hCP2, hCPS, hCPR, hSv1, hQv1, hQS⟩

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
