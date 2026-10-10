// DOES R*'S OWN COLOUR LEAVE A CHIRAL WALL MEMBER THAT FINITE SIZE PUSHED OUT OF THE WINDOW, OR NONE? (E-FRC-0295,
// note/project/vibe/roadmap/moving-matter item 0053, decision 011 point 3.) RULE: R*, half +, the chiral slab of E-FRC-0294
// with the rule's frozen colour (E-SPN-0132's Weyl-hash links lifted to Sigma(648) by a Z3 centre section). E-FRC-0294
// found no level within 0.1 of pi on that slab. That leaves one reading: the wall members survive and the side-8 box only
// moved them. An index decides it, and no box size or disorder can fake an index.
//
// THE PROBE (code/measure/color-pump). Every link times one colour-singlet U(1) phase: a uniform field with exactly one
// flux quantum through the transverse (0, 1) torus (every triangle's holonomy B times its projected area, the torus closing,
// checked to 1e-12), and a twist e^(i theta) on the links that wrap the x2 period, theta = 2 pi j / 16, j = 0 .. 16 (j 16
// must reproduce j 0 to 1e-10). Per (section first and weyl) x (L 8 and 12) x theta: every level within 0.2 of pi
// (complete search), each with its weight on the six-class wall-A and wall-B windows of E-FRC-0294 and on wall A's half
// (the label). Levels are paired across steps and the signed crossings of pi counted per wall (wall-stream wallFlowOn's
// pairing). A level in the window with wall weight under 0.9 is a bulk level.
// CONTROLS, any misread makes the verdict OPEN:
//  CF identity links, same probe, L 8 and 12: A = F0, B = -F0, F0 nonzero and equal at both L (predicted 12, three
//     components times E-SPN-0168's 4 per flux quantum; another nonzero F0 is logged, never a failure, and the gates use
//     the read F0). Read on one component (k 1) and multiplied by 3: identity links times a scalar phase are three exact
//     copies; the k 3 read at j 0, L 8 witnesses it (three times the levels, the same offsets).
//  CN the coloured slab with no flux (twist only), section first, L 8: A 0, B 0.
//  CG a site-wise Sigma(648) gauge transform of the coloured links (an integer Weyl stream), L 8, section first: the
//     counts unchanged.
// VERDICT, fixed 2026-10-08 before any read:
//  KILL (fail)    A 0 and B 0 under both sections at L 8 and 12, no bulk level in the window at any theta, every search
//                 complete: R*'s colour leaves no chiral wall member (decision 011 confirmed).
//  PASS           A = F0 and B = -F0 under both sections at both L: E-FRC-0294's empty window was finite size.
//  PARTIAL        a nonzero count other than F0, or sections or L disagree.
//  OPEN           a bulk level in the window at some theta, an incomplete search, or a control fails.
// DIAGNOSTIC, never gated: links g_t = exp(t log g) (principal log, eigenphase pi as +pi), t 0, 0.25, 0.5, 0.75, 1,
//  section first, no probe: the levels within 0.1 of pi with wall weight at least 0.9 on the L 8 slab, and the nearest
//  level of the side-8 bulk box (Wilson set).
//
// DETERMINISM: no random numbers. Depth L2: a lattice-fermion spectral flow on the rule's own frozen colour.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { gridLifts, roleLinks, type GridLifts, type RoleLinks } from '@/code/measure/holonomy-caging'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { wallADepths } from '@/code/measure/wall-stream'
import {
  bulkBox,
  colorLevelsNearPi,
  colorOp,
  colorPieces,
  gaugeLinks,
  identityLinks,
  linkGaps,
  linksOf,
  reductionGaps,
  slabBox,
  slabWeave,
  wallWindows,
  weylGauge,
  type ClusterOptions,
  type ColorBox,
  type ColorLinks,
  type ColorPieces,
} from '@/code/measure/color-slab'
import {
  phaseWitness,
  principalLinks,
  probeLinks,
  pumpFlow,
  pumpPhases,
  pumpRead,
  type PhaseWitness,
  type PumpFlow,
  type PumpLevel,
  type PumpStepRead,
} from '@/code/measure/color-pump'

export type Section = 'first' | 'weyl'

export type ColorPumpPlan = {
  side: number
  Ls: number[]
  sections: Section[]
  quanta: number
  loopSteps: number
  window: number
  wallShare: number
  krylov: number
  cluster: Omit<ClusterOptions, 'window'>
  predictedF0: number
  cfK: number
  colors: number
  controlL: number
  gaugeOffset: number
  diagTs: number[]
  diagWindow: number
  diagBulkWindow: number
}

