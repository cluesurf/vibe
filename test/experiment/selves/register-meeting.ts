// A MEETING'S EFFECT ON THE MEMBER SPIN ON R* (E-SLF-0180; moving-matter item 0036; row OPEN-MND-01, binding, the R*
// form of E-QTM-0154 per decision 004). RULE: R* with the spinor lift (decision 0006), E-SPN-0175's pieces as in
// E-SLF-0179: member mixers at ringUnit(-1, 4), the sector string ringUnit(-2, 1) (cap 8), the contact v^2 with
// v = ringUnit(2, 0). The free rule is the member mixers alone.
//
// WHAT E-QTM-0154 SAYS AND ITS R* FORM. E-QTM-0154: a meeting moves a member's internal state onto its partner (the
// "one" becomes shared), and at one rate for every basis because the frame group is a unitary 2-design (no meeting
// premeasures). Its own observable, the role qutrit's Sigma(648) frame classes, is C*-deferred (decision 004) and not
// read here. On R* the internal state is the hole's spin under the lift L(s) (code/measure/register-meeting): the
// member doublet D, a hole's spin Sigma_n on its fiber, the frame potential F2 of the lifted rotations fixing both
// holes' classes.
//
// STAGE 0. Over every unordered pair of distinct momentum classes (k_A, k_B) of the torus, the rotations of W(F4) that
// are symmetries of the torus and fix both classes form G; F2 = mean over G of |Tr_D g|^4. The pair read is the first
// in index order of the stabilizer with F2 = 2 to 1e-12 and the largest G whose classes both hold a D-copy in the up
// band; with no F2 = 2 pair, the largest G (the basis-blind half then open).
// STAGE 1. Hole A at k_A in the up band's first D-copy, polarized along a; hole B at k_B in its first up-band copy at +a
// and at -a, the two runs averaged (B spin-mixed); a in x, y, z and the (1, 1, 1) diagonal. A Slater start, 16 cycles,
// read at 1, 2, 4, 8, 16. P_A = tr(rho_kA Sigma_a) / tr(rho_kA), rho_kA the one-body density at k_A (the weight still in
// k_A's class), P_B likewise at k_B. Transfer tau_a = the largest |P_B| over reads; retention lambda_a = P_A at 16.
//
// DERIVED BEFORE THE RUN. The free rule keeps every hole's class and acts on a class's fiber as U(q), which commutes
// with G, so on a D-copy it is 1 (x) (something on the multiplicity): P_A = 1 and P_B = 0 exactly. The rule is
// G-covariant (G fixes both classes, permutes the torus's sites keeping V, and commutes with every one-body beat and
// the sector projector, all read below as the instrument); B's mixed start is G-invariant, so the maps from A's Bloch
// vector to P_A and P_B commute with G's rotation of R^3. When F2 = 2 that action is irreducible, so by Schur's lemma
// lambda and tau are one number for every axis. Not expected: the qutrit's 1/4 (like) and 2/3 (love-fear), which
// belong to Sigma(648). THE CIRCULARITY: axis equality is the symmetry, not a finding; the finding is whether tau is
// nonzero at all (a meeting shares internal state) and its size against the free control. The holes are identical
// fermions, so the weight at k_B after a meeting is not labelled by which hole brought it: tau counts both B's own spin
// turned toward A's axis and A's polarized weight scattered into k_B. The read cannot separate the two, as no read of
// identical holes can; what it shows is that the class k_B carries A's axis after a meeting and never without one.
//
// GATES, fixed 2026-10-08 before any run (the item's):
//  PASS: tau_a >= 1e-3 and >= 100 times the free control's for every axis, and lambda_a equal over the four axes to
//    1e-9 when F2 = 2. With no F2 = 2 pair the basis-blind half is open and the verdict is partial at best.
//  KILL: tau within 10 times the free control at every read (a meeting shares no internal state).
//  Between: partial.
//  INSTRUMENT DEFECT (escalate, never a verdict): lambda_a unequal over the axes beyond 1e-6 with F2 = 2 (R* is
//    covariant under the lift to 4.4e-16, E-SPN-0191). Status 'open' with the defect named.
//  CONTROL: the free rule keeps P_A = 1 and P_B = 0 to 1e-12 at every read. A failure: partial at best.
//  INSTRUMENT: the covariance reads (rho rho^dag = 1, [rho, U], [rho, P_sector] in both frames, A1 rho = rho2 A1, the
//    D-copies' intertwining) at most 1e-9, V kept exactly by every kept rotation, norm drift at most 1e-10. A failure:
//    partial at best.
// Depth L2 at most, on the 4d bulk torus, not the husk: no ledger row is held from it.
//
// SMOKE BEFORE THE GATE RUN (tmp/meeting-smoke.log, 2 cycles): every path ran, no gate moved.
// FIRST RUN (2026-10-08, tmp/meeting-gate.log, 35 s): PASS. No gate moved and none was rerun.
//  - STAGE 0: 192 of W(F4)'s 576 rotations are torus symmetries (the half-integer ones do not keep L Z^4), V kept
//    exactly. F2 = 2 at stabilizers of order 48, 24 and 12. The four order-48 pairs (class 0 with a class of three
//    halves) hold no D-copy in the up band; the first order-24 pair, k_A = 0, k_B = (0, 0, 0, 1), holds two at each.
//  - STAGE 1: P_A 0.9943, 0.9757, 0.9219, 0.7318, 0.1852 and P_B 6.5e-3, 0.0240, 0.0750, 0.254, 0.707 at cycles 1, 2, 4,
//    8, 16, the same on all four axes (lambda spread 2.8e-15). Free: |P_A - 1| at most 4.4e-16, |P_B| at most 1.3e-14.
//  - INSTRUMENT: covariance 6.0e-15, rotor 7.8e-16, drift 5.9e-14.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { torus } from '@/code/measure/register-sea'
import {
  copyHoles,
  holeCycle,
  holeEngine,
  holeFrame,
  holeNorm,
  slaterStart,
  type HoleEngine,
  type HoleRule,
  type Holes,
} from '@/code/measure/register-holes'
import { couplingRule, ruleSetup } from '@/code/measure/three-member-motion'
import {
  AXES,
  averageDensity,
  classDensity,
  classSpin,
  f2Table,
  polarization,
  polarizedVector,
  spinOnFiber,
  stabilizer,
  torusRotations,
  type ClassSpin,
  type CM,
} from '@/code/measure/register-meeting'

