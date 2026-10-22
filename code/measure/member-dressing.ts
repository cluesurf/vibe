// ONE MEMBER DRESSED BY AT MOST ONE HUSK PHOTON (item 0068 of roadmap/moving-matter, decision 015; the experiment
// spin/member-dressing). Measurement only, doubles, no draw.
//
// THE MEMBER. The pair engine's member (code/measure/husk-meson singletEpsClosed, E-SPN-0173 and E-SPN-0200): on the
// husk quotient Z^3 its S branch has E(K) = f(g(K)), f(x) = arccos(cos m x), g(K) = (1/24) sum_d cos(K . rho_d) over
// the 24 roots' husk steps, a quasi-energy a cycle with rest m and, at c*^2 = 1/2 a cycle, M2 / M1 = tan m / m. The
// light's links enter by Peierls: the hop along root d picks the phase theta_d of the husk link it crosses, so the
// member is f(G(A)) with G(A) = (1/24) sum_d e^(i theta_d) T_d. A gauge change A -> A + G grad chi conjugates G(A) by
// e^(i q chi), so f(G(A)) keeps its levels exactly; the member's first and second orders in A are Daleckii-Krein
// divided differences of f along G's own eigenvalues g(K).
//
// THE LIGHT. darwin-exchange's husk light, the convention E-SPN-0169 and E-SPN-0200 read the Darwin term in:
// L = (1/2) Adot^T G^-1 Adot - (kappa / 2) A^T G^-1/2 H G^-1/2 A + J^T G^-1 A - rho phi, G = diag(HUSK_WEIGHTS). In the
// coordinates A~ = G^-1/2 A each non-gauge eigenvector v of H(k) (darwin-exchange huskModes, the midpoint convention
// A~_h(x) = v_h e^(i k . (x + u_h / 2)), checked by its gauge vector) is an oscillator of omega^2 = kappa lambda, so
// A~_h(x) = sum (v_h e^(i k . (x + u_h / 2)) a + h.c.) / sqrt(2 omega V). The coupling J^T G^-1 A gives the root
// crossing husk link h the phase theta = +- q A_h / g_h (so a uniform A_h = g_h u_h . A reads the Peierls K -> K + q A),
// Coulomb is q^2 / eps(k), eps = sum_h g_h 2 (1 - cos k . u_h) -> 6 k^2, so V = -alpha' / r gives q^2 = 24 pi alpha'
// (register-coulomb-track's alphaOf), and X -> 1 (the Darwin term at one speed) fixes kappa = c*^2 / (2/3) = 3/4.
//
// THE VERTEX. Emitting (k, lambda) from K to K' = K - k: <K'|delta G|K> = (q / 12) sum_h sqrt(g_h) conj(v_h) sin(P . u_h)
// / sqrt(2 omega V), P = K - k / 2 the midpoint momentum (each axis link carries 2 roots, each face diagonal 1, so the
// root count of link h is g_h); the member's vertex is f[g_K, g_K'] times it. For the gauge vector v_h ~ sqrt(g_h) 2 i
// sin(k . u_h / 2) it is q (E(K) - E(K')) times the gauge amplitude, the Ward identity.
//
// THE CUT. H restricted to {member} + {member, one photon} at fixed total K, to second order in q: the bare level
// carries the vacuum seagull, f'(g_K) <delta2 G> (the hops' Debye-Waller loss, -(q^2/24) sum_h <A~_h^2> cos(K . u_h))
// plus sum f[g_K, g_K', g_K] |<K'|delta G|K>|^2, and each one-photon state couples to it by the vertex. That Hamiltonian
// is a star, so its lowest level is the lowest root of the secular equation E - E(K) - S(K) = sum |V|^2 / (E - E(K') -
// omega), solved exactly (Newton with a bracket) on stored terms; its eigenvector has amplitudes V / (E - E_k) on the
// photon states, so the residual |H psi - E psi| / |psi| is the secular equation's own residual over |psi|, and the bare
// weight is Z = 1 / |psi|^2. Photon-photon scattering (A^2 between one-photon states) is order q^4 on the level and
// is outside the cut.
//
// SYMMETRY. The terms summed over the box's k depend on k only through orbits of the little group of K: O_h at K = 0,
// C4v (signed permutations of the two transverse axes) on the x axis. sectorMomenta keeps one k per orbit with its size.

