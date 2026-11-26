// Wave-4 Track W12 Probe 2: Level-spacing <r>, 3-body Bethe ansatz / diffraction, and k=4 symbolic Z[omega] proof!
const SQRT3 = Math.sqrt(3)
const PI = Math.PI

type C = readonly [number, number]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cExpI = (t: number): C => [Math.cos(t), Math.sin(t)]

const W_C: C = [-0.5, SQRT3 / 2]
const W2_C: C = [-0.5, -SQRT3 / 2]
const Z6_C: C = [0.5, SQRT3 / 2]
const Z18_C: C = [Math.cos(PI / 9), Math.sin(PI / 9)]
const C_KEEP: C = [0.25, SQRT3 / 4]
const C_CROSS: C = [0.75, -SQRT3 / 4]
const MEET_KEEP: C = [0.25, SQRT3 / 4]
const MEET_SWAP: C = [-0.75, SQRT3 / 4]

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }
const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })
const cmatEye = (n: number): CMat => { const m = cmatZero(n); for (let i = 0; i < n; i++) m.re[i * n + i] = 1; return m }

function cmatUnitaryErr(U: CMat): number {
  const n = U.n
  let maxE = 0
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sr = 0; let si = 0
      for (let k = 0; k < n; k++) {
        const ar = U.re[k * n + i]!; const ai = -U.im[k * n + i]!
        const br = U.re[k * n + j]!; const bi = U.im[k * n + j]!
        sr += ar * br - ai * bi; si += ar * bi + ai * br
      }
      maxE = Math.max(maxE, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }
  return maxE
}

function tridiagQL(d: Float64Array, eIn: Float64Array, z: Float64Array, n: number): void {
  const e = new Float64Array(n)
  for (let i = 1; i < n; i++) e[i - 1] = eIn[i]!
  e[n - 1] = 0
  for (let l = 0; l < n; l++) {
    let iter = 0
    for (;;) {
      let m = l
      while (m < n - 1) {
        if (Math.abs(e[m]!) <= 1e-15 * Math.max(1e-30, Math.abs(d[m]!) + Math.abs(d[m + 1]!))) break
        m++
      }
      if (m === l) break
      if (++iter > 80) break
      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)
      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? r : -r))
      let s = 1; let c = 1; let p = 0
      for (let i = m - 1; i >= l; i--) {
        const f = s * e[i]!; const b = c * e[i]!
        r = Math.hypot(f, g); e[i + 1] = r
        if (r === 0) { d[i + 1] = d[i + 1]! - p; e[m] = 0; break }
        s = f / r; c = g / r; g = d[i + 1]! - p
        const rr = (d[i]! - g) * s + 2 * c * b
        p = s * rr; d[i + 1] = g + p; g = c * rr - b
        for (let k = 0; k < n; k++) {
          const zki1 = z[k * n + (i + 1)]!; const zki = z[k * n + i]!
          z[k * n + (i + 1)] = s * zki + c * zki1; z[k * n + i] = c * zki - s * zki1
        }
      }
      if (r === 0 && m > l) continue
      d[l] = d[l]! - p; e[l] = g; e[m] = 0
    }
  }
}

