// A BOUND PAIR AND ITS LIGHT AS ONE QUANTUM DYNAMICS ON A PLANE TORUS (E-QTM-0181): the low-dimension test of whether
// the moving light adds to a bound pair's inertia beyond the static pull and the Darwin exchange.
//
// THE MODEL, term by term.
//  - The mesh: an L x L square torus, links along x and y.
//  - The members: one or two members of charge +1 (love) and -1 (fear), each a hop of amplitude t across a link with the
//    rest energy M0, so a lone member's band is M0 + 2t sum_d (1 - cos k_d), its inertia over energy R = c^2 / (2 t M0)
//    (the caller sets t from the rule member's tan m / m).
//  - The light: a link angle A_l. Gauss's law div E = g rho is solved exactly (Coulomb gauge), which leaves the
//    instantaneous pull g^2 (G(0) - G(r)) between the pair (G the lattice Green function, zero mode removed) and the
//    transverse light as quantized modes: one polarization per momentum q != 0, eps(q) = (-s_y, s_x) / |s|, s_d =
//    2 sin(q_d / 2), omega_q = c |s|, A_d(x) = sum_q (eps_d / sqrt(2 omega N)) (a_q e^(i q (x + d/2)) + h.c.).
//  - The coupling: E-SPN-0169's exact Peierls phase. A member's hop across link (x, d) carries e^(-i e g A_d(x)), the
//    whole exponential, a product over modes of displacement operators D(beta_q), beta_q = -i e g u_q(d) e^(-i q (x +
//    d/2)). Normal ordered D = DW :exp(B^dag) exp(-B):, DW = exp(-sum |beta|^2 / 2) over every mode, so within a
//    photon-number truncation N the matrix elements are exact (P_N D P_N), and only the Hilbert space is cut.
//  - The light's own uniform mode (q = 0, the torus holonomy) is left out: on an infinite plane it is measure zero.
//
// THE STATE. Total momentum P (along x) is kept. A pair state is psi(r, q_1 .. q_n) for n = 0 .. N photons, r the
// relative position (member 1 minus member 2, on the torus with the twist P / 2 carried by each member), the photon
// labels a symmetric first-quantized tuple (norm over ordered tuples, so a(f) and a^dag(f) carry sqrt n and 1 / sqrt n
// and a doubly occupied mode is exact). A lone member's state is psi(q_1 .. q_n), its momentum P - sum q. In this frame
// every term is local: member 1 adding a photon q multiplies by e^(-i q r), its hop shifts r, member 2's hop shifts r
// the other way, the pull is diagonal in r.
//
// THE THREE LIGHTS (`light`):
//   quantum   the full dynamics above, photon number up to nMax
//   static    no transverse light: the members, the instantaneous pull, bare hops (DW = 1)
//   darwin    static plus the instantaneous one-photon exchange between the two members, -sum V_k omega^-1 V_j (j != k),
//             V the linear term of the same Peierls phase (bare vertices): the light's transverse kernel at zero
//             frequency, the Darwin term of E-SPN-0169 built from this model's own vertices
//   magnetostatic  darwin plus each member's own instantaneous exchange (j = k): the whole zero-frequency transverse
//             energy of the pair's current. In the plane the mutual term alone grows as ln L (the transverse kernel is
//             1 / q^2) and only this sum is finite for a neutral pair (E-QTM-0181)
// `gT` scales the transverse coupling alone (0 switches the transverse light off while the pull stays).

import { lanczosLowest } from '@/code/algebra/linear/lanczos-lowest'
import { newCx, type Cx } from '@/code/algebra/linear/complex-vector'
import { wrap } from '@/code/measure/dock-mixer'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

