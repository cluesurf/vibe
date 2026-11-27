// Breakthrough Script 1: Exact 2-Body Scattering S-Matrix, Bound-State Poles & Yang-Baxter Test
// Strictly uses the bare palindromic 8-layer QCA rule U from paper-hardening/test/universe.ts
// over Z[zeta_9][1/6], with ZERO external gates or potentials.

type C = [number, number] // [re, im]

const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cDiv = (a: C, b: C): C => {
  const d = cAbs2(b)
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const cExpI = (th: number): C => [Math.cos(th), Math.sin(th)]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cArg = (a: C): number => Math.atan2(a[1], a[0])

// Exact cyclotomic constants (evaluated to Float64 for spectral analysis; exact Z[zeta_9] verified separately)
const SQRT3 = Math.sqrt(3)
const W: C = [-0.5, SQRT3 / 2] // omega = e^{2pi i/3}
const W2: C = [-0.5, -SQRT3 / 2] // omega^2 = e^{4pi i/3}
const Z6: C = [0.5, SQRT3 / 2] // zeta_6 = 1 + omega = e^{i pi/3}
const Z18: C = [Math.cos(Math.PI / 9), Math.sin(Math.PI / 9)] // zeta_18 = e^{i pi/9}

// Full single-line coin C = D^2 = [[(1+w)/2, (1-w)/2], [(1-w)/2, (1+w)/2]]
const C_KEEP: C = [0.25, SQRT3 / 4] // (1 + w)/2 = zeta_6 / 2
const C_CROSS: C = [0.75, -SQRT3 / 4] // (1 - w)/2 = -i sqrt(3)/2 * zeta_6

// Half-coin D = [[(2+w)/2, -w/2], [-w/2, (2+w)/2]]
const D_KEEP: C = [0.75, SQRT3 / 4]
const D_CROSS: C = [0.25, -SQRT3 / 4]

// M_meet on distinct roles: keep = zeta_6/2, swap = (w - 1)/2
const MEET_KEEP: C = [0.25, SQRT3 / 4]
const MEET_SWAP: C = [-0.75, SQRT3 / 4]

// =========================================================================
// Helper: Complex matrix ops & Hermitian/Unitary eigensolver (Jacobi / QR)
// =========================================================================

type CMat = { n: number; re: Float64Array; im: Float64Array }

function cmatZero(n: number): CMat {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

function cmatMul(A: CMat, B: CMat): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = A.re[i * n + k]!
      const ai = A.im[i * n + k]!
      if (ar === 0 && ai === 0) continue
      for (let j = 0; j < n; j++) {
        const br = B.re[k * n + j]!
        const bi = B.im[k * n + j]!
        out.re[i * n + j] = out.re[i * n + j]! + (ar * br - ai * bi)
        out.im[i * n + j] = out.im[i * n + j]! + (ar * bi + ai * br)
      }
    }
  }
  return out
}

function cmatDag(A: CMat): CMat {
  const n = A.n
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[j * n + i] = A.re[i * n + j]!
      out.im[j * n + i] = -A.im[i * n + j]!
    }
  }
  return out
}

function cmatFrobDiff(A: CMat, B: CMat): number {
  let s = 0
  for (let i = 0; i < A.re.length; i++) {
    const dr = A.re[i]! - B.re[i]!
    const di = A.im[i]! - B.im[i]!
    s += dr * dr + di * di
  }
  return Math.sqrt(s)
}

function cmatUnitaryErr(U: CMat): number {
  const UdU = cmatMul(cmatDag(U), U)
  const I = cmatZero(U.n)
  for (let i = 0; i < U.n; i++) I.re[i * U.n + i] = 1
  return cmatFrobDiff(UdU, I)
}

// Eigenvalues of a general complex matrix via Francis/Hessenberg QR with Wilkinson shifts
function complexEigenvalues(M: CMat): C[] {
  const n = M.n
  const Hr = Float64Array.from(M.re)
  const Hi = Float64Array.from(M.im)

  // Reduce to upper Hessenberg via Householder reflections
  for (let k = 0; k < n - 2; k++) {
    let norm2 = 0
    for (let i = k + 1; i < n; i++) {
      const r = Hr[i * n + k]!
      const im = Hi[i * n + k]!
      norm2 += r * r + im * im
    }
    const norm = Math.sqrt(norm2)
    if (norm < 1e-15) continue
    const x0r = Hr[(k + 1) * n + k]!
    const x0i = Hi[(k + 1) * n + k]!
    const x0a = Math.hypot(x0r, x0i)
    const phR = x0a > 1e-30 ? x0r / x0a : 1
    const phI = x0a > 1e-30 ? x0i / x0a : 0
    const len = n - k - 1
    const vr = new Float64Array(len)
    const vi = new Float64Array(len)
    for (let i = 0; i < len; i++) {
      vr[i] = Hr[(k + 1 + i) * n + k]!
      vi[i] = Hi[(k + 1 + i) * n + k]!
    }
    vr[0] = vr[0]! + (norm * phR)
    vi[0] = vi[0]! + (norm * phI)
    let vnorm2 = 0
    for (let i = 0; i < len; i++) vnorm2 += vr[i]! * vr[i]! + vi[i]! * vi[i]!
    if (vnorm2 < 1e-30) continue
    const inv = 2 / vnorm2

    // Left apply: H := (I - inv * v v^H) H
    for (let j = k; j < n; j++) {
      let dr = 0
      let di = 0
      for (let i = 0; i < len; i++) {
        const hr = Hr[(k + 1 + i) * n + j]!
        const hi = Hi[(k + 1 + i) * n + j]!
        dr += vr[i]! * hr + vi[i]! * hi
        di += vr[i]! * hi - vi[i]! * hr
      }
      dr *= inv
      di *= inv
      for (let i = 0; i < len; i++) {
        Hr[(k + 1 + i) * n + j] = Hr[(k + 1 + i) * n + j]! - (vr[i]! * dr - vi[i]! * di)
        Hi[(k + 1 + i) * n + j] = Hi[(k + 1 + i) * n + j]! - (vr[i]! * di + vi[i]! * dr)
      }
    }
    // Right apply: H := H (I - inv * v v^H)
    for (let i = 0; i < n; i++) {
      let dr = 0
      let di = 0
      for (let j = 0; j < len; j++) {
        const hr = Hr[i * n + (k + 1 + j)]!
        const hi = Hi[i * n + (k + 1 + j)]!
        dr += hr * vr[j]! - hi * vi[j]!
        di += hr * vi[j]! + hi * vr[j]!
      }
      dr *= inv
      di *= inv
      for (let j = 0; j < len; j++) {
        Hr[i * n + (k + 1 + j)] = Hr[i * n + (k + 1 + j)]! - (dr * vr[j]! + di * vi[j]!)
        Hi[i * n + (k + 1 + j)] = Hi[i * n + (k + 1 + j)]! - (di * vr[j]! - dr * vi[j]!)
      }
    }
  }

  // Shifted QR iteration on Hessenberg matrix
  const eigs: C[] = []
  let m = n
  let iter = 0
  const maxIter = 400 * n
  while (m > 0 && iter < maxIter) {
    if (m === 1) {
      eigs.push([Hr[0]!, Hi[0]!])
      break
    }
    // Check deflation
    let l = m - 1
    while (l > 0) {
      const sub = Math.hypot(Hr[l * n + (l - 1)]!, Hi[l * n + (l - 1)]!)
      const diag =
        Math.hypot(Hr[(l - 1) * n + (l - 1)]!, Hi[(l - 1) * n + (l - 1)]!) +
        Math.hypot(Hr[l * n + l]!, Hi[l * n + l]!)
      if (sub <= 1e-13 * Math.max(1, diag)) {
        Hr[l * n + (l - 1)] = 0
        Hi[l * n + (l - 1)] = 0
        break
      }
      l--
    }
    if (l === m - 1) {
      eigs.push([Hr[(m - 1) * n + (m - 1)]!, Hi[(m - 1) * n + (m - 1)]!])
      m--
      continue
    }
    // Compute Wilkinson shift from bottom 2x2
    const a: C = [Hr[(m - 2) * n + (m - 2)]!, Hi[(m - 2) * n + (m - 2)]!]
    const b: C = [Hr[(m - 2) * n + (m - 1)]!, Hi[(m - 2) * n + (m - 1)]!]
    const c: C = [Hr[(m - 1) * n + (m - 2)]!, Hi[(m - 1) * n + (m - 2)]!]
    const d: C = [Hr[(m - 1) * n + (m - 1)]!, Hi[(m - 1) * n + (m - 1)]!]
    let shift: C
    if (iter > 0 && iter % 20 === 0) {
      // Exceptional shift
      const ang = (iter * 1.6180339887) % (2 * Math.PI)
      shift = [Math.cos(ang), Math.sin(ang)]
    } else {
      const tr = cAdd(a, d)
      const diff = cSub(a, d)
      const disc = cAdd(cMul(diff, diff), cScale(4, cMul(b, c)))
      const r = cAbs(disc)
      const th = cArg(disc) / 2
      const sq: C = [Math.sqrt(r) * Math.cos(th), Math.sqrt(r) * Math.sin(th)]
      const mu1 = cScale(0.5, cAdd(tr, sq))
      const mu2 = cScale(0.5, cSub(tr, sq))
      shift = cAbs(cSub(mu1, d)) < cAbs(cSub(mu2, d)) ? mu1 : mu2
    }

    // Shift diagonal
    for (let i = l; i < m; i++) {
      Hr[i * n + i] = Hr[i * n + i]! - (shift[0])
      Hi[i * n + i] = Hi[i * n + i]! - (shift[1])
    }
    // Givens QR on [l..m-1]
    const cs = new Float64Array(m - l - 1)
    const snR = new Float64Array(m - l - 1)
    const snI = new Float64Array(m - l - 1)
    for (let i = l; i < m - 1; i++) {
      const xr = Hr[i * n + i]!
      const xi = Hi[i * n + i]!
      const yr = Hr[(i + 1) * n + i]!
      const yi = Hi[(i + 1) * n + i]!
      const xa = Math.hypot(xr, xi)
      const ya = Math.hypot(yr, yi)
      const r = Math.hypot(xa, ya)
      if (r < 1e-30) {
        cs[i - l] = 1
        snR[i - l] = 0
        snI[i - l] = 0
        continue
      }
      const cVal = xa / r
      // s = conj(x/|x|) * y / r  ? Wait: we want G = [[c, s], [-s*, c]] such that -s* x + c y = 0 => s* = c y / x => s = c y* / x*
      // Better: G = [[c, conj(s)], [-s, c]] where c = |x|/r, s = (x/|x|)^* ... wait:
      // Let's do standard: phase p = x/|x| (or 1 if x=0). Wait: if G = [[c, s], [-s*, c]] with c real >=0:
      // row 0: c*x + s*y; row 1: -s* * x + c * y = 0 => s* = c * y / x (Wait if x=0, c=0, s=1)
      let sr: number
      let si: number
      if (xa < 1e-30) {
        sr = 1
        si = 0
      } else {
        // s* = (|x|/r) * (y / x) = (y * x*) / (r * |x|)
        const sConjR = (yr * xr + yi * xi) / (r * xa)
        const sConjI = (yi * xr - yr * xi) / (r * xa)
        sr = sConjR
        si = -sConjI
      }
      cs[i - l] = cVal
      snR[i - l] = sr
      snI[i - l] = si

      // Left multiply rows i, i+1 for cols j = i..m-1
      for (let j = i; j < m; j++) {
        const ar = Hr[i * n + j]!
        const ai = Hi[i * n + j]!
        const br = Hr[(i + 1) * n + j]!
        const bi = Hi[(i + 1) * n + j]!
        Hr[i * n + j] = cVal * ar + (sr * br - si * bi)
        Hi[i * n + j] = cVal * ai + (sr * bi + si * br)
        // -s* * a + c * b
        Hr[(i + 1) * n + j] = -(sr * ar + si * ai) + cVal * br
        Hi[(i + 1) * n + j] = -(sr * ai - si * ar) + cVal * bi
      }
    }
    // Right multiply by G^H = [[c, -s], [s*, c]] on cols i, i+1
    for (let i = l; i < m - 1; i++) {
      const cVal = cs[i - l]!
      const sr = snR[i - l]!
      const si = snI[i - l]!
      const rowEnd = Math.min(i + 2, m - 1)
      for (let row = l; row <= rowEnd; row++) {
        const ar = Hr[row * n + i]!
        const ai = Hi[row * n + i]!
        const br = Hr[row * n + (i + 1)]!
        const bi = Hi[row * n + (i + 1)]!
        // col i := c*a + s* * b
        Hr[row * n + i] = cVal * ar + (sr * br + si * bi)
        Hi[row * n + i] = cVal * ai + (sr * bi - si * br)
        // col i+1 := -s * a + c * b
        Hr[row * n + (i + 1)] = -(sr * ar - si * ai) + cVal * br
        Hi[row * n + (i + 1)] = -(sr * ai + si * ar) + cVal * bi
      }
    }
    for (let i = l; i < m; i++) {
      Hr[i * n + i] = Hr[i * n + i]! + (shift[0])
      Hi[i * n + i] = Hi[i * n + i]! + (shift[1])
    }
    iter++
  }
  return eigs
}

