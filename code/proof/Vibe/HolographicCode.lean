import Vibe.Chirality

/-!
# Vibe Theory: Full-`W(F_4)`-Covariant `GF(3)` Holographic Stabilizer Codes (`[[24, 1, 8]]_3` & `[[24, 0, 6]]_3`)

Zero-dependency Lean 4.35.0 formalization of Wave-2 Track W2's Open Challenge 4 breakthrough
(`test/verify/covariant-gf3-holographic-tensors.ts`, `note/project/vibe/research/wave2/02-covariant-gf3-holographic-tensors.md`):

1. **Exact `W(F_4)` Alignment & `S_3`-Triality Local-Clifford Homomorphism:**
   - All 4 Bourbaki `W(F_4)` simple reflections `s_0..s_3` on `Fin 24` match `Vibe.Chirality.mat2SlotPerm (f4SimpleMat2 k)`
     1-to-1, satisfy all 10 `F_4` Coxeter relations, and lift linearly to `S_3 = ⟨K, P⟩ < GL_2(3)` with purely unitary
     `det = +1` restriction `2T ∘ 2T → C_3 = ⟨P⟩ < SL_2(3)` and symbolic symplectic covariance `⟨g u, g v⟩_ω = det(A_g) ⟨u, v⟩_ω`.
2. **Exact Orthogonal Block Decomposition & Weight-4 Barrier Breaking:**
   - Symbolic orthogonal direct sum `GF(3)^48 = (U_3 ⊕ U_9 ⊕ V_-) ⊗ F_3^2` via 12 antipodal lines, compact RREF blocks
     `W_9^(6)` (dim 9) and `L_{V_-}^{(6)} = (R_8, 0) ⊕ (0, R_4)` (dim 12, explicitly linked to `hcR4` via invertible `4 × 4`
     change-of-basis matrices and exact Euclidean orthogonality `LVM_X ⊥ R_4`), and proof that `(a w_4, b w_4)` and its entire
     `W(F_4)`-orbit fail to commute with `W_9^(6)` for every `(a, b) ≠ (0, 0)`.
3. **Explicit Full-`W(F_4)`-Covariant `[[24, 1, 8]]_3` Bulk-Encoding Holographic Tensor:**
   - Explicit `23 × 48` check matrix `hcBulk23 = ⟨X^{⊗24}, Z^{⊗24}⟩ ⊕ W_9^(6) ⊕ L_{V_-}^{(6)}`: strictly isotropic,
     full rank `23`, covariant under all 4 Bourbaki generators and every `W(F_4)` word (all 1,152 symmetries).
   - Canonical 3-frame triality bulk logicals `X_L, Z_L` on `1_{F_0} - 1_{F_1}` and stabilizer-equivalent weight-8
     representatives `X_L^(8), Z_L^(8)` (`pauliWeight = 8`, `⟨X_L, Z_L⟩_ω = 1`, `∉ rowSpan hcBulk23`).
4. **Pure `[[24, 0, 6]]_3` `W(F_4)`-Covariant Lagrangian & Native `D_4` Classical/CSS Obstruction:**
   - Explicit `24 × 48` Lagrangian `hcPure24 = hcBulk23 ⊕ ⟨X_L(frame)⟩`: strictly isotropic, full rank `24`, all-word
     `W(F_4)`-covariant (with weight-6 witness), alongside exact native `D_4` dual-distance ceilings
     `d_⊥(R_4) = 2` (`e_0 + e_3 ∉ span R_4`) and `d_⊥(R_4 + span(1)) = 3` (`e_0 + e_6 + e_15 ∉ span R_5`).

**Verification Scope (Lean 4.35.0 vs External Exhaustive TS Verifier):**
- **Proved inside Lean `4.35.0`:** exact `W(F_4)` alignment and Coxeter relations, exact `S_3`-triality local-Clifford
  homomorphism (`det = +1` on `2T ∘ 2T` generators) and symbolic symplectic covariance, exact orthogonal block decomposition
  with explicit `R_8 ⊕ R_4` linkage to `hcR4`, full `W(F_4)`-orbit non-commutation of `(a w_4, b w_4)` with `W_9^(6)`,
  exact isotropy, exact full ranks `23` and `24`, exact all-word `W(F_4)` covariance (all 1,152 symmetries), canonical
  3-frame bulk logicals `X_L, Z_L ∈ S^⊥ \ S` with `⟨X_L, Z_L⟩_ω = 1`, stabilizer-equivalent weight-8 logicals (`d ≤ 8`),
  weight-6 stabilizer witnesses (`d_pure ≤ 6`), and exact native `D_4` dual distances `d_⊥(R_4) = 2` and `d_⊥(R_5) = 3`
  (with non-degeneracy `hcDualWt2 ∉ span(hcR4)`, `hcDualWt3 ∉ span(hcR5)`).
- **Verified externally in `test/verify/covariant-gf3-holographic-tensors.ts`:** exhaustive quantum distance lower
  bounds `d ≥ 8` (`hcBulk23`) and `d_pure ≥ 6`, Artin-Wedderburn `U_9 ⊗ F_3^2 = W_9^(4) ⊕ W_9^(6)` splitting and `3^9`
  weight census, brute-force `42,504 / 42,504` 5-uniformity, `553,276` boundary erasure recovery (`|E| ≤ 7`), and
  uniqueness/global optimality across all 13 `W(F_4)` and 9 `W(F_4)^+` local-Clifford classes.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 1: Pure `Nat` Mod-3 & `Fin n` Summation Infrastructure -/

private theorem hc_ite_pos {c : Prop} [d : Decidable c] {α : Type} {a b : α} (h : c) :
    (if c then a else b) = a := by
  cases d with | isTrue _ => rfl | isFalse hn => exact absurd h hn

private theorem hc_ite_neg {c : Prop} [d : Decidable c] {α : Type} {a b : α} (h : ¬ c) :
    (if c then a else b) = b := by
  cases d with | isTrue hp => exact absurd hp h | isFalse _ => rfl

private theorem hc_dite_pos {c : Prop} [d : Decidable c] {α : Type} {t : c → α} {e : ¬ c → α} (h : c) :
    dite c t e = t h := by
  cases d with | isTrue _ => rfl | isFalse hn => exact absurd h hn

private theorem hc_dite_neg {c : Prop} [d : Decidable c] {α : Type} {t : c → α} {e : ¬ c → α} (h : ¬ c) :
    dite c t e = e h := by
  cases d with | isTrue hp => exact absurd hp h | isFalse _ => rfl

private theorem hc_add_mod3_congr {a b c d : Nat} (h1 : a % 3 = c % 3) (h2 : b % 3 = d % 3) :
    (a + b) % 3 = (c + d) % 3 := by omega

private theorem hc_mul_mod3_left (a b : Nat) : ((a % 3) * b) % 3 = (a * b) % 3 := by
  have h : a = 3 * (a / 3) + a % 3 := by omega
  have hmul : a * b = 3 * ((a / 3) * b) + (a % 3) * b := by
    calc a * b = (3 * (a / 3) + a % 3) * b := congrArg (fun x => x * b) h
      _ = (3 * (a / 3)) * b + (a % 3) * b := Nat.add_mul (3 * (a / 3)) (a % 3) b
      _ = 3 * ((a / 3) * b) + (a % 3) * b := by rw [Nat.mul_assoc]
  rw [hmul]; omega

private theorem hc_mul_mod3_right (a b : Nat) : (a * (b % 3)) % 3 = (a * b) % 3 := by
  rw [Nat.mul_comm a (b % 3), hc_mul_mod3_left b a, Nat.mul_comm b a]

private theorem hc_mul_mod3_congr {a b c d : Nat} (h1 : a % 3 = c % 3) (h2 : b % 3 = d % 3) :
    (a * b) % 3 = (c * d) % 3 := by
  rw [← hc_mul_mod3_left a b, h1, hc_mul_mod3_left c b, ← hc_mul_mod3_right c b, h2, hc_mul_mod3_right c d]

private theorem hc_symp_strip_mod3 (a b c d : Nat) :
    ((a % 3) * (b % 3) + 2 * ((c % 3) * (d % 3))) % 3 = (a * b + 2 * (c * d)) % 3 :=
  hc_add_mod3_congr (hc_mul_mod3_congr (by omega) (by omega))
    (hc_mul_mod3_congr rfl (hc_mul_mod3_congr (by omega) (by omega)))

def hcSumFinAux {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) : Nat :=
  match k with | 0 => 0 | m + 1 => hcSumFinAux m (Nat.le_of_succ_le hk) f + f ⟨m, hk⟩

def hcSumFin {n : Nat} (f : Fin n → Nat) : Nat := hcSumFinAux n (Nat.le_refl n) f

private theorem hc_sumFinAux_zero {n : Nat} (k : Nat) (hk : k ≤ n) :
    hcSumFinAux k hk (fun _ : Fin n => 0) = 0 := by
  induction k with | zero => rfl | succ _ ih => simp only [hcSumFinAux]; rw [ih (Nat.le_of_succ_le hk)]

private theorem hc_sumFinAux_add {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Nat) :
    hcSumFinAux k hk (fun i => f i + g i) = hcSumFinAux k hk f + hcSumFinAux k hk g := by
  induction k with | zero => rfl | succ _ ih => simp only [hcSumFinAux]; rw [ih (Nat.le_of_succ_le hk)]; omega

private theorem hc_sumFinAux_mul_left {n : Nat} (k : Nat) (hk : k ≤ n) (c : Nat) (f : Fin n → Nat) :
    hcSumFinAux k hk (fun i => c * f i) = c * hcSumFinAux k hk f := by
  induction k with
  | zero => simp only [hcSumFinAux, Nat.mul_zero]
  | succ _ ih => simp only [hcSumFinAux]; rw [ih (Nat.le_of_succ_le hk), Nat.mul_add]

private theorem hc_sumFinAux_mul_right {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat) (c : Nat) :
    hcSumFinAux k hk (fun i => f i * c) = hcSumFinAux k hk f * c := by
  induction k with
  | zero => simp only [hcSumFinAux, Nat.zero_mul]
  | succ _ ih => simp only [hcSumFinAux]; rw [ih (Nat.le_of_succ_le hk), Nat.add_mul]

private theorem hc_sumFinAux_mod3_congr {n : Nat} (k : Nat) (hk : k ≤ n) (f g : Fin n → Nat)
    (h : ∀ i : Fin n, f i % 3 = g i % 3) : hcSumFinAux k hk f % 3 = hcSumFinAux k hk g % 3 := by
  induction k with
  | zero => rfl
  | succ m ih => simp only [hcSumFinAux]; exact hc_add_mod3_congr (ih (Nat.le_of_succ_le hk)) (h ⟨m, hk⟩)

private theorem hc_sumFinAux_swap {n m : Nat} (kn : Nat) (hkn : kn ≤ n) (km : Nat) (hkm : km ≤ m)
    (F : Fin n → Fin m → Nat) :
    hcSumFinAux kn hkn (fun i => hcSumFinAux km hkm (fun j => F i j)) =
      hcSumFinAux km hkm (fun j => hcSumFinAux kn hkn (fun i => F i j)) := by
  induction kn with
  | zero => simp only [hcSumFinAux]; exact (hc_sumFinAux_zero km hkm).symm
  | succ _ ih => simp only [hcSumFinAux]; rw [ih (Nat.le_of_succ_le hkn), ← hc_sumFinAux_add km hkm]

private theorem hc_sumFinAux_zero_except {n : Nat} (k : Nat) (hk : k ≤ n) (f : Fin n → Nat)
    (j : Fin n) (h : ∀ i : Fin n, i ≠ j → f i = 0) :
    hcSumFinAux k hk f = if j.val < k then f j else 0 := by
  induction k with
  | zero => simp only [hcSumFinAux]; exact (hc_ite_neg (by omega)).symm
  | succ m ih =>
    simp only [hcSumFinAux]; rw [ih (Nat.le_of_succ_le hk)]
    if hlt : j.val < m then
      have hne : (⟨m, hk⟩ : Fin n) ≠ j := by intro hEq; have hVal : m = j.val := congrArg Fin.val hEq; omega
      rw [hc_ite_pos hlt, hc_ite_pos (by omega : j.val < m + 1), h ⟨m, hk⟩ hne, Nat.add_zero]
    else if heq : j.val = m then
      have hfeq : (⟨m, hk⟩ : Fin n) = j := Fin.ext heq.symm
      rw [hc_ite_neg hlt, hc_ite_pos (by omega : j.val < m + 1), hfeq, Nat.zero_add]
    else
      have hne : (⟨m, hk⟩ : Fin n) ≠ j := by intro hEq; have hVal : m = j.val := congrArg Fin.val hEq; omega
      rw [hc_ite_neg hlt, hc_ite_neg (by omega : ¬ (j.val < m + 1)), h ⟨m, hk⟩ hne, Nat.add_zero]

private theorem hc_sumFinAux_shift {n m : Nat} (off k : Nat) (hk : k ≤ m) (hnm : off + m ≤ n)
    (f : Fin n → Nat) :
    hcSumFinAux (off + k) (by omega) f = hcSumFinAux off (by omega) f +
      hcSumFinAux k hk (fun j : Fin m => f ⟨j.val + off, by have := j.isLt; omega⟩) := by
  induction k with
  | zero => simp only [hcSumFinAux, Nat.add_zero]
  | succ r ih =>
    have hFin : (⟨off + r, by omega⟩ : Fin n) = ⟨r + off, by omega⟩ := Fin.ext (Nat.add_comm off r)
    change hcSumFinAux (off + r) (by omega) f + f ⟨off + r, by omega⟩ =
      hcSumFinAux off (by omega) f +
      (hcSumFinAux r (Nat.le_of_succ_le hk)
        (fun j : Fin m => f ⟨j.val + off, by have := j.isLt; omega⟩) + f ⟨r + off, by omega⟩)
    rw [ih (Nat.le_of_succ_le hk), hFin, Nat.add_assoc]

private theorem hc_sumFin_zero {n : Nat} : hcSumFin (fun _ : Fin n => 0) = 0 := hc_sumFinAux_zero n (Nat.le_refl n)
private theorem hc_sumFin_add {n : Nat} (f g : Fin n → Nat) :
    hcSumFin (fun i => f i + g i) = hcSumFin f + hcSumFin g := hc_sumFinAux_add n (Nat.le_refl n) f g
private theorem hc_sumFin_mul_left {n : Nat} (c : Nat) (f : Fin n → Nat) :
    hcSumFin (fun i => c * f i) = c * hcSumFin f := hc_sumFinAux_mul_left n (Nat.le_refl n) c f
private theorem hc_sumFin_mul_right {n : Nat} (f : Fin n → Nat) (c : Nat) :
    hcSumFin (fun i => f i * c) = hcSumFin f * c := hc_sumFinAux_mul_right n (Nat.le_refl n) f c
private theorem hc_sumFin_mod3_congr {n : Nat} (f g : Fin n → Nat) (h : ∀ i : Fin n, f i % 3 = g i % 3) :
    hcSumFin f % 3 = hcSumFin g % 3 := hc_sumFinAux_mod3_congr n (Nat.le_refl n) f g h
private theorem hc_sumFin_zero_mod3 {n : Nat} (f : Fin n → Nat) (h : ∀ i : Fin n, f i % 3 = 0) :
    hcSumFin f % 3 = 0 := by rw [hc_sumFin_mod3_congr f (fun _ => 0) h, hc_sumFin_zero]
private theorem hc_sumFin_swap {n m : Nat} (F : Fin n → Fin m → Nat) :
    hcSumFin (fun i => hcSumFin (fun j => F i j)) = hcSumFin (fun j => hcSumFin (fun i => F i j)) :=
  hc_sumFinAux_swap n (Nat.le_refl n) m (Nat.le_refl m) F
private theorem hc_sumFin_zero_except {n : Nat} (f : Fin n → Nat) (j : Fin n)
    (h : ∀ i : Fin n, i ≠ j → f i = 0) : hcSumFin f = f j := by
  unfold hcSumFin; rw [hc_sumFinAux_zero_except n (Nat.le_refl n) f j h, hc_ite_pos j.isLt]


/-! ## Section 2: `W(F_4)` Root/Line/Frame Geometry & `S_3`-Triality Local-Clifford Homomorphism -/

abbrev HcMat2 := Nat × Nat × Nat × Nat
abbrev HcVec48 := Fin 2 → Fin 24 → Nat
abbrev HcLineVec := Fin 2 → Fin 12 → Nat

def hcMat2Id : HcMat2 := (1, 0, 0, 1)
def hcMat2Det (A : HcMat2) : Nat := (A.1 * A.2.2.2 + 2 * (A.2.1 * A.2.2.1)) % 3
def hcMat2Mul (A B : HcMat2) : HcMat2 :=
  ((A.1 * B.1 + A.2.1 * B.2.2.1) % 3, (A.1 * B.2.1 + A.2.1 * B.2.2.2) % 3,
   (A.2.2.1 * B.1 + A.2.2.2 * B.2.2.1) % 3, (A.2.2.1 * B.2.1 + A.2.2.2 * B.2.2.2) % 3)
def hcMat2Pow (A : HcMat2) : Nat → HcMat2 | 0 => hcMat2Id | k + 1 => hcMat2Mul (hcMat2Pow A k) A

/-- Canonical `S_3`-triality homomorphism `W(F_4) → S_3 < GL_2(3)`: `s_0,s_1 ↦ I_2`, `s_2 ↦ K`, `s_3 ↦ K P = P^2 K`. -/
def hcCliffGen (k : Fin 4) : HcMat2 :=
  match k.val with | 0 | 1 => (1, 0, 0, 1) | 2 => (1, 0, 0, 2) | _ => (1, 1, 0, 2)
def hcCliffP : HcMat2 := hcMat2Mul (hcCliffGen ⟨2, by decide⟩) (hcCliffGen ⟨3, by decide⟩)

