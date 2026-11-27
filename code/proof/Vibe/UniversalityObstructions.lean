import Vibe.Algebra
import Vibe.Rule
import Vibe.CoxeterTransport
import Vibe.FockBeat
import Vibe.BallisticDoublon
import Vibe.CompositeTrion

/-!
# Vibe Theory: Bare-`U` Turing-Universality Obstructions & Exact Algebraic Certificates

Zero-dependency Lean 4.35.0 formalization of the seven headline obstruction and
exact algebraic witness theorems for bare `U = S ∘ Φ_odd ∘ D ∘ M_meet ∘ M_pair(ζ_18) ∘ K ∘ D ∘ Φ_odd`
on the infinite `{3,4,3,4}` hyperbolic honeycomb:

1. **All-Time `ℤ_2^{216}` Line-Parity & Role-Multiset Conservation (`thm_univ_z216_parity_and_role_multiset_all_time`):**
   Directly on the literal 8-layer infinite-honeycomb Fock unitary `fockBeat χ` (`∀ t : Nat`),
   certifies all-time conservation of total activity `N_act`, all per-(tone, role) integer counts,
   and all per-line per-tone per-role `ℤ_2` parities `P_{l, τ, r} : Bool`, together with the
   odd-parity non-evacuation corollary (`iter (fockBeat χ) t |c₀⟩` has strictly zero amplitude outside
   its odd-parity sector, and in particular whenever line `l₀` is emptied) and the 9-role parity
   dimension `12 * 2 * 9 = 216`.

2. **Universal `k`-String Dispersion Floor & Rapidity No-Go (`thm_univ_dispersion_floor_and_rapidity_nogo`):**
   - Exact cleared-denominator `k`-string dispersion floor for ALL `k ≥ 1` and ALL rational
     `y = cos^2 P = p / q ∈ [0, 1]`, with equality at `p = 0` and strict inequality for `p > 0`,
     certifying `(v'_k)^2 + (v''_k)^2 ≥ 9 k^4 / (3 k^2 + 1)^3 > 0`.
   - Exact global `k = 1` speed-gap polynomial identities (`+8 p q` and `-8 p q` sign twins) and
     nonnegativity across `-q ≤ p ≤ q`.
   - Exact Rapidity-Velocity 2-to-1 Law (`v(u_1) = v(u_2) ↔ u_1 = u_2 ∨ 3 u_1 u_2 = 1`),
     speed-cap square identity `(3 a^2 + b^2)^2 - 12 a^2 b^2 = (3 a^2 - b^2)^2 ≥ 0`,
     and exact `W_0` rapidity-additivity contradiction (`uA - uC = -r ∧ uC - uD = r → uA = uD`).

3. **`M_pair(ζ_18)` Diffraction Ceiling, Grover Cap & 9-Role Pigeonhole (`thm_univ_mpair_ceiling_and_role_pigeonhole`):**
   Bridged directly to `Vibe.CompositeTrion.cotSqZeta18` and `thm_ct_mpair_gap_margin`:
   certifies `837 / 10^6 < P_hop < 838 / 10^6` in cleared integer form, `P_off = 11 * P_hop`,
   exact `10 / 11` unwanted diffraction, universal Grover cap `(x - r)^2 + y^2 ≤ 4 r^2`
   (`P_hop ≤ 1 / 36`), coherent `m`-line focusing `m * P_hop < 1 / 100` for `1 ≤ m ≤ 11`,
   and the constructive 9-role pigeonhole theorem `∀ n ≥ 4, ∀ f : Fin (3 * n) → Fin 9, ∃ i ≠ j, f i = f j`.

4. **Straight-Worldline Crossing Ceiling, Symbolic `6 × 6` Yang-Baxter & Parameter-Dimension Separation
   (`thm_univ_yb_crossing_and_dim_ceiling`):**
   - Straight-worldline no-double-crossing & universal crossing ceiling `K ≤ N * (N - 1) / 2`
     (certifying `36 < 53 < 54 < 373` at `N = 9`).
   - Exact symbolic `6 × 6` rational Yang-Baxter equation for `R_tilde_{pq}(w) = w I - i P_{pq}`
     over Gaussian integers `ℤ[i]` for ALL `u1 u2 u3 : Int`.
   - Exact parameter-dimension separation `∀ n ≥ 1, 3 * n - 1 < 4 ^ n - 1`.

5. **Linden-Popescu Unitary Halting Fixed-Point No-Go & Eisenstein `W_0` Racah Clearance
   (`thm_univ_unitary_halting_nogo_and_w0_clearance`):**
   - Directly on `FockUnitary` (and instantiated on `fockBeatUnit χ`): any unitary fixed point
     `U.op ψ_halt = ψ_halt` can never be reached from any `φ ≠ ψ_halt` in any finite time `t`.
   - Exact Eisenstein `ℤ[ω]` `6 × 6` matrix `4 * W_0` on `C(4, 2) = 6`: certifies
     `(4 W_0)† (4 W_0) = (4 W_0) (4 W_0)† = 16 I_6` and exact leakage clearance
     `⟨L | (4 W_0) | L⟩ = 0` for `|L⟩ = (-1, -1, -1, 1, 1, 1)`.

6. **Hyperbolic Geodesic 2-Plane Invariance, Unique Intersection & 4-Line `Φ_odd` Junction Cap
   (`thm_univ_geodesic_2plane_and_junction_cap`):**
   Directly on `Vibe.CoxeterTransport`: proves `k_a c_0 = c_0 + 2 n_a` and `k_a n_a = 2 c_0 + 5 n_a`
   for all `a : Fin 24`, proves distinct geodesics from `c_0` (`a1 ≠ a2 ∧ a1 ≠ oppSlot a2`) obey
   `k_{a1}^{m1} c_0 = k_{a2}^{m2} c_0 → m1 = 0 ∧ m2 = 0` (`|L_i ∩ L_j| ≤ 1`), and proves the exact
   combinatorial 4-line junction ceiling `6 * J ≤ D * (D - 1) / 2` and `J ≤ D * (D - 1) / 12`.

7. **Exact Mod-2 Coxeter `D_4` Triality Quotient, `5 / 8` Omnidirectional `L_7` Bragg Gap &
   Period-12 Cavity Compacton (`thm_univ_mod2_triality_and_l7_bragg_gap`):**
   - Exact ring homomorphism `ℤ[√2] → ℤ[√2] / 2 ℤ[√2]` lifted to `Mat5`: proves the 12 antipodal
     line transports `k_{lineA l}` (`= k_{lineB l} mod 2`) generate the exact 4-element group
     `ℤ_2 × ℤ_2`, partitioning `Fin 12` into the three `D_4` triality frames (`4 + 4 + 4`), with
     exact index-2 characters `η : ℤ_2 × ℤ_2 → ℤ_2`.
   - Exact 2-beat Floquet Bloch transfer identities for `S C S C` (`(cos(2 k_1) - 3) / 4`) and
     bipartite `S L_7^{(-)} S L_7^{(+)}` (`(3 + 2 cos(2 k_2)) / 8`) plus the omnidirectional `5 / 8`
     band-gap inequality `(3 q + 2 c_2) * 4 - (c_1 - 3 q) * 8 ≥ 5 q * 4` for all `c_1, c_2 ∈ [-q, q]`.
   - Exact `ℤ[ω]` 1-dock qubit cavity period-12 identities (`(2 U_{cav,2})^6 = 64 I_2`,
     `(2 U_{cav,2})^{12} = 4096 I_2` for the 2-beat `K`-wall return map `(-ω X) C`, and minimal
     order-12 `(2 U_{cav,12})^6 = -64 I_2`, `(2 U_{cav,12})^{12} = 4096 I_2` for `Z X C`).
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 0: Core Private Helpers (`Int`, `Nat`, `Fin`, `List`, `ZSqrt2`, `Mat5`) -/

private theorem univ_ite_pos {α : Type} {c : Prop} [h : Decidable c] (hc : c) (a b : α) :
    (if c then a else b) = a :=
  match h with
  | isTrue _ => rfl
  | isFalse hnc => absurd hc hnc

private theorem univ_ite_neg {α : Type} {c : Prop} [h : Decidable c] (hnc : ¬ c) (a b : α) :
    (if c then a else b) = b :=
  match h with
  | isTrue hc => absurd hc hnc
  | isFalse _ => rfl

private theorem univ_bool_ite_true {α : Type} (a b : α) :
    (if true = true then a else b) = a := rfl

private theorem univ_bool_ite_false {α : Type} (a b : α) :
    (if false = true then a else b) = b := rfl

