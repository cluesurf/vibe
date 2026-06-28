// A lossy, non-invertible collision, the negative control for reversibility and purification experiments. It
// erases the value in slot 0 of every cell, destroying information, so a forward-then-backward run cannot
// recover the start. A genuine (reversible) collision never erases, so this is the case that must FAIL any
// recoverability or purification test, which is what makes a passing result on the real knit mean something.

import { Collision } from '@/code/rule/collision'

export const erasingCollision: Collision = (slots, base) => {
  slots[base] = 0
}