function hermitianEigen(H: CMat): { readonly values: Float64Array; readonly vecs: CMat } {
  const n = H.n
  if (n === 1) return { values: new Float64Array([H.re[0]!]), vecs: cmatEye(1) }
  const hr = Float64Array.from(H.re); const hi = Float64Array.from(H.im)
  const qr = new Float64Array(n * n); const qi = new Float64Array(n * n)
  for (let i = 0; i < n; i++) qr[i * n + i] = 1
  const cSubRe = new Float64Array(n); const cSubIm = new Float64Array(n)
  for (let k = 0; k < n - 2; k++) {
    const m = n - k - 1
    let norm2 = 0
    for (let i = 0; i < m; i++) { const r = hr[(k + 1 + i) * n + k]!; const im = hi[(k + 1 + i) * n + k]!; norm2 += r * r + im * im }
    const sigma = Math.sqrt(norm2)
    if (sigma < 1e-30) continue
    const x0r = hr[(k + 1) * n + k]!; const x0i = hi[(k + 1) * n + k]!; const x0a = Math.hypot(x0r, x0i)
    const phR = x0a > 1e-30 ? x0r / x0a : 1; const phI = x0a > 1e-30 ? x0i / x0a : 0
    const vr = new Float64Array(m); const vi = new Float64Array(m)
    for (let i = 0; i < m; i++) { vr[i] = hr[(k + 1 + i) * n + k]!; vi[i] = hi[(k + 1 + i) * n + k]! }
    vr[0] = vr[0]! + phR * sigma; vi[0] = vi[0]! + phI * sigma
    let vn2 = 0; for (let i = 0; i < m; i++) vn2 += vr[i]! * vr[i]! + vi[i]! * vi[i]!
    if (vn2 < 1e-30) continue
    const beta = 2 / vn2
    const ur = new Float64Array(m); const ui = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      let sr = 0; let si = 0; const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) { const aR = hr[ro + j]!; const aI = hi[ro + j]!; sr += aR * vr[j]! - aI * vi[j]!; si += aR * vi[j]! + aI * vr[j]! }
      ur[i] = beta * sr; ui[i] = beta * si
    }
    let kappa = 0; for (let i = 0; i < m; i++) kappa += vr[i]! * ur[i]! + vi[i]! * ui[i]!
    kappa *= 0.5 * beta
    const wr = new Float64Array(m); const wi = new Float64Array(m)
    for (let i = 0; i < m; i++) { wr[i] = ur[i]! - kappa * vr[i]!; wi[i] = ui[i]! - kappa * vi[i]! }
    for (let i = 0; i < m; i++) {
      const vRi = vr[i]!; const vIi = vi[i]!; const wRi = wr[i]!; const wIi = wi[i]!; const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) {
        hr[ro + j] = hr[ro + j]! - (vRi * wr[j]! + vIi * wi[j]! + (wRi * vr[j]! + wIi * vi[j]!))
        hi[ro + j] = hi[ro + j]! - (vIi * wr[j]! - vRi * wi[j]! + (wIi * vr[j]! - wRi * vi[j]!))
      }
    }
    cSubRe[k + 1] = -phR * sigma; cSubIm[k + 1] = -phI * sigma
    for (let r = 0; r < n; r++) {
      let dr = 0; let di = 0; const ro = r * n + (k + 1)
      for (let j = 0; j < m; j++) { dr += qr[ro + j]! * vr[j]! - qi[ro + j]! * vi[j]!; di += qr[ro + j]! * vi[j]! + qi[ro + j]! * vr[j]! }
      dr *= beta; di *= beta
      for (let j = 0; j < m; j++) { qr[ro + j] = qr[ro + j]! - (dr * vr[j]! + di * vi[j]!); qi[ro + j] = qi[ro + j]! - (di * vr[j]! - dr * vi[j]!) }
    }
  }
  cSubRe[n - 1] = hr[(n - 1) * n + (n - 2)]!; cSubIm[n - 1] = hi[(n - 1) * n + (n - 2)]!
  const phiR = new Float64Array(n); const phiI = new Float64Array(n); phiR[0] = 1
  const d = new Float64Array(n); const e = new Float64Array(n); d[0] = hr[0]!
  for (let k = 1; k < n; k++) {
    d[k] = hr[k * n + k]!
    const mag = Math.hypot(cSubRe[k]!, cSubIm[k]!)
    e[k] = mag
    if (mag > 1e-30) { const ur = cSubRe[k]! / mag; const ui = cSubIm[k]! / mag; phiR[k] = phiR[k - 1]! * ur - phiI[k - 1]! * ui; phiI[k] = phiR[k - 1]! * ui + phiI[k - 1]! * ur }
    else { phiR[k] = phiR[k - 1]!; phiI[k] = phiI[k - 1]! }
  }
  const z = new Float64Array(n * n); for (let i = 0; i < n; i++) z[i * n + i] = 1
  tridiagQL(d, e, z, n)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const qR = qr[r * n + c]!; const qI = qi[r * n + c]!; const pR = phiR[c]!; const pI = phiI[c]!
      qr[r * n + c] = qR * pR - qI * pI; qi[r * n + c] = qR * pI + qI * pR
    }
  }
  const ord = Array.from({ length: n }, (_, i) => i).sort((a, b) => d[a]! - d[b]!)
  const values = new Float64Array(n); const vecs = cmatZero(n)
  for (let col = 0; col < n; col++) {
    const src = ord[col]!; values[col] = d[src]!
    for (let r = 0; r < n; r++) {
      let sr = 0; let si = 0; const ro = r * n
      for (let k = 0; k < n; k++) { const zk = z[k * n + src]!; sr += qr[ro + k]! * zk; si += qi[ro + k]! * zk }
      vecs.re[r * n + col] = sr; vecs.im[r * n + col] = si
    }
  }
  return { values, vecs }
}

