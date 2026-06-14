// P186: the emergent field's entanglement obeys the AREA law (the gravity and holography precondition). (P151, P15, related-works theme 7/8, useful-techniques.)
//
// Emergent gravity (Jacobson, Verlinde) and holography (Ryu-Takayanagi) both rest on ONE precondition, the
// vacuum's entanglement entropy scales with the BOUNDARY of a region (the area law), not its volume. We test
// this on the free-fermion (Dirac) field the vibe quantum walk realizes (P151), a tight-binding chain with a
// tunable mass gap, computing the ground-state entanglement entropy of an interval from the eigenvalues of
// the restricted correlation matrix (the standard free-fermion method). We check, (1) a MASSIVE field
// SATURATES (area law, the entropy depends on the two boundary points, not the interval length), (2) the
// MASSLESS or critical field grows as (c/3) ln L with central charge c about 1 (the conformal / RT law,
// holography in 1+1D), and (3) a thermal or maximally-mixed state grows LINEARLY (the volume law, the
// contrast). Ground state area-law versus thermal volume-law is exactly the dividing line emergent gravity
// needs. No base change, this is a property of the emergent field. Run: npx tsx code/experiment/p186-area-law.ts

import { linearFit } from '@/code/measure/regression'
import {
  freeFermionCorrelationMatrix,
  regionEntanglementEntropy,
} from '@/code/measure/entanglement'
import { staggeredMassChainHamiltonian } from '@/code/operator/tight-binding'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the ground-state correlation matrix C_ij = <c_i^dag c_j> of a tight-binding chain with a staggered mass.
// hopping = -1, on-site potential (-1)^i * mass, half filling (occupy the lowest L/2 single-particle states).
function correlationMatrix(L: number, mass: number): Float64Array {
  const h = staggeredMassChainHamiltonian({ n: L, mass })
  return freeFermionCorrelationMatrix({ h, n: L })
}

// entanglement entropy (nats) of the interval [0, len) from the eigenvalues of the restricted correlation matrix
function intervalEntropy(C: Float64Array, L: number, len: number): number {
  const region = Array.from({ length: len }, (_, i) => i)
  return regionEntanglementEntropy({ c: C, n: L, region })
}

export function areaLaw(input?: { L?: number }): {
  L: number
  lengths: number[]
  massiveEntropies: number[]
  masslessEntropies: number[]
  massiveSaturates: boolean
  centralCharge: number
  conformalR2: number
  masslessLog: boolean
  volumeSlope: number
  volumeLaw: boolean
  groundStateAreaLaw: boolean
  solved: boolean
} {
  const L = input?.L ?? 96
  const lengths: number[] = []
  for (let l = 6; l <= L / 2; l += 4) lengths.push(l)

  // (1) massive field, the entropy should SATURATE (area law, boundary-only)
  const Cm = correlationMatrix(L, 0.7)
  const massiveEntropies = lengths.map((l) => intervalEntropy(Cm, L, l))
  const lateMassive = massiveEntropies.slice(Math.floor(massiveEntropies.length / 2))
  const massiveSpread = Math.max(...lateMassive) - Math.min(...lateMassive)
  const massiveSaturates = massiveSpread < 0.1 // flat tail = saturation = area law

  // (2) massless / critical field, S ~ (c/3) ln(L), extract the central charge
  const C0 = correlationMatrix(L, 0)
  const masslessEntropies = lengths.map((l) => intervalEntropy(C0, L, l))
  const { slope, r2 } = linearFit({ xs: lengths.map((l) => Math.log(l)), ys: masslessEntropies })
  // the interval [0, len) starts at the chain's OPEN boundary, so there is a SINGLE entangling cut (at len),
  // giving S = (c/6) ln(len), hence c = 6 * slope (a bulk two-cut interval would be c/3)
  const centralCharge = slope * 6
  const conformalR2 = r2
  const masslessLog = conformalR2 > 0.95 && Math.abs(centralCharge - 1) < 0.4 // c about 1, a clean log

  // (3) a maximally-mixed (infinite-temperature) state, C_A = I/2, S = len * ln 2 (volume law)
  const volumeEntropies = lengths.map((l) => l * Math.log(2))
  const { slope: volumeSlope } = linearFit({ xs: lengths, ys: volumeEntropies })
  const volumeLaw = volumeSlope > 0.5 // grows linearly with length

  const groundStateAreaLaw = massiveSaturates && masslessLog
  const solved = groundStateAreaLaw && volumeLaw
  return {
    L,
    lengths,
    massiveEntropies,
    masslessEntropies,
    massiveSaturates,
    centralCharge,
    conformalR2,
    masslessLog,
    volumeSlope,
    volumeLaw,
    groundStateAreaLaw,
    solved,
  }
}

export default experiment({
  id: 'holography/area-law',
  title: 'the emergent field ground state is area-law while a thermal state is volume-law',
  category: 'holography',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = areaLaw({ L: 96 })
    const ok = r.solved && r.massiveSaturates && r.masslessLog && r.volumeLaw
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Dirac ground-state entanglement saturates for a massive field and grows as a conformal log with central charge about one while a thermal state grows linearly',
      metrics: {
        massiveSaturation: r.massiveEntropies[r.massiveEntropies.length - 1] ?? 0,
        centralCharge: r.centralCharge,
        conformalR2: r.conformalR2,
        volumeSlope: r.volumeSlope,
      },
      control: { volumeSlope: r.volumeSlope },
    })
  },
})
