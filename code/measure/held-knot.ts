// A static knot on the adopted knit, held in place by a reflecting surface, and the readers for its entropic force
// (E-GRV-0056, E-GRV-0057).
//
// THE KNIT. The coset-union vacuum under the lone bounce collision, run by the bounce kernel, exactly as the second-law
// files run it (code/measure/second-law-husk, E-FND-0146). This file changes nothing in the kernel's collision; it builds
// a second STREAM permutation with a knot in it, and that stream's exact inverse.
//
// THE KNOT. A ball of husk columns (min-image Euclidean distance to the center column at most R), taken at full depth, so
// on the husk it is a ball and in the bulk a cylinder along the depth. It is HELD: the knot's own slots never stream and
// its docks never collide, so every trit and role point inside it is the same at every beat. A slot outside whose stream
// would enter the knot is REFLECTED instead: it takes the opposite root at its own dock (bounce back). The map is a
// permutation of the slots (checked on build): the reflected slot (x, -d) is the one slot whose normal preimage
// (x - d, -d) is a knot slot, which stays put. So the rule with the knot is still a bijection with an exact inverse.
//
// WHY THIS IS THE ONLY WAY TO HOLD A KNOT REVERSIBLY. The knit cannot bind (E-SPN-0067: two vibes cost exactly 2 over
// the vacuum at every separation), so no lump holds itself. A surface that lets vibes in but not out is a one-way valve
// and is not a bijection (two slots would stream into one). A held lump on a reversible local rule is therefore a closed
// surface both ways, and its interior is invisible from outside: the collision is per dock and the stream crosses no
// surface. That is a theorem of this construction, and the experiment checks it bit for bit (the outside is the same
// whether the knot holds a dense lump or nothing).
//
// NO ROUNDING in the rule: permutations of trits and integer points by grid-move tables. Reals only in the readers.
// DETERMINISM: every fill is a Weyl sequence (golden and silver rates). NOTHING MOVES: the stream copies each vibe one
// dock along its root, and a reflected vibe takes the opposite slot of its own dock.

import { OPPOSITE } from '@/code/rule/isometric-knit'
import { coinMove, pairMove } from '@/code/measure/bounce-pair-kernel'
import {
  cloneReduced,
  sameReduced,
  type Reduced,
} from '@/code/measure/living-pair-kernel'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  arrowBox,
  chargeOf,
  energyOf,
  vacuumState,
  type ArrowBox,
} from '@/code/measure/second-law-husk'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const frac = (x: number): number => x - Math.floor(x)

// the min-image signed offset on a ring of `side`
export function ring(d: number, side: number): number {
  const m = ((d % side) + side) % side

  return m > side / 2 ? m - side : m
}

// husk coordinates of a column index (column = a + side b + side^2 z, as in arrowBox)
export function columnPosition(
  column: number,
  side: number,
): [number, number, number] {
  return [
    column % side,
    Math.floor(column / side) % side,
    Math.floor(column / (side * side)),
  ]
}

export type KnotStream = {
  readonly box: ArrowBox
  // per dock: 1 if the dock is held (inside the knot)
  readonly held: Uint8Array
  // per husk column: 1 if in the knot
  readonly knotColumn: Uint8Array
  readonly radius: number
  readonly center: readonly [number, number, number]
  // per slot: where its vibe goes, and 1 if its point moves by the kernel's grid move (0: a reflected or held slot keeps it)
  readonly target: Int32Array
  readonly moves: Uint8Array
  // per slot: the slot whose vibe arrives here
  readonly source: Int32Array
  readonly reflected: number
}

