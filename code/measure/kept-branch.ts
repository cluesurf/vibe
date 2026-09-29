// THE KEPT BRANCH OF A LIKE MEETING, SWITCHED ON AND OFF (E-QTM-0163, OPEN-FND-07). MEASUREMENT: every amplitude is exact
// in Z[w][1/2] (the knit) or Q(w) (the register circuit); floats appear only in the Schmidt weights and CHSH readings.
//
// WHAT IS SWITCHED. A like meeting of two open vibes with unequal points splits a term into its KEPT branch ((1 + w)/2,
// the points kept) and its EXCHANGED branch (-(1 - w)/2, the points exchanged), and the occupation is the same in both
// (code/rule/doublet-locked-knit). "The kept branch interferes with itself" is the program's own reading (E-RLT-0103,
// 0105 Q7): the kept configuration's weight differs from the dephased (1/4)^m, which happens exactly when two histories
// that differ in the outcome of some like meeting reach one configuration and the rule adds their amplitudes. The
// switch acts on that addition and on nothing else:
//   'on'      the rule: coincident configurations add, whatever their histories
//   'off'     every like meeting's outcome is written to a record the branch carries, except the branch's LAST one; two
//             branches add only when their configurations and their written records agree. So a pair's last meeting stays
//             coherent (its keep and exchange branches are still one superposed knot) while no earlier meeting's branches
//             can recombine. This is the channel "every like meeting but the last dephased", 1/4 rho + 3/4 S rho S
//   'strict'  every like meeting's outcome is written, the last included: no branch of a like meeting ever adds with a
//             branch of the other outcome. The coin's branches (a one-vibe gate) are never recorded, so position
//             interference from the coin is kept in every mode
//
// THE LEMMA the knit runs rely on, exact: a kept and an exchanged branch of one meeting hold the same occupation and the
// two vibes' points swapped (pA, pB) against (pB, pA), pA != pB. Every later piece that is not another split meeting of
// those vibes moves both branches' points by the same link permutations and the same slot moves (the coin, the stream
// and the store read no point under the no-veto store), so the two branches never coincide. So a configuration where
// histories with different like-meeting outcomes add needs a second split meeting in the lineage: with at most one split
// meeting on every lineage, 'on' and 'off' are the same state bit for bit.
//
// THE REGISTER CIRCUIT (for the rows measured on the gates, not on a mesh): a two-vibe state over the points of the two
// vibes, and a word of line-of-two meetings (code/measure/rule-gates lineOfTwo) with link point permutations between
// them. 'on' composes the meetings coherently; 'off' dephases every meeting but the last into an ensemble of pure
// members; 'once' lets only the first meeting act (the pair meets once, as the pass contact mostly arranges).
//
// NOTHING MOVES: the record is bookkeeping carried with a term, never a register of the mesh. Deterministic, no seeds.

