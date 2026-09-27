// Randall-Sundrum's short-range correction with the spin-2 field in the bulk (E-GRV-0142): statics only. E-GRV-0137's
// layered lapse stack, its KK tower now carrying the tensor field that E-GRV-0138, 0139 and 0141 derived from the
// rule's own slide (linearized Einstein-Hilbert, speed c, lambda = 1), and the correction coefficient c_2 in
// V = (G M / r)(1 + c_2 / r^2 + ...) extrapolated in the layering L exactly as E-GRV-0137 did.
//
// WHY (note/research/vibe/roadmap/remaining-pieces.md, "The Randall-Sundrum number"). The scalar depth's c_2 converges
// to the scalar's own continuum 1 / (2 k^2), 0.971 extrapolated and 0.998 from the kernel, which is 3/4 of RS's
// 2 / (3 k^2). The missing 4/3 was predicted to be the massive spin-2 modes' tensor structure.
//
// THE DERIVATION, before any number was computed (code/measure/tensor-stack gives each step):
//  - THE RADIAL EQUATION. Write delta g_mn = a(y)^2 h_mn with a = e^(-ky). The stack's slab j carries s_j = 6 a_j^2
//    (per husk dock, sqrt(-g) g^xx) times the 4d form at momentum k, and its vertical link c_j (sqrt(-g) g^yy) times the
//    5d form's y part in axial gauge (h_m5 = 0), -(1/2) h'.h' + (1/2) (tr h')^2. On the five transverse traceless
//    polarizations the 4d Fierz-Pauli form is exactly -(1/2) k^2 G and the y part exactly -(1/2) G, G the Gram matrix
//    of h.h, because every term with k^m h_mn or tr h vanishes there. The scalar depth's slab is s_j (-(1/2) k^2) and
//    its link c_j (-(1/2)). So THE TENSOR OPERATOR ON THE STACK IS THE SCALAR'S TENSORED WITH G: its pencil
//    (C x G) v = m^2 (S x G) v has the scalar's m_n^2, once per polarization, and eigenvectors psi_n x e, so the brane
//    wavefunctions psi_n(0) are the scalar's. The same stackModes / layeringModes / braneKernel machinery gives the
//    tensor tower directly; nothing in the polarization factor carries a slab index, so this holds at every L at once.
//  - THE COUPLING. Each massive KK mode is a Fierz-Pauli graviton of mass m_n (the 5d massless form at k_5 = m_n is
//    the 4d form plus -(1/2) m^2 (h.h - (tr h)^2)), and its exchange between static sources is (T.T - (tr T)^2 / 3) /
//    (p^2 + m^2) against the massless 4d graviton's (T.T - (tr T)^2 / 2) / p^2. For T_00 alone that is 2/3 against
//    1/2, the ratio 4/3 (Garriga and Tanaka 2000). With the zero mode normalized to Newton's G, the tensor kernel is
//    K_T(p) = w_0 / p^2 + (4/3) sum_n w_n / (p^2 + m_n^2), so a_T = (4/3) a and
//      c_2,tensor(L) = (4/3) c_2,scalar(L) = (4/3) R(L) / (2 k^2) -> 2 / (3 k^2).
//    The extrapolated ratio to RS's number is therefore PREDICTED to be E-GRV-0137's ratio to the scalar's own
//    continuum: 0.971 from the real-space fit, 0.998 from the kernel.
//  - WHAT IS DERIVED AND WHAT IS IMPORTED. The 4d kernel is E-GRV-0141's (compared exactly here, T0). The massive
//    modes' 1/3 is Einstein-Hilbert's 1 / (D - 2) at D = 5, equivalently the Fierz-Pauli mass term's tuning: it holds
//    only if the BULK's depth direction carries the same Einstein-Hilbert form, which no slide experiment has shown
//    (E-GRV-0138 .. 0141 worked on the husk's 3 + 1 dimensions). The zero mode's 1/2 needs the brane's bending: the
//    naive five-dimensional zero mode has 1/3 as well (reported), and Garriga and Tanaka's brane-bending term, not
//    computed here, is what restores 1/2. Neither the background's own terms (the bulk cosmological constant and the
//    tension, which cancel on TT in the continuum) nor that bending is reproduced on the lattice.
//
// GATES, fixed before the first run of this file.
//  T0 the machinery: (a) the real Fierz-Pauli form used here equals cubic-slide's fierzPauli kernel (E-GRV-0141's
//     independent route) in every coefficient, exactly, over both of E-GRV-0141's primes; (b) the transverse traceless
//     space has 5 polarizations at a timelike and a spacelike momentum.
//  T1 (the brief's) the tensor tower's spectrum and brane wavefunctions equal the scalar's to 1e-10 at each L: the TT
//     block's lateral and vertical ratios G^-1 A / (-(1/2) k^2) and G^-1 B / (-(1/2)) are the identity to 1e-10 at a
//     timelike (rest frame) and a spacelike momentum, AND at every L = 1 .. 16 the stack's tensor brane kernel, built
//     by the block admittance with no reduction, equals the scalar's times G^-1 to 1e-10 at 9 momenta p = 2e-3 ..
//     2e-3 / 16^2 (the poles and residues of a rational kernel are its spectrum and brane wavefunctions).
//  TF the coupling is computed, not typed: the massless 4d factor f_0, the massive Fierz-Pauli factor f_m at 8 of the
//     tower's own masses, and the 5d massless factor at k_5 = m for the same masses, each by the pseudo-inverse with
//     the gauge null space dropped (leak of the source into it under 1e-12); every f_m equals every 5d value to 1e-10.
//     The tower is reweighted by f_m / f_0.
//     AS RUN FROM THE SECOND RUN ON (the first run's method was defective, see FIRST RUN; the statement and its
//     tolerance are kept, the arithmetic made exact): the source's overlap with every gauge direction is exactly 0;
//     over both primes, f_m at m / p = b and 1 / b (b = 1 .. 30) is the residue of the float f_m at m = p, and the 5d
//     massless form (de Donder, g = 1) at k_5 = m gives exactly the massive 4d form's W for T and T'; f_0 is the
//     residue of the float f_0 and the same at g = 1 and 2. Each identity is a polynomial in m^2 / p^2 of degree at
//     most 24 vanishing at 60 points, so it holds at every mass of the tower (whose m / p runs 5e-3 .. 6e3 at the
//     kernel's p). The tower is reweighted by the rational f_m / f_0 those residues fix.
//  T2 (the brief's) the fitted c_2,tensor over RS's 2 / (3 k^2), extrapolated with A + B / L + C / L^2 through L = 4,
//     8, 16 (E-GRV-0137's own form and radii), is within 5 percent of 1.
//  T3 (the brief's) the zero mode's coefficient is unchanged: at every L the tensor fit's G equals the scalar fit's G
//     and w_0 = 1 / sum s to 1e-4 (E-GRV-0137's R2b tolerance), while the massive part's share moves by f_m / f_0.
//  CS the scalar (reweight 1) reproduces E-GRV-0137's extrapolated 0.72825 of RS to 1e-9.
//  CM a massless-only tensor (the zero mode alone) gives |c_2| under 1e-12 at every L.
//  CF the tuning matters: a mass term -(1/2) m^2 (h.h - a (tr h)^2) with a = 0 or 1/2 gives a static factor at least
//     0.01 from f_m, so the 4/3 is Fierz and Pauli's and not any massive spin-2's. (First run at a middle tower mass
//     with the defective solve; from the second run at m = p, where the float solve is well conditioned.)
// Verdict: pass if every gate holds; fail otherwise.
// REPORTED: per L the fitted and kernel c_2,tensor over RS, the local r^2 (U_T / w_0 - 1) over 2 / (3 k^2) at
// r = 4 .. 128, the vDVZ limit (f_m at m = p / 64, exact and float), and the naive 5d zero mode's factor (k_5 = 0).
//
// FIRST RUN (tmp/rs2-exp-run1.log, 3 s): FAIL on TF, T2, CM and CF. No gate moved.
//  - T0 holds (0 of 60 kernel coefficients off over both primes; 5 and 5 polarizations). T1 holds: the TT block is the
//    identity to 2.2e-16 and the tensor kernel equals the scalar's times G^-1 to 6.7e-16 at every L.
//  - TF FAILED ON A DEFECT OF METHOD, not of physics: the float pseudo-inverse read f_m = 1/2 at the tower's lightest
//    mass (m / p = 1e-5) and 2/3 at its heaviest (spread 0.167), and f_m was taken from the lightest, so the tower was
//    reweighted by 1.000 and T2 read the scalar's 0.7282 again. The massive form's helicity-0 direction sits at an
//    eigenvalue of order m^4 / p^2 and carries the whole vDVZ part of W; the solver's 1e-10 cut and its 1e-12
//    off-diagonal residue drop it. CF failed for the same reason (a = 1/2 read 0.5000 at a middle mass). Replaced by
//    exact arithmetic (TF above), which cannot drop a direction.
//  - CM FAILS AND STAYS FAILED: the zero mode alone fits |c_2| up to 8.3e-12 against a gate of 1e-12, the least-squares
//    fit's own round-off on a constant (the kernel's a is exactly 0). The gate was set too tight for a fit; it is kept.
//  - CS, T3 hold: the scalar reproduces 0.7282461128403613 exactly, and G equals w_0 to 5.1e-6.
// SECOND AND THIRD RUNS crashed before a verdict: modular-linear's inverseMatrixMod refuses an invertible matrix whose
// echelon pivots come out of column order (tensor-stack's solveMod pivots per column instead), and dyadicMod refuses
// entries near 1e6, so the reported vDVZ momentum went from 1000 to 64.
//
// FOURTH RUN (tmp/rs2-exp-run4.log, the record, 3.4 s): FAIL on CM only. No gate moved.
//  - T0: 0 of 60 kernel coefficients off E-GRV-0141's fierzPauli over both primes; 5 TT polarizations at rest and at
//    a spacelike momentum.
//  - T1: G^-1 A / (-(1/2) k^2) and G^-1 B / (-(1/2)) are the identity to 2.2e-16; the block-admittance tensor kernel
//    equals the scalar's times G^-1 to 6.7e-16 at 9 momenta and every L. The tower is the scalar's, per polarization.
//  - TF: f_0 = 1/2 and f_m = 2/3 (the float values' residues), exact over both primes at m / p = 1/30 .. 30, the 5d
//    massless form at k_5 = m equal to the massive 4d one in every W, f_0 the same in two gauges, gauge leak 0. Ratio
//    4/3, used as the rational.
//  - T2: the tensor c_2 over RS's 2 / (3 k^2) is 0.1152, 0.3432, 0.5818, 0.7537, 0.8567 fitted at L = 1 .. 16 (kernel
//    0.1155, 0.3465, 0.5915, 0.7700, 0.8776, the derived R(L)), extrapolated 0.9710 (gate 0.95 .. 1.05); the kernel's
//    extrapolate to 0.9976. These are E-GRV-0137's ratios to the scalar's own continuum, as derived: the 4/3 carries
//    the scalar result across exactly, and the fit's 3 percent shortfall against the kernel is E-GRV-0137's own.
//  - T3: the tensor fit's G equals the scalar fit's and w_0 to 6.8e-6.
//  - CS: 0.7282461128403613, E-GRV-0137's value to every digit. CF: a = 0 gives 0 and a = 1/2 gives 1/2, not 2/3.
//  - CM FAILS as in the first run: |c_2| 8.3e-12 from the fit's round-off against the 1e-12 gate.
//  - REPORTED: the naive 5d zero mode (k_5 = 0) has 2/3, not 1/2, so the zero mode's 1/2 is the 4d husk's
//    Einstein-Hilbert (E-GRV-0141), and the brane bending that makes a 5d bulk agree with it is not computed here.
//    Local r^2 (U_T / w_0 - 1) over 2 / (3 k^2) at L = 16 climbs 0.385, 0.550, 0.697, 0.796, 0.847, 0.867 over
//    r = 4 .. 128.
//
// Depth L1: a derivation checked by a second method (the block admittance against the scalar's tower) and by exact
// comparison with E-GRV-0141's kernel; the tensor structure of the massive modes is Einstein-Hilbert's in five
// dimensions, which the rule has not been shown to carry in its depth direction; no dynamics.
// DETERMINISM: nothing is drawn. NOTHING MOVES: this file reads values only.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { openMesh } from '@/code/rule/open-husk'
import { stackLayers, type StackMode } from '@/code/measure/open-husk'
import { fierzPauli, quadraticKernel } from '@/code/measure/cubic-slide'
import { norm } from '@/code/algebra/jet-polynomial'
import { inverseMod, mod, mulMod, primeBelow } from '@/code/algebra/linear/modular-linear'
import { braneKernel, correctionFit, fixedBulkLayering, layeringModes, logCoefficient, modeProfile, zeroModeWeight } from '@/code/measure/rs-layering'
import {
  exactTensorFactor,
  fierzPauliKernelKeys,
  kernelOff,
  reweightTower,
  smallRational,
  tensorBraneKernel,
  tensorFactor,
  ttBlock,
  zeroModeOnly,
} from '@/code/measure/tensor-stack'

