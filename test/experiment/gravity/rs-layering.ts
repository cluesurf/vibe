// Randall-Sundrum's short-range correction resolved in layers per doubling (E-GRV-0137): statics only. E-GRV-0105's
// lapse stack cut into L = 1, 2, 4, 8, 16 slabs a doubling at the same curvature (code/measure/open-husk
// warpedLayering), the husk's static potential read through the stack's own mode sum with no box, and the correction
// coefficient c_2 in V = (G M / r)(1 + c_2 / r^2 + ...) extrapolated in L.
//
// WHY (note/research/vibe/roadmap/discrete-gravity.md, E-GRV-0100 .. 0105 and 0117). The one-slab stacks held about a fifth
// of their own continuum's correction at r = 4, and E-GRV-0105 said reaching RS's 2 / (3 k^2 r^2) needs about 8 slabs a
// doubling and k r >> 1. Finer layering exists as theory (warpedLayering) and the mode sum is the infinite husk's own
// potential, so both can be had at once.
//
// THE DERIVATION, before any number was computed (code/measure/rs-layering, its header gives every step):
//  - THE CURVATURE. k = ln(s_0 / s_1) / (2 l) with l = sqrt(s_0 / c_0), read off E-GRV-0105's own stack weights
//    (stackLayers lapse_upper): ln 2 / sqrt 6 = 0.2830 a dock, the same at every L by construction (l = sqrt 6 / L), and
//    read back from every layering's lateral and vertical ratios alike.
//  - THE CONTINUUM. For the scalar depth in a one-sided AdS bulk with no brane term, c_2 = 1 / (2 k^2) = 6.24 docks^2.
//    RS's Newtonian 2 / (3 k^2) is 4/3 of it: the massive spin-2 tensor structure (T - T/3 against T - T/2), which a
//    scalar does not carry. SO THE SCALAR IS PREDICTED TO REACH 3/4 OF RS'S NUMBER, NOT 1.
//  - THE LAYERED c_2, exactly: c_2(L) = R(L) / (2 k^2), R(L) = x e^(-3x) / sinh x, x = ln 2 / L = k l: 0.1155, 0.3466,
//    0.5916, 0.7701, 0.8778 at L = 1, 2, 4, 8, 16, R = 1 - 3x + (13/3) x^2 + ..., so first order in 1 / L. Against RS's
//    2 / (3 k^2) that is 0.087, 0.260, 0.444, 0.578, 0.658, tending to 0.75.
//  - THE EXTRAPOLATION FORM, stated here: c_2(L) = A + B / L + C / L^2 through L = 4, 8, 16, so A = (8 c_2(16) - 6 c_2(8)
//    + c_2(4)) / 3. On the derived R that gives 0.998 of 1 / (2 k^2).
//  - NEWTON'S G = w_0 = 1 / sum s_j. At a fixed five-dimensional stiffness (every slab's weights times 1 / L, the one
//    normalization in which the layerings are one bulk resolved more finely) it is L (1 - 4^(-1/L)) / 6: 0.125, 0.167,
//    0.195, 0.212, 0.221 -> 2 ln 2 / 6 = 0.231. The one-slab stack is a left Riemann sum of the bulk with the husk at full
//    weight, so no normalization short of fixing sum s by hand holds G within 1 percent from L = 1. R2 AS SET BY THE BRIEF
//    IS PREDICTED TO FAIL. c_2 is a ratio and blind to the normalization.
//  - THE BOX AND THE 3 PERCENT. The stack's zero mode has the husk alone's shape, so the box's images cancel in E-GRV-0105's
//    k ratio for it; only the massive modes' images and the fit window enter. The smooth model can compute those two
//    exactly (code/measure/husk-box periodicGreen: E-GRV-0105's source and antipodal sink on the side-64 torus, its fit on
//    r = 4 .. 16). If they are not the 3 percent, what is left is the coarse layers' own lattice (side 4 at the deepest,
//    which cannot resolve p ~ 1 / r at r = 4 .. 16), and that exists only at L = 1: no lattice of 2^(1/L) steps exists.
//    Then R3 cannot be evaluated at L > 1 and is recorded as failing, not as passing.
//  - THE GROWING BULK (E-GRV-0094): lateral 6 e^(2ky), vertical (6 / l^2) e^(4ky), grounded below, has no zero mode:
//    a sum of Yukawas, no 1/r and so no c_2.
//
// THE RUN (no rule is run; the lattice enters only in C0 and C1 as linear solves): the fixed-bulk layerings to a floor
// of 1e-10 on the lateral weight (conformal depth 3.5e5 docks, so the discrete tower is the continuum's for r <= 256);
// their modes (the S^-1/2 C S^-1/2 eigenproblem); U(r) = 4 pi r G(r) = sum_n w_n e^(-m_n r), the zero mode at mass 0;
// the fit U = G (1 + c_2 / r^2 + c_4 / r^4) on r = 32 .. 256 (13 radii a quarter doubling apart, k r = 9 .. 72). Beside
// it, a second method with no modes: the brane kernel K(p) by the admittance from the bottom, to a floor of 1e-30, and
// c_2 = a / w_0 from K - w_0 / p^2 = -a ln p + ..., read between p = 2e-3 and p / 16.
//
// GATES, fixed before the first run of this file.
//  C0 the machinery: (a) at L = 1, 4 doublings, warpedLayering equals E-GRV-0105's stack (stackLayers lapse_upper) to
//     1e-12 in every weight; (b) every layering's lateral and vertical ratios read k to 1e-12; (c) the husk alone's k on
//     the lattice (a linear solve of E-GRV-0105's source) equals the periodic kernel's to 1e-6.
//  C1 L = 1 reproduces E-GRV-0105: the lattice stack's k ratio (the same linear solve, E-GRV-0105's reading) equals the
//     smooth model's periodic reading (window and box both in) within 0.005.
//  C2 a growing bulk screens: at every L (4 doublings, grounded) the lightest mode's mass is at least 0.1 a dock (no zero
//     mode) and U(24) / U(2) < 0.01.
//  R0 the methods agree: at every L the kernel's c_2 is within 1e-3 of the derived R(L) / (2 k^2), and the real-space
//     fit's c_2 within 1 percent of the kernel's.
//  R1 (the brief's) the fitted c_2 converges, |c_2(16) - c_2(8)| < |c_2(8) - c_2(4)| < |c_2(4) - c_2(2)|, and the
//     extrapolated A over RS's 2 / (3 k^2) is within 10 percent of 1. Predicted to fail: 0.75.
//  R1s the same A against the scalar's own continuum 1 / (2 k^2), within 3 percent.
//  R2 (the brief's) the fitted G at a fixed five-dimensional stiffness is within 1 percent of L = 1's at every L.
//     Predicted to fail (above).
//  R2b at every L the fitted G equals w_0 = 1 / sum s to 1e-4 (the fit reads the zero mode, not the correction).
//  R3 (the brief's) the smooth model's overshoot share / ratio - 1 (share = the zero mode's 6 w_0 at E-GRV-0105's depth
//     of 4 doublings; ratio = its periodic reading) falls strictly over L = 1 .. 16, AND C1 holds (otherwise that
//     overshoot is not E-GRV-0105's 3 percent and R3 is not evaluable).
// Verdict: pass if every gate holds; fail otherwise.
// REPORTED: per L the lightest massive range (E-GRV-0117's 40.9 .. 87.2), the local r^2 (U / w_0 - 1) over 1 / (2 k^2) at
// r = 4 .. 128, E-GRV-0105's force-form delta(4), c_4, G on the full-lattice normalization, and the three parts of the
// 3 percent at L = 1 (window, box, lattice).
//
// FIRST RUN (tmp/rs-run1.log, the record, 24 s): FAIL on C1, R0, R1, R2 and R3. No gate moved.
//  - C0 holds: the L = 1 layering is E-GRV-0105's stack to 8.9e-16, every layering reads k = 0.28298 to 4.7e-14, and the
//    husk alone's lattice k equals the periodic kernel's to 3.7e-13. C2 holds: the growing grounded bulk's lightest mass
//    is 0.39 .. 1.02 a dock and U(24) / U(2) is 1.8e-4 .. 1.6e-10, against the shrinking stack's 0.92 .. 0.73.
//  - THE DERIVATION HOLDS: the kernel's c_2 equals R(L) / (2 k^2) to 2.5e-4 at every L (0.7213, 2.164, 3.694, 4.808,
//    5.480 against 0.7213, 2.164, 3.694, 4.809, 5.481). G = 1 / sum s to 5.1e-6 (R2b).
//  - R0 FAILS on its second half: the real-space fit on r = 32 .. 256 reads c_2 0.3, 1.0, 1.6, 2.1, 2.4 percent under
//    the kernel's at L = 1 .. 16 (gate 1). The local r^2 (U / w_0 - 1) at L = 16 is still climbing at r = 128 (0.867 of
//    1 / (2 k^2) against the asymptote's 0.878), its gap falling about 3 times a doubling, not 4: the next term is not a
//    pure r^-4. The likely cause (not tested here) is the second order of the same near-brane sum, (eps ln eps)^2 in K,
//    which puts a ln r / r^4 in the relative correction that the fit's c_4 / r^4 cannot hold, and it grows with L.
//  - R1 FAILS as predicted: the steps 1.49, 1.07, 0.64 shrink, and A = 6.063, 0.728 of RS's 2 / (3 k^2) (the kernel's
//    own values extrapolate to 0.748, the derived 0.749). R1s HOLDS: 0.971 of the scalar's 1 / (2 k^2) (gate 0.03; the
//    kernel's extrapolate to 0.998).
//  - R2 FAILS as predicted: G at a fixed bulk is 0.1250, 0.1667, 0.1953, 0.2121, 0.2213, spread 0.77.
//  - R3 FAILS: C1 fails. The lattice stack's k ratio is 0.7262 (E-GRV-0105's 0.726 recomputed by the linear solve) and
//    the smooth periodic reading 0.7544 (off 0.028, gate 0.005). E-GRV-0105's 3.37 percent splits as window -0.45, box
//    -0.04, the coarse layers' own lattice +3.88: THE 3 PERCENT IS NOT THE BOX, it is the coarse layers. The smooth
//    overshoot does fall with L (-0.005, -0.018, -0.030, -0.038, -0.042), but it holds only the window and the box, so it
//    does not speak for the 3 percent, and no lattice of 2^(1/L) steps exists to read at L > 1.
//  - REPORTED: the lightest massive range at a floor of 1e-10 is 4.2e4 .. 8.7e4 docks (the gapless tower, cut only by
//    the floor); E-GRV-0105's force-form delta(4) is reproduced (0.0704, 0.162, 0.239, 0.288, 0.315).
//
// Depth L1: a derivation checked against the stack's own mode sum and a second method; no dynamics.
// DETERMINISM: nothing is drawn. NOTHING MOVES: this file reads values only.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lapseLinks,
  openMesh,
  type OpenMesh,
} from '@/code/rule/open-husk'
import {
  greenSolve,
  huskDock,
  openContent,
  stackLayers,
  stackModes,
} from '@/code/measure/open-husk'
import { periodicGreen } from '@/code/measure/husk-box'
import {
  antipodeReading,
  correctionFit,
  fixedBulkLayering,
  growingLayering,
  inverseCoefficient,
  layeredShare,
  layeringCurvature,
  layeringModes,
  logCoefficient,
  modeProfile,
  shallowLayering,
  zeroModeWeight,
  type Layering,
} from '@/code/measure/rs-layering'

