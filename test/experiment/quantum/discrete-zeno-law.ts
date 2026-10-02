// THE DISCRETE-TIME ZENO LAW ON THE VACUUM PAIR'S ROLE TRANSFER (E-QTM-0172, OPEN-QTM-07, routes file
// quantum-relativity-light-computation.md, the row "the discrete-time Zeno law" under quantum Zeno). The row's
// mechanism: in discrete time the meeting rate is capped at one a beat, so the rule's Zeno effect would be a survival
// curve that rises with meeting rate and saturates at one a beat, never a freeze. Its test: survival of a role
// transition with a fear-beat meeting every k-th beat, k = 1 to 12, exact in Z[w], 17 starts. Its kill: survival does
// not rise with meeting rate at all (meetings do not act as readings).
//
// WHAT IS RUN. The transition: the working vacuum's like pair (E-RLT-0105's pick) as two roles A and B, from |0>|1>,
// driven by the pair's own meetings and the link moves between them, as E-QTM-0171 extracted them per start
// (code/measure/vacuum-pair-word: side 4, meetings at beats 1, 4, 7, ..., the relative moves R1, R2 alternating, each
// a local Clifford by E-QTM-0171's identification). The drive meeting is the rule's own, w U^dagger on roles
// (E-QTM-0171 point 1). The state is carried in A's own frame (A's role transported by the relative moves), so with
// no drive meeting nothing changes, and SURVIVAL is the chance that the pair still reads (A's start role, B's start
// role), the (0, 1) entry of the two-role density in that frame. Every number is exact: densities are 9 x 9 matrices
// over Q(w), entries (a + b w) / d with bigint a, b, d.
// The readings, one every k-th beat (beats t with (t + 1) mod k = 0 that are not drive beats, since a vibe meets one
// partner a beat), k = 1 to 12, and none:
//   the model's reading: a fear-beat meeting of A with a fresh vacuum partner drawn from the frame-invariant
//     environment (the uniform mix of the three roles, E-QTM-0154 and E-QTM-0156's environment), traced out; with the
//     love-fear kernel (the singlet phase V^dagger, the rule's convention) and with the like kernel (w U^dagger)
//   reported only: the same meetings with a partner in one definite role c = 0, 1, 2 of A's frame (c = 0 is A's start
//     role), and the ideal reading (a STAND-IN: A's role read and kept, A dephased in its frame's role basis)
// Measured: the time-mean survival over 48 beats (16 drive meetings), per start, kernel and k.
//
// DERIVED BEFORE THE GATE RUN.
// 1. A meeting with a partner from the frame-invariant mix is the depolarizing channel rho -> lambda rho + (1 - lambda)
//    Tr(rho) 1/3 on A, lambda = 2/3 (love-fear) and 1/4 (like) (E-QTM-0154, by Schur's lemma on a 2-design). It reads
//    no basis: it is the same channel in every frame, so it cannot single out A's start role. Its only effect on
//    survival is to mix the pair toward the fully mixed state, where survival is 1/9.
// 2. The cap. The drive moves the pair only at its meetings (every 3 beats here), so between two drive meetings the
//    ideal reading is idempotent: one reading per drive interval or two gives the same state. So the ideal reading's
//    survival is the same for k = 1, 2 and 3 exactly, the dephased Markov chain of the drive (E-QTM-0116, 0129), below
//    1 for any k: a saturation, never a freeze.
// 3. On the flat drive (every R the identity), the coherent survival after drive meetings 1, 2, 3 is 1/4, 1/4, 1
//    (U^3 = 1), and with the ideal reading every beat 1/4, 5/8, 7/16 (a reading raises survival at the second meeting
//    and lowers it at the third). So whether readings raise or lower survival depends on where the coherent drive is.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/zn-probe1.ts (floats, 2 s, the flat drive and 7 starts' windows read from
//  E-QTM-0171's log): with the frame-invariant partner the time-mean survival at k = 1 is 0.120 to 0.131 on every start
//  (the like kernel) and 0.126 to 0.144 (love-fear), against 0.119 to 0.356 with no reading, so it rises above no
//  reading only on the starts whose coherent survival is already low (integer+1 and +3 of the 7) and falls on the
//  rest; the ideal reading gives equal values at k = 1, 2, 3 and also rises on only 2 of 7; a partner in A's start role
//  raises survival on several starts with the like kernel (a reset toward the partner's role, as E-QTM-0116 found).
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: every Kraus set (two kernels, three partner roles) is trace preserving exactly; every run keeps the
//     trace exactly 1 and the survival in [0, 1] at every beat; on all 17 starts the pair word is found, meets 16 times
//     in 48 beats and every relative move is a Clifford.
//  C1 CONTROL (the instrument reads a rise): on the flat drive the ideal reading every beat takes the survival after
//     the second drive meeting from 1/4 to 5/8 and after the third from 1 to 7/16, exactly.
//  D1 DERIVATION (points 1 and 2): the frame-invariant partner's channel equals the depolarizing channel with lambda =
//     2/3 and 1/4 on all 9 matrix units of A, exactly; and the ideal reading's time-mean survival is the same at k = 1,
//     2 and 3, exactly, on 17 of 17 starts.
//  H1 THE ROUTE: for both kernels of the model's reading, on 17 of 17 starts, the time-mean survival at k = 1 exceeds
//     that with no reading (meetings raise survival).
//  P1 THE KILL (the row's own): for both kernels, on every start, no k from 1 to 12 raises the time-mean survival
//     above no reading.
// VERDICT, fixed before the run: FAIL if I1 or C1 fails (the instrument); PASS if H1 and D1 hold; FAIL if P1 fires;
//  PARTIAL otherwise. Predicted from the probe: PARTIAL, with H1 failing (a rise on a minority of starts) and P1 not
//  firing.
// REPORTED, NOT GATED: per start and kernel, the curve over k, how many starts rise at k = 1, how many curves are
//  non-increasing in k; the definite-partner and ideal curves; the largest survival at k = 1.
// WHAT THIS CAN AND CANNOT SHOW. The transition is the like pair's role transfer under the vacuum's own word, in role
//  language (E-QTM-0171's identification), not the pair's point register; the partner is fresh at every reading (a
//  vacuum whose partners keep no memory), and the readings are placed by hand every k-th beat rather than by the
//  mesh. A partial or fail says the model's fear-beat meeting, against the environment the program uses, is not a
//  reading in the Zeno sense on this transition; it does not rule out a reading by a partner that holds a definite
//  role, which is a reset, or by a piece the rule does not have.
//
// FIRST RUN 2026-10-02 (tmp/zn-run1.log, 21 s): PARTIAL as predicted, I1, C1 and D1 held, H1 failed, P1 did not fire,
//  no gate moved, title written after the run. Every Kraus set is trace preserving; the frame-invariant partner is the
//  depolarizing channel on 18 of 18 matrix units; the flat drive reads 1/4 -> 5/8 and 1 -> 7/16 under the ideal reading.
//  With no reading the time-mean survival is 0.114 to 0.356 over the 17 starts. With the model's reading every beat it
//  is 0.126 to 0.135 (love-fear) and 0.1204 to 0.1220 (like) on every start, whatever the start's coherent value: it
//  rises above no reading at k = 1 on 5 starts (love-fear: integer+1, 3, 7, 8, 14, each with no-reading survival 0.114
//  to 0.127) and 3 (like: integer+3, 7, 14), at some k on 6 and 7, and falls on the rest; no curve is non-increasing in
//  k. The ideal reading (a stand-in) is equal at k = 1, 2, 3 on 17 of 17 and rises at k = 1 on 6 only. A partner held in
//  one role resets: the like partner in A's start role raises survival at k = 1 on 13 of 17 (up to 0.357), the like
//  partners in the other two roles on 0. So the model's fear-beat meeting against the vacuum's environment does not act
//  as a reading: it pulls survival toward the mixed value, which reads as a rise only where the transfer had already
//  taken survival below it, and no curve saturates upward with rate.
//
// Depth L1: exact densities over Q(w), exact rational survivals. Deterministic: no random number; starts are
// E-MTH-0028's family.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { vacuumPairWord } from '@/code/measure/vacuum-pair-word'
import {
  cliffordGroup,
  type Mat3,
} from '@/code/measure/eisenstein-words'

