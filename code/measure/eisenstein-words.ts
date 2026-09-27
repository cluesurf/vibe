// Exact two-qutrit states reached by words of link moves and meetings, in the ring Z[omega][1/6].
//
// Every amplitude is (a + b omega) / (2^k 3^m) with a, b integers: omega = e^(2 pi i / 3), omega^2 =
// -1 - omega. The generators, each exact:
//   the local Clifford group on a role (the links, E-QTM-0117), generated from the shift X, the clock
//     Z = diag(1, omega, omega^2), the phase gate S = diag(1, 1, omega) and the Fourier gate
//     F_jk = omega^(jk) / sqrt(-3) = -omega^(jk) (1 + 2 omega) / 3, since sqrt(-3) = 1 + 2 omega is an
//     Eisenstein integer of norm 3; up to a global phase this is the usual omega^(jk) / sqrt 3;
//   the swap phase U = P_sym + omega P_anti, U |ij> = ((1 + omega) |ij> + (1 - omega) |ji>) / 2, the like
//     meeting (code/rule/fear-weave swapPhase at 2 pi / 3; SWAP U gives the same Schmidt data);
//   the singlet phase V = 1 + (omega - 1) |Phi><Phi|, Phi = sum_j |jj> / sqrt 3, the love-fear meeting,
//     V_(jj),(kk) = delta_jk + (omega - 1) / 3.
// Numerators are kept in doubles and every product is checked against 2^52, so a result is exact or the
// code throws. The invariants of the first role's reduced density use bigints.

export type Eis = [number, number]

const LIMIT = 2 ** 52

function guard(x: number): number {
  if (!Number.isSafeInteger(x) || Math.abs(x) > LIMIT) {
    throw new Error(`eisenstein overflow ${x}`)
  }

  return x
}

// (a + b w)(c + d w) = ac - bd + (ad + bc - bd) w
export function eisMul(x: Eis, y: Eis): Eis {
  return [guard(x[0] * y[0] - x[1] * y[1]), guard(x[0] * y[1] + x[1] * y[0] - x[1] * y[1])]
}

// conj(a + b w) = a + b w^2 = (a - b) - b w
export function eisConj(x: Eis): Eis {
  return [x[0] - x[1], -x[1]]
}

export function eisNorm(x: Eis): number {
  return x[0] * x[0] - x[0] * x[1] + x[1] * x[1]
}

export function eisNormBig(a: bigint, b: bigint): bigint {
  return a * a - a * b + b * b
}

// the six units, omega^j and -omega^j
export const UNITS: readonly Eis[] = [
  [1, 0],
  [0, 1],
  [-1, -1],
  [-1, 0],
  [0, -1],
  [1, 1],
]

// A 3 x 3 matrix with entries num / 3^den3 (the Clifford group needs only powers of 3)
export type Mat3 = { num: Eis[]; den3: number }

function mat3Mul(p: Mat3, q: Mat3): Mat3 {
  const num: Eis[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s: Eis = [0, 0]

      for (let k = 0; k < 3; k++) {
        const t = eisMul(p.num[3 * i + k]!, q.num[3 * k + j]!)

        s = [s[0] + t[0], s[1] + t[1]]
      }

      num.push(s)
    }
  }

  return reduceMat3({ num, den3: p.den3 + q.den3 })
}

function reduceMat3(m: Mat3): Mat3 {
  let { num, den3 } = m

  while (den3 > 0 && num.every(x => x[0] % 3 === 0 && x[1] % 3 === 0)) {
    num = num.map(x => [x[0] / 3, x[1] / 3])
    den3--
  }

  return { num, den3 }
}

// a key for a matrix up to a global unit
function mat3Key(m: Mat3): string {
  const keys = UNITS.map(u => `${m.den3}|${m.num.map(x => eisMul(x, u).join(',')).join(';')}`)

  return keys.sort()[0]!
}

