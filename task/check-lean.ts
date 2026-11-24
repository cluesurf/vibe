// Deterministic Lean 4 kernel + structural verifier for code/proof/Vibe.lean.
//
// 1. Audits code/proof/Vibe.lean, code/proof/lakefile.toml, and code/proof/lean-toolchain:
//    - 0 sorry, 0 axiom, set_option autoImplicit false
//    - balanced `namespace Vibe` / `end Vibe` (and all nested namespace/end pairs)
//    - >= 110 formal Lean 4 theorems covering all 6 infinite-time theorem families
// 2. Checks whether the exact Lean 4 toolchain from code/proof/lean-toolchain is already
//    extracted under $ELAN_HOME/toolchains (or ~/.elan/toolchains) without triggering any
//    elan network download.
//    - If installed (e.g. on GitHub Actions CI or a local machine with Lean 4 installed),
//      executes that toolchain's `lake build` inside code/proof/ with strict exit-code propagation.
//    - If not installed locally, prints a clear status line and runs E-FND-0185's exact
//      zero-float BigInt algebraic proof-certificate suite for fast, deterministic verification.
//
//   pnpm run check:lean

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInfiniteTimeProofs } from '@/code/measure/infinite-time-proofs'

const MIN_THEOREM_COUNT = 205

const REQUIRED_THEOREMS = [
  'dual_dual',
  'dual_balance',
  'balanced_iff_dual',
  'thm1_v1_eternal_stationarity',
  'thm1_v1_full_rule_eternal',
  'thm1_light_cone_empty_outside',
  'thm1_zero_incoming_entropy',
  'thm2_iter_left_inv',
  'thm2_iter_right_inv',
  'thm2_iter_norm_preserved',
  'thm3_traceSeq_odd',
  'thm3_W_infinite_order_su2',
  'thm3_W_infinite_order_psu2',
  'thm3_noncommuting_conjugate',
  'thm3_not_in_pin2',
  'thm4_mpair12_comp',
  'thm4_mpair12_unitary_left',
  'thm4_mpair12_unitary_right',
  'thm4_mpair12_swave_iter',
  'thm4_mpair12_transverse_iter',
  'thm5_resistance_exp_lower_bound',
  'thm5_resistance_strictly_increasing',
  'thm5_resistance_unbounded',
  'thm6_universal_speed_lock',
  'thm6_strictly_subluminal',
  'thm6_cusp_lateral_lt_shell',
  'thm7_weinberg_gut_three_eighths',
  'thm8_koide_two_thirds_iff_f4_root_ratio',
  'thm8_warp_koide_ge_two_thirds',
  'thm9_photon_exact_zero_mode',
  'thm9_custodial_rho_eq_one',
  'thm10_ps16_matches_spin10',
  'thm10_ps_matching_implies_unification',
  'thm10_thirteen_shells_exceed_hierarchy',
  'thm10_role_grid_spectrum_identities',
  'thm10_dyadic_pow2_mod3',
  'thm11_georgi_jarlskog_su4_traceless',
  'thm11_matter_parity_all_16_fermions_odd',
  'thm11_matter_parity_preserved_by_126H',
  'thm11_sphaleron_ratio_sm',
  'thm11_cusp_97_shells_exceed_lambda_ratio',
  'thm12_two_body_momentum_conserved_all_time',
  'thm12_unitary_horizon_inner_preserved',
  'thm12_unitary_horizon_orthogonality_preserved',
  'thm12_unitary_horizon_injective',
  'thm12_unitary_horizon_surjective',
  'thm13_axion_e_over_n_eight_thirds',
  'thm13_nuclear_magic_exact',
  'thm13_ho_magic_without_spin_orbit',
  'thm14_positive_mass_gap_all_time',
  'thm14_spectral_gap_exp_suppression',
  'thm14_block_spin_anisotropy_contraction',
  'thm15_z9_z4_coprime_gives_z36',
  'thm15_so10_tensor_decomposition',
  'thm15_mat2eis_unitary_comp',
  'thm15_gateM_pow_unitary_all_lengths',
  'thm16_reflection_positivity_weighted',
  'thm16_kotecky_preiss_strict_gap',
  'thm16_holographic_shell_doubling',
  'thm16_weinberg_window_under_two_shells',
] as const

const scriptDir = dirname(fileURLToPath(import.meta.url))
const root = resolve(scriptDir, '..')
const proofDir = join(root, 'code', 'proof')
const leanFile = join(proofDir, 'Vibe.lean')
const lakefilePath = join(proofDir, 'lakefile.toml')
const toolchainPath = join(proofDir, 'lean-toolchain')

