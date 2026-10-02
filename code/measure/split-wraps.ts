// Measurement for the wraps of a carried integer light with a seam on each side (the experiment in
// test/experiment/gauge/split-wraps, OPEN-LGT-02): a light of code/measure/husk-balance's form (links with weights
// w, plaquettes with multiplicities n, the curl C as a symbol) laid on a periodic box, run as integers with both
// shares of the leapfrog carried ("carry, never round", E-FRC-0214) and every register read balanced in -D .. D, so
// the flux e on a link and the field B on a plaquette each have a seam; its Gibbs start; and the Gaussian reading of
// how often a register crosses its seam.
//
// THE CARRIED LIGHT. Per beat, with the split s = c / q (drift) and f = r / q (force), kappa = s f:
//   drift  X_l += c e_l; o_l = floor(X_l / q); X_l -= q o_l; x_l += o_l (mod N)   (x' = x + s e, carried)
//          B_P <- bal(B_P + sum_j sign_j w_j o_(l_j))                              (B = C W x, a seam at +-D)
//   kick   Y_P += r n_P B_P; F_P = floor(Y_P / q); Y_P -= q F_P                    (f n_P B_P, carried)
//          e_l <- bal(e_l - sum_(P on l) sign_(P, l) F_P)                         (e' = e - f C^T N B, a seam at +-D)
// N = 2D + 1 and bal reads an integer in -D .. D. A register WRAPS when its unwrapped new value leaves -D .. D.
// Every step is a bijection of the integer state (the counters stay in 0 .. q - 1; the inverse is F = ceil((r n B
// - Y') / q), o = ceil((c e - X') / q)), and the kick adds a curl, so the divergence of e is kept modulo N.
//
// THE GIBBS START. Per eigenmode of A(k) = W^(1/2) C^dag N C W^(1/2) (lambda > 0) the beat on (y, pi) = (W^(1/2) x,
// W^(1/2) e) along the mode is [[1, s], [-f lambda, 1 - kappa lambda]], which keeps H = (1/2) z^T M z, M = [[f lambda,
// f lambda s / 2], [f lambda s / 2, s]], det M = kappa lambda (1 - kappa lambda / 4). The Gibbs state of H at
// temperature T has covariance T M^(-1) per real mode; the start draws it (Weyl normals, code/tool/weyl) per
// momentum of the box's grid, and rounds x and e to integers. The model's register variances: a link of type h
// <e^2> = (T / s) a_h and a plaquette of type t <B^2> = (T / f) b_t, with a_h, b_t box averages of |v_h|^2 / (w_h
// (1 - kappa lambda / 4)) and |(C W^(1/2) v)_t|^2 / (lambda (1 - kappa lambda / 4)); along one mode both e and B
// have lag-one correlation cos omega, 2 - 2 cos omega = kappa lambda.

import { curlAt, jacobiEigen, type LightSymbol } from '@/code/measure/husk-balance'
import { makeWeyl } from '@/code/tool/weyl'

const mod = (x: number, m: number): number => ((x % m) + m) % m

const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

/** The light laid on a periodic box of side `side`: links (dock, type) and plaquettes (dock, type). */
export type Box = {
  side: number
  dims: number
  docks: number
  linkTypes: number
  plaquetteTypes: number
  links: number
  plaquettes: number
  w: Int32Array // per link
  linkType: Int32Array // per link
  n: Int32Array // per plaquette
  plaquetteType: Int32Array // per plaquette
  start: Int32Array // plaquettes + 1 offsets into plaqLinks
  plaqLinks: Int32Array
  plaqSigns: Int8Array
  tail: Int32Array // per link, its dock
  head: Int32Array // per link, the dock it reaches
}

const coordsOf = (y: number, side: number, dims: number): number[] => {
  const out: number[] = []
  let rest = y

  for (let d = 0; d < dims; d++) {
    out.push(rest % side)
    rest = Math.floor(rest / side)
  }

  return out
}

const dockOf = (c: readonly number[], side: number): number =>
  c.reduce((sum, x, d) => sum + mod(x, side) * side ** d, 0)

