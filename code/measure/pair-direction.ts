// THE LIGHT REGISTER PAIR'S BAND CURVATURE ALONG ANY HUSK DIRECTION (E-RLT-0115). The pair of code/measure/register-track
// (two Cl+(4) register members under the husk light's Coulomb count, on the husk quotient, reduced by the cubic group):
// its level at K = 0 is built by E-SPN-0173's filters on the O_h sector (128, 512, 2048 cycles from the hydrogenic start,
// each at the phase the last one read), then unfolded into the sector of the little group of K = kappa n (C4v on an
// axis, C2v on a face diagonal, C3v on a body diagonal, the identity alone off every mirror) and filtered again there at
// K = 0, kappa / 2 and kappa (256 cycles each), the phase read at each. From d(kappa) = E(kappa n) - E(0):
//
//   a = (16 d(kappa / 2) - d(kappa)) / (3 kappa^2)      the K^2 coefficient (Richardson)
//   b = 4 (d(kappa) - 4 d(kappa / 2)) / (3 kappa^4)     the K^4 coefficient from the same two reads
//
// This is E-SPN-0173's differential read (the experiment spin/register-coulomb-track's heavyRead, there along the axis
// only) with the direction a parameter; along the axis it is the same arithmetic in the same order.
//
// DETERMINISM: no random numbers; the start is placed. FLOATS: measurement on exact pieces (code/measure/register-reduced).

import type { KernelOptions } from '@/code/kernel/index'
import {
  littleGroup,
  normalizeState,
  reducedCounts,
  reducedEngine,
  reducedFilter,
  reducedHydrogenStart,
  reducedRead,
  referenceCorrelation,
  sector,
  unfold,
  type RState,
  type Sector,
} from '@/code/measure/register-reduced'
import { alphaOf, type Setup } from '@/code/measure/register-track'

const LEVEL_FILTERS: readonly number[] = [128, 512, 2048]
const K_FILTER = 256

export type PairLevel = {
  aB: number
  R: number
  alpha: number
  s: Sector
  v: RState
  EL: number
  residual: number
}

// the pair's level at K = 0 on the O_h sector (E-SPN-0173's filters)
export function pairLevel(input: {
  su: Setup
  aB: number
  R: number
  opts: KernelOptions
}): PairLevel {
  const { su, aB, R, opts } = input
  const oh = [...su.group.elements.keys()]
  const alpha = alphaOf(su, aB)
  const s = sector(su.group, oh, R)
  const e = reducedEngine(
    s,
    su.u,
    [0, 0, 0, 0],
    reducedCounts(s, su.table, alpha, su.theta),
    'vector',
    opts,
  )

  let v = reducedHydrogenStart(s, aB)
  let phase = 2 * su.M0 - 1 / (2 * su.mu * aB * aB)
  let residual = NaN

  normalizeState(e, v)

  for (const S of LEVEL_FILTERS) {
    v = reducedFilter(e, v, phase, S)
    normalizeState(e, v)

    const read = reducedRead(e, v)

    phase = read.phase
    residual = read.residual
  }

  return { aB, R, alpha, s, v, EL: phase, residual }
}

export type DirectionRead = {
  direction: number[]
  little: number
  reps: number
  kappa: number
  base: number
  d1: number
  d2: number
  ratio: number
  a: number
  b: number
  residual: number
}

// the level's curvature along the unit husk direction n
export function pairAlong(input: {
  su: Setup
  level: PairLevel
  direction: readonly number[]
  kappa: number
  opts: KernelOptions
}): DirectionRead {
  const { su, level, kappa, opts } = input
  const l = Math.hypot(...input.direction)
  const n = input.direction.map(x => x / l)
  const along = (k: number): number[] => [k * n[0]!, k * n[1]!, k * n[2]!, 0]
  const members = littleGroup(su.group, along(kappa))
  const sk = sector(su.group, members, level.R)
  const vk = unfold(level.s, level.v, sk)
  const countK = reducedCounts(sk, su.table, level.alpha, su.theta)

  let residual = 0

  const eAt = (k: number): number => {
    const ek = reducedEngine(sk, su.u, along(k), countK, 'vector', opts)
    const f = reducedFilter(ek, vk, level.EL, K_FILTER)

    normalizeState(ek, f)

    const read = reducedRead(ek, f)

    residual = Math.max(residual, read.residual)

    return read.phase
  }
  const base = eAt(0)
  const d1 = eAt(kappa) - base
  const d2 = eAt(kappa / 2) - base

  return {
    direction: n,
    little: members.length,
    reps: sk.count,
    kappa,
    base,
    d1,
    d2,
    ratio: d1 / d2,
    a: (4 * (d2 / (kappa / 2) ** 2) - d1 / kappa ** 2) / 3,
    b: (4 * (d1 - 4 * d2)) / (3 * kappa ** 4),
    residual,
  }
}

// the autocorrelation x_l = <v | G U^l v>, l = 0 .. length, of the K = 0 level unfolded into the sector of K = kappa n's
// little group and run at K = k n (k = 0 or kappa): the input to a filter diagonalization of the lines it holds
export function pairCorrelation(input: {
  su: Setup
  level: PairLevel
  direction: readonly number[]
  kappa: number
  k: number
  length: number
  opts: KernelOptions
}): { re: number[]; im: number[]; reps: number } {
  const { su, level, kappa, k, length, opts } = input
  const l = Math.hypot(...input.direction)
  const n = input.direction.map(x => x / l)
  const along = (q: number): number[] => [q * n[0]!, q * n[1]!, q * n[2]!, 0]
  const sk = sector(su.group, littleGroup(su.group, along(kappa)), level.R)
  const vk = unfold(level.s, level.v, sk)
  const countK = reducedCounts(sk, su.table, level.alpha, su.theta)
  const ek = reducedEngine(sk, su.u, along(k), countK, 'vector', opts)

  normalizeState(ek, vk)

  const x = referenceCorrelation(ek, vk, length)

  return { re: [...x.re], im: [...x.im], reps: sk.count }
}

// the K^4 coefficient from a tracked pair of reads at kappa and kappa / 2 (for code/measure/register-track's Follow)
export const quarticOf = (input: {
  d1: number
  d2: number
  kappa: number
}): number => (4 * (input.d1 - 4 * input.d2)) / (3 * input.kappa ** 4)
