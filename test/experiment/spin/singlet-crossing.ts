// DOES BINDING MAKE THREE MEMBERS CROSS ONE LINK TOGETHER? (E-SPN-0202, moving-matter item 0084, candidate A' of
// research/outside-the-box.md section 2). RULE: the candidate (register) rule, provisional until moving-matter item 0006.
//
// 0080 found that a like-tone color singlet crossing each link as one object sees det U = 1 and is color-blind, but that
// E-SPN-0193's contact state is antisymmetric in the register (with role epsilon it is the color 10, not the singlet),
// and that only 24 (1/24)^3 = 1/576 of a slot-uniform contact state crosses one link as one object. This file asks the
// two questions that leaves: does the register-symmetric (Sym^3) channel, the one that is the color singlet with role
// epsilon and Pauli-allowed, bind; and what share of its bound level's one-half-beat transition weight crosses the same
// slot from the same dock.
//
// GATES (item 0084, fixed 2026-10-09 by lead 0062; read definitions in tmp/scross-gates-frozen-20261009T213901Z.md,
// frozen before any read).
//  STEP 1 BINDS when the Sym start's bound fraction (E-SPN-0193's BND read: the late mean contact share over cycles 128
//    to 255 of 256 under the rule) is at least 0.5, else NO SINGLET (A' dead).
//  STEP 2 on the bound level phi (Hann filter T 256 at the start's strongest line): s, the weight with all three members
//    in one slot at one dock in the W frame (the cycle ends on beat 2's stream, so this is the slot they just crossed),
//    read through the 192-mode vectors W(q) c; and 0080's color error E (eta = det(S / N), weights N^3) on R*'s hash at 2
//    and 3 beats, sections first and weyl. CROSSES TOGETHER when s >= 0.75 or E <= 0.25; FAILS when s <= 0.25 and
//    E >= 0.75; PARTIAL otherwise.
//  CONTROLS: 0004's antisymmetric start gives s within 1e-3 of 1/576 and E within 1e-3 of 0080's 0.945; identity links
//    give E 0. INSTRUMENTS: norm drift 1e-10, frame checks 1e-12, I-SEC (the sector fibers alone give contact / 576 to
//    1e-12, since the sector states are slot-uniform and momentum independent).
//  LEAD'S PREDICTION: BINDS or NO SINGLET either way, then FAILS with s under 1e-2.
//
// WHAT THIS CAN AND CANNOT SHOW. E-SPN-0193's box (L 4, one half, K 0, color-free three-hole engine). E depends only on
// the field (members hopping independently and slot-uniform, 0080's weights), so it reads the color R*'s hash puts on
// non-coincident crossings, not the bound state's own multi-beat path amplitudes; s is the start's own number.
//
// DETERMINISM: no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { torus } from '@/code/measure/register-sea'
import {
  holeEngine,
  holeFrame,
  holeNorm,
  memberMomenta,
  newHoles,
  type HoleFrame,
  type Holes,
} from '@/code/measure/register-holes'
import {
  contactStart,
  couplingRule,
  filtered,
  lineSpectrum,
  rayleigh,
  ruleSetup,
  sectorContact,
  strongestLines,
} from '@/code/measure/three-member-motion'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { gridLifts, roleLinks } from '@/code/measure/holonomy-caging'
import { makeColorWeave } from '@/code/rule/color-weave'
import { bulkBox, gaugeLinks, linksOf, weylGauge, type ColorLinks } from '@/code/measure/color-slab'
import { det3f, mul3f } from '../../../tmp/leada-common'

export type StartKind = 'sym' | 'sym000' | 'anti'

export type CrossingPlan = { L: number; T: number; threads: number; side: number }

export const GATE_PLAN: CrossingPlan = { L: 4, T: 256, threads: 8, side: 8 }

const REG = 8
const SLOTS = 24
const BIND_BAR = 0.5
const TOGETHER_S = 0.75
const TOGETHER_E = 0.25
const FAIL_S = 0.25
const FAIL_E = 0.75
const ANTI_SHARE = 1 / 576
const E_0080 = 0.945
const CONTROL_TOL = 1e-3
const NORM_TOL = 1e-10
const FRAME_TOL = 1e-12
const SEC_TOL = 1e-12

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/singlet-crossing',
  code: 'E-SPN-0202',
  title:
    'does binding make three like-tone register members cross one link together (candidate A\'): the register-symmetric (color singlet) contact start on the register rule, its bound fraction and the same-slot crossing share of its bound level, against 0080\'s color error on R*\'s hash',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return singletCrossingRun(GATE_PLAN)
  },
})

