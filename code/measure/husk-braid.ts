// THE DOUBLE-EXCHANGE PHASE OF TWO HOLES OF THE FULL SEA ON R*, READ AS A WILSON LOOP (item 0023, decision 005). Two
// holes of the register sea, run exactly on E-FND-0161's reduced engine (code/measure/register-holes) at total momentum
// 0, so the state is a function of the relative dock y = x_1 - x_2 and the two fibers (8 each, half +). No hole is held
// and nothing is carried: the read is algebraic, on the rule's own one-cycle transfer.
//
// THE CONNECTION. One cycle T maps psi(y) to psi'(y') = sum_y T(y', y) psi(y). For a slice root e (a D4 root with w = 0,
// the 12 moves of the 3d husk slice) the hop block B(y, e) = T(y + e, y) is the 64 x 64 matrix from the fiber pair at y
// to the fiber pair at y + e. It is read column by column: a delta at y in one fiber pair, one exact cycle, and the
// amplitudes at the 12 docks y + e by a sparse plane-wave projection (exact, the plane waves of distinct docks being
// orthonormal). Its unitary polar part U(y, e) = B (B^dag B)^(-1/2) is the connection, and a loop's holonomy is the
// ordered product of U along it, each step y -> y + e taking U(y, e) (the forward convention: a step is a cycle's hop,
// never the inverse of one).
//
// TWO FIBERS. The engine's fiber at a momentum is the four sector states (momentum independent, so local) and four
// complements found by Gram-Schmidt at each momentum separately. A complement's phase and mixing are a free choice at
// every momentum, so the full 64 x 64 block depends on that choice (a momentum-dependent change of basis is not a
// gauge transform in y). The sector-pair block (both members in the sector, 16 x 16) involves sector states only, at
// both ends and inside (the pair piece of beat 2 acts on the beat-2 sector, also momentum independent), so it is the
// part of B that is the same in every frame. Both are read; `regauge` re-chooses the complements to show which reads
// are frame-free.
//
// THE CONTROL, TYPED. A flux tube of statistical angle theta along the slice z axis through contact: every link that
// crosses the half-plane {y_2 = 0^-, y_1 > 0} takes the Peierls phase e^(+- 2 i theta) (sign by direction), so a loop
// linking the line once takes e^(2 i theta), the double exchange of an anyon of angle theta. On the L torus the cut ends
// at an anti-line at y_1 = L / 2, which no shape here links.
//
// DETERMINISM: no random numbers. FLOATS are measurement on exact pieces (register-holes).

import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { torus, type Torus } from '@/code/measure/register-sea'
import {
  holeCycle,
  holeEngine,
  holeFrame,
  lineScratch,
  newHoles,
  pairAngles,
  toClasses,
  type HoleEngine,
  type HoleFrame,
  type HoleRule,
} from '@/code/measure/register-holes'
import { type KernelOptions } from '@/code/kernel/index'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'

// E-SPN-0175's rule as E-FND-0161 runs it: the member mixers at the light unit, the sector string a unit of V (cap 8)
// and the sector contact v^2, hole angles reversed
const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

export type BraidSetup = {
  t: Torus
  e: HoleEngine
  rule: HoleRule
  free: HoleRule
  // the diagnostic: the pair piece with its string removed (the contact phase alone, at V = 0)
  contact: HoleRule
}

// the frame with fiber 8 (half +), regauged when asked
function setupFrame(L: number): { t: Torus; fr: HoleFrame } {
  const u = unit(LIGHT)
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const t = torus(L)

  return { t, fr: holeFrame(t, Ps, 8) }
}

// the torus, the frame, the two-hole engine at total momentum 0 and the rule. `regauge` re-chooses the complement
// states of both frames at every momentum (see regaugeFrame)
export function braidSetup(
  L: number,
  options?: KernelOptions,
  regauge = false,
): BraidSetup {
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const { t, fr } = setupFrame(L)
  const e = holeEngine(regauge ? regaugeFrame(fr) : fr, 2, 0, options)

  return {
    t,
    e,
    rule: { angle: pairAngles(t, -sAng, CAP, -2 * vAng) },
    free: { angle: null },
    contact: { angle: pairAngles(t, 0, CAP, -2 * vAng) },
  }
}

// ---- small complex matrices (row-major n x n) ----

export type CM = { n: number; re: Float64Array; im: Float64Array }

export const cm = (n: number): CM => ({
  n,
  re: new Float64Array(n * n),
  im: new Float64Array(n * n),
})

export const identity = (n: number): CM => {
  const a = cm(n)

  for (let i = 0; i < n; i++) {
    a.re[i * n + i] = 1
  }

  return a
}

export function mul(a: CM, b: CM): CM {
  const n = a.n
  const o = cm(n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k]!
      const ai = a.im[i * n + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j]!
        const bi = b.im[k * n + j]!

        o.re[i * n + j]! += ar * br - ai * bi
        o.im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return o
}

export function dagger(a: CM): CM {
  const n = a.n
  const o = cm(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      o.re[j * n + i] = a.re[i * n + j]!
      o.im[j * n + i] = -a.im[i * n + j]!
    }
  }

  return o
}

export function maxDiff(a: CM, b: CM): number {
  let m = 0

  for (let k = 0; k < a.re.length; k++) {
    m = Math.max(m, Math.hypot(a.re[k]! - b.re[k]!, a.im[k]! - b.im[k]!))
  }

  return m
}

// the sub-block on the given indices (rows and columns alike)
export function sub(a: CM, idx: readonly number[]): CM {
  const k = idx.length
  const o = cm(k)

  for (let r = 0; r < k; r++) {
    for (let c = 0; c < k; c++) {
      o.re[r * k + c] = a.re[idx[r]! * a.n + idx[c]!]!
      o.im[r * k + c] = a.im[idx[r]! * a.n + idx[c]!]!
    }
  }

  return o
}

export type Polar = {
  U: CM
  // singular values, ascending
  sv: Float64Array
}

// B = U P, U = B V diag(1 / s) V^dag from B^dag B = V diag(s^2) V^dag
export function polar(B: CM): Polar {
  const n = B.n
  const G = mul(dagger(B), B)
  const H = makeComplexMatrix({ rows: n, cols: n })

  // symmetrize (G is Hermitian up to rounding)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      H.re[i * n + j] = (G.re[i * n + j]! + G.re[j * n + i]!) / 2
      H.im[i * n + j] = (G.im[i * n + j]! - G.im[j * n + i]!) / 2
    }
  }

  const eg = eigHermitian({ matrix: H })
  const sv = Float64Array.from(eg.values, x => Math.sqrt(Math.max(0, x)))
  // V diag(1 / s) V^dag
  const R = cm(n)

  for (let a = 0; a < n; a++) {
    const w = sv[a]! > 0 ? 1 / sv[a]! : 0

    for (let i = 0; i < n; i++) {
      const vr = eg.vectorsRe[i * n + a]!
      const vi = eg.vectorsIm[i * n + a]!

      for (let j = 0; j < n; j++) {
        // v_i conj(v_j)
        const ur = eg.vectorsRe[j * n + a]!
        const ui = -eg.vectorsIm[j * n + a]!

        R.re[i * n + j]! += w * (vr * ur - vi * ui)
        R.im[i * n + j]! += w * (vr * ui + vi * ur)
      }
    }
  }

  return { U: mul(B, R), sv }
}

// the eigenphases of a (near) unitary matrix, in (-pi, pi], ascending
export function eigenphases(U: CM): number[] {
  const ev = complexEigenvalues({ re: U.re, im: U.im, n: U.n })

  return ev.re.map((r, i) => Math.atan2(ev.im[i]!, r)).sort((a, b) => a - b)
}

