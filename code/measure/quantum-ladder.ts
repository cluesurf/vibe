// Measurement tools for the plaquette ladder (E-FRC-0230 to 0233): exact spectra of its beat by momentum
// sector, the ladder of occupation read off them, and the thermal sums. Everything here is measurement (floats);
// the rule is code/rule/plaquette-ladder.
//
// The eigensolver: Householder tridiagonalization and implicit QL (Numerical Recipes' tred2 and tqli) on the
// real embedding [[A, -B], [B, A]] of a Hermitian H = A + iB, O(n^3), with each doubled cluster turned into
// complex vectors by pivoted complex Gram-Schmidt (the E-MTH-0011 fix of code/algebra/linear/eig-hermitian, whose
// Jacobi solver is too slow at n ~ 1000). A unitary U is diagonalized through the Hermitian
// (U + U^dag)/2 + t (U - U^dag)/(2i), whose eigenvectors are U's wherever t sin + cos separates U's phases; each
// cluster is re-diagonalized with a second t, and every returned pair is checked by its residual |U v - lambda v|.

import { bal } from '@/code/rule/lattice-qed'
import {
  classicalOmega,
  curlCurl,
  digitsOf,
  fluxesOf,
  fromAngleBasis,
  ladderBeat,
  ladderInverseBeat,
  ladderKernel,
  ladderSize,
  splitOf,
  toAngleBasis,
  type LadderKernel,
  type LadderSpec,
} from '@/code/rule/plaquette-ladder'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

// ---------------------------------------------------------------------------------------------------------
// real symmetric eigen (a is n*n row-major, overwritten): values ascending, vectors as columns

export function symmetricEigen(n: number, a: Float64Array): { values: Float64Array; vectors: Float64Array } {
  // tred2, 1-based loops over the 0-based row-major a: element (i, j) is a[(i - 1) * n + j - 1]
  const d = new Float64Array(n + 1)
  const e = new Float64Array(n + 1)

  for (let i = n; i >= 2; i--) {
    const l = i - 1
    const ri = (i - 1) * n - 1
    let h = 0
    let scale = 0

    if (l > 1) {
      for (let k = 1; k <= l; k++) scale += Math.abs(a[ri + k]!)

      if (scale === 0) e[i] = a[ri + l]!
      else {
        for (let k = 1; k <= l; k++) {
          const x = a[ri + k]! / scale

          a[ri + k] = x
          h += x * x
        }

        let f = a[ri + l]!
        let g = f >= 0 ? -Math.sqrt(h) : Math.sqrt(h)

        e[i] = scale * g
        h -= f * g
        a[ri + l] = f - g
        f = 0

        for (let j = 1; j <= l; j++) {
          const rj = (j - 1) * n - 1

          a[rj + i] = a[ri + j]! / h
          g = 0

          for (let k = 1; k <= j; k++) g += a[rj + k]! * a[ri + k]!

          for (let k = j + 1; k <= l; k++) g += a[(k - 1) * n + j - 1]! * a[ri + k]!

          e[j] = g / h
          f += e[j]! * a[ri + j]!
        }

        const hh = f / (h + h)

        for (let j = 1; j <= l; j++) {
          const rj = (j - 1) * n - 1

          f = a[ri + j]!
          g = e[j]! - hh * f
          e[j] = g

          for (let k = 1; k <= j; k++) a[rj + k] = a[rj + k]! - (f * e[k]! + g * a[ri + k]!)
        }
      }
    } else e[i] = a[ri + l]!

    d[i] = h
  }

  d[1] = 0
  e[1] = 0

  // accumulate the transformations; z holds them TRANSPOSED (row i of z = column i of Q) for contiguous rotations
  const col = new Float64Array(n + 1)

  for (let i = 1; i <= n; i++) {
    const l = i - 1
    const ri = (i - 1) * n - 1

    if (d[i] !== 0) {
      for (let j = 1; j <= l; j++) {
        let g = 0

        for (let k = 1; k <= l; k++) g += a[ri + k]! * a[(k - 1) * n + j - 1]!

        col[j] = g
      }

      for (let k = 1; k <= l; k++) {
        const rk = (k - 1) * n - 1
        const aki = a[rk + i]!

        for (let j = 1; j <= l; j++) a[rk + j] = a[rk + j]! - col[j]! * aki
      }
    }

    d[i] = a[ri + i]!
    a[ri + i] = 1

    for (let j = 1; j <= l; j++) {
      a[(j - 1) * n + i - 1] = 0
      a[ri + j] = 0
    }
  }

  // z[i][k] = a[k][i]
  const z = new Float64Array(n * n)

  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) z[c * n + r] = a[r * n + c]!

  // tqli
  for (let i = 2; i <= n; i++) e[i - 1] = e[i]!

  e[n] = 0

  for (let l = 1; l <= n; l++) {
    let iter = 0
    let m: number

    do {
      for (m = l; m <= n - 1; m++) {
        const dd = Math.abs(d[m]!) + Math.abs(d[m + 1]!)

        if (Math.abs(e[m]!) <= Number.EPSILON * dd) break
      }

      if (m !== l) {
        if (iter++ === 60) throw new Error('quantum-ladder: tqli did not converge')

        let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
        let r = Math.hypot(g, 1)

        g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? Math.abs(r) : -Math.abs(r)))

        let s = 1
        let c = 1
        let p = 0
        let i: number
        let broke = false

        for (i = m - 1; i >= l; i--) {
          const f = s * e[i]!
          const b = c * e[i]!

          r = Math.hypot(f, g)
          e[i + 1] = r

          if (r === 0) {
            d[i + 1] = d[i + 1]! - p
            e[m] = 0
            broke = true
            break
          }

          s = f / r
          c = g / r
          g = d[i + 1]! - p
          r = (d[i]! - g) * s + 2 * c * b
          p = s * r
          d[i + 1] = g + p
          g = c * r - b

          // rows i - 1 and i of z (columns i and i + 1 of Q, 1-based)
          const u = (i - 1) * n
          const w = i * n

          for (let k = 0; k < n; k++) {
            const x = z[w + k]!
            const y = z[u + k]!

            z[w + k] = s * y + c * x
            z[u + k] = c * y - s * x
          }
        }

        if (broke && i >= l) continue

        d[l] = d[l]! - p
        e[l] = g
        e[m] = 0
      }
    } while (m !== l)
  }

  const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => d[x + 1]! - d[y + 1]!)
  const values = Float64Array.from(order, i => d[i + 1]!)
  const vectors = new Float64Array(n * n)

  order.forEach((c, j) => {
    for (let r = 0; r < n; r++) vectors[r * n + j] = z[c * n + r]!
  })

  return { values, vectors }
}

