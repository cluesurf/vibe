// THE TWO COLOUR GATES ON A STATIC Sigma(648) FIELD, AND THEIR CONTROLS (E-FRC-0296, note/project/vibe/roadmap/moving-matter
// item 0055, decision 012 point 4: the MVP of route 2, colour with an action). One harness (code/measure/color-gates
// colorGates) reads, for any field of one Sigma(648) element per directed D4 link (reverse = inverse):
//   W  the coloured chiral slab 8^3 x L at L 8 and 12 (E-FRC-0294's instrument): levels within 0.1 of pi with wall weight
//      at least 0.9 (W-PASS: 24, the colour-free count, at both L), levels within 0.2, and the side-8 bulk box's levels
//      within 0.2 and nearest level (W-FAIL: no slab level within 0.2 and no bulk level there)
//   C  E-SPN-0196's caging read exactly (side 20, 64 beats, rest packet sigma 1, role 0, slope over beats 16 to 64):
//      speed ratio of the triplet carriage on the field over the trivial carriage, caged below 0.9
//   P  the mean triangle plaquette Re Tr U / 3 over every D4 triangle, with its Sigma(648) class histogram
// The gates themselves are read on candidate fields by 0057 (the beta scan) and 0058 (centre flux). This experiment is the
// harness's PROOF: its controls, fixed 2026-10-08 before any read (the brief).
//
// CONTROLS
//  CF identity links: W-PASS (24 within 0.1 with wall weight >= 0.9 at L 8 and 12), not caged (ratio >= 0.9), P = 1 to
//     1e-12.
//  CR R*'s own lifted hash, section 'first': W-FAIL (no slab level within 0.2 at L 8 and 12, no bulk level within 0.2)
//     with the L 8 slab's nearest level 0.4736 within 1e-3 (E-FRC-0294), and caged with E-SPN-0196's ratio reproduced
//     (0.3004 within 5e-5, its printed precision).
//  CG a site-wise gauge transform of CR (the element of dock x an integer Weyl stream over the 648, offset 1): W, C and P
//     unchanged. W: the same verdict and counts, each nearest level within the two residual estimates. P: the mean to 1e-12
//     and the class histogram exactly. C: the role-traced ratio (probability summed over the three role starts, exactly
//     gauge invariant) to 1e-10; the gated role-0 ratio is NOT exactly invariant (the role-0 start is not a gauge
//     covariant state: G^dag psi0 carries a different role at every dock), so it is held to the same side of 0.9 and its
//     shift is reported.
// INSTRUMENT (a failure is partial): the product table matches the float elements to 1e-12; every field keeps reverse =
//  inverse exactly (index check); the caging box's weave mesh equals the bulk box's; every caging run keeps its norm to
//  1e-10; the free run is unsaturated (E-SPN-0196's S); every window read complete.
//
// DETERMINISM: no random numbers ('random' gauge = an integer Weyl stream). Depth L2: a lattice-fermion spectral read and a
// lattice-gauge caging read of a static colour field.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  bulkWallRead,
  cageRead,
  GATES_PLAN,
  sigmaTable,
  slabWallRead,
  wallVerdict,
  type BulkWallRead,
  type CageRead,
  type GatesPlan,
  type SlabWallRead,
} from '@/code/measure/color-gates'
import { GATE_FIELDS, type FieldName } from '@/code/measure/color-gate-fields'

const REF = { slabNearest8: 0.4736, slabNearestTol: 1e-3, ratio: 0.3004, ratioTol: 5e-5 }
const TOL = { table: 1e-12, plaquette: 1e-12, roleTrace: 1e-10, norm: 1e-10 }

export type GateStage =
  | { kind: 'slab'; field: FieldName; read: SlabWallRead }
  | { kind: 'bulk'; field: FieldName; read: BulkWallRead }
  | { kind: 'cage'; field: FieldName; read: CageRead }

export type GateStageSpec = { name: string; run: () => GateStage }

