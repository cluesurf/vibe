// E-SPN-0053's gates for a spinor token schedule, as functions, so any schedule of code/rule/spinor-token can be
// put through them (E-SPN-0064, E-SPN-0066). A STAND-IN instrument: the token's spin, charge and stability are put
// in (see code/rule/spinor-token).
//
// The gates, each as E-SPN-0053 measured it:
// - rest gap: the smallest nonzero distance between the period's rest eigenphases (2 pi / 3 is massive)
// - per-beat covariance: for all 12 husk turns R and the three axes, R beat_a R^-1 = beat_(R a) on Weyl states
// - the 2 pi sign: a 120 degree turn applied three times is -1 on the state space, six times +1
// - mass isotropy: the spin-averaged particle band's Hessian at k = 0, its relative spread
// - exactness on a torus with charge 1 in a uniform field: norm drift, reversal, continuity, Gauss's law on a cube
// - speed: the fastest group velocity over Weyl wave vectors, per beat
// and one reading E-SPN-0053 did not take: the band's own symmetry, whether the period's spectrum at R k equals
// the spectrum at k (compared by the traces of the first four powers, which fix a 4 x 4 spectrum).
//
// Floating point, deterministic (Weyl sequences only).

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { binaryTetrahedralGroup, type Quaternion } from '@/code/algebra/binary-tetrahedral'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'
import {
  beatWalker,
  copyWalker,
  density,
  dockIndex,
  inverseBeatWalker,
  makeWalker,
  multiply4,
  norm,
  scheduleSymbol,
  type Complex,
  type Matrix4,
  type Mode,
  type Step,
  type Walker,
} from '@/code/rule/spinor-token'

export type Rotation = { matrix: number[]; spin: Complex[] }

const cmul = (p: Complex, q: Complex): Complex => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]]

// a - i (b sigma_x + c sigma_y + d sigma_z)
export function spinMatrix(q: Quaternion): Complex[] {
  const [a, b, c, d] = q

  return [
    [a, -d],
    [-c, -b],
    [c, -b],
    [a, d],
  ]
}

const multiply2 = (a: Complex[], b: Complex[]): Complex[] =>
  [0, 1].flatMap(i =>
    [0, 1].map(j =>
      [0, 1].reduce<Complex>(
        (s, k) => {
          const x = cmul(a[i * 2 + k] ?? [0, 0], b[k * 2 + j] ?? [0, 0])

          return [s[0] + x[0], s[1] + x[1]]
        },
        [0, 0],
      ),
    ),
  )
export const dagger2 = (a: Complex[]): Complex[] => [0, 1].flatMap(i => [0, 1].map(j => [(a[j * 2 + i] ?? [0, 0])[0], -(a[j * 2 + i] ?? [0, 0])[1]] as Complex))

const PAULI: Complex[][] = [
  [[0, 0], [1, 0], [1, 0], [0, 0]],
  [[0, 0], [0, -1], [0, 1], [0, 0]],
  [[1, 0], [0, 0], [0, 0], [-1, 0]],
]

function rotationOf(u: Complex[]): number[] {
  const out: number[] = []

  for (let b = 0; b < 3; b++) {
    for (let a = 0; a < 3; a++) {
      const m = multiply2(multiply2(PAULI[b] ?? [], multiply2(u, PAULI[a] ?? [])), dagger2(u))

      out.push(Math.round((((m[0] ?? [0, 0])[0] + (m[3] ?? [0, 0])[0]) / 2) * 1e9) / 1e9 + 0)
    }
  }

  return out
}

// the 24 units' turns (each of the 12 cube rotations twice, with opposite spin matrices)
export function unitRotations(): { unit: Quaternion; rotation: Rotation }[] {
  return binaryTetrahedralGroup().map(q => ({ unit: q, rotation: { matrix: rotationOf(spinMatrix(q)), spin: spinMatrix(q) } }))
}

export function rotateWalker(w: Walker, r: Rotation): Walker {
  const side = w.side
  const out = makeWalker(side)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const from = dockIndex(side, x, y, z)
        const v = [x, y, z]
        const image = [0, 1, 2].map(i => [0, 1, 2].reduce((s, j) => s + (r.matrix[3 * i + j] ?? 0) * (v[j] ?? 0), 0))
        const to = dockIndex(side, image[0] ?? 0, image[1] ?? 0, image[2] ?? 0)

        for (let slot = 0; slot < 2; slot++) {
          for (let s = 0; s < 2; s++) {
            let re = 0
            let im = 0

            for (let t = 0; t < 2; t++) {
              const [ur, ui] = r.spin[s * 2 + t] ?? [0, 0]
              const vr = w.re[4 * from + 2 * slot + t] ?? 0
              const vi = w.im[4 * from + 2 * slot + t] ?? 0

              re += ur * vr - ui * vi
              im += ur * vi + ui * vr
            }

            out.re[4 * to + 2 * slot + s] = re
            out.im[4 * to + 2 * slot + s] = im
          }
        }
      }
    }
  }

  return out
}

