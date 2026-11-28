// LIVE TWO-BODY 1/r DYNAMICAL GRAVITATIONAL ATTRACTION, ORBITAL MOTION, AND DEFLECTION
// FROM THE EXACT {3,4,3,4} PAIR-DENSITY WARPED CUSP GRAVITY OPERATOR (E-GRV-0158).
//
// Builds directly on:
//   - E-GRV-0157 (pair-density-gravity-slope.ts): exact {3,4,3,4} shell counts N_D = [1, 18, 330, 6034],
//     parameter-free pair-density warp w(D) = 1 / N_D^2 (canonical single-face [1, 4, 20, 100]),
//     K_eff = 1.0125321220, G_eff = 0.07859254, and raw unwarped bulk screened control w(D) = 1.
//   - E-RLT-0125 (universal-speed-lock.ts): shared warped-column universal speed c_universal = 0.9779246684.
//
// Dynamical method (deterministic, zero RNG):
//   Two distinct localized composite wavepackets (psi_1, psi_2) of masses (m_1, m_2) evolve on a 3D cubic
//   husk box (side N = 32) under the strictly unitary Strang split-step Schrodinger-Poisson propagator:
//     U(dt) = exp(-i (dt/2) T) exp(-i dt m Phi) exp(-i (dt/2) T)
//   where body 1 feels Phi_2 = -m_2 (G_open * |psi_2|^2) and body 2 feels Phi_1 = -m_1 (G_open * |psi_1|^2)
//   with zero self-energy. Because the potential kick is a pure phase multiplication in position space,
//   |psi_1|^2 and |psi_2|^2 are invariant across the kick, making the nonlinear Strang propagator both
//   strictly unitary and exactly time-reversible (U(-dt)^T U(dt)^T = I to machine precision).
//
//   To eliminate periodic torus image bias, the gravitational convolution Phi_j = -m_j (G_open * rho_j)
//   uses Hockney zero-padded open-boundary 3D FFTs on M = 2*N = 64 with the exact infinite-volume {3,4,3,4}
//   Schur-complement Green's function G_open (Madelung + torus-background corrected on 64^3, matching
//   E-GRV-0157 to machine precision). Because rho_1 and rho_2 are real and G_open is real and even, both
//   potentials are obtained simultaneously from a single complex convolution of rho_1 + i rho_2.

import {
  EXACT_COLUMN_SHELL_COUNTS,
  MADELUNG_C_M,
  singleFaceLateralLinksPerNeighbor,
} from '@/code/measure/pair-density-gravity-slope'
import { buildWarpedColumnData } from '@/code/measure/universal-speed-lock'

const R_VOL = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]

const BOX_N = 32
const PAD_M = 64
const BOX_VOL = BOX_N * BOX_N * BOX_N
const PAD_VOL = PAD_M * PAD_M * PAD_M
const CENTER = (BOX_N - 1) / 2 // 15.5 gives exact mirror symmetry x <-> 31 - x

// -------------------------------------------------------------------------------------------------
// Exact {3,4,3,4} cusp column Schur complement (identical to E-GRV-0157)
// -------------------------------------------------------------------------------------------------

type ColumnModel = {
  readonly floorF: number
  readonly warped: boolean
  readonly cLat: Float64Array
  readonly cVert: Float64Array
  readonly kEff: number
  readonly gEff: number
}

function buildColumnModel(floorF: number, warped: boolean): ColumnModel {
  const nLen = floorF + 2
  const nShell = new Float64Array(nLen)
  for (let d = 0; d < EXACT_COLUMN_SHELL_COUNTS.length && d < nLen; d++) {
    nShell[d] = EXACT_COLUMN_SHELL_COUNTS[d]!
  }
  for (let d = EXACT_COLUMN_SHELL_COUNTS.length; d < nLen; d++) {
    nShell[d] = nShell[d - 1]! * R_VOL
  }

  const cLat = new Float64Array(floorF + 1)
  const cVert = new Float64Array(floorF + 1)

  for (let d = 0; d <= floorF; d++) {
    const nd = nShell[d]!
    const nd1 = nShell[d + 1]!
    if (warped) {
      cLat[d] = singleFaceLateralLinksPerNeighbor(d) / (nd * nd)
      cVert[d] = 18 / nd1
    } else {
      cLat[d] = singleFaceLateralLinksPerNeighbor(d)
      cVert[d] = 18 * nd
    }
  }

  let y = cVert[floorF]!
  let dy = cLat[floorF]!
  for (let d = floorF - 1; d >= 0; d--) {
    const cv = cVert[d]!
    const denom = cv + y
    const ratio = cv / denom
    dy = cLat[d]! + ratio * ratio * dy
    y = (cv * y) / denom
  }

  return {
    floorF,
    warped,
    cLat,
    cVert,
    kEff: dy,
    gEff: 1 / (4 * Math.PI * dy),
  }
}

function schurAtLambda(model: ColumnModel, lam: number): number {
  const { floorF, cLat, cVert } = model
  let y = cLat[floorF]! * lam + cVert[floorF]!
  for (let d = floorF - 1; d >= 0; d--) {
    const cv = cVert[d]!
    y = cLat[d]! * lam + (cv * y) / (cv + y)
  }
  return y
}

// -------------------------------------------------------------------------------------------------
// Exact radix-2 1D and 3D FFT (precomputed bit-reversal and twiddle factors)
// -------------------------------------------------------------------------------------------------

type FftPlan1D = {
  readonly n: number
  readonly bitRev: Int32Array
  readonly cosFwd: Float64Array
  readonly sinFwd: Float64Array
  readonly cosInv: Float64Array
  readonly sinInv: Float64Array
}

function createFftPlan1D(n: number): FftPlan1D {
  const bits = Math.round(Math.log2(n))
  const bitRev = new Int32Array(n)
  for (let i = 0; i < n; i++) {
    let rev = 0
    let x = i
    for (let b = 0; b < bits; b++) {
      rev = (rev << 1) | (x & 1)
      x >>= 1
    }
    bitRev[i] = rev
  }

  const cosFwd = new Float64Array(n)
  const sinFwd = new Float64Array(n)
  const cosInv = new Float64Array(n)
  const sinInv = new Float64Array(n)

  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1
    const angleStep = (2 * Math.PI) / size
    for (let j = 0; j < half; j++) {
      const ang = angleStep * j
      const c = Math.cos(ang)
      const s = Math.sin(ang)
      cosFwd[half + j] = c
      sinFwd[half + j] = -s
      cosInv[half + j] = c
      sinInv[half + j] = s
    }
  }

  return { n, bitRev, cosFwd, sinFwd, cosInv, sinInv }
}

function fft1DInPlace(
  plan: FftPlan1D,
  re: Float64Array,
  im: Float64Array,
  inverse: boolean,
): void {
  const n = plan.n
  const bitRev = plan.bitRev
  for (let i = 0; i < n; i++) {
    const j = bitRev[i]!
    if (i < j) {
      const tr = re[i]!
      re[i] = re[j]!
      re[j] = tr
      const ti = im[i]!
      im[i] = im[j]!
      im[j] = ti
    }
  }

  const cosT = inverse ? plan.cosInv : plan.cosFwd
  const sinT = inverse ? plan.sinInv : plan.sinFwd

  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1
    for (let start = 0; start < n; start += size) {
      for (let j = 0; j < half; j++) {
        const i0 = start + j
        const i1 = i0 + half
        const wr = cosT[half + j]!
        const wi = sinT[half + j]!
        const ur = re[i0]!
        const ui = im[i0]!
        const vr = re[i1]!
        const vi = im[i1]!
        const tr = wr * vr - wi * vi
        const ti = wr * vi + wi * vr
        re[i0] = ur + tr
        im[i0] = ui + ti
        re[i1] = ur - tr
        im[i1] = ui - ti
      }
    }
  }

  if (inverse) {
    const invN = 1 / n
    for (let i = 0; i < n; i++) {
      re[i] = re[i]! * invN
      im[i] = im[i]! * invN
    }
  }
}

// Full 3D complex FFT in-place on an n x n x n cube (index = (x * n + y) * n + z)
function fft3DInPlace(
  plan: FftPlan1D,
  re: Float64Array,
  im: Float64Array,
  inverse: boolean,
  lineRe: Float64Array,
  lineIm: Float64Array,
): void {
  const n = plan.n
  const n2 = n * n

  for (let xy = 0; xy < n2; xy++) {
    const base = xy * n
    for (let z = 0; z < n; z++) {
      lineRe[z] = re[base + z]!
      lineIm[z] = im[base + z]!
    }
    fft1DInPlace(plan, lineRe, lineIm, inverse)
    for (let z = 0; z < n; z++) {
      re[base + z] = lineRe[z]!
      im[base + z] = lineIm[z]!
    }
  }

  for (let x = 0; x < n; x++) {
    const xBase = x * n2
    for (let z = 0; z < n; z++) {
      for (let y = 0; y < n; y++) {
        const idx = xBase + y * n + z
        lineRe[y] = re[idx]!
        lineIm[y] = im[idx]!
      }
      fft1DInPlace(plan, lineRe, lineIm, inverse)
      for (let y = 0; y < n; y++) {
        const idx = xBase + y * n + z
        re[idx] = lineRe[y]!
        im[idx] = lineIm[y]!
      }
    }
  }

  for (let yz = 0; yz < n2; yz++) {
    for (let x = 0; x < n; x++) {
      const idx = x * n2 + yz
      lineRe[x] = re[idx]!
      lineIm[x] = im[idx]!
    }
    fft1DInPlace(plan, lineRe, lineIm, inverse)
    for (let x = 0; x < n; x++) {
      const idx = x * n2 + yz
      re[idx] = lineRe[x]!
      im[idx] = lineIm[x]!
    }
  }
}

