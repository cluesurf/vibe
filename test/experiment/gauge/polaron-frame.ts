// The polaron frame of the atom-light rule (E-FRC-0238). E-FRC-0236 found the two-quantum restriction failing
// against the exact rule at N <= 11, and E-FRC-0237 found it leaking 15 percent of its norm on the long ring at
// N = 25. This file names the structural reason and builds the frame that removes it (code/measure/polaron-frame).
//
// THE REASON, derived before any run. The rule's coupling is the cross term of rung 0's drift, e^(-i g x R),
// g = 4 pi c / M: a displacement D(x alpha) of the light's modes applied EVERY beat on the charge's branch,
// alpha_k = -i g u_k. Summed over the ring's modes the kick is |alpha| = 0.31, 0.25 per beat at N = 9, 11 and
// 0.11 at N = 25 (L = 512). A restriction to two quanta truncates D(alpha) every beat, and most of what it drops
// would have been taken back a beat later: the kick is mostly the charge's STATIC dressing, re-made each beat.
// A charge held at x = 1 dresses the light with the fixed point of b -> e^(-i omega)(b + alpha):
//     beta_k = alpha_k / (e^(i omega_k) - 1),        |beta_k| = g u_k / (2 sin(omega_k / 2))
// THE FRAME. psi = D(x gamma) psi', gamma = lambda beta, an x-diagonal Weyl displacement of the columns' harmonic
// reading (a unitary, so the frame is exact for any lambda). The Weyl algebra gives, exactly,
//     U' = e^(i x chi) D(x kappa) P Phi Vt,   Vt = a + b D((1 - 2x) gamma) T,   kappa = (1 - lambda) e^(-i omega) alpha
// PREDICTED residual coupling: with lambda = 1 (Lang-Firsov, the whole static field) the per-beat kick is ZERO
// and every coupling sits in the dressed hop, amplitude |b| = sin(theta/2) (0.14 at N = 25) times a displacement
// of Debye-Waller exponent W = sum |beta|^2; with lambda = sin(w/2) / (sin(w/2) + sin(theta_r/2)) (Silbey-Harris
// transcribed to the beat: a mode follows the charge only as fast as it can) the kick keeps (1 - lambda) of itself
// and W stays finite as the ring grows (Lang-Firsov's W grows as ln L: the slow modes' 1/k).
// PREDICTED rate: the Floquet golden rule in the frame, Gamma = 2 L |<g_r| M(k*) |e_r>|^2 / v_g at the dressed gap
// theta_r (the zeroth order's gap), every path through the dressed hop carrying e^(-W/2) (framePrediction).
//
// Gates, fixed before the first run (the frame's static numbers were computed first by tmp/pol-derive.ts,
// formulas only, disclosed; no dynamics was run before this file):
// P1 the frame is exact: for six (omega, g u, lambda, hop, atom phase) points from a golden Weyl sequence, one mode
//    in a Fock space cut at 70 quanta, D(-x gamma) U D(x gamma) equals e^(i x chi) D(x kappa) P Phi Vt on every
//    entry with both quantum numbers <= 12, within 1e-10 (lambda = 0, 1/2, 1 and three Weyl values)
// P2 the static field is the exact rule's: on the ring's physical sector (code/measure/ring-reduced) with the atom
//    frozen at x = 1 (hop 0), the light's vacuum survival |<vac| U^t |vac>|^2 follows
//    exp(-2 sum |beta_k|^2 (1 - cos omega_k t)) within 2e-3 at every beat t <= 200 (N = 25) and t <= 300 (N = 49),
//    L = 4, the modes k = 2 pi j / L
// P3 the kernel: the reduced beat equals the full-space rule (code/rule/loop-ring loopKernel, the atom present) on
//    (N, L) = (5, 3), (7, 3), (5, 4) within 1e-12 over 5 beats from a Weyl start in the physical sector
// Reported: the control of P2 (force step off: the kick accumulates without a fixed point, no plateau); P2 at
// (N, L) = (9, 6), (11, 6), the box of E-FRC-0236; the frames' numbers (W, K, chi, dressed gaps, predicted rates
// against the bare golden rule) on the long ring (N = 25, 49, L = 512) and the short boxes; husk first: every
// quantity is read on the husk strip's loop registers; the bulk is the column depth D = (N - 1) / 2.
// Status: pass if P1 to P3 pass; partial if P1 and P3 pass; fail otherwise.
// FIRST RUN 2026-09-26: pass (see notes).
//
// Depth L2: the frame is an exact identity of the rule's harmonic reading (L1 for P1); P2 reads the exact rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { loopBeat, loopKernel, loopSplit, ringCurl, ringOmega, ringSpec, splitNear, type LoopSpec } from '@/code/rule/loop-ring'
import { atomBare } from '@/code/measure/quantum-ladder'
import { ringAtomSpec, stripGoldenRule, stripModes } from '@/code/measure/few-quanta'
import { reducedBeat, reducedKernel, reducedToFull } from '@/code/measure/ring-reduced'
import { atomWithLight, reducedVacuum, restrictedFrame } from '@/code/measure/polaron-runs'
import { staticField } from '@/code/measure/polaron-frame'
import { weyl } from '@/code/tool/weyl'

