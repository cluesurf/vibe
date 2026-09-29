// Records of a knot in the coset-union vacuum (E-QTM-0155, E-QTM-0156). MEASUREMENT code: the rule is the bounce knit
// (code/rule/bounce-pair-knit) on the default dock-varying vacuum (code/measure/dense-hub, E-RLT-0093), run unedited;
// the quantum layer is the adopted comoving fear beat (code/rule/fear-weave advanceWhole) on the tokens held open.
//
// THE KNOT is a lone love streamed into the vacuum: one vibe on slot `direction` of the anchor dock, at role point 0.
// Its ENVIRONMENT is every vacuum token it meets within the window, found from a run with every token open; the run
// that is measured opens the knot and those tokens only, so the environment's other meetings (with tokens the knot
// never touches) stay classical, the model's own convention for a closed token.
//
// The whole's weights are exact integers. The readings (entropies, mutual informations) are reals: measurement.
//
// NOTHING MOVES: the stream copies each slot's vibe and token one dock along; a crossing is the link's grid move.

import {
  makeColorWeave,
  type ColorWeave,
} from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import {
  bounceBeat,
  makeBounceKnit,
} from '@/code/rule/bounce-pair-knit'
import {
  advanceWhole,
  GRID_OF_PHASE,
  phasePermOf,
  physicalWhole,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import { exactFearKernels } from '@/code/rule/fear-kernel-exact'
import { sparseLivingState } from '@/code/measure/sparse-living-vacuum'
import { baseHub, storeOfKind } from '@/code/measure/dense-hub'
import { boxHusk } from '@/code/measure/causal-components'
import { GRID_LINES, classWeights } from '@/code/measure/pointer-basis'
import { permuteTwo } from '@/code/measure/sum-record'

export type VacuumSchedule = {
  readonly weave: ColorWeave
  readonly knot: number
  // the environment tokens, in the order of their first meeting with the knot
  readonly partners: readonly number[]
  // each partner's husk column where it first met the knot, and the partner's role point (phase index) at beat 0
  readonly partnerColumn: readonly number[]
  readonly partnerPoint: readonly number[]
  readonly partnerSign: readonly number[]
  // the records of the run with the knot and its partners open
  readonly records: readonly BeatRecord[]
  // the knot's meetings, beat by beat
  readonly knotMeetings: readonly number[]
  // the knot's accumulated grid move (phase permutation) after each beat
  readonly knotMove: readonly (readonly number[])[]
}

const IDENTITY9 = Array.from({ length: 9 }, (_, p) => p)

// The schedule of a lone love on `direction` of the anchor dock, over `beats`, under the link start current now.
export function vacuumSchedule(
  side: number,
  direction: number,
  beats: number,
): VacuumSchedule {
  const weave = makeColorWeave({ side, table: 'bind' })
  const store = storeOfKind('union', side, baseHub(side, 0))
  const layout = separatedLayout(weave)
  const knit = makeBounceKnit(weave, 'alternate', true, 'lone')
  const slots = weave.mesh.cellCount * 24
  const husk = boxHusk(weave.mesh, side)
  const vibe = new Int8Array(slots)
  const point = new Int8Array(slots)

  vibe[direction] = 1

  const start = sparseLivingState({ vibe, point, store, layout })
  const knot = direction
  const partners: number[] = []
  const partnerColumn: number[] = []
  const partnerSign: number[] = []
  const all = new Uint8Array(start.point.length).fill(1)

  let state = start

  for (let t = 0; t < beats; t++) {
    const docks = new Int32Array(start.point.length).fill(-1)

    for (let s = 0; s < slots; s++) {
      if (state.vibe[s] !== 0) {
        docks[state.token[s]!] = Math.floor(s / 24)
      }
    }

    const r = bounceBeat(knit, state, all, t)

    r.record.meetings.forEach(([a, b], m) => {
      if (a !== knot && b !== knot) {
        return
      }

      const other = a === knot ? b : a

      if (partners.includes(other)) {
        return
      }

      partners.push(other)
      partnerColumn.push(husk.column[docks[knot]!]!)
      partnerSign.push(
        (r.record.signs?.[m] ?? [1, 1])[a === knot ? 1 : 0],
      )
    })
    state = r.state
  }

  const open = new Uint8Array(start.point.length)

  open[knot] = 1

  for (const p of partners) {
    open[p] = 1
  }

  const records: BeatRecord[] = []
  const knotMeetings: number[] = []
  const knotMove: number[][] = []

  let move = IDENTITY9

  state = start

  for (let t = 0; t < beats; t++) {
    const r = bounceBeat(knit, state, open, t)

    state = r.state
    records.push(r.record)
    knotMeetings.push(
      r.record.meetings.filter(([a, b]) => a === knot || b === knot)
        .length,
    )

    for (const [tk, g] of r.record.crossings) {
      if (tk !== knot) {
        continue
      }

      const perm = phasePermOf(weave.moves.act[g]!)

      move = move.map(p => perm[p]!)
    }

    knotMove.push(move)
  }

  return {
    weave,
    knot,
    partners,
    partnerColumn,
    partnerPoint: partners.map(p => GRID_OF_PHASE[start.point[p]!]!),
    partnerSign,
    records,
    knotMeetings,
    knotMove,
  }
}

let KERNELS: FearKernels | undefined

// the fear beat's exact kernels, the knit's convention (a like meeting does not exchange the tokens)
export const knitKernels = (): FearKernels =>
  (KERNELS ??= exactFearKernels({
    like: 1,
    unlike: 1,
    likeExchanged: false,
  }))

// the starting whole: the knot opened on `knotPoints`, each partner on its own weights, own points at the classical
// points (the knot's at 0)
export function startWhole(
  s: VacuumSchedule,
  knotPoints: readonly number[],
  partner: (j: number) => readonly bigint[],
): Whole {
  let weight: bigint[] = Array.from({ length: 9 }, (_, p) =>
    knotPoints.includes(p) ? 1n : 0n,
  )

  s.partners.forEach((_, j) => {
    const w = partner(j)

    weight = weight.flatMap(x => w.map(y => x * y))
  })

  return {
    tokens: [s.knot, ...s.partners],
    weight,
    own: [0, ...s.partnerPoint],
  }
}

// advance a whole through the schedule's beats [from, to), with an optional step applied after each beat
export function runWhole(
  s: VacuumSchedule,
  whole: Whole,
  from: number,
  to: number,
  after?: (w: Whole, t: number) => Whole,
): Whole {
  let w = whole

  for (let t = from; t < to; t++) {
    w = advanceWhole({
      weave: s.weave,
      whole: w,
      record: s.records[t]!,
      kernel4: [],
      fixed: false,
      forward: true,
      color: knitKernels(),
    })!

    if (after) {
      w = after(w, t)
    }
  }

  return w
}

// The knot's accumulated move before beat t's crossings (the identity before beat 0)
export const moveBefore = (
  s: VacuumSchedule,
  t: number,
): readonly number[] => (t === 0 ? IDENTITY9 : s.knotMove[t - 1]!)

// A STAND-IN beat: every meeting of the knot replaced by a two-token Clifford (given as an 81-point permutation, the
// knot its first coordinate), every other meeting and every crossing the model's own. Frames are kept.
export function standInBeat(
  s: VacuumSchedule,
  whole: Whole,
  t: number,
  perm: (t: number) => ArrayLike<number>,
): Whole {
  const record = s.records[t]!
  const signs = record.signs ?? []
  const others = record.meetings
    .map((m, i) => ({ m, sign: signs[i] ?? ([1, 1] as const) }))
    .filter(({ m }) => m[0] !== s.knot && m[1] !== s.knot)

  let w = advanceWhole({
    weave: s.weave,
    whole,
    record: {
      meetings: others.map(o => o.m),
      signs: others.map(o => o.sign),
      crossings: [],
    },
    kernel4: [],
    fixed: false,
    forward: true,
    color: knitKernels(),
  })!

  for (const [a, b] of record.meetings) {
    if (a !== s.knot && b !== s.knot) {
      continue
    }

    const partner = a === s.knot ? b : a
    const moved = permuteTwo(w, 0, w.tokens.indexOf(partner), perm(t))

    w = {
      ...moved,
      ...(w.frame ? { frame: w.frame } : {}),
      ...(w.trail ? { trail: w.trail } : {}),
    }
  }

  return advanceWhole({
    weave: s.weave,
    whole: w,
    record: { meetings: [], signs: [], crossings: record.crossings },
    kernel4: [],
    fixed: false,
    forward: true,
    color: knitKernels(),
  })!
}

// The ideal record of the knot's class `cls` (dock frame): the knot's weights on each line of the class replaced by
// the line's sum on every point of it (full dephasing in that basis, what a SUM into a fresh ancilla leaves once the
// ancilla is traced). Exact: the units are multiplied by 3. Acts on the stored coordinate, which for a love is the
// physical one.
export function recordKnot(whole: Whole, cls: number): Whole {
  const k = whole.tokens.length
  const stride = 9 ** (k - 1)
  const lines = GRID_LINES.filter(l => l.cls === cls)
  const lineOf = Array.from(
    { length: 9 },
    (_, p) => lines.find(l => l.points.includes(p))!,
  )
  const out = new Array<bigint>(whole.weight.length).fill(0n)

  for (let rest = 0; rest < stride; rest++) {
    for (let x = 0; x < 9; x++) {
      const line = lineOf[x]!

      let sum = 0n

      for (const y of line.points) {
        sum += whole.weight[y * stride + rest]!
      }

      out[x * stride + rest] = sum
    }
  }

  return { ...whole, weight: out }
}

// the joint weights of coordinates a and b (a first), 81 of them, in the physical frame
export function marginalPair(
  whole: Whole,
  a: number,
  b: number,
): bigint[] {
  const w = physicalWhole(whole)
  const k = w.tokens.length
  const sa = 9 ** (k - 1 - a)
  const sb = 9 ** (k - 1 - b)
  const out = new Array<bigint>(81).fill(0n)

  w.weight.forEach((v, i) => {
    if (v !== 0n) {
      const j = 9 * (Math.floor(i / sa) % 9) + (Math.floor(i / sb) % 9)

      out[j] = out[j]! + v
    }
  })

  return out
}

// the joint weights of coordinate 0 (the knot) with every other coordinate, in one pass, in the physical frame
export function knotPairs(whole: Whole): bigint[][] {
  const w = physicalWhole(whole)
  const k = w.tokens.length
  const out = Array.from({ length: k - 1 }, () =>
    new Array<bigint>(81).fill(0n),
  )
  const s0 = 9 ** (k - 1)

  w.weight.forEach((v, i) => {
    if (v === 0n) {
      return
    }

    const x = Math.floor(i / s0)

    for (let j = 1; j < k; j++) {
      const y = Math.floor(i / 9 ** (k - 1 - j)) % 9
      const row = out[j - 1]!

      row[9 * x + y] = row[9 * x + y]! + v
    }
  })

  return out
}

// one coordinate's 9 weights in the physical frame
export function marginalSingle(whole: Whole, c: number): bigint[] {
  const w = physicalWhole(whole)
  const k = w.tokens.length
  const s = 9 ** (k - 1 - c)
  const out = new Array<bigint>(9).fill(0n)

  w.weight.forEach((v, i) => {
    if (v !== 0n) {
      out[Math.floor(i / s) % 9] = out[Math.floor(i / s) % 9]! + v
    }
  })

  return out
}

// the class of a line (as a point set) after a phase permutation
export function movedClass(
  move: readonly number[],
  cls: number,
): number {
  const line = GRID_LINES.find(l => l.cls === cls)!.points
  const image = line.map(p => move[p]!)

  return (
    GRID_LINES.find(l => image.every(p => l.points.includes(p))) ??
    GRID_LINES[0]!
  ).cls
}

// the 3 x 3 joint net counts of the knot's lines of class `knotClass` against a partner's lines of class `envClass`
export function jointTable(
  pair: readonly bigint[],
  knotClass: number,
  envClass: number,
): bigint[] {
  const kl = GRID_LINES.filter(l => l.cls === knotClass)
  const el = GRID_LINES.filter(l => l.cls === envClass)

  return kl.flatMap(a =>
    el.map(b =>
      a.points.reduce(
        (s, x) =>
          s + b.points.reduce((t, y) => t + pair[9 * x + y]!, 0n),
        0n,
      ),
    ),
  )
}

const xlogx = (p: number): number => (p > 0 ? p * Math.log(p) : 0)

// entropy of the knot's class distribution and mutual information of a 3 x 3 table, in nats (MEASUREMENT), with
// whether any entry is negative (then no probability, and the mutual information is not reported)
export function tableInformation(table: readonly bigint[]): {
  negative: boolean
  hKnot: number
  info: number
} {
  const u = table.reduce((s, x) => s + x, 0n)
  const p = table.map(x => Number(x) / Number(u))
  const row = [0, 1, 2].map(
    i => (p[3 * i] ?? 0) + (p[3 * i + 1] ?? 0) + (p[3 * i + 2] ?? 0),
  )
  const col = [0, 1, 2].map(
    j => (p[j] ?? 0) + (p[3 + j] ?? 0) + (p[6 + j] ?? 0),
  )
  const hKnot = -row.reduce((s, x) => s + xlogx(x), 0)
  const hEnv = -col.reduce((s, x) => s + xlogx(x), 0)
  const hJoint = -p.reduce((s, x) => s + xlogx(x), 0)

  return {
    negative: table.some(x => x < 0n),
    hKnot,
    info: hKnot + hEnv - hJoint,
  }
}

// the knot's class distribution (3 net counts) for a class, and the retained weight on one line, exactly
export const knotClass = (
  m: readonly bigint[],
  cls: number,
): bigint[] => classWeights(m, cls)
