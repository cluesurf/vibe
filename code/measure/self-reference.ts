// THE REFERENCE CLOSURE (E-SLF-0197, note/self-reader.md section 7), the self reader
// amended for a known trap. The definition's closure is the operator form
//
//   c_A(t) = <psi_0| U^-t [Tr_E(psi_t psi_t^dag) (x) |eps_t><eps_t|] U^t |psi_0>
//
// and the parts formula sum_e |<a_eps|a_e>|^2 (code/measure/self-reader.ts, closureOf) equals it only when psi_t =
// U^t psi_0: the state ran under the rule that runs it back. Under a run V that adds an opt-in piece to U (E-SLF-0194's
// shape phases and register), the definition with U the reference rule reads
//
//   c_ref_A(t) = <phi_t| [Tr_E(psi_t psi_t^dag) (x) |eps_t><eps_t|] |phi_t>,   phi_t = U^t psi_0
//
// In parts c_ref = sum_e |<b_eps|a_e>|^2, with b_eps the REFERENCE run's region part against eps_t. When psi = phi it is
// closureOf exactly, operation for operation. In a calm complement with conserved members only the parts with every
// member in A meet b_eps, so c_ref = sum_h |<P_A phi_t | P_A psi_h(t)>|^2 over the complement's other records h (a
// register beside the line, with self-free run |h = 0>).

import {
  ConeCap,
  coneBeat,
  coneBoundCount,
  coneNorm,
  coneRegionInner,
  coneStore,
  copyStore,
  registerPass,
  shapePass,
  addAmp,
  type ConeStore,
} from '@/code/measure/cone-line'
import type { LineReader } from '@/code/measure/cold-line'
import {
  configsOf,
  freeNull,
  halfTime,
  lineEps,
  lineParts,
  regionRetention,
  type Closure,
  type Cx,
  type Parts,
} from '@/code/measure/self-reader'
import { OMEGA, steerOf, twistOf, writeOf, type RegisterRule } from '@/code/measure/keel-flame'
import { LINE_FIRSTS, LINE_OF } from '@/code/rule/isometric-knit'

function addTo(m: Map<string, Cx>, key: string, re: number, im: number): void {
  const at = m.get(key)

  if (at) {
    at[0] += re
    at[1] += im
  } else {
    m.set(key, [re, im])
  }
}

// THE REFERENCE CLOSURE of a state given by its parts, against the reference run's parts `ref` and the self-free
// complement `eps` (undefined: the vacuum, key ''). closureAgainst(p, p, eps) is closureOf(p, eps), the same operations
// in the same order
export function closureAgainst(parts: Parts, ref: Parts, eps?: ReadonlyMap<string, Cx>): Closure {
  const e: ReadonlyMap<string, Cx> = eps ?? new Map([['', [1, 0] as Cx]])
  const bEps = new Map<string, Cx>()

  for (const [k, [er, ei]] of e) {
    const b = ref.get(k)

    if (!b) {
      continue
    }

    for (const [rk, [br, bi]] of b) {
      addTo(bEps, rk, er * br + ei * bi, er * bi - ei * br)
    }
  }

  let r = 0

  for (const [x, y] of bEps.values()) {
    r += x * x + y * y
  }

  let c = 0

  for (const a of parts.values()) {
    let pr = 0
    let pi = 0

    for (const [rk, [ar, ai]] of a) {
      const b = bEps.get(rk)

      if (!b) {
        continue
      }

      pr += b[0] * ar + b[1] * ai
      pi += b[0] * ai - b[1] * ar
    }

    c += pr * pr + pi * pi
  }

  return { c, r }
}

// the line form in a calm complement: sum_h |<P_A ref | P_A s_h>|^2
export function referenceClosure(ref: ConeStore, states: readonly ConeStore[], lo: number, hi: number): number {
  let c = 0

  for (const s of states) {
    const [x, y] = coneRegionInner(ref, s, lo, hi)

    c += x * x + y * y
  }

  return c
}

// the parts form of the same, for the check I1: the stores keyed by register value, the reference at h = 0
export function referencePartsClosure(ref: ConeStore, states: readonly ConeStore[], lo: number, hi: number): number {
  const parts = lineParts(new Map(states.map((s, h) => [String(h), s])), lo, hi)
  const refParts = lineParts(new Map([['0', ref]]), lo, hi)

  return closureAgainst(parts, refParts, lineEps(new Map([['0', [1, 0] as Cx]]))).c
}

// ---- an arm beside its reference, in lockstep ----

export type Arm =
  | { name: string; kind: 'twist'; table: readonly number[] }
  | { name: string; kind: 'register'; rule: RegisterRule }

export type ArmRun = {
  name: string
  reach: number
  // the old reader: r (weight with every love in A, summed over register values) and c = r^2, every beat
  r: number[]
  c: number[]
  // the reference closure, every beat
  cRef: number[]
  // the reference's own r^2, every beat
  refC: number[]
  // L = F / F0 at the samples
  L: Map<number, number>
  normDrift: number
  // I1: |line form - parts form| over beats 0..partsBeats
  partsOff: number
}

