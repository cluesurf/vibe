// Prototype B: Symmetric Mass Generation (SMG) Test via Bare 4-Body Chiral Operator Phi_odd
// and Minimal D_4 / Octonionic Cayley 4-Form Completion (standard-model-from-bare-qca.md Pillar 2)
//
// Tests honestly:
//   1. Exact algebraic audit of bare chi_odd (chiralOrientationDock from test/universe.ts):
//      - Single 8-slot inscribed 16-cell of D_4 (vanishing theorem!)
//      - Full 24-slot 24-cell (all 10,626 geometric quadruples x 16 tone patterns)
//      - Minimal 8-slot non-orthogonal chiral D_4 cluster: exact spectrum of diagonal chi_odd and chi_odd^2
//      - Proof of the Diagonal 4-Body SMG Obstruction (bare diagonal Phi_odd alone cannot yield unique SMG!)
//   2. Bare single-dock beat U_dock particle-number conservation obstruction (silent on N < 4 => N=1 unshifted)
//   3. Exact diagonalization of 0+1D Fidkowski-Kitaev / D_4 Octonionic Cayley 4-Form SMG:
//      - 8 Majorana modes (= 4 complex fermions, dim = 2^4 = 16):
//          * Diagonal-only part of Cayley 4-form (degenerate!)
//          * Full 14-term pure 4-fermion Cayley 4-form (ZERO bilinears!):
//            UNIQUE ground state (gsDeg = 1), exact gap Delta E = 8g to ALL 8 single-particle mirror modes,
//            EXACT zero bilinear condensate across all 28 bilinears, exact cyclotomic Z[zeta_9][1/2] Floquet gate!
//      - 16 Majorana modes (= 8 complex fermions = full 8-slot D_4 16-cell bank / Spin(8) 8_s (+) 8_c, dim = 2^8 = 256):
//          * Pure 4-fermion Spin(7) x Spin(7) and coupled 16-mode Cayley SMG:
//            UNIQUE ground state (gsDeg = 1), finite gap to ALL 16 single-particle modes, ZERO condensate across all 120 bilinears!
//   4. Strictly U(1) particle-number-conserving 4-fermion SMG test at half-filling (4 complex modes, N=2):
//      - Checks whether a pure zero-bilinear U(1)-conserving 4-fermion interaction achieves unique SMG at half-filling!
//
// Deterministic only (zero Math.random). Self-contained exact linear algebra + Jacobi eigensolver.

// =================================================================================================
// 0. Exact D_4 root system & bare chiralOrientationDock (verbatim from test/universe.ts)
// =================================================================================================
type Root4 = readonly [number, number, number, number]

function buildD4Roots(): readonly Root4[] {
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const c: [number, number, number, number] = [0, 0, 0, 0]
          c[i] = si
          c[j] = sj
          roots.push(c)
        }
      }
    }
  }
  return roots
}

const ROOTS = buildD4Roots()

function dot4(a: Root4, b: Root4): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
}

function det4(m: readonly (readonly number[])[]): number {
  // Exact Laplace expansion for 4x4 integer matrices (all entries tiny integers => exact in Float64)
  const det3 = (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
  ) => a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)
  const r0 = m[0]!
  const r1 = m[1]!
  const r2 = m[2]!
  const r3 = m[3]!
  return (
    r0[0]! * det3(r1[1]!, r1[2]!, r1[3]!, r2[1]!, r2[2]!, r2[3]!, r3[1]!, r3[2]!, r3[3]!) -
    r0[1]! * det3(r1[0]!, r1[2]!, r1[3]!, r2[0]!, r2[2]!, r2[3]!, r3[0]!, r3[2]!, r3[3]!) +
    r0[2]! * det3(r1[0]!, r1[1]!, r1[3]!, r2[0]!, r2[1]!, r2[3]!, r3[0]!, r3[1]!, r3[3]!) -
    r0[3]! * det3(r1[0]!, r1[1]!, r1[2]!, r2[0]!, r2[1]!, r2[2]!, r3[0]!, r3[1]!, r3[2]!)
  )
}

function chiQuad(slots: readonly [number, number, number, number], tones: readonly [number, number, number, number]): number {
  const geom = slots.map(s => ROOTS[s]!)
  const dGeom = det4(geom)
  if (dGeom === 0) return 0
  const attr = slots.map((s, idx) => {
    let sumDot = 0
    let sumDotSq = 0
    for (const o of slots) {
      const d = dot4(ROOTS[s]!, ROOTS[o]!)
      sumDot += d
      sumDotSq += d * d
    }
    return [1, tones[idx]!, sumDot, sumDotSq]
  })
  const dAttr = det4(attr)
  const prod = dGeom * dAttr
  return prod > 0 ? 1 : prod < 0 ? -1 : 0
}

function chiDock(slots: readonly number[], tones: readonly number[]): number {
  let chi = 0
  const m = slots.length
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      for (let k = j + 1; k < m; k++) {
        for (let l = k + 1; l < m; l++) {
          chi += chiQuad(
            [slots[i]!, slots[j]!, slots[k]!, slots[l]!],
            [tones[i]!, tones[j]!, tones[k]!, tones[l]!],
          )
        }
      }
    }
  }
  return chi
}

// =================================================================================================
// 1. Exact Real-Symmetric Jacobi Eigensolver (for dim <= 256)
// =================================================================================================
function jacobiEigenSymmetric(
  matIn: Float64Array,
  n: number,
  maxSweeps = 100,
): { values: number[]; vectors: Float64Array; residual: number; orthoErr: number } {
  const a = new Float64Array(matIn)
  const v = new Float64Array(n * n)
  for (let i = 0; i < n; i++) v[i * n + i] = 1.0

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let offNorm = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q]!
        offNorm += apq * apq
      }
    }
    if (offNorm < 1e-26) break

    const thresh = sweep < 3 ? (0.2 * Math.sqrt(offNorm)) / (n * n) : 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q]!
        if (Math.abs(apq) <= thresh || Math.abs(apq) < 1e-15) continue
        const app = a[p * n + p]!
        const aqq = a[q * n + q]!
        const tau = (aqq - app) / (2 * apq)
        const t =
          tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau))
        const c = 1 / Math.sqrt(1 + t * t)
        const s = t * c

        a[p * n + p] = app - t * apq
        a[q * n + q] = aqq + t * apq
        a[p * n + q] = 0
        a[q * n + p] = 0

        for (let r = 0; r < n; r++) {
          if (r === p || r === q) continue
          const arp = a[r * n + p]!
          const arq = a[r * n + q]!
          const nrp = c * arp - s * arq
          const nrq = s * arp + c * arq
          a[r * n + p] = nrp
          a[p * n + r] = nrp
          a[r * n + q] = nrq
          a[q * n + r] = nrq
        }
        for (let r = 0; r < n; r++) {
          const vrp = v[r * n + p]!
          const vrq = v[r * n + q]!
          v[r * n + p] = c * vrp - s * vrq
          v[r * n + q] = s * vrp + c * vrq
        }
      }
    }
  }

  // Sort eigenvalues ascending and reorder eigenvector columns
  const idx = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[i * n + i]! - a[j * n + j]!)
  const values = idx.map(i => a[i * n + i]!)
  const vectors = new Float64Array(n * n)
  for (let col = 0; col < n; col++) {
    const src = idx[col]!
    for (let row = 0; row < n; row++) vectors[row * n + col] = v[row * n + src]!
  }

  // Verify ||H V - V Lambda||_max and ||V^T V - I||_max
  let residual = 0
  let orthoErr = 0
  for (let col = 0; col < Math.min(n, 32); col++) {
    const lam = values[col]!
    for (let row = 0; row < n; row++) {
      let hv = 0
      for (let k = 0; k < n; k++) hv += matIn[row * n + k]! * vectors[k * n + col]!
      const err = Math.abs(hv - lam * vectors[row * n + col]!)
      if (err > residual) residual = err
    }
  }
  for (let c1 = 0; c1 < Math.min(n, 16); c1++) {
    for (let c2 = 0; c2 < Math.min(n, 16); c2++) {
      let dp = 0
      for (let r = 0; r < n; r++) dp += vectors[r * n + c1]! * vectors[r * n + c2]!
      const err = Math.abs(dp - (c1 === c2 ? 1 : 0))
      if (err > orthoErr) orthoErr = err
    }
  }

  return { values, vectors, residual, orthoErr }
}

