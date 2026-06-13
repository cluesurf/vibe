// Shared 3D Dirac operator on a hedgehog/skyrmion background (Dirac(4) x isospin(2) = 8 complex components).
// H = alpha.p + phi(r) (beta (x) (rhat.tau)). Used by p215 (Lanczos) and p216 (KPM sea energy).

export type Cx = { re: Float64Array; im: Float64Array }

const ALPHA: [number, number, number, number][][] = [
  [[0, 3, 1, 0], [1, 2, 1, 0], [2, 1, 1, 0], [3, 0, 1, 0]],
  [[0, 3, 0, -1], [1, 2, 0, 1], [2, 1, 0, -1], [3, 0, 0, 1]],
  [[0, 2, 1, 0], [1, 3, -1, 0], [2, 0, 1, 0], [3, 1, -1, 0]],
]
const BETA = [1, 1, -1, -1]

// background modes:
//  'bag'     : phi(r) = M tanh(r/R), nhat = rhat  (a mass-magnitude bag, R<=0 -> uniform mass M)
//  'texture' : phi = M constant, nhat = a charge-1 HOPFION direction of size R (only the DIRECTION winds, no
//              volume term, so the fermion energy is purely gradient = exchange + Skyrme, isolating the sign)
//  'uniformz': phi = M constant, nhat = (0,0,1) everywhere (the texture vacuum; sea energy is direction-independent)
// (rhat.tau) = [[nz, nx-i ny],[nx+i ny, -nz]].
export type BgMode = 'bag' | 'texture' | 'uniformz'
export function background(L: number, M: number, R: number, mode: BgMode = 'bag'): { phi: Float64Array; rt: Float64Array } {
  const N = L * L * L, C = L / 2
  const phi = new Float64Array(N), rt = new Float64Array(N * 8)
  const site = (x: number, y: number, z: number): number => (z * L + y) * L + x
  for (let x = 0; x < L; x++) for (let y = 0; y < L; y++) for (let z = 0; z < L; z++) {
    const s = site(x, y, z), dx = x - C + 0.5, dy = y - C + 0.5, dz = z - C + 0.5, r = Math.hypot(dx, dy, dz)
    let nx: number, ny: number, nz: number
    if (mode === 'uniformz') { phi[s] = M; nx = 0; ny = 0; nz = 1 }
    else if (mode === 'texture') {
      phi[s] = M
      const X = dx / R, Y = dy / R, Z = dz / R, r2 = X * X + Y * Y + Z * Z, dd0 = 1 + r2
      const a = (2 * X) / dd0, b = (2 * Y) / dd0, cc = (2 * Z) / dd0, dd = (1 - r2) / dd0
      nx = 2 * (a * cc + b * dd); ny = 2 * (b * cc - a * dd); nz = a * a + b * b - cc * cc - dd * dd
      const m = Math.hypot(nx, ny, nz) || 1; nx /= m; ny /= m; nz /= m
    } else { phi[s] = R > 0 ? M * Math.tanh(r / R) : M; nx = dx / r; ny = dy / r; nz = dz / r }
    const b = s * 8
    rt[b] = nz; rt[b + 1] = 0; rt[b + 2] = nx; rt[b + 3] = -ny; rt[b + 4] = nx; rt[b + 5] = ny; rt[b + 6] = -nz; rt[b + 7] = 0
  }
  return { phi, rt }
}

