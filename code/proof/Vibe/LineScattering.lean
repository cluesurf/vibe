/-!
# Bare U on one mesh line: the two-body S-matrix is Yang's R at the rapidity difference

Q3b of the quantum ladder, symbolic. E-CMP-0045 found, at 20 exact sample modes,
that the one-line two-body S-matrix of the bare beat is Yang's `R(w) = (w I - i P) / (w + i)` at `w = θ₁ - θ₂`. Here
that is an identity in the momenta, over any commutative ring holding `ω` (`ω² + ω + 1 = 0`), `i` (`i² = -1`) and a
half `h` (`2 h = 1`); the complex numbers are one such ring, so it holds at every momentum.

A mode of momentum `p` is `a = e^{ip}`, `ab = e^{-ip}` (`a ab = 1`) and `μ = e^{iW}` with `μ + 1/μ = cos p`, i.e.
`2 μ² - (a + ab) μ + 2 = 0` (the dispersion `cos W = cos(p) / 2` of E-CMP-0017 and Q2). The coin read off one beat is
`C = [[ζ₆, 1 - ω], [1 - ω, ζ₆]] / 2`, a mode's beat eigenvalue `λ = ζ₆ μ` and its vector `v = (C_fb, λ a - C_ff)`. The
contact block read off one beat, on line-order words, keeps the word with `-i √3 / 2` and swaps it with `-1/2` (like
tone, distinct roles); opposite tones keep it with `-ω`; an identical pair whose turn is switched off by a spectator
keeps it with `ω²`. E-CMP-0049 checks every one of these coefficients against the beat on both meshes.

The S-matrix is defined by the beat's eigen-equation at the contact (line-scattering.ts):
`(v₂f v₁b T - E y⁻¹ v₁f v₂b) S = E y v₁b v₂f - v₁f v₂b T`, `E = λ₁ λ₂`, `y = a₂ / a₁`. The rapidity is
`θ = (cos p / 2 + sin W / √3) / sin p = rapNum / rapDen`. Theorems:

- `thm_line_mode_eigenvector`: every mode is an exact eigenvector of the coin, `C v = λ diag(a, 1/a) v`.
- `thm_line_s_is_yang`: with `T` the like-tone block, `S = (W P - i D) / (W + i D)` (line order), i.e.
  `P S = R(θ₁ - θ₂)`, with `θ₁ - θ₂ = W / D`; stated without division as the two matrix components.
- `thm_line_opposite_reflects`: opposite tones, `S = -1` at every momentum.
- `thm_line_spectator_symmetric`: the identical pair with a spectator, `S = (w - i) / (w + i)`.
- `thm_line_yang_baxter_one_tone`: the braid Yang-Baxter equation for Yang's R with additive rapidities, on words over
  any alphabet (one tone).
- `thm_line_mixed_tone_defect`: a like pair beside an opposite tone: the two collision orders differ by exactly
  `-x y (x + y) (I + P)` (numerators, `x = θ_a - θ_b`, `y = θ_b - θ_c`), nonzero for distinct rapidities.
- `thm_line_opposite_between_factorizes`: the opposite tone between the like pair: both orders agree.

Core Lean only: `grind`'s commutative-ring solver, no `sorry`, no `axiom`, no `native_decide`.
-/

set_option autoImplicit false

namespace Vibe

namespace LineScattering

open Lean.Grind

section Field

variable {α : Type} [CommRing α]

def zeta6 (ω : α) : α := 1 + ω
def sqrt3 (ω i : α) : α := -(i * (2 * ω + 1))
def coinKeep (ω h : α) : α := h * zeta6 ω
def coinFlip (ω h : α) : α := h * (1 - ω)
def lam (ω μ : α) : α := zeta6 ω * μ
def vf (ω h : α) : α := coinFlip ω h
def vb (ω h a μ : α) : α := lam ω μ * a - coinKeep ω h
-- the like-tone contact block on line-order words: keep and swap
def contactKeep (ω i h : α) : α := -(h * i * sqrt3 ω i)
def contactSwap (h : α) : α := -h
-- the rapidity theta = rapNum / rapDen, with cos p = h (a + ab) and sin W = (2 mu - cos p) / (2 i)
def cosP (h a ab : α) : α := h * (a + ab)
def rapNum (ω i h a ab μ : α) : α := i * sqrt3 ω i * cosP h a ab + 2 * μ - cosP h a ab
def rapDen (ω i a ab : α) : α := sqrt3 ω i * (a - ab)

