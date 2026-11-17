// Whether the two "3 = 2 + 1" reflections are one Z2 (OPEN-QTM-19, the-picture.md).
//
// Two involutions each split a three into two plus one:
// - D, the depth reflection x4 -> -x4, on the bulk's 3 photons at a husk wave vector (k4 = 0): it keeps 2 (the
//   husk's photons, depth-even) and the projection kills 1 (depth-odd) (E-FRC-0179)
// - R, the 2 pi turn on one role's 3 states, whose lift in Sigma(648) is -P, P|j> = |-j> the parity
//   (E-SPN-0051, 0054): a doublet with sign -1 (the spinor) and a scalar with sign +1 (the Strange state)
//
// The question asks for a construction carrying one onto the other. For linear involutions of a
// three-dimensional space the answer is decided by one number: D and R are conjugate, T D T^-1 = R for an
// invertible T, exactly when their traces agree, since an involution is diagonalizable with eigenvalues +-1
// and its trace fixes how many of each. So the run reads both characters from the model's own objects:
// - tr R exactly, from the integer matrix -P, with R^2 = I and det R
// - tr D on the photons, Tr(Pi D), Pi the projector onto the 3 smallest nonzero eigenvalues of the bulk
//   curl-curl symbol M(k) (the photons, E-FRC-0179's rule) and D the permutation of link directions that
//   depthMirror reads, at husk wave vectors near k = 0 where the photon band is separated
// and states the consequence: if the traces differ, no linear map carries one onto the other. The role's own
// group cannot repair it with a phase, since its center is Z3 = {1, w, w^2} with no -1 (E-SPN-0054), and
// tr(w^k R) = -w^k is never a real +1. What does exist is a map carrying R onto -D: written out and checked.
//
// Gates, fixed before the first run of this file:
// G1 R = -P: R^2 = I, tr R = -1, det R = +1, exactly in integers; its -1 eigenspace has dimension 2
// G2 at each of the husk wave vectors m = (1,0,0), (1,1,0), (1,1,1), (2,1,0) on the side-12 D4 box: M(k) has
//    one zero eigenvalue (under 1e-12) and a gap above the 3 photons (4th nonzero over 3rd by more than 1e-6);
//    D commutes with M(k) (largest entry of |D M - M D| under 1e-12); tr(Pi D) is +1 within 1e-9 and
//    det(D on the photons) is -1 within 1e-9
// G3 the verdict follows: tr R != tr D|photons and tr(w^k R) != tr D|photons for k = 0, 1, 2, so no linear map
//    carries R onto D, even up to the role group's phases
// G4 the map that does exist: T sending the doublet basis {|0>, (|1> + |2>)/sqrt 2} to the two depth-even photon
//    polarizations and the Strange state (|1> - |2>)/sqrt 2 to the depth-odd one gives T R T^-1 = -D, checked
//    exactly on the diagonal form
//
// Depth L1: two characters read from the model's operators and one theorem of linear algebra.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { photonLatticeD4 } from '@/code/rule/photon-links'
import {
  bulkModeOfHusk,
  makeHusk,
} from '@/code/measure/photon-husk'
import {
  hermitianEigen,
  plaquetteWaveMatrix,
} from '@/code/measure/photon-modes'
import { depthMirror } from '@/code/measure/photon-symbol'

const SIDE = 12
const MODES = [
  [1, 0, 0],
  [1, 1, 0],
  [1, 1, 1],
  [2, 1, 0],
]

// the determinant of a small integer matrix, by cofactors
function det(m: readonly (readonly number[])[]): number {
  if (m.length === 1) {
    return m[0]![0]!
  }

  let s = 0

  m[0]!.forEach((x, j) => {
    const minor = m.slice(1).map(row => row.filter((_, c) => c !== j))

    s += (j % 2 === 0 ? 1 : -1) * x * det(minor)
  })

  return s
}

// the determinant of a 3 x 3 complex matrix
function det3(re: number[][], im: number[][]): [number, number] {
  const mul = (a: [number, number], b: [number, number]): [number, number] => [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0],
  ]
  const at = (i: number, j: number): [number, number] => [re[i]![j]!, im[i]![j]!]

  let sr = 0
  let si = 0

  for (const [p, sign] of [
    [[0, 1, 2], 1],
    [[1, 2, 0], 1],
    [[2, 0, 1], 1],
    [[0, 2, 1], -1],
    [[2, 1, 0], -1],
    [[1, 0, 2], -1],
  ] as const) {
    const t = mul(mul(at(0, p[0]), at(1, p[1])), at(2, p[2]))

    sr += sign * t[0]
    si += sign * t[1]
  }

  return [sr, si]
}

