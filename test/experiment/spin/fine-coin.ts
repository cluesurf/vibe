// DOES A LIGHT WALK, BUILT FROM THE SAME PARTS, RESTORE INERTIA = ENERGY FOR A LONE LOVE (E-SPN-0107)? E-SPN-0106 found
// the ratio that keeps the held level from falling alike starts in the walk itself: a lone love is a Dirac walk with
// half-gap m = pi/3, a third of the lattice scale, so m* = tan m = sqrt 3 against its rest energy pi/3 (ratio 1.654) and
// its top speed is cos m = 1/2, not the stream's 1. note/project/vibe/roadmap/research/discrete-gravity.md, "Measured, where the
// 74 really comes from (E-SPN-0106)".
//
// WHY THE COIN'S ANGLE IS pi/3 (code/rule/coined-locked-knit, code/rule/fine-coin). The coin is C = P+ + beta P- on a
// line's doublet. E-SPN-0090 found every beta is allowed by W(F4)'s line stabilizer, the comoving frame, C and T; what
// fixed beta = w (a cube root of unity) is exactness in the rule's ring Z[w][1/2]: beta must be a unit of Z[w], a sixth
// root of unity, so the least nonzero angle is pi/3 (beta = -w^2 = 1 + w) and the working coin's is 2 pi/3. The angle
// arg beta is the full gap, so the half-gap is pi/3 for the working coin and pi/6 for the smaller unit.
//
// DERIVED BEFORE THE RUN (code/measure/fine-coin, header).
// 1. THE SLOW COIN (the route first proposed): the coin acts only on beats where a love's own bounded count of beats
//    wraps (every n-th beat), the love streaming freely otherwise. The count is carried and its reverse is known, so it
//    is exact, unitary and reversible; the stream still moves every love one dock a beat, so the line law and the light
//    cone hold and a lone love still reaches 1 dock a beat. But over its period a love at momentum K takes
//    C S(K)^n: the working walk with K replaced by nK, once per n beats. Its per-beat band is E_1(nK)/n, so
//      half-gap (pi/3)/n, m* = tan(pi/3)/n, m*/E_rest = tan(pi/3)/(pi/3) = 1.654 at EVERY n, top speed 1/2 at every n.
//    The mass does fall as (pi/3)/n, as expected, and the inertia falls with it: a rarer coin is the same walk on docks
//    n times larger, not a lighter walk on these docks. It cannot restore inertia = energy, and it is not tested as the
//    light walk; its period operator is read below as a control that the ratio follows the coin's angle per beat.
// 2. THE FINE COIN (the route tested): beta = zeta = e^(2 pi i/(3n)), the coin's phase w taken as its n-th part, so the
//    coin stays in E-SPN-0090's covariant family and n = 1 is the working coin bit for bit. A lone love's half-gap is
//    m = pi/(3n), m* = tan m, top speed cos m:
//        n        1        2        4        8
//        m*/m   1.6540   1.1027   1.0235   1.0058
//        v_top  0.5000   0.8660   0.9659   0.9914
//    zeta is outside Z[w] for n >= 3, and it is carried as the drift cost carries zeta_14: a count u in Z_n held with
//    each amplitude (amplitude A zeta^u, A in Z[w][1/2]), stepped by the coin's zeta terms and wrapping into w when it
//    reaches n (a carry, not a rounding). On the free module of counts the coin is P+ (x) 1 + P- (x) T, T the step with
//    its carry, a permutation times a phase: exact, unitary, and undone by the step back. The coin copies within one
//    line of one dock, so the line law and the light cone are untouched; the stream still moves every love one dock a
//    beat and the all-keep path's amplitude ((1 + zeta)/2)^t is never 0, so a lone love still reaches t docks at beat t.
//    n = 2 needs no count at all (zeta = 1 + w, E-SPN-0090's pi/3 coin); it is run on the count like the others.
// 3. OTHER ROUTES, NOT TAKEN. (a) A love as a many-hop composite with a small gap: E-SPN-0106 measured that binding ADDS
//    inertia (a further 4.2 on the trio), so a composite carries the same equivalence problem one level up and cannot
//    be the clean test of the walk. (b) E-SPN-0090's smaller integer coin alone (n = 2): register-free, but its ratio is
//    1.103 and top speed 0.866, light but not light enough; it is the n = 2 point here. (c) Coining k times per beat:
//    C^k has angle k (2 pi/3), never smaller than pi/3 in the ring. The fine coin is the one change that shrinks the
//    angle per beat while keeping the coin's form, which is why it is the one tested.
//
// WHAT n IS. The half-gap pi/(3n) is the love's mass in units of one dock and one beat, so its Compton wavelength is
// 1/m = 3n/pi docks: n is (pi/3) times the Compton wavelength over the dock. It is a NEW FREE INPUT, a per-species
// mass scale. Nothing in the model fixes it now: w comes from Z_3, the drift cost's clock from N = 2D + 1 = 7. The ring
// the drift cost already built, Z[zeta_42][1/2], holds zeta_(3n) exactly for n dividing 14 (n = 1, 2, 7, 14), a
// coincidence of rings, not a reading. A mass small against the dock needs n large (a real particle's Compton wavelength
// is about 10^20 docks if a dock is Planck sized), and the count stays bounded at any fixed n.
//
// GATES, fixed before the first run of this file. The runs: a lone love, no pieces, the fine coin at n = 1, 2, 4, 8, the
// ring form code/measure/bound-line pointBeatWith (flat links on a line of 1024 docks, K = 2 pi s/1024, a love's point
// is never read without a meeting), 128 beats from the band's eigenstate (code/measure/fine-coin fineLoneEntries),
// energy and velocity read by code/measure/moving-level boostedRun.
//  W1 the rest energy is the half-gap: E_rest = (E(0) of the band through 0 - E(0) of the other band) / 2, both read
//     from runs; m* from E(K) - E(0) = K^2/(2 m*) + b K^4 over s = 0, 1, 2, 4 (quarticMass). W1 holds iff at every n
//     m*/E_rest is within 1e-3 (relative) of the derived tan m/m above, it falls strictly with n, and at n = 8
//     |m*/E_rest - 1| <= 0.05.
//  W2 the top group velocity: the largest |measured velocity| over K = pi/4, 3pi/8, pi/2. W2 holds iff at every n it is
//     within 1e-3 of the derived cos(pi/(3n)), it rises strictly with n, and at n = 8 |v_top - 1| <= 0.05.
//  W3 (measurement, no gate: the trio's binding at small m has no derivation to fix one against). The three-love level
//     with the drift cost and the fermion sign (E-SPN-0104's rule, the working split meeting) under the fine coin at
//     n = 1, 2, 4, 8, box 12. lineLightest's ranking unwraps against a reference written for the working coin, so the
//     candidate is read directly: among the particle levels whose weight beyond N is at most 1e-3 (held inside the
//     light's reach), the one of least quasi-energy (at n = 1 that is E-SPN-0104's level, 0.33002). With no such level
//     the trio is NOT formed at that n and nothing further is read. With one: m* from bandCurvature at K = 0, E_rest =
//     3 E_rest(lone) + E(0), the ring form on the side-16 axis line's 32-position cover at K = 0 and 2 pi/32 over 128
//     beats; "held" iff the band's overlap to 2 pi/32 and the K = 0 run's least fidelity are both at least 0.99;
//     reported as m*/E_rest and as R = that ratio over the lone love's. This reading rule was written after probe 2
//     below, which is disclosed.
//  CONTROLS: (a) n = 1 is the working coin: fineBand(1, K) equals loneBand(K) (energy and vector within 1e-14 at
//     K = 0.1, pi/4, pi/2), the exact rule with fine = 1 equals the working rule bit for bit on the side-8 window
//     (4 beats, every slice, every branch), and the stand-in with fine = 1 equals the plain stand-in (E and m* within
//     1e-9, m* relative); n = 1's measured ratio is W1's 1.654. (b) the exact window at n = 2, 4, 8: a lone love at one dock of the
//     side-8 axis ring run 4 beats by the exact rule with the fine coin keeps the free norm exactly and the physical
//     norm within 1e-12, equals the ring form (points and energy per husk column within 1e-12), leaks nothing, disturbs
//     no vacuum branch, breaks no mesh line, puts no love outside the cone, reaches t docks at beat t, and runs back
//     exactly. (c) the flat line against the mesh: a lone love on the side-16 mesh ring's cover (points carried by the
//     mesh's links) at K = pi/4 reads the same energy as the flat line's run and as fineBand, within 1e-9, at every n.
//     (d) the slow coin (item 1): its period operator C S(K)^n, read numerically (code/measure/fine-coin slowReading),
//     gives m*/E_rest = tan(pi/3)/(pi/3) within 1e-5 and top speed 1/2 within 1e-4 at n = 2, 4, 8: a rarer coin is not
//     a lighter walk. Verdict: partial if a control fails; pass if W1 and W2 hold; fail otherwise.
// PREDICTED: pass (W1 1.0058 at n = 8, W2 0.9914); every control holds; W3: no trio formed at n >= 2 (probe 2).
//
// DISCLOSED PROBES (instrument only, no gate read on them). tmp/fcoin-probe1.log: the slow coin's period operator
// (ratio 1.65399 and top speed 0.49999985 at n = 1, 2, 4, 8), the exact window at n = 1 and 4 (norm, reversal, ring
// form to 4e-17), and the stand-in under the fine coin: fine = 1 equals the plain stand-in (E to 1e-16, m* to 1.3e-9,
// which is why the stand-in control reads m* relative), and at n = 2, 4, 8 lineLightest picks levels with 24 to 34
// percent of their weight beyond N. tmp/fcoin-probe2.log: every particle level ranked by mean string; at n = 1 two are
// held (tail 4e-4, 6e-4; the 0.33002 level among them), at n = 2, 4, 8 the least tail is 0.16 to 0.23 and the least mean
// string 4.6 to 5.4 in a box of 12 (n = 1: 1.81). The n = 1 level sits 92 percent on full docks, and a full dock's
// phase is det C times the meeting's w: the fine coin makes det C zeta, not w, so it changes the contact that held
// the level, not only the lone love's mass.
//
// FIRST RUN (303 s, tmp/fcoin-run1.log, the record): pass on W1 and W2, as predicted, no gate moved; every control
// holds. W1: m*/E_rest 1.65399, 1.10266, 1.02349, 1.00579 at n = 1, 2, 4, 8 (derived 1.65399, 1.10266, 1.02349, 1.00575;
// the n = 8 fit reads m* 0.131657 against tan(pi/24) 0.131652), E_rest read from the two bands equal to pi/(3n) to
// 1e-15. W2: v_top 0.50000, 0.86603, 0.96593, 0.99144 (cos(pi/(3n)) to 1e-15). W3: at n = 1 the candidate is
// E-SPN-0104's level (E 0.330019, m* 24.1164 against the free trio's 5.196, R 4.200, ring fidelity 0.99998); at n = 2,
// 4, 8 no particle level is held inside the box (least tail beyond N 0.223, 0.189, 0.094, mean string 5.4 to 6.6,
// contact 0.36, 0.06, 0.03), so no trio is formed and no ratio is read. Controls: fineBand(1) = loneBand to 1.4e-16,
// fine = 1 equals the working rule bit for bit, the stand-in with fine = 1 equals the plain one; the exact windows at
// n = 2, 4, 8 keep the norm, match the ring form, leak nothing, reach t at beat t and run back; the mesh ring's
// energies equal the flat line's to 2e-16; the slow coin reads 1.65399 and 0.4999999 at every n. Title written after
// the run.
//
// Depth L2: the lattice Dirac walk's mass tuning (the QCA-to-Dirac program) reproduced on the rule's own line with an
// exact carrier; the prediction that could fail is the measured ratio and speed at each n against tan m/m and cos m,
// and the slow coin's refusal. DETERMINISM: no random numbers. The rule is exact per count in Z[w][1/2]; the band, the
// placement's floats and every reading are measurement. NOTHING MOVES: the coin copies within a line, the count is a
// register the coin writes. HUSK FIRST: one husk line's columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLevels,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import {
  cutDensity,
  pointBeatWith,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import {
  flatGauge,
  runWindow,
  windowContext,
} from '@/code/measure/permutation-meeting'
import {
  bandCurvature,
  blochEntries,
  boostedRun,
  cutStart,
  exactStart,
  followLevel,
  loneBand,
  pointOrbit,
  quarticMass,
  type BoostedRun,
  type Entry,
} from '@/code/measure/moving-level'
import {
  fineBand,
  fineLoneEntries,
  flatLine,
  sameBoundState,
  slowReading,
} from '@/code/measure/fine-coin'
import {
  boundBeat,
  type BoundOptions,
} from '@/code/rule/bound-line-pieces'

