// THREE LIKE-TONE REGISTER HOLES BOUND AT CONTACT, BOOSTED (E-SPN-0193, moving-matter item 0004, OPEN-MAT-01). The many-hole
// engine of E-FND-0161 (code/measure/register-holes) runs three holes of one sea in one half on the L = 4 D4 torus under
// E-SPN-0175's sector pieces. This module adds what the motion read needs and nothing else:
//
//   ruleSetup        the register rule's one-body pieces and the pair angles (E-SPN-0175's couplings, or the contact alone)
//   twistedTorus     the torus with every Bloch momentum shifted by delta: each hole sees the boundary twist delta, so the
//                    three holes carry total momentum K = 3 delta + a grid momentum. The pair piece is diagonal in the
//                    relative sites and periodic there, so it is unchanged; only the one-body beats are evaluated at the
//                    shifted momenta. This is what lets K take any value on the one box the engine holds
//   contactStart     the three holes on one site, all in the beat-1 sector, antisymmetric in the fiber (the sector states
//                    0, 1, 2 of half +: one state of Lambda^3 of the half, which is J = 1/2 by E-SPN-0192), at the frame's
//                    total momentum: the composite created at contact and boosted by e^(i K . X)
//   sectorContact    the weight with all three holes in the sector, and the part of it with all three on one site
//   filtered         sum_t w(t) e^(i E0 t) U^t psi0 over a Hann window: the projection of the start onto the levels near
//                    E0 (U b = e^(-i E) b), and the autocorrelation and contact series of the run that made it
//   rayleigh         E = -arg <phi|U phi> / <phi|phi> and the purity |<phi|U phi>| / <phi|phi> (1 for an eigenvector)
//   lineSpectrum     |sum_t w(t) e^(i E t) c(t)| on a grid of E: the start's lines
//
// DETERMINISM: no random numbers. FLOATS are measurement on the exact pieces, as in register-holes.

import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { type CMatrix } from '@/code/measure/dock-mixer'
import { type Torus } from '@/code/measure/register-sea'
import {
  holeCycle,
  holeNorm,
  lineScratch,
  newHoles,
  pairAngles,
  toSites,
  type HoleEngine,
  type HoleFrame,
  type HoleRule,
  type Holes,
} from '@/code/measure/register-holes'

export const LIGHT: readonly [number, number] = [-1, 4]
export const STRING: readonly [number, number] = [-2, 1]
export const VERTEX: readonly [number, number] = [2, 0]
export const CAP = 8

export type Coupling = 'rule' | 'contact' | 'free'

export function ruleSetup(): { Ps: CMatrix[]; sAng: number; vAng: number } {
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)

  return {
    Ps: [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])],
    sAng: unitAngle(ringUnit(STRING[0], STRING[1])),
    vAng: unitAngle(ringUnit(VERTEX[0], VERTEX[1])),
  }
}

// the pair angle table of a coupling: E-SPN-0175's string and contact, the contact alone, or none (the free rule)
export function couplingRule(t: Torus, c: Coupling): HoleRule {
  const { sAng, vAng } = ruleSetup()

  if (c === 'free') {
    return { angle: null }
  }

  return { angle: pairAngles(t, c === 'rule' ? -sAng : 0, CAP, -2 * vAng) }
}

export function twistedTorus(t: Torus, delta: readonly number[]): Torus {
  const step = (2 * Math.PI) / t.L

  if (delta.some(x => Math.abs(x) >= step / 2)) {
    throw new Error('three-member-motion: the twist must stay inside half a grid step')
  }

  return { ...t, momenta: t.momenta.map(q => q.map((x, i) => x + delta[i]!)) }
}

const SIGNS: readonly (readonly [number, number, number, number])[] = [
  [0, 1, 2, 1],
  [1, 2, 0, 1],
  [2, 0, 1, 1],
  [0, 2, 1, -1],
  [2, 1, 0, -1],
  [1, 0, 2, -1],
]

export function contactStart(fr: HoleFrame, total = 0): Holes {
  const s = newHoles(fr, 3, total)
  const N = fr.fourier.N
  const f = fr.fiber
  const block = f ** 3
  const a = 1 / (N * Math.sqrt(6))

  for (let T = 0; T < N * N; T++) {
    for (const [b0, b1, b2, sg] of SIGNS) {
      s.re[T * block + (b0 * f + b1) * f + b2] = sg * a
    }
  }

  return s
}

// the weight with all three in the sector, and with all three in the sector on one site (relative sites 0, 0)
export function sectorContact(fr: HoleFrame, s: Holes): { sector: number; contact: number } {
  const F = fr.fourier
  const N = F.N
  const f = fr.fiber
  const block = f ** 3
  const sc = lineScratch(F)
  const lr = new Float64Array(N)
  const li = new Float64Array(N)
  const br = new Float64Array(N * N)
  const bi = new Float64Array(N * N)
  const o = fr.t.origin

  let sector = 0
  let contact = 0

  for (let b0 = 0; b0 < f; b0++) {
    for (let b1 = 0; b1 < f; b1++) {
      for (let b2 = 0; b2 < f; b2++) {
        if (!fr.sector[b0] || !fr.sector[b1] || !fr.sector[b2]) {
          continue
        }

        const fb = (b0 * f + b1) * f + b2

        for (let T = 0; T < N * N; T++) {
          br[T] = s.re[T * block + fb]!
          bi[T] = s.im[T * block + fb]!
          sector += br[T]! ** 2 + bi[T]! ** 2
        }

        // member 1's axis (inner) at every member-0 class, then member 0's axis at member 1's origin only
        for (let j0 = 0; j0 < N; j0++) {
          for (let j1 = 0; j1 < N; j1++) {
            lr[j1] = br[j0 * N + j1]!
            li[j1] = bi[j0 * N + j1]!
          }

          toSites(F, lr, li, sc)
          br[j0 * N + o] = lr[o]!
          bi[j0 * N + o] = li[o]!
        }

        for (let j0 = 0; j0 < N; j0++) {
          lr[j0] = br[j0 * N + o]!
          li[j0] = bi[j0 * N + o]!
        }

        toSites(F, lr, li, sc)
        contact += lr[o]! ** 2 + li[o]! ** 2
      }
    }
  }

  return { sector, contact }
}

