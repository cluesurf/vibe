// MOTION ON THE TRUE MESH, READ THROUGH THE CUSP SHADOW (E-SPN-0181, OPEN-MOT-03). E-SPN-0156 found that on {3,4,3,4} a
// line meets the cusp layer in at most two docks, so no lone vibe travels on the true husk and a husk particle must be a
// collective pattern. E-SPN-0157 and E-SPN-0158 asked that of the working vacuum's line waves; E-SPN-0160's register
// member, the collective mover spread over all 24 roots that the candidate rule is built on, was read only as a Bloch
// band on the flat D4 mesh and on its depth-period-2 quotient (E-SPN-0167), a flat stand-in. This file runs that member
// on the true mesh at a cusp and reads its husk shadow.
//
// DERIVED BEFORE THE RUN (code/substrate/coxeter/labelled-region cuspRegion, code/measure/cusp-register; the cusp v is the
// base cell's ideal vertex fixed by r1 .. r4; husk positions are the horospherical chart's, in units of the layer's cubes).
// 1. THE SCREEN IS ONE-SIDED. The cusp layer (the cells touching v) is the top of the mesh: a layer cell has 6 facets
//    through v, shared with its 6 layer neighbours (the faces of its husk cube), and 18 that are not, whose neighbours lie
//    deeper (Busemann level 3 or 5 times the layer's). No cell lies above. So at a layer dock 6 slots stay on the screen,
//    18 go down and none go up, where the flat stand-in (depth along e4) has 12 roots in the slice, 6 up and 6 down. THE
//    CUSP ORIENTS THE DEPTH: on the true mesh every excursion off the screen is into the bulk, and the flat slice has no
//    such direction.
// 2. THE MEMBER AT REST SPREADS EVENLY OVER THE 24 SLOTS. S (x) w is the band vector at rest (phase pi + M, E-SPN-0160):
//    P = X (1 + (u - 1) Q_S) sends it to u S (x) w, and X keeps S, so after the first beat each slot carries 1/24 of the
//    weight one dock along. On the true mesh exactly 1/4 stays on the layer and 3/4 goes to depth 1; on the flat box 1/2
//    stays in the slice and 1/4 goes each way, and the achiral rule keeps R4 = diag(1, 1, 1, -1) (a reflection of W(F4),
//    E-SPN-0167 H4), so the flat weight stays mirror-symmetric in depth on every beat.
// 3. THE BOUNCE CARRIES NOTHING ALONG THE HUSK. The swap coin returns a slot's value along -d on the next beat (U0^2 = 1,
//    E-SPN-0161). A layer dock's 18 down slots reach depth-1 docks that hang under that one layer dock (probe 2: 1,134
//    depth-1 docks under 63 layer docks, 18 each, and 6,786 under 377), so what goes down and comes straight back comes
//    back to the dock it left. Husk transport at the screen then has only the 6 layer slots, where the flat slice's band
//    speed is built from all 24 roots (the 2-design sum_r (u . r)^2 = 12 of E-SPN-0143). PREDICTED: the member does not
//    travel on the true husk as it does on the flat stand-in.
//
// THE MOVER. The band member at husk momentum q along husk axis 1: at each layer dock, the upper-band vector
// (code/measure/cusp-register upperBandMember) of the dense cycle at the dock's own label momentum K = (q / 2) r, r the
// root of the slot that steps +1 along husk axis 1 there (so K . r = q, one husk unit a step, like the flat's
// K = (q, 0, 0, 0) on the root (1, 0, 0, 1)), times a Gaussian envelope of width sigma and the phase e^(i q h1), over the
// layer docks within 3 sigma. The flat reference is the same member on the flat quotient (E-SPN-0155's husk box, docks
// exactly Z^3, where the band is exactly the bulk band on the slice K = (q, 0), E-SPN-0167), same q, sigma and reach. The
// true region is the layer patch to a skin radius and every cell below it to a depth cut, the frontier ABSORBING and the
// absorbed weight kept at the dock where it left, so the centroid counts all of the weight.
//
// GATES, fixed before the gate run (GATE_PLAN: 8 beats, q = 0.6, the light member and the massless one, two cuts: depth 1
// with skin 12 and sigma 2, depth 2 with skin 6 and sigma 1.5).
//  M1 THE SCREEN (exact counts, read from the frames, not the region): at every layer dock of the first cut's patch, 6
//     slots at the layer's level, 18 below it, 0 above; every depth-1 dock of that region has exactly 1 layer neighbour;
//     the flat roots split 12, 6, 6 by their depth component.
//  M2 THE FIRST BEAT AND THE FLAT MIRROR (exact, derived item 2): the rest member S (x) scalar at the base dock puts 1/4 on
//     the layer and 3/4 at depth 1 after one beat (1e-12); on the flat box of side 16, 1/2 in the slice and 1/4 at depth
//     +1 and at -1 (1e-12), and the flat weight is R4-symmetric on every beat to the last (1e-12 summed).
//  M3 THE CLAIM (item 3 predicts it FAILS): the band member travels on the true husk as on the flat stand-in. For each cut
//     and each member, the true husk centroid shift after the last beat has the flat reference's sign and at least half
//     its size. M3 holds only if all four hold.
// INSTRUMENT. I1 every band vector used is an eigenvector of its dense cycle (residual <= 1e-12). I2 on the true regions
//  the weight inside plus the weight absorbed stays 1 (1e-10). I3 the flat quotient walk is unitary (1e-10). I2 and I3
//  compare a float sum of up to 2.6e7 squared amplitudes with 1, whose rounding alone can reach 1e-12 (the smoke read
//  2e-14 and 5e-14 on 5e5 terms), so they were set to 1e-10 after the smoke and before the gate run.
// VERDICT, fixed before the run: FAIL (as derived) when M1, M2 and the instrument hold and M3 fails: the register member
//  does not travel on the true husk. PASS when M1, M2, the instrument and M3 hold. PARTIAL otherwise.
// READ, gating nothing: the layer weight and the weight past the cut per beat, the shift per beat on both meshes, and how
//  the leak moves between the depth-1 and depth-2 cuts.
// NOT REACHED: the pair census on the true horosphere, which OPEN-MOT-03 also names. It needs two members on a region of
//  this size (the two-body space is the square of 10^5 docks times 192 modes), and item 3 removes its object: a census
//  counts channels of a band that, on the true screen, the member does not form.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/hm-probe2.log (region sizes: skin 3 depth 1, 1,197 cells; skin 6 depth 2,
//  133,181; skin 3 depth 3, 412,401; 0 inconsistent steps). tmp/hm-motion-probe-6-1.log (the rest member at one dock:
//  true beat 1 layer 0.250000 and depth 1 0.750000; flat slabs 0.5, 0.25, 0.25 and mean depth 1e-16). The pure-S packet
//  with a husk phase barely moved on either mesh (tmp/hm-packet-probe.log), because S splits between the upper and lower
//  bands; that is why the mover is the band projection. tmp/hm-packet-probe2 logs, with the light member at q = 0.6:
//  true shift +0.063 (skin 12, depth 1, sigma 3), +0.060 (skin 8, depth 1, sigma 2), +0.058 (skin 8, depth 2, sigma 2,
//  3.3 GB, which is why the gate's depth-2 cut is skin 6); flat quotient -1.14 (sigma 3) and -0.75 (sigma 2); weight past
//  the cut at beat 8 0.39 (depth 1) and 0.10 (depth 2). So M3 was seen to fail for the light member before these gates
//  were written; the massless member and the skin-6 depth-2 cut were not run. tmp/hm-motion-smoke.log (SMOKE_PLAN: skin
//  4, depth 1, sigma 1, 2 beats, the light member; gating nothing): every code path ran, M1 and M2 as derived, M3 false
//  (true -0.005 against flat -0.253), and the float-sum tolerance of I2 and I3 was moved as stated above.
//
// FIRST RUN (tmp/hm-motion-gate-run1.log, 45 s, 3.2 GB): FAIL, as derived. M1, M2 and the instrument hold, M3 fails in
//  all four readings; no gate moved and none was rerun.
//  - M1: 2,625 of 2,625 layer docks split 6 on the layer, 18 down, 0 up; 47,250 of 47,250 depth-1 docks under exactly one
//    layer dock; the flat roots split 12, 6, 6.
//  - M2: true beat 1, layer 0.250000000000 and depth 1 0.750000000000; flat slice 0.5, up 0.25, down 0.25 (to 1e-16);
//    the flat R4 gap at most 8.3e-17 over 8 beats (mean depth -3.2e-16).
//  - M3, shift after 8 beats, true against flat: depth 1 light +0.060 against -0.748, massless +0.019 against -1.003;
//    depth 2 light +0.054 against -0.456, massless +0.015 against -0.598. The true centroid swings with the bounce
//    (-0.06, 0, +0.05, ...) and does not drift; the weight past the cut after 8 beats is 0.39 and 0.36 at depth 1, 0.10
//    at depth 2, and the layer holds 0.33 to 0.64 of it, alternating beat by beat.
//  - Instrument: band residual 3.1e-15, bookkeeping 3.0e-13, flat unitarity 1.4e-12 (inside the 1e-10 set before the
//    run; above the 1e-12 first written, which is why it was moved).
// NEXT. (1) A mover built for the screen rather than carried over from the flat band: an eigenmode of the rule on the
//  layer and the docks under it, with Bloch momentum along the horosphere's translations (the region below a cusp,
//  modulo the husk lattice, is finite at each depth), asked whether any mode stays near the layer and what its husk
//  dispersion is. (2) A reading of the husk through the bulk rather than at the layer: a member deep in the bulk seen
//  through its shadow, which E-SPN-0156 bounds for a line but not for a spreading member. (3) The pair census, once a
//  mover that stays on the screen exists.
//
// Depth L2 (the register rule run on the true mesh and read on its husk; the screen's one-sidedness is geometry).
// DETERMINISM: no random numbers; the envelopes are fixed functions of husk position. NOTHING MOVES: the pieces hand
// values between slots and register components of one dock, and the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  densePiece,
  dockWeights,
  memberAt,
  newState,
  norm2,
  placeAt,
  registerBeat,
  SCALAR_BLADE,
  upperBandMember,
  type PieceSpec,
  type State,
  type Unit,
  type Walk,
} from '@/code/measure/cusp-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { cycleMatrix } from '@/code/measure/swap-cone'
import { REGISTER_ROOTS, diracPhase } from '@/code/measure/spinor-register'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { huskBoxTables } from '@/code/measure/husk-meson'
import { d4BoxMesh } from '@/code/substrate/d4-box-integer'
import {
  labelledCoin,
  labelTransports,
} from '@/code/substrate/coxeter/label-transport'
import { cuspRegion } from '@/code/substrate/coxeter/labelled-region'
import { horosphericalChart } from '@/code/measure/hyperbolic-lines'
import { matMul, matVec } from '@/code/substrate/coxeter/minkowski'

