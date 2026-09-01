// Leizerman's one-dial map, QM and gravity as the two ends of one memory-kernel width
// (samuel-leizerman in the related-theories census). A localized packet on a ring evolves
// by a second-order reversible wave whose "previous" slot is replaced by an average over
// the last w beats, a causal-past memory kernel of width w. The transport exponent (how the
// packet radius grows with time) reads which regime it is in: near one is ballistic (the
// packet spreads linearly, the Schrodinger/quantum end), near one half is diffusive (it
// spreads as the square root of time, the gravity/infrared end). Widening the single kernel
// carries the field from one to the other, so one parameter interpolates QM and gravity,
// Leizerman's claim made measurable.
//
// Depth L2, a transport-exponent crossover (known physics), read through Leizerman map, with
// the ballistic short-width limit the anchor the wide-width limit must depart from.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  packetRmsTrace,
  transportExponent,
} from '@/code/measure/kernel-width-transport'

function alphaAtWidth(width: number): number {
  const trace = packetRmsTrace({ ringLength: 512, width, beats: 160 })

  return transportExponent({ trace, tMin: 12, tMax: 100 })
}

export default experiment({
  id: 'quantum/memory-kernel-width-dial',
  code: 'E-QTM-0048',
  title:
    'one memory-kernel width carries a packet from ballistic (transport exponent near one, the quantum end) to diffusive (near one half, the gravity end), Leizerman one-dial QM-to-gravity map',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const ballisticAlpha = alphaAtWidth(1)
    const midAlpha = alphaAtWidth(4)
    const wideAlpha = alphaAtWidth(16)
    const widestAlpha = alphaAtWidth(64)

    const ballisticEnd = ballisticAlpha > 0.85
    const diffusiveEnd = widestAlpha < 0.6
    const monotone =
      ballisticAlpha > midAlpha &&
      midAlpha >= wideAlpha &&
      wideAlpha >= widestAlpha

    const ok = ballisticEnd && diffusiveEnd && monotone

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one memory-kernel width interpolates the two regimes Leizerman names, quantum and gravity. At width one the kernel is the bare second-order wave and a packet spreads ballistically, transport exponent near one, the Schrodinger quantum end. As the causal-past width grows the memory smooths the wave into a diffusion and the exponent falls toward one half, the gravitational infrared end. So a single parameter carries the field from one limit to the other, which is the one-dial QM-to-gravity map, measured as a monotone crossover of the transport exponent. Depth L2, a known transport crossover read through Leizerman map, the ballistic short-width limit the anchor.',
      metrics: {
        ballisticAlpha,
        midAlpha,
        wideAlpha,
        widestAlpha,
        crossover: ballisticAlpha - widestAlpha,
      },
      control: {
        ballisticAlpha,
      },
      notes:
        'the ballistic short-width limit is the anchor and the control: it could have failed to be ballistic (a broken measure would diffuse even at width one), and it does not, so the departure to one half at wide width is a real crossover, not a measurement artifact. The kernel width is a probe parameter on the propagating field, not a change to the base rule, and the exponent is read out of the dynamics, not assumed.',
    })
  },
})
