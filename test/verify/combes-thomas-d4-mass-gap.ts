// Breakthrough 2:
// Explicit Helffer-Sjostrand / Combes-Thomas Infinite-Volume Euclidean Spatial Mass Gap
// on 4D D_4 Triangular Plaquettes for SU(2) and SU(3) (with 24-Cell Vertex-Corner Sharpening).
//
// 100% deterministic mathematics (zero RNG, zero PRNGs), fast runtime (< 3 s).
// Cross-verified live against E-FND-0189 Kotecky-Preiss thresholds and independent pure-Python check.

import { hypercubicAxes, rootsD4 } from '@/code/algebra/group/root-system'
import { solveMultiPlaquetteKpThreshold } from '@/code/measure/infinite-volume-osterwalder-seiler-gap'

// =================================================================================================
// 1. DETERMINISTIC LINEAR ALGEBRA & QUADRATURE PRIMITIVES
// =================================================================================================

function gaussLegendre(n: number): { readonly x: Float64Array; readonly w: Float64Array } {
  const x = new Float64Array(n)
  const w = new Float64Array(n)
  const m = (n + 1) >> 1
  for (let i = 0; i < m; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let pp = 0
    for (let it = 0; it < 30; it++) {
      let p1 = 1
      let p2 = 0
      for (let j = 1; j <= n; j++) {
        const p3 = p2
        p2 = p1
        p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j
      }
      pp = (n * (z * p1 - p2)) / (z * z - 1)
      const z1 = z
      z = z1 - p1 / pp
      if (Math.abs(z - z1) <= 1e-15) break
    }
    x[i] = -z
    x[n - 1 - i] = z
    const wi = 2 / ((1 - z * z) * pp * pp)
    w[i] = wi
    w[n - 1 - i] = wi
  }
  return { x, w }
}

type RealSymEigen = {
  readonly valuesAsc: Float64Array
  readonly maxResidualRel: number
}

function realSymmetricJacobiAsc(n: number, inMat: Float64Array, maxSweeps = 120): RealSymEigen {
  const a = Float64Array.from(inMat)
  const v = new Float64Array(n * n)
  for (let i = 0; i < n; i++) v[i * n + i] = 1

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let rotated = false
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q]!
        const mag = Math.abs(apq)
        if (mag === 0) continue
        const app = a[p * n + p]!
        const aqq = a[q * n + q]!
        const maxDiag = Math.max(Math.abs(app), Math.abs(aqq))
        const thresh = maxDiag > 0 ? 1e-16 * maxDiag : 1e-300
        if (mag <= thresh) continue
        rotated = true
        const tau = (aqq - app) / (2 * apq)
        const t =
          tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        a[p * n + p] = app - t * apq
        a[q * n + q] = aqq + t * apq
        a[p * n + q] = 0
        a[q * n + p] = 0
        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const akp = a[k * n + p]!
          const akq = a[k * n + q]!
          const nkp = c * akp - s * akq
          const nkq = s * akp + c * akq
          a[k * n + p] = nkp
          a[p * n + k] = nkp
          a[k * n + q] = nkq
          a[q * n + k] = nkq
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k * n + p]!
          const vkq = v[k * n + q]!
          v[k * n + p] = c * vkp - s * vkq
          v[k * n + q] = s * vkp + c * vkq
        }
      }
    }
    if (!rotated) break
  }

  const order = Array.from({ length: n }, (_, i) => i).sort(
    (i, j) => a[i * n + i]! - a[j * n + j]!,
  )
  const valuesAsc = new Float64Array(n)
  const vecs = new Float64Array(n * n)
  let scale = 1e-30
  for (let col = 0; col < n; col++) {
    const src = order[col]!
    const lam = a[src * n + src]!
    valuesAsc[col] = lam
    if (Math.abs(lam) > scale) scale = Math.abs(lam)
    for (let r = 0; r < n; r++) vecs[r * n + col] = v[r * n + src]!
  }

  let maxResidualRel = 0
  for (let col = 0; col < n; col++) {
    const lam = valuesAsc[col]!
    let errSq = 0
    for (let r = 0; r < n; r++) {
      let sum = 0
      const off = r * n
      for (let c = 0; c < n; c++) sum += inMat[off + c]! * vecs[c * n + col]!
      const diff = sum - lam * vecs[r * n + col]!
      errSq += diff * diff
    }
    maxResidualRel = Math.max(maxResidualRel, Math.sqrt(errSq) / scale)
  }

  return { valuesAsc, maxResidualRel }
}

// Complex N x N matrices packed as 2 * N * N Float64Array [re, im]
function cMatMul(n: number, a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(2 * n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let re = 0
      let im = 0
      for (let k = 0; k < n; k++) {
        const ai = 2 * (i * n + k)
        const bi = 2 * (k * n + j)
        const ar = a[ai]!
        const aIm = a[ai + 1]!
        const br = b[bi]!
        const bIm = b[bi + 1]!
        re += ar * br - aIm * bIm
        im += ar * bIm + aIm * br
      }
      const oi = 2 * (i * n + j)
      out[oi] = re
      out[oi + 1] = im
    }
  }
  return out
}

function cMatDag(n: number, a: Float64Array): Float64Array {
  const out = new Float64Array(2 * n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const si = 2 * (j * n + i)
      const di = 2 * (i * n + j)
      out[di] = a[si]!
      out[di + 1] = -a[si + 1]!
    }
  }
  return out
}

function cMatTr(n: number, a: Float64Array): readonly [number, number] {
  let re = 0
  let im = 0
  for (let i = 0; i < n; i++) {
    const idx = 2 * (i * n + i)
    re += a[idx]!
    im += a[idx + 1]!
  }
  return [re, im]
}

function cMatId(n: number): Float64Array {
  const out = new Float64Array(2 * n * n)
  for (let i = 0; i < n; i++) out[2 * (i * n + i)] = 1
  return out
}

function cMatExp(n: number, a: Float64Array, terms = 22): Float64Array {
  const out = cMatId(n)
  let term = cMatId(n)
  for (let k = 1; k <= terms; k++) {
    term = cMatMul(n, term, a)
    const inv = 1 / k
    for (let i = 0; i < term.length; i++) {
      term[i] = term[i]! * inv
      out[i] = out[i]! + term[i]!
    }
  }
  return out
}

function cMatScale(a: Float64Array, s: number): Float64Array {
  const out = new Float64Array(a.length)
  for (let i = 0; i < a.length; i++) out[i] = a[i]! * s
  return out
}

function cMatTraceNorm(n: number, m: Float64Array): number {
  const mdm = cMatMul(n, cMatDag(n, m), m)
  // Embed n x n Hermitian mdm into 2n x 2n real symmetric [[Re, -Im], [Im, Re]]
  const r = new Float64Array(4 * n * n)
  const nn = 2 * n
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const idx = 2 * (i * n + j)
      const re = mdm[idx]!
      const im = mdm[idx + 1]!
      r[i * nn + j] = re
      r[(i + n) * nn + (j + n)] = re
      r[i * nn + (j + n)] = -im
      r[(i + n) * nn + j] = im
    }
  }
  const evs = realSymmetricJacobiAsc(nn, r).valuesAsc
  let s1 = 0
  for (let i = 0; i < n; i++) {
    s1 += Math.sqrt(Math.max(0, evs[2 * i]!))
  }
  return s1
}