const SIDE = 64
const LAYERS = 4
const PER_DOUBLING: readonly number[] = [1, 2, 4, 8, 16]
const DEEP_FLOOR = 1e-10
const KERNEL_FLOOR = 1e-30
const KERNEL_P = 2e-3
const KERNEL_GRID: readonly number[] = Array.from({ length: 9 }, (_, i) => KERNEL_P * 16 ** (-i / 4))
const FAR_R: readonly number[] = Array.from({ length: 13 }, (_, i) => 32 * 2 ** (i / 4))
const LOCAL_R: readonly number[] = [4, 8, 16, 32, 64, 128]
const PRIMES = [primeBelow(2 ** 25), primeBelow(2 ** 24)]
// the exact identities are checked at m / p = b and 1 / b for b = 1 .. 30: more points than the degree (at most 24) of
// the polynomial whose vanishing each identity is, so each holds for every m / p, the tower's included
const EXACT_POINTS = 30
const IDENTITY_TOLERANCE = 1e-10
const RS_TOLERANCE = 0.05
const G_READ_TOLERANCE = 1e-4
const MASSLESS_TOLERANCE = 1e-12
const TUNING_GAP = 0.01
// p / m for the reported vDVZ reading (m = 1); dyadicMod reads entries up to 2^13, so p^2 <= 2^12
const VDVZ_MOMENTUM = 64
// E-GRV-0137's extrapolated fit over RS (tmp/rs-run1.log, metric overRS), the control's target
const E_GRV_0137_OVER_RS = 0.7282461128403613
const REPRODUCE_TOLERANCE = 1e-9
const SPACELIKE = [0, 1, 0, 0]
const TIMELIKE = [1, 0, 0, 0]

