// COHERENT CENTRE FLUX (note/project/vibe/roadmap/moving-matter item 0058, candidate e of decision 012, read in decision
// 013's order). Explores whether colour as a Z3 centre field, omega^n times 1 on every link with the pattern chosen with
// no knob (the most frustrated periodic one), can cage lone thirds by interference (Aharonov-Bohm) while keeping the
// chiral walls, which roughness cannot do (decision 011 point 4).
//
// STEP 1 (code/measure/center-flux enumerateCenterPatterns): the smallest translation cell is the dock (a uniform pattern
// c_d per root, odd), which already admits non-flat triangles. Every odd c (3^12) modulo the 81 additive ones (gauge on
// the infinite mesh) and the 192 box rotations; kept: the classes with the largest fraction of non-flat oriented
// triangles, at most 6 (more escalates).
// STEP 2, per kept pattern, colorGates' reads (code/measure/color-gates) on the spec's boxes (side 8 is a multiple of the
// one-dock cell), in decision 013's order: P on the side-8 bulk box; slab L 8; slab L 12 only after an L 8 count of 24;
// FAIL or UNSURE always resolved (one field a pattern): L 8 holding a wall-weight level within 0.2 is W-UNSURE, else L 12
// and the bulk box are read and neither holding one is W-FAIL; the cage only on a pattern that is not W-FAIL, from
// decision 013's gauge-invariant start (item 0065's dockCageRead; the old packet's ratio is printed only).
//
// GATES, fixed 2026-10-08 before any read (decision 012 point 4, item 0057), one deterministic field so no ensemble:
//  W-PASS  the slab's count within 0.1 of pi with wall weight >= 0.9 equals the colour-free count on the same box (CF,
//          24 on the 8^3 x L slab) at L 8 and 12
//  W-FAIL  no wall-weight level within 0.2 on either slab and no bulk level within 0.2
//  W-UNSURE between (0053's pump decides when it lands)
//  CAGED   the cage ratio under 0.9
// VERDICT: PASS some kept pattern W-PASS and CAGED; KILL every kept pattern W-FAIL or FREE; PARTIAL W-UNSURE decides;
//  OPEN the CF control fails on the box, or a cage the verdict needs is still pending.
// CONTROL: CF identity on the same slab box (decision 013: CF is deterministic and the wall code is unchanged since 0055,
//  so its stage files are read, not re-run).
//
// DETERMINISM: no random numbers. Depth L2: a lattice-fermion spectral read of a static colour field.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { bulkBox } from '@/code/measure/color-slab'
import {
  bulkWallRead,
  GATES_PLAN,
  identityField,
  plaquetteRead,
  slabWallRead,
  type BulkWallRead,
  type GatesPlan,
  type PlaquetteRead,
  type SlabWallRead,
} from '@/code/measure/color-gates'
import { dockCageRead, type DockCageRead } from '@/code/measure/color-gates-cage'
import {
  centerField,
  enumerateCenterPatterns,
  type CenterEnumeration,
  type PatternClass,
} from '@/code/measure/center-flux'

export type FluxStage =
  | { kind: 'plaquette'; pattern: string; read: PlaquetteRead; seconds: number }
  | { kind: 'slab'; pattern: string; read: SlabWallRead }
  | { kind: 'bulk'; pattern: string; read: BulkWallRead }
  | { kind: 'cage'; pattern: string; read: DockCageRead }

export type FluxStageSpec = { name: string; run: () => FluxStage }

export function fluxSpecs(plan: GatesPlan, kept: readonly PatternClass[]): FluxStageSpec[] {
  const out: FluxStageSpec[] = []

  for (const k of kept) {
    const f = centerField(k.pattern)
    const pattern = k.pattern.name

    out.push({
      name: `${pattern}-plaquette`,
      run: () => {
        const t0 = Date.now()
        const box = bulkBox(plan.side)

        return { kind: 'plaquette', pattern, read: plaquetteRead(box, f.on(box, 'bulk')), seconds: (Date.now() - t0) / 1000 }
      },
    })

    for (const L of plan.Ls) {
      out.push({ name: `${pattern}-slab-${L}`, run: () => ({ kind: 'slab', pattern, read: slabWallRead(f, plan, L) }) })
    }

    out.push({ name: `${pattern}-bulk`, run: () => ({ kind: 'bulk', pattern, read: bulkWallRead(f, plan) }) })
    out.push({ name: `${pattern}-cage`, run: () => ({ kind: 'cage', pattern, read: dockCageRead(f, plan) }) })
  }

  return out
}

export type WallState = 'W-PASS' | 'W-FAIL' | 'W-UNSURE' | 'incomplete' | 'pending'