// max |U U^dag - 1|
export function unitarity(U: CM): number {
  return maxDiff(mul(U, dagger(U)), identity(U.n))
}

// ---- the slice ----

// the D4 roots with w = 0: the 12 moves of the 3d husk slice (the fcc mesh)
export const SLICE_ROOTS: readonly (readonly number[])[] = (() => {
  const out: number[][] = []

  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      for (const a of [1, -1]) {
        for (const b of [1, -1]) {
          const d = [0, 0, 0, 0]

          d[i] = a
          d[j] = b
          out.push(d)
        }
      }
    }
  }

  return out
})()

export const rootKey = (e: readonly number[]): number =>
  SLICE_ROOTS.findIndex(r => r.every((x, i) => x === e[i]))

const isSliceRoot = (d: readonly number[]): boolean => rootKey(d) >= 0

// three closed paths round the origin in the slice, each centrally symmetric (p_(k + K/2) = -p_k), every dock at string
// length 2 or more from the origin; first dock first, not repeated at the end
export const PATHS: Readonly<Record<string, readonly (readonly number[])[]>> = {
  // a skew ring of 12 docks at V = 2, climbing to z = +-1 between the axes
  ring: [
    [2, 0, 0, 0],
    [2, 1, 1, 0],
    [1, 2, 1, 0],
    [0, 2, 0, 0],
    [-1, 2, 1, 0],
    [-2, 1, 1, 0],
    [-2, 0, 0, 0],
    [-2, -1, -1, 0],
    [-1, -2, -1, 0],
    [0, -2, 0, 0],
    [1, -2, -1, 0],
    [2, -1, -1, 0],
  ],
  // a flat octagon in the (x, y) plane, its sides zig-zagged by the in-plane roots, 16 docks at V 2 and 3
  octagon: [
    [2, 2, 0, 0],
    [1, 3, 0, 0],
    [0, 2, 0, 0],
    [-1, 3, 0, 0],
    [-2, 2, 0, 0],
    [-3, 1, 0, 0],
    [-2, 0, 0, 0],
    [-3, -1, 0, 0],
    [-2, -2, 0, 0],
    [-1, -3, 0, 0],
    [0, -2, 0, 0],
    [1, -3, 0, 0],
    [2, -2, 0, 0],
    [3, -1, 0, 0],
    [2, 0, 0, 0],
    [3, 1, 0, 0],
  ],
  // a saddle: 16 docks that climb to z = +-2 over the (x, y) diagonals, V 2 and 3
  saddle: [
    [2, 0, 0, 0],
    [2, 1, 1, 0],
    [2, 2, 2, 0],
    [1, 2, 1, 0],
    [0, 2, 0, 0],
    [-1, 2, 1, 0],
    [-2, 2, 2, 0],
    [-2, 1, 1, 0],
    [-2, 0, 0, 0],
    [-2, -1, -1, 0],
    [-2, -2, -2, 0],
    [-1, -2, -1, 0],
    [0, -2, 0, 0],
    [1, -2, -1, 0],
    [2, -2, -2, 0],
    [2, -1, -1, 0],
  ],
}

// the displacement that takes a shape off contact: its interior then holds no image of contact on the L = 8 torus and
// no end of the control's cut
export const DISPLACE: readonly number[] = [4, 4, 0, 0]

// the D4 string length of a vector (not reduced mod L)
export const d4Length = (p: readonly number[]): number => {
  const a = p.map(Math.abs)

  return Math.max(Math.max(...a), a.reduce((s, x) => s + x, 0) / 2)
}

const angleOf = (p: readonly number[]): number => Math.atan2(p[1]!, p[0]!)

export const wrap = (a: number): number => {
  let x = a % (2 * Math.PI)

  if (x > Math.PI) {
    x -= 2 * Math.PI
  }

  if (x <= -Math.PI) {
    x += 2 * Math.PI
  }

  return x
}

export type PathCheck = {
  steps: number
  roots: boolean
  symmetric: boolean
  slice: boolean
  // the least string length from the given centre (unreduced)
  least: number
  // the winding number round the z axis through the centre, in the (x, y) plane
  winding: number
}

export function checkPath(
  path: readonly (readonly number[])[],
  centre: readonly number[] = [0, 0, 0, 0],
): PathCheck {
  const K = path.length
  const rel = path.map(p => p.map((x, i) => x - centre[i]!))
  let roots = true
  let symmetric = K % 2 === 0
  let winding = 0

  for (let k = 0; k < K; k++) {
    const a = rel[k]!
    const b = rel[(k + 1) % K]!

    roots &&= isSliceRoot(b.map((x, i) => x - a[i]!))
    winding += wrap(angleOf(b) - angleOf(a))

    if (K % 2 === 0) {
      symmetric &&= rel[(k + K / 2) % K]!.every((x, i) => x === -a[i]!)
    }
  }

  return {
    steps: K,
    roots,
    symmetric,
    slice: path.every(p => p[3] === 0),
    least: Math.min(...rel.map(d4Length)),
    winding: Math.round(winding / (2 * Math.PI)),
  }
}

export const siteAt = (t: Torus, p: readonly number[]): number => {
  const L = t.L
  const i = t.index.get(p.map(x => ((x % L) + L) % L).join(','))

  if (i === undefined) {
    throw new Error(`husk-braid: ${p.join(',')} is not a D4 site`)
  }

  return i
}

// every dock of the slice w = 0, as coordinates in [0, L)
export const sliceDocks = (t: Torus): number[][] =>
  t.sites.filter(p => p[3] === 0).map(p => [...p])

// the plane wave of a dock over the momentum classes, e^(i 2 pi k_j . y / L) / sqrt N, cached per frame
const waveCache = new WeakMap<object, Map<number, { c: Float64Array; s: Float64Array }>>()

function planeWave(F: HoleFrame['fourier'], i: number): { c: Float64Array; s: Float64Array } {
  let m = waveCache.get(F)

  if (!m) {
    m = new Map()
    waveCache.set(F, m)
  }

  const hit = m.get(i)

  if (hit) {
    return hit
  }

  const N = F.N
  const L = F.L
  const g = F.gridOfSite[i]!
  // the site's coordinates from its grid index (row-major, a b c e)
  const y = [Math.floor(g / L ** 3) % L, Math.floor(g / L ** 2) % L, Math.floor(g / L) % L, g % L]
  const k = 1 / Math.sqrt(N)
  const c = new Float64Array(N)
  const s = new Float64Array(N)

  for (let j = 0; j < N; j++) {
    const q = F.ints[j]!
    const th = (2 * Math.PI * (q[0]! * y[0]! + q[1]! * y[1]! + q[2]! * y[2]! + q[3]! * y[3]!)) / L

    c[j] = Math.cos(th) * k
    s[j] = Math.sin(th) * k
  }

  const out = { c, s }

  m.set(i, out)

  return out
}

// ---- the hop blocks ----

export const FIBER_PAIRS = 64

// the fiber pairs with both members in the sector (b1, b2 < 4), as indices b1 * 8 + b2
export const SECTOR_PAIRS: readonly number[] = (() => {
  const out: number[] = []

  for (let b1 = 0; b1 < 4; b1++) {
    for (let b2 = 0; b2 < 4; b2++) {
      out.push(b1 * 8 + b2)
    }
  }

  return out
})()

