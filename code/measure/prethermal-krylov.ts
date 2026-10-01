// THE SMALL-ANGLE BEAT OF E-SPN-0154 RUN MATRIX FREE ON A GAUSS-ORBIT REGISTER (E-SPN-0185). E-SPN-0154 diagonalized
// the beat F = E(theta) M(2 r theta) E(theta) densely on a 1,589-state symmetric sector, where the spectrum is discrete
// and a decay can be cut by it. On a 4-loop patch (3,460,496 Gauss orbits) the beat is applied link by link on the
// orbit amplitudes of code/measure/gauss-orbit, and the survival amplitude A(N) = <psi0| F^N |psi0> is read with two
// facts:
//
//   Strang merges   F^N = E (M E^2)^(N-1) M E, so consecutive halves merge into E(2 theta): one pass of every link a
//                   beat after the first
//   F^T = F         every link kernel u(h) is a class function with u(h) = u(h^-1), so each E_l is complex SYMMETRIC in
//                   the orbit basis (orbit-weighted), M is diagonal, and F is complex symmetric. For a real psi0,
//                   <psi0| F^(2k) |psi0> = v_k^T v_k with v_k = F^k psi0 (bilinear, no conjugation), so k beats give the
//                   amplitude to 2k + 1. With a_1 = M E psi0, b_k = E(2 theta) a_k and a_(k+1) = M b_k:
//                     A(2k) = a_k^T b_k     (v_k = E a_k, so v_k^T v_k = a_k^T E^2 a_k)
//                     A(2k + 1) = b_k^T M b_k
//                   and K passes of E(2 theta) give A(0..2K + 1)
//
// The direct beat (E, M, E per beat) is here too, as the instrument that checks the doubling.
//
// DETERMINISM: no random numbers. FLOATS: measurement of an exact unitary (the kernels are linkUnitary's, from the
// integer electric spectrum).

import {
  orbitBilinear,
  orbitInner,
  type OrbitEngine,
} from '@/code/measure/gauss-orbit'

// slots used: 0 (the running vector), 1 and 2 (the links' ping-pong); kernels: the caller's
// apply every link in turn with the kernel (kre, kim) to slots[src]; returns the slot holding the result (1 or 2)
export function applyAllLinks(
  engine: OrbitEngine,
  kre: number,
  kim: number,
  src: number,
): number {
  const L = engine.reg.patch.links.length

  let from = src
  let to = src === 1 ? 2 : 1

  for (let l = 0; l < L; l++) {
    engine.link(l, kre, kim, from, to)
    from = to
    to = to === 1 ? 2 : 1
  }

  return from
}

// slots[dst] = phase (x) slots[src] (complex per orbit)
export function applyPhase(
  engine: OrbitEngine,
  phase: Float64Array,
  src: number,
  dst: number,
): void {
  const s = engine.slots[src]!
  const d = engine.slots[dst]!

  for (let o = 0; o < engine.reg.orbits; o++) {
    const pr = phase[2 * o]!
    const pi = phase[2 * o + 1]!
    const xr = s[2 * o]!
    const xi = s[2 * o + 1]!

    d[2 * o] = pr * xr - pi * xi
    d[2 * o + 1] = pr * xi + pi * xr
  }
}

// the diagonal magnetic phase e^(i 2 r theta n_B(o)) of every orbit
export function magneticPhase(
  energy: Float64Array,
  r: number,
  theta: number,
): Float64Array {
  const out = new Float64Array(energy.length * 2)

  for (let o = 0; o < energy.length; o++) {
    const a = 2 * r * theta * energy[o]!

    out[2 * o] = Math.cos(a)
    out[2 * o + 1] = Math.sin(a)
  }

  return out
}

export type Amplitudes = {
  // A(N) for N = 0 .. reached (re, im)
  re: Float64Array
  im: Float64Array
  reached: number
  // the largest | |a_k|^2 - 1 | (unitarity of the evolution)
  unitarity: number
  passes: number
}