export const COLOR_PUMP_PLAN: ColorPumpPlan = {
  side: 8,
  Ls: [8, 12],
  sections: ['first', 'weyl'],
  quanta: 1,
  loopSteps: 16,
  window: 0.2,
  wallShare: 0.9,
  krylov: 160,
  cluster: { block: 64, degree: 40, cut: 0.4, maxPasses: 8, tol: 1e-11 },
  predictedF0: 12,
  cfK: 1,
  colors: 3,
  controlL: 8,
  gaugeOffset: 1,
  diagTs: [0, 0.25, 0.5, 0.75, 1],
  diagWindow: 0.1,
  diagBulkWindow: 0.2,
}

const TOL = {
  phase: 1e-12,
  link: 1e-12,
  reduction: 1e-12,
  piece: 1e-13,
  eigen: 1e-9,
  closure: 1e-10,
}

// ---- shared pieces ----

type Shared = { pieces: ColorPieces; profile: (L: number) => number[]; lifts: GridLifts }

let shared: Shared | undefined

function sharedOf(): Shared {
  if (!shared) {
    const cs = chiralSlab(8)

    shared = {
      pieces: colorPieces(cs.sets[0]!, cs.ranges[0]!.sR, cs.ranges[0]!.dR),
      profile: L => [...chiralSlab(L).slab.profile],
      lifts: gridLifts(),
    }
  }

  return shared
}

function ruleRole(box: ColorBox, section: Section, bulk: boolean, side: number): RoleLinks {
  const { lifts } = sharedOf()

  if (bulk) {
    const weave = makeColorWeave({ side, table: 'bind' })

    return roleLinks(weave, weave.links, lifts, section)
  }

  const w = slabWeave(box)

  return roleLinks(w as unknown as ColorWeave, w.links, lifts, section)
}

type Witness = {
  pieceGap: number
  reverse: number
  unitary: number
  cycle: number
  cycleDag: number
  metric: number
  phase?: PhaseWitness
}

// ---- one step of a loop ----

export type FieldSpec =
  | { field: 'rule'; section: Section; gauge: boolean }
  | { field: 'identity'; k: number }

export type PumpStage = {
  kind: 'pump'
  name: string
  loop: string
  L: number
  j: number
  quanta: number
  k: number
  read: PumpStepRead
  seconds: number
  witness: Witness
}

export const thetaOf = (plan: ColorPumpPlan, j: number): number => (2 * Math.PI * j) / plan.loopSteps

export function pumpStage(
  plan: ColorPumpPlan,
  name: string,
  loop: string,
  L: number,
  j: number,
  quanta: number,
  f: FieldSpec,
): PumpStage {
  const t0 = Date.now()
  const { pieces, profile, lifts } = sharedOf()
  const box = slabBox(plan.side, L)
  let base: ColorLinks

  if (f.field === 'rule') {
    base = linksOf(box, ruleRole(box, f.section, false, plan.side))

    if (f.gauge) {
      base = gaugeLinks(box, base, weylGauge(lifts.floats, plan.gaugeOffset))
    }
  } else {
    base = identityLinks(box, f.k)
  }

  const field = { side: plan.side, quanta, theta: thetaOf(plan, j) }
  const phases = pumpPhases(box, field)
  const links = probeLinks(base, phases)
  const op = colorOp(box, links, pieces, profile(L))
  const red = reductionGaps(op)
  const lg = linkGaps(box, links)
  const read = pumpRead(op, {
    window: plan.window,
    krylov: plan.krylov,
    cluster: plan.cluster,
    expectEmpty: f.field === 'rule',
    windows: wallWindows(L),
    halfA: wallADepths(L),
    eigenTol: TOL.eigen,
  })

  return {
    kind: 'pump',
    name,
    loop,
    L,
    j,
    quanta,
    k: links.k,
    read,
    seconds: (Date.now() - t0) / 1000,
    witness: { pieceGap: pieces.pieceGap, ...lg, ...red, phase: phaseWitness(box, field, phases) },
  }
}

// ---- the diagnostic ----

export type DiagStage = {
  kind: 'diag'
  name: string
  t: number
  where: 'slab' | 'bulk'
  power1: number
  levels: PumpLevel[]
  // slab: window levels with wall weight at least 0.9; bulk: the nearest level (top Ritz value)
  wallLevels: number
  nearest: number
  nearestResidual: number
  complete: boolean
  seconds: number
  witness: Witness
}

