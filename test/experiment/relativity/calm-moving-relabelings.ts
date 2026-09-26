// Can a relabeling of the vibes that moves calm give a knit the symmetry it lacks? E-RLT-0049 searched the
// period groups of the couple architecture with two tone maps, the identity and charge conjugation, the
// two that keep calm. This asks what the other maps can add, glide or reversal (the CPT reversal included).
//
// 1. THE UNIFORM MAPS, a theorem checked by enumeration. If (p, tau) is a glide or a reversal of a knit,
//    every beat keeps charge Q and also Q o tau, since a reversal carries a beat to the inverse of another
//    and inverses keep what beats keep. For each of the four uniform relabelings that move calm, Q and
//    Q o tau and the slot count 24 are three independent linear forms in the counts of fear, calm and love,
//    so every beat keeps all three counts: calm can never make a pair, and the vacuum never clocks. The
//    enumeration: the rank of those three forms, for every relabeling.
// 2. THE PER-SIDE MAPS, which that argument does not close: a map tau_1 on first slots and tau_2 on second
//    slots, 36 of them. The bind table commutes with one pair that moves calm, (a, b) -> (a + 1, b - 1) mod 3
//    (it carries the pair clock to itself one step on), so the wire alone does not forbid them. Counted:
//    which of the 36 pairs commute with, or invert, each 9-state table the architecture uses (pair, bind,
//    bind reversed), exactly.
// 3. THE KNITS. The full ledger extended to all 36 per-side maps (1152 coin maps, every shift and mirror
//    phase, on lone, dense and move-firing states) on the committed turning weave, the color turn weave,
//    the head-on turn weave, the scatter knit (E-RLT-0050), the orbit knit (E-RLT-0048, irreducible glide
//    group, no CPT) and the quaternion knit (E-RLT-0051): every entry whose map moves calm, and whether the
//    period group grows.
//
// Gates: all four calm-moving uniform maps give rank 3 (every count kept, no clock); on every knit no ledger
// entry has a calm-moving map, so no knit's period group grows and the orbit knit gains no reversal; the
// per-side census finds the bind table's calm-moving commutants (so the closure comes from the swaps and the
// scatterings, not from the wire).
//
// Depth L2: a theorem with its enumeration, and exact ledgers of six constructed knits.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { permutationOrder, weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { linearMapOf } from '@/code/substrate/d4-box'
import { BIND_MOVE_FORWARD, type Collision, PAIR_FORWARD, turningWeave } from '@/code/rule/collision'
import { colorTurnWeave } from '@/code/rule/color-turn-weave'
import { colorLocalCollision, HOP_FREE_TABLES, type WireTable } from '@/code/rule/color-local-weave'
import { HEAD_TURN_SPEC, scatterCollision, scatterSchedule } from '@/code/rule/scatter-weave'
import { quaternionKnit } from '@/code/rule/quaternion-knit'
import { denseCellStates, loneCellStates, moveFiringStates, TONE_RELABELLINGS } from '@/code/measure/rule-symmetry-ledger'
import { beatStabilizerCensus, conjugacyClasses, irreducibleGlideCandidates, matrixGroupClosure, type Matrix4 } from '@/code/measure/glide-group'
import { forcedIsotropySpread, unitSamples } from '@/code/measure/coarse-modes'
import { bestBeatPair, orbitBeatFor, orbitKnit, orbitKnitPeriod } from '@/code/rule/orbit-knit'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'

const GENERIC = [0.31, -0.74, 0.52, 0.29]

type Knit = { name: string; forward: (t: number) => Collision; inverse: (t: number) => Collision; period: number; extra: Int8Array[] }
type Entry = { p: number; t1: number; t2: number; phase: number; kind: 'forward' | 'reversal' }

// every per-side relabeling pair, as indices into TONE_RELABELLINGS
const PAIRS: [number, number][] = TONE_RELABELLINGS.flatMap((_, a) => TONE_RELABELLINGS.map((__, b) => [a, b] as [number, number]))
const movesCalm = (t: number): boolean => (TONE_RELABELLINGS[t]?.[1] ?? 0) !== 0