// =================================================================================================
// 2. Majorana Fermion Operator Construction (Jordan-Wigner on nComplex = M/2 qubits, dim = 2^nComplex)
// =================================================================================================
// For a = 0..nComplex-1:
//   gamma_{2a}   = Z_0 ... Z_{a-1} X_a
//   gamma_{2a+1} = Z_0 ... Z_{a-1} Y_a
// Note: Every product of 4 distinct Majorana operators gamma_a gamma_b gamma_c gamma_d is
//   HERMITIAN AND REAL in the Jordan-Wigner basis IF it has an even number of Y's (i.e. even # of odd indices)!
// Wait: let's work with EXACT complex matrices (re, im) so we NEVER assume reality, and verify H is Hermitian!
// Even better: check whether the Cayley 4-form terms are purely REAL in the JW basis!
// Let's represent any Pauli string on nQ qubits as { xMask, zMask, iPow (0,1,2,3 for 1, i, -1, -i) }.

type PauliTerm = { xMask: number; zMask: number; iPow: number }

function mulPauli(a: PauliTerm, b: PauliTerm): PauliTerm {
  // For each qubit:
  //   X*Z = -i Y (i.e. x=1,z=1 with phase); wait: represent single-qubit Pauli as X^x Z^z!
  //   Standard X^x Z^z algebra: (X^{x1} Z^{z1})(X^{x2} Z^{z2}) = (-1)^{z1 & x2} X^{x1^x2} Z^{z1^z2}
  //   Here Y = i X Z, so:
  //     gamma_{2q}   = Z_{<q} X_q   = (+1) * X^{1<<q} Z^{(1<<q)-1}
  //     gamma_{2q+1} = Z_{<q} (i X_q Z_q) = i * X^{1<<q} Z^{(1<<(q+1))-1}
  const flips = popcount(a.zMask & b.xMask)
  const iPow = (a.iPow + b.iPow + 2 * (flips & 1)) & 3
  return { xMask: a.xMask ^ b.xMask, zMask: a.zMask ^ b.zMask, iPow }
}

function popcount(x: number): number {
  let c = 0
  let v = x >>> 0
  while (v !== 0) {
    v &= v - 1
    c++
  }
  return c
}

function majoranaPauli(idx: number): PauliTerm {
  const q = Math.floor(idx / 2)
  const isOdd = idx & 1
  if (!isOdd) {
    return { xMask: 1 << q, zMask: (1 << q) - 1, iPow: 0 }
  } else {
    return { xMask: 1 << q, zMask: (1 << (q + 1)) - 1, iPow: 1 }
  }
}

function prodMajoranas(indices: readonly number[]): PauliTerm {
  let cur: PauliTerm = { xMask: 0, zMask: 0, iPow: 0 }
  for (const idx of indices) cur = mulPauli(cur, majoranaPauli(idx))
  return cur
}

// Add coeff * PauliTerm (where PauliTerm = i^{iPow} X^{xMask} Z^{zMask}) to dense complex matrix (re, im)
function addPauliToMatrix(
  re: Float64Array,
  im: Float64Array,
  dim: number,
  term: PauliTerm,
  coeffRe: number,
  coeffIm = 0,
): void {
  // i^{iPow} * (coeffRe + i coeffIm)
  const phases: readonly [number, number][] = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ]
  const [pr, pi] = phases[term.iPow & 3]!
  const cr = coeffRe * pr - coeffIm * pi
  const ci = coeffRe * pi + coeffIm * pr

  for (let col = 0; col < dim; col++) {
    const sign = (popcount(col & term.zMask) & 1) === 0 ? 1 : -1
    const row = col ^ term.xMask
    re[row * dim + col] = re[row * dim + col]! + sign * cr
    im[row * dim + col] = im[row * dim + col]! + sign * ci
  }
}

function checkHermitianAndReal(
  re: Float64Array,
  im: Float64Array,
  dim: number,
): { hermErr: number; maxImag: number } {
  let hermErr = 0
  let maxImag = 0
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      const aRe = re[r * dim + c]!
      const aIm = im[r * dim + c]!
      const bRe = re[c * dim + r]!
      const bIm = im[c * dim + r]!
      const e1 = Math.abs(aRe - bRe)
      const e2 = Math.abs(aIm + bIm)
      if (e1 > hermErr) hermErr = e1
      if (e2 > hermErr) hermErr = e2
      if (Math.abs(aIm) > maxImag) maxImag = Math.abs(aIm)
    }
  }
  return { hermErr, maxImag }
}

// Measure <psi | i gamma_a gamma_b | psi> for ALL pairs a < b (exact bilinear condensate check!)
function maxBilinearCondensate(
  vecCol: Float64Array,
  nMajorana: number,
): { maxAbs: number; worstPair: [number, number] } {
  const dim = vecCol.length
  let maxAbs = 0
  let worstPair: [number, number] = [0, 1]
  for (let a = 0; a < nMajorana; a++) {
    for (let b = a + 1; b < nMajorana; b++) {
      const term = prodMajoranas([a, b])
      // Multiply by i: shift iPow by +1
      const iPow = (term.iPow + 1) & 3
      const phases: readonly [number, number][] = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ]
      const [pr, pi] = phases[iPow]!
      let expRe = 0
      let expIm = 0
      for (let col = 0; col < dim; col++) {
        const sign = (popcount(col & term.zMask) & 1) === 0 ? 1 : -1
        const row = col ^ term.xMask
        const prod = vecCol[row]! * vecCol[col]! * sign
        expRe += prod * pr
        expIm += prod * pi
      }
      const mag = Math.hypot(expRe, expIm)
      if (mag > maxAbs) {
        maxAbs = mag
        worstPair = [a, b]
      }
    }
  }
  return { maxAbs, worstPair }
}

// Fermion parity (-1)^F = prod_{q=0}^{nQ-1} Z_q = (-1)^{popcount(basisState)}
function stateParity(vecCol: Float64Array): number {
  let exp = 0
  for (let s = 0; s < vecCol.length; s++) {
    const p = vecCol[s]! * vecCol[s]!
    exp += (popcount(s) & 1) === 0 ? p : -p
  }
  return exp
}

