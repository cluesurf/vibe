// THE REGISTER RULE BELOW A CUSP, BLOCH-REDUCED ALONG THE HOROSPHERE. E-SPN-0181 ran the register member on the true
// mesh {3,4,3,4} in real space and found it does not travel on the one-sided screen. This module reads the rule's own
// modes there: the cusp's stabilizer [4,3,4] holds the husk's cubic translations, the region below the cusp modulo them
// is finite at every depth, so the rule on the layer and the docks under it reduces, at each husk momentum k, to a
// finite matrix.
//
//   huskTranslations   the three unit translations of the husk (a face mirror r4 times the parallel mirror through the
//                      base cube's center, and its conjugates under the cube group), each with its LABEL ACTION S
//                      (T f_z = f_(Tz) S for every cell z; a W(F4) element). On {3,4,3,4} with the antipodal labels S
//                      is not the identity for a unit step (E-SPN-0182), so a Bloch reduction by the unit lattice is
//                      TWISTED by S; the even lattice 2 Z^3 has S = 1 and needs no twist
//   cuspQuotient       the docks below the cusp to a depth cut, modulo the unit lattice ('unit', twisted) or the even
//                      lattice ('even', label-trivial): per dock its depth, Busemann level and husk position, and per
//                      (dock, label) the target dock, the lattice shift m with n(y, e) = t_m x, and the W(F4) element g
//                      of t_(-m)'s label action (identity on the even lattice); -1 where the step leaves the depth cut
//   cliffordHop        E-SPN-0180's covariant Clifford hop C = Q_D V Q_S at husk momentum k: the block from dock y's
//                      even register to dock x's odd register is c0 gamma(g r_e) rho(g) e^(-i k . m) summed over the
//                      labels e with n(y, e) = t_m x (rho the register action of g, c0 = 1 / (2 sqrt 288)); a step
//                      past the cut either REFLECTS (the unitary rule's reflecting frontier: -c0 gamma(r_e) on the dock
//                      itself) or is dropped ('open')
//   hopGram            H(k) = C^dag C, dense, and the eigen-reading: by Jordan's lemma (E-SPN-0180) every moving level
//                      of the cycle is cos E = cos M - 2 cos^2(M / 2) mu at an eigenvalue mu of H
//   hopApply           C v and (dC / dk_j) v, for the home weights and the Hellmann-Feynman velocities
//   screenBands        every band of H(k) densely, with its layer share (the S home v and the D home C v / |C v|, the
//                      largest over each eigenspace) and its Hellmann-Feynman gradient
//   topModes           the top eigenspaces of H(k) without a dense matrix: a block Krylov space from every layer
//                      direction, for cuts too deep to diagonalize
//   regionAsQuotient   a finite region (a ball of the bulk) in the same form
//   blochBeat          the register rule itself on the even-lattice quotient at momentum k (the stream multiplies by
//                      e^(-i k . m) across a shifted step), the check that H is the rule's
//
// DETERMINISM: no random numbers. MEASUREMENT: frames are floats in Z[sqrt 2]; every structural verdict is a count or a
// permutation. NOTHING MOVES: the pieces hand values between slots and register components of one dock, and the stream
// takes each slot's value one dock along.

import {
  frameInverse,
  labelTransports,
  type LabelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import {
  closeGroup,
  centerKey,
} from '@/code/substrate/coxeter/labelled-region'
import {
  horosphericalChart,
  slotPermutation,
} from '@/code/measure/hyperbolic-lines'
import {
  identity,
  matMul,
  matVec,
  reflectionMatrix,
  type Mat,
} from '@/code/substrate/coxeter/minkowski'
import {
  f4Group,
  gammaMatrices,
  type GroupElement,
} from '@/code/measure/spinor-register'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  applyPiece,
  newState,
  type PieceSpec,
  type State,
} from '@/code/measure/cusp-register'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG
export const C0 = 1 / (2 * Math.sqrt(288))
// the fundamental domain's offset: lattice coordinate m = floor((h + OFFSET) / spacing), off every half-integer
const OFFSET = 0.5 + 0.1234567

export type HuskTranslation = {
  axis: number
  shift: number[]
  T: Mat
  // the label action, T f_z = f_(Tz) S, and its W(F4) element (index into f4Group())
  S: Mat
  element: number
  // the largest deviation of a layer dock's husk shift from `shift`, over a patch
  shiftError: number
}

const relativeGap = (a: Mat, b: Mat): number => {
  let worst = 0
  let size = 1

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length; j++) {
      worst = Math.max(worst, Math.abs(a[i]![j]! - b[i]![j]!))
      size = Math.max(size, Math.abs(a[i]![j]!))
    }
  }

  return worst / size
}

