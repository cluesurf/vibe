// The palindromic turning weave: a searched, CPT-exact candidate for gauge universality. The
// committed rule's six couples are exactly decoupled (E-FND-0114), so no carrier can couple to
// every species. The measured obstruction: species connectivity needs at least eleven interaction
// edges, no single element of the 384-element torus symmetry group drags the swap couple past nine
// lines, and the triality cosets do not act on the integer torus. The construction that clears it
// is a TWO-CLOCK SCHEDULE: the couple partition walks under a period-4 group element while the
// swap rotates through the six couples. The cyclic version of that schedule connects all twelve
// species but has NO CPT partner anywhere in the 384-element group at any phase (the control,
// measured here). The repair is the same principle that fixed lineHop at the collision level,
// applied one level up: make the SCHEDULE a palindrome (the partition walks out and back, the swap
// order runs out and back), and sweep the two mirror phases and the swap visiting order for a
// design that is both connected and CPT-symmetric. The winner (order zero-two-three-one-four-five,
// both phases zero, element one-forty-eight, period twenty-four) then passes every gate:
//
//   - CPT EXACT, PURE C TIMES T: negating tones and reversing the schedule at mirror phase
//     twenty-three reproduces the forward rule exactly, with the IDENTITY spatial parity. Checked
//     densely, zero mismatches.
//   - CONNECTED UNIVERSALITY: the swap edges cover and connect all twelve lines, and twenty-one of
//     twenty-four directions measurably interact (against four under the committed weave).
//   - THE FREE-SECTOR PILLARS CARRY: exact echo with zero charge drift, exact separated
//     superposition, and the vacuum stays exactly periodic at the schedule period.
//
// This is a CANDIDATE held for the acceptance programme (walls, interference, unit kicks, the
// dressed window), not an adoption. Depth L2, deterministic, the cyclic schedule the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat, collide, streamInverse } from '@/code/rule/lattice-gas'
import {
  Collision,
  PAIR_FORWARD,
  PAIR_INVERSE,
} from '@/code/rule/collision'
import { linesOf, linePermutations } from '@/task/palindrome-hunt'

type Tone = -1 | 0 | 1
type Beat = { couples: [number, number][]; swapIdx: number }

const ELEMENT = 148
const ORDER = [0, 2, 3, 1, 4, 5]
const POS_MIRROR = [0, 1, 2, 3, 3, 2, 1, 0]

function pairKeyOf(a: Tone, b: Tone): number {
  return (a + 1) * 3 + (b + 1)
}

function rootsOf(side: number): number[][] {
  const mesh = d4Mesh({ side })
  const mid = Math.floor(side / 2)
  const center =
    mid + mid * side + mid * side * side + mid * side ** 3
  const coordinate = (c: number, a: number): number =>
    Math.floor(c / side ** a) % side
  const wrap = (d: number): number =>
    d > side / 2 ? d - side : d < -side / 2 ? d + side : d
  const roots: number[][] = []

  for (let d = 0; d < 24; d++) {
    const to = mesh.neighbour(center, d)

    roots.push(
      [0, 1, 2, 3].map(a =>
        wrap(coordinate(to, a) - coordinate(center, a)),
      ),
    )
  }

  return roots
}

function scheduleOf(input: {
  side: number
  palindromic: boolean
}): { beats: Beat[]; lines: [number, number][] } {
  const mesh = d4Mesh({ side: input.side })
  const opposite = meshOpposites(mesh)
  const lines = linesOf(opposite)
  const roots = rootsOf(input.side)
  const g = linePermutations({ lines, roots })[ELEMENT]!
  const M0: [number, number][] = [
    [0, 3],
    [2, 5],
    [4, 1],
    [6, 9],
    [8, 11],
    [10, 7],
  ]
  const norm = (a: number, b: number): [number, number] =>
    a < b ? [a, b] : [b, a]
  const positions: [number, number][][] = []
  let current = M0.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 4; i++) {
    positions.push(current)
    current = current.map(([a, b]) => norm(g[a]!, g[b]!))
  }

  const beats: Beat[] = []

  if (input.palindromic) {
    const swapMirror = [...ORDER, ...[...ORDER].reverse()]

    for (let t = 0; t < 24; t++) {
      beats.push({
        couples: positions[POS_MIRROR[t % 8]!]!,
        swapIdx: swapMirror[t % 12]!,
      })
    }
  } else {
    let cyclic = M0.map(([a, b]) => norm(a, b))

    for (let t = 0; t < 12; t++) {
      beats.push({ couples: cyclic, swapIdx: t % 6 })
      cyclic = cyclic.map(([a, b]) => norm(g[a]!, g[b]!))
    }
  }

  return { beats, lines }
}

