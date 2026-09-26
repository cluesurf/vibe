// Light as column sums of trits (E-FRC-0207): every bulk link and triangle holds trits, and the husk's
// integers (the angle, the flux, the force counters) are the sums of columns of them down the 4D depth.
//
// The user's objection: the pure model holds only trits per slot, and the light experiments add unbounded
// integers per link (the angle A, the flux E) and per plaquette (the remainder). The hypothesis: the husk's
// integers are column sums of the bulk's trits, so the depth is the register and nothing else is stored.
//
// The rule, code/rule/trit-column. The bulk is the D4 lattice with husk period L and depth period 2D, so a
// husk dock has a column of D bulk docks. Every bulk link holds an angle trit and a string trit (the flux its
// vibes dragged), every bulk triangle a potential trit u, and one triangle per column dock of each husk
// triangle holds the counter trits. No link holds a flux: the bulk flux s - C^T u is a relation of its
// string and its triangles, so Gauss's law in the bulk holds by construction. The husk reads column sums:
// A_l (a cycling number mod 4D on an axis, 2D on a diagonal), U_P, and the counters (each in -D .. D, mod
// q = 2D + 1). The beat is the leapfrog: drift A += E, then each husk triangle's counters take the drive
// n_P p B_P and each wrap pays one unit of force into U_P. The coupling is kappa = 2p / q per bulk triangle:
// with p = 1, kappa = 2 / (2D + 1), THE INVERSE DEPTH. Two forms of the counters: `first` (E-FRC-0181's
// carried remainder) and `wave` (E-FRC-0185's error fed back through the leapfrog operator, its spatial
// term paid by a second counter instead of rounded), the wave form read on its shadow B~ = B + C W C^T d.
//
// How a kick of f is paid. Each column is in the thermometer code: a value v is |v| trits of sign v at the
// top of the column, zeros below. Adding f moves the front by f: exactly |f| units of trit change, all at
// the front. A counter is a cycling number whose wrap IS the unit of force (the threshold); an angle is a
// cycling number whose wrap is compact U(1); a potential column that fills wraps (counted), because a cap
// would merge two states and break the bijection.
//
// The theorem this experiment is built around (proved in the notes): a DEPTH-LOCAL trit rule whose column
// sums are closed on the husk can only make integer-linear husk updates, so its coupling is an integer and
// kappa lambda_max >= 16 > 4: unstable. The counter's floor and every wrap are not additive over the depth,
// so the rule must read whole columns. It is local on the husk and global along the depth (reach D).
//
// Probes ran before these gates were written (tmp/trit-probe1..5.log): the exactness, reversibility and
// symbol probes, and a wave probe that showed the first form heats (waves 37 to 87 percent off) and that
// the wave form's raw B carries a dither of about 12 units (bound 36 D / (2D + 1) < 18), so waves are run
// at peak |B| 8 with the seam at 2D = 32. No gate below was moved after a gated run.
//
// Gates, fixed before the first gated run:
// A  exactness: the trit rule's column sums equal the husk integer rule on every value of every beat, 0
//    mismatches, both forms, 60 beats from a golden Weyl start (side 4, D 4), and the wave form 100 beats
//    from a wave start (side 8, D 16)
// R  reversibility: after the same beats run back, every trit equals its start, 0 mismatches
// T  trits only: every stored value in -1 .. 1
// G  Gauss's law: a static love-fear pair joined by a string of trits (side 4, D 8, wave form), 200 beats:
//    0 bulk violations and 0 husk violations (column charge); control: the one-sheet reading (depth level 0
//    only) must violate the husk's Gauss's law
// S  symbol: the rule's husk operator has E-FRC-0179's husk eigenvalues within 1e-12 at 5 wave vectors, with
//    exactly 1 gauge zero (under 1e-12) and 2 photon eigenvalues below every massive one
// W  light: wave form on the TRIT rule, side 8, D 16, peak |B| 8, 400 beats, wave vectors (1,0,0), (1,1,0),
//    (1,1,1) times 2 pi / 8, both photon polarizations: the shadow frequency within 1e-4 of the symbol, with
//    0 potential wraps and no plaquette reaching the seam
// P  the payout law, exhaustive on one column of m = 1 to 6 trits: from every v to every v', exactly |v' -
//    v| units of trit change and the deepest change at max(|v|, |v'|), 0 exceptions
// Reported, not gated: W0 the first form on the W waves (predicted to fail by heating), L the rule's depth
// reach (predicted D: the whole column is read), and the non-additivity witness for the theorem.
// Status: pass if A, R, T, G, S, W and P pass, partial if A, R, T and G pass, fail otherwise.
//
// Depth L2: an exact construction (the husk integer leapfrog held in trit columns, bit for bit) with a
// derivation of why it must read whole columns, measured against the exact linear theory.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl } from '@/code/tool/weyl'
import {
  bulkFlux,
  bulkGaussViolations,
  columnSumLinks,
  copyHuskLight,
  copyTritState,
  emptyTritState,
  floorDiv,
  huskGaussViolations,
  huskLightBeat,
  makeTritLight,
  placeTritPair,
  readHusk,
  tritLightBeat,
  tritLightBeatBack,
  writeColumn,
  writeHusk,
  type HuskLightState,
  type TritForm,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { e179HuskValues, sortedEigen, tritHuskSymbol, tritKappa, tritWave } from '@/code/measure/trit-column-light'

const KEYS = ['angle', 'potential', 'counter', 'lag', 'spatial', 'string'] as const

function mismatches(a: HuskLightState, b: HuskLightState): number {
  let m = 0

  for (const key of KEYS) {
    for (let i = 0; i < a[key].length; i++) {
      m += a[key][i] === b[key][i] ? 0 : 1
    }
  }

  return m
}

function tritMismatches(a: TritState, b: TritState): number {
  let m = 0

  for (const key of ['vibe', 'angle', 'string', 'potential', 'counter', 'lag', 'spatial'] as const) {
    for (let i = 0; i < a[key].length; i++) {
      m += a[key][i] === b[key][i] ? 0 : 1
    }
  }

  return m
}

function outOfRange(s: TritState): number {
  let bad = 0

  for (const key of ['vibe', 'angle', 'string', 'potential', 'counter', 'lag', 'spatial'] as const) {
    for (const v of s[key]) {
      bad += v >= -1 && v <= 1 ? 0 : 1
    }
  }

  return bad
}

// a golden Weyl start in every window
function weylStart(light: TritLight): TritState {
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

  return s
}

function exactRun(light: TritLight, start: TritState, beats: number): { mismatches: number; back: number; range: number } {
  const s = copyTritState(start)
  const ref = readHusk(light, s)

  let m = 0
  let range = outOfRange(s)

  for (let t = 0; t < beats; t++) {
    huskLightBeat(light, ref)
    tritLightBeat(light, s)
    m += mismatches(readHusk(light, s), ref)
    range += outOfRange(s)
  }

  for (let t = 0; t < beats; t++) {
    tritLightBeatBack(light, s)
  }

  return { mismatches: m, back: tritMismatches(s, start), range }
}

// a wave start (the same one tritWave builds), for the exactness gate on a physical state
function waveStart(light: TritLight): TritState {
  const s = emptyTritState(light)
  const h = readHusk(light, s)
  const tau = (2 * Math.PI) / light.bulk.side

  for (let l = 0; l < h.angle.length; l++) {
    const y = Math.floor(l / 9)
    const n = light.window[l % 9] ?? 1
    const x = y % light.bulk.side

    h.angle[l] = ((Math.floor(6 * Math.cos(tau * x + (l % 9)) + 0.5) + n / 2) % n + n) % n - n / 2
  }

  writeHusk(light, s, h)

  return s
}

function sectionA(): Record<string, number> {
  const out: Record<string, number> = {}

  for (const form of ['first', 'wave'] as TritForm[]) {
    const light = makeTritLight({ side: 4, depth: 4, form })
    const r = exactRun(light, weylStart(light), 60)

    out[`a_${form}_Mismatches`] = r.mismatches
    out[`a_${form}_BackMismatches`] = r.back
    out[`a_${form}_OutOfRange`] = r.range
  }

  const big = makeTritLight({ side: 8, depth: 16, form: 'wave' })
  const r = exactRun(big, waveStart(big), 100)

  out['aWaveBoxMismatches'] = r.mismatches
  out['aWaveBoxBackMismatches'] = r.back
  out['aWaveBoxOutOfRange'] = r.range
  out['aTritsPerBulkDock'] = 1 + 12 * 2 + big.bulk.triangles / big.bulk.docks + (3 * big.bulk.huskTriangles * big.bulk.depth) / big.bulk.docks

  return out
}

function sectionG(): Record<string, number> {
  const light = makeTritLight({ side: 4, depth: 8, form: 'wave' })
  const s = emptyTritState(light)

  placeTritPair(light, s, 0, [0, 0, 0], 1)

  let bulkBad = 0
  let huskBad = 0
  let sheetBad = 0

  for (let t = 0; t <= 200; t++) {
    const e = bulkFlux(light, s)

    bulkBad += bulkGaussViolations(light, s)
    huskBad += huskGaussViolations(light, columnSumLinks(light, e), s.vibe)

    const sheet = Int32Array.from(e, (v, l) => ((light.bulk.level[Math.floor(l / 12)] ?? 0) === 0 ? v : 0))

    sheetBad += huskGaussViolations(light, columnSumLinks(light, sheet), s.vibe)

    if (t < 200) {
      tritLightBeat(light, s)
    }
  }

  return { gBulkViolations: bulkBad, gHuskViolations: huskBad, gSheetControlViolations: sheetBad }
}

function sectionS(): Record<string, number> {
  const light = makeTritLight({ side: 8, depth: 16 })
  const tau = (2 * Math.PI) / 8

  let gap = 0
  let gaugeZeros = 0
  let photonsBelow = 0
  const vectors = [
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
    [2, 1, 0],
    [3, 2, 1],
  ]

  for (const m of vectors) {
    const k = m.map(x => x * tau)
    const mine = sortedEigen(tritHuskSymbol(light, k).hermitian).values
    const theirs = e179HuskValues(k)

    gap = Math.max(gap, ...mine.map((v, i) => Math.abs(v - (theirs[i] ?? 0))))
    gaugeZeros += mine.filter(v => Math.abs(v) < 1e-12).length === 1 ? 1 : 0
    photonsBelow += (mine[2] ?? 0) < (mine[3] ?? 0) && (mine[1] ?? 0) > 1e-9 ? 1 : 0
  }

  let lambdaMax = 0

  for (let a = 0; a < 8; a++) {
    for (let b = 0; b < 8; b++) {
      for (let c = 0; c < 8; c++) {
        lambdaMax = Math.max(lambdaMax, sortedEigen(tritHuskSymbol(light, [a * tau, b * tau, c * tau]).hermitian).values[8] ?? 0)
      }
    }
  }

  return { sSymbolGap: gap, sGaugeZeroVectors: gaugeZeros, sPhotonVectors: photonsBelow, sVectors: vectors.length, sLambdaMax: lambdaMax }
}

function sectionW(form: TritForm, prefix: string): { metrics: Record<string, number>; ok: boolean } {
  const light = makeTritLight({ side: 8, depth: 16, form })
  const tau = (2 * Math.PI) / 8
  const out: Record<string, number> = { [`${prefix}Kappa`]: tritKappa(light) }

  let worst = 0
  let worstRaw = 0
  let wraps = 0
  let touched = 0

  for (const m of [
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
  ]) {
    for (const rank of [1, 2]) {
      const w = tritWave(light, m.map(x => x * tau), rank, 8, 400, 'trit')
      const name = `${prefix}_${m.join('')}_${rank}`

      out[`${name}_Relative`] = w.relative
      out[`${name}_RawRelative`] = w.rawRelative
      out[`${name}_MaxField`] = w.maxField
      out[`${name}_MaxPotential`] = w.maxPotential
      out[`${name}_FlipsPerBeat`] = w.flipsPerBeat
      out[`${name}_WriteReach`] = w.reach
      worst = Math.max(worst, Math.abs(w.relative))
      worstRaw = Math.max(worstRaw, Math.abs(w.rawRelative))
      wraps += w.potentialWraps
      touched += w.maxField >= light.nb / 2 ? 1 : 0
    }
  }

  out[`${prefix}WorstRelative`] = worst
  out[`${prefix}WorstRawRelative`] = worstRaw
  out[`${prefix}PotentialWraps`] = wraps
  out[`${prefix}SeamTouched`] = touched

  return { metrics: out, ok: worst < 1e-4 && wraps === 0 && touched === 0 }
}

function sectionP(): Record<string, number> {
  let exceptions = 0
  let cases = 0

  for (let m = 1; m <= 6; m++) {
    const entries = Int32Array.from({ length: m }, (_, i) => i)

    for (let v = -m; v <= m; v++) {
      for (let w = -m; w <= m; w++) {
        const trits = new Int8Array(m)

        writeColumn(trits, entries, undefined, 0, m, v)

        const r = writeColumn(trits, entries, undefined, 0, m, w)
        const reach = v === w ? 0 : Math.max(Math.abs(v), Math.abs(w))

        cases++
        exceptions += r.flips === Math.abs(w - v) && r.reach === reach && trits.reduce((a, b) => a + b, 0) === w ? 0 : 1
      }
    }
  }

  return { pCases: cases, pExceptions: exceptions }
}

// the non-additivity witness: the counter's force F(x) = the multiple of q nearest x, over x = n p B + R,
// split into two depth blocks x = x1 + x2: count the splits where F(x1 + x2) differs from F(x1) + F(x2)
function sectionL(): Record<string, number> {
  const q = 33
  const h = 16
  const f = (x: number): number => floorDiv(x + h, q)

  let splits = 0
  let differ = 0

  for (let x1 = -3 * q; x1 <= 3 * q; x1++) {
    for (let x2 = -3 * q; x2 <= 3 * q; x2++) {
      splits++
      differ += f(x1 + x2) === f(x1) + f(x2) ? 0 : 1
    }
  }

  return { lSplits: splits, lNonAdditiveSplits: differ, lIntegerLinearKappaLambdaMax: 16 }
}

export default experiment({
  id: 'gauge/trit-column-light',
  code: 'E-FRC-0207',
  title:
    "light held as column sums of trits: every bulk link and triangle of the D4 bulk holds trits, the husk's angle, flux and force counters are the sums of columns of them down the depth, and the husk integer leapfrog runs on them bit for bit, reversible, Gauss exact in bulk and husk, with coupling 2 / (2D + 1), the inverse depth",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const a = sectionA()
    const g = sectionG()
    const s = sectionS()
    const w = sectionW('wave', 'w')
    const w0 = sectionW('first', 'w0')
    const p = sectionP()
    const l = sectionL()
    const okA = ['first', 'wave'].every(f => a[`a_${f}_Mismatches`] === 0) && a['aWaveBoxMismatches'] === 0
    const okR = ['first', 'wave'].every(f => a[`a_${f}_BackMismatches`] === 0) && a['aWaveBoxBackMismatches'] === 0
    const okT = ['first', 'wave'].every(f => a[`a_${f}_OutOfRange`] === 0) && a['aWaveBoxOutOfRange'] === 0
    const okG = g['gBulkViolations'] === 0 && g['gHuskViolations'] === 0 && (g['gSheetControlViolations'] ?? 0) > 0
    const okS = (s['sSymbolGap'] ?? 1) < 1e-12 && s['sGaugeZeroVectors'] === s['sVectors'] && s['sPhotonVectors'] === s['sVectors']
    const okP = p['pExceptions'] === 0
    const gates = { A: okA, R: okR, T: okT, G: okG, S: okS, W: w.ok, P: okP }
    const metrics: Record<string, number> = { ...a, ...g, ...s, ...w.metrics, ...w0.metrics, ...p, ...l }

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok ? 1 : 0
    }

    const all = Object.values(gates).every(x => x)
    const core = okA && okR && okT && okG

    return verdict({
      status: all ? 'pass' : core ? 'partial' : 'fail',
      claim:
        "the husk's U(1) integers are column sums of bulk trits: a rule on trits only runs the husk integer leapfrog bit for bit, reversible, with Gauss's law exact in the bulk and on the husk, E-FRC-0179's husk symbol, and light within 1e-4 on both polarizations, at the price of reading whole columns",
      metrics,
      control: {
        firstFormWorstRelative: w0.metrics['w0WorstRelative'] ?? -1,
        sheetControlViolations: g['gSheetControlViolations'] ?? -1,
      },
      notes:
        "L2, exact integers, deterministic (golden and silver Weyl starts, no seeds). First run 2026-09-26 (tmp/frc0207.log, 102 s), PASS on every gate. A: 0 mismatches between the trit rule's column sums and the husk integer rule, both forms, 60 beats from the Weyl start (side 4, D 4) and 100 beats from a wave start (side 8, D 16). R: 0 trit mismatches after running back. T: 0 values outside -1 .. 1; 117 trits per bulk dock (1 vibe, 12 angle and 12 string per 12 links, 32 potentials, 60 counter trits: 20 husk triangles times 3 counters, D trits each, per column of D docks). G: 0 bulk and 0 husk Gauss violations over 201 readings of a static pair, against 4,998 for the one-sheet reading (depth level 0 only). S: the rule's husk operator has E-FRC-0179's husk eigenvalues within 3.4e-14 at 5 wave vectors, 1 gauge zero and 2 photons each, and lambda_max = 16 exactly (over the side-8 torus). W: on the trit rule (side 8, D 16, kappa 2/33, peak |B| 8, 400 beats) every wave reads the symbol within 8.1e-6 on the shadow (worst (1,1,0) first photon), within 2.1e-3 on the raw field, with 0 potential wraps, the field peaking at 18 to 20 against the seam at 32, the potential at 2 to 3 against its window of 16 or 32, 3.0e5 to 3.1e5 unit trit changes per beat (about 600 per husk dock) and the deepest trit written at position 16 to 19. P: 454 of 454 column moves change exactly |v' - v| units at depth max(|v|, |v'|). W0 CONTROL: the first form (E-FRC-0181's carried remainder) heats at this depth: 120,590 potential wraps, every wave at the seam, 174 percent off, because a D-deep column holds a field of only 2D = 32 in B, so a wave's flux is a few units and the one-unit white error is as large as the wave; the wave form (the error fed back through the leapfrog operator) is required, and with it the shadow is exact to the second counter's carry. HOW A KICK IS PAID: the counters take the drive n_P p B_P and each wrap of a counter (a cycling number in -D .. D mod 2D + 1, held as D trits in the thermometer code) pays one unit of force; a force of f moves the potential column's front by f, changing exactly |f| trits at depth |U|; the angle column's front moves by the flux each beat; a column that passes its window wraps (the angle's wrap is compact U(1), a potential wrap is counted and never happened). THE THEOREM (L): let a trit rule be depth-local with reach w and let its column sums evolve by a closed husk rule H. Put a husk state V1 in a depth block and V2 in another more than 2w away: the column sums change by the sum of what each block does alone, which closure makes H(V1) - V1 and H(V2) - V2, while closure on the whole makes it H(V1 + V2) - V1 - V2. So H - id is additive, hence integer-linear: the force is c B with c an integer, so kappa lambda_max = 16 c, unstable for every c other than 0, and c = 0 carries no light. The counter's floor is not additive (9,792 of 39,601 splits of the drive into two blocks disagree), nor is any wrap. So the rule MUST read whole columns: its read reach is D (every column is summed each beat), local on the husk and global along the depth. WHAT THIS ANSWERS: no integer register is stored anywhere (every stored value is a trit, and the husk integers are column sums), but the rule's neighborhood is a column, and that cannot be made depth-local. Flux is a relation (s - C^T u), no link stores it. Not done here: matter hops (a vibe crossing a link flips its string trit, refused when the trit is full), so charges are static; a hot start (the seam at 2D is far below the committed N / 2 = 4096).",
    })
  },
})
