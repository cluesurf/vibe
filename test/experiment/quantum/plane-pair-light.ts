// E-QTM-0181: A BOUND PAIR AND ITS LIGHT AS ONE EXACT QUANTUM DYNAMICS, IN THE PLANE: DOES THE MOVING LIGHT ADD TO THE
// PAIR'S INERTIA ONLY BEYOND THE DARWIN EXCHANGE?
//
// THE QUESTION. On the candidate rule with the register, a light pair held by the light's pull keeps an inertia
// remainder that falls as about 1/a_B (E-SPN-0208, E-SPN-0209), first order in the coupling at fixed member mass. The
// exact 3d pair-plus-light run is out of reach (about 4e12 amplitudes). It was set aside by power counting: E-SPN-0169
// showed the light's Coulomb and transverse kernels are one Maxwell form, so the moving field's first new term is the
// Darwin exchange, second order in the coupling in 3d and already in R_full, and the light cannot supply a 1/a_B term.
// That claim was not tested. This file tests it exactly where the whole problem is small.
//
// WHY THE PLANE AND NOT THE LINE. On a line Gauss's law fixes the whole field from the charges (in Coulomb gauge there
// is no transverse light; only the torus holonomy is left, which a pair at rest does not see). The dynamical light IS
// the static pull there, and the Darwin term is zero, so a line cannot tell the two sides of the claim apart. The
// plane is the lowest dimension with a transverse photon (one polarization).
//
// THE MODEL (code/measure/plane-light-pair, full statement in its header). An L x L torus. Two members of charge +1
// and -1 hop across links with amplitude t and rest energy M0, set so a lone member has the rule member's M0 and R =
// tan m / m (ringUnit(-5, 1), code/measure/register-track's member: M0 0.854058, tan m / m 1.065572) at the light's
// speed c = c* = sqrt(1/2) (one speed). Gauss's law is solved exactly (Coulomb gauge): the pull g^2 (G(0) - G(r)), G
// the plane's lattice Green function, and the transverse light quantized, omega_q = c |s_q|. A hop across a link
// carries E-SPN-0169's exact Peierls phase e^(-i e g A_l), the whole exponential (normal-ordered displacement
// operators with the Debye-Waller factor of every mode), cut only by the photon number N. Total momentum P is kept.
//
// WHAT DIFFERS FROM 3D, stated before the run. (1) The plane pull is logarithmic, so a level's size grows as
// sqrt(a_B), and the Darwin term itself is FIRST order in the coupling here (the virial gives <T> = g^2 / (4 pi),
// v^2 / c^2 ~ g^2), where in 3d it is second order. What carries over is the claim's real content: beyond the
// instantaneous Darwin exchange, the light's dynamics adds nothing at first order in the coupling. So a_B is defined
// by the coupling, a_B = 2 pi / (mu g^2) (the log coefficient g^2 / 2 pi equal to 1 / (mu a_B)), proportional to 1 /
// g^2 at fixed member as the 3d count's alphaOf is: exponent -1 means first order in the coupling, -2 second order,
// in the plane as in 3d. (2) One transverse polarization, not two. (3) The member is a hop band with the rule
// member's M0 and R, not the 192-band register walk, and the time is continuous; the light's uniform mode is left
// out. (4) The 3d R_full adds the Darwin term as E-SPN-0169's formula; here (a) adds it as an operator, the
// instantaneous one-photon exchange between the two members built from the same vertices as (b).
//
// THE TWO READINGS. R = c^2 / (2 a E0), E(P) = E0 + a P^2 read at P 0, 0.04, 0.08 (Richardson), each level the
// lowest of its momentum sector by Lanczos.
//   (a) static pull plus the Darwin exchange, bare members
//   (b) the full dynamical light, photon number up to N
//   Delta(a_B) = R_b - R_a; the remainder scale rho(a_B) = R_a - tan m / m (the analogue of the 3d gap R_full - tan
//   m / m)
//
// PLAN. a_B 8, 16, 32, 64 on main boxes L 24, 32, 48, 64 (about 12 level radii) at N = 1, finite-size boxes L 18, 24,
// 36, 48. Photon number: L 16 at a_B 8 and 16 with N = 1, 2; read (gating nothing) L 8 at a_B 8 with N = 1, 2, 3.
//
// GATES (pre-registered 2026-10-20, before any (b) or Delta was computed):
//   I0 instruments   every engine Hermitian on the symmetric photon space to 1e-12 (6 engines); the lone member's
//                    one-photon vertex equal to 2 t DW e g u_q sin(P_d - q_d / 2) to 1e-12 (the current the light
//                    reads is the group velocity at the midpoint); light off (g 0) the pair's R equal to tan m / m
//                    to 1e-8 and the lone member's to 1e-7 (Richardson's P^6 residue)
//   I1 levels        every Lanczos residual at most 1e-9, every d(P) / d(P / 2) within 0.1 of 4
//   I2 finite size   |Delta(L) - Delta(L')| <= 0.1 |Delta(L)| at every a_B
//   I3 photon number |Delta(N 2) - Delta(N 1)| <= 0.1 |Delta(N 1)| at a_B 8 and 16 on L 16
//   C1 control       the transverse light off (gT 0, the pull kept): (b) equals the static pull's R to 1e-6. (The
//                    brief's "off reproduces (a) to 1e-6": with the transverse light off there is no Darwin term
//                    either, so the comparison is with (a) less its Darwin term.)
//   THE FIT          p = least-squares slope of ln |Delta| against ln a_B over the 4 points, Delta one sign
//   PASS (the claim holds)      p in [-2.5, -1.5] and |Delta| < rho / 2 at every a_B
//   FAIL (the claim refuted)    p in [-1.5, -0.5]
//   PARTIAL otherwise (p outside both, or Delta changing sign); and at most PARTIAL if I0 to I3 or C1 fail
// READ, gating nothing: the lone member's own dressing Delta_1 = R_lone(b) - tan m / m and its exponent; the binding
// part Delta - Delta_1 R_a / tan m / m and its exponent; the Darwin term's own shift R_a - R_static and its exponent
// (first order in the plane, so near -1); the N = 3 read.
// PREDICTED. The claim under test predicts p near -2. This builder's expectation, written before the run: p near -1,
// from the members' own dressing, which the power counting leaves out: the Debye-Waller factor of the exact phase
// cuts every hop by 1 - O(g^2) (the probe read DW 0.917 at a_B 8 on L 8) while the rest energy stays, and the
// one-photon cloud adds inertia at first order too. So predicted FAIL, unless the dressing cancels in R.
//
// PROBES, disclosed: tmp/qtm-probe.log, tmp/qtm-probe2.log (Hermiticity, the vertex, light off, timing; no (b) level
// read). The first probe's Hermiticity test failed at N 2 and 3 because its test vectors were not symmetric in the
// photon labels (the operators act on the symmetric space); with symmetrized vectors 1.3e-14 and 2.7e-14.
//
// Depth L2: a known construction (lattice QED in Coulomb gauge with the exact Peierls phase) on a stand-in member,
// testing a claim about the 3d rule's reading, not the rule itself.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { newCx, type Cx } from '@/code/algebra/linear/complex-vector'
import {
  couplingOf,
  slabCouplingOf,
  embedStart,
  gaussianStart,
  lowestState,
  planeLight,
  readInertia,
  ruleMember,
  type InertiaRead,
  type PlaneLight,
  type PlaneLightSpec,
} from '@/code/measure/plane-light-pair'

