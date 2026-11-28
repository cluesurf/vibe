// Q0 of the quantum ladder: the bare beat U
// as an exact library. code/rule/bare-beat.ts ports the self-contained script test/universe.ts (which exports nothing
// and stays unchanged); code/algebra/ninth-real-sign.ts decides the sign of a real number of Q(zeta_9) in rational
// intervals; code/measure/quantum-lab-measures.ts reads exact norms, weights, return probabilities, supports and moments.
//
// Gates, each able to fail:
// - the library's universeReport() equals the script's printed report byte for byte (all lines but the timing line),
//   read two ways: the script run as its own process, and the script's source compiled in memory and its main() called;
// - amplitudes: on the script's own seeds (one vibe T = 4, the identical pair T = 4, the neutral pair T = 2, the chiral
//   and X1 quadruples T = 1, the seven covariance states T = 1) and on every one- and same-dock two-excitation basis
//   state of the base dock, every U^t and its inverse run equal the script's, coefficient for coefficient (docks named
//   by their exact centers, so the two meshes' discovery orders cannot matter);
// - unitarity, inverse, charge and cone, exhaustively: every one-excitation basis state of the radius-1 ball (T = 4) and
//   of the radius-2 ball (T = 1), every two-excitation basis state of the radius-1 ball (T = 1), every two-excitation
//   state of the base dock (T = 3): the norm is exactly 1 after every beat, the inverse beats restore the start exactly,
//   charge, excitation count and the count of +1 tones never change, and the support never grows past one hop per beat
//   (thm_fock_beat_unitary_all_time, thm_fock_charge_conservation_all_time, thm_fock_lieb_robinson_light_cone);
// - U mixes: some basis state goes to a superposition of at least two basis states in one beat;
// - the measures: the exact squared norm is 1, dock occupations sum to the excitation count, every weight and every
//   return probability lies in [0, 1] by certified signs;
// - the certified sign: known values of 2 cos(2 pi k / 9), exact zeros, sign(-x) = -sign(x) and sign(x y) =
//   sign(x) sign(y) over a battery;
// - two runs give identical bytes; the three new modules call nothing on the host Math object and import no generator.
// Negative controls the gates must reject: a beat followed by a projector (norm), the inverse layers applied in forward
// order (inverse), a tone flip (charge), a doubled stream (cone), the permutation layers K and S alone (mixing), one
// changed coefficient (amplitude match), a non-real number (sign), planted Math and generator calls (source scan).

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { type Ninth, ONE, ZERO, add, equals, mul, ninth, sub, zetaPower } from '@/code/algebra/ninth-field'
import { compareReal, realSign } from '@/code/algebra/ninth-real-sign'
import { scanSource } from '@/code/check/determinism'
import {
  dockOccupation,
  hopDistances,
  isUnitState,
  lightConeExcess,
  overlap,
  returnProbability,
  spreadingMoments,
  supportRadius,
  totalWeight,
  weightOf,
  chargeCensus,
} from '@/code/measure/quantum-lab-measures'
import {
  type BeatState,
  type LayerOp,
  type Vibe,
  type Z9,
  BEAT_LAYERS,
  OPPOSITE_SLOT,
  applyBeat,
  applyBeatInverse,
  applyOppositeSignBounce,
  applyStream,
  basisKet,
  countStateDiffs,
  decodeConfig,
  dockCenterKey,
  encodeConfig,
  hasExactUnitNorm,
  mapConfigurations,
  scaleZ9,
  universeReport,
} from '@/code/rule/bare-beat'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const SCRIPT = 'test/universe.ts'
const NEW_MODULES = [
  'code/rule/bare-beat.ts',
  'code/algebra/ninth-real-sign.ts',
  'code/measure/quantum-lab-measures.ts',
]
const MATH_CALL = /\bMath\s*\.\s*\w+/

type AnyState = { readonly amp: Map<string, readonly bigint[]>; readonly den: bigint }

// The script's own functions, from its unchanged source compiled in memory (it exports nothing and calls main() last).
type Reference = {
  main: () => void
  applyBeat: (s: AnyState) => AnyState
  applyBeatInverse: (s: AnyState) => AnyState
  basisKet: (v: readonly Vibe[]) => AnyState
  dockCenter: (dock: number) => string
}

