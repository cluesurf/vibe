// A deuteron and saturation for color singlets of the paid-string rule (STAND-INS for nucleons: a meson is the
// neutral one, Q = 0 by E-FRC-0170's Q = (love - fear) / 3, and three loves the charged one, Q = +1; neither
// carries spin, so nothing here can show the spin-one deuteron or the spin-orbit shells).
//
// E-FRC-0195 proves that at the lowest level any number of singlets together costs exactly what they cost apart,
// and that partner exchange adds no chains beyond an ideal gas of dimers. So there is no bound state of two
// singlets in energy, at zero temperature, at all: zero levels below threshold. What can still hold two singlets
// together is free energy: the excited levels where two strings share links, which the Z3 flux prices at one
// tension or none where two separate strings would pay two. This file measures that free energy.
//
// Method. The side-6 D4 box (1,296 docks, 15,552 links), the rule code/rule/string-graph (mass 4, tension 1,
// capacity 4) unchanged, fills 0.02 and 0.03, 60,000 beats after 500 settling, every 2nd beat read. Each snapshot
// is split into pieces of paid flux (code/measure/nucleon-gas). Two pieces are in contact when a charge of one is
// on a dock next to a charge of the other, and a cluster is a connected set of pieces under contact.
// - interacting: runs with N = 2, 3, 4 mesons, and with one baryon-antibaryon pair beside one meson (the
//   deuteron-like pair: the charged singlet with the neutral one). Read: the share of snapshots in which all the
//   named singlets' charges lie in one cluster
// - ideal: runs with one meson alone and one baryon pair alone give the singlets' own shapes (their charges,
//   relative to one of them). N shapes from different beats are laid down at translations from Weyl sequences
//   (golden, silver and the square roots of 3 and 5), any overlap of charges rejected, and the same cluster rule
//   is read. 400,000 layouts per case
// - R = P(interacting) / P(ideal). R > 1 is attraction. The binding free energy is F = -T ln R, T = 1 / beta
//   from the demons, in units of the tension; per singlet F / N
// Errors: the interacting run is cut in 10 blocks, the standard error of their shares.
//
// Gates, fixed before the run:
// - G0: the energy and Gauss's law exact on every checked snapshot, the fast kernel equal to graphBeat
// - deuteron: for two mesons, R above 1 by more than 3 standard errors at both fills (the two singlets attract)
// - saturation: the binding free energy per singlet, F_N / N, for N = 3 and 4 within 30 percent of N = 2's at
//   both fills
// Status: pass if all three, partial if G0 and the deuteron gate hold, fail otherwise.
//
// Depth L2: a constructed rule, measured against an ideal gas built from its own singlets.
//
// Changed before the first run, 2026-09-26: the box was side 5, where the baryon seed of code/measure/
// nucleon-gas (six docks along direction 0) wraps onto itself on a line of period 5 and breaks Gauss's law at
// the start (a probe, tmp/pieces-check.ts, read exact = false with one baryon pair and true without). Side 6
// holds the six docks exactly once round the line. No gate was written against a number.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'
import { makeStringGraph, type StringGraph } from '@/code/rule/string-graph'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'
import { makeBoxGeometry, runGas, singletPieces, type BoxGeometry } from '@/code/measure/nucleon-gas'

const SIDE = 6
const FILLS = [0.02, 0.03]
const SETTLE = 500
const BEATS = 60000
const EVERY = 2
const CAPACITY = 4
const BLOCKS = 10
const LAYOUTS = 400000
const SIGMAS = 3
const SATURATION_TOLERANCE = 0.3
const MESON_COUNTS = [2, 3, 4]
const ALPHAS = [GOLDEN, SILVER, Math.sqrt(3) - 1, Math.sqrt(5) - 2, Math.sqrt(7) - 2, Math.sqrt(11) - 3, Math.sqrt(13) - 3, Math.sqrt(17) - 4]

// one singlet's charges in one snapshot: signed docks
type Shape = { loves: number[]; fears: number[] }

// are all the charges of the given groups one cluster, with groups joined when a charge of one neighbours or
// equals a charge of another
function oneCluster(groups: number[][], neighbour: (a: number, b: number) => boolean): boolean {
  const joined = new Set<number>([0])
  const queue = [0]

  while (queue.length > 0) {
    const g = queue.pop() ?? 0

    groups.forEach((other, k) => {
      if (!joined.has(k) && (groups[g] ?? []).some(a => other.some(b => neighbour(a, b)))) {
        joined.add(k)
        queue.push(k)
      }
    })
  }

  return joined.size === groups.length
}

