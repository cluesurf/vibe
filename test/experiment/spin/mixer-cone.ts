// THE CAUSAL CONE OF THE STREAM WITH THE FRAME MIXER, AND HOW FAST A LONE HOLE CAN GO (E-SPN-0136). note/research/vibe/
// roadmap/remaining-pieces.md, "Auditing the candidate rule (E-SPN-0134)": under the candidate rule (flat links, the
// filled love sea, E-SPN-0130's fermionic frame mixer) a hole's keyed front reached 4 box steps in 8 beats against the
// working lineon's 8, ratio 0.5, and a love on the empty mesh under the mixer read 4 too. Is that the cone, or the weight
// at the front? How do the reach and the group speed depend on the mixer angle theta and on the coin's mass, and does a
// massless excitation reach c isotropically?
//
// THE LONE EXCITATION'S BEAT (code/measure/frame-cone). A lone hole keeps its frame: one beat is U = S P on the frame
// lattice, P the dock's 8 x 8 read from the rule itself (fermionMixBranch then coinBranch on one dock, exact in Z[w]/16),
// S the stream along the frame's eight roots. The float form C_n M_theta (a vibe) and Z conj(C_n M_theta) Z (a hole)
// extends P to any theta and to the fine coin's n (E-SPN-0107: zeta = e^(2 pi i/(3 n)), mass tan(pi/(3n)) -> 0).
//
// DERIVED BEFORE THE RUNS.
// 1. THE CONE. Every beat moves the excitation exactly one root (the stream moves every slot), so after t beats its
//    amplitude lies on sum n_a r_a with sum |n_a| <= t, the frame's cross-polytope. Its D4 dock distance
//    max(|v|_inf, |v|_1 / 2) is at most t, reached along the frame's own roots by the straight path alone (one history,
//    so no cancellation can remove it: amplitude (P_qq)^t, nonzero). So the reach is t, the cone, never above.
// 2. THE WEIGHT AT THE FRONT. The straight path's weight is |P_qq|^2 per beat per root; summed over the distance-t sites
//    it falls geometrically. A keyed path is one Born draw per beat, so its front sits where that weight is of order one
//    over the number of paths, far inside the cone. The working lineon's keyed front in the WORKING VACUUM moved at the
//    cone because that front is the vacuum's own disturbance (every vacuum vibe streams at c), not one excitation's
//    position; on the empty mesh a lone love without the mixer is one draw too. So the 0.5 is predicted to be a weight
//    effect of comparing one excitation's draw with a dense vacuum's front, not the mixer halving the reach.
// 3. THE GROUP VELOCITY IS INSIDE THE CONE. By Hellmann-Feynman on U(K) = S(K) P, dE/dK = sum_q |psi_q|^2 r_q, a convex
//    combination of the frame's eight roots. So along a unit direction u the top speed over c is at most
//    max_q (r_q . u) / sqrt 2: 1 along the frame's own roots, 1/sqrt 2 along the husk axes e1, e2, e3, and 1/2 along
//    e13 and e23, which are roots of the OTHER frames (the frame's body diagonals). A lone excitation never leaves its
//    frame (the mixer and the coin act inside it), so no theta and no mass can lift the e13 speed above c/2.
// 4. SO THE ANSWER TO THE LAST QUESTION IS NO, BY THE CONE: a massless excitation's top speed can at best fill its frame's
//    cross-polytope, which is anisotropic by a factor 2 inside the husk's 3d. F2 is predicted to FAIL at every theta and
//    mass, and the run measures by how much and whether the massless limit saturates the bound.
// 5. AT THETA = 0 each line is E-SPN-0107's walk: its top speed along its line is cos(pi/(3n)) (1/2 at the working coin,
//    c as n -> infinity), and its support stays on its line.
//
// GATES, fixed before the first run.
//  F1 the causal reach at the maximum is exactly t, never above: the exact hole walk (the rule's own P, working theta and
//     coin) holds a nonzero amplitude at D4 distance t and none beyond, for t = 1 .. 12, its norm exact (1 at every beat);
//     and along every husk direction its reach is exactly t times the cone bound.
//  F2 the top group velocity of the lone hole approaches c isotropically as the mass goes to 0: at the lightest coin run
//     (n = 64), for every theta run above 0 (2 pi/3, the working angle, pi/3 and pi/12), the top speed over the husk
//     directions e1, e2, e3, e12, e13, e23, e123 is at least 0.95 c in every direction AND its largest over its smallest
//     is at most 1.05.
// INSTRUMENT (a failure makes the verdict partial): the float dock matrix equals the rule's exact one to 1e-12 (vibe and
//  hole); the exact walk equals the rule's exact superposed run (fermionMixBranch then coinedVetoBeat 'none' on the flat
//  side-4 torus, the walk folded onto it) at every branch for 3 beats, up to one global unit per beat, for a hole in the
//  love sea and a love on the empty mesh; the Hellmann-Feynman velocity equals a central difference to 1e-6.
// CONTROLS (a failure makes the verdict partial).
//  C1 theta = 0 gives the lineon: its numeric top speed along its own line equals cos(pi/(3n)) to 1e-6 for every n run,
//     its float walk stays on its line, and at n = 64 it is within 5 percent of c along the line.
//  C2 E-SPN-0134's reach is reproduced: on the flat side-16 sea the hole's keyed front envelope over 8 paths reaches 4 box
//     steps at beat 8, and the working lineon's reaches 8.
// Verdict: partial if the instrument or a control fails; pass if F1 and F2 hold; fail otherwise.
// PREDICTED: fail on F2 alone, by the cone (the e13 speed at most c/2 at every theta and mass); F1 holds; the 0.5 is the
// weight at the front, and the amplitude's box-step front equals the working lineon's.
//
// FIRST RUN (tmp/normal-spn-run1.log, 45 s): FAIL on F2 alone, as derived; F1, the instrument and both controls hold.
//  - Instrument: the float dock matrices equal the rule's to 1.6e-16; the exact walk equals the rule's superposed run on
//    the side-4 torus at every branch for 3 beats (8, 64, 232 branches; the hole up to one Eisenstein unit per beat, the
//    sea's phase), Hellmann-Feynman against a central difference 1.1e-10.
//  - F1: exact reach 1, 2, .. 12 in t = 1 .. 12, never above, norm exact; along every husk direction the support
//    reaches exactly t times the cone bound (off 1.8e-15). The front's weight falls 0.578, 0.268, 0.115 .. 9.0e-5 at
//    t = 12, a ratio of 0.41 a beat. The amplitude's box-step front on side 16 is 2 4 6 8 8 8 8 8, the working lineon's
//    exactly. At theta 0 the support stays on the line (9 sites, 0 off it); every theta above 0 fills the frame's
//    cross-polytope (2,241 sites at t = 8), whatever its size: the reach does not depend on theta.
//  - F2: at n = 64 the top speed is 0.707 c on e1, e2, e3, 0.90 to 1.00 c on e12 (the hole's own root), 0.4999 c on e13
//    and e23, 0.75 to 0.81 on e123: least 0.4999 c, spread 1.80 to 2.00 for every theta. Every reading sits on or under
//    the cone bound (largest excess 1.1e-16), and the massless limit SATURATES it: 0.7070 against 0.7071, 0.4999 against
//    0.5. The mixer angle changes only the speeds inside the frame's own directions (e12 0.90 at 2 pi/3, 0.998 at
//    pi/12); the working coin (n = 1) caps everything near c/2 (0.50 to 0.65 at 2 pi/3).
//  - C1: at theta 0 the line speed is cos(pi/(3n)) to 1.1e-16 at every n, 0.9999 c at n = 64. C2: the audit's 4 and 8.
//  - A PREDICTION MISSED, disclosed: derivation 2 expected a lone love on the empty mesh WITHOUT the mixer to read as low
//    as the mixed hole, as one draw. It read 2 4 2 4 6 8 6 8. The box-step metric (Chebyshev in the box's basis) counts
//    a step along r_B = (1,1,0,0) as 2 and a step along (1,-1,0,0) or (0,0,1,-1) as 1, and saturates at side / 2 = 8:
//    the unmixed lineon's draw moves only along r_B, the mixed hole's draw spreads over the frame's four lines, half of
//    which count 1. So the 0.5 is the weight at the front measured in an anisotropic, saturating metric, not a halved
//    cone and not a slower amplitude: the amplitude's box front is the working lineon's beat for beat.
// Title written after the run.
//
// Depth L1 (the cone, exact in Z[w]) and L2 (the band: a coined quantum walk, a known construction). DETERMINISM: no random
// numbers; every choice is the key's integer. NOTHING MOVES: the mixer and the coin hand a value to another slot of the
// frame on its own dock; the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { boxSteps, fullPathKey, pathOffset, type PathKey } from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { lineFrame } from '@/code/measure/frame-meson'
import { placeVibes } from '@/code/measure/two-hub-bound'
import { fermionMixBranch, placeInSea, seaConfiguration } from '@/code/measure/pauli-mixer'
import { flatLinks, tablesOn } from '@/code/measure/link-holonomy'
import { lockstepFront } from '@/code/measure/candidate-audit'
import { bandPoint, coneBound, d4Steps, eNorm, exactWalk, floatWalk, frameMatrix, frameRoots, matrixGap, momentumOf, ruleFrameMatrix, topSpeeds, velocityCheck, type Eis, type Site } from '@/code/measure/frame-cone'
import { coinedVetoBeat, FRAME_SLOTS } from '@/code/rule/coined-locked-knit'
import { lockedState, mergeBranches, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box-integer'

const WALK_BEATS = 12
const CHECK_SIDE = 4
const CHECK_BEATS = 3
const FRONT_SIDE = 16
const FRONT_BEATS = 8
const FRONT_PATHS = 8
const GRID = 8
const SPEED_TOLERANCE = 0.05
const CLOSED_TOLERANCE = 1e-6
const MATRIX_TOLERANCE = 1e-12
const VELOCITY_TOLERANCE = 1e-6
const LOW_K = 0.1
const WORKING_THETA = (2 * Math.PI) / 3
const THETAS: readonly { name: string; theta: number }[] = [
  { name: '2pi/3', theta: WORKING_THETA },
  { name: 'pi/3', theta: Math.PI / 3 },
  { name: 'pi/12', theta: Math.PI / 12 },
  { name: '0', theta: 0 },
]
const COINS: readonly number[] = [1, 4, 16, 64]
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const HUSK: readonly { name: string; u: number[] }[] = [
  { name: 'e1', u: [1, 0, 0, 0] },
  { name: 'e2', u: [0, 1, 0, 0] },
  { name: 'e3', u: [0, 0, 1, 0] },
  { name: 'e12', u: [s2, s2, 0, 0] },
  { name: 'e13', u: [s2, 0, s2, 0] },
  { name: 'e23', u: [0, s2, s2, 0] },
  { name: 'e123', u: [s3, s3, s3, 0] },
]
// the Eisenstein units, for a global phase
const UNITS: readonly Eis[] = [
  [1n, 0n],
  [0n, 1n],
  [-1n, -1n],
  [-1n, 0n],
  [0n, -1n],
  [1n, 1n],
]

const eMul = (x: Eis, y: Eis): Eis => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]