// B(y, e) for the 12 slice roots e, indexed as SLICE_ROOTS: row = fiber pair at y + e, column = fiber pair at y
export function hopBlocks(b: BraidSetup, rule: HoleRule, y: readonly number[]): CM[] {
  const fr = b.e.frame
  const F = fr.fourier
  const N = F.N
  const block = fr.fiber ** 2
  const scratch = lineScratch(F)
  const iy = siteAt(b.t, y)
  const waves = SLICE_ROOTS.map(e => planeWave(F, siteAt(b.t, y.map((x, i) => x + e[i]!))))
  const out = SLICE_ROOTS.map(() => cm(block))
  const br = new Float64Array(N)
  const bi = new Float64Array(N)

  for (let col = 0; col < block; col++) {
    br.fill(0)
    bi.fill(0)
    br[iy] = 1
    toClasses(F, br, bi, scratch)

    const s = newHoles(fr, 2, 0)

    for (let T = 0; T < N; T++) {
      s.re[T * block + col] = br[T]!
      s.im[T * block + col] = bi[T]!
    }

    holeCycle(b.e, rule, s)

    for (let r = 0; r < SLICE_ROOTS.length; r++) {
      const u = waves[r]!
      const B = out[r]!

      for (let row = 0; row < block; row++) {
        let ar = 0
        let ai = 0

        for (let T = 0; T < N; T++) {
          const xr = s.re[T * block + row]!
          const xi = s.im[T * block + row]!

          ar += u.c[T]! * xr - u.s[T]! * xi
          ai += u.c[T]! * xi + u.s[T]! * xr
        }

        B.re[row * block + col] = ar
        B.im[row * block + col] = ai
      }
    }
  }

  return out
}

// the fiber swap X_f: (b1, b2) -> (b2, b1), as a permutation of the 64 pair indices
export const swapIndex = (fb: number): number => (fb % 8) * 8 + Math.floor(fb / 8)

// X_f M X_f
export function swapped(M: CM): CM {
  const n = M.n
  const o = cm(n)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      o.re[swapIndex(r) * n + swapIndex(c)] = M.re[r * n + c]!
      o.im[swapIndex(r) * n + swapIndex(c)] = M.im[r * n + c]!
    }
  }

  return o
}

// X_f M (the swap on the left), for the half loop's identification
export function swapLeft(M: CM): CM {
  const n = M.n
  const o = cm(n)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      o.re[swapIndex(r) * n + c] = M.re[r * n + c]!
      o.im[swapIndex(r) * n + c] = M.im[r * n + c]!
    }
  }

  return o
}

// ---- the connection on the slice ----

export type Connection = {
  L: number
  // per slice dock key (coordinates mod L joined), per root: the polar part and the singular values
  U: Map<string, Polar[]>
}

export const dockKey = (L: number, p: readonly number[]): string =>
  p.map(x => ((x % L) + L) % L).join(',')

// the link y -> y + e of a connection, with a typed Peierls phase `peierls` (radians) multiplied in
export function link(c: Connection, y: readonly number[], e: readonly number[], peierls = 0): CM {
  const k = rootKey(e)
  const P = c.U.get(dockKey(c.L, y))?.[k]

  if (!P || k < 0) {
    throw new Error(`husk-braid: no link at ${y.join(',')} along ${e.join(',')}`)
  }

  if (peierls === 0) {
    return P.U
  }

  const cr = Math.cos(peierls)
  const ci = Math.sin(peierls)
  const o = cm(P.U.n)

  for (let m = 0; m < o.re.length; m++) {
    o.re[m] = cr * P.U.re[m]! - ci * P.U.im[m]!
    o.im[m] = cr * P.U.im[m]! + ci * P.U.re[m]!
  }

  return o
}

// the control's Peierls phase on the step a -> b: 2 theta when it crosses the half-plane {y_2 = 0^-, 0 < y_1 < L / 2}
// upward (y_2 < 0 to y_2 >= 0), -2 theta downward, else 0. Coordinates are taken as given (unreduced), so a shape is
// passed in the frame it is drawn in
export function cutPhase(a: readonly number[], b: readonly number[], theta: number, L: number): number {
  const ya = a[1]!
  const yb = b[1]!
  const up = ya < 0 && yb >= 0
  const down = ya >= 0 && yb < 0

  if (!up && !down) {
    return 0
  }

  // the crossing's y_1 at y_2 = 0^- (the point where the step leaves y_2 < 0), reduced to (-L / 2, L / 2]
  const xr = a[0]! + ((b[0]! - a[0]!) * (0 - ya)) / (yb - ya)
  let x = ((xr % L) + L) % L

  if (x > L / 2) {
    x -= L
  }

  if (x === 0 || x === L / 2) {
    throw new Error(`husk-braid: the step ${a.join(',')} -> ${b.join(',')} meets the flux line`)
  }

  if (x < 0) {
    return 0
  }

  return up ? 2 * theta : -2 * theta
}

// the holonomy of a closed loop of docks (first dock first, not repeated): the ordered product of the links, the first
// step on the right. `theta` adds the typed control
export function holonomy(
  c: Connection,
  loop: readonly (readonly number[])[],
  theta = 0,
): CM {
  const K = loop.length
  let W: CM | null = null

  for (let k = 0; k < K; k++) {
    const a = loop[k]!
    const b = loop[(k + 1) % K]!
    const e = b.map((x, i) => x - a[i]!)
    const U = link(c, a, e, theta === 0 ? 0 : cutPhase(a, b, theta, c.L))

    W = W ? mul(U, W) : U
  }

  return W!
}

// the transport along an open path of docks (the first step on the right)
export function transport(
  c: Connection,
  path: readonly (readonly number[])[],
  theta = 0,
): CM {
  let W: CM | null = null

  for (let k = 0; k + 1 < path.length; k++) {
    const a = path[k]!
    const b = path[k + 1]!
    const e = b.map((x, i) => x - a[i]!)
    const U = link(c, a, e, theta === 0 ? 0 : cutPhase(a, b, theta, c.L))

    W = W ? mul(U, W) : U
  }

  return W!
}

// restrict every link of a connection to the sector pairs (the polar part of the 16 x 16 sector block of B, recomputed
// from B, which is passed alongside)
export function sectorConnection(L: number, blocks: Map<string, CM[]>): Connection {
  const U = new Map<string, Polar[]>()

  for (const [k, Bs] of blocks) {
    U.set(
      k,
      Bs.map(B => polar(sub(B, SECTOR_PAIRS))),
    )
  }

  return { L, U }
}

export function fullConnection(L: number, blocks: Map<string, CM[]>): Connection {
  const U = new Map<string, Polar[]>()

  for (const [k, Bs] of blocks) {
    U.set(
      k,
      Bs.map(B => polar(B)),
    )
  }

  return { L, U }
}

// the elementary plaquettes of the slice (the fcc triangles y, y + e1, y + e1 + e2 with e1 + e2 a root), every ordered
// root pair at every dock, each a loop of three docks given unreduced from y
export function triangles(docks: readonly (readonly number[])[]): (readonly number[])[][] {
  const out: (readonly number[])[][] = []

  for (const y of docks) {
    for (const e1 of SLICE_ROOTS) {
      for (const e2 of SLICE_ROOTS) {
        const s = e1.map((x, i) => x + e2[i]!)

        if (!isSliceRoot(s)) {
          continue
        }

        const a = [...y]
        const b = y.map((x, i) => x + e1[i]!)
        const c = b.map((x, i) => x + e2[i]!)

        out.push([a, b, c])
      }
    }
  }

  return out
}

// the least string length of a dock from contact on the torus (over the images)
export function torusLength(L: number, p: readonly number[]): number {
  let best = Infinity

  for (let m = 0; m < 16; m++) {
    const d = p.map((x, k) => {
      const r = ((x % L) + L) % L

      return (m >> k) & 1 ? r - L : r
    })

    best = Math.min(best, d4Length(d))
  }

  return best
}

