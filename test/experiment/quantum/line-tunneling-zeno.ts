// TUNNELING AND ZENO ON THE RULE'S LONE VIBE, ALONG A LINE (E-QTM-0187, quantum-coverage path 5, OPEN-QTM-07 and 10).
// Today tunneling is a stand-in on a hand-written Dirac walk (E-QTM-0056, 0073, 0082) and Zeno is open because a
// meeting is a finite step (E-QTM-0116, 0129, 0172). E-QTM-0157 showed the working rule's lone vibe on its line is the
// fear walk bit for bit (mass sqrt 3, top speed 1/2). This file explores whether the two rows can be read on that walk
// with the barrier and the readings made of the rule's own content, never a potential written into a separate walk.
//
// THE RULE: code/rule/coined-locked-knit coinedVetoBeat, veto 'none', tables on the pass contact, every link the
// identity, on the side-16 box, content only on the mesh line through the center along slot 0 (a ring of 16 docks;
// code/measure/line-barrier). By the line law (E-SPN-0098, E-QTM-0157 gate F) the other lines never reach it.
//
// READING 1, TUNNELING. A barrier is a region of the line the rule treats differently, standing long enough to be
// crossed. What the rule can put on a line (read off the code before this file, probes below): a closed vibe (the coin
// leaves a line holding a closed vibe untouched, so where it sits the open vibe streams uncoined), a stored pair (it
// releases its pair whenever its line is empty and takes one back when a love and a fear share an empty-store line),
// and links (pure gauge on a line: E-QTM-0157 E1, the lone vibe is the fear walk on every start's links before the
// wrap). The coin itself is the same on every dock, so the rule has no mass or clock-rate step. A barrier must then be
// a closed vibe that rests, or a wall of stored pairs that outlives its crossing.
// DERIVED: a closed vibe has no coin and the knit streams every slot one dock a beat, so it never rests. A wall of W
// stores releases all W pairs at beat 1 (every line empty); at beat 2 each interior dock takes back the fear from its
// left neighbour and the love from its right, while the two edge vibes leave; so the stores at beat 2m are W - 2m and
// the wall is gone at beat W, its edges receding half a dock a beat. With no edge (the whole ring stored) nothing leaves:
// the line vacuum, period 2.
//
// READING 2, DISCRETE-TIME ZENO (the law, code/measure/discrete-zeno, stated before any run). A reading every k beats of
// "is it still psi" leaves S(N, k) = |a(k)|^(2N) after N readings over T = N k beats, a(k) = <psi|U^k|psi>, a decay
// rate Gamma(k) = -ln |a(k)|^2 / k per beat. With quasi-energy weights p(W), Gamma(k) = k Var_p(W) + O(k^3) while
// k sqrt(Var) is small: more frequent readings slow the decay, linearly in the interval. Continuous time lets k -> 0
// and Gamma -> 0, the freeze. A beat is the shortest interval, so the floor is Gamma(1) = -ln |a(1)|^2 ~ Var_p(W) per
// beat, zero only on a single quasi-energy. That floor is where Vibe departs from continuous quantum mechanics.
//  (a) THE SLOT TRANSITION, on the rule: the line's two slots are the walk's two-level system. At momentum 0 the beat on
//      (right, left) is a + b X with a = (1 + w)/2, b = (1 - w)/2, eigenvalues 1 and w, so <R|U^k|R> = (1 + w^k)/2:
//      survival 1/4 per reading for k not a multiple of 3, 1 for k a multiple of 3. At momentum pi the beat is minus that.
//      So the slot never sits in a Zeno regime: its one-beat change is already 3/4, the floor is ln 4 per beat, and a
//      reading every beat or two speeds the change up (anti-Zeno), while readings every third beat find it back home.
//  (b) A SLOW TRANSITION, a packet of the walk's upper band at q0 = pi/2 (top group speed 1/2) of momentum spread
//      1/(2 sigma): Var(W) ~ (1/2)^2 / (4 sigma^2) = 1/(16 sigma^2) (W'' = 0 there), so Gamma(k) ~ k / (16 sigma^2) and
//      the floor Gamma(1) ~ 1/(16 sigma^2).
// READINGS. No piece of the rule reads the lone vibe's slot or packet on a line: a passing closed vibe leaves the same
// environment in every branch (gate M). So the readings here are ideal (STAND-INS), on the rule's exact state in (a)
// and on the walk in (b). The law and its floor depend only on the reading interval, which is the claim.
//
// GATES, fixed before the first run:
//  T0 instrument: the rule's lone open love (center, forward) in the empty line equals walkBeat(FEAR_COIN) bit for bit
//     at every beat 1..16
//  T1 closed vibes never rest: a lone closed love and fear, forward and back (4 runs, 16 beats) move one dock every beat
//  T2 every wall of W = 2, 4, 6, 8 closed stores (from dock 4) holds exactly W - 2m stores at beat 2m, for 2m <= W
//     (gone at beat W); control: the whole ring stored holds 16 stores at every even beat to 16 (the line vacuum rests)
//  M  a meeting is not a reading: the open love (center, forward) with a closed fear coming back from dock 4 keeps one
//     environment in every branch at every beat 1..16 (purity 1)
//  Z1 on the rule, q = 0 (amplitude 1 on every dock's forward slot) and q = pi ((-1)^dock), slot readings every
//     k = 1, 2, 3, 4, 6, 12 beats over 12 beats: survival exactly (1/4)^(12/k) for k = 1, 2, 4 and exactly 1 for 3, 6, 12
//  Z2d control: a single-momentum state has |a(k)|^2 = 1 within 1e-12, k = 1..64
//  Z2e instrument: the packet sigma = 16 run in position (the walk, ring 2048) gives a(k) within 1e-9 of the momentum
//      read, k = 1..64
//  Z2a the law: for sigma = 8, 16, 32, 64 (ring 2048), Gamma(k) / (k Var(W)) within 2% of 1 for every k with
//      k sqrt(Var) <= 0.1
//  Z2b Zeno: Gamma(k) strictly rises with k over the same k (more frequent readings decay slower)
//  Z2c the floor: Gamma(1) > 0 and Gamma(1) 16 sigma^2 within 2% of 1 on every sigma
// BARRIER, fixed: a barrier exists iff some T1 vibe rests a beat or some T2 wall keeps a store past beat W.
// VERDICT, fixed: FAIL if T0, Z1, Z2d or Z2e fail (the instrument or the derivation), or if any of Z2a, Z2b, Z2c fails
//  (the law). Otherwise PARTIAL: the Zeno law and its floor hold, readings stand-ins; tunneling has no barrier on a
//  line (or, if one is found, its transmission is left open). PASS is not reachable in this file. Predicted: PARTIAL,
//  no barrier.
// REPORTED, NOT GATED: the line vacuum as a medium (the open love in the whole-ring vacuum, 16 beats): environments
//  and the love's purity per beat (the vacuum records the love where M's passing vibe does not); Gamma(k) at q0 = 0;
//  the floor in physical units if a beat is one Planck time, for a packet with spread 1 micro-eV.
//
// PROBES BEFORE THIS FILE, DISCLOSED: tmp/qtm187-probe1.ts (a closed love on the love's line, forward and back: it
// streams every beat and the love passes with the coin skipped where they share the line), tmp/qtm187-probe2.ts (walls
// of W = 4 and the whole ring: the wall is down to 2 stores at beat 2 and 0 at beat 4; the whole ring alternates
// 16 stores and 32 vibes; the open love in it leaves a trail of closed loves that differs between its branches).
//
// FIRST RUN 2026-10-24 (281 s): PARTIAL as predicted, but two gates failed and the barrier flag fired, none moved,
//  title and claim written after the run. T0, T1, Z1, Z2a to Z2e hold. T2 failed on W = 8 (4 stores at beat 6, not 2)
//  and the barrier flag fired on W = 4, 6, 8 (stores back at beats 8 to 12): on the 16-dock ring the wall's own released
//  vibes meet round the ring and are stored again. Reported after the run, not a gate: on the 32-dock ring (side 32,
//  tmp/qtm187-probe3.ts) every wall follows W - 2m exactly and is gone at beat W, stores coming back only at beats 14 to
//  16, when the vibes have gone round. So no wall rests; the fixed flag reads the ring, not a barrier. M failed: the
//  probe had passed a closed LOVE (like vibes pass, nothing recorded), but the gate's closed FEAR, meeting the open love
//  on a line with an empty store, is stored with it as a pair in the branches where they share the line, so the
//  environment differs (4 environments, the love's purity down to 0.399). An unlike meeting reads the lone vibe's
//  position; a like one does not. That is a reading made of the rule's own content, left for the next file (a stream
//  of closed fears at a set spacing reads the love at a set interval).
//
// DETERMINISM: no random number. The rule is exact in Z[w][1/2]; Z1 compares exact norms; Z2 is in floats (the walk's
// symbol from the rule's coin). Depth L2: the Zeno law of a discrete-time walk (known physics in form), measured with
// the rule's lone vibe and a control; the tunneling half is a structural negative about the rule's line content.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  closedVibeTrack,
  lineBeat,
  lineBox,
  lineConfiguration,
  matchesFearWalk,
  openVibePurity,
  storeWallRun,
  type LineBox,
  type LineStore,
} from '@/code/measure/line-barrier'
import {
  gaussianPacket,
  overlap,
  packetAmplitude,
  packetPhases,
  packetState,
  phaseVariance,
  readSlot,
  walkBeatComplex,
  zenoRate,
} from '@/code/measure/discrete-zeno'
import { FEAR_COIN, walkBeat, walkStart } from '@/code/rule/fear-walk'
import {
  lockedNorm,
  lockedState,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'

const SIDE = 16
const SLOT = 0
const BEATS = 16
const WALLS = [2, 4, 6, 8]
const WALL_FROM = 4
const Z1_BEATS = 12
const Z1_K = [1, 2, 3, 4, 6, 12]
const RING = 2048
const SIGMAS = [8, 16, 32, 64]
const K_MAX = 64
const Q0 = Math.PI / 2
const HBAR_EV_S = 6.582119569e-16
const PLANCK_TIME_S = 5.391247e-44

// the rule's lone love against the fear walk, every beat (T0)
function walkIdentity(box: LineBox): boolean {
  let s = lockedState(
    lineConfiguration(box, [{ dock: 0, forward: true, value: 1, open: true }], []),
  )
  let walk = walkStart(box.cells.length, 0, true)
  let ok = true

  for (let t = 1; t <= BEATS; t++) {
    s = lineBeat(box, s, t - 1)
    walk = walkBeat(walk, () => FEAR_COIN)
    ok &&= matchesFearWalk(box, s, walk, t)
  }

  return ok
}

// purity and environments of the open love among the given content, per beat
function openRun(
  box: LineBox,
  others: Parameters<typeof lineConfiguration>[1],
  stores: readonly LineStore[],
): { purity: number[]; environments: number[]; branches: number[] } {
  let s = lockedState(
    lineConfiguration(
      box,
      [{ dock: 0, forward: true, value: 1, open: true }, ...others],
      stores,
    ),
  )
  const purity: number[] = []
  const environments: number[] = []
  const branches: number[] = []

  for (let t = 1; t <= BEATS; t++) {
    s = lineBeat(box, s, t - 1)

    const p = openVibePurity(box, s)

    purity.push(p.purity)
    environments.push(p.environments)
    branches.push(s.branches.length)
  }

  return { purity, environments, branches }
}

// survival of the forward slot under slot readings every k beats, on the rule, exact: [numerator, denominator]
function slotSurvival(
  box: LineBox,
  sign: (dock: number) => 1 | -1,
  k: number,
): { ratio: [bigint, bigint]; unread: [bigint, bigint][] } {
  const n = box.cells.length
  const start: LockedState = {
    branches: Array.from({ length: n }, (_, dock) => {
      const b = lockedState(
        lineConfiguration(box, [{ dock, forward: true, value: 1, open: true }], []),
      ).branches[0]!

      return { ...b, a: BigInt(sign(dock)), b: 0n, k: 0 }
    }),
  }
  const n0 = lockedNorm(start)

  let s = start

  const unread: [bigint, bigint][] = []

  for (let t = 1; t <= Z1_BEATS; t++) {
    s = lineBeat(box, s, t - 1)

    if (k === Z1_BEATS) {
      const r = lockedNorm(readSlot(box, s, true))

      unread.push([r.total * n0.unit, r.unit * n0.total])
    }

    if (t % k === 0) {
      s = readSlot(box, s, true)
    }
  }

  const end = lockedNorm(s)

  return { ratio: [end.total * n0.unit, end.unit * n0.total], unread }
}

export default experiment({
  id: 'quantum/line-tunneling-zeno',
  code: 'E-QTM-0187',
  title:
    "tunneling and Zeno on the rule's lone vibe along a line, partial: the rule puts no resting barrier on a line (closed vibes stream every beat, a wall of W stored pairs holds W - 2m at beat 2m and is gone at beat W, exact on 3 of 4 walls on the 16-dock ring, where the wall's own vibes meet round the ring, and on 4 of 4 on 32 docks; only the edgeless line vacuum rests, and it reads the vibe, purity 0.25 by beat 16), so tunneling stays a stand-in; the discrete Zeno law holds on the walk, Gamma(k) = k Var(W) within 1e-5 and rising with the reading interval, floor Gamma(1) 16 sigma^2 = 0.997 to 1.000 at one reading a beat; the rule's slot transition (exact, survival 1/4 per reading unless k is a multiple of 3, then 1) has no Zeno regime; readings are ideal stand-ins, though a closed fear meeting the vibe is stored with it and reads its position (purity 0.40), a like vibe does not",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const family = startFamily(16)

    const rule = withStart(family[0]!, () => {
      const box = lineBox(SIDE, SLOT)
      const n = box.cells.length

      // ---- T0 ----
      const t0 = walkIdentity(box)

      // ---- T1 ----
      const kinds = [
        { value: 1 as const, forward: true },
        { value: 1 as const, forward: false },
        { value: -1 as const, forward: true },
        { value: -1 as const, forward: false },
      ]
      const tracks = kinds.map(kind =>
        closedVibeTrack(box, { dock: 4, forward: kind.forward, value: kind.value, open: false }, BEATS),
      )
      const rests = tracks.map(tr =>
        tr.docks.slice(1).filter((d, i) => {
          const prev = tr.docks[i]!
          const step = (((d - prev) % n) + n) % n

          return d < 0 || (step !== 1 && step !== n - 1)
        }).length,
      )
      const t1 =
        rests.every(r => r === 0) &&
        tracks.every(tr => tr.branchesMax === 1 && tr.offLine === 0)

      // ---- T2 ----
      const walls = WALLS.map(w => storeWallRun(box, WALL_FROM, w, BEATS))
      const wallLaw = walls.map((run, i) => {
        const w = WALLS[i]!

        let ok = run.branchesMax === 1 && run.offLine === 0

        for (let m = 0; 2 * m <= w; m++) {
          ok &&= run.stores[2 * m] === w - 2 * m
        }

        return ok
      })
      const outlives = walls.map((run, i) => {
        const w = WALLS[i]!

        // a store kept past beat W, read up to the beat the edge vibes could meet round the ring
        const horizon = Math.min(BEATS, w + Math.floor((n - w) / 2) - 1)

        return run.stores.slice(w + 1, horizon + 1).some(x => x > 0)
      })
      const whole = storeWallRun(box, 0, n, BEATS)
      const wholeRests = whole.stores.every((x, t) => (t % 2 === 0 ? x === n : x === 0))
      const t2 = wallLaw.every(Boolean) && wholeRests

      // ---- M ----
      const meeting = openRun(box, [{ dock: 4, forward: false, value: -1, open: false }], [])
      const m =
        meeting.environments.every(e => e === 1) &&
        meeting.purity.every(p => Math.abs(p - 1) < 1e-12)

      // ---- the line vacuum as a medium (reported) ----
      const vacuum = openRun(
        box,
        [],
        Array.from({ length: n }, (_, dock) => ({ dock, tau: 1 as const })),
      )

      // ---- Z1 ----
      const signs: [string, (d: number) => 1 | -1][] = [
        ['q0', () => 1],
        ['qpi', d => (d % 2 === 0 ? 1 : -1)],
      ]
      const z1Runs = signs.map(([name, sign]) => ({
        name,
        byK: Z1_K.map(k => ({ k, ...slotSurvival(box, sign, k) })),
      }))
      const z1 = z1Runs.every(r =>
        r.byK.every(({ k, ratio }) => {
          const expectOne = k % 3 === 0
          const num = expectOne ? 1n : 1n
          const den = expectOne ? 1n : 4n ** BigInt(Z1_BEATS / k)

          return ratio[0] * den === ratio[1] * num
        }),
      )
      const unread = z1Runs[0]!.byK.find(r => r.k === Z1_BEATS)!.unread

      return {
        n,
        t0,
        t1,
        rests,
        t2,
        wallLaw,
        outlives,
        walls,
        wholeRests,
        m,
        meeting,
        vacuum,
        z1,
        z1Runs,
        unread,
      }
    })

    // ---- Z2 ----
    const perSigma = SIGMAS.map(sigma => {
      const p = gaussianPacket(RING, Q0, 1 / (2 * sigma), 0)
      const phases = packetPhases(p)
      const v = phaseVariance(p, phases)
      const gamma = Array.from({ length: K_MAX }, (_, i) =>
        zenoRate(packetAmplitude(p, i + 1, phases), i + 1),
      )
      const small = gamma
        .map((g, i) => ({ k: i + 1, g }))
        .filter(({ k }) => k * Math.sqrt(v) <= 0.1)
      const lawWorst = Math.max(...small.map(({ k, g }) => Math.abs(g / (k * v) - 1)))
      const rises = small.every(({ g }, i) => i === 0 || g > small[i - 1]!.g)
      const floor = gamma[0]!

      return { sigma, v, gamma, kSmall: small.length, lawWorst, rises, floor, floorScaled: floor * 16 * sigma * sigma }
    })
    const z2a = perSigma.every(r => r.kSmall >= 1 && r.lawWorst <= 0.02)
    const z2b = perSigma.every(r => r.rises)
    const z2c = perSigma.every(r => r.floor > 0 && Math.abs(r.floorScaled - 1) <= 0.02)

    // Z2d: one momentum
    const eigen = gaussianPacket(RING, Q0, 0, 0)
    const eigenPhases = packetPhases(eigen)
    const eigenWorst = Math.max(
      ...Array.from({ length: K_MAX }, (_, i) => {
        const a = packetAmplitude(eigen, i + 1, eigenPhases)

        return Math.abs(a[0] * a[0] + a[1] * a[1] - 1)
      }),
    )
    const z2d = eigenWorst < 1e-12

    // Z2e: the packet in position
    const p16 = gaussianPacket(RING, Q0, 1 / 32, 0)
    const ph16 = packetPhases(p16)
    const psi0 = packetState(p16)

    let psi = psi0
    let positionWorst = 0

    for (let k = 1; k <= K_MAX; k++) {
      psi = walkBeatComplex(psi)

      const a = overlap(psi0, psi)
      const b = packetAmplitude(p16, k, ph16)

      positionWorst = Math.max(positionWorst, Math.hypot(a[0] - b[0], a[1] - b[1]))
    }

    const z2e = positionWorst < 1e-9

    // reported: the band bottom
    const bottom = gaussianPacket(RING, 0, 1 / 32, 0)
    const bottomPhases = packetPhases(bottom)
    const bottomVar = phaseVariance(bottom, bottomPhases)
    const bottomGamma = [1, 2, 4, 8].map(k => zenoRate(packetAmplitude(bottom, k, bottomPhases), k))

    // reported: the floor in physical units if one beat is one Planck time, packet spread 1 micro-eV
    const omega = 1e-6 / HBAR_EV_S
    const floorPerSecond = omega * omega * PLANCK_TIME_S

    const barrier = rule.rests.some(r => r > 0) || rule.outlives.some(Boolean)
    const instrument = rule.t0 && rule.z1 && z2d && z2e
    const law = z2a && z2b && z2c
    const status = !instrument || !law ? 'fail' : 'partial'
    const s16 = perSigma.find(r => r.sigma === 16)!

    return verdict({
      status,
      claim: `on its line the rule's lone vibe is the fear walk (${rule.t0}); barrier flag ${barrier}: closed vibes rest ${rule.rests.join(', ')} beats of 16, walls of W = ${WALLS.join(', ')} stores hold W - 2m at beat 2m (${rule.wallLaw.join(', ')}), stores back after W on ${rule.outlives.filter(Boolean).length} of 4 walls of this 16-dock ring, the edgeless line vacuum rests (${rule.wholeRests}); a passing closed fear leaves one environment every beat: ${rule.m} (up to ${Math.max(...rule.meeting.environments)}, purity down to ${Math.min(...rule.meeting.purity).toFixed(3)}); the rule's slot transition under slot readings every k beats survives exactly 1/4 per reading for k = 1, 2, 4 and 1 for k = 3, 6, 12 on q = 0 and pi (${rule.z1}), no Zeno regime; a packet's decay follows Gamma(k) = k Var(W) within ${(100 * Math.max(...perSigma.map(r => r.lawWorst))).toFixed(2)}% and rises with k (${z2b}), with the floor Gamma(1) 16 sigma^2 = ${perSigma.map(r => r.floorScaled.toFixed(4)).join(', ')} for sigma = ${SIGMAS.join(', ')}`,
      metrics: {
        walkIdentity: rule.t0 ? 1 : 0,
        closedRestBeatsMax: Math.max(...rule.rests),
        wallLawHolds: rule.wallLaw.filter(Boolean).length,
        wallOutlives: rule.outlives.filter(Boolean).length,
        lineVacuumRests: rule.wholeRests ? 1 : 0,
        meetingEnvironmentsMax: Math.max(...rule.meeting.environments),
        meetingPurityMin: Number(Math.min(...rule.meeting.purity).toFixed(12)),
        vacuumEnvironmentsAt16: rule.vacuum.environments[BEATS - 1]!,
        vacuumPurityAt16: Number(rule.vacuum.purity[BEATS - 1]!.toFixed(6)),
        slotRuleExact: rule.z1 ? 1 : 0,
        slotFloorPerBeat: Number(Math.log(4).toFixed(6)),
        zenoLawWorst: Number(Math.max(...perSigma.map(r => r.lawWorst)).toExponential(3)),
        floorSigma8: Number(perSigma[0]!.floor.toExponential(4)),
        floorSigma16: Number(s16.floor.toExponential(4)),
        floorSigma32: Number(perSigma[2]!.floor.toExponential(4)),
        floorSigma64: Number(perSigma[3]!.floor.toExponential(4)),
        floorPlanckMicroEvPerSecond: Number(floorPerSecond.toExponential(3)),
      },
      control: {
        eigenstateWorst: Number(eigenWorst.toExponential(2)),
        positionVersusMomentumWorst: Number(positionWorst.toExponential(2)),
        lineVacuumStoresEveryEvenBeat: rule.n,
      },
      notes: `L2. Gates: T0 ${rule.t0}, T1 ${rule.t1}, T2 ${rule.t2}, M ${rule.m}, Z1 ${rule.z1}, Z2a ${z2a}, Z2b ${z2b}, Z2c ${z2c}, Z2d ${z2d}, Z2e ${z2e}; barrier ${barrier}. Ring ${rule.n} docks. Wall stores by beat: ${rule.walls.map((w, i) => `W ${WALLS[i]}: ${w.stores.join(' ')}`).join('; ')}. Unread slot survival on the rule, q = 0, beats 1..12: ${rule.unread.map(([a, b]) => `${a}/${b}`).join(' ')}. Slot survival by k (q0, qpi): ${rule.z1Runs.map(r => `${r.name} ${r.byK.map(x => `k${x.k} ${x.ratio[0]}/${x.ratio[1]}`).join(', ')}`).join('; ')}. The open love in the line vacuum, environments by beat: ${rule.vacuum.environments.join(' ')}; purity: ${rule.vacuum.purity.map(p => p.toFixed(4)).join(' ')}; branches: ${rule.vacuum.branches.join(' ')}. The passing fear: branches ${rule.meeting.branches.join(' ')}. Packets at q0 = pi/2: ${perSigma.map(r => `sigma ${r.sigma}: Var ${r.v.toExponential(4)}, k used ${r.kSmall}, worst ${r.lawWorst.toExponential(2)}, Gamma(1..4) ${r.gamma.slice(0, 4).map(g => g.toExponential(4)).join(' ')}, Gamma(32) ${r.gamma[31]!.toExponential(4)}`).join('; ')}. Band bottom q0 = 0, sigma 16: Var ${bottomVar.toExponential(4)}, Gamma(1, 2, 4, 8) ${bottomGamma.map(g => g.toExponential(4)).join(' ')}. Readings are ideal stand-ins. Gate M found that a closed fear meeting the lone vibe reads its position (it is stored with it as a pair), while a like vibe passes unrecorded; the line vacuum, the one resting medium, also reads it, on its own schedule. A Zeno run with fear meetings at a set spacing is the next step. The floor in physical units assumes a beat of one Planck time, which the model does not fix.`,
    })
  },
})
