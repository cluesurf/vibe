// Wang-Landau estimation of the density of states for causal sets, over the integer
// HEIGHT (longest chain). Direct fraction-counting cannot reach the manifold phase
// at large N (it is exponentially rare), so P12 could only bound the free-energy
// crossing. Wang-Landau random-walks in height space weighted by 1 / g(height),
// flattening the histogram and CROSSING the entropy barrier, yielding log g per
// height. With the per-height mean action this gives the free energy at any coupling
// and the crossing beta-star directly. Manifold = height > sqrt(N), layered =
// height <= sqrt(N). Uses the transitivity-preserving single-pair move of the
// uniform sampler. Integer height has no binning gaps, unlike the height ratio.
//
// Convergence uses the Belardinelli-Pereyra 1/t schedule: build the rough density
// with a flat modification factor until every height is well covered, then set the
// modification factor to 1/t for the rest, which converges reliably where pure
// halving stalls. The per-height action is measured in the converged 1/t regime.

import { Rng } from '@/code/tool/rng'
import { makeBitMatrix, setBit } from '@/code/tool/bitset'
import {
  makeState,
  isRelated,
  toggle,
  toggleKeepsValid,
  height,
  smearedAction,
} from '@/code/dynamics/uniform-sampler'

// A transitive chain on the first k elements (0 < 1 < ... < k-1), as a future
// relation, so a fresh state can start at height k (used to seed WL windows above
// the antichain, where random additions reach the target height unreliably).
function chainFuture(
  size: number,
  k: number,
): ReturnType<typeof makeBitMatrix> {
  const future = makeBitMatrix({ rows: size, cols: size })
  for (let a = 0; a < k; a++) {
    for (let b = a + 1; b < k; b++) {
      setBit(future, { row: a, col: b })
    }
  }

  return future
}

export interface WangLandauResult {
  size: number
  heights: number[] // the height value of each bin (bin b is height b + minHeight)
  logG: number[] // log density of states per height, normalised so the max is 0
  meanAction: number[] // mean smeared action per height (NaN if unmeasured)
  visited: boolean[]
  converged: boolean
}

