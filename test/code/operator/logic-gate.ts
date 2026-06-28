// Conformance for code/operator/logic-gate: Boolean logic built from the rule's own
// signed-majority NAND. Exact facts:
//   - nand/not/and/or/xor match their truth tables.
//   - the full adder matches binary addition for all 8 inputs.
//   - toffoli is a reversible bijection / involution and matches its table.
//   - functionFromTable reproduces an arbitrary 3-input table.
//   - elementaryRuleStep matches hand-computed Wolfram rules.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  nand,
  not,
  and,
  or,
  xor,
  bitToNum,
  fullAdder,
  toffoli,
  functionFromTable,
  elementaryRuleStep,
  Bit,
} from '@/code/operator/logic-gate'

const BITS: Bit[] = [-1, 1]

suite('operator/logic-gate: gate truth tables', [
  check('nand, not, and, or, xor match their tables', () => {
    // truth via numeric reference: true = +1, false = -1.
    for (const a of BITS) {
      for (const b of BITS) {
        const an = a === 1
        const bn = b === 1
        equal(nand(a, b), an && bn ? -1 : 1, `nand(${a},${b})`)
        equal(and(a, b), an && bn ? 1 : -1, `and(${a},${b})`)
        equal(or(a, b), an || bn ? 1 : -1, `or(${a},${b})`)
        equal(xor(a, b), an !== bn ? 1 : -1, `xor(${a},${b})`)
      }
      equal(not(a), a === 1 ? -1 : 1, `not(${a})`)
    }
  }),
])

suite('operator/logic-gate: full adder', [
  check('matches binary addition for all 8 inputs', () => {
    for (const a of BITS) {
      for (const b of BITS) {
        for (const cin of BITS) {
          const total = bitToNum(a) + bitToNum(b) + bitToNum(cin)
          const { sum, carry } = fullAdder(a, b, cin)
          equal(bitToNum(sum), total & 1, `sum bit of ${total}`)
          equal(bitToNum(carry), total >> 1, `carry bit of ${total}`)
        }
      }
    }
  }),
])

suite('operator/logic-gate: toffoli', [
  check('is a bijection on the 8 three-bit states and its own inverse', () => {
    const seen = new Set<number>()
    for (let s = 0; s < 8; s++) {
      const x = (s >> 2) & 1
      const y = (s >> 1) & 1
      const z = s & 1
      const [ox, oy, oz] = toffoli(x, y, z)
      seen.add((ox << 2) | (oy << 1) | oz)
      const [bx, by, bz] = toffoli(ox, oy, oz)
      equal((bx << 2) | (by << 1) | bz, s, `toffoli is an involution at ${s}`)
    }
    equal(seen.size, 8, 'toffoli permutes all 8 states')
  }),
  check('flips the third bit only when both controls are 1', () => {
    equal(toffoli(1, 1, 0).join(','), '1,1,1', 'controls high -> flip 0 to 1')
    equal(toffoli(1, 1, 1).join(','), '1,1,0', 'controls high -> flip 1 to 0')
    equal(toffoli(1, 0, 0).join(','), '1,0,0', 'one control low -> pass through')
  }),
])

suite('operator/logic-gate: arbitrary functions', [
  check('functionFromTable reproduces a 3-input table (majority)', () => {
    // majority of l,c,r: table[p] = 1 if at least two of the bits are 1.
    const table = Array.from({ length: 8 }, (_, p) => {
      const ones = ((p >> 2) & 1) + ((p >> 1) & 1) + (p & 1)
      return ones >= 2 ? 1 : 0
    })
    const f = functionFromTable(table)
    for (let p = 0; p < 8; p++) {
      const l: Bit = (p >> 2) & 1 ? 1 : -1
      const c: Bit = (p >> 1) & 1 ? 1 : -1
      const r: Bit = p & 1 ? 1 : -1
      equal(f(l, c, r) === 1 ? 1 : 0, table[p]!, `majority at p=${p}`)
    }
  }),
])

suite('operator/logic-gate: Wolfram elementary rules', [
  check('rule 90 is the XOR of the two neighbours', () => {
    const line = [0, 1, 0, 0, 1, 0, 0, 0]
    const next = elementaryRuleStep({ line, rule: 90 })
    const width = line.length
    for (let i = 0; i < width; i++) {
      const l = line[(i - 1 + width) % width]!
      const r = line[(i + 1) % width]!
      equal(next[i], l ^ r, `rule 90 at ${i}`)
    }
  }),
  check('rule 110 matches its bit-pattern lookup', () => {
    const line = [1, 1, 0, 1, 0, 0, 1, 1]
    const next = elementaryRuleStep({ line, rule: 110 })
    const width = line.length
    for (let i = 0; i < width; i++) {
      const l = line[(i - 1 + width) % width]!
      const c = line[i]!
      const r = line[(i + 1) % width]!
      equal(next[i], (110 >> ((l << 2) | (c << 1) | r)) & 1, `rule 110 at ${i}`)
    }
  }),
])