// ---- the reads ----

// the sector pair swap X_f on the 16 sector pairs (index b1 * 4 + b2), on the left
export function swapLeft16(M: CM): CM {
  const o = cm(16)

  for (let r = 0; r < 16; r++) {
    const s = (r % 4) * 4 + Math.floor(r / 4)

    for (let c = 0; c < 16; c++) {
      o.re[s * 16 + c] = M.re[r * 16 + c]!
      o.im[s * 16 + c] = M.im[r * 16 + c]!
    }
  }

  return o
}

export const scale = (M: CM, cr: number, ci: number): CM => {
  const o = cm(M.n)

  for (let m = 0; m < o.re.length; m++) {
    o.re[m] = cr * M.re[m]! - ci * M.im[m]!
    o.im[m] = cr * M.im[m]! + ci * M.re[m]!
  }

  return o
}

// the largest departure of M from a scalar multiple of the identity, and that scalar's phase (tr M / n)
export function scalarPart(M: CM): { phase: number; modulus: number; off: number } {
  const n = M.n
  let tr = 0
  let ti = 0

  for (let i = 0; i < n; i++) {
    tr += M.re[i * n + i]!
    ti += M.im[i * n + i]!
  }

  tr /= n
  ti /= n

  let off = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      off = Math.max(
        off,
        Math.hypot(M.re[i * n + j]! - (i === j ? tr : 0), M.im[i * n + j]! - (i === j ? ti : 0)),
      )
    }
  }

  return { phase: Math.atan2(ti, tr), modulus: Math.hypot(tr, ti), off }
}

// the eigenphases of A B^dag (the difference of two holonomies on the same fiber)
export const differencePhases = (A: CM, B: CM): number[] => eigenphases(mul(A, dagger(B)))

export const maxAbs = (xs: readonly number[]): number => Math.max(...xs.map(Math.abs))

// the spread of a set of phases on the circle (max - min after centring on their circular mean)
export function circularSpread(xs: readonly number[]): number {
  const mr = xs.reduce((s, x) => s + Math.cos(x), 0)
  const mi = xs.reduce((s, x) => s + Math.sin(x), 0)
  const c = Math.atan2(mi, mr)
  const d = xs.map(x => wrap(x - c))

  return Math.max(...d) - Math.min(...d)
}

// the circular mean of a set of phases
export function circularMean(xs: readonly number[]): number {
  return Math.atan2(
    xs.reduce((s, x) => s + Math.sin(x), 0),
    xs.reduce((s, x) => s + Math.cos(x), 0),
  )
}

// ---- the whole read ----

export type ShapeRead = {
  shape: string
  // the paths' own checks, centred on contact and displaced
  encircling: PathCheck
  displaced: PathCheck
  // eigenphases of W_enc W_disp^dag: the rule, the free rule, the typed control (on the rule)
  rule: number[]
  free: number[]
  control: number[]
  // the control against the rule on the same shape: centred (the tube must add 2 theta) and displaced (0)
  controlLinked: number[]
  controlDisplaced: number[]
  // eigenphases of each holonomy alone (rule, centred and displaced), and the free holonomy's scalar phase and
  // departure from a scalar
  ruleEncircling: number[]
  ruleDisplaced: number[]
  freeScalar: { phase: number; off: number }
  // the half loop y -> -y (the first half of the shape) closed by the sector identification, -X_f T_half: its
  // eigenphases under the rule and the free rule, and with the free half loop's scalar phase removed
  halfRule: number[]
  halfFree: number[]
  halfRuleReferenced: number[]
  // eigenphases of T_half(rule) T_half(free)^dag: what the rule's transport adds to the free half loop
  halfRelative: number[]
}

export type PlaquetteRead = {
  // oriented fcc triangles read (all docks at torus string length >= `least`)
  count: number
  least: number
  // the largest |eigenphase| of a triangle's holonomy: as is, and with the free triangle's scalar phase removed
  rule: number
  ruleReferenced: number
  free: number
  freeReferenced: number
  // the free triangle holonomies' largest departure from a scalar, and the spread of their scalar phases
  freeOff: number
  // the largest referenced rule phase by the triangle's least string length from contact (index = length)
  byLength: number[]
}

export type BraidRead = {
  L: number
  docks: number
  // the sector block's singular values over every link: least and largest, rule and free
  sectorSv: { rule: [number, number]; free: [number, number] }
  // the sector block of every free link as a scalar times a unitary: the largest departure of U_free(e) from a scalar
  freeLinkOff: number
  // B(-y, -e) = X_f B(y, e) X_f (exchange kept by the one-cycle transfer), the largest departure over every link
  exchange: { rule: number; free: number }
  // the free blocks' translation invariance (largest change of B(y, e) over the docks)
  freeTranslation: number
  plaquettes: PlaquetteRead[]
  shapes: ShapeRead[]
}

// every hop block of the slice under a rule, by dock key
export function sliceBlocks(
  b: BraidSetup,
  rule: HoleRule,
  docks: readonly (readonly number[])[],
  log?: (s: string) => void,
): Map<string, CM[]> {
  const out = new Map<string, CM[]>()

  docks.forEach((y, k) => {
    out.set(dockKey(b.t.L, y), hopBlocks(b, rule, y))

    if (log && (k + 1) % 32 === 0) {
      log(`blocks ${k + 1} of ${docks.length}`)
    }
  })

  return out
}

const negate = (p: readonly number[]): number[] => p.map(x => -x)