export function diagStage(plan: ColorPumpPlan, t: number, where: 'slab' | 'bulk'): DiagStage {
  const t0 = Date.now()
  const { pieces, profile } = sharedOf()
  const L = plan.controlL
  const box = where === 'slab' ? slabBox(plan.side, L) : bulkBox(plan.side)
  const role = ruleRole(box, 'first', where === 'bulk', plan.side)
  const { links, power1 } = principalLinks(box, role, t)
  const op = colorOp(box, links, pieces, where === 'slab' ? profile(L) : [1])
  const red = reductionGaps(op)
  const lg = linkGaps(box, links)
  const witness = { pieceGap: pieces.pieceGap, ...lg, ...red }

  if (where === 'bulk') {
    const r = colorLevelsNearPi(op, plan.diagBulkWindow, plan.krylov)

    return {
      kind: 'diag',
      name: `diag-bulk-${t}`,
      t,
      where,
      power1,
      levels: r.levels.map(l => ({ offset: l.offset, windowA: 0, windowB: 0, wall: 0, half: 0 })),
      wallLevels: 0,
      nearest: r.levels.length > 0 ? Math.min(...r.levels.map(l => Math.abs(l.offset))) : r.nearest,
      nearestResidual: r.nearestResidual,
      complete: r.complete,
      seconds: (Date.now() - t0) / 1000,
      witness,
    }
  }

  const read = pumpRead(op, {
    window: plan.diagWindow,
    krylov: plan.krylov,
    cluster: plan.cluster,
    expectEmpty: t === 1,
    windows: wallWindows(L),
    halfA: wallADepths(L),
    eigenTol: TOL.eigen,
  })

  return {
    kind: 'diag',
    name: `diag-slab-${t}`,
    t,
    where,
    power1,
    levels: read.levels,
    wallLevels: read.levels.filter(l => l.wall >= plan.wallShare).length,
    nearest: read.krylov?.nearest ?? (read.block ? read.block.guard : Number.NaN),
    nearestResidual: read.krylov?.nearestResidual ?? Number.NaN,
    complete: read.complete,
    seconds: (Date.now() - t0) / 1000,
    witness,
  }
}

// ---- the stages ----

export type Stage = PumpStage | DiagStage
export type StageSpec = { name: string; run: () => Stage }

const steps = (plan: ColorPumpPlan): number[] => Array.from({ length: plan.loopSteps + 1 }, (_, j) => j)

export function mainSpecs(plan: ColorPumpPlan): StageSpec[] {
  return plan.sections.flatMap(section =>
    plan.Ls.flatMap(L =>
      steps(plan).map(j => {
        const name = `main-${section}-${L}-${j}`

        return {
          name,
          run: () => pumpStage(plan, name, `main ${section} L ${L}`, L, j, plan.quanta, { field: 'rule', section, gauge: false }),
        }
      }),
    ),
  )
}

export function controlSpecs(plan: ColorPumpPlan): StageSpec[] {
  const out: StageSpec[] = []

  for (const L of plan.Ls) {
    for (const j of steps(plan)) {
      const name = `cf-${L}-${j}`

      out.push({ name, run: () => pumpStage(plan, name, `cf L ${L}`, L, j, plan.quanta, { field: 'identity', k: plan.cfK }) })
    }
  }

  out.push({
    name: 'cf3-8-0',
    run: () => pumpStage(plan, 'cf3-8-0', 'cf3', plan.controlL, 0, plan.quanta, { field: 'identity', k: plan.colors }),
  })

  for (const j of steps(plan)) {
    const cn = `cn-${j}`
    const cg = `cg-${j}`

    out.push({
      name: cn,
      run: () => pumpStage(plan, cn, 'cn', plan.controlL, j, 0, { field: 'rule', section: 'first', gauge: false }),
    })
    out.push({
      name: cg,
      run: () => pumpStage(plan, cg, 'cg', plan.controlL, j, plan.quanta, { field: 'rule', section: 'first', gauge: true }),
    })
  }

  return out
}

export function diagSpecs(plan: ColorPumpPlan): StageSpec[] {
  return plan.diagTs.flatMap(t =>
    (['slab', 'bulk'] as const).map(where => ({ name: `diag-${where}-${t}`, run: () => diagStage(plan, t, where) })),
  )
}

// ---- the verdict ----

const flag = (b: boolean): number => (b ? 1 : 0)

