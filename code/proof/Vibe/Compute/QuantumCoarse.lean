import Vibe.Compute.BeatLink
import Vibe.QuantumBoundary
import Vibe.Generated.QuantumCoarse

/-!
# Vibe Computation Lab: no tone reading turns the bare beat into a classical rule

Claims A16, A17 and B8 (Q6, `code/compute/quantum/classical-boundary.ts`).
Everything is about the Lean Fock beat `fockBeat χ` of `Vibe.FockBeat`, which `Vibe.Compute.BeatLink` ties to
`code/rule/bare-beat.ts` on its declared base-dock family. The Fock model has two roles (`r : Bool`), so every
theorem here speaks about the 2-role restriction of bare-beat.ts (roles 0 and 1), as L15's do.

1. `thm_qc_lone_split` (A16, one beat): for every silent `χ` and every lone vibe (any slot `a`, sign, role) at
   the base dock, `U` gives exactly `k` times the vibe on slot `a` one dock on and `f` times the vibe on slot
   `opp a` one dock back, `k = ζ_6 / 2`, `f = (1 - ω) / 2`, with dephased weights `1/4` and `3/4`
   (`QuantumBoundary.thm_q_dephased_line_coin`). `thm_qc_lone_targets`: the 24 forward docks are distinct and
   `k² - f²`, `k f` are nonzero.
2. `thm_qc_lone_walk`: `U^t`, `t ≤ 3`, on a lone vibe is the Lean walk on the line of its slot, for every
   slot, sign and role (the dock-local layers checked in the kernel on every lone vibe at coordinates `-2 .. 2`
   of every line, the stream proved for every frame).
3. `thm_qc_lone_branch`, `thm_qc_coarse_nogo` (A16): for every dock map `τ`, into any type, that tells some
   lone vibe from an empty dock, `U`, `U^2` and `U^3` each send that vibe to two configurations of different
   coarse images, so none of them is a function on coarse states (`QcCoarseFunction`). Stronger than the
   note: `τ` need not send the empty dock to `0`, only tell the lone vibe from it.
4. `thm_qc_monomial_only_vacuum` (A17): for every `χ`, `U` fixes the vacuum, and every sector of `1 .. 24`
   excitations and any allowed charge holds a one-dock state whose image has two basis configurations.
5. B8: `gen_quantum_coarse_maps_eq` ties the Lean `netSign`, `netResidue`, `pairedSign`, `lowestSlotTone` to
   `DECLARED_TONE_MAPS` on every one- and two-excitation dock state of role 0 (Generated/QuantumCoarse);
   `thm_qc_declared_maps_lone` (each sends the empty dock to 0, three see a lone vibe, `pairedSign` is blind);
   `thm_qc_declared_maps_nogo` (the three seeing maps under `U`, `U^2`, `U^3`, from A16);
   `thm_qc_paired_sign_nogo` (`pairedSign` under `U`, for every `χ`: the head-on pair against the vacuum).

**Not here.** The exhaustive censuses of Q6 (layer monomiality on 134,048 base-dock states and the 28,476
4-excitation family, the 96 states monomial for one beat and none for two, the dephased support components, the
16,233-state coarse census) stay the experiment's: one kernel evaluation of a layer costs about 0.1 s, so they
are far past a kernel proof. Sectors of more than 24 excitations (more than one dock) and `pairedSign` under
`U^2`, `U^3` are not proved. `dh_monomial_fock_clifford_classification` (make) classifies `(N, Q)`-conserving
Cliffords, a different object from `U`, and is consistent with A17 (no step here needs it).
-/

set_option autoImplicit false

namespace Vibe

namespace Compute

/-! ## Lone vibes on the line of a slot -/

/-- `k^n` built by right multiplication, the way the stream composes frames. -/
def qcPowR (k : Mat5) : Nat → Mat5
  | 0 => mat5Id
  | n + 1 => mat5Mul (qcPowR k n) k

/-- The frame at coordinate `m` of the line of slot `s` through the base dock: `k_s^m` for `m ≥ 0` and
    `k_{opp s}^{-m}` for `m < 0`. -/
def qcFrame (s : Fin 24) : Int → Mat5
  | .ofNat n => qcPowR (transport s) n
  | .negSucc n => qcPowR (transport (oppSlot s)) (n + 1)

/-- A dock holding one vibe of sign `σ` and role `r` on slot `a`, nothing else. -/
def qcDock (a : Fin 24) (σ : Sign) (r : Bool) : FullDock := fun t => if t = a then .occ σ r else .empty

/-- Slot `s` (`e = true`, moving along `s`) or its opposite (`e = false`). -/
def qcSlot (s : Fin 24) (e : Bool) : Fin 24 := if e then s else oppSlot s

/-- The lone vibe `(σ, r)` at coordinate `l.1` of the line of `s`, on slot `qcSlot s l.2`. -/
def qcLone (s : Fin 24) (σ : Sign) (r : Bool) (l : Int × Bool) : HoneycombConfig :=
  v1Config.setDock (qcFrame s l.1) (qcDock (qcSlot s l.2) σ r)

/-- Labels a lone vibe holds before its third beat: coordinates `-2 .. 2`. -/
def qcInner (l : Int × Bool) : Prop := -2 ≤ l.1 ∧ l.1 ≤ 2

instance (l : Int × Bool) : Decidable (qcInner l) := by unfold qcInner; infer_instance

/-- Labels of the walk to beat 3: coordinates `-3 .. 3`. -/
def qcLabel (l : Int × Bool) : Prop := -3 ≤ l.1 ∧ l.1 ≤ 3

instance (l : Int × Bool) : Decidable (qcLabel l) := by unfold qcLabel; infer_instance

/-- One hop along the vibe's own slot. -/
def qcHop (l : Int × Bool) : Int × Bool := (l.1 + (if l.2 then 1 else -1), l.2)

/-- Every inner label, as a list. -/
def qcInnerLabels : List (Int × Bool) :=
  ((List.range 5).map fun n : Nat => (n : Int) - 2).flatMap fun m => [(m, true), (m, false)]

private theorem qc_inner_mem (l : Int × Bool) (h : qcInner l) : l ∈ qcInnerLabels := by
  obtain ⟨m, e⟩ := l
  obtain ⟨h1, h2⟩ := h
  unfold qcInnerLabels
  rw [List.mem_flatMap]
  simp only at h1 h2
  have hr : (m + 2).toNat < 5 := by omega
  have he : (((m + 2).toNat : Nat) : Int) - 2 = m := by omega
  refine ⟨m, List.mem_map.mpr ⟨(m + 2).toNat, List.mem_range.mpr hr, he⟩, ?_⟩
  cases e <;> simp

/-! ## The stream on a lone vibe, for every frame -/

