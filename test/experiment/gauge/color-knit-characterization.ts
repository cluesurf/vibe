// What changes when the knit changes: the chosen color-local knit (E-FRC-0148 chose the color turn weave)
// run beside the committed turning weave through every test the committed knit was adopted on or has been
// characterized by. The runner-up of E-FRC-0148 (turn-schedule:bind-reverse:103:130542) is run beside them
// as a third column, reported and not gated, since the choice fell to a tie-break.
//
// Every rule is built by the same code (code/rule/color-local-weave), the committed one as the spec with
// the pair table, checked equal to turningWeave cell by cell as the first control. The items, each the
// instrument of the experiment named, generalized from the committed schedule to any schedule:
//
// 1. E-FND-0117. CPT searched over the 384-element torus group: every signed axis permutation P and every
//    mirror phase c, P with charge conjugation and time reversal tried against the forward rule on 12
//    sample states per beat, survivors counted. Then the dense check at the identity (2,000 states per
//    beat), the swap-edge graph (edges, and whether they connect all 12 lines), and how many of 24
//    directions interact (a lone tone's support above 1 within 24 beats, side 9).
// 2. E-FND-0118. The vacuum's exact period from birth; the kick law, generalized: every species a lone
//    tone keeps at support 1 for 26 beats (side 13), and for each, a slab across its path born 1 to 11
//    beats late, each offset read as blind (phase unchanged, support 1), a kick (support 1, phase moved by
//    a whole clock unit of 120 degrees), absorbing (support above 1) or other; direction 0, the species
//    E-FND-0118 used, reported on its own; interference at the first kicking offset; wall content in whole
//    side-cubed sheets at side 13 (offset 3, 72 beats) and whether it is periodic at 24; the dressed
//    profile at side 21 over 26 beats (direction 8 and the first protected species).
// 3. E-FRC-0111's travel survey: per direction the reach in 6 beats on the side-13 box, counted at full
//    speed (6 sqrt 2) and at half or more.
// 4. The vacuum's line sectors: the components of the line graph a lone tone's disturbance draws, as sets
//    of lines, on the empty vacuum and on a dense background (code/measure/weave-acceptance).
// 5. E-FRC-0113 and E-FRC-0142's ledger: every coin permutation (1,152), tone relabelling (6) and phase
//    (24), as a forward and as a reversal symmetry, with the orientation of each entry.
// 6. E-FRC-0142's handedness: the coin elements that carry the rule's turn, their left and right SO(3)
//    angles, and the lone-love current response's self-dual over anti-self-dual ratio at sides 9 and 13.
// 7. E-SPN-0044's spin lift: the turn's order on lines, the lift of the closed loop of turns in
//    SU(2)_L x SU(2)_R, the schedule's net turns and lift, and whether lone loves launched along d and -d
//    carry opposite currents.
// 8. E-FRC-0141's generation copies: under a rule with no triality, how many of the 16 A2 planes split
//    the three triplet copies, and the pattern.
//
// Controls, gated: the committed rule's own numbers must come back from these generalized instruments
// (CPT at the identity and phase 23, a connected swap graph, 21 interacting directions, direction 0 blind
// at offsets 1 and 2 and kicked at 7 and 11, 12 travellers at half speed, a ledger holding only the
// identity forward, turn angles 90 and 180, a chiral ratio above 2 at both sides, a loop lift of (-1, +1),
// all 16 planes split). Everything about the chosen rule and the runner-up is reported, not gated: this
// file says what changes, not whether a change is good.
//
// Depth L2: exact measurements of constructed rules with the committed rule as the reproduced control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { type Collision, G_TURN, TURN_POS_MIRROR, TURN_SWAP_ORDER, TURN_COUPLES_ZERO, turningWeave } from '@/code/rule/collision'
import { colorLocalCollision, colorLocalSpec, HOP_FREE_TABLES, PAIR_TABLE, type ColorLocalSpec } from '@/code/rule/color-local-weave'
import { COLOR_TURN, COLOR_TURN_SPEC, COLOR_TURN_SWAP_ORDER } from '@/code/rule/color-turn-weave'
import { turnElements } from '@/code/rule/color-local-family'
import { lineSectors, reversalAndCharge, travelReaches, vacuumPeriod, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { loneDressing, neighbourTable, vacuumCells } from '@/code/measure/lone-dressing'
import { permutationOrder, weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { CHARGE_CONJUGATION, conjugateCollision, orientationOf, symmetryLedger } from '@/code/measure/rule-symmetry-ledger'
import {
  isoclinicFactors,
  loneChargeCurrent,
  quaternionOrder,
  responseMatrix,
  selfDualSplit,
  so3AngleDegrees,
  vacuumCellTrajectory,
} from '@/code/measure/chiral-response'
import { quaternionMultiply, quaternionsClose, type Quaternion } from '@/code/algebra/binary-tetrahedral'
import { clockAmplitude, phaseDegrees } from '@/code/measure/clock-amplitude'
import { pairSub } from '@/code/algebra/linear/complex-pair'
import {
  copyLayout,
  copyStatistics,
  degeneracyExceptions,
  loneRun,
  memoizedRule,
  vacuumSequence,
  type LoneRun,
} from '@/code/measure/generation-copies'
import { beat, growingBeat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxCell, d4BoxMesh, linearMapOf } from '@/code/substrate/d4-box'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'

const PERIOD = 24
const TRAVEL_BEATS = 6
const KICK_SIDE = 13
const SLAB = 4
const SEED_BEAT = 3
const KICK_BEATS = 20
const KICK_SETTLED = 14
const OFFSETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const PROTECTED_BEATS = 26
const PROFILE_SIDE = 21
const PROFILE_BEATS = 26
const CORE_RADIUS = 5
const WALL_SIDE = 13
const WALL_OFFSET = 3
const WALL_BEATS = 72
const WALL_SETTLED = 30
const ROOT3 = Math.sqrt(3)
const RESPONSE_SIDES = [9, 13]
const GENERATION_SIDE = 11
const GENERATION_REACH_BEATS = 6

type Candidate = {
  readonly name: string
  readonly spec: ColorLocalSpec
  readonly turn: readonly number[]
  readonly swapOrder: readonly number[]
}

const mirrored = (order: readonly number[]): number[] => [...order, ...[...order].reverse()]

const CANDIDATES: readonly Candidate[] = [
  { name: 'committed', spec: colorLocalSpec({ tables: [PAIR_TABLE] }), turn: G_TURN, swapOrder: TURN_SWAP_ORDER },
  { name: 'chosen', spec: COLOR_TURN_SPEC, turn: COLOR_TURN, swapOrder: COLOR_TURN_SWAP_ORDER },
  {
    name: 'runnerUp',
    spec: colorLocalSpec({
      tables: [HOP_FREE_TABLES['bind-reverse'] ?? []],
      turn: turnElements()[103] ?? [],
      swapAt: mirrored([1, 3, 0, 5, 4, 2]),
    }),
    turn: turnElements()[103] ?? [],
    swapOrder: [1, 3, 0, 5, 4, 2],
  },
]

const scheduledOf = (spec: ColorLocalSpec): ScheduledRule => (opposite, forward) => colorLocalCollision({ spec, opposite, forward })

// the sample states of E-FND-0117
function sampleVector(n: number): Int8Array {
  const v = new Int8Array(24)

  for (let i = 0; i < 24; i++) {
    v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1
  }

  return v
}

const applyCell = (collision: Collision, v: Int8Array): Int8Array => {
  const out = Int8Array.from(v)

  collision(out, 0, 24)

  return out
}

// the 384 signed axis permutations as permutations of the 24 directions
function torusGroup(): number[][] {
  const roots = rootsD4()
  const index = new Map(roots.map((r, i) => [r.join(','), i]))
  const out: number[][] = []
  const perms = (xs: number[]): number[][] =>
    xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map(r => [x, ...r]))

  for (const axes of perms([0, 1, 2, 3])) {
    for (let m = 0; m < 16; m++) {
      out.push(roots.map(r => index.get([0, 1, 2, 3].map(i => ((m >> i) & 1 ? -1 : 1) * (r[axes[i] ?? 0] ?? 0)).join(',')) ?? 0))
    }
  }

  return out
}

// 1. E-FND-0117
function cptAndConnectivity(c: Candidate): {
  survivors: number
  survivorsIdentity: number
  survivorsReflecting: number
  identityPhases: number[]
  denseBad: number
  swapEdges: number
  connected: boolean
  interacting: number
} {
  const opposite = meshOpposites(d4Mesh({ side: 5 }))
  const forward = colorLocalCollision({ spec: c.spec, opposite })
  const backward = colorLocalCollision({ spec: c.spec, opposite, forward: false })
  const group = torusGroup()
  const identity = group.findIndex(p => p.every((x, d) => x === d))

  let survivors = 0
  let survivorsIdentity = 0
  let survivorsReflecting = 0

  const identityPhases: number[] = []

  group.forEach((p, pi) => {
    const pInv = new Array<number>(24)

    p.forEach((image, d) => (pInv[image] = d))

    for (let phase = 0; phase < PERIOD; phase++) {
      let ok = true

      for (let t = 0; t < PERIOD && ok; t++) {
        const sigma = (((phase - t) % PERIOD) + PERIOD) % PERIOD

        for (let n = 0; n < 12 && ok; n++) {
          const v = sampleVector(n * 12 + t)
          const rhs = applyCell(forward(t), v)
          const w = Int8Array.from({ length: 24 }, (_, d) => -(v[p[d] ?? 0] ?? 0))
          const m2 = applyCell(backward(sigma), w)

          for (let d = 0; d < 24; d++) {
            if (-(m2[pInv[d] ?? 0] ?? 0) !== rhs[d]) {
              ok = false
              break
            }
          }
        }
      }

      if (ok) {
        survivors++
        survivorsReflecting += orientationOf(p) === -1 ? 1 : 0

        if (pi === identity) {
          survivorsIdentity++
          identityPhases.push(phase)
        }
      }
    }
  })

  // dense check at the identity, at the first identity phase found (23 for the committed rule)
  const phase = identityPhases[0] ?? 23

  let denseBad = 0

  for (let t = 0; t < PERIOD; t++) {
    const sigma = (((phase - t) % PERIOD) + PERIOD) % PERIOD

    for (let n = 0; n < 2000; n++) {
      const v = sampleVector(n * 17 + t * 3 + 2)
      const rhs = applyCell(forward(t), v)
      const m2 = applyCell(backward(sigma), Int8Array.from(v, x => -x))

      denseBad += m2.every((x, d) => -x === rhs[d]) ? 0 : 1
    }
  }

  // the swap-edge graph
  const norm = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])
  const positions: [number, number][][] = []

  let current = TURN_COUPLES_ZERO.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 4; i++) {
    positions.push(current)
    current = current.map(([a, b]) => norm(c.turn[a] ?? a, c.turn[b] ?? b))
  }

  const swapMirror = mirrored(c.swapOrder)
  const edges = new Set<string>()

  for (let t = 0; t < PERIOD; t++) {
    const couple = positions[TURN_POS_MIRROR[t % 8] ?? 0]?.[swapMirror[t % 12] ?? 0]

    if (couple) {
      edges.add(couple.join('-'))
    }
  }

  const parent = Array.from({ length: 12 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] ?? x)))
  const nodes = new Set<number>()

  for (const e of edges) {
    const [a = 0, b = 0] = e.split('-').map(Number)

    nodes.add(a).add(b)
    parent[find(a)] = find(b)
  }

  const connected = nodes.size === 12 && new Set(Array.from({ length: 12 }, (_, i) => find(i))).size === 1

  // interacting directions, side 9
  const mesh9 = d4Mesh({ side: 9 })
  const forward9 = colorLocalCollision({ spec: c.spec, opposite: meshOpposites(mesh9) })
  const vacuum9 = vacuumCells({ forward: forward9, beats: PERIOD })
  const center9 = 4 + 4 * 9 + 4 * 81 + 4 * 729
  const nb9 = neighbourTable(mesh9)

  let interacting = 0

  for (let d = 0; d < 24; d++) {
    const run = loneDressing({ neighbours: nb9, forward: forward9, vacuum: vacuum9, cell: center9, direction: d, beats: PERIOD })

    interacting += run.some(b => b.support > 1) ? 1 : 0
  }

  return { survivors, survivorsIdentity, survivorsReflecting, identityPhases, denseBad, swapEdges: edges.size, connected, interacting }
}

