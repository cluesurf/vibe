// The fear clock: the one-third turn joined to the committed pair clock, with amplitudes on whole
// configurations of the vacuum and whatever moves through it (E-QTM-0108).
//
// The committed pair table on a line is an exchange followed by the clock's creation step. On the nine
// states of a line's two slots it is P = K SWAP, where SWAP exchanges the slots and K swaps (0, 0) with
// (1, -1) and fixes the rest: calm makes a love-fear pair and the pair falls back to calm, every other
// state left alone. (Checked on all nine states in E-QTM-0108.) The fear clock puts the swap phase in
// place of the exchange,
//
//   F(phi) = K U(phi),  U(phi) = P_sym + e^(i phi) P_anti = a + b SWAP,
//
// so F(pi) = P, the committed table, and F(2 pi / 3) is its one-third turn. Both factors keep the line's
// vibe sum, so every configuration in a superposition keeps the start's love minus fear. The state is an
// amplitude on each configuration of every slot's vibe, an Eisenstein integer over 2^h: 2 a = 1 + omega and
// 2 b = 1 - omega are whole, K only relabels, so nothing is ever rounded. The backward step is
// U(phi)^dagger K with the conjugate weights.
//
// Two geometries. A ring of docks each holding one line (a right-moving and a left-moving slot), the
// clock on every line, then the stream: the committed pair table's one-line sector. And one D4 dock with
// its twelve lines, run by the committed turning weave's schedule (six couples a beat, the palindromic
// swap on one of them), the dock streaming into itself: a box of side 1. The palindromic swap is a
// permutation of configurations and stays classical; only the clock carries the turn.
//
// A configuration is stored as a number, slot s holding its vibe + 1 as the base-3 digit of 3^s.

import { type Eisenstein, TWO, TWO_A, TWO_A_BAR, TWO_B, TWO_B_BAR, ZERO, norm, plus, times } from '@/code/rule/fear-walk'
import { G_TURN, TURN_COUPLES_ZERO, TURN_POS_MIRROR, TURN_SWAP_ORDER } from '@/code/rule/collision'

export type Amplitudes = {
  // amplitude of each configuration, over 2^halvings
  readonly weights: ReadonlyMap<number, Eisenstein>
  readonly halvings: number
}

export type ClockMode = 'fear' | 'committed'

const POW3 = Array.from({ length: 40 }, (_, s) => 3 ** s)

export function toneAt(config: number, slot: number): number {
  return (Math.floor(config / (POW3[slot] ?? 1)) % 3) - 1
}

export function setTone(config: number, slot: number, tone: number): number {
  return config + (tone - toneAt(config, slot)) * (POW3[slot] ?? 1)
}

export function configOf(tones: readonly number[]): number {
  return tones.reduce((c, tone, s) => c + (tone + 1) * (POW3[s] ?? 1), 0)
}

export function chargeOf(config: number, slots: number): number {
  let q = 0

  for (let s = 0; s < slots; s++) {
    q += toneAt(config, s)
  }

  return q
}

// K on a line (i first): (0, 0) <-> (1, -1), the rest fixed
function creation(config: number, i: number, j: number): number {
  const x = toneAt(config, i)
  const y = toneAt(config, j)

  if (x === 0 && y === 0) {
    return setTone(setTone(config, i, 1), j, -1)
  }

  if (x === 1 && y === -1) {
    return setTone(setTone(config, i, 0), j, 0)
  }

  return config
}

function add(map: Map<number, Eisenstein>, config: number, w: Eisenstein): void {
  const next = plus(map.get(config) ?? ZERO, w)

  if (next[0] === 0n && next[1] === 0n) {
    map.delete(config)
  } else {
    map.set(config, next)
  }
}

// the clock on the line (i, j): forward K U, backward U^dagger K. Every weight is doubled (the exchange of
// the committed mode written as 2 SWAP), so one halving is added
export function clockLine(state: Amplitudes, i: number, j: number, mode: ClockMode, forward: boolean): Amplitudes {
  const out = new Map<number, Eisenstein>()
  const keep = mode === 'committed' ? ZERO : forward ? TWO_A : TWO_A_BAR
  const exchange = mode === 'committed' ? TWO : forward ? TWO_B : TWO_B_BAR

  for (const [config0, w] of state.weights) {
    const config = forward ? config0 : creation(config0, i, j)
    const x = toneAt(config, i)
    const y = toneAt(config, j)
    const swapped = setTone(setTone(config, i, y), j, x)
    const finish = (c: number): number => (forward ? creation(c, i, j) : c)

    if (x === y) {
      add(out, finish(config), times(TWO, w))
    } else {
      if (keep[0] !== 0n || keep[1] !== 0n) {
        add(out, finish(config), times(keep, w))
      }

      add(out, finish(swapped), times(exchange, w))
    }
  }

  return { weights: out, halvings: state.halvings + 1 }
}

export function permuteConfigs(state: Amplitudes, f: (config: number) => number): Amplitudes {
  const out = new Map<number, Eisenstein>()

  for (const [config, w] of state.weights) {
    add(out, f(config), w)
  }

  return { weights: out, halvings: state.halvings }
}

// divide out common factors of 2
export function reduceAmplitudes(state: Amplitudes): Amplitudes {
  let weights = new Map(state.weights)
  let halvings = state.halvings

  while (halvings > 0 && [...weights.values()].every(w => w[0] % 2n === 0n && w[1] % 2n === 0n)) {
    weights = new Map([...weights].map(([c, w]) => [c, [w[0] / 2n, w[1] / 2n] as Eisenstein]))
    halvings--
  }

  return { weights, halvings }
}

