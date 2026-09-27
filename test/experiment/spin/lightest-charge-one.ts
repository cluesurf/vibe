// The lightest bound charge-one state under the flux string, on LOCKED STAND-IN tokens: three loves held by the
// center string whose store is on the flux (E-SPN-0075) and whose cost is the light's drift (E-SPN-0076).
//
// E-SPN-0071 predicted: with every role locked into its doublet, every charge-one cluster is spinorial (a full turn
// is (-1)^N, N the doublet count) and the Pauli ground of a role-blind binding is the natural spin one half. The
// flux string is role-blind, but the locked walk is not (a token's doublet label is also its direction of copy), and
// three loves also meet each other through the fear beat (2U, omega on an exchange-antisymmetric pair). So whether
// the LIGHTEST level (defined in E-SPN-0076) is the natural spin one half is a question of dynamics, not of
// representation theory alone.
//
// WHICH CLUSTER. Charge one is n - m = 3 loves over fears. The center string holds a cluster only as a whole: a
// sub-cluster that is itself a center singlet carries no flux to the rest. Three loves have no singlet sub-cluster.
// Four loves and a fear do: three loves plus a love-fear pair, which the string lets part at no cost. So the
// lightest bound charge-one state the string makes is the three-love state, and (4, 1) is that state beside a
// neutral pair. Three loves hold no fear, so the fear's stream sign (C or C') does not enter at all.
//
// PREDICTIONS, written before this file ran. T2's values for D = 1 to 5 were printed by the disclosed design probes
// of E-SPN-0076 (tmp/fsx-probe3, 4, 5: role [3] share 0.017 to 0.035); D = 6, T1, T3, T4, T5 and T6 were not probed.
// T1 The line sector is closed off: on the 27-label space of three loves (D = 1, 2; K = 0 and 0.7) the beat moves
//    exactly no weight from the doublet-only states onto any state with a token on the line (below 1e-14), so every
//    state reached from a locked start has N = 3, odd, and 2 pi sign (-1)^3 = -1 (E-SPN-0071's R = (-1)^N).
// T2 Spin one half: at D = 1 .. 6 (c = N) the lightest three-love level (E-SPN-0076's definition) holds at least
//    0.9 of its weight in role [2,1], the natural doublet (the rest is role [3], spin three halves).
// T3 It travels: tracked by overlap from K = 0 to pi in 12 steps at D = 2, 3, 4, the lightest level's band is at
//    least 0.01 wide and its group velocity reaches 0.02 docks per beat (consecutive overlaps at least 0.5).
// T4 The operator is the rule: one beat of the ring runner of E-SPN-0074 with the wall 2D and the cost phase, on a
//    momentum state of ring 16 (K = 3 pi / 8, a Weyl-filled relative state), equals the Bloch operator's image to
//    1e-12, for three loves (D = 2) and the love-fear pair (D = 3), with no weight outside the allowed set.
// T5 The start family: with each of the 17 link starts' color fields, the walled, costed three loves (ring 12, D = 1,
//    5 beats) and pair (ring 24, D = 2, 10 beats) have the no-field positions to 1e-12.
// T6 (4, 1) is not held as one: three loves at a dock and a love-fear pair s docks away carry no string for every
//    s = 1 .. 20, while four loves at a dock and a fear s away carry a string of s.
//
// Gates, fixed with the predictions: T1 .. T6. Status pass if all hold.
// REPORTED, not gated: the lightest level's unwrapped energy, <l>, particle share and meeting energy by depth, the
// naive nearest-to-zero level's role share, and the three-love operator under C and C' (identical: no fear).
// HUSK: one husk line; every number is a husk number.
//
// Depth L2: a constructed stand-in (locked tokens on one line); the electron's charge, spin and statistics are read
// on it, not derived for the knit's tokens.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  blochColumn,
  blochSpace,
  contactEnergy,
  lightestUnwrapped,
  lineString,
  nearestBandBottom,
  overlap,
  quartetShare,
  spectrumAt,
  stringMoments,
  type Bloch,
  type BlochSpec,
  type Level,
} from '@/code/measure/flux-store-bloch'
import { antisymmetrized, lockedRun, spanOf, type LockedStart } from '@/code/measure/locked-run'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'
import { type M3 } from '@/code/measure/token-pair-run'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'
import { type Vibe } from '@/code/rule/locked-token-line'

