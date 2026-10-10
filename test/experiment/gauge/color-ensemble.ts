// WHERE DOES SIGMA(648) COLOUR FREEZE ON R*'S OWN LATTICE? (E-FRC-0297, moving-matter item 0056, decision 012 candidate
// b). The pure-gauge Sigma(648) ensemble with the Wilson form S = beta sum_t (1 - Re Tr U_t / 3) over the fcc triangles of
// R*'s 24 D4 links (code/measure/color-ensemble), on the side-8 bulk box and the coloured slab boxes 8^3 x L (L 8, 12).
// Decision 012 point 2: the coupling may enter only where the rule fixes it, and candidate (b) is the first-order point
// beta_f, where a reversible demon rule with its energy anywhere in the latent-heat band sits.
//
// STEPS
//   1  hot and cold starts at beta 0 to 6 by 0.25, then by 0.05 across the hysteresis: P = mean Re Tr U_t / 3, its error
//      and integrated autocorrelation time
//   2  beta_f by mixed starts (half the box hot, half cold): bisection to 0.02 on which phase grows
//   3  per branch at beta_f and at every grid beta: P, the class histogram of U_t, the triangle-tiled planar Wilson loops
//      of sides 1 to 3 (area n^2; an area-law diagnostic, never a gate)
//   4  DIAGNOSTIC: the integer C* level form f = round(6 (1 - Re Tr U / 3)) / 6 at its own beta_f (bulk box): do the branch
//      plaquettes at beta_f depend on the form?
//   Stored: 4 configurations per (beta, branch, box), measured sweeps 40, 80, 120 and 160 after 50 thermalizing ones, as
//   colorGates' input (one gridLifts index per directed slot x * 24 + d, reverse = inverse, little-endian Int16), under
//   tmp/color-ens-<box>/.
//
// CONTROLS (the proof)
//   I  the float table maps onto the exact Sigma(648) (holonomy-caging sigmaElements) to 1e-12, one to one, inverses kept;
//      every undirected link of every box sits in 8 triangles; identity links read P 1 and W 1
//   Z2 the free-energy crossing (below) finds 4D Z2 gauge theory's exact self-dual point, beta_c = (3/4) ln(1 + sqrt 2), to
//      0.005 on the hypercubic 8^4 lattice
//   C  the same crossing on finite-gauge's hypercubic lattice finds beta_f within 0.05 of 3.43, Gustafson et al. PRD 110
//      034515 (2024) Table I, S = -(beta / 3) sum Re Tr U_p. That entry is Sigma(216 x 3) = Sigma(648) in 2+1d (its 3+1d
//      cell is empty), so the control runs on 8^3; the 8^4 crossing is reported with no published value to meet. Else OPEN
//
// beta_f is read by the free-energy crossing (code/measure/color-ensemble freeEnergyCrossing), not by the brief's mixed
// starts: their frozen-confined interface stays pinned on these boxes (see traps), so a mixed start never decides.
//
// DETERMINISM: no random numbers; every draw is a Weyl stream (one start per stage). The run is a deterministic dynamics
// with a quasi-random schedule (code/tool/weyl header), so a stored configuration is reproduced bit for bit.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { bulkBox, slabBox, type ColorBox } from '@/code/measure/color-slab'
import { sigmaClasses } from '@/code/measure/wall-index'
import {
  ensembleGroup,
  freeEnergyCrossing,
  hypercubicEngine,
  mixedBisection,
  runBeta,
  saveField,
  startField,
  triangleEngine,
  triangleLattice,
  trianglePlaquette,
  triangleWilsonLoops,
  type ActionForm,
  type BetaRun,
  type CrossingRead,
  type EnsembleGroup,
  type MixedRead,
  type MixedStep,
  type TriangleLattice,
} from '@/code/measure/color-ensemble'
import { makeWeyl } from '@/code/tool/weyl'
import { generateGroup, matrix3 } from '@/code/dynamics/finite-gauge'

// ---- the plan ----

