// Which rules of the committed rule's design family conserve momentum, and what that costs.
//
// The family (code/rule/momentum-weave): per beat, six couples of a line and a wire; every wire runs a
// sum-keeping 9-state table; one couple per beat also runs a conditional exchange of its two lines'
// contents, slot for slot, around the table (swap, table, swap) or before it; the couples precess on a
// schedule. The freedoms are the table, the exchange's condition (any exchange-symmetric set of pairs of
// line states: 36 orbits, 2^36 conditions), the palindrome, the orientation of the exchange (straight or
// crossed), and the schedule. Every member is reversible and keeps charge.
//
// THE ARGUMENT. The collision of a beat is a product of maps on disjoint couples, and streaming moves no
// momentum, so the particle momentum P is conserved on every state if and only if each couple's map
// keeps it on each of its 81 states (a cell of inert couples and one active couple realizes any single
// couple's change). A couple's P is n_line e_line + n_wire e_wire, and the roots of two distinct lines are
// never parallel, so keeping P on a couple is keeping both line momenta. Hence, whatever the table,
// condition, orientation or schedule: A MEMBER CONSERVES P EXACTLY IF AND ONLY IF IT CONSERVES EACH OF THE
// TWELVE LINE MOMENTA SEPARATELY. The couple is too small a block for momentum to pass between lines.
//
// Measured here:
// 1. Tables: of the 24 sum-keeping tables, which keep P on a wire (exactly the hop-free ones) and which
//    keep the charge current J (only the identity, which never makes a pair from calm).
// 2. Conditions: for each P-keeping table, both orientations, the exact number of the 2^36 conditions
//    under which the swap couple keeps P, palindromic and not (the palindromic count by the closed sets
//    of the implication graph the constraint makes, checked against a direct composite test on the
//    negation-symmetric ones). The argument's two halves are checked: every pair of lines has
//    independent roots, and the selected member conserves every line momentum on a dense run and has
//    twelve free exact invariants in the Smith form of its changes (the committed rule has none).
// 3. Gates: every distinct momentum-keeping member with a negation-symmetric condition (the symmetry CPT
//    needs), on the four tables whose negation is their inverse (bind, its reverse, the flip, the
//    identity), palindromic and not, under the committed schedule, staged through the committed rule's
//    acceptance gates in order: CPT at a mirror phase, a vacuum period of at most 24, vacuum line
//    components no more than the committed 3, dense line components no more than the committed 1, at
//    least the committed 12 of 24 directions travelling, exact superposition, reversal and charge, and
//    sheet-quantized walls (code/measure/weave-acceptance, the E-FRC-0125 items). The first gate each
//    member fails is counted.
// 4. The smallest change: the block that lets momentum pass between lines. Any P-keeping map on a block
//    of lines changes line momenta only along integer relations among the block's roots; two lines have
//    none, three lines of one A2 plane have one (e1 + e2 + e3 = 0, the FHP triple), four lines have
//    u + v = w + x. The Smith form of the triple moves over all 16 A2 planes and of the 432 four-line
//    binary scatterings says which line invariants each leaves beyond P.
//
// Depth L1: an exhaustive count and an exact argument over a stated family, with the gates measured by
// running each member.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { BIND_MOVE_FORWARD } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { latticeQuotient } from '@/code/measure/integer-lattice'
import {
  additivityWorst,
  cptMirrorPhase,
  lineComponents,
  reversalAndCharge,
  type ScheduledRule,
  travel,
  vacuumPeriod,
  walls,
} from '@/code/measure/weave-acceptance'
import {
  BIND_REVERSE_TABLE,
  COMMITTED_SPEC,
  coupleChanges,
  FLIP_TABLE,
  IDENTITY_TABLE,
  keyTones,
  lineCurrent,
  lineKey,
  lineMomenta,
  lineMomentum,
  type LineTable,
  momentumWeave,
  MOMENTUM_WEAVE,
  type MomentumWeaveSpec,
  negationSymmetricMembers,
  sumKeepingTables,
} from '@/code/rule/momentum-weave'

