// THE REGISTER RESULTS READ ON THE HUSK (E-SPN-0167). E-SPN-0160, E-GRV-0145, E-FRC-0258 and E-SPN-0164 read the member
// in the bulk's 4d momentum space, K in the D4 Brillouin zone. Physics is read on the husk. On the flat D4 mesh with the
// depth along e4, the husk reading of a position is the shadow pi(x) = (x1, x2, x3), linear and odd (E-SPN-0158's
// physical reading, in its flat local form), and on the column of depth period 2 (E-SPN-0155's quotient) pi makes the
// docks exactly the husk lattice Z^3. A member's husk momentum is q, the dual of pi; K4 is a depth label. On the
// thinnest column (period 2) K4 is 0 or pi, and (q, pi) is (q + (pi, pi, pi), 0) since D4's dual holds (pi, pi, pi, pi):
// the husk band is exactly the bulk band on the slice K = (q, 0). A column of period 2L adds the depth copies
// K4 = pi j / L. This file holds what the audit reads on those:
//
//   onSlice            (q1, q2, q3) -> (q1, q2, q3, 0)
//   sliceMomenta       n husk momenta, the first three components of the 4d Weyl sequence, on the slice
//   HUSK_DIRS          six unit husk directions (axis, face, body, two generic), K4 = 0
//   streamFront        the stream's own husk front along a husk direction: the largest pi(r) . u over the 24 roots (the
//                      husk distance the stream can take a value in one beat along u)
//   depthSlope         s4(K) and d|s|^2 / dK4 at a slice point, in closed form (both are exactly 0 on the slice)
//   largestE           the Dirac band's largest E over a momentum set (Smax, the S band's top)
//   looseCensus        THE PAIR CENSUS WITH DEPTH MOMENTUM NOT CONSERVED: members at (q, k1) and (-q, k2), any k1, k2 of a
//                      column, bands from the exact closed form (S at +E, D at -E, 176 flats at pi): the least positive
//                      wrap(2 M - a - b), and whether any pair sum reaches 2 M
//   huskSymbolFromRoots the 4d root Laplacian sum (1 - cos K . r) at K = (q, 0), for the E-SPN-0155 control
//
// DETERMINISM: no random numbers; Weyl sequences and grids. Floats, as measurement.

import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import {
  diracPhase,
  structureVector,
} from '@/code/measure/spinor-register'

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

const unit = (v: readonly number[]): number[] => {
  const n = Math.hypot(...v)

  return v.map(x => x / n)
}

export const onSlice = (q: readonly number[]): number[] => [
  q[0]!,
  q[1]!,
  q[2]!,
  0,
]

export const sliceMomenta = (n: number): number[][] =>
  weylMomenta(n).map(K => onSlice(K))

const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)

export const HUSK_DIRS: readonly number[][] = [
  [1, 0, 0, 0],
  [s2, s2, 0, 0],
  [s3, s3, s3, 0],
  [...unit([0.29, 0.52, 0.8]), 0],
  [s3, -s3, s3, 0],
  [...unit([0.8, 0.29, -0.52]), 0],
]

// the stream's husk front along the husk direction u (u4 = 0): max over roots of pi(r) . u
export const streamFront = (u: readonly number[]): number =>
  Math.max(
    ...DOCK_ROOTS.map(
      r => r[0]! * u[0]! + r[1]! * u[1]! + r[2]! * u[2]!,
    ),
  )

// s4 and d|s|^2 / dK4 at K, in closed form: ds/dK4 = sum_r r r4 cos(K . r) / sqrt 288
export function depthSlope(K: readonly number[]): {
  s4: number
  slope: number
} {
  const s = structureVector(K)
  const ds = [0, 0, 0, 0]

  for (const r of DOCK_ROOTS) {
    const c = (r[3]! * Math.cos(dot(K, r))) / Math.sqrt(288)

    for (let k = 0; k < 4; k++) {
      ds[k]! += r[k]! * c
    }
  }

  return { s4: s[3]!, slope: 2 * dot(s, ds) }
}

export const largestE = (
  momenta: readonly (readonly number[])[],
  M: number,
): number => Math.max(...momenta.map(K => diracPhase(K, M)))

// the pair census with depth momentum NOT conserved: members at (q, k1) and (q, k2) (the second member's husk momentum -q
// has the same E, the band being even in K), over a husk grid and a column's depth momenta
export function looseCensus(
  M: number,
  qs: readonly (readonly number[])[],
  depths: readonly number[],
): { Bstar: number; reaches: boolean; pair: [number, number] } {
  let Bstar = Math.PI
  let reaches = false
  let pair: [number, number] = [NaN, NaN]

  for (const q of qs) {
    const bands = depths.map(k => {
      const E = diracPhase([q[0]!, q[1]!, q[2]!, k], M)

      return [E, -E, Math.PI]
    })

    for (const a of bands) {
      for (const b of bands) {
        for (const x of a) {
          for (const y of b) {
            const d = wrap(2 * M - x - y)

            if (Math.abs(d) < 1e-12) {
              reaches = true
            }

            if (d > 1e-12 && d < Bstar) {
              Bstar = d
              pair = [x, y]
            }
          }
        }
      }
    }
  }

  return { Bstar, reaches, pair }
}

// the 4d root Laplacian at K = (q, 0)
export const huskSymbolFromRoots = (q: readonly number[]): number =>
  DOCK_ROOTS.reduce((s, r) => s + 1 - Math.cos(dot(onSlice(q), r)), 0)

// a husk grid of side n over [-pi, pi)^3
export function huskGrid(n: number): number[][] {
  const out: number[][] = []

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      for (let c = 0; c < n; c++) {
        out.push([a, b, c].map(i => -Math.PI + (2 * Math.PI * i) / n))
      }
    }
  }

  return out
}
