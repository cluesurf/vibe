// THE RAILWAY CIRCUIT at the switch level: Stewart's railway ("A Subway Named Turing", 1994) as
// Margenstern uses it to make his weakly universal cellular automata on the heptagrid {7,3}, the pentagrid
// {5,4} and the dodecagrid {5,3,4} (Cellular Automata in Hyperbolic Spaces, Vol II, section 4.2, and
// arXiv:0903.2108 and arXiv:1510.09129, section 2.1).
//
// ONE locomotive runs on tracks. A SWITCH joins three tracks: a single track u (port 0) and two tracks
// a and b (ports 1 and 2). Going from u to a or b is an ACTIVE crossing, and the switch picks the track,
// called the selected track. Going from a or b to u is a PASSIVE crossing. Three kinds, exactly as the
// sources define them:
//
//   fixed      the selected track never changes. Crossed actively or passively
//   flip_flop  after an active crossing the selected track changes. Crossed ACTIVELY ONLY
//   memory     the selected track is the track of the last passive crossing. Crossed either way
//
// The switch settings are the whole memory of the machine. This file holds the switch rule, the circuit
// graph, the gadgets built from the three switches, a compiler from a Minsky register machine to one
// circuit, a switch-level simulator, and a direct evaluator to check it against.
//
// WHAT IS SOURCED AND WHAT IS OURS.
//   Sourced:
//   - the three switches (Vol II 4.2.1, 0903.2108 section 2)
//   - the BASIC ELEMENT holding one bit (Stewart's elementary circuit, Vol II fig. 11, 1510.09129 fig. 2).
//     A memory switch R is read from its single track. A flip-flop W's track alpha joins R's track
//     1 - alpha, so a passage through W rewrites the bit
//   - the REGISTER UNIT of two synchronized elements, one read to increment and one to decrement (Vol II
//     fig. 12, 1510.09129 fig. 3)
//   - the unary register of units, and the zero test by the locomotive coming back from the first unit on
//     its own track
//   - a caller other than the first MARKS itself with elements on the way in, so the return, which comes
//     back by one of two tracks, finds it (the elementary selector, Vol II fig. 16 and 17, "S2..Sk", and
//     no selector for D1)
//   Ours: the exact wiring. The book gives figures 12, 13 and 17 as drawings whose routes the text only
//   partly names, so every gadget here is rebuilt from the three switches and checked by running it. The
//   control of the register's input and output (Vol II fig. 13) is replaced by giving the register three
//   exits (after an increment, after a decrement, zero) and scanning the callers' marks on each.
//   The TOGGLE gadget writes a list of elements and sends the locomotive back out of the track it came in
//   by: a chain of memory switches remembers the entrance, a fixed switch and a loop turn the locomotive
//   round, and the memory switches, crossed actively on the way out, send it back. This is the loop of
//   Vol II fig. 13 ("the fix switch has the locomotive enter a loop which goes back to A").
//
// Deterministic. No randomness anywhere.

/** The three switch kinds of the railway, and a terminal (a track end). */
export type SwitchKind = 'fixed' | 'flip_flop' | 'memory'

/**
 * What a terminal is for:
 *   start     where the locomotive stands at time 0, leaving by its one track
 *   halt      the program's halt: the locomotive stops here
 *   overflow  the end of a register's increment chain: the register was too short
 *   stray     a track nothing can reach, closing a port no instruction uses
 */
export type TerminalKind = 'start' | 'halt' | 'overflow' | 'stray'

/** A node of the circuit: a switch with ports 0 (u), 1 (a), 2 (b), or a terminal with port 0. */
export type CircuitNode =
  | {
      form: 'switch'
      kind: SwitchKind
      /** the selected track, 1 (a) or 2 (b), at time 0 */
      selected: 1 | 2
      /** what the switch is part of, for reading results and for drawing */
      label: string
    }
  | { form: 'terminal'; kind: TerminalKind; label: string }

/** One port of one node. */
export type PortRef = { node: number; port: number }

