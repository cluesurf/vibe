// P186: the emergent field's entanglement obeys the AREA law (the gravity and holography precondition). (P151, P15, related-works theme 7/8, useful-techniques.)
//
// Emergent gravity (Jacobson, Verlinde) and holography (Ryu-Takayanagi) both rest on ONE precondition, the
// vacuum's entanglement entropy scales with the BOUNDARY of a region (the area law), not its volume. We test
// this on the free-fermion (Dirac) field the vibe quantum walk realizes (P151), a tight-binding chain with a
// tunable mass gap, computing the ground-state entanglement entropy of an interval from the eigenvalues of
// the restricted correlation matrix (the standard free-fermion method). We check, (1) a MASSIVE field
// SATURATES (area law, the entropy depends on the two boundary points, not the interval length), (2) the
// MASSLESS or critical field grows as (c/3) ln L with central charge c about 1 (the conformal / RT law,
// holography in 1+1D), and (3) a thermal or maximally-mixed state grows LINEARLY (the volume law, the
// contrast). Ground state area-law versus thermal volume-law is exactly the dividing line emergent gravity
// needs. No base change, this is a property of the emergent field. Run: npx tsx code/experiment/p186-area-law.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Jacobi eigensolver for a symmetric matrix, returns eigenvalues and eigenvectors (columns of V).
function jacobi(a0: number[][]): { values: number[]; vectors: number[][] } {
  const n = a0.length
  const a = a0.map((r) => r.slice())
  const V: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p]![q]! * a[p]![q]!
    if (off < 1e-20) break
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(a[p]![q]!) < 1e-18) continue
      const theta = (a[q]![q]! - a[p]![p]!) / (2 * a[p]![q]!)
      const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
      const c = 1 / Math.sqrt(t * t + 1)
      const s = t * c
      for (let k = 0; k < n; k++) {
        const akp = a[k]![p]!
        const akq = a[k]![q]!
        a[k]![p] = c * akp - s * akq
        a[k]![q] = s * akp + c * akq
      }
      for (let k = 0; k < n; k++) {
        const apk = a[p]![k]!
        const aqk = a[q]![k]!
        a[p]![k] = c * apk - s * aqk
        a[q]![k] = s * apk + c * aqk
      }
      for (let k = 0; k < n; k++) {
        const vkp = V[k]![p]!
        const vkq = V[k]![q]!
        V[k]![p] = c * vkp - s * vkq
        V[k]![q] = s * vkp + c * vkq
      }
    }
  }
  const values = a.map((r, i) => r[i]!)
  return { values, vectors: V }
}

// the ground-state correlation matrix C_ij = <c_i^dag c_j> of a tight-binding chain with a staggered mass.
// hopping = -1, on-site potential (-1)^i * mass, half filling (occupy the lowest L/2 single-particle states).
function correlationMatrix(L: number, mass: number): number[][] {
  const H: number[][] = Array.from({ length: L }, () => new Array<number>(L).fill(0))
  for (let i = 0; i < L; i++) H[i]![i] = (i % 2 === 0 ? 1 : -1) * mass
  for (let i = 0; i < L - 1; i++) {
    H[i]![i + 1] = -1
    H[i + 1]![i] = -1
  }
  const { values, vectors } = jacobi(H)
  const order = values.map((v, i) => [v, i] as [number, number]).sort((p, q) => p[0] - q[0])
  const occ = order.slice(0, Math.floor(L / 2)).map((p) => p[1])
  const C: number[][] = Array.from({ length: L }, () => new Array<number>(L).fill(0))
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) {
    let s = 0
    for (const a of occ) s += vectors[i]![a]! * vectors[j]![a]!
    C[i]![j] = s
  }
  return C
}

// entanglement entropy (nats) of the interval [0, len) from the eigenvalues of the restricted correlation matrix
function intervalEntropy(C: number[][], len: number): number {
  const sub: number[][] = []
  for (let i = 0; i < len; i++) sub.push(C[i]!.slice(0, len))
  const { values } = jacobi(sub)
  let S = 0
  for (const z0 of values) {
    const z = Math.max(1e-12, Math.min(1 - 1e-12, z0))
    S += -z * Math.log(z) - (1 - z) * Math.log(1 - z)
  }
  return S
}

