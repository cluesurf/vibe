// THE KERNEL'S js BACKEND, the reference. code/kernel/
// Each primitive is the engine's own loop, restated with the tables flattened (code/measure/register-ball-reduced conv
// and ballCycle, register-reduced beats and crossPiece, register-sea sectorPiece, seaBeat's stream and pairAt), the same
// operations in the same order. The equivalence check (task/kernel/check.ts) holds this backend to the engines
// themselves, and every other backend to this one, byte for byte.

import type {
  HoleFourierTables,
  HolePairTables,
  HolePhase,
  Kernel,
  PairOp,
  PairTables,
} from '@/code/kernel/types'

const PAIR = 64
const SITE = 256
const NR = 24
const REG = 8
const MODES = 192
const FULL = MODES * MODES

export function jsConv(
  tb: PairTables,
  srcRe: Float64Array,
  srcIm: Float64Array,
  srcOff: number,
  srcStride: number,
  t: number,
  outRe: Float64Array,
  outIm: Float64Array,
  member: 1 | 2,
  dagger: boolean,
): void {
  const N = tb.plusRep.length / NR
  const usePlus = !((member === 1) !== dagger)
  const repT = usePlus ? tb.plusRep : tb.minusRep
  const gT = usePlus ? tb.plusG : tb.minusG
  const off = dagger ? tb.offT : tb.off
  const row = dagger ? tb.rowT : tb.row
  const col = dagger ? tb.colT : tb.col
  const val = dagger ? tb.valT : tb.val
  const sg = dagger ? -1 : 1
  const tr = new Float64Array(PAIR)
  const ti = new Float64Array(PAIR)

  outRe.fill(0, 0, N * PAIR)
  outIm.fill(0, 0, N * PAIR)

  for (let i = 0; i < N; i++) {
    const oo = i * PAIR

    for (let d = 0; d < NR; d++) {
      const j = repT[i * NR + d]!

      if (j < 0) {
        continue
      }

      const base = (gT[i * NR + d]! * 4 + t) * PAIR
      const so = j * srcStride + srcOff

      for (let k = 0; k < PAIR; k++) {
        const f = tb.sgn[base + k]!
        const at = so + tb.src[base + k]!

        tr[k] = f * srcRe[at]!
        ti[k] = f * srcIm[at]!
      }

      const pr = tb.halfRe[d]!
      const pi = sg * tb.halfIm[d]!

      for (let q = off[d]!; q < off[d + 1]!; q++) {
        const r = row[q]!
        const c = col[q]!
        const v = val[q]!
        const wr = v * pr
        const wi = v * pi

        if (member === 1) {
          const ob = oo + r * 8
          const sb = c * 8

          for (let r2 = 0; r2 < 8; r2++) {
            const xr = tr[sb + r2]!
            const xi = ti[sb + r2]!

            outRe[ob + r2]! += wr * xr - wi * xi
            outIm[ob + r2]! += wr * xi + wi * xr
          }
        } else {
          for (let r1 = 0; r1 < 8; r1++) {
            const xr = tr[r1 * 8 + c]!
            const xi = ti[r1 * 8 + c]!

            outRe[oo + r1 * 8 + r]! += wr * xr - wi * xi
            outIm[oo + r1 * 8 + r]! += wr * xi + wi * xr
          }
        }
      }
    }
  }
}

