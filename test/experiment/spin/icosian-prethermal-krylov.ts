// STATE 2026-10-01: GATES WRITTEN, REGISTERED, GATE RUN STARTED on the work droplet (6 threads, after E-SPN-0186), no
// gate moved.
// DOES THE SMALL-ANGLE 2I BEAT KEEP THE ORDERED VACUUM ON A PATCH WITH A NEAR-CONTINUOUS SPECTRUM (E-SPN-0185, OPEN-STR-02)?
// E-SPN-0154 found, on the husk tetrahedron (3 loops, 29,288 Gauss states, a 1,589-state symmetric sector), that the
// prepared ground state of H = H_E + 8 H_B is lost within a beat for 1/delta up to 12, survives tau = 3, 10, 40, 40 beats
// at 1/delta 16, 24, 32, 49 (ln tau = 0.346 + 0.0778/delta) and is kept from 1/delta 64 on. Its "Next" named the gap: on
// a 1,589-level sector a decay can be CUT by the discrete spectrum, so the step from 40 beats to "kept" between 48.6 and
// 64.2 may be finite size, and "a Krylov evolution of the whole Gauss sector of a 4-loop patch at 1/delta 16 to 64 is the
// next measurement". This file is that measurement. The machinery is code/measure/gauss-orbit (the register stored on
// its Gauss orbits, threaded, matrix free) and code/measure/prethermal-krylov (the beat and the survival amplitude).
//
// DERIVED BEFORE THE RUN.
// 1. THE PATCH. The tetrahedron with an EAR (prethermal-patch huskTetrahedronEar): docks 0, (1,1,0), (1,0,1), (0,1,1) and
//    a fifth, (1,0,-1), one face diagonal from docks 0 and (1,1,0) only, closing a fifth husk triangle on link 01. 5 docks,
//    8 links, 5 triangles, loops 4. It CONTAINS the tetrahedron, so the size trend triangle (1 loop) < rhombus (2) <
//    tetrahedron (3) < this (4) is a chain of patches each inside the next. Gauge fixed on the breadth-first tree from dock
//    0 (links 01, 02, 03, 04), a configuration is 4 digits: 120^4 = 207,360,000 configurations, and the Gauss sector (the
//    global conjugation orbits, -1 central so A5 acts) is (1/120) sum_g |C(g)|^4 = 3,460,496 orbits (E-SPN-0154's
//    "about 1.7e6" was 120^4/120, which forgets that -1 acts trivially). Each patch automorphism (4 of them) keeps H, so
//    the symmetric sector is about 8.7e5 states: some 550 times the tetrahedron's 1,589, and its levels lie about 1e-3
//    apart in energy against a beat-frequency window that a run of 1,024 beats resolves only to 2 pi/1024 = 6e-3. Over
//    the run the spectrum is continuous to the beat.
// 2. THE HAMILTONIAN AND THE BEAT are E-SPN-0154's exactly: integer electric exponents n_R = d_R^2 - 1, the integer
//    magnetic class function n_B, r = 8 (E-SPN-0154's coupling, fixed here before any run so the two patches are
//    compared at one coupling; the plaquette on this patch is read, not chosen), F = E(theta) M(2 r theta) E(theta) with
//    w = e^(i theta) the least ring unit of Z[w][1/7] within 2% of each target delta (smallAngleUnits), E applied link by
//    link with each link's kernel u(h) = sum_R e^(i theta n_R) (d_R/120) chi_R(h) (linkUnitary).
// 3. THE MEASUREMENT, MATRIX FREE. psi0 = the lowest state of H on the Gauss sector, by restarted Lanczos from the
//    constant state (the r = 0 ground state, symmetric under every automorphism). The survival amplitude A(N) = <psi0|F^N
//    psi0> by doubling: F is complex symmetric in the orbit basis (u(h) = u(h^-1), M diagonal) and psi0 real, so A(2k) =
//    a_k^T E(2 theta) a_k and A(2k + 1) = b_k^T M b_k with a_(k+1) = M b_k: 512 passes of E(2 theta) give A(N) to N = 1,025.
//    tau is E-SPN-0154's: the first beat of the grid (1, then 10 a decade) where the running-mean fidelity over beats 1..N
//    falls to 1/2. A run stops at N = 1,025, or once tau is found and N >= 4 tau (and >= 16), reading the running mean
//    there.
// 4. THE PREDICTION (ADHH, counted as in E-SPN-0154). ln tau = a + c/delta with c in [2 pi/J_hi, 8 pi/J_lo]: J_lo =
//    max(max n_R, r max n_B) = max(35, 160) = 160 and J_hi = 35 + 3 x 160 = 515 (link 01 now sits on 3 triangles), so c in
//    [0.0122, 0.157]. ADHH's slope is a property of the LOCAL terms, so it should not move with the patch: the 4-loop slope
//    should match the tetrahedron's. What should move is the cut: the tetrahedron jumps from 40 beats to kept between 48.6
//    and 64.2, and on a continuous spectrum the line through its finite points predicts tau(64.2) = e^(0.346 + 0.0778 x
//    64.16) = 209 and tau(96) = 2,400, the first inside a 1,025-beat run and the second past it.
//
// HYPOTHESES, written before any survival run on the 4-loop patch (the gates, fixed). Ladder 1/delta in {12, 16, 24, 32,
// 48, 64, 96}, r = 8, runs to N = 1,025.
//  H1 THE RATE ON A CONTINUOUS SPECTRUM: among ladder points with 1 < tau <= 1,025 there are at least 4, spanning a factor
//     at least 2 in 1/delta; the least-squares line ln tau = a + c/delta through them misses no point by more than ln 3;
//     and c lies in [2 pi/J_hi, 8 pi/J_lo] = [0.0122, 0.157].
//  H2 THE SLOPE IS LOCAL: the 4-loop c lies within a factor 2 of the tetrahedron's c read by the same engine, grid and run
//     length (E-SPN-0154's 0.0778 if its four finite points reproduce).
//  H3 A WINDOW IS KEPT AT THIS SIZE: at the ladder's top, 1/delta 96, the running-mean fidelity stays above 1/2 through N =
//     1,025 (tau > 1,025).
//  H4 (a registered prediction that gates nothing) THE TETRAHEDRON'S STEP WAS FINITE SIZE: tau(64.2) is finite on the
//     4-loop patch, within a factor 3 of 209 (70 to 630).
//  P  FALSIFIER: H1 or H3 fails. The exp(c/delta) law does not hold on a continuous spectrum, or no window is kept.
//
// CONTROLS (a failure makes the verdict partial; each could fail).
//  C1 THE STRONG BEAT HEATS: at 1/delta = 1 the running-mean fidelity at N = 65 is at most 0.01 and tau <= 4.
//  C2 THE COMMUTING BEAT KEEPS: at r = 0 the beat is E(2 theta) and its ground state the constant state; at 1/delta 1 and
//     16, f >= 1 - 1e-10 at every N <= 33. A kernel whose trivial-irrep weight is not 1 fails here.
//  C3 THE TRIVIAL GROUP is the number 1: one orbit, the link kernel u = 1 exactly, A(N) = 1 exactly to N = 33.
// INSTRUMENT (a failure makes the verdict partial).
//  I1 THE ENGINE REPRODUCES E-SPN-0154: on the tetrahedron, the orbit engine's ground energy equals the dense sector's to
//     1e-8 and its doubled fidelities equal the dense Floquet closed form at every N <= 257 to 1e-9, at 1/delta 16.3,
//     32.3, 64.2.
//  I2 DOUBLING AGAINST THE PLAIN BEAT on the 4-loop patch: A(N) for N <= 6 at 1/delta 16.3 by E, M, E beat after beat
//     equals the doubled A(N) to 1e-10.
//  I3 UNITARITY: | sum_o |o| |a_k|^2 - 1 | <= 1e-10 at every pass of every ladder point.
//  I4 EXACT TABLES: orbits equal Burnside on every patch; n_B is constant on every orbit (all 1,728,000 configurations
//     of the tetrahedron, every 997th of the 4-loop patch's).
//  I5 THE PREPARED STATE: Lanczos residual ||H psi0 - E0 psi0|| <= 1e-6, and the lowest value from a start that breaks
//     every symmetry (the Weyl stream) equals E0 to 1e-8, so psi0 is the Gauss sector's ground state.
//  I6 THREADS: one pass of E(theta) on the tetrahedron with 1 thread and with the run's threads agree bit for bit.
// READ (gating nothing): the plaquette and perimeter-4 loop of psi0; the triangle and rhombus ladders by the same engine
// (the first kept point by size); the running-mean fidelity at the stop; the second Ritz value (an estimate of the gap).
// VERDICT, fixed before the run: PARTIAL if a control or the instrument fails; else FAIL if H1 or H3 fails; else PASS if H2
// holds, PARTIAL if it does not.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/st-probe1.log and st-probe2.log: the 4-loop table (3,460,496 orbits, 5 s)
// and the cost of one link pass (33 s for all 8 links on one thread, no dynamics). tmp/st-probe3.log: the engine on the
// tetrahedron against E-SPN-0154's dense sector at 1/delta 16.3 (ground energy 103.17117425755 against 103.17117425755,
// fidelities to 1.8e-12 over 257 beats, the plain beat against doubling to 4e-14). No survival on the 4-loop patch was
// computed before the gates above were written. One smoke AFTER the gates (tmp/st-smoke-a.log, 264 s): the whole run
// with the TETRAHEDRON in place of the 4-loop patch, ladder 12, 16, 64, 96 and runs to N = 65, to exercise every path:
// every control and instrument held (I1 to 1e-11, I6 bit for bit); no 4-loop survival was computed. No gate moved.
//
// Depth L2 (Floquet prethermalization of a finite-group lattice gauge theory on a husk patch; the beat's angle is a ring
// unit of the vibe ring, the register is a hand-built lattice gauge theory, not the rule). DETERMINISM: no random
// numbers; the Lanczos starts are the constant state and the Weyl stream; results are the same bit for bit at any thread
// count. NOTHING MOVES: a link holds a value, a plaquette reads the product around it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  binaryIcosahedral,
  conjugacyClasses,
  trivialGroup,
  type GaugeGroup,
} from '@/code/measure/hurwitz-gauge'
import { icosianCharacters } from '@/code/measure/gauge-window'
import {
  beatGrid,
  cayleyKernel,
  electricBasis,
  electricKernel,
  floquetOf,
  groundOf,
  huskRhombus,
  huskTetrahedron,
  huskTetrahedronEar,
  huskTriangle,
  lineFit,
  linkUnitary,
  magneticExponents,
  registerOf,
  sectorModel,
  sectorsOf,
  smallAngleUnits,
  type Patch,
  type SmallUnit,
} from '@/code/measure/prethermal-patch'
import {
  orbitEngine,
  orbitInner,
  orbitLoopMean,
  orbitMagnetic,
  orbitRegister,
  vacuumLowest,
  type OrbitEngine,
  type OrbitRegister,
} from '@/code/measure/gauss-orbit'
import {
  applyAllLinks,
  directAmplitudes,
  doublingAmplitudes,
  magneticPhase,
  survivalTime,
} from '@/code/measure/prethermal-krylov'
import { type LowestPair } from '@/code/algebra/linear/eig-lanczos-restart'
import { makeWeyl } from '@/code/tool/weyl'

