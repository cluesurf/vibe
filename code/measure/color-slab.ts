// THE RULE'S OWN COLOUR ON THE WALL SLAB (moving-matter item 0049, key 1 of research/mass-inputs.md). The register member
// of E-FRC-0267's chiral slab (code/measure/anomaly-matching-walls chiralSlab: one sector half, 96 modes a dock, the
// Wilson set on the depth classes below L / 2 and the plain set above) carried as a colour triplet: the slot crossing link
// (x, d) turns the colour by the link's Sigma(648) matrix (code/measure/holonomy-caging roleLinks, E-SPN-0132's frozen
// grid moves lifted by a Z3 centre section). Real space, no Bloch momentum: a colour field that is not translation
// invariant has none.
//
// THE REDUCTION (exact, not an approximation). Each piece is P = X G (wilson-register mixerPiece), X the slot swap
// d <-> -d and G = 1 + E (g - 1) E^dag with E the dock's Q_S + Q_D range on the half (r = 8 register directions, colour a
// spectator). The stream T moves slot d of x to slot d of x + r_d with the link R(x, d), and a link's reverse is its
// inverse, so T' = T X is a Hermitian involution and U = T P1 T P0 = T' G1' T' G0' (G0' = G of beat 0). Every vector
// w = E a + T' E b of W = R + T' R then maps to
//   U w = E a' + T' E b',   a' = g0 a + (g0 - 1) C b,   b' = g1 b + (g1 - 1) C a',   C = E^dag T' E (a Hermitian hop),
// and U is the identity on W's complement (U y = y for y orthogonal to R and T' R). So the non-flat spectrum is read in the
// coordinates z = (a, b), 2 r k numbers a dock, with the Gram metric M = [[1, C], [C, 1]] (W's inner product). M can be
// singular (R and T' R meet: the uniform state at identity links), and on its kernel the coordinate map is exactly the
// identity (a' = a, b' = b), so kernel parts sit at A = -1 with the flat states and never reach a window at pi.
//
//   bulkBox / slabBox    the side-8 4D box (code/substrate/d4-box-integer, 4096 docks, the weave's own box) and the slab
//                        8^3 x L: D4 modulo 8 D3 (transverse) and L e_3 (depth), 512 docks a depth class
//   slabWeave            the vibe-weave link numbers on the slab box (vibe-weave linkStart over link slots 24 x + d, a
//                        link met first gets its move, the reverse the inverse move), the box E-SPN-0132's field lives on
//   colorPieces          E, g per (set, beat), and the residual of P = X (1 + E (g - 1) E^dag)
//   colorOp              the coordinate cycle U, U^dag, A = -(U + U^dag) / 2, the metric M, the full-space vector of a
//                        coordinate vector, and the full-space cycle T P1 T P0 (the instrument the reduction is checked on)
//   colorLevelsNearPi    wall-face levelsNearPi (Lanczos on A, deflated restarts, the final Rayleigh-Ritz on U) in the M
//                        metric, for a window that holds few or no levels (STEP 1's bulk)
//   colorCluster         a Chebyshev-filtered block subspace iteration on A with the final Rayleigh-Ritz on U, for a tight
//                        cluster at pi (STEP 2's 24 wall levels: +delta and -delta are degenerate in A, and the cluster's
//                        spread in A, delta^2 / 2, is below what a single-vector Krylov space resolves)
//   colorClusterU        the same filter, with the Rayleigh-Ritz, window, guard and stop all on U over the whole block
//                        (item 0072: A squares the offset, so a split cluster near pi merges in A's eigHermitian)
//   d3Read               the wall-A window projector diagonalized in the window levels' span, M the A-to-B block of
//                        H_eff = -wrap(phase - pi), D3 = |det M|^(1/4), the singular values of M
//
// DETERMINISM: no random numbers. Start vectors are fixed trigonometric patterns; a gauge transform's group elements are
// an integer Weyl stream (vibe-weave linkStart). FLOAT: the links are the exact Sigma(648) lifts as floats, the spectra
// measurement.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { DOCK_ROOTS, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { gridMoves, linkStart } from '@/code/rule/vibe-weave'
import { d4BoxMesh } from '@/code/substrate/d4-box-integer'
import type { Mesh } from '@/code/tool/mesh'
import {
  unitaryEigen,
  type CVec,
  type Dense,
  type HalfSet,
} from '@/code/measure/wilson-register'

const SLOTS = 24
const HALF_REG = 4
const HALF_MODES = SLOTS * HALF_REG

// ---- complex vectors ----

const newVec = (n: number): CVec => ({
  re: new Float64Array(n),
  im: new Float64Array(n),
})

const copyVec = (v: CVec): CVec => ({
  re: Float64Array.from(v.re),
  im: Float64Array.from(v.im),
})

// <a|b>
function dot(a: CVec, b: CVec): [number, number] {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    const ar = a.re[k]!
    const ai = a.im[k]!
    const br = b.re[k]!
    const bi = b.im[k]!

    r += ar * br + ai * bi
    i += ar * bi - ai * br
  }

  return [r, i]
}

// y += c x
function axpy(y: CVec, cr: number, ci: number, x: CVec): void {
  for (let k = 0; k < y.re.length; k++) {
    const xr = x.re[k]!
    const xi = x.im[k]!

    y.re[k]! += cr * xr - ci * xi
    y.im[k]! += cr * xi + ci * xr
  }
}

function scaleVec(v: CVec, s: number): void {
  for (let k = 0; k < v.re.length; k++) {
    v.re[k]! *= s
    v.im[k]! *= s
  }
}

// ---- the boxes ----

export type ColorBox = {
  cells: number
  // nb[x * 24 + d]: the dock x + r_d
  nb: Int32Array
  // src[y * 24 + d]: the dock y - r_d, whose slot d streams into y
  src: Int32Array
  // the depth class of each dock (0 on the bulk box)
  depth: Int32Array
  L: number
  mesh: Mesh
}

function boxFrom(mesh: Mesh, depthOf: (x: number) => number, L: number): ColorBox {
  const cells = mesh.cellCount
  const nb = new Int32Array(cells * SLOTS)
  const src = new Int32Array(cells * SLOTS)
  const depth = new Int32Array(cells)

  for (let x = 0; x < cells; x++) {
    depth[x] = depthOf(x)

    for (let d = 0; d < SLOTS; d++) {
      nb[x * SLOTS + d] = mesh.neighbour(x, d)
      src[x * SLOTS + d] = mesh.neighbour(x, OPPOSITE[d]!)
    }
  }

  return { cells, nb, src, depth, L, mesh }
}

// the weave's own box, D4 modulo side D4 (side^4 docks)
export function bulkBox(side: number): ColorBox {
  return boxFrom(d4BoxMesh({ side }), () => 0, 1)
}

const mod = (v: number, m: number): number => ((v % m) + m) % m