// the stream with a knot of husk radius `radius` at husk column `center`; radius < 0 is no knot (the plain stream)
export function knotStream(
  box: ArrowBox,
  radius: number,
  center: readonly [number, number, number],
): KnotStream {
  const side = box.side
  const knotColumn = new Uint8Array(side ** 3)

  if (radius >= 0) {
    for (let c = 0; c < knotColumn.length; c++) {
      const p = columnPosition(c, side)
      const d2 = p.reduce(
        (acc, x, i) => acc + ring(x - center[i]!, side) ** 2,
        0,
      )

      if (d2 <= radius * radius) {
        knotColumn[c] = 1
      }
    }
  }

  const held = Uint8Array.from(box.column, c => knotColumn[c]!)
  const slots = box.cells * 24
  const target = new Int32Array(slots)
  const moves = new Uint8Array(slots)

  let reflected = 0

  for (let slot = 0; slot < slots; slot++) {
    const x = Math.floor(slot / 24)
    const d = slot % 24
    const to = box.kernel.target[slot]!

    if (held[x]) {
      target[slot] = slot
    } else if (held[Math.floor(to / 24)]) {
      target[slot] = x * 24 + OPPOSITE[d]!
      reflected++
    } else {
      target[slot] = to
      moves[slot] = 1
    }
  }

  const source = new Int32Array(slots).fill(-1)

  for (let slot = 0; slot < slots; slot++) {
    const to = target[slot]!

    if (source[to] !== -1) {
      throw new Error('the knot stream is not a permutation')
    }

    source[to] = slot
  }

  return {
    box,
    held,
    knotColumn,
    radius,
    center,
    target,
    moves,
    source,
    reflected,
  }
}

// beat t forward, s into next: collide every dock outside the knot, then stream
export function knotBeat(
  k: KnotStream,
  s: Reduced,
  next: Reduced,
  t: number,
): void {
  const kernel = k.box.kernel
  const order = collisionOrder(kernel.schedule, t)

  for (let x = 0; x < k.box.cells; x++) {
    if (k.held[x]) {
      continue
    }

    for (const piece of order) {
      if (piece === 'P') {
        pairMove(kernel, s, x)
      } else {
        coinMove(kernel, s, x)
      }
    }
  }

  next.vibe.fill(0)

  for (let slot = 0; slot < s.vibe.length; slot++) {
    const v = s.vibe[slot]!

    if (v === 0) {
      continue
    }

    const to = k.target[slot]!

    next.vibe[to] = v
    next.point[to] = k.moves[slot]
      ? kernel.move[slot]![s.point[slot]!]!
      : s.point[slot]!
  }

  next.store.set(s.store)
  next.spoint.set(s.spoint)
}

// the exact inverse of beat t: undo the stream, then undo the collision pieces in the other order (each its own inverse)
export function knotBeatBack(
  k: KnotStream,
  s: Reduced,
  prev: Reduced,
  t: number,
): void {
  const kernel = k.box.kernel

  prev.vibe.fill(0)

  for (let to = 0; to < s.vibe.length; to++) {
    const v = s.vibe[to]!

    if (v === 0) {
      continue
    }

    const from = k.source[to]!

    prev.vibe[from] = v
    prev.point[from] = k.moves[from]
      ? k.box.inverseMove[from]![s.point[to]!]!
      : s.point[to]!
  }

  prev.store.set(s.store)
  prev.spoint.set(s.spoint)

  const order = collisionOrder(kernel.schedule, t)

  for (let x = 0; x < k.box.cells; x++) {
    if (k.held[x]) {
      continue
    }

    for (let i = order.length - 1; i >= 0; i--) {
      if (order[i] === 'P') {
        pairMove(kernel, prev, x)
      } else {
        coinMove(kernel, prev, x)
      }
    }
  }
}

export type KnotRunner = {
  state: () => Reduced
  time: () => number
  forward: () => void
  backward: () => void
}

export function knotRunner(
  k: KnotStream,
  start: Reduced,
  time = 0,
): KnotRunner {
  let a = cloneReduced(start)
  let b = cloneReduced(start)
  let t = time

  const swap = (): void => {
    const c = a

    a = b
    b = c
  }

  return {
    state: () => a,
    time: () => t,
    forward: () => {
      knotBeat(k, a, b, t)
      t++
      swap()
    },
    backward: () => {
      knotBeatBack(k, a, b, t - 1)
      t--
      swap()
    },
  }
}

// ---- fills (Weyl, no draw) ----

