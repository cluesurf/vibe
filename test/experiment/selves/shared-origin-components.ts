// Distributed selves as components of shared history (E-SLF-0177). A PURE READING: no rule piece is changed or added.
//
// THE IDEA (the user's). A person is not one vibe but many, spread in space yet felt as one. The model already has a
// relation that is not spatial: shared history, the causal-ancestry reading chosen for one causal world (E-RLT-0089,
// E-RLT-0093). Vibes that met stay related however far the take carries them apart, since history is never erased. So a
// candidate self is a component of that relation that is bounded (not the whole world), persistent (it stays one
// component, neither dissolving nor swallowed) and spread on the husk while one in relation.
//
// WHAT IS READ (code/measure/relation-graph).
//  - A NODE IS A VIBE: the knit makes and unmakes no vibe (a stored unit is its two vibes at rest on a line, a made
//    pair is those two back in the slots), so each vibe is one trail of takes from beat 0 to the end. The rule itself
//    carries which trail is which: the open bit rides with the vibe through every piece, and is a pure passenger on the
//    paths read here. Each vibe's number is written into the open bits, one bit plane per run, and read back.
//  - AN EDGE IS A MEETING: at beat t, every vibe in a slot of dock x before or after the collision meets every other
//    (the dock permutation reads the dock's whole slot occupation), and a stored unit on a line of x meets them when that
//    line holds a slot vibe (the pair piece reads the line's store with its slots). A stored unit's two vibes are one.
//    This BROAD reading is the gated one. The NARROW reading (vibes on one line of one dock) is reported beside it.
//  - Components of the growing relation, at every beat; at the end each component's size, the beat it last grew by a
//    merge, and the husk columns its vibes sit on.
//
// THE KNITS, side 8 (4,096 docks, 24,576 vibes, all stored at beat 0), 96 beats, the 17 starts of E-MTH-0028:
//  - THE WORKING VACUUM: the no-veto two-point store under the pass contact with the coin on (code/rule/coined-locked-
//    knit's rule, run on paths through code/measure/occupation-veto-readings with `coin`), on the Born-rate path (E-RLT-
//    0105's; every vibe open, as there). Under the no-veto store the occupation is the same on every path (E-RLT-0102's
//    autonomy theorem) and the coin crosses 0 times in the vacuum (E-RLT-0105), so the relation read is the same on
//    every term.
//  - THE OLD KNIT, the control: the point veto under the bounce ('lone'), no coin, on its own history (the keep path).
//
// Gates, fixed before this file's first run:
//  I1 instrument: on all 34 (start, knit) runs every bit plane has the plain run's occupation at every beat (0 slots or
//     store lines differ) and every read of the numbers, before and after every collision, is a permutation
//  I2 calibration, a known answer (integer+0, each knit's rule on its keep path, where the coin never crosses; an empty
//     box, no store): a love A at the center on slot f (the first line's first slot), a fear B four docks along f on
//     the opposite slot, and a love C one dock off the line along a root orthogonal to f, on slot f (parallel to A, so
//     it never shares a dock with A, and off B's line). Required: no meeting joins anything at beats 0 and 1; A and B
//     are joined at beat 2 in both readings (they share a line of one dock there); C is alone through beat 2
//  G1 the question: a CANDIDATE DISTRIBUTED SELF is a component at the end of the broad relation with (a) at least 3
//     and at most half of all vibes, (b) no growth in the last 48 beats (its last merge at beat 48 or before), and
//     (c) its vibes at the end on husk columns at cyclic L-infinity distance 3 or more apart (more than a radius-1
//     ball). G1 holds on a start when the working vacuum has at least one candidate there.
// Verdict: fail if I1 or I2 fails (the reader is not trusted); otherwise pass if G1 holds on 17 of 17 starts, partial on
// 1 to 16, fail on 0.
// Reported, never gated: per knit and reading, the components and the largest component at every beat, the first beat
// the largest holds 90% of all vibes (the giant, a trivial outcome) and whether every component is a single vibe or a
// unit (the other trivial outcome); the candidates on the old knit and in the narrow reading; the largest component's
// husk columns and its relational eccentricity (a double sweep through meetings, integer+0).
// PREDICTED: fail. The dock-level copy history is one causal component covering the husk by beat 9 (E-RLT-0105 G4), and
// every vacuum vibe meets others at nearly every dock it enters, so the broad relation should be one giant component
// within about ten beats and leave no bounded component. The narrow reading is not predicted.
//
// PROBES before this file, disclosed: tmp/slf177-probe1 (integer+0, 8 beats, both knits) read only the instrument (0
// occupation breaks, 0 id breaks, 24,576 vibes in 15 bit planes) and the time (0.07 s a beat). It read no component.
//
// FIRST RUN (311 s, tmp/slf177-run1.log): fail, as predicted, no gate moved. I1 holds (0 occupation and 0 id breaks on
// 34 of 34 runs) and I2 holds on both knits. THE BROAD RELATION IS ONE COMPONENT FROM BEAT 1: 3,072 components after
// beat 0, one holding all 24,576 vibes after beat 1, on every start and both knits, spread over 384 of 512 husk columns
// (husk diameter 4, the most side 8 allows) and relationally tight (a double sweep reads 4 hops through meetings on
// the working vacuum, 5 on the old knit). So 0 candidates on 17 of 17 starts. THE NARROW RELATION (one line of one
// dock) IS THE OPPOSITE: 3,072 components of exactly 8 vibes (four stored units), formed at beat 1 and never growing
// through beat 96, each on 4 husk columns at diameter 4. By the stated criteria every one of them is a candidate
// (3,072 on every start, both knits), but they are what the rule's line locality makes, and they span the box's own
// period: they are the lines' closed exchange systems, not selves. The working vacuum and the old knit read the same
// number on every count. Title written after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; path choices are integer Weyl numbers of the key.
// Depth L2: a reading of the rule's own history. Husk first: spread is read on husk columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4, dotVec } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { boxHusk, rootOf } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  toWords,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import {
  vacuumConfiguration,
  THRESHOLD_BORN,
  THRESHOLD_KEEP,
} from '@/code/measure/doublet-locked-readings'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import {
  componentsOf,
  huskSpread,
  relationalSweep,
  relationRun,
  type Relation,
  type RelationRun,
} from '@/code/measure/relation-graph'

