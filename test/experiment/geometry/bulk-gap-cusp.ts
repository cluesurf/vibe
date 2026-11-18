// IS THE BULK GAPPED AND ARE THE CUSPS GAPLESS? (item vibe-roadmap-board-0050, future-models.md new base possibility
// 3, gaps B-38, B-10, B-11, B-22, B-59). Gates pre-registered in the item's `what` before any probe.
//
// The claim under test: on a non-amenable mesh the dock adjacency has a spectral gap, so the bulk holds no long soft
// waves, while along a cusp the husk is a cubic lattice with Z^3 Bloch momentum where long waves could live. Then key 1
// (physics is the husk) would follow from the spectrum.
//
// INSTRUMENTS, all exact tables (no random numbers anywhere, no random start vectors):
//
// - Q-small = K mod (sqrt 2)^5 (16,384 docks) and Q-large = K mod (sqrt 2)^6 (1,048,576 docks), the Cayley graphs of
//   congruence-3434 enumerateFrames. Q-large covers Q-small, so every eigenvalue of Q-small is one of Q-large.
// - the cusp neighborhood of exact-cusp buildExactCusp: period 2 at floors 1, 2, 3 and period 4 at floors 1, 2.
//
// OPERATORS. A, the 24-regular dock adjacency. On the cusp A_D (Dirichlet floor: a slot facing below the floor is
// dropped) and A_R (the instrument's own reflecting floor: that slot links the dock to itself). A_D is a finite
// subgraph of the honeycomb modulo the cusp lattice Lambda, an amenable group, so its top eigenvalue is a lower bound on
// the infinite honeycomb's spectral radius rho (a covering by an amenable group keeps rho, Brooks; a finite subgraph
// has a smaller one). A_R keeps degree 24, so at husk momentum 0 its constant vector is exact: the floor's finite
// volume, reported and never gated.
//
// HUSK MOMENTUM. A unit cusp translation u_j is a graph automorphism sigma_j of the cusp quotient that is not a label
// map: phi(u_j g) = h_j for every frame g, so sigma_j(neighbour(x, b)) = neighbour(sigma_j(x), pi_j(b)) with pi_j the
// slot permutation of the twist h_j (h_j k_b h_j^-1 = k_pi(b)), and sigma_j(0) = neighbour(0, a_j). It is built by
// propagation from that rule and gated (consistent, a bijection, sigma_j^P = 1, the three commute). A sector k is
// the range of the real projector (1 / P^3) sum_n cos(k . n) sigma^n; Lanczos from the projected delta at the base dock
// stays inside it (reprojected every 10 steps). By Perron, |A_D(k)| <= A_D(0) entrywise, so the band is lowest (in the
// Laplacian 24 - A) at k = 0 for every floor.
//
// SPECTRA. Lanczos with full reorthogonalization, read by Rayleigh-Ritz on the whole V^T A V (every coefficient the
// orthogonalization removes), never on the tridiagonal alone. On a quotient the start is the delta at dock 0 minus the mean, which
// weights each eigenvalue by its multiplicity over N, so no eigenvalue is missed. Ritz vectors are formed and their
// residuals |A y - theta y| computed explicitly (G1).
//
// THE WALK. The working rule's lone vibe is the fear walk on its line (E-QTM-0157): the coin keeps the slot with
// (1 + w)/2 and turns it with (1 - w)/2, w = e^(2 pi i / 3), then the stream moves slot a of x to slot a of
// neighbour(x, a), and a floor slot to the dock's own opposite slot. A line is invariant, so the walk's sectors are its
// lines and, on a closed line of l docks, the momenta q = 2 pi n / l: eigenvalues e^(i pi / 3) e^(+-i W) with
// cos W = cos q / 2. Each Bloch vector is built on a real line of the table and its residual computed (G1). On the cusp
// every line is a segment with two floor ends; its spectrum is read from the Hermitian part and reported.
//
// Under key 3 a dock is a block, never a point. Under key 2 the quotient and the cusp are instruments, not the present.

