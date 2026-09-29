// Lorentz kinematics of the candidate rule's light member, read on the husk (E-RLT length contraction and simultaneity,
// E-RLT relativistic collisions).
//
// THE BAND. Under the swap coin (zeta = -1) and the ring mixer at theta = pi + 2 m, the moving pair of the one-body
// dock walk obeys, exactly (E-SPN-0143, code/measure/swap-cone):
//     cos E(K) = cos(m) g(K),   g(K) = (1/24) sum_d cos(K . r_d),
// with E measured from the pair's fixed midpoint, so E(0) = m. The rule's own band is read from its dock matrix by
// singletEps (code/measure/singlet-kinematics); the closed form here is the derivation it is checked against.
//
// THE HUSK. A husk mode is a bulk mode uniform along the depth: K4 = 0 (the column sum along v4 keeps K4 = 0 and pi,
// and at K4 = pi the pair sits at g = 0, E = pi/2, far from the light member). So the husk's momenta are K = (k1, k2,
// k3, 0), and its three directions are read in that subspace.
//
// NO ROUNDING, NO CONTINUITY in the rule: the band is a property of an exact finite-ring walk. Reals appear only here,
// in the reader. DETERMINISM: fixed directions and speeds; nothing is drawn.

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'

export type Vec = number[]
export type Band = (K: readonly number[]) => number

/** g(K) = (1/24) sum_d cos(K . r_d), over the 24 D4 roots. */
export function structureG(K: readonly number[]): number {
  let s = 0

  for (const r of DOCK_ROOTS) s += Math.cos((r[0] as number) * (K[0] as number) + (r[1] as number) * (K[1] as number) + (r[2] as number) * (K[2] as number) + (r[3] as number) * (K[3] as number))

  return s / 24
}

/** The closed-form swap-coin singlet band: E = arccos(cos(m) g(K)). */
export const closedBand = (m: number): Band => K => Math.acos(Math.cos(m) * structureG(K))

/** A husk momentum: a 3d husk vector lifted to K4 = 0. */
export const husk = (k: readonly number[]): Vec => [k[0] as number, k[1] as number, k[2] as number, 0]

const add = (a: readonly number[], b: readonly number[], s: number): Vec => a.map((x, i) => x + s * (b[i] as number))
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, i) => s + x * (b[i] as number), 0)
const norm = (a: readonly number[]): number => Math.sqrt(dot(a, a))

/** The husk gradient of E at K (central differences along the three husk axes, step h). */
export function huskGradient(E: Band, K: readonly number[], h: number): Vec {
  return [0, 1, 2].map(i => {
    const e = [0, 0, 0, 0]

    e[i] = 1

    return (E(add(K, e, h)) - E(add(K, e, -h))) / (2 * h)
  })
}

/** The curvature of E along the unit husk direction u at K: u . Hess . u (central second difference, step h). */
export function curvatureAlong(E: Band, K: readonly number[], u: readonly number[], h: number): number {
  const w = husk(u)

  return (E(add(K, w, h)) - 2 * E(K) + E(add(K, w, -h))) / (h * h)
}

/** Two unit husk vectors orthogonal to u and to each other. */
export function transverse(u: readonly number[]): [Vec, Vec] {
  const a = Math.abs(u[0] as number) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  const w1 = add(a, u, -dot(a, u))
  const n1 = w1.map(x => x / norm(w1))
  const w2 = [(u[1] as number) * (n1[2] as number) - (u[2] as number) * (n1[1] as number), (u[2] as number) * (n1[0] as number) - (u[0] as number) * (n1[2] as number), (u[0] as number) * (n1[1] as number) - (u[1] as number) * (n1[0] as number)]

  return [n1, w2.map(x => x / norm(w2))]
}

/**
 * The band's top group speed along u and the momentum where it peaks: the lattice speed rises from 0, peaks, then falls
 * (the zone edge), so a speed is reached on the rising side only. Scanned at `steps` points of [0, kMax], then refined.
 */
export function speedPeak(E: Band, u: readonly number[], kMax: number, h: number, steps = 600): { k: number; v: number } {
  const speed = (k: number): number => dot(huskGradient(E, husk(u.map(x => x * k)), h), u)
  let best = 0
  let at = 0

  for (let i = 1; i <= steps; i++) {
    const k = (kMax * i) / steps
    const v = speed(k)

    if (v > best) {
      best = v
      at = k
    }
  }

  let lo = Math.max(0, at - kMax / steps)
  let hi = Math.min(kMax, at + kMax / steps)

  for (let i = 0; i < 60; i++) {
    const a = lo + (hi - lo) / 3
    const b = hi - (hi - lo) / 3

    if (speed(a) < speed(b)) lo = a
    else hi = b
  }

  const k = (lo + hi) / 2

  return { k, v: speed(k) }
}

/** The husk momentum magnitude along u at which the group speed u . grad E equals the target, on the rising side [0, kMax]. */
export function momentumForSpeed(E: Band, u: readonly number[], target: number, kMax: number, h: number): number {
  let lo = 0
  let hi = kMax

  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    const K = husk(u.map(x => x * mid))
    const v = dot(huskGradient(E, K, h), u)

    if (v < target) lo = mid
    else hi = mid
  }

  return (lo + hi) / 2
}

