// P244 (SP1, the gate): the {3,4,3,4} spin-1/2 DOUBLE COVER, done rigorously with quaternions, not a
// heuristic. The 24 directions of {3,4,3,4} are the 24 unit Hurwitz quaternions = the binary tetrahedral
// group 2T, the DOUBLE COVER of the order-12 tetrahedral rotation group. A spinor transforms by LEFT
// quaternion multiplication, a vector by CONJUGATION. So a 2*pi rotation sends a spinor to MINUS itself and a
// vector to ITSELF, and only a 4*pi rotation restores the spinor. This is the decisive spin test, and it is
// exact: the spinor overlap is cos(theta/2) (period 4*pi), the vector overlap is cos(theta) (period 2*pi).
// Run: npx tsx code/experiment/p244-sp1-spin-double-cover.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// ---- quaternion algebra (exact) ----
type Q = readonly [number, number, number, number] // (w, x, y, z)
const qmul = (a: Q, b: Q): Q => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
]
const qconj = (a: Q): Q => [a[0], -a[1], -a[2], -a[3]]
const qkey = (a: Q): string => a.map((x) => Math.round(x * 1e6)).join(',')
const qclose = (a: Q, b: Q): boolean => a.every((x, i) => Math.abs(x - b[i]!) < 1e-9)

// the 24 unit Hurwitz quaternions = binary tetrahedral group 2T = the 24 directions of {3,4,3,4}
function hurwitzUnits(): Q[] {
  const out: Q[] = []
  // 8 unit-axis quaternions (the 8 roots of D4 of integer form, the {3,4,3,4} cell axes)
  for (let i = 0; i < 4; i++) for (const s of [1, -1]) {
    const q = [0, 0, 0, 0]; q[i] = s; out.push(q as unknown as Q)
  }
  // 16 half-integer quaternions
  for (const a of [0.5, -0.5]) for (const b of [0.5, -0.5]) for (const c of [0.5, -0.5]) for (const d of [0.5, -0.5]) out.push([a, b, c, d])
  return out
}

