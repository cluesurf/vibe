// THE COLOUR GATES' CONTROLS WITH THE GAUGE-INVARIANT CAGE READ (E-FRC-0296, moving-matter item 0065, decision 013 point 2).
// The W and P reads are 0055's (test/experiment/gauge/color-gates gateSpecs, wall code unchanged since 0055, so their kept
// stage files are reused); C is now read from rho0 = |x0><x0| (x) I_3/3 (x) s0 (code/measure/color-gates-cage
// dockCageRead), exactly gauge invariant, so CG holds C to rounding again.
//
// CONTROLS (decision 013 point 2, item 0065)
//  CF identity links: W-PASS, C at least 0.9, P = 1 to 1e-12.
//  CR R*'s own lifted hash, section 'first': W-FAIL with the L 8 nearest level 0.4736 within 1e-3, C under 0.9, and the
//     old packet's role-0 ratio (printed diagnostic) still E-SPN-0196's 0.3004 within 5e-5.
//  CG its gauge transform (offset 1): W the same verdict and counts, P to 1e-12 and the class histogram exactly, and C
//     equal to CR's within 1e-10.
// INSTRUMENT: table to 1e-12, reverse = inverse exactly, the weave mesh equals the bulk box, every run keeps its norm to
//  1e-10, the free one-dock run unsaturated, every window read complete.

import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { sigmaTable, wallVerdict, type BulkWallRead, type GatesPlan, type SlabWallRead } from '@/code/measure/color-gates'
import { dockCageRead, type DockCageRead } from '@/code/measure/color-gates-cage'
import { GATE_FIELDS, type FieldName } from '@/test/experiment/gauge/color-gates'

const REF = { slabNearest8: 0.4736, slabNearestTol: 1e-3, packetRatio: 0.3004, packetTol: 5e-5 }
const TOL = { table: 1e-12, plaquette: 1e-12, cage: 1e-10, norm: 1e-10 }

export type DockStage =
  | { kind: 'slab'; field: FieldName; read: SlabWallRead }
  | { kind: 'bulk'; field: FieldName; read: BulkWallRead }
  | { kind: 'dock-cage'; field: FieldName; read: DockCageRead }