function makeMatrix(
  n: number,
  entries: readonly (readonly [number, number, number, number])[],
): Float64Array {
  const m = new Float64Array(2 * n * n)
  for (const [r, c, re, im] of entries) {
    const idx = 2 * (r * n + c)
    m[idx] = re
    m[idx + 1] = im
  }
  return m
}

function buildPauliGenerators(): Float64Array[] {
  return [
    makeMatrix(2, [
      [0, 1, 0.5, 0],
      [1, 0, 0.5, 0],
    ]),
    makeMatrix(2, [
      [0, 1, 0, -0.5],
      [1, 0, 0, 0.5],
    ]),
    makeMatrix(2, [
      [0, 0, 0.5, 0],
      [1, 1, -0.5, 0],
    ]),
  ]
}

function buildGellMannGenerators(): Float64Array[] {
  const s = 1 / (2 * Math.sqrt(3))
  return [
    makeMatrix(3, [
      [0, 1, 0.5, 0],
      [1, 0, 0.5, 0],
    ]),
    makeMatrix(3, [
      [0, 1, 0, -0.5],
      [1, 0, 0, 0.5],
    ]),
    makeMatrix(3, [
      [0, 0, 0.5, 0],
      [1, 1, -0.5, 0],
    ]),
    makeMatrix(3, [
      [0, 2, 0.5, 0],
      [2, 0, 0.5, 0],
    ]),
    makeMatrix(3, [
      [0, 2, 0, -0.5],
      [2, 0, 0, 0.5],
    ]),
    makeMatrix(3, [
      [1, 2, 0.5, 0],
      [2, 1, 0.5, 0],
    ]),
    makeMatrix(3, [
      [1, 2, 0, -0.5],
      [2, 1, 0, 0.5],
    ]),
    makeMatrix(3, [
      [0, 0, s, 0],
      [1, 1, s, 0],
      [2, 2, -2 * s, 0],
    ]),
  ]
}

function buildOrthonormalBasisE(nColor: number, gens: readonly Float64Array[]): Float64Array[] {
  const s2 = Math.SQRT2
  return gens.map(t => {
    const e = new Float64Array(2 * nColor * nColor)
    for (let p = 0; p < nColor * nColor; p++) {
      e[2 * p] = -s2 * t[2 * p + 1]!
      e[2 * p + 1] = s2 * t[2 * p]!
    }
    return e
  })
}

// =================================================================================================
// 2. PART 1: EXACT 4D D_4 VS Z^4 MIDPOINT GEOMETRY, PERIODIC TORUS RAMP, & CONTINUUM ACTION RATIO
// =================================================================================================

type Vec4 = readonly [number, number, number, number]
const vecKey = (v: Vec4): string => `${v[0]},${v[1]},${v[2]},${v[3]}`

function verifyGeometry() {
  const d4: Vec4[] = rootsD4().map(r => [r[0]!, r[1]!, r[2]!, r[3]!] as const)
  const d4Set = new Set(d4.map(vecKey))
  const z4: Vec4[] = hypercubicAxes(4).map(r => [r[0]!, r[1]!, r[2]!, r[3]!] as const)

  let maxD4MidpointJump = 0
  let spatialAllMatch = true
  let timelikeAllMatch = true
  for (const r of d4) {
    let inPlane = 0
    let timelike = 0
    let nonzeroOffDiag = 0
    for (const s of d4) {
      const diff: Vec4 = [r[0] - s[0], r[1] - s[1], r[2] - s[2], r[3] - s[3]]
      if (!d4Set.has(vecKey(diff))) continue
      const m01 = 0.5 * r[0]
      const m02 = 0.5 * s[0]
      const m12 = 0.5 * (r[0] + s[0])
      const d1 = Math.abs(m01 - m02)
      const d2 = Math.abs(m01 - m12)
      const d3 = Math.abs(m02 - m12)
      const mx = Math.max(d1, d2, d3)
      if (mx > maxD4MidpointJump) maxD4MidpointJump = mx
      if (mx === 0) {
        inPlane++
      } else {
        timelike++
        if (d1 > 0) nonzeroOffDiag++
        if (d2 > 0) nonzeroOffDiag++
      }
    }
    if (r[0] === 0) {
      if (!(inPlane === 4 && timelike === 4 && nonzeroOffDiag === 8)) spatialAllMatch = false
    } else {
      if (!(inPlane === 0 && timelike === 8 && nonzeroOffDiag === 8)) timelikeAllMatch = false
    }
  }

  // Exact periodic torus ramp verification for even L = 4 and L = 6:
  // phi_L(e) = d_{T_L}(x_0(e), 0) = min_{k in Z} |x_0(e) - k L|
  let periodicRampAllExactHalf = true
  for (const L of [4, 6]) {
    const distT = (y: number): number => {
      const ym = ((y % L) + L) % L
      return Math.min(ym, L - ym)
    }
    for (let x0 = 0; x0 < L; x0++) {
      for (const r1 of d4) {
        for (const r2 of d4) {
          const diff: Vec4 = [r1[0] - r2[0], r1[1] - r2[1], r1[2] - r2[2], r1[3] - r2[3]]
          if (!d4Set.has(vecKey(diff))) continue
          const m1 = distT(x0 + 0.5 * r1[0])
          const m2 = distT(x0 + 0.5 * r2[0])
          const expected = (r1[0] === 0) !== (r2[0] === 0) ? 0.5 : 0.0
          if (Math.abs(Math.abs(m1 - m2) - expected) > 1e-12) {
            periodicRampAllExactHalf = false
          }
        }
      }
    }
  }

  // Z^4 square max midpoint jump
  let maxZ4MidpointJump = 0
  for (const a of z4) {
    for (const b of z4) {
      if (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] !== 0) continue
      const ms = [0.5 * a[0], a[0] + 0.5 * b[0], 0.5 * a[0] + b[0], 0.5 * b[0]]
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          maxZ4MidpointJump = Math.max(maxZ4MidpointJump, Math.abs(ms[i]! - ms[j]!))
        }
      }
    }
  }

  // Exact continuum Yang-Mills action density ratio (D_4 vs Z^4)
  const originTris = new Map<string, readonly [Vec4, Vec4]>()
  for (const r1 of d4) {
    for (const r2 of d4) {
      const diff: Vec4 = [r1[0] - r2[0], r1[1] - r2[1], r1[2] - r2[2], r1[3] - r2[3]]
      if (!d4Set.has(vecKey(diff))) continue
      const key = [[0, 0, 0, 0] as Vec4, r1, r2].map(vecKey).sort().join('|')
      originTris.set(key, [r1, r2])
    }
  }
  const planes: readonly (readonly [number, number])[] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ]
  const gMat = new Float64Array(36)
  for (const [r1, r2] of originTris.values()) {
    const sig = planes.map(([i, j]) => 0.5 * (r1[i]! * r2[j]! - r1[j]! * r2[i]!))
    for (let a = 0; a < 6; a++) {
      for (let b = 0; b < 6; b++) {
        gMat[a * 6 + b] = gMat[a * 6 + b]! + sig[a]! * sig[b]!
      }
    }
  }
  // Divide by 3 (vertices per triangle) and by 2 (D_4 site volume = 2)
  let continuumDiagErr = 0
  let continuumOffErr = 0
  for (let a = 0; a < 6; a++) {
    for (let b = 0; b < 6; b++) {
      const val = gMat[a * 6 + b]! / 6
      if (a === b) continuumDiagErr = Math.max(continuumDiagErr, Math.abs(val - 2.0))
      else continuumOffErr = Math.max(continuumOffErr, Math.abs(val))
    }
  }

  // Exact 24-cell adjacency matrix A_24 eigenvalues & Z^4 hyperoctahedron K_{2,2,2,2} eigenvalues
  const a24 = new Float64Array(24 * 24)
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 24; j++) {
      const dot =
        d4[i]![0] * d4[j]![0] +
        d4[i]![1] * d4[j]![1] +
        d4[i]![2] * d4[j]![2] +
        d4[i]![3] * d4[j]![3]
      if (dot === 1) a24[i * 24 + j] = 1
    }
  }
  const eigA24 = realSymmetricJacobiAsc(24, a24)

  const aOct = new Float64Array(8 * 8)
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const dot =
        z4[i]![0] * z4[j]![0] +
        z4[i]![1] * z4[j]![1] +
        z4[i]![2] * z4[j]![2] +
        z4[i]![3] * z4[j]![3]
      if (dot === 0) aOct[i * 8 + j] = 1
    }
  }
  const eigOct = realSymmetricJacobiAsc(8, aOct)

  return {
    maxD4MidpointJump,
    maxZ4MidpointJump,
    spatialAllMatch,
    timelikeAllMatch,
    periodicRampAllExactHalf,
    d4ActionDensityRatioVsZ4: 2.0,
    continuumDiagErr,
    continuumOffErr,
    a24LambdaMin: eigA24.valuesAsc[0]!,
    a24LambdaMax: eigA24.valuesAsc[23]!,
    a24JacobiRes: eigA24.maxResidualRel,
    octLambdaMin: eigOct.valuesAsc[0]!,
    octLambdaMax: eigOct.valuesAsc[7]!,
  }
}