/** The circuit: nodes, and for every node and port the port at the other end of its track. */
export type Circuit = {
  nodes: CircuitNode[]
  /** link[node][port] is the port joined to it by a track */
  link: (PortRef | null)[][]
}

/** The outcome of one crossing of one switch. */
export type Crossing = {
  /** the port the locomotive leaves by */
  exit: number
  /** the selected track after the crossing */
  selected: 1 | 2
  /** true when the crossing is forbidden: a flip-flop crossed passively */
  forbidden: boolean
}

/**
 * THE SWITCH RULE, the whole of it. `entry` is the port the locomotive arrives by: 0 is the single
 * track (an active crossing), 1 or 2 a branch (a passive crossing).
 */
export function crossSwitch({
  kind,
  selected,
  entry,
}: {
  kind: SwitchKind
  selected: 1 | 2
  entry: number
}): Crossing {
  if (entry === 0) {
    return {
      exit: selected,
      selected:
        kind === 'flip_flop' ? (selected === 1 ? 2 : 1) : selected,
      forbidden: false,
    }
  }

  return {
    exit: 0,
    selected: kind === 'memory' ? (entry as 1 | 2) : selected,
    forbidden: kind === 'flip_flop',
  }
}

/** An empty circuit. */
export function makeCircuit(): Circuit {
  return { nodes: [], link: [] }
}

/** Add a switch and return its node id. */
export function addSwitch(
  circuit: Circuit,
  {
    kind,
    selected,
    label,
  }: { kind: SwitchKind; selected: 1 | 2; label: string },
): number {
  circuit.nodes.push({ form: 'switch', kind, selected, label })
  circuit.link.push([null, null, null])

  return circuit.nodes.length - 1
}

/** Add a terminal and return its node id. */
export function addTerminal(
  circuit: Circuit,
  { kind, label }: { kind: TerminalKind; label: string },
): number {
  circuit.nodes.push({ form: 'terminal', kind, label })
  circuit.link.push([null])

  return circuit.nodes.length - 1
}

/** Join two ports by a track. Each port takes exactly one track. */
export function connect(circuit: Circuit, a: PortRef, b: PortRef): void {
  if (circuit.link[a.node]![a.port] || circuit.link[b.node]![b.port]) {
    throw new Error(
      `port already joined: ${circuit.nodes[a.node]!.label}.${a.port} or ${circuit.nodes[b.node]!.label}.${b.port}`,
    )
  }

  circuit.link[a.node]![a.port] = b
  circuit.link[b.node]![b.port] = a
}

/**
 * Merge several tracks the locomotive LEAVES by into one, with fixed switches crossed passively (a fixed
 * switch may be crossed passively from either branch). Returns the one track it leaves the merge by.
 */
export function mergeTracks(
  circuit: Circuit,
  outs: PortRef[],
  label: string,
): PortRef {
  if (outs.length === 0) {
    const stray = addTerminal(circuit, { kind: 'stray', label })

    return { node: stray, port: 0 }
  }

  let current = outs[0]!

  for (let i = 1; i < outs.length; i++) {
    const merge = addSwitch(circuit, {
      kind: 'fixed',
      selected: 1,
      label: `${label} merge ${i}`,
    })

    connect(circuit, current, { node: merge, port: 1 })
    connect(circuit, outs[i]!, { node: merge, port: 2 })
    current = { node: merge, port: 0 }
  }

  return current
}

/**
 * THE BASIC ELEMENT, one bit (Stewart's elementary circuit). R is a memory switch, read by arriving on
 * its single track: it leaves by track 1 or track 0 as it holds 1 or 0. W is a flip-flop: a passage through
 * W takes its track alpha, which joins R's track 1 - alpha through a fixed switch, so the locomotive crosses
 * R passively and R now holds 1 - alpha; W has flipped too, so W and R keep the same label. A fixed switch V
 * before R turns the locomotive, coming back out of R after a write, onto its own exit.
 */
