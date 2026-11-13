// ATTRACTION IN A BATH (research 21, B1; item vibe-roadmap-grounding-0002). Does the strongest binding the rule has
// keep a composite in a churning background, or does it ionize with no return? Research 21 reads the author's "an
// attraction that lets a bundle hold itself together" two ways: as a binding force, which on a closed reversible box
// keeps nothing for good, or as a cold channel, which does. This run tells them apart on the cheapest bound state.
//
// WHAT IT DOES NOT TEST. Theorem 1 of note/no-attractor-and-the-cost-of-keeping.md already says a closed reversible box
// has no attractor, no repair and no capture, so no gate here is "the bare rule fails to attract". The theorem says
// nothing about HOW LONG a bound state keeps its shape among other content, or whether that time depends on how much
// content there is. That is the measurement: a keeping time and a long-time kept fraction against the bath's density.
//
// THE BOUND STATE. E-SPN-0093's one-line three-love cluster (E 0.33002, spin one half share 0.98236, bound by 1.079),
// the level of code/measure/coined-line-bloch at total momentum 0 in relative coordinates. E-SPN-0102 found the working
// rule alone does not hold it on the mesh's links; E-SPN-0103 wrote the two pieces it lacks (the drift cost as a cut
// trit, the fermion sign of the line block, code/rule/bound-line-pieces), and E-SPN-0104 showed that with both pieces,
// in one frame (flat transport), the rule holds the level for 128 beats as the stand-in does. So the rule here is the
// working knit's line sector with those two pieces and the pass contact (unit 0), on flat links: E-SPN-0104's flat run
// (code/measure/bound-line pointBeatWith with flat and unit 0), which this file reproduces amplitude for amplitude (I1).
//
// THE BATH. k further lone loves on the cluster's own husk line, each at one definite mode (position and label). Under
// the line law only same-line content can reach the cluster, so the run is exact and one-dimensional: the sector is
// every placement of n = 3 + k loves on a ring of L docks (2L modes) with the cut trit c. CHARGE 0: the cut-trit form
// needs n = 0 mod 3 (Gauss f_l = c + Q(l) closes round the ring only then), so k runs over multiples of three and the
// whole line is Z_3-neutral. The bath loves are not bound to anything at the start; the cost then strings every love
// to its neighbours by the flux c + Q(l), the cluster's string and the bath's alike, because the register does not
// know which love belongs to which cluster. That is the rule, stated, not a choice.
//   Starts are enumerated, no random number: the free modes are those at positions s_r + 1 .. L - 1 (s_r below), and
//   start s takes free mode (s + floor(i M / k)) mod M for i = 0 .. k - 1 (M free modes). The cluster is placed at
//   total momentum 0, (1 / sqrt L) sum_X of the level anchored at X, with c = 0: the level's own sector, so alone it
//   only turns its phase. (A packet at one anchor mixes every K, and the relative state at K != 0 is not the K = 0
//   level, so its reading swings by a fifth with no bath at all: the first smoke run, 0.80 at beat 8.) A cluster
//   configuration that shares a mode with the bath is dropped (Pauli, the exclusion-projected product) and the start
//   renormalized; the dropped weight is reported.
//
// THE READING. Loves of one line are identical fermions, so "the cluster" is read as a count: B_X annihilates a trio
// in the level's relative state with its least position at X, and the bound-trio count is F = sum_X <B_X^dag B_X>,
// summed over the cut trit. With no bath it is the weight on the span of the level's translates (orthogonal when every
// read configuration's span is under L / 2, so the read level is the level cut to span s_r = floor((L - 1) / 2) and
// renormalized; its weight on the full level is reported). Any three loves count, bath loves included, so the count
// has a floor that rises with density: in the infinite-temperature state of n loves (every configuration and cut trit
// alike, where a Floquet rule that ionizes ends) it is T_n = L n (n - 1)(n - 2) / (2L (2L - 1)(2L - 2)), a computed
// baseline. The kept fraction is the excess over that floor, bath against lone cluster on the same ring:
//   f_k(t) = (F_k(t) - T_(3+k)) / (F_0(t) - T_3), read every R beats, F_k averaged over the starts
//   keeping time tau_k  the first read beat with f_k < 1/2 (T, censored, if none)
//   long-time fraction  the mean of f_k over the read beats past T / 2, and its largest value there
// THE CONTROL (computed): the bath alone, the same k loves with no cluster, read the same way. Its count says how many
// bound trios the bath makes on its own, which F_k must not be mostly made of.
//
// GATES, fixed before the first run.
//  I1 instrument: on a ring of 8 with k = 3 (start 0), 6 beats, this file's dense engine equals E-SPN-0104's flat ring
//     form (pointBeatWith, cost, sign, unit 0, flat) amplitude for amplitude within 1e-12 on every configuration and cut
//     trit
//  I2 exact and reversible: the same start run 12 beats forward and 12 back returns to itself within 1e-10, and every
//     run below keeps its norm within 1e-10 at every beat
//  C1 the level is E-SPN-0093's: full sweep (box 12) energy and share within 1e-9 of the record (0.33001851839229945,
//     0.9823600683345252); smoke (box 8) within 1e-4 (the box shift; the smoke bar was 1e-5 on the first run, set from
//     a wrong estimate, and the box-8 level reads 1.6e-5. Smoke is no evidence, the full bar is unchanged)
//  C2 the lone cluster holds on every ring: F_0(t) / F_0(0) >= 0.9 at every read beat (E-SPN-0104's fidelity bar)
//  C3 the control is small: the bath alone reads at most T_k + 0.1 at every read beat and every k
//  PREDICTION (the Gap 1 view, research 21): no plateau. On every ring the long-time fraction falls strictly with k,
//     each tested k at least 0.02 below the one before (f = 1 at k = 0 by definition).
//  REFUTATION: a plateau. On some ring the long-time fractions for k >= 3 lie within 0.05 of each other and all at
//     least 0.5: attraction alone keeps a k-independent share, and the sink is not needed.
//  Verdict: fail if I1, I2 or C1 fails (the instrument); open in the smoke setting (it proves the file runs, and is no
//  evidence); otherwise pass on the prediction with C2 and C3, fail on the refutation, open on anything else.
//
// SETTINGS. The default is the SMOKE setting (box-8 level, ring 10, k 0 and 3, one start, 16 beats; under 30 s on the
// laptop). BATH_SWEEP=full is the sweep for the M3: the box-12 level, ring 12 with k 0, 3, 6, 9 (density 0 to 0.75
// lone loves a dock, three starts) and ring 15 with k 0, 3, 6 (two starts), 256 beats each, read every 8. Ring 15 at
// k = 6 holds 3 C(30, 9) = 43 million states (about 2 GB): never on the laptop.
//
// PREDICTIONS (written before the first run). I1, I2, C1 pass. C2 passes (E-SPN-0104: fidelity >= 0.9991 alone). The
// bath strings ionize the cluster: f falls with k, tau_k finite for k >= 6. C3 the least certain: three bath loves at
// span 2 or 4 overlap the level by construction of the reading.
//
// SMOKE RUNS (laptop, 2026-11-12, tmp/run-attraction-in-a-bath.ts, about 6 s; no evidence). Run 1: the cluster as a
// packet at one anchor read 0.80 alone at beat 8 (C2 fail, the K mixing above) and C1 failed its 1e-5 smoke bar
// (1.6e-5). Run 2, at total momentum 0: alone 0.865 flat, because a wrapped translate was placed at c = 0 (its string
// sent the long way round) and B_X left the cluster's cut trit behind; both fixed (wrapped loves move c, B_X takes them
// back). Run 3: I1 3.3e-16, I2 5.6e-16, C1 1.6e-5, alone 0.9941 to 0.9935 (C2), k = 3 on ring 10 (density 0.3, one
// start, Pauli dropped 0.44): f 0.96, 0.49, 0.43, 0.41, 0.39 at beats 0, 4, 8, 12, 16, tau 4, bath alone 0 (floor
// 0.009). Status open (smoke).
//
// FULL RUN (M3, 2026-11-13, BATH_SWEEP=full, clone vibe-bath-b1, 5,317 s, light slot). Status OPEN. I1 2.9e-16, I2
// 3.9e-16 (norm 3.1e-11), C1 exact (level off 0), C2 pass (alone 0.9939 to 0.9941 on ring 12, 0.9994 on ring 15).
// C3 fails only at ring 12, k = 9 (density 0.75): the bath alone reads 1.92 against its floor 0.50, so that cell is
// no evidence. Long-time fractions (mean past beat 128, max in brackets), keeping time tau:
//   ring 12: k 3 0.246 (0.268) tau 8; k 6 0.159 (0.167) tau 8; k 9 1.02 (C3 fail)
//   ring 15: k 3 0.309 (0.340) tau 32; k 6 0.397 (0.420) tau 16
// The refutation (a plateau at 0.5 or more) fails on every ring: attraction alone does not keep the cluster; the
// bath strips more than half its excess within 8 to 32 beats at every density. The prediction's strict fall with k
// also fails, on ring 15 (k 6 above k 3), so the run is open by rule. Every series still falls slowly at beat 256
// (ring 15 k 6: 0.420 at 136 to 0.375 at 256), so the long-time reading is erosion, not a floor: a plateau below 0.5
// is not ruled out, and the fractions are not ordered by density, which a pure ionization picture predicts.
//
// Depth L2: the working knit's line sector with the two pieces of E-SPN-0103 on flat links (a rule with pieces chosen,
// E-SPN-0104's), floats standing for the exact per-slice run (checked against it by I1), the level a float eigenvector
// (measurement). DETERMINISM: no random number. HUSK FIRST: every love is on one husk line.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
} from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { AxisRing, Placed } from '@/code/measure/held-cluster'
import { pointBeatWith, type CutState } from '@/code/measure/bound-line'
import type { LockedTables } from '@/code/rule/doublet-locked-knit'