function unitaryPhases(U: CMat): { readonly phases: Float64Array; readonly maxRes: number } {
  const n = U.n
  const phi = 0.37192841
  const cp = Math.cos(phi); const sp = Math.sin(phi)
  const H = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ur = U.re[i * n + j]!; const ui = U.im[i * n + j]!
      const dr = U.re[j * n + i]!; const di = -U.im[j * n + i]!
      H.re[i * n + j] = 0.5 * (cp * ur - sp * ui + cp * dr + sp * di)
      H.im[i * n + j] = 0.5 * (cp * ui + sp * ur + cp * di - sp * dr)
    }
  }
  const eigH = hermitianEigen(H)
  const V = { n, re: Float64Array.from(eigH.vecs.re), im: Float64Array.from(eigH.vecs.im) }
  let start = 0
  while (start < n) {
    let end = start + 1
    while (end < n && Math.abs(eigH.values[end]! - eigH.values[start]!) < 1e-7) end++
    const m = end - start
    if (m >= 2) {
      const Sub = cmatZero(m)
      const wr = new Float64Array(n * m); const wi = new Float64Array(n * m)
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          let sr = 0; let si = 0
          for (let k = 0; k < n; k++) {
            const ur = U.re[r * n + k]!; const ui = U.im[r * n + k]!
            const dr = U.re[k * n + r]!; const di = -U.im[k * n + r]!
            const r1 = cp * ur - sp * ui; const i1 = cp * ui + sp * ur
            const r2 = cp * dr + sp * di; const i2 = cp * di - sp * dr
            const hsr = 0.5 * (i1 - i2); const hsi = -0.5 * (r1 - r2)
            const vr = V.re[k * n + (start + c)]!; const vi = V.im[k * n + (start + c)]!
            sr += hsr * vr - hsi * vi; si += hsr * vi + hsi * vr
          }
          wr[r * m + c] = sr; wi[r * m + c] = si
        }
      }
      for (let a = 0; a < m; a++) {
        for (let b = 0; b < m; b++) {
          let sr = 0; let si = 0
          for (let r = 0; r < n; r++) {
            const vr = V.re[r * n + (start + a)]!; const vi = V.im[r * n + (start + a)]!
            sr += vr * wr[r * m + b]! + vi * wi[r * m + b]!; si += vr * wi[r * m + b]! - vi * wr[r * m + b]!
          }
          Sub.re[a * m + b] = sr; Sub.im[a * m + b] = si
        }
      }
      const eigS = hermitianEigen(Sub)
      const tmpR = new Float64Array(n * m); const tmpI = new Float64Array(n * m)
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          let sr = 0; let si = 0
          for (let k = 0; k < m; k++) {
            const vr = V.re[r * n + (start + k)]!; const vi = V.im[r * n + (start + k)]!
            const qr = eigS.vecs.re[k * m + c]!; const qi = eigS.vecs.im[k * m + c]!
            sr += vr * qr - vi * qi; si += vr * qi + vi * qr
          }
          tmpR[r * m + c] = sr; tmpI[r * m + c] = si
        }
      }
      for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) { V.re[r * n + (start + c)] = tmpR[r * m + c]!; V.im[r * n + (start + c)] = tmpI[r * m + c]! }
    }
    start = end
  }
  const phases = new Float64Array(n)
  let maxRes = 0
  for (let col = 0; col < n; col++) {
    let lr = 0; let li = 0
    const uvr = new Float64Array(n); const uvi = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      let sr = 0; let si = 0
      for (let k = 0; k < n; k++) { sr += U.re[r * n + k]! * V.re[k * n + col]! - U.im[r * n + k]! * V.im[k * n + col]!; si += U.re[r * n + k]! * V.im[k * n + col]! + U.im[r * n + k]! * V.re[k * n + col]! }
      uvr[r] = sr; uvi[r] = si; lr += V.re[r * n + col]! * sr + V.im[r * n + col]! * si; li += V.re[r * n + col]! * si - V.im[r * n + col]! * sr
    }
    phases[col] = Math.atan2(li, lr)
    for (let r = 0; r < n; r++) maxRes = Math.max(maxRes, Math.hypot(uvr[r]! - (lr * V.re[r * n + col]! - li * V.im[r * n + col]!), uvi[r]! - (lr * V.im[r * n + col]! + li * V.re[r * n + col]!)))
  }
  return { phases, maxRes }
}