// ---------------------------------------------------------------------------------------------------------
// Hermitian eigen (row-major re, im of n*n)

export type Vec = { re: Float64Array; im: Float64Array }

export function hermitianEigen(n: number, re: Float64Array, im: Float64Array, tolerance = 1e-9): { values: number[]; vectors: Vec[] } {
  const m = 2 * n
  const a = new Float64Array(m * m)
  let scale = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = (re[i * n + j]! + re[j * n + i]!) / 2
      const y = (im[i * n + j]! - im[j * n + i]!) / 2

      a[i * m + j] = x
      a[(n + i) * m + n + j] = x
      a[i * m + n + j] = -y
      a[(n + i) * m + j] = y
      scale = Math.max(scale, Math.abs(x), Math.abs(y))
    }
  }

  const { values, vectors } = symmetricEigen(m, a)
  const outValues: number[] = []
  const outVectors: Vec[] = []
  let start = 0

  while (start < m) {
    let end = start + 1

    while (end < m && values[end]! - values[end - 1]! <= tolerance * Math.max(1, scale)) end++

    if ((end - start) % 2 === 1 && end < m) end++

    const count = (end - start) >> 1
    const candidates: Vec[] = []

    for (let c = start; c < end; c++) {
      const v = { re: new Float64Array(n), im: new Float64Array(n) }

      for (let r = 0; r < n; r++) {
        v.re[r] = vectors[r * m + c]!
        v.im[r] = vectors[(n + r) * m + c]!
      }

      candidates.push(v)
    }

    const basis: Vec[] = []

    for (let j = 0; j < count; j++) {
      let best = -1
      let bestNorm = -1
      const residuals = candidates.map(v => orthogonalize(v, basis))

      residuals.forEach((v, i) => {
        const norm = normOf(v)

        if (norm > bestNorm) {
          bestNorm = norm
          best = i
        }
      })

      const v = residuals[best]!

      scaleVec(v, 1 / Math.sqrt(bestNorm))

      const again = orthogonalize(v, basis)

      scaleVec(again, 1 / Math.sqrt(normOf(again)))
      basis.push(again)
    }

    for (let j = 0; j < count; j++) {
      outValues.push(values[start + 2 * j]!)
      outVectors.push(basis[j]!)
    }

    start = end
  }

  return { values: outValues, vectors: outVectors }
}

const normOf = (v: Vec): number => {
  let s = 0

  for (let i = 0; i < v.re.length; i++) s += v.re[i]! ** 2 + v.im[i]! ** 2

  return s
}

const scaleVec = (v: Vec, x: number): void => {
  for (let i = 0; i < v.re.length; i++) {
    v.re[i] = v.re[i]! * x
    v.im[i] = v.im[i]! * x
  }
}

// <u, v> = sum conj(u) v
export function inner(u: Vec, v: Vec): [number, number] {
  let r = 0
  let i = 0

  for (let k = 0; k < u.re.length; k++) {
    r += u.re[k]! * v.re[k]! + u.im[k]! * v.im[k]!
    i += u.re[k]! * v.im[k]! - u.im[k]! * v.re[k]!
  }

  return [r, i]
}

function orthogonalize(v: Vec, basis: readonly Vec[]): Vec {
  const w = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }

  for (const q of basis) {
    const [r, i] = inner(q, w)

    for (let k = 0; k < w.re.length; k++) {
      w.re[k] = w.re[k]! - (r * q.re[k]! - i * q.im[k]!)
      w.im[k] = w.im[k]! - (r * q.im[k]! + i * q.re[k]!)
    }
  }

  return w
}

// ---------------------------------------------------------------------------------------------------------
// unitary eigen: phases eps (U v = e^(i eps) v) and vectors, with the largest residual

export type UnitaryEigen = { phases: number[]; vectors: Vec[]; residual: number }

export function unitaryEigen(n: number, ure: Float64Array, uim: Float64Array, t = GOLDEN, depth = 0): UnitaryEigen {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ur = ure[i * n + j]!
      const ui = uim[i * n + j]!
      // (U^dag)_ij = conj(U_ji)
      const vr = ure[j * n + i]!
      const vi = -uim[j * n + i]!

      re[i * n + j] = (ur + vr) / 2 + (t * (ui - vi)) / 2
      im[i * n + j] = (ui + vi) / 2 - (t * (ur - vr)) / 2
    }
  }

  const h = hermitianEigen(n, re, im)
  const phases: number[] = []
  const vectors: Vec[] = []
  let residual = 0
  let start = 0

  while (start < n) {
    let end = start + 1

    while (end < n && h.values[end]! - h.values[end - 1]! <= 1e-7) end++

    const block = h.vectors.slice(start, end)

    if (block.length === 1 || depth > 0) {
      for (const v of block) {
        const uv = applyDense(n, ure, uim, v)
        const [lr, li] = inner(v, uv)
        const phase = Math.atan2(li, lr)
        let r2 = 0

        for (let k = 0; k < n; k++) {
          r2 += (uv.re[k]! - (lr * v.re[k]! - li * v.im[k]!)) ** 2 + (uv.im[k]! - (lr * v.im[k]! + li * v.re[k]!)) ** 2
        }

        residual = Math.max(residual, Math.sqrt(r2))
        phases.push(phase)
        vectors.push(v)
      }
    } else {
      // the cluster: diagonalize U restricted to it with a second t
      const k = block.length
      const wre = new Float64Array(k * k)
      const wim = new Float64Array(k * k)
      const images = block.map(v => applyDense(n, ure, uim, v))

      for (let a = 0; a < k; a++) {
        for (let b = 0; b < k; b++) {
          const [r, i] = inner(block[a]!, images[b]!)

          wre[a * k + b] = r
          wim[a * k + b] = i
        }
      }

      const sub = unitaryEigen(k, wre, wim, SILVER, depth + 1)

      sub.vectors.forEach((c, j) => {
        const v = { re: new Float64Array(n), im: new Float64Array(n) }

        for (let a = 0; a < k; a++) {
          for (let x = 0; x < n; x++) {
            v.re[x] = v.re[x]! + c.re[a]! * block[a]!.re[x]! - c.im[a]! * block[a]!.im[x]!
            v.im[x] = v.im[x]! + c.re[a]! * block[a]!.im[x]! + c.im[a]! * block[a]!.re[x]!
          }
        }

        const uv = applyDense(n, ure, uim, v)
        const [lr, li] = inner(v, uv)
        let r2 = 0

        for (let x = 0; x < n; x++) {
          r2 += (uv.re[x]! - (lr * v.re[x]! - li * v.im[x]!)) ** 2 + (uv.im[x]! - (lr * v.im[x]! + li * v.re[x]!)) ** 2
        }

        residual = Math.max(residual, Math.sqrt(r2))
        phases.push(sub.phases[j]!)
        vectors.push(v)
      })
    }

    start = end
  }

  return { phases, vectors, residual }
}

