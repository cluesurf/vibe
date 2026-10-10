// DOES THE FULLY FRUSTRATED CENTRE FLUX KEEP A CHIRAL WALL MEMBER THAT ITS BULK LEVELS ONLY PUSHED OUT OF THE WINDOW?
// (note/project/vibe/roadmap/moving-matter item 0069, decision 013 step 4.) Item 0058 read its one kept pattern cf0 (every
// D4 triangle carries 2 pi / 3, colour omega^(c_d) times 1 on slot d) as W-UNSURE: no slab level within 0.2 of pi at L 8
// and 12 (nearest 0.232), 24 Wilson bulk levels within 0.2. Decision 013 decides W-UNSURE by item 0053's Laughlin pump
// (code/measure/color-pump, E-FRC-0295), run here on cf0 with 0053's gates unchanged.
//
// THE PROBE, exactly 0053's: every link times one colour-singlet U(1) phase, one flux quantum through the transverse (0, 1)
// torus and a twist e^(i theta) on the links that wrap x2, theta = 2 pi j / 16, j = 0 .. 16 (j 16 must reproduce j 0 to
// 1e-10). Per L (8 and 12) and theta: every level within 0.2 of pi (complete search), labelled by the wall-A half projector
// in the span of the window levels, and the signed crossings of pi counted per wall.
//
// ONE COMPONENT. cf0 is a centre field: every link is a scalar omega^n times the 3 x 3 identity, so the triplet is three
// exact copies of one U(1) walk whose slot d carries omega^(c_d). Every count is read on that walk (k 1) and multiplied by
// 3, as 0053 read CF. Two reads witness it: K3, the full triplet at j 0 L 8 (three times the k 1 levels, the same
// offsets), and CG below, which is a k 3 read of the whole loop.
//
// CONTROLS, any misread makes the verdict OPEN:
//  CF identity links, same probe, L 8 and 12: 0053's stage files (deterministic, written after the last change to
//     color-pump and color-slab), F0 their read (-6: A -2, B +2 per component).
//  CN cf0 with no flux (twist only), L 8: A 0, B 0. Its j 0 read is 0058's slab: nearest level 0.2320 (instrument).
//  CG a site-wise Sigma(648) gauge transform of cf0's triplet links (integer Weyl stream, 0053's offset 1), L 8, k 3: the
//     flows and the window counts equal 3 times the main L 8 loop's.
// VERDICT, 0053's gates (fixed 2026-10-08), with F0 from CF:
//  KILL (fail)    A 0 and B 0 at L 8 and 12, no bulk level in the window, every search complete: cf0 has no chiral wall
//                 member (route 2 candidate e killed)
//  PASS           A = F0 and B = -F0 at both L: cf0 keeps its walls, so W-UNSURE resolves toward W-PASS
//  PARTIAL        a nonzero count other than F0, or the two L disagree
//  OPEN           a bulk level in the window, an incomplete search, or a control fails
// cf0 has no lift section (its links are centre elements by construction), so 0053's 'both sections' is one field.
//
// DETERMINISM: no random numbers. Depth L2: a lattice-fermion spectral flow on a static centre field.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { wallADepths } from '@/code/measure/wall-stream'
import { sigmaTable } from '@/code/measure/color-gates'
import { centerField, enumerateCenterPatterns, type CenterPattern } from '@/code/measure/center-flux'
import {
  colorCluster,
  colorLevelsNearPi,
  colorOp,
  colorPieces,
  gaugeLinks,
  identityLinks,
  linkGaps,
  linksOf,
  reductionGaps,
  slabBox,
  wallWindows,
  weylGauge,
  type ClusterOptions,
  type ColorBox,
  type ColorLevel,
  type ColorLinks,
  type ColorOp,
  type ColorPieces,
} from '@/code/measure/color-slab'
import {
  phaseWitness,
  probeLinks,
  pumpFlow,
  pumpPhases,
  wallStates,
  type PhaseWitness,
  type PumpFlow,
  type PumpReadOptions,
  type PumpStepRead,
} from '@/code/measure/color-pump'

const SLOTS = 24

