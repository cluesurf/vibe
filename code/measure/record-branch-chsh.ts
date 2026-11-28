// RULE-WORD POINTER RECORDS, PARTIAL-TRACE DECOHERENCE, REDUNDANCY, AND RECORD-BRANCH CHSH (E-QTM-0206).
// L1 abstract multi-qubit circuit using the working rule's exact two-mode Sigma(648) lift generators
// {C, D, P_w, P_w2, P_zeta9, P_zeta9^-1} (not a spatial {3,4,3,4} honeycomb walk).
// Under Key 8, branch weights are squared amplitudes over every counted record branch.
//
//   (1) Measurement settings (a, a', b, b') are synthesized deterministically from {C, D, P_w, P_w2, P_zeta9, P_zeta9^-1}
//       up to word length L = 14.
//   (2) Decoherence and Quantum Darwinism are computed directly on explicit (1 + 4)-qubit complex state vectors
//       (dim = 32, Float64Array of length 64 for [re, im]):
//         - Full-copy evolution: 4 exact unitary CNOT gates from S onto probes E_0..E_3.
//         - Partial-copy evolution: k = 0..4 exact controlled working-rule coin C gates from S onto probes E_0..E_{k-1},
//           where |<0|C|0>| = |(1 + w)/2| = 1/2 exact.
//         - Explicit partial traces partialTraceSystem(state32) -> rho_S (2x2) and partialTraceSubsystems(state32, keepBits)
//           -> rho_{F_j} (2x2) and rho_{S F_j} (4x4), diagonalized by exact 2x2 Hermitian closed-form eigenvalues and
//           a complex 4x4 Hermitian Jacobi eigensolver to obtain genuine von Neumann entropies S(rho_S), S(rho_{F_j}),
//           S(rho_{S F_j}), and mutual information I(S : F_j) = S(rho_S) + S(rho_{F_j}) - S(rho_{S F_j}).
//   (3) Record-branch CHSH is computed directly on explicit (2 + 8)-qubit complex state vectors (dim = 1024,
//       Float64Array of length 2048 for [re, im]): |Psi^->_AB (x) |0^4>_{E_A} (x) |0^4>_{E_B} evolved under U_A (x) U_B
//       followed by 4 CNOT gates from S_A -> E_A and 4 CNOT gates from S_B -> E_B, reading P(r_A, r_B) purely from
//       the 8 environment-record bits while verifying 100% probe consensus (0 disagreeing weight).
//   (4) Controls:
//         - Classical dephased common-cause density matrix 0.5 |01><01| + 0.5 |10><10| evolved through the same
//           10-qubit unitary record circuit at identical settings (CHSH <= 2.0).
//         - No-signaling marginal drift max |P(A | a, b) - P(A | a, b')| over all setting pairs.
//
// Zero random numbers, zero PRNGs, exact multi-qubit unitary arithmetic.

type U2 = readonly [number, number, number, number, number, number, number, number]

const SQ3 = Math.sqrt(3)
const SQ2 = Math.SQRT2
const INV_SQ2 = Math.SQRT1_2

const GATE_X: U2 = [0, 0, 1, 0, 1, 0, 0, 0]
const GATE_C: U2 = [0.25, SQ3 / 4, 0.75, -SQ3 / 4, 0.75, -SQ3 / 4, 0.25, SQ3 / 4]

function mulU2(a: U2, b: U2): U2 {
  return [
    a[0] * b[0] - a[1] * b[1] + a[2] * b[4] - a[3] * b[5],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[5] + a[3] * b[4],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[6] - a[3] * b[7],
    a[0] * b[3] + a[1] * b[2] + a[2] * b[7] + a[3] * b[6],
    a[4] * b[0] - a[5] * b[1] + a[6] * b[4] - a[7] * b[5],
    a[4] * b[1] + a[5] * b[0] + a[6] * b[5] + a[7] * b[4],
    a[4] * b[2] - a[5] * b[3] + a[6] * b[6] - a[7] * b[7],
    a[4] * b[3] + a[5] * b[2] + a[6] * b[7] + a[7] * b[6],
  ]
}

