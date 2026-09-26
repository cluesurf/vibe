// The lone bounce collision (E-RLT-0084): a collision that turns the dock's vacuum pairs as the -1 coin map when one
// extra vibe arrives, so a lone vibe no longer scatters a dock full of vacuum vibes.
//
// THE RULE, derived (code/rule/bounce-pair-knit). Read only the occupation. A line is empty, SINGLE (one slot held) or
// FULL (both held); F is the set of full lines, P the occupation momentum (the singles' momentum, full lines adding 0),
// w = w_P the isometric coin map (K's choice). Two collisions are built:
//   B (always):  -1 on every full line; w on the other lines when w carries F onto itself, else nothing on them.
//   L (lone):    B on a dock holding AT MOST ONE single line; K on every other dock.
// Both are involutions (they keep F, P and the number of single lines, so the same case applies twice), commute with
// all 1,152 coin maps and with charge conjugation (F, P, the single count and w_P are covariant, -1 is central, and
// only occupation is read), keep charge, count and momentum (slot permutations, w fixing P, full lines holding 0), and
// leave the pair move P, the store that returns its tokens and the neutral veto untouched. So the living-pair knit's
// exact reversal, motion reversal (T = S R) and CPT carry over by its own argument with K replaced.
//
// NO LABEL. F and the single count are read from the occupation, which K already reads. A full line of matter bounces
// exactly as a vacuum pair does, and neither collision can tell them apart. The store's place tokens DO carry a label
// (the unit's orientation sign), but neither collision reads a token. So no label is needed, and none is added.
//
// WHY L AND NOT B. B does exactly what was asked, on every dock: vacuum pairs turn as -1 whatever else arrives. But B
// can scatter a dock's singles only when w keeps the random set of full lines, which a dense gas rarely allows, so B's
// gas barely relaxes its line momenta: the exact linear transport at the uniform background has its hydrodynamic
// crossover near k 0.002 against K's 0.26, with a momentum-sector trace 120 times K's (a probe before this file). A lone
// vibe is ONE single line; two or more singles are matter meeting matter. L keeps K there, so matter scatters as it did,
// and gives B exactly where a lone vibe meets vacuum pairs. L differs from K only on docks with one single line and a
// full line at 60 degrees to it.
//
// THE LONE VIBE, derived. On a vacuum whose docks hold only full lines at every coin piece (every (Z) vacuum), a lone
// vibe of root r makes a dock with one single line: L = B there, w_r fixes r, so the lone vibe keeps its slot and every
// full line turns as it would without it. A lone vibe on a line the vacuum does not store passes through untouched (its
// wake is the vibe itself). A lone vibe on a stored line meets that line's units through P (it blocks a make or meets a
// member), which disturbs only that line; every dock then still holds one single line at most, so L = B throughout and
// the disturbance stays on the one line: the wake is confined to the vibe's line (checked: 0 trits off it).
//
// Gates, fixed before the first run of this file:
//  B1 covariance: L's dock permutation commutes with all 1,152 coin maps on every dock holding at most one single line
//     (exhaustive over the full-line sets and the single's slot) and on 4,000 Weyl docks of any occupation
//  B2 involution and laws: L applied twice is the identity and keeps momentum, on the same docks; charge conjugation
//     commutes with both collisions on 400 dock states with three stores
//  B3 the kernel agrees with the rule bit for bit on the side-4 box for 48 beats (hub store, one-line store, no store,
//     and E-RLT-0067's Kronecker start), the veto acting in each
//  B4 reversal: 48 beats forward and back return the side-4 hub box exactly, the motion reversal identity
//     U_1 T U_0 T = 1 holds on it, and charge is kept
//  B5 the vacuum is unchanged: on the hub vacuum (side 8), the one-line vacuum and the all-line vacuum (side 9) the
//     history under L equals the history under K for 24 beats, trit for trit
//  B6 the target: on the hub vacuum at sides 8 and 12 the lone-love and lone-fear wakes (24 directions, 4 periods) are
//     at most the committed knit's dressing at the same side in every period, and 0 trits of any wake lie off the
//     seed's own line
//  B7 transport: the exact linearization of L agrees with the existing one when L is replaced by K (1e-10) and with
//     the sampled one (the difference falling at least 3-fold from 20,000 to 80,000 samples); at the uniform background
//     it keeps 6 invariants, commutes with all 1,152 coin maps (1e-10), and its husk exponents are charge, trace and
//     sound at least 3.5 and shear 2 +- 0.5
// Verdict: pass if every gate holds; fail if B1 to B5 and B7's instrument checks hold and B6 or the transport does not;
// partial otherwise.
//
// Reported, not gated: B on every dock (its wake and its crossover k), the wake at side 12 per direction class.
//
// DISCLOSED: probes before this file measured L's wake (13, 15, 13, 15 on side 8; 19, 21, 20, 21 on side 12), B's and
// L's uniform transport and B's crossover, so B6 and B7 are confirmations here. The wake grows with the side (about
// 1.75 trits per dock of the vibe's line): it is confined to one line, not bounded in size on an unbounded box.
//
// FIRST RUN (94.4 s): pass, every gate, recorded as is. Title written after the run.
//
// Depth L2. DETERMINISM: golden fills, Kronecker and Weyl docks (code/tool/weyl), fixed layouts, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { isometricTable, LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { turningWeave } from '@/code/rule/collision'
import { livingState } from '@/code/rule/living-pair-knit'
import { cloneStoreState, sameStoreState, storeCharge, transformStoreState } from '@/code/rule/token-store-knit'
import { bounceBeat, bounceBeatBack, bounceCollide, bounceMotionReversal, bouncePermutation, makeBounceKnit, type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { bounceKernelAgreement, bounceRunner, makeBounceKernel } from '@/code/measure/bounce-pair-kernel'
import { tritDifference, type Reduced } from '@/code/measure/living-pair-kernel'
import { bounceLinearization, sampledBounceLinearization } from '@/code/measure/bounce-linearization'
import { goldenFill } from '@/code/measure/candidate-kernel'
import { storeStart } from '@/code/measure/token-store-gates'
import { orientedLinearization, sparseLivingState } from '@/code/measure/sparse-living-vacuum'
import { coinData, orientedHubStore, uniformStore } from '@/code/measure/varying-vacuum'
import { layoutOf, weaveOf } from '@/code/measure/varying-living-battery'
import { equivarianceDefect, ORIENTED, readTransport, SPACE } from '@/code/measure/varying-transport'
import { invariantsOf } from '@/code/measure/store-transport'
import { dressing as ruleDressing, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { weyl } from '@/code/tool/weyl'

const ROOTS = rootsD4()
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const KIND: CollisionKind = 'lone'
const BEATS = 96

export default experiment({
  id: 'relativity/lone-bounce-collision',
  code: 'E-RLT-0084',
  title:
    "the lone bounce collision, pass: a dock holding at most one single-held line turns its full lines as -1 and moves nothing else, every other dock applies the isometric map; it needs no label (it reads only which lines are full, and never a token), commutes with all 1,152 coin maps and with charge conjugation (0 failures over 57,248 docks, 53,248 of them exhaustive), is an involution keeping momentum, reverses exactly with the motion reversal U1 T U0 T = 1, and leaves the hub, one-line and all-line vacua trit for trit as they were; on the hub vacuum a lone vibe's wake is 13, 15, 13, 15 trits per period on side 8 and 19 to 21 on side 12 (the isometric map: 8,896; committed 28 to 214 and 31 to 805), 22 of 24 directions bare and 0 trits off the vibe's own line, and the exact linear transport keeps the isotropic husk law (charge 4.00, trace 4.11, sound 4.03, shear 2.03, crossover k 0.256 against the isometric 0.262); turning the full lines on EVERY dock gives the same wake but a gas that barely relaxes (crossover k 0.0020, momentum trace 120 times)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const table = groupTable()
    const coins = coinData(table)
    const perms = table.permutations
    const iso = isometricTable()
    const r0 = d4Coordinates(ROOTS[LINE_FIRSTS[0] as number] as number[])
    const hubStore = (side: number, anchor: number): Int8Array => orientedHubStore(coins, side, d4BoxCoordinates({ cell: anchor, side }).map((v, k) => v - (r0[k] as number)))

    // ---- B1, B2: dock-level covariance, involution, momentum ----
    const docks: Int8Array[] = []

    for (let full = 0; full < 4096; full++) {
      const base = new Int8Array(24)

      for (let l = 0; l < 12; l++) {
        if ((full >> l) & 1) {
          base[LINE_FIRSTS[l] as number] = 1
          base[LINE_SECONDS[l] as number] = -1
        }
      }

      docks.push(base)

      for (let d = 0; d < 24; d++) {
        if ((full >> (LINE_OF[d] as number)) & 1) continue

        const v = Int8Array.from(base)

        v[d] = 1
        docks.push(v)
      }
    }

    const exhaustive = docks.length

    for (let m = 0; m < 4000; m++) {
      const v = new Int8Array(24)

      for (let d = 0; d < 24; d++) {
        const x = weyl(m + 1, Math.sqrt(2 + d) - Math.floor(Math.sqrt(2 + d)))

        v[d] = x < 0.3 ? 1 : x < 0.6 ? -1 : 0
      }

      docks.push(v)
    }

    const p1 = new Int32Array(24)
    const p2 = new Int32Array(24)
    const identity = Int32Array.from({ length: 24 }, (_, d) => d)
    let covarianceFailures = 0
    let involutionFailures = 0
    let momentumFailures = 0
    let differsFromK = 0
    const permOf = (v: Int8Array, out: Int32Array, kind: CollisionKind): void => {
      if (bouncePermutation(iso, kind, v, 0, out) === 0) out.set(identity)
    }
    const apply = (perm: Int32Array, v: Int8Array): Int8Array => {
      const out = new Int8Array(24)

      for (let d = 0; d < 24; d++) out[perm[d] as number] = v[d] as number

      return out
    }

    for (const v of docks) {
      permOf(v, p1, KIND)
      permOf(v, p2, 'isometric')
      differsFromK += p1.some((x, d) => x !== p2[d] && v[d] !== 0) ? 1 : 0

      const after = apply(p1, v)
      const q = new Int32Array(24)

      permOf(after, q, KIND)
      involutionFailures += apply(q, after).every((x, d) => x === v[d]) ? 0 : 1

      const mom = (u: Int8Array): number[] => [0, 1, 2, 3].map(k => u.reduce((s, x, d) => s + (x !== 0 ? ((ROOTS[d] as number[])[k] as number) : 0), 0))
      const m0 = mom(v)
      const m1 = mom(after)

      momentumFailures += m0.every((x, k) => x === m1[k]) ? 0 : 1

      for (const g of perms) {
        const gv = new Int8Array(24)

        for (let d = 0; d < 24; d++) gv[g[d] as number] = v[d] as number

        const pg = new Int32Array(24)

        permOf(gv, pg, KIND)

        // g p1 = pg g on the held slots
        let ok = true

        for (let d = 0; d < 24 && ok; d++) if (v[d] !== 0) ok = pg[g[d] as number] === g[p1[d] as number]

        covarianceFailures += ok ? 0 : 1
      }
    }

    log('b1 b2')

    // charge conjugation on 400 dock states with three stores (cptAtCollision's set), both beats' collisions
    const knit3 = makeBounceKnit(weaveOf(3), 'alternate', true, KIND)
    const id24 = Array.from({ length: 24 }, (_, d) => d)
    let chargeConjugationFailures = 0

    for (let n = 0; n < 400; n++) {
      const v = new Int8Array(24)
      const point = new Int8Array(24)

      for (let i = 0; i < 24; i++) {
        v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1
        if (n % 2 === 0 && (n + i) % 5 !== 0) v[i] = 0
        point[i] = (n * 5 + i * 2) % 9
      }

      for (const pattern of [1, 0, 2]) {
        const x = livingState({ vibe: v, point, tau: pattern === 2 ? 0 : pattern, layout: new Int8Array(12).fill(4) })

        if (pattern === 2) for (let l = 0; l < 12; l++) x.store[l] = ((n + l) % 3) - 1

        for (const t of [0, 1]) {
          const lhs = transformStoreState(x, [0], id24, -1)

          bounceCollide(knit3, lhs, 0, t)

          const y = cloneStoreState(x)

          bounceCollide(knit3, y, 0, t)
          chargeConjugationFailures += sameStoreState(lhs, transformStoreState(y, [0], id24, -1)) ? 0 : 1
        }
      }
    }

    const b1 = covarianceFailures === 0
    const b2 = involutionFailures === 0 && momentumFailures === 0 && chargeConjugationFailures === 0

    // ---- B3: kernel agreement ----
    const w4 = weaveOf(4)
    const cells4 = w4.mesh.cellCount
    const knit4 = makeBounceKnit(w4, 'alternate', true, KIND)
    const agreements = [hubStore(4, 0), uniformStore(cells4, [0]), new Int8Array(cells4 * 12)].map(store =>
      bounceKernelAgreement({ knit: knit4, start: sparseLivingState({ ...goldenFill(cells4 * 24, 1.37), store, layout: layoutOf(4) }), beats: 48 }),
    )

    agreements.push(bounceKernelAgreement({ knit: knit4, start: storeStart(cells4, 11), beats: 48 }))

    const b3 = agreements.every(a => a.mismatches === 0 && a.vetoed > 0)

    log('b3')

    // ---- B4: reversal, motion reversal, charge ----
    const box0 = sparseLivingState({ ...goldenFill(cells4 * 24, 1.37), store: hubStore(4, 0), layout: layoutOf(4) })
    const none = new Uint8Array(box0.point.length)
    let s = box0
    let chargeKept = true

    for (let t = 0; t < 48; t++) {
      s = bounceBeat(knit4, s, none, t).state
      chargeKept = chargeKept && storeCharge(s) === storeCharge(box0)
    }

    for (let t = 47; t >= 0; t--) s = bounceBeatBack(knit4, s, none, t).state

    const reverses = sameStoreState(s, box0)
    // U_1 T U_0 T = 1: T, beat 0, T, beat 1
    let m = bounceMotionReversal(knit4, box0, 0)

    m = bounceBeat(knit4, m, none, 0).state
    m = bounceMotionReversal(knit4, m, 0)
    m = bounceBeat(knit4, m, none, 1).state

    const motion = sameStoreState(m, box0)
    const b4 = reverses && motion && chargeKept

    log('b4')

    // ---- B5: the vacuum is unchanged ----
    const vacuumHistory = (kind: CollisionKind, side: number, store: Int8Array, beats: number): Reduced[] => {
      const kernel = makeBounceKernel(weaveOf(side), kind)
      const run = bounceRunner(kernel, { vibe: new Int8Array(kernel.cells * 24), point: new Int8Array(kernel.cells * 24), store: Int8Array.from(store), spoint: Int8Array.from(layoutOf(side)) })
      const out: Reduced[] = []

      for (let t = 0; t < beats; t++) {
        run.beat()

        const r = run.state()

        out.push({ vibe: Int8Array.from(r.vibe), point: Int8Array.from(r.point), store: Int8Array.from(r.store), spoint: Int8Array.from(r.spoint) })
      }

      return out
    }
    const vacua: [string, number, Int8Array][] = [
      ['hub', 8, hubStore(8, d4BoxCell({ coordinates: [4, 4, 4, 4], side: 8 }))],
      ['one line', 9, uniformStore(9 ** 4, [0])],
      ['all lines', 9, uniformStore(9 ** 4, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])],
    ]
    let vacuumDifferences = 0

    for (const [, side, store] of vacua) {
      const a = vacuumHistory(KIND, side, store, 24)
      const b = vacuumHistory('isometric', side, store, 24)

      vacuumDifferences += a.reduce((n, x, t) => n + tritDifference(x, b[t] as Reduced).trits, 0)
    }

    const b5 = vacuumDifferences === 0

    log('b5')

    // ---- B6: the wake ----
    const committedRule: ScheduledRule = (opposite, forward) => turningWeave({ opposite, forward, table: 'pair' })
    const wakeOf = (kind: CollisionKind, side: number, tone: number): { worst: number[]; offLine: number; bare: number; perDirection: number[] } => {
      const kernel = makeBounceKernel(weaveOf(side), kind)
      const cells = kernel.cells
      const mid = side / 2
      const center = d4BoxCell({ coordinates: [mid, mid, mid, mid], side })
      const store = hubStore(side, center)
      const vac = vacuumHistory(kind, side, store, BEATS)
      const worst = [0, 0, 0, 0]
      const perDirection: number[] = []
      let offLine = 0
      let bare = 0

      for (let d = 0; d < 24; d++) {
        const start: Reduced = { vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), store: Int8Array.from(store), spoint: Int8Array.from(layoutOf(side)) }

        start.vibe[center * 24 + d] = tone

        const run = bounceRunner(kernel, start)
        const line = LINE_OF[d] as number
        let most = 0

        for (let t = 0; t < BEATS; t++) {
          run.beat()

          const a = run.state()
          const b = vac[t] as Reduced
          const trits = tritDifference(a, b).trits

          worst[Math.floor(t / 24)] = Math.max(worst[Math.floor(t / 24)] ?? 0, trits)
          most = Math.max(most, trits)

          for (let i = 0; i < a.vibe.length; i++) if (a.vibe[i] !== b.vibe[i] && LINE_OF[i % 24] !== line) offLine++
          for (let i = 0; i < a.store.length; i++) if (a.store[i] !== b.store[i] && i % 12 !== line) offLine++
        }

        perDirection.push(most)
        bare += most === 1 ? 1 : 0
      }

      return { worst, offLine, bare, perDirection }
    }
    const wakes = [8, 12].map(side => ({
      side,
      love: wakeOf(KIND, side, 1),
      fear: wakeOf(KIND, side, -1),
      committedLove: ruleDressing(committedRule, { side, tone: 1 }).periodLargest,
      committedFear: ruleDressing(committedRule, { side, tone: -1 }).periodLargest,
    }))
    const b6 = wakes.every(
      w =>
        w.love.worst.every((x, p) => x <= (w.committedLove[p] ?? 0)) &&
        w.fear.worst.every((x, p) => x <= (w.committedFear[p] ?? 0)) &&
        w.love.offLine === 0 &&
        w.fear.offLine === 0,
    )
    const alwaysBounce = wakeOf('bounce', 8, 1)

    log('b6')

    // ---- B7: transport ----
    const stored = Array.from({ length: 12 }, (_, l) => (l === 0 ? ([2 / 3, 1 / 6, 1 / 6] as const) : ([1 / 6, 1 / 6, 2 / 3] as const)))
    const uniform = Array.from({ length: 12 }, () => [1 / 3, 1 / 3, 1 / 3] as const)
    const maxDiff = (a: Float64Array, b: Float64Array): number => a.reduce((mx, x, i) => Math.max(mx, Math.abs(x - (b[i] as number))), 0)
    const againstExisting = Math.max(
      maxDiff(bounceLinearization({ kind: 'isometric', background: ORIENTED, mode: 'BP', laws: stored }), orientedLinearization({ table: iso, background: ORIENTED, mode: 'PK', laws: stored })),
      maxDiff(bounceLinearization({ kind: 'isometric', background: ORIENTED, mode: 'PB', laws: stored }), orientedLinearization({ table: iso, background: ORIENTED, mode: 'KP', laws: stored })),
    )
    const lone = [bounceLinearization({ kind: KIND, background: ORIENTED, mode: 'BP', laws: uniform }), bounceLinearization({ kind: KIND, background: ORIENTED, mode: 'PB', laws: uniform })]
    const sampled = [20000, 80000].map(samples => maxDiff(lone[0]!, sampledBounceLinearization({ knit: knit3, background: ORIENTED, laws: uniform, samples, t: 0 })))
    const defect = Math.max(equivarianceDefect(lone[0]!, perms), equivarianceDefect(lone[1]!, perms))
    const invariants = invariantsOf(SPACE, lone).length
    const transport = readTransport(lone)
    const t3 = transport.three
    const always = [bounceLinearization({ kind: 'bounce', background: ORIENTED, mode: 'BP', laws: uniform }), bounceLinearization({ kind: 'bounce', background: ORIENTED, mode: 'PB', laws: uniform })]
    const alwaysTransport = readTransport(always)
    const reference = readTransport([orientedLinearization({ table: iso, background: ORIENTED, mode: 'PK', laws: uniform }), orientedLinearization({ table: iso, background: ORIENTED, mode: 'KP', laws: uniform })])
    const instrument = againstExisting < 1e-10 && (sampled[0] ?? 0) >= 3 * (sampled[1] ?? 1) && defect < 1e-10 && invariants === 6
    const isotropic = (t3.charge ?? 0) >= 3.5 && (t3.trace ?? 0) >= 3.5 && (t3.sound ?? 0) >= 3.5 && Math.abs((t3.shear ?? 0) - 2) <= 0.5
    const b7 = instrument && isotropic

    log('b7')

    const status = b1 && b2 && b3 && b4 && b5 && instrument ? (b6 && isotropic ? 'pass' : 'fail') : 'partial'
    const per = (xs: readonly number[]): string => xs.join(', ')
    const w8 = wakes[0]!
    const w12 = wakes[1]!

    return verdict({
      status,
      claim: `the lone bounce collision (the full lines turn as -1 and nothing else moves on a dock holding at most one single line, the isometric map elsewhere) needs no label, commutes with all 1,152 coin maps (${covarianceFailures} failures over ${docks.length} docks), is an involution keeping momentum, and leaves every living vacuum trit for trit as it was (${vacuumDifferences} differences); on the hub vacuum a lone love's wake is ${per(w8.love.worst)} trits per period on side 8 and ${per(w12.love.worst)} on side 12 (committed ${per(w8.committedLove)} and ${per(w12.committedLove)}), ${w8.love.bare} of 24 directions bare and 0 trits off the vibe's own line, against 8,896 under the isometric map; the linear transport keeps the isotropic husk law (charge ${t3.charge?.toFixed(2)}, trace ${t3.trace?.toFixed(2)}, sound ${t3.sound?.toFixed(2)}, shear ${t3.shear?.toFixed(2)}, crossover k ${transport.kc.toFixed(3)}), where turning every dock's full lines always (B) gives the same wake but a crossover k of ${alwaysTransport.kc.toFixed(4)}`,
      metrics: {
        docksExhaustive: exhaustive,
        docksChecked: docks.length,
        covarianceFailures,
        involutionFailures,
        momentumFailures,
        chargeConjugationFailures,
        docksWhereLDiffersFromK: differsFromK,
        kernelMismatchBeats: agreements.reduce((a, b) => a + b.mismatches, 0),
        kernelVetoes: agreements.reduce((a, b) => a + b.vetoed, 0),
        boxReverses: reverses ? 1 : 0,
        motionReversal: motion ? 1 : 0,
        chargeKept: chargeKept ? 1 : 0,
        vacuumDifferences,
        ...Object.fromEntries(wakes.flatMap(w => [
          ...w.love.worst.map((x, p) => [`side${w.side}LovePeriod${p + 1}`, x] as const),
          ...w.fear.worst.map((x, p) => [`side${w.side}FearPeriod${p + 1}`, x] as const),
          ...w.committedLove.map((x, p) => [`committedSide${w.side}LovePeriod${p + 1}`, x] as const),
          ...w.committedFear.map((x, p) => [`committedSide${w.side}FearPeriod${p + 1}`, x] as const),
          [`side${w.side}LoveBare`, w.love.bare] as const,
          [`side${w.side}FearBare`, w.fear.bare] as const,
          [`side${w.side}OffLine`, w.love.offLine + w.fear.offLine] as const,
        ])),
        alwaysBounceSide8Worst: Math.max(...alwaysBounce.worst),
        linearAgainstExisting: againstExisting,
        linearSampled20000: sampled[0] ?? -1,
        linearSampled80000: sampled[1] ?? -1,
        linearEquivarianceDefect: defect,
        linearInvariants: invariants,
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].map(q => [`lone_${q}_exponent3`, t3[q] ?? Number.NaN])),
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].map(q => [`lone_${q}_mean`, transport.means[q] ?? Number.NaN])),
        loneCrossoverK: transport.kc,
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].map(q => [`always_${q}_exponent3`, alwaysTransport.three[q] ?? Number.NaN])),
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].map(q => [`always_${q}_mean`, alwaysTransport.means[q] ?? Number.NaN])),
        alwaysCrossoverK: alwaysTransport.kc,
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].map(q => [`isometric_${q}_exponent3`, reference.three[q] ?? Number.NaN])),
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].map(q => [`isometric_${q}_mean`, reference.means[q] ?? Number.NaN])),
        isometricCrossoverK: reference.kc,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        isometricHubWakeSide8: 8896,
        alwaysBounceCrossoverK: alwaysTransport.kc,
      },
      notes: `L2. Gates: B1 ${b1}, B2 ${b2}, B3 ${b3}, B4 ${b4}, B5 ${b5}, B6 ${b6}, B7 ${b7} (instrument ${instrument}, isotropic ${isotropic}). Docks: ${exhaustive} exhaustive (every full-line set, with no single or one single on any free slot) plus 4,000 Weyl docks; L differs from K on ${differsFromK} of them. Wake per period (love; fear), side 8: ${per(w8.love.worst)}; ${per(w8.fear.worst)}, bare directions ${w8.love.bare} and ${w8.fear.bare}, per direction ${per(w8.love.perDirection)}; side 12: ${per(w12.love.worst)}; ${per(w12.fear.worst)}, bare ${w12.love.bare} and ${w12.fear.bare}; off the seed's line ${w8.love.offLine + w8.fear.offLine + w12.love.offLine + w12.fear.offLine} trits. Committed dressing side 8 ${per(w8.committedLove)}; ${per(w8.committedFear)}, side 12 ${per(w12.committedLove)}; ${per(w12.committedFear)}. B (always bounce) wake side 8 ${per(alwaysBounce.worst)}. Linearization: against the existing one with K ${againstExisting.toExponential(2)}, against sampling ${sampled.map(x => x.toFixed(4)).join(' -> ')} (20,000 -> 80,000), equivariance ${defect.toExponential(2)}, ${invariants} invariants. Uniform husk exponents (three rungs) L: charge ${t3.charge?.toFixed(2)}, trace ${t3.trace?.toFixed(2)}, sound ${t3.sound?.toFixed(2)}, shear ${t3.shear?.toFixed(2)}, crossover ${transport.kc.toFixed(4)}, means ${JSON.stringify(transport.means)}; K: ${JSON.stringify(reference.three)}, crossover ${reference.kc.toFixed(4)}, means ${JSON.stringify(reference.means)}; B: ${JSON.stringify(alwaysTransport.three)}, crossover ${alwaysTransport.kc.toFixed(4)}, means ${JSON.stringify(alwaysTransport.means)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