/-- Exact `Fin 24` permutations of the 4 Bourbaki `W(F_4)` simple reflections `s_0..s_3`. -/
def hcWF4Perm (k : Fin 4) (a : Fin 24) : Fin 24 :=
  match k.val with
  | 0 => match a.val with
    | 0 => ⟨4, by decide⟩  | 1 => ⟨5, by decide⟩  | 2 => ⟨6, by decide⟩  | 3 => ⟨7, by decide⟩
    | 4 => ⟨0, by decide⟩  | 5 => ⟨1, by decide⟩  | 6 => ⟨2, by decide⟩  | 7 => ⟨3, by decide⟩
    | 8 => ⟨8, by decide⟩  | 9 => ⟨9, by decide⟩  | 10 => ⟨10, by decide⟩ | 11 => ⟨11, by decide⟩
    | 12 => ⟨12, by decide⟩ | 13 => ⟨14, by decide⟩ | 14 => ⟨13, by decide⟩ | 15 => ⟨15, by decide⟩
    | 16 => ⟨20, by decide⟩ | 17 => ⟨21, by decide⟩ | 18 => ⟨22, by decide⟩ | 19 => ⟨23, by decide⟩
    | 20 => ⟨16, by decide⟩ | 21 => ⟨17, by decide⟩ | 22 => ⟨18, by decide⟩ | _ => ⟨19, by decide⟩
  | 1 => match a.val with
    | 0 => ⟨0, by decide⟩  | 1 => ⟨1, by decide⟩  | 2 => ⟨2, by decide⟩  | 3 => ⟨3, by decide⟩
    | 4 => ⟨8, by decide⟩  | 5 => ⟨9, by decide⟩  | 6 => ⟨10, by decide⟩ | 7 => ⟨11, by decide⟩
    | 8 => ⟨4, by decide⟩  | 9 => ⟨5, by decide⟩  | 10 => ⟨6, by decide⟩ | 11 => ⟨7, by decide⟩
    | 12 => ⟨16, by decide⟩ | 13 => ⟨17, by decide⟩ | 14 => ⟨18, by decide⟩ | 15 => ⟨19, by decide⟩
    | 16 => ⟨12, by decide⟩ | 17 => ⟨13, by decide⟩ | 18 => ⟨14, by decide⟩ | 19 => ⟨15, by decide⟩
    | 20 => ⟨20, by decide⟩ | 21 => ⟨22, by decide⟩ | 22 => ⟨21, by decide⟩ | _ => ⟨23, by decide⟩
  | 2 => match a.val with
    | 0 => ⟨0, by decide⟩  | 1 => ⟨1, by decide⟩  | 2 => ⟨2, by decide⟩  | 3 => ⟨3, by decide⟩
    | 4 => ⟨4, by decide⟩  | 5 => ⟨5, by decide⟩  | 6 => ⟨6, by decide⟩  | 7 => ⟨7, by decide⟩
    | 8 => ⟨9, by decide⟩  | 9 => ⟨8, by decide⟩  | 10 => ⟨11, by decide⟩ | 11 => ⟨10, by decide⟩
    | 12 => ⟨12, by decide⟩ | 13 => ⟨13, by decide⟩ | 14 => ⟨14, by decide⟩ | 15 => ⟨15, by decide⟩
    | 16 => ⟨17, by decide⟩ | 17 => ⟨16, by decide⟩ | 18 => ⟨19, by decide⟩ | 19 => ⟨18, by decide⟩
    | 20 => ⟨21, by decide⟩ | 21 => ⟨20, by decide⟩ | 22 => ⟨23, by decide⟩ | _ => ⟨22, by decide⟩
  | _ => match a.val with
    | 0 => ⟨0, by decide⟩  | 1 => ⟨20, by decide⟩ | 2 => ⟨23, by decide⟩ | 3 => ⟨3, by decide⟩
    | 4 => ⟨4, by decide⟩  | 5 => ⟨16, by decide⟩ | 6 => ⟨19, by decide⟩ | 7 => ⟨7, by decide⟩
    | 8 => ⟨8, by decide⟩  | 9 => ⟨12, by decide⟩ | 10 => ⟨15, by decide⟩ | 11 => ⟨11, by decide⟩
    | 12 => ⟨9, by decide⟩ | 13 => ⟨13, by decide⟩ | 14 => ⟨14, by decide⟩ | 15 => ⟨10, by decide⟩
    | 16 => ⟨5, by decide⟩ | 17 => ⟨17, by decide⟩ | 18 => ⟨18, by decide⟩ | 19 => ⟨6, by decide⟩
    | 20 => ⟨1, by decide⟩ | 21 => ⟨21, by decide⟩ | 22 => ⟨22, by decide⟩ | _ => ⟨2, by decide⟩

def hcPermPow (p : Fin 24 → Fin 24) : Nat → Fin 24 → Fin 24
  | 0, x => x | k + 1, x => p (hcPermPow p k x)

def hcLineOf (a : Fin 24) : Fin 12 :=
  match a.val with
  | 0 | 3 => ⟨0, by decide⟩  | 1 | 2 => ⟨1, by decide⟩  | 4 | 7 => ⟨2, by decide⟩  | 5 | 6 => ⟨3, by decide⟩
  | 8 | 11 => ⟨4, by decide⟩ | 9 | 10 => ⟨5, by decide⟩ | 12 | 15 => ⟨6, by decide⟩ | 13 | 14 => ⟨7, by decide⟩
  | 16 | 19 => ⟨8, by decide⟩ | 17 | 18 => ⟨9, by decide⟩ | 20 | 23 => ⟨10, by decide⟩ | _ => ⟨11, by decide⟩

def hcSignOf (a : Fin 24) : Nat :=
  match a.val with | 0 | 1 | 4 | 5 | 8 | 9 | 12 | 13 | 16 | 17 | 20 | 21 => 1 | _ => 2

def hcLineRep (l : Fin 12) : Fin 24 :=
  match l.val with
  | 0 => ⟨0, by decide⟩  | 1 => ⟨1, by decide⟩  | 2 => ⟨4, by decide⟩  | 3 => ⟨5, by decide⟩
  | 4 => ⟨8, by decide⟩  | 5 => ⟨9, by decide⟩  | 6 => ⟨12, by decide⟩ | 7 => ⟨13, by decide⟩
  | 8 => ⟨16, by decide⟩ | 9 => ⟨17, by decide⟩ | 10 => ⟨20, by decide⟩ | _ => ⟨21, by decide⟩

def hcOppRep (l : Fin 12) : Fin 24 :=
  match l.val with
  | 0 => ⟨3, by decide⟩  | 1 => ⟨2, by decide⟩  | 2 => ⟨7, by decide⟩  | 3 => ⟨6, by decide⟩
  | 4 => ⟨11, by decide⟩ | 5 => ⟨10, by decide⟩ | 6 => ⟨15, by decide⟩ | 7 => ⟨14, by decide⟩
  | 8 => ⟨19, by decide⟩ | 9 => ⟨18, by decide⟩ | 10 => ⟨23, by decide⟩ | _ => ⟨22, by decide⟩

def hcFrameOf (a : Fin 24) : Fin 3 :=
  match a.val with
  | 0 | 1 | 2 | 3 | 20 | 21 | 22 | 23 => ⟨0, by decide⟩
  | 4 | 5 | 6 | 7 | 16 | 17 | 18 | 19 => ⟨1, by decide⟩
  | _ => ⟨2, by decide⟩

def hcFramePerm (k : Fin 4) (f : Fin 3) : Fin 3 :=
  match k.val, f.val with
  | 0, 0 => ⟨1, by decide⟩ | 0, 1 => ⟨0, by decide⟩ | 0, _ => ⟨2, by decide⟩
  | 1, 0 => ⟨0, by decide⟩ | 1, 1 => ⟨2, by decide⟩ | 1, _ => ⟨1, by decide⟩ | _, _ => f

def hcLinePerm (k : Fin 4) (l : Fin 12) : Fin 12 := hcLineOf (hcWF4Perm k (hcLineRep l))
def hcLineSign (k : Fin 4) (l : Fin 12) : Nat := hcSignOf (hcWF4Perm k (hcLineRep l))

def hcSymp48 (u v : HcVec48) : Nat :=
  hcSumFin (fun r : Fin 24 =>
    u ⟨0, by decide⟩ r * v ⟨1, by decide⟩ r + 2 * (u ⟨1, by decide⟩ r * v ⟨0, by decide⟩ r)) % 3

def hcSympLine (u v : HcLineVec) : Nat :=
  hcSumFin (fun l : Fin 12 =>
    u ⟨0, by decide⟩ l * v ⟨1, by decide⟩ l + 2 * (u ⟨1, by decide⟩ l * v ⟨0, by decide⟩ l)) % 3

def hcPauliWeight (v : HcVec48) : Nat :=
  hcSumFin (fun r : Fin 24 => if v ⟨0, by decide⟩ r % 3 = 0 ∧ v ⟨1, by decide⟩ r % 3 = 0 then 0 else 1)

def hcActWF4 (k : Fin 4) (v : HcVec48) : HcVec48 :=
  let A := hcCliffGen k
  fun p r =>
    let src := hcWF4Perm k r
    match p.val with
    | 0 => (A.1 * v ⟨0, by decide⟩ src + A.2.1 * v ⟨1, by decide⟩ src) % 3
    | _ => (A.2.2.1 * v ⟨0, by decide⟩ src + A.2.2.2 * v ⟨1, by decide⟩ src) % 3

private theorem hc_actWF4_0 (k : Fin 4) (v : HcVec48) (r : Fin 24) :
    hcActWF4 k v ⟨0, by decide⟩ r =
      ((hcCliffGen k).1 * v ⟨0, by decide⟩ (hcWF4Perm k r) +
       (hcCliffGen k).2.1 * v ⟨1, by decide⟩ (hcWF4Perm k r)) % 3 := rfl

private theorem hc_actWF4_1 (k : Fin 4) (v : HcVec48) (r : Fin 24) :
    hcActWF4 k v ⟨1, by decide⟩ r =
      ((hcCliffGen k).2.2.1 * v ⟨0, by decide⟩ (hcWF4Perm k r) +
       (hcCliffGen k).2.2.2 * v ⟨1, by decide⟩ (hcWF4Perm k r)) % 3 := rfl

def hcActWord : List (Fin 4) → HcVec48 → HcVec48
  | [], v => v | k :: rest, v => hcActWF4 k (hcActWord rest v)

def hcLinComb {m : Nat} (c : Fin m → Fin 3) (H : Fin m → HcVec48) : HcVec48 :=
  fun p r => hcSumFin (fun i : Fin m => (c i).val * H i p r) % 3

def hcInSpan {m : Nat} (H : Fin m → HcVec48) (v : HcVec48) : Prop :=
  ∃ c : Fin m → Fin 3, ∀ p r, v p r % 3 = hcLinComb c H p r

/-- Headline Theorem 1: All 4 Bourbaki `W(F_4)` simple reflections match `Vibe.Chirality.mat2SlotPerm (f4SimpleMat2 k)`
    1-to-1, are antipodal-preserving involutions acting on the 3 frames, and obey all 10 `F_4` Coxeter relations. -/
theorem thm_hc_wf4_generators_match_chirality :
    (∀ k : Fin 4, ∀ a : Fin 24, hcWF4Perm k a = mat2SlotPerm (f4SimpleMat2 k) a) ∧
    (∀ k : Fin 4, ∀ a : Fin 24, hcWF4Perm k (hcWF4Perm k a) = a) ∧
    (∀ k : Fin 4, ∀ a : Fin 24, hcWF4Perm k (oppSlot a) = oppSlot (hcWF4Perm k a)) ∧
    (∀ k : Fin 4, ∀ a : Fin 24, hcFrameOf (hcWF4Perm k a) = hcFramePerm k (hcFrameOf a)) ∧
    (∀ a : Fin 24,
      let s0 := hcWF4Perm ⟨0, by decide⟩; let s1 := hcWF4Perm ⟨1, by decide⟩
      let s2 := hcWF4Perm ⟨2, by decide⟩; let s3 := hcWF4Perm ⟨3, by decide⟩
      hcPermPow (fun x => s0 (s1 x)) 3 a = a ∧ hcPermPow (fun x => s1 (s2 x)) 4 a = a ∧
      hcPermPow (fun x => s2 (s3 x)) 3 a = a ∧ hcPermPow (fun x => s0 (s2 x)) 2 a = a ∧
      hcPermPow (fun x => s0 (s3 x)) 2 a = a ∧ hcPermPow (fun x => s1 (s3 x)) 2 a = a) := by
  decide

private theorem hc_sum24_wf4Perm (k : Fin 4) (f : Fin 24 → Nat) :
    hcSumFin (fun r : Fin 24 => f (hcWF4Perm k r)) = hcSumFin f := by
  cases k with | mk kv hkv =>
  match kv, hkv with
  | 0, _ | 1, _ | 2, _ | 3, _ => simp only [hcSumFin, hcSumFinAux, hcWF4Perm]; omega
  | _ + 4, h => exact absurd h (by omega)

private theorem hc_site_symp_cliff (k : Fin 4) (ux uz vx vz : Nat) :
    let A := hcCliffGen k
    (((A.1 * ux + A.2.1 * uz) % 3) * ((A.2.2.1 * vx + A.2.2.2 * vz) % 3) +
     2 * (((A.2.2.1 * ux + A.2.2.2 * uz) % 3) * ((A.1 * vx + A.2.1 * vz) % 3))) % 3 =
    (hcMat2Det A * (ux * vz + 2 * (uz * vx))) % 3 := by
  cases k with | mk kv hkv =>
  match kv, hkv with
  | 0, _ | 1, _ =>
    simp only [hcCliffGen, hcMat2Det]; rw [hc_symp_strip_mod3]
    simp only [Nat.one_mul, Nat.zero_mul, Nat.add_zero, Nat.zero_add]; omega
  | 2, _ =>
    simp only [hcCliffGen, hcMat2Det]; rw [hc_symp_strip_mod3]
    simp only [Nat.one_mul, Nat.zero_mul, Nat.add_zero, Nat.zero_add]
    have h1 : ux * (2 * vz) = 2 * (ux * vz) := by rw [← Nat.mul_assoc, Nat.mul_comm ux 2, Nat.mul_assoc]
    have h2 : (2 * uz) * vx = 2 * (uz * vx) := Nat.mul_assoc 2 uz vx
    rw [h1, h2]; omega
  | 3, _ =>
    simp only [hcCliffGen, hcMat2Det]; rw [hc_symp_strip_mod3]
    simp only [Nat.one_mul, Nat.zero_mul, Nat.zero_add]
    have hEq : (ux + uz) * (2 * vz) + 2 * ((2 * uz) * (vx + vz)) =
        2 * (ux * vz + 2 * (uz * vx)) + 3 * (2 * (uz * vz)) := by
      rw [Nat.add_mul, Nat.mul_add (2 * uz) vx vz]
      have ha : ux * (2 * vz) = 2 * (ux * vz) := by rw [← Nat.mul_assoc, Nat.mul_comm ux 2, Nat.mul_assoc]
      have hb : uz * (2 * vz) = 2 * (uz * vz) := by rw [← Nat.mul_assoc, Nat.mul_comm uz 2, Nat.mul_assoc]
      have hc : (2 * uz) * vx = 2 * (uz * vx) := Nat.mul_assoc 2 uz vx
      have hd : (2 * uz) * vz = 2 * (uz * vz) := Nat.mul_assoc 2 uz vz
      rw [ha, hb, hc, hd]; omega
    rw [hEq]; omega
  | _ + 4, h => exact absurd h (by omega)

/-- Headline Theorem 2: Exact `S_3`-triality local-Clifford homomorphism `W(F_4) → S_3 < GL_2(3)`:
    obeys all 10 `F_4` Coxeter relations linearly in `GL_2(3)`, generates the 6-element group `S_3`,
    restricts to purely unitary `C_3 = ⟨P⟩ < SL_2(3)` (`det = +1`) on all 5 generators of `2T ∘ 2T`,
    and obeys symbolic symplectic covariance `⟨g u, g v⟩_ω = det(A_g) ⟨u, v⟩_ω (mod 3)` for ALL `u, v`. -/