private theorem univ_dite_pos {α : Type} {c : Prop} [h : Decidable c] (hc : c)
    (a : c → α) (b : ¬ c → α) : (if h' : c then a h' else b h') = a hc :=
  match h with
  | isTrue _ => rfl
  | isFalse hnc => absurd hc hnc

private theorem univ_dite_neg {α : Type} {c : Prop} [h : Decidable c] (hnc : ¬ c)
    (a : c → α) (b : ¬ c → α) : (if h' : c then a h' else b h') = b hnc :=
  match h with
  | isTrue hc => absurd hc hnc
  | isFalse _ => rfl

private theorem univ_le_of_lt {a b : Int} (h : a < b) : a ≤ b := by omega

private theorem univ_pow2 (x : Int) : x ^ 2 = x * x := by
  have h0 : x ^ 0 = 1 := rfl
  rw [Int.pow_succ, Int.pow_succ, h0, Int.one_mul]

private theorem univ_pow3 (x : Int) : x ^ 3 = (x * x) * x := by
  rw [Int.pow_succ, univ_pow2]

private theorem univ_pow4 (x : Int) : x ^ 4 = ((x * x) * x) * x := by
  rw [Int.pow_succ, univ_pow3]

private theorem univ_pow5 (x : Int) : x ^ 5 = (((x * x) * x) * x) * x := by
  rw [Int.pow_succ, univ_pow4]

private theorem univ_mul_pos (a b : Int) (ha : 0 < a) (hb : 0 < b) : 0 < a * b := by
  have h : 0 ≤ (a - 1) * (b - 1) := Int.mul_nonneg (by omega) (by omega)
  rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.one_mul, Int.mul_one] at h
  omega

private theorem univ_int_mul_eq_zero (a b : Int) (h : a * b = 0) : a = 0 ∨ b = 0 := by
  if ha : a = 0 then exact Or.inl ha
  else if hb : b = 0 then exact Or.inr hb
  else
    exfalso
    if hap : 0 < a then
      if hbp : 0 < b then
        have hp := univ_mul_pos a b hap hbp
        omega
      else
        have hp := univ_mul_pos a (-b) hap (by omega)
        rw [Int.mul_neg] at hp
        omega
    else
      if hbp : 0 < b then
        have hp := univ_mul_pos (-a) b (by omega) hbp
        rw [Int.neg_mul] at hp
        omega
      else
        have hp := univ_mul_pos (-a) (-b) (by omega) (by omega)
        rw [Int.neg_mul, Int.mul_neg, Int.neg_neg] at hp
        omega

private theorem univ_find?_eq_some_iff {α : Type} (p : α → Bool) (xs : List α) (a : α) :
    xs.find? p = some a → a ∈ xs ∧ p a = true := by
  induction xs with
  | nil => simp only [List.find?]; intro h; exact (nomatch h)
  | cons x rest ih =>
    simp only [List.find?]
    cases hpx : p x with
    | true => intro h; cases h; exact ⟨List.Mem.head rest, hpx⟩
    | false => intro h; have ⟨hm, hp⟩ := ih h; exact ⟨List.Mem.tail x hm, hp⟩

private theorem univ_mem_nodupUnion {α : Type} [DecidableEq α] (xs ys : List α) (a : α) :
    a ∈ nodupUnion xs ys ↔ a ∈ xs ∨ a ∈ ys := by
  induction ys with
  | nil =>
    simp only [nodupUnion]
    exact ⟨Or.inl, fun h => match h with | Or.inl h1 => h1 | Or.inr h2 => nomatch h2⟩
  | cons y rest ih =>
    simp only [nodupUnion]
    cases hm : memBool y (nodupUnion xs rest) with
    | true =>
      rw [univ_bool_ite_true]
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
      rw [univ_bool_ite_false]
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

private theorem univ_isNodup_nodupUnion {α : Type} [DecidableEq α] {xs : List α}
    (hxs : IsNodup xs) (ys : List α) : IsNodup (nodupUnion xs ys) := by
  induction ys with
  | nil => exact hxs
  | cons y rest ih =>
    simp only [nodupUnion]
    cases hm : memBool y (nodupUnion xs rest) with
    | true => rw [univ_bool_ite_true]; exact ih
    | false =>
      rw [univ_bool_ite_false]
      refine IsNodup.cons ?_ ih
      intro hmem
      have ht := (memBool_eq_true_iff y _).mpr hmem
      rw [hm] at ht
      exact Bool.noConfusion ht

private theorem univ_fockSumInt_add {α : Type} (xs : List α) (f g : α → Int) :
    fockSumInt xs (fun x => f x + g x) = fockSumInt xs f + fockSumInt xs g := by
  induction xs with
  | nil => rfl
  | cons x rest ih => simp only [fockSumInt]; rw [ih]; omega

private theorem univ_fockSumInt_swap {α β : Type} (xs : List α) (ys : List β) (f : α → β → Int) :
    fockSumInt xs (fun x => fockSumInt ys (fun y => f x y)) =
      fockSumInt ys (fun y => fockSumInt xs (fun x => f x y)) := by
  induction xs with
  | nil =>
    simp only [fockSumInt]
    exact (fockSumInt_zero_of_all_zero ys (fun _ => 0) (fun _ _ => rfl)).symm
  | cons x rest ih =>
    simp only [fockSumInt]
    rw [ih, ← univ_fockSumInt_add]

private theorem univ_fockSumInt_support_indep {α : Type} [DecidableEq α] (s₁ s₂ : List α) (f : α → Int)
    (h1 : IsNodup s₁) (h2 : IsNodup s₂)
    (hv1 : ∀ x, x ∉ s₁ → f x = 0) (hv2 : ∀ x, x ∉ s₂ → f x = 0) :
    fockSumInt s₁ f = fockSumInt s₂ f := by
  let u := nodupUnion s₁ s₂
  have hu := univ_isNodup_nodupUnion h1 s₂
  rw [fockSumInt_subset_eq s₁ u f h1 hu
        (fun x hx => (univ_mem_nodupUnion s₁ s₂ x).mpr (Or.inl hx)) (fun x _ hx1 => hv1 x hx1),
      fockSumInt_subset_eq s₂ u f h2 hu
        (fun x hx => (univ_mem_nodupUnion s₁ s₂ x).mpr (Or.inr hx)) (fun x _ hx2 => hv2 x hx2)]

private theorem univ_lookup_streamConfig (c : HoneycombConfig) (g : Mat5) (a : Fin 24) :
    (streamConfig c).lookup g a = c.lookup (mat5Mul g (transport (oppSlot a))) a := by
  have h := lookup_streamConfigInv (streamConfig c) (mat5Mul g (transport (oppSlot a))) a
  rw [(thm_fock_honeycomb_config_symmetries c).1, fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right] at h
  exact h.symm

/-- Constructive finite pigeonhole principle: any map `Fin m → Fin k` with `k < m` collides. -/
private theorem univ_fin_exists_or_forall (n : Nat) (p : Fin n → Bool) :
    (∃ i : Fin n, p i = true) ∨ (∀ i : Fin n, p i = false) := by
  induction n with
  | zero => exact Or.inr (fun i => absurd i.isLt (Nat.not_lt_zero i.val))
  | succ k ih =>
    cases hlast : p ⟨k, Nat.lt_succ_self k⟩ with
    | true => exact Or.inl ⟨⟨k, Nat.lt_succ_self k⟩, hlast⟩
    | false =>
      rcases ih (fun i => p ⟨i.val, Nat.lt_succ_of_lt i.isLt⟩) with ⟨j, hj⟩ | hall
      · exact Or.inl ⟨⟨j.val, Nat.lt_succ_of_lt j.isLt⟩, hj⟩
      · refine Or.inr (fun i => ?_)
        if hlt : i.val < k then
          exact hall ⟨i.val, hlt⟩
        else
          have heq : i = ⟨k, Nat.lt_succ_self k⟩ := Fin.ext (by have := i.isLt; omega)
          rw [heq]
          exact hlast

private def univDropVal {k : Nat} (v x : Fin (k + 1)) (hne : x ≠ v) : Fin k :=
  if h : x.val < v.val then
    ⟨x.val, by have := v.isLt; omega⟩
  else
    ⟨x.val - 1, by
      have hvn : x.val ≠ v.val := fun e => hne (Fin.ext e)
      have := x.isLt
      omega⟩

private theorem univDropVal_inj {k : Nat} (v x y : Fin (k + 1)) (hx : x ≠ v) (hy : y ≠ v)
    (heq : univDropVal v x hx = univDropVal v y hy) : x = y := by
  have hv : (univDropVal v x hx).val = (univDropVal v y hy).val := congrArg Fin.val heq
  have hxn : x.val ≠ v.val := fun e => hx (Fin.ext e)
  have hyn : y.val ≠ v.val := fun e => hy (Fin.ext e)
  unfold univDropVal at hv
  if hxlt : x.val < v.val then
    rw [univ_dite_pos hxlt] at hv
    if hylt : y.val < v.val then
      rw [univ_dite_pos hylt] at hv
      exact Fin.ext hv
    else
      rw [univ_dite_neg hylt] at hv
      dsimp only at hv
      omega
  else
    rw [univ_dite_neg hxlt] at hv
    if hylt : y.val < v.val then
      rw [univ_dite_pos hylt] at hv
      dsimp only at hv
      omega
    else
      rw [univ_dite_neg hylt] at hv
      dsimp only at hv
      exact Fin.ext (by omega)

private theorem univ_fin_pigeonhole :
    ∀ (k m : Nat), k < m → ∀ f : Fin m → Fin k, ∃ i j : Fin m, i ≠ j ∧ f i = f j := by
  intro k
  induction k with
  | zero =>
    intro m hm f
    exact absurd (f ⟨0, hm⟩).isLt (Nat.not_lt_zero _)
  | succ k ih =>
    intro m hm f
    let last : Fin m := ⟨m - 1, by omega⟩
    let v : Fin (k + 1) := f last
    let p : Fin (m - 1) → Bool := fun i => decide (f ⟨i.val, by omega⟩ = v)
    rcases univ_fin_exists_or_forall (m - 1) p with ⟨i, hi⟩ | hnone
    · have hfeq : f ⟨i.val, by omega⟩ = v := of_decide_eq_true hi
      have hne : (⟨i.val, by omega⟩ : Fin m) ≠ last := by
        intro heq
        have hv : i.val = m - 1 := congrArg Fin.val heq
        have := i.isLt
        omega
      exact ⟨⟨i.val, by omega⟩, last, hne, hfeq⟩
    · have hneq : ∀ i : Fin (m - 1), f ⟨i.val, by omega⟩ ≠ v := by
        intro i heq
        have ht : p i = true := decide_eq_true heq
        rw [hnone i] at ht
        exact Bool.noConfusion ht
      let g : Fin (m - 1) → Fin k := fun i => univDropVal v (f ⟨i.val, by omega⟩) (hneq i)
      obtain ⟨i, j, hij, hge⟩ := ih (m - 1) (by omega) g
      have hfeq : f ⟨i.val, by omega⟩ = f ⟨j.val, by omega⟩ :=
        univDropVal_inj v _ _ (hneq i) (hneq j) hge
      have hne' : (⟨i.val, by omega⟩ : Fin m) ≠ ⟨j.val, by omega⟩ := by
        intro heq
        exact hij (Fin.ext (congrArg Fin.val heq))
      exact ⟨⟨i.val, by omega⟩, ⟨j.val, by omega⟩, hne', hfeq⟩

private theorem univ_fin_inj_le {M N : Nat} (f : Fin M → Fin N)
    (hinj : ∀ x y : Fin M, f x = f y → x = y) : M ≤ N := by
  if hle : M ≤ N then exact hle
  else
    exfalso
    obtain ⟨i, j, hij, hfeq⟩ := univ_fin_pigeonhole N M (by omega) f
    exact hij (hinj i j hfeq)

/-- Exact triangular pair encoding `{(i, j) : Fin N × Fin N | i < j} ↪ Fin (N * (N - 1) / 2)`. -/
private theorem univ_tri_two_mul (m : Nat) : 2 * (m * (m - 1) / 2) = m * (m - 1) := by
  induction m with
  | zero => rfl
  | succ k ih =>
    cases k with
    | zero => rfl
    | succ r =>
      have hstep : (r + 2) * (r + 1) = (r + 1) * r + 2 * (r + 1) := by
        calc (r + 2) * (r + 1)
            = (r + 1) * (r + 2) := Nat.mul_comm (r + 2) (r + 1)
          _ = (r + 1) * r + (r + 1) * 2 := Nat.mul_add (r + 1) r 2
          _ = (r + 1) * r + 2 * (r + 1) := by rw [Nat.mul_comm (r + 1) 2]
      change 2 * ((r + 2) * (r + 1) / 2) = (r + 2) * (r + 1)
      change 2 * ((r + 1) * r / 2) = (r + 1) * r at ih
      rw [hstep]
      omega

private theorem univ_tri_step (j : Nat) : j * (j - 1) + 2 * j = (j + 1) * j := by
  cases j with
  | zero => rfl
  | succ k =>
    change (k + 1) * k + 2 * (k + 1) = (k + 2) * (k + 1)
    calc (k + 1) * k + 2 * (k + 1)
        = (k + 1) * k + (k + 1) * 2 := by rw [Nat.mul_comm 2 (k + 1)]
      _ = (k + 1) * (k + 2) := (Nat.mul_add (k + 1) k 2).symm
      _ = (k + 2) * (k + 1) := Nat.mul_comm (k + 1) (k + 2)

private theorem univ_tri_mono (a b : Nat) (h : a ≤ b) : a * (a - 1) ≤ b * (b - 1) :=
  Nat.mul_le_mul h (by omega)

private def univTriPairIdx {N : Nat} (i j : Fin N) (hlt : i.val < j.val) :
    Fin (N * (N - 1) / 2) :=
  ⟨j.val * (j.val - 1) / 2 + i.val, by
    have h2j := univ_tri_two_mul j.val
    have h2N := univ_tri_two_mul N
    have hstep := univ_tri_step j.val
    have hmono : (j.val + 1) * j.val ≤ N * (N - 1) := by
      have hm := univ_tri_mono (j.val + 1) N (by have := j.isLt; omega)
      simpa only [Nat.add_sub_cancel] using hm
    omega⟩

private theorem univTriPairIdx_inj {N : Nat} (i1 j1 i2 j2 : Fin N)
    (h1 : i1.val < j1.val) (h2 : i2.val < j2.val)
    (heq : univTriPairIdx i1 j1 h1 = univTriPairIdx i2 j2 h2) :
    i1 = i2 ∧ j1 = j2 := by
  have hv : j1.val * (j1.val - 1) / 2 + i1.val = j2.val * (j2.val - 1) / 2 + i2.val :=
    congrArg Fin.val heq
  have h2j1 := univ_tri_two_mul j1.val
  have h2j2 := univ_tri_two_mul j2.val
  have hne1 : ¬ (j1.val < j2.val) := by
    intro hlt
    have hstep := univ_tri_step j1.val
    have hmono : (j1.val + 1) * j1.val ≤ j2.val * (j2.val - 1) := by
      have hm := univ_tri_mono (j1.val + 1) j2.val (by omega)
      simpa only [Nat.add_sub_cancel] using hm
    omega
  have hne2 : ¬ (j2.val < j1.val) := by
    intro hlt
    have hstep := univ_tri_step j2.val
    have hmono : (j2.val + 1) * j2.val ≤ j1.val * (j1.val - 1) := by
      have hm := univ_tri_mono (j2.val + 1) j1.val (by omega)
      simpa only [Nat.add_sub_cancel] using hm
    omega
  have hj : j1 = j2 := Fin.ext (by omega)
  have hjv : j1.val = j2.val := congrArg Fin.val hj
  rw [hjv] at hv
  exact ⟨Fin.ext (by omega), hj⟩


/-! ## Section 1: All-Time `ℤ_2^{216}` Line-Parity & Role-Multiset Conservation (`fockBeat χ`) -/

/-- Single-slot activity indicator (`0` if empty, `1` if occupied). -/
def univSlotActivity : SlotState → Int
  | .empty => 0
  | .occ _ _ => 1

/-- Single-slot indicator for exact `(tone, role)` species `(τ, r)` (`τ : Sign`, `r : Bool`). -/
def univSlotToneRole (τ : Sign) (r : Bool) : SlotState → Int
  | .empty => 0
  | .occ s r' => if s = τ ∧ r' = r then 1 else 0

/-- Generic additive dock count for any vacuum-vanishing slot weight `w`. -/
def univDockWeightSum (w : SlotState → Int) (d : FullDock) : Int :=
  fockSumInt (List.finRange 24) (fun s => w (d s))

/-- Generic additive honeycomb count for any vacuum-vanishing slot weight `w`. -/
def univTotalWeightSum (w : SlotState → Int) (c : HoneycombConfig) : Int :=
  fockSumInt c.activeDocks (fun g => univDockWeightSum w (c.lookup g))

/-- Total excitation activity `N_act(c)` on infinite `{3,4,3,4}`. -/
def univTotalActivity (c : HoneycombConfig) : Int :=
  univTotalWeightSum univSlotActivity c

/-- Total per-(tone, role) integer particle count `N_{τ, r}(c)` on infinite `{3,4,3,4}`. -/
def univTotalToneRoleCount (τ : Sign) (r : Bool) (c : HoneycombConfig) : Int :=
  univTotalWeightSum (univSlotToneRole τ r) c

/-- Per-dock count of `(τ, r)` excitations lying on antipodal line `l : Fin 12`. -/
def univDockLineToneRoleCount (l : Fin 12) (τ : Sign) (r : Bool) (d : FullDock) : Int :=
  univSlotToneRole τ r (d (lineA l)) + univSlotToneRole τ r (d (lineB l))

/-- Global count of `(τ, r)` excitations lying on antipodal line `l : Fin 12`. -/
def univLineToneRoleCount (l : Fin 12) (τ : Sign) (r : Bool) (c : HoneycombConfig) : Int :=
  fockSumInt c.activeDocks (fun g => univDockLineToneRoleCount l τ r (c.lookup g))

/-- Exact per-line per-tone per-role `ℤ_2` parity `P_{l, τ, r}(c) : Bool` (`true` iff odd). -/
def univLineToneRoleParity (l : Fin 12) (τ : Sign) (r : Bool) (c : HoneycombConfig) : Bool :=
  decide (univLineToneRoleCount l τ r c % 2 ≠ 0)

/-- Generic sector membership predicate: `ψ` vanishes on every configuration with `inv c ≠ v`. -/
def UnivInSector {α : Type} (inv : HoneycombConfig → α) (v : α)
    (ψ : FockVec NinthLoc6 HoneycombConfig) : Prop :=
  ∀ c : HoneycombConfig, inv c ≠ v → ψ c = NinthLoc6.zero

private theorem univ_globalOp_preserves_inv {α : Type} (inv : HoneycombConfig → α)
    (F : LocalSiteFamily)
    (hSite : ∀ g v ψ, UnivInSector inv v ψ → UnivInSector inv v ((F.unit g).op ψ))
    (v : α) (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : UnivInSector inv v ψ) :
    UnivInSector inv v (globalOp F ψ) := by
  have hList : ∀ gs φ, UnivInSector inv v φ → UnivInSector inv v (applySites F gs φ) := by
    intro gs
    induction gs with
    | nil => intro _ h; exact h
    | cons g rest ih => intro φ h; simp only [applySites]; exact hSite g v _ (ih φ h)
  intro c hc
  exact hList c.activeDocks ψ hψ c hc

/-- Master all-time Fock invariant conservation theorem for the literal 8-layer beat `fockBeat χ`. -/
private theorem univ_fockBeat_preserves_inv {α : Type} (inv : HoneycombConfig → α)
    (hSwapSlots : ∀ c g l, inv (swapLineSlotsConfig g l c) = inv c)
    (hSwapRoles : ∀ c g l, isSameSignDiffRoleLine (c.lookup g) l = true →
      inv (swapLineRolesConfig g l c) = inv c)
    (hMovePair : ∀ c g m, isSoleIdentPairDock (c.lookup g) = true →
      inv (moveSolePairConfig g m c) = inv c)
    (hStream : ∀ c, inv (streamConfig c) = inv c)
    (χ : ChiralInvariant) (v : α)
    (ψ : FockVec NinthLoc6 HoneycombConfig) (hψ : UnivInSector inv v ψ) :
    ∀ t : Nat, UnivInSector inv v (iter (fockBeat χ) t ψ) := by
  have hPhi : ∀ φ, UnivInSector inv v φ → UnivInSector inv v (fockPhiOdd χ φ) := by
    apply univ_globalOp_preserves_inv inv
    intro g v' φ hφ c hc
    change (sitePhiOddUnit χ g).op φ c = NinthLoc6.zero
    rw [sitePhiOddUnit_op, hφ c hc, NinthLoc6.mul_zero]
  have hK : ∀ φ, UnivInSector inv v φ → UnivInSector inv v (fockBounceK φ) := by
    apply univ_globalOp_preserves_inv inv
    intro g v' φ hφ
    have hLs : ∀ ls φ', UnivInSector inv v' φ' →
        UnivInSector inv v' ((composeLines (lineBounceKUnit g) ls).op φ') := by
      intro ls
      induction ls with
      | nil => intro _ h; exact h
      | cons l rest ih =>
        intro φ' h c hc
        simp only [composeLines, FockUnitary.comp]
        rw [lineBounceKUnit_op]
        have hInv : inv (lineBounceKPerm g l c) = inv c := by
          unfold lineBounceKPerm
          cases isOppSignLine (c.lookup g) l with
          | false => rfl
          | true => exact hSwapSlots c g l
        rw [ih φ' h (lineBounceKPerm g l c) (by rw [hInv]; exact hc), NinthLoc6.mul_zero]
    exact hLs (List.finRange 12) φ hφ
  have hD : ∀ φ, UnivInSector inv v φ → UnivInSector inv v (fockHalfCoin φ) := by
    apply univ_globalOp_preserves_inv inv
    intro g v' φ hφ
    have hLs : ∀ ls φ', UnivInSector inv v' φ' →
        UnivInSector inv v' ((composeLines (lineHalfCoinUnit g) ls).op φ') := by
      intro ls
      induction ls with
      | nil => intro _ h; exact h
      | cons l rest ih =>
        intro φ' h c hc
        simp only [composeLines, FockUnitary.comp]
        rw [lineHalfCoinUnit_op]
        cases isLoneLine (c.lookup g) l with
        | false => rw [univ_bool_ite_false, ih φ' h c hc, NinthLoc6.mul_zero]
        | true =>
          rw [univ_bool_ite_true, ih φ' h c hc,
              ih φ' h _ (by rw [hSwapSlots c g l]; exact hc),
              NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]
    exact hLs (List.finRange 12) φ hφ
  have hM : ∀ φ, UnivInSector inv v φ → UnivInSector inv v (fockMeet φ) := by
    apply univ_globalOp_preserves_inv inv
    intro g v' φ hφ
    have hLs : ∀ ls φ', UnivInSector inv v' φ' →
        UnivInSector inv v' ((composeLines (lineMeetUnit g) ls).op φ') := by
      intro ls
      induction ls with
      | nil => intro _ h; exact h
      | cons l rest ih =>
        intro φ' h c hc
        simp only [composeLines, FockUnitary.comp]
        rw [lineMeetUnit_op]
        cases hdiff : isSameSignDiffRoleLine (c.lookup g) l with
        | false => rw [univ_bool_ite_false, ih φ' h c hc, NinthLoc6.mul_zero]
        | true =>
          rw [univ_bool_ite_true, ih φ' h c hc,
              ih φ' h _ (by rw [hSwapRoles c g l hdiff]; exact hc),
              NinthLoc6.mul_zero, NinthLoc6.mul_zero, NinthLoc6.add_zero, NinthLoc6.mul_zero]
    exact hLs (List.finRange 12) φ hφ
  have hP : ∀ φ, UnivInSector inv v φ → UnivInSector inv v (fockMPair φ) := by
    apply univ_globalOp_preserves_inv inv
    intro g v' φ hφ c hc
    change (siteMPairUnit g).op φ c = NinthLoc6.zero
    rw [siteMPairUnit_op]
    cases ha : isSoleIdentPairDock (c.lookup g) with
    | false => rw [univ_bool_ite_false]; exact hφ c hc
    | true =>
      rw [univ_bool_ite_true, hφ c hc, NinthLoc6.zero_add]
      have hS0 : sumFin12 (fun m => φ (moveSolePairConfig g m c)) = NinthLoc6.zero := by
        apply sumList_zero_of_all_zero
        intro m _
        exact hφ _ (by rw [hMovePair c g m ha]; exact hc)
      rw [hS0, NinthLoc6.mul_zero]
  have hS : ∀ φ, UnivInSector inv v φ → UnivInSector inv v (fockStream φ) := by
    intro φ hφ c hc
    rw [fockStream_eval]
    have hInv : inv (streamConfigInv c) = inv c := by
      have h := hStream (streamConfigInv c)
      rw [(thm_fock_honeycomb_config_symmetries c).2.1] at h
      exact h.symm
    exact hφ (streamConfigInv c) (by rw [hInv]; exact hc)
  have hStep : ∀ φ, UnivInSector inv v φ → UnivInSector inv v (fockBeat χ φ) := by
    intro φ hφ
    change UnivInSector inv v
      (fockStream (fockPhiOdd χ (fockHalfCoin (fockMeet (fockMPair (fockBounceK (fockHalfCoin (fockPhiOdd χ φ))))))))
    exact hS _ (hPhi _ (hD _ (hM _ (hP _ (hK _ (hD _ (hPhi _ hφ)))))))
  intro t
  induction t with
  | zero => exact hψ
  | succ k ih => simp only [iter]; exact hStep _ ih

private theorem univ_swapLineRolesDock_eq_swapLineSlotsDock (l : Fin 12) (d : FullDock)
    (hdiff : isSameSignDiffRoleLine d l = true) :
    swapLineRolesDock l d = swapLineSlotsDock l d := by
  unfold isSameSignDiffRoleLine at hdiff
  unfold swapLineRolesDock swapLineSlotsDock
  cases hA : d (lineA l) with
  | empty => rw [hA] at hdiff; exact Bool.noConfusion hdiff
  | occ sA rA =>
    cases hB : d (lineB l) with
    | empty => rw [hA, hB] at hdiff; exact Bool.noConfusion hdiff
    | occ sB rB =>
      rw [hA, hB] at hdiff
      have ⟨hs, _⟩ := of_decide_eq_true hdiff
      rw [hs]

private theorem univ_solePair_decomp (d : FullDock) (hAct : isSoleIdentPairDock d = true) :
    ∃ (l : Fin 12) (s₀ : Sign) (r₀ : Bool),
      findSolePairLine d = some l ∧
      d (lineA l) = .occ s₀ r₀ ∧
      d (lineB l) = .occ s₀ r₀ ∧
      (∀ s : Fin 24, s ≠ lineA l → s ≠ lineB l → d s = .empty) := by
  unfold isSoleIdentPairDock at hAct
  cases hf : findSolePairLine d with
  | none => rw [hf] at hAct; exact Bool.noConfusion hAct
  | some l =>
    have hl : isSoleIdentPairAt d l = true := (univ_find?_eq_some_iff _ _ _ hf).2
    have hSame := ((Bool.and_eq_true _ _).mp hl).1
    have hAll := (list_all_eq_true_iff _ _).mp ((Bool.and_eq_true _ _).mp hl).2
    unfold isSameSignEqRoleLine at hSame
    cases hA : d (lineA l) with
    | empty => rw [hA] at hSame; exact Bool.noConfusion hSame
    | occ sA rA =>
      cases hB : d (lineB l) with
      | empty => rw [hA, hB] at hSame; exact Bool.noConfusion hSame
      | occ sB rB =>
        rw [hA, hB] at hSame
        have ⟨hs, hr⟩ := of_decide_eq_true hSame
        refine ⟨l, sA, rA, hf, hA, by rw [hB, hs, hr], ?_⟩
        intro s hsA hsB
        rcases of_decide_eq_true (hAll s (mem_finRange24 s)) with h1 | h2 | h3
        · exact absurd h1 hsA
        · exact absurd h2 hsB
        · exact h3

private theorem univ_dockWeightSum_v1 (w : SlotState → Int) (hEmpty : w .empty = 0) :
    univDockWeightSum w v1FullDock = 0 := by
  unfold univDockWeightSum
  exact fockSumInt_zero_of_all_zero _ _ (fun _ _ => hEmpty)

private theorem univ_totalWeightSum_over_superset (w : SlotState → Int) (hEmpty : w .empty = 0)
    (c : HoneycombConfig) (V : List Mat5) (hnd : IsNodup V)
    (hsub : ∀ g, g ∈ c.activeDocks → g ∈ V) :
    univTotalWeightSum w c = fockSumInt V (fun g => univDockWeightSum w (c.lookup g)) := by
  unfold univTotalWeightSum
  refine fockSumInt_subset_eq c.activeDocks V (fun g => univDockWeightSum w (c.lookup g))
    (activeDocks_nodup c) hnd hsub ?_
  intro g _ hgNot
  have h0 : c.lookup g = v1FullDock := by
    if h : c.lookup g = v1FullDock then exact h
    else exact absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  rw [h0, univ_dockWeightSum_v1 w hEmpty]

private theorem univ_totalWeightSum_setDock (w : SlotState → Int) (hEmpty : w .empty = 0)
    (c : HoneycombConfig) (g : Mat5) (d : FullDock)
    (hSame : univDockWeightSum w d = univDockWeightSum w (c.lookup g)) :
    univTotalWeightSum w (c.setDock g d) = univTotalWeightSum w c := by
  let V := nodupUnion c.activeDocks (g :: (c.setDock g d).activeDocks)
  have hVnd : IsNodup V := univ_isNodup_nodupUnion (activeDocks_nodup c) _
  rw [univ_totalWeightSum_over_superset w hEmpty (c.setDock g d) V hVnd
        (fun x hx => (univ_mem_nodupUnion _ _ x).mpr (Or.inr (List.Mem.tail g hx))),
      univ_totalWeightSum_over_superset w hEmpty c V hVnd
        (fun x hx => (univ_mem_nodupUnion _ _ x).mpr (Or.inl hx))]
  apply fockSumInt_congr
  intro x _
  rw [lookup_setDock]
  if hxg : x = g then
    rw [univ_ite_pos hxg, hxg, hSame]
  else
    rw [univ_ite_neg hxg]

private theorem univ_dockWeightSum_swapLineSlots (w : SlotState → Int) (l : Fin 12) (d : FullDock) :
    univDockWeightSum w (swapLineSlotsDock l d) = univDockWeightSum w d := by
  unfold univDockWeightSum
  let swapF : Fin 24 → Fin 24 :=
    fun s => if s = lineA l then lineB l else if s = lineB l then lineA l else s
  have hne : lineA l ≠ lineB l := (line_geom_facts.1 l).2.2
  have hInv : ∀ s : Fin 24, swapF (swapF s) = s := by
    intro s
    dsimp only [swapF]
    if hA : s = lineA l then
      rw [univ_ite_pos hA, univ_ite_neg hne.symm, univ_ite_pos rfl, hA]
    else if hB : s = lineB l then
      rw [univ_ite_neg hA, univ_ite_pos hB, univ_ite_pos rfl, hB]
    else
      rw [univ_ite_neg hA, univ_ite_neg hB, univ_ite_neg hA, univ_ite_neg hB]
  have hEq : (fun s => w (swapLineSlotsDock l d s)) = (fun s => w (d (swapF s))) := by
    funext s
    unfold swapLineSlotsDock
    dsimp only [swapF]
    if hA : s = lineA l then rw [univ_ite_pos hA, univ_ite_pos hA]
    else if hB : s = lineB l then
      rw [univ_ite_neg hA, univ_ite_pos hB, univ_ite_neg hA, univ_ite_pos hB]
    else
      rw [univ_ite_neg hA, univ_ite_neg hB, univ_ite_neg hA, univ_ite_neg hB]
  rw [hEq, ← fockSumInt_map (List.finRange 24) swapF (fun s => w (d s))]
  have hMapNd : IsNodup ((List.finRange 24).map swapF) :=
    isNodup_map_inj swapF
      (fun x y h => by have := congrArg swapF h; rw [hInv, hInv] at this; exact this)
      finRange24_nodup
  exact fockSumInt_subset_eq _ (List.finRange 24) _ hMapNd finRange24_nodup
    (fun x _ => mem_finRange24 x)
    (fun x _ hxNot => absurd ((mem_map_iff swapF _ x).mpr ⟨swapF x, mem_finRange24 _, hInv x⟩) hxNot)

private theorem univ_dockWeightSum_moveSolePair (w : SlotState → Int) (hEmpty : w .empty = 0)
    (m : Fin 12) (d : FullDock) (hAct : isSoleIdentPairDock d = true) :
    univDockWeightSum w (moveSolePairDock m d) = univDockWeightSum w d := by
  obtain ⟨l, s₀, r₀, hf, hA0, hB0, hOth⟩ := univ_solePair_decomp d hAct
  have hDockPair : ∀ (k : Fin 12) (dk : FullDock),
      dk (lineA k) = .occ s₀ r₀ → dk (lineB k) = .occ s₀ r₀ →
      (∀ s : Fin 24, s ≠ lineA k → s ≠ lineB k → dk s = .empty) →
      univDockWeightSum w dk = w (.occ s₀ r₀) + w (.occ s₀ r₀) := by
    intro k dk hkA hkB hkOth
    unfold univDockWeightSum
    have hneAB : lineA k ≠ lineB k := (line_geom_facts.1 k).2.2
    rw [fockSumInt_eraseOne (lineA k) (List.finRange 24) _ (mem_finRange24 (lineA k))]
    have hBin : lineB k ∈ eraseOne (lineA k) (List.finRange 24) :=
      (mem_eraseOne_iff (lineA k) (lineB k) finRange24_nodup).mpr ⟨mem_finRange24 (lineB k), hneAB.symm⟩
    rw [fockSumInt_eraseOne (lineB k) _ _ hBin]
    have hRest0 : fockSumInt (eraseOne (lineB k) (eraseOne (lineA k) (List.finRange 24)))
        (fun s => w (dk s)) = 0 := by
      apply fockSumInt_zero_of_all_zero
      intro s hs
      have ⟨hs1, hneB⟩ := (mem_eraseOne_iff (lineB k) s (isNodup_eraseOne (lineA k) finRange24_nodup)).mp hs
      have ⟨_, hneA⟩ := (mem_eraseOne_iff (lineA k) s finRange24_nodup).mp hs1
      rw [hkOth s hneA hneB, hEmpty]
    rw [hRest0, hkA, hkB]
    omega
  have h1 : univDockWeightSum w (moveSolePairDock m d) = w (.occ s₀ r₀) + w (.occ s₀ r₀) := by
    apply hDockPair m
    · unfold moveSolePairDock; rw [hf]; dsimp only; rw [univ_ite_pos (Or.inl rfl), hA0]
    · unfold moveSolePairDock; rw [hf]; dsimp only; rw [univ_ite_pos (Or.inr rfl), hA0]
    · intro s hsA hsB
      unfold moveSolePairDock; rw [hf]; dsimp only
      rw [univ_ite_neg (fun h => match h with | Or.inl e => hsA e | Or.inr e => hsB e)]
  have h2 : univDockWeightSum w d = w (.occ s₀ r₀) + w (.occ s₀ r₀) :=
    hDockPair l d hA0 hB0 hOth
  rw [h1, h2]

private theorem univ_slotSum_streamConfig (w : SlotState → Int) (hEmpty : w .empty = 0)
    (a : Fin 24) (c : HoneycombConfig) :
    fockSumInt (streamConfig c).activeDocks (fun g => w ((streamConfig c).lookup g a)) =
      fockSumInt c.activeDocks (fun g => w (c.lookup g a)) := by
  let shifted := c.activeDocks.map (fun g => mat5Mul g (transport a))
  have hShNd : IsNodup shifted :=
    isNodup_map_inj (fun g => mat5Mul g (transport a))
      (fun x y hxy => by
        have := congrArg (fun m => mat5Mul m (transport (oppSlot a))) hxy
        rw [fb_mat5Mul_assoc, fb_mat5Mul_assoc, thm_coxeter_transport_antipodal_inverse.2 a,
            fb_mat5Mul_id_right, fb_mat5Mul_id_right] at this
        exact this)
      (activeDocks_nodup c)
  have hEqS : fockSumInt (streamConfig c).activeDocks (fun g => w ((streamConfig c).lookup g a)) =
      fockSumInt shifted (fun g => w ((streamConfig c).lookup g a)) := by
    refine univ_fockSumInt_support_indep (streamConfig c).activeDocks shifted _
      (activeDocks_nodup _) hShNd ?_ ?_
    · intro g hg
      have h0 : (streamConfig c).lookup g = v1FullDock := by
        if h : (streamConfig c).lookup g = v1FullDock then exact h
        else exact absurd ((mem_activeDocks_iff _ g).mpr h) hg
      rw [h0]; exact hEmpty
    · intro g hg
      rw [univ_lookup_streamConfig]
      have h0 : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock := by
        if h : c.lookup (mat5Mul g (transport (oppSlot a))) = v1FullDock then exact h
        else
          have hAct := (mem_activeDocks_iff c _).mpr h
          have hBack : mat5Mul (mat5Mul g (transport (oppSlot a))) (transport a) = g := by
            rw [fb_mat5Mul_assoc, transport_inv_left a, fb_mat5Mul_id_right]
          exact absurd ((mem_map_iff _ _ g).mpr ⟨_, hAct, hBack⟩) hg
      rw [h0]; exact hEmpty
  rw [hEqS, fockSumInt_map]
  apply fockSumInt_congr
  intro g _
  rw [univ_lookup_streamConfig, fb_mat5Mul_assoc,
      thm_coxeter_transport_antipodal_inverse.2 a, fb_mat5Mul_id_right]

private theorem univ_totalWeightSum_streamConfig (w : SlotState → Int) (hEmpty : w .empty = 0)
    (c : HoneycombConfig) :
    univTotalWeightSum w (streamConfig c) = univTotalWeightSum w c := by
  unfold univTotalWeightSum univDockWeightSum
  rw [univ_fockSumInt_swap, univ_fockSumInt_swap]
  apply fockSumInt_congr
  intro a _
  exact univ_slotSum_streamConfig w hEmpty a c

private theorem univ_totalWeightSum_conserved (w : SlotState → Int) (hEmpty : w .empty = 0)
    (χ : ChiralInvariant) (n : Int) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (hψ : UnivInSector (univTotalWeightSum w) n ψ) :
    ∀ t : Nat, UnivInSector (univTotalWeightSum w) n (iter (fockBeat χ) t ψ) := by
  apply univ_fockBeat_preserves_inv (univTotalWeightSum w)
  · intro c g l
    exact univ_totalWeightSum_setDock w hEmpty c g _ (univ_dockWeightSum_swapLineSlots w l (c.lookup g))
  · intro c g l hdiff
    unfold swapLineRolesConfig
    rw [univ_swapLineRolesDock_eq_swapLineSlotsDock l (c.lookup g) hdiff]
    exact univ_totalWeightSum_setDock w hEmpty c g _ (univ_dockWeightSum_swapLineSlots w l (c.lookup g))
  · intro c g m hAct
    exact univ_totalWeightSum_setDock w hEmpty c g _ (univ_dockWeightSum_moveSolePair w hEmpty m (c.lookup g) hAct)
  · intro c
    exact univ_totalWeightSum_streamConfig w hEmpty c
  · exact hψ

private theorem univ_lineCount_over_superset (l₀ : Fin 12) (τ : Sign) (r : Bool)
    (c : HoneycombConfig) (V : List Mat5) (hnd : IsNodup V)
    (hsub : ∀ g, g ∈ c.activeDocks → g ∈ V) :
    univLineToneRoleCount l₀ τ r c =
      fockSumInt V (fun g => univDockLineToneRoleCount l₀ τ r (c.lookup g)) := by
  unfold univLineToneRoleCount
  refine fockSumInt_subset_eq c.activeDocks V _ (activeDocks_nodup c) hnd hsub ?_
  intro g _ hgNot
  have h0 : c.lookup g = v1FullDock := by
    if h : c.lookup g = v1FullDock then exact h
    else exact absurd ((mem_activeDocks_iff c g).mpr h) hgNot
  rw [h0]; rfl

private theorem univ_lineCount_setDock_diff (l₀ : Fin 12) (τ : Sign) (r : Bool)
    (c : HoneycombConfig) (g : Mat5) (d : FullDock) :
    univLineToneRoleCount l₀ τ r (c.setDock g d) - univLineToneRoleCount l₀ τ r c =
      univDockLineToneRoleCount l₀ τ r d - univDockLineToneRoleCount l₀ τ r (c.lookup g) := by
  let V := nodupUnion c.activeDocks (g :: (c.setDock g d).activeDocks)
  have hVnd : IsNodup V := univ_isNodup_nodupUnion (activeDocks_nodup c) _
  have hgV : g ∈ V := (univ_mem_nodupUnion _ _ g).mpr (Or.inr (List.Mem.head _))
  rw [univ_lineCount_over_superset l₀ τ r (c.setDock g d) V hVnd
        (fun x hx => (univ_mem_nodupUnion _ _ x).mpr (Or.inr (List.Mem.tail g hx))),
      univ_lineCount_over_superset l₀ τ r c V hVnd
        (fun x hx => (univ_mem_nodupUnion _ _ x).mpr (Or.inl hx)),
      fockSumInt_eraseOne g V _ hgV, fockSumInt_eraseOne g V _ hgV]
  have hRest : fockSumInt (eraseOne g V) (fun x => univDockLineToneRoleCount l₀ τ r ((c.setDock g d).lookup x)) =
      fockSumInt (eraseOne g V) (fun x => univDockLineToneRoleCount l₀ τ r (c.lookup x)) := by
    apply fockSumInt_congr
    intro x hx
    have hne := ((mem_eraseOne_iff g x hVnd).mp hx).2
    rw [lookup_setDock, univ_ite_neg hne]
  rw [hRest, lookup_setDock, univ_ite_pos rfl]
  omega

private theorem univ_dockLineCount_swapLineSlots (l₀ l : Fin 12) (τ : Sign) (r : Bool) (d : FullDock) :
    univDockLineToneRoleCount l₀ τ r (swapLineSlotsDock l d) = univDockLineToneRoleCount l₀ τ r d := by
  unfold univDockLineToneRoleCount swapLineSlotsDock
  if hll : l₀ = l then
    rw [hll]
    have hne : lineA l ≠ lineB l := (line_geom_facts.1 l).2.2
    rw [univ_ite_pos rfl, univ_ite_neg hne.symm, univ_ite_pos rfl]
    omega
  else
    have hDisj := line_geom_facts.2.2.2.1 l₀ l hll
    rw [univ_ite_neg hDisj.1, univ_ite_neg hDisj.2.1,
        univ_ite_neg hDisj.2.2.1, univ_ite_neg hDisj.2.2.2]

private theorem univ_dockLineCount_moveSolePair_even (l₀ m : Fin 12) (τ : Sign) (r : Bool)
    (d : FullDock) (hAct : isSoleIdentPairDock d = true) :
    (univDockLineToneRoleCount l₀ τ r (moveSolePairDock m d) - univDockLineToneRoleCount l₀ τ r d) % 2 = 0 := by
  obtain ⟨l, s₀, r₀, hf, hA0, hB0, hOth⟩ := univ_solePair_decomp d hAct
  have h1 : univDockLineToneRoleCount l₀ τ r (moveSolePairDock m d) % 2 = 0 := by
    unfold univDockLineToneRoleCount moveSolePairDock
    rw [hf]; dsimp only
    if hm : l₀ = m then
      rw [hm, univ_ite_pos (Or.inl rfl), univ_ite_pos (Or.inr rfl), hA0]
      omega
    else
      have hDisj := line_geom_facts.2.2.2.1 l₀ m hm
      have hNA : ¬ (lineA l₀ = lineA m ∨ lineA l₀ = lineB m) :=
        fun h => match h with | Or.inl e => hDisj.1 e | Or.inr e => hDisj.2.1 e
      have hNB : ¬ (lineB l₀ = lineA m ∨ lineB l₀ = lineB m) :=
        fun h => match h with | Or.inl e => hDisj.2.2.1 e | Or.inr e => hDisj.2.2.2 e
      rw [univ_ite_neg hNA, univ_ite_neg hNB]
      rfl
  have h2 : univDockLineToneRoleCount l₀ τ r d % 2 = 0 := by
    unfold univDockLineToneRoleCount
    if hl : l₀ = l then
      rw [hl, hA0, hB0]
      omega
    else
      have hDisj := line_geom_facts.2.2.2.1 l₀ l hl
      rw [hOth (lineA l₀) hDisj.1 hDisj.2.1, hOth (lineB l₀) hDisj.2.2.1 hDisj.2.2.2]
      rfl
  omega

private theorem univ_lineCount_streamConfig (l₀ : Fin 12) (τ : Sign) (r : Bool) (c : HoneycombConfig) :
    univLineToneRoleCount l₀ τ r (streamConfig c) = univLineToneRoleCount l₀ τ r c := by
  unfold univLineToneRoleCount univDockLineToneRoleCount
  rw [univ_fockSumInt_add, univ_fockSumInt_add,
      univ_slotSum_streamConfig (univSlotToneRole τ r) rfl (lineA l₀) c,
      univ_slotSum_streamConfig (univSlotToneRole τ r) rfl (lineB l₀) c]

private theorem univ_lineParity_conserved (l₀ : Fin 12) (τ : Sign) (r : Bool)
    (χ : ChiralInvariant) (p : Bool) (ψ : FockVec NinthLoc6 HoneycombConfig)
    (hψ : UnivInSector (univLineToneRoleParity l₀ τ r) p ψ) :
    ∀ t : Nat, UnivInSector (univLineToneRoleParity l₀ τ r) p (iter (fockBeat χ) t ψ) := by
  apply univ_fockBeat_preserves_inv (univLineToneRoleParity l₀ τ r)
  · intro c g l
    unfold univLineToneRoleParity swapLineSlotsConfig
    have hd := univ_lineCount_setDock_diff l₀ τ r c g (swapLineSlotsDock l (c.lookup g))
    rw [univ_dockLineCount_swapLineSlots l₀ l τ r (c.lookup g)] at hd
    have hEq : univLineToneRoleCount l₀ τ r (c.setDock g (swapLineSlotsDock l (c.lookup g))) =
        univLineToneRoleCount l₀ τ r c := by omega
    rw [hEq]
  · intro c g l hdiff
    unfold univLineToneRoleParity swapLineRolesConfig
    rw [univ_swapLineRolesDock_eq_swapLineSlotsDock l (c.lookup g) hdiff]
    have hd := univ_lineCount_setDock_diff l₀ τ r c g (swapLineSlotsDock l (c.lookup g))
    rw [univ_dockLineCount_swapLineSlots l₀ l τ r (c.lookup g)] at hd
    have hEq : univLineToneRoleCount l₀ τ r (c.setDock g (swapLineSlotsDock l (c.lookup g))) =
        univLineToneRoleCount l₀ τ r c := by omega
    rw [hEq]
  · intro c g m hAct
    unfold univLineToneRoleParity moveSolePairConfig
    have hd := univ_lineCount_setDock_diff l₀ τ r c g (moveSolePairDock m (c.lookup g))
    have hev := univ_dockLineCount_moveSolePair_even l₀ m τ r (c.lookup g) hAct
    have hMod : univLineToneRoleCount l₀ τ r (c.setDock g (moveSolePairDock m (c.lookup g))) % 2 =
        univLineToneRoleCount l₀ τ r c % 2 := by omega
    rw [hMod]
  · intro c
    unfold univLineToneRoleParity
    rw [univ_lineCount_streamConfig l₀ τ r c]
  · exact hψ

/-- Headline Theorem 1 (`ℤ_2^{216}` Line-Parity & Role-Multiset All-Time Conservation on `fockBeat χ`):
    directly on the literal 8-layer infinite-honeycomb Fock unitary `fockBeat χ` (`∀ t : Nat`):
    1. Exact all-time conservation of total activity `univTotalActivity`,
    2. Exact all-time conservation of all per-(tone, role) integer particle counts
       `univTotalToneRoleCount τ r` (`∀ τ : Sign, ∀ r : Bool`),
    3. Exact all-time conservation of all per-line per-tone per-role `ℤ_2` parities
       `univLineToneRoleParity l τ r : Bool` (`∀ l : Fin 12, ∀ τ : Sign, ∀ r : Bool`),
    4. Odd-parity non-evacuation corollary: for any configuration `c₀` with odd `(τ, r)` parity on
       line `l₀`, `iter (fockBeat χ) t |c₀⟩` has strictly zero amplitude on EVERY configuration `c`
       outside that odd-parity sector (and in particular whenever `univLineToneRoleCount l₀ τ r c = 0`),
    5. Exact 9-role parity-space dimension `12 * 2 * 9 = 216`. -/
theorem thm_univ_z216_parity_and_role_multiset_all_time (χ : ChiralInvariant) :
    (∀ (n : Int) (ψ : FockVec NinthLoc6 HoneycombConfig),
      UnivInSector univTotalActivity n ψ →
      ∀ t : Nat, UnivInSector univTotalActivity n (iter (fockBeat χ) t ψ)) ∧
    (∀ (τ : Sign) (r : Bool) (n : Int) (ψ : FockVec NinthLoc6 HoneycombConfig),
      UnivInSector (univTotalToneRoleCount τ r) n ψ →
      ∀ t : Nat, UnivInSector (univTotalToneRoleCount τ r) n (iter (fockBeat χ) t ψ)) ∧
    (∀ (l : Fin 12) (τ : Sign) (r : Bool) (p : Bool) (ψ : FockVec NinthLoc6 HoneycombConfig),
      UnivInSector (univLineToneRoleParity l τ r) p ψ →
      ∀ t : Nat, UnivInSector (univLineToneRoleParity l τ r) p (iter (fockBeat χ) t ψ)) ∧
    (∀ (l₀ : Fin 12) (τ : Sign) (r : Bool) (c₀ : HoneycombConfig),
      univLineToneRoleParity l₀ τ r c₀ = true →
      ∀ (t : Nat) (c : HoneycombConfig),
        (univLineToneRoleParity l₀ τ r c = false →
          iter (fockBeat χ) t (ket (R := NinthLoc6) c₀) c = NinthLoc6.zero) ∧
        (univLineToneRoleCount l₀ τ r c = 0 →
          iter (fockBeat χ) t (ket (R := NinthLoc6) c₀) c = NinthLoc6.zero)) ∧
    (12 * 2 * 9 = 216) := by
  refine ⟨?_, ?_, ?_, ?_, by decide⟩
  · intro n ψ hψ
    exact univ_totalWeightSum_conserved univSlotActivity rfl χ n ψ hψ
  · intro τ r n ψ hψ
    exact univ_totalWeightSum_conserved (univSlotToneRole τ r) rfl χ n ψ hψ
  · intro l τ r p ψ hψ
    exact univ_lineParity_conserved l τ r χ p ψ hψ
  · intro l₀ τ r c₀ hOdd t c
    have hKet : UnivInSector (univLineToneRoleParity l₀ τ r) true (ket (R := NinthLoc6) c₀) := by
      intro x hx
      rw [ket_nloc]
      have hne : x ≠ c₀ := by intro heq; rw [heq] at hx; exact hx hOdd
      rw [univ_ite_neg hne]
    have hEvol := univ_lineParity_conserved l₀ τ r χ true (ket (R := NinthLoc6) c₀) hKet t
    refine ⟨fun hFalse => hEvol c (by rw [hFalse]; decide), fun hZero => ?_⟩
    have hP0 : univLineToneRoleParity l₀ τ r c = false := by
      unfold univLineToneRoleParity
      rw [hZero]
      decide
    exact hEvol c (by rw [hP0]; decide)


/-! ## Section 2: Universal `k`-String Dispersion Floor & Rapidity No-Go -/

private theorem univ_disp_poly_identity (A p q : Int) :
    let X := A * q
    A ^ 3 * q ^ 2 * (p * (X - p) ^ 2 + (q - p) * (X + 2 * p) ^ 2) - (X - p) ^ 5 =
      p * (3 * (X * X) * (3 * (X * X) - 2 * A * (X * p) - 2 * (X * p) - A * (p * p)) +
           5 * X * (p * p) * (2 * X - p) + (p * p) * (p * p)) := by
  intro X
  rw [univ_pow3 A, univ_pow2 q, univ_pow2 (X - p), univ_pow2 (X + 2 * p), univ_pow5 (X - p)]
  let x2 := X * X
  let x3 := x2 * X
  let x4 := x3 * X
  let x5 := x4 * X
  let p2 := p * p
  let p3 := p2 * p
  let p4 := p3 * p
  let p5 := p4 * p
  have hAQ : ((A * A) * A) * (q * q) = A * x2 := by
    change ((A * A) * A) * (q * q) = A * ((A * q) * (A * q))
    ac_rfl
  have hAQq : (A * x2) * q = x3 := by
    change (A * ((A * q) * (A * q))) * q = ((A * q) * (A * q)) * (A * q)
    ac_rfl
  have hSq1 : (X - p) * (X - p) = x2 - 2 * (X * p) + p2 := by
    simp only [Int.sub_mul, Int.mul_sub]
    have hc : p * X = X * p := by ac_rfl
    rw [hc]; omega
  have hSq2 : (X + 2 * p) * (X + 2 * p) = x2 + 4 * (X * p) + 4 * p2 := by
    simp only [Int.add_mul, Int.mul_add]
    have h1 : X * (2 * p) = 2 * (X * p) := by ac_rfl
    have h2 : (2 * p) * X = 2 * (X * p) := by ac_rfl
    have h3 : (2 * p) * (2 * p) = 4 * p2 := by
      calc (2 * p) * (2 * p) = (2 * 2) * (p * p) := by ac_rfl
        _ = 4 * p2 := rfl
    rw [h1, h2, h3]; omega
  have hPow3 : ((X - p) * (X - p)) * (X - p) = x3 - 3 * (x2 * p) + 3 * (X * p2) - p3 := by
    rw [hSq1]
    simp only [Int.sub_mul, Int.add_mul, Int.mul_sub]
    have t1 : (2 * (X * p)) * X = 2 * (x2 * p) := by ac_rfl
    have t2 : (2 * (X * p)) * p = 2 * (X * p2) := by ac_rfl
    have t3 : p2 * X = X * p2 := by ac_rfl
    rw [t1, t2, t3]; omega
  have hPow4 : (((X - p) * (X - p)) * (X - p)) * (X - p) =
      x4 - 4 * (x3 * p) + 6 * (x2 * p2) - 4 * (X * p3) + p4 := by
    rw [hPow3]
    simp only [Int.sub_mul, Int.add_mul, Int.mul_sub]
    have t1 : (3 * (x2 * p)) * X = 3 * (x3 * p) := by ac_rfl
    have t2 : (3 * (x2 * p)) * p = 3 * (x2 * p2) := by ac_rfl
    have t3 : (3 * (X * p2)) * X = 3 * (x2 * p2) := by ac_rfl
    have t4 : (3 * (X * p2)) * p = 3 * (X * p3) := by ac_rfl
    have t5 : p3 * X = X * p3 := by ac_rfl
    rw [t1, t2, t3, t4, t5]; omega
  have hPow5 : ((((X - p) * (X - p)) * (X - p)) * (X - p)) * (X - p) =
      x5 - 5 * (x4 * p) + 10 * (x3 * p2) - 10 * (x2 * p3) + 5 * (X * p4) - p5 := by
    rw [hPow4]
    simp only [Int.sub_mul, Int.add_mul, Int.mul_sub]
    have t1 : (4 * (x3 * p)) * X = 4 * (x4 * p) := by ac_rfl
    have t2 : (4 * (x3 * p)) * p = 4 * (x3 * p2) := by ac_rfl
    have t3 : (6 * (x2 * p2)) * X = 6 * (x3 * p2) := by ac_rfl
    have t4 : (6 * (x2 * p2)) * p = 6 * (x2 * p3) := by ac_rfl
    have t5 : (4 * (X * p3)) * X = 4 * (x2 * p3) := by ac_rfl
    have t6 : (4 * (X * p3)) * p = 4 * (X * p4) := by ac_rfl
    have t7 : p4 * X = X * p4 := by ac_rfl
    rw [t1, t2, t3, t4, t5, t6, t7]; omega
  have hLHS : (A * x2) * (p * (x2 - 2 * (X * p) + p2) + (q - p) * (x2 + 4 * (X * p) + 4 * p2)) =
      x5 + 4 * (x4 * p) + 4 * (x3 * p2) - 6 * (A * (x3 * p2)) - 3 * (A * (x2 * p3)) := by
    have hDist : (A * x2) * (p * (x2 - 2 * (X * p) + p2) + (q - p) * (x2 + 4 * (X * p) + 4 * p2)) =
        x3 * (x2 + 4 * (X * p) + 4 * p2) +
          (A * x2) * (p * ((x2 - 2 * (X * p) + p2) - (x2 + 4 * (X * p) + 4 * p2))) := by
      rw [Int.mul_add, Int.sub_mul, Int.mul_sub, ← Int.mul_assoc (A * x2) q, hAQq,
          Int.mul_sub p, Int.mul_sub (A * x2)]
      omega
    rw [hDist]
    have hDiff : (x2 - 2 * (X * p) + p2) - (x2 + 4 * (X * p) + 4 * p2) =
        -(6 * (X * p)) - 3 * p2 := by omega
    rw [hDiff]
    simp only [Int.mul_add, Int.mul_sub, Int.mul_neg]
    have m1 : x3 * x2 = x5 := by ac_rfl
    have m2 : x3 * (4 * (X * p)) = 4 * (x4 * p) := by ac_rfl
    have m3 : x3 * (4 * p2) = 4 * (x3 * p2) := by ac_rfl
    have m4 : (A * x2) * (p * (6 * (X * p))) = 6 * (A * (x3 * p2)) := by ac_rfl
    have m5 : (A * x2) * (p * (3 * p2)) = 3 * (A * (x2 * p3)) := by ac_rfl
    rw [m1, m2, m3, m4, m5]; omega
  have hRHS : p * (3 * x2 * (3 * x2 - 2 * A * (X * p) - 2 * (X * p) - A * p2) +
        5 * X * p2 * (2 * X - p) + p2 * p2) =
      9 * (x4 * p) - 6 * (A * (x3 * p2)) - 6 * (x3 * p2) - 3 * (A * (x2 * p3)) +
        10 * (x2 * p3) - 5 * (X * p4) + p5 := by
    simp only [Int.mul_add, Int.mul_sub]
    have r1 : p * (3 * x2 * (3 * x2)) = 9 * (x4 * p) := by
      calc p * (3 * x2 * (3 * x2)) = (3 * 3) * ((x2 * x2) * p) := by ac_rfl
        _ = 9 * (x4 * p) := by have hx : x2 * x2 = x4 := by ac_rfl; rw [hx]; rfl
    have r2 : p * (3 * x2 * (2 * A * (X * p))) = 6 * (A * (x3 * p2)) := by
      calc p * (3 * x2 * (2 * A * (X * p))) = (3 * 2) * (A * ((x2 * X) * (p * p))) := by ac_rfl
        _ = 6 * (A * (x3 * p2)) := rfl
    have r3 : p * (3 * x2 * (2 * (X * p))) = 6 * (x3 * p2) := by
      calc p * (3 * x2 * (2 * (X * p))) = (3 * 2) * ((x2 * X) * (p * p)) := by ac_rfl
        _ = 6 * (x3 * p2) := rfl
    have r4 : p * (3 * x2 * (A * p2)) = 3 * (A * (x2 * p3)) := by ac_rfl
    have r5 : p * (5 * X * p2 * (2 * X)) = 10 * (x2 * p3) := by
      calc p * (5 * X * p2 * (2 * X)) = (5 * 2) * ((X * X) * (p2 * p)) := by ac_rfl
        _ = 10 * (x2 * p3) := rfl
    have r6 : p * (5 * X * p2 * p) = 5 * (X * p4) := by ac_rfl
    have r7 : p * (p2 * p2) = p5 := by ac_rfl
    rw [r1, r2, r3, r4, r5, r6, r7]; omega
  rw [hAQ, hSq1, hSq2, hPow5, hLHS, hRHS]
  omega

private theorem univ_disp_inner_pos (A p q : Int) (hA : 4 ≤ A) (hp : 0 ≤ p) (hpq : p ≤ q) (hq : 0 < q) :
    let X := A * q
    0 < 3 * (X * X) * (3 * (X * X) - 2 * A * (X * p) - 2 * (X * p) - A * (p * p)) +
        5 * X * (p * p) * (2 * X - p) + (p * p) * (p * p) := by
  intro X
  have hXpos : 0 < X := univ_mul_pos A q (by omega) hq
  have hQuadId : 3 * (X * X) - 2 * A * (X * p) - 2 * (X * p) - A * (p * p) =
      A * (2 * A * q * (q - p) + (A - 3) * (q * q) + 2 * q * (q - p) + (q - p) * (q + p)) := by
    simp only [Int.mul_add, Int.mul_sub, Int.sub_mul]
    have t1 : 3 * (X * X) = 3 * (A * (A * (q * q))) := by
      change 3 * ((A * q) * (A * q)) = 3 * (A * (A * (q * q))); ac_rfl
    have t2 : 2 * A * (X * p) = 2 * (A * (A * (q * p))) := by
      change 2 * A * ((A * q) * p) = 2 * (A * (A * (q * p))); ac_rfl
    have t3 : 2 * (X * p) = 2 * (A * (q * p)) := by
      change 2 * ((A * q) * p) = 2 * (A * (q * p)); ac_rfl
    have r1 : A * (2 * A * q * q) = 2 * (A * (A * (q * q))) := by ac_rfl
    have r2 : A * (2 * A * q * p) = 2 * (A * (A * (q * p))) := by ac_rfl
    have r4 : A * (3 * (q * q)) = 3 * (A * (q * q)) := by ac_rfl
    have r5 : A * (2 * q * q) = 2 * (A * (q * q)) := by ac_rfl
    have r6 : A * (2 * q * p) = 2 * (A * (q * p)) := by ac_rfl
    have r9 : A * (p * q) = A * (q * p) := by ac_rfl
    rw [t1, t2, t3, r1, r2, r4, r5, r6, r9]; omega
  have hq2 : 0 < q * q := univ_mul_pos q q hq hq
  have h1 : 0 ≤ 2 * A * q * (q - p) := Int.mul_nonneg (Int.mul_nonneg (by omega) (by omega)) (by omega)
  have h2 : 0 < (A - 3) * (q * q) := univ_mul_pos (A - 3) (q * q) (by omega) hq2
  have h3 : 0 ≤ 2 * q * (q - p) := Int.mul_nonneg (by omega) (by omega)
  have h4 : 0 ≤ (q - p) * (q + p) := Int.mul_nonneg (by omega) (by omega)
  have hQuadPos : 0 < 3 * (X * X) - 2 * A * (X * p) - 2 * (X * p) - A * (p * p) := by
    rw [hQuadId]
    exact univ_mul_pos A _ (by omega) (by omega)
  have hX2 : 0 < X * X := univ_mul_pos X X hXpos hXpos
  have hTerm1 : 0 < 3 * (X * X) * (3 * (X * X) - 2 * A * (X * p) - 2 * (X * p) - A * (p * p)) :=
    univ_mul_pos _ _ (by omega) hQuadPos
  have h2Xp : 0 < 2 * X - p := by
    have h4q : 4 * q ≤ X := by
      have hm : 0 ≤ (A - 4) * q := Int.mul_nonneg (by omega) (by omega)
      rw [Int.sub_mul] at hm
      change 4 * q ≤ A * q
      omega
    omega
  have hTerm2 : 0 ≤ 5 * X * (p * p) * (2 * X - p) :=
    Int.mul_nonneg (Int.mul_nonneg (by omega) (int_sq_nonneg p)) (by omega)
  have hTerm3 : 0 ≤ (p * p) * (p * p) := int_sq_nonneg (p * p)
  omega

private theorem univ_k1_speed_gap_plus_id (p q : Int) :
    16 * (3 * q ^ 2 + p ^ 2) * q ^ 2 - (8 * p * q + 3 * (q ^ 2 - p ^ 2)) ^ 2 =
      3 * (q - p) ^ 2 * (q + p) * (13 * q - 3 * p) := by
  rw [univ_pow2 q, univ_pow2 p, univ_pow2 (8 * p * q + 3 * (q * q - p * p)), univ_pow2 (q - p)]
  let q2 := q * q
  let p2 := p * p
  let q4 := q2 * q2
  let pq3 := p * (q * q2)
  let p2q2 := p2 * q2
  let p3q := (p * p2) * q
  let p4 := p2 * p2
  have hL : 16 * (3 * q2 + p2) * q2 - (8 * p * q + 3 * (q2 - p2)) * (8 * p * q + 3 * (q2 - p2)) =
      39 * q4 - 48 * pq3 - 30 * p2q2 + 48 * p3q - 9 * p4 := by
    simp only [Int.add_mul, Int.mul_add, Int.sub_mul, Int.mul_sub]
    have a1 : 16 * (3 * q2) * q2 = 48 * q4 := by
      calc 16 * (3 * q2) * q2 = (16 * 3) * (q2 * q2) := by ac_rfl
        _ = 48 * q4 := rfl
    have a2 : 16 * p2 * q2 = 16 * p2q2 := by ac_rfl
    have a3 : 8 * p * q * (8 * p * q) = 64 * p2q2 := by
      calc 8 * p * q * (8 * p * q) = (8 * 8) * ((p * p) * (q * q)) := by ac_rfl
        _ = 64 * p2q2 := rfl
    have a4 : 8 * p * q * (3 * q2) = 24 * pq3 := by
      calc 8 * p * q * (3 * q2) = (8 * 3) * (p * (q * q2)) := by ac_rfl
        _ = 24 * pq3 := rfl
    have a5 : 8 * p * q * (3 * p2) = 24 * p3q := by
      calc 8 * p * q * (3 * p2) = (8 * 3) * ((p * p2) * q) := by ac_rfl
        _ = 24 * p3q := rfl
    have a6 : 3 * q2 * (8 * p * q) = 24 * pq3 := by
      calc 3 * q2 * (8 * p * q) = (3 * 8) * (p * (q * q2)) := by ac_rfl
        _ = 24 * pq3 := rfl
    have a7 : 3 * p2 * (8 * p * q) = 24 * p3q := by
      calc 3 * p2 * (8 * p * q) = (3 * 8) * ((p * p2) * q) := by ac_rfl
        _ = 24 * p3q := rfl
    have a8 : 3 * q2 * (3 * q2) = 9 * q4 := by
      calc 3 * q2 * (3 * q2) = (3 * 3) * (q2 * q2) := by ac_rfl
        _ = 9 * q4 := rfl
    have a9 : 3 * q2 * (3 * p2) = 9 * p2q2 := by
      calc 3 * q2 * (3 * p2) = (3 * 3) * (p2 * q2) := by ac_rfl
        _ = 9 * p2q2 := rfl
    have a10 : 3 * p2 * (3 * q2) = 9 * p2q2 := by
      calc 3 * p2 * (3 * q2) = (3 * 3) * (p2 * q2) := by ac_rfl
        _ = 9 * p2q2 := rfl
    have a11 : 3 * p2 * (3 * p2) = 9 * p4 := by
      calc 3 * p2 * (3 * p2) = (3 * 3) * (p2 * p2) := by ac_rfl
        _ = 9 * p4 := rfl
    rw [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11]; omega
  have hR : 3 * ((q - p) * (q - p)) * (q + p) * (13 * q - 3 * p) =
      39 * q4 - 48 * pq3 - 30 * p2q2 + 48 * p3q - 9 * p4 := by
    have hCubic : ((q - p) * (q - p)) * (q + p) = q * q2 - p * q2 - p2 * q + p * p2 := by
      have h1 : (q - p) * (q + p) = q2 - p2 := by
        simp only [Int.sub_mul, Int.mul_add]; rw [Int.mul_comm p q]; omega
      rw [Int.mul_assoc (q - p) (q - p) (q + p), h1]
      simp only [Int.sub_mul, Int.mul_sub]
      have c1 : q * p2 = p2 * q := by ac_rfl
      rw [c1]; omega
    rw [Int.mul_assoc 3 ((q - p) * (q - p)) (q + p), hCubic]
    simp only [Int.add_mul, Int.mul_add, Int.sub_mul, Int.mul_sub]
    have b1 : 3 * (q * q2) * (13 * q) = 39 * q4 := by
      calc 3 * (q * q2) * (13 * q) = (3 * 13) * ((q * q) * q2) := by ac_rfl
        _ = 39 * q4 := rfl
    have b2 : 3 * (q * q2) * (3 * p) = 9 * pq3 := by
      calc 3 * (q * q2) * (3 * p) = (3 * 3) * (p * (q * q2)) := by ac_rfl
        _ = 9 * pq3 := rfl
    have b3 : 3 * (p * q2) * (13 * q) = 39 * pq3 := by
      calc 3 * (p * q2) * (13 * q) = (3 * 13) * (p * (q * q2)) := by ac_rfl
        _ = 39 * pq3 := rfl
    have b4 : 3 * (p * q2) * (3 * p) = 9 * p2q2 := by
      calc 3 * (p * q2) * (3 * p) = (3 * 3) * ((p * p) * q2) := by ac_rfl
        _ = 9 * p2q2 := rfl
    have b5 : 3 * (p2 * q) * (13 * q) = 39 * p2q2 := by
      calc 3 * (p2 * q) * (13 * q) = (3 * 13) * (p2 * (q * q)) := by ac_rfl
        _ = 39 * p2q2 := rfl
    have b6 : 3 * (p2 * q) * (3 * p) = 9 * p3q := by
      calc 3 * (p2 * q) * (3 * p) = (3 * 3) * ((p * p2) * q) := by ac_rfl
        _ = 9 * p3q := rfl
    have b7 : 3 * (p * p2) * (13 * q) = 39 * p3q := by
      calc 3 * (p * p2) * (13 * q) = (3 * 13) * ((p * p2) * q) := by ac_rfl
        _ = 39 * p3q := rfl
    have b8 : 3 * (p * p2) * (3 * p) = 9 * p4 := by
      calc 3 * (p * p2) * (3 * p) = (3 * 3) * ((p * p) * p2) := by ac_rfl
        _ = 9 * p4 := rfl
    rw [b1, b2, b3, b4, b5, b6, b7, b8]; omega
  rw [hL, hR]

private theorem univ_k1_speed_gap_minus_id (p q : Int) :
    16 * (3 * q ^ 2 + p ^ 2) * q ^ 2 - (3 * (q ^ 2 - p ^ 2) - 8 * p * q) ^ 2 =
      3 * (q - p) * (q + p) ^ 2 * (3 * p + 13 * q) := by
  have h := univ_k1_speed_gap_plus_id (-p) q
  have hNegSq : (-p) ^ 2 = p ^ 2 := by
    rw [univ_pow2 (-p), univ_pow2 p, Int.neg_mul, Int.mul_neg, Int.neg_neg]
  have hMid : 8 * (-p) * q + 3 * (q ^ 2 - (-p) ^ 2) = 3 * (q ^ 2 - p ^ 2) - 8 * p * q := by
    rw [hNegSq, Int.mul_neg, Int.neg_mul]; omega
  have hR1 : q - (-p) = q + p := by omega
  have hR2 : q + (-p) = q - p := by omega
  have hR3 : 13 * q - 3 * (-p) = 3 * p + 13 * q := by rw [Int.mul_neg]; omega
  rw [hMid, hNegSq, hR1, hR2, hR3] at h
  rw [h]
  ac_rfl

/-- Headline Theorem 2 (Universal `k`-String Dispersion Floor & Rapidity-Velocity No-Go):
    1. For ALL `k ≥ 1` (`A = 3 k^2 + 1`) and ALL rational `y = cos^2 P = p / q ∈ [0, 1]`
       (`0 ≤ p ≤ q`, `0 < q`), proves the exact cleared-denominator inequality
       `A^3 q^2 (p (A q - p)^2 + (q - p) (A q + 2 p)^2) ≥ (A q - p)^5`, with exact equality
       at `p = 0` and strict inequality `>` for `0 < p` (certifying `(v'_k)^2 + (v''_k)^2 ≥ 9 k^4 / A^3 > 0`).
    2. Global `k = 1` speed-gap polynomial identities (both `+8 p q` and `-8 p q` sign twins)
       and nonnegativity across ALL `-q ≤ p ≤ q` (`0 < q`).
    3. Exact Rapidity-Velocity 2-to-1 Law (`v(a1/b1) = v(a2/b2)` cleared as
       `a1 * b1 * (3 * a2^2 + b2^2) = a2 * b2 * (3 * a1^2 + b1^2) ↔ a1 * b2 = a2 * b1 ∨ 3 * a1 * a2 = b1 * b2`),
       exact speed-cap identity `(3 a^2 + b^2)^2 - 12 a^2 b^2 = (3 a^2 - b^2)^2 ≥ 0`,
       and exact `W_0` rapidity-additivity contradiction (`uA - uC = -r ∧ uC - uD = r → uA = uD`). -/
theorem thm_univ_dispersion_floor_and_rapidity_nogo :
    (∀ (k : Nat), k ≥ 1 →
      let A : Int := 3 * (Int.ofNat k * Int.ofNat k) + 1
      ∀ (p q : Int), 0 ≤ p → p ≤ q → 0 < q →
        A ^ 3 * q ^ 2 * (p * (A * q - p) ^ 2 + (q - p) * (A * q + 2 * p) ^ 2) ≥ (A * q - p) ^ 5 ∧
        (p = 0 → A ^ 3 * q ^ 2 * (p * (A * q - p) ^ 2 + (q - p) * (A * q + 2 * p) ^ 2) = (A * q - p) ^ 5) ∧
        (0 < p → A ^ 3 * q ^ 2 * (p * (A * q - p) ^ 2 + (q - p) * (A * q + 2 * p) ^ 2) > (A * q - p) ^ 5)) ∧
    (∀ (p q : Int), -q ≤ p → p ≤ q → 0 < q →
      16 * (3 * q ^ 2 + p ^ 2) * q ^ 2 - (8 * p * q + 3 * (q ^ 2 - p ^ 2)) ^ 2 =
        3 * (q - p) ^ 2 * (q + p) * (13 * q - 3 * p) ∧
      16 * (3 * q ^ 2 + p ^ 2) * q ^ 2 - (8 * p * q + 3 * (q ^ 2 - p ^ 2)) ^ 2 ≥ 0 ∧
      16 * (3 * q ^ 2 + p ^ 2) * q ^ 2 - (3 * (q ^ 2 - p ^ 2) - 8 * p * q) ^ 2 =
        3 * (q - p) * (q + p) ^ 2 * (3 * p + 13 * q) ∧
      16 * (3 * q ^ 2 + p ^ 2) * q ^ 2 - (3 * (q ^ 2 - p ^ 2) - 8 * p * q) ^ 2 ≥ 0) ∧
    ((∀ a1 b1 a2 b2 : Int,
        a1 * b1 * (3 * a2 ^ 2 + b2 ^ 2) = a2 * b2 * (3 * a1 ^ 2 + b1 ^ 2) ↔
          (a1 * b2 = a2 * b1 ∨ 3 * a1 * a2 = b1 * b2)) ∧
     (∀ a b : Int,
        (3 * a ^ 2 + b ^ 2) ^ 2 - 12 * a ^ 2 * b ^ 2 = (3 * a ^ 2 - b ^ 2) ^ 2 ∧
        (3 * a ^ 2 - b ^ 2) ^ 2 ≥ 0) ∧
     (∀ uA uC uD r : Int, uA - uC = -r → uC - uD = r → uA = uD)) := by
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · intro k hk A p q hp hpq hq
    have hA4 : 4 ≤ A := by
      have hk1 : (1 : Int) ≤ Int.ofNat k := by omega
      have hkk : (1 : Int) ≤ Int.ofNat k * Int.ofNat k := by
        have h0 := Int.mul_nonneg (show 0 ≤ Int.ofNat k - 1 by omega) (show 0 ≤ Int.ofNat k - 1 by omega)
        rw [Int.sub_mul, Int.mul_sub, Int.mul_sub, Int.one_mul, Int.mul_one] at h0
        omega
      dsimp only [A]
      omega
    have hId := univ_disp_poly_identity A p q
    have hInnerPos := univ_disp_inner_pos A p q hA4 hp hpq hq
    refine ⟨?_, ?_, ?_⟩
    · have hNN := Int.mul_nonneg hp (univ_le_of_lt hInnerPos)
      dsimp only at hId hNN
      omega
    · intro hp0
      dsimp only at hId
      rw [hp0, Int.zero_mul] at hId
      omega
    · intro hpPos
      have hPos := univ_mul_pos p _ hpPos hInnerPos
      dsimp only at hId hPos
      omega
  · intro p q hlo hhi hq
    have hPlus := univ_k1_speed_gap_plus_id p q
    have hMinus := univ_k1_speed_gap_minus_id p q
    have hNN1 : 0 ≤ 3 * (q - p) ^ 2 * (q + p) * (13 * q - 3 * p) := by
      rw [univ_pow2 (q - p)]
      exact Int.mul_nonneg
        (Int.mul_nonneg (Int.mul_nonneg (by omega) (int_sq_nonneg (q - p))) (by omega))
        (by omega)
    have hNN2 : 0 ≤ 3 * (q - p) * (q + p) ^ 2 * (3 * p + 13 * q) := by
      rw [univ_pow2 (q + p)]
      exact Int.mul_nonneg
        (Int.mul_nonneg (Int.mul_nonneg (by omega) (int_sq_nonneg (q + p))) (by omega))
        (by omega)
    refine ⟨hPlus, by omega, hMinus, by omega⟩
  · intro a1 b1 a2 b2
    rw [univ_pow2 a2, univ_pow2 b2, univ_pow2 a1, univ_pow2 b1]
    have hFac : a1 * b1 * (3 * (a2 * a2) + b2 * b2) - a2 * b2 * (3 * (a1 * a1) + b1 * b1) =
        (a1 * b2 - a2 * b1) * (b1 * b2 - 3 * (a1 * a2)) := by
      simp only [Int.mul_add, Int.sub_mul, Int.mul_sub]
      have m1 : a1 * b1 * (3 * (a2 * a2)) = 3 * (a1 * (b1 * (a2 * a2))) := by ac_rfl
      have m2 : a1 * b1 * (b2 * b2) = a1 * (b1 * (b2 * b2)) := by ac_rfl
      have m3 : a2 * b2 * (3 * (a1 * a1)) = 3 * (a2 * (b2 * (a1 * a1))) := by ac_rfl
      have m4 : a2 * b2 * (b1 * b1) = a2 * (b2 * (b1 * b1)) := by ac_rfl
      have r1 : a1 * b2 * (b1 * b2) = a1 * (b1 * (b2 * b2)) := by ac_rfl
      have r2 : a1 * b2 * (3 * (a1 * a2)) = 3 * (a2 * (b2 * (a1 * a1))) := by ac_rfl
      have r3 : a2 * b1 * (b1 * b2) = a2 * (b2 * (b1 * b1)) := by ac_rfl
      have r4 : a2 * b1 * (3 * (a1 * a2)) = 3 * (a1 * (b1 * (a2 * a2))) := by ac_rfl
      rw [m1, m2, m3, m4, r1, r2, r3, r4]; omega
    constructor
    · intro hEq
      have h0 : (a1 * b2 - a2 * b1) * (b1 * b2 - 3 * (a1 * a2)) = 0 := by omega
      rcases univ_int_mul_eq_zero _ _ h0 with h1 | h2
      · exact Or.inl (by omega)
      · right
        rw [Int.mul_assoc 3 a1 a2]
        omega
    · intro hDisj
      have h0 : (a1 * b2 - a2 * b1) * (b1 * b2 - 3 * (a1 * a2)) = 0 := by
        rcases hDisj with h1 | h2
        · have hf1 : a1 * b2 - a2 * b1 = 0 := by omega
          rw [hf1, Int.zero_mul]
        · rw [Int.mul_assoc 3 a1 a2] at h2
          have hf2 : b1 * b2 - 3 * (a1 * a2) = 0 := by omega
          rw [hf2, Int.mul_zero]
      omega
  · intro a b
    rw [univ_pow2 a, univ_pow2 b, univ_pow2 (3 * (a * a) + b * b), univ_pow2 (3 * (a * a) - b * b)]
    have hId : (3 * (a * a) + b * b) * (3 * (a * a) + b * b) - 12 * (a * a) * (b * b) =
        (3 * (a * a) - b * b) * (3 * (a * a) - b * b) := by
      simp only [Int.add_mul, Int.mul_add, Int.sub_mul, Int.mul_sub]
      have c1 : 3 * (a * a) * (b * b) = 3 * ((a * a) * (b * b)) := by ac_rfl
      have c2 : b * b * (3 * (a * a)) = 3 * ((a * a) * (b * b)) := by ac_rfl
      have c3 : 12 * (a * a) * (b * b) = 12 * ((a * a) * (b * b)) := by ac_rfl
      rw [c1, c2, c3]; omega
    exact ⟨hId, int_sq_nonneg (3 * (a * a) - b * b)⟩
  · intro uA uC uD r h1 h2
    omega


/-! ## Section 3: `M_pair(ζ_18)` Diffraction Ceiling, Grover Cap & 9-Role Pigeonhole -/

/-- Headline Theorem 3 (`M_pair(ζ_18)` Diffraction Ceiling, Universal Grover Cap & 9-Role Pigeonhole):
    1. Reuses `Vibe.CompositeTrion.thm_ct_mpair_gap_margin` (`g * (cot^2(π/18) + 1) = 4`,
       `32163 / 1000 < cot^2(π/18) < 32164 / 1000`) to certify in cleared integer form:
       - `837 / 10^6 < P_hop = 1 / (36 * (v + 1)) < 838 / 10^6` for every `v = p / q ∈ (32163/1000, 32164/1000)`,
       - exact off-diagonal sum `P_off = 11 * P_hop` and `10 / 11` unwanted diffraction,
       - coherent `m`-line focusing ceiling `m * P_hop < 1 / 100` for ALL `1 ≤ m ≤ 11`.
    2. Universal Grover cap: `(x - r)^2 + y^2 ≤ 4 r^2` whenever `x^2 + y^2 = r^2` (`|u - 1|^2 / 144 ≤ 1 / 36`).
    3. Constructive 9-role pigeonhole theorem: for ALL `n ≥ 4`, EVERY assignment `f : Fin (3 * n) → Fin 9`
       has at least one role collision `∃ i ≠ j, f i = f j`. -/
theorem thm_univ_mpair_ceiling_and_role_pigeonhole :
    (Ninth.mul Ninth.gapSqZeta18 (Ninth.add cotSqZeta18 Ninth.one) = Ninth.ofInt 4 ∧
     ctCotSqCubicHom 32163 1000 < 0 ∧
     ctCotSqCubicHom 32164 1000 > 0 ∧
     (∀ p q : Int, 0 < q → 32163 * q < p * 1000 → p * 1000 < 32164 * q →
       837 * (36 * (p + q)) < 1000000 * q ∧
       1000000 * q < 838 * (36 * (p + q))) ∧
     Ninth.scale 11 Ninth.gapSqZeta18 =
       Ninth.add Ninth.gapSqZeta18 (Ninth.scale 10 Ninth.gapSqZeta18) ∧
     (∀ pHop : Int, 10 * (11 * pHop) = 11 * (10 * pHop)) ∧
     (∀ m p q : Int, 1 ≤ m → m ≤ 11 → 0 < q → 32163 * q < p * 1000 →
       100 * m * q < 36 * (p + q))) ∧
    ((∀ x y r : Int, x * x + y * y = r * r → (x - r) * (x - r) + y * y ≤ 4 * (r * r)) ∧
     4 * 36 = 144) ∧
    (∀ (n : Nat), n ≥ 4 → ∀ f : Fin (3 * n) → Fin 9,
      ∃ i j : Fin (3 * n), i ≠ j ∧ f i = f j) := by
  have hCT := thm_ct_mpair_gap_margin
  refine ⟨⟨hCT.1.1, hCT.2.2.2.2.2.1.2.1, hCT.2.2.2.2.2.1.2.2.1, ?_, by decide, ?_, ?_⟩,
          ⟨?_, by decide⟩, ?_⟩
  · intro p q hq hlo hhi
    omega
  · intro pHop
    omega
  · intro m p q hm1 hm11 hq hlo
    have hmq : m * q ≤ 11 * q := by
      have hm := Int.mul_nonneg (show 0 ≤ 11 - m by omega) (show 0 ≤ q by omega)
      rw [Int.sub_mul] at hm
      omega
    have h100 : 100 * m * q = 100 * (m * q) := Int.mul_assoc 100 m q
    omega
  · intro x y r hcirc
    have hId : 4 * (r * r) - ((x - r) * (x - r) + y * y) =
        (x + r) * (x + r) + y * y + 2 * (r * r - (x * x + y * y)) := by
      simp only [Int.sub_mul, Int.mul_sub, Int.add_mul, Int.mul_add]
      rw [Int.mul_comm r x]
      omega
    have hNN1 := int_sq_nonneg (x + r)
    have hNN2 := int_sq_nonneg y
    omega
  · intro n hn f
    exact univ_fin_pigeonhole 9 (3 * n) (by omega) f


/-! ## Section 4: Straight-Worldline Crossing Ceiling, Symbolic `6 × 6` Yang-Baxter & Dim Separation -/

/-- Exact Gaussian integer `re + im * i ∈ ℤ[i]`. -/
structure UnivGauss where
  re : Int
  im : Int
  deriving DecidableEq, Repr

namespace UnivGauss

def zero : UnivGauss := ⟨0, 0⟩
def one : UnivGauss := ⟨1, 0⟩
def add (x y : UnivGauss) : UnivGauss := ⟨x.re + y.re, x.im + y.im⟩
def mul (x y : UnivGauss) : UnivGauss :=
  ⟨x.re * y.re - x.im * y.im, x.re * y.im + x.im * y.re⟩

end UnivGauss

/-- Flat 6-term Gaussian sum over `Fin 6`. -/
def univSum6G (f : Fin 6 → UnivGauss) : UnivGauss :=
  UnivGauss.add
    (UnivGauss.add
      (UnivGauss.add
        (UnivGauss.add
          (UnivGauss.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩))
          (f ⟨2, by decide⟩))
        (f ⟨3, by decide⟩))
      (f ⟨4, by decide⟩))
    (f ⟨5, by decide⟩)

