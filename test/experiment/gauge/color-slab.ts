// DOES R*'S OWN FROZEN COLOUR KEEP THE BULK GAP AT PI, AND WHAT IS THE COLOUR-SINGLET MASS SPURION D3 ON THE COLOURED
// SLAB? (E-FRC-0294, note/project/vibe/roadmap/moving-matter item 0049, key 1 of research/mass-inputs.md.) RULE: the
// register rule R*, half +, member unit ringUnit(-2, 5), with E-SPN-0132's frozen colour: the weave's integer Weyl link
// start (code/rule/vibe-weave linkStart) lifted to Sigma(648) by a Z3 centre section (code/measure/holonomy-caging
// roleLinks, sections 'first' and 'weyl'). Colour on R* has no action and no dynamics (C* is deferred, decision 003), so
// the wire term of research/frozen-mass.md input 3 is not a rate: it is a read of the rule's own field.
//
// THE INSTRUMENT (code/measure/color-slab). The member carried as a colour triplet: the slot crossing link (x, d) turns
// the colour by its Sigma(648) matrix. Real space, no Bloch momentum. The cycle U = T P1 T P0 is the identity off
// W = R + T' R (R the Q_S + Q_D range of each dock), so it is read exactly in W's coordinates (16 x 3 numbers a dock)
// with W's Gram metric; the reduction is checked against the full-space cycle on every operator (gap < 1e-12).
//
// STEP 1 PREMISE. The side-8 4D box (4096 docks), no walls, half +, both sections: the Wilson set on every dock, then the
//  plain set. Every level within 0.2 of pi (Lanczos 160 in the metric, deflated restarts, complete when a round finds no
//  Ritz value in the window), the nearest (the top Ritz value of the last round), and each window level's participation
//  (the fewest docks holding 90 percent of its weight, over 4096).
// VERDICT, fixed 2026-10-08 before any read (the brief):
//  OPEN    no level within 0.2 in either set under both sections: m_wire = 0 exactly (no gap-closing region in the rule's
//          field); go to STEP 2.
//  KILL    a level within 0.04 of pi with participation at least 0.1, in either set, under both sections: no protected
//          doublet on R*'s own colour, decision 002 point 3 fails; raise a Decide: for 0011 and stop.
//  Sections disagree: report and raise a Decide:. Otherwise PARTIAL: go to STEP 2, the wire term is read as D3.
// STEP 2. The coloured slab 8^3 x L (D4 modulo 8 D3 and L e_3, 512 docks a class), L 8, 12, 16, links the vibe-weave
//  numbers of that box: the levels within 0.1 of pi (a Chebyshev-filtered block subspace iteration, residual 1e-11: the
//  wall pair at +delta and -delta is degenerate in A = -(U + U^dag) / 2, below a single Krylov space's resolution). Not
//  exactly 24, each with at least 0.9 weight on the two six-class wall windows: report the count, stop PARTIAL. The
//  wall-A window projector diagonalized in the 24 levels' span (12 A-like, 12 B-like), M = the A-to-B block of
//  H_eff = -wrap(phase - pi), D3 = |det M|^(1/4); D3, the 12 singular values, D3 / delta^3 against E-SPN-0197's
//  colour-free delta at the same L (wall-g-factor pairLevels on the dense k = 0 slab).
// CONTROLS, all before a verdict, else instrument failure:
//  C1 identity links (k 3) reproduce E-SPN-0197's delta at L 8, 12, 16 to 1e-10 relative, and D3 = delta^3 to 1e-9.
//  C2 the constant diagonal link exp(2 pi i diag(-1, -1, 2) / 9) on every x0 link (link h^(r0): zero flux, a twist):
//     D3 = delta_1 delta_2 delta_3 from three colour-blind runs carrying each component's U(1) twist (delta_c = that
//     run's |det M_c|^(1/4)), to 1e-9 relative, at L 8, window 0.2 (the twist moves the 2/9 pair to 0.111).
//  C3 a site-wise Sigma(648) gauge transform of the 'first' field (the element of dock x an integer Weyl stream over the
//     648) leaves the STEP 1 levels and D3 (L 8) unchanged to 1e-10.
// INSTRUMENT (a failure is partial): pieces P = X (1 + E (g - 1) E^dag) to 1e-13; every link unitary and its reverse its
//  inverse to 1e-12; the reduction equals the full-space cycle to 1e-12 on each operator.
//
// FIRST RUN (stages in parallel, tmp/cslab-stage.ts, verdict tmp/cslab-verdict.log): PARTIAL, the STEP 2 stop.
//  - STEP 1 OPEN under both sections: no level within 0.2 in either set; nearest Wilson 0.4618 (first), 0.4673 (weyl)
//    against the colour-free 0.70, plain 0.7605 both. No gap-closing region: m_wire = 0 exactly.
//  - STEP 2: 0 levels within 0.1 at L 8, 12, 16, both sections (Krylov-confirmed), the nearest 0.452 to 0.485, the
//    coloured Wilson bulk edge. The wall doublet is absent on the rule's own colour; D3 is not formed.
//  - C1 delta 1.8e-13, 5.9e-12, 2.7e-12; its D3 clause misses at L 8 (5.4e-9) and L 16 (9.0e-9): the projector splits
//    each pair off 45 degrees by about 4e-5 rad and every singular value is delta sin(2 theta) (the pair product
//    (prod |eps|)^(1/8) holds to 1e-11). C2 2.5e-12. C3: STEP 1 and the L 8 slab unchanged (both empty, nearest within
//    residuals). I: the reduction equals the full-space cycle to 2e-14.
//
// DETERMINISM: no random numbers. Depth L2: a lattice-fermion spectral read of the rule's own frozen colour.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { pairLevels, slabOps, wallSpec } from '@/code/measure/wall-g-factor'
import { gridLifts, roleLinks, type GridLifts } from '@/code/measure/holonomy-caging'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import {
  bulkBox,
  colorCluster,
  colorLevelsNearPi,
  colorOp,
  colorPieces,
  d3Read,
  dockWeights,
  gaugeLinks,
  identityLinks,
  linkGaps,
  linksOf,
  participation,
  reductionGaps,
  slabBox,
  slabWeave,
  twistLinks,
  wallWindows,
  weylGauge,
  type ClusterOptions,
  type ColorBox,
  type ColorLinks,
  type ColorPieces,
} from '@/code/measure/color-slab'