import { performance } from 'node:perf_hooks'
import { enumerateFrames, graphGates } from '@/code/substrate/coxeter/congruence-3434'
import { exactCell, matrixVector } from '@/code/substrate/coxeter/exact-3434'
import { buildExactCusp, type ExactCusp } from '@/code/substrate/coxeter/exact-cusp'
import { symmetricEigen } from '@/code/substrate/coxeter/schlafli'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

const SLOTS = 24
const KESTEN = 2 * Math.sqrt(23)
const MAJORANT = 16.02

export type BulkGapPlan = {
  // the 2-adic levels m of Q-small and Q-large, and the Lanczos steps on each
  quotients: { twoPower: number; steps: number }[]
  // period 2 floors (G3, G4) and period 4 floors (bands)
  floors: number[]
  bandFloors: number[]
  sectorSteps: number
}

export const GATE_PLAN: BulkGapPlan = {
  quotients: [
    { twoPower: 5, steps: 300 },
    { twoPower: 6, steps: 200 },
  ],
  floors: [1, 2, 3],
  bandFloors: [1, 2],
  sectorSteps: 120,
}

export const SMOKE_PLAN: BulkGapPlan = {
  quotients: [
    { twoPower: 4, steps: 120 },
    { twoPower: 5, steps: 120 },
  ],
  floors: [1, 2],
  bandFloors: [1],
  sectorSteps: 60,
}

type Apply = (v: Float64Array, out: Float64Array) => void

export function adjacency(table: Int32Array, floor: 'dirichlet' | 'reflect'): Apply {
  const n = table.length / SLOTS

  return (v, out) => {
    for (let x = 0; x < n; x++) {
      const base = x * SLOTS
      let s = 0

      for (let k = 0; k < SLOTS; k++) {
        const y = table[base + k]!

        if (y >= 0) {
          s += v[y]!
        } else if (floor === 'reflect') {
          s += v[x]!
        }
      }

      out[x] = s
    }
  }
}

const dot = (a: Float64Array, b: Float64Array): number => {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += a[i]! * b[i]!
  }

  return s
}

// cyclic Jacobi for a dense symmetric matrix, stopping when the off-diagonal mass is below 1e-26 of the whole
function jacobi(input: number[][]): { values: number[]; vectors: number[][] } {
  const n = input.length
  const a = input.map(row => row.slice())
  const v = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j): number => (i === j ? 1 : 0)))
  let total = 0

  for (const row of a) {
    for (const x of row) {
      total += x * x
    }
  }

  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += a[p]![q]! * a[p]![q]!
      }
    }

    if (off <= 1e-26 * total) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p]![q]!

        if (apq === 0) {
          continue
        }

        const theta = (a[q]![q]! - a[p]![p]!) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const akp = a[k]![p]!
          const akq = a[k]![q]!

          a[k]![p] = c * akp - s * akq
          a[k]![q] = s * akp + c * akq
        }

        for (let k = 0; k < n; k++) {
          const apk = a[p]![k]!
          const aqk = a[q]![k]!

          a[p]![k] = c * apk - s * aqk
          a[q]![k] = s * apk + c * aqk
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

  return { values: a.map((row, i) => row[i]!), vectors: v }
}

type Ritz = { value: number; residual: number }
type LanczosRead = { top: Ritz[]; bottom: Ritz[]; steps: number }