const C = Math.SQRT1_2
const LIGHT: readonly [number, number] = [-5, 1]
const KAPPA = 0.08
const TOLERANCE = 1e-10
const MAX_STEPS = 4000

export const A_B = [8, 16, 32, 64] as const
export const MAIN_L: Record<number, number> = { 8: 24, 16: 32, 32: 48, 64: 64 }
export const CHECK_L: Record<number, number> = { 8: 18, 16: 24, 32: 36, 64: 48 }

// Z: the slab light's depth (E-QTM-0182); absent for the plane light
export type PairKey = { aB: number; L: number; N: number; Z?: number }

export const PAIR_KEYS: PairKey[] = [
  ...A_B.map(aB => ({ aB, L: MAIN_L[aB]!, N: 1 })),
  ...A_B.map(aB => ({ aB, L: CHECK_L[aB]!, N: 1 })),
  { aB: 8, L: 16, N: 1 },
  { aB: 8, L: 16, N: 2 },
  { aB: 16, L: 16, N: 1 },
  { aB: 16, L: 16, N: 2 },
  { aB: 8, L: 8, N: 1 },
  { aB: 8, L: 8, N: 2 },
  { aB: 8, L: 8, N: 3 },
]

export const keyName = (k: PairKey): string =>
  k.Z ? `slab-a${k.aB}-L${k.L}-Z${k.Z}-N${k.N}` : `a${k.aB}-L${k.L}-N${k.N}`

const gOf = (k: PairKey): number => (k.Z ? slabCouplingOf(member.mu, k.aB) : couplingOf(member.mu, k.aB))

type Read = InertiaRead

export type PairPart = {
  key: PairKey
  g: number
  debyeWaller: number
  static: Read
  darwin: Read
  quantum: Read
  lone: Read
  // the whole zero-frequency transverse exchange (mutual plus each member's own); the slab parts carry it
  magneto?: Read
  seconds: number
}

const member = ruleMember({ light: LIGHT, c: C })

const specOf = (k: PairKey, light: PlaneLightSpec['light'], members: 1 | 2): Omit<PlaneLightSpec, 'P'> => ({
  L: k.L,
  c: C,
  g: gOf(k),
  t: member.t,
  M0: member.M0,
  nMax: light === 'quantum' ? k.N : 0,
  members,
  light,
  ...(k.Z ? { depth: k.Z, selfEnergy: false } : {}),
})

