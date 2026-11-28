/-!
# Vibe Theory: No Global Contraction under a Reversible Step

A reversible update of a closed box is a bijection of a finite set of configurations. Give that set
any metric. This module proves that such a bijection is never a strict GLOBAL contraction: some
pair of distinct points keeps (or grows) its distance. That rules out one map pulling every pair of
configurations closer at once. It does not rule out local attraction of a basin (some pairs
shrinking while others grow), and the metric and injectivity hypotheses of the headline theorem are
not used. The stronger fact for memory, that a bijection of a finite set has f^k = id for some
k > 0, so no pair's distance tends to 0, is not proved here (M1 audit, minor 2).

The proof is the maximal-pair argument. Take a pair `(a, b)` of distinct points whose distance is
maximal. Surjectivity gives preimages `a'`, `b'`, which are distinct, and a strict contraction would
make `d a b = d (f a') (f b') < d a' b'`, beating the maximum.

1. `ms_exists_maximal` (private): over any list, any strict partial order on the values has a
   maximal element among the entries meeting a predicate.
2. `thm_ms_no_strict_contraction_of_surjective`: the argument for any irreflexive, transitive
   relation on the values of any distance function. No metric axiom is used, and only surjectivity.
3. `thm_ms_reversible_no_global_contraction`: the headline, for an integer metric on `Fin n` with
   `n ≥ 2` and a bijection.
4. `thm_ms_reversible_some_pair_not_shrunk`: the same, stated as a witness pair with
   `d x y ≤ d (f x) (f y)`.