// the wall state of one pattern from the stages present, in decision 013's order; `next` names the stage still needed
export function wallState(
  plan: GatesPlan,
  colorFree: number,
  slab: (L: number) => SlabWallRead | undefined,
  bulk: BulkWallRead | undefined,
): { W: WallState; next?: string } {
  const [l8, l12] = [slab(plan.Ls[0]!), slab(plan.Ls[1]!)]
  const wallFar = (s: SlabWallRead): boolean => s.levels.some(l => l.wall >= plan.wallShare)

  if (!l8) {
    return { W: 'pending', next: `slab-${plan.Ls[0]}` }
  }

  if (!l8.complete) {
    return { W: 'incomplete' }
  }

  if (l8.near === colorFree) {
    if (!l12) {
      return { W: 'pending', next: `slab-${plan.Ls[1]}` }
    }

    if (!l12.complete) {
      return { W: 'incomplete' }
    }

    if (l12.near === colorFree) {
      return { W: 'W-PASS' }
    }

    return wallFar(l12) ? { W: 'W-UNSURE' } : bulkStep()
  }

  if (wallFar(l8)) {
    return { W: 'W-UNSURE' }
  }

  if (!l12) {
    return { W: 'pending', next: `slab-${plan.Ls[1]}` }
  }

  if (!l12.complete) {
    return { W: 'incomplete' }
  }

  if (wallFar(l12)) {
    return { W: 'W-UNSURE' }
  }

  return bulkStep()

  function bulkStep(): { W: WallState; next?: string } {
    if (!bulk) {
      return { W: 'pending', next: 'bulk' }
    }

    if (bulk.sets.some(s => !s.complete)) {
      return { W: 'incomplete' }
    }

    return bulk.count === 0 ? { W: 'W-FAIL' } : { W: 'W-UNSURE' }
  }
}

