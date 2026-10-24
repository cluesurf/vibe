// THE LAMBDA^3 WALKER AT ITS OWN CHARGE 3 (E-FRC-0306, note/project/vibe/roadmap/moving-matter item 0091, decision 020
// gate G1, the reversal gate of the one-walker reading). In the walker reading the electron is ONE fear Lambda^3 walker,
// colour-blind because det R = 1, and its charge is 3 in units of a role's third. Every wall result so far (E-FRC-0295's
// pump, E-SPN-0197's g, E-SPN-0198/0199's leak) was read at probe charge 1. This experiment explores whether the wall, its
// pump, its g and its leak survive when every U(1) probe phase is multiplied by 3.
//
// THE CHARGE. The probe enters every link slot as one U(1) angle (code/measure/color-pump pumpPhases, code/measure/
// wall-g-factor fieldOps). Charge q multiplies every angle by q:
//   pump   quanta 1 -> q (the walker sees q flux quanta) and theta -> q theta (the external twist loop winds the walker's
//          twist q times). theta_j = 2 pi j / 16, so q theta_j = theta_(q j mod 16) up to 2 pi on each wrap link: the
//          charge-3 loop is the flux-3 family visited in the order 3 j mod 16 (witnessed slot by slot, twistAlias)
//   g      B = 2 pi p / qa with the charge folded in: p -> q p, the same qa
//   leak   zero field: p = 0 -> q 0 = 0, so the operator is the charge-1 one
// THE LINKS. det R of R*'s frozen colour (section first and weyl, E-SPN-0132's Weyl-hash links lifted to Sigma(648)) per
// link, k = 1, times the probe; against the colour-free identity link, k = 1 (one component).
//
// THE READS (per component, k 1):
//   STEP 0 (instrument, charge 1)  the det-R probe links equal the colour-free ones to 1e-12; the colour-free pump loop at
//                                  L 8 and 12 (A -2, B +2, E-FRC-0295's stage files, one stage recomputed to 1e-9);
//                                  E-SPN-0197's g at L 12 recomputed (|g - 2| <= 7.2e-4, eps0 to 1e-9 relative)
//   STEP 1 (charge 3)              the flux-3 family at theta_j, j 0 .. 16, L 8 and 12, colour-free; det-R probe links
//                                  equal to colour-free to 1e-12 at every j, and two det-R eigen reads (first L 8 j 0,
//                                  weyl L 8 j 4) equal to the colour-free offsets to 1e-9. Flows: the flux-3 loop (natural
//                                  order, twist winding 1) and the charge-3 loop (order 3 j mod 16, twist winding 3); and
//                                  the twist-only loop (charge-1 stages in order 3 j mod 16, flux 1, winding 3)
//   STEP 2 (charge 3)              E-SPN-0197's Landau zero-level read at p 3, qa 48, 64, 96, L 12, 14, 16, want 12
//                                  (4 zero-level states per orbit centre); where tripled flux leaves a row unresolved,
//                                  the brief's larger qa: charge 3 at qa 144, 192, 288 is charge 1 at 48, 64, 96 on a
//                                  3-centre cell (the fold, witnessed per L by one (qa 144, p 3) read to 1e-9)
//   STEP 3                         delta(L) of the slab nW = ceil(L / 2), nP = floor(L / 2) (chiralSlab's own profile)
//                                  at charge 3 and charge 1, L 10 .. 20, beside the frozen three-root law (E-SPN-0199) and
//                                  delta^3
// WALL INDEX. The signed pump per wall divided by the flux quanta the walker sees and by its twist winding: the number of
// chiral branches per flux quantum each crossing pi once per 2 pi of the walker's own twist. Charge 1: net / 1. Flux-3
// loop: net / 3. Charge-3 loop: net / 9. The raw nets are reported beside it, so another normalization can be re-read.
// GATES (fixed 2026-10-09 by the lead in item 0091, copied, never changed):
//   KEEP     the wall index unchanged and nonzero, the charge-3 pump exactly 3 times the charge-1 pump per component
//            (A -6, B +6, integer to 1e-9), |g - 2| <= 2e-3 on every resolved L, and m(L) = charge-1 delta(L) to 1e-9
//            relative
//   REVERSE  the wall index 0 or changed, or the pump not an integer multiple, or |g - 2| > 0.05 on every resolved L
//   OPEN     otherwise (named), or an instrument fails
//
// DETERMINISM: no random numbers. Depth L2: a lattice-fermion spectral flow and Landau read on the rule's own walk.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { gridLifts, roleLinks, type GridLifts } from '@/code/measure/holonomy-caging'
import { type ColorWeave } from '@/code/rule/color-weave'
import { wallADepths } from '@/code/measure/wall-stream'
import {
  colorOp,
  colorPieces,
  identityLinks,
  linkGaps,
  linksOf,
  reductionGaps,
  slabBox,
  slabWeave,
  wallWindows,
  type ColorBox,
  type ColorLinks,
  type ColorPieces,
} from '@/code/measure/color-slab'
import {
  phaseWitness,
  probeLinks,
  pumpFlow,
  pumpPhases,
  pumpRead,
  type PhaseWitness,
  type PumpFlow,
  type PumpStepRead,
} from '@/code/measure/color-pump'
import {
  fieldRead,
  intercepts,
  labelSets,
  levelOf,
  pairLevels,
  readMember,
  slabOps,
  wallSpec,
  type FieldRead,
} from '@/code/measure/wall-g-factor'
import { asymmetricSlab, pathModel, type Path, type PathFit } from '@/code/measure/wall-leak-channels'
import type { Slab } from '@/code/measure/wilson-register'