export function buildBox(
  light: LightSymbol,
  side: number,
  vectors: readonly (readonly number[])[],
): Box {
  const dims = light.dims
  const docks = side ** dims
  const T = light.linkWeights.length
  const Pt = light.plaquettes.length
  const links = docks * T
  const plaquettes = docks * Pt
  const w = new Int32Array(links)
  const linkType = new Int32Array(links)
  const tail = new Int32Array(links)
  const head = new Int32Array(links)
  const n = new Int32Array(plaquettes)
  const plaquetteType = new Int32Array(plaquettes)
  const start = new Int32Array(plaquettes + 1)
  const plaqLinks: number[] = []
  const plaqSigns: number[] = []

  for (let y = 0; y < docks; y++) {
    const c = coordsOf(y, side, dims)

    for (let h = 0; h < T; h++) {
      const l = y * T + h

      w[l] = light.linkWeights[h]!
      linkType[l] = h
      tail[l] = y
      head[l] = dockOf(
        c.map((x, d) => x + (vectors[h]![d] ?? 0)),
        side,
      )
    }

    for (let t = 0; t < Pt; t++) {
      const p = y * Pt + t
      const plaq = light.plaquettes[t]!

      n[p] = plaq.n
      plaquetteType[p] = t
      start[p] = plaqLinks.length

      for (const { link, sign, offset } of plaq.links) {
        plaqLinks.push(
          dockOf(
            c.map((x, d) => x + (offset[d] ?? 0)),
            side,
          ) *
            T +
            link,
        )
        plaqSigns.push(sign)
      }
    }
  }

  start[plaquettes] = plaqLinks.length

  return {
    side,
    dims,
    docks,
    linkTypes: T,
    plaquetteTypes: Pt,
    links,
    plaquettes,
    w,
    linkType,
    n,
    plaquetteType,
    start,
    plaqLinks: Int32Array.from(plaqLinks),
    plaqSigns: Int8Array.from(plaqSigns),
    tail,
    head,
  }
}

/** The box's plaquettes as canonical strings (sorted links, orientation fixed by the least link), with n. */
export function plaquetteKeys(box: Box): string[] {
  const out: string[] = []

  for (let p = 0; p < box.plaquettes; p++) {
    const entries: [number, number][] = []

    for (let j = box.start[p]!; j < box.start[p + 1]!; j++) {
      entries.push([box.plaqLinks[j]!, box.plaqSigns[j]!])
    }

    entries.sort((a, b) => a[0] - b[0])

    const orient = entries[0]![1]

    out.push(
      `${entries.map(([l, s]) => `${l}:${s * orient}`).join(',')}|${box.n[p]}`,
    )
  }

  return out.sort()
}

// ---------------------------------------------------------------------------------------------------------
// the modes on the box's grid

export type BoxMode = {
  k: number[]
  lambda: number
  vr: number[]
  vi: number[]
  // (C W^(1/2) v)_t, real and imaginary
  br: number[]
  bi: number[]
}

/** Every listed mode (the real embedding lists each complex line twice) with lambda > 0, at k = 2 pi j / side. */
export function boxModes(light: LightSymbol, side: number): BoxMode[] {
  const L = light.linkWeights.length
  const P = light.plaquettes.length
  const w = light.linkWeights
  const sw = w.map(Math.sqrt)
  const n = light.plaquettes.map(p => p.n)
  const points = side ** light.dims
  const out: BoxMode[] = []

  for (let i = 0; i < points; i++) {
    const k = coordsOf(i, side, light.dims).map(
      j => (2 * Math.PI * j) / side,
    )
    const { re, im } = curlAt(light, k)
    const a = Array.from({ length: 2 * L }, () =>
      new Array<number>(2 * L).fill(0),
    )

    for (let r = 0; r < L; r++) {
      for (let c = 0; c < L; c++) {
        let sr = 0
        let si = 0

        for (let t = 0; t < P; t++) {
          sr += n[t]! * (re[t]![r]! * re[t]![c]! + im[t]![r]! * im[t]![c]!)
          si += n[t]! * (re[t]![r]! * im[t]![c]! - im[t]![r]! * re[t]![c]!)
        }

        const x = sw[r]! * sw[c]!

        a[r]![c] = x * sr
        a[r + L]![c + L] = x * sr
        a[r]![c + L] = -x * si
        a[r + L]![c] = x * si
      }
    }

    const { values, vectors } = jacobiEigen(a)
    const top = Math.max(1, ...values.map(Math.abs))

    values.forEach((lambda, j) => {
      if (lambda <= 1e-9 * top) {
        return
      }

      const vr = vectors.slice(0, L).map(row => row[j]!)
      const vi = vectors.slice(L).map(row => row[j]!)
      const br: number[] = []
      const bi: number[] = []

      for (let t = 0; t < P; t++) {
        let ar = 0
        let ai = 0

        for (let l = 0; l < L; l++) {
          ar += sw[l]! * (re[t]![l]! * vr[l]! - im[t]![l]! * vi[l]!)
          ai += sw[l]! * (re[t]![l]! * vi[l]! + im[t]![l]! * vr[l]!)
        }

        br.push(ar)
        bi.push(ai)
      }

      out.push({ k, lambda, vr, vi, br, bi })
    })
  }

  return out
}