export type MeetingPlan = {
  L: number
  cycles: number
  reads: number[]
}

export const GATE_PLAN: MeetingPlan = { L: 6, cycles: 16, reads: [1, 2, 4, 8, 16] }

const F2_TOL = 1e-12
const TAU_FLOOR = 1e-3
const RATIO_PASS = 100
const RATIO_KILL = 10
const EQUAL_PASS = 1e-9
const EQUAL_DEFECT = 1e-6
const FREE_TOL = 1e-12
const COV_TOL = 1e-9
const NORM_TOL = 1e-10

export default experiment({
  id: 'selves/register-meeting',
  code: 'E-SLF-0180',
  title:
    "a meeting of two holes on R* shares one hole's L(s) spin at one rate for every axis, pass: on the L = 6 torus with A at class 0 and B at (0, 0, 0, 1), whose 24 fixing rotations are a unitary 2-design on the member doublet (F2 = 2), B's class picks up A's polarization 0.707 by cycle 16 (free rule 1.3e-14) while A keeps 0.185, the same to 3e-15 along x, y, z and the diagonal; the Sigma(648) numbers 1/4 and 2/3 belong to the C*-deferred qutrit and are not expected; 4d bulk torus, no ledger row held",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerMeetingRun(GATE_PLAN)
  },
})

// one entry per (|G|, F2): the number of stabilizers and of pairs
function grouped(table: readonly { order: number; F2: number; pairs: number }[]): string {
  const m = new Map<string, { s: number; p: number }>()

  for (const r of table) {
    const key = `${r.order}: ${r.F2.toFixed(9)}`
    const g = m.get(key) ?? { s: 0, p: 0 }

    g.s++
    g.p += r.pairs
    m.set(key, g)
  }

  return [...m].map(([k, g]) => `${k}, ${g.s}, ${g.p}`).join('; ')
}

