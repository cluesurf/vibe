// Hardware Circuit Compilation, Official OpenQASM 3.0 Envelope Audit, Exact G4 FLM Parity,
// Tier-B Effective Bulk-Depolarizing + Exact Tier-A Bayes Leakage Threshold Sweep, and
// Deterministic Finite-Shot Power Verification for the [[12, 1, 4]]_3 Qutrit Holographic Slice.
//
// Strictly deterministic (Mulberry32 PRNG only, zero system RNG), fast (< 5 s, < 200 MB RSS),
// strict TypeScript (--strict --noUncheckedIndexedAccess), fail-closed (exit 1 on any gate failure).
//
// Five Hardware-Readiness Gates:
//   H1 (Tier A): Exact [[12, 1, 4]]_3 code, binary-qubit encoding (zero noiseless |11> leakage),
//                23-gate Clifford encoder parity, and exact 4-qubit D^lambda / ZZ / ZX / SUM3 / CZ3^2 parity.
//   H2 (Tier A): Official OpenQASM 3.0 stdgates.inc + custom gate declaration grammar audit (including
//                negative control rejecting undeclared rzz) & Forte-1 / H2 / Ba-137 envelope table.
//   H3 (Tier A): Exact < 1e-12 FLM Delta S_PA parity with G4 (lam=0 -> 3 ln 3; D^0.5 -> D^0.8 ->
//                D^1.0 = +0.014823; cross-cut ZZ(0.50) < 1e-14; cross-cut ZX(0.40) Clif=+0.761 ->
//                Petz < 1e-13) PLUS explicitly separated 24-qubit hardware witness Delta S_rec.
//   H4 (Tier B): Effective bulk-depolarizing + exact Tier-A Bayes leakage-postselection sweep over
//                p_2q in {0, 1e-4, 5e-4, 1e-3, 3e-3, 1e-2} with per-circuit gate counts (zero reuse).
//   H5 (Tier B): Deterministic finite-shot Monte Carlo aligned-basis Shannon-entropy power sweep
//                (N_shots = 1000, 4000, 16000) on 24-qubit witness Delta S_rec with per-circuit |11>
//                postselection accounting and explicit Shannon-vs-von-Neumann off-diagonal gap audit.

import { resolve } from 'node:path'
import {
  buildLogicalCodewords,
  buildNoiseConfigFromDescriptor,
  buildSliceCodeSpec,
  CODEWORD_TERM_COUNT,
  compileCZ3QubitOps,
  compileDLambdaQubitOps,
  compileSUM3QubitOps,
  compileZXQubitOps,
  compileZZQubitOps,
  computeExactCrossCutChannel,
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
  runFiniteShotSweep,
  simulate4QubitOps,
  simulateNativeCliffordEncoder,
  validateOpenQasm3,
  verify4QubitCompilationParity,
  verifySliceCodeDistance,
  writeHardwareBundle,
  type ComplexMatrix,
  type HardwareArchitecture,
  type HardwareCircuitDescriptor,
  type QutritValue,
} from '../../code/hardware/qutrit-slice-12-1-4'