export function totalNorm(state: Amplitudes): bigint {
  let total = 0n

  for (const w of state.weights.values()) {
    total += norm(w)
  }

  return total
}

// a ring of docks, one line each: slot 2x right-moving, 2x + 1 left-moving
export function ringBeat(state: Amplitudes, docks: number, mode: ClockMode, forward: boolean): Amplitudes {
  const stream = (config: number, back: boolean): number => {
    const tones: number[] = []

    for (let x = 0; x < docks; x++) {
      const step = back ? -1 : 1

      tones[2 * ((x + step + docks) % docks)] = toneAt(config, 2 * x)
      tones[2 * ((x - step + docks) % docks) + 1] = toneAt(config, 2 * x + 1)
    }

    return configOf(tones)
  }

  let s = state

  if (!forward) {
    s = permuteConfigs(s, c => stream(c, true))
  }

  for (let x = 0; x < docks; x++) {
    s = clockLine(s, 2 * x, 2 * x + 1, mode, forward)
  }

  if (forward) {
    s = permuteConfigs(s, c => stream(c, false))
  }

  return reduceAmplitudes(s)
}

// one D4 dock streaming into itself, under the turning weave's schedule; opposite from the D4 roots
export type Dock = {
  readonly lines: readonly (readonly [number, number])[]
  readonly positions: readonly (readonly (readonly [number, number])[])[]
}

export function makeDock(opposite: readonly number[]): Dock {
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

  const norm2 = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])
  const positions: [number, number][][] = []
  let current = TURN_COUPLES_ZERO.map(([a, b]) => norm2(a, b))

  for (let i = 0; i < 4; i++) {
    positions.push(current)
    current = current.map(([a, b]) => norm2(G_TURN[a] ?? a, G_TURN[b] ?? b))
  }

  return { lines, positions }
}

const SWAP_MIRROR = [...TURN_SWAP_ORDER, ...[...TURN_SWAP_ORDER].reverse()]

export function dockBeat(state: Amplitudes, dock: Dock, t: number, mode: ClockMode, forward: boolean): Amplitudes {
  const couples = dock.positions[TURN_POS_MIRROR[((t % 8) + 8) % 8] ?? 0] ?? []
  const swapIndex = SWAP_MIRROR[((t % 12) + 12) % 12] ?? 0
  let s = state

  for (let k = 0; k < 6; k++) {
    const line = dock.lines[couples[k]?.[0] ?? 0] ?? [0, 0]
    const wire = dock.lines[couples[k]?.[1] ?? 0] ?? [0, 0]
    const swap = (config: number): number => {
      const a0 = toneAt(config, line[0])
      const a1 = toneAt(config, line[1])
      const w0 = toneAt(config, wire[0])
      const w1 = toneAt(config, wire[1])
      const loneAway = (a: number, b: number): boolean => a === 0 && b !== 0
      const empty = (a: number, b: number): boolean => a === 0 && b === 0

      if ((loneAway(a0, a1) && empty(w0, w1)) || (loneAway(w0, w1) && empty(a0, a1))) {
        return setTone(setTone(setTone(setTone(config, line[0], w0), line[1], w1), wire[0], a0), wire[1], a1)
      }

      return config
    }

    if (k === swapIndex) {
      s = permuteConfigs(s, swap)
      s = clockLine(s, wire[0], wire[1], mode, forward)
      s = permuteConfigs(s, swap)
    } else {
      s = clockLine(s, wire[0], wire[1], mode, forward)
    }
  }

  return reduceAmplitudes(s)
}

// sum over configurations of the vibe on each slot times the configuration's chance, over 4^halvings
export function chargeProfile(state: Amplitudes, slots: number): bigint[] {
  const out = new Array<bigint>(slots).fill(0n)

  for (const [config, w] of state.weights) {
    const p = norm(w)

    for (let s = 0; s < slots; s++) {
      const q = toneAt(config, s)

      if (q !== 0) {
        out[s] = (out[s] ?? 0n) + BigInt(q) * p
      }
    }
  }

  return out
}

// twice the real part of sum over configurations of conj(wa) wb q_s, each state brought to the same halvings
export function crossProfile(a: Amplitudes, b: Amplitudes, slots: number): bigint[] {
  const h = Math.max(a.halvings, b.halvings)
  const sa = 2n ** BigInt(h - a.halvings)
  const sb = 2n ** BigInt(h - b.halvings)
  const out = new Array<bigint>(slots).fill(0n)

  for (const [config, wa0] of a.weights) {
    const wb0 = b.weights.get(config)

    if (!wb0) {
      continue
    }

    const wa: Eisenstein = [wa0[0] * sa, wa0[1] * sa]
    const wb: Eisenstein = [wb0[0] * sb, wb0[1] * sb]
    // 2 Re(conj(m1 + n1 w)(m2 + n2 w)) = 2 m1 m2 + 2 n1 n2 - m1 n2 - n1 m2
    const re2 = 2n * wa[0] * wb[0] + 2n * wa[1] * wb[1] - wa[0] * wb[1] - wa[1] * wb[0]

    for (let s = 0; s < slots; s++) {
      const q = toneAt(config, s)

      if (q !== 0) {
        out[s] = (out[s] ?? 0n) + BigInt(q) * re2
      }
    }
  }

  return out
}