// the slab: D4 modulo the transverse periods side D3 = {side v : v in Z^3, v0 + v1 + v2 even} and the depth period
// (0, 0, 0, L). A dock is (x0, x1, x2, c), c = x3 mod L; x0, x1 are reduced by side (1, 0, 1) and side (0, 1, 1), x2 mod
// 2 side, and x2's parity is fixed by the D4 condition, so the index is ((c side + x0) side + x1) side + floor(x2 / 2)
export function slabBox(side: number, L: number): ColorBox {
  if (side % 2 !== 0 || L % 2 !== 0) {
    throw new Error('slabBox: side and L must be even')
  }

  const cells = side * side * side * L
  const coords = (x: number): number[] => {
    const m = x % side
    const x1 = Math.floor(x / side) % side
    const x0 = Math.floor(x / side ** 2) % side
    const c = Math.floor(x / side ** 3)
    const parity = mod(x0 + x1 + c, 2)

    return [x0, x1, 2 * m + parity, c]
  }
  const index = (p: readonly number[]): number => {
    let [x0, x1, x2] = [p[0]!, p[1]!, p[2]!]
    const c = mod(p[3]!, L)
    const q0 = Math.floor(x0 / side)

    x0 -= q0 * side
    x2 -= q0 * side

    const q1 = Math.floor(x1 / side)

    x1 -= q1 * side
    x2 -= q1 * side
    x2 = mod(x2, 2 * side)

    if (mod(x0 + x1 + x2 + c, 2) !== 0) {
      throw new Error('slabBox: not a D4 point')
    }

    return ((c * side + x0) * side + x1) * side + Math.floor(x2 / 2)
  }
  const mesh: Mesh = {
    id: `d4-slab-${side}-${L}`,
    degree: SLOTS,
    cellCount: cells,
    neighbour(cell, direction) {
      const p = coords(cell)
      const r = DOCK_ROOTS[direction]!

      return index(p.map((v, k) => v + r[k]!))
    },
    opposite(direction) {
      return OPPOSITE[direction]!
    },
  }

  return boxFrom(mesh, x => coords(x)[3]!, L)
}

// vibe-weave's link numbers on a box: link slot i = 24 x + d met first gets the move linkStart(i, 216), its reverse the
// inverse move (makeVibeWeave's loop, on any mesh)
export function slabWeave(box: ColorBox): {
  mesh: Mesh
  opposite: number[]
  links: Int16Array
} {
  const moves = gridMoves()
  const links = new Int16Array(box.cells * SLOTS).fill(-1)
  const opposite = Array.from({ length: SLOTS }, (_, d) => OPPOSITE[d]!)

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      if (links[x * SLOTS + d]! >= 0) {
        continue
      }

      const g = linkStart(x * SLOTS + d, moves.act.length)
      const y = box.nb[x * SLOTS + d]!

      links[x * SLOTS + d] = g
      links[y * SLOTS + opposite[d]!] = moves.inverse[g]!
    }
  }

  return { mesh: box.mesh, opposite, links }
}

// ---- the links ----

// m: 2 k^2 floats a link slot x * 24 + d (re, im interleaved, row major), the matrix carried from x to x + r_d
export type ColorLinks = { k: number; m: Float64Array }

export function identityLinks(box: ColorBox, k: number): ColorLinks {
  const m = new Float64Array(box.cells * SLOTS * 2 * k * k)

  for (let l = 0; l < box.cells * SLOTS; l++) {
    for (let c = 0; c < k; c++) {
      m[l * 2 * k * k + 2 * (c * k + c)] = 1
    }
  }

  return { k, m }
}

// a role field (holonomy-caging roleLinks: element indices into 18-float matrices)
export function linksOf(
  box: ColorBox,
  role: { k: number; mats: readonly Float64Array[]; link: Int32Array },
): ColorLinks {
  const w = 2 * role.k * role.k
  const m = new Float64Array(box.cells * SLOTS * w)

  for (let l = 0; l < box.cells * SLOTS; l++) {
    m.set(role.mats[role.link[l]!]!, l * w)
  }

  return { k: role.k, m }
}

// a constant diagonal link diag(e^(2 pi i theta_c r0)) on every link (cell flux 0: every closed contractible loop has
// sum r0 = 0), theta in turns, k = turns.length
export function twistLinks(box: ColorBox, turns: readonly number[]): ColorLinks {
  const k = turns.length
  const m = new Float64Array(box.cells * SLOTS * 2 * k * k)

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const l = x * SLOTS + d
      const r0 = DOCK_ROOTS[d]![0]!

      turns.forEach((t, c) => {
        m[l * 2 * k * k + 2 * (c * k + c)] = Math.cos(2 * Math.PI * t * r0)
        m[l * 2 * k * k + 2 * (c * k + c) + 1] = Math.sin(2 * Math.PI * t * r0)
      })
    }
  }

  return { k, m }
}

// k x k complex products on interleaved arrays
function mul3(a: Float64Array, ao: number, b: Float64Array, bo: number, k: number): Float64Array {
  const out = new Float64Array(2 * k * k)

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      let r = 0
      let im = 0

      for (let l = 0; l < k; l++) {
        const xr = a[ao + 2 * (i * k + l)]!
        const xi = a[ao + 2 * (i * k + l) + 1]!
        const yr = b[bo + 2 * (l * k + j)]!
        const yi = b[bo + 2 * (l * k + j) + 1]!

        r += xr * yr - xi * yi
        im += xr * yi + xi * yr
      }

      out[2 * (i * k + j)] = r
      out[2 * (i * k + j) + 1] = im
    }
  }

  return out
}

function daggerK(a: Float64Array, k: number): Float64Array {
  const out = new Float64Array(2 * k * k)

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      out[2 * (i * k + j)] = a[2 * (j * k + i)]!
      out[2 * (i * k + j) + 1] = -a[2 * (j * k + i) + 1]!
    }
  }

  return out
}

// the site-wise gauge transform R'(x, d) = g(x + r_d) R(x, d) g(x)^dag, g(x) one k x k unitary a dock
export function gaugeLinks(
  box: ColorBox,
  links: ColorLinks,
  g: (x: number) => Float64Array,
): ColorLinks {
  const k = links.k
  const w = 2 * k * k
  const m = new Float64Array(links.m.length)

  for (let x = 0; x < box.cells; x++) {
    const gxDag = daggerK(g(x), k)

    for (let d = 0; d < SLOTS; d++) {
      const l = x * SLOTS + d
      const gy = g(box.nb[l]!)
      const left = mul3(gy, 0, links.m, l * w, k)

      m.set(mul3(left, 0, gxDag, 0, k), l * w)
    }
  }

  return { k, m }
}

// the group elements of a gauge transform: element linkStart(x, count, offset) of a list, an integer Weyl stream
export function weylGauge(
  elements: readonly Float64Array[],
  offset: number,
): (x: number) => Float64Array {
  return x => elements[linkStart(x, elements.length, offset)]!
}

// max over links of |R(y, -d) R(x, d) - 1| and of |R R^dag - 1|
export function linkGaps(box: ColorBox, links: ColorLinks): { reverse: number; unitary: number } {
  const k = links.k
  const w = 2 * k * k

  let reverse = 0
  let unitary = 0

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const l = x * SLOTS + d
      const back = box.nb[l]! * SLOTS + OPPOSITE[d]!
      const p = mul3(links.m, back * w, links.m, l * w, k)
      const u = mul3(links.m, l * w, daggerK(links.m.subarray(l * w, l * w + w), k), 0, k)

      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          const id = i === j ? 1 : 0

          reverse = Math.max(reverse, Math.hypot(p[2 * (i * k + j)]! - id, p[2 * (i * k + j) + 1]!))
          unitary = Math.max(unitary, Math.hypot(u[2 * (i * k + j)]! - id, u[2 * (i * k + j) + 1]!))
        }
      }
    }
  }

  return { reverse, unitary }
}

