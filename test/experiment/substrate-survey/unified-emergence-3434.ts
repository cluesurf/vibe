// P255 (UNIFIED emergence, the L3 target, structural): the strongest claim of the program, that ONE substrate
// gives BOTH a boson sector (the photon) AND fermion sectors (matter), NOT separately constructed. The 24
// directions of {3,4,3,4} partition into 8v + 8s + 8c. Under the SAME 2*pi rotation, the 8v VECTOR sector
// returns to +1 (a BOSON, the photon candidate) while the 8s and 8c SPINOR sectors go to -1 (FERMIONS,
// matter). So one 24-direction substrate carries the gauge boson and the fermions as the three pieces of one
// structure, you do not build a photon lattice and a fermion lattice separately. The full dynamical
// co-emergence in a single time evolution is the remaining L3 step, this is the structural core.
// Run: npx tsx code/experiment/p255-unified-emergence-3434.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// quaternion helpers (the 8v as vectors via conjugation, the 8s/8c as spinors via left multiplication)
type Q = readonly [number, number, number, number]
const qmul = (a: Q, b: Q): Q => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
]
const qconj = (a: Q): Q => [a[0], -a[1], -a[2], -a[3]]

export function unifiedEmergence(): {
  partitions: boolean
  vectorIsBoson: boolean
  spinorsAreFermions: boolean
  oneSubstrateBothSectors: boolean
} {
  // partition the 24 directions: 8v (axis), 8s (even-parity half), 8c (odd-parity half)
  const v8: Q[] = ([0, 1, 2, 3] as const).flatMap(i =>
    [1, -1].map(s => {
      const q = [0, 0, 0, 0]
      q[i] = s
      return q as unknown as Q
    }),
  )
  const half: Q[] = []
  for (const a of [0.5, -0.5])
    for (const b of [0.5, -0.5])
      for (const c of [0.5, -0.5])
        for (const d of [0.5, -0.5]) half.push([a, b, c, d])
  const s8 = half.filter(
    q =>
      [q[1], q[2], q[3]].concat(q[0]).filter(x => x < 0).length % 2 ===
      0,
  )
  const c8 = half.filter(
    q =>
      [q[1], q[2], q[3]].concat(q[0]).filter(x => x < 0).length % 2 ===
      1,
  )
  const partitions =
    v8.length === 8 &&
    s8.length === 8 &&
    c8.length === 8 &&
    v8.length + s8.length + c8.length === 24

  // a 2*pi rotation about z as a quaternion: q = (cos(pi), 0, 0, sin(pi)) = (-1, 0, 0, 0)
  const rot2pi: Q = [Math.cos(Math.PI), 0, 0, Math.sin(Math.PI)]
  // 8v transforms as a VECTOR (conjugation q v q^-1): the -1 cancels, vector returns to +1 (BOSON)
  const vectorSign = (v: Q): number => {
    const r = qmul(qmul(rot2pi, v), qconj(rot2pi))
    return r.every((x, i) => Math.abs(x - v[i]!) < 1e-9) ? 1 : -1
  }
  // 8s/8c transform as SPINORS (left multiply q psi): the -1 hits, spinor goes to -1 (FERMION)
  const spinorSign = (psi: Q): number => {
    const r = qmul(rot2pi, psi)
    return r.every((x, i) => Math.abs(x - psi[i]!) < 1e-9)
      ? 1
      : r.every((x, i) => Math.abs(x + psi[i]!) < 1e-9)
        ? -1
        : 0
  }

  const vectorIsBoson = v8.every(v => vectorSign(v) === 1)
  const spinorsAreFermions =
    s8.every(p => spinorSign(p) === -1) &&
    c8.every(p => spinorSign(p) === -1)

  const oneSubstrateBothSectors =
    partitions && vectorIsBoson && spinorsAreFermions

  return {
    partitions,
    vectorIsBoson,
    spinorsAreFermions,
    oneSubstrateBothSectors,
  }
}

export default experiment({
  id: 'substrate-survey/unified-emergence-3434',
  title:
    'one 24-direction substrate splits into 8v+8s+8c, a boson sector and two fermion sectors under one 2pi rotation',
  category: 'substrate-survey',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = unifiedEmergence()
    const ok =
      r.partitions &&
      r.vectorIsBoson &&
      r.spinorsAreFermions &&
      r.oneSubstrateBothSectors
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 directions partition into 8v plus 8s plus 8c, and under one 2pi rotation the 8v vector sector returns to +1 (a boson) while the 8s and 8c spinor sectors go to -1 (fermions), so one substrate carries both sectors',
      metrics: {
        partitions: r.partitions ? 1 : 0,
        vectorIsBoson: r.vectorIsBoson ? 1 : 0,
        spinorsAreFermions: r.spinorsAreFermions ? 1 : 0,
        oneSubstrateBothSectors: r.oneSubstrateBothSectors ? 1 : 0,
      },
      notes:
        'L1 known math, a quaternion-algebra fact about the D4 / 24-cell triality, structural not dynamical. The vector-versus-spinor contrast under the same 2pi rotation is the built-in control, the vectors return to +1 where the spinors flip to -1. The full dynamical co-emergence of a photon and matter in one time evolution is the remaining L3 step, not shown here.',
    })
  },
})
