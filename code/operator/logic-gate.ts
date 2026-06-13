// Boolean logic built from the model's OWN signed-majority rule. A bit is a tone:
// true = +1, false = -1. The rule applied as a 2-input gate is field = bias +
// sum(fill_i * input_i), then sign. With bias +1 and two -1 fills this is exactly
// NAND, which is functionally complete, so every Boolean gate, a full adder, and
// any 3-input Boolean function (e.g. the universal Rule 110) follow from rule-NANDs
// alone. This is the gate algebra both universality experiments share.

export type Bit = 1 | -1

// The model's update as a gate: field = bias + sum(fill_i * input_i), then sign.
export function ruleGate(inputs: Bit[], fills: number[], bias: number): Bit {
  let h = bias
  for (let i = 0; i < inputs.length; i++) {
    h += (fills[i] ?? 0) * (inputs[i] ?? 1)
  }
  return h > 0 ? 1 : -1
}

export const nand = (a: Bit, b: Bit): Bit => ruleGate([a, b], [-1, -1], 1)
export const not = (a: Bit): Bit => nand(a, a)
export const and = (a: Bit, b: Bit): Bit => not(nand(a, b))
export const or = (a: Bit, b: Bit): Bit => nand(not(a), not(b))
export const xor = (a: Bit, b: Bit): Bit => and(or(a, b), nand(a, b))

// 0/1 number from a bit, for arithmetic checks.
export const bitToNum = (b: Bit): number => (b === 1 ? 1 : 0)

// One-bit full adder built from rule-NANDs.
export function fullAdder(a: Bit, b: Bit, cin: Bit): { sum: Bit; carry: Bit } {
  const s1 = xor(a, b)
  const c1 = and(a, b)
  const sum = xor(s1, cin)
  const c2 = and(s1, cin)
  const carry = or(c1, c2)
  return { sum, carry }
}

// Build any 3-input Boolean function as a NAND tree (sum of minterms), every gate
// a rule-NAND. table[p] is the output bit for the neighbourhood p = (l<<2)|(c<<1)|r.
export function functionFromTable(table: number[]): (l: Bit, c: Bit, r: Bit) => Bit {
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