export function dockCageSpecs(plan: GatesPlan): { name: string; run: () => DockStage }[] {
  return (Object.keys(GATE_FIELDS) as FieldName[]).map(field => ({
    name: `${field}-dock-cage`,
    run: () => ({ kind: 'dock-cage', field, read: dockCageRead(GATE_FIELDS[field], plan) }),
  }))
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function colorGatesDockVerdict(plan: GatesPlan, stages: readonly DockStage[]): Verdict {
  const names: FieldName[] = ['cf', 'cr', 'cg']
  const slabs = (f: FieldName): SlabWallRead[] =>
    plan.Ls.map(L =>
      stages.find((s): s is Extract<DockStage, { kind: 'slab' }> => s.kind === 'slab' && s.field === f && s.read.L === L)
        ?.read,
    ).filter((s): s is SlabWallRead => s !== undefined)
  const bulk = (f: FieldName): BulkWallRead | undefined =>
    stages.find((s): s is Extract<DockStage, { kind: 'bulk' }> => s.kind === 'bulk' && s.field === f)?.read
  const cage = (f: FieldName): DockCageRead | undefined =>
    stages.find((s): s is Extract<DockStage, { kind: 'dock-cage' }> => s.kind === 'dock-cage' && s.field === f)?.read
  const missing = names.filter(f => !(slabs(f).length === plan.Ls.length && bulk(f) && cage(f)))

  if (missing.length > 0) {
    return verdict({ status: 'partial', claim: `missing stages: ${missing.join(', ')}`, metrics: {} })
  }

  const W = Object.fromEntries(names.map(f => [f, wallVerdict(plan, slabs(f), bulk(f)!)])) as Record<FieldName, string>
  const C = Object.fromEntries(names.map(f => [f, cage(f)!])) as Record<FieldName, DockCageRead>
  const P = Object.fromEntries(names.map(f => [f, bulk(f)!.plaquette])) as Record<FieldName, BulkWallRead['plaquette']>

  const CF = W.cf === 'hold' && C.cf.ratio >= plan.cagedBelow && Math.abs(P.cf.mean - 1) <= TOL.plaquette

  const cr8 = slabs('cr').find(s => s.L === 8)
  const crNearest = cr8 ? Math.abs(cr8.nearest - REF.slabNearest8) : Infinity
  const packetGap = Math.abs(C.cr.packetRatio - REF.packetRatio)
  const CR = W.cr === 'fail' && crNearest <= REF.slabNearestTol && C.cr.ratio < plan.cagedBelow && packetGap <= REF.packetTol

  const pairs = slabs('cr').map((a, i) => [a, slabs('cg')[i]!] as const)
  const wSame =
    W.cg === W.cr &&
    pairs.every(
      ([a, b]) =>
        a.near === b.near && a.far === b.far && Math.abs(a.nearest - b.nearest) <= a.nearestResidual + b.nearestResidual,
    ) &&
    bulk('cr')!.count === bulk('cg')!.count &&
    bulk('cr')!.sets.every((s, i) => {
      const t = bulk('cg')!.sets[i]!

      return Math.abs(s.nearest - t.nearest) <= s.nearestResidual + t.nearestResidual
    })
  const pGap = Math.abs(P.cr.mean - P.cg.mean)
  const histSame = P.cr.histogram.every((n, i) => n === P.cg.histogram[i])
  const cageGap = Math.abs(C.cr.ratio - C.cg.ratio)
  const rmsGap = Math.max(...C.cr.rmsC.map((v, b) => Math.abs(v - C.cg.rmsC[b]!)))
  const packetShift = Math.abs(C.cr.packetRatio - C.cg.packetRatio)
  const CG = wSame && pGap <= TOL.plaquette && histSame && cageGap <= TOL.cage

  const t = sigmaTable()
  const I =
    t.tableGap <= TOL.table &&
    names.flatMap(slabs).every(s => s.reverseBad === 0 && s.complete) &&
    names.every(f => bulk(f)!.reverseBad === 0 && bulk(f)!.sets.every(s => s.complete)) &&
    names.every(f => C[f].reverseBad === 0 && C[f].meshMatch && C[f].normDrift <= TOL.norm && C[f].unsaturated)

  const status: Verdict['status'] = CF && CR && CG && I ? 'pass' : 'partial'
  const row = (f: FieldName): string =>
    `${f}: W ${W[f]}; C ${C[f].ratio.toFixed(6)} ${C[f].ratio < plan.cagedBelow ? 'caged' : 'free'} (one-dock rms ${C[f].rmsC[plan.cage.beats]!.toFixed(3)}, free ${C[f].rmsT[plan.cage.beats]!.toFixed(3)} of box ${C[f].boxRms.toFixed(3)}, ${C[f].seconds.toFixed(0)} s); old packet ${C[f].packetRatio.toFixed(4)}; P ${P[f].mean.toFixed(6)}`
  const metrics: Record<string, number> = {
    CF: flag(CF),
    CR: flag(CR),
    CG: flag(CG),
    I: flag(I),
    crNearestGap: crNearest,
    crPacketGap: packetGap,
    cgPlaquetteGap: pGap,
    cgCageGap: cageGap,
    cgRmsGap: rmsGap,
    cgPacketShift: packetShift,
    tableGap: t.tableGap,
  }

  for (const f of names) {
    metrics[`${f}C`] = C[f].ratio
    metrics[`${f}PacketRatio`] = C[f].packetRatio
    metrics[`${f}NormDrift`] = C[f].normDrift
  }

  return verdict({
    status,
    claim: `colour gates with the one-dock colour-mixed cage start: CF ${CF}, CR ${CR} (L 8 nearest gap ${crNearest.toExponential(1)}, packet gap ${packetGap.toExponential(1)}), CG ${CG} (C gap ${cageGap.toExponential(1)}, rms gap ${rmsGap.toExponential(1)}, P ${pGap.toExponential(1)}, histogram ${histSame}; old packet shift ${packetShift.toExponential(1)}), I ${I}. ${names.map(row).join('. ')}.`,
    metrics,
    control: { CF: flag(CF), CR: flag(CR), CG: flag(CG), I: flag(I) },
    notes:
      'Static fields only. C reads a one-dock start summed over the three colours (rho0 maximally mixed in colour), so it is a function of the gauge orbit; the old multi-dock packet ratio is printed, never gated except as the CR reproduction.',
  })
}
