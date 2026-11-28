// Hardware Circuit Compilation, OpenQASM 3.0 Envelope Audit, Realistic Noise Threshold Sweep,
// and Finite-Shot Statistical Power Verification for the [[12, 1, 4]]_3 Qutrit Holographic Slice.
//
// Strictly deterministic (zero Math.random; Mulberry32 PRNG only), laptop-safe (< 5 s, < 200 MB RSS),
// strict TypeScript (--strict --noUncheckedIndexedAccess), fail-closed (exit 1 on any gate failure).
//
// Five Hardware-Readiness Gates:
//   H1: Exact [[12, 1, 4]]_3 code, binary-qubit encoding (zero noiseless |11> leakage), 23-gate
//       Clifford encoder parity, and exact 4-qubit compiled D^lambda / ZZ / ZX unitary parity.
//   H2: OpenQASM 3.0 structural grammar validation & IonQ Forte-1 (36q) / Quantinuum H2 (56q) /
//       Ba-137 native 12-ion hardware envelope audit across all 4 experiment circuits.
//   H3: Noiseless optimal Petz vs fixed-Clifford recovery separation parity across lam=0, bare-U
//       D^lambda (0.5 -> 0.8 -> 1.0), coherent ZZ(0.50) control, and coherent ZX(0.40) mimicry.
//   H4: Depolarizing (p_2q in {0, 1e-4, 5e-4, 1e-3, 3e-3, 1e-2}) + coherent ZX(0.40) drift sweep
//       and honest hardware break-even threshold audit for Ba-137, Quantinuum H2, and IonQ Forte-1.
//   H5: Deterministic finite-shot Monte Carlo statistical power sweep (N_shots = 1000, 4000, 16000)
//       with explicit heralded |11> leakage postselection accounting and 3-sigma shot budget.

import { resolve } from 'node:path'
import {
  applyTwoQutritGate,
  buildKeptLogicalPauliBasis,
  buildLogicalCodewords,
  buildSliceCodeSpec,
  CODEWORD_TERM_COUNT,
  compileCZ3QubitOps,
  compileDLambdaQubitOps,
  compileSUM3QubitOps,
  compileZXQubitOps,
  compileZZQubitOps,
  CROSS_CUT_PAIRS,
  decodeBitsToQutrit,
  encodeQutritToBits,
  evaluateNoisyChannel,
  exportOpenQasm3,
  HILBERT_DIM_12,
  isLeakageBits,
  LEAKAGE_QUBIT_BITS,
  makeBareUDLambda,
  makeCoherentZX,
  makeCoherentZZ,
  QUBIT_COUNT,
  QUTRIT_COUNT,
  runFiniteShotSweep,
  simulate4QubitOps,
  simulateNativeCliffordEncoder,
  validateOpenQasm3,
  verify4QubitCompilationParity,
  verifySliceCodeDistance,
  writeHardwareBundle,
  ZX_MIMICRY_PAIRS,
  type ComplexMatrix,
  type HardwareCircuitDescriptor,
  type HardwareNoiseConfig,
  type QutritValue,
  computeExactChannel,
} from '../../code/hardware/qutrit-slice-12-1-4'