// the Weyl values of a slot for fill `phase` and stream `rate` (0 the background gas, 1 the test blob, 2 the lump)
function weylOf(
  slot: number,
  phase: number,
  rate: number,
): { occupy: number; sign: number; point: number } {
  const n = slot + 1

  return {
    occupy: frac(n * GOLDEN + phase * SILVER + rate * GOLDEN * SILVER),
    sign: frac(n * SILVER + phase * GOLDEN + rate * SILVER * SILVER),
    point: frac(
      n * (GOLDEN + SILVER) + phase * GOLDEN * GOLDEN + rate * GOLDEN,
    ),
  }
}

// THE START. The vacuum (its stores), then on every dock outside the knot a background gas: each slot held when its Weyl
// value falls below perDock / 24, love or fear by a second Weyl value, a role point (of 9) by a third. Inside the knot a
// dense lump (every slot held, love or fear by the second Weyl value) when `lump` is true, or nothing. The store is the
// vacuum's everywhere.
export function knotStart(
  k: KnotStream,
  input: { perDock: number; phase: number; lump: boolean },
): Reduced {
  const s = vacuumState(k.box)
  const cut = input.perDock / 24

  for (let slot = 0; slot < s.vibe.length; slot++) {
    const x = Math.floor(slot / 24)
    const w = weylOf(slot, input.phase, k.held[x] ? 2 : 0)

    if (k.held[x] ? !input.lump : w.occupy >= cut) {
      continue
    }

    s.vibe[slot] = w.sign < 0.5 ? 1 : -1
    s.point[slot] = Math.floor(9 * w.point)
  }

  return s
}

// THE TEST BLOB: on the docks of the husk columns within distance 1 of `at` (7 columns, full depth), each CALM slot is
// filled when its Weyl value (the blob's own rate) falls below perDock / 24. Returns a new state (the input is unchanged).
export function addBlob(
  k: KnotStream,
  s: Reduced,
  input: {
    at: readonly [number, number, number]
    perDock: number
    phase: number
  },
): Reduced {
  const out = cloneReduced(s)
  const side = k.box.side
  const cut = input.perDock / 24

  let added = 0

  for (let x = 0; x < k.box.cells; x++) {
    const p = columnPosition(k.box.column[x]!, side)
    const d2 = p.reduce(
      (acc, v, i) => acc + ring(v - input.at[i]!, side) ** 2,
      0,
    )

    if (d2 > 1) {
      continue
    }

    if (k.held[x]) {
      throw new Error('the blob overlaps the knot')
    }

    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d

      if (out.vibe[slot] !== 0) {
        continue
      }

      const w = weylOf(slot, input.phase, 1)

      if (w.occupy >= cut) {
        continue
      }

      out.vibe[slot] = w.sign < 0.5 ? 1 : -1
      out.point[slot] = Math.floor(9 * w.point)
      added++
    }
  }

  if (added === 0) {
    throw new Error('the blob is empty')
  }

  return out
}

// ---- readers (measurement; reals allowed) ----

// the knit's conserved energy (held slots + 2 per stored unit) per husk column, into out (length side^3)
export function columnEnergy(
  box: ArrowBox,
  s: Reduced,
  out: Float64Array,
): void {
  out.fill(0)

  for (let x = 0; x < box.cells; x++) {
    let e = 0

    for (let d = 0; d < 24; d++) {
      if (s.vibe[x * 24 + d] !== 0) {
        e++
      }
    }

    for (let l = 0; l < 12; l++) {
      if (s.store[x * 12 + l] !== 0) {
        e += 2
      }
    }

    out[box.column[x]!] = out[box.column[x]!]! + e
  }
}

// per husk column the slot trit tallies (love, fear, calm) and store trit tallies, added into the accumulators
export function columnTrits(
  box: ArrowBox,
  s: Reduced,
  slot: Float64Array,
  store: Float64Array,
): void {
  for (let x = 0; x < box.cells; x++) {
    const c = box.column[x]!

    for (let d = 0; d < 24; d++) {
      const v = s.vibe[x * 24 + d]!
      const i = c * 3 + (v > 0 ? 0 : v < 0 ? 1 : 2)

      slot[i] = slot[i]! + 1
    }

    for (let l = 0; l < 12; l++) {
      const v = s.store[x * 12 + l]!
      const i = c * 3 + (v > 0 ? 0 : v < 0 ? 1 : 2)

      store[i] = store[i]! + 1
    }
  }
}

