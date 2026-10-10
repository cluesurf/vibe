// IS cf0 A CAGE OR A SLOWING? (note/project/vibe/roadmap/moving-matter item 0074, decision 017 point 3). Explores whether
// the centre field cf0 (item 0058) could stop a lone third for ever, or only slows it. A static periodic field confines
// only by Aharonov-Bohm flat bands, so the read is C_inf = v_inf(cf0) / v_inf(identity), the long-time speed of item
// 0065's one-dock colour-mixed start from the Bloch bands of the cage engine itself (code/measure/cage-velocity).
//
// STEP 1 INSTRUMENT: the start evolved block by block on the side-20 momentum grid for 64 beats and transformed back to
//  the box reproduces dockCageRead's rms at every beat and its C (cf0 0.8719, identity 1) to 1e-8, else OPEN.
// STEP 2: v_inf^2 = mean over momenta of the start's band-weighted |grad eps|^2 (Hellmann-Feynman, clusters diagonalized
//  in the velocity), on nk 20, 40, 60 until C_inf moves under 1e-3; the start's weight on bands narrower than 1e-9. The
//  reduction is checked against the dense 192 x 192 block at sample momenta.
// STEP 3, printed, never gated: C over beats 16-32, 32-48, 48-64 and the rms log-log slope.
//
// GATES, fixed 2026-10-09 before any read (decision 017 point 3):
//  CONFINED  C_inf under 1e-6 and the flat weight within 1e-6 of 1 (an Aharonov-Bohm cage)
//  SLOWED    C_inf at least 1e-6 (part of the third moves ballistically for ever)
//  OPEN      STEP 1 fails, or the grids do not converge
// CONTROLS: identity links C_inf exactly 1 (reads SLOWED); the pi-flux rhombic chain of Vidal, Mosseri and Doucot (PRL 81
//  5888 (1998)) through the same velocity function, C_inf under 1e-12 with flat weight 1, and nonzero at flux 0.
//
// DETERMINISM: no random numbers. Depth L2: a band read of a static colour field on the 4D bulk, never the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { GATES_PLAN, identityField, type ColorField } from '@/code/measure/color-gates'
import { centerField, enumerateCenterPatterns } from '@/code/measure/center-flux'
import { offsetDistances } from '@/code/measure/holonomy-caging'
import { dockCageRead } from '@/code/measure/color-gates-cage'
import {
  blockRms,
  cageGeometry,
  chainVelocity,
  fieldPhases,
  gridVelocity,
  instrumentPoint,
  samplePoints,
  slope,
  windowRead,
  type BlockRun,
  type CageGeometry,
  type ChainVelocity,
  type GridVelocity,
  type InstrumentPoint,
} from '@/code/measure/cage-velocity'

export const GRIDS = [20, 40, 60] as const
export const CONFINED_UNDER = 1e-6
export const FLAT_WITHIN = 1e-6
export const STEP1_TOL = 1e-8
export const CONVERGED = 1e-3

export type GeometryRead = {
  side: number
  translationBad: number
  oppositeOk: boolean
  eOrtho: number
  startOk: boolean
  cosMu: number
  // per field: link phase angles in units of 2 pi / 3 and links that are not uniform scalars
  fields: { name: string; c: number[]; bad: number }[]
}

export type CvelStage =
  | { kind: 'step1'; field: string; geometry: GeometryRead; run: BlockRun }
  | { kind: 'grid'; field: string; read: GridVelocity }
  | { kind: 'instrument'; points: (InstrumentPoint & { field: string })[]; seconds: number }
  | { kind: 'chain'; reads: ChainVelocity[]; seconds: number }

export type CvelSpec = { name: string; run: () => CvelStage }

// dockCageRead's stored read on cf0 (0058's stage file): rmsC on cf0, rmsT the trivial carriage, ratio C
export type CageReference = { ratio: number; rmsT: number[]; rmsC: number[] }

