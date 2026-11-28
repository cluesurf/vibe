module

public import Mathlib.Logic.Relation
public import Mathlib.Data.ZMod.Basic
public import Mathlib.Data.Fintype.Card
public import Mathlib.Data.Rat.Defs
public import Mathlib.Algebra.BigOperators.Group.Finset.Basic
public import Vibe.StandardModelMathlib
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.NormNum

/-!
# Vibe Theory: Bug-Fixed Logic of Emergence & Vibe Dynamical Instantiations (`v4.35.0`)

Formalizes the bug-fixed Wolpert-Krakauer (`arXiv:2611.06641v2`) logic of emergence framework
in Lean `4.35.0` with Mathlib `v4.35.0`, resolving three foundational bugs (intra-model congruence
vs `E`-invariance, equivalence-relation join via `Relation.EqvGen`, and pushforward-measure
functoriality vs exogenous macro-measures) and instantiating the framework directly on Vibe's
`ℤ_2^{48}` parity sectors, `ZMod 6` Standard Model center quotient, and `D_4` outer-triality
`81`-site torus `D_4 / 3 D_4`.

Headline theorems (`0 sorry`, `0 axiom`, `0 native_decide`, `#print axioms` clean):
1. `thm_le_bug1_e_invariance_vs_intermodel_counterexample`: Exact closure characterization
   `(∃ ν, StrictEmergence μ ν Φ) ↔ DynCongruent μ.step (kerRel Φ)` (with uniqueness on
   surjective `Φ`), explicit `Fin 4` inter-model / `E`-invariance counterexample, and minimal
   3-state `E-HLG-0043` dynamical non-closure witness.
2. `thm_le_bug2_equiv_disjunction_counterexample_and_eqvgen_join`: 3-element counterexample
   showing raw disjunction `E₁ ∨ E₂` fails transitivity, universal lattice-join theorem for
   `equivJoin := Relation.EqvGen (E₁ ∨ E₂)`, and dynamical congruence preservation under joins.
3. `thm_le_bug3_exogenous_measure_contradiction_and_pushforward_fix`: Exogenous-measure
   contradiction (stationary uniform macro-measure fails `ProbEmergence` despite `StrictEmergence`),
   exact `FinDist` pushforward functoriality, all-time `ProbEmergence` for `pushforwardDist Φ p`,
   and stationary-measure pushforward preservation.
4. `thm_le_strict_transitivity_and_ouroboros_collapse`: Unconditional transitivity and `step^[t]`
   all-time iteration of `StrictEmergence`, `IsStrictlyRicher Φ ↔ ¬ Function.Injective Φ`, and
   finite surjective Ouroboros collapse (`Fintype.card S = Fintype.card M`, both maps bijective,
   neither strictly richer).
5. `thm_le_constrained_asymmetry_and_non_transitivity`: Left-constrained / right-strict
   transitivity, pullback law for left-strict / right-constrained, incompatible-constraints
   counterexample on a single base, and right-constrained failure `C_stab` witness.
6. `thm_le_vibe_z2_parity_and_z6_quotient_emergence`: Abstract invariant-sector `StrictEmergence`
   theorem (ready to plug directly into `fockBeat`), concrete `Fin 48 → ZMod 2` parity-preserving
   beat with surjectivity and `IsStrictlyRicher`, and certified `ZMod 6` SM center quotient
   `ConstrainedEmergence` linked directly to `thm_ml_z6_sm_quotient_and_baryon_quantization`
   with the `u_R^c` vs `d_R^c` richness witness.
7. `thm_le_vibe_d4_triality_torus_emergence`: Directly linked to `Vibe.StandardModelMathlib.mlD4Triality`:
   exact `StrictEmergence` onto `Fin 4 → ZMod 3`, surjectivity & richness, exact order-3
   periodicity `step^[3] = id` on lattice and torus, `Fintype.card (Fin 4 → ZMod 3) = 81`, and
   exact `9` fixed points matching `(mlD4Triality - 1).det = 9`.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

universe u v w

/-- A discrete-time deterministic dynamical system `(S, step)`. -/
structure DynSys (S : Type u) where
  step : S → S

/-- Kernel equivalence relation induced by a coarse-graining map `Φ : S → M`. -/
def kerRel {S : Type u} {M : Type v} (Φ : S → M) (x y : S) : Prop :=
  Φ x = Φ y

/-- `Φ` is `E`-invariant iff `E`-equivalent microstates map to the same macrostate (`E ≤ kerRel Φ`). -/
def EqvInvariant {S : Type u} {M : Type v} (E : S → S → Prop) (Φ : S → M) : Prop :=
  ∀ x y : S, E x y → Φ x = Φ y

/-- Dynamical congruence (lumpability): `step` preserves the relation `E`. -/
def DynCongruent {S : Type u} (step : S → S) (E : S → S → Prop) : Prop :=
  ∀ x y : S, E x y → E (step x) (step y)

/-- Strict (unconstrained) emergence: `Φ` intertwines `μ` and `ν` on all of `S`. -/
def StrictEmergence {S : Type u} {M : Type v}
    (μ : DynSys S) (ν : DynSys M) (Φ : S → M) : Prop :=
  ∀ x : S, Φ (μ.step x) = ν.step (Φ x)

/-- Constrained emergence on a forward-invariant constraint `C : S → Prop`. -/
def ConstrainedEmergence {S : Type u} {M : Type v}
    (μ : DynSys S) (ν : DynSys M) (Φ : S → M) (C : S → Prop) : Prop :=
  (∀ x : S, C x → C (μ.step x)) ∧ (∀ x : S, C x → Φ (μ.step x) = ν.step (Φ x))

/-- Strict richness (non-trivial coarse-graining): at least two distinct microstates collide. -/
def IsStrictlyRicher {S : Type u} {M : Type v} (Φ : S → M) : Prop :=
  ∃ x y : S, x ≠ y ∧ Φ x = Φ y

/-- Exact lattice join of two relations via equivalence closure (`Relation.EqvGen`). -/
def equivJoin {S : Type u} (E₁ E₂ : S → S → Prop) : S → S → Prop :=
  Relation.EqvGen (fun x y => E₁ x y ∨ E₂ x y)

/-- Exact `ℚ`-valued probability distribution on a finite state space `S`. -/
@[ext]
structure FinDist (S : Type u) [Fintype S] where
  prob : S → ℚ
  nonneg : ∀ x : S, 0 ≤ prob x
  sum_one : ∑ x : S, prob x = 1