const RECORDED = {
  energy: 0.33001851839229945,
  share: 0.9823600683345252,
}

type Ring = { L: number; ks: readonly number[]; starts: number }
type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelTolerance: number
  rings: readonly Ring[]
  beats: number
  readEvery: number
}

const SMOKE: Setting = {
  name: 'smoke',
  box: 8,
  levelTolerance: 1e-4,
  rings: [{ L: 10, ks: [0, 3], starts: 1 }],
  beats: 16,
  readEvery: 4,
}
const FULL: Setting = {
  name: 'full',
  box: 12,
  levelTolerance: 1e-9,
  rings: [
    { L: 12, ks: [0, 3, 6, 9], starts: 3 },
    { L: 15, ks: [0, 3, 6], starts: 2 },
  ],
  beats: 256,
  readEvery: 8,
}

const INSTRUMENT = { L: 8, k: 3, beats: 6, reverse: 12 }
const EXACT = 1e-12
const REVERSED = 1e-10
const HOLD = 0.9
const CONTROL = 0.1
const FALL = 0.02
const PLATEAU = 0.05
const PLATEAU_FLOOR = 0.5

// ---- complex constants of the rule (code/measure/bound-line) ----
const SQ3 = Math.sqrt(3)
const KEEP: [number, number] = [0.25, SQ3 / 4]
const CROSS: [number, number] = [0.75, -SQ3 / 4]
// a phase exp(2 pi i a / 42): the cost zeta_14^(-n) is a = -3 n, a full dock's det w times the meeting's w is
// w^2, a = 28
const TURN = 42
const COS = Float64Array.from({ length: TURN }, (_, a) =>
  Math.cos((2 * Math.PI * a) / TURN),
)
const SIN = Float64Array.from({ length: TURN }, (_, a) =>
  Math.sin((2 * Math.PI * a) / TURN),
)