export type ColorSlabPlan = {
  side: number
  Ls: number[]
  step1Window: number
  killWindow: number
  killParticipation: number
  share: number
  krylov: number
  pairWindow: number
  pairs: number
  wallShare: number
  cluster: Omit<ClusterOptions, 'window'>
  c2L: number
  c2Window: number
  c2Turns: number[]
  c3L: number
  gaugeOffset: number
}

export const COLOR_SLAB_PLAN: ColorSlabPlan = {
  side: 8,
  Ls: [8, 12, 16],
  step1Window: 0.2,
  killWindow: 0.04,
  killParticipation: 0.1,
  share: 0.9,
  krylov: 160,
  pairWindow: 0.1,
  pairs: 24,
  wallShare: 0.9,
  cluster: { block: 32, degree: 40, cut: 0.4, maxPasses: 4, tol: 1e-11 },
  c2L: 8,
  // the twist moves each component's wall pair off pi (the nearest box momentum is |K0| 0.087 for -1/9 and 0.175 for
  // 2/9): at 0.1 the 2/9 component's pair sits outside (0.111) and the identity would test two components only
  c2Window: 0.2,
  c2Turns: [-1 / 9, -1 / 9, 2 / 9],
  c3L: 8,
  gaugeOffset: 1,
}

const TOL = {
  piece: 1e-13,
  link: 1e-12,
  reduction: 1e-12,
  step1Eigen: 1e-9,
  c1Delta: 1e-10,
  c1D3: 1e-9,
  c2: 1e-9,
  c3: 1e-10,
}

