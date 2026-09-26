// Measurement for the string's store on the flux (E-SPN-0075 to 0078): the one-beat operator of n LOCKED STAND-IN
// tokens on an infinite husk line at total momentum K, in relative coordinates, with the rule of
// code/rule/flux-store-line (cost, meeting, coin, stream with the store's bounce). Floats stand for the exact
// numbers; the exact rule is checked against them in the experiments.
//
// Coordinates: token 0 at x_0, token t at x_0 + d_t, d_t in -2D .. 2D. An amplitude psi(x_0, d, j) = e^(i K x_0)
// phi(d, j). The flux on the line is the Gauss flux of the sector with no flux at infinity (the total charge is 0
// mod 3), so the string count l is a function of the positions, and the store is D - l. A configuration is
// allowed when l <= 2D.
//
// Identical tokens (three loves) are restricted to the exchange-antisymmetric subspace: an antisymmetric phi obeys
// phi(pi . c) = sgn(pi) e^(-i K d_pi(0)) phi(c), where (pi . c) puts token pi(t)'s position and label at t.

import { type Convention, type Vibe } from '@/code/rule/locked-token-line'
import { unitaryEigen, type Vec } from '@/code/measure/quantum-ladder'

export type BlochSpec = {
  readonly kinds: readonly Vibe[]
  readonly convention: Convention
  readonly unlike: 'knit' | 'dock'
  readonly depth: number
  readonly cost: number
  readonly root: number
  // 2: the doublet labels only (the line sector is invariant and left out); 3: all three
  readonly labels: 2 | 3
  readonly meet?: boolean
  // an explicit wall on l in place of 2D (a control); undefined: 2D
  readonly wall?: number
}

type C = [number, number]

const SQ = Math.sqrt(3) / 2
const OMEGA: C = [-0.5, SQ]
const A: C = [0.25, SQ / 2]
const B: C = [0.75, -SQ / 2]
const cmul = (x: C, y: C): C => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]

export const chargeOf = (kind: Vibe): number => (kind === 'love' ? 1 : -1)

// the string count on the line: links between sorted positions whose cumulative center charge is nonzero mod 3
export function lineString(xs: readonly number[], kinds: readonly Vibe[]): number {
  const order = xs.map((x, t) => t).sort((a, b) => xs[a]! - xs[b]!)
  let cum = 0
  let l = 0

  for (let i = 0; i < order.length; i++) {
    cum += chargeOf(kinds[order[i]!]!)

    if (i + 1 < order.length && ((cum % 3) + 3) % 3 !== 0) l += xs[order[i + 1]!]! - xs[order[i]!]!
  }

  if (((cum % 3) + 3) % 3 !== 0) throw new Error('flux-store-bloch: the cluster is not a center singlet')

  return l
}

export const wallOf = (s: BlochSpec): number => s.wall ?? 2 * s.depth

export type Bloch = {
  readonly spec: BlochSpec
  readonly n: number
  readonly q: number
  readonly labelCount: number
  readonly configs: readonly (readonly number[])[]
  readonly strings: Int32Array
  readonly size: number
  index(config: number, labels: number): number
  configOf(d: readonly number[]): number
}

export function blochSpace(spec: BlochSpec): Bloch {
  const n = spec.kinds.length
  const q = spec.labels
  const S = wallOf(spec)
  const R = 2 * S
  const configs: number[][] = []
  const strings: number[] = []
  const lookup = new Map<string, number>()
  const d = new Array<number>(n).fill(0)
  const walk = (t: number): void => {
    if (t === n) {
      const l = lineString(d, spec.kinds)

      if (l <= S) {
        lookup.set(d.join(','), configs.length)
        configs.push(d.slice())
        strings.push(l)
      }

      return
    }

    for (let v = -R; v <= R; v++) {
      d[t] = v
      walk(t + 1)
    }
  }

  d[0] = 0
  walk(1)

  const labelCount = q ** n

  return {
    spec,
    n,
    q,
    labelCount,
    configs,
    strings: Int32Array.from(strings),
    size: configs.length * labelCount,
    index: (c, r) => c * labelCount + r,
    configOf: dd => lookup.get(dd.join(',')) ?? -1,
  }
}

