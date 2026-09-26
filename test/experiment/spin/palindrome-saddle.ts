// E-SPN-0053's claim "every palindrome has a saddle for its particle band", tested past the family it was read
// from. (A STAND-IN instrument: code/rule/spinor-token.)
//
// E-SPN-0053's header says: of the schedules probed with three axis beats and whole excursion pairs, every
// palindrome has a saddle for its particle band and every non-palindrome an isotropic spin-averaged bowl. The probe
// behind it (tmp/probe-token2.ts) ran one family, x y z P^a z y x P^b and x y z P^a with P the depth pair (up, down)
// and a, b in 0, 1, 2. Two later readings disagree with the claim read broadly: x, y, y, x in the plane is a
// massive bowl (E-FRC-0176's control, g = 1), and E-MTR-0017's 16-beat nested palindrome z P x P y P y P x P z is a
// massive bowl in every plane with g = 2.
//
// PREDICTIONS, written before any run.
// P1 x, y, y, x (plane, E-MTR-0016's second-order band) is a massive bowl with g = 1 to 1e-9.
// P2 On E-SPN-0053's own family the claim holds: every massive palindrome x y z P^a z y x P^b (a, b in 0, 1, 2) is a
//    3D saddle, and every massive x y z P^a a 3D bowl.
// P3 Read broadly it fails: over 3D words in the letters x, y, z, P that contain all three axes, some massive
//    palindrome is a 3D bowl (the nested palindrome among them), and some massive planar palindrome over x, y, -
//    is a bowl.
// P4 (a hypothesis for the corrected claim) a massive 3D word is a 3D bowl exactly when each of its three planar
//    reductions is a second-order bowl (E-MTR-0016's test, the third axis's beats read as the coin alone);
//    reported as the count of words where the two tests agree.
//
// Gates, fixed before the first run:
// G1 P1 holds
// G2 P2 holds on the family (all 9 palindromes and 3 non-palindromes that are massive)
// G3 the claim read broadly is refuted: at least one massive 3D palindrome of up to 9 letters is a 3D bowl, the
//    nested palindrome is one, and at least one massive planar palindrome of length up to 8 is a bowl
// G4 P4 agrees on every massive 3D word enumerated (all words up to 6 letters, palindromes up to 9)
//
// 3D bowl: the spin-averaged particle band's Hessian at k = 0 is definite (Sylvester's leading minors); saddle:
// indefinite; flat: a minor under 1e-8 of its scale. Massive: rest gap over 1e-9.
//
// Depth L1: an enumeration against a stated claim.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { tokenG, type TokenStep } from '@/code/measure/token-g-analytic'
import { type Step } from '@/code/rule/spinor-token'
import { bandHessian, restGap } from '@/code/measure/token-gates'

const MODEL_COIN = Math.PI / 3
type Letter = 'x' | 'y' | 'z' | 'P'
type Shape = 'bowl' | 'saddle' | 'flat' | 'massless'

const stepsOf = (word: readonly Letter[]): Step[] => word.flatMap((l): Step[] => (l === 'P' ? ['up', 'down'] : [l]))
const isPalindrome = <T,>(w: readonly T[]): boolean => w.every((l, i) => l === w[w.length - 1 - i])

function shape3(word: readonly Letter[]): Shape {
  const steps = stepsOf(word)

  if (restGap(steps, 'locked') < 1e-9) {
    return 'massless'
  }

  const h = bandHessian(steps, 'locked')
  const a = h[0]?.[0] ?? 0
  const scale = Math.max(...[0, 1, 2].map(i => Math.abs(h[i]?.[i] ?? 0)), 1e-12)
  const d2 = a * (h[1]?.[1] ?? 0) - (h[0]?.[1] ?? 0) ** 2
  const d3 =
    a * ((h[1]?.[1] ?? 0) * (h[2]?.[2] ?? 0) - (h[1]?.[2] ?? 0) ** 2) -
    (h[0]?.[1] ?? 0) * ((h[0]?.[1] ?? 0) * (h[2]?.[2] ?? 0) - (h[1]?.[2] ?? 0) * (h[0]?.[2] ?? 0)) +
    (h[0]?.[2] ?? 0) * ((h[0]?.[1] ?? 0) * (h[1]?.[2] ?? 0) - (h[1]?.[1] ?? 0) * (h[0]?.[2] ?? 0))

  if (Math.abs(a) < 1e-8 * scale || Math.abs(d2) < 1e-8 * scale ** 2 || Math.abs(d3) < 1e-8 * scale ** 3) {
    return 'flat'
  }

  return d2 > 0 && Math.sign(d3) === Math.sign(a) ? 'bowl' : 'saddle'
}