const CUT = 70
const LOW = 12

type Mat = { re: Float64Array; im: Float64Array; n: number }

const zeros = (n: number): Mat => ({ re: new Float64Array(n * n), im: new Float64Array(n * n), n })

function matMul(a: Mat, b: Mat): Mat {
  const n = a.n
  const out = zeros(n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k]!
      const ai = a.im[i * n + k]!

      if (ar === 0 && ai === 0) continue

      for (let j = 0; j < n; j++) {
        out.re[i * n + j] = out.re[i * n + j]! + ar * b.re[k * n + j]! - ai * b.im[k * n + j]!
        out.im[i * n + j] = out.im[i * n + j]! + ar * b.im[k * n + j]! + ai * b.re[k * n + j]!
      }
    }
  }

  return out
}

// <m| D(g) |n> of the untruncated displacement (generalized Laguerre), for m, n <= CUT
function displacementMatrix(gr: number, gi: number): { re: Float64Array; im: Float64Array } {
  const C = CUT + 1
  const re = new Float64Array(C * C)
  const im = new Float64Array(C * C)
  const x = gr * gr + gi * gi
  const damp = Math.exp(-x / 2)
  const lf = new Float64Array(C + 1)

  for (let i = 1; i <= C; i++) lf[i] = lf[i - 1]! + Math.log(i)

  const laguerre = (k: number, a: number): number => {
    // L_k^(a)(x) by recurrence
    let l0 = 1
    let l1 = 1 + a - x

    if (k === 0) return l0

    for (let j = 1; j < k; j++) {
      const l2 = ((2 * j + 1 + a - x) * l1 - (j + a) * l0) / (j + 1)

      l0 = l1
      l1 = l2
    }

    return l1
  }

  for (let m = 0; m < C; m++) {
    for (let n = 0; n < C; n++) {
      // m >= n: sqrt(n!/m!) g^(m-n) L_n^(m-n); m < n: sqrt(m!/n!) (-conj g)^(n-m) L_m^(n-m)
      const [lo, hi] = m >= n ? [n, m] : [m, n]
      const d = hi - lo
      const base: [number, number] = m >= n ? [gr, gi] : [-gr, gi]
      let pr = 1
      let pi = 0

      for (let j = 0; j < d; j++) {
        const t = pr * base[0] - pi * base[1]

        pi = pr * base[1] + pi * base[0]
        pr = t
      }

      const scale = damp * Math.exp((lf[lo]! - lf[hi]!) / 2) * laguerre(lo, d)

      re[m * C + n] = pr * scale
      im[m * C + n] = pi * scale
    }
  }

  return { re, im }
}

