// The one route left: a string that reads the love-fear pair outside Phi through the flux, tried as an integer rule
// on LOCKED STAND-IN tokens on a husk line (code/rule/locked-token-line, code/measure/locked-run).
//
// E-SPN-0072 found the fear beat never meets a locked love and fear (every head-on pair is orthogonal to Phi), and
// E-SPN-0073 that it holds three locked loves only as a diquark and a free love. So nothing the fear beat does binds
// a charge-one state. The flux does not read the role at all: between a love and a fear every link carries one unit
// of center flux (E-FRC-0129, 0144), in every role channel. The question is whether the flux's cost can be written
// as a rule in integers that binds. Two ways to charge for the string:
//   the PAID string (E-FRC-0133's bounce): a store of S units pays one unit per link of string; a joint copy that
//     would lengthen the string past what the store holds is not made, both tokens stay and their slots flip.
//     With store + length conserved, the store is S - span, a count, and the rule is a permutation of the allowed
//     configurations: integer, reversible, role-blind
//   the PHASE string: the string's energy as a phase, omega per unit of flux per beat, omega^span; integer too, in
//     Z[omega], and role-blind
//
// THE ARGUMENT, before any number. A phase is defined only mod 2 pi, so omega^span is periodic in the span with
// period 3: far apart the pair sees a period-3 superlattice with bands, not a rising potential, and the relative
// coordinate spreads. A discrete-time walk cannot confine with a phase; it confines only with a COUNT, a store that
// runs out. The paid string confines by construction (the relative coordinate never exceeds S, so every relative
// state is bound), and since it reads positions only, it binds the love-fear pair in every role channel, including
// the ones the fear beat cannot see, and three loves as three. The pair's center still moves: its relative motion
// is bound and its total momentum free, so a walled pair travels ballistically, where E-FRC-0133's classical bounce
// left the bound pair stuck.
//
// PREDICTIONS, written before this file ran (no probe of these numbers was run).
// P1 Integer rule: the walled stream is a permutation of the allowed configurations (pair: ring 16, S 4; three
//    loves: ring 12, S 3; every allowed configuration has exactly one preimage and every image is allowed); the
//    Eisenstein run of a walled love-fear pair (ring 10, S 3, 12 beats) equals the float run to 1e-12, its numerator
//    norms sum to D^2, its exact inverse returns the start, and its weight beyond span S is exactly 0 at every beat.
// P2 Confinement in every channel: a walled love-fear pair (S 4, the knit's meeting, so the fear beat is inert) from
//    each of the four contact starts stays within span 4 with chance 1 (1e-12) at every beat on rings 16, 32, 64;
//    with no wall the fit a + b / L of the late compact chance (rings 16, 24, 32) gives a < 0.1.
// P3 The bound pair moves: on a ring of 64 the spread of the pair's center grows ballistically, sigma(24) /
//    sigma(12) at least 1.7.
// P4 The phase string does not confine: omega^span with no wall, the same fit gives a < 0.9 (the paid string gives
//    1).
// P5 Charge one: three locked loves with a span wall of 3 (ring 16, 64 beats, an antisymmetric start) keep weight 0
//    beyond span 3 and on the line at every beat, so the state stays bound with N = 3 and 2 pi sign -1 exactly.
// P6 Start ensemble: with each of the 17 members' links, the walled pair (ring 24, 10 beats) and the walled three
//    loves (ring 12, 5 beats) have the no-field positions to 1e-12.
//
// Gates, fixed with the predictions: S1 = P1, S2 = P2, S3 = P3, S4 = P4, S5 = P5, S6 = P6. Status pass if all hold.
// REPORTED, not gated: the phase string's fitted a, the spin-3/2 share of the walled three-love state.
//
// HUSK: one husk line; every number is a husk number. The store as a column of D bulk trits holds 2D + 1 levels,
// so the range S is set by the depth: stated, not run here.
//
// Depth L2: a constructed stand-in; confinement by a hard wall is known physics, and the claim is only that the
// model's string can be written this way in integers and that a phase cannot do it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lockedIndex, lockedNormSum, lockedPairBeat, lockedPairBeatBack, lockedPairState, ringDistance, streamPermutation, type LockedPairOptions } from '@/code/rule/locked-token-line'
import { antisymmetrized, lockedRun, spanOf, type LockedStart } from '@/code/measure/locked-run'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'
import { type M3 } from '@/code/measure/token-pair-run'

type Complex = [number, number]

