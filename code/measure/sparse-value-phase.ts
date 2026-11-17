// THE VALUE PHASE AND ITS READINGS ON SPARSE BRANCHES (item vibe-roadmap-grounding-0015): code/rule/value-phase's beat
// (U = S W X W around the working rule) and the maps E-FND-0178 reads it with (code/measure/locked-parity's mirrors,
// charge conjugation and motion reversal K S R; code/measure/value-phase-maps' exact state equality and occupation
// distance; code/measure/doublet-locked-readings' CHSH of the like knot), each on the sparse branches of
// code/rule/sparse-locked-knit. Each function follows its dense original step for step (the same per-branch order, the
// same exact arithmetic), so a sparse reading equals the dense one; the item's S0 gate checks that on the box and the
// R = 4 ball.
//
// NOTHING MOVES: the phase multiplies amplitudes; a map relabels which slot of which dock holds a value.

import { LINE_FIRSTS, LINE_OF, SIDE } from '@/code/rule/isometric-knit'
import { norm, times, type LockedTables } from '@/code/rule/doublet-locked-knit'
import {
  chshFromWeights,
  schmidtWeights,
} from '@/code/measure/doublet-locked-readings'
import { huskInversion, type Mirror } from '@/code/measure/locked-parity'
import {
  chiOf,
  type ValuePiece,
  type ValueTally,
} from '@/code/rule/value-phase'
import {
  cloneSparse,
  lineEntries,
  slotEntries,
  sparseBranchOf,
  sparseKey,
  sparseVetoBeat,
  sparseVetoBeatBack,
  streamSparse,
  type LineEntry,
  type SlotEntry,
  type SparseBranch,
  type SparseState,
} from '@/code/rule/sparse-locked-knit'

const SLOTS = 24

// ---- the value phase ----

// valueExponent on a sparse branch; `unstream` reads it with the stream undone
export function sparseValueExponent(
  piece: ValuePiece,
  t: LockedTables,
  b: SparseBranch,
  unstream = false,
): number {
  if (piece.kind === 'off') {
    return 0
  }

  const byDock = new Map<number, [number, number][]>()

  for (const e of slotEntries(b)) {
    const at = unstream ? t.source[e.slot]! : e.slot
    const x = (at / SLOTS) | 0
    const list = byDock.get(x)

    if (list) {
      list.push([at % SLOTS, e.vibe])
    } else {
      byDock.set(x, [[at % SLOTS, e.vibe]])
    }
  }

  let n = 0

  for (const [x, list] of byDock) {
    list.sort((p, q) => p[0] - q[0])

    const tone = new Int8Array(SLOTS)

    for (const [d, v] of list) {
      tone[d] = v
    }

    const chi = chiOf(
      piece.kind,
      list.map(p => p[0]),
      list.map(p => p[1]),
      d => tone[d]!,
    )
    const sigma = piece.kind === 'odd' && piece.orientation ? piece.orientation[x]! : 1

    n += sigma * chi
  }

  return n
}

function phase(br: SparseBranch, n: number, inverse: boolean): void {
  const m = (((inverse ? -n : n) % 6) + 6) % 6

  for (let i = 0; i < m; i++) {
    times(br, 1n, 1n)
  }
}

function applyHalf(
  piece: ValuePiece,
  t: LockedTables,
  s: SparseState,
  unstream: boolean,
  inverse: boolean,
  tally?: ValueTally,
): SparseState {
  for (const br of s.branches) {
    const n = sparseValueExponent(piece, t, br, unstream)

    if (n !== 0 && tally) {
      tally.fired++
      tally.maxExponent = Math.max(tally.maxExponent, Math.abs(n))
    }

    phase(br, n, inverse)
  }

  return s
}

const cloneState = (s: SparseState): SparseState => ({ branches: s.branches.map(cloneSparse) })

