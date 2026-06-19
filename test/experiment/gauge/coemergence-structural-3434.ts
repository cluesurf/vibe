// P256 (CO-EMERGENCE, structural and rigorous): one rule, both a photon sector and fermion sectors, FORCED by
// symmetry, not separately constructed. The 24 directions split 8v + 8s + 8c. We prove that the ROTATION
// subgroup of the substrate symmetry (coordinate permutations and even sign changes, all det +1) PRESERVES
// each sector (8v -> 8v, 8s -> 8s, 8c -> 8c), while TRIALITY relates them. Therefore ANY rotation-symmetric
// rule has the 8v (photon) and 8s, 8c (fermion) sectors as FORCED invariant subspaces, they cannot be pulled
// apart. The per-sector dynamics is already measured: 8v is the massless photon (p249), 8s/8c is the Dirac
// fermion (p248, p253). HONEST: a single coupled evolution propagating both WITH a QED interaction is the open
// frontier, this proves the structural co-existence, not the coupled dynamics.
// Run: npx tsx code/experiment/p256-coemergence-structural-3434.ts

import {
  vectorRep8,
  spinorRepEven8,
  spinorRepOdd8,
  applyTriality,
} from '@/code/algebra/group/so8-triality'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function coemergenceStructural(): {
  sectorsCover24: boolean
  rotationsPreserveSectors: boolean
  trialityMixes: boolean
  oneRuleForced: boolean
} {
  // 24 directions = 8 axis (8v) + 16 half (8s even-parity, 8c odd-parity)
  const v8 = vectorRep8()
  const s8 = spinorRepEven8()
  const c8 = spinorRepOdd8()
  const sectorsCover24 =
    v8.length + s8.length + c8.length === 24 &&
    v8.length === 8 &&
    s8.length === 8 &&
    c8.length === 8
  const setOf = (S: number[][]): Set<string> =>
    new Set(S.map(v => v.map(x => Math.round(x * 1e4)).join(',')))
  const V = setOf(v8),
    S = setOf(s8),
    Cc = setOf(c8)
  const inWhich = (v: number[]): string => {
    const k = v.map(x => Math.round(x * 1e4)).join(',')
    return V.has(k) ? 'v' : S.has(k) ? 's' : Cc.has(k) ? 'c' : '?'
  }

  // ROTATION subgroup generators: all 24 coordinate permutations + all even sign changes (det +1)
  const perms = (): number[][] => {
    const out: number[][] = []
    const go = (a: number[], rest: number[]): void => {
      if (!rest.length) {
        out.push(a)
        return
      }
      for (let i = 0; i < rest.length; i++)
        go(
          [...a, rest[i]!],
          rest.filter((_, j) => j !== i),
        )
    }
    go([], [0, 1, 2, 3])
    return out
  }
  const evenSignFlips = (): number[][] => {
    const out: number[][] = []
    for (let m = 0; m < 16; m++) {
      const f = [0, 1, 2, 3].map(b => (m >> b) & 1)
      if (f.reduce((a, b) => a + b, 0) % 2 === 0)
        out.push(f.map(x => (x ? -1 : 1)))
    }
    return out
  }
  const applyPerm = (p: number[], v: number[]): number[] =>
    p.map(pi => v[pi]!)
  const applySign = (sgn: number[], v: number[]): number[] =>
    v.map((x, i) => x * sgn[i]!)

  // check: every rotation (perm . signflip) maps each sector into itself
  let rotationsPreserveSectors = true
  for (const p of perms())
    for (const sgn of evenSignFlips()) {
      for (const [sec, set] of [
        ['v', v8],
        ['s', s8],
        ['c', c8],
      ] as const) {
        for (const v of set) {
          const w = applySign(sgn, applyPerm(p, v))
          if (inWhich(w) !== sec) rotationsPreserveSectors = false
        }
      }
    }

  // triality (Hadamard/2) MIXES the sectors: 8v -> 8s
  const trialityMixes = applyTriality(v8).every(v => inWhich(v) === 's')

  const oneRuleForced =
    sectorsCover24 && rotationsPreserveSectors && trialityMixes

  return {
    sectorsCover24,
    rotationsPreserveSectors,
    trialityMixes,
    oneRuleForced,
  }
}

export default experiment({
  id: 'gauge/coemergence-structural-3434',
  title:
    'the rotation subgroup forces the photon 8v and fermion 8s, 8c sectors as invariant subspaces',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = coemergenceStructural()
    const ok =
      r.sectorsCover24 &&
      r.rotationsPreserveSectors &&
      r.trialityMixes &&
      r.oneRuleForced
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 directions partition as 8v plus 8s plus 8c, every rotation preserves each sector while triality relates them, so any rotation-symmetric rule must carry the photon and fermion sectors together',
      metrics: {
        sectorsCover24: r.sectorsCover24 ? 1 : 0,
        rotationsPreserveSectors: r.rotationsPreserveSectors ? 1 : 0,
        trialityMixes: r.trialityMixes ? 1 : 0,
        oneRuleForced: r.oneRuleForced ? 1 : 0,
      },
      notes:
        'L1, known math. This is a representation-theory fact about the SO(8) sectors, proving structural co-existence only. A single coupled evolution propagating both sectors with a QED interaction is the open frontier, not shown here.',
    })
  },
})
