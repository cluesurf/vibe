// INTEGRATION AND BINDING ACROSS LINES ON THE MANY-HOLE ENGINE (E-SLF-0179; moving-matter item 0022; rows OPEN-MND-03
// integration, OPEN-MND-01 binding, under OPEN-FND-03). RULE: R* with the spinor lift (decision 0006), E-SPN-0175's
// pieces: the member mixers at ringUnit(-1, 4), the sector string ringUnit(-2, 1) (cap 8) and the contact v^2 with
// v = ringUnit(2, 0), hole angles reversed. The free rule is the member mixers alone (no pair piece).
//
// THE ROWS AND WHETHER EACH OBSERVABLE IS DEFINED ON R* WITHOUT ROLES, stated before the run.
//  - E-SLF-0178 (the cut: take one part away and ask whether the rest's trail changes). Defined on R* without roles.
//    For identical fermions there is no "member 1" to cut out, so the cut is read as E-FND-0158's I read is, the rule
//    against the free rule: under the free rule a hole's momentum class is its own (every one-hole occupation n(k) is
//    conserved), so any change of n(k) is made by the other holes. INTEGRATION I(t) = sum_k |n_t(k) - n_0(k)| / 2n.
//  - E-SLF-0172 (the Fiedler value of a hand-built graph, a stand-in for IIT's integration). NOT an observable of any
//    rule: it is a graph with no dynamics (open.md OPEN-MND-03 says so), so there is nothing of it to run on R*. The row
//    asks to rerun it "on the adopted vacuum"; the only dynamic integration the selves line has is E-SLF-0178's cut,
//    which is what this file reads. That substitution is disclosed, not hidden.
//  - E-SLF-0177 (components of shared history: a node is a vibe trail numbered through the knit's open bit, an edge a
//    meeting). The trail of a NUMBERED hole is not defined on R*'s store: the holes are one kind of fermion held as
//    amplitudes, not trails, and numbering them would be a label the rule does not carry. What the read asks, whether a
//    meeting relates holes beyond what each carries alone, is role free: BINDING B(t) = sum over k1 != k2 of
//    |C_t - C_0| / n(n - 1), C = rho2 - n (x) n the connected pair density (code/measure/register-selves).
//  - E-QTM-0154 (a knot token's Sigma(648) frame classes, depolarized class-blindly by a meeting; only a line
//    environment of one class can single one out). Its observable lives on the knot's qutrit and its 648 frames. R*'s
//    member is an 8-state spinor register with no qutrit and no Sigma(648) frame: C* adds exactly those (the role qutrit
//    and flat Sigma(648) links, rule-choice.md). VERDICT 'needs C*': not read here, no role typed in, and a Decide item
//    for the lead is filed. Its kernel theorem (B), that a meeting alpha 1 + beta P swaps and never copies, does have an
//    R* form (the pair pieces are 1 + (e^(i theta) - 1) P on the singlet and partner projectors), and B above is that
//    meeting's footprint; it is not E-QTM-0154's class read.
//  "ACROSS LINES": on R* the line law is gone (E-FND-0157) and a band-level start puts every hole on every line, so
//  "across lines" reads as "between holes". E-FND-0158 read the line-started version for two holes.
//
// DERIVED BEFORE THE RUN. A one-body rule the same at every dock maps each sorted row to itself (register-sorted-holes),
// so every row's weight, hence n(k), rho2 and C, is conserved exactly by the free rule: I = B = 0 there, up to rounding.
// The pair pieces depend on the holes' separation, so they scatter: I > 0 and B > 0. THE CIRCULARITY, as E-FND-0158's
// audit states it: any separation-dependent piece scatters, and with the total momentum fixed any scattering correlates
// (two holes' classes fix the third's), so B > 0 follows from I > 0 kinematically. What is measured is the size, the
// free control, and whether the size holds from three holes to four. Depth L2 at most, on the 4d bulk torus, not the
// husk: no ledger row is held from it.
//
// ENGINE: E-FND-0163's sorted store on the native kernel, the tie projection of item 0021 (code/measure/register-tie-
// projection) applied every cycle. THREE HOLES ON L = 6 from E-FND-0165's starts A1 ('0,1,2', pick 300) and B1
// ('6,7,9', pick 200); FOUR HOLES ON L = 4 from E-FND-0163's start (the first four distinct classes after 0 summing to
// 0); read only, three holes on L = 4 from the same kind of start (the same torus as four). Each start runs 16 cycles
// under the rule and under the free rule, read at cycles 1, 2, 4, 8, 16. A hole count's read is the largest over its
// starts and reads.
//
// GATES, fixed 2026-10-08 before any run (the item's, verbatim in substance):
//  INTEGRATION PASS: at three holes (L 6) and four (L 4) the read is at least 100 times that count's free read, and the
//    four-hole read is not below the three-hole read. KILL: within 10 times the free read at every hole count. Partial
//    between.
//  BINDING (E-SLF-0177's read): PASS at least 100 times the free read at both counts; KILL within 10 times at every
//    count; partial between. E-QTM-0154's read is 'needs C*', so the binding ROW is at most partial whatever this gives.
//  CONTROL: the free rule's I and B at most 1e-12 at every count (E-FND-0158's 1.2e-13). A failure: partial at best.
//  INSTRUMENT: norm drift at most 1e-10, tie antisymmetry at most 1e-13 at the last cycle, sum n(k) = n and
//    sum rho2 = n(n - 1) within 1e-9. A failure: partial at best.
// Verdict: fail if both rows are killed; pass if both pass and the control and instrument hold; partial otherwise. As
// the binding row cannot pass on R* alone, this file's verdict is partial or fail; each row's verdict is in the claim.
//
// SMOKE BEFORE THE GATE RUN (tmp/selves-smoke.log, 2 cycles, every start): every path ran, no gate moved.
// FIRST RUN (2026-10-08, tmp/selves-gate.log, 627 s): PARTIAL. No gate moved and none was rerun.
//  - INTEGRATION partial: I 0.974 (A1), 0.904 (B1) at three holes on L 6, 0.881 at four on L 4, against free reads 7.1e-14
//    and 2.4e-14 (ratios above 1e13). It fails only the no-fall clause, 0.881 < 0.974. Three holes on L 4 (read only)
//    give 0.885, so on one torus three and four agree to 0.5 percent: the drop is the larger torus's room, with I a
//    fraction bounded by 1 and near saturation by cycle 8. Not a kill (far above 10 times the free read).
//  - BINDING: E-SLF-0177's read passes (B 1.13 at three holes, 0.60 at four, against 1.4e-13 and 4.9e-14); the row is
//    partial because E-QTM-0154's read needs C* (Decide item 0034 of moving-matter).
//  - CONTROL: the free rule's largest read 1.43e-13 (gate 1e-12). INSTRUMENT: drift at most 1.4e-13, ties 4.3e-19,
//    sums 6.9e-13.
//  - Read, gating nothing: B peaks at cycle 4 (1.13, 1.11) and settles near 0.7 to 0.9 at three holes, 0.55 at four;
//    the same-class pair weight (two holes in one class, different fibers) grows to 5.9e-3 (L 6) and 0.108 (four, L 4).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { torus } from '@/code/measure/register-sea'
import { bandLevels, holeFrame, type HoleFrame } from '@/code/measure/register-holes'
import { sortedCycle, sortedEngine, sortedNorm, sortedTies, type SortedEngine } from '@/code/measure/register-sorted-holes'
import { projectTies, tieProjector } from '@/code/measure/register-tie-projection'
import { couplingRule, ruleSetup } from '@/code/measure/three-member-motion'
import {
  bandSlater,
  binding,
  distinctClasses,
  integration,
  levelClasses,
  samePairs,
  selvesRead,
} from '@/code/measure/register-selves'

