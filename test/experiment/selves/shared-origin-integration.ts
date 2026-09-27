// Is a component of shared history more than its parts? (E-SLF-0178). A PURE READING: no rule piece is changed.
//
// THE OBJECTS. E-SLF-0177 found no bounded component in the broad relation (every vibe in one component from beat 1)
// and, in the narrow relation (vibes meeting on one line of one dock), 3,072 components of exactly 8 vibes, formed at
// beat 1 and never growing through beat 96, each on 4 husk columns at the husk's largest distance (4 on side 8): the
// only bounded, persistent, spread components the rule's history makes. They are the objects here. At beat 0 every
// vibe is stored, and each such component is four stored units.
//
// THE MEASURE, and why it is this one. The rule gives no ensemble for an entropy: under the no-veto store the
// occupation history is the same on every term and every link start (E-RLT-0102's autonomy theorem), it is a
// deterministic function of the beat, and the signed state of the working vacuum is one term at every beat, so every
// region of it is pure and every quantum mutual information is exactly 0 (E-GRV-0068). A multi-information over states
// is therefore 0 for every grouping, by those theorems, and cannot tell a component from anything. What the rule does
// give is its deterministic map, and for a deterministic map the standard reading of "the whole is more than its parts"
// is the cut (Tononi's effective information across a bipartition, in its plainest form): take one half away and ask
// whether the other half's trail changes. Here, for a group split into two spatial halves A and B:
//   d(A -> B) = the (vibe, beat) pairs of B, over W beats, whose place in the full run holds a different trit when the
//               run starts with A's stored units removed, divided by |B| W
//   Phi = min(d(A -> B), d(B -> A))
// Phi > 0 means neither half's future is its own: each needs the other. Phi = 0 means the group splits into two parts
// that run as they would alone. Removal is the cut, since a stored unit is removed whole, the rule has nothing to read.
// THE CIRCULARITY, stated: the components were found by meetings, and a removal reaches another vibe only through a
// meeting, so Phi > 0 on a component is close to its definition. What is not circular is the control: whether a group
// of the same size and spread that is NOT a component is just as integrated, and whether a cut leaks out of the
// component (the leak, reported).
//
// THE GROUPS, per start (side 8, W = 24 beats, the working vacuum and the old knit as E-SLF-0177 runs them):
//  - COMPONENTS: 4 narrow components chosen by an integer Weyl index (rate 40503 / 2^16) among those of 4 units; the
//    halves are the component's units ordered by husk column, 2 and 2
//  - RANDOM-EQUIVALENT (the control): 4 groups of 4 units, each unit from a different component and on a different
//    husk column, chosen by an integer Weyl stream (rate 27145 / 2^16) and kept only when the group's husk column count
//    and diameter equal those of the matching component; halves by husk column, 2 and 2
//  - A COMPONENT CUT IN HALF (the second control): the first half (2 units) of each chosen component as a group, split
//    1 and 1 (reported)
//
// Gates, fixed before this file's first run:
//  I1 instrument: the full run's bit planes have its occupation at every beat and the numbers read are a permutation,
//     on all 34 (start, knit) runs
//  I2 calibration (integer+0, each knit's rule on its keep path, an empty box): E-SLF-0177's love A, fear B four docks
//     along A's line coming back toward it, and love C off the line parallel to A. The group {A | B} has Phi > 0 (they
//     meet at beat 2), and {A | C} has Phi = 0 exactly (they never meet)
//  G1 on a start, every chosen component of the working vacuum has Phi > 0
//  G2 on a start, the smallest Phi of the chosen components exceeds the largest Phi of the random-equivalent groups
// Verdict: fail if I1 or I2 fails; otherwise pass if G1 and G2 hold on 17 of 17 starts, fail if G1 holds on none,
// partial otherwise.
// Reported, never gated: every Phi and both directions, the half-cut groups' Phi, the leak (vibes outside the group
// whose place differs at beat W, the larger of the two cuts), and the old knit's same numbers.
// PREDICTED: G1 holds (a component's units met on their line and trade vibes there). G2 is not predicted: the broad
// relation joins every line at every dock from beat 1, and the dock permutation reads the whole dock, so a cut may
// reach another component's vibes, and then a random group would read Phi > 0 too.
//
// PROBES before this file, disclosed: none beyond E-SLF-0177's.
//
// DETERMINISM: no random numbers; group choices are integer Weyl streams; starts are E-MTH-0028's family. Depth L2.
// Husk first: halves and spreads are read on husk columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4, dotVec } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { boxHusk, rootOf, type BoxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { toWords, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { vacuumConfiguration, THRESHOLD_BORN, THRESHOLD_KEEP } from '@/code/measure/doublet-locked-readings'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { columnDistance, cutDifference, relationRun, type RelationRun } from '@/code/measure/relation-graph'

