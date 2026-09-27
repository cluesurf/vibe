// The loop-register light on any strip of husk squares (E-FRC-0234 to 0237): the plaquette ladder's rule
// (code/rule/plaquette-ladder, E-FRC-0230 to 0233) with the link set left free, so the SAME factors run on the
// ladder (rails and rungs) and on the massless ring (the ladder with its transverse direction closed).
//
// REGISTERS. One loop register m_p per square p, a Z_N value (N = 2D + 1) read as the sum of a column of D bulk
// trits (E-FRC-0207, the thermometer of code/rule/plaquette-ladder). A link's flux is not stored: it is the
// relation of the loop registers of the squares on its two sides, e = m_a - m_b (a link on the strip's edge
// touches one square and reads e = m_a). Nothing moves: a loop step adds one unit to one register.
//
// THE RING (the transverse direction closed). A strip of L squares, periodic along its length, one square
// around. Closing the transverse direction identifies the ladder's top rail with its bottom rail, so square p's
// rail is bounded by square p on both sides and carries m_p - m_p = 0, and every rung p lies between squares
// p - 1 and p: e_p = m_(p-1) - m_p. On that closed surface the product of all loop shifts is the identity
// (every link is counted once with each sign), so a uniform shift of every m_p is no change at all: the
// physical states are the ones the uniform shift leaves alone (total magnetic flux 0 mod N). The drift reads
// only differences, the force only each square's angle, and the curl-curl is K(k) = 2 - 2 cos k: no cutoff.
//
// THE STAND-IN ATOM. As on the ladder (E-FRC-0233): a STAND-IN electron whose hop across link 0 is recorded by
// link 0's flux, x in {0, 1} added to e_0. On the ring link 0 is the rung around the closed circumference at
// dock 0, so the hop carries the electron once around the circumference: its charge stays on dock 0, Gauss's
// law is untouched, and the winding flux on rung 0 records it. It is a stand-in and graded as one.
//
// THE BEAT, every factor exact over Z[zeta_M], every exponent an integer mod M:
//   hop     (1 + z)/2 + (1 - z)/2 T, T flips x, z = zeta_M^hop               (present only with an atom)
//   drift   zeta_M^(-c sum_links bal(e)^2)                                    (diagonal in the registers)
//   force   per square sum_B zeta_M^(-r bal(B)^2) Pi_B                        (diagonal in the square's angle)
// with s = 2 N c / M, f = 2 N r / M and kappa = s f = 2 / N.

import { bal, mod, type Step } from '@/code/rule/lattice-qed'

// a link: [a, b] reads e = m_a - m_b; b = -1 reads e = m_a (an edge link on one square)
export type LoopLink = readonly [number, number]

export type LoopSpec = {
  readonly n: number
  readonly squares: number
  readonly links: readonly LoopLink[]
  readonly root: number
  readonly drift: number
  readonly force: number
  readonly hop?: number
  // the link whose flux records the atom's hop (the ring's rung 0, the ladder's rung 0)
  readonly atomLink: number
  // true when the squares form a ring the translation p -> p + 1 maps to itself
  readonly periodic: boolean
  // true when a uniform shift of every register is no change (a closed surface)
  readonly closed: boolean
}

// the ring: rung p between squares p - 1 and p (link 0 the atom's rung)
export function ringLinks(L: number): LoopLink[] {
  return Array.from({ length: L }, (_, p) => [mod(p - 1, L), p] as const)
}

// the open ladder of code/rule/plaquette-ladder in the same form: bottom rails, top rails (-m_p, the same
// square), then rungs, so link 2L is its rung 0 (for L = 1 the rung lies between the square and itself)
export function ladderLinks(L: number): LoopLink[] {
  const out: LoopLink[] = []

  for (let p = 0; p < L; p++) out.push([p, -1])
  for (let p = 0; p < L; p++) out.push([p, -1])
  for (let p = 0; p < L; p++) out.push([mod(p - 1, L), p])

  return out
}

// the split of kappa = 2 / N between drift and force, as integers: M = 2 N^2 w and c r = 2 N w^2 give
// s f = 2 / N exactly; the pair (c, r) whose ratio r / c = f / s is nearest the integer `target` in the
// multiplicative sense (the fraction max(r, T c) / min(r, T c) smallest, compared by cross-multiplication in
// integers), w = 1 .. wMax, ties to the smaller M. Deterministic, integer only: no real enters the choice.
export type Split = { readonly root: number; readonly drift: number; readonly force: number; readonly ratio: number; readonly w: number }

