// A STREAM OF CLOSED VIBES AS THE RULE'S OWN READING OF A LONE VIBE ON ITS LINE (E-QTM-0190). E-QTM-0187 gate M found
// that a closed fear meeting the line's open love on a line with an empty store is stored with it as a pair, so the
// environment differs between the love's positions (a reading), while a closed love passes and leaves no record. A
// stream of closed vibes at a set spacing k along the line, moving back toward the love, then reads the love about once
// every k beats, made of the rule's content alone.
//
// What this file holds, never written into the rule:
//  - the stream (closed vibes on the line's back slot, every k docks),
//  - the split of a rule state into the open vibe's position (its open slot or the open stored pair it is in, with its
//    point) and its environment (every other nonzero entry of the configuration, as a sparse key),
//  - runs of the rule from each basis start (the love on one dock and slot, the stream fixed), kept as exact split
//    amplitudes per beat, and their linear combination into any start (the beat is linear: the rule is a unitary on
//    configurations, E-QTM-0184), exact for integer weights and in floats for complex ones,
//  - the reduced state of the love read off a combined state: its fidelity with a target, its purity, and the number
//    of environments.
//
// Exact in Z[w][1/2] up to the combination; floats only for complex weights and the reduced state.

import { lineBeat, lineConfiguration, type LineBox, type LineVibe } from '@/code/measure/line-barrier'
import { lockedState, type LockedState } from '@/code/rule/doublet-locked-knit'

export type Complex = readonly [number, number]

// an amplitude (a + b w) / 2^k, w = e^(2 pi i / 3)
export type Exact = { readonly a: bigint; readonly b: bigint; readonly k: number }

// one beat of a run: env key -> position key -> amplitude
export type Split = Map<string, Map<string, Exact>>

// closed vibes of one tone on the line's back slot (moving back), every `spacing` docks, the first on dock `from`
export function closedStream(input: {
  box: LineBox
  spacing: number
  value: 1 | -1
  from: number
}): LineVibe[] {
  const n = input.box.cells.length
  const out: LineVibe[] = []

  for (let d = 0; d < n; d++) {
    if ((((d - input.from) % input.spacing) + input.spacing) % input.spacing === 0) {
      out.push({ dock: d, forward: false, value: input.value, open: false })
    }
  }

  return out
}

// the open vibe's position and its environment for each branch, exact amplitudes
export function splitOpenVibe(s: LockedState): Split {
  const out: Split = new Map()

  for (const b of s.branches) {
    let pos = ''
    let env = ''

    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] === 0) {
        continue
      }

      if (b.open[i] === 1) {
        pos += `v${i}:${b.vibe[i]}:${b.point[i]},`
      } else {
        env += `v${i}:${b.vibe[i]}:${b.point[i]},`
      }
    }

    for (let i = 0; i < b.store.length; i++) {
      if (b.store[i] === 0) {
        continue
      }

      const entry = `s${i}:${b.store[i]}:${b.spoint[i]}:${b.sopen[i]},`

      if (b.sopen[i] !== 0) {
        pos += entry
      } else {
        env += entry
      }
    }

    const byPos = out.get(env) ?? new Map<string, Exact>()
    const prev = byPos.get(pos)

    byPos.set(pos, prev ? addExact(prev, b) : { a: b.a, b: b.b, k: b.k })
    out.set(env, byPos)
  }

  return out
}

export function addExact(x: Exact, y: Exact): Exact {
  const k = Math.max(x.k, y.k)

  return {
    a: x.a * (1n << BigInt(k - x.k)) + y.a * (1n << BigInt(k - y.k)),
    b: x.b * (1n << BigInt(k - x.k)) + y.b * (1n << BigInt(k - y.k)),
    k,
  }
}

const scaleExact = (x: Exact, m: bigint): Exact => ({ a: x.a * m, b: x.b * m, k: x.k })

export const exactToComplex = (x: Exact): Complex => {
  const s = 2 ** -x.k

  return [(Number(x.a) - Number(x.b) / 2) * s, ((Number(x.b) * Math.sqrt(3)) / 2) * s]
}

// a + b w over 2^k reduced, so equal amplitudes compare equal
function reduceExact(x: Exact): Exact {
  let { a, b, k } = x

  if (a === 0n && b === 0n) {
    return { a: 0n, b: 0n, k: 0 }
  }

  while (k > 0 && a % 2n === 0n && b % 2n === 0n) {
    a /= 2n
    b /= 2n
    k--
  }

  return { a, b, k }
}

export type BasisStart = { readonly dock: number; readonly forward: boolean; readonly position: string }

export type BasisRun = BasisStart & { readonly beats: Split[] }

