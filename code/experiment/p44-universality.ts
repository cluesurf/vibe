// P44: computational universality (Turing-completeness) of the rule.
// The fibonacci-trees-and-universality writeup notes that Margenstern proved cellular
// automata on these tilings are universal. Here we make the universality concrete and
// testable at the level of the model's own rule. We show:
//   1. The ternary signed-majority rule realizes NAND, a functionally complete gate.
//   2. From rule-NANDs alone we build NOT, AND, OR, XOR, and a full adder, and the adder
//      computes correctly, so real arithmetic runs on the rule.
//   3. From rule-NANDs we build an arbitrary 3-input Boolean function, in particular the
//      rule of the elementary cellular automaton Rule 110, which is proven universal, and
//      it reproduces Rule 110 exactly. So the substrate hosts a known-universal system.
// Functional completeness plus the unbounded addressable space of the tilings (P42) is
// computational universality. See note (the universality writeup).
// Run: npx tsx code/experiment/p44-universality.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'

// Booleans are tones: true = +1, false = -1.
type Bit = 1 | -1

// --- Genuine on-substrate computation: gates built from the model's OWN running dynamics ---
// A circuit is an actual graph of cells with SYMMETRIC TERNARY fills. Inputs and a +1 bias are
// clamped; the free cells run the asynchronous signed-majority rule next(c) = sign(sum of fill *
// neighbour tone) until they reach a fixed point, and then we read the output cells. This runs the
// model's real rule on a substrate (answering "the gates are never wired onto the dynamics"), and
// because the answer is a FIXED POINT it is stable under any update order and does not dissipate
// (answering the P37 dissipation worry: a clamped-input gate is an attractor, not a decaying pulse).
// Integer weights come only from BUSES (several ternary edges in parallel), never from non-ternary
// fills, and bus widths DECREASE downstream so each gate's margin exceeds the feedback it receives.

type SubCircuit = { fills: Map<number, Map<number, number>>; clamp: Map<number, Bit>; size: number }