-- [helper]
theorem qc_lookup_stream (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (streamConfig c).lookup g a = c.lookup (mat5Mul g (transport (oppSlot a))) a := by
  have h := lookup_streamConfigInv (streamConfig c) (mat5Mul g (transport (oppSlot a))) a
  rw [(thm_fock_honeycomb_config_symmetries c).1, fb_mat5Mul_assoc, transport_inv_left,
    fb_mat5Mul_id_right] at h
  exact h.symm

private theorem qc_v1_lookup (g : Mat5) : v1Config.lookup g = v1FullDock := rfl

-- [helper]
/-- The stream carries a lone vibe on slot `a` of the dock with frame `g` to slot `a` of the neighbour
    `g k_a`, for every frame `g`. -/
theorem qc_stream_lone (g : Mat5) (a : Fin 24) (σ : Sign) (r : Bool) :
    streamConfig (v1Config.setDock g (qcDock a σ r)) =
      v1Config.setDock (mat5Mul g (transport a)) (qcDock a σ r) := by
  apply honeycombConfig_ext
  intro h
  funext b
  rw [qc_lookup_stream, lookup_setDock, lookup_setDock]
  by_cases hb : b = a
  · subst hb
    by_cases e : h = mat5Mul g (transport b)
    · have e' : mat5Mul h (transport (oppSlot b)) = g := by
        rw [e, fb_mat5Mul_assoc, thm_coxeter_transport_antipodal_inverse.2 b, fb_mat5Mul_id_right]
      rw [ite_eq_left e', ite_eq_left e]
    · have e' : mat5Mul h (transport (oppSlot b)) ≠ g := by
        intro h2
        apply e
        rw [← h2, fb_mat5Mul_assoc, transport_inv_left, fb_mat5Mul_id_right]
      rw [ite_eq_right e', ite_eq_right e, qc_v1_lookup, qc_v1_lookup]
  · have hd : qcDock a σ r b = .empty := by simp only [qcDock, hb, ↓reduceIte]
    have h1 : ∀ (P : Prop) [Decidable P] (x : Mat5),
        (if P then qcDock a σ r else v1Config.lookup x) b = .empty := by
      intro P _ x
      by_cases hP : P
      · rw [ite_eq_left hP]; exact hd
      · rw [ite_eq_right hP]; rfl
    exact (h1 _ _).trans (h1 _ _).symm

private theorem qc_frame_hop (s : Fin 24) (l : Int × Bool) (hl : qcInner l) :
    mat5Mul (qcFrame s l.1) (transport (qcSlot s l.2)) = qcFrame s (qcHop l).1 := by
  obtain ⟨m, e⟩ := l
  obtain ⟨h1, h2⟩ := hl
  have hm : m = -2 ∨ m = -1 ∨ m = 0 ∨ m = 1 ∨ m = 2 := by simp only at h1 h2; omega
  have il := transport_inv_left s
  have ir := thm_coxeter_transport_antipodal_inverse.2 s
  rcases hm with rfl | rfl | rfl | rfl | rfl <;> cases e
  · rfl
  · show mat5Mul (mat5Mul (mat5Mul mat5Id (transport (oppSlot s))) (transport (oppSlot s))) (transport s) =
      mat5Mul mat5Id (transport (oppSlot s))
    rw [fb_mat5Mul_assoc _ (transport (oppSlot s)), il, fb_mat5Mul_id_right]
  · rfl
  · show mat5Mul (mat5Mul mat5Id (transport (oppSlot s))) (transport s) = mat5Id
    rw [fb_mat5Mul_assoc, il, fb_mat5Mul_id_right]
  · rfl
  · rfl
  · show mat5Mul (mat5Mul mat5Id (transport s)) (transport (oppSlot s)) = mat5Id
    rw [fb_mat5Mul_assoc, ir, fb_mat5Mul_id_right]
  · rfl
  · show mat5Mul (mat5Mul (mat5Mul mat5Id (transport s)) (transport s)) (transport (oppSlot s)) =
      mat5Mul mat5Id (transport s)
    rw [fb_mat5Mul_assoc (mat5Mul mat5Id (transport s)), ir, fb_mat5Mul_id_right]
  · rfl

-- [helper]
/-- The stream on an inner lone vibe is one hop along its slot. -/
theorem qc_stream_hop (s : Fin 24) (σ : Sign) (r : Bool) (l : Int × Bool) (hl : qcInner l) :
    streamConfig (qcLone s σ r l) = qcLone s σ r (qcHop l) := by
  show streamConfig (v1Config.setDock (qcFrame s l.1) (qcDock (qcSlot s l.2) σ r)) =
    v1Config.setDock (qcFrame s (qcHop l).1) (qcDock (qcSlot s (qcHop l).2) σ r)
  rw [qc_stream_lone, qc_frame_hop s l hl]
  rfl

/-! ## The dock-local layers on lone vibes, checked in the kernel for every slot, sign and role -/

/-- The check of one labelled state against rows for a layer `L`: each row's amplitude, the rows' configurations
    distinct, and the rows' squared norm `1`. -/
def qcLayerOk {α : Type} (cf : α → HoneycombConfig)
    (L : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig)
    (l : α) (rows : List (α × NinthRaw6)) : Bool :=
  rows.all (fun q => decide (NinthLoc6.isZero (NinthLoc6.sub (L (ket (cf l)) (cf q.1)) (blToN q.2)))) &&
    decide ((rows.map fun q => cf q.1).Nodup) &&
    decide (NinthRaw6.equiv (blNormR rows) ⟨Ninth.one, 0⟩)

private theorem qc_normR_eq {α : Type} (cf : α → HoneycombConfig) (xs : List (α × NinthRaw6)) :
    blToN (blNormR xs) = blNormSum (xs.map fun p => (cf p.1, blToN p.2)) := by
  induction xs with
  | nil => rfl
  | cons p r ih =>
    show blToN (blRAdd _ _) = NinthLoc6.conj (blToN p.2) * blToN p.2 + blNormSum _
    rw [bl_toN_add, ih]; rfl

private theorem qc_layer_of_ok {α : Type} (U : FockUnitary NinthLoc6 HoneycombConfig) (cf : α → HoneycombConfig)
    (l : α) (rows : List (α × NinthRaw6)) (h : qcLayerOk cf U.op l rows = true) :
    U.op (ket (cf l)) = blComboR cf rows := by
  simp only [qcLayerOk, Bool.and_eq_true, List.all_eq_true, decide_eq_true_eq] at h
  obtain ⟨⟨hrows, hnd⟩, hnorm⟩ := h
  apply bl_op_ket_eq
  · have e : ((blToNL rows).map fun p => (cf p.1, p.2)).map Prod.fst = rows.map fun q => cf q.1 := by
      unfold blToNL; rw [List.map_map, List.map_map]; rfl
    rw [e]; exact hnd
  · intro p hp
    obtain ⟨q, hq', rfl⟩ := List.mem_map.mp hp
    obtain ⟨r, hr, rfl⟩ := List.mem_map.mp hq'
    exact bl_eq_of_isZero (hrows r hr)
  · have e : (blToNL rows).map (fun p => (cf p.1, p.2)) = rows.map fun p => (cf p.1, blToN p.2) := by
      unfold blToNL; rw [List.map_map]; rfl
    rw [e, ← qc_normR_eq cf rows]
    exact Quot.sound hnorm

/-- The half coin on a lone vibe, with the coefficients bare-beat.ts produced (`gen_bare_beat_coeffs_eq`: the
    Lean `coinDiag`, `coinOff`). -/
def qcCoinW (l : Int × Bool) : List ((Int × Bool) × NinthRaw6) :=
  [(l, blRawOf (Generated.bareBeatCoeffs.getD 0 [])), ((l.1, !l.2), blRawOf (Generated.bareBeatCoeffs.getD 1 []))]

/-- A layer that leaves a lone vibe as it is. -/
def qcIdW (l : Int × Bool) : List ((Int × Bool) × NinthRaw6) := [(l, ⟨Ninth.one, 0⟩)]

/-- The stream on a lone vibe. -/
def qcStreamW (l : Int × Bool) : List ((Int × Bool) × NinthRaw6) := [(qcHop l, ⟨Ninth.one, 0⟩)]

/-- The kernel check of one inner lone vibe: `D` splits it on its line, `K`, `M_pair` and `M_meet` leave it. -/
def qcStepOk (s : Fin 24) (σ : Sign) (r : Bool) (l : Int × Bool) : Bool :=
  qcLayerOk (qcLone s σ r) fockHalfCoin l (qcCoinW l) && qcLayerOk (qcLone s σ r) fockBounceK l (qcIdW l) &&
    qcLayerOk (qcLone s σ r) fockMPair l (qcIdW l) && qcLayerOk (qcLone s σ r) fockMeet l (qcIdW l)

/-- Both roles of one slot and sign. -/
def qcSlotSignOk (s : Fin 24) (σ : Sign) (l : Int × Bool) : Bool := qcStepOk s σ false l && qcStepOk s σ true l

private theorem qc_steps_00_neg : qcInnerLabels.all (qcSlotSignOk ⟨0, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_00_pos : qcInnerLabels.all (qcSlotSignOk ⟨0, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_01_neg : qcInnerLabels.all (qcSlotSignOk ⟨1, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_01_pos : qcInnerLabels.all (qcSlotSignOk ⟨1, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_02_neg : qcInnerLabels.all (qcSlotSignOk ⟨2, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_02_pos : qcInnerLabels.all (qcSlotSignOk ⟨2, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_03_neg : qcInnerLabels.all (qcSlotSignOk ⟨3, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_03_pos : qcInnerLabels.all (qcSlotSignOk ⟨3, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_04_neg : qcInnerLabels.all (qcSlotSignOk ⟨4, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_04_pos : qcInnerLabels.all (qcSlotSignOk ⟨4, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_05_neg : qcInnerLabels.all (qcSlotSignOk ⟨5, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_05_pos : qcInnerLabels.all (qcSlotSignOk ⟨5, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_06_neg : qcInnerLabels.all (qcSlotSignOk ⟨6, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_06_pos : qcInnerLabels.all (qcSlotSignOk ⟨6, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_07_neg : qcInnerLabels.all (qcSlotSignOk ⟨7, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_07_pos : qcInnerLabels.all (qcSlotSignOk ⟨7, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_08_neg : qcInnerLabels.all (qcSlotSignOk ⟨8, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_08_pos : qcInnerLabels.all (qcSlotSignOk ⟨8, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_09_neg : qcInnerLabels.all (qcSlotSignOk ⟨9, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_09_pos : qcInnerLabels.all (qcSlotSignOk ⟨9, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_10_neg : qcInnerLabels.all (qcSlotSignOk ⟨10, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_10_pos : qcInnerLabels.all (qcSlotSignOk ⟨10, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_11_neg : qcInnerLabels.all (qcSlotSignOk ⟨11, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_11_pos : qcInnerLabels.all (qcSlotSignOk ⟨11, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_12_neg : qcInnerLabels.all (qcSlotSignOk ⟨12, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_12_pos : qcInnerLabels.all (qcSlotSignOk ⟨12, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_13_neg : qcInnerLabels.all (qcSlotSignOk ⟨13, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_13_pos : qcInnerLabels.all (qcSlotSignOk ⟨13, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_14_neg : qcInnerLabels.all (qcSlotSignOk ⟨14, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_14_pos : qcInnerLabels.all (qcSlotSignOk ⟨14, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_15_neg : qcInnerLabels.all (qcSlotSignOk ⟨15, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_15_pos : qcInnerLabels.all (qcSlotSignOk ⟨15, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_16_neg : qcInnerLabels.all (qcSlotSignOk ⟨16, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_16_pos : qcInnerLabels.all (qcSlotSignOk ⟨16, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_17_neg : qcInnerLabels.all (qcSlotSignOk ⟨17, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_17_pos : qcInnerLabels.all (qcSlotSignOk ⟨17, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_18_neg : qcInnerLabels.all (qcSlotSignOk ⟨18, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_18_pos : qcInnerLabels.all (qcSlotSignOk ⟨18, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_19_neg : qcInnerLabels.all (qcSlotSignOk ⟨19, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_19_pos : qcInnerLabels.all (qcSlotSignOk ⟨19, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_20_neg : qcInnerLabels.all (qcSlotSignOk ⟨20, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_20_pos : qcInnerLabels.all (qcSlotSignOk ⟨20, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_21_neg : qcInnerLabels.all (qcSlotSignOk ⟨21, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_21_pos : qcInnerLabels.all (qcSlotSignOk ⟨21, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_22_neg : qcInnerLabels.all (qcSlotSignOk ⟨22, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_22_pos : qcInnerLabels.all (qcSlotSignOk ⟨22, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps_23_neg : qcInnerLabels.all (qcSlotSignOk ⟨23, by decide⟩ .neg) = true := by
  decide +kernel

private theorem qc_steps_23_pos : qcInnerLabels.all (qcSlotSignOk ⟨23, by decide⟩ .pos) = true := by
  decide +kernel

private theorem qc_steps (s : Fin 24) (σ : Sign) : qcInnerLabels.all (qcSlotSignOk s σ) = true := by
  match s, σ with
  | ⟨0, _⟩, .neg => exact qc_steps_00_neg
  | ⟨0, _⟩, .pos => exact qc_steps_00_pos
  | ⟨1, _⟩, .neg => exact qc_steps_01_neg
  | ⟨1, _⟩, .pos => exact qc_steps_01_pos
  | ⟨2, _⟩, .neg => exact qc_steps_02_neg
  | ⟨2, _⟩, .pos => exact qc_steps_02_pos
  | ⟨3, _⟩, .neg => exact qc_steps_03_neg
  | ⟨3, _⟩, .pos => exact qc_steps_03_pos
  | ⟨4, _⟩, .neg => exact qc_steps_04_neg
  | ⟨4, _⟩, .pos => exact qc_steps_04_pos
  | ⟨5, _⟩, .neg => exact qc_steps_05_neg
  | ⟨5, _⟩, .pos => exact qc_steps_05_pos
  | ⟨6, _⟩, .neg => exact qc_steps_06_neg
  | ⟨6, _⟩, .pos => exact qc_steps_06_pos
  | ⟨7, _⟩, .neg => exact qc_steps_07_neg
  | ⟨7, _⟩, .pos => exact qc_steps_07_pos
  | ⟨8, _⟩, .neg => exact qc_steps_08_neg
  | ⟨8, _⟩, .pos => exact qc_steps_08_pos
  | ⟨9, _⟩, .neg => exact qc_steps_09_neg
  | ⟨9, _⟩, .pos => exact qc_steps_09_pos
  | ⟨10, _⟩, .neg => exact qc_steps_10_neg
  | ⟨10, _⟩, .pos => exact qc_steps_10_pos
  | ⟨11, _⟩, .neg => exact qc_steps_11_neg
  | ⟨11, _⟩, .pos => exact qc_steps_11_pos
  | ⟨12, _⟩, .neg => exact qc_steps_12_neg
  | ⟨12, _⟩, .pos => exact qc_steps_12_pos
  | ⟨13, _⟩, .neg => exact qc_steps_13_neg
  | ⟨13, _⟩, .pos => exact qc_steps_13_pos
  | ⟨14, _⟩, .neg => exact qc_steps_14_neg
  | ⟨14, _⟩, .pos => exact qc_steps_14_pos
  | ⟨15, _⟩, .neg => exact qc_steps_15_neg
  | ⟨15, _⟩, .pos => exact qc_steps_15_pos
  | ⟨16, _⟩, .neg => exact qc_steps_16_neg
  | ⟨16, _⟩, .pos => exact qc_steps_16_pos
  | ⟨17, _⟩, .neg => exact qc_steps_17_neg
  | ⟨17, _⟩, .pos => exact qc_steps_17_pos
  | ⟨18, _⟩, .neg => exact qc_steps_18_neg
  | ⟨18, _⟩, .pos => exact qc_steps_18_pos
  | ⟨19, _⟩, .neg => exact qc_steps_19_neg
  | ⟨19, _⟩, .pos => exact qc_steps_19_pos
  | ⟨20, _⟩, .neg => exact qc_steps_20_neg
  | ⟨20, _⟩, .pos => exact qc_steps_20_pos
  | ⟨21, _⟩, .neg => exact qc_steps_21_neg
  | ⟨21, _⟩, .pos => exact qc_steps_21_pos
  | ⟨22, _⟩, .neg => exact qc_steps_22_neg
  | ⟨22, _⟩, .pos => exact qc_steps_22_pos
  | ⟨23, _⟩, .neg => exact qc_steps_23_neg
  | ⟨23, _⟩, .pos => exact qc_steps_23_pos
  | ⟨n + 24, h⟩, _ => exact absurd h (by omega)

private theorem qc_dock_occ (a : Fin 24) (σ : Sign) (r : Bool) : blOcc (qcDock a σ r) = 1 := by
  cases σ <;> cases r <;> revert a <;> decide

private theorem qc_walk_layer (s : Fin 24) (σ : Sign) (r : Bool) (l : Int × Bool) (hl : qcInner l) :
    fockHalfCoin (ket (qcLone s σ r l)) = blComboR (qcLone s σ r) (qcCoinW l) ∧
    fockBounceK (ket (qcLone s σ r l)) = blComboR (qcLone s σ r) (qcIdW l) ∧
    fockMPair (ket (qcLone s σ r l)) = blComboR (qcLone s σ r) (qcIdW l) ∧
    fockMeet (ket (qcLone s σ r l)) = blComboR (qcLone s σ r) (qcIdW l) := by
  have h := qc_steps s σ
  rw [List.all_eq_true] at h
  have hl' := h l (qc_inner_mem l hl)
  have hr : qcStepOk s σ r l = true := by
    simp only [qcSlotSignOk, Bool.and_eq_true] at hl'
    cases r
    · exact hl'.1
    · exact hl'.2
  simp only [qcStepOk, Bool.and_eq_true] at hr
  obtain ⟨⟨⟨h1, h2⟩, h3⟩, h4⟩ := hr
  exact ⟨qc_layer_of_ok fockHalfCoinUnit _ l _ h1, qc_layer_of_ok fockBounceKUnit _ l _ h2,
    qc_layer_of_ok fockMPairUnit _ l _ h3, qc_layer_of_ok fockMeetUnit _ l _ h4⟩

private theorem qc_lone_active (s : Fin 24) (σ : Sign) (r : Bool) (l : Int × Bool) (g : Mat5)
    (hg : g ∈ (qcLone s σ r l).activeDocks) : g = qcFrame s l.1 := by
  have h := (mem_activeDocks_iff _ g).mp hg
  unfold qcLone at h
  rw [lookup_setDock] at h
  by_cases e : g = qcFrame s l.1
  · exact e
  · rw [ite_eq_right e] at h; exact absurd rfl h

private theorem qc_one_combo {α : Type} (cf : α → HoneycombConfig) (l : α) :
    blComboR cf [(l, ⟨Ninth.one, 0⟩)] = ket (cf l) := by
  funext c
  show blToN ⟨Ninth.one, 0⟩ * ket (cf l) c + 0 = ket (cf l) c
  have e1 : blToN ⟨Ninth.one, 0⟩ = 1 := rfl
  rw [e1]; ring

private theorem qc_phi_lone (χ : ChiralInvariant) (hχ : BlSilent χ) (s : Fin 24) (σ : Sign) (r : Bool)
    (l : Int × Bool) : fockPhiOdd χ (ket (qcLone s σ r l)) = blComboR (qcLone s σ r) (qcIdW l) := by
  rw [show qcIdW l = [(l, ⟨Ninth.one, 0⟩)] from rfl, qc_one_combo]
  apply bl_phi_ket χ hχ
  intro g hg
  have eg := qc_lone_active s σ r l g hg
  subst eg
  unfold qcLone
  rw [lookup_setDock, ite_eq_left rfl, qc_dock_occ]
  decide

private theorem qc_stream_ket (c c' : HoneycombConfig) (h : streamConfig c = c') :
    fockStream (ket c) = ket c' := by
  have e : ∀ x : HoneycombConfig, blCombo [(x, 1)] = ket x := fun x => by
    funext y; show 1 * ket x y + 0 = ket x y; ring
  rw [← e c, bl_stream_combo, ← h]
  exact e _

/-- A layer step on labelled superpositions, labels in `P` going to labels in `Q`. -/
private theorem qc_stepG {α : Type} {f : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig}
    (hf : BLin f) (cf : α → HoneycombConfig) (G : α → List (α × NinthRaw6)) (P Q : α → Prop)
    (hT : ∀ l, P l → f (ket (cf l)) = blComboR cf (G l)) (hc : ∀ l, P l → ∀ q ∈ G l, Q q.1)
    (xs : List (α × NinthRaw6)) (hxs : ∀ p ∈ xs, P p.1) :
    f (blComboR cf xs) = blComboR cf (blApplyR G xs) ∧ ∀ p ∈ blApplyR G xs, Q p.1 := by
  refine ⟨bl_lin_comboR hf cf G xs fun p hp => hT p.1 (hxs p hp), ?_⟩
  intro p hp
  obtain ⟨q, hq, hpq⟩ := List.mem_flatMap.mp hp
  obtain ⟨r, hr, rfl⟩ := List.mem_map.mp hpq
  exact hc q.1 (hxs q hq) r hr

/-- One beat on a lone vibe, layer by layer (`Φ_odd, D, K, M_pair, M_meet, D, Φ_odd, S`). -/
def qcBeatW (l : Int × Bool) : List ((Int × Bool) × NinthRaw6) :=
  blApplyR qcStreamW (blApplyR qcIdW (blApplyR qcCoinW (blApplyR qcIdW (blApplyR qcIdW (blApplyR qcIdW
    (blApplyR qcCoinW (blApplyR qcIdW [(l, ⟨Ninth.one, 0⟩)])))))))

private theorem qc_inner_coin (l : Int × Bool) (hl : qcInner l) : ∀ q ∈ qcCoinW l, qcInner q.1 := by
  intro q hq
  simp only [qcCoinW, List.mem_cons, List.not_mem_nil, or_false] at hq
  rcases hq with rfl | rfl
  · exact hl
  · exact hl

private theorem qc_inner_id (l : Int × Bool) (hl : qcInner l) : ∀ q ∈ qcIdW l, qcInner q.1 := by
  intro q hq
  simp only [qcIdW, List.mem_cons, List.not_mem_nil, or_false] at hq
  rw [hq]; exact hl

private theorem qc_label_hop (l : Int × Bool) (hl : qcInner l) : ∀ q ∈ qcStreamW l, qcLabel q.1 := by
  obtain ⟨m, e⟩ := l
  obtain ⟨h1, h2⟩ := hl
  simp only at h1 h2
  intro q hq
  simp only [qcStreamW, List.mem_cons, List.not_mem_nil, or_false] at hq
  rw [hq]
  cases e
  · show -3 ≤ m + -1 ∧ m + -1 ≤ 3
    omega
  · show -3 ≤ m + 1 ∧ m + 1 ≤ 3
    omega

private theorem qc_lin_beat (χ : ChiralInvariant) : BLin (fockBeat χ) := by
  have h : BLin (fun ψ => fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK
      (fockHalfCoin (fockPhiOdd χ ψ)))))))) :=
    bl_lin_comp bl_lin_stream (bl_lin_comp (bl_lin_phi χ) (bl_lin_comp bl_lin_halfCoin
      (bl_lin_comp bl_lin_meet (bl_lin_comp bl_lin_mpair (bl_lin_comp bl_lin_bounce
        (bl_lin_comp bl_lin_halfCoin (bl_lin_phi χ)))))))
  exact h

-- [helper]
/-- The Lean beat on an inner lone vibe, for every slot, sign and role, is `qcBeatW`. -/
theorem qc_beat_lone (χ : ChiralInvariant) (hχ : BlSilent χ) (s : Fin 24) (σ : Sign) (r : Bool)
    (l : Int × Bool) (hl : qcInner l) :
    fockBeat χ (ket (qcLone s σ r l)) = blComboR (qcLone s σ r) (qcBeatW l) := by
  have hcoin := fun l hl => (qc_walk_layer s σ r l hl).1
  have hbounce := fun l hl => (qc_walk_layer s σ r l hl).2.1
  have hpair := fun l hl => (qc_walk_layer s σ r l hl).2.2.1
  have hmeet := fun l hl => (qc_walk_layer s σ r l hl).2.2.2
  have hstream : ∀ l, qcInner l →
      fockStream (ket (qcLone s σ r l)) = blComboR (qcLone s σ r) (qcStreamW l) := fun l hl => by
    rw [qc_stream_ket _ _ (qc_stream_hop s σ r l hl)]
    exact (qc_one_combo (qcLone s σ r) (qcHop l)).symm
  have h0 : ket (qcLone s σ r l) = blComboR (qcLone s σ r) [(l, ⟨Ninth.one, 0⟩)] :=
    (qc_one_combo (qcLone s σ r) l).symm
  have hx : ∀ p ∈ [(l, (⟨Ninth.one, 0⟩ : NinthRaw6))], qcInner p.1 := by
    intro p hp; rw [List.mem_singleton.mp hp]; exact hl
  have hphi : ∀ l, qcInner l → fockPhiOdd χ (ket (qcLone s σ r l)) = blComboR (qcLone s σ r) (qcIdW l) :=
    fun l _ => qc_phi_lone χ hχ s σ r l
  have s1 := qc_stepG (bl_lin_phi χ) (qcLone s σ r) qcIdW qcInner qcInner hphi qc_inner_id _ hx
  have s2 := qc_stepG bl_lin_halfCoin (qcLone s σ r) qcCoinW qcInner qcInner hcoin qc_inner_coin _ s1.2
  have s3 := qc_stepG bl_lin_bounce (qcLone s σ r) qcIdW qcInner qcInner hbounce qc_inner_id _ s2.2
  have s4 := qc_stepG bl_lin_mpair (qcLone s σ r) qcIdW qcInner qcInner hpair qc_inner_id _ s3.2
  have s5 := qc_stepG bl_lin_meet (qcLone s σ r) qcIdW qcInner qcInner hmeet qc_inner_id _ s4.2
  have s6 := qc_stepG bl_lin_halfCoin (qcLone s σ r) qcCoinW qcInner qcInner hcoin qc_inner_coin _ s5.2
  have s7 := qc_stepG (bl_lin_phi χ) (qcLone s σ r) qcIdW qcInner qcInner hphi qc_inner_id _ s6.2
  have s8 := qc_stepG bl_lin_stream (qcLone s σ r) qcStreamW qcInner qcLabel hstream qc_label_hop _ s7.2
  show fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin
    (fockPhiOdd χ (ket (qcLone s σ r l))))))))) = _
  rw [h0, s1.1, s2.1, s3.1, s4.1, s5.1, s6.1, s7.1, s8.1]
  rfl

/-! ## The lone walk to beat 3 -/

/-- Insert a labelled representative, adding it to an entry of the same label. -/
def qcInsertR {α : Type} [DecidableEq α] (p : α × NinthRaw6) : List (α × NinthRaw6) → List (α × NinthRaw6)
  | [] => [p]
  | q :: r => if q.1 = p.1 then (q.1, blRAdd q.2 p.2) :: r else q :: qcInsertR p r

/-- Merge repeated labels. -/
def qcMergeR {α : Type} [DecidableEq α] (xs : List (α × NinthRaw6)) : List (α × NinthRaw6) :=
  xs.foldr qcInsertR []

private theorem qc_insert_combo {α : Type} [DecidableEq α] (cf : α → HoneycombConfig) (p : α × NinthRaw6)
    (ys : List (α × NinthRaw6)) : blComboR cf (qcInsertR p ys) = blComboR cf (p :: ys) := by
  induction ys with
  | nil => rfl
  | cons q r ih =>
    funext c
    unfold qcInsertR
    split_ifs with h
    · show blToN (blRAdd q.2 p.2) * ket (cf q.1) c + blComboR cf r c =
        blToN p.2 * ket (cf p.1) c + (blToN q.2 * ket (cf q.1) c + blComboR cf r c)
      rw [bl_toN_add, h]; ring
    · show blToN q.2 * ket (cf q.1) c + blComboR cf (qcInsertR p r) c =
        blToN p.2 * ket (cf p.1) c + (blToN q.2 * ket (cf q.1) c + blComboR cf r c)
      rw [ih]
      show blToN q.2 * ket (cf q.1) c + (blToN p.2 * ket (cf p.1) c + blComboR cf r c) = _
      ring

private theorem qc_merge_combo {α : Type} [DecidableEq α] (cf : α → HoneycombConfig)
    (xs : List (α × NinthRaw6)) : blComboR cf (qcMergeR xs) = blComboR cf xs := by
  induction xs with
  | nil => rfl
  | cons p r ih =>
    show blComboR cf (qcInsertR p (qcMergeR r)) = _
    rw [qc_insert_combo]
    funext c
    show blToN p.2 * ket (cf p.1) c + blComboR cf (qcMergeR r) c = blToN p.2 * ket (cf p.1) c + blComboR cf r c
    rw [ih]

/-- The lone walk computed in Lean from `(0, true)`: one `qcBeatW` per beat, merged. -/
def qcWalkL : Nat → List ((Int × Bool) × NinthRaw6)
  | 0 => [(((0 : Int), true), ⟨Ninth.one, 0⟩)]
  | t + 1 => qcMergeR (blApplyR qcBeatW (qcWalkL t))

private theorem qc_walk_inner :
    (List.range 3).all (fun t => (qcWalkL t).all fun p => decide (qcInner p.1)) = true := by
  decide +kernel

private theorem qc_walk_labels :
    (List.range 4).all (fun t => (qcWalkL t).all fun p => decide (qcLabel p.1)) = true := by
  decide +kernel

/-- **The lone walk to beat 3.** For every silent `χ`, slot `s`, sign `σ` and role `r`, the Lean beat
    iterated `t ≤ 3` times on the lone vibe at the base dock on slot `s` is the Lean walk `qcWalkL t`
    on the line of `s` (coordinate `m` the dock `k_s^m`, `k_{opp s}^{-m}` below 0). Roles 0 and 1. -/
theorem thm_qc_lone_walk (χ : ChiralInvariant) (hχ : BlSilent χ) (s : Fin 24) (σ : Sign) (r : Bool) :
    ∀ t, t ≤ 3 → iter (fockBeat χ) t (ket (qcLone s σ r (0, true))) = blComboR (qcLone s σ r) (qcWalkL t)
  | 0, _ => (qc_one_combo (qcLone s σ r) ((0 : Int), true)).symm
  | t + 1, ht => by
    show fockBeat χ (iter (fockBeat χ) t (ket (qcLone s σ r (0, true)))) = _
    rw [thm_qc_lone_walk χ hχ s σ r t (by omega)]
    have hin := qc_walk_inner
    rw [List.all_eq_true] at hin
    have hint := hin t (List.mem_range.mpr (by omega))
    rw [List.all_eq_true] at hint
    rw [bl_lin_comboR (qc_lin_beat χ) (qcLone s σ r) qcBeatW (qcWalkL t)
      (fun p hp => qc_beat_lone χ hχ s σ r p.1 (of_decide_eq_true (hint p hp)))]
    exact (qc_merge_combo (qcLone s σ r) _).symm

/-! ## Distinct labels are distinct configurations -/

/-- The walk's coordinates. -/
def qcFrameRange : List Int := [-3, -2, -1, 0, 1, 2, 3]

/-- The frames of coordinates `-3 .. 3` on the line of `s` are distinct. -/
def qcFramesOk (s : Fin 24) : Bool :=
  qcFrameRange.all fun m => qcFrameRange.all fun m' => decide (m = m') || decide (qcFrame s m ≠ qcFrame s m')

private theorem qc_frames_00 : qcFramesOk ⟨0, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_01 : qcFramesOk ⟨1, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_02 : qcFramesOk ⟨2, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_03 : qcFramesOk ⟨3, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_04 : qcFramesOk ⟨4, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_05 : qcFramesOk ⟨5, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_06 : qcFramesOk ⟨6, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_07 : qcFramesOk ⟨7, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_08 : qcFramesOk ⟨8, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_09 : qcFramesOk ⟨9, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_10 : qcFramesOk ⟨10, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_11 : qcFramesOk ⟨11, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_12 : qcFramesOk ⟨12, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_13 : qcFramesOk ⟨13, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_14 : qcFramesOk ⟨14, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_15 : qcFramesOk ⟨15, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_16 : qcFramesOk ⟨16, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_17 : qcFramesOk ⟨17, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_18 : qcFramesOk ⟨18, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_19 : qcFramesOk ⟨19, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_20 : qcFramesOk ⟨20, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_21 : qcFramesOk ⟨21, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_22 : qcFramesOk ⟨22, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_23 : qcFramesOk ⟨23, by decide⟩ = true := by
  decide +kernel

private theorem qc_frames_distinct (s : Fin 24) : qcFramesOk s = true := by
  match s with
  | ⟨0, _⟩ => exact qc_frames_00
  | ⟨1, _⟩ => exact qc_frames_01
  | ⟨2, _⟩ => exact qc_frames_02
  | ⟨3, _⟩ => exact qc_frames_03
  | ⟨4, _⟩ => exact qc_frames_04
  | ⟨5, _⟩ => exact qc_frames_05
  | ⟨6, _⟩ => exact qc_frames_06
  | ⟨7, _⟩ => exact qc_frames_07
  | ⟨8, _⟩ => exact qc_frames_08
  | ⟨9, _⟩ => exact qc_frames_09
  | ⟨10, _⟩ => exact qc_frames_10
  | ⟨11, _⟩ => exact qc_frames_11
  | ⟨12, _⟩ => exact qc_frames_12
  | ⟨13, _⟩ => exact qc_frames_13
  | ⟨14, _⟩ => exact qc_frames_14
  | ⟨15, _⟩ => exact qc_frames_15
  | ⟨16, _⟩ => exact qc_frames_16
  | ⟨17, _⟩ => exact qc_frames_17
  | ⟨18, _⟩ => exact qc_frames_18
  | ⟨19, _⟩ => exact qc_frames_19
  | ⟨20, _⟩ => exact qc_frames_20
  | ⟨21, _⟩ => exact qc_frames_21
  | ⟨22, _⟩ => exact qc_frames_22
  | ⟨23, _⟩ => exact qc_frames_23
  | ⟨n + 24, h⟩ => exact absurd h (by omega)

private theorem qc_range_mem (m : Int) (h : -3 ≤ m ∧ m ≤ 3) : m ∈ qcFrameRange := by
  obtain ⟨h1, h2⟩ := h
  rcases (by omega : m = -3 ∨ m = -2 ∨ m = -1 ∨ m = 0 ∨ m = 1 ∨ m = 2 ∨ m = 3) with
    rfl | rfl | rfl | rfl | rfl | rfl | rfl <;> decide

private theorem qc_frame_inj (s : Fin 24) (m m' : Int) (hm : -3 ≤ m ∧ m ≤ 3) (hm' : -3 ≤ m' ∧ m' ≤ 3)
    (h : qcFrame s m = qcFrame s m') : m = m' := by
  have hd := qc_frames_distinct s
  unfold qcFramesOk at hd
  rw [List.all_eq_true] at hd
  have h1 := hd m (qc_range_mem m hm)
  rw [List.all_eq_true] at h1
  have h2 := h1 m' (qc_range_mem m' hm')
  simp only [Bool.or_eq_true, decide_eq_true_eq] at h2
  rcases h2 with e | e
  · exact e
  · exact absurd h e

private theorem qc_lone_inj (s : Fin 24) (σ : Sign) (r : Bool) (x y : Int × Bool) (hx : qcLabel x)
    (hy : qcLabel y) (h : qcLone s σ r x = qcLone s σ r y) : x = y := by
  obtain ⟨m, e⟩ := x
  obtain ⟨m', e'⟩ := y
  have hl := congrArg (fun c => c.lookup (qcFrame s m)) h
  simp only [qcLone] at hl
  rw [lookup_setDock, ite_eq_left rfl, lookup_setDock] at hl
  by_cases hf : qcFrame s m = qcFrame s m'
  · have e1 := qc_frame_inj s m m' hx hy hf
    rw [ite_eq_left hf] at hl
    have hs := congrFun hl (qcSlot s e)
    have e2 : qcSlot s e = qcSlot s e' := by
      by_contra hne
      simp [qcDock, hne] at hs
    have hne := (thm_24_facets_geometry.2.1 s).2
    have e3 : e = e' := by
      revert e2
      cases e <;> cases e' <;> intro e2
      · rfl
      · exact absurd e2 hne
      · exact absurd e2.symm hne
      · rfl
    rw [e1, e3]
  · rw [ite_eq_right hf, qc_v1_lookup] at hl
    have hs := congrFun hl (qcSlot s e)
    simp [qcDock, v1FullDock] at hs

private theorem qc_comboR_eval {α : Type} [DecidableEq α] (cf : α → HoneycombConfig) (P : α → Prop)
    (inj : ∀ x y, P x → P y → cf x = cf y → x = y) (xs : List (α × NinthRaw6)) (hx : ∀ p ∈ xs, P p.1)
    (j : α) (hj : P j) : blComboR cf xs (cf j) = blToN (blCoefR xs j) := by
  induction xs with
  | nil => rfl
  | cons p r ih =>
    have ih' := ih fun q hq => hx q (List.mem_cons_of_mem _ hq)
    show blToN p.2 * ket (cf p.1) (cf j) + blComboR cf r (cf j) =
      blToN (if p.1 = j then blRAdd p.2 (blCoefR r j) else blCoefR r j)
    by_cases hpj : p.1 = j
    · rw [bl_ket, ite_eq_left (by rw [hpj]), ih', ite_eq_left hpj, bl_toN_add]; ring
    · have hne : cf j ≠ cf p.1 := fun e => hpj (inj _ _ (hx p List.mem_cons_self) hj e.symm)
      rw [bl_ket, ite_eq_right hne, ih', ite_eq_right hpj]; ring

private theorem qc_comboR_off {α : Type} (cf : α → HoneycombConfig) (xs : List (α × NinthRaw6))
    (c : HoneycombConfig) (h : ∀ p ∈ xs, cf p.1 ≠ c) : blComboR cf xs c = 0 := by
  induction xs with
  | nil => rfl
  | cons p r ih =>
    show blToN p.2 * ket (cf p.1) c + blComboR cf r c = 0
    rw [bl_ket, ite_eq_right (fun e => h p List.mem_cons_self e.symm),
      ih fun q hq => h q (List.mem_cons_of_mem _ hq)]
    ring

/-! ## A17: a mixed state in every sector of one dock -/

/-- The two slots of line `j` (`lineA j`, `lineB j`) as naturals. -/
def qcLineSlots (j : Nat) : Nat × Nat := ((j / 2) * 4 + j % 2, (j / 2) * 4 + (3 - j % 2))

/-- `k` full lines from line `start` on, both slots of one sign and role 0: the first `plus` positive, the
    rest negative. -/
def qcFullLines (start k plus : Nat) : List (Nat × Bool × Bool) :=
  (List.range k).flatMap fun i =>
    [((qcLineSlots (start + i)).1, decide (i < plus), false), ((qcLineSlots (start + i)).2, decide (i < plus), false)]

/-- A dock of `n ≤ 23` excitations and charge `q`: one lone line (odd `n`) or two (even `n`), the rest full
    lines of one sign each. -/
def qcSectorVibes (n : Nat) (q : Int) : List (Nat × Bool × Bool) :=
  if n % 2 = 1 then
    let k := (n - 1) / 2
    let sg : Int := if (q - 1 - 2 * (k : Int)) % 4 = 0 then 1 else -1
    (0, decide (sg = 1), false) :: qcFullLines 1 k ((q - sg + 2 * (k : Int)) / 4).toNat
  else
    let k := (n - 2) / 2
    let L : Int := if (q - 2 * (k : Int)) % 4 = 0 then 0 else if 0 < q then 2 else -2
    let lone : List (Nat × Bool × Bool) :=
      if L = 2 then [(0, true, false), (1, true, false)]
      else if L = -2 then [(0, false, false), (1, false, false)] else [(0, true, false), (1, false, false)]
    lone ++ qcFullLines 2 k ((q - L + 2 * (k : Int)) / 4).toNat

/-- The lone vibe on slot 0 moved to its opposite slot 3. -/
def qcFlip0 : List (Nat × Bool × Bool) → List (Nat × Bool × Bool)
  | (0, t, r) :: rest => (3, t, r) :: rest
  | vs => vs

/-- The full dock (24 excitations) of charge `q`: whether it needs an opposite-sign line, the sign of line 0,
    and the same-sign full lines 1 to 10 or 11. -/
def qcFullDockParts (q : Int) : Bool × Bool × List (Nat × Bool × Bool) :=
  let opp := decide (q % 4 = 2)
  let sg := decide (0 ≤ q)
  let sgI : Int := if sg then 1 else -1
  let count := if opp then 10 else 11
  (opp, sg, qcFullLines 1 count ((q - 2 * sgI + 2 * (count : Int)) / 4).toNat)

/-- The full dock of charge `q`: line 0 of one sign with roles `(swapRoles, !swapRoles)` (`M_meet` mixes it),
    and line 11 of opposite signs when needed (`K` swaps it: `bounced`). -/
def qcFullDockVibes (q : Int) (swapRoles bounced : Bool) : List (Nat × Bool × Bool) :=
  let p := qcFullDockParts q
  (0, p.2.1, swapRoles) :: (3, p.2.1, !swapRoles) :: p.2.2 ++
    (if p.1 then (if bounced then [(21, false, false), (22, true, false)] else [(21, true, false), (22, false, false)])
     else [])

/-- The witness dock of sector `(q, n)`. -/
def qcSectorStart (n : Nat) (q : Int) : List (Nat × Bool × Bool) :=
  if n = 24 then qcFullDockVibes q false false else qcSectorVibes n q

/-- Two configurations the dock-local layers reach from the witness with nonzero amplitude. -/
def qcSectorImages (n : Nat) (q : Int) : List (Nat × Bool × Bool) × List (Nat × Bool × Bool) :=
  if n = 24 then (qcFullDockVibes q false true, qcFullDockVibes q true true)
  else (qcSectorVibes n q, qcFlip0 (qcSectorVibes n q))

/-- The five layers between the two `Φ_odd` of the beat: `D ∘ M_meet ∘ M_pair ∘ K ∘ D`. -/
def qcW (ψ : FockVec NinthLoc6 HoneycombConfig) : FockVec NinthLoc6 HoneycombConfig :=
  fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin ψ))))

/-- The kernel check of sector `(q, n)`: the witness has `n` excitations and charge `q`, and the two images
    are distinct and reached with nonzero amplitude. -/
def qcSectorOk (n : Nat) (q : Int) : Bool :=
  let vs := qcSectorStart n q
  let xs := qcSectorImages n q
  decide (blOcc (blDock vs) = n) && decide (fullDockCharge (blDock vs) = q) &&
    decide (blCfg xs.1 ≠ blCfg xs.2) &&
    decide (¬ NinthLoc6.isZero (qcW (ket (blCfg vs)) (blCfg xs.1))) &&
    decide (¬ NinthLoc6.isZero (qcW (ket (blCfg vs)) (blCfg xs.2)))

/-- The sectors of `n` excitations: charges `-n, -n + 2, ..., n`. -/
def qcSectorsN (n : Nat) : List (Nat × Int) := (List.range (n + 1)).map fun i : Nat => (n, 2 * (i : Int) - n)

private theorem qc_all_split {α : Type} (f : α → Bool) (l : List α) (k : Nat) (h : (l.take k).all f = true)
    (h' : (l.drop k).all f = true) : l.all f = true := by
  rw [← List.take_append_drop k l, List.all_append, h, h']
  rfl

private theorem qc_sector_01_0 :
    (qcSectorsN 1).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_01 : (qcSectorsN 1).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_sector_01_0

private theorem qc_sector_02_0 :
    (qcSectorsN 2).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_02 : (qcSectorsN 2).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_sector_02_0

private theorem qc_sector_03_0 :
    (List.take 3 (qcSectorsN 3)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_03_1 :
    (List.drop 3 (qcSectorsN 3)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_03 : (qcSectorsN 3).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_03_0 (qc_sector_03_1)

private theorem qc_sector_04_0 :
    (List.take 3 (qcSectorsN 4)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_04_1 :
    (List.drop 3 (qcSectorsN 4)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_04 : (qcSectorsN 4).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_04_0 (qc_sector_04_1)

private theorem qc_sector_05_0 :
    (List.take 3 (qcSectorsN 5)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_05_1 :
    (List.drop 3 (qcSectorsN 5)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_05 : (qcSectorsN 5).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_05_0 (qc_sector_05_1)

private theorem qc_sector_06_0 :
    (List.take 3 (qcSectorsN 6)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_06_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 6))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_06_2 :
    (List.drop 3 (List.drop 3 (qcSectorsN 6))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_06 : (qcSectorsN 6).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_06_0 (qc_all_split _ _ 3 qc_sector_06_1 (qc_sector_06_2))

private theorem qc_sector_07_0 :
    (List.take 3 (qcSectorsN 7)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_07_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 7))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_07_2 :
    (List.drop 3 (List.drop 3 (qcSectorsN 7))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_07 : (qcSectorsN 7).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_07_0 (qc_all_split _ _ 3 qc_sector_07_1 (qc_sector_07_2))

private theorem qc_sector_08_0 :
    (List.take 3 (qcSectorsN 8)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_08_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 8))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_08_2 :
    (List.drop 3 (List.drop 3 (qcSectorsN 8))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_08 : (qcSectorsN 8).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_08_0 (qc_all_split _ _ 3 qc_sector_08_1 (qc_sector_08_2))

private theorem qc_sector_09_0 :
    (List.take 3 (qcSectorsN 9)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_09_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 9))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_09_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 9)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_09_3 :
    (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 9)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_09 : (qcSectorsN 9).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_09_0 (qc_all_split _ _ 3 qc_sector_09_1 (qc_all_split _ _ 3 qc_sector_09_2 (qc_sector_09_3)))

private theorem qc_sector_10_0 :
    (List.take 3 (qcSectorsN 10)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_10_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 10))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_10_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 10)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_10_3 :
    (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 10)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_10 : (qcSectorsN 10).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_10_0 (qc_all_split _ _ 3 qc_sector_10_1 (qc_all_split _ _ 3 qc_sector_10_2 (qc_sector_10_3)))

private theorem qc_sector_11_0 :
    (List.take 3 (qcSectorsN 11)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_11_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 11))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_11_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 11)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_11_3 :
    (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 11)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_11 : (qcSectorsN 11).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_11_0 (qc_all_split _ _ 3 qc_sector_11_1 (qc_all_split _ _ 3 qc_sector_11_2 (qc_sector_11_3)))

private theorem qc_sector_12_0 :
    (List.take 3 (qcSectorsN 12)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_12_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 12))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_12_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 12)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_12_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 12))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_12_4 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 12))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_12 : (qcSectorsN 12).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_12_0 (qc_all_split _ _ 3 qc_sector_12_1 (qc_all_split _ _ 3 qc_sector_12_2 (qc_all_split _ _ 3 qc_sector_12_3 (qc_sector_12_4))))

private theorem qc_sector_13_0 :
    (List.take 3 (qcSectorsN 13)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_13_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 13))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_13_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 13)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_13_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 13))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_13_4 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 13))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_13 : (qcSectorsN 13).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_13_0 (qc_all_split _ _ 3 qc_sector_13_1 (qc_all_split _ _ 3 qc_sector_13_2 (qc_all_split _ _ 3 qc_sector_13_3 (qc_sector_13_4))))

private theorem qc_sector_14_0 :
    (List.take 3 (qcSectorsN 14)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_14_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 14))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_14_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 14)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_14_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 14))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_14_4 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 14))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_14 : (qcSectorsN 14).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_14_0 (qc_all_split _ _ 3 qc_sector_14_1 (qc_all_split _ _ 3 qc_sector_14_2 (qc_all_split _ _ 3 qc_sector_14_3 (qc_sector_14_4))))

private theorem qc_sector_15_0 :
    (List.take 3 (qcSectorsN 15)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_15_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 15))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_15_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 15)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_15_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 15))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_15_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 15)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_15_5 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 15)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_15 : (qcSectorsN 15).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_15_0 (qc_all_split _ _ 3 qc_sector_15_1 (qc_all_split _ _ 3 qc_sector_15_2 (qc_all_split _ _ 3 qc_sector_15_3 (qc_all_split _ _ 3 qc_sector_15_4 (qc_sector_15_5)))))

private theorem qc_sector_16_0 :
    (List.take 3 (qcSectorsN 16)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_16_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 16))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_16_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 16)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_16_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 16))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_16_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 16)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_16_5 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 16)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_16 : (qcSectorsN 16).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_16_0 (qc_all_split _ _ 3 qc_sector_16_1 (qc_all_split _ _ 3 qc_sector_16_2 (qc_all_split _ _ 3 qc_sector_16_3 (qc_all_split _ _ 3 qc_sector_16_4 (qc_sector_16_5)))))

private theorem qc_sector_17_0 :
    (List.take 3 (qcSectorsN 17)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_17_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 17))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_17_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 17)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_17_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 17))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_17_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 17)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_17_5 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 17)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_17 : (qcSectorsN 17).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_17_0 (qc_all_split _ _ 3 qc_sector_17_1 (qc_all_split _ _ 3 qc_sector_17_2 (qc_all_split _ _ 3 qc_sector_17_3 (qc_all_split _ _ 3 qc_sector_17_4 (qc_sector_17_5)))))

private theorem qc_sector_18_0 :
    (List.take 3 (qcSectorsN 18)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_18_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 18))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_18_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 18)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_18_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 18))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_18_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 18)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_18_5 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 18))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_18_6 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 18))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_18 : (qcSectorsN 18).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_18_0 (qc_all_split _ _ 3 qc_sector_18_1 (qc_all_split _ _ 3 qc_sector_18_2 (qc_all_split _ _ 3 qc_sector_18_3 (qc_all_split _ _ 3 qc_sector_18_4 (qc_all_split _ _ 3 qc_sector_18_5 (qc_sector_18_6))))))

