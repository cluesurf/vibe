// DOES THE STRING SETTING THE COIN (A BAG OF HEAVY MASS INSIDE THE STRING) HOLD A LIGHT TRIO (E-SPN-0109)?
// E-SPN-0107's fine coin (zeta = e^(2 pi i/(3n))) makes a lone love light, and no trio held; E-SPN-0108 put a full dock's
// phase back to w and still none held: the drift cost is a diagonal phase, a vector potential, and a light Dirac love
// passes through it (the Klein effect; a split love turns round only with sin(pi/(3n))). What confines a light Dirac
// particle is a scalar potential, one that raises its mass. The proposal: on a dock where a love's link carries nonzero
// flux (inside the string) the love takes the heavy coin w (mass pi/3), elsewhere the fine coin zeta (mass pi/(3n)). The
// flux trit is already carried, so nothing new is stored. note/research/vibe/roadmap/discrete-gravity.md, "Measured, the
// contact restored (E-SPN-0108 fail on F1): the Klein effect".
//
// THE RULE, DERIVED BEFORE ANY RUN (code/rule/fine-coin header, `heavy` and bagHeavy; code/rule/bound-line-pieces
// bagPositions and `bag`).
//   - One family of coins. C(beta) = P+ + beta P- on a line's doublet; C(zeta)^n = C(w). On the fine count u in Z_n a
//     fine line steps u by 1 and a heavy line by n, one whole wrap (the amplitude takes w, u returns): a carry in the
//     same count ring, nothing rounded, nothing new stored.
//   - What the choice reads. A coin mixes a love's two slots, so its choice cannot read the slot (a coin chosen by the
//     slot it acts on is not unitary: <C(w) e0 | C(zeta) e1> = (1 - conj(w) zeta)/2, nonzero for n >= 2). It can read
//     the dock: its two links, l = x - 1 and l = x, each carrying flux c + Q(l) mod 3 or not. That is a function of the
//     loves' positions and the cut trit c only. The coin keeps every dock's occupation and writes no trit, so the choice
//     is the same before and after the coin: on each configuration the coin is a fixed product of per-dock unitaries (a
//     controlled unitary whose control is diagonal and untouched). Unitary. The inverse undoes the stream and c first,
//     reads the same positions and c, and takes each dock's adjoint. Exactly reversible.
//   - Vacuum, line law, light cone. The vacuum has no open love, carries no flux, and the coin acts only on open vibes:
//     untouched exactly. The coin keeps every line's occupation and the stream is the working stream, so every love's
//     support and every line's charge are the fine coin's (E-SPN-0107 control b): the line law and the light cone hold.
//   - Which dock is "inside". Two readings of "a love's link carries flux", both local, both exact:
//       touch   heavy when either link carries flux
//       inside  heavy when both links carry flux (the dock strictly inside the string)
//     (and, measured only, the mirror `rim`: heavy unless both links carry flux, light inside the string: the MIT bag.)
//   - A LONE LOVE IS NOT STRINGLESS, and that decides the readings. By Gauss the flux jumps by the dock's charge (1 or 2,
//     nonzero mod 3) across any occupied dock, so its two links always differ and at least one carries flux.
//       touch: every occupied dock of every configuration is heavy, always. The rule is then the working rule bit for bit
//         at every n (every step a whole wrap). A lone love is heavy (the working walk, m*/E_rest 1.654, top speed 1/2),
//         not light. The trio is E-SPN-0105's level at every n: held, with m* 24.116 and top speed 0.0297 unchanged.
//       inside: a lone love's string (in the full per-link register, the honest form for a charge) is one segment from
//         where it started to where it is, so its two links read (0, 0), (f, 0) or (0, f): never both. It is light
//         everywhere, bit for bit the fine walk. (In the one-trit ring form, written for a neutral cluster, a lone love's
//         string runs to the cut and it is heavy on the cut's docks; the exact window keeps the love away from them.)
//         But a trio's end love reads (0, f) or (f, 0) too, locally the same as a lone love's. So the ends are light.
//         Only the middle love of a three-dock configuration is heavy. A full dock beside a single love (two docks, both
//         ends, where the n = 1 level sits 92 percent) has no inside dock at all: every coin there is fine and the
//         contact is zeta, E-SPN-0107's rule exactly on those configurations.
//     So no reading of a dock's own two links makes a lone love light and a trio's ends heavy: the two are locally the
//     same. The bag the proposal wants needs a reading that knows the string is closed (non-local), or a new register.
//
// PREDICTED, BEFORE THE RUN.
//   - touch: B1 holds (E-SPN-0105's level at every n, E(0) 0.330019). m* 24.116 at every n. With E_rest = pi/n + E(0)
//     (three light loves' half-gaps, as E-SPN-0108) the ratio RISES: 6.947, 12.69, 21.62, 33.37. With the heavy zero
//     (pi + E(0)) it is 6.947 at every n. B2 fails either way. The top speed is 0.0297 at every n: B3 fails. The lone
//     love premise fails (heavy).
//   - inside: the premise holds (a lone love is the fine walk). B1 fails at n = 2, 4, 8 (the ends are light and pass
//     through the vector potential, as E-SPN-0107/0108): no level inside the box, least tails of E-SPN-0107's order
//     (0.1 to 0.25). B2 and B3 are then unread.
//   - The target of B2: a relativistic bound state has m* = E_rest when every constituent's mass and the binding are
//     small against the lattice scale. Under touch every love is at pi/3; under inside the middle love is at pi/3. Neither
//     has a continuum limit in n, so no target within 20 percent of 1 is derived, and B2 gates only the fall.
//   - Verdict: fail. No GRV check is run unless a reading holds B1 and B2.
//
// THE RUNS. The stand-in (code/measure/coined-line-bloch, box 12, three loves on one bulk line, fermion statistics, unit
// 0) with `fine` n and `bag`, and the ring form (code/measure/bound-line pointBeatWith with the working split meeting,
// the drift cost, the fermion sign, `fine` n and `bag`, the side-16 axis line's 32-position cover), n = 1, 2, 4, 8.
//
// GATES, fixed before the first run of this file, read for each of `touch` and `inside`.
//  P  (the proposal's premise) a lone love is the fine walk: in the full per-link register (code/measure/bound-line
//     fluxBeat, string starting empty, flat links, no cost, a ring of 132, 64 beats) its density with the bag equals the
//     fine coin's within 1e-12 at every beat, and in the exact rule (side-8 window, one love at position L/2, L/2 - 1
//     beats so it never reads the cut's docks, no cost) it is bit for bit the fine coin's every beat; at n = 2, 4, 8.
//  B1 at each n a level holds, by E-SPN-0107's W3 reading rule unchanged (E-SPN-0108's F1): among the stand-in's
//     particle levels whose weight beyond N is at most 1e-3, the one of least quasi-energy is the candidate (none: not
//     held); its band followed from K = 0 in steps of pi/64 to 2 pi/32 keeps a least consecutive overlap of at least
//     0.99; its Bloch state on the ring at K = 0 keeps fidelity at least 0.99 at every beat 1 .. 128.
//  B2 B1, and m*/E_rest falls strictly with n: m* = 1/E''(0) (bandCurvature, d = 1e-2), E_rest = pi/n + E(0).
//  B3 B1, and the level's top group velocity rises strictly with n: the largest |transported centroid step| over 128
//     beats on the ring at K = 0, pi/16, pi/8, pi/4, 3 pi/8, pi/2.
//  A reading passes iff P, B1, B2 and B3 hold.
//  M  (measurement, no gate) the rim reading in the stand-in: held in the box, E(0), band overlap, m*, the ratio, the
//     band's top dE/dK; and P for rim.
//  CONTROLS. (a) n = 1 is E-SPN-0105 under both readings: the candidate is its level (E 0.33001851839229945 within
//     1e-12), m* 24.116350860705534 within 1e-9 (relative), and the exact rule with fine 1 and the bag equals the working
//     rule bit for bit on the trio piece over 2 beats. (b) the drift-cost-only light rule reproduces no level: the fine
//     coin with no bag at n = 2, 4, 8 has no level inside and least tails 0.22285364400810195, 0.18927228196350146,
//     0.09437235837021223 (E-SPN-0107), and with E-SPN-0108's full-dock correction 0.18719255298015602,
//     0.19654256078864715, 0.050167878481754316, within 1e-9. (c) the unbound unit (unit 3) fails B1 at every n under
//     both readings. (d) the exact window, both readings, n = 2, 4, 8: the piece of E-SPN-0105's boosted level (the n =
//     1 band at K = pi/2, the anchor just before the cut on sheet 0 of the side-8 cover, its 8 heaviest configurations,
//     as E-SPN-0108) plus one spread trio (positions 1, 2, 3, amplitude 1/8, so an inside dock exists), 1 beat of the
//     exact rule, equals the ring form (points and energy per husk column within 1e-12), keeps the norm, runs back
//     exactly, leaks nothing, disturbs no vacuum branch, breaks no mesh line, puts no love outside the cone; and the bag
//     is exercised there (the ring form with the bag against the fine coin without: 1 - |<a|b>|^2/(<a|a><b|b>) at least
//     1e-3). Verdict: partial if a control fails; pass if a reading passes; fail otherwise.
//  DERIVED IDENTITY (measured, not a gate): touch at n = 2, 4, 8 equals the working rule bit for bit on the window start
//     over 2 beats.
//
// RUN 1 (1362 s, peak 2.7 GB, tmp/bag-run1.log, the record; no probe was run before it): fail, as predicted, no gate
// moved; every control holds. touch: P false (a lone love's density off the fine walk's by 0.56, 0.75, 0.92), B1 true
// (E-SPN-0105's level at every n: E(0) 0.330019, m* 24.1164, ring least fidelity 0.99999), B2 false (m*/E_rest 6.947,
// 12.69, 21.62, 33.37, and 6.947 at every n against the heavy zero), B3 false (top 0.02965 at every n); touch equals the
// working rule bit for bit at n = 2, 4, 8. inside: P true (register off 0, exact bit for bit), B1 false (no level inside
// at n = 2, 4, 8: least tail 0.292, 0.437, 0.417, mean string 4.68, 6.63, 7.27, contact 0.17, 0.27, 0.14, looser than
// the drift cost alone, 0.223, 0.189, 0.094), B2 and B3 unread. rim (measured, P false): n = 1 the level; n = 2 none in
// the box (least tail 0.0049); n = 4 and 8 a level in the box (tail 1.7e-4, 1.6e-5, contact 0.92, 0.91) whose band
// overlap is 0.959 and 0.889 and whose m* is 10.85 and 151.8 (m*/E_rest 9.70, 208.7): held by the heavy rim, but not a
// clean band and not light. Controls: n = 1 is E-SPN-0105 under both readings (bit for bit), the drift-cost-only tails
// exactly as recorded, the unbound unit holds nothing, the windows equal the ring form to 2e-17, reversed, exercised
// (0.15 to 0.76). No GRV check was run: no reading held B1 and B2.
//
// Depth L2: the lattice Dirac walk with a position-dependent mass read from a Z_3 flux, a known construction (bag and
// flux-tube confinement); what could fail is whether a bound light level exists. DETERMINISM: no random numbers. The rule
// is exact per count in Z[w][1/2]; the band, the placement's floats and every reading are measurement. NOTHING MOVES: the
// coin writes amplitudes on a dock's own line and reads trits the stream wrote. HUSK FIRST: one husk line's columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLevels, wholeBasis, type LineLevel, type LineSector } from '@/code/measure/coined-line-bloch'
import { cutDensity, fluxBeat, fluxDensity, fluxStart, pointBeatWith, type CutState, type PieceOptions } from '@/code/measure/bound-line'
import { runWindow, windowContext } from '@/code/measure/permutation-meeting'
import { bandCurvature, bandSlope, blochEntries, boostedRun, cutStart as cutOf, exactStart, followLevel, overlap, pointOrbit, type BandPoint, type BoostedRun, type Entry } from '@/code/measure/moving-level'
import { heaviestEntries, sameBoundState } from '@/code/measure/fine-coin'
import { boundBeat, type BoundOptions } from '@/code/rule/bound-line-pieces'
import { type Bag } from '@/code/rule/fine-coin'

