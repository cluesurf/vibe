# Horava Gravity Bounds Under a Preferred Beat

Depth **L1** (analytical literature mapping onto the discrete step-field and depth-register gravity). Written 2026-11-24 for the advisory board (objections R2-2 and R3).

## 1. What a global beat leaves free

In `E-GRV-0138`, `E-GRV-0139`, and `E-GRV-0141`, sliding unlabeled docks on spatial slices (foliation-preserving diffeomorphisms, `FDiff`) fixes linearized spatial kinetic structure but leaves four dimensionless infrared Horava-Lifshitz parameters free:

- `beta`: sets the tensor graviton speed squared `c_T^2 = 1 / (1 - beta)` in units of light speed `c = 1`.
- `lambda`: coefficient of the trace extrinsic curvature squared `K^2` in DeWitt's kinetic term (`lambda = 1` in general relativity).
- `alpha`: coefficient of the spatial acceleration term `a_i a^i` (`a_i = partial_i ln N`, the lapse gradient).
- `eta` (often written `alpha_1, alpha_2` in PPN): preferred-frame couplings governing solar-system and binary-pulsar Lorentz violations.

General relativity fixes `(alpha, beta, lambda - 1) = (0, 0, 0)` only when full 4d spacetime diffeomorphisms hold (sliding time differently by place, `E-GRV-0141`). Under a global beat without a proved slice-invariance theorem, `(alpha, beta, lambda)` are free constants of the low-energy action, and an extra scalar graviton mode propagates with speed `c_S^2 = ((lambda - 1) / (1 - 3 lambda)) * ((2 - alpha) / alpha - (1 - beta))` (for `beta ~ 0`, `c_S^2 ~ (lambda - 1) (2 - alpha) / (alpha (1 - 3 lambda))`).

## 2. Observational bounds (Gumrukcuoglu, Saravani, Sotiriou 2018; GW170817; PPN)

Every bound below assumes the khronon / global-beat foliation exists in the infrared:

| parameter or combination | observational source | bound | implication for Vibe |
| --- | --- | --- | --- |
| `|c_T - 1|` (hence `|beta|`) | GW170817 + GRB 170817A (`1.7 s` over `40 Mpc`) | `-3e-15 <= c_T - 1 <= +7e-16` (`|beta| <= 6e-15`) | Sets `beta = 0` to `10^-15`. In `E-GRV-0104`, the step field's speed matches `c` only because `kappa` was chosen to match light, not derived. |
| `alpha_1 = 4 (alpha - 2 beta) / (1 - beta)` | Lunar laser ranging + binary pulsars (PSR J1738+0333) | `|alpha_1| <= 1e-4` (with `beta ~ 0`: `|alpha| <= 2.5e-5`) | Forces the lapse-gradient coupling `alpha` to be tuned below `2.5e-5` unless a symmetry suppresses it. |
| `alpha_2` (at `beta ~ 0`) | Solar spin-axis alignment + solitary millisecond pulsars | `|alpha_2| <= 2e-7` (for `alpha ~ 2 (lambda - 1)`) or `|lambda - 1| <= O(10^-7)` outside the tuning line | Either `|lambda - 1| <= 10^-7` or `alpha` and `lambda - 1` must track the fine-tuned cancellation `alpha_2 = 0`. |
| `|G_cosmo / G_N - 1| = |(3 lambda - 1) / (2 - alpha) - 1|` | Big Bang Nucleosynthesis (BBN) | `|G_cosmo / G_N - 1| <= 0.1` (`|lambda - 1| <= 0.07`) | Far weaker than the PPN `alpha_2` bound once `beta` is fixed by GW170817. |
| Scalar graviton stability (`c_S^2 > 0`, no ghost) | Ghost-free + gradient stability | `0 < alpha < 2` and `lambda > 1` (or `lambda < 1/3`), plus Cherenkov bound `c_S >= 1 - O(10^-15)` | With `|alpha| <= 2.5e-5`, requiring `c_S >= 1` forces `0 < lambda - 1 >= alpha / 2` while PPN requires `|lambda - 1|` tiny, squeezing `(alpha, lambda - 1)` into a narrow wedge `<= 10^-5`. |

## 3. Mapping onto Vibe's current model

1. **Step field and depth register**: On the flat box, `E-GRV-0104` sets the step field's propagation speed by choosing `kappa` to match the husk photon speed, which tunes `beta = 0` by hand rather than deriving it. No symmetry of the current working rule forces `alpha = 0` or `lambda = 1` on the honeycomb.
2. **The board's decision (one state on any slice)**: The decision replaces a preferred global beat with "one state on any slice inside the stream's cone, no slice preferred". If the adopted rule on the honeycomb produces a low-energy emergent Lorentz symmetry (Family 6), then full spacetime slide invariance (`E-GRV-0141`) is restored in the continuum limit and `(alpha, beta, lambda - 1) -> (0, 0, 0)` automatically, avoiding the `10^-15` / `10^-7` Horava tuning. Until the board's gap passes on the honeycomb, `c_T = c` and `lambda = 1` remain unproved.
3. **Paper status check (`0017-the-vibe-theory-model`)**: Verified on 2026-11-24 that `text/00-scope.tex` (lines 35 to 37) and `text/04-gravity.tex` (lines 55 to 58) have already withdrawn the claim that `c_T = c` and `lambda = 1` are solved, explicitly stating that both remain free constants until slice-independence is demonstrated on the adopted rule.
