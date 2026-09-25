// A colour triality kept as a glide in time, with no four-line vertex. E-FRC-0112 proves that a rule
// carried to itself by a colour triality on every beat can only trade tones between a colour line
// and its orbit in threes. The loophole it names: a rule with sigma U_t sigma^-1 = U_(t+2), which
// must commute with sigma only over two beats. The glide weave (code/rule/glide-weave) is a pair rule
// built that way: the committed pair clock between two passes of conditional swaps on a matching of
// the 12 lines, the matching turned by sigma every second beat, so each colour line meets the lines
// of two orbits one at a time.
//
// Gates, fixed before the run, on the side-5 D4 box:
// - exact reversal after 24 beats, charge conserved at every beat
// - the glide: sigma U_t = U_(t+2) sigma on the whole box for every beat, and NOT with a shift of 0
//   (it is not the triality weave's symmetry in disguise)
// - the loophole used: a lone tone on a colour line moves to a single orbit line within one beat
// - universality: the line graph connected on the vacuum and on a dense background
// Reported, with the committed turning weave and the triality weave beside it on the same side-9
// instruments as E-FRC-0111: CPT (charge conjugation with time reversal at a mirror phase, alone or
// combined with a power of sigma), the vacuum period, the bounded species (a lone tone whose support
// never exceeds 2), the bound colour-neutral triples, and the dressing growth.
//
// Depth L2: a constructed rule against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { turningWeave, type Collision } from '@/code/rule/collision'
import {
  colourTriality,
  trialityWeave,
  trialityWeaveLayout,
  type TrialityWeaveLayout,
} from '@/code/rule/triality-weave'
import { GLIDE_WEAVE_PERIOD, glideWeave } from '@/code/rule/glide-weave'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import {
  boxCellMap,
  d4BoxCell,
  d4BoxMesh,
  linearMapOf,
  transformState,
} from '@/code/substrate/d4-box'

const GOLDEN = (Math.sqrt(5) - 1) / 2

function difference(a: Will, b: Will): number {
  let count = 0

  for (let i = 0; i < a.data.length; i++) {
    count += a.data[i] === b.data[i] ? 0 : 1
  }

  return count
}

function dense(
  mesh: Will['mesh'],
  scale: number,
  low = 0.3,
  high = 0.6,
): Will {
  const will = makeWill(mesh)

  for (let i = 0; i < will.data.length; i++) {
    const u = ((i + 1) * GOLDEN * scale) % 1

    will.data[i] = u < low ? -1 : u < high ? 0 : 1
  }

  return will
}

// bounded species, bound colour-neutral triples and dressing growth on a side-9 box, the E-FRC-0111
// instruments
function particleContent(
  rule: (t: number) => Collision,
  layout: TrialityWeaveLayout,
  period: number,
): {
  boundedSpecies: number
  boundTriples: number
  worstGrowth: number
} {
  const mesh = d4BoxMesh({ side: 9 })
  const center = d4BoxCell({ coordinates: [4, 4, 4, 4], side: 9 })

  const supportOf = (
    seed: readonly (readonly [number, number])[],
  ): number[] => {
    let vac: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)

    for (const [slot, tone] of seed) {
      seeded.data[center * 24 + slot] = tone
    }

    const out: number[] = []

    for (let t = 0; t < 4 * period; t++) {
      vac = beat(vac, rule(t))
      seeded = beat(seeded, rule(t))
      out.push(difference(seeded, vac))
    }

    return out
  }

  let boundedSpecies = 0
  let worstGrowth = 0

  for (let direction = 0; direction < 24; direction++) {
    const support = supportOf([[direction, 1]])

    boundedSpecies += Math.max(...support) <= 2 ? 1 : 0
    worstGrowth = Math.max(
      worstGrowth,
      Math.max(...support.slice(-period)) /
        Math.max(1, Math.max(...support.slice(0, period))),
    )
  }

  const triples = layout.orbits.flatMap(orbit =>
    [1, -1].flatMap(tone =>
      [0, 1].map(end =>
        orbit.map(
          line => [layout.lines[line]?.[end] ?? 0, tone] as const,
        ),
      ),
    ),
  )
  const boundTriples = triples.filter(
    seed => Math.max(...supportOf(seed)) <= 6,
  ).length

  return { boundedSpecies, boundTriples, worstGrowth }
}