// the planar test in each of the three planes: the pair of axes as the chain's x, y, everything else the coin
const PLANES = [
  ['x', 'y'],
  ['y', 'z'],
  ['z', 'x'],
] as const

function planarBowls(word: readonly Letter[]): boolean {
  const steps = stepsOf(word)

  return PLANES.every(([a, b]) => tokenG({ schedule: steps.map((s): TokenStep => ({ axis: s === a ? 'x' : s === b ? 'y' : 'none' })), mu: MODEL_COIN }).bowl)
}

function wordsOf(length: number, letters: readonly Letter[]): Letter[][] {
  const out: Letter[][] = []

  for (let code = 0; code < letters.length ** length; code++) {
    out.push(Array.from({ length }, (_, k) => letters[Math.floor(code / letters.length ** k) % letters.length] ?? 'P'))
  }

  return out
}

function palindromesOf(length: number, letters: readonly Letter[]): Letter[][] {
  const half = Math.ceil(length / 2)

  return wordsOf(half, letters).map(h => [...h, ...h.slice(0, length - half).reverse()])
}

export default experiment({
  id: 'spin/palindrome-saddle',
  code: 'E-SPN-0065',
  title:
    'E-SPN-0053\'s "every palindrome has a saddle" tested past its family, a STAND-IN instrument: it holds on the family x y z P^a z y x P^b it was read from, and fails read broadly, since the 16-beat nested palindrome is a massive 3D bowl and x, y, y, x a planar bowl with g = 1; palindromes are bowls and saddles alike (85 and 240 in 3D), and the hypothesis that a 3D bowl is a bowl in every plane is refuted',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // G1
    const xyyx = tokenG({ schedule: [{ axis: 'x' }, { axis: 'y' }, { axis: 'y' }, { axis: 'x' }], mu: MODEL_COIN })
    const g1 = xyyx.bowl && Math.abs(xyyx.restGap) > 1e-9 && Math.abs(xyyx.g - 1) < 1e-9

    // G2: E-SPN-0053's family
    const family: { word: Letter[]; palindrome: boolean; shape: Shape }[] = []

    for (const a of [0, 1, 2]) {
      for (const b of [0, 1, 2]) {
        const pal: Letter[] = ['x', 'y', 'z', ...Array<Letter>(a).fill('P'), 'z', 'y', 'x', ...Array<Letter>(b).fill('P')]

        family.push({ word: pal, palindrome: true, shape: shape3(pal) })
      }

      const non: Letter[] = ['x', 'y', 'z', ...Array<Letter>(a).fill('P')]

      family.push({ word: non, palindrome: false, shape: shape3(non) })
    }

    const massiveFamily = family.filter(f => f.shape !== 'massless')
    const g2 = massiveFamily.length > 0 && massiveFamily.every(f => (f.palindrome ? f.shape === 'saddle' : f.shape === 'bowl'))

    // G3, G4: the 3D enumeration
    const letters: Letter[] = ['x', 'y', 'z', 'P']
    const seen = new Set<string>()
    const tally = { palindrome: { bowl: 0, saddle: 0, flat: 0, massless: 0 }, other: { bowl: 0, saddle: 0, flat: 0, massless: 0 } }
    let agree = 0
    let disagree = 0
    let massiveWords = 0
    const bowlPalindromes: string[] = []
    const disagreements: string[] = []
    const consider = (word: Letter[]): void => {
      const key = word.join('')

      if (seen.has(key) || !(['x', 'y', 'z'] as const).every(a => word.includes(a))) {
        return
      }

      seen.add(key)

      const s = shape3(word)
      const pal = isPalindrome(word)

      tally[pal ? 'palindrome' : 'other'][s]++

      if (s === 'massless' || s === 'flat') {
        return
      }

      massiveWords++

      if (pal && s === 'bowl' && bowlPalindromes.length < 12) {
        bowlPalindromes.push(key)
      }

      const planar = planarBowls(word)

      if (planar === (s === 'bowl')) {
        agree++
      } else {
        disagree++

        if (disagreements.length < 12) {
          disagreements.push(`${key} (${s})`)
        }
      }
    }

    for (let length = 3; length <= 6; length++) {
      wordsOf(length, letters).forEach(consider)
    }

    for (let length = 7; length <= 9; length++) {
      palindromesOf(length, letters).forEach(consider)
    }

    const nested: Letter[] = ['z', 'P', 'x', 'P', 'y', 'P', 'y', 'P', 'x', 'P', 'z']
    const nestedShape = shape3(nested)

    consider(nested)

    // planar palindromes over x, y, -
    const planar = { bowl: 0, saddle: 0, massless: 0 }
    const planarBowlGs: string[] = []

    for (let length = 2; length <= 8; length++) {
      const half = Math.ceil(length / 2)

      for (let code = 0; code < 3 ** half; code++) {
        const h = Array.from({ length: half }, (_, k) => 'xy-'[Math.floor(code / 3 ** k) % 3] ?? '-')
        const word = [...h, ...h.slice(0, length - half).reverse()]

        if (!word.includes('x') || !word.includes('y')) {
          continue
        }

        const r = tokenG({ schedule: word.map((c): TokenStep => ({ axis: c === '-' ? 'none' : (c as 'x' | 'y') })), mu: MODEL_COIN })

        if (Math.abs(r.restGap) < 1e-9) {
          planar.massless++
        } else if (r.bowl) {
          planar.bowl++

          if (planarBowlGs.length < 12) {
            planarBowlGs.push(`${word.join('')} g ${r.g.toFixed(6)}`)
          }
        } else {
          planar.saddle++
        }
      }
    }

    const g3 = tally.palindrome.bowl > 0 && nestedShape === 'bowl' && planar.bowl > 0
    const g4 = massiveWords > 0 && disagree === 0
    const ok = g1 && g2 && g3 && g4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `x, y, y, x is a ${xyyx.bowl ? 'bowl' : 'saddle'} with g = ${xyyx.g.toFixed(9)}; on E-SPN-0053's family the massive palindromes are ${massiveFamily.filter(f => f.palindrome).map(f => f.shape).join(', ')} and the massive non-palindromes ${massiveFamily.filter(f => !f.palindrome).map(f => f.shape).join(', ')}; over ${seen.size} 3D words (all up to 6 letters, palindromes to 9, letters x, y, z and the depth pair P) the palindromes are ${tally.palindrome.bowl} bowls, ${tally.palindrome.saddle} saddles, ${tally.palindrome.flat} flat and ${tally.palindrome.massless} massless, the other words ${tally.other.bowl}, ${tally.other.saddle}, ${tally.other.flat} and ${tally.other.massless}; the nested palindrome is a ${nestedShape}; planar palindromes over x, y, - up to length 8: ${planar.bowl} bowls, ${planar.saddle} saddles, ${planar.massless} massless; the 3D shape is a bowl exactly when all three planes are second-order bowls on ${agree} of ${massiveWords} massive words`,
      metrics: {
        xyyxBowl: xyyx.bowl ? 1 : 0,
        xyyxG: xyyx.g,
        familyMassive: massiveFamily.length,
        familyPalindromeSaddles: massiveFamily.filter(f => f.palindrome && f.shape === 'saddle').length,
        familyPalindromes: massiveFamily.filter(f => f.palindrome).length,
        familyNonPalindromeBowls: massiveFamily.filter(f => !f.palindrome && f.shape === 'bowl').length,
        familyNonPalindromes: massiveFamily.filter(f => !f.palindrome).length,
        words3d: seen.size,
        palindromeBowls: tally.palindrome.bowl,
        palindromeSaddles: tally.palindrome.saddle,
        palindromeFlat: tally.palindrome.flat,
        palindromeMassless: tally.palindrome.massless,
        otherBowls: tally.other.bowl,
        otherSaddles: tally.other.saddle,
        otherFlat: tally.other.flat,
        otherMassless: tally.other.massless,
        nestedIsBowl: nestedShape === 'bowl' ? 1 : 0,
        planarPalindromeBowls: planar.bowl,
        planarPalindromeSaddles: planar.saddle,
        planarPalindromeMassless: planar.massless,
        planarTestAgrees: agree,
        planarTestDisagrees: disagree,
        massiveWords3d: massiveWords,
      },
      control: {},
      notes: `L1. Family shapes: ${family.map(f => `${f.word.join('')} ${f.shape}`).join(', ')}. Some 3D palindromic bowls: ${bowlPalindromes.join(', ') || 'none'}. Some planar palindromic bowls: ${planarBowlGs.join(', ') || 'none'}. Where the 3D shape and the three planar tests disagree: ${disagreements.join(', ') || 'nowhere'}. A 3D word's letters are x, y, z (one axis beat each) and P (the depth pair up, down, the coin twice with no net motion); a palindrome is read on the letters. First run, recorded: G1, G2 and G3 hold, G4 fails. The hypothesis P4 is refuted: on 750 of 2,029 massive words the spin-averaged 3D Hessian is definite while some plane is a second-order saddle in its spin sectors (x, y, z, x is one: a 3D bowl on average, a saddle in the y-z plane, E-SPN-0064), so the spin-averaged bowl is a weaker property than the per-sector planar one and the two tests are not the same question. No gate was moved.`,
    })
  },
})