/** The Gibbs model per register type at unit temperature and unit share: variance coefficients and lag-one covariances. */
export type GibbsModel = {
  // <e_h^2> = (T / s) linkVar[h], <e_h(t) e_h(t+1)> = (T / s) linkLag[h]
  linkVar: number[]
  linkLag: number[]
  // <B_t^2> = (T / f) plaqVar[t]
  plaqVar: number[]
  plaqLag: number[]
}

export function gibbsModel(
  light: LightSymbol,
  modes: readonly BoxMode[],
  side: number,
  kappa: number,
): GibbsModel {
  const L = light.linkWeights.length
  const P = light.plaquettes.length
  const w = light.linkWeights
  const points = side ** light.dims
  const linkVar = new Array<number>(L).fill(0)
  const linkLag = new Array<number>(L).fill(0)
  const plaqVar = new Array<number>(P).fill(0)
  const plaqLag = new Array<number>(P).fill(0)

  for (const m of modes) {
    const g = 1 / (1 - (kappa * m.lambda) / 4)
    const cos = 1 - (kappa * m.lambda) / 2
    const norm = 1 / (2 * points)

    for (let h = 0; h < L; h++) {
      const v = ((m.vr[h]! ** 2 + m.vi[h]! ** 2) / w[h]!) * g * norm

      linkVar[h] = linkVar[h]! + v
      linkLag[h] = linkLag[h]! + v * cos
    }

    for (let t = 0; t < P; t++) {
      const v = ((m.br[t]! ** 2 + m.bi[t]! ** 2) / m.lambda) * g * norm

      plaqVar[t] = plaqVar[t]! + v
      plaqLag[t] = plaqLag[t]! + v * cos
    }
  }

  return { linkVar, linkLag, plaqVar, plaqLag }
}

/** A Gibbs start at temperature T on the box (doubles, before rounding): x and e per link. */
export function gibbsFields(
  box: Box,
  modes: readonly BoxMode[],
  split: { s: number; f: number },
  T: number,
  stream: number,
): { x: Float64Array; e: Float64Array } {
  const weyl = makeWeyl({ start: stream })
  const L = box.linkTypes
  const x = new Float64Array(box.links)
  const e = new Float64Array(box.links)
  const points = box.docks
  const kappa = split.s * split.f
  const isw = Array.from({ length: L }, (_, h) => 1 / Math.sqrt(box.w[h]!))
  const coords = Array.from({ length: box.docks }, (_, y) =>
    coordsOf(y, box.side, box.dims),
  )

  for (const m of modes) {
    const fl = split.f * m.lambda
    const det = kappa * m.lambda * (1 - (kappa * m.lambda) / 4)
    // covariance per real and imaginary part: (T / (2 points)) M^(-1), halved again for the doubled listing
    const scale = T / (4 * points * det)
    const caa = scale * split.s
    const cab = -scale * ((fl * split.s) / 2)
    const cbb = scale * fl
    const l11 = Math.sqrt(caa)
    const l21 = cab / l11
    const l22 = Math.sqrt(Math.max(0, cbb - l21 * l21))
    const g1 = weyl.nextGaussian()
    const g2 = weyl.nextGaussian()
    const g3 = weyl.nextGaussian()
    const g4 = weyl.nextGaussian()
    const ar = l11 * g1
    const br = l21 * g1 + l22 * g2
    const ai = l11 * g3
    const bi = l21 * g3 + l22 * g4

    for (let y = 0; y < box.docks; y++) {
      const theta = m.k.reduce((sum, kd, d) => sum + kd * coords[y]![d]!, 0)
      const cs = Math.cos(theta)
      const sn = Math.sin(theta)
      // (a_r + i a_i) e^(i theta)
      const zar = ar * cs - ai * sn
      const zai = ar * sn + ai * cs
      const zbr = br * cs - bi * sn
      const zbi = br * sn + bi * cs

      for (let h = 0; h < L; h++) {
        const ur = m.vr[h]! * isw[h]!
        const ui = m.vi[h]! * isw[h]!
        const l = y * L + h

        x[l] = x[l]! + zar * ur - zai * ui
        e[l] = e[l]! + zbr * ur - zbi * ui
      }
    }
  }

  return { x, e }
}

