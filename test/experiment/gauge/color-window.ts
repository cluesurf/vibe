// BOTH COLOUR GATES AT ONE BETA ON THE WILSON LINE (E-FRC-0298, note/project/vibe/roadmap/moving-matter item 0057, decision
// 012 point 4, read in decision 013's order). Input: the stored Sigma(648) heat-bath configurations of E-FRC-0297 (gauge/
// color-ensemble, R*'s fcc triangles, Wilson form), one per box (bulk side 8, slab 8^3 x 8, slab 8^3 x 12), four a (beta,
// start) at sweeps 40, 80, 120, 160. The hot start holds the CONFINED branch, the cold start the FROZEN branch. The k-th
// configuration of a (beta, branch) is the k-th sweep on every box (independent chains per box, the same beta and start).
//
// PER CONFIGURATION, decision 013 point 1 (gates of 012 point 4, fixed 2026-10-08, none moved):
//   1. P, the mean triangle plaquette on the bulk box (and on each slab read)
//   2. slab L 8: 24 levels within 0.1 of pi with wall weight >= 0.9 is a candidate, any other count NOT W-PASS
//   3. slab L 12 only for a candidate: 24 W-PASS, else NOT W-PASS
//   4. FAIL or UNSURE only at beta_f, the induced beta or a beta next to the wall window: L 8 holding a weight-0.9 level
//      within 0.2 is W-UNSURE; else L 12 and the bulk box: neither has one (the bulk: no level within 0.2), W-FAIL; else
//      W-UNSURE (0053's pump would decide, when landed)
//   5. the cage C only on W-PASS or W-UNSURE, else 'not read (W)'
// Configurations one at a time per (beta, branch), stopping at the first NOT W-PASS.
// PER (beta, branch): JOINT PASS when all 4 configurations are W-PASS and CAGED.
// VERDICT: PASS, a joint pass at beta_f on either branch (or 0059's induced beta). At beta_f alone a NOT W-PASS first
// configuration on both branches rules PASS out there; KILL against PARTIAL needs the window scan across the grid.
//
// DETERMINISM: the configurations are files, read back exactly (Int16 element indices, reverse = inverse checked). Depth L2.

import { readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  bulkWallRead,
  GATES_PLAN,
  plaquetteRead,
  reverseGap,
  slabWallRead,
  type BulkWallRead,
  type ColorField,
  type GatesPlan,
  type PlaquetteRead,
  type SlabWallRead,
} from '@/code/measure/color-gates'
import { bulkBox, type ColorBox } from '@/code/measure/color-slab'

const SLOTS = 24

export type Branch = 'confined' | 'frozen'
export type EnsBox = 'bulk8' | 'slab8x8' | 'slab8x12'

export const START_OF: Record<Branch, 'hot' | 'cold'> = { confined: 'hot', frozen: 'cold' }
export const SWEEPS = [40, 80, 120, 160] as const

export type WindowPlan = {
  gates: GatesPlan
  // the directory holding color-ens-<box>/, with a trailing slash
  dir: string
  // E-FRC-0297's beta_f per box and the stored beta key it was sampled at
  betaF: Record<EnsBox, number>
  betaFKey: string
}

export const WINDOW_PLAN: WindowPlan = {
  gates: GATES_PLAN,
  dir: '/Users/lancepollard/base/crew/cluesurf/.claude/worktrees/vibe-moving-matter/deck/vibe/tmp/',
  betaF: { bulk8: 2.4166, slab8x8: 2.417, slab8x12: 2.4162 },
  betaFKey: '2.42f',
}

export type ConfigKey = { beta: string; branch: Branch; k: number }

export const configName = (c: ConfigKey): string => `b${c.beta}-${c.branch}-${c.k}`

export function configPath(plan: WindowPlan, box: EnsBox, c: ConfigKey): string {
  return `${plan.dir}color-ens-${box}/wilson-b${c.beta}-${START_OF[c.branch]}-${SWEEPS[c.k - 1]}.bin`
}