import {
  cloneConfiguration,
  norm,
  streamConfiguration,
  type Branch,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import { coinBranch } from '@/code/rule/coined-locked-knit'
import {
  collideVeto,
  meetBranch,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import { FULL, grainKey } from '@/code/measure/dephased-twin'
import {
  add,
  conj,
  isZero,
  mul,
  ONE,
  qw,
  W,
  K,
  X,
  neg,
  ZERO,
  type Qw,
} from '@/code/measure/rule-gates'

export type KeptMode = 'on' | 'off' | 'strict'

// a term with its record of like-meeting outcomes, one letter per split meeting it passed: k kept, e exchanged
export type RecordedBranch = Branch & { record: string }

export type KeptTally = {
  // split like meetings met, over all terms
  splits: number
  // the longest record on any term: the most split meetings one lineage has passed
  longest: number
  // merges the rule made ('on') between terms whose full records differ, and whose written records differ
  crossFull: number
  crossWritten: number
  // coincident configurations kept apart because their records differ ('off', 'strict')
  refused: number
  // every merge made
  merged: number
}

export const newKeptTally = (): KeptTally => ({
  splits: 0,
  longest: 0,
  crossFull: 0,
  crossWritten: 0,
  refused: 0,
  merged: 0,
})

// the record as written in 'off': every outcome but the last
export const writtenRecord = (r: string): string => r.slice(0, -1)

const keyOf = (mode: KeptMode, r: string): string =>
  mode === 'on' ? '' : mode === 'off' ? writtenRecord(r) : r

const cloneRecorded = (b: RecordedBranch): RecordedBranch => ({
  ...cloneConfiguration(b),
  a: b.a,
  b: b.b,
  k: b.k,
  record: b.record,
})

export function recordedStart(
  c: Parameters<typeof cloneConfiguration>[0],
): RecordedBranch[] {
  return [{ ...cloneConfiguration(c), a: 1n, b: 0n, k: 0, record: '' }]
}

function reduce(b: Branch): void {
  while (b.k > 0 && b.a % 2n === 0n && b.b % 2n === 0n) {
    b.a /= 2n
    b.b /= 2n
    b.k--
  }
}

// coincident configurations added as the mode allows (code/rule/doublet-locked-knit mergeBranches, with the record key)
export function mergeRecorded(
  list: RecordedBranch[],
  mode: KeptMode,
  tally?: KeptTally,
): RecordedBranch[] {
  const held = new Map<string, RecordedBranch>()
  const configs = new Set<string>()
  const out: RecordedBranch[] = []

  for (const b of list) {
    const ck = grainKey(b, FULL)
    const key = `${ck}#${keyOf(mode, b.record)}`
    const twin = held.get(key)

    if (!twin) {
      if (tally && configs.has(ck)) {
        tally.refused++
      }

      configs.add(ck)
      held.set(key, b)
      out.push(b)
      continue
    }

    if (tally) {
      tally.merged++
      tally.crossFull += twin.record !== b.record ? 1 : 0
      tally.crossWritten +=
        writtenRecord(twin.record) !== writtenRecord(b.record) ? 1 : 0
    }

    const k = Math.max(twin.k, b.k)
    const s1 = 1n << BigInt(k - twin.k)
    const s2 = 1n << BigInt(k - b.k)

    twin.a = twin.a * s1 + b.a * s2
    twin.b = twin.b * s1 + b.b * s2
    twin.k = k
  }

  return out.filter(b => {
    reduce(b)

    return b.a !== 0n || b.b !== 0n
  })
}

// one beat of the working rule (code/rule/coined-locked-knit coinedVetoBeat: the coin, then the meetings, the veto's
// collision and the stream) with the record carried and the merges made as the mode allows
export function keptBeat(input: {
  kind: VetoKind
  tables: LockedTables
  state: RecordedBranch[]
  beat: number
  mode: KeptMode
  tally?: KeptTally
  locked?: LockedTally
}): RecordedBranch[] {
  const { kind, tables, beat, mode, tally, locked } = input
  const coined: RecordedBranch[] = []

  for (const br of input.state) {
    for (const c of coinBranch(tables.cells, cloneRecorded(br), false)) {
      coined.push({ ...c, record: br.record })
    }
  }

  const mid = mergeRecorded(coined, mode, tally)
  const next: RecordedBranch[] = []

  for (const br of mid) {
    const kids = meetBranch(cloneRecorded(br), tables.cells, false, locked)
    const n = Math.round(Math.log2(kids.length))

    if (mode === 'off' && n > 1) {
      throw new Error(
        `kept-branch: ${n} split meetings on one term in one beat; 'off' keeps one last meeting coherent and is not written for more`,
      )
    }

    kids.forEach((kid, mask) => {
      let record = br.record

      for (let q = 0; q < n; q++) {
        record += (mask >> q) & 1 ? 'e' : 'k'
      }

      collideVeto(kind, tables, kid, beat, false, locked)
      streamConfiguration(tables, kid, false)

      if (tally) {
        tally.longest = Math.max(tally.longest, record.length)
      }

      next.push({ ...kid, record })
    })

    if (tally) {
      tally.splits += n
    }
  }

  return mergeRecorded(next, mode, tally)
}

// the terms of `a` and `b` agree as sums of configurations with amplitudes, bit for bit (records ignored)
export function sameSum(
  a: readonly Branch[],
  b: readonly Branch[],
): boolean {
  if (a.length !== b.length) {
    return false
  }

  const index = new Map<string, Branch>()

  for (const x of b) {
    index.set(grainKey(x, FULL), x)
  }

  if (index.size !== b.length) {
    return false
  }

  return a.every(x => {
    const y = index.get(grainKey(x, FULL))

    return (
      y !== undefined &&
      y.k === x.k &&
      y.a === x.a &&
      y.b === x.b
    )
  })
}

// the Born weight of every term, as p over 4^K, and 4^K: the norm is exact when they sum to 4^K
export function recordedNorm(s: readonly Branch[]): {
  total: bigint
  unit: bigint
} {
  const top = Math.max(0, ...s.map(b => b.k))

  let total = 0n

  for (const b of s) {
    total += norm(b.a, b.b) * (1n << BigInt(2 * (top - b.k)))
  }

  return { total, unit: 1n << BigInt(2 * top) }
}

// the terms grouped by written record (the members of the 'off' ensemble), each with its weight
export function membersOf(
  s: readonly RecordedBranch[],
  mode: KeptMode,
): RecordedBranch[][] {
  const groups = new Map<string, RecordedBranch[]>()

  for (const b of s) {
    const key = keyOf(mode, b.record)
    const g = groups.get(key)

    if (g) {
      g.push(b)
    } else {
      groups.set(key, [b])
    }
  }

  return [...groups.values()]
}

// ---- the register circuit: two vibes' points under line-of-two meetings and link point permutations ----

// a two-vibe register state: amplitude per (point of vibe A, point of vibe B), key 9 a + b
export type Register = Map<number, Qw>

export const registerStart = (a: number, b: number): Register =>
  new Map([[9 * a + b, ONE]])

function addTo(out: Register, key: number, v: Qw): void {
  const s = add(out.get(key) ?? ZERO, v)

  if (isZero(s)) {
    out.delete(key)
  } else {
    out.set(key, s)
  }
}

// the rule's line of two on the pair (code/measure/rule-gates lineOfTwo): w U, keep w k, exchange -w x, equal points w^2
export function meetRegister(s: Register): Register {
  const out: Register = new Map()
  const wk = mul(W, K)
  const wx = neg(mul(W, X))
  const ww = mul(W, W)

  for (const [key, v] of s) {
    const a = Math.floor(key / 9)
    const b = key % 9

    if (a === b) {
      addTo(out, key, mul(v, ww))
    } else {
      addTo(out, key, mul(v, wk))
      addTo(out, 9 * b + a, mul(v, wx))
    }
  }

  return out
}

// the meeting's two branches separately, for the dephased ensemble: [kept part, exchanged part] (either may be empty)
export function meetParts(s: Register): [Register, Register] {
  const kept: Register = new Map()
  const exchanged: Register = new Map()
  const wk = mul(W, K)
  const wx = neg(mul(W, X))
  const ww = mul(W, W)

  for (const [key, v] of s) {
    const a = Math.floor(key / 9)
    const b = key % 9

    if (a === b) {
      addTo(kept, key, mul(v, ww))
    } else {
      addTo(kept, key, mul(v, wk))
      addTo(exchanged, 9 * b + a, mul(v, wx))
    }
  }

  return [kept, exchanged]
}

// a link permutation on vibe B's point (vibe A's link absorbed: a common permutation of both commutes with the meeting)
export function permuteSecond(s: Register, perm: readonly number[]): Register {
  const out: Register = new Map()

  for (const [key, v] of s) {
    out.set(9 * Math.floor(key / 9) + perm[key % 9]!, v)
  }

  return out
}

// the squared norm of a register, exact
export function registerWeight(s: Register): Qw {
  let t = ZERO

  for (const v of s.values()) {
    t = add(t, mul(v, conj(v)))
  }

  return t
}

// the reduced density of vibe A, exact: rho[a][a'] = sum_b psi(a, b) conj(psi(a', b)) / |psi|^2
function reducedA(s: Register): Map<number, Qw> {
  const rho = new Map<number, Qw>()
  const byB = new Map<number, [number, Qw][]>()

  for (const [key, v] of s) {
    const b = key % 9
    const list = byB.get(b) ?? []

    list.push([Math.floor(key / 9), v])
    byB.set(b, list)
  }

  for (const list of byB.values()) {
    for (const [a, v] of list) {
      for (const [a2, v2] of list) {
        const key = 9 * a + a2
        const x = add(rho.get(key) ?? ZERO, mul(v, conj(v2)))

        rho.set(key, x)
      }
    }
  }

  return rho
}

// the power sums Tr rho_A^2 and Tr rho_A^3 of a normalized register, exact rationals: (1/2, 1/2) Schmidt weights read
// (1/2, 1/4), a product (1, 1)
export function powerSums(s: Register): { p2: Qw; p3: Qw } {
  const w = registerWeight(s)
  const rho = reducedA(s)
  const at = (i: number, j: number): Qw => rho.get(9 * i + j) ?? ZERO

  let p2 = ZERO
  let p3 = ZERO

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const ij = at(i, j)

      if (isZero(ij)) {
        continue
      }

      p2 = add(p2, mul(ij, at(j, i)))

      for (let k = 0; k < 9; k++) {
        const jk = at(j, k)

        if (!isZero(jk)) {
          p3 = add(p3, mul(mul(ij, jk), at(k, i)))
        }
      }
    }
  }

  const w2 = mul(w, w)
  const w3 = mul(w2, w)

  return {
    p2: qw(p2.a * w2.d, p2.b * w2.d, p2.d * w2.a),
    p3: qw(p3.a * w3.d, p3.b * w3.d, p3.d * w3.a),
  }
}

