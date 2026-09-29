// Measurement for E-FRC-0250 and 0251: can the husk light's speed be set to the locked token's top speed, 1/2 per
// beat, by the choice of its coupling, and what that choice does to Planck and Coulomb. Floats are measurement
// only; every existence claim is decided in integers.
//
// THE ALGEBRA (derived before any run).
//   c^2 = 2 kappa / 3 (E-FRC-0212, 0235, E-MTR-0023), kappa = s f the product of the drift's and the force's
//   shares. The split ratio rho = f / s does not enter c. So c = 1/2 is kappa = 3/8, nothing else.
//   (a) the trit column light (code/rule/trit-column): kappa = 2 p / q, q = 2D + 1 the column's own range, p >= 1
//       an integer. kappa = 3/8 needs 16 p = 3 (2D + 1): even against odd, no solution at any p and D. Any
//       integer drift factor a keeps it (16 a p = 3 q).
//   (b) the quantum loop light (code/rule/loop-ring, plaquette-ladder): M = 2 N m, s = c / m, f = r / m, so
//       kappa = c r / m^2. kappa = 3/8 needs 8 c r = 3 m^2, so 8 | m^2, so m = 4j and c r = 6 j^2: reachable at
//       EVERY N (the depth no longer sets c). The ratio rho = r / c with c r = 6 j^2: rho = 3/8 needs c^2 = 16 j^2,
//       so c = 4j, r = 3j/2, j even: m = 8, c = 8, r = 3, s = 1, f = 3/8 (the classical light's own split s = 1
//       IS the 3D balance, because kappa = rho = 3/8). rho = 3 needs c^2 = 2 j^2 and rho = 2 needs c^2 = 3 j^2:
//       never, s would be irrational (the ladder's and the single column's balances are unreachable).
//   (c) STABILITY. The husk light is the leapfrog 2 - 2 cos omega = kappa lambda on the eigenvalues lambda of the
//       husk curl-curl M_h. A mode with kappa lambda > 4 grows by (|2 - x| + sqrt((2 - x)^2 - 4)) / 2 per beat,
//       x = kappa lambda. The husk intertwines with the bulk (P M = M_h P), so every husk eigenvalue is a bulk
//       one, at most the bulk's top 16 (E-FRC-0204's Q = 16), and 16 is reached on the husk at k = (pi, 0, pi).
//       So the husk light is stable only for kappa <= 1/4, where c <= 1/sqrt 6 = 0.408 < 1/2. At kappa = 3/8
//       the six massive husk branches (lambda = 12 at k = 0) grow by 2 per beat and the top mode by 2 + sqrt 3.
//   (d) alpha. The quantum light's static shift is (pi s / N) E* (E-FRC-0242, the drift factor alone), so the
//       Coulomb coefficient is C = s / (12 N) and alpha = C / c = s / (12 N c) in general. With kappa = 2 / N this
//       is 0242's (s / 24) sqrt(3 kappa / 2). At c = 1/2 it is s / (6 N), and with the 3D register balance
//       rho = 3/8 (s = 1) alpha = 1 / (6 (2D + 1)), the SAME as the adopted closed form: s = sqrt(kappa / rho)
//       and c = sqrt(2 kappa / 3) make s / c = sqrt(3 / (2 rho)), free of kappa. The form (s / 24) sqrt(3 kappa
//       / 2) = s / 32 at kappa = 3/8 assumes kappa = 2 / N inside C and is wrong off it.

import { photonLatticeD4 } from '@/code/rule/photon-links'
import { makeHusk, type Husk } from '@/code/measure/photon-husk'
import {
  curlSymbol,
  eigenvalues,
  huskSymbol,
  leapfrogBlock,
  plaquetteShapes,
  type PlaquetteShape,
} from '@/code/measure/photon-symbol'
import type { Split } from '@/code/rule/loop-ring'

type PhotonLattice = ReturnType<typeof photonLatticeD4>

let cache:
  | { bulk: PhotonLattice; husk: Husk; shapes: PlaquetteShape[] }
  | undefined

function light(): {
  bulk: PhotonLattice
  husk: Husk
  shapes: PlaquetteShape[]
} {
  if (!cache) {
    const bulk = photonLatticeD4({ side: 4 })

    cache = {
      bulk,
      husk: makeHusk(bulk),
      shapes: plaquetteShapes(bulk),
    }
  }

  return cache
}

// the husk curl-curl's eigenvalues at a husk wave vector, ascending, and the intertwining defect |P M - M_h P|
export function huskEigen(k: readonly number[]): {
  values: number[]
  intertwining: number
} {
  const p = light()
  const s = huskSymbol(
    p.husk,
    curlSymbol(p.bulk, p.shapes, [k[0] ?? 0, k[1] ?? 0, k[2] ?? 0, 0]),
  )

  return {
    values: eigenvalues(s.hermitian),
    intertwining: s.intertwining,
  }
}