function loadReference(): { ref: Reference; lines: string[] } {
  const source = readFileSync(resolve(BASE, SCRIPT), 'utf8')
  const calls = source.match(/^main\(\)\s*$/gm) ?? []

  if (calls.length !== 1) {
    throw new Error(`${SCRIPT}: expected one top-level main() call, found ${calls.length}`)
  }

  const stripped = source.replace(/^main\(\)\s*$/m, '')
  const js = ts.transpileModule(stripped, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  const lines: string[] = []
  const quietConsole = { log: (text: unknown) => lines.push(...String(text).split('\n')) }
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const factory = new Function(
    'console',
    'process',
    `${js}\nreturn { main, applyBeat, applyBeatInverse, basisKet, dockCenter: d => vecKeyQ2(matVecQ2(dockFrames[d], BASE_CENTER)) }`,
  ) as (c: typeof quietConsole, p: typeof process) => Reference
  const ref = factory(quietConsole, process)

  ref.main()

  return { ref, lines }
}

function scriptProcessLines(): string[] {
  const run = spawnSync(
    resolve(BASE, 'node_modules/.bin/tsx'),
    ['--tsconfig', resolve(BASE, 'tsconfig.json'), resolve(BASE, SCRIPT)],
    { encoding: 'utf8' },
  )

  if (run.status !== 0) {
    throw new Error(`${SCRIPT} exited ${run.status}: ${run.stderr}`)
  }

  return run.stdout.replace(/\n$/, '').split('\n')
}

// The report without its timing line, which must be the last and the only one that varies.
function untimed(lines: readonly string[]): string[] {
  const last = lines[lines.length - 1] ?? ''

  if (!/^ {2}elapsed\s+: \d+ ms {2}ALL CHECKS PASSED$/.test(last)) {
    throw new Error(`the script's last line is not its timing line: ${last}`)
  }

  return lines.slice(0, -1)
}

function canonical(state: AnyState, center: (dock: number) => string): string {
  const rows = [...state.amp].map(([key, z]) => {
    const name = decodeConfig(key)
      .map(([dock, slot, tone, role]) => `${center(dock)}:${slot}:${tone}:${role}`)
      .sort()
      .join(';')

    return `${name}=${z.join(',')}`
  })

  return `${state.den}|${rows.sort().join('\n')}`
}

const libCanonical = (s: BeatState): string => canonical(s, dockCenterKey)

// The script's seeds (its own main), each with the number of beats it runs.
function scriptSeeds(): { label: string; vibes: Vibe[]; beats: number }[] {
  const o = (slot: number): number => OPPOSITE_SLOT[slot]!
  const chiral: Vibe[] = [
    [0, 0, 1, 0],
    [0, 1, -1, 0],
    [0, 4, 1, 0],
    [0, 10, 1, 0],
  ]
  const x1: Vibe[] = [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 4, 1, 0],
    [0, 16, 1, 0],
  ]
  const e184: Vibe[] = [
    [0, 1, 1, 0],
    [0, o(0), 1, 0],
    [0, 4, 1, 0],
    [0, 10, 1, 0],
  ]

  return [
    { label: 'neutral mesh', vibes: [], beats: 1 },
    { label: '1-vibe', vibes: [[0, 0, 1, 0]], beats: 4 },
    { label: '2-vibe pair', vibes: [[0, 0, 1, 0], [0, o(0), 1, 0]], beats: 4 },
    { label: '2-vibe neutral', vibes: [[0, 0, 1, 0], [0, o(0), -1, 0]], beats: 2 },
    { label: '4-vibe chiral', vibes: chiral, beats: 1 },
    { label: '4-vibe X1', vibes: x1, beats: 1 },
    { label: 'pair line 4', vibes: [[0, 4, 1, 0], [0, o(4), 1, 0]], beats: 1 },
    { label: 'pair roles', vibes: [[0, 0, 1, 0], [0, o(0), 1, 1]], beats: 1 },
    { label: 'E-FND-0184 chiral', vibes: e184, beats: 1 },
  ]
}

