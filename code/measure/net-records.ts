// Net records: the Bell fork's candidate resolution (c), read on the model's own measurement (E-QTM-0142 to
// E-QTM-0144).
//
// (c): an outcome is a LINE of the grid (E-QTM-0130), and a record reads the NET count, loves minus fears, of
// the signed weight that lands on its outcome line. The pieces here are shared by the three experiments:
//
// - RECORD, recordLabel: the record's label for a system point, for each of the 12 settings (a line of a
//   love-fear apparatus, E-QTM-0138), written by R's formula (code/measure/in-model-apparatus memberRecord)
// - inModelSettings: the lines usable as settings at each beat, from the apparatus's own histories in the
//   knit, exactly as E-QTM-0138 builds them; computed once per process (memo), since it is the one heavy step
// - situIndependence: E-QTM-0138's in-situ check that no setting depends on the system's hidden points
// - netTable: the 9 net record counts of one setting pair (Alice's label, Bob's label) of a two-token weight
// - netChsh: the largest CHSH over +-1 groupings of the settings' records, computed FROM the net tables
// - recordedWhole: the joint whole after both parties' R, as the model applies it (a map of joint points)
// - propagateMembers: the 81 one-point wholes of a history (its classical members) advanced beat by beat,
//   with the fear beat on or off: the columns of the history's propagator
// - classifyNet: whether one member's net records are a definite outcome, with or without cancellation
//
// Deterministic and exact: integer tables and BigInt wholes. Nothing here decides a gate.

import { makeColorWeave } from '@/code/rule/color-weave'
import { fearKernels, meetingKernel, swapPhase, type Whole } from '@/code/rule/fear-weave'
import { advanceKnot, lineKnot, type KnotHistory } from '@/code/measure/knot-histories'
import { apparatusHistory, LABEL, LINES, lineIndexThrough, memberRecord, reflectionTable } from '@/code/measure/in-model-apparatus'

// the record's label of system point x for setting l, written by the member at (sr, sf) of the apparatus
export const recordLabel = (l: number, x: number, sr: number, sf: number): number => LABEL[9 * (LINES[l]?.c ?? 0) + memberRecord(x, sr, sf).record] ?? 0

// the label per system point for each of the 12 settings, member at the line's first two points (E-QTM-0138)
export const RECORD: readonly Int8Array[] = LINES.map((l, li) => Int8Array.from({ length: 9 }, (_, x) => recordLabel(li, x, l.points[0] ?? 0, l.points[1] ?? 0)))

// the same history with the fear beat off: every meeting the identity on the tokens' coordinates (E-QTM-0138)
export function fearOff(h: KnotHistory): KnotHistory {
  if (h.kernels.mode === 'swap') {
    return { ...h, kernels: { mode: 'swap', kernel4: meetingKernel(swapPhase(Math.PI)) ?? [] } }
  }

  const exchanged = h.name === 'qtm0100-color'

  return { ...h, kernels: { mode: 'color', color: fearKernels({ like: exchanged ? Math.PI : 0, unlike: 0, likeExchanged: exchanged })! } }
}

export const nextMeeting = (h: KnotHistory, from: number): number => {
  for (let t = from; t < h.records.length; t++) {
    if ((h.records[t]?.meetings.length ?? 0) > 0) {
      return t
    }
  }

  return h.records.length
}

export type InModelSettings = {
  readonly beats: number
  // bit l set when line l is a usable setting at beat t
  readonly lineMask: Uint16Array
  readonly apparatusStarts: number
}

const SETTINGS_MEMO = new Map<number, InModelSettings>()

