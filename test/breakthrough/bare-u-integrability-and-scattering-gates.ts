// Wave-4 Track W12 Probe 6: N_a mod 2 resolved 4D <r> (M_pair chaos!), Trion+Pulse CZ gate, & 3-role Doublon+Pulse!
const SQRT3 = Math.sqrt(3)
const PI = Math.PI

type C = readonly [number, number]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cExpI = (t: number): C => [Math.cos(t), Math.sin(t)]

const W_C: C = [-0.5, SQRT3 / 2]
const W2_C: C = [-0.5, -SQRT3 / 2]
const Z18_C: C = [Math.cos(PI / 9), Math.sin(PI / 9)]
const C_KEEP: C = [0.25, SQRT3 / 4]
const C_CROSS: C = [0.75, -SQRT3 / 4]

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }
const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })
const cmatEye = (n: number): CMat => { const m = cmatZero(n); for (let i = 0; i < n; i++) m.re[i * n + i] = 1; return m }

function cmatUnitaryErr(U: CMat): number {
  const n = U.n; let maxE = 0
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
    let sr = 0; let si = 0
    for (let k = 0; k < n; k++) {
      const ar = U.re[k * n + i]!; const ai = -U.im[k * n + i]!
      const br = U.re[k * n + j]!; const bi = U.im[k * n + j]!
      sr += ar * br - ai * bi; si += ar * bi + ai * br
    }
    maxE = Math.max(maxE, Math.hypot(sr - (i === j ? 1 : 0), si))
  }
  return maxE
}

function tridiagQL(d: Float64Array, eIn: Float64Array, z: Float64Array, n: number): void {
  const e = new Float64Array(n); for (let i = 1; i < n; i++) e[i - 1] = eIn[i]!; e[n - 1] = 0
  for (let l = 0; l < n; l++) {
    let iter = 0
    for (;;) {
      let m = l
      while (m < n - 1) { if (Math.abs(e[m]!) <= 1e-15 * Math.max(1e-30, Math.abs(d[m]!) + Math.abs(d[m + 1]!))) break; m++ }
      if (m === l || ++iter > 80) break
      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!); let r = Math.hypot(g, 1)
      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? r : -r))
      let s = 1; let c = 1; let p = 0
      for (let i = m - 1; i >= l; i--) {
        const f = s * e[i]!; const b = c * e[i]!; r = Math.hypot(f, g); e[i + 1] = r
        if (r === 0) { d[i + 1] = d[i + 1]! - p; e[m] = 0; break }
        s = f / r; c = g / r; g = d[i + 1]! - p; const rr = (d[i]! - g) * s + 2 * c * b
        p = s * rr; d[i + 1] = g + p; g = c * rr - b
        for (let k = 0; k < n; k++) { const z1 = z[k * n + (i + 1)]!; const z0 = z[k * n + i]!; z[k * n + (i + 1)] = s * z0 + c * z1; z[k * n + i] = c * z0 - s * z1 }
      }
      if (r === 0 && m > l) continue
      d[l] = d[l]! - p; e[l] = g; e[m] = 0
    }
  }
}