// the start of every pair level: the Darwin engine's ground state at the same P (the static pull's in the slab), from
// a Gaussian of the level's size
// (memoized per P: the start only speeds the Lanczos run, the level it returns is the sector's lowest to tolerance)
function darwinStart(k: PairKey): (e: PlaneLight) => Cx {
  const memo = new Map<number, Cx>()

  return e => {
    let vector = memo.get(e.spec.P)

    if (!vector) {
      // the plane's Darwin engine is cheap; the slab's carries 2 L^2 Z modes, so its start is the static pull's
      const small = planeLight({ ...specOf(k, k.Z ? 'static' : 'darwin', 2), P: e.spec.P })

      vector = lowestState(small, gaussianStart(small, k.Z ? k.aB / 2 : Math.sqrt(k.aB / 2))).vector
      memo.set(e.spec.P, vector)
    }

    return embedStart(e, vector)
  }
}

export function pairPart(k: PairKey, log: (line: string) => void = () => {}): PairPart {
  const started = Date.now()
  const start = darwinStart(k)
  const read = (light: PlaneLightSpec['light'], members: 1 | 2): Read => {
    const r = readInertia({
      spec: specOf(k, light, members),
      kappa: KAPPA,
      start: members === 2 ? start : e => gaussianStart(e, 1),
      tolerance: TOLERANCE,
      maxSteps: MAX_STEPS,
      log: line => log(`${keyName(k)} ${light} ${members}: ${line}`),
    })

    log(`${keyName(k)} ${light} ${members}: R ${r.R} ratio ${r.ratio} steps ${r.steps.join(' ')}`)

    return r
  }
  const stat = read('static', 2)
  const dar = read('darwin', 2)
  const lone = read('quantum', 1)
  const magneto = k.Z ? read('magnetostatic', 2) : undefined
  const quantum = read('quantum', 2)
  const engine = planeLight({ ...specOf(k, 'quantum', 1), P: 0 })

  return {
    key: k,
    ...(magneto ? { magneto } : {}),
    g: gOf(k),
    debyeWaller: engine.debyeWaller[0],
    static: stat,
    darwin: dar,
    quantum,
    lone,
    seconds: (Date.now() - started) / 1000,
  }
}

// POST HOC (added after the first reads, disclosed in the header): the whole zero-frequency transverse exchange, the
// mutual Darwin term plus each member's own, which is finite in the plane where the mutual term alone is not
export function magnetoPart(k: PairKey): Read {
  return readInertia({
    spec: specOf(k, 'magnetostatic', 2),
    kappa: KAPPA,
    start: darwinStart(k),
    tolerance: TOLERANCE,
    maxSteps: MAX_STEPS,
  })
}

// ---------------- I0 and C1 ----------------

const PERMS: number[][][] = [[[]], [[0]], [[0, 1], [1, 0]], [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]]

function symmetricFill(e: PlaneLight, a: number, b: number): Cx {
  const y = newCx(e.dimension)
  const R = e.sizes[0]!
  // the number of photon labels (one or two modes a momentum)
  const Nq = e.sizes.length > 1 ? e.sizes[1]! / R : 1
  const raw = (i: number): [number, number] => [Math.sin(a * i + 0.3), Math.cos(b * i + 0.1)]

  for (let n = 0, off = 0; n < e.sizes.length; off += e.sizes[n]!, n++) {
    const count = e.sizes[n]! / R

    for (let Q = 0; Q < count; Q++) {
      const dig: number[] = []

      for (let i = 0, rest = Q; i < n; i++) {
        dig.push(rest % Nq)
        rest = Math.floor(rest / Nq)
      }

      for (const p of PERMS[n]!) {
        const Qp = p.reduce((s, src, i) => s + dig[src]! * Nq ** i, 0)

        for (let r = 0; r < R; r++) {
          const [re, im] = raw(off + Qp * R + r)

          y.re[off + Q * R + r] = y.re[off + Q * R + r]! + re / PERMS[n]!.length
          y.im[off + Q * R + r] = y.im[off + Q * R + r]! + im / PERMS[n]!.length
        }
      }
    }
  }

  return y
}

const dot = (a: Cx, b: Cx): [number, number] => {
  let re = 0
  let im = 0

  for (let i = 0; i < a.re.length; i++) {
    re += a.re[i]! * b.re[i]! + a.im[i]! * b.im[i]!
    im += a.re[i]! * b.im[i]! - a.im[i]! * b.re[i]!
  }

  return [re, im]
}

export type InstrumentPart = {
  hermiticity: number
  vertex: number
  offPair: number
  offLone: number
  transverseOff: number
}