function levelSpacingR(phases: Float64Array): { readonly rMean: number; readonly nSpacings: number; readonly minGap: number } {
  const arr = Array.from(phases).sort((a, b) => a - b)
  const n = arr.length
  const gaps: number[] = []
  let minGap = Infinity
  for (let i = 0; i < n; i++) {
    const g = i + 1 < n ? arr[i + 1]! - arr[i]! : arr[0]! + 2 * PI - arr[n - 1]!
    if (g > 1e-11) { gaps.push(g); if (g < minGap) minGap = g }
  }
  let sumR = 0
  const m = gaps.length
  for (let i = 0; i < m; i++) {
    const g1 = gaps[i]!; const g2 = gaps[(i + 1) % m]!
    sumR += Math.min(g1, g2) / Math.max(g1, g2)
  }
  return { rMean: m > 0 ? sumR / m : 0, nSpacings: m, minGap }
}

// 1. EXACT BigInt Z[omega] INFINITE-LINE SYMBOLIC PROOF OF k = 4 Sym^4 TETRON (W12.4)!
console.log('--- A. EXACT BigInt Z[omega] SYMBOLIC PROOF OF k = 4 Sym^4 TETRON ---')
type Zw = readonly [bigint, bigint]
const zwAdd = (x: Zw, y: Zw): Zw => [x[0] + y[0], x[1] + y[1]]
const zwSub = (x: Zw, y: Zw): Zw => [x[0] - y[0], x[1] - y[1]]
const zwMul = (x: Zw, y: Zw): Zw => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]
const zwScale = (k: bigint, x: Zw): Zw => [k * x[0], k * x[1]]
const zwIsZero = (x: Zw): boolean => x[0] === 0n && x[1] === 0n

const ZW_ONE: Zw = [1n, 0n]
const ZW_W2: Zw = [-1n, -1n]
const ZW_2CKEEP: Zw = [1n, 1n]
const ZW_2CCROSS: Zw = [1n, -1n]
const ZW_49Q: Zw = [-29n, -12n]
const ZW_49QBAR: Zw = [-17n, 12n]
const ZW_13P: Zw = [-1n, -4n]
const ZW_49LAM4: Zw = [16n, -39n]
const c2Mat: Zw[][] = [[ZW_2CKEEP, ZW_2CCROSS], [ZW_2CCROSS, ZW_2CKEEP]]