const SIDE = 64
const LAYERS = 4
const CONTENT = 4
const PER_DOUBLING: readonly number[] = [1, 2, 4, 8, 16]
const DEEP_FLOOR = 1e-10
const KERNEL_FLOOR = 1e-30
const KERNEL_P = 2e-3
const FAR_R: readonly number[] = Array.from(
  { length: 13 },
  (_, i) => 32 * 2 ** (i / 4),
)
const LOCAL_R: readonly number[] = [4, 8, 16, 32, 64, 128]
const FIT_R: readonly number[] = Array.from(
  { length: 13 },
  (_, i) => i + 4,
)
const SCREEN_NEAR = 2
const SCREEN_FAR = 24
const MACHINE = 1e-12
const ALONE_TOLERANCE = 1e-6
const C1_TOLERANCE = 0.005
const LIGHTEST_LEAST = 0.1
const SCREENED = 0.01
const KERNEL_TOLERANCE = 1e-3
const FIT_TOLERANCE = 0.01
const RS_TOLERANCE = 0.1
const SCALAR_TOLERANCE = 0.03
const G_TOLERANCE = 0.01
const G_READ_TOLERANCE = 1e-4

const AXES: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// E-GRV-0105's linear reading: its source and sink, solved outright, the six-axis mean, the 1/r coefficient on r = 4 .. 16
function latticeK(mesh: OpenMesh): number {
  const h = SIDE / 2
  const rho = openContent(mesh, [
    { at: [0, 0, 0], units: CONTENT, to: [h, h, h] },
  ])
  const x = greenSolve(mesh, rho).x
  const W = FIT_R.map(
    r =>
      AXES.reduce(
        (t, a) =>
          t +
          x[
            huskDock(
              mesh,
              a.map(v => v * r),
            )
          ]!,
        0,
      ) / AXES.length,
  )

  return inverseCoefficient(FIT_R, W)
}