// the shell index of every husk column: the rounded min-image distance to the center (a READER's binning, not the rule)
export function shellOf(k: KnotStream): Int32Array {
  const side = k.box.side

  return Int32Array.from({ length: side ** 3 }, (_, c) => {
    const p = columnPosition(c, side)

    return Math.round(
      Math.sqrt(
        p.reduce(
          (acc, x, i) => acc + ring(x - k.center[i]!, side) ** 2,
          0,
        ),
      ),
    )
  })
}

// the three-valued entropy of a tally (a, b, c), per trit
export function tritEntropy(a: number, b: number, c: number): number {
  const n = a + b + c

  let h = 0

  for (const v of [a, b, c]) {
    if (v > 0) {
      h -= (v / n) * Math.log(v / n)
    }
  }

  return h
}

// the displacement toward the knot of an excess-energy field (per column), measured from the blob's start column `at`
// along the unit axis `toward` (min image around `at`), divided by the total excess
export function towardKnot(
  excess: Float64Array,
  side: number,
  at: readonly [number, number, number],
  toward: readonly [number, number, number],
): { shift: number; total: number } {
  let m = 0
  let total = 0

  for (let c = 0; c < excess.length; c++) {
    const e = excess[c]!

    if (e === 0) {
      continue
    }

    const p = columnPosition(c, side)

    let proj = 0

    for (let i = 0; i < 3; i++) {
      proj += ring(p[i]! - at[i]!, side) * toward[i]!
    }

    m += e * proj
    total += e
  }

  return { shift: m / total, total }
}

// ---- the survey shared by E-GRV-0056 and E-GRV-0057 (run once per process, memoized) ----

export type SurveySettings = {
  readonly side: number
  readonly radius: number
  readonly gasPerDock: number
  readonly blobPerDock: number
  readonly distances: readonly number[]
  readonly axes: readonly (readonly [number, number, number])[]
  readonly drift: number
  readonly settle: number
  readonly window: number
  readonly offsets: number
  readonly shells: readonly number[]
}

// fixed before the first run of either file
export const SURVEY: SurveySettings = {
  side: 24,
  radius: 2,
  gasPerDock: 8,
  blobPerDock: 4,
  distances: [4, 5, 6, 7, 8],
  axes: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  drift: 8,
  settle: 48,
  window: 24,
  offsets: 16,
  shells: [3, 4, 5, 6, 7, 8, 9, 10],
}

export type Config = 'knot' | 'none'
export type Direction = 'forward' | 'backward'
export type ShellProfile = {
  energyPerDock: number[]
  slotEntropy: number[]
}

export type SurveyMember = {
  name: string
  profile: Record<Config, Record<Direction, ShellProfile>>
  // [distance index][axis index]: the blob's displacement toward the knot after `drift` beats
  toward: Record<Config, Record<Direction, number[][]>>
  // [distance index][axis index]: the first beat at which the blob's excess differs between the knot and no-knot runs
  // (drift + 1 when it never does within the drift window)
  arrival: Record<Direction, number[][]>
  blobEnergy: number[][]
  beta: number
  exact: boolean
  returns: boolean
  knotHeld: boolean
  lumpBlind: boolean
  lumpBlindBeats: number
  reflected: number
  seconds: number
}

let cachedSurvey: SurveyMember[] | undefined

function shellProfile(
  shells: Int32Array,
  side: number,
  energy: Float64Array,
  slots: Float64Array,
  samples: number,
): ShellProfile {
  const top = Math.max(...shells) + 1
  const e = new Float64Array(top)
  const n = new Float64Array(top)
  const t = new Float64Array(top * 3)

  for (let c = 0; c < shells.length; c++) {
    const sh = shells[c]!

    e[sh] = e[sh]! + energy[c]!
    n[sh] = n[sh]! + side

    for (let v = 0; v < 3; v++) {
      t[sh * 3 + v] = t[sh * 3 + v]! + slots[c * 3 + v]!
    }
  }

  return {
    energyPerDock: Array.from(e, (x, sh) =>
      n[sh]! > 0 ? x / (n[sh]! * samples) : 0,
    ),
    slotEntropy: Array.from({ length: top }, (_, sh) =>
      tritEntropy(t[sh * 3]!, t[sh * 3 + 1]!, t[sh * 3 + 2]!),
    ),
  }
}

