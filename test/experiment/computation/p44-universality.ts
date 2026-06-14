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

import {
  and,
  type Bit,
  bitToNum as toNum,
  fullAdder,
  functionFromTable,
  nand,
  not,
  or,
  xor,
} from '@/code/operator/logic-gate'
import {
  busValue,
  clampedBus,
  isFixedPoint,
  makeCircuit,
  nandBus,
  notBus,
  settle,
} from '@/code/operator/substrate-gate'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The on-substrate gate construction (gates as cell subgraphs run by the model's own
// asynchronous signed-majority rule to a fixed point) lives in
// code/operator/substrate-gate. Integer weights come only from BUSES of parallel
// ternary edges, never non-ternary fills, and bus widths DECREASE downstream so each
// gate's margin exceeds the feedback it receives.

// The gate algebra (rule-NAND and its derived gates, a full adder, and arbitrary
// 3-input functions) lives in code/operator/logic-gate. Boolean values are tones:
// true = +1, false = -1.
const BITS: Bit[] = [-1, 1]

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
      const tone = settle(c, { seed: 1 })
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
      const tone = settle(c, { seed: 1 })
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

export default experiment({
  id: 'computation/universality',
  title: 'the rule is functionally complete and runs gates on the live dynamics',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = universality()
    const ok =
      r.nandCorrect &&
      r.adderCorrect &&
      r.rule110Expressible &&
      r.rule110Evolves &&
      r.substrateNandCorrect &&
      r.substrateXorCorrect &&
      r.substrateFixedPoint
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the rule realizes NAND, a full adder, and Rule 110, and runs NAND and a 6-gate XOR on the live dynamics as fixed points',
      metrics: {
        nandCorrect: r.nandCorrect ? 1 : 0,
        adderCorrect: r.adderCorrect ? 1 : 0,
        rule110Expressible: r.rule110Expressible ? 1 : 0,
        substrateNandCorrect: r.substrateNandCorrect ? 1 : 0,
        substrateXorCorrect: r.substrateXorCorrect ? 1 : 0,
        substrateFixedPoint: r.substrateFixedPoint ? 1 : 0,
      },
    })
  },
})
