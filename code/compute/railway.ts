// Margenstern's RAILWAY model of universal computation (Vol II, Ch 4.2-4.4), the engine behind his weakly
// universal hyperbolic cellular automata. In hyperbolic space gliders fly apart and cannot be made to collide
// (so Conway's trick fails), so Margenstern computes with a single LOCOMOTIVE rolling forever along TRACKS
// through SWITCHES. The switch settings are the whole memory of the computation. A register machine (Minsky,
// universal with two counters) is wired from switches, and the locomotive running it computes anything.
//
// We implement the railway at the SWITCH-NETWORK level, which is exactly the computational content (the per-cell
// CA timing only stretches the track, it does not change the logic). The full 250-rule pentagrid CA and the
// 5-state dodecagrid CA are Ada-checked configuration tables in the book, here we implement the universal MODEL
// they realize, faithfully and verifiably. See land/text/papers/maurice-margenstern/notes/chapters/v2-ch4-universality-issues.md
// and note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

// the three switch kinds Margenstern uses, plus a plain crossing
export type SwitchKind = 'fix' | 'flip-flop' | 'memory' | 'crossing'

// a switch has a TRUNK port (0) and two BRANCH ports (1, 2). The locomotive entering the trunk leaves by the
// active branch; entering a branch leaves by the trunk. The kind decides how the active branch updates:
//   fix       the active branch never changes (a plain fork that always sends the train one way)
//   flip-flop the active branch flips after the train passes trunk -> branch (the active passage); one-way
//   memory    the active branch is set to whichever branch the train last entered FROM (it remembers)
export interface RailSwitch {
  kind: SwitchKind
  active: 1 | 2 // the currently active branch (for fix/flip-flop/memory)
}

// route the locomotive through a switch: given the port it entered by, return the port it leaves by, mutating
// the switch state per its kind. crossing is a 4-port straight-through (0<->2, 1<->3).
export function routeSwitch(sw: RailSwitch, entryPort: number): number {
  if (sw.kind === 'crossing') return (entryPort + 2) % 4
  if (entryPort === 0) {
    // trunk -> active branch
    const exit = sw.active
    if (sw.kind === 'flip-flop') sw.active = sw.active === 1 ? 2 : 1 // the active passage flips it
    return exit
  }
  // a branch -> trunk
  if (sw.kind === 'memory') sw.active = entryPort as 1 | 2 // remember which branch we came from
  return 0
}

// A unary REGISTER realized on rails as a chain of memory cells. The value is the number of leading set cells.
// The locomotive increments by setting the next free cell, decrements by clearing the last set cell, and the
// "already zero" case is detected when there is no set cell to clear (Margenstern's J-track return). This is
// the railway counter of 4.2.2, simulated cell by cell (the train physically walks the chain).
export interface RailRegister {
  cells: Uint8Array // 1 = set, 0 = free; the value is the count of leading 1s
}

export function makeRegister(capacity: number): RailRegister {
  return { cells: new Uint8Array(capacity) }
}

export function registerValue(reg: RailRegister): number {
  let v = 0
  while (v < reg.cells.length && reg.cells[v] === 1) v++
  return v
}

// the locomotive rolls in, over the set cells, and sets the first free cell (increment)
export function railIncrement(reg: RailRegister): void {
  let i = 0
  while (i < reg.cells.length && reg.cells[i] === 1) i++
  if (i < reg.cells.length) reg.cells[i] = 1
}

// the locomotive rolls in, over the set cells, and clears the last set cell (decrement). Returns true if it
// could decrement, false if the register was already zero (the train comes back by the special zero track).
export function railDecrementOrZero(reg: RailRegister): boolean {
  let i = 0
  while (i < reg.cells.length && reg.cells[i] === 1) i++
  if (i === 0) return false // already zero
  reg.cells[i - 1] = 0
  return true
}

// a Minsky register-machine instruction, the program the railway runs. inc adds one to a register and goes to
// `next`; dec subtracts one if possible (going to `next`) or, if the register is zero, jumps to `zero`.
export type RailInstruction =
  | { op: 'inc'; reg: number; next: number }
  | { op: 'dec'; reg: number; next: number; zero: number }
  | { op: 'halt' }

export interface RailProgram {
  registers: number // how many registers
  capacity: number // per-register cell capacity
  code: RailInstruction[]
}

// run the railway machine: a single locomotive flows from instruction to instruction, driving the register
// gadgets, until it reaches HALT. Returns the final register values and the number of instruction steps the
// locomotive took (its mileage). Deterministic, no randomness.
export function runRailway(program: RailProgram, initial: number[]): { registers: number[]; steps: number } {
  const regs = Array.from({ length: program.registers }, (_, r) => {
    const reg = makeRegister(program.capacity)
    for (let i = 0; i < (initial[r] ?? 0); i++) railIncrement(reg)
    return reg
  })
  let pc = 0
  let steps = 0
  const maxSteps = 50_000_000 // a safety bound so a non-halting program does not spin forever
  while (steps < maxSteps) {
    const ins = program.code[pc]
    if (!ins || ins.op === 'halt') break
    steps++
    if (ins.op === 'inc') {
      railIncrement(regs[ins.reg]!)
      pc = ins.next
    } else {
      const ok = railDecrementOrZero(regs[ins.reg]!)
      pc = ok ? ins.next : ins.zero
    }
  }
  return { registers: regs.map(registerValue), steps }
}
