// A colour qutrit carried on the committed rule's own excitations, the smallest place a phase could enter.
//
// The committed collision creates and annihilates tones (the vacuum clock (0,0) -> (1,-1) -> (-1,1) ->
// (0,0) on every line), so a colour label glued to a tone has no well-defined carrier: at a flip or an
// annihilation there is no fact about which tone went where. What the rule does preserve exactly is an
// EXCITATION: a start that differs from the vacuum in one slot, whose run differs from the vacuum's run
// in exactly one slot at every beat. That slot is a world line the rule defines, with nothing added.
// When several excitations superpose exactly (the joint run equals the vacuum run with each single
// excitation's one slot written in), their world lines survive every encounter, and a colour qutrit
// riding each one is well defined for as long as that holds. Both conditions are checked beat by beat.
//
// A collision event is a beat at which two excitations sit in the same cell when the collision acts.
// At each event the colour pair gets the colour-symmetric unitary U(phi) = P_sym + e^{i phi} P_anti of
// E-FRC-0100 (code/measure/colour-symmetry), applied to the two carriers' qutrits. Nothing feeds back:
// the tones never read the colour.

import { Will, makeWill } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { Operator } from '@/code/measure/colour-symmetry'

export type Seed = {
  readonly tone: -1 | 1
  readonly direction: number
  readonly cell: number
}

function runSeeds(input: {
  mesh: Mesh
  schedule: (beatIndex: number) => Collision
  seeds: readonly Seed[]
  beats: number
}): Will[] {
  const { mesh, schedule, seeds, beats } = input

  let will = makeWill(mesh)

  for (const seed of seeds) {
    will.data[seed.cell * mesh.degree + seed.direction] = seed.tone
  }

  const out = [will]

  for (let t = 0; t < beats; t++) {
    will = beat({ mesh, data: will.data.slice() }, schedule(t))
    out.push(will)
  }

  return out
}

// The slots where two wills differ.
function differences(a: Will, b: Will): number[] {
  const out: number[] = []

  for (let i = 0; i < a.data.length; i++) {
    if (a.data[i] !== b.data[i]) {
      out.push(i)
    }
  }

  return out
}

// Every (tone, direction) whose lone start from cell zero differs from the vacuum run in exactly one
// slot at every beat 0..beats: the species whose world line the rule preserves.
export function supportOneSpecies(input: {
  mesh: Mesh
  schedule: (beatIndex: number) => Collision
  beats: number
}): Seed[] {
  const { mesh, schedule, beats } = input
  const vacuum = runSeeds({ mesh, schedule, seeds: [], beats })
  const found: Seed[] = []

  for (const tone of [1, -1] as const) {
    for (let direction = 0; direction < mesh.degree; direction++) {
      const run = runSeeds({
        mesh,
        schedule,
        seeds: [{ tone, direction, cell: 0 }],
        beats,
      })

      if (
        run.every(
          (will, t) =>
            differences(will, vacuum[t] ?? will).length === 1,
        )
      ) {
        found.push({ tone, direction, cell: 0 })
      }
    }
  }

  return found
}

export type WorldLines = {
  // slot of each excitation at each beat 0..beats (-1 where it is not a single slot)
  readonly slots: number[][]
  // every excitation differs from the vacuum in exactly one slot at every beat
  readonly supportOne: boolean
  // the joint run equals the vacuum run with each excitation's slot written in, at every beat
  readonly superposes: boolean
  // slots where the joint run disagrees with that superposition, summed over beats
  readonly superpositionDefects: number
  // collision events: beats at which two excitations share a cell, in time order
  readonly events: { beat: number; first: number; second: number }[]
}

export function excitationWorldLines(input: {
  mesh: Mesh
  schedule: (beatIndex: number) => Collision
  seeds: readonly Seed[]
  beats: number
}): WorldLines {
  const { mesh, schedule, seeds, beats } = input
  const vacuum = runSeeds({ mesh, schedule, seeds: [], beats })
  const singles = seeds.map(seed =>
    runSeeds({ mesh, schedule, seeds: [seed], beats }),
  )
  const joint = runSeeds({ mesh, schedule, seeds, beats })
  const slots = seeds.map(() => [] as number[])
  const events: { beat: number; first: number; second: number }[] = []

  let supportOne = true
  let superpositionDefects = 0

  for (let t = 0; t <= beats; t++) {
    const empty = vacuum[t] ?? makeWill(mesh)
    const expected = empty.data.slice()

    singles.forEach((single, k) => {
      const diff = differences(single[t] ?? empty, empty)

      if (diff.length !== 1) {
        supportOne = false
        slots[k]?.push(-1)

        return
      }

      const slot = diff[0] ?? 0

      slots[k]?.push(slot)
      expected[slot] = single[t]?.data[slot] ?? 0
    })

    const actual = joint[t] ?? empty

    for (let i = 0; i < expected.length; i++) {
      if (actual.data[i] !== expected[i]) {
        superpositionDefects++
      }
    }

    for (let a = 0; a < seeds.length; a++) {
      for (let b = a + 1; b < seeds.length; b++) {
        const sa = slots[a]?.[t] ?? -1
        const sb = slots[b]?.[t] ?? -1

        if (
          sa >= 0 &&
          sb >= 0 &&
          Math.floor(sa / mesh.degree) === Math.floor(sb / mesh.degree)
        ) {
          events.push({ beat: t, first: a, second: b })
        }
      }
    }
  }

  return {
    slots,
    supportOne,
    superposes: superpositionDefects === 0,
    superpositionDefects,
    events,
  }
}