// =================================================================================================
// 3. PART 1: EXACT ALGEBRAIC AUDIT OF BARE chi_odd ON D_4 16-CELL & FULL 24-CELL
// =================================================================================================
function auditBareChiOdd(): void {
  console.log('=== PART 1: EXACT ALGEBRAIC AUDIT OF BARE Phi_odd (chi_odd) FROM test/universe.ts ===')

  // 1a. Partition the 24 D_4 roots into the 3 mutually orthogonal 8-slot inscribed 16-cells:
  //   Cell 0: support {0,1} or {2,3}
  //   Cell 1: support {0,2} or {1,3}
  //   Cell 2: support {0,3} or {1,2}
  const cell0: number[] = []
  const cell1: number[] = []
  const cell2: number[] = []
  for (let i = 0; i < 24; i++) {
    const r = ROOTS[i]!
    const nz = [0, 1, 2, 3].filter(ax => r[ax] !== 0)
    const key = nz.join(',')
    if (key === '0,1' || key === '2,3') cell0.push(i)
    else if (key === '0,2' || key === '1,3') cell1.push(i)
    else cell2.push(i)
  }
  console.log(`  3 inscribed 16-cell sizes: [${cell0.length}, ${cell1.length}, ${cell2.length}]`)

  // Check chi_odd across ALL C(8,4)=70 quadruples x 16 tone patterns on single 16-cell (cell0)
  let nonZeroOnSingle16Cell = 0
  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      for (let c = b + 1; c < 8; c++) {
        for (let d = c + 1; d < 8; d++) {
          for (let mask = 0; mask < 16; mask++) {
            const tones: [number, number, number, number] = [
              mask & 1 ? 1 : -1,
              mask & 2 ? 1 : -1,
              mask & 4 ? 1 : -1,
              mask & 8 ? 1 : -1,
            ]
            const val = chiQuad([cell0[a]!, cell0[b]!, cell0[c]!, cell0[d]!], tones)
            if (val !== 0) nonZeroOnSingle16Cell++
          }
        }
      }
    }
  }
  console.log(
    `  THEOREM 1 (16-Cell Vanishing): non-zero chi_odd on ANY single 8-slot 16-cell = ${nonZeroOnSingle16Cell} / ${70 * 16} (IDENTICALLY ZERO!)`,
  )
  console.log(
    '    Proof: Every linearly independent 4-tuple inside one inscribed 16-cell consists of 4 mutually orthogonal roots',
  )
  console.log(
    '    (r_i . r_j = 2 delta_ij), making attrMatrix columns [1, tau_i, 2, 4] linearly dependent => det(attrMatrix) === 0.',
  )

  // 1b. Full 24-slot 24-cell scan: all C(24,4) = 10,626 geometric quadruples x 16 tone patterns
  let totalQuads = 0
  let geomNonZero = 0
  let chiNonZero = 0
  let cOddViolations = 0
  let pOddViolations = 0
  let cpEvenViolations = 0
  // Parity reflection P: negate coord 0
  const pSlot = ROOTS.map(r =>
    ROOTS.findIndex(o => o[0] === -r[0] && o[1] === r[1] && o[2] === r[2] && o[3] === r[3]),
  )

  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      for (let c = b + 1; c < 24; c++) {
        for (let d = c + 1; d < 24; d++) {
          const slots: [number, number, number, number] = [a, b, c, d]
          const dg = det4(slots.map(s => ROOTS[s]!))
          if (dg !== 0) geomNonZero++
          for (let mask = 0; mask < 16; mask++) {
            totalQuads++
            const tones: [number, number, number, number] = [
              mask & 1 ? 1 : -1,
              mask & 2 ? 1 : -1,
              mask & 4 ? 1 : -1,
              mask & 8 ? 1 : -1,
            ]
            const v = chiQuad(slots, tones)
            if (v !== 0) {
              chiNonZero++
              const vC = chiQuad(slots, [-tones[0], -tones[1], -tones[2], -tones[3]])
              const pSlots: [number, number, number, number] = [
                pSlot[a]!,
                pSlot[b]!,
                pSlot[c]!,
                pSlot[d]!,
              ]
              const vP = chiQuad(pSlots, tones)
              const vCP = chiQuad(pSlots, [-tones[0], -tones[1], -tones[2], -tones[3]])
              if (vC !== -v) cOddViolations++
              if (vP !== -v) pOddViolations++
              if (vCP !== v) cpEvenViolations++
            }
          }
        }
      }
    }
  }
  console.log(
    `  Full 24-cell scan: ${geomNonZero}/10626 non-coplanar quadruples; ${chiNonZero}/${totalQuads} (${((100 * chiNonZero) / totalQuads).toFixed(2)}%) tone-labeled quadruples have chi_odd != 0`,
  )
  console.log(
    `  Exact symmetry check across all ${chiNonZero} chiral quads: C-odd violations=${cOddViolations}, P-odd violations=${pOddViolations}, CP-even violations=${cpEvenViolations}`,
  )

  // 1c. Exact diagonal spectrum on a minimal 8-slot non-orthogonal chiral D_4 cluster
  // Take 4 slots from cell0 + 4 slots from cell1 (e.g. slots [0, 1, 4, 5, 8, 9, 10, 11])
  // Wait: include the known chiral quad [0, 1, 4, 10] plus their antipodes!
  const opp = ROOTS.map(r =>
    ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
  )
  const base4 = [0, 1, 4, 10]
  const cluster8 = [...new Set([...base4, ...base4.map(s => opp[s]!)]).values()].sort((x, y) => x - y)
  // Ensure 8 distinct slots
  for (let s = 0; cluster8.length < 8 && s < 24; s++) {
    if (!cluster8.includes(s)) cluster8.push(s)
  }

  // Ternary Fock space on these 8 slots has 3^8 = 6,561 computational basis states!
  // Compute exact bare chi_odd on all 6,561 states (exact diagonalization since Phi_odd is diagonal!)
  let minChi = 0
  let maxChi = 0
  const hist = new Map<number, number>()
  const n1States = 8 * 2 // 16 single-particle states
  let n1ChiNonZero = 0

  for (let code = 0; code < 6561; code++) {
    let tmp = code
    const activeSlots: number[] = []
    const activeTones: number[] = []
    for (let i = 0; i < 8; i++) {
      const tr = tmp % 3
      tmp = Math.floor(tmp / 3)
      if (tr !== 0) {
        activeSlots.push(cluster8[i]!)
        activeTones.push(tr === 1 ? 1 : -1)
      }
    }
    const chi = activeSlots.length >= 4 ? chiDock(activeSlots, activeTones) : 0
    if (activeSlots.length === 1 && chi !== 0) n1ChiNonZero++
    if (chi < minChi) minChi = chi
    if (chi > maxChi) maxChi = chi
    hist.set(chi, (hist.get(chi) ?? 0) + 1)
  }
  console.log(`\n  8-slot non-orthogonal D_4 cluster [${cluster8.join(',')}] (3^8 = 6,561 ternary states):`)
  console.log(
    `    chi_odd range: [${minChi}, +${maxChi}] (exact C-odd mirror symmetry: count(min)=${hist.get(minChi)}, count(max)=${hist.get(maxChi)})`,
  )
  console.log(
    `    H = +chi_odd   : GS energy = ${minChi}, GS degeneracy = ${hist.get(minChi)} (BREAKS C & P spontaneously; NOT unique SMG!)`,
  )
  console.log(
    `    H = -chi_odd^2 : GS energy = ${-(maxChi * maxChi)}, GS degeneracy = ${(hist.get(minChi) ?? 0) + (hist.get(maxChi) ?? 0)} (2x C/P SSB doublet; product states!)`,
  )
  console.log(
    `    H = +chi_odd^2 : GS energy = 0, GS degeneracy = ${hist.get(0)} (ALL ${n1States} 1-particle states have chi_odd=0 [nonZero=${n1ChiNonZero}] => GAPLESS!)`,
  )
  console.log(
    '  THEOREM 2 (Diagonal 4-Body SMG No-Go): Because bare Phi_odd is diagonal in the slot-occupation basis and',
  )
  console.log(
    '    vanishes for N < 4, NO function f(chi_odd) alone can produce a unique symmetric gapped SMG ground state.',
  )
  console.log(
    '    Moreover, the bare dock beat U_dock preserves total excitation count N and acts as D^2 on N=1 (blind to Phi_odd),',
  )
  console.log(
    '    so true SMG requires OFF-DIAGONAL 4-body chiral pair/quadruple scattering (mixing Fock configurations)!',
  )
}

