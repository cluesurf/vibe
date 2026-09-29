// Measurement for the husk's 3D light balance (the experiment in test/experiment/gauge/husk-balance): where the
// average link register and the average plaquette register of the light fill alike, and whether one split fills
// every class of register alike, read on the husk light with its own weights, on the bulk light, and on the
// ladder. Integers build the lattices and the symbols' supports; the fills are measurement (doubles, a uniform
// midpoint grid over the Brillouin zone, a cyclic Jacobi eigensolver, no draw).
//
// THE FILL OF A REGISTER, from the linear light's energy. The husk trit light (code/rule/trit-column) runs, per
// beat, x' = s e on the links (the drift) and e' = -f C^T N C W x (the kick), with C the husk curl (plaquettes by
// links), W = diag(w) the link weights (1 on an axis, 2 on a face diagonal) and N = diag(n) the plaquette
// multiplicities. Its conserved energy is H = (s/2) e^T W e + (f/2) B^T N B with B = C W x, and the canonical
// pair is (x, p = W e). In a Gibbs state at temperature T (the classical, many-quanta regime where the columns
// reach their seams) equipartition gives, in the scaled coordinates q = W^(1/2) e and N^(1/2) B:
//   <e_l^2> = (T/s) pi_l / w_l,   pi = diag of the projector onto range(W^(1/2) C^T)   (the moving links)
//   <B_P^2> = (T/f) Pi_P / n_P,   Pi = diag of the projector onto range(N^(1/2) C W)   (the moving plaquettes)
// and sum_l pi_l = sum_P Pi_P = rank C, which is E-FRC-0234's virial s sum w<e^2> = f sum n<B^2>.
//
// THE BALANCE. A register of the quantum light holds one link's e or one plaquette's B, all of one capacity, so a
// register reaches its seam when its fill reaches the capacity, and every register reaches its seam at one
// temperature exactly when the fills are equal:
//   one class of link against one class of plaquette:  rho = f / s = (Pi_P / n_P) / (pi_l / w_l)
//   the average link register against the average plaquette register (E-FRC-0234's criterion):
//                                                      rho_avg = mean_P (Pi_P / n_P) / mean_l (pi_l / w_l)
// With every weight 1 the averages are rank / P and rank / L, so rho_avg = L / P, the bare count: 3 on the
// ladder, 12/32 = 3/8 on the bulk, 9/20 on the husk. The weights are what can move the husk off its bare count.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { buildTritBulk } from '@/code/rule/trit-column'

/** One lattice's light: its link classes, and its plaquette types with each one's links in momentum space. */
export type LightSymbol = {
  /** space dimension of the wave vector */
  dims: number
  /** links per dock, each with its weight w */
  linkWeights: number[]
  /** plaquettes per dock: each one's multiplicity n, and its links as (link type, sign, offset) */
  plaquettes: { n: number; links: { link: number; sign: number; offset: number[] }[] }[]
}

/** A real symmetric matrix's eigenvalues and orthonormal eigenvectors (columns), by cyclic Jacobi. */
export function jacobiEigen(a: number[][]): { values: number[]; vectors: number[][] } {
  const n = a.length
  const m = a.map(row => row.slice())
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  let total = 0

  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) total += m[i]![j]! * m[i]![j]!

  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0

    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += m[i]![j]! * m[i]![j]!

    // converged when the off-diagonal part is below 1e-28 of the matrix, relative, so rounding cannot stall it
    if (off <= 1e-28 * total || off < 1e-300) break

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = m[p]![q]!

        if (Math.abs(apq) < 1e-300) continue

        const theta = (m[q]![q]! - m[p]![p]!) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const akp = m[k]![p]!
          const akq = m[k]![q]!

          m[k]![p] = c * akp - s * akq
          m[k]![q] = s * akp + c * akq
        }

        for (let k = 0; k < n; k++) {
          const apk = m[p]![k]!
          const aqk = m[q]![k]!

          m[p]![k] = c * apk - s * aqk
          m[q]![k] = s * apk + c * aqk
        }

        for (let k = 0; k < n; k++) {
          const vkp = v[k]![p]!
          const vkq = v[k]![q]!

          v[k]![p] = c * vkp - s * vkq
          v[k]![q] = s * vkp + c * vkq
        }
      }
    }
  }

  return { values: m.map((row, i) => row[i]!), vectors: v }
}

