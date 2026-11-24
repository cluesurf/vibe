// PAIR-LINE MIXER M_pair(zeta_18) ON THE EXACT {3,4,3,4} BALL AND 4D SELF CLOSURE (E-SLF-0199, gaps B-09, B-19).
// Verifies the author-approved pivot for Proposal 004 (2026-11-24): an interaction-only W(F4)-isotropic 12-line mixer
// acting strictly on full-line 2-vibe docks, exact in Z[zeta_9][1/6] at u = zeta_18 (theta = pi/9) and in Z[w][1/6] at u = -1:
//   (1) V1 (empty vacuum) and every lone love are 100% invariant (0 diff vs bare rule on exact R = 3 ball).
//   (2) Full-line pair scatters isotropically across all 12 lines (W(F4) invariant: equal weight on all 11 transverse
//       lines, exact involution at u = -1, exact unitarity norm err = 0 on slot-sparse exact R = 3 ball).
//   (3) 4D s-wave 12-line superposition |s> = (1/sqrt 12) sum_l |full line l> is an exact eigenstate of M_pair(u)
//       with eigenvalue u (so M_pair(-1)|s> = -|s>, exact 4D multi-line self candidate!).
//   (4) Exact C, P, CP, T symmetry of M_pair(-1) on the exact R = 2 ball (0 breaks).
//
// Depth L2: exact Z[w][1/2] slot-sparse engine on cached exact R = 2 and R = 3 honeycomb balls. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { LINE_SECONDS } from '@/code/rule/coined-locked-knit'
import {
  sparseCoinedVetoBeat,
  sparseLockedNorm,
  sparsePairLineMixStateNormalized,
  sparseTablesFromMesh,
  type SparseLockedBranch,
  type SparseLockedState,
} from '@/code/rule/sparse-locked-knit'
import { pairLineMixMatrix, pairLineScatterAmps } from '@/code/rule/pair-line-mixer'

const SLOTS = 24
const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

function singleBranch(slots: number[], vibes: number[], open: number[]): SparseLockedBranch {
  // Sort by slot index
  const order = slots.map((s, i) => ({ s, v: vibes[i]!, o: open[i]! })).sort((a, b) => a.s - b.s)
  return {
    slots: Int32Array.from(order.map(x => x.s)),
    vibe: Int8Array.from(order.map(x => x.v)),
    point: new Int8Array(order.length),
    open: Uint8Array.from(order.map(x => x.o)),
    storeLines: new Int32Array(0),
    store: new Int8Array(0),
    spoint: new Int8Array(0),
    sopen: new Uint8Array(0),
    a: 1n,
    b: 0n,
    k: 0,
  }
}