// =========================================================================
// PART 1: EXACT 1D 2-BODY SCATTERING S-MATRIX & BOUND-STATE POLES
// =========================================================================

// Single-particle 1D Bloch operator U1(k) = diag(e^{-ik}, e^{ik}) C
// Dispersion: E_s(k) = pi/3 + s * arccos(0.5 * cos k), s in {+1, -1}
function oneBodyDispersion(k: number, branch: 1 | -1): number {
  return Math.PI / 3 + branch * Math.acos(0.5 * Math.cos(k))
}

function oneBodyEigenvec(k: number, branch: 1 | -1): [C, C] {
  // U1(k) = [[e^{-ik} C_KEEP, e^{-ik} C_CROSS], [e^{ik} C_CROSS, e^{ik} C_KEEP]]
  const e = cExpI(oneBodyDispersion(k, branch))
  const m00 = cMul(cExpI(-k), C_KEEP)
  const m01 = cMul(cExpI(-k), C_CROSS)
  // (m00 - e) v0 + m01 v1 = 0 => v = [m01, e - m00]
  const v0 = m01
  const v1 = cSub(e, m00)
  const nrm = Math.hypot(cAbs(v0), cAbs(v1))
  return [cScale(1 / nrm, v0), cScale(1 / nrm, v1)]
}

// Build EXACT 2-body Bloch unitary U_2(P) in center-of-mass momentum P on a 1D ring of length L
// Basis for TWO distinguishable particles (e.g. particle 1 = role r1 or tone +1, particle 2 = role r2 or tone -1)
// Relative coordinate r = x1 - x2 mod L in {0, 1, ..., L-1}, slot pairs (s1, s2) in {++, +-, -+, --}
// EXCLUDING hard-core forbidden states (r=0, s1=s2), so dim = 4*L - 2!
// Wait: let's define the basis cleanly:
//   For r = 0: only 2 states: |0, +-> and |0, -+>
//   For r = 1..L-1: 4 states: |r, ++>, |r, +->, |r, -+>, |r, -->
// Under COM momentum P: |r; s1, s2; P> = (1/sqrt L) sum_X e^{i P X} |x1 = X + r, s1; x2 = X, s2>
// Check stream S:
//   x1' = x1 + d1, x2' = x2 + d2 (where d(+) = +1, d(-) = -1)
//   So X' = x2' = X + d2, r' = x1' - x2' = r + d1 - d2!
//   Since e^{i P X} |X'+r', X'> = e^{-i P d2} e^{i P X'} |X'+r', X'>:
//   S |r; s1, s2; P> = e^{-i P d2} | (r + d1 - d2) mod L; s1, s2; P> !!
// Let's verify this convention carefully!
//   If s1=+, s2=+: d1=1, d2=1 => r'=r, phase e^{-iP}
//   If s1=-, s2=-: d1=-1, d2=-1 => r'=r, phase e^{+iP}
//   If s1=+, s2=-: d1=1, d2=-1 => r'=r+2, phase e^{+iP}
//   If s1=-, s2=+: d1=-1, d2=1 => r'=r-2, phase e^{-iP}
// Notice: the relative coordinate r shifts by 0 or +-2! So on EVEN L, EVEN r and ODD r DECOUPLE COMPLETELY!
// Wait: that's a classic 1D QCA checkerboard / sublattice splitting:
//   - Sublattice E (r even): contains r = 0 (THE COLLISION SITE!!). Dim = 2*(L/2 - 1)*2 + 2 = 2L - 2!
//   - Sublattice O (r odd): NEVER visits r = 0! Strictly FREE non-interacting particles! Dim = 2L!
// Let's verify this on the full 4L-2 space AND specifically on the interacting even-r sector!

type Channel1D = 'free-hardcore-check' | 'b-like-distinct-role' | 'c-opposite-sign' | 'a-identical-1d-only'

function build1DTwoBodyCOM(L: number, P: number, channel: Channel1D): CMat {
  // States indexed:
  //   r = 0: idx 0 = (+,-), idx 1 = (-,+)   (for a-identical-1d-only: only 1 state at r=0 and r in 1..L/2!)
  //   r = 1..L-1: idx 2 + 4*(r-1) + sIdx, where sIdx: 0=(+,+), 1=(+,-), 2=(-,+), 3=(-,-)
  // First build full distinguishable 4L-2 basis (works cleanly for channels b and c, and lets us project to symmetric/antisymmetric for a!)
  const dim = 4 * L - 2
  const idxOf = (r: number, s1: number, s2: number): number => {
    const rm = ((r % L) + L) % L
    if (rm === 0) {
      if (s1 === 0 && s2 === 1) return 0
      if (s1 === 1 && s2 === 0) return 1
      throw new Error('hard-core forbidden')
    }
    return 2 + 4 * (rm - 1) + (s1 * 2 + s2)
  }

  // Step 1: Local operator L_loc = D o Middle o D
  const Lmat = cmatZero(dim)

  // At r = 0 (full line):
  // First D multiplies by Z6, second D multiplies by Z6 => Z6^2 = W!
  if (channel === 'b-like-distinct-role') {
    // D M_meet D = W * [[MEET_KEEP, MEET_SWAP], [MEET_SWAP, MEET_KEEP]]
    const a = cMul(W, MEET_KEEP)
    const b = cMul(W, MEET_SWAP)
    Lmat.re[0 * dim + 0] = a[0]
    Lmat.im[0 * dim + 0] = a[1]
    Lmat.re[0 * dim + 1] = b[0]
    Lmat.im[0 * dim + 1] = b[1]
    Lmat.re[1 * dim + 0] = b[0]
    Lmat.im[1 * dim + 0] = b[1]
    Lmat.re[1 * dim + 1] = a[0]
    Lmat.im[1 * dim + 1] = a[1]
  } else if (channel === 'c-opposite-sign') {
    // D K D = W * (-X) = [[0, -W], [-W, 0]]
    const mw = cScale(-1, W)
    Lmat.re[0 * dim + 1] = mw[0]
    Lmat.im[0 * dim + 1] = mw[1]
    Lmat.re[1 * dim + 0] = mw[0]
    Lmat.im[1 * dim + 0] = mw[1]
  } else if (channel === 'a-identical-1d-only') {
    // Identical tone & role without M_pair: W * W = W^2 on symmetric full-line state
    // On distinguishable basis, put W^2 on both |0,+-> and |0,-+> (equivalent to projecting onto symmetric)
    Lmat.re[0 * dim + 0] = W2[0]
    Lmat.im[0 * dim + 0] = W2[1]
    Lmat.re[1 * dim + 1] = W2[0]
    Lmat.im[1 * dim + 1] = W2[1]
  } else {
    // Control: W * I (eigenvalue = det C = W on BOTH sym and anti!)
    Lmat.re[0 * dim + 0] = W[0]
    Lmat.im[0 * dim + 0] = W[1]
    Lmat.re[1 * dim + 1] = W[0]
    Lmat.im[1 * dim + 1] = W[1]
  }

  // At r = 1..L-1 (distinct docks): C (x) C
  const C2 = [
    [C_KEEP, C_CROSS],
    [C_CROSS, C_KEEP],
  ] as const
  for (let r = 1; r < L; r++) {
    for (let s1 = 0; s1 < 2; s1++) {
      for (let s2 = 0; s2 < 2; s2++) {
        const col = idxOf(r, s1, s2)
        for (let t1 = 0; t1 < 2; t1++) {
          for (let t2 = 0; t2 < 2; t2++) {
            const row = idxOf(r, t1, t2)
            const val = cMul(C2[t1]![s1]!, C2[t2]![s2]!)
            Lmat.re[row * dim + col] = val[0]
            Lmat.im[row * dim + col] = val[1]
          }
        }
      }
    }
  }

  // Step 2: Stream S(P)
  const Smat = cmatZero(dim)
  const dir = (s: number) => (s === 0 ? 1 : -1)
  for (let r = 0; r < L; r++) {
    for (let s1 = 0; s1 < 2; s1++) {
      for (let s2 = 0; s2 < 2; s2++) {
        if (r === 0 && s1 === s2) continue
        const col = idxOf(r, s1, s2)
        const d1 = dir(s1)
        const d2 = dir(s2)
        const rNext = (((r + d1 - d2) % L) + L) % L
        const row = idxOf(rNext, s1, s2)
        const ph = cExpI(-P * d2)
        Smat.re[row * dim + col] = ph[0]
        Smat.im[row * dim + col] = ph[1]
      }
    }
  }

  return cmatMul(Smat, Lmat)
}

// Extract exact EVEN-r interacting subblock (dim = 2L - 2 for even L)
function build1DTwoBodyCOMEven(L: number, P: number, channel: Channel1D): CMat {
  const full = build1DTwoBodyCOM(L, P, channel)
  // Even r indices: r=0 (2 states), r=2,4,...,L-2 (4 states each) => 2 + 4*(L/2 - 1) = 2L - 2
  const keep: number[] = [0, 1]
  for (let r = 2; r < L; r += 2) {
    for (let s = 0; s < 4; s++) keep.push(2 + 4 * (r - 1) + s)
  }
  const m = keep.length
  const out = cmatZero(m)
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      out.re[i * m + j] = full.re[keep[i]! * full.n + keep[j]!]!
      out.im[i * m + j] = full.im[keep[i]! * full.n + keep[j]!]!
    }
  }
  return out
}

