// A rule that keeps colour and connects every line. E-FRC-0107 shows that no rule coupling lines in
// pairs can keep a colour-selecting triality and still connect all twelve lines, and names the way
// out: a four-line block, one colour line with a whole triality orbit of three. This builds that rule,
// the triality weave (code/rule/triality-weave), on the D4-shaped box where triality acts
// (E-FRC-0108), and measures it against the structural gates the committed turning weave was adopted
// for (E-FND-0117).
//
// The rule, each beat V S P S V on the palindrome r = 0, 1, 2, 2, 1, 0: P the committed pair clock on
// every line, V a four-line vertex on the block of colour line f_r and one triality orbit, swapping
//   f (s, 0) with the orbit empty  <->  f (-s, -s) with every orbit line (s, 0)   (triple creation)
// and its (0, s) form, s = +1 and -1, and S the committed turning weave's conditional swap in
// triality-symmetric form (colour lines r and r + 1 as a couple, and two orbits line by line in their
// triality order). The triple creation is the classical three-at-once vertex the committed rule lacks
// (E-FRC-0094): one charge on the colour line turns into three identical charges, one on each line of
// the orbit, which a triality treats alike.
//
// How it got here, all measured on this box: a first version fired the vertex on all three blocks
// every beat and added an orbit exchange (f empty with one orbit line s <-> f (s, s) with that line
// -s). It was connected, and a single tone avalanched over 40,000 slots, because a triality-symmetric
// move between a colour line and its orbit must change the number of tones by a multiple of three. The
// orbit exchange drove the avalanche. Creation alone was bounded but disconnected on a dense
// background. Firing the creation on one block per beat and adding the symmetric swaps, which never add
// a tone, keeps both: connected on the vacuum and on a dense background, with dressing that grows more
// slowly than the committed rule's (E-FRC-0111).
//
// Gates, each measured, on the side-5 D4 box:
// - the triality is orientation preserving (the two colour-selecting trialities of the previous knit)
// - exact reversal after 24 beats forward and back, from three starts
// - charge conserved at every beat
// - the evolution commutes with the triality, beat by beat
// - CPT at the collision level: charge conjugation with time reversal at a mirror phase
// - the vacuum is periodic
// - universality: the line graph (which lines a disturbance on each line ever reaches) is connected,
//   on the vacuum and on a dense background, the standard the turning weave was adopted by. The
//   fewest lines any single seed reaches is printed: the final rule has a species that stays on its
//   own line for 24 beats, a free mode like the committed rule's phase-protected one, and the first
//   avalanching version's gate that every seed reach all 12 lines was dropped for that reason
// Controls: the previous knit keeps the triality but its line graph has 12 components (no line ever
// reaches another). The committed turning weave keeps no triality (E-FRC-0108). Its line graph
// depends on the background, and both readings are printed: on a dense background it is connected,
// and on the empty vacuum a lone disturbance stays in one of 3 sectors (lines 0 2 3 4 6 8 10, lines
// 1 5 7 9, and line 11 alone) at 24, 48 and 96 beats and on both boxes. Line 11 alone matches the
// adoption's own phase-protected free modes. Its adoption measured universality as the graph of swap
// edges in the schedule (E-FND-0117), a different quantity. The triality weave is connected on both.
//
// Depth L2: a constructed rule measured against stated gates, not the committed rule. It shows the
// design space is not empty: colour selection by triality, universality and CPT can coexist once the
// rule has one four-line vertex. Adopting it is a decision about the base.

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
  pairCollision,
  turningWeave,
  type Collision,
} from '@/code/rule/collision'
import {
  TRIALITY_WEAVE_PERIOD,
  trialityWeave,
  trialityWeaveLayout,
} from '@/code/rule/triality-weave'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import {
  boxCellMap,
  d4BoxMesh,
  linearMapOf,
  transformState,
} from '@/code/substrate/d4-box'

const SIDE = 5
const GOLDEN = (Math.sqrt(5) - 1) / 2
const keyOf = (list: readonly number[]): string =>
  [...list].sort((a, b) => a - b).join(',')