const W: Eis = [0, 1]
const W2: Eis = [-1, -1]
const ONE: Eis = [1, 0]
const ZERO: Eis = [0, 0]
const powW = (j: number): Eis => [ONE, W, W2][((j % 3) + 3) % 3]!

// the local Clifford group on one role, mod the six units: 216 elements (E-QTM-0117)
export function cliffordGroup(): Mat3[] {
  const x: Mat3 = { num: [ZERO, ZERO, ONE, ONE, ZERO, ZERO, ZERO, ONE, ZERO], den3: 0 }
  const z: Mat3 = { num: [ONE, ZERO, ZERO, ZERO, W, ZERO, ZERO, ZERO, W2], den3: 0 }
  const s: Mat3 = { num: [ONE, ZERO, ZERO, ZERO, ONE, ZERO, ZERO, ZERO, W], den3: 0 }
  // F = -omega^(jk) (1 + 2 omega) / 3
  const lambda: Eis = [1, 2]
  const f: Mat3 = {
    num: Array.from({ length: 9 }, (_, i) => {
      const t = eisMul(powW(Math.floor(i / 3) * (i % 3)), lambda)

      return [-t[0], -t[1]] as Eis
    }),
    den3: 1,
  }
  const gens = [x, z, s, f]
  const seen = new Map<string, Mat3>()
  const id: Mat3 = { num: [ONE, ZERO, ZERO, ZERO, ONE, ZERO, ZERO, ZERO, ONE], den3: 0 }
  let frontier = [id]

  seen.set(mat3Key(id), id)

  while (frontier.length > 0) {
    const next: Mat3[] = []

    for (const m of frontier) {
      for (const g of gens) {
        const p = mat3Mul(g, m)
        const key = mat3Key(p)

        if (!seen.has(key)) {
          seen.set(key, p)
          next.push(p)
        }
      }
    }

    frontier = next
  }

  return [...seen.values()]
}

// the complex value of a matrix entry, for checks against the floating kernels
export function eisValue(x: Eis, scale: number): [number, number] {
  // a + b w, w = -1/2 + i sqrt3/2
  return [(x[0] - x[1] / 2) / scale, ((x[1] * Math.sqrt(3)) / 2) / scale]
}

// A two-role state: nine amplitudes num_(3i + j) / (2^k2 3^m3)
export type State9 = { num: Eis[]; k2: number; m3: number }

export function reduceState(s: State9): State9 {
  let { num, k2, m3 } = s

  while (k2 > 0 && num.every(x => x[0] % 2 === 0 && x[1] % 2 === 0)) {
    num = num.map(x => [x[0] / 2, x[1] / 2])
    k2--
  }

  while (m3 > 0 && num.every(x => x[0] % 3 === 0 && x[1] % 3 === 0)) {
    num = num.map(x => [x[0] / 3, x[1] / 3])
    m3--
  }

  return { num, k2, m3 }
}

// the state up to a global unit, as a string key
export function stateKey(s: State9): string {
  let best = ''

  for (const u of UNITS) {
    const key = `${s.k2},${s.m3}|${s.num.map(x => eisMul(x, u).join(',')).join(';')}`

    if (best === '' || key < best) {
      best = key
    }
  }

  return best
}

// (D (x) 1) psi
export function applyFirst(d: Mat3, s: State9): State9 {
  const num: Eis[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let t: Eis = [0, 0]

      for (let q = 0; q < 3; q++) {
        const p = eisMul(d.num[3 * i + q]!, s.num[3 * q + j]!)

        t = [guard(t[0] + p[0]), guard(t[1] + p[1])]
      }

      num.push(t)
    }
  }

  return reduceState({ num, k2: s.k2, m3: s.m3 + d.den3 })
}

