// A HOLDING MAP FOR THREE HOLES ON THE SLAB (E-SPN-0139): the Klein-gap criterion for when a string-bound composite of
// Dirac-walk holes holds under the frame mixer, and a bag beat whose mixer angle is set by the string.
//
// THE KLEIN GAP (derived; code/measure/slab-holes is the beat). On one line a hole is a Dirac walk of mass m0 = pi/3:
// cos w = cos(m0) cos k, so its quasi-energy bands are 60 deg wide and the two gaps between them 2 m0 = 120 deg wide.
// The frame mixer multiplies the dock's uniform slot mode by e^(-i theta) and nothing else. At K = 0 the uniform mode
// is a sum of the two lines' band-edge states, so it is lifted theta INTO the gap and every other state stays; at K
// away from 0 the uniform mode is shared with the moving states and lifted less. So the smallest gap of a lone hole in
// the slab is 2 pi/3 - theta (tmp/holdmap-probe1.log, the 4 x 4 Bloch beat on a 48 x 48 K grid: 105.5 deg at theta
// 14.36 deg, 90.5 at 28.96, 59.5 at 60, closed at the working 120), a Dirac mass m(theta) = pi/3 - theta/2 that
// vanishes at the working angle.
//
// A phase potential of slope sigma (the string at pi/N a link, N = 2 D + 1) does not bind a Dirac particle: every level
// is a resonance, emptied by Landau-Zener (Schwinger) passage through the gap, weight exp(-pi m^2/sigma) = exp(-N m^2)
// per passage. E-SPN-0113's reading: a level is held only when that leak is under the tail the reading allows,
// N m(theta)^2 >= ln(1/tail). No constant is fitted: at theta = 0 it is E-SPN-0113's N >= 6.30 at n = 1.
//
// THE BAG (E-SPN-0108's scalar potential; E-SPN-0109's 'touch' reading moved to the three-body string). The mixer's
// angle on a hole is `inside` when the configuration's route-free string is nonzero (V > 0: the Steiner tree reaches
// every member's dock, so it passes every hole) and `outside` when V = 0. A lone hole (one hole, V = 0 always) keeps
// the outside angle exactly, so it moves as E-SPN-0130's free hole does, while a composite's members see the inside
// angle, the larger Dirac mass m(inside). The piece is diagonal in positions and unitary on each dock's slots, so it is
// a controlled unitary on configurations it does not change: exact, reversible, and nothing stored. A stand-in: in the
// rule a lone hole in the sea carries a Z3 charge and drags a string (E-SPN-0109), which the three-body window omits.
//
// Floats, as measurement. DETERMINISM: no random numbers. NOTHING MOVES: the mixer hands values between one dock's
// slots, the stream takes each value one dock along.

import { type Ritz } from '@/code/measure/frame-meson'
import {
  antisymmetryGap,
  emptyState,
  innerSlab,
  offLineSlab,
  slabBeat,
  steinerShells,
  thetaOfRate,
  weightOfSlab,
  type SlabHold,
  type SlabSpace,
  type SlabState,
  type SlabTally,
} from '@/code/measure/slab-holes'

type C = [number, number]

// the lone hole's one-line Dirac mass, the half gap
export const LINE_MASS = Math.PI / 3

// the smallest gap of a lone hole in the slab at mixer angle theta, and its Dirac mass
export const kleinGap = (theta: number): number =>
  Math.max(0, (2 * Math.PI) / 3 - theta)
export const kleinMass = (theta: number): number => kleinGap(theta) / 2

// pi m^2 / sigma with sigma = pi / N
export const schwingerExponent = (N: number, theta: number): number =>
  N * kleinMass(theta) ** 2

// the Klein-gap prediction for a grid point: held iff the exponent reaches ln(1/tail); `margin` the exponent over that
export function kleinPrediction(
  D: number,
  rate: number,
  tail: number,
): { exponent: number; margin: number; held: boolean } {
  const exponent = schwingerExponent(2 * D + 1, thetaOfRate(rate))
  const margin = exponent / Math.log(1 / tail)

  return { exponent, margin, held: margin >= 1 }
}