theorem thm_hc_s3_clifford_homomorphism :
    (let A0 := hcCliffGen ⟨0, by decide⟩; let A1 := hcCliffGen ⟨1, by decide⟩
     let A2 := hcCliffGen ⟨2, by decide⟩; let A3 := hcCliffGen ⟨3, by decide⟩
     hcMat2Det A0 = 1 ∧ hcMat2Det A1 = 1 ∧ hcMat2Det A2 = 2 ∧ hcMat2Det A3 = 2 ∧
     hcMat2Pow A0 2 = hcMat2Id ∧ hcMat2Pow A1 2 = hcMat2Id ∧
     hcMat2Pow A2 2 = hcMat2Id ∧ hcMat2Pow A3 2 = hcMat2Id ∧
     hcMat2Pow (hcMat2Mul A0 A1) 3 = hcMat2Id ∧ hcMat2Pow (hcMat2Mul A1 A2) 4 = hcMat2Id ∧
     hcMat2Pow (hcMat2Mul A2 A3) 3 = hcMat2Id ∧ hcMat2Pow (hcMat2Mul A0 A2) 2 = hcMat2Id ∧
     hcMat2Pow (hcMat2Mul A0 A3) 2 = hcMat2Id ∧ hcMat2Pow (hcMat2Mul A1 A3) 2 = hcMat2Id ∧
     [hcMat2Id, hcCliffP, hcMat2Pow hcCliffP 2, A2, A3, hcMat2Mul hcCliffP A2].Nodup ∧
     (let a := hcMat2Mul A0 A1; let b := hcMat2Mul A1 A2; let c := hcMat2Mul A2 A3
      let b2 := hcMat2Mul b b; let binv := hcMat2Pow b 3
      let g4 := hcMat2Mul b (hcMat2Mul a binv); let g5 := hcMat2Mul b (hcMat2Mul c binv)
      hcMat2Det a = 1 ∧ hcMat2Det c = 1 ∧ hcMat2Det b2 = 1 ∧ hcMat2Det g4 = 1 ∧ hcMat2Det g5 = 1 ∧
      c = hcCliffP ∧ g5 = hcMat2Pow hcCliffP 2)) ∧
    (∀ k : Fin 4, ∀ u v : HcVec48,
      hcSymp48 (hcActWF4 k u) (hcActWF4 k v) = (hcMat2Det (hcCliffGen k) * hcSymp48 u v) % 3) := by
  refine ⟨by dsimp only; simp only [List.Nodup, List.pairwise_cons, eq_true List.Pairwise.nil, List.mem_cons, List.not_mem_nil, or_false, forall_eq_or_imp, forall_eq, false_implies, implies_true]; repeat (first | constructor | decide), ?_⟩
  intro k u v
  unfold hcSymp48
  have h1 : hcSumFin (fun r : Fin 24 =>
      hcActWF4 k u ⟨0, by decide⟩ r * hcActWF4 k v ⟨1, by decide⟩ r +
      2 * (hcActWF4 k u ⟨1, by decide⟩ r * hcActWF4 k v ⟨0, by decide⟩ r)) % 3 =
    hcSumFin (fun r : Fin 24 =>
      hcMat2Det (hcCliffGen k) *
        (u ⟨0, by decide⟩ (hcWF4Perm k r) * v ⟨1, by decide⟩ (hcWF4Perm k r) +
         2 * (u ⟨1, by decide⟩ (hcWF4Perm k r) * v ⟨0, by decide⟩ (hcWF4Perm k r)))) % 3 :=
    hc_sumFin_mod3_congr _ _ (fun r => hc_site_symp_cliff k _ _ _ _)
  rw [h1, hc_sumFin_mul_left,
    hc_sum24_wf4Perm k (fun r => u ⟨0, by decide⟩ r * v ⟨1, by decide⟩ r +
      2 * (u ⟨1, by decide⟩ r * v ⟨0, by decide⟩ r)),
    hc_mul_mod3_right]


/-! ## Section 3: Exact Block Decomposition `U_3 ⊕ U_9 ⊕ V_-` & Weight-4 Barrier Breaking -/

def hcLiftEven (v : HcLineVec) : HcVec48 := fun p r => v p (hcLineOf r) % 3
def hcLiftOdd (v : HcLineVec) : HcVec48 := fun p r => (hcSignOf r * v p (hcLineOf r)) % 3

def hcActLineEven (k : Fin 4) (v : HcLineVec) : HcLineVec :=
  let A := hcCliffGen k
  fun p l =>
    let src := hcLinePerm k l
    match p.val with
    | 0 => (A.1 * v ⟨0, by decide⟩ src + A.2.1 * v ⟨1, by decide⟩ src) % 3
    | _ => (A.2.2.1 * v ⟨0, by decide⟩ src + A.2.2.2 * v ⟨1, by decide⟩ src) % 3

def hcActLineOdd (k : Fin 4) (v : HcLineVec) : HcLineVec :=
  let A := hcCliffGen k
  fun p l =>
    let src := hcLinePerm k l; let s := hcLineSign k l
    match p.val with
    | 0 => (s * (A.1 * v ⟨0, by decide⟩ src + A.2.1 * v ⟨1, by decide⟩ src)) % 3
    | _ => (s * (A.2.2.1 * v ⟨0, by decide⟩ src + A.2.2.2 * v ⟨1, by decide⟩ src)) % 3

private theorem hc_actLineEven_0 (k : Fin 4) (v : HcLineVec) (l : Fin 12) :
    hcActLineEven k v ⟨0, by decide⟩ l =
      ((hcCliffGen k).1 * v ⟨0, by decide⟩ (hcLinePerm k l) +
       (hcCliffGen k).2.1 * v ⟨1, by decide⟩ (hcLinePerm k l)) % 3 := rfl

private theorem hc_actLineEven_1 (k : Fin 4) (v : HcLineVec) (l : Fin 12) :
    hcActLineEven k v ⟨1, by decide⟩ l =
      ((hcCliffGen k).2.2.1 * v ⟨0, by decide⟩ (hcLinePerm k l) +
       (hcCliffGen k).2.2.2 * v ⟨1, by decide⟩ (hcLinePerm k l)) % 3 := rfl

private theorem hc_actLineOdd_0 (k : Fin 4) (v : HcLineVec) (l : Fin 12) :
    hcActLineOdd k v ⟨0, by decide⟩ l =
      (hcLineSign k l * ((hcCliffGen k).1 * v ⟨0, by decide⟩ (hcLinePerm k l) +
       (hcCliffGen k).2.1 * v ⟨1, by decide⟩ (hcLinePerm k l))) % 3 := rfl

private theorem hc_actLineOdd_1 (k : Fin 4) (v : HcLineVec) (l : Fin 12) :
    hcActLineOdd k v ⟨1, by decide⟩ l =
      (hcLineSign k l * ((hcCliffGen k).2.2.1 * v ⟨0, by decide⟩ (hcLinePerm k l) +
       (hcCliffGen k).2.2.2 * v ⟨1, by decide⟩ (hcLinePerm k l))) % 3 := rfl

def hcIsFrameConst (u : HcLineVec) : Prop :=
  ∀ p : Fin 2,
    u p ⟨1, by decide⟩ % 3 = u p ⟨0, by decide⟩ % 3 ∧ u p ⟨10, by decide⟩ % 3 = u p ⟨0, by decide⟩ % 3 ∧
    u p ⟨11, by decide⟩ % 3 = u p ⟨0, by decide⟩ % 3 ∧ u p ⟨3, by decide⟩ % 3 = u p ⟨2, by decide⟩ % 3 ∧
    u p ⟨8, by decide⟩ % 3 = u p ⟨2, by decide⟩ % 3 ∧ u p ⟨9, by decide⟩ % 3 = u p ⟨2, by decide⟩ % 3 ∧
    u p ⟨5, by decide⟩ % 3 = u p ⟨4, by decide⟩ % 3 ∧ u p ⟨6, by decide⟩ % 3 = u p ⟨4, by decide⟩ % 3 ∧
    u p ⟨7, by decide⟩ % 3 = u p ⟨4, by decide⟩ % 3

def hcIsFrameZeroSum (v : HcLineVec) : Prop :=
  ∀ p : Fin 2,
    (v p ⟨0, by decide⟩ + v p ⟨1, by decide⟩ + v p ⟨10, by decide⟩ + v p ⟨11, by decide⟩) % 3 = 0 ∧
    (v p ⟨2, by decide⟩ + v p ⟨3, by decide⟩ + v p ⟨8, by decide⟩ + v p ⟨9, by decide⟩) % 3 = 0 ∧
    (v p ⟨4, by decide⟩ + v p ⟨5, by decide⟩ + v p ⟨6, by decide⟩ + v p ⟨7, by decide⟩) % 3 = 0

/-- Exact 9-row RREF basis of `W_9^(6) ⊂ U_9 ⊗ F_3^2` on 12 antipodal lines (4–5 nonzeros/row). -/
def hcW9Line (i : Fin 9) : HcLineVec :=
  match i.val with
  | 0 => fun p l => match p.val, l.val with | 0, 0 => 1 | 0, 1 => 2 | 1, 10 => 2 | 1, 11 => 1 | _, _ => 0
  | 1 => fun p l => match p.val, l.val with | 0, 2 => 1 | 0, 3 => 2 | 1, 8 => 2 | 1, 9 => 1 | _, _ => 0
  | 2 => fun p l => match p.val, l.val with | 0, 4 => 1 | 0, 5 => 2 | 1, 6 => 2 | 1, 7 => 1 | _, _ => 0
  | 3 => fun p l => match p.val, l.val with | 0, 6 => 1 | 0, 7 => 2 | 1, 5 => 2 | 1, 6 => 2 | 1, 7 => 2 | _, _ => 0
  | 4 => fun p l => match p.val, l.val with | 0, 8 => 1 | 0, 9 => 2 | 1, 3 => 2 | 1, 8 => 2 | 1, 9 => 2 | _, _ => 0
  | 5 => fun p l => match p.val, l.val with | 0, 10 => 1 | 0, 11 => 2 | 1, 1 => 2 | 1, 10 => 2 | 1, 11 => 2 | _, _ => 0
  | 6 => fun p l => match p.val, l.val with | 1, 0 => 1 | 1, 1 => 1 | 1, 10 => 2 | 1, 11 => 2 | _, _ => 0
  | 7 => fun p l => match p.val, l.val with | 1, 2 => 1 | 1, 3 => 1 | 1, 8 => 2 | 1, 9 => 2 | _, _ => 0
  | _ => fun p l => match p.val, l.val with | 1, 4 => 1 | 1, 5 => 1 | 1, 6 => 2 | 1, 7 => 2 | _, _ => 0

def hcW9Piv (j : Fin 9) : Fin 2 × Fin 12 :=
  match j.val with
  | 0 => (⟨0, by decide⟩, ⟨0, by decide⟩) | 1 => (⟨0, by decide⟩, ⟨2, by decide⟩) | 2 => (⟨0, by decide⟩, ⟨4, by decide⟩)
  | 3 => (⟨0, by decide⟩, ⟨6, by decide⟩) | 4 => (⟨0, by decide⟩, ⟨8, by decide⟩) | 5 => (⟨0, by decide⟩, ⟨10, by decide⟩)
  | 6 => (⟨1, by decide⟩, ⟨0, by decide⟩) | 7 => (⟨1, by decide⟩, ⟨2, by decide⟩) | _ => (⟨1, by decide⟩, ⟨4, by decide⟩)

/-- Exact 12-row RREF basis of `L_{V_-}^{(6)} = (R_8, 0) ⊕ (0, R_4)` on 12 antipodal lines. -/
def hcLVMLine (i : Fin 12) : HcLineVec :=
  match i.val with
  | 0 => fun p l => match p.val, l.val with | 0, 0 => 1 | 0, 5 => 2 | 0, 9 => 2 | 0, 10 => 2 | 0, 11 => 1 | _, _ => 0
  | 1 => fun p l => match p.val, l.val with | 0, 1 => 1 | 0, 5 => 2 | 0, 9 => 1 | _, _ => 0
  | 2 => fun p l => match p.val, l.val with | 0, 2 => 1 | 0, 5 => 2 | 0, 10 => 2 | _, _ => 0
  | 3 => fun p l => match p.val, l.val with | 0, 3 => 1 | 0, 5 => 2 | 0, 11 => 1 | _, _ => 0
  | 4 => fun p l => match p.val, l.val with | 0, 4 => 1 | 0, 5 => 2 | 0, 10 => 2 | 0, 11 => 1 | _, _ => 0
  | 5 => fun p l => match p.val, l.val with | 0, 6 => 1 | 0, 9 => 2 | 0, 10 => 2 | _, _ => 0
  | 6 => fun p l => match p.val, l.val with | 0, 7 => 1 | 0, 9 => 2 | 0, 11 => 1 | _, _ => 0
  | 7 => fun p l => match p.val, l.val with | 0, 8 => 1 | 0, 9 => 2 | 0, 10 => 2 | 0, 11 => 1 | _, _ => 0
  | 8 => fun p l => match p.val, l.val with | 1, 0 => 1 | 1, 3 => 1 | 1, 5 => 1 | 1, 7 => 1 | 1, 9 => 1 | 1, 10 => 2 | _, _ => 0
  | 9 => fun p l => match p.val, l.val with | 1, 1 => 1 | 1, 3 => 1 | 1, 5 => 1 | 1, 6 => 2 | 1, 8 => 2 | 1, 10 => 2 | _, _ => 0
  | 10 => fun p l => match p.val, l.val with | 1, 2 => 1 | 1, 3 => 2 | 1, 6 => 1 | 1, 7 => 2 | 1, 10 => 1 | 1, 11 => 1 | _, _ => 0
  | _ => fun p l => match p.val, l.val with | 1, 4 => 1 | 1, 5 => 2 | 1, 8 => 1 | 1, 9 => 2 | 1, 10 => 1 | 1, 11 => 2 | _, _ => 0

def hcLVMPiv (j : Fin 12) : Fin 2 × Fin 12 :=
  match j.val with
  | 0 => (⟨0, by decide⟩, ⟨0, by decide⟩) | 1 => (⟨0, by decide⟩, ⟨1, by decide⟩) | 2 => (⟨0, by decide⟩, ⟨2, by decide⟩)
  | 3 => (⟨0, by decide⟩, ⟨3, by decide⟩) | 4 => (⟨0, by decide⟩, ⟨4, by decide⟩) | 5 => (⟨0, by decide⟩, ⟨6, by decide⟩)
  | 6 => (⟨0, by decide⟩, ⟨7, by decide⟩) | 7 => (⟨0, by decide⟩, ⟨8, by decide⟩) | 8 => (⟨1, by decide⟩, ⟨0, by decide⟩)
  | 9 => (⟨1, by decide⟩, ⟨1, by decide⟩) | 10 => (⟨1, by decide⟩, ⟨2, by decide⟩) | _ => (⟨1, by decide⟩, ⟨4, by decide⟩)

private theorem hc_line_basics :
    (∀ l : Fin 12, hcLineOf (hcLineRep l) = l ∧ hcLineOf (hcOppRep l) = l ∧
      hcSignOf (hcLineRep l) = 1 ∧ hcSignOf (hcOppRep l) = 2 ∧ hcOppRep l = oppSlot (hcLineRep l)) ∧
    (∀ k : Fin 4, ∀ r : Fin 24,
      hcLineOf (hcWF4Perm k r) = hcLinePerm k (hcLineOf r) ∧
      hcSignOf (hcWF4Perm k r) = (hcSignOf r * hcLineSign k (hcLineOf r)) % 3) := by decide

private theorem hc_sum24_eq_sum12 (f : Fin 24 → Nat) :
    hcSumFin f = hcSumFin (fun l : Fin 12 => f (hcLineRep l) + f (hcOppRep l)) := by
  simp only [hcSumFin, hcSumFinAux, hcLineRep, hcOppRep]; omega

private theorem hc_sum12_eq_frames (f : Fin 12 → Nat) :
    hcSumFin f =
      (f ⟨0, by decide⟩ + f ⟨1, by decide⟩ + f ⟨10, by decide⟩ + f ⟨11, by decide⟩) +
      (f ⟨2, by decide⟩ + f ⟨3, by decide⟩ + f ⟨8, by decide⟩ + f ⟨9, by decide⟩) +
      (f ⟨4, by decide⟩ + f ⟨5, by decide⟩ + f ⟨6, by decide⟩ + f ⟨7, by decide⟩) := by
  simp only [hcSumFin, hcSumFinAux]; omega

private theorem hc_symp48_even_odd (u v : HcLineVec) : hcSymp48 (hcLiftEven u) (hcLiftOdd v) = 0 := by
  unfold hcSymp48 hcLiftEven hcLiftOdd; rw [hc_sum24_eq_sum12]; apply hc_sumFin_zero_mod3; intro l
  have hl := hc_line_basics.1 l; rw [hl.1, hl.2.1, hl.2.2.1, hl.2.2.2.1]
  have h1 := hc_symp_strip_mod3 (u ⟨0, by decide⟩ l) (1 * v ⟨1, by decide⟩ l) (u ⟨1, by decide⟩ l) (1 * v ⟨0, by decide⟩ l)
  have h2 := hc_symp_strip_mod3 (u ⟨0, by decide⟩ l) (2 * v ⟨1, by decide⟩ l) (u ⟨1, by decide⟩ l) (2 * v ⟨0, by decide⟩ l)
  rw [hc_add_mod3_congr h1 h2]
  have ha : u ⟨0, by decide⟩ l * (2 * v ⟨1, by decide⟩ l) = 2 * (u ⟨0, by decide⟩ l * v ⟨1, by decide⟩ l) := by
    rw [← Nat.mul_assoc, Nat.mul_comm _ 2, Nat.mul_assoc]
  have hb : u ⟨1, by decide⟩ l * (2 * v ⟨0, by decide⟩ l) = 2 * (u ⟨1, by decide⟩ l * v ⟨0, by decide⟩ l) := by
    rw [← Nat.mul_assoc, Nat.mul_comm _ 2, Nat.mul_assoc]
  rw [Nat.one_mul, Nat.one_mul, ha, hb]; omega

private theorem hc_symp48_even_even (u v : HcLineVec) :
    hcSymp48 (hcLiftEven u) (hcLiftEven v) = (2 * hcSympLine u v) % 3 := by
  unfold hcSymp48 hcSympLine hcLiftEven; rw [hc_sum24_eq_sum12, hc_mul_mod3_right, ← hc_sumFin_mul_left]
  apply hc_sumFin_mod3_congr; intro l; have hl := hc_line_basics.1 l; rw [hl.1, hl.2.1]
  have h1 := hc_symp_strip_mod3 (u ⟨0, by decide⟩ l) (v ⟨1, by decide⟩ l) (u ⟨1, by decide⟩ l) (v ⟨0, by decide⟩ l)
  rw [hc_add_mod3_congr h1 h1]; omega