private theorem finset_sum_fiberwise {α : Type u} {β : Type v} [DecidableEq β]
    (s : Finset α) (t : Finset β) (g : α → β) (f : α → ℚ)
    (h : ∀ x ∈ s, g x ∈ t) :
    ∑ m ∈ t, ∑ x ∈ s.filter (fun x => g x = m), f x = ∑ x ∈ s, f x := by
  simp_rw [Finset.sum_filter]
  rw [Finset.sum_comm]
  apply Finset.sum_congr rfl
  intro x hx
  simp [h x hx]

/-- Pushforward of a rational finite distribution along a map `f : S → M`. -/
def pushforwardDist {S : Type u} {M : Type v}
    [Fintype S] [Fintype M] [DecidableEq M]
    (f : S → M) (p : FinDist S) : FinDist M where
  prob m := ∑ x ∈ Finset.univ.filter (fun x => f x = m), p.prob x
  nonneg m := Finset.sum_nonneg fun x _ => p.nonneg x
  sum_one := by
    have hFib := finset_sum_fiberwise
      (Finset.univ : Finset S) (Finset.univ : Finset M) f p.prob
      (fun x _ => Finset.mem_univ (f x))
    exact hFib.trans p.sum_one

/-- All-time probabilistic emergence of `(ν, q)` from `(μ, p)` along `Φ`. -/
def ProbEmergence {S : Type u} {M : Type v}
    [Fintype S] [Fintype M] [DecidableEq S] [DecidableEq M]
    (μ : DynSys S) (ν : DynSys M) (Φ : S → M)
    (p : FinDist S) (q : FinDist M) : Prop :=
  ∀ t : ℕ, pushforwardDist Φ (pushforwardDist (μ.step^[t]) p) =
    pushforwardDist (ν.step^[t]) q

private theorem strictEmergence_iterate {S : Type u} {M : Type v}
    (μ : DynSys S) (ν : DynSys M) (Φ : S → M)
    (h : StrictEmergence μ ν Φ) :
    ∀ t : ℕ, ∀ x : S, Φ (μ.step^[t] x) = ν.step^[t] (Φ x) := by
  intro t
  induction t with
  | zero => intro x; rfl
  | succ t ih =>
    intro x
    rw [Function.iterate_succ_apply', Function.iterate_succ_apply', h, ih]

private theorem pushforwardDist_id {S : Type u} [Fintype S] [DecidableEq S]
    (p : FinDist S) : pushforwardDist id p = p := by
  ext m
  simp only [pushforwardDist, id_eq]
  rw [Finset.sum_filter]
  simp

private theorem pushforwardDist_comp {S : Type u} {M : Type v} {N : Type w}
    [Fintype S] [Fintype M] [Fintype N] [DecidableEq M] [DecidableEq N]
    (g : M → N) (f : S → M) (p : FinDist S) :
    pushforwardDist (g ∘ f) p = pushforwardDist g (pushforwardDist f p) := by
  ext n
  simp only [pushforwardDist, Function.comp_apply]
  have hFib := finset_sum_fiberwise
    (Finset.univ.filter (fun x : S => g (f x) = n))
    (Finset.univ.filter (fun m : M => g m = n))
    f p.prob
    (fun x hx => by
      simp only [Finset.mem_filter, Finset.mem_univ, true_and] at hx ⊢
      exact hx)
  rw [← hFib]
  apply Finset.sum_congr rfl
  intro m hm
  simp only [Finset.mem_filter, Finset.mem_univ, true_and] at hm
  apply Finset.sum_congr _ (fun _ _ => rfl)
  ext x
  simp only [Finset.mem_filter, Finset.mem_univ, true_and]
  exact ⟨fun ⟨_, hfx⟩ => hfx, fun hfx => ⟨hfx.symm ▸ hm, hfx⟩⟩

/-- Headline 1 (Bug 1 — Intra-Model Congruence vs Inter-Model / `E`-Invariance):
    (a) A coarse-graining `Φ : S → M` admits a commuting macro-dynamics `ν` iff `kerRel Φ` is
        dynamically congruent for `μ.step`, and `ν` is unique whenever `Φ` is surjective.
    (b) Inter-model / `E`-invariance counterexample on `Fin 4`: a nontrivial equivalence `E`
        preserved by BOTH `μ₁` and `μ₂`, with an `E`-invariant map `Φ` that strictly emerges from
        `μ₁` yet admits NO commuting macro-dynamics from `μ₂`.
    (c) Minimal 3-state `E-HLG-0043` dynamical non-closure witness: two distinct states with
        identical column-sum `Φ_col 0 = Φ_col 1` diverge strictly at `t = 1`, refuting closure. -/