export type CenterPumpPlan = {
  side: number
  Ls: number[]
  quanta: number
  loopSteps: number
  window: number
  wallShare: number
  krylov: number
  cluster: Omit<ClusterOptions, 'window'>
  colors: number
  controlL: number
  gaugeOffset: number
  // 0058's cf0 slab L 8 nearest level (tmp/cflux-cf0-slab-8.json), the CN j 0 instrument
  slabNearest: number
}

// 0053's COLOR_PUMP_PLAN values, unchanged
export const CENTER_PUMP_PLAN: CenterPumpPlan = {
  side: 8,
  Ls: [8, 12],
  quanta: 1,
  loopSteps: 16,
  window: 0.2,
  wallShare: 0.9,
  krylov: 160,
  cluster: { block: 64, degree: 40, cut: 0.4, maxPasses: 8, tol: 1e-11 },
  colors: 3,
  controlL: 8,
  gaugeOffset: 1,
  slabNearest: 0.2320220859562849,
}

const TOL = {
  phase: 1e-12,
  link: 1e-12,
  reduction: 1e-12,
  piece: 1e-13,
  eigen: 1e-9,
  closure: 1e-10,
  copies: 1e-9,
  instrument: 1e-4,
}

type Shared = { pieces: ColorPieces; profile: (L: number) => number[]; cf0: CenterPattern }

let shared: Shared | undefined

function sharedOf(): Shared {
  if (!shared) {
    const cs = chiralSlab(8)
    const kept = enumerateCenterPatterns().kept

    shared = {
      pieces: colorPieces(cs.sets[0]!, cs.ranges[0]!.sR, cs.ranges[0]!.dR),
      profile: L => [...chiralSlab(L).slab.profile],
      cf0: kept[0]!.pattern,
    }
  }

  return shared
}

// cf0 on one colour component: slot d carries omega^(c_d), a scalar (the reverse slot carries the conjugate by oddness)
export function centerScalarLinks(box: ColorBox, p: CenterPattern): ColorLinks {
  const m = new Float64Array(box.cells * SLOTS * 2)

  for (let l = 0; l < box.cells * SLOTS; l++) {
    const a = (2 * Math.PI * p.c[l % SLOTS]!) / 3

    m[2 * l] = Math.cos(a)
    m[2 * l + 1] = Math.sin(a)
  }

  return { k: 1, m }
}

// cf0's triplet links (Sigma(648) centre elements), as 0058 read them
export function centerTripletLinks(box: ColorBox, p: CenterPattern): ColorLinks {
  return linksOf(box, { k: 3, mats: sigmaTable().lifts.floats, link: centerField(p).on(box, 'slab') })
}

type Witness = {
  pieceGap: number
  reverse: number
  unitary: number
  cycle: number
  cycleDag: number
  metric: number
  phase: PhaseWitness
}

// identity: the CF field (identity links, k 1) in place of cf0
export type CenterField = { k: 1 | 3; gauge: boolean; identity?: boolean }

