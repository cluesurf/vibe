// Does a whole survive a round trip, and what does the answer measure? E-FRC-0118 showed a whole is a
// frame-free relation on role points. Carried around a closed loop of links, a role point comes back
// moved by the loop's grid move, and the whole survives the trip when that move fixes the point. The
// fraction of the 9 grid points a loop fixes is the classical Wilson loop of the role.
//
// An identity decides what it measures. A color element U permutes the 9 phase-point operators by
// conjugation, and they are a basis of the 3 x 3 matrices, so the number of points it fixes is the
// trace of the adjoint action, |Tr U|^2. So the classical survival (fixed - 1) / 8 is exactly the
// ADJOINT Wilson loop (|Tr U|^2 - 1) / 8, the string of a color octet, which gluons can screen, and
// not the fundamental loop Re Tr U / 3, the string of a quark. The grid sees Sigma(648) with its
// center divided out (216 = 648 / 3, E-FRC-0104), and the center is what tells a quark's string from a
// gluon's, which is the part the vibe carries (the vibe's sum mod 3 is the center charge).
//
// Measured on Sigma(648) link fields made by the deterministic kinetic rule of E-FRC-0110 (integer
// action, no random number in the rule) on 4^4, at a high energy (the disordered, confining phase)
// and a low one (ordered): loops of 1 x 1, 1 x 2 and 2 x 2, averaged over every site and plane.
//
// Gates:
// - the identity, fixed points = |Tr U|^2, on all 648 elements exactly
// - the classical survival equals the adjoint loop on the link fields to 1e-12
// - the phases differ: the 2 x 2 fundamental loop is larger in the ordered field than the disordered
// Reported: all three loops at the three sizes in both phases, and -ln W per unit area.
//
// Depth L2: an identity, and loops on fields from a constructed deterministic rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import {
  finitePlaquette,
  generateGroup,
  makeFiniteGaugeLattice,
  type FiniteGaugeLattice,
} from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import {
  actionLevels,
  exchangeFiniteDemons,
  finiteKineticSweep,
  streamFiniteDemons,
} from '@/code/dynamics/finite-kinetic'
import { phaseSpaceAction } from '@/code/measure/qutrit-phase-space'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const SIZES: readonly (readonly [number, number])[] = [
  [1, 1],
  [1, 2],
  [2, 2],
]