/-- A mode is an exact eigenvector of the line coin: `C v = λ diag(a, ab) v`. -/
theorem thm_line_mode_eigenvector (ω h a ab μ : α)
    (hω : ω * ω + ω + 1 = 0) (hh : 2 * h = 1)
    (ha : a * ab = 1) (hμ : 2 * μ * μ - (a + ab) * μ + 2 = 0) :
    coinKeep ω h * vf ω h + coinFlip ω h * vb ω h a μ = lam ω μ * a * vf ω h ∧
      coinFlip ω h * vf ω h + coinKeep ω h * vb ω h a μ = lam ω μ * ab * vb ω h a μ := by
  simp only [coinKeep, coinFlip, vf, vb, lam, zeta6]
  constructor <;> grind

/-- The antisymmetric channel, cleared of every unit: `g = 2 μ a - 1`. -/
-- [helper]
theorem core_antisymmetric (a1 ab1 m1 a2 ab2 m2 : α)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    (2 * m1 * a1 - 1) * (m1 * m2 * a2 * ab1 - 1) = (2 * m2 * a2 - 1) * (m1 * m2 * a1 * ab2 - 1) := by
  grind

/-- The symmetric channel, cleared of every unit. -/
-- [helper]
theorem core_symmetric (ω a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    ((ω * (a1 + ab1) + 2 * m1) * (a2 - ab2) - (ω * (a2 + ab2) + 2 * m2) * (a1 - ab1)
        - (2 * ω + 1) * (a1 - ab1) * (a2 - ab2)) *
      (ω * (2 * m1 * a1 - 1) - m1 * m2 * a1 * ab2 * (2 * m2 * a2 - 1))
      = ((ω * (a1 + ab1) + 2 * m1) * (a2 - ab2) - (ω * (a2 + ab2) + 2 * m2) * (a1 - ab1)
        + (2 * ω + 1) * (a1 - ab1) * (a2 - ab2)) *
      (m1 * m2 * a2 * ab1 * (2 * m1 * a1 - 1) - ω * (2 * m2 * a2 - 1)) := by
  grind

-- the rapidity difference w = θ₁ - θ₂ = rapW / rapD
def rapW (ω i h a1 ab1 m1 a2 ab2 m2 : α) : α :=
  rapNum ω i h a1 ab1 m1 * rapDen ω i a2 ab2 - rapNum ω i h a2 ab2 m2 * rapDen ω i a1 ab1
def rapD (ω i a1 ab1 a2 ab2 : α) : α := rapDen ω i a1 ab1 * rapDen ω i a2 ab2
def energy (ω m1 m2 : α) : α := lam ω m1 * lam ω m2

/-- `left (T) = vf vb₁ T - E y⁻¹ vf vb₂`, `right (T) = E y vb₁ vf - vf vb₂ T` for a scalar block value `t`. -/
def leftOf (ω h a1 _ab1 m1 a2 ab2 m2 t : α) : α :=
  vf ω h * vb ω h a1 m1 * t - energy ω m1 m2 * (a1 * ab2) * vf ω h * vb ω h a2 m2
def rightOf (ω h a1 ab1 m1 a2 _ab2 m2 t : α) : α :=
  energy ω m1 m2 * (a2 * ab1) * vb ω h a1 m1 * vf ω h - vf ω h * vb ω h a2 m2 * t

-- [helper]
theorem fact_vb (ω h a μ : α) (hh : 2 * h = 1) : vb ω h a μ = (1 + ω) * h * (2 * μ * a - 1) := by
  simp only [vb, lam, coinKeep, zeta6]
  grind

-- [helper]
theorem fact_rapNum (ω i h a ab μ : α) (hi : i * i = -1) (hh : 2 * h = 1) :
    rapNum ω i h a ab μ = ω * (a + ab) + 2 * μ := by
  simp only [rapNum, sqrt3, cosP]
  grind

-- [helper]
theorem fact_energy (ω m1 m2 : α) (hω : ω * ω + ω + 1 = 0) : energy ω m1 m2 = ω * (m1 * m2) := by
  simp only [energy, lam, zeta6]
  grind

-- [helper]
theorem fact_i_sqrt3 (ω i : α) (hi : i * i = -1) : i * sqrt3 ω i = 2 * ω + 1 := by
  simp only [sqrt3]
  grind

/-- The like-tone block's channel eigenvalues: symmetric `ω²`, antisymmetric `-ω`. -/
-- [helper]
theorem fact_contact_channels (ω i h : α) (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1) :
    contactKeep ω i h + contactSwap h = ω * ω ∧ contactKeep ω i h - contactSwap h = -ω := by
  simp only [contactKeep, contactSwap, sqrt3]
  constructor <;> grind

/-- Antisymmetric channel (and opposite tones): block value `-ω` gives `S = -1`, i.e. `left = -right`. -/
-- [helper]
theorem channel_antisymmetric (ω h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    leftOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) + rightOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) = 0 := by
  have core := core_antisymmetric a1 ab1 m1 a2 ab2 m2 ha1 hm1 ha2 hm2
  have k : leftOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) + rightOf ω h a1 ab1 m1 a2 ab2 m2 (-ω)
      = vf ω h * (1 + ω) * h * ω *
        ((2 * m2 * a2 - 1) * (m1 * m2 * a1 * ab2 - 1) - (2 * m1 * a1 - 1) * (m1 * m2 * a2 * ab1 - 1)) := by
    simp only [leftOf, rightOf, fact_vb ω h a1 m1 hh, fact_vb ω h a2 m2 hh, fact_energy ω m1 m2 hω]
    grind
  rw [k, core]
  grind

