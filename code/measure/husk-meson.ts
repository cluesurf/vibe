// THE LOVE-FEAR PAIR ON THE HUSK, HELD BY THE HUSK'S COULOMB LAW (E-SPN-0155). code/measure/swap-string carries the
// love and the fear of the swap-mixed rule on the empty mesh in their relative coordinate on a D4 ball, with a diagonal
// phase per site (its "string"). This file supplies what a Coulomb-bound pair needs beside it:
//
//   THE HUSK QUOTIENT. The D4 mesh with depth period 2, D4 / (L Z^3 + 2 Z e4) for a box, D4 / 2 Z e4 for the infinite
//   husk: a D4 point (a, b, c, d) is fixed by (a, b, c) in Z^3, since d = a + b + c mod 2. So its docks ARE the husk
//   lattice Z^3, and the 24 roots project onto its 18 steps: the 12 face diagonals once and the 6 axis steps twice
//   (e_i + e4 and e_i - e4). The root Laplacian of this quotient, sum over the 24 roots of (1 - cos k . rho) at k4 = 0,
//   is EXACTLY the husk light's static symbol (code/measure/husk-coulomb symbolAt 'husk', E-FRC-0241 P1), so the
//   Coulomb law of the husk light is the Green's function of the lattice the pair walks on. A member's momentum is
//   (q, 0) with q in the 3d zone [-pi, pi)^3, which covers both the k4 = 0 and the k4 = pi slices of the D4 zone.
//     huskBall        the relative coordinate y on the quotient within a husk radius, as a swap-sector Ball
//     huskBoxTables   the rule's tables on the side-L quotient box (L even), for the rule-against-model check
//   THE GREEN'S FUNCTION. huskGreenTable: D(y) = G(0) - G(y) of the infinite husk on a cube of offsets, from two tori
//   (L and 2L) summed exactly by the 3d FFT, each plus its uniform-background term |y|^2 / (36 L^3), then Richardson on
//   the L^-5 image term (the same estimator as husk-coulomb infiniteGreenDifferences, which sums the modes directly;
//   the caller checks the two agree). G(0) comes from husk-coulomb infiniteGreenZero.
//   THE POTENTIAL. setPotential writes the phase e^(-i s alpha (G(0) - G(y))) per site into the space's string array:
//   the Coulomb energy -alpha G(y) shifted by the constant alpha G(0), so the contact sites and the stores (which carry
//   no phase in mesonBeat) both sit at 0. A constant shift of every configuration changes no dynamics: the level's
//   true energy is the measured one minus alpha G(0).
//   THE CHANNELS. pairChannels: the closed-form two-member bands at total K = 0 (E-SPN-0147 point 4 with no mass
//   string: S = arccos(cos m g), D = -S, 11 F- at -m, 11 F+ at pi - m, member eps from the midpoint), and channelGap,
//   the circular distance from an energy to all of them.
//   THE SINGLE-CHANNEL MODEL (the prediction's solver). coulombModel: two S-band members, H(K) = eps_S(K/2 + q) +
//   eps_S(K/2 - q) + alpha D(y) on an N^3 torus of relative coordinates (minimum image), applied through the 3d FFT,
//   its lowest level by two-pass Lanczos. It keeps the members' exact band (no expansion) and the exact lattice
//   potential, and leaves out the flipped channels and the rule's contact map at y = 0: that is what the run tests.
//   floquetLevel is the same model as a BEAT, W = e^(-i V/2) e^(-i T) e^(-i V/2) (the rule applies the potential as a
//   phase a beat), its level filtered from the Lanczos vector: the prediction.
//   THE RUN'S HELPERS. modelStart places a model vector on the ball (both members in their dock's uniform mode);
//   huskVacuumRun runs the exact rule's vacuum on the quotient box.
//
// DETERMINISM: no random numbers; the Lanczos start is a placed exponential. FLOATS: the potential is transcendental,
// so this is a stated float stand-in, measured; the dock maps it rides on are read exactly from the rule elsewhere.
// NOTHING MOVES: the potential is a phase; the pieces hand values between slots of one dock and the stream takes each
// slot's value one dock along.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { tailCoefficient } from '@/code/measure/husk-coulomb'
import { fft3 } from '@/code/measure/standin-chemistry'
import { seaConfiguration } from '@/code/measure/pauli-mixer'
import { d4Steps, ePow, seaFactor, type Ball } from '@/code/measure/swap-sector'
import { type MesonSpace, type MesonState } from '@/code/measure/swap-string'
import { lockedState, sameConfiguration, type Branch, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { ringScale, swapMixedBeat, type RingUnit } from '@/code/rule/swap-mixer'

const ROOTS = rootsD4()

// the husk steps of the 24 roots (their first three components)
export const HUSK_STEPS: readonly (readonly number[])[] = ROOTS.map(r => [r[0] as number, r[1] as number, r[2] as number])

const mod2 = (x: number): number => ((x % 2) + 2) % 2

// the quotient point of a husk dock (a, b, c): its D4 representative with depth 0 or 1
export const huskPoint = (a: number, b: number, c: number): number[] => [a, b, c, mod2(a + b + c)]

export const huskRadius = (p: readonly number[]): number => Math.hypot(p[0] as number, p[1] as number, p[2] as number)

// ---- the ball and the box ----

// the relative coordinates within husk radius R (Euclidean, in the husk's lattice units), with the stream's step table;
// `radius` is the largest d4Steps of a point (the mass-string rows swap-string sizes by it)
export function huskBall(R: number): Ball {
  const points: number[][] = []
  const R2 = R * R

  for (let a = -R; a <= R; a++) for (let b = -R; b <= R; b++) for (let c = -R; c <= R; c++) if (a * a + b * b + c * c <= R2) points.push(huskPoint(a, b, c))

  const index = new Map(points.map((p, i) => [p.join(','), i]))
  const step = new Int32Array(points.length * 24)

  points.forEach((p, i) => {
    for (let d = 0; d < 24; d++) {
      const s = HUSK_STEPS[d] as readonly number[]

      step[i * 24 + d] = index.get(huskPoint((p[0] as number) + (s[0] as number), (p[1] as number) + (s[1] as number), (p[2] as number) + (s[2] as number)).join(',')) ?? -1
    }
  })

  let radius = 0

  for (const p of points) radius = Math.max(radius, d4Steps(p))

  return { radius, points, index, step }
}

// the side-L quotient box (L even): dock (a, b, c) at a + L b + L^2 c, slot d streams to the dock one husk step along
// root d; flat links, the contact 'pass' (as swap-sector flatBoxTables)
export function huskBoxTables(L: number): LockedTables {
  if (L % 2 !== 0) throw new Error('husk-meson: the quotient box needs an even side')

  const cells = L * L * L
  const target = new Int32Array(cells * 24)
  const source = new Int32Array(cells * 24)
  const move = new Int8Array(cells * 24 * 9)
  const m = (x: number): number => ((x % L) + L) % L

  for (let x = 0; x < cells; x++) {
    const a = x % L
    const b = Math.floor(x / L) % L
    const c = Math.floor(x / (L * L))

    for (let d = 0; d < 24; d++) {
      const s = HUSK_STEPS[d] as readonly number[]
      const y = m(a + (s[0] as number)) + L * m(b + (s[1] as number)) + L * L * m(c + (s[2] as number))
      const to = y * 24 + d

      target[x * 24 + d] = to
      source[to] = x * 24 + d
    }
  }

  for (let i = 0; i < cells * 24; i++) for (let p = 0; p < 9; p++) move[i * 9 + p] = p

  return { cells, collision: 'pass', veto: true, target, source, move, back: Int8Array.from(move) }
}

export const huskBoxCell = (L: number, a: number, b: number, c: number): number => {
  const m = (x: number): number => ((x % L) + L) % L

  return m(a) + L * m(b) + L * L * m(c)
}

// ---- the Green's function ----

// the husk symbol at a 3d momentum: sum over the 24 roots of (1 - cos k . rho), k4 = 0
export function huskSymbol(k: readonly number[]): number {
  let s = 0

  for (const h of HUSK_STEPS) s += 1 - Math.cos((k[0] as number) * (h[0] as number) + (k[1] as number) * (h[1] as number) + (k[2] as number) * (h[2] as number))

  return s
}

// D_L(y) = G_L(0) - G_L(y) on the side-L torus for every offset in the cube [-C, C]^3 (C < L / 2), by one inverse 3d FFT
function torusDifferenceCube(L: number, C: number): Float64Array {
  const re = new Float64Array(L * L * L)
  const im = new Float64Array(L * L * L)
  const step = (2 * Math.PI) / L

  for (let c = 0; c < L; c++) {
    for (let b = 0; b < L; b++) {
      for (let a = 0; a < L; a++) {
        if (a === 0 && b === 0 && c === 0) continue
        re[a + L * b + L * L * c] = 1 / huskSymbol([step * a, step * b, step * c])
      }
    }
  }

  fft3(re, im, L, true)

  const side = 2 * C + 1
  const out = new Float64Array(side * side * side)
  const g0 = re[0] as number
  const m = (x: number): number => ((x % L) + L) % L

  for (let c = -C; c <= C; c++) for (let b = -C; b <= C; b++) for (let a = -C; a <= C; a++) out[a + C + side * (b + C) + side * side * (c + C)] = g0 - (re[m(a) + L * m(b) + L * L * m(c)] as number)

  return out
}

export type GreenTable = { C: number; g0: number; value: Float64Array; small: Float64Array; large: Float64Array }

// D(y) = G(0) - G(y) of the infinite husk on the cube [-C, C]^3, from the tori L and 2L (C < L / 2): each plus its
// background |y|^2 / (6 a L^3) (a = 6), then Richardson on L^-5. g0 is G(0) (husk-coulomb infiniteGreenZero); outside
// the cube greenAt uses the closed form G = 1 / (24 pi r) + A(r-hat) / r^5 (E-FRC-0241 P2), whose next term is r^-7
export function huskGreenTable(L: number, C: number, g0: number): GreenTable {
  if (2 * C >= L) throw new Error('husk-meson: the cube must fit inside half the torus')

  const side = 2 * C + 1
  const s = torusDifferenceCube(L, C)
  const l = torusDifferenceCube(2 * L, C)
  const value = new Float64Array(s.length)
  const small = new Float64Array(s.length)
  const large = new Float64Array(s.length)

  for (let c = -C; c <= C; c++) {
    for (let b = -C; b <= C; b++) {
      for (let a = -C; a <= C; a++) {
        const i = a + C + side * (b + C) + side * side * (c + C)
        const r2 = a * a + b * b + c * c

        small[i] = (s[i] as number) + r2 / (36 * L ** 3)
        large[i] = (l[i] as number) + r2 / (36 * (2 * L) ** 3)
        value[i] = (32 * (large[i] as number) - (small[i] as number)) / 31
      }
    }
  }

  return { C, g0, value, small, large }
}

// the closed-form far field D(y) = G(0) - 1 / (24 pi r) - A(r-hat) / r^5
export const greenFar = (g0: number, a: number, b: number, c: number): number => {
  const r = Math.hypot(a, b, c)

  return g0 - 1 / (24 * Math.PI * r) - tailCoefficient('husk', [a, b, c]) / r ** 5
}

// D(y): the table inside its cube, the closed form outside it
export function greenAt(t: GreenTable, a: number, b: number, c: number): number {
  const side = 2 * t.C + 1

  if (Math.abs(a) > t.C || Math.abs(b) > t.C || Math.abs(c) > t.C) return greenFar(t.g0, a, b, c)

  return t.value[a + t.C + side * (b + t.C) + side * side * (c + t.C)] as number
}

// ---- the potential on a meson space ----

// the Coulomb phase per site: e^(-i s alpha D(y)), s the sign that makes it an energy (swap-string stringSign with a
// positive angle: s = the singlet's sign), alpha the coupling of V(y) = -alpha G(y) -> -alpha / (24 pi r)
export function setPotential(space: MesonSpace, table: GreenTable, alpha: number, s: number): void {
  space.ball.points.forEach((p, i) => {
    const ph = -s * alpha * greenAt(table, p[0] as number, p[1] as number, p[2] as number)

    space.string[2 * i] = Math.cos(ph)
    space.string[2 * i + 1] = Math.sin(ph)
  })
}

// ---- readings on the husk ball ----

// the weight within husk radius R (stores count at 0)
export function weightWithinRadius(ball: Ball, s: MesonState, R: number): number {
  const n = ball.points.length
  let w = 0

  for (let i = 0; i < n; i++) {
    if (huskRadius(ball.points[i] as number[]) > R) continue
    for (let j = 0; j < 576; j++) w += (s.re[i * 576 + j] as number) ** 2 + (s.im[i * 576 + j] as number) ** 2
  }
  for (let j = 0; j < 24; j++) w += (s.re[n * 576 + j] as number) ** 2 + (s.im[n * 576 + j] as number) ** 2

  return w
}

// the weight in unit shells of husk radius, shell k holding k - 1/2 < r <= k + 1/2 (stores in shell 0)
export function huskShells(ball: Ball, s: MesonState): number[] {
  const n = ball.points.length
  let top = 0

  for (const p of ball.points) top = Math.max(top, Math.round(huskRadius(p)))

  const out = new Array<number>(top + 1).fill(0)

  for (let i = 0; i < n; i++) {
    let w = 0

    for (let j = 0; j < 576; j++) w += (s.re[i * 576 + j] as number) ** 2 + (s.im[i * 576 + j] as number) ** 2
    out[Math.round(huskRadius(ball.points[i] as number[]))]! += w
  }
  for (let j = 0; j < 24; j++) out[0]! += (s.re[n * 576 + j] as number) ** 2 + (s.im[n * 576 + j] as number) ** 2

  return out
}

// the mean husk radius of a state
export function meanRadius(ball: Ball, s: MesonState): number {
  const shells = huskShells(ball, s)

  return shells.reduce((a, w, k) => a + w * k, 0) / shells.reduce((a, w) => a + w, 0)
}

// a start on the ball from a model vector on its N^3 torus (psi real, minimum image): every slot pair of a site takes
// psi(y) (both members in their dock's uniform mode; at contact the two slots distinct), zero where some |y_i| >= N / 2;
// normalized, no store
export function modelStart(ball: Ball, psi: Float64Array, N: number): MesonState {
  const n = ball.points.length
  const s: MesonState = { re: new Float64Array(n * 576 + 24), im: new Float64Array(n * 576 + 24) }
  const m = (x: number): number => ((x % N) + N) % N
  let w = 0

  ball.points.forEach((p, i) => {
    const [a, b, c] = p as [number, number, number]

    if (Math.abs(a) >= N / 2 || Math.abs(b) >= N / 2 || Math.abs(c) >= N / 2) return

    const x = psi[m(a) + N * m(b) + N * N * m(c)] as number
    const contact = a === 0 && b === 0 && c === 0

    for (let l = 0; l < 24; l++) {
      for (let f = 0; f < 24; f++) {
        if (contact && l === f) continue
        s.re[i * 576 + l * 24 + f] = x
        w += x * x
      }
    }
  })

  const k = 1 / Math.sqrt(w)

  for (let i = 0; i < s.re.length; i++) s.re[i] = (s.re[i] as number) * k

  return s
}

// the vacuum of the exact rule on the side-L quotient box at unit u for `beats` beats: the empty mesh (sea 0) or the
// love sea (sea 1). exact: one branch equal to the vacuum with amplitude S^cells (the sea factor F^cells) every beat
export function huskVacuumRun(u: RingUnit, L: number, sea: 0 | 1, beats: number): { L: number; sea: number; exact: boolean; charged: number } {
  const tab = huskBoxTables(L)
  const c0 = seaConfiguration(tab.cells, sea)
  const factor: [bigint, bigint] = sea === 0 ? [ringScale(u) ** BigInt(tab.cells), 0n] : ePow(seaFactor(u), tab.cells)
  let s: LockedState = lockedState(c0)
  let exact = true
  let charged = 0

  for (let t = 0; t < beats; t++) {
    s = swapMixedBeat('none', tab, s, t, u)

    const br = s.branches[0] as Branch

    if (s.branches.length !== 1 || !sameConfiguration(br, c0) || br.k !== 0 || br.a !== factor[0] || br.b !== factor[1]) {
      exact = false
      break
    }

    for (let i = 0; i < tab.cells * 24; i++) if (br.vibe[i] !== c0.vibe[i]) charged++
    br.a = 1n
    br.b = 0n
  }

  return { L, sea, exact, charged }
}

// ---- the channels ----

// the top of the singlet branch above its rest level at mass m (g = -1/3)
export const kmaxOf = (m: number): number => Math.PI / 2 - m + Math.asin(Math.cos(m) / 3)

// g(q) = (1/24) sum_d cos(q . rho_d) at a 3d momentum (q4 = 0)
export function gOf(q: readonly number[]): number {
  let s = 0

  for (const h of HUSK_STEPS) s += Math.cos((q[0] as number) * (h[0] as number) + (q[1] as number) * (h[1] as number) + (q[2] as number) * (h[2] as number))

  return s / 24
}

// the singlet branch's member eps (from the midpoint) at a 3d momentum: arccos(cos m g)
export const singletEpsClosed = (m: number, q: readonly number[]): number => Math.acos(Math.cos(m) * gOf(q))

export type Channel = { name: string; lo: number; hi: number }

// the two-member channels at total K = 0, as closed ranges of pair eps (not reduced mod 2 pi): S in [m, m + kmax],
// D = -S, F- = -m, F+ = pi - m; S(p) + D(-p) = 0 exactly
export function pairChannels(m: number): Channel[] {
  const k = kmaxOf(m)

  return [
    { name: 'SS', lo: 2 * m, hi: 2 * m + 2 * k },
    { name: 'SD', lo: 0, hi: 0 },
    { name: 'SF-', lo: 0, hi: k },
    { name: 'SF+', lo: Math.PI, hi: Math.PI + k },
    { name: 'DD', lo: -2 * m - 2 * k, hi: -2 * m },
    { name: 'DF-', lo: -2 * m - k, hi: -2 * m },
    { name: 'DF+', lo: Math.PI - 2 * m - k, hi: Math.PI - 2 * m },
    { name: 'F-F-', lo: -2 * m, hi: -2 * m },
    { name: 'F+F+', lo: 2 * Math.PI - 2 * m, hi: 2 * Math.PI - 2 * m },
    { name: 'F-F+', lo: Math.PI - 2 * m, hi: Math.PI - 2 * m },
  ]
}

// the circular distance from E to a channel shifted by V (0 inside it)
export function channelDistance(E: number, c: Channel, V = 0): number {
  const lo = c.lo + V
  const hi = c.hi + V
  let best = Infinity

  for (let j = -3; j <= 3; j++) {
    const e = E + 2 * Math.PI * j

    best = Math.min(best, e < lo ? lo - e : e > hi ? e - hi : 0)
  }

  return best
}

// the nearest channel to E (optionally excluding some), and its distance
export function channelGap(E: number, channels: readonly Channel[], exclude: readonly string[] = []): { name: string; distance: number } {
  let out = { name: '', distance: Infinity }

  for (const c of channels) {
    if (exclude.includes(c.name)) continue

    const d = channelDistance(E, c)

    if (d < out.distance) out = { name: c.name, distance: d }
  }

  return out
}

// ---- the single-channel model ----

export type ModelLevel = { E: number; converged: number; steps: number; psi: Float64Array; N: number; shells: number[]; meanR: number; beyond: (R: number) => number; q2: number }

// the lowest level of H = T_K(q) + alpha D(y) on an N^3 torus of relative coordinates (N a power of 2, minimum image),
// T_K(q) = eps_S(K/2 + q) + eps_S(K/2 - q) the two S members' band, D from the table (|y_i| <= N / 2 needs C >= N / 2).
// E is the SHIFTED energy (the true one is E - alpha G(0)). Two-pass Lanczos from exp(-|y| / start) with `steps`
// steps; `converged` is the change of the lowest Ritz value over the last 20 steps
export function coulombModel(input: { m: number; alpha: number; table: GreenTable; N: number; K: readonly number[]; steps: number; start: number }): ModelLevel {
  const { m, alpha, table, N, K, steps, start } = input
  const size = N * N * N
  const T = new Float64Array(size)
  const V = new Float64Array(size)
  const w = (2 * Math.PI) / N
  const img = (x: number): number => (x >= N / 2 ? x - N : x)

  for (let c = 0; c < N; c++) {
    for (let b = 0; b < N; b++) {
      for (let a = 0; a < N; a++) {
        const i = a + N * b + N * N * c
        const q = [w * a, w * b, w * c]

        T[i] = singletEpsClosed(m, [(K[0] as number) / 2 + (q[0] as number), (K[1] as number) / 2 + (q[1] as number), (K[2] as number) / 2 + (q[2] as number)]) + singletEpsClosed(m, [(K[0] as number) / 2 - (q[0] as number), (K[1] as number) / 2 - (q[1] as number), (K[2] as number) / 2 - (q[2] as number)])
        V[i] = alpha * greenAt(table, img(a), img(b), img(c))
      }
    }
  }

  const re = new Float64Array(size)
  const im = new Float64Array(size)
  const apply = (x: Float64Array, out: Float64Array): void => {
    re.set(x)
    im.fill(0)
    fft3(re, im, N, false)
    for (let i = 0; i < size; i++) {
      re[i] = (re[i] as number) * (T[i] as number)
      im[i] = (im[i] as number) * (T[i] as number)
    }
    fft3(re, im, N, true)
    for (let i = 0; i < size; i++) out[i] = (re[i] as number) + (V[i] as number) * (x[i] as number)
  }
  const v0 = new Float64Array(size)

  for (let c = 0; c < N; c++) for (let b = 0; b < N; b++) for (let a = 0; a < N; a++) v0[a + N * b + N * N * c] = Math.exp(-Math.hypot(img(a), img(b), img(c)) / start)

  const norm = (x: Float64Array): number => Math.sqrt(x.reduce((s, y) => s + y * y, 0))
  const n0 = norm(v0)

  for (let i = 0; i < size; i++) v0[i] = (v0[i] as number) / n0

  // pass 1: the tridiagonal
  const alphas: number[] = []
  const betas: number[] = []
  const ritz: number[] = []
  {
    let prev = new Float64Array(size)
    let cur = Float64Array.from(v0)
    const hv = new Float64Array(size)
    let beta = 0

    for (let j = 0; j < steps; j++) {
      apply(cur, hv)

      let a = 0

      for (let i = 0; i < size; i++) a += (cur[i] as number) * (hv[i] as number)
      for (let i = 0; i < size; i++) hv[i] = (hv[i] as number) - a * (cur[i] as number) - beta * (prev[i] as number)
      alphas.push(a)

      const b = norm(hv)

      if (j % 10 === 9 || j === steps - 1) ritz.push(lowestTridiagonal(alphas, betas).value)
      if (j === steps - 1 || b < 1e-14) break
      betas.push(b)
      prev = cur
      cur = Float64Array.from(hv, x => x / b)
      beta = b
    }
  }

  const low = lowestTridiagonal(alphas, betas)
  // pass 2: the Ritz vector
  const psi = new Float64Array(size)
  {
    let prev = new Float64Array(size)
    let cur = Float64Array.from(v0)
    const hv = new Float64Array(size)

    for (let j = 0; j < alphas.length; j++) {
      const cj = low.vector[j] as number

      for (let i = 0; i < size; i++) psi[i] = (psi[i] as number) + cj * (cur[i] as number)
      if (j === alphas.length - 1) break
      apply(cur, hv)

      const bPrev = j > 0 ? (betas[j - 1] as number) : 0

      for (let i = 0; i < size; i++) hv[i] = (hv[i] as number) - (alphas[j] as number) * (cur[i] as number) - bPrev * (prev[i] as number)

      const b = betas[j] as number

      prev = cur
      cur = Float64Array.from(hv, x => x / b)
    }
  }

  const pn = norm(psi)

  for (let i = 0; i < size; i++) psi[i] = (psi[i] as number) / pn

  const top = Math.ceil(Math.hypot(N / 2, N / 2, N / 2)) + 1
  const shells = new Array<number>(top + 1).fill(0)
  const radius = new Float64Array(size)

  for (let c = 0; c < N; c++) {
    for (let b = 0; b < N; b++) {
      for (let a = 0; a < N; a++) {
        const i = a + N * b + N * N * c
        const r = Math.hypot(img(a), img(b), img(c))

        radius[i] = r
        shells[Math.round(r)]! += (psi[i] as number) ** 2
      }
    }
  }

  // <q^2> = sum |psi(q)|^2 |q|^2 over the zone (q taken in [-pi, pi)^3)
  re.set(psi)
  im.fill(0)
  fft3(re, im, N, false)

  let q2 = 0
  let tot = 0

  for (let c = 0; c < N; c++) {
    for (let b = 0; b < N; b++) {
      for (let a = 0; a < N; a++) {
        const i = a + N * b + N * N * c
        const p = (re[i] as number) ** 2 + (im[i] as number) ** 2

        q2 += p * (w * w * (img(a) ** 2 + img(b) ** 2 + img(c) ** 2))
        tot += p
      }
    }
  }

  const drift = ritz.length > 2 ? Math.abs((ritz[ritz.length - 1] as number) - (ritz[ritz.length - 3] as number)) : Infinity

  return {
    E: low.value,
    converged: drift,
    steps: alphas.length,
    psi,
    N,
    shells,
    meanR: shells.reduce((s, x, k) => s + x * k, 0),
    beyond: (R: number) => {
      let s = 0

      for (let i = 0; i < size; i++) if ((radius[i] as number) > R) s += (psi[i] as number) ** 2

      return s
    },
    q2: q2 / tot,
  }
}

// ---- the single-channel model as a beat ----
//
// The rule applies the potential as a phase a beat, not as a term of a Hamiltonian, so the faithful single-channel model
// is the unitary W = e^(-i V/2) e^(-i T) e^(-i V/2) (the same spectrum as e^(-i V) e^(-i T), the rule's order, by a
// similarity), whose levels differ from those of T + V at second order in the commutators. floquetLevel filters a start
// at a guessed eps (W v = e^(-i eps) v) with the Blackman-Harris window over S beats, then reads eps from <v|W v>.

export type FloquetSpace = { N: number; T: Float64Array; half: Float64Array; re: Float64Array; im: Float64Array }

export function floquetSpace(input: { m: number; alpha: number; table: GreenTable; N: number; K: readonly number[] }): FloquetSpace {
  const { m, alpha, table, N, K } = input
  const size = N * N * N
  const T = new Float64Array(size)
  const half = new Float64Array(2 * size)
  const w = (2 * Math.PI) / N
  const img = (x: number): number => (x >= N / 2 ? x - N : x)

  for (let c = 0; c < N; c++) {
    for (let b = 0; b < N; b++) {
      for (let a = 0; a < N; a++) {
        const i = a + N * b + N * N * c
        const q = [w * a, w * b, w * c]
        const v = alpha * greenAt(table, img(a), img(b), img(c))

        T[i] = singletEpsClosed(m, [(K[0] as number) / 2 + (q[0] as number), (K[1] as number) / 2 + (q[1] as number), (K[2] as number) / 2 + (q[2] as number)]) + singletEpsClosed(m, [(K[0] as number) / 2 - (q[0] as number), (K[1] as number) / 2 - (q[1] as number), (K[2] as number) / 2 - (q[2] as number)])
        half[2 * i] = Math.cos(-v / 2)
        half[2 * i + 1] = Math.sin(-v / 2)
      }
    }
  }

  return { N, T, half, re: new Float64Array(size), im: new Float64Array(size) }
}

// out = W x (x and out complex, length N^3; out may not alias x)
export function floquetApply(s: FloquetSpace, xr: Float64Array, xi: Float64Array, or: Float64Array, oi: Float64Array): void {
  const size = s.T.length
  const { re, im, half, T } = s

  for (let i = 0; i < size; i++) {
    const c = half[2 * i] as number
    const n = half[2 * i + 1] as number

    re[i] = (xr[i] as number) * c - (xi[i] as number) * n
    im[i] = (xr[i] as number) * n + (xi[i] as number) * c
  }
  fft3(re, im, s.N, false)
  for (let i = 0; i < size; i++) {
    const c = Math.cos(-(T[i] as number))
    const n = Math.sin(-(T[i] as number))
    const r = re[i] as number

    re[i] = r * c - (im[i] as number) * n
    im[i] = r * n + (im[i] as number) * c
  }
  fft3(re, im, s.N, true)
  for (let i = 0; i < size; i++) {
    const c = half[2 * i] as number
    const n = half[2 * i + 1] as number

    or[i] = (re[i] as number) * c - (im[i] as number) * n
    oi[i] = (re[i] as number) * n + (im[i] as number) * c
  }
}

const BH4 = [0.35875, 0.48829, 0.14128, 0.01168]

export type FloquetLevel = { eps: number; residual: number; vr: Float64Array; vi: Float64Array }

// the level near eps0 from a start (vr, vi): `passes` filters of S beats, each at the eps the previous one read
export function floquetLevel(s: FloquetSpace, startRe: Float64Array, startIm: Float64Array, eps0: number, S: number, passes: number): FloquetLevel {
  const size = s.T.length
  let vr = Float64Array.from(startRe)
  let vi = Float64Array.from(startIm)
  let eps = eps0
  let residual = Infinity
  const ar = new Float64Array(size)
  const ai = new Float64Array(size)
  const br = new Float64Array(size)
  const bi = new Float64Array(size)

  for (let p = 0; p < passes; p++) {
    const fr = new Float64Array(size)
    const fi = new Float64Array(size)

    ar.set(vr)
    ai.set(vi)

    for (let t = 0; t < S; t++) {
      if (t > 0) {
        floquetApply(s, ar, ai, br, bi)
        ar.set(br)
        ai.set(bi)
      }

      const x = (2 * Math.PI * t) / (S - 1)
      const win = (BH4[0] as number) - (BH4[1] as number) * Math.cos(x) + (BH4[2] as number) * Math.cos(2 * x) - (BH4[3] as number) * Math.cos(3 * x)
      const c = Math.cos(eps * t) * win
      const n = Math.sin(eps * t) * win

      for (let i = 0; i < size; i++) {
        fr[i] = (fr[i] as number) + (ar[i] as number) * c - (ai[i] as number) * n
        fi[i] = (fi[i] as number) + (ar[i] as number) * n + (ai[i] as number) * c
      }
    }

    let nn = 0

    for (let i = 0; i < size; i++) nn += (fr[i] as number) ** 2 + (fi[i] as number) ** 2
    nn = Math.sqrt(nn)
    vr = Float64Array.from(fr, x => x / nn)
    vi = Float64Array.from(fi, x => x / nn)
    floquetApply(s, vr, vi, br, bi)

    let lr = 0
    let li = 0

    for (let i = 0; i < size; i++) {
      lr += (vr[i] as number) * (br[i] as number) + (vi[i] as number) * (bi[i] as number)
      li += (vr[i] as number) * (bi[i] as number) - (vi[i] as number) * (br[i] as number)
    }

    let r = 0

    for (let i = 0; i < size; i++) {
      const er = (br[i] as number) - (lr * (vr[i] as number) - li * (vi[i] as number))
      const ei = (bi[i] as number) - (lr * (vi[i] as number) + li * (vr[i] as number))

      r += er * er + ei * ei
    }

    eps = -Math.atan2(li, lr)
    residual = Math.sqrt(r)
  }

  return { eps, residual, vr, vi }
}

// the lowest eigenvalue of the symmetric tridiagonal (diagonal a, off-diagonal b) by Sturm bisection, and its unit
// eigenvector by inverse iteration
export function lowestTridiagonal(a: readonly number[], b: readonly number[]): { value: number; vector: Float64Array } {
  const n = a.length
  let lo = Infinity
  let hi = -Infinity

  for (let i = 0; i < n; i++) {
    const r = (i > 0 ? Math.abs(b[i - 1] as number) : 0) + (i < n - 1 ? Math.abs(b[i] as number) : 0)

    lo = Math.min(lo, (a[i] as number) - r)
    hi = Math.max(hi, (a[i] as number) + r)
  }

  const below = (x: number): number => {
    let k = 0
    let q = 0

    for (let i = 0; i < n; i++) {
      const d = (a[i] as number) - x

      q = i === 0 ? d : d - (b[i - 1] as number) ** 2 / (q === 0 ? 1e-300 : q)
      if (q < 0) k++
    }

    return k
  }

  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2

    if (below(mid) >= 1) hi = mid
    else lo = mid
  }

  const value = (lo + hi) / 2
  let x = new Float64Array(n).fill(1)

  for (let it = 0; it < 4; it++) {
    const shift = value - 1e-10 * Math.max(1, Math.abs(value))
    const cp = new Float64Array(n)
    const dp = new Float64Array(n)
    const y = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      const lower = i > 0 ? (b[i - 1] as number) : 0
      const den = (a[i] as number) - shift - lower * (i > 0 ? (cp[i - 1] as number) : 0)

      cp[i] = (i < n - 1 ? (b[i] as number) : 0) / den
      dp[i] = ((x[i] as number) - lower * (i > 0 ? (dp[i - 1] as number) : 0)) / den
    }
    for (let i = n - 1; i >= 0; i--) y[i] = (dp[i] as number) - (cp[i] as number) * (i < n - 1 ? (y[i + 1] as number) : 0)

    const nn = Math.sqrt(y.reduce((s, v) => s + v * v, 0))

    x = Float64Array.from(y, v => v / nn)
  }

  return { value, vector: x }
}