// the start: three holes on one site in the beat-1 sector, symmetric (|012> over all orders, or |000>) or 0004's
// antisymmetric contactStart
export function crossingStart(fr: HoleFrame, kind: StartKind): Holes {
  if (kind === 'anti') {
    return contactStart(fr)
  }

  const s = newHoles(fr, 3, 0)
  const N = fr.fourier.N
  const f = fr.fiber
  const block = f ** 3
  const fibers =
    kind === 'sym000'
      ? [[0, 0, 0]]
      : [
          [0, 1, 2],
          [1, 2, 0],
          [2, 0, 1],
          [0, 2, 1],
          [2, 1, 0],
          [1, 0, 2],
        ]
  const a = 1 / (N * Math.sqrt(fibers.length))

  for (let T = 0; T < N * N; T++) {
    for (const [b0, b1, b2] of fibers) {
      s.re[T * block + (b0! * f + b1!) * f + b2!] = a
    }
  }

  return s
}

// the weight with all three members in slot d at one dock, per slot, read through the 192-mode vectors W(q) c (relative
// sites 0, 0, summed over every dock by translation invariance); sectorOnly restricts the fibers to the sector (I-SEC)
export function sameSlotWeights(fr: HoleFrame, s: Holes, sectorOnly: boolean): Float64Array {
  const N = fr.fourier.N
  const f = fr.fiber
  const block = f ** 3
  const mm = memberMomenta(fr, 3, s.total)
  const tuples = N * N
  const phiRe = new Float64Array(SLOTS * REG ** 3)
  const phiIm = new Float64Array(SLOTS * REG ** 3)
  const cRe = new Float64Array(block)
  const cIm = new Float64Array(block)
  const xRe = new Float64Array(block)
  const xIm = new Float64Array(block)
  const yRe = new Float64Array(block)
  const yIm = new Float64Array(block)

  for (let T = 0; T < tuples; T++) {
    let any = false

    for (let b = 0; b < block; b++) {
      const b0 = b >> 6
      const b1 = (b >> 3) & 7
      const b2 = b & 7
      const keep = !sectorOnly || (fr.sector[b0]! && fr.sector[b1]! && fr.sector[b2]!)

      cRe[b] = keep ? s.re[T * block + b]! : 0
      cIm[b] = keep ? s.im[T * block + b]! : 0
      any ||= cRe[b] !== 0 || cIm[b] !== 0
    }

    if (!any) {
      continue
    }

    const W0 = fr.W[mm[T * 3]!]!
    const W1 = fr.W[mm[T * 3 + 1]!]!
    const W2 = fr.W[mm[T * 3 + 2]!]!

    for (let d = 0; d < SLOTS; d++) {
      // X[b0, b1, a2] = sum_b2 W2[d a2, b2] c[b0, b1, b2]
      for (let b01 = 0; b01 < f * f; b01++) {
        for (let a2 = 0; a2 < REG; a2++) {
          const row = (d * REG + a2) * f
          let r = 0
          let i = 0

          for (let b2 = 0; b2 < f; b2++) {
            const wr = W2.re[row + b2]!
            const wi = W2.im[row + b2]!
            const vr = cRe[b01 * f + b2]!
            const vi = cIm[b01 * f + b2]!

            r += wr * vr - wi * vi
            i += wr * vi + wi * vr
          }

          xRe[b01 * f + a2] = r
          xIm[b01 * f + a2] = i
        }
      }

      // Y[b0, a1, a2] = sum_b1 W1[d a1, b1] X[b0, b1, a2]
      for (let b0 = 0; b0 < f; b0++) {
        for (let a1 = 0; a1 < REG; a1++) {
          const row = (d * REG + a1) * f

          for (let a2 = 0; a2 < REG; a2++) {
            let r = 0
            let i = 0

            for (let b1 = 0; b1 < f; b1++) {
              const wr = W1.re[row + b1]!
              const wi = W1.im[row + b1]!
              const k = (b0 * f + b1) * f + a2
              const vr = xRe[k]!
              const vi = xIm[k]!

              r += wr * vr - wi * vi
              i += wr * vi + wi * vr
            }

            yRe[(b0 * f + a1) * f + a2] = r
            yIm[(b0 * f + a1) * f + a2] = i
          }
        }
      }

      // Phi_d[a0, a1, a2] += sum_b0 W0[d a0, b0] Y[b0, a1, a2]
      for (let a0 = 0; a0 < REG; a0++) {
        const row = (d * REG + a0) * f

        for (let a12 = 0; a12 < REG * REG; a12++) {
          let r = 0
          let i = 0

          for (let b0 = 0; b0 < f; b0++) {
            const wr = W0.re[row + b0]!
            const wi = W0.im[row + b0]!
            const vr = yRe[b0 * f * f + a12]!
            const vi = yIm[b0 * f * f + a12]!

            r += wr * vr - wi * vi
            i += wr * vi + wi * vr
          }

          const o = d * REG ** 3 + a0 * REG * REG + a12

          phiRe[o]! += r
          phiIm[o]! += i
        }
      }
    }
  }

  const out = new Float64Array(SLOTS)

  for (let d = 0; d < SLOTS; d++) {
    let w = 0

    for (let k = 0; k < REG ** 3; k++) {
      const o = d * REG ** 3 + k

      w += (phiRe[o]! / N) ** 2 + (phiIm[o]! / N) ** 2
    }

    out[d] = w
  }

  return out
}