function surveyMember(
  member: ReturnType<typeof startFamily>[number],
  phase: number,
  S: SurveySettings,
): SurveyMember {
  const started = Date.now()
  const box = withStart(member, () => arrowBox(S.side, 4))
  const columns = S.side ** 3
  const col = new Float64Array(columns)
  const profile = {} as Record<Config, Record<Direction, ShellProfile>>
  const toward = {} as Record<Config, Record<Direction, number[][]>>
  const arrival: Record<Direction, number[][]> = {
    forward: S.distances.map(() => S.axes.map(() => S.drift + 1)),
    backward: S.distances.map(() => S.axes.map(() => S.drift + 1)),
  }
  // the no-knot blob excess per [direction][distance][axis][beat - 1], to compare the knot run against
  const noneExcess: Record<Direction, Float64Array[][][]> = {
    forward: [],
    backward: [],
  }
  const blobEnergy: number[][] = S.distances.map(() =>
    S.axes.map(() => 0),
  )

  let beta = 0
  let exact = true
  let returns = true
  let knotHeld = true
  let lumpBlind = true
  let lumpBlindBeats = 0
  let reflected = 0
  let shells: Int32Array | undefined

  for (const config of ['none', 'knot'] as const) {
    const ks = knotStream(
      box,
      config === 'knot' ? S.radius : -1,
      [0, 0, 0],
    )

    shells ??= shellOf(ks)

    if (config === 'knot') {
      reflected = ks.reflected
    }

    const gas = knotStart(ks, {
      perDock: S.gasPerDock,
      phase,
      lump: true,
    })
    const e0 = energyOf(gas)
    const q0 = chargeOf(gas)
    const gasColumns = new Map<number, Float64Array>()

    const record = (s: Reduced, t: number): void => {
      const out = new Float64Array(columns)

      columnEnergy(box, s, out)
      gasColumns.set(t, out)
    }

    const heldSame = (s: Reduced): boolean => {
      for (let x = 0; x < box.cells; x++) {
        if (!ks.held[x]) {
          continue
        }

        for (let d = 0; d < 24; d++) {
          if (
            s.vibe[x * 24 + d] !== gas.vibe[x * 24 + d] ||
            s.point[x * 24 + d] !== gas.point[x * 24 + d]
          ) {
            return false
          }
        }

        for (let l = 0; l < 12; l++) {
          if (s.store[x * 12 + l] !== gas.store[x * 12 + l]) {
            return false
          }
        }
      }

      return true
    }

    const r = knotRunner(ks, gas)
    const lumpless =
      config === 'knot'
        ? knotRunner(
            ks,
            knotStart(ks, {
              perDock: S.gasPerDock,
              phase,
              lump: false,
            }),
          )
        : undefined

    const window = (direction: Direction): ShellProfile => {
      const energy = new Float64Array(columns)
      const slots = new Float64Array(columns * 3)
      const stores = new Float64Array(columns * 3)

      for (let t = 1; t <= S.settle; t++) {
        if (direction === 'forward') {
          r.forward()
        } else {
          r.backward()
        }

        const s = r.state()

        exact = exact && energyOf(s) === e0 && chargeOf(s) === q0

        if (t <= S.drift) {
          record(s, direction === 'forward' ? t : -t)
        }

        if (lumpless && direction === 'forward') {
          lumpless.forward()

          // the outside of the two knot runs, compared slot by slot and line by line
          const a = s
          const b = lumpless.state()

          let same = true

          for (let x = 0; x < box.cells && same; x++) {
            if (ks.held[x]) {
              continue
            }

            for (let d = 0; d < 24; d++) {
              if (
                a.vibe[x * 24 + d] !== b.vibe[x * 24 + d] ||
                (a.vibe[x * 24 + d] !== 0 &&
                  a.point[x * 24 + d] !== b.point[x * 24 + d])
              ) {
                same = false
              }
            }

            for (let l = 0; l < 12; l++) {
              if (
                a.store[x * 12 + l] !== b.store[x * 12 + l] ||
                (a.store[x * 12 + l] !== 0 &&
                  a.spoint[x * 12 + l] !== b.spoint[x * 12 + l])
              ) {
                same = false
              }
            }
          }

          lumpBlind = lumpBlind && same

          if (same) {
            lumpBlindBeats++
          }
        }

        if (t > S.settle - S.window) {
          columnEnergy(box, s, col)

          for (let c = 0; c < columns; c++) {
            energy[c] = energy[c]! + col[c]!
          }

          columnTrits(box, s, slots, stores)
        }
      }

      knotHeld = knotHeld && heldSame(r.state())

      if (config === 'none' && direction === 'forward') {
        let plus = 0
        let minus = 0
        let calm = 0

        for (let c = 0; c < columns; c++) {
          plus += slots[c * 3]!
          minus += slots[c * 3 + 1]!
          calm += slots[c * 3 + 2]!
        }

        beta = -0.5 * Math.log((plus * minus) / (calm * calm))
      }

      return shellProfile(shells!, S.side, energy, slots, S.window)
    }

    record(gas, 0)

    const forward = window('forward')

    for (let t = 0; t < S.settle; t++) {
      r.backward()
    }

    returns = returns && sameReduced(r.state(), gas) && r.time() === 0

    const backward = window('backward')

    profile[config] = { forward, backward }
    toward[config] = { forward: [], backward: [] }

    S.distances.forEach((r0, i) => {
      toward[config].forward.push([])
      toward[config].backward.push([])

      if (config === 'none') {
        noneExcess.forward.push([])
        noneExcess.backward.push([])
      }

      S.axes.forEach((axis, j) => {
        const at = axis.map(
          a => (((a * r0) % S.side) + S.side) % S.side,
        ) as unknown as [number, number, number]
        const back = axis.map(a => -a) as unknown as [
          number,
          number,
          number,
        ]
        const blob = addBlob(ks, gas, {
          at,
          perDock: S.blobPerDock,
          phase,
        })
        const eb = energyOf(blob)
        const qb = chargeOf(blob)

        blobEnergy[i]![j] = eb - e0

        for (const direction of ['forward', 'backward'] as const) {
          const rb = knotRunner(ks, blob)
          const excess = new Float64Array(columns)
          const kept: Float64Array[] = []

          for (let t = 1; t <= S.drift; t++) {
            if (direction === 'forward') {
              rb.forward()
            } else {
              rb.backward()
            }

            const s = rb.state()

            exact = exact && energyOf(s) === eb && chargeOf(s) === qb
            columnEnergy(box, s, col)

            const base = gasColumns.get(
              direction === 'forward' ? t : -t,
            )!

            for (let c = 0; c < columns; c++) {
              excess[c] = col[c]! - base[c]!
            }

            if (config === 'none') {
              kept.push(Float64Array.from(excess))
            } else if (arrival[direction][i]![j] === S.drift + 1) {
              const other = noneExcess[direction][i]![j]![t - 1]!

              for (let c = 0; c < columns; c++) {
                if (excess[c] !== other[c]) {
                  arrival[direction][i]![j] = t
                  break
                }
              }
            }
          }

          if (config === 'none') {
            noneExcess[direction][i]!.push(kept)
          }

          toward[config][direction][i]!.push(
            towardKnot(excess, S.side, at, back).shift,
          )
        }
      })
    })
  }

  return {
    name: member.name,
    profile,
    toward,
    arrival,
    blobEnergy,
    beta,
    exact,
    returns,
    knotHeld,
    lumpBlind,
    lumpBlindBeats,
    reflected,
    seconds: (Date.now() - started) / 1000,
  }
}

