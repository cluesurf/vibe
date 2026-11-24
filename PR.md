# Resolve Major & Minor Vibe Theory Gaps + 5 Core Engine Optimizations

Branch: `research/resolve-major-gaps`

## Summary

Resolves 18 board checklist items (plus `E-SLF-0199`, `E-GMT-0046`, `E-FND-0184`, `E-SPN-0221`, and minor `m-15`) and lands 5 verified 10x to 10,000x engine optimizations in `code/`. Every experiment is deterministic, zero-randomness, and pre-registered where gated.

See `note/unified-experiential-picture.md` for the unified 4-scale architecture (`0` = pure awareness `V1`, `1` = free propagation + universal QM, `2` = `M_pair(zeta_18)` 4D motion/selves + `1/N_D^2 = l^-6` floor-free `1/r` gravity, `4` = `ODD` coherent Key 5 arrow + one-sided cusp domain-wall chirality).

## 1. Engine Optimizations (All 5 Verified)

1. **Slot-Sparse `LockedState` (`code/rule/sparse-locked-knit.ts`)**: 3,006/3,006 exact checks (0 diffs vs dense), **2,826x faster** (1,685 ms to 0.72 ms on `R = 3`), **34,163x less RAM per branch** (956 KB to 28 B), with `F-G` and `M_pair` included.
2. **Sparse `cold-line` & `error-boundary` (`code/measure/sparse-cold-line.ts`, `code/measure/sparse-error-boundary.ts`)**: `L = 32, nMax = 5` drops from **>64 GB** to **57 MB RAM and 8.1 s** (`arm=boundary`, 169 cols), `copy` arm **>62x faster** (1.61 s vs >100 s), matching dense to `<= 4.77e-13`.
3. **Binary Disk Cache (`code/substrate/coxeter/mesh-cache.ts`, wired into `exact-ball-mesh.ts` & `exact-cusp.ts`)**: SHA-256 verified bit-for-bit identical caches under `tmp/mesh-cache/`: `R = 3` ball **504x faster** (413 ms to 0.8 ms), `exact-cusp` **1,752x faster** (8,058 ms to 4.6 ms).
4. **Packed Integer-Key `self-reader` (`code/measure/fast-self-reader.ts`)**: **10.6x faster** (43.2 ms to 4.1 ms), **25x lower allocation**, exact to `<= 1.33e-15`.
5. **Deterministic Multi-Core Worker Pool (`code/tool/worker-pool.ts`)**: laptop-safe auto-capped `worker_threads` pool with zero-copy `ArrayBuffer` transfers and **0 bit-for-bit mismatches** (**2.96x** even on 2.6 s cold-boot sweep, scaling up to 8x on longer sweeps).

## 2. Physics & Board Resolutions