// the swap phase U = ((1 + w) 1 + (1 - w) SWAP) / 2
export function applySwapPhase(s: State9): State9 {
  const a: Eis = [1, 1]
  const b: Eis = [1, -1]
  const num: Eis[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const x = eisMul(a, s.num[3 * i + j]!)
      const y = eisMul(b, s.num[3 * j + i]!)

      num.push([guard(x[0] + y[0]), guard(x[1] + y[1])])
    }
  }

  return reduceState({ num, k2: s.k2 + 1, m3: s.m3 })
}

// the singlet phase V = 1 + (w - 1) |Phi><Phi|, times 3: 3 psi + (w - 1) (sum_k psi_kk) on each |jj>
export function applySingletPhase(s: State9): State9 {
  let trace: Eis = [0, 0]

  for (let k = 0; k < 3; k++) {
    const x = s.num[4 * k]!

    trace = [trace[0] + x[0], trace[1] + x[1]]
  }

  const add = eisMul([-1, 1], trace)
  const num = s.num.map((x, i) => {
    const three: Eis = [guard(3 * x[0]), guard(3 * x[1])]

    return (i % 4 === 0 ? [guard(three[0] + add[0]), guard(three[1] + add[1])] : three) as Eis
  })

  return reduceState({ num, k2: s.k2, m3: s.m3 + 1 })
}

// the reduced density's characteristic data as exact rationals over the common scale D = 2^k 3^m:
//   trace = sum N(num) / D^2 (must be 1), e2 = sum N(2 x 2 minors) / D^4, e3 = N(det) / D^6
export function schmidtInvariants(s: State9): { scale: bigint; normSum: bigint; e2Num: bigint; e3Num: bigint } {
  const re = s.num.map(x => BigInt(x[0]))
  const im = s.num.map(x => BigInt(x[1]))
  const scale = 2n ** BigInt(s.k2) * 3n ** BigInt(s.m3)
  let normSum = 0n

  for (let i = 0; i < 9; i++) {
    normSum += eisNormBig(re[i]!, im[i]!)
  }

  // Eisenstein bigint product
  const mul = (a: [bigint, bigint], b: [bigint, bigint]): [bigint, bigint] => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0] - a[1] * b[1]]
  const at = (i: number, j: number): [bigint, bigint] => [re[3 * i + j]!, im[3 * i + j]!]
  let e2Num = 0n

  for (const [r1, r2] of [
    [0, 1],
    [0, 2],
    [1, 2],
  ] as const) {
    for (const [c1, c2] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ] as const) {
      const p = mul(at(r1, c1), at(r2, c2))
      const q = mul(at(r1, c2), at(r2, c1))

      e2Num += eisNormBig(p[0] - q[0], p[1] - q[1])
    }
  }

  // det by the first row
  const minor = (r: number, c: number): [bigint, bigint] => {
    const rows = [0, 1, 2].filter(x => x !== r)
    const cols = [0, 1, 2].filter(x => x !== c)
    const p = mul(at(rows[0]!, cols[0]!), at(rows[1]!, cols[1]!))
    const q = mul(at(rows[0]!, cols[1]!), at(rows[1]!, cols[0]!))

    return [p[0] - q[0], p[1] - q[1]]
  }
  let det: [bigint, bigint] = [0n, 0n]

  for (let c = 0; c < 3; c++) {
    const t = mul(at(0, c), minor(0, c))
    const sgn = c % 2 === 0 ? 1n : -1n

    det = [det[0] + sgn * t[0], det[1] + sgn * t[1]]
  }

  return { scale, normSum, e2Num, e3Num: eisNormBig(det[0], det[1]) }
}

// the Schmidt weights (descending) from e2 and e3, the roots of x^3 - x^2 + e2 x - e3
export function schmidtWeights(e2: number, e3: number): number[] {
  // trigonometric roots of the depressed cubic
  const p = e2 - 1 / 3
  const q = -2 / 27 + e2 / 3 - e3
  const roots: number[] = []

  if (Math.abs(p) < 1e-15) {
    const r = Math.cbrt(-q)

    roots.push(r + 1 / 3, r + 1 / 3, r + 1 / 3)
  } else {
    const m = 2 * Math.sqrt(Math.max(0, -p / 3))
    const arg = Math.max(-1, Math.min(1, ((3 * q) / (p * m)) ))
    const theta = Math.acos(arg) / 3

    for (let k = 0; k < 3; k++) {
      roots.push(m * Math.cos(theta - (2 * Math.PI * k) / 3) + 1 / 3)
    }
  }

  return roots.sort((x, y) => y - x)
}

