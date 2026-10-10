// A SPACETIME Z3 CAGE (note/project/vibe/roadmap/moving-matter item 0081, research/outside-the-box.md 3.1). Explores
// whether centre phases that differ between the two hops of the cycle (family 1), or that also cycle with the beat mod 3
// (family 2, c(t) = c + t a: the discrete form of coherent destruction of tunnelling, 1 + omega + omega^2 = 0), could
// stop a lone third exactly, where cf0 (one pattern on both hops) only slows it (item 0074, C_inf 0.883).
//
// STEP 0 INSTRUMENT: c_f = c_b = cf0 on 0074's cage engine reproduces 0074's C_inf on nk 20 to 1e-8 (its stage files),
//  identity reads 1, the pi-flux rhombic chain through the same velocity function reads C_inf under 1e-12 with flat
//  weight 1; the Krylov read agrees with the dense block and with 0074's 8 x 8 reduction at sample momenta.
// STEP 1 SCREEN: per class, half + plain set, then the Wilson set on survivors: the start span's band speed at the first
//  of 8 fixed generic momenta (a pre-reject: a flat band has none), then every weighted eigenphase within 1e-9 across all 8.
// STEP 2: survivors get C_inf and the flat weight on nk 20 and 40, both sets.
//
// GATES, fixed 2026-10-09 before any read (item 0081): CONFINED when some class reads C_inf under 1e-6 with flat weight
// within 1e-6 of 1 on BOTH sets. NONE when no class does. OPEN when STEP 0 fails or the screen cannot cover a family (the
// covered fraction reported). Uniqueness is reported, never gated. CONTROL that must fail: c_f = c_b (cf0 itself).
//
// DETERMINISM: no random numbers. Depth L2: band reads of a uniform colour field on the 4D bulk, never the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { GATES_PLAN } from '@/code/measure/color-gates'
import { enumerateCenterPatterns, ADDITIVE, ROTATIONS, rotatePattern } from '@/code/measure/center-flux'
import { cageGeometry, gridVelocity, reducedPoint, samplePoints, type CageGeometry } from '@/code/measure/cage-velocity'
import {
  addPattern,
  cageEngine,
  chainControl,
  circ,
  classesUnder,
  densePointRead,
  family1,
  family2,
  gridRead,
  halfEngines,
  loopCounts,
  oddIndex,
  oddPattern,
  pointRead,
  scalePattern,
  screenClass,
  screenMomenta,
  stabilizerOf,
  type Engine,
  type GridRead,
  type HalfEngines,
  type Schedule,
  type ScreenRead,
} from '@/code/measure/cage-spacetime'

export const CONFINED_UNDER = 1e-6
export const FLAT_WITHIN = 1e-6
export const STEP0_TOL = 1e-8
export const STEP2_GRIDS = [20, 40] as const

type Setup = { geo: CageGeometry; cage: Engine; half: HalfEngines; cf0: Int8Array; zero: Int8Array }

let shared: Setup | undefined

export function setup(): Setup {
  if (!shared) {
    const geo = cageGeometry(GATES_PLAN.cage.side)

    shared = {
      geo,
      cage: cageEngine(geo),
      half: halfEngines(geo),
      cf0: enumerateCenterPatterns().kept[0]!.pattern.c,
      zero: new Int8Array(24),
    }
  }

  return shared
}

export type Survivor = {
  family: 1 | 2
  index: number
  plain: ScreenRead
  wilson: ScreenRead
  loops: ReturnType<typeof loopCounts>
  charge2: { plain: ScreenRead; wilson: ScreenRead }
  charge3Gap: number
}

export type ScreenStage = {
  kind: 'screen'
  family: 1 | 2
  part: [number, number]
  // classes in this part, of the family's restricted total, and the stabilizer order
  classes: number
  total: number
  stabilizer: number
  additiveOk: boolean
  plainPass: number
  wilsonPass: number
  survivors: Survivor[]
  // the control class (c_b = cf0, or a = 0) and its screen
  control?: { index: number; plain: ScreenRead }
  // the least pre-reject speed^2 met, the class carrying it, and a histogram of log10 v2First
  leastV2: number
  leastIndex: number
  histogram: Record<string, number>
  // the largest Krylov dimension met at the first momentum
  maxDimension: number
  seconds: number
}

