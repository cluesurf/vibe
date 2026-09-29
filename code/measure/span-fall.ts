// Measurement for the fall of the span lumps (E-GRV-0094): the matter of the spanned light (code/rule/depth-clock-wave,
// span form) in the radion's own slab (code/measure/depth-arena), read on a FINER staircase and against the mesh's own
// band. Real numbers live here only.
//
// THE TWO LATTICE EFFECTS (found by the disclosed probes tmp/span-fall-probe1..4.log, before this file):
// 1. THE STAIRCASE. The depth is an integer, so on E-GRV-0088's slab it steps by one level every 12 docks. A span
//    lump is slow and heavy in dock units, and a wave slower than a step is tall reflects off it: its fall is not the
//    mean gradient's. A finer staircase reads the SAME field with K levels per level,
//      D_K(x) = K D0 + halfLevelCount(K v(x)),
//    so q_K / q_K0 keeps the slab's profile (to 1 / K) while a step is K times closer. At K = 32 a step is under a dock
//    and the terraces are gone.
// 2. THE BAND. The leapfrog's band is theta(k, x) = 2 asin sqrt((a S(k) + m_y) / (4 Q)), S(k) = 12 (1 - cos k) on
//    states uniform in y and z. A falling lump gains lattice momentum k at the rate |d theta_0 / dx|, and its speed is
//    d theta / dk, which leaves the parabola once k is not small. A span lump's Compton length c / theta_0 =
//    sqrt(12 / (m q)) docks is under one dock (the clock lump's is sqrt(12 / m), depth free), so it reaches k ~ 1
//    while still slow, and a heavier lump (theta_0 ~ sqrt m) gets there sooner: the fall departs from the k = 0 ray
//    law by an amount that depends on m. This is the mesh's, not the depth's: the LATTICE RAY (the band integrated
//    from k = 0 on the smooth field, dx/dt = d theta / dk, dk/dt = - d theta / dx) carries it, the k = 0 law does not.
//
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import {
  arenaField,
  fallRun,
  FALL_AT,
  FALL_WIDTH,
  MIRROR_AT,
  type FallRun,
} from '@/code/measure/depth-arena'
import { halfLevelCount, RADION_DEPTH } from '@/code/measure/radion'
import { quadraticFit } from '@/code/measure/regression'

// the slab's depth read with k levels per level (k = 1 is E-GRV-0088's own)
export const finerDepth =
  (k: number) =>
  (x: number): number =>
    k * RADION_DEPTH + halfLevelCount(k * arenaField().field[x]!)

// the smooth count 2 k (D0 + v(x)) + 1, v linear between docks: what the staircase rounds
export function smoothCount(k: number, x: number): number {
  const v = arenaField().field
  const n = v.length
  const i = Math.floor(x)
  const f = x - i
  const a = v[((i % n) + n) % n]!
  const b = v[(((i + 1) % n) + n) % n]!

  return 2 * k * (RADION_DEPTH + a * (1 - f) + b * f) + 1
}

// the span form's band at lattice momentum p: a = 2, Q = 9 q^2, m_y = m q
export function spanBand(
  k: number,
  m: number,
  x: number,
  p: number,
): number {
  const q = smoothCount(k, x)

  return (
    2 *
    Math.asin(
      Math.sqrt((2 * 12 * (1 - Math.cos(p)) + m * q) / (36 * q * q)),
    )
  )
}

// the rate the lump's lattice momentum grows at rest: |d theta_0 / dx|
export function momentumRate(k: number, m: number, x: number): number {
  const h = 1e-4

  return (
    Math.abs(spanBand(k, m, x + h, 0) - spanBand(k, m, x - h, 0)) /
    (2 * h)
  )
}

// the lattice ray from rest at x0: its position after every beat (four fourth-order Runge-Kutta steps a beat)
export function latticeRay(
  k: number,
  m: number,
  x0: number,
  beats: number,
): number[] {
  const h = 1e-4
  const vx = (x: number, p: number): number =>
    (spanBand(k, m, x, p + h) - spanBand(k, m, x, p - h)) / (2 * h)
  const vp = (x: number, p: number): number =>
    -(spanBand(k, m, x + h, p) - spanBand(k, m, x - h, p)) / (2 * h)
  const out = [x0]
  const d = 1 / 4

  let x = x0
  let p = 0

  for (let t = 0; t < beats; t++) {
    for (let s = 0; s < 4; s++) {
      const ax = vx(x, p)
      const ap = vp(x, p)
      const bx = vx(x + (d / 2) * ax, p + (d / 2) * ap)
      const bp = vp(x + (d / 2) * ax, p + (d / 2) * ap)
      const cx = vx(x + (d / 2) * bx, p + (d / 2) * bp)
      const cp = vp(x + (d / 2) * bx, p + (d / 2) * bp)
      const ex = vx(x + d * cx, p + d * cp)
      const ep = vp(x + d * cx, p + d * cp)

      x += (d / 6) * (ax + 2 * bx + 2 * cx + ex)
      p += (d / 6) * (ap + 2 * bp + 2 * cp + ep)
    }

    out.push(x)
  }

  return out
}