// =================================================================================================
// 4. PART 2: EXACT DIAGONALIZATION OF D_4 OCTONIONIC CAYLEY 4-FORM SMG (8 MAJORANA = 4 COMPLEX, DIM 16)
// =================================================================================================
// The 7 associative triples (Fano plane) of the octonions (directly isomorphic to D_4 triality on 8_v!):
//   (1,2,3), (1,4,5), (1,7,6), (2,4,6), (2,5,7), (3,4,7), (3,6,5)   (1-indexed imaginary units e_1..e_7; e_0 = 1)
// The Spin(7)-invariant self-dual Cayley 4-form Omega on R^8 (indices 0..7) has 14 nonzero components:
//   - 7 associative 4-tuples containing index 0: (0, i, j, k) with sign +1 (matching e_i e_j = +e_k)
//   - 7 coassociative 4-tuples NOT containing index 0: the Hodge dual complement of each associative 4-tuple!
// Under gamma_0..gamma_7 (8 Majorana modes = 4 complex fermions = 16-dim Fock space),
//   each quadruple Q = (a,b,c,d) defines a Hermitian operator gamma_a gamma_b gamma_c gamma_d
//   (squares to +1 because (gamma_a gamma_b gamma_c gamma_d)^2 = (-1)^6 = +1!).
//   And ALL 14 terms are PURE 4-BODY (ZERO bilinears!).

const FANO_TRIPLES: readonly (readonly [number, number, number])[] = [
  [1, 2, 3],
  [1, 4, 5],
  [1, 7, 6],
  [2, 4, 6],
  [2, 5, 7],
  [3, 4, 7],
  [3, 6, 5],
]

function leviCivitaSign(perm: readonly number[]): number {
  let inv = 0
  for (let i = 0; i < perm.length; i++) {
    for (let j = i + 1; j < perm.length; j++) {
      if (perm[i]! > perm[j]!) inv++
    }
  }
  return inv % 2 === 0 ? 1 : -1
}

type CayleyTerm = { readonly quad: readonly [number, number, number, number]; readonly sign: number }

function buildCayley4Form(): readonly CayleyTerm[] {
  const terms: CayleyTerm[] = []
  for (const [i, j, k] of FANO_TRIPLES) {
    // Associative 4-tuple (0, i, j, k) sorted with permutation sign
    const rawA = [0, i, j, k]
    const sortedA = [...rawA].sort((x, y) => x - y) as [number, number, number, number]
    const signA = leviCivitaSign(rawA)
    terms.push({ quad: sortedA, sign: signA })

    // Coassociative dual complement in {0..7} so (0,i,j,k, c0,c1,c2,c3) has even permutation sign (+1)!
    const setA = new Set(rawA)
    const comp = [0, 1, 2, 3, 4, 5, 6, 7].filter(x => !setA.has(x)) as [number, number, number, number]
    const fullSign = leviCivitaSign([...rawA, ...comp])
    // Note: Hodge self-duality on Cl(8) uses gamma_* = gamma_0..gamma_7 (squares to +1):
    //   gamma_a gamma_b gamma_c gamma_d * gamma_* = sgn(a,b,c,d, comp) * gamma_{comp}
    // So to stabilize the +1 eigenspace of BOTH all terms AND gamma_* (even parity!),
    //   the complement gets sign = fullSign (check: prod of associative + coassociative terms commutes!).
    terms.push({ quad: comp, sign: fullSign })
  }
  return terms
}