// the twelve stabilizer states of one role, as Eisenstein columns with a common 3-power (the images of |0>)
export function stabilizerStates(group: readonly Mat3[]): { num: Eis[]; den3: number }[] {
  const seen = new Map<string, { num: Eis[]; den3: number }>()

  for (const g of group) {
    const col = { num: [g.num[0]!, g.num[3]!, g.num[6]!], den3: g.den3 }
    const key = UNITS.map(u => `${col.den3}|${col.num.map(x => eisMul(x, u).join(',')).join(';')}`).sort()[0]!

    if (!seen.has(key)) {
      seen.set(key, col)
    }
  }

  return [...seen.values()]
}

// HONG-OU-MANDEL ON LINE WORDS. One husk line, docks 0 .. width - 1 where a coin may sit, T beats. A word
// says, for each (beat, dock), whether the fear coin C = [[a, b], [b, a]], 2a = 1 + w, 2b = 1 - w, acts on
// the dock's (right-going, left-going) pair before the stream copies every right-going slot one dock right
// and every left-going slot one dock left. Vibe A starts right-going at dock xa, vibe B left-going at
// xa + sep (sep even, or they never share a dock). The output amplitudes u (from A) and w (from B) are exact
// Eisenstein numerators over 2^k. For bosons the chance that the two leave in modes j != q is
// |u_j w_q + u_q w_j|^2 summed over j < q; distinguishable vibes give |u_j w_q|^2 + |u_q w_j|^2.
//   fine dip: the bosonic sum is 0 while the distinguishable one is not
//   coarse dip: the output modes split into two groups with no bosonic weight across them and some
//     distinguishable weight across: exactly when every active mode has |w_j| = |u_j| and w_j / u_j is one of
//     two opposite values r, -r, both present (derived in E-QTM-0131)
export type LineHom = { runs: number; fineDips: number; coarseDips: number; bestVisibility: number; coarseExample: string }