interface GateRow {
  readonly id: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const GATES: GateRow[] = []

function recordGate(id: string, name: string, passed: boolean, detail: string): void {
  GATES.push({ id, name, passed, detail })
}

const tStart = performance.now()

console.log('================================================================================')
console.log('HARDWARE QASM 3.0 & NOISE SWEEP VERIFICATION SUITE: [[12, 1, 4]]_3 QUTRIT SLICE')
console.log('================================================================================')

// ============================================================================
// GATE H1: CODE & BINARY-ENCODING EXACTNESS
// ============================================================================
console.log('\n[GATE H1] Code Exactness, Binary-Qubit Encoding & 4-Qubit Compiled Unitary Parity:')

const spec = buildSliceCodeSpec()
const distCert = verifySliceCodeDistance(spec)
const codewords = buildLogicalCodewords(spec)
const logicalBasis = buildKeptLogicalPauliBasis(spec, codewords)

// Verify exact 23-gate Clifford encoder reproduces |0_L>, |1_L>, |2_L> to machine precision
let maxEncoderErr = 0
for (const c of [0, 1, 2] as readonly QutritValue[]) {
  const enc = simulateNativeCliffordEncoder(c)
  let diffSq = 0
  for (let i = 0; i < HILBERT_DIM_12; i++) {
    const dr = enc.re[i]! - codewords.re[c]![i]!
    const di = enc.im[i]! - codewords.im[c]![i]!
    diffSq += dr * dr + di * di
  }
  const err = Math.sqrt(diffSq)
  if (err > maxEncoderErr) maxEncoderErr = err
}

// Verify binary-qubit encoding map bijection & leakage flagging
const encodingRoundtripOk =
  ([0, 1, 2] as readonly QutritValue[]).every(t => {
    const [b0, b1] = encodeQutritToBits(t)
    return !isLeakageBits(b0, b1) && decodeBitsToQutrit(b0, b1) === t
  }) &&
  isLeakageBits(LEAKAGE_QUBIT_BITS[0], LEAKAGE_QUBIT_BITS[1]) &&
  decodeBitsToQutrit(LEAKAGE_QUBIT_BITS[0], LEAKAGE_QUBIT_BITS[1]) === 'leakage'

// Verify 4-qubit binary compilation parity for D^lambda (0.5, 0.8, 1.0), ZZ(0.50), ZX(0.40), CZ_3^2, SUM_3
let maxDLambdaFrobErr = 0
let maxDLambdaLeakErr = 0
for (const lam of [0.5, 0.8, 1.0]) {
  const compiled = simulate4QubitOps(compileDLambdaQubitOps(0, 1, 2, 3, lam))
  const exact = makeBareUDLambda(lam)
  const rep = verify4QubitCompilationParity(compiled, exact, true)
  maxDLambdaFrobErr = Math.max(maxDLambdaFrobErr, rep.validBlockFrobeniusError)
  maxDLambdaLeakErr = Math.max(
    maxDLambdaLeakErr,
    rep.leakageCouplingError,
    rep.leakageBlockIdentityError,
  )
}

const zzParity = verify4QubitCompilationParity(
  simulate4QubitOps(compileZZQubitOps(0, 1, 2, 3, 0.5)),
  makeCoherentZZ(0.5),
  false,
)
const zxParity = verify4QubitCompilationParity(
  simulate4QubitOps(compileZXQubitOps(0, 1, 2, 3, 0.4)),
  makeCoherentZX(0.4),
  false,
)

// Also verify exact 4-qubit SUM_3 and CZ_3^2 parity on all 9 valid states + zero leakage coupling
const exactSUM3: ComplexMatrix = (() => {
  const re = new Float64Array(81)
  const im = new Float64Array(81)
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const col = 3 * a + b
      const row = 3 * a + ((b + a) % 3)
      re[row * 9 + col] = 1
    }
  }
  return { n: 9, re, im }
})()
const sum3Parity = verify4QubitCompilationParity(
  simulate4QubitOps(compileSUM3QubitOps(0, 1, 2, 3, 1)),
  exactSUM3,
  false,
)
const exactCZ3Sq: ComplexMatrix = (() => {
  const re = new Float64Array(81)
  const im = new Float64Array(81)
  const wRe = [1, -0.5, -0.5]
  const wIm = [0, Math.sqrt(3) / 2, -Math.sqrt(3) / 2]
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const k = 3 * a + b
      const p = (2 * a * b) % 3
      re[k * 9 + k] = wRe[p]!
      im[k * 9 + k] = wIm[p]!
    }
  }
  return { n: 9, re, im }
})()
const cz3Parity = verify4QubitCompilationParity(
  simulate4QubitOps(compileCZ3QubitOps(0, 1, 2, 3, 2)),
  exactCZ3Sq,
  false,
)

const maxNormErr = Math.max(...codewords.normErrors)
const maxLeakageCoupling = Math.max(
  maxDLambdaLeakErr,
  zzParity.leakageCouplingError,
  zxParity.leakageCouplingError,
  sum3Parity.leakageCouplingError,
  cz3Parity.leakageCouplingError,
)
const maxCompiledParityErr = Math.max(
  maxDLambdaFrobErr,
  zzParity.validBlockFrobeniusError,
  zxParity.validBlockFrobeniusError,
  sum3Parity.validBlockFrobeniusError,
  cz3Parity.validBlockFrobeniusError,
)

console.log(
  `  Stabilizers: ${spec.nStabilizers}x24 GF(3), rk=${spec.rank}, isoDef=${spec.isoDefects}, logDef=${spec.logicalCommuteDefects}, <X_L,Z_L>=${spec.xLzLCommutator}`,
)
console.log(
  `  Distance cert: wt-3 erasures=${distCert.weight3Correctable}/${distCert.weight3Total}, wt-4=${distCert.weight4Correctable}/${distCert.weight4Total} => exact d=${distCert.exactDistance}`,
)
console.log(
  `  Codewords: terms=[${codewords.termCounts.join(',')}], maxNormErr=${maxNormErr.toExponential(2)}, 23-gate encoder L2 err=${maxEncoderErr.toExponential(2)}`,
)
console.log(
  `  4-qubit compilation parity: D^lam FrobErr=${maxDLambdaFrobErr.toExponential(2)}, ZZ=${zzParity.validBlockFrobeniusError.toExponential(2)}, ZX=${zxParity.validBlockFrobeniusError.toExponential(2)}, SUM3=${sum3Parity.validBlockFrobeniusError.toExponential(2)}, CZ3^2=${cz3Parity.validBlockFrobeniusError.toExponential(2)}, noiseless |11> leakage=${maxLeakageCoupling.toExponential(2)}`,
)

