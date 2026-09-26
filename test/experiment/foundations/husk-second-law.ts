// The second law on the adopted knit, read on the husk, with the rule's exact inverse as the control (E-FND-0146).
//
// THE KNIT. The coset-union vacuum (E-RLT-0093, the default dock-varying vacuum since 2026-09-26) under the lone
// bounce collision L (E-RLT-0084), on the side-12 D4 box (20,736 docks), run by the bounce kernel with this file's
// exact inverse beat (code/measure/second-law-husk). Why this vacuum and not the old hub: the hub vacuum's 64 empty
// columns never receive a copy (E-RLT-0089), so a start there is not one connected world, and the user's decision of
// 2026-09-26 makes the coset union the default.
//
// THE STRUCTURAL CLAIM, a theorem before any run. The beat is a bijection of a finite state space (E-RLT-0084 B4: it
// reverses exactly). So (i) the fine-grained entropy of ANY ensemble, ln of the number of distinct microstates it holds
// with equal weight, is constant exactly: a bijection never merges two states. (ii) Nothing in the rule prefers either
// direction: the inverse is as much a rule as the forward beat. So if the coarse entropy rises, it rises because the
// START is low in coarse entropy, and it must then rise in BOTH directions away from that start. The second law is a
// property of the boundary condition and the coarse map, never of the rule.
//
// THE COARSE MAP, fixed before the first run: the husk (the column sum along the depth) cut into 27 blocks of 4 x 4 x 4
// columns (768 bulk docks each); E_b is the knit's conserved energy (held slots + 2 per stored unit) in block b;
// H = - sum p_b ln p_b, p_b = E_b / E; the deficit D = ln 27 - H. Bulk beside: the same with each husk block split in
// two along the depth by v4 mod L (54 bulk blocks).
//
// THE START (a Weyl family, no draw): the vacuum's stores, and on the 768 docks of husk block 0 exactly 12,288 extra
// vibes (16 per dock on average) on the calm slots ranked by frac((slot + 1) golden + k silver), alternately love and
// fear, role points from the silver sequence. Member k of the 17-start family (code/measure/start-ensemble: the link
// start integer+k, and golden) takes phase k. Every member has the same block energies at the start.
//
// Gates, fixed before the first run of this file:
//  G1 instrument: energy and charge exact at every beat of every run; 240 beats forward then 240 back returns the start
//     bit for bit, and 240 back then 240 forward returns it, on all 17 members
//  G2 the second law forward: on 17 of 17 members the start deficit D(0) >= 0.05 and the mean deficit over the last 60
//     of 240 beats is at most 0.02 D(0)
//  G3 the control, the rule's exact inverse from the same start: G2's two conditions on the backward run, 17 of 17
//  G4 fine-grained: 32 starts (phases 0 to 31, the committed link start) keep 32 distinct microstates at every one of 240
//     beats (fingerprints, and every fingerprint tie compared in full), so the fine-grained entropy is ln 32 at every
//     beat exactly, while the ensemble's mean coarse deficit falls by at least 10 times
//  G5 recurrence exists: on the side-4 box (256 docks) the smallest even T with state(T) = state(0) is found, bit for
//     bit, for the vacuum and for N = 1 and 2 added vibes, within 2^19 beats
// Verdict: pass if all hold; fail if G1 holds and any of G2 to G5 fails; partial if G1 fails.
//
// Reported, not gated: per direction the first beat with D <= D(0) / 10, the beats where the deficit RISES (the
// reversible rule's fluctuations), the deficit at t = 12, 24, 36 (the free stream alone returns every vibe to its dock
// after L = 12 beats, so a stream-only gas would read D(0) again there), the bulk deficit, and the recurrence T for
// N = 3, 4, 6, 8 (a lower bound where the cap is reached).
//
// DISCLOSED: probes before this file (tmp/arrow-probe1.ts to arrow-probe4.ts) ran the same knit at sides 8 and 12 and
// the side-4 recurrence for N <= 4 (T = 6, 360, 18,000, 18,000, 18,000); G2 and G5 were set after those probes and are
// confirmations here. On the empty vacuum (probe 2, not this file) the stream's recurrence at t = 8, 16, 24, 32, 40 on
// side 8 is visible and decays by about 2 per box crossing.
//
// Depth L2: a theorem (bijection) plus its measurement on the adopted knit's own gas, read on the husk.
// DETERMINISM: Weyl fills and the 17 link starts; nothing is drawn. NOTHING MOVES: the stream copies.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox, blockEnergy, chargeOf, energyOf, fingerprint, lowEntropyStart, shannon, twoWay, type ArrowBox } from '@/code/measure/second-law-husk'
import { sameReduced, type Reduced } from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'

const SIDE = 12
const BLOCK = 4
const PER_DOCK = 16
const BEATS = 240
const LATE = 60
const FINE = 32
const CAP = 2 ** 19
const COUNTS = [0, 1, 2, 3, 4, 6, 8]

