// The spinor token's g, read by spin sector, with a calibration witness. (A STAND-IN, not the electron.)
//
// E-MTR-0014 read g off the two lowest Landau levels of the token and found every level doubly degenerate, the
// control included, so its estimator returned g = 0 by construction (disclosed there). Two things were mixed:
// the spin, and a lattice doubler. At k_z = 0 the walk commutes with S = tau_x sigma_z (code/measure/token-zeeman),
// which is the spin along the field on the particle band, so the spin can be separated EXACTLY instead of
// guessed from positions. What stays doubled inside a sector is a second species (the symbol's rest phase recurs
// at k = (pi, pi), where the two in-plane Dirac matrices both change sign, a rotation by pi that keeps the
// chirality, so its ladder repeats the first one level for level).
//
// THE ESTIMATOR. In the slow limit a level sits at E(n, s) = (n + 1/2) w - s (g / 4) w above the rest energy, s =
// +1 for the spin the field favors. Per sector, E_0 is the lowest particle level and w the first spacing. With
// E_lo and E_hi the lower and higher of the two sectors' E_0:
//   g_lo = 2 - 4 E_lo / w      g_hi = 4 E_hi / w - 2
// which agree when the ladders are Landau-and-Zeeman. For a Dirac particle E_lo = 0 exactly at any field (the
// n = 0 spin-favored level sits at the rest mass), so g_lo = 2 is the Dirac signature. The rest energy is phase 0
// per period for every coin used (the slot-symmetric state has coin eigenvalue 1).
//
// WALKS (schedule x, y, z, up, down, charge 1, k_y = 0, B = 2 pi / L on L = 48, 96, 192):
// - token: the model's fear coin, mu = pi / 3 per beat (code/rule/spinor-token), spin locked
// - calibration witness: the same walk with a light coin, mu = pi / 60, whose continuum limit is a Dirac particle
//   and must read g = 2; if it does not, the estimator is not trusted and nothing it says about the token counts
// - control: the palindrome x, y, y, x with the spin a spectator (S = sigma_z), which must read g = 0 exactly
//
// Gates, fixed before the first run:
// I1 sector leak below 1e-12 for every walk, and the union of the two sectors' phases equals the full chain's
//    (code/measure/token-landau) at L = 48 for the token to 1e-10
// I2 the control's two sectors have identical particle ladders to 1e-9 at every L (g = 0)
// C1 the calibration witness reads |g_lo - 2| < 0.1 at L = 192
// H1 the token reads |g_lo - 2| < 0.1 at L = 192
// H2 the token's g_lo and g_hi agree to 0.1 at L = 192
// H3 the token's |g_lo - 2| falls as B falls over L = 48, 96, 192
// PASS only if all hold. If C1 fails, the status is fail whatever H1 says.
//
// Depth L2: a known consequence of the Dirac structure, measured on a lattice walk built with the model's coin.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { chainPhases } from '@/code/measure/token-landau'
import { sectorPhases, type ZeemanInput } from '@/code/measure/token-zeeman'
import { type Mode, type Step } from '@/code/rule/spinor-token'

const TOKEN: readonly Step[] = ['x', 'y', 'z', 'up', 'down']
const PALINDROME: readonly Step[] = ['x', 'y', 'y', 'x']
const SIDES = [48, 96, 192]
const MODEL_COIN = Math.PI / 3
const LIGHT_COIN = Math.PI / 60
const CLUSTER = 1e-7

type Walk = { name: string; schedule: readonly Step[]; mode: Mode; coinAngle: number }

const WALKS: Walk[] = [
  { name: 'token', schedule: TOKEN, mode: 'locked', coinAngle: MODEL_COIN },
  { name: 'calibration', schedule: TOKEN, mode: 'locked', coinAngle: LIGHT_COIN },
  { name: 'spectator', schedule: PALINDROME, mode: 'spectator', coinAngle: MODEL_COIN },
]

// the rest gap of a walk per period: the slot-antisymmetric coin eigenvalue e^(i 2 mu) per coin
const restGap = (w: Walk): number => {
  const raw = (2 * w.coinAngle * w.schedule.length) % (2 * Math.PI)

  return Math.min(raw, 2 * Math.PI - raw)
}

// the side the particle band curves to: the sign of the phase nearest 0 in the free walk at a small k_y
function bandSign(w: Walk): number {
  const { phases } = sectorPhases({ side: 8, schedule: w.schedule, mode: w.mode, field: 0, charge: 1, ky: 0.02, coinAngle: w.coinAngle }, 1)
  const nearest = phases.reduce((best, p) => (Math.abs(p) < Math.abs(best) ? p : best), Infinity)

  return Math.sign(nearest)
}

type Cluster = { level: number; count: number }

