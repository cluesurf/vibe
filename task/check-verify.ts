// Wave-5 & Wave-6 One-Command Verification Gate + Automated Mutant Negative-Control Harness.
//
// Strictly deterministic (zero Math.random), laptop-safe sequential execution,
// bounded per-suite timeout & peak RSS telemetry, zero disk writes during mutant probing.
//
// Usage:
//   npx tsx --no-warnings=ExperimentalWarning task/check-verify.ts [--wave=5|6|all] [--suite=<substr>]
//     [--max-rss-mb=512] [--timeout-ms=30000] [--skip-typecheck] [--skip-mutants]

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  assertMutantRejected,
  assertNumericMutantRejected,
  runMutantSuite,
  type MutantCase,
} from '../code/verify/mutant'

type WaveSelection = '5' | '6' | 'all'

interface CliOptions {
  readonly wave: WaveSelection
  readonly suiteFilter: string | null
  readonly maxRssMb: number
  readonly timeoutMs: number
  readonly skipTypecheck: boolean
  readonly skipMutants: boolean
}

interface SuiteSpec {
  readonly wave: '5' | '6'
  readonly relPath: string
}

interface ProbeMetrics {
  readonly rssMb: number
  readonly heapMb: number
  readonly ms: number
}

interface SuiteRunResult {
  readonly wave: '5' | '6'
  readonly relPath: string
  readonly passed: boolean
  readonly exitCode: number | null
  readonly signal: NodeJS.Signals | null
  readonly timedOut: boolean
  readonly wallMs: number
  readonly metrics: ProbeMetrics | null
  readonly failureReason: string | null
  readonly diagnosticTail: string
}

interface ToolCommand {
  readonly cmd: string
  readonly prefixArgs: readonly string[]
}

const METRICS_PREFIX = '__VIBE_METRICS__='
const PI = Math.PI
const SQRT3 = Math.sqrt(3)

const WAVE5_SUITES: readonly string[] = [
  'test/verify/turing-universality-native-3434.ts',
  'test/verify/bare-u-periodic-mirrors-and-bounds.ts',
  'test/verify/bare-u-arbitrary-n-and-zero-w0.ts',
  'test/verify/autonomous-bare-u-computability.ts',
  'test/verify/sm-unified-gauge-chiral-fermions.ts',
  'test/verify/ewsb-higgs-hosotani-fms-qca.ts',
  'test/verify/three-generations-index-audit.ts',
  'test/verify/ir-light-mass-and-emc2-closure.ts',
  'test/verify/sm-closure-track3-yukawa-nb-freezing.ts',
  'test/verify/sm-dense-ring-gauge-continuum.ts',
  'test/verify/sm-16fermion-smg-flavor-precision.ts',
  'test/verify/sm-gw-depth-and-uv-stiffness.ts',
  'test/verify/sm-all-vibe-relational-gauge-fermions.ts',
  'test/verify/sm-native-three-generations.ts',
  'test/verify/sm-bare-radion-flavor-uv-audit.ts',
  'test/verify/sm-chiral-lattice-qcd-leptogenesis.ts',
]

const WAVE6_SUITES: readonly string[] = [
  'test/verify/w6-null-cone-bf-holography-hardware.ts',
  'test/verify/w6-condensate-flux-dark-sector.ts',
  'test/verify/w6-agency-valence-synergy-note47.ts',
]

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function parsePositiveNumber(raw: string, flagName: string): number {
  const val = Number(raw)
  if (!Number.isFinite(val) || val <= 0) {
    throw new Error(`Invalid value for ${flagName}: ${raw}`)
  }
  return val
}

function parseArgs(argv: readonly string[]): CliOptions {
  let wave: WaveSelection = 'all'
  let suiteFilter: string | null = null
  let maxRssMb = 512
  let timeoutMs = 30_000
  let skipTypecheck = false
  let skipMutants = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--skip-typecheck') {
      skipTypecheck = true
    } else if (arg === '--skip-mutants') {
      skipMutants = true
    } else if (arg.startsWith('--wave=')) {
      const val = arg.slice('--wave='.length)
      if (val !== '5' && val !== '6' && val !== 'all') {
        throw new Error(`Invalid --wave value "${val}" (expected 5, 6, or all)`)
      }
      wave = val
    } else if (arg === '--wave' && i + 1 < argv.length) {
      const val = argv[++i]!
      if (val !== '5' && val !== '6' && val !== 'all') {
        throw new Error(`Invalid --wave value "${val}" (expected 5, 6, or all)`)
      }
      wave = val
    } else if (arg.startsWith('--suite=')) {
      suiteFilter = arg.slice('--suite='.length)
    } else if (arg === '--suite' && i + 1 < argv.length) {
      suiteFilter = argv[++i]!
    } else if (arg.startsWith('--max-rss-mb=')) {
      maxRssMb = parsePositiveNumber(arg.slice('--max-rss-mb='.length), '--max-rss-mb')
    } else if (arg === '--max-rss-mb' && i + 1 < argv.length) {
      maxRssMb = parsePositiveNumber(argv[++i]!, '--max-rss-mb')
    } else if (arg.startsWith('--timeout-ms=')) {
      timeoutMs = Math.round(parsePositiveNumber(arg.slice('--timeout-ms='.length), '--timeout-ms'))
    } else if (arg === '--timeout-ms' && i + 1 < argv.length) {
      timeoutMs = Math.round(parsePositiveNumber(argv[++i]!, '--timeout-ms'))
    } else {
      throw new Error(`Unknown CLI argument: ${arg}`)
    }
  }

  return {
    wave,
    suiteFilter,
    maxRssMb,
    timeoutMs,
    skipTypecheck,
    skipMutants,
  }
}

