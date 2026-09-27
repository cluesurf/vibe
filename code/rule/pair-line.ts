// The paid string on a line whose pairs are born in BOTH orientations. Built for E-FRC-0218.
//
// The rule is code/rule/string-line (E-FRC-0129) with one change. There the pair move is (0, 0) <-> (1, -1) on a
// link, a love born on the left, so the integer flux, 0 at the start, never falls below 0 and the rule samples its
// own ordered measure (E-FRC-0189) rather than the mod-3 measure of the transfer matrix. Here the orientation of the
// pair move alternates with the beat: on even beats (0, 0) <-> (1, -1), flux +1, and on odd beats
// (0, 0) <-> (-1, 1), flux -1. On any one half-step the move on a link is still a pairing with a symmetric
// payability, so each half-step is an involution, and the beat reverses by running its half-steps in the other order
// with the same orientation. Hops, the energy, Gauss's law, the matchings (even links, then odd links) and the
// demon stream (right on even beats, left on odd) are E-FRC-0129's, unchanged.
//
// Nothing moves: a hop is the vibe copied across a link and the calm left behind; the flux is the running count of
// what has crossed.

export type PairLine = {
  readonly cells: number
  readonly mass: number
  readonly tension: number
  readonly capacity: number
}

export type PairLineState = {
  readonly vibe: Int8Array
  readonly flux: Int32Array
  readonly demon: Int32Array
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function pairLineEnergy(line: PairLine, state: PairLineState): number {
  let total = 0

  for (let i = 0; i < line.cells; i++) {
    total += (mod3(state.flux[i] as number) !== 0 ? line.tension : 0) + (state.demon[i] as number) + (state.vibe[i] !== 0 ? line.mass : 0)
  }

  return total
}

export function pairLineGauss(line: PairLine, state: PairLineState): boolean {
  for (let i = 0; i < line.cells; i++) {
    const left = state.flux[(i - 1 + line.cells) % line.cells] as number

    if ((state.flux[i] as number) - left !== (state.vibe[i] as number)) {
      return false
    }
  }

  return true
}

// one half-step on the links of one parity, in place, with pairs born with a charge `sign` on the left: an
// involution. Returns the number of moves taken
function halfStep(line: PairLine, state: PairLineState, parity: number, sign: number): number {
  const { vibe, flux, demon } = state
  const { cells, mass, tension, capacity } = line

  let moves = 0

  for (let i = parity; i < cells; i += 2) {
    const j = i + 1 === cells ? 0 : i + 1
    const a = vibe[i] as number
    const b = vibe[j] as number

    let na: number
    let nb: number
    let change: number
    let massChange = 0

    if (a !== 0 && b === 0) {
      na = 0
      nb = a
      change = -a
    } else if (a === 0 && b !== 0) {
      na = b
      nb = 0
      change = b
    } else if (a === 0 && b === 0) {
      na = sign
      nb = -sign
      change = sign
      massChange = 2 * mass
    } else if (a === sign && b === -sign) {
      na = 0
      nb = 0
      change = -sign
      massChange = -2 * mass
    } else {
      continue
    }

    const e = flux[i] as number
    const cost = (mod3(e + change) !== 0 ? tension : 0) - (mod3(e) !== 0 ? tension : 0) + massChange
    const d = (demon[i] as number) - cost

    if (d < 0 || d > capacity) {
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

function streamDemons(line: PairLine, demon: Int32Array, right: boolean, scratch: Int32Array): void {
  scratch.set(demon)

  for (let i = 0; i < line.cells; i++) {
    demon[(i + (right ? 1 : line.cells - 1)) % line.cells] = scratch[i] as number
  }
}

// the beat t, in place. `both` false is the E-FRC-0129 rule (every pair love-left), the control
export function pairLineBeat(line: PairLine, state: PairLineState, t: number, both: boolean, scratch: Int32Array): void {
  const sign = both && t % 2 !== 0 ? -1 : 1

  halfStep(line, state, 0, sign)
  halfStep(line, state, 1, sign)
  streamDemons(line, state.demon, t % 2 === 0, scratch)
}

export function pairLineBeatBack(line: PairLine, state: PairLineState, t: number, both: boolean, scratch: Int32Array): void {
  const sign = both && t % 2 !== 0 ? -1 : 1

  streamDemons(line, state.demon, t % 2 !== 0, scratch)
  halfStep(line, state, 1, sign)
  halfStep(line, state, 0, sign)
}