const digitsOf = (r: number, n: number, q: number): number[] => {
  const out = new Array<number>(n)
  let c = r

  for (let t = n - 1; t >= 0; t--) {
    out[t] = c % q
    c = Math.floor(c / q)
  }

  return out
}

const codeOf = (j: readonly number[], q: number): number => j.reduce((a, v) => a * q + v, 0)

export type Sparse = { idx: number[]; re: number[]; im: number[] }

// the image of one basis vector under one beat
export function blochColumn(b: Bloch, K: number, col: number): Sparse {
  const { spec, n, q } = b
  const c = Math.floor(col / b.labelCount)
  const r0 = col % b.labelCount
  const d = b.configs[c]!
  const S = wallOf(spec)
  let vec = new Map<number, C>()
  const t0 = (-2 * Math.PI * ((spec.cost * b.strings[c]!) % spec.root)) / spec.root

  vec.set(r0, [Math.cos(t0), Math.sin(t0)])

  const addTo = (m: Map<number, C>, key: number, v: C): void => {
    const o = m.get(key)

    m.set(key, o ? [o[0] + v[0], o[1] + v[1]] : v)
  }

  // meetings
  if (spec.meet !== false) {
    for (let a0 = 0; a0 < n; a0++) {
      for (let b0 = a0 + 1; b0 < n; b0++) {
        if (d[a0] !== d[b0]) continue

        const like = spec.kinds[a0] === spec.kinds[b0]

        if (!like && spec.unlike === 'knit') continue

        const next = new Map<number, C>()

        for (const [r, v] of vec) {
          const j = digitsOf(r, n, q)

          if (like) {
            const sw = j.slice()

            sw[a0] = j[b0]!
            sw[b0] = j[a0]!
            addTo(next, r, cmul([(1 + OMEGA[0]) / 2, OMEGA[1] / 2], v))
            addTo(next, codeOf(sw, q), cmul([(1 - OMEGA[0]) / 2, -OMEGA[1] / 2], v))
          } else {
            addTo(next, r, v)

            if (j[a0] === j[b0]) {
              for (let k = 0; k < q; k++) {
                const t = j.slice()

                t[a0] = k
                t[b0] = k
                addTo(next, codeOf(t, q), cmul([(OMEGA[0] - 1) / 3, OMEGA[1] / 3], v))
              }
            }
          }
        }

        vec = next
      }
    }
  }

  // coins
  for (let t = 0; t < n; t++) {
    const next = new Map<number, C>()

    for (const [r, v] of vec) {
      const j = digitsOf(r, n, q)

      if (j[t] === 2) {
        addTo(next, r, v)
        continue
      }

      const o = j.slice()

      o[t] = 1 - j[t]!
      addTo(next, r, cmul(A, v))
      addTo(next, codeOf(o, q), cmul(B, v))
    }

    vec = next
  }

  // stream with the bounce
  const out: Sparse = { idx: [], re: [], im: [] }

  for (const [r, v] of vec) {
    if (v[0] === 0 && v[1] === 0) continue

    const j = digitsOf(r, n, q)
    const steps = j.map((lab, t) => (lab === 2 ? 0 : (spec.kinds[t] === 'fear' && spec.convention === 'Cprime' ? -1 : 1) * (lab === 0 ? 1 : -1)))
    const y = d.map((x, t) => x + steps[t]!)
    const l = lineString(y, spec.kinds)

    if (l > S) {
      const flipped = j.map(lab => (lab === 2 ? 2 : 1 - lab))

      out.idx.push(b.index(c, codeOf(flipped, q)))
      out.re.push(v[0])
      out.im.push(v[1])
      continue
    }

    const nd = y.map(x => x - y[0]!)
    const nc = b.configOf(nd)

    if (nc < 0) throw new Error('flux-store-bloch: an allowed image left the configuration list')

    const ph = cmul([Math.cos(-K * steps[0]!), Math.sin(-K * steps[0]!)], v)

    out.idx.push(b.index(nc, r))
    out.re.push(ph[0])
    out.im.push(ph[1])
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the exchange-antisymmetric subspace of identical tokens (or the whole space)

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

export function antisymmetricSubspace(b: Bloch, K: number): Subspace {
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

  if (b.n !== 3) throw new Error('flux-store-bloch: antisymmetrizer written for three identical tokens')

  const seen = new Uint8Array(b.size)

  for (let i = 0; i < b.size; i++) {
    if (seen[i]) continue

    const c = Math.floor(i / b.labelCount)
    const j = digitsOf(i % b.labelCount, b.n, b.q)
    const d = b.configs[c]!
    const acc = new Map<number, C>()

    PERMS3.forEach((p, k) => {
      const nd = p.map(t => d[t]! - d[p[0]!]!)
      const nj = p.map(t => j[t]!)
      const at = b.index(b.configOf(nd), codeOf(nj, b.q))
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

// the beat restricted to the subspace: U_ab = <v_a | U | v_b>; leak = the largest weight of U v_b outside it
export function reducedBeat(b: Bloch, sub: Subspace, K: number): Reduced {
  const dim = sub.vectors.length
  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)
  let leak = 0
  let unitarity = 0

  sub.vectors.forEach((v, col) => {
    const acc = new Map<number, C>()

    v.idx.forEach((i, k) => {
      const img = blochColumn(b, K, i)
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

      // conj(coefficient) * w
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

// the spectrum: E = -phase, in (-pi, pi]; vectors in the full (distinguishable) basis
export function levels(b: Bloch, sub: Subspace, red: Reduced): { levels: Level[]; residual: number } {
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

// the level whose quasi-energy is nearest, around the circle, to the free band bottom E = 0: NOT the adopted
// definition (a disclosed probe found it picks a wrapped long-string level; see lightestUnwrapped), kept as the
// naive reading the experiments report beside it
export function nearestBandBottom(ls: readonly Level[]): { level: Level; rank: number; next: number } {
  const sorted = ls.map((l, k) => ({ k, a: Math.abs(l.energy) })).sort((x, y) => x.a - y.a)

  return { level: ls[sorted[0]!.k]!, rank: sorted[0]!.k, next: sorted[1]?.a ?? Number.NaN }
}

// ---------------------------------------------------------------------------------------------------------
// observables of a level (vectors in the full basis)

export function weightOf(v: Vec): number {
  let s = 0

  for (let i = 0; i < v.re.length; i++) s += v.re[i]! ** 2 + v.im[i]! ** 2

  return s
}

// the mean string count <l> and the rms of l
export function stringMoments(b: Bloch, v: Vec): { mean: number; rms: number; max: number } {
  let w = 0
  let m1 = 0
  let m2 = 0
  let max = 0

  for (let i = 0; i < b.size; i++) {
    const p = v.re[i]! ** 2 + v.im[i]! ** 2

    if (p === 0) continue

    const l = b.strings[Math.floor(i / b.labelCount)]!

    w += p
    m1 += p * l
    m2 += p * l * l

    if (p > 1e-12) max = Math.max(max, l)
  }

  return { mean: m1 / w, rms: Math.sqrt(m2 / w), max }
}

// weight with any token on the line (label 2)
export function lineShare(b: Bloch, v: Vec): number {
  if (b.q === 2) return 0

  let s = 0

  for (let i = 0; i < b.size; i++) {
    const j = digitsOf(i % b.labelCount, b.n, b.q)

    if (j.includes(2)) s += v.re[i]! ** 2 + v.im[i]! ** 2
  }

  return s / weightOf(v)
}

// the role-symmetric ([3], spin three halves) share of a three-token level: the label digits symmetrized at fixed
// positions; the rest is role [2,1], the natural doublet (E-SPN-0071)
export function quartetShare(b: Bloch, v: Vec): number {
  let s = 0

  for (let c = 0; c < b.configs.length; c++) {
    for (let r = 0; r < b.labelCount; r++) {
      const j = digitsOf(r, b.n, b.q)
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

// THE BRANCH READER. A K = 0 level read in momentum space on a ring of L docks (L even, L > 4D so the relative
// coordinates do not alias): its weight by the number of tokens in the antiparticle branch A, and its kinetic
// energy. Every token moves one dock each beat, so each pair's sublattice parity is kept, and a level carries its
// all-particle content equally on the tuples with an even number of A tokens: a token in A at k is the lattice
// doubler of a particle in B at k + pi (U(k + pi) = -U(k), so E_A(k) = E_B(k + pi) + pi and two such pis cancel).
// The PARTICLE SECTOR is the even counts. The kinetic energy reads each token as that particle: E_B(k) in B and
// E_B(k + pi) in A, each in [0, pi / 3].
export type BranchReading = { counts: number[]; even: number; kinetic: number }

export function branchReader(b: Bloch, L: number): (v: Vec) => BranchReading {
  const { n, q } = b
  const P = L ** n
  const R = b.labelCount
  const cosT = new Float64Array(L * L)
  const sinT = new Float64Array(L * L)

  for (let k = 0; k < L; k++) {
    for (let x = 0; x < L; x++) {
      cosT[k * L + x] = Math.cos((-2 * Math.PI * ((k * x) % L)) / L) / Math.sqrt(L)
      sinT[k * L + x] = Math.sin((-2 * Math.PI * ((k * x) % L)) / L) / Math.sqrt(L)
    }
  }

  // the relative configuration of every ring position tuple, or -1
  const configAt = new Int32Array(P).fill(-1)
  const xs = new Array<number>(n)

  for (let p = 0; p < P; p++) {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      xs[t] = c % L
      c = Math.floor(c / L)
    }

    const d = xs.map(x => {
      const r = (((x - xs[0]!) % L) + L) % L

      return r > L / 2 ? r - L : r
    })

    configAt[p] = b.configOf(d)
  }

  // the particle-branch vector and energy of one token at momentum k (U(k) = S(k) C)
  const branch = (t: number, k: number): { vec: C[]; energy: number } => {
    const backward = b.spec.kinds[t] === 'fear' && b.spec.convention === 'Cprime'
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
  // per token and momentum: [B vector, A vector] (A the orthogonal complement in the doublet), padded for label 2
  const vecs: C[][][][] = []
  const energies: number[][][] = []

  b.spec.kinds.forEach((_, t) => {
    const rows = Array.from({ length: L }, (_, k) => branch(t, (2 * Math.PI * k) / L))

    vecs.push(
      rows.map(r => {
        const vb = r.vec.slice()
        const va: C[] = [
          [-vb[1]![0], vb[1]![1]],
          [vb[0]![0], -vb[0]![1]],
        ]

        if (q === 3) {
          vb.push([0, 0])
          va.push([0, 0])
        }

        return [vb, va]
      }),
    )
    energies.push(rows.map((r, k) => [r.energy, rows[(k + L / 2) % L]!.energy]))
  })

  const re = new Float64Array(P * R)
  const im = new Float64Array(P * R)
  const bufR = new Float64Array(L)
  const bufI = new Float64Array(L)
  const ks = new Array<number>(n)
  const labels = Array.from({ length: R }, (_, r) => digitsOf(r, n, q))

  return (v: Vec): BranchReading => {
    re.fill(0)
    im.fill(0)

    for (let p = 0; p < P; p++) {
      const ci = configAt[p]!

      if (ci < 0) continue

      for (let r = 0; r < R; r++) {
        re[p * R + r] = v.re[b.index(ci, r)]!
        im[p * R + r] = v.im[b.index(ci, r)]!
      }
    }

    for (let t = 0; t < n; t++) {
      const stride = L ** (n - 1 - t)

      for (let base = 0; base < P; base++) {
        if (Math.floor(base / stride) % L !== 0) continue

        for (let r = 0; r < R; r++) {
          for (let k = 0; k < L; k++) {
            let ar = 0
            let ai = 0

            for (let x = 0; x < L; x++) {
              const at = (base + x * stride) * R + r
              const c = cosT[k * L + x]!
              const s = sinT[k * L + x]!

              ar += re[at]! * c - im[at]! * s
              ai += re[at]! * s + im[at]! * c
            }

            bufR[k] = ar
            bufI[k] = ai
          }

          for (let k = 0; k < L; k++) {
            re[(base + k * stride) * R + r] = bufR[k]!
            im[(base + k * stride) * R + r] = bufI[k]!
          }
        }
      }
    }

    const counts = new Array<number>(n + 1).fill(0)
    let total = 0
    let kinetic = 0

    for (let p = 0; p < P; p++) {
      let c = p

      for (let t = n - 1; t >= 0; t--) {
        ks[t] = c % L
        c = Math.floor(c / L)
      }

      let here = 0

      for (let r = 0; r < R; r++) here += re[p * R + r]! ** 2 + im[p * R + r]! ** 2

      total += here

      if (here < 1e-30) continue

      for (let a = 0; a < 2 ** n; a++) {
        let ar = 0
        let ai = 0
        let anti = 0
        let kin = 0

        for (let t = 0; t < n; t++) {
          const bit = (a >> t) & 1

          anti += bit
          kin += energies[t]![ks[t]!]![bit]!
        }

        for (let r = 0; r < R; r++) {
          const j = labels[r]!
          let w: C = [1, 0]

          for (let t = 0; t < n; t++) {
            const e = vecs[t]![ks[t]!]![(a >> t) & 1]![j[t]!]!

            w = cmul(w, [e[0], -e[1]])
          }

          const yv = cmul(w, [re[p * R + r]!, im[p * R + r]!])

          ar += yv[0]
          ai += yv[1]
        }

        const wgt = ar * ar + ai * ai

        counts[anti] = counts[anti]! + wgt
        kinetic += wgt * kin
      }
    }

    const norm = counts.map(x => x / total)

    return { counts: norm, even: norm.reduce((s, x, k) => s + (k % 2 === 0 ? x : 0), 0), kinetic: kinetic / total }
  }
}

// THE LIGHTEST LEVEL (pre-registered before the experiment files ran, after three disclosed probes of the
// spectrum). Quasi-energy has no order on the circle, so each level's E is UNWRAPPED by its own content: the
// representative of E mod 2 pi nearest to its reference energy E_ref = (its kinetic energy read as particles) +
// (2 pi c / M) <l> (its string's cost). Only levels of the particle sector count (weight at least 1/2 on an even
// number of antiparticle-branch tokens). The lightest is the particle-sector level of least unwrapped energy.
export type LightReading = { level: Level; unwrapped: number; reference: number; reading: BranchReading; nextUnwrapped: number; particleLevels: number; worstOffset: number }

export function lightestUnwrapped(b: Bloch, ls: readonly Level[], L: number): LightReading {
  const read = branchReader(b, L)
  const sigma = (2 * Math.PI * b.spec.cost) / b.spec.root
  const rows: { k: number; unwrapped: number; reference: number; reading: BranchReading }[] = []
  let worstOffset = 0

  ls.forEach((lv, k) => {
    const reading = read(lv.vector)

    if (reading.even < 0.5) return

    const reference = reading.kinetic + sigma * stringMoments(b, lv.vector).mean
    const unwrapped = lv.energy + 2 * Math.PI * Math.round((reference - lv.energy) / (2 * Math.PI))

    worstOffset = Math.max(worstOffset, Math.abs(unwrapped - reference))
    rows.push({ k, unwrapped, reference, reading })
  })

  if (rows.length === 0) throw new Error('flux-store-bloch: no particle-sector level')

  rows.sort((x, y) => x.unwrapped - y.unwrapped)

  const best = rows[0]!

  return { level: ls[best.k]!, unwrapped: best.unwrapped, reference: best.reference, reading: best.reading, nextUnwrapped: rows[1]?.unwrapped ?? Number.NaN, particleLevels: rows.length, worstOffset }
}

// overlap |<u, v>| in the full basis
export function overlap(u: Vec, v: Vec): number {
  let r = 0
  let i = 0

  for (let k = 0; k < u.re.length; k++) {
    r += u.re[k]! * v.re[k]! + u.im[k]! * v.im[k]!
    i += u.re[k]! * v.im[k]! - u.im[k]! * v.re[k]!
  }

  return Math.hypot(r, i) / Math.sqrt(weightOf(u) * weightOf(v))
}

// the full spectrum and lightest level at one momentum
export function spectrumAt(spec: BlochSpec, K: number): { bloch: Bloch; dim: number; leak: number; unitarity: number; residual: number; all: Level[] } {
  const b = blochSpace(spec)
  const sub = antisymmetricSubspace(b, K)
  const red = reducedBeat(b, sub, K)
  const ls = levels(b, sub, red)

  return { bloch: b, dim: red.dim, leak: red.leak, unitarity: red.unitarity, residual: ls.residual, all: ls.levels }
}
