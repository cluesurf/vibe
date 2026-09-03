// The species-to-lepton assignment with the look-elsewhere count. Required prefactor
// ratios (mu/tau, e/tau) = (1.088, 1.756). Scan all ordered triples of well-measured Kac
// masses, count those fitting both ratios within tolerance, and report the best.
const kac: [number, number][] = [
  [5, 0.0864], [7, 0.0888], [16, 0.0895], [12, 0.0914], [15, 0.0955],
  [4, 0.1016], [20, 0.1106], [23, 0.1160], [11, 0.1223], [10, 0.1251],
  [19, 0.1277], [8, 0.1371], [9, 0.1401], [13, 0.1411], [21, 0.1557], [22, 0.1557],
  [18, 0.2020],
]
const NEED_MU = 0.868 / 0.798   // 1.0877
const NEED_E = 1.402 / 0.798    // 1.7569

for (const tol of [0.005, 0.01, 0.02, 0.03]) {
  let count = 0
  let best: { t: number; m: number; e: number; err: number } | null = null
  for (const [dt, kt] of kac) for (const [dm, km] of kac) for (const [de, ke] of kac) {
    if (dt === dm || dm === de || dt === de) continue
    const rMu = km / kt
    const rE = ke / kt
    const err = Math.max(Math.abs(rMu / NEED_MU - 1), Math.abs(rE / NEED_E - 1))
    if (err < tol) {
      count++
      if (!best || err < best.err) best = { t: dt, m: dm, e: de, err }
    }
  }
  console.log(`tol ${(tol * 100).toFixed(1)}%: ${count} fitting triples${best ? `  best: tau=dir${best.t} mu=dir${best.m} e=dir${best.e} err=${(best.err * 100).toFixed(2)}%` : ''}`)
}