export function lanczos(input: {
  apply: Apply
  start: Float64Array
  steps: number
  keep: number
  project: (v: Float64Array) => void
  projectEvery: number
}): LanczosRead {
  const n = input.start.length
  const v0 = Float64Array.from(input.start)

  input.project(v0)

  const n0 = Math.sqrt(dot(v0, v0))

  for (let i = 0; i < n; i++) {
    v0[i]! /= n0
  }

  const basis: Float64Array[] = [v0]
  // H[j][i] = <v_i, A v_j>: every coefficient the orthogonalization removes, so the Rayleigh-Ritz matrix V^T A V is
  // read in full and never assumed tridiagonal (the smoke probe found the tridiagonal alone gave a ghost above 24
  // once the Krylov space of a small sector ran out)
  const columns: number[][] = []
  const w = new Float64Array(n)

  for (let j = 0; j < input.steps; j++) {
    const v = basis[j]!

    input.apply(v, w)

    const size = Math.sqrt(dot(w, w))

    if (j % input.projectEvery === 0) {
      input.project(w)
    }

    const column = new Array<number>(basis.length).fill(0)

    for (let pass = 0; pass < 2; pass++) {
      basis.forEach((b, i) => {
        const c = dot(w, b)

        column[i]! += c

        for (let x = 0; x < n; x++) {
          w[x]! -= c * b[x]!
        }
      })
    }

    columns.push(column)

    const b = Math.sqrt(dot(w, w))

    // an exhausted Krylov space (a small sector) ends the run: past it only rounding is left
    if (j === input.steps - 1 || b < 1e-6 * size) {
      break
    }

    basis.push(w.map(x => x / b))
  }

  const m = columns.length
  const h = Array.from({ length: m }, (_, i) =>
    // column j holds <v_i, A v_j> for i <= j; A is symmetric, so the lower triangle is its mirror
    Array.from({ length: m }, (_, j) => (i <= j ? columns[j]![i]! : columns[i]![j]!)),
  )
  const eig = jacobi(h)
  const order = eig.values.map((_, i) => i).sort((a, b) => eig.values[b]! - eig.values[a]!)
  const ritz = (index: number): Ritz => {
    const theta = eig.values[index]!
    const s = eig.vectors.map(row => row[index]!)
    const y = new Float64Array(n)

    for (let i = 0; i < m; i++) {
      const c = s[i]!
      const b = basis[i]!

      for (let x = 0; x < n; x++) {
        y[x]! += c * b[x]!
      }
    }

    const ay = new Float64Array(n)

    input.apply(y, ay)

    let r = 0

    for (let x = 0; x < n; x++) {
      const d = ay[x]! - theta * y[x]!

      r += d * d
    }

    return { value: theta, residual: Math.sqrt(r / dot(y, y)) }
  }

  return {
    top: order.slice(0, input.keep).map(ritz),
    bottom: order.slice(-1).map(ritz),
    steps: m,
  }
}

// ---- the cusp's translations as graph automorphisms ----

type Translations = { sigma: Int32Array[]; ok: boolean }

export function translationPermutations(cusp: ExactCusp): Translations {
  const cell = exactCell()
  const table = cusp.table
  const n = cusp.cells
  const keyOf = (v: bigint[]): string => v.join(',')
  const stepCenter = cell.transports.map(k => matrixVector(k, cell.center))
  const slotOf = new Map(stepCenter.map((c, b) => [keyOf(c), b]))
  let ok = true
  const sigma = cusp.translations.axes.map(axis => {
    const pi = stepCenter.map(c => slotOf.get(keyOf(matrixVector(axis.twist, c))) ?? -1)

    ok &&= pi.every(b => b >= 0) && new Set(pi).size === SLOTS

    const s = new Int32Array(n).fill(-1)

    s[0] = table[axis.slot]!

    // docks are numbered breadth-first from the base, so each dock's image is known before its slots are read
    for (let x = 0; x < n && ok; x++) {
      const sx = s[x]!

      if (sx < 0) {
        ok = false
        break
      }

      for (let b = 0; b < SLOTS; b++) {
        const y = table[x * SLOTS + b]!
        const z = table[sx * SLOTS + pi[b]!]!

        if (y < 0 || z < 0) {
          ok &&= y < 0 && z < 0
        } else if (s[y] === -1) {
          s[y] = z
        } else {
          ok &&= s[y] === z
        }
      }
    }

    ok &&= new Set(s).size === n && s.every(v => v >= 0)

    return s
  })

  const compose = (a: Int32Array, b: Int32Array): Int32Array => a.map((_, x) => a[b[x]!]!)

  if (ok) {
    for (const s of sigma) {
      let p = s

      for (let i = 1; i < cusp.period; i++) {
        p = compose(s, p)
      }

      ok &&= p.every((v, x) => v === x)
    }

    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        const ab = compose(sigma[i]!, sigma[j]!)
        const ba = compose(sigma[j]!, sigma[i]!)

        ok &&= ab.every((v, x) => v === ba[x])
      }
    }
  }

  return { sigma, ok }
}

