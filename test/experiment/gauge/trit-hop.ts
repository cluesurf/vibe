// Matter hops on string trits (E-FRC-0210): the charges of the trit-column light (E-FRC-0207) move. A vibe
// crossing a bulk link flips that link's string trit, the current's record, and the crossing is refused when
// the trit is full.
//
// The rule, code/rule/trit-hop. A crossing swaps the vibes at the two ends of one bulk link, carrying J = v_x
// - v_y from tail to head, and pays s_l <- s_l - J; it is refused when s_l - J leaves -1 .. 1. A step applies
// it on a matching (every other link of each orbit of one first root), so a step is its own inverse. The gas
// runs root t mod 12 at phase floor(t / 12) mod 2 at beat t, then the light beat of code/rule/trit-column.
// The matter reads no field here: this is the kinematics of charge on trits, not a force law.
//
// Exact statements, derived before any run:
// - Gauss: the crossing changes v_x by -J, v_y by +J and the outflow of s at x by -J, at y by +J, and the
//   light changes only u, whose curl has no divergence. So div(s - C^T u) - v is unchanged at every bulk dock
//   at every beat, and the column sums inherit it on the husk
// - continuity: the husk current on a husk link is the column sum of the crossings over it, J_h = -(change
//   of the column-summed string), and dQ_y + (div J_h)_y = 0 at every husk dock, exactly
// - the refusal law: of the 27 states (v_x, v_y, s) of one link, the crossing is allowed iff |s - v_x + v_y|
//   <= 1; the refused ones are exactly those with J = 2 and s < 1, or J = -2 and s > -1, or J = 1 and s = -1,
//   or J = -1 and s = 1: 8 of 27 (counted below by hand: J = +-2 occurs once each with 3 strings, 2 refused
//   each, 4; J = +-1 occurs twice each, 1 refused per occurrence, 4)
// - what the refusal caps: the string records the NET charge crossed since the start, so from s = 0 a link
//   carries at most one net unit either way, for all time. A charge oscillating forth and back is never
//   refused; a charge going around a closed loop of links is refused on its second lap. It is not a rate cap
//   (a speed of light for charge) but a cap on the net transport through each bulk link, and the light never
//   relieves it (its kick moves only potentials)
//
// Gates, fixed before the first run:
// G  Gauss: a gas of neutral pairs (golden Weyl placement, a quarter of the docks tried) under the gas
//    schedule and the wave-form light from a golden Weyl start, side 4, D = 8 and D = 11, 240 beats each:
//    0 bulk and 0 husk Gauss violations at every beat
// Q  charge: the total charge and the number of charged docks are the same at every beat
// R  reversibility: the same 240 beats run back (light back, then the step again) return every trit, 0
//    mismatches
// C  continuity: 0 husk docks with dQ + div J_h != 0 at any beat, and the fast husk integer engine driven by
//    the column-summed currents alone equals the trit rule's column sums on every value of every beat
// T  trits only: every stored value in -1 .. 1 at every beat
// L  the law, exhaustive on one link: the crossing is allowed on exactly the 19 states with |s - J| <= 1,
//    refused on the other 8, and applied twice returns every state (27 of 27)
// M  non-trivial: the gas makes crossings, and the husk flux differs from the same light run with the
//    matter held still
// Reported, not gated: how often the refusal binds (the gas at two densities over 2,400 beats, the loop, the
//   oscillator), and the husk current per beat against its column bound.
// Status: pass if every gate passes, partial if G, Q and R pass, fail otherwise.
//
// Depth L2: an exact construction whose conservation laws hold by construction (derived above), checked on
// every beat.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl } from '@/code/tool/weyl'
import {
  bulkFlux,
  bulkGaussViolations,
  columnSumLinks,
  copyTritState,
  emptyTritState,
  huskGaussViolations,
  makeTritLight,
  readHusk,
  tritLightBeat,
  tritLightBeatBack,
  writeHusk,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { buildHopTable, cross, emptyHopTally, gasStep, hopStep, type HopTable } from '@/code/rule/trit-hop'
import { fastBeat, geometryOfBulk, makeHuskEngine } from '@/code/rule/trit-husk'

const TRIT_KEYS = ['vibe', 'angle', 'string', 'potential', 'counter', 'lag', 'spatial'] as const
const HUSK_KEYS = ['angle', 'potential', 'counter', 'lag', 'spatial', 'string'] as const

function tritMismatches(a: TritState, b: TritState): number {
  let m = 0

  for (const key of TRIT_KEYS) {
    for (let i = 0; i < a[key].length; i++) m += a[key][i] === b[key][i] ? 0 : 1
  }

  return m
}

function outOfRange(s: TritState): number {
  let bad = 0

  for (const key of TRIT_KEYS) {
    for (const v of s[key]) bad += v >= -1 && v <= 1 ? 0 : 1
  }

  return bad
}

// the light on a golden Weyl start (as E-FRC-0207's), then neutral pairs: a dock x is tried when weyl(x) <
// density; the pair's root and sign come from silver Weyl points; a pair is placed only on free docks and a
// free link, joined by a string trit (so Gauss's law holds at the start)
function start(light: TritLight, table: HopTable, density: number): TritState {
  const s = emptyTritState(light)
  const h = readHusk(light, s)
  const d = light.bulk.depth

  for (let l = 0; l < h.angle.length; l++) {
    const n = light.window[l % 9] ?? 1

    h.angle[l] = Math.floor(weyl(l + 1) * n) - n / 2
  }

  for (let p = 0; p < h.potential.length; p++) {
    h.potential[p] = Math.floor(weyl(p + 7, Math.SQRT2 - 1) * 7) - 3
    h.counter[p] = Math.floor(weyl(p + 3) * light.q) - d
    h.lag[p] = Math.floor(weyl(p + 11) * light.q) - d
    h.spatial[p] = Math.floor(weyl(p + 13) * light.q) - d
  }

  writeHusk(light, s, h)
  placePairs(light, table, s, density)

  return s
}

function placePairs(light: TritLight, table: HopTable, s: TritState, density: number): void {
  const bulk = light.bulk

  for (let x = 0; x < bulk.docks; x++) {
    if (weyl(x + 1) >= density) continue

    const k = Math.floor(weyl(x + 1, Math.SQRT2 - 1) * 12)
    const v = weyl(x + 17, Math.SQRT2 - 1) < 0.5 ? 1 : -1
    const y = bulk.neighbour[x * 24 + (table.rootOf[k] ?? 0)] ?? 0
    const l = x * 12 + k

    if (s.vibe[x] !== 0 || s.vibe[y] !== 0 || s.string[l] !== 0 || x === y) continue

    s.vibe[x] = v
    s.vibe[y] = -v
    s.string[l] = v
  }
}

function huskCharge(light: TritLight, vibe: Int8Array): Int32Array {
  const q = new Int32Array(light.bulk.huskDocks)

  for (let x = 0; x < light.bulk.docks; x++) {
    const y = light.bulk.column[x] ?? 0

    q[y] = (q[y] ?? 0) + (vibe[x] ?? 0)
  }

  return q
}

function divergence(light: TritLight, j: Int32Array): Int32Array {
  const div = new Int32Array(light.bulk.huskDocks)

  for (let l = 0; l < light.bulk.huskLinks; l++) {
    const y = Math.floor(l / 9)
    const z = light.bulk.huskNeighbour[l] ?? 0

    div[y] = (div[y] ?? 0) + (j[l] ?? 0)
    div[z] = (div[z] ?? 0) - (j[l] ?? 0)
  }

  return div
}

type GasRun = {
  bulkGauss: number
  huskGauss: number
  chargeChanges: number
  continuity: number
  engineMismatches: number
  range: number
  back: number
  crossings: number
  refused: number
  fluxDiffers: number
  largestHuskCurrent: number
  charged: number
}

function gasRun(depth: number, beats: number): GasRun {
  const light = makeTritLight({ side: 4, depth, form: 'wave' })
  const table = buildHopTable(light.bulk)
  const s0 = start(light, table, 0.25)
  const s = copyTritState(s0)
  const still = copyTritState(s0)
  const engine = makeHuskEngine(geometryOfBulk(light.bulk), depth)
  const husk = readHusk(light, s)
  const tally = emptyHopTally()
  const total0 = s.vibe.reduce((a, v) => a + v, 0)
  const charged0 = s.vibe.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)
  const out: GasRun = { bulkGauss: 0, huskGauss: 0, chargeChanges: 0, continuity: 0, engineMismatches: 0, range: 0, back: 0, crossings: 0, refused: 0, fluxDiffers: 0, largestHuskCurrent: 0, charged: charged0 }

  for (let t = 0; t < beats; t++) {
    const [k, phase] = gasStep(t)
    const stringBefore = columnSumLinks(light, s.string)
    const chargeBefore = huskCharge(light, s.vibe)

    hopStep(table, s, k, phase, tally)

    const stringAfter = columnSumLinks(light, s.string)
    const current = Int32Array.from(stringAfter, (v, l) => (stringBefore[l] ?? 0) - v)
    const chargeAfter = huskCharge(light, s.vibe)
    const div = divergence(light, current)

    for (let y = 0; y < light.bulk.huskDocks; y++) {
      out.continuity += (chargeAfter[y] ?? 0) - (chargeBefore[y] ?? 0) + (div[y] ?? 0) === 0 ? 0 : 1
    }

    for (const j of current) out.largestHuskCurrent = Math.max(out.largestHuskCurrent, Math.abs(j))

    // the husk engine sees only the column-summed current
    for (let l = 0; l < light.bulk.huskLinks; l++) husk.string[l] = (husk.string[l] ?? 0) - (current[l] ?? 0)

    tritLightBeat(light, s)
    fastBeat(engine, husk)
    tritLightBeat(light, still)

    const read = readHusk(light, s)

    for (const key of HUSK_KEYS) {
      for (let i = 0; i < read[key].length; i++) out.engineMismatches += read[key][i] === husk[key][i] ? 0 : 1
    }

    out.bulkGauss += bulkGaussViolations(light, s)
    out.huskGauss += huskGaussViolations(light, columnSumLinks(light, bulkFlux(light, s)), s.vibe)
    out.range += outOfRange(s)

    const total = s.vibe.reduce((a, v) => a + v, 0)
    const charged = s.vibe.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

    out.chargeChanges += total === total0 && charged === charged0 ? 0 : 1

    const a = columnSumLinks(light, bulkFlux(light, s))
    const b = columnSumLinks(light, bulkFlux(light, still))

    out.fluxDiffers += a.some((v, i) => v !== b[i]) ? 1 : 0
  }

  for (let t = beats - 1; t >= 0; t--) {
    const [k, phase] = gasStep(t)

    tritLightBeatBack(light, s)
    hopStep(table, s, k, phase)
  }

  out.back = tritMismatches(s, s0)
  out.crossings = tally.crossings
  out.refused = tally.refused

  return out
}

