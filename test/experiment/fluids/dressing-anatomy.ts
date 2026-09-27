// What a lone disturbance's spreading is in the viscous scatter weave: pair creation, carried sound and
// shear, or microscopic decorrelation. Is "hydrodynamics or low dressing" a real conflict?
//
// The acceptance battery's dressing is the number of slots where a run seeded with one lone love differs
// from the unseeded run, both born empty (E-FRC-0125). E-FRC-0137 found that in the committed knit and its
// hop-free cousins it is pair creation: exactly one plus twice the pairs the love leaves behind. E-FLD-0026
// found that every scatter weave with a constant viscosity dresses more than the committed rule (the
// viscous member 10,391 slots against 1,508 by the fourth period). This takes the difference apart, with
// the gate left as it is.
//
// Rules: the committed knit, the kinetic scatter weave (lone condition, 6 scatterings a beat, E-FLD-0025)
// and the viscous one (matched condition, 36 a beat, E-FLD-0026), on the D4 box at sides 9 and 13, a lone
// love on each of 4 directions at the center, 192 beats (eight schedule periods). Every beat:
// - the support S, slots that differ, split into slots the seeded run holds a tone where the plain run is
//   calm (made), the reverse (taken), and opposite tones (turned);
// - the extra tone count dN of the seeded run over the plain one, which E-FRC-0137's mechanism makes equal
//   to S (every differing slot a member of a pair the love made, plus the love);
// - the radius of the support from the source (largest and mean over differing docks, in root-length
//   units, D4 box distance) and the front speed, largest radius over t, against the tone speed sqrt 2;
// - the coarse difference: the sum over docks of |dN_dock| and of |dP_dock| (L1), against the one unit
//   of momentum the love adds (P is exact, so the total dP is the love's root at every beat).
// Read: the growth exponent of S against t before a quarter of the box differs (4 for a ballistic 4D
// front, 2 for a diffusive one), the fraction of the box the support saturates at, the share of S that is
// made, taken and turned, and dN over S.
//
// Gates, fixed before this run, so the reading is not a matter of taste: P exact in every scatter-weave run
// (the first run asked it of the committed knit too, which breaks P by its hop, E-FLD-0021, and failed on
// that alone; the gate was wrong for that rule, not a finding); the
// committed knit's support is its made count (dN equals S, E-FRC-0137's mechanism, as the control that
// the split can say "pair creation"); and for the viscous weave the reading is stated as whichever holds:
// PAIR CREATION if dN is at least half of S at the end of the fourth period, DECORRELATION if the support's
// front moves at no less than half the tone speed while dN is under a tenth of S. The verdict fails if
// neither holds, so the question gets one answer or none.
//
// Depth L2: a mechanism read off exact runs, with the committed knit as its control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type Collision, turningWeave } from '@/code/rule/collision'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { beat } from '@/code/rule/lattice-gas'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { linearFit } from '@/code/measure/regression'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxCell, d4BoxDistance, d4BoxMesh } from '@/code/substrate/d4-box'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { momentumOf } from '@/code/rule/momentum-weave'
import { HEAD_TURN_SPEC, scatterCollision, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'

const BEATS = 192
const DIRECTIONS = [0, 5, 13, 22]
const SIDES = [9, 13]
const ROOTS = rootsD4()

type Run = {
  readonly support: number[]
  readonly made: number[]
  readonly taken: number[]
  readonly turned: number[]
  readonly extra: number[]
  readonly radius: number[]
  readonly meanRadius: number[]
  readonly coarseCount: number[]
  readonly coarseMomentum: number[]
  readonly momentumExact: boolean
}

function follow(side: number, rule: (t: number) => Collision, direction: number): Run {
  const mesh = d4BoxMesh({ side })
  const center = d4BoxCell({ coordinates: [Math.floor(side / 2), Math.floor(side / 2), Math.floor(side / 2), Math.floor(side / 2)], side })
  const distance = Float64Array.from({ length: mesh.cellCount }, (_, x) => d4BoxDistance({ a: x, b: center, side }))
  const out: Run = { support: [], made: [], taken: [], turned: [], extra: [], radius: [], meanRadius: [], coarseCount: [], coarseMomentum: [], momentumExact: true }

  let plain: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)

  seeded.data[center * 24 + direction] = 1

  const love = ROOTS[direction] ?? []
  let exact = true

  for (let t = 0; t < BEATS; t++) {
    plain = beat(plain, rule(t))
    seeded = beat(seeded, rule(t))

    let made = 0
    let taken = 0
    let turned = 0
    let extra = 0
    let radius = 0
    let radiusSum = 0
    let docks = 0
    let coarseCount = 0
    let coarseMomentum = 0

    for (let x = 0; x < mesh.cellCount; x++) {
      let differs = false
      let dn = 0
      const dp = [0, 0, 0, 0]

      for (let d = 0; d < 24; d++) {
        const a = plain.data[x * 24 + d] ?? 0
        const b = seeded.data[x * 24 + d] ?? 0

        if (a !== b) {
          differs = true

          if (a === 0) made++
          else if (b === 0) taken++
          else turned++
        }

        const change = Math.abs(b) - Math.abs(a)

        dn += change

        for (let k = 0; k < 4; k++) dp[k] = (dp[k] ?? 0) + change * (ROOTS[d]?.[k] ?? 0)
      }

      extra += dn
      coarseCount += Math.abs(dn)
      coarseMomentum += dp.reduce((s, v) => s + Math.abs(v), 0)

      if (differs) {
        const r = distance[x] ?? 0

        radius = Math.max(radius, r)
        radiusSum += r
        docks++
      }
    }

    const total = [0, 1, 2, 3].map(k => (momentumOf(seeded.data).p[k] ?? 0) - (momentumOf(plain.data).p[k] ?? 0))

    exact = exact && total.every((v, k) => v === (love[k] ?? 0))
    out.support.push(made + taken + turned)
    out.made.push(made)
    out.taken.push(taken)
    out.turned.push(turned)
    out.extra.push(extra)
    out.radius.push(radius)
    out.meanRadius.push(docks > 0 ? radiusSum / docks : 0)
    out.coarseCount.push(coarseCount)
    out.coarseMomentum.push(coarseMomentum)
  }

  return { ...out, momentumExact: exact }
}