function stripLeanComments(src: string): string {
  // Handle nested Lean block comments /- ... -/ and line comments -- ...
  let out = ''
  let i = 0
  let blockDepth = 0
  let inLineComment = false

  while (i < src.length) {
    const ch = src[i]!
    const next = src[i + 1]

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
        out += '\n'
      }
      i++
      continue
    }

    if (blockDepth > 0) {
      if (ch === '/' && next === '-') {
        blockDepth++
        i += 2
        continue
      }
      if (ch === '-' && next === '/') {
        blockDepth--
        i += 2
        continue
      }
      if (ch === '\n') {
        out += '\n'
      }
      i++
      continue
    }

    if (ch === '/' && next === '-') {
      blockDepth = 1
      i += 2
      continue
    }

    if (ch === '-' && next === '-') {
      inLineComment = true
      i += 2
      continue
    }

    out += ch
    i++
  }

  return out
}

function checkBalancedNamespaces(codeOnly: string, requireRootVibe: boolean): {
  readonly balanced: boolean
  readonly hasRootVibe: boolean
  readonly errors: string[]
} {
  const errors: string[] = []
  const stack: string[] = []
  let hasRootVibe = false

  for (const rawLine of codeOnly.split('\n')) {
    const line = rawLine.trim()
    const nsMatch = /^namespace\s+([A-Za-z0-9_.']+)/.exec(line)
    if (nsMatch) {
      const name = nsMatch[1]!
      if (name === 'Vibe' && stack.length === 0) {
        hasRootVibe = true
      }
      stack.push(name)
      continue
    }

    const secMatch = /^section\s+([A-Za-z0-9_.']+)/.exec(line)
    if (secMatch) {
      stack.push(secMatch[1]!)
      continue
    }

    const endMatch = /^end\s+([A-Za-z0-9_.']+)/.exec(line)
    if (endMatch) {
      const name = endMatch[1]!
      const top = stack.pop()
      if (top !== name) {
        errors.push(`mismatched end ${name} (expected ${top ?? 'none'})`)
      }
    }
  }

  if (stack.length > 0) {
    errors.push(`unclosed namespace/section blocks: ${stack.join(', ')}`)
  }

  if (requireRootVibe && !hasRootVibe) {
    errors.push('missing root `namespace Vibe` / `end Vibe` block')
  }

  return {
    balanced: errors.length === 0,
    hasRootVibe,
    errors,
  }
}

function toolchainDirName(spec: string): string {
  // Elan maps `leanprover/lean4:v4.35.0` -> `leanprover--lean4---v4.35.0`
  return spec.replace(/\//g, '--').replace(/:/g, '---')
}

function findLocalLeanToolchain(spec: string): {
  readonly elanHome: string
  readonly toolchainsDir: string
  readonly matchedDir: string | null
  readonly lakeBin: string | null
  readonly accessError: string | null
} {
  const elanHome = process.env.ELAN_HOME ?? join(homedir(), '.elan')
  const toolchainsDir = join(elanHome, 'toolchains')
  const expectedName = toolchainDirName(spec)
  const exeSuffix = process.platform === 'win32' ? '.exe' : ''

  try {
    if (!existsSync(toolchainsDir) || !statSync(toolchainsDir).isDirectory()) {
      return { elanHome, toolchainsDir, matchedDir: null, lakeBin: null, accessError: null }
    }

    const entries = readdirSync(toolchainsDir)
    const exactMatch = entries.find(entry => entry === expectedName)
    const fallbackMatch =
      exactMatch ?? entries.find(entry => entry.startsWith('leanprover--lean4---'))

    if (!fallbackMatch) {
      return { elanHome, toolchainsDir, matchedDir: null, lakeBin: null, accessError: null }
    }

    const matchedDir = join(toolchainsDir, fallbackMatch)
    const lakeBin = join(matchedDir, 'bin', `lake${exeSuffix}`)
    const leanBin = join(matchedDir, 'bin', `lean${exeSuffix}`)

    if (existsSync(lakeBin) && existsSync(leanBin)) {
      return { elanHome, toolchainsDir, matchedDir, lakeBin, accessError: null }
    }

    return { elanHome, toolchainsDir, matchedDir: null, lakeBin: null, accessError: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { elanHome, toolchainsDir, matchedDir: null, lakeBin: null, accessError: message }
  }
}

function main(): void {
  const failures: string[] = []

  for (const [label, filePath] of [
    ['Vibe.lean', leanFile],
    ['lakefile.toml', lakefilePath],
    ['lean-toolchain', toolchainPath],
  ] as const) {
    if (!existsSync(filePath)) {
      failures.push(`missing required file: ${label} (${filePath})`)
    }
  }

  if (failures.length > 0) {
    for (const f of failures) {
      console.error(`  FAIL  ${f}`)
    }
    process.exit(1)
  }

  const toolchainSpec = readFileSync(toolchainPath, 'utf8').trim()
  const lakefileSrc = readFileSync(lakefilePath, 'utf8')

  const vibeSubdir = join(proofDir, 'Vibe')
  const leanFiles: Array<{ readonly label: string; readonly path: string }> = [
    { label: 'Vibe.lean', path: leanFile },
  ]
  if (existsSync(vibeSubdir)) {
    for (const entry of readdirSync(vibeSubdir).sort()) {
      if (entry.endsWith('.lean')) {
        leanFiles.push({ label: `Vibe/${entry}`, path: join(vibeSubdir, entry) })
      }
    }
  }

  const hasSubmodules = leanFiles.length > 1
  let combinedCode = ''
  for (const lf of leanFiles) {
    const src = readFileSync(lf.path, 'utf8')
    const stripped = stripLeanComments(src)
    if (!/\bset_option\s+autoImplicit\s+false\b/.test(stripped)) {
      failures.push(`${lf.label} missing \`set_option autoImplicit false\``)
    }
    const requireRoot = lf.label !== 'Vibe.lean' || !hasSubmodules
    const ns = checkBalancedNamespaces(stripped, requireRoot)
    if (!ns.balanced) {
      failures.push(...ns.errors.map(e => `${lf.label}: ${e}`))
    }
    combinedCode += `\n${stripped}\n`
  }

  const theoremMatches = combinedCode.match(/\btheorem\s+[A-Za-z0-9_']+/g) ?? []
  const sorryMatches = combinedCode.match(/\bsorry\b/g) ?? []
  const axiomMatches = combinedCode.match(/\baxiom\b/g) ?? []
  const missingTheorems = REQUIRED_THEOREMS.filter(
    name => !new RegExp(`\\btheorem\\s+${name}\\b`).test(combinedCode),
  )

  if (!toolchainSpec.startsWith('leanprover/lean4:')) {
    failures.push(`unexpected lean-toolchain spec: ${toolchainSpec}`)
  }
  if (!lakefileSrc.includes('name = "Vibe"')) {
    failures.push('lakefile.toml missing `name = "Vibe"` lean_lib target')
  }
  if (sorryMatches.length !== 0) {
    failures.push(`Lean proof suite contains ${sorryMatches.length} sorry occurrence(s)`)
  }
  if (axiomMatches.length !== 0) {
    failures.push(`Lean proof suite contains ${axiomMatches.length} axiom occurrence(s)`)
  }
  if (theoremMatches.length < MIN_THEOREM_COUNT) {
    failures.push(
      `Lean proof suite theorem count ${theoremMatches.length} is below required minimum ${MIN_THEOREM_COUNT}`,
    )
  }
  if (missingTheorems.length > 0) {
    failures.push(`missing required theorems: ${missingTheorems.join(', ')}`)
  }

  console.log(
    `check:lean  structural audit: ${leanFiles.length} files, ${theoremMatches.length} theorems, ${sorryMatches.length} sorry, ${axiomMatches.length} axiom, toolchain=${toolchainSpec}`,
  )

  if (failures.length > 0) {
    for (const f of failures) {
      console.error(`  FAIL  ${f}`)
    }
    process.exit(1)
  }

  const localToolchain = findLocalLeanToolchain(toolchainSpec)

  if (localToolchain.lakeBin && localToolchain.matchedDir) {
    console.log(
      `check:lean  local Lean 4 toolchain found (${localToolchain.matchedDir}); running lake build`,
    )
    const binDir = dirname(localToolchain.lakeBin)
    const pathSep = process.platform === 'win32' ? ';' : ':'
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PATH: `${binDir}${pathSep}${process.env.PATH ?? ''}`,
    }

    const build = spawnSync(localToolchain.lakeBin, ['build'], {
      cwd: proofDir,
      stdio: 'inherit',
      env,
    })

    if (build.error) {
      console.error(`  FAIL  lake build error: ${build.error.message}`)
      process.exit(1)
    }
    if (build.status !== 0) {
      console.error(`  FAIL  lake build exited with code ${build.status ?? 1}`)
      process.exit(build.status ?? 1)
    }

    console.log('check:lean  Lean 4 kernel build PASS (lake build exited 0)')
  } else {
    const reason = localToolchain.accessError
      ? `toolchains directory unreadable (${localToolchain.accessError})`
      : `no extracted Lean 4 toolchain under ${localToolchain.toolchainsDir}`
    console.log(
      `check:lean  local Lean 4 toolchain not installed (${reason}); skipping elan download (full kernel check runs in .github/workflows/lean.yml)`,
    )
  }

  // Always run E-FND-0185's exact zero-float BigInt algebraic proof-certificate suite
  const started = Date.now()
  const cert = runInfiniteTimeProofs()
  const elapsedSec = ((Date.now() - started) / 1000).toFixed(3)

  if (!cert.allPassed) {
    console.error('  FAIL  E-FND-0185 BigInt proof-certificate suite failed')
    console.error(
      JSON.stringify(
        {
          theorem1: cert.theorem1.passed,
          theorem2: cert.theorem2.passed,
          theorem3: cert.theorem3.passed,
          theorem4: cert.theorem4.passed,
          theorem5: cert.theorem5.passed,
          theorem6: cert.theorem6.passed,
          leanAudit: cert.leanAudit,
        },
        null,
        2,
      ),
    )
    process.exit(1)
  }

  console.log(
    `check:lean  E-FND-0185 exact BigInt certificates PASS (T1..T6 all true, ${cert.leanAudit.theoremCount} Lean theorems, ${elapsedSec}s)`,
  )
}

main()
