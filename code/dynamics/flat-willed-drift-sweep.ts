import { Rng } from '@/code/tool/rng'

// One beat of a WILLED drift on a flat 2D square grid (4-neighbour, side L, row-major). Each
// charged cell tries to hop into an empty neighbour, with the +x direction (toward a goal at the
// +x edge) weighted up by the will strength `bias`: a candidate move scores (1 + bias*toward) *
// (1/2 + 1/2*rng.next()), where toward is +1 for +x, -1 for -x, 0 for +/-y, and the highest-scoring
// empty neighbour is chosen and taken with probability 0.6. bias=0 is an unbiased random hop. The
// `moved` flag is cleared at the start so a cell moves at most once per beat. Conserves charge
// (a pure hop, nothing created or annihilated).
export function flatWilledDriftSweep(input: {
  tone: Int8Array
  length: number
  moved: Uint8Array
  rng: Rng
  bias: number
}): void {
  const { tone, length: L, moved, rng, bias } = input
  moved.fill(0)
  for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
    const i = y * L + x
    if (tone[i] === 0 || moved[i]) continue
    const dirs: { j: number; toward: number }[] = []
    if (x + 1 < L) dirs.push({ j: i + 1, toward: 1 })
    if (x - 1 >= 0) dirs.push({ j: i - 1, toward: -1 })
    if (y + 1 < L) dirs.push({ j: i + L, toward: 0 })
    if (y - 1 >= 0) dirs.push({ j: i - L, toward: 0 })
    let chosen = -1
    let bestW = 0
    for (const d of dirs) {
      if (tone[d.j] !== 0 || moved[d.j]) continue
      const w = (1 + bias * d.toward) * (0.5 + 0.5 * rng.next())
      if (w > bestW) {
        bestW = w
        chosen = d.j
      }
    }
    if (chosen >= 0 && rng.next() < 0.6) {
      tone[chosen] = tone[i]!
      tone[i] = 0
      moved[i] = 1
      moved[chosen] = 1
    }
  }
}