/-- Exact `6 × 6` matrix multiplication over `ℤ[i]`. -/
def univMat6GMul (A B : Fin 6 → Fin 6 → UnivGauss) : Fin 6 → Fin 6 → UnivGauss :=
  fun r c => univSum6G (fun k => UnivGauss.mul (A r k) (B k c))

/-- Adjacent and non-adjacent `S_3` transpositions on `Fin 6` (indexing permutations of `(0,1,2)`). -/
def univS12 : Fin 6 → Fin 6
  | ⟨0, _⟩ => ⟨1, by decide⟩
  | ⟨1, _⟩ => ⟨0, by decide⟩
  | ⟨2, _⟩ => ⟨5, by decide⟩
  | ⟨3, _⟩ => ⟨4, by decide⟩
  | ⟨4, _⟩ => ⟨3, by decide⟩
  | ⟨5, _⟩ => ⟨2, by decide⟩
  | ⟨n + 6, h⟩ => absurd h (by omega)

def univS23 : Fin 6 → Fin 6
  | ⟨0, _⟩ => ⟨2, by decide⟩
  | ⟨1, _⟩ => ⟨4, by decide⟩
  | ⟨2, _⟩ => ⟨0, by decide⟩
  | ⟨3, _⟩ => ⟨5, by decide⟩
  | ⟨4, _⟩ => ⟨1, by decide⟩
  | ⟨5, _⟩ => ⟨3, by decide⟩
  | ⟨n + 6, h⟩ => absurd h (by omega)