// the register as a 9 x 9 float matrix (rows vibe A's point), for the Schmidt weights
export function registerMatrix(s: Register): {
  re: number[][]
  im: number[][]
} {
  const re = Array.from({ length: 9 }, () => new Array<number>(9).fill(0))
  const im = Array.from({ length: 9 }, () => new Array<number>(9).fill(0))

  for (const [key, v] of s) {
    const a = Number(v.a) / Number(v.d)
    const b = Number(v.b) / Number(v.d)

    re[Math.floor(key / 9)]![key % 9] = a - b / 2
    im[Math.floor(key / 9)]![key % 9] = (b * Math.sqrt(3)) / 2
  }

  return { re, im }
}

// the 'off' ensemble of a word: every meeting but the last dephased, the members pure, weights exact
export function dephasedMembers(
  start: Register,
  perms: readonly (readonly number[])[],
): { weight: Qw; state: Register }[] {
  let members: { weight: Qw; state: Register }[] = [
    { weight: ONE, state: start },
  ]

  // meetings 1 .. n-1 dephased, each followed by its link permutation
  for (const perm of perms) {
    const next: { weight: Qw; state: Register }[] = []

    for (const m of members) {
      for (const part of meetParts(m.state)) {
        if (part.size === 0) {
          continue
        }

        const w = registerWeight(part)
        const unit = new Map<number, Qw>()

        // keep the part as it is (unnormalized) and carry its weight separately, relative to the member
        for (const [key, v] of part) {
          unit.set(key, v)
        }

        next.push({
          weight: mul(m.weight, w),
          state: permuteSecond(normalize(unit, w), perm),
        })
      }
    }

    members = next
  }

  return members.map(m => ({ weight: m.weight, state: meetRegister(m.state) }))
}