export type LorentzReading = {
  /** the target speed as a fraction of c* */
  beta: number
  /** the husk momentum magnitude along u */
  k: number
  E: number
  /** the group speed's magnitude over c* */
  vOverC: number
  /** the angle between the group velocity and u, radians */
  tilt: number
  gammaV: number
  gammaE: number
  /** gammaV / gammaE - 1: the Lorentz factor from speed against from energy */
  factor: number
  /** (H_par / H_perp) gammaE^2 - 1: the envelope's contraction, from the curvatures */
  contraction: number
  /** the two transverse curvatures' relative difference: the husk's own isotropy at K */
  transverseSplit: number
  /** (E / k) (u . v) / c*^2 - 1: phase speed times group speed against c*^2, the simultaneity tilt */
  simultaneity: number
}

/** The three Lorentz identities at the husk momentum along u where the group speed is beta c*, with kMax the rising side's end (speedPeak). */
export function lorentzReading(E: Band, m: number, cStar: number, u: readonly number[], beta: number, kMax: number, h: number): LorentzReading {
  const k = momentumForSpeed(E, u, beta * cStar, kMax, h)
  const K = husk(u.map(x => x * k))
  const e = E(K)
  const grad = huskGradient(E, K, h)
  const vAbs = norm(grad)
  const tilt = Math.acos(Math.min(1, Math.max(-1, dot(grad, u) / vAbs)))
  const [t1, t2] = transverse(u)
  const hPar = curvatureAlong(E, K, u, h)
  const hPerp1 = curvatureAlong(E, K, t1, h)
  const hPerp2 = curvatureAlong(E, K, t2, h)
  const hPerp = (hPerp1 + hPerp2) / 2
  const gammaV = 1 / Math.sqrt(1 - (vAbs * vAbs) / (cStar * cStar))
  const gammaE = e / m

  return {
    beta,
    k,
    E: e,
    vOverC: vAbs / cStar,
    tilt,
    gammaV,
    gammaE,
    factor: gammaV / gammaE - 1,
    contraction: (hPar / hPerp) * gammaE * gammaE - 1,
    transverseSplit: Math.abs(hPerp1 - hPerp2) / Math.abs(hPerp),
    simultaneity: ((e / k) * dot(grad, u)) / (cStar * cStar) - 1,
  }
}

/** The long-wave speed c* of a band from its own dispersion: c*^2 = lim (E^2 - m^2) / K^2 (Richardson on two scales). */
export function longWaveSpeed(E: Band, m: number, u: readonly number[], kappa: number): number {
  const at = (k: number): number => {
    const e = E(husk(u.map(x => x * k)))

    return (e * e - m * m) / (k * k)
  }

  return Math.sqrt((4 * at(kappa / 2) - at(kappa)) / 3)
}

export type ShellReading = {
  /** the largest |E(p3) + E(p4) - E_tot| / E_tot over the CM directions, at the relativistic prediction */
  residual: number
  /** the invariant mass sqrt s */
  sqrtS: number
  /** the pair's CM momentum magnitude */
  kStar: number
  /** the boost speed |beta| of the CM frame */
  boost: number
  /** the largest |K . r| over the roots and over p1, p2 and every predicted p3, p4: umklapp needs it near pi */
  reach: number
}

/** The largest |K . r| over the 24 roots, for a husk momentum. */
export const rootReach = (k: readonly number[]): number => Math.max(...DOCK_ROOTS.map(r => Math.abs((r[0] as number) * (k[0] as number) + (r[1] as number) * (k[1] as number) + (r[2] as number) * (k[2] as number))))

/**
 * Relativistic two-body kinematics on the band: for incoming husk momenta p1 and p2 (equal masses m, the band's rest
 * energy), boost the CM sphere of outgoing momenta, radius k*, by the CM velocity, and read how far each predicted
 * outgoing pair (p3, P - p3) is from conserving the band's own energy. A relativistic band reads 0.
 */
export function collisionShell(E: Band, m: number, cStar: number, p1: readonly number[], p2: readonly number[], directions: readonly (readonly number[])[]): ShellReading {
  const K1 = husk(p1)
  const K2 = husk(p2)
  const eTot = E(K1) + E(K2)
  const P = [0, 1, 2].map(i => (p1[i] as number) + (p2[i] as number))
  const cp = P.map(x => x * cStar)
  const s = eTot * eTot - dot(cp, cp)
  const sqrtS = Math.sqrt(s)
  const eStar = sqrtS / 2
  const kStar = Math.sqrt(Math.max(0, eStar * eStar - m * m)) / cStar
  const beta = cp.map(x => x / eTot)
  const b = norm(beta)
  const gamma = 1 / Math.sqrt(1 - b * b)
  const bHat = b > 0 ? beta.map(x => x / b) : [1, 0, 0]
  let residual = 0
  let reach = Math.max(rootReach(p1), rootReach(p2))

  for (const n of directions) {
    const cpStar = n.map(x => x * kStar * cStar)
    const along = dot(cpStar, bHat)
    const cp3 = cpStar.map((x, i) => x + ((gamma - 1) * along + gamma * b * eStar) * (bHat[i] as number))
    const p3 = cp3.map(x => x / cStar)
    const p4 = P.map((x, i) => x - (p3[i] as number))

    residual = Math.max(residual, Math.abs(E(husk(p3)) + E(husk(p4)) - eTot) / eTot)
    reach = Math.max(reach, rootReach(p3), rootReach(p4))
  }

  return { residual, sqrtS, kStar, boost: b, reach }
}

/** Unit husk directions: the 3 axes, 6 face diagonals and 4 body diagonals, and their opposites (26). */
export function huskDirections(): Vec[] {
  const out: Vec[] = []

  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      for (let c = -1; c <= 1; c++) {
        if (a === 0 && b === 0 && c === 0) continue

        const n = Math.hypot(a, b, c)

        out.push([a / n, b / n, c / n])
      }
    }
  }

  return out
}
