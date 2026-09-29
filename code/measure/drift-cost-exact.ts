// The exact rule of code/rule/drift-cost-line (the string paid by the drift alone, no store) checked as a rule
// (E-SPN-0086): locality, reversibility, Gauss and translation covariance by enumerating every register
// configuration of a small ring, and exactness over Z[zeta_K] against the float runner of E-SPN-0074
// (code/measure/locked-run, no wall, the cost as a phase). Measurement: floats read the exact numbers.

import { canonical, toComplex } from '@/code/rule/lattice-qed'
import {
  decodeDrift,
  driftBeat,
  driftBeatBack,
  driftStart,
  encodeDrift,
  fluxLinks,
  gaussHoldsDrift,
  placedDrift,
  registerCount,
  streamDrift,
  streamDriftBack,
  type DriftCostSpec,
  type DriftExact,
  type DriftRegisters,
} from '@/code/rule/drift-cost-line'
import {
  lockedRun,
  spanOf,
  type LockedStart,
} from '@/code/measure/locked-run'

const mod = (a: number, m: number): number => ((a % m) + m) % m

export type RuleCensus = {
  // register configurations enumerated
  states: number
  // images hit twice by the stream (0: a permutation of every configuration)
  collisions: number
  // configurations where back(stream(r)) != r
  inverseFailures: number
  // Gauss configurations whose image breaks Gauss, and the Gauss configurations checked
  gaussBreaks: number
  gaussStates: number
  // two configurations that agree on one link's window (its flux and the tokens on its two docks) but give that
  // link different new fluxes: 0 means each link's new flux reads its own window only
  linkConflicts: number
  // configurations where stream(T r) != T stream(r) or the cost exponent differs, T the translation by one dock
  translationBreaks: number
}

// the translation by one dock: every token and every link flux one step along the ring
const translate = (
  s: DriftCostSpec,
  r: DriftRegisters,
): DriftRegisters => ({
  x: r.x.map(v => mod(v + 1, s.ring)),
  j: r.j.slice(),
  f: r.f.map((_, l) => r.f[mod(l - 1, s.ring)]!),
})

export function ruleCensus(s: DriftCostSpec): RuleCensus {
  const total = registerCount(s)
  const hit = new Uint8Array(total)
  const n = s.kinds.length
  const L = s.ring
  // per link window key -> new flux + 1 (0 unset)
  const windowCount = 3 * 9 ** n
  const table = new Int8Array(L * windowCount)

  let collisions = 0
  let inverseFailures = 0
  let gaussBreaks = 0
  let gaussStates = 0
  let linkConflicts = 0
  let translationBreaks = 0

  for (let i = 0; i < total; i++) {
    const r = decodeDrift(s, i)
    const y = streamDrift(s, r)
    const to = encodeDrift(s, y)

    if (hit[to]) {
      collisions++
    }

    hit[to] = 1

    if (encodeDrift(s, streamDriftBack(s, y)) !== i) {
      inverseFailures++
    }

    if (gaussHoldsDrift(s, r)) {
      gaussStates++

      if (!gaussHoldsDrift(s, y)) {
        gaussBreaks++
      }
    }

    // the window of link l: its flux, and per token (0 elsewhere, 1 + label on dock l, 4 + label on dock l + 1)
    for (let l = 0; l < L; l++) {
      let key = r.f[l]!

      for (let t = 0; t < n; t++) {
        const at =
          r.x[t] === l
            ? 1 + r.j[t]!
            : r.x[t] === mod(l + 1, L)
              ? 4 + r.j[t]!
              : 0

        key = key * 9 + at
      }

      const slot = l * windowCount + key
      const was = table[slot]!

      if (was === 0) {
        table[slot] = y.f[l]! + 1
      } else if (was !== y.f[l]! + 1) {
        linkConflicts++
      }
    }

    const tr = translate(s, r)

    if (
      encodeDrift(s, streamDrift(s, tr)) !==
        encodeDrift(s, translate(s, y)) ||
      fluxLinks(tr.f) !== fluxLinks(r.f)
    ) {
      translationBreaks++
    }
  }

  return {
    states: total,
    collisions,
    inverseFailures,
    gaussBreaks,
    gaussStates,
    linkConflicts,
    translationBreaks,
  }
}

export type DriftExactCheck = {
  gap: number
  compared: number
  norm: boolean
  reverses: boolean
  gauss: boolean
  bits: number
}