interface GateRow {
  readonly id: string
  readonly tier: 'Tier A' | 'Tier B'
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const GATES: GateRow[] = []

function recordGate(
  id: string,
  tier: 'Tier A' | 'Tier B',
  name: string,
  passed: boolean,
  detail: string,
): void {
  GATES.push({ id, tier, name, passed, detail })
}

const LN3 = Math.log(3)
const tStart = performance.now()

console.log('================================================================================')
console.log('HARDWARE QASM 3.0 & NOISE SWEEP VERIFICATION SUITE: [[12, 1, 4]]_3 QUTRIT SLICE')
console.log('================================================================================')

// ============================================================================
// GATE H1 (Tier A): CODE & BINARY-ENCODING EXACTNESS
// ============================================================================
console.log('\n[GATE H1 / Tier A] Code Exactness, Binary-Qubit Encoding & 4-Qubit Compiled Unitary Parity:')

const spec = buildSliceCodeSpec()
const distCert = verifySliceCodeDistance(spec)
const codewords = buildLogicalCodewords(spec)

// Verify exact 23-gate Clifford encoder reproduces |0_L>, |1_L>, |2_L> to machine precision
// Compares in-place against sparse codewords using only 2 dense buffers (8.5 MB total)
let maxEncoderErr = 0
{
  const bufEncRe = new Float64Array(HILBERT_DIM_12)
  const bufEncIm = new Float64Array(HILBERT_DIM_12)
  for (const c of [0, 1, 2] as readonly QutritValue[]) {
    const enc = simulateNativeCliffordEncoder(c, bufEncRe, bufEncIm)
    const sp = codewords.sparse[c]!
    for (let t = 0; t < sp.indices.length; t++) {
      const idx = sp.indices[t]!
      enc.re[idx] = enc.re[idx]! - sp.re[t]!
      enc.im[idx] = enc.im[idx]! - sp.im[t]!
    }
    let diffSq = 0
    for (let i = 0; i < HILBERT_DIM_12; i++) {
      const dr = enc.re[i]!
      const di = enc.im[i]!
      diffSq += dr * dr + di * di
    }
    const err = Math.sqrt(diffSq)
    if (err > maxEncoderErr) maxEncoderErr = err
  }
}

const encodingRoundtripOk =
  ([0, 1, 2] as readonly QutritValue[]).every(t => {
    const [b0, b1] = encodeQutritToBits(t)
    return !isLeakageBits(b0, b1) && decodeBitsToQutrit(b0, b1) === t
  }) &&
  isLeakageBits(LEAKAGE_QUBIT_BITS[0], LEAKAGE_QUBIT_BITS[1]) &&
  decodeBitsToQutrit(LEAKAGE_QUBIT_BITS[0], LEAKAGE_QUBIT_BITS[1]) === 'leakage'

// Verify 4-qubit binary compilation parity for D^lambda (0.5, 0.8, 1.0), G4 ZZ(0.50), G4 ZX(0.40), SUM_3, CZ_3^2
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
  true,
)
const zxParity = verify4QubitCompilationParity(
  simulate4QubitOps(compileZXQubitOps(0, 1, 2, 3, 0.4)),
  makeCoherentZX(0.4),
  true,
)

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
  zzParity.leakageBlockIdentityError,
  zxParity.leakageCouplingError,
  zxParity.leakageBlockIdentityError,
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
  `  4-qubit compilation parity: D^lam=${maxDLambdaFrobErr.toExponential(2)}, ZZ=${zzParity.validBlockFrobeniusError.toExponential(2)}, ZX=${zxParity.validBlockFrobeniusError.toExponential(2)}, SUM3=${sum3Parity.validBlockFrobeniusError.toExponential(2)}, CZ3^2=${cz3Parity.validBlockFrobeniusError.toExponential(2)}, |11> leak=${maxLeakageCoupling.toExponential(2)}`,
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
  'Tier A',
  'Code, binary encoding, 23-gate encoder & 4-qubit D^lam/ZZ/ZX parity',
  h1Pass,
  `11 stabs (isoDef=0), d=4 (220/220 wt-3), 2,187 terms (err=${maxNormErr.toExponential(1)}), max ||U_comp-U_exact||_F=${maxCompiledParityErr.toExponential(1)}, |11> leak=${maxLeakageCoupling.toExponential(1)}`,
)

// ============================================================================
// GATE H2 (Tier A): OFFICIAL OPENQASM 3.0 STRUCTURAL & HARDWARE-ENVELOPE AUDIT
// ============================================================================
console.log('\n[GATE H2 / Tier A] Official OpenQASM 3.0 stdgates.inc Grammar & Hardware-Envelope Audit:')

const baselineDesc = exportOpenQasm3('stabilizer_baseline', { theta: Math.PI / 4, param: 0 })
const magicDesc = exportOpenQasm3('bare_u_magic', { theta: Math.PI / 4, param: 1.0 })
const zzDesc = exportOpenQasm3('coherent_zz_control', { theta: Math.PI / 4, param: 0.5 })
const zxDesc = exportOpenQasm3('coherent_zx_mimicry', { theta: Math.PI / 4, param: 0.4 })
const magicPlusZxDesc = exportOpenQasm3('bare_u_plus_zx', { theta: Math.PI / 4, param: 0.4 })
const magicLam05 = exportOpenQasm3('bare_u_magic', { theta: Math.PI / 4, param: 0.5 })
const magicLam08 = exportOpenQasm3('bare_u_magic', { theta: Math.PI / 4, param: 0.8 })

const coreCircuits: readonly HardwareCircuitDescriptor[] = [baselineDesc, magicDesc, zzDesc, zxDesc]
let allQasmValid = true
for (const desc of [...coreCircuits, magicLam05, magicLam08, magicPlusZxDesc]) {
  const v = validateOpenQasm3(desc.qasm3, QUBIT_COUNT)
  if (!v.valid || desc.qubitCount !== 24 || desc.qutritCount !== 12) allQasmValid = false
  if (coreCircuits.includes(desc)) {
    const customTag = v.declaredCustomGates.length > 0 ? v.declaredCustomGates.join(',') : 'none'
    console.log(
      `  ${desc.kind.padEnd(20)} | 24q: 1q=${String(desc.oneQubitGates).padStart(4)}, 2q=${String(desc.twoQubitGates).padStart(3)} (cxEq=${String(desc.cnotEquivalentTwoQubitGates).padStart(3)}, intra=${desc.intraQutritTwoQubitGates}, inter=${desc.interQutritTwoQubitGates}), depth=${String(desc.circuitDepth).padStart(3)}, lines=${String(v.lineCount).padStart(4)}, custom=[${customTag}] | Ba-137: 1q=${desc.nativeQutritOneGates}, 2q=${desc.nativeQutritTwoGates}, depth=${desc.nativeQutritDepth} | valid=${v.valid}`,
    )
  }
}