export type BoxName = 'bulk8' | 'slab8x8' | 'slab8x12'

export type EnsemblePlan = {
  dir: string
  boxes: BoxName[]
  coarse: number[]
  fineStep: number
  // a grid beta is in the hysteresis when the cold-start P exceeds the hot-start P by this much
  hysteresis: number
  therm: number
  sweeps: number
  stores: number[]
  loops: number
  resolution: number
  ref: { therm: number; sweeps: number }
  mixedSweeps: number
  control: {
    lengths: number[]
    lo: number
    hi: number
    target: number
    tolerance: number
    hot: number[]
    cold: number[]
    therm: number
    sweeps: number
  }
  // the integer-level diagnostic (bulk box): its grid, thermalizing and measured sweeps, no stored configurations
  levels: { hot: number[]; cold: number[]; therm: number; sweeps: number }
  // a P between the confined and frozen branches
  split: number
}

const range = (lo: number, hi: number, step: number): number[] =>
  Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => Math.round((lo + i * step) * 100) / 100)
const union = (...lists: number[][]): number[] =>
  [...new Set(lists.flat().map(b => Math.round(b * 100) / 100))].sort((a, b) => a - b)

// (V - N_l) / N_t ln |G| per elementary loop: D4 triangles V : N_l : N_t = 1 : 12 : 32, hypercubic squares 1 : 4 : 6
export const FLOOR_TRIANGLE = (-11 / 32) * Math.log(648)
export const FLOOR_SQUARE = (-3 / 6) * Math.log(648)

export const ENSEMBLE_PLAN: EnsemblePlan = {
  dir: fileURLToPath(new URL('../../../tmp/', import.meta.url)),
  boxes: ['bulk8', 'slab8x8', 'slab8x12'],
  coarse: Array.from({ length: 25 }, (_, i) => i * 0.25),
  fineStep: 0.05,
  hysteresis: 0.1,
  therm: 50,
  sweeps: 160,
  stores: [40, 80, 120, 160],
  loops: 3,
  resolution: 0.02,
  ref: { therm: 30, sweeps: 40 },
  mixedSweeps: 200,
  control: {
    lengths: [8, 8, 8, 8],
    lo: 3.1,
    hi: 3.8,
    target: 3.43,
    tolerance: 0.05,
    hot: union(range(0, 4.5, 0.25), range(3, 4, 0.05)),
    cold: union(range(2.5, 6, 0.25), range(3, 4, 0.05)),
    therm: 30,
    sweeps: 40,
  },
  levels: { hot: range(0, 4, 0.25), cold: range(1, 6, 0.25), therm: 30, sweeps: 40 },
  split: 0.6,
}

export function boxOf(name: BoxName): ColorBox {
  return name === 'bulk8' ? bulkBox(8) : name === 'slab8x8' ? slabBox(8, 8) : slabBox(8, 12)
}

const betaKey = (beta: number): string => beta.toFixed(2)
const boxDir = (plan: EnsemblePlan, box: BoxName): string => `${plan.dir}color-ens-${box}/`

// a stream start per (stage, box, beta, start): integers, so every stage reads its own stream
const streamStart = (tag: number, beta: number, start: string): number =>
  tag * 100000 + Math.round(beta * 1000) * 2 + (start === 'cold' ? 1 : 0)
const BOX_TAG: Record<BoxName, number> = { bulk8: 1, slab8x8: 2, slab8x12: 3 }

// ---- STEP 1 and 3: one beta, one start, with stored configurations ----

export type ScanRead = BetaRun & {
  box: BoxName
  form: ActionForm
  // averaged over the stored configurations
  histogram: number[]
  wilson: number[]
  configs: string[]
  // the store spacing over 2 tau: at least 1 means decorrelated
  spacingOverTwoTau: number
}