// the rule member's rest energy and R (code/measure/register-track's setupFor: M0 = wrap(theta - pi), R = tan m / m
// with m = M0 / 2), and the hop that gives a plane member the same M0 and R at light speed c: t = c^2 / (2 M0 R)
export function ruleMember(input: { light: readonly [number, number]; c: number }): {
  M0: number
  m: number
  Rwalk: number
  t: number
  mu: number
} {
  const M0 = wrap(unitAngle(ringUnit(input.light[0], input.light[1])) - Math.PI)
  const m = M0 / 2
  const Rwalk = Math.tan(m) / m
  const t = input.c ** 2 / (2 * M0 * Rwalk)

  return { M0, m, Rwalk, t, mu: 1 / (4 * t) }
}

// the coupling at Bohr length aB: the plane pull's log coefficient g^2 / (2 pi) equal to 1 / (mu aB), so aB is
// proportional to 1 / g^2 at fixed member, as the 3d count's alphaOf is
export const couplingOf = (mu: number, aB: number): number =>
  Math.sqrt((2 * Math.PI) / (mu * aB))

// the slab light's coupling at Bohr length aB: the pull -g^2 / (4 pi r) far out, alpha = g^2 / (4 pi) = 1 / (mu aB)
export const slabCouplingOf = (mu: number, aB: number): number =>
  Math.sqrt((4 * Math.PI) / (mu * aB))

export type PlaneLightSpec = {
  L: number
  c: number
  g: number
  gT?: number
  t: number
  M0: number
  nMax: number
  members: 1 | 2
  P: number
  light: 'quantum' | 'static' | 'darwin' | 'magnetostatic'
  // the slab light: when set, the light lives on an L x L x depth torus (two polarizations a momentum, the pull the
  // slab's Green function on the plane) and the members on its z = 0 plane, so the pull and the transverse kernel are
  // 3d's (1 / r, finite Darwin term) while the members stay in the plane
  depth?: number
  // false: the pull leaves out the charges' own Coulomb energy (-g^2 G(r), zero far away, as in 3d)
  selfEnergy?: boolean
}

export type PlaneLight = {
  spec: PlaneLightSpec
  dimension: number
  sizes: number[]
  debyeWaller: [number, number]
  apply: (x: Cx, out: Cx) => void
  // the one-photon vertex <q| H |0> of a lone member (its current read by the light), for the instrument
  pull: Float64Array | null
}

const TWO_PI = 2 * Math.PI

const wrapIndex = (i: number, L: number): number => (i >= L / 2 ? i - L : i)

const FACTORIAL = [1, 1, 2, 6, 24, 120]