export function weylWalker(side: number, n: number): Walker {
  const w = makeWalker(side)
  let total = 0

  for (let i = 0; i < w.re.length; i++) {
    w.re[i] = weyl(n * w.re.length + i + 1, GOLDEN) - 0.5
    w.im[i] = weyl(n * w.re.length + i + 1, SILVER) - 0.5
    total += (w.re[i] ?? 0) ** 2 + (w.im[i] ?? 0) ** 2
  }

  for (let i = 0; i < w.re.length; i++) {
    w.re[i] = (w.re[i] ?? 0) / Math.sqrt(total)
    w.im[i] = (w.im[i] ?? 0) / Math.sqrt(total)
  }

  return w
}

export function walkerDistance(a: Walker, b: Walker): number {
  let sum = 0

  for (let i = 0; i < a.re.length; i++) {
    sum += ((a.re[i] ?? 0) - (b.re[i] ?? 0)) ** 2 + ((a.im[i] ?? 0) - (b.im[i] ?? 0)) ** 2
  }

  return Math.sqrt(sum)
}

export function eigenphases(schedule: readonly Step[], mode: Mode, k: readonly number[]): number[] {
  const u = scheduleSymbol(schedule, mode, k)
  const e = complexEigenvalues({ re: u.map(c => c[0]), im: u.map(c => c[1]), n: 4 })

  return e.re.map((r, i) => Math.atan2(e.im[i] ?? 0, r))
}

export function restGap(schedule: readonly Step[], mode: Mode): number {
  const p = eigenphases(schedule, mode, [0, 0, 0])
  let gap = 0

  for (const a of p) {
    for (const b of p) {
      const d = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

      if (d > 1e-9 && (gap === 0 || d < gap)) {
        gap = d
      }
    }
  }

  return gap
}

// the spin-averaged particle band: the mean of the two eigenphases nearest 0
export function particleMean(schedule: readonly Step[], mode: Mode, k: readonly number[]): number {
  const p = eigenphases(schedule, mode, k).sort((a, b) => Math.abs(a) - Math.abs(b))

  return ((p[0] ?? 0) + (p[1] ?? 0)) / 2
}

export function bandHessian(schedule: readonly Step[], mode: Mode, h = 1e-3): number[][] {
  const f = (k: number[]): number => particleMean(schedule, mode, k)

  return [0, 1, 2].map(i =>
    [0, 1, 2].map(j => {
      const at = (si: number, sj: number): number => {
        const k = [0, 0, 0]

        k[i] = (k[i] ?? 0) + si * h
        k[j] = (k[j] ?? 0) + sj * h

        return f(k)
      }

      return (at(1, 1) - at(1, -1) - at(-1, 1) + at(-1, -1)) / (4 * h * h)
    }),
  )
}

// the relative spread of a Hessian from a multiple of the identity
export function hessianSpread(m: number[][]): number {
  const d = [0, 1, 2].map(i => m[i]?.[i] ?? 0)
  const mean = d.reduce((s, x) => s + x, 0) / 3
  const off = Math.max(Math.abs(m[0]?.[1] ?? 0), Math.abs(m[0]?.[2] ?? 0), Math.abs(m[1]?.[2] ?? 0))

  return Math.max(...d.map(x => Math.abs(x - mean)), off) / Math.abs(mean)
}