const h1Pass =
  spec.nStabilizers === 11 &&
  spec.rank === 11 &&
  spec.isoDefects === 0 &&
  spec.logicalCommuteDefects === 0 &&
  spec.xLzLCommutator === 1 &&
  distCert.exactDistance === 4 &&
  distCert.weight3Correctable === 220 &&
  distCert.weight3Total === 220 &&
  codewords.termCounts.every(n => n === CODEWORD_TERM_COUNT) &&
  maxNormErr < 1e-14 &&
  maxEncoderErr < 1e-14 &&
  encodingRoundtripOk &&
  maxCompiledParityErr < 1e-12 &&
  maxLeakageCoupling < 1e-12

recordGate(
  'H1',
  'Code, binary encoding, 23-gate encoder & 4-qubit D^lambda compilation parity',
  h1Pass,
  `11 stabs (isoDef=0), d=4 (220/220 wt-3), 2,187 terms (err=${maxNormErr.toExponential(1)}), max ||U_comp-U_exact||_F=${maxCompiledParityErr.toExponential(1)}, |11> leak=${maxLeakageCoupling.toExponential(1)}`,
)

// ============================================================================
// GATE H2: OPENQASM 3.0 STRUCTURAL & HARDWARE-ENVELOPE AUDIT
// ============================================================================
console.log('\n[GATE H2] OpenQASM 3.0 Structural Grammar & Hardware-Envelope Audit:')

const circuits: readonly HardwareCircuitDescriptor[] = [
  exportOpenQasm3('stabilizer_baseline', { theta: Math.PI / 4, param: 0 }),
  exportOpenQasm3('bare_u_magic', { theta: Math.PI / 4, param: 1.0 }),
  exportOpenQasm3('coherent_zz_control', { theta: Math.PI / 4, param: 0.5 }),
  exportOpenQasm3('coherent_zx_mimicry', { theta: Math.PI / 4, param: 0.4 }),
]

// Also verify lam=0.5 and lam=0.8 emit cleanly
const magicLam05 = exportOpenQasm3('bare_u_magic', { theta: Math.PI / 4, param: 0.5 })
const magicLam08 = exportOpenQasm3('bare_u_magic', { theta: Math.PI / 4, param: 0.8 })

let allQasmValid = true
for (const desc of [...circuits, magicLam05, magicLam08]) {
  const v = validateOpenQasm3(desc.qasm3, QUBIT_COUNT)
  if (!v.valid || desc.qubitCount !== 24 || desc.qutritCount !== 12) allQasmValid = false
  if (circuits.includes(desc)) {
    console.log(
      `  ${desc.kind.padEnd(20)} | 24q: 1q=${String(desc.oneQubitGates).padStart(4)}, 2q=${String(desc.twoQubitGates).padStart(3)} (intra=${desc.intraQutritTwoQubitGates}, inter=${desc.interQutritTwoQubitGates}), depth=${String(desc.circuitDepth).padStart(3)}, qasmLines=${String(v.lineCount).padStart(4)} | Ba-137: 1q=${desc.nativeQutritOneGates}, 2q=${desc.nativeQutritTwoGates}, depth=${desc.nativeQutritDepth} | valid=${v.valid}`,
    )
  }
}

const baselineDesc = circuits[0]!
const magicDesc = circuits[1]!
const zzDesc = circuits[2]!
const zxDesc = circuits[3]!

// Cross-cut perturbation-only 2-qubit gate counts for bare_u_magic
const magicPerturbIntra2q = magicDesc.intraQutritTwoQubitGates - baselineDesc.intraQutritTwoQubitGates
const magicPerturbInter2q = magicDesc.interQutritTwoQubitGates - baselineDesc.interQutritTwoQubitGates
const magicPerturbTotal2q = magicDesc.twoQubitGates - baselineDesc.twoQubitGates
console.log(
  `  Hardware envelope: qubitCount=${magicDesc.qubitCount} <= IonQ Forte-1 (36q) & Quantinuum H2 (56q); 6x D^1.0 layer alone = ${magicPerturbTotal2q} 2q gates (intra=${magicPerturbIntra2q}, inter=${magicPerturbInter2q}); Ba-137 native total = ${magicDesc.nativeQutritTwoGates} 2-qutrit MS gates (depth ${magicDesc.nativeQutritDepth})`,
)

