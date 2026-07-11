// Pursuit of a drifting peak on a ring, the minimal deterministic arena for comparing
// two guidance policies:
//   - plan: read the world once at beat zero, commit to that target, walk to it blind,
//     and stay there (the frozen-snapshot planner).
//   - track: read only the local field (the two neighbours) every beat and step uphill
//     (the gradient tracker), with ties resolved by staying put.
// The field is a triangular bump of a given half-width centered on a peak that drifts
// one cell every driftPeriod beats (driftPeriod 0 means a static peak). Everything is
// integer and deterministic, no randomness anywhere.

export type PursuitResult = {
  // mean ring distance from the agent to the true peak over the last half of the run
  meanLateDistance: number
  // ring distance at the final beat
  finalDistance: number
}

function ringDistance(a: number, b: number, size: number): number {
  const d = Math.abs(a - b) % size

  return Math.min(d, size - d)
}

// step from `from` one cell along the shorter ring arc toward `to`
function stepToward(from: number, to: number, size: number): number {
  if (from === to) return from

  const forward = (to - from + size) % size

  return forward <= size - forward
    ? (from + 1) % size
    : (from - 1 + size) % size
}

export function pursueDriftingPeak(input: {
  size: number
  beats: number
  driftPeriod: number
  start: number
  peakStart: number
  halfWidth: number
  policy: 'plan' | 'track'
}): PursuitResult {
  const {
    size,
    beats,
    driftPeriod,
    start,
    peakStart,
    halfWidth,
    policy,
  } = input

  const peakAt = (t: number): number =>
    driftPeriod > 0
      ? (peakStart + Math.floor(t / driftPeriod)) % size
      : peakStart

  const field = (x: number, t: number): number => {
    const d = ringDistance(x, peakAt(t), size)

    return Math.max(0, halfWidth - d)
  }

  const plannedTarget = peakAt(0)

  let position = start
  let lateSum = 0
  let lateCount = 0

  for (let t = 0; t < beats; t++) {
    if (policy === 'plan')
      position = stepToward(position, plannedTarget, size)
    else {
      const here = field(position, t)
      const left = field((position - 1 + size) % size, t)
      const right = field((position + 1) % size, t)
      const best = Math.max(here, left, right)

      if (best > here) {
        position =
          right === best
            ? (position + 1) % size
            : (position - 1 + size) % size
      }
    }

    if (t >= beats / 2) {
      lateSum += ringDistance(position, peakAt(t), size)
      lateCount++
    }
  }

  return {
    meanLateDistance: lateCount > 0 ? lateSum / lateCount : 0,
    finalDistance: ringDistance(position, peakAt(beats - 1), size),
  }
}