export type InstrumentStage = {
  kind: 'instrument'
  // the Krylov read against 0074's 8 x 8 reduction (cage engine, start S e_0), cf0 and identity, 48 sample momenta
  reducedV2Gap: number
  reducedPoints: number
  // the Krylov read against the dense block (spectrum weighted phases and v2), half sets, family 1 and 2 samples
  denseV2Gap: number
  densePhaseGap: number
  densePoints: number
  krylovResidual: number
  startLoss: number
  unitarity: number
  // grid nk 6 mixed v2: a common additive shift of every half-beat (gauge) against one half-beat shifted (not gauge)
  gaugeCommonGap: number
  gaugeHalfBeatGap: number
  // grid nk 6 mixed v2 of a family-1 class against its rotated images (stabilizer of cf0)
  rotationGap: number
  // charge 3: the supercycle phases are all 1, so the read equals identity links
  charge3Gap: number
  sRank: number
  pieceGap: number
  orthoGap: number
  seconds: number
}

export type CstStage =
  | { kind: 'step0'; field: string; read: GridRead }
  | { kind: 'chain'; reads: { flux: number; v2: number; flatWeight: number }[]; seconds: number }
  | InstrumentStage
  | ScreenStage
  | { kind: 'grid'; family: 1 | 2; index: number; set: string; read: GridRead; flat: number[] }

export type CstSpec = { name: string; run: () => CstStage }

const scheduleOf = (s: Setup, family: 1 | 2, index: number): Schedule =>
  family === 1 ? family1(s.cf0, oddPattern(index)) : family2(s.cf0, s.cf0, oddPattern(index))

const charged = (schedule: Schedule, q: number): Schedule => schedule.map(c => scalePattern(c, q))

function histogramKey(v: number): string {
  return v <= 0 ? 'zero' : `1e${Math.floor(Math.log10(v))}`
}

export function screenStage(family: 1 | 2, part: [number, number]): ScreenStage {
  const t0 = Date.now()
  const s = setup()
  const stab = stabilizerOf(s.cf0)
  const { indices, total } = classesUnder(stab, family === 1)
  const mine = indices.filter((_, i) => i % part[1] === part[0])
  const momenta = screenMomenta()
  const controlIndex = family === 1 ? oddIndex(s.cf0) : 0
  const survivors: Survivor[] = []
  const histogram: Record<string, number> = {}

  let plainPass = 0
  let wilsonPass = 0
  let leastV2 = Infinity
  let leastIndex = -1
  let maxDimension = 0
  let control: ScreenStage['control']

  for (const index of mine) {
    const schedule = scheduleOf(s, family, index)
    const plain = screenClass(s.half.plain, schedule, momenta)
    const key = histogramKey(plain.v2First)

    histogram[key] = (histogram[key] ?? 0) + 1
    maxDimension = Math.max(maxDimension, plain.m)

    if (plain.v2First < leastV2) {
      leastV2 = plain.v2First
      leastIndex = index
    }

    if (index === controlIndex) {
      control = { index, plain }
    }

    if (!plain.pass) {
      continue
    }

    plainPass++

    const wilson = screenClass(s.half.wilson, schedule, momenta)

    if (!wilson.pass) {
      continue
    }

    wilsonPass++

    const c3 = pointRead(s.half.plain, charged(schedule, 3), momenta[0]!)
    const id = pointRead(s.half.plain, schedule.map(() => s.zero), momenta[0]!)

    survivors.push({
      family,
      index,
      plain,
      wilson,
      loops: loopCounts(schedule),
      charge2: {
        plain: screenClass(s.half.plain, charged(schedule, 2), momenta),
        wilson: screenClass(s.half.wilson, charged(schedule, 2), momenta),
      },
      charge3Gap: Math.max(
        ...c3.v2.map((v, j) => Math.abs(v - id.v2[j]!)),
        c3.phases.length === id.phases.length ? Math.max(0, ...c3.phases.map((p, i) => circ(p, id.phases[i]!))) : Infinity,
      ),
    })
  }

  return {
    kind: 'screen',
    family,
    part,
    classes: mine.length,
    total: indices.length,
    stabilizer: stab.rotations.length,
    additiveOk: stab.additiveOk,
    plainPass,
    wilsonPass,
    survivors,
    control,
    leastV2,
    leastIndex,
    histogram,
    maxDimension,
    seconds: (Date.now() - t0) / 1000,
  }
}

