// Moving binding on the D4 lattice, and its melting: the paid hop of code/rule/string-graph at four
// temperatures.
//
// E-FRC-0129 showed the mechanism on a line, where a string can only extend one way and binds at any
// temperature. On the D4 lattice a string can turn 23 ways at every link, so it carries entropy as well as
// energy, and the lattice expectation is a deconfining temperature near tension / ln 23, about a third of
// the tension. A first probe at one demon unit on every link (a temperature near the tension) found no
// binding at all: the meson's mean gap was 163 against 116 with no tension. This measures the
// temperature dependence.
//
// On the side-7 D4 box (2,401 cells, 28,812 links), mass 4, tension 1, 600 beats, the demon energy set by
// the fraction of links holding one unit (0.02, 0.05, 0.1, 0.2), each seed also run with no tension as
// the control. The seeds are a meson (a love and a fear on neighboring cells) and a baryon beside its
// antibaryon (three loves and three fears along one direction, joined by a flux of 3, which costs nothing).
// Positions are followed hop by hop, unwrapped, in true D4 distance.
//
// Gates, set after that probe and a scan of the four fills (tmp/probe-string-graph):
// - every run keeps Gauss's law and the energy exact on every beat and reverses to the bit
// - coldest, the meson is bound and moving: mean gap under 4 and under a tenth of the control's, while it
//   travels more than 10. The baryon holds together (mean spread under a tenth of the control's) while
//   it travels more than 5, and its gap to the antibaryon ranges over more than 5 (not frozen)
// - hottest, the string has melted: the meson's mean gap more than 10 times the coldest
//
// Depth L2: a constructed rule on the D4 lattice. Matter here waits in cells, so this is the second route
// of E-FRC-0130, not the committed slot architecture.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { graphBeat, graphBeatBack, graphEnergy, graphGaussHolds, makeStringGraph, type GraphState, type StringGraph } from '@/code/rule/string-graph'

const SIDE = 7
const BEATS = 600
const FILLS = [0.02, 0.05, 0.1, 0.2]
const GOLDEN = (Math.sqrt(5) - 1) / 2

type Charge = { cell: number; sign: number; at: number[] }

type Run = {
  exact: boolean
  reverses: boolean
  meanGap: number
  gapRange: number
  meanSpread: number
  travel: number
}

const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))
const mean = (ps: number[][]): number[] => [0, 1, 2, 3].map(i => ps.reduce((s, p) => s + (p[i] ?? 0), 0) / ps.length)

function run(input: { graph: StringGraph; fill: number; signs: number[]; fluxes: number[] }): Run {
  const { graph, fill, signs, fluxes } = input
  const { mesh } = graph
  const roots = rootsD4()
  const direction = 0
  const cells = [Math.floor(mesh.cellCount / 2)]

  for (let k = 1; k < signs.length; k++) {
    cells.push(mesh.neighbour(cells[k - 1] ?? 0, direction))
  }

  const vibe = new Int8Array(mesh.cellCount)
  const flux = new Int32Array(graph.links.length)

  cells.forEach((c, k) => (vibe[c] = signs[k] ?? 0))
  fluxes.forEach((e, k) => (flux[graph.linkAt[(cells[k] ?? 0) * 24 + direction] ?? 0] = e))

  const start: GraphState = {
    vibe,
    flux,
    demon: Int32Array.from({ length: graph.links.length }, (_, l) => (((l + 1) * GOLDEN) % 1 < fill ? 1 : 0)),
  }
  const charges: Charge[] = cells.map((cell, k) => ({ cell, sign: signs[k] ?? 0, at: (roots[direction] ?? []).map(x => x * k) }))
  const onHop = (from: number, to: number, l: number): void => {
    const charge = charges.find(c => c.cell === from)
    const [a, , dir] = graph.links[l] ?? [0, 0, 0]
    const step = (roots[dir] ?? []).map(x => (a === from ? x : -x))

    if (charge) {
      charge.cell = to
      charge.at = charge.at.map((x, i) => x + (step[i] ?? 0))
    }
  }

  const e0 = graphEnergy(graph, start)
  const origin = mean(charges.filter(c => c.sign > 0).map(c => c.at))

  let s = start
  let exact = graphGaussHolds(graph, start)
  let gapSum = 0
  let gapLow = Infinity
  let gapHigh = 0
  let spreadSum = 0
  let travel = 0

  for (let t = 0; t < BEATS; t++) {
    s = graphBeat(graph, s, onHop)
    exact = exact && graphGaussHolds(graph, s) && graphEnergy(graph, s) === e0

    const loves = charges.filter(c => c.sign > 0).map(c => c.at)
    const fears = charges.filter(c => c.sign < 0).map(c => c.at)
    const gap = dist(mean(loves), mean(fears))

    gapSum += gap
    gapLow = Math.min(gapLow, gap)
    gapHigh = Math.max(gapHigh, gap)
    spreadSum += Math.max(...loves.map(p => Math.max(...loves.map(q => dist(p, q)))))
    travel = Math.max(travel, dist(mean(loves), origin))
  }

  let back = s

  for (let t = 0; t < BEATS; t++) {
    back = graphBeatBack(graph, back)
  }

  const reverses =
    back.vibe.every((v, i) => v === start.vibe[i]) && back.flux.every((v, i) => v === start.flux[i]) && back.demon.every((v, i) => v === start.demon[i])

  return { exact, reverses, meanGap: gapSum / BEATS, gapRange: gapHigh - gapLow, meanSpread: spreadSum / BEATS, travel }
}