type Branch = { d0: number; late: number; t10: number; rises: number; at: number[]; bulkLate: number; bulk0: number; exact: boolean; returns: boolean }

// the bulk blocks: each husk block split in two along the depth by v4 mod L (well defined on the box, unlike v4 mod 2L,
// which the period L (0, 0, 1, 1) shifts by L), each half holding L / 2 docks of every column
function bulkBlocks(box: ArrowBox): Int32Array {
  return Int32Array.from(box.block, (b, x) => b * 2 + ((box.depth[x] as number) % box.side < box.side / 2 ? 0 : 1))
}

function bulkEnergy(box: ArrowBox, bulk: Int32Array, s: Reduced, out: Float64Array): void {
  out.fill(0)

  for (let x = 0; x < box.cells; x++) {
    let e = 0

    for (let d = 0; d < 24; d++) if (s.vibe[x * 24 + d] !== 0) e++
    for (let l = 0; l < 12; l++) if (s.store[x * 12 + l] !== 0) e += 2

    out[bulk[x] as number] = (out[bulk[x] as number] as number) + e
  }
}

function branch(box: ArrowBox, bulk: Int32Array, start: Reduced, direction: 1 | -1): Branch {
  const r = twoWay(box, start)
  const e = new Float64Array(box.blocks)
  const eb = new Float64Array(box.blocks * 2)
  const lnB = Math.log(box.blocks)
  const lnBulk = Math.log(box.blocks * 2)
  const energy = energyOf(start)
  const charge = chargeOf(start)
  const deficit: number[] = []
  let bulk0 = 0
  let bulkLate = 0
  let exact = true

  blockEnergy(box, start, e)
  deficit.push(lnB - shannon(e))
  bulkEnergy(box, bulk, start, eb)
  bulk0 = lnBulk - shannon(eb)

  for (let t = 1; t <= BEATS; t++) {
    if (direction > 0) r.forward()
    else r.backward()

    const s = r.state()

    exact = exact && energyOf(s) === energy && chargeOf(s) === charge
    blockEnergy(box, s, e)
    deficit.push(lnB - shannon(e))

    if (t > BEATS - LATE) {
      bulkEnergy(box, bulk, s, eb)
      bulkLate += (lnBulk - shannon(eb)) / LATE
    }
  }

  for (let t = 0; t < BEATS; t++) {
    if (direction > 0) r.backward()
    else r.forward()
  }

  const d0 = deficit[0] as number
  const late = deficit.slice(BEATS - LATE + 1).reduce((a, b) => a + b, 0) / LATE
  let rises = 0

  for (let t = 1; t <= BEATS; t++) if ((deficit[t] as number) > (deficit[t - 1] as number) + 1e-12) rises++

  return {
    d0,
    late,
    t10: deficit.findIndex(x => x <= d0 / 10),
    rises,
    at: [12, 24, 36].map(t => deficit[t] as number),
    bulkLate,
    bulk0,
    exact,
    returns: sameReduced(r.state(), start) && r.time() === 0,
  }
}

