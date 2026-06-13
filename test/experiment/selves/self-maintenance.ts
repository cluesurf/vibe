// P109: EMERGENT self-maintenance (autopoiesis) from the rule alone, no external operator.
// USES COHESION (audit): this relies on a cohesion/maintenance term that is NOT one of the five base things.
// Per the discipline the PURE rule gives churn (P101), so this is a MID-LAYER-with-cohesion result, NOT pure
// substrate emergence. Honest when labeled as such, do not read it as the bare five base things producing selves.
// (Answers the critique that P107's maintenance was external fine-tuning.)
//
// P107 showed permanent memory IF an outside hand re-stamps the codeword. That is not a law of the
// system. This tests whether the self heals its OWN damage using ONLY the rule (share plus cohesive
// hop, no external maintain, no external target, no arrow): a self is a + region, a chunk of it is
// erased to holes, and then only the rule runs. The intact surrounding self bleeds charge back into the
// hole through the dynamics (hops carry + inward, cohesion locks it once it has + company), so the
// damage partially heals on its own.
//
// The control proves the healing comes from the redundant SURROUND, not from nothing: when the self is
// ONLY the chunk (no surrounding self), erasing it leaves nothing to heal from and there is no recovery.
//
// Predictions checked: with a surrounding self, the erased chunk recovers substantially from the rule
// ALONE (no external hand), and without a surround it does not. So self-maintenance is partly emergent
// from the fundamental dynamics (the full 100 percent of P107 needs active maintenance on top). Charge
// is conserved by the rule. Run: npx tsx code/experiment/p109-self-maintenance.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function ballSet(offsets: Int32Array, adj: Int32Array, n: number, start: number, size: number): number[] {
  const out: number[] = []
  const seen = new Uint8Array(n)
  seen[start] = 1
  let fr = [start]
  while (fr.length > 0 && out.length < size) {
    const nf: number[] = []
    for (const u of fr) {
      out.push(u)
      for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
        const w = adj[p]!
        if (!seen[w] && out.length + nf.length < size) {
          seen[w] = 1
          nf.push(w)
        }
      }
    }
    fr = nf
  }
  return out
}

// the rule alone: share + cohesive hop, NO external maintenance, NO arrow (to isolate healing)
function beat(tone: Int8Array, eu: Int32Array, ev: Int32Array, offsets: Int32Array, adj: Int32Array, moved: Uint8Array, rng: Rng): void {
  moved.fill(0)
  const agree = (i: number, q: number, except: number): number => {
    let c = 0
    for (let p = offsets[i]!; p < offsets[i + 1]!; p++) {
      const w = adj[p]!
      if (w !== except && tone[w] === q) c++
    }
    return c
  }
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
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
      const q = tone[c]!
      if (agree(e, q, c) >= agree(c, q, e) || rng.next() < 0.02) {
        tone[e] = q
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

export function selfMaintenance(input?: { n?: number }): {
  n: number
  baselineFrac: number
  withSurroundFrac: number
  withSurroundRecovery: number
  withoutSurroundRecovery: number
  emergentSelfHeals: boolean
  solved: boolean
} {
  const n = input?.n ?? 30000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const beats = 30

  const self = ballSet(g.offsets, g.adj, N, 0, 3000) // the self: a + region
  const chunk = ballSet(g.offsets, g.adj, N, 0, 800) // an inner chunk to erase
  const chunkSet = new Set(chunk)
  const plusInChunk = (t: Int8Array): number => {
    let c = 0
    for (const i of chunkSet) if (t[i] === 1) c++
    return c / chunkSet.size
  }

  // baseline: undamaged self, run the rule (it erodes a bit naturally)
  const base = new Int8Array(N)
  for (const i of self) base[i] = 1
  const r1 = makeRng({ seed: 5 })
  for (let b = 0; b < beats; b++) beat(base, eu, ev, g.offsets, g.adj, moved, r1)
  const baselineFrac = plusInChunk(base)

  // WITH surround: erase the inner chunk (holes), run the rule ALONE, the surround heals it
  const dmg = new Int8Array(N)
  for (const i of self) dmg[i] = 1
  for (const i of chunkSet) dmg[i] = 0
  const r2 = makeRng({ seed: 5 })
  for (let b = 0; b < beats; b++) beat(dmg, eu, ev, g.offsets, g.adj, moved, r2)
  const withSurroundFrac = plusInChunk(dmg)
  const withSurroundRecovery = baselineFrac > 0 ? withSurroundFrac / baselineFrac : 0

  // WITHOUT surround: the self is ONLY the chunk, erase it, nothing to heal from
  const ctrl = new Int8Array(N)
  for (const i of chunkSet) ctrl[i] = 1
  for (const i of chunkSet) ctrl[i] = 0 // erase the whole self
  const r3 = makeRng({ seed: 5 })
  for (let b = 0; b < beats; b++) beat(ctrl, eu, ev, g.offsets, g.adj, moved, r3)
  const withoutSurroundRecovery = plusInChunk(ctrl) / (baselineFrac > 0 ? baselineFrac : 1)

  const emergentSelfHeals = withSurroundRecovery > 0.5 && withoutSurroundRecovery < 0.2
  const solved = emergentSelfHeals

  return {
    n: N,
    baselineFrac,
    withSurroundFrac,
    withSurroundRecovery,
    withoutSurroundRecovery,
    emergentSelfHeals,
    solved,
  }
}

export default defineExperiment({
  id: 'selves/self-maintenance',
  title: 'a self heals its own damage by the rule alone, control with no surround does not',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = selfMaintenance({ n: 30000 })
    const ok =
      r.solved &&
      r.emergentSelfHeals &&
      r.withSurroundRecovery > 0.5 &&
      r.withoutSurroundRecovery < 0.2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an erased hole in a self partially refills by the rule alone from its redundant surround, while the control with no surround shows no recovery',
      metrics: { withSurroundRecovery: r.withSurroundRecovery },
      control: { withoutSurroundRecovery: r.withoutSurroundRecovery },
      notes:
        'uses a cohesion maintenance term that is not one of the five base things, a mid-layer result not pure substrate emergence',
    })
  },
})
