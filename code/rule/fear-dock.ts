// The fear clock on one D4 dock, reduced exactly (E-QTM-0110).
//
// code/rule/fear-clock holds an amplitude on every configuration of the dock's 24 slots, which passes
// 26,000 configurations in nine beats. This module keeps the same amplitudes in a smaller exact form,
// resting on one fact of the knit: the palindromic swap fires only where a line holds a lone charge (one
// slot calm, the other not) and the other line of its couple is calm. A line of the vacuum holds calm or a
// love-fear pair, never a lone charge, so in the vacuum no swap ever fires and every line evolves by its own
// clock alone: the vacuum is a product of twelve line states. A seeded vibe correlates only the lines its
// swaps reach. So the state is
//
//   (a sparse amplitude map over the joint states of the TOUCHED lines) x (one vector per untouched line),
//
// a line becoming touched when a swap between it and a touched line could fire. Every weight is an
// Eisenstein integer, the whole state over 2^h, one halving per clock on any line.
//
// A line's clock is the knit's wire table written T = K S_E: S_E exchanges the two slots on the states E
// where the table exchanges (every state for the committed pair table, the states with both slots holding a
// vibe for the hop-free bind table), and K swaps calm with (1, -1). The turn puts U = a + b SWAP on E in
// place of S_E, so the committed mode (U(pi) = SWAP) is T exactly.
//
// Local line state index: (a + 1) * 3 + (b + 1), a the line's first slot, b its second.

import { type Eisenstein, TWO, TWO_A, TWO_A_BAR, TWO_B, TWO_B_BAR, ZERO, norm, plus, times } from '@/code/rule/fear-walk'
import { type Knit } from '@/code/rule/fear-weave'

export type ClockKind = 'pair' | 'bind'
export type DockMode = 'fear' | 'committed'

const stateOf = (k: number): [number, number] => [Math.floor(k / 3) - 1, (k % 3) - 1]
const keyOf = (a: number, b: number): number => (a + 1) * 3 + (b + 1)
const SWAPPED = Array.from({ length: 9 }, (_, k) => {
  const [a, b] = stateOf(k)

  return keyOf(b, a)
})
// K: calm <-> (1, -1)
const CREATE = Array.from({ length: 9 }, (_, k) => (k === keyOf(0, 0) ? keyOf(1, -1) : k === keyOf(1, -1) ? keyOf(0, 0) : k))

// the 9 x 9 line step, as lists of (to, from, weight): forward K U_E, backward U_E^dagger K, every weight
// doubled so that each step adds one halving
export function lineStep(kind: ClockKind, mode: DockMode, forward: boolean): { to: number; from: number; w: Eisenstein }[] {
  const out: { to: number; from: number; w: Eisenstein }[] = []
  const inE = (k: number): boolean => {
    const [a, b] = stateOf(k)

    return kind === 'pair' || (a !== 0 && b !== 0)
  }
  const keep = mode === 'committed' ? ZERO : forward ? TWO_A : TWO_A_BAR
  const exchange = mode === 'committed' ? TWO : forward ? TWO_B : TWO_B_BAR

  for (let from = 0; from < 9; from++) {
    const k = forward ? from : (CREATE[from] ?? from)
    const finish = (x: number): number => (forward ? (CREATE[x] ?? x) : x)

    if (!inE(k) || SWAPPED[k] === k) {
      out.push({ to: finish(k), from, w: TWO })
    } else {
      if (keep !== ZERO) {
        out.push({ to: finish(k), from, w: keep })
      }

      out.push({ to: finish(SWAPPED[k] ?? k), from, w: exchange })
    }
  }

  return out
}

export type DockState = {
  // touched lines, in digit order (digit i of a joint key, base 9)
  readonly touched: readonly number[]
  readonly joint: ReadonlyMap<number, Eisenstein>
  // a vector over the 9 local states for every line, used for the untouched ones
  readonly free: readonly (readonly Eisenstein[])[]
  readonly halvings: number
}

const POW9 = Array.from({ length: 13 }, (_, i) => 9 ** i)
const digit = (key: number, i: number): number => Math.floor(key / (POW9[i] ?? 1)) % 9

