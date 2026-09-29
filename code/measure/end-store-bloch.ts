// Measurement for the string's store at its two end ports (E-SPN-0085): the one-beat operator of n LOCKED STAND-IN
// tokens (code/rule/end-store-line) on an infinite husk line at total momentum K, in relative coordinates. Floats
// stand for the exact numbers; the experiment checks the ring rule against them.
//
// Coordinates: token 0 at x_0, token t at x_0 + d_t. A configuration is (d, rL, rR): the relative positions and the
// two ports. The flux is the Gauss flux with none at infinity, so l is a function of d, and the sector reached from
// contact is rL + rR = -l, each port in -D .. D, so l <= 2D. psi(x_0, d, p, j) = e^(i K x_0) phi(d, p, j).
//
// Every image is the rule's own: each configuration is placed on a ring long enough that nothing wraps, streamed by
// code/rule/end-store-line, and read back. The ports belong to the string's ends, not to the vibes, so exchanging two
// identical tokens exchanges their positions and roles and leaves the ports alone.
//
// The level readings are code/measure/reel-string-bloch's, with the ports as the spectators its branch reader groups
// by: the lightest level (E-SPN-0076's definition, unchanged), the role-symmetric share, the string moments, the
// dock sharing and the overlap.

import { type Vibe } from '@/code/rule/locked-token-line'
import { unitaryEigen, type Vec } from '@/code/measure/quantum-ladder'
import { lineString } from '@/code/measure/flux-store-bloch'
import {
  type Level,
  type ReelBloch,
  type ReelBlochSpec,
  type Sparse,
  type Subspace,
  type Reduced,
  weightOf,
} from '@/code/measure/reel-string-bloch'
import {
  placedRegisters,
  streamRegisters,
  type EndSpec,
} from '@/code/rule/end-store-line'

type C = [number, number]

const SQ = Math.sqrt(3) / 2
const OMEGA: C = [-0.5, SQ]
const A: C = [0.25, SQ / 2]
const B: C = [0.75, -SQ / 2]
const cmul = (x: C, y: C): C => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0],
]

// the largest span from contact: each end pays out at most D links
export const endSpan = (s: ReelBlochSpec): number => 2 * s.depth