// ---- the pieces ----

export type ColorPieces = {
  r: number
  // E[mode * r + i], real: the orthonormal Q_S + Q_D range on the half
  E: Float64Array
  // g[set][beat] and its dagger, r x r complex (re, im row major)
  g: { re: Float64Array; im: Float64Array }[][]
  gDag: { re: Float64Array; im: Float64Array }[][]
  // the pieces themselves, for the full-space instrument
  P: CMatrix[][]
  // max |X P - 1 - E (g - 1) E^dag| over sets and beats, and max |E^T E - 1|
  pieceGap: number
  orthoGap: number
  // X is the slot swap: DOCK_ROOTS[OPPOSITE[d]] = -DOCK_ROOTS[d]
  oppositeExact: boolean
}

const swapMode = (i: number): number =>
  OPPOSITE[Math.floor(i / HALF_REG)]! * HALF_REG + (i % HALF_REG)

export function colorPieces(
  sets: readonly HalfSet[],
  sR: readonly (readonly number[])[],
  dR: readonly (readonly number[])[],
): ColorPieces {
  const n = HALF_MODES
  const cols: number[][] = []

  for (const v0 of [...sR, ...dR]) {
    let v = [...v0]

    for (let pass = 0; pass < 2; pass++) {
      for (const e of cols) {
        const c = v.reduce((s, x, i) => s + x * e[i]!, 0)

        v = v.map((x, i) => x - c * e[i]!)
      }
    }

    const nrm = Math.hypot(...v)

    if (nrm > 1e-9) {
      cols.push(v.map(x => x / nrm))
    }
  }

  const r = cols.length
  const E = new Float64Array(n * r)

  cols.forEach((col, i) => col.forEach((x, m) => (E[m * r + i] = x)))

  let orthoGap = 0

  for (let i = 0; i < r; i++) {
    for (let j = 0; j < r; j++) {
      let s = 0

      for (let m = 0; m < n; m++) {
        s += E[m * r + i]! * E[m * r + j]!
      }

      orthoGap = Math.max(orthoGap, Math.abs(s - (i === j ? 1 : 0)))
    }
  }

  let pieceGap = 0
  const g = sets.map(() => [] as { re: Float64Array; im: Float64Array }[])
  const gDag = sets.map(() => [] as { re: Float64Array; im: Float64Array }[])

  sets.forEach((set, si) => {
    for (let beat = 0; beat < 2; beat++) {
      const P = set.pieces[beat]!
      // K = X P - 1
      const Kre = new Float64Array(n * n)
      const Kim = new Float64Array(n * n)

      for (let i = 0; i < n; i++) {
        const xi = swapMode(i)

        for (let j = 0; j < n; j++) {
          Kre[i * n + j] = P.re[xi * n + j]! - (i === j ? 1 : 0)
          Kim[i * n + j] = P.im[xi * n + j]!
        }
      }

      // k = E^T K E
      const kr = new Float64Array(r * r)
      const ki = new Float64Array(r * r)

      for (let a = 0; a < r; a++) {
        for (let b = 0; b < r; b++) {
          let sr = 0
          let sim = 0

          for (let i = 0; i < n; i++) {
            const ea = E[i * r + a]!

            if (ea === 0) {
              continue
            }

            for (let j = 0; j < n; j++) {
              const eb = E[j * r + b]!

              sr += ea * Kre[i * n + j]! * eb
              sim += ea * Kim[i * n + j]! * eb
            }
          }

          kr[a * r + b] = sr
          ki[a * r + b] = sim
        }
      }

      // residual K - E k E^T
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let sr = 0
          let sim = 0

          for (let a = 0; a < r; a++) {
            const ea = E[i * r + a]!

            for (let b = 0; b < r; b++) {
              sr += ea * kr[a * r + b]! * E[j * r + b]!
              sim += ea * ki[a * r + b]! * E[j * r + b]!
            }
          }

          pieceGap = Math.max(
            pieceGap,
            Math.hypot(Kre[i * n + j]! - sr, Kim[i * n + j]! - sim),
          )
        }
      }

      const gr = Float64Array.from(kr, (x, i) => x + (i % (r + 1) === 0 ? 1 : 0))
      const gi = Float64Array.from(ki)
      const dr = new Float64Array(r * r)
      const di = new Float64Array(r * r)

      for (let a = 0; a < r; a++) {
        for (let b = 0; b < r; b++) {
          dr[a * r + b] = gr[b * r + a]!
          di[a * r + b] = -gi[b * r + a]!
        }
      }

      g[si]!.push({ re: gr, im: gi })
      gDag[si]!.push({ re: dr, im: di })
    }
  })

  const oppositeExact = DOCK_ROOTS.every((rt, d) =>
    rt.every((x, q) => DOCK_ROOTS[OPPOSITE[d]!]![q] === -x),
  )

  return {
    r,
    E,
    g,
    gDag,
    P: sets.map(s => [s.pieces[0]!, s.pieces[1]!]),
    pieceGap,
    orthoGap,
    oppositeExact,
  }
}

// ---- the coordinate cycle ----

export type ColorOp = {
  box: ColorBox
  links: ColorLinks
  pieces: ColorPieces
  // the piece set of each dock
  setOf: Int32Array
  k: number
  r: number
  // coordinates a half (a or b), and the whole coordinate length
  n1: number
  n: number
}

export function colorOp(
  box: ColorBox,
  links: ColorLinks,
  pieces: ColorPieces,
  profile: readonly number[],
): ColorOp {
  const setOf = Int32Array.from(box.depth, c => profile[c]!)
  const n1 = box.cells * pieces.r * links.k

  return { box, links, pieces, setOf, k: links.k, r: pieces.r, n1, n: 2 * n1 }
}

// out[outOff ..] += C in[inOff ..], C = E^dag T' E: (C b)_y = sum_d E_d^T R(x, d) E_(-d) b_x, x = y - r_d
function hop(
  op: ColorOp,
  inRe: Float64Array,
  inIm: Float64Array,
  inOff: number,
  outRe: Float64Array,
  outIm: Float64Array,
  outOff: number,
): void {
  const { box, links, pieces, k, r } = op
  const E = pieces.E
  const w = 2 * k * k
  const tRe = new Float64Array(HALF_REG * k)
  const tIm = new Float64Array(HALF_REG * k)
  const uRe = new Float64Array(HALF_REG * k)
  const uIm = new Float64Array(HALF_REG * k)

  for (let x = 0; x < box.cells; x++) {
    const xo = inOff + x * r * k

    for (let d = 0; d < SLOTS; d++) {
      const od = OPPOSITE[d]!
      const l = x * SLOTS + d
      const y = box.nb[l]!
      const yo = outOff + y * r * k
      const lo = l * w

      // t[q][c] = sum_i E[(od, q), i] b_x[i][c]
      for (let q = 0; q < HALF_REG; q++) {
        const row = (od * HALF_REG + q) * r

        for (let c = 0; c < k; c++) {
          let sr = 0
          let si = 0

          for (let i = 0; i < r; i++) {
            const e = E[row + i]!

            sr += e * inRe[xo + i * k + c]!
            si += e * inIm[xo + i * k + c]!
          }

          tRe[q * k + c] = sr
          tIm[q * k + c] = si
        }
      }

      // u[q] = R t[q]
      for (let q = 0; q < HALF_REG; q++) {
        for (let c = 0; c < k; c++) {
          let sr = 0
          let si = 0

          for (let j = 0; j < k; j++) {
            const gr = links.m[lo + 2 * (c * k + j)]!
            const gi = links.m[lo + 2 * (c * k + j) + 1]!
            const vr = tRe[q * k + j]!
            const vi = tIm[q * k + j]!

            sr += gr * vr - gi * vi
            si += gr * vi + gi * vr
          }

          uRe[q * k + c] = sr
          uIm[q * k + c] = si
        }
      }

      // out_y[i][c] += sum_q E[(d, q), i] u[q][c]
      for (let q = 0; q < HALF_REG; q++) {
        const row = (d * HALF_REG + q) * r

        for (let i = 0; i < r; i++) {
          const e = E[row + i]!

          if (e === 0) {
            continue
          }

          for (let c = 0; c < k; c++) {
            outRe[yo + i * k + c]! += e * uRe[q * k + c]!
            outIm[yo + i * k + c]! += e * uIm[q * k + c]!
          }
        }
      }
    }
  }
}