const h2Pass =
  allQasmValid &&
  circuits.length === 4 &&
  circuits.every(
    c =>
      c.qubitCount === 24 &&
      c.qubitCount <= 36 &&
      c.qubitCount <= 56 &&
      c.qutritCount === 12 &&
      c.targetBackends.length === 3 &&
      c.twoQubitGates > 0 &&
      c.nativeQutritTwoGates >= 23,
  ) &&
  magicPerturbTotal2q === 228 &&
  magicDesc.nativeQutritTwoGates === 29

recordGate(
  'H2',
  'OpenQASM 3.0 structural grammar & hardware-envelope audit (all 4 circuits)',
  h2Pass,
  `4/4 valid QASM 3.0 (24q<=36q Forte-1, <=56q H2); baseline=${baselineDesc.twoQubitGates} 2q, bare_u=${magicDesc.twoQubitGates} 2q (+228 for 6x D^1.0), ZZ=${zzDesc.twoQubitGates} 2q, ZX=${zxDesc.twoQubitGates} 2q; Ba-137=${magicDesc.nativeQutritTwoGates} 2-qutrit MS gates`,
)

// ============================================================================
// GATE H3: NOISELESS PETZ VS FIXED-CLIFFORD SEPARATION PARITY
// ============================================================================
console.log('\n[GATE H3] Noiseless Optimal Petz vs Fixed-Clifford Separation Parity (81x81 Gram):')

const chBaseline = computeExactChannel('stabilizer_baseline (lam=0)', codewords, logicalBasis, () => {})

const chMagic05 = computeExactChannel('bare_u_magic (D^0.5)', codewords, logicalBasis, (r, i) => {
  const u = makeBareUDLambda(0.5)
  for (const [a, b] of CROSS_CUT_PAIRS) applyTwoQutritGate(r, i, a, b, u)
})
const chMagic08 = computeExactChannel('bare_u_magic (D^0.8)', codewords, logicalBasis, (r, i) => {
  const u = makeBareUDLambda(0.8)
  for (const [a, b] of CROSS_CUT_PAIRS) applyTwoQutritGate(r, i, a, b, u)
})
const chMagic10 = computeExactChannel('bare_u_magic (D^1.0)', codewords, logicalBasis, (r, i) => {
  const u = makeBareUDLambda(1.0)
  for (const [a, b] of CROSS_CUT_PAIRS) applyTwoQutritGate(r, i, a, b, u)
})
const chZZ050 = computeExactChannel('coherent_zz_control (ZZ 0.50)', codewords, logicalBasis, (r, i) => {
  const u = makeCoherentZZ(0.5)
  for (const [a, b] of CROSS_CUT_PAIRS) applyTwoQutritGate(r, i, a, b, u)
})
const chZX040 = computeExactChannel('coherent_zx_mimicry (ZX 0.40)', codewords, logicalBasis, (r, i) => {
  const u = makeCoherentZX(0.4)
  for (const [a, b] of ZX_MIMICRY_PAIRS) applyTwoQutritGate(r, i, a, b, u)
})
const chMagic10PlusZX = computeExactChannel(
  'bare_u_magic (D^1.0) + ZX(0.40)',
  codewords,
  logicalBasis,
  (r, i) => {
    const uD = makeBareUDLambda(1.0)
    const uZX = makeCoherentZX(0.4)
    for (const [a, b] of CROSS_CUT_PAIRS) applyTwoQutritGate(r, i, a, b, uD)
    for (const [a, b] of ZX_MIMICRY_PAIRS) applyTwoQutritGate(r, i, a, b, uZX)
  },
)

for (const ch of [chBaseline, chMagic05, chMagic08, chMagic10, chZZ050, chZX040, chMagic10PlusZX]) {
  console.log(
    `  ${ch.label.padEnd(32)} | Gram rk=${ch.gramRank}, tr=${ch.gramTrace.toFixed(6)} | Petz: S0=${ch.petzS0.toFixed(6)}, S4=${ch.petzSPi4.toFixed(6)}, dS=${ch.petzDeltaS.toFixed(6)} | Clif: dS=${ch.clifDeltaS.toFixed(6)}`,
  )
}