function resolveLocalBin(binName: 'tsc' | 'tsx'): ToolCommand {
  const localPath = join(ROOT_DIR, 'node_modules', '.bin', binName)
  if (existsSync(localPath)) {
    return { cmd: localPath, prefixArgs: [] }
  }
  return { cmd: 'npx', prefixArgs: [binName] }
}

function selectSuites(opts: CliOptions): SuiteSpec[] {
  const specs: SuiteSpec[] = []
  if (opts.wave === '5' || opts.wave === 'all') {
    for (const relPath of WAVE5_SUITES) {
      specs.push({ wave: '5', relPath })
    }
  }
  if (opts.wave === '6' || opts.wave === 'all') {
    for (const relPath of WAVE6_SUITES) {
      specs.push({ wave: '6', relPath })
    }
  }
  if (opts.suiteFilter !== null && opts.suiteFilter.length > 0) {
    const needle = opts.suiteFilter.toLowerCase()
    return specs.filter(s => s.relPath.toLowerCase().includes(needle))
  }
  return specs
}

function parseProbeOutput(stdout: string): {
  readonly metrics: ProbeMetrics | null
  readonly strippedStdout: string
} {
  const lines = stdout.split(/\r?\n/)
  const cleanLines: string[] = []
  let metrics: ProbeMetrics | null = null

  for (const line of lines) {
    const markerIdx = line.indexOf(METRICS_PREFIX)
    if (markerIdx !== -1) {
      const jsonStr = line.slice(markerIdx + METRICS_PREFIX.length).trim()
      const before = line.slice(0, markerIdx)
      if (before.length > 0) {
        cleanLines.push(before)
      }
      try {
        const parsed = JSON.parse(jsonStr) as {
          readonly rssMb?: unknown
          readonly heapMb?: unknown
          readonly ms?: unknown
        }
        if (
          typeof parsed.rssMb === 'number' &&
          Number.isFinite(parsed.rssMb) &&
          typeof parsed.heapMb === 'number' &&
          Number.isFinite(parsed.heapMb) &&
          typeof parsed.ms === 'number' &&
          Number.isFinite(parsed.ms)
        ) {
          metrics = {
            rssMb: parsed.rssMb,
            heapMb: parsed.heapMb,
            ms: parsed.ms,
          }
        }
      } catch {
        // Ignore malformed marker line; fail-closed checks handle missing metrics.
      }
    } else {
      cleanLines.push(line)
    }
  }

  return {
    metrics,
    strippedStdout: cleanLines.join('\n'),
  }
}

function findUnmaskedGateFailure(stdout: string, stderr: string): string | null {
  const combined = `${stdout}\n${stderr}`
  const lines = combined.split(/\r?\n/)
  for (const line of lines) {
    if (/^\s*\[FAIL\]\b/.test(line)) {
      return line.trim()
    }
    if (/^\s*(?:HARD\s+)?ASSERTION FAILED:/.test(line)) {
      return line.trim()
    }
    if (/^\s*RESULT:\s*FAILED\b/.test(line)) {
      return line.trim()
    }
  }
  return null
}

function tailLines(text: string, maxLines = 15): string {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trimEnd())
    .filter(l => l.length > 0)
  return lines.slice(-maxLines).join('\n')
}

// =================================================================================================
// STAGE 1: STRICT TYPECHECK
// =================================================================================================

function runStage1Typecheck(
  tscBin: ToolCommand,
  selectedSuites: readonly SuiteSpec[],
  timeoutMs: number,
): { readonly ok: boolean; readonly ms: number; readonly detail: string } {
  console.log('\n=================================================================================')
  console.log('STAGE 1: STRICT TYPECHECK (tsconfig.check.json + strict verify/Wave-6 audit)')
  console.log('=================================================================================')

  const t0 = performance.now()
  const typecheckTimeout = Math.max(120_000, timeoutMs * 4)

  const checkRes = spawnSync(
    tscBin.cmd,
    [...tscBin.prefixArgs, '--noEmit', '-p', join(ROOT_DIR, 'tsconfig.check.json')],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      timeout: typecheckTimeout,
      maxBuffer: 32 * 1024 * 1024,
    },
  )

  if (checkRes.error || checkRes.status !== 0) {
    const ms = Number((performance.now() - t0).toFixed(1))
    const errText = checkRes.error
      ? checkRes.error.message
      : tailLines(`${checkRes.stdout ?? ''}\n${checkRes.stderr ?? ''}`, 25)
    console.log(`  [FAIL] tsconfig.check.json failed (${ms} ms)`)
    if (errText.length > 0) console.log(errText)
    return { ok: false, ms, detail: `tsconfig.check.json exit=${String(checkRes.status)}` }
  }

  // Explicitly enforce --strict --noUncheckedIndexedAccess on verify harness + existing Wave-6 suites
  const strictTargets: string[] = [
    join(ROOT_DIR, 'code/verify/mutant.ts'),
    join(ROOT_DIR, 'code/verify/rss-probe.ts'),
    join(ROOT_DIR, 'task/check-verify.ts'),
  ]
  for (const s of selectedSuites) {
    if (s.wave === '6') {
      const abs = join(ROOT_DIR, s.relPath)
      if (existsSync(abs)) {
        strictTargets.push(abs)
      }
    }
  }

  const strictRes = spawnSync(
    tscBin.cmd,
    [
      ...tscBin.prefixArgs,
      '--noEmit',
      '--strict',
      '--noUncheckedIndexedAccess',
      '--module',
      'ESNext',
      '--target',
      'ES2022',
      '--moduleResolution',
      'bundler',
      '--types',
      'node',
      '--skipLibCheck',
      ...strictTargets,
    ],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      timeout: typecheckTimeout,
      maxBuffer: 32 * 1024 * 1024,
    },
  )

  const ms = Number((performance.now() - t0).toFixed(1))
  if (strictRes.error || strictRes.status !== 0) {
    const errText = strictRes.error
      ? strictRes.error.message
      : tailLines(`${strictRes.stdout ?? ''}\n${strictRes.stderr ?? ''}`, 25)
    console.log(`  [FAIL] strict --noUncheckedIndexedAccess check failed (${ms} ms)`)
    if (errText.length > 0) console.log(errText)
    return { ok: false, ms, detail: `strict target check exit=${String(strictRes.status)}` }
  }

  console.log(
    `  [PASS] tsconfig.check.json + strict (--strict --noUncheckedIndexedAccess on ${strictTargets.length} harness/Wave-6 files) | ${ms} ms`,
  )
  return { ok: true, ms, detail: `0 errors (${ms} ms)` }
}

