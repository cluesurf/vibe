// Measurement for the string held at its ends (E-SPN-0081, 0082): the one-beat operator of n LOCKED STAND-IN tokens
// with reels (code/rule/reel-string-line) on an infinite husk line at total momentum K, in relative coordinates.
// Floats stand for the exact numbers; the experiments check the exact rule against them.
//
// Coordinates: token 0 at x_0, token t at x_0 + d_t. A configuration is (d, r): the relative positions and the
// reels. The flux is the Gauss flux with none at infinity, so the string count l is a function of d, and the
// sector reached from contact is sum r = -2 l, every reel in -D .. D. psi(x_0, d, r, j) = e^(i K x_0) phi(d, r, j).
//
// The readings are code/measure/flux-store-bloch's, with the reels as spectators: the lightest level (E-SPN-0076's
// definition, unchanged), the role-symmetric (spin three halves) share, the meeting energy, and the branch reader,
// which here reads a level's single-token momenta straight from its relative coordinates (a K level's momenta obey
// k_0 = K - sum k_t, so the ring's Fourier transform reduces to one sum over d; it equals the ring reading of
// flux-store-bloch on any ring with L > 2 S).

import { type Convention, type Vibe } from '@/code/rule/locked-token-line'
import { unitaryEigen, type Vec } from '@/code/measure/quantum-ladder'
import { lineString } from '@/code/measure/flux-store-bloch'

export type ReelBlochSpec = {
  readonly kinds: readonly Vibe[]
  readonly convention: Convention
  readonly unlike: 'knit' | 'dock'
  readonly depth: number
  readonly cost: number
  readonly root: number
  readonly labels: 2 | 3
  readonly meet?: boolean
}

type C = [number, number]

const SQ = Math.sqrt(3) / 2
const OMEGA: C = [-0.5, SQ]
const A: C = [0.25, SQ / 2]
const B: C = [0.75, -SQ / 2]
const cmul = (x: C, y: C): C => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const chargeOf = (kind: Vibe): number => (kind === 'love' ? 1 : -1)
const mod3 = (a: number): number => ((a % 3) + 3) % 3

// the largest span the reels allow: sum r = -2 l, every r >= -D
export const maxSpan = (s: ReelBlochSpec): number => Math.floor((s.kinds.length * s.depth) / 2)

export type ReelBloch = {
  readonly spec: ReelBlochSpec
  readonly n: number
  readonly q: number
  readonly labelCount: number
  readonly span: number
  readonly positions: readonly (readonly number[])[]
  readonly reels: readonly (readonly number[])[]
  readonly strings: Int32Array
  readonly size: number
  index(config: number, labels: number): number
  configOf(d: readonly number[], r: readonly number[]): number
}

export function reelBlochSpace(spec: ReelBlochSpec): ReelBloch {
  const n = spec.kinds.length
  const q = spec.labels
  const S = maxSpan(spec)
  const D = spec.depth
  const V = 2 * D + 1
  const W = 2 * S + 1
  const positions: number[][] = []
  const reels: number[][] = []
  const strings: number[] = []
  const lookup = new Map<number, number>()
  const keyOf = (d: readonly number[], r: readonly number[]): number => {
    let k = 0

    for (let t = 1; t < n; t++) k = k * W + (d[t]! + S)
    for (let t = 0; t < n; t++) k = k * V + (r[t]! + D)

    return k
  }
  const d = new Array<number>(n).fill(0)
  const r = new Array<number>(n).fill(0)
  const walkReels = (t: number, need: number, l: number): void => {
    if (t === n) {
      if (need !== 0) return

      lookup.set(keyOf(d, r), positions.length)
      positions.push(d.slice())
      reels.push(r.slice())
      strings.push(l)

      return
    }

    for (let v = -D; v <= D; v++) {
      r[t] = v
      walkReels(t + 1, need - v, l)
    }
  }
  const walkPositions = (t: number): void => {
    if (t === n) {
      const lo = Math.min(...d)
      const hi = Math.max(...d)

      if (hi - lo > S) return

      const l = lineString(d, spec.kinds)

      if (2 * l > n * D) return

      walkReels(0, -2 * l, l)

      return
    }

    for (let v = -S; v <= S; v++) {
      d[t] = v
      walkPositions(t + 1)
    }
  }

  walkPositions(1)

  const labelCount = q ** n

  return {
    spec,
    n,
    q,
    labelCount,
    span: S,
    positions,
    reels,
    strings: Int32Array.from(strings),
    size: positions.length * labelCount,
    index: (c, lab) => c * labelCount + lab,
    configOf: (dd, rr) => {
      for (let t = 1; t < n; t++) if (Math.abs(dd[t]!) > S) return -1

      return lookup.get(keyOf(dd, rr)) ?? -1
    },
  }
}

