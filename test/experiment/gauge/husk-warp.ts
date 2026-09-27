// The warp on the husk projection. E-FRC-0168 reads the physical field on the husk as the flat column sum of
// the D4 bulk, and says the hyperbolic bulk would weigh the column. Here it is weighed
// (code/measure/photon-husk, warpWeights): the {3,4,3,4} ball grows by lambda = 18.2787 per shell (E-GMT-0003,
// E-GMT-0031), so a shell j steps inside the boundary holds lambda^-j of the ball (E-HLG-0032), and a bulk link
// at depth layer j (depth read both ways from the husk sheet, the flat box having no bottom) weighs
// lambda^(-s j):
// - s = 0, the flat column sum of E-FRC-0168 and 0169
// - s = 1/3, each layer weighed by its shell's linear size
// - s = 1, each layer weighed by its shell's share of the ball
// The one-sheet restriction (all the weight on layer 0) is the limit, and is measured beside them.
//
// What was expected, from the construction alone, before the run: the flat sum is the only one whose husk flux
// obeys Gauss's law, since only it counts every link a column's flux leaves by; a weight that falls with depth
// moves the projection toward the sheet, so the static potential's falloff should move toward the sheet's, not
// toward 1 / r; and a projection that is no longer the k4 = 0 mode lets bulk modes with k4 not 0 onto the husk.
//
// Gates, fixed before the run. The bulk box side 12 (husk 12^3), N = 8192, K = 80:
// 1. Gauss's law: on a thermal field (beta near 3, no vibes, 300 beats settling and 2,000 read) and on a
//    static love and fear (e = 64), the s = 0 projection has 0 violations on every beat read, and s = 1/3 and
//    s = 1 have violations (more than 0)
// 2. the falloff: a love and a fear at husk separations 1 to 4 (as E-FRC-0169), 4,000 beats, the projected
//    flux averaged over beats 400 to 4,000, its husk energy fitted to a - b / r^p through r = 2, 3, 4:
//    p(0) < p(1/3) < p(1), and p(1) is nearer the sheet's p than p(0) is
// 3. light: on the thermal field, husk modes (1,0,0) and (2,0,0), the lagged estimator of E-FRC-0169: s = 0
//    has exactly 2 light branches, and s = 1 has more branches below the cut than s = 0 at (1,0,0)
// 4. isotropy: husk modes (3,0,0), (0,3,0), (0,0,3) against (2,2,1), (1,2,2), (2,1,2): s = 0 under 1 percent.
//    s = 1/3 and 1 are reported
//
// Depth L2: a projection defined and measured, with the flat sum as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { addHashedCurl, emptyPhotonState, makePhotonRule, photonBeatInPlace, photonLatticeD4, placePairAlong, type PhotonState } from '@/code/rule/photon-links'
import { accumulate, accumulateCross, leapfrogOmega, makeCorrelator, modeFrequencies, modeReader, type Correlator, type ModeVector } from '@/code/measure/photon-modes'
import { columnSum, huskEnergy, huskGaussViolations, makeHusk, projectLinksWeighted, warpWeights, type Husk } from '@/code/measure/photon-husk'

const SIDE = 12
const N = 8192
const K = 80
const CHARGE = 64
const LAMBDA = 18.2787
const LAG = 3
const WARPS = [0, 1 / 3, 1]
const MODES = [
  [1, 0, 0],
  [2, 0, 0],
  [3, 0, 0],
  [0, 3, 0],
  [0, 0, 3],
  [2, 2, 1],
  [1, 2, 2],
  [2, 1, 2],
]

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

type Projection = { name: string; weight: Float64Array }

function projections(husk: Husk): Projection[] {
  const sheet = Float64Array.from(husk.sheet)

  return [...WARPS.map(s => ({ name: `s${s === 1 / 3 ? 'Third' : s}`, weight: warpWeights(husk, LAMBDA, s) })), { name: 'sheet', weight: sheet }]
}

