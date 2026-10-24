// ZENO WITH THE RULE'S OWN READINGS: A STREAM OF CLOSED FEARS ON THE LONE VIBE'S LINE (E-QTM-0190, quantum-coverage
// path 5, OPEN-QTM-07). E-QTM-0187 found the discrete Zeno law with IDEAL readings (Gamma(k) = -ln |a(k)|^2 / k ~
// k Var(W), floor Gamma(1) ~ Var(W) at one reading a beat, 16 sigma^2 Gamma(1) = 0.997 to 1.000 for a packet) and that
// the rule's slot transition has no Zeno regime (survival 1/4 per reading unless k is a multiple of 3). Its gate M
// found the rule does hold a reading: a closed fear meeting the open love on a line with an empty store is stored with
// it, so the environment differs between the love's positions (purity 0.40), while a closed love passes unrecorded.
// This file explores whether a stream of closed fears at spacing k, the rule's own reading about once every k beats,
// gives the ideal law or any Zeno regime.
//
// THE RULE: code/rule/coined-locked-knit coinedVetoBeat, veto 'none', tables on the pass contact, every link the
// identity, content only on the mesh line through the center along slot 0 (code/measure/line-barrier). The stream
// (code/measure/line-stream-zeno closedStream): closed vibes on the line's back slot every k docks from dock 1, moving
// back. On a ring a stream circulates, so it meets the love for as long as the run lasts.
// THE METHOD: the beat is linear (a unitary on configurations, E-QTM-0184), so the rule is run from each basis start
// (the open love on one dock and slot, the stream fixed) and any start is their combination; the love's reduced state
// is read off the combination (its position free or in an open stored pair, the rest of the configuration traced out).
// A start whose slot the stream holds is left out (a slot holds one vibe).
//
// STATES: A, the slot state of E-QTM-0187 Z1 (amplitude 1 on every dock's forward slot, q = 0), its ideal survival
// |a(k)|^2 = 1 for 3 | k, else 1/4. A-pi, the same with (-1)^dock (reported). B', a band-0 packet at q0 = pi/2, sigma 2,
// with the components on slots the stream holds removed and renormalized, so a different state for each k (reported:
// a dense stream and a spread packet cannot share the ring's slots). POSITION, the love started on one dock's forward
// slot: the chance it is on its start dock, free or stored, averaged over every start dock.
// IDEAL: from the free walk in position (walkReturns, the rule's coin), a(k) = <psi|U^k|psi>, ideal selective survival
// over T beats |a(k)|^(2 T / k).
//
// GATES, fixed before the first run (ring of 12 docks, side 12, T = 24 beats, k = 1, 2, 3, 4, 6, 12; and ring 16,
// side 16, T = 16, k = 1, 2, 4, 8, 16, forward starts only):
//  I1 linearity: on ring 12 the state A with the fear stream k = 3, run directly, equals the combination of the basis
//     runs exactly (reduced Z[w][1/2]) at every beat 0..24
//  I2 the free rule is the walk: on ring 12 with no stream, A's fidelity is 1 at beats 3 | t and 1/4 otherwise within
//     1e-12, the unprojected packet B's fidelity equals the walk's |a(t)|^2 within 1e-9, and every forward start's stay
//     chance equals the walk's within 1e-12, t = 1..24
//  C  control: a stream of closed LOVES at the same spacing leaves A unread, one environment and purity 1 within 1e-12
//     at every beat, every k, both rings
//  R  reading: the fear stream reads A, some beat with 2 or more environments and purity below 1 - 1e-6, every k,
//     both rings
// RESULTS, judged by fixed rules after the run:
//  LAW: the rule's readings follow the ideal law on A: |F_rule(T, k) - |a(k)|^(2T/k)| <= 0.02 at every k (ring 12).
//     Predicted false (the stream reads position, not the slot).
//  ZS (a Zeno regime in A, each ring): some k with mean fidelity over beats 1..T at least 0.02 above the free run's
//     and 0.02 above the like stream's at the same k, and above the fear stream's at every larger k. Predicted false.
//  ZP (a Zeno regime in position, each ring): the mean stay chance falls (non-increasing within 1e-9) as k grows over
//     every k, and at the smallest k it is at least 0.05 above the free walk's and the like stream's. Prediction open.
// VERDICT, fixed: FAIL if I1, I2, C or R fails (the instrument). PASS if LAW and ZS hold on ring 12. Otherwise PARTIAL.
//  Predicted PARTIAL.
// REPORTED, NOT GATED: A-pi; B' per k on ring 12, the rule's Gamma(k) = -ln F / T against the ideal -ln |a'(k)|^2 / k,
//  k Var'(W), and the floor 16 sigma^2 Gamma(1); purity and environments by beat.
//
// PROBES BEFORE THIS FILE, DISCLOSED: tmp/qtm190-probe1.ts (A with the fear stream k = 3 on ring 12, run directly:
// up to 34 environments, purity 0.11 to 0.82 over 12 beats), tmp/qtm190-probe2.ts (basis runs on rings 12 and 16 for
// k = 0, 1, 3, 4, 12 beats: the free rule matches the walk on A and B; with a fear on every dock the love is stored at
// once and never released, A's fidelity 0, purity 1/12; a love on every dock leaves A at fidelity 1, the coin skipped
// on every beat; the back slots the stream holds made B's start not a state, hence B').
//
// FIRST RUN 2026-10-24 (3,982 s, log test/record/E-QTM-0190/run-2026-10-24.log): PARTIAL as predicted, no gate
//  moved, title written after the run. I1, I2, C and R hold. LAW fails (worst gap 0.667). ZS fails on both rings: the
//  fear stream lowers the slot state's mean fidelity below the free run (0.5) and below the like stream at every k.
//  ZP holds on ring 16 and fails on ring 12 (stay 0.844, 0.131, 0.081, 0.106, 0.100, 0.096, not monotone; at k = 1 the
//  store holding the vibe releases at beat 13 on ring 12). So the one position freeze is k = 1, the vibe stored at its
//  dock while a fear arrives on its line every beat, which is trapping, not repeated projection, and the ordering past
//  k = 1 is within the free walk's own spread. B' is not a slow state on this ring (k sqrt(Var') above 1 at every k,
//  outside the law's range), so the 16 sigma^2 Gamma(1) floor is not tested here; at k = 1 B' keeps only forward slots
//  and the rule's Gamma is infinite (printed as null in the metrics).
//
// DETERMINISM: no random number. The rule is exact; the combination is exact for A and in floats for complex weights.
// Depth L3: the rule run through its beat, the readings made of its own content, a computed control (the like stream).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { lineBeat, lineBox, lineConfiguration, type LineBox, type LineVibe } from '@/code/measure/line-barrier'
import {
  basisRuns,
  closedStream,
  combineComplex,
  combineExact,
  flattenExact,
  quasiEnergyVariance,
  reducedReading,
  sameExact,
  splitOpenVibe,
  stayChance,
  walkReturns,
  type BasisRun,
  type Complex,
} from '@/code/measure/line-stream-zeno'
import { fearBands, gaussianPacket, packetState, walkBeatComplex } from '@/code/measure/discrete-zeno'
import { lockedState, type LockedState } from '@/code/rule/doublet-locked-knit'