export type Section = 'first' | 'weyl'
export type SetName = 'wilson' | 'plain'

// ---- the shared pieces ----

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

function ruleLinks(box: ColorBox, section: Section, bulk: boolean, side: number): ColorLinks {
  const { lifts } = sharedOf()

  if (bulk) {
    const weave = makeColorWeave({ side, table: 'bind' })

    return linksOf(box, roleLinks(weave, weave.links, lifts, section))
  }

  const w = slabWeave(box)

  return linksOf(box, roleLinks(w as unknown as ColorWeave, w.links, lifts, section))
}

type Witness = {
  pieceGap: number
  reverse: number
  unitary: number
  cycle: number
  cycleDag: number
  metric: number
}

// ---- STEP 1 ----

export type Step1Stage = {
  kind: 'step1'
  section: Section
  set: SetName
  gauge: boolean
  levels: { offset: number; participation: number }[]
  complete: boolean
  rounds: number
  steps: number
  nearest: number
  nearestResidual: number
  eigenResidual: number
  ritzResidual: number
  seconds: number
  witness: Witness
}

export function step1Stage(
  plan: ColorSlabPlan,
  section: Section,
  set: SetName,
  gauge: boolean,
): Step1Stage {
  const { pieces, lifts } = sharedOf()
  const box = bulkBox(plan.side)
  let links = ruleLinks(box, section, true, plan.side)

  if (gauge) {
    links = gaugeLinks(box, links, weylGauge(lifts.floats, plan.gaugeOffset))
  }

  // set index 0 plain, 1 Wilson (chiralSlab's piece sets)
  const op = colorOp(box, links, pieces, [set === 'wilson' ? 1 : 0])
  const red = reductionGaps(op)
  const lg = linkGaps(box, links)
  const r = colorLevelsNearPi(op, plan.step1Window, plan.krylov)

  return {
    kind: 'step1',
    section,
    set,
    gauge,
    levels: r.levels
      .map(l => ({
        offset: l.offset,
        participation: participation(dockWeights(op, l.vector), plan.share),
      }))
      .sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset)),
    complete: r.complete,
    rounds: r.rounds,
    steps: r.steps,
    nearest: r.nearest,
    nearestResidual: r.nearestResidual,
    eigenResidual: r.eigenResidual,
    ritzResidual: r.ritzResidual,
    seconds: r.seconds,
    witness: { pieceGap: pieces.pieceGap, ...lg, ...red },
  }
}

// ---- STEP 2 and the slab controls ----

export type SlabStage = {
  kind: 'slab'
  label: string
  L: number
  k: number
  window: number
  count: number
  eps: number[]
  wallShareMin: number
  projector: number[]
  delta: number
  deltaRef: number
  D3: number
  // (prod |eps|)^(1 / 8): the product of the pair splittings to the 1/4 (delta^3 colour-free at k 3)
  D3eps: number
  singular: number[]
  eigenResidual: number
  passes: number
  aboveCut: number
  guard: number
  complete: boolean
  // the Krylov confirmation of a count other than the pairs' (the nearest level as the top Ritz value's distance)
  krylov?: {
    count: number
    offsets: number[]
    complete: boolean
    rounds: number
    nearest: number
    nearestResidual: number
    eigenResidual: number
    seconds: number
  }
  seconds: number
  witness: Witness
}

const refDelta = new Map<number, number>()

function deltaRef(L: number): number {
  if (!refDelta.has(L)) {
    refDelta.set(L, pairLevels(slabOps(wallSpec(chiralSlab(L), 0)).ops, 0.1).delta)
  }

  return refDelta.get(L)!
}

export type SlabField =
  | { field: 'rule'; section: Section; gauge: boolean }
  | { field: 'identity' }
  | { field: 'twist'; turns: number[] }

