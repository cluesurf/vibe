// The fear beat between two LOCKED tokens: a moving token's slot is its spinor doublet (E-SPN-0066), and that
// decides which meetings the fear beat can make. A STAND-IN on a husk line (code/rule/locked-token-line).
//
// E-SPN-0069 put the fear beat between two stand-in tokens whose slot and role were separate, and found it binds
// the diquark (role-antisymmetric loves) and the meson singlet Phi. With the lock there is no separate slot: the
// doublet vector e0 is copied forward, e1 back, and the line is not copied. So the role channels a meeting reads
// are tied to the directions the tokens move.
//
// THE ARGUMENT, before any number.
// (1) Two loves on one dock are identical fermions, so their (slot, role) state is antisymmetric, and with the
//     lock the slot IS the role: a like pair on one dock is always role-antisymmetric, and U = omega on it. Every
//     like contact gets the contact phase: the diquark channel is the only one two locked loves can meet in.
// (2) A love and a fear meet (the knit's meeting) when they sit on one dock in opposite slots, that is, moving
//     apart or together head-on. Under the primary convention 'C' (the fear runs the love's rule in its conjugate
//     coordinates) the love's forward vector v+ and the fear's backward vector conj(v-) give
//     <Phi | v+ (x) conj(v-)> = <v- | v+> / sqrt 3 = 0, for every axis the stream can copy along. So a head-on love
//     and fear are never in the meson singlet, V is the identity on every knit meeting, and the fear beat cannot
//     touch a locked love-fear pair at all. This is helicity suppression: the singlet of a spinor and an
//     antispinor needs opposite spin projections, and head-on locked tokens under 'C' carry the same one.
// (3) Under the other covariant sign 'Cprime' the head-on overlap is 1/sqrt 3, V is not closed on the opposite-slot
//     states, and a meeting has to read the whole dock ('dock'): then one meeting sends weight 1/3 of the head-on
//     pair onto the line pair o (x) conj(o), two bosons at rest (annihilation). Under 'C' with the whole dock read,
//     the same 1/3 goes from the CO-moving pair (one slot, which the knit's slot rule forbids a love and a fear).
//
// PREDICTIONS, written before this file ran (no probe of these numbers was run).
// P1 Algebra: on the 3 axes x 24 turns of covariant stream generators (72), the head-on love-fear overlap with Phi
//    is 0 under 'C' (below 1e-12) and |.|^2 = 1/3 under 'Cprime' (1e-12); the like opposite-slot antisymmetric
//    pair is an eigenvector of U with omega; on the knit's opposite-slot love-fear states under 'C', 3V is 3 times
//    the identity exactly (Eisenstein integers).
// P2 The rule is exact: for the like pair, the 'C' knit love-fear pair and both 'dock' variants, the Eisenstein
//    run equals the float run (ring 6, 12 beats) to 1e-12, the numerator norms sum to D^2 exactly and the exact
//    inverse returns the start.
// P3 The locked like pair's exchange-antisymmetric bound states (ring 48, every K, quasi-energy in (-2 pi/3, 0),
//    0.05 from the continuum, 0.99 within 4 docks) are exactly E-SPN-0069's antisymmetric bound states of the
//    phase-omega walk: same count at every K and energies within 1e-9, with at least one K bound; with no meeting,
//    none.
// P4 The fermion number is kept: a like pair and a 'C' knit love-fear pair never put weight on the line (0 over
//    256 beats on a ring of 64), so N = 2 and N = 0 on every state.
// P5 Annihilation under 'dock': one meeting of the head-on pair ('Cprime') and of the co-moving pair ('C') puts
//    exactly 1/3 of the weight on the line pair (Eisenstein integers).
// P6 Start ensemble: with each of the 17 members' links on a ring of 24, read in the tokens' frames, the like pair
//    and both love-fear 'C' pairs have the no-field positions for 10 beats (before any token crosses the ring's
//    last link) to 1e-12.
//
// Gates, fixed with the predictions: H1 = P1, H2 = P2, H3 = P3, H4 = P4, H5 = P5, H6 = P6. Status pass if all hold.
// REPORTED, not gated: the long-time compact chance of the 'dock' variants against no meeting.
//
// HUSK: the line is a husk line and every number is a husk number; no bulk reading exists for this stand-in.
//
// Depth L2: a constructed stand-in (the quantum-walk molecule is known), with the channel algebra exact (L1).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lockedIndex, lockedMeetingOnly, lockedNormSum, lockedPairBeat, lockedPairBeatBack, lockedPairState, stepTable, streamPermutation, type Convention, type LockedPairOptions, type UnlikeMeeting, type Vibe } from '@/code/rule/locked-token-line'
import { antisymmetrized, lockedRun, type LockedStart } from '@/code/measure/locked-run'
import { lockedRelativeSpectrum } from '@/code/measure/locked-relative'
import { DOUBLET_BASIS } from '@/code/measure/locked-cluster'
import { OMEGA, continuumDistance, relativeSpectrum } from '@/code/measure/contact-bound'
import { spinTurns } from '@/code/algebra/role-cluster'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'
import { type M3 } from '@/code/measure/token-pair-run'

