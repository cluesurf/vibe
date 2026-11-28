module

public import Vibe.Fock.Gates
import Mathlib.Tactic.Ring

/-!
# Vibe Theory: Full 8-Layer Composite Beat `U`, Conservation, Light-Cone, & `T / CP / CPT`

Submodule 4 of 4 of `Vibe.FockBeat` (re-exported unchanged by `Vibe.FockBeat`):
- Full palindromic 8-layer composite beat `fockBeat` (`U`) and symmetric variants `U_sym`, `U_sym_odd`,
- All-time unitarity (`∀ t : Nat`), quantum `|V_1⟩` stationarity, exact charge `Q` conservation,
  and true quantum 1-hop Lieb-Robinson light-cone (`∀ t : Nat`),
- Concrete Fock-space `T / CP / CPT` instantiation of `CoxeterTransport.thm_palindromic_beat_T_CP_CPT`
  and non-vacuous 4-vibe chiral witness proving genuine individual `C` and `P` breaking under `Φ_odd`.
-/

set_option autoImplicit false

@[expose] public section

namespace Vibe

/-! ## Section 6: Full Palindromic 8-Layer Composite Beat `U`, Vacuum `|V_1⟩`, Charge `Q`, & Light-Cone -/

/-- Full palindromic 8-layer composite beat `U = S ∘ Φ_odd ∘ D ∘ (M_meet ∘ M_pair(ζ_18) ∘ K) ∘ D ∘ Φ_odd`. -/
def fockBeatUnit (χ : ChiralInvariant) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp fockStreamUnit
    (FockUnitary.comp (fockPhiOddUnit χ)
      (FockUnitary.comp fockHalfCoinUnit
        (FockUnitary.comp fockScale2CoreUnit
          (FockUnitary.comp fockHalfCoinUnit (fockPhiOddUnit χ)))))

abbrev fockBeat (χ : ChiralInvariant) := (fockBeatUnit χ).op
abbrev fockBeatDag (χ : ChiralInvariant) := (fockBeatUnit χ).dag

/-- Symmetric doubled 8-layer composite beat `U_sym` and its `Φ_odd`-dressed variant `U_sym_odd`. -/
def fockSymBeatUnit : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp fockStreamUnit
    (FockUnitary.comp fockHalfCoinUnit
      (FockUnitary.comp fockMeetUnit
        (FockUnitary.comp fockMPairUnit
          (FockUnitary.comp fockBounceKUnit
            (FockUnitary.comp fockMPairUnit
              (FockUnitary.comp fockMeetUnit fockHalfCoinUnit))))))

def fockSymOddBeatUnit (χ : ChiralInvariant) : FockUnitary NinthLoc6 HoneycombConfig :=
  FockUnitary.comp fockStreamUnit
    (FockUnitary.comp (fockPhiOddUnit χ)
      (FockUnitary.comp fockHalfCoinUnit
        (FockUnitary.comp fockMeetUnit
          (FockUnitary.comp fockMPairUnit
            (FockUnitary.comp fockBounceKUnit
              (FockUnitary.comp fockMPairUnit
                (FockUnitary.comp fockMeetUnit
                  (FockUnitary.comp fockHalfCoinUnit (fockPhiOddUnit χ)))))))))

