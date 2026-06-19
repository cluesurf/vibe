// Interference-fringe statistics of a 1D distribution read on its populated parity (a coined walk fills
// only every-other site at a given step). Counts the oscillatory local maxima (fringes), the near-nodes
// (deep interior dips flanked by substantial peaks, where amplitudes nearly cancel), and the contrast
// (total variation over the peak). A coherent quantum walk shows many maxima and deep nodes with high
// contrast, an incoherent classical walk a single smooth hump.

export function fringeStatistics(input: {
  distribution: Float64Array
  offset: number
  width: number
}): { nodes: number; maxima: number; contrast: number } {
  const { distribution: P, offset: off, width: W } = input
  const arr: number[] = []

  for (let x = off % 2; x < W; x += 2) {
    arr.push(P[x]!)
  } // the populated parity

  let peak = 0

  for (const v of arr) {
    peak = Math.max(peak, v)
  }

  let maxima = 0
  let nodes = 0
  let tv = 0

  for (let i = 1; i < arr.length - 1; i++) {
    tv += Math.abs(arr[i]! - arr[i - 1]!)

    if (
      arr[i]! > arr[i - 1]! &&
      arr[i]! > arr[i + 1]! &&
      arr[i]! > 0.05 * peak
    ) {
      maxima++
    }

    // a near-node: a deep local dip flanked by substantial peaks (amplitudes nearly cancelled)
    if (
      arr[i]! < arr[i - 1]! &&
      arr[i]! < arr[i + 1]! &&
      arr[i]! < 0.15 * peak &&
      arr[i - 1]! > 0.3 * peak &&
      arr[i + 1]! > 0.3 * peak
    ) {
      nodes++
    }
  }

  return { nodes, maxima, contrast: tv / (peak + 1e-12) }
}
