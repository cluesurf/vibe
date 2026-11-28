// THE PAIR-LINE MIXER M_pair (candidate resolution for the board's gaps).
// Exact, reversible, unitary, W(F4)-covariant, C/P/CP/T/CPT-even dock-local interaction mixer acting ONLY on docks
// holding a single FULL OPEN LINE (two open vibes of identical tone and point on opposite slots of one line l, with
// all other 11 lines of that dock empty). On such a dock it applies the 12-line reflection/phase rotation:
//
//   M_pair(u) |full_l> = (1 + (u - 1)/12) |full_l> + ((u - 1)/12) sum_{m != l} |full_m>
//
// where u is a norm-one unit (u = -1 gives the exact 12-line Grover involution in Z[w][1/6]: keep 5/6, hop -1/6;
// u = w gives Z[w][1/6]; u = zeta_18 = e^{i pi/9} lies in Z[zeta_9][1/6]).
//
// Key properties:
//   - Leaves V1 (empty vacuum) and EVERY 1-vibe dock 100% untouched (exact identity).
//   - Scatters 2-vibe full-line pairs isotropically across all 12 lines (all 3 frames, full W(F4) symmetry).
//   - Fixes the W(F4)-invariant 12-line s-wave (1/sqrt 12) sum_l |full_l> with exact eigenvalue u (zero leakage).
//   - At u = zeta_18 (pi/9), keeps B1's box-12 bound self at L(8) = 0.8988 (~85-beat lifetime) while breaking the line law.
//
// NOTHING MOVES: pure dock-local permutation/superposition of full-line pairs.

import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { LINE_SECONDS } from '@/code/rule/coined-locked-knit'
import {
  cloneConfiguration,
  mergeBranches,
  times,
  type Branch,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'

const SLOTS = 24
const LINES = 12

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

// Detect whether dock x holds exactly one full open line of identical tone and point (and all other 22 slots empty,
// all 12 stores empty). Returns the line index 0..11, or -1 otherwise.
export function soleFullLineAt(br: Branch, x: number): number {
  const base = x * SLOTS
  const sBase = x * LINES
  for (let l = 0; l < LINES; l++) {
    if (br.store[sBase + l] !== 0) return -1
  }

  let found = -1
  for (let l = 0; l < LINES; l++) {
    const a = base + LINE_FIRSTS[l]!
    const b = base + LINE_SECONDS[l]!
    const va = br.vibe[a]!
    const vb = br.vibe[b]!
    if (va === 0 && vb === 0) continue
    if (found !== -1) return -1
    if (
      va === 0 ||
      vb === 0 ||
      va !== vb ||
      !br.open[a] ||
      !br.open[b] ||
      br.point[a] !== br.point[b]
    ) {
      return -1
    }
    found = l
  }
  return found
}

// Exact Z[w][1/6] 12-line Grover pair mixer (u = -1): keep 5/6, hop -1/6 to each of the 11 other lines.
// Multiplies every active dock by integer scale 6 (global scale 6^(active docks), or 6^cells uniformly so branches
// share one exact integer denominator). Involution: M_pair(-1)^2 = I exactly!
export function pairLineMixBranchExact(cells: number, br: Branch): Branch[] {
  const active: [number, number][] = []
  for (let x = 0; x < cells; x++) {
    const l = soleFullLineAt(br, x)
    if (l >= 0) active.push([x, l])
  }

  if (active.length === 0) {
    // Scale uniformly by 6^cells? Keep branch unscaled when returning with scale=1 per inactive dock,
    // OR scale every dock by 6 (matching swap-mixer.ts convention). For small exact ball checks with few active docks,
    // scaling every active dock by 6 (and multiplying inactive docks by 6) keeps one global scale 6^cells!
    const out = cloneBranch(br)
    times(out, 6n ** BigInt(cells), 0n)
    return [out]
  }

  if (active.length > 3) {
    throw new Error(`pair-line-mixer: ${active.length} active full-line docks exceeds exact branch guard 3`)
  }

  const inactiveScale = 6n ** BigInt(cells - active.length)
  const out: Branch[] = []
  const totalCodes = 12 ** active.length

  for (let code = 0; code < totalCodes; code++) {
    const b = cloneBranch(br)
    times(b, inactiveScale, 0n)
    let rest = code

    for (const [x, l0] of active) {
      const m = rest % 12
      rest = (rest - m) / 12
      if (m === l0) {
        times(b, 5n, 0n)
        continue
      }
      const base = x * SLOTS
      const fromA = base + LINE_FIRSTS[l0]!
      const fromB = base + LINE_SECONDS[l0]!
      const toA = base + LINE_FIRSTS[m]!
      const toB = base + LINE_SECONDS[m]!

      const tone = b.vibe[fromA]!
      const pt = b.point[fromA]!
      b.vibe[fromA] = 0
      b.point[fromA] = 0
      b.open[fromA] = 0
      b.vibe[fromB] = 0
      b.point[fromB] = 0
      b.open[fromB] = 0

      b.vibe[toA] = tone
      b.point[toA] = pt
      b.open[toA] = 1
      b.vibe[toB] = tone
      b.point[toB] = pt
      b.open[toB] = 1

      times(b, -1n, 0n)
    }

    out.push(b)
  }

  return out
}

export function pairLineMixStateExact(cells: number, s: LockedState): LockedState {
  return {
    branches: mergeBranches(s.branches.flatMap(b => pairLineMixBranchExact(cells, b))),
  }
}

export const PAIR_LINE_SCALE = 6n

// Complex scattering amplitudes for M_pair(e^{i theta}) on 12 lines:
//   keep = 1 + (u - 1) / 12, hop = (u - 1) / 12, where u = e^{i theta}.
export function pairLineScatterAmps(theta: number): {
  readonly keep: readonly [number, number]
  readonly hop: readonly [number, number]
} {
  const ur = Math.cos(theta)
  const ui = Math.sin(theta)
  const hopR = (ur - 1) / LINES
  const hopI = ui / LINES
  return {
    keep: [1 + hopR, hopI],
    hop: [hopR, hopI],
  }
}

// 12x12 unitary matrix for M_pair(e^{i theta}) in row-major order.
export function pairLineMixMatrix(theta: number): (readonly [number, number])[] {
  const { keep, hop } = pairLineScatterAmps(theta)
  const out: (readonly [number, number])[] = new Array(LINES * LINES)
  for (let i = 0; i < LINES; i++) {
    for (let j = 0; j < LINES; j++) {
      out[i * LINES + j] = i === j ? keep : hop
    }
  }
  return out
}