export default experiment({
  id: 'gauge/nucleon-deuteron',
  code: 'E-FRC-0198',
  title:
    'a deuteron and saturation for color singlets (stand-ins for nucleons) of the paid-string rule: zero bound levels in energy by theorem, and the contact free energy of two, three and four singlets against an ideal gas of the same singlets',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4BoxMesh({ side: SIDE })
    const graph: StringGraph = makeStringGraph({ mesh, mass: 4, tension: 1, capacity: CAPACITY })
    const geometry: BoxGeometry = makeBoxGeometry(SIDE)
    const roots = rootsD4()
    const rootKeys = new Set(roots.map(r => r.join(',')))
    const neighbour = (a: number, b: number): boolean => a === b || rootKeys.has((geometry.minimal[displacementIndex(a, b)] ?? []).join(','))
    const coordinates = geometry.coordinates
    const displacementIndex = (a: number, b: number): number =>
      d4BoxCell({ coordinates: (coordinates[a] ?? []).map((x, k) => x - (coordinates[b]?.[k] ?? 0)), side: SIDE })
    const translate = (dock: number, by: number): number =>
      d4BoxCell({ coordinates: (coordinates[dock] ?? []).map((x, k) => x + (coordinates[by]?.[k] ?? 0)), side: SIDE })

    // a run: the per-snapshot readings `look` returns, cut in blocks
    const run = (input: { fill: number; mesons: number; baryons: number; look: (pieces: ReturnType<typeof singletPieces>) => boolean | undefined }) => {
      const hits: number[] = []
      const out = runGas({
        graph,
        fill: input.fill,
        mesons: input.mesons,
        baryons: input.baryons,
        settle: SETTLE,
        beats: BEATS,
        every: EVERY,
        look: state => {
          const answer = input.look(singletPieces(graph, state))

          if (answer !== undefined) {
            hits.push(answer ? 1 : 0)
          }
        },
      })
      const size = Math.floor(hits.length / BLOCKS)
      const blocks = Array.from({ length: BLOCKS }, (_, k) => hits.slice(k * size, (k + 1) * size).reduce((a, b) => a + b, 0) / Math.max(1, size))
      const share = blocks.reduce((a, b) => a + b, 0) / BLOCKS
      const error = Math.sqrt(blocks.reduce((a, b) => a + (b - share) ** 2, 0) / (BLOCKS - 1) / BLOCKS)

      return { share, error, exact: out.exact && out.agrees, beta: unitDemonBeta({ meanDemon: out.meanDemon, capacity: CAPACITY }) }
    }

    // the ideal: shapes recorded from lone singlets, laid down independently
    const shapesOf = (fill: number, kind: 'meson' | 'baryon'): { shapes: Shape[]; exact: boolean } => {
      const shapes: Shape[] = []
      const out = runGas({
        graph,
        fill,
        mesons: kind === 'meson' ? 1 : 0,
        baryons: kind === 'baryon' ? 1 : 0,
        settle: SETTLE,
        beats: BEATS,
        every: EVERY,
        look: state => {
          for (const p of singletPieces(graph, state)) {
            const wanted = kind === 'meson' ? p.loves.length === 1 && p.fears.length === 1 : p.loves.length === 3 && p.fears.length === 0

            if (wanted) {
              const origin = p.loves[0] ?? 0
              const back = d4BoxCell({ coordinates: (coordinates[origin] ?? []).map(x => -x), side: SIDE })

              shapes.push({ loves: p.loves.map(d => translate(d, back)), fears: p.fears.map(d => translate(d, back)) })
            }
          }
        },
      })

      return { shapes, exact: out.exact && out.agrees }
    }

    const ideal = (sets: Shape[][]): number => {
      let accepted = 0
      let clustered = 0

      for (let s = 1; s <= LAYOUTS; s++) {
        const groups: number[][] = []
        const used = new Set<number>()
        let clash = false

        sets.forEach((shapes, k) => {
          const shape = shapes[Math.floor(weyl(s, ALPHAS[(2 * k) % ALPHAS.length] ?? GOLDEN) * shapes.length)] ?? { loves: [], fears: [] }
          const at = Math.floor(weyl(s, ALPHAS[(2 * k + 1) % ALPHAS.length] ?? SILVER) * mesh.cellCount)
          const docks = [...shape.loves, ...shape.fears].map(d => translate(d, at))

          for (const d of docks) {
            clash = clash || used.has(d)
            used.add(d)
          }

          groups.push(docks)
        })

        if (clash) {
          continue
        }

        accepted += 1
        clustered += oneCluster(groups, neighbour) ? 1 : 0
      }

      return clustered / Math.max(1, accepted)
    }

    const results = FILLS.map(fill => {
      const mesonShapes = shapesOf(fill, 'meson')
      const baryonShapes = shapesOf(fill, 'baryon')

      const mesonCases = MESON_COUNTS.map(n => {
        const interacting = run({
          fill,
          mesons: n,
          baryons: 0,
          look: pieces => oneCluster(pieces.map(p => [...p.loves, ...p.fears]), neighbour),
        })
        const reference = ideal(new Array<Shape[]>(n).fill(mesonShapes.shapes))

        return { n, interacting, reference, ratio: interacting.share / reference }
      })

      // the deuteron-like pair: the baryon (three loves) and the meson, the antibaryon ignored
      const pair = run({
        fill,
        mesons: 1,
        baryons: 1,
        look: pieces => {
          const baryon = pieces.filter(p => p.loves.length > p.fears.length)
          const meson = pieces.filter(p => p.loves.length === 1 && p.fears.length === 1)
          const merged = pieces.some(p => p.loves.length === 4 && p.fears.length === 1)

          if (merged) {
            return true
          }

          if (baryon.length !== 1 || meson.length !== 1) {
            return undefined
          }

          return oneCluster([[...(baryon[0]?.loves ?? [])], [...(meson[0]?.loves ?? []), ...(meson[0]?.fears ?? [])]], neighbour)
        },
      })
      const pairReference = ideal([baryonShapes.shapes, mesonShapes.shapes])
      const temperature = 1 / mesonCases[0]!.interacting.beta
      const free = mesonCases.map(c => (-temperature * Math.log(c.ratio)) / c.n)

      return {
        fill,
        temperature,
        exact: mesonShapes.exact && baryonShapes.exact && mesonCases.every(c => c.interacting.exact) && pair.exact,
        mesonCases,
        free,
        pair,
        pairReference,
      }
    })

    const g0 = results.every(r => r.exact)
    const deuteron = results.every(r => {
      const two = r.mesonCases[0]!

      return two.interacting.share - two.reference > SIGMAS * two.interacting.error
    })
    const saturation = results.every(r => r.free.slice(1).every(f => Math.abs(f / (r.free[0] ?? 1) - 1) < SATURATION_TOLERANCE))
    const status = g0 && deuteron && saturation ? 'pass' : g0 && deuteron ? 'partial' : 'fail'

    return verdict({
      status,
      claim:
        "with the energy and Gauss's law exact, two mesons (stand-in nucleons) are found in contact more often than an ideal gas of the same singlets by more than 3 standard errors at two fills, and the contact free energy per singlet for three and four is within 30 percent of two's",
      metrics: Object.fromEntries<number>([
        ['exactAndKernel', g0 ? 1 : 0],
        ['deuteronGate', deuteron ? 1 : 0],
        ['saturationGate', saturation ? 1 : 0],
        ...results.flatMap((r): [string, number][] => {
          const key = String(r.fill).replace('.', '_')

          return [
            [`temperatureFill${key}`, r.temperature],
            ...r.mesonCases.flatMap((c, k): [string, number][] => [
              [`mesons${c.n}ClusterShareFill${key}`, c.interacting.share],
              [`mesons${c.n}ClusterErrorFill${key}`, c.interacting.error],
              [`mesons${c.n}IdealShareFill${key}`, c.reference],
              [`mesons${c.n}RatioFill${key}`, c.ratio],
              [`mesons${c.n}FreeEnergyPerSingletFill${key}`, r.free[k] ?? 0],
            ]),
            [`baryonMesonContactShareFill${key}`, r.pair.share],
            [`baryonMesonContactErrorFill${key}`, r.pair.error],
            [`baryonMesonIdealShareFill${key}`, r.pairReference],
            [`baryonMesonRatioFill${key}`, r.pair.share / r.pairReference],
          ]
        }),
      ]),
      control: {
        boundLevelsBelowThresholdTheorem0195: 0,
        layouts: LAYOUTS,
        docks: mesh.cellCount,
      },
      notes:
        'L2, exact integers, no random numbers: starts, fills and layouts are Weyl sequences. The nucleons are stand-ins (a meson for the neutral one, three loves for the charged one, no spin). In energy there is no bound state at all (E-FRC-0195, a theorem): the ground cost of any number of singlets is the sum of their costs. So a deuteron here is a free-energy well only, and its depth is -T ln R. The contact rule counts a piece holding two singlets\' charges (merged strings) as one group, which is the interaction itself. The ideal layouts drop the strings of the recorded shapes and keep their charges. The baryon-meson pair is read only on snapshots where the baryon and the meson are each one piece or merged into one; its share is reported, not gated.',
    })
  },
})
