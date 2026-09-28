// THE CAUSAL CONE AND THE GROUP SPEEDS OF A LONE EXCITATION UNDER THE FRAME MIXER (E-SPN-0136). note/research/vibe/
// roadmap/remaining-pieces.md, "Auditing the candidate rule (E-SPN-0134)": under the candidate rule (flat links, the love
// sea, E-SPN-0130's fermionic frame mixer) a hole's keyed front reached 4 box steps in 8 beats against the working
// lineon's 8. These are the readings that ask whether that is the cone or the weight at the front.
//
// THE LONE EXCITATION'S BEAT. A lone vibe on the empty mesh, or a lone hole in the love sea, keeps its frame: the mixer
// and the coin act inside the frame's eight slots of one dock, and the stream takes slot q one dock along its root r_q
// and keeps the slot's index (read off the tables). So one beat is U = S P on the frame lattice {sum n_a r_a} (the four
// orthogonal roots of the frame's lines), with P the dock's 8 x 8 (the coin after the mixer). P is READ from the rule
// (ruleFrameMatrix: code/measure/pauli-mixer fermionMixBranch then code/rule/coined-locked-knit coinBranch, on one dock,
// exact in Z[w]/16), never written in. The float form frameMatrix(theta, n) is the same product for any mixer angle and
// the fine coin of code/measure/fine-coin (zeta = e^(2 pi i/(3 n)), n = 1 the working coin): C_n M_theta for a vibe,
// Z conj(C_n M_theta) Z for a hole (Z = -1 on each line's second slot), which ruleFrameMatrix fixes at theta = 2 pi/3, n = 1.
//
// THE CONE. Every beat moves the excitation exactly one root, so after t beats its amplitude sits on sum n_a r_a with
// sum |n_a| <= t: a cross-polytope in the frame's orthonormal coordinates. In D4 dock steps (the graph distance on all
// 24 roots, max(|v|_inf, |v|_1 / 2)) the reach is at most t; along a unit direction u the Euclidean reach is at most
// t max_q (r_q . u), which is c t along the frame's own roots and c t / 2 along the other frames' roots (the frame's body
// diagonals). exactWalk reads the support exactly, so a cancellation at the front would show.
//
// THE GROUP SPEED. For U(K) = S(K) P with S(K) = diag(e^(-i K . r_q)), Hellmann-Feynman on a unitary gives
//     dE/dK = <psi| R |psi> = sum_q |psi_q|^2 r_q     (U psi = e^(-i E) psi, R = diag(r_q)),
// a convex combination of the frame's roots, so the group velocity can never leave the cone above: n . v <= max_q r_q . n.
// Speeds are Euclidean per beat over c = |r| = sqrt 2 (one dock a beat along a root, the lineon's front).
//
// DETERMINISM: no random numbers. EXACT: the walk and the rule's matrices are Eisenstein integers; the band is floats, as
// measurement. NOTHING MOVES: the mixer and coin hand a value to another slot of the frame on its own dock; the stream
// takes each slot's value one dock along.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { FRAME_SLOTS, coinBranch } from '@/code/rule/coined-locked-knit'
import { fermionMixBranch } from '@/code/measure/pauli-mixer'
import type { Branch } from '@/code/rule/doublet-locked-knit'

const ROOTS = rootsD4()

// Eisenstein integers a + b w, w^2 = -1 - w
export type Eis = [bigint, bigint]

const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
const eMul = (x: Eis, y: Eis): Eis => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]
export const eNorm = (x: Eis): bigint => x[0] * x[0] - x[0] * x[1] + x[1] * x[1]
const isZero = (x: Eis): boolean => x[0] === 0n && x[1] === 0n

// the roots of frame f's slots, in frame-slot order (q = 2 a + side)
export const frameRoots = (f: number): number[][] => (FRAME_SLOTS[f] as readonly number[]).map(d => [...(ROOTS[d] as number[])])

// ---- the rule's own dock matrix ----