// ---------------------------------------------------------------------------------------------------------
// the carried light

export type CarriedSplit = { c: number; r: number; q: number }

export type Carried = {
  box: Box
  depth: number
  modulus: number
  split: CarriedSplit
  x: Int32Array
  e: Int32Array
  B: Int32Array
  X: Int32Array
  Y: Int32Array
}

const balOf = (x: number, n: number): number => {
  const m = mod(x, n)

  return m > (n - 1) / 2 ? m - n : m
}

/** B_P = bal(sum sign w x) on every plaquette. */
export function fieldOf(box: Box, x: Int32Array, modulus: number): Int32Array {
  const B = new Int32Array(box.plaquettes)

  for (let p = 0; p < box.plaquettes; p++) {
    let sum = 0

    for (let j = box.start[p]!; j < box.start[p + 1]!; j++) {
      const l = box.plaqLinks[j]!

      sum += box.plaqSigns[j]! * box.w[l]! * x[l]!
    }

    B[p] = balOf(sum, modulus)
  }

  return B
}

/** The carried light from a real start: x and e rounded (x mod N, e balanced), counters at q / 2 rounded down. */
export function carriedFrom(
  box: Box,
  depth: number,
  split: CarriedSplit,
  fields: { x: Float64Array; e: Float64Array },
): Carried {
  const modulus = 2 * depth + 1
  const x = Int32Array.from(fields.x, v => mod(Math.round(v), modulus))
  const e = Int32Array.from(fields.e, v => balOf(Math.round(v), modulus))
  const half = Math.floor(split.q / 2)

  return {
    box,
    depth,
    modulus,
    split,
    x,
    e,
    B: fieldOf(box, x, modulus),
    X: new Int32Array(box.links).fill(half),
    Y: new Int32Array(box.plaquettes).fill(half),
  }
}

export function copyCarried(s: Carried): Carried {
  return {
    ...s,
    x: s.x.slice(),
    e: s.e.slice(),
    B: s.B.slice(),
    X: s.X.slice(),
    Y: s.Y.slice(),
  }
}

export type Tally = {
  linkWraps: Float64Array // per link type
  plaqWraps: Float64Array // per plaquette type
  // sums for the variances and lag-one covariances, per type
  linkSq: Float64Array
  linkLag: Float64Array
  plaqSq: Float64Array
  plaqLag: Float64Array
  beats: number
}

export function emptyTally(box: Box): Tally {
  return {
    linkWraps: new Float64Array(box.linkTypes),
    plaqWraps: new Float64Array(box.plaquetteTypes),
    linkSq: new Float64Array(box.linkTypes),
    linkLag: new Float64Array(box.linkTypes),
    plaqSq: new Float64Array(box.plaquetteTypes),
    plaqLag: new Float64Array(box.plaquetteTypes),
    beats: 0,
  }
}

const scratch = new Map<number, { o: Int32Array; d: Int32Array; F: Int32Array }>()