// the whole read for one rule (default the setup's own) against the free rule. `cache.free` holds the free blocks
// between calls (computed on the first)
export function braidRead(
  b: BraidSetup,
  theta: number,
  log: (s: string) => void = () => {},
  ruleIn: HoleRule = b.rule,
  cache: { free?: Map<string, CM[]> } = {},
): BraidRead {
  const L = b.t.L
  const docks = sliceDocks(b.t)
  const ruleB = sliceBlocks(b, ruleIn, docks, s => log(`rule ${s}`))
  const freeB = cache.free ?? sliceBlocks(b, b.free, docks, s => log(`free ${s}`))

  cache.free = freeB

  const rule = sectorConnection(L, ruleB)
  const free = sectorConnection(L, freeB)

  log('connections built')

  const svRange = (c: Connection): [number, number] => {
    let lo = Infinity
    let hi = 0

    for (const Ps of c.U.values()) {
      for (const P of Ps) {
        lo = Math.min(lo, P.sv[0]!)
        hi = Math.max(hi, P.sv[P.sv.length - 1]!)
      }
    }

    return [lo, hi]
  }

  const ref = freeB.get(dockKey(L, docks[0]!))!
  let freeTranslation = 0

  for (const Bs of freeB.values()) {
    Bs.forEach((B, k) => (freeTranslation = Math.max(freeTranslation, maxDiff(B, ref[k]!))))
  }

  let freeLinkOff = 0

  for (const Ps of free.U.values()) {
    for (const P of Ps) {
      freeLinkOff = Math.max(freeLinkOff, scalarPart(P.U).off)
    }
  }

  const exchangeOf = (blocks: Map<string, CM[]>): number => {
    let m = 0

    for (const y of docks) {
      const Bs = blocks.get(dockKey(L, y))!
      const Bn = blocks.get(dockKey(L, negate(y)))!

      SLICE_ROOTS.forEach((e, k) => {
        m = Math.max(m, maxDiff(Bn[rootKey(negate(e))]!, swapped(Bs[k]!)))
      })
    }

    return m
  }

  const exchange = { rule: exchangeOf(ruleB), free: exchangeOf(freeB) }

  log('exchange read')

  // the plaquettes
  const tris = triangles(docks)
  const plaquettes: PlaquetteRead[] = []

  for (const least of [2, 3]) {
    let count = 0
    let pr = 0
    let prr = 0
    let pf = 0
    let pfr = 0
    let freeOff = 0
    const byLength: number[] = []

    for (const tri of tris) {
      const len = Math.min(...tri.map(p => torusLength(L, p)))

      if (len < least) {
        continue
      }

      count++

      const Wr = holonomy(rule, tri)
      const Wf = holonomy(free, tri)
      const sf = scalarPart(Wf)
      const back = [Math.cos(-sf.phase), Math.sin(-sf.phase)] as const
      const er = eigenphases(Wr)
      const err = eigenphases(scale(Wr, back[0], back[1]))
      const ef = eigenphases(Wf)
      const efr = eigenphases(scale(Wf, back[0], back[1]))

      freeOff = Math.max(freeOff, sf.off)
      pr = Math.max(pr, maxAbs(er))
      prr = Math.max(prr, maxAbs(err))
      pf = Math.max(pf, maxAbs(ef))
      pfr = Math.max(pfr, maxAbs(efr))
      byLength[len] = Math.max(byLength[len] ?? 0, maxAbs(err))
    }

    plaquettes.push({
      count,
      least,
      rule: pr,
      ruleReferenced: prr,
      free: pf,
      freeReferenced: pfr,
      freeOff,
      byLength: Array.from(byLength, x => x ?? 0),
    })
  }

  log('plaquettes read')

  const shapes: ShapeRead[] = Object.entries(PATHS).map(([shape, path]) => {
    const moved = path.map(p => p.map((x, i) => x + DISPLACE[i]!))
    const Wr = holonomy(rule, path)
    const Wrd = holonomy(rule, moved)
    const Wf = holonomy(free, path)
    const Wfd = holonomy(free, moved)
    const Wc = holonomy(rule, path, theta)
    const Wcd = holonomy(rule, moved, theta)
    const half = path.slice(0, path.length / 2 + 1)
    const Hr = scale(swapLeft16(transport(rule, half)), -1, 0)
    const Hf = scale(swapLeft16(transport(free, half)), -1, 0)
    const fs = scalarPart(transport(free, half))

    return {
      shape,
      encircling: checkPath(path),
      displaced: { ...checkPath(moved), least: Math.min(...moved.map(p => torusLength(L, p))) },
      rule: differencePhases(Wr, Wrd),
      free: differencePhases(Wf, Wfd),
      control: differencePhases(Wc, Wcd),
      controlLinked: differencePhases(Wc, Wr),
      controlDisplaced: differencePhases(Wcd, Wrd),
      ruleEncircling: eigenphases(Wr),
      ruleDisplaced: eigenphases(Wrd),
      freeScalar: { phase: scalarPart(Wf).phase, off: scalarPart(Wf).off },
      halfRule: eigenphases(Hr),
      halfFree: eigenphases(Hf),
      halfRuleReferenced: eigenphases(scale(Hr, Math.cos(-fs.phase), Math.sin(-fs.phase))),
      halfRelative: differencePhases(transport(rule, half), transport(free, half)),
    }
  })

  log('shapes read')

  return {
    L,
    docks: docks.length,
    sectorSv: { rule: svRange(rule), free: svRange(free) },
    freeLinkOff,
    exchange,
    freeTranslation,
    plaquettes,
    shapes,
  }
}

// ---- the regauged frame (the frame-dependence check) ----

// a fixed, momentum-dependent unitary on the complements (fiber 4 .. 7) of both frames: a phase e^(i (j mod 7 + 1) b)
// on complement b and a rotation mixing complements 4 and 5 by the angle 0.3 (j mod 5). The sector fibers (0 .. 3) are
// untouched. A1 -> V2 A1 V^dag, A2 -> V A2 V2^dag with V the frame-W change and V2 the frame-W2 change (the same form,
// shifted). Every read that is frame-free must be unchanged
export function regaugeFrame(fr: HoleFrame): HoleFrame {
  const f = fr.fiber
  const make = (j: number, shift: number): CM => {
    const V = identity(f)
    const a = 0.3 * ((j + shift) % 5)
    const c = Math.cos(a)
    const s = Math.sin(a)

    // rotation on (4, 5)
    V.re[4 * f + 4] = c
    V.re[4 * f + 5] = -s
    V.re[5 * f + 4] = s
    V.re[5 * f + 5] = c

    for (let b = 4; b < f; b++) {
      const ph = (((j + shift) % 7) + 1) * b * 0.1
      const pr = Math.cos(ph)
      const pi = Math.sin(ph)

      for (let col = 0; col < f; col++) {
        const xr = V.re[b * f + col]!
        const xi = V.im[b * f + col]!

        V.re[b * f + col] = pr * xr - pi * xi
        V.im[b * f + col] = pr * xi + pi * xr
      }
    }

    return V
  }
  const asCM = (A: { re: Float64Array; im: Float64Array }): CM => ({
    n: f,
    re: Float64Array.from(A.re),
    im: Float64Array.from(A.im),
  })
  const A1 = fr.A1.map((A, j) => {
    const V = make(j, 0)
    const V2 = make(j, 3)

    return mul(mul(V2, asCM(A)), dagger(V))
  })
  const A2 = fr.A2.map((A, j) => {
    const V = make(j, 0)
    const V2 = make(j, 3)

    return mul(mul(V, asCM(A)), dagger(V2))
  })

  return {
    ...fr,
    A1: A1.map(A => ({ ...fr.A1[0]!, re: A.re, im: A.im })),
    A2: A2.map(A => ({ ...fr.A2[0]!, re: A.re, im: A.im })),
  }
}

// ---- the Chern number of the determinant part (item 0045) ----
//
// The sector-pair connection is U(16); its U(1) part is det U. On a closed lattice plane of the slice (a 2-torus inside
// the 3-torus) C = (1 / 2 pi) sum over the plane's oriented plaquettes of the principal det-phase of each plaquette's
// holonomy, the free hop's det-phase of the same steps divided out (decision of item 0045; the forward convention of
// E-FND-0176). A plaquette whose phase reaches pi - margin is not admissible and leaves its plane unread.
//
// PLANES. The slice is the fcc mesh (x + y + z even, w = 0). A coordinate plane r_k = c holds a checkerboard square
// mesh (its in-plane roots +-e_i +- e_j never sum to a root), so its plaquettes are the squares p, p + e_i + e_j,
// p + 2 e_j, p - e_i + e_j (32 on the side-8 torus). A {111} plane s . r = c (mod L) holds a triangular mesh, its
// plaquettes the fcc triangles (128). Every plaquette is oriented positively about the plane's normal.

