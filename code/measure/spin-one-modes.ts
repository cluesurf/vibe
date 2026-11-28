// Exact collective-mode measures of the reversible spin-1 Q2R rule (code/rule/spin-one-q2r.ts) on a closed cell graph
// (item vibe-computation-models-0052, M8 slice 2). Integer arithmetic and bigint rationals only: no floating point
// decides anything here.
//
// - The orbit period: a round is a bijection of the configuration, so the orbit of a start is a pure cycle and its
//   period is the first round whose state equals the start, read up to a declared cap (past it, unresolved).
// - Series along the orbit: the magnetization Q(t) = sum s and the energy channel D(t) = sum s^2 (the bond energy is
//   E - Delta D, so D(t) is the exchange between the bond and crystal-field channels). Exact minimal series periods
//   over a resolved orbit, and integer autocovariances over a fixed window.
// - Standing shares: cells frozen through the window, and period-2 blinkers.
// The order of the graph automorphism group, reported beside every comparison, is code/measure/graph-automorphism.ts.

import {
  chargeOf,
  fieldsOf,
  SpinOneQ2r,
  totalEnergy,
  type BlumeCapel,
  type CellGraph,
  type IndependentSetSchedule,
} from '@/code/rule/spin-one-q2r'
import { fraction, type Fraction } from '@/code/measure/z3-resonance'

// ---- exact series readings ----

// The least divisor p of `period` with x[t] = x[(t + p) mod period] for every t < period. `series` holds at least
// `period` entries (one full orbit, t = 0 .. period - 1).
export function minimalSeriesPeriod(series: ArrayLike<number>, period: number): number {
  if (!Number.isInteger(period) || period < 1 || series.length < period) {
    throw new Error('spin-one-modes: a series period needs one full orbit')
  }

  for (let p = 1; p <= period; p++) {
    if (period % p !== 0) {
      continue
    }

    let ok = true

    for (let t = 0; t < period && ok; t++) {
      ok = series[t] === series[(t + p) % period]
    }

    if (ok) {
      return p
    }
  }

  return period
}

// The integer autocovariance A(tau) = n sum x_t x_(t+tau) - (sum x_t)(sum x_(t+tau)) over t < n = W - tau, for tau =
// 0 .. maxLag: n^2 times the sample covariance, so its sign is exact. Sums are exact in doubles (each term is below
// 2^53 for |x| <= 10^5 and W <= 10^5); the products are taken in bigint.
export function autocovariance(series: ArrayLike<number>, maxLag: number): bigint[] {
  const w = series.length
  const out: bigint[] = []

  for (let tau = 0; tau <= maxLag && tau < w; tau++) {
    const n = w - tau

    let sxy = 0
    let sx = 0
    let sy = 0

    for (let t = 0; t < n; t++) {
      const a = series[t]!
      const b = series[t + tau]!

      sxy += a * b
      sx += a
      sy += b
    }

    if (!Number.isSafeInteger(sxy) || !Number.isSafeInteger(sx) || !Number.isSafeInteger(sy)) {
      throw new Error('spin-one-modes: an autocovariance sum left the exact integer range')
    }

    out.push(BigInt(n) * BigInt(sxy) - BigInt(sx) * BigInt(sy))
  }

  return out
}

// 'constant' when the series never varies, a lag when A first turns non-positive, null when it never does by maxLag
export type MemoryLag = number | 'constant' | null

export function memoryLag(cov: readonly bigint[]): MemoryLag {
  if (cov.length === 0 || cov[0] === 0n) {
    return 'constant'
  }

  for (let tau = 1; tau < cov.length; tau++) {
    if (cov[tau]! <= 0n) {
      return tau
    }
  }

  return null
}

// The lag of the largest positive autocovariance past the memory lag, or null (no positive value there).
export function oscillationLag(cov: readonly bigint[]): number | null {
  const first = memoryLag(cov)

  if (typeof first !== 'number') {
    return null
  }

  let best: number | null = null

  for (let tau = first + 1; tau < cov.length; tau++) {
    if (cov[tau]! > 0n && (best === null || cov[tau]! > cov[best]!)) {
      best = tau
    }
  }

  return best
}

// ---- one exact orbit-and-window run ----

export type ModeRun = {
  readonly cells: number
  readonly energy: number
  // rounds run forward (the larger of burn + window and the period search)
  readonly rounds: number
  readonly cap: number
  // moves over all rounds, and inside the window
  readonly moves: number
  readonly windowMoves: number
  readonly period: number | null
  readonly seriesPeriodQ: number | null
  readonly seriesPeriodD: number | null
  // window mean of Q^2 / N^2
  readonly phaseOrder: Fraction
  readonly tauQ: MemoryLag
  readonly tauD: MemoryLag
  // (W sum D^2 - (sum D)^2) / (W^2 N)
  readonly varD: Fraction
  readonly frozen: Fraction
  readonly blink: Fraction
  readonly oscillationQ: number | null
  readonly gates: {
    readonly energyKept: boolean
    readonly bookkeepingExact: boolean
    readonly inverseRestores: boolean
    readonly dConstant: boolean
  }
}