function sectionLaw(): { allowed: number; refused: number; involution: number; lawMatches: number } {
  const light = makeTritLight({ side: 4, depth: 4 })
  const table = buildHopTable(light.bulk)
  const x = 0
  const k = 0
  const y = light.bulk.neighbour[x * 24 + (table.rootOf[k] ?? 0)] ?? 0
  const l = x * 12 + k

  let allowed = 0
  let refused = 0
  let involution = 0
  let lawMatches = 0

  for (const vx of [-1, 0, 1]) {
    for (const vy of [-1, 0, 1]) {
      for (const sl of [-1, 0, 1]) {
        const s = emptyTritState(light)

        s.vibe[x] = vx
        s.vibe[y] = vy
        s.string[l] = sl

        const tally = emptyHopTally()

        cross(table, s, x, k, tally)

        const j = vx - vy
        const ok = j === 0 || Math.abs(sl - j) <= 1

        allowed += ok ? 1 : 0
        refused += tally.refused
        lawMatches += (tally.refused === 0) === ok ? 1 : 0

        cross(table, s, x, k)
        involution += s.vibe[x] === vx && s.vibe[y] === vy && s.string[l] === sl ? 1 : 0
      }
    }
  }

  return { allowed, refused, involution, lawMatches }
}

// how often the refusal binds: the gas alone (the matter reads no field), at two densities, side 4, D 8
function binding(): Record<string, number> {
  const out: Record<string, number> = {}
  const light = makeTritLight({ side: 4, depth: 8 })
  const table = buildHopTable(light.bulk)

  for (const density of [0.25, 1]) {
    const s = emptyTritState(light)

    placePairs(light, table, s, density)

    const first = emptyHopTally()
    const last = emptyHopTally()
    const all = emptyHopTally()
    let saturated = 0

    for (let t = 0; t < 2400; t++) {
      const [k, phase] = gasStep(t)
      const tally = t < 240 ? first : t >= 2160 ? last : undefined
      const before = { c: all.crossings, r: all.refused }

      hopStep(table, s, k, phase, all)

      if (tally) {
        tally.crossings += all.crossings - before.c
        tally.refused += all.refused - before.r
      }
    }

    for (const v of s.string) saturated += v === 0 ? 0 : 1

    const name = `density${density}`

    out[`${name}_Charged`] = s.vibe.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)
    out[`${name}_RefusedShareFirst240`] = first.refused / Math.max(1, first.crossings + first.refused)
    out[`${name}_RefusedShareLast240`] = last.refused / Math.max(1, last.crossings + last.refused)
    out[`${name}_RefusedShareAll`] = all.refused / Math.max(1, all.crossings + all.refused)
    out[`${name}_StringsFullAtEnd`] = saturated / s.string.length
  }

  // a charge around one bulk triangle (three first-root crossings whose roots close), lap after lap
  const s = emptyTritState(light)
  const bulk = light.bulk
  const x0 = 0
  // a closed loop of first roots: r(ka) + r(kb) = r(kc)
  let lapCrossings = 0
  let firstRefusalLap = -1
  const roots = bulk.roots
  let pair: [number, number, number] | undefined

  for (let a = 0; a < 12 && !pair; a++) {
    for (let b = 0; b < 12 && !pair; b++) {
      const sum = (roots[a] ?? []).map((v, i) => v + ((roots[b] ?? [])[i] ?? 0))
      const c = roots.findIndex(r => r.every((v, i) => v === (sum[i] ?? 0)))

      if (c >= 0) pair = [a, b, c]
    }
  }

  if (!pair) throw new Error('no closed first-root triangle')

  const [ka, kb, kc] = pair
  const y1 = bulk.neighbour[x0 * 24 + (table.rootOf[ka] ?? 0)] ?? 0
  const y2 = bulk.neighbour[y1 * 24 + (table.rootOf[kb] ?? 0)] ?? 0

  // the charge at x0 goes x0 -> y1 (along ka), y1 -> y2 (along kb), then back to x0 along kc reversed: the link
  // x0 -> y2 is along kc, so the return is a crossing of that link from its head
  s.vibe[x0] = 1

  for (let lap = 1; lap <= 3 && firstRefusalLap < 0; lap++) {
    const t = emptyHopTally()

    cross(table, s, x0, ka, t)
    cross(table, s, y1, kb, t)
    cross(table, s, x0, kc, t)

    if (t.refused > 0) {
      firstRefusalLap = lap
    } else {
      lapCrossings += t.crossings
    }
  }

  if (y2 === x0 || y1 === x0) throw new Error('the loop is degenerate')

  out['loopFirstRefusedLap'] = firstRefusalLap
  out['loopCrossingsBeforeRefusal'] = lapCrossings

  // a charge forth and back on one link, 1,000 periods
  const o = emptyTritState(light)
  const ot = emptyHopTally()

  o.vibe[x0] = 1

  for (let i = 0; i < 2000; i++) cross(table, o, x0, 0, ot)

  out['oscillatorCrossings'] = ot.crossings
  out['oscillatorRefused'] = ot.refused

  return out
}