// 2. E-FND-0118, generalized
type KickRegime = 'blind' | 'kick' | 'absorbing' | 'other'

function kickLaw(c: Candidate): {
  protectedDirections: number[]
  regimes: Record<KickRegime, number>
  direction0: KickRegime[]
  interferenceAdditivity: number
  aligned: number
  crossed: number
  wallQuantized: boolean
  wallPeriodicAt24: boolean
  profile8: { totalMax: number; coreMax: number; coreLate: number }
  profileProtected: { totalMax: number; coreMax: number; coreLate: number }
} {
  const roots = rootsD4()
  const mesh = d4Mesh({ side: KICK_SIDE })
  const opposite = meshOpposites(mesh)
  const rule = colorLocalCollision({ spec: c.spec, opposite })
  const side = KICK_SIDE
  const coordinate = (cell: number, a: number): number => Math.floor(cell / side ** a) % side
  const cellAt = (v: readonly number[]): number => v.reduce((s, x, a) => s + (((x % side) + side) % side) * side ** a, 0)

  // protected species: support exactly 1 for PROTECTED_BEATS beats
  const nb = neighbourTable(mesh)
  const vacuum = vacuumCells({ forward: rule, beats: PROTECTED_BEATS })
  const center = cellAt([6, 6, 6, 6])
  const protectedDirections = Array.from({ length: 24 }, (_, d) => d).filter(d =>
    loneDressing({ neighbours: nb, forward: rule, vacuum, cell: center, direction: d, beats: PROTECTED_BEATS }).every(b => b.support === 1),
  )

  const axisOf = (d: number): number => (roots[d] ?? []).findIndex(x => x !== 0)
  const seedFor = (d: number): number => {
    const a = axisOf(d)
    const step = roots[d]?.[a] ?? 1

    return cellAt([6, 6, 6, 6].map((x, k) => (k === a ? SLAB - SEED_BEAT * step : x)))
  }
  const branch = (d: number, offset: number, seeds: readonly { cell: number; dir: number }[]): { re: number[]; im: number[]; support: number[] } => {
    const a = axisOf(d)
    let vac: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)
    const re: number[] = []
    const im: number[] = []
    const support: number[] = []

    for (let t = 0; t < KICK_BEATS; t++) {
      if (t === SEED_BEAT) {
        for (const s of seeds) {
          seeded.data[s.cell * 24 + s.dir] = 1
        }
      }

      const active = (cell: number): boolean => (coordinate(cell, a) === SLAB ? t >= offset : true)

      vac = growingBeat(vac, rule(t), active)
      seeded = growingBeat(seeded, rule(t), active)

      const diff = pairSub(clockAmplitude(seeded), clockAmplitude(vac))

      re.push(diff[0])
      im.push(diff[1])

      let s = 0

      for (let i = 0; i < seeded.data.length; i++) {
        s += seeded.data[i] === vac.data[i] ? 0 : 1
      }

      support.push(s)
    }

    return { re, im, support }
  }
  const phaseAt = (r: { re: number[]; im: number[] }, t: number): number => Math.round(phaseDegrees([r.re[t] ?? 0, r.im[t] ?? 0]))
  const classify = (d: number, offset: number): KickRegime => {
    const free = branch(d, 0, [{ cell: seedFor(d), dir: d }])
    const slab = branch(d, offset, [{ cell: seedFor(d), dir: d }])
    const beats = Array.from({ length: KICK_BEATS - SEED_BEAT }, (_, k) => k + SEED_BEAT)

    if (beats.some(t => slab.support[t] !== 1)) {
      return 'absorbing'
    }

    const shift = (t: number): number => (((phaseAt(slab, t) - phaseAt(free, t)) % 360) + 360) % 360

    if (beats.every(t => shift(t) === 0)) {
      return 'blind'
    }

    const settled = beats.filter(t => t >= KICK_SETTLED)
    const unit = shift(KICK_SETTLED)

    return (unit === 120 || unit === 240) && settled.every(t => shift(t) === unit) ? 'kick' : 'other'
  }

  const regimes: Record<KickRegime, number> = { blind: 0, kick: 0, absorbing: 0, other: 0 }

  for (const d of protectedDirections) {
    for (const offset of OFFSETS) {
      regimes[classify(d, offset)]++
    }
  }

  const direction0 = [1, 2, 3, 5, 7, 11].map(offset => classify(0, offset))

  // interference at the first kicking offset of the first protected species that has one
  let interferenceAdditivity = -1
  let aligned = 0
  let crossed = 0

  const kicked = protectedDirections.flatMap(d => OFFSETS.map(offset => ({ d, offset }))).find(({ d, offset }) => classify(d, offset) === 'kick')

  if (kicked) {
    const { d, offset } = kicked
    const a = axisOf(d)
    const step = roots[d]?.[a] ?? 1
    // a second seed of the same species moving away from the slab, so it stays free
    const away = { cell: cellAt([6, 6, 6, 6].map((x, k) => (k === a ? SLAB + 2 * step : x)).map((x, k) => (k === (a + 1) % 4 ? x + 4 : x))), dir: d }
    const near = { cell: seedFor(d), dir: d }
    const A = branch(d, offset, [away])
    const B = branch(d, offset, [near])
    const J = branch(d, offset, [away, near])

    interferenceAdditivity = 0

    for (let t = SEED_BEAT; t < KICK_BEATS; t++) {
      interferenceAdditivity = Math.max(
        interferenceAdditivity,
        Math.hypot((J.re[t] ?? 0) - (A.re[t] ?? 0) - (B.re[t] ?? 0), (J.im[t] ?? 0) - (A.im[t] ?? 0) - (B.im[t] ?? 0)),
      )

      const mJ = Math.hypot(J.re[t] ?? 0, J.im[t] ?? 0)

      aligned += Math.abs(mJ - 2 * ROOT3) < 1e-9 ? 1 : 0
      crossed += Math.abs(mJ - ROOT3) < 1e-9 && phaseAt(A, t) !== phaseAt(B, t) ? 1 : 0
    }
  }

  // wall content, side 13, offset 3, 72 beats
  const wallMesh = d4Mesh({ side: WALL_SIDE })
  const wallRule = colorLocalCollision({ spec: c.spec, opposite: meshOpposites(wallMesh) })

  let staggered: Will = makeWill(wallMesh)
  let uniform: Will = makeWill(wallMesh)

  const wall: number[] = []

  for (let t = 0; t < WALL_BEATS; t++) {
    staggered = growingBeat(staggered, wallRule(t), cell => (coordinate(cell, 0) < 7 ? true : t >= WALL_OFFSET))
    uniform = beat(uniform, wallRule(t))

    let w = 0

    for (let i = 0; i < staggered.data.length; i++) {
      w += staggered.data[i] === uniform.data[i] ? 0 : 1
    }

    wall.push(w)
  }

  const sheet = WALL_SIDE ** 3
  const wallQuantized = wall.slice(WALL_SETTLED).every(x => x % sheet === 0)
  const wallPeriodicAt24 = wall.slice(PERIOD, WALL_BEATS - PERIOD).every((x, k) => x === wall[k + 2 * PERIOD])

  // the dressed profile, side 21
  const bigMesh = d4Mesh({ side: PROFILE_SIDE })
  const bigRule = colorLocalCollision({ spec: c.spec, opposite: meshOpposites(bigMesh) })
  const bigNb = neighbourTable(bigMesh)
  const bigVacuum = vacuumCells({ forward: bigRule, beats: PROFILE_BEATS })
  const mid = Math.floor(PROFILE_SIDE / 2)
  const bigCenter = mid * (1 + PROFILE_SIDE + PROFILE_SIDE ** 2 + PROFILE_SIDE ** 3)
  const wrap = (x: number): number => (x > PROFILE_SIDE / 2 ? x - PROFILE_SIDE : x < -PROFILE_SIDE / 2 ? x + PROFILE_SIDE : x)
  const profile = (d: number): { totalMax: number; coreMax: number; coreLate: number } => {
    let totalMax = 0
    let coreMax = 0
    let coreLate = 0

    loneDressing({
      neighbours: bigNb,
      forward: bigRule,
      vacuum: bigVacuum,
      cell: bigCenter,
      direction: d,
      beats: PROFILE_BEATS,
      watch: (t, live, vac) => {
        const p = [0, 1, 2, 3].map(a => (((mid + (t + 1) * (roots[d]?.[a] ?? 0)) % PROFILE_SIDE) + PROFILE_SIDE) % PROFILE_SIDE)

        let total = 0
        let core = 0

        for (const [x, state] of live) {
          let differing = 0

          for (let k = 0; k < 24; k++) {
            differing += state[k] === vac[k] ? 0 : 1
          }

          let cheb = 0

          for (let a = 0; a < 4; a++) {
            cheb = Math.max(cheb, Math.abs(wrap((Math.floor(x / PROFILE_SIDE ** a) % PROFILE_SIDE) - (p[a] ?? 0))))
          }

          total += differing
          core += cheb <= CORE_RADIUS ? differing : 0
        }

        totalMax = Math.max(totalMax, total)
        coreMax = Math.max(coreMax, core)

        if (t === PROFILE_BEATS - 1) {
          coreLate = core
        }
      },
    })

    return { totalMax, coreMax, coreLate }
  }

  return {
    protectedDirections,
    regimes,
    direction0,
    interferenceAdditivity,
    aligned,
    crossed,
    wallQuantized,
    wallPeriodicAt24,
    profile8: profile(8),
    profileProtected: protectedDirections.length > 0 ? profile(protectedDirections[0] ?? 0) : { totalMax: -1, coreMax: -1, coreLate: -1 },
  }
}

