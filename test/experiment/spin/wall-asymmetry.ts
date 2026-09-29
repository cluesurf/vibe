// E-SPN-0171 THE JOINT ASYMMETRY PER E . B WINDING ON THE CHIRAL WALL. E-SPN-0168 put all three Sakharov conditions in the rule:
// the chiral Wilson wall's face moves member number by 4 per E . B loop (half 0 flows, half 1 has no wall), E-SPN-0164
// breaks C and CP together through the register exchange with the trimaximal flavors, and the count runs one way. It did
// not run them jointly. This experiment asks what they give together: the net members minus antimembers on one face per
// winding, whether the CP phase makes the + and - flows unequal, and what fixes its sign.
//
// DERIVATION (points 1 to 6 written before the gate run; the numbers in 7 after probes wa-probe1 to 3, disclosed below):
//  1. THE FLOW IS AN INDEX. A face's net flow per loop is the net number of levels crossing pi, an integer, 2 chi p per
//     half (E-SPN-0168: +-4 with the right-SU(2) doublet). An integer cannot move under a continuous change of any phase,
//     so no CP phase, and no mixing, changes it: the flow is CP-blind.
//  2. ONE BODY: THE FLAVOR MIXING IS REMOVABLE ON THE SLAB. E-FRC-0259's W = P+ (x) V + P- (x) 1 turns the + half's
//     mixed units V f(D) V^dag into f(D). On the slab W acts inside each dock (register and flavor only), so it keeps every
//     depth weight, and it commutes with the stream, whose Bloch and Peierls phases act alike on every register and flavor
//     component (wilson-register slabStream: one phase per slot, the same for all its modes). So a slab with three flavors
//     on the + half is unitarily equivalent, dock by dock, to three one-flavor slabs: each flavor's wall flows +-4 on its
//     own, the flavored face flows +-4 F, and the flavor composition of the flow is the same for the trimaximal V, its
//     conjugate and a real mixing. At one body the joint asymmetry's CP-odd part is exactly 0.
//  3. TWO BODIES: THE VERTEX KEEPS MEMBER NUMBER. E-SPN-0163's register exchange H' is a sum of c^dag c^dag c c terms, so it
//     commutes with N and never connects two member numbers. E-SPN-0164's CP-odd rates therefore move flavor between the
//     members a winding makes, never N_members - N_antimembers: the member asymmetry per winding stays the index.
//  4. THE CP CONJUGATE OF A WINDING IS THE REVERSED WINDING. CP keeps E and reverses B, so E . B -> -E . B: the Landau flux
//     p -> -p with the loop's direction in k2 (E) kept. The face's flow then reverses exactly, level for level with the
//     two walls exchanged. The same map is the tone mirror on the charge (E-SPN-0164: the sea fixes the sign of the charge
//     and nothing else): the fear sea's member carries the opposite charge and sees the conjugate Peierls phase, p -> -p.
//  5. SO THE SIGN IS sign(charge * E . B). On the love sea a forward winding (p > 0, k2 advancing) adds +4 per flavor to
//     face A and removes 4 from face B (the bulk carries them between, anomaly inflow); the fear sea, or the CP-conjugate
//     winding, the reverse.
//  6. THE NET. A history of n+ forward and n- backward windings leaves 4 F (n+ - n-) on face A, a function of the field's
//     history alone. The rule now holds CP violation (E-SPN-0164) and number violation (this index), but they do not
//     multiply: the CP phase enters the flavor rates, the index is CP-blind, and a CP-symmetric field history gives
//     exactly 0. A net asymmetry needs the windings themselves biased, which needs the light dynamical and pushed by the
//     members' CP-odd flavor densities (the charge-transport mechanism of electroweak baryogenesis): not built here.
//  7. THE FLAVORS. E-FRC-0259's units (2, 2), (-1, 4), (-4, 0) are light (M 0.287 to 0.474), and their Wilson walls keep a
//     field gap of only 0.18 to 0.24 at qa = 15 (wa-probe1), below E-SPN-0168's flow window of 0.35, where the flow's
//     Lanczos search does not complete (wa-probe2: (2, 2) incomplete, eigen residual 1.6e-2; (-1, 4) and (-4, 0) read
//     +1 / -1, incomplete, 0.24). By point 2 the flavor masses do not enter the count, so the gate uses three heavier exact
//     units whose fields keep the gap and whose searches complete: see FLAVORS. (ringUnit(1, 3), M 0.667, read +4 / -4 with
//     one incomplete step and is not used.)
//
// THE BARYON-TO-PHOTON RATIO (about 6e-10). What connects: the index gives the number change per winding, 4 per flavor per
// face, the analog of the Standard Model's 3 baryons per sphaleron (one per generation), and departure from equilibrium is
// present. What does not: no winding bias, no winding rate, no photon count, no expansion. NO NUMERICAL CLAIM is made, and
// none could be without a pre-registered null (E-MTH-0010).
//
// GATES (fixed before the gate run, after the probes):
//  C1 CONTROL. The heavy unit ringUnit(-2, 5), qa 15, p +1, half 0: the flow's per-step reading equals E-SPN-0168's
//     recorded one (its notes, offsets to 4 places and wall weights to 2) exactly, with A +4, B -4.
//  R1 THE CP-CONJUGATE WINDING. The same at p -1: A -4, B +4; every step's levels at the same offsets as p +1 (1e-12) with
//     the wall weights exchanged (w(-1) + w(+1) = 1 to 1e-9).
//  F1 THREE FLAVORS. Each of the FLAVORS units at qa 15, p +1: A +4, B -4, every step complete, eigen residual at most
//     1e-8. So the flavored face's flow is +12 per forward winding.
//  V1 THE VERTEX KEEPS NUMBER. E-SPN-0163's exchange count on 4 register modes and 2 flavors (256 Fock states): no nonzero
//     element between states of different member number.
//  G  A NET ASYMMETRY FROM A CP-SYMMETRIC HISTORY (predicted FALSE): the face-A flows of the heavy forward winding and its
//     CP conjugate sum to a nonzero number. (For the other flavors the conjugate is the same p -> -p map, point 4.)
//  Status: pass needs G; partial when C1, R1, F1, V1 hold and G is false (as derived); fail otherwise.
//
// PROBES, disclosed: tmp/wa-probe1.log (the field gaps: heavy 0.4899, (2, 2) 0.1821, (-1, 4) 0.2436; wall masses at L 12).
//  tmp/wa-probe2.log (the heavy flow at p -1: A -4, B +4, offsets as at p +1 with the walls exchanged; (2, 2) at p +1
//  incomplete, eigen residual 1.6e-2). tmp/wa-probe3.log (three heavier units: their gaps and flows).
//
// FIRST RUN (tmp/wa-exp-run1.log, 368 s): PARTIAL, as derived. C1 the heavy flow at p +1 reproduces E-SPN-0168's recorded
//  reading exactly, A +4 B -4. R1 at p -1 A -4 B +4, every level at the same offset (1.3e-15) with the wall weights
//  exchanged (8.2e-15). F1 (-2, 5), (6, 0), (0, 4): each A +4 B -4, eigen residuals 3.7e-14, 2.4e-13, 1.3e-14: the
//  flavored face +12 per forward winding. V1 the exchange count has 435 nonzero elements, 0 between different member
//  numbers. G FALSE (predicted): the forward winding and its CP conjugate net 0 on face A.
//
// DETERMINISM: no random numbers (fixed trigonometric Lanczos starts). EXACT: every unit a ring unit of Z[omega][1/42], the
// field's phases roots of unity of order 30; the vertex check in exact Z[omega] arithmetic; the spectra are floats, as
// measurement. NOTHING MOVES: a slot takes its neighbor's value; the mixers act on a dock's own register.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { DOCK_ROOTS, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { partnerProjector48, scaled, singletProjector24 } from '@/code/measure/spinor-register'
import { sectorBasis, volumeRight } from '@/code/measure/chiral-register'
import { halfPieces } from '@/code/measure/chiral-flow'
import { wilsonSchedule, type HalfSet, type Slab } from '@/code/measure/wilson-register'
import { wallFlow, type WallFlow } from '@/code/measure/wall-face'
import { exchangeCount } from '@/code/measure/register-many-body'
import { qwIsZero } from '@/code/measure/flavor-register'