Core only: no Mathlib, no `sorry`, no `axiom`, no `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

/-- A metric on `Fin n` with integer values and the usual axioms. -/
structure MsFinMetric {n : Nat} (d : Fin n → Fin n → Int) : Prop where
  self_zero : ∀ x, d x x = 0
  pos_of_ne : ∀ x y, x ≠ y → 0 < d x y
  symm : ∀ x y, d x y = d y x
  triangle : ∀ x y z, d x z ≤ d x y + d y z

/-- Every ordered pair of `Fin n`. -/
def msPairs (n : Nat) : List (Fin n × Fin n) :=
  (List.finRange n).flatMap (fun x => (List.finRange n).map (fun y => (x, y)))

private theorem ms_mem_pairs {n : Nat} (p : Fin n × Fin n) : p ∈ msPairs n := by
  cases p with
  | mk x y =>
    simp only [msPairs, List.mem_flatMap, List.mem_map, List.mem_finRange, true_and]
    exact ⟨x, y, rfl⟩

private theorem ms_exists_maximal {α β : Type} (r : α → α → Prop)
    (irr : ∀ a, ¬ r a a) (tr : ∀ a b c, r a b → r b c → r a c)
    (g : β → α) (P : β → Prop) (l : List β) (h : ∃ b, b ∈ l ∧ P b) :
    ∃ m, m ∈ l ∧ P m ∧ ∀ y, y ∈ l → P y → ¬ r (g m) (g y) := by
  induction l with
  | nil =>
    obtain ⟨b, hb, _⟩ := h
    exact absurd hb List.not_mem_nil
  | cons x t ih =>
    by_cases ht : ∃ b, b ∈ t ∧ P b
    · obtain ⟨m, hm, hPm, hmax⟩ := ih ht
      by_cases hx : P x ∧ r (g m) (g x)
      · refine ⟨x, List.mem_cons_self, hx.1, ?_⟩
        intro y hy hPy hxy
        rcases List.mem_cons.mp hy with hyx | hy'
        · subst hyx
          exact irr _ hxy
        · exact hmax y hy' hPy (tr _ _ _ hx.2 hxy)
      · refine ⟨m, List.mem_cons_of_mem _ hm, hPm, ?_⟩
        intro y hy hPy hmy
        rcases List.mem_cons.mp hy with hyx | hy'
        · subst hyx
          exact hx ⟨hPy, hmy⟩
        · exact hmax y hy' hPy hmy
    · obtain ⟨b, hb, hPb⟩ := h
      have hPx : P x := by
        rcases List.mem_cons.mp hb with hbx | hb'
        · subst hbx
          exact hPb
        · exact absurd ⟨b, hb', hPb⟩ ht
      refine ⟨x, List.mem_cons_self, hPx, ?_⟩
      intro y hy hPy hxy
      rcases List.mem_cons.mp hy with hyx | hy'
      · subst hyx
        exact irr _ hxy
      · exact ht ⟨y, hy', hPy⟩

/-- The maximal-pair argument in full generality: on a finite set with at least two points, no
    surjective map shrinks every distinct pair under any strict partial order on the distance
    values. No metric axiom is needed. -/
theorem thm_ms_no_strict_contraction_of_surjective {n : Nat} {α : Type}
    (r : α → α → Prop) (irr : ∀ a, ¬ r a a) (tr : ∀ a b c, r a b → r b c → r a c)
    (d : Fin n → Fin n → α) (f : Fin n → Fin n) (hsurj : ∀ y, ∃ x, f x = y)
    (a b : Fin n) (hab : a ≠ b) :
    ¬ ∀ x y, x ≠ y → r (d (f x) (f y)) (d x y) := by
  intro hc
  obtain ⟨m, _, hPm, hmax⟩ :=
    ms_exists_maximal r irr tr (fun p : Fin n × Fin n => d p.1 p.2)
      (fun p => p.1 ≠ p.2) (msPairs n) ⟨(a, b), ms_mem_pairs _, hab⟩
  obtain ⟨a', ha'⟩ := hsurj m.1
  obtain ⟨b', hb'⟩ := hsurj m.2
  have hne : a' ≠ b' := by
    intro heq
    apply hPm
    rw [← ha', ← hb', heq]
  have hlt := hc a' b' hne
  rw [ha', hb'] at hlt
  exact hmax (a', b') (ms_mem_pairs _) hne hlt

/-- No bijection of a finite metric space with at least 2 points is a strict contraction: a
    reversible step of a closed box cannot pull every pair of configurations closer at once. Local
    attraction of a basin is not excluded by this statement. -/
theorem thm_ms_reversible_no_global_contraction {n : Nat} (hn : 2 ≤ n)
    (d : Fin n → Fin n → Int) (_hd : MsFinMetric d)
    (f : Fin n → Fin n) (_hinj : ∀ x y, f x = f y → x = y) (hsurj : ∀ y, ∃ x, f x = y) :
    ¬ ∀ x y, x ≠ y → d (f x) (f y) < d x y := by
  have h0 : 0 < n := by omega
  have h1 : 1 < n := by omega
  have hab : (⟨0, h0⟩ : Fin n) ≠ ⟨1, h1⟩ := by
    intro h
    have hv := congrArg Fin.val h
    simp at hv
  exact thm_ms_no_strict_contraction_of_surjective (fun u v : Int => u < v)
    (fun u => Int.lt_irrefl u) (fun _ _ _ huv hvw => Int.lt_trans huv hvw)
    d f hsurj ⟨0, h0⟩ ⟨1, h1⟩ hab

/-- The witness form: under a bijection of a finite metric space with at least 2 points, some pair
    of distinct points is not brought closer. -/
theorem thm_ms_reversible_some_pair_not_shrunk {n : Nat} (hn : 2 ≤ n)
    (d : Fin n → Fin n → Int) (hd : MsFinMetric d)
    (f : Fin n → Fin n) (hinj : ∀ x y, f x = f y → x = y) (hsurj : ∀ y, ∃ x, f x = y) :
    ∃ x y, x ≠ y ∧ d x y ≤ d (f x) (f y) := by
  have hno := thm_ms_reversible_no_global_contraction hn d hd f hinj hsurj
  apply Classical.byContradiction
  intro hnone
  apply hno
  intro x y hxy
  apply Int.lt_of_not_ge
  intro hle
  exact hnone ⟨x, y, hxy, hle⟩

end Vibe