// Unified formula scaled by 49^MAX_P49 * 13^MAX_P13 so EVERY amplitude is exact Zw integer!
// psi(d1,d2,d3; s1,s2,s3,s4) = (13/49)^(d1+d3-2) * (1/49)^(d2-1) * qbar^2 * q^(1_{s1=0}+1_{s4=1}) * p^(1_{s2=0}+1_{s3=1})
// Rewrite in exact integers:
// qbar = ZW_49QBAR / 49, q = ZW_49Q / 49, p = ZW_13P / 13.
// Denominator: 49^(d1+d2+d3-1 + 1_{s1=0} + 1_{s4=1}) * 13^(1_{s2=0} + 1_{s3=1} - (d1+d3-2))
// Wait: d1+d3 can be 0 (double-pair: s1=0,s2=1,s3=0,s4=1 => exponent of 13 is 0 - (-2) = +2 in den?! NO!
// Wait: at d1=0,d3=0: qbar^2 * q^2 = (13^2 / 49^2) -> the 13^2 CANCELS (13/49)^(-2)!!
// So let's keep explicit (num: Zw, pow49: number, pow13: number) -> multiply by 49^(P49 - pow49) * 13^(P13 - pow13)!
const P49 = 14
const P13 = 4 // wait: pow13 can be negative when d1+d3 > 2, so multiply by 13^(2 + (d1+d3-2) - pCount) = 13^(d1+d3 - pCount) -> always >= 0 when we include +2!
const psiTetron = (d1: number, d2: number, d3: number, s1: number, s2: number, s3: number, s4: number): Zw => {
  const qCnt = (s1 === 0 ? 1 : 0) + (s4 === 1 ? 1 : 0)
  const pCnt = (s2 === 0 ? 1 : 0) + (s3 === 1 ? 1 : 0)
  let v: Zw = zwMul(ZW_49QBAR, ZW_49QBAR)
  for (let i = 0; i < qCnt; i++) v = zwMul(v, ZW_49Q)
  for (let i = 0; i < pCnt; i++) v = zwMul(v, ZW_13P)
  // True value is v * 13^(d1+d3-2 - pCnt) / 49^(d1+d2+d3-1 + qCnt).
  // Scale by 49^P49 * 13^P13:
  // Wait: for d1=0, d3=0, s1=0, s2=1, s3=0, s4=1: pCnt=0, qCnt=2, v = (49*13)^2, 13^(-2) cancels 13^2!
  // Let's divide out exact factors of 13 and 49 if pow is negative!
  const exp13 = d1 + d3 - 2 - pCnt + P13
  const exp49 = P49 - (d1 + d2 + d3 - 1 + qCnt)
  if (exp13 < 0 || exp49 < 0) throw new Error(`Neg exp: ${exp13}, ${exp49}`)
  return zwScale(13n ** BigInt(exp13) * 49n ** BigInt(exp49), v)
}

const D_CHK = 3
const out16U = new Map<string, Zw>()
const addOut4 = (k: string, v: Zw) => { const ex = out16U.get(k); out16U.set(k, ex ? zwAdd(ex, v) : v) }
for (let d1 = 0; d1 <= D_CHK + 2; d1++) {
  for (let d2 = 0; d2 <= D_CHK + 2; d2++) {
    if (d1 === 0 && d2 === 0) continue
    for (let d3 = 0; d3 <= D_CHK + 2; d3++) {
      if (d2 === 0 && d3 === 0) continue
      const ms = [0, d1, d1 + d2, d1 + d2 + d3] as const
      for (let s1 = 0; s1 < 2; s1++) {
        for (let s2 = 0; s2 < 2; s2++) {
          if (d1 === 0 && !(s1 === 0 && s2 === 1)) continue
          for (let s3 = 0; s3 < 2; s3++) {
            if (d2 === 0 && !(s2 === 0 && s3 === 1)) continue
            for (let s4 = 0; s4 < 2; s4++) {
              if (d3 === 0 && !(s3 === 0 && s4 === 1)) continue
              const amp0 = psiTetron(d1, d2, d3, s1, s2, s3, s4)
              // Group particles by site m
              const pts: [number, number][] = [[ms[0], s1], [ms[1], s2], [ms[2], s3], [ms[3], s4]]
              const byM = new Map<number, number[]>()
              for (let i = 0; i < 4; i++) { const l = byM.get(pts[i]![0]); if (l) l.push(i); else byM.set(pts[i]![0], [i]) }
              // We compute 16 * U * psi (each lone particle contributes factor 2 from c2Mat; each pair contributes factor 4 * ZW_W2)
              let branches: { pts: [number, number][]; amp: Zw }[] = [{ pts: [], amp: amp0 }]
              for (const [m, idxs] of byM) {
                if (idxs.length === 2) {
                  branches = branches.map(b => ({ pts: [...b.pts, [m, 0], [m, 1]], amp: zwScale(4n, zwMul(b.amp, ZW_W2)) }))
                } else {
                  const sIn = pts[idxs[0]!]![1]
                  const nb: { pts: [number, number][]; amp: Zw }[] = []
                  for (const b of branches) {
                    nb.push({ pts: [...b.pts, [m, 0]], amp: zwMul(b.amp, c2Mat[0]![sIn]!) })
                    nb.push({ pts: [...b.pts, [m, 1]], amp: zwMul(b.amp, c2Mat[1]![sIn]!) })
                  }
                  branches = nb
                }
              }
              for (const b of branches) {
                const st: [number, number][] = b.pts.map(([m, s]) => [s === 0 ? m : m - 1, s])
                st.sort((a, bb) => a[0] - bb[0] || a[1] - bb[1])
                addOut4(`${st[1]![0] - st[0]![0]},${st[2]![0] - st[1]![0]},${st[3]![0] - st[2]![0]},${st[0]![1]},${st[1]![1]},${st[2]![1]},${st[3]![1]}`, b.amp)
              }
            }
          }
        }
      }
    }
  }
}

