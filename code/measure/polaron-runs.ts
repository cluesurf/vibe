// Runs shared by E-FRC-0238 to 0240 (measurement): the exact ring rule on its physical sector
// (code/measure/ring-reduced) and the few-quanta restriction in a chosen frame (code/measure/polaron-frame), both
// read as the atom's lab-frame density matrix every beat.

import { loopSplit, ringOmega, type LoopSpec } from '@/code/rule/loop-ring'
import { filterField, normalizeField, phaseOf, type Beat, type Field } from '@/code/measure/loop-spectrum'
import { stripModes } from '@/code/measure/few-quanta'
import { reducedBeat, reducedInverseBeat, reducedKernel, reducedTrial, type ReducedKernel } from '@/code/measure/ring-reduced'
import { atomElement, chooseFrame, frameAtomMatrix, frameBeat, frameRun, frameStart, type FrameChoice } from '@/code/measure/polaron-frame'

export type Atom = readonly [number, number, number, number]
export type AtomTrace = { population: Float64Array; coherenceRe: Float64Array; coherenceIm: Float64Array; norm: Float64Array }

export const reducedBeats = (kernel: ReducedKernel): Beat => ({
  forward: (re, im) => reducedBeat(kernel, re, im),
  backward: (re, im) => reducedInverseBeat(kernel, re, im),
})

// the light's vacuum on the physical sector: the product trial filtered twice to within the lowest photon energy
// (the trial is translation and shift invariant, so its nearest other level is a pair at 2 omega_min)
export function reducedVacuum(spec: LoopSpec, passes = 2): { vacuum: Field; residual: number } {
  const light: LoopSpec = { ...spec, hop: undefined }
  const kernel = reducedKernel(light, { withAtom: false })
  const beat = reducedBeats(kernel)
  const { s, f, kappa } = loopSplit(spec)
  const omegaMin = ringOmega(kappa, (2 * Math.PI) / spec.squares)
  const sigma = omegaMin / 4
  let w: Field = reducedTrial(spec, s, f)
  let phase = phaseOf(beat, w).phase

  for (let pass = 0; pass < passes; pass++) {
    w = filterField(beat, w, -phase, -omegaMin, omegaMin, sigma)
    normalizeField(w)
    phase = phaseOf(beat, w).phase
  }

  return { vacuum: w, residual: phaseOf(beat, w).residual }
}

// the atom (x) the light on the reduced index x * half + r
export function atomWithLight(atom: Atom, light: Field): Field {
  const half = light.re.length
  const out = { re: new Float64Array(2 * half), im: new Float64Array(2 * half) }

  for (let x = 0; x < 2; x++) {
    const cr = atom[2 * x]!
    const ci = atom[2 * x + 1]!

    for (let i = 0; i < half; i++) {
      out.re[x * half + i] = cr * light.re[i]! - ci * light.im[i]!
      out.im[x * half + i] = cr * light.im[i]! + ci * light.re[i]!
    }
  }

  return out
}

export function exactAtomMatrix(v: Field): { r00: number; r11: number; r01Re: number; r01Im: number } {
  const half = v.re.length / 2
  let r00 = 0
  let r11 = 0
  let sr = 0
  let si = 0

  for (let i = 0; i < half; i++) {
    const ar = v.re[i]!
    const ai = v.im[i]!
    const br = v.re[half + i]!
    const bi = v.im[half + i]!

    r00 += ar * ar + ai * ai
    r11 += br * br + bi * bi
    // rho_01 = sum psi_0 conj(psi_1)
    sr += ar * br + ai * bi
    si += ai * br - ar * bi
  }

  return { r00, r11, r01Re: sr, r01Im: si }
}

function trace(beats: number): AtomTrace {
  return { population: new Float64Array(beats + 1), coherenceRe: new Float64Array(beats + 1), coherenceIm: new Float64Array(beats + 1), norm: new Float64Array(beats + 1) }
}