export function armRun(input: {
  arm: Arm
  start: ConeStore
  lo: number
  hi: number
  rd: LineReader
  F0: number
  T: number
  samples: readonly number[]
  partsBeats?: number
  log?: (what: string) => void
}): ArmRun {
  const { arm, start, lo, hi, rd, F0, T, samples } = input
  const partsBeats = input.partsBeats ?? -1
  const empty = (): ConeStore => coneStore(start.n, start.line, start.cap, start.clock)
  const run: ArmRun = {
    name: arm.name,
    reach: 0,
    r: [],
    c: [],
    cRef: [],
    refC: [],
    L: new Map(),
    normDrift: 0,
    partsOff: 0,
  }

  let ref = copyStore(start)
  let refB = empty()
  // the arm's stores by register value (one store for a twist)
  let A: ConeStore[] = arm.kind === 'twist' ? [copyStore(start)] : [copyStore(start), empty(), empty()]
  let B: ConeStore[] = A.map(() => empty())

  const twist = arm.kind === 'twist' ? twistOf(arm.table) : null
  const plain = arm.kind === 'twist' && arm.table.every(j => j % 3 === 0)

  const read = (t: number): void => {
    const r = A.reduce((s, x) => s + regionRetention(x, lo, hi), 0)
    const rr = regionRetention(ref, lo, hi)
    const cRef = referenceClosure(ref, A, lo, hi)

    run.r.push(r)
    run.c.push(r * r)
    run.refC.push(rr * rr)
    run.cRef.push(cRef)

    if (t <= partsBeats) {
      run.partsOff = Math.max(run.partsOff, Math.abs(cRef - referencePartsClosure(ref, A, lo, hi)))
    }

    if (samples.includes(t)) {
      run.L.set(t, A.reduce((s, x) => s + coneBoundCount(x, rd), 0) / F0)
      run.normDrift = Math.max(
        run.normDrift,
        Math.abs(A.reduce((s, x) => s + coneNorm(x), 0) - 1),
        Math.abs(coneNorm(ref) - 1),
      )
      input.log?.(`${arm.name} beat ${t}: c ${(r * r).toFixed(4)} c_ref ${cRef.toFixed(4)} L ${run.L.get(t)!.toFixed(4)} store ${A.map(x => x.used).join('/')}`)
    }
  }

  read(0)

  for (let t = 1; t <= T; t++) {
    try {
      coneBeat(ref, refB, true)
      ;[ref, refB] = [refB, ref]

      if (arm.kind === 'twist') {
        if (!plain) {
          shapePass(A[0]!, twist!)
        }

        coneBeat(A[0]!, B[0]!, true)
        ;[A, B] = [B, A]
      } else {
        registerPass(A, B, writeOf(arm.rule), steerOf(arm.rule), OMEGA)

        for (let h = 0; h < 3; h++) {
          coneBeat(B[h]!, A[h]!, true)
        }
      }
    } catch (err) {
      if (err instanceof ConeCap) {
        break
      }

      throw err
    }

    run.reach = t
    read(t)
  }

  return run
}

// ---- the lone love on the line (S3', as code/measure/self-reader-ball.ts lineLove) with the reference closure ----

export type LoveReference = {
  slot: number
  mode: number
  c: number[]
  cRef: number[]
  c0: number[]
  tauC: number
  tauRef: number
  tau0: number
  // max |c_ref - c| and max |c - c0| over the beats
  refOff: number
  off: number
  norm: number
}

export function lineLoveReference(slot: number, beats: number, clock: number): LoveReference {
  const line = 2 * beats + 12
  const at = beats + 5
  const forward = LINE_FIRSTS[LINE_OF[slot]!] === slot
  const mode = 2 * at + (forward ? 1 : 0)
  let a = coneStore(1, line, 1e6, clock)

  addAmp(a, Int32Array.of(mode), 1, 0)

  const psi = configsOf(a)
  const r = [regionRetention(a, at - 1, at + 1)]
  const cRef = [referenceClosure(a, [a], at - 1, at + 1)]
  let norm = Math.abs(coneNorm(a) - 1)

  for (let t = 1; t <= beats; t++) {
    const b = coneStore(a.n, a.line, a.cap, a.clock)

    try {
      coneBeat(a, b, true)
    } catch (err) {
      if (err instanceof ConeCap) {
        throw new Error(`self-reference: a lone love passed the cap at beat ${t}`)
      }

      throw err
    }

    a = b
    r.push(regionRetention(a, at - 1, at + 1))
    cRef.push(referenceClosure(a, [a], at - 1, at + 1))
    norm = Math.max(norm, Math.abs(coneNorm(a) - 1))
  }

  const c = r.map(x => x * x)
  const c0 = freeNull({ psi, line, lo: at - 1, hi: at + 1, beats }).r0.map(x => x * x)
  const off = c.reduce((m, x, i) => Math.max(m, Math.abs(x - c0[i]!)), 0)
  const refOff = c.reduce((m, x, i) => Math.max(m, Math.abs(x - cRef[i]!)), 0)

  return { slot, mode, c, cRef, c0, tauC: halfTime(c), tauRef: halfTime(cRef), tau0: halfTime(c0), refOff, off, norm }
}