const NS: readonly number[] = [1, 2, 4, 8]
const LIGHT: readonly number[] = [2, 4, 8]
const READINGS: readonly Bag[] = ['touch', 'inside']
const BOX = 12
const SIDE = 16
const P = 40
const BEATS = 128
const STEP = Math.PI / 64
const CURVE_D = 1e-2
const SLOPE_D = 1e-3
const TAIL = 1e-3
const HOLD = 0.99
const HOLD_KS: readonly number[] = [0, (2 * Math.PI) / 32]
const BAND_KS: readonly number[] = [0, 1, 2, 4, 6, 8].map(s => (2 * Math.PI * s) / 32)
const EXACT = 1e-12
const SAME = 1e-9
const EXERCISED = 1e-3
const RECORDED = {
  energy: 0.33001851839229945,
  mass: 24.116350860705534,
  bare: new Map<number, number>([
    [2, 0.22285364400810195],
    [4, 0.18927228196350146],
    [8, 0.09437235837021223],
  ]),
  fullDock: new Map<number, number>([
    [2, 0.18719255298015602],
    [4, 0.19654256078864715],
    [8, 0.050167878481754316],
  ]),
}
const TRIO_WINDOW = { side: 8, beats: 1, same: 2 }
const PIECE = 8
const LONE_REGISTER = { beats: 64 }
const LONE_WINDOW = { side: 8 }