// the three unit husk translations, +axis each, from the cusp stabilizer <r1, r2, r3, r4>
export function huskTranslations(
  coin: LabelledCoin,
  patchFrames: readonly Mat[],
): HuskTranslation[] {
  const { normals, metric, center: c0 } = coin.frame
  const R = normals.map(n => reflectionMatrix(n, metric))
  const chart = horosphericalChart(coin)
  const husk = (g: Mat): number[] => chart.coordinates(matVec(g, c0))
  const cube = closeGroup([R[1]!, R[2]!, R[3]!], 200)
  const tau = labelTransports({ coin, kind: 'antipodal' })
  const keyOf = centerKey(coin)
  const group = f4Group()
  const shiftOf = (T: Mat): { shift: number[]; error: number } | undefined => {
    let shift: number[] | undefined
    let error = 0

    for (const f of patchFrames) {
      const h = husk(f)
      const s = husk(matMul(T, f)).map((v, a) => v - h[a]!)

      if (!shift) {
        shift = s
      } else {
        error = Math.max(error, ...s.map((v, a) => Math.abs(v - shift![a]!)))
      }
    }

    return shift && error < 1e-6 ? { shift, error } : undefined
  }

  // T1 = r4 w: the one product with a cube-group element that translates every layer dock alike
  const first = cube
    .map(w => matMul(R[4]!, w))
    .map(T => ({ T, s: shiftOf(T) }))
    .find(t => t.s !== undefined)

  if (!first) {
    throw new Error('cusp-bloch: no translation r4 w')
  }

  const out: HuskTranslation[] = []

  for (let axis = 0; axis < 3; axis++) {
    for (const c of cube) {
      const T = matMul(matMul(c, first.T), frameInverse(coin, c))
      const s = shiftOf(T)

      if (
        !s ||
        s.shift.some(
          (v, a) => Math.abs(v - (a === axis ? 1 : 0)) > 1e-9,
        )
      ) {
        continue
      }

      // the base cell's image is a neighbour tau_d c0; S = tau_d^-1 T
      const image = keyOf(T)
      const d = tau.findIndex(t => keyOf(t) === image)
      const S = matMul(frameInverse(coin, tau[d]!), T)
      const perm = slotPermutation(coin, S)
      const element = perm
        ? group.findIndex(g => g.slots.every((v, k) => v === perm[k]))
        : -1

      out.push({ axis, shift: s.shift, T, S, element, shiftError: s.error })
      break
    }
  }

  return out
}

export type LatticeKind = 'unit' | 'even'

export type CuspQuotient = {
  kind: LatticeKind
  // docks of one fundamental domain
  docks: number
  depth: Int32Array
  level: Float64Array
  husk: number[][]
  frames: Mat[]
  // [x * 24 + e]: the target dock, -1 past the cut
  target: Int32Array
  // [(x * 24 + e) * 3 + i]: the lattice shift m, n(x, e) = t_m target
  shift: Int32Array
  // [x * 24 + e]: the element of t_(-m)'s label action (index into f4Group())
  label: Int32Array
  // arrivals at a stored dock whose reduced frame disagrees (0 on a consistent reduction)
  inconsistent: number
  // the elements of the lattice generators' label actions, and whether the even lattice's are all the identity
  generatorElements: number[]
}

export function cuspQuotient(input: {
  coin: LabelledCoin
  translations: readonly HuskTranslation[]
  depth: number
  kind: LatticeKind
}): CuspQuotient {
  const { coin, translations, kind } = input
  const cut = input.depth
  const { center: c0 } = coin.frame
  const chart = horosphericalChart(coin)
  const tau = labelTransports({ coin, kind: 'antipodal' })
  const keyOf = centerKey(coin)
  const group = f4Group()
  const spacing = kind === 'unit' ? 1 : 2
  const gens = translations.map(t =>
    kind === 'unit'
      ? { T: t.T, S: t.S }
      : { T: matMul(t.T, t.T), S: matMul(t.S, t.S) },
  )
  const gensInv = gens.map(g => ({
    T: frameInverse(coin, g.T),
    S: frameInverse(coin, g.S),
  }))
  const elementOf = (S: Mat): number => {
    const perm = slotPermutation(coin, S)

    return perm ? group.findIndex(g => g.slots.every((v, k) => v === perm[k])) : -1
  }
  const generatorElements = gens.map(g => elementOf(g.S))
  const dim = c0.length
  // t_(-m) and its label action S_(-m), built one generator at a time (S of a product is the product of the S)
  const minus = (m: number[]): { T: Mat; S: Mat } => {
    let T = identity(dim)
    let S = identity(dim)

    m.forEach((c, i) => {
      const step = c > 0 ? gensInv[i]! : gens[i]!

      for (let k = 0; k < Math.abs(c); k++) {
        T = matMul(T, step.T)
        S = matMul(S, step.S)
      }
    })

    return { T, S }
  }

  const frames: Mat[] = []
  const depth: number[] = []
  const index = new Map<string, number>()
  const reduce = (
    f: Mat,
  ): { frame: Mat; m: number[]; element: number } => {
    const h = chart.coordinates(matVec(f, c0))
    const m = h.map(v => Math.floor((v + OFFSET) / spacing))
    const { T, S } = minus(m)
    // T f = f_rep S  ->  f_rep = T f S^-1
    const frame = matMul(matMul(T, f), frameInverse(coin, S))

    return { frame, m, element: elementOf(S) }
  }

  // the layer docks of one domain are the seeds: the base cell and its layer images within the domain
  const base = identity(dim)
  const seedFrames: Mat[] = [base]

  if (kind === 'even') {
    const t = translations

    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        for (let c = 0; c < 2; c++) {
          if (a + b + c === 0) {
            continue
          }

          let T = identity(dim)
          let S = identity(dim)

          ;[a, b, c].forEach((n, i) => {
            if (n) {
              T = matMul(T, t[i]!.T)
              S = matMul(S, t[i]!.S)
            }
          })

          // f = T base S^-1
          seedFrames.push(matMul(T, frameInverse(coin, S)))
        }
      }
    }
  }

  for (const f of seedFrames) {
    const r = reduce(f)
    const k = keyOf(r.frame)

    if (!index.has(k)) {
      index.set(k, frames.length)
      frames.push(r.frame)
      depth.push(0)
    }
  }

  const target: number[] = []
  const shift: number[] = []
  const label: number[] = []

  let inconsistent = 0

  for (let head = 0; head < frames.length; head++) {
    const f = frames[head]!

    for (let e = 0; e < SLOTS; e++) {
      const r = reduce(matMul(f, tau[e]!))
      const key = keyOf(r.frame)

      let id = index.get(key)

      if (id === undefined && depth[head]! < cut) {
        id = frames.length
        index.set(key, id)
        frames.push(r.frame)
        depth.push(depth[head]! + 1)
      } else if (id !== undefined && relativeGap(frames[id]!, r.frame) > 1e-6) {
        inconsistent++
      }

      target.push(id ?? -1)
      shift.push(...(id === undefined ? [0, 0, 0] : r.m))
      label.push(id === undefined ? -1 : r.element)
    }
  }

  const levels = frames.map(
    g => chart.level(matVec(g, c0)) / chart.layerLevel,
  )

  return {
    kind,
    docks: frames.length,
    depth: Int32Array.from(depth),
    level: Float64Array.from(levels),
    husk: frames.map(g => chart.coordinates(matVec(g, c0))),
    frames,
    target: Int32Array.from(target),
    shift: Int32Array.from(shift),
    label: Int32Array.from(label),
    inconsistent,
    generatorElements,
  }
}