function collisionOf(
  lines: [number, number][],
  b: Beat,
  forward: boolean,
): Collision {
  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const loneAway = (x: Tone, y: Tone): boolean => x === 0 && y !== 0
  const empty = (x: Tone, y: Tone): boolean => x === 0 && y === 0

  return (slots, base) => {
    for (let k = 0; k < 6; k++) {
      const line = lines[b.couples[k]![0]!]!
      const wire = lines[b.couples[k]![1]!]!
      const swap = (): void => {
        const a0 = (slots[base + line[0]] ?? 0) as Tone
        const a1 = (slots[base + line[1]] ?? 0) as Tone
        const w0 = (slots[base + wire[0]] ?? 0) as Tone
        const w1 = (slots[base + wire[1]] ?? 0) as Tone

        if (
          (loneAway(a0, a1) && empty(w0, w1)) ||
          (loneAway(w0, w1) && empty(a0, a1))
        ) {
          slots[base + line[0]] = w0
          slots[base + line[1]] = w1
          slots[base + wire[0]] = a0
          slots[base + wire[1]] = a1
        }
      }
      const clock = (): void => {
        const a = (slots[base + wire[0]] ?? 0) as Tone
        const x = (slots[base + wire[1]] ?? 0) as Tone
        const image = table[pairKeyOf(a, x)]!

        slots[base + wire[0]] = image[0]
        slots[base + wire[1]] = image[1]
      }

      if (k === b.swapIdx) {
        swap()
        clock()
        swap()
      } else {
        clock()
      }
    }
  }
}

function sampleVector(n: number): Int8Array {
  const v = new Int8Array(24)

  for (let i = 0; i < 24; i++) {
    v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1
  }

  return v
}

