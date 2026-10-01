// THE ENTANGLEMENT OF A FREE-FERMION SEA OF THE REGISTER RULE, EXACTLY FROM ITS CORRELATION MATRIX (E-HLG-0037). The
// register rule's one-body cycle U (code/measure/swap-cone cycleMatrix: two beats, each a dock piece then the stream,
// on 192 modes a dock, 24 slots by 8 registers) is translation invariant on the D4 torus, so a sea that fills whole
// bands is a Slater determinant whose correlation matrix is C(x, y) = (1 / N) sum over q of e^(i q . (x - y)) P(q),
// P(q) the projector on the filled Bloch states. A Gaussian state's region entropy is Peschel's: S(A) = sum over the
// eigenvalues nu of C_A of h(nu) = -nu ln nu - (1 - nu) ln(1 - nu).
//
//   registerPieces      the rule's two one-body pieces at the light unit (E-SPN-0175's Ps)
//   positiveBand        at every torus momentum, the 8 Bloch states of the moving block W(q) = range(U(q) - 1) with
//                       eigenphase in (-pi, 0) (positive energy, E = -phase / 2): their vectors, and the checks that
//                       make them a band (8 at every q, the separation of sin(phase) from 0, and U carrying their span
//                       into itself). The flats (U = 1, 176 a momentum) and the other 8 moving states lie below
//   regionEntropies     S of regions that are translation invariant along a sublattice T of D4 (slabs, bars, columns):
//                       the region is the orbits under T of a few representative docks s_a, and C_A splits by the
//                       transverse momentum class of q (q . tau mod 2 pi for tau in T). In one class C_A's nontrivial
//                       block is W W^dagger with W[(a, m), (q, i)] = e^(i q . s_a) phi_qi[m] / sqrt(n), n the momenta in
//                       the class, so its nonzero spectrum is that of the Gram matrix W^dagger W, 8 n by 8 n, whatever
//                       the region's depth
//   regionEntropyBlock  the same S from the block itself, 192 |reps| square (used where 8 n is the larger side, and as a
//                       cross-check of the Gram form)
//   chainEntropies      the controls: a ring of free fermions with nearest-neighbor hopping, filled below zero, S of
//                       blocks of l sites
//
// For a sea C = 1 - P_band (everything filled but the band) and for C = P_band the nonzero spectra agree up to nu ->
// 1 - nu, and h(nu) = h(1 - nu), so both have the same entropies.
//
// FLOATS: measurement on exact pieces (the projectors are integer matrices over 24 and 48 and the units ring units).
// DETERMINISM: no random numbers.

import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { cycleMatrix } from '@/code/measure/swap-cone'
import { type CMatrix } from '@/code/measure/dock-mixer'
import {
  partnerProjector48,
  registerPiece,
  REGISTER_ROOTS,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { torus } from '@/code/measure/register-sea'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { hermitianEigenvaluesTridiagonal } from '@/code/algebra/linear/eig-hermitian-tridiagonal'

export const MODES = 192
export const BAND = 8

// E-SPN-0175's light unit
const LIGHT: readonly [number, number] = [-1, 4]

export function registerPieces(): CMatrix[] {
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]

  return [
    registerPiece(scaled(singletProjector24(), 24), u),
    registerPiece(scaled(partnerProjector48(), 48), [u[0], -u[1]]),
  ]
}

export const binaryEntropy = (nu: number): number => {
  const x = Math.min(1, Math.max(0, nu))

  return (x > 1e-300 ? -x * Math.log(x) : 0) + (x < 1 ? -(1 - x) * Math.log(1 - x) : 0)
}

export type Band = {
  readonly L: number
  // integer momentum k (q = 2 pi k / L) per Bloch class, 4 each
  readonly k: Int32Array
  readonly count: number
  // the band vectors, [q][i][m], row-major
  readonly re: Float64Array
  readonly im: Float64Array
  // checks: the fewest and most band states at a momentum, the moving rank range, the least |sin(phase)| over the
  // 16 moving states, the worst |U phi - P U phi| over the band
  readonly fewest: number
  readonly most: number
  readonly movingMin: number
  readonly movingMax: number
  readonly margin: number
  readonly leak: number
  // the least distance of a moving phase from 0 and from pi
  readonly gapZero: number
  readonly gapPi: number
}