const EXACT = 1e-12
const SUM = 1e-10
const LIGHT: readonly [number, number] = [-1, 4]
const MASSLESS: readonly [number, number] = [0, 3]

export type MotionCut = { depth: number; skin: number; sigma: number }

export type MotionPlan = {
  beats: number
  q: number
  masses: (readonly [number, number])[]
  cuts: MotionCut[]
  quotientSide: number
  boxSide: number
}

export const GATE_PLAN: MotionPlan = {
  beats: 8,
  q: 0.6,
  masses: [LIGHT, MASSLESS],
  cuts: [
    { depth: 1, skin: 12, sigma: 2 },
    { depth: 2, skin: 6, sigma: 1.5 },
  ],
  quotientSide: 32,
  boxSide: 16,
}

export const SMOKE_PLAN: MotionPlan = {
  beats: 2,
  q: 0.6,
  masses: [LIGHT],
  cuts: [{ depth: 1, skin: 4, sigma: 1 }],
  quotientSide: 12,
  boxSide: 6,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/cusp-motion',
  code: 'E-SPN-0181',
  title:
    'the register member does not travel on the true husk, fail as derived: at a cusp the screen is one-sided (2,625 of 2,625 layer docks send 6 slots along the layer, 18 down and none up, and 47,250 of 47,250 depth-1 docks hang under exactly one layer dock), so the member at rest puts exactly 1/4 of its weight on the layer and 3/4 below after one beat, where the flat stand-in keeps 1/2 in its slice and sends 1/4 each way; a band packet at husk momentum 0.6 moves 0.46 to 1.00 husk docks in 8 beats on the flat quotient but only 0.015 to 0.060, of the wrong sign, on the true mesh, at depth cuts 1 and 2 and for the light and the massless member, while 0.10 (depth 2) to 0.39 (depth 1) of it passes below the cut: the bounce returns every excursion below the screen to the dock it left, so only 6 of 24 slots can carry the member along the husk; the pair census on the true horosphere is not reached',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return cuspMotionRun(GATE_PLAN)
  },
})

