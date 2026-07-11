// The upper edge of the recordability window: a coherent record survives only below a Lyapunov
// ceiling. This closes the two-sided window the measurement octet left half-open, and it bridges
// James Lombardo's Timeless Dynamics, whose Hyperion derivation makes the SAME structural claim
// from continuous information geometry (coherent records persist only while the chaos rate stays
// below a threshold, lambda/omega < a bound), where vibe MEASURES the ceiling TD DERIVES.
//
// The octet already has the LOWER edge: the reversible rule cannot amplify a microstate into a
// macroscopic record (E-QTM-0084), and the arrow supplies the amplifier, a positive Lyapunov
// exponent (E-QTM-0085/0088). So forming a record NEEDS chaos (lambda > 0). This experiment adds the
// UPPER edge: too MUCH chaos scrambles a formed record. Sweeping the arrow on the flat layer (where
// records live, E-QTM-0089/0090) and measuring, at each arrow, both the fitted Lyapunov exponent and
// the surviving contrast of a seeded compact record:
//   1. HIGH LAMBDA WASHES THE RECORD OUT. At small arrow the Lyapunov exponent is high (about 0.5 to
//      0.6 per beat) and the record's contrast (its +density excess where it was seeded, over the
//      background) collapses to near zero: the chaos mixes the excess uniformly into the created-pair
//      sea. A held record cannot survive here.
//   2. LOW LAMBDA HOLDS IT (the anticorrelation, the reading that could have failed). At large arrow
//      the exponent is near zero (the flooding is dense but the two copies create identical pairs, so
//      there is little sensitive dependence) and the record's contrast survives (about 0.25): the rule
//      is busy but not chaotic, so it does not scramble the seeded excess away. Records survive only
//      where the Lyapunov exponent is below a ceiling.
//   3. THE ARROW-ZERO BASELINE (the no-chaos control). With no pair creation the blob simply diffuses,
//      contrast falls to zero by spreading, a distinct loss mode from the chaotic scrambling, and the
//      baseline that shows the flat lattice does not hold a density record on its own.
//
// So the same arrow (the value direction, the fifth base thing) that amplifies a microstate into a
// record past the LOWER edge also erases a coherent record past the UPPER edge, and records live in a
// window of the Lyapunov exponent. The contrast tracks lambda and not the flood level, because the
// arrow floods the region and the background EQUALLY (raising both the inside and outside density),
// so flooding alone cannot lower a contrast, only mixing the seeded excess away (the chaos) can.
// Grade L2: a measured dynamical property (record contrast anticorrelated with the Lyapunov exponent)
// with the arrow-zero baseline and robustness across two sizes, read as the TD Hyperion recordability
// threshold on the vibe substrate. It is the structural parallel that is the claim (a Lyapunov ceiling
// on record persistence), not a numerical match to TD's 0.235, which is a different system.

import { d4Mesh, meshCsr } from '@/code/tool/mesh'
import { edgesFromCsr } from '@/code/tool/graph'
import { perturbationLyapunovExponent } from '@/code/measure/lyapunov'
import { recordContrast } from '@/code/measure/record-persistence'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Csr = {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
}

const ARROW_SWEEP = [0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5]
const BEATS = 300
const RADIUS = 3

// per arrow, the fitted Lyapunov exponent (the chaos rate) and the surviving record contrast.
function sweep(
  csr: Csr,
): { arrow: number; lambda: number; contrast: number }[] {
  const { eu, ev } = edgesFromCsr(csr.offsets, csr.adj, csr.cellCount)
  const center = csr.cellCount >> 1

  return ARROW_SWEEP.map(arrow => {
    const lambda = perturbationLyapunovExponent({
      size: csr.cellCount,
      eu,
      ev,
      salt: 5,
      arrow,
    })

    const { contrast } = recordContrast({
      csr,
      center,
      radius: RADIUS,
      arrow,
      beats: BEATS,
    })

    return { arrow, lambda, contrast }
  })
}

