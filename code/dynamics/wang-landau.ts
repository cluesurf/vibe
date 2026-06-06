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

import { Rng } from '~/core/rng'
import {
  makeState,
  isRelated,
  toggle,
  toggleKeepsValid,
  height,
  smearedAction,
} from '~/dynamics/uniform-sampler'

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
  const state = makeState(n)
  const logG = new Float64Array(H)
  const hist = new Float64Array(H)
  const seen = new Array<boolean>(H).fill(false)
  const actSum = new Float64Array(H)
  const actN = new Float64Array(H)
  const binOf = (h: number): number => Math.min(H - 1, Math.max(0, h - minHeight))

  // Warm up into [minHeight, maxHeight] (the antichain height 1 is a single trivial
  // config that would otherwise pin the flatness check).
  for (let w = 0; w < n * n && height(state) < minHeight; w++) {
    const i = input.rng.nextInt({ max: n })
    let j = input.rng.nextInt({ max: n })
    if (i === j) {
      j = (j + 1) % n
    }
    const lo = Math.min(i, j)
    const hi = Math.max(i, j)
    if (lo !== hi && !isRelated(state, lo, hi) && toggleKeepsValid(state, lo, hi, false)) {
      toggle(state, lo, hi)
    }
  }

  let curBin = binOf(height(state))
  seen[curBin] = true
  let curS = smearedAction(state, input.epsilon)
  let steps = 0
  // Action is measured only in the converged tail (after this burn-in), where log g
  // has settled. Coverage of all heights before the tail is required to call it
  // converged.
  const burnIn = Math.floor(input.maxSteps * (input.burnInFraction ?? 0.5))
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
          if (Math.log(input.rng.next() + 1e-300) < (logG[curBin] ?? 0) - (logG[newBin] ?? 0)) {
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
  return { size: n, heights, logG: outLogG, meanAction, visited, converged }
}

function logWeight(wl: WangLandauResult, beta: number, manifold: boolean): number {
  const sqrtN = Math.sqrt(wl.size)
  let max = -Infinity
  for (let b = 0; b < wl.logG.length; b++) {
    if (!wl.visited[b] || (wl.heights[b] ?? 0) > sqrtN !== manifold) {
      continue
    }
    max = Math.max(max, (wl.logG[b] ?? -Infinity) - beta * (wl.meanAction[b] ?? 0))
  }
  if (max === -Infinity) {
    return -Infinity
  }
  let sum = 0
  for (let b = 0; b < wl.logG.length; b++) {
    if (!wl.visited[b] || (wl.heights[b] ?? 0) > sqrtN !== manifold) {
      continue
    }
    sum += Math.exp((wl.logG[b] ?? -Infinity) - beta * (wl.meanAction[b] ?? 0) - max)
  }
  return max + Math.log(sum)
}

// Equilibrium manifold fraction (height > sqrt(N)) at coupling beta.
export function manifoldFractionAt(wl: WangLandauResult, beta: number): number {
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
export function crossingBeta(wl: WangLandauResult, betaMax: number): number | null {
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
