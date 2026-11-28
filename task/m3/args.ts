// Command-line flags for the M3 drivers in this folder: `--name value` pairs, each with a default equal to the size
// the laptop experiment ran, so a driver called with no flags reproduces that experiment's numbers.

export function flags(argv: readonly string[] = process.argv.slice(2)): Map<string, string> {
  const out = new Map<string, string>()

  for (let k = 0; k < argv.length; k++) {
    const word = argv[k]!

    if (!word.startsWith('--')) {
      throw new Error(`m3 driver: expected a --flag, got ${word}`)
    }

    const eq = word.indexOf('=')

    if (eq > 0) {
      out.set(word.slice(2, eq), word.slice(eq + 1))
      continue
    }

    const value = argv[k + 1]

    if (value === undefined || value.startsWith('--')) {
      out.set(word.slice(2), 'true')
      continue
    }

    out.set(word.slice(2), value)
    k++
  }

  return out
}

// an integer flag: decimal digits, `_` separators, or a power written `3^20`
export function intFlag(f: Map<string, string>, name: string, fallback: number): number {
  const raw = f.get(name)

  if (raw === undefined) {
    return fallback
  }

  const power = /^(\d+)\^(\d+)$/.exec(raw)
  const value = power ? Number(power[1]) ** Number(power[2]) : Number(raw.replaceAll('_', ''))

  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`m3 driver: --${name} must be a whole number, got ${raw}`)
  }

  return value
}

export function listFlag(f: Map<string, string>, name: string, fallback: readonly string[]): string[] {
  const raw = f.get(name)

  return raw === undefined ? [...fallback] : raw.split(',').filter(x => x.length > 0)
}

export function intListFlag(f: Map<string, string>, name: string, fallback: readonly number[]): number[] {
  const raw = f.get(name)

  if (raw === undefined) {
    return [...fallback]
  }

  return raw.split(',').map(x => intFlag(new Map([[name, x]]), name, 0))
}

// the closing line every driver prints: one JSON object a reader can parse from the end of the log
export function summary(value: object): void {
  console.log(`SUMMARY ${JSON.stringify(value)}`)
}

export const seconds = (t0: number): number => Math.round(performance.now() - t0) / 1000