// 5, 6 and 7: the ledger, the turn, the response and the lift
function symmetryAndChirality(c: Candidate): {
  forwardEntries: number
  reversalEntries: number
  reflections: number
  identityForward: boolean
  cptReversalPhases: number[]
  turnElements: number
  turnOrderOnDirections: number
  turnOrderOnLines: number
  leftAngle: number
  rightAngle: number
  ratios: number[]
  mirroredSwaps: boolean
  loopLiftLeft: number
  loopLiftRight: number
  loopIsInversion: boolean
  netTurns: number
  antipodalMismatch: number
  antipodalTotal: number
} {
  const roots = rootsD4()
  const opposite = meshOpposites(d4Mesh({ side: 5 }))
  const permutations = weylF4DirectionPermutations({ directions: roots })
  const identity = permutations.findIndex(p => p.every((x, d) => x === d))
  const schedule = colorLocalCollision({ spec: c.spec, opposite })
  const inverse = colorLocalCollision({ spec: c.spec, opposite, forward: false })
  const ledger = symmetryLedger({ forward: schedule, inverse, period: PERIOD, permutations, degree: 24 })

  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

  const lineOf = new Array<number>(24).fill(-1)

  lines.forEach(([a, b], l) => {
    lineOf[a] = l
    lineOf[b] = l
  })

  const turns = permutations.filter(p => lines.every(([a], l) => lineOf[p[a] ?? 0] === c.turn[l]))
  const first = turns[0] ?? []
  const factors = isoclinicFactors(linearMapOf(first) ?? [])
  const turnOrderOnLines = permutationOrder({ permutation: c.turn })
  const mirror = roots.map(root => roots.findIndex(other => other.every((x, k) => x === (k === 2 ? -(root[k] ?? 0) : root[k]))))

  // the lift of a closed loop of turns: the power that returns the lines
  const power = (q: Quaternion, n: number): Quaternion => {
    let out: Quaternion = [1, 0, 0, 0]

    for (let k = 0; k < n; k++) {
      out = quaternionMultiply(out, q)
    }

    return out
  }
  const sign = (q: Quaternion): number => (quaternionsClose(q, [1, 0, 0, 0]) ? 1 : quaternionsClose(q, [-1, 0, 0, 0]) ? -1 : 0)
  const left = (factors?.left ?? [0, 0, 0, 0]) as Quaternion
  const right = (factors?.right ?? [0, 0, 0, 0]) as Quaternion

  let loop = roots.map((_, d) => d)

  for (let k = 0; k < turnOrderOnLines; k++) {
    loop = loop.map(d => first[d] ?? d)
  }

  // the schedule's net turns over a period, read mod the turn's order on lines
  const order = turnOrderOnLines
  let netTurns = 0

  for (let t = 0; t < PERIOD; t++) {
    const step = ((((TURN_POS_MIRROR[(t + 1) % 8] ?? 0) - (TURN_POS_MIRROR[t % 8] ?? 0)) % order) + order) % order

    netTurns += step > order / 2 ? step - order : step
  }

  // the response and the antipodal currents
  const currentsAt = (side: number, sched: (t: number) => Collision): number[][] => {
    const mesh = d4Mesh({ side })
    const vacuum = vacuumCellTrajectory({ schedule: sched, beats: PERIOD, degree: 24 })
    const mid = Math.floor(side / 2)
    const cell = mid * (1 + side + side ** 2 + side ** 3)

    return roots.map((_, direction) =>
      loneChargeCurrent({ mesh, schedule: sched, directions: roots, vacuum, cell, direction, tone: 1, beats: PERIOD }),
    )
  }
  const split = (currents: number[][]): { selfDual: number; antiSelfDual: number } => {
    const s = selfDualSplit(responseMatrix({ currents, directions: roots }))

    return { selfDual: Math.hypot(...s.selfDual), antiSelfDual: Math.hypot(...s.antiSelfDual) }
  }
  const byside = RESPONSE_SIDES.map(side => currentsAt(side, schedule))
  const splits = byside.map(split)
  const mirroredSplit = split(currentsAt(RESPONSE_SIDES[0] ?? 9, t => conjugateCollision({ collision: schedule(t), permutation: mirror })))
  const small = splits[0] ?? { selfDual: 0, antiSelfDual: 0 }
  const currents9 = byside[0] ?? []

  let antipodalMismatch = 0
  let antipodalTotal = 0

  currents9.forEach((v, d) => {
    const w = currents9[opposite[d] ?? d] ?? []

    antipodalMismatch += Math.hypot(...v.map((x, k) => x + (w[k] ?? 0)))
    antipodalTotal += Math.hypot(...v)
  })

  return {
    forwardEntries: ledger.filter(e => e.kind === 'forward').length,
    reversalEntries: ledger.filter(e => e.kind === 'reversal').length,
    reflections: ledger.filter(e => orientationOf(permutations[e.p] ?? []) === -1).length,
    identityForward: ledger.some(e => e.kind === 'forward' && e.p === identity && e.tau === 0 && e.phase === 0),
    cptReversalPhases: ledger.filter(e => e.kind === 'reversal' && e.p === identity && e.tau === CHARGE_CONJUGATION).map(e => e.phase),
    turnElements: turns.length,
    turnOrderOnDirections: permutationOrder({ permutation: first }),
    turnOrderOnLines,
    leftAngle: factors ? so3AngleDegrees(factors.left) : -1,
    rightAngle: factors ? so3AngleDegrees(factors.right) : -1,
    ratios: splits.map(s => s.selfDual / s.antiSelfDual),
    mirroredSwaps: Math.abs(mirroredSplit.selfDual - small.antiSelfDual) < 1e-9 && Math.abs(mirroredSplit.antiSelfDual - small.selfDual) < 1e-9,
    loopLiftLeft: sign(power(left, turnOrderOnLines)),
    loopLiftRight: sign(power(right, turnOrderOnLines)),
    loopIsInversion: loop.every((d, k) => d === opposite[k]),
    netTurns,
    antipodalMismatch,
    antipodalTotal,
  }
}