export type ColourState = {
  readonly re: Float64Array
  readonly im: Float64Array
}

// A product basis state of k qutrits, slot 0 the least significant digit.
export function colourBasisState(input: {
  colours: readonly number[]
  d: number
}): ColourState {
  const { colours, d } = input
  const size = d ** colours.length
  const re = new Float64Array(size)

  re[colours.reduce((sum, c, slot) => sum + c * d ** slot, 0)] = 1

  return { re, im: new Float64Array(size) }
}

// Apply a two-slot operator (d^2 by d^2, slot i the less significant digit) to slots i and j of a
// k-slot state.
export function applyPairOperator(input: {
  state: ColourState
  operator: Operator
  d: number
  i: number
  j: number
}): ColourState {
  const { state, operator, d, i, j } = input
  const size = state.re.length
  const re = new Float64Array(size)
  const im = new Float64Array(size)
  const pi = d ** i
  const pj = d ** j
  const n = d * d

  for (let s = 0; s < size; s++) {
    const xr = state.re[s] ?? 0
    const xi = state.im[s] ?? 0

    if (xr === 0 && xi === 0) {
      continue
    }

    const di = Math.floor(s / pi) % d
    const dj = Math.floor(s / pj) % d
    const rest = s - di * pi - dj * pj
    const column = di + d * dj

    for (let row = 0; row < n; row++) {
      const ur = operator.re[row * n + column] ?? 0
      const ui = operator.im[row * n + column] ?? 0

      if (ur === 0 && ui === 0) {
        continue
      }

      const target = rest + (row % d) * pi + Math.floor(row / d) * pj

      re[target] = (re[target] ?? 0) + ur * xr - ui * xi
      im[target] = (im[target] ?? 0) + ur * xi + ui * xr
    }
  }

  return { re, im }
}

// The probability that qutrit `slot` holds colour `colour`.
export function colourProbability(input: {
  state: ColourState
  d: number
  slot: number
  colour: number
}): number {
  const { state, d, slot, colour } = input
  const place = d ** slot

  let total = 0

  for (let s = 0; s < state.re.length; s++) {
    if (Math.floor(s / place) % d === colour) {
      total += (state.re[s] ?? 0) ** 2 + (state.im[s] ?? 0) ** 2
    }
  }

  return total
}

// The purity Tr rho^2 of one qutrit's reduced density matrix, 1 for a product state, 1 / d at most mixed.
export function reducedPurity(input: {
  state: ColourState
  d: number
  slot: number
}): number {
  const { state, d, slot } = input
  const place = d ** slot
  const rhoRe = new Float64Array(d * d)
  const rhoIm = new Float64Array(d * d)

  for (let s = 0; s < state.re.length; s++) {
    const a = Math.floor(s / place) % d
    const rest = s - a * place

    for (let b = 0; b < d; b++) {
      const t = rest + b * place
      const xr = state.re[s] ?? 0
      const xi = state.im[s] ?? 0
      const yr = state.re[t] ?? 0
      const yi = state.im[t] ?? 0

      // rho[a][b] += x_s conj(x_t)
      rhoRe[a * d + b] = (rhoRe[a * d + b] ?? 0) + xr * yr + xi * yi
      rhoIm[a * d + b] = (rhoIm[a * d + b] ?? 0) + xi * yr - xr * yi
    }
  }

  let purity = 0

  for (let k = 0; k < d * d; k++) {
    purity += (rhoRe[k] ?? 0) ** 2 + (rhoIm[k] ?? 0) ** 2
  }

  return purity
}

// <state| operator |state>, real part.
export function expectation(input: {
  state: ColourState
  operator: Operator
}): number {
  const { state, operator } = input
  const n = operator.size

  let total = 0

  for (let r = 0; r < n; r++) {
    let yr = 0
    let yi = 0

    for (let c = 0; c < n; c++) {
      const ar = operator.re[r * n + c] ?? 0
      const ai = operator.im[r * n + c] ?? 0
      const xr = state.re[c] ?? 0
      const xi = state.im[c] ?? 0

      yr += ar * xr - ai * xi
      yi += ar * xi + ai * xr
    }

    total += (state.re[r] ?? 0) * yr + (state.im[r] ?? 0) * yi
  }

  return total
}

// The classical control: at each event the two carriers exchange colours with probability
// sin^2(phi / 2), the stochastic mixture of the two classical points with U(phi)'s one-event swap
// probability. Returns the probability that `slot` ends holding its colour `colour`, exactly, over the
// k! colour assignments.
export function classicalColourProbability(input: {
  events: readonly { first: number; second: number }[]
  swapProbability: number
  colours: readonly number[]
  slot: number
  colour: number
}): number {
  const { events, swapProbability, colours, slot, colour } = input

  let distribution = new Map<string, number>([[colours.join(','), 1]])

  for (const { first, second } of events) {
    const next = new Map<string, number>()

    for (const [key, weight] of distribution) {
      const assignment = key.split(',').map(Number)
      const swapped = assignment.slice()

      swapped[first] = assignment[second] ?? 0
      swapped[second] = assignment[first] ?? 0

      const keep = assignment.join(',')
      const swap = swapped.join(',')

      next.set(
        keep,
        (next.get(keep) ?? 0) + weight * (1 - swapProbability),
      )
      next.set(swap, (next.get(swap) ?? 0) + weight * swapProbability)
    }

    distribution = next
  }

  let total = 0

  for (const [key, weight] of distribution) {
    if (Number(key.split(',')[slot]) === colour) {
      total += weight
    }
  }

  return total
}