// out[off ..] = gm (s[off ..]) - t, dock by dock, gm the dock's set's matrix for `beat` (dag: its dagger)
function localStep(
  op: ColorOp,
  sRe: Float64Array,
  sIm: Float64Array,
  tRe: Float64Array,
  tIm: Float64Array,
  off: number,
  beat: number,
  dag: boolean,
  outRe: Float64Array,
  outIm: Float64Array,
): void {
  const { box, k, r, pieces, setOf } = op

  for (let x = 0; x < box.cells; x++) {
    const gm = (dag ? pieces.gDag : pieces.g)[setOf[x]!]![beat]!
    const xo = x * r * k

    for (let i = 0; i < r; i++) {
      for (let c = 0; c < k; c++) {
        let sr = 0
        let si = 0

        for (let j = 0; j < r; j++) {
          const ar = gm.re[i * r + j]!
          const ai = gm.im[i * r + j]!

          if (ar === 0 && ai === 0) {
            continue
          }

          const vr = sRe[off + xo + j * k + c]!
          const vi = sIm[off + xo + j * k + c]!

          sr += ar * vr - ai * vi
          si += ar * vi + ai * vr
        }

        outRe[off + xo + i * k + c] = sr - tRe[xo + i * k + c]!
        outIm[off + xo + i * k + c] = si - tIm[xo + i * k + c]!
      }
    }
  }
}

// U z: a' = g0 (a + C b) - C b, b' = g1 (b + C a') - C a'
export function applyU(op: ColorOp, z: CVec): CVec {
  const { n1 } = op
  const out = newVec(op.n)
  const t = newVec(n1)

  hop(op, z.re, z.im, n1, t.re, t.im, 0)

  const s = newVec(op.n)

  for (let i = 0; i < n1; i++) {
    s.re[i] = z.re[i]! + t.re[i]!
    s.im[i] = z.im[i]! + t.im[i]!
  }

  localStep(op, s.re, s.im, t.re, t.im, 0, 0, false, out.re, out.im)

  const t2 = newVec(n1)

  hop(op, out.re, out.im, 0, t2.re, t2.im, 0)

  for (let i = 0; i < n1; i++) {
    s.re[n1 + i] = z.re[n1 + i]! + t2.re[i]!
    s.im[n1 + i] = z.im[n1 + i]! + t2.im[i]!
  }

  localStep(op, s.re, s.im, t2.re, t2.im, n1, 1, false, out.re, out.im)

  return out
}

// U^dag z: b~ = g1^dag (b + C a) - C a, a~ = g0^dag (a + C b~) - C b~
export function applyUdag(op: ColorOp, z: CVec): CVec {
  const { n1 } = op
  const out = newVec(op.n)
  const t = newVec(n1)

  hop(op, z.re, z.im, 0, t.re, t.im, 0)

  const s = newVec(op.n)

  for (let i = 0; i < n1; i++) {
    s.re[n1 + i] = z.re[n1 + i]! + t.re[i]!
    s.im[n1 + i] = z.im[n1 + i]! + t.im[i]!
  }

  localStep(op, s.re, s.im, t.re, t.im, n1, 1, true, out.re, out.im)

  const t2 = newVec(n1)

  hop(op, out.re, out.im, n1, t2.re, t2.im, 0)

  for (let i = 0; i < n1; i++) {
    s.re[i] = z.re[i]! + t2.re[i]!
    s.im[i] = z.im[i]! + t2.im[i]!
  }

  localStep(op, s.re, s.im, t2.re, t2.im, 0, 0, true, out.re, out.im)

  return out
}

// A z = -(U + U^dag) z / 2
export function applyA(op: ColorOp, z: CVec): CVec {
  const u = applyU(op, z)
  const w = applyUdag(op, z)

  for (let i = 0; i < op.n; i++) {
    u.re[i] = -(u.re[i]! + w.re[i]!) / 2
    u.im[i] = -(u.im[i]! + w.im[i]!) / 2
  }

  return u
}

// M z = (a + C b, C a + b)
export function applyM(op: ColorOp, z: CVec): CVec {
  const out = copyVec(z)

  hop(op, z.re, z.im, op.n1, out.re, out.im, 0)
  hop(op, z.re, z.im, 0, out.re, out.im, op.n1)

  return out
}

// <x|y>_M
export function dotM(op: ColorOp, x: CVec, y: CVec): [number, number] {
  return dot(x, applyM(op, y))
}

// the full-space vector E a + T' E b: index ((y * 24 + s) * 4 + q) * k + c
export function fullVector(op: ColorOp, z: CVec): CVec {
  const { box, links, pieces, k, r, n1 } = op
  const E = pieces.E
  const w = 2 * k * k
  const out = newVec(box.cells * HALF_MODES * k)

  for (let y = 0; y < box.cells; y++) {
    for (let s = 0; s < SLOTS; s++) {
      const x = box.src[y * SLOTS + s]!
      const lo = (x * SLOTS + s) * w
      const os = OPPOSITE[s]!

      for (let q = 0; q < HALF_REG; q++) {
        const o = ((y * SLOTS + s) * HALF_REG + q) * k
        const rowA = (s * HALF_REG + q) * r
        const rowB = (os * HALF_REG + q) * r
        const tr = new Float64Array(k)
        const ti = new Float64Array(k)

        for (let c = 0; c < k; c++) {
          let ar = 0
          let ai = 0
          let br = 0
          let bi = 0

          for (let i = 0; i < r; i++) {
            ar += E[rowA + i]! * z.re[(y * r + i) * k + c]!
            ai += E[rowA + i]! * z.im[(y * r + i) * k + c]!
            br += E[rowB + i]! * z.re[n1 + (x * r + i) * k + c]!
            bi += E[rowB + i]! * z.im[n1 + (x * r + i) * k + c]!
          }

          out.re[o + c] = ar
          out.im[o + c] = ai
          tr[c] = br
          ti[c] = bi
        }

        for (let c = 0; c < k; c++) {
          let sr = 0
          let si = 0

          for (let j = 0; j < k; j++) {
            const gr = links.m[lo + 2 * (c * k + j)]!
            const gi = links.m[lo + 2 * (c * k + j) + 1]!

            sr += gr * tr[j]! - gi * ti[j]!
            si += gr * ti[j]! + gi * tr[j]!
          }

          out.re[o + c]! += sr
          out.im[o + c]! += si
        }
      }
    }
  }

  return out
}