export type Section = 'first' | 'weyl'
export type Field = 'cf' | Section

export const CHARGE_THREE_PLAN = {
  charge: 3,
  // E-FRC-0295's pump plan, copied (an experiment never imports another)
  side: 8,
  loopSteps: 16,
  window: 0.2,
  wallShare: 0.9,
  krylov: 160,
  cluster: { block: 64, degree: 40, cut: 0.4, maxPasses: 8, tol: 1e-11 },
  pumpLs: [8, 12],
  detReads: [
    { section: 'first' as Section, L: 8, j: 0 },
    { section: 'weyl' as Section, L: 8, j: 4 },
  ],
  repro: { L: 8, j: 0 },
  // E-SPN-0197's Landau read, copied
  fields: [48, 64, 96],
  gLs: [12, 14, 16],
  gRepro: 12,
  h2: 1e-3,
  // E-SPN-0197's instrument terms of res_kappa (its I1 worst |mu'| and I3 shift per B), read from its saved stages
  // (tmp/q3-ins.ts) and copied, since this run does not repeat the bulk instruments
  i1Mu: 1.0686663729717417e-13,
  i3PerB: 3.1938069926362815e-15,
  leakLs: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  // E-SPN-0199's frozen three-root law (test/record/E-FRC-0306/leak-fresh-frozen-20261009T032809Z.json), copied verbatim
  law: {
    paths: [
      { kappa: 0.8627238544013857, qs: [3.141592653589793], side: 0 },
      { kappa: 0.9602606684249657, qs: [1.0414631042336222], side: 0 },
      { kappa: 0.9707309943038691, qs: [0, 3.141592653589793], side: 1 },
    ] as Path[],
    coefficients: [-0.01670739260542085, -0.5943073194941031, -0.21289072815575694, 0.6978459098291303, 0.00004424567756717967],
  },
}

export type ChargeThreePlan = typeof CHARGE_THREE_PLAN

export const GATE = {
  integer: 1e-9,
  link: 1e-12,
  offsets: 1e-9,
  closure: 1e-10,
  phase: 1e-12,
  gKeep: 2e-3,
  gReverse: 0.05,
  gRepro: 7.2e-4,
  eps0Repro: 1e-9,
  leak: 1e-9,
  // E-SPN-0197's resolution rule, copied
  res: 1e-3,
  eps: 1e-2,
  witness: 0.02,
  vResidual: 1e-10,
}

export const thetaOf = (plan: ChargeThreePlan, j: number): number => (2 * Math.PI * j) / plan.loopSteps

// ---- shared pieces ----

type Shared = { pieces: ColorPieces; lifts: GridLifts }

let shared: Shared | undefined

function sharedOf(): Shared {
  if (!shared) {
    const cs = chiralSlab(8)

    shared = { pieces: colorPieces(cs.sets[0]!, cs.ranges[0]!.sR, cs.ranges[0]!.dR), lifts: gridLifts() }
  }

  return shared
}

type C = [number, number]

// det of the 3 x 3 (18 floats, re im interleaved, row major) at offset o
function det3(m: Float64Array, o: number): C {
  const a = (i: number, j: number): C => [m[o + 2 * (3 * i + j)]!, m[o + 2 * (3 * i + j) + 1]!]
  const mul = (x: C, y: C): C => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
  const sub = (x: C, y: C): C => [x[0] - y[0], x[1] - y[1]]
  const t0 = mul(a(0, 0), sub(mul(a(1, 1), a(2, 2)), mul(a(1, 2), a(2, 1))))
  const t1 = mul(a(0, 1), sub(mul(a(1, 0), a(2, 2)), mul(a(1, 2), a(2, 0))))
  const t2 = mul(a(0, 2), sub(mul(a(1, 0), a(2, 1)), mul(a(1, 1), a(2, 0))))

  return [t0[0] - t1[0] + t2[0], t0[1] - t1[1] + t2[1]]
}

