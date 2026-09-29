// DOES NORMAL ORDERING GIVE THE SEA'S HOLE THE RIGHT GRAVITY (E-GRV-0144)? note/research/vibe/roadmap/remaining-pieces.md,
// "Auditing the candidate rule (E-SPN-0134)": under the candidate rule (flat links, the filled love sea, E-SPN-0130's
// fermionic frame mixer) depth is sourced by the energy count, held slots + 2 stored pairs (code/measure/energy-lines),
// and relative to the sea a hole is -1: its time-averaged depth at the source was -0.0015 against a love's +0.0015, so
// the sea's excitations would fall up. The fix tested: count energy from the vacuum (normal ordering), so every
// excitation counts positive, as a Dirac-sea hole carries positive energy.
//
// THE REGISTER, as asked (code/measure/normal-order, 'occupation'): per slot |occupied - the sea's occupied|, per store
// 2 |stored - 0|. The sea is fixed, so the register is local; each slot contributes 0 or 1 and each store 0 or 2, so it is
// bounded. Energy lines are E-GRV-0106's, each crossing weighted by the weight the crossing value carries.
//
// DERIVED BEFORE THE RUN.
// 1. CONSERVATION, AND WHERE IT FAILS. A register that sums a slot weight f(value) and a store weight g is kept by every
//    permutation of slot values (the coin, the mixer, the meeting, the stream) and by the pair move (a love and a fear on
//    a line into its store, or back) exactly when f(1) + f(-1) - 2 f(0) = g(1) - g(0). On the love sea the asked
//    register has f(1) = 0, f(0) = 1, f(-1) = 0 (a fear's slot is as occupied as the sea's) and g = 2: 0 + 0 - 2 is not 2,
//    off by 4. So it is kept in the HOLE SECTOR, where no pair is made or unmade (the sea's stores never change, E-SPN-0134
//    S9), and broken by a fear: E-SPN-0132 B0 found a fear unmade with a sea love into two holes and a store at its first
//    collision, which takes the register from 1 (the hole) + 0 (the fear) to 3 + 2 = 5, a jump of 4. N1 includes that
//    start, so N1 is predicted to FAIL on it alone.
// 2. THE CONSERVED COMPLETION ('charge'): keeping g = 2 (the store weight E-GRV-0106's Gauss law needs) forces
//    f(-1) = 4: per slot (occupied - v^2) - 2 v (vibe - v) on a sea of value v, the count minus twice the charge, both
//    from the sea. A hole 1, a fear in the love sea 4, a store 2, a love on the empty mesh (v = 0) 1: positive, local,
//    bounded, conserved by construction. It equals the asked register on every configuration of holes alone, so N2 and N3
//    read the same numbers under both. Reported beside N1 as N1c; it is the derived fix, not a moved gate.
// 3. GAUSS. Every piece but the stream acts inside one dock and keeps the dock's register where the condition above holds,
//    and the stream takes each slot's value and weight one dock along one link, so weighted lines keep div L - e constant
//    on every dock wherever the register is conserved, and break at the dock of the pair move where it is not.
// 4. THE SIGN. The hole's run is the particle-hole image of a love's on the empty mesh under the same key, slot for slot
//    (E-SPN-0134, 0 off). The asked register reads 1 on the hole's slot and 0 on every sea love; the count reads 1 on the
//    love's slot and 0 on every empty slot. So the hole's register field EQUALS the love's count field at every dock and
//    beat, and every depth read off it is the love's: +1 times, not -1 times. At beat 0 both are one unit at the start
//    dock, as is a love placed in the working vacuum (its excess count over the vacuum): equal to rounding at the source.
// 5. THE SEA reads 0 on every slot: its register and its depth are exactly 0 before any mean is removed (the count gave
//    24 a dock, a constant only the mean removal took away).
// 6. THE 1/r, a question the derivation does not settle: the hole moves freely, so its time-averaged source spreads.
//    E-GRV-0119's held cluster (3.00000 units, R90 3) gave k 0.030724 against the same-energy point lump's 0.032409. A
//    free hole run for 64 beats on keyed paths reverses on 3/4 of its coin draws and turns on 21/64 of its mixer draws; a
//    persistent walk of step correlation about -0.31 spreads to an RMS of about 6 root lengths in 64 beats, wider than the
//    cluster, so k per unit is expected BELOW E-GRV-0119's per unit, by more than 5 percent. Not settled before the run.
//
// GATES, fixed before the first run.
//  N1 the asked register is conserved exactly: over 128 beats with the mixer on the flat side-8 love sea, 4 full-key paths,
//     on four starts (the sea, a hole, two holes, a hole and a fear at Y = X + (1,1,0,0), E-SPN-0130's pair), its total
//     equals its beat-0 total after every beat, AND its weighted lines keep div L - e equal to its beat-0 value on every
//     dock after every beat (0 off).
//  N2 a hole's depth is +1 times a love's: on the flat side-16 sea (E-GRV-0119's side), the hole's register field equals
//     the empty-mesh love's count field under the same key at every dock of every beat (0 off), its time-averaged depth
//     (8 paths x 64 beats, E-GRV-0119's window) differs from the love's by at most 1e-9 at every column, its source column
//     is positive, the beat-0 depth equals a love's in the working vacuum to 1e-9 at every column, AND, read by E-GRV-0119's
//     reading unchanged (x(r) - x(8) of shell means, a + k / r on r = 2 .. 6), its k per unit of register is within 5
//     percent of E-GRV-0119's per unit (0.030724 / 3.00000).
//  N3 the sea sources zero depth: the sea's register is 0 on every dock after every one of the 128 beats (both registers)
//     and its depth field is exactly 0.
// CONTROLS (a failed control makes the verdict partial).
//  C1 the un-ordered count reproduces E-SPN-0134: the hole's time-averaged depth at the source on side 8 (4 paths, 64
//     beats, the audit's own reading) equals the audit's recorded -0.0014837189754721514 to 1e-12, and the asked register
//     on the same runs reads its negative.
//  C2 the reading is E-GRV-0119's: a point unit on the start column fits k per unit equal to E-GRV-0119's point lump per
//     unit (0.032409 / 3.00000) within 1e-4 relative (the record's five figures).
// Verdict: partial if a control fails; pass if N1, N2 and N3 hold; fail otherwise.
// PREDICTED: fail on N1 (the hole-and-fear start only; the charge register N1c holds everywhere); N2's sign and exact
// clauses hold; its k clause below E-GRV-0119's by more than 5 percent (the free hole spreads); N3 holds.
//
// FIRST RUN (tmp/normal-grv-run1.log, 80 s): FAIL on N1 and on N2's k clause, as predicted; N3 and both controls hold.
//  - N1: the asked register is kept exactly on the sea, a hole and two holes (drift 0, Gauss 0 off, 4 paths x 128 beats),
//    and breaks on the hole and fear at beat 1 on 4 of 4 paths: the total jumps 1 -> 5 (drift 4) and Gauss is off on
//    511 dock-beats, the dock of the unmaking. N1c: the charge register (1 + 4 = 5 at beat 0) holds on all four starts,
//    drift 0, Gauss 0 off.
//  - N2's sign and exact clauses hold: the hole's register field equals the empty-mesh love's count at every dock of
//    8 x 64 beats (0 off), the averaged depths differ by 0 (not just 1e-9), the beat-0 depth equals a love's in the
//    working vacuum to 0, the source column +3.685e-3 against the count's -3.685e-3. The hole now falls DOWN.
//  - N2's k clause fails: k per unit 4.693e-3 against E-GRV-0119's 1.024e-2 (ratio 0.458; 0.434 of the point unit's),
//    profile 0.0034, 0.0025, 0.0019, 0.0014 at r = 0 .. 3 against the point's 0.0507, 0.0086, 0.0039, 0.0022: the free
//    hole's 64-beat average is spread over the box, as E-GRV-0110's spreading source was. It is the dispersal of a free
//    particle, not the sign: the love it equals reads the same k.
//  - N3: the sea's register is 0 on every dock and beat, its depth exactly 0 (the count gave 192 per column).
//  - C1: the count reproduces E-SPN-0134's -0.0014837189754721514 exactly and the asked register reads +0.0014837...
//    C2: the point unit's k per unit is E-GRV-0119's point lump's to 1.3e-5.
// Title written after the run.
//
// Depth L1: exact integer readings of the rule's runs, with the husk depth (floats, measurement) read off them.
// DETERMINISM: no random numbers; every choice is the key's integer and every start is placed. NOTHING MOVES: the register
// and its lines are readings; the rule is code/measure/candidate-audit candidateRun, unchanged.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import {
  fullPathKey,
  pathOffset,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { boxHusk } from '@/code/measure/causal-components'