const TONES = [1, -1] as const
const ROLES = [0, 1] as const

function oneExcitations(docks: readonly number[]): Vibe[][] {
  const out: Vibe[][] = []

  for (const dock of docks) {
    for (let slot = 0; slot < 24; slot++) {
      for (const tone of TONES) {
        for (const role of ROLES) {
          out.push([[dock, slot, tone, role]])
        }
      }
    }
  }

  return out
}

// every two-excitation basis state on distinct positions of the given docks, visited without building the list
function forEachPair(docks: readonly number[], visit: (vibes: Vibe[]) => void): void {
  const positions: [number, number][] = []

  for (const dock of docks) {
    for (let slot = 0; slot < 24; slot++) {
      positions.push([dock, slot])
    }
  }

  for (let i = 0; i < positions.length; i++) {
    const [d1, s1] = positions[i]!

    for (let j = i + 1; j < positions.length; j++) {
      const [d2, s2] = positions[j]!

      for (const t1 of TONES) {
        for (const t2 of TONES) {
          for (const r1 of ROLES) {
            for (const r2 of ROLES) {
              visit([
                [d1, s1, t1, r1],
                [d2, s2, t2, r2],
              ])
            }
          }
        }
      }
    }
  }
}

type Sweep = {
  states: number
  beats: number
  normFailures: number
  inverseFailures: number
  chargeFailures: number
  coneExcess: number
  mixing: number
}

const emptySweep = (beats: number): Sweep => ({
  states: 0,
  beats,
  normFailures: 0,
  inverseFailures: 0,
  chargeFailures: 0,
  coneExcess: 0,
  mixing: 0,
})

type Beat = (s: BeatState) => BeatState

// One start: T beats with norm, charge and cone read after each, then T inverse beats back to the start.
function sweepOne(
  sweep: Sweep,
  vibes: readonly Vibe[],
  beat: Beat = applyBeat,
  inverse: Beat = applyBeatInverse,
): BeatState {
  const start = basisKet(vibes)
  const startCharge = JSON.stringify(chargeCensus(start))

  let state = start

  for (let t = 0; t < sweep.beats; t++) {
    const next = beat(state)

    if (!hasExactUnitNorm(next)) {
      sweep.normFailures++
    }

    if (JSON.stringify(chargeCensus(next)) !== startCharge) {
      sweep.chargeFailures++
    }

    sweep.coneExcess += lightConeExcess(state, next)

    if (t === 0 && next.amp.size >= 2) {
      sweep.mixing++
    }

    state = next
  }

  let back = state

  for (let t = 0; t < sweep.beats; t++) {
    back = inverse(back)
  }

  if (countStateDiffs(back, start) !== 0 || back.den !== start.den) {
    sweep.inverseFailures++
  }

  sweep.states++

  return state
}

const sweepOk = (s: Sweep): boolean =>
  s.states > 0 && s.normFailures === 0 && s.inverseFailures === 0 && s.chargeFailures === 0 && s.coneExcess === 0

const digest = (text: string): string => createHash('sha256').update(text).digest('hex')

// ---------------------------------------------------------------- the certified sign

const realOf = (a: number, b: number, e: number): Ninth => {
  // a + b c + e c^2 with c = zeta + zeta^8
  const c = add(zetaPower(1), zetaPower(8))

  return add(add(ninth([a]), mul(ninth([b]), c)), mul(ninth([e]), mul(c, c)))
}