// the rule run from each basis start (the open love on one dock and slot, `others` on the line), splits at beats
// 0..beats. A start whose slot `others` already holds is skipped (a slot holds one vibe), and so are back starts when
// `forwardOnly` is set
export function basisRuns(input: {
  box: LineBox
  others: readonly LineVibe[]
  beats: number
  forwardOnly?: boolean
}): BasisRun[] {
  const { box, others, beats } = input
  const n = box.cells.length
  const runs: BasisRun[] = []

  for (let dock = 0; dock < n; dock++) {
    for (const forward of input.forwardOnly ? [true] : [true, false]) {
      if (others.some(o => ((o.dock % n) + n) % n === dock && o.forward === forward)) {
        continue
      }

      let s = lockedState(
        lineConfiguration(box, [{ dock, forward, value: 1, open: true }, ...others], []),
      )

      const split0 = splitOpenVibe(s)
      const position = [...[...split0.values()][0]!.keys()][0]!
      const out: Split[] = [split0]

      for (let t = 1; t <= beats; t++) {
        s = lineBeat(box, s, t - 1)
        out.push(splitOpenVibe(s))
      }

      runs.push({ dock, forward, position, beats: out })
    }
  }

  return runs
}

// the combined state at one beat for integer weights, exact and reduced
export function combineExact(
  runs: readonly BasisRun[],
  weight: (r: BasisRun) => bigint,
  beat: number,
): Map<string, Exact> {
  const out = new Map<string, Exact>()

  for (const r of runs) {
    const m = weight(r)

    if (m === 0n) {
      continue
    }

    for (const [env, byPos] of r.beats[beat]!) {
      for (const [pos, x] of byPos) {
        const id = `${env}|${pos}`
        const prev = out.get(id)
        const add = scaleExact(x, m)

        out.set(id, prev ? addExact(prev, add) : add)
      }
    }
  }

  for (const [id, x] of out) {
    const r = reduceExact(x)

    if (r.a === 0n && r.b === 0n) {
      out.delete(id)
    } else {
      out.set(id, r)
    }
  }

  return out
}

// a rule state flattened the same way, reduced, for comparison with combineExact
export function flattenExact(split: Split): Map<string, Exact> {
  const out = new Map<string, Exact>()

  for (const [env, byPos] of split) {
    for (const [pos, x] of byPos) {
      const r = reduceExact(x)

      if (r.a !== 0n || r.b !== 0n) {
        out.set(`${env}|${pos}`, r)
      }
    }
  }

  return out
}

export function sameExact(x: Map<string, Exact>, y: Map<string, Exact>): boolean {
  if (x.size !== y.size) {
    return false
  }

  for (const [id, a] of x) {
    const b = y.get(id)

    if (!b || b.a !== a.a || b.b !== a.b || b.k !== a.k) {
      return false
    }
  }

  return true
}

const mul = (x: Complex, y: Complex): Complex => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0],
]

// the combined state at one beat for complex weights: env -> position -> amplitude
export function combineComplex(
  runs: readonly BasisRun[],
  weight: (r: BasisRun) => Complex,
  beat: number,
): Map<string, Map<string, Complex>> {
  const out = new Map<string, Map<string, Complex>>()

  for (const r of runs) {
    const w = weight(r)

    if (w[0] === 0 && w[1] === 0) {
      continue
    }

    for (const [env, byPos] of r.beats[beat]!) {
      const target = out.get(env) ?? new Map<string, Complex>()

      for (const [pos, x] of byPos) {
        const v = mul(w, exactToComplex(x))
        const prev = target.get(pos) ?? [0, 0]

        target.set(pos, [prev[0] + v[0], prev[1] + v[1]])
      }

      out.set(env, target)
    }
  }

  return out
}

// the love's reduced state against a target (position -> amplitude, normalized): fidelity <phi|rho|phi>, purity and
// the number of environments carrying weight
export function reducedReading(
  state: Map<string, Map<string, Complex>>,
  target: ReadonlyMap<string, Complex>,
): { fidelity: number; purity: number; environments: number; norm: number } {
  let norm = 0
  let fid = 0
  let environments = 0

  const rho = new Map<string, [number, number]>()

  for (const byPos of state.values()) {
    let re = 0
    let im = 0
    let w = 0

    for (const [pos, x] of byPos) {
      w += x[0] * x[0] + x[1] * x[1]

      const p = target.get(pos)

      if (p) {
        // conj(p) x
        re += p[0] * x[0] + p[1] * x[1]
        im += p[0] * x[1] - p[1] * x[0]
      }
    }

    if (w > 1e-24) {
      environments++
    }

    norm += w
    fid += re * re + im * im

    const list = [...byPos]

    for (const [pi, p] of list) {
      for (const [qi, q] of list) {
        const id = `${pi}|${qi}`
        const r = rho.get(id) ?? [0, 0]

        rho.set(id, [r[0] + p[0] * q[0] + p[1] * q[1], r[1] + p[1] * q[0] - p[0] * q[1]])
      }
    }
  }

  let purity = 0

  for (const [re, im] of rho.values()) {
    purity += re * re + im * im
  }

  return { fidelity: fid / norm, purity: purity / (norm * norm), environments, norm }
}