/** The complex plaquette-by-link symbol C(k) of a light, as real and imaginary parts (P rows, L columns). */
export function curlAt(light: LightSymbol, k: readonly number[]): { re: number[][]; im: number[][] } {
  const L = light.linkWeights.length
  const re = light.plaquettes.map(() => new Array<number>(L).fill(0))
  const im = light.plaquettes.map(() => new Array<number>(L).fill(0))

  light.plaquettes.forEach((plaquette, t) => {
    for (const { link, sign, offset } of plaquette.links) {
      const phase = offset.reduce((sum, x, d) => sum + x * (k[d] ?? 0), 0)

      re[t]![link] = re[t]![link]! + sign * Math.cos(phase)
      im[t]![link] = im[t]![link]! + sign * Math.sin(phase)
    }
  })

  return { re, im }
}

/** The real 2n x 2n embedding [[A, -B], [B, A]] of the Hermitian n x n matrix A + iB. */
function embed(a: number[][], b: number[][]): number[][] {
  const n = a.length

  return Array.from({ length: 2 * n }, (_, i) =>
    Array.from({ length: 2 * n }, (_, j) => {
      const r = i % n
      const c = j % n

      if (i < n && j < n) return a[r]![c]!
      if (i >= n && j >= n) return a[r]![c]!
      if (i < n) return -b[r]![c]!

      return b[r]![c]!
    }),
  )
}

/** Fills at one wave vector: pi_l (links) and Pi_P (plaquettes), and the rank of C(k). */
export function fillsAt(light: LightSymbol, k: readonly number[], weights: { w: number[]; n: number[] }): { pi: number[]; Pi: number[]; rank: number } {
  const { re, im } = curlAt(light, k)
  const L = weights.w.length
  const P = weights.n.length
  const sw = weights.w.map(Math.sqrt)
  const sn = weights.n.map(Math.sqrt)

  // links: G = W^(1/2) C^dagger C W^(1/2), Hermitian L x L; pi = diag of the projector onto its nonzero eigenspace
  const gRe = Array.from({ length: L }, () => new Array<number>(L).fill(0))
  const gIm = Array.from({ length: L }, () => new Array<number>(L).fill(0))

  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L; j++) {
      let sr = 0
      let si = 0

      for (let t = 0; t < P; t++) {
        // conj(C_ti) C_tj
        sr += re[t]![i]! * re[t]![j]! + im[t]![i]! * im[t]![j]!
        si += re[t]![i]! * im[t]![j]! - im[t]![i]! * re[t]![j]!
      }

      gRe[i]![j] = sw[i]! * sr * sw[j]!
      gIm[i]![j] = sw[i]! * si * sw[j]!
    }
  }

  const ge = jacobiEigen(embed(gRe, gIm))
  const top = Math.max(...ge.values.map(Math.abs))
  const pi = new Array<number>(L).fill(0)
  let kept = 0

  ge.values.forEach((value, j) => {
    if (value <= 1e-9 * top) return

    kept++

    for (let h = 0; h < L; h++) pi[h] = pi[h]! + (ge.vectors[h]![j]! ** 2 + ge.vectors[h + L]![j]! ** 2) / 2
  })

  // plaquettes: Y = N^(1/2) C W, V = Y^dagger Y (L x L); Pi_P = sum over V's nonzero eigenvectors of |(Y v)_P|^2 / lambda
  const yRe = re.map((row, t) => row.map((x, l) => sn[t]! * x * weights.w[l]!))
  const yIm = im.map((row, t) => row.map((x, l) => sn[t]! * x * weights.w[l]!))
  const vRe = Array.from({ length: L }, () => new Array<number>(L).fill(0))
  const vIm = Array.from({ length: L }, () => new Array<number>(L).fill(0))

  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L; j++) {
      let sr = 0
      let si = 0

      for (let t = 0; t < P; t++) {
        sr += yRe[t]![i]! * yRe[t]![j]! + yIm[t]![i]! * yIm[t]![j]!
        si += yRe[t]![i]! * yIm[t]![j]! - yIm[t]![i]! * yRe[t]![j]!
      }

      vRe[i]![j] = sr
      vIm[i]![j] = si
    }
  }

  const ve = jacobiEigen(embed(vRe, vIm))
  const vTop = Math.max(...ve.values.map(Math.abs))
  const Pi = new Array<number>(P).fill(0)

  ve.values.forEach((value, j) => {
    if (value <= 1e-9 * vTop) return

    const xr = ve.vectors.slice(0, L).map(row => row[j]!)
    const xi = ve.vectors.slice(L).map(row => row[j]!)

    for (let t = 0; t < P; t++) {
      let ar = 0
      let ai = 0

      for (let l = 0; l < L; l++) {
        ar += yRe[t]![l]! * xr[l]! - yIm[t]![l]! * xi[l]!
        ai += yRe[t]![l]! * xi[l]! + yIm[t]![l]! * xr[l]!
      }

      Pi[t] = Pi[t]! + (ar * ar + ai * ai) / value / 2
    }
  })

  return { pi, Pi, rank: kept / 2 }
}