type Complex = [number, number]

const EXACT_RING = 6
const EXACT_BEATS = 12
const SPECTRUM_RING = 48
const NEAR = 4
const LONG_RING = 64
const GAUGE_RING = 24
const GAUGE_BEATS = 10

const cm = (a: Complex, b: Complex): Complex => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cconj = (a: Complex): Complex => [a[0], -a[1]]

function unitaryOf(k: number): M3 {
  const g = cliffordTable().group[k]!
  const vals = g.num.map(x => eisValue(x, 3 ** g.den3))
  let n2 = 0

  for (let c = 0; c < 3; c++) n2 += (vals[3 * c]![0] ?? 0) ** 2 + (vals[3 * c]![1] ?? 0) ** 2

  const f = 1 / Math.sqrt(n2)

  return { re: Float64Array.from(vals, v => v[0] * f), im: Float64Array.from(vals, v => v[1] * f) }
}

// P1: the covariant generators Gamma = U (sigma_a on the doublet) U^+ in the role basis, and their +-1 eigenvectors
function headOnOverlaps(): { worstC: number; worstCprime: number; count: number } {
  const e0: Complex[] = DOUBLET_BASIS[0]!.map(x => [x, 0] as Complex)
  const e1: Complex[] = DOUBLET_BASIS[1]!.map(x => [x, 0] as Complex)
  // sigma_a's +1 and -1 eigenvectors in the doublet, as role vectors
  // a e0 + b e1 (e0 and e1 are real)
  const combine = (a: Complex, b: Complex): Complex[] => e0.map((x, i) => [a[0] * x[0] + b[0] * (e1[i] as Complex)[0], a[1] * x[0] + b[1] * (e1[i] as Complex)[0]] as Complex)
  const h = Math.SQRT1_2
  const axes: [Complex[], Complex[]][] = [
    [combine([1, 0], [0, 0]), combine([0, 0], [1, 0])],
    [combine([h, 0], [h, 0]), combine([h, 0], [-h, 0])],
    [combine([h, 0], [0, h]), combine([h, 0], [0, -h])],
  ]
  const { turns } = spinTurns()
  const apply = (u: { re: Float64Array; im: Float64Array }, v: Complex[]): Complex[] =>
    [0, 1, 2].map(i => {
      let s: Complex = [0, 0]

      for (let k = 0; k < 3; k++) s = [s[0] + (cm([u.re[3 * i + k] as number, u.im[3 * i + k] as number], v[k] as Complex))[0], s[1] + cm([u.re[3 * i + k] as number, u.im[3 * i + k] as number], v[k] as Complex)[1]]

      return s
    })
  // <Phi | a (x) conj(b)> = sum_k a_k conj(b_k) / sqrt 3
  const overlap = (a: Complex[], bConj: Complex[]): number => {
    let s: Complex = [0, 0]

    for (let k = 0; k < 3; k++) s = [s[0] + cm(a[k] as Complex, bConj[k] as Complex)[0], s[1] + cm(a[k] as Complex, bConj[k] as Complex)[1]]

    return (s[0] ** 2 + s[1] ** 2) / 3
  }
  let worstC = 0
  let worstCprime = 0
  let count = 0

  for (const t of turns) {
    for (const [plus, minus] of axes) {
      const vp = apply(t.unitary, plus)
      const vm = apply(t.unitary, minus)
      // C: fear forward conj(v+), back conj(v-); head-on = (love v+, fear conj(v-)) and (love v-, fear conj(v+))
      worstC = Math.max(worstC, overlap(vp, vm.map(cconj)), overlap(vm, vp.map(cconj)))
      // Cprime: fear forward conj(v-), back conj(v+); head-on = (love v+, fear conj(v+)) and (love v-, fear conj(v-))
      worstCprime = Math.max(worstCprime, Math.abs(overlap(vp, vp.map(cconj)) - 1 / 3), Math.abs(overlap(vm, vm.map(cconj)) - 1 / 3))
      count++
    }
  }

  return { worstC, worstCprime, count }
}

