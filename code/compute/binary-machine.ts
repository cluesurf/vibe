// A BINARY register machine, the efficient register representation a modern computer actually uses, realized on
// the railway. A register is a word of bits (flip-flop switches), not a unary pile of tokens, so arithmetic is
// bit-parallel ripple work, not token-by-token shuffling. Cost is the ripple length: O(word) per operation, a
// fixed 64 for values that fit a machine word (so each operation is constant, like a CPU), and O(number of bits)
// = O(log value) once a value outgrows the word into bignum territory. This is the same complexity profile as a
// real machine: 64-bit ops are constant, bigints scale with their bit length.
//
// This is the binary counterpart of the unary railway (code/compute/railway.ts). Margenstern's strongly universal
// dodecagrid automaton stores registers exactly this way, as binary flip-flop chains with carry ripple, which is
// why it is far more efficient than a unary counter. The compiler targets this IR via code/compute/ts-to-binary.

export const WORD_BITS = 64 // the machine word; values within it cost a constant 64-bit ripple, like a CPU

export type BinaryOp =
  | { op: 'set'; reg: number; value: number; next: number } // load a constant
  | { op: 'copy'; dst: number; src: number; next: number } // dst := src
  | { op: 'add'; dst: number; src: number; next: number } // dst := dst + src (ripple-carry adder)
  | { op: 'sub1'; reg: number; next: number } // reg := reg - 1 (borrow ripple; saturates at 0)
  | { op: 'jz'; reg: number; zero: number; next: number } // if reg == 0 goto zero, else next (non-destructive)
  | { op: 'halt' }

export type BinaryProgram = {
  registers: number
  code: BinaryOp[]
}

export type BinaryStep = {
  kind: 'set' | 'copy' | 'add' | 'sub1' | 'jz'
  reg: number // the register written (or tested, for jz)
  registers: bigint[] // every register's value AFTER the operation
  bits: number // the bit-operations this op cost (the ripple length / word width)
  width: number // the word width in play (WORD_BITS, or larger once a value goes bignum)
}

// the number of bits in a non-negative bigint (at least 1)
function bitLength(x: bigint): number {
  if (x <= 0n) return 1
  return x.toString(2).length
}

// the word width an operation ripples over: a constant machine word, widened only when a value needs more bits
function wordWidth(...values: bigint[]): number {
  let bits = WORD_BITS
  for (const v of values) bits = Math.max(bits, bitLength(v))
  return bits
}

// run a binary-register program. Deterministic. `onStep` receives one snapshot per high-level operation, with
// the real register values and the bit-cost, for tracing / animation.
export function runBinary(
  program: BinaryProgram,
  initial: bigint[],
  onStep?: (step: BinaryStep) => void,
): { registers: bigint[]; totalBits: number; ops: number } {
  const regs = Array.from({ length: program.registers }, (_, r) => initial[r] ?? 0n)
  let pc = 0
  let totalBits = 0
  let ops = 0
  const maxOps = 50_000_000
  while (ops < maxOps) {
    const ins = program.code[pc]
    if (!ins || ins.op === 'halt') break
    ops++
    let bits = WORD_BITS
    let reg = 0
    let kind: BinaryStep['kind'] = 'jz'
    if (ins.op === 'set') {
      const value = BigInt(ins.value)
      regs[ins.reg] = value
      bits = wordWidth(value)
      reg = ins.reg; kind = 'set'; pc = ins.next
    } else if (ins.op === 'copy') {
      bits = wordWidth(regs[ins.src]!)
      regs[ins.dst] = regs[ins.src]!
      reg = ins.dst; kind = 'copy'; pc = ins.next
    } else if (ins.op === 'add') {
      const before = regs[ins.dst]!
      regs[ins.dst] = before + regs[ins.src]!
      bits = wordWidth(before, regs[ins.src]!, regs[ins.dst]!) // the ripple spans the longest operand / sum
      reg = ins.dst; kind = 'add'; pc = ins.next
    } else if (ins.op === 'sub1') {
      const before = regs[ins.reg]!
      regs[ins.reg] = before > 0n ? before - 1n : 0n
      bits = wordWidth(before) // borrow can ripple the whole word in the worst case
      reg = ins.reg; kind = 'sub1'; pc = ins.next
    } else {
      // jz: reading the register to test zero scans its word
      bits = wordWidth(regs[ins.reg]!)
      reg = ins.reg; kind = 'jz'
      pc = regs[ins.reg] === 0n ? ins.zero : ins.next
    }
    totalBits += bits
    if (onStep) onStep({ kind, reg, registers: regs.slice(), bits, width: bits })
  }
  return { registers: regs, totalBits, ops }
}