// THE DOCK MATRIX OF THE RULE, exact: the numerators over 16 of the mixer then the coin on one dock, P[to][from], for a
// lone vibe (an otherwise empty dock) or a lone hole (an otherwise full love dock), read from fermionMixBranch and
// coinBranch. On one dock the other frames and lines are full or empty, so their phases are read in too
export function ruleFrameMatrix(f: number, hole: boolean): Eis[][] {
  const ss = FRAME_SLOTS[f] as readonly number[]
  const P: Eis[][] = Array.from({ length: 8 }, () => Array.from({ length: 8 }, (): Eis => [0n, 0n]))

  for (let q = 0; q < 8; q++) {
    const br: Branch = { vibe: new Int8Array(24), point: new Int8Array(24), open: new Uint8Array(24), store: new Int8Array(12), spoint: new Int8Array(12), sopen: new Uint8Array(12), a: 1n, b: 0n, k: 0 }

    if (hole) {
      br.vibe.fill(1)
      br.open.fill(1)
    }

    br.vibe[ss[q] as number] = hole ? 0 : 1
    br.open[ss[q] as number] = hole ? 0 : 1

    for (const o of fermionMixBranch(1, br, false).flatMap(b => coinBranch(1, b, false))) {
      const at = [0, 1, 2, 3, 4, 5, 6, 7].filter(r => (o.vibe[ss[r] as number] !== 0) !== hole)

      if (at.length !== 1) throw new Error(`frame-cone: a branch left the one-excitation sector (${at.length} excitations)`)
      if (o.k > 4) throw new Error(`frame-cone: a branch over 2^${o.k}, not 16`)

      const scale = 1n << BigInt(4 - o.k)
      const r = at[0] as number

      P[r]![q] = eAdd(P[r]![q] as Eis, [o.a * scale, o.b * scale])
    }
  }

  return P
}

// ---- the float dock matrix for any mixer angle and fine coin ----

export type CMatrix = { re: Float64Array; im: Float64Array }

// C_n M_theta (a vibe) or Z conj(C_n M_theta) Z (a hole), row-major, P[to * 8 + from]
export function frameMatrix(theta: number, n: number, hole: boolean): CMatrix {
  const N = 8
  const er = (Math.cos(theta) - 1) / 8
  const ei = Math.sin(theta) / 8
  const z = [Math.cos((2 * Math.PI) / (3 * n)), Math.sin((2 * Math.PI) / (3 * n))]
  const keep = [(1 + (z[0] as number)) / 2, (z[1] as number) / 2]
  const cross = [(1 - (z[0] as number)) / 2, -(z[1] as number) / 2]
  const re = new Float64Array(N * N)
  const im = new Float64Array(N * N)

  for (let r = 0; r < N; r++) {
    for (let q = 0; q < N; q++) {
      // (C M)[r][q] = keep M[r][q] + cross M[r ^ 1][q]
      const m0 = [(r === q ? 1 : 0) + er, ei]
      const m1 = [((r ^ 1) === q ? 1 : 0) + er, ei]
      let a = (keep[0] as number) * (m0[0] as number) - (keep[1] as number) * (m0[1] as number) + (cross[0] as number) * (m1[0] as number) - (cross[1] as number) * (m1[1] as number)
      let b = (keep[0] as number) * (m0[1] as number) + (keep[1] as number) * (m0[0] as number) + (cross[0] as number) * (m1[1] as number) + (cross[1] as number) * (m1[0] as number)

      if (hole) {
        const sign = (r & 1) === (q & 1) ? 1 : -1

        a *= sign
        b *= -sign
      }

      re[r * N + q] = a
      im[r * N + q] = b
    }
  }

  return { re, im }
}

// the largest entry gap between the rule's exact matrix (over 16) and the float form
export function matrixGap(exact: Eis[][], m: CMatrix): number {
  const wr = -0.5
  const wi = Math.sqrt(3) / 2
  let gap = 0

  for (let r = 0; r < 8; r++) {
    for (let q = 0; q < 8; q++) {
      const [a, b] = (exact[r] as Eis[])[q] as Eis
      const x = (Number(a) + Number(b) * wr) / 16
      const y = (Number(b) * wi) / 16

      gap = Math.max(gap, Math.hypot(x - (m.re[r * 8 + q] as number), y - (m.im[r * 8 + q] as number)))
    }
  }

  return gap
}

// ---- the exact walk ----

export type Site = { v: number[]; amp: Eis[] }

