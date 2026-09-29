// E-SPN-0172 CLOSING THE WILSON FAR-SIDE FLOQUET RESONANCE. E-SPN-0168 found the wall pair census open through two routes: pairs
// whose depth momentum the wall no longer conserves, and a Floquet resonance with the Wilson far-side walk (D <-> T S,
// resting at phase 0), whose half-width |arg v| exceeds every light wall mass, so two far-side quanta meet the member
// pair's 2 m_w modulo 2 pi. It named two escapes: give the far-side walk its own partner so its width drops below m_w,
// or move its phase off 0 with a schedule. This experiment tries both, exactly and covariantly, keeping the wall's C2,
// chirality and flow.
//
// DERIVATION (points 1 to 3 written before probe 1; points 4 to 7 after probes 1 to 6, disclosed below):
//  1. THE WALK'S ENDPOINTS. Write the two beats' units on Q_S and Q_D as (a1, b1) and (a2, b2): U = T G2 T^dag G1 (E-SPN-
//     0159). At rest (T = 1) S carries a1 a2 and D b1 b2. At the twelve half-periods (c(K) = <S|T|S> = 0, T S outside S)
//     the member pair S, T D carries a1, b2 and the far walk D, T S carries b1, a2: the far walk runs between those two
//     phases. For E-SPN-0166's Wilson schedule (a1 = u, b2 = ubar, a2 = v, b1 = y = conj v) it runs between -|arg v| and
//     +|arg v| about 0, as E-SPN-0168 read.
//  2. THE WIDTH IS THE INVERSION (route 1 closed). The rest mass inverts exactly when arg(a1 a2) - arg(b1 b2) has the other
//     sign from arg a1 - arg b2, the half-periods' mass: arg a2 - arg b1 must reach past the doubler mass. That difference is
//     the far walk's endpoint spread. So any schedule of mixers on Q_S and Q_D that inverts gives the walk an endpoint
//     spread of at least 2 M: no dock-local partner narrows it below M, and M > m_w. Route 1 (narrowing) cannot work
//     while the wall exists; its first-order partner space, Q_V = Pi4 (x) 1 - Q_D, is scanned as a read (probe 3).
//  3. THE CENTER IS FREE, AT A PRICE ELSEWHERE. With mixers on Q_S and Q_D alone, moving the walk's center (arg a2 + arg
//     b1) / 2 by phi forces the member's center at the half-periods to move by -phi (arg a1 + arg b2 fixed by the rest
//     condition): an identity term in the member's dispersion, particle and antiparticle unequal there. A phase w on Q_F =
//     1 - Q_S - Q_D in BOTH beats, with the member's units compensated (a1 = u w*, b2 = ubar w*, a2 = v w, b1 = y w: far-
//     side.ts centeredSchedule), keeps the member at pi at rest and at the half-periods and moves the far walk and the
//     flats together to psi = 2 arg w.
//  4. THE RIGID SHIFT, AND THE CONDITION. Read in the bulk (probe 4): with w the far walk sits at psi +- the same half-
//     width, and the rest levels do not move. The resonance needs two far quanta summing to 0 modulo 2 pi; with the far set
//     in [psi - a, psi + a] (a the half-width) its pair sums lie in [2 psi - 2 a, 2 psi + 2 a], clear of 0 when psi > a and
//     psi + a < pi. The far walk must also stay below the member band (psi + a < pi - e_max). So the closure needs 2 a +
//     e_max < pi; with the default v (a = 2 M) that is 4 M + e_max < pi: the heavy unit ringUnit(-2, 5) (M 0.7605, a 1.519,
//     e_max 0.951) cannot (3.99), the light unit ringUnit(-1, 4) (M 0.3803, a 0.7596, e_max 0.784) can (2.30). psi =
//     2 arg ringUnit(1, 0) = 1.3339 puts the far set in [0.574, 2.094].
//  5. THE COST: THE WALL NODE MOVES OFF PI. Point 3 holds at rest and at the half-periods, but at the other zeros of the
//     Dirac vector (c = -1/3, -1/6, -1/8) the partner's return carries (1 - c_D^2) w^2, which does not cancel. So the wall's
//     Weyl node, built from every zero, is displaced from pi (probe 6: the in-gap pair at L 12 sits at -0.065 and -0.051,
//     its center -0.058, constant in L while the splitting falls): a one-body offset between the wall member and its
//     antimember at rest, which the pair census reads through the member's own rest level. C2 is not touched (probe 5:
//     chirality +-2 at L 12).
//  6. THE SLAB CENSUS. With w the census on the slab's levels (flats at psi, the far cut 0.85 between the member band's
//     top and the far walk's bottom at eps 1.048) has no crossing between two levels both past the cut (probe 7): the
//     far-side resonance is closed. The depth-momentum channels (MM) remain, as E-SPN-0168 derived; a mixed channel (MF)
//     appears, pairs of one level past the cut and one inside, read.
//  7. THE FLOW. The light construction's field gap (0.21 to 0.24) is below E-SPN-0168's flow window (0.35), so the flow is
//     read at a window of 0.15 with 32 loop steps and 120 Lanczos steps. With w the wall flows +4 on face A and -4 on face
//     B, every step complete (probe 8): E-SPN-0168's flow, kept. Without w the same instrument does not complete (26 of 33
//     steps, eigen residual 0.12), because the far walk at phase 0 crowds the search (probe 8): moving the far side off 0
//     is also what lets the light wall's flow be read.
//
// GATES (fixed before the gate run, after probes 1 to 8):
//  W1 EXACT, UNITARY, COVARIANT. The light centered pieces (Wilson side and E-SPN-0160 side) unitary to 1e-13 and
//     covariant under all 1,152 elements of W(F4) to 1e-12.
//  B1 THE RIGID SHIFT. In the bulk (half 0, rest and 256 Weyl momenta) the far levels with w lie in psi + [lo, hi] with
//     [lo, hi] the w-less far range to 1e-9, and the rest levels are +-M to 1e-12 with and without w.
//  B2 THE RESONANCE CLEARED IN THE BULK. The far set's pair sums with w stay at least 1.0 from 0 modulo 2 pi; without w
//     they reach 0 (to 1e-3, the resonance open: the control).
//  S1 THE SLAB CENSUS. With w at L 6 and 8 (the member's own rest level as M): FF = 0. Without w (flats at 0, cut pi / 2,
//     M = m_w): FF > 0.
//  K1 THE WALL KEPT. With w the wall chirality at L 12 is +2 and -2 (1e-3), 8 in-gap states.
//  E1 THE FLOW KEPT. With w, qa 15, p 1, L 12, half 0, 32 loop steps, window 0.15, Lanczos 120: A +4, B -4, every step
//     complete, eigen residual at most 1e-8.
//  N  THE WALL NODE AT PI (predicted FALSE, the cost): with w the in-gap pair's center at L 12 within 1e-6 of eps 0.
//  C1 CONTROL. The heavy E-SPN-0168 construction on the same instruments: its L 6 census (3212 crossings, MM 1812, MF
//     220, FF 1180) and its recorded chirality at h = 0.01 (1.9999999999856668), exactly.
//  Status: pass needs N; partial when every other gate holds and N is false (as derived); fail otherwise.
//
// PROBES, disclosed: tmp/fs-probe1.log (a phase on Q_F in one beat: the far walk moves, but the reading mixed member
//  and far levels). tmp/fs-probe2.log (one-beat Q_F phases on the heavy unit: the member band's gap closes, 0.0005 to
//  0.037). tmp/fs-probe3.log (a phase on Q_V, the far walk's first-order partner: the walk's range unchanged, +-1.519
//  and +-0.760; new flats at arg w). tmp/fs-probe4.log (the centered construction: the light far walk shifted rigidly to
//  psi +- 0.7596, the member band [0.29, 0.65] clear of it; heavy overlaps). tmp/fs-probe5.log (the slab: chirality +-2
//  with and without w; the first census used a wrong M, 0.38, the next level up, since the wall pair moved below eps 0).
//  tmp/fs-probe6.log (the in-gap levels: with w on both sides the pair at -0.088 / -0.027 (L 4), -0.078 / -0.038 (L 8),
//  -0.065 / -0.051 (L 12); with w on the Wilson side only -0.089 / +0.036, -0.064 / +0.005, -0.043 / -0.016).
//  tmp/fs-probe7.log (the census with the right M: without w L 6 3860 (MM 2760, FF 1100), L 8 7680 (MM 5208, FF 2472);
//  with w L 6 3028 (MM 2892, MF 136, FF 0), L 8 5672 (MM 5484, MF 188, FF 0); the light flow at window 0.2 incomplete).
//  tmp/fs-probe8.log (the light flow at 32 loop steps, window 0.15, Lanczos 120: without w +1 / -1, 26 of 33 steps
//  complete, eigen residual 0.12; with w +4 / -4, 33 of 33, 8.4e-13).
//
// FIRST RUN (tmp/fs-exp-run1.log, 273 s): FAIL on B1, a tolerance set tighter than the construction holds. The far walk's
//  range with w is psi + [-0.759626, 0.759618] against [-0.759624, 0.759624] without: the shift is rigid to 6.3e-6, not
//  to the 1e-9 the gate asked (probe 4 printed four places, which hid it). The rest levels are +-M to 2.0e-15. Every
//  other gate held as derived: W1 unitary 4.2e-15, covariant under all 1,152 to 6.9e-18. B2 the far pair sums stay
//  1.1485 from 0 modulo 2 pi with w, 0 without. S1 with w FF 0 at L 6 and 8 (MM 2892 and 5484, MF 136 and 188); without w
//  FF 1100 and 2472. K1 chirality +2 and -2, 8 in-gap. E1 with w A +4 B -4, 33 of 33 steps complete, eigen 8.4e-13. N
//  FALSE (predicted): the wall pair at L 12 -0.05139 / -0.06525, center -0.05832. C1 E-SPN-0168's L 6 census (3212, MM
//  1812, MF 220, FF 1180) and chirality 1.9999999999856668 exactly. Read: 2 a + e_max 3.9892 (heavy) against 2.3031
//  (light). The fail stands; a rerun would register a rigidity tolerance from the construction's own spread.
//
// DETERMINISM: no random numbers. EXACT: every unit a product of ring units of Z[omega][1/42]; the projectors integer or
// dyadic; the spectra floats, as measurement. NOTHING MOVES: a slot takes its neighbor's value; the mixers act on a
// dock's own register.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { DOCK_ROOTS, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import { f4Group, partnerProjector48, rangeBasis, scaled, singletProjector24 } from '@/code/measure/spinor-register'
import { sectorBasis, sectorBlock, volumeRight } from '@/code/measure/chiral-register'
import { halfPieces, halfPhases } from '@/code/measure/chiral-flow'
import { cmulUnit, conjUnit, wallChirality, wilsonSchedule, type HalfSet, type Slab } from '@/code/measure/wilson-register'
import { wallFlow } from '@/code/measure/wall-face'
import { centeredSchedule, covarianceGap, farCensus, farProjector, flatPhase, slabEpsAt, unitarityGap } from '@/code/measure/far-side'