/-- Headline Theorem 12 (Full Palindromic 8-Layer Composite Beat `U` Exact Unitarity & Reversibility `∀ t : Nat`). -/
theorem thm_fock_beat_unitary_all_time (χ : ChiralInvariant) :
    ∀ t : Nat,
      (∀ ψ, iter (fockBeatDag χ) t (iter (fockBeat χ) t ψ) = ψ) ∧
      (∀ ψ, iter (fockBeat χ) t (iter (fockBeatDag χ) t ψ) = ψ) ∧
      (∀ ψ s, SuppIn s ψ → ∃ s', SuppIn s' (iter (fockBeat χ) t ψ)) ∧
      (∀ ψ φ s s',
        SuppIn s ψ → SuppIn s φ → SuppIn s' (iter (fockBeat χ) t ψ) → SuppIn s' (iter (fockBeat χ) t φ) →
        innerOn s' (iter (fockBeat χ) t ψ) (iter (fockBeat χ) t φ) = innerOn s ψ φ ∧
        normSqOn s' (iter (fockBeat χ) t ψ) = normSqOn s ψ) :=
  thm_fock_unitary_iter_all_time (fockBeatUnit χ)

/-- Headline Theorem 13 (Symmetric Doubled 8-Layer Beat `U_sym` & `Φ_odd`-Dressed Variant Unitarity `∀ t : Nat`). -/
theorem thm_fock_sym_beat_unitary_all_time (χ : ChiralInvariant) (t : Nat) :
    (∀ ψ, iter fockSymBeatUnit.dag t (iter fockSymBeatUnit.op t ψ) = ψ) ∧
    (∀ ψ φ s s',
      SuppIn s ψ → SuppIn s φ → SuppIn s' (iter fockSymBeatUnit.op t ψ) → SuppIn s' (iter fockSymBeatUnit.op t φ) →
      normSqOn s' (iter fockSymBeatUnit.op t ψ) = normSqOn s ψ) ∧
    (∀ ψ, iter (fockSymOddBeatUnit χ).dag t (iter (fockSymOddBeatUnit χ).op t ψ) = ψ) ∧
    (∀ ψ φ s s',
      SuppIn s ψ → SuppIn s φ → SuppIn s' (iter (fockSymOddBeatUnit χ).op t ψ) → SuppIn s' (iter (fockSymOddBeatUnit χ).op t φ) →
      normSqOn s' (iter (fockSymOddBeatUnit χ).op t ψ) = normSqOn s ψ) := by
  have h1 := thm_fock_unitary_iter_all_time fockSymBeatUnit t
  have h2 := thm_fock_unitary_iter_all_time (fockSymOddBeatUnit χ) t
  exact ⟨h1.1, fun ψ φ s s' a b c d => (h1.2.2.2 ψ φ s s' a b c d).2,
         h2.1, fun ψ φ s s' a b c d => (h2.2.2.2 ψ φ s s' a b c d).2⟩

private theorem globalOp_fixes_v1Ket (F : LocalSiteFamily) :
    globalOp F (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
  funext c; unfold globalOp
  if hc : c = v1Config then rw [hc]; rfl
  else
    have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks →
        ket (R := NinthLoc6) v1Config c' = zeroVec c' := by
      intro c' hc'
      have hne' : c' ≠ v1Config := fun h0 => hc <| by
        subst h0; apply honeycombConfig_ext; intro g
        by_contra h
        have hm : g ∈ c.activeDocks := (mem_activeDocks_iff c g).mpr h
        rw [← hc'] at hm; cases hm
      unfold ket zeroVec; rw [ite_eq_right hne']
    rw [applySites_local_eq F c.activeDocks _ zeroVec c hVan, applySites_zero]
    unfold ket zeroVec; rw [ite_eq_right hc]

/-- Headline Theorem 14 (True Quantum Fock-Space Vacuum `|V_1⟩` Eternal Stationarity `∀ t : Nat`). -/
theorem thm_fock_v1_quantum_stationarity (χ : ChiralInvariant) :
    fockBeat χ (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config ∧
    ∀ t : Nat,
      iter (fockBeat χ) t (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config ∧
      normSqOn [v1Config] (iter (fockBeat χ) t (ket (R := NinthLoc6) v1Config)) = NinthLoc6.one := by
  have hS : fockStream (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
    funext c; rw [fockStream_eval, ket_nloc, ket_nloc]
    if hc : c = v1Config then
      have hInvV1 : streamConfigInv v1Config = v1Config := by
        have h := (thm_fock_honeycomb_config_symmetries v1Config).1
        rw [(thm_fock_honeycomb_config_symmetries v1Config).2.2.2.2.2.2.2.2.2.1] at h; exact h
      rw [hc, hInvV1, ite_eq_left rfl]
    else
      have hne : streamConfigInv c ≠ v1Config := fun h0 => hc <| by
        have := congrArg streamConfig h0
        rw [(thm_fock_honeycomb_config_symmetries c).2.1,
            (thm_fock_honeycomb_config_symmetries v1Config).2.2.2.2.2.2.2.2.2.1] at this
        exact this
      rw [ite_eq_right hne, ite_eq_right hc]
  have hOne : fockBeat χ (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
    change fockStream (globalOp (phiOddFamily χ) (globalOp halfCoinFamily (globalOp meetFamily
      (globalOp mpairFamily (globalOp bounceKFamily (globalOp halfCoinFamily
        (globalOp (phiOddFamily χ) (ket (R := NinthLoc6) v1Config)))))))) = _
    simp only [globalOp_fixes_v1Ket, hS]
  have hIter : ∀ t : Nat, iter (fockBeat χ) t (ket (R := NinthLoc6) v1Config) = ket (R := NinthLoc6) v1Config := by
    intro t; induction t with | zero => rfl | succ k ih => simp only [iter, ih, hOne]
  refine ⟨hOne, fun t => ⟨hIter t, ?_⟩⟩
  rw [hIter t]; unfold normSqOn innerOn sumList; dsimp only; rw [ket_nloc, ite_eq_left rfl]
  change star (1 : NinthLoc6) * 1 + 0 = 1
  rw [star_one]; ring

private theorem globalOp_preserves_charge (F : LocalSiteFamily)
    (hSite : ∀ g q ψ, InChargeSector q ψ → InChargeSector q ((F.unit g).op ψ))
    (q : Int) (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : InChargeSector q ψ) :
    InChargeSector q (globalOp F ψ) := by
  have hList : ∀ gs φ, InChargeSector q φ → InChargeSector q (applySites F gs φ) := by
    intro gs; induction gs with
    | nil => intro _ h; exact h
    | cons g rest ih => intro φ h; simp only [applySites]; exact hSite g q _ (ih φ h)
  exact fun c hc => hList c.activeDocks ψ hψ c hc

/-- Headline Theorem 15 (Exact Quantum Charge `Q` Conservation `∀ q : Int, ∀ t : Nat`). -/
theorem thm_fock_charge_conservation_all_time (χ : ChiralInvariant) (q : Int)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : InChargeSector q ψ) :
    ∀ t : Nat, InChargeSector q (iter (fockBeat χ) t ψ) := by
  have hPhi : ∀ φ, InChargeSector q φ → InChargeSector q (fockPhiOdd χ φ) :=
    globalOp_preserves_charge (phiOddFamily χ) (fun g _ φ hφ c hc => by
      change (sitePhiOddUnit χ g).op φ c = NinthLoc6.zero
      rw [sitePhiOddUnit_op, hφ c hc, NinthLoc6.mul_zero]) q
  have hK : ∀ φ, InChargeSector q φ → InChargeSector q (fockBounceK φ) :=
    globalOp_preserves_charge bounceKFamily (fun g q' φ hφ => by
      have hLs : ∀ ls χ', InChargeSector q' χ' → InChargeSector q' ((composeLines (lineBounceKUnit g) ls).op χ') := by
        intro ls; induction ls with
        | nil => intro _ h; exact h
        | cons l rest ih =>
          intro χ' h c hc; simp only [composeLines, FockUnitary.comp]; rw [lineBounceKUnit_op]
          have hQ : totalCharge (lineBounceKPerm g l c) = totalCharge c := by
            unfold lineBounceKPerm; cases isOppSignLine (c.lookup g) l with
            | false => rfl
            | true => exact totalCharge_setDock c g _ (fullDockCharge_swapLineSlots l (c.lookup g))
          rw [ih χ' h (lineBounceKPerm g l c) (hQ.symm ▸ hc), NinthLoc6.mul_zero]
      exact hLs (List.finRange 12) φ hφ) q
  have hD : ∀ φ, InChargeSector q φ → InChargeSector q (fockHalfCoin φ) :=
    globalOp_preserves_charge halfCoinFamily (fun g q' φ hφ => by
      have hLs : ∀ ls χ', InChargeSector q' χ' → InChargeSector q' ((composeLines (lineHalfCoinUnit g) ls).op χ') := by
        intro ls; induction ls with
        | nil => intro _ h; exact h
        | cons l rest ih =>
          intro χ' h c hc; simp only [composeLines, FockUnitary.comp]; rw [lineHalfCoinUnit_op]
          have hQ : totalCharge (swapLineSlotsConfig g l c) = totalCharge c :=
            totalCharge_setDock c g _ (fullDockCharge_swapLineSlots l (c.lookup g))
          cases isLoneLine (c.lookup g) l with
          | false => rw [ite_bool_false, ih χ' h c hc, NinthLoc6.mul_zero]
          | true =>
            rw [ite_bool_true, ih χ' h c hc, ih χ' h _ (hQ.symm ▸ hc),
                NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]
      exact hLs (List.finRange 12) φ hφ) q
  have hM : ∀ φ, InChargeSector q φ → InChargeSector q (fockMeet φ) :=
    globalOp_preserves_charge meetFamily (fun g q' φ hφ => by
      have hLs : ∀ ls χ', InChargeSector q' χ' → InChargeSector q' ((composeLines (lineMeetUnit g) ls).op χ') := by
        intro ls; induction ls with
        | nil => intro _ h; exact h
        | cons l rest ih =>
          intro χ' h c hc; simp only [composeLines, FockUnitary.comp]; rw [lineMeetUnit_op]
          have hQ : totalCharge (swapLineRolesConfig g l c) = totalCharge c :=
            totalCharge_setDock c g _ (fullDockCharge_swapLineRoles l (c.lookup g))
          cases isSameSignDiffRoleLine (c.lookup g) l with
          | false => rw [ite_bool_false, ih χ' h c hc, NinthLoc6.mul_zero]
          | true =>
            rw [ite_bool_true, ih χ' h c hc, ih χ' h _ (hQ.symm ▸ hc),
                NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]
      exact hLs (List.finRange 12) φ hφ) q
  have hP : ∀ φ, InChargeSector q φ → InChargeSector q (fockMPair φ) :=
    globalOp_preserves_charge mpairFamily (fun g _ φ hφ c hc => by
      change (siteMPairUnit g).op φ c = NinthLoc6.zero; rw [siteMPairUnit_op]
      cases ha : isSoleIdentPairDock (c.lookup g) with
      | false => rw [ite_bool_false]; exact hφ c hc
      | true =>
        rw [ite_bool_true, hφ c hc, NinthLoc6.zero_add]
        have hS0 : sumFin12 (fun m => φ (moveSolePairConfig g m c)) = NinthLoc6.zero :=
          sumList_zero_of_all_zero _ _ fun m _ =>
            hφ _ ((totalCharge_setDock c g _ ((moveSolePairDock_spec (c.lookup g) ha).2.2.2.2.2 m)).symm ▸ hc)
        rw [hS0, NinthLoc6.mul_zero]) q
  have hS : ∀ φ, InChargeSector q φ → InChargeSector q (fockStream φ) := fun φ hφ c hc => by
    rw [fockStream_eval]
    have hQ : totalCharge (streamConfigInv c) = totalCharge c := by
      have h := (thm_fock_honeycomb_config_symmetries (streamConfigInv c)).2.2.2.2.2.2.2.2.2.2.2
      rw [(thm_fock_honeycomb_config_symmetries c).2.1] at h; exact h.symm
    exact hφ (streamConfigInv c) (hQ.symm ▸ hc)
  have hStep : ∀ φ, InChargeSector q φ → InChargeSector q (fockBeat χ φ) := fun φ hφ =>
    hS _ (hPhi _ (hD _ (hM _ (hP _ (hK _ (hD _ (hPhi _ hφ)))))))
  intro t; induction t with | zero => exact hψ | succ _ ih => exact hStep _ ih

private theorem globalOp_preserves_ball (F : LocalSiteFamily) (R : Nat)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : QuantumInBall R ψ) :
    QuantumInBall R (globalOp F ψ) := fun c hc => by
  unfold globalOp
  have hVan : ∀ c' : HoneycombConfig, c'.activeDocks = c.activeDocks → ψ c' = zeroVec c' := fun c' hc' =>
    hψ c' fun hIn => hc fun g hg => hIn g (hc'.symm ▸ hg)
  rw [applySites_local_eq F c.activeDocks ψ zeroVec c hVan, applySites_zero]; rfl

/-- Headline Theorem 16 (True Quantum 1-Hop Lieb-Robinson Light-Cone Theorem `∀ t : Nat`). -/
theorem thm_fock_lieb_robinson_light_cone (χ : ChiralInvariant) (R₀ : Nat)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (h0 : QuantumInBall R₀ ψ) :
    ∀ t : Nat, QuantumInBall (R₀ + t) (iter (fockBeat χ) t ψ) := by
  have hStream : ∀ (R : Nat) (φ : FockVec NinthLoc6 HoneycombConfig),
      QuantumInBall R φ → QuantumInBall (R + 1) (fockStream φ) := by
    intro R φ hφ c hc; rw [fockStream_eval]
    refine hφ (streamConfigInv c) fun hIn => hc fun g hg => ?_
    obtain ⟨a, ha⟩ := exists_nonempty_of_ne_v1 (c.lookup g) ((mem_activeDocks_iff c g).mp hg)
    let gSrc := mat5Mul g (transport (oppSlot a))
    have hSrcOcc : (streamConfigInv c).lookup gSrc a ≠ .empty := by
      rw [lookup_streamConfigInv, fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]; exact ha
    have hSrcIn : InBall R gSrc := hIn gSrc ((mem_activeDocks_iff _ _).mpr (fun h => hSrcOcc (congrFun h a)))
    have hStep : InBall (R + 1) (mat5Mul gSrc (transport a)) := InBall.step a hSrcIn
    rwa [fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right] at hStep
  intro t; induction t with
  | zero => exact h0
  | succ k ih =>
    simp only [iter]
    change QuantumInBall (R₀ + k + 1)
      (fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin (fockPhiOdd χ (iter (fockBeat χ) k ψ)))))))))
    exact hStream (R₀ + k) _
      (globalOp_preserves_ball _ _ _
        (globalOp_preserves_ball _ _ _
          (globalOp_preserves_ball _ _ _
            (globalOp_preserves_ball _ _ _
              (globalOp_preserves_ball _ _ _
                (globalOp_preserves_ball _ _ _
                  (globalOp_preserves_ball _ _ _ ih)))))))


/-! ## Section 7: Concrete Fock Instantiation of `CoxeterTransport.thm_palindromic_beat_T_CP_CPT` & Chiral Witness -/

/-- Exact quantum Fock discrete symmetries on infinite `{3,4,3,4}`. -/
def fockRev (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => ψ (revConfig c)

def fockTau (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => NinthLoc6.conj (ψ (revConfig c))

def fockChargeConj (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => ψ (conjConfig c)

def fockParity (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => ψ (parityConfig c)

def fockCP (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fun c => ψ (cpConfig c)

def fockT (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fockStream (fockTau ψ)

def fockCPT (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fockCP (fockT ψ)

private theorem fockTau_involutive (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockTau (fockTau ψ) = ψ := by
  funext c; unfold fockTau; rw [(thm_fock_honeycomb_config_symmetries c).2.2.1, NinthLoc6.conj_conj]

private theorem fockCP_involutive (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockCP (fockCP ψ) = ψ := by
  funext c; unfold fockCP; rw [(thm_fock_honeycomb_config_symmetries c).2.2.2.2.2.2.1]

private theorem revFullDock_swapLineSlots (l : Fin 12) (d : FullDock) :
    revFullDock (swapLineSlotsDock l d) = swapLineSlotsDock l (revFullDock d) := by
  have ⟨hAB, hBA, hne⟩ := line_geom_facts.1 l
  funext s; unfold revFullDock swapLineSlotsDock
  if hsA : s = lineA l then simp only [hsA, hAB, hBA, ite_eq_right hne.symm, ite_true]
  else if hsB : s = lineB l then simp only [hsB, hBA, hAB, ite_eq_right hne.symm, ite_true]
  else
    have hO1 : oppSlot s ≠ lineA l := fun e => hsB (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hAB])
    have hO2 : oppSlot s ≠ lineB l := fun e => hsA (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hBA])
    simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hO1, ite_eq_right hO2]

private theorem revFullDock_swapLineRoles (l : Fin 12) (d : FullDock) :
    revFullDock (swapLineRolesDock l d) = swapLineRolesDock l (revFullDock d) := by
  have ⟨hAB, hBA, hne⟩ := line_geom_facts.1 l
  funext s; unfold revFullDock swapLineRolesDock; dsimp only; rw [hAB, hBA]
  cases d (lineA l) with
  | empty => cases d (lineB l) <;> rfl
  | occ sA rA =>
    cases d (lineB l) with
    | empty => rfl
    | occ sB rB =>
      if hsA : s = lineA l then simp only [hsA, hAB, ite_eq_right hne.symm, ite_true]
      else if hsB : s = lineB l then simp only [hsB, hBA, ite_eq_right hne.symm, ite_true]
      else
        have hO1 : oppSlot s ≠ lineA l := fun e => hsB (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hAB])
        have hO2 : oppSlot s ≠ lineB l := fun e => hsA (by rw [← (thm_24_facets_geometry.2.1 s).1, e, hBA])
        simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hO1, ite_eq_right hO2]

private theorem revConfig_setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock) :
    revConfig (c.setDock g d) = (revConfig c).setDock g (revFullDock d) := by
  apply honeycombConfig_ext; intro h; rw [lookup_revConfig, lookup_setDock, lookup_setDock]
  split_ifs <;> simp [lookup_revConfig]

private theorem cpConfig_setDock (c : HoneycombConfig) (g : Mat5) (d : FullDock) :
    cpConfig (c.setDock g d) = (cpConfig c).setDock (conjMatP g) (cpFullDock d) := by
  apply honeycombConfig_ext; intro h; rw [lookup_cpConfig, lookup_setDock, lookup_setDock]
  if hhg : h = conjMatP g then simp only [hhg, conjMatP_involutive, ite_true]
  else
    have hne : conjMatP h ≠ g := fun e => hhg (by rw [← e, conjMatP_involutive])
    simp only [ite_eq_right hhg, ite_eq_right hne, lookup_cpConfig]

private theorem globalOp_tau_of_site_tau (F : LocalSiteFamily)
    (hSite : ∀ g ψ, fockTau ((F.unit g).op (fockTau ψ)) = (F.unit g).dag ψ) :
    ∀ ψ, fockTau (globalOp F (fockTau ψ)) = globalDag F ψ := by
  have hPushNd : ∀ (gs : List Mat5), IsNodup gs → ∀ (ψ : FockVec NinthLoc6 HoneycombConfig),
      fockTau (applySites F gs (fockTau ψ)) = applySitesDag F gs ψ := by
    intro gs hnd; induction hnd with
    | nil => exact fockTau_involutive
    | @cons g rest hnot _ ih =>
      intro ψ; simp only [applySites, applySitesDag]
      have h1 : fockTau ((F.unit g).op (applySites F rest (fockTau ψ))) =
          (F.unit g).dag (fockTau (applySites F rest (fockTau ψ))) := by
        have := hSite g (fockTau (applySites F rest (fockTau ψ))); rw [fockTau_involutive] at this; exact this
      rw [h1, ih ψ]
      have hCommRest : ∀ (rs : List Mat5) (φ : FockVec NinthLoc6 HoneycombConfig),
          (∀ r, r ∈ rs → r ≠ g) →
          (F.unit g).dag (applySitesDag F rs φ) = applySitesDag F rs ((F.unit g).dag φ) := by
        intro rs; induction rs with
        | nil => intro _ _; rfl
        | cons r rr ihr =>
          intro φ hne; simp only [applySitesDag]
          rw [ihr _ (fun x hx => hne x (List.Mem.tail r hx)), F.comm_dag_sites g r φ (Ne.symm (hne r (List.Mem.head rr)))]
      exact hCommRest rest ψ (fun r hr heq => hnot (heq ▸ hr))
  intro ψ; funext c
  change NinthLoc6.conj (applySites F (revConfig c).activeDocks (fockTau ψ) (revConfig c)) =
    applySitesDag F c.activeDocks ψ c
  rw [activeDocks_revConfig]; exact congrFun (hPushNd c.activeDocks (activeDocks_nodup c) ψ) c

private theorem globalOp_cp_of_site_cp (F : LocalSiteFamily)
    (hSite : ∀ g ψ, fockCP ((F.unit g).op ψ) = (F.unit (conjMatP g)).op (fockCP ψ)) :
    ∀ ψ, fockCP (globalOp F ψ) = globalOp F (fockCP ψ) := by
  have hMap : ∀ (gs : List Mat5) (ψ : FockVec NinthLoc6 HoneycombConfig),
      fockCP (applySites F gs ψ) = applySites F (gs.map conjMatP) (fockCP ψ) := by
    intro gs; induction gs with
    | nil => intro _; rfl
    | cons g rest ih => intro ψ; simp only [List.map, applySites]; rw [hSite g, ih]
  intro ψ; funext c
  change fockCP (applySites F (cpConfig c).activeDocks ψ) c = applySites F c.activeDocks (fockCP ψ) c
  rw [congrFun (hMap (cpConfig c).activeDocks ψ) c]
  have hMapNd : IsNodup ((cpConfig c).activeDocks.map conjMatP) :=
    isNodup_map_inj conjMatP (fun x y h => by have := congrArg conjMatP h; rw [conjMatP_involutive, conjMatP_involutive] at this; exact this)
      (activeDocks_nodup (cpConfig c))
  have hSameMem : ∀ g : Mat5, g ∈ c.activeDocks ↔ g ∈ (cpConfig c).activeDocks.map conjMatP := by
    intro g; rw [mem_activeDocks_iff, mem_map_iff]
    constructor
    · intro hne
      refine ⟨conjMatP g, (mem_activeDocks_iff (cpConfig c) (conjMatP g)).mpr ?_, conjMatP_involutive g⟩
      rw [lookup_cpConfig, conjMatP_involutive]
      intro h0; apply hne; funext a
      have h1 := congrFun h0 (paritySlot a)
      unfold cpFullDock conjFullDock parityFullDock at h1
      rw [(line_geom_facts.2.2.2.2.1 a).1] at h1
      cases hda : c.lookup g a with
      | empty => rfl
      | occ s _ => rw [hda] at h1; cases s <;> exact SlotState.noConfusion h1
    · intro ⟨x, hx, hxg⟩
      have hne := (mem_activeDocks_iff (cpConfig c) x).mp hx
      rw [lookup_cpConfig, hxg] at hne
      intro h0; apply hne; rw [h0]; rfl
  exact applySites_superset F c.activeDocks ((cpConfig c).activeDocks.map conjMatP)
    (activeDocks_nodup c) hMapNd (fun g hg => (hSameMem g).mp hg) c
    (fun g hg hnot => absurd ((hSameMem g).mpr hg) hnot) (fockCP ψ)

private theorem composeLines_tau {f : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig}
    (hComm : ∀ l₁ l₂ ψ, (f l₁).op ((f l₂).op ψ) = (f l₂).op ((f l₁).op ψ))
    (hLine : ∀ l ψ, fockTau ((f l).op (fockTau ψ)) = (f l).dag ψ)
    (ls : List (Fin 12)) (hnd : IsNodup ls) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockTau ((composeLines f ls).op (fockTau ψ)) = (composeLines f ls).dag ψ := by
  have hCommDag : ∀ l₁ l₂ φ, (f l₁).dag ((f l₂).dag φ) = (f l₂).dag ((f l₁).dag φ) :=
    fun l₁ l₂ => fockUnitary_comm_dag (hComm l₁ l₂)
  induction hnd generalizing ψ with
  | nil => exact fockTau_involutive ψ
  | @cons l rest _ _ ih =>
    simp only [composeLines, FockUnitary.comp]
    have h1 : fockTau ((f l).op ((composeLines f rest).op (fockTau ψ))) =
        (f l).dag (fockTau ((composeLines f rest).op (fockTau ψ))) := by
      have := hLine l (fockTau ((composeLines f rest).op (fockTau ψ))); rw [fockTau_involutive] at this; exact this
    rw [h1, ih ψ]
    have hPush : ∀ (rs : List (Fin 12)) (φ : FockVec NinthLoc6 HoneycombConfig),
        (f l).dag ((composeLines f rs).dag φ) = (composeLines f rs).dag ((f l).dag φ) := by
      intro rs; induction rs with
      | nil => intro _; rfl
      | cons r rr ihr => intro φ; simp only [composeLines, FockUnitary.comp]; rw [ihr, hCommDag l r]
    exact hPush rest ψ

private theorem composeLines_cp {f₁ f₂ : Fin 12 → FockUnitary NinthLoc6 HoneycombConfig}
    (hComm₂ : ∀ l₁ l₂ ψ, (f₂ l₁).op ((f₂ l₂).op ψ) = (f₂ l₂).op ((f₂ l₁).op ψ))
    (hLine : ∀ l ψ, fockCP ((f₁ l).op ψ) = (f₂ (parityLine l)).op (fockCP ψ))
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockCP ((composeLines f₁ (List.finRange 12)).op ψ) =
      (composeLines f₂ (List.finRange 12)).op (fockCP ψ) := by
  have hMap : ∀ ls φ, fockCP ((composeLines f₁ ls).op φ) =
      (composeLines f₂ (ls.map parityLine)).op (fockCP φ) := by
    intro ls; induction ls with
    | nil => intro _; rfl
    | cons l rest ih => intro φ; simp only [List.map, composeLines, FockUnitary.comp]; rw [hLine l, ih]
  rw [hMap]
  have hErase : ∀ (a : Fin 12) (ls : List (Fin 12)) (φ : FockVec NinthLoc6 HoneycombConfig),
      a ∈ ls → (composeLines f₂ ls).op φ = (f₂ a).op ((composeLines f₂ (eraseOne a ls)).op φ) := by
    intro a ls; induction ls with
    | nil => intro _ h; cases h
    | cons x rest ih =>
      intro φ hm; simp only [eraseOne, composeLines, FockUnitary.comp]
      split_ifs with hxa
      · subst hxa; rfl
      · simp only [composeLines, FockUnitary.comp]
        cases hm with | head => exact absurd rfl hxa | tail _ h' => rw [ih φ h', hComm₂ x a]
  have hPermEq : ∀ (ls₁ ls₂ : List (Fin 12)), IsNodup ls₁ → IsNodup ls₂ →
      (∀ x, x ∈ ls₁ ↔ x ∈ ls₂) → ∀ φ, (composeLines f₂ ls₁).op φ = (composeLines f₂ ls₂).op φ := by
    intro ls₁; induction ls₁ with
    | nil =>
      intro ls₂ _ _ hm φ
      cases ls₂ with | nil => rfl | cons x _ => cases (hm x).mpr (List.Mem.head _)
    | cons a rest ih =>
      intro ls₂ hnd1 hnd2 hm φ
      cases hnd1 with
      | cons hnot hndRest =>
        rw [hErase a ls₂ φ ((hm a).mp (List.Mem.head rest))]
        simp only [composeLines, FockUnitary.comp]
        apply congrArg (f₂ a).op
        refine ih (eraseOne a ls₂) hndRest (isNodup_eraseOne a hnd2) (fun x => ?_) φ
        rw [mem_eraseOne_iff a x hnd2]
        exact ⟨fun hx => ⟨(hm x).mp (List.Mem.tail a hx), fun hxa => hnot (hxa ▸ hx)⟩,
               fun ⟨hx2, hne⟩ => match (hm x).mpr hx2 with | List.Mem.head _ => absurd rfl hne | List.Mem.tail _ h' => h'⟩
  have hPInv : ∀ l, parityLine (parityLine l) = l := fun l => (line_geom_facts.2.2.2.2.2 l).1
  apply hPermEq ((List.finRange 12).map parityLine) (List.finRange 12)
    (isNodup_map_inj parityLine (fun x y h => by have := congrArg parityLine h; rw [hPInv, hPInv] at this; exact this) finRange12_nodup)
    finRange12_nodup
  exact fun l => ⟨fun _ => mem_finRange12 l, fun _ => (mem_map_iff parityLine _ l).mpr ⟨parityLine l, mem_finRange12 _, hPInv l⟩⟩

private theorem lineHalfCoin_comm_same_site (g : Mat5) (l₁ l₂ : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineHalfCoinUnit g l₁).op ((lineHalfCoinUnit g l₂).op ψ) =
      (lineHalfCoinUnit g l₂).op ((lineHalfCoinUnit g l₁).op ψ) := by
  if hl : l₁ = l₂ then rw [hl]
  else
    have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ hl
    funext c; simp only [lineHalfCoinUnit_op]
    have hLk1 : (swapLineSlotsConfig g l₁ c).lookup g (lineA l₂) = c.lookup g (lineA l₂) ∧
                (swapLineSlotsConfig g l₁ c).lookup g (lineB l₂) = c.lookup g (lineB l₂) := by
      unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineSlotsDock
      exact ⟨by simp only [ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm],
             by simp only [ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]⟩
    have hLk2 : (swapLineSlotsConfig g l₂ c).lookup g (lineA l₁) = c.lookup g (lineA l₁) ∧
                (swapLineSlotsConfig g l₂ c).lookup g (lineB l₁) = c.lookup g (lineB l₁) := by
      unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineSlotsDock
      exact ⟨by simp only [ite_eq_right hDisj.1, ite_eq_right hDisj.2.1],
             by simp only [ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]⟩
    have hF1 : isFullLine ((swapLineSlotsConfig g l₂ c).lookup g) l₁ = isFullLine (c.lookup g) l₁ := by
      unfold isFullLine; rw [hLk2.1, hLk2.2]
    have hF2 : isFullLine ((swapLineSlotsConfig g l₁ c).lookup g) l₂ = isFullLine (c.lookup g) l₂ := by
      unfold isFullLine; rw [hLk1.1, hLk1.2]
    have hL1 : isLoneLine ((swapLineSlotsConfig g l₂ c).lookup g) l₁ = isLoneLine (c.lookup g) l₁ := by
      unfold isLoneLine; rw [hLk2.1, hLk2.2]
    have hL2 : isLoneLine ((swapLineSlotsConfig g l₁ c).lookup g) l₂ = isLoneLine (c.lookup g) l₂ := by
      unfold isLoneLine; rw [hLk1.1, hLk1.2]
    have hSw : swapLineSlotsConfig g l₂ (swapLineSlotsConfig g l₁ c) =
        swapLineSlotsConfig g l₁ (swapLineSlotsConfig g l₂ c) := by
      unfold swapLineSlotsConfig
      simp only [lookup_setDock, ite_true, setDock_setDock_same]
      apply congrArg (c.setDock g); funext s; unfold swapLineSlotsDock
      by_cases h1A : s = lineA l₁
      · subst h1A; simp only [ite_true, ite_eq_right hDisj.1, ite_eq_right hDisj.2.1, ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]
      · by_cases h1B : s = lineB l₁
        · subst h1B; simp only [ite_true, ite_eq_right h1A, ite_eq_right hDisj.1, ite_eq_right hDisj.2.1, ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]
        · by_cases h2A : s = lineA l₂
          · subst h2A; simp only [ite_true, ite_eq_right h1A, ite_eq_right h1B, ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]
          · by_cases h2B : s = lineB l₂
            · subst h2B; simp only [ite_true, ite_eq_right h1A, ite_eq_right h1B, ite_eq_right h2A, ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm]
            · simp only [ite_eq_right h1A, ite_eq_right h1B, ite_eq_right h2A, ite_eq_right h2B]
    rw [hF1, hF2, hL1, hL2, hSw]
    generalize (if isFullLine (c.lookup g) l₁ = true then NinthLoc6.zeta6 else NinthLoc6.one) = p1
    generalize (if isFullLine (c.lookup g) l₂ = true then NinthLoc6.zeta6 else NinthLoc6.one) = p2
    cases isLoneLine (c.lookup g) l₁ <;> cases isLoneLine (c.lookup g) l₂
    · simp only [ite_bool_false]; change p1 * (p2 * _) = p2 * (p1 * _); ring
    · simp only [ite_bool_false, ite_true]; exact nloc_phase_block2_comm p1 p2 NinthLoc6.coinDiag NinthLoc6.coinOff _ _
    · simp only [ite_bool_false, ite_true]; exact (nloc_phase_block2_comm p2 p1 NinthLoc6.coinDiag NinthLoc6.coinOff _ _).symm
    · simp only [ite_true]; exact nloc_block2_comm p1 p2 NinthLoc6.coinDiag NinthLoc6.coinOff _ _ _ _

private theorem lineMeet_comm_same_site (g : Mat5) (l₁ l₂ : Fin 12)
    (ψ : FockVec NinthLoc6 HoneycombConfig) :
    (lineMeetUnit g l₁).op ((lineMeetUnit g l₂).op ψ) =
      (lineMeetUnit g l₂).op ((lineMeetUnit g l₁).op ψ) := by
  if hl : l₁ = l₂ then rw [hl]
  else
    have hDisj := line_geom_facts.2.2.2.1 l₁ l₂ hl
    funext c; simp only [lineMeetUnit_op]
    have hLk1 : (swapLineRolesConfig g l₁ c).lookup g (lineA l₂) = c.lookup g (lineA l₂) ∧
                (swapLineRolesConfig g l₁ c).lookup g (lineB l₂) = c.lookup g (lineB l₂) := by
      unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineRolesDock
      cases c.lookup g (lineA l₁) <;> cases c.lookup g (lineB l₁)
      all_goals try exact ⟨rfl, rfl⟩
      exact ⟨by simp only [ite_eq_right hDisj.1.symm, ite_eq_right hDisj.2.2.1.symm],
             by simp only [ite_eq_right hDisj.2.1.symm, ite_eq_right hDisj.2.2.2.symm]⟩
    have hLk2 : (swapLineRolesConfig g l₂ c).lookup g (lineA l₁) = c.lookup g (lineA l₁) ∧
                (swapLineRolesConfig g l₂ c).lookup g (lineB l₁) = c.lookup g (lineB l₁) := by
      unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold swapLineRolesDock
      cases c.lookup g (lineA l₂) <;> cases c.lookup g (lineB l₂)
      all_goals try exact ⟨rfl, rfl⟩
      exact ⟨by simp only [ite_eq_right hDisj.1, ite_eq_right hDisj.2.1],
             by simp only [ite_eq_right hDisj.2.2.1, ite_eq_right hDisj.2.2.2]⟩
    have hE1 : isSameSignEqRoleLine ((swapLineRolesConfig g l₂ c).lookup g) l₁ = isSameSignEqRoleLine (c.lookup g) l₁ := by
      unfold isSameSignEqRoleLine; rw [hLk2.1, hLk2.2]
    have hE2 : isSameSignEqRoleLine ((swapLineRolesConfig g l₁ c).lookup g) l₂ = isSameSignEqRoleLine (c.lookup g) l₂ := by
      unfold isSameSignEqRoleLine; rw [hLk1.1, hLk1.2]
    have hD1 : isSameSignDiffRoleLine ((swapLineRolesConfig g l₂ c).lookup g) l₁ = isSameSignDiffRoleLine (c.lookup g) l₁ := by
      unfold isSameSignDiffRoleLine; rw [hLk2.1, hLk2.2]
    have hD2 : isSameSignDiffRoleLine ((swapLineRolesConfig g l₁ c).lookup g) l₂ = isSameSignDiffRoleLine (c.lookup g) l₂ := by
      unfold isSameSignDiffRoleLine; rw [hLk1.1, hLk1.2]
    have hSw : swapLineRolesConfig g l₂ (swapLineRolesConfig g l₁ c) =
        swapLineRolesConfig g l₁ (swapLineRolesConfig g l₂ c) := by
      unfold swapLineRolesConfig
      simp only [lookup_setDock, ite_true, setDock_setDock_same]
      apply congrArg (c.setDock g); funext s
      have hA1 : swapLineRolesDock l₂ (c.lookup g) (lineA l₁) = c.lookup g (lineA l₁) := by
        simpa [swapLineRolesConfig, lookup_setDock] using hLk2.1
      have hB1 : swapLineRolesDock l₂ (c.lookup g) (lineB l₁) = c.lookup g (lineB l₁) := by
        simpa [swapLineRolesConfig, lookup_setDock] using hLk2.2
      have hA2 : swapLineRolesDock l₁ (c.lookup g) (lineA l₂) = c.lookup g (lineA l₂) := by
        simpa [swapLineRolesConfig, lookup_setDock] using hLk1.1
      have hB2 : swapLineRolesDock l₁ (c.lookup g) (lineB l₂) = c.lookup g (lineB l₂) := by
        simpa [swapLineRolesConfig, lookup_setDock] using hLk1.2
      have hOuter : ∀ l d, swapLineRolesDock l d s =
          match d (lineA l), d (lineB l) with
          | SlotState.occ sA rA, SlotState.occ sB rB =>
            if s = lineA l then SlotState.occ sA rB
            else if s = lineB l then SlotState.occ sB rA else d s
          | _, _ => d s := fun l d => by unfold swapLineRolesDock; cases d (lineA l) <;> cases d (lineB l) <;> rfl
      rw [hOuter l₂ (swapLineRolesDock l₁ (c.lookup g)), hOuter l₁ (swapLineRolesDock l₂ (c.lookup g)),
          hA1, hB1, hA2, hB2, hOuter l₁ (c.lookup g), hOuter l₂ (c.lookup g)]
      cases c.lookup g (lineA l₁) <;> cases c.lookup g (lineB l₁) <;> cases c.lookup g (lineA l₂) <;> cases c.lookup g (lineB l₂)
      all_goals try rfl
      split_ifs <;> simp_all [hDisj.1, hDisj.2.1, hDisj.2.2.1, hDisj.2.2.2]
    rw [hE1, hE2, hD1, hD2, hSw]
    generalize (if isSameSignEqRoleLine (c.lookup g) l₁ = true then NinthLoc6.omega else NinthLoc6.one) = p1
    generalize (if isSameSignEqRoleLine (c.lookup g) l₂ = true then NinthLoc6.omega else NinthLoc6.one) = p2
    cases isSameSignDiffRoleLine (c.lookup g) l₁ <;> cases isSameSignDiffRoleLine (c.lookup g) l₂
    · simp only [ite_bool_false]; change p1 * (p2 * _) = p2 * (p1 * _); ring
    · simp only [ite_bool_false, ite_true]; exact nloc_phase_block2_comm p1 p2 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _
    · simp only [ite_bool_false, ite_true]; exact (nloc_phase_block2_comm p2 p1 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _).symm
    · simp only [ite_true]; exact nloc_block2_comm p1 p2 NinthLoc6.meetKeep NinthLoc6.meetSwap _ _ _ _

private theorem rev_preserves_solePair (d : FullDock) :
    findSolePairLine (revFullDock d) = findSolePairLine d ∧
    isSoleIdentPairDock (revFullDock d) = isSoleIdentPairDock d ∧
    (∀ m : Fin 12, isSoleIdentPairDock d = true →
      revFullDock (moveSolePairDock m d) = moveSolePairDock m (revFullDock d)) := by
  have hAt : ∀ l : Fin 12, isSoleIdentPairAt (revFullDock d) l = isSoleIdentPairAt d l := by
    intro l; have ⟨hAB, hBA, _⟩ := line_geom_facts.1 l
    unfold isSoleIdentPairAt revFullDock
    have h1 : isSameSignEqRoleLine (fun s => d (oppSlot s)) l = isSameSignEqRoleLine d l := by
      unfold isSameSignEqRoleLine; dsimp only; rw [hAB, hBA]
      cases d (lineA l) with
      | empty => cases d (lineB l) <;> rfl
      | occ sA rA => cases d (lineB l) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have h2 : (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d (oppSlot s) = .empty)) =
        (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty)) := by
      apply Bool.eq_iff_iff.mpr; simp only [List.all_eq_true, decide_eq_true_eq]
      constructor
      · intro h s _
        have hs := h (oppSlot s) (mem_finRange24 _)
        rw [(thm_24_facets_geometry.2.1 s).1] at hs
        rcases hs with hA | hB | hE
        · exact Or.inr (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hA, hAB]))
        · exact Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hB, hBA])
        · exact Or.inr (Or.inr hE)
      · intro h s _
        rcases h (oppSlot s) (mem_finRange24 _) with hA | hB | hE
        · exact Or.inr (Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hA, hAB]))
        · exact Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, hB, hBA])
        · exact Or.inr (Or.inr hE)
    rw [h1, h2]
  have hFind : findSolePairLine (revFullDock d) = findSolePairLine d := by
    unfold findSolePairLine; rw [funext hAt]
  refine ⟨hFind, by unfold isSoleIdentPairDock; rw [hFind], fun m hAct => ?_⟩
  unfold isSoleIdentPairDock at hAct
  cases hf : findSolePairLine d with
  | none => rw [hf] at hAct; exact Bool.noConfusion hAct
  | some l =>
    have hl := (find?_eq_some_iff _ _ _ hf).2
    have hSame := ((Bool.and_eq_true _ _).mp hl).1
    have hEqAB : d (lineB l) = d (lineA l) := by
      unfold isSameSignEqRoleLine at hSame
      cases hA : d (lineA l) <;> cases hB : d (lineB l) <;> rw [hA, hB] at hSame
      all_goals try exact Bool.noConfusion hSame
      have ⟨hs, hr⟩ := of_decide_eq_true hSame; rw [hs, hr]
    funext s
    change (moveSolePairDock m d) (oppSlot s) = (moveSolePairDock m (revFullDock d)) s
    unfold moveSolePairDock; rw [hFind, hf]; dsimp only; unfold revFullDock
    rw [(line_geom_facts.1 l).1, hEqAB]
    have ⟨hmAB, hmBA, _⟩ := line_geom_facts.1 m
    have hIff : (oppSlot s = lineA m ∨ oppSlot s = lineB m) ↔ (s = lineA m ∨ s = lineB m) :=
      ⟨fun h => by rcases h with h1 | h2
                   · exact Or.inr (by rw [← (thm_24_facets_geometry.2.1 s).1, h1, hmAB])
                   · exact Or.inl (by rw [← (thm_24_facets_geometry.2.1 s).1, h2, hmBA]),
       fun h => by rcases h with h1 | h2
                   · exact Or.inr (by rw [h1, hmAB])
                   · exact Or.inl (by rw [h2, hmBA])⟩
    simp only [hIff]