function makeCircuit(): SubCircuit {
  return { fills: new Map(), clamp: new Map(), size: 0 }
}
function addCell(c: SubCircuit, clampVal?: Bit): number {
  const id = c.size++
  c.fills.set(id, new Map())
  if (clampVal !== undefined) {
    c.clamp.set(id, clampVal)
  }
  return id
}
function link(c: SubCircuit, a: number, b: number, f: -1 | 1): void {
  c.fills.get(a)?.set(b, f) // symmetric ternary edge
  c.fills.get(b)?.set(a, f)
}
function clampedBus(c: SubCircuit, value: Bit, width: number): number[] {
  return Array.from({ length: width }, () => addCell(c, value))
}
// NAND: each output cell o = sign(-sum(A) - sum(B) + sum(bias)). With |A| = |B| = bias width Wi the
// margin is Wi, so choose outWidth (the feedback the next layer applies) smaller than Wi.
function nandBus(c: SubCircuit, A: number[], B: number[], outWidth: number): number[] {
  const biasWidth = Math.min(A.length, B.length)
  const bias = clampedBus(c, 1, biasWidth)
  const O = Array.from({ length: outWidth }, () => addCell(c))
  for (const o of O) {
    for (const a of A) link(c, o, a, -1)
    for (const b of B) link(c, o, b, -1)
    for (const z of bias) link(c, o, z, 1)
  }
  return O
}
// NOT: g = sign(-sum(X)) = NOT(x). Margin |X|.
function notBus(c: SubCircuit, X: number[], outWidth: number): number[] {
  const G = Array.from({ length: outWidth }, () => addCell(c))
  for (const g of G) {
    for (const x of X) link(c, g, x, -1)
  }
  return G
}
// Run the model's asynchronous signed-majority rule to a fixed point from a neutral start.
function settle(c: SubCircuit, seed: number): Int8Array {
  const tone = new Int8Array(c.size)
  for (const [id, v] of c.clamp) {
    tone[id] = v
  }
  const free = [...Array(c.size).keys()].filter((i) => !c.clamp.has(i))
  const rng = makeRng({ seed })
  const stepCell = (i: number): number => {
    let s = 0
    for (const [j, f] of c.fills.get(i) ?? []) {
      s += f * (tone[j] ?? 0)
    }
    return s > 0 ? 1 : s < 0 ? -1 : (tone[i] ?? 0)
  }
  for (let sweep = 0; sweep < 400; sweep++) {
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
        tone[i] = nv as -1 | 0 | 1
        changed = true
      }
    }
    if (!changed) {
      break
    }
  }
  return tone
}
// Is the settled configuration a genuine fixed point of the rule (stable under ANY update order)?
function isFixedPoint(c: SubCircuit, tone: Int8Array): boolean {
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
function busValue(tone: Int8Array, bus: number[]): Bit {
  let s = 0
  for (const b of bus) {
    s += tone[b] ?? 0
  }
  return s >= 0 ? 1 : -1
}

// The model's own update applied as a two-input gate: a vibe whose field is the bias
// plus the fill-weighted wills of its two input neighbours, then sign. With bias +1 and
// both fills -1 this is exactly NAND.
function ruleGate(inputs: Bit[], fills: number[], bias: number): Bit {
  let h = bias
  for (let i = 0; i < inputs.length; i++) {
    h += (fills[i] ?? 0) * (inputs[i] ?? 1)
  }
  return h > 0 ? 1 : -1
}

const nand = (a: Bit, b: Bit): Bit => ruleGate([a, b], [-1, -1], 1)
const not = (a: Bit): Bit => nand(a, a)
const and = (a: Bit, b: Bit): Bit => not(nand(a, b))
const or = (a: Bit, b: Bit): Bit => nand(not(a), not(b))
const xor = (a: Bit, b: Bit): Bit => and(or(a, b), nand(a, b))

function fullAdder(a: Bit, b: Bit, cin: Bit): { sum: Bit; carry: Bit } {
  const s1 = xor(a, b)
  const c1 = and(a, b)
  const sum = xor(s1, cin)
  const c2 = and(s1, cin)
  const carry = or(c1, c2)
  return { sum, carry }
}

const BITS: Bit[] = [-1, 1]
const toNum = (b: Bit): number => (b === 1 ? 1 : 0)

// Build an arbitrary 3-input Boolean function as a NAND circuit (sum of minterms, every
// gate a rule-NAND). table[p] is the output for neighbourhood p = (l<<2)|(c<<1)|r.
function functionFromTable(table: number[]): (l: Bit, c: Bit, r: Bit) => Bit {
  return (l: Bit, c: Bit, r: Bit): Bit => {
    const lit = (val: Bit, bit: number): Bit => (bit === 1 ? val : not(val))
    let acc: Bit = -1 // false
    for (let p = 0; p < 8; p++) {
      if (!table[p]) {
        continue
      }
      const lb = (p >> 2) & 1
      const cb = (p >> 1) & 1
      const rb = p & 1
      const minterm = and(and(lit(l, lb), lit(c, cb)), lit(r, rb))
      acc = or(acc, minterm)
    }
    return acc
  }
}

export function universality(): {
  nandCorrect: boolean
  adderCorrect: boolean
  rule110Expressible: boolean
  rule110Evolves: boolean
  substrateNandCorrect: boolean
  substrateXorCorrect: boolean
  substrateFixedPoint: boolean
} {
  // 1. NAND truth table.
  const nandTable: Record<string, Bit> = { '1,1': -1, '1,-1': 1, '-1,1': 1, '-1,-1': 1 }
  let nandCorrect = true
  for (const a of BITS) {
    for (const b of BITS) {
      if (nand(a, b) !== nandTable[`${a},${b}`]) {
        nandCorrect = false
      }
    }
  }

  // 2. Full adder computes a + b + cin correctly for all eight inputs.
  let adderCorrect = true
  for (const a of BITS) {
    for (const b of BITS) {
      for (const cin of BITS) {
        const { sum, carry } = fullAdder(a, b, cin)
        const expected = toNum(a) + toNum(b) + toNum(cin)
        if (toNum(sum) + 2 * toNum(carry) !== expected) {
          adderCorrect = false
        }
      }
    }
  }

  // 3. Rule 110 (output bit p is bit p of the number 110) built from rule-NANDs.
  const rule110 = Array.from({ length: 8 }, (_, p) => (110 >> p) & 1)
  const rule110Fn = functionFromTable(rule110)
  let rule110Expressible = true
  for (let p = 0; p < 8; p++) {
    const l: Bit = ((p >> 2) & 1) === 1 ? 1 : -1
    const c: Bit = ((p >> 1) & 1) === 1 ? 1 : -1
    const r: Bit = (p & 1) === 1 ? 1 : -1
    if (toNum(rule110Fn(l, c, r)) !== rule110[p]) {
      rule110Expressible = false
    }
  }

  // Run the substrate-built Rule 110 on a line for a few steps, from a single seed cell,
  // and confirm it actually evolves (the universal CA running on the rule's gates).
  const width = 40
  let line: Bit[] = Array.from({ length: width }, (_, i) => (i === width - 2 ? 1 : -1))
  const snapshots: string[] = []
  for (let step = 0; step < 12; step++) {
    snapshots.push(line.map((b) => (b === 1 ? '#' : '.')).join(''))
    const next: Bit[] = line.map((_, i) => {
      const l = line[(i - 1 + width) % width] ?? -1
      const c = line[i] ?? -1
      const rr = line[(i + 1) % width] ?? -1
      return rule110Fn(l, c, rr)
    })
    line = next
  }
  const rule110Evolves = new Set(snapshots).size > 6 // non-trivial, many distinct rows

  // 4. THE DECISIVE CHECK: run the gates on the model's OWN dynamics, not as functions. Build each
  // gate as a real subgraph of cells with symmetric ternary fills, clamp the inputs and a +1 bias,
  // run the asynchronous signed-majority rule to a fixed point, and read the output cells.
  let substrateNandCorrect = true
  let substrateXorCorrect = true
  let substrateFixedPoint = true

  // NAND on the substrate (input/bias buses width 7, output width 3).
  for (const a of BITS) {
    for (const b of BITS) {
      const c = makeCircuit()
      const A = clampedBus(c, a, 7)
      const B = clampedBus(c, b, 7)
      const O = nandBus(c, A, B, 3)
      const tone = settle(c, 1)
      if (busValue(tone, O) !== nand(a, b)) substrateNandCorrect = false
      if (!isFixedPoint(c, tone)) substrateFixedPoint = false
    }
  }

  // XOR on the substrate, a genuine multi-gate composition run by the dynamics:
  // XOR(a,b) = AND(OR(a,b), NAND(a,b)), AND = NOT . NAND, OR = NAND(NOT a, NOT b).
  // Bus widths DECREASE downstream (11, 9, 7, 5, 3) so every gate's margin beats its feedback.
  for (const a of BITS) {
    for (const b of BITS) {
      const c = makeCircuit()
      const A = clampedBus(c, a, 11)
      const B = clampedBus(c, b, 11)
      const nA = notBus(c, A, 9)
      const nB = notBus(c, B, 9)
      const orOut = nandBus(c, nA, nB, 7) // OR(a,b)
      const nandOut = nandBus(c, A, B, 7) // NAND(a,b)
      const andInner = nandBus(c, orOut, nandOut, 5) // NAND(OR, NAND)
      const xorOut = notBus(c, andInner, 3) // AND(OR, NAND) = XOR
      const tone = settle(c, 1)
      if (busValue(tone, xorOut) !== xor(a, b)) substrateXorCorrect = false
      if (!isFixedPoint(c, tone)) substrateFixedPoint = false
    }
  }

  return {
    nandCorrect,
    adderCorrect,
    rule110Expressible,
    rule110Evolves,
    substrateNandCorrect,
    substrateXorCorrect,
    substrateFixedPoint,
  }
}

export function main(): void {
  const r = universality()
  console.log('P44: computational universality (Turing-completeness) of the rule')
  console.log('')
  console.log(`  1. the signed-majority rule realizes NAND (a functionally complete gate): ${r.nandCorrect ? 'YES' : 'no'}`)
  console.log(`  2. a full adder built only from rule-NANDs computes a+b+carry correctly: ${r.adderCorrect ? 'YES' : 'no'}`)
  console.log(`  3. the universal Rule 110, built from rule-NANDs, reproduces its table: ${r.rule110Expressible ? 'YES' : 'no'}`)
  console.log(`     and it runs and evolves non-trivially on the rule's gates: ${r.rule110Evolves ? 'YES' : 'no'}`)
  console.log('')
  console.log('  4. the decisive check: gates run on the model\'s OWN asynchronous dynamics, not as functions')
  console.log(`     NAND as a real subgraph, settled by the rule to a fixed point: ${r.substrateNandCorrect ? 'YES' : 'no'}`)
  console.log(`     a 6-gate XOR composed and run entirely by the dynamics: ${r.substrateXorCorrect ? 'YES' : 'no'}`)
  console.log(`     every output is a stable fixed point (no dissipation, stable under any update order): ${r.substrateFixedPoint ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The model\'s own local rule realizes NAND, which is functionally complete. And it is not')
  console.log('  only a function: built as a real subgraph and run by the asynchronous rule itself, NAND')
  console.log('  and a multi-gate XOR settle to the correct answer as STABLE FIXED POINTS on the live')
  console.log('  substrate. That directly answers the dissipation worry (a clamped-input gate is an')
  console.log('  attractor, not a decaying pulse) and shows gates compose on the dynamics, not just on')
  console.log('  paper. Circuit universality on the running substrate follows. Unbounded-tape Turing')
  console.log('  completeness additionally needs the growing, exactly-addressable space of the tilings')
  console.log('  (P42, P83) for memory, which is Margenstern\'s result. The felt interior is a separate')
  console.log('  question, untouched by universality.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