theorem thm_le_bug1_e_invariance_vs_intermodel_counterexample :
    (∀ {S M : Type} (μ : DynSys S) (Φ : S → M),
      ((∃ ν : DynSys M, StrictEmergence μ ν Φ) ↔ DynCongruent μ.step (kerRel Φ)) ∧
      (Function.Surjective Φ → ∀ ν₁ ν₂ : DynSys M,
        StrictEmergence μ ν₁ Φ → StrictEmergence μ ν₂ Φ → ν₁ = ν₂)) ∧
    (∃ (E : Fin 4 → Fin 4 → Prop) (μ₁ μ₂ : DynSys (Fin 4))
       (Φ : Fin 4 → Fin 2) (ν₁ : DynSys (Fin 2)),
      Equivalence E ∧
      (∃ a b : Fin 4, a ≠ b ∧ E a b) ∧
      DynCongruent μ₁.step E ∧
      DynCongruent μ₂.step E ∧
      EqvInvariant E Φ ∧
      StrictEmergence μ₁ ν₁ Φ ∧
      ¬ ∃ ν₂ : DynSys (Fin 2), StrictEmergence μ₂ ν₂ Φ) ∧
    (∃ (μ_hlg : DynSys (Fin 3)) (Φ_col : Fin 3 → Fin 2),
      Φ_col 0 = Φ_col 1 ∧
      Φ_col (μ_hlg.step 0) ≠ Φ_col (μ_hlg.step 1) ∧
      ¬ DynCongruent μ_hlg.step (kerRel Φ_col) ∧
      ¬ ∃ ν : DynSys (Fin 2), StrictEmergence μ_hlg ν Φ_col) := by
  refine ⟨?_, ?_, ?_⟩
  · intro S M μ Φ
    refine ⟨⟨?_, ?_⟩, ?_⟩
    · rintro ⟨ν, hν⟩ x y hxy
      change Φ (μ.step x) = Φ (μ.step y)
      rw [hν x, hν y, hxy]
    · intro hCong
      classical
      let stepM : M → M := fun m =>
        if h : ∃ x : S, Φ x = m then Φ (μ.step (Classical.choose h)) else m
      refine ⟨⟨stepM⟩, fun x => ?_⟩
      have hex : ∃ x' : S, Φ x' = Φ x := ⟨x, rfl⟩
      simp only [stepM, hex, ↓reduceDIte]
      exact (hCong (Classical.choose hex) x (Classical.choose_spec hex)).symm
    · intro hSurj ν₁ ν₂ h1 h2
      cases ν₁ with
      | mk s₁ =>
        cases ν₂ with
        | mk s₂ =>
          congr 1
          funext m
          rcases hSurj m with ⟨x, rfl⟩
          exact (h1 x).symm.trans (h2 x)
  · let qE : Fin 4 → Fin 3 := ![0, 0, 1, 2]
    let E : Fin 4 → Fin 4 → Prop := kerRel qE
    let μ₁ : DynSys (Fin 4) := ⟨![1, 0, 2, 3]⟩
    let μ₂ : DynSys (Fin 4) := ⟨![0, 1, 3, 2]⟩
    let Φ : Fin 4 → Fin 2 := ![0, 0, 0, 1]
    let ν₁ : DynSys (Fin 2) := ⟨id⟩
    refine ⟨E, μ₁, μ₂, Φ, ν₁, ?_, ⟨0, 1, by decide, rfl⟩, ?_, ?_, ?_, ?_, ?_⟩
    · exact ⟨fun _ => rfl, fun h => h.symm, fun h1 h2 => h1.trans h2⟩
    · intro x y hxy
      fin_cases x <;> fin_cases y <;> simp [E, kerRel, qE, μ₁] at hxy ⊢
    · intro x y hxy
      fin_cases x <;> fin_cases y <;> simp [E, kerRel, qE, μ₂] at hxy ⊢
    · intro x y hxy
      fin_cases x <;> fin_cases y <;> simp [E, kerRel, qE, Φ] at hxy ⊢
    · intro x
      fin_cases x <;> rfl
    · rintro ⟨ν₂, hν₂⟩
      have h0 := hν₂ 0
      have h2 := hν₂ 2
      have hEq : Φ 0 = Φ 2 := rfl
      rw [hEq] at h0
      have hBad : Φ (μ₂.step 0) = Φ (μ₂.step 2) := h0.trans h2.symm
      revert hBad
      decide
  · let μ_hlg : DynSys (Fin 3) := ⟨![2, 1, 2]⟩
    let Φ_col : Fin 3 → Fin 2 := ![1, 1, 0]
    refine ⟨μ_hlg, Φ_col, rfl, by decide, ?_, ?_⟩
    · intro hCong
      have h : Φ_col (μ_hlg.step 0) = Φ_col (μ_hlg.step 1) := hCong 0 1 rfl
      revert h
      decide
    · rintro ⟨ν, hν⟩
      have h0 := hν 0
      have h1 := hν 1
      have hEq : Φ_col 0 = Φ_col 1 := rfl
      rw [hEq] at h0
      have hBad : Φ_col (μ_hlg.step 0) = Φ_col (μ_hlg.step 1) := h0.trans h1.symm
      revert hBad
      decide

/-- Headline 2 (Bug 2 — Equivalence-Relation Join via `Relation.EqvGen`):
    (a) 3-element counterexample on `Fin 3` showing pointwise disjunction `E₁ ∨ E₂` of two
        equivalence relations fails transitivity (hence is NOT an equivalence relation).
    (b) Universal lattice-join theorem for `equivJoin E₁ E₂ = Relation.EqvGen (E₁ ∨ E₂)`:
        it is an equivalence relation, dominates `E₁` and `E₂`, and is contained in every
        equivalence relation dominating both `E₁` and `E₂`.
    (c) Dynamical congruence is closed under `equivJoin`: if `step` preserves `E₁` and `E₂`,
        then `step` preserves `equivJoin E₁ E₂`. -/
theorem thm_le_bug2_equiv_disjunction_counterexample_and_eqvgen_join :
    (∃ E₁ E₂ : Fin 3 → Fin 3 → Prop,
      Equivalence E₁ ∧ Equivalence E₂ ∧
      (E₁ 0 1 ∨ E₂ 0 1) ∧ (E₁ 1 2 ∨ E₂ 1 2) ∧ ¬ (E₁ 0 2 ∨ E₂ 0 2) ∧
      ¬ Equivalence (fun x y => E₁ x y ∨ E₂ x y)) ∧
    (∀ {S : Type} (E₁ E₂ : S → S → Prop),
      Equivalence (equivJoin E₁ E₂) ∧
      (∀ x y, E₁ x y → equivJoin E₁ E₂ x y) ∧
      (∀ x y, E₂ x y → equivJoin E₁ E₂ x y) ∧
      (∀ F : S → S → Prop, Equivalence F →
        (∀ x y, E₁ x y → F x y) →
        (∀ x y, E₂ x y → F x y) →
        ∀ x y, equivJoin E₁ E₂ x y → F x y)) ∧
    (∀ {S : Type} (step : S → S) (E₁ E₂ : S → S → Prop),
      DynCongruent step E₁ → DynCongruent step E₂ → DynCongruent step (equivJoin E₁ E₂)) := by
  refine ⟨?_, ?_, ?_⟩
  · let E₁ : Fin 3 → Fin 3 → Prop := kerRel (![0, 0, 1] : Fin 3 → Fin 2)
    let E₂ : Fin 3 → Fin 3 → Prop := kerRel (![0, 1, 1] : Fin 3 → Fin 2)
    refine ⟨E₁, E₂,
      ⟨fun _ => rfl, fun h => h.symm, fun h1 h2 => h1.trans h2⟩,
      ⟨fun _ => rfl, fun h => h.symm, fun h1 h2 => h1.trans h2⟩,
      Or.inl rfl, Or.inr rfl, ?_, ?_⟩
    · intro h
      rcases h with h1 | h2
      · change (![0, 0, 1] : Fin 3 → Fin 2) 0 = (![0, 0, 1] : Fin 3 → Fin 2) 2 at h1
        revert h1; decide
      · change (![0, 1, 1] : Fin 3 → Fin 2) 0 = (![0, 1, 1] : Fin 3 → Fin 2) 2 at h2
        revert h2; decide
    · intro hEqv
      have h02 := hEqv.trans (Or.inl rfl : E₁ 0 1 ∨ E₂ 0 1) (Or.inr rfl : E₁ 1 2 ∨ E₂ 1 2)
      rcases h02 with h1 | h2
      · change (![0, 0, 1] : Fin 3 → Fin 2) 0 = (![0, 0, 1] : Fin 3 → Fin 2) 2 at h1
        revert h1; decide
      · change (![0, 1, 1] : Fin 3 → Fin 2) 0 = (![0, 1, 1] : Fin 3 → Fin 2) 2 at h2
        revert h2; decide
  · intro S E₁ E₂
    refine ⟨Relation.EqvGen.is_equivalence _,
      fun x y h => Relation.EqvGen.rel x y (Or.inl h),
      fun x y h => Relation.EqvGen.rel x y (Or.inr h), ?_⟩
    intro F hF h1 h2 x y hxy
    induction hxy with
    | rel a b hab =>
      rcases hab with ha | hb
      · exact h1 a b ha
      · exact h2 a b hb
    | refl a => exact hF.refl a
    | symm a b _ ih => exact hF.symm ih
    | trans a b c _ _ ih1 ih2 => exact hF.trans ih1 ih2
  · intro S step E₁ E₂ h1 h2 x y hxy
    induction hxy with
    | rel a b hab =>
      rcases hab with ha | hb
      · exact Relation.EqvGen.rel _ _ (Or.inl (h1 a b ha))
      · exact Relation.EqvGen.rel _ _ (Or.inr (h2 a b hb))
    | refl a => exact Relation.EqvGen.refl _
    | symm a b _ ih => exact Relation.EqvGen.symm _ _ ih
    | trans a b c _ _ ih1 ih2 => exact Relation.EqvGen.trans _ _ _ ih1 ih2

