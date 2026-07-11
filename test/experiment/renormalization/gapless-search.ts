// P136: hunt for a GAPLESS critical point of the rule. (P134, quantization-status.md.)
//
// P134 found the conserved-exchange field is generically MASSIVE (short correlation) at the rates tried,
// which blocks a sharp spatial-RP and Lorentz test (those need a long-range, gapless regime). The rule has
// three competing processes, CREATION (arrow), ANNIHILATION (share), and HOPPING. So far share has been
// deterministic (=1), which destroys pairs instantly and likely keeps the field massive. This scans the
// two-parameter (arrow, share) plane on a flat 1D chain and measures the correlation length, looking for a
// critical point where it DIVERGES (a gapless theory). If found, that is the regime where spatial RP and
// emergent Lorentz become sharply testable. If none is found across the plane, the field is robustly
// massive with these knobs and the rule itself would need a new process to be gapless.
// Run: npx tsx code/experiment/p136-gapless-search.ts

import { makeRng } from '@/code/tool/rng'
import { conservingRingSweepTunable } from '@/code/dynamics/conserving-sweep'
import {
  correlationLengthFromDecay,
  timeAveragedRingCorrelation,
} from '@/code/measure/connected-correlation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function gaplessSearch(input?: {
  L?: number
  arrows?: number[]
  shares?: number[]
}): {
  L: number
  grid: {
    arrow: number
    share: number
    density: number
    range: number
    correlationLength: number
  }[]
  best: {
    arrow: number
    share: number
    density: number
    range: number
    correlationLength: number
  }
  maxRange: number
  gaplessFound: boolean
  robustlyMassive: boolean
  solved: boolean
} {
  const L = input?.L ?? 3000
  const arrows = input?.arrows ?? [0.05, 0.15, 0.4]
  const shares = input?.shares ?? [1.0, 0.5, 0.2, 0.05]
  const maxR = 16

  const measure = (
    arrow: number,
    share: number,
  ): { range: number; xi: number; density: number } => {
    const tone = new Int8Array(L)
    const moved = new Uint8Array(L)
    const rng = makeRng({ seed: 17 })

    for (let i = 0; i < L; i++) {
      tone[i] = rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0
    }

    for (let t = 0; t < 400; t++) {
      conservingRingSweepTunable({
        tone,
        length: L,
        moved,
        rng,
        arrow,
        share,
        hop: 0.5,
      })
    }

    const T = 2500

    let nz = 0

    const c = timeAveragedRingCorrelation({
      tone,
      length: L,
      maxR,
      beats: T,
      relax: () => {
        for (let x = 0; x < L; x++) {
          if (tone[x] !== 0) {
            nz++
          }
        }

        conservingRingSweepTunable({
          tone,
          length: L,
          moved,
          rng,
          arrow,
          share,
          hop: 0.5,
        })
      },
    })

    // use the larger of direct and staggered range (the particle may be at the band edge)
    const rangeOf = (cc: number[]): number => {
      let rng2 = 0

      for (let r = 1; r <= maxR; r++) {
        if (Math.abs(cc[r]!) > 0.05 * Math.abs(cc[0]!)) {
          rng2 = r
        }
      }

      return rng2
    }

    const cStag = c.map((v, r) => (r % 2 === 0 ? v : -v))
    const range = Math.max(rangeOf(c), rangeOf(cStag))
    // correlation length from the slower-decaying of direct / staggered |C(r)| over r=1..8
    const xiOf = (cc: number[]): number =>
      correlationLengthFromDecay({ correlation: cc, rLo: 1, rHi: 8 })

    const xi = Math.max(xiOf(c), xiOf(cStag))

    return { range, xi: isFinite(xi) ? xi : 99, density: nz / (L * T) }
  }

  const grid: {
    arrow: number
    share: number
    density: number
    range: number
    correlationLength: number
  }[] = []

  for (const arrow of arrows) {
    for (const share of shares) {
      const { range, xi, density } = measure(arrow, share)

      grid.push({ arrow, share, density, range, correlationLength: xi })
    }
  }

  const best = grid.reduce((a, b) => (b.range > a.range ? b : a))
  const maxRange = best.range
  const gaplessFound = maxRange >= 5 // a genuinely long-range regime (vs the massive range ~1)
  const robustlyMassive = maxRange <= 2 // contact-dominated everywhere on the plane
  const solved = gaplessFound || robustlyMassive // a clear verdict either way

  return {
    L,
    grid,
    best,
    maxRange,
    gaplessFound,
    robustlyMassive,
    solved,
  }
}

export default experiment({
  id: 'renormalization/gapless-search',
  code: 'E-SCL-0009',
  title:
    'no static gapless critical point over the arrow-share plane, the conserved-exchange field is robustly massive',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = gaplessSearch({ L: 600 })
    const ok = r.solved && r.robustlyMassive && !r.gaplessFound

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the charge correlation stays contact-dominated across the whole arrow-share plane so there is no static gapless critical point, the gapless mode must be dynamic and hydrodynamic',
      metrics: {
        maxRange: r.maxRange,
        gaplessFound: r.gaplessFound ? 1 : 0,
      },
    })
  },
})
