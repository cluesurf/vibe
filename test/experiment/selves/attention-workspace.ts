// P119: attention and a global workspace, emergent from the base. (minimal-additions-for-consciousness.md.)
//
// The hub is the global WORKSPACE: the single place where every boundary sector's signal converges (P116).
// ATTENTION is a gain on that workspace: drive ONE sector strongly and the others weakly, and the attended
// sector should WIN the workspace, the hub represents the attended signal far more than the unattended ones.
//
// Honest scope: the workspace is the hub (the convergence point), and attention selects its content.
// Physical BROADCAST to the FAR periphery is range-limited (the field is massive, short-ranged, P114), so
// the winning content is available AT the workspace, not copied to every distant cell.
//
// Determinism (June 2026 audit): the old version drove the dynamics with rng (a random hop coin, random
// distractors, random signal flips) and its single-seed pass flipped under seed 10 and duration 240, against
// the determinism methodology. This version is fully deterministic, the hop coin is an alternating edge-beat
// parity, the signal is a fixed square wave, the drive gain is a rotating deterministic duty cycle, and the
// distractors are a fixed integer-mixer pattern. The verdict is set from the robust result across 3 signal
// schedules and 2 durations. FINDING: the attention differential is consistently POSITIVE in every schedule
// (raising the gain always raises the hub correlation, for both regions), but it does not robustly clear the
// committed bars, salience (both gains above 0.5) fails at the fastest schedule and the 0.15 gain bar fails
// at the slowest, so the strong workspace claim stays OPEN.

import { pearson } from '@/code/measure/statistics'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { csrDistances, edgesFromCsr } from '@/code/tool/graph'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the deterministic hop coin: an edge moves charge on alternating beats (edge-beat parity), the
// deterministic stand-in for the old 0.5 coin
function fullBeat(
  tone: Int8Array,
  eu: Int32Array,
  ev: Int32Array,
  moved: Uint8Array,
  beatIndex: number,
): void {
  moved.fill(0)

  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!

    if (moved[v] || moved[w]) {
      continue
    }

    const a = tone[v]!
    const b = tone[w]!

    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w

      if ((k + beatIndex) % 2 === 0) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

// a fixed integer mixer for the distractor pattern, deterministic pseudo-noise with no rng state
const mixBit = (i: number, t: number): number =>
  ((Math.imul(i + 1, 2654435761) ^ Math.imul(t + 1, 40503)) >>> 0) & 1

export type AttentionCase = {
  halfPeriod: number
  T: number
  attendedCorrA: number
  unattendedCorrA: number
  attendedCorrB: number
  unattendedCorrB: number
  topDownGain: boolean
  bottomUpSalience: boolean
}

export function attentionWorkspace(input?: {
  n?: number
  halfPeriods?: number[]
  durations?: number[]
}): {
  n: number
  cases: AttentionCase[]
  allTopDownGain: boolean
  allBottomUpSalience: boolean
  allPositiveDifferential: boolean
} {
  const n = input?.n ?? 60000
  const halfPeriods = input?.halfPeriods ?? [8, 12, 20]
  const durations = input?.durations ?? [120, 240]
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)

  let center = 0

  for (let i = 1; i < N; i++) {
    if (
      g.offsets[i + 1]! - g.offsets[i]! >
      g.offsets[center + 1]! - g.offsets[center]!
    ) {
      center = i
    }
  }

  const dist = csrDistances({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: center,
    maxRadius: 12,
  })

  const rSelf = 5
  const self: number[] = []

  for (let i = 0; i < N; i++) {
    if (dist[i]! >= 0 && dist[i]! <= rSelf) {
      self.push(i)
    }
  }

  const isInput = new Uint8Array(N)
  const inputAll: number[] = []

  for (const i of self) {
    if (dist[i]! >= rSelf - 1) {
      isInput[i] = 1
      inputAll.push(i)
    }
  }

  // K spatially-coherent sectors: farthest-point seeds among the boundary, then nearest-seed (Voronoi)
  const msBFS = (
    srcs: number[],
  ): { dist: Int32Array; label: Int32Array } => {
    const d = new Int32Array(N).fill(-1)
    const lab = new Int32Array(N).fill(-1)

    let fr: number[] = []

    for (let s = 0; s < srcs.length; s++) {
      d[srcs[s]!] = 0
      lab[srcs[s]!] = s
      fr.push(srcs[s]!)
    }

    while (fr.length > 0) {
      const next: number[] = []

      for (const u of fr) {
        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          const w = g.adj[p]!

          if (d[w] === -1) {
            d[w] = d[u]! + 1
            lab[w] = lab[u]!
            next.push(w)
          }
        }
      }

      fr = next
    }

    return { dist: d, label: lab }
  }

  // two coherent input regions A and B (two farthest-point seeds), the rest of the boundary = background
  const seeds: number[] = [inputAll[0]!]

  {
    const { dist: d } = msBFS(seeds)

    let far = inputAll[0]!
    let fd = -1

    for (const i of inputAll) {
      if (d[i]! > fd) {
        fd = d[i]!
        far = i
      }
    }

    seeds.push(far)
  }

  const { label } = msBFS(seeds)
  const regionA = inputAll.filter(i => label[i] === 0)
  const regionB = inputAll.filter(i => label[i] === 1)

  const hubBall = (): number[] => {
    const out: number[] = []
    const seen = new Uint8Array(N)
    seen[center] = 1

    let fr = [center]

    while (fr.length > 0 && out.length < 40) {
      const nf: number[] = []

      for (const u of fr) {
        if (isInput[u]) {
          continue
        }

        out.push(u)

        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          const w = g.adj[p]!

          if (!seen[w]) {
            seen[w] = 1
            nf.push(w)
          }
        }
      }

      fr = nf
    }

    return out
  }

  const hub = hubBall()

  const meanOver = (tone: Int8Array, cells: number[]): number => {
    let s = 0

    for (const i of cells) {
      s += tone[i]!
    }

    return cells.length > 0 ? s / cells.length : 0
  }

  // drive a region with a square-wave signal at the given GAIN (attended = 1.0, ignored = 0.25), with the
  // rest of the boundary as a fixed distractor pattern. Return how well the hub represents that signal.
  const otherBoundary = inputAll.filter(
    i => label[i] !== 0 && label[i] !== 1,
  )

  function trial(
    region: number[],
    gain: number,
    halfPeriod: number,
    T: number,
  ): number {
    const tone = new Int8Array(N)
    const hubS: number[] = []
    const sigS: number[] = []
    const noiseTargets = otherBoundary.concat(
      region === regionA ? regionB : regionA,
    )

    // the deterministic duty cycle: gain g drives a rotating g-fraction of the region's cells each beat
    const duty = Math.round(gain * 4)

    const drive = (t: number, sig: number): void => {
      for (let j = 0; j < region.length; j++) {
        if ((j + t) % 4 < duty) {
          tone[region[j]!] = sig
        }
      }

      for (const i of noiseTargets) {
        tone[i] = mixBit(i, t) === 1 ? 1 : -1
      }
    }

    for (let t = 0; t < T; t++) {
      // the fixed square-wave signal, flipping every halfPeriod beats
      const sig = Math.floor(t / halfPeriod) % 2 === 0 ? 1 : -1

      drive(t, sig)
      fullBeat(tone, eu, ev, moved, t)
      drive(t, sig)
      hubS.push(meanOver(tone, hub))
      sigS.push(sig)
    }

    return Math.abs(pearson({ a: hubS, b: sigS }))
  }

  // The hub-workspace shows BOTH mechanisms of attention: bottom-up SALIENCE (the well-coupled input A is
  // represented in the hub regardless of gain) and top-down GAIN (raising the drive on the competing input B
  // boosts its hub representation).
  const cases: AttentionCase[] = []

  for (const halfPeriod of halfPeriods) {
    for (const T of durations) {
      const aHi = trial(regionA, 1.0, halfPeriod, T)
      const aLo = trial(regionA, 0.25, halfPeriod, T)
      const bHi = trial(regionB, 1.0, halfPeriod, T)
      const bLo = trial(regionB, 0.25, halfPeriod, T)

      cases.push({
        halfPeriod,
        T,
        attendedCorrA: aHi,
        unattendedCorrA: aLo,
        attendedCorrB: bHi,
        unattendedCorrB: bLo,
        topDownGain: bHi > bLo + 0.15,
        bottomUpSalience: aHi > 0.5 && aLo > 0.5,
      })
    }
  }

  return {
    n: N,
    cases,
    allTopDownGain: cases.every(c => c.topDownGain),
    allBottomUpSalience: cases.every(c => c.bottomUpSalience),
    allPositiveDifferential: cases.every(
      c =>
        c.attendedCorrA > c.unattendedCorrA &&
        c.attendedCorrB > c.unattendedCorrB,
    ),
  }
}