// the growth exponent of the support before it covers a quarter of the box, and its end fraction
function reading(runs: readonly Run[], side: number) {
  const slots = side ** 4 * 24
  const mean = (pick: (r: Run) => number[], t: number): number => runs.reduce((s, r) => s + (pick(r)[t] ?? 0), 0) / runs.length
  const support = Array.from({ length: BEATS }, (_, t) => mean(r => r.support, t))
  const xs: number[] = []
  const ys: number[] = []

  for (let t = 3; t < BEATS; t++) {
    const s = support[t] ?? 0

    if (s >= slots / 4) break
    if (s > 1) {
      xs.push(Math.log(t + 1))
      ys.push(Math.log(s))
    }
  }

  const fit = xs.length >= 3 ? linearFit({ xs, ys }) : { slope: 0 }
  const at = (t: number) => ({
    support: support[t] ?? 0,
    made: mean(r => r.made, t),
    taken: mean(r => r.taken, t),
    turned: mean(r => r.turned, t),
    extra: mean(r => r.extra, t),
    radius: mean(r => r.radius, t),
    meanRadius: mean(r => r.meanRadius, t),
    coarseCount: mean(r => r.coarseCount, t),
    coarseMomentum: mean(r => r.coarseMomentum, t),
  })
  // the front speed: largest radius over t, over the beats before the front wraps (radius under L / 2)
  const speeds: number[] = []

  for (let t = 1; t < BEATS; t++) {
    const r = mean(q => q.radius, t)

    if (r > 0 && r < side / 2) speeds.push(r / (t + 1))
  }

  return {
    exponent: fit.slope,
    endFraction: (support[BEATS - 1] ?? 0) / slots,
    frontSpeed: speeds.length > 0 ? Math.max(...speeds) : 0,
    period4: at(95),
    end: at(BEATS - 1),
  }
}

