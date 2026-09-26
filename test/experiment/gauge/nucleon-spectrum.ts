// The lightest color-singlet levels of the paid-string rule on the D4 box, and whether a three-quark singlet
// binds: the meson and the baryon (three loves, the charge +1 of E-FRC-0170's Q = (love - fear) / 3, a STAND-IN
// for a proton, with no spin).
//
// E-FRC-0171 found that no triple of vibes travels as one object on the committed knit, the combined knit or the
// cold weave, all of which carry no paid string. Here the string is paid (E-FRC-0129 line): the rule is
// code/rule/string-graph on the D4 box, mass 4, tension 1, demon capacity 4, unchanged.
//
// The spectrum. A singlet's energy is its mass term plus tension times its paid links, so its levels are
// E = 2 mass + n (meson, n >= 1) and 3 mass + n (baryon, n >= 2), and E-FRC-0195 counts their degeneracies
// Omega(n) on the infinite lattice (meson 24, 552, 12,696, 301,392, baryon 828, 43,584, 1,683,972, counted with
// a love at the origin). In the canonical measure the demons impose, a singlet sits at level n with weight
// Omega(n) x^n. The level occupations measured from the dynamics are the correlator reading of that spectrum:
// P(n) / P(lowest) = Omega(n) x^(n - lowest) / Omega(lowest), x read from the measured demons. This is a
// prediction with no fitted number. The corrections it leaves out are vacuum loops touching a chain (relative
// order x^3 times the triangles it touches) and other singlets (a dilute gas).
//
// Measured on the side-9 box, 16 mesons and 8 baryon-antibaryon pairs, at fills 0.02 and 0.03, 20,000 beats after
// 500 settling, every 4th beat read, each singlet read as a piece of paid flux (code/measure/nucleon-gas):
// - the level occupations of pieces holding one love and one fear (mesons) and three loves or three fears
//   (baryons and antibaryons), against the counted prediction
// - baryon binding: the share of the 24 loves of the baryons that sit in pieces of exactly three loves, and the
//   mean spread (largest love-love distance in a piece) on the husk and in the bulk, against the same seeds run
//   with tension 0 (5,000 beats), where nothing pays for a string
//
// Gates, fixed before the run:
// - the energy and Gauss's law exact on every checked snapshot, the fast kernel equal to graphBeat
// - at both fills the meson ratios P(2) / P(1) and P(3) / P(1) and the baryon ratio P(3) / P(2) lie within 5
//   percent of the counted prediction
// - at both fills at least 0.9 of the baryon loves sit in three-love pieces, and the mean husk spread of those
//   pieces is under a tenth of the tension-0 control's
// Status pass if all hold, partial if the binding gate holds and a level ratio misses, fail otherwise.
//
// Depth L2: a constructed rule, measured against an exact count.
//
// The first run, 2026-09-26, recorded as it came out (98.9 s, tmp/frc0197.log): fail, on both gates.
// - energy, Gauss's law and the kernel exact
// - the levels: every measured ratio sits BELOW the count, never above. Meson P(2)/P(1) 0.427 against 0.441
//   (-3.2 percent) and 0.611 against 0.641 (-4.7); P(3)/P(1) 0.174 against 0.195 (-10.4) and 0.371 against 0.410
//   (-9.7); baryon P(3)/P(2) 0.938 against 1.010 (-7.1) and 1.386 against 1.466 (-5.4). Six of six below, the
//   deficit growing with the level: the sign of what the count leaves out, excluded volume (other singlets and a
//   finite box forbid some chains), not of a wrong degeneracy. The 5 percent gate fails on four of six
// - the baryon holds: 0.986 and 0.944 of the baryon loves sit in three-love pieces, at mean husk spread 2.36 and
//   2.91 (bulk 2.66 and 3.30). But the gate's control is broken: with tension 0 the strings cost nothing, the
//   whole gas merges into pieces with as many fears as loves, and no three-love piece exists to measure
//   (control spread 0, held share 0). "Under a tenth of 0" cannot hold, so the binding gate fails by the
//   design of its control, not by a reading of the baryon. The number that stands is the held share: a paid Z3
//   string keeps three loves one singlet where E-FRC-0171 found no triple held on the unpaid knits.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { makeStringGraph, type StringGraph } from '@/code/rule/string-graph'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { linkAnimals, singletLevels } from '@/code/measure/string-levels'
import { boxDisplacement, bulkLength, huskLength, makeBoxGeometry, runGas, singletPieces, type BoxGeometry } from '@/code/measure/nucleon-gas'