type Config = { name: string; kinds: [Vibe, Vibe]; convention: Convention; unlike: UnlikeMeeting }

const CONFIGS: readonly Config[] = [
  { name: 'like', kinds: ['love', 'love'], convention: 'C', unlike: 'dock' },
  { name: 'loveFearKnitC', kinds: ['love', 'fear'], convention: 'C', unlike: 'knit' },
  { name: 'loveFearDockC', kinds: ['love', 'fear'], convention: 'C', unlike: 'dock' },
  { name: 'loveFearDockCprime', kinds: ['love', 'fear'], convention: 'Cprime', unlike: 'dock' },
]

export default experiment({
  id: 'spin/locked-pair-channels',
  code: 'E-SPN-0072',
  title: 'the fear beat between two locked tokens, a STAND-IN, fail on one knife-edge momentum: with the slot the spinor doublet, two loves on one dock are always role-antisymmetric and always meet with omega (the diquark, bound exactly as E-SPN-0069\'s antisymmetric pair), while a head-on love and fear are never in the meson singlet (overlap 0 on every covariant axis, helicity suppression), so the knit\'s love-fear meeting is the identity and a locked fear is free; reading the whole dock instead, one meeting annihilates 1/3 of the pair onto the line',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- H1 ----
    const overlaps = headOnOverlaps()
    const likeContact = (() => {
      // U on (|01> - |10>) / sqrt 2 in the locked basis: (U v)_01 = (1+w)/2 v01 + (1-w)/2 v10
      const v01: Complex = [Math.SQRT1_2, 0]
      const v10: Complex = [-Math.SQRT1_2, 0]
      const a: Complex = [(1 + OMEGA[0]) / 2, OMEGA[1] / 2]
      const b: Complex = [(1 - OMEGA[0]) / 2, -OMEGA[1] / 2]
      const u01 = [cm(a, v01)[0] + cm(b, v10)[0], cm(a, v01)[1] + cm(b, v10)[1]]
      const want = cm(OMEGA, v01)

      return Math.hypot((u01[0] as number) - want[0], (u01[1] as number) - want[1])
    })()
    // the knit's love-fear states (one dock, the two tokens copied in opposite directions), and the exact rule's
    // whole-dock meeting 3V on each: under C it must return 3 times the state, under Cprime it must not
    const knitStates = (convention: Convention): [number, number][] => {
      const s1 = stepTable('love', convention)
      const s2 = stepTable('fear', convention)
      const out: [number, number][] = []

      for (let j1 = 0; j1 < 2; j1++) for (let j2 = 0; j2 < 2; j2++) if ((s1[j1] as number) === -(s2[j2] as number)) out.push([j1, j2])

      return out
    }
    const meetsAsIdentity = (convention: Convention): boolean[] =>
      knitStates(convention).map(([j1, j2]) => {
        const opts: LockedPairOptions = { ring: 1, kinds: ['love', 'fear'], convention, unlike: 'dock' }
        const s = lockedPairState(opts, [{ index: lockedIndex(1, 0, 0, j1, j2), a: 1n, b: 0n }])

        lockedMeetingOnly(s)

        return s.a.every((x, i) => (i === 3 * j1 + j2 ? x === 3n : x === 0n)) && s.b.every(x => x === 0n)
      })
    const knitC = meetsAsIdentity('C')
    const knitCprime = meetsAsIdentity('Cprime')
    const knitExact = knitC.length === 2 && knitC.every(x => x) && knitCprime.length === 2 && knitCprime.every(x => !x)
    const h1 = overlaps.worstC < 1e-12 && overlaps.worstCprime < 1e-12 && likeContact < 1e-12 && knitExact

    log('h1')

    // ---- H2: exact against float ----
    const exact = CONFIGS.map(c => {
      const opts: LockedPairOptions = { ring: EXACT_RING, kinds: c.kinds, convention: c.convention, unlike: c.unlike }
      const at = lockedIndex(EXACT_RING, 2, 2, 0, 1)
      const s = lockedPairState(opts, [{ index: at, a: 1n, b: 0n }])
      const map = streamPermutation(opts)
      const fl = lockedRun({ ring: EXACT_RING, kinds: c.kinds, convention: c.convention, unlike: c.unlike, start: [{ x: [2, 2], j: [0, 1], amp: [1, 0] }] })
      let worst = 0

      for (let t = 0; t < EXACT_BEATS; t++) {
        lockedPairBeat(s, map)
        fl.beat()

        const d = Number(s.denominator)

        for (let i = 0; i < s.a.length; i++) {
          const v = eisValue([Number(s.a[i]), Number(s.b[i])], d)

          worst = Math.max(worst, Math.hypot(v[0] - (fl.re[i] as number), v[1] - (fl.im[i] as number)))
        }
      }

      const normIdentity = lockedNormSum(s) === s.denominator * s.denominator
      const forward = s.denominator

      for (let t = 0; t < EXACT_BEATS; t++) lockedPairBeatBack(s, map)

      const reverses = s.a.every((x, i) => (i === at ? x === forward * forward : x === 0n)) && s.b.every(x => x === 0n)

      return { name: c.name, worst, normIdentity, reverses, bits: forward.toString(2).length }
    })
    const h2 = exact.every(e => e.worst < 1e-12 && e.normIdentity && e.reverses)

    log('h2')

    // ---- H3: the locked like pair's spectrum against E-SPN-0069's antisymmetric bound states ----
    const inGap = (e: number): boolean => e > (-2 * Math.PI) / 3 && e < 0
    const perK = Array.from({ length: SPECTRUM_RING }, (_, s) => {
      const K = (2 * Math.PI * s) / SPECTRUM_RING
      const bound = (list: { energy: number; nearWeight: number; parity: number }[]): number[] =>
        list
          .filter(x => x.parity < -0.99 && x.nearWeight >= 0.99 && continuumDistance({ momentum: K, energy: x.energy }) > 0.05)
          .map(x => x.energy)
          .sort((a, b) => a - b)
      const locked = bound(lockedRelativeSpectrum({ ring: SPECTRUM_RING, momentum: K, meet: true, near: NEAR, keep: inGap }))
      const reference = bound(relativeSpectrum({ ring: SPECTRUM_RING, momentum: K, phase: OMEGA, near: NEAR, keep: inGap }).map(x => ({ energy: x.energy, nearWeight: x.nearWeight, parity: x.symmetric })))
      const free = bound(lockedRelativeSpectrum({ ring: SPECTRUM_RING, momentum: K, meet: false, near: NEAR, keep: inGap }))

      return { K, locked, reference, free }
    })
    const energyGap = Math.max(0, ...perK.flatMap(k => k.locked.map((e, i) => Math.abs(e - (k.reference[i] ?? Number.NaN)))))
    const countsMatch = perK.every(k => k.locked.length === k.reference.length)
    const h3 = countsMatch && Number.isFinite(energyGap) && energyGap < 1e-9 && perK.some(k => k.locked.length > 0) && perK.every(k => k.free.length === 0)
    // REPORTED, added after the first run (not gated): the energy agreement where the counts agree, and the
    // momenta where they do not, with the states found there
    const matchedGap = Math.max(0, ...perK.filter(k => k.locked.length === k.reference.length).flatMap(k => k.locked.map((e, i) => Math.abs(e - (k.reference[i] as number)))))
    const mismatched = perK.filter(k => k.locked.length !== k.reference.length).map(k => `K ${k.K.toFixed(4)}: locked ${k.locked.map(e => e.toExponential(2)).join(' ')} | reference ${k.reference.map(e => e.toExponential(2)).join(' ')}`)
    const bindingK0 = perK[0]!.locked.length > 0 ? -Math.max(...perK[0]!.locked) : Number.NaN
    const boundMomenta = perK.filter(k => k.locked.length > 0).length

    log('h3')

    // ---- H4, and the reported long runs ----
    const likeStart = antisymmetrized({ x: [LONG_RING / 2, LONG_RING / 2], j: [0, 1] })
    const loveFearStarts: { name: string; start: LockedStart[] }[] = [
      { name: 'f,b', start: [{ x: [LONG_RING / 2, LONG_RING / 2], j: [0, 1], amp: [1, 0] }] },
      { name: 'b,f', start: [{ x: [LONG_RING / 2, LONG_RING / 2], j: [1, 0], amp: [1, 0] }] },
      { name: 'f,f', start: [{ x: [LONG_RING / 2, LONG_RING / 2], j: [0, 0], amp: [1, 0] }] },
      { name: 'b,b', start: [{ x: [LONG_RING / 2, LONG_RING / 2], j: [1, 1], amp: [1, 0] }] },
    ]
    const longRun = (c: Config, start: LockedStart[], meet: boolean): { mean: number; line: number } => {
      const run = lockedRun({ ring: LONG_RING, kinds: c.kinds, convention: c.convention, unlike: c.unlike, meet, start })
      const T = 4 * LONG_RING
      let sum = 0
      let n = 0
      let line = 0

      for (let t = 0; t < T; t++) {
        run.beat()
        line = Math.max(line, run.lineWeight())

        if (t >= T / 2) {
          sum += run.compactWeight(NEAR)
          n++
        }
      }

      return { mean: sum / n, line }
    }
    const like = longRun(CONFIGS[0]!, likeStart, true)
    const likeFree = longRun(CONFIGS[0]!, likeStart, false)
    const knit = loveFearStarts.map(s => ({ name: s.name, ...longRun(CONFIGS[1]!, s.start, true) }))
    const h4 = like.line === 0 && knit.every(k => k.line === 0)

    log('h4')

    const variants = [CONFIGS[2]!, CONFIGS[3]!].map(c => ({
      name: c.name,
      starts: loveFearStarts.map(s => ({ name: s.name, on: longRun(c, s.start, true), off: longRun(c, s.start, false) })),
    }))

    log('variants')

    // ---- H5: one meeting's annihilation weight, exact ----
    const annihilation = ([['loveFearDockCprime', 0, 0] as const, ['loveFearDockC', 0, 0] as const]).map(([name, j1, j2]) => {
      const c = CONFIGS.find(x => x.name === name)!
      // the 3V formula on |j1 j2>: the |22> coefficient is (w - 1) when j1 = j2, over a denominator 3
      const onLine: [bigint, bigint] = j1 === j2 ? [-1n, 1n] : [0n, 0n]
      const norm = onLine[0] * onLine[0] - onLine[0] * onLine[1] + onLine[1] * onLine[1]
      // which head-on or co-moving pair |00> is: under Cprime label 0 of the fear is backward (head-on), under C
      // forward (co-moving)
      const fearForward = c.convention === 'C' ? 0 : 1

      return { name, weightNumerator: norm, weightDenominator: 9n, pair: j2 === fearForward ? 'co-moving' : 'head-on' }
    })
    // and the same read off the exact rule: one beat's meeting piece is the only piece that reaches the line from
    // a start with no line weight, and the coin and stream keep the line weight, so the line weight after one beat
    const annihilationRule = ([['loveFearDockCprime'], ['loveFearDockC']] as const).map(([name]) => {
      const c = CONFIGS.find(x => x.name === name)!
      const opts: LockedPairOptions = { ring: EXACT_RING, kinds: c.kinds, convention: c.convention, unlike: c.unlike }
      const s = lockedPairState(opts, [{ index: lockedIndex(EXACT_RING, 2, 2, 0, 0), a: 1n, b: 0n }])

      lockedPairBeat(s, streamPermutation(opts))

      let line = 0n

      for (let i = 0; i < s.a.length; i++) {
        const r = i % 9

        if (r === 8) line += (s.a[i] as bigint) * (s.a[i] as bigint) - (s.a[i] as bigint) * (s.b[i] as bigint) + (s.b[i] as bigint) * (s.b[i] as bigint)
      }

      // weight = line / D^2; D = 12, and the coin's 2 on the line keeps its weight: 3/9 of D^2 = 48
      return { name, line, denominator2: s.denominator * s.denominator }
    })
    const h5 = annihilation.every(a => a.weightNumerator * 3n === a.weightDenominator) && annihilationRule.every(a => a.line * 3n === a.denominator2)

    log('h5')

    // ---- H6: the start ensemble ----
    const moves = gridMoves()
    const table = cliffordTable()
    const unitaries = Array.from({ length: 216 }, (_, k) => unitaryOf(k))
    const x0 = GAUGE_RING / 2
    const ensemble = startFamily(16).map(member => {
      const links = Array.from({ length: GAUGE_RING }, (_, x) => unitaries[table.indexOf(phaseMove(moves.act[member.start(x, moves.act.length)] ?? []))] as M3)
      let gap = 0

      for (const [c, start] of [
        [CONFIGS[0]!, antisymmetrized({ x: [x0, x0], j: [0, 1] })],
        [CONFIGS[1]!, [{ x: [x0, x0], j: [0, 1], amp: [1, 0] as Complex }]],
        [CONFIGS[2]!, [{ x: [x0, x0], j: [0, 0], amp: [1, 0] as Complex }]],
      ] as const) {
        const field = lockedRun({ ring: GAUGE_RING, kinds: c.kinds, convention: c.convention, unlike: c.unlike, links, start })
        const plain = lockedRun({ ring: GAUGE_RING, kinds: c.kinds, convention: c.convention, unlike: c.unlike, start })

        for (let t = 0; t < GAUGE_BEATS; t++) {
          field.beat()
          plain.beat()

          const a = field.positions()
          const b = plain.positions()

          gap = Math.max(gap, ...a.map((x, i) => Math.abs(x - (b[i] as number))))
        }
      }

      return { member: member.name, gap }
    })
    const h6 = ensemble.every(e => e.gap < 1e-12)

    log('h6')

    const ok = h1 && h2 && h3 && h4 && h5 && h6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `on ${overlaps.count} covariant stream axes a head-on locked love and fear overlap the meson singlet Phi by at most ${overlaps.worstC.toExponential(1)} under the primary convention and by exactly 1/3 under the other sign (gap ${overlaps.worstCprime.toExponential(1)}), and two locked loves on one dock always meet with omega; the rule is exact in Eisenstein integers for the like pair and three love-fear readings (float gap ${Math.max(...exact.map(e => e.worst)).toExponential(1)}, norm identity and exact reversal); the locked like pair's bound states are E-SPN-0069's antisymmetric ones exactly (energies within ${energyGap.toExponential(1)}, bound at ${boundMomenta} of ${SPECTRUM_RING} momenta, binding ${bindingK0.toFixed(4)} per beat at K = 0, none with no meeting), and it stays within 4 docks with chance ${like.mean.toFixed(3)} against ${likeFree.mean.toFixed(3)} with no meeting; under the knit's meeting a locked love and fear never meet (every head-on state orthogonal to Phi) and never reach the line, so the fear is free (compact ${knit.map(k => `${k.name} ${k.mean.toFixed(3)}`).join(', ')}); reading the whole dock instead, one meeting puts exactly 1/3 of the head-on ('Cprime') or co-moving ('C') pair on the line pair; over the 17 link starts the positions are the no-field ones before any token wraps (worst ${Math.max(...ensemble.map(e => e.gap)).toExponential(1)})`,
      metrics: {
        gate_H1: h1 ? 1 : 0,
        gate_H2: h2 ? 1 : 0,
        gate_H3: h3 ? 1 : 0,
        gate_H4: h4 ? 1 : 0,
        gate_H5: h5 ? 1 : 0,
        gate_H6: h6 ? 1 : 0,
        headOnSingletOverlapC: overlaps.worstC,
        headOnSingletOverlapCprimeGap: overlaps.worstCprime,
        likeContactGap: likeContact,
        ...Object.fromEntries(exact.flatMap(e => [[`exactFloatGap_${e.name}`, e.worst], [`exactDenominatorBits_${e.name}`, e.bits]])),
        spectrumEnergyGap: energyGap,
        spectrumEnergyGapWhereCountsAgree: matchedGap,
        spectrumMismatchedMomenta: mismatched.length,
        boundMomenta,
        bindingLikeK0: bindingK0,
        likeCompact: like.mean,
        likeLineWeight: like.line,
        ...Object.fromEntries(knit.flatMap(k => [[`knitC_${k.name}_compact`, k.mean], [`knitC_${k.name}_line`, k.line]])),
        ...Object.fromEntries(variants.flatMap(v => v.starts.flatMap(s => [[`${v.name}_${s.name}_compact`, s.on.mean], [`${v.name}_${s.name}_compactNoMeeting`, s.off.mean], [`${v.name}_${s.name}_lineMax`, s.on.line]]))),
        ...Object.fromEntries(annihilationRule.map(a => [`annihilationWeight_${a.name}`, Number(a.line) / Number(a.denominator2)])),
        ensembleWorstGap: Math.max(...ensemble.map(e => e.gap)),
        ensembleMembers: ensemble.length,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        likeCompactNoMeeting: likeFree.mean,
        uniformNear: (2 * NEAR + 1) / LONG_RING,
      },
      notes: `L2, a STAND-IN: a token whose slot is its spinor doublet on one husk line, not the knit's own tokens. Gates H1 ${h1}, H2 ${h2}, H3 ${h3}, H4 ${h4}, H5 ${h5}, H6 ${h6}. FIRST RUN (49 s), recorded as is: fail on H3 alone. At one momentum of 48, K = 2 pi/3 exactly, the locked walk kept a state at quasi-energy -0.00000 and the reference walk none: the bound band meets the particle-pair threshold E = 0 at |K| = 2 pi/3 (E-SPN-0069's band edge), and the same eigenvalue, rounding to either side of 0, falls on either side of the gate's E < 0 filter. The two walks are the same matrix on the antisymmetric sector, so this is a knife edge in the filter, not a disagreement of the constructions; the gate is not moved. Added after the first run, reported and not gated: the energy gap where the counts agree (${matchedGap.toExponential(1)}) and the mismatched momenta (${mismatched.join('; ') || 'none'}). An earlier attempt crashed before any verdict (a bigint written with a number literal), and between the attempts the float runner's knit meeting was changed from omitted to built (Pi V Pi + 1 - Pi, refused unless V keeps the opposite-slot pairs), so the runner now tests the algebra rather than assuming it; no number had been seen. Variants: the compact chance of the 'dock' readings includes the line pair, which rests where it was made, so their excess over no meeting is partly annihilation into a resting pair and is not read as binding. Bound energies per K (locked | reference): ${perK.filter(k => k.locked.length + k.reference.length > 0).map(k => `${k.K.toFixed(3)}: ${k.locked.map(e => e.toFixed(5)).join(' ')} | ${k.reference.map(e => e.toFixed(5)).join(' ')}`).join('; ')}. Variants (compact with meeting / without / largest line weight): ${variants.map(v => `${v.name}: ${v.starts.map(s => `${s.name} ${s.on.mean.toFixed(3)} / ${s.off.mean.toFixed(3)} / ${s.on.line.toFixed(3)}`).join(', ')}`).join('; ')}. Annihilation pairs: ${annihilation.map(a => `${a.name} |00> is ${a.pair}`).join(', ')}. Ensemble gaps: ${ensemble.map(e => `${e.member} ${e.gap.toExponential(1)}`).join(', ')}. The like meeting is applied as U on all nine role pairs ('dock'); on the antisymmetric states two identical fermions hold on one dock it is the knit's opposite-slot meeting exactly, since the only antisymmetric doublet pair is one token in each slot. MEANING: the lock ties the channel a meeting reads to the directions the tokens move. Two loves can only meet as the diquark (spin singlet, antirole), and they bind there exactly as before. A love and a fear can only meet head-on, and head-on they carry the same spin projection under the primary convention, so they are never in the meson singlet: the fear beat's love-fear meeting is the identity on every locked pair. That is E-SPN-0070's finding (the fear beat cannot see the fear of (4, 1)'s natural doublet) seen from the moving side, and it is the known helicity suppression of a singlet channel for chiral pairs. The other covariant sign, or a meeting that reads the whole dock, lets the fear beat act, and then it annihilates the pair onto the line (two bosons at rest) with weight 1/3 per meeting rather than binding it.`,
    })
  },
})