const zxPetzInvarianceErr = Math.abs(chMagic10PlusZX.petzDeltaS - chMagic10.petzDeltaS)
const h3Pass =
  Math.abs(chBaseline.petzDeltaS) < 1e-13 &&
  Math.abs(chBaseline.clifDeltaS) < 1e-13 &&
  chMagic05.petzDeltaS > 0 &&
  chMagic08.petzDeltaS > chMagic05.petzDeltaS &&
  chMagic10.petzDeltaS > chMagic08.petzDeltaS &&
  chMagic10.petzDeltaS > 0.01 &&
  Math.abs(chZZ050.petzDeltaS) < 1e-13 &&
  chZZ050.clifDeltaS > 0.35 &&
  Math.abs(chZX040.petzDeltaS) < 1e-13 &&
  chZX040.clifDeltaS > 0.35 &&
  zxPetzInvarianceErr < 1e-12

recordGate(
  'H3',
  'Noiseless Petz vs fixed-Clifford separation parity (lam=0, D^lam, ZZ, ZX)',
  h3Pass,
  `lam=0: ${Math.abs(chBaseline.petzDeltaS).toExponential(1)}; D^lam Petz: ${chMagic05.petzDeltaS.toFixed(5)}->${chMagic08.petzDeltaS.toFixed(5)}->${chMagic10.petzDeltaS.toFixed(5)} (>0.01); ZX(0.40): Clif=${chZX040.clifDeltaS.toFixed(4)} (>0.35) -> Petz=${Math.abs(chZX040.petzDeltaS).toExponential(1)} (<1e-13)`,
)

// ============================================================================
// GATE H4: DEPOLARIZING + COHERENT ZX HARDWARE NOISE THRESHOLD SWEEP
// ============================================================================
console.log('\n[GATE H4] Depolarizing (p_2q) + Coherent ZX(0.40) Hardware Noise Threshold Sweep:')

const P2Q_GRID: readonly number[] = [0, 1e-4, 5e-4, 1e-3, 3e-3, 1e-2]

function makeNoiseCfg(
  p2q: number,
  architecture: HardwareNoiseConfig['architecture'],
): HardwareNoiseConfig {
  if (architecture === 'native_ba137') {
    return {
      p2q,
      architecture,
      nativeTwoQutritGates: magicDesc.nativeQutritTwoGates, // 29
      binaryIntraTwoQubitGates: 0,
      binaryInterTwoQubitGates: 0,
    }
  }
  if (architecture === 'binary_24q_perturbation') {
    return {
      p2q,
      architecture,
      nativeTwoQutritGates: 6,
      binaryIntraTwoQubitGates: magicPerturbIntra2q,
      binaryInterTwoQubitGates: magicPerturbInter2q,
    }
  }
  return {
    p2q,
    architecture,
    nativeTwoQutritGates: magicDesc.nativeQutritTwoGates,
    binaryIntraTwoQubitGates: magicDesc.intraQutritTwoQubitGates,
    binaryInterTwoQubitGates: magicDesc.interQutritTwoQubitGates,
  }
}

// Evaluate threshold p_2q* where Petz margin Delta S_PA(D^1.0, p_2q) - Delta S_PA(ZX, p_2q)
// remains above 20% of the noiseless bare-U signal (0.20 * 0.010181 = 0.002036 nats).
const MARGIN_THRESHOLD = 0.2 * chMagic10.petzDeltaS

function findBreakEvenP2q(architecture: HardwareNoiseConfig['architecture']): number {
  let lo = 0
  let hi = 0.1
  for (let iter = 0; iter < 50; iter++) {
    const mid = 0.5 * (lo + hi)
    const pt = evaluateNoisyChannel(chMagic10, makeNoiseCfg(mid, architecture))
    const ptZx = evaluateNoisyChannel(chZX040, makeNoiseCfg(mid, architecture))
    if (pt.petzDeltaS - ptZx.petzDeltaS >= MARGIN_THRESHOLD) lo = mid
    else hi = mid
  }
  return 0.5 * (lo + hi)
}

const breakEvenBa137 = findBreakEvenP2q('native_ba137')
const breakEven24qPerturb = findBreakEvenP2q('binary_24q_perturbation')
const breakEven24qFull = findBreakEvenP2q('binary_24q_full')

console.log('  --- Architecture A: Ba-137 Native 12-Ion Qutrit (29 native 2-qutrit MS gates) ---')
console.log(
  '  p_2q    | eta_dep | Petz dS(D^1) | Petz dS(D^1+ZX) | Petz dS(ZX) | Petz Margin | Clif Margin(D^1-ZX)',
)
let ba137MonotonicOk = true
let prevBa137Margin = Number.POSITIVE_INFINITY
let ba137At1e3Margin = 0
let ba137At3e3Margin = 0
let ba137At1e2Margin = 0
let clifMarginAlwaysNegative = true