export default experiment({
  id: 'quantum/lyapunov-recordability-ceiling',
  code: 'E-QTM-0092',
  title:
    'a coherent record survives only below a Lyapunov ceiling: sweeping the arrow on the flat layer, the record contrast collapses where the fitted Lyapunov exponent is high (small arrow, the chaos mixes the seeded excess away) and survives where it is near zero (large arrow, busy but non-chaotic), the upper edge of the recordability window that with the arrow-supplied amplifier (E-QTM-0084/0085/0088, the lower edge) mirrors the Timeless Dynamics Hyperion threshold where coherent records persist only below the chaos rate',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const sides = [10, 12]

    let worstHighLambdaContrast = 0
    let worstLowLambdaContrast = 1
    let worstBaseline = 0
    let worstSeparation = 1

    for (const side of sides) {
      const rows = sweep(meshCsr(d4Mesh({ side })))

      // the no-chaos baseline: arrow zero (no pair creation), the blob just diffuses
      const baseline = rows.find(r => r.arrow === 0)!.contrast
      worstBaseline = Math.max(worstBaseline, Math.abs(baseline))

      // high lambda (chaotic): the worst (largest) contrast among the strongly chaotic arrows,
      // which must still be small (the record is washed out)
      const highLambda = rows.filter(r => r.lambda > 0.2)
      const highLambdaContrast = Math.max(
        ...highLambda.map(r => r.contrast),
      )

      worstHighLambdaContrast = Math.max(
        worstHighLambdaContrast,
        highLambdaContrast,
      )

      // low lambda (non-chaotic, arrow on): the contrast at the least-chaotic arrow, which must be
      // large (the record survives)
      const lowLambda = rows
        .filter(r => r.arrow > 0 && r.lambda < 0.03)
        .sort((a, b) => a.lambda - b.lambda)

      const lowLambdaContrast = lowLambda[0]!.contrast

      worstLowLambdaContrast = Math.min(
        worstLowLambdaContrast,
        lowLambdaContrast,
      )

      worstSeparation = Math.min(
        worstSeparation,
        lowLambdaContrast - highLambdaContrast,
      )
    }

    // 1. high lambda washes the record out (contrast small where the rule is chaotic)
    const highLambdaWashesOut = worstHighLambdaContrast < 0.1

    // 2. low lambda holds it (contrast large where the rule is not chaotic)
    const lowLambdaHolds = worstLowLambdaContrast > 0.15

    // 3. the anticorrelation is clear (records survive below the Lyapunov ceiling, not above)
    const anticorrelated = worstSeparation > 0.1

    // 4. the arrow-zero baseline is a distinct no-chaos loss mode (near-zero contrast by diffusion)
    const baselineDiffuses = worstBaseline < 0.05

    const ok =
      highLambdaWashesOut &&
      lowLambdaHolds &&
      anticorrelated &&
      baselineDiffuses

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a coherent record survives only below a Lyapunov ceiling. Sweeping the arrow on the flat layer and measuring, per arrow, the fitted Lyapunov exponent and the surviving contrast of a seeded compact record: where the exponent is high (small arrow) the contrast collapses to near zero (the chaos mixes the seeded excess into the created-pair sea), and where the exponent is near zero (large arrow, busy but non-chaotic) the contrast survives, so the record contrast anticorrelates with the Lyapunov exponent, robust across two sizes, with the arrow-zero no-creation case (the blob diffuses) as the no-chaos baseline. This is the upper edge of the recordability window (the lower edge being the arrow-supplied amplifier E-QTM-0084/0085/0088, a microstate becomes a record only when the exponent is positive), and it mirrors the Timeless Dynamics Hyperion threshold, coherent records persisting only while the chaos rate stays below a bound, with vibe measuring the ceiling TD derives from geometry',
      metrics: {
        worstHighLambdaContrastTimes1000: Math.round(
          worstHighLambdaContrast * 1000,
        ),
        worstLowLambdaContrastTimes1000: Math.round(
          worstLowLambdaContrast * 1000,
        ),
        worstSeparationTimes1000: Math.round(worstSeparation * 1000),
        baselineContrastTimes1000: Math.round(worstBaseline * 1000),
      },
      control: {
        // the arrow-zero, no-pair-creation case is the no-chaos baseline: the blob diffuses and the
        // contrast falls to zero by spreading, a distinct loss mode from the chaotic scrambling, so a
        // held record needs the arrow's flooding AND a Lyapunov exponent below the ceiling. If the
        // high-lambda arrows had HELD the contrast, or the low-lambda arrow had lost it, the ceiling
        // claim would fail.
        baselineContrastTimes1000: Math.round(worstBaseline * 1000),
        worstHighLambdaContrastTimes1000: Math.round(
          worstHighLambdaContrast * 1000,
        ),
      },
      notes:
        'L2, measured on the flat D4 lattice (the emergent layer where records live, E-QTM-0089/0090), deterministic, no randomness. Per arrow: the Lyapunov exponent is the perturbation-growth fit (code/measure/lyapunov, the E-QTM-0088 measure), and the record contrast is the +density inside the seeded blob region minus outside after 300 beats (code/measure/record-persistence). High lambda (small arrow, about 0.5 to 0.6 per beat) gives contrast under about 0.05 (the record is scrambled), low lambda (large arrow, near zero) gives contrast about 0.25 (the record survives), robust across sizes 10 and 12. The contrast reads the chaos and not the flood level, because the arrow raises the inside and outside +density equally, so flooding alone cannot lower a contrast, only mixing the seeded excess away can. The arrow-zero baseline (no creation, pure diffusion) loses the contrast a different way and shows the flat lattice holds no density record on its own. This is the upper edge of the two-sided recordability window: the lower edge (a microstate is amplified into a record only when the Lyapunov exponent is positive) is E-QTM-0084/0085/0088. The bridge to Timeless Dynamics is STRUCTURAL, both frameworks make record persistence fail above a chaos threshold (TD derives lambda/omega < a bound for Hyperion from information geometry, vibe measures the ceiling on the substrate), not a numerical match to TD 0.235, which is a different system. That the same arrow both forms (lower edge) and erases (upper edge) a record is why a persistent definite record needs a self-maintained holder (E-QTM-0086/0090), the octet capstone.',
    })
  },
})
