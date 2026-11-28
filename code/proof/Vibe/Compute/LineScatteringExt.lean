import Vibe.LineScattering
import Vibe.UniversalityObstructions

/-!
# Bare U on one mesh line, continued: `det(left)`, the rapidity identities, the bridge to the 2-to-1 law, door B

Item `vibe-computation-models-0075` (lean-track L13: claims A12 and A33). It builds on `Vibe.LineScattering`
(item 0055) and cites `Vibe.UniversalityObstructions`; neither is edited. As there, every identity is over any
commutative ring holding `ω` (`ω² + ω + 1 = 0`), `i` (`i² = -1`) and a half `h` (`2 h = 1`), so it holds in the
complex numbers at every momentum; a statement that needs to cancel a factor is stated over a `Lean.Grind.Field`.
A mode is `a = e^{ip}`, `ab = 1 / a`, `μ = e^{iW}` on the genus-1 curve `2 μ² - (a + ab) μ + 2 = 0`, worked in its
coordinate ring (`μ` is a unit there, `μ⁻¹ = (a + ab) / 2 - μ`).

**A12, `det(left)`** (q-ladder Q3b symbolic, its open limit). The defining equation `left S = right` of
line-scattering.ts has `left = leftI I + leftP P` on span `{I, P}`, so `det(left) = leftI² - leftP²`.

- `thm_lsx_det_left_factor`: `det(left) = -ω² (vf (1 + ω) h)² · S_ch · A_ch` with the channel factors
  `A_ch = g₁ + μ₁ μ₂ a₁ ab₂ g₂`, `S_ch = ω g₁ - μ₁ μ₂ a₁ ab₂ g₂`, `g = 2 μ a - 1`: its zero set on the curve is exactly
  where one channel factor vanishes.
- `thm_lsx_det_left_nonzero_point`: at the two modes of momentum `π/2` in the two bands (`a = i`, `μ = ±i`), both on
  the curve, `det(left) · u = 63` for an explicit `u`. So `det(left)` is not identically zero on the curve in any ring
  where `63 ≠ 0` (the complex numbers).
- `thm_lsx_s_unique`, `thm_lsx_s_unique_field`: every solution `S` of `left S = right` satisfies
  `det(left) · ((W + i D) S - (W P - i D)) = 0`; over a field, wherever `det(left) ≠ 0`, `S` is Yang's closed form.

**A12, the rapidity identities** (Q3c point 2, proved there by hand). With `J(x) = x - x⁻¹` (`2 i Im x` on the unit
circle):

- `thm_lsx_im_product`: `4 J(λ) J(ζ₆ λ) = -(a - ab)²`, i.e. `4 Im(λ) Im(ζ₆ λ) = -Im(a)²`.
- `thm_lsx_rapidity_square`: `3 rapNum² J(ζ₆ λ) + rapDen² J(λ) = 0`, i.e. `θ² = -Im(λ) / (3 Im(ζ₆ λ))`.
- `thm_lsx_rapidity_square_injective`: `3 J(ζ₆λ₁) J(ζ₆λ₂) λ₁ λ₂ (N₁² D₂² - N₂² D₁²) = -D₁² D₂² (1 + 2ω)(λ₁² - λ₂²)`:
  `θ²` is a Möbius function of `λ²`, so `θ₁² = θ₂²` iff `λ₁² = λ₂²`.
- `thm_lsx_rapidity_nonzero`: `θ` is never 0 on a moving mode (`rapNum = 0` forces `(a - ab)² = 0`).
- `thm_lsx_equal_rapidity_iff`: over a field (`3 ≠ 0`), for moving modes (`a ≠ ab`),
  `θ₁ = θ₂ ↔ (a₂, μ₂) = ±(a₁, μ₁)`: coincident rapidities are one mode up to the parity sign.

**The rapidity bridge** (lean-track section 3). make's `thm_univ_dispersion_floor_and_rapidity_nogo` states the law
`v(u₁) = v(u₂) ↔ u₁ = u₂ ∨ 3 u₁ u₂ = 1` for `v(u) = u / (3u² + 1)`, over the integers in cleared form. Here the
velocity of a mode is `v = -sin p / (2 sin W) = velNum / velDen`, and:

- `thm_lsx_velocity_rapidity`: `v = -√3 θ / (1 + 3 θ²)` on the curve (cleared), so make's `u` IS our `θ` and make's
  `v` is `-v / √3`. The two parametrizations agree; they differ only by that constant factor.
- `thm_lsx_two_to_one_factor`: the cleared law factors, `x₁ y₁ (3x₂² + y₂²) - x₂ y₂ (3x₁² + y₁²) =
  (x₁ y₂ - x₂ y₁)(y₁ y₂ - 3 x₁ x₂)`, over any commutative ring.
- `thm_lsx_rapidity_bridge`: for two modes, the velocity difference is `-√3 velDen₁ velDen₂` times make's cleared
  expression at `(u₁, u₂) = (θ₁, θ₂)`, and make's integer law is the integer instance of the factorization.
- `thm_lsx_equal_velocity_iff`: over a field, two moving modes have equal velocity iff `θ₁ = θ₂ ∨ 3 θ₁ θ₂ = 1`.

**A33, door B** (decision 007, Q3c door B, P50, E-CMP-0054):

- `thm_lsx_doorb_orientations`: the like pair beside an opposite tone misses Yang-Baxter by `∓x y (x + y)(I + P)` on
  both orientations `(+, +, -)` and `(-, +, +)`; role-antisymmetric inputs never diffract.
- `thm_lsx_doorb_symmetric_diffracts`: over a field, a symmetric nonzero input is clean iff `x y (x + y) = 0`.
- `thm_lsx_doorb_mismatch_denominator`: `|(x + i)(y + i)(x + y + i)|² = (x² + 1)(y² + 1)((x + y)² + 1)` for real
  rapidities (conjugation `i ↦ -i`).
- `thm_lsx_doorb_coincidence`: one mode twice in contact: `λ² = ω μ²`; `λ² = ω²` forces `sin p = 0`, `λ² = -ω` forces
  `cos p = 0`, and there `3 θ² = 1` and `4 v² = 1`.