function signChecks(): { failures: string[]; battery: number; nonRealRejected: boolean } {
  const failures: string[] = []
  const C = (k: number): Ninth => add(zetaPower(k), zetaPower(9 - k))
  const c = C(1)

  const expect = (label: string, got: number, want: number): void => {
    if (got !== want) {
      failures.push(`${label}: ${got} not ${want}`)
    }
  }

  // 2 cos 40 deg = 1.53208..., 2 cos 80 deg = 0.34729..., 2 cos 160 deg = -1.87938...
  expect('c > 3/2', realSign(sub(c, ninth([3], 2))), 1)
  expect('c > 1.5320', compareReal(c, ninth([15320], 10000)), 1)
  expect('c < 1.5321', compareReal(c, ninth([15321], 10000)), -1)
  expect('C2 > 0.3472', compareReal(C(2), ninth([3472], 10000)), 1)
  expect('C2 < 0.3473', compareReal(C(2), ninth([3473], 10000)), -1)
  expect('C4 < -1.8793', compareReal(C(4), ninth([-18793], 10000)), -1)
  expect('C4 > -1.8794', compareReal(C(4), ninth([-18794], 10000)), 1)
  expect('C3 = -1', realSign(add(C(3), ONE)), 0)
  expect('C1 + C2 + C4 = 0', realSign(add(add(C(1), C(2)), C(4))), 0)
  expect('c^3 - 3c + 1 = 0', realSign(add(sub(mul(mul(c, c), c), mul(ninth([3]), c)), ONE)), 0)
  expect('zero', realSign(ZERO), 0)

  // sign(-x) = -sign(x) and sign(x y) = sign(x) sign(y) over a + b c + e c^2, a, b, e in -2..2
  const battery: Ninth[] = []

  for (let a = -2; a <= 2; a++) {
    for (let b = -2; b <= 2; b++) {
      for (let e = -2; e <= 2; e++) {
        battery.push(realOf(a, b, e))
      }
    }
  }

  const signs = battery.map(realSign)

  battery.forEach((x, i) => {
    if (realSign(sub(ZERO, x)) !== -signs[i]!) {
      failures.push(`negation ${i}`)
    }
  })

  for (let i = 0; i < battery.length; i += 3) {
    for (let j = 0; j < battery.length; j += 7) {
      if (realSign(mul(battery[i]!, battery[j]!)) !== signs[i]! * signs[j]!) {
        failures.push(`product ${i} ${j}`)
      }
    }
  }

  let nonRealRejected = false

  try {
    realSign(zetaPower(1))
  } catch {
    nonRealRejected = true
  }

  return { failures, battery: battery.length, nonRealRejected }
}

// ---------------------------------------------------------------- the lab

type Core = {
  serialized: string
  reportLines: string[]
  seedFailures: string[]
  seedStates: number
  seedMeasureFailures: string[]
  ballOne: Sweep
  ballTwo: Sweep
  baseDockPairs: Sweep
  baseDockMatches: number
  baseDockMismatches: number
  returnRows: string[]
}