type Complex = [number, number]

const threeSpec = (D: number, labels: 2 | 3 = 2, convention: 'C' | 'Cprime' = 'C'): BlochSpec => {
  const N = 2 * D + 1

  return { kinds: ['love', 'love', 'love'], convention, unlike: 'knit', depth: D, cost: N, root: 2 * N * N, labels }
}

const pairSpec = (D: number): BlochSpec => {
  const N = 2 * D + 1

  return { kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', depth: D, cost: N, root: 2 * N * N, labels: 2 }
}

// T1: the weight the beat moves from the doublet-only states onto the line
function lineLeak(D: number, K: number): { leak: number; columns: number } {
  const b = blochSpace(threeSpec(D, 3))
  let leak = 0
  let columns = 0

  for (let col = 0; col < b.size; col++) {
    const r = col % b.labelCount
    const j = [Math.floor(r / 9), Math.floor(r / 3) % 3, r % 3]

    if (j.includes(2)) continue

    columns++

    const img = blochColumn(b, K, col)
    let w = 0

    img.idx.forEach((i, m) => {
      const s = i % b.labelCount

      if ([Math.floor(s / 9), Math.floor(s / 3) % 3, s % 3].includes(2)) w += img.re[m]! ** 2 + img.im[m]! ** 2
    })

    leak = Math.max(leak, w)
  }

  return { leak, columns }
}

// T4: one beat of the ring runner against the Bloch operator on a momentum state
function ringAgreement(spec: BlochSpec, ring: number, m: number): { gap: number; outside: number } {
  const b: Bloch = blochSpace(spec)
  const K = (2 * Math.PI * m) / ring
  const n = spec.kinds.length
  const phi = { re: new Float64Array(b.size), im: new Float64Array(b.size) }

  for (let i = 0; i < b.size; i++) {
    phi.re[i] = weyl(i + 1, GOLDEN) - 0.5
    phi.im[i] = weyl(i + 1, SILVER) - 0.5
  }

  const labelOf = (r: number): number[] => {
    const out = new Array<number>(n)
    let c = r

    for (let t = n - 1; t >= 0; t--) {
      out[t] = c % b.q
      c = Math.floor(c / b.q)
    }

    return out
  }
  const starts: LockedStart[] = []

  for (let x0 = 0; x0 < ring; x0++) {
    const ph: Complex = [Math.cos(K * x0), Math.sin(K * x0)]

    for (let i = 0; i < b.size; i++) {
      const d = b.configs[Math.floor(i / b.labelCount)]!
      const a: Complex = [phi.re[i]! * ph[0] - phi.im[i]! * ph[1], phi.re[i]! * ph[1] + phi.im[i]! * ph[0]]

      starts.push({ x: d.map(v => (((x0 + v) % ring) + ring) % ring), j: labelOf(i % b.labelCount), amp: a })
    }
  }

  const run = lockedRun({ ring, kinds: spec.kinds, convention: spec.convention, unlike: spec.unlike, wall: 2 * spec.depth, start: starts })
  const R = 3 ** n
  const P = ring ** n
  const xs = new Array<number>(n)

  for (let p = 0; p < P; p++) {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      xs[t] = c % ring
      c = Math.floor(c / ring)
    }

    const th = (-2 * Math.PI * ((spec.cost * spanOf(ring, xs)) % spec.root)) / spec.root

    for (let r = 0; r < R; r++) {
      const vr = run.re[p * R + r]!
      const vi = run.im[p * R + r]!

      run.re[p * R + r] = vr * Math.cos(th) - vi * Math.sin(th)
      run.im[p * R + r] = vr * Math.sin(th) + vi * Math.cos(th)
    }
  }

  run.beat()

  // the Bloch image
  const img = { re: new Float64Array(b.size), im: new Float64Array(b.size) }

  for (let col = 0; col < b.size; col++) {
    const c = blochColumn(b, K, col)

    c.idx.forEach((i, k) => {
      img.re[i] = img.re[i]! + c.re[k]! * phi.re[col]! - c.im[k]! * phi.im[col]!
      img.im[i] = img.im[i]! + c.re[k]! * phi.im[col]! + c.im[k]! * phi.re[col]!
    })
  }

  let gap = 0
  const covered = new Uint8Array(P * R)

  for (let x0 = 0; x0 < ring; x0++) {
    const ph: Complex = [Math.cos(K * x0), Math.sin(K * x0)]

    for (let i = 0; i < b.size; i++) {
      const d = b.configs[Math.floor(i / b.labelCount)]!
      const p = d.reduce((a, v) => a * ring + ((((x0 + v) % ring) + ring) % ring), 0)
      const r = labelOf(i % b.labelCount).reduce((a, v) => a * 3 + v, 0)
      const want: Complex = [img.re[i]! * ph[0] - img.im[i]! * ph[1], img.re[i]! * ph[1] + img.im[i]! * ph[0]]

      covered[p * R + r] = 1
      gap = Math.max(gap, Math.hypot(want[0] - run.re[p * R + r]!, want[1] - run.im[p * R + r]!))
    }
  }

  let outside = 0

  for (let a = 0; a < P * R; a++) if (!covered[a]) outside += run.re[a]! ** 2 + run.im[a]! ** 2

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

function costedRun(input: { ring: number; kinds: Vibe[]; D: number; links?: M3[]; start: LockedStart[] }): { beat: () => void; positions: () => Float64Array } {
  const N = 2 * input.D + 1
  const M = 2 * N * N
  const run = lockedRun({ ring: input.ring, kinds: input.kinds, convention: 'C', unlike: 'knit', wall: 2 * input.D, links: input.links, start: input.start })
  const n = input.kinds.length
  const R = 3 ** n
  const P = input.ring ** n
  const cr = new Float64Array(P)
  const ci = new Float64Array(P)
  const xs = new Array<number>(n)

  for (let p = 0; p < P; p++) {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      xs[t] = c % input.ring
      c = Math.floor(c / input.ring)
    }

    const th = (-2 * Math.PI * ((N * spanOf(input.ring, xs)) % M)) / M

    cr[p] = Math.cos(th)
    ci[p] = Math.sin(th)
  }

  return {
    beat: () => {
      for (let p = 0; p < P; p++) {
        for (let r = 0; r < R; r++) {
          const vr = run.re[p * R + r]!
          const vi = run.im[p * R + r]!

          run.re[p * R + r] = vr * cr[p]! - vi * ci[p]!
          run.im[p * R + r] = vr * ci[p]! + vi * cr[p]!
        }
      }

      run.beat()
    },
    positions: () => run.positions(),
  }
}