function thermal(husk: Husk, views: Projection[]): Record<string, number> {
  const bulk = husk.bulk
  const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false })
  const s: PhotonState = emptyPhotonState(rule)
  const target = (K * N) / (2 * Math.PI * 3)

  addHashedCurl(rule, s, Math.round(Math.sqrt((3 * target) / 4)), 5.3)

  const f = husk.lattice.firsts.length
  const readers = MODES.map(n => modeReader(husk.lattice, n))
  const zero = new Float64Array(husk.lattice.cells)
  const state = views.map(() => ({
    c0: MODES.map(() => makeCorrelator(f)),
    lag: MODES.map(() => makeCorrelator(f)),
    history: MODES.map(() => [] as ModeVector[]),
    gauss: 0,
  }))

  for (let t = 0; t < 2300; t++) {
    photonBeatInPlace(rule, s, t)

    if (t < 300) {
      continue
    }

    views.forEach((view, v) => {
      const field = projectLinksWeighted(husk, s.flux, view.weight)
      const st = state[v]

      if (!st) {
        return
      }

      st.gauss += huskGaussViolations(husk, field, zero)
      readers.forEach((r, m) => {
        const vec = r.read(field)
        const h = st.history[m] ?? []

        accumulate(st.c0[m] as Correlator, vec)

        if (h.length >= LAG) {
          accumulateCross(st.lag[m] as Correlator, vec, h[h.length - LAG] as ModeVector)
        }

        h.push(vec)

        if (h.length > LAG) {
          h.shift()
        }
      })
    })
  }

  const cut = leapfrogOmega((2 * Math.PI * K) / N, 12) / 2
  const out: Record<string, number> = {}

  views.forEach((view, v) => {
    const st = state[v]

    if (!st) {
      return
    }

    const freq = MODES.map((_, m) => modeFrequencies({ c0: st.c0[m] as Correlator, c1: st.lag[m] as Correlator, lag: LAG, tolerance: 1e-9 }))
    const [m1, m2] = freq
    const light = (m1?.omega ?? []).filter((w, i) => {
      const ratio = (m2?.omega[i] ?? 0) / w

      return w < cut && ratio >= 1.6 && ratio <= 2.1
    }).length
    const below = (m1?.omega ?? []).filter(w => w < cut).length
    const orbit = (from: number): number => mean(freq.slice(from, from + 3).map(m => mean((m?.omega ?? []).slice(0, 2))))

    out[`${view.name}ThermalGaussViolations`] = st.gauss
    out[`${view.name}LightBranches`] = light
    out[`${view.name}BranchesBelowCut`] = below
    out[`${view.name}PinnedDirections`] = m1?.nullDirections ?? -1
    out[`${view.name}LowestOmegaM1`] = m1?.omega[0] ?? Number.NaN
    out[`${view.name}Anisotropy`] = orbit(5) / orbit(2) - 1
  })

  return out
}

function falloff(u: readonly number[]): number {
  const [u2 = 0, u3 = 0, u4 = 0] = u
  const target = (u4 - u3) / (u3 - u2)
  const shape = (p: number): number => (3 ** -p - 4 ** -p) / (2 ** -p - 3 ** -p)

  let lo = 0.05
  let hi = 8

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2

    if (shape(mid) > target) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return (lo + hi) / 2
}