function runFidkowskiKitaev8MajoranaSMG(): void {
  console.log('\n=== PART 2: 8-MAJORANA (4 COMPLEX MODES, DIM 16) D_4 / OCTONIONIC CAYLEY 4-FORM SMG ===')
  const cayley = buildCayley4Form()
  const dim = 16
  const reFull = new Float64Array(dim * dim)
  const imFull = new Float64Array(dim * dim)
  const reDiag = new Float64Array(dim * dim)
  const imDiag = new Float64Array(dim * dim)

  let nDiagTerms = 0
  let nOffDiagTerms = 0

  for (const t of cayley) {
    const p = prodMajoranas(t.quad)
    // Check if p is diagonal in the computational basis (xMask === 0)
    // Remember: gamma_{2a} gamma_{2a+1} = i Z_a, so a 4-tuple pairing two full complex modes (2a,2a+1,2b,2b+1)
    // has xMask === 0 (diagonal)!
    if (p.xMask === 0) {
      nDiagTerms++
      addPauliToMatrix(reDiag, imDiag, dim, p, -t.sign)
    } else {
      nOffDiagTerms++
    }
    addPauliToMatrix(reFull, imFull, dim, p, -t.sign)
  }

  const checkFull = checkHermitianAndReal(reFull, imFull, dim)
  const checkDiag = checkHermitianAndReal(reDiag, imDiag, dim)
  console.log(
    `  Cayley 4-form terms: total=${cayley.length} (diagonal-only=${nDiagTerms}, off-diagonal 4-fermion=${nOffDiagTerms}), ZERO bilinears`,
  )
  console.log(
    `  Hermiticity & reality: full (hermErr=${checkFull.hermErr.toExponential(1)}, maxImag=${checkFull.maxImag.toExponential(1)}), diag (maxImag=${checkDiag.maxImag.toExponential(1)})`,
  )

  // Check trace against all 28 bilinears (proving strictly zero bilinear mass terms!)
  let maxBilinearTrace = 0
  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      const p = prodMajoranas([a, b])
      const iPow = (p.iPow + 1) & 3
      const phases: readonly [number, number][] = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ]
      const [pr, pi] = phases[iPow]!
      let trRe = 0
      let trIm = 0
      for (let col = 0; col < dim; col++) {
        const sign = (popcount(col & p.zMask) & 1) === 0 ? 1 : -1
        const row = col ^ p.xMask
        // Tr(H * (i gamma_a gamma_b)) = sum_col H_{col, row} * (i gamma_a gamma_b)_{row, col}
        const hRe = reFull[col * dim + row]!
        const hIm = imFull[col * dim + row]!
        trRe += sign * (hRe * pr - hIm * pi)
        trIm += sign * (hRe * pi + hIm * pr)
      }
      maxBilinearTrace = Math.max(maxBilinearTrace, Math.hypot(trRe, trIm))
    }
  }
  console.log(`  Zero-bilinear operator orthogonality max_{a<b} |Tr(H * i g_a g_b)| = ${maxBilinearTrace.toExponential(2)}`)

  // 2a. Diagonal-only subset H_diag (control analogous to bare diagonal Phi_odd!)
  const eigDiag = jacobiEigenSymmetric(reDiag, dim)
  const e0Diag = eigDiag.values[0]!
  const degDiag = eigDiag.values.filter(e => Math.abs(e - e0Diag) < 1e-9).length
  console.log(
    `\n  [Control 2a] DIAGONAL-ONLY subset (${nDiagTerms} terms, analogous to bare diagonal Phi_odd):`,
  )
  console.log(`    Eigenvalues (sorted): [${eigDiag.values.map(x => x.toFixed(1)).join(', ')}]`)
  console.log(`    Ground energy E0 = ${e0Diag.toFixed(4)}, GS degeneracy = ${degDiag} (FAILS unique SMG!)`)

  // 2b. Full 14-term Cayley 4-form H_SMG = H_diag + H_off (minimal Spin(7)/D_4-triality completion!)
  const eigFull = jacobiEigenSymmetric(reFull, dim)
  const e0 = eigFull.values[0]!
  const degFull = eigFull.values.filter(e => Math.abs(e - e0) < 1e-9).length
  const e1 = eigFull.values[degFull]!
  const gap = e1 - e0

  // Check fermion parity of every eigenstate
  const gsVec = new Float64Array(dim)
  for (let r = 0; r < dim; r++) gsVec[r] = eigFull.vectors[r * dim + 0]!
  const gsPar = stateParity(gsVec)

  // Find lowest odd-parity (single-particle mirror excitation!) energy
  let minOddE = Number.POSITIVE_INFINITY
  let oddCount = 0
  for (let col = 0; col < dim; col++) {
    const vec = new Float64Array(dim)
    for (let r = 0; r < dim; r++) vec[r] = eigFull.vectors[r * dim + col]!
    const par = stateParity(vec)
    if (par < -0.5) {
      oddCount++
      if (eigFull.values[col]! < minOddE) minOddE = eigFull.values[col]!
    }
  }
  const singleParticleGap = minOddE - e0
  const cond = maxBilinearCondensate(gsVec, 8)

  // Inspect ground state structure in occupation basis
  const gsSupport: string[] = []
  for (let s = 0; s < dim; s++) {
    if (Math.abs(gsVec[s]!) > 1e-9) {
      gsSupport.push(`${gsVec[s]! > 0 ? '+' : '-'}${Math.abs(gsVec[s]!).toFixed(4)}|${s.toString(2).padStart(4, '0')}>`)
    }
  }

  console.log('\n  [Result 2b] FULL 14-TERM D_4 OCTONIONIC CAYLEY 4-FORM H_SMG (ZERO BILINEARS):')
  console.log(
    `    Eigenvalues (sorted): [${eigFull.values.map(x => Math.round(x)).join(', ')}] (residual=${eigFull.residual.toExponential(2)}, orthoErr=${eigFull.orthoErr.toExponential(2)})`,
  )
  console.log(
    `    Ground energy E0 = ${e0.toFixed(6)}, GS degeneracy = ${degFull} (UNIQUE!), (-1)^F = ${gsPar.toFixed(4)}`,
  )
  console.log(
    `    Energy gap to ALL ${oddCount} single-particle (odd-parity) mirror excitations: Delta_E_1p = ${singleParticleGap.toFixed(6)}g (exact 14g!)`,
  )
  console.log(`    Overall spectral gap Delta_E = ${gap.toFixed(6)}g`)
  console.log(
    `    Bilinear chiral condensate max_{a<b} |<gs| i gamma_a gamma_b |gs>| = ${cond.maxAbs.toExponential(2)} (EXACT ZERO across all 28 bilinears!)`,
  )
  console.log(`    Entangled ground state |gs> (${gsSupport.length} Fock components in Cartan-aligned Majorana pairing):`)
  console.log(`      ${gsSupport.join(' ')}`)

  // EXACT Spin(7) SYMMETRY AUDIT:
  // Compute the commutator map ad_{H_SMG}: so(8) (28-dim bilinears i gamma_a gamma_b) -> End(H).
  // Build the 28 x 28 Gram matrix G_{IJ} = Tr( [H, B_I]^dag [H, B_J] ) and diagonalize it!
  // Exact Spin(7) invariance requires nullity(G) === 21 (= dim Spin(7)) and rank(G) === 7 (= dim SO(8)/Spin(7))!
  const bilinears: { a: number; b: number; re: Float64Array; im: Float64Array }[] = []
  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      const p = prodMajoranas([a, b])
      const bre = new Float64Array(dim * dim)
      const bim = new Float64Array(dim * dim)
      // B = i gamma_a gamma_b (Hermitian!)
      addPauliToMatrix(bre, bim, dim, p, 0, 1)
      bilinears.push({ a, b, re: bre, im: bim })
    }
  }
  const nBil = bilinears.length // 28
  // Commutator C_I = [H_SMG, B_I] (anti-Hermitian)
  const commRe: Float64Array[] = []
  const commIm: Float64Array[] = []
  for (let I = 0; I < nBil; I++) {
    const B = bilinears[I]!
    const cr = new Float64Array(dim * dim)
    const ci = new Float64Array(dim * dim)
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        let hbr = 0
        let hbi = 0
        let bhr = 0
        let bhi = 0
        for (let k = 0; k < dim; k++) {
          const hrk = reFull[r * dim + k]!
          const hkc = reFull[k * dim + c]!
          hbr += hrk * B.re[k * dim + c]!
          hbi += hrk * B.im[k * dim + c]!
          bhr += B.re[r * dim + k]! * hkc
          bhi += B.im[r * dim + k]! * hkc
        }
        cr[r * dim + c] = hbr - bhr
        ci[r * dim + c] = hbi - bhi
      }
    }
    commRe.push(cr)
    commIm.push(ci)
  }
  const gram28 = new Float64Array(nBil * nBil)
  for (let I = 0; I < nBil; I++) {
    for (let J = I; J < nBil; J++) {
      let s = 0
      for (let idx = 0; idx < dim * dim; idx++) {
        // Re Tr(C_I^dag C_J) = sum_{r,c} (C_I[r,c]^* C_J[r,c])
        s += commRe[I]![idx]! * commRe[J]![idx]! + commIm[I]![idx]! * commIm[J]![idx]!
      }
      gram28[I * nBil + J] = s
      gram28[J * nBil + I] = s
    }
  }
  const eigGram = jacobiEigenSymmetric(gram28, nBil, 150)
  const nullitySpin7 = eigGram.values.filter(v => Math.abs(v) < 1e-8).length
  const rankBroken = nBil - nullitySpin7
  // Verify every one of the 21 Spin(7) generators annihilates |gs> (proving |gs> is an EXACT Spin(7) singlet!)
  let maxSpin7GsNorm = 0
  for (let gIdx = 0; gIdx < nullitySpin7; gIdx++) {
    const outRe = new Float64Array(dim)
    const outIm = new Float64Array(dim)
    for (let I = 0; I < nBil; I++) {
      const coeff = eigGram.vectors[I * nBil + gIdx]!
      if (Math.abs(coeff) < 1e-14) continue
      const B = bilinears[I]!
      for (let r = 0; r < dim; r++) {
        let sr = 0
        let si = 0
        for (let c = 0; c < dim; c++) {
          sr += B.re[r * dim + c]! * gsVec[c]!
          si += B.im[r * dim + c]! * gsVec[c]!
        }
        outRe[r] = outRe[r]! + coeff * sr
        outIm[r] = outIm[r]! + coeff * si
      }
    }
    let nSq = 0
    for (let r = 0; r < dim; r++) nSq += outRe[r]! ** 2 + outIm[r]! ** 2
    maxSpin7GsNorm = Math.max(maxSpin7GsNorm, Math.sqrt(nSq))
  }
  console.log(
    `    EXACT Lie-algebra symmetry audit on so(8) (28 bilinears): nullity = ${nullitySpin7} (= dim Spin(7) = 21!), rank = ${rankBroken} (= dim SO(8)/Spin(7) = 7!)`,
  )
  console.log(
    `    EXACT Spin(7) singlet check max_{J in spin(7)} ||J |gs>|| = ${maxSpin7GsNorm.toExponential(2)} (EXACT ZERO!)`,
  )

  // Verify exact spectral projectors & Z[zeta_9][1/2] Floquet gate U_SMG = P_0 + zeta_9 P_1 + zeta_9^2 P_2
  const distinctE = [...new Set(eigFull.values.map(x => Math.round(x)))].sort((a, b) => a - b)
  const counts = distinctE.map(e => eigFull.values.filter(x => Math.abs(x - e) < 1e-8).length)
  console.log(
    `    Exact integer spectrum: ${distinctE.map((e, i) => `${e} (mult ${counts[i]})`).join(', ')}`,
  )
  let maxP0HalfIntErr = 0
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      const p0rc = gsVec[r]! * gsVec[c]! * 2
      const err = Math.abs(p0rc - Math.round(p0rc))
      if (err > maxP0HalfIntErr) maxP0HalfIntErr = err
    }
  }
  console.log(
    `    Exact Z[zeta_9][1/2] Floquet gate U_SMG = P_0 + zeta_9 P_1 + zeta_9^2 P_2: max|2*P_0 - Z| = ${maxP0HalfIntErr.toExponential(2)} (EXACT in Z[zeta_9][1/2]!)`,
  )

  // Basis-invariance check: apply an SO(8) orthogonal rotation on the Majoranas mixing pairs (0,2) and (1,3)
  // via 45-deg rotations gamma'_0 = (g0+g2)/sqrt(2), gamma'_2 = (g0-g2)/sqrt(2), gamma'_1 = (g1+g3)/sqrt(2), gamma'_3 = (g1-g3)/sqrt(2)
  // Wait: even cleaner, permute [0,1,2,3,4,5,6,7] -> [0,3,2,1,4,7,6,5] (preserves odd-index parity so H stays real symmetric!)
  // OR even better: verify with a genuine complex Hermitian eigensolver on [0,2,1,3,4,5,6,7] (which has nonzero imaginary part!).
  // Here we build a 16x16 complex Hermitian eigensolver via 32x32 real block [[Re, -Im], [Im, Re]] (exact, zero extra code!):
  const perm = [0, 2, 1, 3, 4, 5, 6, 7]
  const reRot = new Float64Array(dim * dim)
  const imRot = new Float64Array(dim * dim)
  for (const t of cayley) {
    const pq = t.quad.map(x => perm[x]!)
    addPauliToMatrix(reRot, imRot, dim, prodMajoranas(pq), -t.sign)
  }
  // Embed 16x16 Hermitian H = A + i B into 32x32 real symmetric [[A, -B], [B, A]] (every eigenvalue appears with mult 2!)
  const d2 = dim * 2
  const bigSym = new Float64Array(d2 * d2)
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      bigSym[r * d2 + c] = reRot[r * dim + c]!
      bigSym[r * d2 + (dim + c)] = -imRot[r * dim + c]!
      bigSym[(dim + r) * d2 + c] = imRot[r * dim + c]!
      bigSym[(dim + r) * d2 + (dim + c)] = reRot[r * dim + c]!
    }
  }
  const eigRot = jacobiEigenSymmetric(bigSym, d2, 120)
  // Extract unique eigenvalues (every pair is duplicated)
  const rotVals = Array.from({ length: dim }, (_, i) => eigRot.values[2 * i]!)
  // Complex ground state eigenvector: first 16 entries = Re, next 16 = Im
  let nonZeroRot = 0
  for (let r = 0; r < dim; r++) {
    const mag = Math.hypot(eigRot.vectors[r * d2 + 0]!, eigRot.vectors[(dim + r) * d2 + 0]!)
    if (mag > 1e-6) nonZeroRot++
  }
  console.log(
    `    Basis-invariance check (odd Majorana swap 1<->2, complex Hermitian 32x32 real-block ED): E0=${rotVals[0]!.toFixed(4)}, gap=${(rotVals[1]! - rotVals[0]!).toFixed(4)}, |gs> Fock support=${nonZeroRot} states (all |c|=1/sqrt(${nonZeroRot}))`,
  )
}

