// The act-to-persist frontier of the observer chunk (E1's deeper half), a self ACTING to survive. Under a
// lethal pervasive decay that wipes out a self which stays put, a plus-tone refuge replenishes any charge that
// reaches it. The self's emergent approach-avoid mobility (the lean) carries it to the refuge, so it relocates
// to safety and persists. The agency is shown two ways, the self travels to WHICHEVER side the refuge is on
// (left or right, a directed journey of about forty cells from the centre, so it seeks safety rather than
// drifting one way), and survival requires the refuge (with none it dies). So the self acts, using its
// emergent agency, to persist. Depth L2, a measured survival-and-relocation with a no-refuge control and a
// left-versus-right directedness test. Spec: note theory-v0.8.0/experiments/05-observer-and-inner-experience.md
// (E1, the act-to-persist frontier).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { activePersistence } from '@/code/coarse/active-persistence'

const L = 96
const beats = 700
const seed = 777

// the self must survive at the refuge with at least this charge, die below this without one, and end up on
// the refuge's side (past these x marks, having started at the centre x=48). The measured survival is near 15
// to 21, death is 0, and the relocations are to x7 (left) and x88 (right).
const SURVIVE_MIN = 5
const DEAD_MAX = 3
const LEFT_OF = 25
const RIGHT_OF = 71

export default experiment({
  id: 'selves/active-persistence',
  code: 'E-SLF-0002',
  title:
    'a self relocates to whichever side a refuge is on and survives a lethal threat, dying with none',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const left = activePersistence({ L, beats, seed, refuge: 'left' })
    const right = activePersistence({ L, beats, seed, refuge: 'right' })
    const none = activePersistence({ L, beats, seed, refuge: 'none' })

    // it survives with a refuge on either side, dies with none, and it goes to the refuge's side (the directed
    // seeking, not a fixed drift), so the self acts to persist.
    const survives =
      left.survivingSize > SURVIVE_MIN &&
      right.survivingSize > SURVIVE_MIN

    const diesWithoutRefuge = none.survivingSize < DEAD_MAX
    const seeksRefuge = left.finalX < LEFT_OF && right.finalX > RIGHT_OF
    const ok = survives && diesWithoutRefuge && seeksRefuge

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under a lethal pervasive decay a self relocates to whichever side a plus-tone refuge is on, a directed journey from the centre, and survives there, while with no refuge it dies, so the self uses its emergent approach-avoid agency to act and persist',
      metrics: {
        leftSurvivingSize: left.survivingSize,
        leftFinalX: left.finalX,
        rightSurvivingSize: right.survivingSize,
        rightFinalX: right.finalX,
        noRefugeSurvivingSize: none.survivingSize,
      },
      control: { noRefugeSurvivingSize: none.survivingSize },
      notes:
        'the self starts at the centre (x=48), so reaching x<25 for a left refuge and x>71 for a right refuge is a directed move toward safety, not a fixed bias, and the no-refuge death shows agency only persists where there is somewhere to go',
    })
  },
})