export type LoopRead = { loop: string; L: number; steps: number; levels: number; flow: PumpFlow }

export function loopRead(plan: ColorPumpPlan, stages: readonly Stage[], loop: string): LoopRead | undefined {
  const mine = stages
    .filter((s): s is PumpStage => s.kind === 'pump' && s.loop === loop)
    .sort((a, b) => a.j - b.j)

  if (mine.length !== plan.loopSteps + 1 || mine.some((s, i) => s.j !== i)) {
    return undefined
  }

  return {
    loop,
    L: mine[0]!.L,
    steps: mine.length,
    levels: mine.reduce((n, s) => n + s.read.levels.length, 0),
    flow: pumpFlow(
      mine.map(s => ({ ...s.read, raw: s.read.raw ?? [] })),
      plan.window,
      plan.wallShare,
    ),
  }
}

const witnessOk = (w: Witness): boolean =>
  w.pieceGap <= TOL.piece &&
  w.reverse <= TOL.link &&
  w.unitary <= TOL.link &&
  w.cycle <= TOL.reduction &&
  w.cycleDag <= TOL.reduction &&
  w.metric <= TOL.reduction &&
  (w.phase === undefined ||
    (w.phase.coordsExact &&
      w.phase.triangle <= TOL.phase &&
      w.phase.reverse <= TOL.phase &&
      w.phase.t2Loop <= TOL.phase))