// the k = 1 field det R(x, d) of R*'s frozen colour on the slab box, and max |det R - 1|
export function detLinks(box: ColorBox, section: Section): { links: ColorLinks; detGap: number } {
  const w = slabWeave(box)
  const role = roleLinks(w as unknown as ColorWeave, w.links, sharedOf().lifts, section)
  const color = linksOf(box, role)
  const m = new Float64Array(box.cells * 24 * 2)
  let detGap = 0

  for (let l = 0; l < box.cells * 24; l++) {
    const [r, i] = det3(color.m, l * 18)

    m[2 * l] = r
    m[2 * l + 1] = i
    detGap = Math.max(detGap, Math.hypot(r - 1, i))
  }

  return { links: { k: 1, m }, detGap }
}

const maxGap = (a: Float64Array, b: Float64Array): number => {
  let g = a.length === b.length ? 0 : Infinity

  for (let i = 0; i < a.length && g < Infinity; i++) {
    g = Math.max(g, Math.abs(a[i]! - b[i]!))
  }

  return g
}

// the probe field of charge q at loop step j: q flux quanta, twist q theta_j
export const chargeField = (plan: ChargeThreePlan, q: number, j: number) => ({
  side: plan.side,
  quanta: q,
  theta: q * thetaOf(plan, j),
})

// ---- the link witness (no eigen read) ----

export type LinkStage = {
  kind: 'links'
  L: number
  section: Section
  charge: number
  detGap: number
  // max over j of |det R probe links - colour-free probe links|
  linkGap: number
  // max over j and slots of |e^(i phi(q theta_j)) - e^(i phi(theta_(q j mod 16)))| at q flux quanta
  twistAlias: number
}

export function linkStage(plan: ChargeThreePlan, L: number, section: Section, charge: number): LinkStage {
  const box = slabBox(plan.side, L)
  const { links: det, detGap } = detLinks(box, section)
  const id = identityLinks(box, 1)
  let linkGap = 0
  let twistAlias = 0

  for (let j = 0; j <= plan.loopSteps; j++) {
    const phases = pumpPhases(box, chargeField(plan, charge, j))

    linkGap = Math.max(linkGap, maxGap(probeLinks(det, phases).m, probeLinks(id, phases).m))

    const alias = pumpPhases(box, { side: plan.side, quanta: charge, theta: thetaOf(plan, (charge * j) % plan.loopSteps) })

    for (let l = 0; l < phases.length; l++) {
      twistAlias = Math.max(
        twistAlias,
        Math.hypot(Math.cos(phases[l]!) - Math.cos(alias[l]!), Math.sin(phases[l]!) - Math.sin(alias[l]!)),
      )
    }
  }

  return { kind: 'links', L, section, charge, detGap, linkGap, twistAlias }
}

// ---- one pump step ----

export type PumpWitness = {
  pieceGap: number
  reverse: number
  unitary: number
  cycle: number
  cycleDag: number
  metric: number
  phase: PhaseWitness
}

export type QPumpStage = {
  kind: 'pump'
  name: string
  field: Field
  L: number
  // the flux quanta the walker sees, and the twist theta_j (natural order: the charge-3 loop is read by reordering)
  quanta: number
  j: number
  read: PumpStepRead
  seconds: number
  witness: PumpWitness
  detGap?: number
}

export function qPumpStage(plan: ChargeThreePlan, field: Field, L: number, quanta: number, j: number): QPumpStage {
  const t0 = Date.now()
  const { pieces } = sharedOf()
  const box = slabBox(plan.side, L)
  const profile = [...chiralSlab(L).slab.profile]
  const det = field === 'cf' ? undefined : detLinks(box, field)
  const base = det ? det.links : identityLinks(box, 1)
  const f = { side: plan.side, quanta, theta: thetaOf(plan, j) }
  const phases = pumpPhases(box, f)
  const links = probeLinks(base, phases)
  const op = colorOp(box, links, pieces, profile)
  const read = pumpRead(op, {
    window: plan.window,
    krylov: plan.krylov,
    cluster: plan.cluster,
    expectEmpty: false,
    windows: wallWindows(L),
    halfA: wallADepths(L),
    eigenTol: 1e-9,
  })

  return {
    kind: 'pump',
    name: `${field}-q${quanta}-${L}-${j}`,
    field,
    L,
    quanta,
    j,
    read,
    seconds: (Date.now() - t0) / 1000,
    witness: { pieceGap: pieces.pieceGap, ...linkGaps(box, links), ...reductionGaps(op), phase: phaseWitness(box, f, phases) },
    ...(det ? { detGap: det.detGap } : {}),
  }
}