Limits. As in `Vibe.LineScattering`, the coin and contact constants are taken as given (E-CMP-0049 ties them to bare
U), and the velocity `-sin p / (2 sin W)` is the group velocity `-dW/dp`, which E-CMP-0045 checks equal to the current
`(|v_f|² - |v_b|²) / (|v_f|² + |v_b|²)` at the samples; the current identity itself is not proven here. Conjugation
is not modelled: `J(x) = x - x⁻¹` is `2 i Im x` only on the unit circle, which a ring cannot express.

Core Lean only: `grind`'s commutative-ring solver, no `sorry`, no `axiom`, no `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace LineScatteringExt

open Lean.Grind
open Vibe.LineScattering

section Ring

variable {α : Type} [CommRing α]

/-! ### Units on the curve -/

/-- `μ⁻¹` on the curve: `(a + ab) / 2 - μ`. -/
def muBar (h a ab μ : α) : α := h * (a + ab) - μ

-- [helper]
theorem fact_mu_unit (h a ab μ : α) (hh : 2 * h = 1) (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0) :
    μ * muBar h a ab μ = 1 := by
  simp only [muBar]
  grind

-- [helper]
theorem fact_mu_sum (h a ab μ : α) (hh : 2 * h = 1) :
    2 * (μ + muBar h a ab μ) = a + ab := by
  simp only [muBar]
  grind

/-! ### A12: `det(left)` -/

/-- The `I` component of `left` (like-tone block). -/
def leftI (ω i h a1 ab1 m1 a2 ab2 m2 : α) : α := leftOf ω h a1 ab1 m1 a2 ab2 m2 (contactKeep ω i h)
/-- The `P` component of `left`. -/
def leftP (ω h a1 m1 : α) : α := vf ω h * vb ω h a1 m1 * contactSwap h
/-- The `I` component of `right`. -/
def rightI (ω i h a1 ab1 m1 a2 ab2 m2 : α) : α := rightOf ω h a1 ab1 m1 a2 ab2 m2 (contactKeep ω i h)
/-- The `P` component of `right`. -/
def rightP (ω h a2 m2 : α) : α := -(vf ω h * vb ω h a2 m2 * contactSwap h)

/-- `det(left)` on span `{I, P}`: the matrix of `leftI I + leftP P` on the two words is `[[leftI, leftP], [leftP, leftI]]`. -/
def detLeft (ω i h a1 ab1 m1 a2 ab2 m2 : α) : α :=
  leftI ω i h a1 ab1 m1 a2 ab2 m2 * leftI ω i h a1 ab1 m1 a2 ab2 m2 - leftP ω h a1 m1 * leftP ω h a1 m1

/-- The antisymmetric channel factor. -/
def chanA (a1 m1 a2 ab2 m2 : α) : α := (2 * m1 * a1 - 1) + m1 * m2 * a1 * ab2 * (2 * m2 * a2 - 1)
/-- The symmetric channel factor. -/
def chanS (ω a1 m1 a2 ab2 m2 : α) : α := ω * (2 * m1 * a1 - 1) - m1 * m2 * a1 * ab2 * (2 * m2 * a2 - 1)

/-- **`det(left)` factors into the two channel factors**, times a unit (when 3 is invertible). -/
theorem thm_lsx_det_left_factor (ω i h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1) :
    detLeft ω i h a1 ab1 m1 a2 ab2 m2
      = -(ω * ω) * ((vf ω h * (1 + ω) * h) * (vf ω h * (1 + ω) * h)) *
          chanS ω a1 m1 a2 ab2 m2 * chanA a1 m1 a2 ab2 m2 := by
  have ⟨cs, ca⟩ := fact_contact_channels ω i h hω hi hh
  have lsum : leftI ω i h a1 ab1 m1 a2 ab2 m2 + leftP ω h a1 m1
      = vf ω h * (1 + ω) * h * ω * chanS ω a1 m1 a2 ab2 m2 := by
    have e : leftI ω i h a1 ab1 m1 a2 ab2 m2 + leftP ω h a1 m1 = leftOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω) := by
      simp only [leftI, leftP, leftOf, ← cs]
      grind
    rw [e]
    simp only [leftOf, chanS, fact_vb ω h a1 m1 hh, fact_vb ω h a2 m2 hh, fact_energy ω m1 m2 hω]
    grind
  have ldiff : leftI ω i h a1 ab1 m1 a2 ab2 m2 - leftP ω h a1 m1
      = -(vf ω h * (1 + ω) * h * ω) * chanA a1 m1 a2 ab2 m2 := by
    have e : leftI ω i h a1 ab1 m1 a2 ab2 m2 - leftP ω h a1 m1 = leftOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) := by
      simp only [leftI, leftP, leftOf, ← ca]
      grind
    rw [e]
    simp only [leftOf, chanA, fact_vb ω h a1 m1 hh, fact_vb ω h a2 m2 hh, fact_energy ω m1 m2 hω]
    grind
  have hd : detLeft ω i h a1 ab1 m1 a2 ab2 m2
      = (leftI ω i h a1 ab1 m1 a2 ab2 m2 + leftP ω h a1 m1) * (leftI ω i h a1 ab1 m1 a2 ab2 m2 - leftP ω h a1 m1) := by
    simp only [detLeft]
    grind
  rw [hd, lsum, ldiff]
  generalize vf ω h * (1 + ω) * h = k
  grind

/-- **`det(left)` is not identically zero on the curve.** The modes `a = i`, `μ = i` (momentum `π/2`, upper band)
and `a = i`, `μ = -i` (lower band) lie on the curve, and there `det(left) · u = 63`. -/
theorem thm_lsx_det_left_nonzero_point (ω i h : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1) :
    i * (-i) = 1 ∧ 2 * i * i - (i + -i) * i + 2 = 0 ∧ 2 * (-i) * (-i) - (i + -i) * (-i) + 2 = 0 ∧
      detLeft ω i h i (-i) i i (-i) (-i) * (-(16 * ω * h * ((2 + ω * ω) * (2 + ω * ω)) * (3 * (ω * ω) + 1))) = 63 ∧
      ((63 : α) ≠ 0 → detLeft ω i h i (-i) i i (-i) (-i) ≠ 0) := by
  have key : detLeft ω i h i (-i) i i (-i) (-i) *
      (-(16 * ω * h * ((2 + ω * ω) * (2 + ω * ω)) * (3 * (ω * ω) + 1))) = 63 := by
    rw [thm_lsx_det_left_factor ω i h i (-i) i i (-i) (-i) hω hi hh]
    simp only [chanS, chanA, vf, coinFlip]
    grind
  refine ⟨by grind, by grind, by grind, key, ?_⟩
  intro h63 hz
  rw [hz] at key
  apply h63
  rw [← key]
  grind