export type Element = {
  /** the memory switch that holds the bit: selected 1 is bit 1, selected 2 is bit 0 */
  holder: number
  /** arrive here to read */
  readIn: PortRef
  /** leave here after reading 0 */
  readOut0: PortRef
  /** leave here after reading 1 */
  readOut1: PortRef
  /** arrive here to rewrite the bit */
  writeIn: PortRef
  /** leave here after the rewrite */
  writeOut: PortRef
}

export function addElement(
  circuit: Circuit,
  { bit, label }: { bit: 0 | 1; label: string },
): Element {
  // R ports: 0 the read track, 1 the track of bit 1, 2 the track of bit 0
  const r = addSwitch(circuit, {
    kind: 'memory',
    selected: bit === 1 ? 1 : 2,
    label: `${label} R`,
  })
  // W ports: 0 the write track, 1 its track 0 (joins R's track 1), 2 its track 1 (joins R's track 0)
  const w = addSwitch(circuit, {
    kind: 'flip_flop',
    selected: bit === 1 ? 2 : 1,
    label: `${label} W`,
  })
  const j1 = addSwitch(circuit, {
    kind: 'fixed',
    selected: 1,
    label: `${label} J1`,
  })
  const j0 = addSwitch(circuit, {
    kind: 'fixed',
    selected: 1,
    label: `${label} J0`,
  })
  const v = addSwitch(circuit, {
    kind: 'fixed',
    selected: 1,
    label: `${label} V`,
  })

  connect(circuit, { node: j1, port: 0 }, { node: r, port: 1 })
  connect(circuit, { node: j1, port: 2 }, { node: w, port: 1 })
  connect(circuit, { node: j0, port: 0 }, { node: r, port: 2 })
  connect(circuit, { node: j0, port: 2 }, { node: w, port: 2 })
  connect(circuit, { node: v, port: 0 }, { node: r, port: 0 })

  return {
    holder: r,
    readIn: { node: v, port: 2 },
    readOut0: { node: j0, port: 1 },
    readOut1: { node: j1, port: 1 },
    writeIn: { node: w, port: 0 },
    writeOut: { node: v, port: 1 },
  }
}

/** The bit an element holds, read off its memory switch. */
export function elementBit(circuit: Circuit, element: Element): 0 | 1 {
  const node = circuit.nodes[element.holder]!

  return node.form === 'switch' && node.selected === 1 ? 1 : 0
}

/**
 * THE TOGGLE: rewrite every element in `elements` and send the locomotive back out by the entrance it came
 * in by. Entrance i is `ins[i]` and its exit is `outs[i]`. A fixed switch F_i per entrance takes the
 * arrival passively and the return actively. A chain of memory switches, crossed passively on the way in,
 * remembers the entrance. A fixed switch L sends the locomotive round a loop through every element's write
 * track and back into L, which returns it to the chain, now crossed actively.
 */
export type Toggle = { ins: PortRef[]; outs: PortRef[] }

export function addToggle(
  circuit: Circuit,
  {
    entrances,
    elements,
    label,
  }: { entrances: number; elements: Element[]; label: string },
): Toggle {
  const loop = addSwitch(circuit, {
    kind: 'fixed',
    selected: 1,
    label: `${label} L`,
  })

  // the loop through every element's write track
  let into: PortRef = { node: loop, port: 1 }

  for (const element of elements) {
    connect(circuit, into, element.writeIn)
    into = element.writeOut
  }

  connect(circuit, into, { node: loop, port: 2 })

  const diverters = Array.from({ length: entrances }, (_, i) =>
    addSwitch(circuit, {
      kind: 'fixed',
      selected: 1,
      label: `${label} F${i}`,
    }),
  )

  // the memory chain: entrance 0 on the first memory switch's track a, the rest down its track b
  let trunk: PortRef = { node: loop, port: 0 }

  for (let i = 0; i < entrances - 1; i++) {
    const memory = addSwitch(circuit, {
      kind: 'memory',
      selected: 1,
      label: `${label} C${i}`,
    })

    connect(circuit, trunk, { node: memory, port: 0 })
    connect(
      circuit,
      { node: memory, port: 1 },
      { node: diverters[i]!, port: 0 },
    )
    trunk = { node: memory, port: 2 }
  }

  connect(circuit, trunk, { node: diverters[entrances - 1]!, port: 0 })

  return {
    ins: diverters.map(d => ({ node: d, port: 2 })),
    outs: diverters.map(d => ({ node: d, port: 1 })),
  }
}

