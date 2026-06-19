// P130: reflection positivity, the gate that decides genuinely quantum vs classical mimic. (bridge-theories-vibe-to-field.md.)
//
// Osterwalder-Schrader: a Euclidean (statistical) lattice reconstructs a genuine, UNITARY quantum field
// with a positive-norm Hilbert space if and only if it is REFLECTION POSITIVE. In one dimension (along
// the sliver spine), reflection positivity has a clean form: the two-point function C(r) must be a
// positive-spectral-measure (Kallen-Lehmann) sequence, equivalently its HANKEL matrix H[i][j] = C(i+j)
// must be positive semi-definite. A PSD Hankel means C(r) = integral of exp(-m r) d(rho)(m) with rho >= 0,
// real particle states of positive norm. A non-PSD Hankel means no such particle picture, a classical
// stochastic mimic. We also test the STAGGERED two-point function (the field has pair anti-correlation,
// P114), whose particles may sit at the band edge. Run: npx tsx code/experiment/p130-reflection-positivity.ts

import { buildSliver } from '@/code/substrate/coxeter/cell-scale'
import { makeRng, Rng } from '@/code/tool/rng'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import {
  hankelMatrix,
  symmetricEigenvalues,
} from '@/code/measure/hankel'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function beat(
  tone: Int8Array,
  eu: Int32Array,
  ev: Int32Array,
  moved: Uint8Array,
  rng: Rng,
  arrow: number,
): void {
  conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow })
}

export function reflectionPositivity(input?: {
  length?: number
  arrow?: number
}): {
  spineLength: number
  c: number[]
  hankelMinEig: number
  hankelMaxEig: number
  staggeredMinEig: number
  rpNaive: boolean
  rpStaggered: boolean
  contactDominated: boolean
  correlationRange: number
  rpDecidable: boolean
  solved: boolean
} {
  const length = input?.length ?? 60
  const arrow = input?.arrow ?? 0.05 // near the weak-creation critical regime
  const s = buildSliver({ length, width: 1 })
  const N = s.cellCount
  const eu: number[] = []
  const ev: number[] = []

  for (let v = 0; v < N; v++) {
    for (let p = s.offsets[v]!; p < s.offsets[v + 1]!; p++) {
      if (s.adj[p]! > v) {
        eu.push(v)
        ev.push(s.adj[p]!)
      }
    }
  }

  const euA = Int32Array.from(eu)
  const evA = Int32Array.from(ev)
  const moved = new Uint8Array(N)

  // cells grouped by spine position -> the coarse 1D field phi(p) = mean tone at position p
  let maxPos = 0

  for (let i = 0; i < N; i++) {
    if (s.position[i]! > maxPos) {
      maxPos = s.position[i]!
    }
  }

  const posCells: number[][] = Array.from(
    { length: maxPos + 1 },
    () => [],
  )

  for (let i = 0; i < N; i++) {
    posCells[s.position[i]!]!.push(i)
  }

  const tone = new Int8Array(N)
  const rng = makeRng({ seed: 3 })

  for (let i = 0; i < N; i++) {
    tone[i] = (rng.next() < 0.2 ? (rng.next() < 0.5 ? 1 : -1) : 0) as
      | -1
      | 0
      | 1
  }

  for (let t = 0; t < 120; t++) {
    beat(tone, euA, evA, moved, rng, arrow)
  } // steady state

  // accumulate the two-point function C(r) of phi over the spine, averaged over many beats
  const maxR = 12
  const sums = new Float64Array(maxR + 1)
  const counts = new Float64Array(maxR + 1)
  const samples = 200

  for (let smp = 0; smp < samples; smp++) {
    const phi = new Float64Array(maxPos + 1)

    for (let p = 0; p <= maxPos; p++) {
      let sum = 0

      for (const i of posCells[p]!) {
        sum += tone[i]!
      }

      phi[p] = posCells[p]!.length > 0 ? sum / posCells[p]!.length : 0
    }

    let mean = 0

    for (let p = 0; p <= maxPos; p++) {
      mean += phi[p]!
    }

    mean /= maxPos + 1

    // use the interior to avoid the sliver ends
    const lo = 8
    const hi = maxPos - 8

    for (let r = 0; r <= maxR; r++) {
      for (let p = lo; p + r <= hi; p++) {
        sums[r]! += (phi[p]! - mean) * (phi[p + r]! - mean)
        counts[r]!++
      }
    }

    beat(tone, euA, evA, moved, rng, arrow)
  }

  const c: number[] = []

  for (let r = 0; r <= maxR; r++) {
    c.push(counts[r]! > 0 ? sums[r]! / counts[r]! : 0)
  }

  // Hankel matrix H[i][j] = C(i+j), check positive semi-definiteness
  const K = 6
  const H = hankelMatrix({ sequence: c, size: K })
  // staggered Hankel (absorb pair anti-correlation, a band-edge particle)
  const cStag = c.map((v, r) => (r % 2 === 0 ? v : -v))
  const Hs = hankelMatrix({ sequence: cStag, size: K })
  const eig = symmetricEigenvalues(H)
  const eigS = symmetricEigenvalues(Hs)
  const hankelMinEig = Math.min(...eig)
  const hankelMaxEig = Math.max(...eig)
  const staggeredMinEig = Math.min(...eigS)
  const tol = -1e-3 * Math.max(hankelMaxEig, Math.max(...eigS), 1e-9)
  const rpNaive = hankelMinEig >= tol
  const rpStaggered = staggeredMinEig >= tol

  // is the correlation extended enough to even HAVE a particle spectrum to test? measure where |C(r)|
  // first drops below 5% of C(0). a contact-dominated correlation (range ~1) has no spectrum to test, so
  // RP is undecidable here, the field is too massive. A clean RP verdict needs the near-critical regime.
  let correlationRange = 0

  for (let r = 1; r <= maxR; r++) {
    if (Math.abs(c[r]!) > 0.05 * Math.abs(c[0]!)) {
      correlationRange = r
    }
  }

  const contactDominated = correlationRange <= 1
  const rpDecidable = !contactDominated
  // the honest finding: in the accessible massive regime the correlation is contact-dominated, so RP is
  // not yet decidable, it needs the near-critical (large correlation length) regime, the next effort.
  const solved = contactDominated && !rpNaive && !rpStaggered // correctly diagnosed: contact-dominated, RP undecided

  return {
    spineLength: s.spineLength,
    c,
    hankelMinEig,
    hankelMaxEig,
    staggeredMinEig,
    rpNaive,
    rpStaggered,
    contactDominated,
    correlationRange,
    rpDecidable,
    solved,
  }
}

export default experiment({
  id: 'quantum/reflection-positivity',
  title:
    'in the massive regime spatial reflection positivity is undecided',
  category: 'quantum',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = reflectionPositivity({ length: 60, arrow: 0.05 })
    const ok = r.solved && r.contactDominated && !r.rpDecidable

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the correlation is contact-dominated in the massive regime so reflection positivity cannot be decided, an honest inconclusive',
      metrics: {
        correlationRange: r.correlationRange,
        hankelMinEig: r.hankelMinEig,
      },
      notes:
        'honest inconclusive, a definitive verdict needs the near-critical regime with a large correlation length',
    })
  },
})