// the bulk curl-curl's eigenvalues at a bulk wave vector, ascending
export function bulkEigen(k: readonly number[]): number[] {
  const p = light()

  return eigenvalues(
    curlSymbol(p.bulk, p.shapes, [
      k[0] ?? 0,
      k[1] ?? 0,
      k[2] ?? 0,
      k[3] ?? 0,
    ]),
  )
}

// the largest eigenvalue on a grid of g points per axis (3 axes for the husk, 4 for the bulk)
export function gridTop(
  g: number,
  dims: 3 | 4,
): { top: number; at: number[]; intertwining: number } {
  let top = -Infinity
  let at: number[] = []
  let intertwining = 0

  const step = (2 * Math.PI) / g
  const total = g ** dims

  for (let i = 0; i < total; i++) {
    let rest = i

    const k: number[] = []

    for (let d = 0; d < dims; d++) {
      k.push(step * (rest % g))
      rest = Math.floor(rest / g)
    }

    let v: number[]

    if (dims === 3) {
      const e = huskEigen(k)

      v = e.values
      intertwining = Math.max(intertwining, e.intertwining)
    } else {
      v = bulkEigen(k)
    }

    const t = v[v.length - 1]!

    if (t > top) {
      top = t
      at = k
    }
  }

  return { top, at, intertwining }
}

// the leapfrog's growth per beat at x = kappa lambda (1 on the unit circle)
export const leapfrogGrowth = (x: number): number =>
  leapfrogBlock(1, x).growth

// the husk photon's (the two lowest nonzero branches') top group velocity along a husk direction, husk docks per
// beat, by central differences on `steps` points of k in (0, pi] along the unit direction (measurement)
export function photonTopVelocity(
  kappa: number,
  dir: readonly number[],
  steps = 240,
): number {
  const norm = Math.hypot(...dir)
  const u = dir.map(x => x / norm)
  // along the direction until its largest component reaches pi (the zone edge on that line)
  const reach = Math.PI / Math.max(...u.map(Math.abs))
  const h = 1e-5

  let top = 0

  const omega = (t: number, branch: number): number => {
    const v = huskEigen(u.map(x => x * t)).values
    const x = kappa * (v[branch] ?? 0)

    return x <= 4
      ? 2 * Math.asin(Math.sqrt(Math.max(0, x)) / 2)
      : Number.NaN
  }

  for (let i = 1; i <= steps; i++) {
    const t = (reach * i) / (steps + 1)

    for (const branch of [1, 2]) {
      const v = (omega(t + h, branch) - omega(t - h, branch)) / (2 * h)

      if (Number.isFinite(v)) {
        top = Math.max(top, Math.abs(v))
      }
    }
  }

  return top
}

// the 13 husk directions: 3 axes, 6 face diagonals, 4 body diagonals
export const HUSK_DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
]

// ---------------------------------------------------------------------------------------------------------
// integer existence

// every (p, D) with 2 p / (2D + 1) = a / b, D <= dMax, p <= 2D + 1 (the trit column light), compared in integers
export function tritSolutions(
  a: number,
  b: number,
  dMax: number,
): { p: number; d: number }[] {
  const out: { p: number; d: number }[] = []

  for (let d = 1; d <= dMax; d++) {
    const q = 2 * d + 1

    for (let p = 1; p <= q; p++) {
      if (2 * p * b === a * q) {
        out.push({ p, d })
      }
    }
  }

  return out
}

// every loop-light split with kappa = c r / m^2 = a / b, m <= mMax: the Split for register modulus n (M = 2 n m)
export function loopSplits(
  n: number,
  a: number,
  b: number,
  mMax: number,
): Split[] {
  const out: Split[] = []

  for (let m = 1; m <= mMax; m++) {
    if ((a * m * m) % b !== 0) {
      continue
    }

    const product = (a * m * m) / b

    for (let c = 1; c <= product; c++) {
      if (product % c !== 0) {
        continue
      }

      out.push({
        root: 2 * n * m,
        drift: c,
        force: product / c,
        ratio: product / c / c,
        w: m,
      })
    }
  }

  return out
}

// the split among `splits` whose r / c is nearest `target` multiplicatively, by cross-multiplication in integers
// (ties to the smaller root, then the smaller drift)
export function nearestRatio(
  splits: readonly Split[],
  target: readonly [number, number],
): Split {
  let best: Split | undefined
  let bn = 0
  let bd = 1

  for (const s of splits) {
    // r / c against tn / td: max(r td, tn c) / min(r td, tn c)
    const x = s.force * target[1]
    const y = target[0] * s.drift
    const num = Math.max(x, y)
    const den = Math.min(x, y)

    if (best === undefined || num * bd < bn * den) {
      best = s
      bn = num
      bd = den
    }
  }

  return best!
}
