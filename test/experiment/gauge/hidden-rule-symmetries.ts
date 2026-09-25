// Symmetries of a rule that nobody searched for. E-FRC-0095 asked which of the 1152 coin symmetries
// the committed rule keeps beat by beat and found only the identity, and E-FRC-0093 asked the same
// of the six relabellings of the three tones and found none. Two looser questions were never asked:
//
// - a coin symmetry and a tone relabelling applied together (the colour lines stay in place while
//   their content is relabelled), and
// - a symmetry that holds only up to a shift in time: rotating the state and running beat t gives
//   the same as running beat t + k and then rotating. A colour triality that holds this way does not
//   have to keep fixed states fixed on each beat, so the argument of E-FRC-0112 does not reach it.
//
// So: every coin symmetry p (1152), every tone relabelling tau (6), every shift k in the schedule,
// for the committed turning weave (schedule period 24) and the triality weave (6). Both rules apply
// the same collision in every cell and every p is linear, so streaming commutes with every such
// symmetry and the question is exactly one about a cell's collision: does tau p C_t = C_(t+k) tau p
// on the cell's states, for every beat t. Tested on 48 lone-tone states and 64 dense ones (a
// deterministic low-discrepancy fill), which are enough to reject a candidate, and every survivor is
// then checked on 4096 more dense states.
//
// Gates: the identity with k = 0 is found for both rules (the instrument works), and the triality
// weave's own colour triality is found with tau the identity and k = 0 (it is built to have it).
// Everything else is reported, and the headline number is the count of colour-selecting trialities
// the committed rule keeps under any tau and any k.
//
// Depth L2: an exhaustive symmetry search of two constructed rules.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'
import {
  colourTriality,
  trialityWeave,
  trialityWeaveLayout,
  TRIALITY_WEAVE_PERIOD,
} from '@/code/rule/triality-weave'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { d4BoxMesh } from '@/code/substrate/d4-box'

const TONE_RELABELLINGS: readonly (readonly number[])[] = [
  [-1, 0, 1],
  [-1, 1, 0],
  [0, -1, 1],
  [0, 1, -1],
  [1, -1, 0],
  [1, 0, -1],
]

const GOLDEN = (Math.sqrt(5) - 1) / 2

function testStates(count: number, offset: number): Int8Array[] {
  const states: Int8Array[] = []

  for (let n = 0; n < count; n++) {
    const state = new Int8Array(24)

    for (let d = 0; d < 24; d++) {
      const u = ((offset + n * 24 + d + 1) * GOLDEN) % 1

      state[d] = u < 0.3 ? -1 : u < 0.6 ? 1 : 0
    }

    states.push(state)
  }

  return states
}

type Found = { p: number; tau: number; k: number }

function search(input: {
  rule: (t: number) => Collision
  period: number
  permutations: readonly (readonly number[])[]
}): Found[] {
  const { rule, period, permutations } = input
  const lone: Int8Array[] = []

  for (let d = 0; d < 24; d++) {
    for (const tone of [1, -1]) {
      const state = new Int8Array(24)

      state[d] = tone
      lone.push(state)
    }
  }

  const quick = [...lone, ...testStates(64, 0)]
  const thorough = testStates(4096, 5000)
  const a = new Int8Array(24)
  const b = new Int8Array(24)
  const collisions = Array.from({ length: period }, (_, t) => rule(t))

  const holds = (
    p: readonly number[],
    tau: readonly number[],
    k: number,
    states: readonly Int8Array[],
  ): boolean => {
    for (const state of states) {
      for (let t = 0; t < period; t++) {
        // a = tau p (C_t state)
        b.set(state)
        collisions[t]?.(b, 0, 24)

        for (let d = 0; d < 24; d++) {
          a[p[d] ?? 0] = tau[(b[d] ?? 0) + 1] ?? 0
        }

        // b = C_(t+k) (tau p state)
        for (let d = 0; d < 24; d++) {
          b[p[d] ?? 0] = tau[(state[d] ?? 0) + 1] ?? 0
        }

        collisions[(t + k) % period]?.(b, 0, 24)

        for (let d = 0; d < 24; d++) {
          if (a[d] !== b[d]) {
            return false
          }
        }
      }
    }

    return true
  }

  const found: Found[] = []

  permutations.forEach((p, pi) => {
    TONE_RELABELLINGS.forEach((tau, ti) => {
      for (let k = 0; k < period; k++) {
        if (holds(p, tau, k, quick) && holds(p, tau, k, thorough)) {
          found.push({ p: pi, tau: ti, k })
        }
      }
    })
  })

  return found
}