import {
  bulkLinks,
  dockEnergies,
  shellMeans,
  staticDepth,
} from '@/code/measure/energy-lines'
import {
  placeInSea,
  seaConfiguration,
} from '@/code/measure/pauli-mixer'
import { flatLinks, tablesOn } from '@/code/measure/link-holonomy'
import {
  candidateRun,
  columnField,
  huskField,
  largest,
} from '@/code/measure/candidate-audit'
import {
  dragWeighted,
  seaEnergies,
  seaGauss,
  totalOf,
  type Register,
} from '@/code/measure/normal-order'
import type { Configuration } from '@/code/rule/doublet-locked-knit'

const SIDE = 8
const BEATS = 128
const PATHS = 4
const AUDIT_BEATS = 64
const DEPTH_SIDE = 16
const WINDOW = 64
const DEPTH_PATHS = 8
const REF = 8
const PROFILE_R: readonly number[] = [2, 3, 4, 5, 6]
const K_TOLERANCE = 0.05
const EXACT = 1e-9
const REPRODUCE = 1e-12
const POINT_TOLERANCE = 1e-4
const PAIR_STEPS = 2
// the records compared against (their registered numbers)
const GRV_0119_K = 0.030724
const GRV_0119_POINT_K = 0.032409
const GRV_0119_ENERGY = 3.0
const SPN_0134_HOLE_DEPTH0 = -0.0014837189754721514
const REGISTERS: readonly Register[] = ['occupation', 'charge']