// E-QTM-0138's apparatus: a love and a fear on the two slots of every line of every dock of the color weave
// (side 3, the committed pair table), each with its 81 start points, run by the knit's classical layer. At beat
// t an apparatus is usable when its tokens still hold a love and a fear at different points, and its setting
// is the line through them
export function inModelSettings(beats: number): InModelSettings {
  const known = SETTINGS_MEMO.get(beats)

  if (known) {
    return known
  }

  const weave = makeColorWeave({ side: 3, table: 'pair' })
  const slots = weave.mesh.cellCount * 24
  const lineMask = new Uint16Array(beats)
  const through = new Int8Array(81)
  let apparatusStarts = 0

  for (let p = 0; p < 9; p++) {
    for (let q = 0; q < 9; q++) {
      through[9 * p + q] = p === q ? -1 : lineIndexThrough(p, q)
    }
  }

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const o = weave.opposite[d] ?? d

      if (o < d) {
        continue
      }

      const vibe = new Int8Array(slots)

      vibe[x * 24 + d] = 1
      vibe[x * 24 + o] = -1

      const run = apparatusHistory({ weave, vibe, love: x * 24 + d, fear: x * 24 + o, beats })

      apparatusStarts += 81

      for (let t = 0; t < beats; t++) {
        if (!run.valid[t]) {
          continue
        }

        for (let p0 = 0; p0 < 9; p0++) {
          for (let q0 = 0; q0 < 9; q0++) {
            const l = through[9 * (run.moves[t * 18 + p0] ?? 0) + (run.moves[t * 18 + 9 + q0] ?? 0)] ?? -1

            if (l >= 0) {
              lineMask[t] = (lineMask[t] ?? 0) | (1 << l)
            }
          }
        }
      }
    }
  }

  const made = { beats, lineMask, apparatusStarts }

  SETTINGS_MEMO.set(beats, made)

  return made
}

export const settingsAt = (s: InModelSettings, t: number): number[] => LINES.map((_, l) => l).filter(l => ((s.lineMask[t] ?? 0) >> l) & 1)

// E-QTM-0138's P5: an apparatus run in the same lattice as E-QTM-0100's system tokens (4 and 7) reaches the
// same points, vibes and tokens for all 81 start points of the system
export function situIndependence(beats: number): { runs: number; differences: number } {
  const weave = makeColorWeave({ side: 3, table: 'pair' })
  const slots = weave.mesh.cellCount * 24
  let runs = 0
  let differences = 0

  for (let d = 0; d < 24; d++) {
    const o = weave.opposite[d] ?? d
    const x = 13

    if (o < d) {
      continue
    }

    const vibe = new Int8Array(slots)

    vibe[x * 24 + d] = 1
    vibe[x * 24 + o] = -1

    let reference: Int8Array | undefined

    for (let s = 0; s < 81; s++) {
      const points = new Int8Array(slots)

      points[4] = Math.floor(s / 9)
      points[7] = s % 9

      const run = apparatusHistory({ weave, vibe, love: x * 24 + d, fear: x * 24 + o, beats, points })
      const signature = Int8Array.from([...run.moves, ...run.valid])

      runs++

      if (!reference) {
        reference = signature
      } else {
        differences += signature.every((v, i) => v === reference![i]) ? 0 : 1
      }
    }
  }

  return { runs, differences }
}

// the 9 net record counts n(alpha, beta), index 3 alpha + beta, of a two-token weight (physical frame, index
// 9 x + y) at Alice's setting la and Bob's lb
export function netTable(weight: readonly bigint[], la: number, lb: number): bigint[] {
  const out = new Array<bigint>(9).fill(0n)
  const ra = RECORD[la]!
  const rb = RECORD[lb]!

  for (let i = 0; i < 81; i++) {
    const w = weight[i] ?? 0n

    if (w !== 0n) {
      const k = 3 * (ra[Math.floor(i / 9)] ?? 0) + (rb[i % 9] ?? 0)

      out[k] = (out[k] ?? 0n) + w
    }
  }

  return out
}

