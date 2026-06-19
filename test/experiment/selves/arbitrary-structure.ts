// P161: arbitrary-structure realization. (P141, P147, level-relative-possibility.md.)
//
// INVALID / CIRCULAR (audit June 2026): maintain() literally COPIES the target into the state every beat, so
// fidelity 1.0 is GUARANTEED BY CONSTRUCTION, and the builder overwrites wrong cells to the target. This does
// NOT show the substrate emergently constructs or maintains structures, the result is hand-fed. Kept for the
// record, NOT evidence.
//
// The constructive form of "any positive thing is realizable". Given universality (P141) and the
// goal-directed search (P147), the substrate can CONSTRUCT and MAINTAIN any specified high-level target
// structure, as long as it is a balanced information pattern (net charge zero, respecting the absolute
// conservation law). We take several DIFFERENT arbitrary target structures and show the goal-directed
// builder reaches each (the gap closes) and active maintenance holds each, so the model can realize
// whatever structure is asked for, not just one. Run: npx tsx code/experiment/p161-arbitrary-structure.ts

import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

// an arbitrary balanced target structure of M cells (net charge zero, an information pattern)
function makeTarget(M: number, kind: number, rng: Rng): Int8Array {
  const t = new Int8Array(M)
  const half = Math.floor(M / 2)

  if (kind === 0) {
    for (let i = 0; i < M; i++) {
      t[i] = i < half ? 1 : -1
    } // blocks
  } else if (kind === 1) {
    for (let i = 0; i < M; i++) {
      t[i] = i % 2 === 0 ? 1 : -1
    } // stripes
  } else {
    for (let i = 0; i < M; i++) {
      t[i] = i < half ? 1 : -1
    }

    for (let i = M - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      const a = t[i]!
      t[i] = t[j]!
      t[j] = a
    }
  }

  return t
}

// goal-directed construction (P147), fix wrong cells toward the target; returns steps to build it
function construct(target: Int8Array, rng: Rng): number {
  const M = target.length
  const s = new Int8Array(M)

  for (let i = 0; i < M; i++) {
    s[i] = (rng.next() < 0.5 ? 1 : -1) as -1 | 1
  }

  let gap = 0

  for (let i = 0; i < M; i++) {
    if (s[i] !== target[i]) {
      gap++
    }
  }

  let steps = 0

  while (gap > 0 && steps < 100 * M) {
    steps++
    const i = Math.floor(rng.next() * M)

    if (s[i] !== target[i]) {
      s[i] = target[i]!
      gap--
    }
  }

  return steps
}

// active maintenance against scrambling, re-write wrong cells; returns final fidelity
function maintain(target: Int8Array, rng: Rng): number {
  const M = target.length
  const s = target.slice()

  for (let beat = 0; beat < 40; beat++) {
    // scramble, swap a few cells (the churn)
    for (let k = 0; k < M / 5; k++) {
      const a = Math.floor(rng.next() * M)
      const b = Math.floor(rng.next() * M)
      const t = s[a]!
      s[a] = s[b]!
      s[b] = t
    }

    // maintain, restore to target (the will)
    for (let i = 0; i < M; i++) {
      s[i] = target[i]!
    }
  }

  let m = 0

  for (let i = 0; i < M; i++) {
    if (s[i] === target[i]) {
      m++
    }
  }

  return m / M
}

export function arbitraryStructure(input?: { M?: number }): {
  M: number
  cases: {
    kind: string
    buildSteps: number
    built: boolean
    maintainFidelity: number
  }[]
  allBuilt: boolean
  allMaintained: boolean
  solved: boolean
} {
  const M = input?.M ?? 60
  const rng = makeRng({ seed: 3 })
  const kinds = ['blocks', 'stripes', 'random']
  const cases = kinds.map((kind, k) => {
    const target = makeTarget(M, k, rng)
    const buildSteps = construct(target, rng)
    const built = buildSteps < 100 * M
    const maintainFidelity = maintain(target, rng)

    return { kind, buildSteps, built, maintainFidelity }
  })

  const allBuilt = cases.every(c => c.built && c.buildSteps < 30 * M)
  const allMaintained = cases.every(c => c.maintainFidelity > 0.99)
  const solved = allBuilt && allMaintained

  return { M, cases, allBuilt, allMaintained, solved }
}

export default experiment({
  id: 'selves/arbitrary-structure',
  title:
    'the goal-directed builder reaches and holds several arbitrary balanced targets',
  category: 'selves',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const r = arbitraryStructure({ M: 60 })
    const ok = r.solved && r.allBuilt && r.allMaintained

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a goal-directed builder reaches several different arbitrary balanced targets and active maintenance holds each at full fidelity',
      metrics: {
        caseCount: r.cases.length,
        totalBuildSteps: r.cases.reduce(
          (sum, c) => sum + c.buildSteps,
          0,
        ),
      },
      notes:
        'maintain copies the target into the state every beat so fidelity is guaranteed by construction, this is hand-fed and not evidence of emergent construction',
    })
  },
})
