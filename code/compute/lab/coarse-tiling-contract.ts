// Simulation contracts on the coset tilings (item vibe-computation-models-0065, note m11-coarse-graining.md, tilings
// section). A section sigma sends each coarse letter to one ordered pattern of an edge block E(c) (first cell, second
// cell by the orientation of color c). It is a contract at tau when Phi^tau maps every configuration made of sigma
// blocks to one made of sigma blocks; G = sigma^-1 Phi^tau sigma is then an exact coarse rule on that subset.
//
// EXACT ON THE INFINITE TILING. Under the lifted coloring AND the lifted orientation (coarse-tiling.ts) the dynamics,
// the blocks and the section commute with the deck group N, so the image of a block depends on its quotient class and
// on the letters of the blocks in its backward dependency cone only. One block per class, every letter assignment on
// its cone, decides the contract on every block of the infinite tiling. The radial orientation is not N-periodic, so no
// contract is claimed under it.
//
// SEARCH. Every assignment of the cone (3^K, K up to about 80 blocks) cannot be listed, so a branch and bound decides
// it exactly: letters are fixed one block at a time (the target block first, then the cone's blocks in dependency
// order); each cell carries the set of tones it can still hold (a 3-bit mask), pushed through the round's pair maps as
// the image sets of the pair rule (a sound over-approximation); a branch closes as 'holds' when every pattern the
// target's two masks allow is allowed, and a fully assigned branch is a concrete configuration, read exactly. A
// counterexample is a real configuration, so a refusal is exact; 'holds' at the root of every class is a proof. A node
// budget turns an undecided class into 'cap', never into 'holds'.

import { Blocking, TileFrame } from '@/code/compute/lab/coarse-tiling'
import { PairTable } from '@/code/rule/pair-rule'

export type Cone = {
  // the target block's two cells, as cone cell indices
  target: [number, number]
  cells: number[]
  // per cone cell, its block (cone block index) and its position (0 first, 1 second) in the block
  blockOf: Int32Array
  position: Int8Array
  blocks: number[]
  // the round's steps, each a flat list of (first, second) cone cell pairs, tau rounds in order
  steps: Int32Array[]
}

// The backward dependency cone of the edge block holding `tile` (coarse-tiling.ts denseRead, the same sets), with the
// cone's blocks in the order their first cell is met from the target outward.
export function edgeCone(input: {
  frame: TileFrame
  blocking: Blocking
  colors: readonly number[]
  tau: number
  tile: number
}): Cone {
  const { frame, blocking, colors, tau, tile } = input
  const sequence = Array.from({ length: tau }, () => colors).flat()
  const target = blocking.cells(tile)
  const layers: Set<number>[] = [new Set(target)]

  for (let k = sequence.length - 1; k >= 0; k--) {
    const next = new Set(layers[0])

    for (const x of layers[0]!) {
      next.add(frame.partner(sequence[k]!, x))
    }

    layers.unshift(next)
  }

  // cells in the order met from the target outward (the last layers first)
  const order: number[] = []
  const seen = new Set<number>()

  for (let k = layers.length - 1; k >= 0; k--) {
    for (const x of layers[k]!) {
      if (!seen.has(x)) {
        seen.add(x)
        order.push(x)
      }
    }
  }

  const index = new Map(order.map((c, i) => [c, i]))
  const blockIndex = new Map<number, number>()
  const blocks: number[] = []
  const blockOf = new Int32Array(order.length)
  const position = new Int8Array(order.length)

  order.forEach((c, i) => {
    const key = blocking.key(c)

    let b = blockIndex.get(key)

    if (b === undefined) {
      b = blocks.length
      blockIndex.set(key, b)
      blocks.push(key)
    }

    blockOf[i] = b
    position[i] = blocking.cells(c)[0] === c ? 0 : 1
  })

  // step k may update only cells of layer k + 1 (they need their partner, which lies in layer k)
  const steps = sequence.map((color, k) => {
    const flat: number[] = []
    const done = new Set<number>()

    for (const x of layers[k + 1]!) {
      if (done.has(x)) {
        continue
      }

      const y = frame.partner(color, x)

      done.add(x)
      done.add(y)

      const [i, j] = frame.isFirst(color, x) ? [x, y] : [y, x]

      flat.push(index.get(i)!, index.get(j)!)
    }

    return Int32Array.from(flat)
  })

  return { target: [index.get(target[0]!)!, index.get(target[1]!)!], cells: order, blockOf, position, blocks, steps }
}

// the pattern code of an ordered block (a, b): (a + 1) * 3 + (b + 1), the pair index
export function patternCode(a: number, b: number): number {
  return (a + 1) * 3 + (b + 1)
}