const WALL = 4
const NEAR = 4
const SIZES = [16, 24, 32] as const

function unitaryOf(k: number): M3 {
  const g = cliffordTable().group[k]!
  const vals = g.num.map(x => eisValue(x, 3 ** g.den3))
  let n2 = 0

  for (let c = 0; c < 3; c++) n2 += (vals[3 * c]![0] ?? 0) ** 2 + (vals[3 * c]![1] ?? 0) ** 2

  const f = 1 / Math.sqrt(n2)

  return { re: Float64Array.from(vals, v => v[0] * f), im: Float64Array.from(vals, v => v[1] * f) }
}

// the three-token walled stream on labels, as a map from allowed configurations: returns whether it permutes them
function tripleWallIsPermutation(L: number, S: number): { allowed: number; ok: boolean } {
  const steps = [1, -1, 0]
  const flip = [1, 0, 2]
  const code = (x: number[], j: number[]): number => ((((x[0] as number) * L + (x[1] as number)) * L + (x[2] as number)) * 27) + 9 * (j[0] as number) + 3 * (j[1] as number) + (j[2] as number)
  const hits = new Map<number, number>()
  let allowed = 0
  let ok = true

  for (let x1 = 0; x1 < L; x1++) {
    for (let x2 = 0; x2 < L; x2++) {
      for (let x3 = 0; x3 < L; x3++) {
        const x = [x1, x2, x3]

        if (spanOf(L, x) > S) continue

        for (let r = 0; r < 27; r++) {
          const j = [Math.floor(r / 9), Math.floor(r / 3) % 3, r % 3]
          const y = x.map((v, t) => (((v + (steps[j[t] as number] as number)) % L) + L) % L)
          const blocked = spanOf(L, y) > S
          const target = blocked ? code(x, j.map(v => flip[v] as number)) : code(y, j)
          const ty = blocked ? x : y

          allowed++
          ok = ok && spanOf(L, ty) <= S
          hits.set(target, (hits.get(target) ?? 0) + 1)
        }
      }
    }
  }

  return { allowed, ok: ok && hits.size === allowed && [...hits.values()].every(v => v === 1) }
}

const CONTACT: readonly { name: string; j: [number, number] }[] = [
  { name: 'f,b', j: [0, 1] },
  { name: 'b,f', j: [1, 0] },
  { name: 'f,f', j: [0, 0] },
  { name: 'b,b', j: [1, 1] },
]