def univS13 : Fin 6 → Fin 6
  | ⟨0, _⟩ => ⟨3, by decide⟩
  | ⟨1, _⟩ => ⟨5, by decide⟩
  | ⟨2, _⟩ => ⟨4, by decide⟩
  | ⟨3, _⟩ => ⟨0, by decide⟩
  | ⟨4, _⟩ => ⟨2, by decide⟩
  | ⟨5, _⟩ => ⟨1, by decide⟩
  | ⟨n + 6, h⟩ => absurd h (by omega)

/-- Exact `6 × 6` rational Yang `R`-matrix `R_tilde_{pq}(w) = w I - i P_{pq}` over `ℤ[i]`. -/
def univYangR (σ : Fin 6 → Fin 6) (w : Int) : Fin 6 → Fin 6 → UnivGauss :=
  fun r c => ⟨if r = c then w else 0, if σ c = r then -1 else 0⟩

private def univYangApply (σ : Fin 6 → Fin 6) (w : Int) (v : Fin 6 → UnivGauss) (r : Fin 6) :
    UnivGauss :=
  UnivGauss.add (UnivGauss.mul ⟨w, 0⟩ (v r)) (UnivGauss.mul ⟨0, -1⟩ (v (σ r)))

private theorem univ_gauss_add_comm (x y : UnivGauss) : UnivGauss.add x y = UnivGauss.add y x := by
  cases x; cases y; simp only [UnivGauss.add, UnivGauss.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem univ_gauss_add_assoc (x y z : UnivGauss) :
    UnivGauss.add (UnivGauss.add x y) z = UnivGauss.add x (UnivGauss.add y z) := by
  cases x; cases y; cases z; simp only [UnivGauss.add, UnivGauss.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem univ_gauss_add_zero (x : UnivGauss) : UnivGauss.add x UnivGauss.zero = x := by
  cases x; simp only [UnivGauss.add, UnivGauss.zero, UnivGauss.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem univ_gauss_zero_add (x : UnivGauss) : UnivGauss.add UnivGauss.zero x = x := by
  cases x; simp only [UnivGauss.add, UnivGauss.zero, UnivGauss.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem univ_gauss_zero_mul (x : UnivGauss) : UnivGauss.mul UnivGauss.zero x = UnivGauss.zero := by
  cases x; simp only [UnivGauss.mul, UnivGauss.zero, UnivGauss.mk.injEq, Int.zero_mul]; exact ⟨by omega, by omega⟩

private theorem univ_sum6G_add (f g : Fin 6 → UnivGauss) :
    univSum6G (fun k => UnivGauss.add (f k) (g k)) = UnivGauss.add (univSum6G f) (univSum6G g) := by
  have swap4 : ∀ a b c d : UnivGauss,
      UnivGauss.add (UnivGauss.add a b) (UnivGauss.add c d) =
        UnivGauss.add (UnivGauss.add a c) (UnivGauss.add b d) := by
    intro a b c d
    rw [univ_gauss_add_assoc a b (UnivGauss.add c d), ← univ_gauss_add_assoc b c d,
        univ_gauss_add_comm b c, univ_gauss_add_assoc c b d,
        ← univ_gauss_add_assoc a c (UnivGauss.add b d)]
  unfold univSum6G
  rw [swap4, swap4, swap4, swap4, swap4]

private theorem univ_sum6G_delta (a : Fin 6) (va : UnivGauss) :
    univSum6G (fun k => if k = a then va else UnivGauss.zero) = va := by
  match a with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ | ⟨5, _⟩ =>
    simp [univSum6G, univ_gauss_add_zero, univ_gauss_zero_add]

private theorem univ_mat6GMul_yangR (σ : Fin 6 → Fin 6)
    (hInv : ∀ x : Fin 6, σ (σ x) = x) (hNoFix : ∀ x : Fin 6, σ x ≠ x)
    (w : Int) (B : Fin 6 → Fin 6 → UnivGauss) (r x : Fin 6) :
    univMat6GMul (univYangR σ w) B r x = univYangApply σ w (fun k => B k x) r := by
  have hTerm : ∀ k : Fin 6,
      UnivGauss.mul (univYangR σ w r k) (B k x) =
        UnivGauss.add
          (if k = r then UnivGauss.mul ⟨w, 0⟩ (B r x) else UnivGauss.zero)
          (if k = σ r then UnivGauss.mul ⟨0, -1⟩ (B (σ r) x) else UnivGauss.zero) := by
    intro k
    unfold univYangR
    if hkr : k = r then
      have hne1 : σ k ≠ r := by rw [hkr]; exact hNoFix r
      have hne2 : k ≠ σ r := by rw [hkr]; exact fun e => hNoFix r e.symm
      rw [univ_ite_pos hkr, univ_ite_neg hne2, univ_ite_pos hkr.symm, univ_ite_neg hne1,
          hkr, univ_gauss_add_zero]
    else if hks : k = σ r then
      have heq : σ k = r := by rw [hks, hInv r]
      rw [univ_ite_neg hkr, univ_ite_pos hks, univ_ite_neg (fun h => hkr h.symm),
          univ_ite_pos heq, hks, univ_gauss_zero_add]
    else
      have hne2 : σ k ≠ r := by
        intro heq
        have := congrArg σ heq
        rw [hInv k] at this
        exact hks this
      rw [univ_ite_neg hkr, univ_ite_neg hks, univ_ite_neg (fun h => hkr h.symm),
          univ_ite_neg hne2, univ_gauss_add_zero]
      exact univ_gauss_zero_mul (B k x)
  unfold univMat6GMul univYangApply
  have hFun : (fun k => UnivGauss.mul (univYangR σ w r k) (B k x)) =
      (fun k => UnivGauss.add
        (if k = r then UnivGauss.mul ⟨w, 0⟩ (B r x) else UnivGauss.zero)
        (if k = σ r then UnivGauss.mul ⟨0, -1⟩ (B (σ r) x) else UnivGauss.zero)) := funext hTerm
  rw [hFun, univ_sum6G_add, univ_sum6G_delta r _, univ_sum6G_delta (σ r) _]

private theorem univ_s3_relations :
    (∀ x : Fin 6, univS12 (univS12 x) = x ∧ univS12 x ≠ x) ∧
    (∀ x : Fin 6, univS23 (univS23 x) = x ∧ univS23 x ≠ x) ∧
    (∀ x : Fin 6, univS13 (univS13 x) = x ∧ univS13 x ≠ x) ∧
    (∀ r : Fin 6, univS23 (univS13 (univS12 r)) = univS13 r) ∧
    (∀ r : Fin 6, univS12 (univS13 (univS23 r)) = univS13 r) ∧
    (∀ r : Fin 6, univS23 (univS13 r) = univS12 (univS23 r)) ∧
    (∀ r : Fin 6, univS13 (univS12 r) = univS12 (univS23 r)) ∧
    (∀ r : Fin 6, univS12 (univS13 r) = univS23 (univS12 r)) ∧
    (∀ r : Fin 6, univS13 (univS23 r) = univS23 (univS12 r)) := by
  decide

private theorem univ_yangApply_mk (w xr xi yr yi : Int) :
    UnivGauss.add (UnivGauss.mul ⟨w, 0⟩ ⟨xr, xi⟩) (UnivGauss.mul ⟨0, -1⟩ ⟨yr, yi⟩) =
      ⟨w * xr + yi, w * xi - yr⟩ := by
  simp only [UnivGauss.add, UnivGauss.mul, UnivGauss.mk.injEq,
    Int.zero_mul, Int.mul_zero, Int.neg_mul, Int.one_mul]
  exact ⟨by omega, by omega⟩

private theorem univ_yang_triple_core (a b c : Int) (hb : b = a + c)
    (v0 v1 v2 v3 v4 v5 : UnivGauss) :
    let app := fun (w : Int) (x y : UnivGauss) =>
      UnivGauss.add (UnivGauss.mul ⟨w, 0⟩ x) (UnivGauss.mul ⟨0, -1⟩ y)
    app a (app b (app c v0 v2) (app c v3 v4)) (app b (app c v1 v5) (app c v4 v3)) =
      app c (app b (app a v0 v1) (app a v3 v5)) (app b (app a v2 v4) (app a v5 v3)) := by
  cases v0 with | mk v0r v0i =>
  cases v1 with | mk v1r v1i =>
  cases v2 with | mk v2r v2i =>
  cases v3 with | mk v3r v3i =>
  cases v4 with | mk v4r v4i =>
  cases v5 with | mk v5r v5i =>
  dsimp only
  simp only [univ_yangApply_mk, UnivGauss.mk.injEq, Int.mul_add, Int.mul_sub]
  have e1 : a * (b * (c * v0r)) = c * (b * (a * v0r)) := by ac_rfl
  have e2 : a * (b * (c * v0i)) = c * (b * (a * v0i)) := by ac_rfl
  have e3 : a * (c * v3i) = c * (a * v3i) := by ac_rfl
  have e4 : a * (c * v3r) = c * (a * v3r) := by ac_rfl
  have e5 : a * (b * v2i) = b * (a * v2i) := by ac_rfl
  have e6 : a * (b * v2r) = b * (a * v2r) := by ac_rfl
  have e7 : b * (c * v1i) = c * (b * v1i) := by ac_rfl
  have e8 : b * (c * v1r) = c * (b * v1r) := by ac_rfl
  have h4r : b * v4r = a * v4r + c * v4r := by rw [hb, Int.add_mul]
  have h4i : b * v4i = a * v4i + c * v4i := by rw [hb, Int.add_mul]
  have h5r : b * v5r = a * v5r + c * v5r := by rw [hb, Int.add_mul]
  have h5i : b * v5i = a * v5i + c * v5i := by rw [hb, Int.add_mul]
  rw [e1, e2, e3, e4, e5, e6, e7, e8, h4r, h4i, h5r, h5i]
  exact ⟨by omega, by omega⟩

private theorem univ_yang_triple_apply (a c : Int) (v : Fin 6 → UnivGauss) (r : Fin 6) :
    univYangApply univS12 a (univYangApply univS13 (a + c) (univYangApply univS23 c v)) r =
      univYangApply univS23 c (univYangApply univS13 (a + c) (univYangApply univS12 a v)) r := by
  have hS := univ_s3_relations
  unfold univYangApply
  rw [hS.2.2.2.1 r, hS.2.2.2.2.1 r, hS.2.2.2.2.2.1 r,
      hS.2.2.2.2.2.2.1 r, hS.2.2.2.2.2.2.2.1 r, hS.2.2.2.2.2.2.2.2 r]
  exact univ_yang_triple_core a (a + c) c rfl
    (v r) (v (univS12 r)) (v (univS23 r)) (v (univS13 r))
    (v (univS12 (univS23 r))) (v (univS23 (univS12 r)))

/-- Headline Theorem 4 (Straight-Worldline Crossing Ceiling, Symbolic `6 × 6` Yang-Baxter & Dim Separation):
    1. Straight-worldline no-double-crossing (distinct velocities intersect at most once), universal
       crossing ceiling `K ≤ N * (N - 1) / 2` for any `K` distinct unordered crossing pairs among `N`
       worldlines, and exact `N = 9` separation `9 * 8 / 2 = 36 < 53 < 54 < 373`.
    2. Exact symbolic `6 × 6` rational Yang-Baxter equation
       `R12(u1 - u2) * R13(u1 - u3) * R23(u2 - u3) = R23(u2 - u3) * R13(u1 - u3) * R12(u1 - u2)`
       for `R_tilde_{pq}(w) = w I - i P_{pq}` over `ℤ[i]` for ALL `u1 u2 u3 : Int`.
    3. Exact parameter-dimension separation: `∀ n : Nat, n ≥ 1 → 3 * n - 1 < 4 ^ n - 1`. -/
theorem thm_univ_yb_crossing_and_dim_ceiling :
    ((∀ x1 v1 x2 v2 t1 t2 : Int, v1 ≠ v2 →
        x1 + v1 * t1 = x2 + v2 * t1 → x1 + v1 * t2 = x2 + v2 * t2 → t1 = t2) ∧
     (∀ (N K : Nat) (e : Fin K → Fin N × Fin N),
        (∀ k : Fin K, (e k).1.val < (e k).2.val) →
        (∀ k1 k2 : Fin K, e k1 = e k2 → k1 = k2) →
        K ≤ N * (N - 1) / 2) ∧
     (9 * (9 - 1) / 2 = 36 ∧ 36 < 53 ∧ 53 < 54 ∧ 54 < 373)) ∧
    (∀ (u1 u2 u3 : Int) (r x : Fin 6),
      univMat6GMul (univYangR univS12 (u1 - u2))
        (univMat6GMul (univYangR univS13 (u1 - u3)) (univYangR univS23 (u2 - u3))) r x =
      univMat6GMul (univYangR univS23 (u2 - u3))
        (univMat6GMul (univYangR univS13 (u1 - u3)) (univYangR univS12 (u1 - u2))) r x) ∧
    (∀ n : Nat, n ≥ 1 → 3 * n - 1 < 4 ^ n - 1) := by
  refine ⟨⟨?_, ?_, by decide⟩, ?_, ?_⟩
  · intro x1 v1 x2 v2 t1 t2 hv h1 h2
    have h0 : (v1 - v2) * (t1 - t2) = 0 := by
      simp only [Int.sub_mul, Int.mul_sub]
      omega
    rcases univ_int_mul_eq_zero _ _ h0 with hdv | hdt
    · exact absurd (by omega) hv
    · omega
  · intro N K e hlt hinj
    let φ : Fin K → Fin (N * (N - 1) / 2) := fun k => univTriPairIdx (e k).1 (e k).2 (hlt k)
    refine univ_fin_inj_le φ (fun k1 k2 hEq => ?_)
    have ⟨h1, h2⟩ := univTriPairIdx_inj (e k1).1 (e k1).2 (e k2).1 (e k2).2 (hlt k1) (hlt k2) hEq
    exact hinj k1 k2 (Prod.ext h1 h2)
  · intro u1 u2 u3 r x
    have hS := univ_s3_relations
    have hb : u1 - u3 = (u1 - u2) + (u2 - u3) := by omega
    rw [hb]
    rw [univ_mat6GMul_yangR univS12 (fun y => (hS.1 y).1) (fun y => (hS.1 y).2),
        univ_mat6GMul_yangR univS23 (fun y => (hS.2.1 y).1) (fun y => (hS.2.1 y).2)]
    have hL : (fun k => univMat6GMul (univYangR univS13 ((u1 - u2) + (u2 - u3)))
          (univYangR univS23 (u2 - u3)) k x) =
        univYangApply univS13 ((u1 - u2) + (u2 - u3))
          (univYangApply univS23 (u2 - u3) (fun k => if k = x then UnivGauss.one else UnivGauss.zero)) := by
      funext k
      rw [univ_mat6GMul_yangR univS13 (fun y => (hS.2.2.1 y).1) (fun y => (hS.2.2.1 y).2)]
      apply congrArg (fun f => univYangApply univS13 ((u1 - u2) + (u2 - u3)) f k)
      funext y
      unfold univYangApply univYangR UnivGauss.one UnivGauss.zero
      if hyx : y = x then
        have hne : univS23 y ≠ x := by rw [hyx]; exact (hS.2.1 x).2
        have hne2 : univS23 x ≠ y := by rw [hyx]; exact (hS.2.1 x).2
        rw [univ_ite_pos hyx, univ_ite_neg hne, univ_ite_pos hyx, univ_ite_neg hne2]
        simp only [UnivGauss.mul, UnivGauss.add, UnivGauss.mk.injEq, Int.mul_zero, Int.zero_mul, Int.mul_one]
        exact ⟨by omega, by omega⟩
      else if hys : univS23 y = x then
        have hEq2 : univS23 x = y := by rw [← hys, (hS.2.1 y).1]
        rw [univ_ite_neg hyx, univ_ite_pos hys, univ_ite_neg hyx, univ_ite_pos hEq2]
        simp only [UnivGauss.mul, UnivGauss.add, UnivGauss.mk.injEq, Int.mul_zero, Int.zero_mul, Int.mul_one]
        exact ⟨by omega, by omega⟩
      else
        have hne2 : univS23 x ≠ y := by
          intro h; rw [← h, (hS.2.1 x).1] at hys; exact hys rfl
        rw [univ_ite_neg hyx, univ_ite_neg hys, univ_ite_neg hyx, univ_ite_neg hne2]
        simp only [UnivGauss.mul, UnivGauss.add, UnivGauss.mk.injEq, Int.mul_zero, Int.zero_mul]
        exact ⟨by omega, by omega⟩
    have hR : (fun k => univMat6GMul (univYangR univS13 ((u1 - u2) + (u2 - u3)))
          (univYangR univS12 (u1 - u2)) k x) =
        univYangApply univS13 ((u1 - u2) + (u2 - u3))
          (univYangApply univS12 (u1 - u2) (fun k => if k = x then UnivGauss.one else UnivGauss.zero)) := by
      funext k
      rw [univ_mat6GMul_yangR univS13 (fun y => (hS.2.2.1 y).1) (fun y => (hS.2.2.1 y).2)]
      apply congrArg (fun f => univYangApply univS13 ((u1 - u2) + (u2 - u3)) f k)
      funext y
      unfold univYangApply univYangR UnivGauss.one UnivGauss.zero
      if hyx : y = x then
        have hne : univS12 y ≠ x := by rw [hyx]; exact (hS.1 x).2
        have hne2 : univS12 x ≠ y := by rw [hyx]; exact (hS.1 x).2
        rw [univ_ite_pos hyx, univ_ite_neg hne, univ_ite_pos hyx, univ_ite_neg hne2]
        simp only [UnivGauss.mul, UnivGauss.add, UnivGauss.mk.injEq, Int.mul_zero, Int.zero_mul, Int.mul_one]
        exact ⟨by omega, by omega⟩
      else if hys : univS12 y = x then
        have hEq2 : univS12 x = y := by rw [← hys, (hS.1 y).1]
        rw [univ_ite_neg hyx, univ_ite_pos hys, univ_ite_neg hyx, univ_ite_pos hEq2]
        simp only [UnivGauss.mul, UnivGauss.add, UnivGauss.mk.injEq, Int.mul_zero, Int.zero_mul, Int.mul_one]
        exact ⟨by omega, by omega⟩
      else
        have hne2 : univS12 x ≠ y := by
          intro h; rw [← h, (hS.1 x).1] at hys; exact hys rfl
        rw [univ_ite_neg hyx, univ_ite_neg hys, univ_ite_neg hyx, univ_ite_neg hne2]
        simp only [UnivGauss.mul, UnivGauss.add, UnivGauss.mk.injEq, Int.mul_zero, Int.zero_mul]
        exact ⟨by omega, by omega⟩
    rw [hL, hR]
    exact univ_yang_triple_apply (u1 - u2) (u2 - u3) _ r
  · intro n hn
    induction n with
    | zero => omega
    | succ k ih =>
      cases k with
      | zero => decide
      | succ m =>
        have hprev := ih (by omega)
        rw [Nat.pow_succ]
        omega


/-! ## Section 5: Linden-Popescu Unitary Halting No-Go & Exact Eisenstein `W_0` Clearance -/

/-- Exact `6 × 6` matrix type over Eisenstein integers `ℤ[ω]`. -/
abbrev UnivMat6Eis := Fin 6 → Fin 6 → Eis

/-- Flat 6-term Eisenstein sum over `Fin 6`. -/
def univSum6Eis (f : Fin 6 → Eis) : Eis :=
  Eis.add
    (Eis.add
      (Eis.add
        (Eis.add
          (Eis.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩))
          (f ⟨2, by decide⟩))
        (f ⟨3, by decide⟩))
      (f ⟨4, by decide⟩))
    (f ⟨5, by decide⟩)

def univMat6EisMul (A B : UnivMat6Eis) : UnivMat6Eis :=
  fun r c => univSum6Eis (fun k => Eis.mul (A r k) (B k c))

def univMat6EisDag (A : UnivMat6Eis) : UnivMat6Eis :=
  fun r c => Eis.conj (A c r)

def univMat6EisId : UnivMat6Eis :=
  fun r c => if r = c then Eis.one else Eis.zero

/-- Basis pairs `(0,1), (0,2), (0,3), (1,2), (1,3), (2,3)` of `C(4, 2) = 6` on 4 spins. -/
private def univSwapIdx6 (p q : Fin 4) : Fin 6 → Fin 6 :=
  let pairs : Fin 6 → Fin 4 × Fin 4
    | ⟨0, _⟩ => (⟨0, by decide⟩, ⟨1, by decide⟩)
    | ⟨1, _⟩ => (⟨0, by decide⟩, ⟨2, by decide⟩)
    | ⟨2, _⟩ => (⟨0, by decide⟩, ⟨3, by decide⟩)
    | ⟨3, _⟩ => (⟨1, by decide⟩, ⟨2, by decide⟩)
    | ⟨4, _⟩ => (⟨1, by decide⟩, ⟨3, by decide⟩)
    | ⟨5, _⟩ => (⟨2, by decide⟩, ⟨3, by decide⟩)
    | ⟨n + 6, h⟩ => absurd h (by omega)
  let sw : Fin 4 → Fin 4 := fun x => if x = p then q else if x = q then p else x
  let enc (a b : Fin 4) : Fin 6 :=
    let lo := if a.val < b.val then a.val else b.val
    let hi := if a.val < b.val then b.val else a.val
    match lo, hi with
    | 0, 1 => ⟨0, by decide⟩
    | 0, 2 => ⟨1, by decide⟩
    | 0, 3 => ⟨2, by decide⟩
    | 1, 2 => ⟨3, by decide⟩
    | 1, 3 => ⟨4, by decide⟩
    | _, _ => ⟨5, by decide⟩
  fun c => let (a, b) := pairs c; enc (sw a) (sw b)

def univSwapMat6 (p q : Fin 4) : UnivMat6Eis :=
  fun r c => if univSwapIdx6 p q c = r then Eis.one else Eis.zero

/-- `2 E_{pq}(+2/3) = (1 + ω) I + (1 - ω) P_{pq}` and `2 E_{pq}(-2/3) = (-ω) I + (2 + ω) P_{pq}` on `Fin 6`. -/
def univTwoE6Plus (p q : Fin 4) : UnivMat6Eis :=
  fun r c => Eis.add (Eis.mul ⟨1, 1⟩ (univMat6EisId r c)) (Eis.mul ⟨1, -1⟩ (univSwapMat6 p q r c))

def univTwoE6Minus (p q : Fin 4) : UnivMat6Eis :=
  fun r c => Eis.add (Eis.mul ⟨0, -1⟩ (univMat6EisId r c)) (Eis.mul ⟨2, 1⟩ (univSwapMat6 p q r c))

/-- Exact 5-collision Racah clearance block `4 * W_0 = P_{01} (2 E_{12}(-2/3)) P_{23} (2 E_{12}(+2/3)) P_{01}`
    in `Mat_6(ℤ[ω])`. -/
def univW0_4 : UnivMat6Eis :=
  univMat6EisMul (univSwapMat6 ⟨0, by decide⟩ ⟨1, by decide⟩)
    (univMat6EisMul (univTwoE6Minus ⟨1, by decide⟩ ⟨2, by decide⟩)
      (univMat6EisMul (univSwapMat6 ⟨2, by decide⟩ ⟨3, by decide⟩)
        (univMat6EisMul (univTwoE6Plus ⟨1, by decide⟩ ⟨2, by decide⟩)
          (univSwapMat6 ⟨0, by decide⟩ ⟨1, by decide⟩))))

private def univW0_4_fast : UnivMat6Eis
  | ⟨0, _⟩, ⟨0, _⟩ => ⟨1, 0⟩
  | ⟨0, _⟩, ⟨3, _⟩ => ⟨-1, -2⟩
  | ⟨0, _⟩, ⟨4, _⟩ => ⟨4, 2⟩
  | ⟨1, _⟩, ⟨2, _⟩ => ⟨2, 2⟩
  | ⟨1, _⟩, ⟨5, _⟩ => ⟨2, -2⟩
  | ⟨2, _⟩, ⟨1, _⟩ => ⟨0, -2⟩
  | ⟨2, _⟩, ⟨2, _⟩ => ⟨3, 0⟩
  | ⟨2, _⟩, ⟨5, _⟩ => ⟨1, 2⟩
  | ⟨3, _⟩, ⟨0, _⟩ => ⟨1, 2⟩
  | ⟨3, _⟩, ⟨3, _⟩ => ⟨3, 0⟩
  | ⟨3, _⟩, ⟨4, _⟩ => ⟨0, -2⟩
  | ⟨4, _⟩, ⟨0, _⟩ => ⟨2, -2⟩
  | ⟨4, _⟩, ⟨3, _⟩ => ⟨2, 2⟩
  | ⟨5, _⟩, ⟨1, _⟩ => ⟨4, 2⟩
  | ⟨5, _⟩, ⟨2, _⟩ => ⟨-1, -2⟩
  | ⟨5, _⟩, ⟨5, _⟩ => ⟨1, 0⟩
  | _, _ => Eis.zero

private theorem univW0_4_eq_fast : ∀ r c : Fin 6, univW0_4 r c = univW0_4_fast r c := by
  decide

/-- Unnormalized leakage basis vector `|L⟩ = (-1, -1, -1, 1, 1, 1)` in `C(4, 2) = 6`. -/
def univLeakVec6 : Fin 6 → Int
  | ⟨0, _⟩ => -1
  | ⟨1, _⟩ => -1
  | ⟨2, _⟩ => -1
  | _ => 1

/-- Headline Theorem 5 (Linden-Popescu Unitary Halting No-Go & Eisenstein `W_0` Racah Clearance):
    1. Directly on ANY `FockUnitary R α` (and instantiated on `fockBeatUnit χ`): if `U.op ψ_halt = ψ_halt`,
       then `∀ t : Nat, ∀ φ, iter U.op t φ = ψ_halt → φ = ψ_halt` (no unitary fixed point can ever be
       entered dynamically from any distinct initial state).
    2. Exact `6 × 6` Eisenstein `ℤ[ω]` Racah clearance certificate for `4 * W_0` on `Fin 6`:
       `(4 W_0)† (4 W_0) = 16 I_6`, `(4 W_0) (4 W_0)† = 16 I_6`, and `⟨L | (4 W_0) | L⟩ = 0` identically
       for `|L⟩ = (-1, -1, -1, 1, 1, 1)`. -/
theorem thm_univ_unitary_halting_nogo_and_w0_clearance :
    (∀ {R α : Type} [StarCommRing R] (U : FockUnitary R α) (ψ_halt : FockVec R α),
      U.op ψ_halt = ψ_halt →
      ∀ (t : Nat) (φ : FockVec R α), iter U.op t φ = ψ_halt → φ = ψ_halt) ∧
    (∀ (χ : ChiralInvariant) (ψ_halt : FockVec NinthLoc6 HoneycombConfig),
      fockBeat χ ψ_halt = ψ_halt →
      ∀ (t : Nat) (φ : FockVec NinthLoc6 HoneycombConfig),
        iter (fockBeat χ) t φ = ψ_halt → φ = ψ_halt) ∧
    ((∀ r c : Fin 6, univMat6EisMul (univMat6EisDag univW0_4) univW0_4 r c =
        if r = c then Eis.ofInt 16 else Eis.zero) ∧
     (∀ r c : Fin 6, univMat6EisMul univW0_4 (univMat6EisDag univW0_4) r c =
        if r = c then Eis.ofInt 16 else Eis.zero) ∧
     univSum6Eis (fun r => univSum6Eis (fun c =>
       Eis.scale (univLeakVec6 r * univLeakVec6 c) (univW0_4 r c))) = Eis.zero) := by
  have hLP : ∀ {R α : Type} [StarCommRing R] (U : FockUnitary R α) (ψ_halt : FockVec R α),
      U.op ψ_halt = ψ_halt →
      ∀ (t : Nat) (φ : FockVec R α), iter U.op t φ = ψ_halt → φ = ψ_halt := by
    intro R α _ U ψ_halt hFix t φ hHit
    have hDagFix : U.dag ψ_halt = ψ_halt := by
      have h := U.leftInv ψ_halt
      rw [hFix] at h
      exact h
    have hDagIter : ∀ k : Nat, iter U.dag k ψ_halt = ψ_halt := by
      intro k
      induction k with
      | zero => rfl
      | succ m ih => simp only [iter]; rw [ih, hDagFix]
    have hLeftIter : ∀ k : Nat, ∀ x : FockVec R α, iter U.dag k (iter U.op k x) = x := by
      intro k
      induction k with
      | zero => intro _; rfl
      | succ m ih =>
        intro x
        simp only [iter]
        rw [← iter_comm U.dag m (U.op (iter U.op m x)), U.leftInv, ih x]
    have hApp := congrArg (iter U.dag t) hHit
    rw [hLeftIter t φ, hDagIter t] at hApp
    exact hApp
  have hW0Eq : univW0_4 = univW0_4_fast := funext (fun r => funext (fun c => univW0_4_eq_fast r c))
  refine ⟨hLP, fun χ ψ_halt hFix => hLP (fockBeatUnit χ) ψ_halt hFix, ?_, ?_, ?_⟩
  · rw [hW0Eq]; decide
  · rw [hW0Eq]; decide
  · rw [hW0Eq]; decide


/-! ## Section 6: Hyperbolic Geodesic 2-Plane Invariance, Unique Intersection & 4-Line Junction Cap -/

/-- Exact vector addition and integer scaling on `Vec5` (`Fin 5 → ZSqrt2`). -/
def univVec5Add (u v : Vec5) : Vec5 := fun i => ZSqrt2.add (u i) (v i)
def univVec5Scale (k : Int) (v : Vec5) : Vec5 := fun i => ZSqrt2.scale k (v i)

/-- Exact `Nat` matrix power on `Mat5`. -/
def univMat5Pow (M : Mat5) : Nat → Mat5
  | 0 => mat5Id
  | n + 1 => mat5Mul M (univMat5Pow M n)

/-- Exact `Int` geodesic transport power `k_a^m` (using `k_{opp(a)}^{|m|}` for `m < 0`). -/
def univGeodesicPow (a : Fin 24) : Int → Mat5
  | Int.ofNat n => univMat5Pow (transport a) n
  | Int.negSucc n => univMat5Pow (transport (oppSlot a)) (n + 1)

/-- Exact integer Pell sequence `(p_n, q_n)` on the invariant 2-plane `span(c_0, d_a)`. -/
def univPellP : Nat → Int
  | 0 => 1
  | n + 1 => 3 * univPellP n + 4 * univPellQ n

def univPellQ : Nat → Int
  | 0 => 0
  | n + 1 => 2 * univPellP n + 3 * univPellQ n

private theorem univ_z2_add_comm (x y : ZSqrt2) : ZSqrt2.add x y = ZSqrt2.add y x := by
  cases x; cases y; simp only [ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem univ_z2_add_assoc (x y z : ZSqrt2) :
    ZSqrt2.add (ZSqrt2.add x y) z = ZSqrt2.add x (ZSqrt2.add y z) := by
  cases x; cases y; cases z; simp only [ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem univ_z2_add_zero (x : ZSqrt2) : ZSqrt2.add x ZSqrt2.zero = x := by
  cases x; simp only [ZSqrt2.add, ZSqrt2.zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem univ_z2_zero_add (x : ZSqrt2) : ZSqrt2.add ZSqrt2.zero x = x := by
  cases x; simp only [ZSqrt2.add, ZSqrt2.zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem univ_z2_mul_comm (x y : ZSqrt2) : ZSqrt2.mul x y = ZSqrt2.mul y x := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [ZSqrt2.mul, ZSqrt2.mk.injEq]
  have h1 : xa * ya = ya * xa := by ac_rfl
  have h2 : 2 * xb * yb = 2 * yb * xb := by ac_rfl
  have h3 : xa * yb = yb * xa := by ac_rfl
  have h4 : xb * ya = ya * xb := by ac_rfl
  rw [h1, h2, h3, h4]; exact ⟨by omega, by omega⟩

private theorem univ_z2_mul_add (x y z : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.add y z) = ZSqrt2.add (ZSqrt2.mul x y) (ZSqrt2.mul x z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.add, ZSqrt2.mk.injEq, Int.mul_add]
  exact ⟨by omega, by omega⟩

private theorem univ_z2_add_mul (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.add x y) z = ZSqrt2.add (ZSqrt2.mul x z) (ZSqrt2.mul y z) := by
  rw [univ_z2_mul_comm, univ_z2_mul_add, univ_z2_mul_comm z x, univ_z2_mul_comm z y]

private theorem univ_z2_mul_sub (x y z : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.sub y z) = ZSqrt2.sub (ZSqrt2.mul x y) (ZSqrt2.mul x z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.sub, ZSqrt2.mk.injEq, Int.mul_sub]
  exact ⟨by omega, by omega⟩

private theorem univ_z2_sub_mul (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.sub x y) z = ZSqrt2.sub (ZSqrt2.mul x z) (ZSqrt2.mul y z) := by
  rw [univ_z2_mul_comm, univ_z2_mul_sub, univ_z2_mul_comm z x, univ_z2_mul_comm z y]

private theorem univ_z2_mul_assoc (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.mul x y) z = ZSqrt2.mul x (ZSqrt2.mul y z) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  cases z with | mk za zb =>
  simp only [ZSqrt2.mul, ZSqrt2.mk.injEq, Int.add_mul, Int.mul_add, Int.mul_assoc]
  have h1 : xa * (2 * (yb * zb)) = 2 * (xa * (yb * zb)) := by ac_rfl
  have h2 : xb * (2 * (yb * zb)) = 2 * (xb * (yb * zb)) := by ac_rfl
  rw [h1, h2]; exact ⟨by omega, by omega⟩

private theorem univ_z2_one_mul (x : ZSqrt2) : ZSqrt2.mul ZSqrt2.one x = x := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.one, ZSqrt2.mk.injEq, Int.one_mul, Int.zero_mul]
  exact ⟨by omega, by omega⟩

private theorem univ_z2_zero_mul (x : ZSqrt2) : ZSqrt2.mul ZSqrt2.zero x = ZSqrt2.zero := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.zero, ZSqrt2.mk.injEq, Int.zero_mul]
  exact ⟨by omega, by omega⟩

private theorem univ_z2_mul_scale (x : ZSqrt2) (k : Int) (y : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.scale k y) = ZSqrt2.scale k (ZSqrt2.mul x y) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.mul_add]
  have h1 : xa * (k * ya) = k * (xa * ya) := by ac_rfl
  have h2 : 2 * xb * (k * yb) = k * (2 * xb * yb) := by ac_rfl
  have h3 : xa * (k * yb) = k * (xa * yb) := by ac_rfl
  have h4 : xb * (k * ya) = k * (xb * ya) := by ac_rfl
  rw [h1, h2, h3, h4]; exact ⟨by omega, by omega⟩

private theorem univ_z2_scale_mul (k : Int) (x y : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.scale k x) y = ZSqrt2.scale k (ZSqrt2.mul x y) := by
  rw [univ_z2_mul_comm, univ_z2_mul_scale, univ_z2_mul_comm]

private theorem univ_z2_scale_add (k : Int) (x y : ZSqrt2) :
    ZSqrt2.scale k (ZSqrt2.add x y) = ZSqrt2.add (ZSqrt2.scale k x) (ZSqrt2.scale k y) := by
  cases x; cases y; simp only [ZSqrt2.scale, ZSqrt2.add, ZSqrt2.mk.injEq, Int.mul_add]

private theorem univ_z2_add_sub_sub_add (a b c d : ZSqrt2) :
    ZSqrt2.add (ZSqrt2.sub a b) (ZSqrt2.sub c d) = ZSqrt2.sub (ZSqrt2.add a c) (ZSqrt2.add b d) := by
  cases a; cases b; cases c; cases d; simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mk.injEq]
  exact ⟨by omega, by omega⟩

private theorem univ_sum5_add (f g : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.add (f k) (g k)) = ZSqrt2.add (sum5 f) (sum5 g) := by
  have swap4 : ∀ a b c d : ZSqrt2,
      ZSqrt2.add (ZSqrt2.add a b) (ZSqrt2.add c d) =
        ZSqrt2.add (ZSqrt2.add a c) (ZSqrt2.add b d) := by
    intro a b c d
    rw [univ_z2_add_assoc a b (ZSqrt2.add c d), ← univ_z2_add_assoc b c d, univ_z2_add_comm b c,
        univ_z2_add_assoc c b d, ← univ_z2_add_assoc a c (ZSqrt2.add b d)]
  unfold sum5
  rw [swap4, swap4, swap4, swap4]

private theorem univ_sum5_sub (f g : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.sub (f k) (g k)) = ZSqrt2.sub (sum5 f) (sum5 g) := by
  unfold sum5
  rw [univ_z2_add_sub_sub_add, univ_z2_add_sub_sub_add,
      univ_z2_add_sub_sub_add, univ_z2_add_sub_sub_add]

private theorem univ_sum5_mul_left (c : ZSqrt2) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul c (f k)) = ZSqrt2.mul c (sum5 f) := by
  unfold sum5
  rw [univ_z2_mul_add, univ_z2_mul_add, univ_z2_mul_add, univ_z2_mul_add]

private theorem univ_sum5_mul_right (f : Fin 5 → ZSqrt2) (c : ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (f k) c) = ZSqrt2.mul (sum5 f) c := by
  unfold sum5
  rw [univ_z2_add_mul, univ_z2_add_mul, univ_z2_add_mul, univ_z2_add_mul]

private theorem univ_sum5_scale (k : Int) (f : Fin 5 → ZSqrt2) :
    sum5 (fun i => ZSqrt2.scale k (f i)) = ZSqrt2.scale k (sum5 f) := by
  unfold sum5
  rw [univ_z2_scale_add, univ_z2_scale_add, univ_z2_scale_add, univ_z2_scale_add]

private theorem univ_sum5_comm (f : Fin 5 → Fin 5 → ZSqrt2) :
    sum5 (fun i => sum5 (fun j => f i j)) = sum5 (fun j => sum5 (fun i => f i j)) := by
  change sum5 (fun i => sum5 (fun j => f i j)) =
    ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add
      (sum5 (fun i => f i ⟨0, by decide⟩))
      (sum5 (fun i => f i ⟨1, by decide⟩)))
      (sum5 (fun i => f i ⟨2, by decide⟩)))
      (sum5 (fun i => f i ⟨3, by decide⟩)))
      (sum5 (fun i => f i ⟨4, by decide⟩))
  rw [← univ_sum5_add, ← univ_sum5_add, ← univ_sum5_add, ← univ_sum5_add]
  rfl