// the dock of a position key (an open slot `v<i>` or an open stored pair `s<i>`), or -1 off the line
export function positionDock(box: LineBox, pos: string): number {
  const m = /^([vs])(\d+):/.exec(pos)

  if (!m) {
    return -1
  }

  const i = Number(m[2])
  const cell = m[1] === 'v' ? Math.floor(i / 24) : Math.floor(i / 12)

  return box.index.get(cell) ?? -1
}

// the chance a basis run's love (free or stored) is on its start dock, at every beat 0..beats
export function stayChance(box: LineBox, run: BasisRun): number[] {
  return run.beats.map(split => {
    let at = 0
    let all = 0

    for (const byPos of split.values()) {
      for (const [pos, x] of byPos) {
        const c = exactToComplex(x)
        const w = c[0] * c[0] + c[1] * c[1]

        all += w

        if (positionDock(box, pos) === run.dock) {
          at += w
        }
      }
    }

    return at / all
  })
}

type WalkVector = { right: Complex[]; left: Complex[] }

// the free walk's return amplitudes a(t) = <psi|U^t|psi>, t = 0..beats, and the chance to be on dock `dock` (from a
// start), run in position with the rule's coin
export function walkReturns(input: {
  psi: WalkVector
  beats: number
  step: (s: WalkVector) => WalkVector
  dock?: number
}): { amplitude: Complex[]; stay: number[] } {
  const amplitude: Complex[] = []
  const stay: number[] = []

  let s = input.psi

  for (let t = 0; t <= input.beats; t++) {
    let re = 0
    let im = 0

    for (let x = 0; x < s.right.length; x++) {
      for (const [p, q] of [
        [input.psi.right[x]!, s.right[x]!],
        [input.psi.left[x]!, s.left[x]!],
      ] as const) {
        re += p[0] * q[0] + p[1] * q[1]
        im += p[0] * q[1] - p[1] * q[0]
      }
    }

    amplitude.push([re, im])

    if (input.dock !== undefined) {
      const r = s.right[input.dock]!
      const l = s.left[input.dock]!

      stay.push(r[0] ** 2 + r[1] ** 2 + l[0] ** 2 + l[1] ** 2)
    }

    s = input.step(s)
  }

  return { amplitude, stay }
}

// the quasi-energy weights and phases of a walk state: c(q, band) = sum_x e^(-i q x) <u_band(q)|psi(x)> / sqrt(n),
// the band vectors from `bands`; returns the weight-normalized variance of the phase about its circular mean
export function quasiEnergyVariance(input: {
  psi: WalkVector
  bands: (q: number) => { theta: [number, number]; vector: [[Complex, Complex], [Complex, Complex]] }
}): { variance: number; weights: number[]; phases: number[] } {
  const n = input.psi.right.length
  const weights: number[] = []
  const phases: number[] = []

  for (let m = 0; m < n; m++) {
    const q = (2 * Math.PI * m) / n
    const b = input.bands(q)

    for (const band of [0, 1] as const) {
      const u = b.vector[band]

      let re = 0
      let im = 0

      for (let x = 0; x < n; x++) {
        // <u|psi(x)> = conj(u0) r + conj(u1) l
        const r = input.psi.right[x]!
        const l = input.psi.left[x]!
        const ur = u[0][0] * r[0] + u[0][1] * r[1] + u[1][0] * l[0] + u[1][1] * l[1]
        const ui = u[0][0] * r[1] - u[0][1] * r[0] + u[1][0] * l[1] - u[1][1] * l[0]
        const c = Math.cos(-q * x)
        const s = Math.sin(-q * x)

        re += c * ur - s * ui
        im += c * ui + s * ur
      }

      weights.push((re * re + im * im) / n)
      phases.push(b.theta[band])
    }
  }

  const total = weights.reduce((s, w) => s + w, 0)

  let c = 0
  let s = 0

  weights.forEach((w, i) => {
    c += w * Math.cos(phases[i]!)
    s += w * Math.sin(phases[i]!)
  })

  const mean = Math.atan2(s, c)

  let variance = 0

  weights.forEach((w, i) => {
    let d = phases[i]! - mean

    d -= 2 * Math.PI * Math.round(d / (2 * Math.PI))
    variance += (w / total) * d * d
  })

  return { variance, weights: weights.map(w => w / total), phases }
}