private theorem qc_sector_19_0 :
    (List.take 3 (qcSectorsN 19)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_19_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 19))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_19_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 19)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_19_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 19))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_19_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 19)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_19_5 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 19))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_19_6 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 19))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_19 : (qcSectorsN 19).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_19_0 (qc_all_split _ _ 3 qc_sector_19_1 (qc_all_split _ _ 3 qc_sector_19_2 (qc_all_split _ _ 3 qc_sector_19_3 (qc_all_split _ _ 3 qc_sector_19_4 (qc_all_split _ _ 3 qc_sector_19_5 (qc_sector_19_6))))))

private theorem qc_sector_20_0 :
    (List.take 3 (qcSectorsN 20)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_20_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 20))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_20_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 20)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_20_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 20))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_20_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 20)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_20_5 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 20))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_20_6 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 20))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_20 : (qcSectorsN 20).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_20_0 (qc_all_split _ _ 3 qc_sector_20_1 (qc_all_split _ _ 3 qc_sector_20_2 (qc_all_split _ _ 3 qc_sector_20_3 (qc_all_split _ _ 3 qc_sector_20_4 (qc_all_split _ _ 3 qc_sector_20_5 (qc_sector_20_6))))))

private theorem qc_sector_21_0 :
    (List.take 3 (qcSectorsN 21)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_21_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 21))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_21_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 21)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_21_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 21))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_21_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 21)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_21_5 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 21))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_21_6 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 21)))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_21_7 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 21)))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_21 : (qcSectorsN 21).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_21_0 (qc_all_split _ _ 3 qc_sector_21_1 (qc_all_split _ _ 3 qc_sector_21_2 (qc_all_split _ _ 3 qc_sector_21_3 (qc_all_split _ _ 3 qc_sector_21_4 (qc_all_split _ _ 3 qc_sector_21_5 (qc_all_split _ _ 3 qc_sector_21_6 (qc_sector_21_7)))))))