// the stored configuration as a field: each box reads its own chain's file; the side-20 cage box has none
export function storedField(plan: WindowPlan, c: ConfigKey): ColorField {
  return {
    name: `ens-${configName(c)}`,
    on: (box: ColorBox, kind) => {
      const side = plan.gates.side
      const box8 = side ** 4

      let which: EnsBox

      if (kind === 'bulk' && box.cells === box8) {
        which = 'bulk8'
      } else if (kind === 'slab' && box.cells === side ** 3 * 8) {
        which = 'slab8x8'
      } else if (kind === 'slab' && box.cells === side ** 3 * 12) {
        which = 'slab8x12'
      } else {
        throw new Error(`storedField: no stored configuration on a ${kind} box of ${box.cells} docks`)
      }

      const buf = readFileSync(configPath(plan, which, c))
      const raw = new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2)

      if (raw.length !== box.cells * SLOTS) {
        throw new Error(`storedField: ${which} file holds ${raw.length} slots, the box ${box.cells * SLOTS}`)
      }

      return Int32Array.from(raw)
    },
  }
}

export type WindowStage =
  | { kind: 'p'; config: ConfigKey; read: PlaquetteRead; reverseBad: number }
  | { kind: 'slab'; config: ConfigKey; read: SlabWallRead; deep?: boolean }
  | { kind: 'bulk'; config: ConfigKey; read: BulkWallRead }

// 'deep': the same slab read with a longer search, only after an incomplete read (traps.md: a near-degenerate wall pair
// at pi stalls Lanczos 160 and the 4-pass block; a longer Krylov space completes it). No gate moves: near, far,
// wallShare and pairs are the plan's.
export type WindowRead = 'p' | 'slab-8' | 'slab-12' | 'bulk' | 'slab-8-deep' | 'slab-12-deep'

export const deepPlan = (g: GatesPlan): GatesPlan => ({
  ...g,
  krylov: 2 * g.krylov,
  cluster: { ...g.cluster, maxPasses: 2 * g.cluster.maxPasses },
})

export function windowStage(plan: WindowPlan, c: ConfigKey, read: WindowRead): WindowStage {
  const f = storedField(plan, c)

  if (read === 'p') {
    const box = bulkBox(plan.gates.side)
    const link = f.on(box, 'bulk')

    return { kind: 'p', config: c, read: plaquetteRead(box, link), reverseBad: reverseGap(box, link) }
  }

  if (read === 'bulk') {
    return { kind: 'bulk', config: c, read: bulkWallRead(f, plan.gates) }
  }

  const deep = read.endsWith('-deep')

  return {
    kind: 'slab',
    config: c,
    read: slabWallRead(f, deep ? deepPlan(plan.gates) : plan.gates, read.startsWith('slab-8') ? 8 : 12),
    ...(deep ? { deep: true } : {}),
  }
}

// ---- the per-configuration class ----

export type WClass = 'W-PASS' | 'W-FAIL' | 'W-UNSURE' | 'NOT W-PASS' | 'pending' | 'incomplete'

const same = (a: ConfigKey, b: ConfigKey): boolean => a.beta === b.beta && a.branch === b.branch && a.k === b.k

export type ConfigRow = {
  config: ConfigKey
  P?: number
  pReverseBad?: number
  slab8?: SlabWallRead
  slab12?: SlabWallRead
  bulk?: BulkWallRead
  W: WClass
  // the next read decision 013 calls for, if any
  next?: WindowRead | 'cage'
}

const holdsWeighted = (plan: GatesPlan, s: SlabWallRead): boolean =>
  s.levels.some(l => Math.abs(l.offset) < plan.far && l.wall >= plan.wallShare)