// ---- the flows ----

export type LoopFlow = {
  label: string
  L: number
  quanta: number
  winding: number
  flow: PumpFlow
  // the wall index: net / (quanta winding) per wall
  indexA: number
  indexB: number
}

// a loop over the stages of one (field, L, quanta) family, visiting theta_(winding j mod 16), j = 0 .. 16 (j 16 the
// family's own j 16 stage, so the closure compares theta 0 against theta 2 pi)
export function loopFlow(
  plan: ChargeThreePlan,
  stages: readonly QPumpStage[],
  field: Field,
  L: number,
  quanta: number,
  winding: number,
): LoopFlow | undefined {
  const fam = new Map(
    stages.filter(s => s.field === field && s.L === L && s.quanta === quanta).map(s => [s.j, s] as const),
  )
  const order = Array.from({ length: plan.loopSteps + 1 }, (_, j) =>
    j === plan.loopSteps ? plan.loopSteps : (winding * j) % plan.loopSteps,
  )

  if (order.some(j => !fam.has(j))) {
    return undefined
  }

  const flow = pumpFlow(
    order.map(j => {
      const r = fam.get(j)!.read

      return { ...r, raw: r.raw ?? [] }
    }),
    plan.window,
    plan.wallShare,
  )

  return {
    label: `${field} L ${L} flux ${quanta} winding ${winding}`,
    L,
    quanta,
    winding,
    flow,
    indexA: flow.netA / (quanta * winding),
    indexB: flow.netB / (quanta * winding),
  }
}

// ---- g at charge q (E-SPN-0197's wall stage and row, copied, the charge folded into p) ----

export type GStage = {
  kind: 'g'
  L: number
  charge: number
  delta: number
  Lambda: number
  M2: number
  v2: number
  reads: FieldRead[]
  seconds: number
}

export function wallDepths(L: number): Set<number> {
  const cs = chiralSlab(L)

  return new Set([...cs.aDepths, ...[-3, -2, -1, 0, 1, 2].map(x => ((x % L) + L) % L)])
}

export function gStage(plan: ChargeThreePlan, L: number, charge: number): GStage {
  const t0 = Date.now()
  const cs = chiralSlab(L)
  const spec = wallSpec(cs, 0)
  const { ops } = slabOps(spec)
  const p = pairLevels(ops)
  const lg = readMember(ops, p.upper, Math.abs(p.delta) / 10, 'log')
  const gap = ops.phases.map(levelOf).map((E, k) => ({ E, k })).filter(x => Math.abs(x.E) < 0.1)
  const base = gap.map(x => ops.vecs[x.k]!)
  const depths = wallDepths(L)
  const want = 4 * charge
  const reads = plan.fields.map(qa => {
    const slab: Slab = { L, qa, p: charge, profile: cs.slab.profile }

    return fieldRead(slab, spec.sets, base, want, {
      depths,
      fill: 8,
      h: plan.h2,
      resolve: want + 12,
      labels: labelSets(slab, base, gap.map(x => x.E)),
    })
  })

  return {
    kind: 'g',
    L,
    charge,
    delta: p.delta,
    Lambda: p.Lambda,
    M2: lg.M2,
    v2: p.delta / lg.M2,
    reads,
    seconds: (Date.now() - t0) / 1000,
  }
}

// THE FOLD WITNESS. The charge enters g only through qB = 2 pi (q p) / qa, so charge q at qa' = q qa sees the field of
// charge 1 at qa, on a magnetic cell q times longer holding q orbit centres. E-SPN-0197's I4 read (qa 96, p 2) against
// (qa 48, p 1) to 1e-10. One field read at (q qa, p q) against the charge-1 (qa, p 1) eps0 witnesses the fold for this
// walker; the charge-3 rows at qa 144, 192, 288 are then E-SPN-0197's rows
export type GFieldStage = { kind: 'gfield'; L: number; charge: number; qa: number; read: FieldRead; seconds: number }