function addTo(map: Map<number, Eisenstein>, key: number, w: Eisenstein): void {
  const next = plus(map.get(key) ?? ZERO, w)

  if (next[0] === 0n && next[1] === 0n) {
    map.delete(key)
  } else {
    map.set(key, next)
  }
}

const unit: Eisenstein = [1n, 0n]
const calmVector = (): Eisenstein[] => Array.from({ length: 9 }, (_, k) => (k === keyOf(0, 0) ? unit : ZERO))

// the vacuum, or the vacuum with a love (+1) or fear (-1) on one slot
export function dockStart(lines: readonly (readonly [number, number])[], seed?: { slot: number; vibe: number }): DockState {
  const free = lines.map(() => calmVector())

  if (!seed) {
    return { touched: [], joint: new Map([[0, unit]]), free, halvings: 0 }
  }

  const line = lines.findIndex(l => l[0] === seed.slot || l[1] === seed.slot)
  const local = lines[line]?.[0] === seed.slot ? keyOf(seed.vibe, 0) : keyOf(0, seed.vibe)

  return { touched: [line], joint: new Map([[local, unit]]), free, halvings: 0 }
}

function stepLine(state: DockState, line: number, step: { to: number; from: number; w: Eisenstein }[]): DockState {
  const at = state.touched.indexOf(line)

  if (at < 0) {
    const v = state.free[line] ?? calmVector()
    const out = Array.from({ length: 9 }, () => ZERO)

    for (const { to, from, w } of step) {
      const z = v[from] ?? ZERO

      if (z[0] !== 0n || z[1] !== 0n) {
        out[to] = plus(out[to] ?? ZERO, times(w, z))
      }
    }

    return { ...state, free: state.free.map((f, l) => (l === line ? out : f)), halvings: state.halvings + 1 }
  }

  const joint = new Map<number, Eisenstein>()
  const byFrom = Array.from({ length: 9 }, (_, from) => step.filter(s => s.from === from))

  for (const [key, z] of state.joint) {
    const local = digit(key, at)
    const base = key - local * (POW9[at] ?? 1)

    for (const { to, w } of byFrom[local] ?? []) {
      addTo(joint, base + to * (POW9[at] ?? 1), times(w, z))
    }
  }

  return { ...state, joint, halvings: state.halvings + 1 }
}

// bring an untouched line into the joint map, as the next digit
function touch(state: DockState, line: number): DockState {
  const v = state.free[line] ?? calmVector()
  const place = POW9[state.touched.length] ?? 1
  const joint = new Map<number, Eisenstein>()

  for (const [key, z] of state.joint) {
    v.forEach((c, k) => {
      if (c[0] !== 0n || c[1] !== 0n) {
        addTo(joint, key + k * place, times(z, c))
      }
    })
  }

  return { touched: [...state.touched, line], joint, free: state.free.map((f, l) => (l === line ? calmVector() : f)), halvings: state.halvings }
}

// the palindromic swap of a couple: the two lines trade contents where the knit's condition fires. Only a
// touched line can hold a lone charge, so a swap with an untouched line first touches it when some pair of
// their local states would fire
function swapCouple(state: DockState, knit: Knit, lineIndex: number, wireIndex: number): DockState {
  const fires = (l: number, w: number): boolean => knit.fires[l * 9 + w] === 1
  let s = state

  for (const [a, b] of [
    [lineIndex, wireIndex],
    [wireIndex, lineIndex],
  ] as const) {
    if (s.touched.includes(a) && !s.touched.includes(b)) {
      const at = s.touched.indexOf(a)
      const v = s.free[b] ?? calmVector()
      const could = [...s.joint.keys()].some(key => v.some((c, k) => (c[0] !== 0n || c[1] !== 0n) && (a === lineIndex ? fires(digit(key, at), k) : fires(k, digit(key, at)))))

      if (could) {
        s = touch(s, b)
      }
    }
  }

  const li = s.touched.indexOf(lineIndex)
  const wi = s.touched.indexOf(wireIndex)

  if (li < 0 || wi < 0) {
    return s
  }

  const joint = new Map<number, Eisenstein>()

  for (const [key, z] of s.joint) {
    const l = digit(key, li)
    const w = digit(key, wi)

    addTo(joint, fires(l, w) ? key + (w - l) * (POW9[li] ?? 1) + (l - w) * (POW9[wi] ?? 1) : key, z)
  }

  return { ...s, joint }
}