let sym4Checked = 0
let sym4Defects = 0
for (let d1 = 0; d1 <= D_CHK; d1++) {
  for (let d2 = 0; d2 <= D_CHK; d2++) {
    if (d1 === 0 && d2 === 0) continue
    for (let d3 = 0; d3 <= D_CHK; d3++) {
      if (d2 === 0 && d3 === 0) continue
      for (let s1 = 0; s1 < 2; s1++) {
        for (let s2 = 0; s2 < 2; s2++) {
          if (d1 === 0 && !(s1 === 0 && s2 === 1)) continue
          for (let s3 = 0; s3 < 2; s3++) {
            if (d2 === 0 && !(s2 === 0 && s3 === 1)) continue
            for (let s4 = 0; s4 < 2; s4++) {
              if (d3 === 0 && !(s3 === 0 && s4 === 1)) continue
              sym4Checked++
              const k = `${d1},${d2},${d3},${s1},${s2},${s3},${s4}`
              const lhs = zwScale(49n, out16U.get(k) ?? [0n, 0n])
              const rhs = zwScale(16n, zwMul(ZW_49LAM4, psiTetron(d1, d2, d3, s1, s2, s3, s4)))
              if (!zwIsZero(zwSub(lhs, rhs))) sym4Defects++
            }
          }
        }
      }
    }
  }
}
console.log(`k = 4 Sym^4 Tetron BigInt Z[omega] infinite-line stencils: checked=${sym4Checked}, defects=${sym4Defects}`)