/-- Headline 3 (Bug 3 — Exogenous-Measure Contradiction & Pushforward Functoriality Fix):
    (a) Exogenous-measure counterexample: on `Fin 3 → Fin 2` with `StrictEmergence` and stationary
        uniform `p` and uniform exogenous `q`, `(pushforwardDist Φ p).prob 0 = 2/3 ≠ 1/2 = q.prob 0`,
        so `ProbEmergence μ ν Φ p q` fails while `ProbEmergence μ ν Φ p (pushforwardDist Φ p)` holds.
    (b) Exact pushforward functoriality: `pushforwardDist id p = p` and
        `pushforwardDist (g ∘ f) p = pushforwardDist g (pushforwardDist f p)`.
    (c) All-time `ProbEmergence` and stationary-measure pushforward: whenever `StrictEmergence μ ν Φ`,
        every `p : FinDist S` satisfies `ProbEmergence μ ν Φ p (pushforwardDist Φ p)`, and if `p`
        is `μ`-stationary then `pushforwardDist Φ p` is `ν`-stationary. -/
theorem thm_le_bug3_exogenous_measure_contradiction_and_pushforward_fix :
    (∃ (μ : DynSys (Fin 3)) (ν : DynSys (Fin 2)) (Φ : Fin 3 → Fin 2)
       (p : FinDist (Fin 3)) (q : FinDist (Fin 2)),
      StrictEmergence μ ν Φ ∧
      pushforwardDist μ.step p = p ∧
      pushforwardDist ν.step q = q ∧
      (pushforwardDist Φ p).prob 0 = 2 / 3 ∧
      q.prob 0 = 1 / 2 ∧
      ¬ ProbEmergence μ ν Φ p q ∧
      ProbEmergence μ ν Φ p (pushforwardDist Φ p)) ∧
    (∀ {S : Type} [Fintype S] [DecidableEq S] (p : FinDist S),
      pushforwardDist id p = p) ∧
    (∀ {S M N : Type} [Fintype S] [Fintype M] [Fintype N] [DecidableEq M] [DecidableEq N]
      (g : M → N) (f : S → M) (p : FinDist S),
      pushforwardDist (g ∘ f) p = pushforwardDist g (pushforwardDist f p)) ∧
    (∀ {S M : Type} [Fintype S] [Fintype M] [DecidableEq S] [DecidableEq M]
      (μ : DynSys S) (ν : DynSys M) (Φ : S → M) (p : FinDist S),
      StrictEmergence μ ν Φ →
      ProbEmergence μ ν Φ p (pushforwardDist Φ p) ∧
      (pushforwardDist μ.step p = p →
        pushforwardDist ν.step (pushforwardDist Φ p) = pushforwardDist Φ p)) := by
  have hFix : ∀ {S M : Type} [Fintype S] [Fintype M] [DecidableEq S] [DecidableEq M]
      (μ : DynSys S) (ν : DynSys M) (Φ : S → M) (p : FinDist S),
      StrictEmergence μ ν Φ →
      ProbEmergence μ ν Φ p (pushforwardDist Φ p) ∧
      (pushforwardDist μ.step p = p →
        pushforwardDist ν.step (pushforwardDist Φ p) = pushforwardDist Φ p) := by
    intro S M _ _ _ _ μ ν Φ p hEmerg
    refine ⟨?_, ?_⟩
    · intro t
      rw [← pushforwardDist_comp, ← pushforwardDist_comp]
      have hFun : Φ ∘ μ.step^[t] = ν.step^[t] ∘ Φ := by
        funext x
        exact strictEmergence_iterate μ ν Φ hEmerg t x
      rw [hFun]
    · intro hStat
      rw [← pushforwardDist_comp]
      have hFun : ν.step ∘ Φ = Φ ∘ μ.step := by
        funext x
        exact (hEmerg x).symm
      rw [hFun, pushforwardDist_comp, hStat]
  refine ⟨?_, fun p => pushforwardDist_id p, fun g f p => pushforwardDist_comp g f p, hFix⟩
  let μ : DynSys (Fin 3) := ⟨id⟩
  let ν : DynSys (Fin 2) := ⟨id⟩
  let Φ : Fin 3 → Fin 2 := ![0, 0, 1]
  let p : FinDist (Fin 3) :=
    ⟨fun _ => (1 / 3 : ℚ), fun _ => by norm_num, by simp⟩
  let q : FinDist (Fin 2) :=
    ⟨fun _ => (1 / 2 : ℚ), fun _ => by norm_num, by simp⟩
  have hEmerg : StrictEmergence μ ν Φ := fun _ => rfl
  have hPf0 : (pushforwardDist Φ p).prob 0 = 2 / 3 := by
    simp only [pushforwardDist, Finset.sum_filter, Fin.sum_univ_three, Φ, p]
    norm_num
  refine ⟨μ, ν, Φ, p, q, hEmerg, pushforwardDist_id p, pushforwardDist_id q, hPf0, rfl, ?_,
    (hFix μ ν Φ p hEmerg).1⟩
  intro hProb
  have h0 := hProb 0
  simp only [Function.iterate_zero, pushforwardDist_id] at h0
  have hEval := congrFun (congrArg FinDist.prob h0) 0
  rw [hPf0] at hEval
  norm_num [q] at hEval

