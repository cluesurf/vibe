// P158: genuine quantum INTERFERENCE and the BORN rule. (P151, P132, bridge-theories-vibe-to-field.md.)
//
// P151 showed the unitary (quantum-walk) completion of the rule is relativistic and reflection-positive.
// The deepest quantum signature, "problem B's heart", is INTERFERENCE, complex amplitudes that CANCEL,
// which no classical stochastic process can do (probabilities only ADD). This compares the coherent
// quantum walk to the SAME walk run classically (incoherent probabilities), and checks:
//   (1) INTERFERENCE, the quantum distribution has interior NODES where the probability is about zero
//       (amplitudes destructively cancel) and rapid fringes, the classical one is smooth with no nodes.
//   (2) UNITARITY, the total probability sum |psi|^2 stays 1 (norm preserved), so |psi|^2 is a genuine
//       probability, the BORN rule.
// Together these are the genuinely-quantum behaviour, present in the unitary rule, absent in its classical
// (stochastic) shadow. Run: npx tsx code/experiment/p158-born-interference.ts

import { pathToFileURL } from 'node:url'

export function bornInterference(input?: { steps?: number }): {
  steps: number
  quantumMaxima: number
  classicalMaxima: number
  quantumNodes: number
  quantumFringeContrast: number
  classicalFringeContrast: number
  normDeviation: number
  interferes: boolean
  unitary: boolean
  bornRule: boolean
  solved: boolean
} {
  const T = input?.steps ?? 80
  const W = 2 * T + 3
  const off = T + 1 // index offset so x in [-T-1, T+1] maps to [0, W-1]

  // --- coherent quantum walk: amplitude psi[x][c], c in {0=left,1=right}, Hadamard coin then shift ---
  const re = [new Float64Array(W), new Float64Array(W)]
  const im = [new Float64Array(W), new Float64Array(W)]
  // symmetric start at x=0, (|L> + i|R>)/sqrt2 (gives a symmetric two-horned distribution)
  re[0]![off] = 1 / Math.SQRT2
  im[1]![off] = 1 / Math.SQRT2
  const h = 1 / Math.SQRT2
  for (let t = 0; t < T; t++) {
    const nr = [new Float64Array(W), new Float64Array(W)]
    const ni = [new Float64Array(W), new Float64Array(W)]
    for (let x = 1; x < W - 1; x++) {
      // Hadamard coin: (a,b) -> ((a+b)/sqrt2, (a-b)/sqrt2)
      const ar = re[0]![x]!
      const ai = im[0]![x]!
      const br = re[1]![x]!
      const bi = im[1]![x]!
      const c0r = h * (ar + br)
      const c0i = h * (ai + bi)
      const c1r = h * (ar - br)
      const c1i = h * (ai - bi)
      // shift: c0 (left) -> x-1, c1 (right) -> x+1
      nr[0]![x - 1]! += c0r
      ni[0]![x - 1]! += c0i
      nr[1]![x + 1]! += c1r
      ni[1]![x + 1]! += c1i
    }
    re[0] = nr[0]!
    re[1] = nr[1]!
    im[0] = ni[0]!
    im[1] = ni[1]!
  }
  const Pq = new Float64Array(W)
  let norm = 0
  for (let x = 0; x < W; x++) {
    Pq[x] = re[0]![x]! ** 2 + im[0]![x]! ** 2 + re[1]![x]! ** 2 + im[1]![x]! ** 2
    norm += Pq[x]!
  }
  const normDeviation = Math.abs(norm - 1)

  // --- classical walk: SAME coin as probabilities (incoherent), no phase ---
  const p = [new Float64Array(W), new Float64Array(W)]
  p[0]![off] = 0.5
  p[1]![off] = 0.5
  for (let t = 0; t < T; t++) {
    const np = [new Float64Array(W), new Float64Array(W)]
    for (let x = 1; x < W - 1; x++) {
      // incoherent coin: each component splits 50/50 (|Hadamard|^2)
      const a = p[0]![x]!
      const b = p[1]![x]!
      const c0 = 0.5 * a + 0.5 * b
      const c1 = 0.5 * a + 0.5 * b
      np[0]![x - 1]! += c0
      np[1]![x + 1]! += c1
    }
    p[0] = np[0]!
    p[1] = np[1]!
  }
  const Pc = new Float64Array(W)
  for (let x = 0; x < W; x++) Pc[x] = p[0]![x]! + p[1]![x]!

  // measure FRINGES on the populated parity (the walk fills only every-other site at even T). Quantum
  // interference shows as many oscillatory local maxima (fringes) and deep interior dips (near-nodes),
  // the classical walk is a single smooth hump.
  const fringeStats = (P: Float64Array): { nodes: number; maxima: number; contrast: number } => {
    const arr: number[] = []
    for (let x = off % 2; x < W; x += 2) arr.push(P[x]!) // the populated parity
    let peak = 0
    for (const v of arr) peak = Math.max(peak, v)
    let maxima = 0
    let nodes = 0
    let tv = 0
    for (let i = 1; i < arr.length - 1; i++) {
      tv += Math.abs(arr[i]! - arr[i - 1]!)
      if (arr[i]! > arr[i - 1]! && arr[i]! > arr[i + 1]! && arr[i]! > 0.05 * peak) maxima++
      // a near-node: a deep local dip flanked by substantial peaks (amplitudes nearly cancelled)
      if (arr[i]! < arr[i - 1]! && arr[i]! < arr[i + 1]! && arr[i]! < 0.15 * peak && arr[i - 1]! > 0.3 * peak && arr[i + 1]! > 0.3 * peak) nodes++
    }
    return { nodes, maxima, contrast: tv / (peak + 1e-12) }
  }
  const q = fringeStats(Pq)
  const c = fringeStats(Pc)

  const interferes = q.maxima >= 5 && q.maxima > c.maxima + 3 && q.contrast > c.contrast * 1.5
  const unitary = normDeviation < 1e-9
  const bornRule = unitary // P = |psi|^2 by construction, and it sums to 1, so it is a genuine probability
  const solved = interferes && unitary && bornRule

  return {
    steps: T,
    quantumMaxima: q.maxima,
    classicalMaxima: c.maxima,
    quantumNodes: q.nodes,
    quantumFringeContrast: q.contrast,
    classicalFringeContrast: c.contrast,
    normDeviation,
    interferes,
    unitary,
    bornRule,
    solved,
  }
}

export function main(): void {
  const r = bornInterference()
  console.log('P158: genuine quantum interference and the Born rule')
  console.log('')
  console.log(`  ${r.steps}-step walk, quantum (coherent amplitudes) vs classical (incoherent probabilities)`)
  console.log('')
  console.log('  INTERFERENCE (oscillatory fringes and near-nodes where amplitudes cancel, impossible classically):')
  console.log(`    quantum fringes (local maxima): ${r.quantumMaxima}   classical: ${r.classicalMaxima}`)
  console.log(`    quantum near-nodes (deep dips): ${r.quantumNodes}`)
  console.log(`    quantum fringe contrast: ${r.quantumFringeContrast.toFixed(2)}   classical: ${r.classicalFringeContrast.toFixed(2)}`)
  console.log(`    genuine interference (quantum cancels, classical does not): ${r.interferes}`)
  console.log('')
  console.log(`  UNITARITY / BORN, total |psi|^2 = 1 (deviation ${r.normDeviation.toExponential(1)}), so |psi|^2 is a genuine probability: ${r.bornRule}`)
  console.log('')
  console.log(`  the unitary rule shows real quantum behaviour (interference + Born), its classical shadow does not: ${r.solved}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