// an operator on (x, n), x in {0, 1}, n <= CUT, from 2x2 blocks of Fock matrices (undefined = zero)
function blocks(parts: ({ re: Float64Array; im: Float64Array } | undefined)[][]): Mat {
  const C = CUT + 1
  const out = zeros(2 * C)

  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      const p = parts[x]![y]

      if (!p) continue

      for (let i = 0; i < C; i++) {
        for (let j = 0; j < C; j++) {
          out.re[(x * C + i) * 2 * C + y * C + j] = p.re[i * C + j]!
          out.im[(x * C + i) * 2 * C + y * C + j] = p.im[i * C + j]!
        }
      }
    }
  }

  return out
}

const identity = (cr = 1, ci = 0): { re: Float64Array; im: Float64Array } => {
  const C = CUT + 1
  const re = new Float64Array(C * C)
  const im = new Float64Array(C * C)

  for (let i = 0; i < C; i++) {
    re[i * C + i] = cr
    im[i * C + i] = ci
  }

  return { re, im }
}

const scaled = (m: { re: Float64Array; im: Float64Array }, cr: number, ci: number) => ({
  re: m.re.map((v, i) => v * cr - m.im[i]! * ci),
  im: m.re.map((v, i) => v * ci + m.im[i]! * cr),
})

function freePhase(omega: number): { re: Float64Array; im: Float64Array } {
  const C = CUT + 1
  const re = new Float64Array(C * C)
  const im = new Float64Array(C * C)

  for (let i = 0; i < C; i++) {
    re[i * C + i] = Math.cos(-omega * i)
    im[i * C + i] = Math.sin(-omega * i)
  }

  return { re, im }
}

// P1: one point
function frameIdentity(omega: number, gu: number, lambda: number, z: number, phi: number): number {
  const [br, bi] = staticField(omega, gu, 1)
  const gr = lambda * br
  const gi = lambda * bi
  const alpha: [number, number] = [0, -gu]
  // kappa = e^(-i w)(alpha + gamma) - gamma
  const sr = alpha[0] + gr
  const si = alpha[1] + gi
  const rr = Math.cos(omega) * sr + Math.sin(omega) * si
  const ri = Math.cos(omega) * si - Math.sin(omega) * sr
  const kr = rr - gr
  const ki = ri - gi
  const chi = alpha[1] * gr - alpha[0] * gi - (gi * rr - gr * ri)
  const a: [number, number] = [(1 + Math.cos(z)) / 2, Math.sin(z) / 2]
  const b: [number, number] = [(1 - Math.cos(z)) / 2, -Math.sin(z) / 2]
  const I = identity()
  const P = freePhase(omega)
  const Da = displacementMatrix(alpha[0], alpha[1])
  const Dg = displacementMatrix(gr, gi)
  const Dmg = displacementMatrix(-gr, -gi)
  const Dk = displacementMatrix(kr, ki)
  const V = blocks([
    [scaled(I, ...a), scaled(I, ...b)],
    [scaled(I, ...b), scaled(I, ...a)],
  ])
  const Phi = blocks([
    [I, undefined],
    [undefined, identity(Math.cos(phi), Math.sin(phi))],
  ])
  const Kick = blocks([
    [I, undefined],
    [undefined, Da],
  ])
  const Pm = blocks([
    [P, undefined],
    [undefined, P],
  ])
  const U = matMul(Pm, matMul(Kick, matMul(Phi, V)))
  const Sx = blocks([
    [I, undefined],
    [undefined, Dg],
  ])
  const Smx = blocks([
    [I, undefined],
    [undefined, Dmg],
  ])
  const lhs = matMul(Smx, matMul(U, Sx))
  const Vt = blocks([
    [scaled(I, ...a), scaled(Dg, ...b)],
    [scaled(Dmg, ...b), scaled(I, ...a)],
  ])
  const E = blocks([
    [I, undefined],
    [undefined, scaled(Dk, Math.cos(chi), Math.sin(chi))],
  ])
  const rhs = matMul(E, matMul(Pm, matMul(Phi, Vt)))
  const C = CUT + 1
  let worst = 0

  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      for (let i = 0; i <= LOW; i++) {
        for (let j = 0; j <= LOW; j++) {
          const p = (x * C + i) * 2 * C + y * C + j

          worst = Math.max(worst, Math.hypot(lhs.re[p]! - rhs.re[p]!, lhs.im[p]! - rhs.im[p]!))
        }
      }
    }
  }

  return worst
}

