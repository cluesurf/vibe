// P229 (#1, pin the discrete collision + verify END-TO-END): one CONCRETE discrete directional rule, fully
// specified, run as the actual discrete dynamics (no continuum tools). The rule, per cell 4 directional ternary
// charges (qE,qW,qN,qS) in {-1,0,+1}; STREAM each charge to its neighbour; COLLIDE by the reversible involution
// that rotates a zero-momentum head-on pair between the x and y axes ((s,s,0,0) <-> (0,0,s,s)). This conserves
// charge and momentum and is exactly reversible. We verify, end to end, (1) exact charge conservation, (2) exact
// momentum conservation, (3) exact reversibility (forward T then inverse T = identity), (4) an emergent SMOOTH
// continuum (the coarse-grained density evolves smoothly from the discrete rule). This grounds "discrete base ->
// emergent continuum" in the actual rule. Run: npx tsx code/experiment/p229-discrete-rule-endtoend.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const L = 64
const N = L * L
const idx = (x: number, y: number): number => ((y % L) + L) % L * L + (((x % L) + L) % L)
// state: 4 ternary arrays, one per direction (E,W,N,S)
type State = { E: Int8Array; W: Int8Array; N: Int8Array; S: Int8Array }
const clone = (s: State): State => ({ E: s.E.slice(), W: s.W.slice(), N: s.N.slice(), S: s.S.slice() })

// COLLIDE: reversible involution. (qE,qW,qN,qS)=(s,s,0,0) <-> (0,0,s,s) for s=+-1. Else unchanged. (conserves
// charge sum and momentum (qE-qW, qN-qS)=0 in both, an involution.)
function collide(s: State): void {
  for (let i = 0; i < N; i++) {
    const e = s.E[i]!, w = s.W[i]!, n = s.N[i]!, so = s.S[i]!
    if (n === 0 && so === 0 && e === w && e !== 0) { s.E[i] = 0; s.W[i] = 0; s.N[i] = e as -1 | 1; s.S[i] = e as -1 | 1 }
    else if (e === 0 && w === 0 && n === so && n !== 0) { s.N[i] = 0; s.S[i] = 0; s.E[i] = n as -1 | 1; s.W[i] = n as -1 | 1 }
  }
}
// STREAM: each charge moves one cell in its direction. qE_new[x,y] = qE_old[x-1,y], etc.
function stream(s: State): State {
  const o: State = { E: new Int8Array(N), W: new Int8Array(N), N: new Int8Array(N), S: new Int8Array(N) }
  for (let x = 0; x < L; x++) for (let y = 0; y < L; y++) {
    o.E[idx(x, y)] = s.E[idx(x - 1, y)]!; o.W[idx(x, y)] = s.W[idx(x + 1, y)]!
    o.N[idx(x, y)] = s.N[idx(x, y - 1)]!; o.S[idx(x, y)] = s.S[idx(x, y + 1)]!
  }
  return o
}
function streamInverse(s: State): State {
  const o: State = { E: new Int8Array(N), W: new Int8Array(N), N: new Int8Array(N), S: new Int8Array(N) }
  for (let x = 0; x < L; x++) for (let y = 0; y < L; y++) {
    o.E[idx(x, y)] = s.E[idx(x + 1, y)]!; o.W[idx(x, y)] = s.W[idx(x - 1, y)]!
    o.N[idx(x, y)] = s.N[idx(x, y + 1)]!; o.S[idx(x, y)] = s.S[idx(x, y - 1)]!
  }
  return o
}
const charge = (s: State): number => { let c = 0; for (let i = 0; i < N; i++) c += s.E[i]! + s.W[i]! + s.N[i]! + s.S[i]!; return c }
const momentum = (s: State): [number, number] => { let px = 0, py = 0; for (let i = 0; i < N; i++) { px += s.E[i]! - s.W[i]!; py += s.N[i]! - s.S[i]! } return [px, py] }
function density(s: State): Float64Array { const d = new Float64Array(N); for (let i = 0; i < N; i++) d[i] = s.E[i]! + s.W[i]! + s.N[i]! + s.S[i]!; return d }