private theorem hc_symp48_odd_odd (u v : HcLineVec) :
    hcSymp48 (hcLiftOdd u) (hcLiftOdd v) = (2 * hcSympLine u v) % 3 := by
  unfold hcSymp48 hcSympLine hcLiftOdd; rw [hc_sum24_eq_sum12, hc_mul_mod3_right, ← hc_sumFin_mul_left]
  apply hc_sumFin_mod3_congr; intro l; have hl := hc_line_basics.1 l; rw [hl.1, hl.2.1, hl.2.2.1, hl.2.2.2.1]
  have h1 := hc_symp_strip_mod3 (1 * u ⟨0, by decide⟩ l) (1 * v ⟨1, by decide⟩ l) (1 * u ⟨1, by decide⟩ l) (1 * v ⟨0, by decide⟩ l)
  have h2 := hc_symp_strip_mod3 (2 * u ⟨0, by decide⟩ l) (2 * v ⟨1, by decide⟩ l) (2 * u ⟨1, by decide⟩ l) (2 * v ⟨0, by decide⟩ l)
  rw [hc_add_mod3_congr h1 h2]
  have ha : (2 * u ⟨0, by decide⟩ l) * (2 * v ⟨1, by decide⟩ l) = 4 * (u ⟨0, by decide⟩ l * v ⟨1, by decide⟩ l) := by
    rw [Nat.mul_assoc 2, ← Nat.mul_assoc (u _ l) 2, Nat.mul_comm (u _ l) 2, Nat.mul_assoc 2, ← Nat.mul_assoc 2 2]
  have hb : (2 * u ⟨1, by decide⟩ l) * (2 * v ⟨0, by decide⟩ l) = 4 * (u ⟨1, by decide⟩ l * v ⟨0, by decide⟩ l) := by
    rw [Nat.mul_assoc 2, ← Nat.mul_assoc (u _ l) 2, Nat.mul_comm (u _ l) 2, Nat.mul_assoc 2, ← Nat.mul_assoc 2 2]
  rw [Nat.one_mul, Nat.one_mul, Nat.one_mul, Nat.one_mul, ha, hb]; omega

private theorem hc_frame4_orth_mod3 {ux uz a0 a1 a2 a3 b0 b1 b2 b3 u1x u2x u3x u1z u2z u3z : Nat}
    (hx1 : u1x % 3 = ux % 3) (hx2 : u2x % 3 = ux % 3) (hx3 : u3x % 3 = ux % 3)
    (hz1 : u1z % 3 = uz % 3) (hz2 : u2z % 3 = uz % 3) (hz3 : u3z % 3 = uz % 3)
    (ha : (a0 + a1 + a2 + a3) % 3 = 0) (hb : (b0 + b1 + b2 + b3) % 3 = 0) :
    ((ux * b0 + 2 * (uz * a0)) + (u1x * b1 + 2 * (u1z * a1)) +
     (u2x * b2 + 2 * (u2z * a2)) + (u3x * b3 + 2 * (u3z * a3))) % 3 = 0 := by
  have hEq :
      ((ux * b0 + 2 * (uz * a0)) + (u1x * b1 + 2 * (u1z * a1)) +
       (u2x * b2 + 2 * (u2z * a2)) + (u3x * b3 + 2 * (u3z * a3))) % 3 =
      ((ux * b0 + 2 * (uz * a0)) + (ux * b1 + 2 * (uz * a1)) +
       (ux * b2 + 2 * (uz * a2)) + (ux * b3 + 2 * (uz * a3))) % 3 :=
    hc_add_mod3_congr
      (hc_add_mod3_congr
        (hc_add_mod3_congr rfl
          (hc_add_mod3_congr (hc_mul_mod3_congr hx1 rfl) (hc_mul_mod3_congr rfl (hc_mul_mod3_congr hz1 rfl))))
        (hc_add_mod3_congr (hc_mul_mod3_congr hx2 rfl) (hc_mul_mod3_congr rfl (hc_mul_mod3_congr hz2 rfl))))
      (hc_add_mod3_congr (hc_mul_mod3_congr hx3 rfl) (hc_mul_mod3_congr rfl (hc_mul_mod3_congr hz3 rfl)))
  rw [hEq]
  have hFac : (ux * b0 + 2 * (uz * a0)) + (ux * b1 + 2 * (uz * a1)) +
      (ux * b2 + 2 * (uz * a2)) + (ux * b3 + 2 * (uz * a3)) =
      ux * (b0 + b1 + b2 + b3) + 2 * (uz * (a0 + a1 + a2 + a3)) := by
    simp only [Nat.mul_add]; omega
  rw [hFac]
  have hB : (ux * (b0 + b1 + b2 + b3)) % 3 = 0 := by rw [← hc_mul_mod3_right, hb, Nat.mul_zero]
  have hAz : (uz * (a0 + a1 + a2 + a3)) % 3 = 0 := by rw [← hc_mul_mod3_right, ha, Nat.mul_zero]
  have hA : (2 * (uz * (a0 + a1 + a2 + a3))) % 3 = 0 := by rw [← hc_mul_mod3_right, hAz, Nat.mul_zero]
  omega

private theorem hc_sympLine_frameConst_zeroSum (u v : HcLineVec)
    (hu : hcIsFrameConst u) (hv : hcIsFrameZeroSum v) : hcSympLine u v = 0 := by
  unfold hcSympLine; rw [hc_sum12_eq_frames]
  have hu0 := hu ⟨0, by decide⟩; have hu1 := hu ⟨1, by decide⟩
  have hv0 := hv ⟨0, by decide⟩; have hv1 := hv ⟨1, by decide⟩
  have hf0 := hc_frame4_orth_mod3 hu0.1 hu0.2.1 hu0.2.2.1 hu1.1 hu1.2.1 hu1.2.2.1 hv0.1 hv1.1
  have hf1 := hc_frame4_orth_mod3 hu0.2.2.2.1 hu0.2.2.2.2.1 hu0.2.2.2.2.2.1
    hu1.2.2.2.1 hu1.2.2.2.2.1 hu1.2.2.2.2.2.1 hv0.2.1 hv1.2.1
  have hf2 := hc_frame4_orth_mod3 hu0.2.2.2.2.2.2.1 hu0.2.2.2.2.2.2.2.1 hu0.2.2.2.2.2.2.2.2
    hu1.2.2.2.2.2.2.1 hu1.2.2.2.2.2.2.2.1 hu1.2.2.2.2.2.2.2.2 hv0.2.2 hv1.2.2
  omega

private theorem hc_blocks_certs :
    (∀ i : Fin 9, hcIsFrameZeroSum (hcW9Line i)) ∧
    (∀ i j : Fin 9, hcW9Line i (hcW9Piv j).1 (hcW9Piv j).2 = if i = j then 1 else 0) ∧
    (∀ i j : Fin 9, hcSympLine (hcW9Line i) (hcW9Line j) = 0) ∧
    (∀ i j : Fin 12, hcLVMLine i (hcLVMPiv j).1 (hcLVMPiv j).2 = if i = j then 1 else 0) ∧
    (∀ i j : Fin 12, hcSympLine (hcLVMLine i) (hcLVMLine j) = 0) ∧
    (∀ i : Fin 12, ∀ l : Fin 12,
      (i.val < 8 → hcLVMLine i ⟨1, by decide⟩ l = 0) ∧ (8 ≤ i.val → hcLVMLine i ⟨0, by decide⟩ l = 0)) := by
  unfold hcIsFrameZeroSum; decide

/-- Native `4 × 24` `D_4` root-coordinate matrix `R_4` mod 3 and `GF(3)` dot product on `Fin 24`. -/
def hcR4 (μ : Fin 4) (r : Fin 24) : Nat :=
  match coord4 (d4RootOf r) μ with | Int.ofNat 1 => 1 | Int.negSucc 0 => 2 | _ => 0

def hcDot24 (u v : Fin 24 → Nat) : Nat := hcSumFin (fun r : Fin 24 => u r * v r) % 3

/-- Explicit invertible `4 × 4` `GF(3)` change-of-basis matrices identifying the Z-half of `hcLVMLine` (`rows 8..11`) with `hcR4`. -/
def hcR4ToLVM (μ j : Fin 4) : Nat :=
  match μ.val, j.val with
  | 0, _ => 1
  | 1, 0 => 1 | 1, 1 => 2
  | 2, 2 => 1
  | 3, 3 => 1
  | _, _ => 0

def hcLVMToR4 (j μ : Fin 4) : Nat :=
  match j.val, μ.val with
  | 0, 0 => 2 | 0, 1 => 2 | 0, 2 => 1 | 0, 3 => 1
  | 1, 0 => 2 | 1, 1 => 1 | 1, 2 => 1 | 1, 3 => 1
  | 2, 2 => 1
  | 3, 3 => 1
  | _, _ => 0

private theorem hc_lvm_r4_certs :
    (∀ μ : Fin 4, ∀ r : Fin 24,
      hcR4 μ r = hcSumFin (fun j : Fin 4 =>
        hcR4ToLVM μ j * hcLiftOdd (hcLVMLine ⟨j.val + 8, by have := j.isLt; omega⟩) ⟨1, by decide⟩ r) % 3) ∧
    (∀ j : Fin 4, ∀ r : Fin 24,
      hcLiftOdd (hcLVMLine ⟨j.val + 8, by have := j.isLt; omega⟩) ⟨1, by decide⟩ r =
        hcSumFin (fun μ : Fin 4 => hcLVMToR4 j μ * hcR4 μ r) % 3) ∧
    (∀ i : Fin 8, ∀ μ : Fin 4,
      hcDot24 (fun r => hcLiftOdd (hcLVMLine ⟨i.val, by have := i.isLt; omega⟩) ⟨0, by decide⟩ r) (hcR4 μ) = 0) := by
  decide

/-- Headline Theorem 3: Exact orthogonal block decomposition `GF(3)^48 = (U_3 ⊕ U_9 ⊕ V_-) ⊗ F_3^2`,
    RREF pivots, explicit `R_8 ⊕ R_4` identification with `hcR4` (`span(hcLVM_Z) = span(hcR4)` via
    invertible `4 × 4` basis change and `hcLVM_X ⊥ hcR4` inside `V_-`), and isotropy of `W_9^(6)`
    (dim 9) and `L_{V_-}^{(6)}` (dim 12). -/
theorem thm_hc_orthogonal_block_decomposition :
    (∀ u v : HcLineVec, hcSymp48 (hcLiftEven u) (hcLiftOdd v) = 0) ∧
    (∀ u v : HcLineVec, hcIsFrameConst u → hcIsFrameZeroSum v → hcSymp48 (hcLiftEven u) (hcLiftEven v) = 0) ∧
    (∀ i : Fin 9, hcIsFrameZeroSum (hcW9Line i)) ∧
    (∀ i j : Fin 9, hcW9Line i (hcW9Piv j).1 (hcW9Piv j).2 = if i = j then 1 else 0) ∧
    (∀ i j : Fin 9, hcSymp48 (hcLiftEven (hcW9Line i)) (hcLiftEven (hcW9Line j)) = 0) ∧
    (∀ i j : Fin 12, hcLVMLine i (hcLVMPiv j).1 (hcLVMPiv j).2 = if i = j then 1 else 0) ∧
    (∀ i j : Fin 12, hcSymp48 (hcLiftOdd (hcLVMLine i)) (hcLiftOdd (hcLVMLine j)) = 0) ∧
    (∀ i : Fin 12, ∀ l : Fin 12,
      (i.val < 8 → hcLVMLine i ⟨1, by decide⟩ l = 0) ∧ (8 ≤ i.val → hcLVMLine i ⟨0, by decide⟩ l = 0)) ∧
    (∀ μ : Fin 4, ∀ r : Fin 24,
      hcR4 μ r = hcSumFin (fun j : Fin 4 =>
        hcR4ToLVM μ j * hcLiftOdd (hcLVMLine ⟨j.val + 8, by have := j.isLt; omega⟩) ⟨1, by decide⟩ r) % 3) ∧
    (∀ j : Fin 4, ∀ r : Fin 24,
      hcLiftOdd (hcLVMLine ⟨j.val + 8, by have := j.isLt; omega⟩) ⟨1, by decide⟩ r =
        hcSumFin (fun μ : Fin 4 => hcLVMToR4 j μ * hcR4 μ r) % 3) ∧
    (∀ i : Fin 8, ∀ μ : Fin 4,
      hcDot24 (fun r => hcLiftOdd (hcLVMLine ⟨i.val, by have := i.isLt; omega⟩) ⟨0, by decide⟩ r) (hcR4 μ) = 0) := by
  refine ⟨hc_symp48_even_odd, ?_, hc_blocks_certs.1, hc_blocks_certs.2.1, ?_,
    hc_blocks_certs.2.2.2.1, ?_, hc_blocks_certs.2.2.2.2.2,
    hc_lvm_r4_certs.1, hc_lvm_r4_certs.2.1, hc_lvm_r4_certs.2.2⟩
  · intro u v hu hv; rw [hc_symp48_even_even, hc_sympLine_frameConst_zeroSum u v hu hv]
  · intro i j; rw [hc_symp48_even_even, hc_blocks_certs.2.2.1 i j]
  · intro i j; rw [hc_symp48_odd_odd, hc_blocks_certs.2.2.2.2.1 i j]

private theorem hc_symp48_skew (u v : HcVec48) : hcSymp48 v u = (2 * hcSymp48 u v) % 3 := by
  unfold hcSymp48; rw [hc_mul_mod3_right, ← hc_sumFin_mul_left]
  apply hc_sumFin_mod3_congr; intro r
  rw [Nat.mul_comm (v ⟨0, by decide⟩ r), Nat.mul_comm (v ⟨1, by decide⟩ r)]; omega

private theorem hc_symp48_self (u : HcVec48) : hcSymp48 u u = 0 := by
  unfold hcSymp48; apply hc_sumFin_zero_mod3; intro r
  rw [Nat.mul_comm (u ⟨1, by decide⟩ r)]; omega