type AxisReads ={ PA: number[]; PB: number[]; drift: number }

function runAxis(
  e: HoleEngine,
  rule: HoleRule,
  plan: MeetingPlan,
  kA: number,
  kB: number,
  TA: CM,
  TB: CM,
  n: readonly number[],
  sA: CM,
  sB: CM,
): AxisReads {
  const starts: Holes[] = ([1, -1] as const).map(sg =>
    slaterStart(e, [kA, kB], [polarizedVector(TA, n, 1), polarizedVector(TB, n, sg)]),
  )
  const out: AxisReads = { PA: [], PB: [], drift: 0 }
  const states = starts.map(copyHoles)

  for (let c = 1; c <= plan.cycles; c++) {
    for (const s of states) {
      holeCycle(e, rule, s)
    }

    if (plan.reads.includes(c)) {
      const rA = averageDensity(classDensity(e, states[0]!, kA), classDensity(e, states[1]!, kA))
      const rB = averageDensity(classDensity(e, states[0]!, kB), classDensity(e, states[1]!, kB))

      out.PA.push(polarization(rA, sA).P)
      out.PB.push(polarization(rB, sB).P)

      for (const s of states) {
        out.drift = Math.max(out.drift, Math.abs(holeNorm(s) - 1))
      }
    }
  }

  return out
}