/**
 * The fills averaged over a uniform grid of g points per axis on [0, 2 pi)^dims, at 2 pi (j + offset) / g: the
 * midpoint grid by default (offset 1/2, which never lands on k = 0), or a torus's own momenta (offset 0).
 */
export function averageFills(
  light: LightSymbol,
  g: number,
  weights: { w: number[]; n: number[] },
  offset = 0.5,
): { pi: number[]; Pi: number[]; rank: number; points: number } {
  const L = weights.w.length
  const P = weights.n.length
  const pi = new Array<number>(L).fill(0)
  const Pi = new Array<number>(P).fill(0)
  let rank = 0
  const points = g ** light.dims

  for (let i = 0; i < points; i++) {
    let rest = i
    const k: number[] = []

    for (let d = 0; d < light.dims; d++) {
      k.push((2 * Math.PI * ((rest % g) + offset)) / g)
      rest = Math.floor(rest / g)
    }

    const f = fillsAt(light, k, weights)

    f.pi.forEach((x, h) => (pi[h] = pi[h]! + x))
    f.Pi.forEach((x, t) => (Pi[t] = Pi[t]! + x))
    rank += f.rank
  }

  return { pi: pi.map(x => x / points), Pi: Pi.map(x => x / points), rank: rank / points, points }
}

/** The balances from averaged fills: every class pair, and the average against the average. */
export function balances(fills: { pi: number[]; Pi: number[] }, weights: { w: number[]; n: number[] }): { average: number; linkFill: number[]; plaquetteFill: number[] } {
  const linkFill = fills.pi.map((x, l) => x / weights.w[l]!)
  const plaquetteFill = fills.Pi.map((x, t) => x / weights.n[t]!)
  const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length

  return { average: mean(plaquetteFill) / mean(linkFill), linkFill, plaquetteFill }
}

// ---------------------------------------------------------------------------------------------------------
// the three lights

/**
 * The husk light: 9 link directions per husk dock (weights 1 on an axis, 2 on a diagonal, code/rule/trit-column),
 * and its husk triangles per dock, read off the trit bulk and grouped into types by their shape relative to their
 * first link's dock, each with its multiplicity n_P.
 */