// the flat stand-in in the same form: E-SPN-0167's depth-period-2 quotient of the flat D4 mesh modulo the husk lattice
// generated by (1, 0, 0, 1), (0, 1, 0, 1), (0, 0, 1, 1) is ONE dock; label e steps by m = (r1, r2, r3) (the remainder is
// a multiple of 2 e4, the identity in the quotient), with the identity label action
export function flatQuotient(): CuspQuotient {
  const group = f4Group()
  const identityElement = group.findIndex(g =>
    g.matrix.every((r, i) => r.every((x, j) => x === (i === j ? 1 : 0))),
  )

  return {
    kind: 'unit',
    docks: 1,
    depth: Int32Array.from([0]),
    level: Float64Array.from([1]),
    husk: [[0, 0, 0]],
    frames: [],
    target: new Int32Array(SLOTS),
    shift: Int32Array.from(DOCK_ROOTS.flatMap(r => [r[0]!, r[1]!, r[2]!])),
    label: new Int32Array(SLOTS).fill(identityElement),
    inconsistent: 0,
    generatorElements: [identityElement],
  }
}

// a finite labelled region (a ball of the bulk, say) in the same form: no lattice, the identity label action, and the
// distance from the seeds as the depth, so the hop, the Gram matrix and topModes read it unchanged at k = 0
export function regionAsQuotient(region: {
  cells: number
  neighbour: Int32Array
  distance: Int32Array
}): CuspQuotient {
  const group = f4Group()
  const identityElement = group.findIndex(g =>
    g.matrix.every((r, i) => r.every((x, j) => x === (i === j ? 1 : 0))),
  )

  return {
    kind: 'even',
    docks: region.cells,
    depth: Int32Array.from(region.distance),
    level: new Float64Array(region.cells),
    husk: [],
    frames: [],
    target: Int32Array.from(region.neighbour),
    shift: new Int32Array(region.cells * SLOTS * 3),
    label: new Int32Array(region.cells * SLOTS).fill(identityElement),
    inconsistent: 0,
    generatorElements: [identityElement],
  }
}

export type Boundary = 'reflect' | 'open'

// a block list: C maps dock y's even register to dock x's odd register by B (8 x 8 complex, row-major [odd][even]);
// dm[j] the lattice shift component, for dC / dk_j = -i m_j B
export type HopBlock = {
  x: number
  y: number
  re: Float64Array
  im: Float64Array
  m: [number, number, number]
}

let GAMMA_ROOT: number[][][] | undefined

const gammaOf = (r: readonly number[]): number[][] => {
  const g = gammaMatrices()

  return Array.from({ length: REG }, (_, i) =>
    Array.from({ length: REG }, (_, j) =>
      [0, 1, 2, 3].reduce((s, q) => s + r[q]! * g[q]![i]![j]!, 0),
    ),
  )
}

