// BUILD THE KERNEL: compile the Rust crate kernel/ into the native addon and the wasm module, and copy both to
// kernel/host/ (build output, gitignored by the host/ rule: generated, never edited, rebuilt from the crate).
//
//   pnpm call task/kernel/build.ts            both
//   pnpm call task/kernel/build.ts native     the addon only
//   pnpm call task/kernel/build.ts wasm       the wasm module only
//   pnpm call task/kernel/build.ts native hip        the addon with the AMD GPU binding (also cuda, emu, or hip,emu)
//
// The native target is the one node runs as (arm64 on Apple silicon), which need not be the toolchain's host: a
// toolchain built for x86_64 cross-compiles. When the target's std is not installed (rustup target list --installed),
// the build compiles std from source with -Z build-std, which needs a nightly toolchain and the rust-src component and
// installs nothing. The wasm module is built with SIMD128. Neither build contracts floating-point operations (rustc never
// does) or uses fast-math.

import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, renameSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const CRATE = fileURLToPath(new URL('../../kernel', import.meta.url))
const HOST = join(CRATE, 'host')
const TARGET_DIR = join(HOST, 'target')
const CARGO_BIN = join(homedir(), '.cargo', 'bin')
const cargo = join(CARGO_BIN, 'cargo')
const rustup = join(CARGO_BIN, 'rustup')
const which = process.argv[2] ?? 'all'

const nativeTarget = (): { triple: string; library: string } => {
  const arch = process.arch === 'arm64' ? 'aarch64' : process.arch === 'x64' ? 'x86_64' : null

  if (!arch) {
    throw new Error(`vibe kernel build: no native target for arch ${process.arch}`)
  }

  if (process.platform === 'darwin') {
    return { triple: `${arch}-apple-darwin`, library: 'libvibe_kernel.dylib' }
  }

  if (process.platform === 'linux') {
    return { triple: `${arch}-unknown-linux-gnu`, library: 'libvibe_kernel.so' }
  }

  throw new Error(`vibe kernel build: no native target for platform ${process.platform}`)
}

const installed = (): string[] =>
  execFileSync(rustup, ['target', 'list', '--installed'], { encoding: 'utf8' })
    .split('\n')
    .map(x => x.trim())
    .filter(x => x.length > 0)

// the GPU features for the native addon: `build.ts native hip`, `native cuda`, `native emu`, or several joined by
// commas. None needs a GPU toolkit to build (kernel/src/gpu.rs opens the runtime at load), so any machine builds any
const FEATURES = (process.argv[3] ?? '').split(',').filter(x => x.length > 0)

for (const f of FEATURES) {
  if (!['hip', 'cuda', 'emu'].includes(f)) {
    throw new Error(`vibe kernel build: no feature ${f} (hip, cuda, emu)`)
  }
}

function build(triple: string, rustflags: string, targetDir = TARGET_DIR, std = false, features: string[] = []): void {
  const args = ['build', '--release', '--target', triple, '--target-dir', targetDir]

  if (features.length > 0) {
    args.push('--features', features.join(','))
  }

  if (std || !installed().includes(triple)) {
    console.log(`vibe kernel build: ${triple} std not installed, compiling it from source (-Z build-std)`)
    args.push('-Z', 'build-std=std,panic_abort')
  }

  console.log(`vibe kernel build: cargo ${args.join(' ')}`)
  execFileSync(cargo, args, {
    cwd: CRATE,
    stdio: 'inherit',
    env: { ...process.env, RUSTFLAGS: rustflags },
  })
}

// an artifact copied beside its destination and renamed over it: a process that has the old file loaded keeps its
// mapping (a rename replaces the name, not the file), where copying over it in place could crash that process
function place(from: string, to: string): void {
  copyFileSync(from, `${to}.part`)
  renameSync(`${to}.part`, to)
}

mkdirSync(HOST, { recursive: true })

if (which === 'all' || which === 'native') {
  const { triple, library } = nativeTarget()

  // a GPU build is its own file and its own target directory, so building one never replaces (or rebuilds under) the
  // plain addon another process may have loaded
  const gpu = FEATURES.length > 0
  const dir = gpu ? join(HOST, 'target-gpu') : TARGET_DIR
  const out = join(HOST, gpu ? 'vibe-kernel-gpu.node' : 'vibe-kernel.node')

  build(triple, '', dir, false, FEATURES)
  place(join(dir, triple, 'release', library), out)
  console.log(`vibe kernel build: wrote ${out}${gpu ? ` (features ${FEATURES.join(', ')})` : ''}`)
}

if (which === 'all' || which === 'wasm') {
  build('wasm32-unknown-unknown', '-C target-feature=+simd128')
  copyFileSync(join(TARGET_DIR, 'wasm32-unknown-unknown', 'release', 'vibe_kernel.wasm'), join(HOST, 'vibe-kernel.wasm'))
  console.log(`vibe kernel build: wrote ${join(HOST, 'vibe-kernel.wasm')}`)
}

// the threaded wasm module (not in `all`): std rebuilt with atomics, so ALWAYS -Z build-std and a nightly toolchain,
// even where the wasm32 target is installed (its prebuilt std has no atomics). rustc then links a shared, imported
// memory and exports the thread-local setup; the stack pointer is exported too, so each worker instance gets its own
// stack, and the memory's ceiling is raised to 4 GB
if (which === 'wasm-threads') {
  const dir = join(HOST, 'target-threads')

  build(
    'wasm32-unknown-unknown',
    [
      '-C target-feature=+atomics,+bulk-memory,+mutable-globals,+simd128',
      '-C link-arg=--export=__stack_pointer',
      '-C link-arg=--max-memory=4294967296',
    ].join(' '),
    dir,
    true,
  )
  copyFileSync(join(dir, 'wasm32-unknown-unknown', 'release', 'vibe_kernel.wasm'), join(HOST, 'vibe-kernel-threads.wasm'))
  console.log(`vibe kernel build: wrote ${join(HOST, 'vibe-kernel-threads.wasm')}`)
}