// the fears (negative joint points) and loves that land in each of the 9 outcome cells
export function cellLovesAndFears(weight: readonly bigint[], la: number, lb: number): { loves: bigint[]; fears: bigint[] } {
  const loves = new Array<bigint>(9).fill(0n)
  const fears = new Array<bigint>(9).fill(0n)
  const ra = RECORD[la]!
  const rb = RECORD[lb]!

  for (let i = 0; i < 81; i++) {
    const w = weight[i] ?? 0n
    const k = 3 * (ra[Math.floor(i / 9)] ?? 0) + (rb[i % 9] ?? 0)

    if (w > 0n) {
      loves[k] = (loves[k] ?? 0n) + w
    } else if (w < 0n) {
      fears[k] = (fears[k] ?? 0n) - w
    }
  }

  return { loves, fears }
}

const GROUPINGS = Array.from({ length: 8 }, (_, g) => [0, 1, 2].map(r => ((g >> r) & 1 ? -1 : 1)))

// The largest CHSH at the given settings, computed from the NET tables alone: each observable is a setting l
// and a +-1 grouping g of its 3 labels (duplicates, the same function of the point, kept once), and each
// correlator is sum over the 9 cells of g_a(alpha) g_b(beta) n_(la, lb)(alpha, beta). Exact, in the whole's units
export function netChsh(weight: readonly bigint[], settings: readonly number[]): { numerator: bigint; units: bigint } {
  const reps: { l: number; g: number[] }[] = []
  const seen = new Set<string>()

  for (const l of settings) {
    for (const g of GROUPINGS) {
      const key = Array.from({ length: 9 }, (_, x) => g[RECORD[l]![x] ?? 0]).join(',')

      if (!seen.has(key)) {
        seen.add(key)
        reps.push({ l, g })
      }
    }
  }

  const tables = new Map<number, bigint[]>()
  const tableOf = (la: number, lb: number): bigint[] => {
    const key = 12 * la + lb
    let t = tables.get(key)

    if (!t) {
      t = netTable(weight, la, lb)
      tables.set(key, t)
    }

    return t
  }
  const corr = reps.map(a =>
    reps.map(b => {
      const n = tableOf(a.l, b.l)
      let s = 0n

      for (let k = 0; k < 9; k++) {
        s += BigInt((a.g[Math.floor(k / 3)] ?? 0) * (b.g[k % 3] ?? 0)) * (n[k] ?? 0n)
      }

      return s
    }),
  )
  let best = -1n << 400n

  for (let a0 = 0; a0 < reps.length; a0++) {
    for (let a1 = 0; a1 < reps.length; a1++) {
      let plus = -1n << 400n
      let minus = -1n << 400n

      for (let b = 0; b < reps.length; b++) {
        const p = (corr[a0]?.[b] ?? 0n) + (corr[a1]?.[b] ?? 0n)
        const m = (corr[a0]?.[b] ?? 0n) - (corr[a1]?.[b] ?? 0n)

        plus = p > plus ? p : plus
        minus = m > minus ? m : minus
      }

      best = plus + minus > best ? plus + minus : best
    }
  }

  return { numerator: best, units: weight.reduce((s, w) => s + w, 0n) }
}

let REFLECTION: Int16Array | undefined

export const reflection = (): Int16Array => (REFLECTION ??= reflectionTable())

// The joint whole after each party's R, as the model applies it: system (a love, physical frame), record (a
// love at sr) and reference (a fear stored at sf) for Alice and for Bob, one classical member each. Returns the
// 81 joint points' images (index 729 iA + iB over the six stored points) with their weights, and each image's
// outcome cell (Alice's record label, Bob's). R is a bijection of the 729 points of one party, so nothing
// merges: this is checked, not assumed (`collisions`)
export function recordedWhole(
  weight: readonly bigint[],
  alice: { l: number; sr: number; sf: number },
  bob: { l: number; sr: number; sf: number },
): { images: Int32Array; cells: Int8Array; collisions: number } {
  const r = reflection()
  const images = new Int32Array(81)
  const cells = new Int8Array(81)
  const seen = new Set<number>()
  let collisions = 0

  for (let i = 0; i < 81; i++) {
    const ia = r[81 * Math.floor(i / 9) + 9 * alice.sr + alice.sf] ?? 0
    const ib = r[81 * (i % 9) + 9 * bob.sr + bob.sf] ?? 0
    const image = 729 * ia + ib
    const la = LABEL[9 * (LINES[alice.l]?.c ?? 0) + (Math.floor(ia / 9) % 9)] ?? 0
    const lb = LABEL[9 * (LINES[bob.l]?.c ?? 0) + (Math.floor(ib / 9) % 9)] ?? 0

    collisions += seen.has(image) && (weight[i] ?? 0n) !== 0n ? 1 : 0
    seen.add(image)
    images[i] = image
    cells[i] = 3 * la + lb
  }

  return { images, cells, collisions }
}