export default experiment({
  id: 'gauge/triality-weave',
  code: 'E-FRC-0109',
  title:
    'a rule with one four-line vertex, a charge on a colour line turning into three identical charges on a triality orbit, plus the committed swap made triality-symmetric, keeps the colour-selecting triality, reverses exactly, conserves charge, is CPT exact and connects all twelve lines on the vacuum and on a dense background, which E-FRC-0107 showed no pairwise rule can do',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const box = d4BoxMesh({ side: SIDE })
    const opposite = meshOpposites(box)
    const roots = rootsD4()
    const permutations = weylF4DirectionPermutations({
      directions: roots,
    })
    const triangles = zeroSumTriangles({ directions: roots })
    const planes = new Set(
      triangles.map(t =>
        keyOf([...t, ...t.map(d => opposite[d] ?? d)]),
      ),
    )
    const selectors = permutations.filter(
      p =>
        permutationOrder({ permutation: p }) === 3 &&
        planes.has(
          keyOf(
            p
              .map((image, d) => (image === d ? d : -1))
              .filter(d => d >= 0),
          ),
        ),
    )
    const usable = selectors.filter(p => {
      try {
        trialityWeaveLayout({ opposite, triality: p })

        return true
      } catch {
        return false
      }
    })
    const sigma = usable[0] ?? selectors[0] ?? []
    const layout = trialityWeaveLayout({ opposite, triality: sigma })
    const forward = trialityWeave({ layout })
    const backward = trialityWeave({ layout, forward: false })
    const starts = [0, 1, 2].map(seed => {
      const will = makeWill(box)

      for (let i = 0; i < will.data.length; i++) {
        const u = ((i + 1) * GOLDEN * (seed + 1.37)) % 1

        will.data[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
      }

      return will
    })
    const charge = (w: Will): number =>
      w.data.reduce((a, b) => a + b, 0)

    // reversal and charge
    let reverses = true
    let chargeKept = true

    for (const start of starts) {
      let w: Will = { mesh: box, data: Int8Array.from(start.data) }

      for (let t = 0; t < 24; t++) {
        w = beat(w, forward(t))
        chargeKept = chargeKept && charge(w) === charge(start)
      }

      for (let t = 23; t >= 0; t--) {
        w = inverseBeat(w, backward(t))
      }

      reverses = reverses && w.data.every((x, k) => x === start.data[k])
    }

    // triality
    const matrix = linearMapOf(sigma)
    const cellMap =
      matrix === undefined
        ? undefined
        : boxCellMap({ matrix, side: SIDE })

    let commutes = cellMap !== undefined

    for (const start of starts) {
      if (cellMap === undefined) {
        break
      }

      let a: Will = { mesh: box, data: Int8Array.from(start.data) }
      let b: Will = {
        mesh: box,
        data: transformState({
          data: start.data,
          cellMap,
          permutation: sigma,
          degree: 24,
        }),
      }

      for (let t = 0; t < 12; t++) {
        a = beat(a, forward(t))
        b = beat(b, forward(t))
        commutes =
          commutes &&
          transformState({
            data: a.data,
            cellMap,
            permutation: sigma,
            degree: 24,
          }).every((x, k) => x === b.data[k])
      }
    }

    // CPT at the collision level, on one cell's 24 slots, sparse and dense states
    const applyCell = (
      collision: Collision,
      v: Int8Array,
    ): Int8Array => {
      const s = Int8Array.from(v)

      collision(s, 0, 24)

      return s
    }

    let cptPhase = -1

    for (let c = 0; c < TRIALITY_WEAVE_PERIOD && cptPhase < 0; c++) {
      let holds = true

      for (let t = 0; t < TRIALITY_WEAVE_PERIOD && holds; t++) {
        const mirror =
          (((c - t) % TRIALITY_WEAVE_PERIOD) + TRIALITY_WEAVE_PERIOD) %
          TRIALITY_WEAVE_PERIOD

        for (let n = 0; n < 400 && holds; n++) {
          const v = new Int8Array(24)

          for (let i = 0; i < 24; i++) {
            v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1

            if (n % 2 === 0 && (n + i) % 5 !== 0) {
              v[i] = 0
            }
          }

          const rhs = applyCell(forward(t), v)
          const lhs = applyCell(
            backward(mirror),
            Int8Array.from(v, x => -x),
          )

          holds = lhs.every((x, k) => -x === rhs[k])
        }
      }

      if (holds) {
        cptPhase = c
      }
    }

    // vacuum
    let vacuum: Will = makeWill(box)
    let vacuumPeriod = -1

    for (let t = 1; t <= 24 && vacuumPeriod < 0; t++) {
      vacuum = beat(vacuum, forward(t - 1))

      if (vacuum.data.every(x => x === 0)) {
        vacuumPeriod = t
      }
    }

    // universality: the lines a lone tone disturbs, and the components of the line graph
    const mid = (SIDE - 1) / 2
    const center = mid * (1 + SIDE + SIDE ** 2 + SIDE ** 3)
    const lineOf = (d: number): number =>
      layout.lines.findIndex(([a, b]) => a === d || b === d)

    // the background a disturbance runs on: the empty vacuum, or a dense golden-ratio pattern
    const background = (dense: boolean): Will => {
      const will = makeWill(box)

      if (dense) {
        for (let i = 0; i < will.data.length; i++) {
          const u = ((i + 1) * GOLDEN * 1.37) % 1

          will.data[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
        }
      }

      return will
    }

    const lineGraph = (
      rule: (t: number) => Collision,
      dense = false,
    ): { components: number; fewestReached: number } => {
      const parent = Array.from({ length: 12 }, (_, i) => i)
      const find = (x: number): number =>
        parent[x] === x ? x : (parent[x] = find(parent[x] ?? x))

      let fewest = 12

      for (let direction = 0; direction < 24; direction++) {
        let vac: Will = background(dense)
        let seeded: Will = background(dense)

        const touched = new Set<number>()
        const slot = center * 24 + direction

        seeded.data[slot] = seeded.data[slot] === 1 ? -1 : 1

        for (let t = 0; t < 24; t++) {
          vac = beat(vac, rule(t))
          seeded = beat(seeded, rule(t))

          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vac.data[i]) {
              touched.add(lineOf(i % 24))
            }
          }
        }

        fewest = Math.min(fewest, touched.size)

        for (const line of touched) {
          parent[find(line)] = find(lineOf(direction))
        }
      }

      return {
        components: new Set(
          Array.from({ length: 12 }, (_, i) => find(i)),
        ).size,
        fewestReached: fewest,
      }
    }

    const weave = lineGraph(forward)
    const weaveDense = lineGraph(forward, true)
    const knit = lineGraph(() => pairCollision({ opposite }))
    const turning = lineGraph(turningWeave({ opposite }))
    const turningDense = lineGraph(turningWeave({ opposite }), true)

    const ok =
      usable.length === 2 &&
      reverses &&
      chargeKept &&
      commutes &&
      cptPhase >= 0 &&
      vacuumPeriod > 0 &&
      weave.components === 1 &&
      weaveDense.components === 1 &&
      knit.components === 12

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the D4 box the triality weave, built on one of the 2 orientation-preserving colour-selecting trialities, reverses exactly after 24 beats, conserves charge at every beat, commutes with its triality beat by beat, is CPT exact at the collision level, has a periodic vacuum, and sends a lone tone from every one of the 24 directions to all 12 lines, one connected line graph, on the vacuum and on a dense background, where the previous knit keeps the triality with 12 disconnected lines, and the committed turning weave keeps no triality and is connected on a dense background but splits into 3 sectors on the vacuum',
      metrics: {
        usableTrialities: usable.length,
        reversesExactly: reverses ? 1 : 0,
        chargeConserved: chargeKept ? 1 : 0,
        commutesWithTriality: commutes ? 1 : 0,
        cptMirrorPhase: cptPhase,
        vacuumPeriod,
        lineGraphComponents: weave.components,
        lineGraphComponentsDense: weaveDense.components,
        fewestLinesReachedBySeed: weave.fewestReached,
      },
      control: {
        previousKnitLineComponents: knit.components,
        turningWeaveLineComponentsVacuum: turning.components,
        turningWeaveLineComponentsDense: turningDense.components,
        colourSelectingTrialities: selectors.length,
      },
      notes:
        'L2, a constructed rule, exact, no random numbers. It is the positive half of E-FRC-0107: colour selected by triality, universality and CPT coexist once the rule has a four-line vertex, and the vertex it needs is a classical one, one charge on the colour line exchanged for three identical charges across the triality orbit. The rest of the acceptance battery is E-FRC-0111. Not measured: the particle content, and whether the orbit-momentum shadows are conserved colour charges, which the pair clock (it reverses a lone tone) makes unlikely. Adopting the rule would be a change to the base and a decision.',
    })
  },
})