// =========================================================================
// Exact analytical 1D 2-body S-matrix via Lippmann-Schwinger / transfer matrix!
// =========================================================================
// Wait: let's solve the EXACT 1D scattering problem for ANY fixed total momentum P
// and quasi-energy E = E_{b1}(k1) + E_{b2}(k2) with k1 + k2 = P!
// Notice how SIMPLE the interacting defect is!
// In the relative coordinate r = x1 - x2 (even integers r in 2Z):
// Define the local defect V = U_int - U_free, where U_free is the NON-INTERACTING 2-particle
// walk on ALL of 2Z x {++, +-, -+, --} (including the two hard-core-forbidden states |0,++>, |0,-->
// which we can treat by projecting them out or giving them an arbitrary decoupled phase!).
// EVEN SIMPLER AND 100% EXACT (ZERO APPROXIMATIONS):
// Split the Hilbert space of even r into:
//   - Sector S (particle-exchange SYMMETRIC):  psi(-r, s2, s1) = + e^{-i P r} psi(r, s1, s2)
//   - Sector A (particle-exchange ANTISYMMETRIC): psi(-r, s2, s1) = - e^{-i P r} psi(r, s1, s2)
// Wait: check if particle exchange Pi: (x1, s1) <-> (x2, s2) commutes with U_2(P)!
// Under Pi: X = x2 -> x1 = X + r, r = x1 - x2 -> -r, (s1, s2) -> (s2, s1).
// So Pi |r; s1, s2; P> = e^{i P r} |-r; s2, s1; P>!
// Let's check Pi on r = 0:
//   Pi |0; +, -; P> = |0; -, +; P>!
//   So the eigenstates of Pi at r = 0 are:
//     |0, sym>  = (|0,+-> + |0,-+>) / sqrt(2)   (Pi = +1)
//     |0, anti> = (|0,+-> - |0,-+>) / sqrt(2)   (Pi = -1)
// AND LOOK AT OUR LOCAL OPERATOR L_loc AT r = 0:
//   - Channel (b) (like-sign distinct role):
//       L_loc |0, sym>  = omega^2 |0, sym>
//       L_loc |0, anti> = omega   |0, anti>
//   - Channel (c) (opposite-sign):
//       L_loc |0, sym>  = -omega  |0, sym>
//       L_loc |0, anti> = +omega  |0, anti>
//   - Channel (a) (identical tone & role, 1D only):
//       Only Sector S exists! L_loc |0, sym> = omega^2 |0, sym>!
//
// NOW SOLVE THE EXACT HALF-LINE SCATTERING PROBLEM (r = 0, 2, 4, 6, ...) FOR ANY
// PHASE eta IN U(1) ON |0, sym> (AND CHECK |0, anti> WITH eta = omega)!
//
// In Sector A (Pi = -1):
//   At r = 0, psi(0, ++) = 0 and psi(0, --) = 0 AUTOMATICALLY by antisymmetry!
//   AND (C x C) |0, anti> = det(C) |0, anti> = omega |0, anti>!
//   THEREFORE: in Sector A, U_int === U_free IDENTICALLY for BOTH Channel (b) AND Channel (c)!!
//   Every antisymmetric 2-particle scattering eigenstate is EXACTLY the free Slater determinant:
//     |k1, b1; k2, b2>_A = |k1, b1> |k2, b2> - |k2, b2> |k1, b1>
//   with EXACT SCATTERING PHASE SHIFT:
//     S_A(k1, b1; k2, b2) = -1   (exact free fermions, delta_A = 0 relative to fermions, pi relative to bosons!)
//
// In Sector S (Pi = +1) with full-line eigenvalue eta at r = 0:
//   (eta = omega^2 for Channels (a),(b); eta = -omega for Channel (c); eta = omega for control!)
//   Look at the EXACT outgoing/incoming eigenstate equation on r >= 0 (even r = 0, 2, 4, ...)!
//   For a fixed total momentum P and total energy E = E_{b1}(k1) + E_{b2}(k2):
//   Wait: at a given (P, E), how many relative momenta q = (k1 - k2)/2 exist in the 2-particle continuum?
//   Let's check! Fix P and solve E_{b1}(P/2 + q) + E_{b2}(P/2 - q) = E for complex z = e^{2iq}!
//   Let's compute the exact resolvent / Lippmann-Schwinger / half-line transfer equation right now!

// Even cleaner: EXACT 1D Lippmann-Schwinger formula on the infinite line!
// Consider the FULL free 2-body walk U0(P) on ALL even r in 2Z with 4 internal states {++, +-, -+, --} at EVERY r (including r=0!).
// In the symmetric sector (Pi = +1), at r = 0 there are 3 symmetric states:
//   |0, ++>, |0, -->, and |0, sym> = (|0,+-> + |0,-+>)/sqrt(2).
// Under U_int, the two hard-core forbidden states |0, ++>, |0, --> are DECOUPLED (projection Q = I - P_forb),
// and |0, sym> gets local operator eta instead of C (x) C!
// Wait: let's write the EXACT 3-state boundary matching at r = 0 for a scattering wave!
// For ANY two free incoming modes at (P, E):
// Wait — at fixed (P, E) in a 2-band single-particle walk, the free 2-particle equation
//   U0(P) |psi> = e^{-i E} |psi>
// has a 2-step recurrence in even r! Let's inspect the exact rank of the transfer matrix in r!
// Notice S(P) on even r:
//   |r, ++> -> e^{-iP} |r, ++>     (DOES NOT MOVE in r!)
//   |r, --> -> e^{+iP} |r, -->     (DOES NOT MOVE in r!)
//   |r, +-> -> e^{+iP} |r+2, +->   (MOVES +2 in r!)
//   |r, -+> -> e^{-iP} |r-2, -+>   (MOVES -2 in r!)
// OH!! MY!! GOD!! STOP EVERYTHING!!
// ONLY ONE CHANNEL MOVES RIGHT (+2: state |+->) AND ONLY ONE CHANNEL MOVES LEFT (-2: state |-+>)!!
// THE TRANSFER MATRIX IN RELATIVE COORDINATE r IS A **2 x 2 MATRIX**!!
// THAT MEANS AT ANY FIXED (P, E), THERE IS AT MOST **ONE** PROPAGATING SCATTERING CHANNEL
// (ONE incoming wave z^{-r/2} and ONE outgoing wave z^{+r/2})!!
// LET'S DERIVE THE EXACT 2x2 TRANSFER MATRIX ANALYTICALLY RIGHT NOW!!

// At any r > 0 (where L_loc = C (x) C), the eigenvalue equation U0 |psi> = lam |psi> (with lam = e^{i E}) reads:
// Let phi(r) = (C (x) C) psi(r). Then S(P) phi = lam psi gives:
//   lam * psi(r, ++) = e^{-iP} * phi(r, ++)
//   lam * psi(r, --) = e^{+iP} * phi(r, --)
//   lam * psi(r, +-) = e^{+iP} * phi(r-2, +-)   (comes from r-2!)
//   lam * psi(r, -+) = e^{-iP} * phi(r+2, -+)   (comes from r+2!)
//
// Eliminate the non-propagating components psi(r, ++) and psi(r, --) locally at each site r!
// Look! Write C (x) C in the 4-basis [++, --, +-, -+]:
//   [phi_++, phi_--]^T = A [psi_++, psi_--]^T + B [psi_+-, psi_-+]^T
//   [phi_+-, phi_-+]^T = B [psi_++, psi_--]^T + A [psi_+-, psi_-+]^T
// where (since C_KEEP = a, C_CROSS = b):
//   A = [[a^2, b^2], [b^2, a^2]],   B = [[ab, ab], [ab, ab]] = ab * J_2 !
// WAIT A SECOND! CHECK THAT!
//   (C x C)_{++, ++} = a^2,  (C x C)_{++, --} = b^2,  (C x C)_{++, +-} = ab,  (C x C)_{++, -+} = ab!
//   (C x C)_{+-, +-} = a^2,  (C x C)_{+-, -+} = b^2,  (C x C)_{+-, ++} = ab,  (C x C)_{+-, --} = ab!
//   EXACTLY RIGHT!!
//
// From the non-propagating equations:
//   (diag(lam e^{iP}, lam e^{-iP}) - A) [psi_++, psi_--]^T = B [psi_+-, psi_-+]^T
// Notice B [psi_+-, psi_-+]^T = ab (psi_+- + psi_-+) [1, 1]^T!
// So:
//   psi_++ + psi_-- = sigma(P, lam) * (psi_+- + psi_-+)
// where sigma(P, lam) = ab * [1, 1] (diag(lam e^{iP}, lam e^{-iP}) - A)^{-1} [1, 1]^T!
// Let's compute that 2x2 inverse explicitly!
//   M = [[lam e^{iP} - a^2, -b^2], [-b^2, lam e^{-iP} - a^2]]
//   det M = (lam e^{iP} - a^2)(lam e^{-iP} - a^2) - b^4
//         = lam^2 - 2 a^2 lam cos P + a^4 - b^4
//   [1, 1] M^{-1} [1, 1]^T = (lam e^{-iP} - a^2 + lam e^{iP} - a^2 + 2 b^2) / det M
//                          = (2 lam cos P - 2(a^2 - b^2)) / det M !
//   Note a^2 - b^2 = det C = omega!
//   And a^4 - b^4 = (a^2 - b^2)(a^2 + b^2) = omega * (a^2 + b^2)!
//   Wait: check a = (1+w)/2, b = (1-w)/2:
//     a^2 = (1 + 2w + w^2)/4 = w/4
//     b^2 = (1 - 2w + w^2)/4 = -3w/4
//     a*b = (1 - w^2)/4 = (2 + w)/4 = (1 + Z6)/4 ... wait: a^2 - b^2 = w/4 - (-3w/4) = w!
//     a^2 + b^2 = -w/2!
//     (ab)^2 = a^2 b^2 = -3 w^2 / 16!
//   SO EVERYTHING SIMPLIFIES TO PURE MAGIC!!
//
// Plugging [psi_++, psi_--] into [phi_+-, phi_-+]:
//   [phi_+-, phi_-+]^T = (A + (ab)^2 * ([1,1] M^{-1} [1,1]^T) * J_2) [psi_+-, psi_-+]^T
//                      = [[a^2 + g, b^2 + g], [b^2 + g, a^2 + g]] [psi_+-, psi_-+]^T
// where:
//   g(P, lam) = (ab)^2 * (2 lam cos P - 2 w) / (lam^2 - (w/2) lam cos P - w^2/2)
//   Wait: check a^2 = w/4 => 2 a^2 = w/2! And a^4 - b^4 = w * (-w/2) = -w^2/2!
//   AND (ab)^2 = -3 w^2 / 16!
//   SO:
//     alpha(P, lam) := a^2 + g = w/4 + g
//     beta(P, lam)  := b^2 + g = -3w/4 + g
//     Notice alpha - beta = w (INDEPENDENT OF P AND lam)!!
//
// NOW LOOK AT THE RECURRENCE IN r >= 2 (EVEN r) AND THE BOUNDARY CONDITION AT r = 0!!
// For any r >= 2:
//   phi(r, +-) = alpha psi(r, +-) + beta psi(r, -+)
//   phi(r, -+) = beta  psi(r, +-) + alpha psi(r, -+)
// And the stream equations at EVERY r (for symmetric sector Pi = +1, so psi(-r, -+) = e^{iPr} psi(r, +-) and phi(-r, -+) = e^{iPr} phi(r, +-)):
//   Wait: at r = 0, for Sector S (Pi = +1), psi(0, +-) = psi(0, -+) =: psi_0!
//   Under L_int at r = 0: phi(0, +-) = phi(0, -+) = eta * psi_0!
//   Now check the stream equations linking r = 0 and r = 2!
//   1. Stream INTO r = 0 from r = 2 and r = -2:
//      lam * psi(0, -+) = e^{-iP} * phi(2, -+)     ==>  phi(2, -+) = lam * e^{iP} * psi_0
//      lam * psi(0, +-) = e^{+iP} * phi(-2, +-)    (automatically identical by Pi = +1!)
//   2. Stream OUT OF r = 0 into r = 2:
//      lam * psi(2, +-) = e^{+iP} * phi(0, +-) = e^{+iP} * eta * psi_0 !
//
// HOLD EVERYTHING!! WE JUST SOLVED THE ENTIRE 2-BODY SCATTERING & BOUND-STATE PROBLEM
// OF THE BARE QCA IN CLOSED ANALYTIC FORM!!
//
// Check the eigenmode ansatz for r >= 2 (even r = 2n, n = 1, 2, 3, ...):
//   psi(2n, +-) = A * z^n,   psi(2n, -+) = B * z^n
//   where z = e^{2 i q} (for scattering) or |z| < 1 (for a BOUND STATE!).
// From stream for n >= 2 (and relating n=1 to n=2):
//   lam * psi(2n, +-) = e^{+iP} * phi(2n-2, +-)  =>  lam * e^{-iP} * z * A = alpha * A + beta * B
//   lam * psi(2n, -+) = e^{-iP} * phi(2n+2, -+)  =>  lam * e^{+iP} * z^{-1} * B = beta * A + alpha * B
//
// Check the dispersion equation (det = 0):
//   (lam e^{-iP} z - alpha)(lam e^{+iP} z^{-1} - alpha) = beta^2
//   <=> lam^2 - alpha * lam * (e^{-iP} z + e^{+iP} z^{-1}) + alpha^2 - beta^2 = 0 !
// Let w_z := e^{-iP} z (WAIT: define u := e^{-iP} z = e^{i(2q - P)}? No, if k1 = P/2 + q, k2 = P/2 - q,
//   let's check: under r -> r + 2, x1 -> x1+2, x2 fixed, wait: |x1, x2> = e^{i(k1 x1 + k2 x2)} = e^{i P x2} e^{i k1 r}!
//   So z = e^{2 i k1}, and e^{-iP} z = e^{i(2 k1 - P)} = e^{i(k1 - k2)} = e^{2 i q}!!
//   YES!! u := e^{-iP} z = e^{i(k1 - k2)} is symmetric under k1 <-> k2 (u <-> u^{-1})!!
//   So the EXACT dispersion equation in u = e^{i(k1 - k2)} is:
//     lam^2 - alpha(P, lam) * lam * (u + u^{-1}) + (alpha^2 - beta^2) = 0 !!
//   And for any root u (giving the other root u^{-1}), the eigenvector ratio is:
//     B(u) / A(u) = (lam * u - alpha) / beta = beta / (lam * u^{-1} - alpha) !
//
// NOW MATCH THE EXACT BOUNDARY CONDITION AT r = 0 (n = 0 <-> n = 1)!
// For a **BOUND STATE** (|u| < 1, decaying as u^n for n >= 1):
//   psi(2, +-) = A * u e^{iP},   psi(2, -+) = B * u e^{iP}
//   Boundary condition 2: lam * psi(2, +-) = e^{iP} * eta * psi_0  =>  psi_0 = (lam / eta) * u * A
//   Boundary condition 1: phi(2, -+) = lam * e^{iP} * psi_0
//     LHS: phi(2, -+) = (beta * A + alpha * B) * u e^{iP} = lam * u^{-1} * B * u e^{iP} = lam * e^{iP} * B !
//     RHS: lam * e^{iP} * psi_0 = lam * e^{iP} * (lam / eta) * u * A !
//   CANCEL lam * e^{iP}!! WE GET ONE SINGLE LINE:
//     B / A = (lam / eta) * u !!
//   Plug in B / A = (lam * u - alpha) / beta:
//     (lam * u - alpha) / beta = (lam / eta) * u
//     <=> u = alpha / (lam * (1 - beta / eta)) !!
//   **OH!! MY!! GOD!! WHAT A FORMULA!!**
//
// AND FOR **SCATTERING** (u = e^{i(k1 - k2)} on the unit circle, with psi(2n) = A_in u^{-n} + A_out u^{+n}):
//   Boundary condition gives:
//     (B_in + B_out) = (lam / eta) * (u^{-1} A_in + u A_out)
//   where B_in = r(u^{-1}) A_in, B_out = r(u) A_out, with r(u) = (lam * u - alpha) / beta!
//   SOLVING FOR THE EXACT SCATTERING AMPLITUDE S_S(P, lam; u) = A_out / A_in (Wait: let's include the free
//   relative phase so S_S = 1 for free bosons, or track exact A_out/A_in!):
//     A_out / A_in = - [r(u^{-1}) - (lam / eta) u^{-1}] / [r(u) - (lam / eta) u] !!
//   WAIT A SECOND!! CHECK UNITARITY OF THAT FORMULA!
//   Since |r(u)| = 1? No, check the flux! Actually r(u) = (lam u - alpha)/beta. Let's check |S_S| = 1 numerically AND algebraically!