// the survival amplitudes of the real normalized state psi0 (one number an orbit) under the beat whose half kernel is
// (k1re, k1im) and whose double is (k2re, k2im), to beat `top` at most; `stop(N, fidelities)` may end the run early (it
// is asked after every pair of beats)
export function doublingAmplitudes(
  engine: OrbitEngine,
  psi0: Float64Array,
  phase: Float64Array,
  kernels: { k1re: number; k1im: number; k2re: number; k2im: number },
  top: number,
  stop: (reached: number, re: Float64Array, im: Float64Array) => boolean,
): Amplitudes {
  const reg = engine.reg
  const N = reg.orbits
  const re = new Float64Array(top + 2)
  const im = new Float64Array(top + 2)
  const s0 = engine.slots[0]!

  for (let o = 0; o < N; o++) {
    s0[2 * o] = psi0[o]!
    s0[2 * o + 1] = 0
  }

  re[0] = 1

  // c = E(theta) psi0, A(1) = c^T M c, a_1 = M c
  let c = applyAllLinks(engine, kernels.k1re, kernels.k1im, 0)

  let [ar, ai] = orbitBilinear(reg, engine.slots[c]!, engine.slots[c]!, phase)

  re[1] = ar
  im[1] = ai
  applyPhase(engine, phase, c, 0)

  let reached = 1
  let unitarity = 0
  let passes = 1

  while (reached + 2 <= top) {
    const a = engine.slots[0]!

    unitarity = Math.max(
      unitarity,
      Math.abs(orbitInner(reg, a, a, 2) - 1),
    )
    c = applyAllLinks(engine, kernels.k2re, kernels.k2im, 0)
    passes++

    const b = engine.slots[c]!

    ;[ar, ai] = orbitBilinear(reg, a, b)
    re[reached + 1] = ar
    im[reached + 1] = ai
    ;[ar, ai] = orbitBilinear(reg, b, b, phase)
    re[reached + 2] = ar
    im[reached + 2] = ai
    reached += 2
    applyPhase(engine, phase, c, 0)

    if (stop(reached, re, im)) {
      break
    }
  }

  return { re, im, reached, unitarity, passes }
}

// the survival amplitudes by the plain beat E M E, beat after beat, for N = 0 .. top
export function directAmplitudes(
  engine: OrbitEngine,
  psi0: Float64Array,
  phase: Float64Array,
  kernels: { k1re: number; k1im: number },
  top: number,
): { re: Float64Array; im: Float64Array } {
  const reg = engine.reg
  const re = new Float64Array(top + 1)
  const im = new Float64Array(top + 1)
  const s0 = engine.slots[0]!
  const ref = new Float64Array(reg.orbits * 2)

  for (let o = 0; o < reg.orbits; o++) {
    s0[2 * o] = psi0[o]!
    s0[2 * o + 1] = 0
    ref[2 * o] = psi0[o]!
  }

  re[0] = 1

  for (let n = 1; n <= top; n++) {
    let c = applyAllLinks(engine, kernels.k1re, kernels.k1im, 0)

    applyPhase(engine, phase, c, 0)
    c = applyAllLinks(engine, kernels.k1re, kernels.k1im, 0)
    engine.slots[0]!.set(engine.slots[c]!)

    const [ar, ai] = orbitBilinear(reg, ref, engine.slots[0]!)

    re[n] = ar
    im[n] = ai
  }

  return { re, im }
}

// the survival time: the first grid beat whose running-mean fidelity over beats 1..N is at most 1/2 (Infinity if none
// up to `reached`), and the running means on the grid
export function survivalTime(
  re: Float64Array,
  im: Float64Array,
  reached: number,
  grid: readonly number[],
): { tau: number; run: number[]; fidelity: number[]; last: number } {
  let sum = 0

  const runAt: number[] = [0]

  for (let n = 1; n <= reached; n++) {
    sum += re[n]! ** 2 + im[n]! ** 2
    runAt.push(sum / n)
  }

  const on = grid.filter(n => n <= reached)
  const run = on.map(n => runAt[n]!)
  const fidelity = on.map(n => re[n]! ** 2 + im[n]! ** 2)
  const hit = on.findIndex(n => runAt[n]! <= 0.5)

  return {
    tau: hit < 0 ? Infinity : on[hit]!,
    run,
    fidelity,
    last: runAt[reached]!,
  }
}
