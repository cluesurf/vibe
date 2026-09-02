// The full discrete symmetry group of each knit, swept, and two conclusions corrected. E-FND-0097
// tested C, one axis mirror, and T, found no exact CPT-type conjugation for the committed charge
// knit, and flagged it. The flag had the same shape as the window artifact: a violation claim is
// only as good as the group swept. Here the WHOLE accessible group is swept, all 96 conjugations
// (six tone permutations, the eight square point-group elements, T on or off), each tested as a
// symmetry and as a reversal on three generic states:
//
//   - THE MOMENTUM KNIT has the maximal table: all 32 conjugations that could be exact are exact
//     (identity and negation, times every point-group element, symmetric without T and reversing
//     with it).
//   - THE CHARGE KNIT has an order-eight exact group, and it CONTAINS CPT: negation combined with
//     point inversion is an exact symmetry, negation with the antidiagonal mirror is an exact CP
//     symmetry (the mirror is a genuine parity, determinant minus one), and each times T is an
//     exact reversal, including the CPT conjugation (negation, inversion, T). The earlier flag is
//     RESOLVED: the charge knit conserves CP and CPT, and what it breaks is bare C, bare axis
//     mirrors, and their combinations, tying charge to orientation.
//   - THE TRAVELLER KNIT (lineHop) has almost nothing: the identity, and the x-mirror with T as
//     its one exact reversal (the PT of E-FND-0097). NO conjugation containing negation is exact,
//     so within this entire group the proposed knit violates C, CP, and every CPT candidate, an
//     invariant statement this time, and a real caution on its adoption (or a pointer to the
//     larger 24-cell group of the committed substrate, the named follow-up).
//
// So CP violation is relocated: the committed sector conserves CP exactly and the proposed
// traveller sector is where C and CP break. Sakharov's conditions now rest on the traveller sector
// plus the growth arrow. Depth L2: exact symmetry algebra measured on generic states with the
// corrected half-step reversal convention throughout. Deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  squareMesh,
  meshOpposites,
  meshNeighbors,
} from '@/code/tool/mesh'
import { makeWill, Tone, Will } from '@/code/tone/will'
import {
  Collision,
  headOnRotate,
  lineHop,
  pairCollision,
} from '@/code/rule/collision'
import { beat, collide, streamInverse } from '@/code/rule/lattice-gas'

const SIDE = 6

// the eight point-group elements of the square as integer matrices, row-major [a, b, c, d]
const GROUP: [number, number, number, number][] = [
  [1, 0, 0, 1],
  [0, -1, 1, 0],
  [-1, 0, 0, -1],
  [0, 1, -1, 0],
  [-1, 0, 0, 1],
  [1, 0, 0, -1],
  [0, 1, 1, 0],
  [0, -1, -1, 0],
]

// the six tone permutations of {-1, 0, +1}, indexed by tone + 1
const PERMS: [Tone, Tone, Tone][] = [
  [-1, 0, 1],
  [-1, 1, 0],
  [0, -1, 1],
  [0, 1, -1],
  [1, -1, 0],
  [1, 0, -1],
]

// the named elements, located in the tables rather than typed as indices
const permIndex = (want: [Tone, Tone, Tone]): number =>
  PERMS.findIndex(p => p.join(',') === want.join(','))
const groupIndex = (
  want: [number, number, number, number],
): number => GROUP.findIndex(g => g.join(',') === want.join(','))

const IDENTITY_PERM = permIndex([-1, 0, 1])
const NEGATION_PERM = permIndex([1, 0, -1])
const IDENTITY_G = groupIndex([1, 0, 0, 1])
const INVERSION_G = groupIndex([-1, 0, 0, -1])
const X_MIRROR_G = groupIndex([-1, 0, 0, 1])
const ANTIDIAGONAL_G = groupIndex([0, -1, -1, 0])

type Hit = { perm: number; g: number; t: boolean; kind: 'sym' | 'rev' }