const digitsOf = (code: number, n: number, q: number): number[] => {
  const out = new Array<number>(n)
  let c = code

  for (let t = n - 1; t >= 0; t--) {
    out[t] = c % q
    c = Math.floor(c / q)
  }

  return out
}

const codeOf = (j: readonly number[], q: number): number => j.reduce((a, v) => a * q + v, 0)

export type Sparse = { idx: number[]; re: number[]; im: number[] }

const stepOf = (spec: ReelBlochSpec, t: number, lab: number): number => (lab === 2 ? 0 : (spec.kinds[t] === 'fear' && spec.convention === 'Cprime' ? -1 : 1) * (lab === 0 ? 1 : -1))

// the stream with the per-link groups on the line: returns the new positions, reels and labels
export function reelStreamLine(spec: ReelBlochSpec, d: readonly number[], r: readonly number[], j: readonly number[]): { y: number[]; r: number[]; j: number[]; moved: boolean[] } {
  const n = spec.kinds.length
  const D = spec.depth
  const steps = j.map((lab, t) => stepOf(spec, t, lab))
  const crossing = steps.map((st, t) => (st === 1 ? d[t]! : st === -1 ? d[t]! - 1 : Number.NaN))
  const y = d.slice()
  const nr = r.slice()
  const nj = j.slice()
  const moved = new Array<boolean>(n).fill(false)
  const done = new Array<boolean>(n).fill(false)
  // the Gauss flux on link x (dock x to x + 1), none at infinity
  const fluxAt = (x: number): number => {
    let c = 0

    for (let u = 0; u < n; u++) if (d[u]! <= x) c += chargeOf(spec.kinds[u]!)

    return mod3(c)
  }

  for (let t = 0; t < n; t++) {
    if (done[t] || Number.isNaN(crossing[t]!)) continue

    const link = crossing[t]!
    const group: number[] = []

    for (let u = 0; u < n; u++) if (crossing[u] === link) group.push(u)

    group.forEach(u => {
      done[u] = true
    })

    const f = fluxAt(link)
    let fNew = f

    for (const u of group) fNew = mod3(fNew - steps[u]! * chargeOf(spec.kinds[u]!))

    const delta = (fNew === 0 ? 0 : 1) - (f === 0 ? 0 : 1)
    const k = group.length
    const whole = (2 * delta) % k === 0
    const share = whole ? (2 * delta) / k : 0
    const fits = whole && group.every(u => r[u]! - share >= -D && r[u]! - share <= D)

    if (!fits) {
      for (const u of group) nj[u] = j[u] === 2 ? 2 : 1 - j[u]!

      continue
    }

    for (const u of group) {
      y[u] = d[u]! + steps[u]!
      nr[u] = r[u]! - share
      moved[u] = true
    }
  }

  return { y, r: nr, j: nj, moved }
}