import { huskModes } from '@/code/measure/darwin-exchange'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { gOf } from '@/code/measure/husk-meson'

export const KAPPA = 0.75
export const C_STAR2 = 0.5
const NH = HUSK_VECTORS.length
const SQRT_G = HUSK_WEIGHTS.map(Math.sqrt)

const dot3 = (a: readonly number[], b: readonly number[]): number =>
  a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!

/** The bare member level, E(K) = arccos(cos m g(K)). */
export const bareLevel = (m: number, K: readonly number[]): number =>
  Math.acos(Math.cos(m) * gOf(K))

// ---- the divided differences of f(x) = arccos(c x), stable for any pair (written through the angles) ----

/** f'(a), f[a, b] and f[a, b, a] from the angles al = acos(c a), be = acos(c b). */
export function dividedDifferences(
  c: number,
  al: number,
  be: number,
): { d1a: number; d11: number; d2: number } {
  const mu = (al + be) / 2
  const x = (al - be) / 2
  const s = Math.sin(mu)
  const sx = Math.sin(x)
  // x / sin x and sin x - x cos x, by series where they cancel
  const xs = Math.abs(x) < 1e-4 ? 1 + (x * x) / 6 : x / sx
  const x2 = x * x
  const cub =
    Math.abs(x) < 1e-2
      ? x * x2 * (1 / 3 - x2 / 30 + (x2 * x2) / 840 - (x2 * x2 * x2) / 45360)
      : sx - x * Math.cos(x)
  const sa = Math.sin(al)
  const d1a = -c / sa
  const d11 = (-c * xs) / s
  // f[a, b, a] = c^2 N / (2 s^2 sin al sin^2 x), N = s (sin x - x cos x) - x cos mu sin x; at x -> 0 it is f''(a) / 2
  let d2: number

  if (Math.abs(x) < 1e-6) {
    d2 = (-c * c * Math.cos(al)) / (2 * sa ** 3)
  } else {
    const N = s * cub - x * Math.cos(mu) * sx

    d2 = (c * c * N) / (2 * s * s * sa * sx * sx)
  }

  return { d1a, d11, d2 }
}

// ---- the photon modes ----

export type ModeSet = {
  /** the non-gauge modes: omega and the 9 link components (midpoint convention) */
  omega: number[]
  lambda: number[]
  re: number[][]
  im: number[][]
  /** the gauge vector (lambda ~ 0), when the box momentum has exactly one */
  gauge?: { re: number[]; im: number[] }
  /** the largest |<v_i, v_j> - delta_ij| over the 9 vectors */
  orthonormality: number
}

export function modeSet(k: readonly number[]): ModeSet {
  const md = huskModes(k)
  const top = Math.max(1, ...md.values.map(Math.abs))
  const out: ModeSet = {
    omega: [],
    lambda: [],
    re: [],
    im: [],
    orthonormality: 0,
  }
  const zero: number[] = []

  md.values.forEach((lambda, i) => {
    if (lambda <= 1e-9 * top) {
      zero.push(i)

      return
    }

    out.lambda.push(lambda)
    out.omega.push(Math.sqrt(KAPPA * lambda))
    out.re.push(md.re[i]!)
    out.im.push(md.im[i]!)
  })

  if (zero.length === 1) {
    out.gauge = { re: md.re[zero[0]!]!, im: md.im[zero[0]!]! }
  }

  for (let i = 0; i < NH; i++) {
    for (let j = 0; j < NH; j++) {
      let r = 0
      let s = 0

      for (let h = 0; h < NH; h++) {
        const ar = md.re[i]![h]!
        const ai = -md.im[i]![h]!
        const br = md.re[j]![h]!
        const bi = md.im[j]![h]!

        r += ar * br - ai * bi
        s += ar * bi + ai * br
      }

      out.orthonormality = Math.max(
        out.orthonormality,
        Math.hypot(r - (i === j ? 1 : 0), s),
      )
    }
  }

  return out
}