export default experiment({
  id: 'quantum/two-reflections-one-z2',
  code: 'E-QTM-0194',
  title:
    "the two 3 = 2 + 1 reflections are not one Z2: the depth reflection has character +1 on the bulk's 3 photons and the 2 pi turn has character -1 on a role's 3 states, so no linear map carries one onto the other, even up to the role group's phases; a map carries the turn onto minus the depth reflection",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // G1 R = -P on one role
    const r: number[][] = [0, 1, 2].map(i =>
      [0, 1, 2].map(j => (j === (3 - i) % 3 ? -1 : 0)),
    )
    const r2 = r.map((row, i) =>
      row.map((_, j) => row.reduce((s, x, k) => s + x * r[k]![j]!, 0)),
    )
    const trR: number = r[0]![0]! + r[1]![1]! + r[2]![2]!
    const detR = det(r)
    const squaresToOne = r2.every((row, i) => row.every((x, j) => x === (i === j ? 1 : 0)))
    // dim ker(R + I) = 3 - rank(R + I); R + I has rows (0, 0, 0), (0, 1, -1), (0, -1, 1): rank 1
    const plusOne = r.map((row, i) => row.map((x, j) => x + (i === j ? 1 : 0)))
    const rankPlusOne = det(plusOne) !== 0 ? 3 : plusOne.some(row => row.some(x => x !== 0)) ? (
      // a nonzero 3 x 3 with zero determinant: rank 1 when every 2 x 2 minor vanishes
      [0, 1, 2].every(a =>
        [0, 1, 2].every(b =>
          [0, 1, 2].every(c =>
            [0, 1, 2].every(
              d =>
                a === c ||
                b === d ||
                plusOne[a]![b]! * plusOne[c]![d]! -
                  plusOne[a]![d]! * plusOne[c]![b]! ===
                  0,
            ),
          ),
        ),
      )
        ? 1
        : 2
    ) : 0
    const doublet = 3 - rankPlusOne
    const g1 = squaresToOne && trR === -1 && detR === 1 && doublet === 2

    // G2 D on the bulk photons
    const bulk = photonLatticeD4({ side: SIDE })
    const husk = makeHusk(bulk)
    const sigma = depthMirror(husk)
    const f = sigma.length
    const readings: {
      zeros: number
      gap: number
      commutator: number
      character: number
      detRe: number
      detIm: number
    }[] = []

    for (const m of MODES) {
      const matrix = plaquetteWaveMatrix(bulk, bulkModeOfHusk(m))
      const e = hermitianEigen(matrix)
      const order = Array.from({ length: f }, (_, c) => c).sort(
        (x, y) => (e.values[x] ?? 0) - (e.values[y] ?? 0),
      )
      const values = order.map(c => e.values[c] ?? 0)
      const zeros = values.filter(v => Math.abs(v) < 1e-12).length
      const photons = order.slice(zeros, zeros + 3)
      const gap = (values[zeros + 3] ?? 0) - (values[zeros + 2] ?? 0)

      // |D M - M D|, with (D v)_sigma(a) = v_a
      let commutator = 0

      for (let a = 0; a < f; a++) {
        for (let b = 0; b < f; b++) {
          const dm = (matrix.re[sigma[a]! * f + sigma[b]!] ?? 0) - (matrix.re[a * f + b] ?? 0)
          const di = (matrix.im[sigma[a]! * f + sigma[b]!] ?? 0) - (matrix.im[a * f + b] ?? 0)

          commutator = Math.max(commutator, Math.hypot(dm, di))
        }
      }

      // the 3 x 3 matrix of D on the photons, <v_i | D v_j>
      const dre: number[][] = []
      const dim: number[][] = []

      for (const ci of photons) {
        const rowRe: number[] = []
        const rowIm: number[] = []

        for (const cj of photons) {
          let sr = 0
          let si = 0

          for (let a = 0; a < f; a++) {
            const xr = e.vectorsRe[sigma[a]! * f + ci] ?? 0
            const xi = -(e.vectorsIm[sigma[a]! * f + ci] ?? 0)
            const yr = e.vectorsRe[a * f + cj] ?? 0
            const yi = e.vectorsIm[a * f + cj] ?? 0

            sr += xr * yr - xi * yi
            si += xr * yi + xi * yr
          }

          rowRe.push(sr)
          rowIm.push(si)
        }

        dre.push(rowRe)
        dim.push(rowIm)
      }

      const character = dre[0]![0]! + dre[1]![1]! + dre[2]![2]!
      const [detRe, detIm] = det3(dre, dim)

      readings.push({ zeros, gap, commutator, character, detRe, detIm })
    }

    const g2 = readings.every(
      x =>
        x.zeros === 1 &&
        x.gap > 1e-6 &&
        x.commutator < 1e-12 &&
        Math.abs(x.character - 1) < 1e-9 &&
        Math.abs(x.detRe + 1) < 1e-9 &&
        Math.abs(x.detIm) < 1e-9,
    )

    // G3 the verdict: tr(w^k R) = -w^k against +1
    const trD: number = 1
    const phases = [0, 1, 2].map(k => ({
      re: -Math.cos((2 * Math.PI * k) / 3),
      im: -Math.sin((2 * Math.PI * k) / 3),
    }))
    const noPhaseMatches = phases.every(
      p => Math.hypot(p.re - trD, p.im) > 0.5,
    )
    const g3 = g1 && g2 && trR !== trD && noPhaseMatches

    // G4 the map carrying R onto -D: in the eigenbasis {|0>, (|1>+|2>)/sqrt 2, (|1>-|2>)/sqrt 2} R is
    // diag(-1, -1, +1); in the photon basis {even, even, odd} D is diag(+1, +1, -1); T maps basis to basis
    const s = Math.SQRT1_2
    const eig = [
      [1, 0, 0],
      [0, s, s],
      [0, s, -s],
    ]
    const diagonal = eig.map(u =>
      eig.map(v => {
        // <u| R |v>
        let x = 0

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            x += u[i]! * r[i]![j]! * v[j]!
          }
        }

        return x
      }),
    )
    const minusD = [
      [-1, 0, 0],
      [0, -1, 0],
      [0, 0, 1],
    ]
    const mapGap = Math.max(
      ...diagonal.flatMap((row, i) => row.map((x, j) => Math.abs(x - minusD[i]![j]!))),
    )
    const g4 = mapGap < 1e-12

    return verdict({
      status: g1 && g2 && g3 && g4 ? 'pass' : 'fail',
      claim: `the two 3 = 2 + 1 reflections are not one Z2: the 2 pi turn R = -P has trace ${trR} and determinant ${detR} on a role's 3 states (sign -1 on the 2-state doublet), while the depth reflection has trace ${readings.map(x => x.character.toFixed(12)).join(', ')} and determinant -1 on the bulk's 3 photons at ${MODES.length} husk wave vectors (it fixes the 2 husk photons); involutions with different traces are not conjugate, and the role group's phases 1, w, w^2 give traces -1, -w, -w^2, never +1, so no linear map carries one onto the other; the map sending the doublet to the husk photons and the Strange state to the depth photon carries R onto -D, which differs from D by the sign -1 that the role group does not hold`,
      metrics: {
        gateTurn: g1 ? 1 : 0,
        gateDepthOnPhotons: g2 ? 1 : 0,
        gateNotConjugate: g3 ? 1 : 0,
        gateMapOntoMinusD: g4 ? 1 : 0,
        turnTrace: trR,
        turnDeterminant: detR,
        turnDoubletDimension: doublet,
        depthTraceOnPhotonsLeast: Math.min(...readings.map(x => x.character)),
        depthTraceOnPhotonsMost: Math.max(...readings.map(x => x.character)),
        depthDeterminantOnPhotons: readings[0]?.detRe ?? 0,
        depthCommutatorLargest: Math.max(...readings.map(x => x.commutator)),
        photonGapLeast: Math.min(...readings.map(x => x.gap)),
        mapOntoMinusDGap: mapGap,
      },
      control: {
        wavevectors: MODES.length,
        linkDirections: f,
      },
      notes:
        'L1. Gates fixed before the first run. The photon space is E-FRC-0179s (the 3 smallest nonzero eigenvalues of the bulk curl-curl symbol, read near k = 0 where the band is separated) and D is depthMirror, the permutation of link directions under x4 -> -x4. Projectively, as elements of PGL(3), the two coincide, as every involution with a 2 + 1 split does; that identification forgets the relative sign between the 2 and the 1, which is what makes the doublet a spinor, so it is the matching count alone, which the-picture.md rules out as evidence.',
    })
  },
})