// only the 16 sector columns of every hop block, the 16 sector rows of each: sub(hopBlocks(y)[k], SECTOR_PAIRS) at a
// quarter of the cycles
export function sectorHopBlocks(b: BraidSetup, rule: HoleRule, y: readonly number[]): CM[] {
  const fr = b.e.frame
  const F = fr.fourier
  const N = F.N
  const block = fr.fiber ** 2
  const scratch = lineScratch(F)
  const iy = siteAt(b.t, y)
  const waves = SLICE_ROOTS.map(e => planeWave(F, siteAt(b.t, y.map((x, i) => x + e[i]!))))
  const n = SECTOR_PAIRS.length
  const out = SLICE_ROOTS.map(() => cm(n))
  const br = new Float64Array(N)
  const bi = new Float64Array(N)

  for (let c = 0; c < n; c++) {
    const col = SECTOR_PAIRS[c]!

    br.fill(0)
    bi.fill(0)
    br[iy] = 1
    toClasses(F, br, bi, scratch)

    const s = newHoles(fr, 2, 0)

    for (let T = 0; T < N; T++) {
      s.re[T * block + col] = br[T]!
      s.im[T * block + col] = bi[T]!
    }

    holeCycle(b.e, rule, s)

    for (let r = 0; r < SLICE_ROOTS.length; r++) {
      const u = waves[r]!
      const B = out[r]!

      for (let rr = 0; rr < n; rr++) {
        const row = SECTOR_PAIRS[rr]!
        let ar = 0
        let ai = 0

        for (let T = 0; T < N; T++) {
          const xr = s.re[T * block + row]!
          const xi = s.im[T * block + row]!

          ar += u.c[T]! * xr - u.s[T]! * xi
          ai += u.c[T]! * xi + u.s[T]! * xr
        }

        B.re[rr * n + c] = ar
        B.im[rr * n + c] = ai
      }
    }
  }

  return out
}

// every sector block of the slice under a rule, by dock key
export function sectorSliceBlocks(
  b: BraidSetup,
  rule: HoleRule,
  docks: readonly (readonly number[])[],
  log?: (s: string) => void,
): Map<string, CM[]> {
  const out = new Map<string, CM[]>()

  docks.forEach((y, k) => {
    out.set(dockKey(b.t.L, y), sectorHopBlocks(b, rule, y))

    if (log && (k + 1) % 64 === 0) {
      log(`sector blocks ${k + 1} of ${docks.length}`)
    }
  })

  return out
}

// the connection from sector blocks that are already 16 x 16
export const connectionOf = (L: number, blocks: Map<string, CM[]>): Connection => ({
  L,
  U: new Map([...blocks].map(([k, Bs]) => [k, Bs.map(B => polar(B))])),
})

// arg det M, by LU with partial pivoting (the pivots' phases summed, so no under- or overflow)
export function detPhase(M: CM): number {
  const n = M.n
  const re = Float64Array.from(M.re)
  const im = Float64Array.from(M.im)
  let phase = 0

  for (let k = 0; k < n; k++) {
    let p = k
    let best = -1

    for (let r = k; r < n; r++) {
      const m = Math.hypot(re[r * n + k]!, im[r * n + k]!)

      if (m > best) {
        best = m
        p = r
      }
    }

    if (best === 0) {
      throw new Error('husk-braid: singular link')
    }

    if (p !== k) {
      phase += Math.PI

      for (let c = 0; c < n; c++) {
        const tr = re[k * n + c]!
        const ti = im[k * n + c]!

        re[k * n + c] = re[p * n + c]!
        im[k * n + c] = im[p * n + c]!
        re[p * n + c] = tr
        im[p * n + c] = ti
      }
    }

    const dr = re[k * n + k]!
    const di = im[k * n + k]!
    const d2 = dr * dr + di * di

    phase += Math.atan2(di, dr)

    for (let r = k + 1; r < n; r++) {
      // f = a_rk / a_kk
      const ar = re[r * n + k]!
      const ai = im[r * n + k]!
      const fr = (ar * dr + ai * di) / d2
      const fi = (ai * dr - ar * di) / d2

      for (let c = k; c < n; c++) {
        const br = re[k * n + c]!
        const bi = im[k * n + c]!

        re[r * n + c]! -= fr * br - fi * bi
        im[r * n + c]! -= fr * bi + fi * br
      }
    }
  }

  return wrap(phase)
}

// the det-phase of every link of a connection, by dock key, indexed as SLICE_ROOTS
export function linkDetPhases(c: Connection): Map<string, Float64Array> {
  const out = new Map<string, Float64Array>()

  for (const [k, Ps] of c.U) {
    out.set(k, Float64Array.from(Ps, P => detPhase(P.U)))
  }

  return out
}

export type ChernPlane = {
  name: string
  kind: 'square' | 'triangle'
  // the plane's normal (3d) and offset: r_k = c, or s . r = c (mod L)
  normal: readonly number[]
  offset: number
  // the plane holds the contact dock y = 0
  contact: boolean
  // the plaquettes, each a loop of docks (4d, w = 0), its first dock reduced to [0, L), the rest unreduced
  loops: (readonly number[])[][]
}

const cross = (a: readonly number[], b: readonly number[]): number[] => [
  a[1]! * b[2]! - a[2]! * b[1]!,
  a[2]! * b[0]! - a[0]! * b[2]!,
  a[0]! * b[1]! - a[1]! * b[0]!,
]

const dot3 = (a: readonly number[], b: readonly number[]): number =>
  a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!

const mod = (x: number, L: number): number => ((x % L) + L) % L

// the coordinate planes (r_k = c, c in [0, L)) and the {111} planes (s . r = c mod L, c even) of the slice
export function slicePlanes(L: number): ChernPlane[] {
  const out: ChernPlane[] = []
  const axes = ['x', 'y', 'z']

  for (let k = 0; k < 3; k++) {
    const i = (k + 1) % 3
    const j = (k + 2) % 3

    for (let c = 0; c < L; c++) {
      const loops: (readonly number[])[][] = []

      for (let a = 0; a < L; a++) {
        for (let b = 0; b < L; b++) {
          if ((a + b + c) % 2 !== 0) {
            continue
          }

          const p = [0, 0, 0, 0]

          p[i] = a
          p[j] = b
          p[k] = c

          const step = (di: number, dj: number): number[] => {
            const q = [...p]

            q[i]! += di
            q[j]! += dj

            return q
          }

          loops.push([p, step(1, 1), step(0, 2), step(-1, 1)])
        }
      }

      const normal = [0, 0, 0]

      normal[k] = 1
      out.push({ name: `${axes[k]}=${c}`, kind: 'square', normal, offset: c, contact: c === 0, loops })
    }
  }

  const normals = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [-1, 1, 1],
  ]
  const roots3 = SLICE_ROOTS.map(r => r.slice(0, 3))

  for (const s of normals) {
    const inPlane = roots3.filter(e => dot3(e, s) === 0)

    for (let c = 0; c < L; c += 2) {
      const loops: (readonly number[])[][] = []
      const seen = new Set<string>()

      for (let x = 0; x < L; x++) {
        for (let y = 0; y < L; y++) {
          // s . r = c (mod L) fixes z; x + y + z is then even, c being even
          const z = mod(s[2]! * (c - s[0]! * x - s[1]! * y), L)
          const p = [x, y, z]

          for (const e1 of inPlane) {
            for (const e2 of inPlane) {
              const sum = e1.map((v, m) => v + e2[m]!)

              if (!roots3.some(r => r.every((v, m) => v === sum[m]))) {
                continue
              }

              if (dot3(cross(e1, e2), s) <= 0) {
                continue
              }

              const q = p.map((v, m) => v + e1[m]!)
              const r = q.map((v, m) => v + e2[m]!)
              const key = [p, q, r]
                .map(v => v.map(u => mod(u, L)).join(','))
                .sort()
                .join('|')

              if (seen.has(key)) {
                continue
              }

              seen.add(key)
              loops.push([[...p, 0], [...q, 0], [...r, 0]])
            }
          }
        }
      }

      out.push({
        name: `${s.map(v => (v > 0 ? '+' : '-')).join('')}=${c}`,
        kind: 'triangle',
        normal: s,
        offset: c,
        contact: c === 0,
        loops,
      })
    }
  }

  return out
}

