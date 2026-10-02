// E-SPN-0188 THE WALL PUMP UNDER DEFORMATIONS THAT KEEP THE GAP (route K5a, OPEN-CSM-19, ledger row "Topological phases and
// the quantum Hall effect", now a stand-in, a hand-written chiral walk). E-SPN-0168 measured E . B moving member number
// through the Wilson slab of the register rule: per loop of k2 (E driving the momentum along the field) the wall doublet's
// lowest Landau levels cross pi, net +4 on wall A and -4 on wall B for half 0, the gapped bulk carrying the number between
// them (anomaly inflow). Route K5a reads this as a quantized pump. A pump is topological only if its count holds under every
// deformation that keeps the bulk gap open, and moves only when a deformation closes it. This file runs that test on the
// rule's own members, with E-SPN-0168's instrument (code/measure/wall-face wallFlow) unchanged.
//
// WHAT IS RUN. E-SPN-0168's slab: L depth classes along x3, the Wilson schedule (E-SPN-0166, wilson-register
// wilsonSchedule) on the first `wil` classes and E-SPN-0160's register rule on the rest, half 0 of the register, member unit
// u = ringUnit(-2, 5) (M 0.7605), the Landau field F01 = 2 pi p / qa with Peierls phases roots of unity of order 2 qa, and
// the loop k2 = k2Start + 2 pi t, t = 0 .. 1, at fixed (k0, k1). wallFlow finds every level within `window` of pi at each
// loop step (matrix-free deflated Lanczos with a completeness certificate), labels it wall A or B by its weight on the
// depth classes about wall A, and counts the crossings of pi per wall. Six readings:
//  B0 BASE. E-SPN-0168's E1 configuration: qa 15, p 1, L 12, wil 6, (k0, k1) = (0.02, 0.05), k2Start 0.013, 16 steps,
//     window 0.35.
//  D1 THE WILSON MASS. The Wilson unit v changed from E-SPN-0166's default conj u^2 (arg -1.5210, rest mass m0 = 0.7605)
//     to v = ringUnit(-5, -4) (arg -1.2403, m0 = 0.4798). Window 0.2 and 24 steps (see probes).
//  D2 THE FIELD STRENGTH. Flux 1/9 per unit (qa 9, B = 0.698) in place of 1/15 (B = 0.419). qa = 9 = 2 D + 1 with D = 4
//     and 3 | 9, so the field is exact in the ring the light's depth-4 column supplies (E-SPN-0168 point 7).
//  D3 THE LOOP PATH. (k0, k1) = (0.31, -0.17), k2Start 0.4: a different closed loop through the magnetic zone.
//  D4 THE SLAB DEPTH. L 16, wil 8 (walls 8 classes apart in place of 6).
//  D5 THE WALL POSITION. L 12 with the Wilson region 4 classes wide and the E-SPN-0160 region 8: the walls moved off the
//     symmetric places.
//  C  THE CONTROL THAT CLOSES THE GAP. v = ringUnit(4, -3) (arg -0.4738, m0 = -0.2867): the same |m0| as nearby gapped
//     cases, but reached from the default v only by passing m0 = 0 at v = ringUnit(2, -2) (arg exactly -M), where the
//     Wilson bulk is gapless at K = 0. Read too: the flow at v = ringUnit(2, -2) itself, the closing point.
//
// DERIVED BEFORE THE GATE RUN (points 1 to 3 before any probe; point 4 from the probes, disclosed below):
//  1. THE COUNT IS AN INDEX OF THE BULK. Per half, the net crossings of pi per loop on one wall is 2 chi p (E-SPN-0168
//     point 8): chi = +-2 the wall's chirality (one Weyl doublet), p the flux quanta per magnetic cell. chi is the jump of
//     the second Chern number across the wall (E-SPN-0165, 0166: C2 = -1 per copy on the Wilson side, 0 on the E-SPN-0160
//     side), so it can change only where the Wilson bulk's gap closes. p is an integer of the field. Neither depends on
//     the Wilson strength, the flux size at fixed p, the loop's transverse momentum, the wall separation or position.
//     So every gap-keeping deformation D1 to D5 should read +4 on wall A and -4 on wall B.
//  2. WHERE IT MAY MOVE. The Wilson side's rest mass is m0 = -(M + arg v). Field-free, the Wilson bulk's gap is |m0| at
//     K = 0 on the path from the default v toward arg v = -M, and it closes exactly at v = ringUnit(2, -2) (arg v =
//     -0.7605 = -M, an exact ring unit since -conj u is one). Past it (m0 < 0) both sides carry C2 = 0, there is no wall
//     and no in-gap Landau level, so the flow should read 0 and 0. The count is allowed to move there, and only there.
//  3. WHAT KEEPS THE GAP. For D1 the path is the straight line in arg v from -1.5210 to -1.2403; the field-free gap is
//     sampled along it. For D2 the field path runs through fluxes 1/12 and 1/10 (read in the bulk at those qa, floats
//     being enough for a gap); for D3 the straight line between the two loops (its midpoint read). D4 and D5 do not
//     touch the bulk. In every case the bulk slabs (Wilson and E-SPN-0160, two classes, the case's field) must carry no
//     level within the case's window at the loop's momenta, so the levels the instrument counts are wall levels.
//  4. (from probes) The field-free gap of the Wilson bulk is 0.542 at the default v (at a doubler), rises to 0.573 at
//     arg v = -1.3339, and equals |m0| from there on: 0.4798 at D1's v, 0 at ringUnit(2, -2). In the qa 15 field D1's
//     bulk keeps 0.277 (dense, 4 k2 values), below E-SPN-0168's window 0.35, where the search did not complete; window 0.2
//     with 24 steps completes.
//
// PROBES BEFORE THE GATES, disclosed:
//  tmp/wp-probe1.log (dense field gaps at qa 15, profile Wilson / E-SPN-0160: base 0.4899 / 0.7605; v(0, -1) 0.1135;
//  v(-5, -4) 0.2768; v(2, -2) 0.1286; v(4, -3) 0.3692; u(1, 3) 0.4436 / 0.6669; the run was cut by its timeout before the
//  other fields). tmp/wp-probe2.log (field-free Wilson gap against arg v over K = 0 and 512 Weyl momenta: 0.54195 at
//  -1.5210, 0.57340 at -1.3339, 0.47980 at -1.2403, 0.28670 at -1.0472, 0.00000 at -0.7605, 0.28670 at -0.4738).
//  tmp/wp-probe3.log (the base flow reproduced: A +4, B -4, complete, eigen residual 8.0e-14, 115 s; E-SPN-0168 recorded
//  3.7e-14 for the same reading, so the residual is not gated bit for bit). tmp/wp-probe4.log (v(-5, -4) window 0.35: A
//  +4 B -4 but one step incomplete; window 0.2, 24 steps: A +4 B -4, complete, 8 ambiguous labels; v(4, -3): 0 and 0,
//  no level in the window; v(2, -2) window 0.35: 0 and 0, 4 entries and exits, 8 ambiguous; window 0.2: 0 and 0, no
//  level). tmp/wp-probe5.log (qa 21 p 2: A +8 B -8, twice the flux quanta, as 2 chi p says; qa 9 p 1: +4 / -4; the
//  loop (0.31, -0.17, 0.4): +4 / -4; L 16: +4 / -4; L 8: +4 / -4 with 8 ambiguous labels (wall mass 0.0244 there); wil
//  4: +4 / -4; a weight-on-depths reading of each crossing, read and dropped: it measures how much of a wall mode lies in
//  the six labeling classes, 3.997 at L 16 and 2.59 at L 8, a geometry number and no index). tmp/wp-probe6.log (the bulk
//  slabs' levels within the window by the matrix-free search, 4 k2 values, 5 to 14 s a case: none for base, D1 (window
//  0.2), qa 9 and v(4, -3); four at 0.129 for v(2, -2), on the Wilson profile). tmp/wp-probe7.log (the same at fluxes
//  1/12 and 1/10: none). tmp/wp-smoke.log (every code path on a small plan, qa 3, L 8, 3 steps: runs in 58 s; the qa 3
//  field closes the gap, as E-SPN-0168 found, so its counts mean nothing; no gate changed after it). The flux-2 reading (+8) is not a gate:
//  p is the field's own integer, and the route's question is the count at fixed p.
//  Prior: E-SPN-0171 already read the flow at other member units u (ringUnit(6, 0), (0, 4): +4 / -4 each), so u is not
//  varied here.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved:
//  I1 INSTRUMENT. Every loop step of every flow (B0, D1 to D5, C and the closing read) has a complete search, and every
//     returned level has eigen residual at most 1e-8.
//  I2 INSTRUMENT. B0 reads E-SPN-0168's E1: A +4, B -4.
//  K1 THE GAP KEPT (D1). The field-free Wilson gap over K = 0 and 512 Weyl momenta stays at least 0.4 at 7 values of arg v
//     evenly spaced from -1.5210 to -1.2403 (a sampled minimum, not a certificate between the samples).
//  K2 THE GAP KEPT IN THE FIELD. For B0 and D1 to D5, and at fluxes 1/12 and 1/10 (D2's path) and the midpoint loop
//     (D3's path), the two-class bulk slabs (all Wilson, all E-SPN-0160) carry no level within the case's window at 8 k2
//     values of the loop, each search complete.
//  C1 CONTROL, THE GAP CLOSED. (a) the field-free Wilson gap at K = 0 with v = ringUnit(2, -2) is at most 1e-9 (the path
//     to C closes the gap), and (b) the flow at v = ringUnit(4, -3) reads A 0, B 0: the instrument returns another
//     integer when the deformation closes the gap.
//  H1 THE ROUTE. Every gap-keeping deformation D1 to D5 reads A +4, B -4.
//  P1 THE FALSIFIER. Some gap-keeping deformation, with I1 and K1, K2 holding, reads A != +4 or B != -4.
//  Read, not gated: the flow at v = ringUnit(2, -2) (the closing point) and its bulk levels in the window; the number of
//  ambiguous labels per case.
// VERDICT, fixed before the run: PASS when I1, I2, K1, K2, C1 and H1 hold. FAIL when P1 holds (I1, K1, K2 holding). PARTIAL
//  otherwise (an instrument, gap or control gate missed with no falsifying count).
// WHAT THIS CAN AND CANNOT SHOW. The reading is a crossing count, an integer by construction, so "off an integer" is read
//  as "a gap-keeping deformation gives a count other than +-4", and the count's precision is its certificate: a complete
//  search (no level missed in the window) and eigen residuals at the float floor. A pass shows the count is constant over
//  five deformations of the field, the loop and the wall on the rule's own members and moves where the gap closes: what a
//  topological pump does. It cannot show invariance under every deformation, it samples the gap along the paths rather
//  than certifying it between samples, it is one-body (no interaction), and it is not a Hall conductance: the row's
//  quantum Hall effect needs a 2d sample and a measured sigma_xy, which this does not give.
//
// FIRST RUN 2026-10-02 (tmp/wp-spn-run1.log, 1184 s): PASS, every gate as registered, none moved or rerun. I1 every
//  step of every flow complete, worst eigen residual 2.2e-9 (the closing read; 5.9e-12 or less on the gated cases). I2
//  B0 A +4, B -4, as E-SPN-0168's E1. K1 the field-free Wilson gap along arg v from -1.5210 to -1.2403: 0.54195,
//  0.55373, 0.56501, 0.57583, 0.57339, 0.52661, 0.47983. K2 no bulk level within the window for B0, D1 to D5, fluxes
//  1/12 and 1/10 and the midpoint loop, every search complete. H1 D1 (Wilson v, m0 0.4798) A +4 B -4 (8 ambiguous labels,
//  eigen 5.9e-12); D2 (flux 1/9) +4 / -4; D3 (loop 0.31, -0.17, 0.4) +4 / -4; D4 (depth 16) +4 / -4; D5 (Wilson region 4
//  of 12) +4 / -4; each wall's count is 4 up and 0 down (A) or 0 up and 4 down (B), no crossing against the flow. C1 the
//  gap at v(2, -2), K = 0, is 0 to the float; the flow at v(4, -3) reads 0 and 0 with no level in the window. Read: at
//  the closing point v(2, -2) the flow reads 0 and 0, with 8 bulk levels inside the window (nearest 0.1289) and 8
//  ambiguous labels: there the count has already left 4. P1 false.
//
// Depth L2, as E-SPN-0168. DETERMINISM: no random numbers (fixed trigonometric Lanczos starts and Weyl momenta). EXACT: every
// unit is a ring unit of Z[omega][1/42]; the gated fields' phases are roots of unity of order 2 qa (qa 15 and 9); the
// intermediate fluxes 1/12 and 1/10 of K2 are float gap checks only; the spectra are floats, as measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import {
  partnerProjector48,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  sectorBasis,
  volumeRight,
} from '@/code/measure/chiral-register'
import { halfPieces, halfPhases } from '@/code/measure/chiral-flow'
import {
  wilsonSchedule,
  type HalfSet,
  type Slab,
  type Unit,
} from '@/code/measure/wilson-register'
import {
  levelsNearPi,
  wallFlow,
  type WallFlow,
} from '@/code/measure/wall-face'