export function positiveBand(L: number, Ps: readonly CMatrix[] = registerPieces()): Band {
  const T = torus(L)
  const Q = T.momenta.length
  const k = new Int32Array(Q * 4)
  const re = new Float64Array(Q * BAND * MODES)
  const im = new Float64Array(Q * BAND * MODES)

  let fewest = Infinity
  let most = 0
  let movingMin = Infinity
  let movingMax = 0
  let margin = Infinity
  let leak = 0
  let gapZero = Infinity
  let gapPi = Infinity

  T.momenta.forEach((q, j) => {
    q.forEach((x, c) => (k[j * 4 + c] = Math.round((x * L) / (2 * Math.PI))))

    const U = cycleMatrix(Ps, REGISTER_ROOTS, q)
    const cols: { re: Float64Array; im: Float64Array }[] = []

    // range(U - 1) by two passes of Gram-Schmidt
    for (let c = 0; c < MODES; c++) {
      const vr = new Float64Array(MODES)
      const vi = new Float64Array(MODES)

      for (let i = 0; i < MODES; i++) {
        vr[i] = U.re[i * MODES + c]! - (i === c ? 1 : 0)
        vi[i] = U.im[i * MODES + c]!
      }

      for (let pass = 0; pass < 2; pass++) {
        for (const b of cols) {
          let dr = 0
          let di = 0

          for (let i = 0; i < MODES; i++) {
            dr += b.re[i]! * vr[i]! + b.im[i]! * vi[i]!
            di += b.re[i]! * vi[i]! - b.im[i]! * vr[i]!
          }

          for (let i = 0; i < MODES; i++) {
            vr[i]! -= dr * b.re[i]! - di * b.im[i]!
            vi[i]! -= dr * b.im[i]! + di * b.re[i]!
          }
        }
      }

      let n = 0

      for (let i = 0; i < MODES; i++) {
        n += vr[i]! ** 2 + vi[i]! ** 2
      }

      n = Math.sqrt(n)

      if (n > 1e-6) {
        cols.push({ re: vr.map(x => x / n), im: vi.map(x => x / n) })
      }
    }

    const r = cols.length

    movingMin = Math.min(movingMin, r)
    movingMax = Math.max(movingMax, r)

    // U B (192 x r), then U_W = B^dagger U B (r x r)
    const UBr = new Float64Array(MODES * r)
    const UBi = new Float64Array(MODES * r)

    for (let c = 0; c < r; c++) {
      const b = cols[c]!

      for (let i = 0; i < MODES; i++) {
        let sr = 0
        let si = 0

        for (let m = 0; m < MODES; m++) {
          const ar = U.re[i * MODES + m]!
          const ai = U.im[i * MODES + m]!

          sr += ar * b.re[m]! - ai * b.im[m]!
          si += ar * b.im[m]! + ai * b.re[m]!
        }

        UBr[i * r + c] = sr
        UBi[i * r + c] = si
      }
    }

    const Wr = new Float64Array(r * r)
    const Wi = new Float64Array(r * r)

    for (let a = 0; a < r; a++) {
      for (let c = 0; c < r; c++) {
        let sr = 0
        let si = 0

        for (let i = 0; i < MODES; i++) {
          const br = cols[a]!.re[i]!
          const bi = -cols[a]!.im[i]!

          sr += br * UBr[i * r + c]! - bi * UBi[i * r + c]!
          si += br * UBi[i * r + c]! + bi * UBr[i * r + c]!
        }

        Wr[a * r + c] = sr
        Wi[a * r + c] = si
      }
    }

    // K = (U_W - U_W^dagger) / 2i: re (B + B^T) / 2, im (A^T - A) / 2
    const Kr = new Float64Array(r * r)
    const Ki = new Float64Array(r * r)

    for (let a = 0; a < r; a++) {
      for (let c = 0; c < r; c++) {
        Kr[a * r + c] = (Wi[a * r + c]! + Wi[c * r + a]!) / 2
        Ki[a * r + c] = (Wr[c * r + a]! - Wr[a * r + c]!) / 2
      }
    }

    const e = hermitianEigenRows(r, Kr, Ki)
    const chosen: number[] = []

    for (let i = 0; i < r; i++) {
      margin = Math.min(margin, Math.abs(e.values[i]!))

      if (e.values[i]! < 0) {
        chosen.push(i)
      }
    }

    // the phases of the moving states, from the restricted cycle's Rayleigh quotients on K's eigenvectors
    for (let i = 0; i < r; i++) {
      let pr = 0
      let pi = 0

      for (let a = 0; a < r; a++) {
        for (let c = 0; c < r; c++) {
          const xr = e.vectorsRe[i * r + a]!
          const xi = -e.vectorsIm[i * r + a]!
          const yr = Wr[a * r + c]! * e.vectorsRe[i * r + c]! - Wi[a * r + c]! * e.vectorsIm[i * r + c]!
          const yi = Wr[a * r + c]! * e.vectorsIm[i * r + c]! + Wi[a * r + c]! * e.vectorsRe[i * r + c]!

          pr += xr * yr - xi * yi
          pi += xr * yi + xi * yr
        }
      }

      const ph = Math.atan2(pi, pr)

      gapZero = Math.min(gapZero, Math.abs(ph))
      gapPi = Math.min(gapPi, Math.PI - Math.abs(ph))
    }

    fewest = Math.min(fewest, chosen.length)
    most = Math.max(most, chosen.length)

    // phi = B x for the chosen (at most BAND are stored)
    const phiR: Float64Array[] = []
    const phiI: Float64Array[] = []

    chosen.slice(0, BAND).forEach((i, slot) => {
      const pr = new Float64Array(MODES)
      const pi = new Float64Array(MODES)

      for (let a = 0; a < r; a++) {
        const xr = e.vectorsRe[i * r + a]!
        const xi = e.vectorsIm[i * r + a]!

        for (let m = 0; m < MODES; m++) {
          pr[m]! += cols[a]!.re[m]! * xr - cols[a]!.im[m]! * xi
          pi[m]! += cols[a]!.re[m]! * xi + cols[a]!.im[m]! * xr
        }
      }

      phiR.push(pr)
      phiI.push(pi)
      re.set(pr, (j * BAND + slot) * MODES)
      im.set(pi, (j * BAND + slot) * MODES)
    })

    // U phi stays in the span of the phis
    for (let s = 0; s < phiR.length; s++) {
      const ur = new Float64Array(MODES)
      const ui = new Float64Array(MODES)

      for (let i = 0; i < MODES; i++) {
        let sr = 0
        let si = 0

        for (let m = 0; m < MODES; m++) {
          sr += U.re[i * MODES + m]! * phiR[s]![m]! - U.im[i * MODES + m]! * phiI[s]![m]!
          si += U.re[i * MODES + m]! * phiI[s]![m]! + U.im[i * MODES + m]! * phiR[s]![m]!
        }

        ur[i] = sr
        ui[i] = si
      }

      for (let t = 0; t < phiR.length; t++) {
        let dr = 0
        let di = 0

        for (let m = 0; m < MODES; m++) {
          dr += phiR[t]![m]! * ur[m]! + phiI[t]![m]! * ui[m]!
          di += phiR[t]![m]! * ui[m]! - phiI[t]![m]! * ur[m]!
        }

        for (let m = 0; m < MODES; m++) {
          ur[m]! -= dr * phiR[t]![m]! - di * phiI[t]![m]!
          ui[m]! -= dr * phiI[t]![m]! + di * phiR[t]![m]!
        }
      }

      let n = 0

      for (let m = 0; m < MODES; m++) {
        n += ur[m]! ** 2 + ui[m]! ** 2
      }

      leak = Math.max(leak, Math.sqrt(n))
    }
  })

  return { L, k, count: Q, re, im, fewest, most, movingMin, movingMax, margin, leak, gapZero, gapPi }
}

