// The look-elsewhere audit, the one portable tool from Bogovich's E8/H3 constant
// fitting (Zenodo). Before a numeric coincidence is called a derivation, ask how many
// ways there were to hit the target. A value that only the forced structure reaches is
// a derivation. A value that a menu of arbitrary formulae reaches often is a
// coincidence dressed as a law. This is vibe's anti-numerology guard, made into a
// number: the count of null candidates within tolerance of the target, and the
// fraction of the null menu that lands there.
//
// It is a control generator, not a physics claim. An experiment uses it to show that a
// genuinely forced constant (the 24 directions of D4, say) is rare in the null menu,
// while a fitted constant (a mass ratio matched to a power of the golden ratio) is
// common in it, so the two are told apart quantitatively.

// How many candidates fall within a relative tolerance of the target, and the fraction
// of the menu that does. A low fraction means the target is hard to hit by accident (a
// forced match), a high fraction means it is easy (a coincidence).
export function lookElsewhereCount(input: {
  target: number
  candidates: readonly number[]
  relativeTolerance?: number
}): { hits: number; total: number; fraction: number } {
  const { target, candidates } = input
  const tolerance = input.relativeTolerance ?? 0.01
  const scale = Math.abs(target) < 1e-12 ? 1 : Math.abs(target)

  let hits = 0

  for (const candidate of candidates) {
    if (Math.abs(candidate - target) / scale <= tolerance) {
      hits++
    }
  }

  return {
    hits,
    total: candidates.length,
    fraction: candidates.length === 0 ? 0 : hits / candidates.length,
  }
}

// The coverage of a menu: over a deterministic grid of targets in a range, the fraction
// that land within tolerance of at least one menu value. A dense menu covers most of the
// number line, so a match to it carries little information. A sparse structural menu (the
// forced values only) covers a small fraction, so a match to it is informative. The grid
// is evenly spaced, not random, so the audit is reproducible.
export function menuCoverage(input: {
  menu: readonly number[]
  low: number
  high: number
  points: number
  relativeTolerance?: number
}): number {
  const { menu, low, high, points } = input
  const tolerance = input.relativeTolerance ?? 0.01
  const sorted = [...menu].sort((a, b) => a - b)

  let covered = 0

  for (let i = 0; i < points; i++) {
    const target = low + ((high - low) * i) / (points - 1)
    const scale = Math.abs(target) < 1e-12 ? 1 : Math.abs(target)
    const hit = sorted.some(
      value => Math.abs(value - target) / scale <= tolerance,
    )

    if (hit) {
      covered++
    }
  }

  return covered / points
}

// A menu of arbitrary small-formula values, the space a numerologist searches without
// admitting it: integers, simple ratios, and small powers of the usual constants
// (golden ratio, pi, e, sqrt 2). Deterministic and finite, so an audit is reproducible.
// This is the null ensemble a fitted constant is drawn from.
export function numerologyMenu(input: {
  maxInteger?: number
}): number[] {
  const maxInteger = input.maxInteger ?? 30
  const bases = [
    (1 + Math.sqrt(5)) / 2, // golden ratio
    Math.PI,
    Math.E,
    Math.SQRT2,
    Math.sqrt(3),
  ]

  const menu: number[] = []

  for (let n = 1; n <= maxInteger; n++) {
    menu.push(n)

    for (let d = 1; d <= maxInteger; d++) {
      menu.push(n / d)
    } // simple ratios
  }

  for (const base of bases) {
    for (let power = -3; power <= 3; power++) {
      if (power === 0) {
        continue
      }

      menu.push(base ** power)

      for (let k = 1; k <= 12; k++) {
        menu.push(k * base ** power)
      }
    }
  }

  return menu
}
