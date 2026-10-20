// THE LIGHT REGISTER PAIR AT A FINITE TOTAL MOMENTUM (E-MTR-0029).
//
// readBoost reads the pair's lines in the sector of total momentum K along a husk direction, the way readMotion
// (code/measure/register-track) reads them at K 0.04 and 0.02, with one change: the energy window is moved up by the
// free threshold's rise, 2 E_member(K / 2) - 2 M0, from the member's exact band (code/measure/spinor-register
// diracPhase), so a level that moves with K stays inside it. The shift is read off the lone member, never off the pair,
// so no answer about the pair places its own window. The start is readMotion's (the K = 0 hydrogenic start unfolded
// onto the K sector, left unnormalized), and each line's overlap is divided by its own correlation's x_0.
//
// boostLevels names the levels by overlap rank: the genuine line of largest overlap is the ground, the next the
// 2s-like level, the identity readZero uses at K = 0. relativisticEnergy is sqrt(E0^2 + c^2 K^2) and galileanEnergy
// E0 + a K^2 with c^2 = 2 a E0, the two forms a curvature a fixes; relativityFraction is where a read sits between
// them, 1 on the relativistic form and 0 on the Galilean.

import type { KernelOptions } from '@/code/kernel/index'
import {
  alphaOf,
  genuine,
  HALF_OVERLAP,
  HALF_PHASE,
  windowOf,
  type LineOut,
  type Setup,
  type TrackPoint,
  type ZeroRead,
} from '@/code/measure/register-track'
import {
  littleGroup,
  reducedCounts,
  reducedEngine,
  reducedHydrogenStart,
  referenceCorrelation,
  referenceLines,
  sector,
  unfold,
  type ReducedCount,
  type Sector,
} from '@/code/measure/register-reduced'
import { diracPhase } from '@/code/measure/spinor-register'

export type BoostRead = {
  K: number
  direction: [number, number, number]
  NK: number
  shift: number
  repsK: number
  lines: LineOut[]
  seconds: number
}

// the free threshold's rise at total momentum K: two lone members each at K / 2
export function thresholdRise(su: Setup, K: number): number {
  return 2 * diracPhase([K / 2, 0, 0, 0], su.M0) - 2 * su.M0
}

export function readBoost(
  su: Setup,
  p: TrackPoint,
  zero: ZeroRead,
  K: number,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
  // the same diagnostic transform of the count as readZero's (code/measure/contact-core softenContact)
  transform?: (s: Sector, c: ReducedCount) => ReducedCount,
  direction: readonly [number, number, number] = [1, 0, 0],
): BoostRead {
  const started = Date.now()
  const oh = [...su.group.elements.keys()]
  const alpha = alphaOf(su, p.aB)
  const s = sector(su.group, oh, p.R)
  const r = reducedHydrogenStart(s, p.aB)
  const converged =
    Math.abs(zero.half.E - zero.tracked.E) <= HALF_PHASE &&
    Math.abs(zero.half.overlap / zero.tracked.overlap - 1) <= HALF_OVERLAP
  const NK = converged ? p.N / 2 : p.N
  const w = windowOf(su, p.aB, NK)
  const along = [K * direction[0], K * direction[1], K * direction[2], 0]
  const sk = sector(su.group, littleGroup(su.group, along), p.R)
  const rk = unfold(s, r, sk)
  const ruleCount = reducedCounts(sk, su.table, alpha, su.theta)
  const count = transform ? transform(sk, ruleCount) : ruleCount
  const shift = thresholdRise(su, K)
  const center = w.center + shift
  const e = reducedEngine(sk, su.u, along, count, 'vector', opts)
  const x = referenceCorrelation(e, rk, NK + w.S - 1)

  log(`${p.name} K ${K}: correlation read, window shift ${shift}`)

  const lines = referenceLines(x, NK, center, w.L, center, w.S)
    .map(l => ({
      E: l.E,
      modulus: l.modulus,
      weight: l.weight,
      transfer: l.transfer,
      overlap: l.overlap,
      scaled: (2 * su.M0 - l.E) * 2 * su.mu * p.aB * p.aB,
    }))
    .sort((a, b) => a.E - b.E)

  return {
    K,
    direction: [direction[0], direction[1], direction[2]],
    NK,
    shift,
    repsK: sk.count,
    lines,
    seconds: (Date.now() - started) / 1000,
  }
}

// the genuine lines by overlap rank: [ground, 2s-like, third]
export function boostLevels(lines: readonly LineOut[]): LineOut[] {
  return lines.filter(genuine).sort((a, b) => b.overlap - a.overlap)
}

export function relativisticEnergy(input: {
  E0: number
  a: number
  K: number
}): number {
  return Math.sqrt(input.E0 ** 2 + 2 * input.a * input.E0 * input.K ** 2)
}

export function galileanEnergy(input: {
  E0: number
  a: number
  K: number
}): number {
  return input.E0 + input.a * input.K ** 2
}

export function relativityFraction(input: {
  E: number
  E0: number
  a: number
  K: number
}): number {
  const g = galileanEnergy(input)

  return (g - input.E) / (g - relativisticEnergy(input))
}
