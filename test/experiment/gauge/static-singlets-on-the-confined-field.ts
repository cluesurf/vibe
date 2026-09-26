// Nuclei on the confined point of the D4 field: static color singlets (STAND-INS for nucleons) read through
// Polyakov lines, on the coupled Sigma(648) rule at the point E-FRC-0166 registered and E-FRC-0167 confirmed
// confined (fill 0.08, beta0 5.88, chi(2,2) = 0.386 +- 0.016 on the side-6 box).
//
// Why Polyakov lines. The paid-string rule of E-FRC-0195 to 0198 cannot hold a static source (no pair is made,
// so pinned charges freeze), and on this rule a love and a fear put down by hand give the local cost of their
// twists, not a free energy (E-FRC-0167's field-borne potential, 50 times chi). A static color source is the
// line of links it would sit on for all of Euclidean time: the Polyakov line P(x), the transport round the
// closed tau line through x, and the free energy of any set of static sources is -T ln of the expectation of
// the product of their lines' traces, T = 1 / N_t. Nothing is put in: the field is the rule's own, and every
// source is a reading of it. The singlets are stand-ins for nucleons: color singlets of static color charges
// with no spin, no flavor and no motion.
//
// What is read, each on every beat of the measurement, from the 216 tau lines of the side-6 box:
// - the static quark-antiquark: G1(R) = <Re Tr P(0) Tr P(R)^*> / 9 over line pairs at transverse separation R.
//   Its rate m1 = -d ln G1 / dR is N_t times the string tension
// - two static singlets: a zero-size static meson at x is M(x) = |Tr P(x)|^2 / 9. The residual between two is
//   C(R) = <M(0) M(R)> / <M>^2 - 1, attraction if positive, and its rate mR
// - a static baryon: three mutually close lines, B = <Re Tr P(1) Tr P(2) Tr P(3)> / 27. The baryon at one
//   position is trivial (det P = 1 on Sigma(648)), so the three quarks must be spread
// - saturation: N = 2 zero-size singlets at the first shell, and N = 3, 4 on mutually close lines,
//   F_N = -T ln(<M ... M> / <M>^N)
//
// Distances are read perpendicular to tau = (1, -1, 0, 0): R is the transverse length of the minimal-image
// displacement between two lines. The lines form a body-centered lattice (8 at sqrt(3/2), 6 at sqrt 2, 12 at
// 2, from a geometry probe, tmp/frc0199-geometry-probe.ts, run before this file), with no three lines mutually
// at the first shell, so "close" means the first or second shell, and a stretched baryon has two close sides and
// its third at the third shell (2). This Euclidean box's transverse three-space is not the husk (tau lies in the
// husk's coordinates), so every number here is a SUBSTRATE reading, labeled so. The husk reading of a static
// source's free energy is not defined in this setup and is owed.
//
// Predictions, written before the run:
// - m1 = N_t sigma = 6 x 0.386 = 2.32 per unit distance, from E-FRC-0167's area law: the Polyakov correlator and
//   the Wilson loop read one string
// - the residual between two singlets carries TWICE m1, not m1. A singlet has triality 0, so no single string
//   can join two, and the lightest thing two static singlets can exchange in this reading is two strings (the
//   quark of one with the antiquark of the other, and back): C(R) ~ G1(R)^2 ~ e^(-2 m1 R). This is E-FRC-0195's
//   history-form prediction, now on the confined field. A glueball lighter than 2 m1 would beat it
// - pairwise additivity: F_N grows with the number of close pairs, 1, 3, 6, so there is no saturation
//
// Gates, fixed before the run:
// - G0: the energy exact on every beat, the fast kernel equal to sigmaBeat (3 beats, every array), the 216 lines
//   partition the 1,296 docks, and every run confined (|<P>| under 0.05)
// - TENSION: m1 within 30 percent of 2.32
// - ATTRACTION: C at the smallest separation above 0 by 3 standard errors
// - STRINGS: mR within 25 percent of 2 m1
// - BARYON: B at the close triangle above 0 by 3 standard errors, and above B at the stretched triangle
//   (the three quarks cost more free energy spread out: a confined, bound baryon)
// - SATURATION (the hypothesis the prediction says fails): F_4 / 4 within 30 percent of F_2 / 2
// Status: pass if every gate, partial if G0, TENSION, ATTRACTION and BARYON hold, fail otherwise.
// Errors: 10 blocks of the measurement per start, 30 blocks in all, the standard error of their means.
//
// Depth L2: a constructed rule, measured, with stand-in nucleons.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { defectSigmaLinks, fillSigmaDemons, makeSigmaLinks, sigmaBeat, sigmaEnergy, sigmaLine, type SigmaState } from '@/code/rule/sigma-links'
import { copySigmaState, fastCoolSigmaLinks, fastSigmaBeat, makeSigmaTables } from '@/code/rule/sigma-fast'
import { boxDisplacement, makeBoxGeometry } from '@/code/measure/nucleon-gas'