export function splitNear(n: number, target: number, wMax = 8): Split {
  let best: { c: number; r: number; w: number; num: number; den: number } | undefined

  for (let w = 1; w <= wMax; w++) {
    const product = 2 * n * w * w

    for (let c = 1; c <= product; c++) {
      if (product % c !== 0) continue

      const r = product / c
      const num = Math.max(r, target * c)
      const den = Math.min(r, target * c)

      if (best === undefined || num * best.den < best.num * den) best = { c, r, w, num, den }
    }
  }

  const b = best!

  return { root: 2 * n * n * b.w, drift: b.c, force: b.r, ratio: b.r / b.c, w: b.w }
}

export function ringSpec(n: number, L: number, split: Split, hop?: number): LoopSpec {
  const base = { n, squares: L, links: ringLinks(L), root: split.root, drift: split.drift, force: split.force, atomLink: 0, periodic: true, closed: true }

  return hop === undefined ? base : { ...base, hop }
}

export function ladderLoopSpec(n: number, L: number, split: Split, hop?: number): LoopSpec {
  const base = { n, squares: L, links: ladderLinks(L), root: split.root, drift: split.drift, force: split.force, atomLink: 2 * L, periodic: true, closed: false }

  return hop === undefined ? base : { ...base, hop }
}

export const loopSplit = (spec: LoopSpec): { s: number; f: number; kappa: number } => {
  const s = (2 * spec.n * spec.drift) / spec.root
  const f = (2 * spec.n * spec.force) / spec.root

  return { s, f, kappa: s * f }
}

export const loopHalf = (spec: LoopSpec): number => spec.n ** spec.squares

export const loopSize = (spec: LoopSpec): number => (spec.hop === undefined ? 1 : 2) * loopHalf(spec)

// the link fluxes of an index (the atom's x added to link 0), balanced
export function loopFluxes(spec: LoopSpec, i: number, out?: Int32Array): Int32Array {
  const { n, squares: P, links } = spec
  const half = n ** P
  const x = Math.floor(i / half)
  const m = new Int32Array(P)
  let rest = i % half

  for (let p = 0; p < P; p++) {
    m[p] = rest % n
    rest = Math.floor(rest / n)
  }

  const e = out ?? new Int32Array(links.length)

  links.forEach(([a, b], l) => {
    e[l] = bal(m[a]! - (b < 0 ? 0 : m[b]!) + (l === spec.atomLink ? x : 0), n)
  })

  return e
}

// sum over links of bal(e)^2
export function loopElectric(spec: LoopSpec, i: number): number {
  let s = 0

  for (const e of loopFluxes(spec, i)) s += e * e

  return s
}

// ---------------------------------------------------------------------------------------------------------
// the exact steps (lattice-qed's Step, run by its exact BigInt engine)

export function loopSteps(spec: LoopSpec): Step[] {
  const { n, squares: P } = spec
  const size = loopSize(spec)
  const half = loopHalf(spec)
  const electric = Int32Array.from({ length: size }, (_, i) => loopElectric(spec, i))
  const exponents = Array.from({ length: n }, (_, B) => -spec.force * bal(B, n) ** 2)
  const steps: Step[] = []

  if (spec.hop !== undefined) steps.push({ kind: 'hop', move: i => (i < half ? i + half : i - half), z: spec.hop })

  steps.push({ kind: 'phase', exponent: i => -spec.drift * electric[i]! })

  for (let p = 0; p < P; p++) {
    const stride = n ** p

    steps.push({
      kind: 'loop',
      shift: i => {
        const d = Math.floor(i / stride) % n

        return i + (mod(d + 1, n) - d) * stride
      },
      exponents,
      n,
    })
  }

  return steps
}

// the translation p -> p + 1 on an index (the register of square p moves to square p + 1; x is kept)
export function loopTranslate(spec: LoopSpec, i: number): number {
  const { n, squares: P } = spec
  const half = n ** P
  const x = Math.floor(i / half)
  let rest = i % half
  const m = new Array<number>(P)

  for (let p = 0; p < P; p++) {
    m[p] = rest % n
    rest = Math.floor(rest / n)
  }

  let out = 0

  for (let p = P - 1; p >= 0; p--) out = out * n + m[(p - 1 + P) % P]!

  return x * half + out
}