const SIDE = 4
const BEATS = 48
const KS = Array.from({ length: 12 }, (_, i) => i + 1)

// ---- exact matrices over Q(w): entry (a + b w) / d ----

type EM = { n: number; a: bigint[]; b: bigint[]; d: bigint }

const babs = (x: bigint): bigint => (x < 0n ? -x : x)

function gcd(x: bigint, y: bigint): bigint {
  let p = babs(x)
  let q = babs(y)

  while (q !== 0n) {
    ;[p, q] = [q, p % q]
  }

  return p
}

function reduce(m: EM): EM {
  let g = m.d

  for (let i = 0; i < m.a.length && g !== 1n; i++) {
    g = gcd(gcd(g, m.a[i]!), m.b[i]!)
  }

  if (m.d < 0n) {
    g = -babs(g)
  }

  return g === 1n || g === 0n
    ? m
    : {
        n: m.n,
        a: m.a.map(x => x / g),
        b: m.b.map(x => x / g),
        d: m.d / g,
      }
}

const zeros = (n: number): EM => ({
  n,
  a: new Array<bigint>(n * n).fill(0n),
  b: new Array<bigint>(n * n).fill(0n),
  d: 1n,
})

function identity(n: number): EM {
  const m = zeros(n)

  for (let i = 0; i < n; i++) {
    m.a[i * n + i] = 1n
  }

  return m
}