const SIDE = 9
const MESONS = 16
const BARYON_PAIRS = 8
const FILLS = [0.02, 0.03]
const SETTLE = 500
const BEATS = 20000
const CONTROL_BEATS = 5000
const EVERY = 4
const CAPACITY = 4
const LEVELS = 3
const RATIO_TOLERANCE = 0.05
const HELD_SHARE = 0.9
const SPREAD_FACTOR = 10

type Reading = {
  x: number
  exact: boolean
  mesonLevels: number[]
  baryonLevels: number[]
  heldShare: number
  huskSpread: number
  bulkSpread: number
}

function readGas(input: { graph: StringGraph; geometry: BoxGeometry; fill: number; beats: number }): Reading {
  const { graph, geometry, fill, beats } = input
  const mesonLevels = new Array<number>(8).fill(0)
  const baryonLevels = new Array<number>(8).fill(0)

  let held = 0
  let baryonLoves = 0
  let huskSpread = 0
  let bulkSpread = 0
  let triples = 0

  const out = runGas({
    graph,
    mesons: MESONS,
    baryons: BARYON_PAIRS,
    fill,
    settle: SETTLE,
    beats,
    every: EVERY,
    look: state => {
      for (const p of singletPieces(graph, state)) {
        const level = Math.min(7, p.paid)

        if (p.loves.length === 1 && p.fears.length === 1) {
          mesonLevels[level] = (mesonLevels[level] ?? 0) + 1
        }

        const triple = (p.loves.length === 3 && p.fears.length === 0) || (p.loves.length === 0 && p.fears.length === 3)

        if (triple) {
          baryonLevels[level] = (baryonLevels[level] ?? 0) + 1

          const members = p.loves.length === 3 ? p.loves : p.fears

          let husk = 0
          let bulk = 0

          for (const a of members) {
            for (const b of members) {
              const v = boxDisplacement(geometry, a, b)

              husk = Math.max(husk, huskLength(v))
              bulk = Math.max(bulk, bulkLength(v))
            }
          }

          huskSpread += husk
          bulkSpread += bulk
          triples += 1
        }

        // the baryons' loves: a love in a piece with no fear, or with more loves than fears by a multiple of 3
        if (p.loves.length > p.fears.length) {
          baryonLoves += p.loves.length - p.fears.length
          held += p.loves.length === 3 && p.fears.length === 0 ? 3 : 0
        }
      }
    },
  })

  return {
    x: Math.exp(-unitDemonBeta({ meanDemon: out.meanDemon, capacity: CAPACITY })),
    exact: out.exact && out.agrees,
    mesonLevels,
    baryonLevels,
    heldShare: held / Math.max(1, baryonLoves),
    huskSpread: huskSpread / Math.max(1, triples),
    bulkSpread: bulkSpread / Math.max(1, triples),
  }
}