// the momenta grouped by transverse class: q . tau mod 2 pi for each tau, in integer units mod L
function classes(band: Band, transverse: readonly (readonly number[])[]): number[][] {
  const map = new Map<string, number[]>()
  const L = band.L

  for (let j = 0; j < band.count; j++) {
    const key = transverse
      .map(t => {
        const s = t.reduce((acc, x, c) => acc + x * band.k[j * 4 + c]!, 0)

        return ((s % L) + L) % L
      })
      .join(',')
    const list = map.get(key)

    if (list) {
      list.push(j)
    } else {
      map.set(key, [j])
    }
  }

  return [...map.values()]
}

const phaseOf = (band: Band, j: number, s: readonly number[]): number =>
  (2 * Math.PI * s.reduce((acc, x, c) => acc + x * band.k[j * 4 + c]!, 0)) / band.L

export type RegionReading = {
  // one entropy per representative set
  readonly S: number[]
  readonly classes: number
  readonly perClass: number
  // the Gram matrix's spectrum stays in [0, 1] within this
  readonly spill: number
}

// S for each representative set, all sharing one transverse sublattice (the Gram form)
export function regionEntropies(
  band: Band,
  transverse: readonly (readonly number[])[],
  repSets: readonly (readonly (readonly number[])[])[],
): RegionReading {
  const groups = classes(band, transverse)
  const S = repSets.map(() => 0)

  let spill = 0

  const n = groups[0]!.length

  for (const g of groups) {
    if (g.length !== n) {
      throw new Error('sea-entanglement: unequal transverse classes')
    }

    const D = n * BAND
    // overlaps <phi_qi, phi_q'j>
    const Or = new Float64Array(D * D)
    const Oi = new Float64Array(D * D)

    for (let a = 0; a < D; a++) {
      const oa = (g[Math.floor(a / BAND)]! * BAND + (a % BAND)) * MODES

      for (let b = a; b < D; b++) {
        const ob = (g[Math.floor(b / BAND)]! * BAND + (b % BAND)) * MODES

        let sr = 0
        let si = 0

        for (let m = 0; m < MODES; m++) {
          const xr = band.re[oa + m]!
          const xi = band.im[oa + m]!
          const yr = band.re[ob + m]!
          const yi = band.im[ob + m]!

          sr += xr * yr + xi * yi
          si += xr * yi - xi * yr
        }

        Or[a * D + b] = sr
        Oi[a * D + b] = si
        Or[b * D + a] = sr
        Oi[b * D + a] = -si
      }
    }

    repSets.forEach((reps, r) => {
      // F[q][q'] = (1 / n) sum over s of e^(i (q' - q) . s)
      const Fr = new Float64Array(n * n)
      const Fi = new Float64Array(n * n)

      for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
          let sr = 0
          let si = 0

          for (const s of reps) {
            const ph = phaseOf(band, g[y]!, s) - phaseOf(band, g[x]!, s)

            sr += Math.cos(ph)
            si += Math.sin(ph)
          }

          Fr[x * n + y] = sr / n
          Fi[x * n + y] = si / n
        }
      }

      const Gr = new Float64Array(D * D)
      const Gi = new Float64Array(D * D)

      for (let a = 0; a < D; a++) {
        const x = Math.floor(a / BAND)

        for (let b = 0; b < D; b++) {
          const y = Math.floor(b / BAND)
          const fr = Fr[x * n + y]!
          const fi = Fi[x * n + y]!
          const or = Or[a * D + b]!
          const oi = Oi[a * D + b]!

          Gr[a * D + b] = fr * or - fi * oi
          Gi[a * D + b] = fr * oi + fi * or
        }
      }

      for (const nu of hermitianEigenvaluesTridiagonal(D, Gr, Gi)) {
        spill = Math.max(spill, -nu, nu - 1)
        S[r]! += binaryEntropy(nu)
      }
    })
  }

  return { S, classes: groups.length, perClass: n, spill }
}