// the uniform shift: every register + 1 (x is kept)
export function loopUniformShift(spec: LoopSpec, i: number): number {
  const { n, squares: P } = spec
  const half = n ** P
  const x = Math.floor(i / half)
  let rest = i % half
  let out = 0
  let stride = 1

  for (let p = 0; p < P; p++) {
    out += mod((rest % n) + 1, n) * stride
    rest = Math.floor(rest / n)
    stride *= n
  }

  return x * half + out
}

// ---------------------------------------------------------------------------------------------------------
// the fast float beat (measurement): the same factors, the force as a DFT on each square's digit

export type LoopKernel = {
  readonly spec: LoopSpec
  readonly size: number
  readonly half: number
  readonly driftRe: Float64Array
  readonly driftIm: Float64Array
  readonly forceRe: Float64Array
  readonly forceIm: Float64Array
  readonly twRe: Float64Array
  readonly twIm: Float64Array
  readonly hopA: readonly [number, number]
  readonly hopB: readonly [number, number]
  readonly scratchRe: Float64Array
  readonly scratchIm: Float64Array
  // each square's digit starts: the indices whose digit p is 0, per p (precomputed, so no division in the loop)
  readonly starts: Int32Array[]
}

export function loopKernel(spec: LoopSpec, options: { forceOff?: boolean } = {}): LoopKernel {
  const { n, squares: P, root } = spec
  const size = loopSize(spec)
  const half = loopHalf(spec)
  const driftRe = new Float64Array(size)
  const driftIm = new Float64Array(size)
  const forceRe = new Float64Array(half)
  const forceIm = new Float64Array(half)
  const flux = new Int32Array(spec.links.length)

  for (let i = 0; i < size; i++) {
    loopFluxes(spec, i, flux)

    let e = 0

    for (let l = 0; l < flux.length; l++) e += flux[l]! * flux[l]!

    const t = (-2 * Math.PI * ((spec.drift * e) % root)) / root

    driftRe[i] = Math.cos(t)
    driftIm[i] = Math.sin(t)
  }

  for (let i = 0; i < half; i++) {
    let e = 0
    let rest = i

    for (let p = 0; p < P; p++) {
      e += bal(rest % n, n) ** 2
      rest = Math.floor(rest / n)
    }

    const t = options.forceOff ? 0 : (-2 * Math.PI * ((spec.force * e) % root)) / root

    forceRe[i] = Math.cos(t)
    forceIm[i] = Math.sin(t)
  }

  const twRe = new Float64Array(n * n)
  const twIm = new Float64Array(n * n)

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const t = (-2 * Math.PI * ((a * b) % n)) / n

      twRe[a * n + b] = Math.cos(t) / Math.sqrt(n)
      twIm[a * n + b] = Math.sin(t) / Math.sqrt(n)
    }
  }

  const z = ((spec.hop ?? 0) * 2 * Math.PI) / root
  const starts: Int32Array[] = []

  for (let p = 0; p < P; p++) {
    const stride = n ** p
    const list = new Int32Array(half / n)
    let k = 0

    for (let base = 0; base < half; base++) if (Math.floor(base / stride) % n === 0) list[k++] = base

    starts.push(list)
  }

  return {
    spec,
    size,
    half,
    driftRe,
    driftIm,
    forceRe,
    forceIm,
    twRe,
    twIm,
    hopA: [(1 + Math.cos(z)) / 2, Math.sin(z) / 2],
    hopB: [(1 - Math.cos(z)) / 2, -Math.sin(z) / 2],
    scratchRe: new Float64Array(n),
    scratchIm: new Float64Array(n),
    starts,
  }
}

function transformDigit(k: LoopKernel, re: Float64Array, im: Float64Array, offset: number, p: number, inverse: boolean): void {
  const n = k.spec.n
  const stride = n ** p
  const sr = k.scratchRe
  const si = k.scratchIm
  const sign = inverse ? -1 : 1
  const list = k.starts[p]!

  for (let s = 0; s < list.length; s++) {
    const base = offset + list[s]!

    for (let b = 0; b < n; b++) {
      let ar = 0
      let ai = 0

      for (let a = 0; a < n; a++) {
        const j = base + a * stride
        const wr = k.twRe[a * n + b]!
        const wi = sign * k.twIm[a * n + b]!

        ar += wr * re[j]! - wi * im[j]!
        ai += wr * im[j]! + wi * re[j]!
      }

      sr[b] = ar
      si[b] = ai
    }

    for (let b = 0; b < n; b++) {
      re[base + b * stride] = sr[b]!
      im[base + b * stride] = si[b]!
    }
  }
}