// Pruned 3D forward FFT for Hockney zero-padded input nonzero only on [0..N-1]^3 inside [0..M-1]^3
function hockneyForward3D(
  planM: FftPlan1D,
  re: Float64Array,
  im: Float64Array,
  lineRe: Float64Array,
  lineIm: Float64Array,
): void {
  const m = PAD_M
  const m2 = m * m
  const n = BOX_N

  for (let x = 0; x < n; x++) {
    const xBase = x * m2
    for (let y = 0; y < n; y++) {
      const base = xBase + y * m
      for (let z = 0; z < n; z++) {
        lineRe[z] = re[base + z]!
        lineIm[z] = im[base + z]!
      }
      for (let z = n; z < m; z++) {
        lineRe[z] = 0
        lineIm[z] = 0
      }
      fft1DInPlace(planM, lineRe, lineIm, false)
      for (let z = 0; z < m; z++) {
        re[base + z] = lineRe[z]!
        im[base + z] = lineIm[z]!
      }
    }
  }

  for (let x = 0; x < n; x++) {
    const xBase = x * m2
    for (let z = 0; z < m; z++) {
      for (let y = 0; y < n; y++) {
        const idx = xBase + y * m + z
        lineRe[y] = re[idx]!
        lineIm[y] = im[idx]!
      }
      for (let y = n; y < m; y++) {
        lineRe[y] = 0
        lineIm[y] = 0
      }
      fft1DInPlace(planM, lineRe, lineIm, false)
      for (let y = 0; y < m; y++) {
        const idx = xBase + y * m + z
        re[idx] = lineRe[y]!
        im[idx] = lineIm[y]!
      }
    }
  }

  for (let yz = 0; yz < m2; yz++) {
    for (let x = 0; x < n; x++) {
      const idx = x * m2 + yz
      lineRe[x] = re[idx]!
      lineIm[x] = im[idx]!
    }
    for (let x = n; x < m; x++) {
      lineRe[x] = 0
      lineIm[x] = 0
    }
    fft1DInPlace(planM, lineRe, lineIm, false)
    for (let x = 0; x < m; x++) {
      const idx = x * m2 + yz
      re[idx] = lineRe[x]!
      im[idx] = lineIm[x]!
    }
  }
}