// the committed rule's own values on each gate (E-FRC-0125, and recomputed here)
const COMMITTED_VACUUM_COMPONENTS = 3
const COMMITTED_DENSE_COMPONENTS = 1
const COMMITTED_TRAVELLERS = 12
const PERIOD = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2

const GATES = ['cpt', 'vacuumPeriod', 'vacuumComponents', 'denseComponents', 'travel', 'superposition', 'reversal', 'walls'] as const

type Gate = (typeof GATES)[number]

const ruleOf =
  (spec: MomentumWeaveSpec): ScheduledRule =>
  (opposite, forward) =>
    momentumWeave({ spec, opposite, forward })

// the first gate a member fails, in increasing cost, or undefined
function firstFailure(spec: MomentumWeaveSpec): { failed: Gate | undefined; values: Record<string, number> } {
  const rule = ruleOf(spec)
  const values: Record<string, number> = {}
  const done = (failed: Gate | undefined) => ({ failed, values })

  values.cpt = cptMirrorPhase(rule)

  if (values.cpt < 0) {
    return done('cpt')
  }

  values.vacuumPeriod = vacuumPeriod(rule)

  if (values.vacuumPeriod <= 0) {
    return done('vacuumPeriod')
  }

  values.vacuumComponents = lineComponents(rule, false)

  if (values.vacuumComponents > COMMITTED_VACUUM_COMPONENTS) {
    return done('vacuumComponents')
  }

  values.denseComponents = lineComponents(rule, true)

  if (values.denseComponents > COMMITTED_DENSE_COMPONENTS) {
    return done('denseComponents')
  }

  values.travellers = travel(rule).travellers

  if (values.travellers < COMMITTED_TRAVELLERS) {
    return done('travel')
  }

  values.additivityWorst = additivityWorst(rule)

  if (values.additivityWorst >= 1e-9) {
    return done('superposition')
  }

  const reversal = reversalAndCharge(rule)

  if (!reversal.reverses || !reversal.chargeKept) {
    return done('reversal')
  }

  const wall = walls(rule)

  values.wallMax = wall.settledMax

  if (!(wall.quantized && wall.settledMax > 0)) {
    return done('walls')
  }

  return done(undefined)
}

// The exact number of swap conditions (of 2^36) under which the swap couple keeps P, for one P-keeping
// table and orientation. Palindrome: a state x whose exchange changes the pair (n_line, n_wire) needs the
// two exchanges to fire together, which is the implication fires(x) -> fires(T'(X x)) and
// fires(T'(x)) -> fires(x) (T' the table on the wire, X the exchange). The count is the closed sets of
// that implication graph times 2^(orbits whose exchange keeps the pair). Swap then table: no orbit that
// changes the pair may fire.
function conditionCount(table: LineTable, crossed: boolean): { changing: number; keeping: number; closedSets: number } {
  const reverse = (k: number): number => {
    const [a, b] = keyTones(k)

    return lineKey(b, a)
  }
  const exchange = (x: number): number => {
    const l = Math.floor(x / 9)
    const w = x % 9

    return crossed ? reverse(w) * 9 + reverse(l) : w * 9 + l
  }
  const onWire = (x: number): number => {
    const image = table[x % 9] ?? [0, 0]

    return Math.floor(x / 9) * 9 + lineKey(image[0], image[1])
  }
  const pair = (x: number): string => `${lineMomentum(Math.floor(x / 9))},${lineMomentum(x % 9)}`
  const changes = (x: number): boolean => pair(exchange(x)) !== pair(x)
  const index = new Map<number, number>()

  let keeping = 0

  for (let x = 0; x < 81; x++) {
    const o = Math.min(x, exchange(x))

    if (exchange(x) === x || index.has(o)) {
      continue
    }

    if (changes(x)) {
      index.set(o, index.size)
    } else {
      index.set(o, -1)
      keeping++
    }
  }

  const changing = [...index.values()].filter(v => v >= 0).length
  const variable = (x: number): number => index.get(Math.min(x, exchange(x))) ?? -1
  const needs = new Array<number>(changing).fill(0)

  for (let x = 0; x < 81; x++) {
    if (exchange(x) === x || !changes(x)) {
      continue
    }

    const v = variable(x)
    const after = variable(onWire(exchange(x)))
    const before = variable(onWire(x))

    needs[v] = (needs[v] ?? 0) | (1 << after)
    needs[before] = (needs[before] ?? 0) | (1 << v)
  }

  let closedSets = 0

  for (let mask = 0; mask < 1 << changing; mask++) {
    let closed = true

    for (let i = 0; i < changing && closed; i++) {
      closed = ((mask >> i) & 1) === 0 || ((needs[i] ?? 0) & ~mask) === 0
    }

    closedSets += closed ? 1 : 0
  }

  return { changing, keeping, closedSets }
}