// =================================================================================================
// STAGE 2: SEQUENTIAL LAPTOP-SAFE SUITE EXECUTION WITH RSS & TIMEOUT ENFORCEMENT
// =================================================================================================

function runSingleSuite(
  tsxBin: ToolCommand,
  probeUrl: string,
  spec: SuiteSpec,
  timeoutMs: number,
  maxRssMb: number,
): SuiteRunResult {
  const absPath = join(ROOT_DIR, spec.relPath)
  if (!existsSync(absPath)) {
    return {
      wave: spec.wave,
      relPath: spec.relPath,
      passed: false,
      exitCode: null,
      signal: null,
      timedOut: false,
      wallMs: 0,
      metrics: null,
      failureReason: `missing suite file: ${spec.relPath}`,
      diagnosticTail: '',
    }
  }

  const startMs = performance.now()
  const res = spawnSync(
    tsxBin.cmd,
    [...tsxBin.prefixArgs, '--no-warnings=ExperimentalWarning', '--import', probeUrl, absPath],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 64 * 1024 * 1024,
    },
  )
  const wallMs = Number((performance.now() - startMs).toFixed(1))

  const rawStdout = res.stdout ?? ''
  const rawStderr = res.stderr ?? ''
  const { metrics, strippedStdout } = parseProbeOutput(rawStdout)

  const errCode = (res.error as NodeJS.ErrnoException | undefined)?.code
  const timedOut = errCode === 'ETIMEDOUT' || (res.signal === 'SIGTERM' && wallMs >= timeoutMs * 0.95)

  let failureReason: string | null = null
  if (timedOut) {
    failureReason = `timeout exceeded (${wallMs} ms > ${timeoutMs} ms)`
  } else if (res.error) {
    failureReason = `spawn error: ${res.error.message}`
  } else if (res.signal !== null) {
    failureReason = `terminated by signal ${res.signal}`
  } else if (res.status !== 0) {
    failureReason = `non-zero exit code ${String(res.status)}`
  } else if (metrics === null) {
    failureReason = 'missing __VIBE_METRICS__ telemetry from rss-probe'
  } else if (metrics.rssMb > maxRssMb) {
    failureReason = `RSS budget exceeded (${metrics.rssMb.toFixed(2)} MB > ${maxRssMb} MB)`
  } else {
    const unmasked = findUnmaskedGateFailure(strippedStdout, rawStderr)
    if (unmasked !== null) {
      failureReason = `unmasked gate failure: ${unmasked}`
    }
  }

  const passed = failureReason === null
  const diagnosticTail = passed ? '' : tailLines(`${strippedStdout}\n${rawStderr}`, 15)

  return {
    wave: spec.wave,
    relPath: spec.relPath,
    passed,
    exitCode: res.status,
    signal: res.signal,
    timedOut,
    wallMs,
    metrics,
    failureReason,
    diagnosticTail,
  }
}

function runStage2Suites(
  tsxBin: ToolCommand,
  suites: readonly SuiteSpec[],
  opts: CliOptions,
): {
  readonly ok: boolean
  readonly results: SuiteRunResult[]
  readonly totalWallMs: number
  readonly peakRssMb: number
} {
  console.log('\n=================================================================================')
  console.log(
    `STAGE 2: SEQUENTIAL VERIFICATION SUITES (wave=${opts.wave}, count=${suites.length}, maxRss=${opts.maxRssMb} MB, timeout=${opts.timeoutMs} ms)`,
  )
  console.log('=================================================================================')

  const probePath = join(ROOT_DIR, 'code/verify/rss-probe.ts')
  const probeUrl = pathToFileURL(probePath).href

  const results: SuiteRunResult[] = []
  let peakRssMb = 0
  let totalWallMs = 0

  for (let i = 0; i < suites.length; i++) {
    const spec = suites[i]!
    const r = runSingleSuite(tsxBin, probeUrl, spec, opts.timeoutMs, opts.maxRssMb)
    results.push(r)
    totalWallMs += r.wallMs
    if (r.metrics !== null && r.metrics.rssMb > peakRssMb) {
      peakRssMb = r.metrics.rssMb
    }

    const idxTag = `${String(i + 1).padStart(2)}/${String(suites.length).padStart(2)}`
    const statusTag = r.passed ? 'PASS' : 'FAIL'
    const rssStr = r.metrics !== null ? `${r.metrics.rssMb.toFixed(1)} MB` : 'n/a'
    const heapStr = r.metrics !== null ? `${r.metrics.heapMb.toFixed(1)} MB` : 'n/a'
    console.log(
      `  [${statusTag}] ${idxTag} [W${r.wave}] ${r.relPath.padEnd(56)} | ${r.wallMs.toFixed(0).padStart(5)} ms | RSS ${rssStr.padStart(8)} | Heap ${heapStr.padStart(8)}`,
    )
    if (!r.passed) {
      console.log(`         Reason: ${r.failureReason ?? 'unknown failure'}`)
      if (r.diagnosticTail.length > 0) {
        for (const line of r.diagnosticTail.split('\n')) {
          console.log(`         | ${line}`)
        }
      }
    }
  }

  const passedCount = results.filter(r => r.passed).length
  const ok = passedCount === results.length
  console.log(
    `\n  Stage 2 summary: ${passedCount}/${results.length} suites passed | total wall ${(totalWallMs / 1000).toFixed(2)} s | peak RSS ${peakRssMb.toFixed(2)} MB (budget ${opts.maxRssMb} MB)`,
  )

  return { ok, results, totalWallMs, peakRssMb }
}