// 8. E-FRC-0141's copies, the rule's part
function generationCopies(c: Candidate): { planes: number; split: number; reachPattern111: number; reachPattern12: number; reachSplitLow: number; reachSplitHigh: number } {
  const roots = rootsD4()
  const box = d4BoxMesh({ side: GENERATION_SIDE })
  const opposite = meshOpposites(box)
  const mid = Math.floor(GENERATION_SIDE / 2)
  const cell = d4BoxCell({ coordinates: [mid, mid, mid, mid], side: GENERATION_SIDE })
  const selectors = weylF4DirectionPermutations({ directions: roots }).filter(
    p => permutationOrder({ permutation: p }) === 3 && p.filter((image, d) => image === d).length === 6,
  )
  const perPlane = new Map<string, readonly number[]>()

  for (const p of selectors) {
    const key = p
      .map((image, d) => (image === d ? d : -1))
      .filter(d => d >= 0)
      .join(',')

    if (!perPlane.has(key)) {
      perPlane.set(key, p)
    }
  }

  const anyLayout = copyLayout({ roots, opposite, triality: selectors[0] ?? [] })
  const rule = memoizedRule(colorLocalCollision({ spec: c.spec, opposite }))
  const vacuum = vacuumSequence({ mesh: box, rule, beats: PERIOD })
  const runs: (LoneRun | undefined)[][] = Array.from({ length: 24 }, (_, direction) =>
    ([1, -1] as const).map(tone =>
      loneRun({ mesh: box, side: GENERATION_SIDE, rule, vacuum, cell, direction, tone, lines: anyLayout.lines, reachBeats: GENERATION_REACH_BEATS }),
    ),
  )
  const spread = (xs: readonly number[]): number => Math.max(...xs) - Math.min(...xs)
  const pattern = (xs: readonly number[]): string => {
    const [a = 0, b = 0, d = 0] = xs
    const equal = [a === b, b === d, a === d].filter(Boolean).length

    return equal === 3 ? '3' : equal === 1 ? '1+2' : '1+1+1'
  }
  const planes = [...perPlane.values()].map(sigma => {
    const copies = copyLayout({ roots, opposite, triality: sigma })
    const stats = copyStatistics({ layout: copies, runs })

    return { exceptions: degeneracyExceptions({ copies, sigma, runs }), reachSplit: spread(stats.reach), reachPattern: pattern(stats.reach) }
  })

  return {
    planes: planes.length,
    split: planes.filter(p => p.exceptions > 0).length,
    reachPattern111: planes.filter(p => p.reachPattern === '1+1+1').length,
    reachPattern12: planes.filter(p => p.reachPattern === '1+2').length,
    reachSplitLow: Math.min(...planes.map(p => p.reachSplit)),
    reachSplitHigh: Math.max(...planes.map(p => p.reachSplit)),
  }
}