/** (12 / q) <K'|delta G|K> sqrt(2 omega V) for a link vector v: sum_h sqrt(g_h) conj(v_h) sin(P . u_h), complex. */
export function emission(
  P: readonly number[],
  re: readonly number[],
  im: readonly number[],
): [number, number] {
  let r = 0
  let s = 0

  for (let h = 0; h < NH; h++) {
    const w = SQRT_G[h]! * Math.sin(dot3(P, HUSK_VECTORS[h]!))

    r += w * re[h]!
    s -= w * im[h]!
  }

  return [r, s]
}

/** sum_h |v_h|^2 cos(K . u_h): the vacuum seagull's link sum for one mode. */
export function seagullLinks(
  K: readonly number[],
  re: readonly number[],
  im: readonly number[],
): number {
  let s = 0

  for (let h = 0; h < NH; h++) {
    s += (re[h]! ** 2 + im[h]! ** 2) * Math.cos(dot3(K, HUSK_VECTORS[h]!))
  }

  return s
}

// ---- the box momenta, one per orbit of the little group ----

/** 'none' keeps every box momentum (the reduction's own check). */
export type Sector = 'oh' | 'c4v' | 'none'

/** The integer momenta j (k = 2 pi j / L, j in the centered range) with one per orbit and the orbit's size. */
export function sectorMomenta(
  L: number,
  sector: Sector,
): { j: Int32Array; weight: Float64Array } {
  const lo = -Math.floor(L / 2)
  const wrap = (x: number): number => ((((x - lo) % L) + L) % L) + lo
  const seen = new Uint8Array(L * L * L)
  const idx = (a: number, b: number, c: number): number =>
    (a - lo) + L * ((b - lo) + L * (c - lo))
  const js: number[] = []
  const ws: number[] = []
  const perms3 = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const perms =
    sector === 'oh'
      ? perms3
      : sector === 'c4v'
        ? [
            [0, 1, 2],
            [0, 2, 1],
          ]
        : [[0, 1, 2]]

  for (let a = lo; a < lo + L; a++) {
    for (let b = lo; b < lo + L; b++) {
      for (let c = lo; c < lo + L; c++) {
        if (seen[idx(a, b, c)]) {
          continue
        }

        const v = [a, b, c]
        let n = 0

        for (const p of perms) {
          for (let sg = 0; sg < 8; sg++) {
            if (
              (sector === 'c4v' && (sg & 1) !== 0) ||
              (sector === 'none' && sg !== 0)
            ) {
              continue
            }

            const im = p.map((q, i) => wrap(((sg >> i) & 1 ? -1 : 1) * v[q]!))
            const t = idx(im[0]!, im[1]!, im[2]!)

            if (!seen[t]) {
              seen[t] = 1
              n++
            }
          }
        }

        js.push(a, b, c)
        ws.push(n)
      }
    }
  }

  return { j: Int32Array.from(js), weight: Float64Array.from(ws) }
}

// ---- the stored terms of one sector and the dressed level ----

export type Terms = {
  K: number[]
  L: number
  q: number
  m: number
  E0: number
  /** the bare level's second-order seagull: Debye-Waller and the f[a, b, a] sum */
  seagullDW: number
  seagull2: number
  /** per (orbit, mode): the orbit's weight, the one-photon state's energy E(K') + omega and |V|^2 (per state) */
  weight: Float64Array
  energy: Float64Array
  coupling: Float64Array
  threshold: number
  /** the largest gauge-pair second-order sum over its absolute scale (0 is exact gauge invariance) */
  gauge: number
  gaugeOrthogonality: number
  orthonormality: number
  /** the vacuum variance of a link's Peierls phase, q^2 <A~_h^2> / g_h, averaged over the 9 link types */
  theta2: number
  states: number
  orbits: number
}