const HEAVY: readonly [number, number] = [-2, 5]

export type FlowCase = {
  name: string
  v?: readonly [number, number]
  qa: number
  p: number
  L: number
  wil: number
  k0: number
  k1: number
  k2Start: number
  steps: number
  window: number
}

export type PumpPlan = {
  base: FlowCase
  keep: readonly FlowCase[]
  closed: FlowCase
  closing: FlowCase
  pathFluxes: readonly number[]
  pathSamples: number
  gapMomenta: number
  gapK2: number
  lanczosSteps: number
  vEnd: readonly [number, number]
}

const BASE: FlowCase = {
  name: 'B0',
  qa: 15,
  p: 1,
  L: 12,
  wil: 6,
  k0: 0.02,
  k1: 0.05,
  k2Start: 0.013,
  steps: 16,
  window: 0.35,
}

export const GATE_PLAN: PumpPlan = {
  base: BASE,
  keep: [
    {
      ...BASE,
      name: 'D1 Wilson v',
      v: [-5, -4],
      steps: 24,
      window: 0.2,
    },
    { ...BASE, name: 'D2 flux 1/9', qa: 9 },
    { ...BASE, name: 'D3 loop', k0: 0.31, k1: -0.17, k2Start: 0.4 },
    { ...BASE, name: 'D4 depth 16', L: 16, wil: 8 },
    { ...BASE, name: 'D5 wall moved', wil: 4 },
  ],
  closed: { ...BASE, name: 'C v(4,-3)', v: [4, -3] },
  closing: { ...BASE, name: 'read v(2,-2)', v: [2, -2] },
  pathFluxes: [12, 10],
  pathSamples: 7,
  gapMomenta: 512,
  gapK2: 8,
  lanczosSteps: 80,
  vEnd: [-5, -4],
}