export type CenterPumpStage = {
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

export const thetaOf = (plan: CenterPumpPlan, j: number): number => (2 * Math.PI * j) / plan.loopSteps

// 0053's pumpRead on an expected-empty window, with the rule its header states, 'either confirmed or replaced by the
// other', applied in both directions: Lanczos first (an empty complete window ends the read); when it finds levels the
// block read resolves the cluster; a block that stops at its pass limit above the eigen tolerance is replaced by the
// Lanczos levels when that search is complete and the two counts agree (the block's count guards Lanczos against
// undercounting a degenerate cluster). On the k 3 triplet the six-fold clusters can leave the 8-pass block at 1e-7
// (item 0069, cg-2), where 0053's code called the step incomplete although both reads hold the same 24 levels.
export function centerRead(op: ColorOp, o: PumpReadOptions): PumpStepRead & { replaced: boolean } {
  const states = (levels: readonly { offset: number; vector: ColorLevel['vector'] }[]) => ({
    levels: wallStates(op, levels, o.windows, o.halfA),
    raw: levels.map(l => l.offset).sort((x, y) => x - y),
  })
  const kr = colorLevelsNearPi(op, o.window, o.krylov)
  const krylov = {
    count: kr.levels.length,
    complete: kr.complete && kr.eigenResidual <= o.eigenTol,
    rounds: kr.rounds,
    nearest: kr.nearest,
    nearestResidual: kr.nearestResidual,
    eigenResidual: kr.eigenResidual,
    seconds: kr.seconds,
  }

  if (krylov.complete && krylov.count === 0) {
    return { levels: [], raw: [], complete: true, krylov, agree: true, replaced: false }
  }

  const c = colorCluster(op, { ...o.cluster, window: o.window })
  const block = {
    count: c.levels.length,
    complete: c.complete,
    passes: c.passes,
    aboveCut: c.aboveCut,
    guard: c.guard,
    eigenResidual: c.eigenResidual,
    seconds: c.seconds,
  }
  const agree = krylov.count === block.count

  if (block.complete) {
    return { ...states(c.levels), complete: !krylov.complete || agree, krylov, block, agree, replaced: false }
  }

  if (krylov.complete && agree) {
    return { ...states(kr.levels), complete: true, krylov, block, agree, replaced: true }
  }

  return { ...states(c.levels), complete: false, krylov, block, agree, replaced: false }
}

export function centerPumpStage(
  plan: CenterPumpPlan,
  name: string,
  loop: string,
  L: number,
  j: number,
  quanta: number,
  f: CenterField,
): CenterPumpStage {
  const t0 = Date.now()
  const { pieces, profile, cf0 } = sharedOf()
  const box = slabBox(plan.side, L)
  let base = f.identity
    ? identityLinks(box, f.k)
    : f.k === 1
      ? centerScalarLinks(box, cf0)
      : centerTripletLinks(box, cf0)

  if (f.gauge) {
    base = gaugeLinks(box, base, weylGauge(sigmaTable().lifts.floats, plan.gaugeOffset))
  }

  const field = { side: plan.side, quanta, theta: thetaOf(plan, j) }
  const phases = pumpPhases(box, field)
  const links = probeLinks(base, phases)
  const op = colorOp(box, links, pieces, profile(L))
  const red = reductionGaps(op)
  const lg = linkGaps(box, links)
  const read = centerRead(op, {
    window: plan.window,
    krylov: plan.krylov,
    cluster: plan.cluster,
    expectEmpty: true,
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

// ---- the stages ----

export type StageSpec = { name: string; run: () => CenterPumpStage }

const steps = (plan: CenterPumpPlan): number[] => Array.from({ length: plan.loopSteps + 1 }, (_, j) => j)

export function centerPumpSpecs(plan: CenterPumpPlan): StageSpec[] {
  const out: StageSpec[] = []
  const add = (name: string, loop: string, L: number, j: number, quanta: number, f: CenterField) =>
    out.push({ name, run: () => centerPumpStage(plan, name, loop, L, j, quanta, f) })

  for (const L of plan.Ls) {
    for (const j of steps(plan)) {
      add(`main-${L}-${j}`, `main L ${L}`, L, j, plan.quanta, { k: 1, gauge: false })
    }
  }

  for (const j of steps(plan)) {
    add(`cn-${j}`, 'cn', plan.controlL, j, 0, { k: 1, gauge: false })
    add(`cg-${j}`, 'cg', plan.controlL, j, plan.quanta, { k: 3, gauge: true })
    // a re-read of a cg step whose file was written before centerRead (the verdict prefers it)
    add(`cgk-${j}`, 'cg', plan.controlL, j, plan.quanta, { k: 3, gauge: true })
  }

  add('k3-8-0', 'k3', plan.controlL, 0, plan.quanta, { k: 3, gauge: false })

  return out
}

// ---- the verdict ----

type Loopable = { j: number; loop: string; read: PumpStepRead }

export type LoopRead = { loop: string; steps: number; levels: number; counts: number[]; flow: PumpFlow }

export function loopRead(plan: CenterPumpPlan, stages: readonly Loopable[], loop: string): LoopRead | undefined {
  const mine = stages.filter(s => s.loop === loop).sort((a, b) => a.j - b.j)

  if (mine.length !== plan.loopSteps + 1 || mine.some((s, i) => s.j !== i)) {
    return undefined
  }

  return {
    loop,
    steps: mine.length,
    levels: mine.reduce((n, s) => n + s.read.levels.length, 0),
    counts: mine.map(s => s.read.levels.length),
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
  w.phase.coordsExact &&
  w.phase.triangle <= TOL.phase &&
  w.phase.reverse <= TOL.phase &&
  w.phase.t2Loop <= TOL.phase

const flag = (b: boolean): number => (b ? 1 : 0)

// cf: 0053's CF stage reads (loops 'cf L 8', 'cf L 12', k 1)
export function centerPumpVerdict(
  plan: CenterPumpPlan,
  all: readonly CenterPumpStage[],
  cf: readonly Loopable[],
): Verdict {
  const scale = plan.colors
  // a cgk-j re-read replaces cg-j
  const stages = all.filter(s => !(s.name.startsWith('cg-') && all.some(t => t.name === `cgk-${s.j}`)))
  const replaced = stages.filter(s => (s.read as { replaced?: boolean }).replaced === true).map(s => s.name)
  const I = stages.every(s => witnessOk(s.witness))
  const quantaOk = stages.every(s => Math.abs(s.witness.phase.quantaRead - s.quanta) <= 1e-9)

  // CF (0053's files)
  const cfLoops = plan.Ls.map(L => loopRead(plan, cf, `cf L ${L}`))
  const F0 = cfLoops[0] ? cfLoops[0].flow.netA * scale : Number.NaN
  const CF =
    cfLoops.every(
      r =>
        r !== undefined &&
        r.flow.complete &&
        r.flow.closure <= TOL.closure &&
        r.flow.netA * scale === F0 &&
        r.flow.netB * scale === -F0,
    ) &&
    F0 !== 0 &&
    Number.isFinite(F0)

  // K3: the triplet at j 0, L 8 is three copies of the component
  const k3 = stages.find(s => s.name === 'k3-8-0')
  const k1 = stages.find(s => s.name === `main-${plan.controlL}-0`)
  const k3Offsets = k3 ? [...k3.read.raw].sort((a, b) => a - b) : []
  const k1Offsets = k1 ? [...k1.read.raw].sort((a, b) => a - b) : []
  const k3Gap =
    k3 && k1 && k3.read.complete && k1.read.complete && k3Offsets.length === scale * k1Offsets.length
      ? k3Offsets.reduce((m, x, i) => Math.max(m, Math.abs(x - k1Offsets[Math.floor(i / scale)]!)), 0)
      : Infinity
  const nearestOf = (s: CenterPumpStage | undefined): number =>
    s === undefined
      ? Number.NaN
      : s.read.raw.length > 0
        ? Math.min(...s.read.raw.map(Math.abs))
        : (s.read.krylov?.nearest ?? Number.NaN)
  const K3 = k3Gap <= TOL.copies || (k1Offsets.length === 0 && k3Offsets.length === 0 && k3 !== undefined && k3.read.complete)

  // CN, with its j 0 against 0058's slab
  const cn = loopRead(plan, stages, 'cn')
  const cnNearest = nearestOf(stages.find(s => s.name === 'cn-0'))
  const instrument = Math.abs(cnNearest - plan.slabNearest) <= TOL.instrument
  const CN = cn !== undefined && cn.flow.complete && cn.flow.netA === 0 && cn.flow.netB === 0

  // CG, k 3 against 3 x the main L 8 loop
  const cg = loopRead(plan, stages, 'cg')
  const ref = loopRead(plan, stages, `main L ${plan.controlL}`)
  const CG =
    cg !== undefined &&
    ref !== undefined &&
    cg.flow.complete &&
    cg.flow.netA === scale * ref.flow.netA &&
    cg.flow.netB === scale * ref.flow.netB &&
    cg.counts.join(',') === ref.counts.map(c => scale * c).join(',')

  // main, in units of the triplet
  const main = plan.Ls.map(L => loopRead(plan, stages, `main L ${L}`))
  const mainRead = main.every(r => r !== undefined)
  const complete = mainRead && main.every(r => r!.flow.complete && r!.flow.closure <= TOL.closure)
  const bulk = main.reduce((n, r) => n + (r ? r.flow.bulk : 0), 0)
  const net = (r: LoopRead): { A: number; B: number } => ({ A: scale * r.flow.netA, B: scale * r.flow.netB })
  const zero = mainRead && main.every(r => net(r!).A === 0 && net(r!).B === 0)
  const atF0 = mainRead && main.every(r => net(r!).A === F0 && net(r!).B === -F0)
  const controls = CF && CN && CG && K3 && I && quantaOk && instrument

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

  const loopLine = (r: LoopRead | undefined, label: string, times: number): string =>
    r
      ? `${label}: A ${times * r.flow.netA} (up ${times * r.flow.A.up}, down ${times * r.flow.A.down}), B ${times * r.flow.netB} (up ${times * r.flow.B.up}, down ${times * r.flow.B.down}), ${r.levels} window levels over ${r.steps} steps (k ${label.startsWith('gauge') ? 3 : 1}), bulk ${r.flow.bulk}, complete ${r.flow.complete}, closure ${r.flow.closure.toExponential(1)}`
      : `${label}: not read`

  const metrics: Record<string, number> = {
    F0,
    CF: flag(CF),
    CN: flag(CN),
    CG: flag(CG),
    K3: flag(K3),
    I: flag(I),
    quanta: flag(quantaOk),
    instrument: flag(instrument),
    cnNearest,
    k3Gap,
    bulk,
    complete: flag(complete),
  }

  main.forEach((r, i) => {
    if (r) {
      metrics[`netA_L${plan.Ls[i]}`] = net(r).A
      metrics[`netB_L${plan.Ls[i]}`] = net(r).B
      metrics[`levels_L${plan.Ls[i]}`] = r.levels
    }
  })

  const nearestLine = plan.Ls.map(L => {
    const ns = stages.filter(s => s.loop === `main L ${L}`).sort((a, b) => a.j - b.j).map(nearestOf)

    return `L ${L} nearest by j ${ns.map(v => v.toFixed(4)).join(' ')}`
  }).join('; ')

  return verdict({
    status,
    claim: `${outcome.toUpperCase()}. cf0 (every triangle 2 pi / 3), one flux quantum through the transverse (0, 1) torus, a closed x2 twist loop of ${plan.loopSteps} steps, window ${plan.window}, counts per triplet (3 x the component). ${main
      .map((r, i) => loopLine(r, `L ${plan.Ls[i]}`, scale))
      .join('; ')}. Controls: CF ${CF} (0053's reads, F0 ${F0}; ${cfLoops.map((r, i) => loopLine(r, `L ${plan.Ls[i]}`, scale)).join('; ')}), CN ${CN} (${loopLine(cn, 'no flux', scale)}; j 0 nearest ${cnNearest.toFixed(5)} against 0058's ${plan.slabNearest}), CG ${CG} (${loopLine(cg, 'gauge', 1)}), K3 ${K3} (gap ${k3Gap.toExponential(1)}), I ${I}, flux quanta read ${quantaOk}. Block reads replaced by complete Lanczos of the same count: ${replaced.length > 0 ? replaced.join(', ') : 'none'}. Diagnostic: ${nearestLine}.`,
    metrics,
    control: { CF: flag(CF), CN: flag(CN), CG: flag(CG), K3: flag(K3), I: flag(I) },
    notes:
      'cf0 is a static centre field read on a hand-placed slab in the 4D bulk, never on the husk. One of the 81 flat-twist members of its class on side 8 (0058 boxRepresentative). At L 8 and 12 the two six-class wall windows cover every depth class, so the 0.9 bulk test cannot fire. The U(1) probe is a colour-singlet test field, not part of the rule.',
  })
}

export function centerPumpRun(plan: CenterPumpPlan): Verdict {
  const stages = centerPumpSpecs(plan).map(s => s.run())
  const cf = plan.Ls.flatMap(L =>
    steps(plan).map(j =>
      centerPumpStage(plan, `cf-${L}-${j}`, `cf L ${L}`, L, j, plan.quanta, { k: 1, gauge: false, identity: true }),
    ),
  )

  return centerPumpVerdict(plan, stages, cf)
}

export default experiment({
  id: 'gauge/center-pump',
  code: 'E-FRC-0300',
  title:
    'explores whether the fully frustrated Z3 centre flux cf0 keeps chiral wall members that its bulk levels only pushed out of the window: a Laughlin pump of one colour-singlet flux quantum and a closed x2 twist counts the wall levels crossing pi, an index no box size can fake',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return centerPumpRun(CENTER_PUMP_PLAN)
  },
})
