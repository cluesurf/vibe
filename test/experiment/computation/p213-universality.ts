// P213 (Tier 3): universality on the flat {4,3,4} cusp. Implement the Margolus billiard-ball CA (BBMCA), a
// REVERSIBLE block rule proven Turing-complete. Demonstrate the two universality primitives, a lone ball flies
// BALLISTICALLY (a wire), and the rule is exactly REVERSIBLE (forward then backward = identity). With ballistic
// signals + reversible collisions the BBMCA is universal, so the flat cusp computes. Ported as a runnable demo.
// Run: npx tsx code/experiment/p213-universality.ts

import { margolusStep } from '@/code/operator/margolus-billiard'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The Margolus billiard-ball block CA (margolusStep) lives in code/operator/margolus-billiard.
const L = 40
const at = (x: number, y: number): number =>
  (((y % L) + L) % L) * L + (((x % L) + L) % L)

const step = (g: Uint8Array, parity: number): void =>
  margolusStep(L, g, parity)

export function universality(): {
  ballistic: boolean
  reversible: boolean
  displacement: number
} {
  // (1) a lone ball flies ballistically (a wire)
  const g = new Uint8Array(L * L)
  g[at(8, 8)] = 1

  const start: [number, number] = [8, 8]

  for (let t = 0; t < 16; t++) {
    step(g, t % 2)
  }

  let bx = -1,
    by = -1

  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      if (g[at(x, y)]) {
        bx = x
        by = y
      }
    }
  }

  const displacement =
    Math.round(Math.hypot(bx - start[0], by - start[1]) * 10) / 10

  const ballistic = displacement > 6 // moved a clear distance in 16 steps (a propagating signal)
  // (2) exact reversibility: random field, forward T then backward T = identity
  const rng = makeRng({ seed: 17 })
  const rnd = (): number => rng.next()
  const h = new Uint8Array(L * L)

  for (let i = 0; i < L * L; i++) {
    h[i] = rnd() < 0.25 ? 1 : 0
  }

  const orig = h.slice()
  const T = 20

  for (let t = 0; t < T; t++) {
    step(h, t % 2)
  }

  for (let t = T - 1; t >= 0; t--) {
    step(h, t % 2)
  } // inverse = same block rotation in reverse parity order

  let reversible = true

  for (let i = 0; i < L * L; i++) {
    if (h[i] !== orig[i]) {
      reversible = false
      break
    }
  }

  return { ballistic, reversible, displacement }
}

// The flat {4,3,4} cusp runs the Margolus billiard-ball CA, a reversible block rule proven
// Turing-complete. We demonstrate the two universality primitives, a lone ball flies
// ballistically (a wire) and the rule is exactly reversible (forward then backward recovers
// the field bit-for-bit). With ballistic signals and reversible collisions the BBMCA is
// universal. This reproduces a known universal construction on the cusp, so L2. The
// reversibility test seeds via a deterministic LCG field, but the reversibility is exact and
// holds for any field.
export default experiment({
  id: 'computation/p213-universality',
  code: 'E-CMP-0006',
  title:
    'the flat {4,3,4} cusp runs the reversible Margolus billiard-ball CA (ballistic wire plus exact reversibility)',
  category: 'computation',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = universality()
    const ok = r.ballistic && r.reversible

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the flat cusp runs the Margolus billiard-ball CA, with a lone ball flying ballistically and the rule exactly reversible, the primitives of a universal construction',
      metrics: {
        displacement: r.displacement,
        ballistic: r.ballistic ? 1 : 0,
        reversible: r.reversible ? 1 : 0,
      },
      notes:
        'L2, a known universal reversible CA (the Margolus BBMCA) reproduced on the cusp. The reversibility test seeds a deterministic LCG field, but reversibility is exact and holds for any field. Universality is the standard ballistic-plus-reversible argument, cited, not re-proven.',
    })
  },
})