function hermitianEigen(H: CMat): { readonly values: Float64Array; readonly vecs: CMat } {
  const n = H.n; if (n === 1) return { values: new Float64Array([H.re[0]!]), vecs: cmatEye(1) }
  const hr = Float64Array.from(H.re); const hi = Float64Array.from(H.im)
  const qr = new Float64Array(n * n); const qi = new Float64Array(n * n); for (let i = 0; i < n; i++) qr[i * n + i] = 1
  const cSubRe = new Float64Array(n); const cSubIm = new Float64Array(n)
  for (let k = 0; k < n - 2; k++) {
    const m = n - k - 1; let norm2 = 0
    for (let i = 0; i < m; i++) { const r = hr[(k + 1 + i) * n + k]!; const im = hi[(k + 1 + i) * n + k]!; norm2 += r * r + im * im }
    const sigma = Math.sqrt(norm2); if (sigma < 1e-30) continue
    const x0r = hr[(k + 1) * n + k]!; const x0i = hi[(k + 1) * n + k]!; const x0a = Math.hypot(x0r, x0i)
    const phR = x0a > 1e-30 ? x0r / x0a : 1; const phI = x0a > 1e-30 ? x0i / x0a : 0
    const vr = new Float64Array(m); const vi = new Float64Array(m)
    for (let i = 0; i < m; i++) { vr[i] = hr[(k + 1 + i) * n + k]!; vi[i] = hi[(k + 1 + i) * n + k]! }
    vr[0] = vr[0]! + phR * sigma; vi[0] = vi[0]! + phI * sigma
    let vn2 = 0; for (let i = 0; i < m; i++) vn2 += vr[i]! * vr[i]! + vi[i]! * vi[i]!; if (vn2 < 1e-30) continue
    const beta = 2 / vn2; const ur = new Float64Array(m); const ui = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      let sr = 0; let si = 0; const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) { const aR = hr[ro + j]!; const aI = hi[ro + j]!; sr += aR * vr[j]! - aI * vi[j]!; si += aR * vi[j]! + aI * vr[j]! }
      ur[i] = beta * sr; ui[i] = beta * si
    }
    let kappa = 0; for (let i = 0; i < m; i++) kappa += vr[i]! * ur[i]! + vi[i]! * ui[i]!; kappa *= 0.5 * beta
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
    d[k] = hr[k * n + k]!; const mag = Math.hypot(cSubRe[k]!, cSubIm[k]!); e[k] = mag
    if (mag > 1e-30) { const ur = cSubRe[k]! / mag; const ui = cSubIm[k]! / mag; phiR[k] = phiR[k - 1]! * ur - phiI[k - 1]! * ui; phiI[k] = phiR[k - 1]! * ui + phiI[k - 1]! * ur }
    else { phiR[k] = phiR[k - 1]!; phiI[k] = phiI[k - 1]! }
  }
  const z = new Float64Array(n * n); for (let i = 0; i < n; i++) z[i * n + i] = 1
  tridiagQL(d, e, z, n)
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const qR = qr[r * n + c]!; const qI = qi[r * n + c]!; const pR = phiR[c]!; const pI = phiI[c]!
    qr[r * n + c] = qR * pR - qI * pI; qi[r * n + c] = qR * pI + qI * pR
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
  const n = U.n; const phi = 0.37192841; const cp = Math.cos(phi); const sp = Math.sin(phi)
  const H = cmatZero(n)
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const ur = U.re[i * n + j]!; const ui = U.im[i * n + j]!
    const dr = U.re[j * n + i]!; const di = -U.im[j * n + i]!
    H.re[i * n + j] = 0.5 * (cp * ur - sp * ui + cp * dr + sp * di)
    H.im[i * n + j] = 0.5 * (cp * ui + sp * ur + cp * di - sp * dr)
  }
  const eigH = hermitianEigen(H)
  const V = { n, re: Float64Array.from(eigH.vecs.re), im: Float64Array.from(eigH.vecs.im) }
  let start = 0
  while (start < n) {
    let end = start + 1; while (end < n && Math.abs(eigH.values[end]! - eigH.values[start]!) < 1e-7) end++
    const m = end - start
    if (m >= 2) {
      const Sub = cmatZero(m); const wr = new Float64Array(n * m); const wi = new Float64Array(n * m)
      for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) {
        let sr = 0; let si = 0
        for (let k = 0; k < n; k++) {
          const ur = U.re[r * n + k]!; const ui = U.im[r * n + k]!; const dr = U.re[k * n + r]!; const di = -U.im[k * n + r]!
          const r1 = cp * ur - sp * ui; const i1 = cp * ui + sp * ur; const r2 = cp * dr + sp * di; const i2 = cp * di - sp * dr
          const hsr = 0.5 * (i1 - i2); const hsi = -0.5 * (r1 - r2)
          const vr = V.re[k * n + (start + c)]!; const vi = V.im[k * n + (start + c)]!
          sr += hsr * vr - hsi * vi; si += hsr * vi + hsi * vr
        }
        wr[r * m + c] = sr; wi[r * m + c] = si
      }
      for (let a = 0; a < m; a++) for (let b = 0; b < m; b++) {
        let sr = 0; let si = 0
        for (let r = 0; r < n; r++) {
          const vr = V.re[r * n + (start + a)]!; const vi = V.im[r * n + (start + a)]!
          sr += vr * wr[r * m + b]! + vi * wi[r * m + b]!; si += vr * wi[r * m + b]! - vi * wr[r * m + b]!
        }
        Sub.re[a * m + b] = sr; Sub.im[a * m + b] = si
      }
      const eigS = hermitianEigen(Sub); const tmpR = new Float64Array(n * m); const tmpI = new Float64Array(n * m)
      for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) {
        let sr = 0; let si = 0
        for (let k = 0; k < m; k++) {
          const vr = V.re[r * n + (start + k)]!; const vi = V.im[r * n + (start + k)]!
          const qr = eigS.vecs.re[k * m + c]!; const qi = eigS.vecs.im[k * m + c]!
          sr += vr * qr - vi * qi; si += vr * qi + vi * qr
        }
        tmpR[r * m + c] = sr; tmpI[r * m + c] = si
      }
      for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) { V.re[r * n + (start + c)] = tmpR[r * m + c]!; V.im[r * n + (start + c)] = tmpI[r * m + c]! }
    }
    start = end
  }
  const phases = new Float64Array(n); let maxRes = 0
  for (let col = 0; col < n; col++) {
    let lr = 0; let li = 0; const uvr = new Float64Array(n); const uvi = new Float64Array(n)
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

function levelSpacingR(phases: Float64Array): { readonly rMean: number; readonly nSpacings: number } {
  const arr = Array.from(phases).sort((a, b) => a - b)
  const n = arr.length; const gaps: number[] = []
  for (let i = 0; i < n; i++) { const g = i + 1 < n ? arr[i + 1]! - arr[i]! : arr[0]! + 2 * PI - arr[n - 1]!; if (g > 1e-11) gaps.push(g) }
  let sumR = 0; const m = gaps.length
  for (let i = 0; i < m; i++) { const g1 = gaps[i]!; const g2 = gaps[(i + 1) % m]!; sumR += Math.min(g1, g2) / Math.max(g1, g2) }
  return { rMean: m > 0 ? sumR / m : 0, nSpacings: m }
}

// --- 1. N_a mod 2 RESOLVED 4D MULTI-LINE k = 3 (M_pair(zeta_18) ON vs OFF!) ---
console.log('--- 1. (Z_2)^L LINE-PARITY RESOLVED 4D MULTI-LINE k = 3 (M_pair ON vs OFF!) ---')
function buildZNMultiLineK3Parity(N: number, steps: readonly number[], P: number, targetParity: readonly number[], useMPair: boolean) {
  const nL = steps.length; const perDock = 2 * nL; const S = N * perDock
  const shiftSlot = (c: number, sh: number): number => ((((Math.floor(c / perDock) + sh) % N) + N) % N) * perDock + (c % perDock)
  const canon = (a: number, b: number, c: number) => {
    let bestKey = ''; let bestShift = 0; let bestVals: [number, number, number] = [0, 0, 0]
    for (let sh = 0; sh < N; sh++) {
      const arr = [shiftSlot(a, sh), shiftSlot(b, sh), shiftSlot(c, sh)].sort((u, v) => u - v)
      const k = `${arr[0]},${arr[1]},${arr[2]}`
      if (bestKey === '' || k < bestKey) { bestKey = k; bestShift = sh; bestVals = [arr[0]!, arr[1]!, arr[2]!] }
    }
    return { key: bestKey, shift: bestShift, vals: bestVals }
  }
  const idxMap = new Map<string, number>(); const configs: [number, number, number][] = []
  for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) for (let c = b + 1; c < S; c++) {
    const cnt = new Int32Array(nL)
    cnt[(a % perDock) >> 1] = cnt[(a % perDock) >> 1]! + 1
    cnt[(b % perDock) >> 1] = cnt[(b % perDock) >> 1]! + 1
    cnt[(c % perDock) >> 1] = cnt[(c % perDock) >> 1]! + 1
    let ok = true; for (let l = 0; l < nL; l++) if ((cnt[l]! & 1) !== targetParity[l]) ok = false
    if (!ok) continue
    const cn = canon(a, b, c)
    if (!idxMap.has(cn.key)) { idxMap.set(cn.key, configs.length); configs.push(cn.vals) }
  }
  const dim = configs.length; const U = cmatZero(dim)
  const keepM: C = useMPair ? cMul(W2_C, [(nL - 1 + Z18_C[0]) / nL, Z18_C[1] / nL]) : W2_C
  const hopM: C = useMPair ? cMul(W2_C, [(Z18_C[0] - 1) / nL, Z18_C[1] / nL]) : ([0, 0] as C)
  for (let col = 0; col < dim; col++) {
    const cfg = configs[col]!
    const byDock = new Map<number, number[]>()
    for (const s of cfg) { const d = Math.floor(s / perDock); const l = byDock.get(d); if (l) l.push(s % perDock); else byDock.set(d, [s % perDock]) }
    let branches: { slots: [number, number][]; amp: C }[] = [{ slots: [], amp: [1, 0] }]
    for (const [d, localList] of byDock) {
      if (localList.length === 2 && (localList[0]! >> 1) === (localList[1]! >> 1) && useMPair) {
        const curL = localList[0]! >> 1
        const nb: { slots: [number, number][]; amp: C }[] = []
        for (const br of branches) for (let j = 0; j < nL; j++) nb.push({ slots: [...br.slots, [d, 2 * j], [d, 2 * j + 1]], amp: cMul(br.amp, j === curL ? keepM : hopM) })
        branches = nb
      } else {
        const byLine = new Map<number, number[]>()
        for (const ls of localList) { const l = ls >> 1; const a = byLine.get(l); if (a) a.push(ls & 1); else byLine.set(l, [ls & 1]) }
        for (const [l, dirs] of byLine) {
          if (dirs.length === 2) branches = branches.map(br => ({ slots: [...br.slots, [d, 2 * l], [d, 2 * l + 1]], amp: cMul(br.amp, W2_C) }))
          else {
            const sIn = dirs[0]!; const nb: { slots: [number, number][]; amp: C }[] = []
            for (const br of branches) {
              nb.push({ slots: [...br.slots, [d, 2 * l + sIn]], amp: cMul(br.amp, C_KEEP) })
              nb.push({ slots: [...br.slots, [d, 2 * l + (sIn ^ 1)]], amp: cMul(br.amp, C_CROSS) })
            }
            branches = nb
          }
        }
      }
    }
    for (const br of branches) {
      const moved = br.slots.map(([d, ls]) => {
        const l = ls >> 1; const dir = ls & 1; const st = steps[l]!
        return ((((d + (dir === 0 ? st : -st)) % N) + N) % N) * perDock + ls
      })
      const cn = canon(moved[0]!, moved[1]!, moved[2]!)
      const row = idxMap.get(cn.key)!
      const val = cMul(cExpI(P * cn.shift), br.amp)
      U.re[row * dim + col] = U.re[row * dim + col]! + val[0]; U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
    }
  }
  return { U, dim }
}

