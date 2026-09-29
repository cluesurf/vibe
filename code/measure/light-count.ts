// Can the string's count ride the light? Measurement for E-SPN-0084: the exhaustive and exact readings behind its
// theorems. Floats appear only where a coefficient of the light's beat is tested against zero (measurement).
//
// (1) lineGaussCount: on a husk ring of L links with Z_N link columns, the number of column assignments obeying Gauss
//     at every dock, for a given charge placement. Gauss fixes each link from its neighbor, so the count is N (one
//     winding value) when the total charge is 0 mod N and 0 otherwise: a line's light has no freedom per link.
// (2) ladderSupport / ladderComponents: the support of one beat of E-FRC-0230's light (code/rule/plaquette-ladder,
//     the full register space with the recorded hop of a stand-in charge), and the connected components of the graph
//     that support draws. A diagonal register the beat keeps must be constant on every component. The components are
//     read against the Gauss vector and against the drift's exponent l = sum bal(e)^2.
// (3) crossingSources: on a ring, the change of rho_x = bal(f_x)^2 under the recorded hop of locked tokens, against
//     the links the tokens crossed: rho changes only where a charge crossed, and l is not kept.
// (4) portFarReach: E-SPN-0075's port store (code/rule/flux-store-line) decides a token's copy from a token's label
//     up to 2D docks away (E-SPN-0081's Theorem 2, recomputed).
// (5) hiddenColumn: a column of D bulk trits with sum e holds (occupation - |e|) / 2 hidden neutral pairs, which no
//     husk read sees; the most a string link's column (|e| = 1) can hide.

import { bal, type Step } from '@/code/rule/lattice-qed'
import {
  fullLadder,
  type LadderSpec,
} from '@/code/rule/plaquette-ladder'
import * as portStore from '@/code/rule/flux-store-line'
import { type Vibe } from '@/code/rule/locked-token-line'

const mod = (a: number, m: number): number => ((a % m) + m) % m

// ---- (1) ----
export function lineGaussCount(
  L: number,
  N: number,
  charge: readonly number[],
): number {
  let count = 0

  const f = new Array<number>(L).fill(0)

  for (let code = 0; code < N ** L; code++) {
    let c = code

    for (let x = 0; x < L; x++) {
      f[x] = c % N
      c = Math.floor(c / N)
    }

    let ok = true

    for (let x = 0; x < L && ok; x++) {
      if (mod(f[x]! - f[mod(x - 1, L)]! - charge[x]!, N) !== 0) {
        ok = false
      }
    }

    if (ok) {
      count++
    }
  }

  return count
}

// every charge placement of up to three loves and fears on L docks
export function chargePlacements(L: number): number[][] {
  const out = new Map<string, number[]>()

  const place = (left: number, q: number[]): void => {
    out.set(q.join(','), q.slice())

    if (left === 0) {
      return
    }

    for (let x = 0; x < L; x++) {
      for (const s of [1, -1]) {
        q[x] = q[x]! + s
        place(left - 1, q)
        q[x] = q[x]! - s
      }
    }
  }

  place(3, new Array<number>(L).fill(0))

  return [...out.values()]
}

// ---- (2) ----
type Row = { idx: number[]; re: number[]; im: number[] }

function applyStep(step: Step, row: Row, m: number): Row {
  const acc = new Map<number, [number, number]>()

  const add = (i: number, re: number, im: number): void => {
    const o = acc.get(i)

    acc.set(i, o ? [o[0] + re, o[1] + im] : [re, im])
  }

  const zeta = (e: number): [number, number] => [
    Math.cos((2 * Math.PI * e) / m),
    Math.sin((2 * Math.PI * e) / m),
  ]
  // g_s = (1/n) sum_B zeta^(exponents[B]) w_n^(-B s), once per step
  const g: [number, number][] = []

  if (step.kind === 'loop') {
    for (let s = 0; s < step.n; s++) {
      let gr = 0
      let gi = 0

      for (let B = 0; B < step.n; B++) {
        const t =
          (2 * Math.PI * step.exponents[B]!) / m -
          (2 * Math.PI * B * s) / step.n

        gr += Math.cos(t)
        gi += Math.sin(t)
      }

      g.push([gr / step.n, gi / step.n])
    }
  }

  row.idx.forEach((i, k) => {
    const vr = row.re[k]!
    const vi = row.im[k]!

    if (step.kind === 'hop') {
      const [zr, zi] = zeta(step.z)
      const a: [number, number] = [(1 + zr) / 2, zi / 2]
      const b: [number, number] = [(1 - zr) / 2, -zi / 2]

      add(i, a[0] * vr - a[1] * vi, a[0] * vi + a[1] * vr)
      add(step.move(i), b[0] * vr - b[1] * vi, b[0] * vi + b[1] * vr)
    } else if (step.kind === 'phase') {
      const [zr, zi] = zeta(step.exponent(i))

      add(i, zr * vr - zi * vi, zr * vi + zi * vr)
    } else if (step.kind === 'loop') {
      let j = i

      for (let s = 0; s < step.n; s++) {
        const [gr, gi] = g[s]!

        add(j, gr * vr - gi * vi, gr * vi + gi * vr)
        j = step.shift(j)
      }
    } else {
      throw new Error('light-count: a float-only step')
    }
  })

  const out: Row = { idx: [], re: [], im: [] }

  for (const [i, [re, im]] of acc) {
    out.idx.push(i)
    out.re.push(re)
    out.im.push(im)
  }

  return out
}

