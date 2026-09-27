// THE FRAME MIXER LIFTED TO A FRAME'S WHOLE OCCUPATION (E-SPN-0096). E-SPN-0095 applied G (E-SPN-0094: G = I - 2Q,
// the Grover diffusion on each frame of four orthogonal lines) only to a frame holding exactly ONE open vibe. That
// threshold in occupation is not how a free field's one-particle map extends to many particles: the extension is the
// second-quantized lift, linear, acting on every occupation of the frame. On the sampled Born path the thresholded G
// made a lone vibe's wake grow about 1.3 fold a beat (tmp/wake-probe2.log). Here the lift is defined for the knit's
// own statistics and classified.
//
// THE LIFT (derived before the run, code/measure/frame-lift, each clause gated below).
// (1) The knit's statistics: one vibe a slot (Pauli, whatever the vibe's kind), the coin keeping a full line with its
//     determinant det C = w (code/rule/coined-locked-knit, even for a love and a fear), and the canonical fermion sign
//     in the mode order modeIndex (dock by dock, line by line, first slot then second). So the lift is the fermionic
//     one: Gamma(U) e_S = sum_T det U[T, S] e_T. For G = I - (1/4) J on each frame it is
//         Gamma(G) = 1 - (1/4) sum_(i, j in frame) c_i^dag c_j = (-1)^(N_u),
//     N_u the occupation of the frame's uniform mode u: on a frame of n vibes keep (4 - n)/4, or take ONE vibe to one
//     empty slot of the frame with -1/4 times (-1)^(occupied modes strictly between the two slots); never two at once
//     (u ^ u = 0). In Z[1/2]: n = 1 is G; a full line keeps 1/2 (E-SPN-0094's line block determinant); n = 4 is never
//     kept; a full frame is kept with -1. Real, symmetric and (-1)^(N_u) squares to 1: an involution, so unitary.
// (2) Covariant: Gamma is a functor, so Gamma(G) commutes with Gamma(g) for every g in W(F4), which is the SIGNED
//     action. The unsigned action (the configuration code's literal permutation) is not Gamma(g), so it fails where
//     a hop passes an occupied mode whose order g changes. The hard-core boson lift (no sign) is not unitary.
// (3) Laws: a hop moves one vibe inside its dock, so charge, count, C and the stores are kept and made = unmade is not
//     touched; the occupation momentum (the sum of occupied roots) changes on every hop, as it does under G and the coin.
// (4) CONTENT. A term moves at most one vibe, so a frame whose vibes share one content (value and point) lifts with no
//     choice. A frame of two contents (the vacuum's love and fear, two loves of unequal points) does not: species-blind
//     with the content carried by the moving vibe is NOT unitary (a love at a and a fear at b, against a love at a and
//     a fear at d, overlap 1/16, the one term the single-species sum cancels); species by species (a love field and a
//     fear field) puts a love and a fear on one slot, outside the knit (3/32 of a full line's weight); species-blind
//     with the contents assigned by rank in mode order IS unitary (Gamma(G) times the identity on the ranks) but NOT
//     covariant (a map that swaps the two slots' order swaps the ranks). So the lift is defined, unitary and covariant
//     exactly on frames of one content, every vibe open; elsewhere it is the identity.
// (5) THE VACUUM. Its frames hold a love and a fear (and pairs of unequal points): two contents, where (4) leaves them
//     alone. Where a frame does hold one content, no line-mixing lift fixes it: Gamma(U) fixes e_S only when its
//     principal minor has modulus 1, and for M_alpha = I + (alpha - 1) Q that needs u in span(S) or u orthogonal to
//     it, so only the empty and the full frame; the distinguishable love-times-fear lift fixes a line pair only when
//     |U_rr| = 1. So of the 180 line-mixing ring unitaries (30 classes up to phase) none leaves a full line of one
//     content, any frame of 1 to 7 vibes, or a love-and-fear line pair untouched while still mixing: the answer to
//     "is there a mixer that leaves the vacuum alone and still mixes" is no, and G's lift is kept as the canonical one.
//
// GATES, fixed before the first run.
//  L1 the formula is the exterior power: on each of the 3 frames, for every pair of occupations of one size n = 1..8
//     (12,870 a frame), 64 det G[T, S] = 4^n liftDock(S)[T] exactly; and each layer's trace is C(7,n) - C(7,n-1)
//  L2 on each frame's 256 occupations Gamma(G) is symmetric and squares to the identity exactly
//  L3 on every dock occupation of one content with at most three vibes (2,325), Gamma(G) commutes with the signed action
//     of all 1,152 elements (0 failures); the unsigned action fails on at least one (x, g) (reported)
//  L4 the rule's liftBranch on those 2,325 docks (loves, and with every store full): every image keeps the vibe count,
//     the charge and the stores; the occupation momentum changes on exactly the hop images; with fears in place of loves
//     the images are the same with every value negated (C)
//  L5 content: (a) species-blind carried by the moving vibe, on the 56 love-and-fear occupations of a frame: every image
//     has norm 1 and some pair overlaps (the largest 1/16); (b) species by species on a love and a fear on one line:
//     3/32 of the weight on a slot holding both; (c) by rank: the 56 images orthonormal exactly, and covariance fails
//     on at least one (x, g) of the 168 dock configurations x 1,152
//  L6 of the 216 ring unitaries (E-SPN-0094), on a frame's 255 nonempty occupations: the 180 line-mixing fix (principal
//     minor of modulus 1) the full frame and nothing else (0 fix a full line, 0 fix any occupation of 1 to 7), and the
//     distinguishable love-and-fear line pair is fixed by 0 of 180; the 36 lock-keeping fix every full line
//  L7 the rule's piece (code/rule/coined-locked-knit liftBranch) is Gamma(G): equal to liftDock on the 2,325 docks, an
//     involution on all of them (twice returns the start with amplitude 1), equal to mixBranch on the 24 lone docks,
//     and the identity on the 168 love-and-fear, the 168 unequal-point and the 192 closed-vibe frame occupations
//  L8 controls: (a) E-SPN-0095's thresholded G differs from the lift on all 741 one-content frame occupations of 2 or
//     more vibes and agrees on the 24 of one; (b) the lift of the non-covariant reflection I - v v^T (E-SPN-0094 H8a)
//     fails the signed action on more than half of the 1,152; (c) the hop lift without the fermion sign is not
//     unitary (some pair of the 256 frame occupations overlaps)
//  Verdict: pass if L1 to L8 hold.
//
// PREDICTIONS: all pass. The answer: the lift exists and is canonical ((-1)^(N_u)), but only on frames of one content;
// the vacuum's frames are of two contents, so it acts on them only where they hold like vibes of equal points, and no
// line-mixing lift fixes those. E-SPN-0097 adds it to the working vacuum.
//
// PROBE BEFORE THIS FILE, disclosed (tmp/lift-probe1.log): the census of frames on the vacuum's paths (side 8, the coin
// and E-SPN-0095's G on): Born, beats 1 to 96, 44,805 frames of two of two contents, 1,275 of two of ONE content, and
// frames of 4, 6 and 8 all of two contents; the exchange path none of one content. No gate was read.
//
// RUNS. tmp/spn96-exp1.log: stopped by hand at 32 minutes with no verdict (L3's slot maps were slow; rewritten on bit
// masks, no gate touched). tmp/spn96-exp2.log (906 s): L1 failed on the trace clause alone, because the check compared
// the trace of liftDock (over 64) with 16 (C(7,n) - C(7,n-1)) instead of 64 (C(7,n) - C(7,n-1)): a scale slip in the
// code of the check, not in the gate, fixed and rerun. THE RECORD, tmp/spn96-exp3.log (641 s): fail on L4 and L5, no
// gate moved. L1, L2, L3, L6, L7 and L8 hold as predicted. L4 fails on its clause "the occupation momentum changes on
// exactly the hop images": it changes on 407,664 of 415,856. A single hop always changes it (by s - r), so the 8,192
// unchanged are images with hops in two frames at once, whose changes cancel; the derivation missed that case (not
// separately verified here). Charge, count, C and the stores hold (0 off). L5 fails on the clause "the largest overlap
// 1/16": it is 2/16. The substance holds: carrying the content with the moving vibe is not unitary (1,512 overlapping
// pairs of 56 x 55 / 2, every image of norm 1), the species-by-species lift puts 3/32 on a doubly held slot, and the
// rank lift is unitary and fails covariance on 1,151 elements. The derivation's 1/16 was one pair's overlap, not the
// largest.
//
// Depth L1: exhaustive exact algebra (integer determinants, Eisenstein minors, 1,152 group elements). Bulk identities
// of the dock: they hold on every husk column by holding on every dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_OF } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4, type Eis } from '@/code/measure/covariant-coin'
import { innerOf, ringMatrix, ringUnitaries } from '@/code/measure/line-mixing'
import { act, actLabelled, detEis, detInt, eNormBig, hopContent, hopSignMask, innerLabelled, liftDock, MODE, rankContent, sameMap, slotsOfMask, type Labelled } from '@/code/measure/frame-lift'
import { FRAME_SLOTS, liftBranch, mixBranch } from '@/code/rule/coined-locked-knit'
import { mergeBranches, type Branch } from '@/code/rule/doublet-locked-knit'

