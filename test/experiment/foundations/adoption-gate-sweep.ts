// The adoption gate for the traveller knit, run on the committed substrate, and its verdict. The
// question left by E-FND-0101: does lineHop find a CPT partner in the larger symmetry group of the
// d4 mesh, or does adopting it mean adopting CPT violation? Here the full group that acts on the d4
// torus is swept: all 384 signed-permutation point-group elements, times the six tone permutations,
// times velocity reversal, 4,608 conjugations, each tested as a symmetry and as a reversal (the
// corrected half-step convention) on three generic states.
//
//   - THE COMMITTED CHARGE KNIT: CPT is exact on the real substrate. Negation with full spatial
//     inversion is an exact symmetry, and with velocity reversal an exact reversal, confirming the
//     E-FND-0101 square-mesh finding on the committed 24-direction mesh.
//   - LINEHOP FAILS THE GATE COMPLETELY: the identity is its ONLY exact conjugation. Not one
//     reversal exists in the whole group, not even the PT that survived on the square mesh. The
//     obstruction is structural and locatable: negation fixes the swap clause and inverts the clock
//     table, so the only thing standing between lineHop and CPT is the ORDER of swap and clock
//     inside the collision.
//   - THE REPAIR IS ONE LINE: apply the swap on both sides, swap-clock-swap (linePalindrome). A
//     palindrome inverts by inverting its middle, so negation conjugates the whole collision to its
//     own inverse, and the sweep finds exactly one nontrivial exact conjugation for it: negation,
//     full inversion, velocity reversal. CPT EXACT, C AND CP STILL VIOLATED (no other tone-permuted
//     conjugation is exact), the weak-interaction pattern with the particle kept (E-FND-0103).
//
// So the gate closes with a verdict and a candidate: lineHop as-is is unadoptable, and its
// palindrome carries the same physics with the CPT nature demands. Depth L2: exact symmetry algebra
// measured on generic states over the full torus-acting group. Deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Tone, Will } from '@/code/tone/will'
import {
  Collision,
  lineHop,
  linePalindrome,
  pairCollision,
} from '@/code/rule/collision'
import { beat, collide, streamInverse } from '@/code/rule/lattice-gas'
import { rootsD4 } from '@/code/algebra/group/root-system'

const SIDE = 5

type Elem = { p: number[]; s: number[] }

function signedPermutations(): Elem[] {
  const perms: number[][] = []

  const build = (acc: number[], rest: number[]): void => {
    if (rest.length === 0) {
      perms.push(acc)

      return
    }

    for (let i = 0; i < rest.length; i++) {
      build([...acc, rest[i]!], rest.filter((_, j) => j !== i))
    }
  }

  build([], [0, 1, 2, 3])

  const out: Elem[] = []

  for (const p of perms) {
    for (let m = 0; m < 16; m++) {
      out.push({
        p,
        s: [m & 1 ? -1 : 1, m & 2 ? -1 : 1, m & 4 ? -1 : 1, m & 8 ? -1 : 1],
      })
    }
  }

  return out
}

const TONE_PERMS: [Tone, Tone, Tone][] = [
  [-1, 0, 1],
  [-1, 1, 0],
  [0, -1, 1],
  [0, 1, -1],
  [1, -1, 0],
  [1, 0, -1],
]

type Hit = { perm: number; negation: boolean; inversion: boolean; t: boolean; kind: 'sym' | 'rev' }