const R = 8
const LADDER = [12, 16, 24, 32, 48, 64, 96]
const TOP = 1025
const PER_DECADE = 10
const UNIT_TOLERANCE = 0.02
const K_MAX = 50000
const MIN_POINTS = 4
const MIN_SPAN = 2
const FIT_MISS = Math.log(3)
const KAPPA_LO = 1
const KAPPA_HI = 4
const SLOPE_FACTOR = 2
const KEPT_AT = 96
const PREDICT_AT = 64
const PREDICT_LO = 70
const PREDICT_HI = 630
const STOP_TIMES = 4
const STOP_FLOOR = 16
const STRONG = 1
const STRONG_TOP = 65
const STRONG_FLOOR = 0.01
const STRONG_TAU = 4
const COMMUTING_AT = [1, 16]
const SHORT_TOP = 33
const KEPT = 1e-10
const DENSE_AT = [16, 32, 64]
const DENSE_TOP = 257
const DENSE_SAME = 1e-9
const GROUND_SAME = 1e-8
const DIRECT_AT = 16
const DIRECT_TOP = 6
const DIRECT_SAME = 1e-10
const UNITARY = 1e-10
const RESIDUAL = 1e-6
const SAMPLE = 997
const LANCZOS_STEPS = 40
const LANCZOS_CYCLES = 12
const LANCZOS_TOL = 1e-9
const THREADS = Math.max(1, Number(process.env.THREADS ?? 4))