export function applyDense(n: number, re: Float64Array, im: Float64Array, v: Vec): Vec {
  const out = { re: new Float64Array(n), im: new Float64Array(n) }

  for (let i = 0; i < n; i++) {
    let r = 0
    let s = 0

    for (let j = 0; j < n; j++) {
      r += re[i * n + j]! * v.re[j]! - im[i * n + j]! * v.im[j]!
      s += re[i * n + j]! * v.im[j]! + im[i * n + j]! * v.re[j]!
    }

    out.re[i] = r
    out.im[i] = s
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// momentum sectors of the light alone (no atom): the translation moves square p's loop to square p + 1

export type Sectors = {
  readonly size: number
  readonly rep: Int32Array // representative of each index's orbit
  readonly step: Int32Array // j with T^j(rep) = index
  readonly length: Int32Array // orbit length, per representative (0 elsewhere)
}

export function translate(spec: LadderSpec, i: number): number {
  const { n, plaquettes: L } = spec
  const { m } = digitsOf(spec, i)
  let out = 0

  for (let p = L - 1; p >= 0; p--) out = out * n + m[(p - 1 + L) % L]!

  return out
}

export function sectorsOf(spec: LadderSpec): Sectors {
  const size = spec.n ** spec.plaquettes
  const rep = new Int32Array(size).fill(-1)
  const step = new Int32Array(size)
  const length = new Int32Array(size)

  for (let i = 0; i < size; i++) {
    if (rep[i] !== -1) continue

    let j = i
    let t = 0

    do {
      rep[j] = i
      step[j] = t
      j = translate(spec, j)
      t++
    } while (j !== i)

    length[i] = t
  }

  return { size, rep, step, length }
}

// the basis of momentum q (k = 2 pi q / L): representatives whose orbit admits it
export function sectorBasis(spec: LadderSpec, sectors: Sectors, q: number): number[] {
  const L = spec.plaquettes
  const out: number[] = []

  for (let i = 0; i < sectors.size; i++) if (sectors.rep[i] === i && (q * sectors.length[i]!) % L === 0) out.push(i)

  return out
}

// the full-space vector of basis state (r, q): (1/sqrt len) sum_j e^(-i k j) |T^j r>
export function sectorState(spec: LadderSpec, sectors: Sectors, r: number, q: number, re: Float64Array, im: Float64Array): void {
  re.fill(0)
  im.fill(0)

  const len = sectors.length[r]!
  const k = (2 * Math.PI * q) / spec.plaquettes
  let j = r

  for (let t = 0; t < len; t++) {
    re[j] = Math.cos(-k * t) / Math.sqrt(len)
    im[j] = Math.sin(-k * t) / Math.sqrt(len)
    j = translate(spec, j)
  }
}

// coefficients of a full-space vector on the sector basis
export function sectorProject(spec: LadderSpec, sectors: Sectors, basis: readonly number[], q: number, re: Float64Array, im: Float64Array): Vec {
  const position = new Map(basis.map((r, a) => [r, a]))
  const out = { re: new Float64Array(basis.length), im: new Float64Array(basis.length) }
  const k = (2 * Math.PI * q) / spec.plaquettes

  for (let i = 0; i < sectors.size; i++) {
    const a = position.get(sectors.rep[i]!)

    if (a === undefined) continue

    const len = sectors.length[sectors.rep[i]!]!
    const t = sectors.step[i]!
    // conj(e^(-i k t) / sqrt len) * v_i
    const cr = Math.cos(k * t) / Math.sqrt(len)
    const ci = Math.sin(k * t) / Math.sqrt(len)

    out.re[a] = out.re[a]! + cr * re[i]! - ci * im[i]!
    out.im[a] = out.im[a]! + cr * im[i]! + ci * re[i]!
  }

  return out
}

// the beat's block in sector q, dense row-major
export function sectorBlock(kernel: LadderKernel, sectors: Sectors, basis: readonly number[], q: number): { re: Float64Array; im: Float64Array } {
  const d = basis.length
  const re = new Float64Array(d * d)
  const im = new Float64Array(d * d)
  const vr = new Float64Array(sectors.size)
  const vi = new Float64Array(sectors.size)

  basis.forEach((r, col) => {
    sectorState(kernel.spec, sectors, r, q, vr, vi)
    ladderBeat(kernel, vr, vi)

    const c = sectorProject(kernel.spec, sectors, basis, q, vr, vi)

    for (let row = 0; row < d; row++) {
      re[row * d + col] = c.re[row]!
      im[row * d + col] = c.im[row]!
    }
  })

  return { re, im }
}

// a sector vector back in the full space
export function sectorToFull(spec: LadderSpec, sectors: Sectors, basis: readonly number[], q: number, v: Vec): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(sectors.size)
  const im = new Float64Array(sectors.size)
  const tr = new Float64Array(sectors.size)
  const ti = new Float64Array(sectors.size)

  basis.forEach((r, a) => {
    sectorState(spec, sectors, r, q, tr, ti)

    for (let i = 0; i < sectors.size; i++) {
      if (tr[i] === 0 && ti[i] === 0) continue

      re[i] = re[i]! + v.re[a]! * tr[i]! - v.im[a]! * ti[i]!
      im[i] = im[i]! + v.re[a]! * ti[i]! + v.im[a]! * tr[i]!
    }
  })

  return { re, im }
}

// ---------------------------------------------------------------------------------------------------------
// the whole spectrum of the light alone: every eigenstate's quasi-energy, momentum and generator energy

export type Level = { q: number; phase: number; energy: number; vector: Vec }

export function ladderSpectrum(spec: LadderSpec, energyOf: (full: { re: Float64Array; im: Float64Array }) => number): { levels: Level[]; residual: number } {
  const kernel = ladderKernel(spec)
  const sectors = sectorsOf(spec)
  const levels: Level[] = []
  let residual = 0

  for (let q = 0; q < spec.plaquettes; q++) {
    const basis = sectorBasis(spec, sectors, q)
    const block = sectorBlock(kernel, sectors, basis, q)
    const eig = unitaryEigen(basis.length, block.re, block.im)

    residual = Math.max(residual, eig.residual)
    eig.vectors.forEach((v, j) => {
      const full = sectorToFull(spec, sectors, basis, q, v)

      levels.push({ q, phase: eig.phases[j]!, energy: energyOf(full), vector: v })
    })
  }

  return { levels, residual }
}

// the unwrapped energy of each level above the vacuum: (eps_vac - eps) mod 2 pi, plus the whole turns that bring
// it nearest the generator's energy difference (U = e^(-i H), so a level's energy is minus its phase)
export function unwrapped(levels: readonly Level[]): { vacuum: number; energies: number[] } {
  let vacuum = 0

  levels.forEach((l, i) => {
    if (l.energy < levels[vacuum]!.energy) vacuum = i
  })

  const e0 = levels[vacuum]!.phase
  const h0 = levels[vacuum]!.energy
  const energies = levels.map(l => {
    const base = (((e0 - l.phase) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    const turns = Math.round((l.energy - h0 - base) / (2 * Math.PI))

    return base + 2 * Math.PI * turns
  })

  return { vacuum, energies }
}

// ---------------------------------------------------------------------------------------------------------
// the mode-resolved invariant energy of a state of the light alone (measurement): the classical leapfrog keeps,
// per mode k, Q_k = f |B_k|^2 + f s K_k Re(B_k^* m_k) + s K_k |m_k|^2, and a harmonic level holds
// Q_k = (n_k + 1/2) N sin(omega_k) / pi, so (pi / N) sum_k (omega_k / sin omega_k) <Q_k> reads sum (n_k + 1/2)
// omega_k exactly in the harmonic regime. B is the square's angle (U_p = w^B), m its loop, both read balanced.
// `crossSign` flips the cross term's sign (a check of the angle convention).

export function modeEnergy(kernel: LadderKernel, re: Float64Array, im: Float64Array, crossSign = 1, debug?: number[][]): number {
  const { n, plaquettes: L } = kernel.spec
  const { s, f, kappa } = splitOf(kernel.spec)
  const size = n ** L
  const angle = toAngleBasis(kernel, re, im)
  const cBB = new Float64Array(L * L)
  const cmm = new Float64Array(L * L)
  const cBm = new Float64Array(L * L)
  const mDig = new Int32Array(L)

  for (let i = 0; i < size; i++) {
    const wa = angle.re[i]! ** 2 + angle.im[i]! ** 2
    const wm = re[i]! ** 2 + im[i]! ** 2
    let rest = i

    for (let p = 0; p < L; p++) {
      mDig[p] = bal(rest % n, n)
      rest = Math.floor(rest / n)
    }

    for (let p = 0; p < L; p++) {
      for (let q = 0; q < L; q++) {
        cBB[p * L + q] = cBB[p * L + q]! + wa * mDig[p]! * mDig[q]!
        cmm[p * L + q] = cmm[p * L + q]! + wm * mDig[p]! * mDig[q]!
      }
    }
  }

  // B_p psi: multiply the angle-basis vector by B = -bal(b_p) and return to the flux basis
  for (let p = 0; p < L; p++) {
    const br = new Float64Array(size)
    const bi = new Float64Array(size)
    const stride = n ** p

    for (let i = 0; i < size; i++) {
      const B = -bal(Math.floor(i / stride) % n, n)

      br[i] = B * angle.re[i]!
      bi[i] = B * angle.im[i]!
    }

    const back = fromAngleBasis(kernel, br, bi)

    for (let i = 0; i < size; i++) {
      let rest = i

      for (let q = 0; q < L; q++) {
        const m = bal(rest % n, n)

        // Re conj(B_p psi)_i m_q psi_i
        cBm[p * L + q] = cBm[p * L + q]! + m * (back.re[i]! * re[i]! + back.im[i]! * im[i]!)
        rest = Math.floor(rest / n)
      }
    }
  }

  let total = 0

  for (let j = 0; j < L; j++) {
    const k = (2 * Math.PI * j) / L
    const K = curlCurl(k, L)
    const omega = Math.acos(1 - (kappa * K) / 2)
    let xBB = 0
    let xmm = 0
    let xBm = 0

    for (let p = 0; p < L; p++) {
      for (let q = 0; q < L; q++) {
        const c = Math.cos(k * (p - q)) / L

        xBB += c * cBB[p * L + q]!
        xmm += c * cmm[p * L + q]!
        xBm += c * cBm[p * L + q]!
      }
    }

    if (debug) debug.push([xBB, xBm, xmm, (n * Math.sin(omega)) / (2 * Math.PI)])

    total += (omega / Math.sin(omega)) * (f * xBB + crossSign * f * s * K * xBm + s * K * xmm)
  }

  return (Math.PI / n) * total
}

// ---------------------------------------------------------------------------------------------------------
// the one-quantum band of a box: in each momentum sector q, the eigenstate with the largest overlap with
// m_k |vac> (in the harmonic reading a linear field acting on the vacuum makes exactly one quantum), its energy
// above the vacuum (the phase difference mod 2 pi), the overlap, and the classical symbol's omega(k)

export type BandPoint = { q: number; k: number; omega: number; classical: number; overlap: number }

export function oneQuantumBand(spec: LadderSpec): { band: BandPoint[]; levels: Level[]; vacuum: number; residual: number } {
  const kernel = ladderKernel(spec)
  const { kappa } = splitOf(spec)
  const L = spec.plaquettes
  const n = spec.n
  const sectors = sectorsOf(spec)
  const { levels, residual } = ladderSpectrum(spec, full => modeEnergy(kernel, full.re, full.im))
  // the vacuum: the lowest invariant energy among the translation-invariant states
  let vacuum = levels.findIndex(l => l.q === 0)

  levels.forEach((l, i) => {
    if (l.q === 0 && l.energy < levels[vacuum]!.energy) vacuum = i
  })

  const vfull = sectorToFull(spec, sectors, sectorBasis(spec, sectors, 0), 0, levels[vacuum]!.vector)
  const band: BandPoint[] = []

  for (let q = 0; q < L; q++) {
    const k = (2 * Math.PI * q) / L
    const tr = new Float64Array(sectors.size)
    const ti = new Float64Array(sectors.size)

    for (let i = 0; i < sectors.size; i++) {
      let rest = i
      let sr = 0
      let si = 0

      for (let p = 0; p < L; p++) {
        const m = bal(rest % n, n)

        sr += (m * Math.cos(-k * p)) / Math.sqrt(L)
        si += (m * Math.sin(-k * p)) / Math.sqrt(L)
        rest = Math.floor(rest / n)
      }

      tr[i] = sr * vfull.re[i]! - si * vfull.im[i]!
      ti[i] = sr * vfull.im[i]! + si * vfull.re[i]!
    }

    const basis = sectorBasis(spec, sectors, q)
    const t = sectorProject(spec, sectors, basis, q, tr, ti)
    let norm = 0

    for (let a = 0; a < basis.length; a++) norm += t.re[a]! ** 2 + t.im[a]! ** 2

    let best = -1
    let bestWeight = 0

    levels.forEach((l, i) => {
      if (l.q !== q || i === vacuum) return

      const [r, s] = inner(l.vector, t)
      const w = (r * r + s * s) / norm

      if (w > bestWeight) {
        bestWeight = w
        best = i
      }
    })

    const omega = best < 0 ? Number.NaN : (((levels[vacuum]!.phase - levels[best]!.phase) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    band.push({ q, k, omega, classical: classicalOmega(kappa, k, L), overlap: bestWeight })
  }

  return { band, levels, vacuum, residual }
}

// ---------------------------------------------------------------------------------------------------------
// large boxes (no dense diagonalization): spectral filters, the vacuum, energies per square

export type Field = { re: Float64Array; im: Float64Array }

export const copyField = (v: Field): Field => ({ re: Float64Array.from(v.re), im: Float64Array.from(v.im) })

export function normalize(v: Field): number {
  let s = 0

  for (let i = 0; i < v.re.length; i++) s += v.re[i]! ** 2 + v.im[i]! ** 2

  const norm = Math.sqrt(s)

  for (let i = 0; i < v.re.length; i++) {
    v.re[i] = v.re[i]! / norm
    v.im[i] = v.im[i]! / norm
  }

  return norm
}

export function innerField(u: Field, v: Field): [number, number] {
  return inner(u, v)
}

// the phase of <v|U|v> and the residual |U v - e^(i phase) v| for a normalized v
export function beatPhase(kernel: LadderKernel, v: Field): { phase: number; residual: number } {
  const w = copyField(v)

  ladderBeat(kernel, w.re, w.im)

  const [r, i] = inner(v, w)
  const phase = Math.atan2(i, r)
  const c = Math.cos(phase)
  const s = Math.sin(phase)
  let res = 0

  for (let k = 0; k < v.re.length; k++) res += (w.re[k]! - (c * v.re[k]! - s * v.im[k]!)) ** 2 + (w.im[k]! - (c * v.im[k]! + s * v.re[k]!)) ** 2

  return { phase, residual: Math.sqrt(res) }
}

// h(H - E0) v, h the indicator of [a, b] (relative energies, radians per beat) smoothed by a Gaussian of width
// sigma, as the two-sided Fourier sum sum_j h_j e^(-i j E0) U^(-j) (U = e^(-i H)), cut where the Gaussian
// factor falls below 1e-13
export function spectralFilter(kernel: LadderKernel, v: Field, e0: number, a: number, b: number, sigma: number): Field {
  const T = Math.ceil(Math.sqrt(2 * 30) / sigma)
  const coefficient = (j: number): [number, number] => {
    const damp = Math.exp(-(sigma * sigma * j * j) / 2)

    if (j === 0) return [((b - a) / (2 * Math.PI)) * damp, 0]

    // (e^(-i j a) - e^(-i j b)) / (2 pi i j)
    const xr = Math.cos(j * a) - Math.cos(j * b)
    const xi = -Math.sin(j * a) + Math.sin(j * b)

    return [(xi / (2 * Math.PI * j)) * damp, (-xr / (2 * Math.PI * j)) * damp]
  }
  const acc = { re: new Float64Array(v.re.length), im: new Float64Array(v.re.length) }
  const add = (w: Field, cr: number, ci: number): void => {
    for (let k = 0; k < w.re.length; k++) {
      acc.re[k] = acc.re[k]! + cr * w.re[k]! - ci * w.im[k]!
      acc.im[k] = acc.im[k]! + cr * w.im[k]! + ci * w.re[k]!
    }
  }

  add(v, ...coefficient(0))

  for (const direction of [1, -1]) {
    const w = copyField(v)

    for (let j = 1; j <= T; j++) {
      // direction 1: U^(-j) with coefficient h_j e^(-i j E0); direction -1: U^j with h_(-j) e^(i j E0)
      if (direction === 1) ladderInverseBeat(kernel, w.re, w.im)
      else ladderBeat(kernel, w.re, w.im)

      const [hr, hi] = coefficient(direction * j)
      const t = -direction * j * e0
      const cr = hr * Math.cos(t) - hi * Math.sin(t)
      const ci = hr * Math.sin(t) + hi * Math.cos(t)

      add(w, cr, ci)
    }
  }

  return acc
}

// the product trial: every square's register in the ground state of one register with on-site stiffness 4 (a
// square's two rails and its share of two rungs), found exactly on the one-register rule
export function productTrial(spec: LadderSpec): Field {
  const single: LadderSpec = { n: spec.n, plaquettes: 1, root: spec.root, drift: 2 * spec.drift, force: spec.force }
  const kernel = ladderKernel(single)
  const { levels } = ladderSpectrum(single, full => modeEnergy(kernel, full.re, full.im))
  const ground = levels.reduce((best, l) => (l.energy < best.energy ? l : best)).vector
  const n = spec.n
  const L = spec.plaquettes
  const size = n ** L
  const out = { re: new Float64Array(size), im: new Float64Array(size) }

  for (let i = 0; i < size; i++) {
    let rest = i
    let pr = 1
    let pi = 0

    for (let p = 0; p < L; p++) {
      const d = rest % n
      const gr = ground.re[d]!
      const gi = ground.im[d]!
      const nr = pr * gr - pi * gi

      pi = pr * gi + pi * gr
      pr = nr
      rest = Math.floor(rest / n)
    }

    out.re[i] = pr
    out.im[i] = pi
  }

  normalize(out)

  return out
}

// the light's vacuum on a box too large to diagonalize: the product trial filtered twice to relative energies
// within half the lowest photon energy of the vacuum's
export function ladderVacuum(kernel: LadderKernel, passes = 2): { vacuum: Field; phase: number; residual: number; sigma: number } {
  const { kappa } = splitOf(kernel.spec)
  const omegaMin = classicalOmega(kappa, 0, kernel.spec.plaquettes)
  const sigma = omegaMin / 8
  let v = productTrial(kernel.spec)
  let phase = beatPhase(kernel, v).phase

  for (let pass = 0; pass < passes; pass++) {
    v = spectralFilter(kernel, v, -phase, -omegaMin / 2, omegaMin / 2, sigma)
    normalize(v)
    phase = beatPhase(kernel, v).phase
  }

  return { vacuum: v, phase, residual: beatPhase(kernel, v).residual, sigma }
}

// per square: the drift's energy (its two rails and half of each rung) and the force's (its angle), radians per beat
export function squareElectricTable(spec: LadderSpec): Float32Array {
  const { n, plaquettes: L, root, drift } = spec
  const size = ladderSize(spec)
  const out = new Float32Array(size * L)

  for (let i = 0; i < size; i++) {
    const e = fluxesOf(spec, i)

    for (let p = 0; p < L; p++) {
      const own = bal(e[p]!, n) ** 2 + bal(e[L + p]!, n) ** 2 + (bal(e[2 * L + p]!, n) ** 2 + bal(e[2 * L + ((p + 1) % L)]!, n) ** 2) / 2

      out[i * L + p] = (2 * Math.PI * drift * own) / root
    }
  }

  return out
}

export function squareEnergies(kernel: LadderKernel, table: Float32Array, v: Field): Float64Array {
  const { n, plaquettes: L, root, force } = kernel.spec
  const out = new Float64Array(L)
  const half = n ** L

  for (let i = 0; i < kernel.size; i++) {
    const w = v.re[i]! ** 2 + v.im[i]! ** 2

    if (w === 0) continue

    for (let p = 0; p < L; p++) out[p] = out[p]! + w * table[i * L + p]!
  }

  const angle = toAngleBasis(kernel, v.re, v.im)

  for (let i = 0; i < kernel.size; i++) {
    const w = angle.re[i]! ** 2 + angle.im[i]! ** 2

    if (w === 0) continue

    let rest = i % half

    for (let p = 0; p < L; p++) {
      out[p] = out[p]! + (w * 2 * Math.PI * force * bal(rest % n, n) ** 2) / root
      rest = Math.floor(rest / n)
    }
  }

  return out
}

// m_p |v> (the balanced loop value of square p times the state)
export function loopTimes(spec: LadderSpec, p: number, v: Field): Field {
  const n = spec.n
  const stride = n ** p
  const out = copyField(v)

  for (let i = 0; i < v.re.length; i++) {
    const m = bal(Math.floor(i / stride) % n, n)

    out.re[i] = m * v.re[i]!
    out.im[i] = m * v.im[i]!
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the harmonic reading of the light: its classical map and its vacuum two-point function, in the variables
// X = (B_0 .. B_(L-1), m_0 .. m_(L-1)); a linear excitation c^T X of the vacuum has, for any quadratic density
// X^T H X, the excess 2 z^dag H z / (c^dag W c) with z(t) = M^t W c (Wick): the classical image of the quantum

export function ladderMatrixK(L: number): Float64Array {
  const K = new Float64Array(L * L)

  for (let p = 0; p < L; p++) {
    if (L === 1) {
      K[0] = 2
      continue
    }

    K[p * L + p] = K[p * L + p]! + 4
    K[p * L + ((p + 1) % L)] = K[p * L + ((p + 1) % L)]! - 1
    K[p * L + ((p - 1 + L) % L)] = K[p * L + ((p - 1 + L) % L)]! - 1
  }

  return K
}

// one classical beat on a complex (B, m): B += s K m, then m -= f B
export function classicalBeat(spec: LadderSpec, B: Field, m: Field): void {
  const L = spec.plaquettes
  const { s, f } = splitOf(spec)
  const K = ladderMatrixK(L)

  for (const part of ['re', 'im'] as const) {
    const Km = new Float64Array(L)

    for (let p = 0; p < L; p++) for (let q = 0; q < L; q++) Km[p] = Km[p]! + K[p * L + q]! * m[part][q]!

    for (let p = 0; p < L; p++) B[part][p] = B[part][p]! + s * Km[p]!

    for (let p = 0; p < L; p++) m[part][p] = m[part][p]! - f * B[part][p]!
  }
}

// W = Gamma + (i hbar / 2) J with hbar = N / (2 pi), [B_p, m_q] = i hbar delta_pq, and per mode
// Gamma_k = (hbar / 2) sin(omega_k) S_k^-1 with S_k = [[f, f s K / 2], [f s K / 2, s K]]; returned as the
// function c -> W c on (B, m) index order
export function harmonicTwoPoint(spec: LadderSpec): (cB: Field, cm: Field) => { B: Field; m: Field } {
  const L = spec.plaquettes
  const { s, f, kappa } = splitOf(spec)
  const hbar = spec.n / (2 * Math.PI)
  // real-space blocks by translation: G(d) = (1/L) sum_k cos(k d) Gamma_k
  const gBB = new Float64Array(L)
  const gBm = new Float64Array(L)
  const gmm = new Float64Array(L)

  for (let j = 0; j < L; j++) {
    const k = (2 * Math.PI * j) / L
    const K = curlCurl(k, L)
    const omega = Math.acos(1 - (kappa * K) / 2)
    const det = Math.sin(omega) ** 2
    const scale = ((hbar / 2) * Math.sin(omega)) / det

    for (let d = 0; d < L; d++) {
      const c = Math.cos(k * d) / L

      gBB[d] = gBB[d]! + c * scale * s * K
      gBm[d] = gBm[d]! - c * scale * ((f * s * K) / 2)
      gmm[d] = gmm[d]! + c * scale * f
    }
  }

  return (cB, cm) => {
    const B = { re: new Float64Array(L), im: new Float64Array(L) }
    const m = { re: new Float64Array(L), im: new Float64Array(L) }

    for (let p = 0; p < L; p++) {
      for (let q = 0; q < L; q++) {
        const d = (((p - q) % L) + L) % L

        for (const part of ['re', 'im'] as const) {
          B[part][p] = B[part][p]! + gBB[d]! * cB[part][q]! + gBm[d]! * cm[part][q]!
          m[part][p] = m[part][p]! + gBm[d]! * cB[part][q]! + gmm[d]! * cm[part][q]!
        }
      }

      // the commutator part: (W c)_B += i hbar/2 c_m, (W c)_m -= i hbar/2 c_B
      B.re[p] = B.re[p]! - (hbar / 2) * cm.im[p]!
      B.im[p] = B.im[p]! + (hbar / 2) * cm.re[p]!
      m.re[p] = m.re[p]! + (hbar / 2) * cB.im[p]!
      m.im[p] = m.im[p]! - (hbar / 2) * cB.re[p]!
    }

    return { B, m }
  }
}

// the per-square energy density of a complex classical (B, m), the quadratic forms the quantum reading uses
export function classicalSquareEnergies(spec: LadderSpec, B: Field, m: Field): Float64Array {
  const L = spec.plaquettes
  const out = new Float64Array(L)
  const abs2 = (re: number, im: number): number => re * re + im * im

  for (let p = 0; p < L; p++) {
    const l = (p - 1 + L) % L
    const r = (p + 1) % L
    let e = 2 * abs2(m.re[p]!, m.im[p]!)

    if (L > 1) e += (abs2(m.re[l]! - m.re[p]!, m.im[l]! - m.im[p]!) + abs2(m.re[p]! - m.re[r]!, m.im[p]! - m.im[r]!)) / 2

    out[p] = (2 * Math.PI * (spec.drift * e + spec.force * abs2(B.re[p]!, B.im[p]!))) / spec.root
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the STAND-IN atom on rung 0: its bare beat diag(1, zeta^-c) V(z) on (x = 0, x = 1), its two states, gap and
// dipole <g|x|e>

export type AtomBare = { gap: number; ground: [number, number, number, number]; excited: [number, number, number, number]; dipole: number }

export function atomBare(spec: LadderSpec): AtomBare {
  const z = ((spec.hop ?? 0) * 2 * Math.PI) / spec.root
  const t = (-2 * Math.PI * spec.drift) / spec.root
  // V = [[a, b], [b, a]], a = (1 + z)/2, b = (1 - z)/2; then row 1 times e^(i t)
  const ar = (1 + Math.cos(z)) / 2
  const ai = Math.sin(z) / 2
  const br = (1 - Math.cos(z)) / 2
  const bi = -Math.sin(z) / 2
  const re = new Float64Array([ar, br, Math.cos(t) * br - Math.sin(t) * bi, Math.cos(t) * ar - Math.sin(t) * ai])
  const im = new Float64Array([ai, bi, Math.sin(t) * br + Math.cos(t) * bi, Math.sin(t) * ar + Math.cos(t) * ai])
  const eig = unitaryEigen(2, re, im)
  // energy = -phase; the excited state has the larger energy in (-pi, pi]
  const [i0, i1] = -eig.phases[0]! > -eig.phases[1]! ? [1, 0] : [0, 1]
  const g = eig.vectors[i0]!
  const e = eig.vectors[i1]!
  const gap = (((eig.phases[i0]! - eig.phases[i1]!) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  // <g|x|e> = conj(g_1) e_1
  const dr = g.re[1]! * e.re[1]! + g.im[1]! * e.im[1]!
  const di = g.re[1]! * e.im[1]! - g.im[1]! * e.re[1]!

  return {
    gap,
    ground: [g.re[0]!, g.im[0]!, g.re[1]!, g.im[1]!],
    excited: [e.re[0]!, e.im[0]!, e.re[1]!, e.im[1]!],
    dipole: Math.hypot(dr, di),
  }
}

// the atom state times a light state, on the index x N^L + i
export function atomTimes(state: readonly [number, number, number, number], light: Field): Field {
  const half = light.re.length
  const out = { re: new Float64Array(2 * half), im: new Float64Array(2 * half) }

  for (let x = 0; x < 2; x++) {
    const cr = state[2 * x]!
    const ci = state[2 * x + 1]!

    for (let i = 0; i < half; i++) {
      out.re[x * half + i] = cr * light.re[i]! - ci * light.im[i]!
      out.im[x * half + i] = cr * light.im[i]! + ci * light.re[i]!
    }
  }

  return out
}

// the probability that the atom is in `state`: sum over light indices of |<state| v_(., i)>|^2
export function atomPopulation(state: readonly [number, number, number, number], v: Field): number {
  const half = v.re.length / 2
  let p = 0

  for (let i = 0; i < half; i++) {
    // conj(s0) v0 + conj(s1) v1
    const r = state[0] * v.re[i]! + state[1] * v.im[i]! + state[2] * v.re[half + i]! + state[3] * v.im[half + i]!
    const s = state[0] * v.im[i]! - state[1] * v.re[i]! + state[2] * v.im[half + i]! - state[3] * v.re[half + i]!

    p += r * r + s * s
  }

  return p
}

// the golden rule for the atom on rung 0 (E-FRC-0233, derived before the run): with the rung's field
// R = m_(L-1) - m_0, the coupling per beat g x R (g = 4 pi c / M), |<1_k|R|0>|^2 summed over directions
// (4 sin^2(k/2) / L) (hbar/2) f / sin(omega_k), and the ladder's density of states 1 / v_g:
// Gamma = (2 N / pi) g^2 |d|^2 f sin^2(k*/2) / (kappa sin k*), omega(k*) = the atom's gap
export function goldenRule(spec: LadderSpec, gap: number, dipole: number): { rate: number; k: number; velocity: number } {
  const { f, kappa } = splitOf(spec)
  const K = (2 - 2 * Math.cos(gap)) / kappa
  const k = Math.acos((4 - K) / 2)
  const g = (4 * Math.PI * spec.drift) / spec.root

  return {
    rate: ((2 * spec.n) / Math.PI) * g * g * dipole * dipole * f * (Math.sin(k / 2) ** 2 / (kappa * Math.sin(k))),
    k,
    velocity: (kappa * Math.sin(k)) / Math.sin(gap),
  }
}

// the linear single-excitation reading of the atom on a ring of `ring` squares (the harmonic light's one-quantum
// band, the classical symbol's omega_j, and the rung's matrix elements |r_j|^2 = (4 sin^2(k_j/2) / ring)
// (hbar/2) f / sin omega_j), stepped as the rule steps: the coupling g d (sigma+ R- + h.c.) as one exact rotation
// per beat, then the free phases. Returns P_e(t) for t = 0 .. beats (measurement; the harmonic reading, not the rule)
export function singleExcitationDecay(spec: LadderSpec, gap: number, dipole: number, ring: number, beats: number): Float64Array {
  const { f, kappa } = splitOf(spec)
  const hbar = spec.n / (2 * Math.PI)
  const g = (4 * Math.PI * spec.drift) / spec.root
  const omegas = new Float64Array(ring)
  const r = new Float64Array(ring)

  for (let j = 0; j < ring; j++) {
    const k = (2 * Math.PI * j) / ring

    omegas[j] = classicalOmega(kappa, k, Math.max(ring, 2))
    r[j] = Math.sqrt(((4 * Math.sin(k / 2) ** 2) / ring) * (hbar / 2) * (f / Math.sin(omegas[j]!)))
  }

  let rNorm = 0

  for (let j = 0; j < ring; j++) rNorm += r[j]! ** 2

  rNorm = Math.sqrt(rNorm)

  const theta = g * dipole * rNorm
  const out = new Float64Array(beats + 1)
  let er = 1
  let ei = 0
  const br = new Float64Array(ring)
  const bi = new Float64Array(ring)

  for (let t = 0; t <= beats; t++) {
    out[t] = er * er + ei * ei

    if (t === beats) break

    // coupling: in the plane {|e>, |rhat>}: e' = cos(theta) e - i sin(theta) <rhat|b>, b' = b + (cos(theta) - 1)
    // rhat <rhat|b> - i sin(theta) rhat e
    let pr = 0
    let pi = 0

    for (let j = 0; j < ring; j++) {
      pr += (r[j]! / rNorm) * br[j]!
      pi += (r[j]! / rNorm) * bi[j]!
    }

    const c = Math.cos(theta)
    const s = Math.sin(theta)
    const ner = c * er + s * pi
    const nei = c * ei - s * pr

    for (let j = 0; j < ring; j++) {
      const u = r[j]! / rNorm

      br[j] = br[j]! + (c - 1) * u * pr + s * u * ei
      bi[j] = bi[j]! + (c - 1) * u * pi - s * u * er
    }

    er = ner
    ei = nei

    // free phases: e^(-i gap) on the atom, e^(-i omega_j) on each mode
    const ar = Math.cos(-gap) * er - Math.sin(-gap) * ei

    ei = Math.sin(-gap) * er + Math.cos(-gap) * ei
    er = ar

    for (let j = 0; j < ring; j++) {
      const w = -omegas[j]!
      const xr = Math.cos(w) * br[j]! - Math.sin(w) * bi[j]!

      bi[j] = Math.sin(w) * br[j]! + Math.cos(w) * bi[j]!
      br[j] = xr
    }
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// thermal sums

// mean energy of a spectrum (energies above the vacuum) at temperature T
export function thermalEnergy(energies: readonly number[], T: number): number {
  const lowest = Math.min(...energies)
  let z = 0
  let e = 0

  for (const x of energies) {
    const w = Math.exp(-(x - lowest) / T)

    z += w
    e += w * x
  }

  return e / z
}

// Planck's mean energy of one mode above its zero point, and the same ladder cut at R rungs (n = 0 .. R - 1)
export const planck = (omega: number, T: number): number => omega / Math.expm1(omega / T)

export function planckTruncated(omega: number, T: number, rungs: number): number {
  const x = Math.exp(-omega / T)

  return omega * (x / (1 - x) - (rungs * x ** rungs) / (1 - x ** rungs))
}

// ---------------------------------------------------------------------------------------------------------
// the column's phase square and the Bohr-Sommerfeld bound: the leapfrog (B, m) -> (B + s K m, m - f B') keeps
// Q = f B^2 + f s K B m + s K m^2; the largest ellipse Q <= q inside |B|, |m| <= N/2 holds area/N states

export function ellipseStates(n: number, s: number, f: number, K: number): number {
  const kappa = s * f
  const det = kappa * K * (1 - (kappa * K) / 4)

  return ((Math.PI * n) / 4) * (Math.sqrt(det) / Math.max(s * K, f))
}

export { ladderKernel, ladderBeat }