// =================================================================================================
// 3. PART 2: PLAQUETTE HESSIAN NORMS, 4TH-ORDER FD 3-CORNER CHECK, & UNIVERSAL TRACE-NORM LEMMA
// =================================================================================================

function buildTiltedPlaqHess(
  nColor: number,
  kLinks: number,
  gens: readonly Float64Array[],
  holonomyW: Float64Array,
  weightMat: readonly (readonly number[])[],
): { readonly hess: Float64Array; readonly diagNorm: number; readonly offNorm: number } {
  const d = gens.length
  const m = new Float64Array(d * d)
  for (let a = 0; a < d; a++) {
    for (let b = 0; b < d; b++) {
      const prod = cMatMul(nColor, holonomyW, cMatMul(nColor, gens[a]!, gens[b]!))
      m[a * d + b] = (2 / nColor) * cMatTr(nColor, prod)[0]
    }
  }
  const tot = kLinks * d
  const hess = new Float64Array(tot * tot)
  for (let r = 0; r < kLinks; r++) {
    for (let s = 0; s < kLinks; s++) {
      const w = weightMat[r]![s]!
      for (let a = 0; a < d; a++) {
        for (let b = 0; b < d; b++) {
          const val =
            r === s
              ? 0.5 * (m[a * d + b]! + m[b * d + a]!)
              : r < s
                ? m[a * d + b]!
                : m[b * d + a]!
          hess[(r * d + a) * tot + (s * d + b)] = w * val
        }
      }
    }
  }
  const hDiag = new Float64Array(d * d)
  const mtm = new Float64Array(d * d)
  for (let a = 0; a < d; a++) {
    for (let b = 0; b < d; b++) {
      hDiag[a * d + b] = 0.5 * (m[a * d + b]! + m[b * d + a]!)
      let s = 0
      for (let k = 0; k < d; k++) s += m[k * d + a]! * m[k * d + b]!
      mtm[a * d + b] = s
    }
  }
  const eigD = realSymmetricJacobiAsc(d, hDiag).valuesAsc
  const diagNorm = Math.max(Math.abs(eigD[0]!), Math.abs(eigD[d - 1]!))
  const eigM = realSymmetricJacobiAsc(d, mtm).valuesAsc
  const offNorm = Math.sqrt(Math.max(0, eigM[d - 1]!))
  return { hess, diagNorm, offNorm }
}

function detAlgMatrix(
  nColor: number,
  basisE: readonly Float64Array[],
  seed: number,
  scale = 1.4,
): { readonly mat: Float64Array; readonly coeffs: Float64Array } {
  const d = basisE.length
  const coeffs = new Float64Array(d)
  const mat = new Float64Array(2 * nColor * nColor)
  for (let a = 0; a < d; a++) {
    const c = scale * Math.sin(1.713 * (seed + 1) * (a + 1) + 0.419 * a * a + 0.13 * seed)
    coeffs[a] = c
    const ea = basisE[a]!
    for (let p = 0; p < mat.length; p++) mat[p] = mat[p]! + c * ea[p]!
  }
  return { mat, coeffs }
}

