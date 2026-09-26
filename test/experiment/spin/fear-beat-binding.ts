// The simplest rule that binds: two STAND-IN tokens on a husk line meeting through the fear beat.
//
// E-SPN-0061 found nothing in the knit binds two knots, and E-SPN-0068 finds why: the knit's positions are
// classical and nothing it conserves depends on a separation. A Yukawa attraction by exchanged pairs is exact in
// the Potts measure (E-FRC-0188) but it is a free energy, a count over histories, and no rule realizes it. This
// file asks the smallest question a rule can answer: do two tokens bind when the only interaction is the one the
// model already has, the fear beat at a meeting?
//
// THE RULE (code/rule/token-pair-line, exact in Z[omega][1/6]): each token is the fear walk (slots forward and back,
// the coin C = SWAP^(2/3)) with a role riding along; tokens on one dock in opposite slots meet through the fear
// beat on their roles, U = P_sym + omega P_anti for like vibes, V = 1 + (omega - 1) Phi Phi^+ for a love and a fear.
// A STAND-IN: the knit's own tokens have classical positions (E-SPN-0068), here the position carries amplitudes,
// which E-SPN-0066 says a covariantly moving token must have.
//
// THE STRUCTURAL REASON, derived before any run. U commutes with SWAP, so it is 1 on the 6 role-symmetric pairs and
// omega on the 3 role-antisymmetric pairs (the antisymmetric pair of two qutrits is an antirole: Lambda^2 C^3 = C^3*);
// V is omega on the meson singlet Phi and 1 on its 8-dimensional complement. So in every role channel the meeting
// is a pure CONTACT PHASE (omega or 1) on the relative states with both tokens on one dock in opposite slots, and
// the relative motion at total momentum K is W(K) = S(K) (C (x) C) M. Time is discrete, so quasi-energy lives on a
// circle and the free two-token continuum leaves gaps; a contact phase p != 1 puts a bound state in a gap exactly
// at the roots of det(1 - (p - 1) G(lambda)), a 2 x 2 determinant over the contact states (Ahlbrecht et al., New J.
// Phys. 14, 073050 (2012): molecular binding in interacting quantum walks). So the fear beat binds BY CONSTRUCTION
// in the channels where it acts, and cannot bind where it is 1.
//
// PREDICTIONS, written before this file ran. Probes (tmp/mb-probe-contact.ts at K = 0, pi/4, pi/2 on a ring of 48,
// tmp/mb-probe-pair.ts) had already shown bound states in the omega channel at those three K and the survival
// numbers at rings 32 and 64; the gates below extend them to every K and to the start ensemble.
// P1 Algebra: U commutes with SWAP and with g (x) g, V with g (x) conj(g), for all 216 Clifford g; U has eigenvalues
//    1 (6) and omega (3), V has omega (1) and 1 (8).
// P2 The rule is exact: the Eisenstein-integer run equals the float run to 1e-12, sum N(numerators) = D^2 exactly,
//    and the exact inverse returns the start.
// P3 With contact phase omega, at EVERY K of a ring of 48, W(K) has at least one exchange-symmetric and one
//    exchange-antisymmetric state below the particle-pair threshold (quasi-energy in (-2 pi/3, 0), where the two
//    tokens' particle branches start at 0 with the global phase e^(i pi/3) per token kept) at least 0.05 from the
//    infinite-ring continuum and with at least 0.99 of its weight within 4 docks; with phase 1 there is none.
// P4 Every such state is a root of the 2 x 2 contact determinant (|det| < 1e-9), a second method.
// P5 Channels in the full rule with roles (ring 64, beats 128 to 256, a pair started on one dock in opposite
//    slots): two loves in the role-antisymmetric channel (fermions: slots and space symmetric) and a love and a fear
//    in Phi stay within 4 docks with probability above 0.5; two loves in the role-symmetric channel (slots and
//    space antisymmetric) feel U = 1 and run EXACTLY as with no meeting (1e-12), and a love and a fear orthogonal to
//    Phi run exactly as with no meeting; and the measured long-time weight agrees within 0.05 with the prediction
//    from the bound states' overlaps plus a uniformly spread remainder.
// P6 Start ensemble: on a line every link start is pure gauge, and U commutes with G (x) G at one dock, so before
//    the pair can wrap the ring (31 beats on a ring of 64) the fixed-frame beat with each of the 17 members' links
//    gives the no-field position distribution to 1e-12 in both bound channels; the comoving beat, whose frames are
//    stored registers (winding mod the holonomy's order), does too (ring 16, 7 beats, every member).
//
// Gates (fixed with the predictions): G1 = P1, G2 = P2, G3 = P3, G4 = P4, G5 = P5, G6 = P6. Status pass if all hold.
//
// Depth L2: the interacting quantum walk molecule is known (Ahlbrecht et al. 2012); what is new is that the model's
// own coin and its own fear beat, exact in Eisenstein integers, supply it, and that the channels it binds are
// exactly the diquark (antirole) and the meson singlet.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { exactNormSum, exactPairBeat, exactPairBeatBack, exactPairState, pairIndex, type Kind } from '@/code/rule/token-pair-line'
import { OMEGA, ONE, contactDeterminant, continuumDistance, relativeSpectrum, relativeWalk, type Complex } from '@/code/measure/contact-bound'
import { meetingMatrix, pairRun, type M3 } from '@/code/measure/token-pair-run'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'

