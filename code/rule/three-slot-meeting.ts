// A three-slot meeting in the color weave: the reflection through the frame direction (E-QTM-0134) applied to
// the role points of three vibes of one dock that are not a knot (E-QTM-0136).
//
// The step, at beat t in every dock: scan the 24 slots from slot t mod 24 on, take the first three that hold
// a vibe, and when their signs are not all alike (love-love-fear or love-fear-fear, charge 1 or 2 mod 3)
// move their role points by R = 2 q^(-1) 1 w^T - 1 (code/measure/frame-covariant-meeting). A knot of three
// (all alike) is left in place: its only covariant Clifford meetings are permutations.
//
// The choice of slots reads only the vibes, which the step never changes, and R is an involution, so the
// step is its own inverse and the beat with it is undone by running it again after the backward color beat.
// R acts alike on the role and the tilt, so it is the same map on the grid index x + 3 y and on the phase
// index 3 a + b.
//
// A 'sum' rule is the control: SUM on the first two of the triple (the first the control), which reads the
// role by a preferred axis.

import { colorBeat, colorBeatBack, type ColorWeave } from '@/code/rule/color-weave'
import { type VibeState } from '@/code/rule/vibe-weave'
import { applyStoredLinear, frameReflection } from '@/code/measure/frame-covariant-meeting'
import { sumPermutation } from '@/code/measure/sum-record'

export type TripleRule = 'reflection' | 'sum'

export type TripleStats = {
  fired: number
  knots: number
  short: number
  changed: number
  // fired triples whose odd token's point differs from both like tokens' points
  axis: number
}

export const emptyStats = (): TripleStats => ({ fired: 0, knots: 0, short: 0, changed: 0, axis: 0 })

const REFLECTIONS = new Map<string, number[]>()

function reflectionOf(signs: readonly number[]): number[] {
  const key = signs.join(',')
  let r = REFLECTIONS.get(key)

  if (!r) {
    r = frameReflection(signs) ?? []
    REFLECTIONS.set(key, r)
  }

  return r
}

// grid index x + 3 y to phase index 3 x + y and back (the same swap of digits)
const swapDigits = (p: number): number => 3 * (p % 3) + Math.floor(p / 3)

// the triple step on a copy of the role points; vibes and flow are shared, never changed
export function tripleStep(input: { weave: ColorWeave; state: VibeState; t: number; rule: TripleRule; stats?: TripleStats }): VibeState {
  const { weave, state, t, rule, stats } = input
  const role = Int8Array.from(state.role)
  const points = [0, 0, 0]
  const out = [0, 0, 0]
  const slots = [0, 0, 0]
  const signs = [0, 0, 0]
  const sum = rule === 'sum' ? sumPermutation() : undefined

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    let found = 0

    for (let k = 0; k < 24 && found < 3; k++) {
      const slot = x * 24 + ((t + k) % 24)
      const v = state.vibe[slot] ?? 0

      if (v !== 0) {
        slots[found] = slot
        signs[found] = v
        found++
      }
    }

    if (found < 3) {
      if (stats) {
        stats.short++
      }

      continue
    }

    if (signs[0] === signs[1] && signs[1] === signs[2]) {
      if (stats) {
        stats.knots++
      }

      continue
    }

    for (let i = 0; i < 3; i++) {
      points[i] = role[slots[i] ?? 0] ?? 0
    }

    if (sum) {
      const image = sum[9 * swapDigits(points[0] ?? 0) + swapDigits(points[1] ?? 0)] ?? 0

      out[0] = swapDigits(Math.floor(image / 9))
      out[1] = swapDigits(image % 9)
      out[2] = points[2] ?? 0
    } else {
      applyStoredLinear(reflectionOf(signs), points, out)
    }

    if (stats) {
      const odd = signs.findIndex(w => signs.filter(s => s === w).length === 1)

      stats.fired++
      stats.changed += out.some((p, i) => p !== points[i]) ? 1 : 0
      stats.axis += [0, 1, 2].every(i => i === odd || points[i] !== points[odd]) ? 1 : 0
    }

    for (let i = 0; i < 3; i++) {
      role[slots[i] ?? 0] = out[i] ?? 0
    }
  }

  return { vibe: state.vibe, role, flow: state.flow }
}

// one beat: the triple step, then the color weave's beat
export function tripleBeat(weave: ColorWeave, state: VibeState, t: number, stats?: TripleStats): VibeState {
  return colorBeat(weave, tripleStep({ weave, state, t, rule: 'reflection', stats }), t)
}

// its exact inverse: the backward color beat, then the triple step again (an involution)
export function tripleBeatBack(weave: ColorWeave, state: VibeState, t: number): VibeState {
  return tripleStep({ weave, state: colorBeatBack(weave, state, t), t, rule: 'reflection' })
}
