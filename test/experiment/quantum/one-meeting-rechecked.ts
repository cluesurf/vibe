// The one-meeting theorem and the exact Tsirelson witness, rechecked against the corrected link convention
// (E-QTM-0124: every link now acts by the element sigma-links assigns it) and the comoving fear beat (adopted
// 2026-09-26).
//
// E-QTM-0131 proved: one swap phase on a product |a>|b> with overlap c = <a|b> gives Schmidt product
// (3/16)(1 - |c|^2)^2, so one like meeting is at most (3/4, 1/4, 0), CHSH sqrt 7. That is a statement about the
// meeting alone and should not see the link convention. E-QTM-0133 found Tsirelson's bound reached exactly
// by U (D2 x 1) U (D1 x 1) U |0>|t> and ran the witness through the model's kernels, with its link move matched
// against the grid tables in the transposed index (E-QTM-0131's convention A), which is the convention the fix
// retired. Both are rechecked here through fear-weave's own code as it now stands.
//
// THE LAWS, derived before this file's first run (the love-fear law after E-QTM-0140's first run had shown the
// color knot's e2 = 1/9, e3 = 1/729; disclosed):
//   like: U = P_sym + omega P_anti. U |a b> = ((1 + omega) |a b> + (1 - omega) |b a>) / 2 has rank 2 and
//     e2 = p1 p2 = (3/16)(1 - |c|^2)^2, e3 = 0 (E-QTM-0131). CHSH = 2 sqrt(1 + 4 e2) <= sqrt 7.
//   love-fear: V = 1 + (omega - 1) |Phi><Phi| on a love |a> and a fear |b>. Its coefficient matrix is
//     C = a b^T + lambda I with lambda = (omega - 1) gamma / sqrt 3, gamma = <Phi|a b> = b^T a / sqrt 3. In a
//     basis with a = e0, b = (s, t, 0): C = [[lambda + s, t, 0], [0, lambda, 0], [0, 0, lambda]], s = sqrt 3
//     gamma, so |lambda|^2 = |lambda + s|^2 = g = |gamma|^2 (because |omega + 2| = sqrt 3), and the reduced
//     density has e2 = g, e3 = g^3: characteristic polynomial (x - g)(x^2 - (1 - g) x + g^2), weights g and
//     ((1 - g) +- sqrt((1 - 3 g)(1 + g))) / 2. g <= 1/3, and at g = 1/3 the knot is maximally entangled,
//     CHSH (2 + 4 sqrt 2) / 3.
//   On stabilizer roles |c|^2 is 0, 1/3 or 1 and g is 0, 1/9 or 1/3, so one meeting of either kind has three
//   values: sqrt 7, 4 / sqrt 3, 2 (like) and (2 + 4 sqrt 2) / 3, (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9, 2
//   (love-fear).
//   The comoving beat conjugates the kernel by the displacements to the two own points: the law holds with the
//   overlap of the two TRANSLATED roles, so every product start and own pair is still bounded by it.
//   In the model's stored convention a fear's role sits at the reflected point, and g is the plain overlap
//   sum_p W_love(p) W_fear,stored(p) (the reflection turns <Phi|a b> into <a|b stored> / sqrt 3).
//
// THE COMOVING WORD. With own points p1 = D1(0) after the first link and p2 = D2(p1) after the second (the second
// token never moves), the comoving word is T(p2) U L2 U L1 U |0>|t> with L1 = T(-p1) D1 and L2 = T(-p2) D2 T(p1),
// both fixing the origin, and each (L1, L2) comes from 81 pairs (D1, D2). So under the comoving beat the three-
// meeting census is 81 times the census over the 24 origin-fixing links: the translation part of every link is
// read away by the meeting after it. Whether Tsirelson is still reached is then a question about 12 x 24 x 24
// words, answered here, not predicted.
//
// Gates, fixed before the first run:
//   G1 like, exact, through fear-weave: all 144 products of the 12 stabilizer roles, every one of the 81 own-point
//      pairs, both like kernels (the grain kernel meetingKernel(swapPhase(2 pi / 3)) and the color mode's
//      fearKernels like), one meetWhole each: E3 = 0 and 48 E2 = U^2 (3 - S)^2, S the translated overlap count
//      sum_x w_a(x + pa) w_b(x + pb) (so |c|^2 = S / 3); the largest CHSH is sqrt 7 and the values are exactly
//      {2, 4 / sqrt 3, sqrt 7} (by minimal polynomial).
//   G2 love-fear, exact, the same starts and own pairs through the color mode's unlike kernel (love first, the
//      fear stored reflected): 9 E2 = S U^2 and 729 E3 = S^3 U^3; the largest CHSH is (2 + 4 sqrt 2) / 3 and the
//      values are exactly three.
//   G3 general products, floating: 4,096 pairs of roles from a Kronecker stream (code/tool/weyl, start 140), one
//      swap phase and one singlet phase each on the operators fear-weave exports: both laws to 1e-12, no CHSH
//      above sqrt 7 or (2 + 4 sqrt 2) / 3 + 1e-12. And the love-fear CHSH as a function of g on 3,001 points of
//      [0, 1/3] is largest at g = 1/3.
//   G4 the links: phaseMove maps the 216 grid tables one to one onto the 216 Clifford point permutations.
//   G5 fixed-frame beat: the E-QTM-0133 census in exact words (12 starts, 216 x 216 links) finds 0 half-half
//      states at one and two meetings and 108 at three, and the witness, run through fear-weave's own
//      advanceWhole on synthetic records (two meetings, one crossing on the first token, a meeting), with its
//      link given as the model's grid move whose phaseMove is the witness's permutation, ends at Schmidt
//      (1/2, 1/2, 0) exactly (e3 = 0, 4 E2 = U^2) with comoving: false.
//   G6 comoving beat: the census computed word by word equals 81 times the origin-fixing census.
// Reported: the witness's link index now and in the transposed convention; whether the comoving census is
// above zero, and if so a comoving witness run through advanceWhole with comoving on.
// Status: pass if every gate holds.
//
// Depth L1: exact algebra of the meeting and an exhaustive census; the laws are theorems, checked.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearKernels,
  meetingKernel,
  meetWhole,
  phaseMove,
  singletPhase,
  swapPhase,
  translatedOf,
  twoRolePoints,
  type BeatRecord,
  type Whole,
} from '@/code/rule/fear-weave'
import { gridWeights, phasePointOperators, type Operator } from '@/code/measure/grid-weights'
import { chshNumber, exactReduced } from '@/code/measure/exact-schmidt'
import { applySwapPhase, eisValue, productState, schmidtInvariants, stabilizerStates, type State9 } from '@/code/measure/eisenstein-words'
import { applyOn, cliffordTable, phaseNegate } from '@/code/measure/clifford-words'
import { makeWeyl } from '@/code/tool/weyl'

