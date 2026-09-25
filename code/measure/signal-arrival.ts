// The first-arrival beat of a perturbation: run a start and a perturbed copy of it under the same
// rule, and record for every cell the first beat at which any of its slots differs between the two.
// Nothing about routes is put in. The arrival map is whatever path the rule's own collisions and
// streaming carry the difference along, so comparing it against candidate distances (the bulk graph
// distance, the distance along a horosphere) asks which one the engine actually routes by.

import { Will, cloneWill } from '@/code/tone/will'

export function firstArrival(input: {
  start: Will
  perturbed: Will
  beats: number
  // one beat of the rule, returning the next will (it may consume its argument)
  step: (will: Will, beatIndex: number) => Will
  // how many leading cells to track (a mesh may carry phantom cells after the real ones)
  cells: number
}): Int32Array {
  const { beats, step, cells } = input
  const degree = input.start.mesh.degree
  const arrival = new Int32Array(cells).fill(-1)

  let a = cloneWill(input.start)
  let b = cloneWill(input.perturbed)

  const mark = (t: number): void => {
    for (let cell = 0; cell < cells; cell++) {
      if (arrival[cell] !== -1) {
        continue
      }

      for (let d = 0; d < degree; d++) {
        const i = cell * degree + d

        if (a.data[i] !== b.data[i]) {
          arrival[cell] = t
          break
        }
      }
    }
  }

  mark(0)

  for (let t = 0; t < beats; t++) {
    a = step(a, t)
    b = step(b, t)
    mark(t + 1)
  }

  return arrival
}

export type ArrivalRegression = {
  readonly targets: number
  readonly reached: number
  readonly slope: number
  readonly intercept: number
  readonly r2: number
  // the mean of |arrival - (slope x + intercept)| over reached targets
  readonly meanAbsoluteResidual: number
}

// A least-squares line of arrival against a candidate distance, over the targets the signal reached.
export function arrivalRegression(input: {
  arrival: readonly number[]
  distance: readonly number[]
}): ArrivalRegression {
  const xs: number[] = []
  const ys: number[] = []

  input.arrival.forEach((a, i) => {
    if (a >= 0) {
      xs.push(input.distance[i] ?? 0)
      ys.push(a)
    }
  })

  const n = xs.length
  const mx = xs.reduce((s, v) => s + v, 0) / Math.max(1, n)
  const my = ys.reduce((s, v) => s + v, 0) / Math.max(1, n)

  let sxy = 0
  let sxx = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    sxy += ((xs[i] ?? 0) - mx) * ((ys[i] ?? 0) - my)
    sxx += ((xs[i] ?? 0) - mx) ** 2
    syy += ((ys[i] ?? 0) - my) ** 2
  }

  const slope = sxx > 0 ? sxy / sxx : 0
  const intercept = my - slope * mx
  const residual = xs.reduce((s, x, i) => s + ((ys[i] ?? 0) - slope * x - intercept) ** 2, 0)
  const absolute = xs.reduce((s, x, i) => s + Math.abs((ys[i] ?? 0) - slope * x - intercept), 0)

  return {
    targets: input.arrival.length,
    reached: n,
    slope,
    intercept,
    r2: syy > 0 ? 1 - residual / syy : 0,
    meanAbsoluteResidual: n > 0 ? absolute / n : 0,
  }
}