// S of one region from its block C_A itself (192 |reps| square per class)
export function regionEntropyBlock(
  band: Band,
  transverse: readonly (readonly number[])[],
  reps: readonly (readonly number[])[],
): RegionReading {
  const groups = classes(band, transverse)
  const R = reps.length
  const D = R * MODES

  let S = 0
  let spill = 0

  for (const g of groups) {
    const n = g.length
    const Br = new Float64Array(D * D)
    const Bi = new Float64Array(D * D)
    const Pr = new Float64Array(MODES * MODES)
    const Pi = new Float64Array(MODES * MODES)

    for (const j of g) {
      // P(q) = sum_i phi phi^dagger
      Pr.fill(0)
      Pi.fill(0)

      for (let i = 0; i < BAND; i++) {
        const o = (j * BAND + i) * MODES

        for (let m = 0; m < MODES; m++) {
          const ar = band.re[o + m]!
          const ai = band.im[o + m]!

          for (let p = 0; p < MODES; p++) {
            const br = band.re[o + p]!
            const bi = -band.im[o + p]!

            Pr[m * MODES + p]! += ar * br - ai * bi
            Pi[m * MODES + p]! += ar * bi + ai * br
          }
        }
      }

      for (let a = 0; a < R; a++) {
        for (let b = 0; b < R; b++) {
          const ph = phaseOf(band, j, reps[a]!) - phaseOf(band, j, reps[b]!)
          const c = Math.cos(ph) / n
          const s = Math.sin(ph) / n

          for (let m = 0; m < MODES; m++) {
            const row = (a * MODES + m) * D + b * MODES

            for (let p = 0; p < MODES; p++) {
              const pr = Pr[m * MODES + p]!
              const pi = Pi[m * MODES + p]!

              Br[row + p]! += c * pr - s * pi
              Bi[row + p]! += c * pi + s * pr
            }
          }
        }
      }
    }

    for (const nu of hermitianEigenvaluesTridiagonal(D, Br, Bi)) {
      spill = Math.max(spill, -nu, nu - 1)
      S += binaryEntropy(nu)
    }
  }

  return { S: [S], classes: groups.length, perClass: groups[0]!.length, spill }
}