// a beat at momentum K, in place of s's content where it likes; returns the new state
export type SlabStep = (
  K: readonly number[],
  s: SlabState,
  tally: SlabTally,
) => SlabState

export const freeStep =
  (space: SlabSpace): SlabStep =>
  (K, s, tally) =>
    slabBeat(space, K, s, tally)

// the bag beat: the mixer at rate `inside` on every hole of a configuration with V > 0 and `outside` where V = 0, then
// code/measure/slab-holes slabBeat with the mixer off (the coin, the cost and contact, the stream). With inside ===
// outside it is slabBeat at that rate operation for operation.
export function bagStep(
  space: SlabSpace,
  inside: number,
  outside: number,
): SlabStep {
  const { slots, block, configs } = space
  const n = space.spec.holes
  const rest: SlabSpace = { ...space, spec: { ...space.spec, rate: 0 } }

  const z = (rate: number): C => {
    const theta = thetaOfRate(rate)

    return [(Math.cos(theta) - 1) / slots, -Math.sin(theta) / slots]
  }

  const zIn = z(inside)
  const zOut = z(outside)

  return (K, s, tally) => {
    const { re, im } = s

    for (let i = 0; i < n; i++) {
      const stride = slots ** (n - 1 - i)

      for (
        let base = 0;
        base < configs * block;
        base += stride * slots
      ) {
        const p = Math.floor(base / block)
        const rate = space.steiner[p]! > 0 ? inside : outside

        if (rate === 0) {
          continue
        }

        const [zr, zi] = space.steiner[p]! > 0 ? zIn : zOut

        for (let o = 0; o < stride; o++) {
          let sr = 0
          let si = 0

          for (let q = 0; q < slots; q++) {
            sr += re[base + o + q * stride]!
            si += im[base + o + q * stride]!
          }

          const ar = zr * sr - zi * si
          const ai = zr * si + zi * sr

          for (let q = 0; q < slots; q++) {
            re[base + o + q * stride] = re[base + o + q * stride]! + ar
            im[base + o + q * stride] = im[base + o + q * stride]! + ai
          }
        }
      }
    }

    return slabBeat(rest, K, s, tally)
  }
}

const copyState = (s: SlabState): SlabState => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

export function autocorrelationBy(
  step: SlabStep,
  K: readonly number[],
  start: SlabState,
  T: number,
): C[] {
  const tally: SlabTally = { escaped: 0 }
  const c: C[] = [innerSlab(start, start)]

  let s = copyState(start)

  for (let t = 1; t <= T; t++) {
    s = step(K, s, tally)
    c.push(innerSlab(start, s))
  }

  return c
}

const dominant = (
  c: readonly C[],
  ritz: (c: readonly C[]) => Ritz[],
): Ritz => ritz(c).sort((x, y) => y.weight - x.weight)[0]!

// v = sum_t x_t U^t start, normalized
export function levelVectorBy(
  space: SlabSpace,
  step: SlabStep,
  start: SlabState,
  coefficients: readonly C[],
): SlabState {
  const tally: SlabTally = { escaped: 0 }
  const out = emptyState(space)

  let s = copyState(start)

  coefficients.forEach((x, t) => {
    if (t > 0) {
      s = step([0, 0], s, tally)
    }

    for (let k = 0; k < s.re.length; k++) {
      const br = s.re[k]!
      const bi = s.im[k]!

      if (br === 0 && bi === 0) {
        continue
      }

      out.re[k] = out.re[k]! + x[0] * br - x[1] * bi
      out.im[k] = out.im[k]! + x[0] * bi + x[1] * br
    }
  })

  const w = Math.sqrt(weightOfSlab(out))

  for (let k = 0; k < out.re.length; k++) {
    out.re[k] = out.re[k]! / w
    out.im[k] = out.im[k]! / w
  }

  return out
}