// every square's digit to its angle (forward) or back, in place
export function loopToAngle(k: LoopKernel, re: Float64Array, im: Float64Array, inverse: boolean): void {
  for (let offset = 0; offset < k.size; offset += k.half) {
    for (let p = 0; p < k.spec.squares; p++) transformDigit(k, re, im, offset, p, inverse)
  }
}

function applyHop(k: LoopKernel, re: Float64Array, im: Float64Array, conjugate: boolean): void {
  const half = k.half
  const s = conjugate ? -1 : 1
  const ar = k.hopA[0]
  const ai = s * k.hopA[1]
  const br = k.hopB[0]
  const bi = s * k.hopB[1]

  for (let i = 0; i < half; i++) {
    const xr = re[i]!
    const xi = im[i]!
    const yr = re[i + half]!
    const yi = im[i + half]!

    re[i] = ar * xr - ai * xi + br * yr - bi * yi
    im[i] = ar * xi + ai * xr + br * yi + bi * yr
    re[i + half] = br * xr - bi * xi + ar * yr - ai * yi
    im[i + half] = br * xi + bi * xr + ar * yi + ai * yr
  }
}

function applyTable(re: Float64Array, im: Float64Array, tr: Float64Array, ti: Float64Array, offset: number, count: number, conjugate: boolean): void {
  const s = conjugate ? -1 : 1

  for (let i = 0; i < count; i++) {
    const j = offset + i
    const xr = re[j]!
    const xi = im[j]!
    const c = tr[i]!
    const d = s * ti[i]!

    re[j] = xr * c - xi * d
    im[j] = xr * d + xi * c
  }
}

// one beat in place: hop, drift, force
export function loopBeat(k: LoopKernel, re: Float64Array, im: Float64Array): void {
  if (k.spec.hop !== undefined) applyHop(k, re, im, false)

  applyTable(re, im, k.driftRe, k.driftIm, 0, k.size, false)

  for (let offset = 0; offset < k.size; offset += k.half) {
    for (let p = 0; p < k.spec.squares; p++) transformDigit(k, re, im, offset, p, false)

    applyTable(re, im, k.forceRe, k.forceIm, offset, k.half, false)

    for (let p = 0; p < k.spec.squares; p++) transformDigit(k, re, im, offset, p, true)
  }
}

// the inverse beat in place: force^-1, drift^-1, hop^-1
export function loopInverseBeat(k: LoopKernel, re: Float64Array, im: Float64Array): void {
  for (let offset = 0; offset < k.size; offset += k.half) {
    for (let p = 0; p < k.spec.squares; p++) transformDigit(k, re, im, offset, p, false)

    applyTable(re, im, k.forceRe, k.forceIm, offset, k.half, true)

    for (let p = 0; p < k.spec.squares; p++) transformDigit(k, re, im, offset, p, true)
  }

  applyTable(re, im, k.driftRe, k.driftIm, 0, k.size, true)

  if (k.spec.hop !== undefined) applyHop(k, re, im, true)
}

// ---------------------------------------------------------------------------------------------------------
// the classical light on the same strip (the E~ leapfrog's symbol): 2 - 2 cos omega = kappa K(k)

export const ringCurl = (k: number): number => 2 - 2 * Math.cos(k)

export const ringOmega = (kappa: number, k: number): number => Math.acos(1 - (kappa * ringCurl(k)) / 2)

export const ringVelocity = (kappa: number, k: number): number => (kappa * Math.sin(k)) / Math.sin(ringOmega(kappa, k))

// the husk photon along a husk axis (E-FRC-0235 M3): the root of lambda^2 - 12 lambda + 8 u = 0, u = 2 - 2 cos k,
// that vanishes at k = 0 (its partner, 12 minus it, is the massive branch)
export const huskAxisLambda = (k: number): number => 6 - Math.sqrt(36 - 8 * ringCurl(k))