export function centerFluxVerdict(
  plan: GatesPlan,
  patterns: CenterEnumeration,
  stages: readonly FluxStage[],
  control: readonly SlabWallRead[],
): Verdict {
  // the CF control on the same box: the colour-free count at every L, every read complete
  const cfCounts = plan.Ls.map(L => control.find(s => s.L === L))
  const CF = cfCounts.every(s => s && s.complete && s.near === plan.pairs)
  const colorFree = plan.pairs
  const rows = patterns.kept.map(k => {
    const p = k.pattern.name
    const slab = (L: number): SlabWallRead | undefined =>
      stages.find((s): s is Extract<FluxStage, { kind: 'slab' }> => s.kind === 'slab' && s.pattern === p && s.read.L === L)
        ?.read
    const bulk = stages.find((s): s is Extract<FluxStage, { kind: 'bulk' }> => s.kind === 'bulk' && s.pattern === p)?.read
    const P = stages.find((s): s is Extract<FluxStage, { kind: 'plaquette' }> => s.kind === 'plaquette' && s.pattern === p)
    const w = wallState(plan, colorFree, slab, bulk)
    // the cage from decision 013's one-dock colour-mixed start (item 0065); a W-FAIL pattern is never caged (step 5)
    const cage = stages.find((s): s is Extract<FluxStage, { kind: 'cage' }> => s.kind === 'cage' && s.pattern === p)?.read
    const C: 'not read (W)' | 'pending' | 'CAGED' | 'FREE' =
      w.W === 'W-FAIL' ? 'not read (W)' : !cage ? 'pending' : cage.ratio < plan.cagedBelow ? 'CAGED' : 'FREE'

    return { k, slab, bulk, P, w, C, cage }
  })

  const metrics: Record<string, number> = {
    CF: CF ? 1 : 0,
    gaugeClasses: patterns.gaugeClasses,
    rotationClasses: patterns.rotationClasses,
    kept: patterns.kept.length,
    maxNonflat: patterns.maxNonflat,
  }

  for (const r of rows) {
    const p = r.k.pattern.name

    metrics[`${p}Fraction`] = r.k.fraction
    metrics[`${p}P`] = r.P ? r.P.read.mean : NaN

    for (const L of plan.Ls) {
      const s = r.slab(L)

      if (s) {
        metrics[`${p}Near${L}`] = s.near
        metrics[`${p}Far${L}`] = s.far
        metrics[`${p}Nearest${L}`] = s.nearest
        metrics[`${p}Seconds${L}`] = s.seconds
      }
    }

    if (r.bulk) {
      metrics[`${p}BulkCount`] = r.bulk.count
      metrics[`${p}BulkNearest`] = r.bulk.nearest
    }

    if (r.cage) {
      metrics[`${p}Cage`] = r.cage.ratio
      metrics[`${p}CagePacket`] = r.cage.packetRatio
    }
  }

  const pending = rows.some(r => r.w.W === 'pending' || r.w.W === 'incomplete' || r.C === 'pending')
  const word: 'OPEN' | 'PASS' | 'KILL' | 'PARTIAL' = !CF || pending
    ? 'OPEN'
    : rows.some(r => r.w.W === 'W-PASS' && r.C === 'CAGED')
      ? 'PASS'
      : rows.every(r => r.w.W === 'W-FAIL' || r.C === 'FREE')
        ? 'KILL'
        : 'PARTIAL'
  const status: Verdict['status'] = { OPEN: 'open', PASS: 'pass', KILL: 'fail', PARTIAL: 'partial' }[word] as Verdict['status']
  const verdictWord = !CF ? 'OPEN (CF control)' : pending ? 'OPEN (reads pending)' : word
  const row = (r: (typeof rows)[number]): string => {
    const slabs = plan.Ls.map(L => r.slab(L))
      .filter((s): s is SlabWallRead => s !== undefined)
      .map(s => `L ${s.L}: ${s.near} near / ${s.far} far (wall-weight ${s.levels.filter(l => l.wall >= plan.wallShare).length}), nearest ${s.nearest.toFixed(4)} (${s.seconds.toFixed(0)} s)`)
      .join(', ')
    const b = r.bulk
      ? `; bulk ${r.bulk.count} far, nearest ${r.bulk.sets.map(x => `${x.set} ${x.nearest.toFixed(4)}`).join(' ')}`
      : ''

    return `${r.k.pattern.name} c ${[...r.k.pattern.c].join('')} non-flat ${r.k.nonflat}/192, P ${r.P ? r.P.read.mean.toFixed(6) : 'unread'}: ${r.w.W}${r.w.next ? ` (next ${r.w.next})` : ''} [${slabs}${b}]; C ${r.C}${r.cage ? ` (ratio ${r.cage.ratio.toFixed(4)}, old packet ${r.cage.packetRatio.toFixed(4)}, unsaturated ${r.cage.unsaturated}, norm drift ${r.cage.normDrift.toExponential(1)})` : ''}`
  }

  return verdict({
    status,
    claim: `centre flux ${verdictWord}: ${patterns.gaugeClasses} gauge classes, ${patterns.rotationClasses} rotation classes, ${patterns.kept.length} kept at ${patterns.maxNonflat}/192 non-flat. CF ${CF} (${cfCounts.map(s => (s ? `L ${s.L} ${s.near}` : 'missing')).join(', ')}). ${rows.map(row).join('. ')}.`,
    metrics,
    control: { CF: CF ? 1 : 0 },
    notes:
      'Static uniform Z3 centre fields on the 4D bulk and a hand-placed slab, never the husk. On a side-8 box the 81 members of a gauge class are flat twists of each other (3 does not divide 8): one representative is read, chosen by a fixed rule (center-flux boxRepresentative). The cage is read from the one-dock colour-mixed start of item 0065 (color-gates-cage dockCageRead).',
  })
}

export default experiment({
  id: 'gauge/center-flux',
  code: 'E-FRC-0299',
  title:
    'explores whether a coherent Z3 centre flux, the most frustrated periodic pattern, could cage lone thirds by interference while keeping the chiral walls',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return centerFluxRun(GATES_PLAN)
  },
})

// the whole read in decision 013's order, serially (hours: the stage runner deck/vibe/tmp/cflux.sh splits it)
export function centerFluxRun(plan: GatesPlan): Verdict {
  const patterns = enumerateCenterPatterns()
  const specs = fluxSpecs(plan, patterns.kept)
  const control = plan.Ls.map(L => slabWallRead(identityField, plan, L))
  const stages: FluxStage[] = []

  for (const k of patterns.kept) {
    const run = (suffix: string): void => {
      stages.push(specs.find(s => s.name === `${k.pattern.name}-${suffix}`)!.run())
    }

    run('plaquette')

    for (;;) {
      const p = k.pattern.name
      const w = wallState(
        plan,
        plan.pairs,
        L =>
          stages.find((s): s is Extract<FluxStage, { kind: 'slab' }> => s.kind === 'slab' && s.pattern === p && s.read.L === L)
            ?.read,
        stages.find((s): s is Extract<FluxStage, { kind: 'bulk' }> => s.kind === 'bulk' && s.pattern === p)?.read,
      )

      if (w.W !== 'pending') {
        if (w.W !== 'W-FAIL' && w.W !== 'incomplete') {
          run('cage')
        }

        break
      }

      run(w.next!)
    }
  }

  return centerFluxVerdict(plan, patterns, stages, control)
}