const worstOff = (a: readonly number[], b: readonly number[]): number =>
  Math.max(...a.map((v, i) => Math.abs(v / b[i]! - 1)))

type PerL = {
  L: number
  k: number
  derived: number
  kernel: number
  fit: { G: number; c2: number; c4: number }
  w0: number
  local: number[]
  delta4: number
  range: number
  shallowShare: number
  periodicRatio: number
  infiniteRatio: number
  growingLightest: number
  growingScreen: number
  rsScreen: number
}

export default experiment({
  id: 'gravity/rs-layering',
  code: 'E-GRV-0137',
  title:
    "Randall-Sundrum's short-range correction on E-GRV-0105's lapse stack cut into 1 to 16 slabs a doubling converges to the scalar's own continuum 1/(2k^2), which is 3/4 of RS's 2/(3k^2), fail on C1, R0, R1, R2 and R3: the derived c_2(L) = x e^(-3x)/sinh x / (2k^2), x = ln 2 / L, matches the brane kernel's log coefficient to 2.5e-4 at every L (0.115 .. 0.878 of the continuum); the real-space fit on r = 32 .. 256 reads 0.3 to 2.4 percent under it (gate 1) because the next term is not a pure r^-4; extrapolated in 1/L it gives 0.971 of the scalar's number and 0.728 of RS's (gate within 0.1 of 1), the missing 4/3 being the massive graviton's tensor structure a scalar depth does not carry; Newton's G at a fixed bulk runs 0.125 to 0.221 because the one-slab stack is a left Riemann sum; E-GRV-0105's 3 percent is the coarse layers' own lattice (+3.9 percent), not the box (-0.04) or the fit window (-0.45), so finer smooth layering cannot test it; a growing grounded bulk screens to 1e-4 by r = 24",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)

    // THE CURVATURE, from E-GRV-0105's own stack
    const aloneMesh = openMesh(SIDE, 0, 'shrink')
    const stackMesh = lapseLinks(openMesh(SIDE, LAYERS, 'shrink'))
    const stack = stackLayers(stackMesh.sides, 'lapse_upper')
    const spacing1 = Math.sqrt(stack.stiff[0]! / stack.conduct[0]!)
    const k =
      Math.log(stack.stiff[0]! / stack.stiff[1]!) / (2 * spacing1)
    const scalar = 1 / (2 * k * k)
    const rs = 2 / (3 * k * k)

    // C0a: warpedLayering at L = 1 is E-GRV-0105's stack
    const one = shallowLayering(k, 1, LAYERS)
    const c0a =
      one.stiff.length === stack.stiff.length &&
      worstOff(one.stiff, stack.stiff) <= MACHINE &&
      worstOff(one.conduct, stack.conduct) <= MACHINE
    const c0aOff = Math.max(
      worstOff(one.stiff, stack.stiff),
      worstOff(one.conduct, stack.conduct),
    )

    // C0c and C1: the lattice linear solves
    const kAloneLattice = latticeK(aloneMesh)

    log('lattice alone')

    const kStackLattice = latticeK(stackMesh)

    log('lattice stack')

    const aloneModes = stackModes(aloneMesh.sides, 'none')
    const kAlonePeriodic = inverseCoefficient(
      FIT_R,
      antipodeReading(periodicGreen(aloneModes, SIDE), FIT_R),
    )
    const kAloneInfinite = inverseCoefficient(
      FIT_R,
      FIT_R.map(r => modeProfile(aloneModes, r) / (4 * Math.PI * r)),
    )
    const aloneOff = Math.abs(
      kAloneLattice / (CONTENT * kAlonePeriodic) - 1,
    )
    const c0c = aloneOff <= ALONE_TOLERANCE
    const latticeRatio = kStackLattice / kAloneLattice

    let curvatureOff = 0

    const perL: PerL[] = PER_DOUBLING.map(L => {
      const deep = fixedBulkLayering(k, L, DEEP_FLOOR)
      const spacing = spacing1 / L
      const read = layeringCurvature(deep, spacing)

      for (const v of [...read.lateral, ...read.vertical]) {
        curvatureOff = Math.max(curvatureOff, Math.abs(v / k - 1))
      }

      const modes = layeringModes(deep)
      const w0 = zeroModeWeight(deep)
      const fit = correctionFit(modes, FAR_R)
      const kernel = logCoefficient(
        fixedBulkLayering(k, L, KERNEL_FLOOR),
        KERNEL_P,
      ).c2
      const massive = modes.filter(m => m.mass > 1e-6)
      const range = 1 / Math.min(...massive.map(m => m.mass))
      const local = LOCAL_R.map(
        r => (r * r * (modeProfile(modes, r) / w0 - 1)) / scalar,
      )
      // E-GRV-0105's force-form delta at r = 4: the force over the zero mode's share of the husk alone's, less 1
      const G = (r: number): number =>
        modeProfile(modes, r) / (4 * Math.PI * r)
      const delta4 =
        (G(4) - G(5)) /
          (w0 * (1 / (4 * Math.PI * 4) - 1 / (4 * Math.PI * 5))) -
        1

      // E-GRV-0105's depth (4 doublings), full-lattice weights: the share, its periodic and infinite readings
      const shallow = shallowLayering(k, L, LAYERS)
      const shallowModes = layeringModes(shallow)
      const shallowShare = 6 * zeroModeWeight(shallow)
      const periodicRatio =
        inverseCoefficient(
          FIT_R,
          antipodeReading(periodicGreen(shallowModes, SIDE), FIT_R),
        ) / kAlonePeriodic
      const infiniteRatio =
        inverseCoefficient(
          FIT_R,
          FIT_R.map(
            r => modeProfile(shallowModes, r) / (4 * Math.PI * r),
          ),
        ) / kAloneInfinite

      // C2: the growing, grounded bulk
      const growing: Layering = growingLayering(k, L, LAYERS)
      const growingModes = layeringModes(growing)
      const yukawa = (r: number): number =>
        growingModes.reduce(
          (t, m) => t + m.weight * Math.exp(-m.mass * r),
          0,
        )
      const growingLightest = Math.min(...growingModes.map(m => m.mass))
      const growingScreen = yukawa(SCREEN_FAR) / yukawa(SCREEN_NEAR)
      const rsScreen =
        modeProfile(modes, SCREEN_FAR) / modeProfile(modes, SCREEN_NEAR)

      log(`L ${L} (${deep.stiff.length} slabs)`)

      return {
        L,
        k: read.lateral[0]!,
        derived: layeredShare(L) * scalar,
        kernel,
        fit,
        w0,
        local,
        delta4,
        range,
        shallowShare,
        periodicRatio,
        infiniteRatio,
        growingLightest,
        growingScreen,
        rsScreen,
      }
    })

    // THE GATES
    const c0b = curvatureOff <= MACHINE
    const c0 = c0a && c0b && c0c
    const atOne = perL[0]!
    const c1Off = Math.abs(atOne.periodicRatio - latticeRatio)
    const c1 = c1Off <= C1_TOLERANCE
    const c2 = perL.every(
      p =>
        p.growingLightest >= LIGHTEST_LEAST &&
        p.growingScreen < SCREENED,
    )
    const kernelOff = Math.max(
      ...perL.map(p => Math.abs(p.kernel / p.derived - 1)),
    )
    const fitOff = Math.max(
      ...perL.map(p => Math.abs(p.fit.c2 / p.kernel - 1)),
    )
    const r0 = kernelOff <= KERNEL_TOLERANCE && fitOff <= FIT_TOLERANCE
    const c2At = (L: number): number =>
      perL.find(p => p.L === L)!.fit.c2
    const steps = [
      Math.abs(c2At(4) - c2At(2)),
      Math.abs(c2At(8) - c2At(4)),
      Math.abs(c2At(16) - c2At(8)),
    ]
    const converges = steps[2]! < steps[1]! && steps[1]! < steps[0]!
    const extrapolated = (8 * c2At(16) - 6 * c2At(8) + c2At(4)) / 3
    const overRS = extrapolated / rs
    const overScalar = extrapolated / scalar
    const r1 = converges && Math.abs(overRS - 1) <= RS_TOLERANCE
    const r1s =
      converges && Math.abs(overScalar - 1) <= SCALAR_TOLERANCE
    const gSpread = Math.max(
      ...perL.map(p => Math.abs(p.fit.G / atOne.fit.G - 1)),
    )
    const r2 = gSpread <= G_TOLERANCE
    const gRead = Math.max(
      ...perL.map(p => Math.abs(p.fit.G / p.w0 - 1)),
    )
    const r2b = gRead <= G_READ_TOLERANCE
    const overshoot = perL.map(
      p => p.shallowShare / p.periodicRatio - 1,
    )
    const falls = overshoot.every(
      (o, i) => i === 0 || o < overshoot[i - 1]!,
    )
    const r3 = c1 && falls
    const status =
      c0 && c1 && c2 && r0 && r1 && r1s && r2 && r2b && r3
        ? 'pass'
        : 'fail'

    // REPORTED: the three parts of E-GRV-0105's 3 percent at L = 1
    const latticeOvershoot = atOne.shallowShare / latticeRatio - 1
    const windowPart = atOne.shallowShare / atOne.infiniteRatio - 1
    const boxPart = atOne.infiniteRatio / atOne.periodicRatio - 1
    const latticePart = atOne.periodicRatio / latticeRatio - 1
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(2)
    const metrics: Record<string, number> = {
      gate_C0: c0 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_C2: c2 ? 1 : 0,
      gate_R0: r0 ? 1 : 0,
      gate_R1: r1 ? 1 : 0,
      gate_R1s: r1s ? 1 : 0,
      gate_R2: r2 ? 1 : 0,
      gate_R2b: r2b ? 1 : 0,
      gate_R3: r3 ? 1 : 0,
      curvature: k,
      scalarCoefficient: scalar,
      rsCoefficient: rs,
      layeringOff: c0aOff,
      curvatureOff,
      aloneOff,
      latticeRatio,
      c1Off,
      kernelOff,
      fitOff,
      extrapolated,
      overRS,
      overScalar,
      gSpread,
      gRead,
      latticeOvershoot,
      windowPart,
      boxPart,
      latticePart,
      seconds: (Date.now() - started) / 1000,
    }

    perL.forEach((p, i) => {
      const key = `L${p.L}`

      metrics[`${key}_c2Fit`] = p.fit.c2
      metrics[`${key}_c2Kernel`] = p.kernel
      metrics[`${key}_c2Derived`] = p.derived
      metrics[`${key}_c2OverRS`] = p.fit.c2 / rs
      metrics[`${key}_c2OverScalar`] = p.fit.c2 / scalar
      metrics[`${key}_c4Fit`] = p.fit.c4
      metrics[`${key}_G`] = p.fit.G
      metrics[`${key}_w0`] = p.w0
      metrics[`${key}_GFullLattice`] = p.fit.G / p.L
      metrics[`${key}_lightestRange`] = p.range
      metrics[`${key}_delta4`] = p.delta4
      metrics[`${key}_shallowShare`] = p.shallowShare
      metrics[`${key}_periodicRatio`] = p.periodicRatio
      metrics[`${key}_infiniteRatio`] = p.infiniteRatio
      metrics[`${key}_overshoot`] = overshoot[i]!
      metrics[`${key}_growingLightest`] = p.growingLightest
      metrics[`${key}_growingScreen`] = p.growingScreen
      metrics[`${key}_rsScreen`] = p.rsScreen
      LOCAL_R.forEach(
        (r, j) => (metrics[`${key}_local_r${r}`] = p.local[j]!),
      )
    })

    const row = (pick: (p: PerL) => number): string =>
      perL.map(p => f(pick(p))).join(', ')

    return verdict({
      status,
      claim: `E-GRV-0105's lapse stack (k = ${f(k)} a dock, read off its own weights) cut into L = ${PER_DOUBLING.join(', ')} slabs a doubling: the fitted c_2 over RS's 2 / (3 k^2) = ${f(rs)} is ${row(p => p.fit.c2 / rs)} (derived ${row(p => p.derived / rs)}), over the scalar's 1 / (2 k^2) = ${f(scalar)} ${row(p => p.fit.c2 / scalar)}; the kernel method agrees with the derived R(L) to ${e(kernelOff)} and the fit with the kernel to ${e(fitOff)}; the steps ${steps.map(f).join(', ')} ${converges ? 'shrink' : 'do NOT shrink'}; A + B / L + C / L^2 through L = 4, 8, 16 gives ${f(extrapolated)}, ${f(overRS)} of RS's (gate 1 within 0.1) and ${f(overScalar)} of the scalar's (gate 0.03); G at a fixed bulk ${row(p => p.fit.G)} (spread ${f(gSpread)} against 0.01), equal to 1 / sum s to ${e(gRead)}; E-GRV-0105's overshoot share / ratio - 1 on the periodic side-${SIDE} husk ${overshoot.map(f).join(', ')} (${falls ? 'falling' : 'NOT falling'}), the lattice's ${f(latticeOvershoot)} at L = 1 = window ${f(windowPart)}, box ${f(boxPart)}, the coarse layers' lattice ${f(latticePart)} (C1 off ${f(c1Off)}, gate 0.005); a growing grounded bulk's lightest mass ${row(p => p.growingLightest)}, U(24) / U(2) ${row(p => p.growingScreen)} against the shrinking stack's ${row(p => p.rsScreen)}`,
      metrics,
      control: {
        c0: c0 ? 1 : 0,
        c1: c1 ? 1 : 0,
        c2: c2 ? 1 : 0,
        aloneOff,
        growingScreenWorst: Math.max(...perL.map(p => p.growingScreen)),
      },
      notes: `L1. C0 ${c0} (layering ${e(c0aOff)}, curvature ${e(curvatureOff)}, alone ${e(aloneOff)}), C1 ${c1}, C2 ${c2}, R0 ${r0}, R1 ${r1}, R1s ${r1s}, R2 ${r2}, R2b ${r2b}, R3 ${r3}. Local r^2 (U / w_0 - 1) over 1 / (2 k^2) at r = ${LOCAL_R.join(', ')}: ${perL.map(p => `L ${p.L}: ${p.local.map(f).join(' ')}`).join('; ')}. c_4 ${row(p => p.fit.c4)}. Lightest massive range at a floor of ${DEEP_FLOOR}: ${row(p => p.range)}. Force-form delta(4): ${row(p => p.delta4)}. G on full-lattice weights ${row(p => p.fit.G / p.L)}. Shallow share ${row(p => p.shallowShare)}, periodic ratio ${row(p => p.periodicRatio)}, infinite ratio ${row(p => p.infiniteRatio)}, lattice ratio ${f(latticeRatio)}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