export function jsPairBeat(
  re: Float64Array,
  im: Float64Array,
  t1r: Float64Array,
  t1i: Float64Array,
  t2r: Float64Array,
  t2i: Float64Array,
  fr: Float64Array,
  fi: Float64Array,
  qBr: Float64Array,
  qBi: Float64Array,
  qXr: Float64Array,
  qXi: Float64Array,
  beta: Float64Array,
  alr: number,
  ali: number,
  mainOff: number,
): void {
  const N = beta.length / 2

  for (let i = 0; i < N; i++) {
    const b1r = beta[2 * i]!
    const b1i = beta[2 * i + 1]!

    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k
      const Mi = i * SITE + mainOff + k
      const Bi = i * SITE + 64 + k
      const Xi = i * SITE + 128 + k
      const aR = re[Mi]!
      const aI = im[Mi]!
      const p1r = aR + t1r[c]!
      const p1i = aI + t1i[c]!
      const p2r = aR + t2r[c]!
      const p2i = aI + t2i[c]!
      const psr = p1r + t2r[c]! + fr[c]!
      const psi = p1i + t2i[c]! + fi[c]!

      re[Mi] = aR + alr * (p1r + p2r) - ali * (p1i + p2i) + b1r * psr - b1i * psi
      im[Mi] = aI + alr * (p1i + p2i) + ali * (p1r + p2r) + b1r * psi + b1i * psr

      const bR = re[Bi]!
      const bI = im[Bi]!
      const qbr = bR + qBr[c]!
      const qbi = bI + qBi[c]!

      re[Bi] = bR + alr * qbr - ali * qbi
      im[Bi] = bI + alr * qbi + ali * qbr

      const xR = re[Xi]!
      const xI = im[Xi]!
      const qxr = xR + qXr[c]!
      const qxi = xI + qXi[c]!

      re[Xi] = xR + alr * qxr - ali * qxi
      im[Xi] = xI + alr * qxi + ali * qxr
    }
  }
}

export function jsCrossApply(
  re: Float64Array,
  im: Float64Array,
  t1r: Float64Array,
  t1i: Float64Array,
  t2r: Float64Array,
  t2i: Float64Array,
  t4r: Float64Array,
  t4i: Float64Array,
  cross: Float64Array,
  own: number,
): void {
  const N = cross.length / 2

  for (let i = 0; i < N; i++) {
    const cr = cross[2 * i]!
    const ci = cross[2 * i + 1]!

    if (cr === 0 && ci === 0) {
      continue
    }

    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k
      const o = i * SITE + own + k
      const xr = re[o]! + t1r[c]! + t2r[c]! + t4r[c]!
      const xi = im[o]! + t1i[c]! + t2i[c]! + t4i[c]!

      re[o]! += cr * xr - ci * xi
      im[o]! += cr * xi + ci * xr
    }
  }
}

export function jsBlockAdd(outRe: Float64Array, outIm: Float64Array, fr: Float64Array, fi: Float64Array, off: number): void {
  const N = outRe.length / SITE

  for (let i = 0; i < N; i++) {
    for (let k = 0; k < PAIR; k++) {
      outRe[i * SITE + off + k]! += fr[i * PAIR + k]!
      outIm[i * SITE + off + k]! += fi[i * PAIR + k]!
    }
  }
}

export function jsBlockInner(
  aRe: Float64Array,
  aIm: Float64Array,
  bRe: Float64Array,
  bIm: Float64Array,
  partRe: Float64Array,
  partIm: Float64Array,
): void {
  for (let i = 0; i < partRe.length; i++) {
    let sr = 0
    let si = 0

    for (let k = i * SITE; k < (i + 1) * SITE; k++) {
      const xr = aRe[k]!
      const xi = aIm[k]!
      const yr = bRe[k]!
      const yi = bIm[k]!

      sr += xr * yr + xi * yi
      si += xr * yi - xi * yr
    }

    partRe[i] = sr
    partIm[i] = si
  }
}

export function jsAxpy(yRe: Float64Array, yIm: Float64Array, xRe: Float64Array, xIm: Float64Array, fr: number, fi: number): void {
  for (let i = 0; i < yRe.length; i++) {
    const r = xRe[i]!
    const m = xIm[i]!

    yRe[i]! += fr * r - fi * m
    yIm[i]! += fr * m + fi * r
  }
}

export function jsScale(re: Float64Array, im: Float64Array, f: number): void {
  for (let i = 0; i < re.length; i++) {
    re[i]! *= f
    im[i]! *= f
  }
}