export function cliffordHop(input: {
  q: CuspQuotient
  k: readonly number[]
  boundary: Boundary
}): HopBlock[] {
  const { q, k, boundary } = input
  const group = f4Group()

  GAMMA_ROOT ??= DOCK_ROOTS.map(gammaOf)

  const blocks: HopBlock[] = []
  const cache = new Map<string, Float64Array>()
  // c0 gamma(g r_e) rho(g), real
  const real = (e: number, g: GroupElement, gi: number): Float64Array => {
    const key = `${e},${gi}`
    const hit = cache.get(key)

    if (hit) {
      return hit
    }

    const gr = GAMMA_ROOT![g.slots[e]!]!
    const out = new Float64Array(REG * REG)

    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        let s = 0

        for (let l = 0; l < REG; l++) {
          s += gr[i]![l]! * g.register[l]![j]!
        }

        out[i * REG + j] = C0 * s
      }
    }

    cache.set(key, out)

    return out
  }

  for (let y = 0; y < q.docks; y++) {
    for (let e = 0; e < SLOTS; e++) {
      const at = y * SLOTS + e
      const x = q.target[at]!

      if (x < 0) {
        if (boundary === 'reflect') {
          const gr = GAMMA_ROOT[e]!

          blocks.push({
            x: y,
            y,
            re: Float64Array.from(
              { length: REG * REG },
              (_, t) => -C0 * gr[Math.floor(t / REG)]![t % REG]!,
            ),
            im: new Float64Array(REG * REG),
            m: [0, 0, 0],
          })
        }

        continue
      }

      const gi = q.label[at]!
      const B = real(e, group[gi]!, gi)
      const m: [number, number, number] = [
        q.shift[at * 3]!,
        q.shift[at * 3 + 1]!,
        q.shift[at * 3 + 2]!,
      ]
      const ph = -(k[0]! * m[0] + k[1]! * m[1] + k[2]! * m[2])
      const c = Math.cos(ph)
      const s = Math.sin(ph)

      blocks.push({
        x,
        y,
        re: B.map(v => c * v),
        im: B.map(v => s * v),
        m,
      })
    }
  }

  return blocks
}

// H = C^dag C, dense n x n with n = 8 docks, row-major re and im
export function hopGram(
  docks: number,
  blocks: readonly HopBlock[],
): { n: number; re: Float64Array; im: Float64Array } {
  const n = REG * docks
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const byX: HopBlock[][] = Array.from({ length: docks }, () => [])

  for (const b of blocks) {
    byX[b.x]!.push(b)
  }

  for (const list of byX) {
    for (const a of list) {
      for (const c of list) {
        // (B_a^dag B_c)[i][j] = sum_l conj(B_a[l][i]) B_c[l][j]
        for (let i = 0; i < REG; i++) {
          const row = (REG * a.y + i) * n + REG * c.y

          for (let j = 0; j < REG; j++) {
            let sr = 0
            let si = 0

            for (let l = 0; l < REG; l++) {
              const ar = a.re[l * REG + i]!
              const ai = -a.im[l * REG + i]!
              const br = c.re[l * REG + j]!
              const bi = c.im[l * REG + j]!

              sr += ar * br - ai * bi
              si += ar * bi + ai * br
            }

            re[row + j]! += sr
            im[row + j]! += si
          }
        }
      }
    }
  }

  return { n, re, im }
}

// C v (derivative 0) or (dC / dk_j) v (derivative j + 1), v of length 8 docks; the result per dock (odd register)
export function hopApply(
  docks: number,
  blocks: readonly HopBlock[],
  vr: ArrayLike<number>,
  vi: ArrayLike<number>,
  derivative = 0,
): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(REG * docks)
  const im = new Float64Array(REG * docks)

  for (const b of blocks) {
    // the derivative's factor is -i m_j: (-i m_j) (sr + i si) = m_j (si - i sr)
    const f = derivative === 0 ? 1 : b.m[derivative - 1]!

    if (f === 0) {
      continue
    }

    for (let i = 0; i < REG; i++) {
      let sr = 0
      let si = 0

      for (let j = 0; j < REG; j++) {
        const xr = b.re[i * REG + j]!
        const xi = b.im[i * REG + j]!
        const yr = vr[REG * b.y + j]!
        const yi = vi[REG * b.y + j]!

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      if (derivative === 0) {
        re[REG * b.x + i]! += sr
        im[REG * b.x + i]! += si
      } else {
        re[REG * b.x + i]! += f * si
        im[REG * b.x + i]! += -f * sr
      }
    }
  }

  return { re, im }
}

// C^dag w, w per dock on the odd register; the result per dock on the even register
export function hopAdjointApply(
  docks: number,
  blocks: readonly HopBlock[],
  wr: ArrayLike<number>,
  wi: ArrayLike<number>,
): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(REG * docks)
  const im = new Float64Array(REG * docks)

  for (const b of blocks) {
    for (let j = 0; j < REG; j++) {
      let sr = 0
      let si = 0

      for (let i = 0; i < REG; i++) {
        // conj(B[i][j]) w_i
        const xr = b.re[i * REG + j]!
        const xi = -b.im[i * REG + j]!
        const yr = wr[REG * b.x + i]!
        const yi = wi[REG * b.x + i]!

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      re[REG * b.y + j]! += sr
      im[REG * b.y + j]! += si
    }
  }

  return { re, im }
}