/**
 * A UNARY REGISTER of `units` units, holding `value`. Unit i holds one bit in two elements, `inc` (read on
 * the way to increment) and `dec` (read on the way to decrement), kept equal by one toggle with two
 * entrances, `set` and `clear`. Units 0 .. value - 1 hold 1.
 *
 *   increment   read inc of units 0, 1, ... until one reads 0, set that unit, leave by `afterIncrement`
 *   decrement   read dec of units 0, 1, ... until one reads 0. If it is unit 0 the register was zero:
 *               leave by `zero`. Otherwise clear the unit before it, leave by `afterDecrement`.
 *               A register whose every unit holds 1 clears its last unit.
 */
export type Register = {
  increment: PortRef
  decrement: PortRef
  afterIncrement: PortRef
  afterDecrement: PortRef
  zero: PortRef
  units: { inc: Element; dec: Element }[]
}

export function addRegister(
  circuit: Circuit,
  { units, value, label }: { units: number; value: number; label: string },
): Register {
  const cells = Array.from({ length: units }, (_, i) => {
    const bit: 0 | 1 = i < value ? 1 : 0
    const inc = addElement(circuit, { bit, label: `${label} unit ${i} inc` })
    const dec = addElement(circuit, { bit, label: `${label} unit ${i} dec` })
    const toggle = addToggle(circuit, {
      entrances: 2,
      elements: [inc, dec],
      label: `${label} unit ${i} toggle`,
    })

    return { inc, dec, toggle }
  })

  for (let i = 0; i < units; i++) {
    const unit = cells[i]!

    connect(circuit, unit.inc.readOut0, unit.toggle.ins[0]!)

    if (i + 1 < units) {
      connect(circuit, unit.inc.readOut1, cells[i + 1]!.inc.readIn)
      connect(circuit, unit.dec.readOut1, cells[i + 1]!.dec.readIn)
    } else {
      const overflow = addTerminal(circuit, {
        kind: 'overflow',
        label: `${label} overflow`,
      })

      connect(circuit, unit.inc.readOut1, { node: overflow, port: 0 })
      connect(circuit, unit.dec.readOut1, unit.toggle.ins[1]!)
    }

    if (i > 0) {
      connect(circuit, unit.dec.readOut0, cells[i - 1]!.toggle.ins[1]!)
    }
  }

  return {
    increment: cells[0]!.inc.readIn,
    decrement: cells[0]!.dec.readIn,
    afterIncrement: mergeTracks(
      circuit,
      cells.map(c => c.toggle.outs[0]!),
      `${label} after increment`,
    ),
    afterDecrement: mergeTracks(
      circuit,
      cells.map(c => c.toggle.outs[1]!),
      `${label} after decrement`,
    ),
    zero: cells[0]!.dec.readOut0,
    units: cells.map(c => ({ inc: c.inc, dec: c.dec })),
  }
}

/** The value a register holds: its units reading 1, which must be a prefix, inc and dec agreeing. */
export function registerValue(circuit: Circuit, register: Register): number {
  let value = 0

  for (const unit of register.units) {
    const a = elementBit(circuit, unit.inc)
    const d = elementBit(circuit, unit.dec)

    if (a !== d) {
      return -1
    }

    if (a === 1) {
      value += 1
    }
  }

  for (let i = 0; i < register.units.length; i++) {
    if (elementBit(circuit, register.units[i]!.inc) !== (i < value ? 1 : 0)) {
      return -1
    }
  }

  return value
}

