// The genuinely joint effect of several tones on a rule's evolution, over several beats, measured by
// inclusion-exclusion. Put any subset S of the tones on a background, run the rule, and read the
// will F(S) as an integer vector. For three tones the third-order difference
//
//   D3 = F(abc) - F(ab) - F(ac) - F(bc) + F(a) + F(b) + F(c) - F(empty)
//
// is zero at every slot when the three tones affect the result only one at a time or two at a time
// (as independent single-tone effects plus pairwise interactions), and nonzero where the outcome
// depends on all three together. For two tones the same sum, F(ab) - F(a) - F(b) + F(), is the pair
// interaction. The background's own evolution cancels, so a busy vacuum is fine. Everything is an
// exact run of the rule: no sampling.

import { Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { Will, cloneWill } from '@/code/tone/will'

export type TonePlacement = { readonly cell: number; readonly direction: number; readonly tone: number }

// The support (number of slots where the highest-order inclusion-exclusion sum is nonzero) after
// each of the given beat counts, for placements written onto the background before beat `phase`.
export function jointDifferenceSupport(input: {
  background: Will
  placements: readonly TonePlacement[]
  schedule: (beatIndex: number) => Collision
  phase: number
  checkpoints: readonly number[]
}): number[] {
  const { background, placements, schedule, phase, checkpoints } = input
  const count = placements.length
  const subsets = 1 << count
  const degree = background.mesh.degree
  const table = streamSourceTable(background.mesh)
  const last = Math.max(...checkpoints)
  const snapshots = checkpoints.map(() => new Int32Array(background.data.length))

  for (let subset = 0; subset < subsets; subset++) {
    let bits = 0

    for (let s = subset; s > 0; s >>= 1) {
      bits += s & 1
    }

    const sign = (count - bits) % 2 === 0 ? 1 : -1

    let a = cloneWill(background)
    let b = cloneWill(background)

    placements.forEach((placement, index) => {
      if ((subset >> index) & 1) {
        a.data[placement.cell * degree + placement.direction] = placement.tone
      }
    })

    for (let t = 1; t <= last; t++) {
      beatInto({ src: a, dst: b, table, collision: schedule(phase + t - 1) })
      ;[a, b] = [b, a]

      checkpoints.forEach((checkpoint, i) => {
        if (checkpoint === t) {
          const snapshot = snapshots[i]

          if (snapshot !== undefined) {
            for (let k = 0; k < snapshot.length; k++) {
              snapshot[k] = (snapshot[k] ?? 0) + sign * (a.data[k] ?? 0)
            }
          }
        }
      })
    }
  }

  return snapshots.map(snapshot => snapshot.reduce((n, v) => n + (v !== 0 ? 1 : 0), 0))
}