function popcount(v: number): number {
  let x = v - ((v >>> 1) & 0x55555555)

  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  x = (x + (x >>> 4)) & 0x0f0f0f0f

  return Math.imul(x, 0x01010101) >>> 24
}

// ---- the sector: every placement of n loves on 2L modes (mode 2x + 1 the forward label 0, 2x the back label 1,
// the line block's order of code/rule/bound-line-pieces), ranked in colex order, times the cut trit ----
type Space = {
  L: number
  n: number
  masks: Int32Array
  binom: Float64Array[]
}

function binomials(top: number): Float64Array[] {
  const C: Float64Array[] = []

  for (let a = 0; a <= top; a++) {
    C.push(new Float64Array(top + 2))
    C[a]![0] = 1

    for (let b = 1; b <= a; b++) {
      C[a]![b] = C[a - 1]![b - 1]! + (b <= a - 1 ? C[a - 1]![b]! : 0)
    }
  }

  return C
}

function space(L: number, n: number): Space {
  const binom = binomials(2 * L)
  const count = binom[2 * L]![n]!
  const masks = new Int32Array(count)

  if (n === 0) {
    return { L, n, masks, binom }
  }

  let v = (1 << n) - 1

  for (let r = 0; r < count; r++) {
    masks[r] = v

    const c = v & -v
    const s = v + c

    v = (((s ^ v) >>> 2) / c) | s
  }

  return { L, n, masks, binom }
}

function rank(sp: Space, mask: number): number {
  let r = 0
  let i = 0
  let m = mask

  while (m !== 0) {
    const low = m & -m
    const p = 31 - Math.clz32(low)

    i++
    r += sp.binom[p]![i]!
    m ^= low
  }

  return r
}

type Engine = {
  sp: Space
  // per mask: the pre-coin phase index for each cut trit, the stream's target rank, the cut change and the sign
  phase: Uint8Array
  target: Int32Array
  dc: Int8Array
  sign: Int8Array
}