type LightRow = { D: number; dim: number; energy: number; raw: number; mean: number; spinHalf: number; even: number; contact: number; gapNext: number; naiveSpinHalf: number; naiveMean: number; residual: number }

function lightestThree(D: number): LightRow & { level: Level } {
  const r = spectrumAt(threeSpec(D), 0)
  const lp = lightestUnwrapped(r.bloch, r.all, 4 * D + 6)
  const naive = nearestBandBottom(r.all)

  return {
    D,
    dim: r.dim,
    energy: lp.unwrapped,
    raw: lp.level.energy,
    mean: stringMoments(r.bloch, lp.level.vector).mean,
    spinHalf: 1 - quartetShare(r.bloch, lp.level.vector),
    even: lp.reading.even,
    contact: contactEnergy(r.bloch, lp.level.vector),
    gapNext: lp.nextUnwrapped - lp.unwrapped,
    naiveSpinHalf: 1 - quartetShare(r.bloch, naive.level.vector),
    naiveMean: stringMoments(r.bloch, naive.level.vector).mean,
    residual: r.residual,
    level: lp.level,
  }
}

// T3: follow the lightest level from K = 0 to pi by overlap
function dispersion(D: number, start: Level): { bandwidth: number; velocity: number; minOverlap: number; energies: number[] } {
  const steps = 12
  const energies = [start.energy]
  let prev = start
  let minOverlap = 1
  let velocity = 0

  for (let s = 1; s <= steps; s++) {
    const K = (Math.PI * s) / steps
    const r = spectrumAt(threeSpec(D), K)
    let best = r.all[0]!
    let bestOverlap = -1

    for (const lv of r.all) {
      const o = overlap(prev.vector, lv.vector)

      if (o > bestOverlap) {
        bestOverlap = o
        best = lv
      }
    }

    // unwrap continuously
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

export default experiment({
  id: 'spin/lightest-charge-one',
  code: 'E-SPN-0077',
  title: 'the lightest bound charge-one state under the flux string, a STAND-IN on locked tokens: three loves held by the string whose store is on the flux and whose cost is the light\'s drift; the line sector is closed off, so N = 3 and the 2 pi sign is -1 on every state, the lightest level is the natural spin one half at every depth tried, it travels, and (4, 1) is not held as one (three loves and a neutral pair part at no string cost)',
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
    const rows = [1, 2, 3, 4, 5, 6].map(D => {
      const row = lightestThree(D)

      log(`t2 D ${D}`)

      return row
    })
    const t2 = rows.every(r => r.spinHalf >= 0.9)

    // ---- T3 ----
    const bands = [2, 3, 4].map(D => ({ D, ...dispersion(D, rows.find(r => r.D === D)!.level) }))
    const t3 = bands.every(b => b.bandwidth >= 0.01 && b.velocity >= 0.02 && b.minOverlap >= 0.5)

    log('t3')

    // ---- T4 ----
    const agreeThree = ringAgreement(threeSpec(2), 16, 3)
    const agreePair = ringAgreement(pairSpec(3), 16, 3)
    const t4 = agreeThree.gap < 1e-12 && agreePair.gap < 1e-12 && agreeThree.outside < 1e-24 && agreePair.outside < 1e-24

    log('t4')

    // ---- T5 ----
    const moves = gridMoves()
    const table = cliffordTable()
    const unitaries = Array.from({ length: 216 }, (_, k) => unitaryOf(k))
    const ensemble = startFamily(16).map(member => {
      const linksOf = (L: number): M3[] => Array.from({ length: L }, (_, x) => unitaries[table.indexOf(phaseMove(moves.act[member.start(x, moves.act.length)] ?? []))] as M3)
      let gap = 0
      const cases: { L: number; kinds: Vibe[]; D: number; beats: number; start: LockedStart[] }[] = [
        { L: 12, kinds: ['love', 'love', 'love'], D: 1, beats: 5, start: antisymmetrized({ x: [5, 5, 6], j: [0, 1, 0] }) },
        { L: 24, kinds: ['love', 'fear'], D: 2, beats: 10, start: [{ x: [12, 12], j: [0, 1], amp: [1, 0] }] },
      ]

      for (const c of cases) {
        const field = costedRun({ ring: c.L, kinds: c.kinds, D: c.D, links: linksOf(c.L), start: c.start })
        const plain = costedRun({ ring: c.L, kinds: c.kinds, D: c.D, start: c.start })

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

    // REPORTED: C and C' give the same three-love operator (no fear)
    const bc = blochSpace(threeSpec(2, 2, 'C'))
    const bp = blochSpace(threeSpec(2, 2, 'Cprime'))
    let conventionGap = 0

    for (let col = 0; col < bc.size; col++) {
      const x = blochColumn(bc, 0.3, col)
      const y = blochColumn(bp, 0.3, col)

      x.idx.forEach((i, k) => {
        const m = y.idx.indexOf(i)

        conventionGap = Math.max(conventionGap, m < 0 ? Math.hypot(x.re[k]!, x.im[k]!) : Math.hypot(x.re[k]! - y.re[m]!, x.im[k]! - y.im[m]!))
      })
    }

    const ok = t1 && t2 && t3 && t4 && t5 && t6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `three locked loves held by the flux string (store on the flux, cost the light's drift) are the lightest bound charge-one state the string makes: four loves and a fear part into three loves and a neutral pair at no string cost (0 at every separation 1 to 20); the beat moves no weight onto the line (worst ${Math.max(...leaks.map(l => l.leak)).toExponential(1)}), so N = 3 and the 2 pi sign is -1 on every state; the lightest level is the natural spin one half at every depth (role [2,1] share ${rows.map(r => r.spinHalf.toFixed(3)).join(', ')} at D = 1 to 6), compact (<l> ${rows.map(r => r.mean.toFixed(2)).join(', ')}, the column allowing 2D), with unwrapped energy ${rows.map(r => r.energy.toFixed(3)).join(', ')}; it travels (band ${bands.map(b => b.bandwidth.toFixed(3)).join(', ')} wide, group velocity up to ${bands.map(b => b.velocity.toFixed(3)).join(', ')} docks per beat at D = 2, 3, 4); the Bloch operator is the ring rule (${agreeThree.gap.toExponential(1)}, ${agreePair.gap.toExponential(1)}), and over the 17 link starts the costed runs keep the no-field positions (worst ${Math.max(...ensemble.map(e => e.gap)).toExponential(1)}); C and C' give the same operator here (no fear, ${conventionGap.toExponential(1)})`,
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
            [`three_D${r.D}_spinHalfShare`, r.spinHalf],
            [`three_D${r.D}_evenShare`, r.even],
            [`three_D${r.D}_meetingEnergy`, r.contact],
            [`three_D${r.D}_gapNext`, r.gapNext],
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
        conventionGap,
        ...Object.fromEntries(rows.flatMap(r => [[`naive_D${r.D}_spinHalfShare`, r.naiveSpinHalf], [`naive_D${r.D}_meanString`, r.naiveMean]])),
      },
      notes: `L2, a STAND-IN. Gates T1 ${t1}, T2 ${t2}, T3 ${t3}, T4 ${t4}, T5 ${t5}, T6 ${t6}. Lightest three-love level by depth: ${rows.map(r => `D ${r.D} (dim ${r.dim}): E ${r.energy.toFixed(5)} (raw ${r.raw.toFixed(5)}), <l> ${r.mean.toFixed(3)}, spin one half ${r.spinHalf.toFixed(4)}, particle ${r.even.toFixed(3)}, meeting energy ${r.contact.toFixed(3)}, next +${r.gapNext.toFixed(4)}, residual ${r.residual.toExponential(1)}`).join('; ')}. Bands (K = 0 to pi in 12 steps): ${bands.map(b => `D ${b.D}: ${b.energies.map(e => e.toFixed(3)).join(' ')} (min overlap ${b.minOverlap.toFixed(3)})`).join('; ')}. Naive nearest-to-zero levels: ${rows.map(r => `D ${r.D} spin one half ${r.naiveSpinHalf.toFixed(3)}, <l> ${r.naiveMean.toFixed(2)}`).join('; ')}. Line leak by (D, K): ${leaks.map(l => `(${l.D}, ${l.K}) ${l.leak.toExponential(1)} over ${l.columns} columns`).join(', ')}. Start members: ${ensemble.map(e => `${e.member} ${e.gap.toExponential(1)}`).join(', ')}. THE FEAR'S STREAM SIGN: the charge-one state holds no fear, so C (the user's choice, 2026-09-26) and C' give the same operator; they differ only on the love-fear pair (E-SPN-0076). MEANING: the flux string, with its store on the flux and its cost from the light, binds three loves into a compact state (<l> from ${Math.min(...rows.map(r => r.mean)).toFixed(2)} to ${Math.max(...rows.map(r => r.mean)).toFixed(2)} links over D = 1 to 6, against a column allowing 2D), and that lightest level is the natural spin one half with N = 3 and a full turn of -1, as E-SPN-0071 predicted for any role-blind binding, although the locked walk is not role-blind; it moves as a whole. The unwrapped energy falls with depth and is first below the free band bottom at D = ${rows.find(r => r.energy < 0)?.D ?? 'none of 1 to 6'} (the fear beat's meeting binds it below, meeting energy ${rows.map(r => r.contact.toFixed(2)).join(', ')}, and the string's cost lifts it), which is why a reading measured upward from 0 fails there. What this is not: an electron of the knit. The tokens are locked stand-ins on one line, the store is held at one port, and three loves are a color singlet of three, a baryon-like electron, which is the model's charge assignment Q = (love - fear) / 3, not a derivation that the electron is made this way.`,
    })
  },
})
