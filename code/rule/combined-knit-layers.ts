// The combined knit's dock collision written as its three layers (E-RLT-0059).
//
// code/rule/combined-knit runs, at beat t with steering off, the scatter set S_(c - t), the base B_t and the
// scatter set S_t, c the base's CPT mirror phase (COMBINED_DEFAULT: 23). The base is exported as a collision
// (combinedCollision with the scatter block off). The scatter set is private to that module, so it is
// rewritten here from its definition: each scattering (u, v, w, x) of scatterSchedule()'s set fires only
// when the opposite slots of all four are calm and two tones sit on u, v with w, x calm (or the reverse),
// and then u trades with w and v with x. The product S_t B_t S_(c - t) is checked against combinedCollision
// state by state in E-RLT-0059 (code/measure/exact-linear-collision composeMismatches), so a disagreement
// with the owning module cannot pass silently.

import { type Collision } from '@/code/rule/collision'
import { combinedCollision, COMBINED_DEFAULT, type CombinedKnitSpec } from '@/code/rule/combined-knit'
import { scatterSchedule } from '@/code/rule/scatter-weave'

const mod = (t: number, n: number): number => ((t % n) + n) % n

// one scatter set as a collision, the lone condition of code/rule/combined-knit
export function scatterSetCollision(input: { set: Int32Array; opposite: readonly number[] }): Collision {
  const { set, opposite } = input

  return (vibe, base) => {
    for (let k = 0; k < set.length; k += 4) {
      const a = set[k] ?? 0
      const b = set[k + 1] ?? 0
      const c = set[k + 2] ?? 0
      const e = set[k + 3] ?? 0

      if (
        vibe[base + (opposite[a] ?? 0)] !== 0 ||
        vibe[base + (opposite[b] ?? 0)] !== 0 ||
        vibe[base + (opposite[c] ?? 0)] !== 0 ||
        vibe[base + (opposite[e] ?? 0)] !== 0
      ) {
        continue
      }

      const u = base + a
      const v = base + b
      const w = base + c
      const x = base + e
      const here = vibe[u] !== 0 && vibe[v] !== 0 && vibe[w] === 0 && vibe[x] === 0
      const there = vibe[w] !== 0 && vibe[x] !== 0 && vibe[u] === 0 && vibe[v] === 0

      if (here || there) {
        const vu = vibe[u] ?? 0
        const vv = vibe[v] ?? 0

        vibe[u] = vibe[w] ?? 0
        vibe[w] = vu
        vibe[v] = vibe[x] ?? 0
        vibe[x] = vv
      }
    }
  }
}

// the three factors of beat t, in the order they act: S_(c - t), B_t, S_t
export function combinedFactors(input: { t: number; opposite: readonly number[]; spec?: CombinedKnitSpec }): Collision[] {
  const spec = input.spec ?? COMBINED_DEFAULT
  const sets = scatterSchedule().map(set => Int32Array.from(set.flatMap(s => [...s])))
  const n = sets.length
  const base = combinedCollision({ spec: { ...spec, scatter: false }, opposite: input.opposite })(input.t)
  const first = scatterSetCollision({ set: sets[mod(spec.mirror - input.t, n)] ?? new Int32Array(0), opposite: input.opposite })
  const last = scatterSetCollision({ set: sets[mod(input.t, n)] ?? new Int32Array(0), opposite: input.opposite })

  return [first, base, last]
}