// the full-space cycle U = T P1 T P0 on a full vector (pieces applied mode by mode, T with the links): the instrument
export function fullU(op: ColorOp, v: CVec): CVec {
  const { box, links, pieces, k, setOf } = op
  const w = 2 * k * k
  const m = HALF_MODES
  let x = v

  for (let beat = 0; beat < 2; beat++) {
    const p = newVec(x.re.length)

    for (let y = 0; y < box.cells; y++) {
      const P = pieces.P[setOf[y]!]![beat]!
      const off = y * m * k

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
          const pr = P.re[i * m + j]!
          const pi = P.im[i * m + j]!

          if (pr === 0 && pi === 0) {
            continue
          }

          for (let c = 0; c < k; c++) {
            const xr = x.re[off + j * k + c]!
            const xi = x.im[off + j * k + c]!

            p.re[off + i * k + c]! += pr * xr - pi * xi
            p.im[off + i * k + c]! += pr * xi + pi * xr
          }
        }
      }
    }

    const t = newVec(x.re.length)

    for (let y = 0; y < box.cells; y++) {
      for (let s = 0; s < SLOTS; s++) {
        const src = box.src[y * SLOTS + s]!
        const lo = (src * SLOTS + s) * w

        for (let q = 0; q < HALF_REG; q++) {
          const from = ((src * SLOTS + s) * HALF_REG + q) * k
          const to = ((y * SLOTS + s) * HALF_REG + q) * k

          for (let c = 0; c < k; c++) {
            let sr = 0
            let si = 0

            for (let j = 0; j < k; j++) {
              const gr = links.m[lo + 2 * (c * k + j)]!
              const gi = links.m[lo + 2 * (c * k + j) + 1]!

              sr += gr * p.re[from + j]! - gi * p.im[from + j]!
              si += gr * p.im[from + j]! + gi * p.re[from + j]!
            }

            t.re[to + c] = sr
            t.im[to + c] = si
          }
        }
      }
    }

    x = t
  }

  return x
}

// a fixed start pattern (no random numbers), index j
export function startVector(n: number, j: number): CVec {
  const v = newVec(n)

  for (let q = 0; q < n; q++) {
    v.re[q] = Math.cos((1.3 + 0.17 * j) * q + 0.7) + 0.5 * Math.sin((0.37 + 0.05 * j) * q)
    v.im[q] = Math.sin((2.1 - 0.13 * j) * q + 0.2) - 0.3 * Math.cos((0.91 + 0.011 * j) * q)
  }

  return v
}

// the reduction's witness: |U_full Phi z - Phi U z| / |Phi z| on a start vector, and its norm relation |Phi z|^2 = <z|z>_M
export function reductionGaps(op: ColorOp): { cycle: number; cycleDag: number; metric: number } {
  const z = startVector(op.n, 0)
  const f = fullVector(op, z)
  const nf = Math.sqrt(dot(f, f)[0])
  const lhs = fullU(op, f)
  const rhs = fullVector(op, applyU(op, z))
  // U^dag: U (Phi U^dag z) must give Phi z
  const back = fullU(op, fullVector(op, applyUdag(op, z)))

  let a = 0
  let b = 0

  for (let i = 0; i < f.re.length; i++) {
    a += (lhs.re[i]! - rhs.re[i]!) ** 2 + (lhs.im[i]! - rhs.im[i]!) ** 2
    b += (back.re[i]! - f.re[i]!) ** 2 + (back.im[i]! - f.im[i]!) ** 2
  }

  const m = dotM(op, z, z)[0]

  return {
    cycle: Math.sqrt(a) / nf,
    cycleDag: Math.sqrt(b) / nf,
    metric: Math.abs(m - nf * nf) / (nf * nf),
  }
}

// ---- per-dock weights ----

// the weight of the full vector on each dock
export function dockWeights(op: ColorOp, z: CVec): Float64Array {
  const f = fullVector(op, z)
  const per = HALF_MODES * op.k
  const out = new Float64Array(op.box.cells)

  for (let y = 0; y < op.box.cells; y++) {
    let s = 0

    for (let i = y * per; i < (y + 1) * per; i++) {
      s += f.re[i]! ** 2 + f.im[i]! ** 2
    }

    out[y] = s
  }

  return out
}

// the fraction of docks that hold `share` of the weight (largest first)
export function participation(weights: Float64Array, share = 0.9): number {
  const sorted = Float64Array.from(weights).sort().reverse()
  const total = sorted.reduce((s, x) => s + x, 0)

  let acc = 0
  let count = 0

  for (const x of sorted) {
    acc += x
    count++

    if (acc >= share * total) {
      break
    }
  }

  return count / weights.length
}

export function depthShare(op: ColorOp, weights: Float64Array, depths: ReadonlySet<number>): number {
  let on = 0
  let all = 0

  for (let y = 0; y < op.box.cells; y++) {
    all += weights[y]!

    if (depths.has(op.box.depth[y]!)) {
      on += weights[y]!
    }
  }

  return on / all
}

// ---- the levels nearest pi: wall-face levelsNearPi in the M metric ----

export type ColorLevel = { offset: number; vector: CVec }

export type ColorNearPi = {
  levels: ColorLevel[]
  steps: number
  ritzResidual: number
  eigenResidual: number
  unconverged: number
  rounds: number
  complete: boolean
  // the largest Ritz value of A in the last round as a distance from pi, and its Lanczos residual estimate
  nearest: number
  nearestResidual: number
  seconds: number
}

const MAX_ROUNDS = 24
const MAX_STALLED = 3
const BREAKDOWN = 1e-8

// classical Gram-Schmidt in M against `vs` (M-orthonormal), twice
function orthoM(op: ColorOp, w: CVec, vs: readonly CVec[]): void {
  if (vs.length === 0) {
    return
  }

  for (let pass = 0; pass < 2; pass++) {
    const Mw = applyM(op, w)
    const cs = vs.map(b => dot(b, Mw))

    vs.forEach((b, i) => axpy(w, -cs[i]![0], -cs[i]![1], b))
  }
}

const normM = (op: ColorOp, w: CVec): number => Math.sqrt(Math.max(0, dotM(op, w, w)[0]))

// the Rayleigh-Ritz on U over M-orthonormal Y: levels, their M-norm eigen residuals
function ritzU(op: ColorOp, Y: readonly CVec[]): { levels: ColorLevel[]; eigenResidual: number; residuals: number[] } {
  const m = Y.length

  if (m === 0) {
    return { levels: [], eigenResidual: 0, residuals: [] }
  }

  const UY = Y.map(y => applyM(op, applyU(op, y)))
  const Gm: Dense = { re: new Float64Array(m * m), im: new Float64Array(m * m) }

  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      const [r, i] = dot(Y[a]!, UY[b]!)

      Gm.re[a * m + b] = r
      Gm.im[a * m + b] = i
    }
  }

  const e = unitaryEigen(Gm, m)

  let eigenResidual = 0
  const residuals: number[] = []

  const levels = e.phases.map((ph, c) => {
    const x = newVec(op.n)

    for (let a = 0; a < m; a++) {
      axpy(x, e.vre[a * m + c]!, e.vim[a * m + c]!, Y[a]!)
    }

    const Ux = applyU(op, x)

    axpy(Ux, -Math.cos(ph), -Math.sin(ph), x)

    const res = normM(op, Ux)

    eigenResidual = Math.max(eigenResidual, res)
    residuals.push(res)

    return { offset: wrap(ph - Math.PI), vector: x }
  })

  return { levels, eigenResidual, residuals }
}

