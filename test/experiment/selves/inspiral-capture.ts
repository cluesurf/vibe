// The capture recipe, demonstrated end to end (inspiral-capture-design, routes-to-nested-selves). Nested selves
// need CAPTURE, two structures binding into one, and the arc established that capture needs TWO ingredients, an
// attractive interaction (a bound state to fall into) and a bath (somewhere to shed the binding energy). The
// reversible bulk supplies neither, so this is the reduced canonical model of the mechanism, the relative
// coordinate of two opposite charges (the binding well is the attraction) coupled to a radiative field-chain bath
// (an absorbing far end is radiation leaving to infinity). It is the same physics that forms positronium or a
// binary inspiral.
//
// Two charges are launched APART (outward relative velocity). Capture means the relative coordinate stays bounded
// and SETTLES small. Three cases isolate the two ingredients.
//   attractive + bath:    the well pulls them back and the bath drains the energy, they settle to r ~ 0, CAPTURE.
//   attractive + no bath: the well pulls them back but the radiated energy reflects and returns, they oscillate
//                         forever, bound but never settled, NO capture.
//   repulsive  + bath:    no bound state to fall into, they coast out and escape, the bath cannot bind them.
//
// Only attractive-plus-bath captures, so BOTH ingredients are necessary. Honest status, L2 and reduced, both the
// attraction and the bath are modeled, not derived from the committed rule. The substrate-faithful half (the bath
// as the open or infinite lattice) is `selves/bath-from-open-boundary`. Whether the ATTRACTION can emerge from
// the pure rule is the open L3, probed in `selves/emergent-attraction-search`.
//
// Depth L2, the recipe demonstrated with two controls, no bath (reflecting) and no attraction (repulsive).

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the late amplitude of the relative coordinate, an attractive well + a radiative chain bath, launched outward.
function lateAmplitude(input: { absorbing: boolean; stiffness: number }): { early: number; late: number } {
  const chain = 80 // bath field sites
  const sponge = 24 // absorbing layer width at the far end
  const couple = 0.35 // oscillator-to-bath coupling (how strongly it radiates)
  const waveSpeed2 = 1.0
  const dt = 0.2
  const steps = 6000

  let r = 0.2 // initial separation
  let vr = 0.6 // launched APART
  const u = new Array<number>(chain).fill(0)
  const w = new Array<number>(chain).fill(0)

  let early = 0
  let late = 0
  for (let t = 0; t < steps; t++) {
    // relative coordinate: the binding well plus the coupling to bath site 0
    const ar = -input.stiffness * r - couple * (r - u[0]!)
    // bath wave with fixed ends, site 0 driven by the oscillator
    const au = new Array<number>(chain).fill(0)
    for (let x = 0; x < chain; x++) {
      const left = x > 0 ? u[x - 1]! : 0
      const right = x < chain - 1 ? u[x + 1]! : 0
      au[x] = waveSpeed2 * (left - 2 * u[x]! + right)
    }
    au[0]! += couple * (r - u[0]!)
    vr += ar * dt
    r += vr * dt
    if (r > 1000) { r = 1000; vr = 0 } else if (r < -1000) { r = -1000; vr = 0 } // it escaped the well
    for (let x = 0; x < chain; x++) { w[x]! += au[x]! * dt; u[x]! += w[x]! * dt }
    // the absorbing layer, radiation reaching the far end leaves to infinity (the bath)
    if (input.absorbing) {
      for (let x = chain - sponge; x < chain; x++) {
        const depth = (x - (chain - sponge)) / sponge
        const damp = 1 - 0.06 * depth
        u[x]! *= damp
        w[x]! *= damp
      }
    }
    const amp = Math.abs(r)
    if (t < steps * 0.15 && amp > early) early = amp
    if (t > steps * 0.7 && amp > late) late = amp
  }
  return { early, late }
}

export default defineExperiment({
  id: 'selves/inspiral-capture',
  title: 'attraction plus a bath captures (inspiral and settle), removing either one prevents capture',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const attractiveBath = lateAmplitude({ absorbing: true, stiffness: 1.0 })
    const attractiveNoBath = lateAmplitude({ absorbing: false, stiffness: 1.0 })
    const repulsiveBath = lateAmplitude({ absorbing: true, stiffness: -0.5 })

    // only attraction + bath settles, the other two do not, so BOTH ingredients are necessary.
    const captured = attractiveBath.late < 0.1
    const noBathOscillates = attractiveNoBath.late > 0.2
    const noAttractionEscapes = repulsiveBath.late > 100

    const ok = captured && noBathOscillates && noAttractionEscapes
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a pair launched apart in an attractive well coupled to a radiative bath inspirals and SETTLES (capture), while removing the bath (a reflecting end) leaves it oscillating forever and removing the attraction (a repulsive well) lets it escape, so capture requires BOTH an attractive interaction and a bath, exactly the recipe the self arc predicted',
      metrics: {
        attractiveBathLate: attractiveBath.late,
        attractiveNoBathLate: attractiveNoBath.late,
        repulsiveBathLate: repulsiveBath.late,
        startAmplitude: attractiveBath.early,
        captured: captured ? 1 : 0,
        noBathOscillates: noBathOscillates ? 1 : 0,
        noAttractionEscapes: noAttractionEscapes ? 1 : 0,
      },
      control: { attractiveNoBathLate: attractiveNoBath.late, repulsiveBathLate: repulsiveBath.late },
      notes:
        'reduced canonical model (L2), the attraction is a binding well and the bath is a radiative chain with an absorbing end, both modeled not derived from the committed rule. It proves the recipe, capture = attraction + bath, and that both are necessary. The bath half is substrate-faithful in selves/bath-from-open-boundary, the attraction half (does it emerge from the pure rule) is the open L3 in selves/emergent-attraction-search',
    })
  },
})