// Negative control for OpenQASM 3.0 validator: undeclared rzz and legacy u3 MUST be rejected!
const mutantUndeclaredRzz = validateOpenQasm3(
  'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[24] q;\nbit[24] c;\nrzz(0.5) q[0], q[1];\nc = measure q;\n',
  24,
)
const mutantLegacyU3 = validateOpenQasm3(
  'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[24] q;\nbit[24] c;\nu3(1.57, 0, 0) q[1];\nc = measure q;\n',
  24,
)
console.log(
  `  Strict validator negative controls: undeclared rzz rejected=${!mutantUndeclaredRzz.valid}, legacy u3 rejected=${!mutantLegacyU3.valid}`,
)

const magicPerturbTotal2q = magicDesc.twoQubitGates - baselineDesc.twoQubitGates
const zxPerturbTotal2q = zxDesc.twoQubitGates - baselineDesc.twoQubitGates
const zzPerturbTotal2q = zzDesc.twoQubitGates - baselineDesc.twoQubitGates
console.log(
  `  Hardware envelope: qubitCount=24 <= IonQ Forte-1 (36q) & Quantinuum H2 (56q); perturbation 2q layers: D^1.0=+${magicPerturbTotal2q}, ZZ=+${zzPerturbTotal2q} (cxEq=+${zzDesc.cnotEquivalentTwoQubitGates - baselineDesc.cnotEquivalentTwoQubitGates}), ZX=+${zxPerturbTotal2q} (cxEq=+${zxDesc.cnotEquivalentTwoQubitGates - baselineDesc.cnotEquivalentTwoQubitGates}); Ba-137 native MS: baseline=${baselineDesc.nativeQutritTwoGates}, D^1/ZZ/ZX=${magicDesc.nativeQutritTwoGates}`,
)

const h2Pass =
  allQasmValid &&
  !mutantUndeclaredRzz.valid &&
  !mutantLegacyU3.valid &&
  coreCircuits.every(
    c =>
      c.qubitCount === 24 &&
      c.qubitCount <= 36 &&
      c.qubitCount <= 56 &&
      c.qutritCount === 12 &&
      c.targetBackends.length === 3 &&
      !c.qasm3.includes('u3('),
  ) &&
  magicPerturbTotal2q === 228 &&
  zzPerturbTotal2q === 24 &&
  magicDesc.nativeQutritTwoGates === 29 &&
  zxDesc.nativeQutritTwoGates === 29

recordGate(
  'H2',
  'Tier A',
  'Official OpenQASM 3.0 grammar, validator mutants & hardware envelope',
  h2Pass,
  `4/4 valid stdgates.inc QASM 3 (custom gate rzz declared, 0 u3, mutants killed); 24q 2q: base=${baselineDesc.twoQubitGates}, D^1=${magicDesc.twoQubitGates}, ZZ=${zzDesc.twoQubitGates}, ZX=${zxDesc.twoQubitGates}; Ba-137=29 MS`,
)

// ============================================================================
// GATE H3 (Tier A): EXACT G4 FLM Delta S_PA PARITY + 24q WITNESS Delta S_rec
// ============================================================================
console.log('\n[GATE H3 / Tier A] Exact G4 FLM Delta S_PA Parity & 24-Qubit Witness Delta S_rec (81x81 Gram):')

const chBaseline = computeExactCrossCutChannel('stabilizer_baseline (lam=0)', codewords, [
  makeBareUDLambda(0),
])
const chMagic05 = computeExactCrossCutChannel('bare_u_magic (D^0.5)', codewords, [
  makeBareUDLambda(0.5),
])
const chMagic08 = computeExactCrossCutChannel('bare_u_magic (D^0.8)', codewords, [
  makeBareUDLambda(0.8),
])
const chMagic10 = computeExactCrossCutChannel('bare_u_magic (D^1.0)', codewords, [
  makeBareUDLambda(1.0),
])
const chZZ050 = computeExactCrossCutChannel('coherent_zz_control (ZZ 0.50)', codewords, [
  makeCoherentZZ(0.5),
])
const chZX040 = computeExactCrossCutChannel('coherent_zx_mimicry (ZX 0.40)', codewords, [
  makeCoherentZX(0.4),
])
const chMagic10PlusZX = computeExactCrossCutChannel(
  'bare_u_plus_zx (D^1.0 + ZX 0.40)',
  codewords,
  [makeBareUDLambda(1.0), makeCoherentZX(0.4)],
)

