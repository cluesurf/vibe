// THE GAUGE-INVARIANT CAGE READ FOR THE COLOUR GATES (moving-matter item 0065, decision 013 point 2). C is read from a
// start that is a function of the gauge orbit only: one dock, colour maximally mixed,
//
//   rho0 = |x0><x0| (x) I_3/3 (x) s0
//
// with x0 E-SPN-0196's envelope centre (dock 0) and s0 the member's non-colour state there: the slot-uniform register
// mode 0 (E-SPN-0196's rest-band shape, range Q_S), normalized on the one dock. rho0 is evolved as its three colour
// starts e_c and the probabilities summed. A site-wise gauge transform G = g(x) at dock x maps the walk U to G U G^dag
// and the three starts to g(x0) e_c, whose summed projector is g(x0) I_3 g(x0)^dag = I_3: so the summed probability at
// every dock, its rms and C are exactly gauge invariant (rounding only). Same cage box (side 20), beats (64), trivial
// carriage (k 1, the links ignored, the same one-dock start), mixer ringUnit(-1, 4) and slope over beats 16 to 64 as
// E-SPN-0196. The old multi-dock packet's role-0 ratio (color-gates cageRead) is kept as a printed diagnostic.
//
// DETERMINISM: no random numbers. FLOAT: the exact Q(zeta_9) lifts as floats.

import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { bulkBox, type ColorBox } from '@/code/measure/color-slab'
import {
  cageRead,
  plaquetteRead,
  reverseGap,
  sigmaTable,
  type ColorField,
  type GatesPlan,
  type PlaquetteRead,
} from '@/code/measure/color-gates'
import {
  CAGING_MODES,
  CAGING_REG,
  CAGING_SLOTS,
  cagingBeat,
  cagingEngine,
  offsetDistances,
  offsetOf,
  slope,
  spreadRead,
  trivialRole,
  type CagingState,
  type RoleLinks,
} from '@/code/measure/holonomy-caging'

const X0 = 0

export type DockCageRead = {
  // the gated C: speed of the triplet carriage from rho0 over the trivial carriage's from the same dock
  speedT: number
  speedC: number
  ratio: number
  alphaC: number
  rmsT: number[]
  rmsC: number[]
  // each colour start's own rms per beat (not gauge invariant alone; their probability sum is)
  rmsColor: number[][]
  boxRms: number
  // the free one-dock run unsaturated: rising over every 8-beat window and below 0.85 of the box rms at the end
  unsaturated: boolean
  normDrift: number
  // the old multi-dock packet's role-0 ratio (E-SPN-0196's read, NOT gauge invariant), a diagnostic only
  packetRatio: number
  packetSeconds: number
  plaquette: PlaquetteRead
  reverseBad: number
  meshMatch: boolean
  seconds: number
}

type DockBox = {
  box: ColorBox
  weave: ColorWeave
  r2: Float64Array
  boxRms: number
  dockOffset: Int32Array
  meshMatch: boolean
}

const boxes = new Map<number, DockBox>()

function dockBoxOf(side: number): DockBox {
  if (!boxes.has(side)) {
    const box = bulkBox(side)
    const weave = makeColorWeave({ side, table: 'bind' })
    const r2 = offsetDistances(side)
    let meshMatch = weave.mesh.cellCount === box.cells

    for (let x = 0; x < box.cells && meshMatch; x++) {
      for (let d = 0; d < CAGING_SLOTS; d++) {
        if (weave.mesh.neighbour(x, d) !== box.nb[x * CAGING_SLOTS + d]) {
          meshMatch = false
        }
      }
    }

    boxes.set(side, {
      box,
      weave,
      r2,
      boxRms: Math.sqrt(r2.reduce((a, b) => a + b, 0) / r2.length),
      dockOffset: Int32Array.from({ length: box.cells }, (_, x) => offsetOf(side, x, X0)),
      meshMatch,
    })
  }

  return boxes.get(side)!
}