// register-sea sectorPiece at one dock, with seaBeat's `whole` phase first when phase is given
function seaPieceAt(
  re: Float64Array,
  im: Float64Array,
  off: number,
  E: Float64Array,
  ar: number,
  ai: number,
  br: number,
  bi: number,
  phase: readonly [number, number] | null,
): void {
  if (phase) {
    const [c, sn] = phase

    for (let k = 0; k < FULL; k++) {
      const xr = re[off + k]!
      const xi = im[off + k]!

      re[off + k] = c * xr - sn * xi
      im[off + k] = c * xi + sn * xr
    }
  }

  const Lr = new Float64Array(REG * MODES)
  const Li = new Float64Array(REG * MODES)
  const Rr = new Float64Array(MODES * REG)
  const Ri = new Float64Array(MODES * REG)

  for (let s1 = 0; s1 < MODES; s1++) {
    const o = off + s1 * MODES

    for (let eta = 0; eta < REG; eta++) {
      const w = E[s1 * REG + eta]!

      if (w === 0) {
        continue
      }

      const lo = eta * MODES

      for (let s2 = 0; s2 < MODES; s2++) {
        Lr[lo + s2]! += w * re[o + s2]!
        Li[lo + s2]! += w * im[o + s2]!
      }
    }

    for (let s2 = 0; s2 < MODES; s2++) {
      const xr = re[o + s2]!
      const xi = im[o + s2]!

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let eta = 0; eta < REG; eta++) {
        const w = E[s2 * REG + eta]!

        Rr[s1 * REG + eta]! += w * xr
        Ri[s1 * REG + eta]! += w * xi
      }
    }
  }

  const Cr = new Float64Array(REG * REG)
  const Ci = new Float64Array(REG * REG)

  for (let eta = 0; eta < REG; eta++) {
    for (let s2 = 0; s2 < MODES; s2++) {
      const xr = Lr[eta * MODES + s2]!
      const xi = Li[eta * MODES + s2]!

      for (let z = 0; z < REG; z++) {
        const w = E[s2 * REG + z]!

        Cr[eta * REG + z]! += w * xr
        Ci[eta * REG + z]! += w * xi
      }
    }
  }

  const gr = new Float64Array(REG)
  const gi = new Float64Array(REG)

  for (let s1 = 0; s1 < MODES; s1++) {
    for (let z = 0; z < REG; z++) {
      let cr = 0
      let ci = 0

      for (let eta = 0; eta < REG; eta++) {
        const w = E[s1 * REG + eta]!

        cr += w * Cr[eta * REG + z]!
        ci += w * Ci[eta * REG + z]!
      }

      const rr = Rr[s1 * REG + z]!
      const ri = Ri[s1 * REG + z]!

      gr[z] = ar * rr - ai * ri + br * cr - bi * ci
      gi[z] = ar * ri + ai * rr + br * ci + bi * cr
    }

    const o = off + s1 * MODES

    for (let s2 = 0; s2 < MODES; s2++) {
      let sr = 0
      let si = 0

      for (let eta = 0; eta < REG; eta++) {
        const w1 = E[s1 * REG + eta]!
        const w2 = E[s2 * REG + eta]!

        if (w1 !== 0) {
          const lr = Lr[eta * MODES + s2]!
          const li = Li[eta * MODES + s2]!

          sr += w1 * (ar * lr - ai * li)
          si += w1 * (ar * li + ai * lr)
        }

        if (w2 !== 0) {
          sr += w2 * gr[eta]!
          si += w2 * gi[eta]!
        }
      }

      re[o + s2]! += sr
      im[o + s2]! += si
    }
  }
}

export function jsSeaPiece(
  re: Float64Array,
  im: Float64Array,
  E: Float64Array,
  alpha: Float64Array,
  beta: Float64Array,
  phase: Float64Array | null,
): void {
  const docks = alpha.length / 2

  for (let i = 0; i < docks; i++) {
    seaPieceAt(
      re,
      im,
      i * FULL,
      E,
      alpha[2 * i]!,
      alpha[2 * i + 1]!,
      beta[2 * i]!,
      beta[2 * i + 1]!,
      phase ? [phase[2 * i]!, phase[2 * i + 1]!] : null,
    )
  }
}