// =================================================================================================
// STAGE 3: AUTOMATED IN-MEMORY MUTANT NEGATIVE-CONTROL HARNESS (M1..M7, 0/7 SURVIVORS REQUIRED)
// =================================================================================================

type C2 = readonly [number, number]
const cAdd = (a: C2, b: C2): C2 => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C2, b: C2): C2 => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C2, b: C2): C2 => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C2): C2 => [a[0], -a[1]]
const cScale = (s: number, a: C2): C2 => [s * a[0], s * a[1]]
const cAbs = (a: C2): number => Math.hypot(a[0], a[1])
const cAbs2 = (a: C2): number => a[0] * a[0] + a[1] * a[1]

interface DenseCMat {
  readonly n: number
  readonly re: Float64Array
  readonly im: Float64Array
}

function matZero(n: number): DenseCMat {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

function matEye(n: number): DenseCMat {
  const m = matZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}

function matAdd(a: DenseCMat, b: DenseCMat, scaleB = 1): DenseCMat {
  const n = a.n
  const out = matZero(n)
  for (let i = 0; i < n * n; i++) {
    out.re[i] = a.re[i]! + scaleB * b.re[i]!
    out.im[i] = a.im[i]! + scaleB * b.im[i]!
  }
  return out
}

function matScale(s: number, a: DenseCMat): DenseCMat {
  const out = matZero(a.n)
  for (let i = 0; i < a.re.length; i++) {
    out.re[i] = s * a.re[i]!
    out.im[i] = s * a.im[i]!
  }
  return out
}

function matMul(a: DenseCMat, b: DenseCMat): DenseCMat {
  const n = a.n
  const out = matZero(n)
  for (let i = 0; i < n; i++) {
    const iOff = i * n
    for (let k = 0; k < n; k++) {
      const ar = a.re[iOff + k]!
      const ai = a.im[iOff + k]!
      if (ar === 0 && ai === 0) continue
      const kOff = k * n
      for (let j = 0; j < n; j++) {
        const br = b.re[kOff + j]!
        const bi = b.im[kOff + j]!
        out.re[iOff + j] = out.re[iOff + j]! + (ar * br - ai * bi)
        out.im[iOff + j] = out.im[iOff + j]! + (ar * bi + ai * br)
      }
    }
  }
  return out
}

function matDag(a: DenseCMat): DenseCMat {
  const n = a.n
  const out = matZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[j * n + i] = a.re[i * n + j]!
      out.im[j * n + i] = -a.im[i * n + j]!
    }
  }
  return out
}

function matFrobSq(a: DenseCMat): number {
  let s = 0
  for (let i = 0; i < a.re.length; i++) {
    s += a.re[i]! * a.re[i]! + a.im[i]! * a.im[i]!
  }
  return s
}

function assertControl(cond: boolean, msg: string): void {
  if (!cond) {
    throw new Error(`Unmutated control failed: ${msg}`)
  }
}