// the exact amplitude of the lone excitation on the frame lattice, U = S P, from one slot at the origin; numerators
// over 16^t. `each` sees the sites after beat t (1-based)
export function exactWalk(P: Eis[][], roots: readonly (readonly number[])[], startSlot: number, beats: number, each: (t: number, sites: Map<string, Site>) => void): void {
  let sites = new Map<string, Site>()
  const origin: Eis[] = Array.from({ length: 8 }, (): Eis => [0n, 0n])

  origin[startSlot] = [1n, 0n]
  sites.set('0,0,0,0', { v: [0, 0, 0, 0], amp: origin })

  for (let t = 1; t <= beats; t++) {
    const next = new Map<string, Site>()

    for (const s of sites.values()) {
      for (let r = 0; r < 8; r++) {
        let x: Eis = [0n, 0n]

        for (let q = 0; q < 8; q++) {
          const a = s.amp[q] as Eis

          if (!isZero(a)) x = eAdd(x, eMul((P[r] as Eis[])[q] as Eis, a))
        }

        if (isZero(x)) continue

        const v = s.v.map((c, k) => c + ((roots[r] as readonly number[])[k] as number))
        const key = v.join(',')
        let site = next.get(key)

        if (!site) {
          site = { v, amp: Array.from({ length: 8 }, (): Eis => [0n, 0n]) }
          next.set(key, site)
        }

        site.amp[r] = eAdd(site.amp[r] as Eis, x)
      }
    }

    for (const [k, s] of next) if (s.amp.every(isZero)) next.delete(k)
    sites = next
    each(t, sites)
  }
}

// the float walk (any theta, n); a component counts as reached when its weight is above `floor` times the start's
export function floatWalk(P: CMatrix, roots: readonly (readonly number[])[], startSlot: number, beats: number, each: (t: number, sites: Map<string, { v: number[]; re: Float64Array; im: Float64Array }>) => void): void {
  type F = { v: number[]; re: Float64Array; im: Float64Array }
  let sites = new Map<string, F>()
  const o: F = { v: [0, 0, 0, 0], re: new Float64Array(8), im: new Float64Array(8) }

  o.re[startSlot] = 1
  sites.set('0,0,0,0', o)

  for (let t = 1; t <= beats; t++) {
    const next = new Map<string, F>()

    for (const s of sites.values()) {
      for (let r = 0; r < 8; r++) {
        let xr = 0
        let xi = 0

        for (let q = 0; q < 8; q++) {
          const pr = P.re[r * 8 + q] as number
          const pi = P.im[r * 8 + q] as number

          xr += pr * (s.re[q] as number) - pi * (s.im[q] as number)
          xi += pr * (s.im[q] as number) + pi * (s.re[q] as number)
        }

        if (xr === 0 && xi === 0) continue

        const v = s.v.map((c, k) => c + ((roots[r] as readonly number[])[k] as number))
        const key = v.join(',')
        let site = next.get(key)

        if (!site) {
          site = { v, re: new Float64Array(8), im: new Float64Array(8) }
          next.set(key, site)
        }

        site.re[r]! += xr
        site.im[r]! += xi
      }
    }

    sites = next
    each(t, sites)
  }
}

// the D4 graph distance of a lattice vector in dock steps (every root one step): max(|v|_inf, |v|_1 / 2)
export const d4Steps = (v: readonly number[]): number => Math.max(...v.map(Math.abs), v.reduce((s, x) => s + Math.abs(x), 0) / 2)

// the cone's bound along a unit direction, over c: max_q (r_q . u) / |r|
export const coneBound = (roots: readonly (readonly number[])[], u: readonly number[]): number => Math.max(...roots.map(r => r.reduce((s, x, k) => s + x * (u[k] as number), 0))) / Math.SQRT2

// ---- the band and its group velocities ----

export type BandPoint = { phase: number[]; velocity: number[][] }