export type StartRead = {
  kind: StartKind
  share: number
  shareFree: number
  E0: number
  lines: { E: number; height: number }[]
  levelE: number
  purity: number
  levelShare: number
  s: number
  sMax: number
  sMin: number
  sector: number
  contact: number
  iSec: number
  normDrift: number
}

// STEP 1 and STEP 2's s for one start
export function readStart(plan: CrossingPlan, kind: StartKind, log: (w: string) => void = () => {}): StartRead & { framesOk: boolean } {
  const base = torus(plan.L)
  const fr = holeFrame(base, ruleSetup().Ps, 8)
  const c = fr.checks
  const framesOk =
    c.sectorOutside <= FRAME_TOL &&
    c.transferOutside <= FRAME_TOL &&
    c.unitary <= FRAME_TOL &&
    c.minComplement === 4 &&
    c.maxComplement === 4
  const e = holeEngine(fr, 3, 0, { backend: 'native', threads: plan.threads })
  const psi0 = crossingStart(fr, kind)
  const rule = couplingRule(base, 'rule')
  const late = (reads: { cycle: number; share: number }[]): number => {
    const r = reads.filter(x => x.cycle >= plan.T / 2)

    return r.reduce((a, x) => a + x.share, 0) / r.length
  }
  const runRule = filtered(e, rule, psi0, plan.T, null, 8)
  const share = late(runRule.reads)

  log(`${kind} rule late share ${share.toFixed(4)} (${runRule.seconds.toFixed(0)} s)`)

  const runFree = filtered(e, couplingRule(base, 'free'), psi0, plan.T, null, 8)
  const shareFree = late(runFree.reads)

  log(`${kind} free late share ${shareFree.toFixed(4)}`)

  const lines = strongestLines(lineSpectrum(runRule.cRe, runRule.cIm, 8192), 4, 1e-3)
  const E0 = lines[0]!.E
  const run = filtered(e, rule, psi0, plan.T, E0, plan.T)
  const ray = rayleigh(e, rule, run.phi)
  const sc = sectorContact(fr, run.phi)
  const n = holeNorm(run.phi)
  const per = sameSlotWeights(fr, run.phi, false)
  const perSec = sameSlotWeights(fr, run.phi, true)
  const sum = (a: Float64Array): number => a.reduce((x, y) => x + y, 0)
  const s = sum(per) / n

  log(`${kind} lines ${JSON.stringify(lines)} level ${ray.E.toFixed(6)} purity ${ray.purity.toFixed(6)} s ${s.toExponential(4)}`)

  return {
    kind,
    share,
    shareFree,
    E0,
    lines,
    levelE: ray.E,
    purity: ray.purity,
    levelShare: sc.contact / sc.sector,
    s,
    sMax: Math.max(...per) / n,
    sMin: Math.min(...per) / n,
    sector: sc.sector / n,
    contact: sc.contact / n,
    iSec: Math.abs(sum(perSec) - sc.contact / 576) / n,
    normDrift: Math.max(runRule.normDrift, runFree.normDrift, run.normDrift),
    framesOk,
  }
}