export default experiment({
  id: 'gauge/hidden-rule-symmetries',
  code: 'E-FRC-0113',
  title:
    'a search nobody ran: every coin symmetry, combined with every tone relabelling and every shift in time, against the committed turning weave and the triality weave, for a colour triality hidden as a combined or time-shifted symmetry',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4BoxMesh({ side: 3 })
    const opposite = meshOpposites(mesh)
    const roots = rootsD4()
    const permutations = weylF4DirectionPermutations({
      directions: roots,
    })
    const identityIndex = permutations.findIndex(p =>
      p.every((image, d) => image === d),
    )
    const sigma = colourTriality({ opposite })
    const sigmaIndex = permutations.findIndex(p =>
      p.every((image, d) => image === sigma[d]),
    )
    const keyOf = (list: readonly number[]): string =>
      [...list].sort((x, y) => x - y).join(',')
    const planes = new Set(
      zeroSumTriangles({ directions: roots }).map(t =>
        keyOf([...t, ...t.map(d => opposite[d] ?? d)]),
      ),
    )

    const colourSelecting = (pi: number): boolean => {
      const p = permutations[pi] ?? []

      return (
        permutationOrder({ permutation: p }) === 3 &&
        planes.has(
          keyOf(
            p
              .map((image, d) => (image === d ? d : -1))
              .filter(d => d >= 0),
          ),
        )
      )
    }

    const committed = search({
      rule: turningWeave({ opposite: [...opposite] }),
      period: 24,
      permutations,
    })
    const weave = search({
      rule: trialityWeave({
        layout: trialityWeaveLayout({ opposite, triality: sigma }),
      }),
      period: TRIALITY_WEAVE_PERIOD,
      permutations,
    })

    const describe = (found: Found[]): string =>
      found
        .map(
          f =>
            `p${f.p}${f.p === identityIndex ? '(identity)' : ''}${colourSelecting(f.p) ? '(colour triality)' : ''} order ${permutationOrder({ permutation: permutations[f.p] ?? [] })} tau ${TONE_RELABELLINGS[f.tau]?.join('/')} k ${f.k}`,
        )
        .join('; ')

    const committedColour = committed.filter(f =>
      colourSelecting(f.p),
    ).length
    const weaveColour = weave.filter(f => colourSelecting(f.p)).length
    const instrument =
      committed.some(
        f => f.p === identityIndex && f.tau === 0 && f.k === 0,
      ) &&
      weave.some(f => f.p === sigmaIndex && f.tau === 0 && f.k === 0)
    const ok = instrument

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the search finds the identity for both rules and the triality weave its own colour triality, and it reports every combined or time-shifted symmetry of each rule, with the number of colour-selecting trialities the committed rule keeps in any such form',
      metrics: {
        committedSymmetries: committed.length,
        committedColourTrialities: committedColour,
        committedTimeShifted: committed.filter(f => f.k !== 0).length,
        committedToneRelabelled: committed.filter(f => f.tau !== 0)
          .length,
        weaveSymmetries: weave.length,
        weaveColourTrialities: weaveColour,
        weaveTimeShifted: weave.filter(f => f.k !== 0).length,
        weaveToneRelabelled: weave.filter(f => f.tau !== 0).length,
      },
      control: {
        coinSymmetries: permutations.length,
        toneRelabellings: TONE_RELABELLINGS.length,
        instrument: instrument ? 1 : 0,
      },
      notes: `L2, exhaustive over p, tau and k, exact. Committed turning weave: ${describe(committed)}. Triality weave: ${describe(weave)}. tau lists the images of the tones -1, 0, 1.`,
    })
  },
})