const SIDE = 8
const W = 24
const PICK = 4
const GOLDEN = 40503
const SILVER = 27145

type Knit = { name: 'working' | 'old'; contact: CollisionKind; kind: VetoKind; threshold: number; coin: boolean }

const KNITS: readonly Knit[] = [
  { name: 'working', contact: 'pass', kind: 'none', threshold: THRESHOLD_BORN, coin: true },
  { name: 'old', contact: 'lone', kind: 'point', threshold: THRESHOLD_KEEP, coin: false },
]

// a stored unit at beat 0: its store line, its two vibe numbers, its husk column
type Unit = { line: number; ids: [number, number]; column: number }
type Cut = { phi: number; ab: number; ba: number; leak: number }

function spreadOf(units: readonly Unit[], side: number): { columns: number; diameter: number } {
  const cols = [...new Set(units.map(u => u.column))]
  let diameter = 0

  for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) diameter = Math.max(diameter, columnDistance(cols[i]!, cols[j]!, side))

  return { columns: cols.length, diameter }
}

const byColumn = (a: Unit, b: Unit): number => a.column - b.column || a.line - b.line

function cutOf(input: { knit: Knit; tables: LockedTables; start: Configuration; full: RelationRun; a: readonly Unit[]; b: readonly Unit[] }): Cut {
  const { knit, tables, start, full, a, b } = input
  const inside = new Set([...a, ...b].flatMap(u => u.ids))
  const one = (from: readonly Unit[], to: readonly Unit[]) =>
    cutDifference({ kind: knit.kind, tables, start, threshold: knit.threshold, coin: knit.coin, full, removed: { slots: [], lines: from.map(u => u.line) }, watched: to.flatMap(u => u.ids), inside })
  const x = one(a, b)
  const y = one(b, a)
  const ab = x.moved / (2 * b.length * W)
  const ba = y.moved / (2 * a.length * W)

  return { phi: Math.min(ab, ba), ab, ba, leak: Math.max(x.leak, y.leak) }
}

// I2: the known answer on an empty box, the knit's rule on its keep path; groups of single vibes (removed by slot)
function calibrate(knit: Knit): { ab: Cut; ac: Cut } {
  const f = contactFresh(SIDE, knit.contact)
  const mesh = f.weave.mesh
  const roots = rootsD4()
  const first = LINE_FIRSTS[0] as number
  const back = OPPOSITE[first] as number
  const across = roots.findIndex(r => dotVec(r, roots[first] as number[]) === 0)
  const center = centerOf(SIDE)
  let far = center

  for (let k = 0; k < 4; k++) far = mesh.neighbour(far, first)

  const start = vacuumConfiguration({ cells: f.cells, store: new Int8Array(f.cells * 12), layout: f.layout }, 'none')
  const slots = [center * 24 + first, far * 24 + back, mesh.neighbour(center, across) * 24 + first]

  slots.forEach((s, k) => {
    start.vibe[s] = k === 1 ? -1 : 1
    start.point[s] = 0
    start.open[s] = 1
  })

  const words = toWords(start)
  const order = [...slots].sort((p, q) => p - q)
  const id = (s: number): number => order.indexOf(s)
  const full = relationRun({ kind: knit.kind, tables: f.tables, start: words, threshold: THRESHOLD_KEEP, coin: knit.coin, beats: W, track: true })
  const k: Knit = { ...knit, threshold: THRESHOLD_KEEP }
  const pair = (p: number, q: number): Cut => {
    const inside = new Set([id(p), id(q)])
    const x = cutDifference({ kind: k.kind, tables: f.tables, start: words, threshold: k.threshold, coin: k.coin, full, removed: { slots: [p], lines: [] }, watched: [id(q)], inside })
    const y = cutDifference({ kind: k.kind, tables: f.tables, start: words, threshold: k.threshold, coin: k.coin, full, removed: { slots: [q], lines: [] }, watched: [id(p)], inside })
    const ab = x.moved / W
    const ba = y.moved / W

    return { phi: Math.min(ab, ba), ab, ba, leak: Math.max(x.leak, y.leak) }
  }

  return { ab: pair(slots[0]!, slots[1]!), ac: pair(slots[0]!, slots[2]!) }
}

