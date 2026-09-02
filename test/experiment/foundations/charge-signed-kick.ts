// The kick generator is charge-signed: the same wall kicks the particle DOWN one clock
// unit and the antiparticle UP one, which is how an abelian gauge field couples to
// opposite charges, measured directly. Through the standard kicking slab the particle
// steps one hundred fifty to thirty (minus one hundred twenty, clean at support one, the
// E-FND-0118 law), and the antiparticle steps minus one hundred fifty to minus thirty
// (PLUS one hundred twenty), read at the amplitude level through a small stable dressing
// (support three, amplitude locked at root three), the C-violating interacting sector
// dressing the conjugate crossing without destroying its phase record.
//
// What this supplies the gauge-algebra programme: the generator's action and its charge
// covariance. What it does not supply, recorded from the measured attempts: Z three
// CLOSURE by composition. Three obstructions were measured on the way and are part of
// this result's honest scope: nearby slabs reshape each other's domains (series
// composition fails), kick regimes are properties of whole configurations rather than
// single walls, and a traveller's own emission dresses its second crossing (the Wilson
// loop of a dynamical charge is self-dressed, as in any interacting gauge theory). The
// closure measurement needs an external non-back-reacting probe, which does not exist in
// a model where every excitation carries the interaction. Depth L2, deterministic, the
// particle's clean kick the reference the antiparticle row is conjugated against.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import { pairSub } from '@/code/algebra/linear/complex-pair'

const SIDE = 13

export default experiment({
  id: 'foundations/charge-signed-kick',
  code: 'E-FND-0128',
  title:
    'the kick generator is charge-signed, the abelian gauge coupling measured directly: the same wall steps the particle phase down one clock unit (one hundred fifty to thirty, clean at support one) and the antiparticle phase up one (minus one hundred fifty to minus thirty, read at the amplitude level through a small stable dressing with the amplitude locked at root three), while Z three closure by composition stays honestly open with its three measured obstructions recorded (mutual domain reshaping, configuration-global regimes, self-wake dressing of the Wilson loop)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = turningWeave({ opposite })
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const cellAt = (v: number[]): number =>
      v[0]! + v[1]! * SIDE + v[2]! * SIDE * SIDE + v[3]! * SIDE ** 3
    const mid = 6

    const slab = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      if (coordinate(c, 0) === 4) {
        slab.add(c)
      }
    }

    const runTone = (
      tone: number,
    ): { before: string; after: string; cleanBefore: boolean; supportAfter: number } => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      let before = ''
      let after = ''
      let cleanBefore = true
      let supportAfter = 0

      for (let t = 0; t < 20; t++) {
        if (t === 3) {
          const slot = cellAt([1, 0, mid, mid]) * 24 + 0
          const v = seeded.data[slot]!

          seeded.data[slot] = (((v + tone + 4) % 3) -
            1) as -1 | 0 | 1
        }

        const active = (c: number): boolean =>
          slab.has(c) ? t >= 7 : true

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)

        let s = 0

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            s++
          }
        }

        const d = pairSub(clockAmplitude(seeded), clockAmplitude(vacuum))
        const m = Math.hypot(d[0], d[1])
        const clean = Math.abs(m - Math.sqrt(3)) < 1e-9
        const phase = clean
          ? String(Math.round(phaseDegrees([d[0], d[1]])))
          : 'off'

        if (t === 8) {
          before = phase

          if (s !== 1) {
            cleanBefore = false
          }
        }

        if (t === 19) {
          after = phase
          supportAfter = s
        }
      }

      return { before, after, cleanBefore, supportAfter }
    }

    const particle = runTone(1)
    const antiparticle = runTone(-1)

    const ok =
      particle.before === '150' &&
      particle.after === '30' &&
      particle.cleanBefore &&
      particle.supportAfter === 1 &&
      antiparticle.before === '-150' &&
      antiparticle.after === '-30' &&
      antiparticle.cleanBefore &&
      antiparticle.supportAfter <= 3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the particle steps one hundred fifty to thirty at support one and the antiparticle steps minus one hundred fifty to minus thirty with amplitude locked at root three and dressing bounded at three slots, opposite unit kicks from the same wall',
      metrics: {
        particleBefore: Number(particle.before),
        particleAfter: Number(particle.after),
        antiparticleBefore: Number(antiparticle.before),
        antiparticleAfter: Number(antiparticle.after),
        antiparticleSupportAfter: antiparticle.supportAfter,
      },
      // CONTROL: the particle row, the same instrument reading the clean opposite step
      control: {
        particleClean: particle.supportAfter === 1 ? 1 : 0,
      },
      notes:
        'the composition obstructions are measured facts of this rule, not failures of instrumentation: an interacting gauge theory has no external probe charge, so closure must come from the algebra of the kick action itself (charge-signed unit steps on a three-class orbit close Z three group-theoretically) rather than from sequential transport, and that inference versus measurement gap is stated as the row honest scope.',
    })
  },
})