export function colorPumpVerdict(plan: ColorPumpPlan, stages: readonly Stage[]): Verdict {
  const pumps = stages.filter((s): s is PumpStage => s.kind === 'pump')
  const diags = stages.filter((s): s is DiagStage => s.kind === 'diag')
  const I = stages.every(s => witnessOk(s.witness))
  const quantaOk = pumps.every(s => s.witness.phase === undefined || Math.abs(s.witness.phase.quantaRead - s.quanta) <= 1e-9)

  // CF
  const cf = plan.Ls.map(L => loopRead(plan, stages, `cf L ${L}`))
  const scale = plan.colors / plan.cfK
  const F0 = cf[0] ? cf[0].flow.netA * scale : Number.NaN
  const cf3 = pumps.find(s => s.name === 'cf3-8-0')
  const cf1 = pumps.find(s => s.name === `cf-${plan.controlL}-0`)
  const cf3Offsets = cf3 ? [...(cf3.read.raw ?? [])].sort((a, b) => a - b) : []
  const cf1Offsets = cf1 ? [...(cf1.read.raw ?? [])].sort((a, b) => a - b) : []
  // every k 1 offset appears three times in the k 3 read
  const cf3Gap =
    cf3 && cf1 && cf3Offsets.length === scale * cf1Offsets.length
      ? cf3Offsets.reduce((m, x, i) => Math.max(m, Math.abs(x - cf1Offsets[Math.floor(i / scale)]!)), 0)
      : Infinity
  const CF =
    cf.every(
      r =>
        r !== undefined &&
        r.flow.complete &&
        r.flow.closure <= TOL.closure &&
        r.flow.netA * scale === F0 &&
        r.flow.netB * scale === -F0,
    ) &&
    F0 !== 0 &&
    Number.isFinite(F0) &&
    cf3 !== undefined &&
    cf3.read.complete &&
    cf3Gap <= 1e-9

  // CN, CG
  const cn = loopRead(plan, stages, 'cn')
  const CN = cn !== undefined && cn.flow.complete && cn.flow.netA === 0 && cn.flow.netB === 0
  const cg = loopRead(plan, stages, 'cg')
  const ref = loopRead(plan, stages, `main first L ${plan.controlL}`)
  const cgCounts = (loop: string): number[] =>
    pumps
      .filter(s => s.loop === loop)
      .sort((a, b) => a.j - b.j)
      .map(s => s.read.levels.length)
  const CG =
    cg !== undefined &&
    ref !== undefined &&
    cg.flow.complete &&
    cg.flow.netA === ref.flow.netA &&
    cg.flow.netB === ref.flow.netB &&
    cgCounts('cg').join(',') === cgCounts(`main first L ${plan.controlL}`).join(',')

  // main
  const main = plan.sections.flatMap(section => plan.Ls.map(L => loopRead(plan, stages, `main ${section} L ${L}`)))
  const mainRead = main.every(r => r !== undefined)
  const complete = mainRead && main.every(r => r!.flow.complete && r!.flow.closure <= TOL.closure)
  const bulk = main.reduce((n, r) => n + (r ? r.flow.bulk : 0), 0)
  const zero = mainRead && main.every(r => r!.flow.netA === 0 && r!.flow.netB === 0)
  const atF0 = mainRead && main.every(r => r!.flow.netA === F0 && r!.flow.netB === -F0)
  const controls = CF && CN && CG && I && quantaOk

  let outcome: 'kill' | 'pass' | 'partial' | 'open'

  if (!controls || !complete || bulk > 0) {
    outcome = 'open'
  } else if (zero) {
    outcome = 'kill'
  } else if (atF0) {
    outcome = 'pass'
  } else {
    outcome = 'partial'
  }

  const status: Verdict['status'] =
    outcome === 'kill' ? 'fail' : outcome === 'pass' ? 'pass' : outcome === 'partial' ? 'partial' : 'open'

  const loopLine = (r: LoopRead | undefined, label: string): string =>
    r
      ? `${label}: A ${r.flow.netA} (up ${r.flow.A.up}, down ${r.flow.A.down}), B ${r.flow.netB} (up ${r.flow.B.up}, down ${r.flow.B.down}), ${r.levels} window levels over ${r.steps} steps, bulk ${r.flow.bulk}, complete ${r.flow.complete}, closure ${r.flow.closure.toExponential(1)}`
      : `${label}: not read`
  const diagLine = plan.diagTs
    .map(t => {
      const s = diags.find(d => d.where === 'slab' && d.t === t)
      const b = diags.find(d => d.where === 'bulk' && d.t === t)

      return `t ${t}: slab ${s ? `${s.wallLevels} wall levels in ${plan.diagWindow}` : '-'}, bulk nearest ${b ? b.nearest.toFixed(4) : '-'}`
    })
    .join('; ')

  const metrics: Record<string, number> = {
    F0,
    CF: flag(CF),
    CN: flag(CN),
    CG: flag(CG),
    I: flag(I),
    quanta: flag(quantaOk),
    bulk,
    complete: flag(complete),
    cf3Gap,
  }

  main.forEach(r => {
    if (r) {
      const key = r.loop.replace(/ /g, '_')

      metrics[`netA_${key}`] = r.flow.netA
      metrics[`netB_${key}`] = r.flow.netB
      metrics[`levels_${key}`] = r.levels
    }
  })
  diags.forEach(d => {
    metrics[`${d.name}`] = d.where === 'slab' ? d.wallLevels : d.nearest
  })

  return verdict({
    status,
    claim: `${outcome.toUpperCase()}. One flux quantum through the transverse (0, 1) torus, a closed x2 twist loop of ${plan.loopSteps} steps, window ${plan.window}. ${main
      .map((r, i) => loopLine(r, `${plan.sections[Math.floor(i / plan.Ls.length)]} L ${plan.Ls[i % plan.Ls.length]}`))
      .join('; ')}. Controls: CF ${CF} (F0 ${F0}, predicted ${plan.predictedF0}; ${cf.map((r, i) => loopLine(r, `L ${plan.Ls[i]} k ${plan.cfK}`)).join('; ')}; k 3 witness gap ${cf3Gap.toExponential(1)}), CN ${CN} (${loopLine(cn, 'no flux')}), CG ${CG} (${loopLine(cg, 'gauge')}), I ${I}, flux quanta read ${quantaOk}. Diagnostic (never gated): ${diagLine}.`,
    metrics,
    control: { CF: flag(CF), CN: flag(CN), CG: flag(CG), I: flag(I) },
    notes:
      'The colour is frozen (no action), read on a hand-placed slab in the 4D bulk, never on the husk. At L 8 and 12 the two six-class wall windows of E-FRC-0294 cover every depth class, so the 0.9 wall-weight bulk test cannot fire there; the A and B labels use wall A half of the classes. The U(1) probe is a colour-singlet test field, not part of the rule.',
  })
}

export function colorPumpRun(plan: ColorPumpPlan): Verdict {
  const stages: Stage[] = [...mainSpecs(plan), ...controlSpecs(plan), ...diagSpecs(plan)].map(s => s.run())

  return colorPumpVerdict(plan, stages)
}

export default experiment({
  id: 'gauge/color-pump',
  code: 'E-FRC-0295',
  title:
    "explores whether R*'s own frozen colour leaves chiral wall members on the domain-wall slab that finite size only pushed out of the window: a Laughlin pump of one colour-singlet flux quantum and a closed x2 twist counts the wall levels crossing pi, an index no box size or disorder can fake",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return colorPumpRun(COLOR_PUMP_PLAN)
  },
})