/-- Symmetric channel: block value `ω²` gives `S = (W - i D) / (W + i D) = (w - i) / (w + i)`. -/
-- [helper]
theorem channel_symmetric (ω i h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    (rapW ω i h a1 ab1 m1 a2 ab2 m2 - i * rapD ω i a1 ab1 a2 ab2) * leftOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω)
      = (rapW ω i h a1 ab1 m1 a2 ab2 m2 + i * rapD ω i a1 ab1 a2 ab2) * rightOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω) := by
  have core := core_symmetric ω a1 ab1 m1 a2 ab2 m2 hω ha1 hm1 ha2 hm2
  have s3 : sqrt3 ω i * sqrt3 ω i = 3 := by
    simp only [sqrt3]
    grind
  have is3 := fact_i_sqrt3 ω i hi
  have hw : rapW ω i h a1 ab1 m1 a2 ab2 m2
      = sqrt3 ω i * ((ω * (a1 + ab1) + 2 * m1) * (a2 - ab2) - (ω * (a2 + ab2) + 2 * m2) * (a1 - ab1)) := by
    simp only [rapW, rapDen, fact_rapNum ω i h a1 ab1 m1 hi hh, fact_rapNum ω i h a2 ab2 m2 hi hh]
    grind
  have hd : i * rapD ω i a1 ab1 a2 ab2 = sqrt3 ω i * ((2 * ω + 1) * (a1 - ab1) * (a2 - ab2)) := by
    simp only [rapD, rapDen]
    grind
  have hl : leftOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω)
      = vf ω h * (1 + ω) * h * ω * (ω * (2 * m1 * a1 - 1) - m1 * m2 * a1 * ab2 * (2 * m2 * a2 - 1)) := by
    simp only [leftOf, fact_vb ω h a1 m1 hh, fact_vb ω h a2 m2 hh, fact_energy ω m1 m2 hω]
    grind
  have hr : rightOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω)
      = vf ω h * (1 + ω) * h * ω * (m1 * m2 * a2 * ab1 * (2 * m1 * a1 - 1) - ω * (2 * m2 * a2 - 1)) := by
    simp only [rightOf, fact_vb ω h a1 m1 hh, fact_vb ω h a2 m2 hh, fact_energy ω m1 m2 hω]
    grind
  rw [hw, hd, hl, hr]
  generalize sqrt3 ω i = r at *
  generalize vf ω h * (1 + ω) * h * ω = k
  grind