// valueBeat on sparse branches: U = S W X W
export function sparseValueBeat(
  piece: ValuePiece,
  t: LockedTables,
  s: SparseState,
  beat: number,
  valueTally?: ValueTally,
): SparseState {
  if (piece.kind === 'off') {
    return sparseVetoBeat('none', t, s, beat)
  }

  const first = applyHalf(piece, t, cloneState(s), false, false, valueTally)
  const mid = sparseVetoBeat('none', t, first, beat)

  return applyHalf(piece, t, mid, true, false, valueTally)
}

// valueBeatBack on sparse branches: U^-1 = W^-1 X^-1 W^-1 S^-1
export function sparseValueBeatBack(
  piece: ValuePiece,
  t: LockedTables,
  s: SparseState,
  beat: number,
): SparseState {
  if (piece.kind === 'off') {
    return sparseVetoBeatBack('none', t, s, beat)
  }

  const first = applyHalf(piece, t, cloneState(s), true, true)
  const mid = sparseVetoBeatBack('none', t, first, beat)

  return applyHalf(piece, t, mid, false, true)
}

// ---- the maps ----

// stored pair words above 8 a mirror met (the dense mirrorConfiguration sends them through the 9-entry point table, so
// to point 0; this file does the same, and counts them so a run can say the latent bug was not reached)
const MIRROR_WORDS = { beyond: 0 }

export const mirrorWordsBeyond = (): number => MIRROR_WORDS.beyond

// mirrorConfiguration on a sparse branch; `cellOf` the dock map (the mirror's cells)
function mirrorWith(
  slots: ArrayLike<number>,
  points: ArrayLike<number>,
  cellOf: (x: number) => number,
  b: SparseBranch,
): SparseBranch {
  const held: SlotEntry[] = slotEntries(b).map(e => {
    const x = (e.slot / SLOTS) | 0
    const d = e.slot % SLOTS

    return {
      slot: cellOf(x) * SLOTS + slots[d]!,
      vibe: e.vibe,
      point: points[e.point] ?? 0,
      open: e.open,
    }
  })
  const stored: LineEntry[] = lineEntries(b).map(e => {
    const x = (e.line / 12) | 0
    const l = e.line % 12
    const image = slots[LINE_FIRSTS[l]!]!
    const k = LINE_OF[image]!
    const flip = SIDE[image] === -1
    const o = e.sopen
    const p = points[e.spoint]

    if (p === undefined) {
      MIRROR_WORDS.beyond++
    }

    return {
      line: cellOf(x) * 12 + k,
      store: (flip ? -1 : 1) * e.store,
      spoint: p ?? 0,
      sopen: flip ? ((o & 1) << 1) | ((o >> 1) & 1) : o,
    }
  })

  return sparseBranchOf(held, stored, b.a, b.b, b.k)
}

export function sparseMirror(m: Mirror, b: SparseBranch): SparseBranch {
  return mirrorWith(m.map.slots, m.points, x => m.cells[x]!, b)
}

export function sparseCharge(b: SparseBranch): SparseBranch {
  const out = cloneSparse(b)

  for (let i = 0; i < out.vibe.length; i++) {
    out.vibe[i] = -out.vibe[i]!
  }

  for (let i = 0; i < out.store.length; i++) {
    out.store[i] = -out.store[i]!
  }

  return out
}

export const mapSparse = (s: SparseState, f: (b: SparseBranch) => SparseBranch): SparseState => ({
  branches: s.branches.map(f),
})

const REVERSAL = huskInversion(true)

// motionReversal T = K S R: every slot to its opposite on its dock, one stream, every amplitude conjugated
export function sparseMotionReversal(t: LockedTables, s: SparseState): SparseState {
  return {
    branches: s.branches.map(b => {
      const r = streamSparse(t, mirrorWith(REVERSAL.slots, IDENTITY, x => x, b), false)

      // conj(a + b w) = (a - b) - b w
      r.a = b.a - b.b
      r.b = -b.b

      return r
    }),
  }
}

const IDENTITY = [0, 1, 2, 3, 4, 5, 6, 7, 8]

// ---- equality, distance, CHSH ----