export function jsSeaStream(
  sRe: Float64Array,
  sIm: Float64Array,
  oRe: Float64Array,
  oIm: Float64Array,
  move: Int32Array,
  opposite: Int32Array,
): void {
  const N = sRe.length / FULL

  for (let i = 0; i < N; i++) {
    for (let d = 0; d < NR; d++) {
      const from1 = opposite[d]!

      for (let e = 0; e < NR; e++) {
        const j = move[i * NR * NR + d * NR + e]!
        const from2 = opposite[e]!

        for (let a = 0; a < REG; a++) {
          const src = i * FULL + (from1 * REG + a) * MODES + from2 * REG
          const dst = j * FULL + (d * REG + a) * MODES + e * REG

          for (let b = 0; b < REG; b++) {
            oRe[dst + b] = sRe[src + b]!
            oIm[dst + b] = sIm[src + b]!
          }
        }
      }
    }
  }
}

export function jsPhaseSum(
  re: Float64Array,
  im: Float64Array,
  c: Float64Array,
  s: Float64Array,
  width: number,
  mRe: Float64Array,
  mIm: Float64Array,
): void {
  mRe.fill(0)
  mIm.fill(0)

  for (let i = 0; i < c.length; i++) {
    const ci = c[i]!
    const sn = s[i]!
    const o = i * width

    for (let k = 0; k < width; k++) {
      const xr = re[o + k]!
      const xi = im[o + k]!

      if (xr === 0 && xi === 0) {
        continue
      }

      mRe[k]! += ci * xr - sn * xi
      mIm[k]! += ci * xi + sn * xr
    }
  }
}

// ---- register-holes (code/measure/register-holes oneBody, bandWeights and pairPhases) ----

export function jsHoleOneBody(
  re: Float64Array,
  im: Float64Array,
  mom: Int32Array,
  n: number,
  f: number,
  aRe: Float64Array,
  aIm: Float64Array,
): void {
  const block = f ** n
  const tuples = re.length / block
  const xr = new Float64Array(f)
  const xi = new Float64Array(f)

  for (let T = 0; T < tuples; T++) {
    const off = T * block

    for (let i = 0; i < n; i++) {
      const a = mom[T * n + i]! * f * f
      const st = f ** (n - 1 - i)
      const outer = f ** i

      for (let hi = 0; hi < outer; hi++) {
        for (let lo = 0; lo < st; lo++) {
          const base = off + hi * f * st + lo

          for (let k = 0; k < f; k++) {
            xr[k] = re[base + k * st]!
            xi[k] = im[base + k * st]!
          }

          for (let r = 0; r < f; r++) {
            let yr = 0
            let yi = 0
            const ro = a + r * f

            for (let k = 0; k < f; k++) {
              const ar = aRe[ro + k]!
              const ai = aIm[ro + k]!

              if (ar === 0 && ai === 0) {
                continue
              }

              yr += ar * xr[k]! - ai * xi[k]!
              yi += ar * xi[k]! + ai * xr[k]!
            }

            re[base + r * st] = yr
            im[base + r * st] = yi
          }
        }
      }
    }
  }
}

export function jsHoleBand(
  re: Float64Array,
  im: Float64Array,
  mom: Int32Array,
  n: number,
  f: number,
  pRe: Float64Array,
  pIm: Float64Array,
  part: Float64Array,
): void {
  const block = f ** n
  const tuples = re.length / block
  const yr = new Float64Array(f)
  const yi = new Float64Array(f)

  for (let T = 0; T < tuples; T++) {
    const off = T * block

    for (let i = 0; i < n; i++) {
      const p = mom[T * n + i]! * f * f
      const st = f ** (n - 1 - i)
      const outer = f ** i

      let w = 0

      for (let hi = 0; hi < outer; hi++) {
        for (let lo = 0; lo < st; lo++) {
          const base = off + hi * f * st + lo

          for (let r = 0; r < f; r++) {
            let ar = 0
            let ai = 0

            for (let k = 0; k < f; k++) {
              const pr = pRe[p + r * f + k]!
              const pi = pIm[p + r * f + k]!
              const xr = re[base + k * st]!
              const xi = im[base + k * st]!

              ar += pr * xr - pi * xi
              ai += pr * xi + pi * xr
            }

            yr[r] = ar
            yi[r] = ai
          }

          for (let r = 0; r < f; r++) {
            w += yr[r]! * yr[r]! + yi[r]! * yi[r]!
          }
        }
      }

      part[T * n + i] = w
    }
  }
}

