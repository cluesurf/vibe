// THE SUPERPOSED RULE AS A QUANTUM CELLULAR AUTOMATON (E-QTM-0184, quantum-coverage path 1, OPEN-QTM-13). D'Ariano,
// Perinotti and Bisio derive the Weyl, Dirac and Maxwell walks from four axioms on a Cayley graph: unitarity, locality,
// homogeneity and isotropy (Bisio, D'Ariano, Perinotti, Tosini 2016, arXiv 1601.04832, Section II; the d = 3 Weyl
// classification in D'Ariano, Erba, Perinotti 2017, arXiv 1708.00826). This experiment explores whether the working rule
// (code/rule/coined-locked-knit coinedVetoBeat, veto 'none', tables on the pass contact: the rule of E-QTM-0157, 0158 and
// 0167) meets each axiom exactly, on the flat D4 box of side 5 (625 docks), and which link field it meets them on.
//
// WHAT IS RUN (code/measure/qca-axioms holds every instrument; amplitudes exact in Z[w][1/2]).
// (U) unitarity: the exact Gram matrix of the images of 5,907 distinct basis configurations under one beat, for beats 0
//     and 1 (the collision order alternates), on the trivial link field and on the committed start; and the inverse beat
//     returns every start exactly. Starts: one vibe (love or fear, points 0 and 4) on every slot of the 25 docks within
//     one step of the center (2,400); two vibes at the center on every pair of slots, the four kind orders, points (0, 4)
//     and (0, 0) (2,208); one vibe at the center and one on the next dock along slot 0, every slot pair, love-love and
//     love-fear, points (0, 4) (1,152); a stored pair on each center line, trit +-1, words (0, 4) and (4, 4), with its
//     slots empty, a love on its first slot or a fear on its second (144); a center dock of full lines in three
//     patterns (12 love-fear lines; 6 love-love lines, points 0 and 4; 6 fear-fear lines, points 4 and 0) (3). The like
//     patterns were 12 lines when first written: that start splits into 2^12 terms and the inverse beat's adjoint
//     meeting expands each again before merging (2^24 terms), which ran out of memory twice before any result was
//     read, so they were cut to 6 lines (2^6 and 2^12), the only change made after the probes, disclosed.
// (L) light cone: A = the diagonal phase at the center dock x (code/measure/qca-axioms dockPhase), B = the slot rotation
//     at dock y (dockRotation). For every one of the 625 docks y and 36 states at y (a love on each of the 24 slots,
//     point 0; two loves on the two slots of each of the 12 lines, points 0 and 4), the commutator [U^-n A U^n, B]
//     applied to the state, n = 1 and 2, on the committed start. Tallied by the mesh distance of y from x.
// (H) homogeneity and isotropy: the four basis translations of the box and the 48 W(F4) reflections that fix the center
//     dock (they generate the 1,152 element group, so commuting with them is commuting with the group). On 1,635 states
//     (the 96 one-vibe states at the center, the 1,104 two-vibe center states with points (0, 4), the 144 stores, the 3
//     full docks, and 288 two-vibe states with one vibe at the center and one along slot 0, love-love on the slot pairs
//     (d, e) with d + e even, points (0, 4)), at beats 0 and 1:
//     H-trivial: on the trivial link field, S U psi = U S psi with no gauge (the identity local unitary)
//     H-carried: on the committed start, S U_l psi = U_(S l) S psi, the link field carried by S (the local rule itself is
//                homogeneous and isotropic, the links a background)
//     H-strict:  on the committed start, a gauge (one grid move per dock, the local unitary on the points) making S
//                commute with U_l itself, searched over all 216 moves at one dock and propagated (gaugeFor)
//
// CONTROLS, each must fail where marked.
//   K1 (U must fail) the coin cut to its keep term: some image's norm is not 1
//   K2 (L must fail) the beat followed by the swap of the center dock with a dock 4 steps away: a commutator outside the
//      one-step cone, read on the 36 states at each of the 25 docks within one step of the far dock, n = 1
//   K3 (H must fail) the beat followed by a phase w on configurations holding a vibe at the center: not every
//      translation commutes (trivial links)
//   K4 (H splits) the beat followed by a phase w for every vibe on slot 0 of any dock: all 4 translations commute, some
//      reflection does not (trivial links)
//
// DERIVED BEFORE THE GATE RUN. The beat is coin (one line of one dock), meetings (one line), collision (one dock, a
// slot permutation), stream (each slot one dock along its own root). Each piece is unitary on configurations, so U is.
// The content of dock x after a beat came only from the 24 docks one step away, so U^-1 A_x U acts on those docks and
// not on x itself, and U^-n A_x U^n acts within n steps. Every piece reads only occupation, points through equality, and
// root geometry: a W(F4) map carries roots to roots, lines to lines, and the bounce table is covariant (code/rule/
// bounce-pair-knit, "W(F4) AND C"); a translation commutes with every piece once the links are carried along. With the
// committed links, which differ from link to link and carry a holonomy that is never trivial (E-QTM-0167), a gauge that
// carries the field onto its own translate would need every translated loop to keep its holonomy's class; the Weyl
// sequence start gives no reason for that.
//
// PROBES BEFORE THE GATES, DISCLOSED (tmp/qca-probe1.ts, tmp/qca-probe2.ts). probe 1: graph distances from the center of
// the side-5 box are 0 to 4 (1, 24, 144, 336, 120 docks), one beat on three vibes 3.5 ms. probe 2: Gram exact on 1,200
// center states at beat 0 on both link fields (1,536 overlapping pairs, all orthogonal), the keep-only coin fails 1,152
// norms; the basis translation commutes on 200 of 200 and every reflection on 120 of 120 states (trivial links); no
// gauge exists for the basis translation on the committed start and one exists on trivial links; a sparse cone sample
// (docks y = 0, 7, 14 .., slots 0, 7, 13) read no commutator at n = 1 and two at distance 2 at n = 2. No gate was
// changed after it.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
// U1 on both link fields and both beats: badNorms 0 and badPairs 0 over the 5,907 starts, and the inverse beat returns
//    every start exactly
// L1 for n = 1 and 2: no state at any dock farther than n steps reads a commutator (a strict cone of speed one step a
//    beat)
// L2 for n = 1 and 2: some state at a dock exactly n steps away reads one (the cone's edge is reached)
// H1 H-trivial: all 52 symmetries commute on every state at both beats, with no gauge
// H2 H-carried: all 52 symmetries carry U_l onto U_(S l) on every state at both beats
// H3 (transitivity, the isotropy axiom's "every direction equivalent"): the reflections that pass H1 carry slot 0 to all
//    24 slots
// K1, K2, K3, K4 as above
// P (predicted, a reading, not a kill): H-strict finds a gauge for none of the 52 symmetries (none is the identity) on
//    the committed start, so the rule on that field is not homogeneous in
//    D'Ariano's sense; the plain commutation (no gauge) fails for all 52.
//
// VERDICT, fixed before the run: fail if U1, L1, H1 or H2 fails; fail as an instrument if any control does not behave
// as marked; pass if U1, L1, L2, H1, H2, H3 and all four controls hold; partial otherwise. P is reported either way.
//
// WHAT THIS CAN AND CANNOT SHOW. It reads the four axioms on the flat D4 box, which is Z^4 with 24 generators: a
// virtually Abelian group, the case D'Ariano and Perinotti restrict to. It says nothing about a hyperbolic group (the
// bulk honeycombs are not run here). Unitarity is shown on the span of the starts, which cover every one- and two-vibe
// configuration on and next to one dock up to point labels; the cone on 36 states per dock. Homogeneity and isotropy
// are checked on generators, which is exact for the groups they generate, on the listed states. The rule is built of
// local unitaries, so passing is the expected outcome; the content is the exact check, the controls, and which link
// field the strict axioms hold on.
//
// DETERMINISM: no random number; the committed start is member integer+0. Depth L2: a known construction (a QCA
// assembled from local unitaries and a shift) confirmed on the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  applySymmetry,
  basisState,
  carriedLinks,
  dockDistances,
  dockMarkPhase,
  dockPhase,
  dockRotation,
  dockSwap,
  emptyConfiguration,
  f4BoxSymmetries,
  gaugeFor,
  gramReading,
  heisenbergCommutes,
  keepOnlyBeat,
  mapThen,
  sameState,
  slotPhase,
  stateAmplitudes,
  symmetryCommutes,
  tablesWith,
  thenMap,
  translationOf,
  workingBeats,
  type Beat,
  type GramReading,
  type MeshSymmetry,
} from '@/code/measure/qca-axioms'