function buffers(box: Box): { o: Int32Array; d: Int32Array; F: Int32Array } {
  const key = box.links * 7919 + box.plaquettes
  let b = scratch.get(key)

  if (!b) {
    b = {
      o: new Int32Array(box.links),
      d: new Int32Array(box.links),
      F: new Int32Array(box.plaquettes),
    }
    scratch.set(key, b)
  }

  return b
}

/** One beat in place: drift (carried), the field's seam, kick (carried), the flux's seam. */
export function carriedBeat(s: Carried, tally?: Tally): void {
  const { box, modulus: N, depth: D } = s
  const { c, r, q } = s.split
  const { o, d, F } = buffers(box)

  for (let l = 0; l < box.links; l++) {
    const X = s.X[l]! + c * s.e[l]!
    const out = floorDiv(X, q)

    s.X[l] = X - q * out
    s.x[l] = mod(s.x[l]! + out, N)
    o[l] = out
  }

  for (let p = 0; p < box.plaquettes; p++) {
    let dB = 0

    for (let j = box.start[p]!; j < box.start[p + 1]!; j++) {
      const l = box.plaqLinks[j]!

      dB += box.plaqSigns[j]! * box.w[l]! * o[l]!
    }

    const old = s.B[p]!
    const raw = old + dB
    const t = box.plaquetteType[p]!

    if (raw > D || raw < -D) {
      if (tally) {
        tally.plaqWraps[t] = tally.plaqWraps[t]! + 1
      }

      s.B[p] = balOf(raw, N)
    } else {
      s.B[p] = raw
    }

    if (tally) {
      const b = s.B[p]!

      tally.plaqSq[t] = tally.plaqSq[t]! + b * b
      tally.plaqLag[t] = tally.plaqLag[t]! + b * old
    }
  }

  d.fill(0)

  for (let p = 0; p < box.plaquettes; p++) {
    const Y = s.Y[p]! + r * box.n[p]! * s.B[p]!
    const out = floorDiv(Y, q)

    s.Y[p] = Y - q * out
    F[p] = out

    if (out !== 0) {
      for (let j = box.start[p]!; j < box.start[p + 1]!; j++) {
        const l = box.plaqLinks[j]!

        d[l] = d[l]! - box.plaqSigns[j]! * out
      }
    }
  }

  for (let l = 0; l < box.links; l++) {
    const old = s.e[l]!
    const raw = old + d[l]!
    const h = box.linkType[l]!

    if (raw > D || raw < -D) {
      if (tally) {
        tally.linkWraps[h] = tally.linkWraps[h]! + 1
      }

      s.e[l] = balOf(raw, N)
    } else {
      s.e[l] = raw
    }

    if (tally) {
      const v = s.e[l]!

      tally.linkSq[h] = tally.linkSq[h]! + v * v
      tally.linkLag[h] = tally.linkLag[h]! + v * old
    }
  }

  if (tally) {
    tally.beats++
  }
}

/** The inverse beat in place. */
export function carriedInverseBeat(s: Carried): void {
  const { box, modulus: N } = s
  const { c, r, q } = s.split
  const { o, d } = buffers(box)

  // kick back: F = ceil((r n B - Y') / q)
  d.fill(0)

  for (let p = 0; p < box.plaquettes; p++) {
    const drive = r * box.n[p]! * s.B[p]!
    const out = -floorDiv(s.Y[p]! - drive, q)

    s.Y[p] = s.Y[p]! + q * out - drive

    if (out !== 0) {
      for (let j = box.start[p]!; j < box.start[p + 1]!; j++) {
        const l = box.plaqLinks[j]!

        d[l] = d[l]! + box.plaqSigns[j]! * out
      }
    }
  }

  for (let l = 0; l < box.links; l++) {
    s.e[l] = balOf(s.e[l]! + d[l]!, N)
  }

  // drift back: o = ceil((c e - X') / q)
  for (let l = 0; l < box.links; l++) {
    const drive = c * s.e[l]!
    const out = -floorDiv(s.X[l]! - drive, q)

    s.X[l] = s.X[l]! + q * out - drive
    s.x[l] = mod(s.x[l]! - out, N)
    o[l] = out
  }

  for (let p = 0; p < box.plaquettes; p++) {
    let dB = 0

    for (let j = box.start[p]!; j < box.start[p + 1]!; j++) {
      const l = box.plaqLinks[j]!

      dB += box.plaqSigns[j]! * box.w[l]! * o[l]!
    }

    s.B[p] = balOf(s.B[p]! - dB, N)
  }
}