const SLOT = 0
const FROM = 1
const SIDE = 12
const T = 24
const K = [1, 2, 3, 4, 6, 12]
const SIDE_LARGE = 16
const T_LARGE = 16
const K_LARGE = [1, 2, 4, 8, 16]
const LINEARITY_K = 3
const SIGMA = 2
const Q0 = Math.PI / 2
const LAW_TOL = 0.02
const ZS_MARGIN = 0.02
const ZP_MARGIN = 0.05

type Vector = { right: Complex[]; left: Complex[] }

const mean = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length

// the love's reduced reading of a combined start at every beat 1..beats
function readings(
  runs: readonly BasisRun[],
  weight: (r: BasisRun) => Complex,
  beats: number,
): { fidelity: number[]; purity: number[]; environments: number[] } {
  const target = new Map(runs.map(r => [r.position, weight(r)] as const))
  const fidelity: number[] = []
  const purity: number[] = []
  const environments: number[] = []

  for (let t = 1; t <= beats; t++) {
    const r = reducedReading(combineComplex(runs, weight, t), target)

    fidelity.push(r.fidelity)
    purity.push(r.purity)
    environments.push(r.environments)
  }

  return { fidelity, purity, environments }
}

// the mean stay chance over forward starts, at every beat 1..beats
function stayMean(box: LineBox, runs: readonly BasisRun[], beats: number): number[] {
  const forward = runs.filter(r => r.forward).map(r => stayChance(box, r))

  return Array.from({ length: beats }, (_, i) => mean(forward.map(s => s[i + 1]!)))
}