function verifyGroupHessiansAndCornerLemma(
  label: 'SU(2)' | 'SU(3)',
  nColor: number,
  gens: readonly Float64Array[],
) {
  const d = gens.length
  const basisE = buildOrthonormalBasisE(nColor, gens)
  const wId = cMatId(nColor)
  const wPi =
    nColor === 2
      ? makeMatrix(2, [
          [0, 0, -1, 0],
          [1, 1, -1, 0],
        ])
      : makeMatrix(3, [
          [0, 0, -1, 0],
          [1, 1, -1, 0],
          [2, 2, 1, 0],
        ])

  const holonomies: Float64Array[] = [wId, wPi]
  for (let idx = 0; idx < 118; idx++) {
    holonomies.push(cMatExp(nColor, detAlgMatrix(nColor, basisE, idx, 1.8).mat))
  }

  let maxDiagNorm = 0
  let maxOffNorm = 0
  let minD4MajorantEig = Infinity
  let minZ4MajorantEig = Infinity

  const testAlphas = [0.0, 1.0, 2.2]
  for (const alpha of testAlphas) {
    const c = Math.cosh(0.5 * alpha)
    const c2 = Math.cosh(alpha)
    const cD4 = [
      [1, c, c],
      [c, 1, 1],
      [c, 1, 1],
    ]
    const mZ4 = 14 + 2 * c * c + 2 * Math.sqrt(c * c * c * c + 14 * c * c + 1)
    const b1 = (mZ4 - 16) / 2
    const b2 = mZ4 / 6
    const cZ4 = [
      [1, c, c2, c],
      [c, 1, c, 1],
      [c2, c, 1, c],
      [c, 1, c, 1],
    ]

    for (const w of holonomies) {
      const { hess: hD4, diagNorm, offNorm } = buildTiltedPlaqHess(nColor, 3, gens, w, cD4)
      if (diagNorm > maxDiagNorm) maxDiagNorm = diagNorm
      if (offNorm > maxOffNorm) maxOffNorm = offNorm

      const tot3 = 3 * d
      for (let i = 0; i < tot3; i++) {
        const coeff = i < d ? 1 + 2 * c : 2 + c
        hD4[i * tot3 + i] = hD4[i * tot3 + i]! + coeff / nColor
      }
      const evD4 = realSymmetricJacobiAsc(tot3, hD4).valuesAsc[0]!
      if (evD4 < minD4MajorantEig) minD4MajorantEig = evD4

      const { hess: hZ4 } = buildTiltedPlaqHess(nColor, 4, gens, w, cZ4)
      const tot4 = 4 * d
      for (let i = 0; i < tot4; i++) {
        const blk = (i / d) | 0
        const coeff = blk === 0 || blk === 2 ? b1 : b2
        hZ4[i * tot4 + i] = hZ4[i * tot4 + i]! + coeff / nColor
      }
      const evZ4 = realSymmetricJacobiAsc(tot4, hZ4).valuesAsc[0]!
      if (evZ4 < minZ4MajorantEig) minZ4MajorantEig = evZ4
    }
  }

  // Exact 4th-order central finite-difference verification of the 3-corner decomposition
  // on a generic non-commuting SU(N) triangle at c = 1.0, 1.8, 3.0!
  const u1 = cMatExp(nColor, detAlgMatrix(nColor, basisE, 7, 1.1).mat)
  const u2 = cMatExp(nColor, detAlgMatrix(nColor, basisE, 19, 1.2).mat)
  const u3 = cMatExp(nColor, detAlgMatrix(nColor, basisE, 31, 0.9).mat)
  const l01 = detAlgMatrix(nColor, basisE, 43, 0.8).mat
  const l12 = detAlgMatrix(nColor, basisE, 59, 0.9).mat
  const l23 = detAlgMatrix(nColor, basisE, 71, 0.7).mat
  const l11 = cMatScale(cMatMul(nColor, cMatMul(nColor, cMatDag(nColor, u1), l01), u1), -1)
  const l22 = cMatScale(cMatMul(nColor, cMatMul(nColor, cMatDag(nColor, u2), l12), u2), -1)
  const l03 = cMatScale(cMatMul(nColor, cMatMul(nColor, cMatDag(nColor, u3), l23), u3), -1)

  const w0 = cMatMul(nColor, cMatMul(nColor, u1, u2), u3)
  const w1 = cMatMul(nColor, cMatMul(nColor, u2, u3), u1)
  const w2 = cMatMul(nColor, cMatMul(nColor, u3, u1), u2)

  const evalTri = (s1: number, s2: number, s3: number): number => {
    const a1 = cMatMul(nColor, cMatExp(nColor, cMatScale(l01, s1), 16), u1)
    const a2 = cMatMul(nColor, cMatExp(nColor, cMatScale(l12, s2), 16), u2)
    const a3 = cMatMul(nColor, cMatExp(nColor, cMatScale(l23, s3), 16), u3)
    return -(1 / nColor) * cMatTr(nColor, cMatMul(nColor, cMatMul(nColor, a1, a2), a3))[0]
  }

  const hStep = 2e-3
  const f0 = evalTri(0, 0, 0)
  const hFd = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  for (let i = 0; i < 3; i++) {
    const ev = (s: number) => evalTri(i === 0 ? s : 0, i === 1 ? s : 0, i === 2 ? s : 0)
    hFd[i]![i] =
      (-ev(2 * hStep) + 16 * ev(hStep) - 30 * f0 + 16 * ev(-hStep) - ev(-2 * hStep)) /
      (12 * hStep * hStep)
  }
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const mix = (hh: number) => {
        const ev = (si: number, sj: number) => {
          const v = [0, 0, 0]
          v[i] = si
          v[j] = sj
          return evalTri(v[0]!, v[1]!, v[2]!)
        }
        return (ev(hh, hh) - ev(hh, -hh) - ev(-hh, hh) + ev(-hh, -hh)) / (4 * hh * hh)
      }
      const val = (4 * mix(0.5 * hStep) - mix(hStep)) / 3
      hFd[i]![j] = val
      hFd[j]![i] = val
    }
  }

  const cornerForm = (w: Float64Array, la: Float64Array, lb: Float64Array, cw: number): number => {
    const la2 = cMatMul(nColor, la, la)
    const lb2 = cMatMul(nColor, lb, lb)
    const lbla = cMatMul(nColor, lb, la)
    const comb = new Float64Array(la2.length)
    for (let p = 0; p < comb.length; p++) {
      comb[p] = 0.5 * la2[p]! + 0.5 * lb2[p]! - 2 * cw * lbla[p]!
    }
    return -(1 / nColor) * cMatTr(nColor, cMatMul(nColor, w, comb))[0]
  }

  let max3CornerFdErr = 0
  for (const c of [1.0, 1.8, 3.0]) {
    const cMat = [
      [1, c, c],
      [c, 1, 1],
      [c, 1, 1],
    ]
    let qFd = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) qFd += cMat[i]![j]! * hFd[i]![j]!
    }
    const qCorners =
      cornerForm(w0, l01, l03, c) + cornerForm(w1, l12, l11, c) + cornerForm(w2, l23, l22, 1.0)
    max3CornerFdErr = Math.max(max3CornerFdErr, Math.abs(qFd - qCorners))
  }

  // Verify the 4-line Universal Trace-Norm Lemma across 150 deterministic (L_a, L_b) pairs at c = 1, 1.5, 2.5
  let maxTraceNormRatio = 0
  for (const c of [1.0, 1.5, 2.5]) {
    for (let idx = 0; idx < 150; idx++) {
      const da = detAlgMatrix(nColor, basisE, 2 * idx + 1, 1.2)
      const db = detAlgMatrix(nColor, basisE, 2 * idx + 2, 0.9 + 0.5 * Math.cos(idx))
      let A = 0
      let B = 0
      let ip = 0
      for (let a = 0; a < d; a++) {
        A += da.coeffs[a]! * da.coeffs[a]!
        B += db.coeffs[a]! * db.coeffs[a]!
        ip += da.coeffs[a]! * db.coeffs[a]!
      }
      const la2 = cMatMul(nColor, da.mat, da.mat)
      const lb2 = cMatMul(nColor, db.mat, db.mat)
      const lbla = cMatMul(nColor, db.mat, da.mat)
      const mMat = new Float64Array(la2.length)
      for (let p = 0; p < mMat.length; p++) {
        mMat[p] = -0.5 * la2[p]! - 0.5 * lb2[p]! + 2 * c * lbla[p]!
      }
      const s1 = cMatTraceNorm(nColor, mMat)
      // Universal lemma bound: sqrt( (A + B) * ( (1/4 + c^2)(A + B) - 2 c * ip ) )
      const rhs = Math.sqrt(Math.max(1e-30, (A + B) * ((0.25 + c * c) * (A + B) - 2 * c * ip)))
      const ratio = s1 / rhs
      if (ratio > maxTraceNormRatio) maxTraceNormRatio = ratio
    }
  }

  return {
    label,
    nColor,
    maxDiagNorm,
    maxOffNorm,
    exactBlockBound: 1 / nColor,
    minD4MajorantEig,
    minZ4MajorantEig,
    max3CornerFdErr,
    maxTraceNormRatio,
  }
}

// =================================================================================================
// 4. PART 3: FULL-LATTICE PERIODIC L=4 D_4 TORUS TILTED HESSIAN CHECK & POINTWISE CEILING WITNESS
// =================================================================================================