private theorem qc_sector_22_0 :
    (List.take 3 (qcSectorsN 22)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_22_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 22))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_22_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 22)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_22_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 22))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_22_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 22)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_22_5 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 22))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_22_6 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 22)))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_22_7 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 22)))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_22 : (qcSectorsN 22).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_22_0 (qc_all_split _ _ 3 qc_sector_22_1 (qc_all_split _ _ 3 qc_sector_22_2 (qc_all_split _ _ 3 qc_sector_22_3 (qc_all_split _ _ 3 qc_sector_22_4 (qc_all_split _ _ 3 qc_sector_22_5 (qc_all_split _ _ 3 qc_sector_22_6 (qc_sector_22_7)))))))

private theorem qc_sector_23_0 :
    (List.take 3 (qcSectorsN 23)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_23_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 23))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_23_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 23)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_23_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 23))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_23_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 23)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_23_5 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 23))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_23_6 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 23)))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_23_7 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 23)))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_23 : (qcSectorsN 23).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_23_0 (qc_all_split _ _ 3 qc_sector_23_1 (qc_all_split _ _ 3 qc_sector_23_2 (qc_all_split _ _ 3 qc_sector_23_3 (qc_all_split _ _ 3 qc_sector_23_4 (qc_all_split _ _ 3 qc_sector_23_5 (qc_all_split _ _ 3 qc_sector_23_6 (qc_sector_23_7)))))))