/-- **Bare U's like-tone S-matrix is Yang's R at the rapidity difference, for every momentum.** The contact block is
`T = keep I + swap P` (line order). The claimed S in line order is `(W P - i D I) / (W + i D)`, i.e. in the particle
frame `P S = (W I - i D P) / (W + i D) = R(W / D)` with `W / D = θ₁ - θ₂`. Without division the defining equation
`left S = right` reads, on the `I` and `P` components of `span {I, P}`:
`left_I (-i D) + left_P W = (W + i D) right_I` and `left_I W + left_P (-i D) = (W + i D) right_P`. -/
theorem thm_line_s_is_yang (ω i h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    let w := rapW ω i h a1 ab1 m1 a2 ab2 m2
    let d := rapD ω i a1 ab1 a2 ab2
    let leftI := leftOf ω h a1 ab1 m1 a2 ab2 m2 (contactKeep ω i h)
    let leftP := vf ω h * vb ω h a1 m1 * contactSwap h
    let rightI := rightOf ω h a1 ab1 m1 a2 ab2 m2 (contactKeep ω i h)
    let rightP := -(vf ω h * vb ω h a2 m2 * contactSwap h)
    leftI * (-(i * d)) + leftP * w = (w + i * d) * rightI ∧
      leftI * w + leftP * (-(i * d)) = (w + i * d) * rightP := by
  intro w d leftI leftP rightI rightP
  have ⟨cs, ca⟩ := fact_contact_channels ω i h hω hi hh
  have sym := channel_symmetric ω i h a1 ab1 m1 a2 ab2 m2 hω hi hh ha1 hm1 ha2 hm2
  have anti := channel_antisymmetric ω h a1 ab1 m1 a2 ab2 m2 hω hh ha1 hm1 ha2 hm2
  -- the channel values are the sum and the difference of the I and P components
  have lsum : leftI + leftP = leftOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω) := by
    simp only [leftI, leftP, leftOf, ← cs]
    grind
  have ldiff : leftI - leftP = leftOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) := by
    simp only [leftI, leftP, leftOf, ← ca]
    grind
  have rsum : rightI + rightP = rightOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω) := by
    simp only [rightI, rightP, rightOf, ← cs]
    grind
  have rdiff : rightI - rightP = rightOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) := by
    simp only [rightI, rightP, rightOf, ← ca]
    grind
  have hw : rapW ω i h a1 ab1 m1 a2 ab2 m2 = w := rfl
  have hd : rapD ω i a1 ab1 a2 ab2 = d := rfl
  rw [← lsum, ← rsum, hw, hd] at sym
  rw [← ldiff, ← rdiff] at anti
  generalize leftI = lI at *
  generalize leftP = lP at *
  generalize rightI = rI at *
  generalize rightP = rP at *
  generalize w = x at *
  generalize d = y at *
  have halve : ∀ z : α, 2 * z = 0 → z = 0 := fun z hz => by
    have e : z = h * (2 * z) := by grind
    rw [e, hz]
    grind
  have eI : lI * -(i * y) + lP * x - (x + i * y) * rI = 0 := halve _ (by grind)
  have eP : lI * x + lP * -(i * y) - (x + i * y) * rP = 0 := halve _ (by grind)
  constructor <;> grind

/-- **Opposite tones reflect totally at every momentum**: with the block `-ω I`, `S = -1` (`left · (-1) = right`). -/
theorem thm_line_opposite_reflects (ω h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    leftOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) * (-1) = rightOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) := by
  have anti := channel_antisymmetric ω h a1 ab1 m1 a2 ab2 m2 hω hh ha1 hm1 ha2 hm2
  generalize leftOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) = l at *
  generalize rightOf ω h a1 ab1 m1 a2 ab2 m2 (-ω) = r at *
  grind