export function wangLandauHeight(input: {
  size: number
  epsilon: number
  minHeight?: number
  maxHeight: number
  rng: Rng
  maxSteps: number
  coverThreshold?: number // min visits per height to declare the shape covered
  burnInFraction?: number // fraction of steps before measuring the per-height action
}): WangLandauResult {
  const n = input.size
  const minHeight = input.minHeight ?? 2
  const H = input.maxHeight - minHeight + 1
  const coverThreshold = input.coverThreshold ?? 4000
  // Start from a chain of length minHeight so the walk begins in [minHeight,
  // maxHeight] (robust for high windows, where random additions reach a target
  // height unreliably).
  const state = makeState(
    n,
    minHeight > 1 ? chainFuture(n, minHeight) : undefined,
  )
  const logG = new Float64Array(H)
  const hist = new Float64Array(H)
  const seen = new Array<boolean>(H).fill(false)
  const actSum = new Float64Array(H)
  const actN = new Float64Array(H)
  const binOf = (h: number): number =>
    Math.min(H - 1, Math.max(0, h - minHeight))

  let curBin = binOf(height(state))
  seen[curBin] = true
  let curS = smearedAction(state, input.epsilon)
  let steps = 0
  // Action is measured only in the converged tail (after this burn-in), where log g
  // has settled. Coverage of all heights before the tail is required to call it
  // converged.
  const burnIn = Math.floor(
    input.maxSteps * (input.burnInFraction ?? 0.5),
  )
  let covered = false

  while (steps < input.maxSteps) {
    const i = input.rng.nextInt({ max: n })
    let j = input.rng.nextInt({ max: n })
    if (i === j) {
      j = (j + 1) % n
    }

    const lo = Math.min(i, j)
    const hi = Math.max(i, j)
    const measuring = steps >= burnIn
    if (lo !== hi) {
      const related = isRelated(state, lo, hi)
      if (toggleKeepsValid(state, lo, hi, related)) {
        toggle(state, lo, hi)
        const newH = height(state)
        if (newH > input.maxHeight || newH < minHeight) {
          toggle(state, lo, hi)
        } else {
          const newBin = binOf(newH)
          if (
            Math.log(input.rng.next() + 1e-300) <
            (logG[curBin] ?? 0) - (logG[newBin] ?? 0)
          ) {
            curBin = newBin
            seen[curBin] = true
            if (measuring) {
              curS = smearedAction(state, input.epsilon)
            }
          } else {
            toggle(state, lo, hi)
          }
        }
      }
    }

    steps += 1
    // Pure 1/t Wang-Landau: the modification factor is 1/t throughout, large early
    // (builds the shape) and small late (refines it), which converges log g where
    // flat-then-halve stalls against the steep entropy barrier.
    const lnf = 1 / steps
    logG[curBin] = (logG[curBin] ?? 0) + lnf
    hist[curBin] = (hist[curBin] ?? 0) + 1
    if (measuring) {
      actSum[curBin] = (actSum[curBin] ?? 0) + curS
      actN[curBin] = (actN[curBin] ?? 0) + 1
    } else if (!covered) {
      let allSeen = true
      let minHits = Infinity
      for (let b = 0; b < H; b++) {
        if (!seen[b]) {
          allSeen = false
          break
        }

        minHits = Math.min(minHits, hist[b] ?? 0)
      }

      covered = allSeen && minHits >= coverThreshold
    }
  }

  const converged = covered

  let maxLogG = -Infinity
  for (let b = 0; b < H; b++) {
    if (seen[b] && (actN[b] ?? 0) > 0) {
      maxLogG = Math.max(maxLogG, logG[b] ?? 0)
    }
  }

  const heights: number[] = []
  const outLogG: number[] = []
  const meanAction: number[] = []
  const visited: boolean[] = []
  for (let b = 0; b < H; b++) {
    heights.push(b + minHeight)
    const ok = (seen[b] ?? false) && (actN[b] ?? 0) > 0
    visited.push(ok)
    outLogG.push(ok ? (logG[b] ?? 0) - maxLogG : -Infinity)
    meanAction.push(ok ? (actSum[b] ?? 0) / (actN[b] ?? 1) : NaN)
  }

  return {
    size: n,
    heights,
    logG: outLogG,
    meanAction,
    visited,
    converged,
  }
}

