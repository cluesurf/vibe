// Covariant link moves that can cool the field. E-FRC-0160 found the coupled Sigma(648) rule cannot hold a
// confined point because its only link move, the reflection through one staple, cannot drain the field: the
// drain stalls 4.4 to 9.7 units per link above the lowest level. This enumerates the moves the group allows
// and measures how low each drains.
//
// Which moves are covariant and their own inverse. A frame change sends a link U: x -> y to h_y U h_x^-1 and
// the transport V of each staple, read x -> y round the other two sides of a triangle, the same way. A word
// that alternates link-like terms and their inverses, W = L1 L2^-1 L3 ..., transforms like a link when its
// length is odd. The move U -> z W U^-1 W, with z in the center, is then covariant (z commutes with every h)
// and its own inverse for any such W and any fixed z: z W (z W U^-1 W)^-1 W = z W W^-1 U W^-1 z^-1 W = U. A
// move P U^-1 Q with P, Q not related this way is not an involution for every U. So the family is: a word W
// of the staples and a center element z. Bounded by word length, the families measured are (code/rule/sigma-
// links `moves`):
// - 'one': W one staple, the one turning with the beat, z = 1 (E-FRC-0128 and 0150 to 0161)
// - 'staples': each of the 8 staples in turn, z = 1
// - 'center': each of the 8 staples with each of z = 1, w, w^2 (24 moves)
// - 'words': those, and 8 words V_i V_j^-1 V_k of three staples with each z (48 moves)
// - 'wide': those, and 32 words of three staples in four patterns (120 moves)
// Every move is paid to its link's demon, so the energy bookkeeping, reversal and covariance hold for each.
//
// The lowest level. A triangle's lowest level under the modified action (scale 12, beta1 / beta0 = -1.67 /
// 12) is -1, taken by 24 elements with Re Tr = 1.71, not by the identity (level 0). Whether every triangle of
// the D4 lattice can sit at -1 at once is not known, so the reference is a seeded Metropolis annealing of the
// same triangle energy (uniform proposals, beta rising, then only downhill moves), a sampler that breaks the
// frame change and is used only to say how low the energy can go.
//
// Measured on the side-4 D4 box (256 docks):
// - for each family, from an ordered start (the identity with a tenth of its links hashed) and a disordered
//   one (the hashed links of E-FRC-0128), the level per triangle after a drain of 100 beats (a beat, then
//   every demon emptied)
// - with the richest family, a heat-assisted drain: 30 cycles of a small fill (0.003), 30 beats, then 10
//   drain beats. Only the starting condition, the rule is the same
// - the annealing reference, 20,000 sweeps then 100 downhill
// - the structural gates for 'center' and 'wide', as E-FRC-0154 runs them: love and fear pairs joined by
//   flux, kappa 3, tension 3, capacity 24, 24 beats
//
// Gates, fixed before the run (the drain numbers of the probes tmp/probe-sigma-cool and probe-sigma-anneal
// were seen, and the gates ask what the note asked, not what they showed):
// - for 'center' and 'wide': reversal exact, energy to the unit, love and fear and Gauss's law every beat, 0
//   mismatches under a frame change by all 648 elements and by the center alone
// - each richer family drains at least as low as the one before it, from both starts
// - the best cooling (the heat-assisted drain) reaches the annealing reference's level or below it, within
//   0.05 per triangle
//
// Depth L2: a constructed rule against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  addSigmaFlux,
  centerElements,
  changeSigmaFrame,
  coolSigmaLinks,
  defectSigmaLinks,
  hashedSigmaLinks,
  linkTriangleEnergy,
  makeSigmaLinks,
  sigmaBeat,
  sigmaBeatBack,
  sigmaEnergy,
  sigmaFieldEnergy,
  sigmaGaussViolations,
  type MoveFamily,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDE = 4
const SCALE = 12
const RATIO = -1.67 / 12
const DRAIN = 100
const CYCLES = 30
const CYCLE_FILL = 0.003
const CYCLE_BEATS = 30
const ANNEAL = 20000
const FAMILIES: MoveFamily[] = ['one', 'staples', 'center', 'words', 'wide']
const GOLDEN = (Math.sqrt(5) - 1) / 2