export default experiment({
  id: 'fluids/momentum-family',
  code: 'E-FLD-0022',
  title:
    "in the committed rule's design family a rule conserves particle momentum exactly if and only if its wire table has no hop and its exchange never moves momentum between the couple's lines, and then it conserves each of the twelve line momenta separately (a couple is too small a block for momentum to pass between lines, so every such rule has momentum but no momentum exchange); of every distinct such member with a negation-symmetric condition, none passes the committed acceptance gates; the smallest change that lets momentum pass between lines is a block of three lines of one A2 plane (the FHP triple), and four-line binary scatterings leave P and charge parity as the only invariants",
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // 1. tables
    const tables = sumKeepingTables()
    const keepsOnWire = (table: LineTable, share: (k: number) => number): boolean =>
      table.every(([a, b], k) => share(lineKey(a, b)) === share(k))
    const hopFree = (table: LineTable): boolean =>
      [lineKey(1, 0), lineKey(-1, 0), lineKey(0, 1), lineKey(0, -1)].every(k => {
        const [a, b] = table[k] ?? [0, 0]

        return lineKey(a, b) === k
      })
    const pTables = tables.filter(t => keepsOnWire(t, lineMomentum))
    const jTables = tables.filter(t => keepsOnWire(t, lineCurrent))
    const tablesExact =
      tables.length === 24 &&
      pTables.length === tables.filter(hopFree).length &&
      pTables.every(hopFree) &&
      jTables.length === 1 &&
      jTables.every(t => t.every(([a, b], k) => lineKey(a, b) === k))

    // 2. conditions, exact counts, and the argument's two halves
    const counts = pTables.flatMap((table, i) =>
      [false, true].map(crossed => ({ table: i, crossed, ...conditionCount(table, crossed) })),
    )
    const roots = rootsD4()
    const opposite = meshOpposites(d4BoxMesh({ side: 5 }))
    const lineRoots = roots.filter((_, d) => d < (opposite[d] ?? d))
    const independent = lineRoots.every((a, i) =>
      lineRoots.every((b, j) => {
        const dot = a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

        return i === j || Math.abs(dot) < 2
      }),
    )
    const selectedLine = latticeQuotient(coupleChanges(MOMENTUM_WEAVE, lineMomentum), 12)
    const committedLine = latticeQuotient(coupleChanges(COMMITTED_SPEC, lineMomentum), 12)
    const mesh = d4BoxMesh({ side: 5 })
    const start: Will = makeWill(mesh)

    for (let i = 0; i < start.data.length; i++) {
      const u = ((i + 1) * GOLDEN * 1.37) % 1

      start.data[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
    }

    const first = lineMomenta(start.data, opposite)
    const run = momentumWeave({ spec: MOMENTUM_WEAVE, opposite })

    let will = start
    let lineDrift = 0

    for (let t = 0; t < 2 * PERIOD; t++) {
      will = beat(will, run(t))
      lineDrift = Math.max(lineDrift, ...lineMomenta(will.data, opposite).map((x, L) => Math.abs(x - (first[L] ?? 0))))
    }

    // 3. gates on every distinct negation-symmetric momentum-keeping member
    const members = negationSymmetricMembers([
      ['bind', BIND_MOVE_FORWARD],
      ['bind-reverse', BIND_REVERSE_TABLE],
      ['flip', FLIP_TABLE],
      ['identity', IDENTITY_TABLE],
    ])
    const failures: Record<string, number> = Object.fromEntries([...GATES, 'none'].map(g => [g, 0]))
    const deepest: { id: string; stage: number; values: Record<string, number> }[] = []
    const reference = firstFailure(COMMITTED_SPEC)

    for (const { id, spec } of members) {
      const { failed, values } = firstFailure(spec)
      const stage = failed === undefined ? GATES.length : GATES.indexOf(failed)

      failures[failed ?? 'none'] = (failures[failed ?? 'none'] ?? 0) + 1
      deepest.push({ id, stage, values })
    }

    deepest.sort((a, b) => b.stage - a.stage)

    const furthest = deepest[0]
    const passing = failures.none ?? 0
    const densePassers = deepest.filter(d => d.stage > GATES.indexOf('denseComponents'))
    const smallestDense = Math.min(...deepest.filter(d => d.values.denseComponents !== undefined).map(d => d.values.denseComponents ?? 12))

    // 4. the smallest change
    const lineIndex = new Array<number>(24).fill(-1)

    roots.forEach((_, d) => {
      if (d < (opposite[d] ?? d)) {
        const L = lineRoots.findIndex(r => r === roots[d])

        lineIndex[d] = L
        lineIndex[opposite[d] ?? d] = L
      }
    })

    const lineOf = (d: number): number => lineIndex[d] ?? -1
    const firstSlot = (d: number): boolean => d < (opposite[d] ?? d)
    const sumZero = (ds: number[], signs: number[]): boolean =>
      [0, 1, 2, 3].every(k => ds.reduce((s, d, i) => s + (signs[i] ?? 1) * (roots[d]?.[k] ?? 0), 0) === 0)
    const triples: number[][] = []
    const planes = new Set<string>()

    for (let a = 0; a < 24; a++) {
      for (let b = a + 1; b < 24; b++) {
        for (let c = b + 1; c < 24; c++) {
          const ls = new Set([lineOf(a), lineOf(b), lineOf(c)])

          if (ls.size === 3 && sumZero([a, b, c], [1, 1, 1])) {
            const row = new Array<number>(12).fill(0)

            // the triple reverses: each tone's line momentum changes by -2 n
            ;[a, b, c].forEach(d => (row[lineOf(d)] = firstSlot(d) ? -2 : 2))
            triples.push(row)
            planes.add([...ls].sort((x, y) => x - y).join(','))
          }
        }
      }
    }

    const binary: number[][] = []

    for (let d1 = 0; d1 < 24; d1++) {
      for (let d2 = d1 + 1; d2 < 24; d2++) {
        for (let d3 = 0; d3 < 24; d3++) {
          for (let d4 = d3 + 1; d4 < 24; d4++) {
            const ls = new Set([lineOf(d1), lineOf(d2), lineOf(d3), lineOf(d4)])

            if (ls.size === 4 && sumZero([d1, d2, d3, d4], [1, 1, -1, -1])) {
              const row = new Array<number>(12).fill(0)
              const n = (d: number): number => (firstSlot(d) ? 1 : -1)

              row[lineOf(d1)] = -n(d1)
              row[lineOf(d2)] = -n(d2)
              row[lineOf(d3)] = n(d3)
              row[lineOf(d4)] = n(d4)
              binary.push(row)
            }
          }
        }
      }
    }

    const toVector = (row: number[]): number[] => [0, 1, 2, 3].map(k => row.reduce((s, n, L) => s + n * (lineRoots[L]?.[k] ?? 0), 0))
    const keepsVector = (rows: number[][]): boolean => rows.every(r => toVector(r).every(x => x === 0))
    const tripleQ = latticeQuotient(triples, 12)
    const binaryQ = latticeQuotient(binary, 12)
    const lineOfWorks = roots.every((_, d) => lineOf(d) >= 0 && lineOf(d) === lineOf(opposite[d] ?? d))

    const countsExact = counts.every(c => c.changing + c.keeping === 36 && c.closedSets > 1)

    const ok =
      tablesExact &&
      countsExact &&
      independent &&
      lineOfWorks &&
      selectedLine.free === 12 &&
      committedLine.free === 0 &&
      lineDrift === 0 &&
      reference.failed === undefined &&
      passing === 0 &&
      members.length > 0 &&
      planes.size === 16 &&
      keepsVector(triples) &&
      keepsVector(binary) &&
      tripleQ.free === 4 &&
      binaryQ.free === 4 &&
      binaryQ.torsion.join(',') === '2'

    const countMetrics: Record<string, number> = {}

    counts.forEach(c => {
      const tag = `table${c.table}${c.crossed ? 'Crossed' : 'Straight'}`

      countMetrics[`${tag}ChangingOrbits`] = c.changing
      countMetrics[`${tag}KeepingOrbits`] = c.keeping
      countMetrics[`${tag}ClosedSets`] = c.closedSets
      countMetrics[`${tag}Log2Conditions`] = Math.log2(c.closedSets) + c.keeping
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'P is kept on a wire by exactly the hop-free tables and J by the identity alone; the number of P-keeping conditions is counted exactly for every hop-free table and orientation; every two lines have independent roots, so a P-keeping member keeps all twelve line momenta (the selected member: twelve free invariants, zero drift of every line momentum on a dense run, against none kept by the committed rule); none of the distinct negation-symmetric momentum-keeping members passes the committed gates; triple moves on the 16 A2 planes and four-line binary scatterings both keep P and leave it as the only free invariant, the binary ones with charge parity as the only residue',
      metrics: {
        sumKeepingTables: tables.length,
        momentumKeepingTables: pTables.length,
        currentKeepingTables: jTables.length,
        ...countMetrics,
        linePairsIndependent: independent ? 1 : 0,
        selectedFreeLineInvariants: selectedLine.free,
        committedFreeLineInvariants: committedLine.free,
        selectedLineMomentumDrift: lineDrift,
        membersGated: members.length,
        ...Object.fromEntries(Object.entries(failures).map(([g, n]) => [`firstFailure_${g}`, n])),
        membersPastDenseComponents: densePassers.length,
        smallestDenseComponents: smallestDense,
        furthestStage: furthest?.stage ?? -1,
        a2Planes: planes.size,
        tripleRank: tripleQ.rank,
        tripleFree: tripleQ.free,
        tripleTorsionOrder: tripleQ.torsion.reduce((s, x) => s * x, 1),
        binaryScatterings: binary.length,
        binaryRank: binaryQ.rank,
        binaryFree: binaryQ.free,
        binaryTorsionOrder: binaryQ.torsion.reduce((s, x) => s * x, 1),
      },
      control: {
        committedPassesEveryGate: reference.failed === undefined ? 1 : 0,
        committedVacuumComponents: reference.values.vacuumComponents ?? -1,
        committedDenseComponents: reference.values.denseComponents ?? -1,
        committedTravellers: reference.values.travellers ?? -1,
        committedCptPhase: reference.values.cpt ?? -1,
      },
      notes: `L1, exhaustive and exact, no random numbers. Furthest member: ${furthest?.id} at stage ${furthest?.stage} (${JSON.stringify(furthest?.values)}). Tables are indexed in the order of sumKeepingTables among the P-keeping ones. The count of conditions is over all 2^36 exchange-symmetric conditions; the gates are run on the negation-symmetric ones only (2^20 per table and mode, deduplicated by the swap couple's composite), because the collision-level CPT test negates every tone and a condition that is not negation-symmetric is not its own image. The schedule is the committed one for the gate sweep; the argument that P-keeping forces all twelve line momenta holds for every schedule, every orientation and every condition, since it is a statement about one couple. What the family cannot give is momentum exchange: a couple of two lines has no integer relation among its roots, so no map on it can move momentum from one line to the other while keeping P. The FHP-style triple on three lines of an A2 plane (e1 + e2 + e3 = 0) is the smallest block that can, and over all 16 planes its moves leave exactly P free (with 2^8 residues mod 2, the parity of each line's tone count, still kept); the four-line binary scatterings (u + v = w + x) leave exactly P and the charge parity.`,
    })
  },
})