const SIDE = 6
const SCALE = 12
const RATIO = -1.67 / 12
const CAPACITY = 48
const COOL = { drain: 100, cycles: 30, fill: 0.003, beats: 30, empties: 10 }
const FILL = 0.08
const HASHES = [3.3, 4.7, 6.1]
const SETTLE = 300
const MEASURE = 1200
const BLOCKS = 10
const CHI22_0167 = 0.386
const KERNEL_CHECK_BEATS = 3
const TENSION_TOLERANCE = 0.3
const STRING_TOLERANCE = 0.25
const SATURATION_TOLERANCE = 0.3
const SIGMAS = 3
const SHELL_DIGITS = 1e6

type Series = { mean: number; error: number }

function series(blocks: number[]): Series {
  const m = blocks.reduce((a, b) => a + b, 0) / blocks.length
  const sd = Math.sqrt(blocks.reduce((a, b) => a + (b - m) ** 2, 0) / (blocks.length - 1))

  return { mean: m, error: sd / Math.sqrt(blocks.length) }
}

// the weighted slope of ln y against r over points with y above twice its error: the rate
function rate(points: { r: number; value: Series }[]): { rate: number; points: number } {
  const good = points.filter(p => p.value.mean > 2 * p.value.error && p.value.mean > 0)

  if (good.length < 2) {
    return { rate: Number.NaN, points: good.length }
  }

  const w = good.map(p => (p.value.mean / p.value.error) ** 2)
  const x = good.map(p => p.r)
  const y = good.map(p => Math.log(p.value.mean))
  const sw = w.reduce((a, b) => a + b, 0)
  const mx = x.reduce((a, v, k) => a + (w[k] ?? 0) * v, 0) / sw
  const my = y.reduce((a, v, k) => a + (w[k] ?? 0) * v, 0) / sw
  const slope =
    x.reduce((a, v, k) => a + (w[k] ?? 0) * (v - mx) * ((y[k] ?? 0) - my), 0) / x.reduce((a, v, k) => a + (w[k] ?? 0) * (v - mx) ** 2, 0)

  return { rate: -slope, points: good.length }
}