const fieldRule = (moves: MoveFamily): SigmaLinks =>
  makeSigmaLinks({ side: SIDE, kappa: 12, tension: 0, capacity: 48, hop: false, roles: false, couple: 'center', scale: SCALE, ratio: RATIO, moves })

const empty = (rule: SigmaLinks, links: Int16Array): SigmaState => ({
  vibe: new Int8Array(rule.cells),
  role: new Int8Array(rule.cells),
  links,
  demon: new Int32Array(rule.cells * 24),
  flux: new Int32Array(rule.cells * 24),
})

const perTriangle = (rule: SigmaLinks, links: Int16Array): number => sigmaFieldEnergy(rule, links) / ((rule.cells * 12 * 8) / 3)

function drain(rule: SigmaLinks, links: Int16Array): number {
  let s = empty(rule, links)

  for (let k = 0; k < DRAIN; k++) {
    s = sigmaBeat(rule, s, k).state
    s.demon.fill(0)
  }

  return perTriangle(rule, s.links)
}

function heatAssisted(rule: SigmaLinks, links: Int16Array): number {
  const { state } = coolSigmaLinks(rule, links, { drain: DRAIN, cycles: CYCLES, fill: CYCLE_FILL, beats: CYCLE_BEATS, empties: 10 })

  return perTriangle(rule, state.links)
}

function anneal(rule: SigmaLinks): number {
  const rng = makeRng({ seed: 7 })
  const links = hashedSigmaLinks(rule)

  for (let sweep = 0; sweep < ANNEAL + 100; sweep++) {
    const beta = sweep < ANNEAL ? 0.1 + (3 * sweep) / ANNEAL : Infinity

    for (let x = 0; x < rule.cells; x++) {
      for (const a of rule.firsts) {
        const u = links[x * 24 + a] ?? 0
        const g = rng.nextInt({ max: rule.order })
        const change = linkTriangleEnergy(rule, links, x, a, g) - linkTriangleEnergy(rule, links, x, a, u)

        if (change <= 0 || rng.next() < Math.exp(-beta * change)) {
          links[x * 24 + a] = g
          links[(rule.neighbour[x * 24 + a] ?? 0) * 24 + (rule.opposite[a] ?? a)] = rule.group.inverse[g] ?? 0
        }
      }
    }
  }

  return perTriangle(rule, links)
}

// the structural battery of E-FRC-0154 for one family
function structure(moves: MoveFamily): { exact: boolean; frame: number; centerFrame: number; gauss: number } {
  const rule = makeSigmaLinks({ side: SIDE, kappa: 3, tension: 3, capacity: 24, couple: 'center', scale: SCALE, ratio: RATIO, moves })
  const start = (scale: number): SigmaState => {
    const s = empty(rule, hashedSigmaLinks(rule))

    for (let x = 0; x < rule.cells; x++) {
      const u = ((x + 1) * GOLDEN * scale) % 1
      const d = Math.floor(((x + 2) * GOLDEN * scale * 24) % 24)
      const y = rule.neighbour[x * 24 + d] ?? 0

      if (u < 0.3 && s.vibe[x] === 0 && s.vibe[y] === 0) {
        const love = u < 0.15

        s.vibe[x] = love ? 1 : -1
        s.vibe[y] = love ? -1 : 1
        s.role[x] = Math.floor(((x + 3) * GOLDEN * scale * 9) % 9)
        s.role[y] = Math.floor(((y + 5) * GOLDEN * scale * 9) % 9)
        addSigmaFlux(rule, s.flux, x, d, love ? 1 : -1)
      }

      rule.firsts.forEach(a => (s.demon[x * 24 + a] = Math.floor((((x * 24 + a + 5) * GOLDEN * scale) % 1) * 25)))
    }

    return s
  }
  const fields = (s: SigmaState): ArrayLike<number>[] => [s.vibe, s.role, s.links, s.demon, s.flux]
  const mismatches = (a: SigmaState, b: SigmaState): number => {
    const right = fields(b)

    return fields(a).reduce((n, f, k) => n + Array.from(f).filter((v, i) => v !== right[k]?.[i]).length, 0)
  }
  const count = (s: SigmaState, v: number): number => s.vibe.filter(x => x === v).length
  const s0 = start(1.37)
  const e0 = sigmaEnergy(rule, s0)

  let s = s0
  let exact = true
  let gauss = 0

  for (let t = 0; t < 24; t++) {
    s = sigmaBeat(rule, s, t).state
    exact = exact && sigmaEnergy(rule, s) === e0 && count(s, 1) === count(s0, 1) && count(s, -1) === count(s0, -1)
    gauss += sigmaGaussViolations(rule, s)
  }

  for (let t = 23; t >= 0; t--) {
    s = sigmaBeatBack(rule, s, t)
  }

  exact = exact && mismatches(s, s0) === 0

  const centers = centerElements(rule)
  const frames = [
    Array.from({ length: rule.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * rule.order)),
    Array.from({ length: rule.cells }, (_, x) => centers[Math.floor((((x + 13) * GOLDEN * 4.3) % 1) * 3)] ?? rule.identity),
  ]
  const [frame, centerFrame] = frames.map(f => {
    let a = start(2.33)
    let b = changeSigmaFrame(rule, a, f)
    let n = 0

    for (let t = 0; t < 24; t++) {
      a = sigmaBeat(rule, a, t).state
      b = sigmaBeat(rule, b, t).state
      n += mismatches(changeSigmaFrame(rule, a, f), b)
    }

    return n
  }) as [number, number]

  return { exact, frame, centerFrame, gauss }
}