function buildMutantCases(tsxBin: ToolCommand, timeoutMs: number): MutantCase[] {
  return [
    // ---------------------------------------------------------------------------------------------
    // M1: SO(5) custodial sign flip T_Z = g^2 L_2 - g'^2 R_2 -> + g'^2 R_2
    // ---------------------------------------------------------------------------------------------
    {
      id: 'M1',
      name: 'SO(5) custodial sign flip',
      description: 'T_Z = g^2 L_2 + g\'^2 R_2 breaks custodial rho = M_W^2/(M_Z^2 cos^2 theta_W) = 1',
      run: () => {
        const mkJ6 = (a: number, b: number): DenseCMat => {
          const m = matZero(6)
          m.im[a * 6 + b] = -1
          m.im[b * 6 + a] = 1
          return m
        }
        const L0 = matScale(0.5, matAdd(mkJ6(1, 2), mkJ6(0, 3), 1))
        const L2 = matScale(0.5, matAdd(mkJ6(0, 1), mkJ6(2, 3), 1))
        const R2 = matScale(0.5, matAdd(mkJ6(0, 1), mkJ6(2, 3), -1))

        // Orbifold round-trip Wilson line W(theta_H) = exp(i * 2 theta_H * J^{34})
        const thetaH = PI / 4
        const W = matEye(6)
        const c = Math.cos(2 * thetaH)
        const s = Math.sin(2 * thetaH)
        W.re[3 * 6 + 3] = c
        W.re[3 * 6 + 4] = s
        W.re[4 * 6 + 3] = -s
        W.re[4 * 6 + 4] = c
        const Wd = matDag(W)

        const massSqOf = (op: DenseCMat): number => {
          const delta = matAdd(matMul(matMul(Wd, op), W), op, -1)
          return 0.125 * matFrobSq(delta)
        }

        const g = 0.652
        const sin2W = 0.2312
        const gp = g * Math.sqrt(sin2W / (1 - sin2W))
        const normEW = Math.hypot(g, gp)
        const cos2W = (g * g) / (g * g + gp * gp)

        const mWSq = massSqOf(matScale(g, L0))

        // Unmutated exact control: T_Z = (g^2 L_2 - g'^2 R_2) / sqrt(g^2 + g'^2)
        const tZExact = matScale(1 / normEW, matAdd(matScale(g * g, L2), matScale(gp * gp, R2), -1))
        const mZSqExact = massSqOf(tZExact)
        const rhoExact = mWSq / (mZSqExact * cos2W)
        assertControl(
          Math.abs(rhoExact - 1.0) < 1e-13,
          `M1 exact SO(5) rho=${rhoExact} must equal 1`,
        )

        // Mutant: flip sign to T_Z_mut = (g^2 L_2 + g'^2 R_2) / sqrt(g^2 + g'^2)
        const tZMut = matScale(1 / normEW, matAdd(matScale(g * g, L2), matScale(gp * gp, R2), 1))
        const mZSqMut = massSqOf(tZMut)
        const rhoMut = mWSq / (mZSqMut * cos2W)
        assertNumericMutantRejected(rhoMut, 1.0, 0.05, 'M1 SO(5) custodial rho')
      },
    },

    // ---------------------------------------------------------------------------------------------
    // M2: D_4 Villain self-duality fallacy c_kin(K^*) = c_kin(K) = 2 instead of 1/2
    // ---------------------------------------------------------------------------------------------
    {
      id: 'M2',
      name: 'D_4 Villain self-duality fallacy',
      description: 'Setting c_kin(K^*) = c_kin(K) = 2 violates c_kin(K)*c_kin(K^*) = 1 and alpha_sd^-1 = 2',
      run: () => {
        const roots: [number, number, number, number][] = []
        for (let i = 0; i < 4; i++) {
          for (let j = i + 1; j < 4; j++) {
            for (const s1 of [-1, 1]) {
              for (const s2 of [-1, 1]) {
                const v: [number, number, number, number] = [0, 0, 0, 0]
                v[i] = s1
                v[j] = s2
                roots.push(v)
              }
            }
          }
        }
        let sumArea01SqPairs = 0
        for (let i = 0; i < roots.length; i++) {
          for (let j = i + 1; j < roots.length; j++) {
            const a = roots[i]!
            const b = roots[j]!
            if (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] !== 1) continue
            const a01 = 0.5 * (a[0] * b[1] - a[1] * b[0])
            sumArea01SqPairs += a01 * a01
          }
        }
        const cKinPrimal = 0.5 * (sumArea01SqPairs / 3)
        const betaSdDual = 1 / PI

        // Unmutated exact control: c_kin(K) = 2, c_kin(K^*) = 1/2
        const cKinDualExact = cKinPrimal / 4
        const prodExact = cKinPrimal * cKinDualExact
        const alphaSdDualExact = 4 * PI * cKinDualExact * betaSdDual
        assertControl(
          Math.abs(cKinPrimal - 2.0) < 1e-14 &&
            Math.abs(prodExact - 1.0) < 1e-14 &&
            Math.abs(alphaSdDualExact - 2.0) < 1e-14,
          `M2 exact D_4 duality control failed`,
        )

        // Mutant: falsely assume self-duality c_kin(K^*) = c_kin(K) = 2
        const cKinDualMut = cKinPrimal
        const prodMut = cKinPrimal * cKinDualMut
        const alphaSdDualMut = 4 * PI * cKinDualMut * betaSdDual
        assertNumericMutantRejected(prodMut, 1.0, 1e-9, 'M2 c_kin(K) * c_kin(K^*) = 1')
        assertNumericMutantRejected(alphaSdDualMut, 2.0, 1e-9, 'M2 continuum self-dual alpha_sd^-1 = 2')
      },
    },

    // ---------------------------------------------------------------------------------------------
    // M3: 2T_R character sign corruption chi_{2''}(C_1): -2 -> +2
    // ---------------------------------------------------------------------------------------------
    {
      id: 'M3',
      name: '2T_R character sign corruption',
      description: 'Flipping chi_{2\'\'}(C_1) from -2 to +2 violates <chi_1, chi_{2\'\'}> = 0',
      run: () => {
        const w: C2 = [-0.5, SQRT3 / 2]
        const w2: C2 = [-0.5, -SQRT3 / 2]
        const C0: C2 = [0, 0]
        const C1: C2 = [1, 0]
        const classSizes: readonly number[] = [1, 1, 6, 4, 4, 4, 4]

        const irreps: readonly (readonly C2[])[] = [
          [C1, C1, C1, C1, C1, C1, C1], // 1
          [C1, C1, C1, w, w2, w2, w], // 1'
          [C1, C1, C1, w2, w, w, w2], // 1''
          [[3, 0], [3, 0], [-1, 0], C0, C0, C0, C0], // 3
          [[2, 0], [-2, 0], C0, [-1, 0], [-1, 0], C1, C1], // 2
          [[2, 0], [-2, 0], C0, cScale(-1, w), cScale(-1, w2), w2, w], // 2'
          [[2, 0], [-2, 0], C0, cScale(-1, w2), cScale(-1, w), w, w2], // 2''
        ]

        const inner2T = (a: readonly C2[], b: readonly C2[]): C2 => {
          let acc: C2 = C0
          for (let c = 0; c < 7; c++) {
            acc = cAdd(acc, cScale(classSizes[c]!, cMul(cConj(a[c]!), b[c]!)))
          }
          return cScale(1 / 24, acc)
        }

        // Unmutated exact 7x7 orthogonality control
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            const expected: C2 = i === j ? C1 : C0
            assertControl(
              cAbs(cSub(inner2T(irreps[i]!, irreps[j]!), expected)) < 1e-13,
              `M3 unmutated 2T_R orthogonality failed at (${i},${j})`,
            )
          }
        }

        // Mutant: flip chi_{2''}(C_1) from -2 to +2
        const chi1 = irreps[0]!
        const chi2ppMut = irreps[6]!.slice()
        chi2ppMut[1] = [2, 0]
        const innerMut = inner2T(chi1, chi2ppMut)
        assertNumericMutantRejected(
          cAbs(innerMut),
          0,
          1e-9,
          'M3 2T_R orthogonality <chi_1, chi_{2\'\'}> = 0',
        )
      },
    },

    // ---------------------------------------------------------------------------------------------
    // M4: Z_6 SM hypercharge shift Q_L 6Y: +1 -> +2
    // ---------------------------------------------------------------------------------------------
    {
      id: 'M4',
      name: 'Z_6 SM hypercharge shift',
      description: 'Mutating Q_L 6Y: +1 -> +2 violates both (2t+3d+6Y) mod 6 == 0 and U(1)_Y^3 anomaly = 0',
      run: () => {
        interface Multiplet {
          readonly label: string
          readonly t: number // SU(3)_C triality mod 3
          readonly d: number // SU(2)_L 2*j_L mod 2
          readonly dim: number
          readonly sixY: number
        }

        const smExact: readonly Multiplet[] = [
          { label: 'Q_L', t: 1, d: 1, dim: 6, sixY: 1 },
          { label: 'u_R^c', t: 2, d: 0, dim: 3, sixY: -4 },
          { label: 'd_R^c', t: 2, d: 0, dim: 3, sixY: 2 },
          { label: 'L_L', t: 0, d: 1, dim: 2, sixY: -3 },
          { label: 'e_R^c', t: 0, d: 0, dim: 1, sixY: 6 },
          { label: 'nu_R^c', t: 0, d: 0, dim: 1, sixY: 0 },
        ]

        const checkZ6 = (rows: readonly Multiplet[]): boolean =>
          rows.every(r => (((2 * r.t + 3 * r.d + r.sixY) % 6) + 6) % 6 === 0)

        const evalU1Y3Anomaly = (rows: readonly Multiplet[]): number => {
          let sum = 0
          for (const r of rows) {
            const y = r.sixY / 6
            sum += r.dim * y * y * y
          }
          return sum
        }

        // Unmutated exact control
        assertControl(checkZ6(smExact), 'M4 unmutated Z_6 compatibility failed')
        assertControl(Math.abs(evalU1Y3Anomaly(smExact)) < 1e-14, 'M4 unmutated U(1)_Y^3 anomaly failed')

        // Mutant: shift Q_L 6Y from +1 to +2
        const smMut: Multiplet[] = smExact.map(r => (r.label === 'Q_L' ? { ...r, sixY: 2 } : r))
        assertMutantRejected(() => checkZ6(smMut), 'M4 Z_6 quotient (2t + 3d + 6Y) mod 6 == 0')
        assertNumericMutantRejected(
          evalU1Y3Anomaly(smMut),
          0,
          1e-12,
          'M4 U(1)_Y^3 anomaly cancellation sum d_i Y_i^3 = 0',
        )
      },
    },

    // ---------------------------------------------------------------------------------------------
    // M5: Half-coin unitarity (|C_diag|^2 = 1/4 -> 1/3) & Z_2 line-parity corruption
    // ---------------------------------------------------------------------------------------------
    {
      id: 'M5',
      name: 'Half-coin unitarity & Z_2 line-parity',
      description: 'Perturbing |C_diag|^2 = 1/4 -> 1/3 breaks U^dag U = I; flipping 1 bit breaks Z_2 line parity',
      run: () => {
        // Exact Vibe coin C = D^2 with |C_diag|^2 = 1/4, |C_off|^2 = 3/4
        const cDiag: C2 = [0.25, SQRT3 / 4]
        const cOff: C2 = [0.75, -SQRT3 / 4]
        const dDiag: C2 = [0.75, SQRT3 / 4]
        const dOff: C2 = [0.25, -SQRT3 / 4]

        const unitaryErr2x2 = (a: C2, b: C2): number => {
          // Symmetric 2x2 matrix [[a, b], [b, a]]
          const diag00 = cAbs2(a) + cAbs2(b) - 1
          const off01 = cAdd(cMul(cConj(a), b), cMul(cConj(b), a))
          return Math.hypot(diag00, diag00, cAbs(off01), cAbs(off01))
        }

        // Unmutated exact controls
        assertControl(Math.abs(cAbs2(cDiag) - 0.25) < 1e-15, 'M5 |C_diag|^2 != 1/4')
        assertControl(unitaryErr2x2(dDiag, dOff) < 1e-14, 'M5 exact D unitarity failed')
        assertControl(unitaryErr2x2(cDiag, cOff) < 1e-14, 'M5 exact C unitarity failed')

        // Mutant 5a: perturb |C_diag|^2 = 1/4 -> 1/3 (and also verify on U_half D_off: 1/4 -> 1/3)
        const scaleFactor = Math.sqrt((1 / 3) / (1 / 4))
        const cDiagMut = cScale(scaleFactor, cDiag)
        const dOffMut = cScale(scaleFactor, dOff)
        assertNumericMutantRejected(
          unitaryErr2x2(cDiagMut, cOff),
          0,
          1e-6,
          'M5a coin unitarity ||U^dag U - I||_F (|C_diag|^2: 1/4 -> 1/3)',
        )
        assertNumericMutantRejected(
          unitaryErr2x2(dDiag, dOffMut),
          0,
          1e-6,
          'M5a half-coin unitarity ||U_half^dag U_half - I||_F (|D_off|^2: 1/4 -> 1/3)',
        )

        // Mutant 5b: Z_2 line-parity conservation across all 12 antipodal D_4 lines
        // Under M_pair, occupations move in antipodal pairs (delta = +-2 on source/target lines),
        // strictly preserving P_l = N_l mod 2 for every line l in 0..11.
        const lineCountsBefore = new Int32Array(12)
        lineCountsBefore[0] = 2 // antipodal pair on line 0
        const lineCountsValidAfter = new Int32Array(12)
        lineCountsValidAfter[1] = 2 // pair scattered to line 1

        const checkLineParityConserved = (before: Int32Array, after: Int32Array): boolean => {
          for (let l = 0; l < 12; l++) {
            if ((before[l]! & 1) !== (after[l]! & 1)) return false
          }
          return true
        }

        assertControl(
          checkLineParityConserved(lineCountsBefore, lineCountsValidAfter),
          'M5b valid M_pair transition failed Z_2 parity check',
        )

        // Flip 1 parity bit (single-particle leakage across line 0 -> line 1)
        const lineCountsMut = Int32Array.from(lineCountsValidAfter)
        lineCountsMut[0] = lineCountsMut[0]! ^ 1
        assertMutantRejected(
          () => checkLineParityConserved(lineCountsBefore, lineCountsMut),
          'M5b Z_2 line-parity conservation',
        )
      },
    },

    // ---------------------------------------------------------------------------------------------
    // M6: Wolpert-Krakauer R_1 U R_2 transitivity & E-HLG-0043 lumpability mutant
    // ---------------------------------------------------------------------------------------------
    {
      id: 'M6',
      name: 'Wolpert-Krakauer union & E-HLG-0043 lumpability',
      description: 'Raw union R_1 U R_2 breaks transitivity on Fin 3; Phi=[0,0,1], f=[0,2,2] breaks lumpability',
      run: () => {
        type Rel = (a: number, b: number) => boolean
        const isTransitive = (rel: Rel, n: number): boolean => {
          for (let a = 0; a < n; a++) {
            for (let b = 0; b < n; b++) {
              if (!rel(a, b)) continue
              for (let c = 0; c < n; c++) {
                if (rel(b, c) && !rel(a, c)) return false
              }
            }
          }
          return true
        }

        // Partition R1 = {{0,1}, {2}}, Partition R2 = {{0}, {1,2}}
        const r1: Rel = (a, b) => a === b || (a <= 1 && b <= 1)
        const r2: Rel = (a, b) => a === b || (a >= 1 && b >= 1)
        const rUnion: Rel = (a, b) => r1(a, b) || r2(a, b)

        assertControl(isTransitive(r1, 3) && isTransitive(r2, 3), 'M6a R1/R2 transitivity control failed')
        assertControl(rUnion(0, 1) && rUnion(1, 2) && !rUnion(0, 2), 'M6a witness (0,1)&(1,2)=>!(0,2) failed')
        assertMutantRejected(
          () => isTransitive(rUnion, 3),
          'M6a Wolpert-Krakauer R_1 U R_2 transitivity on Fin 3',
        )

        // E-HLG-0043 3-state coarse-graining lumpability
        const isLumpable = (phi: readonly number[], f: readonly number[]): boolean => {
          for (let a = 0; a < phi.length; a++) {
            for (let b = a + 1; b < phi.length; b++) {
              if (phi[a] === phi[b] && phi[f[a]!] !== phi[f[b]!]) {
                return false
              }
            }
          }
          return true
        }

        const phi: readonly number[] = [0, 0, 1]
        const fLumpable: readonly number[] = [0, 0, 2]
        const fNonLumpable: readonly number[] = [0, 2, 2]

        assertControl(isLumpable(phi, fLumpable), 'M6b lumpable control failed')
        assertControl(phi[fNonLumpable[0]!] !== phi[fNonLumpable[1]!], 'M6b witness Phi(f(0)) != Phi(f(1)) failed')
        assertMutantRejected(
          () => isLumpable(phi, fNonLumpable),
          'M6b E-HLG-0043 lumpability Phi(f(0)) == Phi(f(1))',
        )
      },
    },

    // ---------------------------------------------------------------------------------------------
    // M7: Live in-memory source-mutation probe on sm-bare-radion-flavor-uv-audit.ts (ZERO disk writes)
    // ---------------------------------------------------------------------------------------------
    {
      id: 'M7',
      name: 'Live in-memory Wave-5 source mutation (U3.1)',
      description: 'In-memory cKinDual = cKinD4/4 -> cKinD4 piped to tsx stdin kills sm-bare-radion-flavor-uv-audit.ts',
      run: () => {
        const targetRel = 'test/verify/sm-bare-radion-flavor-uv-audit.ts'
        const targetAbs = join(ROOT_DIR, targetRel)
        const originalSrc = readFileSync(targetAbs, 'utf8')

        const needle = '  const cKinDual = cKinD4 / 4'
        const replacement = '  const cKinDual = cKinD4'
        const firstIdx = originalSrc.indexOf(needle)
        if (firstIdx === -1) {
          throw new Error(`M7 anchor not found in ${targetRel}: "${needle}"`)
        }
        if (originalSrc.indexOf(needle, firstIdx + 1) !== -1) {
          throw new Error(`M7 anchor is not unique in ${targetRel}: "${needle}"`)
        }

        const mutatedSrc =
          originalSrc.slice(0, firstIdx) + replacement + originalSrc.slice(firstIdx + needle.length)

        const res = spawnSync(
          tsxBin.cmd,
          [...tsxBin.prefixArgs, '--no-warnings=ExperimentalWarning', '-'],
          {
            cwd: ROOT_DIR,
            input: mutatedSrc,
            encoding: 'utf8',
            timeout: timeoutMs,
            maxBuffer: 16 * 1024 * 1024,
          },
        )

        if (res.error) {
          throw new Error(`M7 live probe execution error: ${res.error.message}`)
        }

        const combinedOutput = `${res.stdout ?? ''}\n${res.stderr ?? ''}`
        if (res.status !== 0) {
          const hitPhysicsGate =
            combinedOutput.includes('Gate U3.1 failed') ||
            combinedOutput.includes('ASSERTION FAILED')
          if (!hitPhysicsGate) {
            throw new Error(
              `M7 exited ${String(res.status)} without hitting Gate U3.1:\n${tailLines(combinedOutput, 10)}`,
            )
          }
        }
        assertMutantRejected(() => res.status === 0, 'M7 live in-memory U3.1 cKinDual mutation')
      },
    },
  ]
}

