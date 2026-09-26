// The lightest bound charge-one state with the string held at its ENDS (code/rule/reel-string-line, E-SPN-0081), a
// STAND-IN on locked tokens on one husk line: E-SPN-0077's question asked again with nothing held at a port and
// nothing read farther than one link.
//
// E-SPN-0077 found, with the store at one port (a husk-nonlocal read across up to 2D docks): three locked loves are
// the lightest bound charge-one state, natural spin one half, N = 3, 2 pi sign -1, compact, travelling. E-SPN-0081
// moved the store onto the charges: each token's own column is its reel, the tokens crossing a link pay its change
// of l in equal half-links, and a group that cannot pay bounces. The string's range is now floor(n D / 2), set by
// the columns under the ends. The cost (the light's drift, pi / N per link per beat, N = 2D + 1) and the meetings
// are E-SPN-0077's. The like meeting's swap exchanges role and reel together (the reel is the vibe's own column),
// which is omega per like pair on every exchange-antisymmetric state, as in E-SPN-0077.
//
// WHAT CAN CHANGE. The reels make the ends distinguishable by what they have paid: a travelling cluster drains its
// leading end's reel and fills its trailing end's, so the pair's centre is tied to the reels' difference between
// crossings (the yo-yo). Whether the cluster still travels, and whether its lightest level is still the natural
// spin one half, is a question of dynamics.
//
// PREDICTIONS, written before this file ran. A disclosed mechanics probe (tmp/reel-probe1.ts) checked the Bloch
// sizes (dimension 28, 236, 944 at D = 1, 2, 3), that the antisymmetric subspace is closed (leak 0, after the
// swap was made to carry the reels, see E-SPN-0081) and the eigensolver's time; it read no level. D = 4 (about
// 3,500 dimensions) is beyond the dense solver on this machine and is not run.
// T1 The line sector is closed off: on the 27-label space (D = 1, 2; K = 0 and 0.7) the beat moves no weight from
//    the doublet-only states onto any state with a token on the line (below 1e-14): N = 3, 2 pi sign -1.
// T2 Spin one half: at D = 1, 2, 3 the lightest three-love level (E-SPN-0076's definition, unchanged) holds at
//    least 0.9 of its weight in role [2,1], the natural doublet.
// T3 It travels: tracked by overlap from K = 0 to pi in 12 steps at D = 2, 3, the lightest level's band is at least
//    0.01 wide and its group velocity reaches 0.02 docks per beat (consecutive overlaps at least 0.5).
// T4 The operator is the rule: one beat of the ring runner (code/measure/reel-run) on a momentum state of ring 16
//    (K = 3 pi / 8, a Weyl-filled relative state) equals the Bloch operator's image to 1e-12, for three loves (D = 2)
//    and the love-fear pair (D = 3), with no weight outside.
// T5 The start family: with each of the 17 link starts' color fields, the costed three loves (ring 12, D = 2,
//    5 beats) and pair (ring 24, D = 2, 10 beats) keep the no-field positions to 1e-12.
// T6 (4, 1) is not held as one: three loves at a dock and a love-fear pair s docks away carry no string for every
//    s = 1 .. 20, while four loves at a dock and a fear s away carry a string of s.
//
// Gates, fixed with the predictions: T1 .. T6, E-SPN-0077's own. Status pass if all hold.
// REPORTED, not gated: the lightest level's unwrapped energy, <l>, its weight at the capacity, its reel use,
// particle share and meeting energy; and, as a paired control, E-SPN-0077's port-store readings at the same D.
// HUSK: one husk line, every number a husk number; the reels are the bulk columns under the tokens' slots.
//
// Depth L2: a constructed stand-in. Stand-in (b) of E-SPN-0077 (the store at a port) is removed; stand-in (a)
// (locked tokens, not the knit's own vibes) stays, reduced by E-SPN-0081 to the one covariant rule that could make
// the knit's vibe a locked token.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  maxSpan,
  reelBlochColumn,
  reelBlochSpace,
  reelContactEnergy,
  reelLightest,
  reelOverlap,
  reelQuartetShare,
  reelSpectrumAt,
  reelStringMoments,
  reelUse,
  type Level,
  type ReelBlochSpec,
} from '@/code/measure/reel-string-bloch'
import { reelRun, type ReelRun } from '@/code/measure/reel-run'
import { antisymmetrizedReels, type ReelStart } from '@/code/measure/reel-exact'
import { lightestUnwrapped, lineString, quartetShare, spectrumAt, stringMoments, type BlochSpec } from '@/code/measure/flux-store-bloch'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'
import { type M3 } from '@/code/measure/token-pair-run'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'
import { type Vibe } from '@/code/rule/locked-token-line'