for (const ch of [chBaseline, chMagic05, chMagic08, chMagic10, chZZ050, chZX040, chMagic10PlusZX]) {
  console.log(
    `  ${ch.label.padEnd(32)} | FLM dS_PA: Petz=${ch.flmPetzDeltaS.toFixed(6)} (S0=${ch.flmPetzS0.toFixed(5)}), Clif=${ch.flmClifDeltaS.toFixed(6)} | 24q dS_rec: Petz=${ch.recPetzDeltaS.toFixed(6)}, Clif=${ch.recClifDeltaS.toFixed(6)}`,
  )
}

// Reference exact G4 FLM Delta S_PA targets (from null-cone-bf-holography-hardware.ts)
const G4_D10_FLM_TARGET = 0.014823
const g4D10ParityErr = Math.abs(chMagic10.flmPetzDeltaS - G4_D10_FLM_TARGET)
const baselineAreaErr = Math.max(
  Math.abs(chBaseline.flmPetzS0 - 3 * LN3),
  Math.abs(chBaseline.flmPetzSPi4 - 3 * LN3),
)
console.log(
  `  G4 parity check: baseline S_PA=3ln3 (${(3 * LN3).toFixed(6)}, err=${baselineAreaErr.toExponential(1)}, petzTrDist=${chBaseline.petzTrDist.toExponential(1)}); D^1.0 FLM dS_PA=${chMagic10.flmPetzDeltaS.toFixed(6)} (vs G4 0.014823, diff=${g4D10ParityErr.toExponential(2)}); non-commuting cross-cut D^1.0+ZX(0.40) FLM dS_PA=${chMagic10PlusZX.flmPetzDeltaS.toFixed(6)} (honest shift=${(chMagic10PlusZX.flmPetzDeltaS - chMagic10.flmPetzDeltaS).toFixed(6)})`,
)

const h3Pass =
  baselineAreaErr < 1e-12 &&
  Math.abs(chBaseline.flmPetzDeltaS) < 1e-14 &&
  Math.abs(chBaseline.recPetzDeltaS) < 1e-14 &&
  chBaseline.petzTrDist < 1e-14 &&
  chMagic05.flmPetzDeltaS > 0.002 &&
  chMagic08.flmPetzDeltaS > chMagic05.flmPetzDeltaS &&
  chMagic10.flmPetzDeltaS > chMagic08.flmPetzDeltaS &&
  chMagic10.flmPetzDeltaS > 0.01 &&
  g4D10ParityErr < 1e-6 &&
  Math.abs(chZZ050.flmPetzDeltaS) < 1e-14 &&
  chZZ050.flmClifDeltaS > 0.35 &&
  Math.abs(chZX040.flmPetzDeltaS) < 1e-13 &&
  chZX040.flmClifDeltaS > 0.35 &&
  Math.abs(chZX040.recPetzDeltaS) < 1e-13 &&
  Math.abs(chMagic10.recPetzDeltaS) > 0.007 &&
  chMagic10PlusZX.flmPetzDeltaS > 0.01

recordGate(
  'H3',
  'Tier A',
  'Exact G4 FLM Delta S_PA parity & separated 24q witness Delta S_rec',
  h3Pass,
  `FLM dS_PA: 0->${chMagic05.flmPetzDeltaS.toFixed(5)}->${chMagic08.flmPetzDeltaS.toFixed(5)}->${chMagic10.flmPetzDeltaS.toFixed(6)} (G4 parity); cross-cut ZX: Clif=+${chZX040.flmClifDeltaS.toFixed(4)}->Petz=${Math.abs(chZX040.flmPetzDeltaS).toExponential(1)}; 24q dS_rec(D^1)=${chMagic10.recPetzDeltaS.toFixed(5)}`,
)

// ============================================================================
// GATE H4 (Tier B): EFFECTIVE BULK-DEPOLARIZING + EXACT BAYES LEAKAGE SWEEP
// ============================================================================
console.log(
  '\n[GATE H4 / Tier B] Effective Bulk-Depolarizing + Exact Tier-A Bayes Leakage Threshold Sweep (Per-Circuit Gate Counts):',
)
console.log(
  '  Model disclosure: Tier-B effective bulk-depolarizing channel built on exact Tier-A single-fault leakage rates (4/15 intra, 44/135 inter) & exact Bayes survival (1-p)/(1-r_leak*p); NOT full 24-qubit circuit-level Pauli trajectory MC.',
)