const SIDE = 8
const BEATS = 96
const QUIET = 48
const SPREAD = 3
const GIANT = 0.9

type Knit = {
  name: 'working' | 'old'
  contact: CollisionKind
  kind: VetoKind
  threshold: number
  coin: boolean
}

const KNITS: readonly Knit[] = [
  {
    name: 'working',
    contact: 'pass',
    kind: 'none',
    threshold: THRESHOLD_BORN,
    coin: true,
  },
  {
    name: 'old',
    contact: 'lone',
    kind: 'point',
    threshold: THRESHOLD_KEEP,
    coin: false,
  },
]

type Reading = {
  components: number[]
  largest: number[]
  giantBeat: number
  endComponents: number
  endLargest: number
  trivialSmall: boolean
  candidates: {
    size: number
    lastMerge: number
    columns: number
    diameter: number
  }[]
  largestColumns: number
  largestDiameter: number
}

function read(
  r: Relation,
  run: RelationRun,
  husk: ReturnType<typeof boxHusk>,
): Reading {
  const comps = componentsOf(r, run.count)
  const giantBeat = r.largest.findIndex(x => x >= GIANT * run.count)
  const biggest = comps.reduce(
    (a, c) => (c.members.length > a.members.length ? c : a),
    comps[0]!,
  )
  const big = huskSpread(biggest.members, run.dock, husk)
  const candidates = comps
    .filter(
      c =>
        c.members.length >= 3 &&
        c.members.length <= run.count / 2 &&
        c.lastMerge <= BEATS - QUIET,
    )
    .map(c => ({
      size: c.members.length,
      lastMerge: c.lastMerge,
      ...huskSpread(c.members, run.dock, husk),
    }))
    .filter(c => c.diameter >= SPREAD)

  return {
    components: r.components,
    largest: r.largest,
    giantBeat,
    endComponents: comps.length,
    endLargest: biggest.members.length,
    trivialSmall: comps.every(c => c.members.length <= 2),
    candidates,
    largestColumns: big.columns,
    largestDiameter: big.diameter,
  }
}