/-- **Where `det(left)` is nonzero, `S` is unique**: any `S = sI I + sP P` with `left S = right` satisfies
`det(left) ((W + i D) S - (W P - i D I)) = 0` on both components. -/
theorem thm_lsx_s_unique (ω i h a1 ab1 m1 a2 ab2 m2 sI sP : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0)
    (hsI : leftI ω i h a1 ab1 m1 a2 ab2 m2 * sI + leftP ω h a1 m1 * sP = rightI ω i h a1 ab1 m1 a2 ab2 m2)
    (hsP : leftI ω i h a1 ab1 m1 a2 ab2 m2 * sP + leftP ω h a1 m1 * sI = rightP ω h a2 m2) :
    let w := rapW ω i h a1 ab1 m1 a2 ab2 m2
    let d := rapD ω i a1 ab1 a2 ab2
    detLeft ω i h a1 ab1 m1 a2 ab2 m2 * ((w + i * d) * sI + i * d) = 0 ∧
      detLeft ω i h a1 ab1 m1 a2 ab2 m2 * ((w + i * d) * sP - w) = 0 := by
  intro w d
  have yang := thm_line_s_is_yang ω i h a1 ab1 m1 a2 ab2 m2 hω hi hh ha1 hm1 ha2 hm2
  simp only at yang
  have e1 : leftI ω i h a1 ab1 m1 a2 ab2 m2 = leftOf ω h a1 ab1 m1 a2 ab2 m2 (contactKeep ω i h) := rfl
  have e2 : leftP ω h a1 m1 = vf ω h * vb ω h a1 m1 * contactSwap h := rfl
  have e3 : rightI ω i h a1 ab1 m1 a2 ab2 m2 = rightOf ω h a1 ab1 m1 a2 ab2 m2 (contactKeep ω i h) := rfl
  have e4 : rightP ω h a2 m2 = -(vf ω h * vb ω h a2 m2 * contactSwap h) := rfl
  rw [← e1, ← e2, ← e3, ← e4] at yang
  have hw : rapW ω i h a1 ab1 m1 a2 ab2 m2 = w := rfl
  have hdd : rapD ω i a1 ab1 a2 ab2 = d := rfl
  rw [hw, hdd] at yang
  obtain ⟨y1, y2⟩ := yang
  simp only [detLeft]
  generalize leftI ω i h a1 ab1 m1 a2 ab2 m2 = lI at *
  generalize leftP ω h a1 m1 = lP at *
  generalize rightI ω i h a1 ab1 m1 a2 ab2 m2 = rI at *
  generalize rightP ω h a2 m2 = rP at *
  generalize w = x at *
  generalize d = y at *
  constructor <;> grind

/-! ### A12: the rapidity identities -/

/-- `λ⁻¹ = ζ₆⁻¹ μ⁻¹ = -ω μ⁻¹`. -/
def lamInv (ω h a ab μ : α) : α := -ω * muBar h a ab μ
/-- `J(λ) = λ - λ⁻¹`, which is `2 i Im λ` on the unit circle. -/
def imLam (ω h a ab μ : α) : α := lam ω μ - lamInv ω h a ab μ
/-- `J(ζ₆ λ) = ζ₆ λ - (ζ₆ λ)⁻¹`, with `(ζ₆ λ)⁻¹ = -ω λ⁻¹`. -/
def imZLam (ω h a ab μ : α) : α := zeta6 ω * lam ω μ - (-ω) * lamInv ω h a ab μ
/-- The cleared rapidity numerator, `rapNum` after clearing units (`fact_rapNum`). -/
def rapN (ω a ab μ : α) : α := ω * (a + ab) + 2 * μ

-- [helper]
theorem fact_lam_inverse (ω h a ab μ : α) (hω : ω * ω + ω + 1 = 0) (hh : 2 * h = 1)
    (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0) :
    lam ω μ * lamInv ω h a ab μ = 1 ∧ (zeta6 ω * lam ω μ) * ((-ω) * lamInv ω h a ab μ) = 1 := by
  have u := fact_mu_unit h a ab μ hh hμ
  simp only [lamInv, lam, zeta6]
  generalize muBar h a ab μ = b at *
  constructor <;> grind

/-- **`4 Im(λ) Im(ζ₆ λ) = -Im(a)²`**, cleared: `4 J(λ) J(ζ₆ λ) = -(a - ab)²`. -/
theorem thm_lsx_im_product (ω h a ab μ : α) (hω : ω * ω + ω + 1 = 0) (hh : 2 * h = 1)
    (ha : a * ab = 1) (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0) :
    4 * imLam ω h a ab μ * imZLam ω h a ab μ = -((a - ab) * (a - ab)) := by
  have u := fact_mu_unit h a ab μ hh hμ
  have s := fact_mu_sum h a ab μ hh
  simp only [imLam, imZLam, lamInv, lam, zeta6]
  generalize muBar h a ab μ = b at *
  grind

-- [helper]
theorem fact_rapDen_sq (ω i a ab : α) (hi : i * i = -1) :
    rapDen ω i a ab * rapDen ω i a ab = 3 * ((a - ab) * (a - ab)) := by
  simp only [rapDen, sqrt3]
  grind

/-- **`θ² = -Im(λ) / (3 Im(ζ₆ λ))`**, cleared: `3 rapNum² J(ζ₆ λ) + rapDen² J(λ) = 0`. -/
theorem thm_lsx_rapidity_square (ω i h a ab μ : α) (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha : a * ab = 1) (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0) :
    3 * (rapNum ω i h a ab μ * rapNum ω i h a ab μ) * imZLam ω h a ab μ
      + rapDen ω i a ab * rapDen ω i a ab * imLam ω h a ab μ = 0 := by
  rw [fact_rapNum ω i h a ab μ hi hh, fact_rapDen_sq ω i a ab hi]
  have u := fact_mu_unit h a ab μ hh hμ
  have s := fact_mu_sum h a ab μ hh
  simp only [imLam, imZLam, lamInv, lam, zeta6]
  generalize muBar h a ab μ = b at *
  grind