private theorem qc_sector_24_0 :
    (List.take 3 (qcSectorsN 24)).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24_1 :
    (List.take 3 (List.drop 3 (qcSectorsN 24))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24_2 :
    (List.take 3 (List.drop 3 (List.drop 3 (qcSectorsN 24)))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24_3 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 24))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24_4 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 24)))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24_5 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 24))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24_6 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 24)))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24_7 :
    (List.take 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 24))))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24_8 :
    (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (List.drop 3 (qcSectorsN 24))))))))).all (fun p => qcSectorOk p.1 p.2) = true := by
  decide +kernel

private theorem qc_sector_24 : (qcSectorsN 24).all (fun p => qcSectorOk p.1 p.2) = true :=
  qc_all_split _ _ 3 qc_sector_24_0 (qc_all_split _ _ 3 qc_sector_24_1 (qc_all_split _ _ 3 qc_sector_24_2 (qc_all_split _ _ 3 qc_sector_24_3 (qc_all_split _ _ 3 qc_sector_24_4 (qc_all_split _ _ 3 qc_sector_24_5 (qc_all_split _ _ 3 qc_sector_24_6 (qc_all_split _ _ 3 qc_sector_24_7 (qc_sector_24_8))))))))

private theorem qc_sectors (n : Nat) (h1 : 1 ≤ n) (h2 : n ≤ 24) :
    (qcSectorsN n).all (fun p => qcSectorOk p.1 p.2) = true := by
  rcases (by omega : n = 1 ∨ n = 2 ∨ n = 3 ∨ n = 4 ∨ n = 5 ∨ n = 6 ∨ n = 7 ∨ n = 8 ∨ n = 9 ∨ n = 10 ∨ n = 11 ∨ n = 12 ∨ n = 13 ∨ n = 14 ∨ n = 15 ∨ n = 16 ∨ n = 17 ∨ n = 18 ∨ n = 19 ∨ n = 20 ∨ n = 21 ∨ n = 22 ∨ n = 23 ∨ n = 24) with rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl
  · exact qc_sector_01
  · exact qc_sector_02
  · exact qc_sector_03
  · exact qc_sector_04
  · exact qc_sector_05
  · exact qc_sector_06
  · exact qc_sector_07
  · exact qc_sector_08
  · exact qc_sector_09
  · exact qc_sector_10
  · exact qc_sector_11
  · exact qc_sector_12
  · exact qc_sector_13
  · exact qc_sector_14
  · exact qc_sector_15
  · exact qc_sector_16
  · exact qc_sector_17
  · exact qc_sector_18
  · exact qc_sector_19
  · exact qc_sector_20
  · exact qc_sector_21
  · exact qc_sector_22
  · exact qc_sector_23
  · exact qc_sector_24