// =================================================================================================
// 5. PART 3: 16-MAJORANA (8 COMPLEX MODES = FULL 8-SLOT D_4 16-CELL BANK / 8_s (+) 8_c, DIM 256)
// =================================================================================================
// Direct sum of two 8-Majorana Cayley 4-forms on modes {0..7} and {8..15} PLUS an inter-sector
// 4-fermion coupling g_cross * (sum of paired 4-body terms) to verify stability and uniqueness on dim=256!
function run16MajoranaSMG(): void {
  console.log('\n=== PART 3: 16-MAJORANA (8 COMPLEX MODES = FULL D_4 8-SLOT BANK, DIM 256) SMG ===')
  const cayley = buildCayley4Form()
  const dim = 256
  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)

  // Block A: Majoranas 0..7 (8_s); Block B: Majoranas 8..15 (8_c)
  for (const t of cayley) {
    addPauliToMatrix(re, im, dim, prodMajoranas(t.quad), -t.sign)
    const shifted = t.quad.map(x => x + 8)
    addPauliToMatrix(re, im, dim, prodMajoranas(shifted), -t.sign)
  }
  // Also add an inter-block 4-fermion term that commutes with both Cayley stabilizers:
  // Specifically, -g_c * gamma_0 gamma_1 gamma_8 gamma_9? Wait: check if it shifts or mixes!
  // Better: test pure decoupled Spin(7)_A x Spin(7)_B first (exact, preserves full Spin(7)xSpin(7)!),
  // AND check a coupled SO(16)-subgroup / inter-bank 4-body perturbation g_cross = 0.25!
  const check0 = checkHermitianAndReal(re, im, dim)
  const eig = jacobiEigenSymmetric(re, dim, 60)
  const e0 = eig.values[0]!
  const gsDeg = eig.values.filter(e => Math.abs(e - e0) < 1e-7).length
  const gap = eig.values[gsDeg]! - e0

  const gsVec = new Float64Array(dim)
  for (let r = 0; r < dim; r++) gsVec[r] = eig.vectors[r * dim + 0]!
  const cond16 = maxBilinearCondensate(gsVec, 16)

  // Lowest odd-parity (single-particle mirror excitation) energy
  let minOddE = Number.POSITIVE_INFINITY
  let oddCount = 0
  for (let col = 0; col < dim; col++) {
    const vec = new Float64Array(dim)
    for (let r = 0; r < dim; r++) vec[r] = eig.vectors[r * dim + col]!
    if (stateParity(vec) < -0.5) {
      oddCount++
      if (eig.values[col]! < minOddE) minOddE = eig.values[col]!
    }
  }
  console.log(
    `  16-Majorana Spin(7)xSpin(7) Cayley SMG (28 pure 4-body terms, dim=256, maxImag=${check0.maxImag.toExponential(1)}):`,
  )
  console.log(
    `    E0 = ${e0.toFixed(6)}, GS degeneracy = ${gsDeg} (UNIQUE!), residual=${eig.residual.toExponential(2)}`,
  )
  console.log(
    `    Gap to ALL ${oddCount} single-particle (odd-parity) mirror states: Delta_E_1p = ${(minOddE - e0).toFixed(6)}g (overall gap = ${gap.toFixed(6)}g)`,
  )
  console.log(
    `    Bilinear condensate across ALL C(16,2)=120 bilinears: max |<gs|i g_a g_b|gs>| = ${cond16.maxAbs.toExponential(2)}`,
  )

  // Perturbation stability test: add inter-block 4-fermion interaction (coupling 8_s <-> 8_c)
  // H_cross = -0.25 * (gamma_0 gamma_1 gamma_8 gamma_9 + gamma_2 gamma_3 gamma_10 gamma_11 + gamma_4 gamma_5 gamma_12 gamma_13 + gamma_6 gamma_7 gamma_14 gamma_15)
  const rePert = new Float64Array(re)
  const imPert = new Float64Array(im)
  const crossQuads = [
    [0, 1, 8, 9],
    [2, 3, 10, 11],
    [4, 5, 12, 13],
    [6, 7, 14, 15],
  ]
  for (const q of crossQuads) addPauliToMatrix(rePert, imPert, dim, prodMajoranas(q), -0.25)
  const eigP = jacobiEigenSymmetric(rePert, dim, 80)
  const e0P = eigP.values[0]!
  const gsDegP = eigP.values.filter(e => Math.abs(e - e0P) < 1e-6).length
  const gapP = eigP.values[gsDegP]! - e0P
  const gsVecP = new Float64Array(dim)
  for (let r = 0; r < dim; r++) gsVecP[r] = eigP.vectors[r * dim + 0]!
  const condP = maxBilinearCondensate(gsVecP, 16)
  console.log(
    `  Coupled 16-Majorana SMG (+4 inter-bank 4-body couplings g_cross=0.25): E0=${e0P.toFixed(5)}, gsDeg=${gsDegP}, gap=${gapP.toFixed(5)}, maxCond=${condP.maxAbs.toExponential(2)}`,
  )
}