// the per-beat covariance of the three locked axis streams under the 12 turns (schedule independent), and of the
// depth pair (up then down), which must be the coin twice with no motion, on Weyl states of a side-L torus
export function beatCovariance(side: number, mode: Mode): { worst: number; failures: number; depthPairGap: number } {
  const rotations = unitRotations().map(r => r.rotation)
  const axisSteps: Step[] = ['x', 'y', 'z']
  let worst = 0
  let failures = 0

  for (const r of rotations) {
    for (const [ai, step] of axisSteps.entries()) {
      const image = [0, 1, 2].map(i => r.matrix[3 * i + ai] ?? 0)
      const bi = image.findIndex(x => Math.abs(x) > 0.5)
      const target = axisSteps[bi] ?? 'x'
      let gap = 0

      for (let n = 0; n < 8; n++) {
        const start = weylWalker(side, n)
        const inverse: Rotation = { matrix: [0, 1, 2].flatMap(i => [0, 1, 2].map(j => r.matrix[3 * j + i] ?? 0)), spin: dagger2(r.spin) }
        const left = rotateWalker(start, inverse)

        beatWalker({ walker: left, step, mode })

        const lhs = rotateWalker(left, r)
        const rhs = copyWalker(start)

        beatWalker({ walker: rhs, step: target, mode })
        gap = Math.max(gap, walkerDistance(lhs, rhs))
      }

      worst = Math.max(worst, gap)
      failures += gap > 1e-12 ? 1 : 0
    }
  }

  // the depth pair: up then down against down then up. Each is the coin twice with the two streams cancelling
  // (a uniform stream commutes with the coin), so they agree exactly when the pair is the coin alone, which every
  // turn fixes (the coin acts on the slots only)
  let depthPairGap = 0

  for (let n = 0; n < 4; n++) {
    const a = weylWalker(side, 40 + n)

    beatWalker({ walker: a, step: 'up', mode })
    beatWalker({ walker: a, step: 'down', mode })

    const c = weylWalker(side, 40 + n)

    beatWalker({ walker: c, step: 'down', mode })
    beatWalker({ walker: c, step: 'up', mode })
    depthPairGap = Math.max(depthPairGap, walkerDistance(a, c))
  }

  return { worst, failures, depthPairGap }
}

// a 120 degree turn cubed is -1 on the state space, six times +1, for all 8 order-6 units
export function twoPiSign(side: number): { orderSix: number; gap: number } {
  let orderSix = 0
  let gap = 0

  for (const [i, { unit, rotation }] of unitRotations().entries()) {
    if (Math.abs(unit[0] - 0.5) > 1e-9) {
      continue
    }

    orderSix++

    const start = weylWalker(side, 20 + i)
    let w = start

    for (let t = 0; t < 3; t++) {
      w = rotateWalker(w, rotation)
    }

    gap = Math.max(gap, walkerDistance(w, { side: start.side, re: start.re.map(x => -x), im: start.im.map(x => -x) }))

    for (let t = 0; t < 3; t++) {
      w = rotateWalker(w, rotation)
    }

    gap = Math.max(gap, walkerDistance(w, start))
  }

  return { orderSix, gap }
}

// a 4 x 4 spectrum's fingerprint: the traces of the first four powers
function powerTraces(u: Matrix4): Complex[] {
  const out: Complex[] = []
  let p = u

  for (let n = 1; n <= 4; n++) {
    out.push([0, 1, 2, 3].reduce<Complex>((s, i) => [s[0] + (p[i * 5] ?? [0, 0])[0], s[1] + (p[i * 5] ?? [0, 0])[1]], [0, 0]))
    p = multiply4(p, u)
  }

  return out
}

// whether the band is itself symmetric under the husk turns: the largest difference of the spectrum at R k and at
// k, over the 12 turns and Weyl wave vectors
export function bandTurnMismatch(schedule: readonly Step[], mode: Mode, samples: number): number {
  const turns = [...new Map(unitRotations().map(r => [r.rotation.matrix.join(','), r.rotation.matrix])).values()]
  let worst = 0

  for (let n = 0; n < samples; n++) {
    const k = [0, 1, 2].map(j => 2 * Math.PI * (weyl(3 * n + j + 1, GOLDEN) - 0.5))
    const here = powerTraces(scheduleSymbol(schedule, mode, k))

    for (const m of turns) {
      const rk = [0, 1, 2].map(i => [0, 1, 2].reduce((s, j) => s + (m[3 * i + j] ?? 0) * (k[j] ?? 0), 0))
      const there = powerTraces(scheduleSymbol(schedule, mode, rk))

      here.forEach((t, i) => {
        worst = Math.max(worst, Math.hypot(t[0] - (there[i] ?? [0, 0])[0], t[1] - (there[i] ?? [0, 0])[1]))
      })
    }
  }

  return worst
}

// the fastest group velocity over Weyl wave vectors, per beat
export function fastestPerBeat(schedule: readonly Step[], mode: Mode, samples: number): number {
  let fastest = 0

  for (let n = 0; n < samples; n++) {
    const k = [0, 1, 2].map(j => 2 * Math.PI * (weyl(3 * n + j + 1, GOLDEN) - 0.5))
    const here = eigenphases(schedule, mode, k).sort((p, q) => p - q)

    for (let axis = 0; axis < 3; axis++) {
      const shifted = k.map((x, j) => (j === axis ? x + 1e-5 : x))
      const there = eigenphases(schedule, mode, shifted).sort((p, q) => p - q)

      here.forEach((p, band) => {
        const dp = Math.atan2(Math.sin((there[band] ?? 0) - p), Math.cos((there[band] ?? 0) - p))

        fastest = Math.max(fastest, Math.abs(dp / 1e-5) / schedule.length)
      })
    }
  }

  return fastest
}