function mul(x: EM, y: EM): EM {
  const n = x.n
  const o = zeros(n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const xa = x.a[i * n + k]!
      const xb = x.b[i * n + k]!

      if (xa === 0n && xb === 0n) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const ya = y.a[k * n + j]!
        const yb = y.b[k * n + j]!

        if (ya === 0n && yb === 0n) {
          continue
        }

        // (xa + xb w)(ya + yb w) = xa ya - xb yb + (xa yb + xb ya - xb yb) w
        o.a[i * n + j]! += xa * ya - xb * yb
        o.b[i * n + j]! += xa * yb + xb * ya - xb * yb
      }
    }
  }

  o.d = x.d * y.d

  return reduce(o)
}

// conjugate transpose: conj(a + b w) = (a - b) - b w
function dagger(x: EM): EM {
  const n = x.n
  const o = zeros(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      o.a[i * n + j] = x.a[j * n + i]! - x.b[j * n + i]!
      o.b[i * n + j] = -x.b[j * n + i]!
    }
  }

  o.d = x.d

  return o
}

function kron(x: EM, y: EM): EM {
  const n = x.n * y.n
  const o = zeros(n)

  for (let i = 0; i < x.n; i++) {
    for (let j = 0; j < x.n; j++) {
      for (let k = 0; k < y.n; k++) {
        for (let l = 0; l < y.n; l++) {
          const xa = x.a[i * x.n + j]!
          const xb = x.b[i * x.n + j]!
          const ya = y.a[k * y.n + l]!
          const yb = y.b[k * y.n + l]!
          const r = (i * y.n + k) * n + j * y.n + l

          o.a[r] = xa * ya - xb * yb
          o.b[r] = xa * yb + xb * ya - xb * yb
        }
      }
    }
  }

  o.d = x.d * y.d

  return reduce(o)
}

// p x + q y with rational weights p = pn / pd, q = qn / qd
function combine(
  x: EM,
  pn: bigint,
  pd: bigint,
  y: EM,
  qn: bigint,
  qd: bigint,
): EM {
  const o = zeros(x.n)
  const dx = pd * x.d
  const dy = qd * y.d

  for (let i = 0; i < x.a.length; i++) {
    o.a[i] = pn * x.a[i]! * dy + qn * y.a[i]! * dx
    o.b[i] = pn * x.b[i]! * dy + qn * y.b[i]! * dx
  }

  o.d = dx * dy

  return reduce(o)
}