export function gFieldStage(plan: ChargeThreePlan, L: number, charge: number, qa: number): GFieldStage {
  const t0 = Date.now()
  const cs = chiralSlab(L)
  const spec = wallSpec(cs, 0)
  const { ops } = slabOps(spec)
  const gap = ops.phases.map(levelOf).map((E, k) => ({ E, k })).filter(x => Math.abs(x.E) < 0.1)
  const base = gap.map(x => ops.vecs[x.k]!)
  const want = 4 * charge
  const slab: Slab = { L, qa, p: charge, profile: cs.slab.profile }
  const read = fieldRead(slab, spec.sets, base, want, {
    depths: wallDepths(L),
    fill: 8,
    h: plan.h2,
    resolve: want + 12,
    labels: labelSets(slab, base, gap.map(x => x.E)),
  })

  return { kind: 'gfield', L, charge, qa, read, seconds: (Date.now() - t0) / 1000 }
}

export type GRow = {
  L: number
  charge: number
  delta: number
  eps: number
  B: number[]
  eps0: number[]
  muQuad: number
  spread: number
  a: number
  g: number
  witnessQuad: number
  resKappa: number
  vResidual: number
  resolved: boolean
}

// kappa_P = mu' Lambda / q and a_w = 2 M2 mu' / q with mu' per unit of the walker's own qB (the code's B), so q = 1 here
export function gRow(plan: ChargeThreePlan, s: GStage): GRow {
  const Bs = s.reads.map(r => r.B)
  const mu = s.reads.map(r => (s.delta - r.eps0) / r.B)
  const ic = intercepts(Bs, mu)
  const witness = s.reads.map(r => (r.zero.E1 ** 2 - r.eps0 ** 2) / (2 * r.B) / s.v2)
  const witnessQuad = intercepts(Bs, witness).quad
  const eps = Math.abs(s.delta) / s.Lambda
  const resKappa = s.Lambda * Math.max(ic.spread, plan.i1Mu, plan.i3PerB)
  const vResidual = Math.max(...s.reads.flatMap(r => [r.zero.vResidual, r.minus.vResidual, r.plus.vResidual]))
  const a = 2 * s.M2 * ic.quad

  return {
    L: s.L,
    charge: s.charge,
    delta: s.delta,
    eps,
    B: Bs,
    eps0: s.reads.map(r => r.eps0),
    muQuad: ic.quad,
    spread: ic.spread,
    a,
    g: 2 + 2 * a,
    witnessQuad,
    resKappa,
    vResidual,
    resolved:
      resKappa <= GATE.res &&
      eps <= GATE.eps &&
      Math.abs(witnessQuad - 1) <= GATE.witness &&
      vResidual <= GATE.vResidual,
  }
}

// ---- the leak at charge q ----

export type LeakRow = {
  L: number
  nW: number
  nP: number
  m3: number
  m1: number
  law: number
  rel: number
  inGap: number
}

const leakAt = (nW: number, nP: number, charge: number): { delta: number; inGap: number } => {
  const cs = asymmetricSlab(nW, nP)
  // the walker's field is charge times the slab's own field, which is 0 here
  const slab: Slab = { ...cs.slab, p: charge * cs.slab.p }
  const { ops } = slabOps(wallSpec({ ...cs, slab }, 0))
  const p = pairLevels(ops)

  return { delta: p.delta, inGap: p.inGap.length }
}

export function leakRow(plan: ChargeThreePlan, L: number): LeakRow {
  const nW = Math.ceil(L / 2)
  const nP = L - nW
  const q3 = leakAt(nW, nP, plan.charge)
  const q1 = leakAt(nW, nP, 1)
  const fit: PathFit = { x: plan.law.coefficients, amplitudes: plan.law.paths.map(() => 0), rmsLog: 0 }

  return {
    L,
    nW,
    nP,
    m3: q3.delta,
    m1: q1.delta,
    law: pathModel(fit, plan.law.paths, { nW, nP }).value,
    rel: Math.abs(q3.delta - q1.delta) / Math.abs(q1.delta),
    inGap: q3.inGap,
  }
}

// ---- the verdict ----

export type ChargeThreeStages = {
  // charge-1 colour-free loops (E-FRC-0295's stage files or fresh), the charge-3 colour-free loops, det-R eigen reads
  pumps: QPumpStage[]
  links: LinkStage[]
  g: GStage[]
  leak: LeakRow[]
  // the fold: charge-1 wall stages at qa 48, 64, 96 read as charge 3 at qa 144, 192, 288, admitted only when the
  // witnesses (one (3 qa, p 3) field read per L against the charge-1 (qa, p 1) eps0) hold to 1e-9 relative
  folded: GStage[]
  foldGaps: number[]
  // instrument: one charge-1 stage recomputed against its stored copy, and E-SPN-0197's stored L 12 eps0
  reproOffsetGap: number
  gReproEps0Gap: number
}

