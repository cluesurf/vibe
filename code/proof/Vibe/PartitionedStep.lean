import Vibe.PairRules

/-!
# Vibe Theory: The Partitioned Global Step

A configuration on `n` cells is a map `Fin n → Tone`. A block is a list of pairs of cells; the
partitioned step applies a pair map `f : Pair → Pair` to each listed pair in turn. When the pairs are
disjoint (all endpoints distinct, the matching of one color class of a schedule) and `f` is a
bijection with inverse `g`, the global step is a bijection whose inverse is the same block with
`g`, it conserves the total charge `Q` (and `D` when `f` conserves `D`), and it commutes with global
negation when `f` commutes with pair negation (`thm_cf_partitioned_block_global_invariants`). Every one
of the 24 conservative reversible pair rules qualifies (`thm_cf_partitioned_rule_step_bijective`).

Core Lean only, zero `sorry`, zero `axiom`, zero `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

/-- Apply the pair map `f` to the cells `e.1, e.2` of configuration `x`. -/
def psApplyPair {n : Nat} (f : Pair → Pair) (e : Fin n × Fin n) (x : Fin n → Tone) :
    Fin n → Tone :=
  fun k => if k = e.1 then (f (x e.1, x e.2)).1 else if k = e.2 then (f (x e.1, x e.2)).2 else x k

/-- The partitioned step: apply `f` to every pair of the block, in list order. -/
def psBlock {n : Nat} (f : Pair → Pair) (es : List (Fin n × Fin n)) (x : Fin n → Tone) :
    Fin n → Tone :=
  es.foldl (fun y e => psApplyPair f e y) x

/-- All endpoints of a block. -/
def psEndpoints {n : Nat} (es : List (Fin n × Fin n)) : List (Fin n) :=
  es.flatMap fun e => [e.1, e.2]

/-- A block is disjoint when its endpoints are pairwise distinct (a matching). -/
def PsDisjoint {n : Nat} (es : List (Fin n × Fin n)) : Prop := (psEndpoints es).Nodup

/-- The sum of a tone weight `w` over all cells (`Q` for `w = value`, `D` for `w = value^2`). -/
def psTotal {n : Nat} (w : Tone → Int) (x : Fin n → Tone) : Int :=
  ((List.finRange n).map fun k => w (x k)).sum

/-- Global negation. -/
def psNegate {n : Nat} (x : Fin n → Tone) : Fin n → Tone := fun k => (x k).dual

/-- Square tone weight, so that `psTotal psSq` is `D`. -/
def psSq (t : Tone) : Int := t.value * t.value

/-! ## One pair -/

private theorem ps_apply_fst {n : Nat} (f : Pair → Pair) (e : Fin n × Fin n) (x : Fin n → Tone) :
    psApplyPair f e x e.1 = (f (x e.1, x e.2)).1 := by
  simp only [psApplyPair, ↓reduceIte]

private theorem ps_apply_snd {n : Nat} (f : Pair → Pair) (e : Fin n × Fin n) (x : Fin n → Tone)
    (h : e.1 ≠ e.2) : psApplyPair f e x e.2 = (f (x e.1, x e.2)).2 := by
  have h' : e.2 ≠ e.1 := Ne.symm h
  simp only [psApplyPair, h', ↓reduceIte]

private theorem ps_apply_other {n : Nat} (f : Pair → Pair) (e : Fin n × Fin n) (x : Fin n → Tone)
    (k : Fin n) (h1 : k ≠ e.1) (h2 : k ≠ e.2) : psApplyPair f e x k = x k := by
  simp only [psApplyPair, h1, h2, ↓reduceIte]

private theorem ps_apply_inv {n : Nat} (f g : Pair → Pair) (hgf : ∀ p, g (f p) = p)
    (e : Fin n × Fin n) (h : e.1 ≠ e.2) (x : Fin n → Tone) :
    psApplyPair g e (psApplyPair f e x) = x := by
  funext k
  have hval : g (psApplyPair f e x e.1, psApplyPair f e x e.2) = (x e.1, x e.2) := by
    rw [ps_apply_fst, ps_apply_snd f e x h, hgf]
  by_cases h1 : k = e.1
  · subst h1
    rw [ps_apply_fst, hval]
  · by_cases h2 : k = e.2
    · subst h2
      rw [ps_apply_snd g e _ h, hval]
    · rw [ps_apply_other g e _ k h1 h2, ps_apply_other f e x k h1 h2]

private theorem ps_apply_comm {n : Nat} (f f' : Pair → Pair) (e d : Fin n × Fin n)
    (h11 : e.1 ≠ d.1) (h12 : e.1 ≠ d.2) (h21 : e.2 ≠ d.1) (h22 : e.2 ≠ d.2)
    (x : Fin n → Tone) :
    psApplyPair f e (psApplyPair f' d x) = psApplyPair f' d (psApplyPair f e x) := by
  have de1 : psApplyPair f' d x e.1 = x e.1 := ps_apply_other f' d x e.1 h11 h12
  have de2 : psApplyPair f' d x e.2 = x e.2 := ps_apply_other f' d x e.2 h21 h22
  have ed1 : psApplyPair f e x d.1 = x d.1 :=
    ps_apply_other f e x d.1 (Ne.symm h11) (Ne.symm h21)
  have ed2 : psApplyPair f e x d.2 = x d.2 :=
    ps_apply_other f e x d.2 (Ne.symm h12) (Ne.symm h22)
  funext k
  simp only [psApplyPair] at de1 de2 ed1 ed2 ⊢
  rw [de1, de2, ed1, ed2]
  by_cases k1 : k = e.1
  · subst k1
    simp only [h11, h12, ↓reduceIte]
  · by_cases k2 : k = e.2
    · subst k2
      simp only [k1, h21, h22, ↓reduceIte]
    · simp only [k1, k2, ↓reduceIte]

private theorem ps_sum_perturb {n : Nat} (L : List (Fin n)) (a b : Fin n → Int) (i j : Fin n)
    (hij : i ≠ j) (h : ∀ k, k ≠ i → k ≠ j → b k = a k) :
    (L.map b).sum = (L.map a).sum + (L.count i : Int) * (b i - a i) +
      (L.count j : Int) * (b j - a j) := by
  induction L with
  | nil => simp
  | cons k rest ih =>
    simp only [List.map_cons, List.sum_cons, List.count_cons, ih]
    by_cases ki : k = i
    · subst ki
      have hne : (k == j) = false := by simp [hij]
      simp only [beq_self_eq_true, hne, Bool.false_eq_true, ↓reduceIte, Nat.add_zero]
      rw [Int.natCast_add, Int.add_mul]
      omega
    · by_cases kj : k = j
      · subst kj
        have hne : (k == i) = false := by simp [ki]
        simp only [beq_self_eq_true, hne, Bool.false_eq_true, ↓reduceIte, Nat.add_zero]
        rw [Int.natCast_add, Int.add_mul]
        omega
      · have hne1 : (k == i) = false := by simp [ki]
        have hne2 : (k == j) = false := by simp [kj]
        simp only [hne1, hne2, Bool.false_eq_true, ↓reduceIte, Nat.add_zero, h k ki kj]
        omega

private theorem ps_apply_total {n : Nat} (w : Tone → Int) (f : Pair → Pair)
    (hw : ∀ p, w (f p).1 + w (f p).2 = w p.1 + w p.2)
    (e : Fin n × Fin n) (h : e.1 ≠ e.2) (x : Fin n → Tone) :
    psTotal w (psApplyPair f e x) = psTotal w x := by
  unfold psTotal
  rw [ps_sum_perturb (List.finRange n) (fun k => w (x k)) (fun k => w (psApplyPair f e x k))
    e.1 e.2 h (fun k h1 h2 => by simp only [ps_apply_other f e x k h1 h2])]
  rw [(List.nodup_finRange n).count_of_mem (List.mem_finRange e.1),
    (List.nodup_finRange n).count_of_mem (List.mem_finRange e.2)]
  have hs : w (f (x e.1, x e.2)).1 + w (f (x e.1, x e.2)).2 = w (x e.1) + w (x e.2) :=
    hw (x e.1, x e.2)
  rw [ps_apply_fst, ps_apply_snd f e x h]
  omega

private theorem ps_apply_negate {n : Nat} (f : Pair → Pair) (hC : ∀ p, f (prNeg p) = prNeg (f p))
    (e : Fin n × Fin n) (x : Fin n → Tone) :
    psApplyPair f e (psNegate x) = psNegate (psApplyPair f e x) := by
  have hv : f ((psNegate x) e.1, (psNegate x) e.2) =
      ((f (x e.1, x e.2)).1.dual, (f (x e.1, x e.2)).2.dual) := hC (x e.1, x e.2)
  funext k
  simp only [psApplyPair, psNegate] at hv ⊢
  rw [hv]
  by_cases k1 : k = e.1
  · simp only [k1, ↓reduceIte]
  · by_cases k2 : k = e.2
    · subst k2
      simp only [k1, ↓reduceIte]
    · simp only [k1, k2, ↓reduceIte]

/-! ## The block -/

private theorem ps_disjoint_cons {n : Nat} (e : Fin n × Fin n) (es : List (Fin n × Fin n))
    (h : PsDisjoint (e :: es)) :
    e.1 ≠ e.2 ∧ PsDisjoint es ∧
      ∀ d ∈ es, e.1 ≠ d.1 ∧ e.1 ≠ d.2 ∧ e.2 ≠ d.1 ∧ e.2 ≠ d.2 := by
  unfold PsDisjoint psEndpoints at h
  rw [List.flatMap_cons] at h
  simp only [List.cons_append, List.nil_append, List.nodup_cons, List.mem_cons,
    List.mem_flatMap, not_or, not_exists, not_and] at h
  obtain ⟨⟨hne, h1⟩, h2, h3⟩ := h
  refine ⟨hne, h3, ?_⟩
  intro d hd
  have m1 := h1 d hd
  have m2 := h2 d hd
  refine ⟨fun c => ?_, fun c => ?_, fun c => ?_, fun c => ?_⟩ <;> simp [c] at m1 m2

private theorem ps_block_cons {n : Nat} (f : Pair → Pair) (e : Fin n × Fin n)
    (es : List (Fin n × Fin n)) (x : Fin n → Tone) :
    psBlock f (e :: es) x = psBlock f es (psApplyPair f e x) := rfl

private theorem ps_block_append_single {n : Nat} (f : Pair → Pair) (e : Fin n × Fin n)
    (es : List (Fin n × Fin n)) (x : Fin n → Tone) :
    psBlock f (es ++ [e]) x = psApplyPair f e (psBlock f es x) := by
  unfold psBlock
  rw [List.foldl_append]
  rfl

private theorem ps_block_pull {n : Nat} (f : Pair → Pair) (e : Fin n × Fin n)
    (es : List (Fin n × Fin n))
    (hd : ∀ d ∈ es, e.1 ≠ d.1 ∧ e.1 ≠ d.2 ∧ e.2 ≠ d.1 ∧ e.2 ≠ d.2) (x : Fin n → Tone) :
    psApplyPair f e (psBlock f es x) = psBlock f es (psApplyPair f e x) := by
  induction es generalizing x with
  | nil => rfl
  | cons d rest ih =>
    rw [ps_block_cons, ps_block_cons]
    have hdd := hd d List.mem_cons_self
    rw [ih (fun d' hd' => hd d' (List.mem_cons_of_mem d hd')),
      ps_apply_comm f f e d hdd.1 hdd.2.1 hdd.2.2.1 hdd.2.2.2]

private theorem ps_block_reverse {n : Nat} (f : Pair → Pair) (es : List (Fin n × Fin n))
    (h : PsDisjoint es) (x : Fin n → Tone) : psBlock f es.reverse x = psBlock f es x := by
  induction es generalizing x with
  | nil => rfl
  | cons e rest ih =>
    obtain ⟨_, hr, hd⟩ := ps_disjoint_cons e rest h
    rw [List.reverse_cons, ps_block_append_single, ih hr, ps_block_pull f e rest hd, ps_block_cons]

private theorem ps_block_inv_rev {n : Nat} (f g : Pair → Pair) (hgf : ∀ p, g (f p) = p)
    (es : List (Fin n × Fin n)) (h : ∀ e ∈ es, e.1 ≠ e.2) (x : Fin n → Tone) :
    psBlock g es.reverse (psBlock f es x) = x := by
  induction es generalizing x with
  | nil => rfl
  | cons e rest ih =>
    rw [List.reverse_cons, ps_block_append_single, ps_block_cons,
      ih (fun d hd => h d (List.mem_cons_of_mem e hd)),
      ps_apply_inv f g hgf e (h e List.mem_cons_self)]

private theorem ps_disjoint_ne {n : Nat} (es : List (Fin n × Fin n)) (h : PsDisjoint es) :
    ∀ e ∈ es, e.1 ≠ e.2 := by
  induction es with
  | nil => intro e he; exact absurd he List.not_mem_nil
  | cons d rest ih =>
    obtain ⟨hne, hr, _⟩ := ps_disjoint_cons d rest h
    intro e he
    rcases List.mem_cons.1 he with h1 | h1
    · subst h1; exact hne
    · exact ih hr e h1

private theorem ps_block_total {n : Nat} (w : Tone → Int) (f : Pair → Pair)
    (hw : ∀ p, w (f p).1 + w (f p).2 = w p.1 + w p.2)
    (es : List (Fin n × Fin n)) (h : ∀ e ∈ es, e.1 ≠ e.2) (x : Fin n → Tone) :
    psTotal w (psBlock f es x) = psTotal w x := by
  induction es generalizing x with
  | nil => rfl
  | cons e rest ih =>
    rw [ps_block_cons, ih (fun d hd => h d (List.mem_cons_of_mem e hd)),
      ps_apply_total w f hw e (h e List.mem_cons_self)]

private theorem ps_block_negate {n : Nat} (f : Pair → Pair) (hC : ∀ p, f (prNeg p) = prNeg (f p))
    (es : List (Fin n × Fin n)) (x : Fin n → Tone) :
    psBlock f es (psNegate x) = psNegate (psBlock f es x) := by
  induction es generalizing x with
  | nil => rfl
  | cons e rest ih =>
    rw [ps_block_cons, ps_block_cons, ps_apply_negate f hC, ih]

/-- The partitioned global step. For any block of disjoint pairs on `Fin n` and any bijective
    sum-preserving pair map `f` with inverse `g`: the global step is a bijection whose explicit
    inverse is the same block with `g` (in either order), it conserves the total charge `Q`, it
    conserves `D` when `f` does, and it commutes with global negation when `f` commutes with pair
    negation. -/
theorem thm_cf_partitioned_block_global_invariants {n : Nat} (es : List (Fin n × Fin n))
    (hD : PsDisjoint es) (f g : Pair → Pair) (hgf : ∀ p, g (f p) = p) (hfg : ∀ p, f (g p) = p)
    (hQ : PrSumPres f) :
    (∀ x, psBlock g es (psBlock f es x) = x) ∧
    (∀ x, psBlock f es (psBlock g es x) = x) ∧
    (∀ x, psBlock g es.reverse (psBlock f es x) = x) ∧
    (∀ x, psTotal Tone.value (psBlock f es x) = psTotal Tone.value x) ∧
    (PrDCons f → ∀ x, psTotal psSq (psBlock f es x) = psTotal psSq x) ∧
    ((∀ p, f (prNeg p) = prNeg (f p)) → ∀ x, psBlock f es (psNegate x) = psNegate (psBlock f es x)) := by
  have hne := ps_disjoint_ne es hD
  refine ⟨?_, ?_, ps_block_inv_rev f g hgf es hne, ?_, ?_, fun hC => ps_block_negate f hC es⟩
  · intro x
    rw [← ps_block_reverse g es hD]
    exact ps_block_inv_rev f g hgf es hne x
  · intro x
    rw [← ps_block_reverse f es hD]
    exact ps_block_inv_rev g f hfg es hne x
  · exact ps_block_total Tone.value f (fun p => hQ p) es hne
  · intro hDc
    exact ps_block_total psSq f (fun p => hDc p) es hne

/-- Every one of the 24 conservative reversible pair rules gives a bijective, charge-conserving
    partitioned step on any disjoint block, with an explicit inverse that is again one of the 24. -/
theorem thm_cf_partitioned_rule_step_bijective {n : Nat} (es : List (Fin n × Fin n))
    (hD : PsDisjoint es) (B : Pair → Pair) (hS : PrSumPres B) (hI : PrInj B) :
    ∃ g : Pair → Pair, PrSumPres g ∧ PrInj g ∧
      (∀ x, psBlock g es (psBlock B es x) = x) ∧ (∀ x, psBlock B es (psBlock g es x) = x) ∧
      (∀ x, psTotal Tone.value (psBlock B es x) = psTotal Tone.value x) := by
  obtain ⟨g, hgS, hgI, hgf, hfg⟩ := thm_pair_rule_inverse B hS hI
  obtain ⟨h1, h2, _, h4, _, _⟩ :=
    thm_cf_partitioned_block_global_invariants es hD B g hgf hfg hS
  exact ⟨g, hgS, hgI, h1, h2, h4⟩

end Vibe