// 0080's color error: E = sum w(z) |det(S / N) - 1|^2 / sum w(z), w = N(z)^3, S the sum of the n-step transports x -> z
export function colorErrors(side: number, beats: 2 | 3): Record<'identity' | 'first' | 'weyl' | 'gaugeGap', number> {
  const lifts = gridLifts()
  const box = bulkBox(side)
  const weave = makeColorWeave({ side, table: 'bind' })
  const identity: ColorLinks = { k: 3, m: new Float64Array(box.cells * 24 * 18) }

  for (let l = 0; l < box.cells * 24; l++) {
    for (let c = 0; c < 3; c++) {
      identity.m[l * 18 + 2 * (3 * c + c)] = 1
    }
  }

  const first = linksOf(box, roleLinks(weave, weave.links, lifts, 'first'))
  const weyl = linksOf(box, roleLinks(weave, weave.links, lifts, 'weyl'))
  const gauged = gaugeLinks(box, first, weylGauge(lifts.floats, 1))
  const tmp = new Float64Array(18)
  const tmp2 = new Float64Array(18)

  const read = (links: ColorLinks): { E: number; etas: number[] } => {
    let num = 0
    let den = 0
    const etas: number[] = []

    for (let x = 0; x < box.cells; x++) {
      const S = new Map<string, { m: Float64Array; n: number; zero: boolean }>()
      const add = (v: number[], R: Float64Array): void => {
        const key = v.join(',')
        let e = S.get(key)

        if (!e) {
          e = { m: new Float64Array(18), n: 0, zero: v.every(a => a === 0) }
          S.set(key, e)
        }

        for (let i = 0; i < 18; i++) {
          e.m[i]! += R[i]!
        }

        e.n++
      }

      for (let d = 0; d < 24; d++) {
        const y = box.nb[x * 24 + d]!

        for (let e = 0; e < 24; e++) {
          const z = box.nb[y * 24 + e]!
          const two = mul3f(links.m, (y * 24 + e) * 18, links.m, (x * 24 + d) * 18, tmp)
          const v2 = DOCK_ROOTS[d]!.map((a, i) => a + DOCK_ROOTS[e]![i]!)

          if (beats === 2) {
            add(v2, two)
            continue
          }

          for (let g = 0; g < 24; g++) {
            add(
              v2.map((a, i) => a + DOCK_ROOTS[g]![i]!),
              mul3f(links.m, (z * 24 + g) * 18, two, 0, tmp2),
            )
          }
        }
      }

      for (const { m, n, zero } of S.values()) {
        if (zero) {
          continue
        }

        const [r, i] = det3f(m.map(a => a / n))
        const w = n ** 3

        num += w * ((r - 1) ** 2 + i ** 2)
        den += w
        etas.push(r, i)
      }
    }

    return { E: num / den, etas }
  }

  const a = read(first)
  const b = read(gauged)
  let gaugeGap = 0

  for (let i = 0; i < a.etas.length; i++) {
    gaugeGap = Math.max(gaugeGap, Math.abs(a.etas[i]! - b.etas[i]!))
  }

  return { identity: read(identity).E, first: a.E, weyl: read(weyl).E, gaugeGap }
}