function unitarityErr(u: U2): number {
  const d00r = u[0] * u[0] + u[1] * u[1] + u[4] * u[4] + u[5] * u[5] - 1
  const d11r = u[2] * u[2] + u[3] * u[3] + u[6] * u[6] + u[7] * u[7] - 1
  const d01r = u[0] * u[2] + u[1] * u[3] + u[4] * u[6] + u[5] * u[7]
  const d01i = u[0] * u[3] - u[1] * u[2] + u[4] * u[7] - u[5] * u[6]
  return Math.max(Math.abs(d00r), Math.abs(d11r), Math.abs(d01r), Math.abs(d01i))
}

// Bloch measurement vector n(U) = U^dag sigma_z U (as [nx, ny, nz]) for reading Z in the rotated basis U
function blochZ(u: U2): readonly [number, number, number] {
  const nz = u[0] * u[0] + u[1] * u[1] - (u[4] * u[4] + u[5] * u[5])
  const z01r = u[0] * u[2] + u[1] * u[3] - (u[4] * u[6] + u[5] * u[7])
  const z01i = u[0] * u[3] - u[1] * u[2] - (u[4] * u[7] - u[5] * u[6])
  return [z01r, -z01i, nz]
}

function blochDist(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

// Synthesize the best rule-word U2 (length <= maxLen over Sigma(648) lift generators) matching target Bloch vector n
function synthesizeRuleSettings(
  targets: readonly (readonly [number, number, number])[],
  maxLen: number,
): {
  gates: U2[]
  maxErr: number
  maxDist: number
} {
  const C: U2 = GATE_C
  const D: U2 = [0.75, SQ3 / 4, 0.25, -SQ3 / 4, 0.25, -SQ3 / 4, 0.75, SQ3 / 4]
  const Pw: U2 = [1, 0, 0, 0, 0, 0, -0.5, SQ3 / 2]
  const Pw2: U2 = [1, 0, 0, 0, 0, 0, -0.5, -SQ3 / 2]
  const z9r = Math.cos((2 * Math.PI) / 9)
  const z9i = Math.sin((2 * Math.PI) / 9)
  const Pz9: U2 = [1, 0, 0, 0, 0, 0, z9r, z9i]
  const Pz9i: U2 = [1, 0, 0, 0, 0, 0, z9r, -z9i]
  const gens: readonly U2[] = [C, D, Pw, Pw2, Pz9, Pz9i]

  const I2: U2 = [1, 0, 0, 0, 0, 0, 1, 0]
  let frontier: U2[] = [I2]
  const bestGates: U2[] = targets.map(() => I2)
  const bestDists: number[] = targets.map(t => blochDist(blochZ(I2), t))
  let maxErr = Math.max(unitarityErr(GATE_X), unitarityErr(GATE_C))

  const keyOf = (n: readonly [number, number, number]): string =>
    `${Math.round(n[0] * 1e4)},${Math.round(n[1] * 1e4)},${Math.round(n[2] * 1e4)}`

  for (let len = 1; len <= maxLen; len++) {
    const seen = new Set<string>()
    const nextAll: { u: U2; n: readonly [number, number, number]; minD: number }[] = []

    for (const u of frontier) {
      for (const g of gens) {
        const v = mulU2(g, u)
        const err = unitarityErr(v)
        if (err > maxErr) maxErr = err
        const n = blochZ(v)
        let minD = Infinity
        for (let t = 0; t < targets.length; t++) {
          const d = blochDist(n, targets[t]!)
          if (d < bestDists[t]!) {
            bestDists[t] = d
            bestGates[t] = v
          }
          if (d < minD) minD = d
        }
        const k = keyOf(n)
        if (!seen.has(k)) {
          seen.add(k)
          nextAll.push({ u: v, n, minD })
        }
      }
    }

    if (nextAll.length <= 1200) {
      frontier = nextAll.map(x => x.u)
    } else {
      nextAll.sort((a, b) => a.minD - b.minD)
      const picked: U2[] = []
      const used = new Set<number>()
      for (let i = 0; i < Math.min(600, nextAll.length); i++) {
        picked.push(nextAll[i]!.u)
        used.add(i)
      }
      const bins = new Int32Array(120)
      for (let i = 0; i < nextAll.length && picked.length < 1200; i++) {
        if (used.has(i)) continue
        const n = nextAll[i]!.n
        const bz = Math.min(9, Math.max(0, Math.floor(((n[2] + 1) / 2) * 10)))
        const ba = Math.min(
          11,
          Math.max(0, Math.floor(((Math.atan2(n[1], n[0]) + Math.PI) / (2 * Math.PI)) * 12)),
        )
        const b = bz * 12 + ba
        if (bins[b]! < 5) {
          bins[b] = bins[b]! + 1
          picked.push(nextAll[i]!.u)
        }
      }
      frontier = picked
    }
  }

  return {
    gates: bestGates,
    maxErr,
    maxDist: Math.max(...bestDists),
  }
}

// ---- Explicit Multi-Qubit Complex State-Vector Primitives (interleaved [re, im]) ----

function stateNormSq(state: Float64Array): number {
  let s = 0
  for (let i = 0; i < state.length; i++) {
    const v = state[i]!
    s += v * v
  }
  return s
}

function apply1Q(state: Float64Array, nQubits: number, targetBit: number, u: U2): void {
  const dim = 1 << nQubits
  const bit = 1 << targetBit
  const step = bit << 1
  const r00 = u[0]
  const i00 = u[1]
  const r01 = u[2]
  const i01 = u[3]
  const r10 = u[4]
  const i10 = u[5]
  const r11 = u[6]
  const i11 = u[7]

  for (let base = 0; base < dim; base += step) {
    for (let off = 0; off < bit; off++) {
      const p0 = (base + off) << 1
      const p1 = (base + off + bit) << 1
      const a0r = state[p0]!
      const a0i = state[p0 + 1]!
      const a1r = state[p1]!
      const a1i = state[p1 + 1]!

      state[p0] = r00 * a0r - i00 * a0i + r01 * a1r - i01 * a1i
      state[p0 + 1] = r00 * a0i + i00 * a0r + r01 * a1i + i01 * a1r
      state[p1] = r10 * a0r - i10 * a0i + r11 * a1r - i11 * a1i
      state[p1 + 1] = r10 * a0i + i10 * a0r + r11 * a1i + i11 * a1r
    }
  }
}

function applyControlledU2(
  state: Float64Array,
  nQubits: number,
  ctrlBit: number,
  targetBit: number,
  u: U2,
): void {
  const dim = 1 << nQubits
  const cMask = 1 << ctrlBit
  const tMask = 1 << targetBit
  const r00 = u[0]
  const i00 = u[1]
  const r01 = u[2]
  const i01 = u[3]
  const r10 = u[4]
  const i10 = u[5]
  const r11 = u[6]
  const i11 = u[7]

  for (let idx = 0; idx < dim; idx++) {
    if ((idx & cMask) === 0 || (idx & tMask) !== 0) continue
    const p0 = idx << 1
    const p1 = (idx | tMask) << 1
    const a0r = state[p0]!
    const a0i = state[p0 + 1]!
    const a1r = state[p1]!
    const a1i = state[p1 + 1]!

    state[p0] = r00 * a0r - i00 * a0i + r01 * a1r - i01 * a1i
    state[p0 + 1] = r00 * a0i + i00 * a0r + r01 * a1i + i01 * a1r
    state[p1] = r10 * a0r - i10 * a0i + r11 * a1r - i11 * a1i
    state[p1 + 1] = r10 * a0i + i10 * a0r + r11 * a1i + i11 * a1r
  }
}

type HermitianDensity = {
  readonly dim: number
  readonly re: Float64Array
  readonly im: Float64Array
}

// Genuine multi-qubit partial trace: traces out every qubit NOT in keepBits from |psi><psi|
function partialTraceSubsystems(
  state: Float64Array,
  nQubits: number,
  keepBits: readonly number[],
): HermitianDensity {
  const m = keepBits.length
  const dKeep = 1 << m
  const keepSet = new Set<number>(keepBits)
  const traceBits: number[] = []
  for (let b = 0; b < nQubits; b++) {
    if (!keepSet.has(b)) traceBits.push(b)
  }
  const dTrace = 1 << traceBits.length

  const keepMasks = new Int32Array(dKeep)
  for (let r = 0; r < dKeep; r++) {
    let mask = 0
    for (let k = 0; k < m; k++) {
      if ((r >> k) & 1) mask |= 1 << keepBits[k]!
    }
    keepMasks[r] = mask
  }

  const traceMasks = new Int32Array(dTrace)
  for (let e = 0; e < dTrace; e++) {
    let mask = 0
    for (let k = 0; k < traceBits.length; k++) {
      if ((e >> k) & 1) mask |= 1 << traceBits[k]!
    }
    traceMasks[e] = mask
  }

  const re = new Float64Array(dKeep * dKeep)
  const im = new Float64Array(dKeep * dKeep)
  for (let r1 = 0; r1 < dKeep; r1++) {
    const km1 = keepMasks[r1]!
    for (let r2 = r1; r2 < dKeep; r2++) {
      const km2 = keepMasks[r2]!
      let sr = 0
      let si = 0
      for (let e = 0; e < dTrace; e++) {
        const tm = traceMasks[e]!
        const p1 = (km1 | tm) << 1
        const p2 = (km2 | tm) << 1
        const a1r = state[p1]!
        const a1i = state[p1 + 1]!
        const a2r = state[p2]!
        const a2i = state[p2 + 1]!
        sr += a1r * a2r + a1i * a2i
        si += a1i * a2r - a1r * a2i
      }
      re[r1 * dKeep + r2] = sr
      im[r1 * dKeep + r2] = si
      re[r2 * dKeep + r1] = sr
      im[r2 * dKeep + r1] = -si
    }
  }

  return { dim: dKeep, re, im }
}

function partialTraceSystem(state32: Float64Array): HermitianDensity {
  return partialTraceSubsystems(state32, 5, [0])
}

// Exact closed-form eigenvalues of a 2x2 Hermitian density matrix
function hermitianEigenvalues2x2(rho: HermitianDensity): readonly [number, number] {
  const a = rho.re[0]!
  const d = rho.re[3]!
  const br = rho.re[1]!
  const bi = rho.im[1]!
  const tr = a + d
  const disc = Math.hypot(a - d, 2 * Math.hypot(br, bi))
  return [0.5 * (tr + disc), 0.5 * (tr - disc)]
}

// Exact complex Hermitian Jacobi eigensolver via 2n x 2n real symmetric embedding [[Re, -Im], [Im, Re]]
function hermitianEigenvaluesJacobi(rho: HermitianDensity): number[] {
  const n = rho.dim
  if (n === 1) return [rho.re[0]!]
  if (n === 2) {
    const [e0, e1] = hermitianEigenvalues2x2(rho)
    return [e0, e1]
  }

  const m = 2 * n
  const z = new Float64Array(m * m)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const re = rho.re[i * n + j]!
      const im = rho.im[i * n + j]!
      z[i * m + j] = re
      z[(i + n) * m + (j + n)] = re
      z[i * m + (j + n)] = -im
      z[(i + n) * m + j] = im
    }
  }

  for (let sweep = 0; sweep < 80; sweep++) {
    let off = 0
    for (let p = 0; p < m; p++) {
      const pm = p * m
      for (let q = p + 1; q < m; q++) {
        const v = z[pm + q]!
        off += v * v
      }
    }
    if (off < 1e-30) break

    for (let p = 0; p < m; p++) {
      for (let q = p + 1; q < m; q++) {
        const apq = z[p * m + q]!
        if (Math.abs(apq) < 1e-18) continue
        const app = z[p * m + p]!
        const aqq = z[q * m + q]!
        const theta = (aqq - app) / (2 * apq)
        const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < m; k++) {
          if (k === p || k === q) continue
          const zkp = z[k * m + p]!
          const zkq = z[k * m + q]!
          const np = c * zkp - s * zkq
          const nq = s * zkp + c * zkq
          z[k * m + p] = np
          z[p * m + k] = np
          z[k * m + q] = nq
          z[q * m + k] = nq
        }
        z[p * m + p] = c * c * app - 2 * s * c * apq + s * s * aqq
        z[q * m + q] = s * s * app + 2 * s * c * apq + c * c * aqq
        z[p * m + q] = 0
        z[q * m + p] = 0
      }
    }
  }

  const all = new Array<number>(m)
  for (let i = 0; i < m; i++) all[i] = z[i * m + i]!
  all.sort((a, b) => b - a)
  const out = new Array<number>(n)
  for (let i = 0; i < n; i++) out[i] = all[2 * i]!
  return out
}

