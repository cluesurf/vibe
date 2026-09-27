// The g of a spinor token read from its Landau ladders, spin sector by spin sector: the estimator of E-MTR-0015
// promoted to code so E-MTR-0016 and E-MTR-0017 can apply it to any schedule and coin. (A STAND-IN, see
// code/rule/spinor-token.)
//
// code/measure/token-zeeman gives the phases per period of each exactly conserved spin sector S = tau_x sigma_z
// of the token's Landau chain (field B = 2 pi / L along z, k_y = 0). The particle levels are the phases within half
// the rest gap of the rest energy (phase 0), read with the sign that makes the band's curvature positive (from
// the free walk at a small k_y). Per sector, E_0 is the lowest level and w the first spacing. With E_lo and E_hi
// the lower and higher of the two sectors' E_0 and w the mean spacing:
//   g_lo = 2 - 4 E_lo / w      g_hi = 4 E_hi / w - 2
// which agree when the ladders are Landau-and-Zeeman, g_lo = 2 being the Dirac zero mode. Levels are clustered
// to 1e-7 (the second species at k = (pi, pi) doubles them).

import { sectorPhases } from '@/code/measure/token-zeeman'
import { type Mode, type Step } from '@/code/rule/spinor-token'

const CLUSTER = 1e-7

export type LadderCluster = { level: number; count: number }

export type LandauG = {
  side: number
  field: number
  up: LadderCluster[]
  down: LadderCluster[]
  leak: number
  omega: number
  gLo: number
  gHi: number
}

function clusters(values: readonly number[]): LadderCluster[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: LadderCluster[] = []

  for (const v of sorted) {
    const last = out[out.length - 1]

    if (last && Math.abs(v - last.level) < CLUSTER) {
      last.count++
    } else {
      out.push({ level: v, count: 1 })
    }
  }

  return out
}

// the rest gap per period, |2 N mu| folded into [0, pi]
export function restGapOf(input: { schedule: readonly Step[]; coinAngle: number }): number {
  const raw = (2 * input.coinAngle * input.schedule.length) % (2 * Math.PI)

  return Math.min(raw, 2 * Math.PI - raw)
}

// the side the particle band curves to: the sign of the phase nearest 0 in the free walk at a small k_y
export function bandSignOf(input: { schedule: readonly Step[]; mode: Mode; coinAngle: number }): number {
  const { phases } = sectorPhases({ side: 8, schedule: input.schedule, mode: input.mode, field: 0, charge: 1, ky: 0.02, coinAngle: input.coinAngle }, 1)
  const nearest = phases.reduce((best, p) => (Math.abs(p) < Math.abs(best) ? p : best), Infinity)

  return Math.sign(nearest)
}

export function landauG(input: { schedule: readonly Step[]; mode: Mode; coinAngle: number; side: number; sign: number }): LandauG {
  const { schedule, mode, coinAngle, side, sign } = input
  const field = (2 * Math.PI) / side
  const window = restGapOf({ schedule, coinAngle }) / 2
  const sector = (s: 1 | -1): { levels: LadderCluster[]; leak: number } => {
    const { phases, leak } = sectorPhases({ side, schedule, mode, field, charge: 1, ky: 0, coinAngle }, s)

    return { levels: clusters(phases.map(p => sign * p).filter(e => Math.abs(e) < window)), leak }
  }
  const plus = sector(1)
  const minus = sector(-1)
  const e0 = [plus.levels[0]?.level ?? NaN, minus.levels[0]?.level ?? NaN]
  const spacing = [(plus.levels[1]?.level ?? NaN) - (plus.levels[0]?.level ?? NaN), (minus.levels[1]?.level ?? NaN) - (minus.levels[0]?.level ?? NaN)]
  const omega = ((spacing[0] ?? 0) + (spacing[1] ?? 0)) / 2
  const lo = Math.min(e0[0] ?? 0, e0[1] ?? 0)
  const hi = Math.max(e0[0] ?? 0, e0[1] ?? 0)

  return { side, field, up: plus.levels.slice(0, 6), down: minus.levels.slice(0, 6), leak: Math.max(plus.leak, minus.leak), omega, gLo: 2 - (4 * lo) / omega, gHi: (4 * hi) / omega - 2 }
}
