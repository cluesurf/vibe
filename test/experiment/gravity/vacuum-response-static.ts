// Induced gravity, the static profile (E-GRV-0081): is the radion the vacuum's own response? Sakharov's question on this
// model. The radion (E-GRV-0079, 0080) gives every property gravity needs but is added by hand, with a free coupling (its
// light-bending factor 0.0058 of the Newtonian count at depth per content b = a, general relativity needing 2), and
// E-GRV-0071 found nothing in the model that makes depth read any state under line locality. E-SPN-0095 added the frame
// mixer G, and with it a lone vibe's disturbance spreads into the working vacuum. So: place a lump of content in the
// working vacuum with G on and read the vacuum's own occupation around it against the same vacuum without the lump.
// The depth of a husk column is its count, so a count that changes around content IS a depth set by content.
//
// THE RUN. The working vacuum of E-SPN-0095 (veto 'none', the pass contact, every stored pair open, the covariant coin,
// G on), side 8 (512 husk columns of 8 docks, mesh distance r = 0 .. 6 from a column), one path: the Born path of
// code/measure/occupation-veto-readings vetoPathRunner (the coin and G read their Born bins, the meetings exchange at
// 3/4), 144 beats. THE LUMP (code/measure/vacuum-response lumpStart): open vibes of one tone on the first slot of each
// frame of the center column's docks, every one alone in its frame so G acts on it at once: content 1 (one vibe at the
// center dock), 3 (the center dock's three frames) and 24 (every dock of the center column), love, and fear for the
// flip. The control is the same vacuum with no lump, run on the same path. THE READINGS, per husk column and beat, each
// fixed before any run: (a) occupied, the column's vibes plus store units; (b) events, made minus unmade pair events
// that beat; (c) open, its open vibes (every vibe out of a store, the vacuum's and the lump's). Each is read as the lump
// run minus the control, averaged per column over the shell at mesh distance r from the lump's column and over beats
// 48 .. 143 (cycles 4 to 11 of the vacuum's 12-beat cycle), then over the 17 starts of E-MTH-0028 (startFamily(16),
// withStart).
//
// THE SPREAD sigma(r), per reading and content: the larger of (i) the range over the 17 starts and (ii) the range over
// eight placements of the lump (the center column moved by (i, j, k), each 0 or 1: the eight parity classes of the husk
// lattice, integer+0, each read about its own column). (ii) is added because a disclosed probe found the starts agree
// bit for bit (below): under the 'none' veto no piece of the beat reads a point to decide an occupation, so the link
// start cannot move a count, and the range over starts is 0 by construction. The placements are the robustness the
// methodology asks for (the perturbation's location).
//
// GATES, fixed before the gated run.
//  P1 a response exists: on reading (a), for every content, |Delta(r)| > sigma(r) at every r = 1 .. 6 (G on, love)
//  P2 its profile is 1/r: on reading (a), the content-24 love profile on r = 1 .. 6 fitted by a + k/r has k > 0 (deeper
//     near content), a residual at most half the flat fit's (a alone), and at most twice the better of the two
//     alternatives, a + k r^-p (p scanned 0.25 .. 4 by 0.05) and a + k e^(-r/l) / r (l scanned 0.25 .. 16 by 0.25).
//     The prediction if it is a massless radion: 1/r; massive: the Yukawa form; neither: flat
//  P3 charge-blind: on reading (a), for every content, the love and fear profiles differ by at most sigma(r) at every
//     r = 0 .. 6
//  P4 control, line locality: with G OFF (the coin alone), for every content and start, the columns where the lump run
//     differs from the control in any reading at any beat all lie on the husk columns the lump's bulk lines cross
//     (code/measure/vacuum-response lineColumns): 0 columns off them
// Verdict: fail if P1 or P2 fails; pass if P1 to P4 hold; partial otherwise.
// REPORTED, not gated: every reading's profile per content with and without G; the box-wide excess of (a) per content;
// the 1/r fit per content, and from it the implied coupling: the depth change per unit content k / M against the
// radion's 1 / (24 pi) (E-GRV-0079: pair energy (pi / D) sa sb G(r), G(r) about 1 / (24 pi r)), and the light-bending
// factor it would give, 0.00582 (b / a) (E-GRV-0080's recorded factor at b = a), against 1 (Newtonian) and 2 (general
// relativity): b / a = 172 and 344.
//
// PREDICTED, from the disclosed probes: P1 holds on (a) and (c) and fails on (b) (made and unmade balance once the box
// is scrambled); P2 FAILS: the response saturates flat, the lump knocks the whole box off the vacuum's 12-beat orbit into
// a scrambled state with about 16 percent more occupied slots, the same for content 1, 3 and 24, so there is no 1/r and
// no coupling per unit content; P3 holds (the scrambled state does not remember the lump's sign); P4 FAILS at content 24
// (the 24-lump scrambles the box with G off too) and holds at 1 and 3. Verdict predicted: fail.
//
// PROBES, disclosed (tmp/grv81-probe1.ts, tmp/grv81-probe2.ts; side 8, integer+0 and integer+1, love lumps, the Born
// path): 96 beats take 0.7 s; with G on the box-wide excess of (a) grows 1.4, 54, 1462, 2732 per cycle from a content-1
// lump and holds near 3100 (of 19,712) from cycle 4, and the content-3 and content-24 lumps reach the same 3100; with G
// off contents 1 and 3 hold an excess of 1 and 4 to 7 near the lump, and content 24 reaches 3100 by cycle 4; the late
// shell profiles (cycles 4 to 11) of (a) read about 15, 3, 7.4, 5.3, 6.6, 6.0, 4.2 at r = 0 .. 6 for every content with
// G on; integer+0 and integer+1 agree bit for bit. No probe read a spread, a fit or a gate.
//
// FIRST RUN (tmp/grv81-run1.log, 133 s, the record): fail on P1, P2 and P4, no gate moved. The 17 starts give one profile
// (range 0 on every reading, as disclosed). The lump does change the vacuum: with G on it holds the box 3,105, 3,103 and
// 3,129 occupied slots above the control (of 19,712, 15.8 percent) for content 1, 3 and 24, the same for every content,
// so the response is a scramble of the whole box and not a count per unit of content. P1 fails because the shell shape
// about the lump is not the lump's: moving the lump across the eight parity classes moves (a) by 39 to 45 at r = 0, 13
// to 16 at r = 1 and 1.0 to 7.4 further out, more than the response itself (about 15, 3, 7.4, 5.3, 6.6, 6.0, 4.5 at
// r = 0 .. 6), so the shells read the vacuum's layout about the column, not a field of the lump; (b) balances (at most
// 0.03 a column a beat); (c) goes with (a). P2 fails: the content-24 profile fits a + k/r with k = -3.22 (SHALLOWER
// near the lump) and residual 9.16 against flat 14.25, power (p at the scan's end, 4) 5.25 and Yukawa (l at the scan's
// end, 0.25) 4.75; no form is a field. P3 holds: love and fear differ by at most 1.90, inside the spread. P4 fails
// beyond the prediction: with G off content 1 changes 8 columns, all on its lines, but content 3 changes 60 columns, 39
// off its lines (not predicted), and content 24 scrambles all 512 (3,121 slots), so line locality holds for a lone
// vibe (E-RLT-0105's calibration) but not for three lone vibes in one dock. The implied depth per unit content k / M
// is -2.61, -0.93, -0.134 (falling as 1 / M because the excess does not grow with M), -196, -70, -10 times the radion's
// 1 / (24 pi), a light-bending factor of -1.14, -0.41, -0.059 against 1 and 2: the numbers have the wrong sign and no
// fixed value, so the vacuum sets no coupling. Title written after the run.
//
// Depth L2: the rule's own dynamics read against a named construction (induced gravity), with a control. DETERMINISM:
// the lump and the placements are placed; the path is a Weyl number of its key; nothing is drawn. NOTHING MOVES: each
// slot takes its neighbor's value one dock along; the counts compare values the stream took. HUSK FIRST: every reading
// is a husk column's count.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { linearFit } from '@/code/measure/regression'
import { columnAt, columnSeries, differingColumns, lineColumns, lumpStart, READINGS, responseBox, ringsFrom, shellProfile, type ReadingName } from '@/code/measure/vacuum-response'

