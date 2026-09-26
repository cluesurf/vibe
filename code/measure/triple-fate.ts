// The fate of a seed under any scheduled dock knit, on the unbounded D4 lattice, read in the bulk and on the husk.
//
// The classification of E-FRC-0171 (test/experiment/gauge/rishon-dynamics), made general in the knit and its
// period and extended with a husk reading, so a knit other than the committed and combined ones (the triality
// weave, period 6) can be asked the same question on the same instrument.
//
// A seed is run by the difference engine (code/compute/difference-engine) for `periods` recurrence periods or
// until `cap` docks differ from the vacuum. The recurrence period must be a multiple of the knit's schedule and
// of its vacuum's period, so that the rule and the vacuum both repeat; vacuumPeriod finds the least one. At
// beat 0 and after every period the difference's signature up to a shift is recorded; a repeat is an exact
// recurrence, a particle forever. Otherwise:
//   dressing  the cap is hit, or the support at the last period is over 1.5 times that at the middle and over
//             16 docks
//   split     bounded, in two or more pieces (docks one root apart are joined)
//   bound     bounded, one piece, no exact recurrence yet
//   gone      nothing differs;  vacuum: nothing ever differed
//
// The husk reading. The husk is the shadow of the bulk along the depth e4 (code/measure/photon-husk): a dock at
// D4 vector (x1, x2, x3, x4) sits over the husk dock (x1, x2, x3). A particle's husk velocity is the first three
// components of its recurrence shift over the beats, its bulk velocity the whole shift; the husk support is the
// number of husk docks under the differing bulk docks. The husk charge is the column sum of love minus fear,
// which the knit conserves, so a seed of love minus fear 3 keeps a husk charge of one whole.

import { type Collision } from '@/code/rule/collision'
import { DifferenceOverflow, makeDifferenceEngine, ROOT_STEPS } from '@/code/compute/difference-engine'
import { d4Vector } from '@/code/substrate/d4-box'

export type Fate = {
  readonly cls: 'particle' | 'split' | 'bound' | 'dressing' | 'gone' | 'vacuum'
  // bulk speed |shift| / beats / sqrt 2 (1 is a vibe streaming along a root), and the husk speed |husk shift| /
  // beats (a root casts a husk step of length 1 or sqrt 2); -1 unless a particle
  readonly bulkSpeed: number
  readonly huskSpeed: number
  readonly recurEvery: number
  // bulk docks differing after each period
  readonly docks: number[]
  readonly slots: number
  readonly pieces: number
  // husk docks under the differing bulk docks at the end
  readonly huskDocks: number
  // love minus fear over every differing slot at the end, relative to the vacuum
  readonly charge: number
}

// the least T, a multiple of `schedule`, with the vacuum's dock state at beat T equal to that at beat 0
export function vacuumPeriod(input: { forward: (t: number) => Collision; schedule: number; limit: number }): number {
  const engine = makeDifferenceEngine({ forward: input.forward, maxDocks: 16 })
  const start = engine.vacuum(0)

  for (let t = input.schedule; t <= input.limit; t += input.schedule) {
    const v = engine.vacuum(t)

    if (v.every((x, k) => x === start[k])) {
      return t
    }
  }

  return -1
}

// connected pieces of a set of docks, two docks joined when one root apart
export function pieceCount(coords: readonly (readonly number[])[]): number {
  const key = (c: readonly number[]): string => c.join(',')
  const left = new Set(coords.map(key))
  let count = 0

  for (const c of coords) {
    if (!left.has(key(c))) {
      continue
    }

    count += 1
    left.delete(key(c))

    const stack = [c]

    while (stack.length > 0) {
      const x = stack.pop() ?? []

      for (const s of ROOT_STEPS) {
        const y = x.map((v, i) => v + (s[i] ?? 0))

        if (left.has(key(y))) {
          left.delete(key(y))
          stack.push(y)
        }
      }
    }
  }

  return count
}

export function followSeed(input: {
  forward: (t: number) => Collision
  state: Int8Array
  period: number
  periods: number
  cap: number
}): Fate {
  const { forward, state, period, periods, cap } = input
  const engine = makeDifferenceEngine({ forward, maxDocks: cap })

  engine.set([0, 0, 0, 0], state)

  const seen = new Map<string, { beat: number; anchor: number[] }>()
  const docks: number[] = []
  let everDiffered = engine.support().slots > 0

  const reading = (): { coords: number[][]; huskDocks: number; charge: number } => {
    const coords: number[][] = []
    const columns = new Set<string>()
    let charge = 0
    const vacuum = engine.vacuum(engine.beat())

    engine.forEach((c, s) => {
      coords.push([...c])

      const v = d4Vector([...c])

      columns.add(`${v[0]},${v[1]},${v[2]}`)

      for (let k = 0; k < 24; k++) {
        charge += (s[k] ?? 0) - (vacuum[k] ?? 0)
      }
    })

    return { coords, huskDocks: columns.size, charge }
  }

  const record = (): Fate | undefined => {
    const s = engine.support()

    if (s.docks === 0 || s.docks > cap) {
      return undefined
    }

    const sig = engine.signature()
    const before = seen.get(sig.key)

    if (before) {
      const beats = engine.beat() - before.beat
      const shift = d4Vector(sig.anchor.map((x, k) => x - (before.anchor[k] ?? 0)))
      const r = reading()

      return {
        cls: 'particle',
        bulkSpeed: Number((Math.hypot(...shift) / beats / Math.SQRT2).toFixed(6)),
        huskSpeed: Number((Math.hypot(shift[0] ?? 0, shift[1] ?? 0, shift[2] ?? 0) / beats).toFixed(6)),
        recurEvery: beats,
        docks,
        slots: s.slots,
        pieces: pieceCount(r.coords),
        huskDocks: r.huskDocks,
        charge: r.charge,
      }
    }

    seen.set(sig.key, { beat: engine.beat(), anchor: sig.anchor })

    return undefined
  }

  if (state.some(x => x !== 0)) {
    record()
  }

  try {
    for (let p = 0; p < periods; p++) {
      for (let t = 0; t < period; t++) {
        engine.step()
        everDiffered = everDiffered || engine.support().slots > 0
      }

      docks.push(engine.support().docks)

      const found = record()

      if (found) {
        return found
      }
    }
  } catch (error) {
    if (!(error instanceof DifferenceOverflow)) {
      throw error
    }

    return { cls: 'dressing', bulkSpeed: -1, huskSpeed: -1, recurEvery: -1, docks, slots: -1, pieces: -1, huskDocks: -1, charge: Number.NaN }
  }

  const s = engine.support()
  const r = reading()
  const base = { bulkSpeed: -1, huskSpeed: -1, recurEvery: -1, docks, huskDocks: r.huskDocks, charge: r.charge }

  if (!everDiffered) {
    return { ...base, cls: 'vacuum', slots: 0, pieces: 0 }
  }

  if (s.slots === 0) {
    return { ...base, cls: 'gone', slots: 0, pieces: 0 }
  }

  const last = docks[periods - 1] ?? 0
  const middle = docks[Math.floor(periods / 2) - 1] ?? 0
  const count = pieceCount(r.coords)

  if (last > 16 && last > 1.5 * middle) {
    return { ...base, cls: 'dressing', slots: s.slots, pieces: count }
  }

  return { ...base, cls: count >= 2 ? 'split' : 'bound', slots: s.slots, pieces: count }
}
