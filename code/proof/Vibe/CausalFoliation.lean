module

public import Vibe.FockBeat
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
# Vibe Theory: Exact Asynchronous Local Causal-Set & Discrete Tomonaga-Schwinger Foliation Invariance (Milestone P6-B)

Zero-dependency Lean 4.35.0 formalization of Wave-2 Track W4's exact asynchronous local causal-set
quantum circuit theorem on infinite `{3,4,3,4}` over `ℤ[ζ_9][1/6]` and `O^+(4,1; ℤ[√2])`
(`04-asynchronous-causal-beat-and-p6-blueprint.md`, Sections 1 & 3A; `54/54 PASS`, `0n` BigInt diff):

1. **Exact Facet-Pairing Fixed-Point-Free Involution & Single-Edge 2-Slot Swap:**
   - `facetMate (g, a) = (g * k_a, opp(a))` is an unconditional fixed-point-free involution on
     `FacetEndpoint = Mat5 × Fin 24`, partitioning all slots of infinite `{3,4,3,4}` into canonical
     pairwise-disjoint undirected 2-slot facet edges `FacetEdge`.
   - Each single-edge 2-slot exchange `swapFacetEdge g a` (`edgeSwapOp g a`) is an orientation-independent
     Fock unitary involution, and ANY two distinct undirected facet edges commute identically — even when
     they share a dock `g`.
2. **Exact Factorization `S = R ∘ E_swap`, `U = R ∘ (E_swap ∘ W) ∘ R`, & `[R_g, L_g] = 0`:**
   - Exact slot-level bijection `streamConfig c = revConfig (applyEdgeSwaps es c)` and Fock identity
     `fockStream ψ c = fockRev (applyEdgeOps es ψ) c` across any duplicate-free edge cover `es`
     (in particular `activeEdges c`).
   - Exact finite-stencil 1-dock lifting `liftDockOp g (applyStencil S)` instantiating all 7 layers of
     Vibe's microscopic on-site block `L_g = Φ_odd ∘ D ∘ M_meet ∘ M_pair(ζ_18) ∘ K ∘ D ∘ Φ_odd`,
     `R_g`, and dressed gate `W_g = L_g ∘ R_g`, proving `[W_{g₁}, W_{g₂}] = 0` (`g₁ ≠ g₂`),
     `[W_g, SWAP_e] = 0` (`g ∉ e`), `[R_g, L_g] = 0`, `[R, L_g] = 0`, and `U^T = R ∘ (E_swap ∘ W)^T ∘ R`.
3. **Abstract & Concrete Discrete Tomonaga-Schwinger / Mazurkiewicz Foliation Invariance:**
   - Unconditional abstract theorem (`thm_cf_tomonaga_schwinger_foliation_invariance`): for ANY causal
     event system where independent events commute, ANY two valid topological schedules executing the
     same finite causal event set yield the strictly identical state `execSchedule act π₁ s = execSchedule act π₂ s`.
   - Concrete `{3,4,3,4}` instantiation via the direct (1-hop) local causal dependence / Mazurkiewicz
     conflict relation `vibeDep` (`V(g, n) ≺ X(e, n) ≺ V(g, n + 1)` for `g ∈ e`, whose transitive closure
     is the causal partial order), exact 1-Lipschitz spacelike Cauchy-cut slope bound `|τ_V(u) - τ_V(v)| ≤ 1`,
     cut-validity preservation `IsValidCut (advanceCut σ ev)`, Diamond Non-Interference Lemma, exact
     Cauchy-surface foliation invariance (with concrete non-empty `ValidCauchySchedule` diamond witness on
     `zeroCut`), exact cylindrical flat-foliation match with the real global `Vibe.FockBeat.iter (fockBeat χ) T ψ`
     on any `QuantumInBall R₀ ψ` state via `thm_fock_lieb_robinson_light_cone`, and site-disjoint local-observable
     commutation.
4. **Exact Per-Event Conservation of BOTH `0_V` (Signed Charge `Q`) AND `0_D` (Unsigned Activity `D = N_occ`):**
   - `totalActivity c = 0 ↔ c = v1Config` with explicit balanced `Q = 0_V, D = 2` witness proving strict
     separation `0_D ⊂neq 0_V`.
   - Every single elementary facet swap `swapFacetEdge g a`, every 1-dock gate `W_g`, and every valid
     asynchronous schedule strictly conserves BOTH `totalCharge` (`0_V`) and `totalActivity` (`0_D`),
     and fixes the calm quantum vacuum `|V_1⟩`.
-/

set_option autoImplicit false

namespace Vibe

@[expose] public section

/-! ## Section 0: Compact `Mat5` Order & `HoneycombConfig` Helpers (Reusing `Vibe.Fock.*`) -/

private theorem cf_listIntLt_irrefl (xs : List Int) : listIntLt xs xs = false := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [listIntLt]
    have hxx : ¬ (x < x) := by omega
    simp only [ite_eq_right hxx]
    exact ih

private theorem cf_listIntLt_trans (xs ys zs : List Int)
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
          if hyz : y < z then rw [ite_eq_left (by omega)]
          else if hzy : z < y then rw [ite_eq_right hyz, ite_eq_left hzy] at h2; exact Bool.noConfusion h2
          else rw [ite_eq_left (by omega)]
        else if hyx : y < x then rw [ite_eq_right hxy, ite_eq_left hyx] at h1; exact Bool.noConfusion h1
        else
          rw [ite_eq_right hxy, ite_eq_right hyx] at h1
          if hyz : y < z then rw [ite_eq_left (by omega)]
          else if hzy : z < y then rw [ite_eq_right hyz, ite_eq_left hzy] at h2; exact Bool.noConfusion h2
          else
            rw [ite_eq_right hyz, ite_eq_right hzy] at h2
            have hxz : ¬ (x < z) := by omega
            have hzx : ¬ (z < x) := by omega
            simp only [ite_eq_right hxz, ite_eq_right hzx]
            exact ih yr zr h1 h2

private theorem cf_listIntLt_trichotomy (xs ys : List Int) (hlen : xs.length = ys.length) :
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
      if hxy : x < y then exact Or.inl (by simp only [listIntLt, ite_eq_left hxy])
      else if hyx : y < x then exact Or.inr (Or.inr (by simp only [listIntLt, ite_eq_left hyx]))
      else
        have hEq : x = y := by omega
        rcases ih yr (by omega) with h1 | h2 | h3
        · exact Or.inl (by simp only [listIntLt, ite_eq_right hxy, ite_eq_right hyx]; exact h1)
        · exact Or.inr (Or.inl (by rw [hEq, h2]))
        · exact Or.inr (Or.inr (by simp only [listIntLt, ite_eq_right hyx, ite_eq_right hxy]; exact h3))

private theorem cf_vec5Key_inj (u v : Vec5) (h : vec5Key u = vec5Key v) : u = v := by
  unfold vec5Key at h; simp only [List.cons.injEq] at h
  rcases h with ⟨h0a, h0b, h1a, h1b, h2a, h2b, h3a, h3b, h4a, h4b, _⟩
  funext i
  match i with
  | ⟨0, _⟩ => exact ZSqrt2.ext h0a h0b
  | ⟨1, _⟩ => exact ZSqrt2.ext h1a h1b
  | ⟨2, _⟩ => exact ZSqrt2.ext h2a h2b
  | ⟨3, _⟩ => exact ZSqrt2.ext h3a h3b
  | ⟨4, _⟩ => exact ZSqrt2.ext h4a h4b

private theorem cf_mat5Key_inj (g₁ g₂ : Mat5) (h : mat5Key g₁ = mat5Key g₂) : g₁ = g₂ := by
  unfold mat5Key at h
  have h1 := List.append_inj h (by rfl)
  have h2 := List.append_inj h1.1 (by rfl)
  have h3 := List.append_inj h2.1 (by rfl)
  have h4 := List.append_inj h3.1 (by rfl)
  funext i
  match i with
  | ⟨0, _⟩ => exact cf_vec5Key_inj _ _ h4.1
  | ⟨1, _⟩ => exact cf_vec5Key_inj _ _ h4.2
  | ⟨2, _⟩ => exact cf_vec5Key_inj _ _ h3.2
  | ⟨3, _⟩ => exact cf_vec5Key_inj _ _ h2.2
  | ⟨4, _⟩ => exact cf_vec5Key_inj _ _ h1.2

private theorem cf_mat5Lt_irrefl (g : Mat5) : mat5Lt g g = false :=
  cf_listIntLt_irrefl (mat5Key g)

private theorem cf_mat5Lt_asymm (g₁ g₂ : Mat5) (h : mat5Lt g₁ g₂ = true) :
    mat5Lt g₂ g₁ = false := by
  cases h2 : mat5Lt g₂ g₁ with
  | false => rfl
  | true =>
    have hc := cf_listIntLt_trans (mat5Key g₁) (mat5Key g₂) (mat5Key g₁) h h2
    rw [cf_listIntLt_irrefl] at hc
    exact Bool.noConfusion hc

private theorem cf_mat5Lt_trichotomy (g₁ g₂ : Mat5) :
    mat5Lt g₁ g₂ = true ∨ g₁ = g₂ ∨ mat5Lt g₂ g₁ = true := by
  rcases cf_listIntLt_trichotomy (mat5Key g₁) (mat5Key g₂) rfl with h1 | h2 | h3
  · exact Or.inl h1
  · exact Or.inr (Or.inl (cf_mat5Key_inj g₁ g₂ h2))
  · exact Or.inr (Or.inr h3)

private theorem cf_revConfig_setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock) :
    revConfig (c.setDock g d) = (revConfig c).setDock g (revFullDock d) := by
  apply honeycombConfig_ext; intro h
  rw [lookup_revConfig, lookup_setDock, lookup_setDock]
  if hhg : h = g then rw [ite_eq_left hhg, ite_eq_left hhg]
  else rw [ite_eq_right hhg, ite_eq_right hhg, lookup_revConfig]

private theorem cf_revFullDock_inv (d : FullDock) : revFullDock (revFullDock d) = d := by
  funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]


/-! ## Section 1: Exact Facet-Pairing Fixed-Point-Free Involution & Single-Edge 2-Slot Swap -/

/-- A directed facet endpoint `(g, a)` on the infinite `{3,4,3,4}` honeycomb. -/
abbrev FacetEndpoint := Mat5 × Fin 24

/-- Exact antipodal facet-mating map `φ(g, a) = (g * k_a, opp(a))` across shared 24-cell facets. -/
def facetMate (p : FacetEndpoint) : FacetEndpoint :=
  (mat5Mul p.1 (transport p.2), oppSlot p.2)

/-- Strict canonical total order on directed facet endpoints `Mat5 × Fin 24`. -/
def endpointLt (p q : FacetEndpoint) : Bool :=
  mat5Lt p.1 q.1 || (decide (p.1 = q.1) && decide (p.2.val < q.2.val))

private theorem cf_facetMate_inv (p : FacetEndpoint) : facetMate (facetMate p) = p := by
  cases p with | mk g a =>
  unfold facetMate
  have h1 : mat5Mul (mat5Mul g (transport a)) (transport (oppSlot a)) = g := by
    rw [fb_mat5Mul_assoc, transport_inv_right a, fb_mat5Mul_id_right]
  have h2 : oppSlot (oppSlot a) = a := (thm_24_facets_geometry.2.1 a).1
  exact congr (congrArg Prod.mk h1) h2

private theorem cf_facetMate_ne (p : FacetEndpoint) : facetMate p ≠ p := by
  intro heq
  have h2 : oppSlot p.2 = p.2 := congrArg Prod.snd heq
  exact (thm_24_facets_geometry.2.1 p.2).2 h2