function sameState(a: Int8Array, b: Int8Array): boolean {
  for (let c = 0; c < a.length; c++) {
    if (a[c] !== b[c]) {
      return false
    }
  }

  return true
}

export function modeRun(input: {
  graph: CellGraph
  model: BlumeCapel
  schedule: IndependentSetSchedule
  state: Int8Array
  burn: number
  window: number
  cap: number
}): ModeRun {
  const { graph, model, schedule, burn, window } = input
  const n = graph.cells
  const start = Int8Array.from(input.state)
  const run = new SpinOneQ2r({ graph, model, schedule, state: start })
  const energy = totalEnergy(graph, model, start)
  const cap = Math.max(input.cap, burn + window)
  const q = new Int32Array(cap + 1)
  const d = new Int32Array(cap + 1)
  const prev1 = new Int8Array(n)
  const prev2 = new Int8Array(n)
  const changed = new Uint8Array(n)
  const unblink = new Uint8Array(n)
  const q0 = run.q
  const d0 = run.d

  q[0] = q0
  d[0] = d0

  let period: number | null = null
  let t = 0
  let movesAtWindow = 0

  while (t < burn + window || (period === null && t < cap)) {
    if (t === burn) {
      movesAtWindow = run.moves
    }

    run.round()
    t++
    q[t] = run.q
    d[t] = run.d

    if (period === null && run.q === q0 && run.d === d0 && sameState(run.state, start)) {
      period = t
    }

    // window rounds are burn + 1 .. burn + window
    if (t > burn && t <= burn + window) {
      const k = t - burn
      const state = run.state

      if (k >= 2) {
        for (let c = 0; c < n; c++) {
          if (state[c] !== prev1[c]) {
            changed[c] = 1
          }
        }
      }

      if (k >= 3) {
        for (let c = 0; c < n; c++) {
          if (state[c] !== prev2[c]) {
            unblink[c] = 1
          }
        }
      }

      prev2.set(prev1)
      prev1.set(state)
    }
  }

  const rounds = t
  const windowMoves = run.moves - movesAtWindow
  const moves = run.moves

  // exact gates: energy recount, book-kept charges and fields, then the inverse run back to the start
  let energyKept = totalEnergy(graph, model, run.state) === energy && run.energyChange === 0

  const recount = chargeOf(run.state)
  const fields = fieldsOf(graph, run.state)
  const bookkeepingExact = recount.q === run.q && recount.d === run.d && fields.every((h, c) => h === run.field[c])

  for (let s = 0; s < rounds; s++) {
    run.inverseRound()
  }

  energyKept &&= totalEnergy(graph, model, run.state) === energy

  const inverseRestores = sameState(run.state, start)

  // window series
  const qs = Array.from(q.subarray(burn + 1, burn + window + 1))
  const ds = Array.from(d.subarray(burn + 1, burn + window + 1))
  const maxLag = Math.floor(window / 4)
  const covQ = autocovariance(qs, maxLag)
  const covD = autocovariance(ds, maxLag)

  let sumQ2 = 0n
  let sumD = 0n
  let sumD2 = 0n
  let dConstant = true

  for (let k = 0; k < window; k++) {
    sumQ2 += BigInt(qs[k]!) * BigInt(qs[k]!)
    sumD += BigInt(ds[k]!)
    sumD2 += BigInt(ds[k]!) * BigInt(ds[k]!)
  }

  for (let s = 0; s <= rounds; s++) {
    if (d[s] !== d0) {
      dConstant = false
      break
    }
  }

  const w = BigInt(window)
  const nn = BigInt(n)

  let frozen = 0
  let blink = 0

  for (let c = 0; c < n; c++) {
    if (!changed[c]) {
      frozen++
    } else if (!unblink[c]) {
      blink++
    }
  }

  return {
    cells: n,
    energy,
    rounds,
    cap,
    moves,
    windowMoves,
    period,
    seriesPeriodQ: period === null ? null : minimalSeriesPeriod(q, period),
    seriesPeriodD: period === null ? null : minimalSeriesPeriod(d, period),
    phaseOrder: fraction(sumQ2, w * nn * nn),
    tauQ: memoryLag(covQ),
    tauD: memoryLag(covD),
    varD: fraction(w * sumD2 - sumD * sumD, w * w * nn),
    frozen: fraction(frozen, n),
    blink: fraction(blink, n),
    oscillationQ: oscillationLag(covQ),
    gates: { energyKept, bookkeepingExact, inverseRestores, dConstant },
  }
}

// A fresh run re-verifies a period: T^P returns the start and T^p does not for any proper divisor p of P.
export function verifyPeriod(input: {
  graph: CellGraph
  model: BlumeCapel
  schedule: IndependentSetSchedule
  state: Int8Array
  period: number
}): boolean {
  const start = Int8Array.from(input.state)
  const run = new SpinOneQ2r({ graph: input.graph, model: input.model, schedule: input.schedule, state: start })

  for (let t = 1; t <= input.period; t++) {
    run.round()

    const back = sameState(run.state, start)

    if (t === input.period) {
      return back
    }

    if (input.period % t === 0 && back) {
      return false
    }
  }

  return false
}