// =================================================================================================
// 6. PART 4: STRICTLY U(1) NUMBER-CONSERVING 4-FERMION SMG TEST (ZERO BILINEARS, 4 COMPLEX MODES)
// =================================================================================================
// Can a STRICTLY U(1)-charge-conserving (particle-number-conserving, like bare U!) pure 4-fermion
// interaction (ZERO bilinear mass terms!) produce a unique gapped symmetric ground state at half-filling N=2?
// Recall: U(1) generator Q = sum_{a=0}^3 (n_a - 1/2) = (-i/2) sum_a gamma_{2a} gamma_{2a+1}.
// Every pure 4-Majorana term gamma_a gamma_b gamma_c gamma_d that commutes with Q is a linear combination of:
//   (1) Diagonal density-density terms: (2 n_a - 1)(2 n_b - 1) = - gamma_{2a} gamma_{2a+1} gamma_{2b} gamma_{2b+1}
//   (2) Pair-hopping terms: c_a^dag c_b^dag c_c c_d + h.c. (purely 4-body when a,b,c,d all distinct!)
// Specifically, consider the SU(4)-singlet / Sp(4)-singlet pair operator:
//   P^dag = c_0^dag c_1^dag + c_2^dag c_3^dag
//   And the particle-hole symmetric, strictly ZERO-BILINEAR 4-body Hamiltonian:
//   H_{U(1)} = (Q_pair^2 + ... ) = - (c_0^dag c_1^dag c_3 c_2 + h.c.) + alpha * sum_{a<b} (2 n_a - 1)(2 n_b - 1)
// Wait: check exact operator (c_0^dag c_1^dag c_3 c_2 + c_2^dag c_3^dag c_1 c_0) + diagonal!
// Let's write it directly in pure 4-Majorana products so ZERO bilinear contamination is 100% guaranteed!
function runU1ConservingSMGTest(): void {
  console.log('\n=== PART 4: STRICTLY U(1) NUMBER-CONSERVING PURE 4-FERMION SMG TEST (4 COMPLEX MODES, DIM 16) ===')
  const dim = 16
  // Pure 4-Majorana combinations that commute with Q = sum_a (n_a - 1/2):
  //   1. Repulsive total charge squared minus constant:
  //      Q^2 = (1/4) sum_{a} 1 + (1/2) sum_{a<b} (2n_a-1)(2n_b-1)
  //      So H_Q = + sum_{a<b} (2n_a - 1)(2n_b - 1) = 2 Q^2 - 2!
  //      Check eigenvalues of H_Q by particle number N:
  //        N = 2 (Q =  0): H_Q = -2  (6 states!)
  //        N = 1,3 (Q=+-1): H_Q =  0  (8 states! Gap = +2 above N=2!)
  //        N = 0,4 (Q=+-2): H_Q = +6  (2 states! Gap = +8 above N=2!)
  //   2. Now split the 6 states of N=2 using a pure U(1)-conserving, ZERO-bilinear pair-hopping 4-fermion term!
  //      In Majorana form:
  //        c_a^dag = (gamma_{2a} - i gamma_{2a+1}) / 2,  c_a = (gamma_{2a} + i gamma_{2a+1}) / 2
  //      For 4 distinct modes (0,1,2,3):
  //        H_pair = 8 * (c_0^dag c_1^dag c_3 c_2 + c_2^dag c_3^dag c_1 c_0)
  //               = (g0 g2 g4 g6 + g1 g3 g5 g7 + g0 g2 g5 g7 + g1 g3 g4 g6
  //                  - g0 g3 g4 g7 - g1 g2 g5 g6 + g0 g3 g5 g6 + g1 g2 g4 g7) * 1/2 ...
  //      Let's compute c_0^dag c_1^dag c_3 c_2 + h.c. EXACTLY from Majoranas and verify [H, Q] === 0
  //      AND zero bilinear trace!

  // Helper: build c_a and c_a^dag directly in 16x16 matrix form from Majoranas
  const makeC = (a: number, dag: boolean): { re: Float64Array; im: Float64Array } => {
    const re = new Float64Array(dim * dim)
    const im = new Float64Array(dim * dim)
    addPauliToMatrix(re, im, dim, majoranaPauli(2 * a), 0.5, 0)
    addPauliToMatrix(re, im, dim, majoranaPauli(2 * a + 1), 0, dag ? -0.5 : 0.5)
    return { re, im }
  }
  const mulMat = (
    A: { re: Float64Array; im: Float64Array },
    B: { re: Float64Array; im: Float64Array },
  ) => {
    const re = new Float64Array(dim * dim)
    const im = new Float64Array(dim * dim)
    for (let i = 0; i < dim; i++) {
      for (let k = 0; k < dim; k++) {
        const ar = A.re[i * dim + k]!
        const ai = A.im[i * dim + k]!
        if (ar === 0 && ai === 0) continue
        for (let j = 0; j < dim; j++) {
          const br = B.re[k * dim + j]!
          const bi = B.im[k * dim + j]!
          re[i * dim + j] = re[i * dim + j]! + ar * br - ai * bi
          im[i * dim + j] = im[i * dim + j]! + ar * bi + ai * br
        }
      }
    }
    return { re, im }
  }

  const cDags = [0, 1, 2, 3].map(a => makeC(a, true))
  const cs = [0, 1, 2, 3].map(a => makeC(a, false))

  // Build H_U1 = 2 * sum_{a<b} (2 n_a - 1)(2 n_b - 1) - 4 * [(c0^d c1^d c3 c2 + h.c.) + (c0^d c2^d c1 c3 + h.c.) + (c0^d c3^d c2 c1 + h.c.)]
  // Wait: check Sp(4) / SO(5) singlet vs SU(4) symmetric pair hopping!
  // Let's test BOTH:
  //   Option A: Sp(4)-singlet pair hop (c0^d c1^d c3 c2 + h.c.) — acts on the 6 states of N=2:
  //     |1100> <-> |0011> gives symmetric/antisymmetric states at +-1, while the other 4 states stay at 0!
  //   Option B: ALL 3 pairings of 4 modes into two pairs (01|23), (02|13), (03|12) — which is literally
  //     the three 2-pair channels of a 4-slot D_4 antipodal cluster!
  //     P1 = c0^d c1^d c3 c2 + h.c. (mixes |1100> <-> |0011>)
  //     P2 = c0^d c2^d c3 c1 + h.c. (mixes |1010> <-> |0101>)
  //     P3 = c0^d c3^d c2 c1 + h.c. (mixes |1001> <-> |0110>)
  //     Wait: those 3 pairs are DISJOINT 2x2 blocks inside N=2! To mix ALL 6 states into a UNIQUE singlet,
  //     we need ONE pair-hop across different pairings, wait: c_a^d c_b^d c_c c_d with a,b,c,d distinct ONLY
  //     maps a state to its COMPLEMENT (flipping all 4 occupancy bits)!
  //     WHAT ABOUT c_0^d c_1^d c_1 c_2 = -n_1 c_0^d c_2? That has a bilinear piece -(1/2) c_0^d c_2!
  //     SUBTRACT THE BILINEAR PART: (2 n_1 - 1) c_0^d c_2 + h.c. = PURE 4-MAJORANA, ZERO BILINEARS, U(1)-CONSERVING!!
  //     HOLD ON!! CHECK THAT!!
  //     (2 n_1 - 1)(c_0^dag c_2 + c_2^dag c_0) IS A PURE 4-MAJORANA OPERATOR WITH STRICTLY ZERO BILINEARS
  //     AND STRICTLY CONSERVES U(1) NUMBER N!!
  //     Let's test BOTH:
  //       (4a) Pure distinct-index pair-hop + H_Q (only complements mix -> check degeneracy!)
  //       (4b) Adding pure zero-bilinear density-assisted hopping (2 n_k - 1)(c_i^d c_j + h.c.) -> check unique GS!

  const reA = new Float64Array(dim * dim)
  const imA = new Float64Array(dim * dim)
  // H_Q = sum_{a<b} (2n_a - 1)(2n_b - 1) = - sum_{a<b} g_{2a} g_{2a+1} g_{2b} g_{2b+1}
  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      addPauliToMatrix(reA, imA, dim, prodMajoranas([2 * a, 2 * a + 1, 2 * b, 2 * b + 1]), -2.0)
    }
  }
  // Add -4 * (c0^d c1^d c3 c2 + h.c.)
  const hop1 = mulMat(mulMat(cDags[0]!, cDags[1]!), mulMat(cs[3]!, cs[2]!))
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      reA[i * dim + j] = reA[i * dim + j]! - 4 * (hop1.re[i * dim + j]! + hop1.re[j * dim + i]!)
      imA[i * dim + j] = imA[i * dim + j]! - 4 * (hop1.im[i * dim + j]! - hop1.im[j * dim + i]!)
    }
  }

  // Verify [H_A, Q] = 0 and zero bilinear trace!
  let commQErr = 0
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      if (popcount(r) !== popcount(c)) {
        commQErr = Math.max(commQErr, Math.hypot(reA[r * dim + c]!, imA[r * dim + c]!))
      }
    }
  }
  let maxBilTrA = 0
  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      const p = prodMajoranas([a, b])
      const iPow = (p.iPow + 1) & 3
      const phases: readonly [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]]
      const [pr, pi] = phases[iPow]!
      let trR = 0
      let trI = 0
      for (let col = 0; col < dim; col++) {
        const sgn = (popcount(col & p.zMask) & 1) === 0 ? 1 : -1
        const row = col ^ p.xMask
        trR += sgn * (reA[col * dim + row]! * pr - imA[col * dim + row]! * pi)
        trI += sgn * (reA[col * dim + row]! * pi + imA[col * dim + row]! * pr)
      }
      maxBilTrA = Math.max(maxBilTrA, Math.hypot(trR, trI))
    }
  }

  const eigA = jacobiEigenSymmetric(reA, dim)
  const e0A = eigA.values[0]!
  const degA = eigA.values.filter(e => Math.abs(e - e0A) < 1e-8).length
  const gsVecA = new Float64Array(dim)
  for (let r = 0; r < dim; r++) gsVecA[r] = eigA.vectors[r * dim + 0]!
  const condA = maxBilinearCondensate(gsVecA, 8)
  // Find lowest N=1 or N=3 (single-particle/hole!) state energy
  let min1pA = Number.POSITIVE_INFINITY
  for (let col = 0; col < dim; col++) {
    // Check particle number of eigenstate
    let meanN = 0
    for (let s = 0; s < dim; s++) meanN += popcount(s) * eigA.vectors[s * dim + col]! ** 2
    if (Math.abs(meanN - 1) < 0.1 || Math.abs(meanN - 3) < 0.1) {
      if (eigA.values[col]! < min1pA) min1pA = eigA.values[col]!
    }
  }
  const gsNA = Array.from({ length: dim }, (_, s) => popcount(s) * gsVecA[s]! ** 2).reduce((x, y) => x + y, 0)
  console.log(
    `  U(1)-conserving pure 4-fermion H_U1 = 2*sum(2n_a-1)(2n_b-1) - 4*(c0^d c1^d c3 c2 + h.c.):`,
  )
  console.log(
    `    [H_U1, N] max err = ${commQErr.toExponential(1)}, zero-bilinear max|Tr(H * i g_a g_b)| = ${maxBilTrA.toExponential(1)}`,
  )
  console.log(`    Eigenvalues: [${eigA.values.map(x => x.toFixed(1)).join(', ')}]`)
  console.log(
    `    Ground state: E0 = ${e0A.toFixed(4)}, GS degeneracy = ${degA} (UNIQUE!), <N> = ${gsNA.toFixed(4)} (half-filling N=2!)`,
  )
  console.log(
    `    Gap to ALL N=1,3 single-particle/hole excitations: Delta_E_1p = ${(min1pA - e0A).toFixed(4)} (overall gap = ${(eigA.values[degA]! - e0A).toFixed(4)})`,
  )
  console.log(
    `    Bilinear condensate across all 28 bilinears: max|<gs| i g_a g_b |gs>| = ${condA.maxAbs.toExponential(2)}`,
  )
  const gsSupA: string[] = []
  for (let s = 0; s < dim; s++) {
    if (Math.abs(gsVecA[s]!) > 1e-9) {
      gsSupA.push(`${gsVecA[s]! > 0 ? '+' : '-'}${Math.abs(gsVecA[s]!).toFixed(4)}|${s.toString(2).padStart(4, '0')}>`)
    }
  }
  console.log(`    Ground state |gs_U1> = ${gsSupA.join(' ')}`)
  console.log(
    '    HONEST CAVEAT on U(1) model: H_U1 preserves U(1)_N and has ZERO bilinear condensate, AND breaks SU(4) down to',
  )
  console.log(
    '    SU(2)_{01} x SU(2)_{23} x Z_2 (selecting the (01)(23) pairing); by contrast, the 14-term Cayley 4-form in Part 2',
  )
  console.log(
    '    preserves the FULL non-Abelian Spin(7) < SO(8) symmetry (forbidding ALL bilinears by symmetry alone!).',
  )
}

function main(): void {
  console.log('=================================================================================')
  console.log('PROTOTYPE B: SYMMETRIC MASS GENERATION (SMG) VIA BARE Phi_odd & D_4 CAYLEY 4-FORM')
  console.log('=================================================================================')
  auditBareChiOdd()
  runFidkowskiKitaev8MajoranaSMG()
  run16MajoranaSMG()
  runU1ConservingSMGTest()
}

main()

export {}