/-- Headline 4 (Strict Transitivity, All-Time Iteration, Richness & Finite Ouroboros Collapse):
    (a) Unconditional transitivity of `StrictEmergence` and all-time `step^[t]` commutation.
    (b) Exact equivalence `IsStrictlyRicher Φ ↔ ¬ Function.Injective Φ`.
    (c) Finite surjective Ouroboros collapse: if finite systems `μ` on `S` and `ν` on `M`
        mutually strictly emerge along surjective `Φ : S → M` and `Ψ : M → S`, then
        `Fintype.card S = Fintype.card M`, both `Φ` and `Ψ` are bijective, and neither is
        strictly richer. -/
theorem thm_le_strict_transitivity_and_ouroboros_collapse :
    (∀ {S M N : Type} (μ : DynSys S) (ν : DynSys M) (ρ : DynSys N) (Φ : S → M) (Ψ : M → N),
      StrictEmergence μ ν Φ → StrictEmergence ν ρ Ψ → StrictEmergence μ ρ (Ψ ∘ Φ)) ∧
    (∀ {S M : Type} (μ : DynSys S) (ν : DynSys M) (Φ : S → M),
      StrictEmergence μ ν Φ → ∀ t : ℕ, ∀ x : S, Φ (μ.step^[t] x) = ν.step^[t] (Φ x)) ∧
    (∀ {S M : Type} (Φ : S → M), IsStrictlyRicher Φ ↔ ¬ Function.Injective Φ) ∧
    (∀ {S M : Type} [Fintype S] [Fintype M]
      (μ : DynSys S) (ν : DynSys M) (Φ : S → M) (Ψ : M → S),
      StrictEmergence μ ν Φ → StrictEmergence ν μ Ψ →
      Function.Surjective Φ → Function.Surjective Ψ →
      Fintype.card S = Fintype.card M ∧
      Function.Bijective Φ ∧ Function.Bijective Ψ ∧
      ¬ IsStrictlyRicher Φ ∧ ¬ IsStrictlyRicher Ψ) := by
  have hRich : ∀ {S M : Type} (Φ : S → M), IsStrictlyRicher Φ ↔ ¬ Function.Injective Φ := by
    intro S M Φ
    constructor
    · rintro ⟨x, y, hne, heq⟩ hInj
      exact hne (hInj heq)
    · intro hNotInj
      classical
      by_contra hNotRich
      apply hNotInj
      intro x y hxy
      by_contra hne
      exact hNotRich ⟨x, y, hne, hxy⟩
  refine ⟨?_, fun μ ν Φ h => strictEmergence_iterate μ ν Φ h, hRich, ?_⟩
  · intro S M N μ ν ρ Φ Ψ h1 h2 x
    simp only [Function.comp_apply, h1 x, h2 (Φ x)]
  · intro S M _ _ μ ν Φ Ψ _ _ hΦs hΨs
    have hLe1 : Fintype.card M ≤ Fintype.card S := Fintype.card_le_of_surjective Φ hΦs
    have hLe2 : Fintype.card S ≤ Fintype.card M := Fintype.card_le_of_surjective Ψ hΨs
    have hCard : Fintype.card S = Fintype.card M := le_antisymm hLe2 hLe1
    have hBijΦ : Function.Bijective Φ :=
      (Fintype.bijective_iff_surjective_and_card Φ).mpr ⟨hΦs, hCard⟩
    have hBijΨ : Function.Bijective Ψ :=
      (Fintype.bijective_iff_surjective_and_card Ψ).mpr ⟨hΨs, hCard.symm⟩
    exact ⟨hCard, hBijΦ, hBijΨ,
      (hRich Φ).not.mpr (not_not.mpr hBijΦ.injective),
      (hRich Ψ).not.mpr (not_not.mpr hBijΨ.injective)⟩

/-- Headline 5 (Constrained Emergence Asymmetry & Non-Transitivity):
    (a) Left-constrained / right-strict transitivity holds unconditionally:
        `ConstrainedEmergence μ ν Φ C → StrictEmergence ν ρ Ψ → ConstrainedEmergence μ ρ (Ψ ∘ Φ) C`.
    (b) Left-strict / right-constrained yields constrained emergence on the pullback `C_stab ∘ Φ`.
    (c) Incompatible constraints on a single base `Fin 4`: two disjoint nonempty invariant sectors
        `C₁, C₂` each support `ConstrainedEmergence`, while neither map extends to `StrictEmergence`.
    (d) Right-constrained failure (`C_stab` witness): a strictly richer surjective `StrictEmergence`
        `μ → ν` composed with a `ConstrainedEmergence` `ν → ρ` on `C_stab` fails to admit ANY
        unconstrained macro-dynamics `ρ'` for `Ψ ∘ Φ`. -/