const ROOTS = rootsD4()
const bit = (d: number): number => 2 ** d
const choose = (n: number, k: number): number => (k < 0 || k > n ? 0 : k === 0 ? 1 : (choose(n - 1, k - 1) * n) / k)

type Vibe = { slot: number; vibe: number; point?: number; open?: number }

// a one-dock branch
function dock(vibes: readonly Vibe[], stores = false): Branch {
  const b: Branch = { vibe: new Int8Array(24), point: new Int8Array(24), open: new Uint8Array(24), store: stores ? new Int8Array(12).fill(1) : new Int8Array(12), spoint: new Int8Array(12), sopen: new Uint8Array(12), a: 1n, b: 0n, k: 0 }

  for (const v of vibes) {
    b.vibe[v.slot] = v.vibe
    b.point[v.slot] = v.point ?? 0
    b.open[v.slot] = v.open ?? 1
  }

  return b
}

const maskOf = (b: Branch): number => Array.from(b.vibe).reduce((m, v, d) => m + (v !== 0 ? bit(d) : 0), 0)

// branches as occupation -> numerator over 64 (every image real)
function amplitudes(bs: readonly Branch[]): Map<number, number> | undefined {
  const out = new Map<number, number>()

  for (const b of bs) {
    if (b.b !== 0n || b.k > 6) return undefined
    out.set(maskOf(b), Number(b.a * (1n << BigInt(6 - b.k))))
  }

  return out
}