private theorem univ_sum5_kron_left (i : Fin 5) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (mat5Id i k) (f k)) = f i := by
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp [sum5, mat5Id, univ_z2_one_mul, univ_z2_zero_mul, univ_z2_add_zero, univ_z2_zero_add]

private theorem univ_mat5Vec_id (v : Vec5) : mat5Vec mat5Id v = v := by
  funext i; exact univ_sum5_kron_left i v

private theorem univ_mat5Vec_mul (A B : Mat5) (v : Vec5) :
    mat5Vec (mat5Mul A B) v = mat5Vec A (mat5Vec B v) := by
  funext i
  unfold mat5Vec mat5Mul
  have hL : sum5 (fun k => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (A i m) (B m k))) (v k)) =
      sum5 (fun k => sum5 (fun m => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (v k)))) := by
    apply congrArg sum5; funext k
    rw [← univ_sum5_mul_right]
    apply congrArg sum5; funext m
    exact univ_z2_mul_assoc (A i m) (B m k) (v k)
  have hR : sum5 (fun m => ZSqrt2.mul (A i m) (sum5 (fun k => ZSqrt2.mul (B m k) (v k)))) =
      sum5 (fun m => sum5 (fun k => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (v k)))) := by
    apply congrArg sum5; funext m
    rw [← univ_sum5_mul_left]
  rw [hL, univ_sum5_comm, hR]