export type KrylovPlan = {
  ladder: number[]
  top: number
  threads: number
  // the patch read in place of the 4-loop one (the gate plan's is the tetrahedron with an ear; a smoke may pass the
  // tetrahedron to exercise every path cheaply)
  patch: () => Patch
}

export const GATE_PLAN: KrylovPlan = {
  ladder: LADDER,
  top: TOP,
  threads: THREADS,
  patch: huskTetrahedronEar,
}

export default experiment({
  id: 'spin/icosian-prethermal-krylov',
  code: 'E-SPN-0185',
  title:
    'the small-angle 2I beat on a 4-loop husk patch (3,460,496 Gauss orbits), run matrix free: pending the gate run',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return krylovRun(GATE_PLAN)
  },
})

type Vacuum = {
  patch: Patch
  reg: OrbitRegister
  engine: OrbitEngine
  energy: Float64Array
  mismatches: number
}

function vacuumOf(
  g: GaugeGroup,
  patch: Patch,
  eH: Float64Array,
  nB: Int32Array,
  r: number,
  threads: number,
  sample: number,
): Vacuum {
  const classes = conjugacyClasses(g)
  const reg = orbitRegister(g, patch, classes, null, false)
  // n_B at every `sample`-th configuration against its orbit's value
  const mag = orbitMagnetic(reg, nB, sample)
  const mismatches = mag.mismatches
  const engine = orbitEngine(reg, { threads, slots: 3, width: 2, kernels: 5 })

  engine.kernels[0]!.set(eH)

  for (let o = 0; o < reg.orbits; o++) {
    engine.diag[o] = r * mag.energy[o]!
  }

  return { patch, reg, engine, energy: mag.energy, mismatches }
}

