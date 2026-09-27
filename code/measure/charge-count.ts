// Charge counted on every beat of the adopted rules, read on the husk (E-FRC-0243). Measurement only: the rules
// (code/rule/trit-column + trit-hop, token-store-knit, flux-store-line) are imported and never changed; the planted
// controls are local defects written here, applied to copies, so the checker can be seen to bite.
//
// WHAT THE CHARGE IS, read from the code:
// - the light's charge is the vibe trit per slot or dock: love +1, fear -1, calm 0 (trit-column's vibe, the source of
//   Gauss's law in bulkGaussViolations; pair-making-knit's pairCharge; flux-store-line's chargeOf)
// - the husk charge of a column is the column sum of its vibes, an integer by construction
// - the rishon reading Q = (love - fear) / 3 (E-FRC-0170, E-SPN-0055, 0077) is a reading of the same count in thirds;
//   the flux-store string's center flux is a trit, so its Gauss's law holds mod 3 and certifies Q only on regions
//   whose boundary carries no center flux

import { buildHopTable, cross, gasStep, type HopTable } from '@/code/rule/trit-hop'
import {
  bulkFlux,
  bulkGaussViolations,
  columnSumLinks,
  emptyTritState,
  huskGaussViolations,
  makeTritLight,
  readHusk,
  tritLightBeat,
  writeHusk,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { cloneStoreState, storeBeat, storeDockCollide, type StoreTally, type TokenStoreKnit, type TokenStoreState } from '@/code/rule/token-store-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { d4BoxCoordinates, d4Vector } from '@/code/substrate/d4-box'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { chargeOf, decodeRegisters, encodeRegisters, gaussHolds, registerSize, streamRegisters, type FluxRegisters, type FluxStoreSpec } from '@/code/rule/flux-store-line'
import { stepTable } from '@/code/rule/locked-token-line'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'

const mod = (a: number, m: number): number => ((a % m) + m) % m

// ---------------------------------------------------------------------------------------------------------
// A. the trit light with the hop gas (E-FRC-0207, 0210): charge crosses bulk links, strings record it

export type GasDefect = 'none' | 'unpaid' | 'creating'

// the light on a Weyl start and a gas of neutral pairs (E-FRC-0210's construction with the Weyl phases moved by
// `member`, so each member of the family is its own start)
export function gasStart(light: TritLight, table: HopTable, member: number, density = 0.25): TritState {
  const s = emptyTritState(light)
  const h = readHusk(light, s)
  const d = light.bulk.depth
  const shift = 131 * member

  for (let l = 0; l < h.angle.length; l++) {
    const n = light.window[l % 9] ?? 1

    h.angle[l] = Math.floor(weyl(l + 1 + shift) * n) - n / 2
  }

  for (let p = 0; p < h.potential.length; p++) {
    h.potential[p] = Math.floor(weyl(p + 7 + shift, SILVER) * 7) - 3
    h.counter[p] = Math.floor(weyl(p + 3 + shift) * light.q) - d
    h.lag[p] = Math.floor(weyl(p + 11 + shift) * light.q) - d
    h.spatial[p] = Math.floor(weyl(p + 13 + shift) * light.q) - d
  }

  writeHusk(light, s, h)

  const bulk = light.bulk

  for (let x = 0; x < bulk.docks; x++) {
    if (weyl(x + 1 + shift, GOLDEN) >= density) continue

    const k = Math.floor(weyl(x + 1 + shift, SILVER) * 12)
    const v = weyl(x + 17 + shift, SILVER) < 0.5 ? 1 : -1
    const y = bulk.neighbour[x * 24 + (table.rootOf[k] ?? 0)] ?? 0
    const l = x * 12 + k

    if (s.vibe[x] !== 0 || s.vibe[y] !== 0 || s.string[l] !== 0 || x === y) continue

    s.vibe[x] = v
    s.vibe[y] = -v
    s.string[l] = v
  }

  return s
}

function huskCharge(light: TritLight, vibe: Int8Array): Int32Array {
  const q = new Int32Array(light.bulk.huskDocks)

  for (let x = 0; x < light.bulk.docks; x++) q[light.bulk.column[x] ?? 0] = (q[light.bulk.column[x] ?? 0] ?? 0) + (vibe[x] ?? 0)

  return q
}

// one step of the gas with an optional planted defect: 'unpaid' swaps the vibes and leaves the string, 'creating'
// copies the vibe onto the far dock and keeps it on the near one (the far dock must be calm)
function gasStepWith(table: HopTable, s: TritState, k: number, phase: number, defect: GasDefect): number {
  const i = k * 2 + phase
  let crossings = 0

  for (let at = table.start[i] ?? 0; at < (table.start[i + 1] ?? 0); at++) {
    const x = table.tails[at] ?? 0

    if (defect === 'none') {
      crossings += cross(table, s, x, k) === 0 ? 0 : 1
      continue
    }

    const y = table.bulk.neighbour[x * 24 + (table.rootOf[k] ?? 0)] ?? 0
    const vx = s.vibe[x] ?? 0
    const vy = s.vibe[y] ?? 0

    if (vx === vy) continue

    if (defect === 'unpaid') {
      s.vibe[x] = vy
      s.vibe[y] = vx
      crossings++
    } else if (vy === 0) {
      s.vibe[y] = vx
      crossings++
    }
  }

  return crossings
}

export type GasRun = { bulkGauss: number; huskGauss: number; continuity: number; chargeChange: number; columnBound: number; crossings: number; charged: number; fingerprint: number }

export function gasRun(member: number, beats: number, defect: GasDefect, side = 4, depth = 4): GasRun {
  const light = makeTritLight({ side, depth, form: 'wave' })
  const table = buildHopTable(light.bulk)
  const s = gasStart(light, table, member)
  const total0 = s.vibe.reduce((a, v) => a + v, 0)
  const out: GasRun = { bulkGauss: 0, huskGauss: 0, continuity: 0, chargeChange: 0, columnBound: 0, crossings: 0, charged: s.vibe.reduce((a, v) => a + (v === 0 ? 0 : 1), 0), fingerprint: 0 }

  for (let t = 0; t < beats; t++) {
    const [k, phase] = gasStep(t)
    const stringBefore = columnSumLinks(light, s.string)
    const chargeBefore = huskCharge(light, s.vibe)

    out.crossings += gasStepWith(table, s, k, phase, defect)

    // the husk current: the column sum of the strings' change (a crossing pays its string by the charge carried)
    const stringAfter = columnSumLinks(light, s.string)
    const div = new Int32Array(light.bulk.huskDocks)

    for (let l = 0; l < light.bulk.huskLinks; l++) {
      const j = (stringBefore[l] ?? 0) - (stringAfter[l] ?? 0)
      const y = Math.floor(l / 9)
      const z = light.bulk.huskNeighbour[l] ?? 0

      div[y] = (div[y] ?? 0) + j
      div[z] = (div[z] ?? 0) - j
    }

    const chargeAfter = huskCharge(light, s.vibe)

    for (let y = 0; y < light.bulk.huskDocks; y++) {
      out.continuity += (chargeAfter[y] ?? 0) - (chargeBefore[y] ?? 0) + (div[y] ?? 0) === 0 ? 0 : 1
      out.columnBound += Math.abs(chargeAfter[y] ?? 0) <= light.bulk.depth ? 0 : 1
    }

    tritLightBeat(light, s)
    out.bulkGauss += bulkGaussViolations(light, s)
    out.huskGauss += huskGaussViolations(light, columnSumLinks(light, bulkFlux(light, s)), s.vibe)
    out.chargeChange += s.vibe.reduce((a, v) => a + v, 0) === total0 ? 0 : 1
  }

  for (let x = 0; x < s.vibe.length; x++) out.fingerprint = (Math.imul(out.fingerprint, 31) + (s.vibe[x] ?? 0) + 2) | 0
  for (let x = 0; x < s.potential.length; x++) out.fingerprint = (Math.imul(out.fingerprint, 31) + (s.potential[x] ?? 0) + 2) | 0

  return out
}

// ---------------------------------------------------------------------------------------------------------
// B. the adopted pair-making knit (E-RLT-0067: the returned-neutral store), read on the husk

const ROOTS = rootsD4()
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type KnitDefect = 'none' | 'loveLove' | 'lossy'

export type KnitRun = {
  dockChargeFailures: number
  continuity: number
  chargeChange: number
  beatMismatch: number
  made: number
  unmade: number
  // columns whose love minus fear is not a multiple of 3 (a fractional rishon charge Q = (love - fear) / 3), summed
  // over beats, and the column-beats read
  rishonFractional: number
  columnBeats: number
  fingerprint: number
}

// the husk column of each box dock, and the column step each root casts
function boxColumns(k: TokenStoreKnit): { column: Int32Array; side: number } {
  const mesh = k.weave.mesh
  // the box has side^4 cells
  const L = Math.round(mesh.cellCount ** 0.25)
  const column = new Int32Array(mesh.cellCount)

  for (let x = 0; x < mesh.cellCount; x++) {
    const v = d4Vector(d4BoxCoordinates({ cell: x, side: L }))

    column[x] = mod(v[0] ?? 0, L) + L * mod(v[1] ?? 0, L) + L * L * mod(v[2] ?? 0, L)
  }

  return { column, side: L }
}

function columnShift(side: number, c: number, d: number): number {
  const r = ROOTS[d] ?? [0, 0, 0, 0]
  const a = c % side
  const b = Math.floor(c / side) % side
  const e = Math.floor(c / (side * side))

  return mod(a + (r[0] ?? 0), side) + side * mod(b + (r[1] ?? 0), side) + side * side * mod(e + (r[2] ?? 0), side)
}

export function knitRun(k: TokenStoreKnit, start: TokenStoreState, beats: number, defect: KnitDefect): KnitRun {
  const cells = k.weave.mesh.cellCount
  const { column, side } = boxColumns(k)
  const open = new Uint8Array(start.point.length)
  const out: KnitRun = { dockChargeFailures: 0, continuity: 0, chargeChange: 0, beatMismatch: 0, made: 0, unmade: 0, rishonFractional: 0, columnBeats: 0, fingerprint: 0 }
  const columns = side ** 3
  const total = (v: Int8Array): number => v.reduce((a, x) => a + x, 0)
  let s = start
  const q0 = total(s.vibe)

  for (let t = 0; t < beats; t++) {
    const tally: StoreTally = { made: 0, unmade: 0 }
    // the rule's own beat
    const next = storeBeat(k, s, open, tally).state

    out.made += tally.made
    out.unmade += tally.unmade

    // the same beat taken apart: collide dock by dock (dock charge checked), then the stream by root shadows
    const c = cloneStoreState(s)

    for (let x = 0; x < cells; x++) {
      let before = 0
      let after = 0

      for (let d = 0; d < 24; d++) before += c.vibe[x * 24 + d] ?? 0

      storeDockCollide(k, c, x)

      if (defect === 'loveLove') {
        // planted: on the first line of dock 0 holding a love-fear pair, the fear becomes a love
        if (x === 0) {
          for (let l = 0; l < 12; l++) {
            const i = LINE_FIRSTS[l] as number
            const j = LINE_SECONDS[l] as number

            if ((c.vibe[i] ?? 0) !== 0 && c.vibe[j] === -(c.vibe[i] ?? 0)) {
              c.vibe[j] = c.vibe[i] ?? 0
              break
            }
          }
        }
      }

      for (let d = 0; d < 24; d++) after += c.vibe[x * 24 + d] ?? 0

      out.dockChargeFailures += before === after ? 0 : 1
    }

    // the husk charge after the stream, predicted from the collided slots moved one column step along each root
    const predicted = new Int32Array(columns)

    for (let x = 0; x < cells; x++) {
      for (let d = 0; d < 24; d++) {
        const v = c.vibe[x * 24 + d] ?? 0

        if (v !== 0) predicted[columnShift(side, column[x] ?? 0, d)] = (predicted[columnShift(side, column[x] ?? 0, d)] ?? 0) + v
      }
    }

    let streamed = next.vibe

    if (defect === 'loveLove' || defect === 'lossy') {
      // the defective beat: streamed from the collided copy; 'lossy' drops the first held slot it meets
      const v = new Int8Array(c.vibe.length)
      let dropped = defect !== 'lossy'

      for (let slot = 0; slot < c.vibe.length; slot++) {
        let value = c.vibe[slot] ?? 0

        if (!dropped && value !== 0) {
          value = 0
          dropped = true
        }

        v[k.knit.target[slot] as number] = value
      }

      streamed = v
    } else {
      for (let i = 0; i < next.vibe.length; i++) {
        const target = k.knit.target[i] as number

        out.beatMismatch += (next.vibe[target] ?? 0) === (c.vibe[i] ?? 0) ? 0 : 1
      }
    }

    const actual = new Int32Array(columns)

    for (let x = 0; x < cells; x++) for (let d = 0; d < 24; d++) actual[column[x] ?? 0] = (actual[column[x] ?? 0] ?? 0) + (streamed[x * 24 + d] ?? 0)

    for (let y = 0; y < columns; y++) {
      out.continuity += actual[y] === predicted[y] ? 0 : 1
      out.rishonFractional += mod(actual[y] ?? 0, 3) === 0 ? 0 : 1
      out.columnBeats++
    }

    out.chargeChange += total(streamed) === q0 ? 0 : 1
    s = defect === 'none' ? next : { ...c, vibe: streamed }
  }

  for (let i = 0; i < s.vibe.length; i++) out.fingerprint = (Math.imul(out.fingerprint, 31) + (s.vibe[i] ?? 0) + 2) | 0
  for (let i = 0; i < s.store.length; i++) out.fingerprint = (Math.imul(out.fingerprint, 31) + (s.store[i] ?? 0) + 2) | 0

  return out
}

// ---------------------------------------------------------------------------------------------------------
// C. the flux-store string (E-SPN-0075): exhaustive over the register space. Its tokens never change kind (the
// register holds positions, labels, fluxes and the store, no kind), so its token charge is kept by construction;
// what can fail is Gauss mod 3, and what it can certify is the charge mod 3

export type FluxRun = {
  states: number
  gaussStates: number
  gaussBroken: number
  arcFailures: number
  arcsChecked: number
  // Gauss states where every link's center flux is 0 though the tokens' total charge is not (charge the flux
  // cannot see, a multiple of 3)
  invisibleCharge: number
  // the planted control: positions stream but no copy is recorded on its link
  unrecordedBroken: number
}

function unrecordedStream(s: FluxStoreSpec, r: FluxRegisters): FluxRegisters {
  return { ...r, x: r.x.map((x, t) => mod(x + stepTable(s.kinds[t]!, s.convention)[r.j[t]!]!, s.ring)) }
}

export function fluxRun(s: FluxStoreSpec): FluxRun {
  const size = registerSize(s)
  const out: FluxRun = { states: size, gaussStates: 0, gaussBroken: 0, arcFailures: 0, arcsChecked: 0, invisibleCharge: 0, unrecordedBroken: 0 }
  const total = s.kinds.reduce((a, k) => a + chargeOf(k), 0)
  const L = s.ring

  for (let index = 0; index < size; index++) {
    const r = decodeRegisters(s, index)

    if (encodeRegisters(s, r) !== index) throw new Error('flux-store encoding is not a bijection')
    if (!gaussHolds(s, r)) continue

    out.gaussStates++

    const next = streamRegisters(s, r)

    out.gaussBroken += gaussHolds(s, next) ? 0 : 1
    out.unrecordedBroken += gaussHolds(s, unrecordedStream(s, r)) ? 0 : 1

    // every arc [a, a + len), 1 <= len < L: its charge equals the flux leaving it minus the flux entering it, mod 3
    const q = new Array<number>(L).fill(0)

    s.kinds.forEach((kind, t) => {
      q[r.x[t]!] = q[r.x[t]!]! + chargeOf(kind)
    })

    for (let a = 0; a < L; a++) {
      let inside = 0

      for (let len = 1; len < L; len++) {
        inside += q[mod(a + len - 1, L)]!

        const outFlux = r.f[mod(a + len - 1, L)]!
        const inFlux = r.f[mod(a - 1, L)]!

        out.arcFailures += mod(inside - (outFlux - inFlux), 3) === 0 ? 0 : 1
        out.arcsChecked++
      }
    }

    if (total !== 0 && r.f.every(f => f === 0)) out.invisibleCharge++
  }

  return out
}