function vonNeumannBits(evals: readonly number[]): number {
  let s = 0
  for (let i = 0; i < evals.length; i++) {
    const p = evals[i]!
    if (p > 1e-15) s -= p * Math.log2(p)
  }
  return s
}

// ---- Explicit (2 + 8)-Qubit (dim = 1024) Record-Branch CHSH Evolution ----
// Qubit layout: bit 0 = S_A, bit 1 = S_B, bits 2..5 = E_{A,0..3}, bits 6..9 = E_{B,0..3}.

type RecordOutcomeDist = {
  readonly p00: number
  readonly p01: number
  readonly p10: number
  readonly p11: number
  readonly sumP: number
  readonly corr: number
  readonly margA0: number
  readonly margB0: number
  readonly envConsensusErr: number
  readonly stateNormErr: number
}

function make10QInitialState(kind: 'singlet' | '01' | '10'): Float64Array {
  const state = new Float64Array(2048) // dim = 1024, interleaved [re, im]
  if (kind === 'singlet') {
    // |01>_{AB} |0^8>_E has S_A = 0, S_B = 1 => idx = 2
    // |10>_{AB} |0^8>_E has S_A = 1, S_B = 0 => idx = 1
    state[2 << 1] = INV_SQ2
    state[1 << 1] = -INV_SQ2
  } else if (kind === '01') {
    state[2 << 1] = 1
  } else {
    state[1 << 1] = 1
  }
  return state
}