private theorem cp_preserves_solePair (d : FullDock) :
    (∀ l : Fin 12, isSoleIdentPairAt (cpFullDock d) (parityLine l) = isSoleIdentPairAt d l) ∧
    isSoleIdentPairDock (cpFullDock d) = isSoleIdentPairDock d ∧
    (∀ m : Fin 12, isSoleIdentPairDock d = true →
      cpFullDock (moveSolePairDock m d) = moveSolePairDock (parityLine m) (cpFullDock d)) := by
  have hAt : ∀ l : Fin 12, isSoleIdentPairAt (cpFullDock d) (parityLine l) = isSoleIdentPairAt d l := by
    intro l
    have hPInv := (line_geom_facts.2.2.2.2.2 l).1
    have hPA : paritySlot (lineA (parityLine l)) = lineA l := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine l)).2.1, hPInv]
    have hPB : paritySlot (lineB (parityLine l)) = lineB l := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine l)).2.2, hPInv]
    unfold isSoleIdentPairAt cpFullDock conjFullDock parityFullDock
    have h1 : isSameSignEqRoleLine (fun s => (d (paritySlot s)).dual) (parityLine l) = isSameSignEqRoleLine d l := by
      unfold isSameSignEqRoleLine; dsimp only; rw [hPA, hPB]
      cases d (lineA l) with
      | empty => cases d (lineB l) <;> rfl
      | occ sA rA => cases d (lineB l) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
    have h2 : (List.finRange 24).all (fun s => decide (s = lineA (parityLine l) ∨ s = lineB (parityLine l) ∨ (d (paritySlot s)).dual = .empty)) =
        (List.finRange 24).all (fun s => decide (s = lineA l ∨ s = lineB l ∨ d s = .empty)) := by
      apply Bool.eq_iff_iff.mpr; simp only [List.all_eq_true, decide_eq_true_eq]
      constructor
      · intro h s _
        have hs := h (paritySlot s) (mem_finRange24 _)
        rw [(line_geom_facts.2.2.2.2.1 s).1] at hs
        rcases hs with hA | hB | hE
        · exact Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, hA, hPA])
        · exact Or.inr (Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, hB, hPB]))
        · exact Or.inr (Or.inr (by cases hx : d s with | empty => rfl | occ sx _ => rw [hx] at hE; cases sx <;> exact SlotState.noConfusion hE))
      · intro h s _
        rcases h (paritySlot s) (mem_finRange24 _) with hA | hB | hE
        · exact Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, hA, (line_geom_facts.2.2.2.2.2 l).2.1])
        · exact Or.inr (Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, hB, (line_geom_facts.2.2.2.2.2 l).2.2]))
        · exact Or.inr (Or.inr (by rw [hE]; rfl))
    rw [h1, h2]
  have hDock : isSoleIdentPairDock (cpFullDock d) = isSoleIdentPairDock d := by
    cases hd : isSoleIdentPairDock d with
    | true =>
      unfold isSoleIdentPairDock at hd ⊢
      cases hf : findSolePairLine d with
      | none => rw [hf] at hd; exact Bool.noConfusion hd
      | some l =>
        have hcp := hAt l; rw [(find?_eq_some_iff _ _ _ hf).2] at hcp
        rw [findSolePairLine_of_at (cpFullDock d) (parityLine l) hcp]; rfl
    | false =>
      cases hcp : isSoleIdentPairDock (cpFullDock d) with
      | false => rfl
      | true =>
        unfold isSoleIdentPairDock at hcp
        cases hf : findSolePairLine (cpFullDock d) with
        | none => rw [hf] at hcp; exact Bool.noConfusion hcp
        | some l =>
          have hBack := hAt (parityLine l)
          rw [(line_geom_facts.2.2.2.2.2 l).1, (find?_eq_some_iff _ _ _ hf).2] at hBack
          have hSome := findSolePairLine_of_at d (parityLine l) hBack.symm
          unfold isSoleIdentPairDock at hd; rw [hSome] at hd; exact Bool.noConfusion hd
  refine ⟨hAt, hDock, fun m hAct => ?_⟩
  unfold isSoleIdentPairDock at hAct
  cases hf : findSolePairLine d with
  | none => rw [hf] at hAct; exact Bool.noConfusion hAct
  | some l =>
    have hFindCP := findSolePairLine_of_at (cpFullDock d) (parityLine l) (by rw [hAt l, (find?_eq_some_iff _ _ _ hf).2])
    have hPA : paritySlot (lineA (parityLine l)) = lineA l := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine l)).2.1, (line_geom_facts.2.2.2.2.2 l).1]
    funext s
    change ((moveSolePairDock m d) (paritySlot s)).dual = (moveSolePairDock (parityLine m) (cpFullDock d)) s
    unfold moveSolePairDock; rw [hFindCP, hf]; dsimp only; unfold cpFullDock conjFullDock parityFullDock; rw [hPA]
    have hMA : paritySlot (lineA (parityLine m)) = lineA m := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine m)).2.1, (line_geom_facts.2.2.2.2.2 m).1]
    have hMB : paritySlot (lineB (parityLine m)) = lineB m := by
      rw [(line_geom_facts.2.2.2.2.2 (parityLine m)).2.2, (line_geom_facts.2.2.2.2.2 m).1]
    have hIff : (paritySlot s = lineA m ∨ paritySlot s = lineB m) ↔
        (s = lineA (parityLine m) ∨ s = lineB (parityLine m)) :=
      ⟨fun h => by rcases h with h1 | h2
                   · exact Or.inl (by rw [← (line_geom_facts.2.2.2.2.1 s).1, h1, (line_geom_facts.2.2.2.2.2 m).2.1])
                   · exact Or.inr (by rw [← (line_geom_facts.2.2.2.2.1 s).1, h2, (line_geom_facts.2.2.2.2.2 m).2.2]),
       fun h => by rcases h with h1 | h2
                   · exact Or.inl (by rw [h1, hMA])
                   · exact Or.inr (by rw [h2, hMB])⟩
    by_cases hP : paritySlot s = lineA m ∨ paritySlot s = lineB m
    · rw [ite_eq_left hP, ite_eq_left (hIff.mp hP)]
    · rw [ite_eq_right hP, ite_eq_right (fun hs => hP (hIff.mpr hs))]; rfl

