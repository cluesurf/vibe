// Baryogenesis on the substrate: a growth quench charges the matter sector from nothing. The
// initial state is EMPTY, exactly symmetric under charge conjugation, and the only drive is a
// growth front sweeping one column every k beats. The committed rule then satisfies all three
// Sakharov conditions and the asymmetry is measured, not posed:
//
//   - C AND CP VIOLATION: the generated charge appears ONLY in the interacting couple's matter
//     slots (every clock couple stays exactly at zero), the same couple E-FND-0115 pins the
//     conjugation violation to.
//   - OUT OF EQUILIBRIUM: the quench. The commensurate front (k divisible by three, in step with
//     the Z three clock) is the equilibrium-like control and generates EXACTLY ZERO asymmetry at
//     every beat, while the incommensurate fronts (k one and two) generate large ones.
//   - SECTOR CHARGE PUMPING WITH AN EXACT CONSERVATION LAW: the total tone sum is exactly zero at
//     every beat of every run (the pair table conserves it, the model's B minus L), and the matter
//     sector charges anyway, exactly balanced by the wire sector, the B plus L versus B minus L
//     structure of electroweak baryogenesis.
//
// The asymmetry is QUANTIZED: every matter-sector sample is a whole multiple of side cubed, whole
// hypersheets of charge, the same granularity the wall quantum law found (E-FND-0110). The value
// oscillates with the ongoing vacuum clock rather than freezing, so the gate is the time average
// over a settled window, which is nonzero for both incommensurate quenches and exactly zero for
// the commensurate one. Depth L2, deterministic, the commensurate quench the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { lineWeave } from '@/code/rule/collision'
import { linesOf } from '@/task/palindrome-hunt'

const SIDE = 13
const BEATS = 36
const SETTLED = 24

export default experiment({
  id: 'foundations/weave-sakharov-asymmetry',
  code: 'E-FND-0116',
  title:
    'a growth quench on the committed rule generates a matter-sector charge asymmetry from the exactly C-symmetric empty state, satisfying all three Sakharov conditions measurably: the charge lands only in the interacting couple (C violation localized), the incommensurate fronts generate it while the commensurate front generates exactly zero at every beat (the out-of-equilibrium condition with its own null control), and the total tone sum stays exactly zero throughout while matter and wire sectors charge oppositely (sector pumping under an exact conservation law, the B plus L versus B minus L structure), with every sample quantized in whole multiples of side cubed',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = lineWeave({ opposite })
    const lines = linesOf(opposite)
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE

    const COUPLES: [number, number][] = [
      [0, 3],
      [2, 5],
      [4, 1],
      [6, 9],
      [8, 11],
      [10, 7],
    ]
    const isWire = new Array<boolean>(24).fill(false)
    const coupleOf = new Array<number>(24)

    COUPLES.forEach(([m, w], k) => {
      for (const end of [0, 1]) {
        isWire[lines[w]![end]!] = true
        coupleOf[lines[m]![end]!] = k
        coupleOf[lines[w]![end]!] = k
      }
    })

    const quench = (
      k: number,
    ): {
      averageAbsMatter: number
      totalWorst: number
      offCoupleWorst: number
      quantized: boolean
      matterEverNonzero: boolean
    } => {
      let will: Will = makeWill(mesh)
      let totalWorst = 0
      let offCoupleWorst = 0
      let quantized = true
      let matterEverNonzero = false
      let settledSum = 0
      let settledCount = 0

      for (let t = 1; t <= BEATS; t++) {
        const bornThrough = Math.min(SIDE - 1, Math.floor(t / k))
        const active = (c: number): boolean =>
          coordinate(c, 0) <= bornThrough

        will = growingBeat(will, rule, active)

        let matterSum = 0
        let wireSum = 0
        const matterByCouple = [0, 0, 0, 0, 0, 0]

        for (let i = 0; i < will.data.length; i++) {
          const v = will.data[i]!

          if (v !== 0) {
            if (isWire[i % 24]) {
              wireSum += v
            } else {
              const couple = coupleOf[i % 24]!

              matterSum += v
              matterByCouple[couple] = matterByCouple[couple]! + v
            }
          }
        }

        totalWorst = Math.max(totalWorst, Math.abs(matterSum + wireSum))

        for (let c = 1; c < 6; c++) {
          offCoupleWorst = Math.max(
            offCoupleWorst,
            Math.abs(matterByCouple[c]!),
          )
        }

        if (matterSum % (SIDE * SIDE * SIDE) !== 0) {
          quantized = false
        }

        if (matterSum !== 0) {
          matterEverNonzero = true
        }

        if (t >= SETTLED) {
          settledSum += Math.abs(matterSum)
          settledCount++
        }
      }

      return {
        averageAbsMatter: settledSum / settledCount,
        totalWorst,
        offCoupleWorst,
        quantized,
        matterEverNonzero,
      }
    }

    const k1 = quench(1)
    const k2 = quench(2)
    const k3 = quench(3)

    const sheet = SIDE * SIDE * SIDE
    const ok =
      k1.totalWorst === 0 &&
      k2.totalWorst === 0 &&
      k3.totalWorst === 0 &&
      k1.offCoupleWorst === 0 &&
      k2.offCoupleWorst === 0 &&
      k3.offCoupleWorst === 0 &&
      k1.quantized &&
      k2.quantized &&
      k1.averageAbsMatter > sheet / 2 &&
      k2.averageAbsMatter > sheet / 2 &&
      !k3.matterEverNonzero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the total tone sum is exactly zero at every beat of every quench, the generated matter charge lands only in the interacting couple and only for incommensurate fronts (settled average above half a hypersheet for k one and two), every sample is a whole multiple of side cubed, and the commensurate front generates exactly zero at every beat',
      metrics: {
        k1AverageAbsMatter: Number(k1.averageAbsMatter.toFixed(0)),
        k2AverageAbsMatter: Number(k2.averageAbsMatter.toFixed(0)),
        k3MatterAlwaysZero: k3.matterEverNonzero ? 0 : 1,
        totalToneWorst: Math.max(
          k1.totalWorst,
          k2.totalWorst,
          k3.totalWorst,
        ),
        offCoupleWorst: Math.max(
          k1.offCoupleWorst,
          k2.offCoupleWorst,
          k3.offCoupleWorst,
        ),
        hypersheet: sheet,
      },
      // CONTROL: the commensurate quench, identical machinery, exactly zero asymmetry at every beat
      control: {
        commensurateNull: k3.matterEverNonzero ? 0 : 1,
      },
      notes:
        'the asymmetry oscillates with the vacuum clock rather than freezing, which is why the gate is a settled-window average. The quantization in whole hypersheets matches the wall quantum granularity of E-FND-0110. What this supplies for the baryon_asymmetry row is the full Sakharov mechanism on the substrate with the commensurability null as its own control; what it does not supply is the observed ten to the minus ten ratio, which needs the coarse dilution story.',
    })
  },
})