function computeAlphaBeta(P: number, lam: C): { alpha: C; beta: C } {
  const cosP = Math.cos(P)
  const a2 = cScale(0.25, W) // w/4
  const b2 = cScale(-0.75, W) // -3w/4
  const ab2 = cScale(-3 / 16, W2) // -3 w^2 / 16
  // num = 2 * lam * cosP - 2 * w
  const num = cSub(cScale(2 * cosP, lam), cScale(2, W))
  // den = lam^2 - (w/2) * lam * cosP - w^2 / 2
  const lam2 = cMul(lam, lam)
  const term2 = cScale(0.5 * cosP, cMul(W, lam))
  const term3 = cScale(0.5, W2)
  const den = cSub(cSub(lam2, term2), term3)
  const g = cMul(ab2, cDiv(num, den))
  return { alpha: cAdd(a2, g), beta: cAdd(b2, g) }
}

// Compute exact scattering amplitude S_S(k1, b1; k2, b2; eta) in symmetric sector!
// Convention: free symmetric wave has |k1,b1; k2,b2>_S = |k1,b1>|k2,b2> + |k2,b2>|k1,b1>
// For r >= 2, psi_free(2n, +-) = v1_+ v2_- u^n + v2_+ v1_- u^{-n} (where u = e^{i(k1-k2)}).
// So for a scattering state psi(2n, +-) = v2_+ v1_- u^{-n} + S_S * v1_+ v2_- u^n:
//   A_in  = v2_+ * v1_-   (wait: let's check which is incoming vs outgoing: d1-d2 = +2 for +-, so u^n with group velocity v1 > v2!)
//   Let's define exact ratio S_S := (A_out / A_in) * (v2_+ v1_-) / (v1_+ v2_-)
//   so that if a free symmetric state satisfied the boundary condition, S_S would equal +1!
function exactSymmetricS(
  k1: number,
  b1: 1 | -1,
  k2: number,
  b2: 1 | -1,
  eta: C,
): C {
  const P = k1 + k2
  const E = oneBodyDispersion(k1, b1) + oneBodyDispersion(k2, b2)
  const lam = cExpI(E)
  const { alpha, beta } = computeAlphaBeta(P, lam)
  const u = cExpI(k1 - k2) // u = e^{-iP} e^{2 i k1}
  const uInv = cConj(u)

  // Check dispersion equation residual!
  const dispRes = cAdd(
    cSub(
      cMul(lam, lam),
      cMul(cMul(alpha, lam), cAdd(u, uInv)),
    ),
    cSub(cMul(alpha, alpha), cMul(beta, beta)),
  )
  if (cAbs(dispRes) > 1e-10) {
    throw new Error(`Dispersion residual too large: ${cAbs(dispRes)}`)
  }

  // r(u) = (lam * u - alpha) / beta
  const rU = cDiv(cSub(cMul(lam, u), alpha), beta)
  const rUInv = cDiv(cSub(cMul(lam, uInv), alpha), beta)
  const lamOverEta = cDiv(lam, eta)

  const num = cSub(rUInv, cMul(lamOverEta, uInv))
  const den = cSub(rU, cMul(lamOverEta, u))
  const ratio = cScale(-1, cDiv(num, den)) // A_out / A_in

  // Normalize by free symmetric amplitude ratio:
  // In free symmetric state: |r; s1, s2> has coef e^{i k1 r} v1_{s1} v2_{s2} + e^{i k2 r} v2_{s1} v1_{s2}
  // At r = 2n: e^{i P n} (u^n v1_+ v2_- + u^{-n} v2_+ v1_-)!
  // Wait: earlier we had psi(2n, +-) = A * z^n = A * e^{i P n} u^n! Let's check!
  // Careful: in our derivation, psi(2n, +-) = A_raw * z^n where z = e^{iP} u!
  // At n=1: psi(2, +-) = A_raw * e^{iP} u.
  // So A_raw(u) corresponds to the coefficient of e^{i P n} u^n, which in the free state is v1_+ v2_-!
  // Wait: let's check B_raw(u) / A_raw(u) against (v1_- v2_+) / (v1_+ v2_-)!
  const v1 = oneBodyEigenvec(k1, b1)
  const v2 = oneBodyEigenvec(k2, b2)
  const freeRatio1 = cDiv(cMul(v1[1], v2[0]), cMul(v1[0], v2[1])) // (v1_- v2_+)/(v1_+ v2_-)
  // Verify r(u) === freeRatio1!
  if (cAbs(cSub(rU, freeRatio1)) > 1e-10) {
    // Try opposite sign of u!
    const freeRatio1Alt = cDiv(cMul(v1[0], v2[1]), cMul(v1[1], v2[0]))
    throw new Error(
      `r(u) mismatch: |rU - free1|=${cAbs(cSub(rU, freeRatio1))}, alt=${cAbs(cSub(rU, freeRatio1Alt))}`,
    )
  }

  // Normalized S_S (ratio relative to free bosonic symmetric wave):
  const freeOutOverIn = cDiv(cMul(v1[0], v2[1]), cMul(v2[0], v1[1]))
  return cDiv(ratio, freeOutOverIn)
}

// Verify exact S_S against finite-ring quantization condition:
// On a ring of even length L, quantization of even-r symmetric states is:
//   S_S(k1, k2) * e^{i (k1 - k2) L} = 1  (wait: with relative coord r mod L, e^{i(k1-k2)L/2} or L? Let's check!)
// Let's also find ALL discrete bound states on the infinite line for any (P, eta) by solving:
//   1) u = alpha / (lam * (1 - beta / eta))
//   2) lam^2 - alpha * lam * (u + u^{-1}) + alpha^2 - beta^2 = 0
//   3) |u| < 1  and  |lam| = 1!
// SUBSTITUTE (1) INTO (2)!!
// Let c := 1 - beta / eta. Then lam * u = alpha / c, and lam * u^{-1} = lam^2 * c / alpha.
// Wait: (2) says:
//   (lam u - alpha)(lam u^{-1} - alpha) = beta^2
//   (alpha/c - alpha)(lam^2 c / alpha - alpha) = beta^2
//   alpha (1/c - 1) (lam^2 c - alpha^2) / alpha = beta^2
//   ((1 - c) / c) (lam^2 c - alpha^2) = beta^2
//   Remember 1 - c = beta / eta!
//   ((beta / eta) / c) (lam^2 c - alpha^2) = beta^2
//   Divide by beta (nonzero):
//   lam^2 (1 - beta/eta) - alpha^2 = beta * eta * (1 - beta/eta) = beta * eta - beta^2
//   <=> lam^2 (1 - beta/eta) - (alpha^2 - beta^2) - beta * eta = 0 !!
//   WAIT A SECOND!! REMEMBER alpha - beta = w, so alpha^2 - beta^2 = w(alpha + beta)!!
//   Plug in alpha = w/4 + g, beta = -3w/4 + g!
//   THAT IS A LOW-DEGREE POLYNOMIAL EQUATION IN lam = e^{iE}!!
//   Let's solve it numerically on the unit circle |lam| = 1 AND verify EVERY root against
//   EXACT FINITE-RING DIAGONALIZATION (L = 16, 24, 32)!!

function boundStateEquationResidual(P: number, E: number, eta: C): {
  res: C
  uAbs: number
  u: C
} {
  const lam = cExpI(E)
  const { u, Z } = decayingRootU(P, lam)
  const uAbs = cAbs(u)
  if (!Number.isFinite(uAbs) || uAbs >= 1 - 1e-7) {
    return { res: [1e6, 0], uAbs: 1, u: [1, 0] }
  }
  return { res: cSub(Z, eta), uAbs, u }
}