export function huskLight(): { light: LightSymbol; w: number[]; n: number[] } {
  const side = 6
  const bulk = buildTritBulk({ side, depth: 2 })
  const position = (y: number): number[] => [y % side, Math.floor(y / side) % side, Math.floor(y / (side * side))]
  const wrap = (x: number): number => {
    const m = ((x % side) + side) % side

    return m > side / 2 ? m - side : m
  }
  const types = new Map<string, { n: number; links: { link: number; sign: number; offset: number[] }[]; count: number }>()

  // A shape's key must not depend on which link the box's indexing lists first, since that order changes across
  // the torus's wrap: take every link's dock as the anchor and both orientations, and keep the least key.
  for (let p = 0; p < bulk.huskTriangles; p++) {
    const links = [0, 1, 2].map(j => ({ l: bulk.huskTriLinks[p * 3 + j] ?? 0, s: bulk.huskTriSigns[p * 3 + j] ?? 0 }))
    let best: { key: string; shape: { link: number; sign: number; offset: number[] }[] } | undefined

    for (const at of links) {
      const anchor = position(Math.floor(at.l / 9))

      for (const flip of [1, -1]) {
        const shape = links
          .map(({ l, s }) => ({
            link: l % 9,
            sign: s * flip,
            offset: position(Math.floor(l / 9)).map((x, d) => wrap(x - anchor[d]!)),
          }))
          .sort((a, b) => a.link - b.link || a.offset.join('.').localeCompare(b.offset.join('.')))
        const key = shape.map(x => `${x.link}:${x.sign}:${x.offset.join('.')}`).join('|')

        if (!best || key < best.key) best = { key, shape }
      }
    }

    const seen = types.get(best!.key)

    if (seen) seen.count++
    else types.set(best!.key, { n: bulk.multiplicity[p] ?? 0, links: best!.shape, count: 1 })
  }

  const plaquettes = [...types.values()]

  if (plaquettes.some(t => t.count !== side ** 3)) throw new Error('a husk triangle type does not tile the husk')

  const w = Array.from(bulk.weight)

  return { light: { dims: 3, linkWeights: w, plaquettes }, w, n: plaquettes.map(t => t.n) }
}

/** The bulk light: 12 first roots as the link types per D4 dock and 32 triangles, every weight 1. */
export function bulkLight(): { light: LightSymbol; w: number[]; n: number[] } {
  const roots = rootsD4()
  const index = (v: readonly number[]): number => roots.findIndex(r => r.every((x, k) => x === (v[k] ?? 0)))
  const opposite = roots.map(r => index(r.map(x => -x)))
  const first: number[] = []

  for (const [u, depths] of [
    [[1, 0, 0], [1, -1]],
    [[0, 1, 0], [1, -1]],
    [[0, 0, 1], [1, -1]],
    [[1, 1, 0], [0]],
    [[1, -1, 0], [0]],
    [[1, 0, 1], [0]],
    [[1, 0, -1], [0]],
    [[0, 1, 1], [0]],
    [[0, 1, -1], [0]],
  ] as const) {
    for (const z of depths) first.push(index([u[0], u[1], u[2], z]))
  }

  const firstOf = new Array<number>(24).fill(-1)

  first.forEach((d, k) => (firstOf[d] = k))

  const step = (at: number[], d: number): { link: number; sign: number; offset: number[] } => {
    if (firstOf[d]! >= 0) return { link: firstOf[d]!, sign: 1, offset: at }

    return { link: firstOf[opposite[d]!]!, sign: -1, offset: at.map((x, k) => x + roots[d]![k]!) }
  }
  const plaquettes: LightSymbol['plaquettes'] = []

  for (let a = 0; a < 24; a++) {
    for (let b = 0; b < 24; b++) {
      const c = index(roots[a]!.map((v, k) => -v - roots[b]![k]!))

      if (c < 0 || a >= Math.min(b, c, opposite[a]!, opposite[b]!, opposite[c]!)) continue

      const x = [0, 0, 0, 0]
      const y = roots[a]!.slice()
      const z = y.map((v, k) => v + roots[b]![k]!)

      plaquettes.push({ n: 1, links: [step(x, a), step(y, b), step(z, c)] })
    }
  }

  const w = new Array<number>(12).fill(1)

  return { light: { dims: 4, linkWeights: w, plaquettes }, w, n: plaquettes.map(() => 1) }
}