function coreLab(ref: Reference): Core {
  const parts: string[] = []
  const reportLines = universeReport()

  parts.push(reportLines.join('\n'))

  // amplitudes on the script's seeds and the measures on them
  const seedFailures: string[] = []
  const seedMeasureFailures: string[] = []
  const returnRows: string[] = []
  // hop distances to radius 3 (8,857 docks); the radius-4 ball (162,033 docks) is not built, so moments stop at t = 3
  const distance = hopDistances(0, 3)

  let seedStates = 0

  for (const seed of scriptSeeds()) {
    let lib = basisKet(seed.vibes)
    let scr = ref.basisKet(seed.vibes)

    const start = lib

    for (let t = 1; t <= seed.beats; t++) {
      lib = applyBeat(lib)
      scr = ref.applyBeat(scr)
      seedStates++

      const a = libCanonical(lib)

      if (a !== canonical(scr, ref.dockCenter)) {
        seedFailures.push(`${seed.label} t=${t}`)
      }

      parts.push(a)

      // the measures
      const total = totalWeight(lib)
      const occupation = [...dockOccupation(lib).values()].reduce((s, w) => add(s, w), ZERO)
      const p = returnProbability(start, lib)

      if (!equals(total, ONE) || !isUnitState(lib)) {
        seedMeasureFailures.push(`${seed.label} t=${t} norm`)
      }

      if (!equals(occupation, ninth([seed.vibes.length]))) {
        seedMeasureFailures.push(`${seed.label} t=${t} occupation`)
      }

      if (realSign(p) < 0 || compareReal(p, ONE) > 0) {
        seedMeasureFailures.push(`${seed.label} t=${t} return probability`)
      }

      for (const z of lib.amp.values()) {
        const w = weightOf(z, lib.den)

        if (realSign(w) < 0 || compareReal(w, ONE) > 0) {
          seedMeasureFailures.push(`${seed.label} t=${t} weight`)
          break
        }
      }

      if (seed.vibes.length > 0 && t <= 3) {
        const m = spreadingMoments(lib, distance)

        returnRows.push(
          `${seed.label} t=${t}: return ${p.n.join(' ')}/${p.d}, radius ${supportRadius(lib, distance)}, hop mean ${m.hopFirst.n.join(' ')}/${m.hopFirst.d}, -2B mean ${m.cosh2First.n.join(' ')}/${m.cosh2First.d}`,
        )
      }
    }

    for (let t = seed.beats; t >= 1; t--) {
      lib = applyBeatInverse(lib)
      scr = ref.applyBeatInverse(scr)
      seedStates++

      if (libCanonical(lib) !== canonical(scr, ref.dockCenter)) {
        seedFailures.push(`${seed.label} back t=${t}`)
      }
    }

    if (countStateDiffs(lib, start) !== 0) {
      seedFailures.push(`${seed.label} not restored`)
    }

    if (!equals(overlap(start, lib), ONE)) {
      seedMeasureFailures.push(`${seed.label} overlap after return`)
    }
  }

  // every one-excitation and same-dock two-excitation state of the base dock against the script
  let baseDockMatches = 0
  let baseDockMismatches = 0

  const baseStarts: { vibes: Vibe[]; beats: number }[] = oneExcitations([0]).map(vibes => ({ vibes, beats: 3 }))

  forEachPair([0], vibes => baseStarts.push({ vibes, beats: 1 }))

  for (const { vibes, beats } of baseStarts) {
    let lib = basisKet(vibes)
    let scr = ref.basisKet(vibes)

    for (let t = 0; t < beats; t++) {
      lib = applyBeat(lib)
      scr = ref.applyBeat(scr)
    }

    const a = libCanonical(lib)

    if (a === canonical(scr, ref.dockCenter)) {
      baseDockMatches++
    } else {
      baseDockMismatches++
    }

    parts.push(digest(a))
  }

  // exhaustive sweeps
  const ball1 = [...hopDistances(0, 1).keys()]
  const ball2 = [...hopDistances(0, 2).keys()]
  const ballOne = emptySweep(4)

  for (const vibes of oneExcitations(ball1)) {
    parts.push(digest(libCanonical(sweepOne(ballOne, vibes))))
  }

  const ballTwo = emptySweep(1)

  for (const vibes of oneExcitations(ball2)) {
    sweepOne(ballTwo, vibes)
  }

  const baseDockPairs = emptySweep(3)

  forEachPair([0], vibes => {
    parts.push(digest(libCanonical(sweepOne(baseDockPairs, vibes))))
  })

  parts.push(JSON.stringify([ballOne, ballTwo, baseDockPairs]))

  return {
    serialized: parts.join('\n'),
    reportLines,
    seedFailures,
    seedStates,
    seedMeasureFailures,
    ballOne,
    ballTwo,
    baseDockPairs,
    baseDockMatches,
    baseDockMismatches,
    returnRows,
  }
}

// ---------------------------------------------------------------- negative controls