const flag = (b: boolean): number => (b ? 1 : 0)

const unitValue = (kj: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

export default experiment({
  id: 'spin/wall-pump-deformation',
  code: 'E-SPN-0188',
  title:
    'the E . B wall pump of the register rule is quantized, pass: member number moves +4 per loop on one wall and -4 on the other under five deformations that keep the bulk gap open (a Wilson unit with rest mass 0.48 in place of 0.76, flux 1/9 in place of 1/15, another loop through the magnetic zone, depth 16 in place of 12, the wall moved off center), each count certified complete with eigen residuals at most 5.9e-12, and it drops to 0 on both walls when the Wilson unit is moved past the exact ring unit where the bulk gap closes at rest, so the count is an index of the bulk and changes only where the gap closes; it is one-body and not yet a Hall conductance',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return wallPumpRun(GATE_PLAN)
  },
})

export function wallPumpRun(plan: PumpPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const basis = sectorBasis(volumeRight())
  const u = unitValue(HEAVY)
  const M = wrap(unitAngle(ringUnit(HEAVY[0], HEAVY[1])) - Math.PI)
  const trivialHalf = halfPieces(
    wilsonSchedule(qS, qD, u, { wilson: false }),
    basis,
    0,
  ).pieces
  const wilsonHalf = (v?: Unit) =>
    halfPieces(
      wilsonSchedule(
        qS,
        qD,
        u,
        v ? { wilson: true, v } : { wilson: true },
      ),
      basis,
      0,
    ).pieces
  const setsOf = (c: FlowCase): HalfSet[] => [
    { pieces: trivialHalf },
    { pieces: wilsonHalf(c.v ? unitValue(c.v) : undefined) },
  ]
  const slabOf = (c: FlowCase): Slab => ({
    L: c.L,
    qa: c.qa,
    p: c.p,
    profile: Array.from({ length: c.L }, (_, i) => (i < c.wil ? 1 : 0)),
  })
  // the depth classes about wall A (the wall between class wil - 1 and class wil), L / 2 of them, as E-SPN-0168
  const aDepthsOf = (c: FlowCase): Set<number> =>
    new Set(
      Array.from(
        { length: c.L / 2 },
        (_, i) => (Math.round(c.wil / 2) + i) % c.L,
      ),
    )

  // ---------------- K1, C1a: the field-free Wilson gap along the v path ----------------
  const Ks = [[0, 0, 0, 0], ...weylMomenta(plan.gapMomenta)]

  const fieldFreeGap = (
    v: Unit,
    momenta: readonly number[][],
  ): number => {
    const pieces = halfPieces(
      wilsonSchedule(qS, qD, u, { wilson: true, v }),
      basis,
      0,
    ).pieces

    let g = Infinity

    for (const K of momenta) {
      for (const ph of halfPhases(pieces, { q: 1, p: 0 }, K)) {
        g = Math.min(g, Math.abs(wrap(ph - Math.PI)))
      }
    }

    return g
  }

  const argDefault = wrap(-2 * unitAngle(ringUnit(HEAVY[0], HEAVY[1])))
  const argEnd = wrap(unitAngle(ringUnit(plan.vEnd[0], plan.vEnd[1])))
  const pathGaps = Array.from({ length: plan.pathSamples }, (_, i) => {
    const a =
      argDefault + ((argEnd - argDefault) * i) / (plan.pathSamples - 1)

    return { arg: a, gap: fieldFreeGap([Math.cos(a), Math.sin(a)], Ks) }
  })
  const K1 = pathGaps.every(x => x.gap >= 0.4)
  const closingGap = fieldFreeGap(unitValue(plan.closing.v!), [
    [0, 0, 0, 0],
  ])

  log('K1')

  // ---------------- K2: no bulk level within the window in the field ----------------
  const bulkLevels = (
    c: FlowCase,
  ): { count: number; complete: boolean; nearest: number } => {
    const sets = setsOf(c)

    let count = 0
    let complete = true
    let nearest = Infinity

    for (const profile of [
      [1, 1],
      [0, 0],
    ]) {
      for (let j = 0; j < plan.gapK2; j++) {
        const k2 = c.k2Start + (2 * Math.PI * j) / plan.gapK2
        const r = levelsNearPi(
          { L: 2, qa: c.qa, p: c.p, profile },
          sets,
          [c.k0, c.k1, k2, 0],
          DOCK_ROOTS,
          c.window,
          plan.lanczosSteps,
        )

        count += r.levels.length
        complete = complete && r.complete

        for (const l of r.levels) {
          nearest = Math.min(nearest, Math.abs(l.offset))
        }
      }
    }

    return { count, complete, nearest }
  }

  const gapCases: FlowCase[] = [
    plan.base,
    ...plan.keep,
    ...plan.pathFluxes.map(qa => ({
      ...plan.base,
      name: `flux 1/${qa}`,
      qa,
    })),
    {
      ...plan.base,
      name: 'loop midpoint',
      k0: (plan.base.k0 + plan.keep[2]!.k0) / 2,
      k1: (plan.base.k1 + plan.keep[2]!.k1) / 2,
      k2Start: (plan.base.k2Start + plan.keep[2]!.k2Start) / 2,
    },
  ]
  const bulk = gapCases.map(c => ({ name: c.name, ...bulkLevels(c) }))
  const K2 = bulk.every(b => b.count === 0 && b.complete)
  const closingBulk = bulkLevels(plan.closing)

  log('K2')

  // ---------------- the flows ----------------
  const flow = (c: FlowCase): WallFlow => {
    const f = wallFlow(
      slabOf(c),
      setsOf(c),
      c.k0,
      c.k1,
      c.k2Start,
      c.steps,
      DOCK_ROOTS,
      aDepthsOf(c),
      c.window,
      plan.lanczosSteps,
      c.window,
    )

    log(`flow ${c.name}: A ${f.netA} B ${f.netB}`)

    return f
  }

  const fBase = flow(plan.base)
  const fKeep = plan.keep.map(c => ({ c, f: flow(c) }))
  const fClosed = flow(plan.closed)
  const fClosing = flow(plan.closing)
  const all = [fBase, ...fKeep.map(x => x.f), fClosed, fClosing]
  const I1 = all.every(f =>
    f.steps.every(st => st.complete && st.eigenResidual <= 1e-8),
  )
  const I2 = fBase.netA === 4 && fBase.netB === -4
  const C1 =
    closingGap <= 1e-9 && fClosed.netA === 0 && fClosed.netB === 0
  const H1 = fKeep.every(x => x.f.netA === 4 && x.f.netB === -4)
  const P1 = I1 && K1 && K2 && !H1
  const status: Verdict['status'] = P1
    ? 'fail'
    : I1 && I2 && K1 && K2 && C1 && H1
      ? 'pass'
      : 'partial'
  const flowLine = (f: WallFlow): string =>
    `A ${f.netA} (up ${f.A.up} down ${f.A.down}) B ${f.netB} (up ${f.B.up} down ${f.B.down}), ambiguous ${f.ambiguous}, eigen ${f.worstEigen.toExponential(1)}, complete ${f.steps.every(st => st.complete)}`
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `I1 ${I1} I2 ${I2} (B0: ${flowLine(fBase)}); K1 ${K1} (field-free Wilson gap along arg v ${pathGaps.map(x => `${x.arg.toFixed(4)}: ${x.gap.toFixed(5)}`).join(', ')}); K2 ${K2} (bulk levels in the window: ${bulk.map(b => `${b.name} ${b.count}${b.complete ? '' : ' incomplete'}`).join(', ')}); C1 ${C1} (gap at v(2,-2), K = 0: ${closingGap.toExponential(2)}; flow at v(4,-3): ${flowLine(fClosed)}); H1 ${H1} (${fKeep.map(x => `${x.c.name}: ${flowLine(x.f)}`).join('; ')}); P1 ${P1}; read: the closing point v(2,-2): ${flowLine(fClosing)}, bulk levels in the window ${closingBulk.count} (nearest ${Number.isFinite(closingBulk.nearest) ? closingBulk.nearest.toFixed(4) : 'none'})`,
    metrics: {
      I1: flag(I1),
      I2: flag(I2),
      K1: flag(K1),
      K2: flag(K2),
      C1: flag(C1),
      H1: flag(H1),
      P1: flag(P1),
      baseA: fBase.netA,
      baseB: fBase.netB,
      ...Object.fromEntries(
        fKeep.flatMap((x, i) => [
          [`D${i + 1}A`, x.f.netA],
          [`D${i + 1}B`, x.f.netB],
        ]),
      ),
      closedA: fClosed.netA,
      closedB: fClosed.netB,
      closingA: fClosing.netA,
      closingB: fClosing.netB,
      minPathGap: Math.min(...pathGaps.map(x => x.gap)),
      closingGap,
      worstEigen: Math.max(...all.map(f => f.worstEigen)),
      seconds,
    },
    control: {
      C1: flag(C1),
      closedA: fClosed.netA,
      closedB: fClosed.netB,
      instrument: flag(I1 && I2),
    },
    notes: `L2. Member unit u = ringUnit(${HEAVY.join(', ')}), M ${M.toFixed(6)}; rest mass of the Wilson side m0 = -(M + arg v): default ${(-(M + argDefault)).toFixed(4)}, D1 ${(-(M + argEnd)).toFixed(4)}, C ${(-(M + wrap(unitAngle(ringUnit(plan.closed.v![0], plan.closed.v![1]))))).toFixed(4)}, closing ${(-(M + wrap(unitAngle(ringUnit(plan.closing.v![0], plan.closing.v![1]))))).toFixed(4)}. Cases: ${[plan.base, ...plan.keep, plan.closed, plan.closing].map(c => `${c.name} (qa ${c.qa} p ${c.p} L ${c.L} wil ${c.wil} k ${c.k0}, ${c.k1}, ${c.k2Start} steps ${c.steps} window ${c.window}${c.v ? ` v (${c.v.join(',')})` : ''})`).join('; ')}. The count is 2 chi p per wall per half at fixed p; at p 2 a probe read 8 (not gated). ${seconds.toFixed(0)} s.`,
  })
}
