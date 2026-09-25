// A charge that pays for its string: the triality flux as an energy, on a line of cells, deterministic and
// exactly reversible. The mechanism binding needs, before it is put on the D4 lattice.
//
// Cells i on a ring hold a vibe q_i (fear -1, calm 0, love +1). Link i, between cells i and i + 1, holds
// an electric flux E_i, a whole number, with Gauss's law E_i - E_{i-1} = q_i at every cell, and a demon
// d_i, a counter from 0 to a capacity. E mod 3 is the triality flux of the vibe weave (E-FRC-0123), the
// net vibe that has crossed a link, mod 3. The energy is
//
//   H = mass * (cells holding a vibe) + tension * (links with E mod 3 not 0) + sum of demons,
//
// so a love and a fear three cells apart cost 2 mass and 3 tension: the string between them. A whole of
// triality zero (love minus fear a multiple of 3) closes its own string. The mass makes calm's pairs cost
// something, so a rule with no tension (the control) has a quiet vacuum and free charges.
//
// A beat is two half-steps on the even links, then the odd links (no two links of a half-step share a
// cell), then the demons stream one link, right on even beats and left on odd. On one link the move pairs
//   (v, 0) with (0, v), a charge hopping across, E_i changed by -v
//   (0, 0) with (1, -1), calm making a pair, E_i changed by +1
// and takes the move only if the link's demon can pay the change in string energy and stay within 0 and
// its capacity. Each pairing is symmetric and so is the payability, so the half-step is an involution:
// its own inverse. A charge whose hop cannot be paid stays, and on the next half-step it moves the other
// way: it reflects off its string. Gauss's law holds by construction, since a hop changes exactly the
// flux of the link it crosses by the charge it carries.

export type StringLine = {
  readonly cells: number
  readonly mass: number
  readonly tension: number
  readonly capacity: number
}

export type StringState = {
  readonly vibe: Int8Array
  readonly flux: Int32Array
  readonly demon: Int32Array
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function stringEnergy(line: StringLine, state: StringState): number {
  let total = 0

  for (let i = 0; i < line.cells; i++) {
    total += (mod3(state.flux[i] ?? 0) !== 0 ? line.tension : 0) + (state.demon[i] ?? 0) + (state.vibe[i] !== 0 ? line.mass : 0)
  }

  return total
}

// Gauss's law at every cell
export function gaussHolds(line: StringLine, state: StringState): boolean {
  for (let i = 0; i < line.cells; i++) {
    const left = state.flux[(i - 1 + line.cells) % line.cells] ?? 0

    if ((state.flux[i] ?? 0) - left !== (state.vibe[i] ?? 0)) {
      return false
    }
  }

  return true
}

// one half-step on the links of one parity, in place: an involution
function halfStep(line: StringLine, state: StringState, parity: number): number {
  const { vibe, flux, demon } = state

  let moves = 0

  for (let i = parity; i < line.cells; i += 2) {
    const j = (i + 1) % line.cells
    const a = vibe[i] ?? 0
    const b = vibe[j] ?? 0

    let na = a
    let nb = b
    let change = 0
    let massChange = 0

    if (a !== 0 && b === 0) {
      ;[na, nb, change] = [0, a, -a]
    } else if (a === 0 && b !== 0) {
      ;[na, nb, change] = [b, 0, b]
    } else if (a === 0 && b === 0) {
      ;[na, nb, change, massChange] = [1, -1, 1, 2 * line.mass]
    } else if (a === 1 && b === -1) {
      ;[na, nb, change, massChange] = [0, 0, -1, -2 * line.mass]
    } else {
      continue
    }

    const e = flux[i] ?? 0
    const cost = (mod3(e + change) !== 0 ? line.tension : 0) - (mod3(e) !== 0 ? line.tension : 0) + massChange
    const d = (demon[i] ?? 0) - cost

    if (d < 0 || d > line.capacity) {
      continue
    }

    vibe[i] = na
    vibe[j] = nb
    flux[i] = e + change
    demon[i] = d
    moves += 1
  }

  return moves
}

// demons stream one link, right on even beats and left on odd, or the reverse
function streamDemons(line: StringLine, demon: Int32Array, right: boolean): void {
  const copy = Int32Array.from(demon)

  for (let i = 0; i < line.cells; i++) {
    demon[(i + (right ? 1 : line.cells - 1)) % line.cells] = copy[i] ?? 0
  }
}

export function stringBeat(line: StringLine, state: StringState, t: number): StringState {
  const next = { vibe: Int8Array.from(state.vibe), flux: Int32Array.from(state.flux), demon: Int32Array.from(state.demon) }

  halfStep(line, next, 0)
  halfStep(line, next, 1)
  streamDemons(line, next.demon, t % 2 === 0)

  return next
}

export function stringBeatBack(line: StringLine, state: StringState, t: number): StringState {
  const next = { vibe: Int8Array.from(state.vibe), flux: Int32Array.from(state.flux), demon: Int32Array.from(state.demon) }

  streamDemons(line, next.demon, t % 2 !== 0)
  halfStep(line, next, 1)
  halfStep(line, next, 0)

  return next
}

// a state with the given vibes, the flux solving Gauss's law with E = 0 left of the first charge, and demons
export function stringState(input: { line: StringLine; vibe: Int8Array; demon: Int32Array }): StringState {
  const { line, vibe, demon } = input
  const flux = new Int32Array(line.cells)

  let e = 0

  for (let i = 0; i < line.cells; i++) {
    e += vibe[i] ?? 0
    flux[i] = e
  }

  return { vibe: Int8Array.from(vibe), flux, demon: Int32Array.from(demon) }
}