const unitOf = (k: readonly [number, number]): Unit => {
  const t = unitAngle(ringUnit(k[0], k[1]))

  return [Math.cos(t), Math.sin(t)]
}

function scheduleFor(u: Unit): PieceSpec[][] {
  const c: Unit = [u[0], -u[1]]

  return [
    [{ sector: 'S', plus: u, minus: u }],
    [{ sector: 'D', plus: c, minus: c }],
  ]
}

type Track = {
  shift: number[]
  layer: number[]
  past: number[]
  bookkeeping: number
}

export function cuspMotionRun(plan: MotionPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const coin = labelledCoin()
  const tau = labelTransports({ coin, kind: 'antipodal' })
  const chart = horosphericalChart(coin)
  const c0 = coin.frame.center
  const ratio = (g: number[][]): number =>
    chart.level(matVec(g, c0)) / chart.layerLevel
  const T = plan.beats

  // ---------------- M1: the screen ----------------
  const first = plan.cuts[0]!
  const r1 = cuspRegion({ coin, ...first })

  let layerDocks = 0
  let layerSplitRight = 0
  let depthOneDocks = 0
  let depthOneSingle = 0
  let above = 0

  for (let x = 0; x < r1.cells; x++) {
    if (r1.depth[x]! > 1) {
      continue
    }

    const f = r1.frames[x]!
    const levels = tau.map(t => ratio(matMul(f, t)))
    const same = levels.filter(l => Math.abs(l - 1) < 1e-9).length
    const down = levels.filter(l => l > 1 + 1e-9).length
    const up = levels.filter(l => l < 1 - 1e-9).length

    if (r1.depth[x] === 0) {
      layerDocks++
      above += up

      if (same === 6 && down === 18 && up === 0) {
        layerSplitRight++
      }
    } else {
      depthOneDocks++

      if (same === 1) {
        depthOneSingle++
      }
    }
  }

  const flatSplit = [0, 1, -1].map(
    s => DOCK_ROOTS.filter(r => r[3] === s).length,
  )
  const M1 =
    layerDocks > 0 &&
    layerSplitRight === layerDocks &&
    above === 0 &&
    depthOneDocks > 0 &&
    depthOneSingle === depthOneDocks &&
    flatSplit.join(',') === '12,6,6'

  log('M1')

  // ---------------- M2: the first beat, and the flat mirror ----------------
  const light = scheduleFor(unitOf(LIGHT))
  const trueWalk = (region: typeof r1, schedule: PieceSpec[][]): Walk => ({
    cells: region.cells,
    neighbour: region.neighbour,
    classOf: new Int8Array(region.cells),
    schedule,
    frontier: 'absorb',
  })
  const rest = newState(r1.cells)

  memberAt(rest, 0, SCALAR_BLADE)

  const restOne = dockWeights(
    registerBeat(trueWalk(r1, light), rest, 0).state,
    r1.cells,
  )
  const restLayer = restOne.reduce(
    (s, w, x) => s + (r1.depth[x] === 0 ? w : 0),
    0,
  )
  const restDeep = restOne.reduce(
    (s, w, x) => s + (r1.depth[x] === 1 ? w : 0),
    0,
  )
  const side = plan.boxSide
  const box = d4BoxMesh({ side })
  const boxCells = side ** 4
  const boxNb = new Int32Array(boxCells * 24)

  for (let x = 0; x < boxCells; x++) {
    for (let d = 0; d < 24; d++) {
      boxNb[x * 24 + d] = box.neighbour(x, d)
    }
  }

  // the positions of the box docks by breadth-first lifting from dock 0, and the R4 image of every dock
  const pos: number[][] = new Array(boxCells)

  pos[0] = [0, 0, 0, 0]

  const queue = [0]

  for (let i = 0; i < queue.length; i++) {
    const x = queue[i]!

    for (let d = 0; d < 24; d++) {
      const n = boxNb[x * 24 + d]!

      if (pos[n] === undefined) {
        pos[n] = pos[x]!.map((c, k) => c + DOCK_ROOTS[d]![k]!)
        queue.push(n)
      }
    }
  }

  // R4 sends the lift of x to (p1, p2, p3, -p4), found through the step table from dock 0
  const mirror = new Int32Array(boxCells)
  const reflectRoot = DOCK_ROOTS.map(r =>
    DOCK_ROOTS.findIndex(
      o => o[0] === r[0] && o[1] === r[1] && o[2] === r[2] && o[3] === -r[3]!,
    ),
  )
  const parent = new Int32Array(boxCells).fill(-1)
  const parentSlot = new Int32Array(boxCells).fill(-1)
  const seen = new Uint8Array(boxCells)

  seen[0] = 1

  for (const x of queue) {
    for (let d = 0; d < 24; d++) {
      const n = boxNb[x * 24 + d]!

      if (!seen[n]) {
        seen[n] = 1
        parent[n] = x
        parentSlot[n] = d
      }
    }
  }

  mirror[0] = 0

  for (const x of queue.slice(1)) {
    mirror[x] = boxNb[mirror[parent[x]!]! * 24 + reflectRoot[parentSlot[x]!]!]!
  }

  const boxWalk: Walk = {
    cells: boxCells,
    neighbour: boxNb,
    classOf: new Int8Array(boxCells),
    schedule: light,
    frontier: 'reflect',
  }

  let flat = newState(boxCells)

  memberAt(flat, 0, SCALAR_BLADE)

  let mirrorGap = 0
  let slab = [0, 0, 0]
  let meanDepth = 0

  for (let t = 0; t < T; t++) {
    flat = registerBeat(boxWalk, flat, t).state

    const w = dockWeights(flat, boxCells)

    let gap = 0

    for (let x = 0; x < boxCells; x++) {
      gap += Math.abs(w[x]! - w[mirror[x]!]!)
    }

    mirrorGap = Math.max(mirrorGap, gap)

    if (t === 0) {
      slab = [0, 1, -1].map(s =>
        w.reduce((a, v, x) => a + (pos[x]![3] === s ? v : 0), 0),
      )
    }

    meanDepth = w.reduce((a, v, x) => a + v * pos[x]![3]!, 0)
  }

  const M2 =
    Math.abs(restLayer - 0.25) <= EXACT &&
    Math.abs(restDeep - 0.75) <= EXACT &&
    Math.abs(slab[0]! - 0.5) <= EXACT &&
    Math.abs(slab[1]! - 0.25) <= EXACT &&
    Math.abs(slab[2]! - 0.25) <= EXACT &&
    mirrorGap <= EXACT

  log('M2')

  // ---------------- M3: the band member on both meshes ----------------
  const bandCache = new Map<
    string,
    ReturnType<typeof upperBandMember>
  >()

  let residual = 0

  const band = (
    mass: readonly [number, number],
    K: number[],
  ): ReturnType<typeof upperBandMember> => {
    const key = `${mass.join(',')}|${K.map(x => x.toFixed(12)).join(',')}`
    const hit = bandCache.get(key)

    if (hit) {
      return hit
    }

    const u = unitOf(mass)
    const M = 2 * (wrap(Math.atan2(u[1], u[0]) - Math.PI) / 2)
    const cycle = cycleMatrix(
      scheduleFor(u).map(p => densePiece(p[0]!)),
      REGISTER_ROOTS,
      K,
    )
    const out = upperBandMember(cycle, diracPhase(K, M))

    residual = Math.max(residual, out.residual)
    bandCache.set(key, out)

    return out
  }
  const envelope = (h: readonly number[], sigma: number): number =>
    Math.exp(-(h[0]! ** 2 + h[1]! ** 2 + h[2]! ** 2) / (2 * sigma * sigma))

  let bookkeeping = 0
  let unitarity = 0

  const runTrue = (
    region: typeof r1,
    mass: readonly [number, number],
    sigma: number,
  ): Track => {
    const reach = 3 * sigma
    const s = newState(region.cells)
    const docks: { x: number; d: number; a: number }[] = []

    for (let x = 0; x < region.cells; x++) {
      const h = region.husk[x]!

      if (region.depth[x] !== 0 || Math.hypot(h[0]!, h[1]!, h[2]!) > reach) {
        continue
      }

      for (let d = 0; d < 24; d++) {
        const y = region.neighbour[x * 24 + d]!

        if (y < 0 || region.depth[y] !== 0) {
          continue
        }

        const g = region.husk[y]!

        if (
          Math.abs(g[0]! - h[0]! - 1) < 1e-6 &&
          Math.abs(g[1]! - h[1]!) < 1e-6 &&
          Math.abs(g[2]! - h[2]!) < 1e-6
        ) {
          docks.push({ x, d, a: envelope(h, sigma) })
        }
      }
    }

    const norm = Math.sqrt(docks.reduce((t, k) => t + k.a * k.a, 0))

    for (const { x, d, a } of docks) {
      placeAt(
        s,
        x,
        band(
          mass,
          DOCK_ROOTS[d]!.map(c => (plan.q / 2) * c),
        ),
        a / norm,
        plan.q * region.husk[x]![0]!,
      )
    }

    const walk = trueWalk(region, scheduleFor(unitOf(mass)))
    const at = (w: Float64Array): number =>
      w.reduce((t, v, x) => t + v * region.husk[x]![0]!, 0)
    const start = at(dockWeights(s, region.cells))
    const track: Track = { shift: [], layer: [], past: [], bookkeeping: 0 }

    let state: State = s
    let lostW = 0
    let lostH = 0

    for (let t = 0; t < T; t++) {
      const step = registerBeat(walk, state, t)

      state = step.state
      step.lost.forEach((w, x) => {
        if (w !== 0) {
          lostW += w
          lostH += w * region.husk[x]![0]!
        }
      })

      const w = dockWeights(state, region.cells)
      const inside = w.reduce((a, v) => a + v, 0)

      track.shift.push((at(w) + lostH) / (inside + lostW) - start)
      track.layer.push(
        w.reduce((a, v, x) => a + (region.depth[x] === 0 ? v : 0), 0),
      )
      track.past.push(lostW)
      bookkeeping = Math.max(bookkeeping, Math.abs(inside + lostW - 1))
    }

    return track
  }

  const L = plan.quotientSide
  const quotient = huskBoxTables(L)
  const qCells = quotient.cells
  const qNb = Int32Array.from(quotient.target, v => Math.floor(v / 24))
  const half = L / 2
  const qPos = Array.from({ length: qCells }, (_, x) =>
    [x % L, Math.floor(x / L) % L, Math.floor(x / (L * L))].map(v =>
      v >= half ? v - L : v,
    ),
  )
  const runFlat = (
    mass: readonly [number, number],
    sigma: number,
  ): number[] => {
    const reach = 3 * sigma
    const s = newState(qCells)
    const docks = qPos
      .map((h, x) => ({ x, h }))
      .filter(({ h }) => Math.hypot(h[0]!, h[1]!, h[2]!) <= reach)
    const norm = Math.sqrt(
      docks.reduce((t, { h }) => t + envelope(h, sigma) ** 2, 0),
    )
    const local = band(mass, [plan.q, 0, 0, 0])

    for (const { x, h } of docks) {
      placeAt(s, x, local, envelope(h, sigma) / norm, plan.q * h[0]!)
    }

    const walk: Walk = {
      cells: qCells,
      neighbour: qNb,
      classOf: new Int8Array(qCells),
      schedule: scheduleFor(unitOf(mass)),
      frontier: 'reflect',
    }
    const at = (w: Float64Array): number =>
      w.reduce((t, v, x) => t + v * qPos[x]![0]!, 0)
    const start = at(dockWeights(s, qCells))
    const out: number[] = []

    let state: State = s

    for (let t = 0; t < T; t++) {
      state = registerBeat(walk, state, t).state
      out.push(at(dockWeights(state, qCells)) - start)
      unitarity = Math.max(unitarity, Math.abs(norm2(state) - 1))
    }

    return out
  }

  type Reading = {
    cut: MotionCut
    mass: readonly [number, number]
    trueTrack: Track
    flatShift: number[]
    holds: boolean
  }

  const readings: Reading[] = []

  plan.cuts.forEach((cut, ci) => {
    const region = ci === 0 ? r1 : cuspRegion({ coin, ...cut })

    for (const mass of plan.masses) {
      const trueTrack = runTrue(region, mass, cut.sigma)
      const flatShift = runFlat(mass, cut.sigma)
      const a = trueTrack.shift[T - 1]!
      const b = flatShift[T - 1]!

      readings.push({
        cut,
        mass,
        trueTrack,
        flatShift,
        holds: Math.sign(a) === Math.sign(b) && Math.abs(a) >= Math.abs(b) / 2,
      })
      log(`M3 depth ${cut.depth} mass ${mass.join(',')}`)
    }
  })

  const M3 = readings.every(r => r.holds)
  const I1 = residual <= EXACT
  const I2 = bookkeeping <= SUM
  const I3 = unitarity <= SUM
  const instrument = I1 && I2 && I3
  const status: Verdict['status'] =
    M1 && M2 && instrument ? (M3 ? 'pass' : 'fail') : 'partial'
  const f = (x: number, d = 5): string => x.toFixed(d)
  const e = (x: number): string => x.toExponential(2)
  const metrics: Record<string, number> = {
    M1: flag(M1),
    M2: flag(M2),
    M3: flag(M3),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    layerDocks,
    depthOneDocks,
    restLayer,
    restDeep,
    flatSlice: slab[0]!,
    flatUp: slab[1]!,
    flatDown: slab[2]!,
    flatMirrorGap: mirrorGap,
    flatMeanDepth: meanDepth,
    bandResidual: residual,
    bookkeeping,
    unitarity,
    seconds: (Date.now() - started) / 1000,
  }

  readings.forEach(r => {
    const tag = `d${r.cut.depth}_${r.mass[1] === 3 ? 'massless' : 'light'}`

    metrics[`trueShift_${tag}`] = r.trueTrack.shift[T - 1]!
    metrics[`flatShift_${tag}`] = r.flatShift[T - 1]!
    metrics[`truePast_${tag}`] = r.trueTrack.past[T - 1]!
    metrics[`trueLayer_${tag}`] = r.trueTrack.layer[T - 1]!
  })

  return verdict({
    status,
    claim: `M1 ${M1} (${layerSplitRight} of ${layerDocks} layer docks split 6 on the layer, 18 down, ${above} up; ${depthOneSingle} of ${depthOneDocks} depth-1 docks under exactly one layer dock; flat roots ${flatSplit.join(', ')}); M2 ${M2} (true beat 1: layer ${f(restLayer, 12)}, depth 1 ${f(restDeep, 12)}; flat slice ${f(slab[0]!, 12)}, up ${f(slab[1]!, 12)}, down ${f(slab[2]!, 12)}; flat R4 gap ${e(mirrorGap)}); M3 ${M3} (${readings.map(r => `depth ${r.cut.depth} ${r.mass[1] === 3 ? 'massless' : 'light'}: true ${f(r.trueTrack.shift[T - 1]!)} against flat ${f(r.flatShift[T - 1]!)}`).join('; ')}); instrument I1 ${I1} (${e(residual)}) I2 ${I2} (${e(bookkeeping)}) I3 ${I3} (${e(unitarity)})`,
    metrics,
    control: {
      flatShiftLight: readings[0]!.flatShift[T - 1]!,
      flatMirrorGap: mirrorGap,
    },
    notes: `L2. Beats ${T}, q ${plan.q}. Per cut and member, per beat: ${readings
      .map(
        r =>
          `[depth ${r.cut.depth} skin ${r.cut.skin} sigma ${r.cut.sigma} ${r.mass[1] === 3 ? 'massless' : 'light'}: true shift ${r.trueTrack.shift.map(x => f(x, 4)).join(' ')}; layer ${r.trueTrack.layer.map(x => f(x, 3)).join(' ')}; past the cut ${r.trueTrack.past.map(x => f(x, 3)).join(' ')}; flat shift ${r.flatShift.map(x => f(x, 4)).join(' ')}]`,
      )
      .join(' ')}. Flat box mean depth after the last beat ${e(meanDepth)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