// resolve: whether step 4 (FAIL or UNSURE) applies to this beta (beta_f, the induced beta, next to the wall window)
export function configRow(plan: GatesPlan, stages: readonly WindowStage[], c: ConfigKey, resolve: boolean): ConfigRow {
  const mine = stages.filter(s => same(s.config, c))
  const p = mine.find((s): s is Extract<WindowStage, { kind: 'p' }> => s.kind === 'p')
  // the plain read, or its deep rerun when the plain one is incomplete
  const slabOf = (L: number, deep: boolean): SlabWallRead | undefined =>
    mine.find(
      (s): s is Extract<WindowStage, { kind: 'slab' }> => s.kind === 'slab' && s.read.L === L && !!s.deep === deep,
    )?.read
  const slab = (L: number): SlabWallRead | undefined => {
    const plain = slabOf(L, false)

    return plain && !plain.complete ? (slabOf(L, true) ?? plain) : plain
  }
  const deepNext = (L: 8 | 12): WindowRead | undefined =>
    slab(L) && !slab(L)!.complete && !slabOf(L, true) ? (`slab-${L}-deep` as const) : undefined
  const bulk = mine.find((s): s is Extract<WindowStage, { kind: 'bulk' }> => s.kind === 'bulk')?.read
  const row: ConfigRow = {
    config: c,
    P: p?.read.mean,
    pReverseBad: p?.reverseBad,
    slab8: slab(8),
    slab12: slab(12),
    bulk,
    W: 'pending',
  }

  if (!p) {
    return { ...row, next: 'p' }
  }

  const s8 = slab(8)

  if (!s8) {
    return { ...row, next: 'slab-8' }
  }

  if (!s8.complete) {
    return { ...row, W: 'incomplete', next: deepNext(8) }
  }

  const s12 = slab(12)

  if (s8.near === plan.pairs) {
    if (!s12) {
      return { ...row, next: 'slab-12' }
    }

    if (!s12.complete) {
      return { ...row, W: 'incomplete', next: deepNext(12) }
    }

    if (s12.near === plan.pairs) {
      return { ...row, W: 'W-PASS', next: 'cage' }
    }
  }

  if (!resolve) {
    return { ...row, W: 'NOT W-PASS' }
  }

  // step 4
  if (holdsWeighted(plan, s8)) {
    return { ...row, W: 'W-UNSURE', next: 'cage' }
  }

  if (!s12) {
    return { ...row, W: 'NOT W-PASS', next: 'slab-12' }
  }

  if (!bulk) {
    return { ...row, W: 'NOT W-PASS', next: 'bulk' }
  }

  if (!s12.complete || bulk.sets.some(s => !s.complete)) {
    return { ...row, W: 'incomplete', next: deepNext(12) }
  }

  return holdsWeighted(plan, s12) || bulk.count > 0
    ? { ...row, W: 'W-UNSURE', next: 'cage' }
    : { ...row, W: 'W-FAIL' }
}

// ---- per (beta, branch) ----

export type BranchRow = {
  beta: string
  branch: Branch
  rows: ConfigRow[]
  // 'out' at the first NOT W-PASS (no joint pass possible), 'wall pass' when all 4 are W-PASS (C then decides)
  wall: 'out' | 'wall pass' | 'reading'
}

export function branchRow(plan: GatesPlan, stages: readonly WindowStage[], beta: string, branch: Branch, resolve: boolean): BranchRow {
  const rows: ConfigRow[] = []

  for (let k = 1; k <= SWEEPS.length; k++) {
    const r = configRow(plan, stages, { beta, branch, k }, resolve)

    rows.push(r)

    if (r.W !== 'W-PASS') {
      const decided = r.W === 'NOT W-PASS' || r.W === 'W-FAIL' || r.W === 'W-UNSURE'

      return { beta, branch, rows, wall: decided ? 'out' : 'reading' }
    }
  }

  return { beta, branch, rows, wall: 'wall pass' }
}

