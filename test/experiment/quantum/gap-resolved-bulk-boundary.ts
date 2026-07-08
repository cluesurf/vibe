// The gap-resolved bulk-boundary correspondence: a chiral walk carries TWO independent topological
// invariants, one per quasienergy gap, and each gap's edge-mode count is fixed by ITS OWN winding jump.
// The bulk-boundary-correspondence experiment showed an interface binds edge modes; this shows the
// precise, quantitative law behind it. The split-step walk has a gap at quasienergy 0 and a gap at pi,
// with independent winding numbers nu0 and nuPi (computed analytically from the Bloch Hamiltonian via
// the two symmetric time frames, Asboth-Obuse). The number of edge modes an interface binds is
// 2|delta nu0| at the 0 gap and 2|delta nuPi| at the pi gap (the factor 2 is the two interfaces of the
// periodic ring), and the two are INDEPENDENT: an interface can bind modes at one gap and none at the
// other.
//
// Three gapped bulk phases are used, with (nu0, nuPi) = (1, 1), (1, -1) and (-1, 1). Their interfaces
// realise every combination:
//   - (1,1) | (-1,1): delta nu0 = 2, delta nuPi = 0  ->  (4, 0)  edge modes at the 0 gap ONLY
//   - (1,1) | (1,-1): delta nu0 = 0, delta nuPi = 2  ->  (0, 4)  edge modes at the pi gap ONLY
//   - (1,-1) | (-1,1): delta nu0 = 2, delta nuPi = 2  ->  (4, 4)  edge modes at BOTH gaps
//   - any phase against itself: (0, 0)
//
// - PREDICTION: for every pair, the measured edge-mode count at each gap equals 2 times the gap's
//   winding jump, 2|delta nu0| and 2|delta nuPi|, with the two gaps independent (the (4,0) and (0,4)
//   cases prove a mode can live at one gap and not the other).
// - CONTROL: a phase interfaced with itself (no winding jump at either gap) binds zero at both gaps.
//
// Depth L3. The gap-resolved edge counts are MEASURED from the walk operator's spectrum and matched,
// integer for integer, to two INDEPENDENT bulk winding invariants computed from the Bloch Hamiltonian.
// It is the precise, quantitative bulk-boundary correspondence for the chiral walk: not just that edge
// modes exist, but exactly how many at each gap and why, with two separate invariants.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { edgeModeCountFromProfile } from '@/code/measure/topological-edge-modes'
import { gapResolvedWinding, quasienergyGaps } from '@/code/measure/walk-winding'

const PI = Math.PI
const SIZE = 48
const IFACE = SIZE / 2

// three gapped phases with (nu0, nuPi) = (1,1), (1,-1), (-1,1)
const PHASES: Record<string, [number, number]> = {
  a: [(-2 * PI) / 3, -PI / 2], // (1, 1)
  b: [-PI / 2, (-2 * PI) / 3], // (1, -1)
  c: [-PI / 2, (2 * PI) / 3], // (-1, 1)
}

function edges(pL: [number, number], pR: [number, number]): { zero: number; pi: number } {
  return edgeModeCountFromProfile({
    size: SIZE,
    theta1: x => (x < IFACE ? pL[0] : pR[0]),
    theta2: x => (x < IFACE ? pL[1] : pR[1]),
  })
}

export default experiment({
  id: 'quantum/gap-resolved-bulk-boundary',
  code: 'E-QTM-0081',
  title:
    'the gap-resolved bulk-boundary correspondence: a chiral walk carries two independent topological invariants (one per quasienergy gap), and an interface binds 2|delta nu0| edge modes at the 0 gap and 2|delta nuPi| at the pi gap, so an interface can bind modes at one gap and none at the other (4,0) or (0,4), matched integer-for-integer to the bulk windings computed from the Bloch Hamiltonian',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const names = Object.keys(PHASES)

    // confirm all three phases are genuinely gapped at both gaps (else the winding is undefined)
    const allGapped = names.every(n => {
      const g = quasienergyGaps({ theta1: PHASES[n]![0], theta2: PHASES[n]![1] })
      return g.gapZero > 0.15 && g.gapPi > 0.15
    })

    // bulk invariants (nu0, nuPi) from the Bloch Hamiltonian
    const invariants = Object.fromEntries(
      names.map(n => [n, gapResolvedWinding({ theta1: PHASES[n]![0], theta2: PHASES[n]![1] })]),
    )
    const expectedInvariants =
      invariants.a!.nu0 === 1 && invariants.a!.nuPi === 1 &&
      invariants.b!.nu0 === 1 && invariants.b!.nuPi === -1 &&
      invariants.c!.nu0 === -1 && invariants.c!.nuPi === 1

    // every interface: measured (zero, pi) must equal (2|delta nu0|, 2|delta nuPi|)
    let allMatch = true
    for (let i = 0; i < names.length; i++) {
      for (let j = i; j < names.length; j++) {
        const ni = names[i]!
        const nj = names[j]!
        const e = edges(PHASES[ni]!, PHASES[nj]!)
        const predZero = 2 * Math.abs(invariants[ni]!.nu0 - invariants[nj]!.nu0)
        const predPi = 2 * Math.abs(invariants[ni]!.nuPi - invariants[nj]!.nuPi)
        if (e.zero !== predZero || e.pi !== predPi) allMatch = false
      }
    }

    // INDEPENDENCE: one interface binds at the 0 gap only, another at the pi gap only
    const zeroGapOnly = edges(PHASES.a!, PHASES.c!) // (4, 0)
    const piGapOnly = edges(PHASES.a!, PHASES.b!) // (0, 4)
    const gapsIndependent =
      zeroGapOnly.zero > 0 && zeroGapOnly.pi === 0 &&
      piGapOnly.pi > 0 && piGapOnly.zero === 0

    // CONTROL: a phase against itself binds nothing at either gap
    const self = edges(PHASES.a!, PHASES.a!)
    const controlZero = self.zero === 0 && self.pi === 0

    const ok =
      allGapped && expectedInvariants && allMatch && gapsIndependent && controlZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'three gapped phases with bulk invariants (nu0,nuPi) = (1,1),(1,-1),(-1,1) bind edge modes whose gap-resolved counts equal 2|delta nu0| and 2|delta nuPi| at every interface, with the two gaps independent: (1,1)|(-1,1) binds 4 modes at the 0 gap and 0 at pi, (1,1)|(1,-1) binds 0 at the 0 gap and 4 at pi, so the chiral walk carries two independent topological invariants matched to the measured spectrum',
      metrics: {
        zeroGapOnly: `${zeroGapOnly.zero},${zeroGapOnly.pi}`,
        piGapOnly: `${piGapOnly.zero},${piGapOnly.pi}`,
        bothGaps: (() => { const e = edges(PHASES.b!, PHASES.c!); return `${e.zero},${e.pi}` })(),
      },
      // CONTROL: a phase interfaced with itself (no winding jump) binds nothing.
      control: {
        selfInterface: `${self.zero},${self.pi}`,
      },
      notes:
        'Gap-resolved bulk-boundary correspondence: edge counts (code/measure/topological-edge-modes) matched integer-for-integer to two INDEPENDENT bulk windings nu0, nuPi (code/measure/walk-winding, Bloch-Hamiltonian, Asboth-Obuse two-frame). Interfaces realise (4,0), (0,4), (4,4), (0,0) = 2|delta nu_gap| per gap. The precise quantitative bulk-boundary law with two invariants. L3.',
    })
  },
})