export default experiment({
  id: 'gauge/d4-string-binds',
  code: 'E-FRC-0131',
  title:
    'moving binding on the D4 lattice, and its melting: with a paid hop, a meson stays about 1.7 apart while it travels and a baryon holds together while it moves when the demons are cold, and the string melts as they warm, the deconfinement a string with 23 ways to turn predicts, every run exact and reversible',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4BoxMesh({ side: SIDE })
    const bound = makeStringGraph({ mesh, mass: 4, tension: 1, capacity: 4 })
    const free = makeStringGraph({ mesh, mass: 4, tension: 0, capacity: 4 })
    const meson = { signs: [1, -1], fluxes: [1] }
    const baryons = { signs: [1, 1, 1, -1, -1, -1], fluxes: [1, 2, 3, 2, 1] }

    const scan = FILLS.map(fill => ({
      fill,
      meson: run({ graph: bound, fill, ...meson }),
      baryon: run({ graph: bound, fill, ...baryons }),
    }))
    const coldest = scan[0]!
    const hottest = scan[scan.length - 1]!
    const mesonControl = run({ graph: free, fill: coldest.fill, ...meson })
    const baryonControl = run({ graph: free, fill: coldest.fill, ...baryons })
    const all = [...scan.flatMap(s => [s.meson, s.baryon]), mesonControl, baryonControl]

    const ok =
      all.every(r => r.exact && r.reverses) &&
      coldest.meson.meanGap < 4 &&
      coldest.meson.meanGap < mesonControl.meanGap / 10 &&
      coldest.meson.travel > 10 &&
      coldest.baryon.meanSpread < baryonControl.meanSpread / 10 &&
      coldest.baryon.travel > 5 &&
      coldest.baryon.gapRange > 5 &&
      hottest.meson.meanGap > 10 * coldest.meson.meanGap

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "every run keeps Gauss's law and the energy exact and reverses to the bit, at the coldest demon energy the meson's mean gap stays under 4 and under a tenth of the tensionless control's while it travels more than 10, the baryon holds together (spread under a tenth of the control's) while travelling more than 5 and moving against its antibaryon, and at the hottest the meson's mean gap exceeds ten times the coldest",
      metrics: {
        exactAndReversible: all.every(r => r.exact && r.reverses) ? 1 : 0,
        ...Object.fromEntries(
          scan.flatMap(s => {
            const key = String(s.fill).replace('.', '_')

            return [
              [`mesonMeanGapFill${key}`, s.meson.meanGap],
              [`mesonTravelFill${key}`, s.meson.travel],
              [`baryonSpreadFill${key}`, s.baryon.meanSpread],
              [`baryonTravelFill${key}`, s.baryon.travel],
              [`baryonAntibaryonGapRangeFill${key}`, s.baryon.gapRange],
            ]
          }),
        ),
      },
      control: {
        tensionlessMesonMeanGap: mesonControl.meanGap,
        tensionlessMesonTravel: mesonControl.travel,
        tensionlessBaryonSpread: baryonControl.meanSpread,
        cells: mesh.cellCount,
        links: bound.links.length,
        matchings: bound.matchings.length,
      },
      notes:
        'L2, exact integers, no random numbers. Distances are in the D4 lattice\'s own units (a root has length sqrt 2), unwrapped hop by hop, so a free charge\'s distance can exceed the box. The coldest fill binds and the hottest has melted, the deconfining transition of a string with 23 ways to turn, between fills 0.05 and 0.1. The matter waits in cells, which the committed rule\'s slots do not allow (E-FRC-0130).',
    })
  },
})