export default experiment({
  id: 'foundations/husk-second-law',
  code: 'E-FND-0146',
  title: 'the second law on the adopted knit, read on the husk',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const members = startFamily(16)

    // ---- G1 to G3: the 17 members, forward and backward ----
    const perMember = members.map((member, k) => {
      const box = withStart(member, () => arrowBox(SIDE, BLOCK))
      const bulk = bulkBlocks(box)
      const start = lowEntropyStart(box, { blocks: [0], perDock: PER_DOCK, phase: k })

      return { name: member.name, forward: branch(box, bulk, start, 1), backward: branch(box, bulk, start, -1) }
    })

    log('members')

    const g1 = perMember.every(m => m.forward.exact && m.backward.exact && m.forward.returns && m.backward.returns)
    const rose = (b: Branch): boolean => b.d0 >= 0.05 && b.late <= 0.02 * b.d0
    const g2 = perMember.every(m => rose(m.forward))
    const g3 = perMember.every(m => rose(m.backward))

    // ---- G4: fine-grained entropy of a 32-state ensemble under one rule ----
    const fineBox = withStart(members[0]!, () => arrowBox(SIDE, BLOCK))
    const runners = Array.from({ length: FINE }, (_, k) => twoWay(fineBox, lowEntropyStart(fineBox, { blocks: [0], perDock: PER_DOCK, phase: k })))
    const e = new Float64Array(fineBox.blocks)
    const lnB = Math.log(fineBox.blocks)
    const meanDeficit = (): number =>
      runners.reduce((acc, r) => {
        blockEnergy(fineBox, r.state(), e)

        return acc + (lnB - shannon(e)) / FINE
      }, 0)
    const fineStart = meanDeficit()
    let fewestDistinct = FINE
    let fullTies = 0

    for (let t = 1; t <= BEATS; t++) {
      for (const r of runners) r.forward()

      const seen = new Map<string, number[]>()

      runners.forEach((r, i) => {
        const key = fingerprint(r.state())

        seen.set(key, [...(seen.get(key) ?? []), i])
      })

      let distinct = 0

      for (const group of seen.values()) {
        // a fingerprint tie is compared in full: truly equal states count once
        const reps: number[] = []

        for (const i of group) {
          if (group.length > 1) fullTies++
          if (!reps.some(j => sameReduced(runners[i]!.state(), runners[j]!.state()))) reps.push(i)
        }

        distinct += reps.length
      }

      fewestDistinct = Math.min(fewestDistinct, distinct)
    }

    const fineEnd = meanDeficit()
    const g4 = fewestDistinct === FINE && fineEnd <= fineStart / 10

    log('fine')

    // ---- G5: exact recurrence on the side-4 box ----
    const tiny = arrowBox(4, 4)
    const recurrence = COUNTS.map(n => {
      const start = lowEntropyStart(tiny, { blocks: [0], perDock: n / tiny.cells, phase: 0 })
      const r = twoWay(tiny, start)

      for (let t = 1; t <= CAP; t++) {
        r.forward()

        if (t % 2 === 0 && sameReduced(r.state(), start)) return { n, beats: t, found: true }
      }

      return { n, beats: CAP, found: false }
    })
    const g5 = recurrence.filter(r => r.n <= 2).every(r => r.found)

    log('recurrence')

    const status = !g1 ? 'partial' : g2 && g3 && g4 && g5 ? 'pass' : 'fail'
    const range = (xs: number[], digits = 4): string => `${Math.min(...xs).toFixed(digits)} to ${Math.max(...xs).toFixed(digits)}`
    const fw = perMember.map(m => m.forward)
    const bw = perMember.map(m => m.backward)
    const recurrenceText = recurrence.map(r => `N ${r.n}: ${r.found ? '' : '> '}${r.beats}`).join(', ')

    return verdict({
      status,
      claim: `on the coset-union vacuum under the lone bounce collision (side ${SIDE}, 27 husk blocks, 17 starts), a start holding 12,288 extra vibes in one husk block has coarse deficit ${range(fw.map(b => b.d0))}; it falls to ${range(fw.map(b => b.late / b.d0))} of that forward and ${range(bw.map(b => b.late / b.d0))} backward (the rule's exact inverse) over the last ${LATE} of ${BEATS} beats, energy and charge exact and both runs returning the start bit for bit; 32 starts under one rule stay ${fewestDistinct} distinct microstates at every beat (fine-grained entropy ln 32 exactly) while their mean coarse deficit falls from ${fineStart.toFixed(4)} to ${fineEnd.toExponential(2)}; on the side-4 box the exact recurrence is ${recurrenceText} beats`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        deficitStartMin: Math.min(...fw.map(b => b.d0)),
        forwardLateRatioMax: Math.max(...fw.map(b => b.late / b.d0)),
        backwardLateRatioMax: Math.max(...bw.map(b => b.late / b.d0)),
        forwardTenfoldBeatMax: Math.max(...fw.map(b => b.t10)),
        backwardTenfoldBeatMax: Math.max(...bw.map(b => b.t10)),
        forwardRisesMin: Math.min(...fw.map(b => b.rises)),
        forwardRisesMax: Math.max(...fw.map(b => b.rises)),
        bulkDeficitStartMin: Math.min(...fw.map(b => b.bulk0)),
        bulkForwardLateRatioMax: Math.max(...fw.map(b => b.bulkLate / b.bulk0)),
        bulkBackwardLateRatioMax: Math.max(...bw.map(b => b.bulkLate / b.bulk0)),
        fineDistinctFewest: fewestDistinct,
        fineFingerprintTies: fullTies,
        fineMeanDeficitStart: fineStart,
        fineMeanDeficitEnd: fineEnd,
        ...Object.fromEntries(recurrence.map(r => [`recurrenceN${r.n}`, r.found ? r.beats : -r.beats])),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        backwardRisesToo: g3 ? 1 : 0,
        fineEntropyConstant: fewestDistinct === FINE ? 1 : 0,
      },
      notes: `L2. Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}. Per member (name: forward D(0), late/D(0), tenfold beat, rises, D at t = 12 24 36; backward late/D(0), tenfold beat): ${perMember.map(m => `${m.name}: ${m.forward.d0.toFixed(4)}, ${(m.forward.late / m.forward.d0).toExponential(1)}, ${m.forward.t10}, ${m.forward.rises}, ${m.forward.at.map(x => x.toExponential(1)).join(' ')}; ${(m.backward.late / m.backward.d0).toExponential(1)}, ${m.backward.t10}`).join('; ')}. Bulk beside (54 blocks): start deficit ${range(fw.map(b => b.bulk0))}, late ratio forward ${range(fw.map(b => b.bulkLate / b.bulk0))}, backward ${range(bw.map(b => b.bulkLate / b.bulk0))}. Recurrence on the side-4 box (256 docks, cap ${CAP}): ${recurrenceText}. A found T is an exact return of every trit and role point; "> cap" is a lower bound. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