for (const p2q of P2Q_GRID) {
  const cfg = makeNoiseCfg(p2q, 'native_ba137')
  const ptD1 = evaluateNoisyChannel(chMagic10, cfg)
  const ptD1Zx = evaluateNoisyChannel(chMagic10PlusZX, cfg)
  const ptZx = evaluateNoisyChannel(chZX040, cfg)
  const petzMargin = ptD1.petzDeltaS - ptZx.petzDeltaS
  const petzMarginWithZx = ptD1Zx.petzDeltaS - ptZx.petzDeltaS
  const clifMargin = ptD1.clifDeltaS - ptZx.clifDeltaS

  if (petzMargin > prevBa137Margin + 1e-12) ba137MonotonicOk = false
  if (Math.abs(petzMargin - petzMarginWithZx) > 1e-12) ba137MonotonicOk = false
  if (clifMargin >= 0) clifMarginAlwaysNegative = false
  prevBa137Margin = petzMargin

  if (p2q === 1e-3) ba137At1e3Margin = petzMargin
  if (p2q === 3e-3) ba137At3e3Margin = petzMargin
  if (p2q === 1e-2) ba137At1e2Margin = petzMargin

  console.log(
    `  ${p2q.toExponential(0).padEnd(7)} | ${ptD1.petzEffectiveDepolarizing.toFixed(5)} | ${ptD1.petzDeltaS.toFixed(6).padStart(12)} | ${ptD1Zx.petzDeltaS.toFixed(6).padStart(15)} | ${ptZx.petzDeltaS.toFixed(6).padStart(11)} | ${petzMargin.toFixed(6).padStart(11)} | ${clifMargin.toFixed(6).padStart(19)}`,
  )
}

console.log(
  '\n  --- Architecture B: 24-Qubit Binary-Encoded Full Circuit (746 2q gates) vs 6x D^1.0 Layer (228 2q) ---',
)
console.log(
  '  p_2q    | Full24q f_keep | Full24q dS(D^1) | Perturb228 f_keep | Perturb228 dS(D^1)',
)
let full24qAt1e2Margin = 0
let full24qAt1e3Margin = 0
let full24qAt3e3Margin = 0
let perturb228At1e3Margin = 0
for (const p2q of P2Q_GRID) {
  const ptFull = evaluateNoisyChannel(chMagic10, makeNoiseCfg(p2q, 'binary_24q_full'))
  const ptPert = evaluateNoisyChannel(chMagic10, makeNoiseCfg(p2q, 'binary_24q_perturbation'))
  if (p2q === 1e-3) {
    full24qAt1e3Margin = ptFull.petzDeltaS
    perturb228At1e3Margin = ptPert.petzDeltaS
  }
  if (p2q === 3e-3) full24qAt3e3Margin = ptFull.petzDeltaS
  if (p2q === 1e-2) full24qAt1e2Margin = ptFull.petzDeltaS
  console.log(
    `  ${p2q.toExponential(0).padEnd(7)} | ${ptFull.leakagePostselectRetention.toFixed(6).padStart(14)} | ${ptFull.petzDeltaS.toFixed(6).padStart(15)} | ${ptPert.leakagePostselectRetention.toFixed(6).padStart(17)} | ${ptPert.petzDeltaS.toFixed(6).padStart(18)}`,
  )
}

console.log(
  `  Exact 20%-signal break-even p_2q* (margin >= ${MARGIN_THRESHOLD.toFixed(5)}): Ba-137 native=${breakEvenBa137.toExponential(3)}, 24q 6xD-layer=${breakEven24qPerturb.toExponential(3)}, 24q full=${breakEven24qFull.toExponential(3)}`,
)
console.log(
  `  Honest hardware placement: Quantinuum H2 (p_2q ~ 1e-3) CLEARS Ba-137 & 24q-6xD thresholds (dS=${ba137At1e3Margin.toFixed(5)} / ${perturb228At1e3Margin.toFixed(5)}), sits BELOW full-746-CNOT binary break-even (dS=${full24qAt1e3Margin.toFixed(5)}); IonQ Forte-1 (p_2q ~ 3e-3) CLEARS Ba-137 native (dS=${ba137At3e3Margin.toFixed(5)}) but is WASHED OUT on unverified 746-CNOT 24q binary (dS=${full24qAt3e3Margin.toFixed(6)}); p_2q=1e-2 washes out BOTH full-24q (${full24qAt1e2Margin.toExponential(2)}) and Ba-137 (${ba137At1e2Margin.toFixed(5)} < ${MARGIN_THRESHOLD.toFixed(5)}).`,
)