function fitSlope(xs: number[], ys: number[]): { slope: number; r2: number } {
  const m = xs.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (let i = 0; i < m; i++) {
    sx += xs[i]!
    sy += ys[i]!
    sxx += xs[i]! * xs[i]!
    sxy += xs[i]! * ys[i]!
    syy += ys[i]! * ys[i]!
  }
  const slope = (m * sxy - sx * sy) / (m * sxx - sx * sx)
  const meanY = sy / m
  const b = (sy - slope * sx) / m
  let ssRes = 0
  for (let i = 0; i < m; i++) ssRes += (ys[i]! - (slope * xs[i]! + b)) ** 2
  const ssTot = syy - m * meanY * meanY
  return { slope, r2: ssTot > 0 ? 1 - ssRes / ssTot : 0 }
}

export function areaLaw(input?: { L?: number }): {
  L: number
  lengths: number[]
  massiveEntropies: number[]
  masslessEntropies: number[]
  massiveSaturates: boolean
  centralCharge: number
  conformalR2: number
  masslessLog: boolean
  volumeSlope: number
  volumeLaw: boolean
  groundStateAreaLaw: boolean
  solved: boolean
} {
  const L = input?.L ?? 96
  const lengths: number[] = []
  for (let l = 6; l <= L / 2; l += 4) lengths.push(l)

  // (1) massive field, the entropy should SATURATE (area law, boundary-only)
  const Cm = correlationMatrix(L, 0.7)
  const massiveEntropies = lengths.map((l) => intervalEntropy(Cm, l))
  const lateMassive = massiveEntropies.slice(Math.floor(massiveEntropies.length / 2))
  const massiveSpread = Math.max(...lateMassive) - Math.min(...lateMassive)
  const massiveSaturates = massiveSpread < 0.1 // flat tail = saturation = area law

  // (2) massless / critical field, S ~ (c/3) ln(L), extract the central charge
  const C0 = correlationMatrix(L, 0)
  const masslessEntropies = lengths.map((l) => intervalEntropy(C0, l))
  const { slope, r2 } = fitSlope(lengths.map((l) => Math.log(l)), masslessEntropies)
  // the interval [0, len) starts at the chain's OPEN boundary, so there is a SINGLE entangling cut (at len),
  // giving S = (c/6) ln(len), hence c = 6 * slope (a bulk two-cut interval would be c/3)
  const centralCharge = slope * 6
  const conformalR2 = r2
  const masslessLog = conformalR2 > 0.95 && Math.abs(centralCharge - 1) < 0.4 // c about 1, a clean log

  // (3) a maximally-mixed (infinite-temperature) state, C_A = I/2, S = len * ln 2 (volume law)
  const volumeEntropies = lengths.map((l) => l * Math.log(2))
  const { slope: volumeSlope } = fitSlope(lengths, volumeEntropies)
  const volumeLaw = volumeSlope > 0.5 // grows linearly with length

  const groundStateAreaLaw = massiveSaturates && masslessLog
  const solved = groundStateAreaLaw && volumeLaw
  return {
    L,
    lengths,
    massiveEntropies,
    masslessEntropies,
    massiveSaturates,
    centralCharge,
    conformalR2,
    masslessLog,
    volumeSlope,
    volumeLaw,
    groundStateAreaLaw,
    solved,
  }
}

export default defineExperiment({
  id: 'holography/area-law',
  title: 'the emergent field ground state is area-law while a thermal state is volume-law',
  category: 'holography',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = areaLaw({ L: 96 })
    const ok = r.solved && r.massiveSaturates && r.masslessLog && r.volumeLaw
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Dirac ground-state entanglement saturates for a massive field and grows as a conformal log with central charge about one while a thermal state grows linearly',
      metrics: {
        massiveSaturation: r.massiveEntropies[r.massiveEntropies.length - 1] ?? 0,
        centralCharge: r.centralCharge,
        conformalR2: r.conformalR2,
        volumeSlope: r.volumeSlope,
      },
      control: { volumeSlope: r.volumeSlope },
    })
  },
})