private theorem hc_symp48_congr_left {u u' : HcVec48} (v : HcVec48)
    (h : ∀ p r, u p r % 3 = u' p r % 3) : hcSymp48 u v = hcSymp48 u' v := by
  unfold hcSymp48; apply hc_sumFin_mod3_congr; intro r
  exact hc_add_mod3_congr (hc_mul_mod3_congr (h _ _) rfl) (hc_mul_mod3_congr rfl (hc_mul_mod3_congr (h _ _) rfl))

private theorem hc_symp48_linComb_eval {m : Nat} (c : Fin m → Fin 3) (H : Fin m → HcVec48) (v : HcVec48) :
    hcSymp48 (hcLinComb c H) v = hcSumFin (fun i : Fin m => (c i).val * hcSymp48 (H i) v) % 3 := by
  unfold hcSymp48 hcLinComb
  have hSite : ∀ r : Fin 24,
      ((hcSumFin (fun i : Fin m => (c i).val * H i ⟨0, by decide⟩ r) % 3) * v ⟨1, by decide⟩ r +
       2 * ((hcSumFin (fun i : Fin m => (c i).val * H i ⟨1, by decide⟩ r) % 3) * v ⟨0, by decide⟩ r)) % 3 =
      hcSumFin (fun i : Fin m =>
        (c i).val * (H i ⟨0, by decide⟩ r * v ⟨1, by decide⟩ r + 2 * (H i ⟨1, by decide⟩ r * v ⟨0, by decide⟩ r))) % 3 := by
    intro r
    have h1 : ((hcSumFin (fun i : Fin m => (c i).val * H i ⟨0, by decide⟩ r) % 3) * v ⟨1, by decide⟩ r) % 3 =
        hcSumFin (fun i : Fin m => (c i).val * (H i ⟨0, by decide⟩ r * v ⟨1, by decide⟩ r)) % 3 := by
      rw [hc_mul_mod3_left, ← hc_sumFin_mul_right]
      have hF : (fun i : Fin m => (c i).val * H i ⟨0, by decide⟩ r * v ⟨1, by decide⟩ r) =
          (fun i : Fin m => (c i).val * (H i ⟨0, by decide⟩ r * v ⟨1, by decide⟩ r)) := by
        funext i; exact Nat.mul_assoc _ _ _
      rw [hF]
    have h2 : (2 * ((hcSumFin (fun i : Fin m => (c i).val * H i ⟨1, by decide⟩ r) % 3) * v ⟨0, by decide⟩ r)) % 3 =
        hcSumFin (fun i : Fin m => (c i).val * (2 * (H i ⟨1, by decide⟩ r * v ⟨0, by decide⟩ r))) % 3 := by
      rw [hc_mul_mod3_congr rfl (hc_mul_mod3_left _ _), ← hc_sumFin_mul_right, ← hc_sumFin_mul_left]
      have hF : (fun i : Fin m => 2 * ((c i).val * H i ⟨1, by decide⟩ r * v ⟨0, by decide⟩ r)) =
          (fun i : Fin m => (c i).val * (2 * (H i ⟨1, by decide⟩ r * v ⟨0, by decide⟩ r))) := by
        funext i; rw [Nat.mul_assoc (c i).val, ← Nat.mul_assoc 2 (c i).val, Nat.mul_comm 2 (c i).val, Nat.mul_assoc]
      rw [hF]
    rw [hc_add_mod3_congr h1 h2, ← hc_sumFin_add]
    have hF : (fun i : Fin m => (c i).val * (H i ⟨0, by decide⟩ r * v ⟨1, by decide⟩ r) +
        (c i).val * (2 * (H i ⟨1, by decide⟩ r * v ⟨0, by decide⟩ r))) =
        (fun i : Fin m => (c i).val * (H i ⟨0, by decide⟩ r * v ⟨1, by decide⟩ r +
          2 * (H i ⟨1, by decide⟩ r * v ⟨0, by decide⟩ r))) := by funext i; exact (Nat.mul_add _ _ _).symm
    rw [hF]
  rw [hc_sumFin_mod3_congr _ _ hSite, hc_sumFin_swap]
  apply hc_sumFin_mod3_congr; intro i
  rw [hc_sumFin_mul_left, ← hc_mul_mod3_right]

private theorem hc_not_inSpan_of_symp_ne_zero {m : Nat} (H : Fin m → HcVec48) (u v : HcVec48)
    (hOrth : ∀ i : Fin m, hcSymp48 (H i) v = 0) (hNe : hcSymp48 u v ≠ 0) : ¬ hcInSpan H u := by
  intro ⟨c, hc⟩
  have h0 : hcSymp48 (hcLinComb c H) v = 0 := by
    rw [hc_symp48_linComb_eval]; apply hc_sumFin_zero_mod3; intro i; rw [hOrth i, Nat.mul_zero]
  rw [hc_symp48_congr_left (u' := hcLinComb c H) v (fun p r => by rw [hc p r]; unfold hcLinComb; omega), h0] at hNe
  exact hNe rfl

def hcW9Coeff (k : Fin 4) (i j : Fin 9) : Fin 3 :=
  ⟨hcActLineEven k (hcW9Line i) (hcW9Piv j).1 (hcW9Piv j).2 % 3, Nat.mod_lt _ (by decide)⟩

private theorem hc_w9_wf4_k0 : ∀ i : Fin 9, ∀ p : Fin 2, ∀ l : Fin 12,
    hcActLineEven ⟨0, by decide⟩ (hcW9Line i) p l = hcSumFin (fun j : Fin 9 => (hcW9Coeff ⟨0, by decide⟩ i j).val * hcW9Line j p l) % 3 := by decide
private theorem hc_w9_wf4_k1 : ∀ i : Fin 9, ∀ p : Fin 2, ∀ l : Fin 12,
    hcActLineEven ⟨1, by decide⟩ (hcW9Line i) p l = hcSumFin (fun j : Fin 9 => (hcW9Coeff ⟨1, by decide⟩ i j).val * hcW9Line j p l) % 3 := by decide
private theorem hc_w9_wf4_k2 : ∀ i : Fin 9, ∀ p : Fin 2, ∀ l : Fin 12,
    hcActLineEven ⟨2, by decide⟩ (hcW9Line i) p l = hcSumFin (fun j : Fin 9 => (hcW9Coeff ⟨2, by decide⟩ i j).val * hcW9Line j p l) % 3 := by decide
private theorem hc_w9_wf4_k3 : ∀ i : Fin 9, ∀ p : Fin 2, ∀ l : Fin 12,
    hcActLineEven ⟨3, by decide⟩ (hcW9Line i) p l = hcSumFin (fun j : Fin 9 => (hcW9Coeff ⟨3, by decide⟩ i j).val * hcW9Line j p l) % 3 := by decide

private theorem hc_actWF4_liftEven (k : Fin 4) (v : HcLineVec) (p : Fin 2) (r : Fin 24) :
    hcActWF4 k (hcLiftEven v) p r = hcLiftEven (hcActLineEven k v) p r := by
  have hl := (hc_line_basics.2 k r).1
  cases p with | mk pv hpv => match pv, hpv with
  | 0, _ =>
    rw [hc_actWF4_0]; unfold hcLiftEven; rw [hc_actLineEven_0, hl, hc_add_mod3_congr (hc_mul_mod3_right _ _) (hc_mul_mod3_right _ _)]; omega
  | 1, _ =>
    rw [hc_actWF4_1]; unfold hcLiftEven; rw [hc_actLineEven_1, hl, hc_add_mod3_congr (hc_mul_mod3_right _ _) (hc_mul_mod3_right _ _)]; omega
  | _ + 2, h => exact absurd h (by omega)

private theorem hc_exists_fin_of_not_forall {n : Nat} {P : Fin n → Prop} [∀ i, Decidable (P i)]
    (h : ¬ ∀ i : Fin n, P i) : ∃ i : Fin n, ¬ P i := by
  suffices ∀ (k : Nat) (hk : k ≤ n), (¬ ∀ i : Fin n, i.val < k → P i) → ∃ i : Fin n, ¬ P i from
    this n (Nat.le_refl n) (fun hAll => h (fun i => hAll i i.isLt))
  intro k hk
  induction k with
  | zero => intro h0; exact absurd (fun i hi => absurd hi (by omega)) h0
  | succ m ih =>
    intro hNot
    if hm : P ⟨m, hk⟩ then
      apply ih (Nat.le_of_succ_le hk)
      intro hPrev; apply hNot; intro i hi
      if hlt : i.val < m then exact hPrev i hlt
      else
        have hEq : i = ⟨m, hk⟩ := Fin.ext (by change i.val = m; omega)
        rw [hEq]; exact hm
    else
      exact ⟨⟨m, hk⟩, hm⟩

private theorem hc_actWF4_w9_row (k : Fin 4) (i : Fin 9) (p : Fin 2) (r : Fin 24) :
    hcActWF4 k (hcLiftEven (hcW9Line i)) p r =
      hcLinComb (hcW9Coeff k i) (fun j => hcLiftEven (hcW9Line j)) p r := by
  have hW9 : hcActLineEven k (hcW9Line i) p (hcLineOf r) =
      hcSumFin (fun j : Fin 9 => (hcW9Coeff k i j).val * hcW9Line j p (hcLineOf r)) % 3 := by
    cases k with | mk kv hkv => match kv, hkv with
    | 0, _ => exact hc_w9_wf4_k0 i p (hcLineOf r)
    | 1, _ => exact hc_w9_wf4_k1 i p (hcLineOf r)
    | 2, _ => exact hc_w9_wf4_k2 i p (hcLineOf r)
    | 3, _ => exact hc_w9_wf4_k3 i p (hcLineOf r)
    | _ + 4, h => exact absurd h (by omega)
  rw [hc_actWF4_liftEven]; unfold hcLiftEven hcLinComb; rw [hW9]
  have hC : ∀ j : Fin 9, ((hcW9Coeff k i j).val * hcW9Line j p (hcLineOf r)) % 3 =
      ((hcW9Coeff k i j).val * (hcW9Line j p (hcLineOf r) % 3)) % 3 :=
    fun j => (hc_mul_mod3_right _ _).symm
  rw [hc_sumFin_mod3_congr _ _ hC]; dsimp only; omega

private theorem hc_noncomm_w9_step (k : Fin 4) (v : HcVec48)
    (h : ∃ i : Fin 9, hcSymp48 v (hcLiftEven (hcW9Line i)) ≠ 0) :
    ∃ j : Fin 9, hcSymp48 (hcActWF4 k v) (hcLiftEven (hcW9Line j)) ≠ 0 := by
  rcases h with ⟨i, hi⟩
  apply hc_exists_fin_of_not_forall
  intro hAll
  have hOrth : ∀ j : Fin 9, hcSymp48 (hcLiftEven (hcW9Line j)) (hcActWF4 k v) = 0 := by
    intro j; rw [hc_symp48_skew, hAll j]
  have hZero : hcSymp48 (hcActWF4 k (hcLiftEven (hcW9Line i))) (hcActWF4 k v) = 0 := by
    rw [hc_symp48_congr_left (u := hcActWF4 k (hcLiftEven (hcW9Line i)))
          (u' := hcLinComb (hcW9Coeff k i) (fun j => hcLiftEven (hcW9Line j))) (hcActWF4 k v)
          (fun p r => congrArg (· % 3) (hc_actWF4_w9_row k i p r)),
        hc_symp48_linComb_eval]
    apply hc_sumFin_zero_mod3; intro j; rw [hOrth j, Nat.mul_zero]
  have hZero' : hcSymp48 (hcActWF4 k v) (hcActWF4 k (hcLiftEven (hcW9Line i))) = 0 := by
    rw [hc_symp48_skew, hZero]
  rw [thm_hc_s3_clifford_homomorphism.2 k v (hcLiftEven (hcW9Line i))] at hZero'
  have hDet : hcMat2Det (hcCliffGen k) = 1 ∨ hcMat2Det (hcCliffGen k) = 2 :=
    (by decide : ∀ k0 : Fin 4, hcMat2Det (hcCliffGen k0) = 1 ∨ hcMat2Det (hcCliffGen k0) = 2) k
  have hLt : hcSymp48 v (hcLiftEven (hcW9Line i)) < 3 := by unfold hcSymp48; exact Nat.mod_lt _ (by decide)
  rcases hDet with hD | hD <;> rw [hD] at hZero' <;> omega

private theorem hc_noncomm_w9_word (w : List (Fin 4)) (v : HcVec48)
    (h : ∃ i : Fin 9, hcSymp48 v (hcLiftEven (hcW9Line i)) ≠ 0) :
    ∃ j : Fin 9, hcSymp48 (hcActWord w v) (hcLiftEven (hcW9Line j)) ≠ 0 := by
  induction w with
  | nil => exact h
  | cons k rest ih => exact hc_noncomm_w9_step k (hcActWord rest v) ih

def hcUntwistedWt4 (a b : Fin 3) : HcVec48 :=
  fun p r =>
    let w := match r.val with | 0 | 3 => 1 | 1 | 2 => 2 | _ => 0
    match p.val with | 0 => (a.val * w) % 3 | _ => (b.val * w) % 3

/-- Headline Theorem 4: For every `(a, b) ≠ (0, 0)`, the untwisted `U_9` weight-4 barrier vector
    `(a w_4, b w_4)` has exact Pauli weight `4`, fails to commute with `W_9^(6)`, AND every vector
    in its full `W(F_4)`-orbit (`∀ w : List (Fin 4)`) likewise fails to commute with `W_9^(6)`.
    (Scope note: the full Artin-Wedderburn direct-sum split `U_9 ⊗ F_3^2 = W_9^(4) ⊕ W_9^(6)` and
    exhaustive `min wt_P(W_9^(6)) = 6` over all `3^9` vectors are certified externally in
    `test/verify/covariant-gf3-holographic-tensors.ts` T4a.) -/
theorem thm_hc_w9_weight4_vs_weight6_split :
    ∀ a b : Fin 3, (a.val ≠ 0 ∨ b.val ≠ 0) →
      hcPauliWeight (hcUntwistedWt4 a b) = 4 ∧
      (∃ i : Fin 9, hcSymp48 (hcUntwistedWt4 a b) (hcLiftEven (hcW9Line i)) ≠ 0) ∧
      (∀ w : List (Fin 4), ∃ j : Fin 9,
        hcSymp48 (hcActWord w (hcUntwistedWt4 a b)) (hcLiftEven (hcW9Line j)) ≠ 0) := by
  have hBase : ∀ a b : Fin 3, (a.val ≠ 0 ∨ b.val ≠ 0) →
      hcPauliWeight (hcUntwistedWt4 a b) = 4 ∧
      ∃ i : Fin 9, hcSymp48 (hcUntwistedWt4 a b) (hcLiftEven (hcW9Line i)) ≠ 0 := by decide
  intro a b hab
  have hb := hBase a b hab
  exact ⟨hb.1, hb.2, fun w => hc_noncomm_w9_word w (hcUntwistedWt4 a b) hb.2⟩


/-! ## Section 4: Explicit Full-`W(F_4)`-Covariant `[[24, 1, 8]]_3` Code & Triality Bulk Logicals -/

def hcAllX : HcVec48 := hcLiftEven (fun p _ => if p.val = 0 then 1 else 0)
def hcAllZ : HcVec48 := hcLiftEven (fun p _ => if p.val = 1 then 1 else 0)

def hcFrameDiffLine (p0 : Fin 2) : HcLineVec :=
  fun p l => if p = p0 then (match hcFrameOf (hcLineRep l) with | ⟨0, _⟩ => 1 | ⟨1, _⟩ => 2 | _ => 0) else 0
def hcXLFrame : HcVec48 := hcLiftEven (hcFrameDiffLine ⟨0, by decide⟩)
def hcZLFrame : HcVec48 := hcLiftEven (hcFrameDiffLine ⟨1, by decide⟩)

def hcXLWt8 : HcVec48 :=
  fun p r => if p.val = 0 then (match r.val with | 0 | 1 | 21 | 23 => 2 | 4 | 5 | 17 | 19 => 1 | _ => 0) else 0
def hcZLWt8 : HcVec48 :=
  fun p r => if p.val = 1 then (match r.val with | 0 | 1 | 2 | 3 => 2 | 4 | 5 | 6 | 7 => 1 | _ => 0) else 0

/-- Explicit `23 × 48` `GF(3)` check matrix `H_24_1_8 = ⟨X^{⊗24}, Z^{⊗24}⟩ ⊕ W_9^(6) ⊕ L_{V_-}^{(6)}`. -/
def hcBulk23 (i : Fin 23) : HcVec48 :=
  if i.val = 0 then hcAllX else if i.val = 1 then hcAllZ
  else if h : i.val < 11 then hcLiftEven (hcW9Line ⟨i.val - 2, by omega⟩)
  else hcLiftOdd (hcLVMLine ⟨i.val - 11, by have := i.isLt; omega⟩)

private theorem hc_bulk23_w9 (j : Fin 9) :
    hcBulk23 ⟨j.val + 2, by have := j.isLt; omega⟩ = hcLiftEven (hcW9Line j) := by
  unfold hcBulk23; dsimp only
  rw [hc_ite_neg (by omega : ¬ j.val + 2 = 0), hc_ite_neg (by omega : ¬ j.val + 2 = 1),
      hc_dite_pos (by have := j.isLt; omega : j.val + 2 < 11)]
  have hj : (⟨j.val + 2 - 2, by omega⟩ : Fin 9) = j := Fin.ext (Nat.add_sub_cancel j.val 2); rw [hj]

private theorem hc_bulk23_lvm (m : Fin 12) :
    hcBulk23 ⟨m.val + 11, by have := m.isLt; omega⟩ = hcLiftOdd (hcLVMLine m) := by
  unfold hcBulk23; dsimp only
  rw [hc_ite_neg (by omega : ¬ m.val + 11 = 0), hc_ite_neg (by omega : ¬ m.val + 11 = 1),
      hc_dite_neg (by omega : ¬ m.val + 11 < 11)]
  have hm : (⟨m.val + 11 - 11, by omega⟩ : Fin 12) = m := Fin.ext (Nat.add_sub_cancel m.val 11); rw [hm]

private theorem hc_sumFin23_split (f : Fin 23 → Nat) :
    hcSumFin f = (f ⟨0, by decide⟩ + f ⟨1, by decide⟩) +
      hcSumFin (fun j : Fin 9 => f ⟨j.val + 2, by have := j.isLt; omega⟩) +
      hcSumFin (fun m : Fin 12 => f ⟨m.val + 11, by have := m.isLt; omega⟩) := by
  have h1 := hc_sumFinAux_shift (n := 23) (m := 12) 11 12 (Nat.le_refl 12) (by decide) f
  have h2 := hc_sumFinAux_shift (n := 23) (m := 9) 2 9 (Nat.le_refl 9) (by decide) f
  change hcSumFinAux (11 + 12) (by decide) f = (f ⟨0, by decide⟩ + f ⟨1, by decide⟩) +
    hcSumFinAux 9 (Nat.le_refl 9) (fun j : Fin 9 => f ⟨j.val + 2, by have := j.isLt; omega⟩) +
    hcSumFinAux 12 (Nat.le_refl 12) (fun m : Fin 12 => f ⟨m.val + 11, by have := m.isLt; omega⟩)
  rw [h1, h2]
  have h0 : hcSumFinAux 2 (by decide) f = f ⟨0, by decide⟩ + f ⟨1, by decide⟩ := by
    simp only [hcSumFinAux, Nat.zero_add]
  rw [h0]

private theorem hc_bulk23_iso_upper :
    ∀ i j : Fin 23, i.val < j.val → hcSymp48 (hcBulk23 i) (hcBulk23 j) = 0 := by decide

private theorem hc_bulk23_iso (i j : Fin 23) : hcSymp48 (hcBulk23 i) (hcBulk23 j) = 0 := by
  if hlt : i.val < j.val then exact hc_bulk23_iso_upper i j hlt
  else if hgt : j.val < i.val then rw [hc_symp48_skew, hc_bulk23_iso_upper j i hgt]
  else have hEq : i = j := Fin.ext (by omega); rw [hEq]; exact hc_symp48_self _

private theorem hc_bulk23_01_vals :
    (∀ r : Fin 24, hcBulk23 ⟨0, by decide⟩ ⟨0, by decide⟩ r = 1 ∧ hcBulk23 ⟨0, by decide⟩ ⟨1, by decide⟩ r = 0 ∧
      hcBulk23 ⟨1, by decide⟩ ⟨0, by decide⟩ r = 0 ∧ hcBulk23 ⟨1, by decide⟩ ⟨1, by decide⟩ r = 1) := by decide

private theorem hc_w9_linComb_zeroSum (c : Fin 9 → Fin 3) :
    hcIsFrameZeroSum (fun p l => hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l) % 3) := by
  intro p
  have hSum : ∀ l0 l1 l2 l3 : Fin 12,
      (∀ j : Fin 9, (hcW9Line j p l0 + hcW9Line j p l1 + hcW9Line j p l2 + hcW9Line j p l3) % 3 = 0) →
      (hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l0) % 3 +
       hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l1) % 3 +
       hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l2) % 3 +
       hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l3) % 3) % 3 = 0 := by
    intro l0 l1 l2 l3 hF
    have hStrip :
        (hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l0) % 3 +
         hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l1) % 3 +
         hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l2) % 3 +
         hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l3) % 3) % 3 =
        (hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l0) +
         hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l1) +
         hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l2) +
         hcSumFin (fun j : Fin 9 => (c j).val * hcW9Line j p l3)) % 3 := by omega
    rw [hStrip, ← hc_sumFin_add, ← hc_sumFin_add, ← hc_sumFin_add]
    apply hc_sumFin_zero_mod3; intro j
    have hDist : (c j).val * hcW9Line j p l0 + (c j).val * hcW9Line j p l1 +
        (c j).val * hcW9Line j p l2 + (c j).val * hcW9Line j p l3 =
        (c j).val * (hcW9Line j p l0 + hcW9Line j p l1 + hcW9Line j p l2 + hcW9Line j p l3) := by
      simp only [Nat.mul_add]
    rw [hDist, ← hc_mul_mod3_right, hF j, Nat.mul_zero]
  exact ⟨hSum _ _ _ _ (fun j => (hc_blocks_certs.1 j p).1),
         hSum _ _ _ _ (fun j => (hc_blocks_certs.1 j p).2.1),
         hSum _ _ _ _ (fun j => (hc_blocks_certs.1 j p).2.2)⟩