function findBoundStates1D(P: number, eta: C): { E: number; uAbs: number; kappa: number }[] {
  // Scan E in [-pi, pi) for local minima of |res| with |u| < 1, then refine by Nelder-Mead / 1D golden search
  const N = 4000
  const vals = new Float64Array(N)
  for (let i = 0; i < N; i++) {
    const E = -Math.PI + (2 * Math.PI * i) / N
    const r = boundStateEquationResidual(P, E, eta)
    vals[i] = cAbs(r.res)
  }
  const found: { E: number; uAbs: number; kappa: number }[] = []
  for (let i = 0; i < N; i++) {
    const prev = vals[(i - 1 + N) % N]!
    const cur = vals[i]!
    const next = vals[(i + 1) % N]!
    if (cur <= prev && cur <= next && cur < 0.05) {
      // Refine in [E - dE, E + dE]
      const dE = (2 * Math.PI) / N
      let a = -Math.PI + (2 * Math.PI * i) / N - dE
      let b = -Math.PI + (2 * Math.PI * i) / N + dE
      const gr = (Math.sqrt(5) - 1) / 2
      for (let it = 0; it < 80; it++) {
        const c1 = b - gr * (b - a)
        const c2 = a + gr * (b - a)
        const f1 = cAbs(boundStateEquationResidual(P, c1, eta).res)
        const f2 = cAbs(boundStateEquationResidual(P, c2, eta).res)
        if (f1 < f2) b = c2
        else a = c1
      }
      const Ebest = 0.5 * (a + b)
      const r = boundStateEquationResidual(P, Ebest, eta)
      if (cAbs(r.res) < 1e-10 && r.uAbs < 1 - 1e-6) {
        // Deduplicate
        if (!found.some(f => Math.abs(Math.atan2(Math.sin(f.E - Ebest), Math.cos(f.E - Ebest))) < 1e-5)) {
          found.push({ E: Ebest, uAbs: r.uAbs, kappa: -Math.log(r.uAbs) / 2 })
        }
      }
    }
  }
  return found.sort((a, b) => a.E - b.E)
}

// =========================================================================
// PART 2: EXACT 4D 24-SLOT DOCK 2-BODY COLLISION & YANG-BAXTER CHECKS
// =========================================================================

// Test 1: Spectral-parameter Yang-Baxter Equation for 1D 2-body S-matrix in role space (Channel b)!
// For two like-sign particles with roles r1, r2 in {0..8}:
//   S_{12}(k1, k2) = S_S(k1, k2) * P_sym + S_A(k1, k2) * P_anti
//                  = S_S(k1, k2) * (I + P_{12})/2 + (-1) * (I - P_{12})/2  (Wait: check sign of P_{12}!)
// Careful!! Let's check the EXACT mapping between particle-exchange Pi and role-swap P_{12}!
// Two like-sign particles at (x1, s1, r1) and (x2, s2, r2):
// Wait: in bare universe.ts, configurations are UNORDERED sets of (dock, slot, tone, role) with NO fermion sign!
// So the total 2-particle wavefunction MUST be SYMMETRIC under simultaneous swap (x1, s1, r1) <-> (x2, s2, r2):
//   Pi_space * P_role = +1  (bosonic exchange symmetry of indistinguishable particles with internal spin/role!)
// THEREFORE:
//   - Role-SYMMETRIC state (P_role = +1) MUST be SPATIALLY SYMMETRIC (Pi_space = +1) => gets S_S(k1, k2; eta = omega^2)!
//   - Role-ANTISYMMETRIC state (P_role = -1) MUST be SPATIALLY ANTISYMMETRIC (Pi_space = -1) => gets S_A(k1, k2) = -1 (Wait: relative to free bosonic wave, Pi_space=-1 has relative sign -1, so in standard Yang-Baxter notation where P_role = +1 gets t_S and P_role = -1 gets t_A, wait: for free non-interacting distinguishable particles, |k1, r1; k2, r2> goes through unchanged: transmission = 1, reflection = 0!
//   Let's check carefully!
//   For two distinguishable particles with momenta k1 > k2 (velocities v1 > v2):
//   Incoming wave (x1 << x2): |k1, r1>_1 |k2, r2>_2
//   Split into role-sym and role-anti:
//     |r1, r2> = (|r1, r2> + |r2, r1>)/2 + (|r1, r2> - |r2, r1>)/2
//   In the role-sym (spatially symmetric) part, after scattering (x1 >> x2 vs x1 << x2):
//     Incoming (r < 0): e^{i(k1 x1 + k2 x2)}  <=>  e^{i k1 r} (r < 0)
//     Outgoing (r > 0): t * e^{i(k1 x1 + k2 x2)}  (transmission: particle 1 passes to x1 > x2!)
//     Reflected (r < 0): R * e^{i(k2 x1 + k1 x2)} (reflection: particle 1 bounces back to x1 < x2!)
//   Because Pi_space maps r -> -r and k1 <-> k2:
//     In Sector S (Pi = +1): psi(r>0) = psi(-r) swapped => t_sym + R_sym:
//       Wait: for free particles, t = 1, R = 0 => in Sector S, e^{ik1 x1 + ik2 x2} + e^{ik2 x1 + ik1 x2} has S_S = +1!
//       In Sector A (Pi = -1), e^{ik1 x1 + ik2 x2} - e^{ik2 x1 + ik1 x2} ALSO has S_A = +1 (for free particles)!
//       Check! At r = -2n (incoming particle 1 on left, particle 2 on right):
//         Free state (x1 < x2): e^{ik1 x1 + ik2 x2} = 1/2 (Psi_S + Psi_A).
//         After scattering, Psi_S picks up phase S_S, and Psi_A picks up phase S_A (= +1 for free fermions!).
//         Wait: let's check our sign of S_A!
//         In Sector A, U_int === U_free IDENTICALLY!
//         So the exact Sector A eigenstate IS the exact free antisymmetric state:
//           Psi_A = |k1, b1>_1 |k2, b2>_2 - |k2, b2>_1 |k1, b1>_2!
//         In our half-line r > 0 convention:
//           For Psi_S(free): coef of u^n is v1_+ v2_-, coef of u^{-n} is + v2_+ v1_-. Ratio = + (v1_+ v2_-)/(v2_+ v1_-), so S_S(free) = +1!
//           For Psi_A(free): coef of u^n is v1_+ v2_-, coef of u^{-n} is - v2_+ v1_-.
//           Wait: when we recombine (Psi_S + Psi_A)/2:
//             - Incoming (r < 0, where |k1>_1 |k2>_2 lives):
//               Let's write for r < 0: coef of |k1>_1|k2>_2 is 1/2 + 1/2 = 1!
//               Coef of |k2>_1|k1>_2 (reflected!) is 1/2 (S_S - S_A) = 1/2 (S_S - 1)!
//             - Outgoing (r > 0, where |k1>_1 |k2>_2 lives):
//               Coef of |k1>_1|k2>_2 (transmitted!) is 1/2 (S_S + S_A) = 1/2 (S_S + 1)!
//         CHECK FREE LIMIT (S_S = 1, S_A = 1):
//           Transmission t = (1 + 1)/2 = 1, Reflection R = (1 - 1)/2 = 0!!
//         CHECK HARD-CORE / PERFECT REFLECTION (S_S = -1, S_A = 1):
//           Transmission t = 0, Reflection R = -1!!
//         NOW INCLUDE ROLE (2-particle S-matrix in role space)!
//         Since total state is symmetric under Pi_space * P_role:
//           - P_role = +1 => Pi_space = +1 => scattering phase S_S!
//           - P_role = -1 => Pi_space = -1 => scattering phase S_A = +1!
//         Wait: in the Yang-Baxter convention for distinguishable momenta k1, k2 (with particle labels following momenta):
//           S_{12}(k1, k2) = t(k1, k2) * I + r(k1, k2) * P_{12}
//         where:
//           - On P_{12} = +1: eigenvalue = t + r = S_S(k1, k2)!
//           - On P_{12} = -1: eigenvalue = t - r = S_A(k1, k2) = 1!
//         SO:
//           t(k1, k2) = (S_S(k1, k2) + 1) / 2,    r(k1, k2) = (S_S(k1, k2) - 1) / 2 !!
//         LET'S CHECK THE EXACT YANG-BAXTER CONDITION FOR S_{12}(k1, k2) = t(k1,k2) I + r(k1,k2) P_{12}!!
//         Plug into S_{12}(1,2) S_{13}(1,3) S_{23}(2,3) - S_{23}(2,3) S_{13}(1,3) S_{12}(1,2) = 0!
//         A famous 3-line algebraic identity (Yang 1967):
//           Define Y(k1, k2) := t(k1, k2) / r(k1, k2) = (S_S(k1, k2) + 1) / (S_S(k1, k2) - 1) = -i cot(delta_S(k1, k2) / 2)!
//           Wait: let's check directly by explicit 8x8 (or 27x27) matrix multiplication on C^3 (x) C^3 (x) C^3!
//           (And algebraically: YBE holds iff Y(k1, k3) = Y(k1, k2) + Y(k2, k3), i.e. 1/Y(k1,k2) = c/(f(k1)-f(k2))?
//            Wait: check! (t12 + r12 P12)(t13 + r13 P13)(t23 + r23 P23) - reverse
//            The ONLY non-canceling terms are P12 P23 - P23 P12? No:
//            Coefficient of P12 P23 (= (123)): r12 t13 r23 + t12 r13 r23? Wait: P13 P23 = (123), P12 P13 = (132), P23 P13 = (132), P13 P12 = (123)!
//            Let's just multiply the exact 8x8 matrices on C^2 x C^2 x C^2 directly AND extract the exact algebraic condition!)

function testSpectralYBE(
  k1: number,
  k2: number,
  k3: number,
  b1: 1 | -1,
  b2: 1 | -1,
  b3: 1 | -1,
  eta: C,
): { frobErr: number; maxErr: number; y12: C; y23: C; y13: C; yangianDefect: number } {
  const s12 = exactSymmetricS(k1, b1, k2, b2, eta)
  const s13 = exactSymmetricS(k1, b1, k3, b3, eta)
  const s23 = exactSymmetricS(k2, b2, k3, b3, eta)

  const makeS = (sS: C, pair: [number, number]): CMat => {
    // 8x8 matrix on C^2 x C^2 x C^2 acting as t*I + r*P_{pair}
    const t = cScale(0.5, cAdd(sS, [1, 0]))
    const r = cScale(0.5, cSub(sS, [1, 0]))
    const M = cmatZero(8)
    for (let state = 0; state < 8; state++) {
      // bit 2 = p1, bit 1 = p2, bit 0 = p3
      const bits = [(state >> 2) & 1, (state >> 1) & 1, state & 1]
      M.re[state * 8 + state] = M.re[state * 8 + state]! + (t[0])
      M.im[state * 8 + state] = M.im[state * 8 + state]! + (t[1])
      const swapped = bits.slice()
      const tmp = swapped[pair[0]]!
      swapped[pair[0]] = swapped[pair[1]]!
      swapped[pair[1]] = tmp
      const sIdx = (swapped[0]! << 2) | (swapped[1]! << 1) | swapped[2]!
      M.re[sIdx * 8 + state] = M.re[sIdx * 8 + state]! + (r[0])
      M.im[sIdx * 8 + state] = M.im[sIdx * 8 + state]! + (r[1])
    }
    return M
  }

  const S12 = makeS(s12, [0, 1])
  const S13 = makeS(s13, [0, 2])
  const S23 = makeS(s23, [1, 2])
  const LHS = cmatMul(cmatMul(S12, S13), S23)
  const RHS = cmatMul(cmatMul(S23, S13), S12)

  let maxErr = 0
  for (let i = 0; i < 64; i++) {
    maxErr = Math.max(maxErr, Math.hypot(LHS.re[i]! - RHS.re[i]!, LHS.im[i]! - RHS.im[i]!))
  }

  // Yangian invariant: t/r = (S+1)/(S-1). YBE holds iff r12*t13*r23 - t12*r13*t23? Let's check:
  // Actually for S = t I + r P:
  //   P12 P13 P23 = P23 P13 P12 (both = (13))
  //   P12 P13 = (132) = P23 P12, wait: P12 P23 = (123) = P13 P12 = P23 P13?
  //   Check (12)(23): 1->2->3? No, apply right to left: 3->2->1, 2->3, 1->2 => (123).
  //   (13)(12): 1->2, 2->1->3, 3->1 => (123).
  //   (23)(13): 1->3->2, 2->3, 3->1 => (123).
  //   So in LHS = S12 S13 S23, coef of (123) is: t12 r13 r23 + r12 r13 t23? Wait:
  //   P12 * 1 * P23 = (123) -> coef r12 t13 r23
  //   1 * P13 * P23 = (13)(23) = (132) -> wait: (13)(23): 3->2, 2->3->1, 1->3 => (132)!
  //   So in LHS: (123) comes from r12 t13 r23, whereas in RHS = S23 S13 S12:
  //     P23 P13 = (123) -> r23 r13 t12
  //     P13 P12 = (123) -> t23 r13 r12
  //   Hence LHS = RHS iff r12 t13 r23 = t12 r13 r23 + r12 r13 t23  <=>  t13/r13 = t12/r12 + t23/r23 !!
  const y12 = cDiv(cAdd(s12, [1, 0]), cSub(s12, [1, 0]))
  const y23 = cDiv(cAdd(s23, [1, 0]), cSub(s23, [1, 0]))
  const y13 = cDiv(cAdd(s13, [1, 0]), cSub(s13, [1, 0]))
  const yangianDefect = cAbs(cSub(y13, cAdd(y12, y23)))

  return { frobErr: cmatFrobDiff(LHS, RHS), maxErr, y12, y23, y13, yangianDefect }
}