/-- **The identical pair with a spectator** (block `ω²`): `S = (w - i) / (w + i)` at every momentum. -/
theorem thm_line_spectator_symmetric (ω i h a1 ab1 m1 a2 ab2 m2 : α)
    (hω : ω * ω + ω + 1 = 0) (hi : i * i = -1) (hh : 2 * h = 1)
    (ha1 : a1 * ab1 = 1) (hm1 : 2 * m1 * m1 - (a1 + ab1) * m1 + 2 = 0)
    (ha2 : a2 * ab2 = 1) (hm2 : 2 * m2 * m2 - (a2 + ab2) * m2 + 2 = 0) :
    leftOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω) * (rapW ω i h a1 ab1 m1 a2 ab2 m2 - i * rapD ω i a1 ab1 a2 ab2)
      = (rapW ω i h a1 ab1 m1 a2 ab2 m2 + i * rapD ω i a1 ab1 a2 ab2) * rightOf ω h a1 ab1 m1 a2 ab2 m2 (ω * ω) := by
  have sym := channel_symmetric ω i h a1 ab1 m1 a2 ab2 m2 hω hi hh ha1 hm1 ha2 hm2
  rw [← sym]
  grind

end Field

section Braid

/-! Three vibes on a line: words of three letters over any alphabet `β`, amplitudes in a commutative ring with `i`.
The braid form `Ř_j(u)` on positions `j, j + 1`, as numerators (the common denominator `u + i` is a scalar):
like tones keep with `-i` and swap with `u`; opposite tones keep with `-(u + i)` (the `-1` of total reflection times
the denominator). `first` collides (0 1), then (1 2), then (0 1); `second` collides (1 2), (0 1), (1 2), with
rapidity differences `x = θ_a - θ_b` and `y = θ_b - θ_c` (exactly the two orders of E-CMP-0045's yangBaxterDefects). -/

variable {α β : Type} [CommRing α]

def braid0 (tone : β → Bool) (i u : α) (f : β × β × β → α) : β × β × β → α
  | (p, q, r) => if tone p = tone q then u * f (q, p, r) - i * f (p, q, r) else -(u + i) * f (p, q, r)

def braid1 (tone : β → Bool) (i u : α) (f : β × β × β → α) : β × β × β → α
  | (p, q, r) => if tone q = tone r then u * f (p, r, q) - i * f (p, q, r) else -(u + i) * f (p, q, r)

def firstOrder (tone : β → Bool) (i x y : α) (f : β × β × β → α) : β × β × β → α :=
  braid0 tone i y (braid1 tone i (x + y) (braid0 tone i x f))

def secondOrder (tone : β → Bool) (i x y : α) (f : β × β × β → α) : β × β × β → α :=
  braid1 tone i x (braid0 tone i (x + y) (braid1 tone i y f))

/-- **One tone: Yang-Baxter holds identically** in the rapidities, on every word over any alphabet. -/
theorem thm_line_yang_baxter_one_tone (i x y : α) (f : β × β × β → α) (word : β × β × β) :
    firstOrder (fun _ => true) i x y f word = secondOrder (fun _ => true) i x y f word := by
  obtain ⟨p, q, r⟩ := word
  simp only [firstOrder, secondOrder, braid0, braid1, ite_true]
  grind

/-- **A like pair beside an opposite tone: Yang-Baxter fails by exactly `-x y (x + y) (I + P)`** on the word
`(p, q, r)` with `p`, `q` of one tone and `r` of the other. Dividing by the common denominator
`(x + i)(y + i)(x + y + i)`, the defect is `-x y (x + y) / ((x + i)(y + i)(x + y + i))` times `I + P_pq`: zero only when
two rapidities coincide. The identity holds for any value of `i`. -/
theorem thm_line_mixed_tone_defect (tone : β → Bool) (i x y : α) (f : β × β × β → α)
    (p q r : β) (hpq : tone p = tone q) (hqr : tone q ≠ tone r) :
    firstOrder tone i x y f (p, q, r) - secondOrder tone i x y f (p, q, r)
      = -(x * y * (x + y)) * (f (p, q, r) + f (q, p, r)) := by
  simp only [firstOrder, secondOrder, braid0, braid1, hpq, hqr, ite_true, ite_false]
  grind

/-- **The opposite tone between the like pair: every collision reflects and both orders agree.** -/
theorem thm_line_opposite_between_factorizes (tone : β → Bool) (i x y : α) (f : β × β × β → α)
    (p q r : β) (hpr : tone p ≠ tone r) (hrq : tone r ≠ tone q) :
    firstOrder tone i x y f (p, r, q) = secondOrder tone i x y f (p, r, q) := by
  simp only [firstOrder, secondOrder, braid0, braid1, hpr, hrq, ite_false]
  grind

end Braid

end LineScattering

end Vibe