export function instrumentPart(): InstrumentPart {
  const g8 = couplingOf(member.mu, 8)
  const base = { c: C, g: g8, t: member.t, M0: member.M0 }
  let hermiticity = 0

  for (const [L, nMax, members, light] of [
    [6, 1, 2, 'quantum'],
    [6, 2, 2, 'quantum'],
    [4, 3, 2, 'quantum'],
    [6, 2, 1, 'quantum'],
    [6, 0, 2, 'static'],
    [6, 0, 2, 'darwin'],
  ] as const) {
    const e = planeLight({ ...base, L, nMax, members, P: 0.37, light })
    const x = symmetricFill(e, 0.37, 1.13)
    const y = symmetricFill(e, 0.91, 0.29)
    const hx = newCx(e.dimension)
    const hy = newCx(e.dimension)

    e.apply(x, hx)
    e.apply(y, hy)

    const p = dot(x, hy)
    const q = dot(y, hx)

    hermiticity = Math.max(hermiticity, Math.hypot(p[0] - q[0], p[1] + q[1]) / Math.hypot(...p))
  }

  // the lone member's one-photon vertex
  const L = 8
  const P = 0.3
  const e = planeLight({ ...base, L, nMax: 1, members: 1, P, light: 'quantum' })
  const x = newCx(e.dimension)
  const hx = newCx(e.dimension)

  x.re[0] = 1
  e.apply(x, hx)

  let vertex = 0

  for (let qy = 0; qy < L; qy++) {
    for (let qx = 0; qx < L; qx++) {
      const iq = qx + L * qy

      if (iq === 0) {
        continue
      }

      const kx = (2 * Math.PI * (qx >= L / 2 ? qx - L : qx)) / L
      const ky = (2 * Math.PI * (qy >= L / 2 ? qy - L : qy)) / L
      const sx = 2 * Math.sin(kx / 2)
      const sy = 2 * Math.sin(ky / 2)
      const s = Math.hypot(sx, sy)
      const norm = 1 / Math.sqrt(2 * C * s * L * L)
      const want =
        2 * member.t * g8 * (e.debyeWaller[0] * (-sy / s) * norm * Math.sin(P - kx / 2) +
          e.debyeWaller[1] * (sx / s) * norm * Math.sin(-ky / 2))

      vertex = Math.max(vertex, Math.hypot(hx.re[1 + iq]! - want, hx.im[1 + iq]!))
    }
  }

  // light off
  const off = { ...base, g: 0, L: 16, nMax: 0, members: 2 as const, light: 'static' as const }
  const offPair = readInertia({ spec: off, kappa: KAPPA, start: e2 => gaussianStart(e2, 2), tolerance: TOLERANCE, maxSteps: MAX_STEPS }).R
  const offLone = readInertia({ spec: { ...off, members: 1 }, kappa: KAPPA, start: e2 => gaussianStart(e2, 1), tolerance: TOLERANCE, maxSteps: 10 }).R

  // C1: the transverse light off at a_B 8 on its main box, against the static pull
  const k: PairKey = { aB: 8, L: MAIN_L[8]!, N: 1 }
  const startOf = darwinStart(k)
  const quiet = readInertia({ spec: { ...specOf(k, 'quantum', 2), gT: 0 }, kappa: KAPPA, start: startOf, tolerance: TOLERANCE, maxSteps: MAX_STEPS }).R
  const plain = readInertia({ spec: specOf(k, 'static', 2), kappa: KAPPA, start: startOf, tolerance: TOLERANCE, maxSteps: MAX_STEPS }).R

  return {
    hermiticity,
    vertex,
    offPair: Math.abs(offPair - member.Rwalk),
    offLone: Math.abs(offLone - member.Rwalk),
    transverseOff: Math.abs(quiet - plain),
  }
}

// ---------------- the verdict ----------------