function equal(x: EM, y: EM): boolean {
  return x.a.every(
    (v, i) =>
      v * y.d === y.a[i]! * x.d && x.b[i]! * y.d === y.b[i]! * x.d,
  )
}

function fromMat3(m: Mat3): EM {
  return reduce({
    n: 3,
    a: m.num.map(x => BigInt(x[0])),
    b: m.num.map(x => BigInt(x[1])),
    d: 3n ** BigInt(m.den3),
  })
}

const I3 = identity(3)

// the rule's like meeting on two roles, w U^dagger = w (P_sym + w^2 P_anti) = w P_sym + P_anti = K' 1 + X' SWAP with
// K' = (1 + w) / 2, X' = (w - 1) / 2 (its keep and exchange, E-QTM-0171 point 1)
function likeMeeting(): EM {
  const m = zeros(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = 3 * i + j
      const s = 3 * j + i

      m.a[r * 9 + r]! += 1n
      m.b[r * 9 + r]! += 1n
      m.a[s * 9 + r]! += -1n
      m.b[s * 9 + r]! += 1n
    }
  }

  m.d = 2n

  return reduce(m)
}

// the love-fear meeting in the rule's convention, V^dagger = 1 + (w^2 - 1) |Phi><Phi|, w^2 - 1 = -2 - w; over 3
function loveFearMeeting(): EM {
  const m = zeros(9)

  for (let r = 0; r < 9; r++) {
    m.a[r * 9 + r] = 3n
  }

  for (const r of [0, 4, 8]) {
    for (const s of [0, 4, 8]) {
      m.a[r * 9 + s]! += -2n
      m.b[r * 9 + s]! += -1n
    }
  }

  m.d = 3n

  return reduce(m)
}

// Kraus operators on A of a meeting W on (A, C) with C in role c, traced: K_j = <j|_C W |c>_C
function krausOf(w: EM, c: number): EM[] {
  return [0, 1, 2].map(j => {
    const k = zeros(3)

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        k.a[x * 3 + y] = w.a[(3 * x + j) * 9 + 3 * y + c]!
        k.b[x * 3 + y] = w.b[(3 * x + j) * 9 + 3 * y + c]!
      }
    }

    k.d = w.d

    return reduce(k)
  })
}

type Channel = { weight: [bigint, bigint]; kraus: EM[] }[]

function applyChannelA(rho: EM, ch: Channel): EM {
  let out: EM | undefined

  for (const part of ch) {
    for (const k of part.kraus) {
      const big = kron(k, I3)
      const t = mul(mul(big, rho), dagger(big))

      out = out
        ? combine(out, 1n, 1n, t, part.weight[0], part.weight[1])
        : combine(zeros(9), 0n, 1n, t, part.weight[0], part.weight[1])
    }
  }

  return out!
}

// the same channel on one role (for D1)
function applyChannelSingle(rho: EM, ch: Channel): EM {
  let out = zeros(3)

  for (const part of ch) {
    for (const k of part.kraus) {
      out = combine(
        out,
        1n,
        1n,
        mul(mul(k, rho), dagger(k)),
        part.weight[0],
        part.weight[1],
      )
    }
  }

  return out
}

function dephaseA(rho: EM): EM {
  const o: EM = { n: 9, a: [...rho.a], b: [...rho.b], d: rho.d }

  for (let r = 0; r < 9; r++) {
    for (let s = 0; s < 9; s++) {
      if (Math.floor(r / 3) !== Math.floor(s / 3)) {
        o.a[r * 9 + s] = 0n
        o.b[r * 9 + s] = 0n
      }
    }
  }

  return reduce(o)
}

type Reading =
  | { kind: 'none' }
  | { kind: 'ideal' }
  | { kind: 'channel'; channel: Channel }

type RunResult = {
  meanNum: bigint
  meanDen: bigint
  afterMeeting: [bigint, bigint][]
  traceOk: boolean
  rangeOk: boolean
}

