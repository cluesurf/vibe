module

public import Vibe.Fock.State
import Mathlib.Tactic.Ring

/-!
# Vibe Theory: Global Local-Dock Fock Operators & Scale-2 Pairwise Commutation

Submodule 3 of 4 of `Vibe.FockBeat` (re-exported unchanged by `Vibe.FockBeat`):
- Global infinite-honeycomb Fock lifting framework `LocalSiteFamily` (`applySites`, `globalOp`),
- Concrete microscopic Fock unitaries `K`, `D = C_{1/2}`, `M_meet`, `M_pair(ζ_18)`, `Φ_odd(χ)`,
  and Coxeter stream `S`,
- Exact Scale-2 pairwise commutation `[K, M_pair] = [K, M_meet] = [M_pair, M_meet] = 0` and
  `fockScale2Core` unitarity & adjoint order-independence on all infinite-honeycomb Fock states
  (with `CommRing NinthLoc6` + Mathlib `ring` discharging all coefficient commutativity steps).
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 4: Global Infinite-Honeycomb Fock Lifting (`LocalSiteFamily`) & the 6 Concrete Operators -/

/-- A site-indexed family of Fock unitaries acting locally at each cell `g : Mat5` without
    creating or destroying active docks, fixing empty docks, and commuting across distinct cells. -/
structure LocalSiteFamily where
  unit : Mat5 → FockUnitary NinthLoc6 HoneycombConfig
  local_eq : ∀ (g : Mat5) (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig),
    (∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks →
      (∀ h : Mat5, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') →
    (unit g).op ψ₁ c = (unit g).op ψ₂ c
  local_dag_eq : ∀ (g : Mat5) (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig),
    (∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks →
      (∀ h : Mat5, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') →
    (unit g).dag ψ₁ c = (unit g).dag ψ₂ c
  op_zero : ∀ g : Mat5, (unit g).op zeroVec = zeroVec
  dag_zero : ∀ g : Mat5, (unit g).dag zeroVec = zeroVec
  idle_empty : ∀ (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig),
    c.lookup g = v1FullDock → (unit g).op ψ c = ψ c
  idle_dag_empty : ∀ (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig),
    c.lookup g = v1FullDock → (unit g).dag ψ c = ψ c
  comm_sites : ∀ (g₁ g₂ : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
    g₁ ≠ g₂ → (unit g₁).op ((unit g₂).op ψ) = (unit g₂).op ((unit g₁).op ψ)
  comm_dag_sites : ∀ (g₁ g₂ : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
    g₁ ≠ g₂ → (unit g₁).dag ((unit g₂).dag ψ) = (unit g₂).dag ((unit g₁).dag ψ)

/-- Apply a `LocalSiteFamily` over a finite list of cells `gs`. -/
def applySites (F : LocalSiteFamily) : List Mat5 →
    FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig
  | [], ψ => ψ
  | g :: gs, ψ => (F.unit g).op (applySites F gs ψ)

/-- Adjoint application of a `LocalSiteFamily` over `gs`. -/
def applySitesDag (F : LocalSiteFamily) : List Mat5 →
    FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig
  | [], ψ => ψ
  | g :: gs, ψ => applySitesDag F gs ((F.unit g).dag ψ)

/-- Finite-site `FockUnitary` product of `F` over `gs`. -/
def applySitesUnitary (F : LocalSiteFamily) : List Mat5 → FockUnitary NinthLoc6 HoneycombConfig
  | [] => FockUnitary.id
  | g :: gs => FockUnitary.comp (F.unit g) (applySitesUnitary F gs)

/-- Global infinite-honeycomb Fock operator lifted from `F : LocalSiteFamily`. -/
def globalOp (F : LocalSiteFamily) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) : NinthLoc6 :=
  applySites F c.activeDocks ψ c

/-- Global infinite-honeycomb Fock adjoint lifted from `F : LocalSiteFamily`. -/
def globalDag (F : LocalSiteFamily) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) : NinthLoc6 :=
  applySitesDag F c.activeDocks ψ c

-- [helper]
theorem applySitesUnitary_op (F : LocalSiteFamily) (gs : List Mat5) :
    (applySitesUnitary F gs).op = applySites F gs := by
  induction gs with
  | nil => rfl
  | cons g rest ih => funext ψ; simp only [applySitesUnitary, FockUnitary.comp, applySites]; rw [ih]

-- [helper]
theorem applySitesUnitary_dag (F : LocalSiteFamily) (gs : List Mat5) :
    (applySitesUnitary F gs).dag = applySitesDag F gs := by
  induction gs with
  | nil => rfl
  | cons g rest ih => funext ψ; simp only [applySitesUnitary, FockUnitary.comp, applySitesDag]; rw [ih]

-- [helper]
theorem applySites_zero (F : LocalSiteFamily) (gs : List Mat5) :
    applySites F gs zeroVec = zeroVec := by
  induction gs with | nil => rfl | cons g rest ih => simp only [applySites]; rw [ih, F.op_zero]

-- [helper]
theorem applySitesDag_zero (F : LocalSiteFamily) (gs : List Mat5) :
    applySitesDag F gs zeroVec = zeroVec := by
  induction gs with | nil => rfl | cons g rest ih => simp only [applySitesDag]; rw [F.dag_zero, ih]

-- [helper]
theorem applySites_local_eq (F : LocalSiteFamily) (gs : List Mat5)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ₁ c' = ψ₂ c') :
    applySites F gs ψ₁ c = applySites F gs ψ₂ c := by
  induction gs generalizing c with
  | nil => exact h c rfl
  | cons g rest ih =>
    simp only [applySites]
    exact F.local_eq g _ _ c fun c' hc' _ => ih c' (fun c'' hc'' => h c'' (hc''.trans hc'))

-- [helper]
theorem applySitesDag_local_eq (F : LocalSiteFamily) (gs : List Mat5)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ₁ c' = ψ₂ c') :
    applySitesDag F gs ψ₁ c = applySitesDag F gs ψ₂ c := by
  induction gs generalizing ψ₁ ψ₂ c with
  | nil => exact h c rfl
  | cons g rest ih =>
    simp only [applySitesDag]
    exact ih _ _ c fun c' hc' =>
      F.local_dag_eq g _ _ c' fun c'' hc'' _ => h c'' (hc''.trans hc')

private theorem applySites_erase (F : LocalSiteFamily) (g : Mat5) (gs : List Mat5)
    (hmem : g ∈ gs) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySites F gs ψ = (F.unit g).op (applySites F (eraseOne g gs) ψ) := by
  induction gs with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, applySites]
    split_ifs with hxg
    · subst hxg; rfl
    · cases hmem with
      | head => exact absurd rfl hxg
      | tail _ h' => simp only [applySites]; rw [ih h', F.comm_sites x g _ hxg]

private theorem applySitesDag_erase (F : LocalSiteFamily) (g : Mat5) (gs : List Mat5)
    (hmem : g ∈ gs) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySitesDag F gs ψ = applySitesDag F (eraseOne g gs) ((F.unit g).dag ψ) := by
  induction gs generalizing ψ with
  | nil => cases hmem
  | cons x rest ih =>
    simp only [eraseOne, applySitesDag]
    split_ifs with hxg
    · subst hxg; rfl
    · cases hmem with
      | head => exact absurd rfl hxg
      | tail _ h' => simp only [applySitesDag]; rw [ih h' ((F.unit x).dag ψ), F.comm_dag_sites g x ψ (Ne.symm hxg)]

-- [helper]
theorem applySites_superset (F : LocalSiteFamily) (xs V : List Mat5)
    (hxs : IsNodup xs) (hV : IsNodup V)
    (hsub : ∀ g, g ∈ xs → g ∈ V)
    (c : HoneycombConfig) (hidle : ∀ g, g ∈ V → g ∉ xs → c.lookup g = v1FullDock)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySites F V ψ c = applySites F xs ψ c := by
  induction hxs generalizing V c ψ with
  | nil =>
    simp only [applySites]
    induction V with
    | nil => rfl
    | cons v rest ihV =>
      simp only [applySites]
      rw [F.idle_empty v _ c (hidle v (List.Mem.head rest) (fun h => nomatch h))]
      exact ihV (match hV with | IsNodup.cons _ hr => hr) (fun _ h => nomatch h)
        (fun g hg hnot => hidle g (List.Mem.tail v hg) hnot)
  | @cons g rest hnot _ ih =>
    rw [applySites_erase F g V (hsub g (List.Mem.head rest)) ψ]
    simp only [applySites]
    refine F.local_eq g _ _ c fun c' _ hOther => ?_
    apply ih (eraseOne g V) (isNodup_eraseOne g hV)
    · intro x hx
      exact (mem_eraseOne_iff g x hV).mpr ⟨hsub x (List.Mem.tail g hx), fun hxg => hnot (hxg ▸ hx)⟩
    · intro x hx hxnot
      have ⟨hxV, hne⟩ := (mem_eraseOne_iff g x hV).mp hx
      rw [hOther x hne]
      exact hidle x hxV (fun hm => match hm with | List.Mem.head _ => hne rfl | List.Mem.tail _ h' => hxnot h')

private theorem applySitesDag_superset (F : LocalSiteFamily) (xs V : List Mat5)
    (hxs : IsNodup xs) (hV : IsNodup V)
    (hsub : ∀ g, g ∈ xs → g ∈ V)
    (c : HoneycombConfig) (hidle : ∀ g, g ∈ V → g ∉ xs → c.lookup g = v1FullDock)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    applySitesDag F V ψ c = applySitesDag F xs ψ c := by
  induction hxs generalizing V c ψ with
  | nil =>
    simp only [applySitesDag]
    induction V generalizing ψ with
    | nil => rfl
    | cons v rest ihV =>
      simp only [applySitesDag]
      rw [ihV (match hV with | IsNodup.cons _ hr => hr) (fun _ h => nomatch h)
            (fun g hg hnot => hidle g (List.Mem.tail v hg) hnot) ((F.unit v).dag ψ),
          F.idle_dag_empty v ψ c (hidle v (List.Mem.head rest) (fun h => nomatch h))]
  | @cons g rest hnot _ ih =>
    rw [applySitesDag_erase F g V (hsub g (List.Mem.head rest)) ψ]
    simp only [applySitesDag]
    apply ih (eraseOne g V) (isNodup_eraseOne g hV)
    · intro x hx
      exact (mem_eraseOne_iff g x hV).mpr ⟨hsub x (List.Mem.tail g hx), fun hxg => hnot (hxg ▸ hx)⟩
    · intro x hx hxnot
      have ⟨hxV, hne⟩ := (mem_eraseOne_iff g x hV).mp hx
      exact hidle x hxV (fun hm => match hm with | List.Mem.head _ => hne rfl | List.Mem.tail _ h' => hxnot h')

/-- Collect the duplicate-free union of all active cells across a finite configuration list `s`. -/
def collectSites (s : List HoneycombConfig) : List Mat5 :=
  dedupList (flatMapList HoneycombConfig.activeDocks s)