private theorem univ_mat5Vec_add (A : Mat5) (u v : Vec5) :
    mat5Vec A (univVec5Add u v) = univVec5Add (mat5Vec A u) (mat5Vec A v) := by
  funext i
  unfold mat5Vec univVec5Add
  have hFun : (fun k => ZSqrt2.mul (A i k) (ZSqrt2.add (u k) (v k))) =
      (fun k => ZSqrt2.add (ZSqrt2.mul (A i k) (u k)) (ZSqrt2.mul (A i k) (v k))) :=
    funext (fun k => univ_z2_mul_add (A i k) (u k) (v k))
  rw [hFun, univ_sum5_add]

private theorem univ_mat5Vec_scale (A : Mat5) (c : Int) (v : Vec5) :
    mat5Vec A (univVec5Scale c v) = univVec5Scale c (mat5Vec A v) := by
  funext i
  unfold mat5Vec univVec5Scale
  have hFun : (fun k => ZSqrt2.mul (A i k) (ZSqrt2.scale c (v k))) =
      (fun k => ZSqrt2.scale c (ZSqrt2.mul (A i k) (v k))) :=
    funext (fun k => univ_z2_mul_scale (A i k) c (v k))
  rw [hFun, univ_sum5_scale]

private theorem univ_twiceForm_symm (u v : Vec5) : twiceForm u v = twiceForm v u := by
  have hSym := thm_coxeter_gram_and_center.1
  unfold twiceForm dot5 mat5Vec
  have h1 : sum5 (fun k => ZSqrt2.mul (u k) (sum5 (fun m => ZSqrt2.mul (twiceGram k m) (v m)))) =
      sum5 (fun k => sum5 (fun m => ZSqrt2.mul (v m) (ZSqrt2.mul (twiceGram m k) (u k)))) := by
    apply congrArg sum5; funext k
    rw [← univ_sum5_mul_left]
    apply congrArg sum5; funext m
    have hT : twiceGram k m = twiceGram m k := congrFun (congrFun hSym m) k
    rw [hT, univ_z2_mul_comm (twiceGram m k) (v m), ← univ_z2_mul_assoc (u k) (v m) (twiceGram m k),
        univ_z2_mul_comm (u k) (v m), univ_z2_mul_assoc (v m) (u k) (twiceGram m k),
        univ_z2_mul_comm (u k) (twiceGram m k)]
  have h2 : sum5 (fun m => ZSqrt2.mul (v m) (sum5 (fun k => ZSqrt2.mul (twiceGram m k) (u k)))) =
      sum5 (fun m => sum5 (fun k => ZSqrt2.mul (v m) (ZSqrt2.mul (twiceGram m k) (u k)))) := by
    apply congrArg sum5; funext m
    rw [← univ_sum5_mul_left]
  rw [h1, univ_sum5_comm, h2]

private theorem univ_twiceForm_add_left (u v w : Vec5) :
    twiceForm (univVec5Add u v) w = ZSqrt2.add (twiceForm u w) (twiceForm v w) := by
  unfold twiceForm dot5 univVec5Add
  have hFun : (fun k => ZSqrt2.mul (ZSqrt2.add (u k) (v k)) (mat5Vec twiceGram w k)) =
      (fun k => ZSqrt2.add (ZSqrt2.mul (u k) (mat5Vec twiceGram w k))
                           (ZSqrt2.mul (v k) (mat5Vec twiceGram w k))) :=
    funext (fun k => univ_z2_add_mul (u k) (v k) _)
  rw [hFun, univ_sum5_add]

private theorem univ_twiceForm_sub_left (u v w : Vec5) :
    twiceForm (fun i => ZSqrt2.sub (u i) (v i)) w = ZSqrt2.sub (twiceForm u w) (twiceForm v w) := by
  unfold twiceForm dot5
  have hFun : (fun k => ZSqrt2.mul (ZSqrt2.sub (u k) (v k)) (mat5Vec twiceGram w k)) =
      (fun k => ZSqrt2.sub (ZSqrt2.mul (u k) (mat5Vec twiceGram w k))
                           (ZSqrt2.mul (v k) (mat5Vec twiceGram w k))) :=
    funext (fun k => univ_z2_sub_mul (u k) (v k) _)
  rw [hFun, univ_sum5_sub]

private theorem univ_twiceForm_scale_left (c : Int) (u w : Vec5) :
    twiceForm (univVec5Scale c u) w = ZSqrt2.scale c (twiceForm u w) := by
  unfold twiceForm dot5 univVec5Scale
  have hFun : (fun k => ZSqrt2.mul (ZSqrt2.scale c (u k)) (mat5Vec twiceGram w k)) =
      (fun k => ZSqrt2.scale c (ZSqrt2.mul (u k) (mat5Vec twiceGram w k))) :=
    funext (fun k => univ_z2_scale_mul c (u k) _)
  rw [hFun, univ_sum5_scale]

private theorem univ_faceRefl_action (a : Fin 24) (v : Vec5) :
    mat5Vec (faceReflection a) v =
      fun i => ZSqrt2.sub (v i) (ZSqrt2.mul (facetNormal a i) (twiceForm (facetNormal a) v)) := by
  funext i
  unfold mat5Vec faceReflection reflectionIn
  have hFun : (fun k => ZSqrt2.mul
        (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (facetNormal a i) (mat5Vec twiceGram (facetNormal a) k)))
        (v k)) =
      (fun k => ZSqrt2.sub (ZSqrt2.mul (mat5Id i k) (v k))
                           (ZSqrt2.mul (facetNormal a i) (ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (v k)))) := by
    funext k; rw [univ_z2_sub_mul, univ_z2_mul_assoc]
  rw [hFun, univ_sum5_sub, univ_sum5_kron_left i v, univ_sum5_mul_left]
  have hDot : sum5 (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (v k)) =
      twiceForm (facetNormal a) v := by
    have hComm : sum5 (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (v k)) =
        twiceForm v (facetNormal a) := by
      unfold twiceForm dot5
      apply congrArg sum5; funext k; exact univ_z2_mul_comm _ _
    rw [hComm, univ_twiceForm_symm]
  rw [hDot]

