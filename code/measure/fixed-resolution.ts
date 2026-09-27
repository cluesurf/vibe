// Readings for the spanned light at a FIXED RESOLUTION (code/rule/depth-span-light makeMetricSpanMedium): the angle's
// windows and the Peierls root at a baseline depth D0 everywhere, the divisors (the kick's q_P^2 and the span's Q_l)
// at a metric depth D_m. Two surveys: alpha read in local units (E-FRC-0256's reading, code/measure/local-alpha) at
// fixed D0 over several uniform metric depths, beside the unfixed light (resolution tied to the metric); and the slab
// lens of E-GRV-0093 (code/measure/depth-span) run on the fixed light through the radion's own depth profile.
// Real numbers live here only; the rule holds integers.
//
// DETERMINISM: every start is placed; nothing is drawn.

import { copySpan, makeMetricSpanMedium, makeSpanMedium, sameSpan } from '@/code/rule/depth-span-light'
import { LOCAL_LEVELS, LOCAL_SEPARATIONS, localAlpha, localUnits, pairReading, type LocalAlpha, type LocalUnits } from '@/code/measure/local-alpha'
import { GAUGE_BEATS, gaugeReading, runSpan, spanLensSurvey, spanPacket, SPAN_LENS_WINDOW, SPAN_LEVELS, wideGaugeEta, type GaugeReading, type SpanLensSurvey, type SpanRun } from '@/code/measure/depth-span'
import { arenaField } from '@/code/measure/depth-arena'
import { LENS_AMP, LENS_DETECTORS, LENS_HALF_WIDTH, LENS_LINE, LENS_SOURCE_X, RADION_DEPTH } from '@/code/measure/radion'
import { dockAt } from '@/code/measure/varying-depth-light'

// ---------------------------------------------------------------------------------------------------------
// alpha at a fixed resolution. Fixed before the gated run

export const FIXED_RESOLUTION = 16
export const FIXED_METRIC_DEPTHS: readonly number[] = [8, 12, 16, 24, 32]

export type FixedAlphaSurvey = {
  // per metric depth: the matter's local units, and per separation the fixed and the unfixed light's reading
  units: LocalUnits[]
  fixed: LocalAlpha[]
  unfixed: LocalAlpha[]
  // the wide gauge map on the radion's slab: the fixed light, and the unfixed light (resolution = the slab's depth)
  gaugeFixed: GaugeReading
  gaugeUnfixed: GaugeReading
  slabDepths: { min: number; max: number }
  seconds: number
}

let alphaCache: FixedAlphaSurvey | undefined

export function fixedAlphaSurvey(log?: (what: string) => void): FixedAlphaSurvey {
  if (alphaCache) return alphaCache

  const started = Date.now()
  const units: LocalUnits[] = []
  const fixed: LocalAlpha[] = []
  const unfixed: LocalAlpha[] = []

  for (const depth of FIXED_METRIC_DEPTHS) {
    const u = localUnits('span', depth)

    units.push(u)

    for (const r of LOCAL_SEPARATIONS) {
      fixed.push(localAlpha(pairReading('span', depth, r, LOCAL_LEVELS, FIXED_RESOLUTION), u))
      unfixed.push(localAlpha(pairReading('span', depth, r), u))
      log?.(`D_m ${depth} r ${r} ${(Date.now() - started) / 1000}s`)
    }
  }

  const depth = arenaField().depth
  const mFixed = makeMetricSpanMedium(LENS_LINE, RADION_DEPTH, x => depth[x]!)
  const mUnfixed = makeSpanMedium(LENS_LINE, x => depth[x]!)
  const eta = wideGaugeEta(RADION_DEPTH)
  const gaugeFixed = gaugeReading(mFixed, spanPacket(mFixed, SPAN_LEVELS, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH), GAUGE_BEATS, eta)
  const gaugeUnfixed = gaugeReading(mUnfixed, spanPacket(mUnfixed, SPAN_LEVELS, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH), GAUGE_BEATS, eta)

  log?.(`gauge ${(Date.now() - started) / 1000}s`)

  alphaCache = { units, fixed, unfixed, gaugeFixed, gaugeUnfixed, slabDepths: { min: Math.min(...depth), max: Math.max(...depth) }, seconds: (Date.now() - started) / 1000 }

  return alphaCache
}

// ---------------------------------------------------------------------------------------------------------
// the slab lens at a fixed resolution. Fixed before the gated run: E-GRV-0093's settings, D0 = RADION_DEPTH

export type FixedLensSurvey = {
  // E-GRV-0093's survey (the unfixed light, the lumps' fall, the control waves), re-run
  base: SpanLensSurvey
  uniform: SpanRun
  lens: SpanRun
  measuredDelay: number
  factorClosedPull: number
  factor: number
  // the fixed runs' detector traces, weights and invariants against the unfixed runs', value for value
  sameAsUnfixed: { uniform: boolean; lens: boolean }
  seconds: number
}

let lensCache: FixedLensSurvey | undefined

const sameRun = (a: SpanRun, b: SpanRun): boolean =>
  a.arrival.every((v, i) => v === b.arrival[i]) && a.weight.every((v, i) => v === b.weight[i]) && a.energy.length === b.energy.length && a.energy.every((v, i) => v === b.energy[i])

export function fixedLensSurvey(log?: (what: string) => void): FixedLensSurvey {
  if (lensCache) return lensCache

  const started = Date.now()
  const base = spanLensSurvey(log)
  const depth = base.depth
  const n = LENS_DETECTORS.length - 1
  const m0 = makeMetricSpanMedium(LENS_LINE, RADION_DEPTH, () => RADION_DEPTH)
  const mLens = makeMetricSpanMedium(LENS_LINE, RADION_DEPTH, x => depth[x]!)
  const start = spanPacket(m0, SPAN_LEVELS, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH)
  const first = copySpan(start)
  const detectors = LENS_DETECTORS.map(x => dockAt(m0, x, 0, 0))
  const uniform = runSpan(m0, start, detectors, SPAN_LENS_WINDOW)

  log?.(`fixed uniform ${uniform.seconds}s`)

  const lens = runSpan(mLens, start, detectors, SPAN_LENS_WINDOW)

  log?.(`fixed lens ${lens.seconds}s`)

  if (!sameSpan(start, first)) throw new Error('a run changed its start')

  const measuredDelay = lens.arrival[n]! - lens.arrival[0]! - (uniform.arrival[n]! - uniform.arrival[0]!)

  lensCache = {
    base,
    uniform,
    lens,
    measuredDelay,
    factorClosedPull: measuredDelay / base.closedCountDelay,
    factor: measuredDelay / (base.pullScale * base.closedCountDelay),
    sameAsUnfixed: { uniform: sameRun(uniform, base.uniform), lens: sameRun(lens, base.lens) },
    seconds: (Date.now() - started) / 1000,
  }

  return lensCache
}