export default experiment({
  id: 'spin/mixer-cone',
  code: 'E-SPN-0136',
  title:
    "the frame mixer keeps the light cone but confines a lone hole to its frame's cone, fail (F2): the exact walk of the rule's own dock matrix (equal to its superposed run at every branch) reaches exactly t in t beats, never more, and along every husk direction exactly t times the frame's cone bound; the front's weight falls 0.41 a beat, and the amplitude's box-step front is the working lineon's 2 4 6 8 exactly, so E-SPN-0134's 0.5 is the weight of one keyed draw measured in a metric that counts r_B double, not a halved reach; by Hellmann-Feynman the group velocity is a convex mix of the frame's eight roots, and as the coin's mass goes to 0 the top speed saturates that cone: 0.707 c on the husk axes, 0.90 to 1.00 c on the hole's own root, 0.4999 c on e13 and e23 (other frames' roots) at every theta, spread 1.8 to 2.0, so no mixer angle and no mass gives an isotropic c; at the working coin the top speed is 0.50 to 0.65 c, and theta 0 reproduces the lineon (cos(pi/3n), 0.9999 c at n = 64)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const B = rootIndex([1, 1, 0, 0])
    const F = lineFrame(B)
    const roots = frameRoots(F)
    const ss = FRAME_SLOTS[F] as readonly number[]
    const startQ = ss.indexOf(B)
    const keyOf = (path: number): PathKey => fullPathKey(pathOffset(path))
    const lineDir = HUSK.find(h => h.name === 'e12')!.u

    // ---------------- instrument ----------------
    const Ph = ruleFrameMatrix(F, true)
    const Pv = ruleFrameMatrix(F, false)
    const gapHole = matrixGap(Ph, frameMatrix(WORKING_THETA, 1, true))
    const gapVibe = matrixGap(Pv, frameMatrix(WORKING_THETA, 1, false))
    const cX = CHECK_SIDE
    const X4 = centerOf(cX)
    const fr4 = contactFresh(cX, 'pass', X4)
    const flat4 = tablesOn(fr4.weave, 'pass', flatLinks(fr4.weave))
    const fold = (sites: Map<string, Site>, side: number, from: number): Map<string, Eis> => {
      const c0 = d4BoxCoordinates({ cell: from, side })
      const m = new Map<string, Eis>()

      for (const s of sites.values()) {
        const cell = d4BoxCell({ coordinates: d4Coordinates(s.v).map((x, k) => x + (c0[k] as number)), side })

        s.amp.forEach((a, q) => {
          const key = `${cell},${ss[q]}`
          const o = m.get(key) ?? [0n, 0n]

          m.set(key, [o[0] + a[0], o[1] + a[1]])
        })
      }

      for (const [k, a] of m) if (a[0] === 0n && a[1] === 0n) m.delete(k)

      return m
    }
    const ruleCheck = (hole: boolean): { beats: string[]; ok: boolean } => {
      const start: Configuration = hole ? placeInSea(seaConfiguration(fr4.cells, 1), [{ dock: X4, slot: B, vibe: 0 }]) : placeInSea(seaConfiguration(fr4.cells, 0), [{ dock: X4, slot: B, vibe: 1 }])
      const walks: Map<string, Eis>[] = []

      exactWalk(hole ? Ph : Pv, roots, startQ, CHECK_BEATS, (t, sites) => (walks[t] = fold(sites, cX, X4)))

      let s: LockedState = lockedState(start)
      const beats: string[] = []
      let ok = true

      for (let t = 0; t < CHECK_BEATS; t++) {
        s = { branches: mergeBranches(s.branches.flatMap(b => fermionMixBranch(fr4.cells, b, false))) }
        s = coinedVetoBeat('none', flat4 as LockedTables, s, t)

        const w = walks[t + 1] as Map<string, Eis>
        const T = 16n ** BigInt(t + 1)
        const unit = UNITS.findIndex(u =>
          s.branches.every(br => {
            let where = ''

            for (let i = 0; i < br.vibe.length; i++) if ((br.vibe[i] !== 0) !== hole) where = `${Math.floor(i / 24)},${i % 24}`

            const want = eMul(u, w.get(where) ?? [0n, 0n])
            const scale = 1n << BigInt(br.k)

            return br.a * T === want[0] * scale && br.b * T === want[1] * scale
          }),
        )
        const same = unit >= 0 && s.branches.length === w.size

        ok = ok && same
        beats.push(`${s.branches.length}/${w.size} unit ${unit}`)
      }

      return { beats, ok }
    }
    const checkHole = ruleCheck(true)
    const checkVibe = ruleCheck(false)
    const PhF = frameMatrix(WORKING_THETA, 1, true)
    const velocityGap = Math.max(
      ...[
        [0.31, -1.07, 0.73, 2.03],
        [1.9, 0.2, -2.6, 0.45],
        [-0.8, 2.2, 1.3, -0.1],
      ].flatMap(k => HUSK.map(h => velocityCheck(PhF, roots, momentumOf(roots, k), h.u))),
    )
    const instrument = gapHole <= MATRIX_TOLERANCE && gapVibe <= MATRIX_TOLERANCE && checkHole.ok && checkVibe.ok && velocityGap <= VELOCITY_TOLERANCE

    log('instrument')

    // ---------------- F1: the exact cone ----------------
    const X16 = centerOf(FRONT_SIDE)
    const fr16 = contactFresh(FRONT_SIDE, 'pass', X16)
    const cells16 = fr16.cells
    const steps16 = boxSteps(cells16, FRONT_SIDE, X16)
    const reach: number[] = []
    const frontWeight: number[] = []
    const normExact: boolean[] = []
    const alongOff: number[] = []
    const amplitudeBoxFront: number[] = []
    const alongAtEnd: number[] = []

    exactWalk(Ph, roots, startQ, WALK_BEATS, (t, sites) => {
      let r = 0
      let front = 0n
      let total = 0n
      const along = HUSK.map(() => -Infinity)

      for (const s of sites.values()) {
        const d = d4Steps(s.v)
        let w = 0n

        for (const a of s.amp) w += eNorm(a)
        total += w
        r = Math.max(r, d)
        if (d === t) front += w
        HUSK.forEach((h, i) => (along[i] = Math.max(along[i] as number, s.v.reduce((x, y, k) => x + y * (h.u[k] as number), 0) / Math.SQRT2)))
      }

      const unit = 256n ** BigInt(t)

      reach.push(r)
      frontWeight.push(Number((front * 10n ** 18n) / unit) / 1e18)
      normExact.push(total === unit)
      alongOff.push(Math.max(...HUSK.map((h, i) => Math.abs((along[i] as number) - t * coneBound(roots, h.u)))))
      if (t === WALK_BEATS) along.forEach(x => alongAtEnd.push(x / t))
      if (t <= FRONT_BEATS) amplitudeBoxFront.push(Math.max(...[...fold(sites, FRONT_SIDE, X16).keys()].map(k => steps16[Number(k.split(',')[0])] as number)))
    })

    const F1 = reach.every((r, i) => r === i + 1) && frontWeight.every(x => x > 0) && normExact.every(Boolean) && alongOff.every(x => x <= 1e-12)
    const frontRatio = (frontWeight[WALK_BEATS - 1] as number) / (frontWeight[WALK_BEATS - 2] as number)

    // the reach by theta (float walk, working coin, 8 beats): D4 reach, and the support's reach along e3 over c t
    const thetaReach = THETAS.map(({ name, theta }) => {
      let r = 0
      let e3 = 0
      let sites = 0
      let offLine = 0

      floatWalk(frameMatrix(theta, 1, true), roots, startQ, FRONT_BEATS, (t, m) => {
        if (t !== FRONT_BEATS) return
        for (const s of m.values()) {
          let wgt = 0

          for (let q = 0; q < 8; q++) wgt += (s.re[q] as number) ** 2 + (s.im[q] as number) ** 2
          if (wgt === 0) continue
          sites++
          r = Math.max(r, d4Steps(s.v))
          e3 = Math.max(e3, (s.v[2] as number) / Math.SQRT2 / t)
          if (!(s.v[0] === s.v[1] && s.v[2] === 0 && s.v[3] === 0)) offLine++
        }
      })

      return { name, reach: r, e3, sites, offLine }
    })

    log('F1')

    // ---------------- F2: the top group speeds ----------------
    const dirs = HUSK.map(h => h.u)
    const speeds = THETAS.map(({ name, theta }) =>
      COINS.map(n => {
        const P = frameMatrix(theta, n, true)
        const top = topSpeeds(P, roots, dirs, GRID)
        const low = dirs.map(u => {
          const b = bandPoint(P, roots, u.map(x => x * LOW_K))

          return Math.max(...b.velocity.map(v => v.reduce((s, x, k) => s + x * (u[k] as number), 0))) / Math.SQRT2
        })

        log(`F2 theta ${name} n ${n}`)

        return { name, theta, n, top: top.speed, low }
      }),
    )
    const cone = dirs.map(u => coneBound(roots, u))
    const lightest = COINS[COINS.length - 1] as number
    const f2Rows = speeds.flat().filter(r => r.n === lightest && r.theta > 0)
    const f2Of = (top: number[]): { least: number; spread: number } => ({ least: Math.min(...top), spread: Math.max(...top) / Math.min(...top) })
    const F2 = f2Rows.every(r => {
      const x = f2Of(r.top)

      return x.least >= 1 - SPEED_TOLERANCE && x.spread <= 1 + SPEED_TOLERANCE
    })
    const aboveCone = Math.max(...speeds.flat().map(r => Math.max(...r.top.map((x, i) => x - (cone[i] as number)))))

    // ---------------- controls ----------------
    const lineIndex = HUSK.findIndex(h => h.name === 'e12')
    const lineon = speeds.find(rs => rs[0]!.theta === 0) as (typeof speeds)[number]
    const closedGap = Math.max(...lineon.map(r => Math.abs((r.top[lineIndex] as number) - Math.cos(Math.PI / (3 * r.n)))))
    const theta0 = thetaReach.find(r => r.name === '0')!
    const lightLine = lineon.find(r => r.n === lightest)!.top[lineIndex] as number
    const C1 = closedGap <= CLOSED_TOLERANCE && theta0.offLine === 0 && theta0.reach === FRONT_BEATS && lightLine >= 1 - SPEED_TOLERANCE

    const flat16 = tablesOn(fr16.weave, 'pass', flatLinks(fr16.weave))
    const vacuum16 = wordVacuum(fr16, fr16.store)
    const love16 = seaConfiguration(cells16, 1)
    const empty16 = seaConfiguration(cells16, 0)
    const envelope = (tables: LockedTables, start: Configuration, reference: Configuration, mix: boolean): number[] => {
      const out = new Array<number>(FRONT_BEATS).fill(-1)

      for (let path = 0; path < FRONT_PATHS; path++) {
        lockstepFront({ tables, start, reference, key: keyOf(path), beats: FRONT_BEATS, mix, steps: steps16 }).forEach((r, t) => (out[t] = Math.max(out[t] as number, r)))
      }

      return out
    }
    const frontWorking = envelope(fr16.tables, placeVibes(vacuum16, [{ dock: X16, slot: B, vibe: 1 }]), vacuum16, false)
    const frontHole = envelope(flat16, placeInSea(love16, [{ dock: X16, slot: B, vibe: 0 }]), love16, true)
    const frontBareLove = envelope(flat16, placeInSea(empty16, [{ dock: X16, slot: B, vibe: 1 }]), empty16, false)
    const C2 = frontHole[FRONT_BEATS - 1] === 4 && frontWorking[FRONT_BEATS - 1] === 8
    const amplitudeMatchesWorking = amplitudeBoxFront.every((r, t) => r === frontWorking[t])

    log('C2')

    // ---------------- verdict ----------------
    const controls = C1 && C2
    const status = !instrument || !controls ? 'partial' : F1 && F2 ? 'pass' : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const table = speeds
      .flat()
      .map(r => `theta ${r.name} n ${r.n}: top ${r.top.map(f4).join(' ')}; at |K| ${LOW_K} ${r.low.map(f4).join(' ')}`)
      .join(' | ')
    const metrics: Record<string, number> = {
      F1: F1 ? 1 : 0,
      F2: F2 ? 1 : 0,
      instrument: instrument ? 1 : 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      matrixGapHole: gapHole,
      matrixGapVibe: gapVibe,
      velocityGap,
      reachAtEnd: reach[WALK_BEATS - 1] as number,
      frontWeightAtEnd: frontWeight[WALK_BEATS - 1] as number,
      frontRatio,
      alongOff: Math.max(...alongOff),
      aboveCone,
      closedGap,
      lightLine,
      frontWorking8: frontWorking[FRONT_BEATS - 1] as number,
      frontHole8: frontHole[FRONT_BEATS - 1] as number,
      frontBareLove8: frontBareLove[FRONT_BEATS - 1] as number,
      amplitudeFront8: amplitudeBoxFront[FRONT_BEATS - 1] as number,
      amplitudeMatchesWorking: amplitudeMatchesWorking ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    }

    f2Rows.forEach(r => {
      const x = f2Of(r.top)

      metrics[`F2_${r.name}_least`] = x.least
      metrics[`F2_${r.name}_spread`] = x.spread
    })
    speeds.flat().forEach(r => HUSK.forEach((h, i) => (metrics[`top_${r.name}_n${r.n}_${h.name}`] = r.top[i] as number)))
    HUSK.forEach((h, i) => (metrics[`cone_${h.name}`] = cone[i] as number))

    return verdict({
      status,
      claim: `F1 ${F1} (exact reach ${reach.join(' ')} over t = 1 .. ${WALK_BEATS}, norm exact ${normExact.every(Boolean)}, front weight ${frontWeight.map(x => x.toExponential(2)).join(' ')}, ratio per beat ${f4(frontRatio)}; along the husk directions the support reaches t times the cone bound, off ${Math.max(...alongOff)}); F2 ${F2} (at n = ${lightest}: ${f2Rows.map(r => `theta ${r.name} least ${f4(f2Of(r.top).least)} c, spread ${f4(f2Of(r.top).spread)}`).join('; ')}; cone bound ${cone.map(f4).join(' ')} on ${HUSK.map(h => h.name).join(' ')}, largest excess over it ${aboveCone.toExponential(2)}); C1 ${C1} (closed form gap ${closedGap.toExponential(2)}, theta 0 off-line sites ${theta0.offLine}, line speed at n ${lightest} ${f4(lightLine)}); C2 ${C2} (keyed fronts over ${FRONT_PATHS} paths in box steps: working lineon ${frontWorking.join(' ')}, sea hole ${frontHole.join(' ')}, a love on the empty mesh WITHOUT the mixer ${frontBareLove.join(' ')}; the hole's amplitude ${amplitudeBoxFront.join(' ')})`,
      metrics,
      control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0, instrument: instrument ? 1 : 0 },
      notes: `L1/L2. Instrument: dock matrix gaps ${gapHole.toExponential(2)} (hole), ${gapVibe.toExponential(2)} (vibe); the rule's exact run against the folded walk (branches/walk entries, global unit index) hole ${checkHole.beats.join(', ')}, vibe ${checkVibe.beats.join(', ')}; velocity check ${velocityGap.toExponential(2)}. The support's reach over c t along ${HUSK.map(h => h.name).join(' ')} at t = ${WALK_BEATS}: ${alongAtEnd.map(f4).join(' ')}. Reach by theta at t = ${FRONT_BEATS} (working coin): ${thetaReach.map(r => `${r.name}: D4 ${r.reach}, e3 ${f4(r.e3)} c, ${r.sites} sites, ${r.offLine} off the line`).join('; ')}. Top speeds over c along ${HUSK.map(h => h.name).join(' ')}: ${table}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
