// Celestial holography seed, who lives on the celestial sphere: the substrate's
// real emergent dispersion puts exactly the massless excitations on the light
// cone, so only they reach the celestial sphere (null infinity), and this
// massless-versus-massive split is boost-invariant. This is the discrete seed of
// the fact that the celestial sphere carries the massless asymptotic data, the
// states a celestial amplitude is built from.
//
// From the coined (Dirac) quantum walk the dispersion is cos(omega) = cos(m)
// cos(k). Its maximum group speed is:
//   m = 0 (massless): max |d omega / d k| = 1, the excitation reaches the light
//     cone, its asymptotic direction is a point on the celestial sphere,
//   m > 0 (massive): max |d omega / d k| = cos(m) < 1 strictly, the excitation is
//     subluminal, its asymptotic data sits at timelike infinity inside the
//     velocity ball, never on the celestial sphere. The gap below light speed is
//     exactly 1 - cos(m).
// The split is boost-invariant because relativistic velocity addition keeps a
// light-speed velocity at light speed in every frame and keeps every subluminal
// velocity strictly subluminal. So the celestial sphere is the massless
// asymptotic boundary in every frame, and the massless direction that lands on it
// moves by the conformal map measured in E-HLG-0030.
//
// The control is Galilean (non-relativistic) velocity addition, which pushes a
// fast massive velocity past the light speed and knocks the massless velocity off
// the cone, so without the substrate's Lorentz-invariant dispersion the split
// would not be boost-invariant.
//
// Depth L2. This reproduces the known asymptotic split, massless at null infinity
// and massive at timelike infinity, from the substrate's own dispersion and
// velocity addition. It is the seed of the asymptotic states an emergent
// scattering matrix would carry, not that matrix itself.

import { coinedWalkDispersion } from '@/code/dynamics/quantum-walk'
import { groupVelocity1d } from '@/code/measure/group-speed'
import { addVelocities } from '@/code/measure/rapidity'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const MASSES = [0.2, 0.5, 1.0]
const FRAMES = [-0.9, -0.5, 0.3, 0.8]
const FAST_MASSIVE = [0.2, 0.6, 0.95]
const SAMPLES = 400

const omega = (k: number, m: number): number =>
  coinedWalkDispersion({ theta: m, k })

// the maximum group speed of the mass-m dispersion over the Brillouin zone
function maxGroupSpeed(m: number): number {
  let best = 0

  for (let i = 1; i < SAMPLES; i++) {
    const k = (i / SAMPLES) * (Math.PI - 1e-3) + 1e-3
    const v = Math.abs(
      groupVelocity1d({ omega: kk => omega(kk, m), k }),
    )

    if (Number.isFinite(v)) {
      best = Math.max(best, v)
    }
  }

  return best
}

export default experiment({
  id: 'holography/celestial-massless-boundary',
  code: 'E-HLG-0031',
  title:
    'the celestial sphere is the massless asymptotic boundary of the substrate, and the massless-versus-massive split is boost-invariant',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // massless excitations reach the light cone, so they populate the sphere
    const masslessMaxSpeed = maxGroupSpeed(0)
    const masslessOnCone = Math.abs(masslessMaxSpeed - 1)

    // massive excitations stay strictly subluminal, gap exactly 1 - cos(m)
    let massiveMaxSpeed = 0
    let massiveGapAnalyticResidual = 0

    for (const m of MASSES) {
      const speed = maxGroupSpeed(m)
      massiveMaxSpeed = Math.max(massiveMaxSpeed, speed)
      // the analytic anchor: the mass gap below light speed is 1 - cos(m)
      massiveGapAnalyticResidual = Math.max(
        massiveGapAnalyticResidual,
        Math.abs(speed - Math.cos(m)),
      )
    }

    const massGap = 1 - massiveMaxSpeed

    // boost-invariance under relativistic addition: massless stays on the cone,
    // massive stays strictly interior, in every frame
    let masslessBoostDev = 0
    let massiveBoostMax = 0

    for (const u of FRAMES) {
      masslessBoostDev = Math.max(
        masslessBoostDev,
        Math.abs(addVelocities({ velocity: 1, frame: u }) - 1),
      )

      for (const v of FAST_MASSIVE) {
        massiveBoostMax = Math.max(
          massiveBoostMax,
          Math.abs(addVelocities({ velocity: v, frame: u })),
        )
      }
    }

    // control: Galilean addition breaks the split, a fast massive velocity goes
    // superluminal and the massless velocity leaves the cone
    let galileanMasslessDev = 0
    let galileanMassiveOverLight = 0

    for (const u of FRAMES) {
      galileanMasslessDev = Math.max(
        galileanMasslessDev,
        Math.abs(1 + u - 1),
      )

      for (const v of FAST_MASSIVE) {
        galileanMassiveOverLight = Math.max(
          galileanMassiveOverLight,
          Math.abs(v + u),
        )
      }
    }

    const ok =
      masslessOnCone < 1e-6 &&
      massiveMaxSpeed < 1 - 1e-3 &&
      massiveGapAnalyticResidual < 1e-3 &&
      masslessBoostDev < 1e-12 &&
      massiveBoostMax < 1 &&
      galileanMassiveOverLight > 1 &&
      galileanMasslessDev > 1e-2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the substrate dispersion puts massless excitations on the light cone (max group speed one) and holds massive ones strictly subluminal (max group speed cos(m), gap 1 - cos(m)), and relativistic velocity addition keeps the split boost-invariant, so the celestial sphere carries exactly the massless asymptotic data in every frame',
      metrics: {
        masslessMaxSpeed,
        massiveMaxSpeed,
        massGap,
        massiveGapAnalyticResidual,
        masslessBoostDev,
        massiveBoostMax,
      },
      control: {
        galileanMassiveOverLight,
        galileanMasslessDev,
      },
    })
  },
})