// the lowest state of H on the Gauss sector from a start vector (one number an orbit)
const groundState = (
  v: Vacuum,
  start: Float64Array,
  log: (s: string) => void,
): LowestPair =>
  vacuumLowest(v.engine, 0, start, {
    steps: LANCZOS_STEPS,
    tolerance: LANCZOS_TOL,
    cycles: LANCZOS_CYCLES,
    log,
  })

function setKernels(
  engine: OrbitEngine,
  g: GaugeGroup,
  e: Float64Array,
  theta: number,
): void {
  const k1 = linkUnitary(g, e, theta)
  const k2 = linkUnitary(g, e, 2 * theta)

  engine.kernels[1]!.set(k1.re)
  engine.kernels[2]!.set(k1.im)
  engine.kernels[3]!.set(k2.re)
  engine.kernels[4]!.set(k2.im)
}

const KERNELS = { k1re: 1, k1im: 2, k2re: 3, k2im: 4 }

type Point = {
  inv: number
  unit: SmallUnit
  tau: number
  last: number
  reached: number
  unitarity: number
  passes: number
  run: number[]
  re: Float64Array
  im: Float64Array
}

// one ladder point: doubled amplitudes until the stop rule
function ladderPoint(
  v: Vacuum,
  g: GaugeGroup,
  e: Float64Array,
  psi0: Float64Array,
  unit: SmallUnit,
  r: number,
  top: number,
  grid: readonly number[],
): Point {
  setKernels(v.engine, g, e, unit.theta)

  const phase = magneticPhase(v.energy, r, unit.theta)

  let sum = 0
  let counted = 0
  let tau = Infinity

  const onGrid = new Set(grid)
  const amp = doublingAmplitudes(v.engine, psi0, phase, KERNELS, top, (reached, re, im) => {
    while (counted < reached) {
      counted++
      sum += re[counted]! ** 2 + im[counted]! ** 2

      if (tau === Infinity && onGrid.has(counted) && sum / counted <= 0.5) {
        tau = counted
      }
    }

    return tau < Infinity && reached >= Math.max(STOP_TIMES * tau, STOP_FLOOR)
  })
  const sv = survivalTime(amp.re, amp.im, amp.reached, grid)

  return {
    inv: 1 / unit.delta,
    unit,
    tau: sv.tau,
    last: sv.last,
    reached: amp.reached,
    unitarity: amp.unitarity,
    passes: amp.passes,
    run: sv.run,
    re: amp.re,
    im: amp.im,
  }
}

const fmt = (x: number): string =>
  x === Infinity ? 'inf' : Number.isInteger(x) ? String(x) : x.toPrecision(4)