// the ledger of code/measure/rule-symmetry-ledger with a tone map per side: the tone in slot d lands in slot
// p[d] relabelled by the map of d's side
function sideLedger(knit: Knit, permutations: readonly (readonly number[])[], side: readonly number[]): Entry[] {
  const quick = [...loneCellStates(24), ...knit.extra, ...denseCellStates({ count: 32, offset: 0, degree: 24 })]
  const thorough = denseCellStates({ count: 512, offset: 5000, degree: 24 })
  const forward = Array.from({ length: knit.period }, (_, t) => knit.forward(t))
  const inverse = Array.from({ length: knit.period }, (_, t) => knit.inverse(t))
  const a = new Int8Array(24)
  const b = new Int8Array(24)
  const carry = (out: Int8Array, state: Int8Array, p: readonly number[], t1: readonly number[], t2: readonly number[]): void => {
    for (let d = 0; d < 24; d++) {
      const tau = (side[d] ?? 1) > 0 ? t1 : t2

      out[p[d] ?? 0] = tau[(state[d] ?? 0) + 1] ?? 0
    }
  }
  const holds = (p: readonly number[], t1: readonly number[], t2: readonly number[], phase: number, kind: 'forward' | 'reversal', states: readonly Int8Array[]): boolean => {
    for (const state of states) {
      for (let t = 0; t < knit.period; t++) {
        b.set(state)
        forward[t]?.(b, 0, 24)
        carry(a, b, p, t1, t2)
        carry(b, state, p, t1, t2)

        const target = kind === 'forward' ? forward[(t + phase) % knit.period] : inverse[(((phase - t) % knit.period) + knit.period) % knit.period]

        target?.(b, 0, 24)

        for (let d = 0; d < 24; d++) {
          if (a[d] !== b[d]) return false
        }
      }
    }

    return true
  }
  const found: Entry[] = []

  permutations.forEach((p, pi) => {
    for (const [x, y] of PAIRS) {
      const t1 = TONE_RELABELLINGS[x] ?? []
      const t2 = TONE_RELABELLINGS[y] ?? []

      for (const kind of ['forward', 'reversal'] as const) {
        for (let phase = 0; phase < knit.period; phase++) {
          if (holds(p, t1, t2, phase, kind, quick) && holds(p, t1, t2, phase, kind, thorough)) found.push({ p: pi, t1: x, t2: y, phase, kind })
        }
      }
    }
  })

  return found
}

// the 9-state table conjugated by a per-side pair: (t1 x t2) T (t1 x t2)^-1
function conjugateTable(table: WireTable, t1: readonly number[], t2: readonly number[]): string {
  const inv = (t: readonly number[]): number[] => [-1, 0, 1].map(v => t.indexOf(v) - 1)
  const i1 = inv(t1)
  const i2 = inv(t2)

  return [-1, 0, 1]
    .flatMap(a =>
      [-1, 0, 1].map(bb => {
        const [x, y] = table[((i1[a + 1] ?? 0) + 1) * 3 + ((i2[bb + 1] ?? 0) + 1)] ?? [0, 0]

        return `${t1[x + 1]},${t2[y + 1]}`
      }),
    )
    .join(' ')
}

const tableKey = (table: WireTable): string => table.map(([x, y]) => `${x},${y}`).join(' ')

function invert(table: WireTable): WireTable {
  const out = new Array<[number, number]>(9)

  table.forEach(([x, y], k) => (out[(x + 1) * 3 + (y + 1)] = [Math.floor(k / 3) - 1, (k % 3) - 1]))

  return out
}