// the image of one basis vector under one beat
export function reelBlochColumn(b: ReelBloch, K: number, col: number): Sparse {
  const { spec, n, q } = b
  const c = Math.floor(col / b.labelCount)
  const d = b.positions[c]!
  // keyed by the full index (configuration, labels): the like meeting's swap exchanges reels as well
  let vec = new Map<number, C>()
  const t0 = (-2 * Math.PI * ((spec.cost * b.strings[c]!) % spec.root)) / spec.root

  vec.set(col, [Math.cos(t0), Math.sin(t0)])

  const addTo = (m: Map<number, C>, key: number, v: C): void => {
    const o = m.get(key)

    m.set(key, o ? [o[0] + v[0], o[1] + v[1]] : v)
  }

  if (spec.meet !== false) {
    for (let a0 = 0; a0 < n; a0++) {
      for (let b0 = a0 + 1; b0 < n; b0++) {
        if (d[a0] !== d[b0]) continue

        const like = spec.kinds[a0] === spec.kinds[b0]

        if (!like && spec.unlike === 'knit') continue

        const next = new Map<number, C>()

        for (const [key, v] of vec) {
          const kc = Math.floor(key / b.labelCount)
          const lab = key % b.labelCount
          const j = digitsOf(lab, n, q)

          if (like) {
            const sw = j.slice()
            const sr = b.reels[kc]!.slice()

            sw[a0] = j[b0]!
            sw[b0] = j[a0]!
            sr[a0] = b.reels[kc]![b0]!
            sr[b0] = b.reels[kc]![a0]!
            addTo(next, key, cmul([(1 + OMEGA[0]) / 2, OMEGA[1] / 2], v))
            addTo(next, b.index(b.configOf(d, sr), codeOf(sw, q)), cmul([(1 - OMEGA[0]) / 2, -OMEGA[1] / 2], v))
          } else {
            addTo(next, key, v)

            if (j[a0] === j[b0]) {
              for (let k = 0; k < q; k++) {
                const t = j.slice()

                t[a0] = k
                t[b0] = k
                addTo(next, b.index(kc, codeOf(t, q)), cmul([(OMEGA[0] - 1) / 3, OMEGA[1] / 3], v))
              }
            }
          }
        }

        vec = next
      }
    }
  }

  for (let t = 0; t < n; t++) {
    const next = new Map<number, C>()

    for (const [key, v] of vec) {
      const kc = Math.floor(key / b.labelCount)
      const j = digitsOf(key % b.labelCount, n, q)

      if (j[t] === 2) {
        addTo(next, key, v)
        continue
      }

      const o = j.slice()

      o[t] = 1 - j[t]!
      addTo(next, key, cmul(A, v))
      addTo(next, b.index(kc, codeOf(o, q)), cmul(B, v))
    }

    vec = next
  }

  const out: Sparse = { idx: [], re: [], im: [] }

  for (const [key, v] of vec) {
    if (v[0] === 0 && v[1] === 0) continue

    const j = digitsOf(key % b.labelCount, n, q)
    const s = reelStreamLine(spec, d, b.reels[Math.floor(key / b.labelCount)]!, j)
    const nd = s.y.map(x => x - s.y[0]!)
    const nc = b.configOf(nd, s.r)

    if (nc < 0) throw new Error('reel-string-bloch: an image left the configuration list')

    const shift = s.y[0]! - d[0]!
    const ph = cmul([Math.cos(-K * shift), Math.sin(-K * shift)], v)

    out.idx.push(b.index(nc, codeOf(s.j, q)))
    out.re.push(ph[0])
    out.im.push(ph[1])
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the exchange-antisymmetric subspace of three identical tokens (positions, reels and labels together)

const PERMS3 = [
  [0, 1, 2],
  [1, 0, 2],
  [2, 1, 0],
  [0, 2, 1],
  [1, 2, 0],
  [2, 0, 1],
]
const SIGNS3 = [1, -1, -1, -1, 1, 1]

export type Subspace = { vectors: Sparse[]; owner: Int32Array; coefficient: Float64Array; coefficientIm: Float64Array }

export function reelSubspace(b: ReelBloch, K: number): Subspace {
  const identical = b.spec.kinds.every(k => k === b.spec.kinds[0])
  const owner = new Int32Array(b.size).fill(-1)
  const coefficient = new Float64Array(b.size)
  const coefficientIm = new Float64Array(b.size)
  const vectors: Sparse[] = []

  if (!identical) {
    for (let i = 0; i < b.size; i++) {
      owner[i] = i
      coefficient[i] = 1
      vectors.push({ idx: [i], re: [1], im: [0] })
    }

    return { vectors, owner, coefficient, coefficientIm }
  }

  if (b.n !== 3) throw new Error('reel-string-bloch: antisymmetrizer written for three identical tokens')

  const seen = new Uint8Array(b.size)

  for (let i = 0; i < b.size; i++) {
    if (seen[i]) continue

    const c = Math.floor(i / b.labelCount)
    const j = digitsOf(i % b.labelCount, b.n, b.q)
    const d = b.positions[c]!
    const rl = b.reels[c]!
    const acc = new Map<number, C>()

    PERMS3.forEach((p, k) => {
      const nd = p.map(t => d[t]! - d[p[0]!]!)
      const nr = p.map(t => rl[t]!)
      const nj = p.map(t => j[t]!)
      const at = b.index(b.configOf(nd, nr), codeOf(nj, b.q))
      const t = -K * d[p[0]!]!
      const v: C = [SIGNS3[k]! * Math.cos(t), SIGNS3[k]! * Math.sin(t)]
      const o = acc.get(at)

      seen[at] = 1
      acc.set(at, o ? [o[0] + v[0], o[1] + v[1]] : v)
    })

    let norm = 0

    for (const v of acc.values()) norm += v[0] * v[0] + v[1] * v[1]

    if (norm < 1e-18) continue

    const f = 1 / Math.sqrt(norm)
    const vec: Sparse = { idx: [], re: [], im: [] }

    for (const [at, v] of acc) {
      if (v[0] * v[0] + v[1] * v[1] < 1e-24) continue

      vec.idx.push(at)
      vec.re.push(v[0] * f)
      vec.im.push(v[1] * f)
      owner[at] = vectors.length
      coefficient[at] = v[0] * f
      coefficientIm[at] = v[1] * f
    }

    vectors.push(vec)
  }

  return { vectors, owner, coefficient, coefficientIm }
}

export type Reduced = { dim: number; re: Float64Array; im: Float64Array; leak: number; unitarity: number }

export function reelReducedBeat(b: ReelBloch, sub: Subspace, K: number): Reduced {
  const dim = sub.vectors.length
  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)
  let leak = 0
  let unitarity = 0

  sub.vectors.forEach((v, col) => {
    const acc = new Map<number, C>()

    v.idx.forEach((i, k) => {
      const img = reelBlochColumn(b, K, i)
      const cv: C = [v.re[k]!, v.im[k]!]

      img.idx.forEach((o, m) => {
        const w = cmul(cv, [img.re[m]!, img.im[m]!])
        const prev = acc.get(o)

        acc.set(o, prev ? [prev[0] + w[0], prev[1] + w[1]] : w)
      })
    })

    let total = 0
    let inside = 0

    for (const [o, w] of acc) {
      total += w[0] * w[0] + w[1] * w[1]

      const a = sub.owner[o]!

      if (a < 0) continue

      const cr = sub.coefficient[o]!
      const ci = sub.coefficientIm[o]!

      re[a * dim + col] = re[a * dim + col]! + cr * w[0] + ci * w[1]
      im[a * dim + col] = im[a * dim + col]! + cr * w[1] - ci * w[0]
    }

    for (let a = 0; a < dim; a++) inside += re[a * dim + col]! ** 2 + im[a * dim + col]! ** 2

    leak = Math.max(leak, total - inside)
    unitarity = Math.max(unitarity, Math.abs(total - 1))
  })

  return { dim, re, im, leak, unitarity }
}

export type Level = { energy: number; vector: Vec }

export function reelLevels(b: ReelBloch, sub: Subspace, red: Reduced): { levels: Level[]; residual: number } {
  const eig = unitaryEigen(red.dim, red.re, red.im)
  const out: Level[] = eig.phases.map((ph, k) => {
    const c = eig.vectors[k]!
    const v = { re: new Float64Array(b.size), im: new Float64Array(b.size) }

    sub.vectors.forEach((bv, a) => {
      const cr = c.re[a]!
      const ci = c.im[a]!

      if (cr === 0 && ci === 0) return

      bv.idx.forEach((i, m) => {
        v.re[i] = v.re[i]! + cr * bv.re[m]! - ci * bv.im[m]!
        v.im[i] = v.im[i]! + cr * bv.im[m]! + ci * bv.re[m]!
      })
    })

    let e = -ph

    while (e <= -Math.PI) e += 2 * Math.PI
    while (e > Math.PI) e -= 2 * Math.PI

    return { energy: e, vector: v }
  })

  return { levels: out, residual: eig.residual }
}

export function reelSpectrumAt(spec: ReelBlochSpec, K: number): { bloch: ReelBloch; dim: number; leak: number; unitarity: number; residual: number; all: Level[] } {
  const b = reelBlochSpace(spec)
  const sub = reelSubspace(b, K)
  const red = reelReducedBeat(b, sub, K)
  const ls = reelLevels(b, sub, red)

  return { bloch: b, dim: red.dim, leak: red.leak, unitarity: red.unitarity, residual: ls.residual, all: ls.levels }
}

// ---------------------------------------------------------------------------------------------------------
// readings of a level

export function weightOf(v: Vec): number {
  let s = 0

  for (let i = 0; i < v.re.length; i++) s += v.re[i]! ** 2 + v.im[i]! ** 2

  return s
}

export function reelStringMoments(b: ReelBloch, v: Vec): { mean: number; max: number } {
  let w = 0
  let m1 = 0
  let max = 0

  for (let i = 0; i < b.size; i++) {
    const p = v.re[i]! ** 2 + v.im[i]! ** 2

    if (p === 0) continue

    const l = b.strings[Math.floor(i / b.labelCount)]!

    w += p
    m1 += p * l

    if (p > 1e-12) max = Math.max(max, l)
  }

  return { mean: m1 / w, max }
}

// the role-symmetric ([3], spin three halves) share: labels symmetrized at fixed positions and reels
export function reelQuartetShare(b: ReelBloch, v: Vec): number {
  let s = 0

  for (let c = 0; c < b.positions.length; c++) {
    for (let lab = 0; lab < b.labelCount; lab++) {
      const j = digitsOf(lab, b.n, b.q)
      let sr = 0
      let si = 0

      for (const p of PERMS3) {
        const k = b.index(c, codeOf(p.map(t => j[t]!), b.q))

        sr += v.re[k]! / 6
        si += v.im[k]! / 6
      }

      s += sr * sr + si * si
    }
  }

  return s / weightOf(v)
}

// the meetings' energy, as flux-store-bloch contactEnergy (like pairs: -2 pi / 3 times the exchange-antisymmetric
// weight on shared docks, the exchange swapping role and reel together as the meeting does)
export function reelContactEnergy(b: ReelBloch, v: Vec): number {
  const { n, q, spec } = b

  if (spec.meet === false) return 0

  let e = 0

  for (let a = 0; a < n; a++) {
    for (let c = a + 1; c < n; c++) {
      const like = spec.kinds[a] === spec.kinds[c]

      if (!like && spec.unlike === 'knit') continue

      for (let ci = 0; ci < b.positions.length; ci++) {
        const d = b.positions[ci]!

        if (d[a] !== d[c]) continue

        for (let lab = 0; lab < b.labelCount; lab++) {
          const j = digitsOf(lab, n, q)

          if (like) {
            const sw = j.slice()
            const sr = b.reels[ci]!.slice()

            sw[a] = j[c]!
            sw[c] = j[a]!
            sr[a] = b.reels[ci]![c]!
            sr[c] = b.reels[ci]![a]!

            const i1 = b.index(ci, lab)
            const i2 = b.index(b.configOf(d, sr), codeOf(sw, q))
            const xr = (v.re[i1]! - v.re[i2]!) / 2
            const xi = (v.im[i1]! - v.im[i2]!) / 2

            e += ((-2 * Math.PI) / 3) * (xr * xr + xi * xi)
          } else if (j[a] === 0 && j[c] === 0) {
            let sr = 0
            let si = 0

            for (let k = 0; k < q; k++) {
              const t = j.slice()

              t[a] = k
              t[c] = k

              const i = b.index(ci, codeOf(t, q))

              sr += v.re[i]!
              si += v.im[i]!
            }

            e += ((-2 * Math.PI) / 3) * ((sr * sr + si * si) / 3)
          }
        }
      }
    }
  }

  return e / weightOf(v)
}

// the weight of a level by how many like tokens share a dock: [none share, exactly one pair, all three on one dock]
export function dockSharing(b: ReelBloch, v: Vec): { apart: number; pair: number; triple: number } {
  let apart = 0
  let pair = 0
  let triple = 0

  for (let i = 0; i < b.size; i++) {
    const p = v.re[i]! ** 2 + v.im[i]! ** 2

    if (p === 0) continue

    const d = b.positions[Math.floor(i / b.labelCount)]!
    let shared = 0

    for (let a = 0; a < d.length; a++) for (let c = a + 1; c < d.length; c++) if (d[a] === d[c]) shared++

    if (shared === 0) apart += p
    else if (shared === 1) pair += p
    else triple += p
  }

  const w = apart + pair + triple

  return { apart: apart / w, pair: pair / w, triple: triple / w }
}

// the meetings' energy read PER DOCK (a reading added after E-SPN-0082's first run, disclosed): the meetings on one
// dock multiply to omega^(number of like pairs there), read at the principal value of that product, so a lone pair
// is -2 pi / 3 and three loves on one dock (omega^3 = 1) are 0; for antisymmetric three-love states
export function dockContactEnergy(b: ReelBloch, v: Vec): number {
  return ((-2 * Math.PI) / 3) * dockSharing(b, v).pair
}

// the particle-branch vector and energy of one token at momentum k (U(k) = S(k) C), as flux-store-bloch
function branch(spec: ReelBlochSpec, t: number, k: number): { vec: C[]; energy: number } {
  const backward = spec.kinds[t] === 'fear' && spec.convention === 'Cprime'
  const s0: C = backward ? [Math.cos(k), Math.sin(k)] : [Math.cos(-k), Math.sin(-k)]
  const s1: C = [s0[0], -s0[1]]
  const m = [cmul(s0, A), cmul(s0, B), cmul(s1, B), cmul(s1, A)]
  const tr: C = [m[0]![0] + m[3]![0], m[0]![1] + m[3]![1]]
  const x = cmul(m[0]!, m[3]!)
  const y = cmul(m[1]!, m[2]!)
  const det: C = [x[0] - y[0], x[1] - y[1]]
  const t2 = cmul(tr, tr)
  const disc: C = [t2[0] - 4 * det[0], t2[1] - 4 * det[1]]
  const md = Math.hypot(disc[0], disc[1])
  const ag = Math.atan2(disc[1], disc[0])
  const root: C = [Math.sqrt(md) * Math.cos(ag / 2), Math.sqrt(md) * Math.sin(ag / 2)]
  const candidates: C[] = [
    [(tr[0] + root[0]) / 2, (tr[1] + root[1]) / 2],
    [(tr[0] - root[0]) / 2, (tr[1] - root[1]) / 2],
  ]
  const energyOf = (l: C): number => -Math.atan2(l[1], l[0])
  const lam = candidates.find(l => energyOf(l) > -1e-9 && energyOf(l) < Math.PI / 3 + 1e-9) ?? candidates[0]!
  let e0: C = m[1]!
  let e1: C = [lam[0] - m[0]![0], lam[1] - m[0]![1]]

  if (Math.hypot(...e0) + Math.hypot(...e1) < 1e-9) {
    e0 = [lam[0] - m[3]![0], lam[1] - m[3]![1]]
    e1 = m[2]!
  }

  const nrm = Math.sqrt(e0[0] ** 2 + e0[1] ** 2 + e1[0] ** 2 + e1[1] ** 2)

  return {
    vec: [
      [e0[0] / nrm, e0[1] / nrm],
      [e1[0] / nrm, e1[1] / nrm],
    ],
    energy: Math.max(0, energyOf(lam)),
  }
}

export type BranchReading = { counts: number[]; even: number; kinetic: number }

// THE BRANCH READER at K = 0 on a momentum grid of L (L > 2 S): each token's momentum k_t = 2 pi m_t / L for t >= 1,
// k_0 = -sum k_t; the amplitude at those momenta is sum over configurations of phi(d, r, j) e^(-i sum k_t d_t), the
// reels spectators; each token read in its particle branch B at k or antiparticle branch A (the doubler of B at
// k + pi), as flux-store-bloch branchReader
export function reelBranchReader(b: ReelBloch, L: number): (v: Vec) => BranchReading {
  const { n, q, spec } = b

  if (L <= 2 * b.span) throw new Error('reel-string-bloch: the momentum grid aliases the relative coordinates')

  const R = b.labelCount
  const tables = spec.kinds.map((_, t) =>
    Array.from({ length: L }, (_, m) => {
      const r = branch(spec, t, (2 * Math.PI * m) / L)
      const vb = r.vec.slice()
      const va: C[] = [
        [-vb[1]![0], vb[1]![1]],
        [vb[0]![0], -vb[0]![1]],
      ]

      if (q === 3) {
        vb.push([0, 0])
        va.push([0, 0])
      }

      return { vecs: [vb, va], energies: [r.energy, 0] }
    }),
  )

  spec.kinds.forEach((_, t) => {
    for (let m = 0; m < L; m++) tables[t]![m]!.energies[1] = tables[t]![(m + L / 2) % L]!.energies[0]!
  })

  // reel tuples as spectators: group configurations by reel tuple
  const reelKey = new Map<string, number>()
  const reelOf = new Int32Array(b.positions.length)

  b.reels.forEach((r, c) => {
    const key = r.join(',')

    if (!reelKey.has(key)) reelKey.set(key, reelKey.size)

    reelOf[c] = reelKey.get(key)!
  })

  const reelCount = reelKey.size
  const labels = Array.from({ length: R }, (_, lab) => digitsOf(lab, n, q))
  const tuples = L ** (n - 1)
  const cosT = new Float64Array(L * (2 * b.span + 1))
  const sinT = new Float64Array(L * (2 * b.span + 1))

  for (let m = 0; m < L; m++) {
    for (let x = -b.span; x <= b.span; x++) {
      cosT[m * (2 * b.span + 1) + x + b.span] = Math.cos((-2 * Math.PI * m * x) / L)
      sinT[m * (2 * b.span + 1) + x + b.span] = Math.sin((-2 * Math.PI * m * x) / L)
    }
  }

  const ampR = new Float64Array(reelCount * R)
  const ampI = new Float64Array(reelCount * R)
  const ms = new Array<number>(n)
  const W = 2 * b.span + 1
  const AN = 2 ** n
  const matR = new Float64Array(AN * R)
  const matI = new Float64Array(AN * R)
  const antiOf = new Int32Array(AN)
  const kinOf = new Float64Array(AN)

  return (v: Vec): BranchReading => {
    const counts = new Array<number>(n + 1).fill(0)
    let total = 0
    let kinetic = 0

    for (let tp = 0; tp < tuples; tp++) {
      let c = tp
      let sum = 0

      for (let t = n - 1; t >= 1; t--) {
        ms[t] = c % L
        c = Math.floor(c / L)
        sum += ms[t]!
      }

      ms[0] = (((-sum) % L) + L) % L
      ampR.fill(0)
      ampI.fill(0)

      for (let ci = 0; ci < b.positions.length; ci++) {
        const d = b.positions[ci]!
        let pr = 1
        let pi = 0

        for (let t = 1; t < n; t++) {
          const at = ms[t]! * W + d[t]! + b.span
          const cr = cosT[at]!
          const cs = sinT[at]!
          const nr = pr * cr - pi * cs

          pi = pr * cs + pi * cr
          pr = nr
        }

        const base = reelOf[ci]! * R

        for (let lab = 0; lab < R; lab++) {
          const i = ci * R + lab
          const xr = v.re[i]!
          const xi = v.im[i]!

          if (xr === 0 && xi === 0) continue

          ampR[base + lab] = ampR[base + lab]! + xr * pr - xi * pi
          ampI[base + lab] = ampI[base + lab]! + xr * pi + xi * pr
        }
      }

      // the branch matrix of this momentum tuple: row a (the branch of each token), column the labels
      for (let a = 0; a < AN; a++) {
        let anti = 0
        let kin = 0

        for (let t = 0; t < n; t++) {
          const bit = (a >> t) & 1

          anti += bit
          kin += tables[t]![ms[t]!]!.energies[bit]!
        }

        antiOf[a] = anti
        kinOf[a] = kin

        for (let lab = 0; lab < R; lab++) {
          const j = labels[lab]!
          let w: C = [1, 0]

          for (let t = 0; t < n; t++) {
            const e = tables[t]![ms[t]!]!.vecs[(a >> t) & 1]![j[t]!]!

            w = cmul(w, [e[0], -e[1]])
          }

          matR[a * R + lab] = w[0]
          matI[a * R + lab] = w[1]
        }
      }

      for (let rc = 0; rc < reelCount; rc++) {
        let here = 0

        for (let lab = 0; lab < R; lab++) here += ampR[rc * R + lab]! ** 2 + ampI[rc * R + lab]! ** 2

        total += here

        if (here < 1e-30) continue

        for (let a = 0; a < AN; a++) {
          let ar = 0
          let ai = 0

          for (let lab = 0; lab < R; lab++) {
            const wr = matR[a * R + lab]!
            const wi = matI[a * R + lab]!
            const xr = ampR[rc * R + lab]!
            const xi = ampI[rc * R + lab]!

            ar += wr * xr - wi * xi
            ai += wr * xi + wi * xr
          }

          const wgt = ar * ar + ai * ai

          counts[antiOf[a]!] = counts[antiOf[a]!]! + wgt
          kinetic += wgt * kinOf[a]!
        }
      }
    }

    const norm = counts.map(x => x / total)

    return { counts: norm, even: norm.reduce((s, x, k) => s + (k % 2 === 0 ? x : 0), 0), kinetic: kinetic / total }
  }
}

export type LightReading = { level: Level; unwrapped: number; reference: number; reading: BranchReading; nextUnwrapped: number; particleLevels: number; worstOffset: number }

// THE LIGHTEST LEVEL, E-SPN-0076's definition unchanged: each particle-sector level's E unwrapped to the
// representative nearest its reference energy (kinetic as particles + the string's cost + the meetings' energy);
// the lightest is the least
export function reelLightest(b: ReelBloch, ls: readonly Level[], L: number, contact: (b: ReelBloch, v: Vec) => number = reelContactEnergy): LightReading {
  const read = reelBranchReader(b, L)
  const sigma = (2 * Math.PI * b.spec.cost) / b.spec.root
  const rows: { k: number; unwrapped: number; reference: number; reading: BranchReading }[] = []
  let worstOffset = 0

  ls.forEach((lv, k) => {
    const reading = read(lv.vector)

    if (reading.even < 0.5) return

    const mean = reelStringMoments(b, lv.vector).mean
    const reference = reading.kinetic + sigma * mean + contact(b, lv.vector)
    const unwrapped = lv.energy + 2 * Math.PI * Math.round((reference - lv.energy) / (2 * Math.PI))

    worstOffset = Math.max(worstOffset, Math.abs(unwrapped - reference))
    rows.push({ k, unwrapped, reference, reading })
  })

  if (rows.length === 0) throw new Error('reel-string-bloch: no particle-sector level')

  rows.sort((x, y) => x.unwrapped - y.unwrapped)

  const best = rows[0]!

  return {
    level: ls[best.k]!,
    unwrapped: best.unwrapped,
    reference: best.reference,
    reading: best.reading,
    nextUnwrapped: rows[1]?.unwrapped ?? Number.NaN,
    particleLevels: rows.length,
    worstOffset,
  }
}

export function reelOverlap(u: Vec, v: Vec): number {
  let r = 0
  let i = 0

  for (let k = 0; k < u.re.length; k++) {
    r += u.re[k]! * v.re[k]! + u.im[k]! * v.im[k]!
    i += u.re[k]! * v.im[k]! - u.im[k]! * v.re[k]!
  }

  return Math.hypot(r, i) / Math.sqrt(weightOf(u) * weightOf(v))
}

// the reel sum's spread in a level: the weight-mean of |r_t| per token (how much of the columns a level uses)
export function reelUse(b: ReelBloch, v: Vec): { meanAbs: number; atEdge: number } {
  let w = 0
  let m = 0
  let edge = 0

  for (let i = 0; i < b.size; i++) {
    const p = v.re[i]! ** 2 + v.im[i]! ** 2

    if (p === 0) continue

    const r = b.reels[Math.floor(i / b.labelCount)]!

    w += p
    m += (p * r.reduce((a, x) => a + Math.abs(x), 0)) / r.length

    if (r.some(x => Math.abs(x) === b.spec.depth)) edge += p
  }

  return { meanAbs: m / w, atEdge: edge / w }
}