// the eigenphases of U(K) = S(K) P and each eigenvector's group velocity dE/dK = sum_q |psi_q|^2 r_q (Hellmann-Feynman)
export function bandPoint(P: CMatrix, roots: readonly (readonly number[])[], K: readonly number[]): BandPoint {
  const re = new Float64Array(64)
  const im = new Float64Array(64)

  for (let r = 0; r < 8; r++) {
    const ph = -(roots[r] as readonly number[]).reduce((s, x, k) => s + x * (K[k] as number), 0)
    const c = Math.cos(ph)
    const s = Math.sin(ph)

    for (let q = 0; q < 8; q++) {
      const a = P.re[r * 8 + q] as number
      const b = P.im[r * 8 + q] as number

      re[r * 8 + q] = c * a - s * b
      im[r * 8 + q] = c * b + s * a
    }
  }

  const e = complexEigenvalues({ re, im, n: 8 })
  const phase: number[] = []
  const velocity: number[][] = []

  e.re.forEach((x, i) => {
    const y = e.im[i] as number
    const psi = complexEigenvector({ re, im, n: 8, value: [x, y] })
    const v = [0, 0, 0, 0]

    for (let q = 0; q < 8; q++) {
      const w = (psi.re[q] as number) ** 2 + (psi.im[q] as number) ** 2

      for (let k = 0; k < 4; k++) v[k]! += w * ((roots[q] as readonly number[])[k] as number)
    }

    phase.push(Math.atan2(y, x))
    velocity.push(v)
  })

  return { phase, velocity }
}

// the frame lattice's momentum from its line phases k_a = K . r_a (the four first-slot roots, orthogonal, |r|^2 = 2)
export const momentumOf = (roots: readonly (readonly number[])[], k: readonly number[]): number[] =>
  [0, 1, 2, 3].map(j => [0, 1, 2, 3].reduce((s, a) => s + ((k[a] as number) * ((roots[2 * a] as readonly number[])[j] as number)) / 2, 0))

const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] as number), 0)

// THE TOP GROUP SPEED along each unit direction, over c: max over K and bands of u . v / sqrt 2. A G^4 grid of line
// phases (offset half a step, off the degenerate points), then coordinate ascent from the best grid point per direction,
// the step halved down to `finest`
export function topSpeeds(P: CMatrix, roots: readonly (readonly number[])[], directions: readonly (readonly number[])[], G: number, finest = 1e-4): { speed: number[]; at: number[][] } {
  const best = directions.map(() => ({ s: -Infinity, k: [0, 0, 0, 0] }))
  const h = (2 * Math.PI) / G
  const along = (k: number[]): number[] => {
    const b = bandPoint(P, roots, momentumOf(roots, k))

    return directions.map(u => Math.max(...b.velocity.map(v => dot(u, v))) / Math.SQRT2)
  }

  for (let i = 0; i < G ** 4; i++) {
    const k = [0, 1, 2, 3].map(a => -Math.PI + ((Math.floor(i / G ** a) % G) + 0.5) * h)
    const s = along(k)

    s.forEach((x, d) => {
      if (x > (best[d] as { s: number }).s) best[d] = { s: x, k }
    })
  }

  best.forEach((b, d) => {
    let step = h / 2

    while (step >= finest) {
      let moved = false

      for (let a = 0; a < 4; a++) {
        for (const sgn of [1, -1]) {
          const k = b.k.slice()

          k[a]! += sgn * step

          const x = (along(k)[d] as number)

          if (x > b.s) {
            b.s = x
            b.k = k
            moved = true
          }
        }
      }

      if (!moved) step /= 2
    }
  })

  return { speed: best.map(b => b.s), at: best.map(b => b.k) }
}

// the group velocity by a central difference of the eigenphases along u at K, matched to each Hellmann-Feynman band by
// its phase: the largest gap between the two readings of u . v (a second method for bandPoint)
export function velocityCheck(P: CMatrix, roots: readonly (readonly number[])[], K: readonly number[], u: readonly number[], h = 1e-5): number {
  const b = bandPoint(P, roots, K)
  const plus = bandPoint(P, roots, K.map((x, k) => x + h * (u[k] as number))).phase
  const minus = bandPoint(P, roots, K.map((x, k) => x - h * (u[k] as number))).phase
  const wrap = (x: number): number => Math.atan2(Math.sin(x), Math.cos(x))
  let gap = 0

  b.phase.forEach((p, i) => {
    const near = (list: number[]): number => list.reduce((m, x) => (Math.abs(wrap(x - p)) < Math.abs(wrap(m - p)) ? x : m), list[0] as number)
    // E = -phase
    const fd = -wrap(near(plus) - near(minus)) / (2 * h)

    gap = Math.max(gap, Math.abs(fd - dot(u, b.velocity[i] as number[])))
  })

  return gap
}