// every directed link a plane's plaquettes use, as `dock key|root`, with its use count; the plane is a closed oriented
// surface when every used link is used once and its reverse once
export function planeClosed(L: number, plane: ChernPlane): boolean {
  const used = new Map<string, number>()

  for (const loop of plane.loops) {
    for (let m = 0; m < loop.length; m++) {
      const a = loop[m]!
      const b = loop[(m + 1) % loop.length]!
      const k = `${dockKey(L, a)}|${rootKey(b.map((x, i) => x - a[i]!))}`

      used.set(k, (used.get(k) ?? 0) + 1)
    }
  }

  for (const [k, n] of used) {
    const [dock, r] = k.split('|')
    const e = SLICE_ROOTS[Number(r)]!
    const a = dock!.split(',').map(Number)
    const back = `${dockKey(L, a.map((x, i) => x + e[i]!))}|${rootKey(e.map(x => -x))}`

    if (n !== 1 || used.get(back) !== 1) {
      return false
    }
  }

  return true
}

// a typed uniform field B = sign (2 pi / L^2) e_k on the 3-torus in the Landau gauge A = B r_i e_j ((i, j, k) cyclic),
// its transition across r_i = L the gauge function B L r_j: the U(1) phase of the step a -> a + e, a taken reduced.
// Through a plane of area vector A_p it carries B . A_p / 2 pi quanta
export function landauPhase(
  L: number,
  k: number,
  sign: number,
  a: readonly number[],
  e: readonly number[],
): number {
  const i = (k + 1) % 3
  const j = (k + 2) % 3
  const b = (sign * 2 * Math.PI) / (L * L)
  const p = a.map(x => mod(x, L))
  const q = p.map((x, m) => x + e[m]!)
  const wraps = Math.floor(q[i]! / L)

  return b * ((p[i]! + q[i]!) / 2) * (q[j]! - p[j]!) - b * wraps * L * q[j]!
}

// the field of one quantum through a plane: e_k itself for a coordinate plane, e_0 with the normal's sign for a {111}
// plane (whose area vector on the side-L torus is L^2 s)
export const planeField = (plane: ChernPlane): { k: number; sign: number } =>
  plane.kind === 'square'
    ? { k: plane.normal.findIndex(v => v !== 0), sign: 1 }
    : { k: 0, sign: plane.normal[0]! }

export type PlaneChern = {
  name: string
  kind: 'square' | 'triangle'
  contact: boolean
  plaquettes: number
  closed: boolean
  // plaquettes whose principal phase reaches pi - margin in magnitude; any one leaves the plane unread
  inadmissible: number
  largest: number
  // (1 / 2 pi) sum of principal plaquette phases, and its distance from the nearest integer
  C: number
  offInteger: number
  // (1 / 2 pi) sum of the plaquette phases unwrapped (the links' own phases summed): 0 on a reciprocal U(1) field,
  // where every link meets its reverse with the opposite phase; its fractional part is C's
  linkSum: number
}

// the plane read of a link phase field. `phase(a, e)` is the U(1) phase of the step a -> a + e (a reduced or not)
export function planeChern(
  L: number,
  plane: ChernPlane,
  phase: (a: readonly number[], e: readonly number[]) => number,
  margin: number,
): PlaneChern {
  let sum = 0
  let raw = 0
  let inadmissible = 0
  let largest = 0

  for (const loop of plane.loops) {
    let ph = 0

    for (let m = 0; m < loop.length; m++) {
      const a = loop[m]!
      const b = loop[(m + 1) % loop.length]!

      ph += phase(a, b.map((x, i) => x - a[i]!))
    }

    raw += ph

    const w = wrap(ph)

    largest = Math.max(largest, Math.abs(w))

    if (Math.abs(w) > Math.PI - margin) {
      inadmissible++
    }

    sum += w
  }

  const C = sum / (2 * Math.PI)

  return {
    name: plane.name,
    kind: plane.kind,
    contact: plane.contact,
    plaquettes: plane.loops.length,
    closed: planeClosed(L, plane),
    inadmissible,
    largest,
    C,
    offInteger: Math.abs(C - Math.round(C)),
    linkSum: raw / (2 * Math.PI),
  }
}

// the det-phase field of a rule with the free rule's divided out, as a step phase
export function referencedPhase(
  L: number,
  rule: Map<string, Float64Array>,
  free: Map<string, Float64Array> | null,
): (a: readonly number[], e: readonly number[]) => number {
  return (a, e) => {
    const k = dockKey(L, a)
    const r = rootKey(e)
    const v = rule.get(k)?.[r]

    if (v === undefined || r < 0) {
      throw new Error(`husk-braid: no det-phase at ${a.join(',')} along ${e.join(',')}`)
    }

    return free ? v - free.get(k)![r]! : v
  }
}

// ---- the reciprocal connection (decision 010, item 0045) ----
//
// A one-cycle hop block is not a parallel transport: with U_f the polar part of B(y, e) and U_r that of B(y + e, -e),
// each divided by the free rule's own (a scalar), the there-and-back X = U_r U_f carries the endpoints' dynamical phase.
// The connection is the geodesic midpoint V(y, e) = U_f (X^dag)^(1/2), principal root, which is reciprocal identically:
// V(y + e, -e) V(y, e) = 1. The polar part and the root are both taken by iterations that need no eigenvector (below).

// the inverse of a small complex matrix, Gauss-Jordan with partial pivoting
export function inverse(M: CM): CM {
  const n = M.n
  const ar = Float64Array.from(M.re)
  const ai = Float64Array.from(M.im)
  const o = identity(n)

  const swapRows = (re: Float64Array, im: Float64Array, a: number, b: number): void => {
    for (let c = 0; c < n; c++) {
      const tr = re[a * n + c]!
      const ti = im[a * n + c]!

      re[a * n + c] = re[b * n + c]!
      im[a * n + c] = im[b * n + c]!
      re[b * n + c] = tr
      im[b * n + c] = ti
    }
  }

  for (let k = 0; k < n; k++) {
    let p = k
    let best = -1

    for (let r = k; r < n; r++) {
      const m = Math.hypot(ar[r * n + k]!, ai[r * n + k]!)

      if (m > best) {
        best = m
        p = r
      }
    }

    if (best === 0) {
      throw new Error('husk-braid: singular matrix')
    }

    if (p !== k) {
      swapRows(ar, ai, k, p)
      swapRows(o.re, o.im, k, p)
    }

    // row k times 1 / pivot
    const dr = ar[k * n + k]!
    const di = ai[k * n + k]!
    const d2 = dr * dr + di * di
    const ir = dr / d2
    const ii = -di / d2

    for (const [re, im] of [
      [ar, ai],
      [o.re, o.im],
    ] as const) {
      for (let c = 0; c < n; c++) {
        const xr = re[k * n + c]!
        const xi = im[k * n + c]!

        re[k * n + c] = xr * ir - xi * ii
        im[k * n + c] = xr * ii + xi * ir
      }
    }

    for (let r = 0; r < n; r++) {
      if (r === k) {
        continue
      }

      const fr = ar[r * n + k]!
      const fi = ai[r * n + k]!

      if (fr === 0 && fi === 0) {
        continue
      }

      for (const [re, im] of [
        [ar, ai],
        [o.re, o.im],
      ] as const) {
        for (let c = 0; c < n; c++) {
          const br = re[k * n + c]!
          const bi = im[k * n + c]!

          re[r * n + c]! -= fr * br - fi * bi
          im[r * n + c]! -= fr * bi + fi * br
        }
      }
    }
  }

  return o
}