export type SelvesStart =
  | { name: string; L: number; n: 3; kind: 'level'; key: string; pick: number; gated: boolean }
  | { name: string; L: number; n: 3 | 4; kind: 'distinct'; from: number; gated: boolean }

export type SelvesPlan = {
  cycles: number
  reads: number[]
  starts: SelvesStart[]
  threads: number
}

export const GATE_PLAN: SelvesPlan = {
  cycles: 16,
  reads: [1, 2, 4, 8, 16],
  starts: [
    { name: 'A1', L: 6, n: 3, kind: 'level', key: '0,1,2', pick: 300, gated: true },
    { name: 'B1', L: 6, n: 3, kind: 'level', key: '6,7,9', pick: 200, gated: true },
    { name: 'D3', L: 4, n: 3, kind: 'distinct', from: 1, gated: false },
    { name: 'D4', L: 4, n: 4, kind: 'distinct', from: 1, gated: true },
  ],
  threads: 12,
}

const RATIO_PASS = 100
const RATIO_KILL = 10
const FREE_TOL = 1e-12
const NORM_TOL = 1e-10
const TIE_TOL = 1e-13
const SUM_TOL = 1e-9

export default experiment({
  id: 'selves/register-selves',
  code: 'E-SLF-0179',
  title:
    "integration and binding between holes on R*'s many-hole engine, partial: the pair pieces move 0.97 (three holes, L = 6) and 0.88 (four, L = 4) of the holes out of their start classes within 16 cycles, against 7.1e-14 and 2.4e-14 under the free rule, and build a connected pair correlation of 1.13 and 0.60 against 1.4e-13 and 4.9e-14; integration is partial only because four holes on L = 4 read below three on L = 6 (three on L = 4 read 0.885, so the drop is the torus, near saturation), and binding is partial because E-QTM-0154's frame-class read needs C*; 4d bulk torus, no ledger row held",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerSelvesRun(GATE_PLAN)
  },
})

