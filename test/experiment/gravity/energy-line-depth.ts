// THE DEPTH FROM THE RULE'S OWN ENERGY LINES (E-GRV-0107). E-GRV-0106 drags one unit of energy line with every vibe the
// stream takes, so Gauss's law for the rule's energy holds exactly with nothing placed after beat 0. If that is the
// gravitational source, the depth should now FOLLOW from the rule: the husk column sums of the dragged lines around a
// seeded lump, averaged over time, should carry the static step field E-GRV-0090 holds for a placed lump of the same
// content. note/project/vibe/roadmap/research/discrete-gravity.md, Part 5e.
//
// WHAT IS COMPARED. Link by link the two cannot agree (the dragged lines follow the vibes' paths, the placed lines a
// routing), and only one part of a link field is unique: the part fixed by its divergence. On the husk (code/measure/
// energy-lines huskCast: every bulk link casts one husk link, 2 bulk links a column dock over an axis and 1 over a face
// diagonal, E-GRV-0090's weights g = 2 and 1) the summed flux Phi of the seeded lines MINUS the vacuum's on the same path
// has divergence (column Delta e) minus the placed sink, exactly. Its divergence-fixed part is g grad x with div = that
// (code/measure/energy-lines staticDepth: E-GRV-0090's static field, found by code/measure/trit-hop-light coulombFlux,
// the depth x summed along paths by code/rule/step-depth stepDepth). E-GRV-0090's static field for the PLACED lump is
// the same construction on content 2 at the lump's column and -2 at the antipode's (the same sink the dragged run's
// beat-0 lines end on, so the comparison is like for like).
//
// THE LUMP: E-GRV-0086's love+fear pair (slots 6 and 8 of the center dock, energy 2) in the working vacuum ('pass'
// contact, no veto, the coin, the full-period key), side 16, its 2 beat-0 lines routed to the antipode dock one unit a
// link (code/measure/energy-lines routeUnits). Four paths (fullPathKey(pathOffset(k)), k = 0 .. 3), 512 beats each,
// the flux summed over every beat of every path (integers), then divided.
//
// DISCLOSED PROBES: tmp/eline-probe2.log (one path, 256 beats, lines from zero): the time-averaged column Delta e is
// -1.23 on the lump's own column, +0.149 a column at husk distance 1, and the content enclosed within r swings between
// -0.35 and 2.46 out to r = 11: the lump's energy is not where it was put; it displaces the vacuum's energy. tmp/eline-
// probe3.log (one path, 256 beats, the antipode lines): husk Gauss on the summed flux 0 off; the depth x(r) - x(8) of the
// dragged lines' divergence-fixed part is 0.18 to 0.57 of the placed lump's at r = 2 .. 6 and NEGATIVE at the lump
// (-0.042 against +0.102); that part against the placed field at r >= 2 differs by 2.9 times the placed field's size; and
// 99.7 percent of the averaged flux is its divergence-free part (the circulation E-GRV-0106 measures). The gates below
// were fixed after those probes and are reruns of disclosed findings at four paths and twice the beats.
//
// GATES.
//  D1 husk Gauss exact on the summed flux: the husk divergence of the summed seeded-minus-vacuum flux equals the summed
//     column Delta e minus 2 at the antipode's column for every beat, on every column (0 off, exact integers summed).
//  D2 the depth follows: the radial profile x(r) - x(8) of the dragged lines' divergence-fixed part is within 25 percent
//     of the placed lump's at every r = 2 .. 6, and has the placed lump's sign at r = 0 and r = 1.
//  D3 the field follows: that part differs from the placed static field on the husk links at distance >= 2 from the
//     lump by at most 25 percent of the placed field (relative L2).
//  CONTROL: the placed lump moved 4 columns along the first axis, compared with the centered placed lump by D2's
//     profile, must miss D2's 25 percent at some r = 2 .. 6 (the gate can tell a lump in the wrong place).
//  Verdict: pass if D1 to D3 and the control hold; partial if only the control fails; fail otherwise.
// REPORTED: the time-averaged column Delta e by shell and the content it encloses, the share of the averaged flux that is
// divergence free, and the 1/r fits of both profiles.
//
// FIRST RUN (tmp/grv-depth-run1.log, 286 s, the record): fail on D2 and D3, no gate moved. D1 0 off. Profile x(r) - x(8)
// dragged -0.0395, 0.0092, 0.0021, 0.0018, 0.0014, 0.0011, 0.0004 against placed 0.1024, 0.0181, 0.0087, 0.0052, 0.0033,
// 0.0019, 0.0011 (r = 0 .. 6), ratios 0.240, 0.353, 0.438, 0.571, 0.341 at r = 2 .. 6; field miss 3.04; divergence-free
// share 99.7 percent; time-averaged column Delta e -1.1826 at the lump, 0.1574 at r = 1, then under 0.021 a column, the
// enclosed content swinging -1.18 to 2.38 out to r = 11. Control: the moved lump's ratios 0.385, 0.660, 1.000, 0.999,
// 1.003, worst miss 0.615. What it means: Gauss for the rule's energy is exact and free, but the source it gives is where
// the energy IS, and a sparse pair's energy does not stay a lump; the depth follows from the rule only for matter that
// holds its energy in place, which no composite of this rule yet does (E-GRV-0085, E-GRV-0086). Title written after the
// run.
//
// Depth L2. DETERMINISM: no random numbers; four integer-offset paths of one full-period key. The rule and the lines
// are exact integers; the averages, the Poisson solve and the fits are floats (measurement, never read by the rule).
// NOTHING MOVES: the lines are read off the values the stream took.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { cloneConfiguration } from '@/code/rule/doublet-locked-knit'
import { fullPathKey, pathOffset } from '@/code/measure/full-key-paths'
import { d4BoxCell } from '@/code/substrate/d4-box-integer'
import { divergence } from '@/code/rule/step-depth'
import { radionMesh } from '@/code/rule/trit-radion'
import { huskDistances } from '@/code/measure/plaquette-readings'
import {
  addColumns,
  addHuskFlux,
  bulkLinks,
  dockEnergies,
  huskCast,
  lineRunner,
  routeUnits,
  shellMeans,
  staticDepth,
} from '@/code/measure/energy-lines'