function evolvePure10QRecordBranch(initState: Float64Array, uA: U2, uB: U2): RecordOutcomeDist {
  const st = Float64Array.from(initState)
  // Apply local settings U_A on S_A (bit 0) and U_B on S_B (bit 1)
  apply1Q(st, 10, 0, uA)
  apply1Q(st, 10, 1, uB)
  // Unitary redundant copying: 4 CNOTs from S_A -> E_A (bits 2..5) and 4 CNOTs from S_B -> E_B (bits 6..9)
  for (let j = 0; j < 4; j++) {
    applyControlledU2(st, 10, 0, 2 + j, GATE_X)
    applyControlledU2(st, 10, 1, 6 + j, GATE_X)
  }

  const stateNormErr = Math.abs(stateNormSq(st) - 1)
  let p00 = 0
  let p01 = 0
  let p10 = 0
  let p11 = 0
  let envConsensusErr = 0

  // Read P(r_A, r_B) DIRECTLY from the 8 environment-record bits across all 1024 basis states
  for (let idx = 0; idx < 1024; idx++) {
    const p = idx << 1
    const prob = st[p]! * st[p]! + st[p + 1]! * st[p + 1]!
    if (prob === 0) continue

    const eA = (idx >> 2) & 0xf
    const eB = (idx >> 6) & 0xf
    const unanimousA = eA === 0 || eA === 0xf
    const unanimousB = eB === 0 || eB === 0xf
    if (!unanimousA || !unanimousB) {
      envConsensusErr += prob
      continue
    }
    const rA = eA === 0xf ? 1 : 0
    const rB = eB === 0xf ? 1 : 0
    // Also check exact match against system bits S_A, S_B
    const sA = idx & 1
    const sB = (idx >> 1) & 1
    if (sA !== rA || sB !== rB) {
      envConsensusErr += prob
    }
    if (rA === 0 && rB === 0) p00 += prob
    else if (rA === 0 && rB === 1) p01 += prob
    else if (rA === 1 && rB === 0) p10 += prob
    else p11 += prob
  }

  const sumP = p00 + p01 + p10 + p11
  return {
    p00,
    p01,
    p10,
    p11,
    sumP,
    corr: p00 - p01 - p10 + p11,
    margA0: p00 + p01,
    margB0: p00 + p10,
    envConsensusErr,
    stateNormErr,
  }
}