/-- Headline Theorem 17 (Concrete Quantum Fock-Space Instantiation of `CoxeterTransport.thm_palindromic_beat_T_CP_CPT`). -/
theorem thm_fock_beat_T_CP_CPT (χ : ChiralInvariant) :
    (∀ ψ, fockT (fockT ψ) = ψ) ∧
    (∀ ψ, fockT (fockBeat χ (fockT ψ)) = fockBeatDag χ ψ) ∧
    (∀ ψ, fockCP (fockBeat χ ψ) = fockBeat χ (fockCP ψ)) ∧
    (∀ ψ, fockCPT (fockCPT ψ) = ψ) ∧
    (∀ ψ, fockCPT (fockBeat χ (fockCPT ψ)) = fockBeatDag χ ψ) := by
  have hTauS : ∀ ψ, fockTau (fockStream (fockTau ψ)) = fockStreamDag ψ := by
    intro ψ; funext c; unfold fockTau; rw [fockStream_eval, fockStreamDag_eval, NinthLoc6.conj_conj]
    have hEq : revConfig (streamConfigInv (revConfig c)) = streamConfig c := by
      have hInv : streamConfigInv (revConfig c) = revConfig (streamConfig c) := by
        have h := congrArg streamConfigInv (thm_fock_honeycomb_config_symmetries c).2.2.2.1
        rw [(thm_fock_honeycomb_config_symmetries _).1] at h; exact h.symm
      rw [hInv, (thm_fock_honeycomb_config_symmetries _).2.2.1]
    rw [hEq]
  have hTauPhi : ∀ ψ, fockTau (fockPhiOdd χ (fockTau ψ)) = fockPhiOddDag χ ψ :=
    globalOp_tau_of_site_tau (phiOddFamily χ) fun g ψ => by
      funext c; unfold fockTau phiOddFamily; dsimp only
      rw [sitePhiOddUnit_op, sitePhiOddUnit_dag, lookup_revConfig, χ.chi_rev,
          NinthLoc6.conj_mul, NinthLoc6.conj_conj, (thm_fock_honeycomb_config_symmetries c).2.2.1]
  have hTauD : ∀ ψ, fockTau (fockHalfCoin (fockTau ψ)) = fockHalfCoinDag ψ :=
    globalOp_tau_of_site_tau halfCoinFamily fun g ψ =>
      composeLines_tau (lineHalfCoin_comm_same_site g) (fun l φ => by
        funext c; unfold fockTau; rw [lineHalfCoinUnit_op, lineHalfCoinUnit_dag]
        have ⟨hAB, hBA, hne⟩ := line_geom_facts.1 l
        have hFull : isFullLine ((revConfig c).lookup g) l = isFullLine (c.lookup g) l := by
          rw [lookup_revConfig]; unfold isFullLine revFullDock; rw [hAB, hBA]
          cases c.lookup g (lineA l) <;> cases c.lookup g (lineB l) <;> rfl
        have hLone : isLoneLine ((revConfig c).lookup g) l = isLoneLine (c.lookup g) l := by
          rw [lookup_revConfig]; unfold isLoneLine revFullDock; rw [hAB, hBA]
          cases c.lookup g (lineA l) <;> cases c.lookup g (lineB l) <;> rfl
        have hFullSw : isFullLine ((swapLineSlotsConfig g l c).lookup g) l = isFullLine (c.lookup g) l := by
          unfold swapLineSlotsConfig; rw [lookup_setDock, ite_eq_left rfl]
          unfold isFullLine swapLineSlotsDock; simp only [ite_true, ite_eq_right hne.symm]
          cases c.lookup g (lineA l) <;> cases c.lookup g (lineB l) <;> rfl
        have hSwRev : revConfig (swapLineSlotsConfig g l (revConfig c)) = swapLineSlotsConfig g l c := by
          unfold swapLineSlotsConfig
          rw [revConfig_setDock, lookup_revConfig, revFullDock_swapLineSlots, (thm_fock_honeycomb_config_symmetries c).2.2.1]
          have hRR : revFullDock (revFullDock (c.lookup g)) = c.lookup g := by
            funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]
          rw [hRR]
        rw [hFull, hLone, hFullSw, NinthLoc6.conj_mul]
        cases isLoneLine (c.lookup g) l with
        | false => simp only [ite_bool_false]; rw [NinthLoc6.conj_conj, (thm_fock_honeycomb_config_symmetries c).2.2.1]
        | true =>
          simp only [ite_true]
          rw [NinthLoc6.conj_add, NinthLoc6.conj_mul, NinthLoc6.conj_mul, NinthLoc6.conj_conj, NinthLoc6.conj_conj,
              (thm_fock_honeycomb_config_symmetries c).2.2.1, hSwRev]
          exact nloc_mul_add_swap _ _ _ _ _) (List.finRange 12) finRange12_nodup ψ
  have hTauK : ∀ ψ, fockTau (fockBounceK (fockTau ψ)) = fockBounceK ψ := fun ψ => by
    change fockTau (fockBounceK (fockTau ψ)) = fockBounceKUnit.op ψ
    rw [← fockBounceK_self_adj ψ]
    exact globalOp_tau_of_site_tau bounceKFamily (fun g φ =>
      composeLines_tau (lineBounceK_comm_same_site g) (fun l χ' => by
        rw [lineBounceK_self_adj]; funext c; unfold fockTau; rw [lineBounceKUnit_op, lineBounceKUnit_op]
        have ⟨hAB, hBA, _⟩ := line_geom_facts.1 l
        have hOpp : isOppSignLine ((revConfig c).lookup g) l = isOppSignLine (c.lookup g) l := by
          rw [lookup_revConfig]; unfold isOppSignLine revFullDock; rw [hAB, hBA]
          cases c.lookup g (lineA l) with
          | empty => cases c.lookup g (lineB l) <;> rfl
          | occ sA _ => cases c.lookup g (lineB l) with | empty => rfl | occ sB _ => cases sA <;> cases sB <;> rfl
        have hPermRev : revConfig (lineBounceKPerm g l (revConfig c)) = lineBounceKPerm g l c := by
          unfold lineBounceKPerm; rw [hOpp]
          cases isOppSignLine (c.lookup g) l with
          | false => exact (thm_fock_honeycomb_config_symmetries c).2.2.1
          | true =>
            simp only [ite_true]; unfold swapLineSlotsConfig
            rw [revConfig_setDock, lookup_revConfig, revFullDock_swapLineSlots, (thm_fock_honeycomb_config_symmetries c).2.2.1]
            have hRR : revFullDock (revFullDock (c.lookup g)) = c.lookup g := by
              funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]
            rw [hRR]
        rw [hOpp, NinthLoc6.conj_mul, NinthLoc6.conj_conj, hPermRev]
        cases isOppSignLine (c.lookup g) l <;> exact congrArg (fun z => NinthLoc6.mul z _) (Quot.sound (by decide)))
      (List.finRange 12) finRange12_nodup φ) ψ
  have hTauMPair : ∀ ψ, fockTau (fockMPair (fockTau ψ)) = fockMPairDag ψ :=
    globalOp_tau_of_site_tau mpairFamily fun g ψ => by
      funext c; unfold fockTau mpairFamily; dsimp only
      rw [siteMPairUnit_op, siteMPairUnit_dag, lookup_revConfig, (rev_preserves_solePair (c.lookup g)).2.1]
      cases ha : isSoleIdentPairDock (c.lookup g) with
      | false => simp only [ite_bool_false]; rw [NinthLoc6.conj_conj, (thm_fock_honeycomb_config_symmetries c).2.2.1]
      | true =>
        simp only [ite_true]
        rw [NinthLoc6.conj_add, NinthLoc6.conj_mul, NinthLoc6.conj_conj,
            (thm_fock_honeycomb_config_symmetries c).2.2.1, nloc_sumFin12_conj]
        have hConjHop : NinthLoc6.conj NinthLoc6.pairHop =
            NinthLoc6.mul (NinthLoc6.sub (NinthLoc6.conj NinthLoc6.zeta18) NinthLoc6.one) NinthLoc6.inv12 :=
          Quot.sound (by decide)
        rw [hConjHop]; congr 2; refine sumFin12_congr _ _ fun m => ?_
        rw [NinthLoc6.conj_conj]; apply congrArg ψ; unfold moveSolePairConfig
        rw [revConfig_setDock, lookup_revConfig, ← (rev_preserves_solePair (c.lookup g)).2.2 m ha,
            (thm_fock_honeycomb_config_symmetries c).2.2.1]
        have hRR : ∀ d : FullDock, revFullDock (revFullDock d) = d := fun d => by
          funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]
        rw [hRR]
  have hTauMeet : ∀ ψ, fockTau (fockMeet (fockTau ψ)) = fockMeetDag ψ :=
    globalOp_tau_of_site_tau meetFamily fun g ψ =>
      composeLines_tau (lineMeet_comm_same_site g) (fun l φ => by
        funext c; unfold fockTau; rw [lineMeetUnit_op, lineMeetUnit_dag]
        have ⟨hAB, hBA, hne⟩ := line_geom_facts.1 l
        have hEqR : isSameSignEqRoleLine ((revConfig c).lookup g) l = isSameSignEqRoleLine (c.lookup g) l := by
          rw [lookup_revConfig]; unfold isSameSignEqRoleLine revFullDock; rw [hAB, hBA]
          cases c.lookup g (lineA l) with
          | empty => cases c.lookup g (lineB l) <;> rfl
          | occ sA rA => cases c.lookup g (lineB l) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
        have hDiffR : isSameSignDiffRoleLine ((revConfig c).lookup g) l = isSameSignDiffRoleLine (c.lookup g) l := by
          rw [lookup_revConfig]; unfold isSameSignDiffRoleLine revFullDock; rw [hAB, hBA]
          cases c.lookup g (lineA l) with
          | empty => cases c.lookup g (lineB l) <;> rfl
          | occ sA rA => cases c.lookup g (lineB l) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
        have hEqSw : isSameSignEqRoleLine ((swapLineRolesConfig g l c).lookup g) l = isSameSignEqRoleLine (c.lookup g) l := by
          unfold swapLineRolesConfig; rw [lookup_setDock, ite_eq_left rfl]; unfold isSameSignEqRoleLine swapLineRolesDock
          cases hA : c.lookup g (lineA l) with
          | empty => dsimp only; rw [hA]
          | occ sA rA =>
            cases hB : c.lookup g (lineB l) with
            | empty => dsimp only; rw [hA, hB]
            | occ sB rB => simp only [ite_true, ite_eq_right hne.symm]; cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
        have hSwRev : revConfig (swapLineRolesConfig g l (revConfig c)) = swapLineRolesConfig g l c := by
          unfold swapLineRolesConfig
          rw [revConfig_setDock, lookup_revConfig, revFullDock_swapLineRoles, (thm_fock_honeycomb_config_symmetries c).2.2.1]
          have hRR : revFullDock (revFullDock (c.lookup g)) = c.lookup g := by
            funext a; unfold revFullDock; rw [(thm_24_facets_geometry.2.1 a).1]
          rw [hRR]
        rw [hEqR, hDiffR, hEqSw, NinthLoc6.conj_mul]
        cases isSameSignDiffRoleLine (c.lookup g) l with
        | false => simp only [ite_bool_false]; rw [NinthLoc6.conj_conj, (thm_fock_honeycomb_config_symmetries c).2.2.1]
        | true =>
          simp only [ite_true]
          rw [NinthLoc6.conj_add, NinthLoc6.conj_mul, NinthLoc6.conj_mul, NinthLoc6.conj_conj, NinthLoc6.conj_conj,
              (thm_fock_honeycomb_config_symmetries c).2.2.1, hSwRev]
          exact nloc_mul_add_swap _ _ _ _ _) (List.finRange 12) finRange12_nodup ψ
  have hTauCore : ∀ ψ, fockTau (fockScale2Core (fockTau ψ)) = fockScale2CoreDag ψ := fun ψ => by
    change fockTau (fockMeet (fockMPair (fockBounceK (fockTau ψ)))) = fockScale2CoreDag ψ
    have h1 : fockBounceK (fockTau ψ) = fockTau (fockBounceK ψ) := by
      have := congrArg fockTau (hTauK ψ); rw [fockTau_involutive] at this; exact this
    have h2 : fockMPair (fockTau (fockBounceK ψ)) = fockTau (fockMPairDag (fockBounceK ψ)) := by
      have := congrArg fockTau (hTauMPair (fockBounceK ψ)); rw [fockTau_involutive] at this; exact this
    rw [h1, h2, hTauMeet, ← (thm_fock_scale2_core_unitary_and_comm ψ).2.2.2]
  have hCPS : ∀ ψ, fockCP (fockStream ψ) = fockStream (fockCP ψ) := fun ψ => by
    funext c; unfold fockCP; rw [fockStream_eval, fockStream_eval]
    have hInv : streamConfigInv (cpConfig c) = cpConfig (streamConfigInv c) := by
      have h1 : streamConfig (streamConfigInv (cpConfig c)) = streamConfig (cpConfig (streamConfigInv c)) := by
        rw [(thm_fock_honeycomb_config_symmetries _).2.1,
            ← (thm_fock_honeycomb_config_symmetries _).2.2.2.2.2.2.2.1,
            (thm_fock_honeycomb_config_symmetries _).2.1]
      have := congrArg streamConfigInv h1
      rw [(thm_fock_honeycomb_config_symmetries _).1, (thm_fock_honeycomb_config_symmetries _).1] at this; exact this
    rw [hInv]
  have hCPPhi : ∀ ψ, fockCP (fockPhiOdd χ ψ) = fockPhiOdd χ (fockCP ψ) :=
    globalOp_cp_of_site_cp (phiOddFamily χ) fun g ψ => by
      funext c; unfold fockCP phiOddFamily; dsimp only
      rw [sitePhiOddUnit_op, sitePhiOddUnit_op, lookup_cpConfig,
          (thm_fock_coxeter_parity_equivariance.2.2.2.2 g).2, χ.chi_cp]
  have hCPD : ∀ ψ, fockCP (fockHalfCoin ψ) = fockHalfCoin (fockCP ψ) :=
    globalOp_cp_of_site_cp halfCoinFamily fun g ψ =>
      composeLines_cp (lineHalfCoin_comm_same_site (conjMatP g)) (fun l φ => by
        funext c; unfold fockCP; rw [lineHalfCoinUnit_op, lineHalfCoinUnit_op]
        have hPA := (line_geom_facts.2.2.2.2.2 l).2.1
        have hPB := (line_geom_facts.2.2.2.2.2 l).2.2
        have hFull : isFullLine ((cpConfig c).lookup g) l = isFullLine (c.lookup (conjMatP g)) (parityLine l) := by
          rw [lookup_cpConfig]; unfold isFullLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
          cases c.lookup (conjMatP g) (lineA (parityLine l)) <;> cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
        have hLone : isLoneLine ((cpConfig c).lookup g) l = isLoneLine (c.lookup (conjMatP g)) (parityLine l) := by
          rw [lookup_cpConfig]; unfold isLoneLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
          cases c.lookup (conjMatP g) (lineA (parityLine l)) <;> cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
        have hSwCP : swapLineSlotsConfig g l (cpConfig c) = cpConfig (swapLineSlotsConfig (conjMatP g) (parityLine l) c) := by
          unfold swapLineSlotsConfig; rw [cpConfig_setDock, conjMatP_involutive, lookup_cpConfig]
          apply congrArg ((cpConfig c).setDock g); funext s; unfold swapLineSlotsDock cpFullDock conjFullDock parityFullDock
          if hsA : s = lineA l then simp only [hsA, hPA, hPB, ite_true]
          else if hsB : s = lineB l then
            simp only [hsB, hPA, hPB, ite_eq_right (line_geom_facts.1 l).2.2.symm, ite_eq_right (line_geom_facts.1 (parityLine l)).2.2.symm, ite_true]
          else
            have hP1 : paritySlot s ≠ lineA (parityLine l) := fun e => hsA (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPA, (line_geom_facts.2.2.2.2.1 _).1])
            have hP2 : paritySlot s ≠ lineB (parityLine l) := fun e => hsB (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPB, (line_geom_facts.2.2.2.2.1 _).1])
            simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hP1, ite_eq_right hP2]
        rw [hFull, hLone, hSwCP]) ψ
  have hCPK : ∀ ψ, fockCP (fockBounceK ψ) = fockBounceK (fockCP ψ) :=
    globalOp_cp_of_site_cp bounceKFamily fun g ψ =>
      composeLines_cp (lineBounceK_comm_same_site (conjMatP g)) (fun l φ => by
        funext c; unfold fockCP; rw [lineBounceKUnit_op, lineBounceKUnit_op]
        have hPA := (line_geom_facts.2.2.2.2.2 l).2.1
        have hPB := (line_geom_facts.2.2.2.2.2 l).2.2
        have hOpp : isOppSignLine ((cpConfig c).lookup g) l = isOppSignLine (c.lookup (conjMatP g)) (parityLine l) := by
          rw [lookup_cpConfig]; unfold isOppSignLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
          cases c.lookup (conjMatP g) (lineA (parityLine l)) with
          | empty => cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
          | occ sA _ => cases c.lookup (conjMatP g) (lineB (parityLine l)) with | empty => rfl | occ sB _ => cases sA <;> cases sB <;> rfl
        have hPermCP : lineBounceKPerm g l (cpConfig c) = cpConfig (lineBounceKPerm (conjMatP g) (parityLine l) c) := by
          unfold lineBounceKPerm; rw [hOpp]
          cases isOppSignLine (c.lookup (conjMatP g)) (parityLine l) with
          | false => rfl
          | true =>
            simp only [ite_true]; unfold swapLineSlotsConfig
            rw [cpConfig_setDock, conjMatP_involutive, lookup_cpConfig]
            apply congrArg ((cpConfig c).setDock g); funext s; unfold swapLineSlotsDock cpFullDock conjFullDock parityFullDock
            if hsA : s = lineA l then simp only [hsA, hPA, hPB, ite_true]
            else if hsB : s = lineB l then
              simp only [hsB, hPA, hPB, ite_eq_right (line_geom_facts.1 l).2.2.symm, ite_eq_right (line_geom_facts.1 (parityLine l)).2.2.symm, ite_true]
            else
              have hP1 : paritySlot s ≠ lineA (parityLine l) := fun e => hsA (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPA, (line_geom_facts.2.2.2.2.1 _).1])
              have hP2 : paritySlot s ≠ lineB (parityLine l) := fun e => hsB (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPB, (line_geom_facts.2.2.2.2.1 _).1])
              simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hP1, ite_eq_right hP2]
        rw [hOpp, hPermCP]) ψ
  have hCPMeet : ∀ ψ, fockCP (fockMeet ψ) = fockMeet (fockCP ψ) :=
    globalOp_cp_of_site_cp meetFamily fun g ψ =>
      composeLines_cp (lineMeet_comm_same_site (conjMatP g)) (fun l φ => by
        funext c; unfold fockCP; rw [lineMeetUnit_op, lineMeetUnit_op]
        have hPA := (line_geom_facts.2.2.2.2.2 l).2.1
        have hPB := (line_geom_facts.2.2.2.2.2 l).2.2
        have hEqR : isSameSignEqRoleLine ((cpConfig c).lookup g) l = isSameSignEqRoleLine (c.lookup (conjMatP g)) (parityLine l) := by
          rw [lookup_cpConfig]; unfold isSameSignEqRoleLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
          cases c.lookup (conjMatP g) (lineA (parityLine l)) with
          | empty => cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
          | occ sA rA => cases c.lookup (conjMatP g) (lineB (parityLine l)) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
        have hDiffR : isSameSignDiffRoleLine ((cpConfig c).lookup g) l = isSameSignDiffRoleLine (c.lookup (conjMatP g)) (parityLine l) := by
          rw [lookup_cpConfig]; unfold isSameSignDiffRoleLine cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
          cases c.lookup (conjMatP g) (lineA (parityLine l)) with
          | empty => cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
          | occ sA rA => cases c.lookup (conjMatP g) (lineB (parityLine l)) with | empty => rfl | occ sB rB => cases sA <;> cases sB <;> cases rA <;> cases rB <;> decide
        have hSwCP : swapLineRolesConfig g l (cpConfig c) = cpConfig (swapLineRolesConfig (conjMatP g) (parityLine l) c) := by
          unfold swapLineRolesConfig; rw [cpConfig_setDock, conjMatP_involutive, lookup_cpConfig]
          apply congrArg ((cpConfig c).setDock g); funext s; unfold swapLineRolesDock cpFullDock conjFullDock parityFullDock; rw [hPA, hPB]
          cases c.lookup (conjMatP g) (lineA (parityLine l)) with
          | empty => cases c.lookup (conjMatP g) (lineB (parityLine l)) <;> rfl
          | occ sA rA =>
            cases c.lookup (conjMatP g) (lineB (parityLine l)) with
            | empty => rfl
            | occ sB rB =>
              dsimp only [SlotState.dual]
              if hsA : s = lineA l then simp only [hsA, hPA, ite_true]
              else if hsB : s = lineB l then
                simp only [hsB, hPB, ite_eq_right (line_geom_facts.1 l).2.2.symm, ite_eq_right (line_geom_facts.1 (parityLine l)).2.2.symm, ite_true]
              else
                have hP1 : paritySlot s ≠ lineA (parityLine l) := fun e => hsA (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPA, (line_geom_facts.2.2.2.2.1 _).1])
                have hP2 : paritySlot s ≠ lineB (parityLine l) := fun e => hsB (by rw [← (line_geom_facts.2.2.2.2.1 s).1, e, ← hPB, (line_geom_facts.2.2.2.2.1 _).1])
                simp only [ite_eq_right hsA, ite_eq_right hsB, ite_eq_right hP1, ite_eq_right hP2]
        rw [hEqR, hDiffR, hSwCP]) ψ
  have hCPMPair : ∀ ψ, fockCP (fockMPair ψ) = fockMPair (fockCP ψ) :=
    globalOp_cp_of_site_cp mpairFamily fun g ψ => by
      funext c; unfold fockCP mpairFamily; dsimp only
      rw [siteMPairUnit_op, siteMPairUnit_op, lookup_cpConfig, (cp_preserves_solePair (c.lookup (conjMatP g))).2.1]
      cases ha : isSoleIdentPairDock (c.lookup (conjMatP g)) with
      | false => simp only [ite_bool_false]
      | true =>
        simp only [ite_true]; congr 2
        have hPInv : ∀ m, parityLine (parityLine m) = m := fun m => (line_geom_facts.2.2.2.2.2 m).1
        rw [← sumFin12_bijection parityLine parityLine (fun m => ψ (moveSolePairConfig g m (cpConfig c))) hPInv hPInv]
        refine sumFin12_congr _ _ fun m => congrArg ψ ?_
        unfold moveSolePairConfig
        rw [cpConfig_setDock, conjMatP_involutive, lookup_cpConfig, (cp_preserves_solePair (c.lookup (conjMatP g))).2.2 m ha]
  have hCPCore : ∀ ψ, fockCP (fockScale2Core ψ) = fockScale2Core (fockCP ψ) := fun ψ => by
    change fockCP (fockMeet (fockMPair (fockBounceK ψ))) = fockMeet (fockMPair (fockBounceK (fockCP ψ)))
    rw [hCPMeet, hCPMPair, hCPK]
  have hCPTau : ∀ ψ, fockCP (fockTau ψ) = fockTau (fockCP ψ) := fun ψ => by
    funext c; unfold fockCP fockTau; dsimp only
    rw [(thm_fock_honeycomb_config_symmetries c).2.2.2.2.2.2.2.2.1]
  exact thm_palindromic_beat_T_CP_CPT
    fockStream fockStreamDag (fockPhiOdd χ) (fockPhiOddDag χ) fockHalfCoin fockHalfCoinDag
    fockScale2Core fockScale2CoreDag fockTau fockCP
    fockStreamUnit.rightInv fockTau_involutive hTauS hTauPhi hTauD hTauCore
    fockCP_involutive hCPS hCPPhi hCPD hCPCore hCPTau

