// DOES A BOUND THREE-MEMBER STATE KEEP ITS IDENTITY WHILE IT MOVES (E-SLF-0181, OPEN-MND-02, OPEN-FND-03; moving-matter
// item 0025). RULE: R* with the spinor lift L(s) (decision 0006). The state is E-SPN-0193's bound triple (three like-tone
// register holes, Q = -1, J = 1/2, n+ = 3, on the L = 4 D4 torus), which by decision 002 is the heavy bulk three-member
// state (inertia 100 to 126 times its constituents), not the electron: this verdict is about a bound state keeping its
// identity, never about the electron.
//
// DERIVED BEFORE THE GATE RUN (code/measure/register-persistence on E-FND-0161's engine).
// 1. THE START (L1). Psi = sum_K A(K) B_K f: f the rest bound level (E-SPN-0193's contact start Hann-filtered at its
//    strongest line, normalized), B_K the boost e^(i K . X_cm) (each hole's momentum shifted by K / 3 with its 192-mode
//    vector held, the boundary twist of E-SPN-0193), A(K) a Gaussian packet along husk direction d: K = k_m d over the
//    ring momenta k_m = 2 pi m / 4, amplitude e^(-sigma^2 (k_m - kbar)^2 / 2), sigma 1 dock, kbar pi / 4. Every K
//    carries the SAME internal state, so no K != 0 component is an eigenstate by construction (a single total-momentum
//    eigenstate keeps its overlap at 1, spec rule 3).
// 2. THE READ (L1). Tracing out the center gives O(t) = sum_K w_K |c_K(t)|^2, c_K(t) = <B_K f|U_K^t B_K f>, each K on
//    its own. The bound fraction BF = sum_K w_K a_K^2, a_K^2 the start's weight on its sector's bound level (constant in
//    time: the level is an eigenvector of the translation-invariant rule).
// 3. TEN CROSSINGS WITHOUT RUNNING THEM (L1, the eigenbasis). u_K = the start filtered twice at its level, rho_K =
//    |U u - <u|U u> u|. Then |<u|U^t u>| >= 1 - t rho, and with f = a u + r, |c(t)| >= a^2 (1 - t rho) - 2 a r t rho - r^2
//    - leak (the leak: the weight a boost puts on flat holes, an invariant subspace the store cannot hold). This lower
//    bound holds at every t. The upper value replaces 1 - t rho by the rule compressed to span{u, U u} (an estimate) and
//    adds 2 a r + r^2 + leak. The direct autocorrelation over the T-cycle run must lie between the two (instrument I3).
// 4. THE CROSSING TIME. Two K components on the L = 4 ring beat at Delta E = E(k_1 d) - E(0): the packet's density
//    pattern shifts by one ring period, a crossing of the box, every 2 pi / |Delta E| cycles.
//
// GATES, fixed before the gate run (T = 256, sectors run: m = 0 and m = 1, the two of weight 0.496 each; m = -1 and 2,
// weight 0.0036 each, are not run and count 0 below and 1 above):
//  OV  INTERNAL OVERLAP: the lower bound of O at 10 crossing times (and so at every earlier time) is at least 0.9, on
//      both d = (1,0,0) and (1,1,1).
//  BF  BOUND FRACTION at least 0.9 on both directions.
//  KILL (fixed 2026-10-08): the internal overlap is under 0.5 within 10 crossings on either direction, read where it is
//      shown: the direct run's value (with the unrun weight counted 1) or the upper value at some t up to 10 crossings.
//  Between: partial. If E-SPN-0193 were killed the verdict would be open (it passed).
// CONTROL CF (must fail): the same start with the pair pieces off (the free rule) falls below 0.5 within the run, the
//  unrun weight counted 1.
// INSTRUMENT (a failure makes the verdict partial at best): I1 every run keeps its norm within 1e-10; I2 every frame passes
//  E-FND-0161's V1 tolerances (as E-SPN-0193); I3 the direct O(t), t < T, lies between the lower and upper values to 1e-9.
// READ, gating nothing: per sector a^2, the leak, rho, the level E, the compressed return at 10 crossings, the K = 0
//  sector apart (an eigenstate by construction, so the moving sector carries the test), register-selves' integration
//  I(t) of the one-hole occupation over the run (E-SLF-0179's read), the crossing time against E-SPN-0193's speeds.
//
// WHAT THIS CAN AND CANNOT SHOW. The L = 4 bulk torus at K_3 = 0 (E-SPN-0193's box, never shrunk), one half, one tone,
// the twist family for K (the same as E-SPN-0193's). A two-component packet on a four-dock ring is the smallest packet;
// it moves but does not spread far. Depth L2 at most.
//
// DISCLOSED CORRECTION, after the first gate run (tmp/persist-gate-first.log) and before the second: the first run
//  centered each sector's filter at the start's Rayleigh mean, which for (1,1,1) sat 0.07 off the bound line (outside
//  the Hann lobe) and filtered another level (a^2 1.6e-4). The filter is now centered at the start's strongest line in
//  its own sector, as the rest sector always was. No gate or threshold moved; (1,0,0) changed only in rho (1.5e-5 to
//  1.7e-6) and so in its lower bound (0.529 to 0.722).
//
// GATE RUN 2026-10-08 (tmp/persist-gate.log, 1,245 s): PARTIAL.
//  - (1,0,0), K = (pi/2,0,0): leak 0.045, a^2 0.8647, rho 1.7e-6, level E -2.875022 against rest -2.877832, a crossing
//    2,236 cycles (E-SPN-0193's speed gives 1,712), 10 crossings 22,363 cycles. O at least 0.722 (OV fails), central
//    estimate 0.868, direct run (256 cycles) never under 0.892, BF 0.926.
//  - (1,1,1), K = (pi/2,pi/2,pi/2): leak 0.118, a^2 0.6869, rho 5.2e-6, E -2.869871, a crossing 789 cycles, 10 crossings
//    7,893. O at least 0.546, central 0.731, direct never under 0.794 (the moving sector alone 0.419), BF 0.837 (fails).
//  - Rest sector a^2 1 - 8e-8, rho 5e-11 (an eigenstate by construction). Compressed return at 10 crossings 1.00000 in
//    every sector: the moving level is one line, no doublet split.
//  - CF holds (0.0096, 0.0158). I1 2.0e-12, I2 holds. I3 holds but is weak: the upper value clips at 1 whenever a^2 < 1,
//    so it brackets nothing; KILL could only fire on the direct run.
//
// DETERMINISM: no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { torus } from '@/code/measure/register-sea'
import { holeEngine, holeFrame, holeNorm, type HoleFrame, type Holes } from '@/code/measure/register-holes'
import {
  contactStart,
  couplingRule,
  lineSpectrum,
  rayleigh,
  ruleSetup,
  strongestLines,
  twistedTorus,
} from '@/code/measure/three-member-motion'
import {
  applyMembers,
  boostMaps,
  cloneHoles,
  dotHoles,
  krylov2,
  compressedReturn,
  packetWeights,
  scaleHoles,
  sectorBounds,
  sectorRun,
  type SectorLevel,
} from '@/code/measure/register-persistence'