/-- **`θ²` is a Möbius function of `λ²`**: `θ₁² = θ₂²` exactly when `λ₁² = λ₂²` (where the factors are units). -/
theorem thm_lsx_rapidity_square_injective (ω i h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    let N1 := rapNum ω i h a1 ab1 m1
    let N2 := rapNum ω i h a2 ab2 m2
    let D1 := rapDen ω i a1 ab1
    let D2 := rapDen ω i a2 ab2
    3 * imZLam ω h a1 ab1 m1 * imZLam ω h a2 ab2 m2 * lam ω m1 * lam ω m2 *
        (N1 * N1 * (D2 * D2) - N2 * N2 * (D1 * D1))
      = -(D1 * D1 * (D2 * D2)) * (1 + 2 * ω) * (lam ω m1 * lam ω m1 - lam ω m2 * lam ω m2) := by
  intro N1 N2 D1 D2
  have r1 := thm_lsx_rapidity_square ω i h a1 ab1 m1 hω hi hh ha1 hm1
  have r2 := thm_lsx_rapidity_square ω i h a2 ab2 m2 hω hi hh ha2 hm2
  have ⟨l1, _⟩ := fact_lam_inverse ω h a1 ab1 m1 hω hh hm1
  have ⟨l2, _⟩ := fact_lam_inverse ω h a2 ab2 m2 hω hh hm2
  -- λ (J₁ K₂ - J₂ K₁) in terms of λ²
  have core : lam ω m1 * lam ω m2 *
      (imLam ω h a1 ab1 m1 * imZLam ω h a2 ab2 m2 - imLam ω h a2 ab2 m2 * imZLam ω h a1 ab1 m1)
      = (1 + 2 * ω) * (lam ω m1 * lam ω m1 - lam ω m2 * lam ω m2) := by
    simp only [imLam, imZLam, zeta6] at *
    generalize lam ω m1 = x1 at *
    generalize lam ω m2 = x2 at *
    generalize lamInv ω h a1 ab1 m1 = y1 at *
    generalize lamInv ω h a2 ab2 m2 = y2 at *
    grind
  change 3 * (N1 * N1) * imZLam ω h a1 ab1 m1 + D1 * D1 * imLam ω h a1 ab1 m1 = 0 at r1
  change 3 * (N2 * N2) * imZLam ω h a2 ab2 m2 + D2 * D2 * imLam ω h a2 ab2 m2 = 0 at r2
  rw [← core]
  generalize imZLam ω h a1 ab1 m1 = K1 at *
  generalize imZLam ω h a2 ab2 m2 = K2 at *
  generalize imLam ω h a1 ab1 m1 = J1 at *
  generalize imLam ω h a2 ab2 m2 = J2 at *
  generalize lam ω m1 = x1 at *
  generalize lam ω m2 = x2 at *
  generalize N1 = n1 at *
  generalize N2 = n2 at *
  generalize D1 = d1 at *
  generalize D2 = d2 at *
  grind

/-- **The rapidity is never 0 on a moving mode**: `rapNum = 0` forces `(a - ab)² = 0`. -/
theorem thm_lsx_rapidity_nonzero (ω i h a ab μ : α) (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha : a * ab = 1) (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0)
    (hN : rapNum ω i h a ab μ = 0) : (a - ab) * (a - ab) = 0 := by
  rw [fact_rapNum ω i h a ab μ hi hh] at hN
  grind

/-! ### The rapidity bridge to `UniversalityObstructions` -/

/-- The velocity numerator `-(a - ab)` (`-sin p`, times `2 i`). -/
def velNum (a ab : α) : α := -(a - ab)
/-- The velocity denominator `2 (μ - μ⁻¹)` (`2 sin W`, times `2 i`). -/
def velDen (h a ab μ : α) : α := 2 * (μ - muBar h a ab μ)

/-- The cleared core of the bridge: `(a - ab)² + N² = 2 N (μ - μ⁻¹)` on the curve. -/
-- [helper]
theorem core_bracket (ω h a ab μ : α) (hω : ω * ω + ω + 1 = 0) (hh : 2 * h = 1)
    (ha : a * ab = 1) (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0) :
    (a - ab) * (a - ab) + rapN ω a ab μ * rapN ω a ab μ = 2 * rapN ω a ab μ * (μ - muBar h a ab μ) := by
  have u := fact_mu_unit h a ab μ hh hμ
  have s := fact_mu_sum h a ab μ hh
  simp only [rapN]
  generalize muBar h a ab μ = b at *
  grind

/-- **The velocity is `-√3 θ / (1 + 3 θ²)`** on the curve: `velNum (D² + 3 N²) = -√3 N D velDen`, and
`D² + 3 N² = 3 N velDen`. So make's rapidity `u` of `v(u) = u / (3 u² + 1)` is exactly `θ`, and make's velocity is
`-v / √3`. -/
theorem thm_lsx_velocity_rapidity (ω i h a ab μ : α) (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha : a * ab = 1) (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0) :
    let N := rapNum ω i h a ab μ
    let D := rapDen ω i a ab
    velNum a ab * (D * D + 3 * (N * N)) = -(sqrt3 ω i * N * D * velDen h a ab μ) ∧
      D * D + 3 * (N * N) = 3 * N * velDen h a ab μ := by
  intro N D
  have b := core_bracket ω h a ab μ hω hh ha hμ
  have hN : N = rapN ω a ab μ := fact_rapNum ω i h a ab μ hi hh
  have hD2 : D * D = 3 * ((a - ab) * (a - ab)) := fact_rapDen_sq ω i a ab hi
  have hD : D = sqrt3 ω i * (a - ab) := rfl
  have s3 : sqrt3 ω i * sqrt3 ω i = 3 := by
    simp only [sqrt3]
    grind
  simp only [velNum, velDen]
  rw [hD2, hN]
  rw [hD]
  generalize muBar h a ab μ = mb at *
  generalize rapN ω a ab μ = n at *
  generalize sqrt3 ω i = r at *
  constructor <;> grind

/-- **make's cleared 2-to-1 law factors** over any commutative ring. -/
theorem thm_lsx_two_to_one_factor (x1 y1 x2 y2 : α) :
    x1 * y1 * (3 * x2 ^ 2 + y2 ^ 2) - x2 * y2 * (3 * x1 ^ 2 + y1 ^ 2) = (x1 * y2 - x2 * y1) * (y1 * y2 - 3 * x1 * x2) := by
  grind

/-- **The bridge.** For two modes, the cleared velocity difference is `-√3 velDen₁ velDen₂` times make's cleared
2-to-1 expression at `(u₁, u₂) = (N₁ / D₁, N₂ / D₂) = (θ₁, θ₂)`; and make's integer law is the integer instance. -/
theorem thm_lsx_rapidity_bridge (ω i h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    let N1 := rapNum ω i h a1 ab1 m1
    let N2 := rapNum ω i h a2 ab2 m2
    let D1 := rapDen ω i a1 ab1
    let D2 := rapDen ω i a2 ab2
    (velNum a1 ab1 * velDen h a2 ab2 m2 - velNum a2 ab2 * velDen h a1 ab1 m1) *
        (3 * N1 ^ 2 + D1 ^ 2) * (3 * N2 ^ 2 + D2 ^ 2)
      = -(sqrt3 ω i * velDen h a1 ab1 m1 * velDen h a2 ab2 m2) *
          (N1 * D1 * (3 * N2 ^ 2 + D2 ^ 2) - N2 * D2 * (3 * N1 ^ 2 + D1 ^ 2)) ∧
    (∀ a1 b1 a2 b2 : Int,
      (a1 * b1 * (3 * a2 ^ 2 + b2 ^ 2) = a2 * b2 * (3 * a1 ^ 2 + b1 ^ 2) ↔
        (a1 * b2 = a2 * b1 ∨ 3 * a1 * a2 = b1 * b2))) := by
  intro N1 N2 D1 D2
  refine ⟨?_, fun a1 b1 a2 b2 => UniversalityObstructions.thm_univ_dispersion_floor_and_rapidity_nogo.2.2.1 a1 b1 a2 b2⟩
  have ⟨v1, _⟩ := thm_lsx_velocity_rapidity ω i h a1 ab1 m1 hω hi hh ha1 hm1
  have ⟨v2, _⟩ := thm_lsx_velocity_rapidity ω i h a2 ab2 m2 hω hi hh ha2 hm2
  simp only at v1 v2
  change velNum a1 ab1 * (D1 * D1 + 3 * (N1 * N1)) = -(sqrt3 ω i * N1 * D1 * velDen h a1 ab1 m1) at v1
  change velNum a2 ab2 * (D2 * D2 + 3 * (N2 * N2)) = -(sqrt3 ω i * N2 * D2 * velDen h a2 ab2 m2) at v2
  generalize velNum a1 ab1 = p1 at *
  generalize velNum a2 ab2 = p2 at *
  generalize velDen h a1 ab1 m1 = q1 at *
  generalize velDen h a2 ab2 m2 = q2 at *
  generalize sqrt3 ω i = r at *
  generalize N1 = n1 at *
  generalize N2 = n2 at *
  generalize D1 = d1 at *
  generalize D2 = d2 at *
  grind

/-! ### A33: door B -/

/-- The conjugate denominator: `|(x + i)(y + i)(x + y + i)|² = (x² + 1)(y² + 1)((x + y)² + 1)` for real `x, y`. -/
theorem thm_lsx_doorb_mismatch_denominator (i x y : α) (hi : i * i = -1) :
    ((x + i) * (y + i) * (x + y + i)) * ((x - i) * (y - i) * (x + y - i))
      = (x * x + 1) * (y * y + 1) * ((x + y) * (x + y) + 1) := by
  grind

/-- **One mode twice in contact.** `λ² = ω μ²`; `λ² = ω²` (the like block's symmetric value) forces `sin p = 0`,
`λ² = -ω` (antisymmetric and opposite blocks) forces `cos p = 0`; at `cos p = 0`, `3 θ² = 1` and `4 v² = 1`. -/
theorem thm_lsx_doorb_coincidence (ω i h a ab μ : α) (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha : a * ab = 1) (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0) :
    lam ω μ * lam ω μ = ω * (μ * μ) ∧
    (lam ω μ * lam ω μ = ω * ω → (a - ab) * (a - ab) = 0) ∧
    (lam ω μ * lam ω μ = -ω → (a + ab) * (a + ab) = 0) ∧
    (a + ab = 0 → lam ω μ * lam ω μ = -ω ∧
      3 * (rapNum ω i h a ab μ * rapNum ω i h a ab μ) = rapDen ω i a ab * rapDen ω i a ab ∧
      4 * (velNum a ab * velNum a ab) = velDen h a ab μ * velDen h a ab μ) := by
  have u := fact_mu_unit h a ab μ hh hμ
  have s := fact_mu_sum h a ab μ hh
  have hl : lam ω μ * lam ω μ = ω * (μ * μ) := by
    simp only [lam, zeta6]
    grind
  refine ⟨hl, ?_, ?_, ?_⟩
  · intro e
    rw [hl] at e
    generalize muBar h a ab μ = b at *
    grind
  · intro e
    rw [hl] at e
    generalize muBar h a ab μ = b at *
    grind
  · intro e0
    have m2 : μ * μ = -1 := by
      have t : 2 * (μ * μ + 1) = 0 := by grind
      have : μ * μ + 1 = h * (2 * (μ * μ + 1)) := by grind
      rw [t] at this
      grind
    refine ⟨by rw [hl, m2]; grind, ?_, ?_⟩
    · rw [fact_rapNum ω i h a ab μ hi hh, fact_rapDen_sq ω i a ab hi]
      grind
    · simp only [velNum, velDen]
      generalize muBar h a ab μ = b at *
      grind

end Ring

section Braid

variable {α β : Type} [CommRing α]

/-- **Door B, both orientations.** A like pair `p, q` beside an opposite tone `r` misses Yang-Baxter by
`-x y (x + y) (I + P)` with the wall on the right `(+, +, -)` and by `+x y (x + y) (I + P)` with it on the left
`(-, +, +)`; so a role-antisymmetric input never diffracts on either orientation. -/
theorem thm_lsx_doorb_orientations (tone : β → Bool) (i x y : α) (f : β × β × β → α)
    (p q r : β) (hpq : tone p = tone q) (hqr : tone q ≠ tone r) :
    firstOrder tone i x y f (p, q, r) - secondOrder tone i x y f (p, q, r)
      = -(x * y * (x + y)) * (f (p, q, r) + f (q, p, r)) ∧
    firstOrder tone i x y f (r, p, q) - secondOrder tone i x y f (r, p, q)
      = x * y * (x + y) * (f (r, p, q) + f (r, q, p)) ∧
    (f (q, p, r) = -f (p, q, r) → firstOrder tone i x y f (p, q, r) = secondOrder tone i x y f (p, q, r)) ∧
    (f (r, q, p) = -f (r, p, q) → firstOrder tone i x y f (r, p, q) = secondOrder tone i x y f (r, p, q)) := by
  have hrp : tone r ≠ tone p := by rw [hpq]; exact fun e => hqr e.symm
  have hpr : tone p ≠ tone r := by rw [hpq]; exact hqr
  have hrq : tone r ≠ tone q := fun e => hqr e.symm
  have hqp : tone q = tone p := hpq.symm
  have d1 := thm_line_mixed_tone_defect tone i x y f p q r hpq hqr
  have d2 : firstOrder tone i x y f (r, p, q) - secondOrder tone i x y f (r, p, q)
      = x * y * (x + y) * (f (r, p, q) + f (r, q, p)) := by
    simp only [firstOrder, secondOrder, braid0, braid1, hpq, hqp, hrp, hrq, hpr, hqr, ite_true, ite_false]
    grind
  refine ⟨d1, d2, ?_, ?_⟩
  · intro e
    have : firstOrder tone i x y f (p, q, r) - secondOrder tone i x y f (p, q, r) = 0 := by rw [d1, e]; grind
    grind
  · intro e
    have : firstOrder tone i x y f (r, p, q) - secondOrder tone i x y f (r, p, q) = 0 := by rw [d2, e]; grind
    grind

end Braid

section Field

variable {α : Type} [Field α]

-- [helper]
theorem field_mul_eq_zero (x y : α) (e : x * y = 0) : x = 0 ∨ y = 0 := by
  by_cases hx : x = 0
  · exact Or.inl hx
  · right
    have : y = x⁻¹ * (x * y) := by
      rw [← Semiring.mul_assoc, Field.inv_mul_cancel hx, Semiring.one_mul]
    rw [this, e, Semiring.mul_zero]

/-- **Where `det(left) ≠ 0`, `S` is Yang's closed form**: `(W + i D) S = W P - i D I`. -/
theorem thm_lsx_s_unique_field (ω i h a1 ab1 m1 a2 ab2 m2 sI sP : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0)
    (hsI : leftI ω i h a1 ab1 m1 a2 ab2 m2 * sI + leftP ω h a1 m1 * sP = rightI ω i h a1 ab1 m1 a2 ab2 m2)
    (hsP : leftI ω i h a1 ab1 m1 a2 ab2 m2 * sP + leftP ω h a1 m1 * sI = rightP ω h a2 m2)
    (hdet : detLeft ω i h a1 ab1 m1 a2 ab2 m2 ≠ 0) :
    let w := rapW ω i h a1 ab1 m1 a2 ab2 m2
    let d := rapD ω i a1 ab1 a2 ab2
    (w + i * d) * sI = -(i * d) ∧ (w + i * d) * sP = w := by
  intro w d
  have ⟨u1, u2⟩ := thm_lsx_s_unique ω i h a1 ab1 m1 a2 ab2 m2 sI sP hω hi hh ha1 hm1 ha2 hm2 hsI hsP
  simp only at u1 u2
  change detLeft ω i h a1 ab1 m1 a2 ab2 m2 * ((w + i * d) * sI + i * d) = 0 at u1
  change detLeft ω i h a1 ab1 m1 a2 ab2 m2 * ((w + i * d) * sP - w) = 0 at u2
  have z1 := (field_mul_eq_zero _ _ u1).resolve_left hdet
  have z2 := (field_mul_eq_zero _ _ u2).resolve_left hdet
  constructor <;> grind

/-- **Coincident rapidities are one mode.** Over a field with `3 ≠ 0`, for moving modes (`a ≠ ab`):
`θ₁ = θ₂` (cleared, `N₁ D₂ = N₂ D₁`) iff `(a₂, μ₂) = (a₁, μ₁)` or `(a₂, μ₂) = -(a₁, μ₁)` (the parity partner). -/
theorem thm_lsx_equal_rapidity_iff (ω i h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1) (h3 : (3 : α) ≠ 0)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0)
    (hd1 : a1 ≠ ab1) (hd2 : a2 ≠ ab2) :
    rapNum ω i h a1 ab1 m1 * rapDen ω i a2 ab2 = rapNum ω i h a2 ab2 m2 * rapDen ω i a1 ab1 ↔
      (a2 = a1 ∧ m2 = m1) ∨ (a2 = -a1 ∧ m2 = -m1) := by
  have nz : ∀ z : α, z * z = 0 → z = 0 := fun z hz => (field_mul_eq_zero z z hz).elim id id
  have sub_ne : ∀ u v : α, u ≠ v → u - v ≠ 0 := fun u v huv e => huv (by grind)
  have s3 : sqrt3 ω i * sqrt3 ω i = 3 := by
    simp only [sqrt3]
    grind
  have s3ne : sqrt3 ω i ≠ 0 := fun e => h3 (by rw [← s3, e]; grind)
  have halve : ∀ z : α, 2 * z = 0 → z = 0 := fun z hz => by
    have e : z = h * (2 * z) := by grind
    rw [e, hz]
    grind
  rw [fact_rapNum ω i h a1 ab1 m1 hi hh, fact_rapNum ω i h a2 ab2 m2 hi hh]
  simp only [rapDen]
  have n1ne : ω * (a1 + ab1) + 2 * m1 ≠ 0 := by
    intro e
    have := thm_lsx_rapidity_nonzero ω i h a1 ab1 m1 hω hi hh ha1 hm1
      (by rw [fact_rapNum ω i h a1 ab1 m1 hi hh]; exact e)
    exact sub_ne _ _ hd1 (nz _ this)
  constructor
  · intro e
    -- cancel √3: N₁ (a₂ - ab₂) = N₂ (a₁ - ab₁)
    have e' : (ω * (a1 + ab1) + 2 * m1) * (a2 - ab2) = (ω * (a2 + ab2) + 2 * m2) * (a1 - ab1) := by
      have : sqrt3 ω i * ((ω * (a1 + ab1) + 2 * m1) * (a2 - ab2) - (ω * (a2 + ab2) + 2 * m2) * (a1 - ab1)) = 0 := by
        grind
      have := (field_mul_eq_zero _ _ this).resolve_left s3ne
      grind
    -- squares: θ₁² = θ₂², hence λ₁² = λ₂², hence μ₁² = μ₂²
    have inj := thm_lsx_rapidity_square_injective ω i h a1 ab1 m1 a2 ab2 m2 hω hi hh ha1 hm1 ha2 hm2
    simp only at inj
    rw [fact_rapNum ω i h a1 ab1 m1 hi hh, fact_rapNum ω i h a2 ab2 m2 hi hh,
      fact_rapDen_sq ω i a1 ab1 hi, fact_rapDen_sq ω i a2 ab2 hi] at inj
    have lhs0 : (ω * (a1 + ab1) + 2 * m1) * (ω * (a1 + ab1) + 2 * m1) * (3 * ((a2 - ab2) * (a2 - ab2)))
        - (ω * (a2 + ab2) + 2 * m2) * (ω * (a2 + ab2) + 2 * m2) * (3 * ((a1 - ab1) * (a1 - ab1))) = 0 := by
      have t : ((ω * (a1 + ab1) + 2 * m1) * (a2 - ab2)) * ((ω * (a1 + ab1) + 2 * m1) * (a2 - ab2))
          = ((ω * (a2 + ab2) + 2 * m2) * (a1 - ab1)) * ((ω * (a2 + ab2) + 2 * m2) * (a1 - ab1)) := by rw [e']
      grind
    rw [lhs0] at inj
    have hl1 : lam ω m1 * lam ω m1 = ω * (m1 * m1) := by simp only [lam, zeta6]; grind
    have hl2 : lam ω m2 * lam ω m2 = ω * (m2 * m2) := by simp only [lam, zeta6]; grind
    rw [hl1, hl2] at inj
    have q1 : (a1 - ab1) * (a1 - ab1) ≠ 0 := fun z => sub_ne _ _ hd1 (nz _ z)
    have q2 : (a2 - ab2) * (a2 - ab2) ≠ 0 := fun z => sub_ne _ _ hd2 (nz _ z)
    have w3 : (1 + 2 * ω) * (1 + 2 * ω) = -3 := by grind
    have w3ne : 1 + 2 * ω ≠ 0 := fun z => h3 (by have := w3; rw [z] at this; grind)
    have wne : ω ≠ 0 := fun z => by rw [z] at hω; grind
    have prod : (3 * ((a1 - ab1) * (a1 - ab1))) * (3 * ((a2 - ab2) * (a2 - ab2))) * (1 + 2 * ω) * ω *
        (m1 * m1 - m2 * m2) = 0 := by grind
    have mm : m1 * m1 - m2 * m2 = 0 := by
      rcases field_mul_eq_zero _ _ prod with z | z
      · rcases field_mul_eq_zero _ _ z with z | z
        · rcases field_mul_eq_zero _ _ z with z | z
          · rcases field_mul_eq_zero _ _ z with z | z
            · rcases field_mul_eq_zero _ _ z with z | z
              · exact absurd z h3
              · exact absurd z q1
            · rcases field_mul_eq_zero _ _ z with z | z
              · exact absurd z h3
              · exact absurd z q2
          · exact absurd z w3ne
        · exact absurd z wne
      · exact z
    have s1 := fact_mu_sum h a1 ab1 m1 hh
    have s2 := fact_mu_sum h a2 ab2 m2 hh
    have u1 := fact_mu_unit h a1 ab1 m1 hh hm1
    have u2 := fact_mu_unit h a2 ab2 m2 hh hm2
    rcases field_mul_eq_zero (m1 - m2) (m1 + m2) (by grind) with z | z
    · -- μ₂ = μ₁, so a₂ + ab₂ = a₁ + ab₁ and a₂ ∈ {a₁, ab₁}
      have mE : m2 = m1 := by grind
      have sumE : a2 + ab2 = a1 + ab1 := by
        rw [← s1, ← s2, mE]
      rcases field_mul_eq_zero (a2 - a1) (a2 - ab1) (by grind) with z2 | z2
      · exact Or.inl ⟨by grind, mE⟩
      · exfalso
        have aE : a2 = ab1 := by grind
        have bE : ab2 = a1 := by grind
        rw [aE, bE, mE] at e'
        have : 2 * ((ω * (a1 + ab1) + 2 * m1) * (a1 - ab1)) = 0 := by grind
        have := halve _ this
        rcases field_mul_eq_zero _ _ this with z3 | z3
        · exact n1ne z3
        · exact sub_ne _ _ hd1 z3
    · have mE : m2 = -m1 := by grind
      have sumE : a2 + ab2 = -(a1 + ab1) := by
        have : 2 * (m2 + muBar h a2 ab2 m2) = -(2 * (m1 + muBar h a1 ab1 m1)) := by
          simp only [muBar]
          rw [mE]
          grind
        grind
      rcases field_mul_eq_zero (a2 + a1) (a2 + ab1) (by grind) with z2 | z2
      · exact Or.inr ⟨by grind, mE⟩
      · exfalso
        have aE : a2 = -ab1 := by grind
        have bE : ab2 = -a1 := by grind
        rw [aE, bE, mE] at e'
        have : 2 * ((ω * (a1 + ab1) + 2 * m1) * (a1 - ab1)) = 0 := by grind
        have := halve _ this
        rcases field_mul_eq_zero _ _ this with z3 | z3
        · exact n1ne z3
        · exact sub_ne _ _ hd1 z3
  · rintro (⟨aE, mE⟩ | ⟨aE, mE⟩)
    · have bE : ab2 = ab1 := by
        rw [aE] at ha2
        grind
      rw [aE, bE, mE]
    · have bE : ab2 = -ab1 := by
        rw [aE] at ha2
        grind
      rw [aE, bE, mE]
      grind

/-- **The 2-to-1 law in our variables.** Over a field with `3 ≠ 0`, two moving modes (`a ≠ ab`, `sin W ≠ 0`) have
equal velocity iff `θ₁ = θ₂` or `3 θ₁ θ₂ = 1` (cleared: `N₁ D₂ = N₂ D₁ ∨ 3 N₁ N₂ = D₁ D₂`), make's law at `u = θ`. -/
theorem thm_lsx_equal_velocity_iff (ω i h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1) (h3 : (3 : α) ≠ 0)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0)
    (hd1 : a1 ≠ ab1) (hd2 : a2 ≠ ab2)
    (hv1 : velDen h a1 ab1 m1 ≠ 0) (hv2 : velDen h a2 ab2 m2 ≠ 0) :
    velNum a1 ab1 * velDen h a2 ab2 m2 = velNum a2 ab2 * velDen h a1 ab1 m1 ↔
      (rapNum ω i h a1 ab1 m1 * rapDen ω i a2 ab2 = rapNum ω i h a2 ab2 m2 * rapDen ω i a1 ab1 ∨
        3 * rapNum ω i h a1 ab1 m1 * rapNum ω i h a2 ab2 m2 = rapDen ω i a1 ab1 * rapDen ω i a2 ab2) := by
  have nz : ∀ z : α, z * z = 0 → z = 0 := fun z hz => (field_mul_eq_zero z z hz).elim id id
  have sub_ne : ∀ u v : α, u ≠ v → u - v ≠ 0 := fun u v huv e => huv (by grind)
  have s3 : sqrt3 ω i * sqrt3 ω i = 3 := by
    simp only [sqrt3]
    grind
  have s3ne : sqrt3 ω i ≠ 0 := fun e => h3 (by rw [← s3, e]; grind)
  have nne : ∀ a ab μ : α, a * ab = 1 → 2 * μ * μ - (a + ab) * μ + 2 = 0 → a ≠ ab →
      rapNum ω i h a ab μ ≠ 0 := fun a ab μ ha hm hd e =>
    sub_ne _ _ hd (nz _ (thm_lsx_rapidity_nonzero ω i h a ab μ hω hi hh ha hm e))
  have n1 := nne a1 ab1 m1 ha1 hm1 hd1
  have n2 := nne a2 ab2 m2 ha2 hm2 hd2
  have ⟨_, w1⟩ := thm_lsx_velocity_rapidity ω i h a1 ab1 m1 hω hi hh ha1 hm1
  have ⟨_, w2⟩ := thm_lsx_velocity_rapidity ω i h a2 ab2 m2 hω hi hh ha2 hm2
  simp only at w1 w2
  have ⟨br, _⟩ := thm_lsx_rapidity_bridge ω i h a1 ab1 m1 a2 ab2 m2 hω hi hh ha1 hm1 ha2 hm2
  simp only at br
  have fac := thm_lsx_two_to_one_factor (rapNum ω i h a1 ab1 m1) (rapDen ω i a1 ab1)
    (rapNum ω i h a2 ab2 m2) (rapDen ω i a2 ab2)
  generalize rapNum ω i h a1 ab1 m1 = N1 at *
  generalize rapNum ω i h a2 ab2 m2 = N2 at *
  generalize rapDen ω i a1 ab1 = D1 at *
  generalize rapDen ω i a2 ab2 = D2 at *
  generalize velNum a1 ab1 = p1 at *
  generalize velNum a2 ab2 = p2 at *
  generalize velDen h a1 ab1 m1 = q1 at *
  generalize velDen h a2 ab2 m2 = q2 at *
  generalize sqrt3 ω i = r at *
  -- Q_j = D_j² + 3 N_j² = 3 N_j q_j ≠ 0
  have Q1 : 3 * N1 ^ 2 + D1 ^ 2 ≠ 0 := by
    intro z
    have : 3 * N1 * q1 = 0 := by grind
    rcases field_mul_eq_zero _ _ this with z' | z'
    · rcases field_mul_eq_zero _ _ z' with z'' | z''
      · exact h3 z''
      · exact n1 z''
    · exact hv1 z'
  have Q2 : 3 * N2 ^ 2 + D2 ^ 2 ≠ 0 := by
    intro z
    have : 3 * N2 * q2 = 0 := by grind
    rcases field_mul_eq_zero _ _ this with z' | z'
    · rcases field_mul_eq_zero _ _ z' with z'' | z''
      · exact h3 z''
      · exact n2 z''
    · exact hv2 z'
  constructor
  · intro e
    have : -(r * q1 * q2) * ((N1 * D2 - N2 * D1) * (D1 * D2 - 3 * N1 * N2)) = 0 := by
      rw [← fac, ← br]
      grind
    rcases field_mul_eq_zero _ _ this with z | z
    · exfalso
      have : r * q1 * q2 = 0 := by grind
      rcases field_mul_eq_zero _ _ this with z' | z'
      · rcases field_mul_eq_zero _ _ z' with z'' | z''
        · exact s3ne z''
        · exact hv1 z''
      · exact hv2 z'
    · rcases field_mul_eq_zero _ _ z with z' | z'
      · exact Or.inl (by grind)
      · exact Or.inr (by grind)
  · intro hor
    have hz : (N1 * D2 - N2 * D1) * (D1 * D2 - 3 * N1 * N2) = 0 := by
      rcases hor with z | z <;> grind
    have : (p1 * q2 - p2 * q1) * (3 * N1 ^ 2 + D1 ^ 2) * (3 * N2 ^ 2 + D2 ^ 2) = 0 := by
      rw [br, ← fac, hz]
      grind
    rcases field_mul_eq_zero _ _ this with z | z
    · rcases field_mul_eq_zero _ _ z with z' | z'
      · grind
      · exact absurd z' Q1
    · exact absurd z Q2

/-- **Door B: a symmetric nonzero input is clean iff two rapidities coincide** (`x y (x + y) = 0`). -/
theorem thm_lsx_doorb_symmetric_diffracts {β : Type} (tone : β → Bool) (i h x y : α) (f : β × β × β → α)
    (hh : 2 * h = 1) (p q r : β) (hpq : tone p = tone q) (hqr : tone q ≠ tone r)
    (hsym : f (q, p, r) = f (p, q, r)) (hne : f (p, q, r) ≠ 0) :
    firstOrder tone i x y f (p, q, r) = secondOrder tone i x y f (p, q, r) ↔ x * y * (x + y) = 0 := by
  have d := thm_line_mixed_tone_defect tone i x y f p q r hpq hqr
  rw [hsym] at d
  have two : (2 : α) ≠ 0 := fun z => by rw [z] at hh; grind
  constructor
  · intro e
    have : (x * y * (x + y)) * (2 * f (p, q, r)) = 0 := by grind
    rcases field_mul_eq_zero _ _ this with z | z
    · exact z
    · rcases field_mul_eq_zero _ _ z with z' | z'
      · exact absurd z' two
      · exact absurd z' hne
  · intro z
    have : firstOrder tone i x y f (p, q, r) - secondOrder tone i x y f (p, q, r) = 0 := by rw [d, z]; grind
    grind

end Field

end LineScatteringExt

end Vibe