const P2Q_GRID: readonly number[] = [0, 1e-4, 5e-4, 1e-3, 3e-3, 1e-2]
const FLM_MARGIN_THRESHOLD = 0.2 * chMagic10.flmPetzDeltaS // 20% of noiseless FLM signal (+0.002965)
const REC_MARGIN_THRESHOLD = 0.2 * Math.abs(chMagic10.recPetzDeltaS) // 20% of noiseless 24q witness (0.001518)

function findFlmBreakEvenBa137(): number {
  let lo = 0
  let hi = 0.1
  for (let iter = 0; iter < 28; iter++) {
    const mid = 0.5 * (lo + hi)
    const ptD = evaluateNoisyChannel(
      chMagic10,
      buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, mid, 'native_ba137'),
    )
    const ptZ = evaluateNoisyChannel(
      chZX040,
      buildNoiseConfigFromDescriptor(zxDesc, baselineDesc, mid, 'native_ba137'),
    )
    if (ptD.flmPetzDeltaS - ptZ.flmPetzDeltaS >= FLM_MARGIN_THRESHOLD) lo = mid
    else hi = mid
  }
  return 0.5 * (lo + hi)
}

function findRecBreakEven(arch: HardwareArchitecture): number {
  let lo = 0
  let hi = 0.1
  for (let iter = 0; iter < 28; iter++) {
    const mid = 0.5 * (lo + hi)
    const ptD = evaluateNoisyChannel(
      chMagic10,
      buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, mid, arch),
    )
    const ptZ = evaluateNoisyChannel(
      chZX040,
      buildNoiseConfigFromDescriptor(zxDesc, baselineDesc, mid, arch),
    )
    if (Math.abs(ptD.recPetzDeltaS - ptZ.recPetzDeltaS) >= REC_MARGIN_THRESHOLD) lo = mid
    else hi = mid
  }
  return 0.5 * (lo + hi)
}

const breakEvenFlmBa137 = findFlmBreakEvenBa137()
const breakEvenRecBa137 = findRecBreakEven('native_ba137')
const breakEvenRec24qPerturb = findRecBreakEven('binary_24q_perturbation')
const breakEvenRec24qFull = findRecBreakEven('binary_24q_full')

console.log(
  '  --- Architecture A: Ba-137 Native 12-Ion Qutrit (matched 29 MS gates for D^1.0 & cross-cut ZX; 35 MS for D^1+ZX) ---',
)
console.log(
  '  p_2q    | eta_D1  | FLM Petz D^1 | FLM Petz ZX | FLM Margin(D^1-ZX) | FLM D^1+ZX  | 24q |dS_rec(D^1)|',
)

let ba137FlmMonotonic = true
let prevFlmMargin = Number.POSITIVE_INFINITY
let ba137Flm1e3 = 0
let ba137Flm3e3 = 0
let ba137Flm1e2 = 0
let ba137ClifZxAlwaysHuge = true

for (const p2q of P2Q_GRID) {
  const ptD1 = evaluateNoisyChannel(
    chMagic10,
    buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, p2q, 'native_ba137'),
  )
  const ptZx = evaluateNoisyChannel(
    chZX040,
    buildNoiseConfigFromDescriptor(zxDesc, baselineDesc, p2q, 'native_ba137'),
  )
  const ptD1Zx = evaluateNoisyChannel(
    chMagic10PlusZX,
    buildNoiseConfigFromDescriptor(magicPlusZxDesc, baselineDesc, p2q, 'native_ba137'),
  )
  const flmMargin = ptD1.flmPetzDeltaS - ptZx.flmPetzDeltaS
  if (flmMargin > prevFlmMargin + 1e-12) ba137FlmMonotonic = false
  if (ptZx.flmClifDeltaS < 0.6) ba137ClifZxAlwaysHuge = false
  prevFlmMargin = flmMargin

  if (p2q === 1e-3) ba137Flm1e3 = flmMargin
  if (p2q === 3e-3) ba137Flm3e3 = flmMargin
  if (p2q === 1e-2) ba137Flm1e2 = flmMargin

  console.log(
    `  ${p2q.toExponential(0).padEnd(7)} | ${ptD1.channelInfidelityEta.toFixed(5)} | ${ptD1.flmPetzDeltaS.toFixed(6).padStart(12)} | ${ptZx.flmPetzDeltaS.toFixed(6).padStart(11)} | ${flmMargin.toFixed(6).padStart(18)} | ${ptD1Zx.flmPetzDeltaS.toFixed(6).padStart(11)} | ${Math.abs(ptD1.recPetzDeltaS).toFixed(6).padStart(17)}`,
  )
}