// I2: the known answer on an empty box, the knit's rule on its keep path
function calibrate(knit: Knit): {
  quietEarly: boolean
  joinedBroad: boolean
  joinedNarrow: boolean
  cAlone: boolean
} {
  const f = contactFresh(SIDE, knit.contact)
  const mesh = f.weave.mesh
  const roots = rootsD4()
  const first = LINE_FIRSTS[0]!
  const back = OPPOSITE[first]!
  const across = roots.findIndex(r => dotVec(r, roots[first]!) === 0)
  const center = centerOf(SIDE)

  let far = center

  for (let k = 0; k < 4; k++) {
    far = mesh.neighbour(far, first)
  }

  const start = vacuumConfiguration(
    {
      cells: f.cells,
      store: new Int8Array(f.cells * 12),
      layout: f.layout,
    },
    'none',
  )

  const plant = (slot: number, tone: number): void => {
    start.vibe[slot] = tone
    start.point[slot] = 0
    start.open[slot] = 1
  }

  // numbered in slot order: A, B, C are the three held slots in that order, so read their numbers by slot order
  const slots = [
    center * 24 + first,
    far * 24 + back,
    mesh.neighbour(center, across) * 24 + first,
  ]

  plant(slots[0]!, 1)
  plant(slots[1]!, -1)
  plant(slots[2]!, 1)

  const order = [...slots].sort((a, b) => a - b)
  const [a, b, c] = slots.map(s => order.indexOf(s)) as [
    number,
    number,
    number,
  ]
  const run = relationRun({
    kind: knit.kind,
    tables: f.tables,
    start: toWords(start),
    threshold: THRESHOLD_KEEP,
    coin: knit.coin,
    beats: 3,
  })

  // components after each beat: 3 at beats 0 and 1 means nothing joined; after beat 2, A with B and C alone
  const quietEarly =
    run.broad.components[0] === 3 &&
    run.broad.components[1] === 3 &&
    run.narrow.components[0] === 3 &&
    run.narrow.components[1] === 3
  const joinedBroad =
    rootOf(run.broad.parent, a) === rootOf(run.broad.parent, b)
  const joinedNarrow =
    rootOf(run.narrow.parent, a) === rootOf(run.narrow.parent, b)
  const cAlone =
    rootOf(run.broad.parent, c) === c &&
    rootOf(run.broad.parent, a) !== rootOf(run.broad.parent, c) &&
    rootOf(run.narrow.parent, a) !== rootOf(run.narrow.parent, c)

  return { quietEarly, joinedBroad, joinedNarrow, cAlone }
}