let shared: { geo: CageGeometry; fields: { name: string; field: ColorField; angle: Float64Array }[]; geometry: GeometryRead } | undefined

function setup(): NonNullable<typeof shared> {
  if (!shared) {
    const side = GATES_PLAN.cage.side
    const geo = cageGeometry(side)
    const cf0 = enumerateCenterPatterns().kept[0]!.pattern
    const fields = [
      { name: 'cf0', field: centerField(cf0) },
      { name: 'identity', field: identityField },
    ].map(f => {
      const p = fieldPhases(f.field, side)

      return { ...f, angle: p.angle, bad: p.bad }
    })

    shared = {
      geo,
      fields,
      geometry: {
        side,
        translationBad: geo.translationBad,
        oppositeOk: geo.oppositeOk,
        eOrtho: geo.eOrtho,
        startOk: geo.startOk,
        cosMu: geo.cosMu,
        fields: fields.map(f => ({
          name: f.name,
          c: Array.from(f.angle, a => Math.round(((a / ((2 * Math.PI) / 3)) % 3 + 3) % 3)),
          bad: f.bad,
        })),
      },
    }
  }

  return shared
}

export function cvelSpecs(): CvelSpec[] {
  const out: CvelSpec[] = []

  for (const name of ['cf0', 'identity']) {
    out.push({
      name: `step1-${name}`,
      run: () => {
        const s = setup()
        const f = s.fields.find(x => x.name === name)!
        const r2 = offsetDistances(s.geo.side)

        return { kind: 'step1', field: name, geometry: s.geometry, run: blockRms(s.geo, f.angle, GATES_PLAN.cage.beats, r2) }
      },
    })

    for (const nk of GRIDS) {
      out.push({
        name: `grid-${name}-${nk}`,
        run: () => {
          const s = setup()
          const f = s.fields.find(x => x.name === name)!

          return { kind: 'grid', field: name, read: gridVelocity(s.geo, f.angle, nk) }
        },
      })
    }
  }

  out.push({
    name: 'instrument',
    run: () => {
      const t0 = Date.now()
      const s = setup()
      const points = s.fields.flatMap(f =>
        samplePoints(48).map(theta => ({ field: f.name, ...instrumentPoint(s.geo, f.angle, theta) })),
      )

      return { kind: 'instrument', points, seconds: (Date.now() - t0) / 1000 }
    },
  })

  out.push({
    name: 'chain',
    run: () => {
      const t0 = Date.now()

      return { kind: 'chain', reads: [Math.PI, 0].map(flux => chainVelocity(flux, 4096)), seconds: (Date.now() - t0) / 1000 }
    },
  })

  return out
}