const SIDE = 8
const BEATS = 144
const FROM = 48
const SIZES = [1, 3, 24] as const
const FIT_SIZE = 24
const PLACES: readonly (readonly number[])[] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
]
// E-GRV-0079: the radion's depth per unit content at r is G(r), about 1 / (24 pi r); E-GRV-0080: its light-bending
// factor at that coupling, recorded 0.00582 of the Newtonian count. Reported only.
const RADION_K = 1 / (24 * Math.PI)
const RADION_FACTOR = 0.00582

type Profiles = Record<ReadingName, number[]>
type Fit = { a: number; k: number; residual: number }
type Fits = { flat: number; inverse: Fit; power: Fit & { p: number }; yukawa: Fit & { l: number } }

const mean = (xs: readonly number[][]): number[] => xs[0]!.map((_, r) => xs.reduce((s, x) => s + x[r]!, 0) / xs.length)
const range = (xs: readonly number[][]): number[] => xs[0]!.map((_, r) => Math.max(...xs.map(x => x[r]!)) - Math.min(...xs.map(x => x[r]!)))

function fitOf(rs: readonly number[], ys: readonly number[], f: (r: number) => number): Fit {
  const g = linearFit({ xs: rs.map(f), ys })

  return { a: g.intercept, k: g.slope, residual: g.residual }
}