export default experiment({
  id: 'gauge/role-survives-a-loop',
  code: 'E-FRC-0119',
  title:
    'a role point carried round a loop of links survives exactly as often as the adjoint Wilson loop says, since the points a color element fixes number |Tr U|^2, so the classical role sees the gluon string and not the quark string, whose center phase the vibe carries',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const group = generateGroup({
      generators: [...SU3_SUBGROUPS.sigma648.generators],
    })
    const traces = group.matrices.map(m => [
      (m[0] ?? 0) + (m[8] ?? 0) + (m[16] ?? 0),
      (m[1] ?? 0) + (m[9] ?? 0) + (m[17] ?? 0),
    ])
    const fixed = group.matrices.map(unitary => {
      const map = phaseSpaceAction({ unitary }) ?? []

      return map.filter((image, p) => image === p).length
    })
    const identityHolds = fixed.every(
      (f, g) =>
        Math.abs(
          f - ((traces[g]?.[0] ?? 0) ** 2 + (traces[g]?.[1] ?? 0) ** 2),
        ) < 1e-9,
    )

    const levels = actionLevels({ group, scale: 6 })
    const lowest = Math.min(
      ...Array.from(levels).filter(level => level > 0),
    )
    const capacity = 6 * lowest + 6

    const field = (fill: number): FiniteGaugeLattice[] => {
      const lattice = makeFiniteGaugeLattice({
        group,
        lengths: [4, 4, 4, 4],
        start: 'cold',
        rng: makeWeyl({ start: 1 }),
      })
      const demons = new Int32Array(lattice.links.length)

      for (let i = 0; i < demons.length; i++) {
        demons[i] = (i * GOLDEN) % 1 < fill ? capacity : 0
      }

      const snapshots: FiniteGaugeLattice[] = []

      for (let sweep = 0; sweep < 300; sweep++) {
        finiteKineticSweep({ lattice, levels, demons, capacity })
        streamFiniteDemons({ lattice, demons, step: sweep })

        for (let k = 0; k < 4; k++) {
          exchangeFiniteDemons({ lattice, demons, capacity, step: k })
        }

        if (sweep >= 150 && sweep % 10 === 0) {
          snapshots.push({
            ...lattice,
            links: Int16Array.from(lattice.links),
          })
        }
      }

      return snapshots
    }

    const loops = (
      snapshots: FiniteGaugeLattice[],
    ): {
      size: string
      fundamental: number
      adjoint: number
      survival: number
    }[] =>
      SIZES.map(([r, t]) => {
        let fundamental = 0
        let adjoint = 0
        let survival = 0
        let count = 0

        for (const lattice of snapshots) {
          const { dim, sites, up } = lattice.geometry
          const { order, product, inverse } = group
          const link = (s: number, mu: number): number =>
            lattice.links[s * dim + mu] ?? 0

          const step = (s: number, mu: number, n: number): number => {
            let x = s

            for (let i = 0; i < n; i++) {
              x = up[x * dim + mu] ?? 0
            }

            return x
          }

          const mul = (a: number, b: number): number =>
            product[a * order + b] ?? 0

          for (let s = 0; s < sites; s++) {
            for (let mu = 0; mu < dim; mu++) {
              for (let nu = mu + 1; nu < dim; nu++) {
                let g = group.identity

                for (let i = 0; i < r; i++) {
                  g = mul(g, link(step(s, mu, i), mu))
                }

                for (let j = 0; j < t; j++) {
                  g = mul(g, link(step(step(s, mu, r), nu, j), nu))
                }

                for (let i = r - 1; i >= 0; i--) {
                  g = mul(
                    g,
                    inverse[link(step(step(s, mu, i), nu, t), mu)] ?? 0,
                  )
                }

                for (let j = t - 1; j >= 0; j--) {
                  g = mul(g, inverse[link(step(s, nu, j), nu)] ?? 0)
                }

                const [re, im] = traces[g] ?? [0, 0]

                fundamental += (re ?? 0) / 3
                adjoint += ((re ?? 0) ** 2 + (im ?? 0) ** 2 - 1) / 8
                survival += ((fixed[g] ?? 0) - 1) / 8
                count += 1
              }
            }
          }
        }

        return {
          size: `${r}x${t}`,
          fundamental: fundamental / count,
          adjoint: adjoint / count,
          survival: survival / count,
        }
      })

    const hot = field(0.6)
    const cold = field(0.08)
    const hotLoops = loops(hot)
    const coldLoops = loops(cold)
    const survivalIsAdjoint = [...hotLoops, ...coldLoops].every(
      l => Math.abs(l.survival - l.adjoint) < 1e-12,
    )
    const hotPlaquette =
      hot.reduce((s, l) => s + finitePlaquette({ lattice: l }), 0) /
      hot.length
    const coldPlaquette =
      cold.reduce((s, l) => s + finitePlaquette({ lattice: l }), 0) /
      cold.length
    const phasesDiffer =
      (coldLoops[2]?.fundamental ?? 0) > (hotLoops[2]?.fundamental ?? 0)

    const ok = identityHolds && survivalIsAdjoint && phasesDiffer

    const perArea = (w: number, area: number): number =>
      w > 0 ? -Math.log(w) / area : Number.NaN

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on all 648 elements the grid points fixed equal |Tr U|^2, so on deterministic Sigma(648) link fields in both phases the chance a role point survives a loop equals the adjoint Wilson loop exactly, and the fundamental loops of the two phases differ',
      metrics: {
        identityHolds: identityHolds ? 1 : 0,
        survivalIsAdjoint: survivalIsAdjoint ? 1 : 0,
        hotPlaquette,
        coldPlaquette,
        ...Object.fromEntries(
          [
            ['hot', hotLoops],
            ['cold', coldLoops],
          ].flatMap(([phase, list]) =>
            (list as typeof hotLoops).flatMap(l => [
              [`${phase as string}Fundamental${l.size}`, l.fundamental],
              [`${phase as string}Adjoint${l.size}`, l.adjoint],
            ]),
          ),
        ),
      },
      control: {
        hotFundamentalPerArea2x2: perArea(
          hotLoops[2]?.fundamental ?? 0,
          4,
        ),
        hotAdjointPerArea2x2: perArea(hotLoops[2]?.adjoint ?? 0, 4),
        coldFundamentalPerArea2x2: perArea(
          coldLoops[2]?.fundamental ?? 0,
          4,
        ),
        coldAdjointPerArea2x2: perArea(coldLoops[2]?.adjoint ?? 0, 4),
        snapshots: hot.length,
      },
      notes:
        'L2, deterministic link fields (the kinetic rule, no random number), exact loop products. The survival of a role point is the adjoint loop by an identity, so a classical role alone measures the gluon string. The quark string needs the center phase of the full element, which the grid cannot see and the vibe carries.',
    })
  },
})