type Profile = Record<string, number>

function characterize(c: Candidate): Profile {
  const rule = scheduledOf(c.spec)
  const cpt = cptAndConnectivity(c)
  const kick = kickLaw(c)
  const reaches = travelReaches(rule)
  const free = Math.SQRT2 * TRAVEL_BEATS
  const vacuumSectors = lineSectors(rule, false)
  const denseSectors = lineSectors(rule, true)
  const sym = symmetryAndChirality(c)
  const gen = generationCopies(c)
  const { reverses, chargeKept } = reversalAndCharge(rule)
  const regimeCode = (r: KickRegime): number => ({ blind: 0, kick: 1, absorbing: 2, other: 3 })[r]
  const sectorSizes = (s: number[][]): number => Number(s.map(x => x.length).sort((a, b) => b - a).join(''))

  return {
    cptTorusSurvivors: cpt.survivors,
    cptTorusSurvivorsAtIdentity: cpt.survivorsIdentity,
    cptTorusSurvivorsReflecting: cpt.survivorsReflecting,
    cptIdentityPhase: cpt.identityPhases[0] ?? -1,
    cptDenseMismatches: cpt.denseBad,
    swapEdges: cpt.swapEdges,
    swapGraphConnected: cpt.connected ? 1 : 0,
    interactingDirections: cpt.interacting,
    echoExact: reverses ? 1 : 0,
    chargeKept: chargeKept ? 1 : 0,
    vacuumPeriod: vacuumPeriod(rule),
    protectedSpecies: kick.protectedDirections.length,
    kickBlind: kick.regimes.blind,
    kickUnit: kick.regimes.kick,
    kickAbsorbing: kick.regimes.absorbing,
    kickOther: kick.regimes.other,
    ...Object.fromEntries([1, 2, 3, 5, 7, 11].map((offset, k) => [`direction0Offset${offset}`, regimeCode(kick.direction0[k] ?? 'other')])),
    interferenceAdditivity: kick.interferenceAdditivity,
    interferenceAlignedBeats: kick.aligned,
    interferenceCrossedBeats: kick.crossed,
    wallQuantized: kick.wallQuantized ? 1 : 0,
    wallPeriodicAt24: kick.wallPeriodicAt24 ? 1 : 0,
    profileDirection8TotalMax: kick.profile8.totalMax,
    profileDirection8CoreMax: kick.profile8.coreMax,
    profileDirection8CoreLate: kick.profile8.coreLate,
    profileProtectedTotalMax: kick.profileProtected.totalMax,
    travelFullSpeed: reaches.filter(r => r >= free - 1e-9).length,
    travelHalfOrMore: reaches.filter(r => r >= free / 2).length,
    travelMeanReach: reaches.reduce((a, b) => a + b, 0) / reaches.length,
    vacuumSectors: vacuumSectors.length,
    vacuumSectorSizes: sectorSizes(vacuumSectors),
    denseSectors: denseSectors.length,
    ledgerForward: sym.forwardEntries,
    ledgerReversal: sym.reversalEntries,
    ledgerReflections: sym.reflections,
    ledgerIdentityForward: sym.identityForward ? 1 : 0,
    ledgerCptPhase: sym.cptReversalPhases[0] ?? -1,
    turnElements: sym.turnElements,
    turnOrderOnLines: sym.turnOrderOnLines,
    turnOrderOnDirections: sym.turnOrderOnDirections,
    turnLeftAngle: Number(sym.leftAngle.toFixed(6)),
    turnRightAngle: Number(sym.rightAngle.toFixed(6)),
    chiralRatioSide9: Number((sym.ratios[0] ?? 0).toFixed(4)),
    chiralRatioSide13: Number((sym.ratios[1] ?? 0).toFixed(4)),
    mirroredResponseSwaps: sym.mirroredSwaps ? 1 : 0,
    loopLiftLeft: sym.loopLiftLeft,
    loopLiftRight: sym.loopLiftRight,
    loopIsPointInversion: sym.loopIsInversion ? 1 : 0,
    scheduleNetTurns: sym.netTurns,
    antipodalMismatch: Number(sym.antipodalMismatch.toFixed(6)),
    antipodalCurrentTotal: Number(sym.antipodalTotal.toFixed(6)),
    generationPlanes: gen.planes,
    generationPlanesSplit: gen.split,
    generationReach111: gen.reachPattern111,
    generationReach12: gen.reachPattern12,
    generationReachSplitLow: Number(gen.reachSplitLow.toFixed(4)),
    generationReachSplitHigh: Number(gen.reachSplitHigh.toFixed(4)),
  }
}