// the fitted acceleration 2 a of x0 + v0 t + a t^2 over beats 0 .. the end
export const fittedFall = (track: readonly number[]): number =>
  2 * quadraticFit({ xs: track.map((_, t) => t), ys: track }).a

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0094: fixed before the gated run

export const FINE_LEVELS = 32
export const FINE_TERMS: readonly number[] = [2, 18]
export const FINE_AMP = 300000
// the heavier lump's lattice momentum at the end of the gated window, and the long window's multiple of it
export const FINE_MOMENTUM = 0.3
export const LONG_FACTOR = 4

export type LumpReading = {
  m: number
  at: number
  run: FallRun
  ratio: number
  compton: number
  period: number
}

export type SpanFallSurvey = {
  window: number
  fine: LumpReading[]
  uniform: FallRun
  // the long window: the wave's and the lattice ray's fall over the k = 0 ray law
  long: {
    m: number
    wave: number
    ray: number
    momentum: number
    run: FallRun
  }[]
  // the integer staircase (k = 1) over its own window, and the smooth ray's reading there
  stairWindow: number
  stair: { m: number; ratio: number; ray: number; run: FallRun }[]
  seconds: number
}

let cache: SpanFallSurvey | undefined

export function spanFallSurvey(
  log?: (what: string) => void,
): SpanFallSurvey {
  if (cache) {
    return cache
  }

  const started = Date.now()
  const k = FINE_LEVELS
  const heavy = Math.max(...FINE_TERMS)
  const window = Math.ceil(
    FINE_MOMENTUM /
      Math.max(
        momentumRate(k, heavy, FALL_AT),
        momentumRate(k, heavy, MIRROR_AT),
      ),
  )

  const reading = (at: number, m: number): LumpReading => {
    const run = fallRun(
      finerDepth(k),
      'span',
      at,
      m,
      FINE_AMP,
      FALL_WIDTH,
      window,
    )
    const q = smoothCount(k, at)
    const theta0 = spanBand(k, m, at, 0)

    return {
      m,
      at,
      run,
      ratio: run.g / run.gPredicted,
      compton: 2 / (q * Math.sqrt(3)) / theta0,
      period: (2 * Math.PI) / theta0,
    }
  }

  const fine = [FALL_AT, MIRROR_AT].flatMap(at =>
    FINE_TERMS.map(m => reading(at, m)),
  )

  log?.(`fine ${(Date.now() - started) / 1000}s`)

  const uniform = fallRun(
    () => k * RADION_DEPTH,
    'span',
    FALL_AT,
    heavy,
    FINE_AMP,
    FALL_WIDTH,
    window,
  )
  const long = FINE_TERMS.map(m => {
    const beats = LONG_FACTOR * window
    const run = fallRun(
      finerDepth(k),
      'span',
      FALL_AT,
      m,
      FINE_AMP,
      FALL_WIDTH,
      beats,
    )
    const ray = latticeRay(k, m, run.centroid[0]!, beats)

    return {
      m,
      wave: run.g / run.gPredicted,
      ray: fittedFall(ray) / run.gPredicted,
      momentum: momentumRate(k, m, FALL_AT) * beats,
      run,
    }
  })

  log?.(`long ${(Date.now() - started) / 1000}s`)

  const stairWindow = Math.ceil(
    FINE_MOMENTUM / momentumRate(1, heavy, FALL_AT),
  )
  const stair = FINE_TERMS.map(m => {
    const run = fallRun(
      finerDepth(1),
      'span',
      FALL_AT,
      m,
      FINE_AMP,
      FALL_WIDTH,
      stairWindow,
    )

    return {
      m,
      ratio: run.g / run.gPredicted,
      ray:
        fittedFall(latticeRay(1, m, run.centroid[0]!, stairWindow)) /
        run.gPredicted,
      run,
    }
  })

  cache = {
    window,
    fine,
    uniform,
    long,
    stairWindow,
    stair,
    seconds: (Date.now() - started) / 1000,
  }

  return cache
}