type PerL = {
  L: number
  kernelOffWorst: number
  scalarFit: { G: number; c2: number }
  tensorFit: { G: number; c2: number }
  masslessC2: number
  scalarKernel: number
  tensorKernel: number
  w0: number
  local: number[]
  masses: number[]
  modes: StackMode[]
}

export default experiment({
  id: 'gravity/tensor-layering',
  code: 'E-GRV-0142',
  title:
    "Randall-Sundrum's short-range correction with the spin-2 field in the layered bulk reaches RS's 2/(3k^2), fail on CM only (a control's 1e-12 gate on a least-squares fit): on E-GRV-0137's stack the transverse traceless block of the Fierz-Pauli form is the scalar depth's operator times the Gram matrix to 2.2e-16, and the block-admittance tensor kernel equals the scalar's times G^-1 to 6.7e-16 at every L, so the tensor tower's masses and brane wavefunctions are the scalar's; the static exchange factor is exactly 1/2 for the massless 4d graviton and 2/3 for every massive Fierz-Pauli one (exact over two primes at m/p = 1/30 .. 30, equal to the 5d massless form at k_5 = m), ratio 4/3; reweighted, c_2 over RS is 0.115 .. 0.857 at L = 1 .. 16 and extrapolates to 0.971 (kernel 0.998, gate within 0.05), with G unchanged to 6.8e-6; the scalar reproduces E-GRV-0137's 0.7282 and a detuned mass term gives 0 or 1/2; the 4d kernel is E-GRV-0141's exactly, but the massive modes' 1/3 is Einstein-Hilbert's in five dimensions, which no slide experiment has shown the depth direction to carry, and the zero mode's 1/2 needs brane bending that is not computed (the naive 5d zero mode reads 2/3)",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)

    // THE CURVATURE, from E-GRV-0105's own stack (the rule's shrinking mesh, E-GRV-0137's reading)
    const stack = stackLayers(openMesh(SIDE, LAYERS, 'shrink').sides, 'lapse_upper')
    const spacing1 = Math.sqrt(stack.stiff[0]! / stack.conduct[0]!)
    const k = Math.log(stack.stiff[0]! / stack.stiff[1]!) / (2 * spacing1)
    const rs = 2 / (3 * k * k)

    // T0a: the real form against E-GRV-0141's exact kernel
    const real = fierzPauliKernelKeys()
    let t0Off = 0
    let t0Fraction = 0

    for (const p of PRIMES) {
      const exact = quadraticKernel(fierzPauli(1, p), p)

      for (const key of new Set([...real.keys(), ...exact.keys()])) {
        const v = real.get(key) ?? 0
        const r = Math.round(4 * v)

        if (Math.abs(4 * v - r) > 1e-9) t0Fraction++
        if (norm(r, p) !== norm(4 * (exact.get(key) ?? 0), p)) t0Off++
      }
    }

    // T0b and the first half of T1: the TT block at a timelike and a spacelike momentum
    const rest = ttBlock(TIMELIKE)
    const space = ttBlock(SPACELIKE)
    const t0 = t0Off === 0 && t0Fraction === 0 && rest.polarizations === 5 && space.polarizations === 5
    const blockOff = Math.max(rest.lateralOff, rest.verticalOff, space.lateralOff, space.verticalOff)

    log('forms')

    // the tower per L
    const perL: PerL[] = PER_DOUBLING.map(L => {
      const deep = fixedBulkLayering(k, L, DEEP_FLOOR)
      const kernelLayering = fixedBulkLayering(k, L, KERNEL_FLOOR)
      const modes = layeringModes(deep)
      const w0 = zeroModeWeight(deep)
      const kernelOffWorst = Math.max(...KERNEL_GRID.map(p => kernelOff(tensorBraneKernel(kernelLayering, space, p), space.gram, braneKernel(kernelLayering, p))))
      const massive = modes.filter(m => m !== zeroModeOnly(modes)[0]).map(m => m.mass)

      log(`L ${L} (${deep.stiff.length} slabs)`)

      return {
        L,
        kernelOffWorst,
        scalarFit: correctionFit(modes, FAR_R),
        tensorFit: { G: 0, c2: 0 },
        masslessC2: correctionFit(zeroModeOnly(modes), FAR_R).c2,
        scalarKernel: logCoefficient(kernelLayering, KERNEL_P).c2,
        tensorKernel: 0,
        w0,
        local: [],
        masses: massive,
        modes,
      }
    })

    // TF: the coupling. The float factors at m = p (well conditioned), then every claim exactly over both primes
    const pool = [...perL[perL.length - 1]!.masses].sort((a, b) => a - b)
    const zero = tensorFactor(4, SPACELIKE, { gauge: 1 })
    const massive = tensorFactor(4, SPACELIKE, { mass2: 1 })
    const fm = massive.factor
    const leak = Math.max(zero.leak, massive.leak, tensorFactor(5, [...SPACELIKE, 1], { gauge: 1 }).leak)
    const zeroRational = smallRational(zero.factor)
    const massiveRational = smallRational(fm)
    let exactOff = 0

    for (const p of PRIMES) {
      const residue = (r: [number, number] | undefined): number => (r ? mulMod(mod(r[0], p), inverseMod(r[1], p), p) : -1)
      const f0 = exactTensorFactor(4, SPACELIKE, { gauge: 1 }, p)

      // the float factors are the exact ones; f_0 is the same in two gauges
      if (f0.factor !== residue(zeroRational)) exactOff++
      if (exactTensorFactor(4, SPACELIKE, { gauge: 2 }, p).factor !== f0.factor) exactOff++
      for (let b = 1; b <= EXACT_POINTS; b++) {
        // m / p = b and 1 / b: the massive factor is f_m, and the 5d massless form at k_5 = m is the massive 4d form
        for (const [k4, m2] of [
          [[0, 1, 0, 0], b * b],
          [[0, b, 0, 0], 1],
        ] as [number[], number][]) {
          const four = exactTensorFactor(4, k4, { mass2: m2 }, p)
          const five = exactTensorFactor(5, [...k4, Math.sqrt(m2)], { gauge: 1 }, p)

          if (four.factor !== residue(massiveRational)) exactOff++
          if (five.staticW !== four.staticW || five.referenceW !== four.referenceW) exactOff++
        }
      }
    }

    const tf = leak === 0 && exactOff === 0 && zeroRational !== undefined && massiveRational !== undefined
    const ratio = zeroRational && massiveRational ? (massiveRational[0] * zeroRational[1]) / (massiveRational[1] * zeroRational[0]) : Number.NaN

    // the tensor tower's readings
    for (const p of perL) {
      const tower = reweightTower(p.modes, ratio)

      p.tensorFit = correctionFit(tower, FAR_R)
      p.tensorKernel = ratio * p.scalarKernel
      p.local = LOCAL_R.map(r => (r * r * (modeProfile(tower, r) / p.w0 - 1)) / rs)
    }

    // THE GATES
    const kernelWorst = Math.max(...perL.map(p => p.kernelOffWorst))
    const t1 = blockOff <= IDENTITY_TOLERANCE && kernelWorst <= IDENTITY_TOLERANCE
    const at = (L: number): PerL => perL.find(p => p.L === L)!
    const extrapolate = (pick: (p: PerL) => number): number => (8 * pick(at(16)) - 6 * pick(at(8)) + pick(at(4))) / 3
    const tensorOverRS = extrapolate(p => p.tensorFit.c2) / rs
    const tensorKernelOverRS = extrapolate(p => p.tensorKernel) / rs
    const scalarOverRS = extrapolate(p => p.scalarFit.c2) / rs
    const t2 = Math.abs(tensorOverRS - 1) <= RS_TOLERANCE
    const gOff = Math.max(...perL.map(p => Math.max(Math.abs(p.tensorFit.G / p.scalarFit.G - 1), Math.abs(p.tensorFit.G / p.w0 - 1))))
    const t3 = gOff <= G_READ_TOLERANCE
    const cs = Math.abs(scalarOverRS - E_GRV_0137_OVER_RS) <= REPRODUCE_TOLERANCE
    const masslessWorst = Math.max(...perL.map(p => Math.abs(p.masslessC2)))
    const cm = masslessWorst <= MASSLESS_TOLERANCE
    const detuned = [0, 0.5].map(a => tensorFactor(4, SPACELIKE, { mass2: 1, traceWeight: a }).factor)
    const cf = detuned.every(f => Math.abs(f - fm) >= TUNING_GAP)
    const status = t0 && t1 && tf && t2 && t3 && cs && cm && cf ? 'pass' : 'fail'

    // REPORTED: the float pseudo-inverse's failure at small m / p (the first run's defect), the exact vDVZ residue at
    // m / p = 1e-3, and the naive five-dimensional zero mode (k_5 = 0)
    const vdvzExact = exactTensorFactor(4, [0, VDVZ_MOMENTUM, 0, 0], { mass2: 1 }, PRIMES[0]!).factor
    const vdvz = vdvzExact === mulMod(mod(massiveRational?.[0] ?? 0, PRIMES[0]!), inverseMod(massiveRational?.[1] ?? 1, PRIMES[0]!), PRIMES[0]!) ? fm : Number.NaN
    const naiveZero = tensorFactor(5, [...SPACELIKE, 0], { gauge: 1 }).factor
    const vdvzFloat = tensorFactor(4, [0, VDVZ_MOMENTUM, 0, 0], { mass2: 1 }).factor
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(2)
    const row = (pick: (p: PerL) => number): string => perL.map(p => f(pick(p))).join(', ')
    const metrics: Record<string, number> = {
      gate_T0: t0 ? 1 : 0,
      gate_T1: t1 ? 1 : 0,
      gate_TF: tf ? 1 : 0,
      gate_T2: t2 ? 1 : 0,
      gate_T3: t3 ? 1 : 0,
      gate_CS: cs ? 1 : 0,
      gate_CM: cm ? 1 : 0,
      gate_CF: cf ? 1 : 0,
      curvature: k,
      rsCoefficient: rs,
      t0Off,
      t0Fraction,
      blockOff,
      kernelWorst,
      zeroFactor: zero.factor,
      massiveFactor: fm,
      ratio,
      leak,
      exactOff,
      vdvzFloat,
      lightestMass: pool[0]!,
      heaviestMass: pool[pool.length - 1]!,
      tensorOverRS,
      tensorKernelOverRS,
      scalarOverRS,
      gOff,
      masslessWorst,
      detunedZero: detuned[0]!,
      detunedHalf: detuned[1]!,
      vdvz,
      naiveZero,
      seconds: (Date.now() - started) / 1000,
    }

    perL.forEach(p => {
      const key = `L${p.L}`

      metrics[`${key}_c2TensorFit`] = p.tensorFit.c2
      metrics[`${key}_c2TensorKernel`] = p.tensorKernel
      metrics[`${key}_c2ScalarFit`] = p.scalarFit.c2
      metrics[`${key}_tensorFitOverRS`] = p.tensorFit.c2 / rs
      metrics[`${key}_tensorKernelOverRS`] = p.tensorKernel / rs
      metrics[`${key}_GTensor`] = p.tensorFit.G
      metrics[`${key}_GScalar`] = p.scalarFit.G
      metrics[`${key}_w0`] = p.w0
      metrics[`${key}_kernelOff`] = p.kernelOffWorst
      metrics[`${key}_masslessC2`] = p.masslessC2
      LOCAL_R.forEach((r, j) => (metrics[`${key}_local_r${r}`] = p.local[j]!))
    })

    return verdict({
      status,
      claim: `E-GRV-0137's stack (k = ${f(k)}, RS's 2 / (3 k^2) = ${f(rs)}) with the spin-2 field in the bulk: the TT block is the scalar's operator times G to ${e(blockOff)} (5 polarizations), and the block-admittance tensor kernel equals the scalar's times G^-1 to ${e(kernelWorst)} at every L (gate 1e-10); the Fierz-Pauli exchange of a static T_00 gives ${f(zero.factor)} for the massless 4d graviton and ${f(fm)} for every massive one (exact over two primes at m / p = 1/${EXACT_POINTS} .. ${EXACT_POINTS}, equal to the 5d massless form at k_5 = m, ${exactOff} residues off; gauge leak ${leak}), ratio ${zeroRational && massiveRational ? `${massiveRational[0] * zeroRational[1]}/${massiveRational[1] * zeroRational[0]}` : 'none'}; the tensor tower's fitted c_2 over RS at L = ${PER_DOUBLING.join(', ')} is ${row(p => p.tensorFit.c2 / rs)} (kernel ${row(p => p.tensorKernel / rs)}), extrapolated ${f(tensorOverRS)} (gate 1 within 0.05; kernel ${f(tensorKernelOverRS)}); G equals the scalar's and w_0 to ${e(gOff)}; the scalar reproduces E-GRV-0137's ${f(scalarOverRS)}, the zero mode alone gives |c_2| ${e(masslessWorst)}, and a detuned mass term (a = 0, 1/2) gives ${detuned.map(f).join(', ')}`,
      metrics,
      control: { cs: cs ? 1 : 0, cm: cm ? 1 : 0, cf: cf ? 1 : 0, scalarOverRS, masslessWorst },
      notes: `L1. T0 ${t0} (kernel off ${t0Off}, non-quarter ${t0Fraction}, polarizations ${rest.polarizations} and ${space.polarizations}), T1 ${t1}, TF ${tf}, T2 ${t2}, T3 ${t3}, CS ${cs}, CM ${cm}, CF ${cf}. The L = 16 tower's massive range ${e(pool[0]!)} .. ${e(pool[pool.length - 1]!)} a dock. vDVZ: at m / p = 1/${VDVZ_MOMENTUM} the exact residue is f_m's (${f(vdvz)}), not f_0's, and the pivoted float solve reads ${f(vdvzFloat)} (the first run's eigen pseudo-inverse read 1/2 at m / p = 1e-5, where the helicity-0 eigenvalue is O(m^4)). The naive 5d zero mode (k_5 = 0) gives ${f(naiveZero)}: the brane's bending, not computed here, is what makes the zero mode's 1/2. Local r^2 (U_T / w_0 - 1) over 2 / (3 k^2) at r = ${LOCAL_R.join(', ')}: ${perL.map(p => `L ${p.L}: ${p.local.map(f).join(' ')}`).join('; ')}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