const slope = (xs: number[], ys: number[]): number => {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n

  return (
    xs.reduce((a, x, i) => a + (x - mx) * (ys[i]! - my), 0) /
    xs.reduce((a, x) => a + (x - mx) ** 2, 0)
  )
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function combinePlane(
  inst: InstrumentPart,
  parts: PairPart[],
  // post hoc: the whole zero-frequency exchange's R by key name (magnetoPart)
  magneto: Record<string, Read> = {},
): Verdict {
  const find = (aB: number, L: number, N: number): PairPart => {
    const p = parts.find(x => x.key.aB === aB && x.key.L === L && x.key.N === N)

    if (!p) {
      throw new Error(`plane-pair-light: no part a${aB} L${L} N${N}`)
    }

    return p
  }
  const delta = (p: PairPart): number => p.quantum.R - p.darwin.R
  const I0 =
    inst.hermiticity <= 1e-12 && inst.vertex <= 1e-12 && inst.offPair <= 1e-8 && inst.offLone <= 1e-7
  const reads = parts.flatMap(p => [p.static, p.darwin, p.quantum, p.lone])
  const I1 = reads.every(r => r.residuals.every(x => x <= 1e-9) && Math.abs(r.ratio - 4) <= 0.1)
  const main = A_B.map(aB => find(aB, MAIN_L[aB]!, 1))
  const check = A_B.map(aB => find(aB, CHECK_L[aB]!, 1))
  const D = main.map(delta)
  const sizeGaps = main.map((p, i) => Math.abs(delta(p) - delta(check[i]!)) / Math.abs(delta(p)))
  const I2 = sizeGaps.every(x => x <= 0.1)
  const photonGaps = [8, 16].map(aB => {
    const one = delta(find(aB, 16, 1))

    return Math.abs(delta(find(aB, 16, 2)) - one) / Math.abs(one)
  })
  const I3 = photonGaps.every(x => x <= 0.1)
  const C1 = inst.transverseOff <= 1e-6
  const oneSign = D.every(x => x > 0) || D.every(x => x < 0)
  const lx = A_B.map(a => Math.log(a))
  const p = oneSign ? slope(lx, D.map(x => Math.log(Math.abs(x)))) : NaN
  const rho = main.map(m => m.darwin.R - member.Rwalk)
  const small = D.every((x, i) => Math.abs(x) < rho[i]! / 2)
  const clean = I0 && I1 && I2 && I3 && C1
  const raw = oneSign && p >= -2.5 && p <= -1.5 && small ? 'pass' : oneSign && p >= -1.5 && p <= -0.5 ? 'fail' : 'partial'
  const status = clean ? raw : 'partial'

  // reads
  const D1 = main.map(m => m.lone.R - member.Rwalk)
  const bind = main.map((m, i) => D[i]! - (D1[i]! * m.darwin.R) / member.Rwalk)
  const darwinShift = main.map(m => m.darwin.R - m.static.R)
  const expOf = (ys: number[]): number =>
    ys.every(y => y > 0) || ys.every(y => y < 0) ? slope(lx, ys.map(y => Math.log(Math.abs(y)))) : NaN
  const p1 = expOf(D1)
  const pBind = expOf(bind)
  const pDarwin = expOf(darwinShift)
  const n3 = [1, 2, 3].map(N => delta(find(8, 8, N)))
  const msOf = (p: PairPart): number => p.quantum.R - (magneto[keyName(p.key)]?.R ?? NaN)
  const msMain = main.map(msOf)
  const msCheck = check.map(msOf)
  const f = (x: number, d = 5): string => (Number.isFinite(x) ? x.toFixed(d) : String(x))
  const e = (x: number): string => x.toExponential(2)

  return verdict({
    status,
    claim: `in the plane, a bound love-fear pair with its light as one exact dynamics (Gauss solved, the transverse light quantized, the exact Peierls phase, photon number 1) reads R_b - R_a = ${D.map(x => e(x)).join(', ')} at a_B ${A_B.join(', ')} against the static pull plus Darwin, exponent ${f(p, 3)} (the claim predicts -2); the remainder scale R_a - tan m / m is ${rho.map(x => e(x)).join(', ')}; a lone member's own dressing alone gives ${D1.map(x => e(x)).join(', ')} (exponent ${f(p1, 3)}), the binding's part ${bind.map(x => e(x)).join(', ')} (exponent ${f(pBind, 3)}); the verdict is on the power-counting claim: ${raw === 'pass' ? 'it holds' : raw === 'fail' ? 'refuted, the moving light adds at first order in the coupling' : 'not decided by the gates'}${clean ? '' : ' (an instrument gate failed, so partial)'}`,
    metrics: {
      exponent: p,
      ...Object.fromEntries(A_B.map((a, i) => [`delta_a${a}`, D[i]!])),
      ...Object.fromEntries(A_B.map((a, i) => [`rho_a${a}`, rho[i]!])),
      ...Object.fromEntries(A_B.map((a, i) => [`Rstatic_a${a}`, main[i]!.static.R])),
      ...Object.fromEntries(A_B.map((a, i) => [`Ra_a${a}`, main[i]!.darwin.R])),
      ...Object.fromEntries(A_B.map((a, i) => [`Rb_a${a}`, main[i]!.quantum.R])),
      ...Object.fromEntries(A_B.map((a, i) => [`lone_a${a}`, D1[i]!])),
      ...Object.fromEntries(A_B.map((a, i) => [`bind_a${a}`, bind[i]!])),
      ...Object.fromEntries(A_B.map((a, i) => [`DW_a${a}`, main[i]!.debyeWaller])),
      ...Object.fromEntries(A_B.map((a, i) => [`sizeGap_a${a}`, sizeGaps[i]!])),
      photonGap_a8: photonGaps[0]!,
      photonGap_a16: photonGaps[1]!,
      loneExponent: p1,
      bindExponent: pBind,
      darwinExponent: pDarwin,
      ...Object.fromEntries(A_B.map((a, i) => [`deltaMs_a${a}`, msMain[i]!])),
      ...Object.fromEntries(A_B.map((a, i) => [`deltaMsCheck_a${a}`, msCheck[i]!])),
      ...Object.fromEntries(A_B.map((a, i) => [`deltaCheck_a${a}`, delta(check[i]!)])),
      ...Object.fromEntries(A_B.map((a, i) => [`RaCheck_a${a}`, check[i]!.darwin.R])),
      ...Object.fromEntries(A_B.map((a, i) => [`RloneCheck_a${a}`, check[i]!.lone.R])),
      deltaN1_L8: n3[0]!,
      deltaN2_L8: n3[1]!,
      deltaN3_L8: n3[2]!,
      I0: flag(I0),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      small: flag(small),
    },
    control: {
      C1: flag(C1),
      transverseOff: inst.transverseOff,
      hermiticity: inst.hermiticity,
      vertex: inst.vertex,
      offPair: inst.offPair,
      offLone: inst.offLone,
      Rwalk: member.Rwalk,
    },
    notes: `L2, deterministic (Gaussian and Darwin-ground starts, Lanczos; no draw). Gates I0 ${I0} I1 ${I1} I2 ${I2} I3 ${I3} C1 ${C1}, small ${small}. Darwin's own shift R_a - R_static ${darwinShift.map(x => e(x)).join(', ')} (exponent ${f(pDarwin, 3)}). Photon number on L 16: Delta N1/N2 a_B 8 ${e(delta(find(8, 16, 1)))}/${e(delta(find(8, 16, 2)))}, a_B 16 ${e(delta(find(16, 16, 1)))}/${e(delta(find(16, 16, 2)))}; on L 8 at a_B 8, N 1, 2, 3: ${n3.map(x => e(x)).join(', ')}. Finite size (main, check): ${main.map((m, i) => `${e(delta(m))}/${e(delta(check[i]!))}`).join('; ')}.`,
  })
}

export default experiment({
  id: 'quantum/plane-pair-light',
  code: 'E-QTM-0181',
  title:
    'explores whether, with a bound pair and its light run as one exact quantum dynamics in the plane (Gauss solved, the transverse light quantized, the exact Peierls phase), the moving light adds to the pair\'s inertia only beyond the static pull plus the Darwin exchange (R_b - R_a falling as a_B^-2), the power-counting claim that set the 3d run aside',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return combinePlane(instrumentPart(), PAIR_KEYS.map(k => pairPart(k)))
  },
})

