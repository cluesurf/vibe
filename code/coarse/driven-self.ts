// A central self driven by a structured sectored environment, for the observer experiments (the self as a
// model-builder, E1). The self is a disk on the flat lattice, its outer ring is the input boundary divided
// into K sectors each carrying its own slowly-flipping signal, and its deep interior integrates the signal
// through the cohesive beat. Returns the interior state and the environment signal each beat, the raw
// material for a predictive mutual-information measurement. Reuses the self-kit engine.

import { flatGraph, beat } from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'

export interface DrivenSelfSeries {
  // mean interior tone each beat (the self's inner state).
  interior: number[]
  // mean environment signal each beat (the structured external drive).
  environment: number[]
  // the signal of each input sector each beat, for the per-sector attention measure (E3).
  sectorSignals: number[][]
}

// Run a central self driven by a sectored environment. With dynamics off the interior never integrates the
// boundary signal, the control for the model-building claim.
export function drivenSelf(input: {
  L: number
  beats: number
  seed: number
  withDynamics: boolean
  sectors?: number
  flipProbability?: number
  // per-sector flip probabilities, overriding the scalar, so some inputs vary slowly and some fast (E3).
  flipProbabilities?: number[]
  selfRadius?: number
  interiorRadius?: number
  cohesion?: number
}): DrivenSelfSeries {
  const { L, beats, seed, withDynamics } = input
  const sectorCount = input.sectors ?? 4
  const flipProbability = input.flipProbability ?? 0.06
  const flipOf = (s: number): number => input.flipProbabilities?.[s] ?? flipProbability
  const selfRadius = input.selfRadius ?? 8
  const interiorRadius = input.interiorRadius ?? 4
  const cohesion = input.cohesion ?? 0.22
  const graph = flatGraph(L)
  const cx = Math.floor(L / 2)
  const cy = Math.floor(L / 2)
  const xOf = (c: number): number => c % L
  const yOf = (c: number): number => Math.floor(c / L)
  const radiusOf = (c: number): number => Math.hypot(xOf(c) - cx, yOf(c) - cy)

  const inputCells: number[] = []
  const inputSector: number[] = []
  const interiorCells: number[] = []
  for (let c = 0; c < graph.cellCount; c++) {
    const r = radiusOf(c)
    if (r >= selfRadius - 1 && r <= selfRadius) {
      inputCells.push(c)
      const angle = Math.atan2(yOf(c) - cy, xOf(c) - cx) + Math.PI
      inputSector.push(Math.min(sectorCount - 1, Math.floor((angle / (2 * Math.PI)) * sectorCount)))
    } else if (r <= interiorRadius) {
      interiorCells.push(c)
    }
  }

  const tone = new Int8Array(graph.cellCount)
  const moved = new Uint8Array(graph.cellCount)
  const rng = makeRng({ seed })
  const signals = new Array<number>(sectorCount).fill(1)
  const interior: number[] = []
  const environment: number[] = []
  const sectorSignals: number[][] = Array.from({ length: sectorCount }, () => [])
  const meanOver = (cells: number[]): number => {
    let s = 0
    for (const c of cells) s += tone[c]!
    return cells.length > 0 ? s / cells.length : 0
  }

  for (let t = 0; t < beats; t++) {
    for (let s = 0; s < sectorCount; s++) if (rng.next() < flipOf(s)) signals[s] = -signals[s]!
    for (let j = 0; j < inputCells.length; j++) tone[inputCells[j]!] = signals[inputSector[j]!]! as -1 | 1
    if (withDynamics) beat(tone, graph, moved, rng, 0, cohesion)
    // re-clamp the input boundary as a steady source, so the interior reads the environment, not a leak.
    for (let j = 0; j < inputCells.length; j++) tone[inputCells[j]!] = signals[inputSector[j]!]! as -1 | 1
    interior.push(meanOver(interiorCells))
    environment.push(signals.reduce((a, b) => a + b, 0) / sectorCount)
    for (let s = 0; s < sectorCount; s++) sectorSignals[s]!.push(signals[s]!)
  }
  return { interior, environment, sectorSignals }
}