/-! ## The beat at a streamed configuration, for every chiral invariant -/

/-- The `Φ_odd` phase of configuration `x` over a list of docks. -/
def qcPhaseList (χ : ChiralInvariant) (x : HoneycombConfig) : List Mat5 → NinthLoc6
  | [] => 1
  | g :: gs => NinthLoc6.zeta6Pow (dockParity g * χ.chi (x.lookup g)) * qcPhaseList χ x gs

/-- The `Φ_odd` phase of configuration `x`: the product over its docks. -/
def qcPhase (χ : ChiralInvariant) (x : HoneycombConfig) : NinthLoc6 := qcPhaseList χ x x.activeDocks

private theorem qc_phase_sites (χ : ChiralInvariant) (x : HoneycombConfig) (ψ : FockVec NinthLoc6 HoneycombConfig) :
    ∀ gs : List Mat5, applySites (phiOddFamily χ) gs ψ x = qcPhaseList χ x gs * ψ x
  | [] => by show ψ x = 1 * ψ x; ring
  | g :: gs => by
    show (sitePhiOddUnit χ g).op (applySites (phiOddFamily χ) gs ψ) x = _
    rw [sitePhiOddUnit_op, qc_phase_sites χ x ψ gs]
    show NinthLoc6.zeta6Pow _ * (qcPhaseList χ x gs * ψ x) =
      NinthLoc6.zeta6Pow (dockParity g * χ.chi (x.lookup g)) * qcPhaseList χ x gs * ψ x
    ring

private theorem qc_phase_unit (χ : ChiralInvariant) (x : HoneycombConfig) :
    ∀ gs : List Mat5, ∃ p : NinthLoc6, p * qcPhaseList χ x gs = 1
  | [] => ⟨1, by show (1 : NinthLoc6) * 1 = 1; ring⟩
  | g :: gs => by
    obtain ⟨p, hp⟩ := qc_phase_unit χ x gs
    have hz : NinthLoc6.conj (NinthLoc6.zeta6Pow (dockParity g * χ.chi (x.lookup g))) *
        NinthLoc6.zeta6Pow (dockParity g * χ.chi (x.lookup g)) = 1 :=
      (thm_fock_ring_and_gate_identities.2.2.2.2.2.2.2.1 (dockParity g * χ.chi (x.lookup g))).1
    refine ⟨NinthLoc6.conj (NinthLoc6.zeta6Pow (dockParity g * χ.chi (x.lookup g))) * p, ?_⟩
    show _ * (NinthLoc6.zeta6Pow (dockParity g * χ.chi (x.lookup g)) * qcPhaseList χ x gs) = 1
    calc _ = (NinthLoc6.conj (NinthLoc6.zeta6Pow (dockParity g * χ.chi (x.lookup g))) *
          NinthLoc6.zeta6Pow (dockParity g * χ.chi (x.lookup g))) * (p * qcPhaseList χ x gs) := by ring
      _ = 1 := by rw [hz, hp]; ring

-- [helper]
theorem qc_phi_eval (χ : ChiralInvariant) (ψ : FockVec NinthLoc6 HoneycombConfig) (x : HoneycombConfig) :
    fockPhiOdd χ ψ x = qcPhase χ x * ψ x :=
  qc_phase_sites χ x ψ x.activeDocks

private theorem qc_lin_W : BLin qcW := by
  have h : BLin (fun ψ => fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin ψ))))) :=
    bl_lin_comp bl_lin_halfCoin (bl_lin_comp bl_lin_meet (bl_lin_comp bl_lin_mpair
      (bl_lin_comp bl_lin_bounce bl_lin_halfCoin)))
  exact h

-- [helper]
/-- The beat's amplitude at a streamed configuration `S x` is the amplitude of the five middle layers at
    `x` times two `Φ_odd` phases, for every chiral invariant. -/
theorem qc_beat_at_stream (χ : ChiralInvariant) (c x : HoneycombConfig) :
    fockBeat χ (ket c) (streamConfig x) = qcPhase χ x * (qcPhase χ c * qcW (ket c) x) := by
  rw [gen_bare_beat_layers_eq.2.2 χ (ket c), fockStream_eval, (thm_fock_honeycomb_config_symmetries x).1,
    qc_phi_eval]
  have hphi : fockPhiOdd χ (ket c) = fun z => qcPhase χ c * ket c z + (fun _ => (0 : NinthLoc6)) z := by
    funext z
    rw [qc_phi_eval]
    by_cases hz : z = c
    · subst hz
      show qcPhase χ z * ket z z = qcPhase χ z * ket z z + 0
      ring
    · rw [bl_ket, ite_eq_right hz]
      show qcPhase χ z * 0 = qcPhase χ c * 0 + 0
      ring
  rw [hphi]
  show qcPhase χ x * qcW (fun z => qcPhase χ c * ket c z + (fun _ => (0 : NinthLoc6)) z) x = _
  rw [qc_lin_W, bl_lin_zero qc_lin_W]
  show qcPhase χ x * (qcPhase χ c * qcW (ket c) x + 0) = _
  ring

-- [helper]
theorem qc_ne_zero_of_not_isZero (x : NinthLoc6) (h : ¬ NinthLoc6.isZero x) : x ≠ 0 := by
  intro e
  apply h
  rw [e]
  exact rfl