// THE SEA IS THE RULE'S, IN REAL SPACE: the band projector built from the Bloch vectors with this file's Fourier
// convention, P v = (1 / N) sum_q e^(i q . x) P(q) sum_y e^(-i q . y) v(y), against the rule's one-body cycle written
// directly on the torus (each beat: the dock piece at every dock, then slot d's 8 modes one dock along r_d). Returns the
// worst |U P v - P U v| over unit vectors v on the given modes of the origin dock, relative to |P v|
export function stationarity(band: Band, Ps: readonly CMatrix[], modes: readonly number[]): { worst: number; weight: number } {
  const T = torus(band.L)
  const N = T.sites.length
  const L = band.L
  const at = (p: readonly number[]): number => T.index.get(p.map(x => ((x % L) + L) % L).join(','))!
  const target = new Int32Array(N * 24)

  T.sites.forEach((p, x) => {
    for (let d = 0; d < 24; d++) {
      target[x * 24 + d] = at(p.map((v, c) => v + REGISTER_ROOTS[d * 8]![c]!))
    }
  })

  type V = { re: Float64Array; im: Float64Array }
  const zero = (): V => ({ re: new Float64Array(N * MODES), im: new Float64Array(N * MODES) })

  const applyU = (v: V): V => {
    let cur = v

    for (const P of Ps) {
      const w = zero()

      for (let x = 0; x < N; x++) {
        for (let i = 0; i < MODES; i++) {
          let sr = 0
          let si = 0

          for (let m = 0; m < MODES; m++) {
            const pr = P.re[i * MODES + m]!
            const pi = P.im[i * MODES + m]!
            const vr = cur.re[x * MODES + m]!
            const vi = cur.im[x * MODES + m]!

            sr += pr * vr - pi * vi
            si += pr * vi + pi * vr
          }

          // the stream: slot floor(i / 8) one dock along its root
          const y = target[x * 24 + Math.floor(i / 8)]!

          w.re[y * MODES + i] = sr
          w.im[y * MODES + i] = si
        }
      }

      cur = w
    }

    return cur
  }

  const applyP = (v: V): V => {
    const out = zero()

    for (let j = 0; j < band.count; j++) {
      const hr = new Float64Array(MODES)
      const hi = new Float64Array(MODES)

      T.sites.forEach((p, x) => {
        const ph = -(2 * Math.PI * p.reduce((s, c, i) => s + c * band.k[j * 4 + i]!, 0)) / L
        const c = Math.cos(ph)
        const s = Math.sin(ph)

        for (let m = 0; m < MODES; m++) {
          const vr = v.re[x * MODES + m]!
          const vi = v.im[x * MODES + m]!

          hr[m]! += c * vr - s * vi
          hi[m]! += c * vi + s * vr
        }
      })

      const pr = new Float64Array(MODES)
      const pi = new Float64Array(MODES)

      for (let i = 0; i < BAND; i++) {
        const o = (j * BAND + i) * MODES

        let tr = 0
        let ti = 0

        for (let m = 0; m < MODES; m++) {
          tr += band.re[o + m]! * hr[m]! + band.im[o + m]! * hi[m]!
          ti += band.re[o + m]! * hi[m]! - band.im[o + m]! * hr[m]!
        }

        for (let m = 0; m < MODES; m++) {
          pr[m]! += band.re[o + m]! * tr - band.im[o + m]! * ti
          pi[m]! += band.re[o + m]! * ti + band.im[o + m]! * tr
        }
      }

      T.sites.forEach((p, x) => {
        const ph = (2 * Math.PI * p.reduce((s, c, i) => s + c * band.k[j * 4 + i]!, 0)) / L
        const c = Math.cos(ph) / N
        const s = Math.sin(ph) / N

        for (let m = 0; m < MODES; m++) {
          out.re[x * MODES + m]! += c * pr[m]! - s * pi[m]!
          out.im[x * MODES + m]! += c * pi[m]! + s * pr[m]!
        }
      })
    }

    return out
  }

  let worst = 0
  let weight = Infinity

  for (const m of modes) {
    const v = zero()

    v.re[T.origin * MODES + m] = 1

    const a = applyU(applyP(v))
    const b = applyP(applyU(v))
    const pv = applyP(v)

    let diff = 0
    let norm = 0

    for (let i = 0; i < N * MODES; i++) {
      diff += (a.re[i]! - b.re[i]!) ** 2 + (a.im[i]! - b.im[i]!) ** 2
      norm += pv.re[i]! ** 2 + pv.im[i]! ** 2
    }

    weight = Math.min(weight, Math.sqrt(norm))
    worst = Math.max(worst, Math.sqrt(diff) / Math.sqrt(norm))
  }

  return { worst, weight }
}