const memberU = (): [number, number] => {
  const th = unitAngle(ringUnit(-1, 4))

  return [Math.cos(th), Math.sin(th)]
}

// one dock x0, slot-uniform register mode 0, colour c: amplitude 1/sqrt(24) on each slot
export function dockStart(cells: number, k: number, color: number): CagingState {
  const s: CagingState = {
    re: new Float64Array(cells * CAGING_MODES * k),
    im: new Float64Array(cells * CAGING_MODES * k),
  }
  const a = 1 / Math.sqrt(CAGING_SLOTS)

  for (let d = 0; d < CAGING_SLOTS; d++) {
    s.re[((X0 * CAGING_SLOTS + d) * CAGING_REG + 0) * k + color] = a
  }

  return s
}

type Track = { rms: number[]; perStart: number[][]; drift: number }

// the rms per beat of the probability summed over the given colour starts
function dockTrack(db: DockBox, role: RoleLinks, beats: number, colors: readonly number[]): Track {
  const side = Math.round(db.box.cells ** 0.25)
  const E = cagingEngine(db.weave, role, memberU())
  const m2 = Array<number>(beats + 1).fill(0)
  const norm = Array<number>(beats + 1).fill(0)
  const perStart: number[][] = []

  for (const c of colors) {
    const start = dockStart(db.box.cells, role.k, c)
    const own: number[] = []

    let s: CagingState = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }

    for (let b = 0; b <= beats; b++) {
      const read = spreadRead({ side, k: role.k, x0: X0, r2: db.r2, start, s, dockOffset: db.dockOffset })

      m2[b]! += read.rms ** 2 * read.norm
      norm[b]! += read.norm
      own.push(read.rms)

      if (b < beats) {
        s = cagingBeat(E, s, b)
      }
    }

    perStart.push(own)
  }

  return {
    rms: m2.map((v, b) => Math.sqrt(v / norm[b]!)),
    perStart,
    drift: Math.max(...norm.map(v => Math.abs(v / colors.length - 1))),
  }
}

const trivialTracks = new Map<string, Track>()

export function dockCageRead(field: ColorField, plan: GatesPlan): DockCageRead {
  const started = Date.now()
  const { side, beats, fitFrom } = plan.cage
  const db = dockBoxOf(side)
  const link = field.on(db.box, 'bulk')
  const role: RoleLinks = { k: 3, mats: sigmaTable().lifts.floats, link }
  const key = `${side}-${beats}`

  if (!trivialTracks.has(key)) {
    trivialTracks.set(key, dockTrack(db, trivialRole(db.box.cells), beats, [0]))
  }

  const T = trivialTracks.get(key)!
  const C = dockTrack(db, role, beats, [0, 1, 2])
  const xs = Array.from({ length: beats - fitFrom + 1 }, (_, i) => fitFrom + i)
  const speedT = slope(xs, xs.map(b => T.rms[b]!))
  const speedC = slope(xs, xs.map(b => C.rms[b]!))
  const windows = xs.filter(b => (b - fitFrom) % 8 === 0 && b + 8 <= beats)
  const rising = windows.every(b => T.rms[b + 8]! > T.rms[b]!)
  const packetStarted = Date.now()
  const packet = cageRead(field, plan)
  const packetSeconds = (Date.now() - packetStarted) / 1000

  return {
    speedT,
    speedC,
    ratio: speedC / speedT,
    alphaC: slope(xs.map(Math.log), xs.map(b => Math.log(C.rms[b]!))),
    rmsT: T.rms,
    rmsC: C.rms,
    rmsColor: C.perStart,
    boxRms: db.boxRms,
    unsaturated: rising && T.rms[beats]! < 0.85 * db.boxRms,
    normDrift: Math.max(T.drift, C.drift, packet.normDrift),
    packetRatio: packet.ratio,
    packetSeconds,
    plaquette: plaquetteRead(db.box, link),
    reverseBad: reverseGap(db.box, link),
    meshMatch: db.meshMatch && packet.meshMatch,
    seconds: (Date.now() - started) / 1000,
  }
}