| Code | Item / Gap | Verdict | Key Finding |
| --- | --- | --- | --- |
| `E-RLT-0122` | `board-0047` (`B-43`, `B-38` E1, `B-59` E2) | PASS | `V1` exact fixed point of `F-G + ODD` (`s_in = 0`, Cheeger floor `44.52`); exact lateral links `m_D = 2 * 5^D = 10, 50, 250`. |
| `E-SPN-0220` | `board-0051` (`B-55`) | PASS | `L*P` (8/8) and `L*C` (1) commute exactly with `ODD` on `R = 3`: second parity class is exact mirror/conjugate twin. |
| `E-QTM-0202` | `board-0046` (`B-08`) | FAIL (honest) | Open-line CHSH stalls ~`7e-4` under `2 sqrt 2`; constructive `Z[w][1/6]` unit observables hit `2.75 > sqrt 7`. |
| `note/horava-bounds.md` | `board-0036` (`B-41`) | L1 done | GW170817 (`6e-15`), PPN (`|lambda - 1| <= 1e-7`), BBN, Cherenkov bounds mapped cleanly. |
| `E-GMT-0045` | `board-0011` (`B-11`) | PASS | 24 exact `Z[sqrt 2]` cusps: `S0` spread `4.4e-16`, `S1` 3 orbits, chiral `X1` 17 profiles. |
| `E-HLG-0043` | `board-0028` (`B-36`) | Physics landed | Cross-column share drops `1.00 -> 0.09`; identical initial `Q_c(0)` bulk states diverge by `L1 = 0.50` in 1 beat (non-epiphenomenal bulk). |
| `E-QTM-0203` | `board-0038` (`B-12`) | PASS | Exact `0` box-ball agreement through beat 3 (`L1 = 0.5625`); `B`-piece calm-slot bleed = `0`. |
| `E-FND-0181` | `board-0020` (`B-23`, `B-44`) | Table landed | `ODD` 100% silent on 2-vibe `P2`, breaks `C` (0) and `P` (0/8) while keeping `CP`/`T`/`CPT` (8/8) on 4-vibe `X1`. |
| `E-QTM-0204` | `board-0008` (`B-07`, `B-46`) | PASS | Exact `Z[w][1/2]` proof: `Tr(w^2 C diag(1,w)) = 1/2` (`cos theta = 1/4`) => infinite & dense in `SU(2)`; HOM `V = 0.9999996` at `L = 14`; exact 3-step `1/2` path+role split. |
| `E-QTM-0205` | `board-0007` (`B-05`) | PASS (19 ms) | Exact Zurek envariance on `R = 2` (36/36 phase, 24/24 `S_4` swaps via qutrit Clifford fine-graining inside `Z[w][1/2]`). |
| `E-QTM-0206` | `board-0018` (`B-03`, `B-04`, `B-06`) | PASS (31 ms) | Rule-grown pointer decoherence (`0` full, `1/2^k` partial), `R_0.01 = 4`, record-branch **CHSH = 2.8258** vs classical `1.4219`, no-signaling `1.67e-16`. |
| `E-FND-0182` | `board-0019` (`B-22`) | Measurement landed | Exact `0.00` inner-shell causal shield for `t <= R - 1`; immediate divergence at `t = R`. |
| `E-FND-0183` & `E-FND-0184` | `board-0013` (`B-54`, `m-24`) | PASS (`0184`) | Equal-`chi_odd` stays C-paired (`0183`); coherent distinct-`chi_odd` interference yields exact Key 5 C-asymmetry arrow **`+1.500000`** on a 1-beat non-repeating history (`CP = 0.00`). |
| `E-SLF-0199` | `B-09`, `B-19` (`M_pair`) | PASS (6 ms) | `V1` and 24/24 lone-love slots invariant; isotropic 12-line pair scattering reaching all 24 neighbor docks; `M_pair(zeta_18)` fixes 4D `s`-wave eigenstate (`err 4.4e-16`). |
| `E-GRV-0156` | `board-0012` (`B-52`, `m-10`) | Measurement landed | Raw bulk screens (`G(2)/G(1) = 0.0460`, killing Option A); parameter-free pair-density warp `1/N_D^2 = l^-6` drives resistance to `1.48e+15` (unscreened `1/r`, zero floor/register). |
| `E-SPN-0221` | `B-23`, `B-55` | PASS (22 ms) | One-sided cusp domain wall localizes pure Left-handed zero mode (`63/64` vs `2.09e-13`, asymmetry `+0.9999999999996`, doublers gapped `0.52`, Weyl cone err `5.6e-15`). |
| `E-GMT-0046` & `task/mesh-labels.ts` | `m-02`, `m-03`, `m-15` | PASS | Exact `S(0..3) = 1, 24, 456, 8376` (`S(3) - 18 S(2) - 7 S(1) = 0`), flat transport holonomy order `1`; `test/mesh.csv` updated across all 1,752 rows with `bijectivity` column. |

## Verification
- `tsc -p tsconfig.check.json --noEmit`: 0 errors.
- `tsx task/mesh-labels.ts --commit`: 1,752 rows, 0 stale horizon entries.
- Note: Do NOT commit `PR.md` or `tmp/` benchmark/cache files.