export default experiment({
  id: 'gauge/glide-weave',
  code: 'E-FRC-0114',
  title:
    'a pair rule that keeps a colour triality as a glide in time, sigma U_t = U_(t+2) sigma, with no four-line vertex: it reverses exactly, conserves charge, moves a single tone from a colour line onto one orbit line, which no rule symmetric beat by beat can do, and connects all twelve lines',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const SIDE = 5
    const box = d4BoxMesh({ side: SIDE })
    const opposite = meshOpposites(box)
    const sigma = colourTriality({ opposite })
    const layout = trialityWeaveLayout({ opposite, triality: sigma })
    const forward = glideWeave({ layout })
    const backward = glideWeave({ layout, forward: false })
    const period = GLIDE_WEAVE_PERIOD
    const charge = (w: Will): number =>
      w.data.reduce((a, b) => a + b, 0)

    // reversal and charge
    let reverses = true
    let chargeKept = true

    for (const scale of [1.37, 2.11, 3.03]) {
      const start = dense(box, scale)

      let w: Will = { mesh: box, data: Int8Array.from(start.data) }

      for (let t = 0; t < 24; t++) {
        w = beat(w, forward(t))
        chargeKept = chargeKept && charge(w) === charge(start)
      }

      for (let t = 23; t >= 0; t--) {
        w = inverseBeat(w, backward(t))
      }

      reverses = reverses && w.data.every((x, k) => x === start.data[k])
    }

    // the glide, on the whole box: sigma(beat_t(X)) against beat_(t+k)(sigma X), for every shift k
    const matrix = linearMapOf(sigma)
    const cellMap =
      matrix === undefined
        ? undefined
        : boxCellMap({ matrix, side: SIDE })
    const turn = (data: Int8Array): Int8Array =>
      transformState({
        data,
        cellMap: cellMap ?? [],
        permutation: sigma,
        degree: 24,
      })

    const glideHoldsAt = (k: number): boolean => {
      if (cellMap === undefined) {
        return false
      }

      for (const scale of [1.37, 2.11]) {
        const start = dense(box, scale)

        for (let t = 0; t < period; t++) {
          const a = beat(
            { mesh: box, data: Int8Array.from(start.data) },
            forward(t),
          )
          const b = beat(
            { mesh: box, data: turn(start.data) },
            forward(t + k),
          )

          if (!turn(a.data).every((x, i) => x === b.data[i])) {
            return false
          }
        }
      }

      return true
    }

    const glideShifts = Array.from(
      { length: period },
      (_, k) => k,
    ).filter(glideHoldsAt)

    // the loophole: a lone tone on a colour line lands on exactly one orbit line in one beat. Read
    // against the vacuum cell through the same collision, since the pair clock turns every empty
    // line into a created pair. A first version counted occupied lines instead, found every line
    // occupied, and read 0
    const orbitLines = new Set(layout.orbits.flat())

    let singleCrossing = 0

    for (let t = 0; t < period; t++) {
      const vacuumCell = new Int8Array(24)

      forward(t)(vacuumCell, 0, 24)

      for (const line of layout.colour) {
        for (const end of [0, 1]) {
          for (const tone of [1, -1]) {
            const cell = new Int8Array(24)

            cell[layout.lines[line]?.[end] ?? 0] = tone
            forward(t)(cell, 0, 24)

            const occupied = layout.lines
              .map(([a, b], k) =>
                cell[a] !== vacuumCell[a] || cell[b] !== vacuumCell[b]
                  ? k
                  : -1,
              )
              .filter(k => k >= 0)

            if (
              occupied.length === 1 &&
              orbitLines.has(occupied[0] ?? -1)
            ) {
              singleCrossing += 1
            }
          }
        }
      }
    }

    // CPT, with charge conjugation combined with sigma^j, at a mirror phase c
    const probes = Array.from({ length: 400 }, (_, n) => {
      const v = new Int8Array(24)

      for (let i = 0; i < 24; i++) {
        v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1

        if (n % 2 === 0 && (n + i) % 5 !== 0) {
          v[i] = 0
        }
      }

      return v
    })
    const power = (j: number): number[] =>
      Array.from({ length: 24 }, (_, d) => {
        let x = d

        for (let r = 0; r < j; r++) {
          x = sigma[x] ?? x
        }

        return x
      })

    let cpt = ''

    for (let j = 0; j < 3 && cpt === ''; j++) {
      const p = power(j)

      for (let c = 0; c < period && cpt === ''; c++) {
        let holds = true

        for (let t = 0; t < period && holds; t++) {
          const mirror = (((c - t) % period) + period) % period

          for (const v of probes) {
            const rhs = Int8Array.from(v)

            forward(t)(rhs, 0, 24)

            // K turns slot d to p d and negates, K^-1 undoes it. lhs = K backward(mirror) K^-1 v,
            // compared against forward(t) v
            const w = new Int8Array(24)

            v.forEach((_, d) => {
              w[d] = -(v[p[d] ?? 0] ?? 0)
            })
            backward(mirror)(w, 0, 24)

            const lhs = new Int8Array(24)

            w.forEach((x, d) => {
              lhs[p[d] ?? 0] = -x
            })

            if (!lhs.every((x, k) => x === rhs[k])) {
              holds = false
              break
            }
          }
        }

        if (holds) {
          cpt = `sigma^${j} mirror ${c}`
        }
      }
    }

    // vacuum
    let vacuum: Will = makeWill(box)
    let vacuumPeriod = -1

    for (let t = 1; t <= 48 && vacuumPeriod < 0; t++) {
      vacuum = beat(vacuum, forward(t - 1))

      if (vacuum.data.every(x => x === 0)) {
        vacuumPeriod = t
      }
    }

    // universality on the vacuum and on a dense background
    const mid = (SIDE - 1) / 2
    const center = mid * (1 + SIDE + SIDE ** 2 + SIDE ** 3)
    const lineOf = (d: number): number =>
      layout.lines.findIndex(([a, b]) => a === d || b === d)

    const components = (onDense: boolean): number => {
      const parent = Array.from({ length: 12 }, (_, i) => i)
      const find = (x: number): number =>
        parent[x] === x ? x : (parent[x] = find(parent[x] ?? x))

      for (let direction = 0; direction < 24; direction++) {
        let vac: Will = onDense
          ? dense(box, 1.37, 0.2, 0.8)
          : makeWill(box)
        let seeded: Will = onDense
          ? dense(box, 1.37, 0.2, 0.8)
          : makeWill(box)

        const slot = center * 24 + direction

        seeded.data[slot] = seeded.data[slot] === 1 ? -1 : 1

        for (let t = 0; t < 24; t++) {
          vac = beat(vac, forward(t))
          seeded = beat(seeded, forward(t))

          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vac.data[i]) {
              parent[find(lineOf(i % 24))] = find(lineOf(direction))
            }
          }
        }
      }

      return new Set(Array.from({ length: 12 }, (_, i) => find(i))).size
    }

    const vacuumComponents = components(false)
    const denseComponents = components(true)

    // particle content beside the two other rules
    const glide = particleContent(forward, layout, period)
    const committed = particleContent(
      turningWeave({ opposite: meshOpposites(d4BoxMesh({ side: 9 })) }),
      layout,
      24,
    )
    const weave = particleContent(trialityWeave({ layout }), layout, 6)

    const ok =
      reverses &&
      chargeKept &&
      glideShifts.includes(2) &&
      !glideShifts.includes(0) &&
      singleCrossing > 0 &&
      vacuumComponents === 1 &&
      denseComponents === 1

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the glide weave reverses exactly, conserves charge, satisfies sigma U_t = U_(t+2) sigma and not sigma U_t = U_t sigma, moves a lone colour-line tone onto a single orbit line, and connects all twelve lines on the vacuum and on a dense background, with its CPT, vacuum and particle content reported beside the committed and triality weaves',
      metrics: {
        reversesExactly: reverses ? 1 : 0,
        chargeConserved: chargeKept ? 1 : 0,
        glideShift:
          glideShifts.join(' ') === '' ? -1 : Number(glideShifts[0]),
        glideShiftCount: glideShifts.length,
        singleCrossing,
        vacuumComponents,
        denseComponents,
        cptFound: cpt === '' ? 0 : 1,
        vacuumPeriod,
        boundedSpecies: glide.boundedSpecies,
        boundTriples: glide.boundTriples,
        worstSupportGrowth: glide.worstGrowth,
      },
      control: {
        committedBoundedSpecies: committed.boundedSpecies,
        committedBoundTriples: committed.boundTriples,
        committedWorstGrowth: committed.worstGrowth,
        weaveBoundedSpecies: weave.boundedSpecies,
        weaveBoundTriples: weave.boundTriples,
        weaveWorstGrowth: weave.worstGrowth,
      },
      notes: `L2, a constructed rule, exact, no random numbers. Glide shifts found: ${glideShifts.join(' ') || 'none'}. CPT: ${cpt || 'none, under charge conjugation alone or combined with sigma or sigma^2, at any mirror phase'}. A glide is a symmetry of the dynamics combined with time, not an internal symmetry at each instant, so whether it gives a conserved colour charge is a separate question this does not answer.`,
    })
  },
})