/**
 * The witness: the husk light's fills on a finite torus of side `side`, from the box's own husk triangles and
 * links (no symbol, no grouping into types), by dense projectors. Returns each husk link's and husk triangle's
 * fill, pi_l / w_l and Pi_P / n_P, and the type of each triangle is not used.
 */
export function boxFills(side: number): { linkFill: number[]; plaquetteFill: number[]; linkDirection: number[]; plaquetteN: number[] } {
  const bulk = buildTritBulk({ side, depth: 2 })
  const L = bulk.huskLinks
  const P = bulk.huskTriangles
  const w = Array.from({ length: L }, (_, l) => bulk.weight[l % 9] ?? 1)
  const n = Array.from(bulk.multiplicity)
  const c = Array.from({ length: P }, () => new Array<number>(L).fill(0))

  for (let p = 0; p < P; p++) {
    for (let j = 0; j < 3; j++) {
      const l = bulk.huskTriLinks[p * 3 + j] ?? 0

      c[p]![l] = c[p]![l]! + (bulk.huskTriSigns[p * 3 + j] ?? 0)
    }
  }

  // links: G = W^(1/2) C^T C W^(1/2); pi = diag of the projector onto its nonzero eigenspace
  const g = Array.from({ length: L }, (_, i) =>
    Array.from({ length: L }, (_, j) => {
      let s = 0

      for (let p = 0; p < P; p++) s += c[p]![i]! * c[p]![j]!

      return Math.sqrt(w[i]!) * s * Math.sqrt(w[j]!)
    }),
  )
  const ge = jacobiEigen(g)
  const gTop = Math.max(...ge.values.map(Math.abs))
  const pi = new Array<number>(L).fill(0)

  ge.values.forEach((value, j) => {
    if (value > 1e-9 * gTop) for (let l = 0; l < L; l++) pi[l] = pi[l]! + ge.vectors[l]![j]! ** 2
  })

  // plaquettes: Y = N^(1/2) C W, V = Y^T Y; Pi_P = sum over nonzero eigenvectors of (Y v)_P^2 / lambda
  const y = c.map((row, p) => row.map((x, l) => Math.sqrt(n[p]!) * x * w[l]!))
  const v = Array.from({ length: L }, (_, i) =>
    Array.from({ length: L }, (_, j) => {
      let s = 0

      for (let p = 0; p < P; p++) s += y[p]![i]! * y[p]![j]!

      return s
    }),
  )
  const ve = jacobiEigen(v)
  const vTop = Math.max(...ve.values.map(Math.abs))
  const Pi = new Array<number>(P).fill(0)

  ve.values.forEach((value, j) => {
    if (value <= 1e-9 * vTop) return

    for (let p = 0; p < P; p++) {
      let a = 0

      for (let l = 0; l < L; l++) a += y[p]![l]! * ve.vectors[l]![j]!

      Pi[p] = Pi[p]! + (a * a) / value
    }
  })

  return {
    linkFill: pi.map((x, l) => x / w[l]!),
    plaquetteFill: Pi.map((x, p) => x / n[p]!),
    linkDirection: Array.from({ length: L }, (_, l) => l % 9),
    plaquetteN: n,
  }
}

/** The ladder of squares (E-FRC-0234's): two rails and a rung per square, one plaquette, every weight 1. */
export function ladderLight(): { light: LightSymbol; w: number[]; n: number[] } {
  // links: rail 0 (x, 0) -> (x + 1, 0), rail 1 (x, 1) -> (x + 1, 1), rung (x, 0) -> (x, 1)
  const plaquette = {
    n: 1,
    links: [
      { link: 0, sign: 1, offset: [0] },
      { link: 2, sign: 1, offset: [1] },
      { link: 1, sign: -1, offset: [0] },
      { link: 2, sign: -1, offset: [0] },
    ],
  }

  return { light: { dims: 1, linkWeights: [1, 1, 1], plaquettes: [plaquette] }, w: [1, 1, 1], n: [1] }
}
