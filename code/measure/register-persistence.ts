// DOES A MOVING BOUND THREE-MEMBER STATE KEEP ITS IDENTITY (moving-matter item 0025, E-SLF-0181, OPEN-MND-02). The bound
// triple of E-SPN-0193 (code/measure/three-member-motion) is started as a packet over total momenta K, every K carrying
// the same internal state, and its internal (relative-coordinate) part is compared with its start while the packet moves.
//
// THE INTERNAL OVERLAP. Write the start as Psi = sum_K A(K) B_K f, f the rest bound level (the internal state at K = 0)
// and B_K the boost to K. Tracing out the center leaves rho_int(t) = sum_K w_K |f_K(t)><f_K(t)|, w_K = |A(K)|^2, because
// different K are orthogonal in the center coordinate; so the internal overlap is
//   O(t) = <f| rho_int(t) |f> = sum_K w_K |c_K(t)|^2,  c_K(t) = <B_K f| U_K^t B_K f>
// and every K evolves on its own (U_K the rule at total momentum K). A K = 0 eigenstate keeps |c| = 1 by construction
// (circular, spec rule 3); what is tested is whether the same internal state, boosted, is still one level at K != 0.
//
//   boostMaps      B_K = e^(i K . X_cm): each hole's momentum shifted by delta = K / 3 (three-member-motion's twisted
//                  torus) with its 192-mode vector held fixed, so a member's fiber vector at class j maps by
//                  W_K(j)^dag W_0(j). The part of a mode vector outside the moving span at the shifted momentum is a flat
//                  hole there, which the store cannot hold: its weight is the boost's leak, returned and bounded below
//   applyMembers   the per-member fiber map on every entry of a three-hole store
//   sectorRun      one sector's run: the autocorrelation c(t) for t < T (the direct read), a Hann filter at E (the level
//                  vector), and register-selves' integration I(t) of the one-hole occupation at the read cycles
//   krylov2        the rule compressed to span{u, U u}: the level's coherence beyond the run (a doublet split shows here)
//   sectorBounds   |c(t)| bounds at any t from the level weight a^2 = |<u|f>|^2 and u's residual rho = |(U - z) u|:
//                  rigorous below (|<u|U^t u>| >= 1 - t rho, the cross terms <r|U^t u> = <r|(U^t - z^t) u> <= |r| t rho),
//                  and above from the two-dimensional compression (an estimate)
//   packetWeights  the Fourier weights of a periodic Gaussian on the ring Z_L
//
// DETERMINISM: no random numbers. FLOATS are measurement on the exact pieces, as in register-holes.

import {
  holeCycle,
  holeNorm,
  momentumWeights,
  type HoleEngine,
  type HoleFrame,
  type HoleRule,
  type Holes,
} from '@/code/measure/register-holes'
import { hann } from '@/code/measure/three-member-motion'
import { integration, type SelvesRead } from '@/code/measure/register-selves'

const MODES = 192

export type Mat = { re: Float64Array; im: Float64Array }

// W_K(j)^dag W_0(j) for every class j (fiber x fiber, row-major)
export function boostMaps(fr0: HoleFrame, frK: HoleFrame): Mat[] {
  const f = fr0.fiber
  const out: Mat[] = []

  for (let j = 0; j < fr0.W.length; j++) {
    const a = fr0.W[j]!
    const b = frK.W[j]!
    const M = { re: new Float64Array(f * f), im: new Float64Array(f * f) }

    for (let r = 0; r < f; r++) {
      for (let c = 0; c < f; c++) {
        let sr = 0
        let si = 0

        for (let m = 0; m < MODES; m++) {
          // conj(b[m][r]) a[m][c]
          const br = b.re[m * f + r]!
          const bi = -b.im[m * f + r]!
          const ar = a.re[m * f + c]!
          const ai = a.im[m * f + c]!

          sr += br * ar - bi * ai
          si += br * ai + bi * ar
        }

        M.re[r * f + c] = sr
        M.im[r * f + c] = si
      }
    }

    out.push(M)
  }

  return out
}