/-! ### Non-Vacuous 4-Vibe Chiral Witness (`[(0,+), (1,-), (4,+), (10,+)]`) -/

/-- Exact 4-vibe chiral quad `w = [(0,+), (1,-), (4,+), (10,+)]` from `test/universe.ts` (role `false`). -/
def chiralWitnessDock : FullDock
  | ⟨0, _⟩  => .occ .pos false
  | ⟨1, _⟩  => .occ .neg false
  | ⟨4, _⟩  => .occ .pos false
  | ⟨10, _⟩ => .occ .pos false
  | _       => .empty

def toneSig (d : FullDock) : DockState := fullDockToDockState d
def revSig (s : DockState) : DockState := fun i => s (oppSlot i)
def pSig (s : DockState) : DockState := fun i => s (paritySlot i)
def cpSig (s : DockState) : DockState := conjDock (pSig s)
def witnessSig : DockState := toneSig chiralWitnessDock

def isPosWitnessOrb (s : DockState) : Bool :=
  decide (s = witnessSig ∨ s = revSig witnessSig ∨ s = cpSig witnessSig ∨ s = revSig (cpSig witnessSig))

def isNegWitnessOrb (s : DockState) : Bool :=
  decide (s = conjDock witnessSig ∨ s = revSig (conjDock witnessSig) ∨
          s = pSig witnessSig ∨ s = revSig (pSig witnessSig))