// ---- the bands and where they live ----

export type ScreenBand = {
  // the eigenvalue mu of H = C^dag C and its multiplicity (a cluster within `CLUSTER` of each other)
  mu: number
  multiplicity: number
  // over the cluster: the largest layer share of the even (S) home, of the odd (D) home, and of their mean; the mean's
  // maximizing vector's two shares (a vector with both at least theta has a mean at least theta)
  homeS: number
  homeD: number
  score: number
  bestS: number
  bestD: number
  // the deepest shell's share of that vector's even home (the truncation's reach)
  deepest: number
  // d mu / d k_j of that vector (Hellmann-Feynman, 2 Re <C v | dC_j v>), filled only when asked
  gradient?: number[]
}

const CLUSTER = 1e-9

const dotC = (
  ar: ArrayLike<number>,
  ai: ArrayLike<number>,
  br: ArrayLike<number>,
  bi: ArrayLike<number>,
  from: number,
  to: number,
): [number, number] => {
  let r = 0
  let i = 0

  for (let a = from; a < to; a++) {
    r += ar[a]! * br[a]! + ai[a]! * bi[a]!
    i += ar[a]! * bi[a]! - ai[a]! * br[a]!
  }

  return [r, i]
}

// every band of H(k) with its home shares on the layer (depth 0). The even home of a vector v is v itself (the S
// member at the docks where the S mixer acts), the odd home is C v / |C v| (its Clifford partner at the docks where the
// D mixer acts); at mu = 0 the plane is a line and the odd home is taken equal to the even one. `gradientAbove`: the
// score above which a band's velocity is read
export function screenBands(input: {
  q: CuspQuotient
  k: readonly number[]
  boundary: Boundary
  gradientAbove?: number
}): { bands: ScreenBand[]; n: number; residual: number } {
  const { q, k, boundary } = input
  const blocks = cliffordHop({ q, k, boundary })
  const H = hopGram(q.docks, blocks)
  const n = H.n
  const eig = hermitianEigenRows(n, H.re, H.im)
  const maxDepth = Math.max(...q.depth)
  const layerRows: number[] = []
  const deepRows: number[] = []

  for (let x = 0; x < q.docks; x++) {
    for (let a = 0; a < REG; a++) {
      if (q.depth[x] === 0) {
        layerRows.push(REG * x + a)
      }

      if (q.depth[x] === maxDepth && maxDepth > 0) {
        deepRows.push(REG * x + a)
      }
    }
  }

  const row = (i: number): { re: Float64Array; im: Float64Array } => ({
    re: eig.vectorsRe.subarray(i * n, i * n + n),
    im: eig.vectorsIm.subarray(i * n, i * n + n),
  })
  const partner = Array.from({ length: n }, (_, i) => {
    const v = row(i)

    return hopApply(q.docks, blocks, v.re, v.im)
  })
  // the eigen residual |C^dag C v - mu v|, through the sparse blocks
  let residual = 0

  for (let i = 0; i < n; i++) {
    const c = partner[i]!
    const back = hopAdjointApply(q.docks, blocks, c.re, c.im)
    const v = row(i)
    let r = 0

    for (let t = 0; t < n; t++) {
      r +=
        (back.re[t]! - eig.values[i]! * v.re[t]!) ** 2 +
        (back.im[t]! - eig.values[i]! * v.im[t]!) ** 2
    }

    residual = Math.max(residual, Math.sqrt(r))
  }

  const onRows = (
    rows: readonly number[],
    ar: ArrayLike<number>,
    ai: ArrayLike<number>,
    br: ArrayLike<number>,
    bi: ArrayLike<number>,
  ): [number, number] => {
    let r = 0
    let im = 0

    for (const a of rows) {
      r += ar[a]! * br[a]! + ai[a]! * bi[a]!
      im += ar[a]! * bi[a]! - ai[a]! * br[a]!
    }

    return [r, im]
  }
  const bands: ScreenBand[] = []

  for (let i0 = 0; i0 < n; ) {
    let i1 = i0 + 1

    while (
      i1 < n &&
      eig.values[i1]! - eig.values[i1 - 1]! <= CLUSTER * Math.max(1, Math.abs(eig.values[i0]!))
    ) {
      i1++
    }

    const m = i1 - i0
    const mu = eig.values.slice(i0, i1).reduce((s, x) => s + x, 0) / m
    const line = mu < 1e-12
    const Pr = new Float64Array(m * m)
    const Pi = new Float64Array(m * m)
    const Qr = new Float64Array(m * m)
    const Qi = new Float64Array(m * m)

    for (let a = 0; a < m; a++) {
      for (let b = 0; b < m; b++) {
        const va = row(i0 + a)
        const vb = row(i0 + b)
        const [pr, pim] = onRows(layerRows, va.re, va.im, vb.re, vb.im)

        Pr[a * m + b] = pr
        Pi[a * m + b] = pim

        if (line) {
          Qr[a * m + b] = pr
          Qi[a * m + b] = pim
        } else {
          const ca = partner[i0 + a]!
          const cb = partner[i0 + b]!
          const [qr, qim] = onRows(layerRows, ca.re, ca.im, cb.re, cb.im)

          Qr[a * m + b] = qr / mu
          Qi[a * m + b] = qim / mu
        }
      }
    }

    const top = (re: Float64Array, im: Float64Array): HermitianTop =>
      hermitianTop(m, re, im)
    const S = top(Pr, Pi)
    const D = top(Qr, Qi)
    const mean = top(
      Pr.map((x, t) => (x + Qr[t]!) / 2),
      Pi.map((x, t) => (x + Qi[t]!) / 2),
    )
    const c = mean.vector
    const quad = (Ar: Float64Array, Ai: Float64Array): number => {
      let s = 0

      for (let a = 0; a < m; a++) {
        for (let b = 0; b < m; b++) {
          // conj(c_a) A_ab c_b, real part
          const xr = Ar[a * m + b]! * c.re[b]! - Ai[a * m + b]! * c.im[b]!
          const xi = Ar[a * m + b]! * c.im[b]! + Ai[a * m + b]! * c.re[b]!

          s += c.re[a]! * xr + c.im[a]! * xi
        }
      }

      return s
    }
    // the best vector itself, for the deepest share and the gradient
    const vr = new Float64Array(n)
    const vi = new Float64Array(n)

    for (let a = 0; a < m; a++) {
      const v = row(i0 + a)

      for (let t = 0; t < n; t++) {
        vr[t]! += c.re[a]! * v.re[t]! - c.im[a]! * v.im[t]!
        vi[t]! += c.re[a]! * v.im[t]! + c.im[a]! * v.re[t]!
      }
    }

    const band: ScreenBand = {
      mu,
      multiplicity: m,
      homeS: S.value,
      homeD: D.value,
      score: mean.value,
      bestS: quad(Pr, Pi),
      bestD: quad(Qr, Qi),
      deepest: onRows(deepRows, vr, vi, vr, vi)[0],
    }

    if (input.gradientAbove !== undefined && mean.value >= input.gradientAbove) {
      const cv = hopApply(q.docks, blocks, vr, vi)

      band.gradient = [1, 2, 3].map(j => {
        const dv = hopApply(q.docks, blocks, vr, vi, j)

        return 2 * dotC(cv.re, cv.im, dv.re, dv.im, 0, n)[0]
      })
    }

    bands.push(band)
    i0 = i1
  }

  return { bands, n, residual }
}