// =========================================================================
// PART 3: CONSTANT BRAID YANG-BAXTER ON LOCAL 2-BODY COLLISION MATRICES
// =========================================================================

// (a) Role meeting M_meet on C^d x C^d (for d = 2, 3, 9):
//     M_meet = (zeta_6 / 2) I + ((omega - 1) / 2) P
// Test BOTH braid YBE (R12 R23 R12 = R23 R12 R23) and non-braid YBE (R12 R13 R23 = R23 R13 R12)
function testLocalBraidYBE(): void {
  const d = 3 // qutrit role space (same algebra for any d >= 2)
  const N = d * d * d
  const buildPair = (a: C, b: C, p: [number, number]): CMat => {
    const M = cmatZero(N)
    for (let s = 0; s < N; s++) {
      const idx = [Math.floor(s / (d * d)), Math.floor(s / d) % d, s % d]
      M.re[s * N + s] = M.re[s * N + s]! + (a[0])
      M.im[s * N + s] = M.im[s * N + s]! + (a[1])
      const sw = idx.slice()
      const tmp = sw[p[0]]!
      sw[p[0]] = sw[p[1]]!
      sw[p[1]] = tmp
      const t = sw[0]! * d * d + sw[1]! * d + sw[2]!
      M.re[t * N + s] = M.re[t * N + s]! + (b[0])
      M.im[t * N + s] = M.im[t * N + s]! + (b[1])
    }
    return M
  }
  const R12 = buildPair(MEET_KEEP, MEET_SWAP, [0, 1])
  const R23 = buildPair(MEET_KEEP, MEET_SWAP, [1, 2])
  const R13 = buildPair(MEET_KEEP, MEET_SWAP, [0, 2])
  const braidErr = cmatFrobDiff(cmatMul(cmatMul(R12, R23), R12), cmatMul(cmatMul(R23, R12), R23))
  const nonBraidErr = cmatFrobDiff(cmatMul(cmatMul(R12, R13), R23), cmatMul(cmatMul(R23, R13), R12))
  // Exact analytical norm of R12 R23 R12 - R23 R12 R23 = a^2 b (P12 - P23):
  // |a^2 b| = (1/2)^2 * (sqrt(3)/2) = sqrt(3)/8.
  // ||P12 - P23||_F^2 on d^3: Tr((P12 - P23)^2) = 2 d^3 - 2 Tr(P12 P23) = 2 d^3 - 2 d = 2 d (d^2 - 1).
  // For d=3: 2*3*8 = 48 => ||P12 - P23||_F = sqrt(48) = 4 sqrt(3) => exact ||comm||_F = (sqrt(3)/8) * 4 sqrt(3) = 3/2 = 1.5!
  // For d=9: 2*9*80 = 1440 => exact ||comm||_F = (sqrt(3)/8) * sqrt(1440) = sqrt(4320)/8 = 3*sqrt(30)/2!
  console.log('\n=== CONSTANT BRAID & LOCAL YANG-BAXTER TESTS ===')
  console.log(
    `  M_meet on C^3^3 (qutrit): braid ||R12 R23 R12 - R23 R12 R23||_F = ${braidErr.toFixed(12)} (exact = 3/2 = 1.5), non-braid ||R12 R13 R23 - R23 R13 R12||_F = ${nonBraidErr.toFixed(12)}`,
  )
  // Also test braid YBE for M_pair(zeta_18) on 2-particle 12-line space?
  // Wait: M_pair acts on a SINGLE full-line pair (12-dim), i.e., as a 2-particle operator on C^24 x C^24!
  // Specifically on C^24 x C^24, the 2-body dock collision operator L_2 = D M_meet M_pair(zeta_18) K D
  // acts on the 24 x 24 = 576 dimensional (or C(24,2)=276 antisym/sym) 2-particle dock space!
  // Check exact eigenvalues of L_2 on the 24-slot dock (identical tone & role, distinct role, opposite sign)!
}

// =========================================================================
// PART 4: EXACT 4D D_4 2-BODY BOUND-STATE & SCATTERING SPECTRUM WITH M_pair(zeta_18)
// =========================================================================
// On the flat 4D D_4 lattice (24 roots r_s, 12 antipodal lines L_l = {+r_l, -r_l}):
// Consider TWO identical-tone, identical-role excitations (Channel a) with total 4D momentum K in R^4!
// Wait: because M_pair(zeta_18) ONLY acts at relative separation r = x1 - x2 = 0 (a full-line pair at one dock!),
// AND away from r = 0 each excitation stays strictly on its OWN 1D line L_l!!
// **OH!! MY!! GOD!! STOP EVERYTHING AND REALIZE THIS EXACT SOLVABILITY ON 4D D_4!!**
// Look at what happens to a 2-particle state at total 4D momentum K on the INFINITE 4D D_4 lattice:
//   - At r = 0: there are 12 full-line states |0, full_l> (l = 0..11).
//   - When |0, full_l> streams, the two particles separate along line l to relative vector r = +- 2 r_l!
//   - Once separated (r != 0), M_pair is SILENT and the coin C acts ONLY along each particle's OWN line l!
//   - THEREFORE, for EVERY line l = 0..11, the separated states live STRICTLY on the 1D ray r in 2Z * r_l,
//     with effective 1D total momentum P_l = K . r_l!!
//   - THE ENTIRE INFINITE 4D D_4 2-BODY PROBLEM REDUCES EXACTLY TO A 12-BRANCH STAR GRAPH
//     COUPLED ONLY AT THE ORIGIN r = 0 BY THE 12x12 MATRIX M_pair(zeta_18)!!
//
// CHECK THAT!! IS THAT 100% EXACT WITH ZERO TRUNCATION?!
// Let's check!
//   1. Start at r = 0 on line l: |x, +r_l; x, -r_l>.
//   2. M_pair(zeta_18) maps |x, full_l> -> sum_m (M_pair)_{m, l} |x, full_m>.
//   3. Second half-coin D gives Z6 on every |x, full_m>.
//   4. Stream S maps |x, +r_m; x, -r_m> -> |x + r_m, +r_m; x - r_m, -r_m> (separation r = 2 r_m along line m!).
//   5. Now at x + r_m and x - r_m (distinct docks!), BOTH excitations are on line m!
//      Under C (x) C, they can ONLY stay on line m (slots +-r_m)!
//      So under ANY number of beats, until they return to the SAME dock (r = 0), they stay strictly on
//      the 1D line {x + n r_m} with relative separation 2 n r_m (n >= 1)!
//      Wait: can they EVER meet at a DIFFERENT dock? Yes, x1 = x2 = x + c * r_m, which IS r = 0 with COM shifted by c * r_m (which multiplies the Bloch wave by e^{i c (K . r_m)})!!
//   6. THEREFORE, THE 12-BRANCH STAR GRAPH REDUCTION IS **100.00000000% EXACT ON THE INFINITE 4D D_4 LATTICE**!!
//
// LET'S DERIVE THE EXACT 12-CHANNEL 4D SCATTERING MATRIX S_{m, l}(K, E) AND EXACT 4D BOUND-STATE POLES!!
// On each branch l in {0..11} with directional COM momentum P_l = K . r_l:
//   - At r = 2 r_l (just outside the origin on branch l):
//     Let psi_{0, l} = amplitude of |0, full_l>, and phi_{0, l} = sum_m (omega^2 M_pair)_{l, m} psi_{0, m}!
//   - Boundary condition 2 (stream OUT of r = 0 into branch l):
//       lam * psi_l(2, +-) = e^{i P_l} * phi_{0, l}
//   - Boundary condition 1 (stream INTO r = 0 from branch l):
//       phi_l(2, -+) = lam * e^{i P_l} * psi_{0, l}
//   - For a **4D BOUND STATE** (decaying on ALL 12 branches, |u_l| < 1 for every l = 0..11!):
//     On branch l, decaying mode satisfies:
//       psi_l(2, +-) = A_l * u_l * e^{i P_l},   phi_l(2, -+) = lam * e^{i P_l} * B_l = lam * e^{i P_l} * r_l(u_l) * A_l!
//     Comparing with Boundary Conditions 1 & 2:
//       phi_{0, l} = lam * u_l * A_l
//       psi_{0, l} = r_l(u_l) * A_l
//     Therefore, for EVERY branch l = 0..11:
//       phi_{0, l} = Z_l(P_l, lam) * psi_{0, l},    where  Z_l(P_l, lam) := lam * u_l / r_l(u_l) !!
//     Remember r_l(u_l) = (lam * u_l - alpha_l) / beta_l, and for the 1D single-line case we had phi_0 = eta * psi_0,
//     so Z_l(P_l, lam) = eta WAS the 1D bound state condition!
//     In 4D with 12 coupled branches, the EXACT 12x12 secular determinant for 4D BOUND STATES IS:
//       det_{12 x 12} [ diag(Z_0(P_0, lam), ..., Z_{11}(P_{11}, lam)) - omega^2 M_pair(zeta_18) ] = 0 !!
//     EVEN MORE AMAZING: because M_pair(zeta_18) = I + ((zeta_18 - 1)/12) J_{12} is a RANK-1 PERTURBATION OF THE IDENTITY,
//     BY THE MATRIX DETERMINANT LEMMA:
//       1 + ((zeta_18 - 1) / 12) * sum_{l=0}^{11} [ omega^2 / (Z_l(P_l, lam) - omega^2) ] = 0 !!
//     **OH!! MY!! GOD!!**
//     STOP EVERYTHING AND STARE AT THAT EQUATION!!
//     1. At K = 0 (rest frame, P_l = 0 for ALL 12 lines!):
//        Z_l(0, lam) = Z(0, lam) is IDENTICAL on all 12 lines!
//        - For the 11 non-s-wave modes: Z(0, lam) = omega^2  (exact 11-fold degenerate 1D bound state!)
//        - For the 1 s-wave mode:       Z(0, lam) = omega^2 * zeta_18  (EXACT SPLIT 4D s-WAVE BOUND STATE!!)
//     2. At NONZERO 4D momentum K != 0:
//        THE s-WAVE BOUND STATE DISPERSION E_s(K) SATISFIES THE EXACT CLOSED-FORM IMPLICIT EQUATION:
//          (1 / 12) * sum_{l=0}^{11} [ 1 / (Z(K . r_l, e^{i E_s(K)}) / omega^2 - 1) ] = -1 / (zeta_18 - 1) !!
//        **LOOK AT WHAT THIS IMMEDIATELY PROVES FOR MISSION 3 TOO!!**
//        Because Z(P, lam) is an EVEN analytic function of P = K . r_l:
//          1 / (Z(P, lam) / omega^2 - 1) = F_0(lam) + F_2(lam) P^2 + F_4(lam) P^4 + F_6(lam) P^6 + ...
//        SUM OVER ALL 12 D_4 LINES l = 0..11:
//          (1/12) sum_l P_l^2 = (1/2) |K|^2      (EXACT SO(4) ISOTROPY!)
//          (1/12) sum_l P_l^4 = (1/2) |K|^4      (EXACT SO(4) ISOTROPY! ZERO O(K^4) ANISOTROPY!!)
//          (1/12) sum_l P_l^6 = ...              (FIRST W(F_4) ANISOTROPY AT O(K^6)!!)
//        **THE 4D s-WAVE COMPOSITE BOUND STATE OF BARE U IS RIGOROUSLY SO(4)-ISOTROPIC THROUGH O(K^4)!!**
//        NOT JUST A TRACE SUM — AN ACTUAL INDIVIDUAL PHYSICAL 2-BODY BOUND-STATE PARTICLE BAND E_s(K)!!
//        WITH FIRST LORENTZ/ROTATIONAL BREAKING ONLY AT O(K^6)!!