export function cageVelocityVerdict(stages: readonly CvelStage[], ref: CageReference): Verdict {
  const { beats, fitFrom } = GATES_PLAN.cage
  const step1 = (f: string): Extract<CvelStage, { kind: 'step1' }> | undefined =>
    stages.find((s): s is Extract<CvelStage, { kind: 'step1' }> => s.kind === 'step1' && s.field === f)
  const grid = (f: string, nk: number): GridVelocity | undefined =>
    stages.find((s): s is Extract<CvelStage, { kind: 'grid' }> => s.kind === 'grid' && s.field === f && s.read.nk === nk)
      ?.read
  const S1c = step1('cf0')
  const S1i = step1('identity')
  const metrics: Record<string, number> = {}
  const notes: string[] = []

  // STEP 1
  let step1Ok = false
  let windows: ReturnType<typeof windowRead> | undefined

  if (S1c && S1i) {
    const g = S1c.geometry
    const gapC = Math.max(...ref.rmsC.map((v, b) => Math.abs(v - S1c.run.rms[b]!)))
    const gapT = Math.max(...ref.rmsT.map((v, b) => Math.abs(v - S1i.run.rms[b]!)))
    const xs = Array.from({ length: beats - fitFrom + 1 }, (_, i) => fitFrom + i)
    const speed = (r: number[]): number => slope(xs, xs.map(b => r[b]!))
    const Cblock = speed(S1c.run.rms) / speed(S1i.run.rms)
    const Cident = speed(S1i.run.rms) / speed(ref.rmsT)

    metrics.step1RmsGapCf0 = gapC
    metrics.step1RmsGapIdentity = gapT
    metrics.step1C = Cblock
    metrics.step1CGap = Math.abs(Cblock - ref.ratio)
    metrics.step1CIdentity = Cident
    metrics.step1NormDrift = Math.max(S1c.run.normDrift, S1i.run.normDrift)
    metrics.translationBad = g.translationBad
    metrics.eOrtho = g.eOrtho
    metrics.fieldBad = g.fields.reduce((s, f) => s + f.bad, 0)
    step1Ok =
      ref.rmsC.length === beats + 1 &&
      gapC < STEP1_TOL &&
      gapT < STEP1_TOL &&
      Math.abs(Cblock - ref.ratio) < STEP1_TOL &&
      Math.abs(Cident - 1) < STEP1_TOL &&
      g.translationBad === 0 &&
      g.oppositeOk &&
      g.startOk &&
      metrics.fieldBad === 0
    windows = windowRead(S1c.run.rms, S1i.run.rms, fitFrom, beats)
    windows.C.forEach((c, i) => {
      metrics[`window${16 * (i + 1)}C`] = c
    })
    metrics.alphaC = windows.alpha
  }

  // the instrument: reduced against dense
  const inst = stages.find((s): s is Extract<CvelStage, { kind: 'instrument' }> => s.kind === 'instrument')
  const regular = inst?.points.filter(p => p.singular === 0) ?? []

  if (inst) {
    metrics.instrumentPoints = regular.length
    metrics.instrumentSingular = inst.points.length - regular.length
    metrics.instrumentV2Gap = Math.max(...regular.map(p => Math.abs(p.reducedV2 - p.denseV2)))
    metrics.instrumentMeanGap = Math.max(...regular.map(p => p.meanGap))
    metrics.instrumentSpectrumGap = Math.max(...inst.points.map(p => p.spectrumGap))
    metrics.instrumentUnitarity = Math.max(...inst.points.map(p => p.unitarity))
  }

  const instOk =
    !!inst &&
    regular.length > 0 &&
    metrics.instrumentV2Gap! < 1e-8 &&
    metrics.instrumentSpectrumGap! < 1e-8 &&
    metrics.instrumentUnitarity! < 1e-10

  // STEP 2
  const rows = GRIDS.map(nk => {
    const c = grid('cf0', nk)
    const i = grid('identity', nk)

    return c && i
      ? {
          nk,
          C: Math.sqrt(c.v2 / i.v2),
          Ccentered: Math.sqrt(c.v2Centered / i.v2Centered),
          vC: Math.sqrt(c.v2) / 2,
          vI: Math.sqrt(i.v2) / 2,
          flat: c.flatWeight,
          flatI: i.flatWeight,
          meanC: Math.hypot(...c.mean),
          singular: c.singular + i.singular,
        }
      : undefined
  })
  const read = rows.filter((r): r is NonNullable<typeof r> => !!r)

  read.forEach(r => {
    metrics[`Cinf${r.nk}`] = r.C
    metrics[`CinfCentered${r.nk}`] = r.Ccentered
    metrics[`vInfCf0PerBeat${r.nk}`] = r.vC
    metrics[`vInfIdentityPerBeat${r.nk}`] = r.vI
    metrics[`flatWeight${r.nk}`] = r.flat
    metrics[`meanSpeedCf0${r.nk}`] = r.meanC
    metrics[`singular${r.nk}`] = r.singular
  })

  let converged: (typeof read)[number] | undefined

  for (let i = 1; i < read.length; i++) {
    if (read[i]!.nk === read[i - 1]!.nk + 20 && Math.abs(read[i]!.C - read[i - 1]!.C) < CONVERGED) {
      converged = read[i]
      break
    }
  }

  // controls
  const chain = stages.find((s): s is Extract<CvelStage, { kind: 'chain' }> => s.kind === 'chain')
  const pi = chain?.reads.find(r => r.flux === Math.PI)
  const zero = chain?.reads.find(r => r.flux === 0)
  const chainC = pi && zero ? Math.sqrt(pi.v2 / zero.v2) : NaN
  const chainOk = !!pi && !!zero && chainC < 1e-12 && Math.abs(pi.flatWeight - 1) < 1e-12 && zero.v2 > 1e-3

  metrics.chainCinf = chainC
  metrics.chainFlatWeightPi = pi?.flatWeight ?? NaN
  metrics.chainV2Zero = zero?.v2 ?? NaN

  const identityC = converged ? 1 : NaN

  metrics.identityCinf = identityC

  let status: Verdict['status'] = 'open'
  let word = 'OPEN'

  if (!step1Ok) {
    notes.push('STEP 1 instrument failed or is missing')
  } else if (!instOk) {
    notes.push('the reduced block disagrees with the dense block, or the instrument is missing')
  } else if (!chainOk) {
    notes.push('the rhombic-chain control failed or is missing')
  } else if (!converged) {
    notes.push('the grids have not converged (or are missing)')
  } else if (converged.C < CONFINED_UNDER && Math.abs(converged.flat - 1) < FLAT_WITHIN) {
    status = 'pass'
    word = 'CONFINED'
  } else if (converged.C >= CONFINED_UNDER) {
    status = 'fail'
    word = 'SLOWED'
  } else {
    notes.push('C_inf under 1e-6 without flat weight 1: no gate covers it')
  }

  const table = read
    .map(r => `nk ${r.nk}: C_inf ${r.C.toFixed(6)} (centred ${r.Ccentered.toFixed(6)}), v_inf a beat cf0 ${r.vC.toFixed(5)} identity ${r.vI.toFixed(5)}, flat weight ${r.flat.toExponential(2)}`)
    .join('; ')

  return verdict({
    status,
    claim: `cf0 ${word}: ${table}. STEP 1 ${step1Ok ? 'reproduced' : 'FAILED'} (rms gap cf0 ${metrics.step1RmsGapCf0?.toExponential(1)}, identity ${metrics.step1RmsGapIdentity?.toExponential(1)}, C ${metrics.step1C?.toFixed(10)}); windows C ${windows?.C.map(c => c.toFixed(4)).join(', ')}, alpha ${windows?.alpha.toFixed(4)}; chain C_inf ${chainC.toExponential(2)} flat ${pi?.flatWeight.toFixed(12)}, flux-0 v2 ${zero?.v2.toFixed(4)}.`,
    metrics,
    control: { identityCinf: identityC, chainCinf: chainC },
    notes: [
      'v_inf is read on the 4D bulk mesh from the cage engine of item 0065, never on the husk. One field (cf0), uniform, so no ensemble.',
      ...notes,
    ].join(' '),
  })
}

export default experiment({
  id: 'gauge/cage-velocity',
  code: 'E-FRC-0000',
  title: 'explores whether the centre field cf0 could stop a lone third for ever, or only slows it, from its Bloch band velocities',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // serially (tens of minutes; the stage runner deck/vibe/tmp/cvel.sh splits it): the reference is dockCageRead itself
    const cf0 = enumerateCenterPatterns().kept[0]!.pattern
    const ref = dockCageRead(centerField(cf0), GATES_PLAN)

    return cageVelocityVerdict(
      cvelSpecs().map(s => s.run()),
      { ratio: ref.ratio, rmsT: ref.rmsT, rmsC: ref.rmsC },
    )
  },
})