const cell = (r: ConfigRow): string => {
  const s8 = r.slab8 ? `L8 ${r.slab8.near}/${r.slab8.far} nearest ${r.slab8.nearest.toFixed(4)}` : 'L8 -'
  const s12 = r.slab12 ? `, L12 ${r.slab12.near}/${r.slab12.far} nearest ${r.slab12.nearest.toFixed(4)}` : ''
  const b = r.bulk ? `, bulk ${r.bulk.count} nearest ${r.bulk.nearest.toFixed(4)}` : ''
  const c = r.W === 'W-PASS' || r.W === 'W-UNSURE' ? 'C not read (no side-20 configuration)' : 'C not read (W)'

  return `k${r.config.k} P ${r.P?.toFixed(4) ?? '-'} W ${r.W} [${s8}${s12}${b}] ${c}`
}

export function windowVerdict(plan: WindowPlan, stages: readonly WindowStage[]): Verdict {
  const g = plan.gates
  const branches = (['confined', 'frozen'] as const).map(b => branchRow(g, stages, plan.betaFKey, b, true))
  const reverseBad = stages.reduce(
    (t, s) => t + (s.kind === 'p' ? s.reverseBad : s.read.reverseBad),
    0,
  )
  const metrics: Record<string, number> = { reverseBad }

  for (const b of branches) {
    for (const r of b.rows) {
      const key = `${b.branch}${r.config.k}`

      if (r.P !== undefined) {
        metrics[`${key}P`] = r.P
      }

      if (r.slab8) {
        metrics[`${key}Near8`] = r.slab8.near
        metrics[`${key}Far8`] = r.slab8.far
        metrics[`${key}Nearest8`] = r.slab8.nearest
        metrics[`${key}Seconds8`] = r.slab8.seconds
      }

      if (r.slab12) {
        metrics[`${key}Near12`] = r.slab12.near
        metrics[`${key}Far12`] = r.slab12.far
        metrics[`${key}Nearest12`] = r.slab12.nearest
      }

      if (r.bulk) {
        metrics[`${key}BulkCount`] = r.bulk.count
        metrics[`${key}BulkNearest`] = r.bulk.nearest
      }
    }
  }

  const bothOut = branches.every(b => b.wall === 'out')
  const reading = branches.some(b => b.wall === 'reading')
  const needsCage = branches.some(b => b.rows.some(r => r.next === 'cage'))
  const instrument = reverseBad === 0
  const status: Verdict['status'] = !instrument ? 'partial' : bothOut && !needsCage ? 'fail' : 'open'
  const table = branches
    .map(b => `beta_f ${b.branch} (${b.wall}): ${b.rows.map(cell).join('; ')}`)
    .join('. ')

  return verdict({
    status,
    claim: `${bothOut ? 'no joint pass at beta_f on either branch: the first configuration of each is NOT W-PASS' : reading ? 'beta_f reads still pending' : 'a branch holds its walls at beta_f, the cage decides'}${needsCage ? '; a W-PASS or W-UNSURE configuration needs C on the side-20 cage box, where no configuration is stored' : ''}. ${table}.`,
    metrics,
    control: { reverseBad },
    notes: `beta_f ${plan.betaF.bulk8} (bulk), ${plan.betaF.slab8x8} (slab L 8), ${plan.betaF.slab8x12} (slab L 12), sampled at ${plan.betaFKey}. Status 'fail' here means only that PASS at beta_f is ruled out; KILL against PARTIAL for the Wilson form needs the window scan over the grid. Static fields, the 4D bulk and a hand-placed slab, never the husk.`,
  })
}

export default experiment({
  id: 'gauge/color-window',
  code: 'E-FRC-0298',
  title:
    'explores whether the Sigma(648) Wilson ensemble on the rule\'s triangles holds its chiral walls and cages lone thirds at the rule-fixed freeze point beta_f, on either branch',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const plan = WINDOW_PLAN
    const stages: WindowStage[] = []

    // decision 013's order, run serially here: each read only when the class still needs it
    for (const branch of ['confined', 'frozen'] as const) {
      for (;;) {
        const b = branchRow(plan.gates, stages, plan.betaFKey, branch, true)
        const last = b.rows[b.rows.length - 1]!
        const next = last.next

        if (!next || next === 'cage') {
          break
        }

        stages.push(windowStage(plan, last.config, next))
      }
    }

    return windowVerdict(plan, stages)
  },
})