/-- Explicit concrete `C`-odd, `P`-odd, `CP`-even, `R`-even 4-vibe chiral witness invariant. -/
def witnessChiFn (d : FullDock) : Int :=
  if isPosWitnessOrb (toneSig d) then 1
  else if isNegWitnessOrb (toneSig d) then -1
  else 0

-- [helper]
theorem witness_orb_disjoint :
    isPosWitnessOrb (toneSig v1FullDock) = false ∧
    isNegWitnessOrb (toneSig v1FullDock) = false ∧
    isPosWitnessOrb witnessSig = true ∧
    isNegWitnessOrb witnessSig = false ∧
    isPosWitnessOrb (conjDock witnessSig) = false ∧
    isNegWitnessOrb (conjDock witnessSig) = true ∧
    isPosWitnessOrb (pSig witnessSig) = false ∧
    isNegWitnessOrb (pSig witnessSig) = true ∧
    isPosWitnessOrb (revSig witnessSig) = true ∧
    isNegWitnessOrb (revSig witnessSig) = false ∧
    isPosWitnessOrb (cpSig witnessSig) = true ∧
    isNegWitnessOrb (cpSig witnessSig) = false ∧
    isPosWitnessOrb (revSig (cpSig witnessSig)) = true ∧
    isNegWitnessOrb (revSig (cpSig witnessSig)) = false ∧
    isPosWitnessOrb (revSig (conjDock witnessSig)) = false ∧
    isNegWitnessOrb (revSig (conjDock witnessSig)) = true ∧
    isPosWitnessOrb (revSig (pSig witnessSig)) = false ∧
    isNegWitnessOrb (revSig (pSig witnessSig)) = true := by
  decide