function clusters(values: readonly number[]): Cluster[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: Cluster[] = []

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

type Reading = {
  side: number
  field: number
  up: Cluster[]
  down: Cluster[]
  leak: number
  omega: number
  gLo: number
  gHi: number
  ladderGap: number
}

function read(w: Walk, side: number, sign: number): Reading {
  const field = (2 * Math.PI) / side
  const input: ZeemanInput = { side, schedule: w.schedule, mode: w.mode, field, charge: 1, ky: 0, coinAngle: w.coinAngle }
  // particle levels only: the antiparticle band starts a rest gap away
  const window = restGap(w) / 2
  const sector = (s: 1 | -1): { levels: Cluster[]; leak: number } => {
    const { phases, leak } = sectorPhases(input, s)

    return { levels: clusters(phases.map(p => sign * p).filter(e => Math.abs(e) < window)), leak }
  }
  const plus = sector(1)
  const minus = sector(-1)
  const e0 = [plus.levels[0]?.level ?? NaN, minus.levels[0]?.level ?? NaN]
  const spacing = [(plus.levels[1]?.level ?? NaN) - (plus.levels[0]?.level ?? NaN), (minus.levels[1]?.level ?? NaN) - (minus.levels[0]?.level ?? NaN)]
  const omega = ((spacing[0] ?? 0) + (spacing[1] ?? 0)) / 2
  const lo = Math.min(e0[0] ?? 0, e0[1] ?? 0)
  const hi = Math.max(e0[0] ?? 0, e0[1] ?? 0)
  const count = Math.min(plus.levels.length, minus.levels.length, 6)
  let ladderGap = 0

  for (let k = 0; k < count; k++) {
    ladderGap = Math.max(ladderGap, Math.abs((plus.levels[k]?.level ?? 0) - (minus.levels[k]?.level ?? 0)))
  }

  return { side, field, up: plus.levels.slice(0, 6), down: minus.levels.slice(0, 6), leak: Math.max(plus.leak, minus.leak), omega, gLo: 2 - (4 * lo) / omega, gHi: (4 * hi) / omega - 2, ladderGap }
}

export default experiment({
  id: 'matter/token-zeeman',
  code: 'E-MTR-0015',
  title:
    'the g of the spinor token, a STAND-IN, read by spin sector: at k_z = 0 the walk conserves S = tau_x sigma_z, the spin along the field, so its Landau ladders separate exactly, and g is read from where each ladder starts against the rest energy, beside a light-coin Dirac walk that must read 2 and a spectator walk that must read 0',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // I1 at L = 48 for the token
    const token = WALKS[0] as Walk
    const side0 = SIDES[0] ?? 48
    const input0: ZeemanInput = { side: side0, schedule: token.schedule, mode: token.mode, field: (2 * Math.PI) / side0, charge: 1, ky: 0, coinAngle: MODEL_COIN }
    const union = [...sectorPhases(input0, 1).phases, ...sectorPhases(input0, -1).phases].sort((a, b) => a - b)
    const full = chainPhases({ side: side0, schedule: token.schedule, mode: token.mode, field: (2 * Math.PI) / side0, charge: 1, ky: 0 }).sort((a, b) => a - b)
    const unionGap = Math.max(...union.map((p, i) => Math.abs(p - (full[i] ?? 0))))

    const readings = WALKS.map(w => {
      const sign = bandSign(w)

      return { walk: w, sign, rows: SIDES.map(s => read(w, s, sign)) }
    })
    const byName = (name: string) => readings.find(r => r.walk.name === name)?.rows ?? []
    const tokenRows = byName('token')
    const calibration = byName('calibration')
    const spectator = byName('spectator')
    const last = (rows: Reading[]): Reading | undefined => rows[rows.length - 1]
    const maxLeak = Math.max(...readings.flatMap(r => r.rows.map(x => x.leak)))
    const i1 = maxLeak < 1e-12 && unionGap < 1e-10
    const i2 = spectator.every(r => r.ladderGap < 1e-9)
    const c1 = Math.abs((last(calibration)?.gLo ?? 0) - 2) < 0.1
    const h1 = Math.abs((last(tokenRows)?.gLo ?? 0) - 2) < 0.1
    const h2 = Math.abs((last(tokenRows)?.gLo ?? 0) - (last(tokenRows)?.gHi ?? 99)) < 0.1
    const h3 = tokenRows.every((r, i) => i === 0 || Math.abs(r.gLo - 2) < Math.abs((tokenRows[i - 1]?.gLo ?? 0) - 2))
    const ok = i1 && i2 && c1 && h1 && h2 && h3
    const metricRows = (name: string, rows: Reading[]): [string, number][] =>
      rows.flatMap(r => [
        [`${name}L${r.side}_gLo`, Number(r.gLo.toFixed(6))],
        [`${name}L${r.side}_gHi`, Number(r.gHi.toFixed(6))],
        [`${name}L${r.side}_omega`, Number(r.omega.toFixed(6))],
        [`${name}L${r.side}_omegaOverB`, Number((r.omega / r.field).toFixed(6))],
        [`${name}L${r.side}_upE0OverOmega`, Number(((r.up[0]?.level ?? 0) / r.omega).toFixed(6))],
        [`${name}L${r.side}_downE0OverOmega`, Number(((r.down[0]?.level ?? 0) / r.omega).toFixed(6))],
        [`${name}L${r.side}_upE0Multiplicity`, r.up[0]?.count ?? 0],
        [`${name}L${r.side}_downE0Multiplicity`, r.down[0]?.count ?? 0],
      ])
    const ladder = (r: Reading | undefined): string =>
      r ? `S=+1 ${r.up.map(c => `${(c.level / r.omega).toFixed(3)}x${c.count}`).join(' ')} | S=-1 ${r.down.map(c => `${(c.level / r.omega).toFixed(3)}x${c.count}`).join(' ')}` : 'none'

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the sectors are exact (leak ${maxLeak.toExponential(1)}, union against the full chain ${unionGap.toExponential(1)}); the spectator control's two spin ladders agree to ${Math.max(...spectator.map(r => r.ladderGap)).toExponential(1)} (g = 0); the light-coin Dirac witness reads g_lo = ${calibration.map(r => r.gLo.toFixed(4)).join(', ')} and g_hi = ${calibration.map(r => r.gHi.toFixed(4)).join(', ')}; the token reads g_lo = ${tokenRows.map(r => r.gLo.toFixed(4)).join(', ')} and g_hi = ${tokenRows.map(r => r.gHi.toFixed(4)).join(', ')} at B = 2 pi / ${SIDES.join(', ')}, with omega_c / B = ${tokenRows.map(r => (r.omega / r.field).toFixed(4)).join(', ')} against the slow-limit 1/sqrt 3 = 0.5774`,
      metrics: {
        sectorLeakMax: maxLeak,
        sectorUnionGap: unionGap,
        tokenBandSign: readings[0]?.sign ?? 0,
        calibrationBandSign: readings[1]?.sign ?? 0,
        // REPORTED, added after the first run: g_lo is linear in B over the last two fields, so its zero-field
        // value is 2 g(192) - g(96)
        tokenZeroFieldG: Number((2 * (tokenRows[2]?.gLo ?? 0) - (tokenRows[1]?.gLo ?? 0)).toFixed(6)),
        ...Object.fromEntries(metricRows('token', tokenRows)),
        ...Object.fromEntries(metricRows('calibration', calibration)),
      },
      control: {
        ...Object.fromEntries(metricRows('spectator', spectator)),
        spectatorLadderGapMax: Math.max(...spectator.map(r => r.ladderGap)),
      },
      notes: `L2, STAND-IN. Ladders at L = 192 in units of omega_c, level x multiplicity: token ${ladder(last(tokenRows))}; calibration ${ladder(last(calibration))}; spectator ${ladder(last(spectator))}. FIRST RUN, DISCLOSED: I1, I2, C1, H2 and H3 held and H1 failed; the zero-field extrapolation was added after it as a reported metric, and gates were not moved. H3 held for the wrong reason: |g - 2| falls because g falls toward 4, not toward 2. READING: the witness is calibrated (the light coin puts its spin-favored ladder at -0.025 omega_c, the Dirac zero mode, g_lo = 2.10), and the token is not Dirac. Its two ladders are (n - 1/2) omega_c and (n + 3/2) omega_c to 3 percent, a Zeeman shift of one whole omega_c each way, so g = 4.000 in the zero-field limit (4.2389, 4.1195, 4.0598 are linear in B). The spin-favored level sits HALF A SPACING BELOW the rest energy, which no Dirac particle does. The multiplicity 2 inside every sector is the second species at k = (pi, pi), which E-MTR-0014 mistook for a spin pair. A probe over the coin angle (tmp/probe-zeeman-mu.ts, not gated) reads 2.10 at pi/60 and 2.36 at pi/30, so the light walks approach 2 slowly (they are relativistic at these fields), while at the model's pi/3 the value is 4. Between those the rest point is no longer the band bottom, other bands enter the window, and the estimator does not apply, so no law in mu is claimed. The cause is not identified. The likeliest is that the model coin is not small: over one period it winds 5 x 2 pi / 3 = 2 pi + 4 pi / 3, so the rest gap of 2 pi / 3 is reached the long way round, the Compton length is 0.74 docks (E-MTR-0013), and the token lives deep in the lattice regime, where nothing ties the spin's field coupling to its orbital mass. The spin-averaged cyclotron is also low, omega_c / B = 0.562 against 1/sqrt 3 (E-FRC-0176 found the same shortfall for the spinless walk). So the locked stream gives the token a real magnetic moment, spin resolved and exactly conserved, but at twice the Dirac value. An electron built this way would need a light coin, which the model's fixed fear coin is not.`,
    })
  },
})