// exact run against the float runner for `compare` beats (chosen so no string exceeds half the ring, where the
// runner's smallest-arc span equals the flux count), then the norm identity and the exact reversal over `beats`
export function driftExactCheck(
  s: DriftCostSpec,
  starts: readonly LockedStart[],
  compare: number,
  beats: number,
): DriftExactCheck {
  const n = s.kinds.length
  const minAbs = Math.min(...starts.map(e => Math.abs(e.amp[0])))
  const st: DriftExact = driftStart(
    s,
    starts.map(e => ({
      registers: placedDrift(s, [...e.x], [...e.j]),
      weight: BigInt(Math.round(e.amp[0] / minAbs)),
    })),
  )
  const startCopy = new Map([...st.amp].map(([i, v]) => [i, v.slice()]))
  const fl = lockedRun({
    ring: s.ring,
    kinds: s.kinds,
    convention: s.convention,
    unlike: s.unlike,
    start: starts,
  })
  const R = 3 ** n
  const P = s.ring ** n
  const costRe = new Float64Array(P)
  const costIm = new Float64Array(P)
  const xs = new Array<number>(n)

  for (let p = 0; p < P; p++) {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      xs[t] = c % s.ring
      c = Math.floor(c / s.ring)
    }

    const th =
      (-2 * Math.PI * ((s.cost * spanOf(s.ring, xs)) % s.root)) / s.root

    costRe[p] = Math.cos(th)
    costIm[p] = Math.sin(th)
  }

  let gap = 0
  let gauss = true

  for (let t = 0; t < beats; t++) {
    driftBeat(st)

    for (const i of st.amp.keys()) {
      if (!gaussHoldsDrift(s, decodeDrift(s, i))) {
        gauss = false
      }
    }

    if (t >= compare) {
      continue
    }

    for (let p = 0; p < P; p++) {
      for (let r = 0; r < R; r++) {
        const i = p * R + r
        const vr = fl.re[i]!
        const vi = fl.im[i]!

        fl.re[i] = vr * costRe[p]! - vi * costIm[p]!
        fl.im[i] = vr * costIm[p]! + vi * costRe[p]!
      }
    }

    fl.beat()

    const seen = new Map<number, [number, number]>()

    for (const [i, v] of st.amp) {
      const r = decodeDrift(s, i)
      const p = r.x.reduce((a, x) => a * s.ring + x, 0)
      const lab = r.j.reduce((a, j) => a * 3 + j, 0)
      const at = p * R + lab
      const [vr, vi] = toComplex(v, st.den, st.k)
      const prev = seen.get(at)

      seen.set(
        at,
        prev
          ? [prev[0] + vr * minAbs, prev[1] + vi * minAbs]
          : [vr * minAbs, vi * minAbs],
      )
    }

    for (let at = 0; at < fl.re.length; at++) {
      const e = seen.get(at) ?? [0, 0]

      gap = Math.max(
        gap,
        Math.hypot(e[0] - fl.re[at]!, e[1] - fl.im[at]!),
      )
    }
  }

  const k = st.k

  const normOf = (amp: Map<number, bigint[]>): bigint[] => {
    const acc = new Array<bigint>(k).fill(0n)

    for (const raw of amp.values()) {
      const v = canonical(raw, k)
      const nz: number[] = []

      for (let a = 0; a < k; a++) {
        if (v[a] !== 0n) {
          nz.push(a)
        }
      }

      for (const a of nz) {
        for (const b of nz) {
          acc[mod(a - b, k)] = acc[mod(a - b, k)]! + v[a]! * v[b]!
        }
      }
    }

    return canonical(acc, k)
  }

  const n0 = normOf(startCopy)
  const n1 = normOf(st.amp)
  const norm = n1.every((x, i) => x === (n0[i] ?? 0n) * st.den * st.den)
  const forward = st.den
  const bits = forward.toString(2).length

  for (let t = 0; t < beats; t++) {
    driftBeatBack(st)
  }

  let reverses = [...startCopy.keys()].every(i => st.amp.has(i))

  for (const [i, v] of st.amp) {
    const want = startCopy.get(i)
    const got = canonical(v, k)
    const target = want
      ? canonical(
          want.map(x => x * forward * forward),
          k,
        )
      : new Array<bigint>(k).fill(0n)

    if (!got.every((x, a) => x === (target[a] ?? 0n))) {
      reverses = false
    }
  }

  return {
    gap,
    compared: Math.min(compare, beats),
    norm,
    reverses,
    gauss,
    bits,
  }
}
