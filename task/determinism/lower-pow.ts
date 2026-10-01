// A module loader hook for the determinism sweep: rewrite every ** in code/ and test/ as a Math.pow call, so the
// sweep can see it. V8 compiles x ** y to the same C library pow that Math.pow calls (or, in optimized code with a
// constant 2, to x * x, which this Mac's pow equals on every input tried), and a ** cannot be intercepted otherwise.
//
// esbuild lowers the operator to `__pow(a, b)` with `var __pow = Math.pow` at the top of each module, so the sweep
// must replace Math.pow BEFORE it imports any experiment. A BigInt ** is lowered too, which is why the sweep's
// Math.pow passes a BigInt straight to the real operator.
//
// Registered by task/determinism/expose.ts with module.register(); never used by an experiment.
import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

type Loaded = { format?: string | null; source?: string | ArrayBuffer | Uint8Array | null; shortCircuit?: boolean }
type NextLoad = (url: string, context: unknown) => Promise<Loaded>

// esbuild ships with tsx, not as a dependency of this package
const tsx = realpathSync(fileURLToPath(new URL('../../node_modules/tsx/package.json', import.meta.url)))
const esbuild = createRequire(tsx)('esbuild') as {
  transformSync(source: string, options: Record<string, unknown>): { code: string }
}

const ROOTS = [new URL('../../code/', import.meta.url).href, new URL('../../test/', import.meta.url).href]

export async function load(url: string, context: unknown, nextLoad: NextLoad): Promise<Loaded> {
  const result = await nextLoad(url, context)

  if (!ROOTS.some(root => url.startsWith(root)) || result.source == null || result.format !== 'module') {
    return result
  }

  const text = typeof result.source === 'string' ? result.source : new TextDecoder().decode(result.source)

  if (!text.includes('**')) {
    return result
  }

  // this hook can sit before tsx in the chain, so the source may still be TypeScript: strip it the way tsx would for
  // this package's tsconfig (target ES2020, so class fields are assigned, not defined)
  const lowered = esbuild.transformSync(text, {
    loader: url.endsWith('.ts') ? 'ts' : 'js',
    tsconfigRaw: { compilerOptions: { useDefineForClassFields: false } },
    supported: { 'exponent-operator': false },
    sourcefile: url,
  })

  return { ...result, source: lowered.code }
}