export function instrumentStage(): InstrumentStage {
  const t0 = Date.now()
  const s = setup()
  const sample = samplePoints(48)
  const angleOf = (c: Int8Array): Float64Array => Float64Array.from(c, v => (2 * Math.PI * v) / 3)

  let reducedV2Gap = 0
  let reducedPoints = 0
  let krylovResidual = 0
  let startLoss = 0
  let unitarity = 0

  for (const c of [s.cf0, s.zero]) {
    for (const theta of sample) {
      const red = reducedPoint(s.geo, angleOf(c), theta)

      if (red.singular > 0) {
        continue
      }

      const k = pointRead(s.cage, [c, c], theta)

      reducedV2Gap = Math.max(reducedV2Gap, Math.abs(red.v2 - k.v2[0]!))
      reducedPoints++
      krylovResidual = Math.max(krylovResidual, k.krylovResidual)
      startLoss = Math.max(startLoss, k.startLoss)
      unitarity = Math.max(unitarity, k.unitarity)
    }
  }

  // dense against Krylov on the half sets: static cf0, a family-1 class, a family-2 class
  const l = ADDITIVE[1]!
  const schedules: Schedule[] = [
    family1(s.cf0, s.cf0),
    family1(s.cf0, oddPattern(12345)),
    family1(s.cf0, addPattern(s.cf0, l)),
    family2(s.cf0, s.cf0, oddPattern(4321)),
  ]

  let denseV2Gap = 0
  let densePhaseGap = 0
  let densePoints = 0

  for (const engine of [s.half.plain, s.half.wilson]) {
    for (const schedule of schedules) {
      for (const theta of screenMomenta(3)) {
        const k = pointRead(engine, schedule, theta)
        const d = densePointRead(engine, schedule, theta)
        const wk = k.phases.filter((_, c) => k.weights[c]!.reduce((x, y) => x + y, 0) > 1e-10)
        const wd = d.phases.filter((_, c) => d.weights[c]!.reduce((x, y) => x + y, 0) > 1e-10)

        denseV2Gap = Math.max(denseV2Gap, ...k.v2.map((v, j) => Math.abs(v - d.v2[j]!)))
        densePhaseGap = Math.max(
          densePhaseGap,
          ...wk.map(p => Math.min(...wd.map(q => circ(p, q)))),
          ...wd.map(p => Math.min(...wk.map(q => circ(p, q)))),
        )
        densePoints++
        krylovResidual = Math.max(krylovResidual, k.krylovResidual)
        startLoss = Math.max(startLoss, k.startLoss)
        unitarity = Math.max(unitarity, k.unitarity, d.unitarity)
      }
    }
  }

  // gauge: nk 6 holds every additive shift (2 pi / 3 is a multiple of 2 pi / 6), so a gauge leaves the grid mean exact
  const g6 = (sch: Schedule): number => gridRead(s.half.plain, sch, 6).v2Mixed
  const base = g6(family1(s.cf0, s.cf0))
  const gaugeCommonGap = Math.abs(base - g6(family1(addPattern(s.cf0, l), addPattern(s.cf0, l))))
  const gaugeHalfBeatGap = Math.abs(base - g6(family1(s.cf0, addPattern(s.cf0, l))))
  // rotation: a family-1 class against its images under the stabilizer of cf0
  const stab = stabilizerOf(s.cf0)
  const cb = oddPattern(12345)
  const ref = g6(family1(s.cf0, cb))

  let rotationGap = 0

  for (const g of stab.rotations.slice(1)) {
    const img = family1(rotate(s.cf0, g.index), rotate(cb, g.index))

    rotationGap = Math.max(rotationGap, Math.abs(ref - g6(img)))
  }

  const c3 = pointRead(s.half.plain, charged(family2(s.cf0, s.cf0, oddPattern(4321)), 3), sample[30]!)
  const id = pointRead(s.half.plain, Array(6).fill(s.zero), sample[30]!)

  return {
    kind: 'instrument',
    reducedV2Gap,
    reducedPoints,
    denseV2Gap,
    densePhaseGap,
    densePoints,
    krylovResidual,
    startLoss,
    unitarity,
    gaugeCommonGap,
    gaugeHalfBeatGap,
    rotationGap,
    charge3Gap: Math.max(
      ...c3.v2.map((v, j) => Math.abs(v - id.v2[j]!)),
      ...c3.phases.map((p, i) => circ(p, id.phases[i] ?? Infinity)),
    ),
    sRank: s.half.sRank,
    pieceGap: s.half.pieceGap,
    orthoGap: s.half.orthoGap,
    seconds: (Date.now() - t0) / 1000,
  }
}