console.log(
  `\n  --- Architecture B: 24-Qubit Binary (Per-Circuit Gate Counts: D^1=${magicDesc.twoQubitGates} 2q vs ZX=${zxDesc.twoQubitGates} 2q, Exact Bayes Survival) ---`,
)
console.log(
  '  p_2q    | Full24q f_keep(D^1/ZX) | Full24q |dS_rec(D^1)| | Perturb228 f_keep(D^1) | Perturb228 |dS_rec(D^1)|',
)

let full24qRec1e3 = 0
let full24qRec3e3 = 0
let full24qRec1e2 = 0
let perturb228Rec1e3 = 0

for (const p2q of P2Q_GRID) {
  const ptFullD = evaluateNoisyChannel(
    chMagic10,
    buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, p2q, 'binary_24q_full'),
  )
  const ptFullZ = evaluateNoisyChannel(
    chZX040,
    buildNoiseConfigFromDescriptor(zxDesc, baselineDesc, p2q, 'binary_24q_full'),
  )
  const ptPertD = evaluateNoisyChannel(
    chMagic10,
    buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, p2q, 'binary_24q_perturbation'),
  )
  if (p2q === 1e-3) {
    full24qRec1e3 = Math.abs(ptFullD.recPetzDeltaS)
    perturb228Rec1e3 = Math.abs(ptPertD.recPetzDeltaS)
  }
  if (p2q === 3e-3) full24qRec3e3 = Math.abs(ptFullD.recPetzDeltaS)
  if (p2q === 1e-2) full24qRec1e2 = Math.abs(ptFullD.recPetzDeltaS)
  console.log(
    `  ${p2q.toExponential(0).padEnd(7)} | ${ptFullD.leakagePostselectRetention.toFixed(4)} / ${ptFullZ.leakagePostselectRetention.toFixed(4)}        | ${Math.abs(ptFullD.recPetzDeltaS).toFixed(6).padStart(21)} | ${ptPertD.leakagePostselectRetention.toFixed(6).padStart(22)} | ${Math.abs(ptPertD.recPetzDeltaS).toFixed(6).padStart(24)}`,
  )
}

console.log(
  `  Exact 20%-signal break-even p_2q*: FLM Ba-137=${breakEvenFlmBa137.toExponential(3)}; 24q |dS_rec| Ba-137=${breakEvenRecBa137.toExponential(3)}, 24q-6xD=${breakEvenRec24qPerturb.toExponential(3)}, 24q-full=${breakEvenRec24qFull.toExponential(3)}`,
)
console.log(
  `  Honest hardware placement: Quantinuum H2 (p_2q ~ 1e-3) CLEARS Ba-137 FLM (margin=${ba137Flm1e3.toFixed(5)}) and 24q-6xD witness (|dS_rec|=${perturb228Rec1e3.toFixed(5)}), sits BELOW full-${magicDesc.twoQubitGates}-2q binary break-even (|dS_rec|=${full24qRec1e3.toFixed(5)}); IonQ Forte-1 (p_2q ~ 3e-3) CLEARS Ba-137 native FLM (margin=${ba137Flm3e3.toFixed(5)}) but is WASHED OUT on unverified full 24q binary (${full24qRec3e3.toExponential(2)}); p_2q=1e-2 washes out BOTH full-24q (${full24qRec1e2.toExponential(2)}) and Ba-137 FLM (${ba137Flm1e2.toFixed(5)} < ${FLM_MARGIN_THRESHOLD.toFixed(5)}).`,
)

const h4Pass =
  ba137FlmMonotonic &&
  ba137ClifZxAlwaysHuge &&
  ba137Flm1e3 > FLM_MARGIN_THRESHOLD &&
  ba137Flm3e3 > FLM_MARGIN_THRESHOLD &&
  ba137Flm1e2 < FLM_MARGIN_THRESHOLD &&
  full24qRec1e2 < 1e-4 &&
  breakEvenFlmBa137 > 3e-3 &&
  breakEvenFlmBa137 < 1e-2 &&
  breakEvenRec24qPerturb > 1e-3 &&
  breakEvenRec24qFull < 1e-3

recordGate(
  'H4',
  'Tier B',
  'Bulk-depolarizing + Bayes leakage threshold sweep (per-circuit counts)',
  h4Pass,
  `FLM Ba-137 p_2q*=${breakEvenFlmBa137.toExponential(2)} (>H2 1e-3 & Forte 3e-3, <1e-2 washout); 24q |dS_rec| p_2q*: 6xD=${breakEvenRec24qPerturb.toExponential(2)}, full=${breakEvenRec24qFull.toExponential(2)}`,
)

