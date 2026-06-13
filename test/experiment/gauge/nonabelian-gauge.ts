// P234 (close base -> gauge for the NON-ABELIAN case): the coin's local frame freedom (the so(8)/so(10)
// symmetry, emergent from the finite F4 by p226) is a NON-ABELIAN gauge symmetry. The gauge field is a link
// MATRIX (the relative coin frame between cells), the Wilson loop is the TRACE of the ordered product of link
// matrices around a loop, gauge-invariant under U_link -> g_x U_link g_y^T. We demonstrate with SO(3) link
// rotations (the clean non-abelian prototype, so(10) is identical with bigger matrices), (1) the Wilson loop
// (a non-abelian flux) is GAUGE-INVARIANT, (2) the holonomy is a non-trivial rotation (curvature), (3) it is
// NON-ABELIAN (order matters, two paths differ). Run: npx tsx code/experiment/p234-nonabelian-gauge.ts

import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type M3 = number[][]
const I3: M3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
function mul(A: M3, B: M3): M3 { const C: M3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += A[i]![k]! * B[k]![j]!; C[i]![j] = s } return C }
const T = (A: M3): M3 => [[A[0]![0]!, A[1]![0]!, A[2]![0]!], [A[0]![1]!, A[1]![1]!, A[2]![1]!], [A[0]![2]!, A[1]![2]!, A[2]![2]!]]
const tr = (A: M3): number => A[0]![0]! + A[1]![1]! + A[2]![2]!
function rot(axis: number[], ang: number): M3 { const n = Math.hypot(...axis), k = axis.map((x) => x / n); const c = Math.cos(ang), s = Math.sin(ang); const K: M3 = [[0, -k[2]!, k[1]!], [k[2]!, 0, -k[0]!], [-k[1]!, k[0]!, 0]]; const o: M3 = k.map((a) => k.map((b) => a * b)); return [0, 1, 2].map((i) => [0, 1, 2].map((j) => c * (i === j ? 1 : 0) + s * K[i]![j]! + (1 - c) * o[i]![j]!)) }

export function nonabelianGauge(): { gaugeInvariant: boolean; curvedFlux: boolean; nonAbelian: boolean } {
  const rng = makeRng({ seed: 5 })
  const rnd = (): number => rng.next()
  const rr = (): M3 => rot([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], rnd() * 2) // random SO(3) link
  // a plaquette, 4 link matrices (bottom, right, top, left). Holonomy H = U_b U_r U_t^T U_l^T (around the loop)
  const Ub = rr(), Ur = rr(), Ut = rr(), Ul = rr()
  const holo = (b: M3, r: M3, t: M3, l: M3): M3 => mul(mul(mul(b, r), T(t)), T(l))
  const H = holo(Ub, Ur, Ut, Ul)
  const W0 = tr(H) // the non-abelian Wilson loop
  // (1) gauge transform at the 4 corners: U_{x->y} -> g_x U g_y^T. corners (00,10,11,01)
  const g00 = rr(), g10 = rr(), g11 = rr(), g01 = rr()
  const Ub2 = mul(mul(g00, Ub), T(g10)) // bottom 00->10
  const Ur2 = mul(mul(g10, Ur), T(g11)) // right 10->11
  const Ut2 = mul(mul(g01, Ut), T(g11)) // top 01->11
  const Ul2 = mul(mul(g00, Ul), T(g01)) // left 00->01
  const W1 = tr(holo(Ub2, Ur2, Ut2, Ul2))
  const gaugeInvariant = Math.abs(W0 - W1) < 1e-9
  // (2) curvature, the holonomy is a non-trivial rotation (Tr != 3 = Tr(I))
  const curvedFlux = Math.abs(W0 - 3) > 1e-3
  // (3) non-abelian, two different orderings of the SAME links give different holonomies (matrices do not commute)
  const Hrev = holo(Ur, Ub, Ul, Ut) // swapped order
  let nonAbelian = false
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (Math.abs(H[i]![j]! - Hrev[i]![j]!) > 1e-6) nonAbelian = true
  return { gaugeInvariant, curvedFlux, nonAbelian }
}

export default defineExperiment({
  id: 'gauge/nonabelian-gauge',
  title: 'a non-abelian SO(3) Wilson loop is gauge invariant, curved, and order-dependent',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = nonabelianGauge()
    const ok = r.gaugeInvariant && r.curvedFlux && r.nonAbelian
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the trace of an ordered product of SO(3) link matrices around a plaquette is invariant under corner gauge transforms, is a non-trivial rotation, and changes when the link order is swapped',
      metrics: {
        gaugeInvariant: r.gaugeInvariant ? 1 : 0,
        curvedFlux: r.curvedFlux ? 1 : 0,
        nonAbelian: r.nonAbelian ? 1 : 0,
      },
      notes:
        'L2, known physics, standard non-abelian lattice gauge theory shown on an SO(3) prototype. The links are a pseudo-random SO(3) fill, but gauge invariance and non-commutativity are exact properties of any links, so the random draw only samples them. The claim that so(10) is the actual local symmetry is asserted from triality (p226), not measured here.',
    })
  },
})