const rotate = (c: Int8Array, index: number): Int8Array => rotatePattern(c, ROTATIONS[index]!)

export function cstSpecs(): CstSpec[] {
  const out: CstSpec[] = []

  for (const field of ['cf0', 'identity']) {
    out.push({
      name: `step0-${field}`,
      run: () => {
        const s = setup()
        const c = field === 'cf0' ? s.cf0 : s.zero

        return { kind: 'step0', field, read: gridRead(s.cage, [c, c], 20) }
      },
    })
  }

  out.push({
    name: 'chain',
    run: () => {
      const t0 = Date.now()

      return { kind: 'chain', reads: [Math.PI, 0].map(f => chainControl(f, 4096)), seconds: (Date.now() - t0) / 1000 }
    },
  })
  out.push({ name: 'instrument', run: instrumentStage })

  for (const family of [1, 2] as const) {
    for (const parts of [1, 2]) {
      for (let p = 0; p < parts; p++) {
        out.push({ name: `f${family}-${p}of${parts}`, run: () => screenStage(family, [p, parts]) })
      }
    }
  }

  return out
}

// grid:<family>:<index>:<set>:<nk>, for a survivor; flat phases from its screen
export function gridSpec(name: string, flat: number[]): CstSpec | undefined {
  const m = /^grid-f([12])-(\d+)-(plain|wilson|identity-plain|identity-wilson)-(\d+)$/.exec(name)

  if (!m) {
    return undefined
  }

  const family = Number(m[1]) as 1 | 2
  const index = Number(m[2])
  const set = m[3]!
  const nk = Number(m[4])

  return {
    name,
    run: () => {
      const s = setup()
      const engine = set.endsWith('wilson') ? s.half.wilson : s.half.plain
      const schedule = set.startsWith('identity') ? scheduleOf(s, family, index).map(() => s.zero) : scheduleOf(s, family, index)

      return { kind: 'grid', family, index, set, read: gridRead(engine, schedule, nk, flat), flat }
    },
  }
}