private theorem hc_bulk23_rank23 (c : Fin 23 → Fin 3)
    (hZero : ∀ p r, hcLinComb c hcBulk23 p r = 0) : ∀ i : Fin 23, c i = ⟨0, by decide⟩ := by
  let a0 := (c ⟨0, by decide⟩).val; let a1 := (c ⟨1, by decide⟩).val
  let cW9 : Fin 9 → Fin 3 := fun j => c ⟨j.val + 2, by have := j.isLt; omega⟩
  let cVM : Fin 12 → Fin 3 := fun m => c ⟨m.val + 11, by have := m.isLt; omega⟩
  let w9 : HcLineVec := fun p l => hcSumFin (fun j : Fin 9 => (cW9 j).val * hcW9Line j p l) % 3
  let vm : HcLineVec := fun p l => hcSumFin (fun m : Fin 12 => (cVM m).val * hcLVMLine m p l) % 3
  let u3 : Fin 2 → Nat := fun p => if p.val = 0 then a0 else a1
  have hBoth : ∀ p l, vm p l = 0 ∧ (u3 p + w9 p l) % 3 = 0 := by
    have hEq : ∀ p r, (u3 p + w9 p (hcLineOf r) + hcSignOf r * vm p (hcLineOf r)) % 3 = 0 := by
      intro p r; have hz := hZero p r; unfold hcLinComb at hz; rw [hc_sumFin23_split] at hz
      have h01 : ((c ⟨0, by decide⟩).val * hcBulk23 ⟨0, by decide⟩ p r +
          (c ⟨1, by decide⟩).val * hcBulk23 ⟨1, by decide⟩ p r) % 3 = u3 p % 3 := by
        cases p with | mk pv hpv =>
        match pv, hpv with
        | 0, _ => rw [(hc_bulk23_01_vals r).1, (hc_bulk23_01_vals r).2.2.1]; change (a0 * 1 + a1 * 0) % 3 = a0 % 3; omega
        | 1, _ => rw [(hc_bulk23_01_vals r).2.1, (hc_bulk23_01_vals r).2.2.2]; change (a0 * 0 + a1 * 1) % 3 = a1 % 3; omega
        | _ + 2, h => exact absurd h (by omega)
      have hW : hcSumFin (fun j : Fin 9 => (cW9 j).val * hcBulk23 ⟨j.val + 2, by have := j.isLt; omega⟩ p r) % 3 =
          w9 p (hcLineOf r) % 3 := by
        have hC : ∀ j : Fin 9, ((cW9 j).val * hcBulk23 ⟨j.val + 2, by have := j.isLt; omega⟩ p r) % 3 =
            ((cW9 j).val * hcW9Line j p (hcLineOf r)) % 3 := by
          intro j; rw [hc_bulk23_w9 j]; unfold hcLiftEven; exact hc_mul_mod3_right _ _
        rw [hc_sumFin_mod3_congr _ _ hC]; dsimp only [w9]; omega
      have hM : hcSumFin (fun m : Fin 12 => (cVM m).val * hcBulk23 ⟨m.val + 11, by have := m.isLt; omega⟩ p r) % 3 =
          (hcSignOf r * vm p (hcLineOf r)) % 3 := by
        have hC : ∀ m : Fin 12, ((cVM m).val * hcBulk23 ⟨m.val + 11, by have := m.isLt; omega⟩ p r) % 3 =
            (hcSignOf r * ((cVM m).val * hcLVMLine m p (hcLineOf r))) % 3 := by
          intro m; rw [hc_bulk23_lvm m]; unfold hcLiftOdd
          rw [hc_mul_mod3_right, ← Nat.mul_assoc, Nat.mul_comm (cVM m).val (hcSignOf r), Nat.mul_assoc]
        rw [hc_sumFin_mod3_congr _ _ hC, hc_sumFin_mul_left, ← hc_mul_mod3_right]
      rw [hc_add_mod3_congr (hc_add_mod3_congr h01 hW) hM] at hz; exact hz
    intro p l
    have hr := hEq p (hcLineRep l); have ho := hEq p (hcOppRep l); have hl := hc_line_basics.1 l
    rw [hl.1, hl.2.2.1] at hr; rw [hl.2.1, hl.2.2.2.1] at ho
    have hvmLt : vm p l < 3 := Nat.mod_lt _ (by decide)
    exact ⟨by omega, by omega⟩
  have hu3z : ∀ p : Fin 2, u3 p = 0 := by
    intro p
    have s0 := (hBoth p ⟨0, by decide⟩).2; have s1 := (hBoth p ⟨1, by decide⟩).2
    have s10 := (hBoth p ⟨10, by decide⟩).2; have s11 := (hBoth p ⟨11, by decide⟩).2
    have hw := (hc_w9_linComb_zeroSum cW9 p).1
    change (w9 p ⟨0, by decide⟩ + w9 p ⟨1, by decide⟩ + w9 p ⟨10, by decide⟩ + w9 p ⟨11, by decide⟩) % 3 = 0 at hw
    have hlt : u3 p < 3 := by
      cases p with | mk pv hpv =>
      match pv, hpv with
      | 0, _ => exact (c ⟨0, by decide⟩).isLt | 1, _ => exact (c ⟨1, by decide⟩).isLt
      | _ + 2, h => exact absurd h (by omega)
    omega
  have hW0 : ∀ j : Fin 9, cW9 j = ⟨0, by decide⟩ := by
    intro j
    have hp := (hBoth (hcW9Piv j).1 (hcW9Piv j).2).2; rw [hu3z] at hp
    have hEx : hcSumFin (fun k : Fin 9 => (cW9 k).val * hcW9Line k (hcW9Piv j).1 (hcW9Piv j).2) = (cW9 j).val := by
      rw [hc_sumFin_zero_except _ j]
      · rw [hc_blocks_certs.2.1 j j, hc_ite_pos rfl, Nat.mul_one]
      · intro k hk; rw [hc_blocks_certs.2.1 k j, hc_ite_neg hk, Nat.mul_zero]
    have hlt := (cW9 j).isLt; change (0 + hcSumFin _ % 3) % 3 = 0 at hp; rw [hEx] at hp
    exact Fin.ext (by change (cW9 j).val = 0; omega)
  have hM0 : ∀ m : Fin 12, cVM m = ⟨0, by decide⟩ := by
    intro m
    have hp := (hBoth (hcLVMPiv m).1 (hcLVMPiv m).2).1
    have hEx : hcSumFin (fun k : Fin 12 => (cVM k).val * hcLVMLine k (hcLVMPiv m).1 (hcLVMPiv m).2) = (cVM m).val := by
      rw [hc_sumFin_zero_except _ m]
      · rw [hc_blocks_certs.2.2.2.1 m m, hc_ite_pos rfl, Nat.mul_one]
      · intro k hk; rw [hc_blocks_certs.2.2.2.1 k m, hc_ite_neg hk, Nat.mul_zero]
    have hlt := (cVM m).isLt; change hcSumFin _ % 3 = 0 at hp; rw [hEx] at hp
    exact Fin.ext (by change (cVM m).val = 0; omega)
  intro i
  if hi0 : i.val = 0 then have heq : i = ⟨0, by decide⟩ := Fin.ext hi0; rw [heq]; exact Fin.ext (hu3z ⟨0, by decide⟩)
  else if hi1 : i.val = 1 then have heq : i = ⟨1, by decide⟩ := Fin.ext hi1; rw [heq]; exact Fin.ext (hu3z ⟨1, by decide⟩)
  else if hi2 : i.val < 11 then
    have heq : c i = cW9 ⟨i.val - 2, by omega⟩ := congrArg c (Fin.ext (by change i.val = i.val - 2 + 2; omega)); rw [heq]; exact hW0 _
  else
    have heq : c i = cVM ⟨i.val - 11, by have := i.isLt; omega⟩ := congrArg c (Fin.ext (by change i.val = i.val - 11 + 11; omega)); rw [heq]; exact hM0 _

/-- Headline Theorem 5: Explicit `23 × 48` `[[24, 1, 8]]_3` stabilizer matrix `hcBulk23` is strictly isotropic,
    full rank `23` over `GF(3)`, with explicit weight-6 stabilizer witnesses (`d_pure ≤ 6`).
    (Scope note: the exhaustive lower bounds `d_pure ≥ 6` and `d ≥ 8`, brute-force `42,504 / 42,504`
    5-uniformity, `553,276` erasure recovery, and uniqueness across all 13 `W(F_4)` / 9 `W(F_4)^+`
    local-Clifford classes are certified externally in `test/verify/covariant-gf3-holographic-tensors.ts`.) -/
theorem thm_hc_code_24_1_8_stabilizer_valid :
    (∀ i j : Fin 23, hcSymp48 (hcBulk23 i) (hcBulk23 j) = 0) ∧
    (∀ c : Fin 23 → Fin 3, (∀ p r, hcLinComb c hcBulk23 p r = 0) → ∀ i : Fin 23, c i = ⟨0, by decide⟩) ∧
    hcPauliWeight (hcBulk23 ⟨5, by decide⟩) = 6 ∧ hcPauliWeight (hcBulk23 ⟨12, by decide⟩) = 6 :=
  ⟨hc_bulk23_iso, hc_bulk23_rank23, by decide, by decide⟩

def hcLVMCoeff (k : Fin 4) (i j : Fin 12) : Fin 3 :=
  ⟨hcActLineOdd k (hcLVMLine i) (hcLVMPiv j).1 (hcLVMPiv j).2 % 3, Nat.mod_lt _ (by decide)⟩

/-- Explicit `23 × 23` `GF(3)` transition matrix `M_k` certifying `actWF4 k (hcBulk23 i) = ∑_j M_k i j * hcBulk23 j`. -/
def hcBulkTrans (k : Fin 4) (i j : Fin 23) : Fin 3 :=
  if i.val = 0 then (if j.val = 0 then ⟨1, by decide⟩ else ⟨0, by decide⟩)
  else if i.val = 1 then
    if j.val = 0 then (if k.val = 3 then ⟨1, by decide⟩ else ⟨0, by decide⟩)
    else if j.val = 1 then (if k.val < 2 then ⟨1, by decide⟩ else ⟨2, by decide⟩) else ⟨0, by decide⟩
  else if hi : i.val < 11 then
    if j.val < 2 then ⟨0, by decide⟩
    else dite (j.val < 11) (fun hj => hcW9Coeff k ⟨i.val - 2, by omega⟩ ⟨j.val - 2, by omega⟩) (fun _ => ⟨0, by decide⟩)
  else
    dite (j.val < 11) (fun _ => ⟨0, by decide⟩)
      (fun hj => hcLVMCoeff k ⟨i.val - 11, by have := i.isLt; omega⟩ ⟨j.val - 11, by have := j.isLt; omega⟩)

private theorem hc_lvm_wf4_k0 : ∀ i : Fin 12, ∀ p : Fin 2, ∀ l : Fin 12,
    hcActLineOdd ⟨0, by decide⟩ (hcLVMLine i) p l = hcSumFin (fun j : Fin 12 => (hcLVMCoeff ⟨0, by decide⟩ i j).val * hcLVMLine j p l) % 3 := by decide
private theorem hc_lvm_wf4_k1 : ∀ i : Fin 12, ∀ p : Fin 2, ∀ l : Fin 12,
    hcActLineOdd ⟨1, by decide⟩ (hcLVMLine i) p l = hcSumFin (fun j : Fin 12 => (hcLVMCoeff ⟨1, by decide⟩ i j).val * hcLVMLine j p l) % 3 := by decide
private theorem hc_lvm_wf4_k2 : ∀ i : Fin 12, ∀ p : Fin 2, ∀ l : Fin 12,
    hcActLineOdd ⟨2, by decide⟩ (hcLVMLine i) p l = hcSumFin (fun j : Fin 12 => (hcLVMCoeff ⟨2, by decide⟩ i j).val * hcLVMLine j p l) % 3 := by decide
private theorem hc_lvm_wf4_k3 : ∀ i : Fin 12, ∀ p : Fin 2, ∀ l : Fin 12,
    hcActLineOdd ⟨3, by decide⟩ (hcLVMLine i) p l = hcSumFin (fun j : Fin 12 => (hcLVMCoeff ⟨3, by decide⟩ i j).val * hcLVMLine j p l) % 3 := by decide

private theorem hc_actWF4_liftOdd (k : Fin 4) (v : HcLineVec) (p : Fin 2) (r : Fin 24) :
    hcActWF4 k (hcLiftOdd v) p r = hcLiftOdd (hcActLineOdd k v) p r := by
  have hl := hc_line_basics.2 k r
  have hDist : ∀ c0 c1 x0 x1 s0 s1 : Nat,
      (c0 * (((s0 * s1) % 3) * x0) + c1 * (((s0 * s1) % 3) * x1)) % 3 = (s0 * (s1 * (c0 * x0 + c1 * x1))) % 3 := by
    intro c0 c1 x0 x1 s0 s1
    have ha : (c0 * (((s0 * s1) % 3) * x0)) % 3 = (s0 * (s1 * (c0 * x0))) % 3 := by
      rw [hc_mul_mod3_congr rfl (hc_mul_mod3_left _ _), ← Nat.mul_assoc, Nat.mul_comm c0 (s0 * s1), Nat.mul_assoc, Nat.mul_assoc]
    have hb : (c1 * (((s0 * s1) % 3) * x1)) % 3 = (s0 * (s1 * (c1 * x1))) % 3 := by
      rw [hc_mul_mod3_congr rfl (hc_mul_mod3_left _ _), ← Nat.mul_assoc, Nat.mul_comm c1 (s0 * s1), Nat.mul_assoc, Nat.mul_assoc]
    rw [hc_add_mod3_congr ha hb, Nat.mul_add, Nat.mul_add]
  cases p with | mk pv hpv => match pv, hpv with
  | 0, _ =>
    rw [hc_actWF4_0]; unfold hcLiftOdd
    rw [hc_actLineOdd_0, hl.1, hl.2, hc_add_mod3_congr (hc_mul_mod3_right _ _) (hc_mul_mod3_right _ _), hc_mul_mod3_right (hcSignOf r)]
    exact hDist _ _ _ _ _ _
  | 1, _ =>
    rw [hc_actWF4_1]; unfold hcLiftOdd
    rw [hc_actLineOdd_1, hl.1, hl.2, hc_add_mod3_congr (hc_mul_mod3_right _ _) (hc_mul_mod3_right _ _), hc_mul_mod3_right (hcSignOf r)]
    exact hDist _ _ _ _ _ _
  | _ + 2, h => exact absurd h (by omega)

private theorem hc_bulkTrans_block_certs :
    (∀ k : Fin 4, ∀ p : Fin 2, ∀ r : Fin 24,
      hcActWF4 k hcAllX p r = hcLinComb (hcBulkTrans k ⟨0, by decide⟩) hcBulk23 p r ∧
      hcActWF4 k hcAllZ p r = hcLinComb (hcBulkTrans k ⟨1, by decide⟩) hcBulk23 p r) ∧
    (∀ k : Fin 4, ∀ iw : Fin 9,
      (hcBulkTrans k ⟨iw.val + 2, by have := iw.isLt; omega⟩ ⟨0, by decide⟩).val = 0 ∧
      (hcBulkTrans k ⟨iw.val + 2, by have := iw.isLt; omega⟩ ⟨1, by decide⟩).val = 0 ∧
      (∀ m : Fin 12, (hcBulkTrans k ⟨iw.val + 2, by have := iw.isLt; omega⟩ ⟨m.val + 11, by have := m.isLt; omega⟩).val = 0) ∧
      (∀ j : Fin 9, (hcBulkTrans k ⟨iw.val + 2, by have := iw.isLt; omega⟩ ⟨j.val + 2, by have := j.isLt; omega⟩).val = (hcW9Coeff k iw j).val)) ∧
    (∀ k : Fin 4, ∀ im : Fin 12,
      (hcBulkTrans k ⟨im.val + 11, by have := im.isLt; omega⟩ ⟨0, by decide⟩).val = 0 ∧
      (hcBulkTrans k ⟨im.val + 11, by have := im.isLt; omega⟩ ⟨1, by decide⟩).val = 0 ∧
      (∀ j : Fin 9, (hcBulkTrans k ⟨im.val + 11, by have := im.isLt; omega⟩ ⟨j.val + 2, by have := j.isLt; omega⟩).val = 0) ∧
      (∀ m : Fin 12, (hcBulkTrans k ⟨im.val + 11, by have := im.isLt; omega⟩ ⟨m.val + 11, by have := m.isLt; omega⟩).val = (hcLVMCoeff k im m).val)) := by decide