function controls(): Record<string, boolean> {
  const pair: Vibe[] = [
    [0, 0, 1, 0],
    [0, OPPOSITE_SLOT[0]!, 1, 0],
  ]
  const lone: Vibe[] = [[0, 0, 1, 0]]

  // a leak after the beat: the first configuration (in key order) is dropped whenever there are two or more
  const leaky: Beat = s => {
    const next = applyBeat(s)
    const keys = [...next.amp.keys()].sort()

    return mapConfigurations(next, (vibes, amp) => [
      vibes,
      keys.length >= 2 && encodeConfig(vibes) === keys[0] ? scaleZ9(0n, amp) : amp,
    ])
  }

  const normCaught = (() => {
    const sweep = emptySweep(2)

    sweepOne(sweep, pair, leaky)

    return sweep.normFailures > 0
  })()

  // the inverse layers in forward order
  const wrongInverse: Beat = s => BEAT_LAYERS.reduce((cur, layer: LayerOp) => layer(cur, true), s)
  const inverseCaught = (() => {
    const sweep = emptySweep(2)

    sweepOne(sweep, pair, applyBeat, wrongInverse)
    sweepOne(sweep, lone, applyBeat, wrongInverse)

    return sweep.inverseFailures > 0
  })()

  // a tone flip on the first excitation
  const flip: Beat = s =>
    mapConfigurations(applyBeat(s), (vibes, amp) => [
      vibes.map((v, i) => (i === 0 ? ([v[0], v[1], v[2] === 1 ? -1 : 1, v[3]] as const) : v)),
      amp,
    ])
  const chargeCaught = (() => {
    const sweep = emptySweep(1)

    sweepOne(sweep, lone, flip, s => s)

    return sweep.chargeFailures > 0
  })()

  // a doubled stream moves two hops per beat
  const doubled: Beat = s => applyStream(applyBeat(s), false)
  const coneCaught = (() => {
    const sweep = emptySweep(1)

    sweepOne(sweep, lone, doubled, s => applyBeatInverse(applyStream(s, true)))

    return sweep.coneExcess > 0
  })()

  // the permutation layers alone never mix a basis state
  const permutation: Beat = s => applyStream(applyOppositeSignBounce(s), false)
  const mixingRejected = (() => {
    const sweep = emptySweep(1)

    for (const vibes of oneExcitations([0])) {
      sweepOne(sweep, vibes, permutation, s => applyOppositeSignBounce(applyStream(s, true)))
    }

    forEachPair([0], vibes => {
      sweepOne(sweep, vibes, permutation, s => applyOppositeSignBounce(applyStream(s, true)))
    })

    return sweep.mixing === 0 && sweep.inverseFailures === 0
  })()

  // one changed coefficient
  const evolved = applyBeat(basisKet(pair))
  const [firstKey, firstAmp] = [...evolved.amp][0]!
  const bumped: Z9 = [firstAmp[0] + 1n, firstAmp[1], firstAmp[2], firstAmp[3], firstAmp[4], firstAmp[5]]
  const tampered: BeatState = {
    amp: new Map([...evolved.amp, [firstKey, bumped]]),
    den: evolved.den,
  }
  const tamperCaught = libCanonical(tampered) !== libCanonical(evolved)

  // planted calls the source scan must see
  const planted = `const x = Math.floor(2.5)\nconst y = Math${'.'}random()\nimport { makeRng } from '@/code/tool/${'rng'}'\n`
  const plantedLines = planted.split('\n').filter(line => MATH_CALL.test(line)).length
  const plantedGenerator = scanSource('planted.ts', planted).length

  return {
    normCaught,
    inverseCaught,
    chargeCaught,
    coneCaught,
    mixingRejected,
    tamperCaught,
    plantedMathCaught: plantedLines === 2,
    plantedGeneratorCaught: plantedGenerator > 0,
  }
}

function sourceFindings(): string[] {
  const out: string[] = []

  for (const file of NEW_MODULES) {
    const text = readFileSync(resolve(BASE, file), 'utf8')

    text.split('\n').forEach((line, i) => {
      if (!/^\s*\/\//.test(line) && MATH_CALL.test(line)) {
        out.push(`${file}:${i + 1} Math call`)
      }
    })

    for (const f of scanSource(file, text)) {
      out.push(`${f.file}:${f.line} ${f.kind}`)
    }
  }

  return out
}