type Level = { basis: ReturnType<typeof lineBasis>; inside: LineLevel[]; candidate: LineLevel; least: LineLevel }

export default experiment({
  id: 'spin/string-bag',
  code: 'E-SPN-0109',
  title:
    "the string setting the coin does not hold a light trio, fail: the coin read from a dock's own two flux trits is exact, unitary and reversible (a controlled unitary on untouched positions and cut trit; windows equal the ring form to 2e-17, reversed, 0 leak, 0 vacuum disturbed, in the cone), but by Gauss every occupied dock touches flux, so reading 'touch' makes every love heavy: the working rule bit for bit at n = 2, 4, 8, E-SPN-0105's level held (E 0.330019, m* 24.116, top speed 0.0297 at every n), m*/E_rest 6.95, 12.69, 21.62, 33.37 rising, and a lone love heavy; reading 'inside' (both links carry flux) keeps a lone love the fine walk bit for bit, but a trio's end love reads its links as a lone love does, so the ends stay light and no level is held at n = 2, 4, 8 (least tail 0.29, 0.44, 0.42, looser than the drift cost alone); the mirror 'rim' holds a heavy, narrow level at n = 4, 8 (m* 10.8, 152) with a heavy lone love; no local flux reading can make a lone love light and a trio's ends heavy",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const f4 = (x: number): string => x.toFixed(4)
    const f6 = (x: number): string => x.toFixed(6)
    const e2 = (x: number): string => x.toExponential(2)
    const rest = (n: number): number => Math.PI / (3 * n)

    const standIn = (n: number, bag: Bag | undefined, fullDock: boolean, unit: number): Level => {
      const sector: LineSector = { flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: BOX, unit, fine: n, ...(fullDock ? { fullDock } : {}), ...(bag === undefined ? {} : { bag }) }
      const basis = lineBasis(sector)
      const levels = lineLevels(basis, wholeBasis(basis)).levels
      const inside = levels.filter(l => l.tailN <= TAIL)
      const least = levels.reduce((a, b) => (b.tailN < a.tailN ? b : a))
      const candidate = inside.length > 0 ? inside.reduce((a, b) => (b.energy < a.energy ? b : a)) : least

      return { basis, inside, candidate, least }
    }

    const ctx = windowContext(SIDE)

    if (pointOrbit(ctx.gauge).length * ctx.L !== 32) throw new Error('string-bag: the cover is not 32, the momenta were fixed for 32')

    const runOn = (options: PieceOptions, s0: CutState, K: number): BoostedRun =>
      boostedRun(
        s => pointBeatWith(options, ctx.f.tables, ctx.ring, s),
        s0,
        K,
        BEATS,
        s => cutDensity(ctx.L, s),
      )

    // B1 at one n for one reading and unit: the candidate, its band, the ring run at K = 0
    const trioAt = (n: number, bag: Bag, unit: number, full: boolean) => {
      const s = standIn(n, bag, false, unit)
      const sub = wholeBasis(s.basis)

      if (s.inside.length === 0) return { n, s, band: [] as BandPoint[], rest0: undefined as BoostedRun | undefined, held: false }

      const band = followLevel(s.basis, sub, s.candidate, full ? BAND_KS : HOLD_KS, STEP)
      const options: PieceOptions = { cost: true, sign: true, unit: unit === 3 ? 3 : 0, flat: false, fine: n, bag }
      const rest0 = runOn(options, cutOf(blochEntries(ctx.gauge, s.basis, (band[0] as BandPoint).vector, 0, P).entries, P), 0)
      const held = (band[1] as BandPoint).overlap >= HOLD && rest0.least >= HOLD

      return { n, s, band, rest0, held }
    }

    const readTrio = (bag: Bag, n: number) => {
      const t = trioAt(n, bag, 0, true)

      log(`${bag} n ${n}`)

      if (!t.held) return { ...t, mass: Number.NaN, eRest: Number.NaN, eHeavy: Number.NaN, ratio: Number.NaN, slopes: [] as number[], runs: [] as BoostedRun[], top: Number.NaN, topBand: Number.NaN }

      const sub = wholeBasis(t.s.basis)
      const mass = 1 / bandCurvature(t.s.basis, sub, t.band[0] as BandPoint, CURVE_D)
      const e0 = (t.rest0 as BoostedRun).energy
      const eRest = 3 * rest(n) + e0
      const slopes = t.band.map(b => bandSlope(t.s.basis, sub, b, SLOPE_D))
      const options: PieceOptions = { cost: true, sign: true, unit: 0, flat: false, fine: n, bag }
      const runs = t.band.map((b, i) => (i === 0 ? (t.rest0 as BoostedRun) : runOn(options, cutOf(blochEntries(ctx.gauge, t.s.basis, b.vector, b.K, P).entries, P), b.K)))

      log(`${bag} n ${n} band`)

      return { ...t, mass, eRest, eHeavy: Math.PI + e0, ratio: mass / eRest, slopes, runs, top: Math.max(...runs.map(r => Math.abs(r.velocity))), topBand: Math.max(...slopes.map(Math.abs)) }
    }

    type Trio = ReturnType<typeof readTrio>

    const trios = new Map<Bag, Trio[]>(READINGS.map(bag => [bag, NS.map(n => readTrio(bag, n))]))
    const gates = READINGS.map(bag => {
      const ts = trios.get(bag) as Trio[]
      const b1 = ts.every(t => t.held)
      const falls = ts.every((t, i) => i === 0 || t.ratio < (ts[i - 1] as Trio).ratio)
      const rises = ts.every((t, i) => i === 0 || t.top > (ts[i - 1] as Trio).top)

      return { bag, b1, b2: b1 && falls, b3: b1 && rises }
    })

    // ---- P: a lone love is the fine walk ----
    const lctx = windowContext(LONE_WINDOW.side)
    const mid = Math.floor(lctx.L / 2)
    const loneBeats = mid - 1

    if (loneBeats < 3) throw new Error('string-bag: the lone window is too short')

    const loneAt: Entry[] = [{ ts: [{ x: mid, j: 0, p: (lctx.gauge.to[mid] as number[])[0] as number }], c: 0, a: 1n, b: 0n }]
    const premise = (bag: Bag) =>
      LIGHT.map(n => {
        const L = 2 * LONE_REGISTER.beats + 4
        let a = fluxStart(L, [{ ts: [[0, 0]], amp: [1, 0] }], false)
        let b = a
        let registerOff = 0

        for (let t = 0; t < LONE_REGISTER.beats; t++) {
          a = fluxBeat({ cost: false, sign: false, fine: n, bag }, L, a)
          b = fluxBeat({ cost: false, sign: false, fine: n }, L, b)

          const da = fluxDensity(L, a)
          const db = fluxDensity(L, b)

          for (let x = 0; x < L; x++) registerOff = Math.max(registerOff, Math.abs((da[x] as number) - (db[x] as number)))
        }

        let u = exactStart(lctx.vac, lctx.ring, loneAt, 0)
        let v = u
        let exactSame = true

        for (let t = 0; t < loneBeats; t++) {
          u = boundBeat({ cost: false, sign: false, fine: n, bag }, lctx.f.tables, lctx.ring, u, t)
          v = boundBeat({ cost: false, sign: false, fine: n }, lctx.f.tables, lctx.ring, v, t)
          exactSame &&= sameBoundState(u, v)
        }

        const w = runWindow({ cost: false, sign: false, fine: n, bag }, lctx, exactStart(lctx.vac, lctx.ring, loneAt, 0), cutOf(loneAt, 0), loneBeats)
        const windowOk = w.reversed && w.beats.every((x, t) => x.normKept && x.disturbed === 0 && x.leak === 0 && x.outsideCone === 0 && x.reach === t + 1)

        log(`lone ${bag} n ${n}`)

        return { n, registerOff, exactSame, windowOk, same: registerOff <= EXACT && exactSame }
      })
    const premises = new Map<Bag, ReturnType<typeof premise>>((['touch', 'inside', 'rim'] as const).map(bag => [bag, premise(bag)]))
    const premiseHolds = (bag: Bag): boolean => (premises.get(bag) as ReturnType<typeof premise>).every(x => x.same)
    const loneWindows = [...premises.values()].every(list => list.every(x => x.windowOk))

    const passes = gates.map(g => ({ ...g, p: premiseHolds(g.bag), pass: premiseHolds(g.bag) && g.b1 && g.b2 && g.b3 }))

    // ---- M: the rim reading in the stand-in ----
    const rim = NS.map(n => {
      const s = standIn(n, 'rim', false, 0)
      const sub = wholeBasis(s.basis)

      log(`rim n ${n}`)

      if (s.inside.length === 0) return { n, s, inBox: false, overlap: Number.NaN, mass: Number.NaN, ratio: Number.NaN, top: Number.NaN }

      const band = followLevel(s.basis, sub, s.candidate, BAND_KS, STEP)
      const mass = 1 / bandCurvature(s.basis, sub, band[0] as BandPoint, CURVE_D)

      return { n, s, inBox: true, overlap: Math.min(...band.slice(1).map(b => b.overlap)), mass, ratio: mass / (3 * rest(n) + s.candidate.energy), top: Math.max(...band.map(b => Math.abs(bandSlope(s.basis, sub, b, SLOPE_D)))) }
    })

    // ---- control (a): n = 1 is E-SPN-0105 under both readings ----
    const wctx = windowContext(TRIO_WINDOW.side)
    const one = (trios.get('touch') as Trio[])[0] as Trio
    const piece: Entry[] = ((): Entry[] => {
      if (!one.held) return []

      const b = one.band[one.band.length - 1] as BandPoint

      return heaviestEntries(blochEntries(wctx.gauge, one.s.basis, b.vector, b.K, P, [wctx.L - 1]).entries, PIECE)
    })()
    const pointAt = (x: number): number => (wctx.gauge.to[x] as number[])[0] as number
    // one spread trio at positions 1, 2, 3 (three docks, so the middle one is inside the string), amplitude 1/8
    const spread: Entry = {
      ts: [
        { x: 1, j: 0, p: pointAt(1) },
        { x: 2, j: 1, p: pointAt(2) },
        { x: 3, j: 0, p: pointAt(3) },
      ],
      c: 0,
      a: 1n << BigInt(P - 3),
      b: 0n,
    }
    const windowStart = piece.length === 0 ? [] : [...piece, spread]
    const sameAs = (a: BoundOptions, b: BoundOptions, beats: number): boolean => {
      if (windowStart.length === 0) return false

      let x = exactStart(wctx.vac, wctx.ring, windowStart, P)
      let y = x
      let same = true

      for (let t = 0; t < beats; t++) {
        x = boundBeat(a, wctx.f.tables, wctx.ring, x, t)
        y = boundBeat(b, wctx.f.tables, wctx.ring, y, t)
        same &&= sameBoundState(x, y)
      }

      return same
    }
    const working: BoundOptions = { cost: true, sign: true }
    const ones = READINGS.map(bag => {
      const t = (trios.get(bag) as Trio[])[0] as Trio
      const bitForBit = sameAs(working, { cost: true, sign: true, fine: 1, bag }, TRIO_WINDOW.same)

      log(`control a ${bag}`)

      return { bag, bitForBit, ok: t.held && Math.abs(t.s.candidate.energy - RECORDED.energy) <= EXACT && Math.abs(t.mass / RECORDED.mass - 1) <= SAME && bitForBit }
    })
    const controlOne = ones.every(x => x.ok)

    // the derived identity: touch is the working rule at every n
    const touchWorking = LIGHT.map(n => {
      const same = sameAs(working, { cost: true, sign: true, fine: n, bag: 'touch' }, TRIO_WINDOW.same)

      log(`touch is working n ${n}`)

      return { n, same }
    })

    // ---- control (b): the drift-cost-only light rule holds no level ----
    const bare = LIGHT.map(n => {
      const a = standIn(n, undefined, false, 0)
      const b = standIn(n, undefined, true, 0)

      log(`drift cost only n ${n}`)

      return { n, bareInside: a.inside.length, bareTail: a.least.tailN, fullInside: b.inside.length, fullTail: b.least.tailN }
    })
    const controlBare = bare.every(x => x.bareInside === 0 && x.fullInside === 0 && Math.abs(x.bareTail - (RECORDED.bare.get(x.n) as number)) <= SAME && Math.abs(x.fullTail - (RECORDED.fullDock.get(x.n) as number)) <= SAME)

    // ---- control (c): the unbound unit fails B1 ----
    const unbound = READINGS.flatMap(bag =>
      NS.map(n => {
        const t = trioAt(n, bag, 3, false)

        log(`unbound ${bag} n ${n}`)

        return { bag, n, held: t.held, inside: t.s.inside.length, tail: t.s.least.tailN }
      }),
    )
    const controlUnbound = unbound.every(t => !t.held)

    // ---- control (d): the exact window ----
    const windows = READINGS.flatMap(bag =>
      LIGHT.map(n => {
        if (windowStart.length === 0) return { bag, n, ok: false, exercised: 0, w: undefined }

        const options: BoundOptions = { cost: true, sign: true, fine: n, bag }
        const w = runWindow(options, wctx, exactStart(wctx.vac, wctx.ring, windowStart, P), cutOf(windowStart, P), TRIO_WINDOW.beats)
        let a = cutOf(windowStart, P)
        let b = a

        for (let t = 0; t < TRIO_WINDOW.beats; t++) {
          a = pointBeatWith({ ...options, unit: 0, flat: false }, wctx.f.tables, wctx.ring, a)
          b = pointBeatWith({ cost: true, sign: true, unit: 0, flat: false, fine: n }, wctx.f.tables, wctx.ring, b)
        }

        const ab = overlap(a, b)
        const aa = overlap(a, a)[0]
        const bb = overlap(b, b)[0]
        const exercised = 1 - (ab[0] ** 2 + ab[1] ** 2) / (aa * bb)
        const ok = w.reversed && w.beats.every(x => x.normKept && x.physicalNormOff <= EXACT && x.leak === 0 && x.disturbed === 0 && x.pointGap <= EXACT && x.energyGap <= EXACT && x.toneBroken === 0 && x.outsideCone === 0)

        log(`window ${bag} n ${n}`)

        return { bag, n, ok, exercised, w }
      }),
    )
    const controlWindow = windows.every(x => x.ok && x.exercised >= EXERCISED)

    const control = controlOne && controlBare && controlUnbound && controlWindow
    const anyPass = passes.some(p => p.pass)
    const status = !control ? 'partial' : anyPass ? 'pass' : 'fail'
    const metrics: Record<string, number> = {
      control: control ? 1 : 0,
      controlOne: controlOne ? 1 : 0,
      controlBare: controlBare ? 1 : 0,
      controlUnbound: controlUnbound ? 1 : 0,
      controlWindow: controlWindow ? 1 : 0,
      loneWindows: loneWindows ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    }

    for (const p of passes) {
      metrics[`${p.bag}_gate_P`] = p.p ? 1 : 0
      metrics[`${p.bag}_gate_B1`] = p.b1 ? 1 : 0
      metrics[`${p.bag}_gate_B2`] = p.b2 ? 1 : 0
      metrics[`${p.bag}_gate_B3`] = p.b3 ? 1 : 0
      metrics[`${p.bag}_pass`] = p.pass ? 1 : 0
    }

    for (const [bag, ts] of trios) {
      for (const t of ts) {
        const k = `${bag}${t.n}`

        metrics[`${k}_held`] = t.held ? 1 : 0
        metrics[`${k}_levelsInside`] = t.s.inside.length
        metrics[`${k}_energy`] = t.s.candidate.energy
        metrics[`${k}_leastTail`] = t.s.least.tailN
        metrics[`${k}_meanString`] = t.s.candidate.mean
        metrics[`${k}_contact`] = t.s.candidate.contact
        metrics[`${k}_mass`] = t.mass
        metrics[`${k}_eRest`] = t.eRest
        metrics[`${k}_ratio`] = t.ratio
        metrics[`${k}_ratioHeavyZero`] = t.mass / t.eHeavy
        metrics[`${k}_top`] = t.top
        metrics[`${k}_topBand`] = t.topBand
        if (t.band[1] !== undefined) metrics[`${k}_overlap`] = (t.band[1] as BandPoint).overlap
        if (t.rest0 !== undefined) metrics[`${k}_ringLeast`] = t.rest0.least
      }
    }

    for (const [bag, list] of premises) for (const x of list) {
      metrics[`lone_${bag}${x.n}_registerOff`] = x.registerOff
      metrics[`lone_${bag}${x.n}_exactSame`] = x.exactSame ? 1 : 0
    }
    for (const r of rim) {
      metrics[`rim${r.n}_inBox`] = r.inBox ? 1 : 0
      metrics[`rim${r.n}_energy`] = r.s.candidate.energy
      metrics[`rim${r.n}_leastTail`] = r.s.least.tailN
      metrics[`rim${r.n}_mass`] = r.mass
      metrics[`rim${r.n}_ratio`] = r.ratio
      metrics[`rim${r.n}_top`] = r.top
    }
    for (const x of touchWorking) metrics[`touchIsWorking${x.n}`] = x.same ? 1 : 0
    for (const x of bare) {
      metrics[`bare${x.n}_leastTail`] = x.bareTail
      metrics[`fullDock${x.n}_leastTail`] = x.fullTail
    }
    for (const t of unbound) metrics[`unbound_${t.bag}${t.n}_held`] = t.held ? 1 : 0
    for (const x of windows) metrics[`window_${x.bag}${x.n}_exercised`] = x.exercised

    const trioRow = (t: Trio): string =>
      t.s.inside.length === 0
        ? `n ${t.n} no level inside (least tail ${f4(t.s.least.tailN)}, mean string ${f4(t.s.least.mean)}, contact ${f4(t.s.least.contact)})`
        : !t.held
          ? `n ${t.n} candidate E ${f6(t.s.candidate.energy)} not held (overlap ${f4((t.band[1] as BandPoint).overlap)}, ring least ${f4((t.rest0 as BoostedRun).least)})`
          : `n ${t.n} E(0) ${f6(t.s.candidate.energy)}, m* ${f4(t.mass)}, E_rest ${f4(t.eRest)}, m*/E_rest ${f4(t.ratio)} (heavy zero ${f4(t.mass / t.eHeavy)}), top ${f4(t.top)} (band ${f4(t.topBand)}), ring least ${f4((t.rest0 as BoostedRun).least)}`

    return verdict({
      status,
      claim: `${READINGS.map(bag => `${bag}: ${(trios.get(bag) as Trio[]).map(trioRow).join('; ')}`).join(' | ')}; gates ${passes.map(p => `${p.bag} P ${p.p} B1 ${p.b1} B2 ${p.b2} B3 ${p.b3}`).join(', ')}; rim (measured): ${rim.map(r => (r.inBox ? `n ${r.n} E ${f6(r.s.candidate.energy)} overlap ${f4(r.overlap)} m* ${f4(r.mass)} ratio ${f4(r.ratio)} top ${f4(r.top)}` : `n ${r.n} none (least tail ${f4(r.s.least.tailN)})`)).join('; ')}, P ${premiseHolds('rim')}; touch is the working rule ${touchWorking.map(x => `n ${x.n} ${x.same}`).join(', ')}; controls: n = 1 ${controlOne}, drift cost only ${controlBare}, unbound ${controlUnbound}, window ${controlWindow}`,
      metrics,
      control: { one: controlOne ? 1 : 0, bare: controlBare ? 1 : 0, unbound: controlUnbound ? 1 : 0, window: controlWindow ? 1 : 0 },
      notes: `L2. Lone love: ${[...premises].map(([bag, list]) => `${bag} ${list.map(x => `n ${x.n} register off ${e2(x.registerOff)} exact same ${x.exactSame} window ${x.windowOk}`).join(', ')}`).join('; ')}. Bands: ${[...trios].map(([bag, ts]) => `${bag} ${ts.map(t => `n ${t.n} dim ${t.s.basis.configs.length} inside ${t.s.inside.length} [${t.band.map((b, i) => `K ${f4(b.K)} E ${f6(b.energy)} ov ${f4(b.overlap)}${t.slopes[i] === undefined ? '' : ` dE/dK ${(t.slopes[i] as number).toExponential(3)}`}`).join(' ')}] ring ${t.runs.map(r => `K ${f4(r.K)} least ${f6(r.least)} v ${r.velocity.toExponential(3)}`).join(' ')}`).join('; ')}`).join(' | ')}. Drift cost only: ${bare.map(x => `n ${x.n} bare ${x.bareInside} inside tail ${x.bareTail}, full dock ${x.fullInside} inside tail ${x.fullTail}`).join('; ')}. Unbound: ${unbound.map(t => `${t.bag} n ${t.n} held ${t.held} inside ${t.inside} tail ${e2(t.tail)}`).join('; ')}. Rim: ${rim.map(r => `n ${r.n} inside ${r.s.inside.length} least tail ${e2(r.s.least.tailN)} mean ${f4(r.s.candidate.mean)} contact ${f4(r.s.candidate.contact)}`).join('; ')}. n = 1: ${ones.map(x => `${x.bag} bit for bit ${x.bitForBit} ok ${x.ok}`).join(', ')}. Windows (side ${TRIO_WINDOW.side}, ${TRIO_WINDOW.beats} beat, ${windowStart.length} placed entries): ${windows.map(x => `${x.bag} n ${x.n} ok ${x.ok} exercised ${e2(x.exercised)}${x.w === undefined ? '' : ` ${x.w.beats.map(b => `${b.branches} branches, point gap ${e2(b.pointGap)}, energy gap ${e2(b.energyGap)}`).join('; ')}, reversed ${x.w.reversed}`}`).join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