for (const useM of [false, true]) {
  let rSum = 0; let nTot = 0; let maxU = 0; let dim = 0
  for (const m of [1, 2, 3]) {
    const res = buildZNMultiLineK3Parity(7, [1, 2], (2 * PI * m) / 7, [1, 0], useM)
    dim = res.dim; maxU = Math.max(maxU, cmatUnitaryErr(res.U))
    const st = levelSpacingR(unitaryPhases(res.U).phases)
    rSum += st.rMean * st.nSpacings; nTot += st.nSpacings
  }
  console.log(`  4D Z_7 2-line (1,2) k=3 parity=(1,0) M_pair=${String(useM).padEnd(5)}: dim=${dim}x3, uni=${maxU.toExponential(1)}, nGaps=${nTot}, <r>=${(rSum / nTot).toFixed(4)}`)
}
for (const useM of [false, true]) {
  const res = buildZNMultiLineK3Parity(7, [1, 2, 3], (2 * PI) / 7, [1, 0, 0], useM)
  const uni = cmatUnitaryErr(res.U)
  const st = levelSpacingR(unitaryPhases(res.U).phases)
  console.log(`  4D Z_7 3-line (1,2,3) k=3 parity=(1,0,0) M_pair=${String(useM).padEnd(5)}: dim=${res.dim}, uni=${uni.toExponential(1)}, nGaps=${st.nSpacings}, <r>=${st.rMean.toFixed(4)}`)
}