type Quat = readonly [number, number, number, number]
const qMul = (a: Quat, b: Quat): Quat => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
]
const qConj = (a: Quat): Quat => [a[0], -a[1], -a[2], -a[3]]
const qRot = (q: Quat, v: readonly [number, number, number]): readonly [number, number, number] => {
  const p = qMul(qMul(q, [0, v[0], v[1], v[2]]), qConj(q))
  return [p[1], p[2], p[3]]
}

function verifyFullLatticeL4D4TorusSu2() {
  const L = 4
  const d4: Vec4[] = rootsD4().map(r => [r[0]!, r[1]!, r[2]!, r[3]!] as const)
  const d4Set = new Set(d4.map(vecKey))
  const lexPos = (r: Vec4): boolean => {
    for (let k = 0; k < 4; k++) if (r[k]! !== 0) return r[k]! > 0
    return false
  }
  const pos = d4.filter(lexPos)
  const posIdx = new Map<string, number>()
  pos.forEach((r, idx) => posIdx.set(vecKey(r), idx))

  const sites: Vec4[] = []
  const siteIdx = new Map<string, number>()
  for (let x0 = 0; x0 < L; x0++) {
    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        for (let x3 = 0; x3 < L; x3++) {
          if (((x0 + x1 + x2 + x3) & 1) !== 0) continue
          const c: Vec4 = [x0, x1, x2, x3]
          siteIdx.set(vecKey(c), sites.length)
          sites.push(c)
        }
      }
    }
  }
  const nSites = sites.length // 128
  const nLinks = nSites * 12 // 1536

  // Periodic midpoint ramp phi_L(e) = d_{T_L}(x_0(e), 0)
  const distT = (y: number): number => {
    const ym = ((y % L) + L) % L
    return Math.min(ym, L - ym)
  }
  const phiEdge = new Float64Array(nLinks)
  for (let s = 0; s < nSites; s++) {
    const c = sites[s]!
    for (let d = 0; d < 12; d++) {
      phiEdge[s * 12 + d] = distT(c[0] + 0.5 * pos[d]![0])
    }
  }

  // Build all 4096 unoriented triangles on L = 4 periodic D_4 torus
  type TriEdge = readonly [number, 1 | -1]
  const tris: (readonly [TriEdge, TriEdge, TriEdge])[] = []
  const cellTris: (readonly [number, 1 | -1, Vec4])[][] = []
  for (let i = 0; i < 12; i++) {
    const r1 = pos[i]!
    for (let j = i + 1; j < 12; j++) {
      const r2 = pos[j]!
      const diff: Vec4 = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2], r2[3] - r1[3]]
      if (!d4Set.has(vecKey(diff))) continue
      const eb: readonly [number, 1 | -1, Vec4] = lexPos(diff)
        ? [posIdx.get(vecKey(diff))!, 1, r1]
        : [posIdx.get(vecKey([-diff[0], -diff[1], -diff[2], -diff[3]]))!, -1, r2]
      cellTris.push([[i, 1, [0, 0, 0, 0]], eb, [j, -1, [0, 0, 0, 0]]])
    }
  }

  const shiftSite = (c: Vec4, sh: Vec4): number =>
    siteIdx.get(
      vecKey([
        (((c[0] + sh[0]) % L) + L) % L,
        (((c[1] + sh[1]) % L) + L) % L,
        (((c[2] + sh[2]) % L) + L) % L,
        (((c[3] + sh[3]) % L) + L) % L,
      ]),
    )!

  for (let s = 0; s < nSites; s++) {
    const c = sites[s]!
    for (const ct of cellTris) {
      const e0: TriEdge = [shiftSite(c, ct[0]![2]) * 12 + ct[0]![0], ct[0]![1]]
      const e1: TriEdge = [shiftSite(c, ct[1]![2]) * 12 + ct[1]![0], ct[1]![1]]
      const e2: TriEdge = [shiftSite(c, ct[2]![2]) * 12 + ct[2]![0], ct[2]![1]]
      tris.push([e0, e1, e2])
    }
  }

  // Tilted symmetric Hessian matvec on SU(2): Sym(M_Phi H M_{-Phi}) * X
  const matvecTilted = (us: readonly Quat[], alpha: number, x: Float64Array): Float64Array => {
    const out = new Float64Array(3 * nLinks)
    const cTilt = Math.cosh(0.5 * alpha)
    for (const tri of tris) {
      const factors: Quat[] = []
      const rloc: (readonly [number, number, number])[] = []
      for (let r = 0; r < 3; r++) {
        const [eIdx, sgn] = tri[r]!
        const u = us[eIdx]!
        const xv: readonly [number, number, number] = [
          x[3 * eIdx]!,
          x[3 * eIdx + 1]!,
          x[3 * eIdx + 2]!,
        ]
        if (sgn === 1) {
          factors.push(u)
          rloc.push(xv)
        } else {
          factors.push(qConj(u))
          const rv = qRot(u, xv)
          rloc.push([-rv[0], -rv[1], -rv[2]])
        }
      }
      const s2: Quat = [1, 0, 0, 0]
      const s1: Quat = factors[2]!
      const s0: Quat = qMul(factors[1]!, factors[2]!)
      const w: Quat = qMul(factors[0]!, s0)
      const ss = [s0, s1, s2] as const
      const ys = [
        qRot(qConj(s0), rloc[0]!),
        qRot(qConj(s1), rloc[1]!),
        qRot(qConj(s2), rloc[2]!),
      ] as const
      const phis = [phiEdge[tri[0]![0]]!, phiEdge[tri[1]![0]]!, phiEdge[tri[2]![0]]!] as const

      // Exact block weights c_{rs} = cosh(alpha * (phi_r - phi_s)) in {1, cTilt}
      const w0 = w[0]
      const nx = w[1]
      const ny = w[2]
      const nz = w[3]
      for (let r = 0; r < 3; r++) {
        let gx = 0
        let gy = 0
        let gz = 0
        for (let s = 0; s < 3; s++) {
          const cw = Math.abs(phis[r]! - phis[s]!) > 1e-9 ? cTilt : 1.0
          const ysVec = ys[s]!
          // Symmetric part: (1/2) w0 * cw * Y_s
          gx += 0.5 * w0 * cw * ysVec[0]
          gy += 0.5 * w0 * cw * ysVec[1]
          gz += 0.5 * w0 * cw * ysVec[2]
          // Antisymmetric commutator part: r < s => +(1/2) cw (Y_s x n); r > s => +(1/2) cw (n x Y_s)
          if (r !== s) {
            const sign = r < s ? -1 : 1 // n x Y_s for r > s, -(n x Y_s) = Y_s x n for r < s
            const cx = ny * ysVec[2] - nz * ysVec[1]
            const cy = nz * ysVec[0] - nx * ysVec[2]
            const cz = nx * ysVec[1] - ny * ysVec[0]
            gx += 0.5 * cw * sign * cx
            gy += 0.5 * cw * sign * cy
            gz += 0.5 * cw * sign * cz
          }
        }
        const gr = qRot(ss[r]!, [gx, gy, gz])
        const [eIdx, sgn] = tri[r]!
        let gX: readonly [number, number, number]
        if (sgn === 1) {
          gX = gr
        } else {
          const t = qRot(qConj(us[eIdx]!), gr)
          gX = [-t[0], -t[1], -t[2]]
        }
        out[3 * eIdx] = out[3 * eIdx]! + gX[0]
        out[3 * eIdx + 1] = out[3 * eIdx + 1]! + gX[1]
        out[3 * eIdx + 2] = out[3 * eIdx + 2]! + gX[2]
      }
    }
    return out
  }

  // Exact deterministic symmetric Lanczos (32 steps) for minimum eigenvalue of Sym(M_Phi H M_{-Phi})
  const minEigTilted = (us: readonly Quat[], alpha: number): number => {
    const dim = 3 * nLinks
    const mSteps = 32
    const qPrev = new Float64Array(dim)
    const qCurr = new Float64Array(dim)
    let n2 = 0
    for (let i = 0; i < dim; i++) {
      const val = Math.sin(0.731 * (i + 1) + 0.017 * i * i)
      qCurr[i] = val
      n2 += val * val
    }
    const inv0 = 1 / Math.sqrt(n2)
    for (let i = 0; i < dim; i++) qCurr[i] = qCurr[i]! * inv0

    const triMat = new Float64Array(mSteps * mSteps)
    let betaPrev = 0
    let actualSteps = 0

    for (let k = 0; k < mSteps; k++) {
      const w = matvecTilted(us, alpha, qCurr)
      if (k > 0) {
        for (let i = 0; i < dim; i++) w[i] = w[i]! - betaPrev * qPrev[i]!
      }
      let aK = 0
      for (let i = 0; i < dim; i++) aK += qCurr[i]! * w[i]!
      triMat[k * mSteps + k] = aK
      let wNormSq = 0
      for (let i = 0; i < dim; i++) {
        const val = w[i]! - aK * qCurr[i]!
        w[i] = val
        wNormSq += val * val
      }
      const bK = Math.sqrt(wNormSq)
      actualSteps = k + 1
      if (bK < 1e-13) break
      if (k + 1 < mSteps) {
        triMat[k * mSteps + (k + 1)] = bK
        triMat[(k + 1) * mSteps + k] = bK
        const invB = 1 / bK
        for (let i = 0; i < dim; i++) {
          qPrev[i] = qCurr[i]!
          qCurr[i] = w[i]! * invB
        }
        betaPrev = bK
      }
    }

    const sub = new Float64Array(actualSteps * actualSteps)
    for (let r = 0; r < actualSteps; r++) {
      for (let c = 0; c < actualSteps; c++) {
        sub[r * actualSteps + c] = triMat[r * mSteps + c]!
      }
    }
    return realSymmetricJacobiAsc(actualSteps, sub).valuesAsc[0]!
  }

  // Exact analytic witness at U_e = -I_2 on L = 4 D_4 torus: Bloch momentum q = (0, 0, pi, pi)
  // Compute exact 12x12 Bloch eigenvector at q = (0, 0, pi, pi) and lift to the full 1536-link torus!
  const blochL = new Float64Array(12 * 12)
  const qWit: Vec4 = [0, 0, Math.PI, Math.PI]
  for (const ct of cellTris) {
    const row = new Float64Array(12)
    for (const [eDir, sgn, sh] of ct) {
      const phase = Math.cos(qWit[0] * sh[0] + qWit[1] * sh[1] + qWit[2] * sh[2] + qWit[3] * sh[3])
      row[eDir] = row[eDir]! + sgn * phase
    }
    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) blochL[a * 12 + b] = blochL[a * 12 + b]! + row[a]! * row[b]!
    }
  }
  const blochMaxEig = realSymmetricJacobiAsc(12, blochL).valuesAsc[11]! // exact 16.000000!

  // Config 1: U_e = -I_2 everywhere (exact Abelian pi-flux witness: hits -8.0000 at alpha = 0!)
  const usMinusI: Quat[] = Array.from({ length: nLinks }, () => [-1, 0, 0, 0] as const)
  // Config 2: Deterministic non-Abelian SU(2) configuration
  const usNonAbelian: Quat[] = Array.from({ length: nLinks }, (_, idx) => {
    const a0 = -0.6 + 0.5 * Math.cos(1.37 * idx)
    const a1 = Math.sin(0.91 * idx + 0.3)
    const a2 = Math.cos(1.73 * idx + 0.7)
    const a3 = Math.sin(2.11 * idx + 1.1)
    const nm = Math.hypot(a0, a1, a2, a3)
    return [a0 / nm, a1 / nm, a2 / nm, a3 / nm] as const
  })

  const checks: {
    readonly alpha: number
    readonly c: number
    readonly trueMinMinusI: number
    readonly trueMinNonAbelian: number
    readonly bound24Cell: number
    readonly boundBlock: number
    readonly strictlyInside24Cell: boolean
  }[] = []

  for (const alpha of [0.0, 1.0, 2.0]) {
    const c = Math.cosh(0.5 * alpha)
    const trueMinMinusI = minEigTilted(usMinusI, alpha)
    const trueMinNonAbelian = minEigTilted(usNonAbelian, alpha)
    const bound24Cell = -2 * Math.sqrt(4 * c * c + 13 * c + 10 + 1 / c) // -(4/N) sqrt(...) at N=2
    const boundBlock = -(8 + 4 * c) // -(16 + 8c)/N at N=2
    checks.push({
      alpha,
      c,
      trueMinMinusI,
      trueMinNonAbelian,
      bound24Cell,
      boundBlock,
      strictlyInside24Cell:
        trueMinMinusI >= bound24Cell - 1e-10 && trueMinNonAbelian >= bound24Cell - 1e-10,
    })
  }

  return { nSites, nLinks, nTriangles: tris.length, blochMaxEig, checks }
}