type Reads = { I: number[]; B: number[]; same: number; drift: number; ties: number; sums: number }

type StartResult = { start: SelvesStart; rule: Reads; free: Reads }

function runOne(
  e: SortedEngine,
  fr: HoleFrame,
  js: number[],
  angle: ReturnType<typeof couplingRule>,
  plan: SelvesPlan,
  proj: ReturnType<typeof tieProjector>,
): Reads {
  const s = bandSlater(e, js)
  const n = e.n
  const N = fr.fourier.N
  const r0 = selvesRead(e, s)
  const out: Reads = { I: [], B: [], same: 0, drift: 0, ties: 0, sums: 0 }

  for (let c = 1; c <= plan.cycles; c++) {
    sortedCycle(e, angle, s)
    projectTies(e, proj, s)

    if (plan.reads.includes(c)) {
      const r = selvesRead(e, s)
      const occSum = r.occ.reduce((a, x) => a + x, 0)
      const pairSum = r.rho2.reduce((a, x) => a + x, 0)

      out.I.push(integration(n, r0, r))
      out.B.push(binding(n, r0, r))
      out.same = samePairs(r.rho2, N)
      out.drift = Math.max(out.drift, Math.abs(sortedNorm(e, s) - 1))
      out.sums = Math.max(out.sums, Math.abs(occSum - n), Math.abs(pairSum - n * (n - 1)))
    }
  }

  out.ties = sortedTies(e, s)

  return out
}