export default experiment({
  id: 'gauge/static-singlets-on-the-confined-field',
  code: 'E-FRC-0199',
  title:
    'nuclei on the confined point of the D4 field: static color singlets (stand-ins for nucleons) read through Polyakov lines on the coupled Sigma(648) rule at fill 0.08, the quark-antiquark rate against the area law, the residual between two static singlets against twice that rate, a static three-quark baryon, and saturation for two to four singlets',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const rule = makeSigmaLinks({ side: SIDE, kappa: 12, tension: 0, capacity: CAPACITY, hop: false, roles: false, couple: 'center', scale: SCALE, ratio: RATIO, moves: 'wide' })
    const tables = makeSigmaTables(rule)
    const { cells, group } = rule
    const geometry = makeBoxGeometry(SIDE)
    const starts = Array.from({ length: cells }, (_, x) => x).filter(x => x % SIDE === 0)
    const lineCount = starts.length
    const lineDocks = starts.map(x => {
      const docks: number[] = []

      let c = x

      do {
        docks.push(c)
        c = rule.neighbour[c * 24 + tau] ?? 0
      } while (c !== x)

      return docks
    })
    const covered = new Int32Array(cells)

    lineDocks.forEach(docks => docks.forEach(d => (covered[d] = (covered[d] ?? 0) + 1)))

    const partition = covered.every(c => c === 1)
    const tauVector = roots[tau] ?? [0, 0, 0, 0]
    const transverse = (a: number, b: number): number =>
      Math.min(
        ...(lineDocks[b] ?? []).map(d => {
          const v = boxDisplacement(geometry, d, starts[a] ?? 0)
          const along = v.reduce((s, x, k) => s + x * (tauVector[k] ?? 0), 0) / 2

          return Math.hypot(...v.map((x, k) => x - along * (tauVector[k] ?? 0)))
        }),
      )
    const distance: number[][] = starts.map((_, a) => starts.map((__, b) => (a === b ? 0 : Math.round(transverse(a, b) * SHELL_DIGITS) / SHELL_DIGITS)))
    const shells = [...new Set(distance.flat().filter(r => r > 0))].sort((a, b) => a - b)
    const pairsByShell = shells.map(r => {
      const pairs: number[] = []

      for (let a = 0; a < lineCount; a++) {
        for (let b = a + 1; b < lineCount; b++) {
          if (distance[a]?.[b] === r) {
            pairs.push(a, b)
          }
        }
      }

      return Int32Array.from(pairs)
    })
    const second = shells[1] ?? 0
    const third = shells[2] ?? 0
    // close: the first or second shell. The transverse lattice of the tau lines is body-centered (8 lines at
    // sqrt(3/2), 6 at sqrt 2, tmp/frc0199-geometry-probe), so no three lines are mutually at the first shell
    const isNear = (a: number, b: number): boolean => (distance[a]?.[b] ?? 99) <= second
    // mutually close triples and quadruples
    const triangles: number[][] = []
    const quads: number[][] = []

    for (let a = 0; a < lineCount; a++) {
      for (let b = a + 1; b < lineCount; b++) {
        if (!isNear(a, b)) {
          continue
        }

        for (let c = b + 1; c < lineCount; c++) {
          if (!isNear(a, c) || !isNear(b, c)) {
            continue
          }

          triangles.push([a, b, c])

          for (let d = c + 1; d < lineCount; d++) {
            if (isNear(a, d) && isNear(b, d) && isNear(c, d)) {
              quads.push([a, b, c, d])
            }
          }
        }
      }
    }

    // the next larger baryon: two sides close, the third at the third shell
    const stretched: number[][] = []

    for (let a = 0; a < lineCount; a++) {
      for (let b = 0; b < lineCount; b++) {
        for (let c = b + 1; c < lineCount; c++) {
          if (b !== a && c !== a && isNear(a, b) && isNear(a, c) && distance[b]?.[c] === third) {
            stretched.push([a, b, c])
          }
        }
      }
    }

    const demonMean = (s: SigmaState): number => {
      let sum = 0

      for (let x = 0; x < cells; x++) {
        for (const a of rule.firsts) {
          sum += s.demon[x * 24 + a] ?? 0
        }
      }

      return sum / (cells * rule.firsts.length)
    }

    const re = new Float64Array(lineCount)
    const im = new Float64Array(lineCount)
    const meson = new Float64Array(lineCount)

    // block accumulators, across all starts
    const shellCount = shells.length
    const g1Blocks: number[][] = shells.map(() => [])
    const mmBlocks: number[][] = shells.map(() => [])
    const mBlocks: number[] = []
    const polyBlocks: number[] = []
    const triangleBlocks: number[] = []
    const stretchedBlocks: number[] = []
    const n3Blocks: number[] = []
    const n4Blocks: number[] = []

    let exact = true
    let fastKernelMismatches = 0
    let beta = 0

    const polyakovs: number[] = []

    HASHES.forEach((hash, h) => {
      const cooled = fastCoolSigmaLinks(tables, defectSigmaLinks(rule, 0.1, hash), COOL)
      const s = copySigmaState(cooled.state)

      fillSigmaDemons(rule, s, FILL)

      let t = cooled.beats

      if (h === 0) {
        let slow = copySigmaState(s)
        const fast = copySigmaState(s)

        for (let k = 0; k < KERNEL_CHECK_BEATS; k++) {
          slow = sigmaBeat(rule, slow, t + k).state
          fastSigmaBeat(tables, fast, t + k)

          for (const key of ['vibe', 'role', 'links', 'demon', 'flux'] as const) {
            slow[key].forEach((v, i) => (fastKernelMismatches += v === fast[key][i] ? 0 : 1))
          }
        }
      }

      const e0 = sigmaEnergy(rule, s)

      for (let k = 0; k < SETTLE; k++) {
        fastSigmaBeat(tables, s, t++)
      }

      const size = MEASURE / BLOCKS

      let pr = 0
      let pi = 0

      for (let block = 0; block < BLOCKS; block++) {
        const g1 = new Float64Array(shellCount)
        const mm = new Float64Array(shellCount)

        let m = 0
        let poly = 0
        let tri = 0
        let str = 0
        let n3 = 0
        let n4 = 0

        for (let k = 0; k < size; k++) {
          fastSigmaBeat(tables, s, t++)
          exact = exact && sigmaEnergy(rule, s) === e0
          beta += unitDemonBeta({ meanDemon: demonMean(s), capacity: CAPACITY }) / (MEASURE * HASHES.length)

          let sr = 0
          let si = 0

          for (let l = 0; l < lineCount; l++) {
            const g = sigmaLine(rule, s.links, starts[l] ?? 0, tau)

            re[l] = group.trace[g] ?? 0
            im[l] = rule.traceIm[g] ?? 0
            meson[l] = ((re[l] ?? 0) ** 2 + (im[l] ?? 0) ** 2) / 9
            sr += (re[l] ?? 0) / 3 / lineCount
            si += (im[l] ?? 0) / 3 / lineCount
            m += (meson[l] ?? 0) / lineCount / size
          }

          pr += sr / MEASURE
          pi += si / MEASURE
          poly += Math.hypot(sr, si) / size

          for (let r = 0; r < shellCount; r++) {
            const pairs = pairsByShell[r] as Int32Array
            const n = pairs.length / 2

            let a1 = 0
            let a2 = 0

            for (let p = 0; p < pairs.length; p += 2) {
              const a = pairs[p] as number
              const b = pairs[p + 1] as number

              a1 += ((re[a] as number) * (re[b] as number) + (im[a] as number) * (im[b] as number)) / 9
              a2 += (meson[a] as number) * (meson[b] as number)
            }

            g1[r] = (g1[r] ?? 0) + a1 / n / size
            mm[r] = (mm[r] ?? 0) + a2 / n / size
          }

          // Re of the product of three complex traces
          const triple = (list: number[][]): number =>
            list.reduce((acc, [a = 0, b = 0, c = 0]) => {
              const xr = (re[a] as number) * (re[b] as number) - (im[a] as number) * (im[b] as number)
              const xi = (re[a] as number) * (im[b] as number) + (im[a] as number) * (re[b] as number)

              return acc + (xr * (re[c] as number) - xi * (im[c] as number)) / 27
            }, 0) / Math.max(1, list.length)

          tri += triple(triangles) / size
          str += triple(stretched) / size
          n3 += triangles.reduce((acc, [a = 0, b = 0, c = 0]) => acc + (meson[a] as number) * (meson[b] as number) * (meson[c] as number), 0) / Math.max(1, triangles.length) / size
          n4 +=
            quads.reduce((acc, [a = 0, b = 0, c = 0, d = 0]) => acc + (meson[a] as number) * (meson[b] as number) * (meson[c] as number) * (meson[d] as number), 0) /
            Math.max(1, quads.length) /
            size
        }

        shells.forEach((_, r) => {
          g1Blocks[r]?.push(g1[r] ?? 0)
          mmBlocks[r]?.push(mm[r] ?? 0)
        })
        mBlocks.push(m)
        polyBlocks.push(poly)
        triangleBlocks.push(tri)
        stretchedBlocks.push(str)
        n3Blocks.push(n3)
        n4Blocks.push(n4)
      }

      polyakovs.push(Math.hypot(pr, pi))
    })

    const temperature = 1 / SIDE
    const mMean = series(mBlocks)
    const g1 = shells.map((r, k) => ({ r, value: series(g1Blocks[k] ?? []) }))
    // the connected residual per block, C = <MM> / <M>^2 - 1, with each block's own <M>
    const residual = shells.map((r, k) => ({ r, value: series((mmBlocks[k] ?? []).map((v, b) => v / (mBlocks[b] ?? 1) ** 2 - 1)) }))
    const m1 = rate(g1.filter(p => p.r > 0))
    const mR = rate(residual)
    const tri = series(triangleBlocks)
    const str = series(stretchedBlocks)
    // binding free energies of N nearest singlets: F_N = -T ln(<M..M> / <M>^N), per block then averaged
    const free = (blocks: number[], n: number): Series =>
      series(blocks.map((v, b) => -temperature * Math.log(Math.max(1e-300, v) / (mBlocks[b] ?? 1) ** n)))
    const f2 = free(mmBlocks[0] ?? [], 2)
    const f3 = free(n3Blocks, 3)
    const f4 = free(n4Blocks, 4)
    const nearestResidual = residual[0]?.value ?? { mean: 0, error: 1 }
    const predictedM1 = SIDE * CHI22_0167

    const g0 = exact && fastKernelMismatches === 0 && partition && polyakovs.every(p => p < 0.05)
    const tension = Math.abs(m1.rate / predictedM1 - 1) < TENSION_TOLERANCE
    const attraction = nearestResidual.mean > SIGMAS * nearestResidual.error
    const strings = Number.isFinite(mR.rate) && Math.abs(mR.rate / (2 * m1.rate) - 1) < STRING_TOLERANCE
    const baryon = tri.mean > SIGMAS * tri.error && tri.mean > str.mean
    const saturation = quads.length > 0 && Math.abs(f4.mean / 4 / (f2.mean / 2) - 1) < SATURATION_TOLERANCE
    const status = g0 && tension && attraction && strings && baryon && saturation ? 'pass' : g0 && tension && attraction && baryon ? 'partial' : 'fail'

    return verdict({
      status,
      claim:
        'on the confined point of the coupled Sigma(648) field, with the energy exact and every run confined, the static quark-antiquark rate matches the area law, two static color singlets (stand-in nucleons) attract with a residual carrying twice that rate, a static three-quark baryon is bound, and the binding free energy of four close singlets per singlet is within 30 percent of two\'s (substrate readings)',
      metrics: Object.fromEntries<number>([
        ['g0', g0 ? 1 : 0],
        ['tensionGate', tension ? 1 : 0],
        ['attractionGate', attraction ? 1 : 0],
        ['stringsGate', strings ? 1 : 0],
        ['baryonGate', baryon ? 1 : 0],
        ['saturationGate', saturation ? 1 : 0],
        ['energyExact', exact ? 1 : 0],
        ['fastKernelMismatches', fastKernelMismatches],
        ['linesPartitionDocks', partition ? 1 : 0],
        ...polyakovs.map((p, k): [string, number] => [`polyakovRun${k + 1}`, p]),
        ['polyakovBlockMean', series(polyBlocks).mean],
        ['beta0', SCALE * beta],
        ['mesonOnOneLineMean', mMean.mean],
        ['quarkAntiquarkRateM1', m1.rate],
        ['quarkAntiquarkRatePoints', m1.points],
        ['predictedM1', predictedM1],
        ['residualRate', mR.rate],
        ['residualRatePoints', mR.points],
        ['residualRateOverTwiceM1', mR.rate / (2 * m1.rate)],
        ['residualRateOverM1', mR.rate / m1.rate],
        ...g1.flatMap((p, k): [string, number][] => [
          [`shell${k + 1}R`, p.r],
          [`shell${k + 1}QuarkAntiquark`, p.value.mean],
          [`shell${k + 1}QuarkAntiquarkError`, p.value.error],
          [`shell${k + 1}Residual`, residual[k]?.value.mean ?? 0],
          [`shell${k + 1}ResidualError`, residual[k]?.value.error ?? 0],
        ]),
        ['nearestResidualFreeEnergy', -temperature * Math.log(1 + nearestResidual.mean)],
        ['baryonNearestTriangle', tri.mean],
        ['baryonNearestTriangleError', tri.error],
        ['baryonStretched', str.mean],
        ['baryonStretchedError', str.error],
        ['baryonFreeEnergyNearest', -temperature * Math.log(Math.max(1e-300, tri.mean))],
        ['quarkAntiquarkFreeEnergyNearest', -temperature * Math.log(Math.max(1e-300, g1[0]?.value.mean ?? 0))],
        ['baryonOverQuarkAntiquarkFreeEnergy', Math.log(Math.max(1e-300, tri.mean)) / Math.log(Math.max(1e-300, g1[0]?.value.mean ?? 0))],
        ['triangles', triangles.length],
        ['stretchedTriangles', stretched.length],
        ['quads', quads.length],
        ['bindingFreeEnergy2', f2.mean],
        ['bindingFreeEnergy2Error', f2.error],
        ['bindingFreeEnergy3', f3.mean],
        ['bindingFreeEnergy3Error', f3.error],
        ['bindingFreeEnergy4', f4.mean],
        ['bindingFreeEnergy4Error', f4.error],
        ['perSinglet4OverPerSinglet2', f4.mean / 4 / (f2.mean / 2)],
        ['perPair3OverPerPair2', f3.mean / 3 / f2.mean],
        ['perPair4OverPerPair2', f4.mean / 6 / f2.mean],
      ]),
      control: {
        chi22E0167: CHI22_0167,
        lines: lineCount,
        temperature,
        deltaLawBaryonOverMeson: 1.5,
      },
      notes:
        'L2, exact integers in the rule, no random numbers: starts are the golden defect patterns of E-FRC-0166 and 0167, demon fills the golden pattern. Every number is a substrate reading of the Euclidean D4 box, transverse to tau, not the husk. The nucleons are stand-ins: zero-size static color singlets |Tr P|^2 and a static three-line baryon, with no spin, flavor or motion. A free energy here is -T ln of a line correlator with T = 1 / 6, the box\'s own tau length. Rates are weighted fits of ln against R over the shells where the value exceeds twice its error, with no power-law prefactor. The baryon ratio against the quark-antiquark free energy at the nearest separation is reported beside the Delta law\'s 3/2.',
    })
  },
})