// ==================================================================================================================
// E-QTM-0182: THE SAME TEST WITH THE MEMBERS IN THE PLANE AND THE LIGHT IN A SLAB (pre-registered 2026-10-20, after
// E-QTM-0181's first reads and before any slab level was computed).
//
// WHY. E-QTM-0181's first reads showed the plane cannot pose the comparison: the plane's transverse kernel is 1 / q^2
// in two dimensions, so the mutual Darwin term alone grows as ln L (R_a 0.893, 0.849, 0.825 at a_B 8 on L 8, 16, 24),
// a lone member's own transverse dressing grows as ln L too (R 1.150, 1.198, 1.229), and even the whole instantaneous
// exchange drifts (1.038, 1.021 on L 8, 16), because a bound pair's internal current has a dipole part whose
// zero-frequency field in the plane is infrared divergent; only the full dynamical light (R_b 0.9804, 0.9796, 0.9786)
// is finite. So (a) is not defined there. Putting the light in a slab L x L x Z (two polarizations, the 3d lattice
// Green function on the members' plane) gives the 3d pull -g^2 / (4 pi r), the 3d Darwin kernel (finite), and a_B =
// 4 pi / (mu g^2), alpha = g^2 / (4 pi) as in 3d: a level's size grows as a_B (2d hydrogen, radius about a_B / 2), and
// the Darwin term is second order in the coupling, as in the husk. The members stay in the plane (their motion 2d),
// which is what keeps the problem small: L^2 positions times 2 L^2 Z one-photon modes.
//
// PLAN. a_B 3, 4, 6, 8. Main slabs (L, Z) (24, 12) for a_B 3, 4 and (32, 16) for 6, 8; finite-size slabs (16, 8) and
// (24, 12). Photon number: (8, 4) at a_B 3 and 4 with N 1, 2. Everything else as E-QTM-0181 (the member, c, P, R).
//
// GATES (the brief's, fixed now):
//   I0 instruments   slab engines Hermitian to 1e-12 (L 4, Z 4: quantum N 1 and 2, darwin, magnetostatic)
//   I1 levels        every Lanczos residual at most 1e-9, every d(P) / d(P / 2) within 0.1 of 4
//   I2 finite size   |Delta(main) - Delta(check)| <= 0.1 |Delta(main)| at every a_B
//   I3 photon number |Delta(N 2) - Delta(N 1)| <= 0.1 |Delta(N 1)| at a_B 3 and 4 on (8, 4)
//   C1 control       transverse light off (gT 0): (b) equals the static pull's R to 1e-6, at a_B 3 on (16, 8)
//   Delta = R_b - R_a, (a) the static pull plus the mutual Darwin exchange (the 3d R_full's content), rho = R_a -
//   tan m / m; p the least-squares slope of ln |Delta| on ln a_B (Delta one sign)
//   PASS p in [-2.5, -1.5] and |Delta| < |rho| / 2 at every a_B; FAIL (claim refuted) p in [-1.5, -0.5]; PARTIAL
//   otherwise, and at most PARTIAL if I0 to I3 or C1 fail
// READ: Delta_ms = R_b - R_ms against the whole instantaneous exchange (mutual plus each member's own) and its
// exponent, which says whether anything beyond the zero-frequency exchange is first order; the members' own share
// R_ms - R_a; the Debye-Waller factor.
// AMENDED, disclosed: the first slab reads (the (8, 4) boxes at a_B 3 and 4 and the start of (16, 8), tmp/qtm-S1.log,
// files tmp/qtm-part-s-*.json) counted the pull with each charge's own Coulomb energy, g^2 (G(0) - G(r)), E-QTM-0181's
// plane convention; that put the pair's E far above 2 M0 (2.62 against 1.71) and R_static at 0.75, against the 3d
// reading, whose pull is zero far away (-alpha n(r), E = 2 M0 - E_b). The slab now uses -g^2 G(r) (selfEnergy
// false); no gate moved, the keys were renamed slab-*, and every slab part was read again under it. Those first reads
// stay on disk as a probe.
// PREDICTED (this builder, before the slab run): FAIL, p near -1, the first-order term being each member's own
// dressing (in E-QTM-0181's plane the pair's R_b sits 0.15 above R_a at a_B 8 to 16), which the 3d R_full leaves out
// with its bare tan m / m.