-- [helper]
theorem revSig_inv (s : DockState) : revSig (revSig s) = s := by
  funext i; unfold revSig; rw [(thm_24_facets_geometry.2.1 i).1]

-- [helper]
theorem cpSig_inv (s : DockState) : cpSig (cpSig s) = s := by
  funext i; unfold cpSig conjDock pSig; dsimp only
  rw [(line_geom_facts.2.2.2.2.1 i).1]; cases s i <;> rfl

-- [helper]
theorem cpSig_revSig (s : DockState) : cpSig (revSig s) = revSig (cpSig s) := by
  funext i; unfold cpSig conjDock pSig revSig; dsimp only
  rw [(line_geom_facts.2.2.2.2.1 i).2]

-- [helper]
theorem cpSig_conjDock (s : DockState) : cpSig (conjDock s) = pSig s := by
  funext i; unfold cpSig conjDock pSig; dsimp only; cases s (paritySlot i) <;> rfl

-- [helper]
theorem cpSig_pSig (s : DockState) : cpSig (pSig s) = conjDock s := by
  funext i; unfold cpSig conjDock pSig; rw [(line_geom_facts.2.2.2.2.1 i).1]

/-- Concrete non-trivial `ChiralInvariant` constructed from the 4-vibe chiral quad `[(0,+),(1,-),(4,+),(10,+)]`. -/
def witnessChiralInvariant : ChiralInvariant where
  chi := witnessChiFn
  chi_v1 := by unfold witnessChiFn; rw [witness_orb_disjoint.1, witness_orb_disjoint.2.1]; rfl
  chi_rev := fun d => by
    have hT : toneSig (revFullDock d) = revSig (toneSig d) := rfl
    unfold witnessChiFn; rw [hT]
    have hPos : isPosWitnessOrb (revSig (toneSig d)) = isPosWitnessOrb (toneSig d) := by
      apply Bool.eq_iff_iff.mpr; simp only [isPosWitnessOrb, decide_eq_true_eq]
      constructor
      · rintro (h | h | h | h)
        · exact Or.inr (Or.inl (by rw [← revSig_inv (toneSig d), h]))
        · exact Or.inl (by rw [← revSig_inv (toneSig d), h, revSig_inv])
        · exact Or.inr (Or.inr (Or.inr (by rw [← revSig_inv (toneSig d), h])))
        · exact Or.inr (Or.inr (Or.inl (by rw [← revSig_inv (toneSig d), h, revSig_inv])))
      · rintro (h | h | h | h)
        · exact Or.inr (Or.inl (by rw [h]))
        · exact Or.inl (by rw [h, revSig_inv])
        · exact Or.inr (Or.inr (Or.inr (by rw [h])))
        · exact Or.inr (Or.inr (Or.inl (by rw [h, revSig_inv])))
    have hNeg : isNegWitnessOrb (revSig (toneSig d)) = isNegWitnessOrb (toneSig d) := by
      apply Bool.eq_iff_iff.mpr; simp only [isNegWitnessOrb, decide_eq_true_eq]
      constructor
      · rintro (h | h | h | h)
        · exact Or.inr (Or.inl (by rw [← revSig_inv (toneSig d), h]))
        · exact Or.inl (by rw [← revSig_inv (toneSig d), h, revSig_inv])
        · exact Or.inr (Or.inr (Or.inr (by rw [← revSig_inv (toneSig d), h])))
        · exact Or.inr (Or.inr (Or.inl (by rw [← revSig_inv (toneSig d), h, revSig_inv])))
      · rintro (h | h | h | h)
        · exact Or.inr (Or.inl (by rw [h]))
        · exact Or.inl (by rw [h, revSig_inv])
        · exact Or.inr (Or.inr (Or.inr (by rw [h])))
        · exact Or.inr (Or.inr (Or.inl (by rw [h, revSig_inv])))
    rw [hPos, hNeg]
  chi_cp := fun d => by
    have hT : toneSig (cpFullDock d) = cpSig (toneSig d) := by
      funext i; unfold toneSig fullDockToDockState cpFullDock conjFullDock parityFullDock cpSig conjDock pSig; dsimp only
      cases d (paritySlot i) with | empty => rfl | occ s _ => cases s <;> rfl
    unfold witnessChiFn; rw [hT]
    have hPos : isPosWitnessOrb (cpSig (toneSig d)) = isPosWitnessOrb (toneSig d) := by
      apply Bool.eq_iff_iff.mpr; simp only [isPosWitnessOrb, decide_eq_true_eq]
      constructor
      · rintro (h | h | h | h)
        · exact Or.inr (Or.inr (Or.inl (by rw [← cpSig_inv (toneSig d), h])))
        · exact Or.inr (Or.inr (Or.inr (by rw [← cpSig_inv (toneSig d), h, cpSig_revSig])))
        · exact Or.inl (by rw [← cpSig_inv (toneSig d), h, cpSig_inv])
        · exact Or.inr (Or.inl (by rw [← cpSig_inv (toneSig d), h, cpSig_revSig, cpSig_inv]))
      · rintro (h | h | h | h)
        · exact Or.inr (Or.inr (Or.inl (by rw [h])))
        · exact Or.inr (Or.inr (Or.inr (by rw [h, cpSig_revSig])))
        · exact Or.inl (by rw [h, cpSig_inv])
        · exact Or.inr (Or.inl (by rw [h, cpSig_revSig, cpSig_inv]))
    have hNeg : isNegWitnessOrb (cpSig (toneSig d)) = isNegWitnessOrb (toneSig d) := by
      apply Bool.eq_iff_iff.mpr; simp only [isNegWitnessOrb, decide_eq_true_eq]
      constructor
      · rintro (h | h | h | h)
        · exact Or.inr (Or.inr (Or.inl (by rw [← cpSig_inv (toneSig d), h, cpSig_conjDock])))
        · exact Or.inr (Or.inr (Or.inr (by rw [← cpSig_inv (toneSig d), h, cpSig_revSig, cpSig_conjDock])))
        · exact Or.inl (by rw [← cpSig_inv (toneSig d), h, cpSig_pSig])
        · exact Or.inr (Or.inl (by rw [← cpSig_inv (toneSig d), h, cpSig_revSig, cpSig_pSig]))
      · rintro (h | h | h | h)
        · exact Or.inr (Or.inr (Or.inl (by rw [h, cpSig_conjDock])))
        · exact Or.inr (Or.inr (Or.inr (by rw [h, cpSig_revSig, cpSig_conjDock])))
        · exact Or.inl (by rw [h, cpSig_pSig])
        · exact Or.inr (Or.inl (by rw [h, cpSig_revSig, cpSig_pSig]))
    rw [hPos, hNeg]