const slotWeight =
  (n: number, sign: (dock: number) => number) =>
  (r: BasisRun): Complex =>
    r.forward ? [sign(r.dock) / Math.sqrt(n), 0] : [0, 0]

function slotVector(n: number, sign: (dock: number) => number): Vector {
  return {
    right: Array.from({ length: n }, (_, d) => [sign(d) / Math.sqrt(n), 0] as Complex),
    left: Array.from({ length: n }, () => [0, 0] as Complex),
  }
}

function localVector(n: number, dock: number): Vector {
  return {
    right: Array.from({ length: n }, (_, d) => (d === dock ? [1, 0] : [0, 0]) as Complex),
    left: Array.from({ length: n }, () => [0, 0] as Complex),
  }
}

// B with the components on stream-held slots removed, renormalized
function packetWithout(psi: Vector, held: readonly LineVibe[]): Vector {
  const n = psi.right.length
  const right = psi.right.map((c, d) =>
    held.some(h => h.forward && h.dock === d) ? ([0, 0] as Complex) : c,
  )
  const left = psi.left.map((c, d) =>
    held.some(h => !h.forward && h.dock === d) ? ([0, 0] as Complex) : c,
  )

  let w = 0

  for (let d = 0; d < n; d++) {
    w += right[d]![0] ** 2 + right[d]![1] ** 2 + left[d]![0] ** 2 + left[d]![1] ** 2
  }

  const s = 1 / Math.sqrt(w)

  return {
    right: right.map(c => [c[0] * s, c[1] * s] as Complex),
    left: left.map(c => [c[0] * s, c[1] * s] as Complex),
  }
}

const vectorWeight =
  (v: Vector) =>
  (r: BasisRun): Complex =>
    r.forward ? v.right[r.dock]! : v.left[r.dock]!

const survival = (a: Complex, k: number, beats: number): number =>
  (a[0] * a[0] + a[1] * a[1]) ** (beats / k)

// one ring: the fear and like streams at every k, state A and position (B' on request)
function ringRun(input: {
  side: number
  beats: number
  ks: readonly number[]
  forwardOnly: boolean
  packet: boolean
}) {
  const { side, beats, ks, forwardOnly } = input
  const box = lineBox(side, SLOT)
  const n = box.cells.length
  const signA = () => 1
  const signPi = (d: number) => (d % 2 === 0 ? 1 : -1)
  const walkA = walkReturns({ psi: slotVector(n, signA), beats, step: walkBeatComplex })
  const walkStay = walkReturns({ psi: localVector(n, 0), beats, step: walkBeatComplex, dock: 0 })
  const freeA = walkA.amplitude.slice(1).map(a => a[0] ** 2 + a[1] ** 2)
  const freeStay = walkStay.stay.slice(1)
  const psiB = packetState(gaussianPacket(n, Q0, 1 / (2 * SIGMA), 0))

  const byK = ks.map(k => {
    const kinds = ([-1, 1] as const).map(value => {
      const stream = closedStream({ box, spacing: k, value, from: FROM })
      const runs = basisRuns({ box, others: stream, beats, forwardOnly })
      const a = readings(runs, slotWeight(n, signA), beats)
      const pi = readings(runs, slotWeight(n, signPi), beats)
      const stay = stayMean(box, runs, beats)

      let packet:
        | { fidelity: number; gammaRule: number; gammaIdeal: number; variance: number; idealSurvival: number }
        | undefined

      if (input.packet && value === -1) {
        const v = packetWithout(psiB, stream)
        const rb = readings(runs, vectorWeight(v), beats)
        const ideal = walkReturns({ psi: v, beats: k, step: walkBeatComplex }).amplitude[k]!
        const variance = quasiEnergyVariance({ psi: v, bands: fearBands }).variance
        const f = rb.fidelity[beats - 1]!

        packet = {
          fidelity: f,
          gammaRule: -Math.log(f) / beats,
          gammaIdeal: -Math.log(ideal[0] ** 2 + ideal[1] ** 2) / k,
          variance,
          idealSurvival: survival(ideal, k, beats),
        }
      }

      return { value, a, pi, stay, packet, starts: runs.length }
    })

    return { k, fear: kinds[0]!, like: kinds[1]! }
  })

  const ideal = ks.map(k => survival(walkA.amplitude[k]!, k, beats))

  return { box, n, freeA, freeStay, byK, ideal }
}

