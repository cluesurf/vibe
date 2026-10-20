// Reads for a survey of the candidate rule's discrete design choices (E-FND-0177): one variant of the one-body walk
// (a coin, a mixer angle, a schedule, with or without the Cl+(4) register), and three numbers off its bands, all from
// the existing momentum-space readers (code/measure/dock-mixer, singlet-kinematics, swap-cone, spinor-register).
//
//   ratio      R / (tan m / m), R = c0^2 / c^2 along each direction (c0 the variant's own massless speed, c^2 the
//              K^2 coefficient of the singlet's per-beat eps^2, m its per-beat mass)
//   isotropy   the largest |c^2(u) / c^2(axis) - 1| over the directions (the leading-order direction dependence)
//   top        the largest group speed per beat over every band at the given momenta, hole and love, for the
//              variant AND its massless twin, over c0 (the held-out "one light speed" read)
//
// Floats are measurement only. Nothing here chooses a variant.

import { dockMatrix, DOCK_ROOTS, type CMatrix } from '@/code/measure/dock-mixer'
import {
  fastestBand,
  masslessPair,
  singletKinematics,
  singletLevel,
} from '@/code/measure/singlet-kinematics'
import {
  cycleBand,
  cycleMultiplets,
  cycleSinglet,
  fastestCycleBand,
} from '@/code/measure/swap-cone'
import {
  cycleMasslessPairN,
  diracSpeed,
  frameRN,
  partnerProjector48,
  REGISTER_ROOTS,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { restFrame } from '@/code/measure/two-beat'

export type DesignRead = {
  // per-beat rest mass of the singlet (0 if no singlet was found)
  m: number
  // R along each direction, and R / (tan m / m)
  R: number[]
  ratio: number[]
  c2: number[]
  // the K = 0 multiplet sizes, sorted, joined with +
  sizes: string
  // the variant's massless speed c0 (per beat) and the massless pair's gamma / c0
  c0: number
  gammaOverC0: number
  // the fastest band per beat over c0: the massive variant (hole and love) and its massless twin
  topOverC0: number
  masslessTopOverC0: number
}

// the coin index n of dockCoin for a coin angle phi (zeta = e^(i phi) = e^(2 pi i / (3 n)))
export const coinIndex = (phi: number): number => (2 * Math.PI) / (3 * phi)

const PAIR_KAPPA = 0.01

// the massless twin's top speed depends only on the coin and the momenta, so it is computed once per pair
const twinTops = new WeakMap<object, Map<number, number>>()

function twinTop(
  phi: number,
  momenta: readonly (readonly number[])[],
): number {
  let byCoin = twinTops.get(momenta)

  if (!byCoin) {
    byCoin = new Map()
    twinTops.set(momenta, byCoin)
  }

  const known = byCoin.get(phi)

  if (known !== undefined) {
    return known
  }

  const n = coinIndex(phi)
  const top = Math.max(
    fastestBand(dockMatrix(phi, n, true), DOCK_ROOTS, momenta).speed,
    fastestBand(dockMatrix(phi, n, false), DOCK_ROOTS, momenta).speed,
  )

  byCoin.set(phi, top)

  return top
}

const ratioOf = (R: number[], m: number): number[] =>
  R.map(x => x / (Math.tan(m) / m))

// THE SLOT WALK, no register: a schedule of dock matrices P(theta_b) = C_n m(theta_b) after the coin of angle phi.
// `angles` are the mixer angles beat by beat (one entry: the one-beat rule). The massless twin is the one-beat walk at
// theta = phi (where the singlet falls into its partner).
export function slotDesignRead(input: {
  phi: number
  angles: readonly number[]
  dirs: readonly (readonly number[])[]
  scales: readonly number[]
  momenta: readonly (readonly number[])[]
}): DesignRead {
  const { phi, angles, dirs, scales, momenta } = input
  const n = coinIndex(phi)
  const twin = dockMatrix(phi, n, true)
  const pair = masslessPair(twin, DOCK_ROOTS, 13, dirs[0]!, PAIR_KAPPA)
  const c0 = pair.c0
  const hole = angles.map(t => dockMatrix(t, n, true))
  const love = angles.map(t => dockMatrix(t, n, false))

  let m = 0
  let c2: number[] = []
  let sizes = ''

  if (angles.length === 1) {
    const P = hole[0]!
    const level = singletLevel(P, DOCK_ROOTS, 12)

    sizes = level.multiplets
      .map(x => x.size)
      .sort((a, b) => a - b)
      .join('+')

    if (level.single >= 0 && level.partner >= 0 && level.m > 1e-9) {
      m = level.m
      c2 = dirs.map(u => singletKinematics(P, DOCK_ROOTS, level, u, scales).c2)
    }
  } else {
    const fits = dirs.map(u => cycleSinglet(hole, DOCK_ROOTS, u, scales))

    sizes = fits[0]!.sizes.join('+')

    if (fits[0]!.m > 1e-9) {
      m = fits[0]!.m
      c2 = fits.map(x => x.c2)
    }
  }

  const R = c2.map(x => (c0 * c0) / x)
  const top =
    angles.length === 1
      ? Math.max(
          fastestBand(hole[0]!, DOCK_ROOTS, momenta).speed,
          fastestBand(love[0]!, DOCK_ROOTS, momenta).speed,
        )
      : Math.max(
          fastestCycleBand(hole, DOCK_ROOTS, momenta).speed,
          fastestCycleBand(love, DOCK_ROOTS, momenta).speed,
        )
  const masslessTop = twinTop(phi, momenta)

  return {
    m,
    R,
    ratio: m > 0 ? ratioOf(R, m) : [],
    c2,
    sizes,
    c0,
    gammaOverC0: Math.abs(pair.gamma) / c0,
    topOverC0: top / c0,
    masslessTopOverC0: masslessTop / c0,
  }
}

// the register schedule of E-SPN-0160 at the mixer e^(i theta): beat 1 the mixer on the singlet sector S, beat 2 its
// conjugate on the Clifford partner D, each after the swap coin X
export function registerSchedule(theta: number): CMatrix[] {
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)

  return [
    registerPiece(qS, [Math.cos(theta), Math.sin(theta)]),
    registerPiece(qD, [Math.cos(theta), -Math.sin(theta)]),
  ]
}