function recordBranchDistribution(
  initSinglet: Float64Array,
  init01: Float64Array,
  init10: Float64Array,
  uA: U2,
  uB: U2,
  dephased: boolean,
): RecordOutcomeDist {
  if (!dephased) {
    return evolvePure10QRecordBranch(initSinglet, uA, uB)
  }
  // Exact classical dephased density matrix 0.5 |01><01| + 0.5 |10><10| evolved through the identical
  // 10-qubit unitary record circuit (linearity of Tr(Pi_E U rho U^dag))
  const d01 = evolvePure10QRecordBranch(init01, uA, uB)
  const d10 = evolvePure10QRecordBranch(init10, uA, uB)
  const p00 = 0.5 * (d01.p00 + d10.p00)
  const p01 = 0.5 * (d01.p01 + d10.p01)
  const p10 = 0.5 * (d01.p10 + d10.p10)
  const p11 = 0.5 * (d01.p11 + d10.p11)
  return {
    p00,
    p01,
    p10,
    p11,
    sumP: p00 + p01 + p10 + p11,
    corr: p00 - p01 - p10 + p11,
    margA0: p00 + p01,
    margB0: p00 + p10,
    envConsensusErr: Math.max(d01.envConsensusErr, d10.envConsensusErr),
    stateNormErr: Math.max(d01.stateNormErr, d10.stateNormErr),
  }
}

