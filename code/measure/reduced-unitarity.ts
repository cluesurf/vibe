// HOW UNITARY THE REDUCED REGISTER-PAIR CYCLE IS (code/measure/register-reduced), read four ways:
//
//   NORM TRACK          the Gram norm <U^t v | G U^t v> of a state over t cycles, over its start's (the drift)
//   ISOMETRY DEFECT     <U v | G U v> / <v | G v> - 1 for one state v: the diagonal of U^dag G U - G, read on states
//                       localized at one representative, so the defect can be placed on the ball (edge or interior)
//   SPECTRAL RADIUS     power iteration of U on the whole stored space (invariant part and the remainder at
//                       representatives with a stabilizer, which no invariant state has), the growth per cycle of the
//                       plain coefficient norm over a late window: above 1 is an eigenvalue |lambda| > 1
//   INVARIANCE DEFECT   at every representative y fixed by a non-identity h of the sector's group, |rho(h) psi(y) -
//                       psi(y)| over the state's largest block: 0 for an invariant state, the remainder's size otherwise
//
// plus a fingerprint of a sector's tables (SHA-256 of every table's bytes), so a change to the sector builder can be
// shown to leave a sector bit for bit as it was.
//
// DETERMINISM: no random numbers; the power iteration starts from a fixed trigonometric pattern. FLOATS: measurement.

import { createHash } from 'node:crypto'
import {
  applyCubic,
  cloneState,
  newState,
  reducedCycle,
  reducedNorm2,
  scaleState,
  type ReducedEngine,
  type RState,
  type Sector,
} from '@/code/measure/register-reduced'

const SITE = 256
const PAIR = 64

// the momenta whose little groups the fingerprints cover: O_h (K = 0), an axis, two face diagonals, the four body
// diagonals, and a generic direction (the identity alone)
export const PROBE_MOMENTA: readonly (readonly number[])[] = [
  [0, 0, 0, 0],
  [0.1, 0, 0, 0],
  [0.1, 0.1, 0, 0],
  [0.1, -0.1, 0, 0],
  [0.1, 0.1, 0.1, 0],
  [0.1, 0.1, -0.1, 0],
  [0.1, -0.1, 0.1, 0],
  [0.1, -0.1, -0.1, 0],
  [0.029, 0.052, 0.08, 0],
]

// SHA-256 over a sector's representatives, orbits, neighbour tables and point tables, in a fixed order
export function sectorFingerprint(s: Sector): string {
  const h = createHash('sha256')

  h.update(`${s.R} ${s.count} ${s.sites} ${s.members.join(',')}`)

  for (const a of [
    s.reps,
    s.shell,
    s.orbit,
    s.plusRep,
    s.plusG,
    s.minusRep,
    s.minusG,
    s.pointRep,
    s.pointG,
  ]) {
    h.update(new Uint8Array(a.buffer, a.byteOffset, a.byteLength))
  }

  return h.digest('hex')
}

export type NormPoint = { cycle: number; ratio: number }

// the Gram norm at each checkpoint (ascending cycle counts) over the start's, and the state at the last; v is not
// changed
export function normTrack(
  e: ReducedEngine,
  v: RState,
  checkpoints: readonly number[],
  log: (what: string) => void = () => {},
): { points: NormPoint[]; state: RState } {
  const st = cloneState(v)
  const n0 = reducedNorm2(e, st)
  const points: NormPoint[] = []

  let t = 0

  for (const c of checkpoints) {
    while (t < c) {
      reducedCycle(e, st)
      t++
    }

    const ratio = reducedNorm2(e, st) / n0

    points.push({ cycle: c, ratio })
    log(`norm ${c}: ${ratio}`)
  }

  return { points, state: st }
}

// <U v | G U v> / <v | G v> - 1
export function isometryDefect(e: ReducedEngine, v: RState): number {
  const n0 = reducedNorm2(e, v)
  const u = cloneState(v)

  reducedCycle(e, u)

  return reducedNorm2(e, u) / n0 - 1
}

// the non-identity elements (indices into s.members) that fix each representative
export function stabilizers(s: Sector): number[][] {
  const out: number[][] = []

  for (let i = 0; i < s.count; i++) {
    const y = [s.reps[3 * i]!, s.reps[3 * i + 1]!, s.reps[3 * i + 2]!]
    const fix: number[] = []

    s.members.forEach((m, j) => {
      const el = s.group.elements[m]!
      const identity =
        el.perm.join(',') === '0,1,2' && el.sign.join(',') === '1,1,1'

      if (identity) {
        return
      }

      const g = applyCubic(el, y[0]!, y[1]!, y[2]!)

      if (g[0] === y[0] && g[1] === y[1] && g[2] === y[2]) {
        fix.push(j)
      }
    })

    out.push(fix)
  }

  return out
}