// survival = rho[(0,1),(0,1)], real: b must be 0
function entry(rho: EM): [bigint, bigint] {
  return rho.d < 0n ? [-rho.a[10]!, -rho.d] : [rho.a[10]!, rho.d]
}

function runDrive(
  drives: EM[],
  driveBeats: ReadonlySet<number>,
  k: number,
  reading: Reading,
): RunResult {
  let rho = zeros(9)

  rho.a[10] = 1n

  let sumNum = 0n
  let sumDen = 1n
  let m = 0

  const out: RunResult = {
    meanNum: 0n,
    meanDen: 1n,
    afterMeeting: [],
    traceOk: true,
    rangeOk: true,
  }

  for (let t = 0; t < BEATS; t++) {
    if (driveBeats.has(t) && m >= drives.length) {
      out.traceOk = false
      break
    }

    if (driveBeats.has(t)) {
      const g = drives[m]!

      rho = mul(mul(g, rho), dagger(g))
      m++
    } else if (reading.kind !== 'none' && k > 0 && (t + 1) % k === 0) {
      rho =
        reading.kind === 'ideal'
          ? dephaseA(rho)
          : applyChannelA(rho, reading.channel)
    }

    let tr = 0n
    let trb = 0n

    for (let i = 0; i < 9; i++) {
      tr += rho.a[i * 10]!
      trb += rho.b[i * 10]!
    }

    out.traceOk &&= tr === rho.d && trb === 0n

    const [sn, sd] = entry(rho)

    out.rangeOk &&=
      rho.b[10] === 0n && sn * sd >= 0n && babs(sn) <= babs(sd)

    // sum += sn / sd
    const g = gcd(sumDen, sd)

    sumNum = sumNum * (sd / g) + sn * (sumDen / g)
    sumDen = (sumDen / g) * sd

    const h = gcd(sumNum, sumDen)

    sumNum /= h
    sumDen /= h

    if (driveBeats.has(t)) {
      out.afterMeeting.push([sn, sd])
    }
  }

  const g = gcd(sumNum, sumDen * BigInt(BEATS))

  out.meanNum = sumNum / g
  out.meanDen = (sumDen * BigInt(BEATS)) / g

  return out
}

const greater = (x: RunResult, y: RunResult): boolean =>
  x.meanNum * y.meanDen > y.meanNum * x.meanDen
const sameMean = (x: RunResult, y: RunResult): boolean =>
  x.meanNum * y.meanDen === y.meanNum * x.meanDen
const value = (x: RunResult): number =>
  Number(x.meanNum) / Number(x.meanDen)
const isFrac = (
  p: [bigint, bigint] | undefined,
  n: bigint,
  d: bigint,
) => p !== undefined && p[0] * d === n * p[1]