export function gateSpecs(plan: GatesPlan): GateStageSpec[] {
  const out: GateStageSpec[] = []

  for (const field of Object.keys(GATE_FIELDS) as FieldName[]) {
    const f = GATE_FIELDS[field]

    for (const L of plan.Ls) {
      out.push({ name: `${field}-slab-${L}`, run: () => ({ kind: 'slab', field, read: slabWallRead(f, plan, L) }) })
    }

    out.push({ name: `${field}-bulk`, run: () => ({ kind: 'bulk', field, read: bulkWallRead(f, plan) }) })
    out.push({
      name: `${field}-cage`,
      run: () => ({ kind: 'cage', field, read: cageRead(f, plan, field !== 'cf') }),
    })
  }

  return out
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function colorGatesVerdict(plan: GatesPlan, stages: readonly GateStage[]): Verdict {
  const slabs = (f: FieldName): SlabWallRead[] =>
    plan.Ls.map(L =>
      stages.find((s): s is Extract<GateStage, { kind: 'slab' }> => s.kind === 'slab' && s.field === f && s.read.L === L)
        ?.read,
    ).filter((s): s is SlabWallRead => s !== undefined)
  const bulk = (f: FieldName): BulkWallRead | undefined =>
    stages.find((s): s is Extract<GateStage, { kind: 'bulk' }> => s.kind === 'bulk' && s.field === f)?.read
  const cage = (f: FieldName): CageRead | undefined =>
    stages.find((s): s is Extract<GateStage, { kind: 'cage' }> => s.kind === 'cage' && s.field === f)?.read
  const names: FieldName[] = ['cf', 'cr', 'cg']
  const have = names.every(f => slabs(f).length === plan.Ls.length && bulk(f) && cage(f))

  if (!have) {
    return verdict({
      status: 'partial',
      claim: `missing stages: ${names.filter(f => !(slabs(f).length === plan.Ls.length && bulk(f) && cage(f))).join(', ')}`,
      metrics: {},
    })
  }

  const W = Object.fromEntries(names.map(f => [f, wallVerdict(plan, slabs(f), bulk(f)!)])) as Record<FieldName, string>
  const C = Object.fromEntries(names.map(f => [f, cage(f)!])) as Record<FieldName, CageRead>
  const P = Object.fromEntries(names.map(f => [f, bulk(f)!.plaquette])) as Record<FieldName, BulkWallRead['plaquette']>

  // CF
  const CF = W.cf === 'hold' && C.cf.ratio >= plan.cagedBelow && Math.abs(P.cf.mean - 1) <= TOL.plaquette

  // CR
  const cr8 = slabs('cr').find(s => s.L === 8)
  const crNearest = cr8 ? Math.abs(cr8.nearest - REF.slabNearest8) : Infinity
  const crRatio = Math.abs(C.cr.ratio - REF.ratio)
  const CR =
    W.cr === 'fail' && crNearest <= REF.slabNearestTol && C.cr.ratio < plan.cagedBelow && crRatio <= REF.ratioTol

  // CG
  const pairs = slabs('cr').map((a, i) => [a, slabs('cg')[i]!] as const)
  const wSame =
    W.cg === W.cr &&
    pairs.every(
      ([a, b]) =>
        a.near === b.near &&
        a.far === b.far &&
        Math.abs(a.nearest - b.nearest) <= a.nearestResidual + b.nearestResidual,
    ) &&
    bulk('cr')!.count === bulk('cg')!.count &&
    bulk('cr')!.sets.every((s, i) => {
      const t = bulk('cg')!.sets[i]!

      return Math.abs(s.nearest - t.nearest) <= s.nearestResidual + t.nearestResidual
    })
  const pGap = Math.abs(P.cr.mean - P.cg.mean)
  const histSame = P.cr.histogram.every((n, i) => n === P.cg.histogram[i])
  const traceGap = Math.abs((C.cr.ratioRoleTrace ?? NaN) - (C.cg.ratioRoleTrace ?? NaN))
  const role0Shift = Math.abs(C.cr.ratio - C.cg.ratio)
  const CG =
    wSame &&
    pGap <= TOL.plaquette &&
    histSame &&
    traceGap <= TOL.roleTrace &&
    C.cr.ratio < plan.cagedBelow === C.cg.ratio < plan.cagedBelow

  // instrument
  const t = sigmaTable()
  const allSlabs = names.flatMap(slabs)
  const I =
    t.tableGap <= TOL.table &&
    allSlabs.every(s => s.reverseBad === 0 && s.complete) &&
    names.every(f => bulk(f)!.reverseBad === 0 && bulk(f)!.sets.every(s => s.complete)) &&
    names.every(f => C[f].reverseBad === 0 && C[f].meshMatch && C[f].normDrift <= TOL.norm && C[f].unsaturated)

  const status: Verdict['status'] = CF && CR && CG && I ? 'pass' : 'partial'
  const row = (f: FieldName): string => {
    const s = slabs(f)
      .map(r => `L ${r.L}: ${r.near} near / ${r.far} far, nearest ${r.nearest.toFixed(4)} (${r.seconds.toFixed(0)} s)`)
      .join(', ')
    const b = bulk(f)!

    return `${f}: W ${W[f]} [${s}; bulk ${b.count} far, nearest ${b.sets.map(x => `${x.set} ${x.nearest.toFixed(4)}`).join(' ')} (${b.seconds.toFixed(0)} s)]; C ratio ${C[f].ratio.toFixed(4)}${C[f].ratioRoleTrace !== undefined ? ` (role trace ${C[f].ratioRoleTrace!.toFixed(4)})` : ''} ${C[f].ratio < plan.cagedBelow ? 'caged' : 'free'} (${C[f].seconds.toFixed(0)} s); P ${P[f].mean.toFixed(6)} over ${P[f].triangles} triangles`
  }
  const metrics: Record<string, number> = {
    CF: flag(CF),
    CR: flag(CR),
    CG: flag(CG),
    I: flag(I),
    crNearestGap: crNearest,
    crRatioGap: crRatio,
    cgPlaquetteGap: pGap,
    cgRoleTraceGap: traceGap,
    cgRole0Shift: role0Shift,
    tableGap: t.tableGap,
  }

  for (const f of names) {
    metrics[`${f}Ratio`] = C[f].ratio
    metrics[`${f}P`] = P[f].mean
    metrics[`${f}Seconds`] =
      slabs(f).reduce((s, r) => s + r.seconds, 0) + bulk(f)!.seconds + C[f].seconds

    for (const s of slabs(f)) {
      metrics[`${f}Near${s.L}`] = s.near
      metrics[`${f}Far${s.L}`] = s.far
      metrics[`${f}Nearest${s.L}`] = s.nearest
    }
  }

  return verdict({
    status,
    claim: `colour gates harness, controls CF ${CF}, CR ${CR} (L 8 nearest gap ${crNearest.toExponential(1)}, ratio gap ${crRatio.toExponential(1)}), CG ${CG} (P ${pGap.toExponential(1)}, histogram ${histSame}, role trace ${traceGap.toExponential(1)}, role-0 shift ${role0Shift.toExponential(1)}), I ${I}. ${names.map(row).join('. ')}.`,
    metrics,
    control: { CF: flag(CF), CR: flag(CR), CG: flag(CG), I: flag(I) },
    notes:
      'Static fields only: the gates are read on a frozen colour in the 4D bulk and on a hand-placed slab, never on the husk. The class histogram is over Sigma(648) conjugacy classes in sigmaTable() order.',
  })
}

export function colorGatesRun(plan: GatesPlan): Verdict {
  return colorGatesVerdict(plan, gateSpecs(plan).map(s => s.run()))
}

export default experiment({
  id: 'gauge/color-gates',
  code: 'E-FRC-0296',
  title:
    'explores whether one harness reads the two colour gates of decision 012 (walls W, caging C) and the plaquette P on any static Sigma(648) field, checked on identity links, on the rule\'s own lifted hash and on its gauge transform',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return colorGatesRun(GATES_PLAN)
  },
})