type HermitianTop = {
  value: number
  vector: { re: Float64Array; im: Float64Array }
}

// the largest eigenvalue of a small Hermitian matrix and its vector
function hermitianTop(m: number, re: Float64Array, im: Float64Array): HermitianTop {
  if (m === 1) {
    return {
      value: re[0]!,
      vector: { re: Float64Array.from([1]), im: Float64Array.from([0]) },
    }
  }

  const e = hermitianEigenRows(m, re, im, 1)
  const last = m - 1

  return {
    value: e.values[last]!,
    vector: {
      re: e.vectorsRe.slice(last * m, last * m + m),
      im: e.vectorsIm.slice(last * m, last * m + m),
    },
  }
}

// THE TOP OF THE SPECTRUM WITHOUT A DENSE MATRIX, for depth cuts too large to diagonalize: a block Krylov space of H =
// C^dag C (C and C^dag applied block by block) started from EVERY even direction of the layer docks (each with its own
// Weyl sequence of size 1e-3 everywhere, so no symmetry sector is missed), grown to `steps` vectors with full
// reorthogonalization (twice), then Rayleigh-Ritz on it. A vector with layer share s overlaps the start block by s, so
// the space holds it as strongly as the layer itself. Returns the `count` largest Ritz values, grouped into clusters
// (within 1e-9 relative, one cluster per eigenspace), each with its multiplicity, the largest residual |H x - theta x|
// (a Ritz value is an eigenvalue of H to within its residual, Weyl's bound), the LARGEST layer share over the cluster's
// span, and the deepest-shell share of that vector
export type TopMode = {
  mu: number
  multiplicity: number
  residual: number
  share: number
  deepest: number
}