// every member's fiber vector times its class's matrix, in place
export function applyMembers(e: HoleEngine, s: Holes, mats: readonly Mat[]): void {
  const f = e.frame.fiber
  const n = s.n
  const block = f ** n
  const tuples = s.re.length / block
  const xr = new Float64Array(f)
  const xi = new Float64Array(f)

  for (let T = 0; T < tuples; T++) {
    const off = T * block

    for (let i = 0; i < n; i++) {
      const A = mats[e.mom[T * n + i]!]!
      const st = f ** (n - 1 - i)
      const outer = f ** i

      for (let hi = 0; hi < outer; hi++) {
        for (let lo = 0; lo < st; lo++) {
          const base = off + hi * f * st + lo

          for (let k = 0; k < f; k++) {
            xr[k] = s.re[base + k * st]!
            xi[k] = s.im[base + k * st]!
          }

          for (let r = 0; r < f; r++) {
            let yr = 0
            let yi = 0

            for (let k = 0; k < f; k++) {
              const ar = A.re[r * f + k]!
              const ai = A.im[r * f + k]!

              yr += ar * xr[k]! - ai * xi[k]!
              yi += ar * xi[k]! + ai * xr[k]!
            }

            s.re[base + r * st] = yr
            s.im[base + r * st] = yi
          }
        }
      }
    }
  }
}

// <a|b>
export function dotHoles(a: Holes, b: Holes): [number, number] {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    i += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [r, i]
}

export const cloneHoles = (s: Holes): Holes => ({
  ...s,
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

export function scaleHoles(s: Holes, x: number): void {
  for (let k = 0; k < s.re.length; k++) {
    s.re[k]! *= x
    s.im[k]! *= x
  }
}

// the one-hole occupation summed over the (identical) members, as register-selves reads it
function occupation(e: HoleEngine, s: Holes): Float64Array {
  const N = e.frame.fourier.N
  const w = momentumWeights(e, s)
  const out = new Float64Array(N)

  for (let i = 0; i < s.n; i++) {
    for (let j = 0; j < N; j++) {
      out[j]! += w[i * N + j]!
    }
  }

  return out
}

const selvesOf = (occ: Float64Array): SelvesRead => ({
  occ,
  rho2: new Float64Array(0),
  conn: new Float64Array(0),
})

export type SectorRun = {
  // the autocorrelation <psi0|U^t psi0>, t = 0 .. T - 1
  cRe: Float64Array
  cIm: Float64Array
  // the Hann-filtered projection at E (absent when E is null)
  phi: Holes | null
  // register-selves' integration of the one-hole occupation against the start, at the read cycles
  reads: { cycle: number; integration: number }[]
  normDrift: number
  seconds: number
}

// T cycles from psi0 (left unchanged), with the autocorrelation every cycle, the filter at E, and the reads every `every`
export function sectorRun(
  e: HoleEngine,
  rule: HoleRule,
  psi0: Holes,
  T: number,
  E: number | null,
  every: number,
): SectorRun {
  const started = Date.now()
  const s = cloneHoles(psi0)
  const phi: Holes | null =
    E === null ? null : { ...psi0, re: new Float64Array(psi0.re.length), im: new Float64Array(psi0.re.length) }
  const cRe = new Float64Array(T)
  const cIm = new Float64Array(T)
  const n0 = holeNorm(psi0)
  const occ0 = selvesOf(occupation(e, psi0))
  const reads: SectorRun['reads'] = []
  let normDrift = 0

  for (let t = 0; t < T; t++) {
    if (t > 0) {
      holeCycle(e, rule, s)
    }

    const [cr, ci] = dotHoles(psi0, s)

    cRe[t] = cr
    cIm[t] = ci

    if (phi && E !== null) {
      const w = hann(t, T)
      const c = w * Math.cos(E * t)
      const sn = w * Math.sin(E * t)

      for (let k = 0; k < s.re.length; k++) {
        const xr = s.re[k]!
        const xi = s.im[k]!

        phi.re[k]! += c * xr - sn * xi
        phi.im[k]! += c * xi + sn * xr
      }
    }

    if (t % every === 0 || t === T - 1) {
      reads.push({ cycle: t, integration: integration(s.n, occ0, selvesOf(occupation(e, s))) })
      normDrift = Math.max(normDrift, Math.abs(holeNorm(s) - n0))
    }
  }

  return { cRe, cIm, phi, reads, normDrift, seconds: (Date.now() - started) / 1000 }
}

// the rule on span{u, U u}, u normalized: H = Q^dag U Q with Q = (u, e2), e2 the normalized residual of U u. Returns H
// (2 x 2, row-major), the level E = -arg <u|U u>, and the residual rho = |U u - <u|U u> u|
export function krylov2(
  e: HoleEngine,
  rule: HoleRule,
  u: Holes,
): { H: Mat; E: number; rho: number; normDrift: number } {
  const v = cloneHoles(u)

  holeCycle(e, rule, v)

  const [ar, ai] = dotHoles(u, v)
  const w = cloneHoles(v)

  for (let k = 0; k < w.re.length; k++) {
    w.re[k]! -= ar * u.re[k]! - ai * u.im[k]!
    w.im[k]! -= ar * u.im[k]! + ai * u.re[k]!
  }

  const rho = Math.sqrt(holeNorm(w))
  const H = { re: new Float64Array(4), im: new Float64Array(4) }

  H.re[0] = ar
  H.im[0] = ai
  H.re[2] = rho
  H.im[2] = 0

  if (rho > 0) {
    scaleHoles(w, 1 / rho)

    const Uw = cloneHoles(w)

    holeCycle(e, rule, Uw)

    const [br, bi] = dotHoles(u, Uw)
    const [cr, ci] = dotHoles(w, Uw)

    H.re[1] = br
    H.im[1] = bi
    H.re[3] = cr
    H.im[3] = ci
  }

  return { H, E: -Math.atan2(ai, ar), rho, normDrift: Math.abs(holeNorm(v) - 1) }
}

const mul2 = (a: Mat, b: Mat): Mat => {
  const out = { re: new Float64Array(4), im: new Float64Array(4) }

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < 2; k++) {
        const xr = a.re[r * 2 + k]!
        const xi = a.im[r * 2 + k]!
        const yr = b.re[k * 2 + c]!
        const yi = b.im[k * 2 + c]!

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      out.re[r * 2 + c] = sr
      out.im[r * 2 + c] = si
    }
  }

  return out
}