export default experiment({
  id: 'relativity/calm-moving-relabelings',
  code: 'E-RLT-0052',
  title: 'relabelings that move calm give no knit a symmetry: a uniform one would make every beat keep the counts of fear, calm and love separately (rank 3 for all four), so calm could never make a pair; per-side ones (a map on first slots, another on second) do commute with the bind table (the Z3 shift (a, b) -> (a + 1, b - 1) and its square, 2 of the 36 pairs, which carry the pair clock one step on; the pair table admits none), but on the committed, color turn, head-on turn, scatter, orbit and quaternion knits the full ledger over 1152 coin maps, 36 pairs and every phase finds no entry with a calm-moving map, so the period groups do not grow (orders 1, 1, 2, 2, 24 and 8) and the orbit knit (period 16) gains no reversal',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const opposite = meshOpposites(d4Mesh({ side: 5 }))
    const side = roots.map((_, d) => (d < (opposite[d] ?? d) ? 1 : -1))
    const permutations = weylF4DirectionPermutations({ directions: roots })
    const matrices: Matrix4[] = permutations.map(p => linearMapOf(p) ?? [])
    const spread = (group: readonly Matrix4[]): number => forcedIsotropySpread({ group, rank: 2, generic: GENERIC, samples: unitSamples(64) })

    // 1. the uniform maps: rank of (1, Q, Q o tau) on the counts (fear, calm, love)
    const uniform = TONE_RELABELLINGS.map((tau, t) => {
      const rows = [
        [1, 1, 1],
        [-1, 0, 1],
        [tau[0] ?? 0, tau[1] ?? 0, tau[2] ?? 0],
      ]
      const det =
        (rows[0]?.[0] ?? 0) * ((rows[1]?.[1] ?? 0) * (rows[2]?.[2] ?? 0) - (rows[1]?.[2] ?? 0) * (rows[2]?.[1] ?? 0)) -
        (rows[0]?.[1] ?? 0) * ((rows[1]?.[0] ?? 0) * (rows[2]?.[2] ?? 0) - (rows[1]?.[2] ?? 0) * (rows[2]?.[0] ?? 0)) +
        (rows[0]?.[2] ?? 0) * ((rows[1]?.[0] ?? 0) * (rows[2]?.[1] ?? 0) - (rows[1]?.[1] ?? 0) * (rows[2]?.[0] ?? 0))

      return { t, movesCalm: movesCalm(t), rank3: det !== 0 }
    })
    const uniformClosed = uniform.every(u => u.movesCalm === u.rank3)

    // 2. the per-side census on the wire tables
    const tables: [string, WireTable][] = [
      ['pair', PAIR_FORWARD],
      ['bind', BIND_MOVE_FORWARD],
      ['bindReverse', HOP_FREE_TABLES['bind-reverse'] ?? BIND_MOVE_FORWARD],
    ]
    const census = tables.map(([name, table]) => {
      const self = tableKey(table)
      const back = tableKey(invert(table))
      const commuting = PAIRS.filter(([x, y]) => conjugateTable(table, TONE_RELABELLINGS[x] ?? [], TONE_RELABELLINGS[y] ?? []) === self)
      const inverting = PAIRS.filter(([x, y]) => conjugateTable(table, TONE_RELABELLINGS[x] ?? [], TONE_RELABELLINGS[y] ?? []) === back)

      return {
        name,
        commuting: commuting.length,
        commutingCalmMoving: commuting.filter(([x, y]) => movesCalm(x) || movesCalm(y)).length,
        inverting: inverting.length,
        invertingCalmMoving: inverting.filter(([x, y]) => movesCalm(x) || movesCalm(y)).length,
      }
    })
    const bindAdmits = (census.find(c => c.name === 'bind')?.commutingCalmMoving ?? 0) > 0

    // 3. the knits
    const sets = scatterSchedule('pair')
    const allMoves = sets.flat()
    const traceOf = (p: readonly number[]): number => {
      const m = linearMapOf(p) ?? []

      return [0, 1, 2, 3].reduce((s, i) => s + (m[i]?.[i] ?? 0), 0)
    }
    const orderOf = (p: readonly number[]): number => permutationOrder({ permutation: p })
    const { classOf } = conjugacyClasses(permutations)
    const admissible = new Set(
      beatStabilizerCensus({ permutations, opposite, relaxation: 'orbit', traceOf, orderOf })
        .filter(r => r.invariantBeats > 0 && r.eta === 1)
        .map(r => r.classIndex),
    )
    const first = irreducibleGlideCandidates({ matrices, permutations, admissible: i => admissible.has(classOf[i] ?? -1), forcedSpread: spread, maxOrder: 96 })[0]
    const k = permutations[first?.k ?? 0] ?? []
    const g = permutations[first?.g ?? 0] ?? []
    const pair = bestBeatPair({ beats: orbitBeatFor({ k, glide: g, opposite, limit: 1_000_000, components: 12 }), glide: g, opposite, powers: 8 })
    const probe = [...loneCellStates(24), ...denseCellStates({ count: 64, offset: 0, degree: 24 })]
    const powers = pair ? Math.max(orbitKnitPeriod({ beat: pair.first, glide: g, opposite, states: probe }), orbitKnitPeriod({ beat: pair.second, glide: g, opposite, states: probe })) : 1
    const orbitBeats = pair ? [pair.first, pair.second] : []
    const headOnExtra = Array.from({ length: 64 }, (_, n) =>
      Int8Array.from({ length: 24 }, (__, d) => {
        const l = d < (opposite[d] ?? d) ? d : (opposite[d] ?? d)

        return (((n * 7 + l * 5 + ((n * l) % 7)) % 3) - 1) as number
      }),
    )
    const knits: Knit[] = [
      { name: 'committed', forward: turningWeave({ opposite }), inverse: turningWeave({ opposite, forward: false }), period: 24, extra: [] },
      { name: 'colorTurn', forward: colorTurnWeave({ opposite }), inverse: colorTurnWeave({ opposite, forward: false }), period: 24, extra: [] },
      { name: 'headOnTurn', forward: colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite }), inverse: colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite, forward: false }), period: 24, extra: headOnExtra },
      {
        name: 'scatter',
        forward: scatterCollision({ spec: { base: HEAD_TURN_SPEC, mirror: 23, sets }, opposite }),
        inverse: scatterCollision({ spec: { base: HEAD_TURN_SPEC, mirror: 23, sets }, opposite, forward: false }),
        period: 24,
        extra: [...headOnExtra, ...moveFiringStates({ moves: allMoves, degree: 24 })],
      },
      {
        name: 'orbit',
        forward: orbitKnit({ beat: orbitBeats, glide: g, period: 2 * powers, opposite }),
        inverse: orbitKnit({ beat: orbitBeats, glide: g, period: 2 * powers, opposite, forward: false }),
        period: 2 * powers,
        extra: [],
      },
      { name: 'quaternion', forward: quaternionKnit({ opposite }), inverse: quaternionKnit({ opposite, forward: false }), period: 1, extra: headOnExtra },
    ]
    const rows = knits.map(knit => {
      const ledger = sideLedger(knit, permutations, side)
      const calm = ledger.filter(e => movesCalm(e.t1) || movesCalm(e.t2))
      const plain = ledger.filter(e => !(movesCalm(e.t1) || movesCalm(e.t2)))
      const groupAll = matrixGroupClosure(ledger.map(e => matrices[e.p] ?? []))
      const groupPlain = matrixGroupClosure(plain.map(e => matrices[e.p] ?? []))

      return {
        name: knit.name,
        entries: ledger.length,
        calmMoving: calm.length,
        reversals: ledger.filter(e => e.kind === 'reversal').length,
        groupOrder: groupAll.length,
        groupOrderWithoutCalmMoving: groupPlain.length,
        spread: spread(groupAll),
      }
    })
    const noneMoveCalm = rows.every(r => r.calmMoving === 0 && r.groupOrder === r.groupOrderWithoutCalmMoving)
    const orbitRow = rows.find(r => r.name === 'orbit')

    const ok = uniformClosed && bindAdmits && noneMoveCalm && (orbitRow?.reversals ?? 1) === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the four calm-moving uniform relabelings each make charge, its relabelled twin and the slot count independent, so a symmetry with one would freeze every tone count; the bind table admits calm-moving per-side commutants; and no knit of six (committed, color turn, head-on turn, scatter, orbit, quaternion) has a ledger entry with a calm-moving map among 36 per-side pairs, so no period group grows and the orbit knit gains no reversal',
      metrics: {
        uniformCalmMovingMaps: uniform.filter(u => u.movesCalm).length,
        uniformCalmMovingRank3: uniform.filter(u => u.movesCalm && u.rank3).length,
        ...Object.fromEntries(
          census.flatMap(c => [
            [`${c.name}Commuting`, c.commuting],
            [`${c.name}CommutingCalmMoving`, c.commutingCalmMoving],
            [`${c.name}Inverting`, c.inverting],
            [`${c.name}InvertingCalmMoving`, c.invertingCalmMoving],
          ]),
        ),
        ...Object.fromEntries(
          rows.flatMap(r => [
            [`${r.name}Entries`, r.entries],
            [`${r.name}CalmMovingEntries`, r.calmMoving],
            [`${r.name}Reversals`, r.reversals],
            [`${r.name}PeriodGroupOrder`, r.groupOrder],
            [`${r.name}ForcedSpread`, Number(r.spread.toExponential(2))],
          ]),
        ),
        orbitPeriod: 2 * powers,
      },
      notes:
        'L2. The uniform argument covers glides and reversals alike: tau p C_t (tau p)^-1 is a beat or a beat inverse, both keep Q, so C_t keeps Q o tau. With calm moved, Q o tau is not in the span of Q and the slot count, so the three counts are fixed at every dock, and the calm dock maps to itself: no vacuum clock, whatever the coin part. The per-side maps escape that argument, since their conserved twin can differ from Q by a multiple of a line-local count the tables keep; the census shows the bind table commutes with the Z3 shift (a, b) -> (a + 1, b - 1) and its square, which move calm and carry the pair clock one step on. Every knit closes them off elsewhere: a swap or scattering condition reads calm (a calm line, calm opposite slots), which the shift turns into a pair, and the pair table\'s hop does not commute with it. The ledger is tested on lone, dense, head-on and move-firing states, as E-RLT-0050 requires. Per-slot maps that differ within a side are not searched.',
    })
  },
})