export function makeDirac(L: number, M: number, R: number, mode: BgMode = 'bag'): { dim: number; applyH: (v: Cx, o: Cx) => void } {
  const N = L * L * L, DIM = 8 * N
  const { phi, rt } = background(L, M, R, mode)
  const site = (x: number, y: number, z: number): number => (z * L + y) * L + x
  const inBox = (x: number, y: number, z: number): boolean => x >= 0 && x < L && y >= 0 && y < L && z >= 0 && z < L
  const applyH = (v: Cx, o: Cx): void => {
    o.re.fill(0); o.im.fill(0)
    for (let x = 0; x < L; x++) for (let y = 0; y < L; y++) for (let z = 0; z < L; z++) {
      const s = site(x, y, z), base = s * 8
      for (let axis = 0; axis < 3; axis++) {
        const dp = [axis === 0 ? 1 : 0, axis === 1 ? 1 : 0, axis === 2 ? 1 : 0]
        const sp = inBox(x + dp[0]!, y + dp[1]!, z + dp[2]!) ? site(x + dp[0]!, y + dp[1]!, z + dp[2]!) : -1
        const sm = inBox(x - dp[0]!, y - dp[1]!, z - dp[2]!) ? site(x - dp[0]!, y - dp[1]!, z - dp[2]!) : -1
        for (const [d, dpr, ar, ai] of ALPHA[axis]!) {
          const cr = ai * 0.5, ci = -ar * 0.5
          for (let t = 0; t < 2; t++) {
            const oi = base + d * 2 + t
            if (sp >= 0) { const j = sp * 8 + dpr * 2 + t; o.re[oi]! += cr * v.re[j]! - ci * v.im[j]!; o.im[oi]! += cr * v.im[j]! + ci * v.re[j]! }
            if (sm >= 0) { const j = sm * 8 + dpr * 2 + t; o.re[oi]! -= cr * v.re[j]! - ci * v.im[j]!; o.im[oi]! -= cr * v.im[j]! + ci * v.re[j]! }
          }
        }
      }
      const ph = phi[s]!
      const m00r = rt[base]!, m00i = rt[base + 1]!, m01r = rt[base + 2]!, m01i = rt[base + 3]!, m10r = rt[base + 4]!, m10i = rt[base + 5]!, m11r = rt[base + 6]!, m11i = rt[base + 7]!
      for (let d = 0; d < 4; d++) {
        const g = ph * BETA[d]!, i0 = base + d * 2, i1 = base + d * 2 + 1
        const p0r = v.re[i0]!, p0i = v.im[i0]!, p1r = v.re[i1]!, p1i = v.im[i1]!
        o.re[i0]! += g * (m00r * p0r - m00i * p0i + m01r * p1r - m01i * p1i); o.im[i0]! += g * (m00r * p0i + m00i * p0r + m01r * p1i + m01i * p1r)
        o.re[i1]! += g * (m10r * p0r - m10i * p0i + m11r * p1r - m11i * p1i); o.im[i1]! += g * (m10r * p0i + m10i * p0r + m11r * p1i + m11i * p1r)
      }
    }
  }
  return { dim: DIM, applyH }
}

export const newCx = (dim: number): Cx => ({ re: new Float64Array(dim), im: new Float64Array(dim) })
export const dotR = (a: Cx, b: Cx, dim: number): number => { let s = 0; for (let i = 0; i < dim; i++) s += a.re[i]! * b.re[i]! + a.im[i]! * b.im[i]!; return s }

// largest eigenvalue of H^2 by power iteration (for spectral bounds)
export function lambdaMaxH2(applyH: (v: Cx, o: Cx) => void, dim: number): number {
  const v = newCx(dim); let rng = 1
  for (let i = 0; i < dim; i++) { rng = (rng * 1103515245 + 12345) & 0x7fffffff; v.re[i] = rng / 0x7fffffff - 0.5 }
  let nrm = Math.sqrt(dotR(v, v, dim)); for (let i = 0; i < dim; i++) v.re[i]! /= nrm
  const t = newCx(dim), w = newCx(dim); let lam = 0
  for (let it = 0; it < 50; it++) { applyH(v, t); applyH(t, w); lam = dotR(v, w, dim); nrm = Math.sqrt(dotR(w, w, dim)); for (let i = 0; i < dim; i++) { v.re[i] = w.re[i]! / nrm; v.im[i] = w.im[i]! / nrm } }
  return lam
}