private theorem hc_actWF4_bulk23_row (k : Fin 4) (i : Fin 23) (p : Fin 2) (r : Fin 24) :
    hcActWF4 k (hcBulk23 i) p r = hcLinComb (hcBulkTrans k i) hcBulk23 p r := by
  have hW9 : ∀ j p0 l, hcActLineEven k (hcW9Line j) p0 l = hcSumFin (fun j' : Fin 9 => (hcW9Coeff k j j').val * hcW9Line j' p0 l) % 3 := by
    cases k with | mk kv hkv => match kv, hkv with
    | 0, _ => exact hc_w9_wf4_k0 | 1, _ => exact hc_w9_wf4_k1 | 2, _ => exact hc_w9_wf4_k2
    | 3, _ => exact hc_w9_wf4_k3 | _ + 4, h => exact absurd h (by omega)
  have hLVM : ∀ m p0 l, hcActLineOdd k (hcLVMLine m) p0 l = hcSumFin (fun m' : Fin 12 => (hcLVMCoeff k m m').val * hcLVMLine m' p0 l) % 3 := by
    cases k with | mk kv hkv => match kv, hkv with
    | 0, _ => exact hc_lvm_wf4_k0 | 1, _ => exact hc_lvm_wf4_k1 | 2, _ => exact hc_lvm_wf4_k2
    | 3, _ => exact hc_lvm_wf4_k3 | _ + 4, h => exact absurd h (by omega)
  if hi0 : i.val = 0 then have hEq : i = ⟨0, by decide⟩ := Fin.ext hi0; rw [hEq]; exact (hc_bulkTrans_block_certs.1 k p r).1
  else if hi1 : i.val = 1 then have hEq : i = ⟨1, by decide⟩ := Fin.ext hi1; rw [hEq]; exact (hc_bulkTrans_block_certs.1 k p r).2
  else if hi2 : i.val < 11 then
    let iw : Fin 9 := ⟨i.val - 2, by omega⟩
    have hEq : i = ⟨iw.val + 2, by have := iw.isLt; omega⟩ := Fin.ext (by change i.val = i.val - 2 + 2; omega)
    have hB := hc_bulkTrans_block_certs.2.1 k iw
    rw [hEq, hc_bulk23_w9 iw, hc_actWF4_liftEven]; unfold hcLinComb; rw [hc_sumFin23_split]
    have hZM : hcSumFin (fun m : Fin 12 => (hcBulkTrans k ⟨iw.val + 2, by have := iw.isLt; omega⟩ ⟨m.val + 11, by have := m.isLt; omega⟩).val *
        hcBulk23 ⟨m.val + 11, by have := m.isLt; omega⟩ p r) = 0 := by
      have hF : (fun m : Fin 12 => (hcBulkTrans k ⟨iw.val + 2, by have := iw.isLt; omega⟩ ⟨m.val + 11, by have := m.isLt; omega⟩).val *
          hcBulk23 ⟨m.val + 11, by have := m.isLt; omega⟩ p r) = fun _ => 0 := by funext m; rw [hB.2.2.1 m, Nat.zero_mul]
      rw [hF, hc_sumFin_zero]
    rw [hB.1, hB.2.1, Nat.zero_mul, Nat.zero_mul, hZM, Nat.add_zero, Nat.zero_add]
    unfold hcLiftEven; rw [hW9 iw p (hcLineOf r)]
    have hC : ∀ j : Fin 9, ((hcW9Coeff k iw j).val * hcW9Line j p (hcLineOf r)) % 3 =
        ((hcBulkTrans k ⟨iw.val + 2, by have := iw.isLt; omega⟩ ⟨j.val + 2, by have := j.isLt; omega⟩).val *
          hcBulk23 ⟨j.val + 2, by have := j.isLt; omega⟩ p r) % 3 := by
      intro j; rw [hB.2.2.2 j, hc_bulk23_w9 j]; unfold hcLiftEven; exact (hc_mul_mod3_right _ _).symm
    rw [← hc_sumFin_mod3_congr _ _ hC]; omega
  else
    let im : Fin 12 := ⟨i.val - 11, by have := i.isLt; omega⟩
    have hEq : i = ⟨im.val + 11, by have := im.isLt; omega⟩ := Fin.ext (by change i.val = i.val - 11 + 11; omega)
    have hB := hc_bulkTrans_block_certs.2.2 k im
    rw [hEq, hc_bulk23_lvm im, hc_actWF4_liftOdd]; unfold hcLinComb; rw [hc_sumFin23_split]
    have hZW : hcSumFin (fun j : Fin 9 => (hcBulkTrans k ⟨im.val + 11, by have := im.isLt; omega⟩ ⟨j.val + 2, by have := j.isLt; omega⟩).val *
        hcBulk23 ⟨j.val + 2, by have := j.isLt; omega⟩ p r) = 0 := by
      have hF : (fun j : Fin 9 => (hcBulkTrans k ⟨im.val + 11, by have := im.isLt; omega⟩ ⟨j.val + 2, by have := j.isLt; omega⟩).val *
          hcBulk23 ⟨j.val + 2, by have := j.isLt; omega⟩ p r) = fun _ => 0 := by funext j; rw [hB.2.2.1 j, Nat.zero_mul]
      rw [hF, hc_sumFin_zero]
    rw [hB.1, hB.2.1, Nat.zero_mul, Nat.zero_mul, hZW, Nat.add_zero, Nat.zero_add]
    unfold hcLiftOdd; rw [hLVM im p (hcLineOf r), hc_mul_mod3_right, ← hc_sumFin_mul_left]
    apply hc_sumFin_mod3_congr; intro m; rw [hB.2.2.2 m, hc_bulk23_lvm m]; unfold hcLiftOdd
    rw [hc_mul_mod3_right, ← Nat.mul_assoc, Nat.mul_comm (hcSignOf r) (hcLVMCoeff k im m).val, Nat.mul_assoc]

private theorem hc_actWF4_congr (k : Fin 4) {u v : HcVec48} (h : ∀ p r, u p r % 3 = v p r % 3)
    (p : Fin 2) (r : Fin 24) : hcActWF4 k u p r = hcActWF4 k v p r := by
  cases p with | mk pv hpv => match pv, hpv with
  | 0, _ => rw [hc_actWF4_0, hc_actWF4_0]; exact hc_add_mod3_congr (hc_mul_mod3_congr rfl (h _ _)) (hc_mul_mod3_congr rfl (h _ _))
  | 1, _ => rw [hc_actWF4_1, hc_actWF4_1]; exact hc_add_mod3_congr (hc_mul_mod3_congr rfl (h _ _)) (hc_mul_mod3_congr rfl (h _ _))
  | _ + 2, h0 => exact absurd h0 (by omega)

private theorem hc_actWF4_linComb {m : Nat} (k : Fin 4) (c : Fin m → Fin 3) (H : Fin m → HcVec48)
    (p : Fin 2) (r : Fin 24) :
    hcActWF4 k (hcLinComb c H) p r = hcSumFin (fun i : Fin m => (c i).val * hcActWF4 k (H i) p r) % 3 := by
  have hD : ∀ a b x y z : Nat, a * (z * x) + b * (z * y) = z * (a * x + b * y) := by
    intro a b x y z; rw [Nat.mul_add, ← Nat.mul_assoc, Nat.mul_comm a z, Nat.mul_assoc,
      ← Nat.mul_assoc b z y, Nat.mul_comm b z, Nat.mul_assoc]
  cases p with | mk pv hpv => match pv, hpv with
  | 0, _ =>
    rw [hc_actWF4_0]; unfold hcLinComb
    rw [hc_add_mod3_congr (hc_mul_mod3_right _ _) (hc_mul_mod3_right _ _),
        ← hc_sumFin_mul_left, ← hc_sumFin_mul_left, ← hc_sumFin_add]
    apply hc_sumFin_mod3_congr; intro i; rw [hc_actWF4_0, hc_mul_mod3_right, hD]
  | 1, _ =>
    rw [hc_actWF4_1]; unfold hcLinComb
    rw [hc_add_mod3_congr (hc_mul_mod3_right _ _) (hc_mul_mod3_right _ _),
        ← hc_sumFin_mul_left, ← hc_sumFin_mul_left, ← hc_sumFin_add]
    apply hc_sumFin_mod3_congr; intro i; rw [hc_actWF4_1, hc_mul_mod3_right, hD]
  | _ + 2, h0 => exact absurd h0 (by omega)

private theorem hc_actWord_preserves_span {m : Nat} (H : Fin m → HcVec48) (T : Fin 4 → Fin m → Fin m → Fin 3)
    (hGen : ∀ k : Fin 4, ∀ i : Fin m, ∀ p r, hcActWF4 k (H i) p r = hcLinComb (T k i) H p r) :
    ∀ w : List (Fin 4), ∀ v : HcVec48, hcInSpan H v → hcInSpan H (hcActWord w v) := by
  intro w; induction w with
  | nil => intro v hv; exact hv
  | cons k rest ih =>
    intro v hv; rcases ih v hv with ⟨c, hc⟩
    refine ⟨fun j => ⟨hcSumFin (fun i : Fin m => (c i).val * (T k i j).val) % 3, Nat.mod_lt _ (by decide)⟩, ?_⟩
    intro p r; change hcActWF4 k (hcActWord rest v) p r % 3 = _
    have hLt : hcActWF4 k (hcActWord rest v) p r % 3 = hcActWF4 k (hcActWord rest v) p r := by
      cases p with | mk pv hpv => match pv, hpv with
      | 0, _ => rw [hc_actWF4_0]; omega
      | 1, _ => rw [hc_actWF4_1]; omega
      | _ + 2, h0 => exact absurd h0 (by omega)
    rw [hLt, hc_actWF4_congr k (v := hcLinComb c H) (fun p0 r0 => by rw [hc p0 r0]; unfold hcLinComb; omega), hc_actWF4_linComb]
    have hSub : ∀ i : Fin m, ((c i).val * hcActWF4 k (H i) p r) % 3 =
        hcSumFin (fun j : Fin m => (c i).val * ((T k i j).val * H j p r)) % 3 := by
      intro i; rw [hGen k i p r]; unfold hcLinComb; rw [hc_mul_mod3_right, ← hc_sumFin_mul_left]
    rw [hc_sumFin_mod3_congr _ _ hSub, hc_sumFin_swap]; unfold hcLinComb
    apply hc_sumFin_mod3_congr; intro j; dsimp only; rw [hc_mul_mod3_left, ← hc_sumFin_mul_right]
    have hF : (fun i : Fin m => (c i).val * ((T k i j).val * H j p r)) =
        (fun i : Fin m => (c i).val * (T k i j).val * H j p r) := by funext i; exact (Nat.mul_assoc _ _ _).symm
    rw [hF]

/-- Headline Theorem 6: Full order-1,152 `W(F_4)` covariance of `[[24, 1, 8]]_3`:
    ALL 4 Bourbaki `W(F_4)` generators preserve `rowSpan hcBulk23` via the explicit `23 × 23`
    transition matrix `hcBulkTrans`, and EVERY `W(F_4)` word preserves `rowSpan hcBulk23`. -/
theorem thm_hc_code_24_1_8_wf4_covariant :
    (∀ k : Fin 4, ∀ i : Fin 23, ∀ p r, hcActWF4 k (hcBulk23 i) p r = hcLinComb (hcBulkTrans k i) hcBulk23 p r) ∧
    (∀ w : List (Fin 4), ∀ v : HcVec48, hcInSpan hcBulk23 v → hcInSpan hcBulk23 (hcActWord w v)) :=
  ⟨hc_actWF4_bulk23_row, hc_actWord_preserves_span hcBulk23 hcBulkTrans hc_actWF4_bulk23_row⟩

private theorem hc_bulk_logical_certs :
    (∀ i : Fin 23, hcSymp48 (hcBulk23 i) hcXLFrame = 0 ∧ hcSymp48 (hcBulk23 i) hcZLFrame = 0 ∧
      hcSymp48 (hcBulk23 i) hcXLWt8 = 0 ∧ hcSymp48 (hcBulk23 i) hcZLWt8 = 0) ∧
    hcSymp48 hcXLFrame hcZLFrame = 1 ∧ hcSymp48 hcXLWt8 hcZLWt8 = 1 ∧
    hcPauliWeight hcXLWt8 = 8 ∧ hcPauliWeight hcZLWt8 = 8 ∧
    (∀ p r, hcXLWt8 p r = (hcXLFrame p r + hcBulk23 ⟨11, by decide⟩ p r + hcBulk23 ⟨12, by decide⟩ p r +
      2 * hcBulk23 ⟨13, by decide⟩ p r + 2 * hcBulk23 ⟨14, by decide⟩ p r + hcBulk23 ⟨18, by decide⟩ p r) % 3) ∧
    (∀ p r, hcZLWt8 p r = (hcZLFrame p r + hcBulk23 ⟨8, by decide⟩ p r + 2 * hcBulk23 ⟨9, by decide⟩ p r) % 3) := by decide

/-- Headline Theorem 7: Bulk logical qutrit of `[[24, 1, 8]]_3` on the 3-frame triality mode `1_{F_0} - 1_{F_1}`:
    `X_L(frame), Z_L(frame)` and stabilizer-equivalent weight-8 representatives `X_L^(8), Z_L^(8)` commute with
    all 23 stabilizers, obey `⟨X_L, Z_L⟩_ω = 1`, have Pauli weight `8` (`d ≤ 8`), and lie strictly outside
    `rowSpan hcBulk23` (`∈ S^⊥ \ S`).
    (Scope note: the exhaustive lower bound `d ≥ 8` and `553,276` boundary erasure recovery for `|E| ≤ 7` are
    verified externally in `test/verify/covariant-gf3-holographic-tensors.ts`.) -/
theorem thm_hc_code_24_1_8_triality_bulk_logical :
    (∀ i : Fin 23, hcSymp48 (hcBulk23 i) hcXLFrame = 0 ∧ hcSymp48 (hcBulk23 i) hcZLFrame = 0 ∧
      hcSymp48 (hcBulk23 i) hcXLWt8 = 0 ∧ hcSymp48 (hcBulk23 i) hcZLWt8 = 0) ∧
    hcSymp48 hcXLFrame hcZLFrame = 1 ∧ hcSymp48 hcXLWt8 hcZLWt8 = 1 ∧
    hcPauliWeight hcXLWt8 = 8 ∧ hcPauliWeight hcZLWt8 = 8 ∧
    (∀ p r, hcXLWt8 p r = (hcXLFrame p r + hcBulk23 ⟨11, by decide⟩ p r + hcBulk23 ⟨12, by decide⟩ p r +
      2 * hcBulk23 ⟨13, by decide⟩ p r + 2 * hcBulk23 ⟨14, by decide⟩ p r + hcBulk23 ⟨18, by decide⟩ p r) % 3) ∧
    (∀ p r, hcZLWt8 p r = (hcZLFrame p r + hcBulk23 ⟨8, by decide⟩ p r + 2 * hcBulk23 ⟨9, by decide⟩ p r) % 3) ∧
    ¬ hcInSpan hcBulk23 hcXLFrame ∧ ¬ hcInSpan hcBulk23 hcZLFrame ∧
    ¬ hcInSpan hcBulk23 hcXLWt8 ∧ ¬ hcInSpan hcBulk23 hcZLWt8 := by
  have hZLXL : hcSymp48 hcZLFrame hcXLFrame = 2 := by rw [hc_symp48_skew, hc_bulk_logical_certs.2.1]
  have hZ8X8 : hcSymp48 hcZLWt8 hcXLWt8 = 2 := by rw [hc_symp48_skew, hc_bulk_logical_certs.2.2.1]
  refine ⟨hc_bulk_logical_certs.1, hc_bulk_logical_certs.2.1, hc_bulk_logical_certs.2.2.1,
    hc_bulk_logical_certs.2.2.2.1, hc_bulk_logical_certs.2.2.2.2.1,
    hc_bulk_logical_certs.2.2.2.2.2.1, hc_bulk_logical_certs.2.2.2.2.2.2,
    hc_not_inSpan_of_symp_ne_zero hcBulk23 hcXLFrame hcZLFrame (fun i => (hc_bulk_logical_certs.1 i).2.1)
      (by rw [hc_bulk_logical_certs.2.1]; decide),
    hc_not_inSpan_of_symp_ne_zero hcBulk23 hcZLFrame hcXLFrame (fun i => (hc_bulk_logical_certs.1 i).1)
      (by rw [hZLXL]; decide),
    hc_not_inSpan_of_symp_ne_zero hcBulk23 hcXLWt8 hcZLWt8 (fun i => (hc_bulk_logical_certs.1 i).2.2.2)
      (by rw [hc_bulk_logical_certs.2.2.1]; decide),
    hc_not_inSpan_of_symp_ne_zero hcBulk23 hcZLWt8 hcXLWt8 (fun i => (hc_bulk_logical_certs.1 i).2.2.1)
      (by rw [hZ8X8]; decide)⟩


/-! ## Section 5: Pure `[[24, 0, 6]]_3` `W(F_4)` Lagrangian & Native `D_4` Classical/CSS Obstruction -/

/-- Explicit `24 × 48` pure `[[24, 0, 6]]_3` `W(F_4)`-covariant Lagrangian `hcPure24 = hcBulk23 ⊕ ⟨X_L(frame)⟩`. -/
def hcPure24 (i : Fin 24) : HcVec48 :=
  dite (i.val < 23) (fun h => hcBulk23 ⟨i.val, h⟩) (fun _ => hcXLFrame)

/-- Explicit `24 × 24` transition matrix for `hcPure24` under all 4 Bourbaki `W(F_4)` generators. -/
def hcPureTrans (k : Fin 4) (i j : Fin 24) : Fin 3 :=
  dite (i.val < 23)
    (fun hi => dite (j.val < 23) (fun hj => hcBulkTrans k ⟨i.val, hi⟩ ⟨j.val, hj⟩) (fun _ => ⟨0, by decide⟩))
    (fun _ =>
      if j.val = 0 then (if k.val = 1 then ⟨2, by decide⟩ else ⟨0, by decide⟩)
      else if j.val = 23 then (if k.val < 2 then ⟨2, by decide⟩ else ⟨1, by decide⟩) else ⟨0, by decide⟩)

private theorem hc_pure24_iso (i j : Fin 24) : hcSymp48 (hcPure24 i) (hcPure24 j) = 0 := by
  unfold hcPure24
  by_cases hi : i.val < 23
  · rw [hc_dite_pos hi]; by_cases hj : j.val < 23
    · rw [hc_dite_pos hj]; exact hc_bulk23_iso _ _
    · rw [hc_dite_neg hj]; exact (hc_bulk_logical_certs.1 _).1
  · rw [hc_dite_neg hi]; by_cases hj : j.val < 23
    · rw [hc_dite_pos hj, hc_symp48_skew, (hc_bulk_logical_certs.1 _).1]
    · rw [hc_dite_neg hj]; exact hc_symp48_self _