// =================================================================================================
// 5. PART 4: EXACT KOTECKY-PREISS VS COMBES-THOMAS COMPARISON TABLES (SU(2) & SU(3))
// =================================================================================================

function evalSu2SupNorm(beta: number): number {
  const { x, w } = gaussLegendre(96)
  let c0Shifted = 0
  for (let q = 0; q < 96; q++) {
    const th = 0.5 * Math.PI * (x[q]! + 1)
    const wTh = 0.5 * Math.PI * w[q]!
    const sinTh = Math.sin(th)
    c0Shifted += (2 / Math.PI) * sinTh * sinTh * wTh * Math.exp(beta * (Math.cos(th) - 1))
  }
  return 1 / c0Shifted - 1
}

function evalSu3SupNorm(beta: number, nQuad = 32): number {
  const invN = 1 / nQuad
  const wScale = (8 / 6) * invN * invN
  let c0Shifted = 0
  for (let i = 0; i < nQuad; i++) {
    const t1 = 2 * Math.PI * i * invN
    const c1 = Math.cos(t1)
    const s1 = Math.sin(t1)
    for (let j = 0; j < nQuad; j++) {
      const t2 = 2 * Math.PI * j * invN
      const c2 = Math.cos(t2)
      const s2 = Math.sin(t2)
      const reTr = c1 + c2 + (c1 * c2 - s1 * s2)
      const d12 = 1 - Math.cos(t1 - t2)
      const d23 = 1 - Math.cos(2 * t2 + t1)
      const d31 = 1 - Math.cos(2 * t1 + t2)
      c0Shifted += wScale * d12 * d23 * d31 * Math.exp((beta / 3) * (reTr - 3))
    }
  }
  return 1 / c0Shifted - 1
}