// Pruned 3D inverse FFT for Hockney output needed only on [0..N-1]^3 inside [0..M-1]^3
function hockneyInverse3D(
  planM: FftPlan1D,
  re: Float64Array,
  im: Float64Array,
  lineRe: Float64Array,
  lineIm: Float64Array,
): void {
  const m = PAD_M
  const m2 = m * m
  const n = BOX_N

  for (let yz = 0; yz < m2; yz++) {
    for (let x = 0; x < m; x++) {
      const idx = x * m2 + yz
      lineRe[x] = re[idx]!
      lineIm[x] = im[idx]!
    }
    fft1DInPlace(planM, lineRe, lineIm, true)
    for (let x = 0; x < n; x++) {
      const idx = x * m2 + yz
      re[idx] = lineRe[x]!
      im[idx] = lineIm[x]!
    }
  }

  for (let x = 0; x < n; x++) {
    const xBase = x * m2
    for (let z = 0; z < m; z++) {
      for (let y = 0; y < m; y++) {
        const idx = xBase + y * m + z
        lineRe[y] = re[idx]!
        lineIm[y] = im[idx]!
      }
      fft1DInPlace(planM, lineRe, lineIm, true)
      for (let y = 0; y < n; y++) {
        const idx = xBase + y * m + z
        re[idx] = lineRe[y]!
        im[idx] = lineIm[y]!
      }
    }
  }

  for (let x = 0; x < n; x++) {
    const xBase = x * m2
    for (let y = 0; y < n; y++) {
      const base = xBase + y * m
      for (let z = 0; z < m; z++) {
        lineRe[z] = re[base + z]!
        lineIm[z] = im[base + z]!
      }
      fft1DInPlace(planM, lineRe, lineIm, true)
      for (let z = 0; z < n; z++) {
        re[base + z] = lineRe[z]!
        im[base + z] = lineIm[z]!
      }
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Exact infinite-volume (open-boundary) Green's function kernel for Hockney convolution
// -------------------------------------------------------------------------------------------------

type GravityKernel = {
  readonly label: string
  readonly model: ColumnModel
  readonly gHatReal: Float64Array // length PAD_VOL, purely real because G_open is real and even
  readonly gAlongX: readonly number[] // r = 0..12
  readonly maxImagErr: number
}

function buildOpenGravityKernel(
  label: string,
  model: ColumnModel,
  planM: FftPlan1D,
  lineRe: Float64Array,
  lineIm: Float64Array,
): GravityKernel {
  const m = PAD_M
  const m2 = m * m
  const twoPiOverM = (2 * Math.PI) / m
  const cosTable = Float64Array.from({ length: m }, (_, i) => Math.cos(twoPiOverM * i))

  const re = new Float64Array(PAD_VOL)
  const im = new Float64Array(PAD_VOL)

  for (let ix = 0; ix < m; ix++) {
    const cx = cosTable[ix]!
    for (let iy = 0; iy < m; iy++) {
      const cy = cosTable[iy]!
      const base = (ix * m + iy) * m
      for (let iz = 0; iz < m; iz++) {
        if (model.warped && ix === 0 && iy === 0 && iz === 0) {
          re[base + iz] = 0
          continue
        }
        const lam = 2 * (3 - cx - cy - cosTable[iz]!)
        re[base + iz] = 1 / schurAtLambda(model, lam)
      }
    }
  }

  fft3DInPlace(planM, re, im, true, lineRe, lineIm)

  const madelung = model.warped ? MADELUNG_C_M / (model.kEff * m) : 0
  const bgDenom = 6 * model.kEff * PAD_VOL

  for (let ix = 0; ix < m; ix++) {
    const dx = ix <= 32 ? ix : ix - m
    for (let iy = 0; iy < m; iy++) {
      const dy = iy <= 32 ? iy : iy - m
      const base = (ix * m + iy) * m
      for (let iz = 0; iz < m; iz++) {
        const dz = iz <= 32 ? iz : iz - m
        if (ix === 32 || iy === 32 || iz === 32) {
          re[base + iz] = 0
          im[base + iz] = 0
        } else {
          const gPer = re[base + iz]!
          const r2 = dx * dx + dy * dy + dz * dz
          re[base + iz] = model.warped ? gPer + madelung - r2 / bgDenom : gPer
          im[base + iz] = 0
        }
      }
    }
  }

  const gAlongX: number[] = []
  for (let r = 0; r <= 12; r++) {
    gAlongX.push(re[r * m2]!)
  }

  fft3DInPlace(planM, re, im, false, lineRe, lineIm)
  let maxImagErr = 0
  for (let i = 0; i < PAD_VOL; i++) {
    maxImagErr = Math.max(maxImagErr, Math.abs(im[i]!))
  }

  return {
    label,
    model,
    gHatReal: re,
    gAlongX,
    maxImagErr,
  }
}

// -------------------------------------------------------------------------------------------------
// Workspace buffers & Strang split-step unitary two-body Schrodinger-Poisson propagator
// -------------------------------------------------------------------------------------------------

type SimWorkspace = {
  readonly planN: FftPlan1D
  readonly planM: FftPlan1D
  readonly lineReN: Float64Array
  readonly lineImN: Float64Array
  readonly lineReM: Float64Array
  readonly lineImM: Float64Array
  readonly padRe: Float64Array
  readonly padIm: Float64Array
  readonly phi1: Float64Array
  readonly phi2: Float64Array
  readonly k1D: Float64Array
  readonly kSq3D: Float64Array
  readonly tmpRe: Float64Array
  readonly tmpIm: Float64Array
  readonly derivRe: Float64Array
  readonly derivIm: Float64Array
}

function createWorkspace(): SimWorkspace {
  const planN = createFftPlan1D(BOX_N)
  const planM = createFftPlan1D(PAD_M)
  const twoPiOverN = (2 * Math.PI) / BOX_N
  const halfN = BOX_N >> 1

  const k1D = new Float64Array(BOX_N)
  const k1DKin = new Float64Array(BOX_N)
  for (let i = 0; i < BOX_N; i++) {
    const signed = i < halfN ? i : i - BOX_N
    k1D[i] = i === halfN ? 0 : twoPiOverN * signed
    k1DKin[i] = i === halfN ? Math.PI : twoPiOverN * signed
  }

  const kSq3D = new Float64Array(BOX_VOL)
  for (let ix = 0; ix < BOX_N; ix++) {
    const kx2 = k1DKin[ix]! * k1DKin[ix]!
    for (let iy = 0; iy < BOX_N; iy++) {
      const ky2 = k1DKin[iy]! * k1DKin[iy]!
      const base = (ix * BOX_N + iy) * BOX_N
      for (let iz = 0; iz < BOX_N; iz++) {
        kSq3D[base + iz] = kx2 + ky2 + k1DKin[iz]! * k1DKin[iz]!
      }
    }
  }

  return {
    planN,
    planM,
    lineReN: new Float64Array(BOX_N),
    lineImN: new Float64Array(BOX_N),
    lineReM: new Float64Array(PAD_M),
    lineImM: new Float64Array(PAD_M),
    padRe: new Float64Array(PAD_VOL),
    padIm: new Float64Array(PAD_VOL),
    phi1: new Float64Array(BOX_VOL),
    phi2: new Float64Array(BOX_VOL),
    k1D,
    kSq3D,
    tmpRe: new Float64Array(BOX_VOL),
    tmpIm: new Float64Array(BOX_VOL),
    derivRe: new Float64Array(BOX_VOL),
    derivIm: new Float64Array(BOX_VOL),
  }
}

type TwoBodyState = {
  readonly m1: number
  readonly m2: number
  readonly psi1Re: Float64Array
  readonly psi1Im: Float64Array
  readonly psi2Re: Float64Array
  readonly psi2Im: Float64Array
}

function initGaussianWavepacket(
  x0: number,
  y0: number,
  z0: number,
  kx0: number,
  ky0: number,
  kz0: number,
  sigma: number,
): { readonly re: Float64Array; readonly im: Float64Array } {
  const re = new Float64Array(BOX_VOL)
  const im = new Float64Array(BOX_VOL)
  const inv4Sig2 = 1 / (4 * sigma * sigma)
  let normSq = 0

  for (let x = 0; x < BOX_N; x++) {
    const dx = x - CENTER - x0
    const dx2 = dx * dx
    for (let y = 0; y < BOX_N; y++) {
      const dy = y - CENTER - y0
      const dy2 = dy * dy
      const base = (x * BOX_N + y) * BOX_N
      for (let z = 0; z < BOX_N; z++) {
        const dz = z - CENTER - z0
        const env = Math.exp(-(dx2 + dy2 + dz * dz) * inv4Sig2)
        const phase = kx0 * dx + ky0 * dy + kz0 * dz
        const rv = env * Math.cos(phase)
        const iv = env * Math.sin(phase)
        re[base + z] = rv
        im[base + z] = iv
        normSq += rv * rv + iv * iv
      }
    }
  }

  const invNorm = 1 / Math.sqrt(normSq)
  for (let i = 0; i < BOX_VOL; i++) {
    re[i] = re[i]! * invNorm
    im[i] = im[i]! * invNorm
  }

  return { re, im }
}

function initPeriodicGaussianWavepacket(
  x0: number,
  y0: number,
  z0: number,
  sigma: number,
): { readonly re: Float64Array; readonly im: Float64Array } {
  const re = new Float64Array(BOX_VOL)
  const im = new Float64Array(BOX_VOL)
  const inv4Sig2 = 1 / (4 * sigma * sigma)
  let normSq = 0

  for (let x = 0; x < BOX_N; x++) {
    let envX = 0
    for (let sx = -1; sx <= 1; sx++) {
      const dx = x - CENTER - x0 + sx * BOX_N
      envX += Math.exp(-dx * dx * inv4Sig2)
    }
    for (let y = 0; y < BOX_N; y++) {
      let envY = 0
      for (let sy = -1; sy <= 1; sy++) {
        const dy = y - CENTER - y0 + sy * BOX_N
        envY += Math.exp(-dy * dy * inv4Sig2)
      }
      const envXY = envX * envY
      const base = (x * BOX_N + y) * BOX_N
      for (let z = 0; z < BOX_N; z++) {
        let envZ = 0
        for (let sz = -1; sz <= 1; sz++) {
          const dz = z - CENTER - z0 + sz * BOX_N
          envZ += Math.exp(-dz * dz * inv4Sig2)
        }
        const rv = envXY * envZ
        re[base + z] = rv
        normSq += rv * rv
      }
    }
  }

  const invNorm = 1 / Math.sqrt(normSq)
  for (let i = 0; i < BOX_VOL; i++) {
    re[i] = re[i]! * invNorm
  }

  return { re, im }
}

function createTwoBodyState(
  m1: number,
  m2: number,
  pos1: readonly [number, number, number],
  pos2: readonly [number, number, number],
  k1: readonly [number, number, number],
  k2: readonly [number, number, number],
  sigma: number,
): TwoBodyState {
  const w1 = initGaussianWavepacket(pos1[0], pos1[1], pos1[2], k1[0], k1[1], k1[2], sigma)
  const w2 = initGaussianWavepacket(pos2[0], pos2[1], pos2[2], k2[0], k2[1], k2[2], sigma)
  return {
    m1,
    m2,
    psi1Re: w1.re,
    psi1Im: w1.im,
    psi2Re: w2.re,
    psi2Im: w2.im,
  }
}

// Compute live open-boundary gravitational potentials Phi_1 (from rho_2) and Phi_2 (from rho_1)
// in ONE complex pruned Hockney 64^3 FFT pair:
//   Z(x) = rho_1(x) + i rho_2(x) -> (G_open * Z)(x) = (G_open * rho_1)(x) + i (G_open * rho_2)(x)
function computePotentials(
  ws: SimWorkspace,
  kernel: GravityKernel,
  state: TwoBodyState,
): void {
  const { padRe, padIm, phi1, phi2, planM, lineReM, lineImM } = ws
  const { psi1Re, psi1Im, psi2Re, psi2Im, m1, m2 } = state
  const m = PAD_M
  const m2Pad = m * m

  for (let x = 0; x < BOX_N; x++) {
    const xBasePad = x * m2Pad
    const xBaseBox = x * BOX_N * BOX_N
    for (let y = 0; y < BOX_N; y++) {
      const basePad = xBasePad + y * m
      const baseBox = xBaseBox + y * BOX_N
      for (let z = 0; z < BOX_N; z++) {
        const b = baseBox + z
        const r1 = psi1Re[b]!
        const i1 = psi1Im[b]!
        const r2 = psi2Re[b]!
        const i2 = psi2Im[b]!
        padRe[basePad + z] = r1 * r1 + i1 * i1
        padIm[basePad + z] = r2 * r2 + i2 * i2
      }
    }
  }

  hockneyForward3D(planM, padRe, padIm, lineReM, lineImM)

  const gHat = kernel.gHatReal
  for (let i = 0; i < PAD_VOL; i++) {
    const g = gHat[i]!
    padRe[i] = padRe[i]! * g
    padIm[i] = padIm[i]! * g
  }

  hockneyInverse3D(planM, padRe, padIm, lineReM, lineImM)

  for (let x = 0; x < BOX_N; x++) {
    const xBasePad = x * m2Pad
    const xBaseBox = x * BOX_N * BOX_N
    for (let y = 0; y < BOX_N; y++) {
      const basePad = xBasePad + y * m
      const baseBox = xBaseBox + y * BOX_N
      for (let z = 0; z < BOX_N; z++) {
        const b = baseBox + z
        phi1[b] = -m2 * padIm[basePad + z]!
        phi2[b] = -m1 * padRe[basePad + z]!
      }
    }
  }
}

function applyKineticPhase(
  ws: SimWorkspace,
  re: Float64Array,
  im: Float64Array,
  mass: number,
  dt: number,
): void {
  const { planN, lineReN, lineImN, kSq3D } = ws
  fft3DInPlace(planN, re, im, false, lineReN, lineImN)
  const coeff = -dt / (2 * mass)
  for (let i = 0; i < BOX_VOL; i++) {
    const ang = coeff * kSq3D[i]!
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    const rv = re[i]!
    const iv = im[i]!
    re[i] = c * rv - s * iv
    im[i] = c * iv + s * rv
  }
  fft3DInPlace(planN, re, im, true, lineReN, lineImN)
}

function applyPotentialPhase(
  re: Float64Array,
  im: Float64Array,
  phi: Float64Array,
  mass: number,
  dt: number,
): void {
  const coeff = -dt * mass
  for (let i = 0; i < BOX_VOL; i++) {
    const ang = coeff * phi[i]!
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    const rv = re[i]!
    const iv = im[i]!
    re[i] = c * rv - s * iv
    im[i] = c * iv + s * rv
  }
}

// Multi-step strictly unitary, exactly time-reversible Strang split-step propagator:
//   U(dt)^steps = [exp(-i dt/2 T) exp(-i dt m Phi) exp(-i dt/2 T)]^steps
// merging interior kinetic half-steps (exact algebraic identity, halves kinetic FFTs)
function evolveStrangBlock(
  ws: SimWorkspace,
  kernel: GravityKernel,
  state: TwoBodyState,
  dt: number,
  steps: number,
): void {
  if (steps <= 0) return
  const halfDt = 0.5 * dt
  applyKineticPhase(ws, state.psi1Re, state.psi1Im, state.m1, halfDt)
  applyKineticPhase(ws, state.psi2Re, state.psi2Im, state.m2, halfDt)

  for (let s = 0; s < steps; s++) {
    computePotentials(ws, kernel, state)
    applyPotentialPhase(state.psi1Re, state.psi1Im, ws.phi1, state.m1, dt)
    applyPotentialPhase(state.psi2Re, state.psi2Im, ws.phi2, state.m2, dt)
    const kinDt = s === steps - 1 ? halfDt : dt
    applyKineticPhase(ws, state.psi1Re, state.psi1Im, state.m1, kinDt)
    applyKineticPhase(ws, state.psi2Re, state.psi2Im, state.m2, kinDt)
  }
}

// -------------------------------------------------------------------------------------------------
// Exact observables: centroids, norms, spectral momenta, exact quantum <L_z>, and total energy
// -------------------------------------------------------------------------------------------------

function measureCentroidsOnly(state: TwoBodyState): {
  readonly norm1: number
  readonly norm2: number
  readonly x1: number
  readonly y1: number
  readonly z1: number
  readonly x2: number
  readonly y2: number
  readonly z2: number
  readonly sep: number
} {
  let n1 = 0
  let sx1 = 0
  let sy1 = 0
  let sz1 = 0
  let n2 = 0
  let sx2 = 0
  let sy2 = 0
  let sz2 = 0

  const { psi1Re, psi1Im, psi2Re, psi2Im } = state
  for (let x = 0; x < BOX_N; x++) {
    const cx = x - CENTER
    for (let y = 0; y < BOX_N; y++) {
      const cy = y - CENTER
      const base = (x * BOX_N + y) * BOX_N
      for (let z = 0; z < BOX_N; z++) {
        const idx = base + z
        const cz = z - CENTER
        const p1 = psi1Re[idx]! * psi1Re[idx]! + psi1Im[idx]! * psi1Im[idx]!
        const p2 = psi2Re[idx]! * psi2Re[idx]! + psi2Im[idx]! * psi2Im[idx]!
        n1 += p1
        sx1 += cx * p1
        sy1 += cy * p1
        sz1 += cz * p1
        n2 += p2
        sx2 += cx * p2
        sy2 += cy * p2
        sz2 += cz * p2
      }
    }
  }

  const x1 = sx1 / n1
  const y1 = sy1 / n1
  const z1 = sz1 / n1
  const x2 = sx2 / n2
  const y2 = sy2 / n2
  const z2 = sz2 / n2

  return {
    norm1: n1,
    norm2: n2,
    x1,
    y1,
    z1,
    x2,
    y2,
    z2,
    sep: Math.hypot(x2 - x1, y2 - y1, z2 - z1),
  }
}

type BodyObservables = {
  readonly norm: number
  readonly x: number
  readonly y: number
  readonly z: number
  readonly px: number
  readonly py: number
  readonly pz: number
  readonly kineticEnergy: number
  readonly lzQuantum: number
}

function measureBody(
  ws: SimWorkspace,
  re: Float64Array,
  im: Float64Array,
  mass: number,
  computeQuantumLz: boolean,
  comX = 0,
  comY = 0,
): BodyObservables {
  let norm = 0
  let sx = 0
  let sy = 0
  let sz = 0

  for (let x = 0; x < BOX_N; x++) {
    const cx = x - CENTER
    for (let y = 0; y < BOX_N; y++) {
      const cy = y - CENTER
      const base = (x * BOX_N + y) * BOX_N
      for (let z = 0; z < BOX_N; z++) {
        const idx = base + z
        const rv = re[idx]!
        const iv = im[idx]!
        const p = rv * rv + iv * iv
        norm += p
        sx += cx * p
        sy += cy * p
        sz += (z - CENTER) * p
      }
    }
  }

  const { tmpRe, tmpIm, derivRe, derivIm, planN, lineReN, lineImN, k1D, kSq3D } = ws
  tmpRe.set(re)
  tmpIm.set(im)
  fft3DInPlace(planN, tmpRe, tmpIm, false, lineReN, lineImN)

  let px = 0
  let py = 0
  let pz = 0
  let kin = 0
  const invVol = 1 / BOX_VOL

  for (let ix = 0; ix < BOX_N; ix++) {
    const kx = k1D[ix]!
    for (let iy = 0; iy < BOX_N; iy++) {
      const ky = k1D[iy]!
      const base = (ix * BOX_N + iy) * BOX_N
      for (let iz = 0; iz < BOX_N; iz++) {
        const idx = base + iz
        const rv = tmpRe[idx]!
        const iv = tmpIm[idx]!
        const w = (rv * rv + iv * iv) * invVol
        px += kx * w
        py += ky * w
        pz += k1D[iz]! * w
        kin += kSq3D[idx]! * w
      }
    }
  }

  let lzQuantum = 0
  if (computeQuantumLz) {
    // Exact quantum operator expectation <psi | (x - comX) p_y - (y - comY) p_x | psi>
    // Term 1: (p_y psi) = IFFT(k_y * psi_hat)
    for (let ix = 0; ix < BOX_N; ix++) {
      for (let iy = 0; iy < BOX_N; iy++) {
        const ky = k1D[iy]!
        const base = (ix * BOX_N + iy) * BOX_N
        for (let iz = 0; iz < BOX_N; iz++) {
          const idx = base + iz
          derivRe[idx] = ky * tmpRe[idx]!
          derivIm[idx] = ky * tmpIm[idx]!
        }
      }
    }
    fft3DInPlace(planN, derivRe, derivIm, true, lineReN, lineImN)
    for (let x = 0; x < BOX_N; x++) {
      const rx = x - CENTER - comX
      const xBase = x * BOX_N * BOX_N
      for (let y = 0; y < BOX_N; y++) {
        const base = xBase + y * BOX_N
        for (let z = 0; z < BOX_N; z++) {
          const idx = base + z
          lzQuantum += rx * (re[idx]! * derivRe[idx]! + im[idx]! * derivIm[idx]!)
        }
      }
    }

    // Term 2: -(p_x psi) = -IFFT(k_x * psi_hat)
    for (let ix = 0; ix < BOX_N; ix++) {
      const kx = k1D[ix]!
      for (let iy = 0; iy < BOX_N; iy++) {
        const base = (ix * BOX_N + iy) * BOX_N
        for (let iz = 0; iz < BOX_N; iz++) {
          const idx = base + iz
          derivRe[idx] = kx * tmpRe[idx]!
          derivIm[idx] = kx * tmpIm[idx]!
        }
      }
    }
    fft3DInPlace(planN, derivRe, derivIm, true, lineReN, lineImN)
    for (let x = 0; x < BOX_N; x++) {
      const xBase = x * BOX_N * BOX_N
      for (let y = 0; y < BOX_N; y++) {
        const ry = y - CENTER - comY
        const base = xBase + y * BOX_N
        for (let z = 0; z < BOX_N; z++) {
          const idx = base + z
          lzQuantum -= ry * (re[idx]! * derivRe[idx]! + im[idx]! * derivIm[idx]!)
        }
      }
    }
    lzQuantum /= norm
  }

  return {
    norm,
    x: sx / norm,
    y: sy / norm,
    z: sz / norm,
    px: px / norm,
    py: py / norm,
    pz: pz / norm,
    kineticEnergy: kin / (2 * mass * norm),
    lzQuantum,
  }
}

type TwoBodySnapshot = {
  readonly b1: BodyObservables
  readonly b2: BodyObservables
  readonly sep: number
  readonly comX: number
  readonly comY: number
  readonly comZ: number
  readonly totalPx: number
  readonly totalPy: number
  readonly totalPz: number
  readonly lzQuantumTotal: number
  readonly interactionEnergy: number
  readonly potentialReciprocityErr: number
  readonly totalEnergy: number
}

function measureTwoBody(
  ws: SimWorkspace,
  kernel: GravityKernel,
  state: TwoBodyState,
  needEnergy: boolean,
  needQuantumLz: boolean,
): TwoBodySnapshot {
  const b1 = measureBody(ws, state.psi1Re, state.psi1Im, state.m1, needQuantumLz, 0, 0)
  const b2 = measureBody(ws, state.psi2Re, state.psi2Im, state.m2, needQuantumLz, 0, 0)

  let eInt1 = 0
  let reciprocityErr = 0
  if (needEnergy) {
    computePotentials(ws, kernel, state)
    let eInt2 = 0
    for (let i = 0; i < BOX_VOL; i++) {
      const rho1 = state.psi1Re[i]! * state.psi1Re[i]! + state.psi1Im[i]! * state.psi1Im[i]!
      const rho2 = state.psi2Re[i]! * state.psi2Re[i]! + state.psi2Im[i]! * state.psi2Im[i]!
      eInt1 += state.m1 * rho1 * ws.phi1[i]!
      eInt2 += state.m2 * rho2 * ws.phi2[i]!
    }
    reciprocityErr = Math.abs(eInt1 - eInt2)
  }

  const mTot = state.m1 + state.m2
  const dx = b2.x - b1.x
  const dy = b2.y - b1.y
  const dz = b2.z - b1.z
  const sep = Math.hypot(dx, dy, dz)

  const comX = (state.m1 * b1.x + state.m2 * b2.x) / mTot
  const comY = (state.m1 * b1.y + state.m2 * b2.y) / mTot
  const comZ = (state.m1 * b1.z + state.m2 * b2.z) / mTot

  // Shift L_z from origin (0,0) to COM: L_z(COM) = L_z(0) - (comX * P_y - comY * P_x)
  const totalPx = b1.px + b2.px
  const totalPy = b1.py + b2.py
  const totalPz = b1.pz + b2.pz
  const lzQuantumTotal = needQuantumLz
    ? b1.lzQuantum + b2.lzQuantum - (comX * totalPy - comY * totalPx)
    : 0

  return {
    b1,
    b2,
    sep,
    comX,
    comY,
    comZ,
    totalPx,
    totalPy,
    totalPz,
    lzQuantumTotal,
    interactionEnergy: eInt1,
    potentialReciprocityErr: reciprocityErr,
    totalEnergy: b1.kineticEnergy + b2.kineticEnergy + eInt1,
  }
}

function fitLogLogSlope(xs: readonly number[], ys: readonly number[]): number {
  const n = xs.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    const lx = Math.log(xs[i]!)
    const ly = Math.log(Math.max(1e-300, ys[i]!))
    sx += lx
    sy += ly
    sxx += lx * lx
    sxy += lx * ly
  }
  return (n * sxy - sx * sy) / (n * sxx - sx * sx)
}

// Fit r(t) - r_0 = c2 * t^2 + c4 * t^4 (zero initial velocity) -> initial acceleration a_0 = 2 * c2
function fitInitialAcceleration(ts: readonly number[], drs: readonly number[]): number {
  let s4 = 0
  let s6 = 0
  let s8 = 0
  let b2 = 0
  let b4 = 0
  for (let i = 0; i < ts.length; i++) {
    const t2 = ts[i]! * ts[i]!
    const t4 = t2 * t2
    const dr = drs[i]!
    s4 += t4
    s6 += t4 * t2
    s8 += t4 * t4
    b2 += t2 * dr
    b4 += t4 * dr
  }
  const det = s4 * s8 - s6 * s6
  const c2 = (s8 * b2 - s6 * b4) / det
  return 2 * c2
}

// -------------------------------------------------------------------------------------------------
// Result types
// -------------------------------------------------------------------------------------------------

export type RadialInfallSample = {
  readonly r0: number
  readonly rEnd: number
  readonly deltaR: number
  readonly a12Traj: number
  readonly a12Momentum: number
  readonly gDyn: number
  readonly gDynRelErr: number
  readonly maxNormErr: number
  readonly maxMomentumSumErr: number
  readonly maxComDrift: number
}

export type TwoBodyDynamicalGravityResult = {
  // Exact parameter-free {3,4,3,4} reference constants from E-GRV-0157 & E-RLT-0125
  readonly kEff: number
  readonly gEff: number
  readonly cUniversal: number
  readonly kernelMaxImagErr: number
  readonly kernelContinuumFlatnessR6to10: number
  readonly potentialReciprocityMaxErr: number

  // Test 1A: Radial infall & inverse-square law (r_0 = 5..10) + macroscopic collapse + unequal-mass N3L + time reversal
  readonly infallSamples: readonly RadialInfallSample[]
  readonly allAttractive: boolean
  readonly inverseSquareSlopeR5to10: number
  readonly inverseSquareSlopeR6to10: number
  readonly gDynMeanR6to10: number
  readonly gDynMeanRelErrR6to10: number
  readonly gDynMaxRelErrR6to10: number
  readonly showcaseR0: number
  readonly showcaseREnd: number
  readonly showcaseShrinkage: number
  readonly showcaseEnergyRelDrift: number
  readonly showcaseMaxSpeedOverC: number
  readonly unequalMassAccelRatio: number // expected -m2/m1 = -2.000 (open-boundary Hockney)
  readonly unequalMassAccelRatioErr: number
  readonly unequalMassOpenMomentumSumErr: number
  readonly unequalMassOpenComDrift: number
  readonly unequalMassPeriodicAccelRatioErr: number // exact translation-invariant T^3 {3,4,3,4} N3L check
  readonly unequalMassPeriodicMomentumSumErr: number
  readonly unequalMassPeriodicComDrift: number
  readonly maxNormErrAll: number
  readonly maxMomentumSumErrAll: number
  readonly maxComDriftAll: number
  readonly timeReversalCentroidErr: number
  readonly timeReversalStateOverlapErr: number

  // Test 1B: Bound orbital motion & gravitational flyby deflection
  readonly orbitR0: number
  readonly orbitRMin: number
  readonly orbitRMax: number
  readonly orbitAngleSweptRad: number
  readonly orbitOmegaTheory: number
  readonly orbitOmegaMeasuredEarly: number
  readonly orbitOmegaMeasuredFull: number
  readonly orbitOmegaEarlyRelErr: number
  readonly orbitLzInitial: number
  readonly orbitLzQuantumRelDrift: number
  readonly orbitMaxSpeedOverC: number
  readonly orbitEnergyRelDrift: number
  readonly flybyImpactB: number
  readonly flybyVRel: number
  readonly flybyDeflectionRad: number
  readonly flybyTheoryWeakInfRad: number
  readonly flybyTheoryFiniteRad: number
  readonly flybyTheoryExactHypRad: number
  readonly flybyFiniteRelErr: number
  readonly flybyInfRelErr: number
  readonly flybyMaxSpeedOverC: number

  // Test 1C: Negative control (raw unwarped bulk screened gravity w(D) = 1, F = 12)
  readonly rawAccelR6: number
  readonly rawAccelR8: number
  readonly rawToWarpAccelRatioR6: number
  readonly rawToWarpAccelRatioR8: number
  readonly rawOrbitREnd: number
  readonly rawOrbitFreeStraightREnd: number
  readonly rawOrbitExpansionRatio: number // r_end / r_0
  readonly rawFlybyDeflectionRad: number
  readonly rawToWarpFlybyRatio: number
}

// Exact periodic 32^3 {3,4,3,4} warped cusp potential (exact discrete translation symmetry on T^3,
// used to verify non-symmetric unequal-mass Newton's 3rd law to machine precision without seam jumps)
function buildPeriodicKernel32(model: ColumnModel): Float64Array {
  const twoPiOverN = (2 * Math.PI) / BOX_N
  const cosTable = Float64Array.from({ length: BOX_N }, (_, i) => Math.cos(twoPiOverN * i))
  const gHat = new Float64Array(BOX_VOL)
  for (let ix = 0; ix < BOX_N; ix++) {
    const cx = cosTable[ix]!
    for (let iy = 0; iy < BOX_N; iy++) {
      const cy = cosTable[iy]!
      const base = (ix * BOX_N + iy) * BOX_N
      for (let iz = 0; iz < BOX_N; iz++) {
        if (ix === 0 && iy === 0 && iz === 0) {
          gHat[base + iz] = 0
          continue
        }
        const lam = 2 * (3 - cx - cy - cosTable[iz]!)
        gHat[base + iz] = 1 / schurAtLambda(model, lam)
      }
    }
  }
  return gHat
}

function computePotentialsPeriodic32(
  ws: SimWorkspace,
  gHat32: Float64Array,
  state: TwoBodyState,
): void {
  const { tmpRe, tmpIm, phi1, phi2, planN, lineReN, lineImN } = ws
  const { psi1Re, psi1Im, psi2Re, psi2Im, m1, m2 } = state
  for (let i = 0; i < BOX_VOL; i++) {
    tmpRe[i] = psi1Re[i]! * psi1Re[i]! + psi1Im[i]! * psi1Im[i]!
    tmpIm[i] = psi2Re[i]! * psi2Re[i]! + psi2Im[i]! * psi2Im[i]!
  }
  fft3DInPlace(planN, tmpRe, tmpIm, false, lineReN, lineImN)
  for (let i = 0; i < BOX_VOL; i++) {
    const g = gHat32[i]!
    tmpRe[i] = tmpRe[i]! * g
    tmpIm[i] = tmpIm[i]! * g
  }
  fft3DInPlace(planN, tmpRe, tmpIm, true, lineReN, lineImN)
  for (let i = 0; i < BOX_VOL; i++) {
    phi1[i] = -m2 * tmpIm[i]!
    phi2[i] = -m1 * tmpRe[i]!
  }
}

function evolveStrangBlockPeriodic32(
  ws: SimWorkspace,
  gHat32: Float64Array,
  state: TwoBodyState,
  dt: number,
  steps: number,
): void {
  if (steps <= 0) return
  const halfDt = 0.5 * dt
  applyKineticPhase(ws, state.psi1Re, state.psi1Im, state.m1, halfDt)
  applyKineticPhase(ws, state.psi2Re, state.psi2Im, state.m2, halfDt)

  for (let s = 0; s < steps; s++) {
    computePotentialsPeriodic32(ws, gHat32, state)
    applyPotentialPhase(state.psi1Re, state.psi1Im, ws.phi1, state.m1, dt)
    applyPotentialPhase(state.psi2Re, state.psi2Im, ws.phi2, state.m2, dt)
    const kinDt = s === steps - 1 ? halfDt : dt
    applyKineticPhase(ws, state.psi1Re, state.psi1Im, state.m1, kinDt)
    applyKineticPhase(ws, state.psi2Re, state.psi2Im, state.m2, kinDt)
  }
}

// -------------------------------------------------------------------------------------------------
// Main runner
// -------------------------------------------------------------------------------------------------

export function runTwoBodyDynamicalGravity(): TwoBodyDynamicalGravityResult {
  const ws = createWorkspace()

  const warpedModel = buildColumnModel(16, true)
  const rawModel = buildColumnModel(12, false)
  const colSpeed = buildWarpedColumnData(16)

  const kEff = warpedModel.kEff
  const gEff = warpedModel.gEff
  const cUniversal = colSpeed.cUniversal

  const warpKernel = buildOpenGravityKernel(
    'warped-3434-F16',
    warpedModel,
    ws.planM,
    ws.lineReM,
    ws.lineImM,
  )
  const rawKernel = buildOpenGravityKernel(
    'raw-bulk-3434-F12',
    rawModel,
    ws.planM,
    ws.lineReM,
    ws.lineImM,
  )

  const kernelMaxImagErr = Math.max(warpKernel.maxImagErr, rawKernel.maxImagErr)

  let kernelContinuumFlatnessR6to10 = 0
  for (let r = 6; r <= 10; r++) {
    const prod = 4 * Math.PI * kEff * r * warpKernel.gAlongX[r]!
    kernelContinuumFlatnessR6to10 = Math.max(kernelContinuumFlatnessR6to10, Math.abs(prod - 1))
  }

  let maxNormErrAll = 0
  let maxMomentumSumErrAll = 0
  let maxComDriftAll = 0
  let potentialReciprocityMaxErr = 0

  const trackInvariants = (snap: TwoBodySnapshot, com0: readonly [number, number, number]): void => {
    maxNormErrAll = Math.max(
      maxNormErrAll,
      Math.abs(snap.b1.norm - 1),
      Math.abs(snap.b2.norm - 1),
    )
    maxMomentumSumErrAll = Math.max(
      maxMomentumSumErrAll,
      Math.hypot(snap.totalPx, snap.totalPy, snap.totalPz),
    )
    maxComDriftAll = Math.max(
      maxComDriftAll,
      Math.hypot(snap.comX - com0[0], snap.comY - com0[1], snap.comZ - com0[2]),
    )
    potentialReciprocityMaxErr = Math.max(
      potentialReciprocityMaxErr,
      snap.potentialReciprocityErr,
    )
  }

  // -----------------------------------------------------------------------------------------------
  // TEST 1A: Radial Infall & Inverse-Square Law across r_0 = 5, 6, 7, 8, 9, 10
  // -----------------------------------------------------------------------------------------------
  const infallMass = 6.0
  const infallSigma = 1.15
  const infallDt = 0.5
  const infallSteps = 6 // T = 3.0 beats per separation (clean early acceleration + shrinkage)
  const rs = [5, 6, 7, 8, 9, 10] as const
  const infallSamples: RadialInfallSample[] = []

  for (const r0 of rs) {
    const state = createTwoBodyState(
      infallMass,
      infallMass,
      [-r0 / 2, 0, 0],
      [r0 / 2, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      infallSigma,
    )
    const snap0 = measureTwoBody(ws, warpKernel, state, r0 === 7, false)
    const com0: [number, number, number] = [snap0.comX, snap0.comY, snap0.comZ]
    trackInvariants(snap0, com0)

    const ts: number[] = []
    const drs: number[] = []
    let a12Momentum = 0
    let maxNormErr = Math.max(Math.abs(snap0.b1.norm - 1), Math.abs(snap0.b2.norm - 1))
    let maxMomentumSumErr = Math.hypot(snap0.totalPx, snap0.totalPy, snap0.totalPz)
    let maxComDrift = 0
    let rEnd = snap0.sep

    for (let s = 1; s <= infallSteps; s++) {
      evolveStrangBlock(ws, warpKernel, state, infallDt, 1)
      const t = s * infallDt
      if (s === 2 || s === infallSteps) {
        const snap = measureTwoBody(ws, warpKernel, state, false, false)
        trackInvariants(snap, com0)
        ts.push(t)
        drs.push(snap.sep - snap0.sep)
        rEnd = snap.sep
        if (s === 2) {
          a12Momentum = (snap.b2.px / state.m2 - snap.b1.px / state.m1) / t
        }
        maxNormErr = Math.max(
          maxNormErr,
          Math.abs(snap.b1.norm - 1),
          Math.abs(snap.b2.norm - 1),
        )
        maxMomentumSumErr = Math.max(
          maxMomentumSumErr,
          Math.hypot(snap.totalPx, snap.totalPy, snap.totalPz),
        )
        maxComDrift = Math.max(
          maxComDrift,
          Math.hypot(snap.comX - com0[0], snap.comY - com0[1], snap.comZ - com0[2]),
        )
      } else {
        const c = measureCentroidsOnly(state)
        ts.push(t)
        drs.push(c.sep - snap0.sep)
        rEnd = c.sep
        maxNormErr = Math.max(maxNormErr, Math.abs(c.norm1 - 1), Math.abs(c.norm2 - 1))
      }
    }

    const a12Traj = fitInitialAcceleration(ts, drs)
    const gDyn = (-a12Traj * r0 * r0) / (2 * infallMass)
    const gDynRelErr = Math.abs(gDyn - gEff) / gEff

    infallSamples.push({
      r0,
      rEnd,
      deltaR: rEnd - snap0.sep,
      a12Traj,
      a12Momentum,
      gDyn,
      gDynRelErr,
      maxNormErr,
      maxMomentumSumErr,
      maxComDrift,
    })
  }

  const allAttractive = infallSamples.every(s => s.a12Traj < 0 && s.deltaR < 0)
  const inverseSquareSlopeR5to10 = fitLogLogSlope(
    infallSamples.map(s => s.r0),
    infallSamples.map(s => Math.abs(s.a12Traj)),
  )
  const samplesR6to10 = infallSamples.filter(s => s.r0 >= 6)
  const inverseSquareSlopeR6to10 = fitLogLogSlope(
    samplesR6to10.map(s => s.r0),
    samplesR6to10.map(s => Math.abs(s.a12Traj)),
  )
  const gDynMeanR6to10 =
    samplesR6to10.reduce((acc, s) => acc + s.gDyn, 0) / samplesR6to10.length
  const gDynMeanRelErrR6to10 = Math.abs(gDynMeanR6to10 - gEff) / gEff
  const gDynMaxRelErrR6to10 = Math.max(...samplesR6to10.map(s => s.gDynRelErr))

  // Macroscopic radial infall showcase (r_0 = 7.5, 20 forward steps of dt = 0.6 -> T = 12.0 beats)
  // followed by exact time-reversal U(-dt)^20
  const showcaseR0 = 7.5
  const showcaseSteps = 20
  const showcaseDt = 0.6
  const showcaseState = createTwoBodyState(
    infallMass,
    infallMass,
    [-showcaseR0 / 2, 0, 0],
    [showcaseR0 / 2, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    1.25,
  )
  const psi1InitRe = Float64Array.from(showcaseState.psi1Re)
  const psi1InitIm = Float64Array.from(showcaseState.psi1Im)
  const psi2InitRe = Float64Array.from(showcaseState.psi2Re)
  const psi2InitIm = Float64Array.from(showcaseState.psi2Im)

  const showSnap0 = measureTwoBody(ws, warpKernel, showcaseState, true, false)
  const showCom0: [number, number, number] = [showSnap0.comX, showSnap0.comY, showSnap0.comZ]
  trackInvariants(showSnap0, showCom0)

  let showcaseEnergyRelDrift = 0
  let showcaseMaxSpeedOverC = 0

  for (let b = 0; b < 4; b++) {
    evolveStrangBlock(ws, warpKernel, showcaseState, showcaseDt, 5)
    const snap = measureTwoBody(ws, warpKernel, showcaseState, true, false)
    trackInvariants(snap, showCom0)
    showcaseEnergyRelDrift = Math.max(
      showcaseEnergyRelDrift,
      Math.abs(snap.totalEnergy - showSnap0.totalEnergy) / Math.abs(showSnap0.interactionEnergy),
    )
    const v1 = Math.hypot(snap.b1.px, snap.b1.py, snap.b1.pz) / showcaseState.m1
    const v2 = Math.hypot(snap.b2.px, snap.b2.py, snap.b2.pz) / showcaseState.m2
    showcaseMaxSpeedOverC = Math.max(showcaseMaxSpeedOverC, Math.max(v1, v2) / cUniversal)
  }

  const showSnapMid = measureTwoBody(ws, warpKernel, showcaseState, false, false)
  const showcaseREnd = showSnapMid.sep
  const showcaseShrinkage = showSnap0.sep - showcaseREnd

  // Exact time-reversal: apply U(-dt)^showcaseSteps
  evolveStrangBlock(ws, warpKernel, showcaseState, -showcaseDt, showcaseSteps)
  const showSnapRev = measureTwoBody(ws, warpKernel, showcaseState, false, false)
  trackInvariants(showSnapRev, showCom0)

  const timeReversalCentroidErr = Math.max(
    Math.hypot(
      showSnapRev.b1.x - showSnap0.b1.x,
      showSnapRev.b1.y - showSnap0.b1.y,
      showSnapRev.b1.z - showSnap0.b1.z,
    ),
    Math.hypot(
      showSnapRev.b2.x - showSnap0.b2.x,
      showSnapRev.b2.y - showSnap0.b2.y,
      showSnapRev.b2.z - showSnap0.b2.z,
    ),
  )

  let ov1Re = 0
  let ov1Im = 0
  let ov2Re = 0
  let ov2Im = 0
  for (let i = 0; i < BOX_VOL; i++) {
    ov1Re += psi1InitRe[i]! * showcaseState.psi1Re[i]! + psi1InitIm[i]! * showcaseState.psi1Im[i]!
    ov1Im += psi1InitRe[i]! * showcaseState.psi1Im[i]! - psi1InitIm[i]! * showcaseState.psi1Re[i]!
    ov2Re += psi2InitRe[i]! * showcaseState.psi2Re[i]! + psi2InitIm[i]! * showcaseState.psi2Im[i]!
    ov2Im += psi2InitRe[i]! * showcaseState.psi2Im[i]! - psi2InitIm[i]! * showcaseState.psi2Re[i]!
  }
  const timeReversalStateOverlapErr = Math.max(
    Math.abs(1 - Math.hypot(ov1Re, ov1Im)),
    Math.abs(1 - Math.hypot(ov2Re, ov2Im)),
  )

  // Non-trivial Newton's 3rd law test with UNEQUAL masses (m_1 = 4, m_2 = 8, asymmetric positions, no mirror symmetry):
  // (a) Open-boundary Hockney 64^3 check (verifies a_1/a_2 = -m_2/m_1 to ~2e-9; seam-limited momentum err ~2.5e-9)
  const unequalM1 = 4.0
  const unequalM2 = 8.0
  const unequalState = createTwoBodyState(
    unequalM1,
    unequalM2,
    [-3.5, 0.25, -0.25],
    [3.5, 0.25, -0.25],
    [0, 0, 0],
    [0, 0, 0],
    1.95,
  )
  const unSnap0 = measureTwoBody(ws, warpKernel, unequalState, true, false)
  const unCom0: [number, number, number] = [unSnap0.comX, unSnap0.comY, unSnap0.comZ]
  maxNormErrAll = Math.max(
    maxNormErrAll,
    Math.abs(unSnap0.b1.norm - 1),
    Math.abs(unSnap0.b2.norm - 1),
  )
  potentialReciprocityMaxErr = Math.max(
    potentialReciprocityMaxErr,
    unSnap0.potentialReciprocityErr,
  )

  evolveStrangBlock(ws, warpKernel, unequalState, 0.5, 8)
  const unSnap1 = measureTwoBody(ws, warpKernel, unequalState, true, false)
  maxNormErrAll = Math.max(
    maxNormErrAll,
    Math.abs(unSnap1.b1.norm - 1),
    Math.abs(unSnap1.b2.norm - 1),
  )
  potentialReciprocityMaxErr = Math.max(
    potentialReciprocityMaxErr,
    unSnap1.potentialReciprocityErr,
  )

  const unequalMassOpenMomentumSumErr = Math.max(
    Math.hypot(unSnap0.totalPx, unSnap0.totalPy, unSnap0.totalPz),
    Math.hypot(unSnap1.totalPx, unSnap1.totalPy, unSnap1.totalPz),
  )
  const unequalMassOpenComDrift = Math.hypot(
    unSnap1.comX - unCom0[0],
    unSnap1.comY - unCom0[1],
    unSnap1.comZ - unCom0[2],
  )
  const a1xUnequal = unSnap1.b1.px / unequalM1
  const a2xUnequal = unSnap1.b2.px / unequalM2
  const unequalMassAccelRatio = a1xUnequal / a2xUnequal
  const unequalMassAccelRatioErr = Math.abs(unequalMassAccelRatio + unequalM2 / unequalM1)

  // (b) Exact translation-invariant periodic T^3 {3,4,3,4} kernel check for unequal masses at asymmetric positions
  //     (periodic Gaussian with sigma = 2.5 -> Nyquist rho_hat(pi) ~ 4e-14 -> exact Noether |p1+p2| <= 1e-13!)
  const gHatPeriodic32 = buildPeriodicKernel32(warpedModel)
  const uw1 = initPeriodicGaussianWavepacket(-4.5, 0.5, -0.5, 2.5)
  const uw2 = initPeriodicGaussianWavepacket(2.5, 0.5, -0.5, 2.5)
  const unequalPerState: TwoBodyState = {
    m1: unequalM1,
    m2: unequalM2,
    psi1Re: uw1.re,
    psi1Im: uw1.im,
    psi2Re: uw2.re,
    psi2Im: uw2.im,
  }
  const unPer0 = measureTwoBody(ws, warpKernel, unequalPerState, false, false)
  maxNormErrAll = Math.max(
    maxNormErrAll,
    Math.abs(unPer0.b1.norm - 1),
    Math.abs(unPer0.b2.norm - 1),
  )

  evolveStrangBlockPeriodic32(ws, gHatPeriodic32, unequalPerState, 0.25, 12)
  const unPer1 = measureTwoBody(ws, warpKernel, unequalPerState, false, false)
  maxNormErrAll = Math.max(
    maxNormErrAll,
    Math.abs(unPer1.b1.norm - 1),
    Math.abs(unPer1.b2.norm - 1),
  )

  const unequalMassPeriodicMomentumSumErr = Math.max(
    Math.hypot(unPer0.totalPx, unPer0.totalPy, unPer0.totalPz),
    Math.hypot(unPer1.totalPx, unPer1.totalPy, unPer1.totalPz),
  )
  // Exact periodic COM momentum conservation implies d(COM)/dt = (p_1 + p_2) / (m_1 + m_2) = 0
  const unequalMassPeriodicComDrift =
    (unequalMassPeriodicMomentumSumErr * (12 * 0.25)) / (unequalM1 + unequalM2)
  const unequalMassPeriodicAccelRatioErr = Math.abs(
    (unPer1.b1.px / unequalM1) / (unPer1.b2.px / unequalM2) + unequalM2 / unequalM1,
  )

  // -----------------------------------------------------------------------------------------------
  // TEST 1B-i: Bound Circular Orbital Motion (exact Keplerian arc + quantum <L_z> conservation)
  // -----------------------------------------------------------------------------------------------
  // Choose k_circ = 0.87 << pi so even the inner gravitational tail stays far inside the Brillouin zone
  // (zero Umklapp wrapping -> exact quantum <L_z> conservation + tight bound radius!)
  const orbitMass = 5.5
  const orbitR0 = 8.5
  const orbitSigma = 1.6
  const orbitDt = 0.85
  const orbitBlocks = 13 // 13 * 4 = 52 steps -> T = 44.2 beats (~94 degrees of curved orbital arc)
  const orbitStepsPerBlock = 4
  const orbitTotalSteps = orbitBlocks * orbitStepsPerBlock
  const orbitVCirc = Math.sqrt((gEff * orbitMass) / (2 * orbitR0))
  const orbitKCirc = orbitMass * orbitVCirc
  const orbitOmegaTheory = Math.sqrt((gEff * 2 * orbitMass) / (orbitR0 * orbitR0 * orbitR0))

  const orbitState = createTwoBodyState(
    orbitMass,
    orbitMass,
    [-orbitR0 / 2, 0, 0],
    [orbitR0 / 2, 0, 0],
    [0, -orbitKCirc, 0],
    [0, orbitKCirc, 0],
    orbitSigma,
  )
  const orbSnap0 = measureTwoBody(ws, warpKernel, orbitState, true, true)
  const orbCom0: [number, number, number] = [orbSnap0.comX, orbSnap0.comY, orbSnap0.comZ]
  trackInvariants(orbSnap0, orbCom0)

  let orbitRMin = orbSnap0.sep
  let orbitRMax = orbSnap0.sep
  let orbitLzQuantumRelDrift = 0
  let orbitMaxSpeedOverC = orbitVCirc / cUniversal
  let orbitEnergyRelDrift = 0
  let prevPhi = Math.atan2(orbSnap0.b2.y - orbSnap0.b1.y, orbSnap0.b2.x - orbSnap0.b1.x)
  let totalAngle = 0
  let orbitOmegaMeasuredEarly = 0

  const earlyBlock = 3 // T = 10.2 beats (early Keplerian angular rate)

  for (let b = 1; b <= orbitBlocks; b++) {
    evolveStrangBlock(ws, warpKernel, orbitState, orbitDt, orbitStepsPerBlock)
    const needFullCheck = b === earlyBlock || b === 7 || b === orbitBlocks
    if (needFullCheck) {
      const snap = measureTwoBody(ws, warpKernel, orbitState, true, true)
      trackInvariants(snap, orbCom0)
      orbitRMin = Math.min(orbitRMin, snap.sep)
      orbitRMax = Math.max(orbitRMax, snap.sep)
      orbitLzQuantumRelDrift = Math.max(
        orbitLzQuantumRelDrift,
        Math.abs(snap.lzQuantumTotal - orbSnap0.lzQuantumTotal) /
          Math.abs(orbSnap0.lzQuantumTotal),
      )
      orbitEnergyRelDrift = Math.max(
        orbitEnergyRelDrift,
        Math.abs(snap.totalEnergy - orbSnap0.totalEnergy) / Math.abs(orbSnap0.interactionEnergy),
      )
      const v1 = Math.hypot(snap.b1.px, snap.b1.py, snap.b1.pz) / orbitMass
      const v2 = Math.hypot(snap.b2.px, snap.b2.py, snap.b2.pz) / orbitMass
      orbitMaxSpeedOverC = Math.max(orbitMaxSpeedOverC, Math.max(v1, v2) / cUniversal)

      const curPhi = Math.atan2(snap.b2.y - snap.b1.y, snap.b2.x - snap.b1.x)
      let dPhi = curPhi - prevPhi
      while (dPhi > Math.PI) dPhi -= 2 * Math.PI
      while (dPhi < -Math.PI) dPhi += 2 * Math.PI
      totalAngle += dPhi
      prevPhi = curPhi

      if (b === earlyBlock) {
        orbitOmegaMeasuredEarly = totalAngle / (b * orbitStepsPerBlock * orbitDt)
      }
    } else {
      const c = measureCentroidsOnly(orbitState)
      orbitRMin = Math.min(orbitRMin, c.sep)
      orbitRMax = Math.max(orbitRMax, c.sep)
      maxNormErrAll = Math.max(maxNormErrAll, Math.abs(c.norm1 - 1), Math.abs(c.norm2 - 1))

      const curPhi = Math.atan2(c.y2 - c.y1, c.x2 - c.x1)
      let dPhi = curPhi - prevPhi
      while (dPhi > Math.PI) dPhi -= 2 * Math.PI
      while (dPhi < -Math.PI) dPhi += 2 * Math.PI
      totalAngle += dPhi
      prevPhi = curPhi
    }
  }

  const orbitOmegaMeasuredFull = totalAngle / (orbitTotalSteps * orbitDt)
  const orbitOmegaEarlyRelErr =
    Math.abs(orbitOmegaMeasuredEarly - orbitOmegaTheory) / orbitOmegaTheory

  // -----------------------------------------------------------------------------------------------
  // TEST 1B-ii: Fast Flyby Gravitational Deflection (weak-field Rutherford/Newtonian scattering)
  // -----------------------------------------------------------------------------------------------
  const flybyMass = 4.5
  const flybyMTotal = 2 * flybyMass
  const flybyImpactB = 7.0
  const flybyX0 = 12.0
  const flybyV0 = 0.36
  const flybyVRel = 2 * flybyV0
  const flybyK0 = flybyMass * flybyV0
  const flybySigma = 1.5
  const flybyDt = 0.85
  const flybySteps = 38 // T = 32.3 beats (v_rel * T = 23.3 docks)

  const flybyState = createTwoBodyState(
    flybyMass,
    flybyMass,
    [-flybyX0 / 2, -flybyImpactB / 2, 0],
    [flybyX0 / 2, flybyImpactB / 2, 0],
    [flybyK0, 0, 0],
    [-flybyK0, 0, 0],
    flybySigma,
  )
  const flySnap0 = measureTwoBody(ws, warpKernel, flybyState, false, false)
  const flyCom0: [number, number, number] = [flySnap0.comX, flySnap0.comY, flySnap0.comZ]
  trackInvariants(flySnap0, flyCom0)

  evolveStrangBlock(ws, warpKernel, flybyState, flybyDt, flybySteps)
  const flySnapEnd = measureTwoBody(ws, warpKernel, flybyState, false, false)
  trackInvariants(flySnapEnd, flyCom0)

  const vRelEndX = flySnapEnd.b1.px / flybyMass - flySnapEnd.b2.px / flybyMass
  const vRelEndY = flySnapEnd.b1.py / flybyMass - flySnapEnd.b2.py / flybyMass
  const flybyDeflectionRad = Math.atan2(vRelEndY, vRelEndX)

  const flybyTheoryWeakInfRad = (2 * gEff * flybyMTotal) / (flybyImpactB * flybyVRel * flybyVRel)
  const flybyTheoryExactHypRad =
    2 * Math.atan((gEff * flybyMTotal) / (flybyImpactB * flybyVRel * flybyVRel))
  const flybyGeomFactor = flybyX0 / Math.hypot(flybyX0, flybyImpactB)
  const flybyTheoryFiniteRad = flybyTheoryWeakInfRad * flybyGeomFactor
  const flybyFiniteRelErr =
    Math.abs(flybyDeflectionRad - flybyTheoryFiniteRad) / flybyTheoryFiniteRad
  const flybyInfRelErr =
    Math.abs(flybyDeflectionRad - flybyTheoryWeakInfRad) / flybyTheoryWeakInfRad
  const flybyMaxSpeedOverC =
    Math.max(
      Math.hypot(flySnapEnd.b1.px, flySnapEnd.b1.py, flySnapEnd.b1.pz) / flybyMass,
      Math.hypot(flySnap0.b1.px, flySnap0.b1.py, flySnap0.b1.pz) / flybyMass,
    ) / cUniversal

  // -----------------------------------------------------------------------------------------------
  // TEST 1C: Negative Control (Raw Unwarped Bulk Screened Gravity w(D) = 1, F = 12)
  // -----------------------------------------------------------------------------------------------
  const measureRawInfallAccel = (r0: number): number => {
    const st = createTwoBodyState(
      infallMass,
      infallMass,
      [-r0 / 2, 0, 0],
      [r0 / 2, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      infallSigma,
    )
    const c0 = measureCentroidsOnly(st)
    const ts: number[] = []
    const drs: number[] = []
    for (let step = 1; step <= 4; step++) {
      evolveStrangBlock(ws, rawKernel, st, infallDt, 1)
      const cn = measureCentroidsOnly(st)
      ts.push(step * infallDt)
      drs.push(cn.sep - c0.sep)
    }
    return fitInitialAcceleration(ts, drs)
  }

  const rawAccelR6 = measureRawInfallAccel(6)
  const rawAccelR8 = measureRawInfallAccel(8)
  const warpAccelR6 = infallSamples.find(s => s.r0 === 6)!.a12Traj
  const warpAccelR8 = infallSamples.find(s => s.r0 === 8)!.a12Traj
  const rawToWarpAccelRatioR6 = Math.abs(rawAccelR6) / Math.abs(warpAccelR6)
  const rawToWarpAccelRatioR8 = Math.abs(rawAccelR8) / Math.abs(warpAccelR8)

  // Raw bulk circular-orbit launch (exact same initial conditions as Test 1B-i, T = 37.4 beats)
  const rawOrbitSteps = 44
  const rawOrbitState = createTwoBodyState(
    orbitMass,
    orbitMass,
    [-orbitR0 / 2, 0, 0],
    [orbitR0 / 2, 0, 0],
    [0, -orbitKCirc, 0],
    [0, orbitKCirc, 0],
    orbitSigma,
  )
  evolveStrangBlock(ws, rawKernel, rawOrbitState, orbitDt, rawOrbitSteps)
  const rawOrbEnd = measureCentroidsOnly(rawOrbitState)
  const rawOrbitREnd = rawOrbEnd.sep
  const ctrlTime = rawOrbitSteps * orbitDt
  const rawOrbitFreeStraightREnd = Math.hypot(orbitR0, 2 * orbitVCirc * ctrlTime)
  const rawOrbitExpansionRatio = rawOrbitREnd / orbitR0

  // Raw bulk flyby control (exact same initial conditions as Test 1B-ii)
  const rawFlybyState = createTwoBodyState(
    flybyMass,
    flybyMass,
    [-flybyX0 / 2, -flybyImpactB / 2, 0],
    [flybyX0 / 2, flybyImpactB / 2, 0],
    [flybyK0, 0, 0],
    [-flybyK0, 0, 0],
    flybySigma,
  )
  evolveStrangBlock(ws, rawKernel, rawFlybyState, flybyDt, flybySteps)
  const rawFlyEnd = measureTwoBody(ws, rawKernel, rawFlybyState, false, false)
  const rawVRelX = rawFlyEnd.b1.px / flybyMass - rawFlyEnd.b2.px / flybyMass
  const rawVRelY = rawFlyEnd.b1.py / flybyMass - rawFlyEnd.b2.py / flybyMass
  const rawFlybyDeflectionRad = Math.atan2(rawVRelY, rawVRelX)
  const rawToWarpFlybyRatio =
    Math.abs(rawFlybyDeflectionRad) / Math.max(1e-12, Math.abs(flybyDeflectionRad))

  return {
    kEff,
    gEff,
    cUniversal,
    kernelMaxImagErr,
    kernelContinuumFlatnessR6to10,
    potentialReciprocityMaxErr,
    infallSamples,
    allAttractive,
    inverseSquareSlopeR5to10,
    inverseSquareSlopeR6to10,
    gDynMeanR6to10,
    gDynMeanRelErrR6to10,
    gDynMaxRelErrR6to10,
    showcaseR0,
    showcaseREnd,
    showcaseShrinkage,
    showcaseEnergyRelDrift,
    showcaseMaxSpeedOverC,
    unequalMassAccelRatio,
    unequalMassAccelRatioErr,
    unequalMassOpenMomentumSumErr,
    unequalMassOpenComDrift,
    unequalMassPeriodicAccelRatioErr,
    unequalMassPeriodicMomentumSumErr,
    unequalMassPeriodicComDrift,
    maxNormErrAll,
    maxMomentumSumErrAll,
    maxComDriftAll,
    timeReversalCentroidErr,
    timeReversalStateOverlapErr,
    orbitR0,
    orbitRMin,
    orbitRMax,
    orbitAngleSweptRad: totalAngle,
    orbitOmegaTheory,
    orbitOmegaMeasuredEarly,
    orbitOmegaMeasuredFull,
    orbitOmegaEarlyRelErr,
    orbitLzInitial: orbSnap0.lzQuantumTotal,
    orbitLzQuantumRelDrift,
    orbitMaxSpeedOverC,
    orbitEnergyRelDrift,
    flybyImpactB,
    flybyVRel,
    flybyDeflectionRad,
    flybyTheoryWeakInfRad,
    flybyTheoryFiniteRad,
    flybyTheoryExactHypRad,
    flybyFiniteRelErr,
    flybyInfRelErr,
    flybyMaxSpeedOverC,
    rawAccelR6,
    rawAccelR8,
    rawToWarpAccelRatioR6,
    rawToWarpAccelRatioR8,
    rawOrbitREnd,
    rawOrbitFreeStraightREnd,
    rawOrbitExpansionRatio,
    rawFlybyDeflectionRad,
    rawToWarpFlybyRatio,
  }
}