// the loop coefficients |g_s| of one square's force factor, s = 0 .. N - 1 (which powers of the loop shift it holds)
export function loopCoefficients(spec: LadderSpec): number[] {
  const n = spec.n
  const out: number[] = []

  for (let s = 0; s < n; s++) {
    let gr = 0
    let gi = 0

    for (let B = 0; B < n; B++) {
      const t =
        (2 * Math.PI * (-spec.force * bal(B, n) ** 2)) / spec.root -
        (2 * Math.PI * B * s) / n

      gr += Math.cos(t)
      gi += Math.sin(t)
    }

    out.push(Math.hypot(gr, gi) / n)
  }

  return out
}

export type LadderComponents = {
  size: number
  components: number
  gaussClasses: number
  mixedComponents: number
  componentsPerClass: number[]
  constantLComponents: number
  vacuumLMax: number
  vacuumSize: number
  smallestKept: number
  largestDropped: number
  unitarity: number
}

// the components of one beat's support on the full register space
export function ladderComponents(
  spec: LadderSpec,
  threshold = 1e-9,
): LadderComponents {
  const full = fullLadder(spec)
  const steps = full.steps(true)
  const size = full.size
  const n = spec.n
  const links = 3 * spec.plaquettes
  const parent = new Int32Array(size)

  for (let i = 0; i < size; i++) {
    parent[i] = i
  }

  const find = (i: number): number => {
    let r = i

    while (parent[r] !== r) {
      r = parent[r]!
    }

    let c = i

    while (parent[c] !== r) {
      const next = parent[c]!

      parent[c] = r
      c = next
    }

    return r
  }

  let smallestKept = Infinity
  let largestDropped = 0
  let unitarity = 0

  for (let i = 0; i < size; i++) {
    let row: Row = { idx: [i], re: [1], im: [0] }

    for (const st of steps) {
      row = applyStep(st, row, spec.root)
    }

    let norm = 0

    row.idx.forEach((j, k) => {
      const a = Math.hypot(row.re[k]!, row.im[k]!)

      norm += a * a

      if (a > threshold) {
        smallestKept = Math.min(smallestKept, a)

        const ri = find(i)
        const rj = find(j)

        if (ri !== rj) {
          parent[ri] = rj
        }
      } else {
        largestDropped = Math.max(largestDropped, a)
      }
    })
    unitarity = Math.max(unitarity, Math.abs(norm - 1))
  }

  const gaussCode = (i: number): number =>
    full.gauss(i).reduce((a, v) => a * n + v, 0)

  const lOf = (i: number): number => {
    const flux = n ** links

    let rest = i % flux
    let s = 0

    for (let l = 0; l < links; l++) {
      s += bal(rest % n, n) ** 2
      rest = Math.floor(rest / n)
    }

    return s
  }

  const compGauss = new Map<number, Set<number>>()
  const compL = new Map<number, [number, number]>()
  const compSize = new Map<number, number>()

  for (let i = 0; i < size; i++) {
    const r = find(i)
    const g = gaussCode(i)
    const l = lOf(i)

    if (!compGauss.has(r)) {
      compGauss.set(r, new Set())
    }

    compGauss.get(r)!.add(g)

    const o = compL.get(r)

    compL.set(r, o ? [Math.min(o[0], l), Math.max(o[1], l)] : [l, l])
    compSize.set(r, (compSize.get(r) ?? 0) + 1)
  }

  const perClass = new Map<number, number>()

  let mixed = 0
  let constantL = 0

  for (const [r, gs] of compGauss) {
    if (gs.size > 1) {
      mixed++
    }

    for (const g of gs) {
      perClass.set(g, (perClass.get(g) ?? 0) + 1)
    }

    const lr = compL.get(r)!

    if (lr[0] === lr[1]) {
      constantL++
    }
  }

  const vac = find(0)

  return {
    size,
    components: compGauss.size,
    gaussClasses: perClass.size,
    mixedComponents: mixed,
    componentsPerClass: [...new Set(perClass.values())].sort(
      (a, b) => a - b,
    ),
    constantLComponents: constantL,
    vacuumLMax: compL.get(vac)![1],
    vacuumSize: compSize.get(vac)!,
    smallestKept,
    largestDropped,
    unitarity,
  }
}

// ---- (3) ----
export type CrossingSources = {
  states: number
  offCrossing: number
  lChanged: number
  lChangeRange: [number, number]
}