type C = [number, number]

const LIGHT: readonly [number, number] = [-1, 4]
const HEAVY: readonly [number, number] = [-2, 5]
const W_UNIT: readonly [number, number] = [1, 0]
const RECORDED_CHI_A0 = 1.9999999999856668
const RECORDED_0168_L6 = { crossings: 3212, MM: 1812, MF: 220, FF: 1180 }
const FAR_CUT = 0.85

export type FarSidePlan = { censusL: readonly number[]; censusSteps: number; momenta: number }

export const GATE_PLAN: FarSidePlan = { censusL: [6, 8], censusSteps: 48, momenta: 256 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/far-side-shift',
  code: 'E-SPN-0172',
  title:
    'the Wilson far-side resonance closed by moving the far walk off zero, keeping the wall chirality and its flow, but the node moves and the rigidity gate failed, fail: the far walk width is the inversion itself, so no partner narrows it; a phase on the far sector in both beats with the member units compensated moves the far walk and the flats to 2 arg w, clearing the resonance by 1.15 in the bulk and leaving no far-far crossing on the slab at depths 6 and 8, with chirality +-2 and a flow of +-4 kept, for a light member only (2 a + e_max 2.30 against 3.99 heavy); the cost is the wall Weyl node displaced to -0.058, since the partner return at the other zeros carries w squared; the shift is rigid to 6.3e-6, not the 1e-9 pre-registered, and the depth-momentum channels remain',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return farSideRun(GATE_PLAN)
  },
})