function sweep(input: { rule: Collision; inverse: Collision }): Hit[] {
  const mesh = squareMesh({ side: SIDE })
  const opposite = meshOpposites(mesh)
  const neighbors = meshNeighbors(mesh)
  const ex: number[] = []
  const ey: number[] = []

  for (let d = 0; d < mesh.degree; d++) {
    const n = neighbors[0]![d]!

    let dx = n % SIDE
    let dy = Math.floor(n / SIDE) % SIDE

    if (dx > SIDE / 2) {
      dx -= SIDE
    }

    if (dy > SIDE / 2) {
      dy -= SIDE
    }

    ex.push(dx)
    ey.push(dy)
  }

  const mod = (a: number): number => ((a % SIDE) + SIDE) % SIDE

  const patterns: ((i: number) => Tone)[] = [
    i => ((((i * 5 + (i % 11)) % 3) - 1) as Tone),
    i => ((((i * i + 2 * i) % 3) - 1) as Tone),
    i => ((((i * 11 + (i % 7) * 2) % 3) - 1) as Tone),
  ]
  const states = patterns.map(pattern => {
    const will = makeWill(mesh)

    for (let i = 0; i < will.data.length; i++) {
      will.data[i] = pattern(i)
    }

    return will
  })

  const fresh = (w: Will): Will => ({
    mesh,
    data: Int8Array.from(w.data),
  })

  const flippedInverse = (w: Will): Will => {
    const copy = fresh(w)

    collide(copy, input.inverse)

    return streamInverse(copy)
  }

  const hamming = (a: Will, b: Will): number => {
    let h = 0

    for (let i = 0; i < a.data.length; i++) {
      if (a.data[i] !== b.data[i]) {
        h++
      }
    }

    return h
  }

  const hits: Hit[] = []

  for (let pi = 0; pi < PERMS.length; pi++) {
    for (let gi = 0; gi < GROUP.length; gi++) {
      const g = GROUP[gi]!
      const dirMap = ex.map((_, d) => {
        const nx = g[0] * ex[d]! + g[1] * ey[d]!
        const ny = g[2] * ex[d]! + g[3] * ey[d]!

        return ex.findIndex((v, i) => v === nx && ey[i] === ny)
      })

      const transform = (w: Will, useT: boolean): Will => {
        const out = makeWill(mesh)

        for (let cell = 0; cell < mesh.cellCount; cell++) {
          const x = cell % SIDE
          const y = Math.floor(cell / SIDE)
          const target =
            mod(g[0] * x + g[1] * y) + mod(g[2] * x + g[3] * y) * SIDE

          for (let d = 0; d < mesh.degree; d++) {
            let d2 = dirMap[d]!

            if (useT) {
              d2 = opposite[d2]!
            }

            const tone = w.data[cell * mesh.degree + d]!

            out.data[target * mesh.degree + d2] =
              PERMS[pi]![tone + 1]!
          }
        }

        return out
      }

      for (const useT of [false, true]) {
        let symOk = true
        let revOk = true

        for (const s of states) {
          const lhs = beat(transform(fresh(s), useT), input.rule)

          if (
            symOk &&
            hamming(lhs, transform(beat(fresh(s), input.rule), useT)) !==
              0
          ) {
            symOk = false
          }

          if (
            revOk &&
            hamming(lhs, transform(flippedInverse(s), useT)) !== 0
          ) {
            revOk = false
          }

          if (!symOk && !revOk) {
            break
          }
        }

        if (symOk) {
          hits.push({ perm: pi, g: gi, t: useT, kind: 'sym' })
        }

        if (revOk) {
          hits.push({ perm: pi, g: gi, t: useT, kind: 'rev' })
        }
      }
    }
  }

  return hits
}

const has = (
  hits: Hit[],
  perm: number,
  g: number,
  t: boolean,
  kind: 'sym' | 'rev',
): boolean =>
  hits.some(
    h => h.perm === perm && h.g === g && h.t === t && h.kind === kind,
  )

export default experiment({
  id: 'foundations/knit-symmetry-groups',
  code: 'E-FND-0101',
  title:
    "the full 96-conjugation symmetry sweep of the three knits on generic states, correcting the E-FND-0097 flag: the momentum knit is maximal (all 32 possible exact conjugations), the committed charge knit's order-eight group CONTAINS exact CP (negation with the antidiagonal mirror, a genuine parity) and exact CPT (negation, point inversion, T), resolving the flag positively (what it breaks is bare C and the axis mirrors, tying charge to orientation), while the traveller knit keeps only the identity and one PT reversal with NO negation-containing conjugation exact anywhere in the group, so CP violation is relocated to the proposed traveller sector, an invariant statement this time and a measured caution on its adoption",
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const mesh = squareMesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const momentum = sweep({
      rule: headOnRotate({ opposite }),
      inverse: headOnRotate({ opposite }),
    })
    const charge = sweep({
      rule: pairCollision({ opposite }),
      inverse: pairCollision({ opposite, forward: false }),
    })
    const traveller = sweep({
      rule: lineHop({ opposite }),
      inverse: lineHop({ opposite, forward: false }),
    })

    const momentumMaximal = momentum.length === 32
    const chargeOrderEight = charge.length === 8
    const chargeCptExact = has(
      charge,
      NEGATION_PERM,
      INVERSION_G,
      true,
      'rev',
    )
    const chargeCpExact = has(
      charge,
      NEGATION_PERM,
      ANTIDIAGONAL_G,
      false,
      'sym',
    )
    const travellerMinimal =
      traveller.length === 2 &&
      has(traveller, IDENTITY_PERM, IDENTITY_G, false, 'sym') &&
      has(traveller, IDENTITY_PERM, X_MIRROR_G, true, 'rev')
    const travellerNoC = traveller.every(
      h => h.perm === IDENTITY_PERM,
    )

    const ok =
      momentumMaximal &&
      chargeOrderEight &&
      chargeCptExact &&
      chargeCpExact &&
      travellerMinimal &&
      travellerNoC

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the momentum knit passes exactly 32 conjugations, the charge knit exactly 8 including the CP symmetry and the CPT reversal, and the traveller knit exactly 2 with no negation-containing conjugation exact',
      metrics: {
        momentumExactConjugations: momentum.length,
        chargeExactConjugations: charge.length,
        travellerExactConjugations: traveller.length,
        chargeCptExact: chargeCptExact ? 1 : 0,
        chargeCpExact: chargeCpExact ? 1 : 0,
        travellerCViolatingInvariant: travellerNoC ? 1 : 0,
      },
      // CONTROL: the momentum knit's maximal table, showing the sweep finds everything findable
      control: {
        momentumMaximal: momentumMaximal ? 1 : 0,
      },
      notes:
        'the corrected conclusions: (1) the committed charge knit conserves CP and CPT, with the right parity elements being the antidiagonal mirror and the point inversion rather than the axis mirror E-FND-0097 tried, so the load-bearing CPT flag is closed; (2) the C-violation half of the Sakharov argument now rests on the traveller sector (where no negation conjugation is exact over the whole group) plus the growth arrow; (3) the traveller result doubles as an adoption criterion: either lineHop finds its CPT partner in the 24-cell point group of the committed substrate (1152 elements, the named follow-up before adoption), or adopting it means adopting CPT violation, which nature bounds ferociously. The group-sweep rule joins the window rule: a violation claim is only as good as the group swept.',
    })
  },
})