// ALSO test 1D k=3 mixed roles (r0, r0, r1) with M_pair (zeta_18 on r0=r0, w^2 on r0!=r1) — THIS breaks 1D YBE!!
// Wait: on L=7 (or M=8 even sublattice), 2 identical role-0 + 1 distinct role-1 at P = 2pi/L!
function build1DRoles001(L: number, P: number, useMPair: boolean) {
  const S = 2 * L
  const shiftSlot = (c: number, sh: number): number => ((((c >> 1) + sh) % L + L) % L) * 2 + (c & 1)
  const canon = (a0: number, a1: number, b0: number) => {
    let bestKey = ''; let bestShift = 0; let bestVals: [number, number, number] = [0, 0, 0]
    for (let sh = 0; sh < L; sh++) {
      let x = shiftSlot(a0, sh); let y = shiftSlot(a1, sh); if (x > y) { const t = x; x = y; y = t }
      const z = shiftSlot(b0, sh)
      const k = `${x},${y}|${z}`
      if (bestKey === '' || k < bestKey) { bestKey = k; bestShift = sh; bestVals = [x, y, z] }
    }
    return { key: bestKey, shift: bestShift, vals: bestVals }
  }
  const idxMap = new Map<string, number>(); const configs: [number, number, number][] = []
  for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) for (let c = 0; c < S; c++) {
    if (c === a || c === b) continue
    const cn = canon(a, b, c)
    if (!idxMap.has(cn.key)) { idxMap.set(cn.key, configs.length); configs.push(cn.vals) }
  }
  const dim = configs.length; const U = cmatZero(dim); const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
  const kAmp = cMul(W_C, [0.25, SQRT3 / 4]); const sAmp = cMul(W_C, [-0.75, SQRT3 / 4])
  const eqPair: C = useMPair ? cMul(W2_C, Z18_C) : W2_C
  for (let col = 0; col < dim; col++) {
    const [a0, a1, b0] = configs[col]!
    const pts: [number, number, number][] = [[a0 >> 1, a0 & 1, 0], [a1 >> 1, a1 & 1, 0], [b0 >> 1, b0 & 1, 1]]
    const byX = new Map<number, [number, number, number][]>()
    for (const p of pts) { const l = byX.get(p[0]); if (l) l.push(p); else byX.set(p[0], [p]) }
    let brs: { ps: [number, number, number][]; amp: C }[] = [{ ps: [], amp: [1, 0] }]
    for (const [x, list] of byX) {
      if (list.length === 1) {
        const [, sIn, r] = list[0]!; const nb: { ps: [number, number, number][]; amp: C }[] = []
        for (const b of brs) { nb.push({ ps: [...b.ps, [x, 0, r]], amp: cMul(b.amp, cMat[0]![sIn]!) }); nb.push({ ps: [...b.ps, [x, 1, r]], amp: cMul(b.amp, cMat[1]![sIn]!) }) }
        brs = nb
      } else {
        const pA = list[0]!; const pB = list[1]!
        if (pA[2] === pB[2]) brs = brs.map(b => ({ ps: [...b.ps, pA, pB], amp: cMul(b.amp, eqPair) }))
        else {
          const nb: { ps: [number, number, number][]; amp: C }[] = []
          for (const b of brs) {
            nb.push({ ps: [...b.ps, pA, pB], amp: cMul(b.amp, kAmp) })
            nb.push({ ps: [...b.ps, [x, pA[1], pB[2]], [x, pB[1], pA[2]]], amp: cMul(b.amp, sAmp) })
          }
          brs = nb
        }
      }
    }
    for (const b of brs) {
      const r0: number[] = []; let r1 = 0
      for (const [x, s, r] of b.ps) { const c = 2 * ((((x + (s === 0 ? 1 : -1)) % L) + L) % L) + s; if (r === 0) r0.push(c); else r1 = c }
      const cn = canon(r0[0]!, r0[1]!, r1)
      const row = idxMap.get(cn.key)!
      const val = cMul(cExpI(P * cn.shift), b.amp)
      U.re[row * dim + col] = U.re[row * dim + col]! + val[0]; U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
    }
  }
  return { U, dim }
}
for (const useM of [false, true]) {
  let rSum = 0; let nTot = 0; let maxU = 0; let dim = 0
  for (const m of [1, 2, 3, 4]) {
    const res = build1DRoles001(9, (2 * PI * m) / 9, useM)
    dim = res.dim; maxU = Math.max(maxU, cmatUnitaryErr(res.U))
    const st = levelSpacingR(unitaryPhases(res.U).phases)
    rSum += st.rMean * st.nSpacings; nTot += st.nSpacings
  }
  console.log(`  1D roles (0,0,1) L=9 M_pair=${String(useM).padEnd(5)}       : dim=${dim}x4, uni=${maxU.toExponential(1)}, nGaps=${nTot}, <r>=${(rSum / nTot).toFixed(4)}`)
}

