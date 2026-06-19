// A TERNARY register machine, base-3 words. The natural register for a vibe-theory computer, whose base model is
// ternary tone (-1 / 0 / +1), so a ternary computation and the physics share one substrate. The compiled program
// (set / copy / add / sub1 / jz from binary-machine.ts) is representation-NEUTRAL, it acts on integer register
// values; only the COST differs by base. So a ternary machine reuses the same program and just costs each
// operation in trits (base-3 digits) rather than bits.
//
// Balanced ternary (digits -1, 0, +1) is the form most aligned with vibe theory and has the cleanest negatives;
// since fib is non-negative the cost here counts standard base-3 digits, which is the same digit count. A literal
// ternary railway CA would store each trit as a three-state switch (the model already has three switch kinds);
// that and the {7,3} layout for it are documented in
// note/research/vibe/notes/theory-v0.8.0/notes/register-representations.md.

import type { BinaryProgram } from '@/code/compute/binary-machine'

export const TERNARY_TRITS = 40 // a ternary word: 3^40 ~ 1.2e19, about the range of a 64-bit binary word

export type TernaryStep = {
  kind: 'set' | 'copy' | 'add' | 'sub1' | 'jz'
  reg: number
  registers: bigint[]
  trits: number // the trit-operations this op cost (the base-3 ripple length / word width)
  width: number
}

function tritLength(x: bigint): number {
  if (x <= 0n) {
    return 1
  }
  return x.toString(3).length
}

function tritWidth(...values: bigint[]): number {
  let trits = TERNARY_TRITS
  for (const v of values) {
    trits = Math.max(trits, tritLength(v))
  }
  return trits
}

// run a program with a base-3 cost model. Same semantics as runBinary, different digit base, so a program runs
// identically and only its reported cost changes (trit-ripples instead of bit-ripples).
export function runTernary(
  program: BinaryProgram,
  initial: bigint[],
  onStep?: (step: TernaryStep) => void,
): { registers: bigint[]; totalTrits: number; ops: number } {
  const regs = Array.from(
    { length: program.registers },
    (_, r) => initial[r] ?? 0n,
  )
  let pc = 0
  let totalTrits = 0
  let ops = 0
  const maxOps = 50_000_000
  while (ops < maxOps) {
    const ins = program.code[pc]
    if (!ins || ins.op === 'halt') {
      break
    }
    ops++
    let trits = TERNARY_TRITS
    let reg = 0
    let kind: TernaryStep['kind'] = 'jz'
    if (ins.op === 'set') {
      const value = BigInt(ins.value)
      regs[ins.reg] = value
      trits = tritWidth(value)
      reg = ins.reg
      kind = 'set'
      pc = ins.next
    } else if (ins.op === 'copy') {
      trits = tritWidth(regs[ins.src]!)
      regs[ins.dst] = regs[ins.src]!
      reg = ins.dst
      kind = 'copy'
      pc = ins.next
    } else if (ins.op === 'add') {
      const before = regs[ins.dst]!
      regs[ins.dst] = before + regs[ins.src]!
      trits = tritWidth(before, regs[ins.src]!, regs[ins.dst]!)
      reg = ins.dst
      kind = 'add'
      pc = ins.next
    } else if (ins.op === 'sub1') {
      const before = regs[ins.reg]!
      regs[ins.reg] = before > 0n ? before - 1n : 0n
      trits = tritWidth(before)
      reg = ins.reg
      kind = 'sub1'
      pc = ins.next
    } else {
      trits = tritWidth(regs[ins.reg]!)
      reg = ins.reg
      kind = 'jz'
      pc = regs[ins.reg] === 0n ? ins.zero : ins.next
    }
    totalTrits += trits
    if (onStep) {
      onStep({
        kind,
        reg,
        registers: regs.slice(),
        trits,
        width: trits,
      })
    }
  }
  return { registers: regs, totalTrits, ops }
}