// the exact rule: `start` (x) the vacuum, read <e|rho|e> and <e|rho|g> every beat
export function exactAtomRun(spec: LoopSpec, vacuum: Field, start: Atom, excited: Atom, ground: Atom, beats: number): AtomTrace {
  const kernel = reducedKernel(spec, { withAtom: true })
  const v = atomWithLight(start, vacuum)
  const out = trace(beats)

  for (let t = 0; t <= beats; t++) {
    const rho = exactAtomMatrix(v)
    const [cr, ci] = atomElement(rho, excited, ground)

    out.population[t] = atomElement(rho, excited, excited)[0]
    out.coherenceRe[t] = cr
    out.coherenceIm[t] = ci
    out.norm[t] = rho.r00 + rho.r11

    if (t < beats) reducedBeat(kernel, v.re, v.im)
  }

  return out
}

export type RingAtom = { spec: LoopSpec; bareGap: number; excited: Atom; ground: Atom }

// the restriction in a frame on the same ring: modes j = 1 .. L - 1
export function restrictedFrame(spec: LoopSpec, bareGap: number, kind: 'lab' | 'lang-firsov' | 'silbey-harris'): FrameChoice {
  const { f, kappa } = loopSplit(spec)
  const L = spec.squares
  const js = Array.from({ length: L - 1 }, (_, j) => j + 1)
  const modes = stripModes({ n: spec.n, squares: L, f, js, omegaOf: k => ringOmega(kappa, k) })
  const g = (4 * Math.PI * spec.drift) / spec.root

  return chooseFrame({ n: spec.n, L, f, kappa, g, hop: spec.hop!, drift: spec.drift, root: spec.root, omega: modes.omega, u: modes.u, kind, bareGap })
}

export function restrictedAtomRun(choice: FrameChoice, start: Atom, excited: Atom, ground: Atom, beats: number): AtomTrace & { startLost: number; dropped: number } {
  const q = choice.frame
  const run = frameRun(q)
  const out = trace(beats)
  const startLost = frameStart(q, run, start)

  for (let t = 0; t <= beats; t++) {
    const rho = frameAtomMatrix(q, run)
    const [cr, ci] = atomElement(rho, excited, ground)

    out.population[t] = atomElement(rho, excited, excited)[0]
    out.coherenceRe[t] = cr
    out.coherenceIm[t] = ci
    out.norm[t] = rho.r00 + rho.r11

    if (t < beats) frameBeat(q, run)
  }

  return { ...out, startLost, dropped: run.dropped }
}

// the dressed gap read from a Ramsey coherence: minus the least-squares slope of its unwrapped phase over t in
// [from, to], and the largest departure of the phase from that line
export function ramseyGap(tr: AtomTrace, from: number, to: number): { gap: number; wiggle: number } {
  const phase: number[] = []
  let last = 0
  let offset = 0

  for (let t = 0; t <= to; t++) {
    const p = Math.atan2(tr.coherenceIm[t]!, tr.coherenceRe[t]!)

    if (t > 0) {
      if (p - last > Math.PI) offset -= 2 * Math.PI
      if (p - last < -Math.PI) offset += 2 * Math.PI
    }

    last = p
    phase.push(p + offset)
  }

  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let c = 0

  for (let t = from; t <= to; t++) {
    sx += t
    sy += phase[t]!
    sxx += t * t
    sxy += t * phase[t]!
    c++
  }

  const slope = (c * sxy - sx * sy) / (c * sxx - sx * sx)
  const b = (sy - slope * sx) / c
  let wiggle = 0

  for (let t = from; t <= to; t++) wiggle = Math.max(wiggle, Math.abs(phase[t]! - (b + slope * t)))

  return { gap: -slope, wiggle }
}

// ln P fit over [from, to]: rate, intercept, largest residual
export function logFit(p: Float64Array, from: number, to: number): { rate: number; intercept: number; residual: number } {
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let c = 0

  for (let t = from; t <= to; t++) {
    const y = Math.log(p[t]!)

    sx += t
    sy += y
    sxx += t * t
    sxy += t * y
    c++
  }

  const slope = (c * sxy - sx * sy) / (c * sxx - sx * sx)
  const intercept = (sy - slope * sx) / c
  let residual = 0

  for (let t = from; t <= to; t++) residual = Math.max(residual, Math.abs(Math.log(p[t]!) - (intercept + slope * t)))

  return { rate: -slope, intercept, residual }
}
