// Window-safe checks for the turning weave: (a) dressed-traveller support profile at side 21,
// (b) the Sakharov quench structure (matter asymmetry, conservation, quantization,
// commensurate null) under the turning schedule.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat, growingBeat } from '@/code/rule/lattice-gas'
import { PAIR_FORWARD, PAIR_INVERSE, Collision } from '@/code/rule/collision'
import { linesOf, linePermutations } from '@/task/palindrome-hunt'

type Tone = -1 | 0 | 1
const pairKey = (a: Tone, b: Tone): number => (a + 1) * 3 + (b + 1)

const makeTurning = (side: number): ((t: number, forward: boolean) => Collision) => {
  const mesh = d4Mesh({ side })
  const opposite = meshOpposites(mesh)
  const lines = linesOf(opposite)
  const mid = Math.floor(side / 2)
  const center = mid + mid * side + mid * side * side + mid * side ** 3
  const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
  const wrap = (d: number): number => (d > side / 2 ? d - side : d < -side / 2 ? d + side : d)
  const roots: number[][] = []
  for (let d = 0; d < 24; d++) {
    const to = mesh.neighbour(center, d)
    roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - coord(center, a))))
  }
  const g = linePermutations({ lines, roots })[148]!
  const M0: [number, number][] = [[0, 3], [2, 5], [4, 1], [6, 9], [8, 11], [10, 7]]
  const norm = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])
  const couplesAt = (t: number): [number, number][] => {
    let c = M0.map(([a, b]) => norm(a, b))
    for (let i = 0; i < t % 4; i++) c = c.map(([a, b]) => norm(g[a]!, g[b]!))
    return c
  }
  return (t, forward) => {
    const couples = couplesAt(t)
    const swapIdx = t % 6
    const table = forward ? PAIR_FORWARD : PAIR_INVERSE
    const loneAway = (a: Tone, b: Tone): boolean => a === 0 && b !== 0
    const empty = (a: Tone, b: Tone): boolean => a === 0 && b === 0
    return (slots, base) => {
      for (let k = 0; k < 6; k++) {
        const line = lines[couples[k]![0]!]!
        const wire = lines[couples[k]![1]!]!
        const swap = (): void => {
          const a0 = (slots[base + line[0]] ?? 0) as Tone
          const a1 = (slots[base + line[1]] ?? 0) as Tone
          const w0 = (slots[base + wire[0]] ?? 0) as Tone
          const w1 = (slots[base + wire[1]] ?? 0) as Tone
          if ((loneAway(a0, a1) && empty(w0, w1)) || (loneAway(w0, w1) && empty(a0, a1))) {
            slots[base + line[0]] = w0
            slots[base + line[1]] = w1
            slots[base + wire[0]] = a0
            slots[base + wire[1]] = a1
          }
        }
        const clock = (): void => {
          const a = (slots[base + wire[0]] ?? 0) as Tone
          const b = (slots[base + wire[1]] ?? 0) as Tone
          const image = table[pairKey(a, b)]!
          slots[base + wire[0]] = image[0]
          slots[base + wire[1]] = image[1]
        }
        if (k === swapIdx) { swap(); clock(); swap() } else { clock() }
      }
    }
  }
}

// (a) dressed profile at side 21, 20 beats (max reach 10 < 10.5, window safe)
{
  const side = 21
  const mesh = d4Mesh({ side })
  const turning = makeTurning(side)
  const mid = 10
  const center = mid + mid * side + mid * side * side + mid * side ** 3
  for (const dir of [8, 0]) {
    let vacuum: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)
    seeded.data[center * 24 + dir] = 1
    const supports: number[] = []
    for (let t = 0; t < 20; t++) {
      vacuum = beat(vacuum, turning(t, true))
      seeded = beat(seeded, turning(t, true))
      let s = 0
      for (let i = 0; i < seeded.data.length; i++)
        if (seeded.data[i] !== vacuum.data[i]) s++
      supports.push(s)
    }
    console.log(`side21 dir ${dir} support: ${supports.join(' ')}`)
  }
}

// (b) Sakharov quench under the turning weave, side 13
{
  const side = 13
  const mesh = d4Mesh({ side })
  const opposite = meshOpposites(mesh)
  const lines = linesOf(opposite)
  const turning = makeTurning(side)
  const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
  // matter vs wire role is now time-dependent, so measure the tone sum split by
  // schedule-invariant classes instead: total (conservation) and per-line sums
  for (const k of [1, 2, 3]) {
    let will: Will = makeWill(mesh)
    const rows: string[] = []
    for (let t = 0; t < 36; t++) {
      const bornThrough = Math.min(side - 1, Math.floor((t + 1) / k))
      const active = (c: number): boolean => coord(c, 0) <= bornThrough
      will = growingBeat(will, turning(t, true), active)
      let total = 0
      const byLine = new Array(12).fill(0)
      for (let i = 0; i < will.data.length; i++) {
        const v = will.data[i]!
        if (v !== 0) {
          total += v
          const d = i % 24
          const line = lines.findIndex(([x, y]) => x === d || y === d)
          byLine[line] += v
        }
      }
      const spread = Math.max(...byLine.map(Math.abs))
      if ((t + 1) % 12 === 0) rows.push(`t=${t + 1} total=${total} maxLineCharge=${spread}`)
    }
    console.log(`quench k=${k}: ${rows.join('  ')}`)
  }
}