export type PersistencePlan = {
  L: number
  T: number
  sigma: number
  kbar: number
  crossings: number
  every: number
  threads: number
}

export const GATE_PLAN: PersistencePlan = {
  L: 4,
  T: 256,
  sigma: 1,
  kbar: Math.PI / 4,
  crossings: 10,
  every: 16,
  threads: 8,
}

export const DIRECTIONS: readonly (readonly [number, number, number])[] = [
  [1, 0, 0],
  [1, 1, 1],
]

// E-SPN-0193's measured speeds at |K| = pi / 4 (its gate log), for the crossing-time READ only
const MOTION_SPEED: Record<string, number> = { '100': 2.337e-3, '111': 2.934e-3 }

const FRAME_TOL = 1e-12
const NORM_TOL = 1e-10
const PASS = 0.9
const KILL = 0.5
const BRACKET_TOL = 1e-9
const RUN_MS = [0, 1]

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'selves/register-persistence',
  code: 'E-SLF-0181',
  title:
    'a moving bound three-member state on R* keeps its level but not all of its internal state, partial: the rest bound triple of E-SPN-0193, boosted into a packet over K = 0 and K = pi/2 d on the L = 4 torus, holds an internal overlap of at least 0.72 along (1,0,0) and 0.55 along (1,1,1) over ten crossings (central estimates 0.87 and 0.73, bound fractions 0.93 and 0.84), against 0.010 and 0.016 with the pair pieces off; the moving level itself is one coherent line (residual 2e-6, no split), but the boosted rest state puts only 0.86 and 0.69 of its weight on it and 0.05 and 0.12 on flat holes, so identity under motion is lost to the K dependence of the internal state, not to decay',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerPersistenceRun(GATE_PLAN)
  },
})