export default experiment({
  id: 'gauge/sigma-cooling-moves',
  code: 'E-FRC-0162',
  title:
    'covariant link moves that cool the Sigma(648) field: every move U -> z W U^-1 W, W an odd word of the staples and z central, is covariant and its own inverse, and the richer the words the lower the drain goes, from 0.74 per triangle with one staple to -0.53 with 40 words and three centers, and a heat-assisted drain with the same moves reaches -0.80, below a seeded annealing reference at -0.71 after 20,000 sweeps',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const ladder = FAMILIES.map(moves => {
      const rule = fieldRule(moves)

      return { moves, ordered: drain(rule, defectSigmaLinks(rule, 0.1, 3.3)), disordered: drain(rule, hashedSigmaLinks(rule)) }
    })
    const wide = fieldRule('wide')
    const cooled = heatAssisted(wide, defectSigmaLinks(wide, 0.1, 3.3))
    const reference = anneal(wide)
    const structures = (['center', 'wide'] as MoveFamily[]).map(structure)

    const monotone = ladder.every(
      (row, k) => k === 0 || (row.ordered <= (ladder[k - 1]?.ordered ?? Infinity) && row.disordered <= (ladder[k - 1]?.disordered ?? Infinity)),
    )
    const structural = structures.every(s => s.exact && s.frame === 0 && s.centerFrame === 0 && s.gauss === 0)
    const reaches = cooled <= reference + 0.05

    const ok = structural && monotone && reaches

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the families 'center' and 'wide' reverse exactly, conserve energy to the unit, love and fear, keep Gauss's law and commute with frame changes by all 648 elements and by the center alone, each richer family drains at least as low as the one before it from both starts, and the heat-assisted drain with the richest family reaches the annealing reference's level or below it within 0.05 per triangle",
      metrics: Object.fromEntries([
        ...ladder.flatMap(row => [
          [`${row.moves}OrderedDrain`, row.ordered],
          [`${row.moves}DisorderedDrain`, row.disordered],
        ]),
        ['wideHeatAssistedDrain', cooled],
        ['lowestLevel', Math.min(...Array.from(wide.level))],
        ['monotoneLadder', monotone ? 1 : 0],
        ...(['center', 'wide'] as MoveFamily[]).flatMap((moves, k) => [
          [`${moves}Exact`, structures[k]?.exact ? 1 : 0],
          [`${moves}FrameMismatches`, structures[k]?.frame ?? -1],
          [`${moves}CenterFrameMismatches`, structures[k]?.centerFrame ?? -1],
          [`${moves}GaussViolations`, structures[k]?.gauss ?? -1],
        ]),
      ]),
      control: {
        annealingReference: reference,
        annealingSweeps: ANNEAL,
      },
      notes:
        'L2, exact integers. The annealing reference uses random numbers and breaks the frame change, and is a bound on how low the energy goes, not a rule. Whether -1 per triangle is reachable on the D4 lattice at all is not settled here. The heat-assisted drain changes only the starting condition, as the drain of E-FRC-0110 does.',
    })
  },
})