export function scanBeta(input: {
  plan: EnsemblePlan
  box: BoxName
  form: ActionForm
  beta: number
  start: 'hot' | 'cold'
  tag?: string
  eg?: EnsembleGroup
  lat?: TriangleLattice
}): ScanRead {
  const { plan, box, form, beta, start } = input
  const eg = input.eg ?? ensembleGroup()
  const lat = input.lat ?? triangleLattice(boxOf(box))
  const { classOf, classes } = sigmaClasses(eg.group)
  const rng = makeWeyl({ start: streamStart(BOX_TAG[box], beta, start) })
  const engine = triangleEngine({ name: box, lat, eg, form, rng })
  const dir = boxDir(plan, box)
  const configs: string[] = []
  const hist = new Array<number>(classes.length).fill(0)
  const wilson = new Array<number>(plan.loops + 1).fill(0)

  mkdirSync(dir, { recursive: true })

  const run = runBeta({
    engine,
    beta,
    start,
    therm: plan.therm,
    sweeps: plan.sweeps,
    stores: plan.stores,
    onStore: i => {
      const field = engine.field()
      const name = `${form}-b${betaKey(beta)}${input.tag ?? ''}-${start}-${i}.bin`

      if (!existsSync(dir + name)) {
        saveField(dir + name, eg, field)
      }

      configs.push(name)

      const p = trianglePlaquette(lat, eg, field, classOf, classes.length)

      p.histogram.forEach((x, c) => {
        hist[c]! += x / plan.stores.length
      })
      triangleWilsonLoops(lat, eg, field, plan.loops).forEach((w, n) => {
        wilson[n]! += w / plan.stores.length
      })
    },
  })
  const spacing = plan.stores[0]!

  return {
    ...run,
    box,
    form,
    histogram: hist,
    wilson,
    configs,
    spacingOverTwoTau: spacing / (2 * run.tau),
  }
}

// a plaquette-only read (the hypercubic control, the integer-level diagnostic): no stored configurations
// the hypercubic lattices: hyper8 the 8^4 lattice (3+1d), hyper3d the 8^3 lattice (2+1d, where the published value lives)
export type HyperName = 'hyper8' | 'hyper3d'

export const isHyper = (box: string): box is HyperName => box === 'hyper8' || box === 'hyper3d'

export const hyperLengths = (box: HyperName): number[] => (box === 'hyper8' ? [8, 8, 8, 8] : [8, 8, 8])

// (V - N_l) / N_p ln |G| on the d-dimensional hypercubic lattice: N_l = d V, N_p = d (d - 1) / 2 V
export const floorHyper = (d: number): number => ((1 - d) / ((d * (d - 1)) / 2)) * Math.log(648)

export type QuickRead = BetaRun & { box: BoxName | HyperName; form: ActionForm }

export function quickScan(input: {
  plan: EnsemblePlan
  box: BoxName | HyperName
  form: ActionForm
  beta: number
  start: 'hot' | 'cold'
  therm: number
  sweeps: number
  eg?: EnsembleGroup
  lat?: TriangleLattice
}): QuickRead {
  const { box, form, beta, start } = input
  const eg = input.eg ?? ensembleGroup()
  const tag = box === 'hyper8' ? 9 : box === 'hyper3d' ? 8 : BOX_TAG[box] + (form === 'levels' ? 10 : 0)
  const rng = makeWeyl({ start: streamStart(tag, beta, start) })
  const engine = isHyper(box)
    ? hypercubicEngine({ name: box, group: eg.group, lengths: hyperLengths(box), rng })
    : triangleEngine({ name: box, lat: input.lat ?? triangleLattice(boxOf(box)), eg, form, rng })

  return { ...runBeta({ engine, beta, start, therm: input.therm, sweeps: input.sweeps }), box, form }
}

// The crossing on an exactly known transition: Z2 = {1, diag(-1, -1, 1)} in SU(3) on the hypercubic 8^4 lattice. f is 0 or
// 4/3, so the weight ratio is exp(-2 K) with K = 2 beta / 3, and 4D Z2 gauge theory is self-dual at K = (1/2) ln(1 + sqrt 2):
// beta_c = (3/4) ln(1 + sqrt 2) = 0.66103.
export type Z2Stage = { target: number; betaF: number; found: boolean; slope: number; points: number }