export function slabStage(
  plan: ColorSlabPlan,
  label: string,
  L: number,
  f: SlabField,
  window: number,
): SlabStage {
  const { pieces, profile, lifts } = sharedOf()
  const box = slabBox(plan.side, L)
  let links: ColorLinks

  if (f.field === 'rule') {
    links = ruleLinks(box, f.section, false, plan.side)

    if (f.gauge) {
      links = gaugeLinks(box, links, weylGauge(lifts.floats, plan.gaugeOffset))
    }
  } else if (f.field === 'identity') {
    links = identityLinks(box, 3)
  } else {
    links = twistLinks(box, f.turns)
  }

  const op = colorOp(box, links, pieces, profile(L))
  const red = reductionGaps(op)
  const lg = linkGaps(box, links)
  const cl = colorCluster(op, { ...plan.cluster, window })
  const w = wallWindows(L)
  const d = d3Read(op, cl.levels, w.a, w.b)
  const logEps = d.eps.reduce((s, x) => s + Math.log(Math.abs(x)), 0)
  // a count other than the pairs' is confirmed by the Krylov search, which is complete when a round finds no Ritz value
  // in the window (an empty window passes the block's residual test vacuously)
  const confirm =
    d.count === plan.pairs * (links.k / 3) ? undefined : colorLevelsNearPi(op, window, plan.krylov)

  return {
    kind: 'slab',
    label,
    L,
    k: links.k,
    window,
    count: d.count,
    eps: d.eps,
    wallShareMin: d.wallShare.length > 0 ? Math.min(...d.wallShare) : Number.NaN,
    projector: d.projector,
    delta: d.delta,
    deltaRef: deltaRef(L),
    D3: d.D3,
    D3eps: Math.exp(logEps / 8),
    singular: d.singular,
    eigenResidual: cl.eigenResidual,
    passes: cl.passes,
    aboveCut: cl.aboveCut,
    guard: cl.guard,
    complete: confirm
      ? confirm.complete && confirm.levels.length === d.count && confirm.eigenResidual <= TOL.step1Eigen
      : cl.complete,
    krylov: confirm
      ? {
          count: confirm.levels.length,
          offsets: confirm.levels.map(l => l.offset),
          complete: confirm.complete,
          rounds: confirm.rounds,
          nearest: confirm.nearest,
          nearestResidual: confirm.nearestResidual,
          eigenResidual: confirm.eigenResidual,
          seconds: confirm.seconds,
        }
      : undefined,
    seconds: cl.seconds,
    witness: { pieceGap: pieces.pieceGap, ...lg, ...red },
  }
}

// ---- the stages ----

export type Stage = Step1Stage | SlabStage

export type StageSpec = { name: string; run: () => Stage }

export function step1Specs(plan: ColorSlabPlan): StageSpec[] {
  const out: StageSpec[] = []

  for (const section of ['first', 'weyl'] as const) {
    for (const set of ['wilson', 'plain'] as const) {
      out.push({ name: `step1-${section}-${set}`, run: () => step1Stage(plan, section, set, false) })
    }
  }

  for (const set of ['wilson', 'plain'] as const) {
    out.push({ name: `c3-step1-${set}`, run: () => step1Stage(plan, 'first', set, true) })
  }

  return out
}

export function controlSpecs(plan: ColorSlabPlan): StageSpec[] {
  const out: StageSpec[] = plan.Ls.map(L => ({
    name: `c1-${L}`,
    run: () => slabStage(plan, `c1 L ${L}`, L, { field: 'identity' }, plan.pairWindow),
  }))

  out.push({
    name: 'c2-colored',
    run: () => slabStage(plan, 'c2 colored', plan.c2L, { field: 'twist', turns: plan.c2Turns }, plan.c2Window),
  })
  plan.c2Turns.forEach((t, c) => {
    out.push({
      name: `c2-component-${c}`,
      run: () => slabStage(plan, `c2 component ${c}`, plan.c2L, { field: 'twist', turns: [t] }, plan.c2Window),
    })
  })

  return out
}