function engine(L: number, n: number): Engine {
  const sp = space(L, n)
  const M = sp.masks.length
  const phase = new Uint8Array(M * 3)
  const target = new Int32Array(M)
  const dc = new Int8Array(M)
  const sign = new Int8Array(M)
  const q = new Int32Array(L)

  for (let r = 0; r < M; r++) {
    const mask = sp.masks[r]!

    let full = 0

    for (let x = 0; x < L; x++) {
      const d = (mask >>> (2 * x)) & 3

      q[x] = popcount(d)

      if (d === 3) {
        full++
      }
    }

    for (let c = 0; c < 3; c++) {
      let Q = 0
      let links = 0

      for (let l = 0; l < L; l++) {
        Q += q[l]!

        if ((c + Q) % 3 !== 0) {
          links++
        }
      }

      phase[r * 3 + c] =
        (((-3 * links + 28 * full) % TURN) + TURN) % TURN
    }

    // the stream: label 0 (bit 2x + 1) one position forward, label 1 (bit 2x) one back; the sign is the parity of the
    // reordering in the line block's order, read on the coined configuration (code/rule/bound-line-pieces lineSign)
    let after = 0
    let seen = 0
    let inversions = 0
    let cut = 0
    let m = mask

    while (m !== 0) {
      const low = m & -m
      const b = 31 - Math.clz32(low)
      const x = b >>> 1
      const forward = (b & 1) === 1
      const y = forward ? (x + 1) % L : (x - 1 + L) % L
      const nb = forward ? 2 * y + 1 : 2 * y

      if (forward && x === L - 1) {
        cut--
      }

      if (!forward && x === 0) {
        cut++
      }

      inversions += popcount(seen >>> nb)
      seen |= 1 << nb
      after |= 1 << nb
      m ^= low
    }

    target[r] = rank(sp, after)
    dc[r] = ((cut % 3) + 3) % 3
    sign[r] = inversions % 2 === 0 ? 1 : -1
  }

  return { sp, phase, target, dc, sign }
}

type Amp = { re: Float64Array; im: Float64Array }

const emptyAmp = (size: number): Amp => ({
  re: new Float64Array(size),
  im: new Float64Array(size),
})

function coinPass(e: Engine, a: Amp, adjoint: boolean): void {
  const { sp } = e
  const M = sp.masks.length
  const kr = KEEP[0]
  const ki = adjoint ? -KEEP[1] : KEEP[1]
  const cr = CROSS[0]
  const ci = adjoint ? -CROSS[1] : CROSS[1]

  for (let x = 0; x < sp.L; x++) {
    const front = 1 << (2 * x + 1)
    const back = 1 << (2 * x)
    const below = back - 1
    const C1 = sp.binom[2 * x + 1]!
    const C0 = sp.binom[2 * x]!

    for (let r = 0; r < M; r++) {
      const mask = sp.masks[r]!

      if ((mask & front) === 0 || (mask & back) !== 0) {
        continue
      }

      const i = popcount(mask & below) + 1
      const p = r - C1[i]! + C0[i]!

      for (let c = 0; c < 3; c++) {
        const u = r * 3 + c
        const v = p * 3 + c
        const ar = a.re[u]!
        const ai = a.im[u]!
        const br = a.re[v]!
        const bi = a.im[v]!

        a.re[u] = kr * ar - ki * ai + (cr * br - ci * bi)
        a.im[u] = kr * ai + ki * ar + (cr * bi + ci * br)
        a.re[v] = cr * ar - ci * ai + (kr * br - ki * bi)
        a.im[v] = cr * ai + ci * ar + (kr * bi + ki * br)
      }
    }
  }
}

function phasePass(e: Engine, a: Amp, conjugate: boolean): void {
  const size = e.phase.length

  for (let u = 0; u < size; u++) {
    const t = e.phase[u]!
    const pr = COS[t]!
    const pi = conjugate ? -SIN[t]! : SIN[t]!
    const ar = a.re[u]!
    const ai = a.im[u]!

    a.re[u] = pr * ar - pi * ai
    a.im[u] = pr * ai + pi * ar
  }
}

// one beat: the cost and the full docks' phase, the coin, the sign and the stream (c moved by the cut crossings)
function beat(e: Engine, a: Amp, out: Amp): void {
  phasePass(e, a, false)
  coinPass(e, a, false)

  const M = e.sp.masks.length

  for (let r = 0; r < M; r++) {
    const t = e.target[r]!
    const s = e.sign[r]!
    const d = e.dc[r]!

    for (let c = 0; c < 3; c++) {
      const v = t * 3 + ((c + d) % 3)

      out.re[v] = s * a.re[r * 3 + c]!
      out.im[v] = s * a.im[r * 3 + c]!
    }
  }
}

function beatBack(e: Engine, a: Amp, out: Amp): void {
  const M = e.sp.masks.length

  for (let r = 0; r < M; r++) {
    const t = e.target[r]!
    const s = e.sign[r]!
    const d = e.dc[r]!

    for (let c = 0; c < 3; c++) {
      const v = t * 3 + ((c + d) % 3)

      out.re[r * 3 + c] = s * a.re[v]!
      out.im[r * 3 + c] = s * a.im[v]!
    }
  }

  coinPass(e, out, true)
  phasePass(e, out, true)
}