export function endBlochSpace(spec: ReelBlochSpec): ReelBloch {
  if (spec.unlike !== 'knit' || spec.convention !== 'C') {
    throw new Error('end-store-bloch: the knit meeting under C only')
  }

  const n = spec.kinds.length
  const q = spec.labels
  const S = endSpan(spec)
  const D = spec.depth
  const V = 2 * D + 1
  const W = 2 * S + 1
  const positions: number[][] = []
  const reels: number[][] = []
  const strings: number[] = []
  const lookup = new Map<number, number>()

  const keyOf = (
    d: readonly number[],
    p: readonly number[],
  ): number => {
    let k = 0

    for (let t = 1; t < n; t++) {
      k = k * W + (d[t]! + S)
    }

    return (k * V + (p[0]! + D)) * V + (p[1]! + D)
  }

  const d = new Array<number>(n).fill(0)

  const walk = (t: number): void => {
    if (t === n) {
      if (Math.max(...d) - Math.min(...d) > S) {
        return
      }

      const l = lineString(d, spec.kinds)

      if (l > S) {
        return
      }

      for (let rL = -D; rL <= D; rL++) {
        const rR = -l - rL

        if (rR < -D || rR > D) {
          continue
        }

        lookup.set(keyOf(d, [rL, rR]), positions.length)
        positions.push(d.slice())
        reels.push([rL, rR])
        strings.push(l)
      }

      return
    }

    for (let v = -S; v <= S; v++) {
      d[t] = v
      walk(t + 1)
    }
  }

  walk(1)

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
    configOf: (dd, pp) => {
      for (let t = 1; t < n; t++) {
        if (Math.abs(dd[t]!) > S) {
          return -1
        }
      }

      return lookup.get(keyOf(dd, pp)) ?? -1
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

const codeOf = (j: readonly number[], q: number): number =>
  j.reduce((a, v) => a * q + v, 0)

// the rule's stream on the line: the configuration placed on a ring where nothing wraps, streamed, read back
export function endStreamLine(
  spec: ReelBlochSpec,
  d: readonly number[],
  ports: readonly number[],
  j: readonly number[],
): { y: number[]; ports: number[]; j: number[] } {
  const S = endSpan(spec)
  const ring = 4 * S + 8
  const offset = 2 * S + 3
  const s: EndSpec = {
    ring,
    kinds: spec.kinds as Vibe[],
    convention: spec.convention,
    depth: spec.depth,
    cost: 0,
    root: 3,
  }
  const g = placedRegisters(
    s,
    d.map(v => v + offset),
    j,
    ports[0],
    ports[1],
  )
  const out = streamRegisters(s, g)

  return {
    y: out.x.map(v => v - offset),
    ports: [out.rL, out.rR],
    j: out.j,
  }
}

// the image of one basis vector under one beat
export function endBlochColumn(
  b: ReelBloch,
  K: number,
  col: number,
): Sparse {
  const { spec, n, q } = b
  const c = Math.floor(col / b.labelCount)
  const d = b.positions[c]!

  let vec = new Map<number, C>()

  const t0 =
    (-2 * Math.PI * ((spec.cost * b.strings[c]!) % spec.root)) /
    spec.root

  vec.set(col % b.labelCount, [Math.cos(t0), Math.sin(t0)])

  const addTo = (m: Map<number, C>, key: number, v: C): void => {
    const o = m.get(key)

    m.set(key, o ? [o[0] + v[0], o[1] + v[1]] : v)
  }

  if (spec.meet !== false) {
    for (let a0 = 0; a0 < n; a0++) {
      for (let b0 = a0 + 1; b0 < n; b0++) {
        if (d[a0] !== d[b0] || spec.kinds[a0] !== spec.kinds[b0]) {
          continue
        }

        const next = new Map<number, C>()

        for (const [lab, v] of vec) {
          const j = digitsOf(lab, n, q)
          const sw = j.slice()

          sw[a0] = j[b0]!
          sw[b0] = j[a0]!
          addTo(next, lab, cmul([(1 + OMEGA[0]) / 2, OMEGA[1] / 2], v))
          addTo(
            next,
            codeOf(sw, q),
            cmul([(1 - OMEGA[0]) / 2, -OMEGA[1] / 2], v),
          )
        }

        vec = next
      }
    }
  }

  for (let t = 0; t < n; t++) {
    const next = new Map<number, C>()

    for (const [lab, v] of vec) {
      const j = digitsOf(lab, n, q)

      if (j[t] === 2) {
        addTo(next, lab, v)
        continue
      }

      const o = j.slice()

      o[t] = 1 - j[t]!
      addTo(next, lab, cmul(A, v))
      addTo(next, codeOf(o, q), cmul(B, v))
    }

    vec = next
  }

  const out: Sparse = { idx: [], re: [], im: [] }

  for (const [lab, v] of vec) {
    if (v[0] === 0 && v[1] === 0) {
      continue
    }

    const s = endStreamLine(spec, d, b.reels[c]!, digitsOf(lab, n, q))
    const nd = s.y.map(x => x - s.y[0]!)
    const nc = b.configOf(nd, s.ports)

    if (nc < 0) {
      throw new Error(
        'end-store-bloch: an image left the configuration list',
      )
    }

    const shift = s.y[0]! - d[0]!
    const ph = cmul([Math.cos(-K * shift), Math.sin(-K * shift)], v)

    out.idx.push(b.index(nc, codeOf(s.j, q)))
    out.re.push(ph[0])
    out.im.push(ph[1])
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the exchange-antisymmetric subspace of three identical tokens (positions and roles; the ports stay)

const PERMS3 = [
  [0, 1, 2],
  [1, 0, 2],
  [2, 1, 0],
  [0, 2, 1],
  [1, 2, 0],
  [2, 0, 1],
]
const SIGNS3 = [1, -1, -1, -1, 1, 1]

export function endSubspace(b: ReelBloch, K: number): Subspace {
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

  if (b.n !== 3) {
    throw new Error(
      'end-store-bloch: antisymmetrizer written for three identical tokens',
    )
  }

  const seen = new Uint8Array(b.size)

  for (let i = 0; i < b.size; i++) {
    if (seen[i]) {
      continue
    }

    const c = Math.floor(i / b.labelCount)
    const j = digitsOf(i % b.labelCount, b.n, b.q)
    const d = b.positions[c]!
    const ports = b.reels[c]!
    const acc = new Map<number, C>()

    PERMS3.forEach((p, k) => {
      const nd = p.map(t => d[t]! - d[p[0]!]!)
      const nj = p.map(t => j[t]!)
      const at = b.index(b.configOf(nd, ports), codeOf(nj, b.q))
      const t = -K * d[p[0]!]!
      const v: C = [SIGNS3[k]! * Math.cos(t), SIGNS3[k]! * Math.sin(t)]
      const o = acc.get(at)

      seen[at] = 1
      acc.set(at, o ? [o[0] + v[0], o[1] + v[1]] : v)
    })

    let norm = 0

    for (const v of acc.values()) {
      norm += v[0] * v[0] + v[1] * v[1]
    }

    if (norm < 1e-18) {
      continue
    }

    const f = 1 / Math.sqrt(norm)
    const vec: Sparse = { idx: [], re: [], im: [] }

    for (const [at, v] of acc) {
      if (v[0] * v[0] + v[1] * v[1] < 1e-24) {
        continue
      }

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

export function endReducedBeat(
  b: ReelBloch,
  sub: Subspace,
  K: number,
): Reduced {
  const dim = sub.vectors.length
  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)

  let leak = 0
  let unitarity = 0

  sub.vectors.forEach((v, col) => {
    const acc = new Map<number, C>()

    v.idx.forEach((i, k) => {
      const img = endBlochColumn(b, K, i)
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

      if (a < 0) {
        continue
      }

      const cr = sub.coefficient[o]!
      const ci = sub.coefficientIm[o]!

      re[a * dim + col] = re[a * dim + col]! + cr * w[0] + ci * w[1]
      im[a * dim + col] = im[a * dim + col]! + cr * w[1] - ci * w[0]
    }

    for (let a = 0; a < dim; a++) {
      inside += re[a * dim + col]! ** 2 + im[a * dim + col]! ** 2
    }

    leak = Math.max(leak, total - inside)
    unitarity = Math.max(unitarity, Math.abs(total - 1))
  })

  return { dim, re, im, leak, unitarity }
}

export function endLevels(
  b: ReelBloch,
  sub: Subspace,
  red: Reduced,
): { levels: Level[]; residual: number } {
  const eig = unitaryEigen(red.dim, red.re, red.im)
  const out: Level[] = eig.phases.map((ph, k) => {
    const c = eig.vectors[k]!
    const v = {
      re: new Float64Array(b.size),
      im: new Float64Array(b.size),
    }

    sub.vectors.forEach((bv, a) => {
      const cr = c.re[a]!
      const ci = c.im[a]!

      if (cr === 0 && ci === 0) {
        return
      }

      bv.idx.forEach((i, m) => {
        v.re[i] = v.re[i]! + cr * bv.re[m]! - ci * bv.im[m]!
        v.im[i] = v.im[i]! + cr * bv.im[m]! + ci * bv.re[m]!
      })
    })

    let e = -ph

    while (e <= -Math.PI) {
      e += 2 * Math.PI
    }

    while (e > Math.PI) {
      e -= 2 * Math.PI
    }

    return { energy: e, vector: v }
  })

  return { levels: out, residual: eig.residual }
}

export function endSpectrumAt(
  spec: ReelBlochSpec,
  K: number,
): {
  bloch: ReelBloch
  dim: number
  leak: number
  unitarity: number
  residual: number
  all: Level[]
} {
  const b = endBlochSpace(spec)
  const sub = endSubspace(b, K)
  const red = endReducedBeat(b, sub, K)
  const ls = endLevels(b, sub, red)

  return {
    bloch: b,
    dim: red.dim,
    leak: red.leak,
    unitarity: red.unitarity,
    residual: ls.residual,
    all: ls.levels,
  }
}

// the meetings' energy (like pairs: -2 pi / 3 times the exchange-antisymmetric weight on shared docks, the exchange
// swapping roles only)
export function endContactEnergy(b: ReelBloch, v: Vec): number {
  const { n, q, spec } = b

  if (spec.meet === false) {
    return 0
  }

  let e = 0

  for (let a = 0; a < n; a++) {
    for (let c = a + 1; c < n; c++) {
      if (spec.kinds[a] !== spec.kinds[c]) {
        continue
      }

      for (let ci = 0; ci < b.positions.length; ci++) {
        const d = b.positions[ci]!

        if (d[a] !== d[c]) {
          continue
        }

        for (let lab = 0; lab < b.labelCount; lab++) {
          const j = digitsOf(lab, n, q)
          const sw = j.slice()

          sw[a] = j[c]!
          sw[c] = j[a]!

          const i1 = b.index(ci, lab)
          const i2 = b.index(ci, codeOf(sw, q))
          const xr = (v.re[i1]! - v.re[i2]!) / 2
          const xi = (v.im[i1]! - v.im[i2]!) / 2

          e += ((-2 * Math.PI) / 3) * (xr * xr + xi * xi)
        }
      }
    }
  }

  return e / weightOf(v)
}

// the ends' spread in a level: the weight-mean |rL| + |rR| over 2, and the weight with a port at its edge
export function portUse(
  b: ReelBloch,
  v: Vec,
): { meanAbs: number; atEdge: number } {
  let w = 0
  let m = 0
  let edge = 0

  for (let i = 0; i < b.size; i++) {
    const p = v.re[i]! ** 2 + v.im[i]! ** 2

    if (p === 0) {
      continue
    }

    const r = b.reels[Math.floor(i / b.labelCount)]!

    w += p
    m += (p * (Math.abs(r[0]!) + Math.abs(r[1]!))) / 2

    if (
      Math.abs(r[0]!) === b.spec.depth ||
      Math.abs(r[1]!) === b.spec.depth
    ) {
      edge += p
    }
  }

  return { meanAbs: m / w, atEdge: edge / w }
}