export const SLAB_A_B = [3, 4, 6, 8] as const
export const SLAB_MAIN: Record<number, [number, number]> = { 3: [24, 12], 4: [24, 12], 6: [32, 16], 8: [32, 16] }
export const SLAB_CHECK: Record<number, [number, number]> = { 3: [16, 8], 4: [16, 8], 6: [24, 12], 8: [24, 12] }

export const SLAB_KEYS: PairKey[] = [
  ...SLAB_A_B.map(aB => ({ aB, L: SLAB_MAIN[aB]![0], Z: SLAB_MAIN[aB]![1], N: 1 })),
  ...SLAB_A_B.map(aB => ({ aB, L: SLAB_CHECK[aB]![0], Z: SLAB_CHECK[aB]![1], N: 1 })),
  { aB: 3, L: 8, Z: 4, N: 1 },
  { aB: 3, L: 8, Z: 4, N: 2 },
  { aB: 4, L: 8, Z: 4, N: 1 },
  { aB: 4, L: 8, Z: 4, N: 2 },
]

export type SlabInstrumentPart = { hermiticity: number; transverseOff: number }

export function slabInstrumentPart(): SlabInstrumentPart {
  const base = { c: C, g: slabCouplingOf(member.mu, 3), t: member.t, M0: member.M0 }
  let hermiticity = 0

  for (const [nMax, light] of [
    [1, 'quantum'],
    [2, 'quantum'],
    [0, 'darwin'],
    [0, 'magnetostatic'],
  ] as const) {
    const e = planeLight({ ...base, L: 4, depth: 4, nMax, members: 2, P: 0.37, light })
    const x = symmetricFill(e, 0.37, 1.13)
    const y = symmetricFill(e, 0.91, 0.29)
    const hx = newCx(e.dimension)
    const hy = newCx(e.dimension)

    e.apply(x, hx)
    e.apply(y, hy)

    const p = dot(x, hy)
    const q = dot(y, hx)

    hermiticity = Math.max(hermiticity, Math.hypot(p[0] - q[0], p[1] + q[1]) / Math.hypot(...p))
  }

  const k: PairKey = { aB: 3, L: 16, Z: 8, N: 1 }
  const startOf = darwinStart(k)
  const quiet = readInertia({ spec: { ...specOf(k, 'quantum', 2), gT: 0 }, kappa: KAPPA, start: startOf, tolerance: TOLERANCE, maxSteps: MAX_STEPS }).R
  const plain = readInertia({ spec: specOf(k, 'static', 2), kappa: KAPPA, start: startOf, tolerance: TOLERANCE, maxSteps: MAX_STEPS }).R

  return { hermiticity, transverseOff: Math.abs(quiet - plain) }
}