export function z2Stage(): Z2Stage {
  const group = generateGroup({
    generators: [
      matrix3([
        [[-1, 0], [0, 0], [0, 0]],
        [[0, 0], [-1, 0], [0, 0]],
        [[0, 0], [0, 0], [1, 0]],
      ]),
    ],
  })
  const betas = Array.from({ length: 41 }, (_, i) => Math.round(i * 25) / 1000)
  const reads: { beta: number; P: number; start: 'hot' | 'cold' }[] = []

  for (const start of ['hot', 'cold'] as const) {
    for (const beta of betas) {
      const rng = makeWeyl({ start: 7000 + Math.round(beta * 1000) * 2 + (start === 'cold' ? 1 : 0) })
      const engine = hypercubicEngine({ name: 'z2', group, lengths: [8, 8, 8, 8], rng })

      reads.push({ beta, P: runBeta({ engine, beta, start, therm: 100, sweeps: 200 }).P, start })
    }
  }

  const cross = freeEnergyCrossing({
    hot: reads.filter(r => r.start === 'hot'),
    cold: reads.filter(r => r.start === 'cold'),
    floor: (-3 / 6) * Math.log(2),
    split: 0.75,
  })

  return {
    target: 0.75 * Math.log(1 + Math.SQRT2),
    betaF: cross.betaF,
    found: cross.found,
    slope: cross.slope,
    points: reads.length,
  }
}

// the free-energy crossing of one box and form from its reads
export function crossingOf(
  plan: EnsemblePlan,
  reads: readonly (BetaRun & { box: string; form: ActionForm })[],
  box: string,
  form: ActionForm,
): CrossingRead {
  const mine = reads.filter(r => r.box === box && r.form === form)

  return freeEnergyCrossing({
    hot: mine.filter(r => r.start === 'hot'),
    cold: mine.filter(r => r.start === 'cold'),
    floor: isHyper(box) ? floorHyper(hyperLengths(box).length) : FLOOR_TRIANGLE,
    split: plan.split,
  })
}

// ---- STEP 2 and 4: beta_f by mixed starts (kept as a diagnostic: the interface is pinned, see the verdict notes) ----

export type MixedStage = MixedRead & {
  box: BoxName | 'hyper8'
  form: ActionForm
  // STEP 3 at beta_f: both branches (Wilson boxes: with stored configurations)
  atBetaF?: { hot: ScanRead | BetaRun; cold: ScanRead | BetaRun }
}

export function mixedStage(input: {
  plan: EnsemblePlan
  box: BoxName | 'hyper8'
  form: ActionForm
  lo: number
  hi: number
  branches: boolean
  log?: (s: MixedStep) => void
}): MixedStage {
  const { plan, box, form } = input
  const eg = ensembleGroup()
  const rng = makeWeyl({ start: streamStart(box === 'hyper8' ? 9 : BOX_TAG[box] + (form === 'levels' ? 10 : 0), input.lo, 'mixed') })
  const lat = box === 'hyper8' ? undefined : triangleLattice(boxOf(box))
  const engine =
    box === 'hyper8'
      ? hypercubicEngine({ name: box, group: eg.group, lengths: plan.control.lengths, rng })
      : triangleEngine({ name: box, lat: lat!, eg, form, rng })
  const read = mixedBisection({
    engine,
    lo: input.lo,
    hi: input.hi,
    resolution: plan.resolution,
    refTherm: plan.ref.therm,
    refSweeps: plan.ref.sweeps,
    mixedSweeps: plan.mixedSweeps,
    split: 0.6,
    log: input.log,
  })

  if (!input.branches || !read.bracketHeld) {
    return { ...read, box, form }
  }

  const beta = Math.round(read.betaF * 1e4) / 1e4
  const atBetaF =
    box !== 'hyper8' && form === 'wilson'
      ? {
          hot: scanBeta({ plan, box, form, beta, start: 'hot', tag: 'f', eg, lat }),
          cold: scanBeta({ plan, box, form, beta, start: 'cold', tag: 'f', eg, lat }),
        }
      : {
          hot: runBeta({ engine, beta, start: 'hot', therm: plan.therm, sweeps: plan.sweeps }),
          cold: runBeta({ engine, beta, start: 'cold', therm: plan.therm, sweeps: plan.sweeps }),
        }

  return { ...read, box, form, atBetaF }
}