/** Neumaier sum. */
class Sum {
  s = 0
  c = 0
  add(x: number): void {
    const t = this.s + x

    this.c += Math.abs(this.s) >= Math.abs(x) ? this.s - t + x : x - t + this.s
    this.s = t
  }
  get value(): number {
    return this.s + this.c
  }
}

/**
 * Every term of the member at total momentum K on the side-L box with charge q (q^2 = 24 pi alpha'). `sector` must be
 * the little group of K ('oh' only at K = 0, 'c4v' with K on the x axis).
 */
export function dressingTerms(input: {
  m: number
  q: number
  K: readonly number[]
  L: number
  sector: Sector
}): Terms {
  const { m, q, K, L, sector } = input
  const c = Math.cos(m)
  const V = L ** 3
  const al = bareLevel(m, K)
  const { j, weight: w } = sectorMomenta(L, sector)
  const orbits = w.length
  const weight = new Float64Array(orbits * 8)
  const energy = new Float64Array(orbits * 8)
  const coupling = new Float64Array(orbits * 8)
  const dw = new Sum()
  const s2 = new Sum()
  const th = new Sum()
  let gauge = 0
  let gaugeOrth = 0
  let ortho = 0
  let threshold = Infinity
  let states = 0
  const q2 = q * q

  // the gauge pair's second-order sum at k: Debye-Waller + f[a,b,a] |M|^2 + f[a,b]^2 |M|^2 / (E(K) - E(K'))
  const gaugePath = (
    k: readonly number[],
    g: { re: number[]; im: number[] },
  ): { value: number; scale: number } | undefined => {
    const Kp = [K[0]! - k[0]!, K[1]! - k[1]!, K[2]! - k[2]!]
    const be = bareLevel(m, Kp)

    if (Math.abs(al - be) < 1e-9) {
      return undefined
    }

    const P = [K[0]! - k[0]! / 2, K[1]! - k[1]! / 2, K[2]! - k[2]! / 2]
    const dd = dividedDifferences(c, al, be)
    const [mr, mi] = emission(P, g.re, g.im)
    const M2 = (q2 / 144) * (mr * mr + mi * mi)
    const t1 = dd.d1a * (-(q2 / 24) * seagullLinks(K, g.re, g.im))
    const t2 = dd.d2 * M2
    const t3 = (dd.d11 * dd.d11 * M2) / (al - be)

    return {
      value: t1 + t2 + t3,
      scale: Math.abs(t1) + Math.abs(t2) + Math.abs(t3),
    }
  }

  for (let o = 0; o < orbits; o++) {
    const jj = [j[3 * o]!, j[3 * o + 1]!, j[3 * o + 2]!]
    const k = jj.map(x => (2 * Math.PI * x) / L)
    const ms = modeSet(k)
    const Kp = [K[0]! - k[0]!, K[1]! - k[1]!, K[2]! - k[2]!]
    const P = [K[0]! - k[0]! / 2, K[1]! - k[1]! / 2, K[2]! - k[2]! / 2]
    const be = bareLevel(m, Kp)
    const dd = dividedDifferences(c, al, be)

    ortho = Math.max(ortho, ms.orthonormality)

    ms.omega.forEach((omega, i) => {
      const amp2 = 1 / (2 * omega * V)
      const [mr, mi] = emission(P, ms.re[i]!, ms.im[i]!)
      const M2 = (q2 / 144) * (mr * mr + mi * mi) * amp2
      const at = o * 8 + i

      weight[at] = w[o]!
      energy[at] = be + omega
      coupling[at] = dd.d11 * dd.d11 * M2
      dw.add(w[o]! * amp2 * seagullLinks(K, ms.re[i]!, ms.im[i]!))

      for (let h = 0; h < NH; h++) {
        th.add(
          (w[o]! * amp2 * (ms.re[i]![h]! ** 2 + ms.im[i]![h]! ** 2)) /
            HUSK_WEIGHTS[h]!,
        )
      }
      s2.add(w[o]! * dd.d2 * M2)
      threshold = Math.min(threshold, be + omega)
      states += w[o]!

      if (ms.gauge) {
        // the transverse modes carry no gauge component
        let r = 0
        let s = 0

        for (let h = 0; h < NH; h++) {
          r += ms.gauge.re[h]! * ms.re[i]![h]! + ms.gauge.im[h]! * ms.im[i]![h]!
          s += ms.gauge.re[h]! * ms.im[i]![h]! - ms.gauge.im[h]! * ms.re[i]![h]!
        }

        gaugeOrth = Math.max(gaugeOrth, Math.hypot(r, s))
      }
    })

    // the gauge pair k, -k (each from its own huskModes)
    if (ms.gauge && jj.some(x => x !== 0)) {
      const km = k.map(x => -x)
      const mm = modeSet(km)

      if (mm.gauge) {
        const a = gaugePath(k, ms.gauge)
        const b = gaugePath(km, mm.gauge)

        if (a && b) {
          gauge = Math.max(gauge, Math.abs(a.value + b.value) / (a.scale + b.scale))
        }
      }
    }
  }

  return {
    K: [...K],
    L,
    q,
    m,
    E0: al,
    seagullDW: dividedDifferences(c, al, al).d1a * (-(q2 / 24) * dw.value),
    seagull2: s2.value,
    weight,
    energy,
    coupling,
    threshold,
    gauge,
    gaugeOrthogonality: gaugeOrth,
    orthonormality: ortho,
    theta2: (q2 * th.value) / NH,
    states,
    orbits,
  }
}