// the survey over the 17-start family (link start integer+0..15 and golden; the Weyl phase of the fills is the member's
// index), memoized so E-GRV-0056 and E-GRV-0057 share one run in one process
// (other settings: a smoke run of the code path, never memoized)
export function heldKnotSurvey(
  log?: (what: string) => void,
  settings: SurveySettings = SURVEY,
): SurveyMember[] {
  if (settings === SURVEY && cachedSurvey) {
    return cachedSurvey
  }

  const members = startFamily(settings.offsets).map((member, k) => {
    const m = surveyMember(member, k, settings)

    log?.(`${m.name} ${m.seconds.toFixed(0)}s`)

    return m
  })

  if (settings === SURVEY) {
    cachedSurvey = members
  }

  return members
}

// mean and standard error of a sample
export function meanError(xs: readonly number[]): {
  mean: number
  error: number
} {
  const n = xs.length
  const mean = xs.reduce((a, b) => a + b, 0) / n
  const variance =
    xs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1)

  return { mean, error: Math.sqrt(variance / n) }
}

// least-squares slope of y on x
export function slope(
  x: readonly number[],
  y: readonly number[],
): number {
  const mx = x.reduce((a, b) => a + b, 0) / x.length
  const my = y.reduce((a, b) => a + b, 0) / y.length

  let num = 0
  let den = 0

  for (let i = 0; i < x.length; i++) {
    num += (x[i]! - mx) * (y[i]! - my)
    den += (x[i]! - mx) ** 2
  }

  return num / den
}