export default experiment({
  id: 'quantum/line-stream-zeno',
  code: 'E-QTM-0190',
  title:
    "Zeno with the rule's own readings, a stream of closed fears at spacing k on the lone vibe's line, partial: the stream reads the vibe (up to 121 environments, purity down to 0.05) while a like stream leaves it unread at every k, but it does not follow the ideal law (slot-state survival over 24 beats 0.00, 0.26, 0.37, 0.34, 0.39, 0.33 for k = 1, 2, 3, 4, 6, 12 against 0, 0, 1, 0.0002, 1, 1) and gives no Zeno regime in the state on rings of 12 and 16 (mean fidelity 0.003 to 0.258, all below the free 0.5 and the like stream); a fear on every dock holds the vibe in a store at its dock (stay chance 1 for 12 beats on ring 12, 16 on ring 16), a freeze by trapping, and the stay chance falls with k on ring 16 (1.000, 0.137, 0.128, 0.115, 0.111, free 0.099) but not on ring 12",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const family = startFamily(16)

    return withStart(family[0]!, () => {
      // ---- ring 12 ----
      const small = ringRun({ side: SIDE, beats: T, ks: K, forwardOnly: false, packet: true })
      const box = small.box
      const n = small.n

      // ---- I1 ----
      const fearRuns = basisRuns({
        box,
        others: closedStream({ box, spacing: LINEARITY_K, value: -1, from: FROM }),
        beats: T,
      })
      const stream = closedStream({ box, spacing: LINEARITY_K, value: -1, from: FROM })

      let direct: LockedState = {
        branches: Array.from({ length: n }, (_, dock) => ({
          ...lockedState(
            lineConfiguration(box, [{ dock, forward: true, value: 1, open: true }, ...stream], []),
          ).branches[0]!,
          a: 1n,
          b: 0n,
          k: 0,
        })),
      }

      let i1 = sameExact(
        flattenExact(splitOpenVibe(direct)),
        combineExact(fearRuns, r => (r.forward ? 1n : 0n), 0),
      )

      for (let t = 1; t <= T; t++) {
        direct = lineBeat(box, direct, t - 1)
        i1 &&= sameExact(
          flattenExact(splitOpenVibe(direct)),
          combineExact(fearRuns, r => (r.forward ? 1n : 0n), t),
        )
      }

      // ---- I2 ----
      const freeRuns = basisRuns({ box, others: [], beats: T })
      const freeA = readings(freeRuns, slotWeight(n, () => 1), T)
      const psiB = packetState(gaussianPacket(n, Q0, 1 / (2 * SIGMA), 0))
      const freeB = readings(freeRuns, vectorWeight(psiB), T)
      const walkB = walkReturns({ psi: psiB, beats: T, step: walkBeatComplex }).amplitude
      const i2A = freeA.fidelity.every((f, i) => Math.abs(f - ((i + 1) % 3 === 0 ? 1 : 0.25)) <= 1e-12)
      const i2B = freeB.fidelity.every(
        (f, i) => Math.abs(f - (walkB[i + 1]![0] ** 2 + walkB[i + 1]![1] ** 2)) <= 1e-9,
      )
      const i2Stay = freeRuns
        .filter(r => r.forward)
        .every(r => {
          const rule = stayChance(box, r)
          const walk = walkReturns({ psi: localVector(n, r.dock), beats: T, step: walkBeatComplex, dock: r.dock }).stay

          return rule.every((x, t) => Math.abs(x - walk[t]!) <= 1e-12)
        })
      const i2 = i2A && i2B && i2Stay

      // ---- ring 16 ----
      const large = ringRun({ side: SIDE_LARGE, beats: T_LARGE, ks: K_LARGE, forwardOnly: true, packet: false })

      const rings = [
        { name: 'ring 12', run: small, beats: T, ks: K },
        { name: 'ring 16', run: large, beats: T_LARGE, ks: K_LARGE },
      ]

      // ---- C and R ----
      const c = rings.every(({ run }) =>
        run.byK.every(
          ({ like }) =>
            like.a.environments.every(e => e === 1) && like.a.purity.every(p => Math.abs(p - 1) <= 1e-12),
        ),
      )
      const r = rings.every(({ run }) =>
        run.byK.every(
          ({ fear }) =>
            fear.a.environments.some(e => e >= 2) && fear.a.purity.some(p => p < 1 - 1e-6),
        ),
      )

      // ---- LAW (ring 12) ----
      const lawGaps = small.byK.map(({ fear }, i) => Math.abs(fear.a.fidelity[T - 1]! - small.ideal[i]!))
      const law = lawGaps.every(g => g <= LAW_TOL)

      // ---- ZS and ZP, each ring ----
      const judged = rings.map(({ name, run, ks }) => {
        const freeMean = mean(run.freeA)
        const fearMean = run.byK.map(x => mean(x.fear.a.fidelity))
        const likeMean = run.byK.map(x => mean(x.like.a.fidelity))
        const zsAt = ks.filter(
          (_, i) =>
            fearMean[i]! >= freeMean + ZS_MARGIN &&
            fearMean[i]! >= likeMean[i]! + ZS_MARGIN &&
            fearMean.slice(i + 1).every(f => fearMean[i]! > f),
        )
        const freeStay = mean(run.freeStay)
        const fearStay = run.byK.map(x => mean(x.fear.stay))
        const likeStay = run.byK.map(x => mean(x.like.stay))
        const falls = fearStay.every((s, i) => i === 0 || s <= fearStay[i - 1]! + 1e-9)
        const zp =
          falls &&
          fearStay[0]! >= freeStay + ZP_MARGIN &&
          fearStay[0]! >= likeStay[0]! + ZP_MARGIN

        return { name, freeMean, fearMean, likeMean, zsAt, zs: zsAt.length > 0, freeStay, fearStay, likeStay, falls, zp }
      })

      const instrument = i1 && i2 && c && r
      const status = !instrument ? 'fail' : law && judged[0]!.zs ? 'pass' : 'partial'
      const packets = small.byK.map(x => ({ k: x.k, ...x.fear.packet! }))
      const fmt = (xs: readonly number[], d = 4) => xs.map(x => x.toFixed(d)).join(' ')

      return verdict({
        status,
        claim: `ring 12: fear-stream survival of the slot state over 24 beats ${fmt(small.byK.map(x => x.fear.a.fidelity[T - 1]!))} for k = ${K.join(', ')} against the ideal law ${fmt(small.ideal)} (LAW ${law}, worst gap ${Math.max(...lawGaps).toFixed(3)}); mean fidelity fear ${fmt(judged[0]!.fearMean, 3)}, like ${fmt(judged[0]!.likeMean, 3)}, free ${judged[0]!.freeMean.toFixed(3)} (state Zeno regime ${judged[0]!.zs}, ring 16 ${judged[1]!.zs}); mean stay chance fear ${fmt(judged[0]!.fearStay, 3)}, like ${fmt(judged[0]!.likeStay, 3)}, free ${judged[0]!.freeStay.toFixed(3)} (position regime ${judged[0]!.zp}, ring 16 ${fmt(judged[1]!.fearStay, 3)}, ${judged[1]!.zp}); B' Gamma rule/ideal ${packets.map(p => `${p.gammaRule.toFixed(3)}/${p.gammaIdeal.toFixed(3)}`).join(' ')}`,
        metrics: {
          lawWorstGap: Number(Math.max(...lawGaps).toFixed(6)),
          stateZenoRing12: judged[0]!.zs ? 1 : 0,
          stateZenoRing16: judged[1]!.zs ? 1 : 0,
          positionZenoRing12: judged[0]!.zp ? 1 : 0,
          positionZenoRing16: judged[1]!.zp ? 1 : 0,
          fearSurvivalK1: Number(small.byK[0]!.fear.a.fidelity[T - 1]!.toFixed(6)),
          fearSurvivalK3: Number(small.byK[2]!.fear.a.fidelity[T - 1]!.toFixed(6)),
          fearSurvivalK12: Number(small.byK[5]!.fear.a.fidelity[T - 1]!.toFixed(6)),
          fearStayK1: Number(judged[0]!.fearStay[0]!.toFixed(6)),
          fearStayK12: Number(judged[0]!.fearStay[5]!.toFixed(6)),
          fearPurityMinK3: Number(Math.min(...small.byK[2]!.fear.a.purity).toFixed(6)),
          fearEnvironmentsMaxK3: Math.max(...small.byK[2]!.fear.a.environments),
          packetFloorRule: Number((packets[0]!.gammaRule * 16 * SIGMA * SIGMA).toFixed(4)),
          packetFloorIdeal: Number((packets[0]!.gammaIdeal * 16 * SIGMA * SIGMA).toFixed(4)),
        },
        control: {
          likeFidelityMeanK1: Number(judged[0]!.likeMean[0]!.toFixed(6)),
          likeStayMeanK1: Number(judged[0]!.likeStay[0]!.toFixed(6)),
          freeFidelityMean: Number(judged[0]!.freeMean.toFixed(6)),
          freeStayMean: Number(judged[0]!.freeStay.toFixed(6)),
          likeUnreadAllK: c ? 1 : 0,
        },
        notes: `L3. Gates: I1 ${i1}, I2 ${i2} (A ${i2A}, B ${i2B}, stay ${i2Stay}), C ${c}, R ${r}; LAW ${law}; ZS ${judged.map(j => `${j.name} ${j.zs} at k ${j.zsAt.join(',') || 'none'}`).join('; ')}; ZP ${judged.map(j => `${j.name} ${j.zp} (falls ${j.falls})`).join('; ')}. ${rings
          .map(
            ({ name, run, ks }) =>
              `${name}: ${run.byK
                .map(
                  x =>
                    `k ${x.k} fear F(t) ${fmt(x.fear.a.fidelity, 3)} purity ${fmt(x.fear.a.purity, 3)} env ${x.fear.a.environments.join(' ')} stay ${fmt(x.fear.stay, 3)}, A-pi F(T) ${x.fear.pi.fidelity[x.fear.pi.fidelity.length - 1]!.toFixed(4)}; like F(t) ${fmt(x.like.a.fidelity, 3)} stay ${fmt(x.like.stay, 3)}`,
                )
                .join(' | ')}; free F(t) ${fmt(run.freeA, 3)} free stay ${fmt(run.freeStay, 3)}; ks ${ks.join(',')}`,
          )
          .join(' || ')}. B' (sigma ${SIGMA}, q0 pi/2, ring 12, stream slots removed): ${packets
          .map(
            p =>
              `k ${p.k}: F(24) ${p.fidelity.toFixed(4)} ideal ${p.idealSurvival.toFixed(4)}, Gamma rule ${p.gammaRule.toExponential(3)} ideal ${p.gammaIdeal.toExponential(3)}, k Var ${(p.k * p.variance).toExponential(3)}`,
          )
          .join('; ')}. The like stream skips the coin where it shares the line with the love (E-QTM-0187), so it changes the love's beat without reading it.`,
      })
    })
  },
})