// The history's 81 classical members, each a one-point whole (weight 1 at one joint point, the history's
// stored convention), advanced beat by beat with the fear beat on (the history) or off (fearOff). `visit` gets
// each beat's members after the beat, raw (the caller reads them through physicalKnot). Each member keeps its
// own grain (reduceWhole), so a member's weights are its propagator column times a positive scale, the scale
// being the member's own units (the kernels keep the sum)
export function propagateMembers(h: KnotHistory, beats: number, visit: (t: number, members: readonly Whole[]) => void): void {
  let members: Whole[] = Array.from({ length: 81 }, (_, i) => {
    const weight = new Array<bigint>(81).fill(0n)

    weight[i] = 1n

    return { tokens: h.tokens, weight }
  })

  for (let t = 0; t < beats; t++) {
    const record = h.records[t]!

    members = members.map(w => advanceKnot(h, w, record))
    visit(t, members)
  }
}

export type BellState = {
  readonly h: KnotHistory
  readonly off: KnotHistory
  // the start: weight 1 on each joint point of line a x line b
  readonly a: readonly number[]
  readonly b: readonly number[]
  // whether the start is the history's own
  readonly own: boolean
  readonly t: number
  readonly reading: number
  // the whole after beat t, and the whole before it, fear beat on; the fear-off whole after beat t
  readonly whole: Whole
  readonly before: Whole
  readonly offWhole: Whole
}

// E-QTM-0138's states: every Bell history, every product of two grid lines as start, read at the reading beat
// (one beat after the first meeting), and the history's own start also after every meeting beat
export function forEachBellState(histories: readonly KnotHistory[], lines: readonly (readonly number[])[], beats: number, visit: (s: BellState) => void): void {
  for (const h of histories) {
    const off = fearOff(h)
    const reading = nextMeeting(h, 0) + 1

    for (const a of lines) {
      for (const b of lines) {
        const own = a.every(p => Math.floor(p / 3) === h.start[0]) && b.every(p => Math.floor(p / 3) === h.start[1])
        let w = lineKnot(h.tokens, a, b)
        let o = w

        for (let t = 0; t < (own ? beats : reading + 1); t++) {
          const before = w

          w = advanceKnot(h, w, h.records[t]!)
          o = advanceKnot(off, o, h.records[t]!)

          if (t === reading || (own && (h.records[t]?.meetings.length ?? 0) > 0)) {
            visit({ h, off, a, b, own, t, reading, whole: w, before, offWhole: o })
          }
        }
      }
    }
  }
}

export type NetClass ='clean' | 'netted' | 'spread' | 'negative'

// One member's net records at a setting pair (or one party's, given a 3-cell table):
//   clean     a definite outcome with no cancellation: exactly one cell nonzero, positive, and no fear
//             anywhere in the member's weight
//   netted    a definite outcome after the member's own cancellation: one cell positive, the rest net 0, and
//             the member holds a fear
//   spread    every cell non-negative, two or more positive: not one outcome
//   negative  some cell net negative: the member alone would write a negative number of records
export function classifyNet(cells: readonly bigint[], hasFear: boolean): NetClass {
  if (cells.some(c => c < 0n)) {
    return 'negative'
  }

  const positive = cells.filter(c => c > 0n).length

  return positive >= 2 ? 'spread' : hasFear ? 'netted' : 'clean'
}