// ---- the instruments ----

export type InstrumentStage = {
  mapWorst: number
  mapBijective: boolean
  perLink: Record<string, [number, number]>
  coldP: Record<string, number>
  coldW: Record<string, number[]>
  classes: { rep: number; size: number; level: number; trace: number }[]
}

export function instrumentStage(plan: EnsemblePlan): InstrumentStage {
  const eg = ensembleGroup()
  const perLink: Record<string, [number, number]> = {}
  const coldP: Record<string, number> = {}
  const coldW: Record<string, number[]> = {}

  for (const box of plan.boxes) {
    const lat = triangleLattice(boxOf(box))
    const field = startField(lat, eg, 'cold', makeWeyl({ start: 1 }))

    perLink[box] = [lat.perLinkMin, lat.perLinkMax]
    coldP[box] = trianglePlaquette(lat, eg, field).P
    coldW[box] = triangleWilsonLoops(lat, eg, field, plan.loops)
  }

  return {
    mapWorst: eg.mapWorst,
    mapBijective: eg.mapBijective,
    perLink,
    coldP,
    coldW,
    classes: sigmaClasses(eg.group).classes.map(c => ({
      rep: c.rep,
      size: c.size,
      level: c.level,
      trace: eg.group.trace[c.rep]!,
    })),
  }
}

// ---- the hysteresis window and the fine grid ----

// the grid betas where cold P - hot P exceeds plan.hysteresis
export function hysteresisBetas(plan: EnsemblePlan, scans: readonly ScanRead[]): number[] {
  const by = new Map<string, { hot?: number; cold?: number }>()

  for (const s of scans) {
    const e = by.get(betaKey(s.beta)) ?? {}

    e[s.start] = s.P
    by.set(betaKey(s.beta), e)
  }

  return [...by.entries()]
    .filter(([, e]) => e.hot !== undefined && e.cold !== undefined && e.cold - e.hot > plan.hysteresis)
    .map(([k]) => Number(k))
    .sort((a, b) => a - b)
}

// the fine betas: from the first hysteresis beta less a coarse step to the last plus one, by fineStep, off the coarse grid
// The fine betas: within one coarse step of the coarse-grid free-energy crossing (the hysteresis on R*'s triangles spans
// several units of beta, so the 0.05 grid is laid where beta_f is read, not across the whole loop), off the coarse grid.
export function fineBetas(plan: EnsemblePlan, scans: readonly ScanRead[]): number[] {
  const box = scans[0]?.box

  if (box === undefined) {
    return []
  }

  const cross = crossingOf(plan, scans, box, 'wilson')

  if (!cross.found) {
    return []
  }

  const step = plan.coarse[1]! - plan.coarse[0]!
  const lo = Math.floor((cross.betaF - step) / plan.fineStep) * plan.fineStep
  const hi = cross.betaF + step
  const out: number[] = []
  const coarse = new Set(plan.coarse.map(betaKey))

  for (let b = lo; b <= hi + 1e-9; b += plan.fineStep) {
    const r = Math.round(b * 100) / 100

    if (!coarse.has(betaKey(r)) && r >= 0) {
      out.push(r)
    }
  }

  return out
}

// ---- reading the stored stages ----

export type Stages = {
  instruments?: InstrumentStage
  scans: ScanRead[]
  mixed: MixedStage[]
  quick: QuickRead[]
  // STEP 3 at the crossing beta_f, both branches, with stored configurations
  branches: ScanRead[]
  // STEP 4 at the integer-level form's own crossing (bulk box), plaquette only
  levelBranches: QuickRead[]
  z2?: Z2Stage
}

