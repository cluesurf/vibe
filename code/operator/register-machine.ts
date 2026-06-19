// A Minsky counter machine running on the model's ternary charge. Registers are
// regions of cells whose value is the count of +1 charges they hold; a ground
// region holds the balancing -1 charges so the total tone stays exactly conserved.
// The three primitives are the substrate's own moves: INC = the arrow creates a
// balanced +1/-1 pair (a +1 in the register, a -1 in the ground), DEC = a +1 meets
// a -1 and both return to peace, test-zero = perception (count the +1 charges). A
// register machine with INC, DECJZ (decrement or jump if zero), JMP, and HALT is
// Turing-complete (Minsky), so this is a programmable universal computer on the
// charge dynamics. The caller carves the register and ground cell sets from its own
// substrate (a dodecagrid, an addressed {3,4,3,4} tree, etc.); this runs the
// conserving machine over them.

export type Instr =
  | { op: 'inc'; r: number }
  | { op: 'decjz'; r: number; addr: number }
  | { op: 'jmp'; addr: number }
  | { op: 'halt' }

// A charge register machine over a shared tone buffer with caller-supplied register
// and ground cell sets.
export class RegisterMachine {
  tone: Int8Array
  regions: number[][]
  ground: number[]
  charge0: number

  constructor(input: {
    tone: Int8Array
    regions: number[][]
    ground: number[]
  }) {
    this.tone = input.tone
    this.regions = input.regions
    this.ground = input.ground
    this.charge0 = this.charge()
  }

  charge(): number {
    let s = 0
    for (let i = 0; i < this.tone.length; i++) {
      s += this.tone[i]!
    }
    return s
  }

  read(r: number): number {
    let c = 0
    for (const i of this.regions[r]!) {
      if (this.tone[i] === 1) {
        c++
      }
    }
    return c
  }

  set(r: number, value: number): void {
    for (const i of this.regions[r]!) {
      this.tone[i] = 0
    }
    for (let k = 0; k < value; k++) {
      this.inc(r)
    }
  }

  // INC, the arrow creates a balanced pair, +1 into register r, -1 into the ground.
  inc(r: number): void {
    let placedPlus = false
    for (const i of this.regions[r]!) {
      if (this.tone[i] === 0) {
        this.tone[i] = 1
        placedPlus = true
        break
      }
    }
    if (!placedPlus) {
      throw new Error('register overflow')
    }
    for (const i of this.ground) {
      if (this.tone[i] === 0) {
        this.tone[i] = -1
        return
      }
    }
    throw new Error('ground overflow')
  }

  // DEC, annihilation, a +1 in r meets a -1 in the ground, both return to peace.
  dec(r: number): void {
    for (const i of this.regions[r]!) {
      if (this.tone[i] === 1) {
        this.tone[i] = 0
        break
      }
    }
    for (const i of this.ground) {
      if (this.tone[i] === -1) {
        this.tone[i] = 0
        return
      }
    }
  }

  // Run a stored program, reporting how many steps ran and whether the total charge
  // stayed exactly conserved the whole time.
  run(
    program: Instr[],
    maxSteps = 2_000_000,
  ): { steps: number; conserved: boolean } {
    let pc = 0
    let steps = 0
    let conserved = true
    while (pc < program.length && steps < maxSteps) {
      const instr = program[pc]!
      steps++
      if (instr.op === 'halt') {
        break
      } else if (instr.op === 'inc') {
        this.inc(instr.r)
        pc++
      } else if (instr.op === 'decjz') {
        if (this.read(instr.r) === 0) {
          pc = instr.addr
        } else {
          this.dec(instr.r)
          pc++
        }
      } else if (instr.op === 'jmp') {
        pc = instr.addr
      }
      if (this.charge() !== this.charge0) {
        conserved = false
      }
    }
    return { steps, conserved }
  }
}

// Canonical Minsky programs over registers R0..R3. ADD leaves R0 = R0 + R1 (R1
// drained). MUL leaves R2 = R0 * R1, using R3 as a scratch counter (R0 drained, R1
// restored). The standard two-counter constructions used to demonstrate that the
// charge machine is Turing-complete.
export function minskyAddProgram(input?: {
  r0?: number
  r1?: number
}): Instr[] {
  const r0 = input?.r0 ?? 0
  const r1 = input?.r1 ?? 1
  return [
    { op: 'decjz', r: r1, addr: 3 },
    { op: 'inc', r: r0 },
    { op: 'jmp', addr: 0 },
    { op: 'halt' },
  ]
}

export function minskyMultiplyProgram(input?: {
  r0?: number
  r1?: number
  r2?: number
  r3?: number
}): Instr[] {
  const r0 = input?.r0 ?? 0
  const r1 = input?.r1 ?? 1
  const r2 = input?.r2 ?? 2
  const r3 = input?.r3 ?? 3
  return [
    { op: 'decjz', r: r0, addr: 8 },
    { op: 'decjz', r: r1, addr: 5 },
    { op: 'inc', r: r2 },
    { op: 'inc', r: r3 },
    { op: 'jmp', addr: 1 },
    { op: 'decjz', r: r3, addr: 0 },
    { op: 'inc', r: r1 },
    { op: 'jmp', addr: 5 },
    { op: 'halt' },
  ]
}

// Carve `numRegisters` register-regions of `perRegister` cells each from a sorted
// list of usable cells, with the remainder as the ground region. The shared layout
// the charge machine uses (the order of `cells` is the caller's choice, e.g. cell
// index or address order).
export function carveRegisters(input: {
  cells: number[]
  numRegisters: number
  perRegister: number
}): { regions: number[][]; ground: number[] } {
  const { cells, numRegisters, perRegister } = input
  const regions: number[][] = []
  let cursor = 0
  for (let r = 0; r < numRegisters; r++) {
    const region: number[] = []
    for (
      let i = 0;
      i < perRegister && cursor < cells.length;
      i++, cursor++
    ) {
      region.push(cells[cursor]!)
    }
    regions.push(region)
  }
  const ground = cells.slice(cursor)
  return { regions, ground }
}