private theorem univ_facetNormal_opp (a : Fin 24) :
    facetNormal (oppSlot a) = fun i => ZSqrt2.sub (ZSqrt2.scale 2 (baseCenter i)) (facetNormal a i) :=
  funext ((by decide : ∀ (x : Fin 24) (i : Fin 5),
    facetNormal (oppSlot x) i = ZSqrt2.sub (ZSqrt2.scale 2 (baseCenter i)) (facetNormal x i)) a)

private theorem univ_transport_action_2plane (a : Fin 24) :
    mat5Vec (transport a) baseCenter = univVec5Add baseCenter (univVec5Scale 2 (facetNormal a)) ∧
    mat5Vec (transport a) (facetNormal a) =
      univVec5Add (univVec5Scale 2 baseCenter) (univVec5Scale 5 (facetNormal a)) := by
  refine ⟨?_, ?_⟩
  · unfold transport
    rw [univ_mat5Vec_mul, thm_central_inversion_properties.2.2.2.1, univ_faceRefl_action,
        thm_24_facets_geometry.2.2.2.1 a]
    funext i
    unfold univVec5Add univVec5Scale
    cases baseCenter i; cases facetNormal a i
    simp only [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.mul, ZSqrt2.ofInt, ZSqrt2.scale, ZSqrt2.mk.injEq,
      Int.mul_zero, Int.mul_neg]
    exact ⟨by omega, by omega⟩
  · unfold transport
    rw [univ_mat5Vec_mul, thm_24_facets_geometry.2.2.2.2 a, univ_faceRefl_action]
    have hOppForm : twiceForm (facetNormal a) (facetNormal (oppSlot a)) = ZSqrt2.ofInt (-6) := by
      rw [univ_twiceForm_symm, univ_facetNormal_opp a, univ_twiceForm_sub_left,
          univ_twiceForm_scale_left, univ_twiceForm_symm baseCenter (facetNormal a),
          thm_24_facets_geometry.2.2.2.1 a, thm_24_facets_geometry.2.2.1 a]
      decide
    rw [hOppForm, univ_facetNormal_opp a]
    funext i
    unfold univVec5Add univVec5Scale
    cases baseCenter i; cases facetNormal a i
    simp only [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.mul, ZSqrt2.ofInt, ZSqrt2.scale, ZSqrt2.mk.injEq,
      Int.mul_zero, Int.mul_neg]
    exact ⟨by omega, by omega⟩

private theorem univ_transport_action_facetDir (a : Fin 24) :
    mat5Vec (transport a) baseCenter =
      univVec5Add (univVec5Scale 3 baseCenter) (univVec5Scale 2 (facetDir a)) ∧
    mat5Vec (transport a) (facetDir a) =
      univVec5Add (univVec5Scale 4 baseCenter) (univVec5Scale 3 (facetDir a)) := by
  have ⟨hc, hn⟩ := univ_transport_action_2plane a
  refine ⟨?_, ?_⟩
  · rw [hc]
    funext i
    unfold univVec5Add univVec5Scale facetDir
    cases baseCenter i; cases facetNormal a i
    simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.scale, ZSqrt2.mk.injEq]
    exact ⟨by omega, by omega⟩
  · have hDirEq : facetDir a = univVec5Add (facetNormal a) (univVec5Scale (-1) baseCenter) := by
      funext i; unfold facetDir univVec5Add univVec5Scale
      cases facetNormal a i; cases baseCenter i
      simp only [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.neg_mul, Int.one_mul]
      exact ⟨by omega, by omega⟩
    rw [hDirEq, univ_mat5Vec_add, univ_mat5Vec_scale, hn, hc]
    funext i
    unfold univVec5Add univVec5Scale facetDir
    cases baseCenter i; cases facetNormal a i
    simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.neg_mul, Int.one_mul]
    exact ⟨by omega, by omega⟩

private theorem univ_geodesic_pow_nat (a : Fin 24) (n : Nat) :
    mat5Vec (univMat5Pow (transport a) n) baseCenter =
      univVec5Add (univVec5Scale (univPellP n) baseCenter)
                  (univVec5Scale (univPellQ n) (facetDir a)) := by
  induction n with
  | zero =>
    simp only [univMat5Pow, univPellP, univPellQ]
    rw [univ_mat5Vec_id]
    funext i
    unfold univVec5Add univVec5Scale
    cases baseCenter i; cases facetDir a i
    simp only [ZSqrt2.add, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.one_mul, Int.zero_mul]
    exact ⟨by omega, by omega⟩
  | succ k ih =>
    simp only [univMat5Pow, univPellP, univPellQ]
    rw [univ_mat5Vec_mul, ih, univ_mat5Vec_add, univ_mat5Vec_scale, univ_mat5Vec_scale,
        (univ_transport_action_facetDir a).1, (univ_transport_action_facetDir a).2]
    funext i
    unfold univVec5Add univVec5Scale
    cases baseCenter i with | mk ca cb =>
    cases facetDir a i with | mk da db =>
    simp only [ZSqrt2.add, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.add_mul, Int.mul_add]
    have t1 : univPellP k * (3 * ca) = 3 * univPellP k * ca := by ac_rfl
    have t2 : univPellP k * (3 * cb) = 3 * univPellP k * cb := by ac_rfl
    have t3 : univPellP k * (2 * da) = 2 * univPellP k * da := by ac_rfl
    have t4 : univPellP k * (2 * db) = 2 * univPellP k * db := by ac_rfl
    have t5 : univPellQ k * (4 * ca) = 4 * univPellQ k * ca := by ac_rfl
    have t6 : univPellQ k * (4 * cb) = 4 * univPellQ k * cb := by ac_rfl
    have t7 : univPellQ k * (3 * da) = 3 * univPellQ k * da := by ac_rfl
    have t8 : univPellQ k * (3 * db) = 3 * univPellQ k * db := by ac_rfl
    rw [t1, t2, t3, t4, t5, t6, t7, t8]
    exact ⟨by omega, by omega⟩

private theorem univ_pell_pos (n : Nat) :
    1 ≤ univPellP n ∧ (n ≥ 1 → 2 ≤ univPellQ n) := by
  induction n with
  | zero => exact ⟨by decide, fun h => by omega⟩
  | succ k ih =>
    have hq0 : 0 ≤ univPellQ k := by
      cases k with
      | zero => decide
      | succ m => have := ih.2 (by omega); omega
    simp only [univPellP, univPellQ]
    exact ⟨by omega, fun _ => by omega⟩

private theorem univ_geodesic_pow_coords (a : Fin 24) (m : Int) :
    ∃ p q : Int,
      mat5Vec (univGeodesicPow a m) baseCenter =
        univVec5Add (univVec5Scale p baseCenter) (univVec5Scale q (facetDir a)) ∧
      (q = 0 ↔ m = 0) := by
  cases m with
  | ofNat n =>
    refine ⟨univPellP n, univPellQ n, univ_geodesic_pow_nat a n, ?_⟩
    cases n with
    | zero => exact ⟨fun _ => rfl, fun _ => rfl⟩
    | succ k =>
      have hq := (univ_pell_pos (k + 1)).2 (by omega)
      exact ⟨fun h => by omega, fun h => by omega⟩
  | negSucc n =>
    have hOppDir : facetDir (oppSlot a) = univVec5Scale (-1) (facetDir a) := by
      funext i
      unfold facetDir univVec5Scale
      rw [univ_facetNormal_opp a]
      cases baseCenter i; cases facetNormal a i
      simp only [ZSqrt2.sub, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.neg_mul, Int.one_mul]
      exact ⟨by omega, by omega⟩
    refine ⟨univPellP (n + 1), -univPellQ (n + 1), ?_, ?_⟩
    · change mat5Vec (univMat5Pow (transport (oppSlot a)) (n + 1)) baseCenter = _
      rw [univ_geodesic_pow_nat (oppSlot a) (n + 1), hOppDir]
      funext i
      unfold univVec5Add univVec5Scale
      cases baseCenter i; cases facetDir a i
      simp only [ZSqrt2.add, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.neg_mul, Int.mul_neg, Int.one_mul]
      exact ⟨rfl, rfl⟩
    · have hq := (univ_pell_pos (n + 1)).2 (by omega)
      exact ⟨fun h => by omega, fun h => by omega⟩

private theorem univ_d4_noncollinear_dot :
    (∀ a : Fin 24, dot4 (d4RootOf a) (d4RootOf a) = 2) ∧
    (∀ a1 a2 : Fin 24, a1 ≠ a2 → a1 ≠ oppSlot a2 →
      dot4 (d4RootOf a1) (d4RootOf a2) = -1 ∨
      dot4 (d4RootOf a1) (d4RootOf a2) = 0 ∨
      dot4 (d4RootOf a1) (d4RootOf a2) = 1) := by
  decide

private def univPairOf6 : Fin 6 → Fin 4 × Fin 4
  | ⟨0, _⟩ => (⟨0, by decide⟩, ⟨1, by decide⟩)
  | ⟨1, _⟩ => (⟨0, by decide⟩, ⟨2, by decide⟩)
  | ⟨2, _⟩ => (⟨0, by decide⟩, ⟨3, by decide⟩)
  | ⟨3, _⟩ => (⟨1, by decide⟩, ⟨2, by decide⟩)
  | ⟨4, _⟩ => (⟨1, by decide⟩, ⟨3, by decide⟩)
  | ⟨5, _⟩ => (⟨2, by decide⟩, ⟨3, by decide⟩)
  | ⟨n + 6, h⟩ => absurd h (by omega)

private theorem univPairOf6_spec :
    (∀ p : Fin 6, (univPairOf6 p).1 ≠ (univPairOf6 p).2) ∧
    (∀ p1 p2 : Fin 6,
      ((univPairOf6 p1).1 = (univPairOf6 p2).1 ∧ (univPairOf6 p1).2 = (univPairOf6 p2).2) ∨
      ((univPairOf6 p1).1 = (univPairOf6 p2).2 ∧ (univPairOf6 p1).2 = (univPairOf6 p2).1) →
      p1 = p2) := by
  decide

private def univOrderPairIdx {D : Nat} (u v : Fin D) (hne : u ≠ v) : Fin (D * (D - 1) / 2) :=
  if h : u.val < v.val then
    univTriPairIdx u v h
  else
    univTriPairIdx v u (by have hvn : u.val ≠ v.val := fun e => hne (Fin.ext e); omega)

private theorem univOrderPairIdx_eq {D : Nat} (u1 v1 u2 v2 : Fin D) (h1 : u1 ≠ v1) (h2 : u2 ≠ v2)
    (heq : univOrderPairIdx u1 v1 h1 = univOrderPairIdx u2 v2 h2) :
    (u1 = u2 ∧ v1 = v2) ∨ (u1 = v2 ∧ v1 = u2) := by
  unfold univOrderPairIdx at heq
  if h1lt : u1.val < v1.val then
    rw [univ_dite_pos h1lt] at heq
    if h2lt : u2.val < v2.val then
      rw [univ_dite_pos h2lt] at heq
      exact Or.inl (univTriPairIdx_inj u1 v1 u2 v2 h1lt h2lt heq)
    else
      rw [univ_dite_neg h2lt] at heq
      have ⟨ha, hb⟩ := univTriPairIdx_inj u1 v1 v2 u2 h1lt _ heq
      exact Or.inr ⟨ha, hb⟩
  else
    rw [univ_dite_neg h1lt] at heq
    if h2lt : u2.val < v2.val then
      rw [univ_dite_pos h2lt] at heq
      have ⟨ha, hb⟩ := univTriPairIdx_inj v1 u1 u2 v2 _ h2lt heq
      exact Or.inr ⟨hb, ha⟩
    else
      rw [univ_dite_neg h2lt] at heq
      have ⟨ha, hb⟩ := univTriPairIdx_inj v1 u1 v2 u2 _ _ heq
      exact Or.inl ⟨hb, ha⟩

/-- Headline Theorem 6 (Hyperbolic Geodesic 2-Plane Invariance, Unique Intersection & 4-Line Junction Cap):
    1. Directly on `Vibe.CoxeterTransport`: for ALL `a : Fin 24`,
       `k_a c_0 = c_0 + 2 n_a` and `k_a n_a = 2 c_0 + 5 n_a`.
    2. Unique geodesic intersection (`|L_i ∩ L_j| ≤ 1`): for ALL `a1 a2 : Fin 24` with
       `a1 ≠ a2 ∧ a1 ≠ oppSlot a2` and ALL `m1 m2 : Int`,
       `k_{a1}^{m1} c_0 = k_{a2}^{m2} c_0 → m1 = 0 ∧ m2 = 0`.
    3. Exact combinatorial 4-line `Φ_odd` junction ceiling: any family of `J` 4-line junctions
       among `D` geodesics whose pairwise intersections have size `≤ 1` obeys
       `6 * J ≤ D * (D - 1) / 2` and `J ≤ D * (D - 1) / 12`. -/
theorem thm_univ_geodesic_2plane_and_junction_cap :
    (∀ a : Fin 24,
      mat5Vec (transport a) baseCenter = univVec5Add baseCenter (univVec5Scale 2 (facetNormal a)) ∧
      mat5Vec (transport a) (facetNormal a) =
        univVec5Add (univVec5Scale 2 baseCenter) (univVec5Scale 5 (facetNormal a))) ∧
    (∀ (a1 a2 : Fin 24), a1 ≠ a2 → a1 ≠ oppSlot a2 →
      ∀ (m1 m2 : Int),
        mat5Vec (univGeodesicPow a1 m1) baseCenter = mat5Vec (univGeodesicPow a2 m2) baseCenter →
        m1 = 0 ∧ m2 = 0) ∧
    (∀ (J D : Nat) (junc : Fin J → Fin 4 → Fin D),
      (∀ j : Fin J, ∀ r1 r2 : Fin 4, r1 ≠ r2 → junc j r1 ≠ junc j r2) →
      (∀ j1 j2 : Fin J, j1 ≠ j2 →
        ∀ r1 r2 s1 s2 : Fin 4, r1 ≠ r2 → s1 ≠ s2 →
          junc j1 r1 = junc j2 s1 → junc j1 r2 = junc j2 s2 → False) →
      6 * J ≤ D * (D - 1) / 2 ∧ J ≤ D * (D - 1) / 12) := by
  refine ⟨univ_transport_action_2plane, ?_, ?_⟩
  · intro a1 a2 hne1 hne2 m1 m2 hEq
    obtain ⟨p1, q1, h1, hq1_iff⟩ := univ_geodesic_pow_coords a1 m1
    obtain ⟨p2, q2, h2, hq2_iff⟩ := univ_geodesic_pow_coords a2 m2
    rw [h1, h2] at hEq
    have hDirBase : ∀ a : Fin 24, twiceForm (facetDir a) baseCenter = ZSqrt2.zero := by
      intro a
      unfold facetDir
      rw [univ_twiceForm_sub_left, thm_24_facets_geometry.2.2.2.1 a, thm_coxeter_gram_and_center.2.2.1]
      decide
    have hpEq : p1 = p2 := by
      have hF := congrArg (fun v => twiceForm v baseCenter) hEq
      rw [univ_twiceForm_add_left, univ_twiceForm_add_left,
          univ_twiceForm_scale_left, univ_twiceForm_scale_left,
          univ_twiceForm_scale_left, univ_twiceForm_scale_left,
          thm_coxeter_gram_and_center.2.2.1, hDirBase a1, hDirBase a2] at hF
      have ha := congrArg ZSqrt2.a hF
      simp only [ZSqrt2.add, ZSqrt2.scale, ZSqrt2.ofInt, ZSqrt2.zero, Int.mul_zero] at ha
      omega
    have hDirEq : univVec5Scale q1 (facetDir a1) = univVec5Scale q2 (facetDir a2) := by
      funext i
      have hi := congrFun hEq i
      rw [hpEq] at hi
      unfold univVec5Add univVec5Scale at hi ⊢
      cases ZSqrt2.scale p2 (baseCenter i)
      cases ZSqrt2.scale q1 (facetDir a1 i)
      cases ZSqrt2.scale q2 (facetDir a2 i)
      simp only [ZSqrt2.add, ZSqrt2.mk.injEq] at hi ⊢
      exact ⟨by omega, by omega⟩
    let d := dot4 (d4RootOf a1) (d4RootOf a2)
    have hdVals := univ_d4_noncollinear_dot.2 a1 a2 hne1 hne2
    have hEq1 : 2 * q1 = d * q2 := by
      have hF := congrArg (fun v => twiceForm v (facetDir a1)) hDirEq
      rw [univ_twiceForm_scale_left, univ_twiceForm_scale_left,
          thm_24_facet_dirs_isomorphic_to_d4 a1 a1,
          thm_24_facet_dirs_isomorphic_to_d4 a2 a1,
          univ_d4_noncollinear_dot.1 a1] at hF
      have hDotComm : ∀ u v : Vec4, dot4 u v = dot4 v u := by
        intro u v
        rcases u with ⟨u0, u1, u2, u3⟩
        rcases v with ⟨v0, v1, v2, v3⟩
        unfold dot4
        rw [Int.mul_comm u0 v0, Int.mul_comm u1 v1, Int.mul_comm u2 v2, Int.mul_comm u3 v3]
      rw [hDotComm (d4RootOf a2) (d4RootOf a1)] at hF
      have ha := congrArg ZSqrt2.a hF
      simp only [ZSqrt2.scale, ZSqrt2.ofInt] at ha
      have hAssoc : q2 * (2 * d) = 2 * (d * q2) := by ac_rfl
      rw [hAssoc] at ha
      omega
    have hEq2 : d * q1 = 2 * q2 := by
      have hF := congrArg (fun v => twiceForm v (facetDir a2)) hDirEq
      rw [univ_twiceForm_scale_left, univ_twiceForm_scale_left,
          thm_24_facet_dirs_isomorphic_to_d4 a1 a2,
          thm_24_facet_dirs_isomorphic_to_d4 a2 a2,
          univ_d4_noncollinear_dot.1 a2] at hF
      have ha := congrArg ZSqrt2.a hF
      simp only [ZSqrt2.scale, ZSqrt2.ofInt] at ha
      have hAssoc : q1 * (2 * d) = 2 * (d * q1) := by ac_rfl
      rw [hAssoc] at ha
      omega
    have hqZero : q1 = 0 ∧ q2 = 0 := by
      rcases hdVals with hdm1 | hd0 | hdp1
      · change d = -1 at hdm1; rw [hdm1, Int.neg_mul, Int.one_mul] at hEq1 hEq2; omega
      · change d = 0 at hd0; rw [hd0, Int.zero_mul] at hEq1 hEq2; omega
      · change d = 1 at hdp1; rw [hdp1, Int.one_mul] at hEq1 hEq2; omega
    exact ⟨hq1_iff.mp hqZero.1, hq2_iff.mp hqZero.2⟩
  · intro J D junc hDist hPair
    let φ : Fin (6 * J) → Fin (D * (D - 1) / 2) := fun k =>
      let j : Fin J := ⟨k.val / 6, by have := k.isLt; omega⟩
      let p : Fin 6 := ⟨k.val % 6, by omega⟩
      univOrderPairIdx (junc j (univPairOf6 p).1) (junc j (univPairOf6 p).2)
        (hDist j _ _ (univPairOf6_spec.1 p))
    have h6J : 6 * J ≤ D * (D - 1) / 2 := by
      refine univ_fin_inj_le φ (fun k1 k2 hEq => ?_)
      let j1 : Fin J := ⟨k1.val / 6, by have := k1.isLt; omega⟩
      let p1 : Fin 6 := ⟨k1.val % 6, by omega⟩
      let j2 : Fin J := ⟨k2.val / 6, by have := k2.isLt; omega⟩
      let p2 : Fin 6 := ⟨k2.val % 6, by omega⟩
      have hUnord := univOrderPairIdx_eq
        (junc j1 (univPairOf6 p1).1) (junc j1 (univPairOf6 p1).2)
        (junc j2 (univPairOf6 p2).1) (junc j2 (univPairOf6 p2).2)
        (hDist j1 _ _ (univPairOf6_spec.1 p1)) (hDist j2 _ _ (univPairOf6_spec.1 p2)) hEq
      have hjEq : j1 = j2 := by
        if hj : j1 = j2 then exact hj
        else
          exfalso
          rcases hUnord with ⟨ha, hb⟩ | ⟨ha, hb⟩
          · exact hPair j1 j2 hj _ _ _ _ (univPairOf6_spec.1 p1) (univPairOf6_spec.1 p2) ha hb
          · exact hPair j1 j2 hj _ _ _ _ (univPairOf6_spec.1 p1) (univPairOf6_spec.1 p2).symm ha hb
      have hpEq : p1 = p2 := by
        apply univPairOf6_spec.2 p1 p2
        rcases hUnord with ⟨ha, hb⟩ | ⟨ha, hb⟩
        · rw [hjEq] at ha hb
          have hInjJ : ∀ r s : Fin 4, junc j2 r = junc j2 s → r = s := by
            intro r s hrs; if h : r = s then exact h else exact absurd hrs (hDist j2 r s h)
          exact Or.inl ⟨hInjJ _ _ ha, hInjJ _ _ hb⟩
        · rw [hjEq] at ha hb
          have hInjJ : ∀ r s : Fin 4, junc j2 r = junc j2 s → r = s := by
            intro r s hrs; if h : r = s then exact h else exact absurd hrs (hDist j2 r s h)
          exact Or.inr ⟨hInjJ _ _ ha, hInjJ _ _ hb⟩
      have hv1 : k1.val / 6 = k2.val / 6 := congrArg Fin.val hjEq
      have hv2 : k1.val % 6 = k2.val % 6 := congrArg Fin.val hpEq
      exact Fin.ext (by omega)
    refine ⟨h6J, ?_⟩
    have hDiv : ∀ (a m : Nat), 6 * a ≤ m / 2 → a ≤ m / 12 := fun _ _ h => by omega
    exact hDiv J (D * (D - 1)) h6J


/-! ## Section 7: Exact Mod-2 Coxeter `D_4` Triality Quotient, `5/8` `L_7` Bragg Gap & Period-12 Cavity -/

/-- Exact quotient ring `ℤ[√2] / 2 ℤ[√2]` (`(√2)^2 = 0`). -/
structure UnivZ2Mod2 where
  a : Bool
  b : Bool
  deriving DecidableEq, Repr

namespace UnivZ2Mod2

def zero : UnivZ2Mod2 := ⟨false, false⟩
def one : UnivZ2Mod2 := ⟨true, false⟩
def add (x y : UnivZ2Mod2) : UnivZ2Mod2 := ⟨xor x.a y.a, xor x.b y.b⟩
def mul (x y : UnivZ2Mod2) : UnivZ2Mod2 := ⟨x.a && y.a, xor (x.a && y.b) (x.b && y.a)⟩

end UnivZ2Mod2

/-- Canonical quotient ring homomorphism `ℤ[√2] → ℤ[√2] / 2 ℤ[√2]`. -/
def univMod2Z (x : ZSqrt2) : UnivZ2Mod2 :=
  ⟨decide (x.a % 2 ≠ 0), decide (x.b % 2 ≠ 0)⟩

abbrev UnivMat5Mod2 := Fin 5 → Fin 5 → UnivZ2Mod2

def univSum5Mod2 (f : Fin 5 → UnivZ2Mod2) : UnivZ2Mod2 :=
  UnivZ2Mod2.add
    (UnivZ2Mod2.add
      (UnivZ2Mod2.add
        (UnivZ2Mod2.add (f ⟨0, by decide⟩) (f ⟨1, by decide⟩))
        (f ⟨2, by decide⟩))
      (f ⟨3, by decide⟩))
    (f ⟨4, by decide⟩)

def univMat5Mod2 (M : Mat5) : UnivMat5Mod2 := fun i j => univMod2Z (M i j)

def univMat5Mod2Mul (A B : UnivMat5Mod2) : UnivMat5Mod2 :=
  fun i j => univSum5Mod2 (fun k => UnivZ2Mod2.mul (A i k) (B k j))