const h4Pass =
  ba137MonotonicOk &&
  clifMarginAlwaysNegative &&
  ba137At1e3Margin > MARGIN_THRESHOLD &&
  ba137At3e3Margin > MARGIN_THRESHOLD &&
  ba137At1e2Margin < MARGIN_THRESHOLD &&
  full24qAt1e2Margin < 1e-4 &&
  breakEvenBa137 > 3e-3 &&
  breakEvenBa137 < 1e-2 &&
  breakEven24qPerturb > 1e-3 &&
  breakEven24qFull < 1e-3

recordGate(
  'H4',
  'Depolarizing + coherent ZX hardware noise threshold sweep (honest H2 / Forte-1 / Ba-137 placement)',
  h4Pass,
  `p_2q*(20% sig): Ba-137=${breakEvenBa137.toExponential(2)} (>H2 1e-3 & Forte 3e-3, <1e-2 washout), 24q-6xD=${breakEven24qPerturb.toExponential(2)}, 24q-full=${breakEven24qFull.toExponential(2)}; Clif margin strictly negative (<0) across all p_2q`,
)

// ============================================================================
// GATE H5: FINITE-SHOT STATISTICAL POWER SWEEP (N_shots = 1000, 4000, 16000)
// ============================================================================
console.log('\n[GATE H5] Deterministic Finite-Shot Statistical Power Sweep & |11> Leakage Accounting:')

const SHOT_BUDGETS: readonly number[] = [1000, 4000, 16000]

// 5A. Noiseless / fault-tolerant reference (p_2q = 0)
const ptSigIdeal = evaluateNoisyChannel(chMagic10, makeNoiseCfg(0, 'native_ba137'))
const ptNullIdeal = evaluateNoisyChannel(chBaseline, makeNoiseCfg(0, 'native_ba137'))
const ptZxIdeal = evaluateNoisyChannel(chZX040, makeNoiseCfg(0, 'native_ba137'))
const sweepIdeal = runFiniteShotSweep(ptSigIdeal, ptNullIdeal, ptZxIdeal, SHOT_BUDGETS, 400, 0x1214a001)

console.log('  --- Regime 1: Ideal / Error-Corrected Target (p_2q = 0, f_keep = 1.000) ---')
for (const row of sweepIdeal) {
  console.log(
    `  N=${String(row.requestedShots).padStart(5)} (eff=${String(row.effectivePostselectedShots).padStart(5)}) | D^1=${row.signalMeanDeltaS.toFixed(5)}+-${row.signalStdDeltaS.toFixed(5)} | Null=${row.nullMeanDeltaS.toFixed(5)}+-${row.nullStdDeltaS.toFixed(5)} | ZX=${row.zxMeanDeltaS.toFixed(5)}+-${row.zxStdDeltaS.toFixed(5)} | z(vs Null)=${row.zVsNull.toFixed(2)}s, z(vs ZX)=${row.zVsZx.toFixed(2)}s (p=${row.pVsZx.toExponential(2)}) | est N_3s=${row.estimatedShotsFor3Sigma}`,
  )
}

// 5B. Binary 24-qubit 6x D^1.0 layer with realistic p_2q = 1e-4 & p_2q = 1e-3 (showing explicit |11> postselection!)
const ptSig24q1e4 = evaluateNoisyChannel(chMagic10, makeNoiseCfg(1e-4, 'binary_24q_perturbation'))
const ptNull24q1e4 = evaluateNoisyChannel(chBaseline, makeNoiseCfg(1e-4, 'binary_24q_perturbation'))
const ptZx24q1e4 = evaluateNoisyChannel(chZX040, makeNoiseCfg(1e-4, 'binary_24q_perturbation'))
const sweep24q1e4 = runFiniteShotSweep(
  ptSig24q1e4,
  ptNull24q1e4,
  ptZx24q1e4,
  SHOT_BUDGETS,
  300,
  0x1214b002,
)

const ptSigBa1e3 = evaluateNoisyChannel(chMagic10, makeNoiseCfg(1e-3, 'native_ba137'))
const ptNullBa1e3 = evaluateNoisyChannel(chBaseline, makeNoiseCfg(1e-3, 'native_ba137'))
const ptZxBa1e3 = evaluateNoisyChannel(chZX040, makeNoiseCfg(1e-3, 'native_ba137'))
const sweepBa1e3 = runFiniteShotSweep(ptSigBa1e3, ptNullBa1e3, ptZxBa1e3, SHOT_BUDGETS, 300, 0x1214c003)

const ptSig24qFull1e3 = evaluateNoisyChannel(chMagic10, makeNoiseCfg(1e-3, 'binary_24q_full'))