// rho(h) of one representative's 256 components (h an index into s.members)
function rhoBlock(
  s: Sector,
  h: number,
  st: RState,
  i: number,
  outRe: Float64Array,
  outIm: Float64Array,
): void {
  const el = s.group.elements[s.members[h]!]!

  for (let t = 0; t < 4; t++) {
    const src = el.src[t]!
    const sgn = el.sgn[t]!

    for (let q = 0; q < PAIR; q++) {
      outRe[t * PAIR + q] = sgn[q]! * st.re[i * SITE + t * PAIR + src[q]!]!
      outIm[t * PAIR + q] = sgn[q]! * st.im[i * SITE + t * PAIR + src[q]!]!
    }
  }
}

// max over fixed representatives and their stabilizers of |rho(h) psi(y) - psi(y)|, over the largest block's norm
export function invarianceDefect(
  s: Sector,
  st: RState,
  stab: number[][] = stabilizers(s),
): number {
  const re = new Float64Array(SITE)
  const im = new Float64Array(SITE)

  let top = 0
  let worst = 0

  for (let i = 0; i < s.count; i++) {
    let n = 0

    for (let k = i * SITE; k < (i + 1) * SITE; k++) {
      n += st.re[k]! ** 2 + st.im[k]! ** 2
    }

    top = Math.max(top, n)

    for (const h of stab[i]!) {
      rhoBlock(s, h, st, i, re, im)

      let d = 0

      for (let k = 0; k < SITE; k++) {
        d +=
          (re[k]! - st.re[i * SITE + k]!) ** 2 +
          (im[k]! - st.im[i * SITE + k]!) ** 2
      }

      worst = Math.max(worst, d)
    }
  }

  return top > 0 ? Math.sqrt(worst / top) : 0
}

// the invariant part: each fixed representative's block averaged over its stabilizer (with the identity)
export function invariantPart(
  s: Sector,
  st: RState,
  stab: number[][] = stabilizers(s),
): RState {
  const out = cloneState(st)
  const re = new Float64Array(SITE)
  const im = new Float64Array(SITE)

  for (let i = 0; i < s.count; i++) {
    const hs = stab[i]!

    if (hs.length === 0) {
      continue
    }

    const sumRe = Float64Array.from(st.re.subarray(i * SITE, (i + 1) * SITE))
    const sumIm = Float64Array.from(st.im.subarray(i * SITE, (i + 1) * SITE))

    for (const h of hs) {
      rhoBlock(s, h, st, i, re, im)

      for (let k = 0; k < SITE; k++) {
        sumRe[k]! += re[k]!
        sumIm[k]! += im[k]!
      }
    }

    for (let k = 0; k < SITE; k++) {
      out.re[i * SITE + k] = sumRe[k]! / (hs.length + 1)
      out.im[i * SITE + k] = sumIm[k]! / (hs.length + 1)
    }
  }

  return out
}

// a fixed pattern on every stored component (not invariant: it has a remainder at every fixed representative)
export function patternState(s: Sector): RState {
  const st = newState(s)

  for (let k = 0; k < st.re.length; k++) {
    st.re[k] = Math.sin(1.3 + 0.7 * k)
    st.im[k] = Math.cos(0.9 + 0.37 * k)
  }

  return st
}

// a state on one representative only: the pattern's block there, made invariant
export function localState(
  s: Sector,
  i: number,
  stab: number[][] = stabilizers(s),
): RState {
  const st = newState(s)

  for (let k = 0; k < SITE; k++) {
    st.re[i * SITE + k] = Math.sin(1.3 + 0.7 * k)
    st.im[i * SITE + k] = Math.cos(0.9 + 0.37 * k)
  }

  return invariantPart(s, st, stab)
}

const plainNorm2 = (st: RState): number => {
  let n = 0

  for (let k = 0; k < st.re.length; k++) {
    n += st.re[k]! ** 2 + st.im[k]! ** 2
  }

  return n
}

export type Radius = {
  radius: number
  // the growth per cycle over each quarter of the run
  quarters: number[]
  cycles: number
  // the iterated state, unit coefficient norm
  state: RState
}

// power iteration of U from `start` (renormalized every cycle in the plain coefficient norm); the radius is the
// geometric mean growth over the last quarter of the cycles
export function spectralRadius(
  e: ReducedEngine,
  start: RState,
  cycles: number,
): Radius {
  const st = cloneState(start)

  scaleState(st, 1 / Math.sqrt(plainNorm2(st)))

  const logs: number[] = []

  for (let t = 0; t < cycles; t++) {
    reducedCycle(e, st)

    const n = plainNorm2(st)

    logs.push(Math.log(n) / 2)
    scaleState(st, 1 / Math.sqrt(n))
  }

  const q = Math.floor(cycles / 4)
  const quarters = [0, 1, 2, 3].map(j => {
    const part = logs.slice(j * q, (j + 1) * q)

    return Math.exp(part.reduce((a, b) => a + b, 0) / part.length)
  })

  return { radius: quarters[3]!, quarters, cycles, state: st }
}