const flag = (b: boolean): number => (b ? 1 : 0)
const isInt = (x: number): boolean => Number.isFinite(x) && Math.abs(x - Math.round(x)) <= GATE.integer

const witnessOk = (w: PumpWitness, quanta: number): boolean =>
  w.pieceGap <= 1e-13 &&
  w.reverse <= GATE.link &&
  w.unitary <= GATE.link &&
  w.cycle <= GATE.link &&
  w.cycleDag <= GATE.link &&
  w.metric <= GATE.link &&
  w.phase.coordsExact &&
  w.phase.triangle <= GATE.phase &&
  w.phase.reverse <= GATE.phase &&
  w.phase.t2Loop <= GATE.phase &&
  Math.abs(w.phase.quantaRead - quanta) <= 1e-9

export function chargeThreeVerdict(plan: ChargeThreePlan, s: ChargeThreeStages): Verdict {
  const q = plan.charge
  const cf = s.pumps.filter(p => p.field === 'cf')
  const loops = plan.pumpLs.map(L => ({
    L,
    one: loopFlow(plan, cf, 'cf', L, 1, 1),
    twist: loopFlow(plan, cf, 'cf', L, 1, q),
    flux: loopFlow(plan, cf, 'cf', L, q, 1),
    charge: loopFlow(plan, cf, 'cf', L, q, q),
  }))
  const okLoop = (r: LoopFlow | undefined): boolean =>
    r !== undefined && r.flow.complete && r.flow.closure <= GATE.closure && r.flow.bulk === 0
  const loopsOk = loops.every(l => okLoop(l.one) && okLoop(l.twist) && okLoop(l.flux) && okLoop(l.charge))
  // the charge-3 loop is the flux-3 loop wound three times: an identity of the family, read through the pairing
  const windingOk = loops.every(
    l => l.charge && l.flux && l.charge.flow.netA === q * l.flux.flow.netA && l.charge.flow.netB === q * l.flux.flow.netB,
  )
  const witnessesOk = s.pumps.every(p => witnessOk(p.witness, p.quanta))

  // det R
  const detEigen = plan.detReads.map(d => {
    const mine = s.pumps.find(p => p.field === d.section && p.L === d.L && p.j === d.j && p.quanta === q)
    const ref = cf.find(p => p.L === d.L && p.j === d.j && p.quanta === q)
    const a = mine ? [...(mine.read.raw ?? [])].sort((x, y) => x - y) : []
    const b = ref ? [...(ref.read.raw ?? [])].sort((x, y) => x - y) : []

    return mine && ref && a.length === b.length && mine.read.complete
      ? a.reduce((m, x, i) => Math.max(m, Math.abs(x - b[i]!)), 0)
      : Infinity
  })
  const detGap = Math.max(...s.links.map(l => l.detGap))
  const linkGap = Math.max(...s.links.map(l => l.linkGap))
  const twistAlias = Math.max(...s.links.filter(l => l.charge === q).map(l => l.twistAlias))
  const detOk =
    s.links.length > 0 &&
    plan.pumpLs.every(L => [1, q].every(c => s.links.some(l => l.L === L && l.charge === c))) &&
    linkGap <= GATE.link &&
    twistAlias <= GATE.link &&
    detEigen.every(g => g <= GATE.offsets)

  // STEP 0 instruments
  const gRows = s.g.map(g => gRow(plan, g))
  const gRepro = gRows.find(r => r.charge === 1 && r.L === plan.gRepro)
  const step0 =
    s.reproOffsetGap <= GATE.offsets &&
    s.gReproEps0Gap <= GATE.eps0Repro &&
    gRepro !== undefined &&
    gRepro.resolved &&
    Math.abs(gRepro.g - 2) <= GATE.gRepro
  const instruments = step0 && loopsOk && windingOk && witnessesOk && detOk

  // the gates
  const one = loops.map(l => l.one!)
  const chg = loops.map(l => l.charge!)
  const flux = loops.map(l => l.flux!)
  const read = loops.every(l => l.one && l.charge && l.flux)
  const indexUnchanged =
    read &&
    loops.every(
      (l, k) =>
        one[k]!.indexA !== 0 &&
        one[k]!.indexB !== 0 &&
        Math.abs(chg[k]!.indexA - one[k]!.indexA) <= GATE.integer &&
        Math.abs(chg[k]!.indexB - one[k]!.indexB) <= GATE.integer &&
        Math.abs(flux[k]!.indexA - one[k]!.indexA) <= GATE.integer &&
        Math.abs(flux[k]!.indexB - one[k]!.indexB) <= GATE.integer,
    )
  const indexZero = read && chg.some(r => r.indexA === 0 || r.indexB === 0)
  const ratios = read ? loops.flatMap((_, k) => [chg[k]!.flow.netA / one[k]!.flow.netA, chg[k]!.flow.netB / one[k]!.flow.netB]) : []
  const integerMultiple = read && ratios.every(isInt) && ratios.every(r => Math.abs(r - ratios[0]!) <= GATE.integer)
  const pump3 = read && ratios.every(r => Math.abs(r - q) <= GATE.integer)
  const foldOk = s.foldGaps.length === plan.gLs.length && s.foldGaps.every(x => x <= GATE.eps0Repro)
  const foldRows = foldOk ? s.folded.map(g => gRow(plan, g)) : []
  // per L: the direct read (qa 48 .. 96) when resolved, else the folded read (qa 144 .. 288) when resolved
  const g3 = plan.gLs.map(L => {
    const d = gRows.find(r => r.charge === q && r.L === L)
    const f = foldRows.find(r => r.L === L)

    return d?.resolved ? d : f?.resolved ? f : d
  }).filter((r): r is GRow => r !== undefined)
  const g3Resolved = g3.filter(r => r.resolved)
  const gKeep = g3Resolved.length > 0 && g3Resolved.every(r => Math.abs(r.g - 2) <= GATE.gKeep)
  const gReverse = g3Resolved.length > 0 && g3Resolved.every(r => Math.abs(r.g - 2) > GATE.gReverse)
  const leakKeep = s.leak.length === plan.leakLs.length && s.leak.every(r => r.rel <= GATE.leak)

  const keep = indexUnchanged && pump3 && gKeep && leakKeep
  const reverse = indexZero || (read && !indexUnchanged) || (read && !integerMultiple) || gReverse
  let outcome: 'keep' | 'reverse' | 'open'

  if (!instruments) {
    outcome = 'open'
  } else if (keep) {
    outcome = 'keep'
  } else if (reverse) {
    outcome = 'reverse'
  } else {
    outcome = 'open'
  }

  const missing = [
    !pump3 ? `pump ratio ${ratios.map(r => r.toFixed(6)).join('/')} (KEEP asks ${q})` : '',
    g3Resolved.length === 0 ? 'no resolved charge-3 g row' : !gKeep ? 'charge-3 |g - 2| above 2e-3 on a resolved L' : '',
    !leakKeep ? 'leak' : '',
  ].filter(x => x !== '')
  const status: Verdict['status'] = outcome === 'keep' ? 'pass' : outcome === 'reverse' ? 'fail' : 'open'
  const loopLine = (r: LoopFlow | undefined): string =>
    r
      ? `${r.label}: A ${r.flow.netA} B ${r.flow.netB} (index ${r.indexA}, ${r.indexB}), closure ${r.flow.closure.toExponential(1)}, complete ${r.flow.complete}, bulk ${r.flow.bulk}`
      : 'not read'
  const metrics: Record<string, number> = {
    instruments: flag(instruments),
    step0: flag(step0),
    loopsOk: flag(loopsOk),
    windingOk: flag(windingOk),
    witnessesOk: flag(witnessesOk),
    detOk: flag(detOk),
    detGap,
    linkGap,
    twistAlias,
    reproOffsetGap: s.reproOffsetGap,
    gReproEps0Gap: s.gReproEps0Gap,
    indexUnchanged: flag(indexUnchanged),
    integerMultiple: flag(integerMultiple),
    pump3: flag(pump3),
    gKeep: flag(gKeep),
    gReverse: flag(gReverse),
    leakKeep: flag(leakKeep),
  }

  loops.forEach(l =>
    (['one', 'twist', 'flux', 'charge'] as const).forEach(k => {
      const r = l[k]

      if (r) {
        metrics[`netA_${k}_L${l.L}`] = r.flow.netA
        metrics[`netB_${k}_L${l.L}`] = r.flow.netB
      }
    }),
  )
  gRows.forEach(r => {
    metrics[`g_q${r.charge}_L${r.L}`] = r.g
    metrics[`resolved_q${r.charge}_L${r.L}`] = flag(r.resolved)
  })
  s.leak.forEach(r => {
    metrics[`m_L${r.L}`] = r.m3
    metrics[`rel_L${r.L}`] = r.rel
  })

  return verdict({
    status,
    claim: `${outcome.toUpperCase()}${outcome === 'open' && instruments ? ` (${missing.join('; ')})` : ''}. Pump per component (k 1): ${loops
      .map(l => [l.one, l.twist, l.flux, l.charge].map(loopLine).join('; '))
      .join(' | ')}. det R: max |det R - 1| ${detGap.toExponential(1)}, probe links det R vs colour-free ${linkGap.toExponential(1)}, eigen reads ${detEigen.map(g => g.toExponential(1)).join(', ')}; twist alias ${twistAlias.toExponential(1)}. g: ${gRows
      .map(r => `q ${r.charge} L ${r.L} g ${r.g.toFixed(7)} (eps0 ${r.eps0.map(x => x.toExponential(4)).join('/')}, mu' ${r.muQuad.toExponential(3)}, spread ${r.spread.toExponential(1)}, witness ${r.witnessQuad.toFixed(4)}${r.resolved ? '' : ', UNRESOLVED'})`)
      .join('; ')}. Fold (charge 3 at qa 144/192/288 = charge 1 at 48/64/96): witnesses ${s.foldGaps.map(x => x.toExponential(1)).join(', ')} (${foldOk}); ${foldRows
      .map(r => `L ${r.L} g ${r.g.toFixed(7)}${r.resolved ? '' : ', UNRESOLVED'}`)
      .join('; ')}. Leak: ${s.leak
      .map(r => `L ${r.L} m ${r.m3.toExponential(4)} rel ${r.rel.toExponential(1)} law ${r.law.toExponential(4)} delta^3 ${(r.m3 ** 3).toExponential(2)}`)
      .join('; ')}. Instruments: step 0 ${step0} (repro offsets ${s.reproOffsetGap.toExponential(1)}, g eps0 ${s.gReproEps0Gap.toExponential(1)}), loops ${loopsOk}, winding ${windingOk}, witnesses ${witnessesOk}, det ${detOk}.`,
    metrics,
    control: { instruments: flag(instruments), step0: flag(step0), detOk: flag(detOk), windingOk: flag(windingOk) },
    notes:
      'Frozen colour (the committed Weyl link start lifted to Sigma(648)) on a hand-placed slab in the 4D bulk, half +, side 8; never the husk. The U(1) probe is a test field, not part of the rule. g and the leak are read colour-free, which equals the det-R walker because det R = 1 to 1e-15 on every link.',
  })
}

// ---- the whole run ----

export function chargeThreeStages(plan: ChargeThreePlan): ChargeThreeStages {
  const js = Array.from({ length: plan.loopSteps + 1 }, (_, j) => j)
  const pumps: QPumpStage[] = []

  for (const L of plan.pumpLs) {
    for (const quanta of [1, plan.charge]) {
      for (const j of js) {
        pumps.push(qPumpStage(plan, 'cf', L, quanta, j))
      }
    }
  }

  for (const d of plan.detReads) {
    pumps.push(qPumpStage(plan, d.section, d.L, plan.charge, d.j))
  }

  const links = plan.pumpLs.flatMap(L =>
    (['first', 'weyl'] as const).flatMap(section => [1, plan.charge].map(c => linkStage(plan, L, section, c))),
  )
  const g = [gStage(plan, plan.gRepro, 1), ...plan.gLs.map(L => gStage(plan, L, plan.charge))]
  const leak = plan.leakLs.map(L => leakRow(plan, L))
  const folded = plan.gLs.map(L => ({ ...gStage(plan, L, 1), charge: plan.charge }))
  const foldGaps = plan.gLs.map((L, k) => {
    const w = gFieldStage(plan, L, plan.charge, plan.charge * plan.fields[0]!)
    const ref = folded[k]!.reads[0]!.eps0

    return Math.abs(w.read.eps0 - ref) / Math.abs(ref)
  })

  // in-run, the stored copies are the fresh reads themselves
  return { pumps, links, g, leak, folded, foldGaps, reproOffsetGap: 0, gReproEps0Gap: 0 }
}

export default experiment({
  id: 'gauge/charge-three',
  code: 'E-FRC-0306',
  title:
    "explores whether the one-walker electron (the colour-blind Lambda^3 walker, det R = 1) keeps its chiral wall at its own charge 3: R*'s domain-wall slab under a U(1) probe with every phase tripled, read for the Laughlin pump and wall index, the Landau g and the leak, against the same reads at charge 1",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return chargeThreeVerdict(CHARGE_THREE_PLAN, chargeThreeStages(CHARGE_THREE_PLAN))
  },
})