// the survey's readings, pooled over members (and axes for the drift): what both experiment files gate on
export type SurveyReading = {
  // per shell in SURVEY.shells: the knot-minus-no-knot contrast of the settled slot entropy and energy per dock
  entropyContrast: Record<Direction, { mean: number; error: number }[]>
  energyContrast: Record<Direction, { mean: number; error: number }[]>
  // per distance: the paired knot-minus-none displacement toward the knot, and the no-knot displacement alone
  drift: Record<Direction, { mean: number; error: number }[]>
  plain: Record<Direction, { mean: number; error: number }[]>
  // per distance: forward minus backward drift (paired)
  evenness: { mean: number; error: number }[]
  // per distance: the least first-arrival beat over members and axes, per direction
  arrival: Record<Direction, number[]>
  // per interior distance (SURVEY.distances), the settled forward entropy-contrast gradient d(Delta s)/dr by the central
  // difference of the shell contrasts
  gradient: { mean: number; error: number }[]
  beta: { min: number; max: number }
}

export function readSurvey(
  members: readonly SurveyMember[],
  S: SurveySettings = SURVEY,
): SurveyReading {
  const contrast = (
    direction: Direction,
    field: keyof ShellProfile,
    sh: number,
  ): number[] =>
    members.map(
      m =>
        m.profile.knot[direction][field][sh]! -
        m.profile.none[direction][field][sh]!,
    )
  const byDirection = <T>(
    f: (d: Direction) => T,
  ): Record<Direction, T> => ({
    forward: f('forward'),
    backward: f('backward'),
  })
  const paired = (direction: Direction, i: number): number[] =>
    members.flatMap(m =>
      S.axes.map(
        (_, j) =>
          m.toward.knot[direction][i]![j]! -
          m.toward.none[direction][i]![j]!,
      ),
    )

  return {
    entropyContrast: byDirection(d =>
      S.shells.map(sh => meanError(contrast(d, 'slotEntropy', sh))),
    ),
    energyContrast: byDirection(d =>
      S.shells.map(sh => meanError(contrast(d, 'energyPerDock', sh))),
    ),
    drift: byDirection(d =>
      S.distances.map((_, i) => meanError(paired(d, i))),
    ),
    plain: byDirection(d =>
      S.distances.map((_, i) =>
        meanError(members.flatMap(m => m.toward.none[d][i]!)),
      ),
    ),
    evenness: S.distances.map((_, i) => {
      const f = paired('forward', i)
      const b = paired('backward', i)

      return meanError(f.map((x, k) => x - b[k]!))
    }),
    arrival: byDirection(d =>
      S.distances.map((_, i) =>
        Math.min(...members.flatMap(m => m.arrival[d][i]!)),
      ),
    ),
    gradient: S.distances.map(r0 =>
      meanError(
        members.map(
          m =>
            (m.profile.knot.forward.slotEntropy[r0 + 1]! -
              m.profile.none.forward.slotEntropy[r0 + 1]! -
              (m.profile.knot.forward.slotEntropy[r0 - 1]! -
                m.profile.none.forward.slotEntropy[r0 - 1]!)) /
            2,
        ),
      ),
    ),
    beta: {
      min: Math.min(...members.map(m => m.beta)),
      max: Math.max(...members.map(m => m.beta)),
    },
  }
}