export function colorLevelsNearPi(
  op: ColorOp,
  window: number,
  steps: number,
  accept = 1e-9,
): ColorNearPi {
  const started = Date.now()
  const threshold = Math.cos(window)
  const found: CVec[] = []

  let ritzResidual = 0
  let unconverged = 0
  let totalSteps = 0
  let rounds = 0
  let complete = false
  let stalled = 0
  let nearest = Number.NaN
  let nearestResidual = Number.NaN

  for (let round = 0; round < MAX_ROUNDS; round++) {
    rounds++

    let v = startVector(op.n, round)

    orthoM(op, v, found)

    const nrm = normM(op, v)

    scaleVec(v, 1 / nrm)

    const basis: CVec[] = []
    const alpha: number[] = []
    const beta: number[] = []
    let lastBeta = 0

    for (let j = 0; j < steps; j++) {
      basis.push(v)

      const w = applyA(op, v)
      const a = dotM(op, v, w)[0]

      alpha.push(a)
      orthoM(op, w, [...found, ...basis])

      const bj = normM(op, w)

      lastBeta = bj

      if (j === steps - 1 || bj < BREAKDOWN) {
        break
      }

      beta.push(bj)
      scaleVec(w, 1 / bj)
      v = w
    }

    const k = alpha.length

    totalSteps += k

    const T = makeComplexMatrix({ rows: k, cols: k })

    for (let i = 0; i < k; i++) {
      T.re[i * k + i] = alpha[i]!

      if (i + 1 < k) {
        T.re[i * k + i + 1] = beta[i]!
        T.re[(i + 1) * k + i] = beta[i]!
      }
    }

    const te = eigHermitian({ matrix: T })

    // the top Ritz value and its Lanczos residual estimate beta_k |s_k|
    {
      let top = -1

      for (let c = 0; c < k; c++) {
        if (te.values[c]! > (top < 0 ? -Infinity : te.values[top]!)) {
          top = c
        }
      }

      const th = Math.min(1, te.values[top]!)

      nearest = Math.acos(th)
      nearestResidual =
        lastBeta *
        Math.hypot(te.vectorsRe[(k - 1) * k + top]!, te.vectorsIm[(k - 1) * k + top]!)
    }

    let above = 0
    let pending = 0
    let accepted = 0

    for (let c = 0; c < k; c++) {
      const theta = te.values[c]!

      if (theta <= threshold || theta > 1 + 1e-9) {
        continue
      }

      above++

      const y = newVec(op.n)

      for (let j = 0; j < k; j++) {
        axpy(y, te.vectorsRe[j * k + c]!, te.vectorsIm[j * k + c]!, basis[j]!)
      }

      orthoM(op, y, found)

      const yn = normM(op, y)

      if (yn < 1e-8) {
        continue
      }

      scaleVec(y, 1 / yn)

      const Ay = applyA(op, y)

      axpy(Ay, -theta, 0, y)

      const res = normM(op, Ay)

      if (res > accept) {
        pending++
        continue
      }

      ritzResidual = Math.max(ritzResidual, res)
      found.push(y)
      accepted++
    }

    unconverged = pending

    if (above === 0) {
      complete = true
      break
    }

    if (accepted === 0) {
      stalled++

      if (stalled >= MAX_STALLED) {
        break
      }
    }
  }

  const rr = ritzU(op, found)

  return {
    levels: rr.levels,
    steps: totalSteps,
    ritzResidual,
    eigenResidual: rr.eigenResidual,
    unconverged,
    rounds,
    complete,
    nearest,
    nearestResidual,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- a tight cluster at pi: Chebyshev-filtered block subspace iteration ----

export type ClusterOptions = {
  // the levels read: |offset| < window
  window: number
  block: number
  degree: number
  // levels with |offset| >= cut are damped by the filter
  cut: number
  maxPasses: number
  // stop when every window level's M-norm eigen residual is below this
  tol: number
}

export type ColorCluster = {
  levels: ColorLevel[]
  residuals: number[]
  eigenResidual: number
  passes: number
  // Ritz values of A in the block above cos(cut): the block must hold more than these
  aboveCut: number
  // the largest window distance among block Ritz values outside the window (the guard)
  guard: number
  complete: boolean
  seconds: number
}

// M-orthonormalize a block (eigen of its Gram), dropping directions below 1e-10 of the largest
function orthonormalBlock(op: ColorOp, Z: readonly CVec[]): CVec[] {
  const m = Z.length
  const MZ = Z.map(z => applyM(op, z))
  const G = makeComplexMatrix({ rows: m, cols: m })

  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      const [r, i] = dot(Z[a]!, MZ[b]!)

      G.re[a * m + b] = r
      G.im[a * m + b] = i
    }
  }

  // scale so the largest eigenvalue is about 1 (eigHermitian's merge tolerance is absolute)
  const scale = Math.max(...Array.from({ length: m }, (_, a) => G.re[a * m + a]!))

  for (let i = 0; i < m * m; i++) {
    G.re[i]! /= scale
    G.im[i]! /= scale
  }

  const e = eigHermitian({ matrix: G })
  const top = Math.max(...e.values)
  const out: CVec[] = []

  for (let c = m - 1; c >= 0; c--) {
    const lam = e.values[c]!

    if (lam < 1e-10 * top) {
      continue
    }

    const x = newVec(op.n)

    for (let a = 0; a < m; a++) {
      axpy(x, e.vectorsRe[a * m + c]!, e.vectorsIm[a * m + c]!, Z[a]!)
    }

    scaleVec(x, 1 / Math.sqrt(lam * scale))
    out.push(x)
  }

  // one more Gram-Schmidt pass in M for full orthonormality
  const done: CVec[] = []

  for (const x of out) {
    orthoM(op, x, done)

    const nx = normM(op, x)

    if (nx > 1e-8) {
      scaleVec(x, 1 / nx)
      done.push(x)
    }
  }

  return done
}

// p(A) z, p the degree-d Chebyshev polynomial of A mapped from [-1, hi] onto [-1, 1]
function chebyshev(op: ColorOp, z: CVec, degree: number, hi: number): CVec {
  const lo = -1 - 1e-12
  const e = (hi - lo) / 2
  const c0 = (hi + lo) / 2
  const mapped = (v: CVec): CVec => {
    const a = applyA(op, v)

    for (let i = 0; i < op.n; i++) {
      a.re[i] = (a.re[i]! - c0 * v.re[i]!) / e
      a.im[i] = (a.im[i]! - c0 * v.im[i]!) / e
    }

    return a
  }

  let prev = copyVec(z)
  let cur = mapped(z)

  for (let j = 1; j < degree; j++) {
    const next = mapped(cur)

    for (let i = 0; i < op.n; i++) {
      next.re[i] = 2 * next.re[i]! - prev.re[i]!
      next.im[i] = 2 * next.im[i]! - prev.im[i]!
    }

    // keep the scale near 1 (the filter's direction is all that matters)
    const s = Math.sqrt(dot(next, next)[0])

    scaleVec(next, 1 / s)
    scaleVec(cur, 1 / s)
    prev = cur
    cur = next
  }

  return cur
}

