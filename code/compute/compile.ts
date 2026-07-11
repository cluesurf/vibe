// One configurable entry point for the TypeScript -> railway compiler, choosing the register representation. The
// default is BINARY, the "modern standard CPU" model (bit-words, ripple-carry, O(word) per op). Pass
// backend: 'unary' for the classic Minsky counter machine (token piles, O(value) per op), which the token-wedge
// animation visualizes. The two backends live in their own modules (ts-to-binary.ts, ts-to-railway.ts); this is
// the thin selector over them.
//
// Future representations to explore are documented in
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md (a Fibonacci / Zeckendorf base native
// to the tiling's own growth, and BALANCED TERNARY, the natural register for a vibe-theory ternary-tone computer).

import {
  compileToRailway,
  type CompiledRailway,
} from '@/code/compute/ts-to-railway'
import {
  compileToBinary,
  type CompiledBinary,
} from '@/code/compute/ts-to-binary'
import { runRailway } from '@/code/compute/railway'
import { runBinary } from '@/code/compute/binary-machine'
import { runTernary } from '@/code/compute/ternary-machine'

// the register representation. `binary` is the modern-CPU default; `ternary` is the vibe-theory-aligned base-3
// machine (it reuses the binary program, since the compiled ops are representation-neutral, and only costs them
// in trits). `unary` is the classic Minsky counter machine.
export type Backend = 'binary' | 'unary' | 'ternary'

export type CompiledMachine =
  | ({ backend: 'unary' } & CompiledRailway)
  | ({ backend: 'binary' } & CompiledBinary)
  | ({ backend: 'ternary' } & CompiledBinary)

export function compileMachine(
  source: string,
  options: { backend?: Backend } = {},
): CompiledMachine {
  const backend = options.backend ?? 'binary'

  if (backend === 'unary')
    return { backend, ...compileToRailway(source) }

  // binary and ternary share the (representation-neutral) compiled program
  return { backend, ...compileToBinary(source) }
}

// run a compiled machine on natural-number inputs, returning the result and a cost (unary instruction steps,
// binary bit-operations, or ternary trit-operations), so the representations can be compared on one program.
export function runMachine(
  compiled: CompiledMachine,
  inputs: number[],
): { result: bigint; cost: number } {
  if (compiled.backend === 'unary') {
    const initial = new Array<number>(compiled.program.registers).fill(
      0,
    )

    inputs.forEach((v, i) => (initial[i] = v))

    const { registers, steps } = runRailway(compiled.program, initial)

    return {
      result: BigInt(registers[compiled.returnRegister]!),
      cost: steps,
    }
  }

  const initial = new Array<bigint>(compiled.program.registers).fill(0n)

  inputs.forEach((v, i) => (initial[i] = BigInt(v)))

  if (compiled.backend === 'ternary') {
    const { registers, totalTrits } = runTernary(
      compiled.program,
      initial,
    )

    return {
      result: registers[compiled.returnRegister]!,
      cost: totalTrits,
    }
  }

  const { registers, totalBits } = runBinary(compiled.program, initial)

  return {
    result: registers[compiled.returnRegister]!,
    cost: totalBits,
  }
}