const OMEGA = (2 * Math.PI) / 3
const SQRT7 = Math.sqrt(7)
const SINGLET_MAX = (2 + 4 * Math.SQRT2) / 3
const SAMPLES = 4096
const TOKENS = [4, 7]

function isHalfHalf(s: State9): boolean {
  const inv = schmidtInvariants(s)

  return inv.e3Num === 0n && 4n * inv.e2Num === inv.scale ** 4n
}

function vectorOf(s: { num: [number, number][]; scale: number }): { re: number[]; im: number[] } {
  const re: number[] = []
  const im: number[] = []

  s.num.forEach(x => {
    const [r, i] = eisValue(x, s.scale)

    re.push(r)
    im.push(i)
  })

  return { re, im }
}

// the whole of a state, weights times 9 rounded (exact for stabilizer products and the witness's start)
function wholeOf(s: State9): Whole {
  const w = gridWeights({ ...vectorOf({ num: s.num, scale: 2 ** s.k2 * 3 ** s.m3 }), points: twoRolePoints() })

  return { tokens: TOKENS, weight: w.map(x => BigInt(Math.round(9 * x))) }
}

// complex 3-vector helpers for the floating check
type C3 = { re: number[]; im: number[] }

function applyTwo(u: Operator, a: C3, b: C3): { re: number[]; im: number[] } {
  const inRe: number[] = []
  const inIm: number[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      inRe.push(a.re[i]! * b.re[j]! - a.im[i]! * b.im[j]!)
      inIm.push(a.re[i]! * b.im[j]! + a.im[i]! * b.re[j]!)
    }
  }

  const re = new Array<number>(9).fill(0)
  const im = new Array<number>(9).fill(0)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const ur = u.re[r * 9 + c] ?? 0
      const ui = u.im[r * 9 + c] ?? 0

      re[r] = re[r]! + ur * inRe[c]! - ui * inIm[c]!
      im[r] = im[r]! + ur * inIm[c]! + ui * inRe[c]!
    }
  }

  return { re, im }
}

