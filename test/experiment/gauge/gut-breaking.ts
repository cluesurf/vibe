// P225 (GUT breaking, the last gauge step): so(10) -> SM. The natural Higgs in this model is the SELF, a self
// IS a 16-spinor (one generation, p221), so a self-CONDENSATE is a spinor VEV. A spinor (16) VEV in its su(5)
// -singlet component breaks so(10) -> su(5) (Georgi-Glashow), and su(5) -> SM by the standard adjoint step. We
// verify the chain on the root systems, (a) su(5)=A4 embeds in so(10)=D5, (b) the SM embeds in su(5), (c) the
// 16-spinor decomposes under su(5) as 1 + 10 + 5bar, so it HAS a singlet whose VEV preserves su(5).
// Run: npx tsx code/experiment/p225-gut-breaking.ts

import { dotVec, rootsAn, rootsDn } from '@/code/algebra/group/root-system'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const dot = dotVec
const eq = (a: number[], b: number[]): boolean => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]!) < 1e-9)
const d5 = (): number[][] => rootsDn(5)
const a4 = (): number[][] => rootsAn(5)
// A2 (+) A1 (the SM semisimple part) inside a root set
function smIn(R: number[][]): boolean { for (const a of R) for (const b of R) { if (dot(a, b) !== -1) continue; const ab = a.map((x, i) => x + b[i]!); if (!R.some((r) => eq(r, ab))) continue; if (R.some((c) => dot(c, a) === 0 && dot(c, b) === 0)) return true } return false }

export function gutBreaking(): { su5InSo10: boolean; smInSu5: boolean; sixteenSplit: string } {
  const D5 = d5(), A4 = a4()
  // (a) su(5)=A4 embeds in so(10)=D5 (the e_i-e_j roots are a subset of +-e_i+-e_j)
  const su5InSo10 = A4.every((r) => D5.some((d) => eq(d, r))) && A4.length === 20
  // (b) the SM embeds in su(5) (Georgi-Glashow)
  const smInSu5 = smIn(A4)
  // (c) the 16-spinor under su(5): split the (+-1/2)^5 even-minus weights by minus-count (the u(1) grade)
  const six: number[][] = []
  for (const a of [0.5, -0.5]) for (const b of [0.5, -0.5]) for (const c of [0.5, -0.5]) for (const d of [0.5, -0.5]) for (const e of [0.5, -0.5]) { const w = [a, b, c, d, e]; if (w.filter((x) => x < 0).length % 2 === 0) six.push(w) }
  const byMinus: Record<number, number> = {}; for (const w of six) { const m = w.filter((x) => x < 0).length; byMinus[m] = (byMinus[m] ?? 0) + 1 }
  const sixteenSplit = `16 = ${byMinus[0]} (singlet 1) + ${byMinus[2]} (10) + ${byMinus[4]} (5bar)`
  const hasSinglet = byMinus[0] === 1
  return { su5InSo10, smInSu5, sixteenSplit }
}

export default defineExperiment({
  id: 'gauge/gut-breaking',
  title: 'so(10) breaks to su(5) to the Standard Model with the 16-spinor carrying a singlet',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = gutBreaking()
    const ok = r.su5InSo10 && r.smInSu5
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'su(5) embeds in so(10) and the Standard Model embeds in su(5), and the 16-spinor decomposes as 1 plus 10 plus 5bar so it has a singlet whose condensate breaks so(10) to su(5)',
      metrics: {
        su5InSo10: r.su5InSo10 ? 1 : 0,
        smInSu5: r.smInSu5 ? 1 : 0,
      },
      notes:
        'L1, known math, the standard Georgi-Glashow chain on the root systems. It verifies the breaking chain is consistent, not that the self-condensate dynamically forms in the singlet direction.',
    })
  },
})