// least squares of y = a + k / r (E-GRV-0119's fit)
function inverseFit(
  rs: readonly number[],
  ys: readonly number[],
): { a: number; k: number } {
  const xs = rs.map(r => 1 / r)
  const mx = xs.reduce((s, v) => s + v, 0) / xs.length
  const my = ys.reduce((s, v) => s + v, 0) / ys.length
  const k =
    xs.reduce((s, v, i) => s + (v - mx) * (ys[i]! - my), 0) /
    xs.reduce((s, v) => s + (v - mx) ** 2, 0)

  return { a: my - k * mx, k }
}

type Conservation = {
  drift: number
  gaussOff: number
  firstBreak: number
}

export default experiment({
  id: 'gravity/normal-ordered-depth',
  code: 'E-GRV-0144',
  title:
    "normal-ordered energy turns the love sea's hole the right way up, fail (N1, and N2's k): counting |occupied - the sea's| per slot and 2 per store, the sea reads 0 (depth exactly 0), a hole reads +1 and its register field equals a love's count on the empty mesh at every dock of 8 x 64 beats, so its depth is +1 times the love's (0 off, source +3.685e-3 where the count gave -3.685e-3; the audit's -0.0015 reproduced exactly and flipped); but the register is kept only in the hole sector: a fear in the sea counts 0 and its unmaking into two holes and a store jumps it by 4 at beat 1 (Gauss off at that dock), because conservation under the pair move needs f(love) + f(fear) - 2 f(hole-slot) = the store's weight; the completion that keeps the store at 2 weighs a fear 4 (the count minus twice the charge, from the sea), and it is conserved with exact Gauss on every start; the free hole's 64-beat depth is 1/r-like but spread, k per unit 0.0047 against E-GRV-0119's 0.0102 (0.46), the dispersal of a free particle, not the sign",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const B = rootIndex([1, 1, 0, 0])
    const keyOf = (path: number): PathKey =>
      fullPathKey(pathOffset(path))

    // ---------------- N1, N3 (runs), C1: side 8 ----------------
    const X = centerOf(SIDE)
    const fr = contactFresh(SIDE, 'pass', X)
    const w = fr.weave
    const cells = fr.cells
    const flat = tablesOn(w, 'pass', flatLinks(w))
    const links = bulkLinks(flat)
    const Y = Math.floor(flat.target[X * 24 + B]! / 24)

    let Z = X

    const a1 = rootIndex([1, 0, 0, 1])
    const a2 = rootIndex([1, 0, 0, -1])

    for (let k = 0; k < PAIR_STEPS; k++) {
      Z = Math.floor(flat.target[Z * 24 + a1]! / 24)
      Z = Math.floor(flat.target[Z * 24 + a2]! / 24)
    }

    const love = seaConfiguration(cells, 1)
    const starts: { name: string; c: Configuration }[] = [
      { name: 'sea', c: love },
      {
        name: 'hole',
        c: placeInSea(love, [{ dock: X, slot: B, vibe: 0 }]),
      },
      {
        name: 'two holes',
        c: placeInSea(love, [
          { dock: X, slot: B, vibe: 0 },
          { dock: Z, slot: B, vibe: 0 },
        ]),
      },
      {
        name: 'hole and fear',
        c: placeInSea(love, [
          { dock: X, slot: B, vibe: 0 },
          { dock: Y, slot: B, vibe: -1 },
        ]),
      },
    ]
    const buf = new Int32Array(cells)

    let seaLargest = 0

    const conservation = starts.map(s =>
      Array.from({ length: PATHS }, (_, path) => {
        const out = new Map<Register, Conservation>()
        const line = new Map<Register, Int32Array>()
        const gauss0 = new Map<Register, Int32Array>()
        const total0 = new Map<Register, number>()

        for (const reg of REGISTERS) {
          const l = new Int32Array(cells * 12)

          line.set(reg, l)
          gauss0.set(reg, seaGauss(links, l, s.c, 1, reg))
          total0.set(reg, totalOf(seaEnergies(s.c, 1, reg, buf)))
          out.set(reg, { drift: 0, gaussOff: 0, firstBreak: -1 })
        }

        candidateRun({
          tables: flat,
          start: s.c,
          key: keyOf(path),
          beats: BEATS,
          mix: true,
          each: (t, c) => {
            for (const reg of REGISTERS) {
              const l = line.get(reg)!
              const o = out.get(reg)!
              const e = seaEnergies(c, 1, reg, buf)

              if (s.name === 'sea') {
                seaLargest = Math.max(seaLargest, largest(e))
              }

              dragWeighted(flat, c, l, -1, 1, reg)

              const drift = Math.abs(totalOf(e) - total0.get(reg)!)
              const g = seaGauss(links, l, c, 1, reg)
              const g0 = gauss0.get(reg)!

              let off = 0

              for (let x = 0; x < cells; x++) {
                if (g[x] !== g0[x]) {
                  off++
                }
              }

              o.drift = Math.max(o.drift, drift)
              o.gaussOff += off

              if (o.firstBreak < 0 && (drift > 0 || off > 0)) {
                o.firstBreak = t + 1
              }
            }
          },
        })

        return {
          start: s.name,
          total0: total0.get('occupation')!,
          total0Charge: total0.get('charge')!,
          occupation: out.get('occupation')!,
          charge: out.get('charge')!,
        }
      }),
    )
    const holds = (reg: 'occupation' | 'charge'): boolean =>
      conservation.every(rs =>
        rs.every(r => r[reg].drift === 0 && r[reg].gaussOff === 0),
      )
    const N1 = holds('occupation')
    const N1c = holds('charge')

    log('N1')

    // C1: E-SPN-0134's time-averaged depth at the source, the count and the asked register on the same runs
    const husk = boxHusk(w.mesh, SIDE)
    const col = husk.column[X]!
    const hole8 = starts[1]!.c
    const perPath = Array.from({ length: PATHS }, (_, path) => {
      const count = new Float64Array(husk.columns)
      const normal = new Float64Array(husk.columns)

      candidateRun({
        tables: flat,
        start: hole8,
        key: keyOf(path),
        beats: AUDIT_BEATS,
        mix: true,
        each: (_, c) => {
          columnField(husk, dockEnergies(c, buf)).forEach(
            (v, k) => (count[k]! += v / AUDIT_BEATS),
          )

          columnField(
            husk,
            seaEnergies(c, 1, 'occupation', buf),
          ).forEach((v, k) => (normal[k]! += v / AUDIT_BEATS))
        },
      })

      return { count, normal }
    })

    const avgShell0 = (pick: 'count' | 'normal'): number => {
      const avg = new Float64Array(husk.columns)

      perPath.forEach(r =>
        r[pick].forEach((v, k) => (avg[k]! += v / PATHS)),
      )

      return shellMeans(SIDE, col, huskField(SIDE, avg).depth)[0]!
    }

    const auditCount = avgShell0('count')
    const auditNormal = avgShell0('normal')
    const C1 =
      Math.abs(auditCount - SPN_0134_HOLE_DEPTH0) <= REPRODUCE &&
      Math.abs(auditNormal + SPN_0134_HOLE_DEPTH0) <= REPRODUCE

    log('C1')

    // N3's field: the sea's register, and its depth, before any mean is removed
    const seaRho = columnField(
      husk,
      seaEnergies(love, 1, 'occupation', buf),
    )
    const seaRhoCharge = columnField(
      husk,
      seaEnergies(love, 1, 'charge', buf),
    )
    const seaDepth = staticDepth(SIDE, seaRho).depth
    const seaCountRho = columnField(husk, dockEnergies(love, buf))
    const N3 =
      seaLargest === 0 &&
      largest(seaRho) === 0 &&
      largest(seaRhoCharge) === 0 &&
      largest(seaDepth) === 0

    // ---------------- N2: side 16 ----------------
    const X16 = centerOf(DEPTH_SIDE)
    const fr16 = contactFresh(DEPTH_SIDE, 'pass', X16)
    const flat16 = tablesOn(fr16.weave, 'pass', flatLinks(fr16.weave))
    const cells16 = fr16.cells
    const husk16 = boxHusk(fr16.weave.mesh, DEPTH_SIDE)
    const col16 = husk16.column[X16]!
    const love16 = seaConfiguration(cells16, 1)
    const hole16 = placeInSea(love16, [{ dock: X16, slot: B, vibe: 0 }])
    const loveEmpty16 = placeInSea(seaConfiguration(cells16, 0), [
      { dock: X16, slot: B, vibe: 1 },
    ])
    const buf16 = new Int32Array(cells16)
    const holeAvg = new Float64Array(husk16.columns)
    const holeCountAvg = new Float64Array(husk16.columns)
    const loveAvg = new Float64Array(husk16.columns)

    let particleHoleOff = 0
    let chargeOff = 0

    for (let path = 0; path < DEPTH_PATHS; path++) {
      const fields: Int32Array[] = []
      const scale = 1 / (WINDOW * DEPTH_PATHS)

      candidateRun({
        tables: flat16,
        start: hole16,
        key: keyOf(path),
        beats: WINDOW,
        mix: true,
        each: (_, c) => {
          const e = Int32Array.from(
            seaEnergies(c, 1, 'occupation', buf16),
          )
          const q = seaEnergies(c, 1, 'charge', buf16)

          for (let x = 0; x < cells16; x++) {
            if (q[x] !== e[x]) {
              chargeOff++
            }
          }

          fields.push(e)
          columnField(husk16, e).forEach(
            (v, k) => (holeAvg[k]! += v * scale),
          )

          columnField(husk16, dockEnergies(c, buf16)).forEach(
            (v, k) => (holeCountAvg[k]! += v * scale),
          )
        },
      })

      candidateRun({
        tables: flat16,
        start: loveEmpty16,
        key: keyOf(path),
        beats: WINDOW,
        mix: true,
        each: (t, c) => {
          const e = dockEnergies(c, buf16)
          const h = fields[t]!

          for (let x = 0; x < cells16; x++) {
            if (e[x] !== h[x]) {
              particleHoleOff++
            }
          }

          columnField(husk16, e).forEach(
            (v, k) => (loveAvg[k]! += v * scale),
          )
        },
      })
      log(`N2 path ${path}`)
    }

    const depthOf = (rho: Float64Array): Float64Array =>
      staticDepth(DEPTH_SIDE, rho).depth

    const profile = (depth: Float64Array): number[] => {
      const m = shellMeans(DEPTH_SIDE, col16, depth)

      return m.map(v => v - m[REF]!)
    }

    const holeDepth = depthOf(holeAvg)
    const loveDepth = depthOf(loveAvg)
    const countDepth = depthOf(holeCountAvg)

    let avgGap = 0

    for (let k = 0; k < holeDepth.length; k++) {
      avgGap = Math.max(avgGap, Math.abs(holeDepth[k]! - loveDepth[k]!))
    }

    // beat 0: the hole's register against a love placed in the working vacuum (its count excess over the vacuum)
    const vacuum16 = wordVacuum(fr16, fr16.store)
    const loveWorking = placeInSea(vacuum16, [
      { dock: X16, slot: B, vibe: 1 },
    ])
    const excess = Int32Array.from(dockEnergies(loveWorking, buf16))
    const vac = dockEnergies(vacuum16, new Int32Array(cells16))

    for (let x = 0; x < cells16; x++) {
      excess[x] = excess[x]! - vac[x]!
    }

    const holeStartDepth = depthOf(
      columnField(husk16, seaEnergies(hole16, 1, 'occupation', buf16)),
    )
    const workingDepth = depthOf(columnField(husk16, excess))

    let startGap = 0

    for (let k = 0; k < holeStartDepth.length; k++) {
      startGap = Math.max(
        startGap,
        Math.abs(holeStartDepth[k]! - workingDepth[k]!),
      )
    }

    const holeProfile = profile(holeDepth)
    const loveProfile = profile(loveDepth)
    const countProfile = profile(countDepth)
    const pointRho = new Float64Array(husk16.columns)

    pointRho[col16] = 1

    const pointProfile = profile(depthOf(pointRho))
    const fitOf = (p: number[]): { a: number; k: number } =>
      inverseFit(
        PROFILE_R,
        PROFILE_R.map(r => p[r]!),
      )
    const holeFit = fitOf(holeProfile)
    const pointFit = fitOf(pointProfile)
    const countFit = fitOf(countProfile)
    const holeEnergy = holeAvg.reduce((s, v) => s + v, 0)
    const kPerUnit = holeFit.k / holeEnergy
    const kRef = GRV_0119_K / GRV_0119_ENERGY
    const kRatio = kPerUnit / kRef
    const pointRatio = pointFit.k / (GRV_0119_POINT_K / GRV_0119_ENERGY)
    const C2 = Math.abs(pointRatio - 1) <= POINT_TOLERANCE
    const holeSource = holeDepth[col16]!
    const N2exact =
      particleHoleOff === 0 &&
      avgGap <= EXACT &&
      startGap <= EXACT &&
      holeSource > 0
    const N2k = Math.abs(kRatio - 1) <= K_TOLERANCE
    const N2 = N2exact && N2k

    log('N2')

    // ---------------- verdict ----------------
    const controls = C1 && C2
    const status = !controls
      ? 'partial'
      : N1 && N2 && N3
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const e3 = (x: number): string => x.toExponential(3)
    const rowOf = (rs: (typeof conservation)[number]): string =>
      `${rs[0]!.start} (asked register ${rs[0]!.total0}, charge register ${rs[0]!.total0Charge}): asked drift ${rs.map(r => r.occupation.drift).join('/')}, Gauss off ${rs.map(r => r.occupation.gaussOff).join('/')}, first break ${rs.map(r => r.occupation.firstBreak).join('/')}; charge drift ${rs.map(r => r.charge.drift).join('/')}, Gauss off ${rs.map(r => r.charge.gaussOff).join('/')}`
    const metrics: Record<string, number> = {
      N1: N1 ? 1 : 0,
      N1c: N1c ? 1 : 0,
      N2: N2 ? 1 : 0,
      N2exact: N2exact ? 1 : 0,
      N2k: N2k ? 1 : 0,
      N3: N3 ? 1 : 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      particleHoleOff,
      chargeOffOnHoles: chargeOff,
      averageDepthGap: avgGap,
      startDepthGap: startGap,
      holeSourceDepth: holeSource,
      holeCountSourceDepth: countDepth[col16]!,
      holeK: holeFit.k,
      holeEnergy,
      kPerUnit,
      kReferencePerUnit: kRef,
      kRatio,
      pointK: pointFit.k,
      pointRatio,
      countK: countFit.k,
      auditCountDepth0: auditCount,
      auditNormalDepth0: auditNormal,
      seaLargest,
      seaCountColumnMax: largest(seaCountRho),
      seconds: (Date.now() - started) / 1000,
    }

    conservation.forEach(rs => {
      const n = rs[0]!.start.replace(/ /g, '_')

      metrics[`${n}_asked_drift`] = Math.max(
        ...rs.map(r => r.occupation.drift),
      )

      metrics[`${n}_asked_gaussOff`] = rs.reduce(
        (s, r) => s + r.occupation.gaussOff,
        0,
      )

      metrics[`${n}_charge_drift`] = Math.max(
        ...rs.map(r => r.charge.drift),
      )

      metrics[`${n}_charge_gaussOff`] = rs.reduce(
        (s, r) => s + r.charge.gaussOff,
        0,
      )
    })

    for (let r = 0; r <= REF; r++) {
      metrics[`hole_r${r}`] = holeProfile[r]!
      metrics[`point_r${r}`] = pointProfile[r]!
    }

    return verdict({
      status,
      claim: `N1 ${N1} (the asked register |occupied - sea| + 2 stored; ${conservation.map(rowOf).join(' | ')}); N1c ${N1c} (the charge register); N2 ${N2} (particle-hole off ${particleHoleOff}, averaged depth gap ${e3(avgGap)}, beat-0 gap against a love in the working vacuum ${e3(startGap)}, source depth ${e3(holeSource)} against the count's ${e3(countDepth[col16]!)}; k per unit ${e3(kPerUnit)} against E-GRV-0119's ${e3(kRef)}, ratio ${f4(kRatio)}); N3 ${N3} (sea register largest ${seaLargest}, depth ${largest(seaDepth)}); C1 ${C1} (count ${auditCount}, asked ${auditNormal}); C2 ${C2} (point ratio ${pointRatio.toFixed(6)})`,
      metrics,
      control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0 },
      notes: `L1. Profiles x(r) - x(8) at r = 0 .. 8: hole ${holeProfile
        .slice(0, REF + 1)
        .map(f4)
        .join(' ')}; love ${loveProfile
        .slice(0, REF + 1)
        .map(f4)
        .join(' ')}; the un-ordered hole ${countProfile
        .slice(0, REF + 1)
        .map(f4)
        .join(' ')}; point unit ${pointProfile
        .slice(0, REF + 1)
        .map(f4)
        .join(
          ' ',
        )}. Fits: hole a ${e3(holeFit.a)} k ${e3(holeFit.k)}; point k ${e3(pointFit.k)} (hole/point ${f4(holeFit.k / pointFit.k)}); un-ordered hole k ${e3(countFit.k)}. The un-ordered sea's column source is ${largest(seaCountRho)} on every column (removed only as the torus mean). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