function readKnit(knit: Knit): { breaks: number; components: Cut[]; random: Cut[]; halves: Cut[]; sizes: string; spreads: string; randomTries: number } {
  const f = contactFresh(SIDE, knit.contact)
  const husk: BoxHusk = boxHusk(f.weave.mesh, SIDE)
  const start = toWords(vacuumConfiguration(f, 'all'))
  const full = relationRun({ kind: knit.kind, tables: f.tables, start, threshold: knit.threshold, coin: knit.coin, beats: W, track: true })
  const units: Unit[] = []

  for (let l = 0; l < start.store.length; l++) {
    if (start.store[l] === 0) continue

    const k = units.length

    units.push({ line: l, ids: [2 * k, 2 * k + 1], column: husk.column[(l / 12) | 0] as number })
  }

  const compOf = (u: Unit): number => rootOf(full.narrow.parent, u.ids[0])
  const byComp = new Map<number, Unit[]>()

  for (const u of units) {
    const c = compOf(u)
    const list = byComp.get(c)

    if (list) list.push(u)
    else byComp.set(c, [u])
  }

  const sizeCounts = new Map<number, number>()

  for (const list of byComp.values()) sizeCounts.set(list.length, (sizeCounts.get(list.length) ?? 0) + 1)

  const fours = [...byComp.entries()].filter(([, list]) => list.length === 4).sort((p, q) => p[0] - q[0])
  const chosen: Unit[][] = []

  for (let j = 1; chosen.length < PICK && j < 10_000; j++) {
    const index = (((j * GOLDEN) % 65536) * fours.length) >> 16
    const list = fours[index]![1]

    if (!chosen.includes(list)) chosen.push(list)
  }

  const components = chosen.map(list => {
    const sorted = [...list].sort(byColumn)

    return cutOf({ knit, tables: f.tables, start, full, a: sorted.slice(0, 2), b: sorted.slice(2) })
  })
  const halves = chosen.map(list => {
    const sorted = [...list].sort(byColumn).slice(0, 2)

    return cutOf({ knit, tables: f.tables, start, full, a: sorted.slice(0, 1), b: sorted.slice(1) })
  })

  // the random-equivalent groups: one per chosen component, the same column count and diameter, units from distinct
  // components on distinct columns
  let m = 0
  let randomTries = 0
  const random = chosen.map(list => {
    const target = spreadOf(list, SIDE)
    const group: Unit[] = []

    while (group.length < 4 && randomTries < 1_000_000) {
      m++
      randomTries++

      const u = units[(((m * SILVER) % 65536) * units.length) >> 16]!

      if (group.some(g => compOf(g) === compOf(u) || g.column === u.column)) continue
      group.push(u)

      if (group.length === 4) {
        const s = spreadOf(group, SIDE)

        if (s.columns !== target.columns || s.diameter !== target.diameter) group.pop()
      }
    }

    const sorted = [...group].sort(byColumn)

    return cutOf({ knit, tables: f.tables, start, full, a: sorted.slice(0, 2), b: sorted.slice(2) })
  })

  return {
    breaks: full.occupationBreaks + full.idBreaks,
    components,
    random,
    halves,
    sizes: JSON.stringify([...sizeCounts.entries()]),
    spreads: JSON.stringify(chosen.map(list => spreadOf(list, SIDE))),
    randomTries,
  }
}