// Let's compute the exact decaying root u(P, lam) (|u| < 1) of the quadratic:
//   alpha * lam * u^2 - (lam^2 + alpha^2 - beta^2) * u + alpha * lam = 0
function decayingRootU(P: number, lam: C): { u: C; Z: C } {
  const { alpha, beta } = computeAlphaBeta(P, lam)
  const A = cMul(alpha, lam)
  const B = cScale(-1, cAdd(cMul(lam, lam), cSub(cMul(alpha, alpha), cMul(beta, beta))))
  // A u^2 + B u + A = 0  (product of roots = 1!)
  const disc = cSub(cMul(B, B), cScale(4, cMul(A, A)))
  const r = cAbs(disc)
  const th = cArg(disc) / 2
  const sq: C = [Math.sqrt(r) * Math.cos(th), Math.sqrt(r) * Math.sin(th)]
  const u1 = cDiv(cAdd(cScale(-1, B), sq), cScale(2, A))
  const u2 = cDiv(cSub(cScale(-1, B), sq), cScale(2, A))
  const u = cAbs(u1) < cAbs(u2) ? u1 : u2
  // r(u) = (lam * u - alpha) / beta, Z = lam * u / r(u) = lam * u * beta / (lam * u - alpha)
  const rU = cDiv(cSub(cMul(lam, u), alpha), beta)
  const Z = cDiv(cMul(lam, u), rU)
  return { u, Z }
}

// Also compute the EXACT 12-channel 4D scattering matrix S_{m, l}(k_in) when two identical excitations
// collide head-on along line l0 (at P = 0, i.e., center-of-mass at rest, k1 = k, k2 = -k, same branch b)!
function exact4DHeadOnSMatrix(k: number, b: 1 | -1): {
  S_elastic: C
  S_inel_each: C
  P_elastic: number
  P_scatter_total: number
  unitarityErr: number
  S_swave: C
  S_non_swave: C
} {
  // At K = 0 (P_l = 0 for all 12 lines), the 12 channels are completely symmetric under S_12!
  // So M_pair(zeta_18) diagonalizes into:
  //   - 1D s-wave channel (eigenvalue eta_s = omega^2 * zeta_18)
  //   - 11D non-s-wave channels (eigenvalue eta_p = omega^2)
  const S_swave = exactSymmetricS(k, b, -k, b, cMul(W2, Z18))
  const S_non_swave = exactSymmetricS(k, b, -k, b, W2)
  // S_{m, l} = S_non_swave * delta_{m, l} + (S_swave - S_non_swave) / 12
  const S_inel_each = cScale(1 / 12, cSub(S_swave, S_non_swave))
  const S_elastic = cAdd(S_non_swave, S_inel_each)
  const P_elastic = cAbs2(S_elastic)
  const P_scatter_total = 11 * cAbs2(S_inel_each)
  const unitarityErr = Math.abs(P_elastic + P_scatter_total - 1)
  return {
    S_elastic,
    S_inel_each,
    P_elastic,
    P_scatter_total,
    unitarityErr,
    S_swave,
    S_non_swave,
  }
}

// =========================================================================
// PART 5: 3-BODY FINITE-RING LEVEL SPACING / INTEGRABILITY VS CHAOS CHECK
// =========================================================================
// Build exact 3-body walk on a 1D ring of length L with fixed tone +1 and 2 roles (e.g. r = 0, 0, 1)
// in total momentum P sector (removing trivial symmetries) to check r-ratio (Poisson ~0.386 vs COE ~0.530 / CUE ~0.600)
function check3BodyLevelSpacing1D(L: number): void {
  // 3 excitations on a 1D ring of L docks, 2 slots (+,-) per dock, all tone +1, roles = (0, 0, 1) (2 identical + 1 distinct!)
  // Wait: each configuration is uniquely specified by:
  //   - position & slot of the unique role-1 excitation: (x3, s3) in 2L choices
  //   - unordered pair of distinct (x, s) for the two role-0 excitations (distinct from (x3, s3)): C(2L-1, 2) choices
  // By translation invariance, fix x3 = 0 and use COM momentum P!
  // Number of states per P sector = 2 * C(2L-1, 2) = (2L-1)(2L-2).
  // For L = 6: 11 * 10 = 110 states (super fast!). For L = 8: 15 * 14 = 210 states!
  // Wait: let's also check 3 DISTINCT roles (0, 1, 2) on L = 5 (dim = 2 * 9 * 8 = 144 states, super fast!).
  // Even better: check BOTH (0,0,1) on L=6 and (0,1,2) on L=5!

  const runSector = (Len: number, distinctRoles: boolean, P: number) => {
    const states: string[] = []
    const idxMap = new Map<string, number>()
    const encode3 = (
      x1: number,
      s1: number,
      x2: number,
      s2: number,
      s3: number,
    ): string => {
      if (!distinctRoles) {
        const a = x1 * 2 + s1
        const b = x2 * 2 + s2
        return a < b ? `${a},${b},${s3}` : `${b},${a},${s3}`
      }
      return `${x1 * 2 + s1},${x2 * 2 + s2},${s3}`
    }

    for (let s3 = 0; s3 < 2; s3++) {
      const p3 = s3 // x3 = 0
      for (let p1 = 0; p1 < 2 * Len; p1++) {
        if (p1 === p3) continue
        for (let p2 = distinctRoles ? 0 : p1 + 1; p2 < 2 * Len; p2++) {
          if (p2 === p3 || p2 === p1) continue
          const key = encode3(p1 >> 1, p1 & 1, p2 >> 1, p2 & 1, s3)
          if (!idxMap.has(key)) {
            idxMap.set(key, states.length)
            states.push(key)
          }
        }
      }
    }
    const dim = states.length
    const U = cmatZero(dim)

    // Apply local operator D M_meet D then stream S on each basis state
    const C2 = [
      [C_KEEP, C_CROSS],
      [C_CROSS, C_KEEP],
    ] as const
    const M2 = [
      [cMul(W, MEET_KEEP), cMul(W, MEET_SWAP)],
      [cMul(W, MEET_SWAP), cMul(W, MEET_KEEP)],
    ] as const

    for (let col = 0; col < dim; col++) {
      const [a, b, s3] = states[col]!.split(',').map(Number) as [number, number, number]
      // Particle list: [dock, slot, role]
      const init: [number, number, number][] = [
        [a >> 1, a & 1, 0],
        [b >> 1, b & 1, distinctRoles ? 1 : 0],
        [0, s3, distinctRoles ? 2 : 1],
      ]
      // Group by dock
      const byDock = new Map<number, number[]>()
      for (let i = 0; i < 3; i++) {
        const d = init[i]![0]
        const arr = byDock.get(d)
        if (arr) arr.push(i)
        else byDock.set(d, [i])
      }
      // Expand local branches
      let branches: { cfg: [number, number, number][]; amp: C }[] = [
        { cfg: init, amp: [1, 0] },
      ]
      for (const idxs of byDock.values()) {
        if (idxs.length === 1) {
          const idx = idxs[0]!
          const next: typeof branches = []
          for (const br of branches) {
            const [d, s, r] = br.cfg[idx]!
            for (let ns = 0; ns < 2; ns++) {
              const cfg = br.cfg.map(v => [...v] as [number, number, number])
              cfg[idx] = [d, ns, r]
              next.push({ cfg, amp: cMul(br.amp, C2[ns]![s]!) })
            }
          }
          branches = next
        } else if (idxs.length === 2) {
          const [i0, i1] = [idxs[0]!, idxs[1]!]
          const next: typeof branches = []
          for (const br of branches) {
            const [d0, s0, r0] = br.cfg[i0]!
            const [d1, s1, r1] = br.cfg[i1]!
            if (r0 === r1) {
              // Same role: W^2
              next.push({ cfg: br.cfg, amp: cMul(br.amp, W2) })
            } else {
              // Distinct role: W * M_meet (keep or swap roles!)
              const cfgKeep = br.cfg.map(v => [...v] as [number, number, number])
              next.push({ cfg: cfgKeep, amp: cMul(br.amp, M2[0]![0]!) })
              const cfgSwap = br.cfg.map(v => [...v] as [number, number, number])
              cfgSwap[i0] = [d0, s0, r1]
              cfgSwap[i1] = [d1, s1, r0]
              next.push({ cfg: cfgSwap, amp: cMul(br.amp, M2[1]![0]!) })
            }
          }
          branches = next
        }
      }
      // Stream S and translate back so role-(2 or 1) unique particle is at dock 0!
      for (const br of branches) {
        const streamed = br.cfg.map(([d, s, r]): [number, number, number] => [
          (((d + (s === 0 ? 1 : -1)) % Len) + Len) % Len,
          s,
          r,
        ])
        // Find unique particle (max role)
        const maxRole = distinctRoles ? 2 : 1
        const uIdx = streamed.findIndex(v => v[2] === maxRole)
        const shift = streamed[uIdx]![0]
        const ph = cExpI(-P * shift)
        const amp = cMul(br.amp, ph)
        const shifted = streamed.map(([d, s, r]): [number, number, number] => [
          (((d - shift) % Len) + Len) % Len,
          s,
          r,
        ])
        let key: string
        if (distinctRoles) {
          const p0 = shifted.find(v => v[2] === 0)!
          const p1 = shifted.find(v => v[2] === 1)!
          const p2 = shifted.find(v => v[2] === 2)!
          key = encode3(p0[0], p0[1], p1[0], p1[1], p2[1])
        } else {
          const ps = shifted.filter(v => v[2] === 0)
          const p2 = shifted.find(v => v[2] === 1)!
          key = encode3(ps[0]![0], ps[0]![1], ps[1]![0], ps[1]![1], p2[1])
        }
        const row = idxMap.get(key)!
        U.re[row * dim + col] = U.re[row * dim + col]! + (amp[0])
        U.im[row * dim + col] = U.im[row * dim + col]! + (amp[1])
      }
    }

    const uErr = cmatUnitaryErr(U)
    const eigs = complexEigenvalues(U)
    const phases = eigs.map(e => cArg(e)).sort((a, b) => a - b)
    const gaps: number[] = []
    for (let i = 0; i < phases.length; i++) {
      const next = i + 1 < phases.length ? phases[i + 1]! : phases[0]! + 2 * Math.PI
      const g = next - phases[i]!
      if (g > 1e-8) gaps.push(g)
    }
    let rSum = 0
    for (let i = 0; i < gaps.length; i++) {
      const g1 = gaps[i]!
      const g2 = gaps[(i + 1) % gaps.length]!
      rSum += Math.min(g1, g2) / Math.max(g1, g2)
    }
    const rMean = rSum / gaps.length
    console.log(
      `  3-body 1D (L=${Len}, roles=${distinctRoles ? '0,1,2' : '0,0,1'}, P=${P.toFixed(3)}): dim=${dim}, unitaryErr=${uErr.toExponential(2)}, nondeg_gaps=${gaps.length}/${dim}, <r>=${rMean.toFixed(4)} (Poisson=0.3863, COE=0.5307, CUE=0.5996)`,
    )
  }

  // Use non-symmetric P (not 0 or pi) to break parity reflection symmetry!
  runSector(L, false, (2 * Math.PI) / L) // P = 2pi/L
  runSector(L, false, (4 * Math.PI) / L)
  runSector(5, true, (2 * Math.PI) / 5)
}