-- [helper]
/-- A nonzero amplitude of the five middle layers at `x` is a nonzero amplitude of the beat at `S x`. -/
theorem qc_beat_ne_zero (χ : ChiralInvariant) (c x : HoneycombConfig) (h : qcW (ket c) x ≠ 0) :
    fockBeat χ (ket c) (streamConfig x) ≠ 0 := by
  rw [qc_beat_at_stream]
  obtain ⟨p, hp⟩ := qc_phase_unit χ x x.activeDocks
  obtain ⟨p', hp'⟩ := qc_phase_unit χ c c.activeDocks
  have hp1 : p * qcPhase χ x = 1 := hp
  have hp2 : p' * qcPhase χ c = 1 := hp'
  intro e
  apply h
  calc qcW (ket c) x = (p * qcPhase χ x) * ((p' * qcPhase χ c) * qcW (ket c) x) := by rw [hp1, hp2]; ring
    _ = (p * p') * (qcPhase χ x * (qcPhase χ c * qcW (ket c) x)) := by ring
    _ = 0 := by rw [e]; ring

/-- `W` is monomial on the basis state `c`: its image lies on one basis configuration. -/
def QcMonomialAt (W : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig)
    (c : HoneycombConfig) : Prop :=
  ∃ y : HoneycombConfig, ∀ x, x ≠ y → W (ket c) x = 0

/-- **A17, U is monomial only on the vacuum sector (Q6).** For every chiral invariant: `U` fixes the vacuum
    (so it is monomial there), and every sector of `n` excitations with `1 ≤ n ≤ 24` and charge `q`
    (`|q| ≤ n`, `q ≡ n mod 2`) holds a one-dock state whose image `U |c⟩` has two basis configurations
    with nonzero amplitude. Roles 0 and 1 (the Lean Fock model). -/
theorem thm_qc_monomial_only_vacuum (χ : ChiralInvariant) :
    fockBeat χ (ket v1Config) = ket v1Config ∧ QcMonomialAt (fockBeat χ) v1Config ∧
    ∀ (n : Nat) (q : Int), 1 ≤ n → n ≤ 24 → q.natAbs ≤ n → (q + n) % 2 = 0 →
      ∃ d : FullDock, blOcc d = n ∧ fullDockCharge d = q ∧
        ¬ QcMonomialAt (fockBeat χ) (v1Config.setDock mat5Id d) := by
  have hv := (thm_fock_v1_quantum_stationarity χ).1
  refine ⟨hv, ⟨v1Config, fun x hx => by rw [hv, bl_ket, ite_eq_right hx]⟩, ?_⟩
  intro n q h1 h2 hq hpar
  have hmem : (n, q) ∈ qcSectorsN n := by
    unfold qcSectorsN
    refine List.mem_map.mpr ⟨((q + n) / 2).toNat, List.mem_range.mpr (by omega), ?_⟩
    have e : 2 * ((((q + n) / 2).toNat : Nat) : Int) - n = q := by omega
    rw [e]
  have hok := qc_sectors n h1 h2
  rw [List.all_eq_true] at hok
  have hs := hok _ hmem
  simp only [qcSectorOk, Bool.and_eq_true, decide_eq_true_eq] at hs
  obtain ⟨⟨⟨⟨hocc, hch⟩, hne⟩, hz1⟩, hz2⟩ := hs
  refine ⟨blDock (qcSectorStart n q), hocc, hch, ?_⟩
  rintro ⟨y, hy⟩
  have a1 := qc_beat_ne_zero χ _ _ (qc_ne_zero_of_not_isZero _ hz1)
  have a2 := qc_beat_ne_zero χ _ _ (qc_ne_zero_of_not_isZero _ hz2)
  have e1 : streamConfig (blCfg (qcSectorImages n q).1) = y := by
    by_contra h
    exact a1 (hy _ h)
  have e2 : streamConfig (blCfg (qcSectorImages n q).2) = y := by
    by_contra h
    exact a2 (hy _ h)
  apply hne
  have h3 := congrArg streamConfigInv (e1.trans e2.symm)
  rwa [(thm_fock_honeycomb_config_symmetries _).1, (thm_fock_honeycomb_config_symmetries _).1] at h3

/-! ## A16: no dock map that sees a lone vibe makes `U`, `U^2` or `U^3` a function -/

/-- The coarse image of a configuration under a dock map `τ`, dock by dock (in each dock's own frame). -/
def qcCoarse {α : Type} (τ : FullDock → α) (c : HoneycombConfig) : Mat5 → α := fun g => τ (c.lookup g)

/-- `W` is a function on coarse states: basis states of one coarse image reach (with nonzero amplitude) only
    configurations of one coarse image. This is what classical-boundary.ts's `coarseRelation` reads as
    deterministic. -/
def QcCoarseFunction {α : Type} (τ : FullDock → α)
    (W : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ c c' x x', qcCoarse τ c = qcCoarse τ c' → W (ket c) x ≠ 0 → W (ket c') x' ≠ 0 → qcCoarse τ x = qcCoarse τ x'

/-- One basis state `c` reaches two configurations of different coarse images. -/
def QcBranches {α : Type} (τ : FullDock → α)
    (W : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig) : Prop :=
  ∃ x y, W (ket c) x ≠ 0 ∧ W (ket c) y ≠ 0 ∧ qcCoarse τ x ≠ qcCoarse τ y

-- [helper]
theorem qc_not_function_of_branches {α : Type} (τ : FullDock → α)
    (W : FockVec NinthLoc6 HoneycombConfig → FockVec NinthLoc6 HoneycombConfig) (c : HoneycombConfig)
    (h : QcBranches τ W c) : ¬ QcCoarseFunction τ W := by
  obtain ⟨x, y, hx, hy, hxy⟩ := h
  intro hF
  exact hxy (hF c c x y rfl hx hy)

private theorem qc_toN_ne_zero (a : NinthRaw6) (h : a.num ≠ Ninth.zero) : blToN a ≠ 0 := by
  intro e
  apply h
  have hz : NinthLoc6.isZero (blToN a) := by rw [e]; exact rfl
  exact hz

private theorem qc_walk_ends : (List.range' 1 3).all (fun t =>
    decide ((blCoefR (qcWalkL t) ((t : Int), true)).num ≠ Ninth.zero) &&
    decide ((blCoefR (qcWalkL t) (-(t : Int), false)).num ≠ Ninth.zero)) = true := by
  decide +kernel

private theorem qc_walk_labels_at (t : Nat) (ht : t ≤ 3) : ∀ p ∈ qcWalkL t, qcLabel p.1 := by
  have h := qc_walk_labels
  rw [List.all_eq_true] at h
  have h' := h t (List.mem_range.mpr (by omega))
  rw [List.all_eq_true] at h'
  exact fun p hp => of_decide_eq_true (h' p hp)

/-- **A16, the branch (Q6).** For every silent `χ`, every dock map `τ` (any target type) that tells a lone
    vibe `(σ, r)` on slot `a` from an empty dock, and `t = 1, 2, 3`: `U^t` of that lone vibe at the base dock
    reaches, with nonzero amplitude, the vibe `t` docks on along `a` (slot `a`) and the vibe `t` docks back
    (slot `opp a`), whose coarse images differ at the dock `k_a^t`. Roles 0 and 1. -/
theorem thm_qc_lone_branch (χ : ChiralInvariant) (hχ : BlSilent χ) {α : Type} (τ : FullDock → α) (a : Fin 24)
    (σ : Sign) (r : Bool) (hsee : τ (qcDock a σ r) ≠ τ v1FullDock) (t : Nat) (h1 : 1 ≤ t) (h3 : t ≤ 3) :
    QcBranches τ (iter (fockBeat χ) t) (v1Config.setDock mat5Id (qcDock a σ r)) := by
  have e0 : v1Config.setDock mat5Id (qcDock a σ r) = qcLone a σ r (0, true) := rfl
  rw [e0]
  have hw := thm_qc_lone_walk χ hχ a σ r t h3
  have hlab := qc_walk_labels_at t h3
  have he := qc_walk_ends
  rw [List.all_eq_true] at he
  have he' := he t (List.mem_range'_1.mpr ⟨h1, by omega⟩)
  simp only [Bool.and_eq_true, decide_eq_true_eq] at he'
  have lx : qcLabel ((t : Int), true) := ⟨by show (-3 : Int) ≤ t; omega, by show (t : Int) ≤ 3; omega⟩
  have ly : qcLabel (-(t : Int), false) := ⟨by show (-3 : Int) ≤ -(t : Int); omega, by show -(t : Int) ≤ 3; omega⟩
  have hfr : qcFrame a (t : Int) ≠ qcFrame a (-(t : Int)) := fun e => by
    have := qc_frame_inj a _ _ lx ly e
    omega
  refine ⟨qcLone a σ r ((t : Int), true), qcLone a σ r (-(t : Int), false), ?_, ?_, ?_⟩
  · rw [hw, qc_comboR_eval (qcLone a σ r) qcLabel (qc_lone_inj a σ r) _ hlab _ lx]
    exact qc_toN_ne_zero _ he'.1
  · rw [hw, qc_comboR_eval (qcLone a σ r) qcLabel (qc_lone_inj a σ r) _ hlab _ ly]
    exact qc_toN_ne_zero _ he'.2
  · intro hc
    have h := congrFun hc (qcFrame a t)
    simp only [qcCoarse, qcLone] at h
    rw [lookup_setDock, ite_eq_left rfl, lookup_setDock, ite_eq_right hfr, qc_v1_lookup] at h
    exact hsee h

/-- **A16, the no-go (Q6).** For every silent `χ`, no dock map that tells some lone vibe from an empty dock
    makes `U`, `U^2` or `U^3` a function on coarse states. Roles 0 and 1. -/
theorem thm_qc_coarse_nogo (χ : ChiralInvariant) (hχ : BlSilent χ) {α : Type} (τ : FullDock → α)
    (hsee : ∃ a σ r, τ (qcDock a σ r) ≠ τ v1FullDock) (t : Nat) (h1 : 1 ≤ t) (h3 : t ≤ 3) :
    ¬ QcCoarseFunction τ (iter (fockBeat χ) t) := by
  obtain ⟨a, σ, r, h⟩ := hsee
  exact qc_not_function_of_branches τ _ _ (thm_qc_lone_branch χ hχ τ a σ r h t h1 h3)

private theorem qc_id_transport : ∀ s : Fin 24, mat5Mul mat5Id (transport s) = transport s := by
  decide +kernel

private theorem qc_walk_one : (qcWalkL 1).map Prod.fst = [((1 : Int), true), (-1, false)] ∧
    NinthLoc6.isZero (NinthLoc6.sub (blToN (blCoefR (qcWalkL 1) ((1 : Int), true))) NinthLoc6.fullCoinDiag) ∧
    NinthLoc6.isZero (NinthLoc6.sub (blToN (blCoefR (qcWalkL 1) ((-1 : Int), false))) NinthLoc6.fullCoinOff) := by
  decide +kernel

/-- **A16, the split (Q6).** For every silent `χ` and every lone vibe `(σ, r)` on slot `a` of the base dock,
    `U` sends it to `k` times the vibe on slot `a` of the neighbour `k_a` plus `f` times the vibe on slot
    `opp a` of the neighbour `k_{opp a}`, and to nothing else, with `k = fullCoinDiag = ζ_6 / 2` and
    `f = fullCoinOff = (1 - ω) / 2` for every slot, sign and role; the two configurations differ, and the
    dephased weights are `|k|² = 1/4` (step on) and `|f|² = 3/4` (turn back). Roles 0 and 1. -/
theorem thm_qc_lone_split (χ : ChiralInvariant) (hχ : BlSilent χ) (a : Fin 24) (σ : Sign) (r : Bool) :
    fockBeat χ (ket (v1Config.setDock mat5Id (qcDock a σ r))) (v1Config.setDock (transport a) (qcDock a σ r)) =
      NinthLoc6.fullCoinDiag ∧
    fockBeat χ (ket (v1Config.setDock mat5Id (qcDock a σ r)))
      (v1Config.setDock (transport (oppSlot a)) (qcDock (oppSlot a) σ r)) = NinthLoc6.fullCoinOff ∧
    (∀ c, c ≠ v1Config.setDock (transport a) (qcDock a σ r) →
      c ≠ v1Config.setDock (transport (oppSlot a)) (qcDock (oppSlot a) σ r) →
      fockBeat χ (ket (v1Config.setDock mat5Id (qcDock a σ r))) c = 0) ∧
    v1Config.setDock (transport a) (qcDock a σ r) ≠
      v1Config.setDock (transport (oppSlot a)) (qcDock (oppSlot a) σ r) ∧
    NinthLoc6.mul (NinthLoc6.conj NinthLoc6.fullCoinDiag) NinthLoc6.fullCoinDiag = QuantumBoundary.quarter ∧
    NinthLoc6.mul (NinthLoc6.conj NinthLoc6.fullCoinOff) NinthLoc6.fullCoinOff =
      QuantumBoundary.threeQuarters := by
  have hX : qcLone a σ r ((1 : Int), true) = v1Config.setDock (transport a) (qcDock a σ r) := by
    show v1Config.setDock (mat5Mul mat5Id (transport a)) (qcDock a σ r) = _
    rw [qc_id_transport]
  have hY : qcLone a σ r ((-1 : Int), false) =
      v1Config.setDock (transport (oppSlot a)) (qcDock (oppSlot a) σ r) := by
    show v1Config.setDock (mat5Mul mat5Id (transport (oppSlot a))) (qcDock (oppSlot a) σ r) = _
    rw [qc_id_transport]
  have hw : fockBeat χ (ket (v1Config.setDock mat5Id (qcDock a σ r))) = blComboR (qcLone a σ r) (qcWalkL 1) :=
    thm_qc_lone_walk χ hχ a σ r 1 (by omega)
  have hlab := qc_walk_labels_at 1 (by omega)
  obtain ⟨hfst, hk, hf⟩ := qc_walk_one
  have l1 : qcLabel ((1 : Int), true) := ⟨by decide, by decide⟩
  have l2 : qcLabel ((-1 : Int), false) := ⟨by decide, by decide⟩
  have hne : qcLone a σ r ((1 : Int), true) ≠ qcLone a σ r ((-1 : Int), false) := fun e => by
    have h := qc_lone_inj a σ r _ _ l1 l2 e
    simp at h
  refine ⟨?_, ?_, ?_, ?_, QuantumBoundary.thm_q_dephased_line_coin.2.2.1,
    QuantumBoundary.thm_q_dephased_line_coin.2.2.2.1⟩
  · rw [hw, ← hX, qc_comboR_eval (qcLone a σ r) qcLabel (qc_lone_inj a σ r) _ hlab _ l1]
    exact bl_eq_of_isZero hk
  · rw [hw, ← hY, qc_comboR_eval (qcLone a σ r) qcLabel (qc_lone_inj a σ r) _ hlab _ l2]
    exact bl_eq_of_isZero hf
  · intro c hc1 hc2
    rw [hw]
    apply qc_comboR_off
    intro p hp e
    have hm : p.1 ∈ (qcWalkL 1).map Prod.fst := List.mem_map_of_mem hp
    rw [hfst] at hm
    simp only [List.mem_cons, List.not_mem_nil, or_false] at hm
    rcases hm with h | h
    · rw [h, hX] at e; exact hc1 e.symm
    · rw [h, hY] at e; exact hc2 e.symm
  · rw [← hX, ← hY]; exact hne

/-- **The one-excitation targets (Q6).** The 24 neighbours `k_s` of the base dock are distinct, so the
    `k`-terms of the 24 lone vibes land on 24 different docks; and `k² - f²` and `k f` are nonzero, so on a
    line the two one-dock vectors `k e_s - f e_opp` and `f e_s - k e_opp` are independent. -/
theorem thm_qc_lone_targets :
    ((List.finRange 24).map transport).Nodup ∧
    NinthLoc6.sub (NinthLoc6.mul NinthLoc6.fullCoinDiag NinthLoc6.fullCoinDiag)
      (NinthLoc6.mul NinthLoc6.fullCoinOff NinthLoc6.fullCoinOff) ≠ 0 ∧
    NinthLoc6.mul NinthLoc6.fullCoinDiag NinthLoc6.fullCoinOff ≠ 0 :=
  ⟨by decide +kernel, qc_ne_zero_of_not_isZero _ (by decide +kernel),
    qc_ne_zero_of_not_isZero _ (by decide +kernel)⟩

/-! ## B8: the four declared tone maps of Q6 -/

/-- The tone of the sign of an integer. -/
def qcSignTone (x : Int) : Tone := if 0 < x then .pos else if x < 0 then .neg else .zero

/-- `netSign`: the sign of the dock's net charge. -/
def qcNetSign (d : FullDock) : Tone := qcSignTone (fullDockCharge d)

/-- `netResidue`: the dock's net charge mod 3, balanced. -/
def qcNetResidue (d : FullDock) : Tone :=
  if fullDockCharge d % 3 = 1 then .pos else if fullDockCharge d % 3 = 2 then .neg else .zero

/-- The net charge on the doubly occupied lines of a dock. -/
def qcPairedCharge (d : FullDock) : Int :=
  (List.finRange 12).foldl (fun acc l =>
    acc + (if d (lineA l) ≠ .empty ∧ d (lineB l) ≠ .empty then (d (lineA l)).charge + (d (lineB l)).charge
      else 0)) 0

/-- `pairedSign`: the sign of the net charge on doubly occupied lines only (blind to lone vibes). -/
def qcPairedSign (d : FullDock) : Tone := qcSignTone (qcPairedCharge d)

/-- `lowestSlotTone`: the tone of the occupied slot of lowest index, `0` for an empty dock. -/
def qcLowestSlotTone (d : FullDock) : Tone :=
  match (List.finRange 24).find? (fun s => decide (d s ≠ .empty)) with
  | some s => (d s).tone
  | none => .zero

/-- A tone as the digit `tone + 1`. -/
def qcToneCode : Tone → Nat
  | .neg => 0
  | .zero => 1
  | .pos => 2

/-- The four maps of a dock as one base-3 code, in the exporter's order. -/
def qcMapCode (d : FullDock) : Nat :=
  qcToneCode (qcNetSign d) + 3 * qcToneCode (qcNetResidue d) + 9 * qcToneCode (qcPairedSign d) +
    27 * qcToneCode (qcLowestSlotTone d)

/-- Every one- and two-excitation dock state of role 0, in the exporter's order. -/
def qcMapFamily : List (List (Nat × Bool × Bool)) :=
  ((List.range 24).flatMap fun s => [[(s, true, false)], [(s, false, false)]]) ++
    (List.range 24).flatMap fun a => ((List.range 24).filter fun b => decide (a < b)).flatMap fun b =>
      [[(a, true, false), (b, true, false)], [(a, true, false), (b, false, false)],
        [(a, false, false), (b, true, false)], [(a, false, false), (b, false, false)]]

private theorem qc_map_split {α β : Type} (f : α → β) (l : List α) (m : List β) (k : Nat)
    (h : (l.take k).map f = m.take k) (h' : (l.drop k).map f = m.drop k) : l.map f = m := by
  rw [← List.take_append_drop k l, ← List.take_append_drop k m, List.map_append, h, h']

private theorem qc_maps_00 :
    (List.take 48 (qcMapFamily)).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (Generated.quantumCoarseMapCodes)) := by
  decide +kernel

private theorem qc_maps_01 :
    (List.take 48 (List.drop 48 (qcMapFamily))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (Generated.quantumCoarseMapCodes))) := by
  decide +kernel

private theorem qc_maps_02 :
    (List.take 48 (List.drop 48 (List.drop 48 (qcMapFamily)))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))) := by
  decide +kernel

private theorem qc_maps_03 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))) := by
  decide +kernel