export function registerSelvesRun(plan: SelvesPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const { Ps } = ruleSetup()
  const results: StartResult[] = []

  // one engine at a time: four holes on L = 4 hold 6 GB a state, so the free run ends before the rule run starts
  for (const st of plan.starts) {
    const T = torus(st.L)
    const fr = holeFrame(T, Ps, 8)
    const e = sortedEngine(fr, st.n, 0, { backend: 'native', threads: plan.threads })
    const proj = tieProjector(e)
    const js =
      st.kind === 'level'
        ? (() => {
            const E = bandLevels(fr)
            const levels = [...new Set([...E].map(x => x.toFixed(6)))].sort()
            const lev = Int32Array.from(E, x => levels.indexOf(x.toFixed(6)))

            return levelClasses(fr, lev, st.key)[st.pick]!
          })()
        : distinctClasses(fr, st.n, st.from)

    log(`${st.name}: ${st.n} holes on L ${st.L}, ${e.rows} rows, classes ${js.join(',')}`)

    const free = runOne(e, fr, js, couplingRule(T, 'free'), plan, proj)

    log(`${st.name} free: I ${free.I.map(x => x.toExponential(2)).join(' ')} B ${free.B.map(x => x.toExponential(2)).join(' ')} drift ${free.drift.toExponential(2)} ties ${free.ties.toExponential(2)}`)

    const rule = runOne(e, fr, js, couplingRule(T, 'rule'), plan, proj)

    log(`${st.name} rule: I ${rule.I.map(x => x.toExponential(3)).join(' ')} B ${rule.B.map(x => x.toExponential(3)).join(' ')} drift ${rule.drift.toExponential(2)} ties ${rule.ties.toExponential(2)} same-class pairs ${rule.same.toExponential(2)} sums ${rule.sums.toExponential(2)}`)
    results.push({ start: st, rule, free })
  }

  const counts = [...new Set(plan.starts.filter(s => s.gated).map(s => `${s.n}@${s.L}`))]
  const top = (key: string, which: 'rule' | 'free', read: 'I' | 'B'): number =>
    Math.max(...results.filter(r => r.start.gated && `${r.start.n}@${r.start.L}` === key).flatMap(r => r[which][read]))
  const per = counts.map(key => ({
    key,
    I: top(key, 'rule', 'I'),
    Ifree: top(key, 'free', 'I'),
    B: top(key, 'rule', 'B'),
    Bfree: top(key, 'free', 'B'),
  }))
  const three = per.find(p => p.key.startsWith('3@'))
  const four = per.find(p => p.key.startsWith('4@'))
  const rowVerdict = (read: 'I' | 'B', noFall: boolean): 'pass' | 'partial' | 'kill' => {
    const ratios = per.map(p => p[read] / Math.max(p[`${read}free`], Number.MIN_VALUE))

    if (ratios.every(x => x <= RATIO_KILL)) return 'kill'
    if (ratios.every(x => x >= RATIO_PASS) && noFall) return 'pass'

    return 'partial'
  }
  const noFall = three !== undefined && four !== undefined && four.I >= three.I
  const integrationRow = rowVerdict('I', noFall)
  const bindingRead = rowVerdict('B', true)
  // E-QTM-0154's read needs C*: the binding row cannot pass on R* alone
  const bindingRow = bindingRead === 'kill' ? 'kill' : 'partial'
  const CF = results.every(r => Math.max(...r.free.I, ...r.free.B) <= FREE_TOL)
  const INST = results.every(
    r =>
      Math.max(r.rule.drift, r.free.drift) <= NORM_TOL &&
      Math.max(r.rule.ties, r.free.ties) <= TIE_TOL &&
      Math.max(r.rule.sums, r.free.sums) <= SUM_TOL,
  )
  // a pass needs both rows to pass, and the binding row cannot on R* alone (E-QTM-0154 needs C*)
  const status: Verdict['status'] = integrationRow === 'kill' && bindingRow === 'kill' ? 'fail' : 'partial'
  const metrics: Record<string, number> = {}

  for (const p of per) {
    metrics[`I_${p.key}`] = p.I
    metrics[`Ifree_${p.key}`] = p.Ifree
    metrics[`B_${p.key}`] = p.B
    metrics[`Bfree_${p.key}`] = p.Bfree
  }

  for (const r of results) {
    metrics[`I_${r.start.name}`] = Math.max(...r.rule.I)
    metrics[`B_${r.start.name}`] = Math.max(...r.rule.B)
    metrics[`drift_${r.start.name}`] = Math.max(r.rule.drift, r.free.drift)
    metrics[`ties_${r.start.name}`] = Math.max(r.rule.ties, r.free.ties)
  }

  const show = (p: (typeof per)[number]): string =>
    `${p.key.replace('@', ' holes on L ')}: I ${p.I.toExponential(3)} against free ${p.Ifree.toExponential(2)}, B ${p.B.toExponential(3)} against free ${p.Bfree.toExponential(2)}`
  const series = (r: StartResult): string =>
    `${r.start.name} (${r.start.n} holes, L ${r.start.L}${r.start.gated ? '' : ', read only'}) I ${r.rule.I.map(x => x.toExponential(2)).join(' ')}, B ${r.rule.B.map(x => x.toExponential(2)).join(' ')}, same-class pair weight ${r.rule.same.toExponential(2)}`

  return verdict({
    status,
    claim: `INTEGRATION (OPEN-MND-03, E-SLF-0178's cut on R*) ${integrationRow} (${per.map(show).join('; ')}; four not below three ${noFall}); BINDING (OPEN-MND-01) ${bindingRow}: E-SLF-0177's read ${bindingRead}, E-QTM-0154's read needs C* (its frame classes live on a qutrit R* lacks); control CF ${CF}; instrument ${INST}`,
    metrics,
    control: { CF: CF ? 1 : 0, instrument: INST ? 1 : 0 },
    notes: `L2 on the 4d bulk torus, not the husk; no ledger row is held. Reads at cycles ${plan.reads.join(', ')}: ${results.map(series).join('; ')}. E-SLF-0172's Fiedler value is a graph read with no dynamics and was not rerun; the cut stands for it. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