// P2: the vacuum survival under a frozen charge, exact rule and harmonic formula
function loschmidt(n: number, L: number, beats: number, forceOff: boolean): { worst: number; lowest: number; lowestPredicted: number; controlEnd: number; W: number; vacuumResidual: number } {
  const split = splitNear(n, 1)
  const spec = ringSpec(n, L, split, 0)
  const { f, kappa } = loopSplit(spec)
  const vac = reducedVacuum(spec)
  const kernel = reducedKernel(spec, { withAtom: true })
  const g = (4 * Math.PI * spec.drift) / spec.root
  const modes = stripModes({ n, squares: L, f, js: Array.from({ length: L - 1 }, (_, j) => j + 1), omegaOf: k => ringOmega(kappa, k) })
  const beta2 = Array.from(modes.omega, (w, a) => {
    const [br, bi] = staticField(w, modes.u[a]!, g)

    return br * br + bi * bi
  })
  const half = kernel.half
  let worst = 0
  let lowest = 1
  let lowestPredicted = 1
  let controlEnd = 1
  const run = (off: boolean): number[] => {
    const k = off ? { ...kernel, forceRe: new Float64Array(half).fill(1), forceIm: new Float64Array(half) } : kernel
    const v = atomWithLight([0, 0, 1, 0], vac.vacuum)
    const out: number[] = []

    for (let t = 0; t <= beats; t++) {
      let sr = 0
      let si = 0

      for (let i = 0; i < half; i++) {
        const ar = vac.vacuum.re[i]!
        const ai = vac.vacuum.im[i]!
        const br = v.re[half + i]!
        const bi = v.im[half + i]!

        sr += ar * br + ai * bi
        si += ar * bi - ai * br
      }

      out.push(sr * sr + si * si)

      if (t < beats) reducedBeat(k, v.re, v.im)
    }

    return out
  }
  const exact = run(false)

  for (let t = 0; t <= beats; t++) {
    let e = 0

    modes.omega.forEach((w, a) => {
      e += 2 * beta2[a]! * (1 - Math.cos(w * t))
    })

    const predicted = Math.exp(-e)

    worst = Math.max(worst, Math.abs(exact[t]! - predicted))
    lowest = Math.min(lowest, exact[t]!)
    lowestPredicted = Math.min(lowestPredicted, predicted)
  }

  if (forceOff) controlEnd = run(true)[beats]!

  return { worst, lowest, lowestPredicted, controlEnd, W: beta2.reduce((s, x) => s + x, 0), vacuumResidual: vac.residual }
}

// P3: reduced against full
function kernelCheck(n: number, L: number): number {
  const split = splitNear(n, 1)
  const spec: LoopSpec = ringSpec(n, L, split, Math.floor(split.root / 7))
  const red = reducedKernel(spec, { withAtom: true })
  const full = loopKernel(spec)
  const re = new Float64Array(red.size)
  const im = new Float64Array(red.size)

  for (let i = 0; i < red.size; i++) {
    re[i] = weyl(2 * i + 1) - 0.5
    im[i] = weyl(2 * i + 2) - 0.5
  }

  const f = reducedToFull(spec, re, im, 2)
  let worst = 0

  for (let t = 0; t < 5; t++) {
    reducedBeat(red, re, im)
    loopBeat(full, f.re, f.im)

    const back = reducedToFull(spec, re, im, 2)

    for (let i = 0; i < f.re.length; i++) worst = Math.max(worst, Math.abs(back.re[i]! - f.re[i]!), Math.abs(back.im[i]! - f.im[i]!))
  }

  return worst
}

const ladderShape = (spec: LoopSpec) => ({ n: spec.n, plaquettes: spec.squares, root: spec.root, drift: spec.drift, force: spec.force, hop: spec.hop! })