// Concrete evaluation: the target's pattern code after tau rounds, the cone filled from the block letters.
export function evaluateCone(input: {
  cone: Cone
  table: PairTable
  sigma: readonly number[]
  letters: ArrayLike<number>
}): number {
  const { cone, table, sigma, letters } = input
  const tones = new Int8Array(cone.cells.length)

  for (let i = 0; i < tones.length; i++) {
    const code = sigma[letters[cone.blockOf[i]!]!]!

    tones[i] = cone.position[i] === 0 ? Math.floor(code / 3) - 1 : (code % 3) - 1
  }

  for (const step of cone.steps) {
    for (let k = 0; k < step.length; k += 2) {
      const i = step[k]!
      const j = step[k + 1]!
      const out = table[(tones[i]! + 1) * 3 + tones[j]! + 1]!

      tones[i] = Math.floor(out / 3) - 1
      tones[j] = (out % 3) - 1
    }
  }

  return patternCode(tones[cone.target[0]]!, tones[cone.target[1]]!)
}

// per pair of masks, the masks of the two outputs (bit t + 1 for tone t)
function maskTable(table: PairTable): { first: Uint8Array; second: Uint8Array } {
  const first = new Uint8Array(64)
  const second = new Uint8Array(64)

  for (let ma = 1; ma < 8; ma++) {
    for (let mb = 1; mb < 8; mb++) {
      let fa = 0
      let fb = 0

      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          if (ma & (1 << a) && mb & (1 << b)) {
            const image = table[a * 3 + b]!

            fa |= 1 << Math.floor(image / 3)
            fb |= 1 << image % 3
          }
        }
      }

      first[ma * 8 + mb] = fa
      second[ma * 8 + mb] = fb
    }
  }

  return { first, second }
}

export type ConeVerdict = { verdict: 'holds' | 'fails' | 'cap'; nodes: number; counterexample: number[] | null }

// Is the target's image pattern in allowed(letters) for every assignment? `allowed` returns a 9-bit mask of pattern
// codes given the partial assignment (letter -1 = not fixed yet); it must only shrink as letters are fixed, and for a
// full assignment it is the exact allowed set.
export function coneHolds(input: {
  cone: Cone
  table: PairTable
  sigma: readonly number[]
  allowed: (letters: Int8Array) => number
  budget: number
}): ConeVerdict {
  const { cone, table, sigma, allowed, budget } = input
  const masks = maskTable(table)
  const k = cone.blocks.length
  const a = sigma.length
  const letters = new Int8Array(k).fill(-1)
  const m = new Uint8Array(cone.cells.length)
  // per letter, the mask of each position; per position, the union over letters
  const posMask = [0, 1].map(pos => sigma.map(code => 1 << (pos === 0 ? Math.floor(code / 3) : code % 3)))
  const anyMask = posMask.map(list => list.reduce((s, x) => s | x, 0))
  const order = [cone.blockOf[cone.target[0]]!, ...Array.from({ length: k }, (_, i) => i)].filter(
    (b, i, all) => all.indexOf(b) === i,
  )

  let nodes = 0
  let counterexample: number[] | null = null

  // 1: holds on this branch, 0: undecided, -1: a concrete failure
  const probe = (full: boolean): number => {
    for (let i = 0; i < m.length; i++) {
      const letter = letters[cone.blockOf[i]!]!

      m[i] = letter < 0 ? anyMask[cone.position[i]!]! : posMask[cone.position[i]!]![letter]!
    }

    for (const step of cone.steps) {
      for (let s = 0; s < step.length; s += 2) {
        const i = step[s]!
        const j = step[s + 1]!
        const key = m[i]! * 8 + m[j]!

        m[i] = masks.first[key]!
        m[j] = masks.second[key]!
      }
    }

    const ok = allowed(letters)

    let possible = 0

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (m[cone.target[0]]! & (1 << x) && m[cone.target[1]]! & (1 << y)) {
          possible |= 1 << (x * 3 + y)
        }
      }
    }

    if ((possible & ~ok) === 0) {
      return 1
    }

    return full ? -1 : 0
  }

  const search = (depth: number): 'holds' | 'fails' | 'cap' => {
    nodes++

    if (nodes > budget) {
      return 'cap'
    }

    const r = probe(depth === order.length)

    if (r === 1) {
      return 'holds'
    }

    if (r === -1) {
      counterexample = Array.from(letters)

      return 'fails'
    }

    const b = order[depth]!

    let capped = false

    for (let t = 0; t < a; t++) {
      letters[b] = t

      const v = search(depth + 1)

      if (v === 'fails') {
        return 'fails'
      }

      capped ||= v === 'cap'
    }

    letters[b] = -1

    return capped ? 'cap' : 'holds'
  }

  const verdict = search(0)

  return { verdict, nodes, counterexample }
}

// the 9-bit mask of a section's patterns
export function sigmaMask(sigma: readonly number[]): number {
  return sigma.reduce((s, code) => s | (1 << code), 0)
}
