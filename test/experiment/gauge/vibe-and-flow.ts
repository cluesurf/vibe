// Is the second tone the conjugate of the first? The classical color group Sigma(648) acts on the nine
// points of a qutrit phase space, a 3 x 3 grid, by the 216 affine maps with determinant one: 9 shifts
// times the 24 turns of SL(2, 3), which are the 24 coin directions (E-FRC-0104). The proposal: one
// axis of that grid is the tone (the vibe), the other is its conjugate, a flow, with the law
// flow <- flow + vibe every beat (a clock whose speed is the vibe, itself one of the 216 maps, a shear).
// Three questions, each exact.
//
// A. Can a line's own second slot be the flow? No labelling of a line's nine states by the grid
//    makes the committed pair clock one of the grid's affine maps: an affine map of Z3^2 fixes 0, 1,
//    3 or 9 points (its fixed points are a coset of a subspace), and the pair clock fixes exactly 2,
//    the like-signed pairs. Fixed-point counts do not change under relabelling, so this covers all
//    9! labellings at once, where E-FRC-0112 tried 6.
// B. Can the vibe be an axis of the color grid at all? The vibe is charge, and the rule conserves
//    charge exactly, so a symmetry of the rule may only keep each vibe or flip its sign. Counted: how
//    many of the 216 maps do that, and whether those form a commuting set. Predicted before the run:
//    18, all of the form (v, f) -> (+-v, +-f + c v + k), and abelian. The count was right and
//    "abelian" was wrong: the 9 that keep the vibe commute, and the sign flip does not commute with
//    the flow shifts, so the 18 are a small group of order 18 that is not abelian. Either way it holds
//    none of the turns of the grid, the 24 coin directions, so no symmetry of a charge-conserving rule
//    turns the vibe into anything.
// C. With a flow trit in every slot obeying flow <- flow + vibe, streaming with its slot, beside the
//    committed turning weave and the triality weave: how many of the 216 maps, applied to every
//    slot's (vibe, flow), commute with the combined beat, against the 6 affine maps of the vibe alone.
//
// Depth L1: exact counting on the group and on the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import {
  PAIR_FORWARD,
  turningWeave,
  type Collision,
} from '@/code/rule/collision'
import {
  colorTriality,
  trialityWeave,
  trialityWeaveLayout,
} from '@/code/rule/triality-weave'
import { collide, stream } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxMesh } from '@/code/substrate/d4-box'