private theorem cf_endpointLt_asymm (p q : FacetEndpoint) (h : endpointLt p q = true) :
    endpointLt q p = false := by
  unfold endpointLt at h ⊢
  cases hm : mat5Lt p.1 q.1 with
  | true =>
    have hne : q.1 ≠ p.1 := fun e => by rw [e, cf_mat5Lt_irrefl] at hm; exact Bool.noConfusion hm
    rw [cf_mat5Lt_asymm p.1 q.1 hm, decide_eq_false hne]; rfl
  | false =>
    rw [hm] at h; simp only [Bool.false_or] at h
    have ⟨hEq, hLt⟩ := (Bool.and_eq_true _ _).mp h
    have hEq' := of_decide_eq_true hEq
    have hLt' := of_decide_eq_true hLt
    rw [← hEq', cf_mat5Lt_irrefl, decide_eq_false (by omega : ¬ (q.2.val < p.2.val)), decide_eq_true rfl]
    rfl

private theorem cf_endpointLt_mate_of_false (p : FacetEndpoint)
    (h : endpointLt p (facetMate p) = false) : endpointLt (facetMate p) p = true := by
  have hTri : ∀ x y : FacetEndpoint, endpointLt x y = true ∨ x = y ∨ endpointLt y x = true := by
    intro x y
    cases x with | mk x1 x2 =>
    cases y with | mk y1 y2 =>
    rcases cf_mat5Lt_trichotomy x1 y1 with h1 | h2 | h3
    · exact Or.inl (by unfold endpointLt; change mat5Lt x1 y1 || _ = true; rw [h1]; rfl)
    · if hlt : x2.val < y2.val then
        exact Or.inl (by
          unfold endpointLt
          change mat5Lt x1 y1 || (decide (x1 = y1) && decide (x2.val < y2.val)) = true
          rw [decide_eq_true h2, decide_eq_true hlt]
          cases mat5Lt x1 y1 <;> rfl)
      else if hgt : y2.val < x2.val then
        exact Or.inr (Or.inr (by
          unfold endpointLt
          change mat5Lt y1 x1 || (decide (y1 = x1) && decide (y2.val < x2.val)) = true
          rw [decide_eq_true h2.symm, decide_eq_true hgt]
          cases mat5Lt y1 x1 <;> rfl))
      else
        exact Or.inr (Or.inl (congr (congrArg Prod.mk h2) (Fin.ext (by omega))))
    · exact Or.inr (Or.inr (by unfold endpointLt; change mat5Lt y1 x1 || _ = true; rw [h3]; rfl))
  rcases hTri p (facetMate p) with h1 | h2 | h3
  · rw [h] at h1; exact Bool.noConfusion h1
  · exact absurd h2.symm (cf_facetMate_ne p)
  · exact h3

/-- Canonical undirected 2-slot facet edge of `{3,4,3,4}`, represented by its `endpointLt`-smaller endpoint. -/
structure FacetEdge where
  end1 : FacetEndpoint
  canonical : endpointLt end1 (facetMate end1) = true

-- [helper]
theorem cf_facetEdge_eq_iff (e₁ e₂ : FacetEdge) : e₁ = e₂ ↔ e₁.end1 = e₂.end1 := by
  cases e₁; cases e₂
  exact ⟨fun h => by cases h; rfl, fun h => by simp only [FacetEdge.mk.injEq]; exact h⟩

instance : DecidableEq FacetEdge := fun e₁ e₂ =>
  if h : e₁.end1 = e₂.end1 then isTrue ((cf_facetEdge_eq_iff e₁ e₂).mpr h)
  else isFalse (fun heq => h ((cf_facetEdge_eq_iff e₁ e₂).mp heq))

def FacetEdge.u (e : FacetEdge) : Mat5 := e.end1.1
def FacetEdge.a (e : FacetEdge) : Fin 24 := e.end1.2
def FacetEdge.end2 (e : FacetEdge) : FacetEndpoint := facetMate e.end1
def FacetEdge.v (e : FacetEdge) : Mat5 := e.end2.1
def FacetEdge.oppA (e : FacetEdge) : Fin 24 := e.end2.2

-- [helper]
theorem cf_endpointLt_mate_canon (p : FacetEndpoint)
    (h : endpointLt p (facetMate p) = false) :
    endpointLt (facetMate p) (facetMate (facetMate p)) = true := by
  rw [cf_facetMate_inv]; exact cf_endpointLt_mate_of_false p h

/-- Canonical undirected facet edge containing directed slot `(g, a)`. -/
def edgeOfSlot (g : Mat5) (a : Fin 24) : FacetEdge :=
  match h : endpointLt (g, a) (facetMate (g, a)) with
  | true => ⟨(g, a), h⟩
  | false => ⟨facetMate (g, a), cf_endpointLt_mate_canon (g, a) h⟩

private theorem cf_edgeOfSlot_of_true (g : Mat5) (a : Fin 24)
    (h : endpointLt (g, a) (facetMate (g, a)) = true) : edgeOfSlot g a = ⟨(g, a), h⟩ := by
  unfold edgeOfSlot; split
  · rfl
  · rename_i hf; rw [h] at hf; exact Bool.noConfusion hf

private theorem cf_edgeOfSlot_of_false (g : Mat5) (a : Fin 24)
    (h : endpointLt (g, a) (facetMate (g, a)) = false) :
    edgeOfSlot g a = ⟨facetMate (g, a), cf_endpointLt_mate_canon (g, a) h⟩ := by
  unfold edgeOfSlot; split
  · rename_i ht; rw [h] at ht; exact Bool.noConfusion ht
  · rfl

private theorem cf_edgeOfSlot_self (e : FacetEdge) : edgeOfSlot e.u e.a = e :=
  (cf_facetEdge_eq_iff _ _).mpr (congrArg FacetEdge.end1 (cf_edgeOfSlot_of_true e.u e.a e.canonical))

private theorem cf_edgeOfSlot_mate (p : FacetEndpoint) :
    edgeOfSlot (facetMate p).1 (facetMate p).2 = edgeOfSlot p.1 p.2 := by
  cases p with | mk g a =>
  dsimp only
  cases h : endpointLt (g, a) (facetMate (g, a)) with
  | true =>
    have hf : endpointLt ((facetMate (g, a)).1, (facetMate (g, a)).2)
        (facetMate ((facetMate (g, a)).1, (facetMate (g, a)).2)) = false := by
      change endpointLt (facetMate (g, a)) (facetMate (facetMate (g, a))) = false
      rw [cf_facetMate_inv]; exact cf_endpointLt_asymm _ _ h
    rw [cf_edgeOfSlot_of_false (facetMate (g, a)).1 (facetMate (g, a)).2 hf,
        cf_edgeOfSlot_of_true g a h]
    exact (cf_facetEdge_eq_iff _ _).mpr (cf_facetMate_inv (g, a))
  | false =>
    have ht : endpointLt ((facetMate (g, a)).1, (facetMate (g, a)).2)
        (facetMate ((facetMate (g, a)).1, (facetMate (g, a)).2)) = true := by
      change endpointLt (facetMate (g, a)) (facetMate (facetMate (g, a))) = true
      rw [cf_facetMate_inv]; exact cf_endpointLt_mate_of_false (g, a) h
    rw [cf_edgeOfSlot_of_true (facetMate (g, a)).1 (facetMate (g, a)).2 ht,
        cf_edgeOfSlot_of_false g a h]

private theorem cf_edgeOfSlot_mate_self (e : FacetEdge) : edgeOfSlot e.v e.oppA = e := by
  change edgeOfSlot (facetMate e.end1).1 (facetMate e.end1).2 = e
  rw [cf_edgeOfSlot_mate]
  exact cf_edgeOfSlot_self e

private theorem cf_edgeOfSlot_eq_imp_dock (g : Mat5) (a : Fin 24) (e : FacetEdge)
    (h : edgeOfSlot g a = e) : g = e.u ∨ g = e.v := by
  cases hc : endpointLt (g, a) (facetMate (g, a)) with
  | true =>
    rw [cf_edgeOfSlot_of_true g a hc] at h
    exact Or.inl (congrArg (fun x => x.end1.1) h)
  | false =>
    rw [cf_edgeOfSlot_of_false g a hc] at h
    have he1 : facetMate (g, a) = e.end1 := congrArg FacetEdge.end1 h
    have he2 : (g, a) = e.end2 := by
      unfold FacetEdge.end2; rw [← he1, cf_facetMate_inv]
    exact Or.inr (congrArg Prod.fst he2)

/-- Headline Theorem 1 (Exact Facet-Pairing Fixed-Point-Free Involution on Infinite `{3,4,3,4}`):
    `facetMate(g, a) = (g * k_a, opp(a))` is an unconditional fixed-point-free involution on all
    directed slots `Mat5 × Fin 24`, mapping every endpoint and its mate to the exact same undirected
    `FacetEdge`. -/
theorem thm_cf_facet_pairing_free_involution (p : FacetEndpoint) :
    facetMate (facetMate p) = p ∧
    facetMate p ≠ p ∧
    edgeOfSlot (facetMate p).1 (facetMate p).2 = edgeOfSlot p.1 p.2 :=
  ⟨cf_facetMate_inv p, cf_facetMate_ne p, cf_edgeOfSlot_mate p⟩

/-- Update a single slot `s : Fin 24` of a `FullDock`. -/
def setSlot (d : FullDock) (s : Fin 24) (v : SlotState) : FullDock :=
  fun x => if x = s then v else d x

/-- Exact single-edge 2-slot exchange `SWAP_e` on `HoneycombConfig`:
    exchanges `(g, a)` with `(g * k_a, opp(a))` and leaves every other slot on every dock untouched. -/
def swapFacetEdge (g : Mat5) (a : Fin 24) (c : HoneycombConfig) : HoneycombConfig :=
  if mat5Mul g (transport a) = g then
    c.setDock g (setSlot (setSlot (c.lookup g) a (c.lookup (mat5Mul g (transport a)) (oppSlot a)))
                         (oppSlot a) (c.lookup g a))
  else
    (c.setDock g (setSlot (c.lookup g) a (c.lookup (mat5Mul g (transport a)) (oppSlot a)))).setDock
      (mat5Mul g (transport a)) (setSlot (c.lookup (mat5Mul g (transport a))) (oppSlot a) (c.lookup g a))

private theorem cf_lookup_swapFacetEdge (g : Mat5) (a : Fin 24) (c : HoneycombConfig)
    (x : Mat5) (s : Fin 24) :
    (swapFacetEdge g a c).lookup x s =
      if (x, s) = (g, a) then c.lookup (mat5Mul g (transport a)) (oppSlot a)
      else if (x, s) = facetMate (g, a) then c.lookup g a
      else c.lookup x s := by
  have hoppNe : oppSlot a ≠ a := (thm_24_facets_geometry.2.1 a).2
  unfold swapFacetEdge
  if hhg : mat5Mul g (transport a) = g then
    rw [ite_eq_left hhg, lookup_setDock]
    if hxg : x = g then
      rw [ite_eq_left hxg]; unfold setSlot
      if hsb : s = oppSlot a then
        have hsa : s ≠ a := by rw [hsb]; exact hoppNe
        have hp1 : (x, s) ≠ (g, a) := fun e => hsa (congrArg Prod.snd e)
        have hp2 : (x, s) = facetMate (g, a) := by
          change (x, s) = (mat5Mul g (transport a), oppSlot a); rw [hxg, hhg, hsb]
        rw [ite_eq_left hsb, ite_eq_right hp1, ite_eq_left hp2]
      else if hsa : s = a then
        have hp1 : (x, s) = (g, a) := by rw [hxg, hsa]
        rw [ite_eq_right hsb, ite_eq_left hsa, ite_eq_left hp1]
      else
        have hp1 : (x, s) ≠ (g, a) := fun e => hsa (congrArg Prod.snd e)
        have hp2 : (x, s) ≠ facetMate (g, a) := fun e => hsb (congrArg Prod.snd e)
        rw [ite_eq_right hsb, ite_eq_right hsa, ite_eq_right hp1, ite_eq_right hp2, hxg]
    else
      have hp1 : (x, s) ≠ (g, a) := fun e => hxg (congrArg Prod.fst e)
      have hp2 : (x, s) ≠ facetMate (g, a) := fun e => hxg (by
        have hf : x = mat5Mul g (transport a) := congrArg Prod.fst e
        rw [hhg] at hf; exact hf)
      rw [ite_eq_right hxg, ite_eq_right hp1, ite_eq_right hp2]
  else
    rw [ite_eq_right hhg, lookup_setDock]
    if hxh : x = mat5Mul g (transport a) then
      rw [ite_eq_left hxh]; unfold setSlot
      have hxg : x ≠ g := fun e => hhg (by rw [← hxh, e])
      have hp1 : (x, s) ≠ (g, a) := fun e => hxg (congrArg Prod.fst e)
      if hsb : s = oppSlot a then
        have hp2 : (x, s) = facetMate (g, a) := by
          change (x, s) = (mat5Mul g (transport a), oppSlot a); rw [hxh, hsb]
        rw [ite_eq_left hsb, ite_eq_right hp1, ite_eq_left hp2]
      else
        have hp2 : (x, s) ≠ facetMate (g, a) := fun e => hsb (congrArg Prod.snd e)
        rw [ite_eq_right hsb, ite_eq_right hp1, ite_eq_right hp2, hxh]
    else
      rw [ite_eq_right hxh, lookup_setDock]
      have hp2 : (x, s) ≠ facetMate (g, a) := fun e => hxh (congrArg Prod.fst e)
      if hxg : x = g then
        rw [ite_eq_left hxg]; unfold setSlot
        if hsa : s = a then
          have hp1 : (x, s) = (g, a) := by rw [hxg, hsa]
          rw [ite_eq_left hsa, ite_eq_left hp1]
        else
          have hp1 : (x, s) ≠ (g, a) := fun e => hsa (congrArg Prod.snd e)
          rw [ite_eq_right hsa, ite_eq_right hp1, ite_eq_right hp2, hxg]
      else
        have hp1 : (x, s) ≠ (g, a) := fun e => hxg (congrArg Prod.fst e)
        rw [ite_eq_right hxg, ite_eq_right hp1, ite_eq_right hp2]

-- [helper]
theorem cf_swapFacetEdge_inv (g : Mat5) (a : Fin 24) (c : HoneycombConfig) :
    swapFacetEdge g a (swapFacetEdge g a c) = c := by
  have hne : (mat5Mul g (transport a), oppSlot a) ≠ (g, a) := cf_facetMate_ne (g, a)
  have hFm : (mat5Mul g (transport a), oppSlot a) = facetMate (g, a) := rfl
  apply honeycombConfig_ext; intro x; funext s
  rw [cf_lookup_swapFacetEdge, cf_lookup_swapFacetEdge, cf_lookup_swapFacetEdge, cf_lookup_swapFacetEdge]
  if h1 : (x, s) = (g, a) then
    have hEq : c.lookup g a = c.lookup x s := by
      have hg : x = g := congrArg Prod.fst h1
      have ha : s = a := congrArg Prod.snd h1
      rw [hg, ha]
    rw [ite_eq_left h1, ite_eq_right hne, ite_eq_left hFm, hEq]
  else if h2 : (x, s) = facetMate (g, a) then
    have hEq : c.lookup (mat5Mul g (transport a)) (oppSlot a) = c.lookup x s := by
      have hg : x = mat5Mul g (transport a) := congrArg Prod.fst h2
      have ha : s = oppSlot a := congrArg Prod.snd h2
      rw [hg, ha]
    rw [ite_eq_right h1, ite_eq_left h2, ite_eq_left rfl, hEq]
  else
    rw [ite_eq_right h1, ite_eq_right h2, ite_eq_right h1, ite_eq_right h2]

private theorem cf_swapFacetEdge_symm (g : Mat5) (a : Fin 24) (c : HoneycombConfig) :
    swapFacetEdge (mat5Mul g (transport a)) (oppSlot a) c = swapFacetEdge g a c := by
  have hM : facetMate (mat5Mul g (transport a), oppSlot a) = (g, a) := cf_facetMate_inv (g, a)
  have hBack : mat5Mul (mat5Mul g (transport a)) (transport (oppSlot a)) = g :=
    congrArg Prod.fst hM
  have hOpp : oppSlot (oppSlot a) = a := (thm_24_facets_geometry.2.1 a).1
  have hF : (mat5Mul g (transport a), oppSlot a) = facetMate (g, a) := rfl
  apply honeycombConfig_ext; intro x; funext s
  rw [cf_lookup_swapFacetEdge, cf_lookup_swapFacetEdge, hM, hBack, hOpp, hF]
  if h1 : (x, s) = (g, a) then
    have hne : (x, s) ≠ facetMate (g, a) := by rw [h1]; exact (cf_facetMate_ne (g, a)).symm
    rw [ite_eq_right hne, ite_eq_left h1, ite_eq_left h1]
  else if h2 : (x, s) = facetMate (g, a) then
    rw [ite_eq_left h2, ite_eq_right h1, ite_eq_left h2]
  else
    rw [ite_eq_right h2, ite_eq_right h1, ite_eq_right h1, ite_eq_right h2]

private theorem cf_swapFacetEdge_comm (g₁ g₂ : Mat5) (a₁ a₂ : Fin 24)
    (hne : edgeOfSlot g₁ a₁ ≠ edgeOfSlot g₂ a₂) (c : HoneycombConfig) :
    swapFacetEdge g₁ a₁ (swapFacetEdge g₂ a₂ c) = swapFacetEdge g₂ a₂ (swapFacetEdge g₁ a₁ c) := by
  have hd1 : (g₁, a₁) ≠ (g₂, a₂) := fun e => hne (by
    have hg : g₁ = g₂ := congrArg Prod.fst e
    have ha : a₁ = a₂ := congrArg Prod.snd e
    rw [hg, ha])
  have hd2 : (g₁, a₁) ≠ facetMate (g₂, a₂) := fun e => hne (by
    have hg : g₁ = (facetMate (g₂, a₂)).1 := congrArg Prod.fst e
    have ha : a₁ = (facetMate (g₂, a₂)).2 := congrArg Prod.snd e
    rw [hg, ha]; exact cf_edgeOfSlot_mate (g₂, a₂))
  have hd3 : facetMate (g₁, a₁) ≠ (g₂, a₂) := fun e => hne (by
    have hg : (facetMate (g₁, a₁)).1 = g₂ := congrArg Prod.fst e
    have ha : (facetMate (g₁, a₁)).2 = a₂ := congrArg Prod.snd e
    rw [← hg, ← ha]; exact (cf_edgeOfSlot_mate (g₁, a₁)).symm)
  have hd4 : facetMate (g₁, a₁) ≠ facetMate (g₂, a₂) := fun e =>
    hd1 (by have := congrArg facetMate e; rw [cf_facetMate_inv, cf_facetMate_inv] at this; exact this)
  have hd3' : (mat5Mul g₁ (transport a₁), oppSlot a₁) ≠ (g₂, a₂) := hd3
  have hd4' : (mat5Mul g₁ (transport a₁), oppSlot a₁) ≠ facetMate (g₂, a₂) := hd4
  have hd2' : (mat5Mul g₂ (transport a₂), oppSlot a₂) ≠ (g₁, a₁) := hd2.symm
  have hd4'' : (mat5Mul g₂ (transport a₂), oppSlot a₂) ≠ facetMate (g₁, a₁) := hd4.symm
  apply honeycombConfig_ext; intro x; funext s
  rw [cf_lookup_swapFacetEdge]
  if hx1 : (x, s) = (g₁, a₁) then
    have hn3 : (x, s) ≠ (g₂, a₂) := by rw [hx1]; exact hd1
    have hn4 : (x, s) ≠ facetMate (g₂, a₂) := by rw [hx1]; exact hd2
    rw [ite_eq_left hx1, cf_lookup_swapFacetEdge, ite_eq_right hd3', ite_eq_right hd4',
        cf_lookup_swapFacetEdge, ite_eq_right hn3, ite_eq_right hn4,
        cf_lookup_swapFacetEdge, ite_eq_left hx1]
  else if hx2 : (x, s) = facetMate (g₁, a₁) then
    have hn3 : (x, s) ≠ (g₂, a₂) := by rw [hx2]; exact hd3
    have hn4 : (x, s) ≠ facetMate (g₂, a₂) := by rw [hx2]; exact hd4
    rw [ite_eq_right hx1, ite_eq_left hx2, cf_lookup_swapFacetEdge, ite_eq_right hd1, ite_eq_right hd2,
        cf_lookup_swapFacetEdge, ite_eq_right hn3, ite_eq_right hn4,
        cf_lookup_swapFacetEdge, ite_eq_right hx1, ite_eq_left hx2]
  else if hx3 : (x, s) = (g₂, a₂) then
    rw [ite_eq_right hx1, ite_eq_right hx2, cf_lookup_swapFacetEdge, ite_eq_left hx3,
        cf_lookup_swapFacetEdge, ite_eq_left hx3,
        cf_lookup_swapFacetEdge, ite_eq_right hd2', ite_eq_right hd4'']
  else if hx4 : (x, s) = facetMate (g₂, a₂) then
    rw [ite_eq_right hx1, ite_eq_right hx2, cf_lookup_swapFacetEdge, ite_eq_right hx3, ite_eq_left hx4,
        cf_lookup_swapFacetEdge, ite_eq_right hx3, ite_eq_left hx4,
        cf_lookup_swapFacetEdge, ite_eq_right hd1.symm, ite_eq_right hd3.symm]
  else
    rw [ite_eq_right hx1, ite_eq_right hx2, cf_lookup_swapFacetEdge, ite_eq_right hx3, ite_eq_right hx4,
        cf_lookup_swapFacetEdge, ite_eq_right hx3, ite_eq_right hx4,
        cf_lookup_swapFacetEdge, ite_eq_right hx1, ite_eq_right hx2]

/-- Exact unitary lift of `swapFacetEdge g a` to infinite-honeycomb Fock space over `ℤ[ζ_9][1/6]`. -/
def edgeSwapUnit (g : Mat5) (a : Fin 24) : FockUnitary NinthLoc6 HoneycombConfig :=
  permUnitary (R := NinthLoc6) (swapFacetEdge g a) (swapFacetEdge g a)
    (cf_swapFacetEdge_inv g a) (cf_swapFacetEdge_inv g a)

abbrev edgeSwapOp (g : Mat5) (a : Fin 24) :
    FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig :=
  (edgeSwapUnit g a).op

/-- Headline Theorem 2 (Single-Edge Swap Involution, Orientation-Independence, & Disjoint-Edge Commutation):
    every 2-slot facet exchange `swapFacetEdge g a` is an exact involution, depends only on the
    undirected facet edge `edgeOfSlot g a`, and commutes identically with every distinct undirected
    facet edge (even when sharing a dock `g`), both on `HoneycombConfig` and on Fock space. -/
theorem thm_cf_edge_swap_involution_and_comm (g₁ g₂ : Mat5) (a₁ a₂ : Fin 24) :
    (∀ c : HoneycombConfig, swapFacetEdge g₁ a₁ (swapFacetEdge g₁ a₁ c) = c) ∧
    (∀ c : HoneycombConfig,
      swapFacetEdge (mat5Mul g₁ (transport a₁)) (oppSlot a₁) c = swapFacetEdge g₁ a₁ c) ∧
    (edgeOfSlot g₁ a₁ ≠ edgeOfSlot g₂ a₂ →
      ∀ c : HoneycombConfig,
        swapFacetEdge g₁ a₁ (swapFacetEdge g₂ a₂ c) = swapFacetEdge g₂ a₂ (swapFacetEdge g₁ a₁ c)) ∧
    (edgeOfSlot g₁ a₁ ≠ edgeOfSlot g₂ a₂ →
      ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
        edgeSwapOp g₁ a₁ (edgeSwapOp g₂ a₂ ψ) = edgeSwapOp g₂ a₂ (edgeSwapOp g₁ a₁ ψ)) :=
  ⟨cf_swapFacetEdge_inv g₁ a₁, cf_swapFacetEdge_symm g₁ a₁, cf_swapFacetEdge_comm g₁ g₂ a₁ a₂,
   fun hne ψ => funext (fun c => congrArg ψ (cf_swapFacetEdge_comm g₂ g₁ a₂ a₁ hne.symm c))⟩


/-! ## Section 2: Exact Stream Factorization `S = R ∘ E_swap`, 1-Dock Stencils, & `[R_g, L_g] = 0` -/

/-- Apply a list of single-edge facet swaps sequentially to a configuration. -/
def applyEdgeSwaps : List FacetEdge → HoneycombConfig → HoneycombConfig
  | [], c => c
  | e :: rest, c => swapFacetEdge e.u e.a (applyEdgeSwaps rest c)

/-- Apply a list of single-edge facet swap unitaries sequentially in chronological order. -/
def applyEdgeOps :
    List FacetEdge → FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig
  | [], ψ => ψ
  | e :: rest, ψ => applyEdgeOps rest (edgeSwapOp e.u e.a ψ)

/-- Duplicate-free list of all undirected facet edges touching any active dock of `c`. -/
def activeEdges (c : HoneycombConfig) : List FacetEdge :=
  dedupList (flatMapList (fun g => (List.finRange 24).map (fun a => edgeOfSlot g a)) c.activeDocks)

private theorem cf_applyEdgeOps_eval (es : List FacetEdge)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    applyEdgeOps es ψ c = ψ (applyEdgeSwaps es c) := by
  induction es generalizing ψ with
  | nil => rfl
  | cons e rest ih =>
    simp only [applyEdgeOps, applyEdgeSwaps]
    exact ih (edgeSwapOp e.u e.a ψ)

private theorem cf_lookup_applyEdgeSwaps (es : List FacetEdge) (hnd : IsNodup es)
    (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (applyEdgeSwaps es c).lookup g a =
      if memBool (edgeOfSlot g a) es then c.lookup (mat5Mul g (transport a)) (oppSlot a)
      else c.lookup g a := by
  induction hnd generalizing g a with
  | nil => rfl
  | @cons e rest hnot _ ih =>
    simp only [applyEdgeSwaps]
    rw [cf_lookup_swapFacetEdge]
    if h1 : (g, a) = (e.u, e.a) then
      have hEdge : edgeOfSlot g a = e := by
        have hg : g = e.u := congrArg Prod.fst h1
        have ha : a = e.a := congrArg Prod.snd h1
        rw [hg, ha]; exact cf_edgeOfSlot_self e
      have hMem : memBool (edgeOfSlot g a) (e :: rest) = true := by
        simp only [memBool, ite_eq_left hEdge.symm]
      have hNotM : memBool (edgeOfSlot e.v e.oppA) rest = false := by
        cases hm : memBool (edgeOfSlot e.v e.oppA) rest with
        | false => rfl
        | true =>
          have hIn := (memBool_eq_true_iff _ _).mp hm
          rw [cf_edgeOfSlot_mate_self] at hIn; exact absurd hIn hnot
      rw [ite_eq_left h1, ite_eq_left hMem]
      change (applyEdgeSwaps rest c).lookup e.v e.oppA = c.lookup (mat5Mul g (transport a)) (oppSlot a)
      rw [ih e.v e.oppA, hNotM, ite_bool_false]
      have hg : g = e.u := congrArg Prod.fst h1
      have ha : a = e.a := congrArg Prod.snd h1
      rw [hg, ha]; rfl
    else if h2 : (g, a) = facetMate (e.u, e.a) then
      have hEdge : edgeOfSlot g a = e := by
        have hg : g = (facetMate (e.u, e.a)).1 := congrArg Prod.fst h2
        have ha : a = (facetMate (e.u, e.a)).2 := congrArg Prod.snd h2
        rw [hg, ha, cf_edgeOfSlot_mate]; exact cf_edgeOfSlot_self e
      have hMem : memBool (edgeOfSlot g a) (e :: rest) = true := by
        simp only [memBool, ite_eq_left hEdge.symm]
      have hNotU : memBool (edgeOfSlot e.u e.a) rest = false := by
        cases hm : memBool (edgeOfSlot e.u e.a) rest with
        | false => rfl
        | true =>
          have hIn := (memBool_eq_true_iff _ _).mp hm
          rw [cf_edgeOfSlot_self] at hIn; exact absurd hIn hnot
      rw [ite_eq_right h1, ite_eq_left h2, ite_eq_left hMem, ih e.u e.a, hNotU, ite_bool_false]
      have hBack : facetMate (g, a) = (e.u, e.a) := by rw [h2]; exact cf_facetMate_inv (e.u, e.a)
      have hg : mat5Mul g (transport a) = e.u := congrArg Prod.fst hBack
      have ha : oppSlot a = e.a := congrArg Prod.snd hBack
      rw [hg, ha]
    else
      have hNe : e ≠ edgeOfSlot g a := by
        intro heq
        cases hc : endpointLt (g, a) (facetMate (g, a)) with
        | true =>
          rw [cf_edgeOfSlot_of_true g a hc] at heq
          exact h1 (congrArg FacetEdge.end1 heq).symm
        | false =>
          rw [cf_edgeOfSlot_of_false g a hc] at heq
          have he1 : e.end1 = facetMate (g, a) := congrArg FacetEdge.end1 heq
          exact h2 (by change (g, a) = facetMate e.end1; rw [he1, cf_facetMate_inv])
      have hMem : memBool (edgeOfSlot g a) (e :: rest) = memBool (edgeOfSlot g a) rest := by
        simp only [memBool, ite_eq_right hNe]
      rw [ite_eq_right h1, ite_eq_right h2, hMem, ih g a]

/-- Headline Theorem 3 (Exact Global Stream Factorization `S = R ∘ E_swap`):
    for EVERY configuration `c` and EVERY duplicate-free edge list `es` covering `c.activeDocks`
    (in particular `activeEdges c`), the 1-hop Coxeter stream equals antipodal slot reversal composed
    with all pairwise-disjoint single-edge facet swaps: `streamConfig c = revConfig (applyEdgeSwaps es c)`,
    `streamConfigInv c = applyEdgeSwaps es (revConfig c)`, and `fockStream ψ c = fockRev (applyEdgeOps es ψ) c`. -/
theorem thm_cf_stream_eq_rev_comp_edge_swap (c : HoneycombConfig) (es : List FacetEdge)
    (hnd : IsNodup es)
    (hcov : ∀ g : Mat5, g ∈ c.activeDocks → ∀ a : Fin 24, edgeOfSlot g a ∈ es) :
    streamConfig c = revConfig (applyEdgeSwaps es c) ∧
    streamConfigInv c = applyEdgeSwaps es (revConfig c) ∧
    (∀ ψ : FockVec NinthLoc6 HoneycombConfig, fockStream ψ c = fockRev (applyEdgeOps es ψ) c) ∧
    streamConfig c = revConfig (applyEdgeSwaps (activeEdges c) c) ∧
    (∀ ψ : FockVec NinthLoc6 HoneycombConfig, fockStream ψ c = fockRev (applyEdgeOps (activeEdges c) ψ) c) := by
  have hMain : ∀ (es' : List FacetEdge), IsNodup es' →
      (∀ g : Mat5, g ∈ c.activeDocks → ∀ a : Fin 24, edgeOfSlot g a ∈ es') →
      streamConfig c = revConfig (applyEdgeSwaps es' c) ∧
      streamConfigInv c = applyEdgeSwaps es' (revConfig c) ∧
      (∀ ψ : FockVec NinthLoc6 HoneycombConfig, fockStream ψ c = fockRev (applyEdgeOps es' ψ) c) := by
    intro es' hnd' hcov'
    have hS : streamConfig c = revConfig (applyEdgeSwaps es' c) := by
      apply honeycombConfig_ext; intro g; funext a
      rw [lookup_streamConfig, lookup_revConfig]
      unfold revFullDock
      rw [cf_lookup_applyEdgeSwaps es' hnd' c g (oppSlot a)]
      cases hm : memBool (edgeOfSlot g (oppSlot a)) es' with
      | true => rw [ite_bool_true, (thm_24_facets_geometry.2.1 a).1]
      | false =>
        rw [ite_bool_false]
        have hNot1 : g ∉ c.activeDocks := fun hg => by
          have ht := (memBool_eq_true_iff _ _).mpr (hcov' g hg (oppSlot a))
          rw [hm] at ht; exact Bool.noConfusion ht
        have hNot2 : mat5Mul g (transport (oppSlot a)) ∉ c.activeDocks := fun hg => by
          have hIn := hcov' (mat5Mul g (transport (oppSlot a))) hg a
          have hEq : edgeOfSlot (mat5Mul g (transport (oppSlot a))) a = edgeOfSlot g (oppSlot a) := by
            have hM : edgeOfSlot (mat5Mul g (transport (oppSlot a))) (oppSlot (oppSlot a)) =
                edgeOfSlot g (oppSlot a) := cf_edgeOfSlot_mate (g, oppSlot a)
            rw [(thm_24_facets_geometry.2.1 a).1] at hM; exact hM
          rw [hEq] at hIn
          have ht := (memBool_eq_true_iff _ _).mpr hIn
          rw [hm] at ht; exact Bool.noConfusion ht
        have hE1 : c.lookup g = v1FullDock := by
          if h : c.lookup g = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c g).mpr h) hNot1
        have hE2 : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock := by
          if h : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock then exact h
          else exact absurd ((mem_activeDocks_iff c _).mpr h) hNot2
        rw [hE1, hE2]; rfl
    have hSInv : streamConfigInv c = applyEdgeSwaps es' (revConfig c) := by
      apply honeycombConfig_ext; intro g; funext a
      rw [lookup_streamConfigInv, cf_lookup_applyEdgeSwaps es' hnd' (revConfig c) g a]
      cases hm : memBool (edgeOfSlot g a) es' with
      | true =>
        rw [ite_bool_true, lookup_revConfig]; unfold revFullDock
        rw [(thm_24_facets_geometry.2.1 a).1]
      | false =>
        rw [ite_bool_false, lookup_revConfig]; unfold revFullDock
        have hNot1 : g ∉ c.activeDocks := fun hg => by
          have ht := (memBool_eq_true_iff _ _).mpr (hcov' g hg a)
          rw [hm] at ht; exact Bool.noConfusion ht
        have hNot2 : mat5Mul g (transport a) ∉ c.activeDocks := fun hg => by
          have hIn := hcov' (mat5Mul g (transport a)) hg (oppSlot a)
          have hEq : edgeOfSlot (mat5Mul g (transport a)) (oppSlot a) = edgeOfSlot g a :=
            cf_edgeOfSlot_mate (g, a)
          rw [hEq] at hIn
          have ht := (memBool_eq_true_iff _ _).mpr hIn
          rw [hm] at ht; exact Bool.noConfusion ht
        have hE1 : c.lookup g = v1FullDock := by
          if h : c.lookup g = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c g).mpr h) hNot1
        have hE2 : c.lookup (mat5Mul g (transport a)) = v1FullDock := by
          if h : c.lookup (mat5Mul g (transport a)) = v1FullDock then exact h
          else exact absurd ((mem_activeDocks_iff c _).mpr h) hNot2
        rw [hE1, hE2]; rfl
    refine ⟨hS, hSInv, fun ψ => ?_⟩
    unfold fockRev; rw [fockStream_eval, cf_applyEdgeOps_eval, hSInv]
  have h1 := hMain es hnd hcov
  have hActCov : ∀ g : Mat5, g ∈ c.activeDocks → ∀ a : Fin 24, edgeOfSlot g a ∈ activeEdges c :=
    fun g hg a => (mem_dedupList _ _).mpr
      ((mem_flatMapList_iff _ _ _).mpr ⟨g, hg, (mem_map_iff _ _ _).mpr ⟨a, mem_finRange24 a, rfl⟩⟩)
  have h2 := hMain (activeEdges c) (isNodup_dedupList _) hActCov
  exact ⟨h1.1, h1.2.1, h1.2.2, h2.1, h2.2.2⟩

/-! ### Exact 1-Dock Finite-Stencil Operators (`L_g`, `R_g`, `W_g = L_g ∘ R_g`) on Infinite `{3,4,3,4}` -/


private theorem cf_sumNloc_zero_of_all_zero {α : Type} (xs : List α) (f : α → NinthLoc6)
    (h : ∀ x, x ∈ xs → f x = NinthLoc6.zero) : sumList xs f = NinthLoc6.zero :=
  sumList_zero_of_all_zero xs f h

private theorem cf_sumNloc_congr {α : Type} (xs : List α) (f g : α → NinthLoc6)
    (h : ∀ x, x ∈ xs → f x = g x) : sumList xs f = sumList xs g :=
  sumList_congr xs f g h

private theorem cf_sumNloc_append {α : Type} (xs ys : List α) (f : α → NinthLoc6) :
    sumList (xs ++ ys) f = NinthLoc6.add (sumList xs f) (sumList ys f) := by
  induction xs with
  | nil => simp only [List.nil_append, sumList]; exact (NinthLoc6.zero_add _).symm
  | cons x rest ih =>
    simp only [List.cons_append, sumList]
    change NinthLoc6.add (f x) (sumList (rest ++ ys) f) =
      NinthLoc6.add (NinthLoc6.add (f x) (sumList rest f)) (sumList ys f)
    rw [ih, NinthLoc6.add_assoc]

private theorem cf_sumNloc_map {α β : Type} (xs : List α) (g : α → β) (f : β → NinthLoc6) :
    sumList (xs.map g) f = sumList xs (fun x => f (g x)) :=
  sumList_map xs g f

private theorem cf_sumNloc_mul_left {α : Type} (xs : List α) (c : NinthLoc6) (f : α → NinthLoc6) :
    sumList xs (fun x => NinthLoc6.mul c (f x)) = NinthLoc6.mul c (sumList xs f) :=
  sumList_mul_left xs c f

private theorem cf_sumNloc_add {α : Type} (xs : List α) (f g : α → NinthLoc6) :
    sumList xs (fun x => NinthLoc6.add (f x) (g x)) = NinthLoc6.add (sumList xs f) (sumList xs g) :=
  sumList_add xs f g

private theorem cf_sumNloc_swap {α β : Type} (xs : List α) (ys : List β) (f : α → β → NinthLoc6) :
    sumList xs (fun x => sumList ys (fun y => f x y)) =
      sumList ys (fun y => sumList xs (fun x => f x y)) := by
  induction xs with
  | nil =>
    simp only [sumList]
    exact (cf_sumNloc_zero_of_all_zero ys (fun _ => NinthLoc6.zero) (fun _ _ => rfl)).symm
  | cons x rest ih =>
    simp only [sumList]
    change NinthLoc6.add (sumList ys (fun y => f x y)) (sumList rest (fun x => sumList ys (fun y => f x y))) = _
    rw [ih, ← cf_sumNloc_add]
    rfl


/-- Single-dock Fock operator `FockVec NinthLoc6 FullDock → FockVec NinthLoc6 FullDock`. -/
abbrev DockOp := FockVec NinthLoc6 FullDock → FockVec NinthLoc6 FullDock

/-- Finite-stencil representation of a strictly 1-dock linear Fock operator over `ℤ[ζ_9][1/6]`. -/
abbrev DockStencil := FullDock → List (NinthLoc6 × FullDock)

def applyStencil (S : DockStencil) (φ : FockVec NinthLoc6 FullDock) (d : FullDock) : NinthLoc6 :=
  sumList (S d) (fun p => NinthLoc6.mul p.1 (φ p.2))

def idStencil (d : FullDock) : List (NinthLoc6 × FullDock) := [(NinthLoc6.one, d)]

def compStencil (S₁ S₂ : DockStencil) (d : FullDock) : List (NinthLoc6 × FullDock) :=
  flatMapList (fun p => (S₂ p.2).map (fun q => (NinthLoc6.mul p.1 q.1, q.2))) (S₁ d)

/-- Extract the 1-dock slice of `ψ` at cell `g` holding all other cells fixed to `c`. -/
def dockSlice (g : Mat5) (c : HoneycombConfig) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (d : FullDock) : NinthLoc6 :=
  ψ (c.setDock g d)

/-- Canonical lift of any 1-dock operator `T` to cell `g` on the infinite `{3,4,3,4}` honeycomb. -/
def liftDockOp (g : Mat5) (T : DockOp) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) : NinthLoc6 :=
  T (dockSlice g c ψ) (c.lookup g)

private theorem cf_applyStencil_id (φ : FockVec NinthLoc6 FullDock) (d : FullDock) :
    applyStencil idStencil φ d = φ d := by
  simp only [applyStencil, idStencil, sumList]; rw [NinthLoc6.one_mul, StarCommRing.add_zero]

private theorem cf_applyStencil_comp (S₁ S₂ : DockStencil)
    (φ : FockVec NinthLoc6 FullDock) (d : FullDock) :
    applyStencil (compStencil S₁ S₂) φ d = applyStencil S₁ (applyStencil S₂ φ) d := by
  unfold applyStencil compStencil
  have hAux : ∀ xs : List (NinthLoc6 × FullDock),
      sumList (flatMapList (fun p => (S₂ p.2).map (fun q => (NinthLoc6.mul p.1 q.1, q.2))) xs)
        (fun r => NinthLoc6.mul r.1 (φ r.2)) =
      sumList xs (fun p => NinthLoc6.mul p.1 (sumList (S₂ p.2) (fun q => NinthLoc6.mul q.1 (φ q.2)))) := by
    intro xs
    induction xs with
    | nil => rfl
    | cons p rest ih =>
      simp only [flatMapList, cf_sumNloc_append, cf_sumNloc_map, sumList]
      rw [ih, ← cf_sumNloc_mul_left]
      apply congrArg (fun z => NinthLoc6.add z _)
      apply cf_sumNloc_congr; intro q _; exact NinthLoc6.mul_assoc p.1 q.1 (φ q.2)
  exact hAux (S₁ d)

private theorem cf_liftDockOp_comp (g : Mat5) (T₁ T₂ : DockOp)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    liftDockOp g T₁ (liftDockOp g T₂ ψ) = liftDockOp g (fun φ => T₁ (T₂ φ)) ψ := by
  funext c
  change T₁ (dockSlice g c (liftDockOp g T₂ ψ)) (c.lookup g) = T₁ (T₂ (dockSlice g c ψ)) (c.lookup g)
  have hSl : dockSlice g c (liftDockOp g T₂ ψ) = T₂ (dockSlice g c ψ) := by
    funext d
    change liftDockOp g T₂ ψ (c.setDock g d) = T₂ (dockSlice g c ψ) d
    unfold liftDockOp
    rw [lookup_setDock, ite_eq_left rfl]
    have hEq : dockSlice g (c.setDock g d) ψ = dockSlice g c ψ := by
      funext d'; unfold dockSlice; exact congrArg ψ (setDock_setDock_same c g d d')
    rw [hEq]
  rw [hSl]

private theorem cf_liftDockOp_comm_sites (g₁ g₂ : Mat5) (S₁ S₂ : DockStencil)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hne : g₁ ≠ g₂) :
    liftDockOp g₁ (applyStencil S₁) (liftDockOp g₂ (applyStencil S₂) ψ) =
      liftDockOp g₂ (applyStencil S₂) (liftDockOp g₁ (applyStencil S₁) ψ) := by
  funext c; unfold liftDockOp applyStencil dockSlice; dsimp only
  have hL : sumList (S₁ (c.lookup g₁)) (fun p =>
        NinthLoc6.mul p.1 (sumList (S₂ ((c.setDock g₁ p.2).lookup g₂))
          (fun q => NinthLoc6.mul q.1 (ψ ((c.setDock g₁ p.2).setDock g₂ q.2))))) =
      sumList (S₁ (c.lookup g₁)) (fun p => sumList (S₂ (c.lookup g₂)) (fun q =>
        NinthLoc6.mul (NinthLoc6.mul p.1 q.1) (ψ ((c.setDock g₁ p.2).setDock g₂ q.2)))) := by
    apply cf_sumNloc_congr; intro p _
    rw [lookup_setDock, ite_eq_right hne.symm, ← cf_sumNloc_mul_left]
    apply cf_sumNloc_congr; intro q _; rw [NinthLoc6.mul_assoc]
  have hR : sumList (S₂ (c.lookup g₂)) (fun q =>
        NinthLoc6.mul q.1 (sumList (S₁ ((c.setDock g₂ q.2).lookup g₁))
          (fun p => NinthLoc6.mul p.1 (ψ ((c.setDock g₂ q.2).setDock g₁ p.2))))) =
      sumList (S₂ (c.lookup g₂)) (fun q => sumList (S₁ (c.lookup g₁)) (fun p =>
        NinthLoc6.mul (NinthLoc6.mul p.1 q.1) (ψ ((c.setDock g₁ p.2).setDock g₂ q.2)))) := by
    apply cf_sumNloc_congr; intro q _
    rw [lookup_setDock, ite_eq_right hne, ← cf_sumNloc_mul_left]
    apply cf_sumNloc_congr; intro p _
    rw [← NinthLoc6.mul_assoc, NinthLoc6.mul_comm q.1 p.1, setDock_setDock_comm c g₁ g₂ p.2 q.2 hne]
  rw [hL, hR, cf_sumNloc_swap]

private theorem cf_liftDockOp_comm_disjoint_edge (g : Mat5) (T : DockOp) (e : FacetEdge)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hnu : g ≠ e.u) (hnv : g ≠ e.v) :
    liftDockOp g T (edgeSwapOp e.u e.a ψ) = edgeSwapOp e.u e.a (liftDockOp g T ψ) := by
  have hLk : ∀ c : HoneycombConfig, (swapFacetEdge e.u e.a c).lookup g = c.lookup g := by
    intro c; funext s; rw [cf_lookup_swapFacetEdge]
    have hp1 : (g, s) ≠ (e.u, e.a) := fun h => hnu (congrArg Prod.fst h)
    have hp2 : (g, s) ≠ facetMate (e.u, e.a) := fun h => hnv (congrArg Prod.fst h)
    rw [ite_eq_right hp1, ite_eq_right hp2]
  have hSet : ∀ (c : HoneycombConfig) (d : FullDock),
      swapFacetEdge e.u e.a (c.setDock g d) = (swapFacetEdge e.u e.a c).setDock g d := by
    intro c d; apply honeycombConfig_ext; intro x; funext s
    rw [cf_lookup_swapFacetEdge]
    if hxg : x = g then
      have hp1 : (x, s) ≠ (e.u, e.a) := fun h => hnu (by rw [← hxg]; exact congrArg Prod.fst h)
      have hp2 : (x, s) ≠ facetMate (e.u, e.a) := fun h => hnv (by rw [← hxg]; exact congrArg Prod.fst h)
      rw [ite_eq_right hp1, ite_eq_right hp2, lookup_setDock, ite_eq_left hxg,
          lookup_setDock, ite_eq_left hxg]
    else
      have hnv' : mat5Mul e.u (transport e.a) ≠ g := hnv.symm
      rw [lookup_setDock, ite_eq_right hnv',
          lookup_setDock, ite_eq_right hnu.symm,
          lookup_setDock, ite_eq_right hxg,
          lookup_setDock, ite_eq_right hxg,
          cf_lookup_swapFacetEdge]
  funext c
  change T (fun d => ψ (swapFacetEdge e.u e.a (c.setDock g d))) (c.lookup g) =
    T (fun d => ψ ((swapFacetEdge e.u e.a c).setDock g d)) ((swapFacetEdge e.u e.a c).lookup g)
  rw [hLk c]
  have hFun : (fun d => ψ (swapFacetEdge e.u e.a (c.setDock g d))) =
      (fun d => ψ ((swapFacetEdge e.u e.a c).setDock g d)) := funext (fun d => congrArg ψ (hSet c d))
  rw [hFun]

/-- Exact 1-dock stencils for Vibe's microscopic operators: `R`, `Φ_odd`, `D`, `K`, `M_meet`, `M_pair`,
    the 7-layer on-site block `L_g`, and the dressed 1-dock gate `W_g = L_g ∘ R_g`. -/
def revStencil (d : FullDock) : List (NinthLoc6 × FullDock) := [(NinthLoc6.one, revFullDock d)]

def phiOddStencil (χ : ChiralInvariant) (g : Mat5) (d : FullDock) : List (NinthLoc6 × FullDock) :=
  [(NinthLoc6.zeta6Pow (dockParity g * χ.chi d), d)]

def lineHalfCoinStencil (l : Fin 12) (d : FullDock) : List (NinthLoc6 × FullDock) :=
  let p := if isFullLine d l then NinthLoc6.zeta6 else NinthLoc6.one
  if isLoneLine d l then
    [(NinthLoc6.mul p NinthLoc6.coinDiag, d), (NinthLoc6.mul p NinthLoc6.coinOff, swapLineSlotsDock l d)]
  else [(p, d)]

def lineBounceKStencil (l : Fin 12) (d : FullDock) : List (NinthLoc6 × FullDock) :=
  if isOppSignLine d l then [(NinthLoc6.neg NinthLoc6.one, swapLineSlotsDock l d)]
  else [(NinthLoc6.one, d)]

def lineMeetStencil (l : Fin 12) (d : FullDock) : List (NinthLoc6 × FullDock) :=
  let p := if isSameSignEqRoleLine d l then NinthLoc6.omega else NinthLoc6.one
  if isSameSignDiffRoleLine d l then
    [(NinthLoc6.mul p NinthLoc6.meetKeep, d), (NinthLoc6.mul p NinthLoc6.meetSwap, swapLineRolesDock l d)]
  else [(p, d)]

def mpairStencil (d : FullDock) : List (NinthLoc6 × FullDock) :=
  if isSoleIdentPairDock d then
    (NinthLoc6.one, d) :: (List.finRange 12).map (fun m => (NinthLoc6.pairHop, moveSolePairDock m d))
  else [(NinthLoc6.one, d)]

def composeLineStencils (f : Fin 12 → DockStencil) : List (Fin 12) → DockStencil
  | [] => idStencil
  | l :: ls => compStencil (f l) (composeLineStencils f ls)

def halfCoinStencil : DockStencil := composeLineStencils lineHalfCoinStencil (List.finRange 12)
def bounceKStencil : DockStencil := composeLineStencils lineBounceKStencil (List.finRange 12)
def meetStencil : DockStencil := composeLineStencils lineMeetStencil (List.finRange 12)

def vibeLocalStencil (χ : ChiralInvariant) (g : Mat5) : DockStencil :=
  compStencil (phiOddStencil χ g)
    (compStencil halfCoinStencil
      (compStencil meetStencil
        (compStencil mpairStencil
          (compStencil bounceKStencil
            (compStencil halfCoinStencil (phiOddStencil χ g))))))

def vibeDressedStencil (χ : ChiralInvariant) (g : Mat5) : DockStencil :=
  compStencil (vibeLocalStencil χ g) revStencil

abbrev siteRevOp (g : Mat5) := liftDockOp g (applyStencil revStencil)
abbrev siteLocalOp (χ : ChiralInvariant) (g : Mat5) := liftDockOp g (applyStencil (vibeLocalStencil χ g))
abbrev siteDressedOp (χ : ChiralInvariant) (g : Mat5) := liftDockOp g (applyStencil (vibeDressedStencil χ g))

private theorem cf_line_geom :
    (∀ l : Fin 12, oppSlot (lineA l) = lineB l ∧ oppSlot (lineB l) = lineA l ∧ lineA l ≠ lineB l) ∧
    (∀ l₁ l₂ : Fin 12, l₁ ≠ l₂ →
      lineA l₁ ≠ lineA l₂ ∧ lineA l₁ ≠ lineB l₂ ∧ lineB l₁ ≠ lineA l₂ ∧ lineB l₁ ≠ lineB l₂) := by
  decide

private theorem cf_apply_revStencil (φ : FockVec NinthLoc6 FullDock) (d : FullDock) :
    applyStencil revStencil φ d = φ (revFullDock d) := by
  simp only [applyStencil, revStencil, sumList]; rw [NinthLoc6.one_mul, StarCommRing.add_zero]

private theorem cf_sumNloc_revStencil (φ : FockVec NinthLoc6 FullDock) (d : FullDock) :
    sumList (revStencil d) (fun p => NinthLoc6.mul p.1 (φ p.2)) = φ (revFullDock d) :=
  cf_apply_revStencil φ d

private def cf_RevComm (S : DockStencil) : Prop :=
  ∀ (φ : FockVec NinthLoc6 FullDock) (d : FullDock),
    applyStencil S (applyStencil revStencil φ) d = applyStencil revStencil (applyStencil S φ) d

private theorem cf_revComm_comp {S₁ S₂ : DockStencil}
    (h1 : cf_RevComm S₁) (h2 : cf_RevComm S₂) : cf_RevComm (compStencil S₁ S₂) := by
  intro φ d
  rw [cf_applyStencil_comp, cf_apply_revStencil, cf_applyStencil_comp,
      funext (h2 φ), h1 (applyStencil S₂ φ) d, cf_apply_revStencil]

private theorem cf_revComm_composeLines (f : Fin 12 → DockStencil)
    (hf : ∀ l : Fin 12, cf_RevComm (f l)) (ls : List (Fin 12)) :
    cf_RevComm (composeLineStencils f ls) := by
  induction ls with
  | nil =>
    intro φ d; simp only [composeLineStencils]
    rw [cf_applyStencil_id, cf_apply_revStencil, cf_apply_revStencil, cf_applyStencil_id]
  | cons l _ ih => exact cf_revComm_comp (hf l) ih

private theorem cf_revFullDock_swapLineSlots (l : Fin 12) (d : FullDock) :
    revFullDock (swapLineSlotsDock l d) = swapLineSlotsDock l (revFullDock d) := by
  have ⟨hAB, hBA, hne⟩ := cf_line_geom.1 l
  funext s; unfold revFullDock swapLineSlotsDock
  if hsA : s = lineA l then simp only [hsA, hAB, hBA, ite_eq_right hne.symm, ite_true]
  else if hsB : s = lineB l then simp only [hsB, hBA, hAB, ite_eq_right hne.symm, ite_true]
  else
    have hO1 : oppSlot s ≠ lineA l := fun e => hsB (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hAB])
    have hO2 : oppSlot s ≠ lineB l := fun e => hsA (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hBA])
    simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hO1, ite_eq_right hO2]