export function planeLight(spec: PlaneLightSpec): PlaneLight {
  const { L, c, g, t, M0, members, P, light } = spec
  const gT = spec.gT ?? g
  const quantum = light === 'quantum'
  const nMax = quantum ? spec.nMax : 0
  const nWork = light === 'darwin' || light === 'magnetostatic' ? 1 : nMax
  const Nq = L * L
  const R = members === 2 ? Nq : 1
  const depth = spec.depth ?? 0
  // the photon labels: one transverse mode per plane momentum, or two per momentum of the L x L x depth slab
  const M = depth > 0 ? 2 * Nq * depth : Nq
  const sizes: number[] = []

  for (let n = 0, s = R; n <= nWork; n++, s *= M) {
    sizes.push(s)
  }

  const offsets: number[] = []

  for (let n = 0, o = 0; n <= nWork; n++) {
    offsets.push(o)
    o += sizes[n]!
  }

  const dimension = sizes.slice(0, nMax + 1).reduce((a, b) => a + b, 0)
  const workDimension = sizes.reduce((a, b) => a + b, 0)

  // ---------------- the light's modes ----------------
  const omega = new Float64Array(M)
  const u: [Float64Array, Float64Array] = [new Float64Array(M), new Float64Array(M)]
  // half-link phases e^(i q_d / 2), by direction, and each mode's plane momentum
  const hRe: [Float64Array, Float64Array] = [new Float64Array(M), new Float64Array(M)]
  const hIm: [Float64Array, Float64Array] = [new Float64Array(M), new Float64Array(M)]
  const mqx = new Int32Array(M)
  const mqy = new Int32Array(M)
  const s2 = new Float64Array(Nq)

  for (let qy = 0; qy < L; qy++) {
    for (let qx = 0; qx < L; qx++) {
      const kx = (TWO_PI * wrapIndex(qx, L)) / L
      const ky = (TWO_PI * wrapIndex(qy, L)) / L
      const sx = 2 * Math.sin(kx / 2)
      const sy = 2 * Math.sin(ky / 2)

      s2[qx + L * qy] = sx * sx + sy * sy

      for (let qz = 0; qz < Math.max(1, depth); qz++) {
        const kz = depth > 0 ? (TWO_PI * wrapIndex(qz, depth)) / depth : 0
        const sz = 2 * Math.sin(kz / 2)
        const s = Math.sqrt(sx * sx + sy * sy + sz * sz)
        // the transverse polarizations' x and y components: in the plane (-sy, sx) / |s_plane|; in the slab the
        // pair e1 = (s x n) / |.|, e2 = s-hat x e1, n = z-hat (or x-hat when s is along z)
        const pols: [number, number][] = []

        if (s > 0 && depth === 0) {
          pols.push([-sy / s, sx / s])
        } else if (s > 0) {
          const n = Math.hypot(sx, sy) > 1e-12 ? [0, 0, 1] : [1, 0, 0]
          const sv = [sx / s, sy / s, sz / s]
          const cr = (a: number[], b: number[]): number[] => [
            a[1]! * b[2]! - a[2]! * b[1]!,
            a[2]! * b[0]! - a[0]! * b[2]!,
            a[0]! * b[1]! - a[1]! * b[0]!,
          ]
          const e1raw = cr(sv, n)
          const e1n = Math.hypot(...e1raw)
          const e1 = e1raw.map(x => x / e1n)
          const e2 = cr(sv, e1)

          pols.push([e1[0]!, e1[1]!], [e2[0]!, e2[1]!])
        }

        const N = Nq * Math.max(1, depth)
        const count = depth > 0 ? 2 : 1

        for (let p = 0; p < count; p++) {
          const m = depth > 0 ? 2 * (qx + L * qy + Nq * qz) + p : qx + L * qy

          mqx[m] = qx
          mqy[m] = qy
          hRe[0][m] = Math.cos(kx / 2)
          hIm[0][m] = Math.sin(kx / 2)
          hRe[1][m] = Math.cos(ky / 2)
          hIm[1][m] = Math.sin(ky / 2)

          if (s === 0) {
            continue
          }

          omega[m] = c * s

          const norm = 1 / Math.sqrt(2 * omega[m]! * N)

          u[0][m] = pols[p]![0] * norm
          u[1][m] = pols[p]![1] * norm
        }
      }
    }
  }

  const fluct = [0, 1].map(d => u[d]!.reduce((a, x) => a + x * x, 0))
  const debyeWaller: [number, number] = quantum
    ? [Math.exp((-gT * gT * fluct[0]!) / 2), Math.exp((-gT * gT * fluct[1]!) / 2)]
    : [1, 1]

  // the charge of each member: +1 then -1
  const charges = members === 2 ? [1, -1] : [1]

  // ---------------- r tables (a pair) ----------------
  const e1Re = new Float64Array(L * L)
  const e1Im = new Float64Array(L * L)

  for (let a = 0; a < L; a++) {
    for (let b = 0; b < L; b++) {
      const ph = (TWO_PI * ((a * b) % L)) / L

      e1Re[a * L + b] = Math.cos(ph)
      e1Im[a * L + b] = Math.sin(ph)
    }
  }

  const pull = members === 2 ? new Float64Array(Nq) : null

  if (pull) {
    // G(r) = (1 / N) sum_{q != 0} cos(q r) / |s|^2, the pull g^2 (G(0) - G(r)); in the slab |s|^2 takes the depth's
    // s_z^2 and the sum runs over q_z too (the slab's Green function on the members' plane)
    const kernel = new Float64Array(Nq)

    for (let iq = 0; iq < Nq; iq++) {
      if (depth === 0) {
        kernel[iq] = iq === 0 ? 0 : 1 / (s2[iq]! * Nq)
        continue
      }

      for (let qz = 0; qz < depth; qz++) {
        const sz = 2 * Math.sin((TWO_PI * wrapIndex(qz, depth)) / depth / 2)
        const total = s2[iq]! + sz * sz

        if (total > 0) {
          kernel[iq] = kernel[iq]! + 1 / (total * Nq * depth)
        }
      }
    }

    const G = new Float64Array(Nq)

    for (let ry = 0; ry < L; ry++) {
      for (let rx = 0; rx < L; rx++) {
        let sum = 0

        for (let qy = 0; qy < L; qy++) {
          for (let qx = 0; qx < L; qx++) {
            const iq = qx + L * qy

            sum += (e1Re[qx * L + rx]! * e1Re[qy * L + ry]! - e1Im[qx * L + rx]! * e1Im[qy * L + ry]!) * kernel[iq]!
          }
        }

        G[rx + L * ry] = sum
      }
    }

    // with the charges' own Coulomb energy (g^2 G(0), the default: the plane's log pull has no other zero) or without
    // it, -g^2 G(r), the 3d convention (E-SPN-0173: the pull's zero far away)
    const own = spec.selfEnergy === false ? 0 : G[0]!

    for (let i = 0; i < Nq; i++) {
      pull[i] = g * g * (own - G[i]!)
    }
  }

  // r shifted by +-1 along d, on the torus
  const shifted = (r: number, d: number, sign: number): number => {
    const rx = r % L
    const ry = (r - rx) / L

    return d === 0
      ? ((rx + sign + L) % L) + L * ry
      : rx + L * ((ry + sign + L) % L)
  }

  const shiftTable: Int32Array[][] = [0, 1].map(d =>
    [-1, 1].map(sign => {
      const tab = new Int32Array(R)

      for (let r = 0; r < R; r++) {
        tab[r] = members === 2 ? shifted(r, d, sign) : r
      }

      return tab
    }),
  )

  // photon half-phase products prod_i h_(q_i)^sign over a component's tuples, by direction and sign
  const halfCache = new Map<string, Cx>()
  const halfProduct = (n: number, d: number, sign: number): Cx => {
    const key = `${n} ${d} ${sign}`
    const seen = halfCache.get(key)

    if (seen) {
      return seen
    }

    const count = M ** n
    const out = newCx(count)

    for (let Q = 0; Q < count; Q++) {
      let re = 1
      let im = 0
      let rest = Q

      for (let i = 0; i < n; i++) {
        const q = rest % M

        rest = (rest - q) / M

        const hr = hRe[d]![q]!
        const hi = sign * hIm[d]![q]!
        const nr = re * hr - im * hi

        im = re * hi + im * hr
        re = nr
      }

      out.re[Q] = re
      out.im[Q] = im
    }

    halfCache.set(key, out)

    return out
  }

  const view = (x: Cx, n: number): Cx => ({
    re: x.re.subarray(offsets[n]!, offsets[n]! + sizes[n]!),
    im: x.im.subarray(offsets[n]!, offsets[n]! + sizes[n]!),
  })

  // out = phase * shift * prod h^half, componentwise (n from 0 to top); `shift` 0, or +-1 meaning out(r) = in(r +- d)
  const layer = (
    x: Cx,
    out: Cx,
    top: number,
    o: { phase: number; shift: number; half: number; d: number },
  ): void => {
    const pr = Math.cos(o.phase)
    const pi = Math.sin(o.phase)
    const tab = o.shift === 0 ? null : shiftTable[o.d]![o.shift < 0 ? 0 : 1]!

    for (let n = 0; n <= top; n++) {
      const a = view(x, n)
      const b = view(out, n)
      const count = sizes[n]! / R
      const h = o.half === 0 || n === 0 ? null : halfProduct(n, o.d, o.half)

      for (let Q = 0; Q < count; Q++) {
        let fr = pr
        let fi = pi

        if (h) {
          const hr = h.re[Q]!
          const hi = h.im[Q]!

          fr = pr * hr - pi * hi
          fi = pr * hi + pi * hr
        }

        const base = Q * R

        for (let r = 0; r < R; r++) {
          const from = base + (tab ? tab[r]! : r)
          const xr = a.re[from]!
          const xi = a.im[from]!

          b.re[base + r] = fr * xr - fi * xi
          b.im[base + r] = fr * xi + fi * xr
        }
      }
    }

    for (let n = top + 1; n <= nWork; n++) {
      view(out, n).re.fill(0)
      view(out, n).im.fill(0)
    }
  }

  // out[n-1] += k sqrt(n) sum_q (i b_q) phi(q, r) x[n](r, Q', q), phi = e^(i q r) for member 1 of a pair
  const remove = (
    x: Cx,
    out: Cx,
    n: number,
    j: number,
    d: number,
    k: number,
  ): void => {
    const a = view(x, n)
    const b = view(out, n - 1)
    const inner = sizes[n - 1]! / R
    const coef = k * Math.sqrt(n) * charges[j]! * gT
    const ud = u[d]!
    const phased = members === 2 && j === 0

    for (let q = 0; q < M; q++) {
      const bq = coef * ud[q]!

      if (bq === 0) {
        continue
      }

      const qx = mqx[q]!
      const qy = mqy[q]!

      for (let Qp = 0; Qp < inner; Qp++) {
        const from = (Qp + inner * q) * R
        const to = Qp * R

        if (!phased) {
          for (let r = 0; r < R; r++) {
            // (i bq) (xr + i xi) = -bq xi + i bq xr
            b.re[to + r] = b.re[to + r]! - bq * a.im[from + r]!
            b.im[to + r] = b.im[to + r]! + bq * a.re[from + r]!
          }

          continue
        }

        for (let ry = 0; ry < L; ry++) {
          const yr = e1Re[qy * L + ry]!
          const yi = e1Im[qy * L + ry]!

          for (let rx = 0; rx < L; rx++) {
            const xr0 = e1Re[qx * L + rx]!
            const xi0 = e1Im[qx * L + rx]!
            // i bq e^(i q r)
            const cr = xr0 * yr - xi0 * yi
            const ci = xr0 * yi + xi0 * yr
            const fr = -bq * ci
            const fi = bq * cr
            const r = rx + L * ry
            const vr = a.re[from + r]!
            const vi = a.im[from + r]!

            b.re[to + r] = b.re[to + r]! + fr * vr - fi * vi
            b.im[to + r] = b.im[to + r]! + fr * vi + fi * vr
          }
        }
      }
    }
  }

  // out[n] += k (1 / sqrt n) sum_i (-i b_(q_i)) phibar(q_i, r) x[n-1](r, Q \ q_i)
  const add = (
    x: Cx,
    out: Cx,
    n: number,
    j: number,
    d: number,
    k: number,
  ): void => {
    const a = view(x, n - 1)
    const b = view(out, n)
    const count = sizes[n]! / R
    const coef = (k / Math.sqrt(n)) * charges[j]! * gT
    const ud = u[d]!
    const phased = members === 2 && j === 0
    const digits = new Array<number>(n).fill(0)
    const powers = Array.from({ length: n }, (_, i) => M ** i)

    for (let Q = 0; Q < count; Q++) {
      let rest = Q

      for (let i = 0; i < n; i++) {
        digits[i] = rest % M
        rest = (rest - digits[i]!) / M
      }

      for (let i = 0; i < n; i++) {
        const q = digits[i]!
        const bq = coef * ud[q]!

        if (bq === 0) {
          continue
        }

        // the index of Q without position i
        let without = 0

        for (let p = 0, w = 0; p < n; p++) {
          if (p === i) {
            continue
          }

          without += digits[p]! * powers[w]!
          w++
        }

        const from = without * R
        const to = Q * R

        if (!phased) {
          for (let r = 0; r < R; r++) {
            // (-i bq) (xr + i xi) = bq xi - i bq xr
            b.re[to + r] = b.re[to + r]! + bq * a.im[from + r]!
            b.im[to + r] = b.im[to + r]! - bq * a.re[from + r]!
          }

          continue
        }

        const qx = mqx[q]!
        const qy = mqy[q]!

        for (let ry = 0; ry < L; ry++) {
          const yr = e1Re[qy * L + ry]!
          const yi = -e1Im[qy * L + ry]!

          for (let rx = 0; rx < L; rx++) {
            const xr0 = e1Re[qx * L + rx]!
            const xi0 = -e1Im[qx * L + rx]!
            // -i bq e^(-i q r)
            const cr = xr0 * yr - xi0 * yi
            const ci = xr0 * yi + xi0 * yr
            const fr = bq * ci
            const fi = -bq * cr
            const r = rx + L * ry
            const vr = a.re[from + r]!
            const vi = a.im[from + r]!

            b.re[to + r] = b.re[to + r]! + fr * vr - fi * vi
            b.im[to + r] = b.im[to + r]! + fr * vi + fi * vr
          }
        }
      }
    }
  }

  const work = (): Cx => newCx(workDimension)
  const t1 = work()
  const t2 = work()
  const t3 = work()
  const t4 = work()
  // inner's copy of z, set on its first top components each call
  const t5 = work()
  const X = work()
  const O = work()
  const zero = (x: Cx): void => {
    x.re.fill(0)
    x.im.fill(0)
  }

  const axpy = (y: Cx, k: number, x: Cx, top: number): void => {
    const end = offsets[top]! + sizes[top]!

    for (let i = 0; i < end; i++) {
      y.re[i] = y.re[i]! + k * x.re[i]!
      y.im[i] = y.im[i]! + k * x.im[i]!
    }
  }

  // the out factor O_j and its adjoint, as a layer: phase, r shift, half-phase sign
  const outFactor = (
    j: number,
    d: number,
    dagger: boolean,
  ): { phase: number; shift: number; half: number; d: number } => {
    const Pd = d === 0 ? P : 0
    const s = dagger ? -1 : 1

    if (members === 1) {
      return { phase: -s * Pd, shift: 0, half: s, d }
    }

    // member 1: e^(-i P d / 2) shift(r - d) prod hbar; member 2: e^(-i P d / 2) shift(r + d) prod h
    const half = j === 0 ? -s : s
    const shift = j === 0 ? -s : s

    return { phase: (-s * Pd) / 2, shift, half, d }
  }

  // Inner = sum (sAdd B^dag)^a / a! (sRem B)^b / b! on x (components up to top), into out; uses t3, t4
  const inner = (
    x: Cx,
    out: Cx,
    top: number,
    j: number,
    d: number,
    sAdd: number,
    sRem: number,
  ): void => {
    // removals: z = sum_b sRem^b / b! B^b x
    zero(out)
    axpy(out, 1, x, top)

    let prev = x

    for (let b = 1; b <= top; b++) {
      const next = prev === t3 ? t4 : t3

      zero(next)

      for (let n = 1; n <= top; n++) {
        remove(prev, next, n, j, d, 1)
      }

      axpy(out, sRem ** b / FACTORIAL[b]!, next, top)
      prev = next
    }

    // additions on z: result = sum_a sAdd^a / a! (B^dag)^a z
    const end = offsets[top]! + sizes[top]!

    t5.re.set(out.re.subarray(0, end))
    t5.im.set(out.im.subarray(0, end))
    prev = t5

    for (let a = 1; a <= top; a++) {
      const next = prev === t3 ? t4 : t3

      zero(next)

      for (let n = 1; n <= top; n++) {
        add(prev, next, n, j, d, 1)
      }

      axpy(out, sAdd ** a / FACTORIAL[a]!, next, top)
      prev = next
    }
  }

  const onsite = members * (M0 + 4 * t)

  const diagonal = (x: Cx, out: Cx, top: number): void => {
    for (let n = 0; n <= top; n++) {
      const a = view(x, n)
      const b = view(out, n)
      const count = sizes[n]! / R

      for (let Q = 0; Q < count; Q++) {
        let w = onsite
        let rest = Q

        for (let i = 0; i < n; i++) {
          const q = rest % M

          rest = (rest - q) / M
          w += omega[q]!
        }

        const base = Q * R

        for (let r = 0; r < R; r++) {
          const e = w + (pull ? pull[r]! : 0)

          b.re[base + r] = b.re[base + r]! + e * a.re[base + r]!
          b.im[base + r] = b.im[base + r]! + e * a.im[base + r]!
        }
      }
    }
  }

  // the instantaneous exchange between the members: out += -sum_(j != k) V_k G V_j x, x in component 0
  const darwin = (x: Cx, out: Cx): void => {
    const pairs = light === 'magnetostatic' ? [[0, 0], [0, 1], [1, 0], [1, 1]] : [[0, 1], [1, 0]]

    for (const [j, k] of pairs as [number, number][]) {

      // V_j x into component 1 of t2 (bare linear vertex, DW = 1)
      zero(t2)

      for (let d = 0; d < 2; d++) {
        // F_lin = O (B^dag - B) Win: from component 0, only B^dag
        zero(t1)
        add(x, t1, 1, j, d, 1)
        layer(t1, t3, 1, outFactor(j, d, false))
        axpy(t2, -t, t3, 1)

        // F_lin^dag = Win^dag (B - B^dag) O^dag
        layer(x, t3, 0, outFactor(j, d, true))
        zero(t1)
        add(t3, t1, 1, j, d, -1)
        layer(t1, t4, 1, { phase: 0, shift: 0, half: -1, d })
        axpy(t2, -t, t4, 1)
      }

      // G: one over the photon's energy (component 1)
      const c1 = view(t2, 1)

      for (let q = 0; q < M; q++) {
        const w = omega[q] === 0 ? 0 : 1 / omega[q]!

        for (let r = 0; r < R; r++) {
          c1.re[q * R + r] = c1.re[q * R + r]! * w
          c1.im[q * R + r] = c1.im[q * R + r]! * w
        }
      }

      view(t2, 0).re.fill(0)
      view(t2, 0).im.fill(0)

      // V_k back to component 0, with the minus sign of the exchange
      for (let d = 0; d < 2; d++) {
        // F_lin,k on component 1: Win, then -B, then O
        layer(t2, t3, 1, { phase: 0, shift: 0, half: 1, d })
        zero(t1)
        remove(t3, t1, 1, k, d, -1)
        layer(t1, t4, 0, outFactor(k, d, false))
        axpy(out, t, t4, 0)

        // F_lin,k^dag: O^dag, then +B
        layer(t2, t3, 1, outFactor(k, d, true))
        zero(t1)
        remove(t3, t1, 1, k, d, 1)
        axpy(out, t, t1, 0)
      }
    }
  }

  const apply = (x: Cx, out: Cx): void => {
    // embed x into the work layout (it is the first `dimension` entries)
    zero(X)
    zero(O)
    X.re.set(x.re.subarray(0, dimension))
    X.im.set(x.im.subarray(0, dimension))

    for (let j = 0; j < members; j++) {
      for (let d = 0; d < 2; d++) {
        const dw = debyeWaller[d]!

        // F = O DW Inner Win
        layer(X, t1, nMax, { phase: 0, shift: 0, half: 1, d })
        inner(t1, t2, nMax, j, d, 1, -1)
        layer(t2, t1, nMax, outFactor(j, d, false))
        axpy(O, -t * dw, t1, nMax)

        // F^dag = Win^dag DW Inner^dag O^dag
        layer(X, t1, nMax, outFactor(j, d, true))
        inner(t1, t2, nMax, j, d, -1, 1)
        layer(t2, t1, nMax, { phase: 0, shift: 0, half: -1, d })
        axpy(O, -t * dw, t1, nMax)
      }
    }

    diagonal(X, O, nMax)

    if (light === 'darwin' || light === 'magnetostatic') {
      darwin(X, O)
    }

    out.re.set(O.re.subarray(0, dimension))
    out.im.set(O.im.subarray(0, dimension))
  }

  return { spec, dimension, sizes: sizes.slice(0, nMax + 1), debyeWaller, apply, pull }
}

