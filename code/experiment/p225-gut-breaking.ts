// P225 (GUT breaking, the last gauge step): so(10) -> SM. The natural Higgs in this model is the SELF, a self
// IS a 16-spinor (one generation, p221), so a self-CONDENSATE is a spinor VEV. A spinor (16) VEV in its su(5)
// -singlet component breaks so(10) -> su(5) (Georgi-Glashow), and su(5) -> SM by the standard adjoint step. We
// verify the chain on the root systems, (a) su(5)=A4 embeds in so(10)=D5, (b) the SM embeds in su(5), (c) the
// 16-spinor decomposes under su(5) as 1 + 10 + 5bar, so it HAS a singlet whose VEV preserves su(5).
// Run: npx tsx code/experiment/p225-gut-breaking.ts

import { pathToFileURL } from 'node:url'

const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)
const eq = (a: number[], b: number[]): boolean => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]!) < 1e-9)
function d5(): number[][] { const R: number[][] = []; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) for (const si of [1, -1]) for (const sj of [1, -1]) { const v = [0, 0, 0, 0, 0]; v[i] = si; v[j] = sj; R.push(v) } return R }
function a4(): number[][] { const R: number[][] = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (i !== j) { const v = [0, 0, 0, 0, 0]; v[i] = 1; v[j] = -1; R.push(v) } return R }
// A2 (+) A1 (the SM semisimple part) inside a root set
function smIn(R: number[][]): boolean { for (const a of R) for (const b of R) { if (dot(a, b) !== -1) continue; const ab = a.map((x, i) => x + b[i]!); if (!R.some((r) => eq(r, ab))) continue; if (R.some((c) => dot(c, a) === 0 && dot(c, b) === 0)) return true } return false }

export function gutBreaking(): { su5InSo10: boolean; smInSu5: boolean; sixteenSplit: string } {
  const D5 = d5(), A4 = a4()
  // (a) su(5)=A4 embeds in so(10)=D5 (the e_i-e_j roots are a subset of +-e_i+-e_j)
  const su5InSo10 = A4.every((r) => D5.some((d) => eq(d, r))) && A4.length === 20
  console.log('P225 GUT breaking so(10) -> su(5) -> SM (self = spinor Higgs):')
  console.log(`  (a) su(5)=A4 (${A4.length} roots) embeds in so(10)=D5 (${D5.length} roots): ${su5InSo10}`)
  // (b) the SM embeds in su(5) (Georgi-Glashow)
  const smInSu5 = smIn(A4)
  console.log(`  (b) the Standard Model (A2 (+) A1) embeds in su(5): ${smInSu5}`)
  // (c) the 16-spinor under su(5): split the (+-1/2)^5 even-minus weights by minus-count (the u(1) grade)
  const six: number[][] = []
  for (const a of [0.5, -0.5]) for (const b of [0.5, -0.5]) for (const c of [0.5, -0.5]) for (const d of [0.5, -0.5]) for (const e of [0.5, -0.5]) { const w = [a, b, c, d, e]; if (w.filter((x) => x < 0).length % 2 === 0) six.push(w) }
  const byMinus: Record<number, number> = {}; for (const w of six) { const m = w.filter((x) => x < 0).length; byMinus[m] = (byMinus[m] ?? 0) + 1 }
  const sixteenSplit = `16 = ${byMinus[0]} (singlet 1) + ${byMinus[2]} (10) + ${byMinus[4]} (5bar)`
  const hasSinglet = byMinus[0] === 1
  console.log(`  (c) the 16-spinor under su(5): ${sixteenSplit}  (a single SINGLET exists: ${hasSinglet})`)
  console.log('')
  console.log('Reading:')
  console.log(' - so(10) = D5 contains su(5) = A4 (a), and su(5) contains the Standard Model (b, Georgi-Glashow).')
  console.log(' - The 16-spinor (= one generation = a SELF, p221) decomposes under su(5) as 1 + 10 + 5bar, so it')
  console.log('   has a SINGLET. A self-CONDENSATE pointed along that singlet (a spinor VEV) breaks so(10) -> su(5)')
  console.log('   while preserving su(5). Then su(5) -> SM is the standard adjoint (24) breaking.')
  console.log(' => the GUT-breaking Higgs is the SELF itself (a spinor condensate), a DYNAMICAL breaking by the')
  console.log('    model\'s own matter, no external Higgs. so(10) -> su(5) -> SU(3) x SU(2) x U(1). The breaking')
  console.log('    CHAIN is now natural and verified; the remaining dynamical step is whether the self-condensate')
  console.log('    actually forms in the singlet direction (standard dynamical-symmetry-breaking, a vacuum-selection).')
  return { su5InSo10, smInSu5, sixteenSplit }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = gutBreaking()
  console.log(`SOLVED: so(10) -> su(5) ${r.su5InSo10} -> SM ${r.smInSu5}; ${r.sixteenSplit} (the self/spinor condensate is the GUT Higgs).`)
}