const normOf = (a: Amp): number => {
  let s = 0

  for (let u = 0; u < a.re.length; u++) {
    s += a.re[u]! ** 2 + a.im[u]! ** 2
  }

  return s
}

// ---- the start: the cluster at anchor 0 with c = 0, the bath's modes, Pauli dropped, normalized ----
type Start = { amp: Amp; dropped: number }

function modesOf(
  ts: readonly (readonly [number, number])[],
  L: number,
): number {
  let m = 0

  for (const [x, j] of ts) {
    const y = ((x % L) + L) % L

    m |= 1 << (j === 0 ? 2 * y + 1 : 2 * y)
  }

  return m
}

// the parity of normal-ordering A_dag B_dag (A's modes then B's) into ascending order
function mergeSign(a: number, b: number): number {
  let n = 0
  let m = a

  while (m !== 0) {
    const low = m & -m

    n += popcount(b & (low - 1))
    m ^= low
  }

  return n % 2 === 0 ? 1 : -1
}

function startState(
  e: Engine,
  placed: readonly Placed[] | undefined,
  bath: number,
): Start {
  const amp = emptyAmp(e.sp.masks.length * 3)

  let dropped = 0

  if (placed === undefined) {
    amp.re[rank(e.sp, bath) * 3] = 1

    return { amp, dropped }
  }

  // total momentum 0: every anchor X with weight 1 / L (a wrapped translate is a cyclic reordering of three, even)
  const L = e.sp.L
  const w = 1 / Math.sqrt(L)

  for (let X = 0; X < L; X++) {
    for (const p of placed) {
      const m = modesOf(
        p.ts.map(([x, j]) => [x + X, j] as const),
        L,
      )

      if ((m & bath) !== 0) {
        dropped += (p.re ** 2 + p.im ** 2) / L
        continue
      }

      // the cut trit that keeps the string on the cluster's span: every love carried past the cut moves c by -1, as
      // the stream's own crossing does (Gauss f_l = c + Q(l) then holds 0 outside the span)
      const wrapped = p.ts.reduce(
        (n, [x]) => n + Math.floor((x + X) / L),
        0,
      )
      const s = mergeSign(m, bath)
      const u = rank(e.sp, m | bath) * 3 + (((-wrapped % 3) + 3) % 3)

      amp.re[u]! += s * w * p.re
      amp.im[u]! += s * w * p.im
    }
  }

  const norm = Math.sqrt(normOf(amp))

  for (let u = 0; u < amp.re.length; u++) {
    amp.re[u]! /= norm
    amp.im[u]! /= norm
  }

  return { amp, dropped }
}

// the bath's modes for start s: free mode (s + floor(i M / k)) mod M
function bathModes(
  L: number,
  read: number,
  k: number,
  s: number,
): number {
  const free: number[] = []

  for (let x = read + 1; x < L; x++) {
    free.push(2 * x, 2 * x + 1)
  }

  let m = 0

  for (let i = 0; i < k; i++) {
    m |=
      1 << free[(s + Math.floor((i * free.length) / k)) % free.length]!
  }

  return m
}

// ---- the reading: F = sum_X <B_X^dag B_X> ----
type Reader = {
  L: number
  // per anchor X: each read configuration's modes, the level's conjugate amplitude, and the loves it carries past the
  // cut: B_X takes the trio WITH its string, so the cut trit left behind is c + wrapped (the start's placement undone)
  at: { mask: number; re: number; im: number; wrapped: number }[][]
  weight: number
}

function reader(placed: readonly Placed[], L: number): Reader {
  const read = Math.floor((L - 1) / 2)
  const kept = placed.filter(
    p =>
      Math.max(...p.ts.map(t => t[0])) <= read &&
      p.re ** 2 + p.im ** 2 > 1e-24,
  )
  const weight = kept.reduce((s, p) => s + p.re ** 2 + p.im ** 2, 0)
  const scale = 1 / Math.sqrt(weight)
  const at = Array.from({ length: L }, (_, X) =>
    kept.map(p => ({
      mask: modesOf(
        p.ts.map(([x, j]) => [x + X, j] as const),
        L,
      ),
      re: p.re * scale,
      im: -p.im * scale,
      wrapped:
        p.ts.reduce((n, [x]) => n + Math.floor((x + X) / L), 0) % 3,
    })),
  )

  return { L, at, weight }
}

const RESTS = new Map<string, Space>()

function restSpace(L: number, n: number): Space {
  const key = `${L},${n}`
  const found = RESTS.get(key)

  if (found) {
    return found
  }

  const made = space(L, n)

  RESTS.set(key, made)

  return made
}