// a register divided by the square root of its weight: exact only when the weight is 1/4 or 3/4 of a unit state times a
// unit, which is all a dephased meeting on a basis product makes; otherwise refused
function normalize(s: Register, w: Qw): Register {
  // the parts of a meeting on a sum of basis products are sums of basis products with amplitudes k w^n or x w^n times
  // the member's; dividing by k or x (|k|^2 = 1/4, |x|^2 = 3/4) is exact in Q(w)
  const inverse = (q: Qw): Qw => {
    const n = mul(q, conj(q))

    return qw(conj(q).a * n.d, conj(q).b * n.d, conj(q).d * n.a)
  }

  const quarter = qw(1n, 0n, 4n)
  const threeQuarters = qw(3n, 0n, 4n)
  const unitWeight = isZero(add(w, neg(ONE)))

  if (unitWeight) {
    return s
  }

  const factor = isZero(add(w, neg(quarter)))
    ? inverse(K)
    : isZero(add(w, neg(threeQuarters)))
      ? inverse(X)
      : undefined

  if (!factor) {
    throw new Error(
      'kept-branch: a dephased part whose weight is not 1/4 or 3/4 of its member',
    )
  }

  const out: Register = new Map()

  for (const [key, v] of s) {
    out.set(key, mul(v, factor))
  }

  return out
}