export function cageSpacetimeVerdict(stages: readonly CstStage[], ref: { cf0V2: number; identityV2: number }): Verdict {
  const metrics: Record<string, number> = {}
  const notes: string[] = []
  const step0 = (f: string): GridRead | undefined =>
    stages.find((x): x is Extract<CstStage, { kind: 'step0' }> => x.kind === 'step0' && x.field === f)?.read
  const cf = step0('cf0')
  const id = step0('identity')

  // STEP 0
  let step0Ok = false

  if (cf && id) {
    const C = Math.sqrt(cf.v2[0]! / id.v2[0]!)
    const C74 = Math.sqrt(ref.cf0V2 / ref.identityV2)

    metrics.step0Cinf = C
    metrics.step0Cinf0074 = C74
    metrics.step0Gap = Math.abs(C - C74)
    metrics.step0V2GapCf0 = Math.abs(cf.v2[0]! - ref.cf0V2)
    metrics.step0V2GapIdentity = Math.abs(id.v2[0]! - ref.identityV2)
    metrics.step0IdentityCinf = Math.sqrt(id.v2[0]! / id.v2[0]!)
    metrics.step0FlatWeightCf0 = cf.flatWeight
    metrics.step0KrylovResidual = Math.max(cf.krylovResidual, id.krylovResidual)
    metrics.step0Unitarity = Math.max(cf.unitarity, id.unitarity)
    step0Ok = metrics.step0Gap < STEP0_TOL && metrics.step0KrylovResidual < 1e-9
  } else {
    notes.push('STEP 0 grid missing')
  }

  const chain = stages.find((x): x is Extract<CstStage, { kind: 'chain' }> => x.kind === 'chain')
  const pi = chain?.reads.find(r => r.flux === Math.PI)
  const zero = chain?.reads.find(r => r.flux === 0)
  const chainC = pi && zero ? Math.sqrt(pi.v2 / zero.v2) : NaN
  const chainOk = !!pi && !!zero && chainC < 1e-12 && Math.abs(pi.flatWeight - 1) < 1e-12 && zero.v2 > 1e-3

  metrics.chainCinf = chainC
  metrics.chainFlatWeight = pi?.flatWeight ?? NaN

  const inst = stages.find((x): x is InstrumentStage => x.kind === 'instrument')

  if (inst) {
    for (const [k, v] of Object.entries(inst)) {
      if (typeof v === 'number') {
        metrics[`instrument_${k}`] = v
      }
    }
  }

  const instOk =
    !!inst &&
    inst.reducedV2Gap < 1e-10 &&
    inst.denseV2Gap < 1e-9 &&
    inst.densePhaseGap < 1e-9 &&
    inst.krylovResidual < 1e-9 &&
    inst.startLoss < 1e-12 &&
    inst.gaugeCommonGap < 1e-10 &&
    inst.rotationGap < 1e-10 &&
    inst.charge3Gap < 1e-12

  // STEP 1: every part of a family present
  const screens = stages.filter((x): x is ScreenStage => x.kind === 'screen')
  const familyRead = (family: 1 | 2): { covered: number; total: number; stages: ScreenStage[] } | undefined => {
    for (const parts of [1, 2]) {
      const st = Array.from({ length: parts }, (_, p) =>
        screens.find(x => x.family === family && x.part[0] === p && x.part[1] === parts),
      )

      if (st.every(x => !!x)) {
        const got = st as ScreenStage[]

        return { covered: got.reduce((a, x) => a + x.classes, 0), total: got[0]!.total, stages: got }
      }
    }

    return undefined
  }
  const f1 = familyRead(1)
  const f2 = familyRead(2)
  const survivors = [f1, f2].flatMap(f => f?.stages.flatMap(x => x.survivors) ?? [])

  for (const [f, r] of [
    [1, f1],
    [2, f2],
  ] as const) {
    if (!r) {
      notes.push(`family ${f} screen missing`)
      continue
    }

    metrics[`f${f}Classes`] = r.covered
    metrics[`f${f}PlainPass`] = r.stages.reduce((a, x) => a + x.plainPass, 0)
    metrics[`f${f}BothPass`] = r.stages.reduce((a, x) => a + x.wilsonPass, 0)
    metrics[`f${f}LeastV2`] = Math.min(...r.stages.map(x => x.leastV2))
    metrics[`f${f}MaxDimension`] = Math.max(...r.stages.map(x => x.maxDimension))

    const ctl = r.stages.find(x => x.control)?.control

    metrics[`f${f}ControlV2`] = ctl?.plain.v2First ?? NaN
    metrics[`f${f}ControlPass`] = ctl ? (ctl.plain.pass ? 1 : 0) : NaN
  }

  // STEP 2: grids of survivors
  const grids = stages.filter((x): x is Extract<CstStage, { kind: 'grid' }> => x.kind === 'grid')
  const caging = survivors.filter(sv =>
    ['plain', 'wilson'].every(set => {
      const g = STEP2_GRIDS.map(nk => {
        const c = grids.find(x => x.family === sv.family && x.index === sv.index && x.set === set && x.read.nk === nk)
        const i = grids.find(x => x.family === sv.family && x.index === sv.index && x.set === `identity-${set}` && x.read.nk === nk)

        return c && i ? { C: Math.sqrt(c.read.v2Mixed / i.read.v2Mixed), flat: c.read.flatWeight } : undefined
      })

      return g.every(x => !!x && x.C < CONFINED_UNDER && Math.abs(x.flat - 1) < FLAT_WITHIN)
    }),
  )
  const step2Missing = survivors.length > 0 && caging.length === 0 && grids.length === 0

  metrics.survivors = survivors.length
  metrics.caging = caging.length

  const controlFails = (f1?.stages.find(x => x.control)?.control?.plain.pass ?? true) === false

  let status: Verdict['status'] = 'open'
  let word = 'OPEN'

  if (!step0Ok || !chainOk || !instOk) {
    notes.push(`STEP 0 ${step0Ok ? 'ok' : 'FAILED'}, chain ${chainOk ? 'ok' : 'FAILED'}, instrument ${instOk ? 'ok' : 'FAILED'}`)
  } else if (!controlFails) {
    notes.push('the static control (c_b = cf0) passed the screen or is missing')
  } else if (caging.length > 0) {
    status = 'pass'
    word = 'CONFINED'
  } else if (step2Missing) {
    notes.push('survivors without their STEP 2 grids')
  } else if (!f1 || !f2 || f1.covered < f1.total) {
    notes.push('a family screen is missing')
  } else {
    // family 1 restricted by the brief's 1e7 rule; family 2 covered only on c_f = c_b = cf0
    status = 'open'
    word = 'OPEN'
    notes.push(
      `NONE among the screened classes; family 2 covered only on c_f = c_b = cf0 (${f2.covered} classes of about 1.5e12 rotation classes)`,
    )
  }

  return verdict({
    status,
    claim: `${word}: STEP 0 C_inf ${metrics.step0Cinf?.toFixed(10)} against 0074 ${metrics.step0Cinf0074?.toFixed(10)}; family 1 (c_f = cf0, c_b free) ${metrics.f1Classes} classes, plain pass ${metrics.f1PlainPass}, both ${metrics.f1BothPass}, least band speed^2 ${metrics.f1LeastV2?.toExponential(2)}; family 2 (c_f = c_b = cf0, a free) ${metrics.f2Classes} classes, plain pass ${metrics.f2PlainPass}, both ${metrics.f2BothPass}, least ${metrics.f2LeastV2?.toExponential(2)}; caging ${caging.length}.`,
    metrics,
    control: { staticControlPass: metrics.f1ControlPass ?? NaN, chainCinf: chainC },
    notes: ['Uniform fields on the 4D bulk mesh, half + plain and Wilson sets, never the husk.', ...notes].join(' '),
  })
}

export default experiment({
  id: 'gauge/cage-spacetime',
  code: 'E-FRC-0000',
  title: 'explores whether centre phases that change with the half-beat could stop a lone third exactly where cf0 only slows it',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // serially (about an hour; the stage runner deck/vibe/tmp/cst.sh splits it). 0074's reference is its own grid read.
    const s = setup()
    const ref = {
      cf0V2: reducedGrid(s, s.cf0),
      identityV2: reducedGrid(s, s.zero),
    }

    return cageSpacetimeVerdict(
      cstSpecs()
        .filter(x => !x.name.includes('of2'))
        .map(x => x.run()),
      ref,
    )
  },
})

function reducedGrid(s: Setup, c: Int8Array): number {
  return gridVelocity(s.geo, Float64Array.from(c, v => (2 * Math.PI * v) / 3), 20).v2
}