export default experiment({
  id: 'gauge/trit-hop',
  code: 'E-FRC-0210',
  title:
    'matter hops on string trits: a vibe crossing a bulk link swaps the two docks and flips the link\'s string trit by the charge carried, refused when the trit is full, and with the trit-column light Gauss\'s law holds exactly in bulk and husk at every beat, charge is kept, the run reverses trit for trit and the column-summed current obeys the continuity equation; the refusal caps the net charge through a bulk link at one unit for all time, not the rate',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const runs = [8, 11].map(d => ({ d, r: gasRun(d, 240) }))
    const law = sectionLaw()
    const bind = binding()
    const metrics: Record<string, number> = { ...bind }

    for (const { d, r } of runs) {
      for (const [key, value] of Object.entries(r)) metrics[`gas_D${d}_${key}`] = value
    }

    metrics.lawAllowed = law.allowed
    metrics.lawRefused = law.refused
    metrics.lawInvolution = law.involution
    metrics.lawMatches = law.lawMatches

    const gates = {
      G: runs.every(({ r }) => r.bulkGauss === 0 && r.huskGauss === 0),
      Q: runs.every(({ r }) => r.chargeChanges === 0),
      R: runs.every(({ r }) => r.back === 0),
      C: runs.every(({ r }) => r.continuity === 0 && r.engineMismatches === 0),
      T: runs.every(({ r }) => r.range === 0),
      L: law.allowed === 19 && law.refused === 8 && law.involution === 27 && law.lawMatches === 27,
      M: runs.every(({ r }) => r.crossings > 0 && r.fluxDiffers > 0),
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(x => x) ? 'pass' : gates.G && gates.Q && gates.R ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `matter moves on string trits: over 240 beats of a gas under the trit-column light at D = 8 and 11 (${runs.map(({ r }) => r.crossings).join(' and ')} crossings), Gauss's law is exact in bulk and husk at every beat (${runs.map(({ r }) => r.bulkGauss + r.huskGauss).join(', ')} violations), charge is kept, the run reverses to ${runs.map(({ r }) => r.back).join(', ')} trit mismatches, the column-summed current obeys dQ + div J = 0 everywhere and alone drives the husk integer rule bit for bit; a crossing is refused on exactly 8 of 27 link states, and the refusal caps the NET charge through a bulk link (a loop is refused on lap ${bind['loopFirstRefusedLap']}, an oscillator never), binding on ${((bind['density0.25_RefusedShareAll'] ?? 0) * 100).toFixed(1)} percent of tries in a quarter-filled gas`,
      metrics,
      control: { stillMatterFluxDiffers: runs[0]?.r.fluxDiffers ?? 0 },
      notes:
        'L2, exact integers, deterministic (golden and silver Weyl starts). FIRST RUN 2026-09-26 (tmp/frc0210.log, 2.7 s), PASS on every gate, no gate moved. Over 240 beats at D = 8 and 11 (side 4; 182 and 254 charged docks; 25,660 and 35,277 crossings), 0 bulk and 0 husk Gauss violations, charge and the number of charged docks unchanged, 0 trit mismatches after the run back, 0 continuity failures, and the fast husk integer engine driven only by the column-summed current equals the trit rule on every value of every beat; the husk flux differs from the still-matter run on all 240 beats. The largest husk current in one beat was 8 and 9 units (an axis column of 2D = 16 or 22 bulk links could carry up to 2 per bulk link, 4D). The law: 19 of 27 link states allow the crossing, 8 refuse, 27 of 27 return under the second application. WHAT THE REFUSAL DOES: the string trit is the running record of the net charge that crossed its link, so the cap is on NET TRANSPORT per bulk link (one unit from s = 0), not on the rate. It is not a speed of light for charge: the speed limit of one husk link per beat is the geometry of the crossing, and it holds for every rule of this shape. A charge oscillating on one link crossed 2,000 times with 0 refusals; a charge sent around a closed first-root triangle crossed 3 times and was refused on its second lap, so a persistent circulating current (an orbit, a magnetic moment) cannot exist on this rule. It BINDS in the gas: 20 percent of tries refused in the first 240 beats rising to 35 percent in the last 240 (31.5 percent over 2,400 beats) at a quarter filling, 40 to 44 percent fully tried, with 65 percent of all string trits full at the end. The light never relieves a string (its kick moves only potentials). The remedy the construction suggests, NOT BUILT: a reconnection move that moves a closed loop of string into the triangle potential it bounds (s <- s - C^T w, u <- u - w leaves the flux E unchanged, so Gauss and the light are untouched), an involution only when paired as (loop, u = 0) <-> (no loop, u = +-1), on a schedule of triangles that share no link. The matter here reads no field: kinematics, not a force law.',
    })
  },
})