const HEAVY: readonly [number, number] = [-2, 5]
// three exact flavor units whose Wilson walls keep the field gap above the flow window and whose flow search completes
// (wa-probe3): the heavy unit itself (M 0.7605), ringUnit(6, 0) (M 0.8601) and ringUnit(0, 4) (M 1.0472)
export const FLAVORS: readonly (readonly [number, number])[] = [
  [-2, 5],
  [6, 0],
  [0, 4],
]
// E-SPN-0168's recorded flow, qa 15, p 1, half 0 (its notes, tmp/wfc-exp-run1.log)
const RECORDED_0168 =
  '0.013: -0.0082/0.03 -0.0082/0.03 0.0082/0.97 0.0082/0.97; 0.406: -0.2371/0.00 -0.2371/0.00 0.2371/1.00 0.2371/1.00; 0.798: ; 1.191: ; 1.584: ; 1.976: ; 2.369: ; 2.762: -0.2223/1.00 -0.2223/1.00 0.2223/0.00 0.2223/0.00; 3.155: -0.0082/0.03 -0.0082/0.03 0.0082/0.97 0.0082/0.97; 3.547: -0.2371/0.00 -0.2371/0.00 0.2371/1.00 0.2371/1.00; 3.940: ; 4.333: ; 4.725: ; 5.118: ; 5.511: ; 5.903: -0.2223/1.00 -0.2223/1.00 0.2223/0.00 0.2223/0.00; 6.296: -0.0082/0.03 -0.0082/0.03 0.0082/0.97 0.0082/0.97'