console.log(
  `  --- Regime 2: 24q Binary (6xD layer, p_2q=1e-4, f_keep=${ptSig24q1e4.leakagePostselectRetention.toFixed(4)}, heralded |11> discard=${(100 * ptSig24q1e4.heraldedLeakageDiscardFraction).toFixed(2)}%) ---`,
)
for (const row of sweep24q1e4) {
  console.log(
    `  N=${String(row.requestedShots).padStart(5)} (eff=${String(row.effectivePostselectedShots).padStart(5)}) | D^1=${row.signalMeanDeltaS.toFixed(5)}+-${row.signalStdDeltaS.toFixed(5)} | z(vs ZX)=${row.zVsZx.toFixed(2)}s (p=${row.pVsZx.toExponential(2)}) | est N_3s=${row.estimatedShotsFor3Sigma}`,
  )
}
console.log(
  `  --- Regime 3: Ba-137 Native (29 MS gates, p_2q=1e-3, f_keep=1.000) ---`,
)
for (const row of sweepBa1e3) {
  console.log(
    `  N=${String(row.requestedShots).padStart(5)} (eff=${String(row.effectivePostselectedShots).padStart(5)}) | D^1=${row.signalMeanDeltaS.toFixed(5)}+-${row.signalStdDeltaS.toFixed(5)} | z(vs ZX)=${row.zVsZx.toFixed(2)}s (p=${row.pVsZx.toExponential(2)}) | est N_3s=${row.estimatedShotsFor3Sigma}`,
  )
}
console.log(
  `  Full 24q binary |11> leakage postselection at p_2q=1e-3: f_keep=${ptSig24qFull1e3.leakagePostselectRetention.toFixed(4)} (${(100 * ptSig24qFull1e3.heraldedLeakageDiscardFraction).toFixed(2)}% heralded discards, shot overhead ${(1 / ptSig24qFull1e3.leakagePostselectRetention).toFixed(2)}x)`,
)

const ideal1000 = sweepIdeal[0]!
const ideal4000 = sweepIdeal[1]!
const ideal16000 = sweepIdeal[2]!
const ba1e3_16000 = sweepBa1e3[2]!

const h5Pass =
  ideal1000.zVsZx > 0.8 &&
  ideal4000.zVsZx > ideal1000.zVsZx &&
  ideal16000.zVsZx >= 3.0 &&
  ideal16000.pVsZx < 0.0027 &&
  ideal16000.zVsNull >= 3.0 &&
  ideal16000.pVsNull < 0.0027 &&
  ptSig24q1e4.leakagePostselectRetention < 1 &&
  ptSig24q1e4.leakagePostselectRetention > 0.99 &&
  ptSig24qFull1e3.leakagePostselectRetention < 0.85 &&
  ptSig24qFull1e3.leakagePostselectRetention > 0.7 &&
  ba1e3_16000.estimatedShotsFor3Sigma > 16000

recordGate(
  'H5',
  'Deterministic finite-shot statistical power (N=1k,4k,16k) & |11> leakage postselection',
  h5Pass,
  `ideal p_2q=0: N=16k achieves z=${ideal16000.zVsZx.toFixed(2)}s (p=${ideal16000.pVsZx.toExponential(1)}<0.0027, N_3s~${ideal16000.estimatedShotsFor3Sigma}); noisy Ba-137 p_2q=1e-3 requires N_3s~${ba1e3_16000.estimatedShotsFor3Sigma}; full-24q p_2q=1e-3 f_keep=${ptSig24qFull1e3.leakagePostselectRetention.toFixed(3)}`,
)

// Optional OpenQASM 3.0 disk export only when explicitly requested via --emit-qasm
if (process.argv.includes('--emit-qasm')) {
  const outDir = resolve(process.cwd(), 'tmp', 'hardware-qasm-12-1-4')
  const files = writeHardwareBundle(outDir)
  console.log(`\n[EMIT] Wrote ${files.length} hardware bundle files to ${outDir}`)
}

// ============================================================================
// SUMMARY TABLE (FAIL-CLOSED)
// ============================================================================
const elapsedSec = (performance.now() - tStart) / 1000
const rssMb = process.memoryUsage().rss / (1024 * 1024)

console.log('\n================================================================================')
console.log(
  `HARDWARE QASM & NOISE SWEEP SUMMARY (${elapsedSec.toFixed(2)} s | RSS ${rssMb.toFixed(1)} MB)`,
)
console.log('================================================================================')
let allPassed = true
for (const g of GATES) {
  if (!g.passed) allPassed = false
  console.log(`  [${g.passed ? 'PASS' : 'FAIL'}] ${g.id.padEnd(4)} | ${g.name.padEnd(64)} | ${g.detail}`)
}
console.log('================================================================================')
console.log(`OVERALL: ${GATES.filter(g => g.passed).length}/${GATES.length} GATES PASSED`)

if (!allPassed) {
  process.exit(1)
}

export {}