// |(H^t)[0][0]|, by repeated squaring
export function compressedReturn(H: Mat, t: number): number {
  let acc: Mat = { re: Float64Array.from([1, 0, 0, 1]), im: new Float64Array(4) }
  let p: Mat = H
  let k = t

  while (k > 0) {
    if (k & 1) {
      acc = mul2(acc, p)
    }

    p = mul2(p, p)
    k >>= 1
  }

  return Math.hypot(acc.re[0]!, acc.im[0]!)
}

export type SectorLevel = {
  // the level weight |<u|f>|^2 of the kept start, the rest of the kept start r^2, the boost's leak
  a2: number
  r2: number
  leak: number
  rho: number
  H: Mat
}

// |c(t)| bounds: below rigorous, above with |<u|U^t u>| from the compression (an estimate). Both clipped to [0, 1]
export function sectorBounds(l: SectorLevel, t: number): { low: number; high: number } {
  const a = Math.sqrt(l.a2)
  const r = Math.sqrt(Math.max(0, l.r2))
  const tr = t * l.rho
  const low = l.a2 * (1 - tr) - 2 * a * r * tr - l.r2 - l.leak
  const high = l.a2 * compressedReturn(l.H, t) + 2 * a * r + l.r2 + l.leak

  return { low: Math.max(0, Math.min(1, low)), high: Math.max(0, Math.min(1, high)) }
}

// the weights w_m of a Gaussian packet over the ring's momenta k_m = 2 pi m / L (taken in (-pi, pi]): amplitude
// e^(-sigma^2 (k_m - kbar)^2 / 2), a packet of width sigma docks centered at the origin with mean momentum kbar
export function packetWeights(L: number, sigma: number, kbar: number): { m: number; k: number; w: number }[] {
  const out: { m: number; k: number; w: number }[] = []

  for (let m = 0; m < L; m++) {
    const k0 = (2 * Math.PI * m) / L
    const k = k0 > Math.PI ? k0 - 2 * Math.PI : k0

    out.push({ m, k, w: Math.exp(-sigma * sigma * (k - kbar) ** 2) })
  }

  const z = out.reduce((a, b) => a + b.w, 0)

  return out.map(x => ({ ...x, w: x.w / z }))
}