/** A Minsky register-machine instruction. Instructions are numbered from 0, and 0 runs first. */
export type Instruction =
  | { op: 'inc'; register: number; next: number }
  | { op: 'dec'; register: number; next: number; zero: number }
  | { op: 'halt' }

export type Program = {
  registers: number
  code: Instruction[]
}

/** A compiled program: the circuit and where its registers are. */
export type CompiledProgram = {
  circuit: Circuit
  registers: Register[]
  start: number
}

/**
 * COMPILE a register machine to one railway circuit. Every instruction i has an entrance, and every
 * track that leads to i (the start, a continuation, a jump) is merged into it.
 *
 * For each register, its callers of one kind (the inc instructions, or the dec ones) are numbered in
 * program order. Caller 0 goes straight into the register. Every later caller first passes a toggle that
 * rewrites its MARK, one element per return track, to 1. On the way back the locomotive reads the marks of
 * callers 1, 2, ... in turn, on the element that belongs to the track it came back by. A 1 is the caller
 * that sent it: the toggle rewrites the mark to 0 and sends it on to that caller's continuation. When no
 * mark reads 1, caller 0 sent it. This is Margenstern's chain of elementary selectors.
 */
export function compileProgram({
  program,
  initial,
  units,
}: {
  program: Program
  initial: number[]
  /** units per register: one count for all, or one per register */
  units: number | number[]
}): CompiledProgram {
  const circuit = makeCircuit()
  const count = program.code.length
  // the tracks leading into each instruction, merged at the end
  const arrivals: PortRef[][] = Array.from({ length: count }, () => [])
  // where each instruction's entrance goes: into a port, or merged with others into a port
  const entranceInto: (PortRef | null)[] = new Array(count).fill(null)
  const entranceJoins: (PortRef[] | null)[] = new Array(count).fill(null)
  // each register entrance, with the tracks of its callers, filled once the instructions are merged
  const registerEntrances: { list: PortRef[]; into: PortRef; label: string }[] =
    []

  const start = addTerminal(circuit, { kind: 'start', label: 'start' })

  arrivals[0]!.push({ node: start, port: 0 })

  const registers = Array.from({ length: program.registers }, (_, r) =>
    addRegister(circuit, {
      units: typeof units === 'number' ? units : units[r]!,
      value: initial[r] ?? 0,
      label: `register ${r}`,
    }),
  )

  program.code.forEach((instruction, i) => {
    if (instruction.op === 'halt') {
      const halt = addTerminal(circuit, { kind: 'halt', label: `halt ${i}` })

      entranceInto[i] = { node: halt, port: 0 }
    }
  })

  for (let r = 0; r < program.registers; r++) {
    const register = registers[r]!

    for (const op of ['inc', 'dec'] as const) {
      const callers = program.code
        .map((instruction, i) => ({ instruction, i }))
        .filter(
          ({ instruction }) =>
            instruction.op === op && instruction.register === r,
        )
      const channels = op === 'inc' ? 1 : 2
      // what the register's return tracks lead to: the next instruction, and for dec the zero target
      const returns: PortRef[] =
        op === 'inc'
          ? [register.afterIncrement]
          : [register.afterDecrement, register.zero]
      const target = (i: number, channel: number): number => {
        const instruction = program.code[i]!

        if (instruction.op === 'halt') {
          throw new Error('a halt is not a caller')
        }

        return channel === 0
          ? instruction.next
          : (instruction as { zero: number }).zero
      }

      if (callers.length === 0) {
        const into = op === 'inc' ? register.increment : register.decrement
        const stray = addTerminal(circuit, {
          kind: 'stray',
          label: `register ${r} ${op} unused`,
        })

        connect(circuit, { node: stray, port: 0 }, into)

        for (const back of returns) {
          const end = addTerminal(circuit, {
            kind: 'stray',
            label: `register ${r} ${op} return unused`,
          })

          connect(circuit, back, { node: end, port: 0 })
        }

        continue
      }

      const intoRegister: PortRef[] = []

      entranceJoins[callers[0]!.i] = intoRegister

      const marks = callers.slice(1).map(({ i }, k) => {
        const elements = Array.from({ length: channels }, (_, c) =>
          addElement(circuit, {
            bit: 0,
            label: `register ${r} ${op} caller ${k + 1} mark ${c}`,
          }),
        )
        const toggle = addToggle(circuit, {
          entrances: channels + 1,
          elements,
          label: `register ${r} ${op} caller ${k + 1} toggle`,
        })

        entranceInto[i] = toggle.ins[0]!
        intoRegister.push(toggle.outs[0]!)

        for (let c = 0; c < channels; c++) {
          connect(circuit, elements[c]!.readOut1, toggle.ins[c + 1]!)
          arrivals[target(i, c)]!.push(toggle.outs[c + 1]!)
        }

        return elements
      })

      // each return track reads the marks of callers 1, 2, ... in order, and falls through to caller 0
      for (let c = 0; c < channels; c++) {
        let reading = returns[c]!

        for (const elements of marks) {
          connect(circuit, reading, elements[c]!.readIn)
          reading = elements[c]!.readOut0
        }

        arrivals[target(callers[0]!.i, c)]!.push(reading)
      }

      // the register entrance, filled once the instructions' entrances are merged
      registerEntrances.push({
        list: intoRegister,
        into: op === 'inc' ? register.increment : register.decrement,
        label: `register ${r} ${op}`,
      })
    }
  }

  // every instruction's arrivals merged into one track, then into its entrance
  for (let i = 0; i < count; i++) {
    const merged = mergeTracks(circuit, arrivals[i]!, `instruction ${i}`)

    if (entranceInto[i]) {
      connect(circuit, merged, entranceInto[i]!)
    } else if (entranceJoins[i]) {
      entranceJoins[i]!.unshift(merged)
    } else {
      throw new Error(`instruction ${i} has no entrance`)
    }
  }

  for (const entrance of registerEntrances) {
    connect(
      circuit,
      mergeTracks(circuit, entrance.list, entrance.label),
      entrance.into,
    )
  }

  checkClosed(circuit)

  return { circuit, registers, start }
}