export function crossingVerdict(
  sym: StartRead & { framesOk: boolean },
  anti: StartRead & { framesOk: boolean },
  e2: ReturnType<typeof colorErrors>,
  e3: ReturnType<typeof colorErrors>,
  extra: (StartRead & { framesOk: boolean })[] = [],
): Verdict {
  const BINDS = sym.share >= BIND_BAR
  const E = Math.min(e2.first, e2.weyl, e3.first, e3.weyl)
  const Emax = Math.max(e2.first, e2.weyl, e3.first, e3.weyl)
  const together = sym.s >= TOGETHER_S || E <= TOGETHER_E
  const fails = sym.s <= FAIL_S && Emax >= FAIL_E
  const C_ANTI = Math.abs(anti.s - ANTI_SHARE) <= CONTROL_TOL && Math.abs(e2.first - E_0080) <= CONTROL_TOL
  const C_ID = e2.identity <= 1e-24 && e3.identity <= 1e-24
  const all = [sym, anti, ...extra]
  const I = all.every(r => r.normDrift <= NORM_TOL && r.framesOk && r.iSec <= SEC_TOL)
  const reading = !BINDS ? 'NO SINGLET' : together ? 'CROSSES TOGETHER' : fails ? 'FAILS' : 'PARTIAL'
  const status: Verdict['status'] = !(C_ANTI && C_ID && I)
    ? 'open'
    : reading === 'CROSSES TOGETHER'
      ? 'pass'
      : reading === 'PARTIAL'
        ? 'partial'
        : 'fail'
  const metrics: Record<string, number> = {
    BINDS: flag(BINDS),
    TOGETHER: flag(BINDS && together),
    FAILS: flag(BINDS && fails),
    C_ANTI: flag(C_ANTI),
    C_ID: flag(C_ID),
    I: flag(I),
    E2first: e2.first,
    E2weyl: e2.weyl,
    E3first: e3.first,
    E3weyl: e3.weyl,
    E2identity: e2.identity,
    E3identity: e3.identity,
    gaugeGap: Math.max(e2.gaugeGap, e3.gaugeGap),
  }

  for (const r of all) {
    metrics[`share_${r.kind}`] = r.share
    metrics[`shareFree_${r.kind}`] = r.shareFree
    metrics[`s_${r.kind}`] = r.s
    metrics[`sOver576_${r.kind}`] = r.s * 576
    metrics[`levelE_${r.kind}`] = r.levelE
    metrics[`purity_${r.kind}`] = r.purity
    metrics[`levelShare_${r.kind}`] = r.levelShare
    metrics[`contact_${r.kind}`] = r.contact
    metrics[`iSec_${r.kind}`] = r.iSec
  }

  return verdict({
    status,
    claim: `${reading}: the register-symmetric (color singlet) contact start keeps a late contact share ${sym.share.toFixed(3)} under the rule (${sym.shareFree.toFixed(3)} free; BINDS ${BINDS}); its bound level (E ${sym.levelE.toFixed(4)}, purity ${sym.purity.toFixed(4)}) puts s = ${sym.s.toExponential(3)} (${(sym.s * 576).toFixed(3)} / 576) of its one-half-beat crossing weight on one slot from one dock; 0080's color error on R*'s hash E ${e2.first.toFixed(3)} / ${e2.weyl.toFixed(3)} (2 beats), ${e3.first.toFixed(3)} / ${e3.weyl.toFixed(3)} (3 beats); controls C-ANTI ${C_ANTI} (s ${anti.s.toExponential(3)}), C-ID ${C_ID}, instruments ${I}`,
    metrics,
    control: { C_ANTI: flag(C_ANTI), C_ID: flag(C_ID), antiS: anti.s },
    notes: all
      .map(r => `${r.kind}: share ${r.share.toFixed(4)} free ${r.shareFree.toFixed(4)}, lines ${r.lines.map(l => `${l.E.toFixed(4)} (${l.height.toFixed(3)})`).join(', ')}, level E ${r.levelE.toFixed(6)} purity ${r.purity.toFixed(5)} contact share ${r.levelShare.toFixed(4)}, all-three-on-one-dock sector weight ${r.contact.toExponential(3)}, s ${r.s.toExponential(4)} (per slot ${r.sMin.toExponential(3)} to ${r.sMax.toExponential(3)}), I-SEC ${r.iSec.toExponential(2)}, norm drift ${r.normDrift.toExponential(2)}`)
      .join('; '),
  })
}

export function singletCrossingRun(plan: CrossingPlan): Verdict {
  const sym = readStart(plan, 'sym')
  const anti = readStart(plan, 'anti')

  return crossingVerdict(sym, anti, colorErrors(plan.side, 2), colorErrors(plan.side, 3))
}