const SPECTRUM_RING = 48
const SURVIVAL_RING = 64
const NEAR = 4
const EXACT_RING = 6
const EXACT_BEATS = 12
const GAUGE_RING = 64
const GAUGE_BEATS = 31
const COMOVING_RING = 16
const COMOVING_BEATS = 7

type Start = { x1: number; x2: number; c1: number; c2: number; j1: number; j2: number; amp: Complex }

// a Clifford element as a unitary (the group is kept up to a unit; the first column fixes the scale)
function unitaryOf(k: number): M3 {
  const g = cliffordTable().group[k]!
  const vals = g.num.map(x => eisValue(x, 3 ** g.den3))
  let n2 = 0

  for (let c = 0; c < 3; c++) n2 += (vals[3 * c]![0] ?? 0) ** 2 + (vals[3 * c]![1] ?? 0) ** 2

  const f = 1 / Math.sqrt(n2)

  return { re: Float64Array.from(vals, v => v[0] * f), im: Float64Array.from(vals, v => v[1] * f) }
}

// the four contact starts, on dock x0
function channelStart(channel: 'likeA' | 'likeS' | 'phi' | 'phiPerp', x0: number): { kind: Kind; start: Start[] } {
  const h = 0.5
  const r3 = 1 / Math.sqrt(3)

  if (channel === 'likeA' || channel === 'likeS') {
    // role (|01> - |10>)/sqrt 2 with slots (|01> + |10>)/sqrt 2, or role symmetric with slots antisymmetric
    const roleSign = channel === 'likeA' ? -1 : 1
    const slotSign = channel === 'likeA' ? 1 : -1

    return {
      kind: 'like',
      start: [
        { x1: x0, x2: x0, c1: 0, c2: 1, j1: 0, j2: 1, amp: [h, 0] },
        { x1: x0, x2: x0, c1: 0, c2: 1, j1: 1, j2: 0, amp: [roleSign * h, 0] },
        { x1: x0, x2: x0, c1: 1, c2: 0, j1: 0, j2: 1, amp: [slotSign * h, 0] },
        { x1: x0, x2: x0, c1: 1, c2: 0, j1: 1, j2: 0, amp: [slotSign * roleSign * h, 0] },
      ],
    }
  }

  if (channel === 'phi') return { kind: 'unlike', start: [0, 1, 2].map(j => ({ x1: x0, x2: x0, c1: 0, c2: 1, j1: j, j2: j, amp: [r3, 0] as Complex })) }

  return { kind: 'unlike', start: [{ x1: x0, x2: x0, c1: 0, c2: 1, j1: 0, j2: 1, amp: [1, 0] }] }
}

const cm = (a: Complex, b: Complex): Complex => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]