export function topModes(input: {
  q: CuspQuotient
  k: readonly number[]
  boundary: Boundary
  steps: number
  count: number
}): TopMode[] {
  const { q, k, boundary, steps, count } = input
  const blocks = cliffordHop({ q, k, boundary })
  const n = REG * q.docks
  const maxDepth = Math.max(...q.depth)
  const apply = (vr: Float64Array, vi: Float64Array): { re: Float64Array; im: Float64Array } => {
    const c = hopApply(q.docks, blocks, vr, vi)

    return hopAdjointApply(q.docks, blocks, c.re, c.im)
  }
  const Vr: Float64Array[] = []
  const Vi: Float64Array[] = []
  const HVr: Float64Array[] = []
  const HVi: Float64Array[] = []
  const golden = (Math.sqrt(5) - 1) / 2
  const orthogonalize = (wr: Float64Array, wi: Float64Array): number => {
    for (let pass = 0; pass < 2; pass++) {
      for (let b = 0; b < Vr.length; b++) {
        const ur = Vr[b]!
        const ui = Vi[b]!
        let cr = 0
        let ci = 0

        for (let t = 0; t < n; t++) {
          cr += ur[t]! * wr[t]! + ui[t]! * wi[t]!
          ci += ur[t]! * wi[t]! - ui[t]! * wr[t]!
        }

        for (let t = 0; t < n; t++) {
          wr[t]! -= cr * ur[t]! - ci * ui[t]!
          wi[t]! -= cr * ui[t]! + ci * ur[t]!
        }
      }
    }

    let s = 0

    for (let t = 0; t < n; t++) {
      s += wr[t]! ** 2 + wi[t]! ** 2
    }

    const r = Math.sqrt(s)

    if (r > 1e-10) {
      for (let t = 0; t < n; t++) {
        wr[t]! /= r
        wi[t]! /= r
      }
    }

    return r
  }
  const push = (wr: Float64Array, wi: Float64Array): void => {
    Vr.push(wr)
    Vi.push(wi)

    const h = apply(wr, wi)

    HVr.push(h.re)
    HVi.push(h.im)
  }

  // the start block: one vector per even component of each layer dock
  let front: number[] = []

  for (let x = 0; x < q.docks && Vr.length < steps; x++) {
    if (q.depth[x] !== 0) {
      continue
    }

    for (let a = 0; a < REG && Vr.length < steps; a++) {
      const wr = new Float64Array(n)
      const wi = new Float64Array(n)
      const s = REG * x + a

      for (let t = 0; t < n; t++) {
        wr[t] = 1e-3 * ((((t + 1) * golden + 0.137 * (s + 1)) % 1) - 0.5)
        wi[t] = 1e-3 * ((((t + 1) * Math.SQRT2 + 0.291 * (s + 1)) % 1) - 0.5)
      }

      wr[s]! += 1

      if (orthogonalize(wr, wi) > 1e-10) {
        front.push(Vr.length)
        push(wr, wi)
      }
    }
  }

  while (Vr.length < steps && front.length > 0) {
    const next: number[] = []

    for (const j of front) {
      if (Vr.length >= steps) {
        break
      }

      const wr = Float64Array.from(HVr[j]!)
      const wi = Float64Array.from(HVi[j]!)

      if (orthogonalize(wr, wi) > 1e-10) {
        next.push(Vr.length)
        push(wr, wi)
      }
    }

    front = next
  }

  // Rayleigh-Ritz: T = V^dag H V
  const m = Vr.length
  const Tr = new Float64Array(m * m)
  const Ti = new Float64Array(m * m)

  for (let i = 0; i < m; i++) {
    for (let j = i; j < m; j++) {
      let cr = 0
      let ci = 0

      for (let t = 0; t < n; t++) {
        cr += Vr[i]![t]! * HVr[j]![t]! + Vi[i]![t]! * HVi[j]![t]!
        ci += Vr[i]![t]! * HVi[j]![t]! - Vi[i]![t]! * HVr[j]![t]!
      }

      Tr[i * m + j] = cr
      Ti[i * m + j] = ci
      Tr[j * m + i] = cr
      Ti[j * m + i] = -ci
    }
  }

  const e = hermitianEigenRows(m, Tr, Ti)
  const ritz = (r: number): { xr: Float64Array; xi: Float64Array; hr: Float64Array; hi: Float64Array } => {
    const xr = new Float64Array(n)
    const xi = new Float64Array(n)
    const hr = new Float64Array(n)
    const hi = new Float64Array(n)

    for (let j = 0; j < m; j++) {
      const zr = e.vectorsRe[r * m + j]!
      const zi = e.vectorsIm[r * m + j]!

      for (let t = 0; t < n; t++) {
        xr[t]! += zr * Vr[j]![t]! - zi * Vi[j]![t]!
        xi[t]! += zr * Vi[j]![t]! + zi * Vr[j]![t]!
        hr[t]! += zr * HVr[j]![t]! - zi * HVi[j]![t]!
        hi[t]! += zr * HVi[j]![t]! + zi * HVr[j]![t]!
      }
    }

    return { xr, xi, hr, hi }
  }
  const out: TopMode[] = []

  for (let r = m - 1; r >= 0 && out.length < count; ) {
    let r0 = r

    while (
      r0 - 1 >= 0 &&
      e.values[r0]! - e.values[r0 - 1]! <= CLUSTER * Math.max(1, Math.abs(e.values[r]!))
    ) {
      r0--
    }

    const members = Array.from({ length: r - r0 + 1 }, (_, i) => ritz(r0 + i))
    const size = members.length
    let residual = 0

    members.forEach((x, i) => {
      const theta = e.values[r0 + i]!
      let s = 0

      for (let t = 0; t < n; t++) {
        s += (x.hr[t]! - theta * x.xr[t]!) ** 2 + (x.hi[t]! - theta * x.xi[t]!) ** 2
      }

      residual = Math.max(residual, Math.sqrt(s))
    })

    // the layer projection on the cluster's span, and its top vector
    const Pr = new Float64Array(size * size)
    const Pi = new Float64Array(size * size)

    for (let a = 0; a < size; a++) {
      for (let b = 0; b < size; b++) {
        let cr = 0
        let ci = 0

        for (let t = 0; t < n; t++) {
          if (q.depth[Math.floor(t / REG)] !== 0) {
            continue
          }

          const A = members[a]!
          const B = members[b]!

          cr += A.xr[t]! * B.xr[t]! + A.xi[t]! * B.xi[t]!
          ci += A.xr[t]! * B.xi[t]! - A.xi[t]! * B.xr[t]!
        }

        Pr[a * size + b] = cr
        Pi[a * size + b] = ci
      }
    }

    const best = hermitianTop(size, Pr, Pi)
    let deepest = 0

    for (let t = 0; t < n; t++) {
      if (q.depth[Math.floor(t / REG)] !== maxDepth) {
        continue
      }

      let yr = 0
      let yi = 0

      members.forEach((x, a) => {
        const cr = best.vector.re[a]!
        const ci = best.vector.im[a]!

        yr += cr * x.xr[t]! - ci * x.xi[t]!
        yi += cr * x.xi[t]! + ci * x.xr[t]!
      })

      deepest += yr * yr + yi * yi
    }

    out.push({
      mu: members.reduce((s, _, i) => s + e.values[r0 + i]!, 0) / size,
      multiplicity: size,
      residual,
      share: best.value,
      deepest,
    })
    r = r0 - 1
  }

  return out
}