export function colorCluster(op: ColorOp, opt: ClusterOptions): ColorCluster {
  const started = Date.now()
  const hi = Math.cos(opt.cut)
  const inWindow = Math.cos(opt.window)

  let Z = orthonormalBlock(
    op,
    Array.from({ length: opt.block }, (_, j) => startVector(op.n, j)),
  )
  let levels: ColorLevel[] = []
  let residuals: number[] = []
  let eigenResidual = Infinity
  let passes = 0
  let aboveCut = 0
  let guard = Number.NaN

  for (let pass = 0; pass < opt.maxPasses; pass++) {
    passes++
    Z = orthonormalBlock(
      op,
      Z.map(z => chebyshev(op, z, opt.degree, hi)),
    )

    // Rayleigh-Ritz on A
    const m = Z.length
    const AZ = Z.map(z => applyM(op, applyA(op, z)))
    const H = makeComplexMatrix({ rows: m, cols: m })

    for (let a = 0; a < m; a++) {
      for (let b = 0; b < m; b++) {
        const [r, i] = dot(Z[a]!, AZ[b]!)

        H.re[a * m + b] = r
        H.im[a * m + b] = i
      }
    }

    for (let a = 0; a < m; a++) {
      for (let b = a + 1; b < m; b++) {
        const r = (H.re[a * m + b]! + H.re[b * m + a]!) / 2
        const i = (H.im[a * m + b]! - H.im[b * m + a]!) / 2

        H.re[a * m + b] = r
        H.re[b * m + a] = r
        H.im[a * m + b] = i
        H.im[b * m + a] = -i
      }

      H.im[a * m + a] = 0
    }

    const e = eigHermitian({ matrix: H })
    const order = Array.from({ length: m }, (_, c) => c).sort(
      (x, y) => e.values[y]! - e.values[x]!,
    )
    const W = order.map(c => {
      const x = newVec(op.n)

      for (let a = 0; a < m; a++) {
        axpy(x, e.vectorsRe[a * m + c]!, e.vectorsIm[a * m + c]!, Z[a]!)
      }

      return x
    })
    const theta = order.map(c => e.values[c]!)

    aboveCut = theta.filter(t => t > hi).length

    const outside = theta.filter(t => t <= inWindow)

    guard = outside.length > 0 ? Math.acos(Math.min(1, outside[0]!)) : Number.NaN

    const sel = W.filter((_, i) => theta[i]! > inWindow)
    const rr = ritzU(op, sel)

    levels = rr.levels
    residuals = rr.residuals
    eigenResidual = rr.eigenResidual
    Z = W

    if (eigenResidual <= opt.tol) {
      break
    }
  }

  return {
    levels,
    residuals,
    eigenResidual,
    passes,
    aboveCut,
    guard,
    // an empty window passes the residual test vacuously after any pass, so it never counts as complete here: the caller
    // confirms an empty or short window with a Krylov search (colorLevelsNearPi). Otherwise the window is complete when the
    // block keeps a Ritz value outside it: the filter is increasing above cos(cut), so every window level outranks every
    // level outside the window, and the window levels are then all among the block's (a block filled by levels between
    // the window and the cut is not a defect)
    complete: levels.length > 0 && eigenResidual <= opt.tol && levels.length < opt.block,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the same cluster, resolved on U itself (item 0072, after 0070's diagnosis) ----
//
// colorCluster resolves its window in A = -(U + U^dag) / 2, which squares a level's offset from pi: at slab L 12 the 24
// wall levels sit near 1.2e-4, so A holds them within 8e-9 of its edge, and a field that splits them leaves A gaps near
// eigHermitian's absolute merge tolerance (1e-10). Its window vectors then come back inexact and the block residual floors
// (note/project/vibe/traps.md, 2026-10-09). colorClusterU keeps the start, the Chebyshev filter on A (the filter treats the
// cluster as one, which is fine) and orthonormalBlock, and then each pass runs the Rayleigh-Ritz on U over the WHOLE
// orthonormal block, which is linear in the offset. A level's offset is its U-Ritz phase. Window membership, the guard and
// aboveCut come from each U-Ritz vector's chord distance acos(-Re <x|U x>), which equals |offset| on a converged level and
// keeps an unconverged mix of levels from both sides of pi out of the window. No eigHermitian on A is used anywhere.

export type ClusterPassU = {
  // the largest M-norm eigen residual among the window levels (0 on an empty window)
  eigenResidual: number
  // the least chord distance acos(-Re rho) among the U-Ritz vectors outside the window
  guard: number
  // max |Z^dag M Z - I| of the pass's orthonormal block
  orthogonality: number
  // the window count this pass
  count: number
  // Ritz values whose phase lies in the window but whose chord distance does not (unconverged mixes)
  mixed: number
}

export type ColorClusterU = ColorCluster & { history: ClusterPassU[] }

// max |Z^dag M Z - I| entrywise
function blockOrthogonality(op: ColorOp, Z: readonly CVec[]): number {
  const MZ = Z.map(z => applyM(op, z))
  let worst = 0

  for (let a = 0; a < Z.length; a++) {
    for (let b = 0; b < Z.length; b++) {
      const [r, i] = dot(Z[a]!, MZ[b]!)

      worst = Math.max(worst, Math.hypot(r - (a === b ? 1 : 0), i))
    }
  }

  return worst
}

export function colorClusterU(op: ColorOp, opt: ClusterOptions): ColorClusterU {
  const started = Date.now()
  const hi = Math.cos(opt.cut)

  let Z = orthonormalBlock(
    op,
    Array.from({ length: opt.block }, (_, j) => startVector(op.n, j)),
  )
  let levels: ColorLevel[] = []
  let residuals: number[] = []
  let eigenResidual = Infinity
  let passes = 0
  let aboveCut = 0
  let guard = Number.NaN
  let outsideCount = 0
  const history: ClusterPassU[] = []

  for (let pass = 0; pass < opt.maxPasses; pass++) {
    passes++
    Z = orthonormalBlock(
      op,
      Z.map(z => chebyshev(op, z, opt.degree, hi)),
    )

    const orthogonality = blockOrthogonality(op, Z)
    const rr = ritzU(op, Z)
    // each Ritz vector's chord distance from pi, acos(-Re <x|U x> / <x|x>): a converged level has |rho| = 1 and reads its
    // own |offset|, while an unconverged mix of levels on both sides of pi has its phase near pi but |rho| < 1, and its
    // -Re rho is at most the largest cos(offset) among the levels it mixes (the numerical range of U on them is their
    // convex hull), so the chord test keeps it outside the window (item 0072, first frozen L 8 run: 2 and 3 such mixes
    // read inside the window by phase, residual 0.75 and 0.82)
    const chord = rr.levels.map(l => {
      const [r] = dotM(op, l.vector, applyU(op, l.vector))

      return Math.acos(Math.max(-1, Math.min(1, -r / dotM(op, l.vector, l.vector)[0])))
    })
    const inside = chord.map(c => c < opt.window)

    levels = rr.levels.filter((_, i) => inside[i])
    residuals = rr.residuals.filter((_, i) => inside[i])
    eigenResidual = residuals.reduce((m, r) => Math.max(m, r), 0)
    aboveCut = chord.filter(c => c < opt.cut).length

    const outside = chord.filter((_, i) => !inside[i])
    const mixed = rr.levels.filter((l, i) => !inside[i] && Math.abs(l.offset) < opt.window).length

    outsideCount = outside.length
    guard = outside.length > 0 ? Math.min(...outside) : Number.NaN
    history.push({ eigenResidual, guard, orthogonality, count: levels.length, mixed })

    if (eigenResidual <= opt.tol) {
      break
    }
  }

  return {
    levels,
    residuals,
    eigenResidual,
    passes,
    aboveCut,
    guard,
    // colorCluster's rule: an empty window is never complete here (the caller confirms it with Lanczos), and a non-empty
    // window is complete when every window residual is below tol and the block keeps a U-Ritz value outside the window
    complete: levels.length > 0 && eigenResidual <= opt.tol && outsideCount > 0,
    seconds: (Date.now() - started) / 1000,
    history,
  }
}

// ---- D3 ----

export type D3Read = {
  count: number
  // eps = -wrap(phase - pi) of every level, ascending
  eps: number[]
  // the wall-A window projector's eigenvalues in the levels' span, descending
  projector: number[]
  // each level's weight on the two wall windows together
  wallShare: number[]
  // pairLevels' delta: (mean of eps > 0 - mean of eps <= 0) / 2
  delta: number
  D3: number
  logDet: number
  singular: number[]
}

// |det| of a complex square matrix by LU with partial pivoting, as a log
function logAbsDet(re: Float64Array, im: Float64Array, n: number): number {
  const a = Float64Array.from(re)
  const b = Float64Array.from(im)

  let log = 0

  for (let col = 0; col < n; col++) {
    let p = col
    let best = -1

    for (let row = col; row < n; row++) {
      const v = Math.hypot(a[row * n + col]!, b[row * n + col]!)

      if (v > best) {
        best = v
        p = row
      }
    }

    if (best === 0) {
      return -Infinity
    }

    if (p !== col) {
      for (let j = 0; j < n; j++) {
        const tr = a[col * n + j]!
        const ti = b[col * n + j]!

        a[col * n + j] = a[p * n + j]!
        b[col * n + j] = b[p * n + j]!
        a[p * n + j] = tr
        b[p * n + j] = ti
      }
    }

    const pr = a[col * n + col]!
    const pi = b[col * n + col]!
    const pd = pr * pr + pi * pi

    log += Math.log(Math.sqrt(pd))

    for (let row = col + 1; row < n; row++) {
      const xr = a[row * n + col]!
      const xi = b[row * n + col]!
      // f = x / pivot
      const fr = (xr * pr + xi * pi) / pd
      const fi = (xi * pr - xr * pi) / pd

      for (let j = col; j < n; j++) {
        const yr = a[col * n + j]!
        const yi = b[col * n + j]!

        a[row * n + j]! -= fr * yr - fi * yi
        b[row * n + j]! -= fr * yi + fi * yr
      }
    }
  }

  return log
}

export function d3Read(
  op: ColorOp,
  levels: readonly ColorLevel[],
  aDepths: ReadonlySet<number>,
  bDepths: ReadonlySet<number>,
): D3Read {
  const sorted = [...levels].sort((x, y) => -x.offset - -y.offset)
  const n = sorted.length
  const eps = sorted.map(l => -l.offset)
  const per = HALF_MODES * op.k
  const fulls = sorted.map(l => fullVector(op, l.vector))
  const P = makeComplexMatrix({ rows: n, cols: n })
  const wallShare: number[] = []

  for (let a = 0; a < n; a++) {
    let on = 0
    let all = 0
    const fa = fulls[a]!

    for (let y = 0; y < op.box.cells; y++) {
      const c = op.box.depth[y]!
      let w = 0

      for (let i = y * per; i < (y + 1) * per; i++) {
        w += fa.re[i]! ** 2 + fa.im[i]! ** 2
      }

      all += w

      if (aDepths.has(c) || bDepths.has(c)) {
        on += w
      }
    }

    wallShare.push(on / all)

    for (let b = 0; b < n; b++) {
      const fb = fulls[b]!

      let r = 0
      let i = 0

      for (let y = 0; y < op.box.cells; y++) {
        if (!aDepths.has(op.box.depth[y]!)) {
          continue
        }

        for (let q = y * per; q < (y + 1) * per; q++) {
          r += fa.re[q]! * fb.re[q]! + fa.im[q]! * fb.im[q]!
          i += fa.re[q]! * fb.im[q]! - fa.im[q]! * fb.re[q]!
        }
      }

      P.re[a * n + b] = r
      P.im[a * n + b] = i
    }
  }

  const pe = eigHermitian({ matrix: P })
  const order = Array.from({ length: n }, (_, c) => c).sort(
    (x, y) => pe.values[y]! - pe.values[x]!,
  )
  const half = Math.floor(n / 2)
  const A = order.slice(0, half)
  const B = order.slice(n - half)
  // M_ij = alpha_i^dag H beta_j, H = diag(eps) in the level basis
  const Mre = new Float64Array(half * half)
  const Mim = new Float64Array(half * half)

  A.forEach((ca, i) => {
    B.forEach((cb, j) => {
      let r = 0
      let im = 0

      for (let a = 0; a < n; a++) {
        const xr = pe.vectorsRe[a * n + ca]!
        const xi = -pe.vectorsIm[a * n + ca]!
        const yr = pe.vectorsRe[a * n + cb]!
        const yi = pe.vectorsIm[a * n + cb]!

        r += eps[a]! * (xr * yr - xi * yi)
        im += eps[a]! * (xr * yi + xi * yr)
      }

      Mre[i * half + j] = r
      Mim[i * half + j] = im
    })
  })

  const logDet = logAbsDet(Mre, Mim, half)
  // singular values: eigenvalues of (M / s)^dag (M / s), s the largest entry (eigHermitian's tolerance is absolute)
  const s = Math.max(1e-300, ...Array.from(Mre, (x, i) => Math.hypot(x, Mim[i]!)))
  const G = makeComplexMatrix({ rows: half, cols: half })

  for (let i = 0; i < half; i++) {
    for (let j = 0; j < half; j++) {
      let r = 0
      let im = 0

      for (let l = 0; l < half; l++) {
        const ar = Mre[l * half + i]! / s
        const ai = -Mim[l * half + i]! / s
        const br = Mre[l * half + j]! / s
        const bi = Mim[l * half + j]! / s

        r += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      G.re[i * half + j] = r
      G.im[i * half + j] = im
    }
  }

  const sv = Array.from(eigHermitian({ matrix: G }).values, v => s * Math.sqrt(Math.max(0, v))).sort(
    (x, y) => y - x,
  )
  const up = eps.filter(x => x > 0)
  const lo = eps.filter(x => x <= 0)
  const mean = (xs: number[]): number => xs.reduce((t, x) => t + x, 0) / xs.length

  return {
    count: n,
    eps,
    projector: order.map(c => pe.values[c]!),
    wallShare,
    delta: (mean(up) - mean(lo)) / 2,
    D3: Math.exp(logDet / 4),
    logDet,
    singular: sv,
  }
}

// the two six-class wall windows of chiralSlab: A about L / 2, B about 0
export const wallWindows = (L: number): { a: Set<number>; b: Set<number> } => ({
  a: new Set([-3, -2, -1, 0, 1, 2].map(x => mod(L / 2 + x, L))),
  b: new Set([-3, -2, -1, 0, 1, 2].map(x => mod(x, L))),
})