export default experiment({
  id: 'quantum/discrete-zeno-law',
  code: 'E-QTM-0172',
  title:
    "no discrete-time Zeno law from the fear beat: on the vacuum pair's role transfer (17 starts, 48 beats, exact over Q(w)) a meeting every k-th beat with a partner from the frame-invariant vacuum is the depolarizing channel (lambda 2/3 love-fear, 1/4 like, 18 of 18 matrix units), so it reads no basis and pulls the time-mean survival to 0.126 to 0.135 and 0.120 to 0.122 at k = 1 against 0.114 to 0.356 with none, partial: a rise above no meeting only on the 5 and 3 starts whose transfer had already taken survival below that, no curve non-increasing in k; the ideal reading saturates at one reading per drive interval (k = 1, 2, 3 equal on 17 of 17) and never freezes",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const group = cliffordGroup()
    const like = likeMeeting()
    const loveFear = loveFearMeeting()
    const kernels = { loveFear, like } as const
    const third: [bigint, bigint] = [1n, 3n]
    const one: [bigint, bigint] = [1n, 1n]
    const uniform = (w: EM): Channel =>
      [0, 1, 2].map(c => ({ weight: third, kraus: krausOf(w, c) }))
    const definite = (w: EM, c: number): Channel => [
      { weight: one, kraus: krausOf(w, c) },
    ]

    // I1: trace preservation of every Kraus set
    let krausOk = true

    for (const w of [like, loveFear]) {
      for (let c = 0; c < 3; c++) {
        let s = zeros(3)

        for (const k of krausOf(w, c)) {
          s = combine(s, 1n, 1n, mul(dagger(k), k), 1n, 1n)
        }

        krausOk &&= equal(s, I3)
      }
    }

    // D1, point 1: the uniform partner is the depolarizing channel
    let depolarizing = 0

    for (const [w, ln, ld] of [
      [loveFear, 2n, 3n],
      [like, 1n, 4n],
    ] as const) {
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          const e = zeros(3)

          e.a[x * 3 + y] = 1n

          const target = combine(
            e,
            ln,
            ld,
            x === y ? I3 : zeros(3),
            ld - ln,
            3n * ld,
          )

          depolarizing += equal(
            applyChannelSingle(e, uniform(w)),
            target,
          )
            ? 1
            : 0
        }
      }
    }

    // the drives: per start, the frame drive at each meeting, G_m = (C_m^dagger x 1) w U^dagger (C_m x 1)
    const drivesOf = (rs: readonly number[], count: number): EM[] => {
      const out: EM[] = []

      let c = I3

      for (let m = 0; m < count; m++) {
        if (m > 0) {
          c = mul(fromMat3(group[rs[m - 1]!]!), c)
        }

        const left = kron(dagger(c), I3)
        const right = kron(c, I3)

        out.push(mul(mul(left, like), right))
      }

      return out
    }

    // C1: the flat drive
    const flatBeats = new Set(
      Array.from({ length: BEATS / 3 }, (_, i) => 3 * i + 1),
    )
    const flatDrives = Array.from({ length: BEATS / 3 }, () => like)
    const flatNone = runDrive(flatDrives, flatBeats, 0, {
      kind: 'none',
    })
    const flatIdeal = runDrive(flatDrives, flatBeats, 1, {
      kind: 'ideal',
    })
    const c1 =
      isFrac(flatNone.afterMeeting[1], 1n, 4n) &&
      isFrac(flatIdeal.afterMeeting[1], 5n, 8n) &&
      isFrac(flatNone.afterMeeting[2], 1n, 1n) &&
      isFrac(flatIdeal.afterMeeting[2], 7n, 16n)

    log('checks')

    type Row = {
      name: string
      found: boolean
      meetings: number
      mapped: boolean
      instrument: boolean
      none: RunResult
      curves: Record<string, RunResult[]>
    }

    const readingNames = [
      'loveFear',
      'like',
      'ideal',
      'loveFear0',
      'loveFear1',
      'loveFear2',
      'like0',
      'like1',
      'like2',
    ] as const

    const readingOf = (
      name: (typeof readingNames)[number],
    ): Reading => {
      if (name === 'ideal') {
        return { kind: 'ideal' }
      }

      if (name === 'loveFear' || name === 'like') {
        return { kind: 'channel', channel: uniform(kernels[name]) }
      }

      const base = name.startsWith('loveFear') ? loveFear : like

      return {
        kind: 'channel',
        channel: definite(base, Number(name.slice(-1))),
      }
    }

    const rows: Row[] = startFamily(16).map(member => {
      const word = withStart(member, () =>
        vacuumPairWord(SIDE, BEATS, group),
      )
      const meetings = word.meets.length
      const mapped = word.rs.every(r => r >= 0)
      const drives =
        word.found && mapped && meetings > 0
          ? drivesOf(word.rs, meetings)
          : []
      const beats = new Set(word.meets)
      const none = runDrive(drives, beats, 0, { kind: 'none' })
      const curves: Record<string, RunResult[]> = {}

      let instrument = word.found && mapped && meetings === 16

      instrument &&= none.traceOk && none.rangeOk

      for (const name of readingNames) {
        const reading = readingOf(name)

        curves[name] = KS.map(k => {
          const r = runDrive(drives, beats, k, reading)

          instrument &&= r.traceOk && r.rangeOk

          return r
        })
      }

      log(member.name)

      return {
        name: member.name,
        found: word.found,
        meetings,
        mapped,
        instrument,
        none,
        curves,
      }
    })
    const n = rows.length
    const risesAt1 = (name: string): number =>
      rows.filter(r => greater(r.curves[name]![0]!, r.none)).length
    const anyRise = (name: string): number =>
      rows.filter(r => r.curves[name]!.some(x => greater(x, r.none)))
        .length
    const nonIncreasing = (name: string): number =>
      rows.filter(r =>
        r.curves[name]!.every(
          (x, i, a) => i === 0 || !greater(x, a[i - 1]!),
        ),
      ).length
    const idealSaturates = rows.filter(r => {
      const c = r.curves.ideal!

      return sameMean(c[0]!, c[1]!) && sameMean(c[1]!, c[2]!)
    }).length
    const g = {
      I1: krausOk && rows.every(r => r.instrument),
      C1: c1,
      D1: depolarizing === 18 && idealSaturates === n,
      H1: risesAt1('loveFear') === n && risesAt1('like') === n,
      P1: anyRise('loveFear') === 0 && anyRise('like') === 0,
    }
    const status =
      !g.I1 || !g.C1
        ? 'fail'
        : g.H1 && g.D1
          ? 'pass'
          : g.P1
            ? 'fail'
            : 'partial'
    const seconds = (Date.now() - started) / 1000
    const metrics: Record<string, number> = {
      starts: n,
      beats: BEATS,
      depolarizingUnits: depolarizing,
      idealSaturatesStarts: idealSaturates,
      flatNoneAfter2: 0.25,
      flatIdealAfter2: 0.625,
      seconds,
    }

    for (const name of readingNames) {
      metrics[`${name}_risesAtK1`] = risesAt1(name)
      metrics[`${name}_risesAtSomeK`] = anyRise(name)
      metrics[`${name}_nonIncreasingInK`] = nonIncreasing(name)
      metrics[`${name}_k1Min`] = Math.min(
        ...rows.map(r => value(r.curves[name]![0]!)),
      )

      metrics[`${name}_k1Max`] = Math.max(
        ...rows.map(r => value(r.curves[name]![0]!)),
      )
    }

    metrics.noneMin = Math.min(...rows.map(r => value(r.none)))
    metrics.noneMax = Math.max(...rows.map(r => value(r.none)))

    for (const [k, v] of Object.entries(g)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    const perStart = rows
      .map(
        r =>
          `${r.name}: none ${value(r.none).toFixed(4)}; ${readingNames
            .map(
              name =>
                `${name} ${r.curves[name]!.map(x => value(x).toFixed(4)).join(',')}`,
            )
            .join('; ')}`,
      )
      .join(' | ')

    return verdict({
      status,
      claim: `on the vacuum pair's role transfer (17 starts, 48 beats, exact over Q(w)) a fear-beat meeting every k-th beat with a partner from the frame-invariant vacuum raises the time-mean survival above no meeting at k = 1 on ${risesAt1('loveFear')} (love-fear) and ${risesAt1('like')} (like) of ${n} starts and at some k on ${anyRise('loveFear')} and ${anyRise('like')}; that meeting is the depolarizing channel (lambda 2/3, 1/4) on ${depolarizing} of 18 matrix units, a reading of no basis; the ideal reading saturates at one reading per drive interval (k = 1, 2, 3 equal) on ${idealSaturates} of ${n} and rises at k = 1 on ${risesAt1('ideal')}`,
      metrics,
      control: {
        flatIdealAfterSecond: c1 ? 0.625 : -1,
        flatNoneAfterSecond: 0.25,
        krausTracePreserving: krausOk ? 1 : 0,
      },
      notes: `L1. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(
          ', ',
        )}. Time-mean survival over ${BEATS} beats, k = 1..12: ${perStart}. ${seconds.toFixed(0)} s.`,
    })
  },
})