export function sp1SpinDoubleCover(): {
  groupOrder: number
  isGroup: boolean
  rotationOrder: number
  doubleCover: boolean
  spinorMinusAt2pi: boolean
  spinorPlusAt4pi: boolean
  vectorPlusAt2pi: boolean
} {
  const U = hurwitzUnits()

  // (A) the 24 units form a GROUP under quaternion multiplication (closure), order 24 = 2T
  const set = new Set(U.map(qkey))
  let closed = true
  for (const a of U) for (const b of U) if (!set.has(qkey(qmul(a, b)))) closed = false
  const isGroup = closed && U.length === 24
  console.log(`P244 (A) the 24 {3,4,3,4} directions = unit Hurwitz quaternions:`)
  console.log(`  count ${U.length}, closed under multiplication ${closed} => binary tetrahedral group 2T (order 24): ${isGroup}`)

  // (B) conjugation q -> (v -> q v q^-1) is the DOUBLE COVER: 24 quaternions -> 12 rotations, 2-to-1
  const rotKey = (q: Q): string => {
    // image of the three imaginary basis vectors under conjugation, the 3x3 rotation matrix
    const cols = ([[0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]] as Q[]).map((e) => qmul(qmul(q, e), qconj(q)))
    return cols.map((c) => [c[1], c[2], c[3]].map((x) => Math.round(x)).join(',')).join(';')
  }
  const rots = new Set(U.map(rotKey))
  const rotationOrder = rots.size
  const doubleCover = rotationOrder === 12 && rotKey([1, 0, 0, 0]) === rotKey([-1, 0, 0, 0])
  console.log(`P244 (B) conjugation collapses 24 quaternions -> ${rotationOrder} rotations (tetrahedral group T, order 12)`)
  console.log(`  q and -q give the SAME rotation (2-to-1 double cover): ${rotKey([1, 0, 0, 0]) === rotKey([-1, 0, 0, 0])}`)
  console.log(`  => 2T is the double cover of T: ${doubleCover}`)

  // (C) THE GATE: a 2*pi rotation gives a spinor a MINUS sign, a vector NO sign. 4*pi restores the spinor.
  // rotation quaternion about z by angle theta: q = (cos(theta/2), 0, 0, sin(theta/2))
  const rotQ = (theta: number): Q => [Math.cos(theta / 2), 0, 0, Math.sin(theta / 2)]
  // spinor action = LEFT multiply, overlap with the reference spinor (1,0,0,0) is the w-component = cos(theta/2)
  const spinorOverlap = (theta: number): number => qmul(rotQ(theta), [1, 0, 0, 0])[0]
  // vector action = CONJUGATION, overlap of an in-plane vector (1,0,0) with its image = cos(theta)
  const vectorOverlap = (theta: number): number => {
    const q = rotQ(theta), v: Q = [0, 1, 0, 0], r = qmul(qmul(q, v), qconj(q))
    return r[1] // x-component, = cos(theta)
  }
  const TWO_PI = 2 * Math.PI, FOUR_PI = 4 * Math.PI
  const s2 = spinorOverlap(TWO_PI), s4 = spinorOverlap(FOUR_PI), v2 = vectorOverlap(TWO_PI)
  const spinorMinusAt2pi = Math.abs(s2 - -1) < 1e-9
  const spinorPlusAt4pi = Math.abs(s4 - 1) < 1e-9
  const vectorPlusAt2pi = Math.abs(v2 - 1) < 1e-9
  console.log(`P244 (C) THE GATE, rotate through theta and read the overlap with the start:`)
  console.log(`  spinor overlap cos(theta/2):  theta=0 -> ${spinorOverlap(0).toFixed(3)}, 2pi -> ${s2.toFixed(3)}, 4pi -> ${s4.toFixed(3)}`)
  console.log(`  vector overlap cos(theta):    theta=0 -> ${vectorOverlap(0).toFixed(3)}, 2pi -> ${v2.toFixed(3)}, 4pi -> ${vectorOverlap(FOUR_PI).toFixed(3)}`)
  console.log(`  => spinor is MINUS at 2pi (${spinorMinusAt2pi}), restored only at 4pi (${spinorPlusAt4pi}); vector restored at 2pi (${vectorPlusAt2pi})`)
  console.log(`  => SPIN-1/2 double cover, the 24-direction D4 substrate genuinely carries spinors. SP1 PASSED.\n`)

  return { groupOrder: U.length, isGroup, rotationOrder, doubleCover, spinorMinusAt2pi, spinorPlusAt4pi, vectorPlusAt2pi }
}

export default defineExperiment({
  id: 'spin/sp1-spin-double-cover',
  title: 'the 24 directions of {3,4,3,4} are the binary tetrahedral group, the spin-1/2 double cover',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = sp1SpinDoubleCover()
    const ok =
      r.isGroup &&
      r.doubleCover &&
      r.spinorMinusAt2pi &&
      r.spinorPlusAt4pi &&
      r.vectorPlusAt2pi
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 directions of the {3,4,3,4} coin form the binary tetrahedral group, a two-to-one double cover of the order-12 rotation group, so a spinor gains a minus sign at 2pi and returns only at 4pi while a vector returns at 2pi',
      metrics: {
        groupOrder: r.groupOrder,
        rotationOrder: r.rotationOrder,
        spinorMinusAt2pi: r.spinorMinusAt2pi ? 1 : 0,
        vectorPlusAt2pi: r.vectorPlusAt2pi ? 1 : 0,
      },
      notes:
        'L1, known math. This is the same algebra-layer double-cover fact as spin/rotation-2pi, derived here with the explicit Hurwitz-quaternion construction and the conjugation collapse 24 to 12. It is exact integer-and-half-integer arithmetic, not floating noise, but it is NOT evidence that spin emerges from the dynamics. The L3 target is a spinor wavepacket carrying the 2pi sign while it propagates under the directional rule.',
    })
  },
})
