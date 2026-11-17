// A register machine compiled to a railway circuit (railway-circuit.ts) and laid on a band of {7,3} or
// {5,4} (substrate/band.ts, railway-lay.ts), with the settings that lay it: the band's half-width, its
// length in periods, the two edges whose reflections make its translation, the ball it is cut from, how far
// apart the switches sit, and the lane along the axis the switches are put in. E-CMP-0022 and the site's
// railway figure both lay programs through this one function, so the figure shows the layout the
// experiment checks.

import {
  type CompiledProgram,
  type Program,
  compileProgram,
} from '@/code/compute/railway-circuit'
import { type Layout, layCircuit } from '@/code/compute/railway-lay'
import { type Band, buildBand } from '@/code/substrate/band'

/** How a tiling is cut into a band, and how a circuit is spread along it. */
export type BandPreset = {
  label: string
  symbol: [number, number]
  /** half-width of the band, as a hyperbolic distance from the axis */
  width: number
  periods: number
  /** the central tile's edges whose reflections make the translation */
  edges: [number, number]
  /** cells in the ball the band's base is cut from */
  ball: number
  /** the least number of steps between two switch tiles */
  spacing: number
  /** switches go on tiles at most this far from the axis */
  lane: number
}

export const BAND_PRESETS: Record<'heptagrid' | 'pentagrid', BandPreset> = {
  heptagrid: {
    label: '{7,3}',
    symbol: [7, 3],
    width: 5,
    periods: 200,
    edges: [0, 3],
    ball: 12000,
    spacing: 3,
    lane: 0.8,
  },
  pentagrid: {
    label: '{5,4}',
    symbol: [5, 4],
    width: 6,
    periods: 250,
    edges: [0, 2],
    ball: 60000,
    spacing: 5,
    lane: 0.8,
  },
}

/** Build a preset's band. */
export function presetBand(preset: BandPreset): Band {
  return buildBand({
    symbol: preset.symbol,
    width: preset.width,
    periods: preset.periods,
    edges: preset.edges,
    ball: preset.ball,
  })
}

/** Compile a program and lay its circuit on a band, the switches along the lane in axis order. */
export function layProgramOnBand({
  preset,
  band,
  program,
  initial,
  units,
}: {
  preset: BandPreset
  band: Band
  program: Program
  initial: number[]
  units: number[]
}): { compiled: CompiledProgram; layout: Layout } {
  const line = [...band.neighbors.keys()]
    .filter(t => Math.abs(band.across[t]!) <= preset.lane)
    .sort((a, b) => band.along[a]! - band.along[b]!)
  const compiled = compileProgram({ program, initial, units })
  const layout = layCircuit({
    circuit: compiled.circuit,
    tiling: band,
    root: line[0]!,
    start: compiled.start,
    spacing: preset.spacing,
    line,
  })

  return { compiled, layout }
}