export function farSideRun(plan: FarSidePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const val = (kj: readonly [number, number]): C => {
    const t = unitAngle(ringUnit(kj[0], kj[1]))

    return [Math.cos(t), Math.sin(t)]
  }
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const qF = farProjector(qS, qD)
  const basis = sectorBasis(volumeRight())
  const range = (q: Float64Array): number[][] => rangeBasis(sectorBlock({ re: q, im: new Float64Array(q.length) }, basis, 0).block.re, 96)
  const sR = range(qS)
  const dR = range(qD)
  const u = val(LIGHT)
  const M = Math.abs(wrap(unitAngle(ringUnit(LIGHT[0], LIGHT[1])) - Math.PI))
  const vDef = cmulUnit(conjUnit(u), conjUnit(u))
  const w = val(W_UNIT)
  const psi = flatPhase(w)
  const full = (ww: C | null): { wil: CMatrix[]; plain: CMatrix[] } => ({ wil: centeredSchedule(qS, qD, qF, u, { v: vDef, w: ww }), plain: centeredSchedule(qS, qD, qF, u, { v: null, w: ww }) })
  const setsFrom = (p: { wil: CMatrix[]; plain: CMatrix[] }): HalfSet[] => [{ pieces: halfPieces(p.plain, basis, 0).pieces }, { pieces: halfPieces(p.wil, basis, 0).pieces }]
  const withW = full(w)
  const without = full(null)
  const setsW = setsFrom(withW)
  const sets0 = setsFrom(without)
  const wallSlab = (L: number): Slab => ({ L, qa: 1, p: 0, profile: Array.from({ length: L }, (_, c) => (c < L / 2 ? 1 : 0)) })
  const DIRS3 = [
    [1, 0, 0],
    [Math.SQRT1_2, Math.SQRT1_2, 0],
    [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)],
    [0.29, 0.52, 0.8].map(x => x / Math.hypot(0.29, 0.52, 0.8)),
  ]
  const paths = DIRS3.map(d =>
    Array.from({ length: plan.censusSteps + 1 }, (_, i) => {
      const k = (Math.PI * i) / plan.censusSteps

      return [(d[0] as number) * k, (d[1] as number) * k, (d[2] as number) * k, 0]
    }),
  )

  // ---------------- W1: exact, unitary, covariant ----------------
  const group = f4Group()
  let unitGap = 0
  let covGap = 0

  for (const P of [...withW.wil, ...withW.plain]) {
    unitGap = Math.max(unitGap, unitarityGap(P))
    for (const g of group) covGap = Math.max(covGap, covarianceGap(P, g))
  }

  const W1 = unitGap <= 1e-13 && covGap <= 1e-12

  log('W1')

  // ---------------- B1, B2: the bulk far set ----------------
  const Ks = [[0, 0, 0, 0], ...weylMomenta(plan.momenta)]
  const bulk = (P: CMatrix[], center: number): { far: number[]; rest: number[] } => {
    const pieces = halfPieces(P, basis, 0).pieces
    const far: number[] = []
    let rest: number[] = []

    for (const K of Ks) {
      const ph = halfPhases(pieces, { q: 1, p: 0 }, K)

      if (K.every(x => x === 0)) rest = ph.map(p => wrap(p - Math.PI)).filter(x => Math.abs(x) < 1).sort((a, b) => a - b)
      // the far side: every level nearer the flats' phase than pi (the flats themselves included)
      for (const p of ph) if (Math.abs(wrap(p - center)) < Math.abs(wrap(p - Math.PI))) far.push(wrap(p - center))
    }

    return { far, rest }
  }
  const b0 = bulk(without.wil, 0)
  const bW = bulk(withW.wil, psi)
  const lo0 = Math.min(...b0.far)
  const hi0 = Math.max(...b0.far)
  const loW = Math.min(...bW.far)
  const hiW = Math.max(...bW.far)
  const restGap = Math.max(...[...b0.rest, ...bW.rest].map(x => Math.abs(Math.abs(x) - M)))
  const B1 = Math.abs(loW - lo0) <= 1e-9 && Math.abs(hiW - hi0) <= 1e-9 && restGap <= 1e-12
  // the pair sums' distance from 0 modulo 2 pi, over the far set's extremes (the sums fill [2 lo, 2 hi] about 2 center)
  const clearance = (center: number, lo: number, hi: number): number => {
    const a = 2 * center + 2 * lo
    const b = 2 * center + 2 * hi

    // the interval [a, b] against the multiples of 2 pi
    for (let k = Math.ceil(a / (2 * Math.PI)); k * 2 * Math.PI <= b; k++) return 0

    return Math.min(...[a, b].map(x => Math.abs(wrap(x))))
  }
  const clearW = clearance(psi, loW, hiW)
  const clear0 = clearance(0, lo0, hi0)
  const B2 = clearW >= 1.0 && clear0 <= 1e-3

  log('B1 B2')

  // ---------------- S1: the slab census ----------------
  const censusOf = (sets: HalfSet[], L: number, flat: number, cut: number): { M: number; inGap: number[]; c: ReturnType<typeof farCensus> } => {
    const inGap = slabEpsAt(wallSlab(L), sets, [0, 0, 0, 0], DOCK_ROOTS, sR, dR, null).eps.filter(x => Math.abs(x) < 0.3)
    const m = Math.max(...inGap)

    return { M: m, inGap, c: farCensus(wallSlab(L), sets, m, paths, DOCK_ROOTS, sR, dR, flat, cut) }
  }
  const censusW = plan.censusL.map(L => ({ L, ...censusOf(setsW, L, psi, FAR_CUT) }))

  log('S1 with w')

  const census0 = plan.censusL.map(L => ({ L, ...censusOf(sets0, L, 0, Math.PI / 2) }))
  const S1 = censusW.every(x => x.c.channels.FF === 0) && census0.every(x => x.c.channels.FF > 0)

  log('S1 without w')

  // ---------------- K1, N: the wall ----------------
  const aDepths = new Set([3, 4, 5, 6, 7, 8])
  const chi = wallChirality(wallSlab(12), setsW, DOCK_ROOTS, sR, dR, aDepths, 0.01, 0.1)
  const K1 = chi.inGap === 8 && chi.walls.length === 2 && Math.abs((chi.walls[0] as { chirality: number }).chirality - 2) <= 1e-3 && Math.abs((chi.walls[1] as { chirality: number }).chirality + 2) <= 1e-3
  const pair12 = [...new Set(slabEpsAt(wallSlab(12), setsW, [0, 0, 0, 0], DOCK_ROOTS, sR, dR, null).eps.filter(x => Math.abs(x) < 0.1).map(x => Number(x.toFixed(12))))]
  const center12 = pair12.length ? (Math.min(...pair12) + Math.max(...pair12)) / 2 : NaN
  const N = Math.abs(center12) <= 1e-6

  log('K1 N')

  // ---------------- E1: the flow kept ----------------
  const flowSlab: Slab = { L: 12, qa: 15, p: 1, profile: Array.from({ length: 12 }, (_, c) => (c < 6 ? 1 : 0)) }
  const flowW = wallFlow(flowSlab, setsW, 0.02, 0.05, 0.013, 32, DOCK_ROOTS, new Set([3, 4, 5, 6, 7, 8]), 0.15, 120, 0.15)
  const E1 = flowW.netA === 4 && flowW.netB === -4 && flowW.steps.every(st => st.complete && st.eigenResidual <= 1e-8)

  log('E1')

  // ---------------- C1: E-SPN-0168's heavy construction on the same instruments ----------------
  const uH = val(HEAVY)
  const heavy = wilsonSchedule(qS, qD, uH, { wilson: true })
  const trivial = wilsonSchedule(qS, qD, uH, { wilson: false })
  const setsH: HalfSet[] = [{ pieces: halfPieces(trivial, basis, 0).pieces }, { pieces: halfPieces(heavy, basis, 0).pieces }]
  const mH = Math.min(...slabEpsAt(wallSlab(6), setsH, [0, 0, 0, 0], DOCK_ROOTS, sR, dR, null).eps.filter(x => x > 0))
  const heavyCensus = farCensus(wallSlab(6), setsH, mH, paths, DOCK_ROOTS, sR, dR, 0, Math.PI / 2)
  const heavyChi = wallChirality(wallSlab(12), setsH, DOCK_ROOTS, sR, dR, aDepths, 0.01, 0.1)
  const C1 =
    heavyCensus.crossings === RECORDED_0168_L6.crossings &&
    heavyCensus.channels.MM === RECORDED_0168_L6.MM &&
    heavyCensus.channels.MF === RECORDED_0168_L6.MF &&
    heavyCensus.channels.FF === RECORDED_0168_L6.FF &&
    (heavyChi.walls[0] as { chirality: number }).chirality === RECORDED_CHI_A0

  log('C1')

  // read: the heavy unit's far range and member band, the closure condition 2 a + e_max < pi (point 4)
  const heavyBulk = bulk(heavy, 0)
  const heavyA = Math.max(...heavyBulk.far.map(Math.abs))
  const heavyEmax = Math.max(
    ...Ks.flatMap(K =>
      halfPhases(halfPieces(heavy, basis, 0).pieces, { q: 1, p: 0 }, K)
        .map(p => Math.abs(wrap(p - Math.PI)))
        .filter(e => e < Math.PI / 2),
    ),
  )
  const lightEmax = Math.max(
    ...Ks.flatMap(K =>
      halfPhases(halfPieces(without.wil, basis, 0).pieces, { q: 1, p: 0 }, K)
        .map(p => Math.abs(wrap(p - Math.PI)))
        .filter(e => e < Math.PI / 2),
    ),
  )
  const hard = W1 && B1 && B2 && S1 && K1 && E1 && C1
  const status = !hard ? 'fail' : N ? 'pass' : 'partial'
  const cLine = (x: { L: number; M: number; inGap: number[]; c: ReturnType<typeof farCensus> }): string =>
    `L ${x.L} (M ${x.M.toFixed(5)}, in-gap ${[...new Set(x.inGap.map(y => y.toFixed(5)))].join(' ')}): ${x.c.crossings} crossings, MM ${x.c.channels.MM} MF ${x.c.channels.MF} FF ${x.c.channels.FF}`

  return verdict({
    status,
    claim: `W1 ${W1} (unitary ${unitGap.toExponential(1)}, covariant under ${group.length} ${covGap.toExponential(1)}); B1 ${B1} (far range without w [${lo0.toFixed(6)}, ${hi0.toFixed(6)}], with w psi ${psi.toFixed(6)} + [${loW.toFixed(6)}, ${hiW.toFixed(6)}]; rest levels +-M to ${restGap.toExponential(1)}); B2 ${B2} (far pair sums from 0 mod 2 pi: with w ${clearW.toFixed(4)}, without ${clear0.toExponential(1)}); S1 ${S1} (with w, cut ${FAR_CUT}: ${censusW.map(cLine).join('; ')}; without w: ${census0.map(cLine).join('; ')}); K1 ${K1} (in-gap ${chi.inGap}, chirality ${chi.walls.map(x => x.chirality.toFixed(6)).join(', ')}); E1 ${E1} (with w, qa 15: A ${flowW.netA} (up ${flowW.A.up} down ${flowW.A.down}) B ${flowW.netB}, complete ${flowW.steps.filter(st => st.complete).length}/${flowW.steps.length}, eigen ${flowW.worstEigen.toExponential(1)}); N ${N} (wall pair at L 12 ${pair12.map(x => x.toFixed(5)).join(' ')}, center ${center12.toFixed(5)}); C1 ${C1} (heavy L 6: ${heavyCensus.crossings} crossings, MM ${heavyCensus.channels.MM} MF ${heavyCensus.channels.MF} FF ${heavyCensus.channels.FF}; chirality ${(heavyChi.walls[0] as { chirality: number }).chirality}); read: closure condition 2 a + e_max against pi, heavy ${(2 * heavyA + heavyEmax).toFixed(4)}, light ${(2 * (hi0 - lo0) / 2 + lightEmax).toFixed(4)}`,
    metrics: {
      W1: flag(W1),
      B1: flag(B1),
      B2: flag(B2),
      S1: flag(S1),
      K1: flag(K1),
      E1: flag(E1),
      N: flag(N),
      flowA: flowW.netA,
      flowB: flowW.netB,
      C1: flag(C1),
      psi,
      halfWidth: (hi0 - lo0) / 2,
      clearance: clearW,
      nodeCenter12: center12,
      FF6: (censusW[0] as { c: { channels: { FF: number } } }).c.channels.FF,
      MM6: (censusW[0] as { c: { channels: { MM: number } } }).c.channels.MM,
      MF6: (censusW[0] as { c: { channels: { MF: number } } }).c.channels.MF,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1) },
    notes: `L2. Light unit ringUnit(${LIGHT.join(', ')}) (M ${M.toFixed(6)}), v = conj u^2, far phase w = ringUnit(${W_UNIT.join(', ')}) in both beats, psi ${psi.toFixed(6)}. The far walk's half-width is the inversion (route 1 closed by point 2); its center moves with w (route 2), clearing the resonance by ${clearW.toFixed(4)}, at the cost of the wall node's displacement to ${center12.toFixed(5)}. Heavy unit: far half-width ${heavyA.toFixed(4)}, member band top ${heavyEmax.toFixed(4)}, 2 a + e_max ${(2 * heavyA + heavyEmax).toFixed(4)} > pi: no center clears it. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