theorem thm_le_constrained_asymmetry_and_non_transitivity :
    (∀ {S M N : Type} (μ : DynSys S) (ν : DynSys M) (ρ : DynSys N)
      (Φ : S → M) (Ψ : M → N) (C : S → Prop),
      ConstrainedEmergence μ ν Φ C → StrictEmergence ν ρ Ψ →
      ConstrainedEmergence μ ρ (Ψ ∘ Φ) C) ∧
    (∀ {S M N : Type} (μ : DynSys S) (ν : DynSys M) (ρ : DynSys N)
      (Φ : S → M) (Ψ : M → N) (C_stab : M → Prop),
      StrictEmergence μ ν Φ → ConstrainedEmergence ν ρ Ψ C_stab →
      ConstrainedEmergence μ ρ (Ψ ∘ Φ) (fun x => C_stab (Φ x))) ∧
    (∃ (μ : DynSys (Fin 4)) (ν₁ ν₂ : DynSys (Fin 2))
       (Φ₁ Φ₂ : Fin 4 → Fin 2) (C₁ C₂ : Fin 4 → Prop),
      (∃ x, C₁ x) ∧ (∃ x, C₂ x) ∧ (∀ x, ¬ (C₁ x ∧ C₂ x)) ∧
      ConstrainedEmergence μ ν₁ Φ₁ C₁ ∧
      ConstrainedEmergence μ ν₂ Φ₂ C₂ ∧
      (¬ ∃ ν₁', StrictEmergence μ ν₁' Φ₁) ∧
      (¬ ∃ ν₂', StrictEmergence μ ν₂' Φ₂)) ∧
    (∃ (μ : DynSys (Fin 4)) (ν : DynSys (Fin 3)) (ρ : DynSys (Fin 2))
       (Φ : Fin 4 → Fin 3) (Ψ : Fin 3 → Fin 2) (C_stab : Fin 3 → Prop),
      StrictEmergence μ ν Φ ∧
      IsStrictlyRicher Φ ∧
      ConstrainedEmergence ν ρ Ψ C_stab ∧
      (∃ m, C_stab m) ∧
      ¬ ∃ ρ' : DynSys (Fin 2), StrictEmergence μ ρ' (Ψ ∘ Φ)) := by
  refine ⟨?_, ?_, ?_, ?_⟩
  · intro S M N μ ν ρ Φ Ψ C ⟨hInv, hComm⟩ hStrict
    refine ⟨hInv, fun x hx => ?_⟩
    simp only [Function.comp_apply, hComm x hx, hStrict (Φ x)]
  · intro S M N μ ν ρ Φ Ψ C_stab hStrict ⟨hInv, hComm⟩
    refine ⟨?_, ?_⟩
    · intro x hx
      rw [hStrict x]
      exact hInv (Φ x) hx
    · intro x hx
      simp only [Function.comp_apply, hStrict x, hComm (Φ x) hx]
  · let μ : DynSys (Fin 4) := ⟨![1, 0, 3, 2]⟩
    let ν₁ : DynSys (Fin 2) := ⟨id⟩
    let ν₂ : DynSys (Fin 2) := ⟨id⟩
    let Φ₁ : Fin 4 → Fin 2 := ![0, 0, 0, 1]
    let Φ₂ : Fin 4 → Fin 2 := ![0, 1, 0, 0]
    let C₁ : Fin 4 → Prop := fun x => x = 0 ∨ x = 1
    let C₂ : Fin 4 → Prop := fun x => x = 2 ∨ x = 3
    refine ⟨μ, ν₁, ν₂, Φ₁, Φ₂, C₁, C₂,
      ⟨0, Or.inl rfl⟩, ⟨2, Or.inl rfl⟩, ?_, ?_, ?_, ?_, ?_⟩
    · intro x ⟨h1, h2⟩
      fin_cases x <;> simp [C₁, C₂] at h1 h2
    · refine ⟨?_, ?_⟩
      · intro x hx
        rcases hx with rfl | rfl <;> simp [μ, C₁]
      · intro x hx
        rcases hx with rfl | rfl <;> rfl
    · refine ⟨?_, ?_⟩
      · intro x hx
        rcases hx with rfl | rfl <;> simp [μ, C₂]
      · intro x hx
        rcases hx with rfl | rfl <;> rfl
    · rintro ⟨ν₁', hν⟩
      have h0 := hν 0
      have h2 := hν 2
      have hEq : Φ₁ 0 = Φ₁ 2 := rfl
      rw [hEq] at h0
      have hBad : Φ₁ (μ.step 0) = Φ₁ (μ.step 2) := h0.trans h2.symm
      revert hBad; decide
    · rintro ⟨ν₂', hν⟩
      have h0 := hν 0
      have h2 := hν 2
      have hEq : Φ₂ 0 = Φ₂ 2 := rfl
      rw [hEq] at h0
      have hBad : Φ₂ (μ.step 0) = Φ₂ (μ.step 2) := h0.trans h2.symm
      revert hBad; decide
  · let μ : DynSys (Fin 4) := ⟨![1, 0, 3, 3]⟩
    let ν : DynSys (Fin 3) := ⟨![0, 2, 2]⟩
    let ρ : DynSys (Fin 2) := ⟨id⟩
    let Φ : Fin 4 → Fin 3 := ![0, 0, 1, 2]
    let Ψ : Fin 3 → Fin 2 := ![0, 0, 1]
    let C_stab : Fin 3 → Prop := fun m => m = 0
    refine ⟨μ, ν, ρ, Φ, Ψ, C_stab, ?_, ⟨0, 1, by decide, rfl⟩, ?_, ⟨0, rfl⟩, ?_⟩
    · intro x
      fin_cases x <;> rfl
    · refine ⟨?_, ?_⟩
      · intro m hm
        subst hm
        rfl
      · intro m hm
        subst hm
        rfl
    · rintro ⟨ρ', hρ⟩
      have h0 := hρ 0
      have h2 := hρ 2
      have hEq : (Ψ ∘ Φ) 0 = (Ψ ∘ Φ) 2 := rfl
      rw [hEq] at h0
      have hBad : (Ψ ∘ Φ) (μ.step 0) = (Ψ ∘ Φ) (μ.step 2) := h0.trans h2.symm
      revert hBad; decide

/-- Concrete 48-channel integer occupation beat preserving all `48` `ZMod 2` line-tone-role parities. -/
def leParityMicroSys : DynSys (Fin 48 → ℤ) :=
  ⟨fun c k => c k + 2⟩

/-- Projection from 48 integer channel occupations onto `Fin 48 → ZMod 2` (`ℤ_2^{48}`). -/
def leParityProj48 (c : Fin 48 → ℤ) : Fin 48 → ZMod 2 :=
  fun k => (c k : ZMod 2)

/-- Standard Model `ZMod 6` center-quotient physical constraint `2 t_C + 3 (2 j_L) + q_Y ≡ 0 (mod 6)`. -/
def leSmCenterConstraint (q : ℤ × ℤ × ℤ) : Prop :=
  ((2 * q.1 + 3 * q.2.1 + q.2.2 : ℤ) : ZMod 6) = 0

/-- Standard Model `ZMod 6` center-quotient coarse-graining map `(t_C, 2 j_L, q_Y) ↦ (mod 3, mod 2, mod 6)`. -/
def leSmZ6Quotient (q : ℤ × ℤ × ℤ) : ZMod 3 × ZMod 2 × ZMod 6 :=
  ((q.1 : ZMod 3), (q.2.1 : ZMod 2), (q.2.2 : ZMod 6))