// code/measure/slab-holes holdLevel for any beat: the dominant Ritz level of `start` at K = 0, its vector, evolved
export function holdLevelBy(
  space: SlabSpace,
  step: SlabStep,
  start: SlabState,
  input: {
    ritzBeats: number
    holdBeats: number
    fidelity: number
    tail: number
    tailFrom: number
    ritz: (c: readonly C[]) => Ritz[]
  },
): SlabHold {
  const level = dominant(
    autocorrelationBy(step, [0, 0], start, input.ritzBeats),
    input.ritz,
  )
  const v = levelVectorBy(space, step, start, level.coefficients)
  const tally: SlabTally = { escaped: 0 }
  const fidelity: number[] = []
  const tail: number[] = []

  let u = copyState(v)

  for (let t = 0; t < input.holdBeats; t++) {
    u = step([0, 0], u, tally)

    const [r, i] = innerSlab(v, u)
    const sh = steinerShells(space, u)

    fidelity.push(r * r + i * i)
    tail.push(
      tally.escaped +
        sh.slice(input.tailFrom).reduce((x, y) => x + y, 0),
    )
  }

  const shells = steinerShells(space, v)

  return {
    level,
    vector: v,
    fidelity,
    tail,
    minFidelity: Math.min(...fidelity),
    maxTail: Math.max(...tail),
    held:
      fidelity.every(f => f >= input.fidelity) &&
      tail.every(x => x <= input.tail),
    normGap: Math.abs(weightOfSlab(u) + tally.escaped - 1),
    shells,
    meanSteiner: shells.reduce((x, w, L) => x + w * L, 0),
    offLine: offLineSlab(space, v),
    antisymmetry: antisymmetryGap(space, u),
  }
}

export const energyBy = (
  step: SlabStep,
  K: readonly number[],
  start: SlabState,
  beats: number,
  ritz: (c: readonly C[]) => Ritz[],
): number =>
  dominant(autocorrelationBy(step, K, start, beats), ritz).energy

// the 2 x 2 inverse mass tensor by second differences along e_x, e_y and the diagonal (code/measure/slab-holes
// slabTensor for any beat), its eigenvalues ascending
export function tensorBy(
  step: SlabStep,
  start: SlabState,
  kappa: number,
  beats: number,
  ritz: (c: readonly C[]) => Ritz[],
): { tensor: number[][]; eigen: number[]; energy: number } {
  const e0 = energyBy(step, [0, 0], start, beats, ritz)
  const second = (d: readonly number[]): number =>
    (energyBy(
      step,
      d.map(x => x * kappa),
      start,
      beats,
      ritz,
    ) +
      energyBy(
        step,
        d.map(x => -x * kappa),
        start,
        beats,
        ritz,
      ) -
      2 * e0) /
    (kappa * kappa)
  const xx = second([1, 0])
  const yy = second([0, 1])
  const dd = second([Math.SQRT1_2, Math.SQRT1_2])
  const xy = dd - (xx + yy) / 2
  const mean = (xx + yy) / 2
  const r = Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy)

  return {
    tensor: [
      [xx, xy],
      [xy, yy],
    ],
    eigen: [mean - r, mean + r],
    energy: e0,
  }
}

// the longest chain of points with strictly decreasing rate (> 0) and non-decreasing D: the grid's joint path toward
// sigma, theta -> 0 (along it m(theta)^2 / sigma never falls)
export function longestJointPath<P extends { D: number; rate: number }>(
  points: readonly P[],
): P[] {
  const pts = points
    .filter(p => p.rate > 0)
    .sort((a, b) => b.rate - a.rate || a.D - b.D)
  const best: P[][] = []

  pts.forEach((p, i) => {
    let chain: P[] = [p]

    for (let j = 0; j < i; j++) {
      const q = pts[j]!
      const prev = best[j]!

      if (
        q.rate > p.rate &&
        q.D <= p.D &&
        prev.length + 1 > chain.length
      ) {
        chain = [...prev, p]
      }
    }

    best.push(chain)
  })

  return best.reduce<P[]>((a, b) => (b.length > a.length ? b : a), [])
}
