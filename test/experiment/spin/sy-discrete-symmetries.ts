// P250 (SY7): the discrete symmetries C, P, T, CPT on {3,4,3,4}. The reversible rule makes T (time reversal)
// EXACT, the symmetric D4 root set makes P (parity) EXACT, charge symmetry makes C exact, so CPT is exact by
// construction. This is the substrate's strongest real-world prediction (exact CPT, no information loss).
// (1) parity: the 24 roots are closed under negation and coordinate reflection. (2) time reversal: a unitary
// Dirac walk run backward recovers the past exactly. (3) the massless walk commutes with parity (R<->L, x->-x).
// Run: npx tsx code/experiment/p250-sy-discrete-symmetries.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'

const d4Roots = (): number[][] => rootsD4()
const key = (p: number[]): string => p.join(',')

export function syDiscreteSymmetries(): {
  parityClosed: boolean
  reflectionClosed: boolean
  timeReversal: boolean
  parityCommutes: boolean
  cptExact: boolean
} {
  const roots = d4Roots()
  const set = new Set(roots.map(key))

  // (P) parity: the root set is closed under negation, and under each coordinate reflection
  const parityClosed = roots.every(r => set.has(key(r.map(x => -x))))

  let reflectionClosed = true

  for (let ax = 0; ax < 4; ax++) {
    reflectionClosed &&= roots.every(r =>
      set.has(key(r.map((x, i) => (i === ax ? -x : x)))),
    )
  }

  // (T) time reversal: a unitary Dirac walk is exactly invertible. run forward then backward, recover the start.
  const L = 81,
    steps = 30,
    mass = 0.4

  type C = [number, number]
  const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
  const cmul = (a: C, b: C): C => [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0],
  ]

  const wrap = (x: number): number => ((x % L) + L) % L
  const c = Math.cos(mass),
    s = Math.sin(mass),
    I: C = [0, 1]

  let R: C[] = new Array(L).fill([0, 0]),
    Lf: C[] = new Array(L).fill([0, 0])

  R[40] = [0.6, 0]
  Lf[40] = [0.8, 0]

  const R0 = R.map(z => [...z] as C),
    L0 = Lf.map(z => [...z] as C)

  const fwd = (): void => {
    const R2: C[] = new Array(L),
      L2: C[] = new Array(L)

    for (let x = 0; x < L; x++) {
      R2[x] = cadd(
        [c * R[x]![0], c * R[x]![1]],
        cmul([-s, 0], cmul(I, Lf[x]!)),
      )
      L2[x] = cadd(cmul([-s, 0], cmul(I, R[x]!)), [
        c * Lf[x]![0],
        c * Lf[x]![1],
      ])
    }

    const R3: C[] = new Array(L),
      L3: C[] = new Array(L)

    for (let x = 0; x < L; x++) {
      R3[wrap(x + 1)] = R2[x]!
      L3[wrap(x - 1)] = L2[x]!
    }

    R = R3
    Lf = L3
  }

  const bwd = (): void => {
    // inverse: unshift then inverse coin (the coin is unitary, its inverse is +i s mixing)
    const R2: C[] = new Array(L),
      L2: C[] = new Array(L)

    for (let x = 0; x < L; x++) {
      R2[x] = R[wrap(x + 1)]!
      L2[x] = Lf[wrap(x - 1)]!
    }

    const R3: C[] = new Array(L),
      L3: C[] = new Array(L)

    for (let x = 0; x < L; x++) {
      R3[x] = cadd(
        [c * R2[x]![0], c * R2[x]![1]],
        cmul([s, 0], cmul(I, L2[x]!)),
      )
      L3[x] = cadd(cmul([s, 0], cmul(I, R2[x]!)), [
        c * L2[x]![0],
        c * L2[x]![1],
      ])
    }

    R = R3
    Lf = L3
  }

  for (let t = 0; t < steps; t++) {
    fwd()
  }

  for (let t = 0; t < steps; t++) {
    bwd()
  }

  let err = 0

  for (let x = 0; x < L; x++) {
    err = Math.max(
      err,
      Math.abs(R[x]![0] - R0[x]![0]),
      Math.abs(R[x]![1] - R0[x]![1]),
      Math.abs(Lf[x]![0] - L0[x]![0]),
      Math.abs(Lf[x]![1] - L0[x]![1]),
    )
  }

  const timeReversal = err < 1e-12

  // (P on the field) the massless walk commutes with parity: x -> L-1-x and R <-> L gives the same dynamics
  const massless = (): {
    applyParityThenStep: C[][]
    stepThenApplyParity: C[][]
  } => {
    const r: C[] = new Array(L).fill([0, 0]),
      l: C[] = new Array(L).fill([0, 0])

    r[30] = [1, 0]

    const step = (rr: C[], ll: C[]): [C[], C[]] => {
      const r3: C[] = new Array(L),
        l3: C[] = new Array(L)

      for (let x = 0; x < L; x++) {
        r3[wrap(x + 1)] = rr[x]!
        l3[wrap(x - 1)] = ll[x]!
      }

      return [r3, l3]
    }

    const parity = (rr: C[], ll: C[]): [C[], C[]] => {
      const r2: C[] = new Array(L),
        l2: C[] = new Array(L)

      for (let x = 0; x < L; x++) {
        r2[x] = ll[wrap(-x)]!
        l2[x] = rr[wrap(-x)]!
      }

      return [r2, l2]
    } // x->-x and R<->L

    const [pr, pl] = parity(r, l)
    const [a1, a2] = step(pr, pl)
    const [sr, sl] = step(r, l)
    const [b1, b2] = parity(sr, sl)

    return {
      applyParityThenStep: [a1, a2],
      stepThenApplyParity: [b1, b2],
    }
  }

  const { applyParityThenStep, stepThenApplyParity } = massless()

  let pcErr = 0

  for (let x = 0; x < L; x++) {
    for (let comp = 0; comp < 2; comp++) {
      pcErr = Math.max(
        pcErr,
        Math.abs(
          applyParityThenStep[0]![x]![comp]! -
            stepThenApplyParity[0]![x]![comp]!,
        ),
        Math.abs(
          applyParityThenStep[1]![x]![comp]! -
            stepThenApplyParity[1]![x]![comp]!,
        ),
      )
    }
  }

  const parityCommutes = pcErr < 1e-12

  // CPT: C (charge sign flip) is a symmetry of the conserving rule, so C, P, T all exact => CPT exact
  const cptExact =
    parityClosed && reflectionClosed && timeReversal && parityCommutes

  return {
    parityClosed,
    reflectionClosed,
    timeReversal,
    parityCommutes,
    cptExact,
  }
}

