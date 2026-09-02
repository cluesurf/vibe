// The turning weave, candidate gi=148: partition precesses under g (period 4), the swap
// rotates through the six couples, schedule period 12. Mini acceptance battery:
// echo, charge conservation, vacuum periodicity, universality witness, superposition,
// traveller profile.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat, collide, streamInverse } from '@/code/rule/lattice-gas'
import { PAIR_FORWARD, PAIR_INVERSE, Collision } from '@/code/rule/collision'
import { linesOf, linePermutations } from '@/task/palindrome-hunt'

type Tone = -1 | 0 | 1
const pairKey = (a: Tone, b: Tone): number => (a + 1) * 3 + (b + 1)

const SIDE = 9
const mesh = d4Mesh({ side: SIDE })
const opposite = meshOpposites(mesh)
const lines = linesOf(opposite)
const mid = Math.floor(SIDE / 2)
const center = mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3
const coord = (c: number, a: number): number => Math.floor(c / SIDE ** a) % SIDE
const wrap = (d: number): number => (d > SIDE / 2 ? d - SIDE : d < -SIDE / 2 ? d + SIDE : d)
const roots: number[][] = []
for (let d = 0; d < 24; d++) {
  const to = mesh.neighbour(center, d)
  roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - coord(center, a))))
}
const g = linePermutations({ lines, roots })[148]!
const M0: [number, number][] = [[0, 3], [2, 5], [4, 1], [6, 9], [8, 11], [10, 7]]
const norm = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])

// ordered couples at beat t (partition transported t times)
const couplesAt = (t: number): [number, number][] => {
  let c = M0.map(([a, b]) => norm(a, b))
  for (let i = 0; i < t % 4; i++) c = c.map(([a, b]) => norm(g[a]!, g[b]!))
  return c
}

const makeCollision = (t: number, forward: boolean): Collision => {
  const couples = couplesAt(t)
  const swapIdx = t % 6
  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const loneAway = (a: Tone, b: Tone): boolean => a === 0 && b !== 0
  const empty = (a: Tone, b: Tone): boolean => a === 0 && b === 0

  return (slots, base) => {
    for (let k = 0; k < 6; k++) {
      const [ml, wl] = [couples[k]![0]!, couples[k]![1]!]
      const line = lines[ml]!
      const wire = lines[wl]!
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

// 1. echo + charge conservation, generic state, 24 beats
{
  const start = makeWill(mesh)
  for (let i = 0; i < start.data.length; i++)
    start.data[i] = ((((i * 5 + (i % 11)) % 3) - 1) as Tone)
  let charge0 = 0
  for (const v of start.data) charge0 += v
  let will: Will = { mesh, data: Int8Array.from(start.data) }
  for (let t = 0; t < 24; t++) will = beat(will, makeCollision(t, true))
  let charge1 = 0
  for (const v of will.data) charge1 += v
  for (let t = 23; t >= 0; t--) {
    will = streamInverse(will)
    collide(will, makeCollision(t, false))
  }
  let hamming = 0
  for (let i = 0; i < will.data.length; i++)
    if (will.data[i] !== start.data[i]) hamming++
  console.log(`echo hamming=${hamming} chargeDrift=${charge1 - charge0}`)
}

// 2. vacuum periodicity from empty
{
  let will: Will = makeWill(mesh)
  const snaps: string[] = []
  for (let t = 0; t < 60; t++) {
    will = beat(will, makeCollision(t, true))
    snaps.push(will.data.join(''))
  }
  let period = 0
  outer: for (const p of [3, 4, 6, 12, 24, 36, 48]) {
    for (let t = 24; t + p < 60; t++) if (snaps[t] !== snaps[t + p]) continue outer
    period = p
    break
  }
  console.log(`vacuum exact period: ${period || 'NONE <= 48'}`)
}

// 3. universality witness + traveller profile: every direction's defect interacts
{
  const diffRun = (dir: number): number[] => {
    let vacuum: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)
    seeded.data[center * 24 + dir] = 1
    const supports: number[] = []
    for (let t = 0; t < 24; t++) {
      vacuum = beat(vacuum, makeCollision(t, true))
      seeded = beat(seeded, makeCollision(t, true))
      let s = 0
      for (let i = 0; i < seeded.data.length; i++)
        if (seeded.data[i] !== vacuum.data[i]) s++
      supports.push(s)
    }
    return supports
  }
  let interacting = 0
  let maxSupport = 0
  let sample: number[] = []
  for (let dir = 0; dir < 24; dir++) {
    const s = diffRun(dir)
    if (s.some(x => x > 1)) interacting++
    maxSupport = Math.max(maxSupport, ...s)
    if (dir === 8) sample = s
  }
  console.log(`interacting directions: ${interacting}/24, max support ${maxSupport}`)
  console.log(`dir 8 (was free clock matter) support: ${sample.join(' ')}`)
}

// 4. separated superposition additivity
{
  const run = (seeds: [number, number][]): Int8Array[] => {
    let vacuum: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)
    for (const [c, d] of seeds) seeded.data[c * 24 + d] = 1
    const out: Int8Array[] = []
    for (let t = 0; t < 16; t++) {
      vacuum = beat(vacuum, makeCollision(t, true))
      seeded = beat(seeded, makeCollision(t, true))
      const diff = new Int8Array(seeded.data.length)
      for (let i = 0; i < seeded.data.length; i++)
        diff[i] = (seeded.data[i]! - vacuum.data[i]! + 3) % 3
      out.push(diff)
    }
    return out
  }
  const a = center
  const b = ((mid + 3) % SIDE) + ((mid + 3) % SIDE) * SIDE + mid * SIDE * SIDE + ((mid + 3) % SIDE) * SIDE ** 3
  const soloA = run([[a, 8]])
  const soloB = run([[b, 16]])
  const joint = run([[a, 8], [b, 16]])
  let worst = 0
  for (let t = 0; t < 16; t++) {
    let bad = 0
    for (let i = 0; i < joint[t]!.length; i++)
      if (joint[t]![i] !== (soloA[t]![i]! + soloB[t]![i]!) % 3) bad++
    worst = Math.max(worst, bad)
  }
  console.log(`separated superposition worst mismatch: ${worst}`)
}