const SIDE = 16
const BEATS = 512
const PATHS = 4
const LUMP_ENERGY = 2
const REF = 8
const PROFILE_R: readonly number[] = [2, 3, 4, 5, 6]
const TOLERANCE = 0.25
const FIELD_FROM = 2
const MOVE = 4

// least squares of y = a + k / r
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

export default experiment({
  id: 'gravity/energy-line-depth',
  code: 'E-GRV-0107',
  title:
    "the rule's own dragged energy lines do not carry a lump's depth, fail on D2 and D3: around a seeded love+fear pair (side 16, four full-key paths of 512 beats) husk Gauss holds exactly (0 off), but 99.7 percent of the time-averaged flux is circulation, and its divergence-fixed part gives a depth 0.24 to 0.57 of the placed lump's at r = 2 .. 6 (1/r fit k 0.0100 against 0.0203) and the WRONG sign at the lump (-0.039 against +0.102), missing the placed field by 3.0 times its size, because the pair does not stay where it was put: it takes energy away from its own column (time-averaged Delta e -1.18 there, +0.16 a column at r = 1) and its 2 units are spread over the box; the control (a placed lump moved 4 columns) misses by 0.62, so the gate could tell",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const center = centerOf(SIDE)
    const anti = d4BoxCell({ coordinates: [0, 0, 0, 0], side: SIDE })
    const f = contactFresh(SIDE, 'pass', center)
    const husk = boxHusk(f.weave.mesh, SIDE)
    const links = bulkLinks(f.tables)
    const cast = huskCast(links, husk)
    const vacuum = wordVacuum(f, f.store)
    const seeded = cloneConfiguration(vacuum)

    seeded.vibe[center * 24 + 6] = 1
    seeded.open[center * 24 + 6] = 1
    seeded.vibe[center * 24 + 8] = -1
    seeded.open[center * 24 + 8] = 1

    const zero = new Int32Array(f.cells * 12)
    const placed = new Int32Array(f.cells * 12)

    routeUnits(links, placed, center, anti, LUMP_ENERGY)

    const huskLinks = husk.columns * 9
    const sumFlux = new Float64Array(huskLinks)
    const sumDe = new Float64Array(husk.columns)
    const ea = new Int32Array(f.cells)
    const eb = new Int32Array(f.cells)

    for (let p = 0; p < PATHS; p++) {
      const key = fullPathKey(pathOffset(p))
      const a = lineRunner(f.tables, vacuum, zero, key)
      const b = lineRunner(f.tables, seeded, placed, key)

      for (let t = 0; t < BEATS; t++) {
        a.beat()
        b.beat()
        addHuskFlux(cast, b.line, sumFlux)
        addHuskFlux(cast, a.line, sumFlux, -1)
        addColumns(husk, dockEnergies(b.state(), eb), sumDe)
        addColumns(husk, dockEnergies(a.state(), ea), sumDe, -1)
      }
    }

    const n = PATHS * BEATS
    const cc = husk.column[center]!
    const ca = husk.column[anti]!

    // D1
    const hd = new Float64Array(husk.columns)

    divergence(radionMesh([SIDE, SIDE, SIDE]), sumFlux, hd)

    let gaussOff = 0

    for (let c = 0; c < husk.columns; c++) {
      if (hd[c] !== sumDe[c]! - (c === ca ? LUMP_ENERGY * n : 0)) {
        gaussOff++
      }
    }

    // D2, D3
    const drag = staticDepth(
      SIDE,
      Float64Array.from(hd, v => v / n),
    )

    const rhoAt = (col: number): Float64Array => {
      const rho = new Float64Array(husk.columns)

      rho[col] = LUMP_ENERGY
      rho[ca] = -LUMP_ENERGY

      return rho
    }

    const stat = staticDepth(SIDE, rhoAt(cc))
    const moved = staticDepth(
      SIDE,
      rhoAt(cc - (cc % SIDE) + (((cc % SIDE) + MOVE) % SIDE)),
    )

    const profile = (depth: Float64Array): number[] => {
      const m = shellMeans(SIDE, cc, depth)

      return m.map(v => v - m[REF]!)
    }

    const pd = profile(drag.depth)
    const ps = profile(stat.depth)
    const pm = profile(moved.depth)
    const ratio = PROFILE_R.map(r => pd[r]! / ps[r]!)
    const movedRatio = PROFILE_R.map(r => pm[r]! / ps[r]!)
    const gD2 =
      ratio.every(q => Math.abs(q - 1) <= TOLERANCE) &&
      Math.sign(pd[0]!) === Math.sign(ps[0]!) &&
      Math.sign(pd[1]!) === Math.sign(ps[1]!)
    const control = movedRatio.some(q => Math.abs(q - 1) > TOLERANCE)
    const dist = huskDistances(SIDE, cc)

    let num = 0
    let den = 0
    let curl = 0
    let total = 0

    for (let l = 0; l < huskLinks; l++) {
      const avg = sumFlux[l]! / n

      curl += (avg - drag.flux[l]!) ** 2
      total += avg ** 2

      if (dist[Math.floor(l / 9)]! < FIELD_FROM) {
        continue
      }

      num += (drag.flux[l]! - stat.flux[l]!) ** 2
      den += stat.flux[l]! ** 2
    }

    const fieldMiss = Math.sqrt(num / den)
    const curlShare = Math.sqrt(curl / total)
    const gD1 = gaussOff === 0
    const gD3 = fieldMiss <= TOLERANCE
    const status = !control
      ? 'partial'
      : gD1 && gD2 && gD3
        ? 'pass'
        : 'fail'

    // reported: the time-averaged Delta e by shell, and what it encloses
    const deShell = shellMeans(
      SIDE,
      cc,
      Float64Array.from(sumDe, v => v / n),
    )
    const counts = shellMeans(
      SIDE,
      cc,
      new Float64Array(husk.columns).fill(1),
    ).map((_, r) => [...dist].filter(d => d === r).length)

    let enclosed = 0

    const encl = deShell
      .slice(0, 12)
      .map(
        (v, r) => (enclosed += (Number.isNaN(v) ? 0 : v) * counts[r]!),
      )
    const fitR = [1, 2, 3, 4, 5, 6]
    const dragFit = inverseFit(
      fitR,
      fitR.map(r => pd[r]!),
    )
    const statFit = inverseFit(
      fitR,
      fitR.map(r => ps[r]!),
    )
    const f4 = (x: number): string => x.toFixed(4)
    const metrics: Record<string, number> = {
      gate_D1: gD1 ? 1 : 0,
      gate_D2: gD2 ? 1 : 0,
      gate_D3: gD3 ? 1 : 0,
      control: control ? 1 : 0,
      gaussOff,
      fieldMiss,
      curlShare,
      dragFitK: dragFit.k,
      staticFitK: statFit.k,
      lumpColumnDeltaE: deShell[0]!,
      seconds: (Date.now() - t0) / 1000,
    }

    PROFILE_R.forEach((r, i) => {
      metrics[`ratio_r${r}`] = ratio[i]!
      metrics[`movedRatio_r${r}`] = movedRatio[i]!
    })

    for (let r = 0; r <= REF; r++) {
      metrics[`dragProfile_r${r}`] = pd[r]!
      metrics[`staticProfile_r${r}`] = ps[r]!
    }

    return verdict({
      status,
      claim: `the dragged energy lines of a seeded love+fear pair (energy 2, side 16, ${PATHS} full-key paths of ${BEATS} beats, lines placed only at beat 0): husk Gauss off ${gaussOff}; the depth x(r) - x(8) of their divergence-fixed part is ${pd.slice(0, REF).map(f4).join(', ')} at r = 0 .. 7 against the placed lump's ${ps.slice(0, REF).map(f4).join(', ')}, ratio ${ratio.map(q => q.toFixed(3)).join(', ')} at r = ${PROFILE_R.join(', ')}; that part misses the placed field at r >= ${FIELD_FROM} by ${fieldMiss.toFixed(3)} of its size; ${(100 * curlShare).toFixed(1)} percent of the averaged flux is divergence free; the time-averaged column Delta e is ${f4(deShell[0]!)} on the lump's column and encloses ${encl.map(v => v.toFixed(2)).join(', ')} within r = 0 .. 11; a placed lump moved ${MOVE} columns reads ratio ${movedRatio.map(q => q.toFixed(3)).join(', ')}`,
      metrics,
      control: {
        movedWorstMiss: Math.max(
          ...movedRatio.map(q => Math.abs(q - 1)),
        ),
      },
      notes: `L2. Gates D1 ${gD1}, D2 ${gD2}, D3 ${gD3}; control ${control}. 1/r fits on r = 1 .. 6: dragged k ${dragFit.k.toExponential(3)} a ${dragFit.a.toExponential(3)}, placed k ${statFit.k.toExponential(3)} a ${statFit.a.toExponential(3)}. Delta e by shell (per column): ${deShell.slice(0, 12).map(f4).join(' ')}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