export default experiment({
  id: 'gauge/polaron-frame',
  code: 'E-FRC-0238',
  title:
    "the polaron frame of the atom-light rule: the charge's coupling is a displacement of the light re-made every beat, whose fixed point beta = alpha / (e^(i omega) - 1) is the charge's static field; displacing the light by it is an exact Weyl frame in which the per-beat kick vanishes and the coupling moves into a dressed hop, and the exact register rule's vacuum survival under a frozen charge follows the static field",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // P1
    const lambdas = [0, 0.5, 1, weyl(101), weyl(102), weyl(103)]
    let p1 = 0

    lambdas.forEach((lambda, j) => {
      const omega = 0.3 + 2.7 * weyl(11 + j)
      const gu = 0.05 + 0.25 * weyl(31 + j)
      const z = 2 * Math.PI * weyl(51 + j)
      const phi = 2 * Math.PI * weyl(71 + j)
      const e = frameIdentity(omega, gu, lambda, z, phi)

      metrics[`frameIdentity${j}`] = e
      p1 = Math.max(p1, e)
    })

    metrics.frameIdentityWorst = p1

    // P3
    let p3 = 0

    for (const [n, L] of [
      [5, 3],
      [7, 3],
      [5, 4],
    ] as const) {
      const e = kernelCheck(n, L)

      metrics[`kernelN${n}L${L}`] = e
      p3 = Math.max(p3, e)
    }

    // P2
    let p2 = true

    for (const [n, L, beats, gated] of [
      [25, 4, 200, true],
      [49, 4, 300, true],
      [9, 6, 60, false],
      [11, 6, 60, false],
    ] as const) {
      const tag = `N${n}L${L}`
      const r = loschmidt(n, L, beats, gated)

      metrics[`survivalWorst${tag}`] = r.worst
      metrics[`survivalLowest${tag}`] = r.lowest
      metrics[`survivalLowestPredicted${tag}`] = r.lowestPredicted
      metrics[`staticW${tag}`] = r.W
      metrics[`vacuumResidual${tag}`] = r.vacuumResidual

      if (gated) {
        metrics[`forceOffSurvivalEnd${tag}`] = r.controlEnd
        p2 &&= r.worst <= 2e-3
      }
    }

    // the frames' numbers (reported)
    for (const [n, L, kStar] of [
      [25, 512, Math.PI / 3],
      [49, 512, Math.PI / 3],
      [25, 5, (2 * Math.PI) / 5],
      [9, 6, Math.PI / 3],
    ] as const) {
      const tag = `N${n}L${L}`
      const spec = ringAtomSpec(n, L, kStar)
      const { f, kappa } = loopSplit(spec)
      const bare = atomBare(ladderShape(spec))
      const g = (4 * Math.PI * spec.drift) / spec.root
      const gr = stripGoldenRule({ n, f, kappa, g, dipole: bare.dipole, gap: bare.gap, curl: ringCurl, curlSlope: k => 2 * Math.sin(k) })

      metrics[`coupling${tag}`] = g
      metrics[`bareGap${tag}`] = bare.gap
      metrics[`goldenRule${tag}`] = gr.rate

      for (const kind of ['lab', 'lang-firsov', 'silbey-harris'] as const) {
        const c = restrictedFrame(spec, bare.gap, kind)
        const key = kind === 'lab' ? 'Lab' : kind === 'lang-firsov' ? 'LF' : 'SH'
        let kick = 0

        for (let a = 0; a < c.frame.modes; a++) kick += c.frame.kappaRe[a]! ** 2 + c.frame.kappaIm[a]! ** 2

        metrics[`W${key}${tag}`] = c.frame.W
        metrics[`kickPerBeat${key}${tag}`] = Math.sqrt(kick)
        metrics[`dressedHopOffVacuum${key}${tag}`] = Math.hypot(...c.frame.hopB) * Math.sqrt(1 - Math.exp(-c.frame.W))
        metrics[`chi${key}${tag}`] = c.frame.chi
        metrics[`dressedGap${key}${tag}`] = c.prediction.gap
        metrics[`predictedRate${key}${tag}`] = c.prediction.rate
        metrics[`predictedOverGolden${key}${tag}`] = c.prediction.rate / gr.rate
      }
    }

    const gates = { P1: p1 <= 1e-10, P2: p2, P3: p3 <= 1e-12 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = gates.P1 && gates.P2 && gates.P3 ? 'pass' : gates.P1 && gates.P3 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `the frame D(x gamma) conjugates the beat into e^(i x chi) D(x kappa) P Phi Vt within ${p1.toExponential(1)} (six Weyl points, one mode, 70 quanta), so with lambda = 1 the per-beat kick (|alpha| ${metrics.kickPerBeatLabN25L512!.toFixed(4)} at N = 25, L = 512) is exactly zero and the coupling is a dressed hop of off-vacuum amplitude ${metrics.dressedHopOffVacuumLFN25L512!.toFixed(4)}; the exact register rule's vacuum survival under a frozen charge follows exp(-2 sum |beta|^2 (1 - cos omega t)) within ${metrics.survivalWorstN25L4!.toExponential(1)} and ${metrics.survivalWorstN49L4!.toExponential(1)} (N = 25, 49, L = 4; plateau minimum ${metrics.survivalLowestN25L4!.toFixed(5)} against ${metrics.survivalLowestPredictedN25L4!.toFixed(5)}), where the force-off light falls to ${metrics.forceOffSurvivalEndN25L4!.toFixed(4)}; the reduced kernel equals the full rule within ${p3.toExponential(1)}. Predicted long-ring rates (N = 25, 49): Lang-Firsov ${metrics.predictedOverGoldenLFN25L512!.toFixed(4)}, ${metrics.predictedOverGoldenLFN49L512!.toFixed(4)} and Silbey-Harris ${metrics.predictedOverGoldenSHN25L512!.toFixed(4)}, ${metrics.predictedOverGoldenSHN49L512!.toFixed(4)} of the bare golden rule (W = ${metrics.WLFN25L512!.toFixed(4)} against ${metrics.WSHN25L512!.toFixed(4)} at N = 25)`,
      metrics,
      control: { forceOffSurvivalEndN25L4: metrics.forceOffSurvivalEndN25L4!, forceOffSurvivalEndN49L4: metrics.forceOffSurvivalEndN49L4! },
      notes:
        "L2 (P1 L1). FIRST RUN 2026-09-26 (tmp/frc0238.log, 115 s), PASS on all three gates. No gate moved. P1: the frame identity holds within 5.7e-15 at six Weyl points (lambda = 0, 1/2, 1 and three Weyl values). P3: the reduced kernel equals the full rule within 6.4e-16. P2: the exact register rule's vacuum survival under a frozen charge follows exp(-2 sum |beta|^2 (1 - cos omega t)) within 3.2e-9 (N = 25) and 3.9e-12 (N = 49) over 200 and 300 beats, plateau minimum 0.783485 against 0.783485 and 0.884522 against 0.884522 (W = 0.0611, 0.0308); at E-FRC-0236's box within 4.7e-3 (N = 9, W = 0.213, minimum 0.4566 against 0.4569) and 5.1e-4 (N = 11). CONTROL: with the force step off the charge's kick has no fixed point and the survival falls to 1.9e-3 and 1.1e-3. So the charge's static dressing IS the Weyl displacement beta of the harmonic reading, to 1e-9 in the exact rule at N >= 25. The frames (predictions, stated before E-FRC-0239 and 0240 ran): Lang-Firsov removes the kick exactly (|kappa| 1.8e-17 against the lab 0.114 at N = 25, L = 512) and leaves a dressed hop of off-vacuum amplitude 0.067, W = 0.254 and 0.129 (N = 25, 49); Silbey-Harris keeps a kick 0.047 and a dressed hop 0.024, W = 0.028 and 0.014. The predicted rates: Lang-Firsov 0.853 and 0.920 of the bare golden rule (the dressed gap closed to 0.250 from 0.286 by the slow modes' ln L), Silbey-Harris 0.984 and 0.991. E-FRC-0237's lab restriction measured 0.860 and 0.928, which sits on Lang-Firsov's numbers.",
    })
  },
})