// 2. LEVEL-SPACING <r> DIAGNOSTIC ON 1D COLLINEAR SECTORS (M_meet vs M_pair_1D vs K+M_meet)!
console.log('\n--- B. 1D COLLINEAR LEVEL-SPACING <r> DIAGNOSTIC (Poisson=0.3863, COE=0.5307, CUE=0.5996) ---')
// Sym^3 on even sublattice (M = 13, 15) at generic momentum P = 2*pi*m / (2*M) with NO inversion symmetry (m=1,2,3)!
function buildSym3Even(M: number, P: number, pairPhase: C) {
  const canon = (pts: readonly (readonly [number, number])[]) => {
    let bestKey = ''; let bestShift = 0; let bestSorted: [number, number][] = []; let symCount = 0
    for (let sh = 0; sh < M; sh++) {
      const arr: [number, number][] = pts.map(([m, s]) => [(((m + sh) % M) + M) % M, s])
      arr.sort((a, b) => a[0] - b[0] || a[1] - b[1])
      const k = arr.map(([m, s]) => `${m}:${s}`).join(',')
      if (bestKey === '' || k < bestKey) { bestKey = k; bestShift = sh; bestSorted = arr; symCount = 1 }
      else if (k === bestKey) symCount++
    }
    return { key: bestKey, mShift: bestShift, sorted: bestSorted, symCount }
  }
  const keyToIdx = new Map<string, number>(); const configs: [number, number][][] = []; const symCounts: number[] = []
  for (let a = 0; a < 2 * M; a++) for (let b = a + 1; b < 2 * M; b++) for (let c = b + 1; c < 2 * M; c++) {
    const cn = canon([[a >> 1, a & 1], [b >> 1, b & 1], [c >> 1, c & 1]])
    if (!keyToIdx.has(cn.key)) {
      const phOrb = (2 * P * M) / cn.symCount
      if (Math.hypot(Math.cos(phOrb) - 1, Math.sin(phOrb)) < 1e-9) {
        keyToIdx.set(cn.key, configs.length); configs.push(cn.sorted); symCounts.push(cn.symCount)
      }
    }
  }
  const dim = configs.length; const U = cmatZero(dim); const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
  for (let col = 0; col < dim; col++) {
    const pts = configs[col]!; const byM = new Map<number, number[]>()
    for (let i = 0; i < 3; i++) { const m = pts[i]![0]; const l = byM.get(m); if (l) l.push(i); else byM.set(m, [i]) }
    let branches: { pts: [number, number][]; amp: C }[] = [{ pts: [], amp: [1, 0] }]
    for (const [m, idxs] of byM) {
      if (idxs.length === 2) branches = branches.map(b => ({ pts: [...b.pts, [m, 0], [m, 1]], amp: cMul(b.amp, pairPhase) }))
      else {
        const sIn = pts[idxs[0]!]![1]; const nb: { pts: [number, number][]; amp: C }[] = []
        for (const b of branches) { nb.push({ pts: [...b.pts, [m, 0]], amp: cMul(b.amp, cMat[0]![sIn]!) }); nb.push({ pts: [...b.pts, [m, 1]], amp: cMul(b.amp, cMat[1]![sIn]!) }) }
        branches = nb
      }
    }
    for (const b of branches) {
      const cn = canon(b.pts.map(([m, s]) => [s === 0 ? m : (m - 1 + M) % M, s]))
      const row = keyToIdx.get(cn.key); if (row === undefined) continue
      const val = cScale(Math.sqrt(symCounts[row]! / symCounts[col]!), cMul(cExpI(P * (2 * cn.mShift - 1)), b.amp))
      U.re[row * dim + col] = U.re[row * dim + col]! + val[0]; U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
    }
  }
  return { U, dim }
}