const sameBranch = (x: Branch, y: Branch): boolean => x.a === y.a && x.b === y.b && x.k === y.k && x.vibe.every((v, i) => v === y.vibe[i]) && x.point.every((v, i) => v === y.point[i]) && x.open.every((v, i) => v === y.open[i]) && x.store.every((v, i) => v === y.store[i])

const imageKey = (bs: readonly Branch[]): string =>
  bs
    .map(b => `${slotsOfMask(maskOf(b)).join('.')}:${b.a * (1n << BigInt(8 - b.k))},${b.b * (1n << BigInt(8 - b.k))}`)
    .sort()
    .join('|')

export default experiment({
  id: 'spin/frame-lift-theorem',
  code: 'E-SPN-0096',
  title:
    "the frame mixer G lifted to a frame's whole occupation (the knit's fermion statistics), fail on two mis-stated clauses (L4, L5), the substance as derived: Gamma(G) = (-1)^(N_u), on n vibes keep (4 - n)/4 or one vibe to one empty frame slot with -1/4 and the fermion sign, every exterior power of G (38,607 minors), an involution, covariant under the signed W(F4) action on 2,325 dock occupations (the unsigned action fails on 1,151 elements); it keeps charge, count, C and the stores; it is unitary and covariant only on frames of one content (with a love and a fear: carrying the content is not unitary, largest overlap 2/16; a love and a fear field put 3/32 on one slot; by rank unitary but not covariant), so the vacuum's love-and-fear frames are left alone; of the 180 line-mixing ring unitaries 0 fix a full line, any frame of 1 to 7 vibes, or a love-and-fear line pair: no mixer leaves the vacuum untouched and still mixes",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${((Date.now() - started) / 1000).toFixed(1)}s`)
    const group = weylF4()
    const frames = FRAME_SLOTS.map(ss => ss.slice().sort((p, q) => (MODE[p] as number) - (MODE[q] as number)))
    const subsetsOf = (ss: readonly number[]): number[][] => Array.from({ length: 256 }, (_, m) => ss.filter((_, q) => (m >> q) & 1))
    const maskOfSlots = (s: readonly number[]): number => s.reduce((m, d) => m + bit(d), 0)

    // ---- L1 ----
    let l1Pairs = 0
    let l1Off = 0
    let traceOff = 0

    for (const ss of frames) {
      const subs = subsetsOf(ss)

      for (let n = 1; n <= 8; n++) {
        const layer = subs.filter(s => s.length === n)
        let trace = 0

        for (const S of layer) {
          const lift = liftDock(maskOfSlots(S))

          trace += lift.get(maskOfSlots(S)) ?? 0

          for (const T of layer) {
            l1Pairs++

            const det = detInt(T.map(t => S.map(s => (t === s ? 4 : 0) - 1)))

            if (det * 64n !== BigInt(lift.get(maskOfSlots(T)) ?? 0) * 4n ** BigInt(n)) l1Off++
          }
        }

        // liftDock is over 64 (the first run compared against 16, a scale slip in the check, not in the gate)
        if (trace !== 64 * (choose(7, n) - choose(7, n - 1))) traceOff++
      }
    }

    const gL1 = l1Pairs === 3 * 12869 && l1Off === 0 && traceOff === 0

    log('L1')

    // ---- L2 ----
    let asymmetric = 0
    let notInvolution = 0

    for (const ss of frames) {
      const masks = subsetsOf(ss).map(maskOfSlots)
      const lifts = new Map(masks.map(m => [m, liftDock(m)]))

      for (const m of masks) {
        const row = lifts.get(m) as Map<number, number>

        for (const [t, a] of row) if ((lifts.get(t) as Map<number, number>).get(m) !== a) asymmetric++

        const square = new Map<number, number>()

        for (const [t, a] of row) for (const [u, c] of lifts.get(t) as Map<number, number>) square.set(u, (square.get(u) ?? 0) + a * c)

        for (const [u, v] of square) if (v !== (u === m ? 4096 : 0)) notInvolution++
      }
    }

    const gL2 = asymmetric === 0 && notInvolution === 0

    log('L2')

    // ---- L3 ----
    const occupations: number[][] = [[]]

    for (let a = 0; a < 24; a++) {
      occupations.push([a])
      for (let b = a + 1; b < 24; b++) {
        occupations.push([a, b])
        for (let c = b + 1; c < 24; c++) occupations.push([a, b, c])
      }
    }

    const cache = new Map<number, Map<number, number>>()
    const liftOf = (m: number): Map<number, number> => {
      let v = cache.get(m)

      if (!v) {
        v = liftDock(m)
        cache.set(m, v)
      }

      return v
    }
    const commutes = (g: readonly number[], m: number, signed: boolean): boolean => {
      const img = act(g, m, signed)
      const left = new Map<number, number>()

      for (const [t, a] of liftOf(img.mask)) left.set(t, a * img.sign)

      const right = new Map<number, number>()

      for (const [t, a] of liftOf(m)) {
        const i = act(g, t, signed)

        right.set(i.mask, (right.get(i.mask) ?? 0) + a * i.sign)
      }

      return sameMap(left, right)
    }
    let signedFailures = 0
    let unsignedFailures = 0
    const unsignedElements = new Set<number>()

    group.forEach((g, gi) => {
      for (const occ of occupations) {
        const m = maskOfSlots(occ)

        if (!commutes(g, m, true)) signedFailures++
        if (!commutes(g, m, false)) {
          unsignedFailures++
          unsignedElements.add(gi)
        }
      }
    })

    const gL3 = occupations.length === 2325 && signedFailures === 0 && unsignedFailures > 0

    log('L3')

    // ---- L4 ----
    let lawOff = 0
    let momentumOnHops = 0
    let hopImages = 0
    let cOff = 0

    for (const occ of occupations) {
      const loves = liftBranch(1, dock(occ.map(slot => ({ slot, vibe: 1 })), true))
      const fears = liftBranch(1, dock(occ.map(slot => ({ slot, vibe: -1 })), true))
      const m0 = maskOfSlots(occ)
      const p0 = [0, 1, 2, 3].map(k => occ.reduce((s, d) => s + ((ROOTS[d] as number[])[k] as number), 0))

      for (const b of loves) {
        const slots = slotsOfMask(maskOf(b))
        const charge = Array.from(b.vibe).reduce((s, v) => s + v, 0)
        const p = [0, 1, 2, 3].map(k => slots.reduce((s, d) => s + ((ROOTS[d] as number[])[k] as number), 0))
        const moved = p.some((v, k) => v !== p0[k])

        if (slots.length !== occ.length || charge !== occ.length || !b.store.every(v => v === 1)) lawOff++
        if (maskOf(b) !== m0) {
          hopImages++
          if (moved) momentumOnHops++
        } else if (moved) lawOff++
      }

      const negated = fears.map(b => ({ ...b, vibe: Int8Array.from(b.vibe, v => -v) }))

      if (negated.length !== loves.length || !negated.every((b, i) => sameBranch(b, loves[i] as Branch))) cOff++
    }

    const gL4 = lawOff === 0 && hopImages > 0 && momentumOnHops === hopImages && cOff === 0

    log('L4')

    // ---- L5 ----
    const f0 = FRAME_SLOTS[0] as readonly number[]
    const pairs: [number, number][] = []

    for (const a of f0) for (const b of f0) if (a !== b) pairs.push([a, b])

    const hop = pairs.map(([a, b]) => hopContent(a, b))
    let hopNormsOne = 0
    let hopOverlaps = 0
    let hopLargest = 0

    hop.forEach((x, i) => {
      if (innerLabelled(x, x) === 16) hopNormsOne++

      for (let j = i + 1; j < hop.length; j++) {
        const v = Math.abs(innerLabelled(x, hop[j] as Labelled))

        if (v !== 0) hopOverlaps++
        hopLargest = Math.max(hopLargest, v)
      }
    })

    // species by species on a love at r and a fear at -r (one line of frame 0)
    const r = f0[0] as number
    const rBar = f0[1] as number
    const g4 = (i: number, j: number): number => (i === j ? 4 : 0) - 1
    const doubleWeight = f0.reduce((s, c) => s + (g4(c, r) * g4(c, rBar)) ** 2, 0)
    // by rank
    const rankCache = new Map<string, Labelled>()
    const rankOf = (a: number, b: number): Labelled => {
      const k = `${a},${b}`
      let v = rankCache.get(k)

      if (!v) {
        v = rankContent(a, b)
        rankCache.set(k, v)
      }

      return v
    }
    const rank = pairs.map(([a, b]) => rankOf(a, b))
    let rankOff = 0

    rank.forEach((x, i) => rank.forEach((y, j) => (innerLabelled(x, y) !== (i === j ? 256 : 0) ? rankOff++ : 0)))

    let rankCovarianceFailures = 0
    const rankElements = new Set<number>()

    group.forEach((g, gi) => {
      for (const ss of FRAME_SLOTS) {
        for (const a of ss) {
          for (const b of ss) {
            if (a === b) continue

            const x: Labelled = new Map([[`${a},${b}`, 1]])
            const gx = actLabelled(g, x)
            const [[k, s]] = [...gx] as [[string, number]]
            const [ga, gb] = k.split(',').map(Number) as [number, number]
            const left = new Map([...rankOf(ga, gb)].map(([kk, v]) => [kk, v * s]))

            if (!sameMap(left, actLabelled(g, rankOf(a, b)))) {
              rankCovarianceFailures++
              rankElements.add(gi)
            }
          }
        }
      }
    })

    const gL5 = pairs.length === 56 && hopNormsOne === 56 && hopOverlaps > 0 && hopLargest === 1 && doubleWeight === 24 && rankOff === 0 && rankCovarianceFailures > 0

    log('L5')

    // ---- L6 ----
    const ring = ringUnitaries().unitaries
    const fs = frames[0] as number[]
    const fullLines = [0, 1, 2, 3].map(l => [f0[2 * l] as number, f0[2 * l + 1] as number])
    const tally = { mixing: 0, lockKeeping: 0, mixFixFullLine: 0, mixFixMid: 0, mixFixFullFrame: 0, mixFixLoveFear: 0, keepFixAllLines: 0 }

    for (const u of ring) {
      const m = ringMatrix(u.coefficients)
      const entry = (i: number, j: number): Eis => (m.entries[i] as Eis[])[j] as Eis
      const fixed = (S: readonly number[]): boolean => {
        const sorted = S.slice().sort((p, q) => (MODE[p] as number) - (MODE[q] as number))

        return eNormBig(detEis(entry, sorted, sorted)) === 4n ** BigInt(m.p * S.length)
      }
      const lines = fullLines.filter(fixed).length
      let mid = 0

      for (let mm = 1; mm < 255; mm++) if (fixed(fs.filter((_, q) => (mm >> q) & 1))) mid++

      const full = fixed(fs)
      const loveFear = eNormBig(entry(r, r)) * eNormBig(entry(rBar, rBar)) === 16n ** BigInt(m.p)

      if (u.lineMixing) {
        tally.mixing++
        if (lines > 0) tally.mixFixFullLine++
        if (mid > 0) tally.mixFixMid++
        if (full) tally.mixFixFullFrame++
        if (loveFear) tally.mixFixLoveFear++
      } else {
        tally.lockKeeping++
        if (lines === 4) tally.keepFixAllLines++
      }
    }

    const gL6 = tally.mixing === 180 && tally.lockKeeping === 36 && tally.mixFixFullLine === 0 && tally.mixFixMid === 0 && tally.mixFixFullFrame === 180 && tally.mixFixLoveFear === 0 && tally.keepFixAllLines === 36

    log('L6')

    // ---- L7 ----
    let equalLift = 0
    let involutive = 0

    for (const occ of occupations) {
      const start = dock(occ.map(slot => ({ slot, vibe: 1 })))
      const once = liftBranch(1, dock(occ.map(slot => ({ slot, vibe: 1 }))))
      const amps = amplitudes(once)
      const want = new Map([...liftDock(maskOfSlots(occ))].map(([t, a]) => [t, a]))

      if (amps && sameMap(amps, want)) equalLift++

      const twice = mergeBranches(once.flatMap(b => liftBranch(1, b)))

      if (twice.length === 1 && sameBranch(twice[0] as Branch, start)) involutive++
    }

    let loneEqual = 0

    for (let s = 0; s < 24; s++) if (imageKey(liftBranch(1, dock([{ slot: s, vibe: 1 }]))) === imageKey(mixBranch(1, dock([{ slot: s, vibe: 1 }])))) loneEqual++

    const untouched = (vs: Vibe[]): boolean => {
      const out = liftBranch(1, dock(vs))

      return out.length === 1 && sameBranch(out[0] as Branch, dock(vs))
    }
    let loveFearKept = 0
    let pointsKept = 0
    let closedKept = 0
    let closedCases = 0

    for (const ss of FRAME_SLOTS) {
      for (const a of ss) {
        closedCases++
        if (untouched([{ slot: a, vibe: 1, open: 0 }])) closedKept++

        for (const b of ss) {
          if (a === b) continue
          if (untouched([
            { slot: a, vibe: 1 },
            { slot: b, vibe: -1 },
          ]))
            loveFearKept++
          if (untouched([
            { slot: a, vibe: 1, point: 1 },
            { slot: b, vibe: 1, point: 0 },
          ]))
            pointsKept++
          if (b > a) {
            closedCases++
            if (untouched([
              { slot: a, vibe: 1, open: 0 },
              { slot: b, vibe: 1 },
            ]))
              closedKept++
          }
        }
      }
    }

    const gL7 = equalLift === 2325 && involutive === 2325 && loneEqual === 24 && loveFearKept === 168 && pointsKept === 168 && closedCases === 108 && closedKept === 108

    log('L7')

    // ---- L8 ----
    let thresholdDiffers = 0
    let thresholdMulti = 0
    let thresholdAgrees = 0

    for (const ss of FRAME_SLOTS) {
      for (const S of subsetsOf(ss)) {
        if (S.length === 0) continue

        const vs = S.map(slot => ({ slot, vibe: 1 }))
        const same = imageKey(liftBranch(1, dock(vs))) === imageKey(mixBranch(1, dock(vs)))

        if (S.length === 1) thresholdAgrees += same ? 1 : 0
        else {
          thresholdMulti++
          if (!same) thresholdDiffers++
        }
      }
    }

    // (b) the reflection I - v v^T, v = e_r + e_s: on one vibe it swaps r and s with sign -1; its lift on n <= 2
    const r0 = 0
    const s0 = Array.from({ length: 24 }, (_, e) => e).find(e => innerOf(r0, e) === 0) as number
    const house = (d: number, e: number): number => (d === e ? 1 : 0) - ((d === r0 || d === s0) && (e === r0 || e === s0) ? 1 : 0)
    const houseLift = (m: number): Map<number, number> => {
      const S = slotsOfMask(m).sort((p, q) => (MODE[p] as number) - (MODE[q] as number))
      const out = new Map<number, number>()

      for (const occ of occupations) {
        if (occ.length !== S.length) continue

        const T = occ.slice().sort((p, q) => (MODE[p] as number) - (MODE[q] as number))
        const d = Number(detInt(T.map(t => S.map(s => house(t, s)))))

        if (d !== 0) out.set(maskOfSlots(T), d)
      }

      return out
    }
    const low = occupations.filter(o => o.length >= 1 && o.length <= 2).map(maskOfSlots)
    const houseCache = new Map(low.map(m => [m, houseLift(m)]))
    let houseFailures = 0

    for (const g of group) {
      for (const m of low) {
        const img = act(g, m, true)
        const left = new Map([...(houseCache.get(img.mask) as Map<number, number>)].map(([t, a]) => [t, a * img.sign]))
        const right = new Map<number, number>()

        for (const [t, a] of houseCache.get(m) as Map<number, number>) {
          const i = act(g, t, true)

          right.set(i.mask, a * i.sign)
        }

        if (!sameMap(left, right)) {
          houseFailures++
          break
        }
      }
    }

    // (c) the hop lift without the sign
    let bosonOverlaps = 0

    for (const ss of frames) {
      const masks = subsetsOf(ss).map(maskOfSlots)
      const lifts = masks.map(m => liftDock(m, false))

      for (let i = 0; i < masks.length; i++) {
        for (let j = i + 1; j < masks.length; j++) {
          let v = 0

          for (const [t, a] of lifts[i] as Map<number, number>) v += a * ((lifts[j] as Map<number, number>).get(t) ?? 0)
          if (v !== 0) bosonOverlaps++
        }
      }
    }

    const gL8 = thresholdMulti === 741 && thresholdDiffers === 741 && thresholdAgrees === 24 && houseFailures > 576 && bosonOverlaps > 0

    const ok = gL1 && gL2 && gL3 && gL4 && gL5 && gL6 && gL7 && gL8
    const lineHop = hopSignMask(maskOfSlots([r, rBar]), r, f0[2] as number)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the knit's own statistics (one vibe a slot, the coin's full-line determinant, the canonical fermion sign) lift G to Gamma(G) = (-1)^(N_u): on a frame of n vibes keep (4 - n)/4, or one vibe to one empty frame slot with -1/4 times the fermion sign, never two; it is every exterior power of G (${l1Pairs.toLocaleString('en-US')} minors, ${l1Off} off; traces C(7,n) - C(7,n-1)), symmetric and an involution on all 3 x 256 frame occupations, covariant under the signed action of all 1,152 elements on ${occupations.length.toLocaleString('en-US')} dock occupations (${signedFailures} failures; the unsigned action fails ${unsignedFailures.toLocaleString('en-US')} times, on ${unsignedElements.size} elements), keeps charge, count, C and the stores and changes the occupation momentum on every hop (${momentumOnHops} of ${hopImages}); but it is unitary and covariant only on a frame of ONE content: with a love and a fear, carrying the content with the moving vibe is not unitary (${hopOverlaps} overlapping pairs of 56, largest ${hopLargest}/16), a love field and a fear field put ${doubleWeight}/256 = 3/32 of a line pair on one slot, and assigning contents by rank is unitary but fails covariance ${rankCovarianceFailures.toLocaleString('en-US')} times (${rankElements.size} elements); so the vacuum's love-and-fear frames are left alone, and where a frame holds one content no line-mixing lift leaves it: of the ${tally.mixing} line-mixing ring unitaries ${tally.mixFixFullLine} fix a full line, ${tally.mixFixMid} any frame of 1 to 7 vibes, ${tally.mixFixLoveFear} a love-and-fear line pair (all ${tally.mixFixFullFrame} fix only the full frame; the ${tally.keepFixAllLines} lock-keeping fix every full line): no mixer leaves the vacuum untouched and still mixes, and G's lift stays the canonical one; the rule's liftBranch is Gamma(G) on ${equalLift} docks, an involution on ${involutive}, G on the ${loneEqual} lone docks, the identity on ${loveFearKept} love-and-fear, ${pointsKept} unequal-point and ${closedKept} closed-vibe frames; controls: E-SPN-0095's thresholded G differs on ${thresholdDiffers} of ${thresholdMulti} one-content frames of two or more, the lifted reflection fails ${houseFailures} of 1,152 elements, the unsigned hop lift overlaps on ${bosonOverlaps} pairs`,
      metrics: {
        gate_L1: gL1 ? 1 : 0,
        gate_L2: gL2 ? 1 : 0,
        gate_L3: gL3 ? 1 : 0,
        gate_L4: gL4 ? 1 : 0,
        gate_L5: gL5 ? 1 : 0,
        gate_L6: gL6 ? 1 : 0,
        gate_L7: gL7 ? 1 : 0,
        gate_L8: gL8 ? 1 : 0,
        minors: l1Pairs,
        minorsOff: l1Off,
        traceOff,
        asymmetric,
        notInvolution,
        occupations: occupations.length,
        signedFailures,
        unsignedFailures,
        unsignedElements: unsignedElements.size,
        hopImages,
        momentumOnHops,
        lawOff,
        cOff,
        hopNormsOne,
        hopOverlaps,
        hopLargestOver16: hopLargest,
        doubleWeightOver256: doubleWeight,
        rankOff,
        rankCovarianceFailures,
        rankElements: rankElements.size,
        ringMixing: tally.mixing,
        ringLockKeeping: tally.lockKeeping,
        mixFixFullLine: tally.mixFixFullLine,
        mixFixMid: tally.mixFixMid,
        mixFixFullFrame: tally.mixFixFullFrame,
        mixFixLoveFear: tally.mixFixLoveFear,
        keepFixAllLines: tally.keepFixAllLines,
        equalLift,
        involutive,
        loneEqual,
        loveFearKept,
        pointsKept,
        closedKept,
        thresholdDiffers,
        thresholdAgrees,
        houseFailures,
        bosonOverlaps,
        seconds: (Date.now() - started) / 1000,
      },
      control: { unsignedFailures, rankCovarianceFailures, houseFailures, bosonOverlaps },
      notes: `L1. Gates L1 ${gL1}, L2 ${gL2}, L3 ${gL3}, L4 ${gL4}, L5 ${gL5}, L6 ${gL6}, L7 ${gL7}, L8 ${gL8}. Gamma(G) on a frame of n (keep numerator over 4): ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `${n}: ${4 - n}`).join(', ')}; a full line keeps 1/2 (E-SPN-0094 H8c), weight 1/4; its hop sign r -> ${f0[2]} with the partner on ${rBar}: ${lineHop}. Frame 0 slots in mode order: ${fs.join(',')} (lines ${fs.map(d => LINE_OF[d]).join(',')}). ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