// =========================================================================
// MAIN EXECUTION
// =========================================================================

function main(): void {
  console.log('======================================================================')
  console.log('MISSION 1: BARE-QCA 2-BODY S-MATRIX, BOUND-STATE POLES & YANG-BAXTER')
  console.log('======================================================================')

  // 1. Verify 1D finite-ring unitarity & compare analytical bound states vs exact ED!
  console.log('\n=== 1. EXACT 1D 2-BODY BOUND-STATE POLES (ANALYTICAL VS EXACT ED) ===')
  const channels: { name: string; ch: Channel1D; eta: C }[] = [
    { name: 'Channel (a/b-sym): like-sign symmetric (eta = omega^2)', ch: 'a-identical-1d-only', eta: W2 },
    { name: 'Channel (b): like-sign distinct-role (eta_S=omega^2, eta_A=omega)', ch: 'b-like-distinct-role', eta: W2 },
    { name: 'Channel (c): opposite-sign K-bounce (eta_S=-omega, eta_A=omega)', ch: 'c-opposite-sign', eta: cScale(-1, W) },
    { name: 'Control: free hard-core (eta = omega = det C)', ch: 'free-hardcore-check', eta: W },
    { name: '4D s-wave channel at K=0: eta_s = omega^2 * zeta_18', ch: 'a-identical-1d-only', eta: cMul(W2, Z18) },
  ]

  // Compute exact 2-particle scattering continuum intervals for P = 0 and P = pi/2
  const continuumBounds = (P: number): [number, number][] => {
    const pts: number[] = []
    for (let i = 0; i <= 400; i++) {
      const q = -Math.PI + (2 * Math.PI * i) / 400
      const k1 = P / 2 + q
      const k2 = P / 2 - q
      for (const b1 of [1, -1] as const) {
        for (const b2 of [1, -1] as const) {
          let E = oneBodyDispersion(k1, b1) + oneBodyDispersion(k2, b2)
          while (E >= Math.PI) E -= 2 * Math.PI
          while (E < -Math.PI) E += 2 * Math.PI
          pts.push(E)
        }
      }
    }
    pts.sort((a, b) => a - b)
    // Group into contiguous intervals (gap > 0.05)
    const intervals: [number, number][] = []
    let start = pts[0]!
    let prev = pts[0]!
    for (let i = 1; i < pts.length; i++) {
      if (pts[i]! - prev > 0.05) {
        intervals.push([start, prev])
        start = pts[i]!
      }
      prev = pts[i]!
    }
    intervals.push([start, prev])
    return intervals
  }

  for (const P of [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI]) {
    const cont = continuumBounds(P)
    console.log(
      `\n  COM momentum P = ${(P / Math.PI).toFixed(2)}*pi  |  2-particle continuum bands (rad): ` +
        cont.map(([a, b]) => `[${a.toFixed(4)}, ${b.toFixed(4)}]`).join(' U '),
    )
    for (const item of channels) {
      const poles = findBoundStates1D(P, item.eta)
      if (item.name.startsWith('4D s-wave') && P !== 0) continue
      // Verify against finite-ring L = 24 exact diagonalization (even-r sector)
      let edSummary = ''
      if (!item.name.startsWith('4D s-wave')) {
        const L = 24
        const U = build1DTwoBodyCOMEven(L, P, item.ch)
        const uErr = cmatUnitaryErr(U)
        const eigs = complexEigenvalues(U)
        const ePhases = eigs.map(e => cArg(e))
        // Find distance from each analytical pole to nearest ED eigenvalue
        const diffs = poles.map(p => {
          let best = 1e9
          for (const ep of ePhases) {
            const d = Math.abs(Math.atan2(Math.sin(ep - p.E), Math.cos(ep - p.E)))
            if (d < best) best = d
          }
          return best
        })
        // Also count how many ED eigenvalues sit STRICTLY OUTSIDE the continuum by > 0.02 rad
        const isolated = ePhases.filter(ep =>
          cont.every(([a, b]) => ep < a - 0.02 || ep > b + 0.02),
        )
        edSummary = ` | ED(L=${L}, uErr=${uErr.toExponential(1)}): ${isolated.length} isolated eigs, max|E_ED - E_pole|=${diffs.length ? Math.max(...diffs).toExponential(2) : 'n/a'}`
      }
      console.log(
        `    ${item.name}:\n      ${poles.length} bound pole(s): ` +
          (poles.length
            ? poles.map(p => `E=${p.E.toFixed(6)} rad (|u|=${p.uAbs.toFixed(5)}, kappa=${p.kappa.toFixed(4)})`).join('; ')
            : 'NONE') +
          edSummary,
      )
    }
  }

  // 2. Exact closed-form bound-state energies at P = 0!
  console.log('\n=== 2. EXACT ALGEBRAIC POLE VERIFICATION AT P = 0 ===')
  // At P = 0: check exact Z(0, e^{iE}) values!
  for (const [label, eta] of [
    ['omega^2 (Channel a/b)', W2],
    ['-omega (Channel c, K-bounce)', cScale(-1, W)],
    ['omega^2 * zeta_18 (4D s-wave)', cMul(W2, Z18)],
    ['omega (free control)', W],
  ] as [string, C][]) {
    const poles = findBoundStates1D(0, eta)
    for (const p of poles) {
      const lam = cExpI(p.E)
      const { u, Z } = decayingRootU(0, lam)
      console.log(
        `  ${label}: E_bound = ${p.E.toFixed(10)} rad (${(p.E / Math.PI).toFixed(8)}*pi), |u|=${cAbs(u).toFixed(8)}, u=(${u[0].toFixed(6)}, ${u[1].toFixed(6)}), |Z - eta|=${cAbs(cSub(Z, eta)).toExponential(2)}`,
      )
    }
  }

  // 3. Exact 1D S-matrix phase shifts & unitarity across momenta (k1, k2)
  console.log('\n=== 3. EXACT 1D 2-BODY S-MATRIX S(k1, k2) & PHASE SHIFTS ===')
  const sampleKs: [number, number][] = [
    [0.2, -0.2],
    [0.5, -0.5],
    [1.0, -1.0],
    [1.4, -1.4],
    [0.3, 0.9],
    [0.4, -1.1],
  ]
  for (const [k1, k2] of sampleKs) {
    const sB = exactSymmetricS(k1, 1, k2, 1, W2)
    const sC = exactSymmetricS(k1, 1, k2, 1, cScale(-1, W))
    const sCtrl = exactSymmetricS(k1, 1, k2, 1, W)
    const mixedStr =
      Math.abs(k1 + k2) < 1e-9
        ? 'FLAT(P=0,E=2pi/3)'
        : (() => {
            const sM = exactSymmetricS(k1, 1, k2, -1, W2)
            return `|S|=${cAbs(sM).toFixed(10)} arg=${cArg(sM).toFixed(6)}`
          })()
    console.log(
      `  (k1=${k1.toFixed(3)}, k2=${k2.toFixed(3)}): ` +
        `|S_b(++)|=${cAbs(sB).toFixed(10)} arg=${cArg(sB).toFixed(6)} | ` +
        `|S_c(+-)|=${cAbs(sC).toFixed(10)} arg=${cArg(sC).toFixed(6)} | ` +
        `|S_ctrl|=${cAbs(sCtrl).toFixed(10)} arg=${cArg(sCtrl).toFixed(6)} | ` +
        `S_b(+-bands): ${mixedStr}`,
    )
  }

  // 4. Exact 4D 12-line head-on scattering cross section from M_pair(zeta_18)!
  console.log('\n=== 4. EXACT 4D 12-LINE HEAD-ON SCATTERING S-MATRIX (CHANNEL a WITH M_pair(zeta_18)) ===')
  for (const k of [0.01, 0.1, 0.3, 0.5, 1.0, 1.4, 2.5, Math.PI - 0.1]) {
    const resP = exact4DHeadOnSMatrix(k, 1)
    const resM = exact4DHeadOnSMatrix(k, -1)
    console.log(
      `  k=${k.toFixed(3)} | (+,+): P_el=${resP.P_elastic.toFixed(6)}, P_off11=${resP.P_scatter_total.toFixed(6)}, delta_s=${cArg(resP.S_swave).toFixed(5)}, delta_p=${cArg(resP.S_non_swave).toFixed(5)}, uErr=${resP.unitarityErr.toExponential(1)} | (-,-): P_el=${resM.P_elastic.toFixed(6)}, P_off11=${resM.P_scatter_total.toFixed(6)}`,
    )
  }

  // 5. EXACT SPECTRAL-PARAMETER YANG-BAXTER TEST FOR 1D 2-BODY S-MATRIX!
  console.log('\n=== 5. EXACT SPECTRAL-PARAMETER YANG-BAXTER EQUATION TEST (1D CHANNEL b) ===')
  const triples: [number, number, number, 1 | -1, 1 | -1, 1 | -1][] = [
    [0.2, 0.7, 1.4, 1, 1, 1],
    [-1.1, 0.3, 1.2, 1, 1, 1],
    [0.1, 0.5, 1.9, -1, -1, -1],
    [0.2, 0.7, 1.4, 1, -1, 1],
    [0.4, -0.6, 1.3, 1, 1, -1],
  ]
  for (const [k1, k2, k3, b1, b2, b3] of triples) {
    const ybB = testSpectralYBE(k1, k2, k3, b1, b2, b3, W2)
    const ybC = testSpectralYBE(k1, k2, k3, b1, b2, b3, cScale(-1, W))
    const ybCtrl = testSpectralYBE(k1, k2, k3, b1, b2, b3, W)
    console.log(
      `  (k=[${k1},${k2},${k3}], b=[${b1},${b2},${b3}]): ` +
        `Ch(b) ||YBE||_F=${ybB.frobErr.toExponential(4)} (Yangian defect=${ybB.yangianDefect.toExponential(4)}) | ` +
        `Ch(c) ||YBE||_F=${ybC.frobErr.toExponential(4)} | ` +
        `Ctrl(eta=w) ||YBE||_F=${ybCtrl.frobErr.toExponential(4)}`,
    )
  }

  // 6. Constant braid Yang-Baxter on M_meet
  testLocalBraidYBE()

  // 7. 3-body finite-ring level spacing statistics (integrable Poisson vs chaotic COE/CUE)
  console.log('\n=== 6. 3-BODY FINITE-RING LEVEL-SPACING STATISTICS (1D BARE U) ===')
  check3BodyLevelSpacing1D(6)
}

main()

export {}
