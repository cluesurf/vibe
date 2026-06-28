// P229 (#1, pin the discrete collision + verify END-TO-END): one CONCRETE discrete directional rule, fully
// specified, run as the actual discrete dynamics (no continuum tools). The rule, per cell 4 directional ternary
// charges (qE,qW,qN,qS) in {-1,0,+1}; STREAM each charge to its neighbour; COLLIDE by the reversible involution
// that rotates a zero-momentum head-on pair between the x and y axes ((s,s,0,0) <-> (0,0,s,s)). This conserves
// charge and momentum and is exactly reversible. We verify, end to end, (1) exact charge conservation, (2) exact
// momentum conservation, (3) exact reversibility (forward T then inverse T = identity), (4) an emergent SMOOTH
// continuum (the coarse-grained density evolves smoothly from the discrete rule). This grounds "discrete base ->
// emergent continuum" in the actual rule. Run: npx tsx code/experiment/p229-discrete-rule-endtoend.ts

import {
  cloneLatticeGas as clone,
  collide,
  latticeCharge as charge,
  latticeDensity as density,
  latticeIndex,
  latticeMomentum as momentum,
  type LatticeGasState as State,
  stream as streamRaw,
  streamInverse as streamInverseRaw,
} from '@/code/operator/directional-lattice-gas'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The directional ternary lattice gas (4 charges per cell, COLLIDE then STREAM, exactly
// reversible and charge/momentum conserving) lives in code/operator/directional-lattice-gas.
const L = 64
const N = L * L
const idx = (x: number, y: number): number => latticeIndex(L, x, y)
const stream = (s: State): State => streamRaw(L, s)
const streamInverse = (s: State): State => streamInverseRaw(L, s)

export function discreteRuleEndToEnd(): {
  chargeOk: boolean
  momentumOk: boolean
  reversible: boolean
  smooth: boolean
} {
  const rng = makeRng({ seed: 7 })
  const rnd = (): number => rng.next()
  const init: State = {
    E: new Int8Array(N),
    W: new Int8Array(N),
    N: new Int8Array(N),
    S: new Int8Array(N),
  }

  for (let i = 0; i < N; i++) {
    init.E[i] = (Math.floor(rnd() * 3) - 1)
    init.W[i] = (Math.floor(rnd() * 3) - 1)
    init.N[i] = (Math.floor(rnd() * 3) - 1)
    init.S[i] = (Math.floor(rnd() * 3) - 1)
  }

  const c0 = charge(init),
    [px0, py0] = momentum(init)

  // forward T steps (collide then stream)
  let s = clone(init)

  const T = 200

  for (let t = 0; t < T; t++) {
    collide(s)
    s = stream(s)
  }

  const c1 = charge(s),
    [px1, py1] = momentum(s)

  const chargeOk = c1 === c0,
    momentumOk = px1 === px0 && py1 === py0

  // inverse T steps (un-stream then collide; collide is its own inverse) -> recover init
  let r = clone(s)

  for (let t = 0; t < T; t++) {
    r = streamInverse(r)
    collide(r)
  }

  let diff = 0

  for (let i = 0; i < N; i++) {
    diff +=
      Math.abs(r.E[i]! - init.E[i]!) +
      Math.abs(r.W[i]! - init.W[i]!) +
      Math.abs(r.N[i]! - init.N[i]!) +
      Math.abs(r.S[i]! - init.S[i]!)
  }

  const reversible = diff === 0
  // (4) emergent smooth continuum: seed a localized density blob, evolve, coarse-grain, check it spreads SMOOTHLY
  const blob: State = {
    E: new Int8Array(N),
    W: new Int8Array(N),
    N: new Int8Array(N),
    S: new Int8Array(N),
  }

  const c = L >> 1

  for (let x = c - 6; x <= c + 6; x++) {
    for (let y = c - 6; y <= c + 6; y++) {
      blob.E[idx(x, y)] = 1
      blob.W[idx(x, y)] = 1
      blob.N[idx(x, y)] = 1
      blob.S[idx(x, y)] = 1
    }
  }

  let b = clone(blob)

  for (let t = 0; t < 120; t++) {
    collide(b)
    b = stream(b)
  }

  // coarse-grain density over 4x4 blocks, measure smoothness (small block-to-block variation = a smooth field)
  const d = density(b)
  const B = 4,
    nb = L / B

  const cg = new Float64Array(nb * nb)

  for (let i = 0; i < N; i++) {
    const x = i % L,
      y = (i / L) | 0

    cg[((y / B) | 0) * nb + ((x / B) | 0)]! += d[i]!
  }

  let tv = 0,
    cnt = 0

  for (let bx = 0; bx < nb - 1; bx++) {
    for (let by = 0; by < nb; by++) {
      tv += Math.abs(cg[by * nb + bx]! - cg[by * nb + bx + 1]!)
      cnt++
    }
  }

  const meanAbs = (() => {
    let s2 = 0

    for (let i = 0; i < cg.length; i++) {
      s2 += Math.abs(cg[i]!)
    }

    return s2 / cg.length
  })()

  const roughness = tv / cnt / (meanAbs + 1e-9)
  const smooth = roughness < 1.0 // coarse field varies slowly relative to its magnitude (a smooth continuum)

  return { chargeOk, momentumOk, reversible, smooth }
}

// One fully-specified discrete directional rule, run as the actual dynamics with integer
// state. It conserves charge and momentum exactly (integer equality, not tolerance), is
// exactly reversible (forward then inverse recovers the start bit-for-bit), and a localized
// blob coarse-grains to a smooth continuum density. This is a reversible conserving lattice
// gas coarse-graining to hydrodynamics, a known construction, so L2. The conservation test
// seeds via a deterministic LCG fill, a pseudo-random initial condition, though the exact
// conservation and reversibility are properties of the rule and hold for any fill.
export default experiment({
  id: 'computation/discrete-rule-endtoend',
  code: 'E-CMP-0003',
  title:
    'one discrete directional rule conserves charge and momentum exactly, is exactly reversible, and coarse-grains smooth',
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
