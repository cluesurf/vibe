import Vibe.Tone
import Vibe.Algebra
import Vibe.Rule
import Vibe.Geometry
import Vibe.Gauge
import Vibe.Limits

/-!
# Vibe Theory: Formal Lean 4 Proof Suite

Root aggregator re-exporting all six zero-dependency Lean 4 proof modules:
- `Vibe.Tone`: Signed ternary state `{-1, 0, +1}`, 24-slot `DockState`, calm vacuum `v1Dock`, charge conjugation `conjDock`
- `Vibe.Algebra`: Exact rings `ℤ[ω]`, `ℤ[ζ_9]`, `Mat2Eis`, involutive `StarCommRing`, cyclotomic `ℤ[ζ_9]` gap cubic
- `Vibe.Rule`: Concrete `V1` & 1-hop light-cone theorems, exact gate unitarity (including full `8 × 8` `F-G`), 2-adic `SU(2)` density, symbolic `M_pair(u)`
- `Vibe.Geometry`: Warped `{3,4,3,4}` cusp resistance divergence, subluminal Rayleigh quotients, explicit 24-root `D_4` rank-4 `SO(4)` isotropy, triangular plaquettes, and infinite-volume site-hyperplane reflection positivity
- `Vibe.Gauge`: Textbook `Spin(10)` 16-spinor anomalies, Weinberg `3/8`, Koide `3 × 3` warp lower bound, electroweak `m_γ = 0` & custodial `ρ = 1`, Pati-Salam trace matching, `Z_2` matter parity, and color-weight axion `E/N = 8/3`
- `Vibe.Limits`: Concrete `3 × 3` `Z_3` transfer-matrix spectral gap, `Z_N` modular PQ operator-dimension lower bound, arbitrary-word `Mat2Eis` unitarity closure, and explicit `B^T B` Gram reflection positivity

Zero `sorry`, zero `axiom`, zero `native_decide`, zero external packages, machine-checked by Lean `4.35.0`.
-/

set_option autoImplicit false