export function combineSlab(inst: SlabInstrumentPart, parts: PairPart[]): Verdict {
  const find = (aB: number, [L, Z]: [number, number], N: number): PairPart => {
    const p = parts.find(x => x.key.aB === aB && x.key.L === L && x.key.Z === Z && x.key.N === N)

    if (!p) {
      throw new Error(`slab-pair-light: no part a${aB} L${L} Z${Z} N${N}`)
    }

    return p
  }
  const delta = (p: PairPart): number => p.quantum.R - p.darwin.R
  const I0 = inst.hermiticity <= 1e-12
  const reads = parts.flatMap(p => [p.static, p.darwin, p.quantum, p.lone, ...(p.magneto ? [p.magneto] : [])])
  const I1 = reads.every(r => r.residuals.every(x => x <= 1e-9) && Math.abs(r.ratio - 4) <= 0.1)
  const main = SLAB_A_B.map(aB => find(aB, SLAB_MAIN[aB]!, 1))
  const check = SLAB_A_B.map(aB => find(aB, SLAB_CHECK[aB]!, 1))
  const D = main.map(delta)
  const sizeGaps = main.map((p, i) => Math.abs(delta(p) - delta(check[i]!)) / Math.abs(delta(p)))
  const I2 = sizeGaps.every(x => x <= 0.1)
  const photonGaps = [3, 4].map(aB => {
    const one = delta(find(aB, [8, 4], 1))

    return Math.abs(delta(find(aB, [8, 4], 2)) - one) / Math.abs(one)
  })
  const I3 = photonGaps.every(x => x <= 0.1)
  const C1 = inst.transverseOff <= 1e-6
  const lx = SLAB_A_B.map(a => Math.log(a))
  const expOf = (ys: number[]): number =>
    ys.every(y => y > 0) || ys.every(y => y < 0) ? slope(lx, ys.map(y => Math.log(Math.abs(y)))) : NaN
  const p = expOf(D)
  const rho = main.map(m => m.darwin.R - member.Rwalk)
  const small = D.every((x, i) => Math.abs(x) < Math.abs(rho[i]!) / 2)
  const clean = I0 && I1 && I2 && I3 && C1
  const raw = Number.isFinite(p) && p >= -2.5 && p <= -1.5 && small ? 'pass' : Number.isFinite(p) && p >= -1.5 && p <= -0.5 ? 'fail' : 'partial'
  const status = clean ? raw : 'partial'
  const Dms = main.map(m => m.quantum.R - (m.magneto?.R ?? NaN))
  const own = main.map(m => (m.magneto?.R ?? NaN) - m.darwin.R)
  const darwinShift = main.map(m => m.darwin.R - m.static.R)
  const e = (x: number): string => x.toExponential(2)
  const f = (x: number, d = 3): string => (Number.isFinite(x) ? x.toFixed(d) : String(x))

  return verdict({
    status,
    claim: `members in the plane, light in a slab (3d pull and Darwin kernel, a_B proportional to 1 / alpha), one exact dynamics at photon number 1: R_b - R_a = ${D.map(e).join(', ')} at a_B ${SLAB_A_B.join(', ')} (R_a the static pull plus the mutual Darwin exchange), exponent ${f(p)} (the power-counting claim predicts -2), against the remainder scale |R_a - tan m / m| ${rho.map(x => e(Math.abs(x))).join(', ')}; against the whole zero-frequency exchange (each member's own included) R_b - R_ms = ${Dms.map(e).join(', ')} (exponent ${f(expOf(Dms))}); the claim ${raw === 'pass' ? 'holds' : raw === 'fail' ? 'is refuted: the moving light changes R at first order in the coupling' : 'is not decided by the gates'}${clean ? '' : ' (an instrument gate failed, so partial)'}`,
    metrics: {
      exponent: p,
      exponentMs: expOf(Dms),
      exponentOwn: expOf(own),
      exponentDarwin: expOf(darwinShift),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`delta_a${a}`, D[i]!])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`deltaMs_a${a}`, Dms[i]!])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`own_a${a}`, own[i]!])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`rho_a${a}`, rho[i]!])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`Rstatic_a${a}`, main[i]!.static.R])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`Ra_a${a}`, main[i]!.darwin.R])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`Rms_a${a}`, main[i]!.magneto?.R ?? NaN])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`Rb_a${a}`, main[i]!.quantum.R])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`Rlone_a${a}`, main[i]!.lone.R])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`DW_a${a}`, main[i]!.debyeWaller])),
      ...Object.fromEntries(SLAB_A_B.map((a, i) => [`sizeGap_a${a}`, sizeGaps[i]!])),
      photonGap_a3: photonGaps[0]!,
      photonGap_a4: photonGaps[1]!,
      I0: flag(I0),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      small: flag(small),
    },
    control: { C1: flag(C1), transverseOff: inst.transverseOff, hermiticity: inst.hermiticity, Rwalk: member.Rwalk },
    notes: `L2, deterministic. Gates I0 ${I0} I1 ${I1} I2 ${I2} I3 ${I3} C1 ${C1}, small ${small}. Darwin's own shift R_a - R_static ${darwinShift.map(e).join(', ')}; the members' own instantaneous share R_ms - R_a ${own.map(e).join(', ')}. Finite size (main, check): ${main.map((m, i) => `${e(delta(m))}/${e(delta(check[i]!))}`).join('; ')}. Photon number on (8, 4): a_B 3 ${e(delta(find(3, [8, 4], 1)))}/${e(delta(find(3, [8, 4], 2)))}, a_B 4 ${e(delta(find(4, [8, 4], 1)))}/${e(delta(find(4, [8, 4], 2)))}.`,
  })
}

experiment({
  id: 'quantum/slab-pair-light',
  code: 'E-QTM-0182',
  title:
    "explores, with the members in the plane and the light in a slab (3d pull and Darwin kernel, so a_B is proportional to 1 / alpha as in the husk), whether the moving light adds to a bound pair's inertia only beyond the static pull plus the Darwin exchange (R_b - R_a falling as a_B^-2), the power-counting claim that set the 3d pair-plus-light run aside",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return combineSlab(slabInstrumentPart(), SLAB_KEYS.map(k => pairPart(k)))
  },
})
