// MTR builder (E-MTR-0029) POST-RUN DIAGNOSTIC, not gated: the weight centroid of the ground's cluster at each K
// (lines within 0.006 of the line of largest weight), and its relativity fraction
// usage: node test/record/E-MTR-0029/run/mtr-boost-centroid.mjs <K,K,...>
import { readFileSync } from 'node:fs'

const RECORD = `${import.meta.dirname}/..`
const E0 = 1.676673975509106
const a = 0.11708484206118808
for (const K of process.argv[2].split(',').map(Number)) {
  const j = JSON.parse(readFileSync(`${RECORD}/mtr-boost-K${K}.json`, 'utf8'))
  const top = j.lines.reduce((b, l) => (l.weight > b.weight ? l : b))
  const near = j.lines.filter(l => Math.abs(l.E - top.E) <= 0.006)
  const w = near.reduce((s, l) => s + l.weight, 0)
  const E = near.reduce((s, l) => s + l.weight * l.E, 0) / w
  const rel = Math.sqrt(E0 * E0 + 2 * a * E0 * K * K)
  const gal = E0 + a * K * K
  console.log(`K ${K}: top-weight line ${top.E.toFixed(6)} (weight ${top.weight.toFixed(3)}), cluster ${near.length} lines weight ${w.toFixed(3)} centroid ${E.toFixed(6)}, rel ${rel.toFixed(6)} gal ${gal.toFixed(6)} rho ${((gal - E) / (gal - rel)).toFixed(3)}`)
}
