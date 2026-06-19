// P193: porting the {5,3,4} behaviours to the {3,4,3,4} cusp ({4,3,4} cubic), they match. (1) the wave's
// LIGHTCONE is ballistic z=1, (2) the perception rule from a seed CHURNS to a steady state with no self
// (P101), (3) two opposite selves ANNIHILATE on contact (P110). Ported from the throwaway probes.
// Run: npx tsx code/experiment/p193-ports-3434.ts

import { makeRng } from '@/code/tool/rng'
import { parityBlockBeat3D } from '@/code/operator/ternary-permutation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The deterministic ternary pair rule and its 3D Margolus parity block sweep live in
// code/operator/ternary-permutation.
const L = 61
const at = (x: number, y: number, z: number): number =>
  (((z % L) + L) % L) * L * L +
  (((y % L) + L) % L) * L +
  (((x % L) + L) % L)

function lightcone(): { ok: boolean; radii: [number, number][] } {
  let cur = new Int8Array(L * L * L),
    prev = new Int8Array(L * L * L),
    nxt = new Int8Array(L * L * L)
  const c = L >> 1
  cur[at(c, c, c)] = 1
  const D = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ]
  const radii: [number, number][] = []
  for (let b = 0; b <= 24; b++) {
    if ([6, 12, 24].includes(b)) {
      let r = 0
      for (let z = 0; z < L; z++) {
        for (let y = 0; y < L; y++) {
          for (let x = 0; x < L; x++) {
            if (cur[at(x, y, z)] !== 0) {
              r = Math.max(
                r,
                Math.abs(x - c),
                Math.abs(y - c),
                Math.abs(z - c),
              )
            }
          }
        }
      }
      radii.push([b, r])
    }
    for (let z = 0; z < L; z++) {
      for (let y = 0; y < L; y++) {
        for (let x = 0; x < L; x++) {
          let s = 0
          for (const d of D) {
            s += cur[at(x + d[0]!, y + d[1]!, z + d[2]!)]!
          }
          nxt[at(x, y, z)] = ((((s - prev[at(x, y, z)]!) % 3) + 3) %
            3) as 0 | 1 | 2
        }
      }
    }
    const t = prev
    prev = cur
    cur = nxt
    nxt = t
  }
  const ok = radii.every(([b, r]) => r === b)
  return { ok, radii }
}

const beat = (t: Int8Array, create: boolean): void =>
  parityBlockBeat3D({ tone: t, side: L, index: at, create })

export function ports(): {
  lightconeOk: boolean
  churnPct: number
  annihilates: boolean
} {
  const lc = lightcone()

  // churn from a small symmetry-breaking seed
  const rng = makeRng({ seed: 3 })
  const rnd = (): number => rng.next()
  const t = new Int8Array(L * L * L)
  for (let k = 0; k < 200; k++) {
    t[Math.floor(rnd() * L * L * L)] = (rnd() < 0.5 ? 1 : -1) as -1 | 1
  }
  for (let b = 0; b < 40; b++) {
    beat(t, true)
  }
  let ch = 0
  for (let i = 0; i < t.length; i++) {
    if (t[i] !== 0) {
      ch++
    }
  }
  const churnPct = Math.round((100 * ch) / t.length)

  // two opposite selves annihilate
  const t2 = new Int8Array(L * L * L)
  const c = L >> 1
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dz = -2; dz <= 2; dz++) {
        t2[at(c - 8 + dx, c + dy, c + dz)] = 1
        t2[at(c + 8 + dx, c + dy, c + dz)] = -1
      }
    }
  }
  const count = (): [number, number] => {
    let p = 0,
      m = 0
    for (let i = 0; i < t2.length; i++) {
      if (t2[i] === 1) {
        p++
      } else if (t2[i] === -1) {
        m++
      }
    }
    return [p, m]
  }
  const start = count()
  for (let b = 0; b < 40; b++) {
    beat(t2, false)
  }
  const end = count()
  const annihilates = end[0] < start[0]
  return { lightconeOk: lc.ok, churnPct, annihilates }
}

export default experiment({
  id: 'substrate-survey/ports-3434',
  title:
    'the {5,3,4} behaviours port to the {4,3,4} cubic cusp, a z=1 light cone, churn, and self annihilation',
  category: 'substrate-survey',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = ports()
    const ok = r.lightconeOk && r.annihilates
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the {4,3,4} cubic cusp the wave spreads as a ballistic z=1 light cone and two opposite selves annihilate on contact, matching the {5,3,4} ports',
      metrics: {
        lightconeOk: r.lightconeOk ? 1 : 0,
        churnPct: r.churnPct,
        annihilates: r.annihilates ? 1 : 0,
      },
      notes:
        'L2, a ballistic light cone and pair annihilation reproduced on the cubic cusp. The light cone front is measured from a single deterministic delta seed. The churn and annihilation runs start from a fixed-seed pseudo-random fill, so the churn percent is a property of that one configuration, not an ensemble average, and the annihilation check only verifies the positive count drops, not full cancellation.',
    })
  },
})