// Windowed Wang-Landau: split [minHeight, maxHeight] into overlapping windows, run
// WL confined to each (a small barrier per window, so it converges and the rare
// high heights get sampled), then stitch the log g pieces by matching them on the
// overlaps. This reaches large N where a single WL run cannot flatten the full,
// steep entropy gradient.
export function windowedWangLandau(input: {
  size: number
  epsilon: number
  minHeight?: number
  maxHeight: number
  windowSize: number
  overlap: number
  rng: Rng
  stepsPerWindow: number
  coverThreshold?: number
  burnInFraction?: number
}): WangLandauResult {
  const minHeight = input.minHeight ?? 2
  const windows: { lo: number; hi: number }[] = []
  let lo = minHeight
  while (lo < input.maxHeight) {
    const hi = Math.min(input.maxHeight, lo + input.windowSize - 1)
    windows.push({ lo, hi })
    if (hi >= input.maxHeight) {
      break
    }

    lo = hi - input.overlap + 1
  }

  const total = input.maxHeight - minHeight + 1
  const globalLogG = new Float64Array(total).fill(NaN)
  const globalAct = new Float64Array(total).fill(NaN)
  let allConverged = true

  for (let wIdx = 0; wIdx < windows.length; wIdx++) {
    const win = windows[wIdx]
    if (!win) {
      continue
    }

    const wl = wangLandauHeight({
      size: input.size,
      epsilon: input.epsilon,
      minHeight: win.lo,
      maxHeight: win.hi,
      rng: input.rng,
      maxSteps: input.stepsPerWindow,
      coverThreshold: input.coverThreshold,
      burnInFraction: input.burnInFraction,
    })
    allConverged = allConverged && wl.converged
    // Offset to align this window's log g with what is already placed, by averaging
    // the difference over overlap heights that both have measured.
    let offsetSum = 0
    let offsetN = 0
    for (let b = 0; b < wl.heights.length; b++) {
      if (!wl.visited[b]) {
        continue
      }

      const h = wl.heights[b] ?? 0
      const gi = h - minHeight
      if (wIdx > 0 && !Number.isNaN(globalLogG[gi] ?? NaN)) {
        offsetSum += (globalLogG[gi] ?? 0) - (wl.logG[b] ?? 0)
        offsetN += 1
      }
    }

    const offset = offsetN > 0 ? offsetSum / offsetN : 0
    for (let b = 0; b < wl.heights.length; b++) {
      if (!wl.visited[b]) {
        continue
      }

      const h = wl.heights[b] ?? 0
      const gi = h - minHeight
      // First window to reach a height defines it (later windows only realign).
      if (Number.isNaN(globalLogG[gi] ?? NaN)) {
        globalLogG[gi] = (wl.logG[b] ?? 0) + offset
        globalAct[gi] = wl.meanAction[b] ?? NaN
      }
    }
  }

  let maxLogG = -Infinity
  for (let gi = 0; gi < total; gi++) {
    if (!Number.isNaN(globalLogG[gi] ?? NaN)) {
      maxLogG = Math.max(maxLogG, globalLogG[gi] ?? -Infinity)
    }
  }

  const heights: number[] = []
  const outLogG: number[] = []
  const meanAction: number[] = []
  const visited: boolean[] = []
  for (let gi = 0; gi < total; gi++) {
    heights.push(gi + minHeight)
    const ok = !Number.isNaN(globalLogG[gi] ?? NaN)
    visited.push(ok)
    outLogG.push(ok ? (globalLogG[gi] ?? 0) - maxLogG : -Infinity)
    meanAction.push(ok ? (globalAct[gi] ?? NaN) : NaN)
  }

  return {
    size: input.size,
    heights,
    logG: outLogG,
    meanAction,
    visited,
    converged: allConverged,
  }
}

function logWeight(
  wl: WangLandauResult,
  beta: number,
  manifold: boolean,
): number {
  const sqrtN = Math.sqrt(wl.size)
  let max = -Infinity
  for (let b = 0; b < wl.logG.length; b++) {
    if (!wl.visited[b] || (wl.heights[b] ?? 0) > sqrtN !== manifold) {
      continue
    }

    max = Math.max(
      max,
      (wl.logG[b] ?? -Infinity) - beta * (wl.meanAction[b] ?? 0),
    )
  }

  if (max === -Infinity) {
    return -Infinity
  }

  let sum = 0
  for (let b = 0; b < wl.logG.length; b++) {
    if (!wl.visited[b] || (wl.heights[b] ?? 0) > sqrtN !== manifold) {
      continue
    }

    sum += Math.exp(
      (wl.logG[b] ?? -Infinity) - beta * (wl.meanAction[b] ?? 0) - max,
    )
  }

  return max + Math.log(sum)
}

// Equilibrium manifold fraction (height > sqrt(N)) at coupling beta.
export function manifoldFractionAt(
  wl: WangLandauResult,
  beta: number,
): number {
  const lm = logWeight(wl, beta, true)
  const ll = logWeight(wl, beta, false)
  if (lm === -Infinity) {
    return 0
  }

  if (ll === -Infinity) {
    return 1
  }

  return 1 / (1 + Math.exp(ll - lm))
}

// Entropy gap g = log W_layered - log W_manifold at beta = 0 (pure counting).
export function entropyGap(wl: WangLandauResult): number {
  return logWeight(wl, 0, false) - logWeight(wl, 0, true)
}

// The crossing beta-star where the manifold phase reaches half the weight.
export function crossingBeta(
  wl: WangLandauResult,
  betaMax: number,
): number | null {
  const f = (b: number): number => manifoldFractionAt(wl, b) - 0.5
  if (f(0) >= 0) {
    return 0
  }

  if (f(betaMax) < 0) {
    return null
  }

  let lo = 0
  let hi = betaMax
  for (let it = 0; it < 60; it++) {
    const mid = 0.5 * (lo + hi)
    if (f(mid) < 0) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return 0.5 * (lo + hi)
}