export function lineWordHom(input: { width: number; beats: number; starts: readonly (readonly [number, number])[] }): LineHom {
  const { width, beats } = input
  const off = beats + 1
  const span = width + 2 * beats + 2
  const modes = 2 * span
  const A: Eis = [1, 1]
  const B: Eis = [1, -1]
  const out: LineHom = { runs: 0, fineDips: 0, coarseDips: 0, bestVisibility: 0, coarseExample: '' }
  const ampA = new Float64Array(2 * modes)
  const ampB = new Float64Array(2 * modes)
  const next = new Float64Array(2 * modes)

  const run = (word: number, start: number, amp: Float64Array): number => {
    amp.fill(0)
    amp[2 * start] = 1
    let k = 0

    for (let t = 0; t < beats; t++) {
      const row = (word >> (t * width)) & ((1 << width) - 1)

      if (row !== 0) {
        for (let i = 0; i < 2 * modes; i++) {
          amp[i] = 2 * (amp[i] ?? 0)
        }

        for (let x = 0; x < width; x++) {
          if ((row >> x) & 1) {
            const r = 2 * (x + off)
            const l = r + 1
            const rv: Eis = [(amp[2 * r] ?? 0) / 2, (amp[2 * r + 1] ?? 0) / 2]
            const lv: Eis = [(amp[2 * l] ?? 0) / 2, (amp[2 * l + 1] ?? 0) / 2]
            const ar = eisMul(A, rv)
            const bl = eisMul(B, lv)
            const br = eisMul(B, rv)
            const al = eisMul(A, lv)

            amp[2 * r] = ar[0] + bl[0]
            amp[2 * r + 1] = ar[1] + bl[1]
            amp[2 * l] = br[0] + al[0]
            amp[2 * l + 1] = br[1] + al[1]
          }
        }

        k++
      }

      next.fill(0)

      for (let p = 0; p < span; p++) {
        if (p + 1 < span) {
          next[4 * (p + 1)] = amp[4 * p] ?? 0
          next[4 * (p + 1) + 1] = amp[4 * p + 1] ?? 0
        }

        if (p - 1 >= 0) {
          next[4 * (p - 1) + 2] = amp[4 * p + 2] ?? 0
          next[4 * (p - 1) + 3] = amp[4 * p + 3] ?? 0
        }
      }

      amp.set(next)
    }

    return k
  }

  for (let word = 1; word < 2 ** (width * beats); word++) {
    for (const [xa, sep] of input.starts) {
      out.runs++

      const ka = run(word, 2 * (off + xa), ampA)
      const kb = run(word, 2 * (off + xa + sep) + 1, ampB)
      const k = Math.max(ka, kb)
      const sa = 2 ** (k - ka)
      const sb = 2 ** (k - kb)
      const u: Eis[] = []
      const w: Eis[] = []

      for (let j = 0; j < modes; j++) {
        u.push([(ampA[2 * j] ?? 0) * sa, (ampA[2 * j + 1] ?? 0) * sa])
        w.push([(ampB[2 * j] ?? 0) * sb, (ampB[2 * j + 1] ?? 0) * sb])
      }

      const active: number[] = []

      for (let j = 0; j < modes; j++) {
        if (eisNorm(u[j]!) !== 0 || eisNorm(w[j]!) !== 0) {
          active.push(j)
        }
      }

      let boson = 0
      let dist = 0

      for (let x = 0; x < active.length; x++) {
        for (let y = x + 1; y < active.length; y++) {
          const j = active[x]!
          const q = active[y]!
          const p1 = eisMul(u[j]!, w[q]!)
          const p2 = eisMul(u[q]!, w[j]!)

          boson += eisNorm([p1[0] + p2[0], p1[1] + p2[1]])
          dist += eisNorm(p1) + eisNorm(p2)
        }
      }

      if (dist > 0 && boson === 0) {
        out.fineDips++
      }

      if (dist > 0) {
        out.bestVisibility = Math.max(out.bestVisibility, 1 - boson / dist)
      }

      // coarse: |w_j| = |u_j| and w_j conj(u_j) / N(u_j) in {r, -r}, both signs present
      let ratio: Eis | undefined
      let ratioNorm = 0
      let ok = true
      let opposite = 0

      for (const j of active) {
        const nu = eisNorm(u[j]!)

        if (nu !== eisNorm(w[j]!)) {
          ok = false
          break
        }

        const c = eisMul(w[j]!, eisConj(u[j]!))

        if (ratio === undefined) {
          ratio = c
          ratioNorm = nu
          continue
        }

        const same = c[0] * ratioNorm === ratio[0] * nu && c[1] * ratioNorm === ratio[1] * nu
        const flip = c[0] * ratioNorm === -ratio[0] * nu && c[1] * ratioNorm === -ratio[1] * nu

        if (!same && !flip) {
          ok = false
          break
        }

        opposite += flip ? 1 : 0
      }

      if (ok && opposite > 0) {
        out.coarseDips++
        out.coarseExample = out.coarseExample || `word ${word}, start ${xa}, separation ${sep}`
      }
    }
  }

  return out
}

// |a> (x) |b> as a State9 (both stabilizer columns)
export function productState(a: { num: Eis[]; den3: number }, b: { num: Eis[]; den3: number }): State9 {
  const num: Eis[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      num.push(eisMul(a.num[i]!, b.num[j]!))
    }
  }

  return reduceState({ num, k2: 0, m3: a.den3 + b.den3 })
}