private theorem cf_revFullDock_swapLineRoles (l : Fin 12) (d : FullDock) :
    revFullDock (swapLineRolesDock l d) = swapLineRolesDock l (revFullDock d) := by
  have ⟨hAB, hBA, hne⟩ := cf_line_geom.1 l
  funext s; unfold revFullDock swapLineRolesDock
  dsimp only
  rw [hAB, hBA]
  cases d (lineA l) with
  | empty => cases d (lineB l) <;> rfl
  | occ _ _ =>
    cases d (lineB l) with
    | empty => rfl
    | occ _ _ =>
      if hsA : s = lineA l then simp only [hsA, hAB, ite_eq_right hne.symm, ite_true]
      else if hsB : s = lineB l then simp only [hsB, hBA, ite_eq_right hne.symm, ite_true]
      else
        have hO1 : oppSlot s ≠ lineA l := fun e => hsB (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hAB])
        have hO2 : oppSlot s ≠ lineB l := fun e => hsA (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hBA])
        simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hO1, ite_eq_right hO2]

private theorem cf_rev_preserves_solePair (d : FullDock) :
    isSoleIdentPairDock (revFullDock d) = isSoleIdentPairDock d ∧
    (∀ m : Fin 12, isSoleIdentPairDock d = true →
      revFullDock (moveSolePairDock m d) = moveSolePairDock m (revFullDock d)) := by
  have hAt : ∀ l : Fin 12, isSoleIdentPairAt (revFullDock d) l = isSoleIdentPairAt d l := by
    intro l; have ⟨hAB, hBA, _⟩ := cf_line_geom.1 l
    unfold isSoleIdentPairAt isSameSignEqRoleLine revFullDock; rw [hAB, hBA]
    have h1 : (match d (lineB l), d (lineA l) with | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA = rB) | _, _ => false) =
              (match d (lineA l), d (lineB l) with | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA = rB) | _, _ => false) := by
      cases d (lineA l) with
      | empty => cases d (lineB l) <;> rfl
      | occ sA rA => cases d (lineB l) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have h2 : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d (oppSlot s) = .empty)) =
              (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty)) := by
      cases hL : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d (oppSlot s) = .empty)) <;>
      cases hR : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty))
      · rfl
      · exfalso; have hall := (list_all_eq_true_iff _ _).mp hR
        have hT : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d (oppSlot s) = .empty)) = true := by
          refine (list_all_eq_true_iff _ _).mpr fun s _ => ?_
          rcases of_decide_eq_true (hall (oppSlot s) (mem_finRange24 _)) with hA | hB | hE
          · exact decide_eq_true (Or.inr (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hA, hAB])))
          · exact decide_eq_true (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hB, hBA]))
          · exact decide_eq_true (Or.inr (Or.inr hE))
        rw [hL] at hT; exact Bool.noConfusion hT
      · exfalso; have hall := (list_all_eq_true_iff _ _).mp hL
        have hT : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty)) = true := by
          refine (list_all_eq_true_iff _ _).mpr fun s _ => ?_
          have hS := hall (oppSlot s) (mem_finRange24 _)
          rw [(thm_24_facets_geometry.2.1 s).1] at hS
          rcases of_decide_eq_true hS with hA | hB | hE
          · exact decide_eq_true (Or.inr (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hA, hAB])))
          · exact decide_eq_true (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hB, hBA]))
          · exact decide_eq_true (Or.inr (Or.inr hE))
        rw [hR] at hT; exact Bool.noConfusion hT
      · rfl
    have hAnd : ∀ a b c d : Bool, a = b → c = d → (a && c) = (b && d) := by
      intro a b c d ha hb; rw [ha, hb]
    exact hAnd _ _ _ _ h1 h2
  have hFind : findSolePairLine (revFullDock d) = findSolePairLine d := by
    unfold findSolePairLine
    have hFun : (fun l => isSoleIdentPairAt (revFullDock d) l) = (fun l => isSoleIdentPairAt d l) := funext hAt
    rw [hFun]
  refine ⟨by unfold isSoleIdentPairDock; rw [hFind], ?_⟩
  intro m hAct; unfold isSoleIdentPairDock at hAct
  cases hf : findSolePairLine d with
  | none => rw [hf] at hAct; exact Bool.noConfusion hAct
  | some l =>
    have hSame := ((Bool.and_eq_true _ _).mp (find?_eq_some_iff _ _ _ hf).2).1
    have hEqAB : d (lineB l) = d (lineA l) := by
      unfold isSameSignEqRoleLine at hSame
      cases hA : d (lineA l) <;> cases hB : d (lineB l) <;> rw [hA, hB] at hSame
      all_goals try exact Bool.noConfusion hSame
      have ⟨hs, hr⟩ := of_decide_eq_true hSame; rw [hs, hr]
    funext s
    change (moveSolePairDock m d) (oppSlot s) = (moveSolePairDock m (revFullDock d)) s
    unfold moveSolePairDock; rw [hFind, hf]; dsimp only
    unfold revFullDock; rw [(cf_line_geom.1 l).1, hEqAB]
    have ⟨hmAB, hmBA, _⟩ := cf_line_geom.1 m
    if hs : s = lineA m ∨ s = lineB m then
      have hO : oppSlot s = lineA m ∨ oppSlot s = lineB m := by
        rcases hs with h1 | h2
        · exact Or.inr (by rw [h1, hmAB])
        · exact Or.inl (by rw [h2, hmBA])
      rw [ite_eq_left hO, ite_eq_left hs]
    else
      have hO : ¬ (oppSlot s = lineA m ∨ oppSlot s = lineB m) := fun h => hs (by
        rcases h with h1 | h2
        · exact Or.inr (by rw [← (thm_24_facets_geometry.2.1 s).1, h1, hmAB])
        · exact Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, h2, hmBA]))
      rw [ite_eq_right hO, ite_eq_right hs]

private theorem cf_revComm_vibeLocal (χ : ChiralInvariant) (g : Mat5) :
    cf_RevComm (vibeLocalStencil χ g) := by
  have hPhi : cf_RevComm (phiOddStencil χ g) := by
    intro φ d; rw [cf_apply_revStencil]
    simp only [applyStencil, phiOddStencil, sumList, cf_sumNloc_revStencil, χ.chi_rev d]
  have hD : cf_RevComm halfCoinStencil := by
    apply cf_revComm_composeLines; intro l φ d
    have ⟨hAB, hBA, _⟩ := cf_line_geom.1 l
    have hFull : isFullLine (revFullDock d) l = isFullLine d l := by
      unfold isFullLine revFullDock; rw [hAB, hBA]
      cases d (lineA l) <;> cases d (lineB l) <;> rfl
    have hLone : isLoneLine (revFullDock d) l = isLoneLine d l := by
      unfold isLoneLine revFullDock; rw [hAB, hBA]
      cases d (lineA l) <;> cases d (lineB l) <;> rfl
    rw [cf_apply_revStencil]
    unfold applyStencil lineHalfCoinStencil
    dsimp only; rw [hFull, hLone]
    cases isLoneLine d l with
    | false =>
      rw [ite_bool_false, ite_bool_false]
      simp only [sumList, cf_sumNloc_revStencil]
    | true =>
      rw [ite_bool_true, ite_bool_true]
      simp only [sumList, cf_sumNloc_revStencil, cf_revFullDock_swapLineSlots]
  have hK : cf_RevComm bounceKStencil := by
    apply cf_revComm_composeLines; intro l φ d
    have ⟨hAB, hBA, _⟩ := cf_line_geom.1 l
    have hOpp : isOppSignLine (revFullDock d) l = isOppSignLine d l := by
      unfold isOppSignLine revFullDock; rw [hAB, hBA]
      cases d (lineA l) with
      | empty => cases d (lineB l) <;> rfl
      | occ sA _ => cases d (lineB l) with | empty => rfl | occ sB _ => cases sA <;> cases sB <;> rfl
    rw [cf_apply_revStencil]
    unfold applyStencil lineBounceKStencil
    rw [hOpp]
    cases isOppSignLine d l with
    | false => rw [ite_bool_false, ite_bool_false]; simp only [sumList, cf_sumNloc_revStencil]
    | true => rw [ite_bool_true, ite_bool_true]; simp only [sumList, cf_sumNloc_revStencil, cf_revFullDock_swapLineSlots]
  have hM : cf_RevComm meetStencil := by
    apply cf_revComm_composeLines; intro l φ d
    have ⟨hAB, hBA, _⟩ := cf_line_geom.1 l
    have hEqR : isSameSignEqRoleLine (revFullDock d) l = isSameSignEqRoleLine d l := by
      unfold isSameSignEqRoleLine revFullDock; rw [hAB, hBA]
      cases d (lineA l) with
      | empty => cases d (lineB l) <;> rfl
      | occ sA rA => cases d (lineB l) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have hDiffR : isSameSignDiffRoleLine (revFullDock d) l = isSameSignDiffRoleLine d l := by
      unfold isSameSignDiffRoleLine revFullDock; rw [hAB, hBA]
      cases d (lineA l) with
      | empty => cases d (lineB l) <;> rfl
      | occ sA rA => cases d (lineB l) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    rw [cf_apply_revStencil]
    unfold applyStencil lineMeetStencil
    dsimp only; rw [hEqR, hDiffR]
    cases isSameSignDiffRoleLine d l with
    | false => rw [ite_bool_false, ite_bool_false]; simp only [sumList, cf_sumNloc_revStencil]
    | true => rw [ite_bool_true, ite_bool_true]; simp only [sumList, cf_sumNloc_revStencil, cf_revFullDock_swapLineRoles]
  have hP : cf_RevComm mpairStencil := by
    intro φ d
    rw [cf_apply_revStencil]
    unfold applyStencil mpairStencil
    rw [(cf_rev_preserves_solePair d).1]
    cases ha : isSoleIdentPairDock d with
    | false => rw [ite_bool_false, ite_bool_false]; simp only [sumList, cf_sumNloc_revStencil]
    | true =>
      rw [ite_bool_true, ite_bool_true]
      simp only [sumList, cf_sumNloc_map, cf_sumNloc_revStencil]
      apply congrArg (NinthLoc6.add _)
      apply cf_sumNloc_congr; intro m _
      rw [(cf_rev_preserves_solePair d).2 m ha]
  exact cf_revComm_comp hPhi (cf_revComm_comp hD (cf_revComm_comp hM (cf_revComm_comp hP (cf_revComm_comp hK (cf_revComm_comp hD hPhi)))))

/-- Headline Theorem 4 (Exact On-Site Commutation `[W_{g₁}, W_{g₂}] = 0`, `[W_g, SWAP_e] = 0`, `[R_g, L_g] = 0`, `[R, L_g] = 0`):
    every 1-dock stencil operator commutes with every 1-dock stencil at any distinct dock `g₁ ≠ g₂`,
    commutes with every disjoint facet edge swap `edgeSwapOp e` (`g ≠ e.u ∧ g ≠ e.v`), and Vibe's exact
    7-layer on-site block `siteLocalOp χ g` commutes with BOTH single-dock `siteRevOp g` and global `fockRev`. -/