// the hydrogenic-like start: a periodic Gaussian in r of width w (minimal image), in component 0
export function gaussianStart(engine: PlaneLight, width: number): Cx {
  const { L, members } = engine.spec
  const x = newCx(engine.dimension)

  if (members === 1) {
    x.re[0] = 1

    return x
  }

  for (let ry = 0; ry < L; ry++) {
    for (let rx = 0; rx < L; rx++) {
      const dx = wrapIndex(rx, L)
      const dy = wrapIndex(ry, L)

      x.re[rx + L * ry] = Math.exp(-(dx * dx + dy * dy) / (2 * width * width))
    }
  }

  return x
}

// embed a component-0 vector (from a static or Darwin engine) as the start of a larger engine
export function embedStart(engine: PlaneLight, v: Cx): Cx {
  const x = newCx(engine.dimension)

  x.re.set(v.re.subarray(0, engine.sizes[0]!))
  x.im.set(v.im.subarray(0, engine.sizes[0]!))

  return x
}

export type InertiaRead = {
  E0: number
  d1: number
  d2: number
  ratio: number
  a: number
  R: number
  steps: number[]
  residuals: number[]
}

// R = c^2 / (2 a E0) from E(P) = E0 + a P^2, read at P = 0, kappa / 2, kappa with Richardson's (4 d2 / (k/2)^2 - d1 /
// k^2) / 3; each level the lowest of its sector by Lanczos from `start` (a vector or a builder)
export function readInertia(input: {
  spec: Omit<PlaneLightSpec, 'P'>
  kappa: number
  start: (engine: PlaneLight) => Cx
  tolerance: number
  maxSteps: number
  log?: (line: string) => void
}): InertiaRead {
  const levels = [0, input.kappa / 2, input.kappa].map(P => {
    const engine = planeLight({ ...input.spec, P })
    const res = lanczosLowest({
      dimension: engine.dimension,
      apply: engine.apply,
      start: input.start(engine),
      tolerance: input.tolerance,
      maxSteps: input.maxSteps,
      check: 10,
      log: input.log,
    })

    input.log?.(`P ${P}: E ${res.value} (${res.steps} steps, residual ${res.residual.toExponential(2)})`)

    return res
  })
  const E0 = levels[0]!.value
  const d2 = levels[1]!.value - E0
  const d1 = levels[2]!.value - E0
  const k = input.kappa
  const a = (4 * (d2 / (k / 2) ** 2) - d1 / k ** 2) / 3

  return {
    E0,
    d1,
    d2,
    ratio: d1 / d2,
    a,
    R: input.spec.c ** 2 / (2 * a * E0),
    steps: levels.map(l => l.steps),
    residuals: levels.map(l => l.residual),
  }
}

// the lowest state of a small (component-0) engine with its vector, for a start
export function lowestState(engine: PlaneLight, start: Cx): { value: number; vector: Cx } {
  const res = lanczosLowest({
    dimension: engine.dimension,
    apply: engine.apply,
    start,
    tolerance: 1e-12,
    maxSteps: Math.min(engine.dimension, 600),
    check: 10,
    vector: true,
  })

  return { value: res.value, vector: res.vector! }
}