export function step2Specs(plan: ColorSlabPlan): StageSpec[] {
  const out: StageSpec[] = []

  for (const section of ['first', 'weyl'] as const) {
    for (const L of plan.Ls) {
      out.push({
        name: `step2-${section}-${L}`,
        run: () => slabStage(plan, `step2 ${section} L ${L}`, L, { field: 'rule', section, gauge: false }, plan.pairWindow),
      })
    }
  }

  out.push({
    name: 'c3-slab',
    run: () => slabStage(plan, 'c3 slab', plan.c3L, { field: 'rule', section: 'first', gauge: true }, plan.pairWindow),
  })

  return out
}

// ---- the verdict ----

const flag = (b: boolean): number => (b ? 1 : 0)

export type Premise = 'open' | 'partial' | 'kill' | 'disagree' | 'incomplete'

export function premiseOf(plan: ColorSlabPlan, stages: readonly Stage[]): {
  premise: Premise
  perSection: Record<Section, 'open' | 'partial' | 'kill'>
} {
  const s1 = stages.filter((s): s is Step1Stage => s.kind === 'step1' && !s.gauge)
  const perSection = {} as Record<Section, 'open' | 'partial' | 'kill'>

  for (const section of ['first', 'weyl'] as const) {
    const mine = s1.filter(s => s.section === section)
    const inWindow = mine.some(s => s.levels.some(l => Math.abs(l.offset) < plan.step1Window))
    const kill = mine.some(s =>
      s.levels.some(l => Math.abs(l.offset) < plan.killWindow && l.participation >= plan.killParticipation),
    )

    perSection[section] = kill ? 'kill' : inWindow ? 'partial' : 'open'
  }

  if (s1.length < 4 || s1.some(s => !s.complete)) {
    return { premise: 'incomplete', perSection }
  }

  const premise: Premise =
    perSection.first !== perSection.weyl ? 'disagree' : perSection.first

  return { premise, perSection }
}

const rel = (a: number, b: number): number => Math.abs(a - b) / Math.abs(b)

// a slab stage's window is complete when the Krylov search confirms its count, or (the pairs found) when every window
// level converged and the block kept a Ritz value outside the window (colorCluster's rule, read from the stored fields)
const slabComplete = (plan: ColorSlabPlan, s: SlabStage): boolean =>
  s.krylov
    ? s.krylov.complete && s.krylov.count === s.count && s.krylov.eigenResidual <= TOL.step1Eigen
    : s.count > 0 && s.eigenResidual <= plan.cluster.tol && s.count < plan.cluster.block