// the real projector onto the husk momenta +-k (k in units of 2 pi / P)
export function sectorProjector(sigma: Int32Array[], period: number, k: number[]): (v: Float64Array) => void {
  const shift = (v: Float64Array, s: Int32Array): Float64Array => {
    const out = new Float64Array(v.length)

    for (let x = 0; x < v.length; x++) {
      out[s[x]!] = v[x]!
    }

    return out
  }
  // (P_k + P_-k) / 2 when k != -k, so twice it is the projector onto the pair; P_k itself when k = -k
  const selfConjugate = k.every(c => (2 * c) % period === 0)
  const scale = (selfConjugate ? 1 : 2) / period ** 3

  return v => {
    const acc = new Float64Array(v.length)
    let c0 = v

    for (let n0 = 0; n0 < period; n0++) {
      let c1 = c0

      for (let n1 = 0; n1 < period; n1++) {
        let c2 = c1

        for (let n2 = 0; n2 < period; n2++) {
          const phase = Math.cos((2 * Math.PI * (k[0]! * n0 + k[1]! * n1 + k[2]! * n2)) / period) * scale

          for (let x = 0; x < v.length; x++) {
            acc[x]! += phase * c2[x]!
          }

          c2 = shift(c2, sigma[2]!)
        }

        c1 = shift(c1, sigma[1]!)
      }

      c0 = shift(c0, sigma[0]!)
    }

    v.set(acc)
  }
}

// ---- the walk ----

type C = [number, number]

const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const csub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cabs = (a: C): number => Math.hypot(a[0], a[1])
const cexp = (t: number): C => [Math.cos(t), Math.sin(t)]
const csqrt = (a: C): C => {
  const r = Math.sqrt(cabs(a))
  const t = Math.atan2(a[1], a[0]) / 2

  return [r * Math.cos(t), r * Math.sin(t)]
}

const W3: C = cexp((2 * Math.PI) / 3)
const KEEP: C = [(1 + W3[0]) / 2, W3[1] / 2]
const TURN: C = [(1 - W3[0]) / 2, -W3[1] / 2]

// one beat of the lone vibe on a line (docks in order, slot a forward), amplitudes psi[2 j] at (j, a), psi[2 j + 1]
// at (j, -a); the stream is read off the table
function walkBeat(table: Int32Array, docks: number[], a: number, psi: C[]): C[] {
  const at = new Map(docks.map((d, j) => [d, j]))
  const out: C[] = psi.map(() => [0, 0])
  const back = OPPOSITE[a]!

  docks.forEach((d, j) => {
    const plus = psi[2 * j]!
    const minus = psi[2 * j + 1]!
    const cPlus = cadd(cmul(KEEP, plus), cmul(TURN, minus))
    const cMinus = cadd(cmul(TURN, plus), cmul(KEEP, minus))
    const fwd = table[d * SLOTS + a]!
    const bwd = table[d * SLOTS + back]!
    const iPlus = fwd < 0 ? 2 * j + 1 : 2 * at.get(fwd)!
    const iMinus = bwd < 0 ? 2 * j : 2 * at.get(bwd)! + 1

    out[iPlus] = cadd(out[iPlus]!, cPlus)
    out[iMinus] = cadd(out[iMinus]!, cMinus)
  })

  return out
}