export default experiment({
  id: 'gauge/nucleon-spectrum',
  code: 'E-FRC-0197',
  title:
    'the lightest color-singlet levels of the paid-string rule on the D4 box against their exact count (every measured ratio 3 to 10 percent below it, the excluded-volume sign), and a three-love baryon (a stand-in proton) held as one singlet in 94 to 99 percent of readings where E-FRC-0171 found no triple held without a paid string, its tensionless control empty',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const animals = linkAnimals(LEVELS)
    const meson = singletLevels({ boundary: 'meson', maxSize: LEVELS, animals }).map(l => l.count)
    const baryon = singletLevels({ boundary: 'baryon', maxSize: LEVELS, animals }).map(l => l.count)
    const geometry = makeBoxGeometry(SIDE)
    const mesh = d4BoxMesh({ side: SIDE })
    const graph = makeStringGraph({ mesh, mass: 4, tension: 1, capacity: CAPACITY })
    const free = makeStringGraph({ mesh, mass: 4, tension: 0, capacity: CAPACITY })

    const readings = FILLS.map(fill => {
      const r = readGas({ graph, geometry, fill, beats: BEATS })
      const x = r.x
      const measured = {
        meson2: (r.mesonLevels[2] ?? 0) / (r.mesonLevels[1] ?? 1),
        meson3: (r.mesonLevels[3] ?? 0) / (r.mesonLevels[1] ?? 1),
        baryon3: (r.baryonLevels[3] ?? 0) / (r.baryonLevels[2] ?? 1),
      }
      const predicted = {
        meson2: ((meson[1] ?? 0) * x) / (meson[0] ?? 1),
        meson3: ((meson[2] ?? 0) * x * x) / (meson[0] ?? 1),
        baryon3: ((baryon[2] ?? 0) * x) / (baryon[1] ?? 1),
      }

      return { fill, r, measured, predicted }
    })
    const control = readGas({ graph: free, geometry, fill: FILLS[0] ?? 0, beats: CONTROL_BEATS })

    const exact = readings.every(k => k.r.exact) && control.exact
    const near = (a: number, b: number): boolean => Number.isFinite(a) && Math.abs(a / b - 1) < RATIO_TOLERANCE
    const levels = readings.every(k => near(k.measured.meson2, k.predicted.meson2) && near(k.measured.meson3, k.predicted.meson3) && near(k.measured.baryon3, k.predicted.baryon3))
    const binds = readings.every(k => k.r.heldShare >= HELD_SHARE && k.r.huskSpread < control.huskSpread / SPREAD_FACTOR)
    const status = exact && levels && binds ? 'pass' : exact && binds ? 'partial' : 'fail'

    return verdict({
      status,
      claim:
        "with the energy and Gauss's law exact, the meson's and the baryon's level occupations match the counted degeneracies times x^n within 5 percent at two fills with nothing fitted, and three loves held by a paid Z3 string stay one singlet, their husk spread under a tenth of the tensionless control's",
      metrics: Object.fromEntries<number>([
        ['exactAndKernel', exact ? 1 : 0],
        ['levelGate', levels ? 1 : 0],
        ['bindingGate', binds ? 1 : 0],
        ...readings.flatMap((k): [string, number][] => {
          const key = String(k.fill).replace('.', '_')

          return [
            [`xFill${key}`, k.r.x],
            [`mesonP2OverP1Fill${key}`, k.measured.meson2],
            [`mesonP2OverP1PredictedFill${key}`, k.predicted.meson2],
            [`mesonP3OverP1Fill${key}`, k.measured.meson3],
            [`mesonP3OverP1PredictedFill${key}`, k.predicted.meson3],
            [`baryonP3OverP2Fill${key}`, k.measured.baryon3],
            [`baryonP3OverP2PredictedFill${key}`, k.predicted.baryon3],
            [`mesonLevel1CountFill${key}`, k.r.mesonLevels[1] ?? 0],
            [`baryonLevel2CountFill${key}`, k.r.baryonLevels[2] ?? 0],
            [`baryonHeldShareFill${key}`, k.r.heldShare],
            [`baryonHuskSpreadFill${key}`, k.r.huskSpread],
            [`baryonBulkSpreadFill${key}`, k.r.bulkSpread],
          ]
        }),
      ]),
      control: {
        tensionlessHuskSpread: control.huskSpread,
        tensionlessBulkSpread: control.bulkSpread,
        tensionlessHeldShare: control.heldShare,
        mesonOmega1: meson[0] ?? 0,
        mesonOmega2: meson[1] ?? 0,
        mesonOmega3: meson[2] ?? 0,
        baryonOmega2: baryon[1] ?? 0,
        baryonOmega3: baryon[2] ?? 0,
      },
      notes:
        'L2, exact integers, no random numbers. The baryon is a stand-in for a proton: three loves, charge +1 by Q = (love - fear) / 3, no spin. "Lighter than three free quarks" has one reading here: a lone love is not a singlet (its piece cannot close, charge 1 mod 3), so three loves alone always form one piece, and the question is whether that piece stays small; its lowest level costs 2 paid links for three charges against 1 for a meson\'s two. The spread is read afresh each snapshot; no love is followed.',
    })
  },
})