// locked tokens (label 0 forward, 1 back) on a ring, placed on an arc with the Gauss flux, every doublet label choice;
// the recorded hop of every token (no store, no bounce): rho_x = [f_x != 0] changes only on crossed links
export function crossingSources(
  L: number,
  kinds: readonly Vibe[],
  span: number,
): CrossingSources {
  const n = kinds.length

  let states = 0
  let offCrossing = 0
  let lChanged = 0
  let lo = 0
  let hi = 0

  for (let p = 0; p < L ** n; p++) {
    const x = Array.from(
      { length: n },
      (_, t) => Math.floor(p / L ** (n - 1 - t)) % L,
    )

    if (
      Math.max(...x) - Math.min(...x) > span ||
      Math.min(...x) < 1 ||
      Math.max(...x) > L - 2
    ) {
      continue
    }

    const f = new Array<number>(L).fill(0)

    let cum = 0

    for (let l = 0; l < L; l++) {
      kinds.forEach((k, t) => {
        if (x[t] === l) {
          cum += k === 'love' ? 1 : -1
        }
      })
      f[l] = mod(cum, 3)
    }

    if (f[L - 1] !== 0) {
      continue
    }

    for (let c = 0; c < 2 ** n; c++) {
      const g = f.slice()
      const crossed = new Set<number>()

      for (let t = 0; t < n; t++) {
        const q = kinds[t] === 'love' ? 1 : -1
        const forward = ((c >> t) & 1) === 0
        const link = forward ? x[t]! : mod(x[t]! - 1, L)

        g[link] = mod(g[link]! + (forward ? -q : q), 3)
        crossed.add(link)
      }

      states++

      let dl = 0

      for (let l = 0; l < L; l++) {
        const d = (g[l] === 0 ? 0 : 1) - (f[l] === 0 ? 0 : 1)

        dl += d

        if (d !== 0 && !crossed.has(l)) {
          offCrossing++
        }
      }

      if (dl !== 0) {
        lChanged++
      }

      lo = Math.min(lo, dl)
      hi = Math.max(hi, dl)
    }
  }

  return { states, offCrossing, lChanged, lChangeRange: [lo, hi] }
}

// ---- (4) ----
export type PortFar = {
  states: number
  witnesses: number
  farthest: number
  checked: number
}

export function portFarReach(
  ring: number,
  kinds: Vibe[],
  depth: number,
): PortFar {
  const s: portStore.FluxStoreSpec = {
    ring,
    kinds,
    convention: 'C',
    unlike: 'knit',
    depth,
    cost: 0,
    root: 3,
  }
  const n = kinds.length
  const x0 = Math.floor(ring / 2)
  const start = portStore.placedRegisters(
    s,
    new Array<number>(n).fill(x0),
    new Array<number>(n).fill(0),
  )
  const key = (r: portStore.FluxRegisters): number =>
    portStore.encodeRegisters(s, {
      ...r,
      j: new Array<number>(n).fill(0),
    })
  const seen = new Map<number, portStore.FluxRegisters>([
    [key(start), start],
  ])
  const queue = [start]

  while (queue.length > 0) {
    const r = queue.pop()!

    for (let c = 0; c < 2 ** n; c++) {
      const out = portStore.streamRegisters(s, {
        ...r,
        j: Array.from({ length: n }, (_, t) => (c >> t) & 1),
      })
      const k = key(out)

      if (!seen.has(k)) {
        const norm = { ...out, j: new Array<number>(n).fill(0) }

        seen.set(k, norm)
        queue.push(norm)
      }
    }
  }

  const dist = (a: number, b: number): number =>
    Math.min(mod(a - b, ring), mod(b - a, ring))

  let witnesses = 0
  let farthest = 0
  let checked = 0

  for (const r of seen.values()) {
    for (let c = 0; c < 2 ** n; c++) {
      const j = Array.from({ length: n }, (_, t) => (c >> t) & 1)
      const base = portStore.streamRegisters(s, { ...r, j })

      for (let t = 0; t < n; t++) {
        for (let u = 0; u < n; u++) {
          const d = dist(r.x[t]!, r.x[u]!)

          if (u === t || d < 2) {
            continue
          }

          const j2 = j.slice()

          j2[u] = 1 - j[u]!
          checked++

          const other = portStore.streamRegisters(s, { ...r, j: j2 })

          if ((other.x[t] !== r.x[t]) !== (base.x[t] !== r.x[t])) {
            witnesses++
            farthest = Math.max(farthest, d)
          }
        }
      }
    }
  }

  return { states: seen.size, witnesses, farthest, checked }
}

// ---- (5) ----
// over every column of D trits: the most hidden pairs (occupation - |sum|) / 2 at each |sum|
export function hiddenColumn(D: number): number[] {
  const best = new Array<number>(D + 1).fill(-1)

  for (let code = 0; code < 3 ** D; code++) {
    let c = code
    let sum = 0
    let occ = 0

    for (let d = 0; d < D; d++) {
      const t = (c % 3) - 1

      c = Math.floor(c / 3)
      sum += t
      occ += t === 0 ? 0 : 1
    }

    const a = Math.abs(sum)

    best[a] = Math.max(best[a]!, (occ - a) / 2)
  }

  return best
}
