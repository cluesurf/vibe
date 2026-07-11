// P252 (CONTROLS): the audit's #1 systemic gap was that most tests assert a YES with nothing that gives a NO.
// This adds a discriminating NEGATIVE CONTROL for each key claim: a deliberately-broken rule or substrate
// where the property should FAIL, and we confirm the test CATCHES it. A test that cannot fail proves nothing.
//   C1 reversibility: the real streaming rule is injective (reversible), a lossy collision is NOT (caught).
//   C2 flatness: D4 grows polynomially, a degree-3 Bethe tree grows EXPONENTIALLY (caught).
//   C4 parity: a symmetric rule commutes with reflection, a chiral rule does NOT (caught).
//   C5 gauge: the massless plaquette is gauge-invariant, a Proca mass term m^2 A^2 is NOT (caught).
// Run: npx tsx code/experiment/p252-controls-battery.ts

import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function controlsBattery(): {
  c1: boolean
  c2: boolean
  c4: boolean
  c5: boolean
} {
  // ---- C1 reversibility: injective (reversible) vs lossy (irreversible) ----
  // state = an 8-bit ring occupation. real rule = rotate (a bijection). lossy = x & (x>>1) (loses bits).
  const N = 256
  const rotate = (x: number): number => ((x << 1) | (x >> 7)) & 0xff
  const lossy = (x: number): number => x & (x >> 1)

  const injective = (f: (x: number) => number): boolean => {
    const seen = new Set<number>()

    for (let x = 0; x < N; x++) {
      seen.add(f(x))
    }

    return seen.size === N
  }

  const realReversible = injective(rotate),
    controlReversible = injective(lossy)

  const c1 = realReversible && !controlReversible

  // ---- C2 flatness: D4 polynomial vs Bethe tree (degree 3) exponential ----
  function d4Shells(R: number): number[] {
    const roots: number[][] = []

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        for (const si of [1, -1]) {
          for (const sj of [1, -1]) {
            const v = [0, 0, 0, 0]

            v[i] = si
            v[j] = sj
            roots.push(v)
          }
        }
      }
    }

    const key = (p: number[]): string => p.join(',')
    const dist = new Map([['0,0,0,0', 0]])

    let frontier = [[0, 0, 0, 0]]

    const shells = [1]

    for (let r = 1; r <= R; r++) {
      const next: number[][] = []

      for (const p of frontier) {
        for (const root of roots) {
          const q = p.map((x, k) => x + root[k]!)
          const kk = key(q)

          if (!dist.has(kk)) {
            dist.set(kk, r)
            next.push(q)
          }
        }
      }

      shells.push(next.length)
      frontier = next
    }

    return shells
  }

  function betheShells(R: number, deg: number): number[] {
    const shells = [1]

    let prev = 1

    for (let r = 1; r <= R; r++) {
      const cur = r === 1 ? deg : prev * (deg - 1)

      shells.push(cur)
      prev = cur
    }

    return shells
  }

  const d4 = d4Shells(8),
    bethe = betheShells(8, 3)

  const d4Ratio = d4[8]! / d4[7]!,
    betheRatio = bethe[8]! / bethe[7]!

  const c2 = d4Ratio < 1.6 && betheRatio > 1.9 // D4 ratio falls toward 1, Bethe stays at deg-1 = 2

  // ---- C4 parity: symmetric rule commutes with reflection, chiral does not ----
  const L = 9
  const reflect = (v: number[]): number[] =>
    v.map((_, i) => v[(L - i) % L]!)

  const symmetric = (v: number[]): number[] =>
    v.map((_, i) => (v[(i + 1) % L]! + v[(i + L - 1) % L]!) / 2) // left+right

  const chiral = (v: number[]): number[] =>
    v.map((_, i) => v[(i + L - 1) % L]!) // shift right only

  const commutes = (rule: (v: number[]) => number[]): boolean => {
    const v = Array.from({ length: L }, (_, i) => (i * i) % 7)
    const a = rule(reflect(v)),
      b = reflect(rule(v))

    return a.every((x, i) => Math.abs(x - b[i]!) < 1e-9)
  }

  const symCommutes = commutes(symmetric),
    chiralCommutes = commutes(chiral)

  const c4 = symCommutes && !chiralCommutes

  // ---- C5 gauge: massless plaquette gauge-invariant vs Proca mass term not ----
  const Lg = 8,
    wrap = (x: number): number => ((x % Lg) + Lg) % Lg

  const rng = makeRng({ seed: 7 })
  const rnd = (): number => rng.next() * 2 * Math.PI
  const Ax = Array.from({ length: Lg }, () =>
    Array.from({ length: Lg }, () => rnd()),
  )

  const Ay = Array.from({ length: Lg }, () =>
    Array.from({ length: Lg }, () => rnd()),
  )

  const g = Array.from({ length: Lg }, () =>
    Array.from({ length: Lg }, () => rnd()),
  )

  const Ax2 = Ax.map((row, x) =>
    row.map((a, y) => a + g[x]![y]! - g[wrap(x + 1)]![y]!),
  )

  const Ay2 = Ay.map((row, x) =>
    row.map((a, y) => a + g[x]![y]! - g[x]![wrap(y + 1)]!),
  )

  const plaq = (
    ax: number[][],
    ay: number[][],
    x: number,
    y: number,
  ): number =>
    ax[x]![y]! +
    ay[wrap(x + 1)]![y]! -
    ax[x]![wrap(y + 1)]! -
    ay[x]![y]!

  const massTerm = (ax: number[][], ay: number[][]): number => {
    let s = 0

    for (let x = 0; x < Lg; x++) {
      for (let y = 0; y < Lg; y++) {
        s += ax[x]![y]! ** 2 + ay[x]![y]! ** 2
      }
    }

    return s
  } // m^2 A^2 (Proca)

  let plaqChange = 0

  for (let x = 0; x < Lg; x++) {
    for (let y = 0; y < Lg; y++) {
      plaqChange = Math.max(
        plaqChange,
        Math.abs(plaq(Ax, Ay, x, y) - plaq(Ax2, Ay2, x, y)),
      )
    }
  }

  const massChange = Math.abs(massTerm(Ax, Ay) - massTerm(Ax2, Ay2))
  const c5 = plaqChange < 1e-9 && massChange > 0.1

  return { c1, c2, c4, c5 }
}

export default experiment({
  id: 'foundations/controls-battery',
  code: 'E-FND-0010',
  title:
    'a negative-control battery, each property test catches a deliberately broken rule',
  category: 'foundations',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = controlsBattery()
    const ok = r.c1 && r.c2 && r.c4 && r.c5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'each key property test (reversibility, flatness, parity, gauge invariance) catches a deliberately broken control rule that should fail',
      metrics: {
        c1: r.c1 ? 1 : 0,
        c2: r.c2 ? 1 : 0,
        c4: r.c4 ? 1 : 0,
        c5: r.c5 ? 1 : 0,
      },
      notes:
        'the C5 gauge control uses a seeded pseudo-random gauge field, the discrimination itself is deterministic and exact',
    })
  },
})
