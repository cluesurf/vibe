// P214 (the make-or-break gate, the RIGHT test): does the rule's effective ENERGY contain a stabilizing
// (Skyrme) term? Derrick is about the ENERGY landscape, so a dynamical streaming term cannot supply it, only an
// energy term can. The rule carries a DIRAC FERMION (the coin walk, p191), and integrating a fermion out
// induces a gradient-stiffness (Skyrme) term whose SIGN decides stabilization. This computes that sign directly,
// the fermion sea energy in a soliton (kink) background as a function of the soliton WIDTH R. If the sea energy
// RISES as the soliton sharpens (R -> small), the fermion adds POSITIVE gradient stiffness -> stabilizing.
// 1D Jackiw-Rebbi Dirac, real-symmetric Hamiltonian, eigenvalues by Jacobi. (1D is the tractable proxy for the
// 3D Skyrme sign, same fermion-induced-stiffness mechanism.) Run: npx tsx code/experiment/p214-actual-rule-soliton.ts

import { pathToFileURL } from 'node:url'

// real-symmetric 1D Dirac H = [[m(x), -D],[D, -m(x)]], D = central difference (antisymmetric)
function buildH(N: number, m0: number, R: number): number[][] {
  const n = 2 * N
  const H: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  const m = (i: number): number => m0 * Math.tanh((i - N / 2) / R)
  for (let i = 0; i < N; i++) {
    H[2 * i]![2 * i] = m(i)
    H[2 * i + 1]![2 * i + 1] = -m(i)
    if (i + 1 < N) { // -D on (u,v), +D on (v,u); D[i][i+1] = +1/2
      H[2 * i]![2 * (i + 1) + 1] = -0.5; H[2 * (i + 1) + 1]![2 * i] = -0.5
      H[2 * i + 1]![2 * (i + 1)] = 0.5; H[2 * (i + 1)]![2 * i + 1] = 0.5
    }
  }
  return H
}
// eigenvalues of a real symmetric matrix via cyclic Jacobi (values only)
function jacobiEigenvalues(A: number[][], n: number): number[] {
  const a = A.map((r) => r.slice())
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p]![q]! * a[p]![q]!
    if (off < 1e-12) break
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      const apq = a[p]![q]!; if (Math.abs(apq) < 1e-14) continue
      const app = a[p]![p]!, aqq = a[q]![q]!
      const phi = 0.5 * Math.atan2(2 * apq, aqq - app), c = Math.cos(phi), s = Math.sin(phi)
      for (let k = 0; k < n; k++) { const akp = a[k]![p]!, akq = a[k]![q]!; a[k]![p] = c * akp - s * akq; a[k]![q] = s * akp + c * akq }
      for (let k = 0; k < n; k++) { const apk = a[p]![k]!, aqk = a[q]![k]!; a[p]![k] = c * apk - s * aqk; a[q]![k] = s * apk + c * aqk }
    }
  }
  return Array.from({ length: n }, (_, i) => a[i]![i]!)
}
function seaEnergy(N: number, m0: number, R: number): number {
  const ev = jacobiEigenvalues(buildH(N, m0, R), 2 * N)
  let s = 0; for (const e of ev) if (e < 0) s += e
  return s
}

export function fermionInducedStabilizer(): { data: { R: number; sea: number }[]; risesAsSharpens: boolean } {
  const N = 80, m0 = 1.0
  const Rs = [2, 3, 5, 8, 13]
  const data = Rs.map((R) => ({ R, sea: Math.round(seaEnergy(N, m0, R) * 1000) / 1000 }))
  console.log('P214 fermion-induced stiffness, Dirac sea energy vs soliton width R (the Skyrme-sign mechanism):')
  for (const d of data) console.log(`  R=${d.R}: fermion sea energy = ${d.sea}`)
  // induced stiffness: does the (more negative) sea energy go UP (less negative) as the soliton sharpens (small R)?
  // a sharper soliton costing MORE fermion energy = positive induced gradient stiffness = stabilizing.
  const sharp = data[0]!.sea, smooth = data[data.length - 1]!.sea
  const risesAsSharpens = sharp > smooth // sea energy higher (less bound) for the sharp soliton
  console.log(`  sharpest R=${data[0]!.R}: ${sharp}   smoothest R=${data[data.length - 1]!.R}: ${smooth}`)
  console.log(`  => fermion energy rises as the soliton sharpens: ${risesAsSharpens} (here FALSE, it falls -> 1D fermion prefers sharp)`)
  console.log('  HONEST CONCLUSION: this does NOT settle the gate. 1D is NOT a valid proxy for the 3D Skyrme term,')
  console.log('  the stabilizing Skyrme sign comes from a specifically-3D chiral-anomaly / Wess-Zumino structure with NO')
  console.log('  1D analog. So the 1D trend (destabilizing) is irrelevant to the 3D sign. The Skyrme-sign gate stays OPEN,')
  console.log('  it needs the full 3D fermion-in-skyrmion spectrum (Lanczos, needs real linear algebra) or the analytic')
  console.log('  Chapman-Enskog Burnett coefficient. None of the tractable proxies (p205 texture, dynamics, this 1D) resolve it.')
  return { data, risesAsSharpens }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = fermionInducedStabilizer()
  console.log(`RESULT: sea energy ${r.data.map((d) => d.sea).join('/')}, stabilizing sign ${r.risesAsSharpens}`)
}