const frameOk = (fr: HoleFrame): boolean => {
  const c = fr.checks

  return (
    c.sectorOutside <= FRAME_TOL &&
    c.transferOutside <= FRAME_TOL &&
    c.unitary <= FRAME_TOL &&
    c.minComplement === 4 &&
    c.maxComplement === 4
  )
}

const wrap = (x: number): number => {
  const y = ((x + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)

  return y - Math.PI
}

const normalized = (s: Holes): Holes => {
  const out = cloneHoles(s)

  scaleHoles(out, 1 / Math.sqrt(holeNorm(s)))

  return out
}

type Sector = {
  key: string
  K: number[]
  level: SectorLevel
  E: number
  c2: Float64Array
  free2: Float64Array
  integration: number
  normDrift: number
}

export function registerPersistenceRun(plan: PersistencePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const { Ps } = ruleSetup()
  const base = torus(plan.L)
  const options = { backend: 'native' as const, threads: plan.threads }
  const rule = couplingRule(base, 'rule')
  const free = couplingRule(base, 'free')
  const T = plan.T
  let framesOk = true
  let normDrift = 0

  // ---------------- the rest bound level f ----------------
  const fr0 = holeFrame(base, Ps, 8)

  framesOk = framesOk && frameOk(fr0)

  const e0 = holeEngine(fr0, 3, 0, options)
  const contact = contactStart(fr0)
  const spec = sectorRun(e0, rule, contact, T, null, T)
  const lines = strongestLines(lineSpectrum(spec.cRe, spec.cIm, 8192), 4, 1e-3)
  const E0 = lines[0]!.E
  const rest = sectorRun(e0, rule, contact, T, E0, T)
  const f = normalized(rest.phi!)

  normDrift = Math.max(normDrift, spec.normDrift, rest.normDrift)
  log(`lines ${JSON.stringify(lines)}`)

  // ---------------- one sector ----------------
  const sector = (K: number[]): Sector => {
    const frK = K.every(x => x === 0) ? fr0 : holeFrame(twistedTorus(base, [K[0]! / 3, K[1]! / 3, K[2]! / 3, 0]), Ps, 8)

    framesOk = framesOk && frameOk(frK)

    const e = frK === fr0 ? e0 : holeEngine(frK, 3, 0, options)
    const s = cloneHoles(f)

    if (frK !== fr0) {
      applyMembers(e, s, boostMaps(fr0, frK))
    }

    const kept = holeNorm(s)
    // the direct run (the autocorrelation and the reads), then the filter at the start's strongest line in this sector.
    // U b = e^(-i E) b, so the filter sum_t w(t) e^(i E t) U^t keeps the level at E (rayleigh's sign)
    const run1 = sectorRun(e, rule, s, T, null, plan.every)
    const sLines = strongestLines(lineSpectrum(run1.cRe, run1.cIm, 8192), 4, 1e-3)
    const runF = sectorRun(e, rule, s, T, sLines[0]!.E, T)
    const u1 = normalized(runF.phi!)
    const E1 = rayleigh(e, rule, u1).E
    const run2 = sectorRun(e, rule, u1, T, E1, T)
    const u = normalized(run2.phi!)
    const kr = krylov2(e, rule, u)
    const [or, oi] = dotHoles(u, s)
    const a2 = or * or + oi * oi
    const freeRun = sectorRun(e, free, s, T, null, plan.every)
    const c2 = new Float64Array(T)
    const free2 = new Float64Array(T)

    for (let t = 0; t < T; t++) {
      c2[t] = run1.cRe[t]! ** 2 + run1.cIm[t]! ** 2
      free2[t] = freeRun.cRe[t]! ** 2 + freeRun.cIm[t]! ** 2
    }

    const drift = Math.max(run1.normDrift, runF.normDrift, run2.normDrift, kr.normDrift, freeRun.normDrift)

    log(`sector lines ${JSON.stringify(sLines)}`)
    const out: Sector = {
      key: K.map(x => x.toFixed(4)).join(','),
      K,
      level: { a2, r2: kept - a2, leak: 1 - kept, rho: kr.rho, H: kr.H },
      E: kr.E,
      c2,
      free2,
      integration: Math.max(...run1.reads.map(r => r.integration)),
      normDrift: drift,
    }

    normDrift = Math.max(normDrift, drift)
    log(
      `sector ${out.key} leak ${out.level.leak.toExponential(3)} a2 ${a2.toFixed(6)} rho ${kr.rho.toExponential(3)} E ${kr.E.toFixed(7)} min|c|^2 ${Math.min(...c2).toFixed(5)} min free ${Math.min(...free2).toFixed(5)} I ${out.integration.toExponential(2)}`,
    )

    return out
  }

  const weights = packetWeights(plan.L, plan.sigma, plan.kbar)
  const runW = weights.filter(x => RUN_MS.includes(x.m))
  const unrun = 1 - runW.reduce((a, b) => a + b.w, 0)
  const restSector = sector([0, 0, 0])

  type Row = {
    d: readonly number[]
    tCross: number
    tMax: number
    lowAtMax: number
    highMin: number
    highMinAt: number
    directMin: number
    freeMin: number
    BF: number
    bracket: number
    moving: Sector
    movingReturn: number
    estimate: number
  }
  const rows: Row[] = []

  for (const d of DIRECTIONS) {
    const k1 = runW.find(x => x.m === 1)!.k
    const moving = sector(d.map(x => x * k1))
    const secs: { w: number; s: Sector }[] = runW.map(x => ({ w: x.w, s: x.m === 0 ? restSector : moving }))
    const dE = Math.abs(wrap(moving.E - restSector.E))
    const tCross = (2 * Math.PI) / dE
    const tMax = Math.ceil(plan.crossings * tCross)
    const O = (t: number, side: 'low' | 'high'): number =>
      secs.reduce((acc, x) => acc + x.w * sectorBounds(x.s.level, t)[side] ** 2, 0) + (side === 'high' ? unrun : 0)
    let highMin = Infinity
    let highMinAt = 0

    for (let t = 0; t <= tMax; t++) {
      const h = O(t, 'high')

      if (h < highMin) {
        highMin = h
        highMinAt = t
      }
    }

    let directMin = Infinity
    let freeMin = Infinity
    let bracket = 0

    for (let t = 0; t < T; t++) {
      const direct = secs.reduce((acc, x) => acc + x.w * x.s.c2[t]!, 0)
      const lo = O(t, 'low')
      const hi = O(t, 'high') - unrun

      // the flat part of a boosted start adds at most its leak to |c|, the unrun sectors at most their weight
      const directUp = secs.reduce((acc, x) => acc + x.w * (Math.sqrt(x.s.c2[t]!) + x.s.level.leak) ** 2, 0)

      directMin = Math.min(directMin, Math.min(1, directUp + unrun))
      freeMin = Math.min(
        freeMin,
        secs.reduce((acc, x) => acc + x.w * (Math.sqrt(x.s.free2[t]!) + x.s.level.leak) ** 2, 0) + unrun,
      )
      bracket = Math.max(bracket, lo - direct, direct - hi)
    }

    const row: Row = {
      d,
      tCross,
      tMax,
      lowAtMax: O(tMax, 'low'),
      highMin,
      highMinAt,
      directMin,
      freeMin,
      BF: secs.reduce((acc, x) => acc + x.w * x.s.level.a2, 0),
      bracket,
      moving,
      movingReturn: compressedReturn(moving.level.H, tMax),
      // READ: the level part alone at 10 crossings (the rest of the start dephased away), the central estimate
      estimate: secs.reduce((acc, x) => acc + x.w * (x.s.level.a2 * compressedReturn(x.s.level.H, tMax)) ** 2, 0),
    }

    rows.push(row)
    log(
      `d ${d.join(',')} tCross ${tCross.toFixed(1)} tMax ${tMax} O_low ${row.lowAtMax.toFixed(5)} O_high_min ${highMin.toFixed(5)} at ${highMinAt} direct min ${directMin.toFixed(5)} free min ${freeMin.toFixed(5)} BF ${row.BF.toFixed(5)} bracket ${bracket.toExponential(2)}`,
    )
  }

  const OV = rows.every(r => r.lowAtMax >= PASS)
  const BF = rows.every(r => r.BF >= PASS)
  const CF = rows.every(r => r.freeMin < KILL)
  const I1 = normDrift <= NORM_TOL
  const I2 = framesOk
  const I3 = rows.every(r => r.bracket <= BRACKET_TOL)
  const killed = rows.some(r => r.directMin < KILL || r.highMin < KILL)
  const status: Verdict['status'] = killed
    ? 'fail'
    : OV && BF && CF && I1 && I2 && I3
      ? 'pass'
      : 'partial'
  const seconds = (Date.now() - started) / 1000
  const metrics: Record<string, number> = {
    OV: flag(OV),
    BF: flag(BF),
    CF: flag(CF),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    E0,
    unrunWeight: unrun,
    restA2: restSector.level.a2,
    restRho: restSector.level.rho,
    restE: restSector.E,
    restIntegration: restSector.integration,
    normDrift,
    seconds,
  }

  rows.forEach(r => {
    const k = r.d.join('')

    metrics[`tCross_${k}`] = r.tCross
    metrics[`tMax_${k}`] = r.tMax
    metrics[`overlapLow_${k}`] = r.lowAtMax
    metrics[`overlapHighMin_${k}`] = r.highMin
    metrics[`directMin_${k}`] = r.directMin
    metrics[`freeMin_${k}`] = r.freeMin
    metrics[`boundFraction_${k}`] = r.BF
    metrics[`bracket_${k}`] = r.bracket
    metrics[`movingA2_${k}`] = r.moving.level.a2
    metrics[`movingLeak_${k}`] = r.moving.level.leak
    metrics[`movingRho_${k}`] = r.moving.level.rho
    metrics[`movingE_${k}`] = r.moving.E
    metrics[`movingReturn_${k}`] = r.movingReturn
    metrics[`overlapEstimate_${k}`] = r.estimate
    metrics[`movingIntegration_${k}`] = r.moving.integration
    metrics[`crossMotion_${k}`] = plan.L / MOTION_SPEED[k]!
  })

  return verdict({
    status,
    claim: `the rest bound triple of E-SPN-0193 (R*, L = ${plan.L}), started as a packet over K = k_m d (weights ${runW.map(x => x.w.toFixed(4)).join(', ')} on m = 0, 1, unrun ${unrun.toFixed(4)}): ${rows
      .map(r => `(${r.d.join(',')}) internal overlap at least ${r.lowAtMax.toFixed(4)} over ${plan.crossings} crossings (${r.tMax} cycles, upper value min ${r.highMin.toFixed(4)}), central estimate ${r.estimate.toFixed(4)}, bound fraction ${r.BF.toFixed(4)}, free control min ${r.freeMin.toFixed(4)}`)
      .join('; ')} (OV ${OV}, BF ${BF}, CF ${CF}, I1 ${I1}, I2 ${I2}, I3 ${I3})`,
    metrics,
    control: { CF: flag(CF), ...Object.fromEntries(rows.map(r => [`freeMin_${r.d.join('')}`, r.freeMin])) },
    notes: `R* with L(s), decision 0006; the heavy bulk state of decision 002, not the electron. Lines at K = 0: ${lines
      .map(l => `${l.E.toFixed(4)} (${l.height.toFixed(3)})`)
      .join(', ')}. Rest sector (an eigenstate by construction): a^2 ${restSector.level.a2.toFixed(6)}, rho ${restSector.level.rho.toExponential(2)}. Moving sectors: ${rows
      .map(r => `(${r.d.join(',')}) K ${r.moving.key} leak ${r.moving.level.leak.toExponential(2)} a^2 ${r.moving.level.a2.toFixed(6)} rho ${r.moving.level.rho.toExponential(2)} E ${r.moving.E.toFixed(6)} compressed return at ${r.tMax} ${r.movingReturn.toFixed(5)} integration max ${r.moving.integration.toExponential(2)}, crossing ${r.tCross.toFixed(0)} cycles (E-SPN-0193 speed: ${(plan.L / MOTION_SPEED[r.d.join('')]!).toFixed(0)})`)
      .join('; ')}. ${seconds.toFixed(0)} s.`,
  })
}