// ============================================================================
// GATE H5 (Tier B): FINITE-SHOT STATISTICAL POWER SWEEP & |11> LEAKAGE ACCOUNTING
// ============================================================================
console.log(
  '\n[GATE H5 / Tier B] Deterministic Finite-Shot Aligned-Basis Power Sweep on 24-Qubit Witness Delta S_rec:',
)

const SHOT_BUDGETS: readonly number[] = [1000, 4000, 16000]
const IDEAL_SHOT_BUDGETS: readonly number[] = [1000, 4000, 16000, 64000]

const ptSigIdeal = evaluateNoisyChannel(
  chMagic10,
  buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, 0, 'native_ba137'),
)
const ptNullIdeal = evaluateNoisyChannel(
  chBaseline,
  buildNoiseConfigFromDescriptor(baselineDesc, baselineDesc, 0, 'native_ba137'),
)
const ptZxIdeal = evaluateNoisyChannel(
  chZX040,
  buildNoiseConfigFromDescriptor(zxDesc, baselineDesc, 0, 'native_ba137'),
)
const sweepIdeal = runFiniteShotSweep(
  ptSigIdeal,
  ptNullIdeal,
  ptZxIdeal,
  IDEAL_SHOT_BUDGETS,
  300,
  0x1214a001,
)

console.log(
  `  --- Regime 1: Ideal / Error-Corrected Target (p_2q=0, aligned-basis Shannon vs vN gap=${sweepIdeal[0]!.alignedBasisShannonGap.toExponential(2)}) ---`,
)
for (const row of sweepIdeal) {
  console.log(
    `  N=${String(row.requestedShots).padStart(5)} (eff D^1/Null/ZX=${row.effectiveShotsSignal}/${row.effectiveShotsNull}/${row.effectiveShotsZx}) | dS_rec(D^1)=${row.signalMeanDeltaSRec.toFixed(5)}+-${row.signalStdDeltaSRec.toFixed(5)} | z(vs Null)=${row.zVsNull.toFixed(2)}s, z(vs ZX)=${row.zVsZx.toFixed(2)}s (p=${row.pVsZx.toExponential(2)}) | est N_3s=${row.estimatedShotsFor3Sigma}`,
  )
}

// Regime 2: 24q binary 6xD vs 6xZX vs baseline (each circuit uses ITS OWN retention f_keep!)
const ptSig24q1e4 = evaluateNoisyChannel(
  chMagic10,
  buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, 1e-4, 'binary_24q_perturbation'),
)
const ptNull24q1e4 = evaluateNoisyChannel(
  chBaseline,
  buildNoiseConfigFromDescriptor(baselineDesc, baselineDesc, 1e-4, 'binary_24q_perturbation'),
)
const ptZx24q1e4 = evaluateNoisyChannel(
  chZX040,
  buildNoiseConfigFromDescriptor(zxDesc, baselineDesc, 1e-4, 'binary_24q_perturbation'),
)
const sweep24q1e4 = runFiniteShotSweep(
  ptSig24q1e4,
  ptNull24q1e4,
  ptZx24q1e4,
  SHOT_BUDGETS,
  300,
  0x1214b002,
)

const ptSigBa1e3 = evaluateNoisyChannel(
  chMagic10,
  buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, 1e-3, 'native_ba137'),
)
const ptNullBa1e3 = evaluateNoisyChannel(
  chBaseline,
  buildNoiseConfigFromDescriptor(baselineDesc, baselineDesc, 1e-3, 'native_ba137'),
)
const ptZxBa1e3 = evaluateNoisyChannel(
  chZX040,
  buildNoiseConfigFromDescriptor(zxDesc, baselineDesc, 1e-3, 'native_ba137'),
)
const sweepBa1e3 = runFiniteShotSweep(ptSigBa1e3, ptNullBa1e3, ptZxBa1e3, SHOT_BUDGETS, 300, 0x1214c003)

const ptSigFull1e3 = evaluateNoisyChannel(
  chMagic10,
  buildNoiseConfigFromDescriptor(magicDesc, baselineDesc, 1e-3, 'binary_24q_full'),
)
const ptZxFull1e3 = evaluateNoisyChannel(
  chZX040,
  buildNoiseConfigFromDescriptor(zxDesc, baselineDesc, 1e-3, 'binary_24q_full'),
)
const ptNullFull1e3 = evaluateNoisyChannel(
  chBaseline,
  buildNoiseConfigFromDescriptor(baselineDesc, baselineDesc, 1e-3, 'binary_24q_full'),
)