// the committed rule written as a spec is turningWeave, cell by cell
function specIsCommitted(): boolean {
  const opposite = meshOpposites(d4Mesh({ side: 5 }))
  const spec = colorLocalCollision({ spec: CANDIDATES[0]?.spec ?? COLOR_TURN_SPEC, opposite })
  const reference = turningWeave({ opposite })

  for (let t = 0; t < PERIOD; t++) {
    for (let n = 0; n < 400; n++) {
      const v = sampleVector(n * 7 + t)

      if (!applyCell(spec(t), v).every((x, d) => x === applyCell(reference(t), v)[d])) {
        return false
      }
    }
  }

  return true
}

export default experiment({
  id: 'gauge/color-knit-characterization',
  code: 'E-FRC-0149',
  title:
    'what changes when the knit changes: the color turn weave chosen by E-FRC-0148, and its runner-up, beside the committed turning weave through the CPT search of E-FND-0117, the battery of E-FND-0118 with the kick law and protected species, the travel survey of E-FRC-0111, the vacuum line sectors, the symmetry ledger of E-FRC-0113 and E-FRC-0142, the handedness of E-FRC-0142, the spin lift of E-SPN-0044 and the generation copies of E-FRC-0141',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const committedAsSpec = specIsCommitted()
    const profiles = CANDIDATES.map(c => ({ name: c.name, profile: characterize(c) }))
    const of = (name: string): Profile => profiles.find(p => p.name === name)?.profile ?? {}
    const committed = of('committed')
    const chosen = of('chosen')
    const runnerUp = of('runnerUp')

    const controlsHold =
      committedAsSpec &&
      committed.cptIdentityPhase === 23 &&
      committed.cptDenseMismatches === 0 &&
      committed.swapGraphConnected === 1 &&
      committed.interactingDirections === 21 &&
      committed.direction0Offset1 === 0 &&
      committed.direction0Offset2 === 0 &&
      committed.direction0Offset7 === 1 &&
      committed.direction0Offset11 === 1 &&
      committed.travelHalfOrMore === 12 &&
      committed.ledgerForward === 1 &&
      committed.ledgerIdentityForward === 1 &&
      Math.abs((committed.turnLeftAngle ?? 0) - 90) + Math.abs((committed.turnRightAngle ?? 0) - 180) < 1e-6 &&
      (committed.chiralRatioSide9 ?? 0) > 2 &&
      (committed.chiralRatioSide13 ?? 0) > 2 &&
      committed.loopLiftLeft === -1 &&
      committed.loopLiftRight === 1 &&
      committed.generationPlanesSplit === 16

    const changed = Object.keys(chosen).filter(key => chosen[key] !== committed[key])

    return verdict({
      status: controlsHold ? 'pass' : 'fail',
      claim: `the generalized instruments give back the committed knit's own numbers, and against them the chosen color-local knit differs in ${changed.length} of ${Object.keys(chosen).length} measured quantities, every one printed beside the committed value, with the runner-up printed as a third column`,
      metrics: Object.fromEntries(Object.entries(chosen).map(([k, v]) => [`chosen_${k}`, v])),
      control: {
        committedWrittenAsSpecIsTurningWeave: committedAsSpec ? 1 : 0,
        ...Object.fromEntries(Object.entries(committed).map(([k, v]) => [`committed_${k}`, v])),
        ...Object.fromEntries(Object.entries(runnerUp).map(([k, v]) => [`runnerUp_${k}`, v])),
      },
      notes: `L2, exact, no random numbers. Changed against the committed knit: ${changed.join(', ')}. Regime codes for direction 0: 0 blind, 1 a kick of one clock unit, 2 absorbing, 3 other. Sector sizes are the component sizes written as digits, largest first. The kick law is generalized from direction 0 to every species the rule keeps at support 1 for 26 beats, with the slab across each species' path and the phase compared with the same species' free run, so its counts are over (species, offset) pairs. The travel count at full speed takes a reach of exactly 6 sqrt 2 in 6 beats. The characterization is reported, not gated: whether a change is better is the user's decision.`,
    })
  },
})