// THE REGISTER WALK (Cl+(4), 8 values a slot, 192 modes, the swap coin built in) at theta = pi + 2 m, m > 0 per beat.
// The top speed is the derived closed form (diracSpeed, every moving band is the one Dirac band); `hfMomenta` of the
// momenta are checked against the full cycle's Hellmann-Feynman speed, and the largest gap is returned. The hole only:
// the register pieces are written for the hole.
export function registerDesignRead(input: {
  m: number
  dirs: readonly (readonly number[])[]
  scales: readonly number[]
  momenta: readonly (readonly number[])[]
  hfMomenta: number
}): DesignRead & { hfGap: number } {
  const { m, dirs, scales, momenta } = input
  const theta = Math.PI + 2 * m
  const Ps = registerSchedule(theta)
  const twin = registerSchedule(Math.PI)
  const pair = cycleMasslessPairN(
    twin,
    Math.PI,
    dirs[0]!,
    PAIR_KAPPA,
    REGISTER_ROOTS,
  )
  const c0 = pair.c0
  const frame = restFrame(theta, -theta, 2 * m)
  const fits = dirs.map(u =>
    frameRN(Ps, frame, theta, u, c0, scales, REGISTER_ROOTS),
  )
  const M = 2 * m
  const top = Math.max(...momenta.map(K => diracSpeed(K, M)))
  const masslessTop = Math.max(...momenta.map(K => diracSpeed(K, 0)))

  let hfGap = 0

  for (const K of momenta.slice(0, input.hfMomenta)) {
    const hf = Math.max(
      ...cycleBand(Ps, REGISTER_ROOTS, K).velocity.map(v => Math.hypot(...v)),
    )

    hfGap = Math.max(hfGap, Math.abs(hf - diracSpeed(K, M)))
  }

  const R = fits.map(x => x.R)

  return {
    m: fits[0]!.m,
    R,
    ratio: ratioOf(R, fits[0]!.m),
    c2: fits.map(x => x.c2),
    sizes: cycleMultiplets(Ps, REGISTER_ROOTS)
      .map(x => x.size)
      .sort((a, b) => a - b)
      .join('+'),
    c0,
    gammaOverC0: Math.abs(pair.gamma) / c0,
    topOverC0: top / c0,
    masslessTopOverC0: masslessTop / c0,
    hfGap,
  }
}

// the largest |c^2(u) / c^2(first) - 1|
export const isotropyOf = (c2: readonly number[]): number =>
  c2.length
    ? Math.max(...c2.map(x => Math.abs(x / c2[0]! - 1)))
    : Number.NaN