const WINDOW = 0.35
const FL = 12

export type AsymmetryPlan = { loopSteps: number; lanczosSteps: number; qa: number; flavors: readonly (readonly [number, number])[] }

export const GATE_PLAN: AsymmetryPlan = { loopSteps: 16, lanczosSteps: 80, qa: 15, flavors: FLAVORS }

const flag = (b: boolean): number => (b ? 1 : 0)
const popcount = (x: number): number => {
  let c = 0

  for (let y = x; y; y &= y - 1) c++

  return c
}

export default experiment({
  id: 'spin/wall-asymmetry',
  code: 'E-SPN-0171',
  title:
    'the joint asymmetry per E . B winding on the chiral wall is an index and CP-blind: +4 members per flavor on face A per forward winding, +12 with three flavors, and the CP-conjugate winding the exact reverse, so a CP-symmetric field history nets exactly 0, partial: E-SPN-0168 flow reproduced exactly; with the flux reversed (the CP-conjugate winding, and the fear sea charge) every level reverses with the two walls exchanged; three flavor walls each flow +4; the register exchange that makes the CP phase physical never connects two member numbers, so CP moves flavor, not number; a net asymmetry needs the windings themselves biased, which needs the light dynamical and pushed by the members CP-odd densities, not built, and no number is claimed against the baryon-to-photon ratio',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return wallAsymmetryRun(GATE_PLAN)
  },
})

const stepLine = (f: WallFlow): string => f.steps.map(st => `${st.k2.toFixed(3)}: ${st.levels.map(l => `${l.offset.toFixed(4)}/${l.wallA.toFixed(2)}`).join(' ')}`).join('; ')