// the cycle's moving level at mu (E from the midpoint pi, per cycle), E-SPN-0180's law, and dE / d mu
export const bandPhase = (M: number, mu: number): number =>
  Math.acos(Math.max(-1, Math.min(1, Math.cos(M) - 2 * Math.cos(M / 2) ** 2 * mu)))

export const bandSlope = (M: number, mu: number): number =>
  (2 * Math.cos(M / 2) ** 2) / Math.sin(bandPhase(M, mu))

// ---- the rule itself on the even quotient ----

export type BlochWalk = {
  q: CuspQuotient
  k: readonly number[]
}

// one beat of the register rule on the quotient: the piece at every dock, then the stream (slot d of x to slot d of
// target, times e^(-i k . m)); a step past the cut reflects into slot -d of the same dock. Label-trivial quotients only
export function blochBeat(w: BlochWalk, s: State, piece: PieceSpec): State {
  const { q, k } = w

  if (q.kind !== 'even' && q.docks > 1) {
    throw new Error('cusp-bloch: blochBeat needs a label-trivial quotient')
  }

  const out = newState(q.docks)
  const pRe = new Float64Array(MODES)
  const pIm = new Float64Array(MODES)

  for (let x = 0; x < q.docks; x++) {
    applyPiece(piece, s.re, s.im, x * MODES, pRe, pIm)

    for (let d = 0; d < SLOTS; d++) {
      const at = x * SLOTS + d
      const n = q.target[at]!

      let to: number
      let c = 1
      let sn = 0

      if (n >= 0) {
        to = (n * SLOTS + d) * REG

        const ph = -(
          k[0]! * q.shift[at * 3]! +
          k[1]! * q.shift[at * 3 + 1]! +
          k[2]! * q.shift[at * 3 + 2]!
        )

        c = Math.cos(ph)
        sn = Math.sin(ph)
      } else {
        to = (x * SLOTS + OPPOSITE[d]!) * REG
      }

      for (let a = 0; a < REG; a++) {
        const r = pRe[d * REG + a]!
        const i = pIm[d * REG + a]!

        out.re[to + a] = c * r - sn * i
        out.im[to + a] = c * i + sn * r
      }
    }
  }

  return out
}

// the member of an A vector v (8 per dock): every slot of dock y carries v_y / sqrt 24
export function singletState(
  docks: number,
  vr: ArrayLike<number>,
  vi: ArrayLike<number>,
): State {
  const s = newState(docks)
  const c = 1 / Math.sqrt(SLOTS)

  for (let y = 0; y < docks; y++) {
    for (let d = 0; d < SLOTS; d++) {
      for (let a = 0; a < REG; a++) {
        s.re[(y * SLOTS + d) * REG + a] = c * vr[REG * y + a]!
        s.im[(y * SLOTS + d) * REG + a] = c * vi[REG * y + a]!
      }
    }
  }

  return s
}

// Q_D at every dock: (1 + Q_D) is X X (1 + Q_D), read from applyPiece with u = 2 and the swap undone
export function partnerProject(docks: number, s: State): State {
  const out = newState(docks)
  const aRe = new Float64Array(MODES)
  const aIm = new Float64Array(MODES)
  const two: PieceSpec = { sector: 'D', plus: [2, 0], minus: [2, 0] }

  for (let x = 0; x < docks; x++) {
    const o = x * MODES

    applyPiece(two, s.re, s.im, o, aRe, aIm)

    for (let d = 0; d < SLOTS; d++) {
      const from = OPPOSITE[d]! * REG

      for (let a = 0; a < REG; a++) {
        out.re[o + d * REG + a] = aRe[from + a]! - s.re[o + d * REG + a]!
        out.im[o + d * REG + a] = aIm[from + a]! - s.im[o + d * REG + a]!
      }
    }
  }

  return out
}

export const SWAP: PieceSpec = { sector: 'S', plus: [1, 0], minus: [1, 0] }