// e2 and e3 of the first role's reduced density rho = C C^dagger
function invariants(psi: { re: number[]; im: number[] }): { e2: number; e3: number } {
  const rr: number[] = []
  const ri: number[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < 3; k++) {
        const ar = psi.re[3 * i + k]!
        const ai = psi.im[3 * i + k]!
        const br = psi.re[3 * j + k]!
        const bi = -psi.im[3 * j + k]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      rr.push(sr)
      ri.push(si)
    }
  }

  const at = (i: number, j: number): [number, number] => [rr[3 * i + j]!, ri[3 * i + j]!]
  const mul = (x: [number, number], y: [number, number]): [number, number] => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
  let e2 = 0

  for (const [i, j] of [
    [0, 1],
    [0, 2],
    [1, 2],
  ] as const) {
    e2 += mul(at(i, i), at(j, j))[0] - mul(at(i, j), at(j, i))[0]
  }

  let e3 = 0

  for (let c = 0; c < 3; c++) {
    const rows = [1, 2]
    const cols = [0, 1, 2].filter(x => x !== c)
    const minor = mul(at(rows[0]!, cols[0]!), at(rows[1]!, cols[1]!))
    const other = mul(at(rows[0]!, cols[1]!), at(rows[1]!, cols[0]!))
    const t = mul(at(0, c), [minor[0] - other[0], minor[1] - other[1]])

    e3 += (c % 2 === 0 ? 1 : -1) * t[0]
  }

  return { e2, e3 }
}

// the largest CHSH of a pure knot from its e2, e3 (E-QTM-0132's form)
function chshOf(e2: number, e3: number): number {
  const p = e2 - 1 / 3
  const q = -2 / 27 + e2 / 3 - e3
  const m = 2 * Math.sqrt(Math.max(0, -p / 3))
  const theta = m === 0 ? 0 : Math.acos(Math.max(-1, Math.min(1, (3 * q) / (p * m)))) / 3
  const w = [0, 1, 2].map(k => m * Math.cos(theta - (2 * Math.PI * k) / 3) + 1 / 3).sort((x, y) => y - x)

  return 2 * Math.sqrt((w[0]! + w[1]!) ** 2 + 4 * w[0]! * w[1]!) + 2 * w[2]!
}