// a closed line: every Bloch vector's residual on the table, and the worst |cos W - cos q / 2|
function ringCheck(table: Int32Array, docks: number[], a: number): { residual: number; dispersion: number; vectors: number } {
  const l = docks.length
  const half: C = cexp(Math.PI / 3)
  let residual = 0
  let dispersion = 0
  let vectors = 0

  for (let n = 0; n < l; n++) {
    const q = (2 * Math.PI * n) / l
    const m00 = cmul(cexp(-q), KEEP)
    const m01 = cmul(cexp(-q), TURN)
    const m10 = cmul(cexp(q), TURN)
    const m11 = cmul(cexp(q), KEEP)
    const tr = cadd(m00, m11)
    const det = csub(cmul(m00, m11), cmul(m01, m10))
    const disc = csqrt(csub(cmul(tr, tr), cmul([4, 0], det)))

    for (const sign of [1, -1]) {
      const lambda = cmul([0.5, 0], cadd(tr, cmul([sign, 0], disc)))
      let phi: [C, C] = [m01, csub(lambda, m00)]

      if (cabs(phi[0]) + cabs(phi[1]) < 1e-9) {
        phi = [csub(lambda, m11), m10]
      }

      const norm = Math.hypot(cabs(phi[0]), cabs(phi[1]))
      const psi: C[] = []

      for (let j = 0; j < l; j++) {
        const e = cexp(q * j)

        psi.push(cmul(e, [phi[0][0] / norm, phi[0][1] / norm]), cmul(e, [phi[1][0] / norm, phi[1][1] / norm]))
      }

      const u = walkBeat(table, docks, a, psi)
      let r = 0

      u.forEach((v, i) => {
        r += cabs(csub(v, cmul(lambda, psi[i]!))) ** 2
      })

      residual = Math.max(residual, Math.sqrt(r))

      const rel = cmul(lambda, [half[0], -half[1]])
      const cosW = rel[0] / cabs(rel)

      dispersion = Math.max(dispersion, Math.abs(cosW - Math.cos(q) / 2), Math.abs(cabs(lambda) - 1))
      vectors++
    }
  }

  return { residual, dispersion, vectors }
}

// the eigenvalues cos W of e^(-i pi / 3) U's Hermitian part on a line, U built on the table
function lineCosines(table: Int32Array, docks: number[], a: number): number[] {
  const n = 2 * docks.length
  const half: C = cexp(-Math.PI / 3)
  const columns: C[][] = []

  for (let s = 0; s < n; s++) {
    const e: C[] = Array.from({ length: n }, (_, i): C => (i === s ? [1, 0] : [0, 0]))

    columns.push(walkBeat(table, docks, a, e).map(v => cmul(half, v)))
  }

  // H = (V + V^dagger) / 2, V[i][s] = columns[s][i]; embedded as [[Re, -Im], [Im, Re]]
  const big = Array.from({ length: 2 * n }, () => new Array<number>(2 * n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let s = 0; s < n; s++) {
      const v = columns[s]![i]!
      const vt = columns[i]![s]!
      const re = (v[0] + vt[0]) / 2
      const im = (v[1] - vt[1]) / 2

      big[i]![s] = re
      big[i + n]![s + n] = re
      big[i]![s + n] = -im
      big[i + n]![s] = im
    }
  }

  const values = symmetricEigen({ matrix: big }).values.sort((x, y) => x - y)

  return values.filter((_, i) => i % 2 === 0)
}

// the lines of a table: each (dock, slot pair) once
function linesOf(table: Int32Array, from?: number): { docks: number[]; a: number; closed: boolean }[] {
  const n = table.length / SLOTS
  const pairs = Array.from({ length: SLOTS }, (_, a) => a).filter(a => a < OPPOSITE[a]!)
  const seen = new Uint8Array(n * pairs.length)
  const lines: { docks: number[]; a: number; closed: boolean }[] = []
  const starts = from === undefined ? Array.from({ length: n }, (_, x) => x) : [from]

  for (const x of starts) {
    pairs.forEach((a, p) => {
      if (seen[x * pairs.length + p]) {
        return
      }

      // back to the line's start (a floor end), or around once on a closed line
      let s = x
      let closed = false

      for (let step = 0; step <= n; step++) {
        const b = table[s * SLOTS + OPPOSITE[a]!]!

        if (b < 0) {
          break
        }

        s = b

        if (s === x) {
          closed = true
          break
        }
      }

      const docks: number[] = []
      let d = s

      for (let step = 0; step <= n; step++) {
        docks.push(d)
        seen[d * pairs.length + p] = 1

        const f = table[d * SLOTS + a]!

        if (f < 0 || f === s) {
          break
        }

        d = f
      }

      lines.push({ docks, a, closed })
    })
  }

  return lines
}

// ---- the run ----

type Sector = { name: string; k: number[] }

