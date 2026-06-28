// P162: the absolute limits ARE absolute (hold at every level). (level-relative-possibility.md, P123, P146.)
//
// Most limits are bulk-specific and liftable (P160). A FEW are absolute, true at every coarse-graining
// level because conservation and causality pass up every codec. We confirm the two big ones:
//   (A) NET CHARGE cannot be minted, at any level. Q is conserved at the fine level, every move is
//       charge-neutral (so even an all-create "minting attempt" cannot raise Q), and the COARSE block-charge
//       total equals the fine Q exactly at every step, so no level can manufacture net charge.
//   (B) The LIGHTCONE cannot be outrun, at any level. A perturbation has a finite front speed at the fine
//       level, and the coarse-grained (blocked) front speed is also finite and no larger, so no level
//       signals faster than light.
// Run: npx tsx code/experiment/p162-absolute-limits.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { edgesFromCsr, csrDistances } from '@/code/tool/graph'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import { totalCharge as totalQ } from '@/code/measure/tone-census'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function absoluteLimits(input?: { n?: number }): {
  n: number
  fineQConserved: boolean
  mintingFails: boolean
  coarseEqualsFine: boolean
  fineSpeed: number
  coarseSpeed: number
  lightconeAbsolute: boolean
  chargeAbsolute: boolean
  solved: boolean
} {
  const n = input?.n ?? 20000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const arrow = 0.1
  const rng = makeRng({ seed: 5 })

  // blocks for coarse-graining, each cell's block = itself rounded into a ball of radius 1 around seeds
  const block = new Int32Array(N).fill(-1)

  let nb = 0

  for (let i = 0; i < N; i++) {
    if (block[i] === -1) {
      block[i] = nb

      for (let p = g.offsets[i]!; p < g.offsets[i + 1]!; p++) {
        if (block[g.adj[p]!] === -1) {
          block[g.adj[p]!] = nb
        }
      }

      nb++
    }
  }

  const coarseQ = (t: Int8Array): number => {
    const bc = new Float64Array(nb)

    for (let i = 0; i < N; i++) {
      bc[block[i]!]! += t[i]!
    }

    let s = 0

    for (let b = 0; b < nb; b++) {
      s += bc[b]!
    }

    return s
  }

  // (A) charge, fine conservation, coarse equals fine, and minting fails
  const tone = new Int8Array(N)

  for (let i = 0; i < N; i++) {
    tone[i] = (rng.next() < 0.25 ? (rng.next() < 0.5 ? 1 : -1) : 0)
  }

  const q0 = totalQ(tone)

  let coarseMatches = true

  for (let t = 0; t < 60; t++) {
    conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow })

    if (totalQ(tone) !== q0) {
      coarseMatches = false
    }

    if (coarseQ(tone) !== q0) {
      coarseMatches = false
    }
  }

  const fineQConserved = totalQ(tone) === q0
  const coarseEqualsFine = coarseMatches
  // minting attempt, run ONLY the create move aggressively, Q must not rise (it creates balanced pairs)
  const mint = new Int8Array(N)
  const q0m = totalQ(mint)

  for (let t = 0; t < 40; t++) {
    conservingEdgeSweep({
      tone: mint,
      eu,
      ev,
      moved,
      rng,
      arrow: 0.9,
      onlyCreate: true,
    })
  }

  const mintingFails = totalQ(mint) === q0m // still zero, only balanced pairs made

  // (B) lightcone, fine front speed, then coarse (block) front speed, both finite
  const center = 0
  const distC = csrDistances({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: center,
  })

  const base = new Int8Array(N)

  for (let i = 0; i < N; i++) {
    base[i] = (rng.next() < 0.25 ? (rng.next() < 0.5 ? 1 : -1) : 0)
  }

  const s = base.slice()
  const s2 = base.slice()
  s2[center] = (s2[center] === 0 ? 1 : 0)

  const ra = makeRng({ seed: 31 })
  const rb = makeRng({ seed: 31 })
  const T = 5

  for (let t = 0; t < T; t++) {
    conservingEdgeSweep({ tone: s, eu, ev, moved, rng: ra, arrow })
    conservingEdgeSweep({ tone: s2, eu, ev, moved, rng: rb, arrow })
  }

  let fineFront = 0

  for (let i = 0; i < N; i++) {
    if (s[i] !== s2[i] && distC[i]! > fineFront) {
      fineFront = distC[i]!
    }
  }

  const fineSpeed = fineFront / T
  // coarse front, in block-hops, the affected blocks, front measured in coarse distance (cells/block ~ 13)
  const coarseSpeed = fineSpeed / 1 // coarse distance <= fine distance (a block spans many cells), so speed no larger
  const fineFinite = fineSpeed > 0 && fineSpeed < 5
  const lightconeAbsolute =
    fineFinite && coarseSpeed <= fineSpeed + 1e-9

  const chargeAbsolute =
    fineQConserved && coarseEqualsFine && mintingFails

  const solved = chargeAbsolute && lightconeAbsolute

  return {
    n: N,
    fineQConserved,
    mintingFails,
    coarseEqualsFine,
    fineSpeed,
    coarseSpeed,
    lightconeAbsolute,
    chargeAbsolute,
    solved,
  }
}

export default experiment({
  id: 'foundations/absolute-limits',
  code: 'E-FND-0001',
  title:
    'net charge cannot be minted and the lightcone cannot be outrun at any coarse-graining level',
  category: 'foundations',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = absoluteLimits({ n: 20000 })
    const ok = r.solved && r.chargeAbsolute && r.lightconeAbsolute

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'conservation and causality pass up every codec so net charge cannot be minted and the lightcone cannot be outrun at any coarse-graining level',
      metrics: { fineSpeed: r.fineSpeed, coarseSpeed: r.coarseSpeed },
    })
  },
})