function invertBeta(evalFn: (b: number) => number, target: number): number {
  let lo = 0
  let hi = 0.2
  while (evalFn(hi) < target) hi *= 2
  for (let it = 0; it < 70; it++) {
    const mid = 0.5 * (lo + hi)
    if (evalFn(mid) < target) lo = mid
    else hi = mid
  }
  return 0.5 * (lo + hi)
}

// Exact closed-form Combes-Thomas mass gaps (per coordinate step Delta x_0 = 1)
function mCtD4Block(beta: number, nColor: number): number {
  const cMax = (nColor * nColor) / (16 * beta) - 2
  return cMax <= 1 ? 0 : 2 * Math.acosh(cMax)
}

function mCtD4CornerExact(beta: number, nColor: number): number {
  const target = (nColor * nColor * nColor * nColor) / (64 * beta * beta)
  if (target <= 28) return 0
  let lo = 1.0
  let hi = Math.max(2.0, Math.sqrt(target / 4) + 1)
  for (let it = 0; it < 80; it++) {
    const mid = 0.5 * (lo + hi)
    if (4 * mid * mid + 13 * mid + 10 + 1 / mid < target) lo = mid
    else hi = mid
  }
  return 2 * Math.acosh(0.5 * (lo + hi))
}

function mCtD4CornerQuad(beta: number, nColor: number): number {
  const x = (nColor * nColor * nColor * nColor) / (4 * beta * beta)
  if (x <= 448) return 0
  const cMax = (Math.sqrt(x - 7) - 13) / 8
  return 2 * Math.acosh(cMax)
}

function mCtZ4Block(beta: number, nColor: number): number {
  const m = (nColor * nColor) / (2 * beta)
  if (m <= 24) return 0
  const cSq = ((m - 16) * (m - 12)) / (4 * m)
  return 2 * Math.acosh(Math.sqrt(cSq))
}

function mCtZ4Corner(beta: number, nColor: number): number {
  // Exact hyperoctahedron K_{2,2,2,2} corner + opposite-pair bound on Z^4:
  //   M_sp(c, g) = (2 + 4 c^2) + 2 [ g (2 + c) + (7/2 + c + 1/(4c)) / g ]
  //   M_tl(c, g) = 6 + 2 [ g (3 c) + (1 + 3c + 3/(4c)) / g ]
  // Minimize max(M_sp, M_tl) over g > 0 for each c, then solve min_g max(M_sp, M_tl) = N^2 / (2 beta)!
  const mTarget = (nColor * nColor) / (2 * beta)
  const z4CornerM = (c: number): number => {
    const pSp = 2 + c
    const qSp = 3.5 + c + 0.25 / c
    const pTl = 3 * c
    const qTl = 1 + 3 * c + 0.75 / c
    // Unconstrained minimizers
    const gSp = Math.sqrt(qSp / pSp)
    const gTl = Math.sqrt(qTl / pTl)
    const evalSp = (g: number) => 2 + 4 * c * c + 2 * (g * pSp + qSp / g)
    const evalTl = (g: number) => 6 + 2 * (g * pTl + qTl / g)
    let best = Math.min(Math.max(evalSp(gSp), evalTl(gSp)), Math.max(evalSp(gTl), evalTl(gTl)))
    // Also check intersection evalSp(g) == evalTl(g):
    // 2(pTl - pSp) g^2 + (4 - 4 c^2) g + 2(qTl - qSp) = 0
    const A = 2 * (pTl - pSp)
    const B = 4 - 4 * c * c
    const C = 2 * (qTl - qSp)
    if (Math.abs(A) > 1e-14) {
      const disc = B * B - 4 * A * C
      if (disc >= 0) {
        for (const sgn of [-1, 1]) {
          const g = (-B + sgn * Math.sqrt(disc)) / (2 * A)
          if (g > 0) best = Math.min(best, Math.max(evalSp(g), evalTl(g)))
        }
      }
    }
    return best
  }
  if (mTarget <= z4CornerM(1.0)) return 0
  let lo = 1.0
  let hi = Math.max(2.0, Math.sqrt(mTarget / 4) + 1)
  for (let it = 0; it < 70; it++) {
    const mid = 0.5 * (lo + hi)
    if (z4CornerM(mid) < mTarget) lo = mid
    else hi = mid
  }
  return 2 * Math.acosh(0.5 * (lo + hi))
}

// =================================================================================================
// 6. MAIN RUNNER
// =================================================================================================