/** The divergence of e at every dock, modulo N. */
export function divergence(s: Carried): Int32Array {
  const div = new Int32Array(s.box.docks)

  for (let l = 0; l < s.box.links; l++) {
    const t = s.box.tail[l]!
    const h = s.box.head[l]!

    div[t] = div[t]! - s.e[l]!
    div[h] = div[h]! + s.e[l]!
  }

  return Int32Array.from(div, v => mod(v, s.modulus))
}

export function sameCarried(a: Carried, b: Carried): boolean {
  const eq = (u: Int32Array, v: Int32Array): boolean =>
    u.length === v.length && u.every((x, i) => x === v[i])

  return (
    eq(a.x, b.x) && eq(a.e, b.e) && eq(a.B, b.B) && eq(a.X, b.X) && eq(a.Y, b.Y)
  )
}

// ---------------------------------------------------------------------------------------------------------
// splits and the Gaussian seam crossing

/**
 * The carried split nearest rho with kappa = 1 / N exactly: q = N m, c r = N m^2, so c r / q^2 = 1 / N; the pair
 * whose ratio r / c is nearest rho (in ln), m = 1 .. mMax, ties to the smaller m. `skip` excludes splits already used.
 */
export function carriedSplit(
  modulus: number,
  rho: number,
  mMax: number,
  skip: readonly CarriedSplit[] = [],
): CarriedSplit & { rho: number } {
  let best: (CarriedSplit & { rho: number; miss: number }) | undefined

  for (let m = 1; m <= mMax; m++) {
    const product = modulus * m * m
    const q = modulus * m
    const c0 = Math.round(m * Math.sqrt(modulus / rho))

    for (let c = Math.max(1, c0 - 3); c <= c0 + 3; c++) {
      if (product % c !== 0) {
        continue
      }

      const r = product / c
      const g = gcd(gcd(c, r), q)

      if (g !== 1) {
        continue
      }

      if (skip.some(x => x.c === c && x.r === r && x.q === q)) {
        continue
      }

      const miss = Math.abs(Math.log(r / c / rho))

      if (!best || miss < best.miss) {
        best = { c, r, q, rho: r / c, miss }
      }
    }
  }

  if (!best) {
    throw new Error(`no carried split near ${rho}`)
  }

  return { c: best.c, r: best.r, q: best.q, rho: best.rho }
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)

  while (y) {
    ;[x, y] = [y, x % y]
  }

  return x
}

/** The standard normal upper tail, by erfc (Numerical Recipes erfcc, relative error under 1.2e-7). */
export function upperTail(z: number): number {
  const x = z / Math.SQRT2
  const a = Math.abs(x)
  const t = 1 / (1 + 0.5 * a)
  const r =
    t *
    Math.exp(
      -a * a -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t *
                                  (1.48851587 +
                                    t * (-0.82215223 + t * 0.17087277)))))))),
    )

  return (x >= 0 ? r : 2 - r) / 2
}

/**
 * The Gaussian seam crossing per register and beat: P(|X| <= a, |Y| > a) for (X, Y) jointly normal with variance
 * sigma2 and lag-one correlation corr, a = D + 1/2 (Simpson's rule over X).
 */
export function crossing(sigma2: number, corr: number, depth: number): number {
  const a = depth + 0.5
  const sigma = Math.sqrt(sigma2)
  const tau = sigma * Math.sqrt(Math.max(1e-300, 1 - corr * corr))
  const steps = 4000
  const h = (2 * a) / steps

  let sum = 0

  for (let i = 0; i <= steps; i++) {
    const x = -a + i * h
    const density =
      Math.exp(-(x * x) / (2 * sigma2)) / (sigma * Math.sqrt(2 * Math.PI))
    const out =
      upperTail((a - corr * x) / tau) + upperTail((a + corr * x) / tau)
    const weight = i === 0 || i === steps ? 1 : i % 2 === 1 ? 4 : 2

    sum += weight * density * out
  }

  return (sum * h) / 3
}