const dotHoles = (a: Holes, b: Holes): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    i += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [r, i]
}

export const hann = (t: number, T: number): number =>
  0.5 - 0.5 * Math.cos((2 * Math.PI * (t + 0.5)) / T)

export type Filtered = {
  phi: Holes
  // the autocorrelation <psi0|U^t psi0>, t = 0 .. T - 1
  cRe: Float64Array
  cIm: Float64Array
  // the contact share (contact over sector) and the absolute contact weight at the read cycles
  reads: { cycle: number; share: number; contact: number }[]
  normDrift: number
  seconds: number
}

// run T cycles from psi0 (left unchanged), accumulating the Hann-filtered projection at E0 (null: no filter, the run and
// its reads only); reads every `every` cycles
export function filtered(
  e: HoleEngine,
  rule: HoleRule,
  psi0: Holes,
  T: number,
  E0: number | null,
  every: number,
): Filtered {
  const started = Date.now()
  const s: Holes = { ...psi0, re: Float64Array.from(psi0.re), im: Float64Array.from(psi0.im) }
  const phi: Holes = { ...psi0, re: new Float64Array(psi0.re.length), im: new Float64Array(psi0.re.length) }
  const cRe = new Float64Array(T)
  const cIm = new Float64Array(T)
  const reads: Filtered['reads'] = []
  let normDrift = 0

  for (let t = 0; t < T; t++) {
    if (t > 0) {
      holeCycle(e, rule, s)
    }

    const [cr, ci] = dotHoles(psi0, s)

    cRe[t] = cr
    cIm[t] = ci

    if (E0 !== null) {
      const w = hann(t, T)
      const c = w * Math.cos(E0 * t)
      const sn = w * Math.sin(E0 * t)

      for (let k = 0; k < s.re.length; k++) {
        const xr = s.re[k]!
        const xi = s.im[k]!

        phi.re[k]! += c * xr - sn * xi
        phi.im[k]! += c * xi + sn * xr
      }
    }

    if (t % every === 0 || t === T - 1) {
      const sc = sectorContact(e.frame, s)

      reads.push({ cycle: t, share: sc.contact / sc.sector, contact: sc.contact })
      normDrift = Math.max(normDrift, Math.abs(holeNorm(s) - 1))
    }
  }

  return { phi, cRe, cIm, reads, normDrift, seconds: (Date.now() - started) / 1000 }
}

export function rayleigh(
  e: HoleEngine,
  rule: HoleRule,
  phi: Holes,
): { E: number; purity: number; norm: number } {
  const u: Holes = { ...phi, re: Float64Array.from(phi.re), im: Float64Array.from(phi.im) }

  holeCycle(e, rule, u)

  const [r, i] = dotHoles(phi, u)
  const n = holeNorm(phi)

  return { E: -Math.atan2(i, r), purity: Math.hypot(r, i) / n, norm: n }
}

// |sum_t w(t) e^(i E t) c(t)| / sum_t w(t) on the grid E = 2 pi k / M, k = 0 .. M - 1
export function lineSpectrum(cRe: Float64Array, cIm: Float64Array, M: number): Float64Array {
  const T = cRe.length
  const out = new Float64Array(M)
  let W = 0

  for (let t = 0; t < T; t++) {
    W += hann(t, T)
  }

  for (let k = 0; k < M; k++) {
    const E = (2 * Math.PI * k) / M
    let r = 0
    let i = 0

    for (let t = 0; t < T; t++) {
      const w = hann(t, T)
      const c = Math.cos(E * t)
      const sn = Math.sin(E * t)

      r += w * (c * cRe[t]! - sn * cIm[t]!)
      i += w * (c * cIm[t]! + sn * cRe[t]!)
    }

    out[k] = Math.hypot(r, i) / W
  }

  return out
}

// the strongest lines of a spectrum: local maxima above `floor`, strongest first
export function strongestLines(spec: Float64Array, count: number, floor = 0): { E: number; height: number }[] {
  const M = spec.length
  const peaks: { E: number; height: number }[] = []

  for (let k = 0; k < M; k++) {
    const h = spec[k]!

    if (h > floor && h >= spec[(k + M - 1) % M]! && h > spec[(k + 1) % M]!) {
      peaks.push({ E: (2 * Math.PI * k) / M, height: h })
    }
  }

  return peaks.sort((a, b) => b.height - a.height).slice(0, count)
}

// the Hann sum, the filter's gain at its own line: phi = W P psi0 for an exact line at E0
export function hannSum(T: number): number {
  let W = 0

  for (let t = 0; t < T; t++) {
    W += hann(t, T)
  }

  return W
}