export default experiment({
  id: 'selves/shared-origin-integration',
  code: 'E-SLF-0178',
  title: 'integration of the components of shared history: not yet run',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(16)
    const calibration = withStart(family[0]!, () => KNITS.map(k => ({ knit: k.name, ...calibrate(k) })))
    const gI2 = calibration.every(c => c.ab.phi > 0 && c.ac.ab === 0 && c.ac.ba === 0)

    log('I2')

    const perStart = family.map(member =>
      withStart(member, () => {
        const working = readKnit(KNITS[0]!)
        const old = readKnit(KNITS[1]!)

        log(`start ${member.name}`)

        return { name: member.name, working, old }
      }),
    )

    type R = ReturnType<typeof readKnit>
    const gI1 = perStart.every(p => p.working.breaks === 0 && p.old.breaks === 0)
    const g1 = (r: R): boolean => r.components.every(c => c.phi > 0)
    const g2 = (r: R): boolean => Math.min(...r.components.map(c => c.phi)) > Math.max(...r.random.map(c => c.phi))
    const n1 = perStart.filter(p => g1(p.working)).length
    const n12 = perStart.filter(p => g1(p.working) && g2(p.working)).length
    const status = !gI1 || !gI2 ? 'fail' : n12 === family.length ? 'pass' : n1 === 0 ? 'fail' : 'partial'
    const fmt = (x: number): string => x.toFixed(4)
    const span = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? fmt(xs[0]!) : `${fmt(Math.min(...xs))} to ${fmt(Math.max(...xs))}`)
    const metrics: Record<string, number> = { starts: family.length, gateI1: gI1 ? 1 : 0, gateI2: gI2 ? 1 : 0, startsG1: n1, startsG1G2: n12 }

    for (const which of ['working', 'old'] as const) {
      const rs = perStart.map(p => p[which])

      metrics[`${which}_G1Starts`] = rs.filter(g1).length
      metrics[`${which}_G2Starts`] = rs.filter(g2).length
      metrics[`${which}_componentPhiMin`] = Math.min(...rs.flatMap(r => r.components.map(c => c.phi)))
      metrics[`${which}_componentPhiMax`] = Math.max(...rs.flatMap(r => r.components.map(c => c.phi)))
      metrics[`${which}_randomPhiMin`] = Math.min(...rs.flatMap(r => r.random.map(c => c.phi)))
      metrics[`${which}_randomPhiMax`] = Math.max(...rs.flatMap(r => r.random.map(c => c.phi)))
      metrics[`${which}_halfPhiMin`] = Math.min(...rs.flatMap(r => r.halves.map(c => c.phi)))
      metrics[`${which}_halfPhiMax`] = Math.max(...rs.flatMap(r => r.halves.map(c => c.phi)))
      metrics[`${which}_componentLeakMax`] = Math.max(...rs.flatMap(r => r.components.map(c => c.leak)))
      metrics[`${which}_randomLeakMax`] = Math.max(...rs.flatMap(r => r.random.map(c => c.leak)))
    }

    metrics.seconds = (Date.now() - started) / 1000

    const line = (which: 'working' | 'old'): string => {
      const rs = perStart.map(p => p[which])
      const r0 = rs[0]!
      const show = (cs: Cut[]): string => cs.map(c => `${fmt(c.phi)} (${fmt(c.ab)}/${fmt(c.ba)}, leak ${c.leak})`).join(', ')

      return `${which}: component Phi ${span(rs.flatMap(r => r.components.map(c => c.phi)))}, random-equivalent ${span(rs.flatMap(r => r.random.map(c => c.phi)))}, half-cut ${span(rs.flatMap(r => r.halves.map(c => c.phi)))}; leak components ${Math.min(...rs.flatMap(r => r.components.map(c => c.leak)))} to ${Math.max(...rs.flatMap(r => r.components.map(c => c.leak)))}, random ${Math.min(...rs.flatMap(r => r.random.map(c => c.leak)))} to ${Math.max(...rs.flatMap(r => r.random.map(c => c.leak)))} vibes; integer+0 component sizes in units ${r0.sizes}, chosen spreads ${r0.spreads}, random tries ${r0.randomTries}; integer+0 components [${show(r0.components)}], random [${show(r0.random)}], half-cut [${show(r0.halves)}]`
    }

    return verdict({
      status,
      claim: `instrument ${gI1}, calibration ${gI2} ({A | B} Phi ${calibration.map(c => fmt(c.ab.phi)).join(' and ')}, {A | C} ${calibration.map(c => `${fmt(c.ac.ab)}/${fmt(c.ac.ba)}`).join(' and ')}); every chosen component integrated (Phi > 0) on ${n1} of ${family.length} starts, and above every random-equivalent grouping on ${n12} of ${family.length} (working vacuum)`,
      metrics,
      control: { randomPhiMax: metrics.working_randomPhiMax ?? 0, halfPhiMin: metrics.working_halfPhiMin ?? 0 },
      notes: `L2. Calibration (integer+0, keep path, empty box): ${JSON.stringify(calibration)}. ${line('working')}. ${line('old')}. Per start (working G1/G2; old G1/G2): ${perStart.map(p => `${p.name} ${g1(p.working)}/${g2(p.working)}; ${g1(p.old)}/${g2(p.old)}`).join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