const threeSpec = (D: number, labels: 2 | 3 = 2): ReelBlochSpec => {
  const N = 2 * D + 1

  return { kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', depth: D, cost: N, root: 2 * N * N, labels }
}

const pairSpec = (D: number): ReelBlochSpec => {
  const N = 2 * D + 1

  return { kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', depth: D, cost: N, root: 2 * N * N, labels: 2 }
}

const gridOf = (s: ReelBlochSpec): number => 2 * maxSpan(s) + 6

// T1
function lineLeak(D: number, K: number): { leak: number; columns: number } {
  const b = reelBlochSpace(threeSpec(D, 3))
  let leak = 0
  let columns = 0
  const hasLine = (lab: number): boolean => [Math.floor(lab / 9), Math.floor(lab / 3) % 3, lab % 3].includes(2)

  for (let col = 0; col < b.size; col++) {
    if (hasLine(col % b.labelCount)) continue

    columns++

    const img = reelBlochColumn(b, K, col)
    let w = 0

    img.idx.forEach((i, m) => {
      if (hasLine(i % b.labelCount)) w += img.re[m]! ** 2 + img.im[m]! ** 2
    })
    leak = Math.max(leak, w)
  }

  return { leak, columns }
}

// T4: one beat of the ring runner against the Bloch operator on a momentum state
function ringAgreement(spec: ReelBlochSpec, ring: number, m: number): { gap: number; outside: number } {
  const b = reelBlochSpace(spec)
  const K = (2 * Math.PI * m) / ring
  const n = spec.kinds.length
  const phi = { re: new Float64Array(b.size), im: new Float64Array(b.size) }

  for (let i = 0; i < b.size; i++) {
    phi.re[i] = weyl(i + 1, GOLDEN) - 0.5
    phi.im[i] = weyl(i + 1, SILVER) - 0.5
  }

  const run: ReelRun = reelRun({ ring, kinds: spec.kinds, depth: spec.depth, cost: spec.cost, root: spec.root })
  const R = 3 ** n
  const ringIndex = (x0: number, i: number): number => {
    const c = Math.floor(i / b.labelCount)
    const d = b.positions[c]!
    const x = d.map(v => (((x0 + v) % ring) + ring) % ring)
    const cc = run.indexOf(x, b.reels[c]!)

    if (cc < 0) throw new Error('ring agreement: a Bloch configuration is not on the ring')

    let lab = 0
    let code = i % b.labelCount

    const digits: number[] = []

    for (let t = n - 1; t >= 0; t--) {
      digits[t] = code % b.q
      code = Math.floor(code / b.q)
    }

    for (let t = 0; t < n; t++) lab = lab * 3 + digits[t]!

    return cc * R + lab
  }

  for (let x0 = 0; x0 < ring; x0++) {
    const cs = Math.cos(K * x0)
    const sn = Math.sin(K * x0)

    for (let i = 0; i < b.size; i++) {
      const at = ringIndex(x0, i)

      run.re[at] = run.re[at]! + phi.re[i]! * cs - phi.im[i]! * sn
      run.im[at] = run.im[at]! + phi.re[i]! * sn + phi.im[i]! * cs
    }
  }

  run.beat()

  const img = { re: new Float64Array(b.size), im: new Float64Array(b.size) }

  for (let col = 0; col < b.size; col++) {
    const c = reelBlochColumn(b, K, col)

    c.idx.forEach((i, k) => {
      img.re[i] = img.re[i]! + c.re[k]! * phi.re[col]! - c.im[k]! * phi.im[col]!
      img.im[i] = img.im[i]! + c.re[k]! * phi.im[col]! + c.im[k]! * phi.re[col]!
    })
  }

  let gap = 0
  const covered = new Uint8Array(run.re.length)

  for (let x0 = 0; x0 < ring; x0++) {
    const cs = Math.cos(K * x0)
    const sn = Math.sin(K * x0)

    for (let i = 0; i < b.size; i++) {
      const at = ringIndex(x0, i)
      const wr = img.re[i]! * cs - img.im[i]! * sn
      const wi = img.re[i]! * sn + img.im[i]! * cs

      covered[at] = 1
      gap = Math.max(gap, Math.hypot(wr - run.re[at]!, wi - run.im[at]!))
    }
  }

  let outside = 0

  for (let a = 0; a < run.re.length; a++) if (!covered[a]) outside += run.re[a]! ** 2 + run.im[a]! ** 2

  return { gap, outside }
}

// T5: the color field of each start family member
function unitaryOf(k: number): M3 {
  const g = cliffordTable().group[k]!
  const vals = g.num.map(x => eisValue(x, 3 ** g.den3))
  let n2 = 0

  for (let c = 0; c < 3; c++) n2 += (vals[3 * c]![0] ?? 0) ** 2 + (vals[3 * c]![1] ?? 0) ** 2

  const f = 1 / Math.sqrt(n2)

  return { re: Float64Array.from(vals, v => v[0] * f), im: Float64Array.from(vals, v => v[1] * f) }
}

type LightRow = { D: number; dim: number; energy: number; raw: number; mean: number; atCapacity: number; spinHalf: number; even: number; contact: number; gapNext: number; reelMean: number; reelEdge: number; residual: number; level: Level }

function lightestThree(D: number): LightRow {
  const spec = threeSpec(D)
  const r = reelSpectrumAt(spec, 0)
  const lp = reelLightest(r.bloch, r.all, gridOf(spec))
  const S = maxSpan(spec)
  let cap = 0
  let tot = 0

  for (let i = 0; i < r.bloch.size; i++) {
    const p = lp.level.vector.re[i]! ** 2 + lp.level.vector.im[i]! ** 2

    tot += p

    if (r.bloch.strings[Math.floor(i / r.bloch.labelCount)] === S) cap += p
  }

  const use = reelUse(r.bloch, lp.level.vector)

  return {
    D,
    dim: r.dim,
    energy: lp.unwrapped,
    raw: lp.level.energy,
    mean: reelStringMoments(r.bloch, lp.level.vector).mean,
    atCapacity: cap / tot,
    spinHalf: 1 - reelQuartetShare(r.bloch, lp.level.vector),
    even: lp.reading.even,
    contact: reelContactEnergy(r.bloch, lp.level.vector),
    gapNext: lp.nextUnwrapped - lp.unwrapped,
    reelMean: use.meanAbs,
    reelEdge: use.atEdge,
    residual: r.residual,
    level: lp.level,
  }
}

function dispersion(D: number, start: Level): { bandwidth: number; velocity: number; minOverlap: number; energies: number[] } {
  const steps = 12
  const energies = [start.energy]
  let prev = start
  let minOverlap = 1
  let velocity = 0

  for (let s = 1; s <= steps; s++) {
    const K = (Math.PI * s) / steps
    const r = reelSpectrumAt(threeSpec(D), K)
    let best = r.all[0]!
    let bestOverlap = -1

    for (const lv of r.all) {
      const o = reelOverlap(prev.vector, lv.vector)

      if (o > bestOverlap) {
        bestOverlap = o
        best = lv
      }
    }

    let e = best.energy

    while (e - energies[s - 1]! > Math.PI) e -= 2 * Math.PI
    while (e - energies[s - 1]! < -Math.PI) e += 2 * Math.PI

    velocity = Math.max(velocity, Math.abs(e - energies[s - 1]!) / (Math.PI / steps))
    energies.push(e)
    minOverlap = Math.min(minOverlap, bestOverlap)
    prev = best
  }

  return { bandwidth: Math.max(...energies) - Math.min(...energies), velocity, minOverlap, energies }
}

// the paired control: E-SPN-0077's port store at the same depth
function portLightest(D: number): { spinHalf: number; mean: number; energy: number } {
  const N = 2 * D + 1
  const spec: BlochSpec = { kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', depth: D, cost: N, root: 2 * N * N, labels: 2 }
  const r = spectrumAt(spec, 0)
  const lp = lightestUnwrapped(r.bloch, r.all, 4 * D + 6)

  return { spinHalf: 1 - quartetShare(r.bloch, lp.level.vector), mean: stringMoments(r.bloch, lp.level.vector).mean, energy: lp.unwrapped }
}

export default experiment({
  id: 'spin/lightest-charge-one-at-ends',
  code: 'E-SPN-0082',
  title: "the lightest bound charge-one state with the string held at its ends, a STAND-IN on locked tokens on a husk line: with each token's own column as its reel and nothing read past one link, three loves stay the lightest charge-one state, the line sector stays closed (N = 3, 2 pi sign -1), and the lightest level is read for spin, size and travel against E-SPN-0077's gates over the 17-start family",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- T1 ----
    const leaks = [1, 2].flatMap(D => [0, 0.7].map(K => ({ D, K, ...lineLeak(D, K) })))
    const t1 = leaks.every(l => l.leak < 1e-14 && l.columns > 0)

    log('t1')

    // ---- T2 ----
    const rows = [1, 2, 3].map(D => {
      const row = lightestThree(D)

      log(`t2 D ${D}`)

      return row
    })
    const t2 = rows.every(r => r.spinHalf >= 0.9)

    // ---- T3 ----
    const bands = [2, 3].map(D => {
      const band = { D, ...dispersion(D, rows.find(r => r.D === D)!.level) }

      log(`t3 D ${D}`)

      return band
    })
    const t3 = bands.every(b => b.bandwidth >= 0.01 && b.velocity >= 0.02 && b.minOverlap >= 0.5)

    // ---- T4 ----
    const agreeThree = ringAgreement(threeSpec(2), 16, 3)
    const agreePair = ringAgreement(pairSpec(3), 16, 3)
    const t4 = agreeThree.gap < 1e-12 && agreePair.gap < 1e-12 && agreeThree.outside < 1e-24 && agreePair.outside < 1e-24

    log('t4')

    // ---- T5 ----
    const moves = gridMoves()
    const table = cliffordTable()
    const unitaries = Array.from({ length: 216 }, (_, k) => unitaryOf(k))
    const cases: { L: number; kinds: Vibe[]; D: number; beats: number; start: ReelStart[] }[] = [
      { L: 12, kinds: ['love', 'love', 'love'], D: 2, beats: 5, start: antisymmetrizedReels({ x: [5, 5, 6], j: [0, 1, 0], r: [0, -1, -1] }) },
      { L: 24, kinds: ['love', 'fear'], D: 2, beats: 10, start: [{ x: [12, 12], j: [0, 1], r: [0, 0], amp: 1 }] },
    ]
    const ensemble = startFamily(16).map(member => {
      const linksOf = (L: number): M3[] => Array.from({ length: L }, (_, x) => unitaries[table.indexOf(phaseMove(moves.act[member.start(x, moves.act.length)] ?? []))] as M3)
      let gap = 0

      for (const c of cases) {
        const N = 2 * c.D + 1
        const make = (links?: M3[]): ReelRun => {
          const run = reelRun({ ring: c.L, kinds: c.kinds, depth: c.D, cost: N, root: 2 * N * N, links })

          run.place(c.start.map(e => ({ x: e.x, r: e.r, j: e.j, amp: [e.amp, 0] as [number, number] })))

          return run
        }
        const field = make(linksOf(c.L))
        const plain = make()

        for (let t = 0; t < c.beats; t++) {
          field.beat()
          plain.beat()

          const a = field.positions()
          const b = plain.positions()

          for (let i = 0; i < a.length; i++) gap = Math.max(gap, Math.abs(a[i]! - b[i]!))
        }
      }

      return { member: member.name, gap }
    })
    const t5 = ensemble.length === 17 && ensemble.every(e => e.gap < 1e-12)

    log('t5')

    // ---- T6 ----
    let t6 = true
    const split: number[] = []

    for (let s = 1; s <= 20; s++) {
      const apart = lineString([0, 0, 0, s, s], ['love', 'love', 'love', 'love', 'fear'])
      const held = lineString([0, 0, 0, 0, s], ['love', 'love', 'love', 'love', 'fear'])

      split.push(apart)

      if (apart !== 0 || held !== s) t6 = false
    }

    // ---- the paired control ----
    const port = [1, 2, 3].map(D => ({ D, ...portLightest(D) }))

    log('control')

    const ok = t1 && t2 && t3 && t4 && t5 && t6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with the string held at its ends (each token's own column its reel, nothing read past one link), four loves and a fear still part into three loves and a neutral pair at no string cost (0 at every separation 1 to 20), and the beat moves no weight onto the line (worst ${Math.max(...leaks.map(l => l.leak)).toExponential(1)}), so N = 3 and the 2 pi sign is -1; the lightest three-love level has role [2,1] share ${rows.map(r => r.spinHalf.toFixed(3)).join(', ')} at D = 1 to 3 (port store: ${port.map(p => p.spinHalf.toFixed(3)).join(', ')}), <l> ${rows.map(r => r.mean.toFixed(2)).join(', ')} against a capacity of ${rows.map(r => maxSpan(threeSpec(r.D))).join(', ')} (weight at the capacity ${rows.map(r => r.atCapacity.toFixed(3)).join(', ')}), unwrapped energy ${rows.map(r => r.energy.toFixed(3)).join(', ')}; its band is ${bands.map(b => b.bandwidth.toFixed(3)).join(', ')} wide with group velocity up to ${bands.map(b => b.velocity.toFixed(3)).join(', ')} docks per beat at D = 2, 3 (min overlap ${bands.map(b => b.minOverlap.toFixed(3)).join(', ')}); the Bloch operator is the ring rule (${agreeThree.gap.toExponential(1)}, ${agreePair.gap.toExponential(1)}), and over the 17 link starts the costed runs keep the no-field positions (worst ${Math.max(...ensemble.map(e => e.gap)).toExponential(1)})`,
      metrics: {
        gate_T1: t1 ? 1 : 0,
        gate_T2: t2 ? 1 : 0,
        gate_T3: t3 ? 1 : 0,
        gate_T4: t4 ? 1 : 0,
        gate_T5: t5 ? 1 : 0,
        gate_T6: t6 ? 1 : 0,
        lineLeakWorst: Math.max(...leaks.map(l => l.leak)),
        ...Object.fromEntries(
          rows.flatMap(r => [
            [`three_D${r.D}_energy`, r.energy],
            [`three_D${r.D}_rawEnergy`, r.raw],
            [`three_D${r.D}_meanString`, r.mean],
            [`three_D${r.D}_atCapacity`, r.atCapacity],
            [`three_D${r.D}_spinHalfShare`, r.spinHalf],
            [`three_D${r.D}_evenShare`, r.even],
            [`three_D${r.D}_meetingEnergy`, r.contact],
            [`three_D${r.D}_gapNext`, r.gapNext],
            [`three_D${r.D}_reelMeanAbs`, r.reelMean],
            [`three_D${r.D}_reelAtEdge`, r.reelEdge],
            [`three_D${r.D}_dim`, r.dim],
            [`three_D${r.D}_eigenResidual`, r.residual],
          ]),
        ),
        ...Object.fromEntries(bands.flatMap(b => [[`band_D${b.D}_width`, b.bandwidth], [`band_D${b.D}_velocity`, b.velocity], [`band_D${b.D}_minOverlap`, b.minOverlap]])),
        ringGapThree: agreeThree.gap,
        ringGapPair: agreePair.gap,
        ringOutsideThree: agreeThree.outside,
        ringOutsidePair: agreePair.outside,
        ensembleWorstGap: Math.max(...ensemble.map(e => e.gap)),
        ensembleMembers: ensemble.length,
        fourOneSplitString: Math.max(...split),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        ...Object.fromEntries(port.flatMap(p => [[`port_D${p.D}_spinHalfShare`, p.spinHalf], [`port_D${p.D}_meanString`, p.mean], [`port_D${p.D}_energy`, p.energy]])),
      },
      notes: `L2, a STAND-IN (locked tokens on one husk line; the store now on the charges, stand-in (b) removed). Gates T1 ${t1}, T2 ${t2}, T3 ${t3}, T4 ${t4}, T5 ${t5}, T6 ${t6}. Lightest three-love level by depth: ${rows.map(r => `D ${r.D} (dim ${r.dim}, capacity ${maxSpan(threeSpec(r.D))}): E ${r.energy.toFixed(5)} (raw ${r.raw.toFixed(5)}), <l> ${r.mean.toFixed(3)}, at capacity ${r.atCapacity.toFixed(3)}, spin one half ${r.spinHalf.toFixed(4)}, particle ${r.even.toFixed(3)}, meeting energy ${r.contact.toFixed(3)}, next +${r.gapNext.toFixed(4)}, mean |reel| ${r.reelMean.toFixed(3)}, weight with a reel at its edge ${r.reelEdge.toFixed(3)}, residual ${r.residual.toExponential(1)}`).join('; ')}. Bands (K = 0 to pi in 12 steps): ${bands.map(b => `D ${b.D}: ${b.energies.map(e => e.toFixed(3)).join(' ')} (min overlap ${b.minOverlap.toFixed(3)})`).join('; ')}. Port-store control (E-SPN-0077's rule, same D): ${port.map(p => `D ${p.D} spin one half ${p.spinHalf.toFixed(4)}, <l> ${p.mean.toFixed(3)}, E ${p.energy.toFixed(4)}`).join('; ')}. Line leak by (D, K): ${leaks.map(l => `(${l.D}, ${l.K}) ${l.leak.toExponential(1)} over ${l.columns} columns`).join(', ')}. Ring agreement: three loves ${agreeThree.gap.toExponential(1)} (outside ${agreeThree.outside.toExponential(1)}), pair ${agreePair.gap.toExponential(1)} (outside ${agreePair.outside.toExponential(1)}). Start members: ${ensemble.map(e => `${e.member} ${e.gap.toExponential(1)}`).join(', ')}. D = 4 not run (about 3,500 dimensions, beyond the dense solver in this machine's memory). What this is not: an electron of the knit. The tokens are locked stand-ins (E-SPN-0081: the knit's own vibes have classical positions, and the lock is the one covariant rule that would give them amplitudes); the line is one husk line, not the 3D husk (three tokens with their strings in 2D or 3D need the flux as a register on every link, beyond exact diagonalization here); and alpha stays a knob.`,
    })
  },
})