const SECTORS_2: Sector[] = [
  { name: '000', k: [0, 0, 0] },
  { name: '100', k: [1, 0, 0] },
  { name: '111', k: [1, 1, 1] },
]

const SECTORS_4: Sector[] = [
  { name: '000', k: [0, 0, 0] },
  { name: '100', k: [1, 0, 0] },
  { name: '010', k: [0, 1, 0] },
  { name: '001', k: [0, 0, 1] },
  { name: '110', k: [1, 1, 0] },
  { name: '111', k: [1, 1, 1] },
  { name: '200', k: [2, 0, 0] },
  { name: '222', k: [2, 2, 2] },
]

export function bulkGapCuspRun(plan: BulkGapPlan): Verdict {
  const started = performance.now()
  const seconds = (): number => Number(((performance.now() - started) / 1000).toFixed(1))
  const log = (line: string): void => console.error(`${line} (${seconds()} s)`)
  const metrics: Record<string, number> = {}
  let worstRitz = 0
  let worstWalk = 0
  let worstDispersion = 0
  let g0 = true

  // ---- the quotients ----
  const lambda2: number[] = []

  for (const { twoPower, steps } of plan.quotients) {
    const e = enumerateFrames({ level: { twoPower, odd: 1 }, maxDocks: 2000000 })
    const gates = graphGates(e.table, e.order)
    const gatesOk = e.fits && Object.values(gates).every(Boolean)

    g0 &&= gatesOk
    log(`Q (sqrt 2)^${twoPower}: ${e.order} docks, gates ${JSON.stringify(gates)}`)

    const n = e.order
    const start = new Float64Array(n)

    start[0] = 1

    const read = lanczos({
      apply: adjacency(e.table, 'dirichlet'),
      start,
      steps,
      keep: 3,
      project: v => {
        const mean = v.reduce((s, x) => s + x, 0) / n

        for (let i = 0; i < n; i++) {
          v[i]! -= mean
        }
      },
      projectEvery: 1,
    })

    for (const r of [...read.top, ...read.bottom]) {
      worstRitz = Math.max(worstRitz, r.residual)
    }

    lambda2.push(read.top[0]!.value)
    metrics[`q${twoPower}Docks`] = n
    metrics[`q${twoPower}Lambda2`] = read.top[0]!.value
    metrics[`q${twoPower}Lambda3`] = read.top[1]!.value
    metrics[`q${twoPower}Lambda4`] = read.top[2]!.value
    metrics[`q${twoPower}LambdaMin`] = read.bottom[0]!.value
    metrics[`q${twoPower}Residual`] = Math.max(...[...read.top, ...read.bottom].map(r => r.residual))
    metrics[`q${twoPower}Steps`] = read.steps
    log(`Q (sqrt 2)^${twoPower}: top ${read.top.map(r => `${r.value.toFixed(10)} (res ${r.residual.toExponential(2)})`).join(', ')}, bottom ${read.bottom.map(r => `${r.value.toFixed(10)} (res ${r.residual.toExponential(2)})`).join(', ')}, ${read.steps} steps`)

    // the walk: every line on the smaller quotient, the 12 through dock 0 on the larger
    const lines = linesOf(e.table, twoPower === plan.quotients[0]!.twoPower ? undefined : 0)
    const lengths = new Map<number, number>()
    let vectors = 0

    for (const line of lines) {
      g0 &&= line.closed
      lengths.set(line.docks.length, (lengths.get(line.docks.length) ?? 0) + 1)

      const c = ringCheck(e.table, line.docks, line.a)

      worstWalk = Math.max(worstWalk, c.residual)
      worstDispersion = Math.max(worstDispersion, c.dispersion)
      vectors += c.vectors
    }

    metrics[`q${twoPower}Lines`] = lines.length
    metrics[`q${twoPower}WalkVectors`] = vectors
    log(`Q (sqrt 2)^${twoPower} walk: ${lines.length} lines, lengths ${[...lengths].sort((a, b) => a[0] - b[0]).map(([l, c]) => `${l}:${c}`).join(' ')}, ${vectors} Bloch vectors, worst residual ${worstWalk.toExponential(2)}, worst dispersion ${worstDispersion.toExponential(2)}`)
  }

  // ---- the cusp ----
  const cuspRead = (period: number, floor: number, sectors: Sector[], walk: boolean): Map<string, { d: number; r: number }> => {
    const cusp = buildExactCusp({ period, floor })
    const t = translationPermutations(cusp)
    let layerSix = cusp.depthCounts[0] === period ** 3

    for (let x = 0; x < cusp.cells; x++) {
      if (cusp.depth[x] !== 0) {
        continue
      }

      let layer = 0

      for (let b = 0; b < SLOTS; b++) {
        const y = cusp.table[x * SLOTS + b]!

        layer += y >= 0 && cusp.depth[y] === 0 ? 1 : 0
      }

      layerSix &&= layer === 6
    }

    g0 &&= t.ok && layerSix
    log(`cusp period ${period} floor ${floor}: ${cusp.cells} docks, depths ${cusp.depthCounts.join(' ')}, translations ${t.ok}, layer 6-regular ${layerSix}`)

    const out = new Map<string, { d: number; r: number }>()

    for (const s of sectors) {
      const project = sectorProjector(t.sigma, period, s.k)
      const tops: number[] = []

      for (const floorKind of ['dirichlet', 'reflect'] as const) {
        const start = new Float64Array(cusp.cells)

        start[0] = 1

        const read = lanczos({
          apply: adjacency(cusp.table, floorKind),
          start,
          steps: Math.min(plan.sectorSteps, cusp.cells),
          keep: 1,
          project,
          projectEvery: 1,
        })

        worstRitz = Math.max(worstRitz, read.top[0]!.residual)
        tops.push(read.top[0]!.value)
      }

      out.set(s.name, { d: tops[0]!, r: tops[1]! })
      metrics[`cusp${period}f${floor}k${s.name}Dirichlet`] = tops[0]!
      metrics[`cusp${period}f${floor}k${s.name}Reflect`] = tops[1]!
      log(`  k ${s.name} (2 pi / ${period}): top A_D ${tops[0]!.toFixed(10)} (Laplacian ${(24 - tops[0]!).toFixed(6)}), top A_R ${tops[1]!.toFixed(10)} (Laplacian ${(24 - tops[1]!).toExponential(3)})`)
    }

    if (walk) {
      const lines = linesOf(cusp.table)
      const byLength = new Map<number, { count: number; outside: number; closed: number }>()
      let layerRun = 0

      for (const line of lines) {
        let run = 0

        for (const d of line.docks) {
          run = cusp.depth[d] === 0 ? run + 1 : 0
          layerRun = Math.max(layerRun, run)
        }

        const l = line.docks.length
        const entry = byLength.get(l)

        if (entry) {
          entry.count++
          entry.closed += line.closed ? 1 : 0
          continue
        }

        const cosines = lineCosines(cusp.table, line.docks, line.a)

        byLength.set(l, {
          count: 1,
          outside: cosines.filter(c => Math.abs(c) > 0.5 + 1e-9).length,
          closed: line.closed ? 1 : 0,
        })
      }

      metrics[`cusp${period}f${floor}Lines`] = lines.length
      metrics[`cusp${period}f${floor}LayerRun`] = layerRun
      metrics[`cusp${period}f${floor}ClosedLines`] = [...byLength.values()].reduce((s, v) => s + v.closed, 0)
      metrics[`cusp${period}f${floor}EdgeStates`] = [...byLength.values()].reduce((s, v) => s + v.outside, 0)
      log(`  walk: ${lines.length} lines, longest layer run ${layerRun}, by length (count, eigenphases outside the band) ${[...byLength].sort((a, b) => a[0] - b[0]).map(([l, v]) => `${l}:${v.count},${v.outside}`).join(' ')}`)
    }

    return out
  }

  const theta: number[] = []

  for (const floor of plan.floors) {
    theta.push(cuspRead(2, floor, SECTORS_2, false).get('000')!.d)
  }

  const bands: Map<string, { d: number; r: number }>[] = []

  plan.bandFloors.forEach((floor, i) => {
    bands.push(cuspRead(4, floor, SECTORS_4, i === plan.bandFloors.length - 1))
  })

  // ---- the gates ----
  const [small, large] = lambda2 as [number, number]
  const g1 = worstRitz <= 1e-8 && worstWalk <= 1e-12 && worstDispersion <= 1e-12
  const g2 = small <= 23 && large <= 23 && Math.abs(large - small) <= 0.5 && large >= small - 1e-8
  const rising = theta.every((v, i) => i === 0 || v > theta[i - 1]!)
  const g3 = rising && Math.max(...theta) <= MAJORANT
  const cuspGap = theta.map(v => 24 - v)
  const bulkGap = 24 - large
  const bar = g0 && g1 && g2 && bulkGap >= 4 && cuspGap[cuspGap.length - 1]! <= 1 && rising
  const status = !g0 || !g1 || !g2 || !g3 ? 'open' : bar ? 'pass' : 'fail'
  const lastBand = bands[bands.length - 1]!
  const firstBand = bands[0]!
  const bandLine = [...lastBand]
    .map(([k, v]) => `${k} ${(24 - v.d).toFixed(3)}`)
    .join(', ')
  const reflectMove = Math.max(
    ...[...lastBand].filter(([k]) => k !== '000').map(([k, v]) => Math.abs(v.r - firstBand.get(k)!.r)),
  )

  Object.assign(metrics, {
    g0: g0 ? 1 : 0,
    g1: g1 ? 1 : 0,
    g2: g2 ? 1 : 0,
    g3: g3 ? 1 : 0,
    bar: bar ? 1 : 0,
    worstRitzResidual: worstRitz,
    worstWalkResidual: worstWalk,
    worstWalkDispersion: worstDispersion,
    bulkGap,
    cuspGapLargestFloor: cuspGap[cuspGap.length - 1]!,
    rhoLowerBound: Math.max(...theta),
    kesten: KESTEN,
    reflectBandMove: reflectMove,
    seconds: seconds(),
  })

  return verdict({
    status,
    claim: `the dock adjacency's top nontrivial eigenvalue is ${small.toFixed(6)} on K mod (sqrt 2)^${plan.quotients[0]!.twoPower} and ${large.toFixed(6)} on K mod (sqrt 2)^${plan.quotients[1]!.twoPower} (bulk gap ${bulkGap.toFixed(4)}); on the cusp neighborhood with a Dirichlet floor the band is lowest at husk momentum 0, where 24 - theta_F is ${cuspGap.map(v => v.toFixed(4)).join(', ')} at floors ${plan.floors.join(', ')}, so theta_F = ${theta.map(v => v.toFixed(4)).join(', ')} bound the honeycomb's spectral radius from below (Kesten ${KESTEN.toFixed(3)}, majorant ${MAJORANT}); period 4 floor ${plan.bandFloors[plan.bandFloors.length - 1]} Laplacian band bottoms by momentum (2 pi / 4 units): ${bandLine}; the reflecting floor's k = 0 mode is exact (the floor's finite volume) and its other sectors move by up to ${reflectMove.toFixed(4)} between floors; the lone vibe's walk is the fear walk on every quotient line (cos W = cos q / 2, residual ${worstWalk.toExponential(1)}); ${bar ? 'the bulk is gapped and the cusp gapless' : 'the cusp is not gapless: it carries the bulk gap'}`,
    metrics,
    notes:
      'L1 (an instrument read, exact tables, float spectra with explicit residuals). Gates pre-registered in vibe-roadmap-board-0050 before any probe. No random numbers: Lanczos starts are the delta at the base dock (minus the mean, or projected onto a husk-momentum sector by the exact translation automorphisms). Status pass = G0, G1, G2 and the bar; fail = G0 to G2 hold and the bar is missed; open = an instrument, residual or reference gate breaks.',
  })
}

export default experiment({
  id: 'geometry/bulk-gap-cusp',
  code: 'E-GMT-0044',
  title:
    'the {3,4,3,4} dock adjacency on two congruence quotients against the cusp neighborhood per husk momentum: is the bulk gapped and the cusp gapless',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return bulkGapCuspRun(GATE_PLAN)
  },
})
