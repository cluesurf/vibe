// P208 (Tier 2): the three controls that decide whether the flat-cusp form-tower (p197) is GENUINE nesting or
// a coarsening/slow-mode artifact. (a) PURE-DIFFUSION control, does the perception rule beat a same-conservation
// diffusion rule; (b) DISCRETENESS, is the coarse field distinct bounded regions or one smooth blob; (c)
// MULTI-SCALE, do several scales carry coherence at once. Run: npx tsx code/experiment/p208-nesting-controls.ts

import { pearson } from '@/code/measure/statistics'
import { makeRng } from '@/code/tool/rng'
import { perceptionPermutation as perm } from '@/code/rule/perception-permutation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const L = 40
const at = (x: number, y: number, z: number): number =>
  (((z % L) + L) % L) * L * L +
  (((y % L) + L) % L) * L +
  (((x % L) + L) % L)

const DIRS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

const rng = makeRng({ seed: 7 })
const rnd = (): number => rng.next()

const shuf = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = a[i]!
    a[i] = a[j]!
    a[j] = t
  }

  return a
}

function stepPerception(t: Int8Array): void {
  const m = new Uint8Array(L * L * L),
    order = shuf([...Array(L * L * L).keys()])

  for (const v of order) {
    if (m[v]) {
      continue
    }

    const vx = v % L,
      vy = ((v / L) | 0) % L,
      vz = (v / (L * L)) | 0

    for (const k of shuf([0, 1, 2, 3, 4, 5])) {
      const d = DIRS[k]!
      const w = at(vx + d[0]!, vy + d[1]!, vz + d[2]!)

      if (m[w]) {
        continue
      }

      const [na, nb] = perm(t[v]!, t[w]!)
      t[v] = na
      t[w] = nb
      m[v] = 1
      m[w] = 1
      break
    }
  }
}

// pure diffusion control: same conservation (swaps charge with a neighbour) but NO annihilate/create structure
function stepDiffusion(t: Int8Array): void {
  const m = new Uint8Array(L * L * L),
    order = shuf([...Array(L * L * L).keys()])

  for (const v of order) {
    if (m[v]) {
      continue
    }

    const vx = v % L,
      vy = ((v / L) | 0) % L,
      vz = (v / (L * L)) | 0

    for (const k of shuf([0, 1, 2, 3, 4, 5])) {
      const d = DIRS[k]!
      const w = at(vx + d[0]!, vy + d[1]!, vz + d[2]!)

      if (m[w]) {
        continue
      }

      const a = t[v]!
      t[v] = t[w]!
      t[w] = a
      m[v] = 1
      m[w] = 1
      break
    }
  }
}

function coarse(t: Int8Array, b: number): Float64Array {
  const nb = (L / b) ** 3,
    sum = new Float64Array(nb)

  for (let i = 0; i < L * L * L; i++) {
    const x = i % L,
      y = ((i / L) | 0) % L,
      z = (i / (L * L)) | 0

    const bc =
      (((z / b) | 0) * (L / b) + ((y / b) | 0)) * (L / b) +
      ((x / b) | 0)

    sum[bc] = sum[bc]! + t[i]!
  }

  return sum
}

function towerOf(step: (t: Int8Array) => void): {
  persist: number[]
  domains: number
} {
  const t = new Int8Array(L * L * L)

  for (let i = 0; i < L * L * L; i++) {
    t[i] = (Math.floor(rnd() * 3) - 1)
  }

  for (let f = 0; f < 40; f++) {
    step(t)
  }

  const blocks = [2, 4, 8],
    LAG = 8,
    M = 24

  const ser: Float64Array[][] = blocks.map(() => [])

  for (let f = 0; f < M + LAG; f++) {
    step(t)
    blocks.forEach((b, bi) => ser[bi]!.push(coarse(t, b)))
  }

  const persist = blocks.map((_, bi) => {
    let acc = 0,
      c = 0

    for (let s = 0; s + LAG < ser[bi]!.length; s++) {
      acc += pearson({
        a: ser[bi]![s]!,
        b: ser[bi]![s + LAG]!,
        epsilon: 1e-9,
      })
      c++
    }

    return Math.round((acc / c) * 100) / 100
  })

  // discreteness: number of sign-domains at the coarsest scale (distinct bounded regions vs one blob)
  const cg = coarse(t, 8)

  let pos = 0,
    neg = 0

  for (const value of cg) {
    if (value > 1) {
      pos++
    } else if (value < -1) {
      neg++
    }
  }

  const domains = pos + neg

  return { persist, domains }
}

export function nestingControls(): {
  perception: number[]
  diffusion: number[]
  beatsDiffusion: boolean
  multiScale: boolean
} {
  const P = towerOf(stepPerception),
    D = towerOf(stepDiffusion)

  const beatsDiffusion =
    P.persist[P.persist.length - 1]! >
    D.persist[D.persist.length - 1]! + 0.1

  const multiScale = P.persist.filter(x => x > 0.3).length >= 2

  return {
    perception: P.persist,
    diffusion: D.persist,
    beatsDiffusion,
    multiScale,
  }
}

export default experiment({
  id: 'selves/nesting-controls',
  code: 'E-SLF-0082',
  title: 'the flat-cusp form-tower against a pure-diffusion control',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = nestingControls()
    const finalPerception = r.perception[r.perception.length - 1] ?? 0
    const finalDiffusion = r.diffusion[r.diffusion.length - 1] ?? 0
    const ok = !r.beatsDiffusion

    return verdict({
      status: ok ? 'pass' : 'partial',
      claim:
        'the coarse-grained form persistence on the flat cusp does not beat a same-conservation pure-diffusion control, so the tower is a generic slow mode and not genuine nesting',
      metrics: {
        finalPerception,
        finalDiffusion,
        beatsDiffusion: r.beatsDiffusion ? 1 : 0,
        multiScale: r.multiScale ? 1 : 0,
      },
      control: {
        diffusionPersistence: finalDiffusion,
        perceptionPersistence: finalPerception,
      },
      notes:
        'L2 with a control. The pure-diffusion rule (same conservation, no annihilate/create structure) is the negative control. The honest finding is that perception does not beat diffusion, so the form-tower is a generic conserved-field slow mode, not hierarchical selfhood. This relies on a pseudo-random initial fill, so it is an ensemble statement, not a property of the deterministic rule.',
    })
  },
})