function fits(rs: readonly number[], ys: readonly number[]): Fits {
  const m = ys.reduce((s, y) => s + y, 0) / ys.length
  const flat = ys.reduce((s, y) => s + (y - m) ** 2, 0)
  let power: Fit & { p: number } = { a: 0, k: 0, residual: Infinity, p: 0 }
  let yukawa: Fit & { l: number } = { a: 0, k: 0, residual: Infinity, l: 0 }

  for (let i = 5; i <= 80; i++) {
    const p = i / 20
    const f = fitOf(rs, ys, r => r ** -p)

    if (f.residual < power.residual) power = { ...f, p }
  }

  for (let i = 1; i <= 64; i++) {
    const l = i / 4
    const f = fitOf(rs, ys, r => Math.exp(-r / l) / r)

    if (f.residual < yukawa.residual) yukawa = { ...f, l }
  }

  return { flat, inverse: fitOf(rs, ys, r => 1 / r), power, yukawa }
}

export default experiment({
  id: 'gravity/vacuum-response-static',
  code: 'E-GRV-0081',
  title:
    "the working vacuum with G does not set a depth by content, it scrambles: fail on P1, P2 and P4: a lump of 1, 3 or 24 open vibes placed in E-SPN-0095's vacuum (side 8, Born path, read over beats 48 .. 143, 17 starts that agree bit for bit) knocks the whole box off its 12-beat orbit and holds 3,105, 3,103 and 3,129 more occupied slots than the control (of 19,712), the same for every content; the shell profile about the lump (about 15, 3, 7.4, 5.3, 6.6, 6.0, 4.5 at r = 0 .. 6) moves more when the lump moves between the eight parity classes (39 to 45 at r = 0, 1.0 to 16 beyond) than its own size, so it is the vacuum's layout, not a field of the lump; a + k/r gives k = -3.22 (shallower near content) with residual 9.2 against flat 14.3, power 5.2, Yukawa 4.7; made and unmade balance; love and fear agree within the spread (charge-blind); with G off a lone vibe changes only its lines' 8 columns, but three in one dock reach 39 columns off their lines and 24 scramble the box as G does; the implied depth per unit content (-2.61, -0.93, -0.134, falling as 1 / M) is no coupling, against the radion's needed 172 and 344 times 1 / (24 pi) for Newton's 1 and general relativity's 2",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(16)
    const born = { threshold: THRESHOLD_BORN, beats: BEATS, coin: true }

    // per start: G on love and fear, G off love, per content; the G-off off-line counts
    const perStart = family.map((member, m) =>
      withStart(member, () => {
        const box = responseBox(SIDE)
        const rOf = ringsFrom(box, box.center)
        const profile = (a: ReturnType<typeof columnSeries>, b: ReturnType<typeof columnSeries>, rings = rOf): Profiles => Object.fromEntries(READINGS.map(name => [name, shellProfile(box, rings, a[name], b[name], FROM, BEATS)])) as Profiles
        const controlOn = columnSeries({ box, start: lumpStart(box, 0, 0).start, mix: true, ...born })
        const controlOff = columnSeries({ box, start: lumpStart(box, 0, 0).start, mix: false, ...born })
        const bySize = SIZES.map(size => {
          const love = lumpStart(box, 1, size)
          const on = profile(columnSeries({ box, start: love.start, mix: true, ...born }), controlOn)
          const fear = profile(columnSeries({ box, start: lumpStart(box, -1, size).start, mix: true, ...born }), controlOn)
          const offRun = columnSeries({ box, start: love.start, mix: false, ...born })
          const lines = lineColumns(box, love.slots)
          const differ = differingColumns(offRun, controlOff, 0, BEATS)
          const offLines = [...differ].filter(c => !lines.has(c)).length
          // the eight placements, integer+0 only (G on, love)
          const places =
            m === 0
              ? PLACES.map(d => {
                  const at = columnAt(box, box.center, d)

                  return profile(columnSeries({ box, start: lumpStart(box, 1, size, at).start, mix: true, ...born }), controlOn, ringsFrom(box, at))
                })
              : []

          return { size, on, fear, off: profile(offRun, controlOff), offLines, differ: differ.size, lines: lines.size, places }
        })

        log(`start ${member.name}`)

        return { name: member.name, shellSize: box.shellSize, bySize }
      }),
    )

    const shellSize = perStart[0]!.shellSize
    const rMax = shellSize.length - 1
    const rs = Array.from({ length: rMax }, (_, i) => i + 1)
    const read = SIZES.map((size, i) => {
      const s = perStart.map(p => p.bySize[i]!)
      const on = Object.fromEntries(READINGS.map(n => [n, mean(s.map(x => x.on[n]))])) as Profiles
      const fear = Object.fromEntries(READINGS.map(n => [n, mean(s.map(x => x.fear[n]))])) as Profiles
      const off = Object.fromEntries(READINGS.map(n => [n, mean(s.map(x => x.off[n]))])) as Profiles
      const startRange = Object.fromEntries(READINGS.map(n => [n, range(s.map(x => x.on[n]))])) as Profiles
      const placeRange = Object.fromEntries(READINGS.map(n => [n, range(s[0]!.places.map(x => x[n]))])) as Profiles
      const sigma = Object.fromEntries(READINGS.map(n => [n, startRange[n].map((v, r) => Math.max(v, placeRange[n][r]!))])) as Profiles
      const responds = Object.fromEntries(READINGS.map(n => [n, rs.every(r => Math.abs(on[n][r]!) > sigma[n][r]!)])) as Record<ReadingName, boolean>
      const blind = on.occupied.every((v, r) => Math.abs(v - fear.occupied[r]!) <= sigma.occupied[r]!)
      const offLines = Math.max(...s.map(x => x.offLines))
      const excess = on.occupied.reduce((t, v, r) => t + v * shellSize[r]!, 0)
      const excessOff = off.occupied.reduce((t, v, r) => t + v * shellSize[r]!, 0)
      const fit = fits(rs, rs.map(r => on.occupied[r]!))
      const startDistinct = new Set(s.map(x => JSON.stringify(x.on))).size

      return { size, on, fear, off, startRange, placeRange, sigma, responds, blind, offLines, excess, excessOff, fit, startDistinct, differMax: Math.max(...s.map(x => x.differ)), linesMax: Math.max(...s.map(x => x.lines)) }
    })

    const big = read.find(x => x.size === FIT_SIZE)!
    const p1 = read.every(x => x.responds.occupied)
    const f = big.fit
    const p2 = f.inverse.k > 0 && f.inverse.residual <= 0.5 * f.flat && f.inverse.residual <= 2 * Math.min(f.power.residual, f.yukawa.residual)
    const p3 = read.every(x => x.blind)
    const p4 = read.every(x => x.offLines === 0)
    const status = !p1 || !p2 ? 'fail' : p3 && p4 ? 'pass' : 'partial'

    const coupling = read.map(x => {
      const perContent = x.fit.inverse.k / x.size
      const ratio = perContent / RADION_K

      return { size: x.size, perContent, ratio, factor: RADION_FACTOR * ratio }
    })

    const g4 = (x: number): string => x.toPrecision(4)
    const prof = (xs: readonly number[]): string => xs.map(x => x.toFixed(4)).join(', ')
    const metrics: Record<string, number> = { gate_P1: p1 ? 1 : 0, gate_P2: p2 ? 1 : 0, gate_P3: p3 ? 1 : 0, gate_P4: p4 ? 1 : 0, starts: family.length, placements: PLACES.length, side: SIDE, beats: BEATS }

    for (const x of read) {
      for (const n of READINGS) {
        metrics[`responds_${n}_${x.size}`] = x.responds[n] ? 1 : 0
        x.on[n].forEach((v, r) => (metrics[`${n}_${x.size}_r${r}`] = v))
      }

      metrics[`sigmaMax_${x.size}`] = Math.max(...x.sigma.occupied)
      metrics[`startRangeMax_${x.size}`] = Math.max(...READINGS.flatMap(n => x.startRange[n]))
      metrics[`startDistinct_${x.size}`] = x.startDistinct
      metrics[`loveFearMax_${x.size}`] = Math.max(...x.on.occupied.map((v, r) => Math.abs(v - x.fear.occupied[r]!)))
      metrics[`offLines_${x.size}`] = x.offLines
      metrics[`excess_${x.size}`] = x.excess
      metrics[`excessOff_${x.size}`] = x.excessOff
      metrics[`k_${x.size}`] = x.fit.inverse.k
    }

    Object.assign(metrics, {
      fitFlat: f.flat,
      fitInverseA: f.inverse.a,
      fitInverseK: f.inverse.k,
      fitInverseResidual: f.inverse.residual,
      fitPowerP: f.power.p,
      fitPowerResidual: f.power.residual,
      fitYukawaL: f.yukawa.l,
      fitYukawaResidual: f.yukawa.residual,
      couplingPerContent24: coupling[2]!.perContent,
      couplingRatio24: coupling[2]!.ratio,
      couplingFactor24: coupling[2]!.factor,
      seconds: (Date.now() - started) / 1000,
    })

    return verdict({
      status,
      claim: `a lump in the working vacuum with G (side 8, Born path, 144 beats, read over beats 48 .. 143): reading (a) occupied responds beyond the spread at r = 1 .. ${rMax} for contents ${read.filter(x => x.responds.occupied).map(x => x.size).join(', ') || 'none'} (${SIZES.join(', ')}); (b) events ${read.filter(x => x.responds.events).map(x => x.size).join(', ') || 'none'}; (c) open ${read.filter(x => x.responds.open).map(x => x.size).join(', ') || 'none'}; the content-24 profile of (a) at r = 0 .. ${rMax} is ${prof(big.on.occupied)}, box-wide excess ${read.map(x => `${x.excess.toFixed(0)} (content ${x.size})`).join(', ')}; a + k/r gives k = ${g4(f.inverse.k)} with residual ${g4(f.inverse.residual)} against flat ${g4(f.flat)}, power (p ${f.power.p}) ${g4(f.power.residual)}, Yukawa (l ${f.yukawa.l}) ${g4(f.yukawa.residual)}: ${p2 ? 'a 1/r profile' : 'no 1/r profile'}; love and fear differ by at most ${g4(Math.max(...read.map(x => metrics[`loveFearMax_${x.size}`]!)))} against sigma: charge-blind ${p3}; with G off the lump changes ${read.map(x => `${x.differMax} columns (${x.offLines} off its lines, content ${x.size})`).join(', ')}; implied depth per unit content k / M = ${coupling.map(c => `${g4(c.perContent)} (content ${c.size})`).join(', ')}, ${coupling.map(c => g4(c.ratio)).join(', ')} times the radion's 1 / (24 pi), a light-bending factor ${coupling.map(c => g4(c.factor)).join(', ')} against 1 (Newton) and 2 (general relativity)`,
      metrics,
      control: {
        offLinesMax: Math.max(...read.map(x => x.offLines)),
        startDistinctMax: Math.max(...read.map(x => x.startDistinct)),
      },
      notes: `L2. Gates P1 ${p1}, P2 ${p2}, P3 ${p3}, P4 ${p4}. Shell sizes ${shellSize.join(', ')}. ${read
        .map(
          x =>
            `CONTENT ${x.size}: ${READINGS.map(n => `${n} G on [${prof(x.on[n])}] fear [${prof(x.fear[n])}] G off [${prof(x.off[n])}] sigma [${prof(x.sigma[n])}] (starts [${prof(x.startRange[n])}], placements [${prof(x.placeRange[n])}])`).join('; ')}; distinct start profiles ${x.startDistinct}; 1/r fit a ${g4(x.fit.inverse.a)} k ${g4(x.fit.inverse.k)} residual ${g4(x.fit.inverse.residual)}, flat ${g4(x.fit.flat)}, power p ${x.fit.power.p} ${g4(x.fit.power.residual)}, Yukawa l ${x.fit.yukawa.l} ${g4(x.fit.yukawa.residual)}; G off: differing columns up to ${x.differMax}, line columns up to ${x.linesMax}, off lines up to ${x.offLines}, box excess ${x.excessOff.toFixed(1)}`,
        )
        .join('. ')}. Radion reference: depth per content 1 / (24 pi) = ${g4(RADION_K)}, factor ${RADION_FACTOR} at b = a. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