export type Level = {
  E: number
  Z: number
  residual: number
  iterations: number
  belowThreshold: boolean
}

/** The lowest root of E - E0 - S = sum w |V|^2 / (E - E_k) below the threshold, by bracketed Newton. */
export function dressedLevel(t: Terms): Level {
  const S = t.seagullDW + t.seagull2
  const F = (E: number): { f: number; df: number } => {
    const f = new Sum()
    const df = new Sum()

    for (let i = 0; i < t.weight.length; i++) {
      const w = t.weight[i]!

      if (w === 0) {
        continue
      }

      const d = E - t.energy[i]!
      const x = (w * t.coupling[i]!) / d

      f.add(x)
      df.add(x / d)
    }

    return { f: E - t.E0 - S - f.value, df: 1 + df.value }
  }
  // F rises from -infinity (far below) to +infinity at the threshold; bracket below
  let hi = t.threshold - 1e-15 * Math.max(1, Math.abs(t.threshold))
  let lo = Math.min(t.E0 + S, hi) - 1

  while (F(lo).f > 0) {
    lo -= 2 * (hi - lo)
  }

  let E = Math.min(t.E0 + S, (lo + hi) / 2)

  if (E <= lo || E >= hi) {
    E = (lo + hi) / 2
  }

  let it = 0

  for (; it < 200; it++) {
    const { f, df } = F(E)

    if (f > 0) {
      hi = E
    } else {
      lo = E
    }

    let next = E - f / df

    if (!(next > lo && next < hi)) {
      next = (lo + hi) / 2
    }

    if (Math.abs(next - E) <= 1e-16 * Math.max(1, Math.abs(E))) {
      E = next
      break
    }

    E = next
  }

  const { f, df } = F(E)

  return {
    E,
    Z: 1 / df,
    residual: Math.abs(f) * Math.sqrt(1 / df),
    iterations: it,
    belowThreshold: E < t.threshold,
  }
}

/** M2 / M1 from dressed levels at K 0, K1, K1 / 2, K1 / 4 on the axis: three-level Richardson of (E(K) - E(0)) / K^2. */
export function ratioFromLevels(
  E0: number,
  steps: readonly number[],
  levels: readonly number[],
): { a: number; R: number } {
  const a = steps.map((K, i) => (levels[i]! - E0) / (K * K))
  const r1 = (4 * a[1]! - a[0]!) / 3
  const r2 = (4 * a[2]! - a[1]!) / 3
  const a3 = (16 * r2 - r1) / 15

  return { a: a3, R: C_STAR2 / (2 * a3 * E0) }
}