function boundCount(e: Engine, rd: Reader, a: Amp): number {
  const { sp } = e
  const n = sp.n

  if (n < 3) {
    return 0
  }

  const rest = restSpace(sp.L, n - 3)
  const R = rest.masks.length
  const acc = emptyAmp(sp.L * R * 3)
  const M = sp.masks.length

  for (let r = 0; r < M; r++) {
    let any = false

    for (let c = 0; c < 3; c++) {
      if (a.re[r * 3 + c] !== 0 || a.im[r * 3 + c] !== 0) {
        any = true
      }
    }

    if (!any) {
      continue
    }

    const mask = sp.masks[r]!

    for (let X = 0; X < sp.L; X++) {
      if (((mask >>> (2 * X)) & 3) === 0) {
        continue
      }

      for (const t of rd.at[X]!) {
        if ((mask & t.mask) !== t.mask) {
          continue
        }

        const others = mask ^ t.mask

        let parity = 0
        let m = t.mask

        while (m !== 0) {
          const low = m & -m

          parity += popcount(others & (low - 1))
          m ^= low
        }

        const s = parity % 2 === 0 ? 1 : -1
        const base = (X * R + rank(rest, others)) * 3

        for (let c = 0; c < 3; c++) {
          const ar = a.re[r * 3 + c]!
          const ai = a.im[r * 3 + c]!
          const left = (c + t.wrapped) % 3

          acc.re[base + left]! += s * (t.re * ar - t.im * ai)
          acc.im[base + left]! += s * (t.re * ai + t.im * ar)
        }
      }
    }
  }

  return normOf(acc)
}

// ---- one run: F at every read beat, the worst norm drift ----
type Run = {
  counts: number[]
  beats: number[]
  normOff: number
  dropped: number
}

function run(
  L: number,
  k: number,
  s: number,
  withCluster: boolean,
  placed: readonly Placed[],
  rd: Reader,
  setting: Setting,
): Run {
  const n = (withCluster ? 3 : 0) + k
  const e = engine(L, n)
  const bath = bathModes(L, Math.floor((L - 1) / 2), k, s)
  const st = startState(e, withCluster ? placed : undefined, bath)

  let a = st.amp
  let b = emptyAmp(a.re.length)
  let normOff = Math.abs(normOf(a) - 1)

  const counts = [boundCount(e, rd, a)]
  const beats = [0]

  for (let t = 1; t <= setting.beats; t++) {
    beat(e, a, b)
    ;[a, b] = [b, a]
    normOff = Math.max(normOff, Math.abs(normOf(a) - 1))

    if (t % setting.readEvery === 0) {
      counts.push(boundCount(e, rd, a))
      beats.push(t)
    }
  }

  return { counts, beats, normOff, dropped: st.dropped }
}

// ---- I1 and I2 ----
function instrument(placed: readonly Placed[]): {
  worst: number
  reversed: number
  normOff: number
} {
  const { L, k } = INSTRUMENT
  const e = engine(L, 3 + k)
  const fit = fitRing(placed, L).kept
  const bath = bathModes(L, Math.floor((L - 1) / 2), k, 0)
  const st = startState(e, fit, bath)
  // E-SPN-0104's flat ring form: on flat links the ring's tables are never read (every point is held at 0)
  const ring: AxisRing = {
    docks: Array.from({ length: L }, () => 0),
    first: 0,
    second: 1,
    position: new Map(),
  }
  const tables = {} as LockedTables

  let cut: CutState = new Map()

  for (let u = 0; u < st.amp.re.length; u++) {
    const re = st.amp.re[u]!
    const im = st.amp.im[u]!

    if (re === 0 && im === 0) {
      continue
    }

    const r = Math.floor(u / 3)
    const ts: { x: number; j: number; p: number }[] = []

    for (let bit = 0; bit < 2 * L; bit++) {
      if ((e.sp.masks[r]! >>> bit) & 1) {
        ts.push({ x: bit >>> 1, j: bit & 1 ? 0 : 1, p: 0 })
      }
    }

    cut.set(`${u}`, { ts, c: u % 3, amp: [re, im] })
  }

  let a = st.amp
  let b = emptyAmp(a.re.length)
  let worst = 0
  let normOff = 0

  for (let t = 0; t < INSTRUMENT.beats; t++) {
    cut = pointBeatWith(
      { cost: true, sign: true, unit: 0, flat: true },
      tables,
      ring,
      cut,
    )
    beat(e, a, b)
    ;[a, b] = [b, a]

    const seen = new Set<number>()

    for (const v of cut.values()) {
      let m = 0

      for (const tk of v.ts) {
        m |= 1 << (tk.j === 0 ? 2 * tk.x + 1 : 2 * tk.x)
      }

      const u = rank(e.sp, m) * 3 + v.c

      seen.add(u)
      worst = Math.max(
        worst,
        Math.abs(a.re[u]! - v.amp[0]),
        Math.abs(a.im[u]! - v.amp[1]),
      )
    }

    for (let u = 0; u < a.re.length; u++) {
      if (!seen.has(u)) {
        worst = Math.max(worst, Math.abs(a.re[u]!), Math.abs(a.im[u]!))
      }
    }
  }

  // I2: forward and back
  const start = startState(e, fit, bath).amp

  a = startState(e, fit, bath).amp
  b = emptyAmp(a.re.length)

  for (let t = 0; t < INSTRUMENT.reverse; t++) {
    beat(e, a, b)
    ;[a, b] = [b, a]
    normOff = Math.max(normOff, Math.abs(normOf(a) - 1))
  }

  for (let t = 0; t < INSTRUMENT.reverse; t++) {
    beatBack(e, a, b)
    ;[a, b] = [b, a]
  }

  let reversed = 0

  for (let u = 0; u < a.re.length; u++) {
    reversed = Math.max(
      reversed,
      Math.abs(a.re[u]! - start.re[u]!),
      Math.abs(a.im[u]! - start.im[u]!),
    )
  }

  return { worst, reversed, normOff }
}