export default experiment({
  id: 'quantum/one-meeting-rechecked',
  code: 'E-QTM-0141',
  title:
    'one meeting rechecked under the corrected links, fail on one clause: one like meeting on any product gives e2 = (3/16)(1 - |c|^2)^2, e3 = 0, at most sqrt 7 (E-QTM-0131 stands), and one love-fear meeting gives e2 = g, e3 = g^3 in its Phi-overlap g, both exact on every stabilizer start and own-point pair through fear-weave\'s kernels with three values each; but the love-fear maximum over all products is 2.6429 at g = 0.2940, not (2 + 4 sqrt 2) / 3 at the maximally entangled g = 1/3 as gated (still below sqrt 7); Tsirelson is still reached exactly, 108 words on the fixed-frame beat with the witness\'s link now at grid index 207 (126 in the transposed convention, which now gives CHSH 2), and 2,916 = 81 x 36 on the comoving beat, which reads the translation part of every link away',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const table = cliffordTable()
    const { group, perms, elementOf, translation } = table
    const stab = stabilizerStates(group)
    const single = phasePointOperators(1)
    // the twelve stabilizer roles' single weights times 3 (0 or 1 on a line)
    const roleWeights = stab.map(st => {
      const w = gridWeights({ ...vectorOf({ num: st.num, scale: 3 ** st.den3 }), points: single })

      return w.map(x => Math.round(3 * x))
    })
    const kGrain = meetingKernel(swapPhase(OMEGA)) ?? []
    const color = fearKernels({ like: OMEGA, unlike: OMEGA })!
    const plus = (p: number, v: number): number => 3 * ((Math.floor(p / 3) + Math.floor(v / 3)) % 3) + (((p % 3) + (v % 3)) % 3)

    // G1 and G2
    let likeChecks = 0
    let likeLaw = true
    let unlikeChecks = 0
    let unlikeLaw = true
    const likeValues = new Map<string, number>()
    const unlikeValues = new Map<string, number>()

    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        const wa = roleWeights[a]!
        const wb = roleWeights[b]!
        const start: Whole = { tokens: TOKENS, weight: Array.from({ length: 81 }, (_, i) => BigInt(wa[Math.floor(i / 9)]! * wb[i % 9]!)) }

        for (let pa = 0; pa < 9; pa++) {
          for (let pb = 0; pb < 9; pb++) {
            let s = 0

            for (let x = 0; x < 9; x++) {
              s += wa[plus(x, pa)]! * wb[plus(x, pb)]!
            }

            const S = BigInt(s)

            for (const kernel of [kGrain, color.like]) {
              const met = meetWhole({ whole: start, a: 0, b: 1, kernel4: translatedOf(kernel, pa, pb), fixed: false })!
              const r = exactReduced({ weight: met.weight, coordinate: 0, coordinates: 2 })
              const U = r.units

              likeChecks++
              likeLaw = likeLaw && r.pure && r.e3 === 0n && 48n * r.e2 === U * U * (3n - S) ** 2n

              const n = chshNumber(r)

              likeValues.set(n.minimalPolynomial.join(','), n.value)
            }

            const met = meetWhole({ whole: start, a: 0, b: 1, kernel4: translatedOf(color.unlike, pa, pb), fixed: false })!
            const r = exactReduced({ weight: met.weight, coordinate: 0, coordinates: 2 })
            const U = r.units

            unlikeChecks++
            unlikeLaw = unlikeLaw && r.pure && 9n * r.e2 === S * U * U && 729n * r.e3 === S ** 3n * U ** 3n

            const n = chshNumber(r)
            const key = n.minimalPolynomial.length > 0 ? n.minimalPolynomial.join(',') : `e2 ${r.e2 * 729n / (U * U)}/729`

            unlikeValues.set(key, n.value)
          }
        }
      }
    }

    const likeMax = Math.max(...likeValues.values())
    const unlikeMax = Math.max(...unlikeValues.values())
    const likeSet = [...likeValues.keys()].sort().join(' | ')
    const g1 = likeLaw && likeValues.size === 3 && likeValues.has('1,0,-7') && likeValues.has('3,0,-16') && likeValues.has('1,-2') && Math.abs(likeMax - SQRT7) < 1e-12
    const g2 = unlikeLaw && unlikeValues.size === 3 && unlikeValues.has('9,-12,-28') && unlikeValues.has('1,-2') && Math.abs(unlikeMax - SINGLET_MAX) < 1e-12

    // G3, general products from a Kronecker stream
    const weyl = makeWeyl({ start: 140 })
    const vec = (): C3 => {
      const re = [weyl.nextGaussian(), weyl.nextGaussian(), weyl.nextGaussian()]
      const im = [weyl.nextGaussian(), weyl.nextGaussian(), weyl.nextGaussian()]
      const n = Math.sqrt(re.reduce((s, x) => s + x * x, 0) + im.reduce((s, x) => s + x * x, 0))

      return { re: re.map(x => x / n), im: im.map(x => x / n) }
    }
    const uLike = swapPhase(OMEGA)
    const vSinglet = singletPhase(OMEGA)
    let likeGap = 0
    let unlikeGap = 0
    let likeFloatMax = 0
    let unlikeFloatMax = 0

    for (let k = 0; k < SAMPLES; k++) {
      const a = vec()
      const b = vec()
      // c = <a|b>, t = b^T a
      let cr = 0
      let ci = 0
      let tr = 0
      let ti = 0

      for (let j = 0; j < 3; j++) {
        cr += a.re[j]! * b.re[j]! + a.im[j]! * b.im[j]!
        ci += a.re[j]! * b.im[j]! - a.im[j]! * b.re[j]!
        tr += a.re[j]! * b.re[j]! - a.im[j]! * b.im[j]!
        ti += a.re[j]! * b.im[j]! + a.im[j]! * b.re[j]!
      }

      const c2 = cr * cr + ci * ci
      const g = (tr * tr + ti * ti) / 3
      const like = invariants(applyTwo(uLike, a, b))
      const unlike = invariants(applyTwo(vSinglet, a, b))

      likeGap = Math.max(likeGap, Math.abs(like.e2 - (3 / 16) * (1 - c2) ** 2), Math.abs(like.e3))
      unlikeGap = Math.max(unlikeGap, Math.abs(unlike.e2 - g), Math.abs(unlike.e3 - g ** 3))
      likeFloatMax = Math.max(likeFloatMax, chshOf(like.e2, like.e3))
      unlikeFloatMax = Math.max(unlikeFloatMax, chshOf(unlike.e2, unlike.e3))
    }

    let argmax = 0
    let best = 0

    for (let i = 0; i <= 3000; i++) {
      const g = i / 9000
      const v = chshOf(g, g ** 3)

      if (v > best) {
        best = v
        argmax = g
      }
    }

    // reported after the first run (G3 failed on its argmax clause): the love-fear maximum over g by golden
    // section on [0.2, 1/3], a unimodal stretch by the 3,001-point scan
    let lo = 0.2
    let hi = 1 / 3
    const phi = (Math.sqrt(5) - 1) / 2

    for (let i = 0; i < 200; i++) {
      const m1 = hi - phi * (hi - lo)
      const m2 = lo + phi * (hi - lo)

      if (chshOf(m1, m1 ** 3) < chshOf(m2, m2 ** 3)) {
        lo = m1
      } else {
        hi = m2
      }
    }

    const singletBestG = (lo + hi) / 2
    const singletBest = chshOf(singletBestG, singletBestG ** 3)
    const g3 =
      likeGap <= 1e-12 && unlikeGap <= 1e-12 && likeFloatMax <= SQRT7 + 1e-12 && unlikeFloatMax <= SINGLET_MAX + 1e-12 && Math.abs(argmax - 1 / 3) < 1e-12

    // G4
    const weave = makeColorWeave({ side: 3, table: 'pair' })
    const moves = weave.moves
    const linkPerm = moves.act.map(t => phaseMove(t))
    const linkIndex = linkPerm.map(p => table.indexOf(p))
    const g4 = linkIndex.length === 216 && linkIndex.every(i => i >= 0) && new Set(linkIndex).size === 216

    // the census, fixed frame and comoving
    const zero = stab.find(st => roleWeights[stab.indexOf(st)]!.join('') === '111000000') ?? stab[0]!
    const starts = stab.map(t => productState(zero, t))
    const T = Array.from({ length: 9 }, (_, v) => translation(v))
    const meetAbout = (s: State9, p: number): State9 => applyOn(0, T[p]!, applySwapPhase(applyOn(0, T[phaseNegate(p)]!, s)))
    let fixed1 = 0
    let fixed2 = 0
    let fixed3 = 0
    let moving3 = 0
    let witness: { t: number; d1: number; d2: number } | undefined
    let movingWitness: { t: number; d1: number; d2: number } | undefined
    const identity = perms.findIndex(p => p.every((x, k) => x === k))

    for (let t = 0; t < 12; t++) {
      const s1 = applySwapPhase(starts[t]!)

      fixed1 += isHalfHalf(s1) ? 1 : 0

      for (let i = 0; i < 216; i++) {
        const d1 = group[i]!
        const p1 = perms[i]![0]!
        const f2 = applySwapPhase(applyOn(0, d1, s1))
        const m2 = meetAbout(applyOn(0, d1, s1), p1)

        fixed2 += isHalfHalf(f2) ? 1 : 0

        for (let j = 0; j < 216; j++) {
          const d2 = group[j]!
          const p2 = perms[j]![p1]!

          if (isHalfHalf(applySwapPhase(applyOn(0, d2, f2)))) {
            fixed3++
            witness = witness ?? (i === identity ? { t, d1: i, d2: j } : undefined)
          }

          if (isHalfHalf(meetAbout(applyOn(0, d2, m2), p2))) {
            moving3++
            movingWitness = movingWitness ?? { t, d1: i, d2: j }
          }
        }
      }
    }

    // the origin-fixing census
    const originFixing = perms.map((p, i) => (p[0] === 0 ? i : -1)).filter(i => i >= 0)
    let fixedOrigin3 = 0

    for (let t = 0; t < 12; t++) {
      const s1 = applySwapPhase(starts[t]!)

      for (const i of originFixing) {
        const f2 = applySwapPhase(applyOn(0, group[i]!, s1))

        for (const j of originFixing) {
          fixedOrigin3 += isHalfHalf(applySwapPhase(applyOn(0, group[j]!, f2))) ? 1 : 0
        }
      }
    }

    const g6 = moving3 === 81 * fixedOrigin3

    // the witness through advanceWhole
    const kernels = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })!
    const meeting: BeatRecord = { meetings: [[4, 7]], crossings: [] }
    const runWord = (w: { t: number; d1: number; d2: number }, comoving: boolean): { half: boolean; pure: boolean; chsh: number } => {
      const g1Index = linkIndex.indexOf(w.d1)
      const g2Index = linkIndex.indexOf(w.d2)
      const records: BeatRecord[] = [
        meeting,
        ...(w.d1 === identity ? [] : [{ meetings: [], crossings: [[4, g1Index]] } as BeatRecord]),
        meeting,
        { meetings: [], crossings: [[4, g2Index]] },
        meeting,
      ]
      let whole = wholeOf(starts[w.t]!)

      for (const record of records) {
        whole = advanceWhole({ weave, whole, record, kernel4: kernels.like, fixed: false, forward: true, comoving })!
      }

      const r = exactReduced({ weight: whole.weight, coordinate: 0, coordinates: 2 })

      return { half: r.e3 === 0n && 4n * r.e2 === r.units * r.units, pure: r.pure, chsh: chshNumber(r).value }
    }
    const w = witness ?? { t: 0, d1: identity, d2: identity }
    const fixedRun = runWord(w, false)
    const g5 = fixed1 === 0 && fixed2 === 0 && fixed3 === 108 && witness !== undefined && fixedRun.half && fixedRun.pure
    // the witness's link in the model's index now, and in the transposed convention (the grid table equal to the
    // permutation read on the phase index directly)
    const witnessPerm = perms[w.d2]!
    const indexNow = linkIndex.indexOf(w.d2)
    const indexTransposed = moves.act.findIndex(t => Array.from(t).every((x, k) => x === witnessPerm[k]))
    const oldIndexNow = runWord({ ...w, d2: linkIndex[indexTransposed] ?? w.d2 }, false)
    const movingRun = movingWitness ? runWord(movingWitness, true) : undefined
    // the fixed-frame witness read on the comoving beat
    const witnessComoving = runWord(w, true)

    const gates = { G1: g1, G2: g2, G3: g3, G4: g4, G5: g5, G6: g6 }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the one-meeting laws hold exactly through fear-weave\'s kernels on every stabilizer start and own-point pair (23,328 like, 11,664 love-fear meetings): a like meeting gives e2 = (3/16)(1 - |c|^2)^2, e3 = 0, three values {2, 4 / sqrt 3, sqrt 7}, at most sqrt 7; a love-fear meeting gives e2 = g, e3 = g^3, three values {2, (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9, (2 + 4 sqrt 2) / 3}; both laws hold on 4,096 general products to 3e-16, where the love-fear value peaks at 2.6429 (g = 0.2940), above (2 + 4 sqrt 2) / 3 and below sqrt 7; the link fix is a relabeling of the 216 moves, so the fixed-frame census is unchanged (108 Tsirelson words at three meetings, none before) and the witness reaches (1/2, 1/2, 0) through advanceWhole with its link at grid index 207; on the comoving beat the census is 2,916 = 81 x 36, the 36 origin-fixing words, and the E-QTM-0133 witness survives it because its link fixes the origin',
      metrics: {
        likeChecks,
        likeLawExact: likeLaw ? 1 : 0,
        likeDistinctValues: likeValues.size,
        likeMax,
        unlikeChecks,
        unlikeLawExact: unlikeLaw ? 1 : 0,
        unlikeDistinctValues: unlikeValues.size,
        unlikeMax,
        generalLikeLawGap: likeGap,
        generalUnlikeLawGap: unlikeGap,
        generalLikeChshMax: likeFloatMax,
        generalUnlikeChshMax: unlikeFloatMax,
        singletChshArgmaxG: argmax,
        singletChshBestG: singletBestG,
        singletChshBest: singletBest,
        singletChshBestBelowSqrt7: SQRT7 - singletBest,
        linkPermutationsMatched: new Set(linkIndex.filter(i => i >= 0)).size,
        halfHalfOneMeeting: fixed1,
        halfHalfTwoMeetings: fixed2,
        halfHalfThreeMeetingsFixedFrame: fixed3,
        halfHalfThreeMeetingsComoving: moving3,
        halfHalfThreeMeetingsOriginFixing: fixedOrigin3,
        originFixingLinks: originFixing.length,
        witnessStart: w.t,
        witnessLinkIndexNow: indexNow,
        witnessLinkIndexTransposed: indexTransposed,
        witnessLinkMovesOrigin: witnessPerm[0] === 0 ? 0 : 1,
        witnessHalfHalfFixedFrame: fixedRun.half ? 1 : 0,
        witnessChshFixedFrame: fixedRun.chsh,
        oldIndexNowHalfHalf: oldIndexNow.half ? 1 : 0,
        oldIndexNowChsh: oldIndexNow.chsh,
        witnessHalfHalfComoving: witnessComoving.half ? 1 : 0,
        witnessChshComoving: witnessComoving.chsh,
        comovingWitnessFound: movingWitness ? 1 : 0,
        comovingWitnessHalfHalf: movingRun?.half ? 1 : 0,
        comovingWitnessChsh: movingRun?.chsh ?? -1,
        comovingWitnessStart: movingWitness?.t ?? -1,
        comovingWitnessFirstLink: movingWitness ? linkIndex.indexOf(movingWitness.d1) : -1,
        comovingWitnessSecondLink: movingWitness ? linkIndex.indexOf(movingWitness.d2) : -1,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes: `L1, exact apart from G3. FIRST RUN (2026-09-26, 12 s): status fail on G3 alone. G3's law clauses hold (both laws to 3e-16 on 4,096 Kronecker products) and so does the like bound, but its love-fear clauses were written on a wrong step in the header's derivation: a maximally entangled qutrit knot is NOT the CHSH maximum (E-QTM-0132's form favors two strong Schmidt weights), so the love-fear value peaks inside, 2.642898459 at g = 0.294007 (golden section, reported after the first run), with Schmidt weights 0.5484, 0.2940, 0.1576, above (2 + 4 sqrt 2) / 3 = 2.5523 and 0.00285 below sqrt 7. No gate was moved. So one meeting of either kind is at most sqrt 7 on any product (the like bound a theorem, the love-fear bound a one-variable maximization of an exact law, read numerically), and on the model's stabilizer starts each kind has exactly three values, the largest sqrt 7 and (2 + 4 sqrt 2) / 3. THE LINK FIX: phaseMove takes the 216 grid tables one to one onto the 216 Clifford point permutations, so the fix relabels which element each link is and cannot change what words of links can reach: the E-QTM-0133 census is the same, 0, 0 and 108 half-half states at one, two and three meetings. The witness |+> start (stabilizer 2), U U, one link on the first token, U, runs through fear-weave's own advanceWhole to Schmidt (1/2, 1/2, 0) exactly with its link at grid index 207; grid index 126, the one whose raw table equals the witness's permutation (E-QTM-0133's convention A, now retired), is a different element under the corrected code and gives CHSH 2. E-QTM-0133's own gates still pass (its G2 applies the permutation directly and its G5's table set is closed under the transpose), but its notes and G5's wording name the retired convention. THE COMOVING BEAT: each meeting conjugates by the displacements to the own points, and the word becomes T(p2) U L2 U L1 U |0>|t> with L1 and L2 fixing the origin, so the census is 81 times the census over the 24 origin-fixing links: 2,916 = 81 x 36 (G6). Tsirelson is still reached exactly on the adopted beat, by 36 origin-fixing words; the E-QTM-0133 witness is one of them (its link fixes the origin) and reaches (1/2, 1/2, 0) through advanceWhole with comoving on; the first word found in census order (links 54 then 214) does too. More words reach it on the comoving beat than on the fixed-frame one (2,916 against 108 of 559,872), because each origin-fixing word is reached from 81 link pairs, while every word that needed a link's translation part is lost. Like values by minimal polynomial: ${likeSet}. Love-fear values: ${[...unlikeValues.entries()].map(([k, v]) => `${k} (${v.toFixed(10)})`).join(' | ')}.`,
    })
  },
})