export function readStages(plan: EnsemblePlan): Stages {
  const out: Stages = { scans: [], mixed: [], quick: [], branches: [], levelBranches: [] }
  const ins = `${plan.dir}color-ens-instruments.json`
  const z2 = `${plan.dir}color-ens-z2.json`

  if (existsSync(ins)) {
    out.instruments = JSON.parse(readFileSync(ins, 'utf8')) as InstrumentStage
  }

  if (existsSync(z2)) {
    out.z2 = JSON.parse(readFileSync(z2, 'utf8')) as Z2Stage
  }

  for (const box of [...plan.boxes, 'hyper8', 'hyper3d']) {
    const dir = boxDir(plan, box as BoxName)

    if (!existsSync(dir)) {
      continue
    }

    for (const f of readdirSync(dir).sort()) {
      if (f.startsWith('scan-') && f.endsWith('.json')) {
        out.scans.push(JSON.parse(readFileSync(dir + f, 'utf8')) as ScanRead)
      }

      if (f.startsWith('mixed-') && f.endsWith('.json')) {
        out.mixed.push(JSON.parse(readFileSync(dir + f, 'utf8')) as MixedStage)
      }

      if (f.startsWith('quick-') && f.endsWith('.json')) {
        out.quick.push(JSON.parse(readFileSync(dir + f, 'utf8')) as QuickRead)
      }

      if (f.startsWith('branch-') && f.endsWith('.json')) {
        out.branches.push(JSON.parse(readFileSync(dir + f, 'utf8')) as ScanRead)
      }

      if (f.startsWith('lbranch-') && f.endsWith('.json')) {
        out.levelBranches.push(JSON.parse(readFileSync(dir + f, 'utf8')) as QuickRead)
      }
    }
  }

  return out
}

// a stage's JSON: under the box's folder, or (box '') beside it as color-ens-<name>.json
export function writeStage(plan: EnsemblePlan, box: string, name: string, value: unknown): void {
  const path =
    box === '' ? `${plan.dir}color-ens-${name}.json` : `${boxDir(plan, box as BoxName)}${name}.json`

  mkdirSync(box === '' ? plan.dir : boxDir(plan, box as BoxName), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 1))
}

export function stageExists(plan: EnsemblePlan, box: string, name: string): boolean {
  return existsSync(`${boxDir(plan, box as BoxName)}${name}.json`)
}

export const scanName = (s: { form: ActionForm; start: string; beta: number }): string =>
  `scan-${s.form}-${s.start}-b${betaKey(s.beta)}`

// ---- the verdict ----

const flag = (b: boolean): number => (b ? 1 : 0)