export default experiment({
  id: 'selves/attention-workspace',
  code: 'E-SLF-0006',
  title:
    'the deterministic hub-workspace attention differential is consistently positive but does not robustly clear the bars, open',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = attentionWorkspace({
      n: 60000,
      halfPeriods: [8, 12, 20],
      durations: [120, 240],
    })

    const robust = r.allTopDownGain && r.allBottomUpSalience

    const worstGain = r.cases.reduce((min, c) =>
      c.attendedCorrB - c.unattendedCorrB <
      min.attendedCorrB - min.unattendedCorrB
        ? c
        : min,
    )

    const first = r.cases[0]!

    return verdict({
      status: robust ? 'pass' : 'open',
      claim:
        'under a fully deterministic drive (square-wave signals, rotating duty-cycle gain, fixed distractor pattern, alternating-parity hop) the hub attention differential is consistently positive, raising the drive gain on a region raises its hub correlation in every one of the 6 schedule-duration cases, but it does not robustly clear the committed bars, salience (both gains above 0.5) fails at halfPeriod 8 and the 0.15 top-down gain bar fails at halfPeriod 20 with T 120, so the strong workspace claim remains open',
      metrics: {
        attendedCorrA: first.attendedCorrA,
        unattendedCorrA: first.unattendedCorrA,
        attendedCorrB: first.attendedCorrB,
        unattendedCorrB: first.unattendedCorrB,
        worstGainAttendedCorrB: worstGain.attendedCorrB,
        worstGainUnattendedCorrB: worstGain.unattendedCorrB,
        scheduleCount: r.cases.length,
        allTopDownGain: r.allTopDownGain ? 1 : 0,
        allBottomUpSalience: r.allBottomUpSalience ? 1 : 0,
        allPositiveDifferential: r.allPositiveDifferential ? 1 : 0,
      },
      control: {
        unattendedCorrA: first.unattendedCorrA,
        unattendedCorrB: first.unattendedCorrB,
      },
      notes:
        'open by the June 2026 audit, the old rng-driven single-seed pass flipped under seed 10 and T=240, so the dynamics was determinized (no rng anywhere) and the verdict set from the robust result over halfPeriods 8/12/20 and T 120/240. The honest finding, attention (drive gain) always helps but the effect size depends on the signal schedule, so bottom-up salience and top-down gain do not both hold across all schedules. The workspace is the hub itself, physical broadcast to the far periphery is range-limited. Prior art: global workspace theory (Baars, and the Dehaene-Changeux global neuronal workspace) for the converge-and-win architecture, and biased competition (Desimone and Duncan) for gain as the selector',
    })
  },
})
