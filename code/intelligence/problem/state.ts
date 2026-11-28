/**
 * The state an intelligence works on: cells of the mesh, each a tone
 * pain -1, peace 0 or pleasure +1, and optionally a tone on each link.
 *
 * One type serves the three regimes compared by the intelligence lab:
 *
 * - `pure`: cells only, fixed relations. `links` is absent. This is the
 *   real test of emergence, since nothing but tones carries information.
 * - `relational`: links carry tones too, but no operator may change them.
 * - `adaptive`: links carry tones and operators may change them.
 *
 * The evaluator (problem/evaluate.ts) checks every path against its
 * problem's regime, so a solver cannot quietly move to a richer regime.
 */

export type Valence = -1 | 0 | 1

export type Regime = 'pure' | 'relational' | 'adaptive'

export const REGIMES: readonly Regime[] = ['pure', 'relational', 'adaptive']

export interface MeshState {
  /** one tone per cell, in the geometry's cell order */
  cells: Int8Array
  /** one tone per link, in the geometry's link order; absent in the pure regime */
  links?: Int8Array
}

/** A canonical, injective text key of a tone array (each tone one char). */
export function toneKey(tones: Int8Array): string {
  let out = ''
  for (let index = 0; index < tones.length; index++) {
    const tone = tones[index]
    if (tone === -1) {
      out += '-'
    } else if (tone === 0) {
      out += '0'
    } else if (tone === 1) {
      out += '+'
    } else {
      throw new Error(`toneKey: value ${String(tone)} at ${index} is not a tone`)
    }
  }
  return out
}

/** A canonical key of a mesh state; equal keys mean equal states. */
export function meshStateKey(state: MeshState): string {
  const cells = toneKey(state.cells)
  return state.links === undefined ? cells : `${cells}|${toneKey(state.links)}`
}

/** The links of a mesh state, or null in the pure regime. */
export function meshStateLinks(state: MeshState): Int8Array | null {
  return state.links ?? null
}

/** A deep copy, so an operator can build its result without touching its input. */
export function copyMeshState(state: MeshState): MeshState {
  return state.links === undefined
    ? { cells: state.cells.slice() }
    : { cells: state.cells.slice(), links: state.links.slice() }
}

/** Bytes held by one mesh state's tones. */
export function meshStateBytes(state: MeshState): number {
  return state.cells.byteLength + (state.links?.byteLength ?? 0)
}