/** Every port of every node joined by exactly one track, and joined symmetrically. */
export function checkClosed(circuit: Circuit): void {
  circuit.link.forEach((ports, node) => {
    ports.forEach((other, port) => {
      if (!other) {
        throw new Error(
          `open port: ${circuit.nodes[node]!.label}.${port}`,
        )
      }

      const back = circuit.link[other.node]![other.port]

      if (!back || back.node !== node || back.port !== port) {
        throw new Error(`asymmetric track at ${circuit.nodes[node]!.label}`)
      }
    })
  })
}

/** How a run ended. */
export type Ending = 'halt' | 'overflow' | 'stray' | 'forbidden' | 'limit'

/** One switch crossing: the node crossed and the port arrived by, for comparing two runs. */
export type Visit = { node: number; entry: number }

/**
 * RUN the circuit at the switch level. The locomotive leaves the start terminal and crosses switch after
 * switch, each crossing by `crossSwitch`, until it reaches a terminal or `limit` crossings. The circuit's
 * switch settings are changed in place. Returns how it ended, the crossings, and the terminal reached.
 */
export function runCircuit({
  circuit,
  start,
  limit,
  onVisit,
}: {
  circuit: Circuit
  start: number
  limit: number
  onVisit?: (visit: Visit) => void
}): { ending: Ending; crossings: number; at: number } {
  let at = circuit.link[start]![0]!
  let crossings = 0

  while (crossings < limit) {
    const node = circuit.nodes[at.node]!

    if (node.form === 'terminal') {
      return {
        ending:
          node.kind === 'halt'
            ? 'halt'
            : node.kind === 'overflow'
              ? 'overflow'
              : 'stray',
        crossings,
        at: at.node,
      }
    }

    const crossing = crossSwitch({
      kind: node.kind,
      selected: node.selected,
      entry: at.port,
    })

    onVisit?.({ node: at.node, entry: at.port })
    crossings += 1

    if (crossing.forbidden) {
      return { ending: 'forbidden', crossings, at: at.node }
    }

    node.selected = crossing.selected
    at = circuit.link[at.node]![crossing.exit]!
  }

  return { ending: 'limit', crossings, at: at.node }
}