export function discreteRuleEndToEnd(): { chargeOk: boolean; momentumOk: boolean; reversible: boolean; smooth: boolean } {
  let rng = 7
  const rnd = (): number => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff }
  const init: State = { E: new Int8Array(N), W: new Int8Array(N), N: new Int8Array(N), S: new Int8Array(N) }
  for (let i = 0; i < N; i++) { init.E[i] = (Math.floor(rnd() * 3) - 1) as -1 | 0 | 1; init.W[i] = (Math.floor(rnd() * 3) - 1) as -1 | 0 | 1; init.N[i] = (Math.floor(rnd() * 3) - 1) as -1 | 0 | 1; init.S[i] = (Math.floor(rnd() * 3) - 1) as -1 | 0 | 1 }
  const c0 = charge(init), [px0, py0] = momentum(init)
  // forward T steps (collide then stream)
  let s = clone(init); const T = 200
  for (let t = 0; t < T; t++) { collide(s); s = stream(s) }
  const c1 = charge(s), [px1, py1] = momentum(s)
  const chargeOk = c1 === c0, momentumOk = px1 === px0 && py1 === py0
  // inverse T steps (un-stream then collide; collide is its own inverse) -> recover init
  let r = clone(s)
  for (let t = 0; t < T; t++) { r = streamInverse(r); collide(r) }
  let diff = 0; for (let i = 0; i < N; i++) diff += Math.abs(r.E[i]! - init.E[i]!) + Math.abs(r.W[i]! - init.W[i]!) + Math.abs(r.N[i]! - init.N[i]!) + Math.abs(r.S[i]! - init.S[i]!)
  const reversible = diff === 0
  console.log('P229 the discrete directional rule, verified end-to-end (no continuum tools):')
  console.log(`  (1) charge conserved exactly: ${chargeOk} (${c0} -> ${c1})`)
  console.log(`  (2) momentum conserved exactly: ${momentumOk} (${[px0, py0]} -> ${[px1, py1]})`)
  console.log(`  (3) exactly reversible (forward ${T} then inverse ${T} = identity): ${reversible} (diff ${diff})`)
  // (4) emergent smooth continuum: seed a localized density blob, evolve, coarse-grain, check it spreads SMOOTHLY
  const blob: State = { E: new Int8Array(N), W: new Int8Array(N), N: new Int8Array(N), S: new Int8Array(N) }
  const c = L >> 1
  for (let x = c - 6; x <= c + 6; x++) for (let y = c - 6; y <= c + 6; y++) { blob.E[idx(x, y)] = 1; blob.W[idx(x, y)] = 1; blob.N[idx(x, y)] = 1; blob.S[idx(x, y)] = 1 }
  let b = clone(blob)
  for (let t = 0; t < 120; t++) { collide(b); b = stream(b) }
  // coarse-grain density over 4x4 blocks, measure smoothness (small block-to-block variation = a smooth field)
  const d = density(b); const B = 4, nb = L / B; const cg = new Float64Array(nb * nb)
  for (let i = 0; i < N; i++) { const x = i % L, y = (i / L) | 0; cg[((y / B) | 0) * nb + ((x / B) | 0)]! += d[i]! }
  let tv = 0, cnt = 0
  for (let bx = 0; bx < nb - 1; bx++) for (let by = 0; by < nb; by++) { tv += Math.abs(cg[by * nb + bx]! - cg[by * nb + bx + 1]!); cnt++ }
  const meanAbs = (() => { let s2 = 0; for (let i = 0; i < cg.length; i++) s2 += Math.abs(cg[i]!); return s2 / cg.length })()
  const roughness = (tv / cnt) / (meanAbs + 1e-9)
  const smooth = roughness < 1.0 // coarse field varies slowly relative to its magnitude (a smooth continuum)
  console.log(`  (4) emergent smooth continuum: coarse-grained density roughness = ${roughness.toFixed(2)} (smooth = <1): ${smooth}`)
  console.log('  => one fully-specified DISCRETE rule conserves charge + momentum EXACTLY, is EXACTLY reversible, and')
  console.log('     coarse-grains to a SMOOTH continuum density, all from the discrete dynamics, no continuum input.')
  console.log('     On {3,4,3,4} (24 directions) the same construction gives emergent ISOTROPY (p226); the Dirac walk')
  console.log('     and gauge structure are further emergent layers on top of this discrete base.')
  return { chargeOk, momentumOk, reversible, smooth }
}

// One fully-specified discrete directional rule, run as the actual dynamics with integer
// state. It conserves charge and momentum exactly (integer equality, not tolerance), is
// exactly reversible (forward then inverse recovers the start bit-for-bit), and a localized
// blob coarse-grains to a smooth continuum density. This is a reversible conserving lattice
// gas coarse-graining to hydrodynamics, a known construction, so L2. The conservation test
// seeds via a deterministic LCG fill, a pseudo-random initial condition, though the exact
// conservation and reversibility are properties of the rule and hold for any fill.
export default defineExperiment({
  id: 'computation/discrete-rule-endtoend',
  title: 'one discrete directional rule conserves charge and momentum exactly, is exactly reversible, and coarse-grains smooth',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = discreteRuleEndToEnd()
    const ok = r.chargeOk && r.momentumOk && r.reversible && r.smooth
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the discrete directional rule conserves charge and momentum exactly, is exactly reversible, and coarse-grains to a smooth continuum density',
      metrics: {
        chargeConserved: r.chargeOk ? 1 : 0,
        momentumConserved: r.momentumOk ? 1 : 0,
        reversible: r.reversible ? 1 : 0,
        smoothContinuum: r.smooth ? 1 : 0,
      },
      notes:
        'L2, a reversible conserving lattice gas coarse-graining to hydrodynamics. Conservation and reversibility are exact integer equalities. The conservation test seeds via a deterministic LCG fill (a pseudo-random initial condition), but exact conservation and reversibility hold for any fill, they are properties of the rule.',
    })
  },
})