export function registerMeetingRun(plan: MeetingPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const t = torus(plan.L)
  const { Ps } = ruleSetup()
  const fr = holeFrame(t, Ps, 8)
  const F = fr.fourier
  const N = F.N

  log(`frame L ${plan.L}: ${N} classes, unitary ${fr.checks.unitary.toExponential(2)}`)

  const set = torusRotations(t, F)
  const table = f2Table(set, N)

  log(`stage 0: ${set.kept} torus rotations (${set.dropped} dropped), ${table.length} stabilizers; F2 ${grouped(table)}`)

  const designs = table.filter(r => Math.abs(r.F2 - 2) <= F2_TOL)
  const order = designs.length > 0 ? designs : [...table].sort((x, y) => y.order - x.order)

  let chosen: { row: (typeof table)[number]; A: ClassSpin; B: ClassSpin } | null = null
  const tried: string[] = []

  for (const row of order) {
    const [kA, kB] = row.first
    const G = stabilizer(set, [kA, kB])
    const A = classSpin(fr, G, kA)
    const B = classSpin(fr, G, kB)

    tried.push(`${F.ints[kA]!.join(' ')} / ${F.ints[kB]!.join(' ')} |G| ${G.length} F2 ${row.F2.toFixed(6)} up copies ${A.upCopies.length}, ${B.upCopies.length}`)

    if (A.upCopies.length > 0 && B.upCopies.length > 0) {
      chosen = { row, A, B }
      break
    }
  }

  log(`tried ${tried.join('; ')}`)

  if (!chosen) {
    return verdict({
      status: 'open',
      claim: 'no pair of classes holds a D-copy in the up band at both classes: the spin read is undefined on this torus',
      metrics: { stabilizers: table.length },
      notes: tried.join('; '),
    })
  }

  const { row, A, B } = chosen
  const [kA, kB] = row.first
  const twoDesign = Math.abs(row.F2 - 2) <= F2_TOL
  const total = F.sum[kA * N + kB]!
  const e = holeEngine(fr, 2, total)
  const per = AXES.map(ax => {
    const sA = spinOnFiber(A.fiberCopies, ax.n)
    const sB = spinOnFiber(B.fiberCopies, ax.n)
    const free = runAxis(e, couplingRule(t, 'free'), plan, kA, kB, A.upCopies[0]!, B.upCopies[0]!, ax.n, sA, sB)
    const rule = runAxis(e, couplingRule(t, 'rule'), plan, kA, kB, A.upCopies[0]!, B.upCopies[0]!, ax.n, sA, sB)

    log(`axis ${ax.name}: rule P_A ${rule.PA.map(x => x.toFixed(9)).join(' ')} P_B ${rule.PB.map(x => x.toExponential(3)).join(' ')}; free P_A-1 ${free.PA.map(x => (x - 1).toExponential(1)).join(' ')} P_B ${free.PB.map(x => x.toExponential(1)).join(' ')}`)

    return {
      name: ax.name,
      free,
      rule,
      tau: Math.max(...rule.PB.map(Math.abs)),
      tauFree: Math.max(...free.PB.map(Math.abs)),
      lambda: rule.PA[rule.PA.length - 1]!,
    }
  })

  const lambdas = per.map(p => p.lambda)
  const spread = Math.max(...lambdas) - Math.min(...lambdas)
  const CF = per.every(p => p.free.PA.every(x => Math.abs(x - 1) <= FREE_TOL) && p.free.PB.every(x => Math.abs(x) <= FREE_TOL))
  const covariance = Math.max(A.unitary, A.cycle, A.sector, A.transfer, A.copies, B.unitary, B.cycle, B.sector, B.transfer, B.copies)
  const drift = Math.max(...per.map(p => Math.max(p.rule.drift, p.free.drift)))
  const INST = covariance <= COV_TOL && set.vGap === 0 && set.rotorGap <= COV_TOL && drift <= NORM_TOL
  const kill = per.every(p => p.rule.PB.every((x, i) => Math.abs(x) <= RATIO_KILL * Math.max(Math.abs(p.free.PB[i]!), Number.MIN_VALUE)))
  const transferPass = per.every(p => p.tau >= TAU_FLOOR && p.tau >= RATIO_PASS * p.tauFree)
  const defect = twoDesign && spread > EQUAL_DEFECT
  const equal = spread <= EQUAL_PASS

  let status: Verdict['status']

  if (defect) {
    status = 'open'
  } else if (kill) {
    status = 'fail'
  } else if (transferPass && twoDesign && equal && CF && INST) {
    status = 'pass'
  } else {
    status = 'partial'
  }

  const metrics: Record<string, number> = {
    L: plan.L,
    order: row.order,
    F2: row.F2,
    lambdaSpread: spread,
    covariance,
    vGap: set.vGap,
    rotorGap: set.rotorGap,
    drift,
    upCopiesA: A.upCopies.length,
    upCopiesB: B.upCopies.length,
    fiberCopiesA: A.fiberCopies.length,
    fiberCopiesB: B.fiberCopies.length,
  }

  for (const p of per) {
    metrics[`tau_${p.name}`] = p.tau
    metrics[`tauFree_${p.name}`] = p.tauFree
    metrics[`lambda_${p.name}`] = p.lambda
  }

  const pair = `k_A ${F.ints[kA]!.join(' ')}, k_B ${F.ints[kB]!.join(' ')} (|G| ${row.order}, F2 ${row.F2.toFixed(12)})`

  return verdict({
    status,
    claim: `${defect ? 'INSTRUMENT DEFECT (lambda unequal over axes with F2 = 2, escalate): ' : ''}on L ${plan.L}, ${pair}: transfer tau ${per.map(p => `${p.name} ${p.tau.toExponential(3)}`).join(', ')} against free ${Math.max(...per.map(p => p.tauFree)).toExponential(2)}; retention lambda ${per.map(p => `${p.name} ${p.lambda.toFixed(12)}`).join(', ')} (spread ${spread.toExponential(2)}); basis-blind ${twoDesign ? 'F2 = 2' : 'open (no F2 = 2 pair)'}; control CF ${CF}; instrument ${INST}; E-QTM-0154 proper (role qutrit, Sigma(648)) is C*-deferred`,
    metrics,
    control: { CF: CF ? 1 : 0, instrument: INST ? 1 : 0 },
    notes: `L2 on the 4d bulk torus, not the husk. F2 table (|G|: F2, stabilizers, pairs): ${grouped(table)}. Pairs tried: ${tried.join('; ')}. Reads at cycles ${plan.reads.join(', ')}: ${per.map(p => `${p.name} P_A ${p.rule.PA.map(x => x.toFixed(9)).join(' ')}, P_B ${p.rule.PB.map(x => x.toExponential(3)).join(' ')}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