private theorem hc_pure24_rank24 (c : Fin 24 → Fin 3)
    (hZero : ∀ p r, hcLinComb c hcPure24 p r = 0) : ∀ i : Fin 24, c i = ⟨0, by decide⟩ := by
  have h23z : c ⟨23, by decide⟩ = ⟨0, by decide⟩ := by
    have hZ0 : hcSymp48 (hcLinComb c hcPure24) hcZLFrame = 0 := by
      have h0 : hcSymp48 (fun _ _ => 0) hcZLFrame = 0 := by decide
      rw [← h0]; exact hc_symp48_congr_left hcZLFrame (fun p r => by rw [hZero p r])
    rw [hc_symp48_linComb_eval, hc_sumFin_zero_except _ ⟨23, by decide⟩] at hZ0
    · have h1 : hcSymp48 (hcPure24 ⟨23, by decide⟩) hcZLFrame = 1 := by
        unfold hcPure24; rw [hc_dite_neg (by decide)]; exact hc_bulk_logical_certs.2.1
      rw [h1, Nat.mul_one] at hZ0; have := (c ⟨23, by decide⟩).isLt
      exact Fin.ext (by change (c ⟨23, by decide⟩).val = 0; omega)
    · intro i hi; have hlt : i.val < 23 := by have := i.isLt; have hne : i.val ≠ 23 := fun h => hi (Fin.ext h); omega
      unfold hcPure24; rw [hc_dite_pos hlt, (hc_bulk_logical_certs.1 ⟨i.val, hlt⟩).2.1, Nat.mul_zero]
  have hSub : ∀ p r, hcLinComb (fun i : Fin 23 => c ⟨i.val, by have := i.isLt; omega⟩) hcBulk23 p r = 0 := by
    intro p r; have hz := hZero p r; unfold hcLinComb at hz ⊢
    change (hcSumFinAux 23 (by decide) (fun i : Fin 24 => (c i).val * hcPure24 i p r) +
      (c ⟨23, by decide⟩).val * hcPure24 ⟨23, by decide⟩ p r) % 3 = 0 at hz
    have h23v : (c ⟨23, by decide⟩).val = 0 := congrArg Fin.val h23z
    rw [h23v, Nat.zero_mul, Nat.add_zero] at hz
    have hAux : ∀ (k : Nat) (hk : k ≤ 23),
        hcSumFinAux k (by omega) (fun i : Fin 24 => (c i).val * hcPure24 i p r) =
        hcSumFinAux k hk (fun i : Fin 23 => (c ⟨i.val, by have := i.isLt; omega⟩).val * hcBulk23 i p r) := by
      intro k hk; induction k with
      | zero => rfl
      | succ m ih =>
        simp only [hcSumFinAux]; rw [ih (Nat.le_of_succ_le hk)]
        unfold hcPure24; have hm : m < 23 := hk; rw [hc_dite_pos hm]
    unfold hcSumFin; rw [← hAux 23 (Nat.le_refl 23)]; exact hz
  have h23 := hc_bulk23_rank23 _ hSub
  intro i
  if hi : i.val < 23 then exact h23 ⟨i.val, hi⟩
  else have hEq : i = ⟨23, by decide⟩ := Fin.ext (by change i.val = 23; have := i.isLt; omega); rw [hEq]; exact h23z

private theorem hc_actWF4_pure24_row (k : Fin 4) (i : Fin 24) (p : Fin 2) (r : Fin 24) :
    hcActWF4 k (hcPure24 i) p r = hcLinComb (hcPureTrans k i) hcPure24 p r := by
  if hi : i.val < 23 then
    unfold hcPure24; rw [hc_dite_pos hi, hc_actWF4_bulk23_row k ⟨i.val, hi⟩ p r]; unfold hcLinComb
    change _ = (hcSumFinAux 23 (by decide) (fun j : Fin 24 => (hcPureTrans k i j).val * hcPure24 j p r) +
      (hcPureTrans k i ⟨23, by decide⟩).val * hcPure24 ⟨23, by decide⟩ p r) % 3
    have ht23 : (hcPureTrans k i ⟨23, by decide⟩).val = 0 := by
      unfold hcPureTrans; rw [hc_dite_pos hi, hc_dite_neg (by decide)]
    rw [ht23, Nat.zero_mul, Nat.add_zero]
    have hAux : ∀ (m : Nat) (hm : m ≤ 23),
        hcSumFinAux m hm (fun j : Fin 23 => (hcBulkTrans k ⟨i.val, hi⟩ j).val * hcBulk23 j p r) =
        hcSumFinAux m (by omega) (fun j : Fin 24 => (hcPureTrans k i j).val * hcPure24 j p r) := by
      intro m hm; induction m with
      | zero => rfl
      | succ s ih =>
        simp only [hcSumFinAux]; rw [ih (Nat.le_of_succ_le hm)]
        unfold hcPureTrans hcPure24; have hs : s < 23 := hm; rw [hc_dite_pos hi, hc_dite_pos hs, hc_dite_pos hs]
    unfold hcSumFin; exact congrArg (fun x => x % 3) (hAux 23 (Nat.le_refl 23))
  else
    have hEq : i = ⟨23, by decide⟩ := Fin.ext (by change i.val = 23; have := i.isLt; omega); rw [hEq]
    have h23 : ∀ k0 p0 r0, hcActWF4 k0 (hcPure24 ⟨23, by decide⟩) p0 r0 =
        hcLinComb (hcPureTrans k0 ⟨23, by decide⟩) hcPure24 p0 r0 := by decide
    exact h23 k p r

/-- Headline Theorem 8: Explicit `24 × 48` pure `[[24, 0, 6]]_3` `W(F_4)`-covariant Lagrangian
    `hcPure24 = hcBulk23 ⊕ ⟨X_L(frame)⟩` is strictly isotropic, full rank `24` (maximal Lagrangian),
    invariant under ALL 4 Bourbaki `W(F_4)` generators and EVERY `W(F_4)` word, with explicit weight-6
    stabilizer witness (`d ≤ 6`).
    (Scope note: the exhaustive lower bound `d ≥ 6`, brute-force `42,504 / 42,504` 5-uniformity, and global
    optimality across all 13 `W(F_4)` / 9 `W(F_4)^+` local-Clifford classes are certified externally in
    `test/verify/covariant-gf3-holographic-tensors.ts`.) -/
theorem thm_hc_code_24_0_6_lagrangian_wf4_covariant :
    (∀ i j : Fin 24, hcSymp48 (hcPure24 i) (hcPure24 j) = 0) ∧
    (∀ c : Fin 24 → Fin 3, (∀ p r, hcLinComb c hcPure24 p r = 0) → ∀ i : Fin 24, c i = ⟨0, by decide⟩) ∧
    (∀ k : Fin 4, ∀ i : Fin 24, ∀ p r, hcActWF4 k (hcPure24 i) p r = hcLinComb (hcPureTrans k i) hcPure24 p r) ∧
    (∀ w : List (Fin 4), ∀ v : HcVec48, hcInSpan hcPure24 v → hcInSpan hcPure24 (hcActWord w v)) ∧
    hcPauliWeight (hcPure24 ⟨5, by decide⟩) = 6 :=
  ⟨hc_pure24_iso, hc_pure24_rank24, hc_actWF4_pure24_row,
    hc_actWord_preserves_span hcPure24 hcPureTrans hc_actWF4_pure24_row, by decide⟩

/-- Native `5 × 24` `D_4` extension `R_5 = R_4 + span(1)` and dual-distance witnesses (`hcR4`, `hcDot24` above). -/
def hcR5 (i : Fin 5) (r : Fin 24) : Nat :=
  match i.val with
  | 0 => hcR4 ⟨0, by decide⟩ r | 1 => hcR4 ⟨1, by decide⟩ r
  | 2 => hcR4 ⟨2, by decide⟩ r | 3 => hcR4 ⟨3, by decide⟩ r | _ => 1

def hcHamming24 (v : Fin 24 → Nat) : Nat := hcSumFin (fun r : Fin 24 => if v r % 3 = 0 then 0 else 1)
def hcDualWt2 (r : Fin 24) : Nat := if r.val = 0 ∨ r.val = 3 then 1 else 0
def hcDualWt3 (r : Fin 24) : Nat := if r.val = 0 ∨ r.val = 6 ∨ r.val = 15 then 1 else 0

private theorem hc_dualWt2_not_in_r4 (c : Fin 4 → Fin 3) :
    ∃ r : Fin 24, hcSumFin (fun i : Fin 4 => (c i).val * hcR4 i r) % 3 ≠ hcDualWt2 r := by
  if h0 : hcSumFin (fun i : Fin 4 => (c i).val * hcR4 i ⟨0, by decide⟩) % 3 = hcDualWt2 ⟨0, by decide⟩ then
    refine ⟨⟨3, by decide⟩, ?_⟩
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 1 +
      (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 0) % 3 = 1 at h0
    change (0 + (c ⟨0, by decide⟩).val * 2 + (c ⟨1, by decide⟩).val * 2 +
      (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 0) % 3 ≠ 1
    omega
  else exact ⟨⟨0, by decide⟩, h0⟩

private theorem hc_dualWt3_not_in_r5 (c : Fin 5 → Fin 3) :
    ∃ r : Fin 24, hcSumFin (fun i : Fin 5 => (c i).val * hcR5 i r) % 3 ≠ hcDualWt3 r := by
  if h0 : hcSumFin (fun i : Fin 5 => (c i).val * hcR5 i ⟨0, by decide⟩) % 3 = hcDualWt3 ⟨0, by decide⟩ then
    if h1 : hcSumFin (fun i : Fin 5 => (c i).val * hcR5 i ⟨1, by decide⟩) % 3 = hcDualWt3 ⟨1, by decide⟩ then
      if h2 : hcSumFin (fun i : Fin 5 => (c i).val * hcR5 i ⟨2, by decide⟩) % 3 = hcDualWt3 ⟨2, by decide⟩ then
        refine ⟨⟨3, by decide⟩, ?_⟩
        change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 1 + (c ⟨2, by decide⟩).val * 0 +
          (c ⟨3, by decide⟩).val * 0 + (c ⟨4, by decide⟩).val * 1) % 3 = 1 at h0
        change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 2 + (c ⟨2, by decide⟩).val * 0 +
          (c ⟨3, by decide⟩).val * 0 + (c ⟨4, by decide⟩).val * 1) % 3 = 0 at h1
        change (0 + (c ⟨0, by decide⟩).val * 2 + (c ⟨1, by decide⟩).val * 1 + (c ⟨2, by decide⟩).val * 0 +
          (c ⟨3, by decide⟩).val * 0 + (c ⟨4, by decide⟩).val * 1) % 3 = 0 at h2
        change (0 + (c ⟨0, by decide⟩).val * 2 + (c ⟨1, by decide⟩).val * 2 + (c ⟨2, by decide⟩).val * 0 +
          (c ⟨3, by decide⟩).val * 0 + (c ⟨4, by decide⟩).val * 1) % 3 ≠ 0
        omega
      else exact ⟨⟨2, by decide⟩, h2⟩
    else exact ⟨⟨1, by decide⟩, h1⟩
  else exact ⟨⟨0, by decide⟩, h0⟩

private theorem hc_r4_r5_ranks :
    (∀ c : Fin 4 → Fin 3, (∀ r : Fin 24, hcSumFin (fun i : Fin 4 => (c i).val * hcR4 i r) % 3 = 0) →
      ∀ i : Fin 4, c i = ⟨0, by decide⟩) ∧
    (∀ c : Fin 5 → Fin 3, (∀ r : Fin 24, hcSumFin (fun i : Fin 5 => (c i).val * hcR5 i r) % 3 = 0) →
      ∀ i : Fin 5, c i = ⟨0, by decide⟩) := by
  refine ⟨?_, ?_⟩
  · intro c h
    have h0 := h ⟨0, by decide⟩; have h1 := h ⟨1, by decide⟩; have h4 := h ⟨4, by decide⟩; have h8 := h ⟨8, by decide⟩
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 1 + (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 0) % 3 = 0 at h0
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 2 + (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 0) % 3 = 0 at h1
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 0 + (c ⟨2, by decide⟩).val * 1 + (c ⟨3, by decide⟩).val * 0) % 3 = 0 at h4
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 0 + (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 1) % 3 = 0 at h8
    have := (c ⟨0, by decide⟩).isLt; have := (c ⟨1, by decide⟩).isLt
    have := (c ⟨2, by decide⟩).isLt; have := (c ⟨3, by decide⟩).isLt
    intro i; cases i with | mk iv hiv => match iv, hiv with
    | 0, _ | 1, _ | 2, _ | 3, _ => exact Fin.ext (by dsimp only; omega)
    | _ + 4, h => exact absurd h (by omega)
  · intro c h
    have h0 := h ⟨0, by decide⟩; have h1 := h ⟨1, by decide⟩; have h2 := h ⟨2, by decide⟩
    have h4 := h ⟨4, by decide⟩; have h8 := h ⟨8, by decide⟩
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 1 + (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 0 + (c ⟨4, by decide⟩).val * 1) % 3 = 0 at h0
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 2 + (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 0 + (c ⟨4, by decide⟩).val * 1) % 3 = 0 at h1
    change (0 + (c ⟨0, by decide⟩).val * 2 + (c ⟨1, by decide⟩).val * 1 + (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 0 + (c ⟨4, by decide⟩).val * 1) % 3 = 0 at h2
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 0 + (c ⟨2, by decide⟩).val * 1 + (c ⟨3, by decide⟩).val * 0 + (c ⟨4, by decide⟩).val * 1) % 3 = 0 at h4
    change (0 + (c ⟨0, by decide⟩).val * 1 + (c ⟨1, by decide⟩).val * 0 + (c ⟨2, by decide⟩).val * 0 + (c ⟨3, by decide⟩).val * 1 + (c ⟨4, by decide⟩).val * 1) % 3 = 0 at h8
    have := (c ⟨0, by decide⟩).isLt; have := (c ⟨1, by decide⟩).isLt; have := (c ⟨2, by decide⟩).isLt
    have := (c ⟨3, by decide⟩).isLt; have := (c ⟨4, by decide⟩).isLt
    intro i; cases i with | mk iv hiv => match iv, hiv with
    | 0, _ | 1, _ | 2, _ | 3, _ | 4, _ => exact Fin.ext (by dsimp only; omega)
    | _ + 5, h => exact absurd h (by omega)

/-- Headline Theorem 9: Exact native `D_4` classical/CSS obstruction for `R_4` (`4 × 24`) and
    `R_5 = R_4 + span(1)` (`5 × 24`): both are self-orthogonal mod 3 of full ranks `4` and `5`,
    with exact non-degenerate dual distances `d_⊥(R_4) = 2` (antipodal pair `e_0 + e_3 ∈ R_4^⊥ \ R_4`)
    and `d_⊥(R_5) = 3` (zero-sum `A_2` triple `e_0 + e_6 + e_15 ∈ R_5^⊥ \ R_5`).
    (Scope note: the complete 32-submodule CSS ceiling `d ≤ 3` is certified externally in
    `test/verify/covariant-gf3-holographic-tensors.ts` T2; untwisted non-CSS symplectic codes
    already surpass `d ≤ 3` to reach `d = 4` (`k = 0`) and `d = 6` (`k = 1`) in T3, whereas
    `S_3`-triality local-Clifford covariance is strictly required to surpass `d = 4`/`6` to `d = 6`/`8` in T4.) -/
theorem thm_hc_native_d4_css_obstruction :
    (∀ i j : Fin 4, hcDot24 (hcR4 i) (hcR4 j) = 0) ∧
    (∀ i j : Fin 5, hcDot24 (hcR5 i) (hcR5 j) = 0) ∧
    (∀ c : Fin 4 → Fin 3, (∀ r : Fin 24, hcSumFin (fun i : Fin 4 => (c i).val * hcR4 i r) % 3 = 0) →
      ∀ i : Fin 4, c i = ⟨0, by decide⟩) ∧
    (∀ c : Fin 5 → Fin 3, (∀ r : Fin 24, hcSumFin (fun i : Fin 5 => (c i).val * hcR5 i r) % 3 = 0) →
      ∀ i : Fin 5, c i = ⟨0, by decide⟩) ∧
    hcHamming24 hcDualWt2 = 2 ∧ (∀ i : Fin 4, hcDot24 (hcR4 i) hcDualWt2 = 0) ∧
    (∀ a : Fin 24, ∃ i : Fin 4, hcR4 i a ≠ 0) ∧
    (∀ c : Fin 4 → Fin 3, ∃ r : Fin 24, hcSumFin (fun i : Fin 4 => (c i).val * hcR4 i r) % 3 ≠ hcDualWt2 r) ∧
    hcHamming24 hcDualWt3 = 3 ∧ (∀ i : Fin 5, hcDot24 (hcR5 i) hcDualWt3 = 0) ∧
    (∀ a b : Fin 24, a ≠ b → ∀ s : Fin 2, ∃ i : Fin 5, (hcR5 i a + (s.val + 1) * hcR5 i b) % 3 ≠ 0) ∧
    (∀ c : Fin 5 → Fin 3, ∃ r : Fin 24, hcSumFin (fun i : Fin 5 => (c i).val * hcR5 i r) % 3 ≠ hcDualWt3 r) :=
  ⟨by decide, by decide, hc_r4_r5_ranks.1, hc_r4_r5_ranks.2,
    by decide, by decide, by decide, hc_dualWt2_not_in_r4,
    by decide, by decide, by decide, hc_dualWt3_not_in_r5⟩

end Vibe
