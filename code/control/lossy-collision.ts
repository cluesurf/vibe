// A lossy, non-invertible collision, the negative control for reversibility and purification experiments. It
// erases the value in slot 0 of every cell, destroying information, so a forward-then-backward run cannot
// recover the start. A genuine (reversible) collision never erases, so this is the case that must FAIL any
// recoverability or purification test, which is what makes a passing result on the real knit mean something.

import { Collision } from '@/code/rule/collision'

export const erasingCollision: Collision = (slots, base) => {
  slots[base] = 0
}

// A ONE-SIGNED sink, the strict version of the control for any balance measured over a region. The
// erasing collision above removes whatever sits in slot 0, so the charge it destroys carries both signs
// and can cancel inside a large enough region, which lets a coarse balance read as satisfied even though
// the rule is lossy. This one removes positive tone only, so the destroyed charge has a definite sign
// and no region, at any scale, can have its violation cancelled away. Use it whenever a control must
// fail at EVERY coarse scale rather than merely at the finest one.
export const drainingCollision: Collision = (slots, base) => {
  if (slots[base]! > 0) {
    slots[base] = 0
  }
}