const at = (list: readonly number[], t: number): number => list[((t % list.length) + list.length) % list.length] ?? 0

// one beat of the dock (it streams into itself), forward or its inverse
export function dockReducedBeat(state: DockState, knit: Knit, kind: ClockKind, mode: DockMode, t: number, forward: boolean): DockState {
  const couples = knit.positions[at(knit.positionAt, t)] ?? []
  const swapIndex = at(knit.swapAt, t)
  const step = lineStep(kind, mode, forward)
  let s = state

  for (let k = 0; k < couples.length; k++) {
    const line = couples[k]?.[0] ?? 0
    const wire = couples[k]?.[1] ?? 0

    if (k === swapIndex) {
      s = swapCouple(s, knit, line, wire)
      s = stepLine(s, wire, step)
      s = swapCouple(s, knit, line, wire)
    } else {
      s = stepLine(s, wire, step)
    }
  }

  return reduceDock(s)
}

function reduceDock(state: DockState): DockState {
  let s = state

  // a halving can be taken out of the joint map or out of any one untouched line; take them from the map
  while (s.halvings > 0 && [...s.joint.values()].every(z => z[0] % 2n === 0n && z[1] % 2n === 0n)) {
    s = { ...s, joint: new Map([...s.joint].map(([k, z]) => [k, [z[0] / 2n, z[1] / 2n] as Eisenstein])), halvings: s.halvings - 1 }
  }

  for (let l = 0; l < s.free.length; l++) {
    if (s.touched.includes(l)) {
      continue
    }

    while (s.halvings > 0 && (s.free[l] ?? []).every(z => z[0] % 2n === 0n && z[1] % 2n === 0n)) {
      s = { ...s, free: s.free.map((v, i) => (i === l ? v.map(z => [z[0] / 2n, z[1] / 2n] as Eisenstein) : v)), halvings: s.halvings - 1 }
    }
  }

  return s
}

// the joint map over the given lines (touched lines first, then the rest in order), a full expansion
export function expandDock(state: DockState, lines: readonly number[]): Map<number, Eisenstein> {
  let s = state

  for (const l of lines) {
    if (!s.touched.includes(l)) {
      s = touch(s, l)
    }
  }

  const order = lines.map(l => s.touched.indexOf(l))
  const out = new Map<number, Eisenstein>()

  for (const [key, z] of s.joint) {
    let k = 0

    order.forEach((p, i) => {
      k += digit(key, p) * (POW9[i] ?? 1)
    })

    out.set(k, z)
  }

  return out
}

// the norm of every untouched line and the total, 4^halvings when exact
export function dockNorm(state: DockState): bigint {
  let total = 0n

  for (const z of state.joint.values()) {
    total += norm(z)
  }

  state.free.forEach((v, l) => {
    if (!state.touched.includes(l)) {
      total *= v.reduce((s, z) => s + norm(z), 0n)
    }
  })

  return total
}

// the expected vibe on every slot, sum q |amplitude|^2, over 4^halvings
export function dockProfile(state: DockState, lines: readonly (readonly [number, number])[], slots: number): bigint[] {
  const out = new Array<bigint>(slots).fill(0n)
  const freeNorm = state.free.map((v, l) => (state.touched.includes(l) ? 1n : v.reduce((s, z) => s + norm(z), 0n)))
  const jointNorm = [...state.joint.values()].reduce((s, z) => s + norm(z), 0n)
  const allFree = freeNorm.reduce((a, b) => a * b, 1n)

  lines.forEach(([first, second], l) => {
    const at2 = state.touched.indexOf(l)
    let q0 = 0n
    let q1 = 0n

    if (at2 >= 0) {
      for (const [key, z] of state.joint) {
        const [a, b] = stateOf(digit(key, at2))

        q0 += BigInt(a) * norm(z)
        q1 += BigInt(b) * norm(z)
      }

      q0 *= allFree
      q1 *= allFree
    } else {
      const others = allFree / (freeNorm[l] ?? 1n)

      ;(state.free[l] ?? []).forEach((z, k) => {
        const [a, b] = stateOf(k)

        q0 += BigInt(a) * norm(z)
        q1 += BigInt(b) * norm(z)
      })

      q0 *= jointNorm * others
      q1 *= jointNorm * others
    }

    out[first] = (out[first] ?? 0n) + q0
    out[second] = (out[second] ?? 0n) + q1
  })

  return out
}

