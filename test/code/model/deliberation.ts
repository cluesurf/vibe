// Conformance for code/model/deliberation: the deterministic Hopfield-attractor model of choice. The
// exact, derivable facts: oneStepGuess is the sign of the urge; hammingFraction counts disagreements;
// blockCoarse is the sign of each contiguous block sum; aggregateUrge is the sign of the parts' column
// sums; a stored +-1 pattern is a fixed point of the relaxation (settle returns it in one beat) with
// self-coherence 1; and settling with 0 injected sites equals plain settling. All re-derived by hand.

import {
  suite,
  check,
  equal,
  close,
  ok,
  exactArray,
} from '@/test/code/harness'
import {
  ternaryVector,
  makeSelf,
  settle,
  settleWithInjection,
  oneStepGuess,
  hammingFraction,
  blockCoarse,
  coarseEqual,
  aggregateUrge,
  selfCoherence,
  consensusStep,
} from '@/code/model/deliberation'
import { makeRng } from '@/code/tool/rng'

suite('model/deliberation: elementary maps', [
  check('oneStepGuess is the sign of the urge', () => {
    exactArray(
      oneStepGuess(Int8Array.from([1, -1, 0, 1, -1])),
      [1, -1, 0, 1, -1],
    )
  }),
  check('hammingFraction is the fraction of differing sites', () => {
    close(
      hammingFraction(
        Int8Array.from([1, 1, 1]),
        Int8Array.from([1, -1, 1]),
      ),
      1 / 3,
      1e-12,
    )

    close(
      hammingFraction(Int8Array.from([1, 1]), Int8Array.from([1, 1])),
      0,
      1e-12,
    )
  }),
  check('blockCoarse is the sign of each block sum', () => {
    // 4 sites, 2 blocks of 2: [1,1] -> +1, [-1,-1] -> -1.
    exactArray(blockCoarse(Int8Array.from([1, 1, -1, -1]), 2), [1, -1])
    // a balanced block reads 0.
    exactArray(blockCoarse(Int8Array.from([1, -1, 0, 0]), 2), [0, 0])
  }),
  check('coarseEqual compares two coarse reads', () => {
    ok(
      coarseEqual(
        Int8Array.from([1, 0, -1]),
        Int8Array.from([1, 0, -1]),
      ),
    )
    ok(!coarseEqual(Int8Array.from([1, 0]), Int8Array.from([1, 1])))
  }),
  check('aggregateUrge is the sign of the parts column sums', () => {
    // columns: [1+1+(-1)=1] -> +1, [1+(-1)+(-1)=-1] -> -1.
    exactArray(
      aggregateUrge([
        Int8Array.from([1, 1]),
        Int8Array.from([1, -1]),
        Int8Array.from([-1, -1]),
      ]),
      [1, -1],
    )
  }),
])

suite('model/deliberation: attractor fixed points', [
  // A stored +-1 pattern under coupling, no urge: the field at site i is coupling * p[i] * 1, whose
  // sign is p[i], so the pattern maps to itself and settle returns it in one beat.
  check('a stored pattern is a fixed point of the relaxation', () => {
    const p = Int8Array.from([1, -1, 1, -1, 1, -1])
    const { state, beats } = settle({
      patterns: [p],
      coupling: 1,
      urge: new Int8Array(p.length),
      urgeWeight: 0,
      init: Int8Array.from(p),
    })

    exactArray(state, Array.from(p), 'the attractor is stable')
    equal(beats, 1, 'a fixed point settles in one beat')
  }),
  check('self-coherence of a stored pattern is 1', () => {
    const p = Int8Array.from([1, -1, 1, -1])

    close(selfCoherence(p, [p]), 1, 1e-12)
  }),
])

suite('model/deliberation: injection and consensus', [
  // injectSites 0 overrides nothing, so settleWithInjection reproduces settle exactly.
  check('settling with 0 injected sites equals plain settling', () => {
    const p = Int8Array.from([1, -1, 1, 1, -1, 1])
    const args = {
      patterns: [p],
      coupling: 1,
      urge: new Int8Array(p.length),
      urgeWeight: 0,
      init: Int8Array.from([1, 1, 1, 1, 1, 1]),
    }

    const base = settle(args)
    const injected = settleWithInjection({
      ...args,
      inject: new Int8Array(p.length),
      injectSites: 0,
    })

    exactArray(
      injected.state,
      Array.from(base.state),
      'no injection, same outcome',
    )
  }),
  // Strong coupling toward a unanimous aggregate keeps the agreeing subs in place.
  check('consensus keeps an already-agreeing group fixed', () => {
    const subs = [Int8Array.from([1, 1]), Int8Array.from([1, 1])]
    const out = consensusStep(subs, 1)

    exactArray(out[0]!, [1, 1])
    exactArray(out[1]!, [1, 1])
  }),
])

suite('model/deliberation: construction stays ternary', [
  check(
    'ternaryVector and makeSelf produce ternary patterns of the right shape',
    () => {
      const v = ternaryVector(50, makeRng({ seed: 1 }))

      equal(v.length, 50)

      for (const x of v) {
        ok(x === -1 || x === 0 || x === 1, 'value is ternary')
      }

      const self = makeSelf({ n: 12, patterns: 4, seed: 2 })

      equal(self.length, 4)

      for (const pattern of self) {
        equal(pattern.length, 12)
      }
    },
  ),
])