/-- SM Higgs-doublet shift `(0, 1, 3)` on integer `(t_C, 2 j_L, q_Y)` charge tuples. -/
def leSmHiggsMicroSys : DynSys (ℤ × ℤ × ℤ) :=
  ⟨fun q => (q.1, q.2.1 + 1, q.2.2 + 3)⟩

/-- Induced `ZMod 3 × ZMod 2 × ZMod 6` macro shift of the SM Higgs doublet. -/
def leSmHiggsMacroSys : DynSys (ZMod 3 × ZMod 2 × ZMod 6) :=
  ⟨fun m => (m.1, m.2.1 + 1, m.2.2 + 3)⟩

/-- Headline 6 (Vibe `ℤ_2^{48}` Parity Sector & Certified `ZMod 6` SM Quotient Emergence):
    (a) Abstract invariant-sector emergence: any invariant `inv : S → M` preserved by `μ.step`
        defines a `StrictEmergence μ ⟨id⟩ inv` with all-time conservation `∀ t x, inv (μ.step^[t] x) = inv x`.
    (b) Concrete `Fin 48 → ZMod 2` parity-sector witness: `leParityMicroSys` genuinely moves every
        microstate, strictly emerges onto `Fin 48 → ZMod 2` with `StrictEmergence`, surjectivity,
        `IsStrictlyRicher`, and `Fintype.card (Fin 48 → ZMod 2) = 2 ^ 48`.
    (c) Certified `ZMod 6` SM center quotient `ConstrainedEmergence` linked directly to
        `thm_ml_z6_sm_quotient_and_baryon_quantization`: all 6 SM Weyl multiplets satisfy
        `leSmCenterConstraint`, forbidden `(3, 1, 0)` and `(1, 2, 0)` fail it, color-singlets obey
        integer charge quantization `(6 : ℤ) ∣ (3 * twoJ + qY)`, `leSmZ6Quotient` satisfies
        `ConstrainedEmergence` under the SM Higgs shift, and `u_R^c = (2, 0, -4)` vs
        `d_R^c = (2, 0, 2)` witness strict richness `IsStrictlyRicher leSmZ6Quotient` inside the
        physical SM constraint (`(2, 0, -4) ≠ (2, 0, 2)` yet `leSmZ6Quotient` identifies them). -/
theorem thm_le_vibe_z2_parity_and_z6_quotient_emergence :
    (∀ {S M : Type} (μ : DynSys S) (inv : S → M),
      (∀ x : S, inv (μ.step x) = inv x) →
      StrictEmergence μ ⟨id⟩ inv ∧ ∀ t : ℕ, ∀ x : S, inv (μ.step^[t] x) = inv x) ∧
    (StrictEmergence leParityMicroSys ⟨id⟩ leParityProj48 ∧
      (∀ c : Fin 48 → ℤ, leParityMicroSys.step c ≠ c) ∧
      Function.Surjective leParityProj48 ∧
      IsStrictlyRicher leParityProj48 ∧
      Fintype.card (Fin 48 → ZMod 2) = 2 ^ 48) ∧
    (ConstrainedEmergence leSmHiggsMicroSys leSmHiggsMacroSys leSmZ6Quotient leSmCenterConstraint ∧
      leSmCenterConstraint (1, 1, 1) ∧
      leSmCenterConstraint (2, 0, 2) ∧
      leSmCenterConstraint (2, 0, -4) ∧
      leSmCenterConstraint (0, 1, -3) ∧
      leSmCenterConstraint (0, 0, 6) ∧
      leSmCenterConstraint (0, 0, 0) ∧
      ¬ leSmCenterConstraint (1, 0, 0) ∧
      ¬ leSmCenterConstraint (0, 1, 0) ∧
      (∀ twoJ qY : ℤ, leSmCenterConstraint (0, twoJ, qY) → (6 : ℤ) ∣ (3 * twoJ + qY)) ∧
      (((2 : ℤ), (0 : ℤ), (-4 : ℤ)) ≠ ((2 : ℤ), (0 : ℤ), (2 : ℤ)) ∧
        leSmZ6Quotient (2, 0, -4) = leSmZ6Quotient (2, 0, 2) ∧
        IsStrictlyRicher leSmZ6Quotient)) := by
  have hAbs : ∀ {S M : Type} (μ : DynSys S) (inv : S → M),
      (∀ x : S, inv (μ.step x) = inv x) →
      StrictEmergence μ ⟨id⟩ inv ∧ ∀ t : ℕ, ∀ x : S, inv (μ.step^[t] x) = inv x := by
    intro S M μ inv hInv
    have hStrict : StrictEmergence μ ⟨id⟩ inv := fun x => hInv x
    refine ⟨hStrict, fun t x => ?_⟩
    have hIt := strictEmergence_iterate μ ⟨id⟩ inv hStrict t x
    simpa using hIt
  have hParInv : ∀ c : Fin 48 → ℤ, leParityProj48 (leParityMicroSys.step c) = leParityProj48 c := by
    intro c
    funext k
    simp only [leParityProj48, leParityMicroSys, Int.cast_add, Int.cast_ofNat]
    have h2 : (2 : ZMod 2) = 0 := by decide
    rw [h2, add_zero]
  have hParStrict : StrictEmergence leParityMicroSys ⟨id⟩ leParityProj48 :=
    (hAbs leParityMicroSys leParityProj48 hParInv).1
  have hParMove : ∀ c : Fin 48 → ℤ, leParityMicroSys.step c ≠ c := by
    intro c hEq
    have h0 := congrFun hEq 0
    simp only [leParityMicroSys] at h0
    omega
  have hParSurj : Function.Surjective leParityProj48 := by
    intro p
    refine ⟨fun k => ((p k).val : ℤ), ?_⟩
    funext k
    simp [leParityProj48]
  have hParRich : IsStrictlyRicher leParityProj48 :=
    ⟨0, leParityMicroSys.step 0, (hParMove 0).symm, (hParInv 0).symm⟩
  have hParCard : Fintype.card (Fin 48 → ZMod 2) = 2 ^ 48 := by
    simp [Fintype.card_pi, ZMod.card]
  rcases thm_ml_z6_sm_quotient_and_baryon_quantization with
    ⟨hQL, hDR, hUR, hLL, hER, hNR, hForb3, hForb2, hQuant⟩
  have hSmConstr : ConstrainedEmergence leSmHiggsMicroSys leSmHiggsMacroSys
      leSmZ6Quotient leSmCenterConstraint := by
    refine ⟨?_, ?_⟩
    · intro q hq
      simp only [leSmCenterConstraint, leSmHiggsMicroSys] at hq ⊢
      have hShift :
          (2 * q.1 + 3 * (q.2.1 + 1) + (q.2.2 + 3) : ℤ) =
            (2 * q.1 + 3 * q.2.1 + q.2.2) + 6 := by ring
      rw [hShift, Int.cast_add, hq, zero_add]
      decide
    · intro q _
      simp [leSmZ6Quotient, leSmHiggsMicroSys, leSmHiggsMacroSys]
  have hUrDrEq : leSmZ6Quotient (2, 0, -4) = leSmZ6Quotient (2, 0, 2) := by
    decide
  have hUrDrNe : ((2 : ℤ), (0 : ℤ), (-4 : ℤ)) ≠ ((2 : ℤ), (0 : ℤ), (2 : ℤ)) := by
    decide
  refine ⟨hAbs, ⟨hParStrict, hParMove, hParSurj, hParRich, hParCard⟩, ?_⟩
  refine ⟨hSmConstr, ?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_,
    ⟨hUrDrNe, hUrDrEq, ⟨(2, 0, -4), (2, 0, 2), hUrDrNe, hUrDrEq⟩⟩⟩
  · unfold leSmCenterConstraint; push_cast; exact hQL
  · unfold leSmCenterConstraint; push_cast; exact hDR
  · unfold leSmCenterConstraint; push_cast; exact hUR
  · unfold leSmCenterConstraint; push_cast; exact hLL
  · unfold leSmCenterConstraint; push_cast; exact hER
  · unfold leSmCenterConstraint; push_cast; exact hNR
  · unfold leSmCenterConstraint; push_cast; exact hForb3
  · unfold leSmCenterConstraint; push_cast; exact hForb2
  · intro twoJ qY h
    exact (hQuant twoJ qY h).1