// the run on a husk torus with charge 1 in a uniform field along z (theta_y = B x), for `beats` beats (whole
// periods), as E-SPN-0053's part C
export function exactRun(input: { schedule: readonly Step[]; side: number; beats: number; cube: number }): {
  normDrift: number
  reversalGap: number
  continuity: number
  gaussGap: number
  chargeLeftCube: number
} {
  const { schedule, side, cube } = input
  const periods = Math.round(input.beats / schedule.length)
  const field = (2 * Math.PI) / side
  const thetaY = new Float64Array(side ** 3)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        thetaY[dockIndex(side, x, y, z)] = field * x
      }
    }
  }

  const theta = [undefined, thetaY, undefined]
  const packet = makeWalker(side)
  let total = 0

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const r2 = (x - side / 2) ** 2 + (y - side / 2) ** 2 + (z - side / 2) ** 2
        const g = Math.exp(-r2 / 4)

        packet.re[4 * dockIndex(side, x, y, z)] = g
        total += g * g
      }
    }
  }

  for (let i = 0; i < packet.re.length; i++) {
    packet.re[i] = (packet.re[i] ?? 0) / Math.sqrt(total)
  }

  const start = copyWalker(packet)
  const lo = side / 2 - cube / 2
  const inside = (d: number): boolean => {
    const x = d % side
    const y = Math.floor(d / side) % side
    const z = Math.floor(d / (side * side))

    return x >= lo && x < lo + cube && y >= lo && y < lo + cube && z >= lo && z < lo + cube
  }
  const flow = new Float64Array(3 * side ** 3)
  const currents = new Float64Array(3 * side ** 3)
  let continuity = 0
  let normDrift = 0
  const w = copyWalker(packet)

  for (let t = 0; t < periods; t++) {
    for (const step of schedule) {
      const before = density(w)

      currents.fill(0)
      beatWalker({ walker: w, step, mode: 'locked', charge: 1, theta, currents })

      const after = density(w)

      for (let d = 0; d < side ** 3; d++) {
        const x = d % side
        const y = Math.floor(d / side) % side
        const z = Math.floor(d / (side * side))
        let divergence = 0

        for (let axis = 0; axis < 3; axis++) {
          const back = dockIndex(side, x - (axis === 0 ? 1 : 0), y - (axis === 1 ? 1 : 0), z - (axis === 2 ? 1 : 0))

          divergence += (currents[3 * d + axis] ?? 0) - (currents[3 * back + axis] ?? 0)
        }

        continuity = Math.max(continuity, Math.abs((after[d] ?? 0) - (before[d] ?? 0) + divergence))
      }

      for (let i = 0; i < flow.length; i++) {
        flow[i] = (flow[i] ?? 0) + (currents[i] ?? 0)
      }

      normDrift = Math.max(normDrift, Math.abs(norm(w) - 1))
    }
  }

  let outward = 0

  for (let d = 0; d < side ** 3; d++) {
    const x = d % side
    const y = Math.floor(d / side) % side
    const z = Math.floor(d / (side * side))

    for (let axis = 0; axis < 3; axis++) {
      const ahead = dockIndex(side, x + (axis === 0 ? 1 : 0), y + (axis === 1 ? 1 : 0), z + (axis === 2 ? 1 : 0))

      if (inside(d) && !inside(ahead)) {
        outward += flow[3 * d + axis] ?? 0
      }

      if (!inside(d) && inside(ahead)) {
        outward -= flow[3 * d + axis] ?? 0
      }
    }
  }

  const densityStart = density(start)
  const densityEnd = density(w)
  let left = 0

  for (let d = 0; d < side ** 3; d++) {
    if (inside(d)) {
      left += (densityStart[d] ?? 0) - (densityEnd[d] ?? 0)
    }
  }

  const back = copyWalker(w)

  for (let t = 0; t < periods; t++) {
    for (const step of [...schedule].reverse()) {
      inverseBeatWalker({ walker: back, step, mode: 'locked', charge: 1, theta })
    }
  }

  return { normDrift, reversalGap: walkerDistance(back, start), continuity, gaussGap: Math.abs(outward - left), chargeLeftCube: left }
}