export default experiment({
  id: 'spin/fear-beat-binding',
  code: 'E-SPN-0069',
  title:
    'the fear beat binds two tokens by construction, a STAND-IN, fail on one prediction: U = P_sym + omega P_anti and V = 1 + (omega - 1) Phi Phi^+ are pure contact phases in each role channel, and in discrete time a contact phase splits bound states off the two-token continuum at the roots of a 2 x 2 determinant (|det| under 2e-14); exact in Eisenstein integers, a pair is bound below the particle-pair threshold only for |K| < 2 pi/3 (33 of 48 momenta, not every K as predicted), by 0.50 and 0.25 per beat at K = 0 with 0.99 of its weight within 4 docks; two loves bind only in the role-antisymmetric (antirole) channel (0.74 stay within 4 docks, predicted 0.72) and a love and a fear only in the meson singlet (0.79, predicted 0.78), while the other channels run exactly as with no meeting; before a pair can wrap the ring every one of the 17 link starts gives the no-field motion under both beats',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- G1: the algebra of the meetings, all 216 Clifford elements ----
    const group = Array.from({ length: 216 }, (_, k) => unitaryOf(k))
    const u9 = meetingMatrix('like')
    const v9 = meetingMatrix('unlike')
    const kron = (p: M3, q: M3): { re: Float64Array; im: Float64Array } => {
      const re = new Float64Array(81)
      const im = new Float64Array(81)

      for (let a = 0; a < 9; a++) {
        for (let b = 0; b < 9; b++) {
          const x: Complex = [p.re[3 * Math.floor(a / 3) + Math.floor(b / 3)] as number, p.im[3 * Math.floor(a / 3) + Math.floor(b / 3)] as number]
          const y: Complex = [q.re[3 * (a % 3) + (b % 3)] as number, q.im[3 * (a % 3) + (b % 3)] as number]
          const z = cm(x, y)

          re[a * 9 + b] = z[0]
          im[a * 9 + b] = z[1]
        }
      }

      return { re, im }
    }
    const mm = (x: { re: Float64Array; im: Float64Array }, y: { re: Float64Array; im: Float64Array }): { re: Float64Array; im: Float64Array } => {
      const re = new Float64Array(81)
      const im = new Float64Array(81)

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          let sr = 0
          let si = 0

          for (let k = 0; k < 9; k++) {
            const z = cm([x.re[i * 9 + k] as number, x.im[i * 9 + k] as number], [y.re[k * 9 + j] as number, y.im[k * 9 + j] as number])

            sr += z[0]
            si += z[1]
          }

          re[i * 9 + j] = sr
          im[i * 9 + j] = si
        }
      }

      return { re, im }
    }
    const gap = (x: { re: Float64Array; im: Float64Array }, y: { re: Float64Array; im: Float64Array }): number => {
      let g = 0

      for (let i = 0; i < 81; i++) g = Math.max(g, Math.hypot((x.re[i] as number) - (y.re[i] as number), (x.im[i] as number) - (y.im[i] as number)))

      return g
    }
    const conjM = (p: M3): M3 => ({ re: Float64Array.from(p.re), im: p.im.map(x => -x) })
    const swap = { re: new Float64Array(81), im: new Float64Array(81) }

    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) swap.re[(3 * i + j) * 9 + 3 * j + i] = 1

    let commuteGap = gap(mm(u9, swap), mm(swap, u9))

    for (const g of group) {
      const gg = kron(g, g)
      const gc = kron(g, conjM(g))

      commuteGap = Math.max(commuteGap, gap(mm(u9, gg), mm(gg, u9)), gap(mm(v9, gc), mm(gc, v9)))
    }

    // eigenvalue counts from traces: tr U = 6 + 3 omega, tr V = 8 + omega
    const traceOf = (x: { re: Float64Array; im: Float64Array }): Complex => {
      let r = 0
      let i = 0

      for (let k = 0; k < 9; k++) {
        r += x.re[k * 10] as number
        i += x.im[k * 10] as number
      }

      return [r, i]
    }
    const tu = traceOf(u9)
    const tv = traceOf(v9)
    const traceGap = Math.max(Math.hypot(tu[0] - (6 + 3 * OMEGA[0]), tu[1] - 3 * OMEGA[1]), Math.hypot(tv[0] - (8 + OMEGA[0]), tv[1] - OMEGA[1]))
    const unitaryGap = Math.max(gap(mm(u9, { re: Float64Array.from({ length: 81 }, (_, k) => u9.re[(k % 9) * 9 + Math.floor(k / 9)] as number), im: Float64Array.from({ length: 81 }, (_, k) => -(u9.im[(k % 9) * 9 + Math.floor(k / 9)] as number)) }), { re: Float64Array.from({ length: 81 }, (_, k) => (k % 10 === 0 ? 1 : 0)), im: new Float64Array(81) }))
    const g1 = commuteGap < 1e-12 && traceGap < 1e-12 && unitaryGap < 1e-12

    log('g1')

    // ---- G2: the exact rule ----
    const exactChecks = (['like', 'unlike'] as Kind[]).map(kind => {
      const at = pairIndex(EXACT_RING, 2, 2, 0, 1, 0, 1)
      const ex = exactPairState({ ring: EXACT_RING, kind, start: [{ index: at, a: 1n, b: 0n }] })
      const fl = pairRun({ ring: EXACT_RING, kind, meeting: 'fixed', start: [{ x1: 2, x2: 2, c1: 0, c2: 1, j1: 0, j2: 1, amp: [1, 0] }] })
      let worst = 0

      for (let s = 0; s < EXACT_BEATS; s++) {
        exactPairBeat(ex)
        fl.beat()

        const d = Number(ex.denominator)

        for (let i = 0; i < ex.a.length; i++) {
          const v = eisValue([Number(ex.a[i]), Number(ex.b[i])], d)

          worst = Math.max(worst, Math.hypot(v[0] - (fl.re[i] as number), v[1] - (fl.im[i] as number)))
        }
      }

      const normIdentity = exactNormSum(ex) === ex.denominator * ex.denominator
      const forward = ex.denominator

      for (let s = 0; s < EXACT_BEATS; s++) exactPairBeatBack(ex)

      const reverses = ex.a.every((x, i) => (i === at ? x === forward * forward : x === 0n)) && ex.b.every(x => x === 0n)

      return { kind, worst, normIdentity, reverses, denominatorBits: forward.toString(2).length }
    })
    const g2 = exactChecks.every(c => c.worst < 1e-12 && c.normIdentity && c.reverses)

    log('g2')

    // ---- G3, G4: the bound band at every K ----
    const inAttractiveGap = (e: number): boolean => e > (-2 * Math.PI) / 3 && e < 0
    const perK = Array.from({ length: SPECTRUM_RING }, (_, s) => {
      const K = (2 * Math.PI * s) / SPECTRUM_RING
      const found = (phase: Complex): { energy: number; symmetric: number; near: number; distance: number; det: number; profile: Float64Array }[] =>
        relativeSpectrum({ ring: SPECTRUM_RING, momentum: K, phase, near: NEAR, keep: inAttractiveGap })
          .map(x => ({ ...x, distance: continuumDistance({ momentum: K, energy: x.energy }) }))
          .filter(x => x.distance > 0.05 && x.nearWeight >= 0.99)
          .map(x => {
            const d = contactDeterminant({ ring: SPECTRUM_RING, momentum: K, phase, energy: x.energy })

            return { energy: x.energy, symmetric: x.symmetric, near: x.nearWeight, distance: x.distance, det: Math.hypot(d[0], d[1]), profile: x.profile }
          })
      const bound = found(OMEGA)
      const control = found(ONE)
      // reported after the first run, not gated: compact states with phase omega in the OTHER gap, (-pi, -2 pi/3)
      const other = relativeSpectrum({ ring: SPECTRUM_RING, momentum: K, phase: OMEGA, near: NEAR, keep: e => e < (-2 * Math.PI) / 3 || e > (2 * Math.PI) / 3 })
        .filter(x => x.nearWeight >= 0.99 && continuumDistance({ momentum: K, energy: x.energy }) > 0.05).length

      return { K, bound, control, other }
    })
    const g3 = perK.every(k => k.bound.some(b => b.symmetric > 0.99) && k.bound.some(b => b.symmetric < -0.99) && k.control.length === 0)
    const worstDet = Math.max(...perK.flatMap(k => k.bound.map(b => b.det)))
    // the determinant is not small everywhere: its value mid-gap away from any bound state, at K = 0
    const midGapDet = (() => {
      const k0 = perK[0]!
      let best = 0

      for (let t = 1; t < 40; t++) {
        const e = (-2 * Math.PI * t) / (3 * 40)

        if (k0.bound.every(b => Math.abs(b.energy - e) > 0.05)) {
          const d = contactDeterminant({ ring: SPECTRUM_RING, momentum: 0, phase: OMEGA, energy: e })

          best = Math.max(best, Math.hypot(d[0], d[1]))
        }
      }

      return best
    })()
    const g4 = perK.every(k => k.bound.length > 0) && worstDet < 1e-9 && midGapDet > 1e-2
    const k0 = perK[0]!
    const bindingSym = -Math.max(...k0.bound.filter(b => b.symmetric > 0).map(b => b.energy))
    const bindingAnti = -Math.max(...k0.bound.filter(b => b.symmetric < 0).map(b => b.energy))
    // the size of the K = 0 symmetric bound state: the relative coordinate moves by 0 or 2 per beat, so a pair
    // started together lives on even distances; its weight at distance 0, 2, 4 and the decay per two docks
    const sym0 = k0.bound.filter(b => b.symmetric > 0).sort((a, b) => b.energy - a.energy)[0]
    const decay = sym0 ? Math.log((sym0.profile[2] as number) / (sym0.profile[4] as number)) : Number.NaN
    const weightBeyondOne = sym0 ? 1 - (sym0.profile[0] as number) - (sym0.profile[1] as number) : Number.NaN
    const oddWeight = sym0 ? [...sym0.profile].reduce((s, x, i) => s + (i % 2 === 1 ? x : 0), 0) : Number.NaN

    log('g3 g4')

    // ---- G5: channels in the full rule ----
    const survival = (channel: 'likeA' | 'likeS' | 'phi' | 'phiPerp', phase?: Complex): { mean: number; history: Float64Array } => {
      const { kind, start } = channelStart(channel, 0)
      const run = pairRun({ ring: SURVIVAL_RING, kind, meeting: 'fixed', start, phase })
      const T = 4 * SURVIVAL_RING
      const history = new Float64Array(T)
      let sum = 0
      let n = 0

      for (let t = 0; t < T; t++) {
        run.beat()
        history[t] = run.nearWeight(NEAR)

        if (t >= T / 2) {
          sum += history[t] as number
          n++
        }
      }

      return { mean: sum / n, history }
    }
    const likeA = survival('likeA')
    const likeS = survival('likeS')
    const likeFree = survival('likeS', ONE)
    const phi = survival('phi')
    const phiPerp = survival('phiPerp')
    const phiPerpFree = (() => {
      const { start } = channelStart('phiPerp', 0)
      const run = pairRun({ ring: SURVIVAL_RING, kind: 'like', meeting: 'fixed', start, phase: ONE })
      const T = 4 * SURVIVAL_RING
      const history = new Float64Array(T)

      for (let t = 0; t < T; t++) {
        run.beat()
        history[t] = run.nearWeight(NEAR)
      }

      return history
    })()
    const exactlyFree = Math.max(...likeS.history.map((x, t) => Math.abs(x - (likeFree.history[t] as number))), ...phiPerp.history.map((x, t) => Math.abs(x - (phiPerpFree[t] as number))))
    // the prediction from the bound states' overlaps with the start, K by K (the relative start at contact)
    const predicted = (slots: Complex[]): { bound: number; total: number } => {
      let bound = 0
      let boundNear = 0

      for (let s = 0; s < SURVIVAL_RING; s++) {
        const K = (2 * Math.PI * s) / SURVIVAL_RING
        const states = relativeSpectrum({ ring: SURVIVAL_RING, momentum: K, phase: OMEGA, near: NEAR, keep: e => continuumDistance({ momentum: K, energy: e, samples: 1000 }) > 0.05 }).filter(x => x.nearWeight > 0.9)

        for (const b of states) {
          // <b | phi0>, phi0 on (r 0, slots 01) and (r 0, slots 10)
          let or = 0
          let oi = 0

          ;[1, 2].forEach((k, i) => {
            const br = b.vector.re[k] as number
            const bi = b.vector.im[k] as number
            const p = slots[i] ?? [0, 0]

            or += br * p[0] + bi * p[1]
            oi += br * p[1] - bi * p[0]
          })

          const w = (or * or + oi * oi) / SURVIVAL_RING

          bound += w
          boundNear += w * b.nearWeight
        }
      }

      return { bound, total: boundNear + (1 - bound) * ((2 * NEAR + 1) / SURVIVAL_RING) }
    }
    const predA = predicted([
      [Math.SQRT1_2, 0],
      [Math.SQRT1_2, 0],
    ])
    const predPhi = predicted([
      [1, 0],
      [0, 0],
    ])
    const g5 = likeA.mean > 0.5 && phi.mean > 0.5 && exactlyFree < 1e-12 && Math.abs(likeA.mean - predA.total) < 0.05 && Math.abs(phi.mean - predPhi.total) < 0.05

    log('g5')

    // ---- G6: the start ensemble ----
    const moves = gridMoves()
    const table = cliffordTable()
    const members = startFamily(16)
    const linksOf = (member: (typeof members)[number], ring: number): M3[] =>
      Array.from({ length: ring }, (_, x) => {
        const g = member.start(x, moves.act.length)
        const perm = phaseMove(moves.act[g] ?? [])

        return group[table.indexOf(perm)] as M3
      })
    const distributions = (run: ReturnType<typeof pairRun>, ring: number): Float64Array => {
      const out = new Float64Array(ring)
      const block = ring * ring * 36

      for (let w = 0; w < run.windings * run.windings; w++) {
        for (let x1 = 0; x1 < ring; x1++) {
          for (let x2 = 0; x2 < ring; x2++) {
            const at = w * block + (x1 * ring + x2) * 36
            let p = 0

            for (let k = 0; k < 36; k++) p += (run.re[at + k] as number) ** 2 + (run.im[at + k] as number) ** 2

            out[(x2 - x1 + ring) % ring] = (out[(x2 - x1 + ring) % ring] as number) + p
          }
        }
      }

      return out
    }
    const ensemble = members.map(member => {
      let fixedGap = 0
      let comovingGap = 0
      let windings = 0
      let holonomyTrivial = true

      for (const channel of ['likeA', 'phi'] as const) {
        const { kind, start } = channelStart(channel, 3)
        const bigLinks = linksOf(member, GAUGE_RING)
        const free = pairRun({ ring: GAUGE_RING, kind, meeting: 'fixed', start })
        const fixed = pairRun({ ring: GAUGE_RING, kind, meeting: 'fixed', links: bigLinks, start })

        for (let t = 0; t < GAUGE_BEATS; t++) {
          free.beat()
          fixed.beat()

          const a = distributions(free, GAUGE_RING)
          const b = distributions(fixed, GAUGE_RING)

          fixedGap = Math.max(fixedGap, ...a.map((x, i) => Math.abs(x - (b[i] as number))))
        }

        const smallLinks = linksOf(member, COMOVING_RING)
        const freeSmall = pairRun({ ring: COMOVING_RING, kind, meeting: 'fixed', start })
        const comoving = pairRun({ ring: COMOVING_RING, kind, meeting: 'comoving', links: smallLinks, start })

        windings = comoving.windings
        holonomyTrivial = holonomyTrivial && windings === 1

        for (let t = 0; t < COMOVING_BEATS; t++) {
          freeSmall.beat()
          comoving.beat()

          const a = distributions(freeSmall, COMOVING_RING)
          const b = distributions(comoving, COMOVING_RING)

          comovingGap = Math.max(comovingGap, ...a.map((x, i) => Math.abs(x - (b[i] as number))))
        }
      }

      return { member: member.name, fixedGap, comovingGap, windings, holonomyTrivial }
    })
    const g6 = ensemble.every(e => e.fixedGap < 1e-12 && e.comovingGap < 1e-12)

    log('g6')

    // the determinant of W(K = 0) as a unitarity check of the relative walk
    const w0 = relativeWalk({ ring: 8, momentum: 0, phase: OMEGA })
    let unitaryDefect = 0

    for (let i = 0; i < w0.n; i++) {
      for (let j = 0; j < w0.n; j++) {
        let sr = 0
        let si = 0

        for (let k = 0; k < w0.n; k++) {
          const a: Complex = [w0.re[k * w0.n + i] as number, -(w0.im[k * w0.n + i] as number)]
          const b: Complex = [w0.re[k * w0.n + j] as number, w0.im[k * w0.n + j] as number]
          const z = cm(a, b)

          sr += z[0]
          si += z[1]
        }

        unitaryDefect = Math.max(unitaryDefect, Math.hypot(sr - (i === j ? 1 : 0), si))
      }
    }

    const ok = g1 && g2 && g3 && g4 && g5 && g6
    const boundCounts = perK.map(k => k.bound.length)
    const minDistance = Math.min(...perK.flatMap(k => k.bound.map(b => b.distance)))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `U and V commute with every Clifford frame change (gap ${commuteGap.toExponential(1)} over 216) and are contact phases per channel (tr U = 6 + 3 omega, tr V = 8 + omega); the rule runs exactly in Eisenstein integers (float gap ${Math.max(...exactChecks.map(c => c.worst)).toExponential(1)}, sum of numerator norms = D^2, exact reversal); with the phase omega ${boundCounts.filter(c => c >= 2).length} of the ${SPECTRUM_RING} momenta of a ring of 48 (every |K| below 2 pi/3) hold a bound state of each exchange parity below the particle-pair threshold (at least ${minDistance.toFixed(3)} from the continuum, 0.99 of the weight within 4 docks), ${boundCounts.filter(c => c === 1).length} hold one and ${boundCounts.filter(c => c === 0).length} (|K| above 2 pi/3) hold none, so the prediction of a bound state at EVERY K fails; each is a root of the contact determinant (|det| at most ${worstDet.toExponential(1)}, mid-gap ${midGapDet.toFixed(3)}), and phase 1 has none; at K = 0 the exchange-symmetric pair is bound by ${bindingSym.toFixed(4)} and the antisymmetric by ${bindingAnti.toFixed(4)} per beat (a token's rest energy pi/3 = 1.0472), the symmetric one holding ${sym0 ? ((sym0.profile[0] as number) + (sym0.profile[2] as number)).toFixed(3) : 'n/a'} of its weight within 2 docks and falling by a factor e^${decay.toFixed(2)} per 2 docks beyond; in the full rule two loves in the antirole channel stay within 4 docks with probability ${likeA.mean.toFixed(3)} (predicted ${predA.total.toFixed(3)}) and a love and a fear in the meson singlet ${phi.mean.toFixed(3)} (predicted ${predPhi.total.toFixed(3)}), while the role-symmetric loves (${likeS.mean.toFixed(3)}) and the non-singlet pair (${phiPerp.mean.toFixed(3)}) run exactly as with no meeting (gap ${exactlyFree.toExponential(1)}); over the 17 link starts the fixed-frame and comoving beats give the no-field distribution before the pair can wrap the ring (worst ${Math.max(...ensemble.map(e => Math.max(e.fixedGap, e.comovingGap))).toExponential(1)})`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        gate_G6: g6 ? 1 : 0,
        commuteGap,
        traceGap,
        exactFloatGapLike: exactChecks[0]?.worst ?? -1,
        exactFloatGapUnlike: exactChecks[1]?.worst ?? -1,
        exactDenominatorBitsLike: exactChecks[0]?.denominatorBits ?? -1,
        exactDenominatorBitsUnlike: exactChecks[1]?.denominatorBits ?? -1,
        boundStatesPerKMin: Math.min(...boundCounts),
        boundStatesPerKMax: Math.max(...boundCounts),
        boundMinContinuumDistance: minDistance,
        worstContactDeterminant: worstDet,
        midGapDeterminant: midGapDet,
        bindingSymmetricK0: bindingSym,
        bindingAntisymmetricK0: bindingAnti,
        symmetricDecayPerTwoDocks: decay,
        symmetricWeightBeyondOneDock: weightBeyondOne,
        symmetricOddWeight: oddWeight,
        ...(sym0 ? Object.fromEntries([0, 2, 4, 6].map(r => [`symmetricWeightAt${r}`, sym0.profile[r] as number])) : {}),
        momentaWithBothParities: boundCounts.filter(c => c >= 2).length,
        momentaWithNone: boundCounts.filter(c => c === 0).length,
        otherGapStatesTotal: perK.reduce((s, k) => s + k.other, 0),
        otherGapMomentaWithAny: perK.filter(k => k.other > 0).length,
        ...Object.fromEntries(k0.bound.map((b, i) => [`k0Bound${i}_energy`, b.energy])),
        survivalAntirole: likeA.mean,
        survivalAntirolePredicted: predA.total,
        survivalAntiroleBoundFraction: predA.bound,
        survivalSinglet: phi.mean,
        survivalSingletPredicted: predPhi.total,
        survivalSingletBoundFraction: predPhi.bound,
        survivalRoleSymmetric: likeS.mean,
        survivalNonSinglet: phiPerp.mean,
        exactlyFreeGap: exactlyFree,
        ensembleFixedGapWorst: Math.max(...ensemble.map(e => e.fixedGap)),
        ensembleComovingGapWorst: Math.max(...ensemble.map(e => e.comovingGap)),
        ensembleMembers: ensemble.length,
        ensembleNontrivialHolonomy: ensemble.filter(e => !e.holonomyTrivial).length,
        relativeWalkUnitaryDefect: unitaryDefect,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        phaseOneBoundStates: perK.reduce((s, k) => s + k.control.length, 0),
        noMeetingSurvivalLike: likeFree.mean,
        uniformNear: (2 * NEAR + 1) / SURVIVAL_RING,
      },
      notes: `L2, a STAND-IN (the token's position carries amplitudes, which the knit's tokens do not). Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}, G6 ${g6}. FIRST RUN (75 s), recorded as is: fail on G3 and G4. G3's prediction of a bound state below threshold at EVERY K was wrong: the attractive bound band exists for |K| < 2 pi/3 (33 of 48 momenta, both parities on 31) and is absent for |K| > 2 pi/3. G4's root clause held for every state found (|det| 1.5e-14 at most); it failed only on its clause repeating G3's existence at every K. Gates not moved; the second run reproduces every gated number, and the title was rewritten after the runs. At every K the phase omega also holds two compact states in the other gap (-pi, -2 pi/3), so the meeting always binds somewhere on the circle; the attractive band is the part below the particle-pair threshold. Added after the first run, reported and not gated: the compact states in the other gap (-pi, -2 pi/3) per K, the size readings on even distances (the first run's per-dock decay divided by the empty odd sublattice and read -130; the relative coordinate moves by 0 or 2 per beat), and the corrected size wording. Bound states per K: ${boundCounts.join(' ')}; other-gap states per K: ${perK.map(k => k.other).join(' ')}. K = 0 bound energies: ${k0.bound.map(b => `${b.energy.toFixed(5)} (P ${b.symmetric.toFixed(2)})`).join(', ')}. Ensemble (member: fixed gap, comoving gap, holonomy order on ring ${COMOVING_RING}): ${ensemble.map(e => `${e.member} ${e.fixedGap.toExponential(1)} ${e.comovingGap.toExponential(1)} ${e.windings}`).join('; ')}. DISCLOSED: probes before this file (tmp/mb-probe-contact.ts, tmp/mb-probe-pair.ts, tmp/mb-probe-pair2.ts) saw the bound states at K = 0, pi/4, pi/2, the survival at rings 32 and 64, the exact run, and a first design error: the comoving beat with frames held as registers (winding mod the holonomy's order) does NOT equal the no-field rule once a pair wraps the ring, because a stored frame is which-path information that stops two windings from interfering; the gauge argument holds only before any relative winding, which is why G6 is read before the pair can wrap. MEANING: the model's own fear beat binds two tokens, with no parameter and no rounding, because discrete time puts the two-token continuum on a circle with gaps and the meeting is a contact phase. It binds exactly the channels where the meeting is not 1: two loves only when their roles are antisymmetric, which is the antirole (a love pair binds into something with the role of a fear: a diquark, charge 2/3), and a love and a fear only in the meson singlet Phi. The binding is zero-range (a contact), strong (about half a rest energy at K = 0) and compact (0.99 of the weight within 4 docks), exists for pairs moving with |K| < 2 pi/3 and not above, and is not a Yukawa tail: the exchanged pair of E-FRC-0188 has no rule, and the meeting that binds here is the step where the signed whole makes its fears. Whether a depth D sets the range: the range here is the contact plus the walk's band, set by the coin's angle pi/3, and no D enters.`,
    })
  },
})