// polar() is not exact enough here: eigHermitian merges eigenvalues closer than 1e-10 (an absolute tolerance), and a
// sector block's B^dag B has every eigenvalue near 6e-4 in tight clusters, so its polar part came back unitary only to
// 2e-5 and a Cayley-transform root built on eigHermitian left V reciprocal only to 1.5e-4. The two iterations below need
// no eigenvector and are blind to degeneracy (Higham, Functions of Matrices, 8.3 and 6.3).

const ITER_MAX = 60

// the unitary polar part of a nonsingular B by Newton's iteration U <- (U + U^(-dag)) / 2 from U = B (scaled by the
// Frobenius norms, then unscaled for the last steps); its singular values from polar() for the record
export function polarNewton(B: CM): Polar {
  const n = B.n
  let U: CM = { n, re: Float64Array.from(B.re), im: Float64Array.from(B.im) }
  let done = false

  for (let it = 0; it < ITER_MAX; it++) {
    const W = dagger(inverse(U))
    const fro = (M: CM): number => Math.sqrt(M.re.reduce((s, x) => s + x * x, 0) + M.im.reduce((s, x) => s + x * x, 0))
    const g = it < 6 ? Math.sqrt(fro(W) / fro(U)) : 1
    const next = cm(n)

    for (let m = 0; m < n * n; m++) {
      next.re[m] = (g * U.re[m]! + W.re[m]! / g) / 2
      next.im[m] = (g * U.im[m]! + W.im[m]! / g) / 2
    }

    const step = maxDiff(next, U)

    U = next

    // quadratic convergence: one step past 1e-8 reaches rounding
    if (it >= 6 && done) {
      break
    }

    done = step <= 1e-8
  }

  return { U, sv: polar(B).sv }
}

// the principal (X^dag)^(1/2) of a unitary X with no eigenvalue on the negative real axis, by the Denman-Beavers
// iteration Y <- (Y + Z^(-1)) / 2, Z <- (Z + Y^(-1)) / 2 from Y = X^dag, Z = 1 (Y -> (X^dag)^(1/2)); X's eigenphases
// from its eigenvalues
export function rootOfDaggerDb(X: CM): { R: CM; phases: number[] } {
  const n = X.n
  let Y = dagger(X)
  let Z = identity(n)
  let done = false

  for (let it = 0; it < ITER_MAX; it++) {
    const Yi = inverse(Y)
    const Zi = inverse(Z)
    const Y1 = cm(n)
    const Z1 = cm(n)

    for (let m = 0; m < n * n; m++) {
      Y1.re[m] = (Y.re[m]! + Zi.re[m]!) / 2
      Y1.im[m] = (Y.im[m]! + Zi.im[m]!) / 2
      Z1.re[m] = (Z.re[m]! + Yi.re[m]!) / 2
      Z1.im[m] = (Z.im[m]! + Yi.im[m]!) / 2
    }

    const step = maxDiff(Y1, Y)

    Y = Y1
    Z = Z1

    if (done) {
      break
    }

    done = step <= 1e-8
  }

  return { R: Y, phases: eigenphases(X) }
}

export type ReciprocalLinks = {
  L: number
  // the midpoint connection V (its singular values carried from the rule's block)
  V: Connection
  // the forward polar parts with the free scalar divided out (the 0023 convention, referenced)
  forward: Connection
  // per dock key, per root: X's eigenphases, and whether the link is admissible (none within `margin` of pi)
  xPhases: Map<string, number[][]>
  admissible: Map<string, boolean[]>
  // the free links' largest departure from a scalar
  freeOff: number
}

// the reciprocal connection of a rule's sector blocks, the free rule's per-link scalar divided out of each oriented
// polar part
export function reciprocalLinks(
  L: number,
  blocks: Map<string, CM[]>,
  free: Map<string, CM[]>,
  margin: number,
): ReciprocalLinks {
  let freeOff = 0
  const freeScalar = new Map<string, number[]>()

  for (const [k, Bs] of free) {
    freeScalar.set(
      k,
      Bs.map(B => {
        const s = scalarPart(polarNewton(B).U)

        freeOff = Math.max(freeOff, s.off)

        return s.phase
      }),
    )
  }

  const fwd = new Map<string, Polar[]>()

  for (const [k, Bs] of blocks) {
    fwd.set(
      k,
      Bs.map((B, r) => {
        const P = polarNewton(B)
        const a = -freeScalar.get(k)![r]!

        return { U: scale(P.U, Math.cos(a), Math.sin(a)), sv: P.sv }
      }),
    )
  }

  const V = new Map<string, Polar[]>()
  const xPhases = new Map<string, number[][]>()
  const admissible = new Map<string, boolean[]>()

  for (const [k, Ps] of fwd) {
    const y = k.split(',').map(Number)
    const xs: number[][] = []
    const ok: boolean[] = []

    V.set(
      k,
      Ps.map((P, r) => {
        const e = SLICE_ROOTS[r]!
        const back = fwd.get(dockKey(L, y.map((x, i) => x + e[i]!)))![rootKey(e.map(x => -x))]!
        const root = rootOfDaggerDb(mul(back.U, P.U))

        xs.push(root.phases)
        ok.push(root.phases.every(p => Math.abs(p) <= Math.PI - margin))

        return { U: mul(P.U, root.R), sv: P.sv }
      }),
    )
    xPhases.set(k, xs)
    admissible.set(k, ok)
  }

  return { L, V: { L, U: V }, forward: { L, U: fwd }, xPhases, admissible, freeOff }
}

// the largest |V(y + e, -e) V(y, e) - 1| over the admissible links
export function reciprocity(rl: ReciprocalLinks): number {
  let m = 0

  for (const [k, Ps] of rl.V.U) {
    const y = k.split(',').map(Number)

    Ps.forEach((P, r) => {
      if (!rl.admissible.get(k)![r]) {
        return
      }

      const e = SLICE_ROOTS[r]!
      const back = rl.V.U.get(dockKey(rl.L, y.map((x, i) => x + e[i]!)))![rootKey(e.map(x => -x))]!

      m = Math.max(m, maxDiff(mul(back.U, P.U), identity(P.U.n)))
    })
  }

  return m
}

// whether every step of a path (closed when `closed`) runs on an admissible link
export function pathAdmissible(
  rl: ReciprocalLinks,
  path: readonly (readonly number[])[],
  closed = true,
): boolean {
  const K = path.length

  for (let m = 0; m < (closed ? K : K - 1); m++) {
    const a = path[m]!
    const b = path[(m + 1) % K]!

    if (!rl.admissible.get(dockKey(rl.L, a))![rootKey(b.map((x, i) => x - a[i]!))]) {
      return false
    }
  }

  return true
}

// a typed scalar field on blocks: every block B(y, e) times e^(i f(y, e)) on fiber 0 only (`fiber0`) or on all fibers
export function phasedBlocks(
  blocks: Map<string, CM[]>,
  f: (y: readonly number[], e: readonly number[]) => number,
  fiber0: boolean,
): Map<string, CM[]> {
  const out = new Map<string, CM[]>()

  for (const [k, Bs] of blocks) {
    const y = k.split(',').map(Number)

    out.set(
      k,
      Bs.map((B, r) => {
        const a = f(y, SLICE_ROOTS[r]!)
        const cr = Math.cos(a)
        const ci = Math.sin(a)

        if (!fiber0) {
          return scale(B, cr, ci)
        }

        const o: CM = { n: B.n, re: Float64Array.from(B.re), im: Float64Array.from(B.im) }

        for (let c = 0; c < B.n; c++) {
          o.re[c] = cr * B.re[c]! - ci * B.im[c]!
          o.im[c] = cr * B.im[c]! + ci * B.re[c]!
        }

        return o
      }),
    )
  }

  return out
}