-- [helper]
theorem globalOp_eq_applySites_on_supp (F : LocalSiteFamily)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (s : List HoneycombConfig) (hs : SuppIn s ψ)
    (V : List Mat5) (hVnd : IsNodup V) (hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V) :
    globalOp F ψ = applySites F V ψ := by
  funext c; unfold globalOp
  cases hAllB : c.activeDocks.all (fun g => memBool g V) with
  | true =>
    have hAll : ∀ g, g ∈ c.activeDocks → g ∈ V := fun g hg =>
      (memBool_eq_true_iff g V).mp ((list_all_eq_true_iff _ _).mp hAllB g hg)
    refine (applySites_superset F c.activeDocks V (activeDocks_nodup c) hVnd hAll c ?_ ψ).symm
    intro g _ hgNot
    exact if h : c.lookup g = v1FullDock then h else absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  | false =>
    have hNotAll : ¬ (∀ g, g ∈ c.activeDocks → g ∈ V) := fun hAll => by
      have hT := (list_all_eq_true_iff _ _).mpr (fun g hg => (memBool_eq_true_iff g V).mpr (hAll g hg))
      rw [hAllB] at hT; exact Bool.noConfusion hT
    have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' := fun c' hc' =>
      hs.2 c' fun hc's => hNotAll fun g hg => hVcov c' hc's g (hc'.symm ▸ hg)
    rw [applySites_local_eq F c.activeDocks ψ zeroVec c hVan,
        applySites_local_eq F V ψ zeroVec c hVan, applySites_zero, applySites_zero]

-- [helper]
theorem globalDag_eq_applySitesDag_on_supp (F : LocalSiteFamily)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (s : List HoneycombConfig) (hs : SuppIn s ψ)
    (V : List Mat5) (hVnd : IsNodup V) (hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V) :
    globalDag F ψ = applySitesDag F V ψ := by
  funext c; unfold globalDag
  cases hAllB : c.activeDocks.all (fun g => memBool g V) with
  | true =>
    have hAll : ∀ g, g ∈ c.activeDocks → g ∈ V := fun g hg =>
      (memBool_eq_true_iff g V).mp ((list_all_eq_true_iff _ _).mp hAllB g hg)
    refine (applySitesDag_superset F c.activeDocks V (activeDocks_nodup c) hVnd hAll c ?_ ψ).symm
    intro g _ hgNot
    exact if h : c.lookup g = v1FullDock then h else absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  | false =>
    have hNotAll : ¬ (∀ g, g ∈ c.activeDocks → g ∈ V) := fun hAll => by
      have hT := (list_all_eq_true_iff _ _).mpr (fun g hg => (memBool_eq_true_iff g V).mpr (hAll g hg))
      rw [hAllB] at hT; exact Bool.noConfusion hT
    have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' := fun c' hc' =>
      hs.2 c' fun hc's => hNotAll fun g hg => hVcov c' hc's g (hc'.symm ▸ hg)
    rw [applySitesDag_local_eq F c.activeDocks ψ zeroVec c hVan,
        applySitesDag_local_eq F V ψ zeroVec c hVan, applySitesDag_zero, applySitesDag_zero]

/-- Exact global infinite-honeycomb `FockUnitary` lifted from ANY `LocalSiteFamily F`. -/
def globalUnitary (F : LocalSiteFamily) : FockUnitary NinthLoc6 HoneycombConfig where
  op := globalOp F
  dag := globalDag F
  leftInv := fun ψ => by
    funext c; unfold globalDag
    rw [applySitesDag_local_eq F c.activeDocks (globalOp F ψ) (applySites F c.activeDocks ψ) c
          (fun c' hc' => by unfold globalOp; rw [hc'])]
    have hInv := (applySitesUnitary F c.activeDocks).leftInv ψ
    rw [applySitesUnitary_op, applySitesUnitary_dag] at hInv; exact congrFun hInv c
  rightInv := fun ψ => by
    funext c; unfold globalOp
    rw [applySites_local_eq F c.activeDocks (globalDag F ψ) (applySitesDag F c.activeDocks ψ) c
          (fun c' hc' => by unfold globalDag; rw [hc'])]
    have hInv := (applySitesUnitary F c.activeDocks).rightInv ψ
    rw [applySitesUnitary_op, applySitesUnitary_dag] at hInv; exact congrFun hInv c
  preservesSupp := fun ψ s hs => by
    let V := collectSites s
    have hVnd : IsNodup V := isNodup_dedupList _
    have hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V := fun c hc g hg =>
      (mem_dedupList _ g).mpr ((mem_flatMapList_iff _ s g).mpr ⟨c, hc, hg⟩)
    rw [globalOp_eq_applySites_on_supp F ψ s hs V hVnd hVcov, ← applySitesUnitary_op F V]
    exact (applySitesUnitary F V).preservesSupp ψ s hs
  preservesDagSupp := fun ψ s hs => by
    let V := collectSites s
    have hVnd : IsNodup V := isNodup_dedupList _
    have hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V := fun c hc g hg =>
      (mem_dedupList _ g).mpr ((mem_flatMapList_iff _ s g).mpr ⟨c, hc, hg⟩)
    rw [globalDag_eq_applySitesDag_on_supp F ψ s hs V hVnd hVcov, ← applySitesUnitary_dag F V]
    exact (applySitesUnitary F V).preservesDagSupp ψ s hs
  preservesInner := fun ψ φ s s' hsψ hsφ hs'ψ hs'φ => by
    let V := collectSites s
    have hVnd : IsNodup V := isNodup_dedupList _
    have hVcov : ∀ c, c ∈ s → ∀ g, g ∈ c.activeDocks → g ∈ V := fun c hc g hg =>
      (mem_dedupList _ g).mpr ((mem_flatMapList_iff _ s g).mpr ⟨c, hc, hg⟩)
    have hEqψ : globalOp F ψ = (applySitesUnitary F V).op ψ := by
      rw [applySitesUnitary_op]; exact globalOp_eq_applySites_on_supp F ψ s hsψ V hVnd hVcov
    have hEqφ : globalOp F φ = (applySitesUnitary F V).op φ := by
      rw [applySitesUnitary_op]; exact globalOp_eq_applySites_on_supp F φ s hsφ V hVnd hVcov
    rw [hEqψ] at hs'ψ ⊢; rw [hEqφ] at hs'φ ⊢
    exact (applySitesUnitary F V).preservesInner ψ φ s s' hsψ hsφ hs'ψ hs'φ

private theorem globalOp_comm_of_site_comm (F₁ F₂ : LocalSiteFamily)
    (hComm : ∀ (g₁ g₂ : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (F₁.unit g₁).op ((F₂.unit g₂).op ψ) = (F₂.unit g₂).op ((F₁.unit g₁).op ψ)) :
    ∀ ψ : FockVec NinthLoc6 HoneycombConfig,
      globalOp F₁ (globalOp F₂ ψ) = globalOp F₂ (globalOp F₁ ψ) := by
  have hSwapOne : ∀ (g : Mat5) (gs : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      (F₁.unit g).op (applySites F₂ gs ψ) = applySites F₂ gs ((F₁.unit g).op ψ) := by
    intro g gs; induction gs with
    | nil => intro _; rfl
    | cons x rest ih => intro ψ; simp only [applySites]; rw [hComm g x, ih]
  have hSwapList : ∀ (gs₁ gs₂ : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      applySites F₁ gs₁ (applySites F₂ gs₂ ψ) = applySites F₂ gs₂ (applySites F₁ gs₁ ψ) := by
    intro gs₁; induction gs₁ with
    | nil => intro _ _; rfl
    | cons x rest ih => intro gs₂ ψ; simp only [applySites]; rw [ih gs₂ ψ, hSwapOne x gs₂]
  intro ψ; funext c
  change applySites F₁ c.activeDocks (globalOp F₂ ψ) c = applySites F₂ c.activeDocks (globalOp F₁ ψ) c
  rw [applySites_local_eq F₁ c.activeDocks (globalOp F₂ ψ) (applySites F₂ c.activeDocks ψ) c
        (fun c' hc' => by unfold globalOp; rw [hc']),
      applySites_local_eq F₂ c.activeDocks (globalOp F₁ ψ) (applySites F₁ c.activeDocks ψ) c
        (fun c' hc' => by unfold globalOp; rw [hc']),
      hSwapList c.activeDocks c.activeDocks ψ]

/-! ### Concrete Microscopic Operators (`K`, `M_pair(ζ_18)`, `M_meet`, `D = C_{1/2}`, `Φ_odd`, `S`) -/

/-- Swap the two antipodal slots `(lineA l, lineB l)` on a single dock `d`. -/
def swapLineSlotsDock (l : Fin 12) (d : FullDock) : FullDock :=
  fun s => if s = lineA l then d (lineB l) else if s = lineB l then d (lineA l) else d s

/-- Swap the roles of the two occupied slots on line `l` of dock `d` (leaving signs & other lines fixed). -/
def swapLineRolesDock (l : Fin 12) (d : FullDock) : FullDock :=
  match d (lineA l), d (lineB l) with
  | .occ sA rA, .occ sB rB =>
    fun s => if s = lineA l then .occ sA rB else if s = lineB l then .occ sB rA else d s
  | _, _ => d

def swapLineSlotsConfig (g : Mat5) (l : Fin 12) (c : HoneycombConfig) : HoneycombConfig :=
  c.setDock g (swapLineSlotsDock l (c.lookup g))

def swapLineRolesConfig (g : Mat5) (l : Fin 12) (c : HoneycombConfig) : HoneycombConfig :=
  c.setDock g (swapLineRolesDock l (c.lookup g))

-- [helper]
theorem swapLineSlotsDock_inv (l : Fin 12) (d : FullDock) :
    swapLineSlotsDock l (swapLineSlotsDock l d) = d := by
  have hne : lineA l ≠ lineB l := (line_geom_facts.1 l).2.2
  funext s; unfold swapLineSlotsDock
  split_ifs with hA hB <;> simp_all [Ne.symm hne]

-- [helper]
theorem swapLineRolesDock_inv (l : Fin 12) (d : FullDock) :
    swapLineRolesDock l (swapLineRolesDock l d) = d := by
  have hne : lineA l ≠ lineB l := (line_geom_facts.1 l).2.2
  unfold swapLineRolesDock
  cases hA : d (lineA l) with
  | empty => simp only [hA]
  | occ sA rA =>
    cases hB : d (lineB l) with
    | empty => simp only [hA, hB]
    | occ sB rB =>
      simp only [if_pos rfl, if_neg hne.symm]
      funext s; split_ifs with hsA hsB <;> simp_all

-- [helper]
theorem swapLineSlotsDock_empty_iff (l : Fin 12) (d : FullDock) :
    swapLineSlotsDock l d = v1FullDock ↔ d = v1FullDock := by
  have hV1 : swapLineSlotsDock l v1FullDock = v1FullDock := by
    funext s; unfold swapLineSlotsDock; split_ifs <;> rfl
  exact ⟨fun h => by rw [← swapLineSlotsDock_inv l d, h, hV1], fun h => by rw [h, hV1]⟩

-- [helper]
theorem swapLineRolesDock_empty_iff (l : Fin 12) (d : FullDock) :
    swapLineRolesDock l d = v1FullDock ↔ d = v1FullDock :=
  ⟨fun h => by rw [← swapLineRolesDock_inv l d, h]; rfl, fun h => by rw [h]; rfl⟩

-- [helper]
theorem fullDockCharge_swapLineSlots (l : Fin 12) (d : FullDock) :
    fullDockCharge (swapLineSlotsDock l d) = fullDockCharge d := by
  rw [fullDockCharge_eq_fockSumInt, fullDockCharge_eq_fockSumInt]
  let swapF : Fin 24 → Fin 24 := fun s => if s = lineA l then lineB l else if s = lineB l then lineA l else s
  have hne : lineA l ≠ lineB l := (line_geom_facts.1 l).2.2
  have hInv : ∀ s : Fin 24, swapF (swapF s) = s := fun s => by
    dsimp only [swapF]; split_ifs <;> simp_all [Ne.symm hne]
  have hEq : (fun s => (swapLineSlotsDock l d s).charge) = (fun s => (d (swapF s)).charge) := by
    funext s; unfold swapLineSlotsDock; dsimp only [swapF]; split_ifs <;> rfl
  rw [hEq, ← fockSumInt_map (List.finRange 24) swapF (fun s => (d s).charge)]
  have hMapNd : IsNodup ((List.finRange 24).map swapF) :=
    isNodup_map_inj swapF (fun x y h => by have := congrArg swapF h; rw [hInv, hInv] at this; exact this) finRange24_nodup
  exact fockSumInt_subset_eq _ (List.finRange 24) _ hMapNd finRange24_nodup
    (fun x _ => mem_finRange24 x)
    (fun x _ hxNot => absurd ((mem_map_iff swapF _ x).mpr ⟨swapF x, mem_finRange24 _, hInv x⟩) hxNot)

-- [helper]
theorem fullDockCharge_swapLineRoles (l : Fin 12) (d : FullDock) :
    fullDockCharge (swapLineRolesDock l d) = fullDockCharge d := by
  rw [fullDockCharge_eq_fockSumInt, fullDockCharge_eq_fockSumInt]
  refine fockSumInt_congr _ _ _ fun s _ => ?_
  unfold swapLineRolesDock
  cases hA : d (lineA l) with
  | empty => rfl
  | occ sA rA =>
    cases hB : d (lineB l) with
    | empty => rfl
    | occ sB rB =>
      dsimp only
      split_ifs with hsA hsB
      · subst hsA; rw [hA]; rfl
      · subst hsB; rw [hB]; rfl
      · rfl

/-- Line classification predicates on a 24-slot `FullDock`. -/
def isLoneLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ _ _, .empty => true
  | .empty, .occ _ _ => true
  | _, _ => false

def isFullLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ _ _, .occ _ _ => true
  | _, _ => false

def isOppSignLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ sA _, .occ sB _ => decide (sA ≠ sB)
  | _, _ => false

def isSameSignEqRoleLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA = rB)
  | _, _ => false

def isSameSignDiffRoleLine (d : FullDock) (l : Fin 12) : Bool :=
  match d (lineA l), d (lineB l) with
  | .occ sA rA, .occ sB rB => decide (sA = sB ∧ rA ≠ rB)
  | _, _ => false

/-- Check whether `d` has an identical-tone, identical-role full pair on line `l` and ALL other 22 slots empty. -/
def isSoleIdentPairAt (d : FullDock) (l : Fin 12) : Bool :=
  isSameSignEqRoleLine d l &&
    (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty))

/-- Find the unique line `l : Fin 12` holding a sole identical-tone, identical-role pair, if any. -/
def findSolePairLine (d : FullDock) : Option (Fin 12) :=
  (List.finRange 12).find? (fun l => isSoleIdentPairAt d l)

def isSoleIdentPairDock (d : FullDock) : Bool :=
  (findSolePairLine d).isSome

def solePairLine (d : FullDock) : Fin 12 :=
  (findSolePairLine d).getD ⟨0, by decide⟩

/-- Move a sole identical pair on `d` to antipodal line `m : Fin 12` (identity on inactive docks). -/
def moveSolePairDock (m : Fin 12) (d : FullDock) : FullDock :=
  match findSolePairLine d with
  | none => d
  | some l =>
    let v := d (lineA l)
    fun s => if s = lineA m ∨ s = lineB m then v else .empty

def moveSolePairConfig (g : Mat5) (m : Fin 12) (c : HoneycombConfig) : HoneycombConfig :=
  c.setDock g (moveSolePairDock m (c.lookup g))

-- [helper]
theorem find?_eq_some_iff {α : Type} (p : α → Bool) (xs : List α) (a : α) :
    xs.find? p = some a → a ∈ xs ∧ p a = true := by
  induction xs with
  | nil => simp
  | cons x rest ih =>
    simp only [List.find?]
    cases hpx : p x with
    | true => intro h; cases h; exact ⟨List.Mem.head rest, hpx⟩
    | false => intro h; have ⟨hm, hp⟩ := ih h; exact ⟨List.Mem.tail x hm, hp⟩

private theorem find?_isSome_of_mem {α : Type} (p : α → Bool) (xs : List α) (a : α)
    (hm : a ∈ xs) (hp : p a = true) : (xs.find? p).isSome = true := by
  induction xs with
  | nil => cases hm
  | cons x rest ih =>
    simp only [List.find?]
    cases hpx : p x with
    | true => rfl
    | false =>
      cases hm with
      | head => rw [hpx] at hp; exact Bool.noConfusion hp
      | tail _ h' => exact ih h'

private theorem soleIdentPairAt_unique (d : FullDock) (l₁ l₂ : Fin 12)
    (h1 : isSoleIdentPairAt d l₁ = true) (h2 : isSoleIdentPairAt d l₂ = true) : l₁ = l₂ := by
  by_contra heq
  unfold isSoleIdentPairAt at h1 h2; rw [Bool.and_eq_true] at h1 h2
  have hAll1 := (list_all_eq_true_iff _ _).mp h1.2 (lineA l₂) (mem_finRange24 (lineA l₂))
  have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ heq
  have hEmpty : d (lineA l₂) = .empty := by
    rcases of_decide_eq_true hAll1 with hA | hB | hE
    · exact absurd hA.symm hDisj.1
    · exact absurd hB.symm hDisj.2.2.1
    · exact hE
  have hSame := h2.1; unfold isSameSignEqRoleLine at hSame; rw [hEmpty] at hSame; exact Bool.noConfusion hSame

-- [helper]
theorem findSolePairLine_of_at (d : FullDock) (l : Fin 12)
    (h : isSoleIdentPairAt d l = true) : findSolePairLine d = some l := by
  unfold findSolePairLine
  have hSome := find?_isSome_of_mem (fun k => isSoleIdentPairAt d k) (List.finRange 12) l (mem_finRange12 l) h
  cases hf : (List.finRange 12).find? (fun k => isSoleIdentPairAt d k) with
  | none => rw [hf] at hSome; exact Bool.noConfusion hSome
  | some k => rw [soleIdentPairAt_unique d k l (find?_eq_some_iff _ _ _ hf).2 h]

private theorem isSoleIdentPairAt_move (d : FullDock) (l m : Fin 12)
    (hl : isSoleIdentPairAt d l = true) :
    isSoleIdentPairAt (moveSolePairDock m d) m = true := by
  unfold moveSolePairDock; rw [findSolePairLine_of_at d l hl]
  have hSame := ((Bool.and_eq_true _ _).mp hl).1
  unfold isSameSignEqRoleLine at hSame
  cases hA : d (lineA l) with
  | empty => rw [hA] at hSame; exact Bool.noConfusion hSame
  | occ s r =>
    unfold isSoleIdentPairAt isSameSignEqRoleLine; rw [Bool.and_eq_true]
    refine ⟨by dsimp only; rw [if_pos (Or.inl rfl), if_pos (Or.inr rfl), hA]; exact decide_eq_true ⟨rfl, rfl⟩,
            (list_all_eq_true_iff _ _).mpr fun s' _ => ?_⟩
    if hs : s' = lineA m ∨ s' = lineB m then
      rcases hs with h1 | h2
      · exact decide_eq_true (Or.inl h1)
      · exact decide_eq_true (Or.inr (Or.inl h2))
    else exact decide_eq_true (Or.inr (Or.inr (if_neg hs)))

-- [helper]
theorem moveSolePairDock_spec (d : FullDock) (hAct : isSoleIdentPairDock d = true) :
    (∀ m : Fin 12, isSoleIdentPairDock (moveSolePairDock m d) = true) ∧
    (∀ m : Fin 12, solePairLine (moveSolePairDock m d) = m) ∧
    (∀ m₁ m₂ : Fin 12, moveSolePairDock m₁ (moveSolePairDock m₂ d) = moveSolePairDock m₁ d) ∧
    (moveSolePairDock (solePairLine d) d = d) ∧
    (∀ m : Fin 12, moveSolePairDock m d ≠ v1FullDock) ∧
    (∀ m : Fin 12, fullDockCharge (moveSolePairDock m d) = fullDockCharge d) := by
  unfold isSoleIdentPairDock at hAct
  cases hf : findSolePairLine d with
  | none => rw [hf] at hAct; exact Bool.noConfusion hAct
  | some l =>
    have hl : isSoleIdentPairAt d l = true := (find?_eq_some_iff _ _ _ hf).2
    have hSame := ((Bool.and_eq_true _ _).mp hl).1
    have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl).2
    have hVal : ∃ (s : Sign) (r : Bool), d (lineA l) = .occ s r ∧ d (lineB l) = .occ s r := by
      unfold isSameSignEqRoleLine at hSame
      cases hA : d (lineA l) with
      | empty => rw [hA] at hSame; exact Bool.noConfusion hSame
      | occ sA rA =>
        cases hB : d (lineB l) with
        | empty => rw [hA, hB] at hSame; exact Bool.noConfusion hSame
        | occ sB rB =>
          rw [hA, hB] at hSame; have ⟨hs, hr⟩ := of_decide_eq_true hSame
          exact ⟨sA, rA, rfl, by rw [← hs, ← hr]⟩
    obtain ⟨s₀, r₀, hA0, hB0⟩ := hVal
    have hMoveFind : ∀ m : Fin 12, findSolePairLine (moveSolePairDock m d) = some m :=
      fun m => findSolePairLine_of_at _ m (isSoleIdentPairAt_move d l m hl)
    have hSole : solePairLine d = l := by unfold solePairLine; rw [hf]; rfl
    refine ⟨fun m => by unfold isSoleIdentPairDock; rw [hMoveFind m]; rfl,
            fun m => by unfold solePairLine; rw [hMoveFind m]; rfl, ?_, ?_, ?_, ?_⟩
    · intro m₁ m₂
      have h1 : moveSolePairDock m₁ (moveSolePairDock m₂ d) =
          fun s => if s = lineA m₁ ∨ s = lineB m₁ then (moveSolePairDock m₂ d) (lineA m₂) else .empty := by
        change (match findSolePairLine (moveSolePairDock m₂ d) with
          | none => moveSolePairDock m₂ d
          | some k => fun s => if s = lineA m₁ ∨ s = lineB m₁ then (moveSolePairDock m₂ d) (lineA k) else .empty) = _
        rw [hMoveFind m₂]
      rw [h1]; funext s; unfold moveSolePairDock; rw [hf]; dsimp only; rw [if_pos (Or.inl rfl)]
    · rw [hSole]; funext s; unfold moveSolePairDock; rw [hf]; dsimp only
      if hsA : s = lineA l then rw [if_pos (Or.inl hsA), hsA]
      else if hsB : s = lineB l then rw [if_pos (Or.inr hsB), hsB, hA0, hB0]
      else
        rw [if_neg (fun h => match h with | Or.inl e => hsA e | Or.inr e => hsB e)]
        rcases of_decide_eq_true (hAll s (mem_finRange24 s)) with h1 | h2 | h3
        · exact absurd h1 hsA
        · exact absurd h2 hsB
        · exact h3.symm
    · intro m heq
      have h0 := congrFun heq (lineA m); unfold moveSolePairDock at h0
      rw [hf] at h0; dsimp only at h0; rw [if_pos (Or.inl rfl), hA0] at h0; exact SlotState.noConfusion h0
    · intro m
      have hDockQ : ∀ (k : Fin 12) (dk : FullDock),
          dk (lineA k) = .occ s₀ r₀ → dk (lineB k) = .occ s₀ r₀ →
          (∀ s : Fin 24, s ≠ lineA k → s ≠ lineB k → dk s = .empty) →
          fullDockCharge dk = s₀.value + s₀.value := by
        intro k dk hkA hkB hkOth
        rw [fullDockCharge_eq_fockSumInt]
        have hneAB : lineA k ≠ lineB k := (line_geom_facts.1 k).2.2
        rw [fockSumInt_eraseOne (lineA k) (List.finRange 24) _ (mem_finRange24 (lineA k))]
        have hBin : lineB k ∈ eraseOne (lineA k) (List.finRange 24) :=
          (mem_eraseOne_iff (lineA k) (lineB k) finRange24_nodup).mpr ⟨mem_finRange24 (lineB k), hneAB.symm⟩
        rw [fockSumInt_eraseOne (lineB k) _ _ hBin]
        have hRest0 : fockSumInt (eraseOne (lineB k) (eraseOne (lineA k) (List.finRange 24)))
            (fun s => (dk s).charge) = 0 := by
          refine fockSumInt_zero_of_all_zero _ _ fun s hs => ?_
          have ⟨hs1, hneB⟩ := (mem_eraseOne_iff (lineB k) s (isNodup_eraseOne (lineA k) finRange24_nodup)).mp hs
          have ⟨_, hneA⟩ := (mem_eraseOne_iff (lineA k) s finRange24_nodup).mp hs1
          rw [hkOth s hneA hneB]; rfl
        rw [hRest0, hkA, hkB]; simp only [SlotState.charge]; omega
      rw [hDockQ m _ (by unfold moveSolePairDock; rw [hf]; dsimp only; rw [if_pos (Or.inl rfl), hA0])
            (by unfold moveSolePairDock; rw [hf]; dsimp only; rw [if_pos (Or.inr rfl), hA0])
            (fun s hA hB => by unfold moveSolePairDock; rw [hf]; dsimp only; rw [if_neg (fun h => match h with | Or.inl e => hA e | Or.inr e => hB e)]),
          hDockQ l d hA0 hB0 (fun s hA hB => by
            rcases of_decide_eq_true (hAll s (mem_finRange24 s)) with h1 | h2 | h3
            · exact absurd h1 hA
            · exact absurd h2 hB
            · exact h3)]

/-! ### 1. Exact Opposite-Sign Bounce `K` (Self-Adjoint Involution) -/

def lineBounceKPerm (g : Mat5) (l : Fin 12) (c : HoneycombConfig) : HoneycombConfig :=
  if isOppSignLine (c.lookup g) l then swapLineSlotsConfig g l c else c

-- [helper]
theorem lineBounceKPerm_inv (g : Mat5) (l : Fin 12) (c : HoneycombConfig) :
    lineBounceKPerm g l (lineBounceKPerm g l c) = c := by
  unfold lineBounceKPerm
  cases h : isOppSignLine (c.lookup g) l with
  | false => simp [h]
  | true =>
    rw [if_pos rfl]
    have hSwap : isOppSignLine ((swapLineSlotsConfig g l c).lookup g) l = true := by
      unfold swapLineSlotsConfig; rw [lookup_setDock, if_pos rfl]
      unfold isOppSignLine at h ⊢; unfold swapLineSlotsDock
      have hne := (line_geom_facts.1 l).2.2
      simp only [if_pos rfl, if_neg hne.symm]
      cases hA : c.lookup g (lineA l) <;> cases hB : c.lookup g (lineB l) <;> rw [hA, hB] at h
      all_goals try exact Bool.noConfusion h
      exact decide_eq_true (fun e => (of_decide_eq_true h) e.symm)
    rw [if_pos hSwap]; unfold swapLineSlotsConfig
    rw [lookup_setDock, if_pos rfl, setDock_setDock_same, swapLineSlotsDock_inv, setDock_lookup_self]

def lineBounceKUnit (g : Mat5) (l : Fin 12) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp
    (phaseUnitary (R := NinthLoc6)
      (fun c => if isOppSignLine (c.lookup g) l then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one)
      (fun c => by cases isOppSignLine (c.lookup g) l <;> exact Quot.sound (by decide)))
    (permUnitary (R := NinthLoc6) (lineBounceKPerm g l) (lineBounceKPerm g l)
      (lineBounceKPerm_inv g l) (lineBounceKPerm_inv g l))

def composeLines (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig) :
    List (Fin 12) → FockUnitary NinthLoc6 HoneycombConfig
  | [] => FockUnitary.id
  | l :: ls => FockUnitary.comp (f l) (composeLines f ls)

def siteBounceKUnit (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  composeLines (lineBounceKUnit g) (List.finRange 12)

/-! ### 2. Exact Half-Coin `D = C_{1/2}` (Per-Line Lone-Split + Full-Line `ζ_6` Phase) -/

def lineHalfCoinUnit (g : Mat5) (l : Fin 12) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp
    (phaseUnitary (R := NinthLoc6)
      (fun c => if isFullLine (c.lookup g) l then NinthLoc6.zeta6 else NinthLoc6.one)
      (fun c => by
        cases isFullLine (c.lookup g) l with
        | false => exact Quot.sound (by decide)
        | true => exact thm_fock_ring_and_gate_identities.2.2.2.2.1))
    (block2Unitary (R := NinthLoc6)
      (swapLineSlotsConfig g l)
      (fun c => isLoneLine (c.lookup g) l)
      NinthLoc6.coinDiag NinthLoc6.coinOff
      (fun c => by
        unfold swapLineSlotsConfig
        rw [lookup_setDock, if_pos rfl, setDock_setDock_same, swapLineSlotsDock_inv, setDock_lookup_self])
      (fun c => by
        unfold swapLineSlotsConfig; rw [lookup_setDock, if_pos rfl]
        unfold isLoneLine swapLineSlotsDock
        have hne := (line_geom_facts.1 l).2.2
        simp only [if_pos rfl, if_neg hne.symm]
        cases c.lookup g (lineA l) <;> cases c.lookup g (lineB l) <;> rfl)
      thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.2.1
      thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.2.2.1)

def siteHalfCoinUnit (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  composeLines (lineHalfCoinUnit g) (List.finRange 12)

/-! ### 3. Exact Same-Sign Role Meeting `M_meet` (Equal-Role `ω` Phase + Unequal-Role `2 × 2` Mixer) -/

def lineMeetUnit (g : Mat5) (l : Fin 12) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp
    (phaseUnitary (R := NinthLoc6)
      (fun c => if isSameSignEqRoleLine (c.lookup g) l then NinthLoc6.omega else NinthLoc6.one)
      (fun c => by
        cases isSameSignEqRoleLine (c.lookup g) l with
        | false => exact Quot.sound (by decide)
        | true => exact thm_fock_ring_and_gate_identities.2.2.2.2.2.1))
    (block2Unitary (R := NinthLoc6)
      (swapLineRolesConfig g l)
      (fun c => isSameSignDiffRoleLine (c.lookup g) l)
      NinthLoc6.meetKeep NinthLoc6.meetSwap
      (fun c => by
        unfold swapLineRolesConfig
        rw [lookup_setDock, if_pos rfl, setDock_setDock_same, swapLineRolesDock_inv, setDock_lookup_self])
      (fun c => by
        unfold swapLineRolesConfig; rw [lookup_setDock, if_pos rfl]
        unfold isSameSignDiffRoleLine swapLineRolesDock
        have hne := (line_geom_facts.1 l).2.2
        cases hA : c.lookup g (lineA l) with
        | empty => dsimp only; rw [hA]
        | occ sA rA =>
          cases hB : c.lookup g (lineB l) with
          | empty => dsimp only; rw [hA, hB]
          | occ sB rB =>
            simp only [if_pos rfl, if_neg hne.symm]
            cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide)
      thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.2.2.2.2.2.1
      thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.2.2.2.2.2.2.1)

def siteMeetUnit (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  composeLines (lineMeetUnit g) (List.finRange 12)

/-! ### 4. Exact `W(F_4)`-Isotropic Pair-Line Mixer `M_pair(ζ_18)` (`12 × 12` Block) -/

def siteMPairUnit (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  block12Unitary (R := NinthLoc6)
    (fun c => isSoleIdentPairDock (c.lookup g))
    (fun c => solePairLine (c.lookup g))
    (fun m c => moveSolePairConfig g m c)
    NinthLoc6.zeta18 NinthLoc6.inv12
    (fun m c h => by
      unfold moveSolePairConfig; rw [lookup_setDock, if_pos rfl]
      exact (moveSolePairDock_spec (c.lookup g) h).1 m)
    (fun m₁ m₂ c h => by
      unfold moveSolePairConfig
      rw [lookup_setDock, if_pos rfl, setDock_setDock_same, (moveSolePairDock_spec (c.lookup g) h).2.2.1 m₁ m₂])
    (fun c h => by
      unfold moveSolePairConfig
      rw [(moveSolePairDock_spec (c.lookup g) h).2.2.2.1, setDock_lookup_self])
    (fun m c h => by
      unfold moveSolePairConfig; rw [lookup_setDock, if_pos rfl]
      exact (moveSolePairDock_spec (c.lookup g) h).2.1 m)
    thm_fock_ring_and_gate_identities.2.2.1
    thm_fock_ring_and_gate_identities.2.2.2.1
    thm_fock_ring_and_gate_identities.2.2.2.2.2.2.1

/-! ### 5. Scale-4 Chiral Phase `Φ_odd(χ)` (Abstract `ChiralInvariant` + Concrete 4-Vibe Witness) -/

/-- Axiomatic interface for a `W(F_4)^+`-even, `R`-even, `CP`-even, vacuum-vanishing chiral dock invariant. -/
structure ChiralInvariant where
  chi : FullDock → Int
  chi_v1 : chi v1FullDock = 0
  chi_rev : ∀ d : FullDock, chi (revFullDock d) = chi d
  chi_cp : ∀ d : FullDock, chi (cpFullDock d) = chi d

def sitePhiOddUnit (χ : ChiralInvariant) (g : Mat5) : FockUnitary NinthLoc6 HoneycombConfig :=
  phaseUnitary (R := NinthLoc6)
    (fun c => NinthLoc6.zeta6Pow (dockParity g * χ.chi (c.lookup g)))
    (fun _c => (thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.1 _).1)

/-! ### LocalSiteFamily Proofs for All 5 Dock-Local Operators (`K`, `D`, `M_meet`, `M_pair`, `Φ_odd`) -/

private theorem nloc_sumFin12_add (f g : Fin 12 → NinthLoc6) :
    sumFin12 (fun m => NinthLoc6.add (f m) (g m)) = NinthLoc6.add (sumFin12 f) (sumFin12 g) :=
  sumFin12_add f g

private theorem nloc_sumFin12_mul_left (c : NinthLoc6) (f : Fin 12 → NinthLoc6) :
    sumFin12 (fun m => NinthLoc6.mul c (f m)) = NinthLoc6.mul c (sumFin12 f) :=
  sumFin12_mul_left c f

-- [helper]
theorem nloc_sumFin12_conj (f : Fin 12 → NinthLoc6) :
    NinthLoc6.conj (sumFin12 f) = sumFin12 (fun m => NinthLoc6.conj (f m)) :=
  sumFin12_conj f

-- [helper]
theorem nloc_sumFin12_zero :
    sumFin12 (fun _ : Fin 12 => NinthLoc6.zero) = NinthLoc6.zero :=
  sumList_zero_of_all_zero (List.finRange 12) (fun _ => NinthLoc6.zero) (fun _ _ => rfl)

private theorem nloc_sumFin12_swap (f : Fin 12 → Fin 12 → NinthLoc6) :
    sumFin12 (fun m₁ => sumFin12 (fun m₂ => f m₁ m₂)) =
      sumFin12 (fun m₂ => sumFin12 (fun m₁ => f m₁ m₂)) :=
  sumFin12_swap f

-- [helper]
theorem nloc_mul_add_swap (p a b x y : NinthLoc6) :
    NinthLoc6.mul p (NinthLoc6.add (NinthLoc6.mul a x) (NinthLoc6.mul b y)) =
      NinthLoc6.add (NinthLoc6.mul a (NinthLoc6.mul p x)) (NinthLoc6.mul b (NinthLoc6.mul p y)) := by
  change p * (a * x + b * y) = a * (p * x) + b * (p * y); ring

-- [helper]
theorem nloc_phase_block2_comm (p1 p2 a b x y : NinthLoc6) :
    NinthLoc6.mul p1 (NinthLoc6.mul p2 (NinthLoc6.add (NinthLoc6.mul a x) (NinthLoc6.mul b y))) =
      NinthLoc6.mul p2 (NinthLoc6.add (NinthLoc6.mul a (NinthLoc6.mul p1 x)) (NinthLoc6.mul b (NinthLoc6.mul p1 y))) := by
  change p1 * (p2 * (a * x + b * y)) = p2 * (a * (p1 * x) + b * (p1 * y)); ring

-- [helper]
theorem nloc_block2_comm (p1 p2 a b x00 x01 x10 x11 : NinthLoc6) :
    NinthLoc6.mul p1 (NinthLoc6.add
      (NinthLoc6.mul a (NinthLoc6.mul p2 (NinthLoc6.add (NinthLoc6.mul a x00) (NinthLoc6.mul b x01))))
      (NinthLoc6.mul b (NinthLoc6.mul p2 (NinthLoc6.add (NinthLoc6.mul a x10) (NinthLoc6.mul b x11))))) =
    NinthLoc6.mul p2 (NinthLoc6.add
      (NinthLoc6.mul a (NinthLoc6.mul p1 (NinthLoc6.add (NinthLoc6.mul a x00) (NinthLoc6.mul b x10))))
      (NinthLoc6.mul b (NinthLoc6.mul p1 (NinthLoc6.add (NinthLoc6.mul a x01) (NinthLoc6.mul b x11))))) := by
  change p1 * (a * (p2 * (a * x00 + b * x01)) + b * (p2 * (a * x10 + b * x11))) =
    p2 * (a * (p1 * (a * x00 + b * x10)) + b * (p1 * (a * x01 + b * x11)))
  ring

-- [helper]
theorem ket_nloc (c₀ c : HoneycombConfig) :
    ket (R := NinthLoc6) c₀ c = if c = c₀ then NinthLoc6.one else NinthLoc6.zero := rfl

-- [helper]
theorem zeroVec_nloc (c : HoneycombConfig) :
    zeroVec (R := NinthLoc6) c = NinthLoc6.zero := rfl

-- [helper]
theorem nloc_block12Op (act : HoneycombConfig → Bool)
    (moveTo : Fin 12 → HoneycombConfig → HoneycombConfig)
    (u inv12 : NinthLoc6) (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    block12Op (R := NinthLoc6) act moveTo u inv12 ψ c =
      if act c = true then
        NinthLoc6.add (ψ c)
          (NinthLoc6.mul (NinthLoc6.mul (NinthLoc6.sub u NinthLoc6.one) inv12)
            (sumFin12 (fun m => ψ (moveTo m c))))
      else ψ c := rfl

-- [helper]
theorem lineBounceKUnit_op (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineBounceKUnit g l).op ψ c =
      NinthLoc6.mul (if isOppSignLine (c.lookup g) l = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one)
        (ψ (lineBounceKPerm g l c)) := rfl

-- [helper]
theorem lineBounceKUnit_dag (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineBounceKUnit g l).dag ψ c =
      NinthLoc6.mul (NinthLoc6.conj (if isOppSignLine ((lineBounceKPerm g l c).lookup g) l = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one))
        (ψ (lineBounceKPerm g l c)) := rfl

-- [helper]
theorem lineHalfCoinUnit_op (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineHalfCoinUnit g l).op ψ c =
      NinthLoc6.mul (if isFullLine (c.lookup g) l = true then NinthLoc6.zeta6 else NinthLoc6.one)
        (if isLoneLine (c.lookup g) l = true then
          NinthLoc6.add (NinthLoc6.mul NinthLoc6.coinDiag (ψ c))
                        (NinthLoc6.mul NinthLoc6.coinOff (ψ (swapLineSlotsConfig g l c)))
        else ψ c) := rfl

-- [helper]
theorem lineHalfCoinUnit_dag (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineHalfCoinUnit g l).dag ψ c =
      if isLoneLine (c.lookup g) l = true then
        NinthLoc6.add
          (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinDiag)
            (NinthLoc6.mul (NinthLoc6.conj (if isFullLine (c.lookup g) l = true then NinthLoc6.zeta6 else NinthLoc6.one)) (ψ c)))
          (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinOff)
            (NinthLoc6.mul (NinthLoc6.conj (if isFullLine ((swapLineSlotsConfig g l c).lookup g) l = true then NinthLoc6.zeta6 else NinthLoc6.one)) (ψ (swapLineSlotsConfig g l c))))
      else
        NinthLoc6.mul (NinthLoc6.conj (if isFullLine (c.lookup g) l = true then NinthLoc6.zeta6 else NinthLoc6.one)) (ψ c) := rfl

-- [helper]
theorem lineMeetUnit_op (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineMeetUnit g l).op ψ c =
      NinthLoc6.mul (if isSameSignEqRoleLine (c.lookup g) l = true then NinthLoc6.omega else NinthLoc6.one)
        (if isSameSignDiffRoleLine (c.lookup g) l = true then
          NinthLoc6.add (NinthLoc6.mul NinthLoc6.meetKeep (ψ c))
                        (NinthLoc6.mul NinthLoc6.meetSwap (ψ (swapLineRolesConfig g l c)))
        else ψ c) := rfl

-- [helper]
theorem lineMeetUnit_dag (g : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (lineMeetUnit g l).dag ψ c =
      if isSameSignDiffRoleLine (c.lookup g) l = true then
        NinthLoc6.add
          (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.meetKeep)
            (NinthLoc6.mul (NinthLoc6.conj (if isSameSignEqRoleLine (c.lookup g) l = true then NinthLoc6.omega else NinthLoc6.one)) (ψ c)))
          (NinthLoc6.mul (NinthLoc6.conj NinthLoc6.meetSwap)
            (NinthLoc6.mul (NinthLoc6.conj (if isSameSignEqRoleLine ((swapLineRolesConfig g l c).lookup g) l = true then NinthLoc6.omega else NinthLoc6.one)) (ψ (swapLineRolesConfig g l c))))
      else
        NinthLoc6.mul (NinthLoc6.conj (if isSameSignEqRoleLine (c.lookup g) l = true then NinthLoc6.omega else NinthLoc6.one)) (ψ c) := rfl

-- [helper]
theorem siteMPairUnit_op (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (siteMPairUnit g).op ψ c =
      if isSoleIdentPairDock (c.lookup g) = true then
        NinthLoc6.add (ψ c)
          (NinthLoc6.mul NinthLoc6.pairHop (sumFin12 (fun m => ψ (moveSolePairConfig g m c))))
      else ψ c := rfl

-- [helper]
theorem siteMPairUnit_dag (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (siteMPairUnit g).dag ψ c =
      if isSoleIdentPairDock (c.lookup g) = true then
        NinthLoc6.add (ψ c)
          (NinthLoc6.mul (NinthLoc6.mul (NinthLoc6.sub (NinthLoc6.conj NinthLoc6.zeta18) NinthLoc6.one) NinthLoc6.inv12)
            (sumFin12 (fun m => ψ (moveSolePairConfig g m c))))
      else ψ c := rfl

-- [helper]
theorem sitePhiOddUnit_op (χ : ChiralInvariant) (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (sitePhiOddUnit χ g).op ψ c =
      NinthLoc6.mul (NinthLoc6.zeta6Pow (dockParity g * χ.chi (c.lookup g))) (ψ c) := rfl

-- [helper]
theorem sitePhiOddUnit_dag (χ : ChiralInvariant) (g : Mat5)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    (sitePhiOddUnit χ g).dag ψ c =
      NinthLoc6.mul (NinthLoc6.conj (NinthLoc6.zeta6Pow (dockParity g * χ.chi (c.lookup g)))) (ψ c) := rfl

-- [helper]
theorem composeLines_local_eq (g : Mat5) (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l ψ₁ ψ₂ c,
      (∀ c', c'.activeDocks = c.activeDocks → (∀ h, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') →
      (f l).op ψ₁ c = (f l).op ψ₂ c)
    (ls : List (Fin 12)) (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ h, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') :
    (composeLines f ls).op ψ₁ c = (composeLines f ls).op ψ₂ c := by
  induction ls generalizing c with
  | nil => exact h c rfl (fun _ _ => rfl)
  | cons l rest ih =>
    simp only [composeLines, FockUnitary.comp]
    exact hf l _ _ c fun c' hc' hOth =>
      ih c' (fun c'' hc'' hOth' => h c'' (hc''.trans hc') (fun x hx => (hOth' x hx).trans (hOth x hx)))

-- [helper]
theorem composeLines_local_dag_eq (g : Mat5) (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l ψ₁ ψ₂ c,
      (∀ c', c'.activeDocks = c.activeDocks → (∀ h, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') →
      (f l).dag ψ₁ c = (f l).dag ψ₂ c)
    (ls : List (Fin 12)) (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ h, h ≠ g → c'.lookup h = c.lookup h) → ψ₁ c' = ψ₂ c') :
    (composeLines f ls).dag ψ₁ c = (composeLines f ls).dag ψ₂ c := by
  induction ls generalizing ψ₁ ψ₂ c with
  | nil => exact h c rfl (fun _ _ => rfl)
  | cons l rest ih =>
    simp only [composeLines, FockUnitary.comp]
    exact ih _ _ c fun c' hc' hOth =>
      hf l _ _ c' fun c'' hc'' hOth' => h c'' (hc''.trans hc') (fun x hx => (hOth' x hx).trans (hOth x hx))

-- [helper]
theorem composeLines_zero (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l, (f l).op zeroVec = zeroVec) (ls : List (Fin 12)) :
    (composeLines f ls).op zeroVec = zeroVec := by
  induction ls with | nil => rfl | cons l rest ih => simp only [composeLines, FockUnitary.comp]; rw [ih, hf l]

-- [helper]
theorem composeLines_dag_zero (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (hf : ∀ l, (f l).dag zeroVec = zeroVec) (ls : List (Fin 12)) :
    (composeLines f ls).dag zeroVec = zeroVec := by
  induction ls with | nil => rfl | cons l rest ih => simp only [composeLines, FockUnitary.comp]; rw [hf l, ih]

-- [helper]
theorem composeLines_idle (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) (hf : ∀ l ψ, (f l).op ψ c = ψ c) (ls : List (Fin 12))
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (composeLines f ls).op ψ c = ψ c := by
  induction ls with | nil => rfl | cons l rest ih => simp only [composeLines, FockUnitary.comp]; rw [hf l, ih]

-- [helper]
theorem composeLines_dag_idle (f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) (hf : ∀ l ψ, (f l).dag ψ c = ψ c) (ls : List (Fin 12))
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (composeLines f ls).dag ψ c = ψ c := by
  induction ls generalizing ψ with | nil => rfl | cons l rest ih => simp only [composeLines, FockUnitary.comp]; rw [ih, hf l]

-- [helper]
theorem composeLines_comm (f₁ f₂ : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig)
    (h : ∀ l₁ l₂ ψ, (f₁ l₁).op ((f₂ l₂).op ψ) = (f₂ l₂).op ((f₁ l₁).op ψ))
    (ls₁ ls₂ : List (Fin 12)) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (composeLines f₁ ls₁).op ((composeLines f₂ ls₂).op ψ) =
      (composeLines f₂ ls₂).op ((composeLines f₁ ls₁).op ψ) := by
  have hOne : ∀ l₁ ls ψ,
      (f₁ l₁).op ((composeLines f₂ ls).op ψ) = (composeLines f₂ ls).op ((f₁ l₁).op ψ) := by
    intro l₁ ls; induction ls with
    | nil => intro _; rfl
    | cons l₂ rest ih => intro ψ; simp only [composeLines, FockUnitary.comp]; rw [h l₁ l₂, ih]
  induction ls₁ with
  | nil => rfl
  | cons l₁ rest ih => simp only [composeLines, FockUnitary.comp]; rw [ih, hOne l₁ ls₂]

-- [helper]
theorem lineBounceK_local_eq (g : Mat5) (l : Fin 12)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ x, x ≠ g → c'.lookup x = c.lookup x) → ψ₁ c' = ψ₂ c') :
    (lineBounceKUnit g l).op ψ₁ c = (lineBounceKUnit g l).op ψ₂ c := by
  rw [lineBounceKUnit_op, lineBounceKUnit_op]
  apply congrArg (NinthLoc6.mul _)
  apply h
  · unfold lineBounceKPerm
    cases isOppSignLine (c.lookup g) l with
    | false => rfl
    | true => exact activeDocks_setDock_eq c g _ (swapLineSlotsDock_empty_iff l (c.lookup g))
  · intro x hx; unfold lineBounceKPerm
    cases isOppSignLine (c.lookup g) l with
    | false => rfl
    | true => rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_neg hx]

-- [helper]
theorem lineBounceK_self_adj (g : Mat5) (l : Fin 12) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g l).dag ψ = (lineBounceKUnit g l).op ψ := by
  funext c; rw [lineBounceKUnit_dag, lineBounceKUnit_op]
  cases h : isOppSignLine (c.lookup g) l with
  | false =>
    have hEq : lineBounceKPerm g l c = c := by unfold lineBounceKPerm; rw [h, ite_bool_false]
    rw [hEq, h, ite_bool_false]
    exact congrArg (fun z => NinthLoc6.mul z (ψ c)) (Quot.sound (by decide))
  | true =>
    have hSwap : isOppSignLine ((lineBounceKPerm g l c).lookup g) l = true := by
      unfold lineBounceKPerm; rw [if_pos h]
      unfold swapLineSlotsConfig; rw [lookup_setDock, if_pos rfl]
      unfold isOppSignLine at h ⊢; unfold swapLineSlotsDock
      have hne := (line_geom_facts.1 l).2.2
      simp only [if_pos rfl, if_neg hne.symm]
      cases hA : c.lookup g (lineA l) <;> cases hB : c.lookup g (lineB l) <;> rw [hA, hB] at h
      all_goals try exact Bool.noConfusion h
      exact decide_eq_true (fun e => (of_decide_eq_true h) e.symm)
    rw [hSwap, ite_bool_true]
    exact congrArg (fun z => NinthLoc6.mul z (ψ (lineBounceKPerm g l c))) (Quot.sound (by decide))

-- [helper]
theorem lineBounceK_comm_sites (g₁ g₂ : Mat5) (l₁ l₂ : Fin 12) (hne : g₁ ≠ g₂)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g₁ l₁).op ((lineBounceKUnit g₂ l₂).op ψ) =
      (lineBounceKUnit g₂ l₂).op ((lineBounceKUnit g₁ l₁).op ψ) := by
  funext c
  simp only [lineBounceKUnit_op]
  have hLk1 : (lineBounceKPerm g₁ l₁ c).lookup g₂ = c.lookup g₂ := by
    unfold lineBounceKPerm; cases isOppSignLine (c.lookup g₁) l₁ with
    | false => rfl
    | true => rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_neg hne.symm]
  have hLk2 : (lineBounceKPerm g₂ l₂ c).lookup g₁ = c.lookup g₁ := by
    unfold lineBounceKPerm; cases isOppSignLine (c.lookup g₂) l₂ with
    | false => rfl
    | true => rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_neg hne]
  have hPerm : lineBounceKPerm g₂ l₂ (lineBounceKPerm g₁ l₁ c) =
      lineBounceKPerm g₁ l₁ (lineBounceKPerm g₂ l₂ c) := by
    change (if isOppSignLine ((lineBounceKPerm g₁ l₁ c).lookup g₂) l₂ then swapLineSlotsConfig g₂ l₂ (lineBounceKPerm g₁ l₁ c) else lineBounceKPerm g₁ l₁ c) =
           (if isOppSignLine ((lineBounceKPerm g₂ l₂ c).lookup g₁) l₁ then swapLineSlotsConfig g₁ l₁ (lineBounceKPerm g₂ l₂ c) else lineBounceKPerm g₂ l₂ c)
    rw [hLk1, hLk2]; unfold lineBounceKPerm
    cases isOppSignLine (c.lookup g₁) l₁ <;> cases isOppSignLine (c.lookup g₂) l₂
    · rfl
    · rfl
    · rfl
    · simp only [ite_true]; unfold swapLineSlotsConfig
      rw [lookup_setDock, if_neg hne.symm, lookup_setDock, if_neg hne]
      exact setDock_setDock_comm c g₁ g₂ _ _ hne
  rw [hLk1, hLk2, hPerm]
  change _ * (_ * _) = _ * (_ * _); ring

def bounceKFamily : LocalSiteFamily where
  unit := siteBounceKUnit
  local_eq := fun g => composeLines_local_eq g (lineBounceKUnit g) (lineBounceK_local_eq g) (List.finRange 12)
  local_dag_eq := fun g => composeLines_local_dag_eq g (lineBounceKUnit g)
    (fun l ψ₁ ψ₂ c h => by rw [lineBounceK_self_adj, lineBounceK_self_adj]; exact lineBounceK_local_eq g l ψ₁ ψ₂ c h)
    (List.finRange 12)
  op_zero := fun g => composeLines_zero (lineBounceKUnit g) (fun l => by
    funext c; rw [lineBounceKUnit_op, zeroVec_nloc, zeroVec_nloc]; exact NinthLoc6.mul_zero _) (List.finRange 12)
  dag_zero := fun g => composeLines_dag_zero (lineBounceKUnit g) (fun l => by
    rw [lineBounceK_self_adj]; funext c; rw [lineBounceKUnit_op, zeroVec_nloc, zeroVec_nloc]; exact NinthLoc6.mul_zero _) (List.finRange 12)
  idle_empty := fun g ψ c h0 => composeLines_idle (lineBounceKUnit g) c (fun l φ => by
    rw [lineBounceKUnit_op]
    have hF : isOppSignLine (c.lookup g) l = false := by rw [h0]; rfl
    have hP : lineBounceKPerm g l c = c := by unfold lineBounceKPerm; rw [hF, ite_bool_false]
    rw [hF, hP, ite_bool_false]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  idle_dag_empty := fun g ψ c h0 => composeLines_dag_idle (lineBounceKUnit g) c (fun l φ => by
    rw [lineBounceK_self_adj, lineBounceKUnit_op]
    have hF : isOppSignLine (c.lookup g) l = false := by rw [h0]; rfl
    have hP : lineBounceKPerm g l c = c := by unfold lineBounceKPerm; rw [hF, ite_bool_false]
    rw [hF, hP, ite_bool_false]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  comm_sites := fun g₁ g₂ ψ hne =>
    composeLines_comm (lineBounceKUnit g₁) (lineBounceKUnit g₂)
      (fun l₁ l₂ => lineBounceK_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) ψ
  comm_dag_sites := fun g₁ g₂ ψ hne =>
    fockUnitary_comm_dag (fun φ => composeLines_comm (lineBounceKUnit g₁) (lineBounceKUnit g₂)
      (fun l₁ l₂ => lineBounceK_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) φ) ψ

-- [helper]
theorem lineHalfCoin_local_eq (g : Mat5) (l : Fin 12)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ x, x ≠ g → c'.lookup x = c.lookup x) → ψ₁ c' = ψ₂ c') :
    (lineHalfCoinUnit g l).op ψ₁ c = (lineHalfCoinUnit g l).op ψ₂ c ∧
    (lineHalfCoinUnit g l).dag ψ₁ c = (lineHalfCoinUnit g l).dag ψ₂ c := by
  have hSwapAct : (swapLineSlotsConfig g l c).activeDocks = c.activeDocks :=
    activeDocks_setDock_eq c g _ (swapLineSlotsDock_empty_iff l (c.lookup g))
  have hSwapOth : ∀ x, x ≠ g → (swapLineSlotsConfig g l c).lookup x = c.lookup x :=
    fun x hx => by unfold swapLineSlotsConfig; rw [lookup_setDock, if_neg hx]
  refine ⟨?_, ?_⟩
  · rw [lineHalfCoinUnit_op, lineHalfCoinUnit_op]; apply congrArg (NinthLoc6.mul _)
    cases isLoneLine (c.lookup g) l <;>
      simp only [ite_bool_false, ite_bool_true, h c rfl (fun _ _ => rfl), h (swapLineSlotsConfig g l c) hSwapAct hSwapOth]
  · rw [lineHalfCoinUnit_dag, lineHalfCoinUnit_dag]
    cases isLoneLine (c.lookup g) l <;>
      simp only [ite_bool_false, ite_bool_true, h c rfl (fun _ _ => rfl), h (swapLineSlotsConfig g l c) hSwapAct hSwapOth]

-- [helper]
theorem lineHalfCoin_comm_sites (g₁ g₂ : Mat5) (l₁ l₂ : Fin 12) (hne : g₁ ≠ g₂)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineHalfCoinUnit g₁ l₁).op ((lineHalfCoinUnit g₂ l₂).op ψ) =
      (lineHalfCoinUnit g₂ l₂).op ((lineHalfCoinUnit g₁ l₁).op ψ) := by
  funext c; simp only [lineHalfCoinUnit_op]
  have hLk1 : (swapLineSlotsConfig g₁ l₁ c).lookup g₂ = c.lookup g₂ := by
    unfold swapLineSlotsConfig; rw [lookup_setDock, if_neg hne.symm]
  have hLk2 : (swapLineSlotsConfig g₂ l₂ c).lookup g₁ = c.lookup g₁ := by
    unfold swapLineSlotsConfig; rw [lookup_setDock, if_neg hne]
  have hSw : swapLineSlotsConfig g₂ l₂ (swapLineSlotsConfig g₁ l₁ c) =
      swapLineSlotsConfig g₁ l₁ (swapLineSlotsConfig g₂ l₂ c) := by
    unfold swapLineSlotsConfig
    rw [lookup_setDock, if_neg hne.symm, lookup_setDock, if_neg hne]
    exact setDock_setDock_comm c g₁ g₂ _ _ hne
  rw [hLk1, hLk2, hSw]
  generalize (if isFullLine (c.lookup g₁) l₁ = true then NinthLoc6.zeta6 else NinthLoc6.one) = p1
  generalize (if isFullLine (c.lookup g₂) l₂ = true then NinthLoc6.zeta6 else NinthLoc6.one) = p2
  cases isLoneLine (c.lookup g₁) l₁ <;> cases isLoneLine (c.lookup g₂) l₂
  · simp only [ite_bool_false]; change p1 * (p2 * _) = p2 * (p1 * _); ring
  · simp only [ite_bool_false, ite_true]; exact nloc_phase_block2_comm p1 p2 NinthLoc6.coinDiag NinthLoc6.coinOff _ _
  · simp only [ite_bool_false, ite_true]; exact (nloc_phase_block2_comm p2 p1 NinthLoc6.coinDiag NinthLoc6.coinOff _ _).symm
  · simp only [ite_true]; exact nloc_block2_comm p1 p2 NinthLoc6.coinDiag NinthLoc6.coinOff _ _ _ _

def halfCoinFamily : LocalSiteFamily where
  unit := siteHalfCoinUnit
  local_eq := fun g => composeLines_local_eq g (lineHalfCoinUnit g)
    (fun l ψ₁ ψ₂ c h => (lineHalfCoin_local_eq g l ψ₁ ψ₂ c h).1) (List.finRange 12)
  local_dag_eq := fun g => composeLines_local_dag_eq g (lineHalfCoinUnit g)
    (fun l ψ₁ ψ₂ c h => (lineHalfCoin_local_eq g l ψ₁ ψ₂ c h).2) (List.finRange 12)
  op_zero := fun g => composeLines_zero (lineHalfCoinUnit g) (fun l => by
    funext c; rw [lineHalfCoinUnit_op, zeroVec_nloc, zeroVec_nloc]
    cases isLoneLine (c.lookup g) l
    · rw [ite_bool_false]; exact NinthLoc6.mul_zero _
    · rw [ite_bool_true, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]) (List.finRange 12)
  dag_zero := fun g => composeLines_dag_zero (lineHalfCoinUnit g) (fun l => by
    funext c; rw [lineHalfCoinUnit_dag, zeroVec_nloc, zeroVec_nloc]
    cases isLoneLine (c.lookup g) l
    · rw [ite_bool_false]; exact NinthLoc6.mul_zero _
    · rw [ite_bool_true, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero]) (List.finRange 12)
  idle_empty := fun g ψ c h0 => composeLines_idle (lineHalfCoinUnit g) c (fun l φ => by
    rw [lineHalfCoinUnit_op]
    have hF : isFullLine (c.lookup g) l = false := by rw [h0]; rfl
    have hL : isLoneLine (c.lookup g) l = false := by rw [h0]; rfl
    rw [hF, hL, ite_bool_false, ite_bool_false]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  idle_dag_empty := fun g ψ c h0 => composeLines_dag_idle (lineHalfCoinUnit g) c (fun l φ => by
    rw [lineHalfCoinUnit_dag]
    have hF : isFullLine (c.lookup g) l = false := by rw [h0]; rfl
    have hL : isLoneLine (c.lookup g) l = false := by rw [h0]; rfl
    rw [hF, hL, ite_bool_false, ite_bool_false, NinthLoc6.conj_one]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  comm_sites := fun g₁ g₂ ψ hne =>
    composeLines_comm (lineHalfCoinUnit g₁) (lineHalfCoinUnit g₂)
      (fun l₁ l₂ => lineHalfCoin_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) ψ
  comm_dag_sites := fun g₁ g₂ ψ hne =>
    fockUnitary_comm_dag (fun φ => composeLines_comm (lineHalfCoinUnit g₁) (lineHalfCoinUnit g₂)
      (fun l₁ l₂ => lineHalfCoin_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) φ) ψ

-- [helper]
theorem lineMeet_local_eq (g : Mat5) (l : Fin 12)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ x, x ≠ g → c'.lookup x = c.lookup x) → ψ₁ c' = ψ₂ c') :
    (lineMeetUnit g l).op ψ₁ c = (lineMeetUnit g l).op ψ₂ c ∧
    (lineMeetUnit g l).dag ψ₁ c = (lineMeetUnit g l).dag ψ₂ c := by
  have hSwapAct : (swapLineRolesConfig g l c).activeDocks = c.activeDocks :=
    activeDocks_setDock_eq c g _ (swapLineRolesDock_empty_iff l (c.lookup g))
  have hSwapOth : ∀ x, x ≠ g → (swapLineRolesConfig g l c).lookup x = c.lookup x :=
    fun x hx => by unfold swapLineRolesConfig; rw [lookup_setDock, if_neg hx]
  refine ⟨?_, ?_⟩
  · rw [lineMeetUnit_op, lineMeetUnit_op]; apply congrArg (NinthLoc6.mul _)
    cases isSameSignDiffRoleLine (c.lookup g) l <;>
      simp only [ite_bool_false, ite_bool_true, h c rfl (fun _ _ => rfl), h (swapLineRolesConfig g l c) hSwapAct hSwapOth]
  · rw [lineMeetUnit_dag, lineMeetUnit_dag]
    cases isSameSignDiffRoleLine (c.lookup g) l <;>
      simp only [ite_bool_false, ite_bool_true, h c rfl (fun _ _ => rfl), h (swapLineRolesConfig g l c) hSwapAct hSwapOth]

-- [helper]
theorem lineMeet_comm_sites (g₁ g₂ : Mat5) (l₁ l₂ : Fin 12) (hne : g₁ ≠ g₂)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineMeetUnit g₁ l₁).op ((lineMeetUnit g₂ l₂).op ψ) =
      (lineMeetUnit g₂ l₂).op ((lineMeetUnit g₁ l₁).op ψ) := by
  funext c; simp only [lineMeetUnit_op]
  have hLk1 : (swapLineRolesConfig g₁ l₁ c).lookup g₂ = c.lookup g₂ := by
    unfold swapLineRolesConfig; rw [lookup_setDock, if_neg hne.symm]
  have hLk2 : (swapLineRolesConfig g₂ l₂ c).lookup g₁ = c.lookup g₁ := by
    unfold swapLineRolesConfig; rw [lookup_setDock, if_neg hne]
  have hSw : swapLineRolesConfig g₂ l₂ (swapLineRolesConfig g₁ l₁ c) =
      swapLineRolesConfig g₁ l₁ (swapLineRolesConfig g₂ l₂ c) := by
    unfold swapLineRolesConfig
    rw [lookup_setDock, if_neg hne.symm, lookup_setDock, if_neg hne]
    exact setDock_setDock_comm c g₁ g₂ _ _ hne
  rw [hLk1, hLk2, hSw]
  generalize (if isSameSignEqRoleLine (c.lookup g₁) l₁ = true then NinthLoc6.omega else NinthLoc6.one) = p1
  generalize (if isSameSignEqRoleLine (c.lookup g₂) l₂ = true then NinthLoc6.omega else NinthLoc6.one) = p2
  cases isSameSignDiffRoleLine (c.lookup g₁) l₁ <;> cases isSameSignDiffRoleLine (c.lookup g₂) l₂
  · simp only [ite_bool_false]; change p1 * (p2 * _) = p2 * (p1 * _); ring
  · simp only [ite_bool_false, ite_true]; exact nloc_phase_block2_comm p1 p2 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _
  · simp only [ite_bool_false, ite_true]; exact (nloc_phase_block2_comm p2 p1 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _).symm
  · simp only [ite_true]; exact nloc_block2_comm p1 p2 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _ _ _

def meetFamily : LocalSiteFamily where
  unit := siteMeetUnit
  local_eq := fun g => composeLines_local_eq g (lineMeetUnit g)
    (fun l ψ₁ ψ₂ c h => (lineMeet_local_eq g l ψ₁ ψ₂ c h).1) (List.finRange 12)
  local_dag_eq := fun g => composeLines_local_dag_eq g (lineMeetUnit g)
    (fun l ψ₁ ψ₂ c h => (lineMeet_local_eq g l ψ₁ ψ₂ c h).2) (List.finRange 12)
  op_zero := fun g => composeLines_zero (lineMeetUnit g) (fun l => by
    funext c; rw [lineMeetUnit_op, zeroVec_nloc, zeroVec_nloc]
    cases isSameSignDiffRoleLine (c.lookup g) l
    · rw [ite_bool_false]; exact NinthLoc6.mul_zero _
    · rw [ite_bool_true, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]) (List.finRange 12)
  dag_zero := fun g => composeLines_dag_zero (lineMeetUnit g) (fun l => by
    funext c; rw [lineMeetUnit_dag, zeroVec_nloc, zeroVec_nloc]
    cases isSameSignDiffRoleLine (c.lookup g) l
    · rw [ite_bool_false]; exact NinthLoc6.mul_zero _
    · rw [ite_bool_true, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero]) (List.finRange 12)
  idle_empty := fun g ψ c h0 => composeLines_idle (lineMeetUnit g) c (fun l φ => by
    rw [lineMeetUnit_op]
    have hE : isSameSignEqRoleLine (c.lookup g) l = false := by rw [h0]; rfl
    have hD : isSameSignDiffRoleLine (c.lookup g) l = false := by rw [h0]; rfl
    rw [hE, hD, ite_bool_false, ite_bool_false]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  idle_dag_empty := fun g ψ c h0 => composeLines_dag_idle (lineMeetUnit g) c (fun l φ => by
    rw [lineMeetUnit_dag]
    have hE : isSameSignEqRoleLine (c.lookup g) l = false := by rw [h0]; rfl
    have hD : isSameSignDiffRoleLine (c.lookup g) l = false := by rw [h0]; rfl
    rw [hE, hD, ite_bool_false, ite_bool_false, NinthLoc6.conj_one]; exact NinthLoc6.one_mul _) (List.finRange 12) ψ
  comm_sites := fun g₁ g₂ ψ hne =>
    composeLines_comm (lineMeetUnit g₁) (lineMeetUnit g₂)
      (fun l₁ l₂ => lineMeet_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) ψ
  comm_dag_sites := fun g₁ g₂ ψ hne =>
    fockUnitary_comm_dag (fun φ => composeLines_comm (lineMeetUnit g₁) (lineMeetUnit g₂)
      (fun l₁ l₂ => lineMeet_comm_sites g₁ g₂ l₁ l₂ hne) (List.finRange 12) (List.finRange 12) φ) ψ

-- [helper]
theorem siteMPair_local_eq (g : Mat5) (u : NinthLoc6)
    (ψ₁ ψ₂ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : ∀ c', c'.activeDocks = c.activeDocks → (∀ x, x ≠ g → c'.lookup x = c.lookup x) → ψ₁ c' = ψ₂ c') :
    block12Op (fun x => isSoleIdentPairDock (x.lookup g)) (moveSolePairConfig g) u NinthLoc6.inv12 ψ₁ c =
      block12Op (fun x => isSoleIdentPairDock (x.lookup g)) (moveSolePairConfig g) u NinthLoc6.inv12 ψ₂ c := by
  rw [nloc_block12Op, nloc_block12Op]
  cases ha : isSoleIdentPairDock (c.lookup g) with
  | false => rw [ite_bool_false, ite_bool_false]; exact h c rfl (fun _ _ => rfl)
  | true =>
    rw [ite_bool_true, ite_bool_true, h c rfl (fun _ _ => rfl)]
    apply congrArg (NinthLoc6.add _); apply congrArg (NinthLoc6.mul _)
    refine sumFin12_congr _ _ fun m => h _ ?_ (fun x hx => by unfold moveSolePairConfig; rw [lookup_setDock, if_neg hx])
    apply activeDocks_setDock_eq
    have hne1 := (moveSolePairDock_spec (c.lookup g) ha).2.2.2.2.1 m
    have hne2 : c.lookup g ≠ v1FullDock := fun h0 => by rw [h0] at ha; exact Bool.noConfusion ha
    exact ⟨fun h1 => absurd h1 hne1, fun h2 => absurd h2 hne2⟩

-- [helper]
theorem siteMPair_comm_sites (g₁ g₂ : Mat5) (u₁ u₂ : NinthLoc6) (hne : g₁ ≠ g₂)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    block12Op (fun x => isSoleIdentPairDock (x.lookup g₁)) (moveSolePairConfig g₁) u₁ NinthLoc6.inv12
      (block12Op (fun x => isSoleIdentPairDock (x.lookup g₂)) (moveSolePairConfig g₂) u₂ NinthLoc6.inv12 ψ) =
    block12Op (fun x => isSoleIdentPairDock (x.lookup g₂)) (moveSolePairConfig g₂) u₂ NinthLoc6.inv12
      (block12Op (fun x => isSoleIdentPairDock (x.lookup g₁)) (moveSolePairConfig g₁) u₁ NinthLoc6.inv12 ψ) := by
  funext c; simp only [nloc_block12Op]
  have hLk1 : ∀ m, (moveSolePairConfig g₁ m c).lookup g₂ = c.lookup g₂ :=
    fun m => by unfold moveSolePairConfig; rw [lookup_setDock, if_neg hne.symm]
  have hLk2 : ∀ m, (moveSolePairConfig g₂ m c).lookup g₁ = c.lookup g₁ :=
    fun m => by unfold moveSolePairConfig; rw [lookup_setDock, if_neg hne]
  have hSw : ∀ m₁ m₂, moveSolePairConfig g₂ m₂ (moveSolePairConfig g₁ m₁ c) =
      moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c) := by
    intro m₁ m₂; unfold moveSolePairConfig
    rw [lookup_setDock, if_neg hne.symm, lookup_setDock, if_neg hne]
    exact setDock_setDock_comm c g₁ g₂ _ _ hne
  cases h1 : isSoleIdentPairDock (c.lookup g₁) <;> cases h2 : isSoleIdentPairDock (c.lookup g₂)
  · simp only [ite_bool_false]
  · simp only [ite_bool_false, ite_true]
    congr 2; exact sumFin12_congr _ _ fun m₂ => by rw [hLk2 m₂, h1, ite_bool_false]
  · simp only [ite_bool_false, ite_true]
    congr 2; exact sumFin12_congr _ _ fun m₁ => by rw [hLk1 m₁, h2, ite_bool_false]
  · simp only [ite_true]
    generalize NinthLoc6.mul (NinthLoc6.sub u₁ NinthLoc6.one) NinthLoc6.inv12 = k1
    generalize NinthLoc6.mul (NinthLoc6.sub u₂ NinthLoc6.one) NinthLoc6.inv12 = k2
    have hS1 : sumFin12 (fun m₁ =>
        if isSoleIdentPairDock ((moveSolePairConfig g₁ m₁ c).lookup g₂) = true then
          NinthLoc6.add (ψ (moveSolePairConfig g₁ m₁ c))
            (NinthLoc6.mul k2 (sumFin12 (fun m₂ => ψ (moveSolePairConfig g₂ m₂ (moveSolePairConfig g₁ m₁ c)))))
        else ψ (moveSolePairConfig g₁ m₁ c)) =
      NinthLoc6.add (sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ c)))
        (NinthLoc6.mul k2 (sumFin12 (fun m₁ => sumFin12 (fun m₂ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))) := by
      rw [sumFin12_congr _ (fun m₁ => NinthLoc6.add (ψ (moveSolePairConfig g₁ m₁ c))
            (NinthLoc6.mul k2 (sumFin12 (fun m₂ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c))))))
            (fun m₁ => by rw [hLk1 m₁, h2, ite_bool_true]; congr 2; exact sumFin12_congr _ _ fun m₂ => by rw [hSw m₁ m₂]),
          nloc_sumFin12_add, nloc_sumFin12_mul_left]
    have hS2 : sumFin12 (fun m₂ =>
        if isSoleIdentPairDock ((moveSolePairConfig g₂ m₂ c).lookup g₁) = true then
          NinthLoc6.add (ψ (moveSolePairConfig g₂ m₂ c))
            (NinthLoc6.mul k1 (sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))
        else ψ (moveSolePairConfig g₂ m₂ c)) =
      NinthLoc6.add (sumFin12 (fun m₂ => ψ (moveSolePairConfig g₂ m₂ c)))
        (NinthLoc6.mul k1 (sumFin12 (fun m₂ => sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c)))))) := by
      rw [sumFin12_congr _ (fun m₂ => NinthLoc6.add (ψ (moveSolePairConfig g₂ m₂ c))
            (NinthLoc6.mul k1 (sumFin12 (fun m₁ => ψ (moveSolePairConfig g₁ m₁ (moveSolePairConfig g₂ m₂ c))))))
            (fun m₂ => by rw [hLk2 m₂, h1, ite_bool_true]),
          nloc_sumFin12_add, nloc_sumFin12_mul_left]
    rw [hS1, hS2, nloc_sumFin12_swap]
    change (ψ c + k2 * _) + k1 * (_ + k2 * _) = (ψ c + k1 * _) + k2 * (_ + k1 * _)
    ring

def mpairFamily : LocalSiteFamily where
  unit := siteMPairUnit
  local_eq := fun g => siteMPair_local_eq g NinthLoc6.zeta18
  local_dag_eq := fun g => siteMPair_local_eq g (NinthLoc6.conj NinthLoc6.zeta18)
  op_zero := fun g => by
    funext c; rw [siteMPairUnit_op]; simp only [zeroVec_nloc]
    cases isSoleIdentPairDock (c.lookup g)
    · rw [ite_bool_false]
    · rw [ite_bool_true, nloc_sumFin12_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero]
  dag_zero := fun g => by
    funext c; rw [siteMPairUnit_dag]; simp only [zeroVec_nloc]
    cases isSoleIdentPairDock (c.lookup g)
    · rw [ite_bool_false]
    · rw [ite_bool_true, nloc_sumFin12_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero]
  idle_empty := fun g ψ c h0 => by
    rw [siteMPairUnit_op]
    have hF : isSoleIdentPairDock (c.lookup g) = false := by rw [h0]; decide
    rw [hF, ite_bool_false]
  idle_dag_empty := fun g ψ c h0 => by
    rw [siteMPairUnit_dag]
    have hF : isSoleIdentPairDock (c.lookup g) = false := by rw [h0]; decide
    rw [hF, ite_bool_false]
  comm_sites := fun g₁ g₂ ψ hne => siteMPair_comm_sites g₁ g₂ NinthLoc6.zeta18 NinthLoc6.zeta18 hne ψ
  comm_dag_sites := fun g₁ g₂ ψ hne =>
    siteMPair_comm_sites g₁ g₂ (NinthLoc6.conj NinthLoc6.zeta18) (NinthLoc6.conj NinthLoc6.zeta18) hne ψ

def phiOddFamily (χ : ChiralInvariant) : LocalSiteFamily where
  unit := sitePhiOddUnit χ
  local_eq := fun g ψ₁ ψ₂ c h => by rw [sitePhiOddUnit_op, sitePhiOddUnit_op, h c rfl (fun _ _ => rfl)]
  local_dag_eq := fun g ψ₁ ψ₂ c h => by rw [sitePhiOddUnit_dag, sitePhiOddUnit_dag, h c rfl (fun _ _ => rfl)]
  op_zero := fun g => by funext c; rw [sitePhiOddUnit_op, zeroVec_nloc]; exact NinthLoc6.mul_zero _
  dag_zero := fun g => by funext c; rw [sitePhiOddUnit_dag, zeroVec_nloc]; exact NinthLoc6.mul_zero _
  idle_empty := fun g ψ c h0 => by rw [sitePhiOddUnit_op, h0, χ.chi_v1, Int.mul_zero]; exact NinthLoc6.one_mul _
  idle_dag_empty := fun g ψ c h0 => by
    rw [sitePhiOddUnit_dag, h0, χ.chi_v1, Int.mul_zero]
    change NinthLoc6.mul (NinthLoc6.conj NinthLoc6.one) (ψ c) = ψ c
    rw [NinthLoc6.conj_one]; exact NinthLoc6.one_mul _
  comm_sites := fun g₁ g₂ ψ _ => by
    funext c; simp only [sitePhiOddUnit_op]; change _ * (_ * _) = _ * (_ * _); ring
  comm_dag_sites := fun g₁ g₂ ψ _ => by
    funext c; simp only [sitePhiOddUnit_dag]; change _ * (_ * _) = _ * (_ * _); ring

/-- The 6 concrete global quantum Fock unitaries on infinite `{3,4,3,4}` over `ℤ[ζ_9][1/6]`. -/
def fockBounceKUnit : FockUnitary NinthLoc6 HoneycombConfig := globalUnitary bounceKFamily
def fockMPairUnit : FockUnitary NinthLoc6 HoneycombConfig := globalUnitary mpairFamily
def fockMeetUnit : FockUnitary NinthLoc6 HoneycombConfig := globalUnitary meetFamily
def fockHalfCoinUnit : FockUnitary NinthLoc6 HoneycombConfig := globalUnitary halfCoinFamily
def fockPhiOddUnit (χ : ChiralInvariant) : FockUnitary NinthLoc6 HoneycombConfig :=
  globalUnitary (phiOddFamily χ)
def fockStreamUnit : FockUnitary NinthLoc6 HoneycombConfig :=
  permUnitary (R := NinthLoc6) streamConfig streamConfigInv
    (fun c => (thm_fock_honeycomb_config_symmetries c).1)
    (fun c => (thm_fock_honeycomb_config_symmetries c).2.1)

abbrev fockBounceK := fockBounceKUnit.op
abbrev fockMPair := fockMPairUnit.op
abbrev fockMPairDag := fockMPairUnit.dag
abbrev fockMeet := fockMeetUnit.op
abbrev fockMeetDag := fockMeetUnit.dag
abbrev fockHalfCoin := fockHalfCoinUnit.op
abbrev fockHalfCoinDag := fockHalfCoinUnit.dag
abbrev fockPhiOdd (χ : ChiralInvariant) := (fockPhiOddUnit χ).op
abbrev fockPhiOddDag (χ : ChiralInvariant) := (fockPhiOddUnit χ).dag
abbrev fockStream := fockStreamUnit.op
abbrev fockStreamDag := fockStreamUnit.dag

-- [helper]
theorem fockStream_eval (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    fockStream ψ c = ψ (streamConfigInv c) := rfl

-- [helper]
theorem fockStreamDag_eval (ψ : FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) :
    fockStreamDag ψ c = ψ (streamConfig c) := rfl


/-! ## Section 5: Exact Global Scale-2 Pairwise Commutation (`[K, M_pair] = [K, M_meet] = [M_pair, M_meet] = 0`) -/

-- [helper]
theorem lineBounceK_comm_same_site (g : Mat5) (l₁ l₂ : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g l₁).op ((lineBounceKUnit g l₂).op ψ) =
      (lineBounceKUnit g l₂).op ((lineBounceKUnit g l₁).op ψ) := by
  if hl : l₁ = l₂ then rw [hl]
  else
    have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ hl
    funext c; simp only [lineBounceKUnit_op]
    have hLk1 : (lineBounceKPerm g l₁ c).lookup g (lineA l₂) = c.lookup g (lineA l₂) ∧
                (lineBounceKPerm g l₁ c).lookup g (lineB l₂) = c.lookup g (lineB l₂) := by
      unfold lineBounceKPerm; cases isOppSignLine (c.lookup g) l₁ with
      | false => exact ⟨rfl, rfl⟩
      | true =>
        rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_pos rfl]; unfold swapLineSlotsDock
        exact ⟨by simp only [if_neg hDisj.1.symm, if_neg hDisj.2.2.1.symm],
               by simp only [if_neg hDisj.2.1.symm, if_neg hDisj.2.2.2.symm]⟩
    have hLk2 : (lineBounceKPerm g l₂ c).lookup g (lineA l₁) = c.lookup g (lineA l₁) ∧
                (lineBounceKPerm g l₂ c).lookup g (lineB l₁) = c.lookup g (lineB l₁) := by
      unfold lineBounceKPerm; cases isOppSignLine (c.lookup g) l₂ with
      | false => exact ⟨rfl, rfl⟩
      | true =>
        rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_pos rfl]; unfold swapLineSlotsDock
        exact ⟨by simp only [if_neg hDisj.1, if_neg hDisj.2.1],
               by simp only [if_neg hDisj.2.2.1, if_neg hDisj.2.2.2]⟩
    have hO1 : isOppSignLine ((lineBounceKPerm g l₂ c).lookup g) l₁ = isOppSignLine (c.lookup g) l₁ := by
      unfold isOppSignLine; rw [hLk2.1, hLk2.2]
    have hO2 : isOppSignLine ((lineBounceKPerm g l₁ c).lookup g) l₂ = isOppSignLine (c.lookup g) l₂ := by
      unfold isOppSignLine; rw [hLk1.1, hLk1.2]
    have hPerm : lineBounceKPerm g l₂ (lineBounceKPerm g l₁ c) = lineBounceKPerm g l₁ (lineBounceKPerm g l₂ c) := by
      change (if isOppSignLine ((lineBounceKPerm g l₁ c).lookup g) l₂ then swapLineSlotsConfig g l₂ (lineBounceKPerm g l₁ c) else lineBounceKPerm g l₁ c) =
             (if isOppSignLine ((lineBounceKPerm g l₂ c).lookup g) l₁ then swapLineSlotsConfig g l₁ (lineBounceKPerm g l₂ c) else lineBounceKPerm g l₂ c)
      rw [hO1, hO2]; unfold lineBounceKPerm
      cases isOppSignLine (c.lookup g) l₁ <;> cases isOppSignLine (c.lookup g) l₂
      · rfl
      · rfl
      · rfl
      · unfold swapLineSlotsConfig
        simp only [ite_true, lookup_setDock, setDock_setDock_same]
        apply congrArg (c.setDock g); funext s; unfold swapLineSlotsDock
        split_ifs <;> simp_all [hDisj.1, hDisj.2.1, hDisj.2.2.1, hDisj.2.2.2,
          hDisj.1.symm, hDisj.2.1.symm, hDisj.2.2.1.symm, hDisj.2.2.2.symm]
    rw [hO1, hO2, hPerm]; change _ * (_ * _) = _ * (_ * _); ring

private theorem lineBounceK_comm_lineMeet_same_site (g : Mat5) (l₁ l₂ : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g l₁).op ((lineMeetUnit g l₂).op ψ) =
      (lineMeetUnit g l₂).op ((lineBounceKUnit g l₁).op ψ) := by
  funext c; simp only [lineBounceKUnit_op, lineMeetUnit_op]
  if hl : l₁ = l₂ then
    subst hl
    cases hOpp : isOppSignLine (c.lookup g) l₁ with
    | true =>
      have hEqF : isSameSignEqRoleLine (c.lookup g) l₁ = false := by
        unfold isOppSignLine at hOpp; unfold isSameSignEqRoleLine
        cases hA : c.lookup g (lineA l₁) <;> cases hB : c.lookup g (lineB l₁) <;> rw [hA, hB] at hOpp
        all_goals try rfl
        exact decide_eq_false (fun ⟨hs, _⟩ => (of_decide_eq_true hOpp) hs)
      have hDiffF : isSameSignDiffRoleLine (c.lookup g) l₁ = false := by
        unfold isOppSignLine at hOpp; unfold isSameSignDiffRoleLine
        cases hA : c.lookup g (lineA l₁) <;> cases hB : c.lookup g (lineB l₁) <;> rw [hA, hB] at hOpp
        all_goals try rfl
        exact decide_eq_false (fun ⟨hs, _⟩ => (of_decide_eq_true hOpp) hs)
      have hSwapOpp : isOppSignLine ((lineBounceKPerm g l₁ c).lookup g) l₁ = true := by
        unfold lineBounceKPerm; rw [if_pos hOpp]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_pos rfl]
        unfold isOppSignLine at hOpp ⊢; unfold swapLineSlotsDock
        have hne := (line_geom_facts.1 l₁).2.2
        simp only [if_pos rfl, if_neg hne.symm]
        cases hA : c.lookup g (lineA l₁) <;> cases hB : c.lookup g (lineB l₁) <;> rw [hA, hB] at hOpp
        all_goals try exact Bool.noConfusion hOpp
        exact decide_eq_true (fun e => (of_decide_eq_true hOpp) e.symm)
      have hSwapEqF : isSameSignEqRoleLine ((lineBounceKPerm g l₁ c).lookup g) l₁ = false := by
        unfold isOppSignLine at hSwapOpp; unfold isSameSignEqRoleLine
        cases hA : (lineBounceKPerm g l₁ c).lookup g (lineA l₁) <;>
        cases hB : (lineBounceKPerm g l₁ c).lookup g (lineB l₁) <;> rw [hA, hB] at hSwapOpp
        all_goals try rfl
        exact decide_eq_false (fun ⟨hs, _⟩ => (of_decide_eq_true hSwapOpp) hs)
      have hSwapDiffF : isSameSignDiffRoleLine ((lineBounceKPerm g l₁ c).lookup g) l₁ = false := by
        unfold isOppSignLine at hSwapOpp; unfold isSameSignDiffRoleLine
        cases hA : (lineBounceKPerm g l₁ c).lookup g (lineA l₁) <;>
        cases hB : (lineBounceKPerm g l₁ c).lookup g (lineB l₁) <;> rw [hA, hB] at hSwapOpp
        all_goals try rfl
        exact decide_eq_false (fun ⟨hs, _⟩ => (of_decide_eq_true hSwapOpp) hs)
      rw [hSwapEqF, hSwapDiffF, hEqF, hDiffF]; simp only [ite_bool_false, ite_true, NinthLoc6.one_mul]
    | false =>
      have hPermId : lineBounceKPerm g l₁ c = c := by unfold lineBounceKPerm; rw [hOpp, ite_bool_false]
      have hSwapRoleOpp : isOppSignLine ((swapLineRolesConfig g l₁ c).lookup g) l₁ = false := by
        unfold swapLineRolesConfig; rw [lookup_setDock, if_pos rfl]
        unfold isOppSignLine at hOpp ⊢; unfold swapLineRolesDock
        have hne := (line_geom_facts.1 l₁).2.2
        cases hA : c.lookup g (lineA l₁) with
        | empty => dsimp only; rw [hA]
        | occ _ _ =>
          cases hB : c.lookup g (lineB l₁) with
          | empty => dsimp only; rw [hA, hB]
          | occ _ _ => rw [hA, hB] at hOpp; simp only [if_pos rfl, if_neg hne.symm]; exact hOpp
      have hSwapRolePerm : lineBounceKPerm g l₁ (swapLineRolesConfig g l₁ c) = swapLineRolesConfig g l₁ c := by
        unfold lineBounceKPerm; rw [hSwapRoleOpp, ite_bool_false]
      rw [hPermId, hSwapRoleOpp, hSwapRolePerm]; simp only [ite_bool_false, NinthLoc6.one_mul]
  else
    have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ hl
    have hLkK : (lineBounceKPerm g l₁ c).lookup g (lineA l₂) = c.lookup g (lineA l₂) ∧
                (lineBounceKPerm g l₁ c).lookup g (lineB l₂) = c.lookup g (lineB l₂) := by
      unfold lineBounceKPerm; cases isOppSignLine (c.lookup g) l₁ with
      | false => exact ⟨rfl, rfl⟩
      | true =>
        rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_pos rfl]; unfold swapLineSlotsDock
        exact ⟨by simp only [if_neg hDisj.1.symm, if_neg hDisj.2.2.1.symm],
               by simp only [if_neg hDisj.2.1.symm, if_neg hDisj.2.2.2.symm]⟩
    have hLkM : (swapLineRolesConfig g l₂ c).lookup g (lineA l₁) = c.lookup g (lineA l₁) ∧
                (swapLineRolesConfig g l₂ c).lookup g (lineB l₁) = c.lookup g (lineB l₁) := by
      unfold swapLineRolesConfig; rw [lookup_setDock, if_pos rfl]; unfold swapLineRolesDock
      cases c.lookup g (lineA l₂) <;> cases c.lookup g (lineB l₂)
      all_goals try exact ⟨rfl, rfl⟩
      exact ⟨by simp only [if_neg hDisj.1, if_neg hDisj.2.1],
             by simp only [if_neg hDisj.2.2.1, if_neg hDisj.2.2.2]⟩
    have hEqM : isSameSignEqRoleLine ((lineBounceKPerm g l₁ c).lookup g) l₂ = isSameSignEqRoleLine (c.lookup g) l₂ := by
      unfold isSameSignEqRoleLine; rw [hLkK.1, hLkK.2]
    have hDiffM : isSameSignDiffRoleLine ((lineBounceKPerm g l₁ c).lookup g) l₂ = isSameSignDiffRoleLine (c.lookup g) l₂ := by
      unfold isSameSignDiffRoleLine; rw [hLkK.1, hLkK.2]
    have hOppK : isOppSignLine ((swapLineRolesConfig g l₂ c).lookup g) l₁ = isOppSignLine (c.lookup g) l₁ := by
      unfold isOppSignLine; rw [hLkM.1, hLkM.2]
    have hSw : swapLineRolesConfig g l₂ (lineBounceKPerm g l₁ c) =
        lineBounceKPerm g l₁ (swapLineRolesConfig g l₂ c) := by
      unfold lineBounceKPerm; rw [hOppK]
      cases isOppSignLine (c.lookup g) l₁ with
      | false => rfl
      | true =>
        unfold swapLineRolesConfig swapLineSlotsConfig
        simp only [ite_true, lookup_setDock, setDock_setDock_same]
        apply congrArg (c.setDock g); funext s; unfold swapLineRolesDock swapLineSlotsDock
        have hA2 : (if lineA l₂ = lineA l₁ then c.lookup g (lineB l₁) else if lineA l₂ = lineB l₁ then c.lookup g (lineA l₁) else c.lookup g (lineA l₂)) = c.lookup g (lineA l₂) := by
          simp only [if_neg hDisj.1.symm, if_neg hDisj.2.2.1.symm]
        have hB2 : (if lineB l₂ = lineA l₁ then c.lookup g (lineB l₁) else if lineB l₂ = lineB l₁ then c.lookup g (lineA l₁) else c.lookup g (lineB l₂)) = c.lookup g (lineB l₂) := by
          simp only [if_neg hDisj.2.1.symm, if_neg hDisj.2.2.2.symm]
        rw [hA2, hB2]
        cases c.lookup g (lineA l₂) <;> cases c.lookup g (lineB l₂)
        all_goals try rfl
        split_ifs <;> simp_all [hDisj.1, hDisj.2.1, hDisj.2.2.1, hDisj.2.2.2,
          hDisj.1.symm, hDisj.2.1.symm, hDisj.2.2.1.symm, hDisj.2.2.2.symm]
    rw [hEqM, hDiffM, hOppK, hSw]
    generalize (if isOppSignLine (c.lookup g) l₁ = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one) = pK
    generalize (if isSameSignEqRoleLine (c.lookup g) l₂ = true then NinthLoc6.omega else NinthLoc6.one) = pM
    cases isSameSignDiffRoleLine (c.lookup g) l₂
    · simp only [ite_bool_false]; change pK * (pM * _) = pM * (pK * _); ring
    · simp only [ite_true]; exact nloc_phase_block2_comm pK pM NinthLoc6.meetKeep NinthLoc6.meetSwap _ _

private theorem lineBounceK_comm_siteMPair (g₁ g₂ : Mat5) (l : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineBounceKUnit g₁ l).op ((siteMPairUnit g₂).op ψ) =
      (siteMPairUnit g₂).op ((lineBounceKUnit g₁ l).op ψ) := by
  funext c; simp only [lineBounceKUnit_op, siteMPairUnit_op]
  if hg : g₁ = g₂ then
    subst hg
    cases hPair : isSoleIdentPairDock (c.lookup g₁) with
    | true =>
      have hOppFalse : ∀ d : FullDock, isSoleIdentPairDock d = true → isOppSignLine d l = false := by
        intro d hd; unfold isSoleIdentPairDock at hd
        cases hf : findSolePairLine d with
        | none => rw [hf] at hd; exact Bool.noConfusion hd
        | some l0 =>
          have hl0 := (find?_eq_some_iff _ _ _ hf).2
          if hll : l = l0 then
            subst hll
            have hSame := ((Bool.and_eq_true _ _).mp hl0).1
            unfold isSameSignEqRoleLine at hSame; unfold isOppSignLine
            cases hA : d (lineA l) <;> cases hB : d (lineB l) <;> rw [hA, hB] at hSame
            all_goals try rfl
            exact decide_eq_false (fun hne => hne (of_decide_eq_true hSame).1)
          else
            have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
            have hDisj := line_geom_facts.2.2.2.1 l0 l (Ne.symm hll)
            have hEmpty : d (lineA l) = .empty := by
              rcases of_decide_eq_true hAll with h1 | h2 | h3
              · exact absurd h1.symm hDisj.1
              · exact absurd h2.symm hDisj.2.2.1
              · exact h3
            unfold isOppSignLine; rw [hEmpty]
      have hOppC := hOppFalse (c.lookup g₁) hPair
      have hPermId : lineBounceKPerm g₁ l c = c := by unfold lineBounceKPerm; rw [hOppC, ite_bool_false]
      rw [hOppC, hPermId, hPair]; simp only [ite_bool_false, ite_true, NinthLoc6.one_mul]
      congr 2; refine sumFin12_congr _ _ fun m => ?_
      have hPairM : isSoleIdentPairDock ((moveSolePairConfig g₁ m c).lookup g₁) = true := by
        unfold moveSolePairConfig; rw [lookup_setDock, if_pos rfl]; exact (moveSolePairDock_spec (c.lookup g₁) hPair).1 m
      have hOppM := hOppFalse _ hPairM
      have hPermM : lineBounceKPerm g₁ l (moveSolePairConfig g₁ m c) = moveSolePairConfig g₁ m c := by
        unfold lineBounceKPerm; rw [hOppM, ite_bool_false]
      rw [hOppM, hPermM, ite_bool_false, NinthLoc6.one_mul]
    | false =>
      have hPermNoPair : isSoleIdentPairDock ((lineBounceKPerm g₁ l c).lookup g₁) = false := by
        unfold lineBounceKPerm
        cases hOpp : isOppSignLine (c.lookup g₁) l with
        | false => rw [ite_bool_false]; exact hPair
        | true =>
          rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_pos rfl]
          cases hP : isSoleIdentPairDock (swapLineSlotsDock l (c.lookup g₁)) with
          | false => rfl
          | true =>
            have hSwapOpp : isOppSignLine (swapLineSlotsDock l (c.lookup g₁)) l = true := by
              unfold isOppSignLine at hOpp ⊢; unfold swapLineSlotsDock
              have hne := (line_geom_facts.1 l).2.2
              simp only [if_pos rfl, if_neg hne.symm]
              cases hA : c.lookup g₁ (lineA l) <;> cases hB : c.lookup g₁ (lineB l) <;> rw [hA, hB] at hOpp
              all_goals try exact Bool.noConfusion hOpp
              exact decide_eq_true (fun e => (of_decide_eq_true hOpp) e.symm)
            unfold isSoleIdentPairDock at hP
            cases hf : findSolePairLine (swapLineSlotsDock l (c.lookup g₁)) with
            | none => rw [hf] at hP; exact Bool.noConfusion hP
            | some l0 =>
              have hl0 := (find?_eq_some_iff _ _ _ hf).2
              if hll : l = l0 then
                subst hll
                have hSame := ((Bool.and_eq_true _ _).mp hl0).1
                unfold isSameSignEqRoleLine at hSame; unfold isOppSignLine at hSwapOpp
                cases hA : swapLineSlotsDock l (c.lookup g₁) (lineA l) <;>
                cases hB : swapLineSlotsDock l (c.lookup g₁) (lineB l) <;> rw [hA, hB] at hSame hSwapOpp
                all_goals try exact Bool.noConfusion hSame
                exact absurd (of_decide_eq_true hSame).1 (of_decide_eq_true hSwapOpp)
              else
                have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
                have hDisj := line_geom_facts.2.2.2.1 l0 l (Ne.symm hll)
                have hEmpty : swapLineSlotsDock l (c.lookup g₁) (lineA l) = .empty := by
                  rcases of_decide_eq_true hAll with h1 | h2 | h3
                  · exact absurd h1.symm hDisj.1
                  · exact absurd h2.symm hDisj.2.2.1
                  · exact h3
                unfold isOppSignLine at hSwapOpp; rw [hEmpty] at hSwapOpp; exact Bool.noConfusion hSwapOpp
      rw [hPermNoPair]; simp only [ite_bool_false]
  else
    have hLkK : (lineBounceKPerm g₁ l c).lookup g₂ = c.lookup g₂ := by
      unfold lineBounceKPerm; cases isOppSignLine (c.lookup g₁) l with
      | false => rfl
      | true => rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_neg (Ne.symm hg)]
    have hLkP : ∀ m, (moveSolePairConfig g₂ m c).lookup g₁ = c.lookup g₁ :=
      fun m => by unfold moveSolePairConfig; rw [lookup_setDock, if_neg hg]
    have hSw : ∀ m, moveSolePairConfig g₂ m (lineBounceKPerm g₁ l c) =
        lineBounceKPerm g₁ l (moveSolePairConfig g₂ m c) := by
      intro m; unfold lineBounceKPerm; rw [hLkP m]
      cases isOppSignLine (c.lookup g₁) l with
      | false => rfl
      | true =>
        simp only [ite_true]; unfold moveSolePairConfig swapLineSlotsConfig
        rw [lookup_setDock, if_neg (Ne.symm hg), lookup_setDock, if_neg hg]
        exact setDock_setDock_comm c g₁ g₂ _ _ hg
    rw [hLkK]
    cases isSoleIdentPairDock (c.lookup g₂) with
    | false => simp only [ite_bool_false]
    | true =>
      simp only [ite_true]
      generalize hpK : (if isOppSignLine (c.lookup g₁) l = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one) = pK
      have hSum : sumFin12 (fun m =>
          NinthLoc6.mul (if isOppSignLine ((moveSolePairConfig g₂ m c).lookup g₁) l = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one)
            (ψ (lineBounceKPerm g₁ l (moveSolePairConfig g₂ m c)))) =
          NinthLoc6.mul pK (sumFin12 (fun m => ψ (moveSolePairConfig g₂ m (lineBounceKPerm g₁ l c)))) := by
        rw [← nloc_sumFin12_mul_left]
        exact sumFin12_congr _ _ fun m => by rw [hLkP m, hpK, hSw m]
      rw [hSum]
      change pK * (_ + NinthLoc6.pairHop * _) = pK * _ + NinthLoc6.pairHop * (pK * _); ring

private theorem siteMeet_on_soleIdentPair (g : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) (hPair : isSoleIdentPairDock (c.lookup g) = true) :
    (siteMeetUnit g).op ψ c = NinthLoc6.mul NinthLoc6.omega (ψ c) := by
  unfold isSoleIdentPairDock at hPair
  cases hf : findSolePairLine (c.lookup g) with
  | none => rw [hf] at hPair; exact Bool.noConfusion hPair
  | some l0 =>
    have hl0 := (find?_eq_some_iff _ _ _ hf).2
    have hEqL0 : isSameSignEqRoleLine (c.lookup g) l0 = true := ((Bool.and_eq_true _ _).mp hl0).1
    have hDiffFalse : ∀ l : Fin 12, isSameSignDiffRoleLine (c.lookup g) l = false := by
      intro l
      if hll : l = l0 then
        subst hll; unfold isSameSignEqRoleLine at hEqL0; unfold isSameSignDiffRoleLine
        cases hA : c.lookup g (lineA l) <;> cases hB : c.lookup g (lineB l) <;> rw [hA, hB] at hEqL0
        all_goals try rfl
        exact decide_eq_false (fun ⟨_, hne⟩ => hne (of_decide_eq_true hEqL0).2)
      else
        have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
        have hDisj := line_geom_facts.2.2.2.1 l0 l (Ne.symm hll)
        have hE : c.lookup g (lineA l) = .empty := by
          rcases of_decide_eq_true hAll with h1 | h2 | h3
          · exact absurd h1.symm hDisj.1
          · exact absurd h2.symm hDisj.2.2.1
          · exact h3
        unfold isSameSignDiffRoleLine; rw [hE]
    have hEqOth : ∀ l : Fin 12, l ≠ l0 → isSameSignEqRoleLine (c.lookup g) l = false := by
      intro l hne
      have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
      have hDisj := line_geom_facts.2.2.2.1 l0 l hne.symm
      have hE : c.lookup g (lineA l) = .empty := by
        rcases of_decide_eq_true hAll with h1 | h2 | h3
        · exact absurd h1.symm hDisj.1
        · exact absurd h2.symm hDisj.2.2.1
        · exact h3
      unfold isSameSignEqRoleLine; rw [hE]
    have hEval : ∀ (ls : List (Fin 12)), IsNodup ls →
        (composeLines (lineMeetUnit g) ls).op ψ c =
          if memBool l0 ls then NinthLoc6.mul NinthLoc6.omega (ψ c) else ψ c := by
      intro ls hnd
      induction hnd with
      | nil => rfl
      | @cons l rest hnot _ ih =>
        simp only [composeLines, FockUnitary.comp]
        rw [lineMeetUnit_op, hDiffFalse l, ite_bool_false]
        if hll : l = l0 then
          subst hll
          have hNotMem : memBool l rest ≠ true := fun hm => hnot ((memBool_eq_true_iff l rest).mp hm)
          simp only [memBool, if_pos rfl, hEqL0, ite_bool_true, ih, if_neg hNotMem]
        else
          have hMem : memBool l0 (l :: rest) = memBool l0 rest := by simp only [memBool, if_neg hll]
          rw [hEqOth l hll, ite_bool_false, NinthLoc6.one_mul, ih, hMem]
    unfold siteMeetUnit
    rw [hEval (List.finRange 12) finRange12_nodup, (memBool_eq_true_iff l0 _).mpr (mem_finRange12 l0), ite_bool_true]

private theorem lineMeet_preserves_not_solePair (g : Mat5) (l : Fin 12) (c : HoneycombConfig)
    (hF : isSoleIdentPairDock (c.lookup g) = false) :
    isSoleIdentPairDock ((swapLineRolesConfig g l c).lookup g) = false := by
  unfold swapLineRolesConfig; rw [lookup_setDock, if_pos rfl]
  cases hSw : isSoleIdentPairDock (swapLineRolesDock l (c.lookup g)) with
  | false => rfl
  | true =>
    have hId : swapLineRolesDock l (c.lookup g) = c.lookup g := by
      unfold isSoleIdentPairDock at hSw
      cases hf : findSolePairLine (swapLineRolesDock l (c.lookup g)) with
      | none => rw [hf] at hSw; exact Bool.noConfusion hSw
      | some l0 =>
        have hl0 := (find?_eq_some_iff _ _ _ hf).2
        unfold swapLineRolesDock
        cases hA : c.lookup g (lineA l) with
        | empty => rfl
        | occ sA rA =>
          cases hB : c.lookup g (lineB l) with
          | empty => rfl
          | occ sB rB =>
            if hll : l = l0 then
              subst hll
              have hSame := ((Bool.and_eq_true _ _).mp hl0).1
              unfold isSameSignEqRoleLine swapLineRolesDock at hSame
              have hne := (line_geom_facts.1 l).2.2
              rw [hA, hB] at hSame; simp only [if_pos rfl, if_neg hne.symm] at hSame
              have ⟨_, hrEq⟩ := of_decide_eq_true hSame
              funext s; split_ifs with hsA hsB
              · subst hsA; rw [hA, hrEq]
              · subst hsB; rw [hB, hrEq]
              · rfl
            else
              have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl0).2 (lineA l) (mem_finRange24 _)
              have hDisj := line_geom_facts.2.2.2.1 l0 l (Ne.symm hll)
              have hE : swapLineRolesDock l (c.lookup g) (lineA l) = .empty := by
                rcases of_decide_eq_true hAll with h1 | h2 | h3
                · exact absurd h1.symm hDisj.1
                · exact absurd h2.symm hDisj.2.2.1
                · exact h3
              unfold swapLineRolesDock at hE; rw [hA, hB] at hE; dsimp only at hE; rw [if_pos rfl] at hE
              exact SlotState.noConfusion hE
    rw [hId, hF] at hSw; exact Bool.noConfusion hSw

private theorem siteMPair_comm_siteMeet (g₁ g₂ : Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (siteMPairUnit g₁).op ((siteMeetUnit g₂).op ψ) =
      (siteMeetUnit g₂).op ((siteMPairUnit g₁).op ψ) := by
  if hg : g₁ = g₂ then
    subst hg; funext c
    cases hPair : isSoleIdentPairDock (c.lookup g₁) with
    | true =>
      rw [siteMeet_on_soleIdentPair g₁ ((siteMPairUnit g₁).op ψ) c hPair,
          siteMPairUnit_op, siteMPairUnit_op, hPair, ite_bool_true, ite_bool_true,
          siteMeet_on_soleIdentPair g₁ ψ c hPair]
      have hSum : sumFin12 (fun m => (siteMeetUnit g₁).op ψ (moveSolePairConfig g₁ m c)) =
          NinthLoc6.mul NinthLoc6.omega (sumFin12 (fun m => ψ (moveSolePairConfig g₁ m c))) := by
        rw [← nloc_sumFin12_mul_left]
        refine sumFin12_congr _ _ fun m => siteMeet_on_soleIdentPair g₁ ψ _ ?_
        unfold moveSolePairConfig; rw [lookup_setDock, if_pos rfl]; exact (moveSolePairDock_spec (c.lookup g₁) hPair).1 m
      rw [hSum]
      change NinthLoc6.omega * _ + NinthLoc6.pairHop * (NinthLoc6.omega * _) = NinthLoc6.omega * (_ + NinthLoc6.pairHop * _); ring
    | false =>
      rw [siteMPairUnit_op, hPair, ite_bool_false]
      have hLine : ∀ (ls : List (Fin 12)) (c' : HoneycombConfig),
          isSoleIdentPairDock (c'.lookup g₁) = false →
          (composeLines (lineMeetUnit g₁) ls).op ψ c' =
            (composeLines (lineMeetUnit g₁) ls).op ((siteMPairUnit g₁).op ψ) c' := by
        intro ls; induction ls with
        | nil => intro c' hc'; change ψ c' = (siteMPairUnit g₁).op ψ c'; rw [siteMPairUnit_op, hc', ite_bool_false]
        | cons l rest ih =>
          intro c' hc'; simp only [composeLines, FockUnitary.comp]
          rw [lineMeetUnit_op, lineMeetUnit_op]; apply congrArg (NinthLoc6.mul _)
          cases isSameSignDiffRoleLine (c'.lookup g₁) l with
          | false => rw [ite_bool_false, ite_bool_false]; exact ih c' hc'
          | true =>
            rw [ite_bool_true, ite_bool_true, ih c' hc',
                ih (swapLineRolesConfig g₁ l c') (lineMeet_preserves_not_solePair g₁ l c' hc')]
      exact hLine (List.finRange 12) c hPair
  else
    have hLine : ∀ (l : Fin 12) (φ : FockVec NinthLoc6 HoneycombConfig),
        (siteMPairUnit g₁).op ((lineMeetUnit g₂ l).op φ) = (lineMeetUnit g₂ l).op ((siteMPairUnit g₁).op φ) := by
      intro l φ; funext c; simp only [siteMPairUnit_op, lineMeetUnit_op]
      have hLkM : (swapLineRolesConfig g₂ l c).lookup g₁ = c.lookup g₁ := by
        unfold swapLineRolesConfig; rw [lookup_setDock, if_neg hg]
      have hLkP : ∀ m, (moveSolePairConfig g₁ m c).lookup g₂ = c.lookup g₂ :=
        fun m => by unfold moveSolePairConfig; rw [lookup_setDock, if_neg (Ne.symm hg)]
      have hSw : ∀ m, swapLineRolesConfig g₂ l (moveSolePairConfig g₁ m c) =
          moveSolePairConfig g₁ m (swapLineRolesConfig g₂ l c) := by
        intro m; unfold swapLineRolesConfig moveSolePairConfig
        rw [lookup_setDock, if_neg (Ne.symm hg), lookup_setDock, if_neg hg]
        exact setDock_setDock_comm c g₁ g₂ _ _ hg
      rw [hLkM]
      cases isSoleIdentPairDock (c.lookup g₁) with
      | false => simp only [ite_bool_false]
      | true =>
        simp only [ite_true]
        generalize hpM : (if isSameSignEqRoleLine (c.lookup g₂) l = true then NinthLoc6.omega else NinthLoc6.one) = pM
        cases hDiff : isSameSignDiffRoleLine (c.lookup g₂) l with
        | false =>
          simp only [ite_bool_false]
          have hSum : sumFin12 (fun m =>
              NinthLoc6.mul (if isSameSignEqRoleLine ((moveSolePairConfig g₁ m c).lookup g₂) l = true then NinthLoc6.omega else NinthLoc6.one)
                (if isSameSignDiffRoleLine ((moveSolePairConfig g₁ m c).lookup g₂) l = true then
                  NinthLoc6.add (NinthLoc6.mul NinthLoc6.meetKeep (φ (moveSolePairConfig g₁ m c)))
                                (NinthLoc6.mul NinthLoc6.meetSwap (φ (swapLineRolesConfig g₂ l (moveSolePairConfig g₁ m c))))
                else φ (moveSolePairConfig g₁ m c))) =
              NinthLoc6.mul pM (sumFin12 (fun m => φ (moveSolePairConfig g₁ m c))) := by
            rw [← nloc_sumFin12_mul_left]
            exact sumFin12_congr _ _ fun m => by rw [hLkP m, hpM, hDiff, ite_bool_false]
          rw [hSum]
          change pM * _ + NinthLoc6.pairHop * (pM * _) = pM * (_ + NinthLoc6.pairHop * _); ring
        | true =>
          simp only [ite_true]
          have hSum1 : sumFin12 (fun m =>
              NinthLoc6.mul (if isSameSignEqRoleLine ((moveSolePairConfig g₁ m c).lookup g₂) l = true then NinthLoc6.omega else NinthLoc6.one)
                (if isSameSignDiffRoleLine ((moveSolePairConfig g₁ m c).lookup g₂) l = true then
                  NinthLoc6.add (NinthLoc6.mul NinthLoc6.meetKeep (φ (moveSolePairConfig g₁ m c)))
                                (NinthLoc6.mul NinthLoc6.meetSwap (φ (swapLineRolesConfig g₂ l (moveSolePairConfig g₁ m c))))
                else φ (moveSolePairConfig g₁ m c))) =
            NinthLoc6.mul pM (NinthLoc6.add
              (NinthLoc6.mul NinthLoc6.meetKeep (sumFin12 (fun m => φ (moveSolePairConfig g₁ m c))))
              (NinthLoc6.mul NinthLoc6.meetSwap (sumFin12 (fun m => φ (moveSolePairConfig g₁ m (swapLineRolesConfig g₂ l c)))))) := by
            rw [sumFin12_congr _ (fun m => NinthLoc6.mul pM (NinthLoc6.add
                  (NinthLoc6.mul NinthLoc6.meetKeep (φ (moveSolePairConfig g₁ m c)))
                  (NinthLoc6.mul NinthLoc6.meetSwap (φ (moveSolePairConfig g₁ m (swapLineRolesConfig g₂ l c))))))
                  (fun m => by rw [hLkP m, hpM, hDiff, ite_bool_true, hSw m]),
                nloc_sumFin12_mul_left, nloc_sumFin12_add, nloc_sumFin12_mul_left, nloc_sumFin12_mul_left]
          rw [hSum1]
          change pM * (NinthLoc6.meetKeep * _ + NinthLoc6.meetSwap * _) +
              NinthLoc6.pairHop * (pM * (NinthLoc6.meetKeep * _ + NinthLoc6.meetSwap * _)) =
            pM * (NinthLoc6.meetKeep * (_ + NinthLoc6.pairHop * _) + NinthLoc6.meetSwap * (_ + NinthLoc6.pairHop * _))
          ring
    have hComp : ∀ (ls : List (Fin 12)) (φ : FockVec NinthLoc6 HoneycombConfig),
        (siteMPairUnit g₁).op ((composeLines (lineMeetUnit g₂) ls).op φ) =
          (composeLines (lineMeetUnit g₂) ls).op ((siteMPairUnit g₁).op φ) := by
      intro ls; induction ls with
      | nil => intro _; rfl
      | cons l rest ih => intro φ; simp only [composeLines, FockUnitary.comp]; rw [hLine l, ih]
    exact hComp (List.finRange 12) ψ

/-- Headline Theorem 8 (Exact Global Scale-2 Commutation `[K, M_pair(ζ_18)] = 0`). -/
theorem thm_fock_scale2_K_MPair_comm (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockBounceK (fockMPair ψ) = fockMPair (fockBounceK ψ) := by
  apply globalOp_comm_of_site_comm bounceKFamily mpairFamily
  intro g₁ g₂ φ
  have hComp : ∀ (ls : List (Fin 12)) (χ : FockVec NinthLoc6 HoneycombConfig),
      (composeLines (lineBounceKUnit g₁) ls).op ((siteMPairUnit g₂).op χ) =
        (siteMPairUnit g₂).op ((composeLines (lineBounceKUnit g₁) ls).op χ) := by
    intro ls; induction ls with
    | nil => intro _; rfl
    | cons l rest ih => intro χ; simp only [composeLines, FockUnitary.comp]; rw [ih, lineBounceK_comm_siteMPair g₁ g₂ l]
  exact hComp (List.finRange 12) φ

/-- Headline Theorem 9 (Exact Global Scale-2 Commutation `[K, M_meet] = 0`). -/
theorem thm_fock_scale2_K_MMeet_comm (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockBounceK (fockMeet ψ) = fockMeet (fockBounceK ψ) := by
  apply globalOp_comm_of_site_comm bounceKFamily meetFamily
  intro g₁ g₂ φ
  apply composeLines_comm (lineBounceKUnit g₁) (lineMeetUnit g₂)
  intro l₁ l₂ χ
  if hg : g₁ = g₂ then
    subst hg; exact lineBounceK_comm_lineMeet_same_site g₁ l₁ l₂ χ
  else
    funext c; simp only [lineBounceKUnit_op, lineMeetUnit_op]
    have hLkK : (lineBounceKPerm g₁ l₁ c).lookup g₂ = c.lookup g₂ := by
      unfold lineBounceKPerm; cases isOppSignLine (c.lookup g₁) l₁ with
      | false => rfl
      | true => rw [ite_bool_true]; unfold swapLineSlotsConfig; rw [lookup_setDock, if_neg (Ne.symm hg)]
    have hLkM : (swapLineRolesConfig g₂ l₂ c).lookup g₁ = c.lookup g₁ := by
      unfold swapLineRolesConfig; rw [lookup_setDock, if_neg hg]
    have hSw : swapLineRolesConfig g₂ l₂ (lineBounceKPerm g₁ l₁ c) =
        lineBounceKPerm g₁ l₁ (swapLineRolesConfig g₂ l₂ c) := by
      unfold lineBounceKPerm; rw [hLkM]
      cases isOppSignLine (c.lookup g₁) l₁ with
      | false => rfl
      | true =>
        simp only [ite_true]; unfold swapLineRolesConfig swapLineSlotsConfig
        rw [lookup_setDock, if_neg (Ne.symm hg), lookup_setDock, if_neg hg]
        exact setDock_setDock_comm c g₁ g₂ _ _ hg
    rw [hLkK, hLkM, hSw]
    generalize (if isOppSignLine (c.lookup g₁) l₁ = true then NinthLoc6.neg NinthLoc6.one else NinthLoc6.one) = pK
    generalize (if isSameSignEqRoleLine (c.lookup g₂) l₂ = true then NinthLoc6.omega else NinthLoc6.one) = pM
    cases isSameSignDiffRoleLine (c.lookup g₂) l₂
    · simp only [ite_bool_false]; change pK * (pM * _) = pM * (pK * _); ring
    · simp only [ite_true]; exact nloc_phase_block2_comm pK pM NinthLoc6.meetKeep NinthLoc6.meetSwap _ _

/-- Headline Theorem 10 (Exact Global Scale-2 Commutation `[M_pair(ζ_18), M_meet] = 0`). -/
theorem thm_fock_scale2_MPair_MMeet_comm (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockMPair (fockMeet ψ) = fockMeet (fockMPair ψ) :=
  globalOp_comm_of_site_comm mpairFamily meetFamily siteMPair_comm_siteMeet ψ

/-- Composite Scale-2 middle core `M = M_meet ∘ M_pair(ζ_18) ∘ K`. -/
def fockScale2CoreUnit : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp fockMeetUnit (FockUnitary.comp fockMPairUnit fockBounceKUnit)

abbrev fockScale2Core := fockScale2CoreUnit.op
abbrev fockScale2CoreDag := fockScale2CoreUnit.dag

-- [helper]
theorem fockBounceK_self_adj (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockBounceKUnit.dag ψ = fockBounceKUnit.op ψ := by
  have hSite : ∀ g φ, (siteBounceKUnit g).dag φ = (siteBounceKUnit g).op φ := by
    intro g
    have hAux : ∀ ls χ, (composeLines (lineBounceKUnit g) ls).dag χ = (composeLines (lineBounceKUnit g) ls).op χ := by
      intro ls; induction ls with
      | nil => intro _; rfl
      | cons l rest ih =>
        intro χ; simp only [composeLines, FockUnitary.comp]; rw [ih, lineBounceK_self_adj]
        have hMove : ∀ (rs : List (Fin 12)) (φ : FockVec NinthLoc6 HoneycombConfig),
            (composeLines (lineBounceKUnit g) rs).op ((lineBounceKUnit g l).op φ) =
              (lineBounceKUnit g l).op ((composeLines (lineBounceKUnit g) rs).op φ) := by
          intro rs; induction rs with
          | nil => intro _; rfl
          | cons r rr ihr => intro φ; simp only [composeLines, FockUnitary.comp]; rw [ihr, lineBounceK_comm_same_site g r l]
        exact hMove rest χ
    exact hAux (List.finRange 12)
  funext c
  change applySitesDag bounceKFamily c.activeDocks ψ c = applySites bounceKFamily c.activeDocks ψ c
  have hEq : ∀ gs φ, IsNodup gs → applySitesDag bounceKFamily gs φ = applySites bounceKFamily gs φ := by
    intro gs φ hnd
    induction hnd generalizing φ with
    | nil => rfl
    | @cons g rest hnot _ ih =>
      simp only [applySitesDag, applySites]; rw [ih]
      change applySites bounceKFamily rest ((siteBounceKUnit g).dag φ) = _
      rw [hSite g]
      have hPush : ∀ (rs : List Mat5) (χ : FockVec NinthLoc6 HoneycombConfig),
          (∀ r, r ∈ rs → r ≠ g) →
          applySites bounceKFamily rs ((bounceKFamily.unit g).op χ) =
            (bounceKFamily.unit g).op (applySites bounceKFamily rs χ) := by
        intro rs; induction rs with
        | nil => intro _ _; rfl
        | cons r rr ihr =>
          intro χ hne; simp only [applySites]
          rw [ihr χ (fun x hx => hne x (List.Mem.tail r hx)),
              bounceKFamily.comm_sites r g _ (hne r (List.Mem.head rr))]
      exact hPush rest φ (fun r hr heq => hnot (heq ▸ hr))
  rw [hEq c.activeDocks ψ (activeDocks_nodup c)]

/-- Headline Theorem 11 (Scale-2 Core Unitarity & Adjoint Reversal Order-Independence). -/
theorem thm_fock_scale2_core_unitary_and_comm (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockScale2CoreDag (fockScale2Core ψ) = ψ ∧
    fockScale2Core (fockScale2CoreDag ψ) = ψ ∧
    fockBounceKUnit.dag ψ = fockBounceK ψ ∧
    fockScale2CoreDag ψ = fockMeetDag (fockMPairDag (fockBounceK ψ)) := by
  have hCD1 := fockUnitary_comm_dag thm_fock_scale2_K_MPair_comm
  have hCD2 := fockUnitary_comm_dag thm_fock_scale2_K_MMeet_comm
  have hCD3 := fockUnitary_comm_dag thm_fock_scale2_MPair_MMeet_comm
  refine ⟨fockScale2CoreUnit.leftInv ψ, fockScale2CoreUnit.rightInv ψ, fockBounceK_self_adj ψ, ?_⟩
  change fockBounceKUnit.dag (fockMPairDag (fockMeetDag ψ)) = fockMeetDag (fockMPairDag (fockBounceK ψ))
  rw [hCD1, hCD2, hCD3, fockBounceK_self_adj]

end Vibe

end
