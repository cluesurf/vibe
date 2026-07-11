// Logic gates built on the model's OWN running dynamics, not as pure functions. A
// circuit is a real graph of cells with symmetric ternary fills. Inputs and a +1
// bias are clamped; the free cells run the asynchronous signed-majority rule
// next(c) = sign(sum of fill * neighbour tone) until they reach a fixed point, and
// then we read the output cells. Because the answer is a FIXED POINT it is stable
// under any update order and does not dissipate (a clamped-input gate is an
// attractor, not a decaying pulse). Integer weights come only from BUSES (several
// ternary edges in parallel), never from non-ternary fills, and bus widths DECREASE
// downstream so each gate's margin exceeds the feedback it receives.

import { makeRng } from '@/code/tool/rng'
import type { Bit } from '@/code/operator/logic-gate'

export type SubstrateCircuit = {
  fills: Map<number, Map<number, number>>
  clamp: Map<number, Bit>
  size: number
}

export function makeCircuit(): SubstrateCircuit {
  return { fills: new Map(), clamp: new Map(), size: 0 }
}

export function addCell(c: SubstrateCircuit, clampValue?: Bit): number {
  const id = c.size++

  c.fills.set(id, new Map())

  if (clampValue !== undefined) {
    c.clamp.set(id, clampValue)
  }

  return id
}

// Symmetric ternary edge.
export function link(
  c: SubstrateCircuit,
  a: number,
  b: number,
  f: -1 | 1,
): void {
  c.fills.get(a)?.set(b, f)
  c.fills.get(b)?.set(a, f)
}

export function clampedBus(
  c: SubstrateCircuit,
  value: Bit,
  width: number,
): number[] {
  return Array.from({ length: width }, () => addCell(c, value))
}

// NAND: each output cell o = sign(-sum(A) - sum(B) + sum(bias)). With |A| = |B| = bias
// width Wi the margin is Wi, so choose outWidth (the feedback the next layer applies)
// smaller than Wi.
export function nandBus(
  c: SubstrateCircuit,
  A: number[],
  B: number[],
  outWidth: number,
): number[] {
  const biasWidth = Math.min(A.length, B.length)
  const bias = clampedBus(c, 1, biasWidth)
  const O = Array.from({ length: outWidth }, () => addCell(c))

  for (const o of O) {
    for (const a of A) {
      link(c, o, a, -1)
    }

    for (const b of B) {
      link(c, o, b, -1)
    }

    for (const z of bias) {
      link(c, o, z, 1)
    }
  }

  return O
}

// NOT: g = sign(-sum(X)) = NOT(x). Margin |X|.
export function notBus(
  c: SubstrateCircuit,
  X: number[],
  outWidth: number,
): number[] {
  const G = Array.from({ length: outWidth }, () => addCell(c))

  for (const g of G) {
    for (const x of X) {
      link(c, g, x, -1)
    }
  }

  return G
}

// Run the model's asynchronous signed-majority rule to a fixed point from a neutral
// start. sweeps caps the number of randomized async passes.
export function settle(
  c: SubstrateCircuit,
  input: { seed: number; sweeps?: number },
): Int8Array {
  const sweeps = input.sweeps ?? 400
  const tone = new Int8Array(c.size)

  for (const [id, v] of c.clamp) {
    tone[id] = v
  }

  const free = [...Array(c.size).keys()].filter(i => !c.clamp.has(i))
  const rng = makeRng({ seed: input.seed })

  const stepCell = (i: number): number => {
    let s = 0

    for (const [j, f] of c.fills.get(i) ?? []) {
      s += f * (tone[j] ?? 0)
    }

    return s > 0 ? 1 : s < 0 ? -1 : (tone[i] ?? 0)
  }

  for (let sweep = 0; sweep < sweeps; sweep++) {
    for (let i = free.length - 1; i > 0; i--) {
      const k = rng.nextInt({ max: i + 1 })
      const t = free[i] ?? 0

      free[i] = free[k] ?? 0
      free[k] = t
    }

    let changed = false

    for (const i of free) {
      const nv = stepCell(i)

      if (nv !== tone[i]) {
        tone[i] = nv
        changed = true
      }
    }

    if (!changed) {
      break
    }
  }

  return tone
}

// Is the settled configuration a genuine fixed point of the rule (stable under ANY
// update order)?
export function isFixedPoint(
  c: SubstrateCircuit,
  tone: Int8Array,
): boolean {
  for (let i = 0; i < c.size; i++) {
    if (c.clamp.has(i)) {
      continue
    }

    let s = 0

    for (const [j, f] of c.fills.get(i) ?? []) {
      s += f * (tone[j] ?? 0)
    }

    const nv = s > 0 ? 1 : s < 0 ? -1 : tone[i]

    if (nv !== tone[i]) {
      return false
    }
  }

  return true
}

export function busValue(tone: Int8Array, bus: number[]): Bit {
  let s = 0

  for (const b of bus) {
    s += tone[b] ?? 0
  }

  return s >= 0 ? 1 : -1
}