export function ensembleVerdict(plan: EnsemblePlan, stages: Stages): Verdict {
  const ins = stages.instruments
  const I =
    ins !== undefined &&
    ins.mapWorst <= 1e-12 &&
    ins.mapBijective &&
    plan.boxes.every(
      b =>
        ins.perLink[b]?.[0] === 8 &&
        ins.perLink[b]?.[1] === 8 &&
        Math.abs(ins.coldP[b]! - 1) < 1e-12 &&
        ins.coldW[b]!.every(w => Math.abs(w - 1) < 1e-12),
    )
  // the published 3.43(2) is Sigma(216 x 3) = Sigma(648) in 2+1d (Gustafson et al. Table I; its 3+1d cell is empty), so
  // the control is the 8^3 lattice; the 8^4 crossing is reported beside it with no published value to meet
  const control = crossingOf(plan, stages.quick, 'hyper3d', 'wilson')
  const control4 = crossingOf(plan, stages.quick, 'hyper8', 'wilson')
  const z2 = stages.z2
  const Z2 = z2 !== undefined && z2.found && Math.abs(z2.betaF - z2.target) <= 0.005
  const C =
    control.found && Math.abs(control.betaF - plan.control.target) <= plan.control.tolerance
  const metrics: Record<string, number> = { I: flag(I), Z2: flag(Z2), C: flag(C) }
  const mixedControl = stages.mixed.find(m => m.box === 'hyper8')

  metrics.hyper3dBetaF = control.betaF
  metrics.hyper4dBetaF = control4.betaF

  if (z2) {
    metrics.z2BetaF = z2.betaF
    metrics.z2Target = z2.target
  }

  if (mixedControl) {
    metrics.hyperMixedHeld = flag(mixedControl.bracketHeld)
  }

  const lines: string[] = []

  let allRead = true

  for (const box of plan.boxes) {
    const scans = stages.scans.filter(s => s.box === box && s.form === 'wilson')
    const coarseRead = plan.coarse.every(b =>
      (['hot', 'cold'] as const).every(st =>
        scans.some(s => betaKey(s.beta) === betaKey(b) && s.start === st),
      ),
    )
    const h = hysteresisBetas(plan, scans)
    const cross = crossingOf(plan, scans, box, 'wilson')
    const hot = stages.branches.find(s => s.box === box && s.form === 'wilson' && s.start === 'hot')
    const cold = stages.branches.find(s => s.box === box && s.form === 'wilson' && s.start === 'cold')
    const read = coarseRead && cross.found && hot !== undefined && cold !== undefined

    allRead &&= read
    metrics[`${box}BetaF`] = cross.betaF
    metrics[`${box}Slope`] = cross.slope

    if (hot && cold) {
      metrics[`${box}PhotF`] = hot.P
      metrics[`${box}PcoldF`] = cold.P
    }

    const worstSpacing = Math.min(...scans.map(s => s.spacingOverTwoTau))

    metrics[`${box}Hysteresis`] = h.length
    metrics[`${box}WorstSpacingOver2Tau`] = Number.isFinite(worstSpacing) ? worstSpacing : 0
    lines.push(
      `${box}: both branches at grid beta ${h.length > 0 ? `${h[0]} to ${h[h.length - 1]}` : 'none'}; beta_f ${cross.found ? cross.betaF.toFixed(3) : 'not read'}${hot && cold ? `, P confined ${hot.P.toFixed(4)}, frozen ${cold.P.toFixed(4)}, W(2) ${hot.wilson[2]!.toExponential(2)} and ${cold.wilson[2]!.toFixed(4)}` : ''}`,
    )
  }

  const levels = crossingOf(plan, stages.quick, 'bulk8', 'levels')
  const lHot = stages.levelBranches.find(s => s.start === 'hot')
  const lCold = stages.levelBranches.find(s => s.start === 'cold')

  metrics.levelsBetaF = levels.betaF

  if (lHot && lCold) {
    metrics.levelsPhotF = lHot.P
    metrics.levelsPcoldF = lCold.P
  }

  const status: Verdict['status'] = !I || !Z2 || !C ? 'open' : allRead ? 'pass' : 'partial'

  return verdict({
    status,
    claim: `Sigma(648) Wilson form on R*'s fcc triangles (8 a link), beta_f by the free-energy crossing: ${lines.join('; ')}. Controls: Z2 self-dual point ${z2 ? `${z2.betaF.toFixed(4)} against ${z2.target.toFixed(4)}` : 'not read'}; hypercubic 8^3 (2+1d) beta_f ${control.found ? control.betaF.toFixed(3) : 'not read'} against the published ${plan.control.target}; hypercubic 8^4 (3+1d) ${control4.found ? control4.betaF.toFixed(3) : 'not read'} (no published value). Integer-level form (bulk): beta_f ${levels.found ? levels.betaF.toFixed(3) : 'not read'}${lHot && lCold ? `, P confined ${lHot.P.toFixed(4)}, frozen ${lCold.P.toFixed(4)}` : ''}.`,
    metrics,
    control: { I: flag(I), Z2: flag(Z2), C: flag(C) },
    notes:
      'A heat-bath driven by a Weyl stream (deterministic, quasi-random schedule). beta_f is where ln Z of the confined branch (integrated up from beta 0) meets ln Z of the frozen branch (integrated down from the flat-field count), on the measured branch plaquettes; the brief\'s mixed starts were tried on the control and their interface stayed pinned (fraction 0.439 to 0.442 over 200 sweeps at beta 3.8), so they cannot decide on these boxes. Wilson loops are an area-law diagnostic, never a gate. The colour is read in the 4D bulk and on the slab boxes, never on the husk.',
  })
}