const SIDE_LENGTH = 5
const BEATS = [0, 1]
const CONE_BEATS = [1, 2]
const POINT_A = 0
const POINT_B = 4

type Vibe = { x: number; d: number; v: number; p: number }
type Store = { x: number; l: number; tau: number; word: number }
// a start held as its few vibes and stores, built into a full configuration only when it is run (thousands of full
// configurations of 625 docks do not fit in memory at once)
type Spec = { vibes: readonly Vibe[]; stores: readonly Store[] }

function configOf(
  _cells: number,
  vibes: readonly Vibe[],
  stores: readonly Store[] = [],
): Spec {
  return { vibes, stores }
}

function build(cells: number, spec: Spec): LockedState {
  const { vibes, stores } = spec
  const c: Configuration = emptyConfiguration(cells)

  for (const { x, d, v, p } of vibes) {
    c.vibe[x * 24 + d] = v
    c.point[x * 24 + d] = p
    c.open[x * 24 + d] = 1
  }

  for (const { x, l, tau, word } of stores) {
    c.store[x * 12 + l] = tau
    c.spoint[x * 12 + l] = word
    c.sopen[x * 12 + l] = 3
  }

  return basisState(c)
}

const KINDS: readonly (readonly [number, number])[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

function centerPairs(
  cells: number,
  c: number,
  points: readonly (readonly [number, number])[],
): Spec[] {
  const out: Spec[] = []

  for (let d = 0; d < 24; d++) {
    for (let e = d + 1; e < 24; e++) {
      for (const [u, v] of KINDS) {
        for (const [p, q] of points) {
          out.push(
            configOf(cells, [
              { x: c, d, v: u, p },
              { x: c, d: e, v, p: q },
            ]),
          )
        }
      }
    }
  }

  return out
}

function storeStarts(cells: number, c: number): Spec[] {
  const out: Spec[] = []

  for (let l = 0; l < 12; l++) {
    const f = LINE_FIRSTS[l]!
    const s = OPPOSITE[f]!

    for (const tau of [1, -1]) {
      for (const word of [9 * POINT_A + POINT_B, 9 * POINT_B + POINT_B]) {
        const store = [{ x: c, l, tau, word }]

        out.push(configOf(cells, [], store))
        out.push(configOf(cells, [{ x: c, d: f, v: 1, p: POINT_A }], store))
        out.push(configOf(cells, [{ x: c, d: s, v: -1, p: POINT_B }], store))
      }
    }
  }

  return out
}

// the love-fear pattern fills all 12 lines; the like patterns fill the first 6 (12 like lines split into 2^12 terms,
// and the inverse beat's adjoint meeting expands each again before it merges, 2^24 terms, past memory)
function fullDocks(cells: number, c: number): Spec[] {
  const pattern = (u: number, v: number, p: number, q: number) =>
    configOf(
      cells,
      LINE_FIRSTS.slice(0, u === v ? 6 : 12).flatMap(f => [
        { x: c, d: f, v: u, p },
        { x: c, d: OPPOSITE[f]!, v, p: q },
      ]),
    )

  return [
    pattern(1, -1, POINT_A, POINT_A),
    pattern(1, 1, POINT_A, POINT_B),
    pattern(-1, -1, POINT_B, POINT_A),
  ]
}

export default experiment({
  id: 'quantum/qca-axioms',
  code: 'E-QTM-0184',
  title:
    "the superposed rule is a quantum cellular automaton on the flat D4 box, read exactly: unitary, a strict cone of one dock a beat, homogeneous and isotropic under all of W(F4) on trivial links; on the committed link field only covariantly, with no gauge carrying the field onto its translates",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const weave = makeColorWeave({ side: SIDE_LENGTH, table: 'bind' })
    const { moves } = weave
    const cells = weave.mesh.cellCount
    const c = centerOf(SIDE_LENGTH)
    const trivialLinks = new Int16Array(cells * 24).fill(moves.identity)
    const startLinks = weave.links
    const trivialTables = tablesWith(weave, trivialLinks)
    const startTables = tablesWith(weave, startLinks)
    const dist = dockDistances(weave, c)
    const near = Array.from({ length: cells }, (_, x) => x).filter(
      x => dist[x]! <= 1,
    )
    const along = weave.mesh.neighbour(c, 0)

    // ---- (U) unitarity ----
    const oneVibe: Spec[] = []

    for (const x of near) {
      for (let d = 0; d < 24; d++) {
        for (const v of [1, -1]) {
          for (const p of [POINT_A, POINT_B]) {
            oneVibe.push(configOf(cells, [{ x, d, v, p }]))
          }
        }
      }
    }

    const neighbourPairs: Spec[] = []

    for (let d = 0; d < 24; d++) {
      for (let e = 0; e < 24; e++) {
        for (const v of [1, -1]) {
          neighbourPairs.push(
            configOf(cells, [
              { x: c, d, v: 1, p: POINT_A },
              { x: along, d: e, v, p: POINT_B },
            ]),
          )
        }
      }
    }

    const unitStarts = [
      ...oneVibe,
      ...centerPairs(cells, c, [
        [POINT_A, POINT_B],
        [POINT_A, POINT_A],
      ]),
      ...neighbourPairs,
      ...storeStarts(cells, c),
      ...fullDocks(cells, c),
    ]

    const unitarity: {
      field: string
      beat: number
      gram: GramReading
      inverse: number
    }[] = []

    for (const [field, t] of [
      ['trivial', trivialTables],
      ['start', startTables],
    ] as const) {
      const b = workingBeats(t)

      for (const beat of BEATS) {
        let inverse = 0

        const images = unitStarts.map(spec => {
          const start = build(cells, spec)
          const image = b.forward(start, beat)

          inverse += sameState(b.back(image, beat), start) ? 0 : 1

          return stateAmplitudes(image)
        })

        unitarity.push({ field, beat, gram: gramReading(images), inverse })
      }
    }

    const keepOnlyBeatOf = keepOnlyBeat(trivialTables)
    const keepOnly = gramReading(
      unitStarts.map(spec =>
        stateAmplitudes(keepOnlyBeatOf(build(cells, spec), 0)),
      ),
    )

    log('unitarity')

    // ---- (L) light cone ----
    const coneStates = (y: number): Spec[] => [
      ...Array.from({ length: 24 }, (_, d) =>
        configOf(cells, [{ x: y, d, v: 1, p: POINT_A }]),
      ),
      ...LINE_FIRSTS.map(f =>
        configOf(cells, [
          { x: y, d: f, v: 1, p: POINT_A },
          { x: y, d: OPPOSITE[f]!, v: 1, p: POINT_B },
        ]),
      ),
    ]

    const working = workingBeats(startTables)

    const coneProfile = (input: {
      forward: Beat
      back: Beat
      beats: number
      docks: readonly number[]
    }): number[] => {
      const byDistance = new Array<number>(Math.max(...dist) + 1).fill(0)

      for (const y of input.docks) {
        for (const spec of coneStates(y)) {
          if (
            !heisenbergCommutes({
              forward: input.forward,
              back: input.back,
              beats: input.beats,
              a: dockPhase(c),
              b: dockRotation(y),
              psi: build(cells, spec),
            })
          ) {
            byDistance[dist[y]!]!++
          }
        }
      }

      return byDistance
    }

    const allDocks = Array.from({ length: cells }, (_, x) => x)
    const cones = CONE_BEATS.map(n => {
      const profile = coneProfile({
        forward: working.forward,
        back: working.back,
        beats: n,
        docks: allDocks,
      })

      log(`cone n = ${n}`)

      return { n, profile }
    })

    const far = allDocks.find(x => dist[x] === Math.max(...dist))!
    const farDist = dockDistances(weave, far)
    const swap = dockSwap(c, far)
    const swapped = coneProfile({
      forward: thenMap(working.forward, swap),
      back: mapThen(swap, working.back),
      beats: 1,
      docks: allDocks.filter(x => farDist[x]! <= 1),
    })

    log('cone control')

    // ---- (H) homogeneity and isotropy ----
    const symmetryStates = [
      ...oneVibe.filter((_, i) => Math.floor(i / 96) === near.indexOf(c)),
      ...centerPairs(cells, c, [[POINT_A, POINT_B]]),
      ...storeStarts(cells, c),
      ...fullDocks(cells, c),
      ...Array.from({ length: 24 * 24 }, (_, k) => [
        Math.floor(k / 24),
        k % 24,
      ])
        .filter(([d, e]) => (d! + e!) % 2 === 0)
        .map(([d, e]) =>
          configOf(cells, [
            { x: c, d: d!, v: 1, p: POINT_A },
            { x: along, d: e!, v: 1, p: POINT_B },
          ]),
        ),
    ]

    const translations = [0, 1, 2, 3].map(k =>
      translationOf(
        SIDE_LENGTH,
        [0, 1, 2, 3].map(j => (j === k ? 1 : 0)),
      ),
    )
    const reflections = f4BoxSymmetries({ side: SIDE_LENGTH, whole: false })
    const symmetries: MeshSymmetry[] = [...translations, ...reflections]
    const trivialBeats = workingBeats(trivialTables)

    // count of symmetries that commute on every state at every beat (stopping a symmetry at its first failure)
    const commuting = (input: {
      list: readonly MeshSymmetry[]
      beatOf: Beat
      beatAfter?: (s: MeshSymmetry) => Beat
      gauge?: (s: MeshSymmetry) => Int16Array | undefined
      states: readonly Spec[]
    }): boolean[] =>
      input.list.map(symmetry => {
        const map = applySymmetry({
          symmetry,
          moves,
          gauge: input.gauge?.(symmetry),
        })
        const after = input.beatAfter?.(symmetry)

        return BEATS.every(beat =>
          input.states.every(spec =>
            symmetryCommutes({
              beatOf: input.beatOf,
              beatAfter: after,
              map,
              psi: build(cells, spec),
              beat,
            }),
          ),
        )
      })

    const hTrivial = commuting({
      list: symmetries,
      beatOf: trivialBeats.forward,
      states: symmetryStates,
    })

    log('H trivial')

    const hCarried = commuting({
      list: symmetries,
      beatOf: working.forward,
      beatAfter: s =>
        workingBeats(tablesWith(weave, carriedLinks(startLinks, s)))
          .forward,
      states: symmetryStates,
    })

    log('H carried')

    const hPlain = commuting({
      list: symmetries,
      beatOf: working.forward,
      states: symmetryStates,
    })
    const gauges = symmetries.map(symmetry =>
      gaugeFor({ weave, links: startLinks, symmetry }),
    )
    const hStrict = commuting({
      list: symmetries.filter((_, i) => gauges[i] !== undefined),
      beatOf: working.forward,
      gauge: s => gauges[symmetries.indexOf(s)],
      states: symmetryStates,
    })
    const trivialGauges = symmetries.filter(
      symmetry =>
        gaugeFor({ weave, links: trivialLinks, symmetry }) !== undefined,
    ).length

    log('H strict')

    const k3 = commuting({
      list: translations,
      beatOf: thenMap(trivialBeats.forward, dockMarkPhase(c)),
      states: symmetryStates,
    })
    const k4Translations = commuting({
      list: translations,
      beatOf: thenMap(trivialBeats.forward, slotPhase(cells, 0)),
      states: symmetryStates,
    })
    const k4Reflections = commuting({
      list: reflections,
      beatOf: thenMap(trivialBeats.forward, slotPhase(cells, 0)),
      states: symmetryStates,
    })

    log('H controls')

    // transitivity of the passing reflections on the slots
    const orbit = new Set<number>([0])
    const passing = reflections.filter((_, i) => hTrivial[4 + i])

    for (let grew = true; grew; ) {
      grew = false

      for (const r of passing) {
        for (const d of [...orbit]) {
          const e = r.slotMap[d]!

          if (!orbit.has(e)) {
            orbit.add(e)
            grew = true
          }
        }
      }
    }

    // ---- gates ----
    const count = (xs: readonly boolean[]): number => xs.filter(Boolean).length
    const maxDist = Math.max(...dist)
    const g = {
      U1: unitarity.every(
        u => u.gram.badNorms === 0 && u.gram.badPairs === 0 && u.inverse === 0,
      ),
      L1: cones.every(({ n, profile }) =>
        profile.every((v, r) => r <= n || v === 0),
      ),
      L2: cones.every(({ n, profile }) => profile[n]! > 0),
      H1: count(hTrivial) === symmetries.length,
      H2: count(hCarried) === symmetries.length,
      H3: orbit.size === 24,
    }
    const k = {
      K1: keepOnly.badNorms > 0,
      K2: swapped.some((v, r) => r > 1 && v > 0),
      K3: count(k3) < translations.length,
      K4:
        count(k4Translations) === translations.length &&
        count(k4Reflections) < reflections.length,
    }
    const P =
      count(hPlain) === 0 && gauges.every(h => h === undefined)
    const status =
      !g.U1 || !g.L1 || !g.H1 || !g.H2 || !Object.values(k).every(Boolean)
        ? 'fail'
        : Object.values(g).every(Boolean)
          ? 'pass'
          : 'partial'

    const metrics: Record<string, number> = {
      unitStarts: unitStarts.length,
      symmetryStates: symmetryStates.length,
      symmetries: symmetries.length,
      maxDistance: maxDist,
    }

    for (const [key, v] of Object.entries({ ...g, ...k })) {
      metrics[`gate_${key}`] = v ? 1 : 0
    }

    metrics.P = P ? 1 : 0

    for (const u of unitarity) {
      metrics[`${u.field}_beat${u.beat}_overlappingPairs`] = u.gram.overlapping
      metrics[`${u.field}_beat${u.beat}_badNorms`] = u.gram.badNorms
      metrics[`${u.field}_beat${u.beat}_badPairs`] = u.gram.badPairs
      metrics[`${u.field}_beat${u.beat}_inverseMisses`] = u.inverse
    }

    for (const { n, profile } of cones) {
      profile.forEach((v, r) => {
        metrics[`cone_n${n}_distance${r}`] = v
      })
    }

    metrics.hTrivial = count(hTrivial)
    metrics.hCarried = count(hCarried)
    metrics.hPlain = count(hPlain)
    metrics.gaugesFoundStart = gauges.filter(h => h !== undefined).length
    metrics.gaugesStrictCommuting = count(hStrict)
    metrics.gaugesFoundTrivial = trivialGauges
    metrics.slotOrbit = orbit.size
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `on the flat D4 box (side 5) the superposed rule is exactly unitary on ${unitStarts.length} starts (both link fields, both beats, ${unitarity.map(u => u.gram.overlapping).join('/')} overlapping pairs orthogonal, inverse exact: ${g.U1}); its cone is strict at one dock a beat (commutators by distance n = 1 [${cones[0]!.profile.join(', ')}], n = 2 [${cones[1]!.profile.join(', ')}]); on trivial links ${count(hTrivial)} of ${symmetries.length} generators (4 translations, 48 W(F4) reflections) commute with no gauge, and the passing reflections reach ${orbit.size} of 24 directions; on the committed link field the rule is covariant (${count(hCarried)} of ${symmetries.length} carry U_l to U_(S l)) but ${count(hPlain)} commute plainly and a gauge exists for ${metrics.gaugesFoundStart} of ${symmetries.length}`,
      metrics,
      control: {
        keepOnlyBadNorms: keepOnly.badNorms,
        swapOutsideCone: swapped.filter((_, r) => r > 1).reduce((a, b) => a + b, 0),
        markPhaseTranslationsCommuting: count(k3),
        slotPhaseTranslationsCommuting: count(k4Translations),
        slotPhaseReflectionsCommuting: count(k4Reflections),
      },
      notes: `L2. Gates ${Object.entries({ ...g, ...k })
        .map(([key, v]) => `${key} ${v}`)
        .join(', ')}; P ${P}. Unitarity: ${unitarity
        .map(
          u =>
            `${u.field} beat ${u.beat}: norms ${u.gram.badNorms} bad, pairs ${u.gram.badPairs} bad of ${u.gram.overlapping} overlapping, max k ${u.gram.maxK}, inverse misses ${u.inverse}`,
        )
        .join('; ')}. Keep-only coin: ${keepOnly.badNorms} of ${keepOnly.states} norms off. Swap control (far dock ${far}, distance ${maxDist}): commutators by distance from the center [${swapped.join(', ')}]. K4 reflections commuting ${count(k4Reflections)} of 48. Gauges on trivial links found for ${trivialGauges} of ${symmetries.length}. ${metrics.seconds.toFixed(0)} s.`,
    })
  },
})