function charges(husk: Husk, views: Projection[]): Record<string, number> {
  const bulk = husk.bulk
  const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false, charge: CHARGE })
  const root = (v: number[]): number => bulk.vectors.findIndex(r => r.every((x, i) => x === v[i]))
  const up = root([1, 0, 0, 1])
  const down = root([1, 0, 0, -1])
  const energies = views.map(() => [] as number[])
  const gauss = views.map(() => 0)

  for (const r of [1, 2, 3, 4]) {
    const s = emptyPhotonState(rule)

    placePairAlong(rule, s, 0, Array.from({ length: r }, (_, i) => (i % 2 === 0 ? up : down)), 1)

    const charge = Float64Array.from(columnSum(husk, s.vibe), q => q * CHARGE)
    const sums = views.map(() => new Float64Array(husk.lattice.cells * 9))

    for (let t = 0; t < 4000; t++) {
      photonBeatInPlace(rule, s, t)

      if (t < 400) {
        continue
      }

      views.forEach((view, v) => {
        const p = projectLinksWeighted(husk, s.flux, view.weight)
        const sum = sums[v] as Float64Array

        for (let i = 0; i < p.length; i++) {
          sum[i] = (sum[i] ?? 0) + (p[i] ?? 0) / 3600
        }

        if (t % 400 === 0) {
          gauss[v] = (gauss[v] ?? 0) + huskGaussViolations(husk, p, charge)
        }
      })
    }

    views.forEach((_, v) => energies[v]?.push(huskEnergy(sums[v] as Float64Array)))
  }

  const out: Record<string, number> = {}

  views.forEach((view, v) => {
    const u = energies[v] ?? []

    u.forEach((e, i) => (out[`${view.name}EnergyR${i + 1}`] = e))
    out[`${view.name}Falloff`] = falloff(u.slice(1))
    out[`${view.name}ChargeGaussViolations`] = gauss[v] ?? 0
  })

  return out
}

export default experiment({
  id: 'gauge/husk-warp',
  code: 'E-FRC-0177',
  title:
    "the warp on the husk projection: weighing each depth layer of the column sum by the {3,4,3,4} warp factor, lambda^(-s j), breaks the husk's Gauss's law, moves the love-fear falloff toward the one-sheet restriction's rather than toward 1 / r, and lets bulk modes off the husk's k4 = 0 onto it, where the flat sum keeps Gauss's law, 2 light branches and isotropy",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const husk = makeHusk(photonLatticeD4({ side: SIDE }))
    const views = projections(husk)
    const th = thermal(husk, views)
    const ch = charges(husk, views)
    const m = { ...th, ...ch }
    const g = (key: string): number => m[key] ?? Number.NaN
    const ok =
      g('s0ThermalGaussViolations') === 0 &&
      g('s0ChargeGaussViolations') === 0 &&
      g('sThirdThermalGaussViolations') > 0 &&
      g('s1ThermalGaussViolations') > 0 &&
      g('s0Falloff') < g('sThirdFalloff') &&
      g('sThirdFalloff') < g('s1Falloff') &&
      Math.abs(g('s1Falloff') - g('sheetFalloff')) < Math.abs(g('s0Falloff') - g('sheetFalloff')) &&
      g('s0LightBranches') === 2 &&
      g('s1BranchesBelowCut') > g('s0BranchesBelowCut') &&
      Math.abs(g('s0Anisotropy')) < 0.01

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "on the side-12 box, the flat column sum keeps Gauss's law on the husk at every beat, 2 light branches and isotropy under 1 percent, while weighing the layers by the warp factor breaks Gauss's law, moves the love-fear falloff exponent up toward the one-sheet restriction's, and admits more branches below the massive cut",
      metrics: m,
      notes:
        'L2. The flat box has no bottom and no shells, so the warp enters only as a weight on its depth layers, read both ways from the sheet; the true hyperbolic column, which grows the number of links with depth, is not built. Which exponent s the geometry asks for is not settled by the repo: lambda^-1 per shell is its share of the ball (E-HLG-0032), lambda^(-1/3) its linear size. First run, 2026-09-25, fail, and it stands: Gauss, the flat sum\'s light and isotropy, and the falloff ordering p(0) = 1.62 < p(1/3) = 2.30 < p(1) = 3.58 all came out as expected, but the sheet restriction falls with p = 0.67, so the warp moves the falloff away from the sheet as well as away from 1 / r, past the bulk\'s own 2.78, and the gate asking it to near the sheet fails. The reason is in the layering: s = 1 keeps every link of the layer-0 dock, both of its depth steps, where the sheet keeps one, so the two are different projections. The warped projections also lose the light (0 branches that double between the two smallest k, lowest frequency 0.31 to 0.33 against 0.108 flat), pin no direction, and read 5.4 and 7.0 percent anisotropic; the gate asking s = 1 for more branches below the cut fails at 2 against 2.',
    })
  },
})