// STEP 3 at beta_f: both branches, stored as branch-wilson-<start>.json with configurations wilson-b<beta>f-<start>-<i>
export function branchStage(plan: EnsemblePlan, box: BoxName, betaF: number, start: 'hot' | 'cold'): ScanRead {
  const beta = Math.round(betaF * 100) / 100

  return scanBeta({ plan, box, form: 'wilson', beta, start, tag: 'f' })
}

// STEP 4 at the integer-level form's crossing: both branches, the Wilson read's sweeps, no stored configurations
export function levelBranchStage(plan: EnsemblePlan, betaF: number, start: 'hot' | 'cold'): QuickRead {
  const beta = Math.round(betaF * 100) / 100

  return quickScan({ plan, box: 'bulk8', form: 'levels', beta, start, therm: plan.therm, sweeps: plan.sweeps })
}

// the whole plan in one process (many hours): instruments, the control, every scan, the crossings, the branch reads
export function ensembleRun(plan: EnsemblePlan): Verdict {
  writeStage(plan, '', 'instruments', instrumentStage(plan))
  writeStage(plan, '', 'z2', z2Stage())

  const eg = ensembleGroup()

  for (const box of ['hyper3d', 'hyper8'] as const) {
    for (const start of ['hot', 'cold'] as const) {
      for (const beta of plan.control[start]) {
        const q = quickScan({ plan, box, form: 'wilson', beta, start, therm: plan.control.therm, sweeps: plan.control.sweeps, eg })

        writeStage(plan, box, `quick-wilson-${start}-b${betaKey(beta)}`, q)
      }
    }
  }

  for (const box of plan.boxes) {
    const lat = triangleLattice(boxOf(box))
    const scans: ScanRead[] = []
    const scanAll = (betas: readonly number[]): void => {
      for (const beta of betas) {
        for (const start of ['hot', 'cold'] as const) {
          const s = scanBeta({ plan, box, form: 'wilson', beta, start, eg, lat })

          scans.push(s)
          writeStage(plan, box, scanName(s), s)
        }
      }
    }

    scanAll(plan.coarse)
    scanAll(fineBetas(plan, scans))

    const cross = crossingOf(plan, scans, box, 'wilson')

    if (cross.found) {
      for (const start of ['hot', 'cold'] as const) {
        writeStage(plan, box, `branch-wilson-${start}`, branchStage(plan, box, cross.betaF, start))
      }
    }
  }

  const lat = triangleLattice(boxOf('bulk8'))

  for (const start of ['hot', 'cold'] as const) {
    for (const beta of plan.levels[start]) {
      const q = quickScan({ plan, box: 'bulk8', form: 'levels', beta, start, therm: plan.levels.therm, sweeps: plan.levels.sweeps, eg, lat })

      writeStage(plan, 'bulk8', `quick-levels-${start}-b${betaKey(beta)}`, q)
    }
  }

  const lCross = crossingOf(plan, readStages(plan).quick, 'bulk8', 'levels')

  if (lCross.found) {
    for (const start of ['hot', 'cold'] as const) {
      writeStage(plan, 'bulk8', `lbranch-levels-${start}`, levelBranchStage(plan, lCross.betaF, start))
    }
  }

  return ensembleVerdict(plan, readStages(plan))
}

export default experiment({
  id: 'gauge/color-ensemble',
  code: 'E-FRC-0297',
  title:
    "explores whether Sigma(648) colour with the Wilson triangle action on R*'s own D4 lattice has a first-order freezing point beta_f, the coupling decision 012 candidate (b) lets the rule fix, and stores the ensemble on both branches for the colour gates",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return ensembleRun(ENSEMBLE_PLAN)
  },
})