export default experiment({
  id: 'computation/bare-beat-lab',
  code: 'E-CMP-0034',
  title:
    'the bare beat U as an exact library: the script universe.ts reproduced byte for byte, unitary, invertible, charge-conserving, one hop per beat, and mixing',
  category: 'computation',
  substrates: ['{3,4,3,4}'],
  depth: 'L2',
  paper: false,
  run() {
    const script = untimed(scriptProcessLines())
    const { ref, lines } = loadReference()
    const compiled = untimed(lines)
    const r = coreLab(ref)
    const again = coreLab(ref)
    const identicalBytes = r.serialized === again.serialized
    const reportMatchesProcess = r.reportLines.join('\n') === script.join('\n')
    const reportMatchesCompiled = r.reportLines.join('\n') === compiled.join('\n')

    // every two-excitation basis state of the radius-1 ball, one beat (run once: about 2.9 million starts)
    const ballOnePairs = emptySweep(1)

    forEachPair([...hopDistances(0, 1).keys()], vibes => {
      sweepOne(ballOnePairs, vibes)
    })

    const signs = signChecks()
    const control = controls()
    const findings = sourceFindings()
    const sweeps = { ballOne: r.ballOne, ballTwo: r.ballTwo, baseDockPairs: r.baseDockPairs, ballOnePairs }
    const sweepsOk = Object.values(sweeps).every(sweepOk)
    const mixes = r.ballOne.mixing > 0
    const controlsOk = Object.values(control).every(Boolean)
    const ok =
      reportMatchesProcess &&
      reportMatchesCompiled &&
      r.seedFailures.length === 0 &&
      r.seedMeasureFailures.length === 0 &&
      r.baseDockMismatches === 0 &&
      r.baseDockMatches > 0 &&
      sweepsOk &&
      mixes &&
      signs.failures.length === 0 &&
      signs.nonRealRejected &&
      identicalBytes &&
      findings.length === 0 &&
      controlsOk
    const failures = [
      ...(reportMatchesProcess ? [] : ['report differs from the script process']),
      ...(reportMatchesCompiled ? [] : ['report differs from the compiled script']),
      ...r.seedFailures.map(f => `amplitude ${f}`),
      ...r.seedMeasureFailures,
      ...(r.baseDockMismatches === 0 ? [] : [`${r.baseDockMismatches} base-dock states differ`]),
      ...Object.entries(sweeps)
        .filter(([, s]) => !sweepOk(s))
        .map(([name, s]) => `${name}: ${JSON.stringify(s)}`),
      ...(mixes ? [] : ['U did not mix']),
      ...signs.failures,
      ...(signs.nonRealRejected ? [] : ['non-real accepted']),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings,
      ...Object.entries(control)
        .filter(([, v]) => !v)
        .map(([k]) => `control ${k} failed`),
    ]

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the bare beat U, ported to a library, reproduces the script universe.ts byte for byte (report and amplitudes on its seeds and on every one- and same-dock two-excitation state of the base dock), keeps the norm exactly 1, is undone exactly by its inverse, conserves charge and moves the support at most one hop per beat on every one-excitation state of the radius-2 ball and every two-excitation state of the radius-1 ball, and mixes basis states',
      metrics: {
        reportLines: r.reportLines.length,
        reportMatchesProcess: reportMatchesProcess ? 1 : 0,
        reportMatchesCompiled: reportMatchesCompiled ? 1 : 0,
        seedStatesCompared: r.seedStates,
        seedMismatches: r.seedFailures.length,
        baseDockStatesCompared: r.baseDockMatches + r.baseDockMismatches,
        baseDockMismatches: r.baseDockMismatches,
        ballOneSingles: r.ballOne.states,
        ballTwoSingles: r.ballTwo.states,
        baseDockPairs: r.baseDockPairs.states,
        ballOnePairs: ballOnePairs.states,
        normFailures: Object.values(sweeps).reduce((s, x) => s + x.normFailures, 0),
        inverseFailures: Object.values(sweeps).reduce((s, x) => s + x.inverseFailures, 0),
        chargeFailures: Object.values(sweeps).reduce((s, x) => s + x.chargeFailures, 0),
        coneExcess: Object.values(sweeps).reduce((s, x) => s + x.coneExcess, 0),
        mixingSingles: r.ballOne.mixing,
        mixingPairs: ballOnePairs.mixing,
        signBattery: signs.battery,
        signFailures: signs.failures.length,
        identicalBytes: identicalBytes ? 1 : 0,
        sourceFindings: findings.length,
      },
      control: Object.fromEntries(Object.entries(control).map(([k, v]) => [k, v ? 1 : 0])),
      notes:
        `L2 infrastructure gate (Q0). Two runs compare everything but the 2.9 million-start pair sweep, which runs once. ${r.returnRows.slice(0, 4).join('; ')}. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