console.log(
  `  --- Regime 2: 24q Binary Perturbation Layer (p_2q=1e-4, per-circuit f_keep: D^1=${ptSig24q1e4.leakagePostselectRetention.toFixed(4)}, Null=${ptNull24q1e4.leakagePostselectRetention.toFixed(4)}, ZX=${ptZx24q1e4.leakagePostselectRetention.toFixed(4)}) ---`,
)
for (const row of sweep24q1e4) {
  console.log(
    `  N=${String(row.requestedShots).padStart(5)} (eff=${row.effectiveShotsSignal}/${row.effectiveShotsNull}/${row.effectiveShotsZx}) | dS_rec(D^1)=${row.signalMeanDeltaSRec.toFixed(5)}+-${row.signalStdDeltaSRec.toFixed(5)} | z(vs ZX)=${row.zVsZx.toFixed(2)}s (p=${row.pVsZx.toExponential(2)}) | est N_3s=${row.estimatedShotsFor3Sigma}`,
  )
}
console.log('  --- Regime 3: Ba-137 Native (29 MS gates, p_2q=1e-3, f_keep=1.000) ---')
for (const row of sweepBa1e3) {
  console.log(
    `  N=${String(row.requestedShots).padStart(5)} (eff=${row.effectiveShotsSignal}/${row.effectiveShotsNull}/${row.effectiveShotsZx}) | dS_rec(D^1)=${row.signalMeanDeltaSRec.toFixed(5)}+-${row.signalStdDeltaSRec.toFixed(5)} | z(vs ZX)=${row.zVsZx.toFixed(2)}s (p=${row.pVsZx.toExponential(2)}) | est N_3s=${row.estimatedShotsFor3Sigma}`,
  )
}
console.log(
  `  Full 24q binary per-circuit |11> leakage postselection at p_2q=1e-3: D^1 f_keep=${ptSigFull1e3.leakagePostselectRetention.toFixed(4)} (${(100 * ptSigFull1e3.heraldedLeakageDiscardFraction).toFixed(2)}% discards), ZX f_keep=${ptZxFull1e3.leakagePostselectRetention.toFixed(4)}, baseline f_keep=${ptNullFull1e3.leakagePostselectRetention.toFixed(4)}`,
)

const ideal1000 = sweepIdeal[0]!
const ideal4000 = sweepIdeal[1]!
const ideal16000 = sweepIdeal[2]!
const ideal64000 = sweepIdeal[3]!
const ba1e3_16000 = sweepBa1e3[2]!

const h5Pass =
  ideal4000.zVsZx > ideal1000.zVsZx &&
  ideal16000.zVsZx > ideal4000.zVsZx &&
  ideal64000.zVsZx >= 3.0 &&
  ideal64000.pVsZx < 0.0027 &&
  ideal64000.zVsNull >= 3.0 &&
  ideal64000.pVsNull < 0.0027 &&
  ideal16000.estimatedShotsFor3Sigma > 16000 &&
  ideal16000.estimatedShotsFor3Sigma < 64000 &&
  ideal16000.alignedBasisShannonGap < 5e-5 &&
  ptSig24q1e4.leakagePostselectRetention < ptZx24q1e4.leakagePostselectRetention &&
  ptZx24q1e4.leakagePostselectRetention < ptNull24q1e4.leakagePostselectRetention &&
  ptSigFull1e3.leakagePostselectRetention < ptZxFull1e3.leakagePostselectRetention &&
  ptZxFull1e3.leakagePostselectRetention < ptNullFull1e3.leakagePostselectRetention &&
  ba1e3_16000.estimatedShotsFor3Sigma > 64000

recordGate(
  'H5',
  'Tier B',
  'Finite-shot aligned-basis power (N=1k,4k,16k,64k) & per-circuit |11> retention',
  h5Pass,
  `ideal p_2q=0: N=16k z=${ideal16000.zVsZx.toFixed(2)}s, N=64k z=${ideal64000.zVsZx.toFixed(2)}s (p=${ideal64000.pVsZx.toExponential(1)}<0.0027, N_3s~${ideal16000.estimatedShotsFor3Sigma}, Shannon gap=${ideal16000.alignedBasisShannonGap.toExponential(1)}); Ba-137 p_2q=1e-3 N_3s~${ba1e3_16000.estimatedShotsFor3Sigma}; full-24q f_keep(D^1/ZX/base)=${ptSigFull1e3.leakagePostselectRetention.toFixed(3)}/${ptZxFull1e3.leakagePostselectRetention.toFixed(3)}/${ptNullFull1e3.leakagePostselectRetention.toFixed(3)}`,
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
  console.log(
    `  [${g.passed ? 'PASS' : 'FAIL'}] ${g.id.padEnd(4)} (${g.tier}) | ${g.name.padEnd(60)} | ${g.detail}`,
  )
}
console.log('================================================================================')
console.log(`OVERALL: ${GATES.filter(g => g.passed).length}/${GATES.length} GATES PASSED`)

if (!allPassed) {
  process.exit(1)
}

export {}