/** DIRECT EVALUATION of a register machine, the reference the circuit is checked against. */
export function evaluateProgram({
  program,
  initial,
  limit,
}: {
  program: Program
  initial: number[]
  limit: number
}): { registers: number[]; steps: number; halted: boolean } {
  const registers = Array.from(
    { length: program.registers },
    (_, r) => initial[r] ?? 0,
  )
  let pc = 0
  let steps = 0

  while (steps < limit) {
    const instruction = program.code[pc]!

    if (instruction.op === 'halt') {
      return { registers, steps, halted: true }
    }

    steps += 1

    if (instruction.op === 'inc') {
      registers[instruction.register]! += 1
      pc = instruction.next
    } else if (registers[instruction.register]! > 0) {
      registers[instruction.register]! -= 1
      pc = instruction.next
    } else {
      pc = instruction.zero
    }
  }

  return { registers, steps, halted: false }
}

/** A copy of a circuit with each switch of kind `from` made kind `to`, the settings kept: a control. */
export function replaceSwitchKind({
  circuit,
  from,
  to,
}: {
  circuit: Circuit
  from: SwitchKind
  to: SwitchKind
}): Circuit {
  return {
    nodes: circuit.nodes.map(node =>
      node.form === 'switch' && node.kind === from
        ? { ...node, kind: to }
        : { ...node },
    ),
    link: circuit.link.map(ports => ports.map(p => (p ? { ...p } : null))),
  }
}

/** A deep copy of a circuit, so one compiled program can be run twice from the same start. */
export function copyCircuit(circuit: Circuit): Circuit {
  return {
    nodes: circuit.nodes.map(node => ({ ...node })),
    link: circuit.link.map(ports => ports.map(p => (p ? { ...p } : null))),
  }
}

/**
 * Four register machines. `add` and `multiply` have one caller per register and kind, `double` has two
 * inc callers on one register and `parity` two dec callers on one register with different zero targets,
 * so the marks are exercised on both kinds of return.
 */
export const PROGRAMS: Record<string, Program> = {
  // r0 := r0 + r1, r1 := 0
  add: {
    registers: 2,
    code: [
      { op: 'dec', register: 1, next: 1, zero: 2 },
      { op: 'inc', register: 0, next: 0 },
      { op: 'halt' },
    ],
  },
  // r1 := r1 + 2 r0, r0 := 0
  double: {
    registers: 2,
    code: [
      { op: 'dec', register: 0, next: 1, zero: 3 },
      { op: 'inc', register: 1, next: 2 },
      { op: 'inc', register: 1, next: 0 },
      { op: 'halt' },
    ],
  },
  // r2 := r2 + r0 r1, r0 := 0, r1 kept (r3 scratch, left at 0)
  multiply: {
    registers: 4,
    code: [
      { op: 'dec', register: 0, next: 1, zero: 6 },
      // move r1 into r2 and r3
      { op: 'dec', register: 1, next: 2, zero: 4 },
      { op: 'inc', register: 2, next: 3 },
      { op: 'inc', register: 3, next: 1 },
      // move r3 back into r1
      { op: 'dec', register: 3, next: 5, zero: 0 },
      { op: 'inc', register: 1, next: 4 },
      { op: 'halt' },
    ],
  },
  // r1 := 1 if r0 is even else 0, r0 := 0: two dec callers on r0 with different zero targets
  parity: {
    registers: 2,
    code: [
      { op: 'dec', register: 0, next: 1, zero: 2 },
      { op: 'dec', register: 0, next: 0, zero: 4 },
      { op: 'inc', register: 1, next: 3 },
      { op: 'halt' },
      { op: 'halt' },
    ],
  },
}