private theorem qc_maps_04 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))) := by
  decide +kernel

private theorem qc_maps_05 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))) := by
  decide +kernel

private theorem qc_maps_06 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))) := by
  decide +kernel

private theorem qc_maps_07 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))))) := by
  decide +kernel

private theorem qc_maps_08 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))) := by
  decide +kernel

private theorem qc_maps_09 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))))))) := by
  decide +kernel

private theorem qc_maps_10 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))))) := by
  decide +kernel

private theorem qc_maps_11 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))))))))) := by
  decide +kernel

private theorem qc_maps_12 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))))))) := by
  decide +kernel

private theorem qc_maps_13 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))))))))))) := by
  decide +kernel

private theorem qc_maps_14 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))))))))) := by
  decide +kernel

private theorem qc_maps_15 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))))))))))))) := by
  decide +kernel

private theorem qc_maps_16 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))))))))))) := by
  decide +kernel

private theorem qc_maps_17 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))))))))))))))) := by
  decide +kernel

private theorem qc_maps_18 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))))))))))))) := by
  decide +kernel

private theorem qc_maps_19 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))))))))))))))))) := by
  decide +kernel

private theorem qc_maps_20 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))))))))))))))) := by
  decide +kernel

private theorem qc_maps_21 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily))))))))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes))))))))))))))))))))))) := by
  decide +kernel

private theorem qc_maps_22 :
    (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.take 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))))))))))))))))) := by
  decide +kernel

private theorem qc_maps_23 :
    (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (qcMapFamily)))))))))))))))))))))))).map (fun vs => qcMapCode (blDock vs)) =
      (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (List.drop 48 (Generated.quantumCoarseMapCodes)))))))))))))))))))))))) := by
  decide +kernel

/-- **Map bridge.** On every one- and two-excitation dock state of role 0 (1,152 states), the four Lean maps
    are classical-boundary.ts's `DECLARED_TONE_MAPS` (`netSign, netResidue, pairedSign, lowestSlotTone`). The
    maps read tones only, so roles do not enter. The tie holds on this family, not on every dock. -/
theorem gen_quantum_coarse_maps_eq :
    qcMapFamily.map (fun vs => qcMapCode (blDock vs)) = Generated.quantumCoarseMapCodes :=
  qc_map_split _ _ _ 48 qc_maps_00 (qc_map_split _ _ _ 48 qc_maps_01 (qc_map_split _ _ _ 48 qc_maps_02 (qc_map_split _ _ _ 48 qc_maps_03 (qc_map_split _ _ _ 48 qc_maps_04 (qc_map_split _ _ _ 48 qc_maps_05 (qc_map_split _ _ _ 48 qc_maps_06 (qc_map_split _ _ _ 48 qc_maps_07 (qc_map_split _ _ _ 48 qc_maps_08 (qc_map_split _ _ _ 48 qc_maps_09 (qc_map_split _ _ _ 48 qc_maps_10 (qc_map_split _ _ _ 48 qc_maps_11 (qc_map_split _ _ _ 48 qc_maps_12 (qc_map_split _ _ _ 48 qc_maps_13 (qc_map_split _ _ _ 48 qc_maps_14 (qc_map_split _ _ _ 48 qc_maps_15 (qc_map_split _ _ _ 48 qc_maps_16 (qc_map_split _ _ _ 48 qc_maps_17 (qc_map_split _ _ _ 48 qc_maps_18 (qc_map_split _ _ _ 48 qc_maps_19 (qc_map_split _ _ _ 48 qc_maps_20 (qc_map_split _ _ _ 48 qc_maps_21 (qc_map_split _ _ _ 48 qc_maps_22 (qc_maps_23)))))))))))))))))))))))

/-- **B8, the declared maps on lone vibes (Q6).** Each of the four maps sends the empty dock to `0`;
    `netSign`, `netResidue` and `lowestSlotTone` send every lone vibe to its tone (they see it), and
    `pairedSign` sends every lone vibe to `0` (blind). -/
theorem thm_qc_declared_maps_lone :
    (qcNetSign v1FullDock = .zero ∧ qcNetResidue v1FullDock = .zero ∧ qcPairedSign v1FullDock = .zero ∧
      qcLowestSlotTone v1FullDock = .zero) ∧
    ∀ (a : Fin 24) (σ : Sign) (r : Bool), qcNetSign (qcDock a σ r) = σ.toTone ∧
      qcNetResidue (qcDock a σ r) = σ.toTone ∧ qcLowestSlotTone (qcDock a σ r) = σ.toTone ∧
      qcPairedSign (qcDock a σ r) = .zero := by
  refine ⟨by decide, fun a σ r => ?_⟩
  cases σ <;> cases r <;> revert a <;> decide

private theorem qc_sees (τ : FullDock → Tone) (h1 : τ (qcDock 0 .pos false) = .pos) (h2 : τ v1FullDock = .zero) :
    ∃ a σ r, τ (qcDock a σ r) ≠ τ v1FullDock :=
  ⟨0, .pos, false, by rw [h1, h2]; decide⟩

/-- **B8, the declared maps under `U^t` (Q6).** For every silent `χ` and `t = 1, 2, 3`, none of `netSign`,
    `netResidue`, `lowestSlotTone` makes `U^t` a function on coarse states (A16). Roles 0 and 1. -/
theorem thm_qc_declared_maps_nogo (χ : ChiralInvariant) (hχ : BlSilent χ) (t : Nat) (h1 : 1 ≤ t) (h3 : t ≤ 3) :
    ¬ QcCoarseFunction qcNetSign (iter (fockBeat χ) t) ∧ ¬ QcCoarseFunction qcNetResidue (iter (fockBeat χ) t) ∧
      ¬ QcCoarseFunction qcLowestSlotTone (iter (fockBeat χ) t) := by
  have hl := thm_qc_declared_maps_lone
  exact ⟨thm_qc_coarse_nogo χ hχ _ (qc_sees _ (hl.2 0 .pos false).1 hl.1.1) t h1 h3,
    thm_qc_coarse_nogo χ hχ _ (qc_sees _ (hl.2 0 .pos false).2.1 hl.1.2.1) t h1 h3,
    thm_qc_coarse_nogo χ hχ _ (qc_sees _ (hl.2 0 .pos false).2.2.1 hl.1.2.2.2) t h1 h3⟩

/-- Two lone `+1` vibes on the line of slot 0, at the base dock (slot 0) and at `k_0^2` (slot 3), both heading
    for the dock `k_0` between them. -/
def qcHeadOn : HoneycombConfig :=
  (v1Config.setDock mat5Id (qcDock 0 .pos false)).setDock (qcFrame 0 2) (qcDock 3 .pos false)

private theorem qc_head_on_amp : ¬ NinthLoc6.isZero (qcW (ket qcHeadOn) qcHeadOn) := by
  decide +kernel

private theorem qc_head_on_meet :
    qcPairedSign (fun a => qcHeadOn.lookup (mat5Mul (qcFrame 0 1) (transport (oppSlot a))) a) = .pos := by
  decide +kernel

/-- **B8, `pairedSign` (Q6).** For every chiral invariant, `pairedSign` (blind to lone vibes) does not make
    `U` a function on coarse states: the head-on pair has the vacuum's all-zero coarse image, the vacuum stays
    the vacuum, and the pair meets on one line of the dock `k_0` with nonzero amplitude, where `pairedSign`
    reads `+1`. Roles 0 and 1. -/
theorem thm_qc_paired_sign_nogo (χ : ChiralInvariant) : ¬ QcCoarseFunction qcPairedSign (fockBeat χ) := by
  intro hF
  have hl := thm_qc_declared_maps_lone
  have hv := (thm_fock_v1_quantum_stationarity χ).1
  have hsrc : qcCoarse qcPairedSign qcHeadOn = qcCoarse qcPairedSign v1Config := by
    funext g
    show qcPairedSign (qcHeadOn.lookup g) = qcPairedSign (v1Config.lookup g)
    unfold qcHeadOn
    rw [lookup_setDock, lookup_setDock, qc_v1_lookup, hl.1.2.2.1]
    by_cases e1 : g = qcFrame 0 2
    · rw [ite_eq_left e1]; exact (hl.2 3 .pos false).2.2.2
    · rw [ite_eq_right e1]
      by_cases e2 : g = mat5Id
      · rw [ite_eq_left e2]; exact (hl.2 0 .pos false).2.2.2
      · rw [ite_eq_right e2]; exact hl.1.2.2.1
  have hamp := qc_beat_ne_zero χ qcHeadOn qcHeadOn (qc_ne_zero_of_not_isZero _ qc_head_on_amp)
  have hvac : fockBeat χ (ket v1Config) v1Config ≠ 0 := by
    rw [hv, bl_ket, ite_eq_left rfl]
    exact qc_ne_zero_of_not_isZero _ (by decide)
  have h := congrFun (hF qcHeadOn v1Config (streamConfig qcHeadOn) v1Config hsrc hamp hvac) (qcFrame 0 1)
  have hm : qcCoarse qcPairedSign (streamConfig qcHeadOn) (qcFrame 0 1) = .pos := by
    show qcPairedSign ((streamConfig qcHeadOn).lookup (qcFrame 0 1)) = .pos
    have e : (streamConfig qcHeadOn).lookup (qcFrame 0 1) =
        fun a => qcHeadOn.lookup (mat5Mul (qcFrame 0 1) (transport (oppSlot a))) a := by
      funext a
      exact qc_lookup_stream _ _ a
    rw [e]
    exact qc_head_on_meet
  have hz : qcCoarse qcPairedSign v1Config (qcFrame 0 1) = .zero := hl.1.2.2.1
  rw [hm, hz] at h
  exact absurd h (by decide)

end Compute

end Vibe
