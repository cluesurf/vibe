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

// Booleans are tones: true = +1, false = -1.
type Bit = 1 | -1

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

  return { nandCorrect, adderCorrect, rule110Expressible, rule110Evolves }
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
  console.log('  The model\'s own local rule realizes NAND, which is functionally complete, so it')
  console.log('  computes any Boolean function and any circuit, including working arithmetic and the')
  console.log('  elementary cellular automaton Rule 110, which is proven to be Turing-complete. With')
  console.log('  the unbounded, exactly-addressable space of the hyperbolic tilings (P42) for memory,')
  console.log('  that is full computational universality, Margenstern\'s result realized on the model.')
  console.log('  This grounds the claim that one substrate can host any computable structure, the')
  console.log('  lawful sector of the framework. The felt interior is a separate question, untouched')
  console.log('  by universality.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