theorem thm_cf_on_site_commutes_with_rev_and_disjoint_edge (χ : ChiralInvariant) :
    (∀ (g₁ g₂ : Mat5) (S₁ S₂ : DockStencil) (ψ : FockVec NinthLoc6 HoneycombConfig),
      g₁ ≠ g₂ →
      liftDockOp g₁ (applyStencil S₁) (liftDockOp g₂ (applyStencil S₂) ψ) =
        liftDockOp g₂ (applyStencil S₂) (liftDockOp g₁ (applyStencil S₁) ψ)) ∧
    (∀ (g : Mat5) (S : DockStencil) (e : FacetEdge) (ψ : FockVec NinthLoc6 HoneycombConfig),
      g ≠ e.u → g ≠ e.v →
      liftDockOp g (applyStencil S) (edgeSwapOp e.u e.a ψ) =
        edgeSwapOp e.u e.a (liftDockOp g (applyStencil S) ψ)) ∧
    (∀ (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      siteRevOp g (siteLocalOp χ g ψ) = siteLocalOp χ g (siteRevOp g ψ)) ∧
    (∀ (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      fockRev (siteLocalOp χ g ψ) = siteLocalOp χ g (fockRev ψ)) := by
  refine ⟨cf_liftDockOp_comm_sites,
          fun g S e ψ hu hv => cf_liftDockOp_comm_disjoint_edge g (applyStencil S) e ψ hu hv,
          ?_, ?_⟩
  · intro g ψ
    unfold siteRevOp siteLocalOp
    rw [cf_liftDockOp_comp, cf_liftDockOp_comp]
    funext c
    change applyStencil revStencil (applyStencil (vibeLocalStencil χ g) (dockSlice g c ψ)) (c.lookup g) =
      applyStencil (vibeLocalStencil χ g) (applyStencil revStencil (dockSlice g c ψ)) (c.lookup g)
    exact (cf_revComm_vibeLocal χ g (dockSlice g c ψ) (c.lookup g)).symm
  · intro g ψ; funext c
    change applyStencil (vibeLocalStencil χ g) (dockSlice g (revConfig c) ψ) ((revConfig c).lookup g) =
      applyStencil (vibeLocalStencil χ g) (dockSlice g c (fockRev ψ)) (c.lookup g)
    rw [lookup_revConfig]
    have h1 : applyStencil (vibeLocalStencil χ g) (dockSlice g (revConfig c) ψ) (revFullDock (c.lookup g)) =
        applyStencil revStencil (applyStencil (vibeLocalStencil χ g) (dockSlice g (revConfig c) ψ)) (c.lookup g) :=
      (cf_apply_revStencil _ _).symm
    rw [h1, ← cf_revComm_vibeLocal χ g (dockSlice g (revConfig c) ψ) (c.lookup g)]
    have hSl : applyStencil revStencil (dockSlice g (revConfig c) ψ) = dockSlice g c (fockRev ψ) := by
      funext d; rw [cf_apply_revStencil]
      change ψ ((revConfig c).setDock g (revFullDock d)) = ψ (revConfig (c.setDock g d))
      rw [cf_revConfig_setDock]
    rw [hSl]

/-- Apply a cell-indexed family of 1-dock stencils chronologically across a finite cell list `V`. -/
def applyDockOps (S : Mat5 → DockStencil) :
    List Mat5 → FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig
  | [], ψ => ψ
  | g :: rest, ψ => applyDockOps S rest (liftDockOp g (applyStencil (S g)) ψ)

abbrev regionRevOp (V : List Mat5) := applyDockOps (fun _ => revStencil) V
abbrev regionLocalOp (χ : ChiralInvariant) (V : List Mat5) := applyDockOps (vibeLocalStencil χ) V
abbrev regionDressedOp (χ : ChiralInvariant) (V : List Mat5) := applyDockOps (vibeDressedStencil χ) V

private theorem cf_regionRevOp_cons (g : Mat5) (rest : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    regionRevOp (g :: rest) ψ = regionRevOp rest (siteRevOp g ψ) := rfl

private theorem cf_regionLocalOp_cons (χ : ChiralInvariant) (g : Mat5) (rest : List Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    regionLocalOp χ (g :: rest) ψ = regionLocalOp χ rest (siteLocalOp χ g ψ) := rfl

private theorem cf_regionDressedOp_cons (χ : ChiralInvariant) (g : Mat5) (rest : List Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    regionDressedOp χ (g :: rest) ψ = regionDressedOp χ rest (siteDressedOp χ g ψ) := rfl

/-- One flat alternating 2-layer local circuit step `E_swap ∘ W` on active region `(V, E)`. -/
def regionAltStepOp (χ : ChiralInvariant) (V : List Mat5) (E : List FacetEdge)
    (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  applyEdgeOps E (regionDressedOp χ V ψ)

private def cf_revOnSites : List Mat5 → HoneycombConfig → HoneycombConfig
  | [], c => c
  | g :: rest, c => (cf_revOnSites rest c).setDock g (revFullDock ((cf_revOnSites rest c).lookup g))

private theorem cf_regionRevOp_eval (V : List Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    regionRevOp V ψ c = ψ (cf_revOnSites V c) := by
  induction V generalizing ψ with
  | nil => rfl
  | cons g rest ih =>
    rw [cf_regionRevOp_cons, ih (siteRevOp g ψ)]
    change applyStencil revStencil (dockSlice g (cf_revOnSites rest c) ψ) ((cf_revOnSites rest c).lookup g) = _
    rw [cf_apply_revStencil]; rfl

private theorem cf_siteRevOp_inv (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    siteRevOp g (siteRevOp g ψ) = ψ := by
  unfold siteRevOp; rw [cf_liftDockOp_comp]; funext c
  change applyStencil revStencil (applyStencil revStencil (dockSlice g c ψ)) (c.lookup g) = ψ c
  rw [cf_apply_revStencil, cf_apply_revStencil, cf_revFullDock_inv]
  exact congrArg ψ (setDock_lookup_self c g)

private theorem cf_regionRevOp_inv (V : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    regionRevOp V (regionRevOp V ψ) = ψ := by
  have hPush : ∀ (g : Mat5) (W : List Mat5) (φ : FockVec NinthLoc6 HoneycombConfig),
      siteRevOp g (regionRevOp W φ) = regionRevOp W (siteRevOp g φ) := by
    intro g W
    induction W with
    | nil => intro _; rfl
    | cons w _ ih =>
      intro φ; rw [cf_regionRevOp_cons, cf_regionRevOp_cons, ih]
      have hComm : siteRevOp g (siteRevOp w φ) = siteRevOp w (siteRevOp g φ) := by
        if hgw : g = w then rw [hgw]
        else exact cf_liftDockOp_comm_sites g w revStencil revStencil φ hgw
      rw [hComm]
  induction V generalizing ψ with
  | nil => rfl
  | cons g rest ih =>
    rw [cf_regionRevOp_cons, cf_regionRevOp_cons, hPush g rest, cf_siteRevOp_inv, ih]

private theorem cf_regionDressedOp_eq (χ : ChiralInvariant) (V : List Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    regionDressedOp χ V ψ = regionLocalOp χ V (regionRevOp V ψ) := by
  have hPushL : ∀ (g : Mat5) (W : List Mat5) (φ : FockVec NinthLoc6 HoneycombConfig),
      regionRevOp W (siteLocalOp χ g φ) = siteLocalOp χ g (regionRevOp W φ) := by
    intro g W
    induction W with
    | nil => intro _; rfl
    | cons w _ ih =>
      intro φ; rw [cf_regionRevOp_cons, cf_regionRevOp_cons]
      have hComm : siteRevOp w (siteLocalOp χ g φ) = siteLocalOp χ g (siteRevOp w φ) := by
        if hwg : w = g then
          rw [hwg]; exact (thm_cf_on_site_commutes_with_rev_and_disjoint_edge χ).2.2.1 g φ
        else exact cf_liftDockOp_comm_sites w g revStencil (vibeLocalStencil χ g) φ hwg
      rw [hComm, ih]
  induction V generalizing ψ with
  | nil => rfl
  | cons g rest ih =>
    rw [cf_regionDressedOp_cons, cf_regionLocalOp_cons, cf_regionRevOp_cons]
    have hStep : siteDressedOp χ g ψ = siteLocalOp χ g (siteRevOp g ψ) := by
      change liftDockOp g (applyStencil (compStencil (vibeLocalStencil χ g) revStencil)) ψ =
        liftDockOp g (applyStencil (vibeLocalStencil χ g)) (liftDockOp g (applyStencil revStencil) ψ)
      rw [cf_liftDockOp_comp]; funext c
      change applyStencil (compStencil (vibeLocalStencil χ g) revStencil) (dockSlice g c ψ) (c.lookup g) =
        applyStencil (vibeLocalStencil χ g) (applyStencil revStencil (dockSlice g c ψ)) (c.lookup g)
      exact cf_applyStencil_comp _ _ _ _
    rw [hStep, ih, hPushL g rest (siteRevOp g ψ)]

private theorem cf_lookup_revOnSites (c : HoneycombConfig) (W : List Mat5) (hWnd : IsNodup W)
    (x : Mat5) :
    (cf_revOnSites W c).lookup x = if memBool x W then revFullDock (c.lookup x) else c.lookup x := by
  induction hWnd with
  | nil => rfl
  | @cons w rest hnot _ ih =>
    simp only [cf_revOnSites]; rw [lookup_setDock]
    if hxw : x = w then
      have hMem : memBool x (w :: rest) = true := by simp only [memBool, ite_eq_left hxw.symm]
      have hNotR : memBool x rest = false := by
        cases hm : memBool x rest with
        | false => rfl
        | true => rw [hxw] at hm; exact absurd ((memBool_eq_true_iff w rest).mp hm) hnot
      rw [ite_eq_left hMem, ite_eq_left hxw, ← hxw, ih, hNotR, ite_bool_false]
    else
      have hMem : memBool x (w :: rest) = memBool x rest := by
        simp only [memBool, ite_eq_right (Ne.symm hxw)]
      rw [ite_eq_right hxw, hMem, ih]

/-- Headline Theorem 5 (Exact Beat Factorization `U^T = R ∘ (E_swap ∘ W)^T ∘ R` on Active Regions):
    for EVERY `ChiralInvariant χ`, region `(V, E)`, state `ψ`, and beat count `T : Nat`:
    1. `regionRevOp V` is an exact involution,
    2. `regionDressedOp χ V ψ = regionLocalOp χ V (regionRevOp V ψ)`,
    3. `regionRevOp V (iter (regionAltStepOp χ V E) T (regionRevOp V ψ))` equals `T` iterations of
       the factorized beat `R_V ∘ E_swap ∘ L_V`,
    4. on any configuration `c` covered by `(V, E)`, `regionRevOp V (applyEdgeOps E φ) c = fockStream φ c`. -/
theorem thm_cf_beat_factorization_R_Eswap_W (χ : ChiralInvariant)
    (V : List Mat5) (E : List FacetEdge) :
    (∀ ψ, regionRevOp V (regionRevOp V ψ) = ψ) ∧
    (∀ ψ, regionDressedOp χ V ψ = regionLocalOp χ V (regionRevOp V ψ)) ∧
    (∀ (T : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig),
      regionRevOp V (iter (regionAltStepOp χ V E) T (regionRevOp V ψ)) =
        iter (fun φ => regionRevOp V (applyEdgeOps E (regionLocalOp χ V φ))) T ψ) ∧
    (IsNodup V → IsNodup E →
      ∀ (c : HoneycombConfig) (φ : FockVec NinthLoc6 HoneycombConfig),
        (∀ g, g ∈ c.activeDocks → g ∈ V) →
        (∀ g, g ∈ c.activeDocks → ∀ a : Fin 24, edgeOfSlot g a ∈ E) →
        regionRevOp V (applyEdgeOps E φ) c = fockStream φ c) := by
  refine ⟨cf_regionRevOp_inv V, cf_regionDressedOp_eq χ V, ?_, ?_⟩
  · intro T
    induction T with
    | zero => intro ψ; exact cf_regionRevOp_inv V ψ
    | succ _ ih =>
      intro ψ; simp only [iter]
      rw [← ih ψ]; unfold regionAltStepOp
      rw [cf_regionDressedOp_eq χ V]
  · intro hVnd hEnd c φ hVcov hEcov
    have hRevEq : cf_revOnSites V c = revConfig c := by
      apply honeycombConfig_ext; intro x
      rw [cf_lookup_revOnSites c V hVnd x, lookup_revConfig]
      cases hm : memBool x V with
      | true => rw [ite_bool_true]
      | false =>
        rw [ite_bool_false]
        have h0 : c.lookup x = v1FullDock := by
          if h : c.lookup x = v1FullDock then exact h
          else
            have ht := (memBool_eq_true_iff x V).mpr (hVcov x ((mem_activeDocks_iff c x).mpr h))
            rw [hm] at ht; exact Bool.noConfusion ht
        rw [h0]; rfl
    rw [cf_regionRevOp_eval, hRevEq]
    exact ((thm_cf_stream_eq_rev_comp_edge_swap c E hEnd hEcov).2.2.1 φ).symm


/-! ## Section 3: Abstract & Concrete Discrete Tomonaga-Schwinger Foliation Invariance -/

/-- Valid duplicate-free topological execution schedule respecting strict causal dependence `dep`:
    no causal predecessor `u` (`dep u e`) ever fires after `e`. -/
inductive IsCausalSchedule {Ev : Type} (dep : Ev → Ev → Prop) : List Ev → Prop where
  | nil : IsCausalSchedule dep []
  | cons {e : Ev} {rest : List Ev} :
      e ∉ rest →
      (∀ u : Ev, u ∈ rest → ¬ dep u e) →
      IsCausalSchedule dep rest →
      IsCausalSchedule dep (e :: rest)

/-- Chronological execution of an event schedule `π` on an arbitrary state space `State`. -/
def execSchedule {Ev State : Type} (act : Ev → State → State) : List Ev → State → State
  | [], s => s
  | e :: rest, s => execSchedule act rest (act e s)

private theorem cf_execSchedule_append {Ev State : Type} (act : Ev → State → State)
    (π₁ π₂ : List Ev) (s : State) :
    execSchedule act (π₁ ++ π₂) s = execSchedule act π₂ (execSchedule act π₁ s) := by
  induction π₁ generalizing s with
  | nil => rfl
  | cons e rest ih => simp only [List.cons_append, execSchedule]; exact ih (act e s)

private theorem cf_bubble_to_front {Ev State : Type}
    (dep : Ev → Ev → Prop) (act : Ev → State → State)
    (hComm : ∀ (u v : Ev) (s : State), ¬ dep u v → ¬ dep v u → act u (act v s) = act v (act u s))
    (π : List Ev) (hSched : IsCausalSchedule dep π)
    (a : Ev) (ha : a ∈ π) (hMin : ∀ x : Ev, x ∈ π → x ≠ a → ¬ dep x a) :
    ∃ π' : List Ev,
      IsCausalSchedule dep π' ∧
      (∀ x : Ev, x ∈ π' ↔ x ∈ π ∧ x ≠ a) ∧
      (∀ s : State, execSchedule act π s = execSchedule act π' (act a s)) := by
  induction hSched with
  | nil => cases ha
  | @cons b rs hbNot hbNoPred hRs ih =>
    cases ha with
    | head =>
      refine ⟨rs, hRs, fun x => ?_, fun _ => rfl⟩
      exact ⟨fun hx => ⟨List.Mem.tail a hx, fun hxa => by rw [hxa] at hx; exact hbNot hx⟩,
             fun ⟨hm, hne⟩ => match hm with | List.Mem.head _ => absurd rfl hne | List.Mem.tail _ h' => h'⟩
    | tail _ haRs =>
      have hba : b ≠ a := fun e => by rw [e] at hbNot; exact hbNot haRs
      obtain ⟨rs', hRs', hMemRs', hExecRs'⟩ :=
        ih haRs (fun x hx hxa => hMin x (List.Mem.tail b hx) hxa)
      refine ⟨b :: rs', ?_, ?_, ?_⟩
      · refine IsCausalSchedule.cons (fun h => hbNot ((hMemRs' b).mp h).1) ?_ hRs'
        intro u hu; exact hbNoPred u ((hMemRs' u).mp hu).1
      · intro x
        constructor
        · intro hx
          cases hx with
          | head => exact ⟨List.Mem.head rs, hba⟩
          | tail _ h' =>
            have ⟨hm, hne⟩ := (hMemRs' x).mp h'
            exact ⟨List.Mem.tail b hm, hne⟩
        · intro ⟨hm, hne⟩
          cases hm with
          | head => exact List.Mem.head rs'
          | tail _ h' => exact List.Mem.tail b ((hMemRs' x).mpr ⟨h', hne⟩)
      · intro s
        simp only [execSchedule]
        rw [hExecRs' (act b s), hComm a b s (hbNoPred a haRs) (hMin b (List.Mem.head rs) hba)]

/-- Headline Theorem 6 (Abstract Discrete Tomonaga-Schwinger / Mazurkiewicz Foliation Invariance):
    for ANY causal event system `(Ev, dep, act)` where independent events commute, ANY two valid
    topological schedules `π₁, π₂` executing the same finite causal event set produce the EXACT SAME
    final state `execSchedule act π₁ s = execSchedule act π₂ s`. -/
theorem thm_cf_tomonaga_schwinger_foliation_invariance {Ev State : Type}
    (dep : Ev → Ev → Prop) (act : Ev → State → State)
    (hComm : ∀ (u v : Ev) (s : State), ¬ dep u v → ¬ dep v u → act u (act v s) = act v (act u s))
    (π₁ π₂ : List Ev)
    (h1 : IsCausalSchedule dep π₁) (h2 : IsCausalSchedule dep π₂)
    (hSame : ∀ e : Ev, e ∈ π₁ ↔ e ∈ π₂)
    (s : State) :
    execSchedule act π₁ s = execSchedule act π₂ s := by
  induction h1 generalizing π₂ s with
  | nil =>
    cases π₂ with
    | nil => rfl
    | cons x _ => cases (hSame x).mpr (List.Mem.head _)
  | @cons a rest₁ haNot haNoPred _ ih =>
    have ha2 : a ∈ π₂ := (hSame a).mp (List.Mem.head rest₁)
    have hMin : ∀ x : Ev, x ∈ π₂ → x ≠ a → ¬ dep x a := by
      intro x hx hxa
      cases (hSame x).mpr hx with
      | head => exact absurd rfl hxa
      | tail _ hxRest => exact haNoPred x hxRest
    obtain ⟨π₂', h2', hMem2', hExec2'⟩ := cf_bubble_to_front dep act hComm π₂ h2 a ha2 hMin
    simp only [execSchedule]
    rw [hExec2' s]
    apply ih π₂' h2' ?_ (act a s)
    intro x
    rw [hMem2' x]
    constructor
    · intro hx
      exact ⟨(hSame x).mp (List.Mem.tail a hx), fun hxa => by rw [hxa] at hx; exact haNot hx⟩
    · intro ⟨hx2, hne⟩
      cases (hSame x).mpr hx2 with
      | head => exact absurd rfl hne
      | tail _ h' => exact h'

/-! ### Concrete `{3,4,3,4}` Microscopic Causal Event System & Discrete Cauchy Surfaces -/

/-- Elementary microscopic causal event on infinite `{3,4,3,4}`:
    dock tick `V(g, n)` applying `W_g = L_g ∘ R_g`, or facet swap `X(e, n)` applying `SWAP_e`. -/
inductive VibeEvent where
  | dock (g : Mat5) (tick : Nat)
  | edge (e : FacetEdge) (tick : Nat)
  deriving DecidableEq

/-- Direct (1-hop) local causal dependence / Mazurkiewicz conflict relation generated by
    `V(g, n) ≺ X(e, n) ≺ V(g, n + 1)` for `g ∈ e` (whose transitive closure is the causal partial order). -/
def vibeDep : VibeEvent → VibeEvent → Prop
  | .dock g₁ n₁, .dock g₂ n₂ => g₁ = g₂ ∧ n₁ < n₂
  | .edge e₁ n₁, .edge e₂ n₂ => e₁ = e₂ ∧ n₁ < n₂
  | .dock g n₁,  .edge e n₂  => (g = e.u ∨ g = e.v) ∧ n₁ ≤ n₂
  | .edge e n₁,  .dock g n₂  => (g = e.u ∨ g = e.v) ∧ n₁ < n₂

/-- Exact Fock-space operator of each elementary microscopic causal event. -/
def vibeEventOp (χ : ChiralInvariant) :
    VibeEvent → FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig
  | .dock g _, ψ => siteDressedOp χ g ψ
  | .edge e _, ψ => edgeSwapOp e.u e.a ψ

private theorem cf_siteDressed_comm_disjoint_edge (χ : ChiralInvariant) (g : Mat5) (e : FacetEdge)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hnu : g ≠ e.u) (hnv : g ≠ e.v) :
    siteDressedOp χ g (edgeSwapOp e.u e.a ψ) = edgeSwapOp e.u e.a (siteDressedOp χ g ψ) :=
  cf_liftDockOp_comm_disjoint_edge g (applyStencil (vibeDressedStencil χ g)) e ψ hnu hnv

private theorem cf_vibeEvent_comm_indep (χ : ChiralInvariant) (u v : VibeEvent)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (huv : ¬ vibeDep u v) (hvu : ¬ vibeDep v u) :
    vibeEventOp χ u (vibeEventOp χ v ψ) = vibeEventOp χ v (vibeEventOp χ u ψ) := by
  cases u with
  | dock g₁ n₁ =>
    cases v with
    | dock g₂ _n₂ =>
      dsimp only [vibeEventOp]
      if hEq : g₁ = g₂ then rw [hEq]
      else exact cf_liftDockOp_comm_sites g₁ g₂ (vibeDressedStencil χ g₁) (vibeDressedStencil χ g₂) ψ hEq
    | edge e n₂ =>
      dsimp only [vibeEventOp]
      have hDisj : g₁ ≠ e.u ∧ g₁ ≠ e.v := by
        refine ⟨fun hu => ?_, fun hv => ?_⟩
        · if hle : n₁ ≤ n₂ then exact huv ⟨Or.inl hu, hle⟩ else exact hvu ⟨Or.inl hu, by omega⟩
        · if hle : n₁ ≤ n₂ then exact huv ⟨Or.inr hv, hle⟩ else exact hvu ⟨Or.inr hv, by omega⟩
      exact cf_siteDressed_comm_disjoint_edge χ g₁ e ψ hDisj.1 hDisj.2
  | edge e₁ n₁ =>
    cases v with
    | dock g₂ n₂ =>
      dsimp only [vibeEventOp]
      have hDisj : g₂ ≠ e₁.u ∧ g₂ ≠ e₁.v := by
        refine ⟨fun hu => ?_, fun hv => ?_⟩
        · if hle : n₂ ≤ n₁ then exact hvu ⟨Or.inl hu, hle⟩ else exact huv ⟨Or.inl hu, by omega⟩
        · if hle : n₂ ≤ n₁ then exact hvu ⟨Or.inr hv, hle⟩ else exact huv ⟨Or.inr hv, by omega⟩
      exact (cf_siteDressed_comm_disjoint_edge χ g₂ e₁ ψ hDisj.1 hDisj.2).symm
    | edge e₂ _n₂ =>
      dsimp only [vibeEventOp]
      if hEq : e₁ = e₂ then rw [hEq]
      else
        have hEdgeNe : edgeOfSlot e₁.u e₁.a ≠ edgeOfSlot e₂.u e₂.a := by
          rw [cf_edgeOfSlot_self e₁, cf_edgeOfSlot_self e₂]; exact hEq
        exact (thm_cf_edge_swap_involution_and_comm e₁.u e₂.u e₁.a e₂.a).2.2.2 hEdgeNe ψ

/-- Local proper-time clock field (discrete Cauchy surface) on infinite `{3,4,3,4}`. -/
structure CauchyCut where
  tauV : Mat5 → Nat
  tauE : FacetEdge → Nat

/-- Flat initial Cauchy cut `τ_V ≡ 0, τ_E ≡ 0` across infinite `{3,4,3,4}`. -/
def zeroCut : CauchyCut := ⟨fun _ => 0, fun _ => 0⟩

/-- Exact spacelike causal cut validity: `τ_V(g) - 1 ≤ τ_E(e) ≤ τ_V(g)` at both endpoints of every edge. -/
def IsValidCut (σ : CauchyCut) : Prop :=
  ∀ e : FacetEdge,
    σ.tauE e ≤ σ.tauV e.u ∧ σ.tauE e ≤ σ.tauV e.v ∧
    σ.tauV e.u ≤ σ.tauE e + 1 ∧ σ.tauV e.v ≤ σ.tauE e + 1

/-- Strictly local event readiness predicate requiring zero global clock. -/
def EventEnabled (σ : CauchyCut) : VibeEvent → Prop
  | .dock g n => σ.tauV g = n ∧ ∀ a : Fin 24, σ.tauE (edgeOfSlot g a) = n
  | .edge e n => σ.tauE e = n ∧ σ.tauV e.u = n + 1 ∧ σ.tauV e.v = n + 1

/-- Advance a Cauchy surface by firing one local event. -/
def advanceCut (σ : CauchyCut) : VibeEvent → CauchyCut
  | .dock g _ => ⟨fun x => if x = g then σ.tauV g + 1 else σ.tauV x, σ.tauE⟩
  | .edge e _ => ⟨σ.tauV, fun x => if x = e then σ.tauE e + 1 else σ.tauE x⟩

private theorem cf_cauchyCut_ext {σ₁ σ₂ : CauchyCut}
    (hV : σ₁.tauV = σ₂.tauV) (hE : σ₁.tauE = σ₂.tauE) : σ₁ = σ₂ := by
  cases σ₁; cases σ₂; cases hV; cases hE; rfl

private theorem cf_advanceCut_dock_tauV (σ : CauchyCut) (g : Mat5) (n : Nat) (x : Mat5) :
    (advanceCut σ (.dock g n)).tauV x = if x = g then σ.tauV g + 1 else σ.tauV x := rfl

private theorem cf_advanceCut_dock_tauE (σ : CauchyCut) (g : Mat5) (n : Nat) (x : FacetEdge) :
    (advanceCut σ (.dock g n)).tauE x = σ.tauE x := rfl

private theorem cf_advanceCut_edge_tauV (σ : CauchyCut) (e : FacetEdge) (n : Nat) (x : Mat5) :
    (advanceCut σ (.edge e n)).tauV x = σ.tauV x := rfl

private theorem cf_advanceCut_edge_tauE (σ : CauchyCut) (e : FacetEdge) (n : Nat) (x : FacetEdge) :
    (advanceCut σ (.edge e n)).tauE x = if x = e then σ.tauE e + 1 else σ.tauE x := rfl

private theorem cf_advanceCut_valid (σ : CauchyCut) (ev : VibeEvent)
    (hCut : IsValidCut σ) (hEn : EventEnabled σ ev) : IsValidCut (advanceCut σ ev) := by
  intro e'
  obtain ⟨h1, h2, h3, h4⟩ := hCut e'
  cases ev with
  | dock g n =>
    have hVg := hEn.1
    rw [cf_advanceCut_dock_tauE, cf_advanceCut_dock_tauV, cf_advanceCut_dock_tauV]
    if hu : e'.u = g then
      have hEu := hEn.2 e'.a; rw [← hu, cf_edgeOfSlot_self] at hEu
      if hv : e'.v = g then
        rw [ite_eq_left hu, ite_eq_left hv]; omega
      else
        rw [ite_eq_left hu, ite_eq_right hv]; omega
    else
      if hv : e'.v = g then
        have hEv := hEn.2 e'.oppA; rw [← hv, cf_edgeOfSlot_mate_self] at hEv
        rw [ite_eq_right hu, ite_eq_left hv]; omega
      else
        rw [ite_eq_right hu, ite_eq_right hv]; omega
  | edge e n =>
    have hEe := hEn.1; have hVu := hEn.2.1; have hVv := hEn.2.2
    rw [cf_advanceCut_edge_tauE, cf_advanceCut_edge_tauV, cf_advanceCut_edge_tauV]
    if heq : e' = e then
      rw [ite_eq_left heq, heq]; omega
    else
      rw [ite_eq_right heq]; omega

/-- Inductive validity of an asynchronous local-clock execution schedule advancing `σ₀` to `σ₁`
    (models tapered causal-cone advances between global Cauchy cuts). -/
inductive ValidCauchySchedule : CauchyCut → CauchyCut → List VibeEvent → Prop where
  | nil {σ : CauchyCut} : IsValidCut σ → ValidCauchySchedule σ σ []
  | cons {σ₀ σ₁ : CauchyCut} {ev : VibeEvent} {rest : List VibeEvent} :
      IsValidCut σ₀ → EventEnabled σ₀ ev →
      ValidCauchySchedule (advanceCut σ₀ ev) σ₁ rest →
      ValidCauchySchedule σ₀ σ₁ (ev :: rest)

/-- Headline Theorem 7 (Exact 1-Lipschitz Spacelike Slope Bound, Cut Preservation, & Diamond Non-Interference):
    every valid Cauchy surface `σ` obeys `|τ_V(u) - τ_V(v)| ≤ 1` across every facet edge; any two
    distinct simultaneously enabled local events are causally independent, commute identically on
    Fock space, preserve each other's readiness, and yield the exact same advanced Cauchy cut; and
    firing any enabled event strictly preserves `IsValidCut (advanceCut σ ev)`. -/
theorem thm_cf_valid_cut_lipschitz_and_diamond (χ : ChiralInvariant) (σ : CauchyCut)
    (hCut : IsValidCut σ) :
    (∀ e : FacetEdge, σ.tauV e.u ≤ σ.tauV e.v + 1 ∧ σ.tauV e.v ≤ σ.tauV e.u + 1) ∧
    (∀ (ev₁ ev₂ : VibeEvent),
      EventEnabled σ ev₁ → EventEnabled σ ev₂ → ev₁ ≠ ev₂ →
      ¬ vibeDep ev₁ ev₂ ∧ ¬ vibeDep ev₂ ev₁ ∧
      (∀ ψ : FockVec NinthLoc6 HoneycombConfig,
        vibeEventOp χ ev₁ (vibeEventOp χ ev₂ ψ) = vibeEventOp χ ev₂ (vibeEventOp χ ev₁ ψ)) ∧
      EventEnabled (advanceCut σ ev₁) ev₂ ∧
      advanceCut (advanceCut σ ev₁) ev₂ = advanceCut (advanceCut σ ev₂) ev₁) ∧
    (∀ ev : VibeEvent, EventEnabled σ ev → IsValidCut (advanceCut σ ev)) := by
  refine ⟨fun e => by obtain ⟨h1, h2, h3, h4⟩ := hCut e; omega, ?_, fun ev hEn => cf_advanceCut_valid σ ev hCut hEn⟩
  intro ev₁ ev₂ h1 h2 hne
  have hInd : ¬ vibeDep ev₁ ev₂ ∧ ¬ vibeDep ev₂ ev₁ ∧
      EventEnabled (advanceCut σ ev₁) ev₂ ∧
      advanceCut (advanceCut σ ev₁) ev₂ = advanceCut (advanceCut σ ev₂) ev₁ := by
    cases ev₁ with
    | dock g₁ n₁ =>
      cases ev₂ with
      | dock g₂ n₂ =>
        have hgn : g₁ ≠ g₂ := fun heq => hne (by
          have hn : n₁ = n₂ := by rw [← h1.1, ← h2.1, heq]
          rw [heq, hn])
        refine ⟨fun h => hgn h.1, fun h => hgn h.1.symm, ?_, ?_⟩
        · exact ⟨by rw [cf_advanceCut_dock_tauV, ite_eq_right hgn.symm]; exact h2.1, h2.2⟩
        · apply cf_cauchyCut_ext
          · funext x
            rw [cf_advanceCut_dock_tauV, cf_advanceCut_dock_tauV, cf_advanceCut_dock_tauV,
                cf_advanceCut_dock_tauV, cf_advanceCut_dock_tauV, cf_advanceCut_dock_tauV,
                ite_eq_right hgn.symm, ite_eq_right hgn]
            if hx1 : x = g₁ then
              have hx2 : x ≠ g₂ := by rw [hx1]; exact hgn
              rw [ite_eq_right hx2, ite_eq_left hx1, ite_eq_left hx1]
            else if hx2 : x = g₂ then rw [ite_eq_left hx2, ite_eq_right hx1, ite_eq_left hx2]
            else rw [ite_eq_right hx2, ite_eq_right hx1, ite_eq_right hx1, ite_eq_right hx2]
          · rfl
      | edge e n₂ =>
        have hDisj : g₁ ≠ e.u ∧ g₁ ≠ e.v := by
          refine ⟨fun hu => ?_, fun hv => ?_⟩
          · have hE := h1.2 e.a; rw [hu, cf_edgeOfSlot_self] at hE
            have hV := h1.1; rw [hu] at hV
            have h2e := h2.1; have h2u := h2.2.1; omega
          · have hE := h1.2 e.oppA; rw [hv, cf_edgeOfSlot_mate_self] at hE
            have hV := h1.1; rw [hv] at hV
            have h2e := h2.1; have h2v := h2.2.2; omega
        refine ⟨fun h => match h.1 with | Or.inl hu => hDisj.1 hu | Or.inr hv => hDisj.2 hv,
                fun h => match h.1 with | Or.inl hu => hDisj.1 hu | Or.inr hv => hDisj.2 hv, ?_, rfl⟩
        exact ⟨h2.1,
               by rw [cf_advanceCut_dock_tauV, ite_eq_right hDisj.1.symm]; exact h2.2.1,
               by rw [cf_advanceCut_dock_tauV, ite_eq_right hDisj.2.symm]; exact h2.2.2⟩
    | edge e₁ n₁ =>
      cases ev₂ with
      | dock g₂ n₂ =>
        have hDisj : g₂ ≠ e₁.u ∧ g₂ ≠ e₁.v := by
          refine ⟨fun hu => ?_, fun hv => ?_⟩
          · have hE := h2.2 e₁.a; rw [hu, cf_edgeOfSlot_self] at hE
            have hV := h2.1; rw [hu] at hV
            have h1e := h1.1; have h1u := h1.2.1; omega
          · have hE := h2.2 e₁.oppA; rw [hv, cf_edgeOfSlot_mate_self] at hE
            have hV := h2.1; rw [hv] at hV
            have h1e := h1.1; have h1v := h1.2.2; omega
        refine ⟨fun h => match h.1 with | Or.inl hu => hDisj.1 hu | Or.inr hv => hDisj.2 hv,
                fun h => match h.1 with | Or.inl hu => hDisj.1 hu | Or.inr hv => hDisj.2 hv, ?_, rfl⟩
        refine ⟨h2.1, fun a => ?_⟩
        have hNeE : edgeOfSlot g₂ a ≠ e₁ := fun heq =>
          match cf_edgeOfSlot_eq_imp_dock g₂ a e₁ heq with
          | Or.inl hu => hDisj.1 hu
          | Or.inr hv => hDisj.2 hv
        rw [cf_advanceCut_edge_tauE, ite_eq_right hNeE]; exact h2.2 a
      | edge e₂ n₂ =>
        have hen : e₁ ≠ e₂ := fun heq => hne (by
          have hn : n₁ = n₂ := by rw [← h1.1, ← h2.1, heq]
          rw [heq, hn])
        refine ⟨fun h => hen h.1, fun h => hen h.1.symm, ?_, ?_⟩
        · exact ⟨by rw [cf_advanceCut_edge_tauE, ite_eq_right hen.symm]; exact h2.1, h2.2.1, h2.2.2⟩
        · apply cf_cauchyCut_ext
          · rfl
          · funext x
            rw [cf_advanceCut_edge_tauE, cf_advanceCut_edge_tauE, cf_advanceCut_edge_tauE,
                cf_advanceCut_edge_tauE, cf_advanceCut_edge_tauE, cf_advanceCut_edge_tauE,
                ite_eq_right hen.symm, ite_eq_right hen]
            if hx1 : x = e₁ then
              have hx2 : x ≠ e₂ := by rw [hx1]; exact hen
              rw [ite_eq_right hx2, ite_eq_left hx1, ite_eq_left hx1]
            else if hx2 : x = e₂ then rw [ite_eq_left hx2, ite_eq_right hx1, ite_eq_left hx2]
            else rw [ite_eq_right hx2, ite_eq_right hx1, ite_eq_right hx1, ite_eq_right hx2]
  exact ⟨hInd.1, hInd.2.1, fun ψ => cf_vibeEvent_comm_indep χ ev₁ ev₂ ψ hInd.1 hInd.2.1,
         hInd.2.2.1, hInd.2.2.2⟩

private def cf_inCutDiff (σ₀ σ₁ : CauchyCut) : VibeEvent → Prop
  | .dock g n => σ₀.tauV g ≤ n ∧ n < σ₁.tauV g
  | .edge e n => σ₀.tauE e ≤ n ∧ n < σ₁.tauE e

private theorem cf_inCutDiff_dock (σ₀ σ₁ : CauchyCut) (g : Mat5) (n : Nat) :
    cf_inCutDiff σ₀ σ₁ (.dock g n) ↔ σ₀.tauV g ≤ n ∧ n < σ₁.tauV g := Iff.rfl

private theorem cf_inCutDiff_edge (σ₀ σ₁ : CauchyCut) (e : FacetEdge) (n : Nat) :
    cf_inCutDiff σ₀ σ₁ (.edge e n) ↔ σ₀.tauE e ≤ n ∧ n < σ₁.tauE e := Iff.rfl

private theorem cf_validCauchySchedule_mono {σ₀ σ₁ : CauchyCut} {π : List VibeEvent}
    (h : ValidCauchySchedule σ₀ σ₁ π) :
    (∀ g : Mat5, σ₀.tauV g ≤ σ₁.tauV g) ∧ (∀ e : FacetEdge, σ₀.tauE e ≤ σ₁.tauE e) := by
  induction h with
  | nil _ => exact ⟨fun _ => Nat.le_refl _, fun _ => Nat.le_refl _⟩
  | @cons _ _ ev _ _ _ _ ih =>
    cases ev with
    | dock g _ =>
      refine ⟨fun x => ?_, ih.2⟩
      have hx := ih.1 x; rw [cf_advanceCut_dock_tauV] at hx
      if hxg : x = g then rw [ite_eq_left hxg, hxg] at hx; rw [hxg]; omega
      else rw [ite_eq_right hxg] at hx; exact hx
    | edge e _ =>
      refine ⟨ih.1, fun x => ?_⟩
      have hx := ih.2 x; rw [cf_advanceCut_edge_tauE] at hx
      if hxe : x = e then rw [ite_eq_left hxe, hxe] at hx; rw [hxe]; omega
      else rw [ite_eq_right hxe] at hx; exact hx

private theorem cf_validCauchySchedule_mem {σ₀ σ₁ : CauchyCut} {π : List VibeEvent}
    (h : ValidCauchySchedule σ₀ σ₁ π) : ∀ ev : VibeEvent, ev ∈ π ↔ cf_inCutDiff σ₀ σ₁ ev := by
  induction h with
  | nil _ =>
    intro ev; cases ev <;> exact ⟨(fun hm => nomatch hm), (fun ⟨h1, h2⟩ => by omega)⟩
  | @cons _ s1 ev rest _ hEn hRest ih =>
    have hMono := cf_validCauchySchedule_mono hRest
    intro x
    cases ev with
    | dock g n =>
      have hGt : n + 1 ≤ s1.tauV g := by
        have hg := hMono.1 g; rw [cf_advanceCut_dock_tauV, ite_eq_left rfl, hEn.1] at hg; exact hg
      cases x with
      | dock g' n' =>
        rw [cf_inCutDiff_dock]
        if hg : g' = g then
          rw [hg]
          have ih' := ih (.dock g n')
          rw [cf_inCutDiff_dock, cf_advanceCut_dock_tauV, ite_eq_left rfl, hEn.1] at ih'
          constructor
          · intro hm
            cases hm with
            | head => exact ⟨by rw [hEn.1], by omega⟩
            | tail _ h' => have ⟨h1, h2⟩ := ih'.mp h'; exact ⟨by rw [hEn.1]; omega, h2⟩
          · intro ⟨h1, h2⟩
            rw [hEn.1] at h1
            if hn : n' = n then rw [hn]; exact List.Mem.head rest
            else exact List.Mem.tail _ (ih'.mpr ⟨by omega, h2⟩)
        else
          have ih' := ih (.dock g' n')
          rw [cf_inCutDiff_dock, cf_advanceCut_dock_tauV, ite_eq_right hg] at ih'
          exact ⟨fun hm => match hm with
                   | List.Mem.head _ => absurd rfl hg
                   | List.Mem.tail _ h' => ih'.mp h',
                 fun hc => List.Mem.tail _ (ih'.mpr hc)⟩
      | edge e' n' =>
        rw [cf_inCutDiff_edge]
        have ih' := ih (.edge e' n')
        rw [cf_inCutDiff_edge, cf_advanceCut_dock_tauE] at ih'
        exact ⟨fun hm => match hm with | List.Mem.tail _ h' => ih'.mp h',
               fun hc => List.Mem.tail _ (ih'.mpr hc)⟩
    | edge e n =>
      have hGt : n + 1 ≤ s1.tauE e := by
        have he := hMono.2 e; rw [cf_advanceCut_edge_tauE, ite_eq_left rfl, hEn.1] at he; exact he
      cases x with
      | dock g' n' =>
        rw [cf_inCutDiff_dock]
        have ih' := ih (.dock g' n')
        rw [cf_inCutDiff_dock, cf_advanceCut_edge_tauV] at ih'
        exact ⟨fun hm => match hm with | List.Mem.tail _ h' => ih'.mp h',
               fun hc => List.Mem.tail _ (ih'.mpr hc)⟩
      | edge e' n' =>
        rw [cf_inCutDiff_edge]
        if he : e' = e then
          rw [he]
          have ih' := ih (.edge e n')
          rw [cf_inCutDiff_edge, cf_advanceCut_edge_tauE, ite_eq_left rfl, hEn.1] at ih'
          constructor
          · intro hm
            cases hm with
            | head => exact ⟨by rw [hEn.1], by omega⟩
            | tail _ h' => have ⟨h1, h2⟩ := ih'.mp h'; exact ⟨by rw [hEn.1]; omega, h2⟩
          · intro ⟨h1, h2⟩
            rw [hEn.1] at h1
            if hn : n' = n then rw [hn]; exact List.Mem.head rest
            else exact List.Mem.tail _ (ih'.mpr ⟨by omega, h2⟩)
        else
          have ih' := ih (.edge e' n')
          rw [cf_inCutDiff_edge, cf_advanceCut_edge_tauE, ite_eq_right he] at ih'
          exact ⟨fun hm => match hm with
                   | List.Mem.head _ => absurd rfl he
                   | List.Mem.tail _ h' => ih'.mp h',
                 fun hc => List.Mem.tail _ (ih'.mpr hc)⟩

private theorem cf_validCauchySchedule_isCausal {σ₀ σ₁ : CauchyCut} {π : List VibeEvent}
    (h : ValidCauchySchedule σ₀ σ₁ π) : IsCausalSchedule vibeDep π := by
  induction h with
  | nil _ => exact IsCausalSchedule.nil
  | @cons _ _ ev _ _ hEn hRest ih =>
    refine IsCausalSchedule.cons ?_ ?_ ih
    · intro hm
      have hIn := (cf_validCauchySchedule_mem hRest ev).mp hm
      cases ev with
      | dock g n =>
        rw [cf_inCutDiff_dock, cf_advanceCut_dock_tauV, ite_eq_left rfl, hEn.1] at hIn
        obtain ⟨h1, _⟩ := hIn; omega
      | edge e n =>
        rw [cf_inCutDiff_edge, cf_advanceCut_edge_tauE, ite_eq_left rfl, hEn.1] at hIn
        obtain ⟨h1, _⟩ := hIn; omega
    · intro u hu hdep
      have hIn := (cf_validCauchySchedule_mem hRest u).mp hu
      cases u with
      | dock g₁ n₁ =>
        cases ev with
        | dock g₂ n₂ =>
          unfold vibeDep at hdep; obtain ⟨hEq, hLt⟩ := hdep
          rw [cf_inCutDiff_dock, hEq, cf_advanceCut_dock_tauV, ite_eq_left rfl, hEn.1] at hIn
          obtain ⟨h1, _⟩ := hIn; omega
        | edge e₂ n₂ =>
          unfold vibeDep at hdep; obtain ⟨hEnd, hLe⟩ := hdep
          rw [cf_inCutDiff_dock, cf_advanceCut_edge_tauV] at hIn
          obtain ⟨h1, _⟩ := hIn
          rcases hEnd with hU | hV
          · rw [hU, hEn.2.1] at h1; omega
          · rw [hV, hEn.2.2] at h1; omega
      | edge e₁ n₁ =>
        cases ev with
        | dock g₂ n₂ =>
          unfold vibeDep at hdep; obtain ⟨hEnd, hLt⟩ := hdep
          rw [cf_inCutDiff_edge, cf_advanceCut_dock_tauE] at hIn
          obtain ⟨h1, _⟩ := hIn
          rcases hEnd with hU | hV
          · have hE := hEn.2 e₁.a; rw [hU, cf_edgeOfSlot_self] at hE; rw [hE] at h1; omega
          · have hE := hEn.2 e₁.oppA; rw [hV, cf_edgeOfSlot_mate_self] at hE; rw [hE] at h1; omega
        | edge e₂ n₂ =>
          unfold vibeDep at hdep; obtain ⟨hEq, hLt⟩ := hdep
          rw [cf_inCutDiff_edge, hEq, cf_advanceCut_edge_tauE, ite_eq_left rfl, hEn.1] at hIn
          obtain ⟨h1, _⟩ := hIn; omega

/-- Flat coordinate foliation schedule: all docks at tick `t`, then all edges at tick `t`, for `t = 0..T-1`. -/
def flatStepEvents (V : List Mat5) (E : List FacetEdge) (tick : Nat) : List VibeEvent :=
  V.map (fun g => VibeEvent.dock g tick) ++ E.map (fun e => VibeEvent.edge e tick)

def flatSchedule (V : List Mat5) (E : List FacetEdge) : Nat → List VibeEvent
  | 0 => []
  | t + 1 => flatSchedule V E t ++ flatStepEvents V E t

private def cf_eventTick : VibeEvent → Nat
  | .dock _ n => n
  | .edge _ n => n

private theorem cf_isCausalSchedule_append {Ev : Type} (dep : Ev → Ev → Prop)
    (π₁ π₂ : List Ev) (h1 : IsCausalSchedule dep π₁) (h2 : IsCausalSchedule dep π₂)
    (hDisj : ∀ x, x ∈ π₁ → x ∉ π₂) (hOrd : ∀ x y, x ∈ π₁ → y ∈ π₂ → ¬ dep y x) :
    IsCausalSchedule dep (π₁ ++ π₂) := by
  induction h1 with
  | nil => exact h2
  | @cons e rest hNot hNoPred _ ih =>
    simp only [List.cons_append]
    refine IsCausalSchedule.cons ?_ ?_
      (ih (fun x hx => hDisj x (List.Mem.tail e hx)) (fun x y hx hy => hOrd x y (List.Mem.tail e hx) hy))
    · intro hm
      rcases List.mem_append.mp hm with hR | h2m
      · exact hNot hR
      · exact hDisj e (List.Mem.head rest) h2m
    · intro u hu
      rcases List.mem_append.mp hu with hR | h2m
      · exact hNoPred u hR
      · exact hOrd e u (List.Mem.head rest) h2m

private theorem cf_flatSchedule_valid (V : List Mat5) (E : List FacetEdge)
    (hVnd : IsNodup V) (hEnd : IsNodup E) (T : Nat) :
    IsCausalSchedule vibeDep (flatSchedule V E T) ∧
    (∀ ev, ev ∈ flatSchedule V E T → cf_eventTick ev < T) := by
  have hStep : ∀ t : Nat, IsCausalSchedule vibeDep (flatStepEvents V E t) ∧
      (∀ ev, ev ∈ flatStepEvents V E t → cf_eventTick ev = t) := by
    intro t
    have hV : IsCausalSchedule vibeDep (V.map (fun g => VibeEvent.dock g t)) := by
      have hAux : ∀ xs : List Mat5, IsNodup xs → IsCausalSchedule vibeDep (xs.map (fun g => VibeEvent.dock g t)) := by
        intro xs hnd
        induction hnd with
        | nil => exact IsCausalSchedule.nil
        | @cons g rest hnot _ ih =>
          simp only [List.map]
          refine IsCausalSchedule.cons ?_ ?_ ih
          · intro hm; obtain ⟨x, hx, hEq⟩ := (mem_map_iff _ rest _).mp hm
            cases hEq; exact hnot hx
          · intro u hu hdep; obtain ⟨_, _, hEq⟩ := (mem_map_iff _ rest u).mp hu
            rw [← hEq] at hdep; unfold vibeDep at hdep; exact Nat.lt_irrefl t hdep.2
      exact hAux V hVnd
    have hE : IsCausalSchedule vibeDep (E.map (fun e => VibeEvent.edge e t)) := by
      have hAux : ∀ xs : List FacetEdge, IsNodup xs → IsCausalSchedule vibeDep (xs.map (fun e => VibeEvent.edge e t)) := by
        intro xs hnd
        induction hnd with
        | nil => exact IsCausalSchedule.nil
        | @cons e rest hnot _ ih =>
          simp only [List.map]
          refine IsCausalSchedule.cons ?_ ?_ ih
          · intro hm; obtain ⟨x, hx, hEq⟩ := (mem_map_iff _ rest _).mp hm
            cases hEq; exact hnot hx
          · intro u hu hdep; obtain ⟨_, _, hEq⟩ := (mem_map_iff _ rest u).mp hu
            rw [← hEq] at hdep; unfold vibeDep at hdep; exact Nat.lt_irrefl t hdep.2
      exact hAux E hEnd
    refine ⟨cf_isCausalSchedule_append vibeDep _ _ hV hE ?_ ?_, ?_⟩
    · intro x hx1 hx2
      obtain ⟨_, _, hx1'⟩ := (mem_map_iff _ V x).mp hx1
      obtain ⟨_, _, hx2'⟩ := (mem_map_iff _ E x).mp hx2
      rw [← hx1'] at hx2'; exact VibeEvent.noConfusion hx2'
    · intro x y hx hy hdep
      obtain ⟨_, _, hx'⟩ := (mem_map_iff _ V x).mp hx
      obtain ⟨_, _, hy'⟩ := (mem_map_iff _ E y).mp hy
      rw [← hx', ← hy'] at hdep; unfold vibeDep at hdep; exact Nat.lt_irrefl t hdep.2
    · intro ev hev
      rcases List.mem_append.mp hev with h1 | h2
      · obtain ⟨_, _, hEq⟩ := (mem_map_iff _ V ev).mp h1; rw [← hEq]; rfl
      · obtain ⟨_, _, hEq⟩ := (mem_map_iff _ E ev).mp h2; rw [← hEq]; rfl
  induction T with
  | zero => exact ⟨IsCausalSchedule.nil, fun _ h => nomatch h⟩
  | succ k ih =>
    have ⟨hsK, htK⟩ := hStep k
    refine ⟨cf_isCausalSchedule_append vibeDep _ _ ih.1 hsK ?_ ?_, ?_⟩
    · intro x hx1 hx2
      have h1 := ih.2 x hx1; have h2 := htK x hx2; omega
    · intro x y hx hy hdep
      have h1 := ih.2 x hx; have h2 := htK y hy
      cases x <;> cases y <;> simp only [vibeDep] at hdep <;> simp only [cf_eventTick] at h1 h2
      · have := hdep.2; omega
      · have := hdep.2; omega
      · have := hdep.2; omega
      · have := hdep.2; omega
    · intro ev hev
      rcases List.mem_append.mp hev with h1 | h2
      · have := ih.2 ev h1; omega
      · have := htK ev h2; omega

private theorem cf_exec_flatSchedule (χ : ChiralInvariant) (V : List Mat5) (E : List FacetEdge)
    (T : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    execSchedule (vibeEventOp χ) (flatSchedule V E T) ψ = iter (regionAltStepOp χ V E) T ψ := by
  have hV : ∀ (t : Nat) (xs : List Mat5) (φ : FockVec NinthLoc6 HoneycombConfig),
      execSchedule (vibeEventOp χ) (xs.map (fun g => VibeEvent.dock g t)) φ = regionDressedOp χ xs φ := by
    intro t xs
    induction xs with
    | nil => intro _; rfl
    | cons _ _ ih => intro φ; simp only [List.map, execSchedule, vibeEventOp, applyDockOps]; exact ih _
  have hE : ∀ (t : Nat) (xs : List FacetEdge) (φ : FockVec NinthLoc6 HoneycombConfig),
      execSchedule (vibeEventOp χ) (xs.map (fun e => VibeEvent.edge e t)) φ = applyEdgeOps xs φ := by
    intro t xs
    induction xs with
    | nil => intro _; rfl
    | cons _ _ ih => intro φ; simp only [List.map, execSchedule, vibeEventOp, applyEdgeOps]; exact ih _
  induction T with
  | zero => rfl
  | succ _ ih =>
    simp only [flatSchedule, iter, flatStepEvents]
    rw [cf_execSchedule_append, ih, cf_execSchedule_append, hV, hE]
    rfl


/-! ### Exact Bridge from Region Stencils & `flatSchedule` to Global `Vibe.FockBeat.fockBeat` -/

private theorem cf_exists_false_of_all_false {α : Type} (p : α → Bool) (xs : List α)
    (h : xs.all p = false) : ∃ x : α, x ∈ xs ∧ p x = false := by
  induction xs with
  | nil => simp only [List.all] at h; exact Bool.noConfusion h
  | cons x rest ih =>
    simp only [List.all] at h
    cases hpx : p x with
    | false => exact ⟨x, List.Mem.head rest, hpx⟩
    | true =>
      rw [hpx, Bool.true_and] at h
      obtain ⟨y, hy, hpy⟩ := ih h
      exact ⟨y, List.Mem.tail x hy, hpy⟩

private theorem cf_composeLines_op (g : Mat5)
    (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig) (S : Fin 12 → DockStencil)
    (hOp : ∀ l ψ, (f l).op ψ = liftDockOp g (applyStencil (S l)) ψ) (ls : List (Fin 12))
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (composeLines f ls).op ψ = liftDockOp g (applyStencil (composeLineStencils S ls)) ψ := by
  induction ls generalizing ψ with
  | nil =>
    funext c
    change ψ c = liftDockOp g (applyStencil idStencil) ψ c
    unfold liftDockOp; rw [cf_applyStencil_id]; unfold dockSlice; rw [setDock_lookup_self]
  | cons l rest ih =>
    change (f l).op ((composeLines f rest).op ψ) =
      liftDockOp g (applyStencil (compStencil (S l) (composeLineStencils S rest))) ψ
    rw [hOp l, ih, cf_liftDockOp_comp]; funext c
    change applyStencil (S l) (applyStencil (composeLineStencils S rest) (dockSlice g c ψ)) (c.lookup g) =
      applyStencil (compStencil (S l) (composeLineStencils S rest)) (dockSlice g c ψ) (c.lookup g)
    exact (cf_applyStencil_comp _ _ _ _).symm

private theorem cf_siteMPair_eq_liftStencil (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (siteMPairUnit g).op ψ = liftDockOp g (applyStencil mpairStencil) ψ := by
  funext c
  rw [siteMPairUnit_op]
  unfold liftDockOp applyStencil mpairStencil dockSlice
  if h : isSoleIdentPairDock (c.lookup g) = true then
    rw [ite_eq_left h, ite_eq_left h]
    simp only [sumList, cf_sumNloc_map]
    change NinthLoc6.add (ψ c) (NinthLoc6.mul NinthLoc6.pairHop (sumFin12 (fun m => ψ (moveSolePairConfig g m c)))) =
      NinthLoc6.add (NinthLoc6.mul NinthLoc6.one (ψ (c.setDock g (c.lookup g))))
        (sumList (List.finRange 12) (fun m => NinthLoc6.mul NinthLoc6.pairHop (ψ (c.setDock g (moveSolePairDock m (c.lookup g))))))
    rw [setDock_lookup_self, NinthLoc6.one_mul, cf_sumNloc_mul_left]
    rfl
  else
    rw [ite_eq_right h, ite_eq_right h]
    simp only [sumList]
    change ψ c = NinthLoc6.add (NinthLoc6.mul NinthLoc6.one (ψ (c.setDock g (c.lookup g)))) NinthLoc6.zero
    rw [setDock_lookup_self, NinthLoc6.one_mul, NinthLoc6.add_zero]


private theorem cf_applySites_eq_applyDockOps (F : LocalSiteFamily) (S : Mat5 → DockStencil)
    (hOp : ∀ g ψ, (F.unit g).op ψ = liftDockOp g (applyStencil (S g)) ψ)
    (V : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySites F V ψ = applyDockOps S V ψ := by
  have hPush : ∀ (g : Mat5) (W : List Mat5) (φ : FockVec NinthLoc6 HoneycombConfig),
      liftDockOp g (applyStencil (S g)) (applyDockOps S W φ) =
        applyDockOps S W (liftDockOp g (applyStencil (S g)) φ) := by
    intro g W
    induction W with
    | nil => intro _; rfl
    | cons w _ ih =>
      intro φ; simp only [applyDockOps]; rw [ih]
      if hgw : g = w then rw [hgw]
      else rw [cf_liftDockOp_comm_sites g w (S g) (S w) φ hgw]
  induction V generalizing ψ with
  | nil => rfl
  | cons g rest ih =>
    simp only [applySites, applyDockOps]
    rw [hOp g, ih ψ, hPush g rest ψ]

private def cf_SupportedIn (V : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ c : HoneycombConfig, ¬ (∀ g, g ∈ c.activeDocks → g ∈ V) → ψ c = NinthLoc6.zero

private theorem cf_globalOp_eq_applyDockOps_on_supported (F : LocalSiteFamily) (S : Mat5 → DockStencil)
    (hOp : ∀ g ψ, (F.unit g).op ψ = liftDockOp g (applyStencil (S g)) ψ)
    (V : List Mat5) (hVnd : IsNodup V) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (hSupp : cf_SupportedIn V ψ) :
    globalOp F ψ = applyDockOps S V ψ ∧ cf_SupportedIn V (globalOp F ψ) := by
  have hPres : cf_SupportedIn V (globalOp F ψ) := by
    intro c hNot; unfold globalOp
    have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' :=
      fun c' hc' => hSupp c' (fun h => hNot (fun g hg => h g (by rw [hc']; exact hg)))
    rw [applySites_local_eq F c.activeDocks ψ zeroVec c hVan, applySites_zero]; rfl
  refine ⟨?_, hPres⟩
  funext c; rw [← cf_applySites_eq_applyDockOps F S hOp V ψ]; unfold globalOp
  cases hAllB : c.activeDocks.all (fun g => memBool g V) with
  | true =>
    have hAll : ∀ g, g ∈ c.activeDocks → g ∈ V := fun g hg =>
      (memBool_eq_true_iff g V).mp ((list_all_eq_true_iff _ _).mp hAllB g hg)
    refine (applySites_superset F c.activeDocks V (activeDocks_nodup c) hVnd hAll c ?_ ψ).symm
    intro g _ hgNot
    if h : c.lookup g = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  | false =>
    have hNotAll : ¬ (∀ g, g ∈ c.activeDocks → g ∈ V) := fun hAll => by
      have hT : c.activeDocks.all (fun g => memBool g V) = true :=
        (list_all_eq_true_iff _ _).mpr (fun g hg => (memBool_eq_true_iff g V).mpr (hAll g hg))
      rw [hAllB] at hT; exact Bool.noConfusion hT
    have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' :=
      fun c' hc' => hSupp c' (fun h => hNotAll (fun g hg => h g (by rw [hc']; exact hg)))
    rw [applySites_local_eq F c.activeDocks ψ zeroVec c hVan,
        applySites_local_eq F V ψ zeroVec c hVan,
        applySites_zero, applySites_zero]

private theorem cf_applyDockOps_comp (S₁ S₂ : Mat5 → DockStencil) (V : List Mat5) (hVnd : IsNodup V)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applyDockOps (fun g => compStencil (S₁ g) (S₂ g)) V ψ =
      applyDockOps S₁ V (applyDockOps S₂ V ψ) := by
  have hPush : ∀ (g : Mat5) (W : List Mat5) (φ : FockVec NinthLoc6 HoneycombConfig),
      (∀ w, w ∈ W → w ≠ g) →
      applyDockOps S₂ W (liftDockOp g (applyStencil (S₁ g)) φ) =
        liftDockOp g (applyStencil (S₁ g)) (applyDockOps S₂ W φ) := by
    intro g W
    induction W with
    | nil => intro _ _; rfl
    | cons w rest ih =>
      intro φ hne; simp only [applyDockOps]
      rw [cf_liftDockOp_comm_sites w g (S₂ w) (S₁ g) φ (hne w (List.Mem.head rest))]
      exact ih _ (fun x hx => hne x (List.Mem.tail w hx))
  induction hVnd generalizing ψ with
  | nil => rfl
  | @cons g rest hnot _ ih =>
    simp only [applyDockOps]
    have hOne : liftDockOp g (applyStencil (compStencil (S₁ g) (S₂ g))) ψ =
        liftDockOp g (applyStencil (S₁ g)) (liftDockOp g (applyStencil (S₂ g)) ψ) := by
      rw [cf_liftDockOp_comp]; funext c
      change applyStencil (compStencil (S₁ g) (S₂ g)) (dockSlice g c ψ) (c.lookup g) =
        applyStencil (S₁ g) (applyStencil (S₂ g) (dockSlice g c ψ)) (c.lookup g)
      exact cf_applyStencil_comp _ _ _ _
    rw [hOne, ih, hPush g rest _ (fun w hw hwg => by rw [hwg] at hw; exact hnot hw)]

private theorem cf_globalOp_preserves_ball (F : LocalSiteFamily) (R : Nat)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : QuantumInBall R ψ) :
    QuantumInBall R (globalOp F ψ) := by
  intro c hc; unfold globalOp
  have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' :=
    fun c' hc' => hψ c' (fun hIn => hc (fun g hg => hIn g (by rw [hc']; exact hg)))
  rw [applySites_local_eq F c.activeDocks ψ zeroVec c hVan, applySites_zero]; rfl

private theorem cf_inBall_mono_le {r₁ r₂ : Nat} (hle : r₁ ≤ r₂) {g : Mat5} (h : InBall r₁ g) :
    InBall r₂ g := by
  induction hle with
  | refl => exact h
  | step _ ih => exact InBall.mono ih

private theorem cf_fockBeat_eq (χ : ChiralInvariant) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockBeat χ ψ =
      fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin (fockPhiOdd χ ψ))))))) :=
  rfl


private theorem cf_regionLocalOp_eq_fockLocal (χ : ChiralInvariant)
    (V : List Mat5) (hVnd : IsNodup V) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (hSupp : cf_SupportedIn V ψ) :
    regionLocalOp χ V ψ =
      fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin (fockPhiOdd χ ψ)))))) := by
  have hPhiOp : ∀ g φ, ((phiOddFamily χ).unit g).op φ = liftDockOp g (applyStencil (phiOddStencil χ g)) φ := by
    intro g φ; funext c
    change (sitePhiOddUnit χ g).op φ c = _
    rw [sitePhiOddUnit_op]
    simp only [liftDockOp, applyStencil, phiOddStencil, dockSlice, sumList]
    change NinthLoc6.mul _ (φ c) = NinthLoc6.add (NinthLoc6.mul _ (φ (c.setDock g (c.lookup g)))) NinthLoc6.zero
    rw [setDock_lookup_self, NinthLoc6.add_zero]
  have hDOp : ∀ g φ, (halfCoinFamily.unit g).op φ = liftDockOp g (applyStencil halfCoinStencil) φ := fun g φ =>
    cf_composeLines_op g (lineHalfCoinUnit g) lineHalfCoinStencil (fun l χ' => by
      funext c
      rw [lineHalfCoinUnit_op]
      unfold liftDockOp applyStencil lineHalfCoinStencil dockSlice; dsimp only
      cases isLoneLine (c.lookup g) l with
      | false =>
        rw [ite_bool_false, ite_bool_false]
        simp only [sumList]
        change NinthLoc6.mul _ (χ' c) = NinthLoc6.add (NinthLoc6.mul _ (χ' (c.setDock g (c.lookup g)))) NinthLoc6.zero
        rw [setDock_lookup_self, NinthLoc6.add_zero]
      | true =>
        rw [ite_bool_true, ite_bool_true]
        simp only [sumList]
        change NinthLoc6.mul _ (NinthLoc6.add (NinthLoc6.mul _ (χ' c)) (NinthLoc6.mul _ (χ' (swapLineSlotsConfig g l c)))) =
          NinthLoc6.add (NinthLoc6.mul (NinthLoc6.mul _ _) (χ' (c.setDock g (c.lookup g))))
            (NinthLoc6.add (NinthLoc6.mul (NinthLoc6.mul _ _) (χ' (c.setDock g (swapLineSlotsDock l (c.lookup g))))) NinthLoc6.zero)
        rw [setDock_lookup_self, NinthLoc6.add_zero, NinthLoc6.mul_add, NinthLoc6.mul_assoc, NinthLoc6.mul_assoc]; rfl) (List.finRange 12) φ
  have hKOp : ∀ g φ, (bounceKFamily.unit g).op φ = liftDockOp g (applyStencil bounceKStencil) φ := fun g φ =>
    cf_composeLines_op g (lineBounceKUnit g) lineBounceKStencil (fun l χ' => by
      funext c
      rw [lineBounceKUnit_op]
      unfold lineBounceKPerm liftDockOp applyStencil lineBounceKStencil dockSlice
      cases isOppSignLine (c.lookup g) l with
      | false =>
        rw [ite_bool_false, ite_bool_false, ite_bool_false]
        simp only [sumList]
        change NinthLoc6.mul NinthLoc6.one (χ' c) = NinthLoc6.add (NinthLoc6.mul NinthLoc6.one (χ' (c.setDock g (c.lookup g)))) NinthLoc6.zero
        rw [setDock_lookup_self, NinthLoc6.add_zero]
      | true =>
        rw [ite_bool_true, ite_bool_true, ite_bool_true]
        simp only [sumList]
        change NinthLoc6.mul (NinthLoc6.neg NinthLoc6.one) (χ' (swapLineSlotsConfig g l c)) =
          NinthLoc6.add (NinthLoc6.mul (NinthLoc6.neg NinthLoc6.one) (χ' (c.setDock g (swapLineSlotsDock l (c.lookup g))))) NinthLoc6.zero
        rw [NinthLoc6.add_zero]; rfl) (List.finRange 12) φ
  have hPOp : ∀ g φ, (mpairFamily.unit g).op φ = liftDockOp g (applyStencil mpairStencil) φ :=
    cf_siteMPair_eq_liftStencil
  have hMOp : ∀ g φ, (meetFamily.unit g).op φ = liftDockOp g (applyStencil meetStencil) φ := fun g φ =>
    cf_composeLines_op g (lineMeetUnit g) lineMeetStencil (fun l χ' => by
      funext c
      rw [lineMeetUnit_op]
      unfold liftDockOp applyStencil lineMeetStencil dockSlice; dsimp only
      cases isSameSignDiffRoleLine (c.lookup g) l with
      | false =>
        rw [ite_bool_false, ite_bool_false]
        simp only [sumList]
        change NinthLoc6.mul _ (χ' c) = NinthLoc6.add (NinthLoc6.mul _ (χ' (c.setDock g (c.lookup g)))) NinthLoc6.zero
        rw [setDock_lookup_self, NinthLoc6.add_zero]
      | true =>
        rw [ite_bool_true, ite_bool_true]
        simp only [sumList]
        change NinthLoc6.mul _ (NinthLoc6.add (NinthLoc6.mul _ (χ' c)) (NinthLoc6.mul _ (χ' (swapLineRolesConfig g l c)))) =
          NinthLoc6.add (NinthLoc6.mul (NinthLoc6.mul _ _) (χ' (c.setDock g (c.lookup g))))
            (NinthLoc6.add (NinthLoc6.mul (NinthLoc6.mul _ _) (χ' (c.setDock g (swapLineRolesDock l (c.lookup g))))) NinthLoc6.zero)
        rw [setDock_lookup_self, NinthLoc6.add_zero, NinthLoc6.mul_add, NinthLoc6.mul_assoc, NinthLoc6.mul_assoc]; rfl) (List.finRange 12) φ
  have hSplit : regionLocalOp χ V ψ =
      applyDockOps (phiOddStencil χ) V
        (applyDockOps (fun _ => halfCoinStencil) V
          (applyDockOps (fun _ => meetStencil) V
            (applyDockOps (fun _ => mpairStencil) V
              (applyDockOps (fun _ => bounceKStencil) V
                (applyDockOps (fun _ => halfCoinStencil) V
                  (applyDockOps (phiOddStencil χ) V ψ)))))) := by
    change applyDockOps (fun g => compStencil (phiOddStencil χ g)
      (compStencil halfCoinStencil (compStencil meetStencil
        (compStencil mpairStencil (compStencil bounceKStencil
          (compStencil halfCoinStencil (phiOddStencil χ g))))))) V ψ = _
    rw [cf_applyDockOps_comp _ _ V hVnd, cf_applyDockOps_comp _ _ V hVnd,
        cf_applyDockOps_comp _ _ V hVnd, cf_applyDockOps_comp _ _ V hVnd,
        cf_applyDockOps_comp _ _ V hVnd, cf_applyDockOps_comp _ _ V hVnd]
  have h1 := cf_globalOp_eq_applyDockOps_on_supported (phiOddFamily χ) (phiOddStencil χ) hPhiOp V hVnd ψ hSupp
  have h2 := cf_globalOp_eq_applyDockOps_on_supported halfCoinFamily (fun _ => halfCoinStencil) hDOp V hVnd _ h1.2
  have h3 := cf_globalOp_eq_applyDockOps_on_supported bounceKFamily (fun _ => bounceKStencil) hKOp V hVnd _ h2.2
  have h4 := cf_globalOp_eq_applyDockOps_on_supported mpairFamily (fun _ => mpairStencil) hPOp V hVnd _ h3.2
  have h5 := cf_globalOp_eq_applyDockOps_on_supported meetFamily (fun _ => meetStencil) hMOp V hVnd _ h4.2
  have h6 := cf_globalOp_eq_applyDockOps_on_supported halfCoinFamily (fun _ => halfCoinStencil) hDOp V hVnd _ h5.2
  have h7 := cf_globalOp_eq_applyDockOps_on_supported (phiOddFamily χ) (phiOddStencil χ) hPhiOp V hVnd _ h6.2
  rw [hSplit, ← h1.1, ← h2.1, ← h3.1, ← h4.1, ← h5.1, ← h6.1, ← h7.1]
  rfl


private theorem cf_regionBeat_eq_fockBeat_on_ball (χ : ChiralInvariant)
    (V : List Mat5) (E : List FacetEdge) (hVnd : IsNodup V) (hEnd : IsNodup E)
    (R : Nat) (hVcov : ∀ g : Mat5, InBall (R + 1) g → g ∈ V)
    (hEcov : ∀ g : Mat5, InBall (R + 1) g → ∀ a : Fin 24, edgeOfSlot g a ∈ E)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hBall : QuantumInBall R ψ) :
    regionRevOp V (applyEdgeOps E (regionLocalOp χ V ψ)) = fockBeat χ ψ := by
  have hSupp : cf_SupportedIn V ψ := fun c hNot =>
    hBall c (fun hIn => hNot (fun g hg => hVcov g (InBall.mono (hIn g hg))))
  rw [cf_regionLocalOp_eq_fockLocal χ V hVnd ψ hSupp, cf_fockBeat_eq]
  have hBallL : QuantumInBall R
      (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin (fockPhiOdd χ ψ))))))) := by
    change QuantumInBall R (globalOp (phiOddFamily χ) (globalOp halfCoinFamily (globalOp meetFamily
      (globalOp mpairFamily (globalOp bounceKFamily (globalOp halfCoinFamily (globalOp (phiOddFamily χ) ψ)))))))
    exact cf_globalOp_preserves_ball _ R _
      (cf_globalOp_preserves_ball _ R _
        (cf_globalOp_preserves_ball _ R _
          (cf_globalOp_preserves_ball _ R _
            (cf_globalOp_preserves_ball _ R _
              (cf_globalOp_preserves_ball _ R _
                (cf_globalOp_preserves_ball _ R _ hBall))))))
  have hStreamStep :
      ∀ φ : FockVec NinthLoc6 HoneycombConfig, QuantumInBall R φ →
        regionRevOp V (applyEdgeOps E φ) = fockStream φ := by
    intro φ hφ; funext c
    have hZeroOfOutside : ∀ g₀ : Mat5, g₀ ∈ c.activeDocks → ¬ InBall (R + 1) g₀ →
        regionRevOp V (applyEdgeOps E φ) c = fockStream φ c := by
      intro g₀ hg₀ hNotB
      obtain ⟨a, ha⟩ := exists_nonempty_of_ne_v1 (c.lookup g₀) ((mem_activeDocks_iff c g₀).mp hg₀)
      have hRhs : fockStream φ c = NinthLoc6.zero := by
        rw [fockStream_eval]
        apply hφ (streamConfigInv c); intro hIn
        let gSrc := mat5Mul g₀ (transport (oppSlot a))
        have hSrcOcc : (streamConfigInv c).lookup gSrc a ≠ .empty := by
          rw [lookup_streamConfigInv]
          change c.lookup (mat5Mul (mat5Mul g₀ (transport (oppSlot a))) (transport a)) a ≠ .empty
          rw [fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
          exact ha
        have hSrcIn : InBall R gSrc :=
          hIn gSrc ((mem_activeDocks_iff _ _).mpr (fun h => hSrcOcc (congrFun h a)))
        have hStep : InBall (R + 1) (mat5Mul gSrc (transport a)) := InBall.step a hSrcIn
        have hBack : mat5Mul gSrc (transport a) = g₀ := by
          change mat5Mul (mat5Mul g₀ (transport (oppSlot a))) (transport a) = g₀
          rw [fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
        rw [hBack] at hStep; exact hNotB hStep
      have hLhs : regionRevOp V (applyEdgeOps E φ) c = NinthLoc6.zero := by
        rw [cf_regionRevOp_eval, cf_applyEdgeOps_eval]
        apply hφ (applyEdgeSwaps E (cf_revOnSites V c)); intro hIn
        have hEx1 : ∃ a₁ : Fin 24, (cf_revOnSites V c).lookup g₀ a₁ ≠ .empty := by
          cases hmV : memBool g₀ V with
          | true =>
            refine ⟨oppSlot a, ?_⟩
            rw [cf_lookup_revOnSites c V hVnd g₀, hmV, ite_bool_true]
            unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]; exact ha
          | false =>
            refine ⟨a, ?_⟩
            rw [cf_lookup_revOnSites c V hVnd g₀, hmV, ite_bool_false]; exact ha
        obtain ⟨a₁, ha₁⟩ := hEx1
        cases hmE : memBool (edgeOfSlot g₀ a₁) E with
        | true =>
          let g₁ := mat5Mul g₀ (transport a₁)
          let b₁ := oppSlot a₁
          have hMateE : edgeOfSlot g₁ b₁ = edgeOfSlot g₀ a₁ := by
            change edgeOfSlot (facetMate (g₀, a₁)).1 (facetMate (g₀, a₁)).2 = edgeOfSlot (g₀, a₁).1 (g₀, a₁).2
            exact cf_edgeOfSlot_mate (g₀, a₁)
          have hBackG : mat5Mul g₁ (transport b₁) = g₀ := by
            change mat5Mul (mat5Mul g₀ (transport a₁)) (transport (oppSlot a₁)) = g₀
            rw [fb_mat5Mul_assoc, transport_inv_right a₁, fb_mat5Mul_id_right]
          have hBackA : oppSlot b₁ = a₁ := (thm_24_facets_geometry.2.1 a₁).1
          have hOcc1 : (applyEdgeSwaps E (cf_revOnSites V c)).lookup g₁ b₁ ≠ .empty := by
            rw [cf_lookup_applyEdgeSwaps E hEnd (cf_revOnSites V c) g₁ b₁, hMateE, hmE, ite_bool_true,
                hBackG, hBackA]
            exact ha₁
          have hIn1 : InBall R g₁ :=
            hIn g₁ ((mem_activeDocks_iff _ _).mpr (fun h => hOcc1 (congrFun h b₁)))
          have hStep : InBall (R + 1) (mat5Mul g₁ (transport b₁)) := InBall.step b₁ hIn1
          rw [hBackG] at hStep; exact hNotB hStep
        | false =>
          have hOcc0 : (applyEdgeSwaps E (cf_revOnSites V c)).lookup g₀ a₁ ≠ .empty := by
            rw [cf_lookup_applyEdgeSwaps E hEnd (cf_revOnSites V c) g₀ a₁, hmE, ite_bool_false]
            exact ha₁
          have hIn0 : InBall R g₀ :=
            hIn g₀ ((mem_activeDocks_iff _ _).mpr (fun h => hOcc0 (congrFun h a₁)))
          exact hNotB (InBall.mono hIn0)
      rw [hLhs, hRhs]
    cases hBV : c.activeDocks.all (fun g => memBool g V) with
    | true =>
      cases hBE : c.activeDocks.all (fun g => (List.finRange 24).all (fun a => memBool (edgeOfSlot g a) E)) with
      | true =>
        exact (thm_cf_beat_factorization_R_Eswap_W χ V E).2.2.2 hVnd hEnd c φ
          (fun g hg => (memBool_eq_true_iff g V).mp ((list_all_eq_true_iff _ _).mp hBV g hg))
          (fun g hg a => (memBool_eq_true_iff _ E).mp
            ((list_all_eq_true_iff _ _).mp ((list_all_eq_true_iff _ _).mp hBE g hg) a (mem_finRange24 a)))
      | false =>
        obtain ⟨g₀, hg₀, hEg₀⟩ := cf_exists_false_of_all_false _ _ hBE
        obtain ⟨a₀, _, hEa₀⟩ := cf_exists_false_of_all_false _ _ hEg₀
        exact hZeroOfOutside g₀ hg₀ (fun hIn => by
          have ht := (memBool_eq_true_iff _ E).mpr (hEcov g₀ hIn a₀)
          rw [hEa₀] at ht; exact Bool.noConfusion ht)
    | false =>
      obtain ⟨g₀, hg₀, hVg₀⟩ := cf_exists_false_of_all_false _ _ hBV
      exact hZeroOfOutside g₀ hg₀ (fun hIn => by
        have ht := (memBool_eq_true_iff g₀ V).mpr (hVcov g₀ hIn)
        rw [hVg₀] at ht; exact Bool.noConfusion ht)
  exact hStreamStep _ hBallL

private theorem cf_cauchy_diamond_witness (χ : ChiralInvariant) (g₀ : Mat5) (a₀ : Fin 24)
    (hNe01 : g₀ ≠ mat5Mul g₀ (transport a₀)) :
    ∃ (σ₁ : CauchyCut) (π₁ π₂ : List VibeEvent),
      ValidCauchySchedule zeroCut σ₁ π₁ ∧
      ValidCauchySchedule zeroCut σ₁ π₂ ∧
      π₁ ≠ π₂ ∧
      ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
        execSchedule (vibeEventOp χ) π₁ ψ = execSchedule (vibeEventOp χ) π₂ ψ := by
  let g₁ : Mat5 := mat5Mul g₀ (transport a₀)
  let e : FacetEdge := edgeOfSlot g₀ a₀
  have hEvNe : VibeEvent.dock g₀ 0 ≠ VibeEvent.dock g₁ 0 := fun h => by
    injection h with hG _; exact hNe01 hG
  have hVal0 : IsValidCut zeroCut := fun _ => ⟨Nat.le_refl 0, Nat.le_refl 0, Nat.zero_le 1, Nat.zero_le 1⟩
  have hEn0 : EventEnabled zeroCut (.dock g₀ 0) := ⟨rfl, fun _ => rfl⟩
  have hEn1 : EventEnabled zeroCut (.dock g₁ 0) := ⟨rfl, fun _ => rfl⟩
  have hDiam01 := (thm_cf_valid_cut_lipschitz_and_diamond χ zeroCut hVal0).2.1
    (.dock g₀ 0) (.dock g₁ 0) hEn0 hEn1 hEvNe
  have hDiam10 := (thm_cf_valid_cut_lipschitz_and_diamond χ zeroCut hVal0).2.1
    (.dock g₁ 0) (.dock g₀ 0) hEn1 hEn0 hEvNe.symm
  let σA := advanceCut zeroCut (.dock g₀ 0)
  let σB := advanceCut zeroCut (.dock g₁ 0)
  let σMid := advanceCut σA (.dock g₁ 0)
  let σ₁ := advanceCut σMid (.edge e 0)
  have hValA : IsValidCut σA := cf_advanceCut_valid zeroCut (.dock g₀ 0) hVal0 hEn0
  have hValB : IsValidCut σB := cf_advanceCut_valid zeroCut (.dock g₁ 0) hVal0 hEn1
  have hValMid : IsValidCut σMid := cf_advanceCut_valid σA (.dock g₁ 0) hValA hDiam01.2.2.2.1
  have hMidEq : advanceCut σB (.dock g₀ 0) = σMid := hDiam01.2.2.2.2.symm
  have hEnds : (e.u = g₀ ∧ e.v = g₁) ∨ (e.u = g₁ ∧ e.v = g₀) := by
    have hE : ∀ (e' : FacetEdge), e' = edgeOfSlot g₀ a₀ → (e'.u = g₀ ∧ e'.v = g₁) ∨ (e'.u = g₁ ∧ e'.v = g₀) := by
      intro e' heq
      cases hc : endpointLt (g₀, a₀) (facetMate (g₀, a₀)) with
      | true =>
        rw [cf_edgeOfSlot_of_true g₀ a₀ hc] at heq
        rw [heq]; exact Or.inl ⟨rfl, rfl⟩
      | false =>
        rw [cf_edgeOfSlot_of_false g₀ a₀ hc] at heq
        rw [heq]
        refine Or.inr ⟨rfl, ?_⟩
        change (facetMate (facetMate (g₀, a₀))).1 = g₀
        rw [cf_facetMate_inv]
    exact hE e rfl
  have hMidG0 : σMid.tauV g₀ = 1 := by
    change (advanceCut (advanceCut zeroCut (.dock g₀ 0)) (.dock g₁ 0)).tauV g₀ = 1
    rw [cf_advanceCut_dock_tauV, ite_eq_right hNe01, cf_advanceCut_dock_tauV, ite_eq_left rfl]; rfl
  have hMidG1 : σMid.tauV g₁ = 1 := by
    change (advanceCut (advanceCut zeroCut (.dock g₀ 0)) (.dock g₁ 0)).tauV g₁ = 1
    rw [cf_advanceCut_dock_tauV, ite_eq_left rfl, cf_advanceCut_dock_tauV, ite_eq_right hNe01.symm]; rfl
  have hEnE : EventEnabled σMid (.edge e 0) := by
    refine ⟨rfl, ?_, ?_⟩
    · rcases hEnds with ⟨hu, _⟩ | ⟨hu, _⟩ <;> rw [hu]
      · exact hMidG0
      · exact hMidG1
    · rcases hEnds with ⟨_, hv⟩ | ⟨_, hv⟩ <;> rw [hv]
      · exact hMidG1
      · exact hMidG0
  have hVal1 : IsValidCut σ₁ := cf_advanceCut_valid σMid (.edge e 0) hValMid hEnE
  let π₁ : List VibeEvent := [.dock g₀ 0, .dock g₁ 0, .edge e 0]
  let π₂ : List VibeEvent := [.dock g₁ 0, .dock g₀ 0, .edge e 0]
  have hS1 : ValidCauchySchedule zeroCut σ₁ π₁ :=
    ValidCauchySchedule.cons hVal0 hEn0
      (ValidCauchySchedule.cons hValA hDiam01.2.2.2.1
        (ValidCauchySchedule.cons hValMid hEnE (ValidCauchySchedule.nil hVal1)))
  have hS2 : ValidCauchySchedule zeroCut σ₁ π₂ :=
    ValidCauchySchedule.cons hVal0 hEn1
      (ValidCauchySchedule.cons hValB hDiam10.2.2.2.1
        (by rw [hMidEq]; exact ValidCauchySchedule.cons hValMid hEnE (ValidCauchySchedule.nil hVal1)))
  have hPiNe : π₁ ≠ π₂ := fun h => by
    injection h with hHd _; exact hEvNe hHd
  refine ⟨σ₁, π₁, π₂, hS1, hS2, hPiNe, fun ψ => ?_⟩
  exact thm_cf_tomonaga_schwinger_foliation_invariance vibeDep (vibeEventOp χ)
    (cf_vibeEvent_comm_indep χ) π₁ π₂ (cf_validCauchySchedule_isCausal hS1) (cf_validCauchySchedule_isCausal hS2)
    (fun ev => (cf_validCauchySchedule_mem hS1 ev).trans (cf_validCauchySchedule_mem hS2 ev).symm) ψ

/-- Headline Theorem 8 (Concrete `{3,4,3,4}` Asynchronous Causal-Set Foliation Invariance & Global `fockBeat` Bridge):
    on infinite `{3,4,3,4}` over `ℤ[ζ_9][1/6]`, for EVERY `ChiralInvariant χ`:
    1. ANY two `IsCausalSchedule vibeDep` schedules executing the same finite causal event set yield the
       strictly identical quantum Fock state,
    2. ANY two `ValidCauchySchedule σ₀ σ₁` local-clock schedules (tapered causal-cone advances between
       global Cauchy cuts) advancing `σ₀` to `σ₁` yield the strictly identical quantum Fock state,
    3. For ANY finite active region `(V, E)` and beat count `T`, the cylindrical `IsCausalSchedule vibeDep`
       schedule `flatSchedule V E T` executes `iter (regionAltStepOp χ V E) T`, and EVERY valid asynchronous
       schedule `π` over the same event set reproduces `R_V ∘ U(π) ∘ R_V = (R_V ∘ E_swap ∘ L_V)^T`,
    4. Exact bridge to the real global `Vibe.FockBeat.fockBeat`: for ANY `R₀, T : Nat`, ANY quantum state `ψ`
       with `QuantumInBall R₀ ψ`, and ANY duplicate-free `(V, E)` covering `InBall (R₀ + T)` and its incident
       facet edges, EVERY valid asynchronous schedule `π` covering `flatSchedule V E T` satisfies
       `regionRevOp V (execSchedule (vibeEventOp χ) π (regionRevOp V ψ)) = iter (fockBeat χ) T ψ`,
    5. Concrete non-vacuity witness on `zeroCut`: explicit distinct 3-event `ValidCauchySchedule` diamond
       schedules `π₁ ≠ π₂` advancing `zeroCut` to the exact same `σ₁` with identical quantum action. -/
theorem thm_cf_vibe_causal_foliation_invariance (χ : ChiralInvariant) :
    (∀ (π₁ π₂ : List VibeEvent),
      IsCausalSchedule vibeDep π₁ → IsCausalSchedule vibeDep π₂ →
      (∀ ev, ev ∈ π₁ ↔ ev ∈ π₂) →
      ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
        execSchedule (vibeEventOp χ) π₁ ψ = execSchedule (vibeEventOp χ) π₂ ψ) ∧
    (∀ (σ₀ σ₁ : CauchyCut) (π₁ π₂ : List VibeEvent),
      ValidCauchySchedule σ₀ σ₁ π₁ → ValidCauchySchedule σ₀ σ₁ π₂ →
      ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
        execSchedule (vibeEventOp χ) π₁ ψ = execSchedule (vibeEventOp χ) π₂ ψ) ∧
    (∀ (V : List Mat5) (E : List FacetEdge) (T : Nat),
      IsNodup V → IsNodup E →
      IsCausalSchedule vibeDep (flatSchedule V E T) ∧
      ∀ (π : List VibeEvent),
        IsCausalSchedule vibeDep π → (∀ ev, ev ∈ π ↔ ev ∈ flatSchedule V E T) →
        ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
          regionRevOp V (execSchedule (vibeEventOp χ) π (regionRevOp V ψ)) =
            iter (fun φ => regionRevOp V (applyEdgeOps E (regionLocalOp χ V φ))) T ψ) ∧
    (∀ (R₀ T : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig),
      QuantumInBall R₀ ψ →
      ∀ (V : List Mat5) (E : List FacetEdge),
        IsNodup V → IsNodup E →
        (∀ g : Mat5, InBall (R₀ + T) g → g ∈ V) →
        (∀ g : Mat5, InBall (R₀ + T) g → ∀ a : Fin 24, edgeOfSlot g a ∈ E) →
        ∀ (π : List VibeEvent),
          IsCausalSchedule vibeDep π → (∀ ev, ev ∈ π ↔ ev ∈ flatSchedule V E T) →
          regionRevOp V (execSchedule (vibeEventOp χ) π (regionRevOp V ψ)) =
            iter (fockBeat χ) T ψ) ∧
    (∃ (σ₁ : CauchyCut) (π₁ π₂ : List VibeEvent),
      ValidCauchySchedule zeroCut σ₁ π₁ ∧
      ValidCauchySchedule zeroCut σ₁ π₂ ∧
      π₁ ≠ π₂ ∧
      ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
        execSchedule (vibeEventOp χ) π₁ ψ = execSchedule (vibeEventOp χ) π₂ ψ) := by
  have h1 : ∀ (π₁ π₂ : List VibeEvent),
      IsCausalSchedule vibeDep π₁ → IsCausalSchedule vibeDep π₂ →
      (∀ ev, ev ∈ π₁ ↔ ev ∈ π₂) →
      ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
        execSchedule (vibeEventOp χ) π₁ ψ = execSchedule (vibeEventOp χ) π₂ ψ :=
    fun π₁ π₂ hs1 hs2 hSame ψ =>
      thm_cf_tomonaga_schwinger_foliation_invariance vibeDep (vibeEventOp χ)
        (cf_vibeEvent_comm_indep χ) π₁ π₂ hs1 hs2 hSame ψ
  have h2 : ∀ (σ₀ σ₁ : CauchyCut) (π₁ π₂ : List VibeEvent),
      ValidCauchySchedule σ₀ σ₁ π₁ → ValidCauchySchedule σ₀ σ₁ π₂ →
      ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
        execSchedule (vibeEventOp χ) π₁ ψ = execSchedule (vibeEventOp χ) π₂ ψ :=
    fun _ _ π₁ π₂ hv1 hv2 ψ =>
      h1 π₁ π₂ (cf_validCauchySchedule_isCausal hv1) (cf_validCauchySchedule_isCausal hv2)
        (fun ev => (cf_validCauchySchedule_mem hv1 ev).trans (cf_validCauchySchedule_mem hv2 ev).symm) ψ
  have h3 : ∀ (V : List Mat5) (E : List FacetEdge) (T : Nat),
      IsNodup V → IsNodup E →
      IsCausalSchedule vibeDep (flatSchedule V E T) ∧
      ∀ (π : List VibeEvent),
        IsCausalSchedule vibeDep π → (∀ ev, ev ∈ π ↔ ev ∈ flatSchedule V E T) →
        ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
          regionRevOp V (execSchedule (vibeEventOp χ) π (regionRevOp V ψ)) =
            iter (fun φ => regionRevOp V (applyEdgeOps E (regionLocalOp χ V φ))) T ψ := by
    intro V E T hVnd hEnd
    have hFlat := (cf_flatSchedule_valid V E hVnd hEnd T).1
    refine ⟨hFlat, fun π hπ hSame ψ => ?_⟩
    rw [h1 π (flatSchedule V E T) hπ hFlat hSame (regionRevOp V ψ),
        cf_exec_flatSchedule χ V E T (regionRevOp V ψ)]
    exact (thm_cf_beat_factorization_R_Eswap_W χ V E).2.2.1 T ψ
  refine ⟨h1, h2, h3, ?_, ?_⟩
  · intro R₀ T ψ h0 V E hVnd hEnd hVcov hEcov π hπ hSame
    rw [(h3 V E T hVnd hEnd).2 π hπ hSame ψ]
    have hIter : ∀ t : Nat, t ≤ T →
        iter (fun φ => regionRevOp V (applyEdgeOps E (regionLocalOp χ V φ))) t ψ =
          iter (fockBeat χ) t ψ := by
      intro t
      induction t with
      | zero => intro _; rfl
      | succ k ih =>
        intro hk
        simp only [iter]
        rw [ih (by omega)]
        exact cf_regionBeat_eq_fockBeat_on_ball χ V E hVnd hEnd (R₀ + k)
          (fun g hg => hVcov g (cf_inBall_mono_le (by omega) hg))
          (fun g hg a => hEcov g (cf_inBall_mono_le (by omega) hg) a)
          (iter (fockBeat χ) k ψ) (thm_fock_lieb_robinson_light_cone χ R₀ ψ h0 k)
    exact hIter T (Nat.le_refl T)
  · have hDetId : mat5Det mat5Id = ZSqrt2.one := by decide
    have hNe : mat5Id ≠ mat5Mul mat5Id (transport ⟨0, by decide⟩) := fun h => by
      rw [fb_mat5Mul_id_left] at h
      have hD : mat5Det mat5Id = mat5Det (transport ⟨0, by decide⟩) := congrArg mat5Det h
      rw [hDetId, thm_coxeter_transport_det_neg_one] at hD
      exact absurd hD (by decide)
    exact cf_cauchy_diamond_witness χ mat5Id ⟨0, by decide⟩ hNe

/-- Predicate stating that causal event `ev` does not touch cell `g₀`. -/
def eventDisjointFrom (g₀ : Mat5) : VibeEvent → Prop
  | .dock g _ => g ≠ g₀
  | .edge e _ => g₀ ≠ e.u ∧ g₀ ≠ e.v

/-- Headline Theorem 9 (Site-Disjoint Local-Observable Microcausality):
    every local causal event `ev` disjoint from cell `g₀`, and every asynchronous schedule `π`
    of events disjoint from `g₀`, commutes identically with EVERY `g₀`-local observable stencil `O`. -/
theorem thm_cf_spacelike_microcausality (χ : ChiralInvariant) (g₀ : Mat5) (O : DockStencil) :
    (∀ (ev : VibeEvent) (ψ : FockVec NinthLoc6 HoneycombConfig),
      eventDisjointFrom g₀ ev →
      liftDockOp g₀ (applyStencil O) (vibeEventOp χ ev ψ) =
        vibeEventOp χ ev (liftDockOp g₀ (applyStencil O) ψ)) ∧
    (∀ (π : List VibeEvent) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (∀ ev, ev ∈ π → eventDisjointFrom g₀ ev) →
      liftDockOp g₀ (applyStencil O) (execSchedule (vibeEventOp χ) π ψ) =
        execSchedule (vibeEventOp χ) π (liftDockOp g₀ (applyStencil O) ψ)) := by
  have hOne : ∀ (ev : VibeEvent) (ψ : FockVec NinthLoc6 HoneycombConfig),
      eventDisjointFrom g₀ ev →
      liftDockOp g₀ (applyStencil O) (vibeEventOp χ ev ψ) =
        vibeEventOp χ ev (liftDockOp g₀ (applyStencil O) ψ) := by
    intro ev ψ hdisj
    cases ev with
    | dock g _ => exact cf_liftDockOp_comm_sites g₀ g O _ ψ (fun e => hdisj e.symm)
    | edge e _ => exact cf_liftDockOp_comm_disjoint_edge g₀ (applyStencil O) e ψ hdisj.1 hdisj.2
  refine ⟨hOne, ?_⟩
  intro π
  induction π with
  | nil => intro _ _; rfl
  | cons ev rest ih =>
    intro ψ hall
    simp only [execSchedule]
    rw [ih (vibeEventOp χ ev ψ) (fun x hx => hall x (List.Mem.tail ev hx)),
        hOne ev ψ (hall ev (List.Mem.head rest))]


/-! ## Section 4: Exact Per-Event Conservation of BOTH `0_V` (Charge `Q`) AND `0_D` (Activity `D`) -/

/-- Unsigned single-slot differentiation activity `s_i^2 ∈ {0, 1}` (`0_D` observable). -/
def SlotState.activity : SlotState → Nat
  | .empty => 0
  | .occ _ _ => 1

/-- Natural-number finite sum `∑_{x ∈ xs} f x`. -/
def fockSumNat {α : Type} : List α → (α → Nat) → Nat
  | [], _ => 0
  | x :: xs, f => f x + fockSumNat xs f

/-- Unsigned activity `D(d) = ∑_{a ∈ Fin 24} s(d a)^2` (number of occupied slots in dock `d`). -/
def dockActivity (d : FullDock) : Nat :=
  fockSumNat (List.finRange 24) (fun a => (d a).activity)

/-- Total unsigned differentiation activity `D(c) = N_occ(c)` across the entire infinite honeycomb. -/
def totalActivity (c : HoneycombConfig) : Nat :=
  fockSumNat c.activeDocks (fun g => dockActivity (c.lookup g))

/-- Exact total unsigned activity eigenspace `D = d` (`0_D` corresponds to `d = 0`). -/
def InActivitySector (d : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ c : HoneycombConfig, totalActivity c ≠ d → ψ c = NinthLoc6.zero

private theorem cf_fockSumNat_cast {α : Type} (xs : List α) (f : α → Nat) :
    (fockSumNat xs f : Int) = fockSumInt xs (fun x => (f x : Int)) := by
  induction xs with
  | nil => rfl
  | cons x rest ih =>
    simp only [fockSumNat, fockSumInt]
    have hCast : ((f x + fockSumNat rest f : Nat) : Int) = (f x : Int) + (fockSumNat rest f : Int) := by omega
    rw [hCast, ih]

private theorem cf_fockSumNat_eq_zero_iff {α : Type} (xs : List α) (f : α → Nat) :
    fockSumNat xs f = 0 ↔ ∀ x : α, x ∈ xs → f x = 0 := by
  induction xs with
  | nil => exact ⟨(fun _ _ h => nomatch h), (fun _ => rfl)⟩
  | cons x rest ih =>
    simp only [fockSumNat]
    constructor
    · intro h0 y hy
      cases hy with
      | head => omega
      | tail _ h' => exact ih.mp (by omega) y h'
    · intro hall
      have h1 := hall x (List.Mem.head rest)
      have h2 := ih.mpr (fun y hy => hall y (List.Mem.tail x hy))
      omega

private theorem cf_dockActivity_eq_zero_iff (d : FullDock) :
    dockActivity d = 0 ↔ d = v1FullDock := by
  constructor
  · intro h0; funext a
    have ha := (cf_fockSumNat_eq_zero_iff _ _).mp h0 a (mem_finRange24 a)
    cases hda : d a with
    | empty => rfl
    | occ _ _ => rw [hda] at ha; cases ha
  · intro h; rw [h]; decide

/-- Explicit `Q = 0_V, D = 2` neutral-valence active dock witness separating `0_V` from `0_D`. -/
def balancedPairDock : FullDock :=
  fun a =>
    if a = ⟨0, by decide⟩ then .occ .pos false
    else if a = ⟨1, by decide⟩ then .occ .neg false
    else .empty

def balancedPairConfig : HoneycombConfig :=
  v1Config.setDock mat5Id balancedPairDock

/-- Headline Theorem 10 (Exact `0_D` Vacuum Characterization & Strict Separation `0_D ⊂neq 0_V`):
    1. `totalActivity c = 0 ↔ c = v1Config` (`0_D` uniquely pins the calm vacuum `v1Config`),
    2. `totalActivity c = 0 → totalCharge c = 0` (`0_D ⊆ 0_V`),
    3. `balancedPairConfig` satisfies `totalCharge = 0` (`0_V`) with `totalActivity = 2` (`≠ 0_D`)
       and `balancedPairConfig ≠ v1Config`, proving strict separation `0_D ⊂neq 0_V`. -/
theorem thm_cf_activity_zero_iff_v1 :
    (∀ c : HoneycombConfig, totalActivity c = 0 ↔ c = v1Config) ∧
    (∀ c : HoneycombConfig, totalActivity c = 0 → totalCharge c = 0) ∧
    (totalCharge balancedPairConfig = 0 ∧ totalActivity balancedPairConfig = 2 ∧
     balancedPairConfig ≠ v1Config) := by
  have hZero : ∀ c : HoneycombConfig, totalActivity c = 0 ↔ c = v1Config := by
    intro c
    constructor
    · intro h0
      apply honeycombConfig_ext; intro g
      if h : c.lookup g = v1FullDock then exact h
      else
        have hAct : g ∈ c.activeDocks := (mem_activeDocks_iff c g).mpr h
        have hD0 := (cf_fockSumNat_eq_zero_iff _ _).mp h0 g hAct
        exact absurd ((cf_dockActivity_eq_zero_iff _).mp hD0) h
    · intro h; rw [h]; rfl
  have hNeDock : balancedPairDock ≠ v1FullDock := by
    intro h; have h0 := congrFun h ⟨0, by decide⟩
    exact SlotState.noConfusion h0
  have hEnt : balancedPairConfig.entries = [(mat5Id, balancedPairDock)] := by
    unfold balancedPairConfig v1Config HoneycombConfig.setDock setEntries
    rw [ite_eq_right hNeDock]
  have hQBal : totalCharge balancedPairConfig = 0 := by
    unfold totalCharge HoneycombConfig.activeDocks HoneycombConfig.lookup
    rw [hEnt]
    simp only [List.map, fockSumInt, lookupEntries, ite_true]
    have h0 : fullDockCharge balancedPairDock = 0 := by decide
    calc fullDockCharge balancedPairDock + 0 = 0 + 0 := by rw [h0]
      _ = 0 := rfl
  have hDBal : totalActivity balancedPairConfig = 2 := by
    unfold totalActivity HoneycombConfig.activeDocks HoneycombConfig.lookup
    rw [hEnt]
    simp only [List.map, fockSumNat, lookupEntries, ite_true]
    have h2 : dockActivity balancedPairDock = 2 := by decide
    calc dockActivity balancedPairDock + 0 = 2 + 0 := by rw [h2]
      _ = 2 := rfl
  have hNeV1 : balancedPairConfig ≠ v1Config := by
    intro h; have := congrArg HoneycombConfig.entries h
    rw [hEnt] at this; cases this
  exact ⟨hZero, fun c hc => by rw [(hZero c).mp hc]; rfl, ⟨hQBal, hDBal, hNeV1⟩⟩


/-! ### Unified `Int`-Sum Conservation Helpers for `swapFacetEdge` & All 1-Dock Stencils -/

private theorem cf_sumInt_over_superset (obs : SlotState → Int) (hEmpty : obs .empty = 0)
    (c : HoneycombConfig) (V : List Mat5) (hVnd : IsNodup V)
    (hsub : ∀ g, g ∈ c.activeDocks → g ∈ V) :
    fockSumInt c.activeDocks (fun g => fockSumInt (List.finRange 24) (fun a => obs (c.lookup g a))) =
    fockSumInt V (fun g => fockSumInt (List.finRange 24) (fun a => obs (c.lookup g a))) := by
  refine fockSumInt_subset_eq c.activeDocks V _ (activeDocks_nodup c) hVnd hsub ?_
  intro g _ hgNot
  have h0 : c.lookup g = v1FullDock := by
    if h : c.lookup g = v1FullDock then exact h else exact absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  rw [h0]
  exact fockSumInt_zero_of_all_zero (List.finRange 24) _ (fun _ _ => hEmpty)

private theorem cf_sumInt_swapFacetEdge (obs : SlotState → Int) (hEmpty : obs .empty = 0)
    (g : Mat5) (a : Fin 24) (c : HoneycombConfig) :
    fockSumInt (swapFacetEdge g a c).activeDocks
      (fun x => fockSumInt (List.finRange 24) (fun s => obs ((swapFacetEdge g a c).lookup x s))) =
    fockSumInt c.activeDocks
      (fun x => fockSumInt (List.finRange 24) (fun s => obs (c.lookup x s))) := by
  let h := mat5Mul g (transport a)
  let b := oppSlot a
  have hba : b ≠ a := (thm_24_facets_geometry.2.1 a).2
  let V := nodupUnion c.activeDocks (g :: h :: (swapFacetEdge g a c).activeDocks)
  have hVnd : IsNodup V := isNodup_nodupUnion (activeDocks_nodup c) _
  have hgV : g ∈ V := (mem_nodupUnion _ _ g).mpr (Or.inr (List.Mem.head _))
  have hhV : h ∈ V := (mem_nodupUnion _ _ h).mpr (Or.inr (List.Mem.tail _ (List.Mem.head _)))
  rw [cf_sumInt_over_superset obs hEmpty (swapFacetEdge g a c) V hVnd
        (fun x hx => (mem_nodupUnion _ _ x).mpr (Or.inr (List.Mem.tail _ (List.Mem.tail _ hx)))),
      cf_sumInt_over_superset obs hEmpty c V hVnd
        (fun x hx => (mem_nodupUnion _ _ x).mpr (Or.inl hx))]
  if hEq : h = g then
    rw [fockSumInt_eraseOne g V _ hgV, fockSumInt_eraseOne g V _ hgV]
    have hRest : fockSumInt (eraseOne g V) (fun x => fockSumInt (List.finRange 24) (fun s => obs ((swapFacetEdge g a c).lookup x s))) =
        fockSumInt (eraseOne g V) (fun x => fockSumInt (List.finRange 24) (fun s => obs (c.lookup x s))) := by
      apply fockSumInt_congr; intro x hx
      have hne : x ≠ g := ((mem_eraseOne_iff g x hVnd).mp hx).2
      apply fockSumInt_congr; intro s _
      rw [cf_lookup_swapFacetEdge]
      have hp1 : (x, s) ≠ (g, a) := fun e => hne (congrArg Prod.fst e)
      have hp2 : (x, s) ≠ facetMate (g, a) := fun e => hne (by have hf : x = h := congrArg Prod.fst e; rw [hEq] at hf; exact hf)
      rw [ite_eq_right hp1, ite_eq_right hp2]
    rw [hRest]
    have hBin : b ∈ eraseOne a (List.finRange 24) :=
      (mem_eraseOne_iff a b finRange24_nodup).mpr ⟨mem_finRange24 b, hba⟩
    rw [fockSumInt_eraseOne a (List.finRange 24) _ (mem_finRange24 a),
        fockSumInt_eraseOne b _ _ hBin,
        fockSumInt_eraseOne a (List.finRange 24) _ (mem_finRange24 a),
        fockSumInt_eraseOne b _ _ hBin]
    have hA : (swapFacetEdge g a c).lookup g a = c.lookup g b := by
      rw [cf_lookup_swapFacetEdge, ite_eq_left rfl]
      change c.lookup h b = c.lookup g b; rw [hEq]
    have hB : (swapFacetEdge g a c).lookup g b = c.lookup g a := by
      rw [cf_lookup_swapFacetEdge]
      have hp1 : (g, b) ≠ (g, a) := fun e => hba (congrArg Prod.snd e)
      have hp2 : (g, b) = facetMate (g, a) := by change (g, b) = (h, b); rw [hEq]
      rw [ite_eq_right hp1, ite_eq_left hp2]
    have hRem : fockSumInt (eraseOne b (eraseOne a (List.finRange 24))) (fun s => obs ((swapFacetEdge g a c).lookup g s)) =
        fockSumInt (eraseOne b (eraseOne a (List.finRange 24))) (fun s => obs (c.lookup g s)) := by
      apply fockSumInt_congr; intro s hs
      have ⟨hs1, hsb⟩ := (mem_eraseOne_iff b s (isNodup_eraseOne a finRange24_nodup)).mp hs
      have ⟨_, hsa⟩ := (mem_eraseOne_iff a s finRange24_nodup).mp hs1
      rw [cf_lookup_swapFacetEdge]
      have hp1 : (g, s) ≠ (g, a) := fun e => hsa (congrArg Prod.snd e)
      have hp2 : (g, s) ≠ facetMate (g, a) := fun e => hsb (congrArg Prod.snd e)
      rw [ite_eq_right hp1, ite_eq_right hp2]
    rw [hA, hB, hRem]; omega
  else
    have hhV' : h ∈ eraseOne g V := (mem_eraseOne_iff g h hVnd).mpr ⟨hhV, hEq⟩
    rw [fockSumInt_eraseOne g V _ hgV, fockSumInt_eraseOne h _ _ hhV',
        fockSumInt_eraseOne g V _ hgV, fockSumInt_eraseOne h _ _ hhV']
    have hRest : fockSumInt (eraseOne h (eraseOne g V))
          (fun x => fockSumInt (List.finRange 24) (fun s => obs ((swapFacetEdge g a c).lookup x s))) =
        fockSumInt (eraseOne h (eraseOne g V))
          (fun x => fockSumInt (List.finRange 24) (fun s => obs (c.lookup x s))) := by
      apply fockSumInt_congr; intro x hx
      have ⟨hx1, hxh⟩ := (mem_eraseOne_iff h x (isNodup_eraseOne g hVnd)).mp hx
      have ⟨_, hxg⟩ := (mem_eraseOne_iff g x hVnd).mp hx1
      apply fockSumInt_congr; intro s _
      rw [cf_lookup_swapFacetEdge]
      have hp1 : (x, s) ≠ (g, a) := fun e => hxg (congrArg Prod.fst e)
      have hp2 : (x, s) ≠ facetMate (g, a) := fun e => hxh (congrArg Prod.fst e)
      rw [ite_eq_right hp1, ite_eq_right hp2]
    rw [hRest,
        fockSumInt_eraseOne a (List.finRange 24) _ (mem_finRange24 a),
        fockSumInt_eraseOne b (List.finRange 24) _ (mem_finRange24 b),
        fockSumInt_eraseOne a (List.finRange 24) _ (mem_finRange24 a),
        fockSumInt_eraseOne b (List.finRange 24) _ (mem_finRange24 b)]
    have hGa : (swapFacetEdge g a c).lookup g a = c.lookup h b := by
      rw [cf_lookup_swapFacetEdge, ite_eq_left rfl]
    have hHb : (swapFacetEdge g a c).lookup h b = c.lookup g a := by
      rw [cf_lookup_swapFacetEdge]
      have hp1 : (h, b) ≠ (g, a) := fun e => hEq (congrArg Prod.fst e)
      have hp2 : (h, b) = facetMate (g, a) := rfl
      rw [ite_eq_right hp1, ite_eq_left hp2]
    have hRemG : fockSumInt (eraseOne a (List.finRange 24)) (fun s => obs ((swapFacetEdge g a c).lookup g s)) =
        fockSumInt (eraseOne a (List.finRange 24)) (fun s => obs (c.lookup g s)) := by
      apply fockSumInt_congr; intro s hs
      have hsa := ((mem_eraseOne_iff a s finRange24_nodup).mp hs).2
      rw [cf_lookup_swapFacetEdge]
      have hp1 : (g, s) ≠ (g, a) := fun e => hsa (congrArg Prod.snd e)
      have hp2 : (g, s) ≠ facetMate (g, a) := fun e => hEq (congrArg Prod.fst e).symm
      rw [ite_eq_right hp1, ite_eq_right hp2]
    have hRemH : fockSumInt (eraseOne b (List.finRange 24)) (fun s => obs ((swapFacetEdge g a c).lookup h s)) =
        fockSumInt (eraseOne b (List.finRange 24)) (fun s => obs (c.lookup h s)) := by
      apply fockSumInt_congr; intro s hs
      have hsb := ((mem_eraseOne_iff b s finRange24_nodup).mp hs).2
      rw [cf_lookup_swapFacetEdge]
      have hp1 : (h, s) ≠ (g, a) := fun e => hEq (congrArg Prod.fst e)
      have hp2 : (h, s) ≠ facetMate (g, a) := fun e => hsb (congrArg Prod.snd e)
      rw [ite_eq_right hp1, ite_eq_right hp2]
    rw [hGa, hHb, hRemG, hRemH]; omega

private theorem cf_sumInt_setDock (obs : SlotState → Int) (hEmpty : obs .empty = 0)
    (c : HoneycombConfig) (g : Mat5) (d : FullDock)
    (hSame : fockSumInt (List.finRange 24) (fun s => obs (d s)) =
             fockSumInt (List.finRange 24) (fun s => obs (c.lookup g s))) :
    fockSumInt (c.setDock g d).activeDocks (fun x => fockSumInt (List.finRange 24) (fun s => obs ((c.setDock g d).lookup x s))) =
    fockSumInt c.activeDocks (fun x => fockSumInt (List.finRange 24) (fun s => obs (c.lookup x s))) := by
  let V := nodupUnion c.activeDocks (g :: (c.setDock g d).activeDocks)
  have hVnd : IsNodup V := isNodup_nodupUnion (activeDocks_nodup c) _
  rw [cf_sumInt_over_superset obs hEmpty (c.setDock g d) V hVnd
        (fun x hx => (mem_nodupUnion _ _ x).mpr (Or.inr (List.Mem.tail g hx))),
      cf_sumInt_over_superset obs hEmpty c V hVnd
        (fun x hx => (mem_nodupUnion _ _ x).mpr (Or.inl hx))]
  apply fockSumInt_congr; intro x _
  rw [lookup_setDock]
  if hxg : x = g then rw [ite_eq_left hxg, hxg]; exact hSame else rw [ite_eq_right hxg]

private theorem cf_sumInt_fin24_involution (f : Fin 24 → Fin 24) (hInv : ∀ s, f (f s) = s)
    (g : Fin 24 → Int) : fockSumInt (List.finRange 24) (fun s => g (f s)) = fockSumInt (List.finRange 24) g := by
  rw [← fockSumInt_map (List.finRange 24) f g]
  have hMapNd : IsNodup ((List.finRange 24).map f) :=
    isNodup_map_inj f (fun x y h => by have := congrArg f h; rw [hInv, hInv] at this; exact this) finRange24_nodup
  exact fockSumInt_subset_eq _ (List.finRange 24) g hMapNd finRange24_nodup
    (fun x _ => mem_finRange24 x)
    (fun x _ hxNot => absurd ((mem_map_iff f _ x).mpr ⟨f x, mem_finRange24 _, hInv x⟩) hxNot)

private def cf_StencilPreservesQD (S : DockStencil) : Prop :=
  (∀ (d : FullDock) (p : NinthLoc6 × FullDock), p ∈ S d →
    fullDockCharge p.2 = fullDockCharge d ∧ dockActivity p.2 = dockActivity d) ∧
  (∀ φ : FockVec NinthLoc6 FullDock, applyStencil S φ v1FullDock = φ v1FullDock)

private theorem cf_stencilQD_comp {S₁ S₂ : DockStencil}
    (h1 : cf_StencilPreservesQD S₁) (h2 : cf_StencilPreservesQD S₂) :
    cf_StencilPreservesQD (compStencil S₁ S₂) := by
  refine ⟨fun d r hr => ?_, fun φ => by rw [cf_applyStencil_comp, h1.2, h2.2]⟩
  obtain ⟨p, hp, hq⟩ := (mem_flatMapList_iff _ (S₁ d) r).mp hr
  obtain ⟨q, hqIn, hEq⟩ := (mem_map_iff _ (S₂ p.2) r).mp hq
  have hpQD := h1.1 d p hp
  have hqQD := h2.1 p.2 q hqIn
  rw [← hEq]; exact ⟨hqQD.1.trans hpQD.1, hqQD.2.trans hpQD.2⟩

private theorem cf_stencilQD_composeLines (f : Fin 12 → DockStencil)
    (hf : ∀ l : Fin 12, cf_StencilPreservesQD (f l)) (ls : List (Fin 12)) :
    cf_StencilPreservesQD (composeLineStencils f ls) := by
  induction ls with
  | nil =>
    refine ⟨fun _ _ hp => ?_, fun φ => cf_applyStencil_id φ v1FullDock⟩
    cases hp with | head => exact ⟨rfl, rfl⟩ | tail _ h' => cases h'
  | cons l _ ih => exact cf_stencilQD_comp (hf l) ih

private theorem cf_vibeDressed_preservesQD (χ : ChiralInvariant) (g : Mat5) :
    cf_StencilPreservesQD (vibeDressedStencil χ g) := by
  have hSwapSlots : ∀ (l : Fin 12) (d : FullDock),
      fullDockCharge (swapLineSlotsDock l d) = fullDockCharge d ∧
      dockActivity (swapLineSlotsDock l d) = dockActivity d := by
    intro l d
    let sw : Fin 24 → Fin 24 := fun s => if s = lineA l then lineB l else if s = lineB l then lineA l else s
    have hne := (cf_line_geom.1 l).2.2
    have hInv : ∀ s : Fin 24, sw (sw s) = s := by
      intro s; change (if (if s = lineA l then lineB l else if s = lineB l then lineA l else s) = lineA l then lineB l
        else if (if s = lineA l then lineB l else if s = lineB l then lineA l else s) = lineB l then lineA l
        else (if s = lineA l then lineB l else if s = lineB l then lineA l else s)) = s
      if hA : s = lineA l then simp only [hA, ite_true, ite_eq_right hne.symm]
      else if hB : s = lineB l then simp only [hB, ite_eq_right hne.symm, ite_true]
      else simp only [ite_eq_right hA, ite_eq_right hB]
    have hSw : ∀ (obs : SlotState → Int),
        fockSumInt (List.finRange 24) (fun s => obs (swapLineSlotsDock l d s)) =
        fockSumInt (List.finRange 24) (fun s => obs (d s)) := by
      intro obs
      have hFun : (fun s => obs (swapLineSlotsDock l d s)) = (fun s => obs (d (sw s))) := by
        funext s; unfold swapLineSlotsDock
        if hA : s = lineA l then simp only [sw, ite_eq_left hA]
        else if hB : s = lineB l then simp only [sw, ite_eq_right hA, ite_eq_left hB]
        else simp only [sw, ite_eq_right hA, ite_eq_right hB]
      rw [hFun]; exact cf_sumInt_fin24_involution sw hInv (fun s => obs (d s))
    refine ⟨by rw [fullDockCharge_eq_fockSumInt, fullDockCharge_eq_fockSumInt]; exact hSw SlotState.charge, ?_⟩
    have hD := hSw (fun s => (s.activity : Int))
    rw [← cf_fockSumNat_cast, ← cf_fockSumNat_cast] at hD; exact Int.ofNat.inj hD
  have hSwapRoles : ∀ (l : Fin 12) (d : FullDock),
      fullDockCharge (swapLineRolesDock l d) = fullDockCharge d ∧
      dockActivity (swapLineRolesDock l d) = dockActivity d := by
    intro l d
    have hEq : ∀ (obs : SlotState → Int), (∀ s r₁ r₂, obs (.occ s r₁) = obs (.occ s r₂)) →
        fockSumInt (List.finRange 24) (fun s => obs (swapLineRolesDock l d s)) =
        fockSumInt (List.finRange 24) (fun s => obs (d s)) := by
      intro obs hRole
      apply fockSumInt_congr; intro s _
      unfold swapLineRolesDock
      cases hA : d (lineA l) with
      | empty => rfl
      | occ sA rA =>
        cases hB : d (lineB l) with
        | empty => rfl
        | occ sB rB =>
          dsimp only
          if hsA : s = lineA l then rw [ite_eq_left hsA, hsA, hA]; exact hRole sA rB rA
          else if hsB : s = lineB l then rw [ite_eq_right hsA, ite_eq_left hsB, hsB, hB]; exact hRole sB rA rB
          else rw [ite_eq_right hsA, ite_eq_right hsB]
    refine ⟨by rw [fullDockCharge_eq_fockSumInt, fullDockCharge_eq_fockSumInt]; exact hEq SlotState.charge (fun _ _ _ => rfl), ?_⟩
    have hD := hEq (fun s => (s.activity : Int)) (fun _ _ _ => rfl)
    rw [← cf_fockSumNat_cast, ← cf_fockSumNat_cast] at hD; exact Int.ofNat.inj hD
  have hRev : cf_StencilPreservesQD revStencil := by
    refine ⟨fun d _ hp => ?_, fun φ => by rw [cf_apply_revStencil]; rfl⟩
    cases hp with
    | tail _ h' => cases h'
    | head =>
      have hInv := fun a => (thm_24_facets_geometry.2.1 a).1
      refine ⟨by rw [fullDockCharge_eq_fockSumInt, fullDockCharge_eq_fockSumInt]
                 exact cf_sumInt_fin24_involution oppSlot hInv (fun s => (d s).charge), ?_⟩
      have hD := cf_sumInt_fin24_involution oppSlot hInv (fun s => ((d s).activity : Int))
      rw [← cf_fockSumNat_cast, ← cf_fockSumNat_cast] at hD; exact Int.ofNat.inj hD
  have hPhi : cf_StencilPreservesQD (phiOddStencil χ g) := by
    refine ⟨fun _ _ hp => ?_, fun φ => ?_⟩
    · cases hp with | head => exact ⟨rfl, rfl⟩ | tail _ h' => cases h'
    · simp only [applyStencil, phiOddStencil, sumList, χ.chi_v1, Int.mul_zero]
      change NinthLoc6.add (NinthLoc6.mul NinthLoc6.one (φ v1FullDock)) NinthLoc6.zero = φ v1FullDock
      rw [NinthLoc6.one_mul, NinthLoc6.add_zero]
  have hD : cf_StencilPreservesQD halfCoinStencil := by
    apply cf_stencilQD_composeLines; intro l
    refine ⟨fun d _ hp => ?_, fun φ => ?_⟩
    · unfold lineHalfCoinStencil at hp; dsimp only at hp
      cases hL : isLoneLine d l with
      | false =>
        rw [hL, ite_bool_false] at hp
        cases hp with | head => exact ⟨rfl, rfl⟩ | tail _ h' => cases h'
      | true =>
        rw [hL, ite_bool_true] at hp
        cases hp with
        | head => exact ⟨rfl, rfl⟩
        | tail _ h1 => cases h1 with | head => exact hSwapSlots l d | tail _ h2 => cases h2
    · unfold applyStencil lineHalfCoinStencil; dsimp only
      have h1 : isFullLine v1FullDock l = false := rfl
      have h2 : isLoneLine v1FullDock l = false := rfl
      rw [h1, h2, ite_bool_false, ite_bool_false]
      simp only [sumList]; rw [NinthLoc6.one_mul, StarCommRing.add_zero]
  have hK : cf_StencilPreservesQD bounceKStencil := by
    apply cf_stencilQD_composeLines; intro l
    refine ⟨fun d _ hp => ?_, fun φ => ?_⟩
    · unfold lineBounceKStencil at hp
      cases hO : isOppSignLine d l with
      | false => rw [hO, ite_bool_false] at hp; cases hp with | head => exact ⟨rfl, rfl⟩ | tail _ h' => cases h'
      | true => rw [hO, ite_bool_true] at hp; cases hp with | head => exact hSwapSlots l d | tail _ h' => cases h'
    · unfold applyStencil lineBounceKStencil
      have h1 : isOppSignLine v1FullDock l = false := rfl
      rw [h1, ite_bool_false]; simp only [sumList]; rw [NinthLoc6.one_mul, StarCommRing.add_zero]
  have hM : cf_StencilPreservesQD meetStencil := by
    apply cf_stencilQD_composeLines; intro l
    refine ⟨fun d _ hp => ?_, fun φ => ?_⟩
    · unfold lineMeetStencil at hp; dsimp only at hp
      cases hSD : isSameSignDiffRoleLine d l with
      | false =>
        rw [hSD, ite_bool_false] at hp
        cases hp with | head => exact ⟨rfl, rfl⟩ | tail _ h' => cases h'
      | true =>
        rw [hSD, ite_bool_true] at hp
        cases hp with
        | head => exact ⟨rfl, rfl⟩
        | tail _ h1 => cases h1 with | head => exact hSwapRoles l d | tail _ h2 => cases h2
    · unfold applyStencil lineMeetStencil; dsimp only
      have h1 : isSameSignEqRoleLine v1FullDock l = false := rfl
      have h2 : isSameSignDiffRoleLine v1FullDock l = false := rfl
      rw [h1, h2, ite_bool_false, ite_bool_false]
      simp only [sumList]; rw [NinthLoc6.one_mul, StarCommRing.add_zero]
  have hP : cf_StencilPreservesQD mpairStencil := by
    refine ⟨fun d p hp => ?_, fun φ => ?_⟩
    · unfold mpairStencil at hp
      cases ha : isSoleIdentPairDock d with
      | false =>
        rw [ha, ite_bool_false] at hp
        cases hp with | head => exact ⟨rfl, rfl⟩ | tail _ h' => cases h'
      | true =>
        rw [ha, ite_bool_true] at hp
        cases hp with
        | head => exact ⟨rfl, rfl⟩
        | tail _ hm =>
          obtain ⟨m, _, hEq⟩ := (mem_map_iff _ _ p).mp hm
          rw [← hEq]
          unfold isSoleIdentPairDock at ha
          cases hf : findSolePairLine d with
          | none => rw [hf] at ha; exact Bool.noConfusion ha
          | some l =>
            have hl := (find?_eq_some_iff _ _ _ hf).2
            have hSame := ((Bool.and_eq_true _ _).mp hl).1
            have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl).2
            have hEqAB : d (lineB l) = d (lineA l) := by
              unfold isSameSignEqRoleLine at hSame
              cases hA : d (lineA l) <;> cases hB : d (lineB l) <;> rw [hA, hB] at hSame
              all_goals try exact Bool.noConfusion hSame
              have ⟨hs, hr⟩ := of_decide_eq_true hSame; rw [hs, hr]
            have hDockObs : ∀ (obs : SlotState → Int) (_ : obs .empty = 0) (k : Fin 12) (dk : FullDock) (v : SlotState),
                dk (lineA k) = v → dk (lineB k) = v →
                (∀ s : Fin 24, s ≠ lineA k → s ≠ lineB k → dk s = .empty) →
                fockSumInt (List.finRange 24) (fun s => obs (dk s)) = obs v + obs v := by
              intro obs h0 k dk v hkA hkB hkOth
              have hneAB := (cf_line_geom.1 k).2.2
              have hBin : lineB k ∈ eraseOne (lineA k) (List.finRange 24) :=
                (mem_eraseOne_iff (lineA k) (lineB k) finRange24_nodup).mpr ⟨mem_finRange24 _, hneAB.symm⟩
              rw [fockSumInt_eraseOne (lineA k) (List.finRange 24) _ (mem_finRange24 _),
                  fockSumInt_eraseOne (lineB k) _ _ hBin]
              have hR0 : fockSumInt (eraseOne (lineB k) (eraseOne (lineA k) (List.finRange 24))) (fun s => obs (dk s)) = 0 := by
                apply fockSumInt_zero_of_all_zero; intro s hs
                have ⟨hs1, hneB⟩ := (mem_eraseOne_iff (lineB k) s (isNodup_eraseOne _ finRange24_nodup)).mp hs
                have ⟨_, hneA⟩ := (mem_eraseOne_iff (lineA k) s finRange24_nodup).mp hs1
                rw [hkOth s hneA hneB, h0]
              rw [hR0, hkA, hkB]; omega
            have hMoveObs : ∀ (obs : SlotState → Int), obs .empty = 0 →
                fockSumInt (List.finRange 24) (fun s => obs (moveSolePairDock m d s)) =
                fockSumInt (List.finRange 24) (fun s => obs (d s)) := by
              intro obs h0
              have h1 := hDockObs obs h0 m (moveSolePairDock m d) (d (lineA l))
                (by unfold moveSolePairDock; rw [hf]; dsimp only; rw [ite_eq_left (Or.inl rfl)])
                (by unfold moveSolePairDock; rw [hf]; dsimp only; rw [ite_eq_left (Or.inr rfl)])
                (fun s hA hB => by
                  unfold moveSolePairDock; rw [hf]; dsimp only
                  rw [ite_eq_right (fun h => match h with | Or.inl e => hA e | Or.inr e => hB e)])
              have h2 := hDockObs obs h0 l d (d (lineA l)) rfl hEqAB (fun s hA hB => by
                rcases of_decide_eq_true (hAll s (mem_finRange24 s)) with h1' | h2' | h3'
                · exact absurd h1' hA
                · exact absurd h2' hB
                · exact h3')
              rw [h1, h2]
            refine ⟨by rw [fullDockCharge_eq_fockSumInt, fullDockCharge_eq_fockSumInt]; exact hMoveObs SlotState.charge rfl, ?_⟩
            have hD := hMoveObs (fun s => (s.activity : Int)) rfl
            rw [← cf_fockSumNat_cast, ← cf_fockSumNat_cast] at hD; exact Int.ofNat.inj hD
    · unfold applyStencil mpairStencil
      have hF : isSoleIdentPairDock v1FullDock = false := by decide
      rw [hF, ite_bool_false]; simp only [sumList]; rw [NinthLoc6.one_mul, StarCommRing.add_zero]
  exact cf_stencilQD_comp
    (cf_stencilQD_comp hPhi (cf_stencilQD_comp hD (cf_stencilQD_comp hM (cf_stencilQD_comp hP (cf_stencilQD_comp hK (cf_stencilQD_comp hD hPhi))))))
    hRev

/-- Headline Theorem 11 (Exact Per-Event & All-Schedule Conservation of `0_V` (`Q`), `0_D` (`D`), & `|V_1⟩`):
    every elementary single-edge facet swap `swapFacetEdge g a`, every microscopic Vibe causal event
    (`dock g n` or `edge e n`), and every asynchronous execution schedule `execSchedule (vibeEventOp χ) π`
    strictly conserves BOTH total signed charge `Q` (`InChargeSector q`, `0_V`) and total unsigned
    activity `D = N_occ` (`InActivitySector d`, `0_D`), and leaves the calm vacuum `|V_1⟩` invariant. -/
theorem thm_cf_edge_swap_conserves_Q_and_D (χ : ChiralInvariant) :
    (∀ (g : Mat5) (a : Fin 24) (c : HoneycombConfig),
      totalCharge (swapFacetEdge g a c) = totalCharge c ∧
      totalActivity (swapFacetEdge g a c) = totalActivity c) ∧
    (∀ (g : Mat5) (a : Fin 24) (q : Int) (d : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (InChargeSector q ψ → InChargeSector q (edgeSwapOp g a ψ)) ∧
      (InActivitySector d ψ → InActivitySector d (edgeSwapOp g a ψ))) ∧
    (∀ (ev : VibeEvent) (q : Int) (d : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (InChargeSector q ψ → InChargeSector q (vibeEventOp χ ev ψ)) ∧
      (InActivitySector d ψ → InActivitySector d (vibeEventOp χ ev ψ))) ∧
    (∀ (π : List VibeEvent) (q : Int) (d : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (InChargeSector q ψ → InChargeSector q (execSchedule (vibeEventOp χ) π ψ)) ∧
      (InActivitySector d ψ → InActivitySector d (execSchedule (vibeEventOp χ) π ψ))) ∧
    (∀ (π : List VibeEvent),
      execSchedule (vibeEventOp χ) π (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config) := by
  have hSwapQD : ∀ (g : Mat5) (a : Fin 24) (c : HoneycombConfig),
      totalCharge (swapFacetEdge g a c) = totalCharge c ∧
      totalActivity (swapFacetEdge g a c) = totalActivity c := by
    intro g a c
    have hQ : totalCharge (swapFacetEdge g a c) = totalCharge c := by
      unfold totalCharge
      have hFun : ∀ c' : HoneycombConfig,
          fockSumInt c'.activeDocks (fun x => fullDockCharge (c'.lookup x)) =
          fockSumInt c'.activeDocks (fun x => fockSumInt (List.finRange 24) (fun s => (c'.lookup x s).charge)) :=
        fun c' => fockSumInt_congr c'.activeDocks _ _ (fun x _ => fullDockCharge_eq_fockSumInt (c'.lookup x))
      rw [hFun (swapFacetEdge g a c), hFun c]
      exact cf_sumInt_swapFacetEdge SlotState.charge rfl g a c
    have hD : totalActivity (swapFacetEdge g a c) = totalActivity c := by
      have hCast : ∀ c' : HoneycombConfig,
          (totalActivity c' : Int) =
          fockSumInt c'.activeDocks (fun x => fockSumInt (List.finRange 24) (fun s => ((c'.lookup x s).activity : Int))) := by
        intro c'; unfold totalActivity; rw [cf_fockSumNat_cast]
        exact fockSumInt_congr c'.activeDocks _ _ (fun x _ => cf_fockSumNat_cast (List.finRange 24) _)
      have hInt := cf_sumInt_swapFacetEdge (fun s => (s.activity : Int)) rfl g a c
      rw [← hCast (swapFacetEdge g a c), ← hCast c] at hInt
      exact Int.ofNat.inj hInt
    exact ⟨hQ, hD⟩
  have hSwapSec : ∀ (g : Mat5) (a : Fin 24) (q : Int) (d : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (InChargeSector q ψ → InChargeSector q (edgeSwapOp g a ψ)) ∧
      (InActivitySector d ψ → InActivitySector d (edgeSwapOp g a ψ)) := by
    intro g a q d ψ
    refine ⟨fun hq c hc => hq (swapFacetEdge g a c) (by rw [(hSwapQD g a c).1]; exact hc),
            fun hd c hc => hd (swapFacetEdge g a c) (by rw [(hSwapQD g a c).2]; exact hc)⟩
  have hEvQD : ∀ (ev : VibeEvent) (q : Int) (d : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (InChargeSector q ψ → InChargeSector q (vibeEventOp χ ev ψ)) ∧
      (InActivitySector d ψ → InActivitySector d (vibeEventOp χ ev ψ)) := by
    intro ev q d ψ
    cases ev with
    | edge e _ => exact hSwapSec e.u e.a q d ψ
    | dock g _ =>
      have hSt := (cf_vibeDressed_preservesQD χ g).1
      refine ⟨fun hq c hc => ?_, fun hd c hc => ?_⟩
      · unfold vibeEventOp siteDressedOp liftDockOp applyStencil dockSlice
        apply cf_sumNloc_zero_of_all_zero; intro p hp
        have hQp : fullDockCharge p.2 = fullDockCharge (c.lookup g) := (hSt (c.lookup g) p hp).1
        have hTotQ : totalCharge (c.setDock g p.2) = totalCharge c := by
          unfold totalCharge
          have hFun : ∀ c' : HoneycombConfig,
              fockSumInt c'.activeDocks (fun x => fullDockCharge (c'.lookup x)) =
              fockSumInt c'.activeDocks (fun x => fockSumInt (List.finRange 24) (fun s => (c'.lookup x s).charge)) :=
            fun c' => fockSumInt_congr c'.activeDocks _ _ (fun x _ => fullDockCharge_eq_fockSumInt (c'.lookup x))
          rw [hFun (c.setDock g p.2), hFun c]
          apply cf_sumInt_setDock SlotState.charge rfl c g p.2
          rw [← fullDockCharge_eq_fockSumInt, ← fullDockCharge_eq_fockSumInt]; exact hQp
        rw [hq (c.setDock g p.2) (by rw [hTotQ]; exact hc), NinthLoc6.mul_zero]
      · unfold vibeEventOp siteDressedOp liftDockOp applyStencil dockSlice
        apply cf_sumNloc_zero_of_all_zero; intro p hp
        have hDp : dockActivity p.2 = dockActivity (c.lookup g) := (hSt (c.lookup g) p hp).2
        have hTotD : totalActivity (c.setDock g p.2) = totalActivity c := by
          have hCast : ∀ c' : HoneycombConfig,
              (totalActivity c' : Int) =
              fockSumInt c'.activeDocks (fun x => fockSumInt (List.finRange 24) (fun s => ((c'.lookup x s).activity : Int))) := by
            intro c'; unfold totalActivity; rw [cf_fockSumNat_cast]
            exact fockSumInt_congr c'.activeDocks _ _ (fun x _ => cf_fockSumNat_cast (List.finRange 24) _)
          have hInt : (totalActivity (c.setDock g p.2) : Int) = (totalActivity c : Int) := by
            rw [hCast (c.setDock g p.2), hCast c]
            apply cf_sumInt_setDock (fun s => (s.activity : Int)) rfl c g p.2
            rw [← cf_fockSumNat_cast, ← cf_fockSumNat_cast]; exact congrArg Int.ofNat hDp
          exact Int.ofNat.inj hInt
        rw [hd (c.setDock g p.2) (by rw [hTotD]; exact hc), NinthLoc6.mul_zero]
  have hEvV1 : ∀ ev : VibeEvent,
      vibeEventOp χ ev (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
    intro ev; funext c
    cases ev with
    | edge e _ =>
      have hSwV1 : swapFacetEdge e.u e.a v1Config = v1Config := by
        apply honeycombConfig_ext; intro x; funext s
        rw [cf_lookup_swapFacetEdge]
        if h1 : (x, s) = (e.u, e.a) then rw [ite_eq_left h1]; rfl
        else if h2 : (x, s) = facetMate (e.u, e.a) then rw [ite_eq_right h1, ite_eq_left h2]; rfl
        else rw [ite_eq_right h1, ite_eq_right h2]
      change ket (R := NinthLoc6) v1Config (swapFacetEdge e.u e.a c) = ket (R := NinthLoc6) v1Config c
      rw [ket_nloc, ket_nloc]
      if hc : c = v1Config then rw [hc, hSwV1, ite_eq_left rfl]
      else
        have hne : swapFacetEdge e.u e.a c ≠ v1Config := fun h0 => hc (by
          have := congrArg (swapFacetEdge e.u e.a) h0
          rw [cf_swapFacetEdge_inv, hSwV1] at this; exact this)
        rw [ite_eq_right hne, ite_eq_right hc]
    | dock g _ =>
      have hSt := cf_vibeDressed_preservesQD χ g
      if hc : c = v1Config then
        rw [hc]; unfold vibeEventOp siteDressedOp liftDockOp
        change applyStencil (vibeDressedStencil χ g) (dockSlice g v1Config (ket (R := NinthLoc6) v1Config)) v1FullDock = _
        rw [hSt.2]; unfold dockSlice
        have hLk : v1FullDock = v1Config.lookup g := rfl
        rw [hLk, setDock_lookup_self]
      else
        rw [ket_nloc, ite_eq_right hc]
        unfold vibeEventOp siteDressedOp liftDockOp applyStencil dockSlice
        apply cf_sumNloc_zero_of_all_zero; intro p hp
        have hne : c.setDock g p.2 ≠ v1Config := fun h0 => hc (by
          apply honeycombConfig_ext; intro x
          if hxg : x = g then
            have hp0 : p.2 = v1FullDock := by
              have hLk := congrArg (fun z => z.lookup g) h0
              rw [lookup_setDock, ite_eq_left rfl] at hLk; exact hLk
            have hD0 : dockActivity (c.lookup g) = 0 := by
              rw [← (hSt.1 (c.lookup g) p hp).2, hp0]; decide
            rw [hxg, (cf_dockActivity_eq_zero_iff _).mp hD0]; rfl
          else
            have hLk := congrArg (fun z => z.lookup x) h0
            rw [lookup_setDock, ite_eq_right hxg] at hLk; exact hLk)
        rw [ket_nloc, ite_eq_right hne, NinthLoc6.mul_zero]
  have hSchedQD : ∀ (π : List VibeEvent) (q : Int) (d : Nat) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (InChargeSector q ψ → InChargeSector q (execSchedule (vibeEventOp χ) π ψ)) ∧
      (InActivitySector d ψ → InActivitySector d (execSchedule (vibeEventOp χ) π ψ)) := by
    intro π
    induction π with
    | nil => intro _ _ _ ; exact ⟨fun h => h, fun h => h⟩
    | cons ev _ ih =>
      intro q d ψ
      exact ⟨fun hq => (ih q d _).1 ((hEvQD ev q d ψ).1 hq),
             fun hd => (ih q d _).2 ((hEvQD ev q d ψ).2 hd)⟩
  have hSchedV1 : ∀ π : List VibeEvent,
      execSchedule (vibeEventOp χ) π (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
    intro π
    induction π with
    | nil => rfl
    | cons ev _ ih => simp only [execSchedule]; rw [hEvV1 ev, ih]
  exact ⟨hSwapQD, hSwapSec, hEvQD, hSchedQD, hSchedV1⟩


end

end Vibe
