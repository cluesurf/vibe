// How close to the qutrit T gate do words with 3 or more swap phases come, and what grain does each finer
// step cost? E-QTM-0101 enumerated every word with one and two swap phases between Sigma(648) moves on two
// roles: one gives no step finer than the classical color group (0.650) and no closer approach to T x 1
// (0.716 against the classical 0.395); two give the first finer step, sqrt(1/6) = 0.408, and still 0.395
// to T. Past two, exhaustive enumeration is out of reach (46,656 local moves per layer), so this is a beam.
//
// A word with m swap phases is W = (C x 1) V1 L1 V2 L2 ... Vm Lm, each V the swap phase at 2 pi / 3 or its
// inverse (one fear beat either way, both in quarters) and each L one of the 46,656 local moves A x B,
// A and B in Sigma(648) up to phase. The left layer is (C x 1) alone without loss, since U commutes with
// B x B. Every prefix (C x 1) V1 ... Vm is scored against all 46,656 last layers at once by a partial-trace
// identity, Tr(Z (A x B)) = Tr(B Q_A), Q_A = sum over i1, j1 of A_(j1 i1) Z_((i1 .), (j1 .)). The best 500
// distinct words go on, each times V and V^-1, as the next level's prefixes. So level 1 is exhaustive
// and later levels are the best found, upper bounds on the true distances. Two targets: T x 1, and the
// identity (the smallest step, words equal to 1 excluded). Distance d(V, W) = sqrt(1 - |Tr V^dagger W| / 9).
//
// Gates, fixed before the run: level 1 reproduces E-QTM-0101's exhaustive 0.716030 (to T) and 0.650115
// (step) to 1e-9, a calibration of the beam; level 2 reaches the exhaustive 0.394931 and 0.408248 to 1e-9,
// which says how much the beam loses. Reported per level: the best distance to T x 1 and to 1, and the
// Wigner kernel of each best word: its denominator as a power of 2 (the grain) and its negative entries.
//
// The first run failed the level-2 gate toward T: the beam found 0.497 where the exhaustive search has
// 0.395. The exhaustive optimum is a word whose two swap phases cancel (its kernel has no fears, it is the
// best Clifford element), and the beam, which keeps level-1 words closest to T, never holds the prefix
// that leads to it. The failure stands. The per-level distances are therefore not monotone (odd levels
// come out worse), and the useful reading is the best over all levels up to m.
//
// Depth L1: numerical search over exact group words, floating point.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { generateGroup } from '@/code/dynamics/finite-gauge'
import { QUTRIT_T, SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { phaseSpaceAction } from '@/code/measure/qutrit-phase-space'
import { swapPhase, wignerKernel } from '@/code/rule/fear-weave'
import { adjointOperator, identityOperator, multiplyOperators, operator, tensorOperators, type Operator } from '@/code/measure/grid-weights'

const OMEGA = (2 * Math.PI) / 3
const BEAM = 500
const POOL = 2000
const LEVELS = 7

// a min-heap of the POOL largest scores, each with an id
class TopScores {
  readonly score: Float64Array
  readonly id: Float64Array
  size = 0

  constructor(readonly capacity: number) {
    this.score = new Float64Array(capacity)
    this.id = new Float64Array(capacity)
  }

  offer(value: number, id: number): void {
    if (this.size < this.capacity) {
      let i = this.size++

      this.score[i] = value
      this.id[i] = id

      while (i > 0) {
        const parent = (i - 1) >> 1

        if ((this.score[parent] ?? 0) <= value) {
          break
        }

        this.swap(i, parent)
        i = parent
      }

      return
    }

    if (value <= (this.score[0] ?? 0)) {
      return
    }

    this.score[0] = value
    this.id[0] = id

    let i = 0

    for (;;) {
      const l = 2 * i + 1
      const r = l + 1
      let m = i

      if (l < this.size && (this.score[l] ?? 0) < (this.score[m] ?? 0)) {
        m = l
      }

      if (r < this.size && (this.score[r] ?? 0) < (this.score[m] ?? 0)) {
        m = r
      }

      if (m === i) {
        break
      }

      this.swap(i, m)
      i = m
    }
  }

  private swap(i: number, j: number): void {
    const s = this.score[i] ?? 0
    const d = this.id[i] ?? 0

    this.score[i] = this.score[j] ?? 0
    this.id[i] = this.id[j] ?? 0
    this.score[j] = s
    this.id[j] = d
  }

  sorted(): { score: number; id: number }[] {
    return Array.from({ length: this.size }, (_, i) => ({ score: this.score[i] ?? 0, id: this.id[i] ?? 0 })).sort((a, b) => b.score - a.score || a.id - b.id)
  }
}

function phaseKey(a: Operator): string {
  let best = 0
  let at = 0

  for (let i = 0; i < a.n * a.n; i++) {
    const m = Math.hypot(a.re[i] ?? 0, a.im[i] ?? 0)

    if (m > best + 1e-6) {
      best = m
      at = i
    }
  }

  const angle = Math.atan2(a.im[at] ?? 0, a.re[at] ?? 0)
  const c = Math.cos(-angle)
  const s = Math.sin(-angle)
  const parts: number[] = []

  for (let i = 0; i < a.n * a.n; i++) {
    parts.push(Math.round(((a.re[i] ?? 0) * c - (a.im[i] ?? 0) * s) * 1e6) || 0, Math.round(((a.re[i] ?? 0) * s + (a.im[i] ?? 0) * c) * 1e6) || 0)
  }

  return parts.join(',')
}

export default experiment({
  id: 'quantum/swap-phase-ladder',
  code: 'E-QTM-0104',
  title:
    'the ladder toward T: words of Sigma(648) moves on two roles with m cube-root swap phases, searched level by level, give how close each number of fear beats comes to the qutrit T gate on one role and to the identity, and what grain each finer step costs',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const group = generateGroup({ generators: SU3_SUBGROUPS.sigma648.generators, limit: 4000 })
    const seen = new Set<string>()
    const clifford: Operator[] = []

    group.matrices.forEach(m => {
      const key = (phaseSpaceAction({ unitary: m }) ?? []).join(',')

      if (!seen.has(key)) {
        seen.add(key)

        const o = operator(3)

        for (let k = 0; k < 9; k++) {
          o.re[k] = m[2 * k] ?? 0
          o.im[k] = m[2 * k + 1] ?? 0
        }

        clifford.push(o)
      }
    })

    const one = identityOperator(3)
    const u = swapPhase(OMEGA)
    const ud = adjointOperator(u)
    const t = operator(3)

    for (let k = 0; k < 9; k++) {
      t.re[k] = QUTRIT_T[2 * k] ?? 0
      t.im[k] = QUTRIT_T[2 * k + 1] ?? 0
    }

    const n = clifford.length
    // the Clifford entries as flat arrays for the inner loop
    const cr = new Float64Array(n * 9)
    const ci = new Float64Array(n * 9)

    clifford.forEach((c, i) => {
      for (let k = 0; k < 9; k++) {
        cr[i * 9 + k] = c.re[k] ?? 0
        ci[i * 9 + k] = c.im[k] ?? 0
      }
    })

    const climb = (target: Operator, skipIdentity: boolean) => {
      const xd = adjointOperator(target)
      let prefixes: Operator[] = clifford.flatMap(c => [multiplyOperators(tensorOperators(c, one), u), multiplyOperators(tensorOperators(c, one), ud)])
      const levels: { distance: number; word: Operator }[] = []
      const q = new Float64Array(18)

      for (let level = 1; level <= LEVELS; level++) {
        const top = new TopScores(POOL)

        prefixes.forEach((prefix, pi) => {
          const z = multiplyOperators(xd, prefix)

          for (let a = 0; a < n; a++) {
            // Q_(i2 j2) = sum A_(j1 i1) Z_((i1 i2), (j1 j2))
            q.fill(0)

            for (let i1 = 0; i1 < 3; i1++) {
              for (let j1 = 0; j1 < 3; j1++) {
                const ar = cr[a * 9 + j1 * 3 + i1] ?? 0
                const ai = ci[a * 9 + j1 * 3 + i1] ?? 0

                for (let i2 = 0; i2 < 3; i2++) {
                  for (let j2 = 0; j2 < 3; j2++) {
                    const at = (i1 * 3 + i2) * 9 + (j1 * 3 + j2)
                    const zr = z.re[at] ?? 0
                    const zi = z.im[at] ?? 0

                    q[2 * (i2 * 3 + j2)] = (q[2 * (i2 * 3 + j2)] ?? 0) + ar * zr - ai * zi
                    q[2 * (i2 * 3 + j2) + 1] = (q[2 * (i2 * 3 + j2) + 1] ?? 0) + ar * zi + ai * zr
                  }
                }
              }
            }

            for (let b = 0; b < n; b++) {
              // Tr(B Q) = sum B_(j2 i2) Q_(i2 j2)
              let re = 0
              let im = 0

              for (let i2 = 0; i2 < 3; i2++) {
                for (let j2 = 0; j2 < 3; j2++) {
                  const br = cr[b * 9 + j2 * 3 + i2] ?? 0
                  const bi = ci[b * 9 + j2 * 3 + i2] ?? 0
                  const qr = q[2 * (i2 * 3 + j2)] ?? 0
                  const qi = q[2 * (i2 * 3 + j2) + 1] ?? 0

                  re += br * qr - bi * qi
                  im += br * qi + bi * qr
                }
              }

              const value = Math.hypot(re, im)

              if (skipIdentity && value > 9 - 1e-7) {
                continue
              }

              top.offer(value, (pi * n + a) * n + b)
            }
          }
        })

        const kept: Operator[] = []
        const keys = new Set<string>()
        let best: { distance: number; word: Operator } | undefined

        for (const { score, id } of top.sorted()) {
          const b = id % n
          const a = Math.floor(id / n) % n
          const pi = Math.floor(id / (n * n))
          const word = multiplyOperators(prefixes[pi] ?? u, tensorOperators(clifford[a] ?? one, clifford[b] ?? one))
          const key = phaseKey(word)

          if (keys.has(key)) {
            continue
          }

          keys.add(key)
          best = best ?? { distance: Math.sqrt(Math.max(0, 1 - score / 9)), word }
          kept.push(word)

          if (kept.length >= BEAM) {
            break
          }
        }

        levels.push(best ?? { distance: 1, word: u })
        prefixes = kept.flatMap(w => [multiplyOperators(w, u), multiplyOperators(w, ud)])
      }

      return levels
    }

    const grain = (word: Operator): { power: number; negative: number } => {
      const k = wignerKernel(word)
      let power = -1

      for (let p = 0; p <= 2 * LEVELS + 2 && power < 0; p++) {
        const s = 2 ** p

        power = k.every(row => row.every(x => Math.abs(s * x - Math.round(s * x)) < 1e-7)) ? p : -1
      }

      return { power, negative: k.flat().filter(x => x < -1e-9).length }
    }

    const toT = climb(tensorOperators(t, one), false)
    const toOne = climb(identityOperator(9), true)
    const grainT = toT.map(l => grain(l.word))
    const grainOne = toOne.map(l => grain(l.word))
    const classicalT = 0.39493084363469855

    const ok =
      Math.abs((toT[0]?.distance ?? 0) - 0.7160302134962501) < 1e-9 &&
      Math.abs((toOne[0]?.distance ?? 0) - 0.6501151673437363) < 1e-9 &&
      Math.abs((toT[1]?.distance ?? 0) - 0.39493084363469855) < 1e-9 &&
      Math.abs((toOne[1]?.distance ?? 0) - 0.40824829046386313) < 1e-9

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the beam reproduces the exhaustive one-swap-phase distances and the two-swap-phase step, but misses the two-swap-phase approach to T (0.497 found against the exhaustive 0.395, a word that is classical after cancellation), a failed gate that stands; the best words found come closer to T than any classical element first with 4 swap phases (0.362, grain 2^8) and then 6 (0.348, grain 2^12), the smallest step reaches sqrt(1/8) = 0.354 at 4, and each swap phase in a best word costs a factor 4 of grain up to 6',
      metrics: {
        ...Object.fromEntries(toT.map((l, i) => [`distanceToTWith${i + 1}`, l.distance])),
        ...Object.fromEntries(toOne.map((l, i) => [`smallestStepWith${i + 1}`, l.distance])),
        ...Object.fromEntries(grainT.map((g, i) => [`grainPowerOf2TWord${i + 1}`, g.power])),
        ...Object.fromEntries(grainT.map((g, i) => [`negativeEntriesTWord${i + 1}`, g.negative])),
        ...Object.fromEntries(grainOne.map((g, i) => [`grainPowerOf2StepWord${i + 1}`, g.power])),
        ...Object.fromEntries(grainOne.map((g, i) => [`negativeEntriesStepWord${i + 1}`, g.negative])),
        firstLevelBelowClassicalT: toT.findIndex(l => l.distance < classicalT - 1e-9) + 1,
      },
      control: {
        classicalDistanceToT: classicalT,
        classicalSmallestStep: 0.6501151673437358,
        beamWidth: BEAM,
        localMovesPerLayer: n * n,
      },
      notes:
        'L1, floating point on exact group words. Level 1 is exhaustive; every later level keeps the best 500 distinct words (up to phase, at 1e-6) from all 46,656 last layers on each of 1,000 prefixes, so its distances are upper bounds. The grain is the smallest power of 2 up to 2^16 that makes the best word Wigner kernel whole (-1 if none), each swap phase costing at most a factor 4. firstLevelBelowClassicalT is 0 when no level beats the best Clifford approximation of T.',
    })
  },
})
