// Option D with the circularity test built in.
// (1) Koide Q for the assigned triple under the factorization.
// (2) Q for every triple fitting the ratios at 3% (if all land near 2/3, the Koide check
//     is implied by the ratio fit, not independent).
// (3) The genuinely independent check: structural classes of the assigned directions.
const LAMBDA = 18.278
const kac: [number, number][] = [
  [5, 0.0864], [7, 0.0888], [16, 0.0895], [12, 0.0914], [15, 0.0955],
  [4, 0.1016], [20, 0.1106], [23, 0.1160], [11, 0.1223], [10, 0.1251],
  [19, 0.1277], [8, 0.1371], [9, 0.1401], [13, 0.1411], [21, 0.1557], [22, 0.1557],
  [18, 0.2020],
]
const NEED_MU = 0.868 / 0.798
const NEED_E = 1.402 / 0.798

const koide = (mE: number, mMu: number, mTau: number): number =>
  (mE + mMu + mTau) / (Math.sqrt(mE) + Math.sqrt(mMu) + Math.sqrt(mTau)) ** 2

const massOf = (kappa: number, d: number): number => kappa * Math.pow(LAMBDA, -d / 2)

// PDG reference
const qPdg = koide(0.51099895, 105.6583755, 1776.86)
console.log('Koide Q: PDG =', qPdg.toFixed(6), ' target 2/3 =', (2 / 3).toFixed(6))

// uniform-kappa baseline (pure ladder)
console.log('uniform-kappa ladder Q =', koide(massOf(1, 9), massOf(1, 5), massOf(1, 3)).toFixed(6))

// all fitting triples at 3 percent, with Q for each
const rows: string[] = []
for (const [dt, kt] of kac) for (const [dm, km] of kac) for (const [de, ke] of kac) {
  if (dt === dm || dm === de || dt === de) continue
  const err = Math.max(Math.abs(km / kt / NEED_MU - 1), Math.abs(ke / kt / NEED_E - 1))
  if (err < 0.03) {
    const q = koide(massOf(ke, 9), massOf(km, 5), massOf(kt, 3))
    rows.push(`tau=d${dt} mu=d${dm} e=d${de} ratioErr=${(err * 100).toFixed(2)}% Q=${q.toFixed(5)} |Q-2/3|=${(Math.abs(q - 2 / 3) * 100).toFixed(3)}%`)
  }
}
console.log('fitting triples at 3%:')
for (const r of rows) console.log(' ', r)