// register-holes dft4d on the flattened tables
function holeDft4d(
  F: HoleFourierTables,
  re: Float64Array,
  im: Float64Array,
  sign: 1 | -1,
  sr: Float64Array,
  si: Float64Array,
): void {
  const L = F.cos.length

  for (let axis = 0; axis < 4; axis++) {
    const st = L ** (3 - axis)
    const outer = L ** axis

    for (let o = 0; o < outer; o++) {
      for (let lo = 0; lo < st; lo++) {
        const base = o * L * st + lo

        if (L === 4) {
          const i0 = base
          const i1 = base + st
          const i2 = base + 2 * st
          const i3 = base + 3 * st
          const a0r = re[i0]! + re[i2]!
          const a0i = im[i0]! + im[i2]!
          const a1r = re[i0]! - re[i2]!
          const a1i = im[i0]! - im[i2]!
          const b0r = re[i1]! + re[i3]!
          const b0i = im[i1]! + im[i3]!
          const b1r = re[i1]! - re[i3]!
          const b1i = im[i1]! - im[i3]!

          re[i0] = a0r + b0r
          im[i0] = a0i + b0i
          re[i2] = a0r - b0r
          im[i2] = a0i - b0i
          re[i1] = a1r - sign * b1i
          im[i1] = a1i + sign * b1r
          re[i3] = a1r + sign * b1i
          im[i3] = a1i - sign * b1r
          continue
        }

        for (let m = 0; m < L; m++) {
          let r = 0
          let q = 0

          for (let n = 0; n < L; n++) {
            const k = (m * n) % L
            const c = F.cos[k]!
            const s = sign * F.sin[k]!
            const xr = re[base + n * st]!
            const xi = im[base + n * st]!

            r += c * xr - s * xi
            q += c * xi + s * xr
          }

          sr[m] = r
          si[m] = q
        }

        for (let m = 0; m < L; m++) {
          re[base + m * st] = sr[m]!
          im[base + m * st] = si[m]!
        }
      }
    }
  }
}

type HoleScratch = {
  br: Float64Array
  bi: Float64Array
  lr: Float64Array
  li: Float64Array
  gr: Float64Array
  gi: Float64Array
  sr: Float64Array
  si: Float64Array
}

// register-holes toSites (dir 1) and toClasses (dir -1) on the line lr, li
function holeLine(F: HoleFourierTables, x: HoleScratch, dir: 1 | -1): void {
  const N = F.gridOfSite.length
  const G = F.classOfGrid.length

  if (dir === 1) {
    for (let g = 0; g < G; g++) {
      const j = F.classOfGrid[g]!

      x.gr[g] = x.lr[j]!
      x.gi[g] = x.li[j]!
    }

    holeDft4d(F, x.gr, x.gi, 1, x.sr, x.si)

    const k = F.scales[0]!

    for (let i = 0; i < N; i++) {
      const g = F.gridOfSite[i]!

      x.lr[i] = x.gr[g]! * k
      x.li[i] = x.gi[g]! * k
    }

    return
  }

  x.gr.fill(0)
  x.gi.fill(0)

  for (let i = 0; i < N; i++) {
    const g = F.gridOfSite[i]!

    x.gr[g] = x.lr[i]!
    x.gi[g] = x.li[i]!
  }

  holeDft4d(F, x.gr, x.gi, -1, x.sr, x.si)

  const k = F.scales[1]!

  for (let j = 0; j < N; j++) {
    const g = F.gridOfClass[j]!

    x.lr[j] = x.gr[g]! * k
    x.li[j] = x.gi[g]! * k
  }
}