// the late compact chance (span <= NEAR) averaged over beats 2L to 4L
function lateCompact(input: { ring: number; wall?: number; phaseString?: boolean; j: [number, number] }): number {
  const x0 = Math.floor(input.ring / 2)
  const run = lockedRun({ ring: input.ring, kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', wall: input.wall, phaseString: input.phaseString, start: [{ x: [x0, x0], j: input.j, amp: [1, 0] }] })
  const T = 4 * input.ring
  let sum = 0
  let n = 0

  for (let t = 0; t < T; t++) {
    run.beat()

    if (t >= T / 2) {
      sum += run.compactWeight(NEAR)
      n++
    }
  }

  return sum / n
}

function fit(values: readonly number[]): { a: number; b: number; check: number } {
  const [v16, v24, v32] = values as [number, number, number]
  const b = (v24 - v32) / (1 / 24 - 1 / 32)
  const a = v32 - b / 32

  return { a, b, check: a + b / 16 - v16 }
}

export default experiment({
  id: 'spin/paid-string-binding',
  code: 'E-SPN-0074',
  title: 'a string that reads the love-fear pair through the flux, a STAND-IN on locked tokens: paid from a store (a joint copy past what the store holds bounces), it is an integer, reversible, role-blind rule that binds the love-fear pair in every channel the fear beat cannot see and three loves as three, and the bound pair still travels ballistically; charged as a phase omega^span instead it cannot confine (about a third of the weight escapes, a = 0.64), because a phase is periodic in the length: in discrete time only a count confines',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- S1 ----
    const pairOpts: LockedPairOptions = { ring: 16, kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', wall: WALL }
    const pairMap = streamPermutation(pairOpts)
    const pairPermutation = (() => {
      const L = pairOpts.ring
      const allowedIndex = (i: number): boolean => {
        const x1 = Math.floor(i / (9 * L))
        const x2 = Math.floor(i / 9) % L

        return ringDistance(L, x1, x2) <= WALL
      }
      const hits = new Map<number, number>()
      let allowed = 0
      let ok = true

      for (let i = 0; i < pairMap.length; i++) {
        if (!allowedIndex(i)) continue

        allowed++

        const j = pairMap[i] as number

        ok = ok && allowedIndex(j)
        hits.set(j, (hits.get(j) ?? 0) + 1)
      }

      return { allowed, ok: ok && hits.size === allowed && [...hits.values()].every(v => v === 1) }
    })()
    const triplePermutation = tripleWallIsPermutation(12, 3)
    const exactRing = 10
    const exactWall = 3
    const exactOpts: LockedPairOptions = { ring: exactRing, kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', wall: exactWall }
    const exactMap = streamPermutation(exactOpts)
    const at = lockedIndex(exactRing, 5, 5, 0, 1)
    const ex = lockedPairState(exactOpts, [{ index: at, a: 1n, b: 0n }])
    const fl = lockedRun({ ring: exactRing, kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', wall: exactWall, start: [{ x: [5, 5], j: [0, 1], amp: [1, 0] }] })
    let exactGap = 0
    let beyondExact = true

    for (let t = 0; t < 12; t++) {
      lockedPairBeat(ex, exactMap)
      fl.beat()

      const d = Number(ex.denominator)

      for (let i = 0; i < ex.a.length; i++) {
        const v = eisValue([Number(ex.a[i]), Number(ex.b[i])], d)
        const x1 = Math.floor(i / (9 * exactRing))
        const x2 = Math.floor(i / 9) % exactRing

        exactGap = Math.max(exactGap, Math.hypot(v[0] - (fl.re[i] as number), v[1] - (fl.im[i] as number)))

        if (ringDistance(exactRing, x1, x2) > exactWall && (ex.a[i] !== 0n || ex.b[i] !== 0n)) beyondExact = false
      }
    }

    const normIdentity = lockedNormSum(ex) === ex.denominator * ex.denominator
    const forward = ex.denominator

    for (let t = 0; t < 12; t++) lockedPairBeatBack(ex, exactMap)

    const reverses = ex.a.every((x, i) => (i === at ? x === forward * forward : x === 0n)) && ex.b.every(x => x === 0n)
    const s1 = pairPermutation.ok && triplePermutation.ok && exactGap < 1e-12 && normIdentity && reverses && beyondExact

    log('s1')

    // ---- S2 ----
    const confined = [16, 32, 64].map(L => {
      let worst = 0

      for (const c of CONTACT) {
        const x0 = L / 2
        const run = lockedRun({ ring: L, kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', wall: WALL, start: [{ x: [x0, x0], j: c.j, amp: [1, 0] }] })

        for (let t = 0; t < 4 * L; t++) {
          run.beat()
          worst = Math.max(worst, Math.abs(1 - run.compactWeight(WALL)))
        }
      }

      return { ring: L, worst }
    })
    const freeValues = SIZES.map(L => lateCompact({ ring: L, j: [0, 1] }))
    const freeFit = fit(freeValues)
    const s2 = confined.every(c => c.worst < 1e-12) && freeFit.a < 0.1

    log('s2')

    // ---- S3: the bound pair travels ----
    const travel = (() => {
      const L = 64
      const x0 = 32
      const run = lockedRun({ ring: L, kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', wall: WALL, start: [{ x: [x0, x0], j: [0, 1], amp: [1, 0] }] })
      const spread = (): number => {
        const pos = run.positions()
        let m1 = 0
        let m2 = 0

        for (let p = 0; p < pos.length; p++) {
          const x1 = Math.floor(p / L) - x0
          const x2 = (p % L) - x0
          const c = (x1 + x2) / 2

          m1 += (pos[p] as number) * c
          m2 += (pos[p] as number) * c * c
        }

        return Math.sqrt(m2 - m1 * m1)
      }
      let at12 = 0
      let at24 = 0

      for (let t = 1; t <= 24; t++) {
        run.beat()

        if (t === 12) at12 = spread()
        if (t === 24) at24 = spread()
      }

      return { at12, at24, ratio: at24 / at12 }
    })()
    const s3 = travel.ratio >= 1.7

    log('s3')

    // ---- S4: the phase string ----
    const phaseValues = SIZES.map(L => lateCompact({ ring: L, phaseString: true, j: [0, 1] }))
    const phaseFit = fit(phaseValues)
    const s4 = phaseFit.a < 0.9

    log('s4')

    // ---- S5: three locked loves with a span wall ----
    const three = (() => {
      const L = 16
      const S = 3
      const run = lockedRun({ ring: L, kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', wall: S, start: antisymmetrized({ x: [7, 7, 8], j: [0, 1, 0] }) })
      let beyond = 0
      let line = 0

      for (let t = 0; t < 64; t++) {
        run.beat()
        beyond = Math.max(beyond, 1 - run.compactWeight(S))
        line = Math.max(line, run.lineWeight())
      }

      // the spin-3/2 share: role irrep [3] of the three doublets
      const perms = [
        [0, 1, 2],
        [1, 0, 2],
        [2, 1, 0],
        [0, 2, 1],
        [1, 2, 0],
        [2, 0, 1],
      ]
      let quartet = 0
      let total = 0

      for (let p = 0; p < L ** 3; p++) {
        for (let r = 0; r < 27; r++) {
          const digits = [Math.floor(r / 9), Math.floor(r / 3) % 3, r % 3]
          let sr = 0
          let si = 0

          for (const perm of perms) {
            const q = 9 * (digits[perm[0] as number] as number) + 3 * (digits[perm[1] as number] as number) + (digits[perm[2] as number] as number)

            sr += (run.re[p * 27 + q] as number) / 6
            si += (run.im[p * 27 + q] as number) / 6
          }

          quartet += sr * sr + si * si
          total += (run.re[p * 27 + r] as number) ** 2 + (run.im[p * 27 + r] as number) ** 2
        }
      }

      return { beyond, line, quartet: quartet / total }
    })()
    const s5 = three.beyond < 1e-12 && three.line === 0

    log('s5')

    // ---- S6: the start ensemble ----
    const moves = gridMoves()
    const table = cliffordTable()
    const unitaries = Array.from({ length: 216 }, (_, k) => unitaryOf(k))
    const ensemble = startFamily(16).map(member => {
      const linksOf = (L: number): M3[] => Array.from({ length: L }, (_, x) => unitaries[table.indexOf(phaseMove(moves.act[member.start(x, moves.act.length)] ?? []))] as M3)
      let gap = 0
      const cases: { L: number; kinds: ('love' | 'fear')[]; wall: number; beats: number; start: LockedStart[] }[] = [
        { L: 24, kinds: ['love', 'fear'], wall: WALL, beats: 10, start: [{ x: [12, 12], j: [0, 1], amp: [1, 0] as Complex }] },
        { L: 12, kinds: ['love', 'love', 'love'], wall: 3, beats: 5, start: antisymmetrized({ x: [5, 5, 6], j: [0, 1, 0] }) },
      ]

      for (const c of cases) {
        const links = linksOf(c.L)
        const field = lockedRun({ ring: c.L, kinds: c.kinds, convention: 'C', unlike: 'knit', wall: c.wall, links, start: c.start })
        const plain = lockedRun({ ring: c.L, kinds: c.kinds, convention: 'C', unlike: 'knit', wall: c.wall, start: c.start })

        for (let t = 0; t < c.beats; t++) {
          field.beat()
          plain.beat()

          const a = field.positions()
          const b = plain.positions()

          gap = Math.max(gap, ...a.map((v, i) => Math.abs(v - (b[i] as number))))
        }
      }

      return { member: member.name, gap }
    })
    const s6 = ensemble.every(e => e.gap < 1e-12)

    log('s6')

    const ok = s1 && s2 && s3 && s4 && s5 && s6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the paid string is an integer rule: the walled stream permutes the ${pairPermutation.allowed} allowed pair configurations and the ${triplePermutation.allowed} allowed three-love configurations, and a walled love-fear pair runs exactly in Eisenstein integers (float gap ${exactGap.toExponential(1)}, norm identity ${normIdentity}, exact reversal ${reverses}, weight beyond the wall exactly 0 ${beyondExact}); with the fear beat inert (the knit's meeting) the walled pair stays within span ${WALL} with chance 1 from every contact start on rings 16, 32, 64 (worst ${Math.max(...confined.map(c => c.worst)).toExponential(1)}) where free walkers give a = ${freeFit.a.toFixed(3)}, and its center spreads ballistically (${travel.at12.toFixed(2)} at 12 beats, ${travel.at24.toFixed(2)} at 24, ratio ${travel.ratio.toFixed(2)}); the phase string omega^span gives a = ${phaseFit.a.toFixed(3)} (compact ${phaseValues.map(v => v.toFixed(3)).join(', ')} on rings 16, 24, 32); three locked loves under a span wall of 3 stay bound (weight beyond ${three.beyond.toExponential(1)}, on the line ${three.line}), N = 3 and 2 pi sign -1 on every state, spin-3/2 share ${three.quartet.toFixed(3)}; over the 17 link starts the walled runs have the no-field positions (worst ${Math.max(...ensemble.map(e => e.gap)).toExponential(1)})`,
      metrics: {
        gate_S1: s1 ? 1 : 0,
        gate_S2: s2 ? 1 : 0,
        gate_S3: s3 ? 1 : 0,
        gate_S4: s4 ? 1 : 0,
        gate_S5: s5 ? 1 : 0,
        gate_S6: s6 ? 1 : 0,
        pairAllowedConfigurations: pairPermutation.allowed,
        tripleAllowedConfigurations: triplePermutation.allowed,
        exactFloatGap: exactGap,
        exactNormIdentity: normIdentity ? 1 : 0,
        exactReverses: reverses ? 1 : 0,
        exactZeroBeyondWall: beyondExact ? 1 : 0,
        pairStreamIsPermutation: pairPermutation.ok ? 1 : 0,
        tripleStreamIsPermutation: triplePermutation.ok ? 1 : 0,
        exactDenominatorBits: forward.toString(2).length,
        ...Object.fromEntries(confined.map(c => [`walledConfinementWorstRing${c.ring}`, c.worst])),
        ...Object.fromEntries(freeValues.map((v, k) => [`freeCompactRing${SIZES[k]}`, v])),
        freeFitA: freeFit.a,
        freeFitCheck16: freeFit.check,
        travelSpread12: travel.at12,
        travelSpread24: travel.at24,
        travelRatio: travel.ratio,
        ...Object.fromEntries(phaseValues.map((v, k) => [`phaseStringCompactRing${SIZES[k]}`, v])),
        phaseStringFitA: phaseFit.a,
        phaseStringFitCheck16: phaseFit.check,
        threeWalledBeyond: three.beyond,
        threeWalledLine: three.line,
        threeWalledSpinQuartetShare: three.quartet,
        ensembleWorstGap: Math.max(...ensemble.map(e => e.gap)),
        ensembleMembers: ensemble.length,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        freeFitA: freeFit.a,
        phaseStringFitA: phaseFit.a,
      },
      notes: `L2, a STAND-IN (locked tokens on one husk line; one store per pair, not the knit's per-line demons). Gates S1 ${s1}, S2 ${s2}, S3 ${s3}, S4 ${s4}, S5 ${s5}, S6 ${s6}. FIRST RUN (20 s), recorded: fail on S1 alone, the exact run 0.43 from the float run, every other gate passing with the numbers of the second run. The cause was a bug in the exact rule's stream map (code/rule/locked-token-line): it also mapped the configurations beyond the wall, which hold no weight, and one of them lands on the same image as a bounce, so the map wrote a zero over the bounced amplitude (the float runner adds, so it was right). The first run's claim text named the norm identity and reversal without reading them (the text was fixed, not computed); they are now metrics. A probe (tmp/sx-probe-wall.ts) found the first bad beat; the map now sends nothing from beyond the wall, the gates are unchanged, and this is the second run. Ensemble gaps: ${ensemble.map(e => `${e.member} ${e.gap.toExponential(1)}`).join(', ')}. The store is S - span, a count kept by the rule: a joint copy that would lengthen the string past it is not made and both tokens' slots flip, which is E-FRC-0133's bounce with amplitudes. MEANING: the route through the flux works, and only as a count. The paid string is an integer rule, reversible, role-blind, and it binds the love-fear pair in every role channel, including every channel the fear beat cannot see, and three loves as three. The phase version, the same flux read as omega per unit per beat, is integer too but cannot confine, because a phase is defined mod 2 pi and omega^span repeats every three docks: its compact chance falls with the ring toward a = ${phaseFit.a.toFixed(2)}, the part held by localized states (where they sit was not measured), and the rest escapes (the title's numbers and this sentence were written after the runs). So in discrete time a potential that grows with distance must be a store that runs out, not a phase that turns. What the paid string does not supply is a reason for the store's size: S is the store's capacity, and with the store held as a column of D bulk trits it is at most 2D, so the depth sets the range. It is bound by a wall, not by a linear potential: every relative state inside the wall is bound, and which Q = 1 level is lightest is not defined by quasi-energy on a circle; E-SPN-0071's Pauli ground (natural spin one half) answers it only for a role-blind binding in continuous time.`,
    })
  },
})