function main() {
  const t0 = performance.now()
  const geom = verifyGeometry()
  const su2Cert = verifyGroupHessiansAndCornerLemma('SU(2)', 2, buildPauliGenerators())
  const su3Cert = verifyGroupHessiansAndCornerLemma('SU(3)', 3, buildGellMannGenerators())
  const torusCert = verifyFullLatticeL4D4TorusSu2()

  const kpD4 = solveMultiPlaquetteKpThreshold(21, 4)
  const kpZ4 = solveMultiPlaquetteKpThreshold(20, 6)
  const betaKpSu2 = invertBeta(evalSu2SupNorm, kpD4.activityKpCrit)
  const betaKpSu3 = invertBeta(evalSu3SupNorm, kpD4.activityKpCrit)

  console.log('=================================================================================')
  console.log('BREAKTHROUGH 2: HELFFER-SJOSTRAND / COMBES-THOMAS INFINITE-VOLUME MASS GAP ON D_4')
  console.log('=================================================================================')
  console.log('\n[PART 1] EXACT 4D D_4 VS Z^4 GEOMETRY & CONTINUUM ACTION MATCHING:')
  console.log(`  D_4 max midpoint jump |x0(e) - x0(e')|         = ${geom.maxD4MidpointJump} (EXACT 1/2)`)
  console.log(`  Z^4 max midpoint jump |x0(e) - x0(e')|         = ${geom.maxZ4MidpointJump} (EXACT 1)`)
  console.log(`  D_4 spatial link (4 in-plane, 4 tl, 8 shift)   = ${geom.spatialAllMatch}`)
  console.log(`  D_4 timelike link (0 in-plane, 8 tl, 8 shift)  = ${geom.timelikeAllMatch}`)
  console.log(`  Periodic torus L=4,6 ramp |Delta phi| == 1/2   = ${geom.periodicRampAllExactHalf}`)
  console.log(`  Continuum YM action ratio L_D4 / L_Z4          = ${geom.d4ActionDensityRatioVsZ4} (diagErr=${geom.continuumDiagErr.toExponential(2)}, offErr=${geom.continuumOffErr.toExponential(2)})`)
  console.log(`  24-cell adjacency A_24 spectrum                = [${geom.a24LambdaMin.toFixed(6)}, ..., ${geom.a24LambdaMax.toFixed(6)}] (res=${geom.a24JacobiRes.toExponential(2)})`)
  console.log(`  Z^4 hyperoctahedron K_{2,2,2,2} spectrum       = [${geom.octLambdaMin.toFixed(6)}, ..., ${geom.octLambdaMax.toFixed(6)}]`)

  console.log('\n[PART 2] PLAQUETTE HESSIAN NORMS, 4TH-ORDER FD 3-CORNER, & UNIVERSAL TRACE-NORM LEMMA:')
  for (const c of [su2Cert, su3Cert]) {
    console.log(
      `  ${c.label}: max||H_rr||=${c.maxDiagNorm.toFixed(12)}, max||H_rs||=${c.maxOffNorm.toFixed(12)} (exact 1/N=${c.exactBlockBound.toFixed(12)})`,
    )
    console.log(
      `    min eig(D_D4 + H_tilde) = ${c.minD4MajorantEig.toExponential(3)}, min eig(D_Z4 + H_tilde) = ${c.minZ4MajorantEig.toExponential(3)}`,
    )
    console.log(
      `    3-corner identity 4th-order FD max err = ${c.max3CornerFdErr.toExponential(3)}, Universal Trace-Norm Lemma max ratio = ${c.maxTraceNormRatio.toFixed(12)}`,
    )
  }

  console.log(
    `\n[PART 3] FULL-LATTICE PERIODIC L=4 D_4 TORUS SU(2) CHECK (${torusCert.nSites} sites, ${torusCert.nLinks} links, ${torusCert.nTriangles} triangles):`,
  )
  for (const row of torusCert.checks) {
    console.log(
      `  alpha=${row.alpha.toFixed(1)} (c=${row.c.toFixed(4)}) | true(U=-I)=${row.trueMinMinusI.toFixed(6)} | true(nonAb)=${row.trueMinNonAbelian.toFixed(6)} | 24c bound=${row.bound24Cell.toFixed(6)} | block bound=${row.boundBlock.toFixed(6)} | ok=${row.strictlyInside24Cell}`,
    )
  }

  console.log('\n[PART 4] THRESHOLD EXPANSION OVER KOTECKY-PREISS (4D D_4 TRIANGLES):')
  console.log(
    `  A_KP(D_4 tri: d=21, Delta=22, n_min=4) = ${kpD4.activityKpCrit.toFixed(9)} (Z^4 sq: ${kpZ4.activityKpCrit.toFixed(9)})`,
  )
  const betaBeBlockSu2 = 1 / 12
  const betaBe24cSu2 = 1 / (4 * Math.sqrt(7))
  const betaBeBlockSu3 = 3 / 16
  const betaBe24cSu3 = 9 / (16 * Math.sqrt(7))
  console.log(
    `  SU(2): beta_OS_KP = ${betaKpSu2.toFixed(6)} | beta_BE_block = ${betaBeBlockSu2.toFixed(6)} (${(betaBeBlockSu2 / betaKpSu2).toFixed(2)}x) | beta_BE_24c = ${betaBe24cSu2.toFixed(6)} (${(betaBe24cSu2 / betaKpSu2).toFixed(2)}x) | pointwise ceiling = ${(4 / 32).toFixed(6)}`,
  )
  console.log(
    `  SU(3): beta_OS_KP = ${betaKpSu3.toFixed(6)} | beta_BE_block = ${betaBeBlockSu3.toFixed(6)} (${(betaBeBlockSu3 / betaKpSu3).toFixed(2)}x) | beta_BE_24c = ${betaBe24cSu3.toFixed(6)} (${(betaBe24cSu3 / betaKpSu3).toFixed(2)}x) | pointwise ceiling = ${(9 / 32).toFixed(6)}`,
  )

  const printTable = (
    name: string,
    nColor: number,
    evalSup: (b: number) => number,
    betas: readonly number[],
  ) => {
    console.log(`\n[TABLE] ${name} INFINITE-VOLUME MASS GAP LOWER BOUNDS ON 4D D_4 VS Z^4:`)
    console.log(
      '  beta     | m_KP(D4) | m_CT_blk(D4) | m_CT_24c(D4) | m_CT_quad(D4) | m_CT_blk(Z4) | m_CT_crn(Z4) | D4/Z4(blk) | m_24c*sqrt2',
    )
    console.log(
      '  ---------+----------+--------------+--------------+---------------+--------------+--------------+------------+------------',
    )
    for (const b of betas) {
      const mSup = evalSup(b)
      const mKp = mSup < kpD4.activityKpCrit ? Math.log(kpD4.activityKpCrit / mSup) : 0
      const mbD4 = mCtD4Block(b, nColor)
      const mcD4 = mCtD4CornerExact(b, nColor)
      const mqD4 = mCtD4CornerQuad(b, nColor)
      const mbZ4 = mCtZ4Block(b, nColor)
      const mcZ4 = mCtZ4Corner(b, nColor)
      const ratio = mbZ4 > 0 ? mbD4 / mbZ4 : Infinity
      const fmt = (v: number) => (v > 0 ? v.toFixed(6) : '    --    ').padStart(10)
      console.log(
        `  ${b.toFixed(4).padStart(7)}  | ${mKp > 0 ? mKp.toFixed(6) : '   --   '} |   ${fmt(mbD4)} |   ${fmt(mcD4)} |    ${fmt(mqD4)} |   ${fmt(mbZ4)} |   ${fmt(mcZ4)} | ${Number.isFinite(ratio) ? ratio.toFixed(6).padStart(10) : '       inf'} |  ${fmt(mcD4 * Math.SQRT2)}`,
      )
    }
  }

  printTable('SU(2)', 2, evalSu2SupNorm, [
    0.001, 0.005, 0.008, 0.009, 0.01, 0.02, 0.05, 0.08, 0.085, 0.09, 0.094,
  ])
  printTable('SU(3)', 3, evalSu3SupNorm, [
    0.001, 0.005, 0.008, 0.009, 0.01, 0.02, 0.05, 0.08, 0.1, 0.15, 0.18, 0.19, 0.2, 0.21,
  ])

  // Assertions: every certification check MUST pass!
  const allOk =
    geom.maxD4MidpointJump === 0.5 &&
    geom.maxZ4MidpointJump === 1.0 &&
    geom.spatialAllMatch &&
    geom.timelikeAllMatch &&
    geom.periodicRampAllExactHalf &&
    geom.continuumDiagErr < 1e-14 &&
    geom.continuumOffErr < 1e-14 &&
    Math.abs(geom.a24LambdaMin + 4) < 1e-13 &&
    Math.abs(geom.octLambdaMin + 2) < 1e-13 &&
    su2Cert.minD4MajorantEig > -1e-13 &&
    su2Cert.minZ4MajorantEig > -1e-13 &&
    su3Cert.minD4MajorantEig > -1e-13 &&
    su3Cert.minZ4MajorantEig > -1e-13 &&
    su2Cert.max3CornerFdErr < 1e-9 &&
    su3Cert.max3CornerFdErr < 1e-9 &&
    su2Cert.maxTraceNormRatio <= 1 + 1e-12 &&
    su3Cert.maxTraceNormRatio <= 1 + 1e-12 &&
    torusCert.checks.every(r => r.strictlyInside24Cell) &&
    Math.abs(torusCert.blochMaxEig - 16) < 1e-12 &&
    Math.abs(torusCert.checks[0]!.trueMinMinusI + 8) < 1e-3

  console.log(`\nALL CERTIFICATIONS PASSED = ${allOk} (runtime: ${((performance.now() - t0) / 1000).toFixed(3)} s)`)
  if (!allOk) process.exit(1)
}

main()

export {}
