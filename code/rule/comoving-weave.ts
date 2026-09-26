// The comoving fear beat in the color mode, for E-SPN-0063 and E-SPN-0066: the model's fear beat (code/rule/fear-weave
// advanceWhole with a color input, frames on) with every meeting read in the two tokens' OWN frames.
//
// E-SPN-0062 built the change for the grain mode's like meetings: U' = T (SWAP U) T^dagger, T the displacements
// to the two tokens' own role points, so the meeting kernel is the model's kernel with both coordinates
// translated (fear-weave translatedKernel). E-SPN-0063 made the same change to the law the knit runs, the color
// mode: the swap phase where like vibes meet and the singlet phase (a fear's coordinate stored at the reflected
// point) where a love meets a fear, with E-QTM-0123's frame tracking.
//
// ADOPTED 2026-09-26. The user made the comoving beat the knit's fear beat, so the law now lives in fear-weave
// advanceWhole itself (on by default, `comoving: false` the fixed-frame control) and this module is a thin use of
// it: one implementation, not two. What it adds is a whole type whose own points are always present, and the
// fermion-number reading.
//
// THE OWN POINT. Each coordinate of the whole carries one role point, in the PHASE index the weights use, stored
// beside the weights as `own`. It starts at the origin (a whole built from role basis states is centered there).
// It moves exactly as its coordinate's weights move: a crossing through grid move g moves it by g, and a frame
// rewrite (the coordinate reflected because its token changed sign between meetings) reflects it. So it is a
// function of the classical record alone and never of the weights, and the knit already carries it at the dock
// (a closed token's classical role point is moved by the same table).
//
// THE MEETING. With the two coordinates in kernel order (love first at a love-fear meeting), their own points
// pa and pb, the kernel K (4 K or 3 K in whole numbers) is replaced by K'(x, y; x0, y0) = K(x - pa, y - pb;
// x0 - pa, y0 - pb). Translating a coordinate is conjugating it by a displacement, a Clifford move, so K' is
// still an integer table with the same divisor, still unital and weight-keeping, and its inverse is the inverse
// kernel translated the same way. Every kernel of the color law commutes with the translations acting on both
// coordinates together (checked on all 9 diagonal pairs, tmp/adopt-probe-diagonal.ts), so K' depends only on
// pa - pb, and equals K wherever the two points coincide.
//
// With `comoving: false` this is advanceWhole's color mode before the adoption exactly (the control), weight for
// weight.
//
// Exact (BigInt weights), deterministic, no random numbers.

import { type ColorWeave } from '@/code/rule/color-weave'
import { advanceWhole, type BeatRecord, type FearKernels, type Whole } from '@/code/rule/fear-weave'

export type ComovingWhole = Whole & {
  // each coordinate's own role point, phase index 3 a + b
  readonly own: readonly number[]
}

// a whole with every own point at the origin, or at the given points
export function comovingOf(whole: Whole, own?: readonly number[]): ComovingWhole {
  return { ...whole, own: own ? [...own] : new Array<number>(whole.tokens.length).fill(0) }
}

// one beat's record applied to a comoving whole: advanceWhole's color mode with frames on, the kernels read about
// the own points when `comoving` is true
export function advanceComoving(input: {
  weave: ColorWeave
  whole: ComovingWhole
  record: BeatRecord
  color: FearKernels
  fixed: boolean
  forward: boolean
  comoving: boolean
}): ComovingWhole | null {
  const { weave, whole, record, color, fixed, forward, comoving } = input

  return advanceWhole({ weave, whole, record, kernel4: [], color, fixed, forward, comoving }) as ComovingWhole | null
}

// each coordinate's own number, the marginal weight at its own point (the spinor number is (1 + 3 m / units) / 2
// in the frame the coordinate is written in), and the units
export function ownMarginals(whole: ComovingWhole): { units: bigint; own: bigint[] } {
  const k = whole.tokens.length
  const units = whole.weight.reduce((a, b) => a + b, 0n)
  const own = Array.from({ length: k }, () => 0n)

  whole.weight.forEach((w, i) => {
    for (let c = 0; c < k; c++) {
      const digit = Math.floor(i / 9 ** (k - 1 - c)) % 9

      if (digit === (whole.own[c] ?? 0)) {
        own[c] = (own[c] ?? 0n) + w
      }
    }
  })

  return { units, own }
}