// 1D collinear k=3 mixed-sign (+,+,-) on odd L=9, 11 at generic P = 2*pi/L, 4*pi/L (K + M_meet, two + in Sym)
function buildQ1OddL(L: number, P: number, plusPhase: C) {
  const shiftSlot = (c: number, sh: number): number => ((((c >> 1) + sh) % L + L) % L) * 2 + (c & 1)
  const canon = (p0: number, p1: number, n0: number) => {
    let bestKey = ''; let bestShift = 0; let bestVals: [number, number, number] = [0, 0, 0]
    for (let sh = 0; sh < L; sh++) {
      let a0 = shiftSlot(p0, sh); let a1 = shiftSlot(p1, sh); if (a0 > a1) { const t = a0; a0 = a1; a1 = t }
      const b0 = shiftSlot(n0, sh)
      const k = `${a0},${a1}|${b0}`
      if (bestKey === '' || k < bestKey) { bestKey = k; bestShift = sh; bestVals = [a0, a1, b0] }
    }
    return { key: bestKey, shift: bestShift, vals: bestVals }
  }
  const idxMap = new Map<string, number>(); const configs: [number, number, number][] = []; const S = 2 * L
  for (let p0 = 0; p0 < S; p0++) for (let p1 = p0 + 1; p1 < S; p1++) for (let n0 = 0; n0 < S; n0++) {
    if (n0 === p0 || n0 === p1) continue
    const cn = canon(p0, p1, n0)
    if (!idxMap.has(cn.key)) { idxMap.set(cn.key, configs.length); configs.push(cn.vals) }
  }
  const dim = configs.length; const U = cmatZero(dim); const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
  const kFac: C = [-W_C[0], -W_C[1]]
  for (let col = 0; col < dim; col++) {
    const [p0, p1, n0] = configs[col]!
    const pts: [number, number, number][] = [[p0 >> 1, p0 & 1, 1], [p1 >> 1, p1 & 1, 1], [n0 >> 1, n0 & 1, -1]]
    const byX = new Map<number, [number, number, number][]>()
    for (const p of pts) { const l = byX.get(p[0]); if (l) l.push(p); else byX.set(p[0], [p]) }
    let branches: { ps: [number, number, number][]; amp: C }[] = [{ ps: [], amp: [1, 0] }]
    for (const [x, list] of byX) {
      if (list.length === 1) {
        const [, sIn, t] = list[0]!; const nb: { ps: [number, number, number][]; amp: C }[] = []
        for (const b of branches) { nb.push({ ps: [...b.ps, [x, 0, t]], amp: cMul(b.amp, cMat[0]![sIn]!) }); nb.push({ ps: [...b.ps, [x, 1, t]], amp: cMul(b.amp, cMat[1]![sIn]!) }) }
        branches = nb
      } else {
        const pA = list[0]!; const pB = list[1]!
        if (pA[2] !== pB[2]) branches = branches.map(b => ({ ps: [...b.ps, [x, pB[1], pA[2]], [x, pA[1], pB[2]]], amp: cMul(b.amp, kFac) }))
        else branches = branches.map(b => ({ ps: [...b.ps, pA, pB], amp: cMul(b.amp, plusPhase) }))
      }
    }
    for (const b of branches) {
      const psP: number[] = []; let nC = 0
      for (const [x, s, t] of b.ps) {
        const code = 2 * ((((x + (s === 0 ? 1 : -1)) % L) + L) % L) + s
        if (t > 0) psP.push(code); else nC = code
      }
      const cn = canon(psP[0]!, psP[1]!, nC)
      const val = cMul(cExpI(P * cn.shift), b.amp)
      const row = idxMap.get(cn.key)!
      U.re[row * dim + col] = U.re[row * dim + col]! + val[0]; U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
    }
  }
  return { U, dim }
}

// Average <r> over non-symmetric momentum sectors P = 2*pi*m / (2*M) for Sym^3 M=13 (dim=200 per P!)
for (const [label, ph] of [['1D Sym^3 M_meet (w^2)', W2_C], ['1D Sym^3 M_pair (w^2 z18)', cMul(W2_C, Z18_C)], ['1D Sym^3 K (-w, free-F)', cScale(-1, W_C)]] as const) {
  let rSum = 0; let nTot = 0; let maxU = 0
  for (const m of [1, 2, 3, 4, 5]) {
    const M = 13
    const P = (PI * m) / M
    const { U } = buildSym3Even(M, P, ph)
    maxU = Math.max(maxU, cmatUnitaryErr(U))
    const { phases } = unitaryPhases(U)
    const st = levelSpacingR(phases)
    rSum += st.rMean * st.nSpacings; nTot += st.nSpacings
  }
  console.log(`  ${label.padEnd(28)}: M=13 (P=1..5 pi/13), uniErr=${maxU.toExponential(1)}, nGaps=${nTot}, <r>=${(rSum / nTot).toFixed(4)}`)
}

// Mixed-sign (+,+,-) on odd L=9 (dim=272) and L=11 (dim=420) at P=2pi*m/L!
for (const L of [9, 11]) {
  let rSum = 0; let nTot = 0; let maxU = 0
  for (let m = 1; m <= (L - 1) / 2; m++) {
    const P = (2 * PI * m) / L
    const { U } = buildQ1OddL(L, P, W2_C)
    maxU = Math.max(maxU, cmatUnitaryErr(U))
    const { phases } = unitaryPhases(U)
    const st = levelSpacingR(phases)
    rSum += st.rMean * st.nSpacings; nTot += st.nSpacings
  }
  console.log(`  1D (+,+,-) K+M_meet L=${String(L).padEnd(2)}    : P=1..${(L-1)/2}*(2pi/L), uniErr=${maxU.toExponential(1)}, nGaps=${nTot}, <r>=${(rSum / nTot).toFixed(4)}`)
}

export {}