// sameStateFast on sparse states
export function sparseSame(x: SparseState, y: SparseState): boolean {
  if (x.branches.length !== y.branches.length) {
    return false
  }

  const byKey = new Map<string, SparseBranch>()

  for (const b of x.branches) {
    byKey.set(sparseKey(b), b)
  }

  if (byKey.size !== x.branches.length) {
    throw new Error('sparse-value-phase: a state holds one configuration twice')
  }

  for (const o of y.branches) {
    const key = sparseKey(o)
    const b = byKey.get(key)

    if (!b) {
      return false
    }

    const k = Math.max(b.k, o.k)
    const s1 = 1n << BigInt(k - b.k)
    const s2 = 1n << BigInt(k - o.k)

    if (b.a * s1 !== o.a * s2 || b.b * s1 !== o.b * s2) {
      return false
    }

    byKey.delete(key)
  }

  return byKey.size === 0
}

function occupationKey(b: SparseBranch): string {
  const parts: number[] = []

  for (const e of slotEntries(b)) {
    parts.push(e.vibe > 0 ? e.slot : -e.slot - 1)
  }

  for (const e of lineEntries(b)) {
    parts.push(e.store > 0 ? 1e9 + e.line : -1e9 - e.line)
  }

  return parts.join(',')
}

function occupationWeights(s: SparseState, k: number): Map<string, bigint> {
  const out = new Map<string, bigint>()

  for (const b of s.branches) {
    const w = norm(b.a, b.b) * 4n ** BigInt(k - b.k)
    const key = occupationKey(b)

    out.set(key, (out.get(key) ?? 0n) + w)
  }

  return out
}

// occupationDistance on sparse states
export function sparseOccupationDistance(x: SparseState, y: SparseState): number {
  const k = Math.max(0, ...x.branches.map(b => b.k), ...y.branches.map(b => b.k))
  const px = occupationWeights(x, k)
  const py = occupationWeights(y, k)
  const keys = new Set([...px.keys(), ...py.keys()])

  let sum = 0n

  for (const key of keys) {
    const d = (px.get(key) ?? 0n) - (py.get(key) ?? 0n)

    sum += d < 0n ? -d : d
  }

  return Number((sum * 1_000_000_000n) / (2n * 4n ** BigInt(k))) / 1e9
}

// the occupation (vibe and store trits), for registerKnot's one-occupation test
function tritKey(b: SparseBranch): string {
  const parts: number[] = []

  for (const e of slotEntries(b)) {
    parts.push(e.slot, e.vibe)
  }

  parts.push(-9)

  for (const e of lineEntries(b)) {
    parts.push(e.line, e.store)
  }

  return parts.join(',')
}

function pointAt(b: SparseBranch, slot: number): number {
  const x = (slot / SLOTS) | 0

  for (let i = 0; i < b.docks.length; i++) {
    if (b.docks[i] === x) {
      return b.point[i * SLOTS + (slot % SLOTS)]!
    }
  }

  return 0
}

// registerKnot's CHSH on a sparse state (undefined when the branches do not share one occupation)
export function sparseKnotChsh(s: SparseState, slotA: number, slotB: number): number | undefined {
  const first = s.branches[0]

  if (!first) {
    return undefined
  }

  const occupation = tritKey(first)

  for (const b of s.branches) {
    if (tritKey(b) !== occupation) {
      return undefined
    }
  }

  const re: number[][] = Array.from({ length: 9 }, () => new Array<number>(9).fill(0))
  const im: number[][] = Array.from({ length: 9 }, () => new Array<number>(9).fill(0))
  const half = Math.sqrt(3) / 2

  for (const b of s.branches) {
    const x = Number(b.a)
    const y = Number(b.b)
    const d = 2 ** b.k
    const ar = (x - y / 2) / d
    const ai = (y * half) / d
    const pa = pointAt(b, slotA)
    const pb = pointAt(b, slotB)

    re[pa]![pb]! += ar
    im[pa]![pb]! += ai
  }

  const weights = schmidtWeights(re, im)
  const total = weights.reduce((u, v) => u + v, 0)

  return chshFromWeights(weights.map(v => v / total))
}

export const sparseStateOf = (b: SparseBranch): SparseState => ({ branches: [cloneSparse(b)] })