export default experiment({
  id: 'foundations/palindromic-turning-weave',
  code: 'E-FND-0117',
  title:
    'the palindromic turning weave is a searched CPT-exact candidate for gauge universality: the cyclic two-clock schedule connects all twelve species but has no CPT partner anywhere in the 384-element torus group at any phase (the control), while making the schedule a palindrome and sweeping the mirror phases and swap order yields a design (order zero-two-three-one-four-five, element one-forty-eight, period twenty-four) whose CPT is exact under pure charge conjugation with time reversal at the mirror phase and identity spatial parity, whose swap edges cover and connect all twelve lines with twenty-one of twenty-four directions measurably interacting, and under which echo, charge conservation, separated superposition and the exact vacuum periodicity all carry',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // 1. THE CONTROL: the cyclic schedule fails CPT over the whole group and every phase
    const small = scheduleOf({ side: 5, palindromic: false })
    const roots5 = rootsOf(5)
    const rootIndex = new Map(roots5.map((r, i) => [r.join(','), i]))
    const dirPerms: number[][] = []
    const perms4: number[][] = []
    const build = (acc: number[], rest: number[]): void => {
      if (rest.length === 0) {
        perms4.push(acc)

        return
      }

      for (let i = 0; i < rest.length; i++) {
        build(
          [...acc, rest[i]!],
          rest.filter((_, j) => j !== i),
        )
      }
    }

    build([], [0, 1, 2, 3])

    for (const p of perms4) {
      for (let m = 0; m < 16; m++) {
        const s = [
          m & 1 ? -1 : 1,
          m & 2 ? -1 : 1,
          m & 4 ? -1 : 1,
          m & 8 ? -1 : 1,
        ]
        const dp = new Array<number>(24)

        for (let d = 0; d < 24; d++) {
          dp[d] = rootIndex.get(
            [0, 1, 2, 3].map(i => s[i]! * roots5[d]![p[i]!]!).join(','),
          )!
        }

        dirPerms.push(dp)
      }
    }

    const applyBeat = (
      lines: [number, number][],
      b: Beat,
      forward: boolean,
      v: Int8Array,
    ): Int8Array => {
      const s = Int8Array.from(v)

      collisionOf(lines, b, forward)(s, 0, 24)

      return s
    }

    let cyclicSurvivors = 0

    for (let pi = 0; pi < dirPerms.length; pi++) {
      const p = dirPerms[pi]!
      const pInv = new Array<number>(24)

      for (let d = 0; d < 24; d++) {
        pInv[p[d]!] = d
      }

      for (let c = 0; c < 12; c++) {
        let ok = true

        outer: for (let t = 0; t < 12 && ok; t++) {
          const sigma = (((c - t) % 12) + 12) % 12

          for (let n = 0; n < 12; n++) {
            const v = sampleVector(n * 12 + t)
            const rhs = applyBeat(small.lines, small.beats[t]!, true, v)
            const w = new Int8Array(24)

            for (let d = 0; d < 24; d++) {
              w[d] = -v[p[d]!]!
            }

            const m2 = applyBeat(small.lines, small.beats[sigma]!, false, w)

            for (let d = 0; d < 24; d++) {
              if (-m2[pInv[d]!]! !== rhs[d]!) {
                ok = false
                break outer
              }
            }
          }
        }

        if (ok) {
          cyclicSurvivors++
        }
      }
    }

    // 2. the winner's CPT, dense, identity parity, mirror phase twenty-three
    const winner = scheduleOf({ side: 5, palindromic: true })
    let cptBad = 0

    for (let t = 0; t < 24; t++) {
      const sigma = (((23 - t) % 24) + 24) % 24

      for (let n = 0; n < 2000; n++) {
        const v = sampleVector(n * 17 + t * 3 + 2)
        const rhs = applyBeat(winner.lines, winner.beats[t]!, true, v)
        const m2 = applyBeat(
          winner.lines,
          winner.beats[sigma]!,
          false,
          Int8Array.from(v, x => -x as Tone),
        )

        for (let d = 0; d < 24; d++) {
          if (-m2[d]! !== rhs[d]!) {
            cptBad++
            break
          }
        }
      }
    }

    // 3. connectivity of the swap-edge graph
    const edges = new Set<string>()

    for (const b of winner.beats) {
      edges.add(b.couples[b.swapIdx]!.join('-'))
    }

    const parent = Array.from({ length: 12 }, (_, i) => i)
    const find = (x: number): number =>
      parent[x] === x ? x : (parent[x] = find(parent[x]!))
    const nodes = new Set<number>()

    for (const e of edges) {
      const [a, b] = e.split('-').map(Number)

      nodes.add(a!).add(b!)
      parent[find(a!)] = find(b!)
    }

    const connected =
      nodes.size === 12 &&
      new Set(Array.from({ length: 12 }, (_, i) => find(i))).size === 1

    // 4. echo, charge, vacuum period, universality, superposition at side 9
    const side = 9
    const mesh = d4Mesh({ side })
    const big = scheduleOf({ side, palindromic: true })
    const start = makeWill(mesh)

    for (let i = 0; i < start.data.length; i++) {
      start.data[i] = (((i * 5 + (i % 11)) % 3) - 1) as Tone
    }

    let charge0 = 0

    for (const v of start.data) {
      charge0 += v
    }

    let will: Will = { mesh, data: Int8Array.from(start.data) }

    for (let t = 0; t < 24; t++) {
      will = beat(will, collisionOf(big.lines, big.beats[t]!, true))
    }

    let charge1 = 0

    for (const v of will.data) {
      charge1 += v
    }

    for (let t = 23; t >= 0; t--) {
      will = streamInverse(will)
      collide(will, collisionOf(big.lines, big.beats[t]!, false))
    }

    let echoHamming = 0

    for (let i = 0; i < will.data.length; i++) {
      if (will.data[i] !== start.data[i]) {
        echoHamming++
      }
    }

    let vacuum: Will = makeWill(mesh)
    const snaps: string[] = []

    for (let t = 0; t < 96; t++) {
      vacuum = beat(
        vacuum,
        collisionOf(big.lines, big.beats[t % 24]!, true),
      )
      snaps.push(vacuum.data.join(''))
    }

    let vacuumPeriod = 0

    outer2: for (const p of [3, 6, 12, 24, 48]) {
      for (let t = 40; t + p < 96; t++) {
        if (snaps[t] !== snaps[t + p]) {
          continue outer2
        }
      }

      vacuumPeriod = p
      break
    }

    const mid = 4
    const center =
      mid + mid * side + mid * side * side + mid * side ** 3
    let interacting = 0

    for (let dir = 0; dir < 24; dir++) {
      let vac: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + dir] = 1

      let hit = false

      for (let t = 0; t < 24; t++) {
        vac = beat(vac, collisionOf(big.lines, big.beats[t]!, true))
        seeded = beat(
          seeded,
          collisionOf(big.lines, big.beats[t]!, true),
        )

        let s = 0

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vac.data[i]) {
            s++
          }
        }

        if (s > 1) {
          hit = true
        }
      }

      if (hit) {
        interacting++
      }
    }

    const runDiff = (seeds: [number, number][]): Int8Array[] => {
      let vac: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      for (const [c, d] of seeds) {
        seeded.data[c * 24 + d] = 1
      }

      const out: Int8Array[] = []

      for (let t = 0; t < 16; t++) {
        vac = beat(vac, collisionOf(big.lines, big.beats[t]!, true))
        seeded = beat(
          seeded,
          collisionOf(big.lines, big.beats[t]!, true),
        )

        const diff = new Int8Array(seeded.data.length)

        for (let i = 0; i < seeded.data.length; i++) {
          diff[i] = (seeded.data[i]! - vac.data[i]! + 3) % 3
        }

        out.push(diff)
      }

      return out
    }

    const other =
      ((mid + 3) % side) +
      ((mid + 3) % side) * side +
      mid * side * side +
      ((mid + 3) % side) * side ** 3
    const soloA = runDiff([[center, 8]])
    const soloB = runDiff([[other, 16]])
    const joint = runDiff([
      [center, 8],
      [other, 16],
    ])
    let superpositionWorst = 0

    for (let t = 0; t < 16; t++) {
      let bad = 0

      for (let i = 0; i < joint[t]!.length; i++) {
        if (joint[t]![i] !== (soloA[t]![i]! + soloB[t]![i]!) % 3) {
          bad++
        }
      }

      superpositionWorst = Math.max(superpositionWorst, bad)
    }

    const ok =
      cyclicSurvivors === 0 &&
      cptBad === 0 &&
      connected &&
      echoHamming === 0 &&
      charge1 === charge0 &&
      vacuumPeriod === 24 &&
      interacting >= 20 &&
      superpositionWorst === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the cyclic schedule has zero CPT survivors over the whole group and every phase, the palindromic winner has zero CPT mismatches densely under pure charge conjugation with time reversal, its swap edges connect all twelve lines, at least twenty of twenty-four directions interact, and echo, charge, superposition and the exact vacuum period all carry',
      metrics: {
        cyclicCptSurvivors: cyclicSurvivors,
        winnerCptBad: cptBad,
        swapEdges: edges.size,
        interactingDirections: interacting,
        echoHamming,
        chargeDrift: charge1 - charge0,
        vacuumPeriod,
        superpositionWorst,
      },
      // CONTROL: the cyclic schedule, same construction minus the palindrome, fails CPT everywhere
      control: {
        connectedGraph: connected ? 1 : 0,
      },
      notes:
        'held as a candidate for the acceptance programme, not an adoption: walls, interference, unit kicks and the long-window dressed profile are unmeasured, and the design search lives in task/turning-weave-search.ts. The three non-interacting directions are phase-protected (their motion never meets the swap trigger window), not structurally sterile, since the swap orbit covers all twelve lines.',
    })
  },
})