type RingResult = {
  L: number
  lone: number[]
  beats: number[]
  rows: {
    k: number
    fraction: number[]
    tau: number
    late: number
    lateMax: number
    control: number
    controlFloor: number
    floor: number
    dropped: number
    normOff: number
  }[]
  normOff: number
  readWeight: number
}

const mean = (xs: readonly number[]): number =>
  xs.reduce((s, x) => s + x, 0) / xs.length

// the bound-trio count of the infinite-temperature state of n loves on a ring of L
const thermal = (L: number, n: number): number =>
  (L * n * (n - 1) * (n - 2)) / (2 * L * (2 * L - 1) * (2 * L - 2))

export default experiment({
  id: 'selves/attraction-in-a-bath',
  code: 'E-SLF-0182',
  title:
    "attraction in a bath (research 21, B1): E-SPN-0093's bound one-line cluster, held by the working knit's line sector with E-SPN-0103's two pieces on flat links, placed among k lone loves on its own husk line (charge 0 mod 3): how long it keeps its shape against the bath's density, and whether any share is kept independent of density",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.BATH_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---- the level (C1) ----
    const basis = lineBasis({
      flavors: [0, 0, 0],
      statistics: 'fermion',
      D: 3,
      box: setting.box,
      unit: 0,
    })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.max(
      Math.abs(level.unwrapped - RECORDED.energy),
      Math.abs(level.spinHalf - RECORDED.share),
    )
    const gC1 = levelOff <= setting.levelTolerance

    log('level')

    // ---- I1, I2 ----
    const inst = instrument(placed)

    log('instrument')

    // ---- the sweep ----
    const rings: RingResult[] = setting.rings.map(ring => {
      const { L } = ring
      const fit = fitRing(placed, L).kept
      const rd = reader(placed, L)
      const lone = run(L, 0, 0, true, fit, rd, setting)
      const rows = ring.ks
        .filter(k => k > 0)
        .map(k => {
          const runs: Run[] = []
          const controls: Run[] = []

          for (let s = 0; s < ring.starts; s++) {
            runs.push(run(L, k, s, true, fit, rd, setting))
            controls.push(run(L, k, s, false, fit, rd, setting))
            log(`ring ${L} k ${k} start ${s}`)
          }

          const T0 = thermal(L, 3)
          const Tk = thermal(L, 3 + k)
          const fraction = lone.counts.map(
            (F0, i) =>
              (mean(runs.map(r => r.counts[i]!)) - Tk) / (F0 - T0),
          )
          const tauAt = fraction.findIndex(f => f < 0.5)
          const late = fraction.filter(
            (_, i) => lone.beats[i]! > setting.beats / 2,
          )

          return {
            k,
            fraction,
            tau: tauAt < 0 ? setting.beats : lone.beats[tauAt]!,
            late: mean(late),
            lateMax: Math.max(...late),
            control: Math.max(...controls.flatMap(r => r.counts)),
            controlFloor: thermal(L, k),
            floor: Tk,
            dropped: Math.max(...runs.map(r => r.dropped)),
            normOff: Math.max(
              ...runs.map(r => r.normOff),
              ...controls.map(r => r.normOff),
            ),
          }
        })

      log(`ring ${L}`)

      return {
        L,
        lone: lone.counts,
        beats: lone.beats,
        rows,
        normOff: Math.max(lone.normOff, ...rows.map(r => r.normOff)),
        readWeight: rd.weight,
      }
    })

    // ---- gates ----
    const gI1 = inst.worst <= EXACT
    const gI2 =
      inst.reversed <= REVERSED &&
      inst.normOff <= REVERSED &&
      rings.every(r => r.normOff <= REVERSED)
    const gC2 = rings.every(r =>
      r.lone.every(F => F / r.lone[0]! >= HOLD),
    )
    const gC3 = rings.every(r =>
      r.rows.every(w => w.control <= w.controlFloor + CONTROL),
    )
    const falls = rings.every(r => {
      const lates = [1, ...r.rows.map(w => w.late)]

      return lates.every((f, i) => i === 0 || f <= lates[i - 1]! - FALL)
    })
    const plateau = rings.some(r => {
      const lates = r.rows.map(w => w.late)

      return (
        lates.length >= 2 &&
        Math.max(...lates) - Math.min(...lates) <= PLATEAU &&
        Math.min(...lates) >= PLATEAU_FLOOR
      )
    })
    const instrumentOk = gI1 && gI2 && gC1
    const status: 'pass' | 'fail' | 'open' = !instrumentOk
      ? 'fail'
      : setting.name === 'smoke'
        ? 'open'
        : plateau
          ? 'fail'
          : falls && gC2 && gC3
            ? 'pass'
            : 'open'

    const f4 = (x: number): string => x.toFixed(4)
    const ringRow = (r: RingResult): string =>
      `ring ${r.L} (read weight ${f4(r.readWeight)}; lone count ${r.lone.map(f4).join(' ')} at beats ${r.beats.join(' ')}): ${r.rows
        .map(
          w =>
            `k ${w.k} (density ${(w.k / r.L).toFixed(3)}): fraction ${w.fraction.map(f4).join(' ')}, tau ${w.tau}${w.tau === setting.beats ? '+' : ''}, late ${f4(w.late)} (max ${f4(w.lateMax)}), floor T ${f4(w.floor)}, bath-alone count at most ${f4(w.control)} (its floor ${f4(w.controlFloor)}), Pauli dropped ${w.dropped.toExponential(1)}`,
        )
        .join('; ')}`

    const metrics: Record<string, number> = {
      gate_I1: gI1 ? 1 : 0,
      gate_I2: gI2 ? 1 : 0,
      gate_C1: gC1 ? 1 : 0,
      gate_C2: gC2 ? 1 : 0,
      gate_C3: gC3 ? 1 : 0,
      prediction_falls: falls ? 1 : 0,
      refutation_plateau: plateau ? 1 : 0,
      levelEnergy: level.unwrapped,
      levelShare: level.spinHalf,
      levelOff,
      instrumentWorst: inst.worst,
      reversed: inst.reversed,
      normOff: Math.max(inst.normOff, ...rings.map(r => r.normOff)),
      seconds: (Date.now() - started) / 1000,
    }

    for (const r of rings) {
      metrics[`ring${r.L}_readWeight`] = r.readWeight
      metrics[`ring${r.L}_loneLeast`] = Math.min(
        ...r.lone.map(F => F / r.lone[0]!),
      )

      for (const w of r.rows) {
        metrics[`ring${r.L}_k${w.k}_tau`] = w.tau
        metrics[`ring${r.L}_k${w.k}_late`] = w.late
        metrics[`ring${r.L}_k${w.k}_lateMax`] = w.lateMax
        metrics[`ring${r.L}_k${w.k}_control`] = w.control
      }
    }

    return verdict({
      status,
      claim: `${setting.name} setting: E-SPN-0093's cluster (E ${level.unwrapped.toFixed(5)}, share ${level.spinHalf.toFixed(5)}, box ${setting.box}) among k lone loves on its husk line, ${setting.beats} beats: ${rings.map(ringRow).join(' || ')}; the dense engine equals E-SPN-0104's flat ring form to ${inst.worst.toExponential(1)} and runs back to ${inst.reversed.toExponential(1)}; prediction (no plateau) ${falls}, refutation (plateau) ${plateau}`,
      metrics,
      control: Object.fromEntries(
        rings.flatMap(r =>
          r.rows.map(w => [`ring${r.L}_k${w.k}_bathAlone`, w.control]),
        ),
      ),
      notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. Gates I1 ${gI1}, I2 ${gI2}, C1 ${gC1} (level off ${levelOff.toExponential(1)}), C2 ${gC2}, C3 ${gC3}. The rule: the working knit's line sector with E-SPN-0103's drift cost (cut trit) and fermion sign, pass contact, flat links (E-SPN-0104's flat ring form), in floats; theorem 1 of note/no-attractor-and-the-cost-of-keeping.md is not retested. Charge 0: k a multiple of 3 so the cut-trit Gauss form closes. The bath loves are strung to their neighbours by the same register as the cluster's loves.`,
    })
  },
})