const NS: readonly number[] = [1, 2, 4, 8]
const LINE = 1024
const FIT_STEPS: readonly number[] = [0, 1, 2, 4]
const SPEED_KS: readonly number[] = [
  Math.PI / 4,
  (3 * Math.PI) / 8,
  Math.PI / 2,
]
const BEATS = 128
const P = 40
const MATCH = 1e-3
const NEAR_ONE = 0.05
const EXACT = 1e-12
const SAME = 1e-9
const SLOW_RATIO = 1e-5
const SLOW_TOP = 1e-4
const WINDOW = { side: 8, beats: 4 }
const TRIO = {
  box: 12,
  side: 16,
  step: Math.PI / 64,
  d: 1e-2,
  ks: [0, (2 * Math.PI) / 32],
  tail: 1e-3,
  hold: 0.99,
}

export default experiment({
  id: 'spin/fine-coin',
  code: 'E-SPN-0107',
  title:
    "a light walk built from the same parts restores a lone love's inertia to its energy, pass on W1 and W2, but no bound trio survives it: the fine coin (the coin's phase w taken as its n-th part, zeta = e^(2 pi i/(3n)), carried exactly by a count in Z_n that wraps into w) gives a lone love half-gap pi/(3n), m*/E_rest 1.6540, 1.1027, 1.0235, 1.0058 at n = 1, 2, 4, 8 (tan m/m to 4e-5) and top speed 0.500, 0.866, 0.966, 0.991 (cos m), exact, unitary and reversible on the side-8 window (ring form to 1e-16, 0 leak, 0 mesh lines broken, t docks at beat t), n = 1 the working rule bit for bit; the slow coin (the working coin every n-th beat) keeps 1.654 and 1/2 at every n, the same walk on docks n times larger; n is (pi/3) times the Compton wavelength in docks, a new free input; at n = 2, 4, 8 no three-love level is held in the stand-in's box (least tail beyond N 0.22, 0.19, 0.09 against 6e-4 at n = 1), since the fine coin also turns a full dock's det C from w to zeta, the contact that held the level",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const f4 = (x: number): string => x.toFixed(4)
    const f6 = (x: number): string => x.toFixed(6)
    const e2 = (x: number): string => x.toExponential(2)
    const rest = (n: number): number => Math.PI / (3 * n)
    const derivedRatio = (n: number): number =>
      Math.tan(rest(n)) / rest(n)
    const derivedTop = (n: number): number => Math.cos(rest(n))

    // ---- the lone love on a flat line of LINE docks ----
    const ctx16 = windowContext(TRIO.side)
    const line = flatLine(LINE, ctx16.ring)
    const gLine = flatGauge(LINE)
    const lone = (n: number): PieceOptions => ({
      cost: false,
      sign: false,
      unit: 0,
      flat: true,
      fine: n,
    })
    const runOn = (
      options: PieceOptions,
      ring: typeof line,
      L: number,
      s0: CutState,
      K: number,
      beats = BEATS,
    ): BoostedRun =>
      boostedRun(
        s => pointBeatWith(options, ctx16.f.tables, ring, s),
        s0,
        K,
        beats,
        s => cutDensity(L, s),
      )
    const loneStart = (n: number, K: number, upper = false): CutState =>
      cutStart(fineLoneEntries(gLine, n, K, P, upper), P)
    const walks = NS.map(n => {
      const fit = FIT_STEPS.map(s => {
        const K = (2 * Math.PI * s) / LINE

        return runOn(lone(n), line, LINE, loneStart(n, K), K)
      })
      const other = runOn(lone(n), line, LINE, loneStart(n, 0, true), 0)
      const speeds = SPEED_KS.map(K =>
        runOn(lone(n), line, LINE, loneStart(n, K), K),
      )
      const halfGap = (fit[0]!.energy - other.energy) / 2
      const mass = quarticMass(fit)
      const ratio = mass.mass / halfGap
      const top = Math.max(...speeds.map(r => Math.abs(r.velocity)))
      const least = Math.min(
        ...[...fit, other, ...speeds].map(r => r.least),
      )

      log(`lone n ${n}`)

      return {
        n,
        fit,
        other,
        speeds,
        halfGap,
        mass: mass.mass,
        beta: mass.beta,
        ratio,
        top,
        least,
      }
    })

    // ---- W1, W2 ----
    const falls = walks.every(
      (w, i) =>
        i === 0 || w.ratio < (walks[i - 1] as { ratio: number }).ratio,
    )
    const rises = walks.every(
      (w, i) =>
        i === 0 || w.top > (walks[i - 1] as { top: number }).top,
    )
    const last = walks[walks.length - 1]!
    const w1 =
      walks.every(
        w => Math.abs(w.ratio / derivedRatio(w.n) - 1) <= MATCH,
      ) &&
      falls &&
      Math.abs(last.ratio - 1) <= NEAR_ONE
    const w2 =
      walks.every(w => Math.abs(w.top - derivedTop(w.n)) <= MATCH) &&
      rises &&
      Math.abs(last.top - 1) <= NEAR_ONE

    // ---- control (a): n = 1 is the working coin ----
    const bandOff = Math.max(
      ...[0.1, Math.PI / 4, Math.PI / 2].map(K => {
        const a = fineBand(1, K)
        const b = loneBand(K)

        return Math.max(
          Math.abs(a.energy - b.energy),
          ...a.vector.flatMap((z, j) => [
            Math.abs(z[0] - (b.vector[j] as [number, number])[0]),
            Math.abs(z[1] - (b.vector[j] as [number, number])[1]),
          ]),
        )
      }),
    )
    const ctx8 = windowContext(WINDOW.side)
    const onePoint = ctx8.gauge.to[0]![0]!
    const loneAt: Entry[] = [
      { ts: [{ x: 0, j: 0, p: onePoint }], c: 0, a: 1n, b: 0n },
    ]
    const sameState = sameBoundState
    const bitForBit = ((): boolean => {
      const plain: BoundOptions = { cost: false, sign: false }
      const fine1: BoundOptions = { cost: false, sign: false, fine: 1 }

      let a = exactStart(ctx8.vac, ctx8.ring, loneAt, 0)
      let b = a
      let same = true

      for (let t = 0; t < WINDOW.beats; t++) {
        a = boundBeat(plain, ctx8.f.tables, ctx8.ring, a, t)
        b = boundBeat(fine1, ctx8.f.tables, ctx8.ring, b, t)
        same &&= sameState(a, b)
      }

      return same
    })()

    log('control a')

    // ---- control (b): the exact window ----
    const windows = NS.filter(n => n > 1).map(n => {
      const w = runWindow(
        { cost: false, sign: false, fine: n },
        ctx8,
        exactStart(ctx8.vac, ctx8.ring, loneAt, 0),
        cutStart(loneAt, 0),
        WINDOW.beats,
      )

      log(`window n ${n}`)

      return { n, w }
    })
    const controlWindow = windows.every(
      ({ w }) =>
        w.reversed &&
        w.beats.every(
          (b, t) =>
            b.normKept &&
            b.physicalNormOff <= EXACT &&
            b.leak === 0 &&
            b.disturbed === 0 &&
            b.pointGap <= EXACT &&
            b.energyGap <= EXACT &&
            b.toneBroken === 0 &&
            b.outsideCone === 0 &&
            b.reach === t + 1,
        ),
    )

    // ---- control (c): the flat line against the mesh's ring ----
    const meshK = Math.PI / 4
    const meshRuns = NS.map(n => {
      const r = runOn(
        { cost: false, sign: false, unit: 0, flat: false, fine: n },
        ctx16.ring,
        ctx16.L,
        cutStart(fineLoneEntries(ctx16.gauge, n, meshK, P), P),
        meshK,
        32,
      )
      const flat = walks[NS.indexOf(n)]!.speeds[0]!

      return {
        n,
        energy: r.energy,
        least: r.least,
        offFlat: Math.abs(r.energy - flat.energy),
        offClosed: Math.abs(r.energy - fineBand(n, meshK).energy),
      }
    })
    const controlMesh = meshRuns.every(
      r => r.offFlat <= SAME && r.offClosed <= SAME,
    )

    log('control c')

    // ---- control (d): the slow coin ----
    const slow = NS.map(n => slowReading(n))
    const controlSlow = slow.every(
      s =>
        Math.abs(s.ratio - derivedRatio(1)) <= SLOW_RATIO &&
        Math.abs(s.top - 0.5) <= SLOW_TOP,
    )

    // ---- W3: the trio under the fine coin (measurement) ----
    // the stand-in's level. lineLightest ranks by an unwrapping written for the working coin, so W3 reads its own
    // candidate: among the particle levels held inside the light's reach (tail beyond N at most TRIO.tail), the one of
    // least quasi-energy; with none held, the least-tail level is reported and nothing further is read from it
    const standIn = (fine?: number) => {
      const sector: LineSector = {
        flavors: [0, 0, 0],
        statistics: 'fermion',
        D: 3,
        box: TRIO.box,
        unit: 0,
        ...(fine === undefined ? {} : { fine }),
      }
      const basis = lineBasis(sector)
      const sub = wholeBasis(basis)
      const light = lineLightest(basis, sub)
      const levels = lineLevels(basis, sub).levels
      const inside = levels.filter(l => l.tailN <= TRIO.tail)
      const candidate =
        inside.length > 0
          ? inside.reduce((a, b) => (b.energy < a.energy ? b : a))
          : levels.reduce((a, b) => (b.tailN < a.tailN ? b : a))
      const band =
        inside.length > 0
          ? followLevel(basis, sub, candidate, TRIO.ks, TRIO.step)
          : []
      const mass =
        band.length > 0
          ? 1 / bandCurvature(basis, sub, band[0]!, TRIO.d)
          : Number.NaN

      return {
        basis,
        light,
        candidate,
        inside: inside.length,
        band,
        mass,
      }
    }

    const plainStandIn = standIn()

    log('stand-in plain')

    const cover = pointOrbit(ctx16.gauge).length * ctx16.L

    if (cover !== 32) {
      throw new Error(
        `fine-coin: the cover is ${cover}, the trio's momenta were fixed for 32`,
      )
    }

    const trios = NS.map(n => {
      const s = standIn(n)
      const options: PieceOptions = {
        cost: true,
        sign: true,
        unit: 0,
        flat: false,
        fine: n,
      }
      const runs = s.band.map(b =>
        runOn(
          options,
          ctx16.ring,
          ctx16.L,
          cutStart(
            blochEntries(ctx16.gauge, s.basis, b.vector, b.K, P)
              .entries,
            P,
          ),
          b.K,
        ),
      )
      const walk = walks[NS.indexOf(n)]!
      const held =
        runs.length > 0 &&
        s.band[s.band.length - 1]!.overlap >= TRIO.hold &&
        runs[0]!.least >= TRIO.hold
      const eRest =
        runs.length > 0
          ? 3 * walk.halfGap + runs[0]!.energy
          : Number.NaN
      const ratio = s.mass / eRest

      log(`trio n ${n}`)

      return {
        n,
        s,
        runs,
        eRest,
        ratio,
        R: ratio / walk.ratio,
        held,
        freeMass: 3 * walk.mass,
        bindingMass: s.mass - 3 * walk.mass,
      }
    })
    const trioOne = trios[0]!
    // fine = 1 is the working coin: the same level (E-SPN-0104's, E 0.33002) and the same m* as the plain stand-in
    const controlStandIn =
      Math.abs(
        trioOne.s.candidate.energy - plainStandIn.candidate.energy,
      ) <= SAME &&
      Math.abs(
        trioOne.s.candidate.energy - plainStandIn.light.lightest.energy,
      ) <= SAME &&
      Math.abs(trioOne.s.mass / plainStandIn.mass - 1) <= SAME

    const controlOne = bandOff <= 1e-14 && bitForBit && controlStandIn
    const control =
      controlOne && controlWindow && controlMesh && controlSlow
    const status = !control ? 'partial' : w1 && w2 ? 'pass' : 'fail'
    const metrics: Record<string, number> = {
      gate_W1: w1 ? 1 : 0,
      gate_W2: w2 ? 1 : 0,
      control: control ? 1 : 0,
      controlOne: controlOne ? 1 : 0,
      controlWindow: controlWindow ? 1 : 0,
      controlMesh: controlMesh ? 1 : 0,
      controlSlow: controlSlow ? 1 : 0,
      controlStandIn: controlStandIn ? 1 : 0,
      bitForBit: bitForBit ? 1 : 0,
      bandOff,
      seconds: (Date.now() - started) / 1000,
    }

    for (const w of walks) {
      metrics[`lone${w.n}_halfGap`] = w.halfGap
      metrics[`lone${w.n}_halfGapDerived`] = rest(w.n)
      metrics[`lone${w.n}_mass`] = w.mass
      metrics[`lone${w.n}_massDerived`] = Math.tan(rest(w.n))
      metrics[`lone${w.n}_ratio`] = w.ratio
      metrics[`lone${w.n}_ratioDerived`] = derivedRatio(w.n)
      metrics[`lone${w.n}_top`] = w.top
      metrics[`lone${w.n}_topDerived`] = derivedTop(w.n)
      metrics[`lone${w.n}_leastFidelity`] = w.least
    }

    for (const s of slow) {
      metrics[`slow${s.n}_ratio`] = s.ratio
      metrics[`slow${s.n}_halfGap`] = s.halfGap
      metrics[`slow${s.n}_top`] = s.top
    }

    for (const r of meshRuns) {
      metrics[`mesh${r.n}_offFlat`] = r.offFlat
      metrics[`mesh${r.n}_offClosed`] = r.offClosed
    }

    for (const t of trios) {
      metrics[`trio${t.n}_held`] = t.held ? 1 : 0
      metrics[`trio${t.n}_levelsInside`] = t.s.inside
      metrics[`trio${t.n}_energy`] = t.s.candidate.energy
      metrics[`trio${t.n}_meanString`] = t.s.candidate.mean
      metrics[`trio${t.n}_tail`] = t.s.candidate.tailN
      metrics[`trio${t.n}_contact`] = t.s.candidate.contact
      metrics[`trio${t.n}_mass`] = t.s.mass
      metrics[`trio${t.n}_eRest`] = t.eRest
      metrics[`trio${t.n}_ratio`] = t.ratio
      metrics[`trio${t.n}_R`] = t.R
      metrics[`trio${t.n}_freeMass`] = t.freeMass
      metrics[`trio${t.n}_bindingMass`] = t.bindingMass
      t.runs.forEach((r, i) => {
        metrics[`trio${t.n}_k${i}_leastFidelity`] = r.least
        metrics[`trio${t.n}_k${i}_energy`] = r.energy
        metrics[`trio${t.n}_k${i}_energyBand`] = t.s.band[i]!.energy
      })
    }

    const walkRow = (w: (typeof walks)[number]): string =>
      `n ${w.n}: E_rest ${f6(w.halfGap)} (pi/${3 * w.n} ${f6(rest(w.n))}), m* ${f6(w.mass)} (tan ${f6(Math.tan(rest(w.n)))}), m*/E_rest ${f4(w.ratio)} (derived ${f4(derivedRatio(w.n))}), v_top ${f4(w.top)} (derived ${f4(derivedTop(w.n))})`
    const trioRow = (t: (typeof trios)[number]): string =>
      t.s.inside === 0
        ? `n ${t.n}: no particle level held inside the box (least tail ${f4(t.s.candidate.tailN)}, mean string ${f4(t.s.candidate.mean)}, contact ${f4(t.s.candidate.contact)})`
        : `n ${t.n}: E(0) ${f6(t.s.candidate.energy)} (mean string ${f4(t.s.candidate.mean)}, contact ${f4(t.s.candidate.contact)}), held ${t.held}, m* ${f4(t.s.mass)} (free ${f4(t.freeMass)}), E_rest ${f4(t.eRest)}, m*/E_rest ${f4(t.ratio)}, R ${f4(t.R)}, ring fidelity ${t.runs.map(r => f4(r.least)).join(', ')}`

    return verdict({
      status,
      claim: `a lone love under the fine coin (zeta = e^(2 pi i/(3n)), carried exactly by a count in Z_n), no pieces, a flat line of ${LINE} docks, ${BEATS} beats: ${walks.map(walkRow).join('; ')}; W1 ${w1}, W2 ${w2}; the slow coin (coin every n-th beat) keeps m*/E_rest ${slow.map(s => f4(s.ratio)).join(', ')} and top speed ${slow.map(s => f4(s.top)).join(', ')} at n = ${NS.join(', ')}; the trio with the drift cost and the fermion sign (measured, not gated): ${trios.map(trioRow).join('; ')}; controls: n = 1 ${controlOne} (band off ${e2(bandOff)}, bit for bit ${bitForBit}, stand-in ${controlStandIn}), exact window ${controlWindow}, mesh ring ${controlMesh}, slow ${controlSlow}`,
      metrics,
      control: {
        one: controlOne ? 1 : 0,
        window: controlWindow ? 1 : 0,
        mesh: controlMesh ? 1 : 0,
        slow: controlSlow ? 1 : 0,
      },
      notes: `L2. W1 ${w1} (falls ${falls}), W2 ${w2} (rises ${rises}); controls one ${controlOne}, window ${controlWindow}, mesh ${controlMesh}, slow ${controlSlow}. Lone fits: ${walks.map(w => `n ${w.n} E(K) ${w.fit.map(r => r.energy.toExponential(6)).join(' ')}, other band ${w.other.energy.toFixed(9)}, b ${w.beta.toExponential(3)}, speeds ${w.speeds.map(r => `K ${f4(r.K)} v ${r.velocity.toFixed(6)} (band ${fineBand(w.n, r.K).slope.toFixed(6)})`).join(' ')}, least fidelity ${w.least.toFixed(12)}`).join('; ')}. Slow: ${slow.map(s => `n ${s.n} half-gap ${s.halfGap.toFixed(9)} m* ${s.mass.toFixed(9)}`).join('; ')}. Mesh ring at K = pi/4, 32 beats: ${meshRuns.map(r => `n ${r.n} E ${r.energy.toFixed(12)} off flat ${e2(r.offFlat)} off closed ${e2(r.offClosed)} least ${r.least.toFixed(9)}`).join('; ')}. Windows (side ${WINDOW.side}, ${WINDOW.beats} beats): ${windows.map(({ n, w }) => `n ${n}: ${w.beats.map((b, t) => `beat ${t + 1} ${b.branches} branches in ${b.slices} slices, norm ${b.normKept}, physical ${e2(b.physicalNormOff)}, leak ${b.leak}, disturbed ${b.disturbed}, point gap ${e2(b.pointGap)}, energy gap ${e2(b.energyGap)}, tone ${b.toneBroken}, cone ${b.outsideCone}, reach ${b.reach}`).join('; ')}, reversed ${w.reversed}`).join(' | ')}. Stand-in plain: lightest E ${plainStandIn.light.lightest.energy}, candidate E ${plainStandIn.candidate.energy}, m* ${plainStandIn.mass}. Trio: ${trios.map(t => `n ${t.n} dim ${t.s.basis.configs.length} particle levels ${t.s.light.particleLevels}, held inside ${t.s.inside}; candidate E ${t.s.candidate.energy} mean string ${t.s.candidate.mean} contact ${t.s.candidate.contact} tail ${t.s.candidate.tailN} even ${t.s.candidate.even}; lineLightest E ${t.s.light.lightest.energy} mean ${t.s.light.lightest.mean} tail ${t.s.light.lightest.tailN}; m* ${t.s.mass} band ${t.s.band.map(b => `K ${f4(b.K)} E ${f6(b.energy)} overlap ${f4(b.overlap)}`).join(' ')} ring ${t.runs.map(r => `K ${f4(r.K)} least ${f6(r.least)} E ${f6(r.energy)} v ${r.velocity.toExponential(3)}`).join(' ')}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