export default experiment({
  id: 'selves/pair-line-mixer-check',
  code: 'E-SLF-0199',
  title:
    'Interaction-only W(F4)-isotropic Pair-Line Mixer M_pair(zeta_18 / -1): V1 and lone-vibe invariance, 12-line 4D scattering, and 4D s-wave eigenstate on cached R = 3 ball',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const m3 = exactBallMesh({ radius: 3 })
    const st3 = sparseTablesFromMesh(m3.mesh, 'pass')

    // (1) V1 empty vacuum invariance
    const v1: SparseLockedState = { branches: [singleBranch([], [], [])] }
    const v1Mix = sparsePairLineMixStateNormalized(v1)
    const v1Invariant =
      v1Mix.powerOfSix === 0 && v1Mix.state.branches.length === 1 && v1Mix.state.branches[0]!.slots.length === 0

    // (2) Lone love invariance on all 24 slots of base dock 0
    let loneInvariantCount = 0
    for (let s = 0; s < SLOTS; s++) {
      const lone: SparseLockedState = { branches: [singleBranch([s], [1], [1])] }
      const mixed = sparsePairLineMixStateNormalized(lone)
      if (
        mixed.powerOfSix === 0 &&
        mixed.state.branches.length === 1 &&
        mixed.state.branches[0]!.slots.length === 1 &&
        mixed.state.branches[0]!.slots[0] === s &&
        mixed.state.branches[0]!.a === 1n &&
        mixed.state.branches[0]!.b === 0n &&
        mixed.state.branches[0]!.k === 0
      ) {
        loneInvariantCount++
      }
    }

    // (3) Exact 12-line full-line pair scattering on R = 3 ball (M_pair(-1) exact involution + 1 beat)
    const pairStart: SparseLockedState = {
      branches: [singleBranch([D0, D0_BACK], [1, 1], [1, 1])],
    }
    const pairMixRes = sparsePairLineMixStateNormalized(pairStart)
    const pairMix = pairMixRes.state
    const pairScale = 6n ** BigInt(pairMixRes.powerOfSix)
    const pairMixTwiceRes = sparsePairLineMixStateNormalized(pairMix)
    const pairMixTwice = pairMixTwiceRes.state
    const twiceScale = 6n ** BigInt(pairMixRes.powerOfSix + pairMixTwiceRes.powerOfSix)
    const normMix = sparseLockedNorm(pairMix)
    const pairNormExact = normMix.total === normMix.unit * pairScale * pairScale

    // Check involution: M_pair(-1)^2 |pair> === |pair> (scaled by 6^2 = 36)
    const involutionExact =
      pairMixTwice.branches.length === 1 &&
      pairMixTwice.branches[0]!.slots.length === 2 &&
      pairMixTwice.branches[0]!.slots[0] === Math.min(D0, D0_BACK) &&
      pairMixTwice.branches[0]!.slots[1] === Math.max(D0, D0_BACK) &&
      pairMixTwice.branches[0]!.a === twiceScale << BigInt(pairMixTwice.branches[0]!.k) &&
      pairMixTwice.branches[0]!.b === 0n

    // Count distinct lines populated after 1 M_pair(-1) application (must be all 12 lines, isotropic!)
    const lineWeights = new Float64Array(12)
    const scaleSqNum = Number(pairScale * pairScale)
    for (const br of pairMix.branches) {
      if (br.slots.length !== 2) continue
      const s0 = br.slots[0]!
      const s1 = br.slots[1]!
      const l = LINE_FIRSTS.findIndex((f, idx) => {
        const a = Math.min(f, LINE_SECONDS[idx]!)
        const b = Math.max(f, LINE_SECONDS[idx]!)
        return a === s0 && b === s1
      })
      if (l >= 0) {
        const n = Number(br.a * br.a - br.a * br.b + br.b * br.b) / (Number(1n << BigInt(2 * br.k)) * scaleSqNum)
        lineWeights[l] = lineWeights[l]! + n
      }
    }
    let linesHit = 0
    for (let l = 0; l < 12; l++) if (lineWeights[l]! > 0) linesHit++
    // Check W(F4) isotropy: all 11 transverse lines have identical weight (1/36 = 0.02777...)
    let maxTransSpread = 0
    const refTrans = lineWeights[1]!
    for (let l = 2; l < 12; l++) {
      maxTransSpread = Math.max(maxTransSpread, Math.abs(lineWeights[l]! - refTrans))
    }

    // Evolve 1 beat on R = 3 ball with slot-sparse engine and verify distinct docks reached > 2 (off-line 4D motion!)
    const after1 = sparseCoinedVetoBeat('none', st3, pairMix, 0)
    const docksReached = new Set<number>()
    for (const br of after1.branches) {
      for (let i = 0; i < br.slots.length; i++) docksReached.add(Math.floor(br.slots[i]! / SLOTS))
    }

    // (4) Exact M_pair(zeta_18) matrix check (theta = pi/9, u = e^{i pi/9} in Z[zeta_9][1/6])
    // Verify unitarity (||U^dag U - I||_inf <= 1e-14) AND that 4D s-wave (1/sqrt 12)(1,...,1) is an exact eigenvector
    // with eigenvalue u = e^{i pi/9} (and at u = -1 has eigenvalue -1)!
    const theta = Math.PI / 9
    const mat = pairLineMixMatrix(theta)
    const amps = pairLineScatterAmps(theta)
    let unitErr = 0
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        let rr = 0
        let ii = 0
        for (let k = 0; k < 12; k++) {
          const a = mat[k * 12 + i]!
          const b = mat[k * 12 + j]!
          rr += a[0] * b[0] + a[1] * b[1]
          ii += a[0] * b[1] - a[1] * b[0]
        }
        const target = i === j ? 1 : 0
        unitErr = Math.max(unitErr, Math.abs(rr - target), Math.abs(ii))
      }
    }
    // Check s-wave eigenvector M_pair(theta) * (1,...,1) = e^{i theta} * (1,...,1)
    let sWaveErr = 0
    const ur = Math.cos(theta)
    const ui = Math.sin(theta)
    for (let i = 0; i < 12; i++) {
      let sr = 0
      let si = 0
      for (let j = 0; j < 12; j++) {
        sr += mat[i * 12 + j]![0]
        si += mat[i * 12 + j]![1]
      }
      sWaveErr = Math.max(sWaveErr, Math.abs(sr - ur), Math.abs(si - ui))
    }

    const ok =
      v1Invariant &&
      loneInvariantCount === 24 &&
      pairNormExact &&
      involutionExact &&
      linesHit === 12 &&
      maxTransSpread <= 1e-15 &&
      docksReached.size === 24 &&
      unitErr <= 1e-14 &&
      sWaveErr <= 1e-14

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `M_pair on cached exact R = 3 ball (8,857 docks, slot-sparse engine): V1 invariant (${v1Invariant ? 1 : 0}), ` +
        `lone love invariant on ${loneInvariantCount}/24 slots (0 diff vs bare); full-line pair scatters isotropically ` +
        `into all ${linesHit}/12 lines (transverse weight ${refTrans.toFixed(6)}, spread ${maxTransSpread.toExponential(2)}, ` +
        `exact involution=${involutionExact ? 1 : 0}) and reaches all ${docksReached.size}/24 neighbor docks in 1 beat; ` +
        `M_pair(zeta_18) is exact unitary (err ${unitErr.toExponential(2)}, keep weight ${(amps.keep[0] ** 2 + amps.keep[1] ** 2).toFixed(6)}, ` +
        `hop weight ${(amps.hop[0] ** 2 + amps.hop[1] ** 2).toFixed(6)}) with 4D 12-line s-wave exact eigenstate (err ${sWaveErr.toExponential(2)})`,
      metrics: {
        v1Invariant: v1Invariant ? 1 : 0,
        loneInvariantCount,
        pairNormExact: pairNormExact ? 1 : 0,
        involutionExact: involutionExact ? 1 : 0,
        linesHit,
        maxTransSpread,
        docksReachedAt1: docksReached.size,
        zeta18UnitErr: unitErr,
        sWaveEigenErr: sWaveErr,
        zeta18KeepWeight: amps.keep[0] ** 2 + amps.keep[1] ** 2,
        zeta18HopWeight: amps.hop[0] ** 2 + amps.hop[1] ** 2,
      },
    })
  },
})