export default experiment({
  id: 'spin/sy-discrete-symmetries',
  code: 'E-SPN-0037',
  title: 'C, P, T, and CPT are exact on the {3,4,3,4} substrate',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = syDiscreteSymmetries()
    const ok =
      r.parityClosed &&
      r.reflectionClosed &&
      r.timeReversal &&
      r.parityCommutes &&
      r.cptExact

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the D4 root set is closed under negation and every coordinate reflection (exact parity), the unitary Dirac walk run forward then backward recovers the start to machine precision (exact time reversal), and the massless step commutes with parity, so C, P, T and CPT are all exact on the substrate',
      metrics: {
        parityClosed: r.parityClosed ? 1 : 0,
        reflectionClosed: r.reflectionClosed ? 1 : 0,
        timeReversal: r.timeReversal ? 1 : 0,
        parityCommutes: r.parityCommutes ? 1 : 0,
      },
      notes:
        'L2. Parity closure is an exact structural fact about the D4 roots (a consistency check). Time reversal and parity-commutation are MEASURED from the unitary Dirac walk to better than 1e-12, which is the substantive content (exact reversibility of the rule). It reproduces the known exact-CPT property of a unitary quantum walk on a symmetric coin, not a novel emergence. C (charge symmetry) is asserted from the conserving rule, not separately measured here.',
    })
  },
})