export type RecordBranchChshResult = {
  readonly maxUnitarityErr: number
  readonly maxBranchSumErr: number
  readonly maxStateNormErr: number
  readonly maxEnvConsensusErr: number
  readonly maxSettingDist: number
  readonly fullCopyCoherenceAt4: number
  readonly partialCopyCoherenceCurve: readonly number[]
  readonly maxPartialCopyCurveErr: number
  readonly redundancyR001: number
  readonly fragmentMutualInfoBits: number
  readonly fragmentMutualInfos: readonly number[]
  readonly quantumRecordChsh: number
  readonly classicalControlChsh: number
  readonly maxNoSignalingDrift: number
}

export function runRecordBranchChsh(): RecordBranchChshResult {
  // Optimal CHSH Bloch axes in the x-z plane for singlet |Psi^->:
  //   a  = (0, 0, 1),              a' = (1, 0, 0)
  //   b  = (1/sqrt2, 0, 1/sqrt2),  b' = (-1/sqrt2, 0, 1/sqrt2)
  const targets: readonly (readonly [number, number, number])[] = [
    [0, 0, 1],
    [1, 0, 0],
    [INV_SQ2, 0, INV_SQ2],
    [-INV_SQ2, 0, INV_SQ2],
  ]
  const syn = synthesizeRuleSettings(targets, 14)
  const [uA0, uA1, uB0, uB1] = syn.gates as [U2, U2, U2, U2]

  let maxStateNormErr = 0

  // (1A) Explicit (1 + 4)-qubit full-copy CNOT probe evolution (dim = 32, Float64Array(64))
  const stateFull = new Float64Array(64)
  stateFull[0] = INV_SQ2 // |0>_S |0000>_E
  stateFull[2] = INV_SQ2 // |1>_S |0000>_E
  for (let j = 0; j < 4; j++) {
    applyControlledU2(stateFull, 5, 0, 1 + j, GATE_X)
  }
  maxStateNormErr = Math.max(maxStateNormErr, Math.abs(stateNormSq(stateFull) - 1))

  const rhoSFull = partialTraceSystem(stateFull)
  const fullCopyCoherenceAt4 = Math.hypot(rhoSFull.re[1]!, rhoSFull.im[1]!)
  const evalS = hermitianEigenvalues2x2(rhoSFull)
  const hS = vonNeumannBits(evalS)

  const fragmentMutualInfos: number[] = []
  let redundancyR001 = 0
  let minFragmentMutualInfo = Infinity
  for (let j = 0; j < 4; j++) {
    const rhoFj = partialTraceSubsystems(stateFull, 5, [1 + j])
    const rhoSFj = partialTraceSubsystems(stateFull, 5, [0, 1 + j])
    const hF = vonNeumannBits(hermitianEigenvalues2x2(rhoFj))
    const hSF = vonNeumannBits(hermitianEigenvaluesJacobi(rhoSFj))
    const mi = hS + hF - hSF
    fragmentMutualInfos.push(mi)
    if (mi < minFragmentMutualInfo) minFragmentMutualInfo = mi
    if (mi >= 0.99) redundancyR001++
  }

  // (1B) Explicit (1 + 4)-qubit partial-copy controlled-C evolution (k = 0..4 probes)
  const statePart = new Float64Array(64)
  statePart[0] = INV_SQ2
  statePart[2] = INV_SQ2
  const partialCopyCoherenceCurve: number[] = []
  let maxPartialCopyCurveErr = 0
  for (let k = 0; k <= 4; k++) {
    if (k > 0) {
      applyControlledU2(statePart, 5, 0, k, GATE_C)
    }
    maxStateNormErr = Math.max(maxStateNormErr, Math.abs(stateNormSq(statePart) - 1))
    const rhoSPart = partialTraceSystem(statePart)
    const normalizedCoherence = 2 * Math.hypot(rhoSPart.re[1]!, rhoSPart.im[1]!)
    partialCopyCoherenceCurve.push(normalizedCoherence)
    maxPartialCopyCurveErr = Math.max(
      maxPartialCopyCurveErr,
      Math.abs(normalizedCoherence - 0.5 ** k),
    )
  }

  // (2) Explicit (2 + 8)-qubit (dim = 1024) Record-Branch CHSH + Classical Dephased Control + No-Signaling
  const initSinglet = make10QInitialState('singlet')
  const init01 = make10QInitialState('01')
  const init10 = make10QInitialState('10')

  const q00 = recordBranchDistribution(initSinglet, init01, init10, uA0, uB0, false)
  const q01 = recordBranchDistribution(initSinglet, init01, init10, uA0, uB1, false)
  const q10 = recordBranchDistribution(initSinglet, init01, init10, uA1, uB0, false)
  const q11 = recordBranchDistribution(initSinglet, init01, init10, uA1, uB1, false)

  const c00 = recordBranchDistribution(initSinglet, init01, init10, uA0, uB0, true)
  const c01 = recordBranchDistribution(initSinglet, init01, init10, uA0, uB1, true)
  const c10 = recordBranchDistribution(initSinglet, init01, init10, uA1, uB0, true)
  const c11 = recordBranchDistribution(initSinglet, init01, init10, uA1, uB1, true)

  const allRuns = [q00, q01, q10, q11, c00, c01, c10, c11] as const
  const quantumRecordChsh = Math.abs(q00.corr + q01.corr + q10.corr - q11.corr)
  const classicalControlChsh = Math.abs(c00.corr + c01.corr + c10.corr - c11.corr)

  let maxBranchSumErr = 0
  let maxEnvConsensusErr = 0
  for (const r of allRuns) {
    maxBranchSumErr = Math.max(maxBranchSumErr, Math.abs(r.sumP - 1))
    maxEnvConsensusErr = Math.max(maxEnvConsensusErr, r.envConsensusErr)
    maxStateNormErr = Math.max(maxStateNormErr, r.stateNormErr)
  }

  const maxNoSignalingDrift = Math.max(
    Math.abs(q00.margA0 - q01.margA0),
    Math.abs(q10.margA0 - q11.margA0),
    Math.abs(q00.margB0 - q10.margB0),
    Math.abs(q01.margB0 - q11.margB0),
  )

  return {
    maxUnitarityErr: syn.maxErr,
    maxBranchSumErr,
    maxStateNormErr,
    maxEnvConsensusErr,
    maxSettingDist: syn.maxDist,
    fullCopyCoherenceAt4,
    partialCopyCoherenceCurve,
    maxPartialCopyCurveErr,
    redundancyR001,
    fragmentMutualInfoBits: minFragmentMutualInfo,
    fragmentMutualInfos,
    quantumRecordChsh,
    classicalControlChsh,
    maxNoSignalingDrift,
  }
}