export function wallAsymmetryRun(plan: AsymmetryPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const basis = sectorBasis(volumeRight())
  const unitValue = (kj: readonly [number, number]): [number, number] => {
    const t = unitAngle(ringUnit(kj[0], kj[1]))

    return [Math.cos(t), Math.sin(t)]
  }
  const setsOf = (kj: readonly [number, number]): HalfSet[] => {
    const u = unitValue(kj)

    return [{ pieces: halfPieces(wilsonSchedule(qS, qD, u, { wilson: false }) as CMatrix[], basis, 0).pieces }, { pieces: halfPieces(wilsonSchedule(qS, qD, u, { wilson: true }) as CMatrix[], basis, 0).pieces }]
  }
  const slab = (p: number): Slab => ({ L: FL, qa: plan.qa, p, profile: Array.from({ length: FL }, (_, c) => (c < FL / 2 ? 1 : 0)) })
  const flowDepths = new Set(Array.from({ length: FL / 2 }, (_, i) => (FL / 4 + i) % FL))
  const flow = (kj: readonly [number, number], p: number): WallFlow => {
    const f = wallFlow(slab(p), setsOf(kj), 0.02, 0.05, 0.013, plan.loopSteps, DOCK_ROOTS, flowDepths, WINDOW, plan.lanczosSteps, WINDOW)

    log(`flow u ${kj.join(',')} p ${p}: A ${f.netA} B ${f.netB}`)

    return f
  }
  const sound = (f: WallFlow): boolean => f.steps.every(st => st.complete && st.eigenResidual <= 1e-8)

  // ---------------- C1: E-SPN-0168's recorded flow ----------------
  const plus = flow(HEAVY, 1)
  const plusLine = stepLine(plus)
  const C1 = plusLine === RECORDED_0168 && plus.netA === 4 && plus.netB === -4 && sound(plus)

  // ---------------- R1: the CP-conjugate winding ----------------
  const minus = flow(HEAVY, -1)
  const sortLevels = (ls: readonly { offset: number; wallA: number }[]): { offset: number; wallA: number }[] => [...ls].sort((a, b) => a.offset - b.offset || a.wallA - b.wallA)
  let offsetGap = 0
  let weightGap = 0
  let sameCounts = minus.steps.length === plus.steps.length

  minus.steps.forEach((st, t) => {
    const a = sortLevels(st.levels)
    // at p +1 the walls are exchanged, so the level order within a degenerate offset is by 1 - w
    const b = sortLevels((plus.steps[t] as { levels: { offset: number; wallA: number }[] }).levels.map(l => ({ offset: l.offset, wallA: 1 - l.wallA })))

    if (a.length !== b.length) {
      sameCounts = false

      return
    }
    a.forEach((x, i) => {
      offsetGap = Math.max(offsetGap, Math.abs(x.offset - (b[i] as { offset: number }).offset))
      weightGap = Math.max(weightGap, Math.abs(x.wallA - (b[i] as { wallA: number }).wallA))
    })
  })

  const R1 = minus.netA === -4 && minus.netB === 4 && sameCounts && offsetGap <= 1e-12 && weightGap <= 1e-9 && sound(minus)

  // ---------------- F1: three flavors ----------------
  // the heavy unit's flow is C1's (the same computation), not run twice
  const flavorFlows = plan.flavors.map(kj => ({ kj, M: wrap(unitAngle(ringUnit(kj[0], kj[1])) - Math.PI), f: kj[0] === HEAVY[0] && kj[1] === HEAVY[1] ? plus : flow(kj, 1) }))
  const F1 = flavorFlows.every(x => x.f.netA === 4 && x.f.netB === -4 && sound(x.f))
  const flavoredFaceA = flavorFlows.reduce((s, x) => s + x.f.netA, 0)

  // ---------------- V1: the vertex keeps member number ----------------
  const H = exchangeCount(4, 2)
  let crossNumber = 0
  let nonzero = 0

  H.forEach((row, i) =>
    row.forEach((x, j) => {
      if (qwIsZero(x)) return
      nonzero++
      if (popcount(i) !== popcount(j)) crossNumber++
    }),
  )

  const V1 = nonzero > 0 && crossNumber === 0

  log('V1')

  // ---------------- G: a net asymmetry from a CP-symmetric history ----------------
  // measured on the heavy pair (a forward winding and its CP conjugate); for the other flavors the conjugate is the same
  // map p -> -p, which exchanges the walls for any unit (point 4), so their pairs are not run again
  const netHeavy = plus.netA + minus.netA
  const G = netHeavy !== 0
  const hard = C1 && R1 && F1 && V1
  const status = !hard ? 'fail' : G ? 'pass' : 'partial'

  return verdict({
    status,
    claim: `C1 ${C1} (heavy qa ${plan.qa} p +1: A ${plus.netA} B ${plus.netB}, E-SPN-0168's recorded reading ${plusLine === RECORDED_0168 ? 'reproduced exactly' : 'NOT reproduced'}); R1 ${R1} (p -1: A ${minus.netA} B ${minus.netB}, offsets ${offsetGap.toExponential(1)}, wall weights exchanged to ${weightGap.toExponential(1)}); F1 ${F1} (${flavorFlows.map(x => `u (${x.kj.join(',')}) M ${x.M.toFixed(6)}: A ${x.f.netA} B ${x.f.netB}, eigen ${x.f.worstEigen.toExponential(1)}`).join('; ')}; flavored face A ${flavoredFaceA} per forward winding); V1 ${V1} (exchange count: ${nonzero} nonzero elements, ${crossNumber} between different member numbers); G ${G} (heavy forward + CP-conjugate winding on face A: ${netHeavy})`,
    metrics: {
      C1: flag(C1),
      R1: flag(R1),
      F1: flag(F1),
      V1: flag(V1),
      G: flag(G),
      heavyA: plus.netA,
      heavyConjugateA: minus.netA,
      flavoredFaceA,
      perFlavor: flavoredFaceA / plan.flavors.length,
      netCPSymmetric: netHeavy,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1) },
    notes: `L2. The member asymmetry per forward E . B winding on face A of the chiral wall (love sea): +4 per flavor (heavy unit, and each of ${plan.flavors.map(kj => `(${kj.join(',')})`).join(', ')}), so +${flavoredFaceA} with three flavors, CP-blind (an index; the flavor mixing removable at one body, the vertex number-conserving at two). The CP-conjugate winding gives the exact reverse, so a CP-symmetric history nets 0. p -1 steps: ${stepLine(minus)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