// a ring of N free fermions, H = -sum t_i (c_i^dagger c_(i+1) + h.c.), every state below zero filled: S of the block of
// the first l sites for each l
export function chainEntropies(hops: readonly number[], blocks: readonly number[]): { S: number[]; filled: number; gap: number } {
  const N = hops.length
  const Hr = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N

    Hr[i * N + j] = -hops[i]!
    Hr[j * N + i] = -hops[i]!
  }

  const e = hermitianEigenRows(N, Hr, new Float64Array(N * N))
  const filled = Array.from(e.values).filter(v => v < 0).length
  const gap = Math.min(...Array.from(e.values).map(Math.abs))
  const Cr = new Float64Array(N * N)
  const Ci = new Float64Array(N * N)

  for (let s = 0; s < filled; s++) {
    for (let i = 0; i < N; i++) {
      const ar = e.vectorsRe[s * N + i]!
      const ai = e.vectorsIm[s * N + i]!

      for (let j = 0; j < N; j++) {
        const br = e.vectorsRe[s * N + j]!
        const bi = e.vectorsIm[s * N + j]!

        Cr[i * N + j]! += ar * br + ai * bi
        Ci[i * N + j]! += ai * br - ar * bi
      }
    }
  }

  const S = blocks.map(l => {
    const br = new Float64Array(l * l)
    const bi = new Float64Array(l * l)

    for (let i = 0; i < l; i++) {
      for (let j = 0; j < l; j++) {
        br[i * l + j] = Cr[i * N + j]!
        bi[i * l + j] = Ci[i * N + j]!
      }
    }

    return hermitianEigenvaluesTridiagonal(l, br, bi).reduce((s, nu) => s + binaryEntropy(nu), 0)
  })

  return { S, filled, gap }
}