/-- Single-dock configuration placing the 4-vibe chiral quad `chiralWitnessDock` at base cell `mat5Id`. -/
def chiralWitnessConfig : HoneycombConfig :=
  v1Config.setDock mat5Id chiralWitnessDock

private theorem fockPhiOdd_eq_globalOp (χ : ChiralInvariant) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    fockPhiOdd χ ψ = globalOp (phiOddFamily χ) ψ := rfl

/-- Headline Theorem 18 (Non-Vacuity of `Φ_odd`: Genuine Individual `C` and `P` Violation with Exact `CP / T / CPT`). -/
theorem thm_fock_chiral_witness_C_P_violation :
    witnessChiralInvariant.chi chiralWitnessDock = 1 ∧
    witnessChiralInvariant.chi (conjFullDock chiralWitnessDock) = -1 ∧
    witnessChiralInvariant.chi (parityFullDock chiralWitnessDock) = -1 ∧
    fockChargeConj (fockPhiOdd witnessChiralInvariant (ket (R := NinthLoc6) chiralWitnessConfig)) ≠
      fockPhiOdd witnessChiralInvariant (fockChargeConj (ket (R := NinthLoc6) chiralWitnessConfig)) ∧
    fockParity (fockPhiOdd witnessChiralInvariant (ket (R := NinthLoc6) chiralWitnessConfig)) ≠
      fockPhiOdd witnessChiralInvariant (fockParity (ket (R := NinthLoc6) chiralWitnessConfig)) := by
  have hW1 : witnessChiralInvariant.chi chiralWitnessDock = 1 := by
    change witnessChiFn chiralWitnessDock = 1; unfold witnessChiFn
    change (if isPosWitnessOrb witnessSig then 1 else if isNegWitnessOrb witnessSig then -1 else 0) = 1
    rw [witness_orb_disjoint.2.2.1]; rfl
  have hWC : witnessChiralInvariant.chi (conjFullDock chiralWitnessDock) = -1 := by
    have hT : toneSig (conjFullDock chiralWitnessDock) = conjDock witnessSig := by
      funext i; change (chiralWitnessDock i).dual.tone = (chiralWitnessDock i).tone.dual
      cases chiralWitnessDock i with | empty => rfl | occ s _ => cases s <;> rfl
    change witnessChiFn (conjFullDock chiralWitnessDock) = -1
    unfold witnessChiFn; rw [hT, witness_orb_disjoint.2.2.2.2.1, witness_orb_disjoint.2.2.2.2.2.1]; rfl
  have hWP : witnessChiralInvariant.chi (parityFullDock chiralWitnessDock) = -1 := by
    change witnessChiFn (parityFullDock chiralWitnessDock) = -1
    unfold witnessChiFn; change (if isPosWitnessOrb (pSig witnessSig) then 1 else if isNegWitnessOrb (pSig witnessSig) then -1 else 0) = -1
    rw [witness_orb_disjoint.2.2.2.2.2.2.1, witness_orb_disjoint.2.2.2.2.2.2.2.1]; rfl
  have hD0 : dockParity mat5Id = 1 := by
    unfold dockParity; rw [(by decide : mat5Det mat5Id = ZSqrt2.one)]; rfl
  have hWNeV1 : chiralWitnessDock ≠ v1FullDock := fun h0 => SlotState.noConfusion (congrFun h0 ⟨0, by decide⟩)
  have hCWNeV1 : conjFullDock chiralWitnessDock ≠ v1FullDock := fun h0 => SlotState.noConfusion (congrFun h0 ⟨0, by decide⟩)
  have hPWNeV1 : parityFullDock chiralWitnessDock ≠ v1FullDock := fun h0 => SlotState.noConfusion (congrFun h0 ⟨0, by decide⟩)
  have hActW : chiralWitnessConfig.activeDocks = [mat5Id] := by
    unfold chiralWitnessConfig HoneycombConfig.setDock HoneycombConfig.activeDocks v1Config
    simp only [setEntries, ite_eq_right hWNeV1, List.map]
  have hActCW : (conjConfig chiralWitnessConfig).activeDocks = [mat5Id] := by
    have hEq : conjConfig chiralWitnessConfig = v1Config.setDock mat5Id (conjFullDock chiralWitnessDock) := by
      apply honeycombConfig_ext; intro g; rw [lookup_conjConfig, lookup_setDock]
      unfold chiralWitnessConfig; rw [lookup_setDock]
      split_ifs <;> rfl
    rw [hEq]; unfold HoneycombConfig.setDock HoneycombConfig.activeDocks v1Config
    simp only [setEntries, ite_eq_right hCWNeV1, List.map]
  have hConjId : conjMatP mat5Id = mat5Id := by
    unfold conjMatP; rw [fb_mat5Mul_id_right, thm_fock_coxeter_parity_equivariance.1]
  have hActPW : (parityConfig chiralWitnessConfig).activeDocks = [mat5Id] := by
    have hEq : parityConfig chiralWitnessConfig = v1Config.setDock mat5Id (parityFullDock chiralWitnessDock) := by
      apply honeycombConfig_ext; intro g; rw [lookup_parityConfig, lookup_setDock]
      unfold chiralWitnessConfig; rw [lookup_setDock]
      if hg : g = mat5Id then simp only [hg, hConjId, ite_true]
      else
        have hne : conjMatP g ≠ mat5Id := fun e => hg (by rw [← conjMatP_involutive g, e, hConjId])
        simp only [ite_eq_right hg, ite_eq_right hne]; rfl
    rw [hEq]; unfold HoneycombConfig.setDock HoneycombConfig.activeDocks v1Config
    simp only [setEntries, ite_eq_right hPWNeV1, List.map]
  have hZetaNe : NinthLoc6.zeta6 ≠ NinthLoc6.neg NinthLoc6.omega :=
    NinthLoc6.ne_of_raw_ne ⟨1, 0, 0, 1, 0, 0⟩ ⟨0, 0, 0, -1, 0, 0⟩ (by decide)
  have hZ1 : NinthLoc6.zeta6Pow (1 * 1) = NinthLoc6.zeta6 := by
    unfold NinthLoc6.zeta6Pow; rw [(by decide : (1 * 1 : Int) % 6 = 1)]; rfl
  have hZ2 : NinthLoc6.zeta6Pow (1 * -1) = NinthLoc6.neg NinthLoc6.omega := by
    unfold NinthLoc6.zeta6Pow; rw [(by decide : (1 * -1 : Int) % 6 = 5)]; rfl
  have hLkW : chiralWitnessConfig.lookup mat5Id = chiralWitnessDock := by
    unfold chiralWitnessConfig; rw [lookup_setDock, ite_eq_left rfl]
  have hCViol : fockChargeConj (fockPhiOdd witnessChiralInvariant (ket (R := NinthLoc6) chiralWitnessConfig)) ≠
      fockPhiOdd witnessChiralInvariant (fockChargeConj (ket (R := NinthLoc6) chiralWitnessConfig)) := by
    intro hEq
    have hAt := congrFun hEq (conjConfig chiralWitnessConfig)
    unfold fockChargeConj at hAt
    rw [fockPhiOdd_eq_globalOp, fockPhiOdd_eq_globalOp, (thm_fock_honeycomb_config_symmetries chiralWitnessConfig).2.2.2.2.1] at hAt
    unfold globalOp at hAt; rw [hActW, hActCW] at hAt
    simp only [applySites, phiOddFamily] at hAt; rw [sitePhiOddUnit_op, sitePhiOddUnit_op] at hAt
    have hKetL : ket (R := NinthLoc6) chiralWitnessConfig chiralWitnessConfig = NinthLoc6.one := by rw [ket_nloc, ite_eq_left rfl]
    have hKetR : ket (R := NinthLoc6) chiralWitnessConfig (conjConfig (conjConfig chiralWitnessConfig)) = NinthLoc6.one := by
      rw [(thm_fock_honeycomb_config_symmetries chiralWitnessConfig).2.2.2.2.1, ket_nloc, ite_eq_left rfl]
    have hLkCW : (conjConfig chiralWitnessConfig).lookup mat5Id = conjFullDock chiralWitnessDock := by
      rw [lookup_conjConfig, hLkW]
    rw [hKetL, hKetR, hLkW, hLkCW, hD0, hW1, hWC, NinthLoc6.mul_one, NinthLoc6.mul_one, hZ1, hZ2] at hAt
    exact hZetaNe hAt
  have hPViol : fockParity (fockPhiOdd witnessChiralInvariant (ket (R := NinthLoc6) chiralWitnessConfig)) ≠
      fockPhiOdd witnessChiralInvariant (fockParity (ket (R := NinthLoc6) chiralWitnessConfig)) := by
    intro hEq
    have hAt := congrFun hEq (parityConfig chiralWitnessConfig)
    unfold fockParity at hAt
    rw [fockPhiOdd_eq_globalOp, fockPhiOdd_eq_globalOp, (thm_fock_honeycomb_config_symmetries chiralWitnessConfig).2.2.2.2.2.1] at hAt
    unfold globalOp at hAt; rw [hActW, hActPW] at hAt
    simp only [applySites, phiOddFamily] at hAt; rw [sitePhiOddUnit_op, sitePhiOddUnit_op] at hAt
    have hKetL : ket (R := NinthLoc6) chiralWitnessConfig chiralWitnessConfig = NinthLoc6.one := by rw [ket_nloc, ite_eq_left rfl]
    have hKetR : ket (R := NinthLoc6) chiralWitnessConfig (parityConfig (parityConfig chiralWitnessConfig)) = NinthLoc6.one := by
      rw [(thm_fock_honeycomb_config_symmetries chiralWitnessConfig).2.2.2.2.2.1, ket_nloc, ite_eq_left rfl]
    have hLkPW : (parityConfig chiralWitnessConfig).lookup mat5Id = parityFullDock chiralWitnessDock := by
      rw [lookup_parityConfig, hConjId, hLkW]
    rw [hKetL, hKetR, hLkW, hLkPW, hD0, hW1, hWP, NinthLoc6.mul_one, NinthLoc6.mul_one, hZ1, hZ2] at hAt
    exact hZetaNe hAt
  exact ⟨hW1, hWC, hWP, hCViol, hPViol⟩

end Vibe

end