// register-holes transformAxis
function holeAxis(F: HoleFourierTables, x: HoleScratch, axes: number, a: number, dir: 1 | -1): void {
  const N = F.gridOfSite.length
  const st = N ** (axes - 1 - a)
  const outer = N ** a

  for (let o = 0; o < outer; o++) {
    for (let lo = 0; lo < st; lo++) {
      const base = o * N * st + lo

      for (let k = 0; k < N; k++) {
        x.lr[k] = x.br[base + k * st]!
        x.li[k] = x.bi[base + k * st]!
      }

      holeLine(F, x, dir)

      for (let k = 0; k < N; k++) {
        x.br[base + k * st] = x.lr[k]!
        x.bi[base + k * st] = x.li[k]!
      }
    }
  }
}

export function jsHolePair(
  re: Float64Array,
  im: Float64Array,
  F: HoleFourierTables,
  P: HolePairTables,
  ph: HolePhase,
): void {
  const N = F.gridOfSite.length
  const tuples = P.rowOf.length
  const nperm = P.psign.length
  const rows = P.tOf.length / nperm
  const block = re.length / rows
  const orbits = P.pattern.length

  let axes = 0

  for (let span = 1; span < tuples; span *= N) {
    axes++
  }

  const x: HoleScratch = {
    br: new Float64Array(tuples),
    bi: new Float64Array(tuples),
    lr: new Float64Array(N),
    li: new Float64Array(N),
    gr: new Float64Array(F.classOfGrid.length),
    gi: new Float64Array(F.classOfGrid.length),
    sr: new Float64Array(F.cos.length),
    si: new Float64Array(F.cos.length),
  }

  for (let o = 0; o < orbits; o++) {
    const fbs = o * nperm

    // the gather, row by row: tuple t is reached from its own row and permutation only
    for (let r = 0; r < rows; r++) {
      for (let p = 0; p < nperm; p++) {
        const t = P.tOf[r * nperm + p]!

        if (P.permOf[t] !== p) {
          continue
        }

        const at = r * block + P.fbOf[fbs + p]!

        if (P.psign[p]! < 0) {
          x.br[t] = -re[at]!
          x.bi[t] = -im[at]!
        } else {
          x.br[t] = re[at]!
          x.bi[t] = im[at]!
        }
      }
    }

    for (let a = 0; a < axes; a++) {
      holeAxis(F, x, axes, a, 1)
    }

    const pat = P.pattern[o]! * tuples

    for (let t = 0; t < tuples; t++) {
      if (ph.skip[pat + t] !== 0) {
        continue
      }

      const c = ph.cos[pat + t]!
      const sn = ph.sin[pat + t]!
      const xr = x.br[t]!
      const xi = x.bi[t]!

      x.br[t] = c * xr - sn * xi
      x.bi[t] = c * xi + sn * xr
    }

    for (let a = 0; a < axes; a++) {
      holeAxis(F, x, axes, a, -1)
    }

    // the scatter, row by row
    for (let r = 0; r < rows; r++) {
      for (let w = P.writeOff[o]!; w < P.writeOff[o + 1]!; w++) {
        const c = P.writeC[w]!
        const tau = P.writeTau[w]!
        const t = P.tOf[r * nperm + tau]!
        const at = r * block + c

        re[at] = P.psign[tau]! < 0 ? -x.br[t]! : x.br[t]!
        im[at] = P.psign[tau]! < 0 ? -x.bi[t]! : x.bi[t]!
      }
    }
  }
}

export function jsKernel(): Kernel {
  return {
    backend: 'js',
    threads: 1,
    pairOp: (tables: PairTables): PairOp => ({ count: tables.plusRep.length / NR, tables }),
    conv: (op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger) =>
      jsConv(op.tables, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger),
    pairBeat: jsPairBeat,
    crossApply: jsCrossApply,
    blockAdd: jsBlockAdd,
    blockInner: jsBlockInner,
    axpy: jsAxpy,
    scale: jsScale,
    seaPiece: jsSeaPiece,
    seaStream: jsSeaStream,
    phaseSum: jsPhaseSum,
    holeOneBody: jsHoleOneBody,
    holeBand: jsHoleBand,
    holePair: jsHolePair,
  }
}
