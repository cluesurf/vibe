// Conformance for code/measure/bell: the CHSH machinery (P7). This module is a LOCAL
// hidden-variable simulator, so the theorem it must demonstrate is Bell's: with
// independent settings (settingCorrelation = 0) a local model obeys |S| <= 2, and it
// CANNOT reach the quantum Tsirelson value 2*sqrt2 ~ 2.828. Superdeterminism is the
// loophole: chshShared in aligned mode with eta = 1 drives S to the algebraic maximum.
//
// The CHSH value S = E(ab) - E(ab') + E(a'b) + E(a'b') is derived independently for the
// constant-outcome case (every product +1 -> S = 2) and for the fully aligned
// superdeterministic case (region analysis below -> S = 4).

import { suite, check, close, equal, ok } from '@/test/code/harness'
import { chsh, chshShared } from '@/code/measure/bell'
import { makeRng } from '@/code/tool/rng'

// The CHSH-optimal angle quartet (a, a', b, b').
const OPTIMAL = {
  a: 0,
  aPrime: Math.PI / 4,
  b: Math.PI / 8,
  bPrime: (3 * Math.PI) / 8,
}

suite('measure/bell: chsh (local hidden variable)', [
  check(
    'constant outcomes (+1,+1) give every correlator 1, so S = 2 exactly',
    () => {
      const out = chsh({
        drawHidden: ({ rng }) => rng.next() * 2 * Math.PI,
        settingCorrelation: 0,
        outcomeA: () => 1,
        outcomeB: () => 1,
        angles: OPTIMAL,
        trials: 4000,
        rng: makeRng({ seed: 1 }),
      })

      close(out.correlators.ab, 1, 1e-12)
      close(out.correlators.abPrime, 1, 1e-12)
      close(out.correlators.aPrimeB, 1, 1e-12)
      close(out.correlators.aPrimeBPrime, 1, 1e-12)
      equal(out.s, 2)
    },
  ),
  check(
    'the local model with independent settings obeys |S| <= 2 (Bell bound)',
    () => {
      const out = chsh({
        drawHidden: ({ rng }) => rng.next() * 2 * Math.PI,
        settingCorrelation: 0,
        angles: OPTIMAL,
        trials: 20000,
        rng: makeRng({ seed: 12345 }),
      })

      // A deterministic local model can saturate but never cross 2; allow only finite-
      // sample slack, and certainly stay far below the quantum 2.828.
      ok(
        Math.abs(out.s) <= 2.2,
        `local |S| = ${out.s} must stay at/under the classical bound`,
      )
      ok(
        Math.abs(out.s) < 2.5,
        `local |S| = ${out.s} must not reach the Tsirelson value`,
      )
    },
  ),
])

suite('measure/bell: chshShared (superdeterminism loophole)', [
  check(
    'aligned settings with eta = 1 reach S ~ 4 (algebraic maximum)',
    () => {
      // Region analysis over lambda in [0,pi): the four equal-measure intervals give
      // E(0,0)=+1, E(0,1)=-1, E(1,0)=+1, E(1,1)=+1, so S = 1-(-1)+1+1 = 4.
      const s = chshShared({
        eta: 1,
        mode: 'aligned',
        trials: 40000,
        seed: 7,
      })

      close(s, 4, 0.1)
    },
  ),
  check(
    'random (decorrelated) settings with eta = 1 stay within |S| <= 2',
    () => {
      const s = chshShared({
        eta: 1,
        mode: 'random',
        trials: 40000,
        seed: 7,
      })

      ok(
        Math.abs(s) <= 2.05,
        `decorrelated |S| = ${s} must respect the classical bound`,
      )
    },
  ),
  check(
    'aligned settings with eta = 0 (purely local) stay within |S| <= 2',
    () => {
      const s = chshShared({
        eta: 0,
        mode: 'aligned',
        trials: 40000,
        seed: 7,
      })

      ok(
        Math.abs(s) <= 2.05,
        `local |S| = ${s} must respect the classical bound`,
      )
    },
  ),
])