/-- Infinite `D_4` lattice dynamical system induced by `Vibe.StandardModelMathlib.mlD4Triality`. -/
def leD4LatticeSys : DynSys (Fin 4 → ℤ) :=
  ⟨fun v => mlD4Triality.mulVec v⟩

/-- Mod-3 `D_4 / 3 D_4` torus (`81` sites) dynamical system induced by `mlD4Triality`. -/
def leD4TorusSys : DynSys (Fin 4 → ZMod 3) :=
  ⟨fun x => (mlD4Triality.map (Int.cast : ℤ → ZMod 3)).mulVec x⟩

/-- Canonical lattice-to-torus coarse-graining projection `D_4 → D_4 / 3 D_4`. -/
def leD4Mod3Proj (v : Fin 4 → ℤ) : Fin 4 → ZMod 3 :=
  fun i => (v i : ZMod 3)

/-- Headline 7 (Vibe `D_4` Outer-Triality Torus Emergence on `D_4 / 3 D_4`):
    Directly linked to `Vibe.StandardModelMathlib.mlD4Triality` and `thm_ml_d4_outer_triality_fprim_det`:
    (1) Exact `StrictEmergence leD4LatticeSys leD4TorusSys leD4Mod3Proj`,
    (2) `leD4Mod3Proj` is surjective and strictly richer (`IsStrictlyRicher`),
    (3) Exact order-3 periodicity `step^[3] = id` on BOTH `leD4LatticeSys` and `leD4TorusSys`,
    (4) Exact torus cardinality `Fintype.card (Fin 4 → ZMod 3) = 81`,
    (5) Exact `9` fixed points on `D_4 / 3 D_4`, matching `(mlD4Triality - 1).det = 9`. -/
theorem thm_le_vibe_d4_triality_torus_emergence :
    StrictEmergence leD4LatticeSys leD4TorusSys leD4Mod3Proj ∧
    Function.Surjective leD4Mod3Proj ∧
    IsStrictlyRicher leD4Mod3Proj ∧
    leD4LatticeSys.step^[3] = id ∧
    leD4TorusSys.step^[3] = id ∧
    Fintype.card (Fin 4 → ZMod 3) = 81 ∧
    (Finset.univ.filter fun x : Fin 4 → ZMod 3 => leD4TorusSys.step x = x).card = 9 ∧
    ((Finset.univ.filter fun x : Fin 4 → ZMod 3 => leD4TorusSys.step x = x).card : ℤ) =
      (mlD4Triality - 1).det := by
  have hStrict : StrictEmergence leD4LatticeSys leD4TorusSys leD4Mod3Proj := by
    intro v
    funext i
    simp [leD4LatticeSys, leD4TorusSys, leD4Mod3Proj, Matrix.mulVec, dotProduct]
  have hSurj : Function.Surjective leD4Mod3Proj := by
    intro x
    refine ⟨fun i => ((x i).val : ℤ), ?_⟩
    funext i
    simp [leD4Mod3Proj]
  have hRich : IsStrictlyRicher leD4Mod3Proj := by
    refine ⟨0, fun _ => (3 : ℤ), ?_, ?_⟩
    · intro h
      have h0 := congrFun h 0
      norm_num at h0
    · funext i
      simp only [leD4Mod3Proj, Pi.zero_apply, Int.cast_zero, Int.cast_ofNat]
      decide
  rcases thm_ml_d4_outer_triality_fprim_det with ⟨hM3, _, hDetM1, _, _, _, _⟩
  have hLat3 : leD4LatticeSys.step^[3] = id := by
    funext v
    change mlD4Triality.mulVec (mlD4Triality.mulVec (mlD4Triality.mulVec v)) = v
    rw [Matrix.mulVec_mulVec, Matrix.mulVec_mulVec, hM3, Matrix.one_mulVec]
  have hTor3 : leD4TorusSys.step^[3] = id := by
    funext x
    rcases hSurj x with ⟨v, rfl⟩
    have hComm := strictEmergence_iterate leD4LatticeSys leD4TorusSys leD4Mod3Proj hStrict 3 v
    rw [← hComm, hLat3]
    rfl
  have hCard81 : Fintype.card (Fin 4 → ZMod 3) = 81 := by
    simp [Fintype.card_pi, ZMod.card]
  have hFix9 : (Finset.univ.filter fun x : Fin 4 → ZMod 3 => leD4TorusSys.step x = x).card = 9 := by
    decide
  refine ⟨hStrict, hSurj, hRich, hLat3, hTor3, hCard81, hFix9, ?_⟩
  rw [hFix9, hDetM1]
  rfl

end Vibe

end