// --- 2. EXACT k = 4 Sym^4 TRION + PULSE CZ GATE COLLISION (M = 14 -> C(28,4) = 20,475 states, ~0.1 s!) ---
console.log('\n--- 2. EXACT k = 4 Sym^4 TRION + PULSE CZ GATE COLLISION (M = 16 -> C(32,4) = 35,960 states!) ---')
function runTrionPulseCZ(M: number, T: number) {
  // Enumerate all C(2M, 4) sorted 4-tuples of slots in 0..2M-1 -> dense index table!
  const S = 2 * M
  const cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
  // Combinadic lookup: idx(a<b<c<d) = C(a,1) ... actually exact binomial table!
  const binom = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i; return Math.round(r)
  }
  const C1 = new Int32Array(S + 1); const C2 = new Int32Array(S + 1); const C3 = new Int32Array(S + 1); const C4 = new Int32Array(S + 1)
  for (let n = 0; n <= S; n++) { C1[n] = n; C2[n] = binom(n, 2); C3[n] = binom(n, 3); C4[n] = binom(n, 4) }
  const N4 = C4[S]!
  const idx4 = (a: number, b: number, c: number, d: number): number => C1[a]! + C2[b]! + C3[c]! + C4[d]!

  // Build exact k=3 Trion packet at mT0 = Math.floor(M * 0.62) (sigmaT = 1.4) and k=1 Pulse at mP0 = Math.floor(M * 0.18) (sigmaP = 1.6, p* = -atan(3 sqrt(2)/5))!
  const pStarT = -Math.atan((3 * Math.SQRT2) / 5)
  const pRe = new Float64Array(S); const pIm = new Float64Array(S)
  {
    const th = Math.acos(0.5 * Math.cos(pStarT))
    const ratio = -(Math.sin(pStarT) + 2 * Math.sin(th)) / SQRT3
    const w = cScale(ratio, cExpI(pStarT))
    const inv = 1 / Math.hypot(1, Math.abs(ratio))
    const chi0: C = [inv, 0]; const chi1: C = cScale(inv, w)
    const mP0 = Math.floor(M * 0.18); const sig = 1.6
    let n2 = 0
    for (let m = 0; m < M; m++) {
      let dm = m - mP0; if (dm > M / 2) dm -= M; if (dm < -M / 2) dm += M
      const env = Math.exp(-(dm * dm) / (4 * sig * sig))
      const ph = cExpI(2 * pStarT * m)
      const a0 = cScale(env, cMul(ph, chi0)); const a1 = cScale(env, cMul(ph, chi1))
      pRe[2 * m] = a0[0]; pIm[2 * m] = a0[1]; pRe[2 * m + 1] = a1[0]; pIm[2 * m + 1] = a1[1]
      n2 += cAbs2(a0) + cAbs2(a1)
    }
    const sc = 1 / Math.sqrt(n2); for (let i = 0; i < S; i++) { pRe[i] = pRe[i]! * sc; pIm[i] = pIm[i]! * sc }
  }

  // Exact k=3 Trion packet on C(S, 3) states!
  const N3 = C3[S]!
  const idx3 = (a: number, b: number, c: number): number => C1[a]! + C2[b]! + C3[c]!
  const tRe = new Float64Array(N3); const tIm = new Float64Array(N3)
  {
    const rT: C = [(-3 - 2 * W_C[0]) / 7, (-2 * W_C[1]) / 7]
    const rBarT: C = [(-1 + 2 * W_C[0]) / 7, (2 * W_C[1]) / 7]
    const mT0 = Math.floor(M * 0.62); const sigT = 1.3
    for (let m1 = 0; m1 < M; m1++) {
      for (let d1 = 0; d1 <= 4; d1++) {
        for (let d2 = 0; d2 <= 4; d2++) {
          if (d1 === 0 && d2 === 0) continue
          const m2 = (m1 + d1) % M; const m3 = (m1 + d1 + d2) % M
          let dcm = m1 + (2 * d1 + d2) / 3 - mT0
          if (dcm > M / 2) dcm -= M; if (dcm < -M / 2) dcm += M
          const env = Math.exp(-(dcm * dcm) / (4 * sigT * sigT))
          for (let s1 = 0; s1 < 2; s1++) for (let s2 = 0; s2 < 2; s2++) {
            if (d1 === 0 && !(s1 === 0 && s2 === 1)) continue
            for (let s3 = 0; s3 < 2; s3++) {
              if (d2 === 0 && !(s2 === 0 && s3 === 1)) continue
              let amp: C = [env, 0]
              if (d1 === 0) { amp = cScale(Math.pow(1 / 7, d2 - 1), amp); if (s3 === 1) amp = cMul(amp, rT) }
              else if (d2 === 0) { amp = cScale(Math.pow(1 / 7, d1 - 1), amp); if (s1 === 0) amp = cMul(amp, rT) }
              else { amp = cScale(Math.pow(1 / 7, d1 + d2 - 2), cMul(amp, rBarT)); if (s1 === 0) amp = cMul(amp, rT); if (s3 === 1) amp = cMul(amp, rT) }
              const arr = [2 * m1 + s1, 2 * m2 + s2, 2 * m3 + s3].sort((u, v) => u - v)
              const id = idx3(arr[0]!, arr[1]!, arr[2]!)
              tRe[id] = tRe[id]! + amp[0]; tIm[id] = tIm[id]! + amp[1]
            }
          }
        }
      }
    }
    let n2 = 0; for (let i = 0; i < N3; i++) n2 += tRe[i]! ** 2 + tIm[i]! ** 2
    const sc = 1 / Math.sqrt(n2); for (let i = 0; i < N3; i++) { tRe[i] = tRe[i]! * sc; tIm[i] = tIm[i]! * sc }
  }

  const step1 = (re: Float64Array, im: Float64Array): [Float64Array, Float64Array] => {
    const nr = new Float64Array(S); const ni = new Float64Array(S)
    for (let m = 0; m < M; m++) for (let s = 0; s < 2; s++) {
      const ar = re[2 * m + s]!; const ai = im[2 * m + s]!; if (ar === 0 && ai === 0) continue
      for (const t of [0, 1]) { const cm = cMat[t]![s]!; const dst = 2 * (t === 0 ? m : (m - 1 + M) % M) + t; nr[dst] = nr[dst]! + (ar * cm[0] - ai * cm[1]); ni[dst] = ni[dst]! + (ar * cm[1] + ai * cm[0]) }
    }
    return [nr, ni]
  }
  const step3 = (re: Float64Array, im: Float64Array): [Float64Array, Float64Array] => {
    const nr = new Float64Array(N3); const ni = new Float64Array(N3)
    const add = (u1: number, u2: number, u3: number, vr: number, vi: number) => {
      let x = u1; let y = u2; let z = u3
      if (x > y) { const tm = x; x = y; y = tm }; if (y > z) { const tm = y; y = z; z = tm }; if (x > y) { const tm = x; x = y; y = tm }
      const id = idx3(x, y, z); nr[id] = nr[id]! + vr; ni[id] = ni[id]! + vi
    }
    for (let c = 2; c < S; c++) {
      const m3 = c >> 1; const s3 = c & 1; const c3Off = C3[c]!
      for (let b = 1; b < c; b++) {
        const m2 = b >> 1; const s2 = b & 1; const cbOff = c3Off + C2[b]!
        for (let a = 0; a < b; a++) {
          const id = cbOff + a; const ar = re[id]!; const ai = im[id]!; if (ar === 0 && ai === 0) continue
          const m1 = a >> 1; const s1 = a & 1
          if (m1 === m2) {
            const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1
            const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
            for (const t3 of [0, 1]) { const c3 = cMat[t3]![s3]!; const n3 = 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3; add(n1, n2, n3, pr * c3[0] - pi * c3[1], pr * c3[1] + pi * c3[0]) }
          } else if (m2 === m3) {
            const n2 = 2 * m2; const n3 = 2 * ((m3 - 1 + M) % M) + 1
            const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
            for (const t1 of [0, 1]) { const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; add(n1, n2, n3, pr * c1[0] - pi * c1[1], pr * c1[1] + pi * c1[0]) }
          } else {
            for (const t1 of [0, 1]) {
              const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; const r1 = ar * c1[0] - ai * c1[1]; const i1 = ar * c1[1] + ai * c1[0]
              for (const t2 of [0, 1]) {
                const c2 = cMat[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2; const r2 = r1 * c2[0] - i1 * c2[1]; const i2 = r1 * c2[1] + i1 * c2[0]
                for (const t3 of [0, 1]) { const c3 = cMat[t3]![s3]!; const n3 = 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3; add(n1, n2, n3, r2 * c3[0] - i2 * c3[1], r2 * c3[1] + i2 * c3[0]) }
              }
            }
          }
        }
      }
    }
    return [nr, ni]
  }

  // Check trion 1-step overlap!
  {
    const [t1r, t1i] = step3(tRe, tIm)
    let ovR = 0; let ovI = 0; for (let i = 0; i < N3; i++) { ovR += tRe[i]! * t1r[i]! + tIm[i]! * t1i[i]!; ovI += tRe[i]! * t1i[i]! - tIm[i]! * t1r[i]! }
    console.log(`  Trion 1-step check (M=${M}): <T|U_3|T> = ${ovR.toFixed(6)}+${ovI.toFixed(6)}i (|<T|U|T>|=${Math.hypot(ovR, ovI).toFixed(6)}, exact lam3=${(-13/14).toFixed(6)}${(-3*SQRT3/14).toFixed(6)}i)`)
  }

  const compose4 = (tr: Float64Array, ti: Float64Array, pr: Float64Array, pi: Float64Array): [Float64Array, Float64Array] => {
    const outR = new Float64Array(N4); const outI = new Float64Array(N4)
    for (let c = 2; c < S; c++) {
      const c3Off = C3[c]!
      for (let b = 1; b < c; b++) {
        const cbOff = c3Off + C2[b]!
        for (let a = 0; a < b; a++) {
          const ar = tr[cbOff + a]!; const ai = ti[cbOff + a]!; if (ar === 0 && ai === 0) continue
          for (let d = 0; d < S; d++) {
            if (d === a || d === b || d === c) continue
            const pcr = pr[d]!; const pci = pi[d]!; if (pcr === 0 && pci === 0) continue
            const vr = ar * pcr - ai * pci; const vi = ar * pci + ai * pcr
            let x0 = a; let x1 = b; let x2 = c; let x3 = d
            if (x2 > x3) { const tm = x2; x2 = x3; x3 = tm }
            if (x1 > x2) { const tm = x1; x1 = x2; x2 = tm }
            if (x0 > x1) { const tm = x0; x0 = x1; x1 = tm }
            const id = idx4(x0, x1, x2, x3)
            outR[id] = outR[id]! + vr; outI[id] = outI[id]! + vi
          }
        }
      }
    }
    let n2 = 0; for (let i = 0; i < N4; i++) n2 += outR[i]! ** 2 + outI[i]! ** 2
    const sc = 1 / Math.sqrt(n2); for (let i = 0; i < N4; i++) { outR[i] = outR[i]! * sc; outI[i] = outI[i]! * sc }
    return [outR, outI]
  }

  let [curTR, curTI] = [tRe, tIm]
  let [curPR, curPI] = [pRe, pIm]
  let [stR, stI] = compose4(curTR, curTI, curPR, curPI)
  let maxNormErr = 0

  for (let t = 1; t <= T; t++) {
    ;[curTR, curTI] = step3(curTR, curTI)
    ;[curPR, curPI] = step1(curPR, curPI)
    const nr = new Float64Array(N4); const ni = new Float64Array(N4)
    const add4 = (u0: number, u1: number, u2: number, u3: number, vr: number, vi: number) => {
      let x0 = u0; let x1 = u1; let x2 = u2; let x3 = u3
      if (x0 > x1) { const tm = x0; x0 = x1; x1 = tm }; if (x2 > x3) { const tm = x2; x2 = x3; x3 = tm }
      if (x0 > x2) { const tm = x0; x0 = x2; x2 = tm }; if (x1 > x3) { const tm = x1; x1 = x3; x3 = tm }
      if (x1 > x2) { const tm = x1; x1 = x2; x2 = tm }
      const id = idx4(x0, x1, x2, x3); nr[id] = nr[id]! + vr; ni[id] = ni[id]! + vi
    }
    for (let d = 3; d < S; d++) {
      const m4 = d >> 1; const s4 = d & 1; const dOff = C4[d]!
      for (let c = 2; c < d; c++) {
        const m3 = c >> 1; const s3 = c & 1; const dcOff = dOff + C3[c]!
        for (let b = 1; b < c; b++) {
          const m2 = b >> 1; const s2 = b & 1; const dcbOff = dcOff + C2[b]!
          for (let a = 0; a < b; a++) {
            const id = dcbOff + a; const ar = stR[id]!; const ai = stI[id]!; if (ar === 0 && ai === 0) continue
            const m1 = a >> 1; const s1 = a & 1
            const p12 = m1 === m2; const p23 = m2 === m3; const p34 = m3 === m4
            if (p12 && p34) {
              const pr = ar * W_C[0] - ai * W_C[1]; const pi = ar * W_C[1] + ai * W_C[0] // w^2 * w^2 = w!
              add4(2 * m1, 2 * ((m2 - 1 + M) % M) + 1, 2 * m3, 2 * ((m4 - 1 + M) % M) + 1, pr, pi)
            } else if (p12) {
              const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1
              const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
              for (const t3 of [0, 1]) {
                const c3 = cMat[t3]![s3]!; const n3 = 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3
                const r3 = pr * c3[0] - pi * c3[1]; const i3 = pr * c3[1] + pi * c3[0]
                for (const t4 of [0, 1]) { const c4 = cMat[t4]![s4]!; const n4 = 2 * (t4 === 0 ? m4 : (m4 - 1 + M) % M) + t4; add4(n1, n2, n3, n4, r3 * c4[0] - i3 * c4[1], r3 * c4[1] + i3 * c4[0]) }
              }
            } else if (p23) {
              const n2 = 2 * m2; const n3 = 2 * ((m3 - 1 + M) % M) + 1
              const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
              for (const t1 of [0, 1]) {
                const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
                const r1 = pr * c1[0] - pi * c1[1]; const i1 = pr * c1[1] + pi * c1[0]
                for (const t4 of [0, 1]) { const c4 = cMat[t4]![s4]!; const n4 = 2 * (t4 === 0 ? m4 : (m4 - 1 + M) % M) + t4; add4(n1, n2, n3, n4, r1 * c4[0] - i1 * c4[1], r1 * c4[1] + i1 * c4[0]) }
              }
            } else if (p34) {
              const n3 = 2 * m3; const n4 = 2 * ((m4 - 1 + M) % M) + 1
              const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
              for (const t1 of [0, 1]) {
                const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
                const r1 = pr * c1[0] - pi * c1[1]; const i1 = pr * c1[1] + pi * c1[0]
                for (const t2 of [0, 1]) { const c2 = cMat[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2; add4(n1, n2, n3, n4, r1 * c2[0] - i1 * c2[1], r1 * c2[1] + i1 * c2[0]) }
              }
            } else {
              for (const t1 of [0, 1]) {
                const c1 = cMat[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1; const r1 = ar * c1[0] - ai * c1[1]; const i1 = ar * c1[1] + ai * c1[0]
                for (const t2 of [0, 1]) {
                  const c2 = cMat[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2; const r2 = r1 * c2[0] - i1 * c2[1]; const i2 = r1 * c2[1] + i1 * c2[0]
                  for (const t3 of [0, 1]) {
                    const c3 = cMat[t3]![s3]!; const n3 = 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3; const r3 = r2 * c3[0] - i2 * c3[1]; const i3 = r2 * c3[1] + i2 * c3[0]
                    for (const t4 of [0, 1]) { const c4 = cMat[t4]![s4]!; const n4 = 2 * (t4 === 0 ? m4 : (m4 - 1 + M) % M) + t4; add4(n1, n2, n3, n4, r3 * c4[0] - i3 * c4[1], r3 * c4[1] + i3 * c4[0]) }
                  }
                }
              }
            }
          }
        }
      }
    }
    stR = nr; stI = ni
    let n2 = 0; for (let i = 0; i < N4; i++) n2 += stR[i]! ** 2 + stI[i]! ** 2
    maxNormErr = Math.max(maxNormErr, Math.abs(n2 - 1))
  }
  const [refR, refI] = compose4(curTR, curTI, curPR, curPI)
  let ovR = 0; let ovI = 0
  for (let i = 0; i < N4; i++) { ovR += refR[i]! * stR[i]! + refI[i]! * stI[i]!; ovI += refR[i]! * stI[i]! - refI[i]! * stR[i]! }
  console.log(`  Trion + Pulse Sym^4 (M=${M}, T=${T}, p*=${pStarT.toFixed(4)}): normErr=${maxNormErr.toExponential(1)}, |<ref|out>|^2=${(ovR*ovR+ovI*ovI).toFixed(6)}, dPhi=${(Math.atan2(ovI, ovR)/PI).toFixed(5)}pi`)
}
// M=16: mP0=2, mT0=9 (sep=7 even steps = 14 docks); v_T = 0, v_P = 0.3547 docks/beat = 0.177 even steps/beat -> collision at t=40, cleanly past at T=74!
runTrionPulseCZ(16, 74)

export {}