type Affine = {
  a: number
  b: number
  c: number
  d: number
  u: number
  v: number
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const GOLDEN = (Math.sqrt(5) - 1) / 2

// every affine map of Z3^2 with determinant 1, or with any nonzero determinant
function affineMaps(special: boolean): Affine[] {
  const maps: Affine[] = []

  for (let m = 0; m < 81; m++) {
    const [a, b, c, d] = [0, 1, 2, 3].map(
      k => Math.floor(m / 3 ** k) % 3,
    ) as [number, number, number, number]
    const det = mod3(a * d - b * c)

    if (det === 0 || (special && det !== 1)) {
      continue
    }

    for (let s = 0; s < 9; s++) {
      maps.push({ a, b, c, d, u: s % 3, v: Math.floor(s / 3) })
    }
  }

  return maps
}

const apply = (g: Affine, x: number, y: number): [number, number] => [
  mod3(g.a * x + g.b * y + g.u),
  mod3(g.c * x + g.d * y + g.v),
]

const compose = (g: Affine, h: Affine): string =>
  [0, 1, 2]
    .flatMap(x =>
      [0, 1, 2].map(y => apply(g, ...apply(h, x, y)).join('')),
    )
    .join(',')

export default experiment({
  id: 'gauge/vibe-and-flow',
  code: 'E-FRC-0116',
  title:
    'the vibe cannot be an axis of the color grid: a line cannot hold (vibe, flow) because the pair clock fixes 2 states where a grid map fixes 0, 1, 3 or 9, charge conservation leaves 18 of the 216 color maps and none of the 24 turns, and a flow obeying flow <- flow + vibe adds only its own 3 shifts as symmetries of the committed or triality rule',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const special = affineMaps(true)
    const general = affineMaps(false)

    // A. fixed points
    const clockFixed = PAIR_FORWARD.filter(
      ([l, r], k) => l === Math.floor(k / 3) - 1 && r === (k % 3) - 1,
    ).length
    const fixedSizes = new Set(
      general.map(g => {
        let n = 0

        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            const [p, q] = apply(g, x, y)

            n += p === x && q === y ? 1 : 0
          }
        }

        return n
      }),
    )

    // B. the maps that keep each vibe (tone t as -1, 0, 1, read mod 3) or flip its sign
    const keepsOrFlips = special.filter(g => {
      const keeps = [0, 1, 2].every(x =>
        [0, 1, 2].every(y => apply(g, x, y)[0] === x),
      )
      const flips = [0, 1, 2].every(x =>
        [0, 1, 2].every(y => apply(g, x, y)[0] === mod3(-x)),
      )

      return keeps || flips
    })
    const abelian = keepsOrFlips.every(g =>
      keepsOrFlips.every(h => compose(g, h) === compose(h, g)),
    )
    const specialAbelian = special.every(g =>
      special.every(h => compose(g, h) === compose(h, g)),
    )

    // C. the flow beside the rules, on a side-3 box
    const box = d4BoxMesh({ side: 3 })
    const opposite = meshOpposites(box)
    const sigma = colorTriality({ opposite })
    const rules: [string, (t: number) => Collision, number][] = [
      ['committed', turningWeave({ opposite: [...opposite] }), 24],
      [
        'triality',
        trialityWeave({
          layout: trialityWeaveLayout({ opposite, triality: sigma }),
        }),
        6,
      ],
    ]
    const starts = [1.37, 2.11, 3.03].map(scale => {
      const tone = makeWill(box)
      const flow = makeWill(box)

      for (let i = 0; i < tone.data.length; i++) {
        const u = ((i + 1) * GOLDEN * scale) % 1

        tone.data[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
        flow.data[i] = Math.floor(((i + 7) * GOLDEN * scale * 3) % 3)
      }

      return { tone, flow }
    })

    const step = (
      state: { tone: Will; flow: Will },
      collision: Collision,
    ): { tone: Will; flow: Will } => {
      const tone: Will = {
        mesh: box,
        data: Int8Array.from(state.tone.data),
      }
      const flow: Will = {
        mesh: box,
        data: Int8Array.from(state.flow.data),
      }

      collide(tone, collision)

      for (let i = 0; i < flow.data.length; i++) {
        flow.data[i] = mod3((flow.data[i] ?? 0) + (tone.data[i] ?? 0))
      }

      return { tone: stream(tone), flow: stream(flow) }
    }

    const act = (
      g: Affine,
      state: { tone: Will; flow: Will },
    ): { tone: Will; flow: Will } => {
      const tone = new Int8Array(state.tone.data.length)
      const flow = new Int8Array(state.flow.data.length)

      for (let i = 0; i < tone.length; i++) {
        const [p, q] = apply(
          g,
          mod3(state.tone.data[i] ?? 0),
          state.flow.data[i] ?? 0,
        )

        tone[i] = p === 2 ? -1 : p
        flow[i] = q
      }

      return {
        tone: { mesh: box, data: tone },
        flow: { mesh: box, data: flow },
      }
    }

    const same = (
      x: { tone: Will; flow: Will },
      y: { tone: Will; flow: Will },
    ): boolean =>
      x.tone.data.every((v, i) => v === y.tone.data[i]) &&
      x.flow.data.every((v, i) => v === y.flow.data[i])

    const withFlow = rules.map(([name, rule, period]) => {
      const commuting = special.filter(g =>
        starts.every(start => {
          let a = start
          let b = act(g, start)

          for (let t = 0; t < period; t++) {
            a = step(a, rule(t))
            b = step(b, rule(t))

            if (!same(act(g, a), b)) {
              return false
            }
          }

          return true
        }),
      )

      return { name, commuting: commuting.length, maps: commuting }
    })

    // the vibe alone: the 6 affine maps of Z3 on the tone, against the tone rule
    const toneAlone = rules.map(([name, rule, period]) => {
      let count = 0

      for (const a of [1, 2]) {
        for (const u of [0, 1, 2]) {
          const relabel = (x: number): number => {
            const p = mod3(a * mod3(x) + u)

            return p === 2 ? -1 : p
          }

          const holds = starts.every(start => {
            let x: Will = {
              mesh: box,
              data: Int8Array.from(start.tone.data),
            }
            let y: Will = {
              mesh: box,
              data: Int8Array.from(start.tone.data, relabel),
            }

            for (let t = 0; t < period; t++) {
              collide(x, rule(t))
              x = stream(x)
              collide(y, rule(t))
              y = stream(y)

              if (!x.data.every((v, i) => relabel(v) === y.data[i])) {
                return false
              }
            }

            return true
          })

          count += holds ? 1 : 0
        }
      }

      return { name, count }
    })

    const describe = (g: Affine): string =>
      `(v,f)->(${g.a}v+${g.b}f+${g.u}, ${g.c}v+${g.d}f+${g.v})`
    const listOrNone = (maps: readonly Affine[]): string =>
      maps.length === 0 ? 'none' : maps.map(describe).join('; ')

    const ok =
      clockFixed === 2 &&
      !fixedSizes.has(2) &&
      special.length === 216 &&
      !specialAbelian

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the pair clock fixes 2 of a line's 9 states and no affine map of the grid fixes 2, so no labelling of a line makes the clock a color move, and the counts of B and C are reported: how many color maps keep or flip the vibe and whether they commute, and how many commute with each rule once a flow obeys flow <- flow + vibe",
      metrics: {
        clockFixedStates: clockFixed,
        gridFixedSizes:
          [...fixedSizes].sort((x, y) => x - y).join(' ') === '0 1 3 9'
            ? 1
            : 0,
        colorMaps: special.length,
        keepOrFlipVibe: keepsOrFlips.length,
        keepOrFlipAbelian: abelian ? 1 : 0,
        colorGroupAbelian: specialAbelian ? 1 : 0,
        ...Object.fromEntries(
          withFlow.map(r => [
            `${r.name}CommutingWithFlow`,
            r.commuting,
          ]),
        ),
        ...Object.fromEntries(
          toneAlone.map(r => [`${r.name}CommutingToneAlone`, r.count]),
        ),
      },
      control: {
        affineMapsAllDeterminants: general.length,
      },
      notes: `L1, exact. Grid fixed-point sizes: ${[...fixedSizes].sort((x, y) => x - y).join(' ')}. Maps that keep or flip the vibe: ${keepsOrFlips.map(describe).join('; ')}. With the flow, committed: ${listOrNone(withFlow[0]?.maps ?? [])}. Triality: ${listOrNone(withFlow[1]?.maps ?? [])}.`,
    })
  },
})