export default experiment({
  id: 'selves/shared-origin-components',
  code: 'E-SLF-0177',
  title:
    "no distributed self as a bounded component of shared history, fail: with a meeting read as the rule reads it (every vibe in a slot of one dock at one collision, and a stored unit with the slot vibes of its line), the relation of which vibes met is one component holding all 24,576 vibes from beat 1, on every start of the working vacuum (the coined no-veto store under the pass) and of the old knit, spread over 384 of 512 husk columns and 4 or 5 hops across, so 0 of 17 starts hold a bounded, persistent, spread component; read narrowly (vibes meeting on one line of one dock) it is 3,072 closed components of exactly 8 vibes (four stored units) from beat 1 through beat 96, each on 4 husk columns at the box's largest distance, which is the rule's line locality, not a self; the vibe numbers are carried by the rule's own open bit (0 breaks on 34 runs) and the reader passes a known meeting",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const family = startFamily(16)
    const calibration = withStart(family[0]!, () =>
      KNITS.map(k => ({ knit: k.name, ...calibrate(k) })),
    )
    const gI2 = calibration.every(
      c => c.quietEarly && c.joinedBroad && c.joinedNarrow && c.cAlone,
    )

    log('I2')

    const perStart = family.map((member, index) =>
      withStart(member, () => {
        const out = KNITS.map(knit => {
          const f = contactFresh(SIDE, knit.contact)
          const husk = boxHusk(f.weave.mesh, SIDE)
          const start = toWords(vacuumConfiguration(f, 'all'))
          const run = relationRun({
            kind: knit.kind,
            tables: f.tables,
            start,
            threshold: knit.threshold,
            coin: knit.coin,
            beats: BEATS,
            keepMeetings: index === 0,
          })
          const broad = read(run.broad, run, husk)
          const narrow = read(run.narrow, run, husk)

          let sweep = -1

          if (index === 0) {
            const comps = componentsOf(run.broad, run.count)
            const biggest = comps.reduce(
              (a, c) => (c.members.length > a.members.length ? c : a),
              comps[0]!,
            )

            sweep = relationalSweep(
              run.broad,
              biggest.members,
              run.count,
            )
          }

          return {
            knit: knit.name,
            count: run.count,
            bits: run.bits,
            occupationBreaks: run.occupationBreaks,
            idBreaks: run.idBreaks,
            broad,
            narrow,
            sweep,
          }
        })

        log(`start ${member.name}`)

        return { name: member.name, working: out[0]!, old: out[1]! }
      }),
    )

    const all = perStart.flatMap(p => [p.working, p.old])
    const gI1 = all.every(
      r => r.occupationBreaks === 0 && r.idBreaks === 0,
    )
    const g1 = perStart.filter(
      p => p.working.broad.candidates.length > 0,
    ).length
    const status =
      !gI1 || !gI2
        ? 'fail'
        : g1 === family.length
          ? 'pass'
          : g1 > 0
            ? 'partial'
            : 'fail'
    const range = (xs: number[]): string =>
      Math.min(...xs) === Math.max(...xs)
        ? `${Math.min(...xs)}`
        : `${Math.min(...xs)} to ${Math.max(...xs)}`
    const over = (
      which: 'working' | 'old',
      how: 'broad' | 'narrow',
      f: (r: Reading) => number,
    ): string => range(perStart.map(p => f(p[which][how])))
    const metrics: Record<string, number> = {
      starts: family.length,
      vibes: perStart[0]!.working.count,
      gateI1: gI1 ? 1 : 0,
      gateI2: gI2 ? 1 : 0,
      startsWithCandidate: g1,
    }

    for (const which of ['working', 'old'] as const) {
      for (const how of ['broad', 'narrow'] as const) {
        const rs = perStart.map(p => p[which][how])

        metrics[`${which}_${how}_candidateStarts`] = rs.filter(
          r => r.candidates.length > 0,
        ).length

        metrics[`${which}_${how}_candidatesMax`] = Math.max(
          ...rs.map(r => r.candidates.length),
        )

        metrics[`${which}_${how}_giantBeatMax`] = Math.max(
          ...rs.map(r => r.giantBeat),
        )

        metrics[`${which}_${how}_giantBeatMin`] = Math.min(
          ...rs.map(r => r.giantBeat),
        )

        metrics[`${which}_${how}_endComponentsMax`] = Math.max(
          ...rs.map(r => r.endComponents),
        )

        metrics[`${which}_${how}_endLargestMin`] = Math.min(
          ...rs.map(r => r.endLargest),
        )

        metrics[`${which}_${how}_largestColumnsMin`] = Math.min(
          ...rs.map(r => r.largestColumns),
        )

        metrics[`${which}_${how}_trivialSmallStarts`] = rs.filter(
          r => r.trivialSmall,
        ).length
      }

      metrics[`${which}_largestSweep_integer0`] =
        perStart[0]![which].sweep
    }

    metrics.seconds = (Date.now() - started) / 1000

    const traj = (xs: number[]): string =>
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 15, 23, 47, 95]
        .map(t => `${t}: ${xs[t]}`)
        .join(', ')

    const line = (
      which: 'working' | 'old',
      how: 'broad' | 'narrow',
    ): string => {
      const r0 = perStart[0]![which][how]

      return `${which} ${how}: giant (90%) from beat ${over(which, how, r => r.giantBeat)}; at beat 96 components ${over(which, how, r => r.endComponents)}, largest ${over(which, how, r => r.endLargest)} of ${perStart[0]!.working.count} on ${over(which, how, r => r.largestColumns)} of 512 husk columns (husk diameter ${over(which, how, r => r.largestDiameter)}); candidates per start ${perStart.map(p => p[which][how].candidates.length).join(' ')}; integer+0 components by beat [${traj(r0.components)}], largest by beat [${traj(r0.largest)}]; integer+0 candidates ${JSON.stringify(r0.candidates.slice(0, 8))}`
    }

    return verdict({
      status,
      claim: `instrument ${gI1} (0 occupation and id breaks on ${all.filter(r => r.occupationBreaks === 0 && r.idBreaks === 0).length} of ${all.length} runs), calibration ${gI2}; a candidate distributed self (3 to half of all vibes, no growth in the last ${QUIET} beats, husk spread ${SPREAD} or more) on ${g1} of ${family.length} starts of the working vacuum (broad reading); the broad relation holds 90% of all vibes from beat ${over('working', 'broad', r => r.giantBeat)} (working) and ${over('old', 'broad', r => r.giantBeat)} (old knit)`,
      metrics,
      control: {
        oldCandidateStarts: metrics.old_broad_candidateStarts ?? 0,
        oldGiantBeatMax: metrics.old_broad_giantBeatMax ?? 0,
      },
      notes: `L2. Calibration (integer+0, keep path, empty box): ${JSON.stringify(calibration)}. Instrument per start (working bits/occupation breaks/id breaks; old): ${perStart.map(p => `${p.name} ${p.working.bits}/${p.working.occupationBreaks}/${p.working.idBreaks}; ${p.old.bits}/${p.old.occupationBreaks}/${p.old.idBreaks}`).join(' | ')}. ${line('working', 'broad')}. ${line('working', 'narrow')}. ${line('old', 'broad')}. ${line('old', 'narrow')}. Relational eccentricity of the largest broad component on integer+0 (hops through meetings, double sweep): working ${perStart[0]!.working.sweep}, old ${perStart[0]!.old.sweep}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