function fitOf(points: readonly Point[], top: number) {
  const finite = points.filter(p => p.tau > 1 && p.tau <= top)
  const fit =
    finite.length >= 2
      ? lineFit(
          finite.map(p => p.inv),
          finite.map(p => Math.log(p.tau)),
        )
      : null
  const span = finite.length
    ? Math.max(...finite.map(p => p.inv)) / Math.min(...finite.map(p => p.inv))
    : 0

  return { finite, fit, span }
}

export function krylovRun(plan: KrylovPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const grid = beatGrid(plan.top, PER_DECADE)
  const g = binaryIcosahedral()
  const classes = conjugacyClasses(g)
  const chars = icosianCharacters(g)
  const nR = chars.dims.map(d => d * d - 1)
  const eH = electricKernel(g, chars, nR)
  const nB = magneticExponents(g)

  if (!nB) {
    throw new Error('E-SPN-0185: 2I magnetic exponents not integral')
  }

  const units = smallAngleUnits(
    [...plan.ladder, ...DENSE_AT, STRONG].map(x => 1 / x),
    K_MAX,
    UNIT_TOLERANCE,
  )
  const unitAt = (inv: number): SmallUnit =>
    units[[...plan.ladder, ...DENSE_AT, STRONG].indexOf(inv)]!

  // ---------------- the tetrahedron: I1, I6 and its ladder ----------------
  const tet = vacuumOf(g, huskTetrahedron(), eH, nB, R, plan.threads, 1)
  const tetGround = groundState(tet, new Float64Array(tet.reg.orbits).fill(1), log)
  const reg0 = registerOf(g, tet.patch, classes)
  const sec = sectorsOf(reg0)
  const model = sectorModel(reg0, sec, eH, nB)
  const basis = electricBasis(model)
  const dense = groundOf(model, basis, R)
  const denseRows = DENSE_AT.map(inv => {
    const unit = unitAt(inv)
    const fl = floquetOf(model, basis, unit.theta, R)
    const n = model.n
    const p: number[] = []

    for (let j = 0; j < n; j++) {
      let s = 0

      for (let i = 0; i < n; i++) {
        s += fl.U[i * n + j]! * dense.psiE[i]!
      }

      p.push(s * s)
    }

    setKernels(tet.engine, g, eH, unit.theta)

    const amp = doublingAmplitudes(
      tet.engine,
      tetGround.vector,
      magneticPhase(tet.energy, R, unit.theta),
      KERNELS,
      DENSE_TOP,
      () => false,
    )

    let worst = 0

    for (let N = 0; N <= amp.reached; N++) {
      let a = 0
      let b = 0

      for (let j = 0; j < n; j++) {
        a += p[j]! * Math.cos(N * fl.phases[j]!)
        b += p[j]! * Math.sin(N * fl.phases[j]!)
      }

      worst = Math.max(
        worst,
        Math.abs(amp.re[N]! ** 2 + amp.im[N]! ** 2 - (a * a + b * b)),
      )
    }

    return { inv, worst, reached: amp.reached }
  })
  const I1 =
    Math.abs(tetGround.value - dense.E0) <= GROUND_SAME &&
    denseRows.every(d => d.worst <= DENSE_SAME && d.reached >= DENSE_TOP)

  log(
    `I1 ${I1}: tetrahedron orbit E0 ${tetGround.value.toFixed(10)} against dense ${dense.E0.toFixed(10)}; doubled against dense fidelity ${denseRows.map(d => `1/delta ${d.inv}: ${d.worst.toExponential(2)} to N ${d.reached}`).join(', ')}`,
  )

  // I6: one pass with 1 thread and with the run's threads
  const one = vacuumOf(g, huskTetrahedron(), eH, nB, R, 1, 0)

  const passOf = (v: Vacuum): Float64Array => {
    setKernels(v.engine, g, eH, unitAt(DIRECT_AT).theta)

    const s0 = v.engine.slots[0]!

    for (let o = 0; o < v.reg.orbits; o++) {
      s0[2 * o] = tetGround.vector[o]!
      s0[2 * o + 1] = 0
    }

    return Float64Array.from(v.engine.slots[applyAllLinks(v.engine, 1, 2, 0)]!)
  }

  const passMany = passOf(tet)
  const passOne = passOf(one)
  const I6 = passMany.every((x, i) => Object.is(x, passOne[i]))

  one.engine.close()
  log(`I6 ${I6}: one pass with 1 and ${plan.threads} threads bit for bit`)

  const tetPoints = plan.ladder.map(inv =>
    ladderPoint(tet, g, eH, tetGround.vector, unitAt(inv), R, plan.top, grid),
  )
  const tetFit = fitOf(tetPoints, plan.top)

  for (const p of tetPoints) {
    log(
      `tetrahedron 1/delta ${p.inv.toFixed(2)} (k ${p.unit.k}): tau ${fmt(p.tau)}, running mean at N ${p.reached} ${p.last.toExponential(3)}, unitarity ${p.unitarity.toExponential(1)}`,
    )
  }

  log(
    `tetrahedron fit: ${tetFit.finite.length} finite points, ${tetFit.fit ? `c ${tetFit.fit.c.toFixed(5)} a ${tetFit.fit.a.toFixed(3)} worst ${tetFit.fit.worst.toFixed(3)}` : 'none'}`,
  )

  // the smaller patches, READ
  const reads: string[] = []

  for (const patch of [huskTriangle(), huskRhombus()]) {
    const v = vacuumOf(g, patch, eH, nB, R, plan.threads, 1)
    const gs = groundState(v, new Float64Array(v.reg.orbits).fill(1), () => undefined)
    const pts = plan.ladder.map(inv =>
      ladderPoint(v, g, eH, gs.vector, unitAt(inv), R, plan.top, grid),
    )

    reads.push(
      `${patch.name} (${v.reg.orbits} orbits): ${pts.map(p => `${p.inv.toFixed(1)}: tau ${fmt(p.tau)}`).join(', ')}`,
    )
    log(`READ ${reads[reads.length - 1]}`)
    v.engine.close()
  }

  // ---------------- the 4-loop patch ----------------
  const ear = vacuumOf(g, plan.patch(), eH, nB, R, plan.threads, SAMPLE)

  log(
    `4-loop: husk ${ear.patch.husk}, docks ${ear.patch.docks.length}, links ${ear.patch.links.length}, triangles ${ear.patch.triangles.length}, loops ${ear.reg.digits}, configurations ${ear.reg.size}, orbits ${ear.reg.orbits} (Burnside ${ear.reg.burnside}), n_B mismatches ${ear.mismatches} of ${Math.ceil(ear.reg.size / SAMPLE)} sampled`,
  )

  const I4 =
    [tet, ear].every(v => v.reg.orbits === v.reg.burnside && v.mismatches === 0)
  const earGround = groundState(ear, new Float64Array(ear.reg.orbits).fill(1), log)
  const weyl = makeWeyl({ start: 0 })
  const weylGround = groundState(
    ear,
    Float64Array.from({ length: ear.reg.orbits }, () => weyl.next() - 0.5),
    log,
  )
  const I5 =
    earGround.residual <= RESIDUAL &&
    tetGround.residual <= RESIDUAL &&
    Math.abs(weylGround.value - earGround.value) <= GROUND_SAME
  const plaquette = orbitLoopMean(ear.reg, earGround.vector, 1, ear.patch.triangles)
  const loop4 = orbitLoopMean(ear.reg, earGround.vector, 1, [[0, 1, 2, 3]])

  log(
    `I5 ${I5}: 4-loop E0 ${earGround.value.toFixed(10)} (residual ${earGround.residual.toExponential(2)}, ${earGround.applications} applications, next Ritz ${earGround.next.toFixed(4)}), Weyl start ${weylGround.value.toFixed(10)} (residual ${weylGround.residual.toExponential(2)}); READ plaquette ${plaquette.toFixed(4)}, perimeter-4 loop ${loop4.toFixed(4)}`,
  )

  // I2: doubling against the plain beat
  const directUnit = unitAt(DIRECT_AT)
  const directPhase = magneticPhase(ear.energy, R, directUnit.theta)

  setKernels(ear.engine, g, eH, directUnit.theta)

  const direct = directAmplitudes(ear.engine, earGround.vector, directPhase, KERNELS, DIRECT_TOP)
  const doubled = doublingAmplitudes(ear.engine, earGround.vector, directPhase, KERNELS, DIRECT_TOP + 1, () => false)

  let directGap = 0

  for (let N = 0; N <= DIRECT_TOP; N++) {
    directGap = Math.max(
      directGap,
      Math.hypot(direct.re[N]! - doubled.re[N]!, direct.im[N]! - doubled.im[N]!),
    )
  }

  const I2 = directGap <= DIRECT_SAME

  log(`I2 ${I2}: plain beat against doubling to N ${DIRECT_TOP}: ${directGap.toExponential(2)}`)

  // the ladder
  const points: Point[] = []

  for (const inv of plan.ladder) {
    const p = ladderPoint(ear, g, eH, earGround.vector, unitAt(inv), R, plan.top, grid)

    points.push(p)
    log(
      `4-loop 1/delta ${p.inv.toFixed(2)} (k ${p.unit.k}): tau ${fmt(p.tau)}, running mean at N ${p.reached} ${p.last.toExponential(3)}, f(10) ${(p.re[10]! ** 2 + p.im[10]! ** 2).toExponential(3)}, passes ${p.passes}, unitarity ${p.unitarity.toExponential(1)}`,
    )
  }

  const I3 = points.every(p => p.unitarity <= UNITARY)
  const { finite, fit, span } = fitOf(points, plan.top)
  const perLinkFaces = Math.max(
    ...ear.patch.links.map(
      ([a, b]) =>
        ear.patch.triangles.filter(t => t.includes(a) && t.includes(b)).length,
    ),
  )
  const Jlo = Math.max(...nR, R * Math.max(...nB))
  const Jhi = Math.max(...nR) + perLinkFaces * R * Math.max(...nB)
  const cLo = (KAPPA_LO * 2 * Math.PI) / Jhi
  const cHi = (KAPPA_HI * 2 * Math.PI) / Jlo
  const H1 =
    finite.length >= MIN_POINTS &&
    span >= MIN_SPAN &&
    !!fit &&
    fit.worst <= FIT_MISS &&
    fit.c >= cLo &&
    fit.c <= cHi
  const H2 =
    !!fit &&
    !!tetFit.fit &&
    fit.c >= tetFit.fit.c / SLOPE_FACTOR &&
    fit.c <= tetFit.fit.c * SLOPE_FACTOR
  const top = points[plan.ladder.indexOf(KEPT_AT)]!
  const H3 = top.tau === Infinity && top.reached >= plan.top
  const at64 = points[plan.ladder.indexOf(PREDICT_AT)]!
  const H4 = at64.tau >= PREDICT_LO && at64.tau <= PREDICT_HI

  log(
    `H1 ${H1}: finite ${finite.length} (1/delta ${finite.map(p => p.inv.toFixed(2)).join(', ')}), span ${span.toFixed(2)}, fit ${fit ? `c ${fit.c.toFixed(5)} a ${fit.a.toFixed(3)} worst ${fit.worst.toFixed(3)}` : 'none'} against [${cLo.toFixed(4)}, ${cHi.toFixed(4)}] (J ${Jlo} to ${Jhi}); H2 ${H2} (tetrahedron c ${tetFit.fit ? tetFit.fit.c.toFixed(5) : 'none'}); H3 ${H3} (1/delta ${top.inv.toFixed(2)}: tau ${fmt(top.tau)}, running mean ${top.last.toExponential(3)} at N ${top.reached}); H4 ${H4} (tau(${at64.inv.toFixed(2)}) ${fmt(at64.tau)} against [${PREDICT_LO}, ${PREDICT_HI}])`,
  )

  // ---------------- controls ----------------
  const strongUnit = unitAt(STRONG)

  setKernels(ear.engine, g, eH, strongUnit.theta)

  const strong = doublingAmplitudes(
    ear.engine,
    earGround.vector,
    magneticPhase(ear.energy, R, strongUnit.theta),
    KERNELS,
    STRONG_TOP,
    () => false,
  )
  const strongSv = survivalTime(strong.re, strong.im, strong.reached, grid)
  const C1 =
    strong.reached >= STRONG_TOP &&
    strongSv.last <= STRONG_FLOOR &&
    strongSv.tau <= STRONG_TAU

  log(`C1 ${C1}: strong beat (1/delta ${(1 / strongUnit.delta).toFixed(3)}) running mean ${strongSv.last.toExponential(3)} at N ${strong.reached}, tau ${fmt(strongSv.tau)}`)

  const constant = new Float64Array(ear.reg.orbits).fill(
    1 / Math.sqrt(orbitInner(ear.reg, new Float64Array(ear.reg.orbits).fill(1), new Float64Array(ear.reg.orbits).fill(1), 1)),
  )
  const commuting = COMMUTING_AT.map(inv => {
    const unit = unitAt(inv)

    setKernels(ear.engine, g, eH, unit.theta)

    const amp = doublingAmplitudes(ear.engine, constant, magneticPhase(ear.energy, 0, unit.theta), KERNELS, SHORT_TOP, () => false)

    let least = 1

    for (let N = 0; N <= amp.reached; N++) {
      least = Math.min(least, amp.re[N]! ** 2 + amp.im[N]! ** 2)
    }

    return { inv, least }
  })
  const C2 = commuting.every(c => c.least >= 1 - KEPT)

  log(`C2 ${C2}: commuting beat least f ${commuting.map(c => `1/delta ${c.inv}: ${c.least.toFixed(14)}`).join(', ')}`)

  const triv = trivialGroup()
  const tv = vacuumOf(triv, huskTetrahedronEar(), cayleyKernel(triv), magneticExponents(triv)!, R, 1, 0)

  setKernels(tv.engine, triv, cayleyKernel(triv), unitAt(DIRECT_AT).theta)

  const tvAmp = doublingAmplitudes(tv.engine, Float64Array.of(1), magneticPhase(tv.energy, R, unitAt(DIRECT_AT).theta), KERNELS, SHORT_TOP, () => false)
  const C3 =
    tv.reg.orbits === 1 &&
    tv.engine.kernels[1]![0] === 1 &&
    tv.engine.kernels[2]![0] === 0 &&
    Array.from({ length: tvAmp.reached + 1 }, (_, N) => tvAmp.re[N] === 1 && tvAmp.im[N] === 0).every(Boolean)

  tv.engine.close()
  log(`C3 ${C3}: trivial group orbits ${tv.reg.orbits}, kernel ${tv.engine.kernels[1]![0]} + ${tv.engine.kernels[2]![0]} i, A(N) = 1 to N ${tvAmp.reached}`)

  tet.engine.close()
  ear.engine.close()

  const controls = C1 && C2 && C3
  const instrument = I1 && I2 && I3 && I4 && I5 && I6
  const status = !controls || !instrument ? 'partial' : !H1 || !H3 ? 'fail' : H2 ? 'pass' : 'partial'

  return verdict({
    status,
    claim: `H1 ${H1} (${finite.length} finite points, fit ${fit ? `c ${fit.c.toFixed(4)} worst ${fit.worst.toFixed(2)}` : 'none'} against [${cLo.toFixed(4)}, ${cHi.toFixed(4)}]); H2 ${H2} (tetrahedron c ${tetFit.fit ? tetFit.fit.c.toFixed(4) : 'none'}); H3 ${H3} (tau at 1/delta ${top.inv.toFixed(1)} ${fmt(top.tau)}); H4 ${H4} (tau at ${at64.inv.toFixed(1)} ${fmt(at64.tau)}); controls ${controls}; instrument ${instrument}; 4-loop ${ear.reg.orbits} orbits, E0 ${earGround.value.toFixed(6)}, plaquette ${plaquette.toFixed(4)}`,
    metrics: {
      H1: H1 ? 1 : 0,
      H2: H2 ? 1 : 0,
      H3: H3 ? 1 : 0,
      H4: H4 ? 1 : 0,
      orbits: ear.reg.orbits,
      ground: earGround.value,
      plaquette,
      finitePoints: finite.length,
      slope: fit ? fit.c : NaN,
      slopeTetrahedron: tetFit.fit ? tetFit.fit.c : NaN,
      slopeLo: cLo,
      slopeHi: cHi,
      tau64: at64.tau,
      tau96: top.tau,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      C3: C3 ? 1 : 0,
      I1: I1 ? 1 : 0,
      I2: I2 ? 1 : 0,
      I3: I3 ? 1 : 0,
      I4: I4 ? 1 : 0,
      I5: I5 ? 1 : 0,
      I6: I6 ? 1 : 0,
    },
    notes: `L2. 4-loop r ${R}: ${points.map(p => `1/delta ${p.inv.toFixed(2)} tau ${fmt(p.tau)} mean ${p.last.toExponential(2)} at ${p.reached}`).join(' | ')}. Tetrahedron: ${tetPoints.map(p => `${p.inv.toFixed(2)} tau ${fmt(p.tau)}`).join(', ')}. ${reads.join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s on ${plan.threads} threads.`,
  })
}