// twice the real part of sum over configurations of conj(A) B q_s, the two states expanded on the union of
// their touched lines, the untouched lines equal in both (they ran the same clocks from calm)
export function dockCross(a: DockState, b: DockState, lines: readonly (readonly [number, number])[], slots: number): bigint[] {
  const union = [...new Set([...a.touched, ...b.touched])]
  const h = Math.max(a.halvings, b.halvings)
  const ea = expandDock(a, union)
  const eb = expandDock(b, union)
  const sa = 2n ** BigInt(h - a.halvings)
  const sb = 2n ** BigInt(h - b.halvings)
  const out = new Array<bigint>(slots).fill(0n)
  // conj(z) w for Eisenstein integers; conj(m + n omega) = (m - n) - n omega; twice the real part of
  // m + n omega is 2 m - n
  const conjTimes = (z: Eisenstein, w: Eisenstein): Eisenstein => times([z[0] - z[1], -z[1]], w)
  const twiceReal = (z: Eisenstein): bigint => 2n * z[0] - z[1]
  // outside the union each line is a free vector in both states: its overlap, and its overlap weighted by
  // each of its two slots' vibes
  const rest = lines.map((_, l) => l).filter(l => !union.includes(l))
  const restOverlap = new Map<number, Eisenstein>()
  const restVibe = new Map<number, [Eisenstein, Eisenstein]>()

  for (const l of rest) {
    let overlap: Eisenstein = ZERO
    let q0: Eisenstein = ZERO
    let q1: Eisenstein = ZERO

    ;(a.free[l] ?? []).forEach((za, k) => {
      const c = conjTimes(za, b.free[l]?.[k] ?? ZERO)
      const [x, y] = stateOf(k)

      overlap = plus(overlap, c)
      q0 = plus(q0, [BigInt(x) * c[0], BigInt(x) * c[1]])
      q1 = plus(q1, [BigInt(y) * c[0], BigInt(y) * c[1]])
    })

    restOverlap.set(l, overlap)
    restVibe.set(l, [q0, q1])
  }

  // over the union's configurations: the overlap, and the overlap weighted by each union slot's vibe
  let unionOverlap: Eisenstein = ZERO
  const unionVibe = new Map<number, [Eisenstein, Eisenstein]>(union.map(l => [l, [ZERO, ZERO]]))

  for (const [key, za0] of ea) {
    const zb0 = eb.get(key)

    if (!zb0) {
      continue
    }

    const c = conjTimes([za0[0] * sa, za0[1] * sa], [zb0[0] * sb, zb0[1] * sb])

    unionOverlap = plus(unionOverlap, c)
    union.forEach((l, i) => {
      const [x, y] = stateOf(digit(key, i))
      const q = unionVibe.get(l) ?? [ZERO, ZERO]

      unionVibe.set(l, [plus(q[0], [BigInt(x) * c[0], BigInt(x) * c[1]]), plus(q[1], [BigInt(y) * c[0], BigInt(y) * c[1]])])
    })
  }

  const productOver = (skip: number): Eisenstein => rest.filter(m => m !== skip).reduce((acc, m) => times(acc, restOverlap.get(m) ?? ZERO), [1n, 0n] as Eisenstein)

  for (const l of union) {
    const q = unionVibe.get(l) ?? [ZERO, ZERO]
    const others = productOver(-1)
    const [first, second] = lines[l] ?? [0, 0]

    out[first] = (out[first] ?? 0n) + twiceReal(times(q[0], others))
    out[second] = (out[second] ?? 0n) + twiceReal(times(q[1], others))
  }

  for (const l of rest) {
    const q = restVibe.get(l) ?? [ZERO, ZERO]
    const others = times(unionOverlap, productOver(l))
    const [first, second] = lines[l] ?? [0, 0]

    out[first] = (out[first] ?? 0n) + twiceReal(times(q[0], others))
    out[second] = (out[second] ?? 0n) + twiceReal(times(q[1], others))
  }

  return out
}