function sweep(input: { rule: Collision; inverse: Collision }): Hit[] {
  const mesh = d4Mesh({ side: SIDE })
  const opposite = meshOpposites(mesh)
  const roots = rootsD4()
  const rootIndex = new Map<string, number>(
    roots.map((r, i) => [r.join(','), i]),
  )
  const mod = (a: number): number => ((a % SIDE) + SIDE) % SIDE
  const coords = (c: number): number[] => [
    c % SIDE,
    Math.floor(c / SIDE) % SIDE,
    Math.floor(c / (SIDE * SIDE)) % SIDE,
    Math.floor(c / (SIDE * SIDE * SIDE)) % SIDE,
  ]
  const cellOf = (v: number[]): number =>
    mod(v[0]!) +
    mod(v[1]!) * SIDE +
    mod(v[2]!) * SIDE * SIDE +
    mod(v[3]!) * SIDE * SIDE * SIDE
  const applyVec = (e: Elem, v: number[]): number[] =>
    [0, 1, 2, 3].map(i => e.s[i]! * v[e.p[i]!]!)

  const patterns: ((i: number) => Tone)[] = [
    i => ((((i * 5 + (i % 11)) % 3) - 1) as Tone),
    i => ((((i * i + 2 * i) % 3) - 1) as Tone),
    i => ((((i * 11 + (i % 7) * 2) % 3) - 1) as Tone),
  ]
  const states = patterns.map(pattern => {
    const will = makeWill(mesh)

    for (let i = 0; i < will.data.length; i++) {
      will.data[i] = pattern(i)
    }

    return will
  })
  const fresh = (w: Will): Will => ({
    mesh,
    data: Int8Array.from(w.data),
  })

  const same = (a: Will, b: Will): boolean => {
    for (let i = 0; i < a.data.length; i++) {
      if (a.data[i] !== b.data[i]) {
        return false
      }
    }

    return true
  }

  const forwardImages = states.map(s => beat(fresh(s), input.rule))
  const inverseImages = states.map(s => {
    const copy = fresh(s)

    collide(copy, input.inverse)

    return streamInverse(copy)
  })

  const hits: Hit[] = []

  for (const e of signedPermutations()) {
    const dirMap: number[] = []

    let valid = true

    for (let d = 0; d < 24; d++) {
      const index = rootIndex.get(applyVec(e, roots[d]!).join(','))

      if (index === undefined) {
        valid = false
        break
      }

      dirMap.push(index)
    }

    if (!valid) {
      continue
    }

    const cellMap = new Int32Array(mesh.cellCount)

    for (let c = 0; c < mesh.cellCount; c++) {
      cellMap[c] = cellOf(applyVec(e, coords(c)))
    }

    const isInversion =
      e.p.every((v, i) => v === i) && e.s.every(v => v === -1)

    for (let pi = 0; pi < TONE_PERMS.length; pi++) {
      const tonePerm = TONE_PERMS[pi]!

      for (const useT of [false, true]) {
        const transform = (w: Will): Will => {
          const out = makeWill(mesh)

          for (let c = 0; c < mesh.cellCount; c++) {
            const base = c * 24
            const target = cellMap[c]! * 24

            for (let d = 0; d < 24; d++) {
              let d2 = dirMap[d]!

              if (useT) {
                d2 = opposite[d2]!
              }

              out.data[target + d2] = tonePerm[w.data[base + d]! + 1]!
            }
          }

          return out
        }

        let symOk = true
        let revOk = true

        for (
          let si = 0;
          si < states.length && (symOk || revOk);
          si++
        ) {
          const lhs = beat(transform(states[si]!), input.rule)

          if (symOk && !same(lhs, transform(forwardImages[si]!))) {
            symOk = false
          }

          if (revOk && !same(lhs, transform(inverseImages[si]!))) {
            revOk = false
          }
        }

        const record = (kind: 'sym' | 'rev'): void => {
          hits.push({
            perm: pi,
            negation: pi === 5,
            inversion: isInversion,
            t: useT,
            kind,
          })
        }

        if (symOk) {
          record('sym')
        }

        if (revOk) {
          record('rev')
        }
      }
    }
  }

  return hits
}

export default experiment({
  id: 'foundations/adoption-gate-sweep',
  code: 'E-FND-0102',
  title:
    'the adoption gate on the committed substrate, all 4,608 torus-acting conjugations tested for three knits on generic states: the charge knit has exact CPT on the d4 mesh (negation, full inversion, velocity reversal), lineHop keeps only the identity (not one exact reversal anywhere, so adopting it as-is adopts total discrete-symmetry violation including CPT), and the one-line palindrome repair (swap, clock, swap, linePalindrome) has exactly one nontrivial exact conjugation, the CPT reversal, with C and CP still violated, so the repaired candidate carries the weak-interaction symmetry pattern nature shows',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)

    const charge = sweep({
      rule: pairCollision({ opposite }),
      inverse: pairCollision({ opposite, forward: false }),
    })
    const hop = sweep({
      rule: lineHop({ opposite }),
      inverse: lineHop({ opposite, forward: false }),
    })
    const palindrome = sweep({
      rule: linePalindrome({ opposite }),
      inverse: linePalindrome({ opposite, forward: false }),
    })

    const chargeCpt = charge.some(
      h => h.negation && h.inversion && h.t && h.kind === 'rev',
    )
    const hopBare =
      hop.length === 1 &&
      hop[0]!.kind === 'sym' &&
      hop[0]!.perm === 0 &&
      !hop[0]!.t
    const palindromeHits = palindrome.filter(
      h => !(h.perm === 0 && !h.t && h.kind === 'sym'),
    )
    const palindromeCptOnly =
      palindromeHits.length === 1 &&
      palindromeHits[0]!.negation &&
      palindromeHits[0]!.inversion &&
      palindromeHits[0]!.t &&
      palindromeHits[0]!.kind === 'rev'

    const ok = chargeCpt && hopBare && palindromeCptOnly

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the charge knit passes the CPT reversal on the d4 torus, lineHop passes nothing but the identity, and the palindrome passes exactly the identity plus the CPT reversal',
      metrics: {
        chargeExactConjugations: charge.length,
        lineHopExactConjugations: hop.length,
        palindromeExactConjugations: palindrome.length,
        chargeCptFound: chargeCpt ? 1 : 0,
        palindromeCptFound: palindromeCptOnly ? 1 : 0,
      },
      // CONTROL: lineHop, whose empty table is what failing the gate measures
      control: {
        lineHopReversalsFound: hop.filter(h => h.kind === 'rev')
          .length,
      },
      notes:
        'the group swept is the full signed-permutation group, the subgroup of the 1,152-element 24-cell group that acts on the integer torus (the remaining triality cosets have half-integer matrices and do not descend to this quotient, stated as the honest scope). The structural diagnosis: negation fixes the swap clause and inverts the clock table, so lineHop misses CPT only through its swap-then-clock order, and the palindrome (a collision equal to its own conjugated inverse by construction) is the minimal repair. Its particle physics is measured in E-FND-0103.',
    })
  },
})