export function colorSlabVerdict(plan: ColorSlabPlan, stages: readonly Stage[]): Verdict {
  const byName = (label: string): SlabStage | undefined =>
    stages.find((s): s is SlabStage => s.kind === 'slab' && s.label === label)
  const s1 = stages.filter((s): s is Step1Stage => s.kind === 'step1')
  const { premise, perSection } = premiseOf(plan, stages)
  const slabs = stages.filter((s): s is SlabStage => s.kind === 'slab')

  // instrument
  const witnesses = stages.map(s => s.witness)
  const I =
    witnesses.every(
      w =>
        w.pieceGap <= TOL.piece &&
        w.reverse <= TOL.link &&
        w.unitary <= TOL.link &&
        w.cycle <= TOL.reduction &&
        w.cycleDag <= TOL.reduction &&
        w.metric <= TOL.reduction,
    ) &&
    s1.every(s => s.complete && s.eigenResidual <= TOL.step1Eigen) &&
    slabs.every(s => slabComplete(plan, s))

  // C1
  const c1 = plan.Ls.map(L => byName(`c1 L ${L}`))
  const c1Delta = c1.map(s => (s ? rel(s.delta, s.deltaRef) : Infinity))
  const c1D3 = c1.map(s => (s ? rel(s.D3, s.deltaRef ** 3) : Infinity))
  const c1D3eps = c1.map(s => (s ? rel(s.D3eps, s.deltaRef ** 3) : Infinity))
  const C1 =
    c1.every(s => s !== undefined && s.count === plan.pairs) &&
    c1Delta.every(x => x <= TOL.c1Delta) &&
    c1D3.every(x => x <= TOL.c1D3)

  // C2
  const c2c = byName('c2 colored')
  const c2parts = plan.c2Turns.map((_, c) => byName(`c2 component ${c}`))
  const c2Product = c2parts.reduce((p, s) => p * (s ? s.D3 : Number.NaN), 1)
  const c2Gap = c2c ? rel(c2c.D3, c2Product) : Infinity
  const c2Count = c2parts.reduce((t, s) => t + (s ? s.count : 0), 0)
  const C2 = c2c !== undefined && c2c.count === c2Count && c2Gap <= TOL.c2

  // C3
  const c3Levels = (['wilson', 'plain'] as const).map(set => {
    const a = s1.find(s => s.section === 'first' && s.set === set && !s.gauge)
    const b = s1.find(s => s.section === 'first' && s.set === set && s.gauge)

    if (!a || !b || a.levels.length !== b.levels.length) {
      return Infinity
    }

    const oa = a.levels.map(l => l.offset).sort((x, y) => x - y)
    const ob = b.levels.map(l => l.offset).sort((x, y) => x - y)

    return oa.reduce((m, x, i) => Math.max(m, Math.abs(x - ob[i]!)), 0)
  })
  const c3s = byName('c3 slab')
  const c3r = byName(`step2 first L ${plan.c3L}`)
  const c3D3 = c3s && c3r ? rel(c3s.D3, c3r.D3) : Number.NaN
  // with no window level on either field, D3 is the empty determinant (1) on both: the slab clause is then the equal
  // (zero) count, and the nearest level read by Krylov on both agrees within the two residual estimates
  const c3Slab =
    c3s !== undefined &&
    c3r !== undefined &&
    c3s.count === c3r.count &&
    c3D3 <= TOL.c3 &&
    (c3s.count > 0 ||
      (c3s.krylov !== undefined &&
        c3r.krylov !== undefined &&
        Math.abs(c3s.krylov.nearest - c3r.krylov.nearest) <=
          c3s.krylov.nearestResidual + c3r.krylov.nearestResidual))
  const C3 = c3Levels.every(x => x <= TOL.c3) && (premise === 'kill' || c3Slab)

  // STEP 2
  const step2 = (['first', 'weyl'] as const).flatMap(section =>
    plan.Ls.map(L => byName(`step2 ${section} L ${L}`)),
  )
  const step2Read = step2.every(
    s => s !== undefined && s.count === plan.pairs && s.wallShareMin >= plan.wallShare,
  )
  const controls = C1 && C2 && C3 && I
  const status: Verdict['status'] =
    premise === 'kill' && I && c3Levels.every(x => x <= TOL.c3)
      ? 'fail'
      : premise === 'open' && controls && step2Read
        ? 'pass'
        : 'partial'

  const s1Line = s1
    .map(
      s =>
        `${s.section}/${s.set}${s.gauge ? '/gauge' : ''}: ${s.levels.length} in 0.2${s.levels.length > 0 ? ` (nearest ${Math.abs(s.levels[0]!.offset).toExponential(3)}, participation ${s.levels[0]!.participation.toFixed(3)})` : ''}, top Ritz ${s.nearest.toFixed(4)}${s.complete ? '' : ' INCOMPLETE'}`,
    )
    .join('; ')
  const s2Line = step2
    .filter((s): s is SlabStage => s !== undefined)
    .map(s =>
      s.count === plan.pairs
        ? `${s.label}: ${s.count} levels, wall share >= ${s.wallShareMin.toFixed(3)}, D3 ${s.D3.toExponential(4)}, D3/delta^3 ${(s.D3 / s.deltaRef ** 3).toExponential(4)}`
        : `${s.label}: ${s.count} levels within ${s.window} (not ${plan.pairs}: stop), Krylov ${s.krylov ? `${s.krylov.count}, complete ${s.krylov.complete}, nearest ${s.krylov.nearest.toFixed(4)} +- ${s.krylov.nearestResidual.toExponential(1)}` : 'not run'}`,
    )
    .join('; ')
  const metrics: Record<string, number> = {
    premiseOpen: flag(premise === 'open'),
    premiseKill: flag(premise === 'kill'),
    premiseDisagree: flag(premise === 'disagree'),
    C1: flag(C1),
    C2: flag(C2),
    C3: flag(C3),
    I: flag(I),
    c2Gap,
    c3D3,
    c3LevelsWilson: c3Levels[0]!,
    c3LevelsPlain: c3Levels[1]!,
  }

  plan.Ls.forEach((L, i) => {
    metrics[`c1Delta${L}`] = c1Delta[i]!
    metrics[`c1D3_${L}`] = c1D3[i]!
    metrics[`c1D3eps${L}`] = c1D3eps[i]!
  })
  s1.forEach(s => {
    metrics[`nearest_${s.section}_${s.set}${s.gauge ? '_gauge' : ''}`] = s.nearest
    metrics[`window_${s.section}_${s.set}${s.gauge ? '_gauge' : ''}`] = s.levels.length
  })
  step2.forEach(s => {
    if (s) {
      metrics[`D3_${s.label.replace(/ /g, '_')}`] = s.D3
      metrics[`count_${s.label.replace(/ /g, '_')}`] = s.count
    }
  })

  return verdict({
    status,
    claim: `STEP 1 (side-8 bulk, window 0.2): premise ${premise} (first ${perSection.first}, weyl ${perSection.weyl}); ${s1Line}. STEP 2: ${s2Line || 'not read'}. Controls: C1 ${C1} (delta ${c1Delta.map(x => x.toExponential(1)).join(', ')}; D3 ${c1D3.map(x => x.toExponential(1)).join(', ')}), C2 ${C2} (${c2Gap.toExponential(1)}), C3 ${C3}, I ${I}.`,
    metrics,
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), I: flag(I) },
    notes:
      'The colour is frozen (no action, C* deferred), read in the 4D bulk and on a hand-placed slab, never on the husk. A level count in a window is not a gap criterion (decision 008 point 7). D3 is the A-to-B block of the window levels; it equals the pair-splitting product only when the wall-A projector splits each pair at 45 degrees.',
  })
}

export function colorSlabRun(plan: ColorSlabPlan): Verdict {
  const stages: Stage[] = step1Specs(plan).map(s => s.run())
  const { premise } = premiseOf(plan, stages)

  if (premise !== 'kill' && premise !== 'disagree') {
    stages.push(...controlSpecs(plan).map(s => s.run()))
    stages.push(...step2Specs(plan).map(s => s.run()))
  }

  return colorSlabVerdict(plan, stages)
}

export default experiment({
  id: 'gauge/color-slab',
  code: 'E-FRC-0294',
  title:
    "explores whether R*'s own frozen colour (E-SPN-0132's links lifted to Sigma(648)) keeps the register bulk gap at pi and what the colour-singlet mass spurion D3 is on the coloured wall slab, partial: the bulk gap stays open under both centre sections (no level within 0.2, the nearest 0.46 Wilson and 0.76 plain), so the field has no gap-closing region, but the coloured chiral slab holds no level within 0.1 of pi at L 8, 12 and 16 (the nearest at the Wilson bulk edge, 0.45 to 0.49): the rough field removes the wall doublet and D3 is not formed",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return colorSlabRun(COLOR_SLAB_PLAN)
  },
})