async function runStage3Mutants(
  tsxBin: ToolCommand,
  timeoutMs: number,
): Promise<{ readonly ok: boolean; readonly killed: number; readonly total: number }> {
  console.log('\n=================================================================================')
  console.log('STAGE 3: AUTOMATED IN-MEMORY MUTANT NEGATIVE-CONTROL HARNESS (7/7 KILL REQUIRED)')
  console.log('=================================================================================')

  const cases = buildMutantCases(tsxBin, timeoutMs)
  const summary = await runMutantSuite(cases)

  for (const r of summary.results) {
    const tag = r.killed ? 'KILL' : 'SURV'
    console.log(
      `  [${tag}] ${r.id} | ${r.name.padEnd(46)} | ${r.ms.toFixed(1).padStart(7)} ms | ${r.reason}`,
    )
  }

  console.log(
    `\n  Stage 3 summary: ${summary.killed}/${summary.total} mutants KILLED, ${summary.survived} survivors`,
  )
  return {
    ok: summary.survived === 0 && summary.killed === summary.total,
    killed: summary.killed,
    total: summary.total,
  }
}

// =================================================================================================
// MAIN ENTRY
// =================================================================================================

async function main(): Promise<void> {
  const globalStartMs = performance.now()
  let opts: CliOptions
  try {
    opts = parseArgs(process.argv.slice(2))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[FAIL] CLI error: ${msg}`)
    process.exit(1)
  }

  const tscBin = resolveLocalBin('tsc')
  const tsxBin = resolveLocalBin('tsx')
  const selectedSuites = selectSuites(opts)

  console.log('=================================================================================')
  console.log('VIBE VERIFICATION REGRESSION GATE & MUTANT HARNESS')
  console.log('=================================================================================')
  console.log(
    `  Wave=${opts.wave} | Suites=${selectedSuites.length}${opts.suiteFilter ? ` (filter="${opts.suiteFilter}")` : ''} | maxRss=${opts.maxRssMb} MB | timeout=${opts.timeoutMs} ms`,
  )

  if (selectedSuites.length === 0) {
    console.error(
      `[FAIL] No suites matched selection (wave=${opts.wave}, suite=${opts.suiteFilter ?? 'none'})`,
    )
    process.exit(1)
  }

  // Fail-closed existence check before executing suites
  const missingSuites = selectedSuites.filter(s => !existsSync(join(ROOT_DIR, s.relPath)))
  if (missingSuites.length > 0) {
    for (const m of missingSuites) {
      console.error(`[FAIL] Missing required Wave-${m.wave} suite: ${m.relPath}`)
    }
    process.exit(1)
  }

  let allOk = true

  // Stage 1: Strict Typecheck
  if (opts.skipTypecheck) {
    console.log('\n[SKIP] Stage 1 (typecheck skipped via --skip-typecheck)')
  } else {
    const s1 = runStage1Typecheck(tscBin, selectedSuites, opts.timeoutMs)
    if (!s1.ok) allOk = false
  }

  // Stage 2: Sequential Suites
  const s2 = runStage2Suites(tsxBin, selectedSuites, opts)
  if (!s2.ok) allOk = false

  // Stage 3: Mutant Harness
  let mutantLine = 'skipped'
  if (opts.skipMutants) {
    console.log('\n[SKIP] Stage 3 (mutant harness skipped via --skip-mutants)')
  } else {
    const s3 = await runStage3Mutants(tsxBin, opts.timeoutMs)
    mutantLine = `${s3.killed}/${s3.total} killed`
    if (!s3.ok) allOk = false
  }

  const totalSec = ((performance.now() - globalStartMs) / 1000).toFixed(2)
  const passedSuites = s2.results.filter(r => r.passed).length

  console.log('\n=================================================================================')
  console.log(
    `FINAL GATE VERDICT: ${allOk ? 'PASS' : 'FAIL'} | suites=${passedSuites}/${s2.results.length} | peakRss=${s2.peakRssMb.toFixed(2)} MB | mutants=${mutantLine} | elapsed=${totalSec} s`,
  )
  console.log('=================================================================================')

  if (!allOk) {
    process.exit(1)
  }
}

void main()

export {}
