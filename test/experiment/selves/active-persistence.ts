// The act-to-persist frontier of the observer chunk (E1's deeper half), tested honestly and found EMPTY. The
// old reading was that under a lethal pervasive decay the self walks to a plus-tone refuge and survives there.
// The June 2026 audit falsified that reading with a no-self control: a run with NO initial disk (refuge only)
// grows almost the same survivor beside the refuge (20 cells at x=6.75 vs the with-self 21 at x=7.24), so the
// survivor is charge shed by the clamped refuge, a halo, not a relocated self. This experiment commits that
// control, and adds provenance: every charge of the original disk carries a label through every hop, so we
// measure directly whether any of the self's own charge ever reaches the refuge. It never does. The original
// disk is extinct within about 30 beats, zero labeled charge ever enters the refuge strip, and zero labeled
// charge sits in the final survivor. So under the committed rule the self does NOT actively relocate, and
// active goal-directed persistence is not provided by the base rule. An honest measured negative with
// controls (like arrow-binds-but-seals), sharpening the agency frontier. Depth L2. Spec: note
// theory-v0.8.0/experiments/05-observer-and-inner-experience.md (E1, the act-to-persist frontier).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { activePersistence } from '@/code/coarse/active-persistence'

const L = 96
const beats = 700
const seed = 777

// the refuge halo (with or without a self) is near 13 to 21 cells hugging the refuge side, the no-refuge run
// leaves nothing, and the no-self control must reproduce the with-self survivor within these margins.
const HALO_MIN = 5
const DEAD_MAX = 3
const HALO_SIZE_MARGIN = 10
const HALO_X_MARGIN = 3

export default experiment({
  id: 'selves/active-persistence',
  code: 'E-SLF-0002',
  title:
    'the apparent refuge relocation is a refuge halo, the self dies where it is and none of its charge ever reaches the refuge, an honest negative',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const left = activePersistence({ L, beats, seed, refuge: 'left' })
    const right = activePersistence({ L, beats, seed, refuge: 'right' })
    const none = activePersistence({ L, beats, seed, refuge: 'none' })

    // the decisive control, NO initial self, refuge only. If it reproduces the survivor, the survivor is
    // refuge-shed charge, not a relocated self.
    const noSelfLeft = activePersistence({
      L,
      beats,
      seed,
      refuge: 'left',
      withSelf: false,
    })

    const noSelfRight = activePersistence({
      L,
      beats,
      seed,
      refuge: 'right',
      withSelf: false,
    })

    // a survivor appears beside the refuge on either side, and nothing survives with no refuge
    const haloAppears =
      left.survivingSize > HALO_MIN && right.survivingSize > HALO_MIN

    const nothingWithoutRefuge = none.survivingSize < DEAD_MAX

    // the no-self control reproduces the survivor (size and place), so the survivor is the refuge halo
    const haloReproducedWithoutSelf =
      Math.abs(noSelfLeft.survivingSize - left.survivingSize) <=
        HALO_SIZE_MARGIN &&
      Math.abs(noSelfLeft.finalX - left.finalX) <= HALO_X_MARGIN &&
      Math.abs(noSelfRight.survivingSize - right.survivingSize) <=
        HALO_SIZE_MARGIN &&
      Math.abs(noSelfRight.finalX - right.finalX) <= HALO_X_MARGIN

    // provenance, none of the ORIGINAL disk charge ever enters the refuge, none sits in the survivor, and the
    // original support goes extinct early, so the self did not relocate, it died in place
    const selfNeverReachesRefuge =
      left.originalInRefugeEver === 0 &&
      right.originalInRefugeEver === 0 &&
      left.originalInSurvivor === 0 &&
      right.originalInSurvivor === 0 &&
      left.originalRemaining === 0 &&
      right.originalRemaining === 0

    const selfDiesEarly =
      left.originalExtinctionBeat > 0 &&
      left.originalExtinctionBeat < 100 &&
      right.originalExtinctionBeat > 0 &&
      right.originalExtinctionBeat < 100

    const ok =
      haloAppears &&
      nothingWithoutRefuge &&
      haloReproducedWithoutSelf &&
      selfNeverReachesRefuge &&
      selfDiesEarly

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under the committed rule the self does NOT actively relocate to the refuge, the apparent relocation is a refuge halo artifact, a no-self run (refuge only, no initial disk) reproduces the survivor beside the refuge, provenance labels show zero original-disk charge ever enters the refuge or the survivor and the disk is extinct within about 30 beats, so active goal-directed persistence is not provided by the base rule, an honest negative that sharpens the agency frontier',
      metrics: {
        leftSurvivingSize: left.survivingSize,
        leftFinalX: left.finalX,
        rightSurvivingSize: right.survivingSize,
        rightFinalX: right.finalX,
        leftOriginalInRefugeEver: left.originalInRefugeEver,
        rightOriginalInRefugeEver: right.originalInRefugeEver,
        leftOriginalInSurvivor: left.originalInSurvivor,
        rightOriginalInSurvivor: right.originalInSurvivor,
        leftOriginalExtinctionBeat: left.originalExtinctionBeat,
        rightOriginalExtinctionBeat: right.originalExtinctionBeat,
        originalCharge: left.originalCharge,
      },
      control: {
        noRefugeSurvivingSize: none.survivingSize,
        noSelfLeftSurvivingSize: noSelfLeft.survivingSize,
        noSelfLeftFinalX: noSelfLeft.finalX,
        noSelfRightSurvivingSize: noSelfRight.survivingSize,
        noSelfRightFinalX: noSelfRight.finalX,
      },
      notes:
        'the old positive reading (a directed journey to whichever side the refuge is on) was a misattribution, the June 2026 audit no-self control reproduces the survivor almost exactly (no-self 20 cells at x=6.75 vs with-self 21 at x=7.24 on the left), and the committed provenance labels confirm it, the original disk charge decays to zero within about 30 beats without ever touching the refuge strip, so the survivor is charge shed by the clamped refuge. A measured negative with controls, like arrow-binds-but-seals',
    })
  },
})