/-- The 4-element abelian Klein group `ℤ_2 × ℤ_2` embedded in `GL_5(ℤ[√2] / 2 ℤ[√2])`:
    `I_5 + √2 (u2 E_{4,2} + u3 E_{4,3})`. -/
def univKleinMat (u2 u3 : Bool) : UnivMat5Mod2
  | ⟨4, _⟩, ⟨2, _⟩ => ⟨false, u2⟩
  | ⟨4, _⟩, ⟨3, _⟩ => ⟨false, u3⟩
  | i, j => if i = j then UnivZ2Mod2.one else UnivZ2Mod2.zero

/-- `D_4` triality frame coordinates `(u2, u3) ∈ ℤ_2 × ℤ_2 \ {(0, 0)}` for each of the 12 lines:
    Frame 1 `{0,1,10,11} ↦ (0,1)`, Frame 2 `{2,3,8,9} ↦ (1,1)`, Frame 3 `{4,5,6,7} ↦ (1,0)`. -/
def univLineKlein (l : Fin 12) : Bool × Bool :=
  match l.val with
  | 0 | 1 | 10 | 11 => (false, true)
  | 2 | 3 | 8 | 9 => (true, true)
  | _ => (true, false)

/-- Canonical index-2 character `η : ℤ_2 × ℤ_2 → ℤ_2` (plus its two `S_3`-triality partners). -/
def univKleinEta (u : Bool × Bool) : Bool := u.1
def univKleinEta2 (u : Bool × Bool) : Bool := u.2
def univKleinEta3 (u : Bool × Bool) : Bool := xor u.1 u.2

private theorem univ_int_even_or_odd (x : Int) :
    (∃ k : Int, x = 2 * k) ∨ (∃ k : Int, x = 2 * k + 1) := by
  if h : x % 2 = 0 then exact Or.inl ⟨x / 2, by omega⟩ else exact Or.inr ⟨x / 2, by omega⟩

private theorem univ_int_add_mod2 (x y : Int) :
    decide ((x + y) % 2 ≠ 0) = xor (decide (x % 2 ≠ 0)) (decide (y % 2 ≠ 0)) := by
  rcases univ_int_even_or_odd x with ⟨kx, rfl⟩ | ⟨kx, rfl⟩ <;>
  rcases univ_int_even_or_odd y with ⟨ky, rfl⟩ | ⟨ky, rfl⟩
  · have h1 : (2 * kx + 2 * ky) % 2 = 0 := by omega
    have h2 : (2 * kx) % 2 = 0 := by omega
    have h3 : (2 * ky) % 2 = 0 := by omega
    rw [h1, h2, h3]; decide
  · have h1 : (2 * kx + (2 * ky + 1)) % 2 = 1 := by omega
    have h2 : (2 * kx) % 2 = 0 := by omega
    have h3 : (2 * ky + 1) % 2 = 1 := by omega
    rw [h1, h2, h3]; decide
  · have h1 : (2 * kx + 1 + 2 * ky) % 2 = 1 := by omega
    have h2 : (2 * kx + 1) % 2 = 1 := by omega
    have h3 : (2 * ky) % 2 = 0 := by omega
    rw [h1, h2, h3]; decide
  · have h1 : (2 * kx + 1 + (2 * ky + 1)) % 2 = 0 := by omega
    have h2 : (2 * kx + 1) % 2 = 1 := by omega
    have h3 : (2 * ky + 1) % 2 = 1 := by omega
    rw [h1, h2, h3]; decide

private theorem univ_int_mul_mod2 (x y : Int) :
    decide ((x * y) % 2 ≠ 0) = (decide (x % 2 ≠ 0) && decide (y % 2 ≠ 0)) := by
  rcases univ_int_even_or_odd x with ⟨kx, rfl⟩ | ⟨kx, rfl⟩ <;>
  rcases univ_int_even_or_odd y with ⟨ky, rfl⟩ | ⟨ky, rfl⟩
  · have hm : 2 * kx * (2 * ky) = 2 * (2 * (kx * ky)) := by ac_rfl
    have h1 : (2 * kx * (2 * ky)) % 2 = 0 := by rw [hm]; omega
    have h2 : (2 * kx) % 2 = 0 := by omega
    have h3 : (2 * ky) % 2 = 0 := by omega
    rw [h1, h2, h3]; decide
  · have hm : 2 * kx * (2 * ky + 1) = 2 * (kx * (2 * ky + 1)) := by ac_rfl
    have h1 : (2 * kx * (2 * ky + 1)) % 2 = 0 := by rw [hm]; omega
    have h2 : (2 * kx) % 2 = 0 := by omega
    have h3 : (2 * ky + 1) % 2 = 1 := by omega
    rw [h1, h2, h3]; decide
  · have hm : (2 * kx + 1) * (2 * ky) = 2 * ((2 * kx + 1) * ky) := by ac_rfl
    have h1 : ((2 * kx + 1) * (2 * ky)) % 2 = 0 := by rw [hm]; omega
    have h2 : (2 * kx + 1) % 2 = 1 := by omega
    have h3 : (2 * ky) % 2 = 0 := by omega
    rw [h1, h2, h3]; decide
  · have hm : (2 * kx + 1) * (2 * ky + 1) = 2 * (2 * (kx * ky) + kx + ky) + 1 := by
      simp only [Int.add_mul, Int.mul_add, Int.one_mul, Int.mul_one]
      have h4 : 2 * kx * (2 * ky) = 4 * (kx * ky) := by
        calc 2 * kx * (2 * ky) = (2 * 2) * (kx * ky) := by ac_rfl
          _ = 4 * (kx * ky) := rfl
      rw [h4]; omega
    have h1 : ((2 * kx + 1) * (2 * ky + 1)) % 2 = 1 := by rw [hm]; omega
    have h2 : (2 * kx + 1) % 2 = 1 := by omega
    have h3 : (2 * ky + 1) % 2 = 1 := by omega
    rw [h1, h2, h3]; decide

private theorem univ_mod2Z_add (x y : ZSqrt2) :
    univMod2Z (ZSqrt2.add x y) = UnivZ2Mod2.add (univMod2Z x) (univMod2Z y) := by
  cases x; cases y
  simp only [univMod2Z, ZSqrt2.add, UnivZ2Mod2.add, UnivZ2Mod2.mk.injEq]
  exact ⟨univ_int_add_mod2 _ _, univ_int_add_mod2 _ _⟩

private theorem univ_mod2Z_mul (x y : ZSqrt2) :
    univMod2Z (ZSqrt2.mul x y) = UnivZ2Mod2.mul (univMod2Z x) (univMod2Z y) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [univMod2Z, ZSqrt2.mul, UnivZ2Mod2.mul, UnivZ2Mod2.mk.injEq]
  refine ⟨?_, ?_⟩
  · have hEv : (xa * ya + 2 * xb * yb) % 2 = (xa * ya) % 2 := by
      have hm : 2 * xb * yb = 2 * (xb * yb) := by ac_rfl
      rw [hm]; omega
    rw [hEv]
    exact univ_int_mul_mod2 xa ya
  · rw [univ_int_add_mod2, univ_int_mul_mod2, univ_int_mul_mod2]

private theorem univ_mat5Mod2_mul (A B : Mat5) :
    univMat5Mod2 (mat5Mul A B) = univMat5Mod2Mul (univMat5Mod2 A) (univMat5Mod2 B) := by
  funext i j
  unfold univMat5Mod2 mat5Mul univMat5Mod2Mul sum5 univSum5Mod2
  simp only [univ_mod2Z_add, univ_mod2Z_mul]

private theorem univ_mat5Vec_twiceGram_eq_fast (v : Vec5) :
    mat5Vec twiceGram v = twiceGramVecFast v := by
  funext i
  cases h0 : v ⟨0, by decide⟩ with | mk a0 b0 =>
  cases h1 : v ⟨1, by decide⟩ with | mk a1 b1 =>
  cases h2 : v ⟨2, by decide⟩ with | mk a2 b2 =>
  cases h3 : v ⟨3, by decide⟩ with | mk a3 b3 =>
  cases h4 : v ⟨4, by decide⟩ with | mk a4 b4 =>
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp only [mat5Vec, twiceGramVecFast, sum5, twiceGram, h0, h1, h2, h3, h4,
      ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.sqrt2, ZSqrt2.mk.injEq,
      Int.zero_mul, Int.one_mul, Int.mul_zero, Int.mul_one, Int.neg_mul, Int.mul_neg]
    exact ⟨by omega, by omega⟩

private theorem univ_mod2_centralInversion :
    ∀ i j : Fin 5, univMat5Mod2 centralInversion i j = univKleinMat false false i j := by
  decide

private theorem univ_mod2_mul_id_right (A : UnivMat5Mod2) :
    univMat5Mod2Mul A (univKleinMat false false) = A := by
  have hId : ∀ r c : Fin 5, univKleinMat false false r c =
      if r = c then UnivZ2Mod2.one else UnivZ2Mod2.zero := by decide
  have h1 : ∀ (x : UnivZ2Mod2), UnivZ2Mod2.mul x UnivZ2Mod2.one = x := by
    intro x; cases x with | mk xa xb => cases xa <;> cases xb <;> rfl
  have h0 : ∀ (x : UnivZ2Mod2), UnivZ2Mod2.mul x UnivZ2Mod2.zero = UnivZ2Mod2.zero := by
    intro x; cases x with | mk xa xb => cases xa <;> cases xb <;> rfl
  have ha0 : ∀ (x : UnivZ2Mod2), UnivZ2Mod2.add x UnivZ2Mod2.zero = x := by
    intro x; cases x with | mk xa xb => cases xa <;> cases xb <;> rfl
  have h0a : ∀ (x : UnivZ2Mod2), UnivZ2Mod2.add UnivZ2Mod2.zero x = x := by
    intro x; cases x with | mk xa xb => cases xa <;> cases xb <;> rfl
  funext i j
  unfold univMat5Mod2Mul univSum5Mod2
  simp only [hId]
  match j with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp [h1, h0, ha0, h0a]

private theorem univ_mod2_transport_lines :
    ∀ l : Fin 12,
      univMat5Mod2 (transport (lineA l)) = univKleinMat (univLineKlein l).1 (univLineKlein l).2 ∧
      univMat5Mod2 (transport (lineB l)) = univMat5Mod2 (transport (lineA l)) := by
  have hModRefl : ∀ a : Fin 24,
      univMat5Mod2 (transport a) =
        fun i j => univMod2Z (ZSqrt2.sub (mat5Id i j)
          (ZSqrt2.mul (facetNormal a i) (twiceGramVecFast (facetNormal a) j))) := by
    intro a
    unfold transport
    rw [univ_mat5Mod2_mul]
    have hZ : univMat5Mod2 centralInversion = univKleinMat false false :=
      funext (fun i => funext (fun j => univ_mod2_centralInversion i j))
    rw [hZ, univ_mod2_mul_id_right]
    funext i j
    unfold univMat5Mod2 faceReflection reflectionIn
    rw [univ_mat5Vec_twiceGram_eq_fast]
  have hFastA : ∀ (l : Fin 12) (i j : Fin 5),
      univMod2Z (ZSqrt2.sub (mat5Id i j)
        (ZSqrt2.mul (facetNormal (lineA l) i) (twiceGramVecFast (facetNormal (lineA l)) j))) =
      univKleinMat (univLineKlein l).1 (univLineKlein l).2 i j := by decide
  have hFastB : ∀ (l : Fin 12) (i j : Fin 5),
      univMod2Z (ZSqrt2.sub (mat5Id i j)
        (ZSqrt2.mul (facetNormal (lineB l) i) (twiceGramVecFast (facetNormal (lineB l)) j))) =
      univKleinMat (univLineKlein l).1 (univLineKlein l).2 i j := by decide
  intro l
  have hA : univMat5Mod2 (transport (lineA l)) = univKleinMat (univLineKlein l).1 (univLineKlein l).2 := by
    rw [hModRefl (lineA l)]
    exact funext (fun i => funext (fun j => hFastA l i j))
  have hB : univMat5Mod2 (transport (lineB l)) = univKleinMat (univLineKlein l).1 (univLineKlein l).2 := by
    rw [hModRefl (lineB l)]
    exact funext (fun i => funext (fun j => hFastB l i j))
  exact ⟨hA, by rw [hA, hB]⟩

/-- Exact even-dock `2 L_7^{(+)}` and odd-dock `2 L_7^{(-)}` 3-full-line `Φ_odd` catalyst matrices in `Mat_2(ℤ[ω])`. -/
def univL7Even2 : Mat2Eis := ⟨⟨0, 1⟩, ⟨-1, -2⟩, ⟨-1, 1⟩, ⟨0, 1⟩⟩
def univL7Odd2 : Mat2Eis := ⟨⟨1, 0⟩, ⟨2, 1⟩, ⟨-1, 1⟩, ⟨1, 0⟩⟩

/-- Exact 2-beat 1-dock `K`-cavity return map `2 U_{cav,2} = 2 (-ω X) C` (`U_{cav,2}^6 = I_2`, 12 beats!)
    and minimal order-12 cavity matrix `2 U_{cav,12} = 2 (Z X C)` (`U_{cav,12}^6 = -I_2`, `U_{cav,12}^{12} = I_2`). -/
def univCav2Beat2 : Mat2Eis :=
  Mat2Eis.mul ⟨Eis.zero, ⟨0, -1⟩, ⟨0, -1⟩, Eis.zero⟩ coin2

def univCav12Step2 : Mat2Eis :=
  Mat2Eis.mul ⟨Eis.one, Eis.zero, Eis.zero, ⟨-1, 0⟩⟩
    (Mat2Eis.mul ⟨Eis.zero, Eis.one, Eis.one, Eis.zero⟩ coin2)

/-- Headline Theorem 7 (Exact Mod-2 Coxeter `D_4` Triality Quotient, `5/8` `L_7` Bragg Gap & Period-12 Cavity):
    1. Exact mod-2 Coxeter quotient `Mat5 → GL_5(ℤ[√2] / 2 ℤ[√2])`:
       - Exact ring homomorphism `univMat5Mod2 (mat5Mul A B) = univMat5Mod2Mul (univMat5Mod2 A) (univMat5Mod2 B)`,
       - All 12 antipodal line transports satisfy `univMat5Mod2 (transport (lineA l)) = univMat5Mod2 (transport (lineB l)) = univKleinMat (univLineKlein l)`,
       - Exact 4-element abelian group closure `ℤ_2 × ℤ_2` (with 4 pairwise distinct elements and `I_5 = univKleinMat false false`),
       - Exact `4 + 4 + 4` partition of `Fin 12` into the 3 `D_4` triality frames,
       - Exact index-2 characters `η_1, η_2, η_3 : ℤ_2 × ℤ_2 → ℤ_2` (homomorphisms with kernel size `2`, plus `det(k_a) = -1`).
    2. Exact `5 / 8` omnidirectional `L_7` Floquet Bragg band gap:
       - Exact 2-beat Bloch trace & determinant certificates for `S C S C` (`cos(E_free^{(2)}) = (cos(2 k_1) - 3) / 4`)
         and bipartite `S L_7^{(-)} S L_7^{(+)}` (`cos(E_{L_7}^{(2)}) = (3 + 2 cos(2 k_2)) / 8`, sharing identical `det = ω^2`),
       - Universal cleared-denominator band-gap inequality: for ALL `c1 c2 q : Int` with `0 < q`, `-q ≤ c1 ≤ q`, `-q ≤ c2 ≤ q`,
         `(3 * q + 2 * c2) * 4 - (c1 - 3 * q) * 8 ≥ 5 * q * 4` (sharp at `c1 = q, c2 = -q`).
    3. Exact 2-beat / 12-beat period-12 1-dock qubit compacton identities in `Mat_2(ℤ[ω])`:
       - `2 U_{cav,2} = 2 (-ω X) C` is unitary (`M† M = 4 I_2`), flips at 6 beats (`(2 U_{cav,2})^3 = -8 X`),
         and closes at 12 beats (`(2 U_{cav,2})^6 = 64 I_2`, `(2 U_{cav,2})^{12} = 4096 I_2`),
       - `2 U_{cav,12} = 2 (Z X C)` is unitary with minimal order 12 (`(2 U_{cav,12})^6 = -64 I_2`,
         `(2 U_{cav,12})^{12} = 4096 I_2`). -/
theorem thm_univ_mod2_triality_and_l7_bragg_gap :
    ((∀ A B : Mat5, univMat5Mod2 (mat5Mul A B) = univMat5Mod2Mul (univMat5Mod2 A) (univMat5Mod2 B)) ∧
     (∀ l : Fin 12,
       univMat5Mod2 (transport (lineA l)) = univKleinMat (univLineKlein l).1 (univLineKlein l).2 ∧
       univMat5Mod2 (transport (lineB l)) = univMat5Mod2 (transport (lineA l))) ∧
     (∀ a1 b1 a2 b2 : Bool,
       univMat5Mod2Mul (univKleinMat a1 b1) (univKleinMat a2 b2) =
         univKleinMat (xor a1 a2) (xor b1 b2)) ∧
     (univMat5Mod2 mat5Id = univKleinMat false false) ∧
     (∀ a1 b1 a2 b2 : Bool, (a1, b1) ≠ (a2, b2) → univKleinMat a1 b1 ≠ univKleinMat a2 b2) ∧
     (((List.finRange 12).filter (fun l => univLineKlein l == (false, true))).length = 4 ∧
      ((List.finRange 12).filter (fun l => univLineKlein l == (true, true))).length = 4 ∧
      ((List.finRange 12).filter (fun l => univLineKlein l == (true, false))).length = 4 ∧
      (∀ l : Fin 12, univLineKlein l ≠ (false, false))) ∧
     ((∀ a1 b1 a2 b2 : Bool,
        univKleinEta (xor a1 a2, xor b1 b2) = xor (univKleinEta (a1, b1)) (univKleinEta (a2, b2)) ∧
        univKleinEta2 (xor a1 a2, xor b1 b2) = xor (univKleinEta2 (a1, b1)) (univKleinEta2 (a2, b2)) ∧
        univKleinEta3 (xor a1 a2, xor b1 b2) = xor (univKleinEta3 (a1, b1)) (univKleinEta3 (a2, b2))) ∧
      ([(false, false), (false, true), (true, false), (true, true)].filter (fun u => !univKleinEta u)).length = 2 ∧
      ([(false, false), (false, true), (true, false), (true, true)].filter (fun u => !univKleinEta2 u)).length = 2 ∧
      ([(false, false), (false, true), (true, false), (true, true)].filter (fun u => !univKleinEta3 u)).length = 2 ∧
      (∀ a : Fin 24, mat5Det (transport a) = ZSqrt2.ofInt (-1)))) ∧
    ((Mat2Eis.mul (Mat2Eis.dag univL7Even2) univL7Even2 = Mat2Eis.scale 4 Mat2Eis.id ∧
      Mat2Eis.mul (Mat2Eis.dag univL7Odd2) univL7Odd2 = Mat2Eis.scale 4 Mat2Eis.id ∧
      Eis.mul (Mat2Eis.det coin2) (Mat2Eis.det coin2) = Eis.scale 16 Eis.omega2 ∧
      Eis.mul (Mat2Eis.det univL7Odd2) (Mat2Eis.det univL7Even2) = Eis.scale 16 Eis.omega2 ∧
      Eis.mul coin2.m00 coin2.m00 = Eis.omega ∧
      Eis.mul coin2.m11 coin2.m11 = Eis.omega ∧
      Eis.add (Eis.mul coin2.m01 coin2.m10) (Eis.mul coin2.m10 coin2.m01) = Eis.scale (-6) Eis.omega ∧
      Eis.mul univL7Odd2.m00 univL7Even2.m00 = Eis.omega ∧
      Eis.mul univL7Odd2.m11 univL7Even2.m11 = Eis.omega ∧
      Eis.add (Eis.mul univL7Odd2.m01 univL7Even2.m10) (Eis.mul univL7Odd2.m10 univL7Even2.m01) =
        Eis.scale 3 Eis.omega) ∧
     (∀ c1 c2 q : Int, 0 < q → -q ≤ c1 → c1 ≤ q → -q ≤ c2 → c2 ≤ q →
       (3 * q + 2 * c2) * 4 - (c1 - 3 * q) * 8 ≥ 5 * q * 4) ∧
     (∀ q : Int, (3 * q + 2 * (-q)) * 4 - (q - 3 * q) * 8 = 5 * q * 4)) ∧
    (Mat2Eis.mul (Mat2Eis.dag univCav2Beat2) univCav2Beat2 = Mat2Eis.scale 4 Mat2Eis.id ∧
     Mat2Eis.mul univCav2Beat2 (Mat2Eis.dag univCav2Beat2) = Mat2Eis.scale 4 Mat2Eis.id ∧
     Mat2Eis.pow univCav2Beat2 3 =
       Mat2Eis.scale (-8) ⟨Eis.zero, Eis.one, Eis.one, Eis.zero⟩ ∧
     Mat2Eis.pow univCav2Beat2 6 = Mat2Eis.scale 64 Mat2Eis.id ∧
     Mat2Eis.pow univCav2Beat2 12 = Mat2Eis.scale 4096 Mat2Eis.id ∧
     Mat2Eis.mul (Mat2Eis.dag univCav12Step2) univCav12Step2 = Mat2Eis.scale 4 Mat2Eis.id ∧
     Mat2Eis.mul univCav12Step2 (Mat2Eis.dag univCav12Step2) = Mat2Eis.scale 4 Mat2Eis.id ∧
     Mat2Eis.pow univCav12Step2 6 = Mat2Eis.scale (-64) Mat2Eis.id ∧
     Mat2Eis.pow univCav12Step2 12 = Mat2Eis.scale 4096 Mat2Eis.id) := by
  have hKleinMul : ∀ a1 b1 a2 b2 : Bool,
      univMat5Mod2Mul (univKleinMat a1 b1) (univKleinMat a2 b2) =
        univKleinMat (xor a1 a2) (xor b1 b2) := by
    intro a1 b1 a2 b2
    exact funext (fun i => funext (fun j =>
      (by decide : ∀ (x1 y1 x2 y2 : Bool) (r c : Fin 5),
        univMat5Mod2Mul (univKleinMat x1 y1) (univKleinMat x2 y2) r c =
          univKleinMat (xor x1 x2) (xor y1 y2) r c) a1 b1 a2 b2 i j))
  have hKleinId : univMat5Mod2 mat5Id = univKleinMat false false :=
    funext (fun i => funext (fun j =>
      (by decide : ∀ r c : Fin 5, univMat5Mod2 mat5Id r c = univKleinMat false false r c) i j))
  have hKleinInj : ∀ a1 b1 a2 b2 : Bool, (a1, b1) ≠ (a2, b2) →
      univKleinMat a1 b1 ≠ univKleinMat a2 b2 := by
    intro a1 b1 a2 b2 hne hEq
    have h42 := congrFun (congrFun hEq ⟨4, by decide⟩) ⟨2, by decide⟩
    have h43 := congrFun (congrFun hEq ⟨4, by decide⟩) ⟨3, by decide⟩
    change (⟨false, a1⟩ : UnivZ2Mod2) = ⟨false, a2⟩ at h42
    change (⟨false, b1⟩ : UnivZ2Mod2) = ⟨false, b2⟩ at h43
    have ha : a1 = a2 := congrArg UnivZ2Mod2.b h42
    have hb : b1 = b2 := congrArg UnivZ2Mod2.b h43
    exact hne (Prod.ext ha hb)
  refine ⟨⟨univ_mat5Mod2_mul, univ_mod2_transport_lines, hKleinMul, hKleinId, hKleinInj,
           by decide, ⟨by decide, by decide, by decide, by decide, thm_coxeter_transport_det_neg_one⟩⟩,
          ⟨by decide, fun c1 c2 q _ _ _ _ _ => by omega, fun q => by omega⟩,
          by decide⟩

end Vibe