export default experiment({
  id: 'fluids/dressing-anatomy',
  code: 'E-FLD-0029',
  title:
    "the viscous scatter weave's large dressing is pair creation, not transport: in the committed knit, the kinetic and the viscous scatter weaves alike every slot where a lone love's run differs is a tone the plain run lacks (made equals the support and the extra tone count, none taken, none turned), so the support is one plus twice the pairs the love sets off (E-FRC-0137's mechanism); in the viscous weave the pairs avalanche, the support growing as t^3.6 to t^4.1 behind a front at the tone speed sqrt 2 until a third of the box is new pairs, while the love's own momentum is one unit throughout; so the conflict E-FLD-0026 found is between a fluid and a vacuum that does not answer a lone tone with a pair avalanche, and the dressing gate measures the vacuum's stability, not the fluid's transport",
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))
    const kinetic: ScatterWeaveSpec = { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule('pair'), condition: 'lone' }
    const viscous: ScatterWeaveSpec = { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
    const rules: [string, (opposite: number[]) => (t: number) => Collision][] = [
      ['committed', opposite => turningWeave({ opposite })],
      ['kinetic', opposite => scatterCollision({ spec: kinetic, opposite })],
      ['viscous', opposite => scatterCollision({ spec: viscous, opposite })],
    ]
    const readings: Record<string, ReturnType<typeof reading>> = {}
    let momentumExact = true

    for (const [name, make] of rules) {
      for (const side of SIDES) {
        const rule = make(meshOpposites(d4BoxMesh({ side })))
        const runs = DIRECTIONS.map(d => follow(side, rule, d))

        // the committed knit breaks P by its hop (E-FLD-0021), so only the scatter weaves are held to it
        momentumExact = momentumExact && (name === 'committed' || runs.every(r => r.momentumExact))
        readings[`${name}${side}`] = reading(runs, side)
      }
    }

    const committed = readings.committed9
    const viscous9 = readings.viscous9
    const committedIsPairs = committed !== undefined && Math.abs(committed.period4.extra - committed.period4.support) < 1e-9
    const pairCreation = viscous9 !== undefined && viscous9.period4.extra >= viscous9.period4.support / 2
    const decorrelation = viscous9 !== undefined && viscous9.frontSpeed >= Math.SQRT2 / 2 && viscous9.period4.extra < viscous9.period4.support / 10

    const ok = momentumExact && committedIsPairs && (pairCreation !== decorrelation)

    const metrics: Record<string, number> = { pairCreation: pairCreation ? 1 : 0, decorrelation: decorrelation ? 1 : 0, committedSupportIsPairs: committedIsPairs ? 1 : 0 }

    for (const [key, r] of Object.entries(readings)) {
      metrics[`${key}_exponent`] = r.exponent
      metrics[`${key}_endFraction`] = r.endFraction
      metrics[`${key}_frontSpeed`] = r.frontSpeed

      for (const [when, v] of [
        ['P4', r.period4],
        ['End', r.end],
      ] as const) {
        metrics[`${key}_support${when}`] = v.support
        metrics[`${key}_made${when}`] = v.made
        metrics[`${key}_taken${when}`] = v.taken
        metrics[`${key}_turned${when}`] = v.turned
        metrics[`${key}_extraTones${when}`] = v.extra
        metrics[`${key}_radius${when}`] = v.radius
        metrics[`${key}_meanRadius${when}`] = v.meanRadius
        metrics[`${key}_coarseCount${when}`] = v.coarseCount
        metrics[`${key}_coarseMomentum${when}`] = v.coarseMomentum
      }
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'P is exact in every scatter-weave run; the committed support is its made count (pair creation, the control that the split can say so); the viscous reading is pair creation or decorrelation and not both, the one printed',
      metrics,
      notes:
        'L2, exact, no random numbers. Means over 4 directions. Every rule here answers a lone love only by making pairs: at every beat of every run the support is all made slots and equals the extra tone count. What differs is how many. By the fourth period the committed knit has made 112 (side 9) and 154 (side 13) slots of pairs, the kinetic scatter weave 223 and 244, the viscous one 2,170 and 762, and by the eighth period the viscous weave has filled a third of the box (52,561 of 157,464 slots at side 9, 228,050 of 685,464 at side 13) where the committed knit stays under a quarter of a percent. The growth exponent before a quarter of the box (2.0 committed, 2.6 kinetic, 3.6 and 4.1 viscous at sides 9 and 13) against 4 for a front filling a ball in four dimensions, and the front moves at the tone speed sqrt 2 in both scatter weaves (1.06 committed): the avalanche fills the light cone. The coarse momentum difference (sum over docks of |dP|) grows with it, since a pair made in one dock has its members in two docks a beat later, but its total is always the one unit the love brought. So the dressing of a fluid-like scatter weave is not sound or shear being carried off (those carry one unit of momentum and cannot make tones); it is the vacuum answering the love with pairs, faster the more often lone tones and pair members scatter apart and leave calm wires for the clock to fill. Whether that is a defect is a question about the vacuum, not the viscosity: a rule whose vacuum does not make pairs from calm (the flip table of E-FLD-0027) cannot dress this way at all. The gate is left as it is; what it measures is now named.',
    })
  },
})
